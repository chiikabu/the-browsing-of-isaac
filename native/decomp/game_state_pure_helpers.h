#pragma once

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* GameState family (pure-helpers ABI v1 — family FOUNDATION).
   Mirror of the smallest family template (room-transition v18 residue).

   Band ownership: 0x009c7000..0x009ca000 (GameState methods, exact ZHL:
   0x9c8350 GameState::Delete, 0x9c8410 GameState::DeleteRerun,
   0x9c9340 GameState::write). Band census (2026-08-18, corrected
   E8-target tooling; see section-notes/game-state-v1/NOTES.md §1):
   15 bodies — only GameState::Delete carries a caller-bearing pure
   decision surface; everything else is HOST (SEH ctors/resets
   0x9c7080/0x9c7280/0x9c73c0/0x9c7800, the shared reset giant
   0x9c79a0 = both Delete arms' tail jmp sink, serializers
   0x9c84c0..0x9c8d20, GameState::write 0x9c9340), dead-unreferenced
   (0x9c7000/0x9c7320/0x9c7340/0x9c7750/0x9c7780), a 2-insn tail thunk
   (0x9c77f0 = add ecx,0x94 ; jmp 0x4149d0), or a mixed island
   (0x9c7350 arm-select gates + host default arm 0x72fd10).

   ABI v1 lands the complete pure decision surface of GameState::Delete
   0x009c8350 (exact ZHL `__thiscall void GameState::Delete();`, 24-byte
   pattern, identify-zhl-address verified): every capture-driven gate
   between the two arms and their host leaves. Body 0x9c8350..0x9c8409,
   0xba bytes, NO ret — both arms tail-jmp the shared 0x9c79a0 reset
   body; int3 pad 0x9c840a..0x9c840f; next sibling 0x9c8410 DeleteRerun.

   Steam arm (5 direct rel32 callers: 0x95915d 0x95a243 0x9cc254
   0x9ce68f 0x9d9df7): SteamInternal_ContextInit [IAT 0xb18a1c,
   arg 0xc5c3a4] result's FIRST DWORD tested FULL-dword (@0x9c836b,
   again @0x9c8394) ANDed with the Manager+0x2a3a4 cloud-enable byte
   (LOW-BYTE @0x9c8370; field shared with exit ISAAC_EXIT_ROOT_
   MGR_CLOUD_2A3A4_OFF and PGD ISAAC_PGD_TAIL_GAME_2A3A4_OFF) -> the
   Steam reset of the stat-name SSO string at GameState+0x1fdf4 (size
   +0x1fe08, FULL-dword unsigned cmp vs 0x10 @0x9c8379): vtbl+0x34 then,
   when its AL result is nonzero (LOW-BYTE @0x9c83ad), vtbl+0x18 — both
   HOST calls on the steam interface.

   Fallback arm (@0x9c83cd): local-save filename SSO at +0x1fdac (size
   +0x1fdc0); EMPTY filename (FULL-dword size == 0 @0x9c83cd — the SAME
   GameState+0x1fdbc field exit v46 exports as
   isaac_exit_958ed0_local_filename_present) -> HOST logger 0xa112c0
   (1, 0xb7f1ac); then CRT remove(filename) [IAT 0xb187cc] — HOST.

   Byte-gate discipline: every scalar param is uint32_t (NO uint8_t);
   the two LOW-BYTE gates mask & 0xff INSIDE the body; the four
   FULL-dword gates and the two SSO compares stay unmasked.

   ABI v2 (atomic bump) lands the complete pure decision surface of
   GameState::DeleteRerun 0x009c8410 (exact ZHL, 24-byte pattern): a
   NORMAL ret-body (0x9c8410..0x9c84ba, 0xab B) — the steam arm RETURNS
   directly @0x9c8483 (no 0x9c79a0 reset-giant tail, unlike Delete);
   5 direct rel32 callers.  Same arm skeleton as Delete with Rerun's own
   offsets: stat-name SSO at +0x1fe0c/+0x1fe20 (FULL-dword cmp @0x9c843f),
   fallback filename SSO at +0x1fdc4/+0x1fdd8, empty-filename gate on the
   SHARED +0x1fdbc field (@0x9c8484) -> Rerun's OWN warn string 0xb7f1e0,
   steam gates FULL-dword @0x9c842b (repeat @0x9c8451) + Manager+0x2a3a4
   cloud byte LOW-BYTE @0x9c8430, vtbl+0x34 result LOW-BYTE @0x9c846a.
   Byte-gate discipline identical to the v1 block (uint32_t params only;
   full-dword gates unmasked, low-byte gates & 0xff inside the body).

   ABI v2 also TYPED-HOST-LEASES GameState::write 0x009c9340 (exact ZHL
   23-byte `bool GameState::write(GameStateIO** gameStateIO)`) with full
   census + IRREDUCIBLE serializer-tree evidence (game-state-v2/NOTES.md
   §3): span 0x009c9340..0x009cad3a CROSSES the v1 band edge 0x009ca000;
   3 callers; 124 E8 (103x 0x683410 row-writer + the in-band serializers
   0x9c8d20 x4 / 0x9c87e0 / 0x9c85d0 + out-of-band leaves), 106 stream
   vtbl+0x1c, SEH + GS cookie prologue, terminal ret 4.  NO laws in this
   family for write — the surface is a monolithic field-save pass (all
   159 stores are stack-local).  Shared-VA host lease with exit
   ISAAC_EXIT_958ED0_WRITE_VA.

   ABI v3 (atomic bump) lands the serializer tree's lane-free DECISION
   gates (section-notes/game-state-v2-band/NOTES.md §5-§6; bodies stay
   typed-host — exit-v41/pgd-v26 peel style).  Full-span census: 6 bodies
   (0x9c84c0..0x9c8d20), 84 E8 in-tree — 78x 0x683410 row-writer +
   + 0x423090 + 0x414a80 + 0x9c87e0 + 0x9c88e0 x3 (self x1 @0x9c8d0a +
      0x9c8d20 x2)
   + 78 stream vtbl slots (0x14 x8, 0x1c x70); 18 laws R1..R18 peel the
   lane count/flush/bit gates, the 0x80000000 triple-layout sentinel
   (0x9c86e0/0x9c87e0 twins), the flags/presence/result gates of
   0x9c88e0, and 0x9c8d20's slot presence + 0x3800 table bound + signed
   div-by-0x78 element counts + zero-count skips + intrusive-list walk
   (empty + tail).  write 0x9c9340 lease and 0x9cad40 Exit cloud-write
   host lease UNCHANGED (IRREDUCIBLE evidence in the band notes).

   ABI v4 (atomic bump) lands the DECISION laws of the GameStateIO
   save-orchestrator hosts 0x9cad40 (host A — cloud write: DeleteRerun +
   0x683930 name checksum + write + vtbl+0x34 close) and 0x9caea0
   (host B — rerun: vtbl+0x24 + read_rerun 0x9d7d50 + success-byte
   [GameState+0x1fded]) while the write/DeleteRerun/read_rerun calls
   STAY typed-host (family-landed).  A/B body selection is EXIT-side
   (0x958fa1 steam+cloud gates -> host A; 0x95a0eb +0x26589 gate ->
   host B).  Laws S1..S6: S1 pool select (FULL-dword arm: [0xc7de78]
   ? +0x30 : 0xc7f618), S2 name-gate (LOW-BYTE checksum AL), S3
   open-gate (LOW-BYTE vtbl+0x30 AL; both hosts), S4 rerun-gate
   (LOW-BYTE vtbl+0x24 AL), S5 rerun-success (LOW-BYTE read_rerun AL ->
   byte [GameState+0x1fded] = 1 store law), S6 io-dtor presence
   (FULL-dword GameStateIO* at +0x1fe24 — GameState twin of exit v46
   isaac_exit_958ed0_io_dtor_needed, same-field sharing pattern as P7).
   GameState::read_rerun 0x9d7d50 = exact ZHL __thiscall bool
   GameState::read_rerun(GameStateIO** gameStateIO); IRREDUCIBLE typed-
   host lease (GS cookie 0xbf93b4 + version parse + checksum
   0x96696996 + DeleteRerun restore call; NO laws).  Write-span helper
   cluster re-census: 0x9d45c0 (0x321a-B giant serializer), 0x9d77e0,
   0x9cec80, 0x9d84d0 (0x79-B u32-array leaf — v2 "string writes"
   comment corrected), 0x9d84a0, 0x9d8550 — ALL typed-host (v2 LEAF_*
   leases hold); no pure-leaf bodies. */

enum { ISAAC_GAME_STATE_PURE_HELPERS_ABI_VERSION = 20 }; /* v20 LANDED: 0x9e3450 grid-adjacency door-direction checker (host-resolved door-table input; AI4 cell byte SINGLE deref corrected vs dump). v19 LANDED: 0x9e0650 forward-index BYTE getter (FORWARD js sign gate, BYTE-unit span NO shift, movzx zero-extending load, dual ret 4). v18: 0x9e0180 complement-index ELEMENT fetch (SINGLE-deref twin of O). v17: 0x9e0150 complement-index vector fetch (~v FULL-dword NOT, SIGNED gates, double-deref mem law). v16: 0x9dc6e0 zero-init ctor (mem-law: 13 zero dwords + magic 0x12345678 @+8, returns this). v15: 0x9d8ca0 Manager+0x2d0 flag scan (AL 0/1). */

/* --- ABI v1: GameState::Delete 0x009c8350 (exact ZHL) --- */

static constexpr uint32_t ISAAC_GAME_STATE_9C8350_VA = 0x009c8350u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_END_VA = 0x009c840au; /* first non-body byte (past the tail jmp @0x9c8405; int3 pad starts @0x9c840a) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_BODY_BYTES = 0xbau;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_NEXT_VA = 0x009c8410u; /* GameState::DeleteRerun */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_TAIL_VA = 0x009c79a0u; /* shared GameState reset body (both arms jmp here) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STEAM_IAT = 0x00b18a1cu;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STEAM_ARG = 0x00c5c3a4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_REMOVE_IAT = 0x00b187ccu; /* CRT remove(filename) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_LOGGER_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_LOG_STR_VA = 0x00b7f1acu; /* "[warn] no filename" arm string */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_MGR_GLOBAL_DAT = 0x00c7169cu; /* g_Manager */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CLOUD_OFF = 0x2a3a4u; /* Manager+0x2a3a4 cloud-enable byte (exit/PGD shared) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_FILENAME_SIZE_OFF = 0x1fdbc; /* local-save filename size (exit v46 shared) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_FILENAME_BUF_OFF = 0x1fdacu;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STATNAME_SIZE_OFF = 0x1fe08u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STATNAME_BUF_OFF = 0x1fdf4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_SSO_THRESHOLD = 0x10u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_VTBL34_SLOT = 0x34u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_VTBL18_SLOT = 0x18u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STEAM_ARMSHA_TWO = 0x1u; /* steam re-probe sites count */

/* 5 direct rel32 callers (census-callers-fixed.py, corrected). */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CALLER_COUNT = 5u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CALLER_VA_0 = 0x0095915du;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CALLER_VA_1 = 0x0095a243u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CALLER_VA_2 = 0x009cc254u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CALLER_VA_3 = 0x009ce68fu;
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CALLER_VA_4 = 0x009d9df7u;

/* Gate PE addresses (pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STEAM_GATE_VA = 0x009c836bu; /* cmp dword [eax],0 ; je fallback (repeat @0x9c8394) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_CLOUD_GATE_VA = 0x009c8370u; /* cmp byte [edi+0x2a3a4],0 ; je fallback */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_STATNAME_SIZE_CMP_VA = 0x009c8379u; /* cmp dword [esi+0x1fe08],0x10 ; jb inline */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_VTBL34_RESULT_GATE_VA = 0x009c83adu; /* test al,al ; je tail */
static constexpr uint32_t ISAAC_GAME_STATE_9C8350_FILENAME_EMPTY_GATE_VA = 0x009c83cdu; /* cmp dword [esi+0x1fdbc],0 ; jne skip-log */

/* ---------------------------------------------------------------------------
 * P1 — steam context presence (PE 0x009c836b / 0x009c8394):
 *   cmp dword ptr [eax],0 ; je fallback.  FULL-dword test of the raw first
 *   dword of the SteamInternal_ContextInit result (same gate shape as the
 *   exit family's pgd_save_uses_cloud steam_ctx_word).  0x100 IS present.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8350_steam_present(uint32_t steam_ctx_word);

/* ---------------------------------------------------------------------------
 * P2 — manager cloud-enable byte gate (PE 0x009c8370):
 *   cmp byte ptr [edi+0x2a3a4],0 ; je fallback.  LOW-BYTE (the PE reads a
 *   byte).  Field shared with exit ISAAC_EXIT_ROOT_MGR_CLOUD_2A3A4_OFF and
 *   PGD ISAAC_PGD_TAIL_GAME_2A3A4_OFF.  Param is the recaptured byte as
 *   u32; the body masks & 0xff (0x100 -> byte 0 -> gate closed).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8350_cloud_gate_ok(uint32_t mgr_byte_2a3a4);

/* ---------------------------------------------------------------------------
 * P3 — steam-arm combine (PE je CF across 0x009c836e/0x009c8377): the steam
 *   arm runs iff BOTH gates pass, else the fallback filename/remove arm.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8350_use_steam_arm(uint32_t steam_present,
                                              uint32_t cloud_gate_ok);

/* ---------------------------------------------------------------------------
 * P4 — stat-name SSO heap select (PE 0x009c8379):
 *   cmp dword ptr [esi+0x1fe08],0x10 ; jb inline-pointer.  FULL-dword
 *   UNSIGNED compare; size >= 0x10 loads the heap pointer at the buffer
 *   slot, size < 0x10 keeps the inline buffer address.  0x100 -> heap
 *   (a byte-narrowed read would flip to inline).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8350_statname_heap_used(uint32_t size_1fe08);

/* ---------------------------------------------------------------------------
 * P5 — stat-name string pointer (mem-law, room-transition 428a70 shape):
 *   size_1fe08 < 0x10 -> this_off + 0x1fdf4 (u32 wrap);
 *   else -> u32 LE at mem + this_off + 0x1fdf4 (offset add wraps u32).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c8350_statname_ptr(const uint8_t* mem,
                                              uint32_t this_off,
                                              uint32_t size_1fe08);

/* ---------------------------------------------------------------------------
 * P6 — steam vtbl+0x34 result gate (PE 0x009c83ad):
 *   test al,al ; je tail.  LOW-BYTE (AL from the host call).  Nonzero AL
 *   (masked & 0xff) continues to the vtbl+0x18 call, else common tail.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8350_steam_arm_continue(uint32_t vtbl34_al);

/* ---------------------------------------------------------------------------
 * P7 — filename EMPTY gate (PE 0x009c83cd):
 *   cmp dword ptr [esi+0x1fdbc],0 ; jne skip-log.  FULL-dword: nonzero
 *   filename skips the no-filename logger; zero -> HOST log 0xa112c0
 *   (1, 0xb7f1ac).  SAME GameState+0x1fdbc size field exit v46 exports
 *   as isaac_exit_958ed0_local_filename_present (law is GameState-owned;
 *   field shared).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8350_filename_present(uint32_t size_1fdbc);

/* ---------------------------------------------------------------------------
 * P8 — filename string pointer (mem-law): size_1fdc0 < 0x10 ->
 *   this_off + 0x1fdac (u32 wrap); else u32 LE at mem + this_off + 0x1fdac.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c8350_filename_ptr(const uint8_t* mem,
                                              uint32_t this_off,
                                              uint32_t size_1fdc0);

/* --- accessors (constants pinned through the wasm ABI) --- */
uint32_t isaac_game_state_9c8350_va(void);
uint32_t isaac_game_state_9c8350_end_va(void);
uint32_t isaac_game_state_9c8350_body_bytes(void);
uint32_t isaac_game_state_9c8350_next_va(void);
uint32_t isaac_game_state_9c8350_tail_va(void);
uint32_t isaac_game_state_9c8350_steam_iat(void);
uint32_t isaac_game_state_9c8350_steam_arg(void);
uint32_t isaac_game_state_9c8350_remove_iat(void);
uint32_t isaac_game_state_9c8350_logger_va(void);
uint32_t isaac_game_state_9c8350_log_str_va(void);
uint32_t isaac_game_state_9c8350_mgr_global_dat(void);
uint32_t isaac_game_state_9c8350_cloud_off(void);
uint32_t isaac_game_state_9c8350_filename_size_off(void);
uint32_t isaac_game_state_9c8350_filename_buf_off(void);
uint32_t isaac_game_state_9c8350_statname_size_off(void);
uint32_t isaac_game_state_9c8350_statname_buf_off(void);
uint32_t isaac_game_state_9c8350_sso_threshold(void);
uint32_t isaac_game_state_9c8350_vtbl34_slot(void);
uint32_t isaac_game_state_9c8350_vtbl18_slot(void);
uint32_t isaac_game_state_9c8350_caller_count(void);
uint32_t isaac_game_state_9c8350_caller_va_at(uint32_t index);

/* --- ABI v2: GameState::DeleteRerun 0x009c8410 (exact ZHL) + GameState::write 0x009c9340 typed-host lease --- */

static constexpr uint32_t ISAAC_GAME_STATE_9C8410_VA = 0x009c8410u; /* GameState::DeleteRerun (24-byte exact ZHL) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_END_VA = 0x009c84bbu; /* first non-body byte (terminal ret @0x9c84ba; int3 pad @0x9c84bb) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_BODY_BYTES = 0xabu;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_NEXT_VA = 0x009c84c0u; /* HOST serializer row (v1-classified) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STEAM_RET_VA = 0x009c8483u; /* steam arm RET — DeleteRerun does NOT tail-jmp the 0x9c79a0 reset giant (unlike Delete) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_TAIL_RET_VA = 0x009c84bau; /* common tail ret (both arms) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STEAM_IAT = 0x00b18a1cu; /* SteamInternal_ContextInit */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STEAM_ARG = 0x00c5c3a4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_REMOVE_IAT = 0x00b187ccu; /* CRT remove(filename) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_LOGGER_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_LOG_STR_VA = 0x00b7f1e0u; /* "[warn] GameState::DeleteRerun: no filename specified.\n" (Rerun's OWN string; Delete uses 0xb7f1ac) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_MGR_GLOBAL_DAT = 0x00c7169cu; /* g_Manager */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CLOUD_OFF = 0x2a3a4u; /* Manager+0x2a3a4 cloud-enable byte (shared: Delete / exit / PGD) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_FILENAME_EMPTY_SIZE_OFF = 0x1fdbc; /* empty-filename gate size (SHARED field: Delete / exit v46 isaac_exit_958ed0_local_filename_present) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_FILENAME_SIZE_OFF = 0x1fdd8u; /* fallback filename SSO size */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_FILENAME_BUF_OFF = 0x1fdc4u; /* fallback filename SSO buffer */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STATNAME_SIZE_OFF = 0x1fe20u; /* stat-name SSO size */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STATNAME_BUF_OFF = 0x1fe0cu; /* stat-name SSO buffer */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_SSO_THRESHOLD = 0x10u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_VTBL34_SLOT = 0x34u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_VTBL18_SLOT = 0x18u;

/* 5 direct rel32 callers (census-callers-fixed.py, corrected). */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CALLER_COUNT = 5u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CALLER_VA_0 = 0x00958fcau;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CALLER_VA_1 = 0x0095a414u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CALLER_VA_2 = 0x009cad4du; /* GameStateIO save orchestrator region 0x9cad40.. */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CALLER_VA_3 = 0x009caf8fu;
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CALLER_VA_4 = 0x009d7dc6u;

/* Gate PE addresses (pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STEAM_GATE_VA = 0x009c842bu; /* cmp dword [eax],0 ; je fallback (repeat @0x9c8451) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_CLOUD_GATE_VA = 0x009c8430u; /* cmp byte [ebx+0x2a3a4],0 ; je fallback */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_STATNAME_SIZE_CMP_VA = 0x009c843fu; /* cmp dword [esi+0x14],0x10 ; jb inline (esi=this+0x1fe0c) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_VTBL34_RESULT_GATE_VA = 0x009c846au; /* test al,al ; je tail */
static constexpr uint32_t ISAAC_GAME_STATE_9C8410_FILENAME_EMPTY_GATE_VA = 0x009c8484u; /* cmp dword [esi+0x1fdbc],0 ; jne skip-log */

/* ---------------------------------------------------------------------------
 * Q1 — steam context presence (PE 0x009c842b / repeat 0x009c8451):
 *   cmp dword ptr [eax],0 ; je fallback.  FULL-dword test (same shape as
 *   Delete's P1).  0x100 IS present.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8410_steam_present(uint32_t steam_ctx_word);

/* ---------------------------------------------------------------------------
 * Q2 — manager cloud-enable byte gate (PE 0x009c8430):
 *   cmp byte ptr [ebx+0x2a3a4],0 ; je fallback.  LOW-BYTE; mask & 0xff in
 *   the body.  Same Manager+0x2a3a4 field as Delete's P2 / exit / PGD.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8410_cloud_gate_ok(uint32_t mgr_byte_2a3a4);

/* ---------------------------------------------------------------------------
 * Q3 — steam-arm combine (je CF across 0x009c842e/0x009c8437): AND of the
 *   steam presence and cloud gates; both nonzero -> steam arm, else fallback.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8410_use_steam_arm(uint32_t steam_present,
                                              uint32_t cloud_gate_ok);

/* ---------------------------------------------------------------------------
 * Q4 — stat-name SSO heap select (PE 0x009c843f):
 *   cmp dword ptr [esi+0x14],0x10 ; jb inline-pointer (esi = this+0x1fe0c,
 *   so the size field is GameState+0x1fe20).  FULL-dword UNSIGNED compare;
 *   size >= 0x10 loads the heap pointer at +0x1fe0c.  0x100 -> heap.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8410_statname_heap_used(uint32_t size_1fe20);

/* ---------------------------------------------------------------------------
 * Q5 — stat-name string pointer (mem-law, Delete P5 shape): size_1fe20 <
 *   0x10 -> this_off + 0x1fe0c (u32 wrap); else u32 LE at mem + this_off +
 *   0x1fe0c (offset add wraps u32).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c8410_statname_ptr(const uint8_t* mem,
                                              uint32_t this_off,
                                              uint32_t size_1fe20);

/* ---------------------------------------------------------------------------
 * Q6 — steam vtbl+0x34 result gate (PE 0x009c846a):
 *   test al,al ; je tail.  LOW-BYTE (AL from the host call); non-zero AL
 *   (masked & 0xff) continues to the vtbl+0x18 call, else common tail.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8410_steam_arm_continue(uint32_t vtbl34_al);

/* ---------------------------------------------------------------------------
 * Q7 — filename EMPTY gate (PE 0x009c8484):
 *   cmp dword ptr [esi+0x1fdbc],0 ; jne skip-log.  FULL-dword: nonzero
 *   filename skips the no-filename logger; zero -> HOST log 0xa112c0
 *   (1, 0xb7f1e0).  SAME GameState+0x1fdbc size field as Delete P7 and
 *   exit v46 isaac_exit_958ed0_local_filename_present.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8410_filename_present(uint32_t size_1fdbc);

/* ---------------------------------------------------------------------------
 * Q8 — fallback filename string pointer (mem-law): size_1fdd8 < 0x10 ->
 *   this_off + 0x1fdc4 (u32 wrap); else u32 LE at mem + this_off + 0x1fdc4.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c8410_filename_ptr(const uint8_t* mem,
                                              uint32_t this_off,
                                              uint32_t size_1fdd8);

/* --- ABI v2 accessors: DeleteRerun 0x009c8410 --- */
uint32_t isaac_game_state_9c8410_va(void);
uint32_t isaac_game_state_9c8410_end_va(void);
uint32_t isaac_game_state_9c8410_body_bytes(void);
uint32_t isaac_game_state_9c8410_next_va(void);
uint32_t isaac_game_state_9c8410_steam_ret_va(void);
uint32_t isaac_game_state_9c8410_tail_ret_va(void);
uint32_t isaac_game_state_9c8410_steam_iat(void);
uint32_t isaac_game_state_9c8410_steam_arg(void);
uint32_t isaac_game_state_9c8410_remove_iat(void);
uint32_t isaac_game_state_9c8410_logger_va(void);
uint32_t isaac_game_state_9c8410_log_str_va(void);
uint32_t isaac_game_state_9c8410_mgr_global_dat(void);
uint32_t isaac_game_state_9c8410_cloud_off(void);
uint32_t isaac_game_state_9c8410_filename_empty_size_off(void);
uint32_t isaac_game_state_9c8410_filename_size_off(void);
uint32_t isaac_game_state_9c8410_filename_buf_off(void);
uint32_t isaac_game_state_9c8410_statname_size_off(void);
uint32_t isaac_game_state_9c8410_statname_buf_off(void);
uint32_t isaac_game_state_9c8410_sso_threshold(void);
uint32_t isaac_game_state_9c8410_vtbl34_slot(void);
uint32_t isaac_game_state_9c8410_vtbl18_slot(void);
uint32_t isaac_game_state_9c8410_caller_count(void);
uint32_t isaac_game_state_9c8410_caller_va_at(uint32_t index);

/* --- ABI v2 typed-host lease: GameState::write 0x009c9340 (exact ZHL,
 *     23-byte `__thiscall bool GameState::write(GameStateIO** gameStateIO)`)
 *     — IRREDUCIBLE save serializer (call recipe + SEH/GS stay host;
 *     census + serializer-tree evidence in game-state-v2/NOTES.md §3;
 *     the LANE-FREE loop/decision gates of its internal passes are
 *     peeled separately as ABI v5 laws W1..W22 — game-state-v4-cloud/
 *     NOTES.md §2).  Body span 0x009c9340..0x009cad3a (0x19fb B) CROSSES
 *     the v1 band edge 0x009ca000; terminal `ret 4` @0x009cad38; 3
 *     direct rel32 callers.  Shared-VA host lease with exit
 *     ISAAC_EXIT_958ED0_WRITE_VA (comment-only there). --- */

static constexpr uint32_t ISAAC_GAME_STATE_9C9340_VA = 0x009c9340u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_END_VA = 0x009cad3bu; /* first non-body byte (ret 4 @0x9cad38; int3 pad @0x9cad3b) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_BODY_BYTES = 0x19fbu;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_NEXT_VA = 0x009cad40u; /* GameStateIO save orchestrator region (exit pins 0x9cad40 as cloud-write host) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_STREAM_VTBL_SLOT = 0x1cu; /* GameStateIO stream write slot (106 call sites) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_ROW_WRITER_VA = 0x00683410u; /* field row-writer (103 call sites) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_STREAM_INIT_VA = 0x00420a80u; /* stream-object init (@0x9387) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_GSR_FORMAT_STR_VA = 0x00b7f218u; /* "ISAACNG_GSR%04u" (gamestate record header) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_SEEDED_LOG_STR_VA = 0x00b1c640u; /* "Error: Game Start Seed was not set.\n" (logger @0x9ca48c) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LOGGER_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_SE_HANDLER_DAT = 0x00b0f2d0u; /* SEH handler data slot (prologue push) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_GS_COOKIE_DAT = 0x00bf93b4u; /* GS cookie global (xor ebp) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_COOKIE_TAIL_VA = 0x00aef12bu; /* __security_check_cookie tail call @0x9cad30 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_INVALID_PARAM_IAT = 0x00b18894u; /* CRT _invalid_parameter_noinfo_noreturn (range-check site @0x9ca50e) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_FREE_VA = 0x00aef15cu; /* sized free @0x9ca516 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_GAME_STATE_IO_OFF = 0x1fe24u; /* GameStateIO* field (shared with exit v46) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_SERIALIZER_8D20_VA = 0x009c8d20u; /* in-band big serializer (4 sites: 0x9c9d3b/0x9c9d87/0x9cab5d/0x9cabdd) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_SERIALIZER_87E0_VA = 0x009c87e0u; /* in-band serializer row (1 site: 0x9c9cd2) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_SERIALIZER_85D0_VA = 0x009c85d0u; /* in-band serializer row (1 site: 0x9ca78a) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_9D77E0_VA = 0x009d77e0u; /* sub-object serializer (this+0x8c) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_9D45C0_VA = 0x009d45c0u; /* sub-serializer (2 sites) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_9CEC80_VA = 0x009cec80u; /* sub-object serializer (this+0x1e3cc) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_9D84D0_VA = 0x009d84d0u; /* u32-array count serializer (0x79-B leaf; 2 sites in write @0x9cac6f/@0x9cacad — the v2 "save-tail blob / string writes" note was a first-ret-window misattribution; corrected in the v4 block) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_9EB5B0_VA = 0x009eb5b0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_4288A0_VA = 0x004288a0u; /* ctor-ish on this+0x1e778 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_708AE0_VA = 0x00708ae0u; /* helper on this+0x1e790 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LEAF_AF05E5_VA = 0x00af05e5u;

/* 3 direct rel32 callers (census-callers-fixed.py, corrected). */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CALLER_COUNT = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CALLER_VA_0 = 0x00917577u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CALLER_VA_1 = 0x00959076u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CALLER_VA_2 = 0x009cae15u; /* GameStateIO save orchestrator region 0x9cad40.. */

/* --- ABI v2 accessors: write 0x009c9340 typed-host lease --- */
uint32_t isaac_game_state_9c9340_va(void);
uint32_t isaac_game_state_9c9340_end_va(void);
uint32_t isaac_game_state_9c9340_body_bytes(void);
uint32_t isaac_game_state_9c9340_next_va(void);
uint32_t isaac_game_state_9c9340_stream_vtbl_slot(void);
uint32_t isaac_game_state_9c9340_row_writer_va(void);
uint32_t isaac_game_state_9c9340_stream_init_va(void);
uint32_t isaac_game_state_9c9340_gsr_format_str_va(void);
uint32_t isaac_game_state_9c9340_seeded_log_str_va(void);
uint32_t isaac_game_state_9c9340_logger_va(void);
uint32_t isaac_game_state_9c9340_se_handler_dat(void);
uint32_t isaac_game_state_9c9340_gs_cookie_dat(void);
uint32_t isaac_game_state_9c9340_cookie_tail_va(void);
uint32_t isaac_game_state_9c9340_invalid_param_iat(void);
uint32_t isaac_game_state_9c9340_free_va(void);
uint32_t isaac_game_state_9c9340_game_state_io_off(void);
uint32_t isaac_game_state_9c9340_serializer_8d20_va(void);
uint32_t isaac_game_state_9c9340_serializer_87e0_va(void);
uint32_t isaac_game_state_9c9340_serializer_85d0_va(void);
uint32_t isaac_game_state_9c9340_leaf_9d77e0_va(void);
uint32_t isaac_game_state_9c9340_leaf_9d45c0_va(void);
uint32_t isaac_game_state_9c9340_leaf_9cec80_va(void);
uint32_t isaac_game_state_9c9340_leaf_9d84d0_va(void);
uint32_t isaac_game_state_9c9340_leaf_9eb5b0_va(void);
uint32_t isaac_game_state_9c9340_leaf_4288a0_va(void);
uint32_t isaac_game_state_9c9340_leaf_708ae0_va(void);
uint32_t isaac_game_state_9c9340_leaf_af05e5_va(void);
uint32_t isaac_game_state_9c9340_caller_count(void);
uint32_t isaac_game_state_9c9340_caller_va_at(uint32_t index);

/* --- ABI v3: serializer tree 0x9c84c0..0x9c8d20 leaf laws (PURE-OPEN) ---

   Full-span census (section-notes/game-state-v2-band/NOTES.md §2-§4): the
   six write-helper rows are typed-host bodies — per-field (stream vtbl
   slot + 0x683410 row-writer) pairs, 0x423090 bitmap growth, freestanding
   list-next 0x414a80 (exit-law'd), self-recursion — whose lane-free
   DECISION gates are peeled here (exit-v41 / pgd-v26 peel style: bodies
   stay host).  Byte-gate discipline identical to v1/v2: every scalar
   param is uint32_t (NO uint8_t); word/byte gates mask INSIDE the body
   (& 0xffff / & 0xff); full-dword gates unmasked. */

/* --- 0x9c84c0 — bitmap drain row (3 callers) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_VA = 0x009c84c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_END_VA = 0x009c85d0u; /* first non-body byte (ret @0x9c85cf; next body starts 0x9c85d0, no pad) */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_BODY_BYTES = 0x110u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_NEXT_VA = 0x009c85d0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_ROW_WRITER_VA = 0x00683410u; /* 2 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_BITMAP_GROW_VA = 0x00423090u; /* bitmap capacity helper */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_STREAM_VTBL_SLOT = 0x14u; /* 2 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_LANE_BITS = 8u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_CALLER_COUNT = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_CALLER_VA_0 = 0x009cdefeu;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_CALLER_VA_1 = 0x009d3036u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_CALLER_VA_2 = 0x009d3048u;
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_LANE_COUNT_GATE_VA = 0x009c850eu; /* cmp eax,ecx ; cmovb eax,ecx — unsigned max */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_CLEAR_GATE_VA = 0x009c851eu; /* cmp [ebx+0xc],0 ; jbe — clear loop iff count nonzero */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_FLUSH_GATE_VA = 0x009c8550u; /* test bx,bx ; jne — lane byte read on lane 0 only */
static constexpr uint32_t ISAAC_GAME_STATE_9C84C0_BIT_SELECT_GATE_VA = 0x009c85adu; /* test byte,dl ; je btr / bts — dest bit = src lane bit */

/* --- 0x9c85d0 — packed-bitfield lane builder (1 caller: 0x9ca78a IN write) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_VA = 0x009c85d0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_END_VA = 0x009c86d3u; /* int3 pad @0x9c86d3 */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_BODY_BYTES = 0x103u;
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_NEXT_VA = 0x009c86e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_ROW_WRITER_VA = 0x00683410u; /* 3 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_STREAM_VTBL_SLOT = 0x1cu; /* 3 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_LANE_BITS = 8u;
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_CALLER_VA_0 = 0x009ca78au; /* GameState::write loop */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_FLUSH8_GATE_VA = 0x009c8661u; /* cmp di,8 ; jne — flush lane byte after 8 lanes */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_REMAINDER_GATE_VA = 0x009c86a0u; /* test di,di ; je — final partial flush iff nonzero */
static constexpr uint32_t ISAAC_GAME_STATE_9C85D0_BIT_TEST_GATE_VA = 0x009c864au; /* test [ecx+esi*4],edx ; je — source bitmap bit -> lane byte bit */

/* --- 0x9c86e0 / 0x9c87e0 — twin triple-layout rows (vtbl+0x14 vs +0x1c) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_VA = 0x009c86e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_END_VA = 0x009c87d3u; /* arm A ret 4 @0x9c878c; arm B ret 4 @0x9c87d0; int3 @0x9c87d3 */
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_BODY_BYTES = 0xf3u;
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_NEXT_VA = 0x009c87e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_STREAM_VTBL_SLOT = 0x14u; /* 6 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_ROW_WRITER_VA = 0x00683410u; /* 6 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_CALLER_VA_0 = 0x009cb66cu; /* reader/rerun region (AFTER write span) */
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_CALLER_VA_1 = 0x009cce11u;
static constexpr uint32_t ISAAC_GAME_STATE_9C86E0_SENTINEL_GATE_VA = 0x009c870bu; /* cmp [esi],0x80000000 ; jne arm B */

static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_VA = 0x009c87e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_END_VA = 0x009c88d3u; /* arm A ret 4 @0x9c888c; arm B ret 4 @0x9c88d0; int3 @0x9c88d3 */
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_BODY_BYTES = 0xf3u;
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_NEXT_VA = 0x009c88e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_STREAM_VTBL_SLOT = 0x1cu; /* 6 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_ROW_WRITER_VA = 0x00683410u; /* 6 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_CALLER_VA_0 = 0x009c8d30u; /* IN 0x9c8d20 */
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_CALLER_VA_1 = 0x009c9cd2u; /* IN write */
static constexpr uint32_t ISAAC_GAME_STATE_9C87E0_SENTINEL_GATE_VA = 0x009c880bu; /* cmp [esi],0x80000000 ; jne arm B */

static constexpr uint32_t ISAAC_GAME_STATE_TRIPLE_SENTINEL = 0x80000000u; /* arm A layout value (u32@+4 + u16@+8 + u16@+0xa; arm B = u32@+4 + u32@+8) */

/* --- 0x9c88e0 — flat field serializer (self-recursion; 4 callers) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_VA = 0x009c88e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_END_VA = 0x009c8d18u; /* ret @0x9c8d17; int3 @0x9c8d18 */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_BODY_BYTES = 0x438u;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_NEXT_VA = 0x009c8d20u;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_ROW_WRITER_VA = 0x00683410u; /* 27 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_STREAM_VTBL_SLOT = 0x1cu; /* 27 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_CALLER_COUNT = 4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_CALLER_VA_0 = 0x009c8d0au; /* self-recursion (child @+0x6c) */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_CALLER_VA_1 = 0x009c9148u; /* IN 0x9c8d20 */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_CALLER_VA_2 = 0x009c923au;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_CALLER_VA_3 = 0x009d555eu;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_FLAGS_BIT0_GATE_VA = 0x009c8ca3u; /* cmp [edi+0x64],0 ; je — bit0 */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_FLAGS_BIT1_GATE_VA = 0x009c8cb0u; /* cmp [edi+0x6c],0 ; je / or al,2 — bit1 */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_BLOB_GATE_VA = 0x009c8ce6u; /* test esi,esi ; je — 0x20-byte blob dump */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_CHILD_GATE_VA = 0x009c8d04u; /* test ecx,ecx ; je — child recursion */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_RET_TRUE_VA = 0x009c8d11u; /* mov al,1 — constant success result */
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_FLAG_BIT0 = 0x1u;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_FLAG_BIT1 = 0x2u;
static constexpr uint32_t ISAAC_GAME_STATE_9C88E0_BLOB_SIZE = 0x20u; /* 0x20-byte raw dump */

/* --- 0x9c8d20 — table + array mega-serializer (4 callers, ALL IN write) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_VA = 0x009c8d20u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_END_VA = 0x009c9333u; /* ret 0xc @0x9c9330; int3 @0x9c9333 */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_BODY_BYTES = 0x613u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_NEXT_VA = 0x009c9340u; /* GameState::write (exact ZHL, lease) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_ROW_WRITER_VA = 0x00683410u; /* 34 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_STREAM_VTBL_SLOT = 0x1cu; /* 34 sites */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_LIST_NEXT_VA = 0x00414a80u; /* freestanding intrusive-list next (exit-law'd tree++) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_CALLER_COUNT = 4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_CALLER_VA_0 = 0x009c9d3bu; /* IN write */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_CALLER_VA_1 = 0x009c9d87u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_CALLER_VA_2 = 0x009cab5du;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_CALLER_VA_3 = 0x009cabddu;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_SLOT_GATE_VA = 0x009c8ff8u; /* test edi,edi ; je — slot body iff u16 nonzero */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_TABLE_BOUND_GATE_VA = 0x009c90e5u; /* cmp ecx,0x3800 ; jb — 448-slot loop */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_TABLE_BYTES = 0x3800u; /* table buffer bytes = 448 slots x 0x20 */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_TABLE_SLOT_STRIDE = 0x20u;
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_ELEMENT_STRIDE = 0x78u; /* per-element stride (both arrays) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_ELEMENT_COUNT_VA = 0x009c90f1u; /* magic 0x88888889 div-by-0x78 (signed floor); twin @0x9c91d7 */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_COUNT_ZERO_GATE_VA = 0x009c9132u; /* cmp [ebp-8],0 ; jbe — skip element loop */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_COUNT_ZERO_GATE_VA_2 = 0x009c921bu; /* second element loop */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_WALK_EMPTY_GATE_VA = 0x009c9195u; /* cmp eax,ecx ; je — *head==head empty */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_WALK_TAIL_GATE_VA = 0x009c91d5u; /* cmp eax,[edi+0x80] ; jne — node!=head continue */

/* ---------------------------------------------------------------------------
 * R1 — 0x9c84c0 lane count (PE 0x009c850e): cmp eax,ecx ; cmovb eax,ecx —
 *   UNSIGNED max of the caller cap and the stream-read u16 count (host-fed
 *   read_count; lane-free merge decision).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c84c0_lane_count(uint32_t cap,
                                           uint32_t read_count);

/* ---------------------------------------------------------------------------
 * R2 — 0x9c84c0 target-bitmap clear gate (PE 0x009c851e):
 *   cmp [ebx+0xc],0 ; jbe skip.  FULL-dword: clear loop fires iff the
 *   target bitmap count is nonzero.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c84c0_clear_needed(uint32_t count);

/* ---------------------------------------------------------------------------
 * R3 — 0x9c84c0 lane-byte flush trigger (PE 0x009c8550): test bx,bx ;
 *   jne skip — the lane byte is consumed on lane 0 of each 8-lane group
 *   (lane wraps mod 8).  PURE: (lane & 0x7) == 0.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c84c0_lane_flush(uint32_t lane);

/* ---------------------------------------------------------------------------
 * R4 — 0x9c84c0 lane bit select (PE 0x009c85ad): test byte,dl ; je btr /
 *   else bts — the target bit (lane & 7) of the destination bitmap takes
 *   the source lane byte's bit (lane & 7).  PURE bit extract.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c84c0_lane_bit_set(uint32_t byte_val,
                                             uint32_t lane);

/* ---------------------------------------------------------------------------
 * R5 — 0x9c85d0 8-lane flush (PE 0x009c8661): cmp di,8 ; jne — the lane
 *   byte is flushed (vtbl read + row-writer, both HOST) exactly when the
 *   running 0..7 counter reaches 8 (counter resets after flush).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c85d0_flush_every8(uint32_t idx);

/* ---------------------------------------------------------------------------
 * R6 — 0x9c85d0 remainder flush (PE 0x009c86a0): test di,di ; je — after
 *   the main loop a partial group (idx != 0) still flushes once.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c85d0_flush_remainder(uint32_t idx);

/* ---------------------------------------------------------------------------
 * R7 — 0x9c85d0 source bit (PE 0x009c864a): test [ecx+esi*4],edx ; je /
 *   bts — lane byte bit = source bitmap bit idx (edx = 1 << (idx & 0x1f),
 *   word = idx >> 5).  PURE bit extract on the u32 bitmap word.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c85d0_source_bit(uint32_t word, uint32_t idx);

/* ---------------------------------------------------------------------------
 * R8 — 0x9c86e0 sentinel layout (PE 0x009c870b):
 *   cmp [esi],0x80000000 ; jne arm B.  FULL-dword: arm A (u32@+4 +
 *   u16@+8 + u16@+0xa) iff the first dword == 0x80000000, else arm B
 *   (u32@+4 + u32@+8).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c86e0_sentinel_layout(uint32_t first_dword);

/* ---------------------------------------------------------------------------
 * R9 — 0x9c87e0 sentinel layout (PE 0x009c880b): the vtbl+0x1c twin of
 *   R8 — byte-identical body, own stream slot.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c87e0_sentinel_layout(uint32_t first_dword);

/* ---------------------------------------------------------------------------
 * R10 — 0x9c88e0 flags byte (PE 0x009c8ca3 + 0x009c8cb0):
 *   cmp [edi+0x64],0 -> bit0 ; cmp [edi+0x6c],0 ; or al,2 -> bit1.
 *   WORD/byte output law: ((p64 != 0) ? 1 : 0) | ((p6c != 0) ? 2 : 0).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c88e0_flags(uint32_t p64, uint32_t p6c);

/* ---------------------------------------------------------------------------
 * R11 — 0x9c88e0 blob-dump gate (PE 0x009c8ce6): test esi,esi ; je — the
 *   0x20-byte raw blob at [obj+0x64] is serialized iff nonzero.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c88e0_blob_present(uint32_t ptr_64);

/* ---------------------------------------------------------------------------
 * R12 — 0x9c88e0 child-recursion gate (PE 0x009c8d04): test ecx,ecx ; je —
 *   the child object at [obj+0x6c] is serialized recursively iff nonzero.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c88e0_child_present(uint32_t ptr_6c);

/* ---------------------------------------------------------------------------
 * R13 — 0x9c88e0 result law (PE 0x009c8d11): mov al,1 — the serializer
 *   returns constant 1 on every path.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c88e0_returns_true(void);

/* ---------------------------------------------------------------------------
 * R14 — 0x9c8d20 slot presence (PE 0x009c8ff8): test edi,edi ; je — the
 *   6-field slot body is serialized iff the slot u16 (zero-extended) is
 *   nonzero.  WORD gate: (v & 0xffff) != 0.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8d20_slot_present(uint32_t slot_word);

/* ---------------------------------------------------------------------------
 * R15 — 0x9c8d20 table bound (PE 0x009c90e5): cmp ecx,0x3800 ; jb — the
 *   448-slot (0x20 stride) table loop continues while the byte offset is
 *   below 0x3800.  FULL-dword UNSIGNED (jb).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8d20_table_more(uint32_t offset);

/* ---------------------------------------------------------------------------
 * R16 — 0x9c8d20 element count (PE 0x009c90f1; twin 0x009c91d7):
 *   (end - begin) / 0x78 via the 0x88888889 magic — SIGNED floor division
 *   by 120 (imul + sar 6 + sign correction, exact for the u32 diff).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c8d20_element_count(uint32_t begin_ptr,
                                               uint32_t end_ptr);

/* ---------------------------------------------------------------------------
 * R17 — 0x9c8d20 zero-count skip (PE 0x009c9132; repeat 0x009c921b):
 *   cmp [ebp-8],0 ; jbe — both element loops skip iff count == 0.
 *   FULL-dword UNSIGNED.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8d20_count_nonzero(uint32_t count);

/* ---------------------------------------------------------------------------
 * R18 — 0x9c8d20 intrusive-list walk (PE 0x009c9195 empty: *head==head je ;
 *   0x009c91d5 tail: cmp node,head ; jne continue): the circular list walk
 *   continues while the current node != head (empty list = node == head).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8d20_walk_continue(uint32_t node, uint32_t head);

/* --- ABI v3 accessors: serializer tree 0x9c84c0..0x9c8d20 --- */
uint32_t isaac_game_state_9c84c0_va(void);
uint32_t isaac_game_state_9c84c0_end_va(void);
uint32_t isaac_game_state_9c84c0_body_bytes(void);
uint32_t isaac_game_state_9c84c0_next_va(void);
uint32_t isaac_game_state_9c84c0_lane_count_gate_va(void);
uint32_t isaac_game_state_9c84c0_clear_gate_va(void);
uint32_t isaac_game_state_9c84c0_flush_gate_va(void);
uint32_t isaac_game_state_9c84c0_bit_select_gate_va(void);
uint32_t isaac_game_state_9c84c0_caller_count(void);
uint32_t isaac_game_state_9c84c0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9c85d0_va(void);
uint32_t isaac_game_state_9c85d0_end_va(void);
uint32_t isaac_game_state_9c85d0_body_bytes(void);
uint32_t isaac_game_state_9c85d0_next_va(void);
uint32_t isaac_game_state_9c85d0_flush8_gate_va(void);
uint32_t isaac_game_state_9c85d0_remainder_gate_va(void);
uint32_t isaac_game_state_9c85d0_bit_test_gate_va(void);
uint32_t isaac_game_state_9c85d0_caller_count(void);
uint32_t isaac_game_state_9c85d0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9c86e0_va(void);
uint32_t isaac_game_state_9c86e0_end_va(void);
uint32_t isaac_game_state_9c86e0_body_bytes(void);
uint32_t isaac_game_state_9c86e0_next_va(void);
uint32_t isaac_game_state_9c86e0_sentinel_gate_va(void);
uint32_t isaac_game_state_9c86e0_caller_count(void);
uint32_t isaac_game_state_9c86e0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9c87e0_va(void);
uint32_t isaac_game_state_9c87e0_end_va(void);
uint32_t isaac_game_state_9c87e0_body_bytes(void);
uint32_t isaac_game_state_9c87e0_next_va(void);
uint32_t isaac_game_state_9c87e0_sentinel_gate_va(void);
uint32_t isaac_game_state_9c87e0_caller_count(void);
uint32_t isaac_game_state_9c87e0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9c88e0_va(void);
uint32_t isaac_game_state_9c88e0_end_va(void);
uint32_t isaac_game_state_9c88e0_body_bytes(void);
uint32_t isaac_game_state_9c88e0_next_va(void);
uint32_t isaac_game_state_9c88e0_flags_bit0_gate_va(void);
uint32_t isaac_game_state_9c88e0_flags_bit1_gate_va(void);
uint32_t isaac_game_state_9c88e0_blob_gate_va(void);
uint32_t isaac_game_state_9c88e0_child_gate_va(void);
uint32_t isaac_game_state_9c88e0_ret_true_va(void);
uint32_t isaac_game_state_9c88e0_caller_count(void);
uint32_t isaac_game_state_9c88e0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9c8d20_va(void);
uint32_t isaac_game_state_9c8d20_end_va(void);
uint32_t isaac_game_state_9c8d20_body_bytes(void);
uint32_t isaac_game_state_9c8d20_next_va(void);
uint32_t isaac_game_state_9c8d20_slot_gate_va(void);
uint32_t isaac_game_state_9c8d20_table_bound_gate_va(void);
uint32_t isaac_game_state_9c8d20_element_count_va(void);
uint32_t isaac_game_state_9c8d20_count_zero_gate_va(void);
uint32_t isaac_game_state_9c8d20_count_zero_gate_va_2(void);
uint32_t isaac_game_state_9c8d20_walk_empty_gate_va(void);
uint32_t isaac_game_state_9c8d20_walk_tail_gate_va(void);
uint32_t isaac_game_state_9c8d20_caller_count(void);
uint32_t isaac_game_state_9c8d20_caller_va_at(uint32_t index);

/* --- ABI v4: GameStateIO save-orchestrator hosts 0x9cad40/0x9caea0
 *     decision laws S1..S6 + read_rerun typed-host lease ---

   Band census (section-notes/game-state-v4-io/NOTES.md §2): host A
   0x9cad40..0x9cae9f = cloud-write orchestrator (DeleteRerun FIRST +
   0x683930 name checksum + GameState::write + vtbl+0x34 close; 1 caller
   0x958fa1 IN exit 0x958ed0); host B 0x9caea0..0x9cb019 = rerun
   orchestrator (vtbl+0x24 + read_rerun + success byte [GameState+
   0x1fded] + DeleteRerun fallback; 1 caller 0x95a0eb IN exit 0x95a0xx).
   Both: pool select, GameStateIO release-via-dtor gate, alloc 0x28 /
   ctor (vtable 0xb65724, version 2), stat-name SSO selects (P4/Q4
   shapes, already lawed), write record (seed 0xfedcba76).  Byte-gate
   discipline identical to v1/v2/v3: uint32_t params only (NO uint8_t);
   the three LOW-BYTE AL gates mask & 0xff INSIDE the body; the two
   FULL-dword gates (pool select, io dtor) unmasked.  Calls stay
   typed-host: DeleteRerun 0x9c8410, write 0x9c9340, read_rerun 0x9d7d50. */

/* --- host A 0x9cad40 (cloud-write orchestrator) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_VA = 0x009cad40u;
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_END_VA = 0x009caea0u; /* first non-body byte (host B prologue; no pad) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_BODY_BYTES = 0x160u;
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_NEXT_VA = 0x009caea0u; /* host B (rerun orchestrator) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_CALLER_VA_0 = 0x00958fa1u; /* exit 0x958ed0 write-tail steam+cloud arm */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_IO_DTOR_GATE_VA = 0x009cad58u; /* test ecx,ecx ; je — release old GameStateIO* [edi+0x1fe24] */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_POOL_SELECT_VA = 0x009cad68u; /* test esi,esi ; je / add esi,0x30 / mov esi,0xc7f618 */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_NAME_GATE_VA = 0x009cadb6u; /* test al,al ; je fail — 0x683930(name, 0x100000) checksum AL */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_OPEN_GATE_VA = 0x009cadcbu; /* test al,al ; je fail — vtbl+0x30 stream-open AL */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_WRITE_CALL_VA = 0x009cae15u; /* call GameState::write 0x9c9340 (family-landed typed-host) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_STATNAME_SSO_GATE_VA = 0x009cada1u; /* cmp [esi+0x14],0x10 ; jb (esi=this+0x1fdf4 -> size +0x1fe08, P4 shape) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_CLOSE_CALL_VA = 0x009cae22u; /* vtbl+0x34 close (success path) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_FAIL_LOG_CALL_VA = 0x009cae87u; /* logger (1, 0xb7f000) on name/open gate fail */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_FAIL_CLOSE_CALL_VA = 0x009cae97u; /* vtbl+0x34 close (fail path) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAD40_LOG_STR_VA = 0x00b7f000u; /* "[warn] GameState::Save: ..." cloud-write fail string */

/* --- host B 0x9caea0 (rerun orchestrator) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_VA = 0x009caea0u;
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_END_VA = 0x009cb01au; /* first non-body byte (int3 pad @0x9cb01a) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_BODY_BYTES = 0x17au;
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_NEXT_VA = 0x009cb020u; /* reader row (next band; typed-host) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_CALLER_VA_0 = 0x0095a0ebu; /* exit 0x95a0xx body, +0x26589 byte-gate arm */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_IO_DTOR_GATE_VA = 0x009caebdu; /* test ecx,ecx ; je — release old GameStateIO* (twin of host A) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_POOL_SELECT_VA = 0x009caecdu; /* twin of 0x9cad68 */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_RERUN_GATE_VA = 0x009caf18u; /* test al,al ; je fail — vtbl+0x24 stat-name-arm AL */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_OPEN_GATE_VA = 0x009caf2du; /* test al,al ; je fail — vtbl+0x30 stream-open AL */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_RERUN_CALL_VA = 0x009caf77u; /* call GameState::read_rerun 0x9d7d50 (typed-host lease; AL -> bl) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_SUCCESS_GATE_VA = 0x009caf89u; /* test bl,bl ; jne success — read_rerun bool AL */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_SUCCESS_STORE_VA = 0x009cafe9u; /* mov byte [edi+0x1fded],1 ; mov al,1 (success store law) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_DELETE_RERUN_CALL_VA = 0x009caf8fu; /* call DeleteRerun 0x9c8410 (family-landed typed-host; fail arm) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_RERUN_FLAG_WORD_OFF = 0x1fdec; /* word [GameState+0x1fdec]=0 (rerun pending flag) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_RERUN_SUCCESS_BYTE_OFF = 0x1fded; /* byte [GameState+0x1fded] = rerun-success store */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_RERUN_STATNAME_BUF_OFF = 0x1fe0cu; /* rerun stat-name SSO buffer (shared with DeleteRerun 9c8410) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_RERUN_STATNAME_SIZE_OFF = 0x1fe20u; /* rerun stat-name SSO size */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_STATNAME_SSO_GATE_VA = 0x009caf06u; /* cmp [esi+0x14],0x10 ; jb (esi=this+0x1fe0c -> size +0x1fe20, Q4 shape) */
static constexpr uint32_t ISAAC_GAME_STATE_9CAEA0_LOG_STR_VA = 0x00b7f048u; /* rerun fail string */

/* --- shared GameStateIO / write-record constants --- */
static constexpr uint32_t ISAAC_GAME_STATE_IO_VTABLE = 0x00b65724u; /* GameStateIO vtable (ctor [ecx] store) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_CTOR_VERSION = 0x2u; /* [io+4] = 2 at ctor */
static constexpr uint32_t ISAAC_GAME_STATE_IO_ALLOC_SIZE = 0x28u; /* alloc 0x28 bytes (both hosts) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_ALLOC_IAT = 0x00b187e0u; /* CRT malloc */
static constexpr uint32_t ISAAC_GAME_STATE_IO_FAIL_ALLOC_VA = 0x00a23200u; /* failed-alloc handler (both hosts) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_CHECKSUM_VA = 0x00683930u; /* stat-name checksum (host A) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_CHECKSUM_SIZE = 0x100000u; /* checksum size arg */
static constexpr uint32_t ISAAC_GAME_STATE_IO_POOL_GLOBAL_DAT = 0x00c7de78u; /* pool-global presence [0xc7de78] */
static constexpr uint32_t ISAAC_GAME_STATE_IO_POOL_FALLBACK = 0x00c7f618u; /* fallback pool address */
static constexpr uint32_t ISAAC_GAME_STATE_IO_POOL_STEP = 0x30u; /* +0x30 offset past the pool header */
static constexpr uint32_t ISAAC_GAME_STATE_IO_VTBL_OPEN_SLOT = 0x30u; /* stream-open (AL result gated S3) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_VTBL_CLOSE_SLOT = 0x34u; /* stream-close (unconditional) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_VTBL_RERUN_SLOT = 0x24u; /* rerun stat-name arm (AL result gated S4) */
static constexpr uint32_t ISAAC_GAME_STATE_IO_VTBL_DTOR_SLOT = 0x0u; /* release-old-IO dtor (S6 gate) */
static constexpr uint32_t ISAAC_GAME_STATE_WRITE_RECORD_SEED = 0xfedcba76u; /* record seed dword (both hosts) */
static constexpr uint32_t ISAAC_GAME_STATE_WRITE_RECORD_FLAGS = 0x1u; /* record count/flags field */
static constexpr uint32_t ISAAC_GAME_STATE_READER_ROW_NEXT_VA = 0x009cb020u; /* band-tail reader row (typed-host; 4 callers; next band) */

/* --- ABI v4 lease: GameState::read_rerun 0x009d7d50 (exact ZHL
 *     `__thiscall bool GameState::read_rerun(GameStateIO** gameStateIO)`)
 *     — IRREDUCIBLE rerun-read serializer (GS cookie 0xbf93b4 + version
 *     parse + 0x96696996 checksum + DeleteRerun restore call; NO laws).
 *     Body 0x009d7d50..0x009d8182 (0x433 B); 2 direct rel32 callers
 *     (0x95a3c8 exit body, 0x9caf77 host B). --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_VA = 0x009d7d50u;
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_END_VA = 0x009d8183u; /* first non-body byte (int3 pad @0x9d8183) */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_BODY_BYTES = 0x433u;
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_NEXT_VA = 0x009d8190u;
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_CALLER_VA_0 = 0x0095a3c8u; /* exit body */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_CALLER_VA_1 = 0x009caf77u; /* host B rerun orchestrator */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_CHECKSUM_XOR = 0x96696996u; /* checksum xor @0x9d7e48 (shared with write tail) */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_CHECKSUM_OFF = 0x1fda8u; /* checksum field [GameState+0x1fda8] */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_VERSION_OFF = 0x1fdf0u; /* record-version field @+0x1fdf0 (cmp eax,1 ; jge) */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_RERUN_SUCCESS_BYTE_OFF = 0x1fdedu; /* READS byte [GameState+0x1fded] (host-B success byte) @0x9d7dcb */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_GS_COOKIE_DAT = 0x00bf93b4u; /* GS cookie (shared with write 0x9c9340) */
static constexpr uint32_t ISAAC_GAME_STATE_9D7D50_COOKIE_TAIL_VA = 0x00aef12bu; /* __security_check_cookie (3 sites) */

/* --- ABI v11: RE-CENSUSED helper-cluster spans (supersede the v4 pins;
 *     section-notes/game-state-v11-small-bodies/NOTES.md).  The former
 *     0x321a-B "0x9d45c0 giant" is TWO bodies (0x9d45c0 writer giant
 *     0x2be1 B, ret 4 @0x9d719e + 0x9d71b0 GS-cookie reader tail
 *     0x62a B, ret 4 @0x9d77d9); the former 0x9cec80 0x5c8-B span is
 *     SIX bodies (0x9cec80 u32/float-lane serializer 0x171 B, 0x9cf000
 *     bitmap clear, 0x9cf050 GameState ctor, 0x9cff40 writer, 0x9d0100
 *     writer, 0x9d02c0 reader, 0x9d0440 writer) + NEW gap pins
 *     0x9d8190/0x9d83f0/0x9d8470.  All stay typed-host; decision laws
 *     land at ABI v11. --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_END_VA = 0x009d71a1u; /* writer giant; ret 4 @0x9d719e (v4 span 0x9d77da MERGED 0x9d71b0) */
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_BODY_BYTES = 0x2be1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_NEXT_VA = 0x009d71b0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_VA = 0x009d71b0u; /* reader tail (GS 0xbf93b4; io8 gates 0x94-dead/0x9f/0xa2/0xa3); 1 caller 0x9cc84d */
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_END_VA = 0x009d77dau; /* ret 4 @0x9d77d9 */
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_BODY_BYTES = 0x62au;
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_NEXT_VA = 0x009d77e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_GS_COOKIE_DAT = 0x00bf93b4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D71B0_CALLER_VA_0 = 0x009cc84du; /* read entry 0x9cc1a0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_END_VA = 0x009d7d49u; /* sub-object serializer (this+0x8c); ret 4 @0x9d7d46 */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_BODY_BYTES = 0x569u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_NEXT_VA = 0x009d7d50u; /* GameState::read_rerun */
static constexpr uint32_t ISAAC_GAME_STATE_9CEC80_END_VA = 0x009ceff1u; /* u32-array serializer (float lanes); ret 4 @0x9cefee (v4 span 0x9cf048 MERGED 0x9cf000/0x9cf050) */
static constexpr uint32_t ISAAC_GAME_STATE_9CEC80_BODY_BYTES = 0x171u;
static constexpr uint32_t ISAAC_GAME_STATE_9CEC80_NEXT_VA = 0x009cf000u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_VA = 0x009cf000u; /* bitmap clear 0x68 bits @[this+0x94]; ret @0x9cf041; 2 callers 0x9c7ee4 0x9cdfbe */
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_END_VA = 0x009cf042u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_BODY_BYTES = 0x42u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_NEXT_VA = 0x009cf050u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_CLEAR_MORE_VA = 0x009cf037u; /* cmp eax,0x68 ; jb 0x9cf020 */
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_CALLER_VA_0 = 0x009c7ee4u; /* reset giant 0x9c79a0 */
static constexpr uint32_t ISAAC_GAME_STATE_9CF000_CALLER_VA_1 = 0x009cdfbeu; /* read entry 0x9cc1a0 (gs<0x42 arm) */
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_VA = 0x009cf050u; /* GameState ctor (host; 6 callers incl. 0x9c7da2/0x9c7dc5) */
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_END_VA = 0x009cff2fu; /* ret @0x9cff2e */
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_BODY_BYTES = 0xadfu;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_NEXT_VA = 0x009cff40u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_COUNT = 6u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_VA_0 = 0x009061bbu;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_VA_1 = 0x0090c917u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_VA_2 = 0x009bcc22u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_VA_3 = 0x009beffdu;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_VA_4 = 0x009c7da2u;
static constexpr uint32_t ISAAC_GAME_STATE_9CF050_CALLER_VA_5 = 0x009c7dc5u;
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_VA = 0x009cff40u; /* writer leaf (u16 x7 + u32 x2 + io8>=0x92 extra pair + u32 x2); ret 4 @0x9d00f9; mov al,1 */
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_END_VA = 0x009d00fcu;
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_BODY_BYTES = 0x1bau;
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_NEXT_VA = 0x009d0100u;
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_IO8_GATE_0X92_VA = 0x009d00a4u; /* cmp [edi+8],0x92 ; jb skip-extra */
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_CALLER_VA_0 = 0x009d2688u; /* reader giant 0x9d05d0 (AL gated @0x9d268d) */
static constexpr uint32_t ISAAC_GAME_STATE_9CFF40_CALLER_VA_1 = 0x009d26d2u; /* reader giant 0x9d05d0 (AL gated @0x9d26d7) */
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_VA = 0x009d0100u; /* writer leaf, unconditional extra pair (no gates); ret 4 @0x9d02ae */
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_END_VA = 0x009d02b1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_BODY_BYTES = 0x1afu;
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_NEXT_VA = 0x009d02c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_CALLER_VA_0 = 0x009d5b07u; /* writer giant 0x9d45c0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D0100_CALLER_VA_1 = 0x009d5b52u; /* writer giant 0x9d45c0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D02C0_VA = 0x009d02c0u; /* reader leaf (fixed shape, twin of 0x9d0440; no gates); ret 4 @0x9d0435 */
static constexpr uint32_t ISAAC_GAME_STATE_9D02C0_END_VA = 0x009d0438u;
static constexpr uint32_t ISAAC_GAME_STATE_9D02C0_BODY_BYTES = 0x176u;
static constexpr uint32_t ISAAC_GAME_STATE_9D02C0_NEXT_VA = 0x009d0440u;
static constexpr uint32_t ISAAC_GAME_STATE_9D02C0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D02C0_CALLER_VA_0 = 0x009d35f0u; /* reader giant 0x9d05d0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_VA = 0x009d0440u; /* writer leaf (twin of 0x9d02c0 reader); ret 4 @0x9d05bf */
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_END_VA = 0x009d05c2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_BODY_BYTES = 0x180u;
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_NEXT_VA = 0x009d05d0u; /* reader giant */
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_BYTE_C_GATE_VA = 0x009d04d4u; /* cmp byte [esi+0xc],al ; je (bit0) */
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_BYTE_D_GATE_VA = 0x009d04dfu; /* cmp byte [esi+0xd],0 ; je (bit1) */
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D0440_CALLER_VA_0 = 0x009d65a6u; /* writer giant 0x9d45c0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_VA = 0x009d8190u; /* save-piece writer (SEH 0xb0f3cd + GS 0xbf93b4; calls 0x9d45c0 xN @0x9d82a5, stride 0x5dc; 0x96696996 tail) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_END_VA = 0x009d83e5u; /* ret 4 @0x9d83e2 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_BODY_BYTES = 0x255u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_NEXT_VA = 0x009d83f0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CALLER_VA_0 = 0x00959353u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CALLER_VA_1 = 0x009594b4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_VA = 0x009d83f0u; /* 0x34-stride vector reserve (0x4ec4ec4f magic; calls 0x9d8820/0x9d8a20) */
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_END_VA = 0x009d846du; /* ret 4 @0x9d846a (3 rets) */
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_BODY_BYTES = 0x7du;
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_NEXT_VA = 0x009d8470u;
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_CALLER_VA_0 = 0x009d227du; /* reader giant 0x9d05d0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D83F0_CALLER_VA_1 = 0x009d3643u; /* reader giant 0x9d05d0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8470_VA = 0x009d8470u; /* u16 row-writer leaf; ret 4 @0x9d849d */
static constexpr uint32_t ISAAC_GAME_STATE_9D8470_END_VA = 0x009d84a0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8470_BODY_BYTES = 0x30u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8470_NEXT_VA = 0x009d84a0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8470_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8470_CALLER_VA_0 = 0x009cc3d3u; /* read entry 0x9cc1a0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D84D0_END_VA = 0x009d8549u; /* u32-array count serializer (twin of 0x9cec80 header); ret 4 @0x9d8546 */
static constexpr uint32_t ISAAC_GAME_STATE_9D84D0_BODY_BYTES = 0x79u;
static constexpr uint32_t ISAAC_GAME_STATE_9D84D0_NEXT_VA = 0x009d8550u; /* u8 row-writer leaf */
static constexpr uint32_t ISAAC_GAME_STATE_9D84A0_END_VA = 0x009d84cfu; /* u32 row-writer leaf; ret 4 @0x9d84cc */
static constexpr uint32_t ISAAC_GAME_STATE_9D84A0_BODY_BYTES = 0x2fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D84A0_NEXT_VA = 0x009d84d0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8550_END_VA = 0x009d857fu; /* u8 row-writer leaf; ret 4 @0x9d857c */
static constexpr uint32_t ISAAC_GAME_STATE_9D8550_BODY_BYTES = 0x2fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8550_NEXT_VA = 0x009d8580u;

/* ---------------------------------------------------------------------------
 * S1 — 0x9cad40/0x9caea0 allocation-pool select (PE 0x009cad68, twin
 *   0x009caecd): test esi,esi ; je / add esi,0x30 / mov esi,0xc7f618 —
 *   FULL-dword presence of the pool global [0xc7de78]; nonzero selects
 *   pool+0x30, zero selects the fallback pool 0xc7f618.  Returns the
 *   selected pool ADDRESS (u32 add wraps).  The A/B arm select of both
 *   hosts' allocator.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9cad40_pool_select(uint32_t pool_global);

/* ---------------------------------------------------------------------------
 * S2 — 0x9cad40 stat-name checksum gate (PE 0x009cadb6):
 *   test al,al ; je fail.  LOW-BYTE (AL of 0x683930(name, 0x100000));
 *   non-zero AL (masked & 0xff) proceeds to the open gate, zero -> the
 *   logger+close fail path.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cad40_name_gate_ok(uint32_t checksum_al);

/* ---------------------------------------------------------------------------
 * S3 — 0x9cad40/0x9caea0 stream-open gate (PE 0x009cadcb, twin 0x009caf2d):
 *   test al,al ; je fail.  LOW-BYTE (AL of the vtbl+0x30 stream-open
 *   call).  Non-zero (masked & 0xff) proceeds to the write-record build /
 *   read_rerun; zero -> fail path.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cad40_open_gate_ok(uint32_t open_al);

/* ---------------------------------------------------------------------------
 * S4 — 0x9caea0 rerun stat-name-arm gate (PE 0x009caf18):
 *   test al,al ; je fail.  LOW-BYTE (AL of the vtbl+0x24 call with the
 *   rerun stat-name SSO pointer).  Non-zero (masked & 0xff) proceeds;
 *   zero -> fail path.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9caea0_rerun_gate_ok(uint32_t rerun_al);

/* ---------------------------------------------------------------------------
 * S5 — 0x9caea0 rerun-success byte store law (PE 0x009caf89 test bl,bl ;
 *   jne 0x9cafe9 ; 0x009cafe9 mov byte [edi+0x1fded],1 ; mov al,1):
 *   LOW-BYTE of GameState::read_rerun's bool AL.  Non-zero (masked &
 *   0xff) stores byte 1 at [GameState+0x1fded] and returns 1 (the
 *   stored value); zero -> DeleteRerun fallback + al=0.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9caea0_rerun_success(uint32_t read_rerun_al);

/* ---------------------------------------------------------------------------
 * S6 — 0x9cad40/0x9caea0 release-old-IO gate (PE 0x009cad58, twin
 *   0x009caebd): test ecx,ecx ; je — FULL-dword presence of the existing
 *   GameStateIO* at [GameState+0x1fe24].  Nonzero -> the vtbl+0 dtor
 *   release call.  SAME field+shape as exit v46
 *   isaac_exit_958ed0_io_dtor_needed (GameState-owned twin; shared-field
 *   pattern like P7).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cad40_io_dtor_needed(uint32_t io_ptr_1fe24);

/* --- ABI v4 accessors: save-orchestrator hosts + read_rerun lease + cluster spans --- */
uint32_t isaac_game_state_9cad40_va(void);
uint32_t isaac_game_state_9cad40_end_va(void);
uint32_t isaac_game_state_9cad40_body_bytes(void);
uint32_t isaac_game_state_9cad40_next_va(void);
uint32_t isaac_game_state_9cad40_io_dtor_gate_va(void);
uint32_t isaac_game_state_9cad40_pool_select_va(void);
uint32_t isaac_game_state_9cad40_name_gate_va(void);
uint32_t isaac_game_state_9cad40_open_gate_va(void);
uint32_t isaac_game_state_9cad40_write_call_va(void);
uint32_t isaac_game_state_9cad40_statname_sso_gate_va(void);
uint32_t isaac_game_state_9cad40_close_call_va(void);
uint32_t isaac_game_state_9cad40_fail_log_call_va(void);
uint32_t isaac_game_state_9cad40_fail_close_call_va(void);
uint32_t isaac_game_state_9cad40_log_str_va(void);
uint32_t isaac_game_state_9cad40_caller_count(void);
uint32_t isaac_game_state_9cad40_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9caea0_va(void);
uint32_t isaac_game_state_9caea0_end_va(void);
uint32_t isaac_game_state_9caea0_body_bytes(void);
uint32_t isaac_game_state_9caea0_next_va(void);
uint32_t isaac_game_state_9caea0_io_dtor_gate_va(void);
uint32_t isaac_game_state_9caea0_pool_select_va(void);
uint32_t isaac_game_state_9caea0_rerun_gate_va(void);
uint32_t isaac_game_state_9caea0_open_gate_va(void);
uint32_t isaac_game_state_9caea0_rerun_call_va(void);
uint32_t isaac_game_state_9caea0_success_gate_va(void);
uint32_t isaac_game_state_9caea0_success_store_va(void);
uint32_t isaac_game_state_9caea0_delete_rerun_call_va(void);
uint32_t isaac_game_state_9caea0_rerun_flag_word_off(void);
uint32_t isaac_game_state_9caea0_rerun_success_byte_off(void);
uint32_t isaac_game_state_9caea0_rerun_statname_buf_off(void);
uint32_t isaac_game_state_9caea0_rerun_statname_size_off(void);
uint32_t isaac_game_state_9caea0_statname_sso_gate_va(void);
uint32_t isaac_game_state_9caea0_log_str_va(void);
uint32_t isaac_game_state_9caea0_caller_count(void);
uint32_t isaac_game_state_9caea0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_io_vtable(void);
uint32_t isaac_game_state_io_ctor_version(void);
uint32_t isaac_game_state_io_alloc_size(void);
uint32_t isaac_game_state_io_alloc_iat(void);
uint32_t isaac_game_state_io_fail_alloc_va(void);
uint32_t isaac_game_state_io_checksum_va(void);
uint32_t isaac_game_state_io_checksum_size(void);
uint32_t isaac_game_state_io_pool_global_dat(void);
uint32_t isaac_game_state_io_pool_fallback(void);
uint32_t isaac_game_state_io_pool_step(void);
uint32_t isaac_game_state_io_vtbl_open_slot(void);
uint32_t isaac_game_state_io_vtbl_close_slot(void);
uint32_t isaac_game_state_io_vtbl_rerun_slot(void);
uint32_t isaac_game_state_io_vtbl_dtor_slot(void);
uint32_t isaac_game_state_write_record_seed(void);
uint32_t isaac_game_state_write_record_flags(void);
uint32_t isaac_game_state_9d7d50_va(void);
uint32_t isaac_game_state_9d7d50_end_va(void);
uint32_t isaac_game_state_9d7d50_body_bytes(void);
uint32_t isaac_game_state_9d7d50_next_va(void);
uint32_t isaac_game_state_9d7d50_caller_count(void);
uint32_t isaac_game_state_9d7d50_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d7d50_checksum_xor(void);
uint32_t isaac_game_state_9d7d50_checksum_off(void);
uint32_t isaac_game_state_9d7d50_version_off(void);
uint32_t isaac_game_state_9d7d50_rerun_success_byte_off(void);
uint32_t isaac_game_state_9d7d50_gs_cookie_dat(void);
uint32_t isaac_game_state_9d7d50_cookie_tail_va(void);
uint32_t isaac_game_state_9d45c0_end_va(void);
uint32_t isaac_game_state_9d45c0_body_bytes(void);
uint32_t isaac_game_state_9d45c0_next_va(void);
uint32_t isaac_game_state_9d77e0_end_va(void);
uint32_t isaac_game_state_9d77e0_body_bytes(void);
uint32_t isaac_game_state_9d77e0_next_va(void);
uint32_t isaac_game_state_9cec80_end_va(void);
uint32_t isaac_game_state_9cec80_body_bytes(void);
uint32_t isaac_game_state_9cec80_next_va(void);
uint32_t isaac_game_state_9d84d0_end_va(void);
uint32_t isaac_game_state_9d84d0_body_bytes(void);
uint32_t isaac_game_state_9d84d0_next_va(void);
uint32_t isaac_game_state_9d84a0_end_va(void);
uint32_t isaac_game_state_9d84a0_body_bytes(void);
uint32_t isaac_game_state_9d84a0_next_va(void);
uint32_t isaac_game_state_9d8550_end_va(void);
uint32_t isaac_game_state_9d8550_body_bytes(void);
uint32_t isaac_game_state_9d8550_next_va(void);
uint32_t isaac_game_state_9cb020_va(void);
uint32_t isaac_game_state_9cb020_caller_count(void);
uint32_t isaac_game_state_9cb020_caller_va_at(uint32_t index);

/* --- ABI v5: write-span loop/decision laws W1..W22 (0x9c9340 peel) +
 *     0x9c8d20 element-loop bounds U1 + 0x683930 name-gate law N1 ---

   Census (section-notes/game-state-v4-cloud/NOTES.md §2): the v2 write
   typed-host lease stays whole (SEH/GS + call recipe); the LANE-FREE
   loop/decision gates of its internal passes are peeled here (same
   style as the v3 serializer-tree peel R1..R18).  Byte-gate discipline
   identical to v1..v4: uint32_t params only (NO uint8_t); byte/word
   gates mask INSIDE the body (& 0xff / & 0xffff); full-dword gates
   unmasked; SIGNED gates use the wasm32 compare-flip i64 sign-extend
   form `(int64_t)(int32_t)…` (bytes: `(int64_t)(int32_t)(int8_t)(x &
   0xff)`) — precedent frame-opaque 424ef0 / hud 770a7e.  The div-0xc
   count is the NO-ADD magic form (TRUNCATION toward zero, NOT the R16
   signed-floor class: -13 -> -1, INT32_MIN -> 0xf5555556). */

/* --- 0x9c8d20 tail: element-loop bounds (U1) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_ELEMENT_LOOP_MORE_VA = 0x009c9157u; /* cmp eax,[ebp-8] ; jb — loop-1 bound (twin @0x9c9249) */
static constexpr uint32_t ISAAC_GAME_STATE_9C8D20_ELEMENT_LOOP_MORE_VA_2 = 0x009c9249u; /* cmp eax,[ebp-0xc] ; jb — loop-2 bound */

/* --- write-span loop/decision gate VAs + offsets (0x9c9340 body) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_COUNT_GATE_VA = 0x009c9ca0u; /* cmp [esi+0x1952c],0 ; jbe — hash-table loop entry */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_PROBE_VA = 0x009c9cc0u; /* mov eax,[esi+0x19524] / dec eax / and ecx,eax — probe mask */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_BOUND_GATE_VA = 0x009c9cd8u; /* cmp edi,[esi+0x1952c] ; jb */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_VALUE_COUNT_GATE_VA = 0x009c9d17u; /* cmp [esi+0x19c],0 ; jbe */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_VALUE_BOUND_GATE_VA = 0x009c9d5cu; /* cmp eax,[ecx] ; jb (count re-read) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_NEG_GATE_VA = 0x009c9dc5u; /* test eax,eax ; jns — signed entry test */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_FLUSH_GATE_VA = 0x009c9dcfu; /* test cx,cx ; je */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_RUN_WORD_VA = 0x009c9dd5u; /* dec ecx / or ecx,0x8000 / mov word */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_FINAL_FLUSH_VA = 0x009c9e07u; /* test cx,cx ; je — post-loop tail flush */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_COUNT_VA = 0x009ca858u; /* mov eax,0x2aaaaaab / imul / sar edx,1 / sign add (twin in-loop @0x9ca9c6) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_RESIZE_GATE_VA = 0x009ca868u; /* cmp eax,0xff ; jbe — resize trigger */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_COUNT_BYTE_VA = 0x009ca8adu; /* mov byte [ebp-0x44d],al — count as byte field */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_NEEDED_GATE_VA = 0x009ca8fdu; /* je 0x9ca9ef — count==0 skip */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_BOUND_GATE_VA = 0x009ca9e1u; /* cmp esi,eax ; jb */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_COUNT_VA = 0x009caa9cu; /* mov [ebp-0x44c],7 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_MORE_VA = 0x009cac22u; /* sub [ebp-0x44c],1 ; jne */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_BYTE_COUNT_NEEDED_VA = 0x009cab2au; /* cmp byte [ebp-0x44d],al ; jle (twin @0x9cabb9) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_BYTE_COUNT_NEEDED_VA_2 = 0x009cabb9u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_BYTE_COUNT_MORE_VA = 0x009cab70u; /* cmp al,byte [ebp-0x44d] ; jl (twin @0x9cabf0) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_BYTE_COUNT_MORE_VA_2 = 0x009cabf0u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_FINALIZE_MODE_GATE_VA = 0x009cacb2u; /* cmp [edi+0xc],0 ; jne skip (mode==0) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_FINALIZE_PARTIAL_GATE_VA = 0x009cacbbu; /* test dl,dl ; je skip (partial!=0) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_FINALIZE_PAD_VA = 0x009cacbfu; /* cmp dl,4 ; jae / mov al,4 / sub al,dl */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_FINALIZE_FOLD_VA = 0x009cacdcu; /* shr ecx,1 / shl eax,0x1f / add ecx,eax / add ecx,[edi] */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CHECKSUM_STORE_XOR_VA = 0x009cad00u; /* mov [esi+0x1fda4],eax / xor eax,0x96696996 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_TABLE_OFF = 0x19520u; /* probe table base (hash loop) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_CAP_OFF = 0x19524u; /* probe capacity (mask = cap-1) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_STATE_OFF = 0x19528u; /* probe state/hash offset (added to idx) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HASH_COUNT_OFF = 0x1952cu; /* probe table count */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_VALUE_COUNT_OFF = 0x19cu; /* value/ 0x9c8d20 element count */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_VALUE_BASE_OFF = 0x1a0u; /* value array base (stride 0xb8) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HOLDER_BASE_OFF = 0x17c68u; /* holder array base (stride 0xc) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_VALUE_STRIDE = 0xb8u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_HOLDER_STRIDE = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_TABLE_OFF = 0x19530u; /* reorder table base (signed-idx 0x1fb entries) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_ENTRIES = 0x1fbu; /* 507 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_RUN_MARKER = 0x8000u; /* u16 run-word marker bit */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_BEGIN_OFF = 0x1e790u; /* div-0xc begin pair offset 1 (end @+4) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_MAGIC = 0x2aaaaaabu; /* signed magic (TRUNC no-add form) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_DIVISOR = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_DIV0XC_CAP = 0xffu; /* resize threshold (count > 0xff) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_BASE_OFF = 0x1ead0u; /* 7-lane array base (stride 0x320) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_STRIDE = 0x320u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_COUNT = 0x7u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CHECKSUM_OFF = 0x1fda4u; /* GameState checksum field (raw acc store) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_CHECKSUM_XOR = 0x96696996u; /* streamed final word xor (shared with read_rerun) */
/* checksum state at stream+0xc (ebx=write arg): +0 lane, +4 partial, +8 acc, +0xc mode */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_STATE_MODE_OFF = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_STATE_PARTIAL_OFF = 0x4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_STATE_ACC_OFF = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_STATE_LANE_OFF = 0x0u;

/* --- 0x683930 name-gate helper (N1): state-open decider (3 callers:
 *     0x928f7b SaveToSteamCloud, 0x9592ef, 0x9cadb1 host A) --- */
static constexpr uint32_t ISAAC_GAME_STATE_683930_VA = 0x00683930u; /* checksum-state open helper (F9 S2 gates its call-site AL) */
static constexpr uint32_t ISAAC_GAME_STATE_683930_END_VA = 0x006839a0u; /* first non-body byte (ret 8 @0x68399e; int3 pad) */
static constexpr uint32_t ISAAC_GAME_STATE_683930_BODY_BYTES = 0x70u;
static constexpr uint32_t ISAAC_GAME_STATE_683930_NEXT_VA = 0x006839b0u;
static constexpr uint32_t ISAAC_GAME_STATE_683930_STEAM_IAT = 0x00b18a1cu; /* SteamInternal_ContextInit */
static constexpr uint32_t ISAAC_GAME_STATE_683930_STEAM_ARG = 0x00c5c3a4u;
static constexpr uint32_t ISAAC_GAME_STATE_683930_STEAM_GATE_VA = 0x0068394au; /* cmp dword [eax],0 ; jne — FULL-dword steam presence */
static constexpr uint32_t ISAAC_GAME_STATE_683930_CALLER_COUNT = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_683930_CALLER_VA_0 = 0x00928f7bu; /* SaveToSteamCloud */
static constexpr uint32_t ISAAC_GAME_STATE_683930_CALLER_VA_1 = 0x009592efu;
static constexpr uint32_t ISAAC_GAME_STATE_683930_CALLER_VA_2 = 0x009cadb1u; /* cloud-write host A (F9's S2 gates the result here) */

/* ---------------------------------------------------------------------------
 * U1 — 0x9c8d20 element-loop bound (PE 0x009c9157, twin 0x009c9249):
 *   cmp eax,[ebp-8] ; jb / cmp eax,[ebp-0xc] ; jb — UNSIGNED idx < count
 *   for the two div-0x78 element serialization loops (count = R16 law
 *   output).  0x100 IS present (byte-narrowed bound would flip 0x100-
 *   length runs mid-span).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c8d20_element_loop_more(uint32_t idx, uint32_t count);

/* ---------------------------------------------------------------------------
 * W1 — 0x9c9340 hash-table loop entry (PE 0x009c9ca0):
 *   cmp dword [esi+0x1952c],0 ; jbe — UNSIGNED.  count != 0 opens the
 *   probe slot loop (0x9c87e0 per slot).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_hash_count_nonzero(uint32_t count_1952c);

/* ---------------------------------------------------------------------------
 * W2 — 0x9c9340 hash probe slot (PE 0x009c9cc0): lea ecx,[eax+edi]
 *   (hash+idx) ; mov eax,[esi+0x19524] ; dec eax ; and ecx,eax —
 *   (idx + hash) & (cap - 1) u32 wrap, the probe index law.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_hash_probe_slot(uint32_t idx,
                                                 uint32_t hash_19528,
                                                 uint32_t cap_19524);

/* ---------------------------------------------------------------------------
 * W3 — 0x9c9340 hash loop bound (PE 0x009c9cd8): cmp edi,count ; jb —
 *   UNSIGNED idx < count.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_hash_loop_more(uint32_t idx,
                                               uint32_t count_1952c);

/* ---------------------------------------------------------------------------
 * W4 — 0x9c9340 value-array loop entry (PE 0x009c9d17):
 *   cmp dword [esi+0x19c],0 ; jbe — UNSIGNED.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_value_count_nonzero(uint32_t count_19c);

/* ---------------------------------------------------------------------------
 * W5 — 0x9c9340 value loop bound (PE 0x009c9d5c): cmp eax,[ecx] ; jb —
 *   UNSIGNED idx < count (count RE-READ every iteration).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_value_loop_more(uint32_t idx,
                                                uint32_t count_19c);

/* ---------------------------------------------------------------------------
 * W6 — 0x9c9340 reorder entry sign (PE 0x009c9dc5): test eax,eax ; jns —
 *   SIGNED (int64)(int32)entry < 0 (wasm32 compare-flip class: the i64
 *   sign-extend form keeps the signed test; 0xffffffff / 0x80000000 ARE
 *   negative).  Negative entries increment the pending-run count.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_reorder_entry_negative(uint32_t entry);

/* ---------------------------------------------------------------------------
 * W7 — 0x9c9340 reorder pending-run flush (PE 0x009c9dcf): test cx,cx ;
 *   je — WORD gate: (pending & 0xffff) != 0 emits the count word before
 *   the value word.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_reorder_pending_flush(uint32_t pending);

/* ---------------------------------------------------------------------------
 * W8 — 0x9c9340 reorder run word (PE 0x009c9dd5): dec ecx ; or ecx,
 *   0x8000 ; mov word [..],cx — (((pending - 1) | 0x8000) & 0xffff),
 *   the u16 run word with the 0x8000 marker bit.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_reorder_run_word(uint32_t pending);

/* ---------------------------------------------------------------------------
 * W9 — 0x9c9340 reorder post-loop tail flush (PE 0x009c9e07): test cx,
 *   cx ; je — WORD gate (twin of W7 for the after-loop remainder).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_reorder_final_flush(uint32_t pending);

/* ---------------------------------------------------------------------------
 * W10 — 0x9c9340 div-0xc element count (PE 0x009ca858, in-loop twin
 *   0x009ca9c6): mov eax,0x2aaaaaab ; imul ecx ; sar edx,1 ; mov eax,
 *   edx ; shr eax,0x1f ; add eax,edx — the NO-ADD magic form:
 *   q = (hi >> 1) + ((uint32)(hi >> 1) >> 31) with hi = high dword of
 *   (int64)(int32)(end - begin) * 0x2aaaaaab.  TRUNCATION toward zero
 *   (NOT the R16 signed-floor class: -13 -> 0xffffffff, INT32_MIN ->
 *   0xf5555556; floor would give 0xfffffffe / 0xf5555555).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_div0xc_count(uint32_t begin_off,
                                              uint32_t end_off);

/* ---------------------------------------------------------------------------
 * W11 — 0x9c9340 div-0xc resize trigger (PE 0x009ca868): cmp eax,0xff ;
 *   jbe — UNSIGNED (count > 0xff) fires the host 0x708ae0 resize.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_div0xc_resize_needed(uint32_t count);

/* ---------------------------------------------------------------------------
 * W12 — 0x9c9340 div-0xc count byte (PE 0x009ca8ad): mov byte
 *   [ebp-0x44d],al — the count is stored AS A BYTE field: count & 0xff
 *   (0x100 -> 0).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_div0xc_count_byte(uint32_t count);

/* ---------------------------------------------------------------------------
 * W13 — 0x9c9340 div-0xc loop entry (PE 0x009ca8fd): je 0x9ca9ef (ZF
 *   after the sign-correction add) — (count != 0); |diff| < 0xc skips
 *   the 3-u32-field loop.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_div0xc_loop_needed(uint32_t count);

/* ---------------------------------------------------------------------------
 * W14 — 0x9c9340 div-0xc loop bound (PE 0x009ca9e1): cmp esi,eax ; jb —
 *   UNSIGNED idx < count (count RE-READ every iteration).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_div0xc_loop_more(uint32_t idx,
                                                 uint32_t count);

/* ---------------------------------------------------------------------------
 * W15 — 0x9c9340 7-lane count (PE 0x009caa9c): mov [ebp-0x44c],7 — the
 *   fixed 7-lane loop at +0x1ead0 (stride 0x320).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_lane7_count(void);

/* ---------------------------------------------------------------------------
 * W16 — 0x9c9340 7-lane loop bound (PE 0x009cac22): sub [ebp-0x44c],1 ;
 *   jne — ((remaining - 1) != 0) u32; the countdown 7..1 runs the lane
 *   body 7 times.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_lane7_loop_more(uint32_t remaining);

/* ---------------------------------------------------------------------------
 * W17 — 0x9c9340 signed byte-count loop entry (PE 0x009cab2a, twin
 *   0x009cabb9): cmp byte [ebp-0x44d], al(0) ; jle skip — SIGNED byte:
 *   (int8)(count & 0xff) > 0 (0x80..0xff are negative and skip; wasm32
 *   compare-flip class, i8 sign-extend through i64).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_byte_count_needed(uint32_t count_byte);

/* ---------------------------------------------------------------------------
 * W18 — 0x9c9340 signed byte-count loop bound (PE 0x009cab70, twin
 *   0x009cabf0): cmp al,byte [ebp-0x44d] ; jl — SIGNED byte:
 *   (int8)(i & 0xff) < (int8)(count & 0xff) (i is the byte counter,
 *   movsx; wasm32 compare-flip class).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_byte_count_more(uint32_t i_byte,
                                                uint32_t count_byte);

/* ---------------------------------------------------------------------------
 * W19 — 0x9c9340 checksum mode-0 finalize gate (PE 0x009cacb2 cmp
 *   [edi+0xc],0 ; jne skip + 0x009cacbb test dl,dl ; je skip):
 *   (mode == 0) FULL-dword && ((partial & 0xff) != 0) LOW-BYTE — the
 *   pad+fold runs only on the mode-0 ror-add state.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_finalize_needed(uint32_t mode,
                                                uint32_t partial);

/* ---------------------------------------------------------------------------
 * W20 — 0x9c9340 finalize pad bytes (PE 0x009cacbf cmp dl,4 ; jae /
 *   mov al,4 / sub al,dl): ((partial & 0xff) < 4) ? (4 - (partial &
 *   0xff)) : 0 — the memset pad length completing the 4-byte lane.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_finalize_pad_bytes(uint32_t partial);

/* ---------------------------------------------------------------------------
 * W21 — 0x9c9340 finalize fold (PE 0x009cacdc): shr ecx,1 / shl eax,
 *   0x1f / add ecx,eax / add ecx,[edi] — (ror32(acc,1) + lane) u32 wrap
 *   (the mode-0 fold; the two shifts never overlap, sum == rotate).
 *   SAME machine as pgdChecksumFinalize mode-0 (pgd-v30) — GameState
 *   owned pin on the shared fold.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_finalize_ror_add(uint32_t acc,
                                                  uint32_t lane);

/* ---------------------------------------------------------------------------
 * W22 — 0x9c9340 checksum stream word (PE 0x009cad00): mov
 *   [esi+0x1fda4],eax / xor eax,0x96696996 — raw acc stored at
 *   GameState+0x1fda4; the FINAL streamed dword = acc ^ 0x96696996.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_checksum_stream_word(uint32_t acc);

/* ---------------------------------------------------------------------------
 * N1 — 0x683930 name-open gate (PE 0x0068394a): cmp dword [eax],0 ;
 *   jne — FULL-dword presence of the SteamInternal_ContextInit()
 *   first dword.  Nonzero opens the stat-name checksum state (al=1);
 *   zero returns al=0 (ret 8).  0x100 IS present (a byte-narrowed test
 *   would close the gate).  GameState-owned body law; F9's S2 gates
 *   this helper's call-site AL inside host A.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_683930_name_gate_ok(uint32_t steam_ctx_word);

/* --- ABI v5 accessors: write-span loop/decision laws + 0x683930 --- */
uint32_t isaac_game_state_9c8d20_element_loop_more_va(void);
uint32_t isaac_game_state_9c8d20_element_loop_more_va_2(void);
uint32_t isaac_game_state_9c9340_hash_count_gate_va(void);
uint32_t isaac_game_state_9c9340_hash_probe_va(void);
uint32_t isaac_game_state_9c9340_hash_bound_gate_va(void);
uint32_t isaac_game_state_9c9340_value_count_gate_va(void);
uint32_t isaac_game_state_9c9340_value_bound_gate_va(void);
uint32_t isaac_game_state_9c9340_reorder_neg_gate_va(void);
uint32_t isaac_game_state_9c9340_reorder_flush_gate_va(void);
uint32_t isaac_game_state_9c9340_reorder_run_word_va(void);
uint32_t isaac_game_state_9c9340_reorder_final_flush_va(void);
uint32_t isaac_game_state_9c9340_div0xc_count_va(void);
uint32_t isaac_game_state_9c9340_div0xc_resize_gate_va(void);
uint32_t isaac_game_state_9c9340_div0xc_count_byte_va(void);
uint32_t isaac_game_state_9c9340_div0xc_needed_gate_va(void);
uint32_t isaac_game_state_9c9340_div0xc_bound_gate_va(void);
uint32_t isaac_game_state_9c9340_lane7_count_va(void);
uint32_t isaac_game_state_9c9340_lane7_more_va(void);
uint32_t isaac_game_state_9c9340_byte_count_needed_va(void);
uint32_t isaac_game_state_9c9340_byte_count_needed_va_2(void);
uint32_t isaac_game_state_9c9340_byte_count_more_va(void);
uint32_t isaac_game_state_9c9340_byte_count_more_va_2(void);
uint32_t isaac_game_state_9c9340_finalize_mode_gate_va(void);
uint32_t isaac_game_state_9c9340_finalize_partial_gate_va(void);
uint32_t isaac_game_state_9c9340_finalize_pad_va(void);
uint32_t isaac_game_state_9c9340_finalize_fold_va(void);
uint32_t isaac_game_state_9c9340_checksum_store_xor_va(void);
uint32_t isaac_game_state_9c9340_hash_table_off(void);
uint32_t isaac_game_state_9c9340_hash_cap_off(void);
uint32_t isaac_game_state_9c9340_hash_state_off(void);
uint32_t isaac_game_state_9c9340_hash_count_off(void);
uint32_t isaac_game_state_9c9340_value_count_off(void);
uint32_t isaac_game_state_9c9340_value_base_off(void);
uint32_t isaac_game_state_9c9340_holder_base_off(void);
uint32_t isaac_game_state_9c9340_value_stride(void);
uint32_t isaac_game_state_9c9340_holder_stride(void);
uint32_t isaac_game_state_9c9340_reorder_table_off(void);
uint32_t isaac_game_state_9c9340_reorder_entries(void);
uint32_t isaac_game_state_9c9340_reorder_run_marker(void);
uint32_t isaac_game_state_9c9340_div0xc_begin_off(void);
uint32_t isaac_game_state_9c9340_div0xc_magic(void);
uint32_t isaac_game_state_9c9340_div0xc_divisor(void);
uint32_t isaac_game_state_9c9340_div0xc_cap(void);
uint32_t isaac_game_state_9c9340_lane7_base_off(void);
uint32_t isaac_game_state_9c9340_lane7_stride(void);
uint32_t isaac_game_state_9c9340_lane7_count(void);
uint32_t isaac_game_state_9c9340_checksum_off(void);
uint32_t isaac_game_state_9c9340_checksum_xor(void);
uint32_t isaac_game_state_9c9340_state_mode_off(void);
uint32_t isaac_game_state_9c9340_state_partial_off(void);
uint32_t isaac_game_state_9c9340_state_acc_off(void);
uint32_t isaac_game_state_9c9340_state_lane_off(void);
uint32_t isaac_game_state_683930_va(void);
uint32_t isaac_game_state_683930_end_va(void);
uint32_t isaac_game_state_683930_body_bytes(void);
uint32_t isaac_game_state_683930_next_va(void);
uint32_t isaac_game_state_683930_steam_iat(void);
uint32_t isaac_game_state_683930_steam_arg(void);
uint32_t isaac_game_state_683930_steam_gate_va(void);
uint32_t isaac_game_state_683930_caller_count(void);
uint32_t isaac_game_state_683930_caller_va_at(uint32_t index);

/* --- ABI v6: reader row 0x9cb020 format-gate laws R1..R14 (typed-host
 *     lease) + fixed-count serializer loop laws T1..T4 (0x9c9c30 0xe /
 *     0x9c9d66 0x14) ---

   Census (section-notes/game-state-v6-reader/NOTES.md): the recursive
   GameState save-loader 0x9cb020..0x9cb618 (545 insns, 1 ret @0x9cb5fb,
   35 E8 / 31 ind / 39 stores; fastcall-style `bool
   GameState::read(GameStateIO* io)` — ecx=this, edx=io; 4 callers:
   0x9cb5ee SELF-recursion, 0x9cbe40, 0x9cbf83, 0x9d1df0; ZHL EMPTY)
   stays typed-host (vtbl+0x14 stream reads + 0x683410 row writes +
   alloc 0xb187e0 / fail-alloc 0xa23200 / ctors 0x827f70 0x6eee10
   0x4d3080 + self-recursion); the lane-free FORMAT gates compare the
   FULL-dword io+8 format counter UNSIGNED vs 0x3b..0x9e (`cmp dword
   [edi+8],N ; jb` — io+8 set by read_rerun @0x9d7e8f from the file
   header first dword; the 0x9d1de2 caller gates the same field at 0x67
   before invoking).  Byte-gate discipline identical to v1..v5:
   uint32_t params only; byte gates mask & 0xff INSIDE the body; full-
   dword gates unmasked.  The fixed-count loops T1..T4 are the last
   lane-free loop laws inside the write 0x9c9340 peel (bodies stay
   typed-host; same countdown class as W16 lane7). */

/* --- reader row 0x9cb020 identifiers --- */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_VA = 0x009cb020u; /* fastcall-style bool GameState::read(GameStateIO*) (ecx=this, edx=io) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_END_VA = 0x009cb619u; /* first non-body byte (int3 pad 0x9cb619..0x9cb61f) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_BODY_BYTES = 0x5f9u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_NEXT_VA = 0x009cb620u; /* pill-reader body 0x9cb620 (v8-landed: V1..V20) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_FORMAT_OFF = 0x8u; /* io+8 format/row-count counter (set by read_rerun @0x9d7e8f) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_VTBL14_SLOT = 0x14u; /* stream read slot */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_ROW_WRITER_VA = 0x00683410u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_RECURSE_CALL_VA = 0x009cb5eeu; /* self-recursion (the +0x6c sub-object read) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB64_CTOR_VA = 0x00827f70u; /* +0x64 sub-object ctor */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB6C_CTOR_VA = 0x006eee10u; /* +0x6c sub-object ctor */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_FLAGS_OFF = 0x60u; /* sub-object flags byte */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB64_OFF = 0x64u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB6C_OFF = 0x6cu;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB64_ALLOC = 0x24u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB6C_ALLOC = 0x7cu;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_SUB64_BYTES = 0x20u; /* u32 read + 0x20-byte row write into +0x64 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_OLD_COMPAT_TYPE = 0x4u; /* GameState+0x0 == 4 selects the old 8-B store */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_ALLOC_IAT = 0x00b187e0u; /* CRT allocator (shared: IO host A/B) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_FAIL_ALLOC_VA = 0x00a23200u;

/* Reader row format-gate VAs (cmp dword [edi+8],N ; jb unless noted). */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X3B_VA = 0x009cb122u; /* >= 0x3b: flags-byte (+0x60) read */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X46_VA = 0x009cb466u; /* >= 0x46: u16 @+0x20 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X47_VA = 0x009cb179u; /* >= 0x47: u32 @+0x1c */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X5B_VA = 0x009cb254u; /* >= 0x5b: u32-direct @+0x30 arm */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X67_VA = 0x009cb500u; /* >= 0x67: +0x60 flags processing (sub-object reads) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X6C_VA = 0x009cb4d0u; /* >= 0x6c: u32 @+0x5c */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X88_VA = 0x009cb1cbu; /* >= 0x88: u32 @+0x24 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X96_VA = 0x009cb3aeu; /* >= 0x96: u64 @+0x48 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_GATE_0X9E_VA = 0x009cb49au; /* >= 0x9e: float @+0x58 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_OLD_U64_GATE_VA = 0x009cb302u; /* < 0x47 (jae skip): old 8-B compat read */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_BIT0_GATE_VA = 0x009cb53bu; /* test al,1 ; je: sub +0x64 present */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_BIT1_GATE_VA = 0x009cb5adu; /* test al,2 ; je: sub +0x6c present */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_BYTE_TO_BOOL_VA = 0x009cb2aau; /* xor/setne: byte -> u32 0/1 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_TYPE4_GATE_VA = 0x009cb33bu; /* cmp [esi],4 ; jne: old 8-B store gate */
/* 4 direct rel32 callers (0x9cb5ee = SELF-recursion). */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_CALLER_COUNT = 4u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_CALLER_VA_0 = 0x009cb5eeu; /* self (bit1 sub-object read) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_CALLER_VA_1 = 0x009cbe40u; /* 0x9cb620 body: sub array +0x74, stride 0x78 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_CALLER_VA_2 = 0x009cbf83u; /* 0x9cb620 body: sub array +0x88, stride 0x78 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB020_CALLER_VA_3 = 0x009d1df0u; /* stack-local GameState; pre-gates io+8 >= 0x67 @0x9d1de2 */

/* --- fixed-count serializer loops (write-span peel; bodies typed-host) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9C9C30_FIXED_COUNT = 0xeu; /* 0xe-iteration u32 loop at GameState+0x164 (stride 4) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9C30_COUNT_STORE_VA = 0x009c9c24u; /* mov [ebp-0x458],0xe */
static constexpr uint32_t ISAAC_GAME_STATE_9C9C30_LOOP_HEAD_VA = 0x009c9c30u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9C30_MORE_VA = 0x009c9c57u; /* sub [ebp-0x458],1 ; jne 0x9c9c30 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9C30_BASE_OFF = 0x164u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9C30_STRIDE = 0x4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_FIXED_COUNT = 0x14u; /* 0x14-iteration 0x9c8d20 element loop */
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_COUNT_STORE_VA = 0x009c9d6cu; /* mov [ebp-0x458],0x14 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_LOOP_HEAD_VA = 0x009c9d84u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_MORE_VA = 0x009c9d95u; /* sub [ebp-0x458],1 ; jne 0x9c9d84 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_VALUE_BASE_OFF = 0x16e08u; /* value array base (stride 0xb8) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_HOLDER_BASE_OFF = 0x1942cu; /* holder array base (stride 0xc) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_VALUE_STRIDE = 0xb8u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9D66_HOLDER_STRIDE = 0xcu;

/* ---------------------------------------------------------------------------
 * R1 — reader format gate 0x3b (PE 0x009cb122): cmp dword [edi+8],0x3b ;
 *   jb skip — FULL-dword UNSIGNED format >= 0x3b gates the +0x60
 *   flags-byte read (1 B via vtbl+0x14 + row write).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x3b(uint32_t format);

/* ---------------------------------------------------------------------------
 * R2 — reader format gate 0x46 (PE 0x009cb466): FULL-dword UNSIGNED
 *   format >= 0x46 gates the +0x20 u16 read (movzx + 2-B row write).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x46(uint32_t format);

/* ---------------------------------------------------------------------------
 * R3 — reader format gate 0x47 (PE 0x009cb179): FULL-dword UNSIGNED
 *   format >= 0x47 gates the +0x1c u32 read.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x47(uint32_t format);

/* ---------------------------------------------------------------------------
 * R4 — reader format gate 0x5b (PE 0x009cb254): FULL-dword UNSIGNED
 *   format >= 0x5b selects the u32-direct arm for +0x30 (else the
 *   byte->bool arm R13).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x5b(uint32_t format);

/* ---------------------------------------------------------------------------
 * R5 — reader format gate 0x67 (PE 0x009cb500): FULL-dword UNSIGNED
 *   format >= 0x67 gates the +0x60 flags PROCESSING (bit0/bit1 sub-
 *   object reads; else pop/ret al=1).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x67(uint32_t format);

/* ---------------------------------------------------------------------------
 * R6 — reader format gate 0x6c (PE 0x009cb4d0): FULL-dword UNSIGNED
 *   format >= 0x6c gates the +0x5c u32 read.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x6c(uint32_t format);

/* ---------------------------------------------------------------------------
 * R7 — reader format gate 0x88 (PE 0x009cb1cb): FULL-dword UNSIGNED
 *   format >= 0x88 gates the +0x24 u32 read (the v4-io "presence gate").
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x88(uint32_t format);

/* ---------------------------------------------------------------------------
 * R8 — reader format gate 0x96 (PE 0x009cb3ae): FULL-dword UNSIGNED
 *   format >= 0x96 gates the +0x48 u64 read (8 B).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x96(uint32_t format);

/* ---------------------------------------------------------------------------
 * R9 — reader format gate 0x9e (PE 0x009cb49a): FULL-dword UNSIGNED
 *   format >= 0x9e gates the +0x58 float read.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_gate_0x9e(uint32_t format);

/* ---------------------------------------------------------------------------
 * R10 — reader OLD-format u64 gate (PE 0x009cb302 cmp [edi+8],0x47 ;
 *   jae skip): FULL-dword UNSIGNED format < 0x47 opens the old 8-B
 *   compat read (twin threshold of R3, opposite polarity).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_old_u64_gate(uint32_t format);

/* ---------------------------------------------------------------------------
 * R11 — reader flags bit0 (PE 0x009cb53b test al,1 ; je): byte-gate
 *   (flags & 0x1) != 0 opens the +0x64 sub-object (alloc 0x24 + ctor
 *   0x827f70 + u32 read + 0x20-B row write).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_sub_0x64_present(uint32_t flags_byte);

/* ---------------------------------------------------------------------------
 * R12 — reader flags bit1 (PE 0x009cb5ad test al,2 ; je): byte-gate
 *   (flags & 0x2) != 0 opens the +0x6c sub-object (alloc 0x7c + ctor
 *   0x6eee10 + RECURSIVE read).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_sub_0x6c_present(uint32_t flags_byte);

/* ---------------------------------------------------------------------------
 * R13 — reader old byte->bool (PE 0x009cb2aa xor/setne): byte-gate
 *   ((byte & 0xff) != 0) ? 1 : 0 — the format<0x5b +0x30 conversion.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_old_byte_to_bool(uint32_t byte);

/* ---------------------------------------------------------------------------
 * R14 — reader old u64 type-4 store gate (PE 0x009cb33b cmp [esi],4 ;
 *   jne): FULL-dword equality (field0 == 4) — the old-format 8-B value
 *   stores +0x10/+0x14 and zeroes +0x18/+0x1c only when GameState+0x0
 *   equals the OLD_COMPAT_TYPE 4.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb020_old_u64_type_4(uint32_t field0);

/* ---------------------------------------------------------------------------
 * T1 — fixed-count loop 0x9c9c30 count (PE 0x009c9c24): constant 0xe —
 *   the 0xe-iteration u32 array loop at GameState+0x164 (stride 4;
 *   vtbl+0x1c stream write + row write per element).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9c30_fixed_count(void);

/* ---------------------------------------------------------------------------
 * T2 — fixed-count loop 0x9c9c30 bound (PE 0x009c9c57 sub,1 ; jne 0x9c9c30):
 *   ((remaining - 1) != 0) u32 — the countdown 0xe..1 (W16 lane7 class).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9c30_loop_more(uint32_t remaining);

/* ---------------------------------------------------------------------------
 * T3 — fixed-count loop 0x9c9d66 count (PE 0x009c9d6c): constant 0x14 —
 *   the 0x14-iteration 0x9c8d20 element loop (values +0x16e08 stride
 *   0xb8, holders +0x1942c stride 0xc).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9d66_fixed_count(void);

/* ---------------------------------------------------------------------------
 * T4 — fixed-count loop 0x9c9d66 bound (PE 0x009c9d95 sub,1 ; jne 0x9c9d84):
 *   ((remaining - 1) != 0) u32 — the countdown 0x14..1.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9d66_loop_more(uint32_t remaining);

/* --- ABI v6 accessors: reader row 0x9cb020 + fixed-count loops --- */
uint32_t isaac_game_state_9cb020_end_va(void);
uint32_t isaac_game_state_9cb020_body_bytes(void);
uint32_t isaac_game_state_9cb020_next_va(void);
uint32_t isaac_game_state_9cb020_format_off(void);
uint32_t isaac_game_state_9cb020_vtbl14_slot(void);
uint32_t isaac_game_state_9cb020_row_writer_va(void);
uint32_t isaac_game_state_9cb020_recurse_call_va(void);
uint32_t isaac_game_state_9cb020_sub64_ctor_va(void);
uint32_t isaac_game_state_9cb020_sub6c_ctor_va(void);
uint32_t isaac_game_state_9cb020_flags_off(void);
uint32_t isaac_game_state_9cb020_sub64_off(void);
uint32_t isaac_game_state_9cb020_sub6c_off(void);
uint32_t isaac_game_state_9cb020_sub64_alloc(void);
uint32_t isaac_game_state_9cb020_sub6c_alloc(void);
uint32_t isaac_game_state_9cb020_sub64_bytes(void);
uint32_t isaac_game_state_9cb020_old_compat_type(void);
uint32_t isaac_game_state_9cb020_alloc_iat(void);
uint32_t isaac_game_state_9cb020_fail_alloc_va(void);
uint32_t isaac_game_state_9cb020_gate_0x3b_va(void);
uint32_t isaac_game_state_9cb020_gate_0x46_va(void);
uint32_t isaac_game_state_9cb020_gate_0x47_va(void);
uint32_t isaac_game_state_9cb020_gate_0x5b_va(void);
uint32_t isaac_game_state_9cb020_gate_0x67_va(void);
uint32_t isaac_game_state_9cb020_gate_0x6c_va(void);
uint32_t isaac_game_state_9cb020_gate_0x88_va(void);
uint32_t isaac_game_state_9cb020_gate_0x96_va(void);
uint32_t isaac_game_state_9cb020_gate_0x9e_va(void);
uint32_t isaac_game_state_9cb020_old_u64_gate_va(void);
uint32_t isaac_game_state_9cb020_bit0_gate_va(void);
uint32_t isaac_game_state_9cb020_bit1_gate_va(void);
uint32_t isaac_game_state_9cb020_byte_to_bool_va(void);
uint32_t isaac_game_state_9cb020_type4_gate_va(void);
uint32_t isaac_game_state_9c9c30_fixed_count_va(void);
uint32_t isaac_game_state_9c9c30_loop_head_va(void);
uint32_t isaac_game_state_9c9c30_more_va(void);
uint32_t isaac_game_state_9c9c30_base_off(void);
uint32_t isaac_game_state_9c9c30_stride(void);
uint32_t isaac_game_state_9c9d66_fixed_count_va(void);
uint32_t isaac_game_state_9c9d66_loop_head_va(void);
uint32_t isaac_game_state_9c9d66_more_va(void);
uint32_t isaac_game_state_9c9d66_value_base_off(void);
uint32_t isaac_game_state_9c9d66_holder_base_off(void);
uint32_t isaac_game_state_9c9d66_value_stride(void);
uint32_t isaac_game_state_9c9d66_holder_stride(void);

/* --- ABI v7: write-loop leftovers — 0x1fb reorder-table loop bound +
 *     value-word laws X1..X2 and the 7-lane 0x320 per-lane geometry
 *     laws Y1..Y5 (census game-state-v6-loops/NOTES.md; body stays
 *     typed-host; the reorder/7-lane regions are lane-free — F9's v6
 *     rows 0x9cb020 / 0x9c9c30 / 0x9c9d66 untouched) --- */

/* Reorder-table loop count init 0x1fb (0x9c9db4 mov [ebp-0x458],0x1fb);
   loop 0x9c9dc0..0x9c9e05; X1 pins: 0x9c9dfe sub [ebp-0x458],1 +
   0x9c9e05 jne 0x9c9dc0.  X2 pins: 0x9c9dc2 movzx edi,ax + 0x9c9df0
   mov word [ebp+eax*2-0x42c],di. */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_LOOP_MORE_VA = 0x009c9dfeu;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_LOOP_MORE_JNE_VA = 0x009c9e05u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_VALUE_WORD_VA = 0x009c9dc2u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_REORDER_VALUE_STORE_VA = 0x009c9df0u;

/* 7-lane loop: lane-0 base add 0x9caa97 (add eax,0x1ead0) + stride add
   0x9cac1c (add esi,0x320); per-lane element geometry (loop-1: value
   lea 0x9cab43 / imul 0x9cab49 / add 0x9cab50, holder leas
   0x9cab53/0x9cab56/0x9cab59; loop-2: value imul 0x9cabc4 / addc
   0x9cabce / addesi 0x9cabd3, holder sub 0x9cabca / leas
   0x9cabd6/0x9cabd9; idx movsx 0x9cab40 / 0x9cabc1). */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_LANE_BASE_VA = 0x009caa97u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_STRIDE_ADD_VA = 0x009cac1cu;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_VALUE_VA = 0x009cab43u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_HOLDER_VA = 0x009cab53u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_VALUE_VA = 0x009cabc4u;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_HOLDER_VA = 0x009cabcau;
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_VALUE_OFF = 0xfffffce4u; /* -0x31c */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_HOLDER_OFF = 0xfffffe54u; /* -0x1ac */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_VALUE_OFF = 0xfffffe6cu; /* -0x194 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_HOLDER_OFF = 0xffffffdcu; /* -0x24 */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_1 = 0xfffffffc; /* -4 (recipe rail) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_2 = 0xfffffff4; /* -0xc (count1 byte) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_3 = 0xfffffff8; /* -8 (count2 byte) */
static constexpr uint32_t ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_4 = 0x0u;

/* ---------------------------------------------------------------------------
 * X1 — 0x9c9340 reorder-table loop bound (PE 0x009c9dfe sub dword
 *   [ebp-0x458],1 ; 0x009c9e05 jne): ((remaining - 1u) != 0u) u32 — the
 *   0x1fb-entry countdown (init @0x9c9db4; runs 0x1fb times; the dec
 *   reaches 0 after the last).  W16 countdown shape; 0x100 IS present
 *   (a byte-narrow decay would exit at remaining 0x100).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9c9340_reorder_loop_more(uint32_t remaining);

/* ---------------------------------------------------------------------------
 * X2 — 0x9c9340 reorder value word (PE 0x009c9dc2 movzx edi,ax ; store
 *   0x009c9df0 mov word [..],di): entry & 0xffff — the u16 value word
 *   streamed for every non-negative entry (word law; 0x10000 -> 0).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_reorder_value_word(uint32_t entry);

/* ---------------------------------------------------------------------------
 * Y1 — 0x9c9340 7-lane lane base offset (PE 0x009caa97 add eax,0x1ead0 ;
 *   0x009cac1c add esi,0x320): 0x1ead0 + lane * 0x320 u32 wrap — the
 *   per-lane base offset from GameState base (lane counter 0..6, W15/W16).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_lane7_lane_base(uint32_t lane);

/* ---------------------------------------------------------------------------
 * Y2 — 0x9c9340 loop-1 value ptr (PE 0x009cab43 lea edx,[esi-0x31c] /
 *   0x009cab49 imul eax,ecx,0xb8 / 0x009cab50 add eax,edx; idx movsx
 *   0x009cab40): lane_base + (int32)(int8)(i & 0xff) * 0xb8 - 0x31c u32
 *   wrap — the loop-1 0x9c8d20 value arg (domain i = 0..count-1 with
 *   count <= 0x7f, W17/W18, so the i8 sign-extend equals i there; the
 *   exact machine form is kept for i >= 0x80).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_lane7_value1_ptr(uint32_t lane_base,
                                                  uint32_t i);

/* ---------------------------------------------------------------------------
 * Y3 — 0x9c9340 loop-1 holder ptr (PE 0x009cab53 lea eax,[ecx+0x2e] /
 *   0x009cab56 lea eax,[ecx+eax*2] / 0x009cab59 lea eax,[edx+eax*4],
 *   edx = lane_base - 0x31c): lane_base + (int32)(int8)(i & 0xff) * 0xc
 *   - 0x1ac u32 wrap — the loop-1 0x9c8d20 holder arg ((3i+0x5c)*4 +
 *   lane - 0x31c == lane + 12i + 0x170 - 0x31c).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_lane7_holder1_ptr(uint32_t lane_base,
                                                   uint32_t i);

/* ---------------------------------------------------------------------------
 * Y4 — 0x9c9340 loop-2 value ptr (PE 0x009cabc4 imul eax,ecx,0xb8 /
 *   0x009cabce add eax,0xfffffe6c / 0x009cabd3 add eax,esi; idx movsx
 *   0x009cabc1): lane_base + (int32)(int8)(i & 0xff) * 0xb8 - 0x194 u32
 *   wrap — the loop-2 0x9c8d20 value arg.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_lane7_value2_ptr(uint32_t lane_base,
                                                  uint32_t i);

/* ---------------------------------------------------------------------------
 * Y5 — 0x9c9340 loop-2 holder ptr (PE 0x009cabca add ecx,-3 / 0x009cabd6
 *   lea eax,[ecx+ecx*2] / 0x009cabd9 lea eax,[esi+eax*4]):
 *   lane_base + (int32)(int8)(i & 0xff) * 0xc - 0x24 u32 wrap — the
 *   loop-2 0x9c8d20 holder arg (12*(i-3) + lane == lane + 12i - 0x24).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9c9340_lane7_holder2_ptr(uint32_t lane_base,
                                                   uint32_t i);

/* --- ABI v7 accessors: reorder-table + 7-lane per-lane laws --- */
uint32_t isaac_game_state_9c9340_reorder_loop_more_va(void);
uint32_t isaac_game_state_9c9340_reorder_loop_more_va_2(void);
uint32_t isaac_game_state_9c9340_reorder_value_word_va(void);
uint32_t isaac_game_state_9c9340_reorder_value_word_va_2(void);
uint32_t isaac_game_state_9c9340_lane7_lane_base_va(void);
uint32_t isaac_game_state_9c9340_lane7_lane_base_va_2(void);
uint32_t isaac_game_state_9c9340_lane7_elem1_value_va(void);
uint32_t isaac_game_state_9c9340_lane7_elem1_holder_va(void);
uint32_t isaac_game_state_9c9340_lane7_elem2_value_va(void);
uint32_t isaac_game_state_9c9340_lane7_elem2_holder_va(void);
uint32_t isaac_game_state_9c9340_lane7_elem1_value_off(void);
uint32_t isaac_game_state_9c9340_lane7_elem1_holder_off(void);
uint32_t isaac_game_state_9c9340_lane7_elem2_value_off(void);
uint32_t isaac_game_state_9c9340_lane7_elem2_holder_off(void);
uint32_t isaac_game_state_9c9340_lane7_byte_off_1(void);
uint32_t isaac_game_state_9c9340_lane7_byte_off_2(void);
uint32_t isaac_game_state_9c9340_lane7_byte_off_3(void);
uint32_t isaac_game_state_9c9340_lane7_byte_off_4(void);

/* --- ABI v8: pill reader 0x9cb620..0x9cc18d laws V1..V20 (typed-host
 *     lease) ---

   Census (section-notes/game-state-v8-body/NOTES.md): the per-element
   GameState pill reader 0x9cb620..0x9cc18d (SEH 0xb0f300 + GS cookie
   0xbf93b4; thiscall 3-stack-arg `bool GameState::read_pill(holders,
   values, GameStateIO* io)` — ecx=this, [ebp+8]=holders arg (stride
   0xc), [ebp+0xc]=values arg (stride 0xb8), [ebp+0x10]=io; 4 direct
   rel32 callers 0x9ccf75 / 0x9ccfe8 / 0x9ce33f / 0x9ce3ce — ALL inside
   the giant 0x9cc1a0..0x9ce596 read entry; ZHL EMPTY) stays typed-host
   (vtbl+0x14 stream reads + 0x683410 row writes + 0x9c86e0 serializer
   row + 0x7dc9b0/0x424540/0x4e45c0 vector ops + 0x7e90f0 string copy +
   the TWO reader-row calls 0x9cb020 @0x9cbe40 (+0x74 array) /
   @0x9cbf83 (+0x88 array)); the lane-free GATES land: the io vtbl+0x10
   ready gate (LOW-BYTE, 4 sites), eight FULL-dword UNSIGNED format
   gates on the TWO counters (io+8: >= 0x3d/0x4b/0x7b/0x7d — the SAME
   field as the reader row R1..R10; GameState+0x1fdf0: >= 0x21/0x3f/
   0x49/0x82), FULL-dword count gates (slot count / +0x74 array / +0x88
   array / string-copy ptr), the SIGNED setg slot bool ((int64)(int32)
   count > 0 — wasm32 compare-flip class), UNSIGNED loop bounds (the
   0x3800-byte 448x0x20 slot table; the 0x78-stride +0x74/+0x88 arrays),
   the fixed-8 u16 stream loop (V18/V19, W16 countdown class) and the
   flag-byte gate (6 bit-OR sites into the +0x44 flags dword; LOW-BYTE).
   Byte-gate discipline identical to v1..v7 (uint32_t params only;
   byte gates mask & 0xff INSIDE the body). */

/* --- pill reader 0x9cb620 identifiers --- */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_VA = 0x009cb620u; /* thiscall bool read_pill(holders, values, io) (lea-corrected caller census; ZHL EMPTY) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_END_VA = 0x009cc18eu; /* first non-body byte (int3 pad 0x9cc18e..0x9cc19f) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_BODY_BYTES = 0xa6eu;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_NEXT_VA = 0x009cc1a0u; /* the giant read entry (SEH 0xb0f33b; owns the 4 read_pill callers + Delete @0x9cc254) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_SEH_HANDLER_DAT = 0x00b0f300u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_FORMAT_OFF = 0x8u; /* io+8 format/row-count counter (shared field: reader row R1..R10, read_rerun @0x9d7e8f, 0x9cc1a0 entry @0x9cc352) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_FORMAT_OFF = 0x1fdf0u; /* GameState format counter (stored into io+8 by the 0x9cc1a0 reader) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_VTBL10_SLOT = 0x10u; /* io-ready call slot (nonzero AL -> FAIL epilogue) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_VTBL14_SLOT = 0x14u; /* stream read slot (shared: reader row) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ROW_WRITER_VA = 0x00683410u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_SERIALIZER_ROW_CALL_VA = 0x009cb66cu; /* -> 0x9c86e0 (holders/io serializer row) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_READER_ROW_CALL_74_VA = 0x009cbe40u; /* -> 0x9cb020 (+0x74 array element) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_READER_ROW_CALL_88_VA = 0x009cbf83u; /* -> 0x9cb020 (+0x88 array element) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_VECTOR_CTOR_VA = 0x007dc9b0u; /* +0x74/+0x88 vector ctor (count -> [ebp-0x24]/[ebp-0x28]) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_VECTOR_INIT_VA = 0x00424540u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_LIST_INSERT_VA = 0x004e45c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_STRING_COPY_VA = 0x007e90f0u; /* format<0x4b +0x64 string arm */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_STRING_EMPTY_DAT = 0x00b1f7e0u; /* movq xmm0 source (empty-string layout) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAGS_OFF = 0x44u; /* the bit-OR flags dword */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT_0 = 0x1u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT_1 = 0x2u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT_2 = 0x4u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT_3 = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT_4 = 0x10u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT_5 = 0x20u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_TABLE_OFF = 0x68u; /* the 0x3800-byte slot table base (448 slots x 0x20) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_TABLE_BYTES = 0x3800u; /* shared value: GS9C8D20_TABLE_BYTES */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_TABLE_STRIDE = 0x20u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_TABLE_SLOTS = 0x1c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY74_OFF = 0x74u; /* 0x78-stride element array (reader row per element) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY88_OFF = 0x88u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY_STRIDE = 0x78u; /* shared value: GS9C8D20_ELEMENT_STRIDE */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FIXED8_COUNT = 0x8u; /* the fixed u16 stream loop (format<0x49 arm tail) */

/* Law gate VAs (PE pins; bytes in the test "PE byte-truth" block). */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA = 0x009cb65du; /* test al,al ; jne FAIL (twins 0x9cbe30/0x9cbec0/0x9cbf70) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA_2 = 0x009cbe30u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA_3 = 0x009cbec0u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA_4 = 0x009cbf70u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_GATE_0X3D_VA = 0x009cba1bu; /* cmp [esi+8],0x3d ; jb */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_GATE_0X4B_VA = 0x009cbb0au;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_GATE_0X7B_VA = 0x009cbb77u; /* jb @0x9cbb85 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_GATE_0X7B_JNE_VA = 0x009cbb85u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_GATE_0X7D_VA = 0x009cb671u; /* jb @0x9cb67e */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_IO_GATE_0X7D_JNE_VA = 0x009cb67eu;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_GATE_0X21_VA = 0x009cbd86u; /* cmp [eax+0x1fdf0],0x21 ; jb @0x9cbd8d */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_GATE_0X3F_VA = 0x009cb835u; /* jb @0x9cb83f */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_GATE_0X3F_JNE_VA = 0x009cb83fu;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_GATE_0X49_VA = 0x009cbfadu; /* jb @0x9cbfb4 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_GATE_0X49_JNE_VA = 0x009cbfb4u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_GS_GATE_0X82_VA = 0x009cb875u; /* jb @0x9cb87f */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_SLOT_COUNT_GATE_VA = 0x009cbbb1u; /* test eax,eax ; je rel32 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_STRING_COPY_GATE_VA = 0x009cbb3au; /* test eax,eax ; je +0x22 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_SLOT_POSITIVE_VA = 0x009cbc57u; /* cmp [ecx+0xc],0 ; setg al ; mov [ecx+0x18],al */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_SLOT_MORE_VA = 0x009cbdc0u; /* cmp ecx,0x3800 ; jb 0x9cbb70 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY74_NEEDED_VA = 0x009cbe08u; /* cmp [ebp-0x24],0 ; jbe */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY74_MORE_VA = 0x009cbe50u; /* cmp eax,[ebp-0x24] ; jb 0x9cbe20 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY88_NEEDED_VA = 0x009cbf43u; /* cmp [ebp-0x28],0 ; jbe */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_ARRAY88_MORE_VA = 0x009cbf93u; /* cmp eax,[ebp-0x28] ; jb 0x9cbf60 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FIXED8_COUNT_STORE_VA = 0x009cc11bu; /* mov [ebp+0x10],8 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FIXED8_MORE_VA = 0x009cc145u; /* sub [ebp+0x10],1 ; jne 0x9cc122 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_GATE_VA = 0x009cb93bu; /* cmp byte [ebp+0x13],0 ; je ; or [edi+0x44],1 (bit0) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT1_OR_VA = 0x009cb994u; /* or [edi],2 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT2_OR_VA = 0x009cb9c0u; /* or [edi],4 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT3_OR_VA = 0x009cb9ecu; /* or [edi],8 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT4_OR_VA = 0x009cba18u; /* or [edi],0x10 */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_FLAG_BIT5_OR_VA = 0x009cba72u; /* or [ecx],0x20 (after mov ecx,[ebp-0x1c] @0x9cba6f) */

/* 4 direct rel32 callers (census-callers-fixed.py, corrected). */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_CALLER_COUNT = 4u;
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_CALLER_VA_0 = 0x009ccf75u; /* 0x9cc1a0 read entry: value loop (+0x1a0/+0x17c68 pairs) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_CALLER_VA_1 = 0x009ccfe8u; /* 0x9cc1a0 read entry: 0x1fb-value loop (+0x16e08/+0x1942c pairs) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_CALLER_VA_2 = 0x009ce33fu; /* 0x9cc1a0 read entry: 7-lane loop-1 element (v7 Y2/Y3 read twin) */
static constexpr uint32_t ISAAC_GAME_STATE_9CB620_CALLER_VA_3 = 0x009ce3ceu; /* 0x9cc1a0 read entry: 7-lane loop-2 element (v7 Y4/Y5 read twin) */

/* ---------------------------------------------------------------------------
 * V1 — pill reader io-ready gate (PE 0x009cb65d test al,al ; jne FAIL;
 *   twins 0x009cbe30/0x009cbec0/0x009cbf70 before each sub-array loop):
 *   LOW-BYTE ((open_al & 0xff) == 0) — the io vtbl+0x10 result; nonzero
 *   AL (byte) jumps the FAIL epilogue (xor al,al ; ret 0xc).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_io_ready(uint32_t open_al);

/* ---------------------------------------------------------------------------
 * V2..V5 — io+8 format gates (PE 0x009cba1b cmp [esi+8],0x3d ; jb /
 *   0x009cbb0a 0x4b / 0x009cbb77 0x7b / 0x009cb671 0x7d): FULL-dword
 *   UNSIGNED format >= N — the same io+8 counter the reader row R1..R10
 *   compare.  V2 gates the +0x4c u32 read, V3 the +0x64 u32 read (else
 *   the string-copy arm), V4 the slot-count u16 arm, V5 the head
 *   u16-pair+byte arm.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_io_gate_0x3d(uint32_t format);
int32_t isaac_game_state_9cb620_io_gate_0x4b(uint32_t format);
int32_t isaac_game_state_9cb620_io_gate_0x7b(uint32_t format);
int32_t isaac_game_state_9cb620_io_gate_0x7d(uint32_t format);

/* ---------------------------------------------------------------------------
 * V6..V9 — GameState+0x1fdf0 format gates (PE 0x009cbd86 cmp
 *   [eax+0x1fdf0],0x21 ; jb / 0x009cb835 0x3f / 0x009cbfad 0x49 /
 *   0x009cb875 0x82): FULL-dword UNSIGNED format >= N on the gs
 *   counter (stored into io+8 by the 0x9cc1a0 reader).  V6 gates the
 *   per-slot +0x14 u32 read, V7 the +0x44 flags u32 read (else zero +
 *   byte + bit0 OR), V8 the +0xae/+0xac u16-pair read (else the
 *   u32 + fixed-8 arm), V9 the +0x48/+0x4a u16-pair read.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_gs_gate_0x21(uint32_t format);
int32_t isaac_game_state_9cb620_gs_gate_0x3f(uint32_t format);
int32_t isaac_game_state_9cb620_gs_gate_0x49(uint32_t format);
int32_t isaac_game_state_9cb620_gs_gate_0x82(uint32_t format);

/* ---------------------------------------------------------------------------
 * V10 — slot count gate (PE 0x009cbbb1 test eax,eax ; je rel32):
 *   FULL-dword count != 0 — the per-slot element count (u16 movzx or
 *   u32 arm) gates the slot body (zero skips to the 0x20 advance).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_slot_count_needed(uint32_t count);

/* ---------------------------------------------------------------------------
 * V11 — string-copy ptr gate (PE 0x009cbb3a test eax,eax ; je +0x22):
 *   FULL-dword ptr != 0 — the format<0x4b +0x64 string arm: nonzero
 *   +0x60 ptr selects the 0x7e90f0 string copy (else zero).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_string_copy_needed(uint32_t ptr_60);

/* ---------------------------------------------------------------------------
 * V12 — slot bool store (PE 0x009cbc57 cmp [ecx+0xc],0 ; 0x009cbc5f
 *   setg al ; 0x009cbc62 mov [ecx+0x18],al): SIGNED ((int64_t)(int32_t)
 *   count > 0) — the slot +0x18 bool byte (0x80000000..0xffffffff are
 *   NEGATIVE -> 0; wasm32 compare-flip class, i64 sign-extend form).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_slot_positive(uint32_t count);

/* ---------------------------------------------------------------------------
 * V13 — slot-table loop bound (PE 0x009cbdc0 cmp ecx,0x3800 ; jb
 *   0x9cbb70): UNSIGNED byte_off < 0x3800 — the 448-slot x 0x20 table
 *   loop (entry = [edi+0x68] + byte_off, byte_off += 0x20).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_slot_more(uint32_t byte_off);

/* ---------------------------------------------------------------------------
 * V14..V17 — the +0x74/+0x88 0x78-stride sub-array gates (PE 0x009cbe08
 *   cmp [ebp-0x24],0 ; jbe / 0x009cbe50 cmp eax,[ebp-0x24] ; jb /
 *   0x009cbf43 / 0x009cbf93): V14/V16 FULL-dword count != 0 entry;
 *   V15/V17 UNSIGNED idx < count bound (reader row 0x9cb020 per
 *   element @0x9cbe40 / @0x9cbf83).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_array74_needed(uint32_t count);
int32_t isaac_game_state_9cb620_array74_more(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9cb620_array88_needed(uint32_t count);
int32_t isaac_game_state_9cb620_array88_more(uint32_t idx, uint32_t count);

/* ---------------------------------------------------------------------------
 * V18 — fixed-8 u16 stream loop count (PE 0x009cc11b mov [ebp+0x10],8):
 *   constant 8 — the format<0x49 arm tail.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9cb620_fixed8_count(void);

/* ---------------------------------------------------------------------------
 * V19 — fixed-8 loop bound (PE 0x009cc145 sub [ebp+0x10],1 ; 0x009cc154
 *   jne): ((remaining - 1u) != 0u) u32 — the countdown 8..1 (W16 lane7 /
 *   T2 / X1 countdown class).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_fixed8_more(uint32_t remaining);

/* ---------------------------------------------------------------------------
 * V20 — flag-byte gate (PE 0x009cb93b cmp byte [ebp+0x13],0 ; je ; or
 *   [edi+0x44],1; or-bit twins 0x009cb994/0x009cb9c0/0x009cb9ec/
 *   0x009cba18/0x009cba6f): LOW-BYTE ((byte & 0xff) != 0) — each of the
 *   6 flag-bit OR stores into the +0x44 flags dword (bits 0x1..0x20)
 *   is gated on the same streamed byte (0x100 -> byte 0 -> bit stays
 *   clear).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9cb620_flag_byte_set(uint32_t byte);

/* --- ABI v8 accessors: pill reader 0x9cb620 --- */
uint32_t isaac_game_state_9cb620_va(void);
uint32_t isaac_game_state_9cb620_end_va(void);
uint32_t isaac_game_state_9cb620_body_bytes(void);
uint32_t isaac_game_state_9cb620_next_va(void);
uint32_t isaac_game_state_9cb620_seh_handler_dat(void);
uint32_t isaac_game_state_9cb620_io_format_off(void);
uint32_t isaac_game_state_9cb620_gs_format_off(void);
uint32_t isaac_game_state_9cb620_io_vtbl10_slot(void);
uint32_t isaac_game_state_9cb620_vtbl14_slot(void);
uint32_t isaac_game_state_9cb620_row_writer_va(void);
uint32_t isaac_game_state_9cb620_serializer_row_call_va(void);
uint32_t isaac_game_state_9cb620_reader_row_call_74_va(void);
uint32_t isaac_game_state_9cb620_reader_row_call_88_va(void);
uint32_t isaac_game_state_9cb620_vector_ctor_va(void);
uint32_t isaac_game_state_9cb620_vector_init_va(void);
uint32_t isaac_game_state_9cb620_list_insert_va(void);
uint32_t isaac_game_state_9cb620_string_copy_va(void);
uint32_t isaac_game_state_9cb620_string_empty_dat(void);
uint32_t isaac_game_state_9cb620_flags_off(void);
uint32_t isaac_game_state_9cb620_flag_bit_0(void);
uint32_t isaac_game_state_9cb620_flag_bit_1(void);
uint32_t isaac_game_state_9cb620_flag_bit_2(void);
uint32_t isaac_game_state_9cb620_flag_bit_3(void);
uint32_t isaac_game_state_9cb620_flag_bit_4(void);
uint32_t isaac_game_state_9cb620_flag_bit_5(void);
uint32_t isaac_game_state_9cb620_table_off(void);
uint32_t isaac_game_state_9cb620_table_bytes(void);
uint32_t isaac_game_state_9cb620_table_stride(void);
uint32_t isaac_game_state_9cb620_table_slots(void);
uint32_t isaac_game_state_9cb620_array74_off(void);
uint32_t isaac_game_state_9cb620_array88_off(void);
uint32_t isaac_game_state_9cb620_array_stride(void);
uint32_t isaac_game_state_9cb620_fixed8_count_va(void);
uint32_t isaac_game_state_9cb620_fixed8_more_va(void);
uint32_t isaac_game_state_9cb620_io_ready_gate_va(void);
uint32_t isaac_game_state_9cb620_io_ready_gate_va_2(void);
uint32_t isaac_game_state_9cb620_io_ready_gate_va_3(void);
uint32_t isaac_game_state_9cb620_io_ready_gate_va_4(void);
uint32_t isaac_game_state_9cb620_io_gate_0x3d_va(void);
uint32_t isaac_game_state_9cb620_io_gate_0x4b_va(void);
uint32_t isaac_game_state_9cb620_io_gate_0x7b_va(void);
uint32_t isaac_game_state_9cb620_io_gate_0x7b_jne_va(void);
uint32_t isaac_game_state_9cb620_io_gate_0x7d_va(void);
uint32_t isaac_game_state_9cb620_io_gate_0x7d_jne_va(void);
uint32_t isaac_game_state_9cb620_gs_gate_0x21_va(void);
uint32_t isaac_game_state_9cb620_gs_gate_0x3f_va(void);
uint32_t isaac_game_state_9cb620_gs_gate_0x3f_jne_va(void);
uint32_t isaac_game_state_9cb620_gs_gate_0x49_va(void);
uint32_t isaac_game_state_9cb620_gs_gate_0x49_jne_va(void);
uint32_t isaac_game_state_9cb620_gs_gate_0x82_va(void);
uint32_t isaac_game_state_9cb620_slot_count_gate_va(void);
uint32_t isaac_game_state_9cb620_string_copy_gate_va(void);
uint32_t isaac_game_state_9cb620_slot_positive_va(void);
uint32_t isaac_game_state_9cb620_slot_more_va(void);
uint32_t isaac_game_state_9cb620_array74_needed_va(void);
uint32_t isaac_game_state_9cb620_array74_more_va(void);
uint32_t isaac_game_state_9cb620_array88_needed_va(void);
uint32_t isaac_game_state_9cb620_array88_more_va(void);
uint32_t isaac_game_state_9cb620_flag_gate_va(void);
uint32_t isaac_game_state_9cb620_flag_bit1_or_va(void);
uint32_t isaac_game_state_9cb620_flag_bit2_or_va(void);
uint32_t isaac_game_state_9cb620_flag_bit3_or_va(void);
uint32_t isaac_game_state_9cb620_flag_bit4_or_va(void);
uint32_t isaac_game_state_9cb620_flag_bit5_or_va(void);
uint32_t isaac_game_state_9cb620_caller_count(void);
uint32_t isaac_game_state_9cb620_caller_va_at(uint32_t index);

/* --- ABI v9: the full-field read entry 0x9cc1a0..0x9ce596 (giant;
 *     typed-host lease) ---

   Census (section-notes/game-state-v9-giant/NOTES.md): the full-field
   GameState read entry 0x9cc1a0..0x9ce596 (SEH 0xb0f33b + GS cookie
   0xbf93b4; thiscall `bool GameState::read(GameStateIO* io, bool
   check)` — ecx=this, [ebx+8]=io, [ebx+0xc]=check byte; 3 direct
   rel32 callers 0x918366 / 0x95a1f7 / 0x9ce677 (0x9ce677 = the
   re-load host body B's recursive call); ZHL EMPTY) stays typed-host
   (180 E8 incl. the row writer 0x683410 x90, the read-leaf cluster
   0x9d84a0/0x9d8550/0x9d8470/0x9d71b0, the 4 read-pill callers
   0x9ccf75/0x9ccfe8/0x9ce33f/0x9ce3ce, Delete @0x9cc254, the cross-
   body calls 0x9ce720 @0x9cda14 + 0x9cf000 @0x9cdfbe + 0x9c84c0
   @0x9cdefe, the hash-table insert @0x9ccd04..0x9cce11, 101 indirect
   calls, 224 mem stores); the lane-free GATES land: 27 FULL-dword
   UNSIGNED format gates on GameState+0x1fdf0 (>= 0x2b/0x2e/0x2f/0x30/
   0x33/0x34/0x40/0x42/0x43/0x44/0x47/0x48/0x50/0x53/0x54/0x57/0x59/
   0x85/0x86/0x87/0x89/0x8a/0x8d/0x93/0x95/0x98/0x9b) + 3 io+8 gates
   (>= 0x56/0x7c/0xa5; the 0x7b x2 + 0x21 sites PINNED to the v8 V4/V6
   laws) + the io+8 -> variant-count DISPATCH (9 bands 0x89..0x20f,
   read-pill loop-2 count) + the second-pass > 0x1fb gate + the +0x164
   13/14-u32 count + UNSIGNED bounds (0x1fb / 0x19d1c table / 0x50 /
   0x4d / word 0x25 / word idx<count / signed 8) + SIGNED movsx8
   gates ((int8)(count&0xff) > 0 and the jl loop bounds — wasm32
   compare-flip class) + LOW-BYTE gates (byte==0 x2 sites, tail ready
   !=0) + checksum gates (streamed==expected || expected==mgr+0xf98;
   final streamed==expected) + the u16 clamps (>= 0x35 / >= 0x1a).
   Byte-gate discipline identical to v1..v8 (uint32_t params only;
   byte gates mask & 0xff INSIDE the body). */

static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_VA = 0x009cc1a0u; /* thiscall bool read(GameStateIO* io, bool check) (ZHL EMPTY; 3 callers) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_END_VA = 0x009ce597u; /* first non-body byte (int3 pad 0x9ce597..0x9ce59f) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BODY_BYTES = 0x23f7u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_NEXT_VA = 0x009ce5a0u; /* re-load orchestrator host (body B; recursive call @0x9ce677) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SEH_HANDLER_DAT = 0x00b0f33bu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_COOKIE_DAT = 0x00bf93b4u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_FORMAT_OFF = 0x8u; /* io+8 counter (shared: reader row / pill reader) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_FORMAT_OFF = 0x1fdf0u; /* GameState format counter (stored into io+8 @0x9cc352) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_FORMAT_STORE_VA = 0x009cc352u; /* mov [io+8],gs_format */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DELETE_CALL_VA = 0x009cc254u; /* GameState::Delete (early-exit arms) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_0 = 0x009ccf75u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_1 = 0x009ccfe8u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_2 = 0x009ce33fu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_3 = 0x009ce3ceu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BODY_C_CALL_VA = 0x009cda14u; /* -> 0x9ce720 (9-byte checksum read) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CF000_CALL_VA = 0x009cdfbeu; /* -> 0x9cf000 (gs<0x42 arm cross-body) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SERIALIZER_CTOR_CALL_VA = 0x009cdefeu; /* -> 0x9c84c0 (gs>=0x42 arm) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CHECKSUM_MAGIC = 0x96696996u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_MGR_GLOBAL_DAT = 0x00c7169cu; /* g_Manager */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_MGR_F98_OFF = 0xf98u; /* checksum override field */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_LANE19C_OFF = 0x19cu; /* read-pill loop-1 count */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_LANE19C_BOUND = 0x1fbu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_HOLDERS1_OFF = 0x17c68u; /* loop-1 holder base (stride 0xc) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_VALUES1_OFF = 0x1a0u; /* loop-1 value base (stride 0xb8) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_HOLDERS2_OFF = 0x1942cu; /* loop-2 holder base */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_VALUES2_OFF = 0x16e08u; /* loop-2 value base */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_TABLE19530_OFF = 0x19530u; /* word-decode table base */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_TABLE19D1C_END = 0x19d1cu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SLOT13_BASE_OFF = 0x164u; /* 13/14-u32 lane block */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BYTE80_BOUND = 0x50u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BYTE4D_BOUND = 0x4du;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_WORD25_BOUND = 0x25u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CLAMP35_CONST = 0x35u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CLAMP1A_CONST = 0x1au;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_STRIDE_B8 = 0xb8u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_STRIDE_C = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X2B_VA = 0x009cc761u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X2E_VA = 0x009cc7a0u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X2F_VA = 0x009cdd29u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X30_VA = 0x009cde80u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X33_VA = 0x009cc35au;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X34_VA = 0x009cc4fau;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X40_VA = 0x009cc479u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X42_VA = 0x009cdedbu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X43_VA = 0x009cc510u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X44_VA = 0x009cd6ffu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X47_VA = 0x009cd4a3u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X48_VA = 0x009cd5fbu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X50_VA = 0x009cdfc9u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X53_VA = 0x009ce18cu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X54_VA = 0x009cdae3u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X57_VA = 0x009cc444u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X59_VA = 0x009ce00eu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X85_VA = 0x009ce437u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X86_VA = 0x009cd355u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X87_VA = 0x009cd582u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X89_VA = 0x009ce2b6u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X8A_VA = 0x009ce47fu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X8D_VA = 0x009cd71cu;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X93_VA = 0x009cc4a9u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X95_VA = 0x009ce4e1u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X98_VA = 0x009ce49au;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X9B_VA = 0x009cc4c1u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X56_VA = 0x009cccb7u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X7C_VA = 0x009cd1d9u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_GATE_0XA5_VA = 0x009cd246u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X21_VA = 0x009cc9beu; /* gs>=0x21 (law reuse: 9cb620 V6) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X7B_VA = 0x009cd027u; /* io>=0x7b u16-count arm (law reuse: V4) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X7B_VA_2 = 0x009cd19du; /* io>=0x7b +0x19d2c byte (law reuse: V4) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH0_VA = 0x009cce5du; /* cmp eax,0x56 (band 0) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH1_VA = 0x009cce9cu; /* cmp eax,0x6b (band 1) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH2_VA = 0x009cceadu; /* cmp eax,0x6d */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH3_VA = 0x009ccebeu; /* cmp eax,0x76 */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH4_VA = 0x009ccecfu; /* cmp eax,0x7b */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH5_VA = 0x009ccee0u; /* cmp eax,0x84 */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH6_VA = 0x009ccef3u; /* cmp eax,0x94 */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH7_VA = 0x009ccf06u; /* cmp eax,0x9a + sbb/add */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_DISPATCH_SECOND_PASS_VA = 0x009ccfc3u; /* cmp [ebp-0x680],0x1fb ; jbe skip */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_T164_COUNT_VA = 0x009ccc64u; /* cmp 0x50,[esi+8] ; sbb/neg/add */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_COUNT_1FB_GATE_VA = 0x009ccf1eu; /* cmp ecx,0x1fb ; jb */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_TABLE_19D1C_MORE_VA = 0x009cd158u; /* cmp esi,0x19d1c ; jb */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BYTE_0X50_MORE_VA = 0x009cdbe0u; /* cmp esi,0x50 ; jae exit (twin 0x9cdc31) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BYTE_0X4D_MORE_VA = 0x009cdb63u; /* cmp esi,0x4d ; jb */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_WORD_0X25_MORE_VA = 0x009cdf86u; /* cmp dx,0x25 ; jae */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_WORD_MORE_VA = 0x009cdf42u; /* cmp ax,word ; jae (twin 0x9cdfab) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_COUNT8_MORE_VA = 0x009cdc62u; /* cmp ecx,8 ; jl */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SIGNED_BYTE_POS_VA = 0x009cd772u; /* test eax,eax ; jle (4 sites) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SIGNED_IDX_MOVSX8_VA = 0x009cd86eu; /* cmp ecx,[edi+0x19d78] ; jl (twin 0x9cda01) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SIGNED_IDX_COUNT_VA = 0x009cdec9u; /* cmp eax,[ebp-0x680] ; jl (twin 0x9ce170) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_SIGNED_BYTE_LT_VA = 0x009ce358u; /* cmp al,byte ; jl (twin 0x9ce3e7) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_BYTE_ZERO_GATE_VA = 0x009cc301u; /* cmp byte [ebx+0xc],0 ; je (twin 0x9ce54d) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_TAIL_READY_GATE_VA = 0x009ce55fu; /* test al,al ; je */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CHECKSUM_PASS_VA = 0x009cc313u; /* cmp eax,ecx ; jne (override 0x9cc31c) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CHECKSUM_MATCH_VA = 0x009ce545u; /* cmp eax,[edi+0x1fda4] ; jne */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CLAMP35_VA = 0x009cc3e7u; /* cmp cx,word ; cmovae (const 0x9cc3dd) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CLAMP1A_VA = 0x009ccb13u; /* cmp cx,word ; cmovae (const 0x9ccb09) */
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CALLER_COUNT = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CALLER_VA_0 = 0x00918366u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CALLER_VA_1 = 0x0095a1f7u;
static constexpr uint32_t ISAAC_GAME_STATE_9CC1A0_CALLER_VA_2 = 0x009ce677u; /* body B recursive re-load */
int32_t isaac_game_state_9cc1a0_gs_gate_0x2b(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x2e(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x2f(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x30(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x33(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x34(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x40(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x42(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x43(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x44(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x47(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x48(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x50(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x53(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x54(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x57(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x59(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x85(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x86(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x87(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x89(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x8a(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x8d(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x93(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x95(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x98(uint32_t format);
int32_t isaac_game_state_9cc1a0_gs_gate_0x9b(uint32_t format);
int32_t isaac_game_state_9cc1a0_io_gate_0x56(uint32_t format);
int32_t isaac_game_state_9cc1a0_io_gate_0x7c(uint32_t format);
int32_t isaac_game_state_9cc1a0_io_gate_0xa5(uint32_t format);
uint32_t isaac_game_state_9cc1a0_dispatch_count(uint32_t io8);
int32_t isaac_game_state_9cc1a0_dispatch_second_pass_needed(uint32_t disp_count);
uint32_t isaac_game_state_9cc1a0_t164_count(uint32_t io8);
int32_t isaac_game_state_9cc1a0_count_1fb_below(uint32_t count);
int32_t isaac_game_state_9cc1a0_table_19d1c_more(uint32_t off);
int32_t isaac_game_state_9cc1a0_byte_0x50_more(uint32_t idx);
int32_t isaac_game_state_9cc1a0_byte_0x4d_more(uint32_t idx);
int32_t isaac_game_state_9cc1a0_word_0x25_more(uint32_t idx);
int32_t isaac_game_state_9cc1a0_word_more(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9cc1a0_count8_more(uint32_t idx);
int32_t isaac_game_state_9cc1a0_signed_byte_count_positive(uint32_t count);
int32_t isaac_game_state_9cc1a0_signed_idx_lt_movsx8(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9cc1a0_signed_idx_lt_count(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9cc1a0_signed_byte_lt(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9cc1a0_byte_zero_ok(uint32_t byte);
int32_t isaac_game_state_9cc1a0_tail_ready_ok(uint32_t al);
int32_t isaac_game_state_9cc1a0_checksum_pass(uint32_t streamed, uint32_t expected, uint32_t mgr_f98);
int32_t isaac_game_state_9cc1a0_checksum_matches(uint32_t streamed, uint32_t expected);
uint32_t isaac_game_state_9cc1a0_clamp_0x35(uint32_t count);
uint32_t isaac_game_state_9cc1a0_clamp_0x1a(uint32_t count);
uint32_t isaac_game_state_9cc1a0_va(void);
uint32_t isaac_game_state_9cc1a0_end_va(void);
uint32_t isaac_game_state_9cc1a0_body_bytes(void);
uint32_t isaac_game_state_9cc1a0_next_va(void);
uint32_t isaac_game_state_9cc1a0_seh_handler_dat(void);
uint32_t isaac_game_state_9cc1a0_gs_cookie_dat(void);
uint32_t isaac_game_state_9cc1a0_io_format_off(void);
uint32_t isaac_game_state_9cc1a0_gs_format_off(void);
uint32_t isaac_game_state_9cc1a0_io_format_store_va(void);
uint32_t isaac_game_state_9cc1a0_delete_call_va(void);
uint32_t isaac_game_state_9cc1a0_read_pill_call_va_0(void);
uint32_t isaac_game_state_9cc1a0_read_pill_call_va_1(void);
uint32_t isaac_game_state_9cc1a0_read_pill_call_va_2(void);
uint32_t isaac_game_state_9cc1a0_read_pill_call_va_3(void);
uint32_t isaac_game_state_9cc1a0_body_c_call_va(void);
uint32_t isaac_game_state_9cc1a0_cf000_call_va(void);
uint32_t isaac_game_state_9cc1a0_serializer_ctor_call_va(void);
uint32_t isaac_game_state_9cc1a0_checksum_magic(void);
uint32_t isaac_game_state_9cc1a0_mgr_global_dat(void);
uint32_t isaac_game_state_9cc1a0_mgr_f98_off(void);
uint32_t isaac_game_state_9cc1a0_lane19c_off(void);
uint32_t isaac_game_state_9cc1a0_lane19c_bound(void);
uint32_t isaac_game_state_9cc1a0_holders1_off(void);
uint32_t isaac_game_state_9cc1a0_values1_off(void);
uint32_t isaac_game_state_9cc1a0_holders2_off(void);
uint32_t isaac_game_state_9cc1a0_values2_off(void);
uint32_t isaac_game_state_9cc1a0_table19530_off(void);
uint32_t isaac_game_state_9cc1a0_table19d1c_end(void);
uint32_t isaac_game_state_9cc1a0_slot13_base_off(void);
uint32_t isaac_game_state_9cc1a0_byte80_bound(void);
uint32_t isaac_game_state_9cc1a0_byte4d_bound(void);
uint32_t isaac_game_state_9cc1a0_word25_bound(void);
uint32_t isaac_game_state_9cc1a0_clamp35_const(void);
uint32_t isaac_game_state_9cc1a0_clamp1a_const(void);
uint32_t isaac_game_state_9cc1a0_stride_b8(void);
uint32_t isaac_game_state_9cc1a0_stride_c(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x2b_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x2e_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x2f_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x30_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x33_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x34_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x40_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x42_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x43_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x44_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x47_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x48_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x50_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x53_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x54_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x57_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x59_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x85_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x86_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x87_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x89_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x8a_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x8d_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x93_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x95_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x98_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x9b_va(void);
uint32_t isaac_game_state_9cc1a0_io_gate_0x56_va(void);
uint32_t isaac_game_state_9cc1a0_io_gate_0x7c_va(void);
uint32_t isaac_game_state_9cc1a0_io_gate_0xa5_va(void);
uint32_t isaac_game_state_9cc1a0_gs_gate_0x21_va(void);
uint32_t isaac_game_state_9cc1a0_io_gate_0x7b_va(void);
uint32_t isaac_game_state_9cc1a0_io_gate_0x7b_va_2(void);
uint32_t isaac_game_state_9cc1a0_dispatch0_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch1_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch2_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch3_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch4_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch5_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch6_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch7_va(void);
uint32_t isaac_game_state_9cc1a0_dispatch_second_pass_va(void);
uint32_t isaac_game_state_9cc1a0_t164_count_va(void);
uint32_t isaac_game_state_9cc1a0_count_1fb_gate_va(void);
uint32_t isaac_game_state_9cc1a0_table_19d1c_more_va(void);
uint32_t isaac_game_state_9cc1a0_byte_0x50_more_va(void);
uint32_t isaac_game_state_9cc1a0_byte_0x4d_more_va(void);
uint32_t isaac_game_state_9cc1a0_word_0x25_more_va(void);
uint32_t isaac_game_state_9cc1a0_word_more_va(void);
uint32_t isaac_game_state_9cc1a0_count8_more_va(void);
uint32_t isaac_game_state_9cc1a0_signed_byte_pos_va(void);
uint32_t isaac_game_state_9cc1a0_signed_idx_movsx8_va(void);
uint32_t isaac_game_state_9cc1a0_signed_idx_count_va(void);
uint32_t isaac_game_state_9cc1a0_signed_byte_lt_va(void);
uint32_t isaac_game_state_9cc1a0_byte_zero_gate_va(void);
uint32_t isaac_game_state_9cc1a0_tail_ready_gate_va(void);
uint32_t isaac_game_state_9cc1a0_checksum_pass_va(void);
uint32_t isaac_game_state_9cc1a0_checksum_match_va(void);
uint32_t isaac_game_state_9cc1a0_clamp35_va(void);
uint32_t isaac_game_state_9cc1a0_clamp1a_va(void);
uint32_t isaac_game_state_9cc1a0_caller_count(void);
uint32_t isaac_game_state_9cc1a0_caller_va_at(uint32_t index);
/* --- ABI v10: the io+8 dispatch helper 0x9ce720 (body C) + the
 *     full-field reader giant 0x9d05d0..0x9d45b6 (SEH 0xb0f39e +
 *     GS cookie 0xbf93b4, ret 4, 0x3fe7 B; typed-host leases;
 *     111 laws) ---
 *
 *   Census: section-notes/game-state-v10-body-c/NOTES.md.  Body C
 *   0x9ce720..0x9cec73 (ret 4; 1 caller 0x9cda14 = the v9 read
 *   entry's cross-body call): the io+8 5-band count dispatch
 *   (0x57->0x1a, 0x69->0x1b, 0x70->0x1c, 0x7a->0x1d/0x1f), the
 *   mgr-vector count_fits gate (0x2a404/0x2a408 + twin 0x2a410/
 *   0x2a414, UNSIGNED <=), the >=0x4a/>=0x37/>=0x4e io+8 gates
 *   and the sbb defaults (0x35 -> 0x1ff/0x2dd and 0x78/0xbe;
 *   0x77 -> 0xe/0xf).  The giant (thiscall bool (void* dest,
 *   GameStateIO* io); 7 callers incl. the 0x9cc1a0 read entry
 *   x4 + read_rerun x2 + 0x90c933; ZHL EMPTY) lands: 74 io+8
 *   format gates (72 >= N + 2 ABOVE arms 0x23/0x24 — the
 *   complete reader surface, incl. the READER-ROW pre-gate
 *   io+8>=0x67 @0x9d1de2 that dispatches the +0x100 head to the
 *   v6 0x9cb020 row) + 9 dispatch/count/cap laws (lane counts
 *   1..4 / 2..4, 0xf/0x10, format range [0x2f,0x90], count cap
 *   0x2222222, idx<=size, slot cap <3, clamps 0x14/0xa) + 6
 *   SIGNED laws (head >= 0, head < 0x148-stride vecsize, count
 *   > 0, idx < vecsize, 0x7fff-masked idx < vecsize, value < 0)
 *   + 8 LOW-BYTE/result gates (byte != 0 setne + byte-count
 *   entry, byte == 1, byte != 0xff, u32 count != 0, io-ready AL
 *   == 0, 0x72fd10 result != 0, 0x9c7350 / 0x9cff40 AL != 0) + 6
 *   UNSIGNED loop bounds (byte idx, fixed 2/6/8, word idx, u32
 *   idx).  Byte-gate discipline identical to v1..v9 (uint32_t
 *   params only; byte gates mask & 0xff INSIDE bodies; SIGNED
 *   gates use the wasm32 compare-flip i64 sign-extend forms). */
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_VA = 0x009ce720u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_END_VA = 0x009cec74u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_BODY_BYTES = 0x154u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_NEXT_VA = 0x009cec80u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_IO_FORMAT_OFF = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_MGR_GLOBAL_DAT = 0x00c7169cu;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_MGR_VEC_A_START_OFF = 0x2a404u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_MGR_VEC_A_END_OFF = 0x2a408u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_MGR_VEC_B_START_OFF = 0x2a410u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_MGR_VEC_B_END_OFF = 0x2a414u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_VA = 0x009d05d0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_END_VA = 0x009d45b7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_BODY_BYTES = 0x3fe7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_NEXT_VA = 0x009d45c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_SEH_HANDLER_DAT = 0x00b0f39eu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_GS_COOKIE_DAT = 0x00bf93b4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_FORMAT_OFF = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_READER_ROW_CALL_VA = 0x009d1df0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_MGR_GLOBAL_DAT = 0x00c7169cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A404 = 0x2a404u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A408 = 0x2a408u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A410 = 0x2a410u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A414 = 0x2a414u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_COUNT_CAP = 0x2222222u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CLAMP0X14_CONST = 0x14u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CLAMP0XA_CONST = 0xau;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_RANGE_LO = 0x2fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_RANGE_HI = 0x61u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_STRIDE_148 = 0x148u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_MASK_7FFF = 0x7fffu;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_CALLER_VA_0 = 0x9cda14u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_COUNT = 7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_0 = 0x90c933u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_1 = 0x9cd70fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_2 = 0x9cd7d8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_3 = 0x9cd847u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_4 = 0x9cd8aau;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_5 = 0x9d806bu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CALLER_VA_6 = 0x9d80f3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X1E_VA = 0x009d1adeu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X1F_VA = 0x009d1a4fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X20_VA = 0x009d222fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X23_VA = 0x009d21f8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X27_VA = 0x009d12abu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X28_VA = 0x009d0c24u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X29_VA = 0x009d1020u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X2D_VA = 0x009d0a7cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X2F_VA = 0x009d120du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X30_VA = 0x009d17b3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X38_VA = 0x009d0dbdu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X39_VA = 0x009d1c8au;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X3A_VA = 0x009d09e7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X3B_VA = 0x009d0afau;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X3E_VA = 0x009d0aabu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X40_VA = 0x009d258cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X41_VA = 0x009d2702u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X43_VA = 0x009d4066u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X45_VA = 0x009d0c2du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X4C_VA = 0x009d11aau;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X4D_VA = 0x009d093bu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X4F_VA = 0x009d27dbu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X50_VA = 0x009d280fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X51_VA = 0x009d4323u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X52_VA = 0x009d2869u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X55_VA = 0x009d240au;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X58_VA = 0x009d2737u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X5A_VA = 0x009d2470u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X5B_VA = 0x009d1ec5u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X5C_VA = 0x009d2988u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X5D_VA = 0x009d291cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X5E_VA = 0x009d1f1du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X5F_VA = 0x009d2a01u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X60_VA = 0x009d2b1du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X61_VA = 0x009d2c61u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X62_VA = 0x009d2dc8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X63_VA = 0x009d29c9u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X64_VA = 0x009d0ef5u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X65_VA = 0x009d42adu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X67_VA = 0x009d1de2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X6A_VA = 0x009d2e36u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X6C_VA = 0x009d0f28u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X6E_VA = 0x009d3df9u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X6F_VA = 0x009d3eb7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X72_VA = 0x009d2769u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X73_VA = 0x009d3f17u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X74_VA = 0x009d1c35u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X75_VA = 0x009d354au;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X76_VA = 0x009d357du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X78_VA = 0x009d35adu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X79_VA = 0x009d08cfu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X7E_VA = 0x009d35e4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X7F_VA = 0x009d3f4au;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X80_VA = 0x009d399bu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X81_VA = 0x009d3c9cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X82_VA = 0x009d0849u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X83_VA = 0x009d3d6fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X8A_VA = 0x009d4403u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X8B_VA = 0x009d1314u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X8C_VA = 0x009d2197u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X8F_VA = 0x009d24adu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X90_VA = 0x009d2f1au;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X97_VA = 0x009d131fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X99_VA = 0x009d0e7bu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X9C_VA = 0x009d24ecu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X9D_VA = 0x009d44d3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0XA0_VA = 0x009d252fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0XA4_VA = 0x009d35f8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0XA5_VA = 0x009d0a4bu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0XA6_VA = 0x009d0c58u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0XA8_VA = 0x009d3d05u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0XA9_VA = 0x009d3d37u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X23_ABOVE_VA = 0x009d09b4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IO_GATE_0X24_ABOVE_VA = 0x009d0a1au;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_DISPATCH_COUNT_VA = 0x009ce73du;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_COUNT_FITS_VA = 0x009ce9c0u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_IO_GATE_0X4A_VA = 0x009ce938u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_IO_GATE_0X37_VA = 0x009ce96bu;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_DEFAULT_COUNT_0X1FF_0X2DD_VA = 0x009ce997u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_DEFAULT_COUNT_0X78_0XBE_VA = 0x009ceac4u;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_COUNT_0XE_0XF_VA = 0x009cebeau;
static constexpr uint32_t ISAAC_GAME_STATE_9CE720_IO_GATE_0X4E_VA = 0x009cec35u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_LANE_COUNT_1_4_VA = 0x009d0df7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_LANE_COUNT_2_4_VA = 0x009d1085u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_COUNT_0XF_0X10_VA = 0x009d1171u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_FORMAT_IN_RANGE_VA = 0x009d15efu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_COUNT_CAP_OK_VA = 0x009d1ce2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IDX_LE_VECSIZE_VA = 0x009d2b9au;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_SLOT_CAP_LT_3_VA = 0x009d3061u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CLAMP_0X14_VA = 0x009d340eu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CLAMP_SIGNED_0XA_VA = 0x009d1b13u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_HEAD_NONNEG_VA = 0x009d0644u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_HEAD_LT_VECSIZE_VA = 0x009d0670u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_SIGNED_POSITIVE_VA = 0x009d0e58u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_SIGNED_IDX_LT_VECSIZE_VA = 0x009d2fc0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IDX_MASKED_7FFF_LT_VECSIZE_VA = 0x009d41d2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_VALUE_NEG_OVERRIDE_VA = 0x009d4250u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_BYTE_NONZERO_VA = 0x009d251du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_BYTE_EQ_1_VA = 0x009d1118u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_BYTE_FF_OK_VA = 0x009d3f7fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_U32_COUNT_NEEDED_VA = 0x009d16f4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_READY_OK_VA = 0x009d170bu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_V2FD10_RESULT_OK_VA = 0x009d0e70u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_C7350_RESULT_OK_VA = 0x009d178fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_CFF40_RESULT_OK_VA = 0x009d268du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_BYTE_IDX_LT_BYTE_VA = 0x009d2699u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IDX_LT_2_VA = 0x009d3aedu;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IDX_LT_6_VA = 0x009d33e3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_IDX_LT_8_VA = 0x009d333du;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_WORD_IDX_LT_COUNT_VA = 0x009d2c55u;
static constexpr uint32_t ISAAC_GAME_STATE_9D05D0_UINT_IDX_LT_COUNT_VA = 0x009d17a1u;
uint32_t isaac_game_state_9ce720_dispatch_count(uint32_t io8);
int32_t isaac_game_state_9ce720_count_fits(uint32_t count, uint32_t vecsize);
int32_t isaac_game_state_9ce720_io_gate_0x4a(uint32_t io8);
int32_t isaac_game_state_9ce720_io_gate_0x37(uint32_t io8);
uint32_t isaac_game_state_9ce720_default_count_0x1ff_0x2dd(uint32_t io8);
uint32_t isaac_game_state_9ce720_default_count_0x78_0xbe(uint32_t io8);
uint32_t isaac_game_state_9ce720_count_0xe_0xf(uint32_t io8);
int32_t isaac_game_state_9ce720_io_gate_0x4e(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x1e(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x1f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x20(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x23(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x27(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x28(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x29(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x2d(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x2f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x30(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x38(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x39(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x3a(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x3b(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x3e(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x40(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x41(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x43(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x45(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x4c(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x4d(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x4f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x50(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x51(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x52(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x55(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x58(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x5a(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x5b(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x5c(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x5d(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x5e(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x5f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x60(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x61(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x62(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x63(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x64(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x65(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x67(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x6a(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x6c(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x6e(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x6f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x72(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x73(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x74(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x75(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x76(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x78(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x79(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x7e(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x7f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x80(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x81(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x82(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x83(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x8a(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x8b(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x8c(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x8f(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x90(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x97(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x99(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x9c(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x9d(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0xa0(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0xa4(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0xa5(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0xa6(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0xa8(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0xa9(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x23_above(uint32_t io8);
int32_t isaac_game_state_9d05d0_io_gate_0x24_above(uint32_t io8);
uint32_t isaac_game_state_9d05d0_lane_count_1_4(uint32_t io8);
uint32_t isaac_game_state_9d05d0_lane_count_2_4(uint32_t io8);
uint32_t isaac_game_state_9d05d0_count_0xf_0x10(uint32_t io8);
int32_t isaac_game_state_9d05d0_format_in_range(uint32_t io8);
int32_t isaac_game_state_9d05d0_count_cap_ok(uint32_t count);
int32_t isaac_game_state_9d05d0_idx_le_vecsize(uint32_t idx, uint32_t size);
int32_t isaac_game_state_9d05d0_slot_cap_lt_3(uint32_t count);
uint32_t isaac_game_state_9d05d0_clamp_0x14(uint32_t count);
uint32_t isaac_game_state_9d05d0_clamp_signed_0xa(uint32_t count);
int32_t isaac_game_state_9d05d0_head_nonneg(uint32_t v);
int32_t isaac_game_state_9d05d0_head_lt_vecsize(uint32_t count, uint32_t vecsize);
int32_t isaac_game_state_9d05d0_signed_positive(uint32_t count);
int32_t isaac_game_state_9d05d0_signed_idx_lt_vecsize(uint32_t idx, uint32_t vecsize);
int32_t isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize(uint32_t idx, uint32_t vecsize);
int32_t isaac_game_state_9d05d0_value_neg_override(uint32_t v);
int32_t isaac_game_state_9d05d0_byte_nonzero(uint32_t byte);
int32_t isaac_game_state_9d05d0_byte_eq_1(uint32_t byte);
int32_t isaac_game_state_9d05d0_byte_ff_ok(uint32_t byte);
int32_t isaac_game_state_9d05d0_u32_count_needed(uint32_t count);
int32_t isaac_game_state_9d05d0_ready_ok(uint32_t al);
int32_t isaac_game_state_9d05d0_v2fd10_result_ok(uint32_t result);
int32_t isaac_game_state_9d05d0_c7350_result_ok(uint32_t al);
int32_t isaac_game_state_9d05d0_cff40_result_ok(uint32_t al);
int32_t isaac_game_state_9d05d0_byte_idx_lt_byte(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9d05d0_idx_lt_2(uint32_t idx);
int32_t isaac_game_state_9d05d0_idx_lt_6(uint32_t idx);
int32_t isaac_game_state_9d05d0_idx_lt_8(uint32_t idx);
int32_t isaac_game_state_9d05d0_word_idx_lt_count(uint32_t idx, uint32_t count);
int32_t isaac_game_state_9d05d0_uint_idx_lt_count(uint32_t idx, uint32_t count);
uint32_t isaac_game_state_9ce720_dispatch_count_va(void);
uint32_t isaac_game_state_9ce720_count_fits_va(void);
uint32_t isaac_game_state_9ce720_io_gate_0x4a_va(void);
uint32_t isaac_game_state_9ce720_io_gate_0x37_va(void);
uint32_t isaac_game_state_9ce720_default_count_0x1ff_0x2dd_va(void);
uint32_t isaac_game_state_9ce720_default_count_0x78_0xbe_va(void);
uint32_t isaac_game_state_9ce720_count_0xe_0xf_va(void);
uint32_t isaac_game_state_9ce720_io_gate_0x4e_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x1e_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x1f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x20_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x23_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x27_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x28_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x29_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x2d_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x2f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x30_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x38_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x39_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x3a_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x3b_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x3e_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x40_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x41_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x43_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x45_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x4c_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x4d_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x4f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x50_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x51_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x52_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x55_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x58_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x5a_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x5b_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x5c_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x5d_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x5e_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x5f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x60_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x61_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x62_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x63_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x64_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x65_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x67_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x6a_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x6c_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x6e_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x6f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x72_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x73_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x74_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x75_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x76_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x78_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x79_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x7e_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x7f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x80_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x81_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x82_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x83_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x8a_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x8b_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x8c_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x8f_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x90_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x97_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x99_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x9c_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x9d_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0xa0_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0xa4_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0xa5_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0xa6_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0xa8_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0xa9_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x23_above_va(void);
uint32_t isaac_game_state_9d05d0_io_gate_0x24_above_va(void);
uint32_t isaac_game_state_9d05d0_lane_count_1_4_va(void);
uint32_t isaac_game_state_9d05d0_lane_count_2_4_va(void);
uint32_t isaac_game_state_9d05d0_count_0xf_0x10_va(void);
uint32_t isaac_game_state_9d05d0_format_in_range_va(void);
uint32_t isaac_game_state_9d05d0_count_cap_ok_va(void);
uint32_t isaac_game_state_9d05d0_idx_le_vecsize_va(void);
uint32_t isaac_game_state_9d05d0_slot_cap_lt_3_va(void);
uint32_t isaac_game_state_9d05d0_clamp_0x14_va(void);
uint32_t isaac_game_state_9d05d0_clamp_signed_0xa_va(void);
uint32_t isaac_game_state_9d05d0_head_nonneg_va(void);
uint32_t isaac_game_state_9d05d0_head_lt_vecsize_va(void);
uint32_t isaac_game_state_9d05d0_signed_positive_va(void);
uint32_t isaac_game_state_9d05d0_signed_idx_lt_vecsize_va(void);
uint32_t isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize_va(void);
uint32_t isaac_game_state_9d05d0_value_neg_override_va(void);
uint32_t isaac_game_state_9d05d0_byte_nonzero_va(void);
uint32_t isaac_game_state_9d05d0_byte_eq_1_va(void);
uint32_t isaac_game_state_9d05d0_byte_ff_ok_va(void);
uint32_t isaac_game_state_9d05d0_u32_count_needed_va(void);
uint32_t isaac_game_state_9d05d0_ready_ok_va(void);
uint32_t isaac_game_state_9d05d0_v2fd10_result_ok_va(void);
uint32_t isaac_game_state_9d05d0_c7350_result_ok_va(void);
uint32_t isaac_game_state_9d05d0_cff40_result_ok_va(void);
uint32_t isaac_game_state_9d05d0_byte_idx_lt_byte_va(void);
uint32_t isaac_game_state_9d05d0_idx_lt_2_va(void);
uint32_t isaac_game_state_9d05d0_idx_lt_6_va(void);
uint32_t isaac_game_state_9d05d0_idx_lt_8_va(void);
uint32_t isaac_game_state_9d05d0_word_idx_lt_count_va(void);
uint32_t isaac_game_state_9d05d0_uint_idx_lt_count_va(void);
uint32_t isaac_game_state_9ce720_va(void);
uint32_t isaac_game_state_9ce720_end_va(void);
uint32_t isaac_game_state_9ce720_body_bytes(void);
uint32_t isaac_game_state_9ce720_next_va(void);
uint32_t isaac_game_state_9ce720_io_format_off(void);
uint32_t isaac_game_state_9ce720_mgr_global_dat(void);
uint32_t isaac_game_state_9ce720_mgr_vec_a_start_off(void);
uint32_t isaac_game_state_9ce720_mgr_vec_a_end_off(void);
uint32_t isaac_game_state_9ce720_mgr_vec_b_start_off(void);
uint32_t isaac_game_state_9ce720_mgr_vec_b_end_off(void);
uint32_t isaac_game_state_9d05d0_va(void);
uint32_t isaac_game_state_9d05d0_end_va(void);
uint32_t isaac_game_state_9d05d0_body_bytes(void);
uint32_t isaac_game_state_9d05d0_next_va(void);
uint32_t isaac_game_state_9d05d0_seh_handler_dat(void);
uint32_t isaac_game_state_9d05d0_gs_cookie_dat(void);
uint32_t isaac_game_state_9d05d0_io_format_off(void);
uint32_t isaac_game_state_9d05d0_reader_row_call_va(void);
uint32_t isaac_game_state_9d05d0_mgr_global_dat(void);
uint32_t isaac_game_state_9d05d0_mgr_vec_2a404(void);
uint32_t isaac_game_state_9d05d0_mgr_vec_2a408(void);
uint32_t isaac_game_state_9d05d0_mgr_vec_2a410(void);
uint32_t isaac_game_state_9d05d0_mgr_vec_2a414(void);
uint32_t isaac_game_state_9d05d0_count_cap(void);
uint32_t isaac_game_state_9d05d0_clamp0x14_const(void);
uint32_t isaac_game_state_9d05d0_clamp0xa_const(void);
uint32_t isaac_game_state_9d05d0_range_lo(void);
uint32_t isaac_game_state_9d05d0_range_hi(void);
uint32_t isaac_game_state_9d05d0_stride_148(void);
uint32_t isaac_game_state_9d05d0_mask_7fff(void);
uint32_t isaac_game_state_9ce720_caller_count(void);
uint32_t isaac_game_state_9ce720_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d05d0_caller_count(void);
uint32_t isaac_game_state_9d05d0_caller_va_at(uint32_t index);

/* --- ABI v11: small-body + writer-giant/reader-tail decision laws (39;
 *     census section-notes/game-state-v11-small-bodies/NOTES.md §4).
 *     Bodies stay typed-host; lane-free gates land.  Byte-gate
 *     discipline identical to v1..v10 (uint32_t params only; byte gates
 *     mask & 0xff INSIDE bodies; FULL-dword gates unmasked; SIGNED gates
 *     use the i64 sign-extend forms). --- */

/* 9cf000 bitmap clear (PE 0x009cf037 cmp eax,0x68 ; jb): UNSIGNED fixed
 * 0x68-bit loop bound. */
int32_t isaac_game_state_9cf000_clear_more(uint32_t idx);
/* 9cff40 writer leaf (PE 0x009d00a4 cmp [edi+8],0x92 ; jb): io+8 >= 0x92
 * writes the extra u16 pair (+0x12/+0x10).  FULL-dword UNSIGNED. */
int32_t isaac_game_state_9cff40_io8_ge_0x92(uint32_t io8);
/* 9d0440 writer leaf byte gates (PE 0x009d04d4 / 0x009d04df cmp byte,0 ;
 * je): LOW-BYTE nonzero -> bit0/bit1 of the packed flags byte. */
int32_t isaac_game_state_9d0440_byte_c_nonzero(uint32_t byte_c);
int32_t isaac_game_state_9d0440_byte_d_nonzero(uint32_t byte_d);
/* 9d0440 packed flags byte: bit0 = c!=0, bit1 = d!=0 (or al,2 @0x9d04e5). */
int32_t isaac_game_state_9d0440_flag_byte(uint32_t byte_c, uint32_t byte_d);

/* --- 0x9d45c0 writer giant (0x2be1 B) --- */
/* flags byte pack (PE 0x009d4825/0x009d4831/0x009d4840): bit0 = b32!=0,
 * bit1 = b534!=0, bit2 = b535!=0 (LOW-BYTE gates). */
int32_t isaac_game_state_9d45c0_flags_pack(uint32_t b32, uint32_t b534,
                                           uint32_t b535);
/* count law (PE 0x009d4f7b sar eax,3): (int32)(end-begin) >> 3. */
uint32_t isaac_game_state_9d45c0_count_sar3(uint32_t begin, uint32_t end);
/* count != 0 (PE 0x9d4fa8/0x9d5084/0x9d5550/0x9d579a/0x9d6f8b/0x9d70c9
 * jbe/je/jz): UNSIGNED. */
int32_t isaac_game_state_9d45c0_count_nonzero(uint32_t count);
/* idx < count (PE 0x9d502a/0x9d5103/0x9d558d/0x9d5a90/0x9d6924/0x9d6fd5/
 * 0x9d718c jb): UNSIGNED. */
int32_t isaac_game_state_9d45c0_idx_lt_count(uint32_t idx, uint32_t count);
/* count_22c > 0 (PE 0x009d5390 jle): SIGNED. */
int32_t isaac_game_state_9d45c0_count_22c_positive(uint32_t count);
/* idx < count_22c (PE 0x009d54d6 jl): SIGNED. */
int32_t isaac_game_state_9d45c0_idx_lt_count_22c(uint32_t idx,
                                                 uint32_t count);
/* element count of the 0x78-stride array (PE 0x9d54e8/0x9d5536/0x9d5569/
 * 0x9d557b magic 0x88888889, div-by-0x78 SIGNED floor — R16 twin). */
uint32_t isaac_game_state_9d45c0_element_count_78(uint32_t begin,
                                                  uint32_t end);
/* byte count of the 0x24-stride array (PE 0x9d5aa2/0x9d5aad magic
 * 0x92492493, div-by-0x24 SIGNED floor; low byte stored). */
uint32_t isaac_game_state_9d45c0_byte_count_36(uint32_t begin,
                                               uint32_t end);
/* (idx&0xff) < (count&0xff) (PE 0x9d5aeb/0x9d5b16/0x9d6231/0x9d62f0/
 * 0x9d6bd3/0x9d6c1a/0x9d6ef1/0x9d6f37): BYTE-narrowed. */
int32_t isaac_game_state_9d45c0_byte_idx_lt_byte_count(uint32_t idx,
                                                       uint32_t count);
/* (b&0xff) != 0 (PE 0x9d5aef/0x9d6235/0x9d6bd7/0x9d6ef5 jbe): BYTE. */
int32_t isaac_game_state_9d45c0_byte_count_nonzero(uint32_t byte);
/* byte [src+0x398] != 0 (PE 0x009d5b42 je) -> extra 0x9d0100 writer.
 * LOW-BYTE. */
int32_t isaac_game_state_9d45c0_byte_398_nonzero(uint32_t byte);
/* (idx&0xffff) < (count&0xffff) (PE 0x9d5fb1/0x9d608e): WORD-narrowed. */
int32_t isaac_game_state_9d45c0_word_idx_lt_count(uint32_t idx,
                                                  uint32_t count);
/* idx < 8 (PE 0x009d6339 jb): fixed cap. */
int32_t isaac_game_state_9d45c0_idx_lt_8(uint32_t idx);
/* idx < 6 (PE 0x009d63c9 jb): fixed cap. */
int32_t isaac_game_state_9d45c0_idx_lt_6(uint32_t idx);
/* idx < (count&0xff) (PE 0x9d63ff/0x9d643f movzx byte): u32 idx vs
 * byte-extended count. */
int32_t isaac_game_state_9d45c0_idx_lt_byte_count_u32(uint32_t idx,
                                                      uint32_t count);
/* element count of the 0x34-stride array (PE 0x9d68fe/0x9d6909/0x9d6918
 * magic 0x4ec4ec4f, div-by-0x34 SIGNED floor). */
uint32_t isaac_game_state_9d45c0_element_count_34(uint32_t begin,
                                                  uint32_t end);
/* (b&0xff) != 0xff (PE 0x009d6c9a je skip twin u32s): LOW-BYTE. */
int32_t isaac_game_state_9d45c0_byte_ne_ff(uint32_t byte);
/* walk continue (PE 0x9d6d4a je end / 0x9d6e8f jne): node != end. */
int32_t isaac_game_state_9d45c0_walk_continue_3c0(uint32_t node,
                                                  uint32_t end);
/* element byte flag (PE 0x9d6d56/0x9d6d5d cmp byte [esi+4],0 ; je):
 * LOW-BYTE != 0 -> sign-magnitude encode arm. */
int32_t isaac_game_state_9d45c0_element_byte_nonzero(uint32_t byte);
/* (int32)value >= 0 (PE 0x9d6d5f/0x9d6d73 jns): SIGNED. */
int32_t isaac_game_state_9d45c0_value_nonneg(uint32_t value);
/* (int32)value >= 0 scan gate (PE 0x009d6eb0 jge): SIGNED. */
int32_t isaac_game_state_9d45c0_scan_value_nonneg(uint32_t value);
/* scan remaining >= 0 (PE 0x009d6ebb jns): SIGNED (16-entry cap). */
int32_t isaac_game_state_9d45c0_scan_remaining_nonneg(uint32_t rem);
/* walk continue (PE 0x9d7015 je head / 0x9d708b jne): node != head. */
int32_t isaac_game_state_9d45c0_walk_continue_5d4(uint32_t node,
                                                  uint32_t head);

/* --- 0x9d71b0 reader tail (0x62a B) --- */
/* io+8 >= 0xa2 (PE 0x009d72a0/0x009d72af cmp [edi+8],0x94,0xa2 ; jb
 * 0x9d74ac): the 0x94 lead cmp feeds a DEAD sbb/ecx,0x1f — single
 * UNSIGNED gate.  Re-homed from the v4 merged giant span (caller
 * 0x9cc84d read entry). */
int32_t isaac_game_state_9d71b0_io8_ge_0xa2(uint32_t io8);
/* io+8 >= 0x9f (PE 0x009d75bf jb): UNSIGNED. */
int32_t isaac_game_state_9d71b0_io8_ge_0x9f(uint32_t io8);
/* io+8 >= 0xa3 (PE 0x009d76c7 jb): UNSIGNED. */
int32_t isaac_game_state_9d71b0_io8_ge_0xa3(uint32_t io8);
/* (int32)count > 0 (PE 0x9d72ef/0x9d73e3 jle): SIGNED. */
int32_t isaac_game_state_9d71b0_count_pos_signed(uint32_t count);
/* (int32)idx < (int32)count (PE 0x9d73aa/0x9d749e jl): SIGNED. */
int32_t isaac_game_state_9d71b0_idx_lt_count_signed(uint32_t idx,
                                                    uint32_t count);
/* byte != 0 (PE 0x9d734f/0x9d7443/0x9d767f/0x9d7787 setne bool):
 * LOW-BYTE. */
int32_t isaac_game_state_9d71b0_byte_nonzero_setne(uint32_t byte);
/* vec slot full (PE 0x9d737c/0x9d7470/0x9d74eb/0x9d7535/0x9d768a/0x9d7792
 * je -> 0x69ee50/0x9d8660 push): ptr == end, FULL-dword. */
int32_t isaac_game_state_9d71b0_vec_slot_full(uint32_t ptr, uint32_t end);
/* count != 0 (PE 0x9d75ef/0x9d76f7 jbe): UNSIGNED. */
int32_t isaac_game_state_9d71b0_count_nonzero(uint32_t count);
/* idx < count (PE 0x9d76b8/0x9d77c0 jb): UNSIGNED. */
int32_t isaac_game_state_9d71b0_idx_lt_count(uint32_t idx, uint32_t count);

/* --- ABI v11 accessors --- */
uint32_t isaac_game_state_9cf000_va(void);
uint32_t isaac_game_state_9cf000_end_va(void);
uint32_t isaac_game_state_9cf000_body_bytes(void);
uint32_t isaac_game_state_9cf000_next_va(void);
uint32_t isaac_game_state_9cf000_clear_more_va(void);
uint32_t isaac_game_state_9cf000_caller_count(void);
uint32_t isaac_game_state_9cf000_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9cf050_va(void);
uint32_t isaac_game_state_9cf050_end_va(void);
uint32_t isaac_game_state_9cf050_body_bytes(void);
uint32_t isaac_game_state_9cf050_next_va(void);
uint32_t isaac_game_state_9cf050_caller_count(void);
uint32_t isaac_game_state_9cf050_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9cff40_va(void);
uint32_t isaac_game_state_9cff40_end_va(void);
uint32_t isaac_game_state_9cff40_body_bytes(void);
uint32_t isaac_game_state_9cff40_next_va(void);
uint32_t isaac_game_state_9cff40_io8_gate_0x92_va(void);
uint32_t isaac_game_state_9cff40_caller_count(void);
uint32_t isaac_game_state_9cff40_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d0100_va(void);
uint32_t isaac_game_state_9d0100_end_va(void);
uint32_t isaac_game_state_9d0100_body_bytes(void);
uint32_t isaac_game_state_9d0100_next_va(void);
uint32_t isaac_game_state_9d0100_caller_count(void);
uint32_t isaac_game_state_9d0100_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d02c0_va(void);
uint32_t isaac_game_state_9d02c0_end_va(void);
uint32_t isaac_game_state_9d02c0_body_bytes(void);
uint32_t isaac_game_state_9d02c0_next_va(void);
uint32_t isaac_game_state_9d02c0_caller_count(void);
uint32_t isaac_game_state_9d02c0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d0440_va(void);
uint32_t isaac_game_state_9d0440_end_va(void);
uint32_t isaac_game_state_9d0440_body_bytes(void);
uint32_t isaac_game_state_9d0440_next_va(void);
uint32_t isaac_game_state_9d0440_byte_c_gate_va(void);
uint32_t isaac_game_state_9d0440_byte_d_gate_va(void);
uint32_t isaac_game_state_9d0440_caller_count(void);
uint32_t isaac_game_state_9d0440_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d45c0_end_va(void);
uint32_t isaac_game_state_9d45c0_body_bytes(void);
uint32_t isaac_game_state_9d45c0_next_va(void);
uint32_t isaac_game_state_9d71b0_va(void);
uint32_t isaac_game_state_9d71b0_end_va(void);
uint32_t isaac_game_state_9d71b0_body_bytes(void);
uint32_t isaac_game_state_9d71b0_next_va(void);
uint32_t isaac_game_state_9d71b0_gs_cookie_dat(void);
uint32_t isaac_game_state_9d71b0_caller_count(void);
uint32_t isaac_game_state_9d71b0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8190_va(void);
uint32_t isaac_game_state_9d8190_end_va(void);
uint32_t isaac_game_state_9d8190_body_bytes(void);
uint32_t isaac_game_state_9d8190_next_va(void);
uint32_t isaac_game_state_9d8190_caller_count(void);
uint32_t isaac_game_state_9d8190_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d83f0_va(void);
uint32_t isaac_game_state_9d83f0_end_va(void);
uint32_t isaac_game_state_9d83f0_body_bytes(void);
uint32_t isaac_game_state_9d83f0_next_va(void);
uint32_t isaac_game_state_9d83f0_caller_count(void);
uint32_t isaac_game_state_9d83f0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8470_va(void);
uint32_t isaac_game_state_9d8470_end_va(void);
uint32_t isaac_game_state_9d8470_body_bytes(void);
uint32_t isaac_game_state_9d8470_next_va(void);
uint32_t isaac_game_state_9d8470_caller_count(void);
uint32_t isaac_game_state_9d8470_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d45c0_flags_pack_va(void);
uint32_t isaac_game_state_9d45c0_count_sar3_va(void);
uint32_t isaac_game_state_9d45c0_count_nonzero_va(void);
uint32_t isaac_game_state_9d45c0_idx_lt_count_va(void);
uint32_t isaac_game_state_9d45c0_count_22c_positive_va(void);
uint32_t isaac_game_state_9d45c0_idx_lt_count_22c_va(void);
uint32_t isaac_game_state_9d45c0_element_count_78_va(void);
uint32_t isaac_game_state_9d45c0_byte_count_36_va(void);
uint32_t isaac_game_state_9d45c0_byte_idx_lt_byte_count_va(void);
uint32_t isaac_game_state_9d45c0_byte_count_nonzero_va(void);
uint32_t isaac_game_state_9d45c0_byte_398_nonzero_va(void);
uint32_t isaac_game_state_9d45c0_word_idx_lt_count_va(void);
uint32_t isaac_game_state_9d45c0_idx_lt_8_va(void);
uint32_t isaac_game_state_9d45c0_idx_lt_6_va(void);
uint32_t isaac_game_state_9d45c0_idx_lt_byte_count_u32_va(void);
uint32_t isaac_game_state_9d45c0_element_count_34_va(void);
uint32_t isaac_game_state_9d45c0_byte_ne_ff_va(void);
uint32_t isaac_game_state_9d45c0_walk_continue_3c0_va(void);
uint32_t isaac_game_state_9d45c0_element_byte_nonzero_va(void);
uint32_t isaac_game_state_9d45c0_value_nonneg_va(void);
uint32_t isaac_game_state_9d45c0_scan_value_nonneg_va(void);
uint32_t isaac_game_state_9d45c0_scan_remaining_nonneg_va(void);
uint32_t isaac_game_state_9d45c0_walk_continue_5d4_va(void);
uint32_t isaac_game_state_9d71b0_io8_ge_0xa2_va(void);
uint32_t isaac_game_state_9d71b0_io8_ge_0x9f_va(void);
uint32_t isaac_game_state_9d71b0_io8_ge_0xa3_va(void);
uint32_t isaac_game_state_9d71b0_count_pos_signed_va(void);
uint32_t isaac_game_state_9d71b0_idx_lt_count_signed_va(void);
uint32_t isaac_game_state_9d71b0_byte_nonzero_setne_va(void);
uint32_t isaac_game_state_9d71b0_vec_slot_full_va(void);
uint32_t isaac_game_state_9d71b0_count_nonzero_va(void);
uint32_t isaac_game_state_9d71b0_idx_lt_count_va(void);

/* --- ABI v12: save-piece cluster laws (census
 *     section-notes/game-state-v12-savepiece/NOTES.md).  Bodies stay
 *     typed-host; lane-free decision gates land.  Byte-gate discipline
 *     identical to v1..v11 (uint32_t params only; byte gates mask & 0xff
 *     INSIDE bodies; FULL-dword gates unmasked; SIGNED gates use the i64
 *     sign-extend form; the 0xc/0x34 magic counts are the MSVC
 *     SIGNED-floor divisions). --- */

/* --- 0x9d77e0 sub-object serializer (0x569 B; ret 4 @0x9d7d46;
 *     24 direct E8 ALL 0x683410 row-writer — verified NO 0x9d45c0) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_VA = 0x009d77e0u; /* sub-object serializer (this+0x8c); 6+2 scalar u32 rows + FOUR 0xc-stride div-0xc element loops */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_STRIDE = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_A_BASE_OFF = 0x24u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_A_END_OFF = 0x28u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_B_BASE_OFF = 0x18u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_B_END_OFF = 0x1cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_C_BASE_OFF = 0x44u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_C_END_OFF = 0x48u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_D_BASE_OFF = 0x38u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_D_END_OFF = 0x3cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_ELEM_BYTE4_OFF = 0x4u; /* loops A/B flag byte */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_ELEM_BYTE8_OFF = 0x8u; /* loops C/D flag byte */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_COUNT_0XC_MAGIC = 0x2aaaaaabu; /* imul ecx / sar edx,1 / shr / add — SIGNED floor div-by-0xc */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_COUNT_VA = 0x009d78c4u; /* first div-0xc (loop A count); twins 0x9d79da/0x9d7b31/0x9d7c3c */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_COUNT_ZERO_GATE_VA = 0x009d790fu; /* je skip (loop A); twins 0x9d7a27/0x9d7b7c/0x9d7c89 */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_LOOP_MORE_VA = 0x009d79c9u; /* cmp [ebp-0xc],eax ; jb (loop A); twins 0x9d7ada/0x9d7c2b/0x9d7d3a */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_BYTE4_GATE_VA = 0x009d7959u; /* setne byte [elem+4] (loop A); twin 0x9d7a6b */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_BYTE8_GATE_VA = 0x009d7becu; /* setne byte [elem+8] (loop C); twin 0x9d7cf7 */
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D77E0_CALLER_VA_0 = 0x009c988cu; /* IN GameState::write 0x9c9340 (LEAF_9D77E0 site; lea-corrected census) */

/* --- 0x9d8190 save-piece writer (0x255 B; SEH 0xb0f3cd + GS 0xbf93b4;
 *     2 callers; loops 0x9d45c0 piece calls @0x9d82a5; seed null->logger;
 *     SSO>=0x10 cmov; 0x96696996 checksum tail) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_PIECE_COUNT_OFF = 0x19d78u; /* piece count dword (SIGNED loop) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_PIECE_BASE_OFF = 0x19d7cu; /* piece array base (stride 0x5dc) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_PIECE_STRIDE = 0x5dcu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_SEED_PTR_OFF = 0x1e728u; /* seed-string holder ptr (0 -> logger) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_SSO_THRESHOLD = 0x10u; /* message SSO size threshold (cmov @0x9d82f2; free gate @0x9d831d) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_PIECE_COUNT_POS_VA = 0x009d828fu; /* cmp [ebx+0x19d78],0 ; jle skip — SIGNED > 0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_PIECE_IDX_LT_VA = 0x009d82b1u; /* cmp edi,[ebx+0x19d78] ; jl loop — SIGNED idx < count */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_45C0_CALL_VA = 0x009d82a5u; /* per-piece call 0x9d45c0 (caller-site accounting §4) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_SEED_GATE_VA = 0x009d82bfu; /* test eax,eax ; jne skip-log — FULL-dword ptr != 0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_SSO_HEAP_GATE_VA = 0x009d82f2u; /* cmp [ebp-0x28],0x10 ; cmovae esi,[ebp-0x3c] — FULL-dword UNSIGNED */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_SSO_FREE_GATE_VA = 0x009d831du; /* cmp edx,0x10 ; jb skip-free (size>=0x10 -> sized free 0xaef15c; HOST leaf pin) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CHECKSUM_STORE_VA = 0x009d83adu; /* mov [ebx+0x1fda4],eax — raw acc on the SHARED checksum field */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CHECKSUM_XOR_VA = 0x009d83b3u; /* xor eax,0x96696996 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_SEED_LOG_STR_VA = 0x00b1c640u; /* "Error: Game Start Seed was not set.\n" (shared with write 0x9c9340) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CHECKSUM_XOR = 0x96696996u; /* shared finalize xor (W22/9d7d50 machine) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8190_CHECKSUM_OFF = 0x1fda4u; /* GameState checksum field (shared) */

/* --- shared leaves: 0x9d8660 (0xc-stride push-back), 0x9d8820
 *     (0x34-stride zero-fill), 0x9d8a20 (0x34-stride reserve) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_VA = 0x009d8660u; /* 0xc-stride vector push-back w/ growth (cap 0x15555555); 8 callers */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_END_VA = 0x009d8813u; /* ret 8 @0x9d8800; int3 pad @0x9d8803 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_BODY_BYTES = 0x1b3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_NEXT_VA = 0x009d8820u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_STRIDE = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_MAX_COUNT = 0x15555555u; /* 0x15555555 * 0xc == 2^32 (magic count cap) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_COUNT_0XC_VA = 0x009d868cu; /* imul ecx (size bytes) div-0xc; index twin @0x9d867c */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_COUNT_MAX_GATE_VA = 0x009d8697u; /* cmp eax,0x15555555 ; je -> 0x415bc0 throw (count == max) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_GROW_MAX_CMOV_VA = 0x009d8734u; /* cmovae ecx,eax — target = max(new_count, cap + (cap>>1)) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_GROW_TARGET_OK_VA = 0x009d873du; /* cmp ecx,0x15555555 ; ja -> 0x40cee0 throw */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_COPY_MORE_VA = 0x009d8726u; /* cmp eax,edi ; jne — old-range copy walk (twins 0x9d8765/0x9d8795) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_COUNT = 8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_0 = 0x006fde3eu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_1 = 0x009d76acu; /* IN 0x9d71b0 (vec_slot_full push) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_2 = 0x009d77b4u; /* IN 0x9d71b0 (vec_slot_full push) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_3 = 0x009e5656u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_4 = 0x009e56d6u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_5 = 0x009e589fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_6 = 0x009e591cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8660_CALLER_VA_7 = 0x009e5aa3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_VA = 0x009d8820u; /* 0x34-stride zero-fill (13 dwords/slot); 2 callers */
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_END_VA = 0x009d8896u; /* ret 0xc @0x9d8893; int3 pad @0x9d8896 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_BODY_BYTES = 0x76u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_NEXT_VA = 0x009d88a0u; /* 8-stride reserve (unpinned host) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_STRIDE = 0x34u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_SLOT_DWORDS = 13u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_COUNT_GATE_VA = 0x009d8829u; /* test ecx,ecx ; je skip — FULL-dword */
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_LOOP_MORE_VA = 0x009d888du; /* sub ecx,1 ; jne — countdown */
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_CALLER_VA_0 = 0x009d845eu; /* IN 0x9d83f0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8820_CALLER_VA_1 = 0x009d8a9cu; /* IN 0x9d8a20 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_VA = 0x009d8a20u; /* 0x34-stride reserve (cap 0x4ec4ec4); 1 caller */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_END_VA = 0x009d8ae0u; /* ret 8 @0x9d8ac0; int3 pad @0x9d8ae0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_BODY_BYTES = 0xc0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_NEXT_VA = 0x009d8af0u; /* 8-stride reserve twin (unpinned host) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_STRIDE = 0x34u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_MAX_COUNT = 0x4ec4ec4u; /* count cap (0x4ec4ec4 * 0x34 == 2^32) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_COUNT_0X34_VA = 0x009d8a43u; /* imul ecx (size) / sar edx,4 — SIGNED floor div-by-0x34 (R16/9d45c0 twin) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_COUNT_LE_CAP_VA = 0x009d8a35u; /* cmp ebx,0x4ec4ec4 ; ja -> 0x415bc0 throw */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_GROW_TARGET_OK_VA = 0x009d8ad4u; /* cmp edi,0x4ec4ec4 ; jbe alloc; ja -> 0x40cee0 throw */
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8A20_CALLER_VA_0 = 0x009d8449u; /* IN 0x9d83f0 */
/* reserve-leaves trio 0x9d88a0/0x9d8960/0x9d8af0 — landed at ABI v13
 * (see the v13 block below; v12 §3 listed them as unpinned host). */

/* --- 0x9d45c0 writer giant caller-site accounting (4 direct rel32
 *     callers; lea-corrected census; NOTES §4) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_CALLER_COUNT = 4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_CALLER_VA_0 = 0x009061f3u; /* IN host 0x905f60 (stack GameState ctor 0x9cf050 + writer dispatch) */
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_CALLER_VA_1 = 0x009ca373u; /* IN GameState::write 0x9c9340 (LEAF_9D45C0 site 1) */
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_CALLER_VA_2 = 0x009ca44cu; /* IN GameState::write 0x9c9340 (LEAF_9D45C0 site 2) */
static constexpr uint32_t ISAAC_GAME_STATE_9D45C0_CALLER_VA_3 = 0x009d82a5u; /* IN 0x9d8190 save-piece writer (per-piece loop) */

/* ---------------------------------------------------------------------------
 * L1 — 0x9d77e0 element count (PE 0x009d78c4; twins 0x9d79da/0x9d7b31/
 *   0x9d7c3c): (int32)(end-begin)/0xc via the 0x2aaaaaab magic — SIGNED
 *   floor division by 12 (imul ecx / sar edx,1 / shr eax,0x1f / add).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d77e0_element_count_0xc(uint32_t begin,
                                                   uint32_t end);

/* ---------------------------------------------------------------------------
 * L2 — 0x9d77e0 loop-entry gate (PE 0x009d790f; twins 0x9d7a27/0x9d7b7c/
 *   0x9d7c89): cmp eax,0 ; je skip — FULL-dword: the 0xc-stride element
 *   loop runs iff count != 0.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d77e0_loop_count_nonzero(uint32_t count);

/* ---------------------------------------------------------------------------
 * L3 — 0x9d77e0 loop bound (PE 0x009d79c9; twins 0x9d7ada/0x9d7c2b/
 *   0x9d7d3a): cmp [ebp-0xc],eax ; jb — UNSIGNED idx < count.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d77e0_idx_lt_count(uint32_t idx, uint32_t count);

/* ---------------------------------------------------------------------------
 * L4 — 0x9d77e0 element byte-flag @+4 (PE 0x009d7959 setne; twin
 *   0x9d7a6b): cmp byte [elem+4],0 ; setne — LOW-BYTE nonzero (loops A/B).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d77e0_elem_byte4_nonzero(uint32_t byte);

/* ---------------------------------------------------------------------------
 * L5 — 0x9d77e0 element byte-flag @+8 (PE 0x009d7bec setne; twin
 *   0x9d7cf7): cmp byte [elem+8],0 ; setne — LOW-BYTE nonzero (loops C/D).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d77e0_elem_byte8_nonzero(uint32_t byte);

/* ---------------------------------------------------------------------------
 * L6 — 0x9d8190 piece-loop entry (PE 0x009d828f cmp [ebx+0x19d78],0 ;
 *   jle skip): SIGNED (int32)count > 0 — the 0x9d45c0 piece loop.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8190_piece_count_positive(uint32_t count);

/* ---------------------------------------------------------------------------
 * L7 — 0x9d8190 piece-loop bound (PE 0x009d82b1 cmp edi,[ebx+0x19d78] ;
 *   jl): SIGNED (int32)idx < (int32)count.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8190_piece_idx_lt_count(uint32_t idx,
                                                   uint32_t count);

/* ---------------------------------------------------------------------------
 * L8 — 0x9d8190 seed-object gate (PE 0x009d82bf test eax,eax ; jne
 *   skip-log): FULL-dword ptr [GameState+0x1e728] != 0 skips the HOST
 *   logger (0x10, 0xb1c640); zero -> log + null seed string.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8190_seed_obj_present(uint32_t ptr_1e728);

/* ---------------------------------------------------------------------------
 * L9 — 0x9d8190 message SSO heap select (PE 0x009d82f2 cmp
 *   [ebp-0x28],0x10 ; cmovae): FULL-dword UNSIGNED size >= 0x10 loads the
 *   heap pointer word at the SSO slot, else the inline buffer address
 *   (P4/Q4 shape; free-arm twin pinned @0x9d831d — HOST).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8190_msg_sso_heap_used(uint32_t size);

/* ---------------------------------------------------------------------------
 * L10 — 0x9d8190 message string pointer (mem-law, P5/Q5 shape):
 *   size < 0x10 -> sso_off (u32 wrap); else u32 LE at mem + sso_off.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8190_msg_sso_ptr(const uint8_t* mem,
                                             uint32_t sso_off,
                                             uint32_t size);

/* ---------------------------------------------------------------------------
 * L11 — 0x9d8190 checksum stream word (PE 0x009d83b3 xor eax,0x96696996;
 *   raw acc stored @GameState+0x1fda4 @0x9d83ad): streamed dword =
 *   acc ^ 0x96696996 — W22/9d7d50 machine, GameState-owned pin.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8190_checksum_stream_word(uint32_t acc);

/* ---------------------------------------------------------------------------
 * L12 — 0x9d8660 element count (PE 0x009d868c; index twin 0x9d867c):
 *   (int32)(end-begin)/0xc SIGNED floor (0x2aaaaaab magic).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8660_element_count_0xc(uint32_t begin,
                                                   uint32_t end);

/* ---------------------------------------------------------------------------
 * L13 — 0x9d8660 count-not-max gate (PE 0x009d8697 cmp eax,0x15555555 ;
 *   je -> 0x415bc0 throw): FULL-dword COUNT != 0x15555555 (0x15555555
 *   elements * 0xc == 2^32).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8660_count_not_maxed(uint32_t count);

/* ---------------------------------------------------------------------------
 * L14 — 0x9d8660 growth target (PE 0x009d8734 cmovae ecx,eax):
 *   max(new_count, cap_count + (cap_count>>1)) — the capacity-growth
 *   policy (1.5x, floored half) before the overflow check.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8660_grow_target_count(uint32_t new_count,
                                                   uint32_t cap_count);

/* ---------------------------------------------------------------------------
 * L15 — 0x9d8660 growth-target overflow gate (PE 0x009d873d cmp
 *   ecx,0x15555555 ; ja -> 0x40cee0 throw): UNSIGNED target <= 0x15555555.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8660_grow_target_ok(uint32_t target);

/* ---------------------------------------------------------------------------
 * L16 — 0x9d8660 copy walk (PE 0x009d8726 cmp eax,edi ; jne; twins
 *   0x9d8765/0x9d8795): FULL-dword cur != end — the old-range element
 *   copy loop.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8660_copy_more(uint32_t cur, uint32_t end);

/* ---------------------------------------------------------------------------
 * L17 — 0x9d8820 zero-fill entry (PE 0x009d8829 test ecx,ecx ; je skip):
 *   FULL-dword count != 0 (13-dword slots at 0x34 stride).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8820_count_nonzero(uint32_t count);

/* ---------------------------------------------------------------------------
 * L18 — 0x9d8820 zero-fill bound (PE 0x009d888d sub ecx,1 ; jne):
 *   (remaining - 1) != 0 u32 — W16 lane7 / T2 countdown class.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8820_loop_more(uint32_t remaining);

/* ---------------------------------------------------------------------------
 * L19 — 0x9d8a20 element count (PE 0x009d8a43 imul ecx / sar edx,4):
 *   (int32)(end-begin)/0x34 SIGNED floor (0x4ec4ec4f magic; R16/9d45c0
 *   element_count_34 twin).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8a20_element_count_0x34(uint32_t begin,
                                                    uint32_t end);

/* ---------------------------------------------------------------------------
 * L20 — 0x9d8a20 input count gate (PE 0x009d8a35 cmp ebx,0x4ec4ec4 ;
 *   ja -> 0x415bc0 throw): UNSIGNED count <= 0x4ec4ec4.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8a20_count_le_cap(uint32_t count);

/* ---------------------------------------------------------------------------
 * L21 — 0x9d8a20 growth-target overflow gate (PE 0x009d8ad4 cmp
 *   edi,0x4ec4ec4 ; jbe alloc; ja -> 0x40cee0 throw): UNSIGNED
 *   target <= 0x4ec4ec4.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8a20_grow_target_ok(uint32_t target);

/* --- ABI v12 accessors --- */
uint32_t isaac_game_state_9d77e0_va(void);
uint32_t isaac_game_state_9d77e0_end_va(void);
uint32_t isaac_game_state_9d77e0_body_bytes(void);
uint32_t isaac_game_state_9d77e0_next_va(void);
uint32_t isaac_game_state_9d77e0_stride(void);
uint32_t isaac_game_state_9d77e0_loop_a_base_off(void);
uint32_t isaac_game_state_9d77e0_loop_a_end_off(void);
uint32_t isaac_game_state_9d77e0_loop_b_base_off(void);
uint32_t isaac_game_state_9d77e0_loop_b_end_off(void);
uint32_t isaac_game_state_9d77e0_loop_c_base_off(void);
uint32_t isaac_game_state_9d77e0_loop_c_end_off(void);
uint32_t isaac_game_state_9d77e0_loop_d_base_off(void);
uint32_t isaac_game_state_9d77e0_loop_d_end_off(void);
uint32_t isaac_game_state_9d77e0_elem_byte4_off(void);
uint32_t isaac_game_state_9d77e0_elem_byte8_off(void);
uint32_t isaac_game_state_9d77e0_count_magic(void);
uint32_t isaac_game_state_9d77e0_count_va(void);
uint32_t isaac_game_state_9d77e0_count_zero_gate_va(void);
uint32_t isaac_game_state_9d77e0_loop_more_va(void);
uint32_t isaac_game_state_9d77e0_byte4_gate_va(void);
uint32_t isaac_game_state_9d77e0_byte8_gate_va(void);
uint32_t isaac_game_state_9d77e0_caller_count(void);
uint32_t isaac_game_state_9d77e0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8190_piece_count_off(void);
uint32_t isaac_game_state_9d8190_piece_base_off(void);
uint32_t isaac_game_state_9d8190_piece_stride(void);
uint32_t isaac_game_state_9d8190_seed_ptr_off(void);
uint32_t isaac_game_state_9d8190_piece_count_pos_va(void);
uint32_t isaac_game_state_9d8190_piece_idx_lt_va(void);
uint32_t isaac_game_state_9d8190_45c0_call_va(void);
uint32_t isaac_game_state_9d8190_seed_gate_va(void);
uint32_t isaac_game_state_9d8190_sso_heap_gate_va(void);
uint32_t isaac_game_state_9d8190_sso_free_gate_va(void);
uint32_t isaac_game_state_9d8190_checksum_store_va(void);
uint32_t isaac_game_state_9d8190_checksum_xor_va(void);
uint32_t isaac_game_state_9d8190_seed_log_str_va(void);
uint32_t isaac_game_state_9d8190_checksum_xor(void);
uint32_t isaac_game_state_9d8190_checksum_off(void);
uint32_t isaac_game_state_9d8660_va(void);
uint32_t isaac_game_state_9d8660_end_va(void);
uint32_t isaac_game_state_9d8660_body_bytes(void);
uint32_t isaac_game_state_9d8660_next_va(void);
uint32_t isaac_game_state_9d8660_stride(void);
uint32_t isaac_game_state_9d8660_max_count(void);
uint32_t isaac_game_state_9d8660_count_0xc_va(void);
uint32_t isaac_game_state_9d8660_count_max_gate_va(void);
uint32_t isaac_game_state_9d8660_grow_max_cmov_va(void);
uint32_t isaac_game_state_9d8660_grow_target_ok_va(void);
uint32_t isaac_game_state_9d8660_copy_more_va(void);
uint32_t isaac_game_state_9d8660_caller_count(void);
uint32_t isaac_game_state_9d8660_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8820_va(void);
uint32_t isaac_game_state_9d8820_end_va(void);
uint32_t isaac_game_state_9d8820_body_bytes(void);
uint32_t isaac_game_state_9d8820_next_va(void);
uint32_t isaac_game_state_9d8820_stride(void);
uint32_t isaac_game_state_9d8820_slot_dwords(void);
uint32_t isaac_game_state_9d8820_count_gate_va(void);
uint32_t isaac_game_state_9d8820_loop_more_va(void);
uint32_t isaac_game_state_9d8820_caller_count(void);
uint32_t isaac_game_state_9d8820_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8a20_va(void);
uint32_t isaac_game_state_9d8a20_end_va(void);
uint32_t isaac_game_state_9d8a20_body_bytes(void);
uint32_t isaac_game_state_9d8a20_next_va(void);
uint32_t isaac_game_state_9d8a20_stride(void);
uint32_t isaac_game_state_9d8a20_max_count(void);
uint32_t isaac_game_state_9d8a20_count_0x34_va(void);
uint32_t isaac_game_state_9d8a20_count_le_cap_va(void);
uint32_t isaac_game_state_9d8a20_grow_target_ok_va(void);
uint32_t isaac_game_state_9d8a20_caller_count(void);
uint32_t isaac_game_state_9d8a20_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d45c0_caller_count(void);
uint32_t isaac_game_state_9d45c0_caller_va_at(uint32_t index);

/* --- ABI v13: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 (census
 *     section-notes/game-state-v13-reserve-leaves/NOTES.md).  The three
 *     MSVC vector::reserve 1.5x-growth arms (thiscall reserve(count):
 *     begin@+0/end@+4/cap@+8, ret 8).  Bodies stay typed-host
 *     (identify-zhl: NO exact matches; alloc 0x40cf00 / throw
 *     0x415bc0/0x40cee0 / memset 0xaf05e5 / memmove 0xaf08bd / commit
 *     0x4268e0|0x7de290 stay host).  Byte-gate discipline identical to
 *     v1..v12: uint32_t params only; EVERY gate here is FULL-dword
 *     (no byte gates in the trio); UNSIGNED compares unmasked; the
 *     sar counts are the floor form (9d45c0 count_sar3 twin); the
 *     tail-diff gate is the u32 subtraction equality. --- */

/* --- 0x9d88a0 — 8-stride reserve (cap 0x1fffffff; ret 8 @0x9d8933;
 *     memset tail 0xaf05e5; memmove 0xaf08bd; commit 0x4268e0) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_VA = 0x009d88a0u; /* 8-stride reserve (cap 0x1fffffff); 1 caller */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_END_VA = 0x009d8953u; /* ret 8 @0x9d8933; int3 pad @0x9d8953 */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_BODY_BYTES = 0xb3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_NEXT_VA = 0x009d8960u; /* 0x9d8960 reserve twin (v13) */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_STRIDE = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_MAX_COUNT = 0x1fffffff; /* count cap (0x1fffffff * 8 == 2^32) */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_COUNT_LE_CAP_VA = 0x009d88b2u; /* cmp edi,0x1fffffff ; ja -> 0x415bc0 throw (cmp @0x9d88ac) */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_COUNT_VA = 0x009d88c2u; /* sar ecx,3 — element count floor /8 */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_GROWTH_OK_VA = 0x009d88d8u; /* cmp ecx,eax ; jbe 0x9d8936 (eax = 0x1fffffff - (cap>>1)); cmp @0x9d88d6 */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_GROW_TARGET_COUNT_VA = 0x009d893bu; /* cmp esi,edi ; jae keep-target (cmp @0x9d8939) */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_GROW_TARGET_OK_VA = 0x009d8947u; /* cmp esi,0x1fffffff ; jbe alloc; ja -> 0x40cee0 throw (cmp @0x9d8941) */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_TAIL_FILL_NEEDED_VA = 0x009d88f8u; /* sub eax,ecx ; je skip-memset 0xaf05e5 (sub @0x9d88f4) */
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D88A0_CALLER_VA_0 = 0x009cddc0u; /* IN read entry 0x9cc1a0 */

/* --- 0x9d8960 — 0x10-stride reserve (cap 0xfffffff; ret 8 @0x9d89f2;
 *     memset tail 0xaf05e5; memmove 0xaf08bd; commit 0x7de290) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_VA = 0x009d8960u; /* 0x10-stride reserve (cap 0xfffffff); 1 caller */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_END_VA = 0x009d8a12u; /* ret 8 @0x9d89f2; int3 pad @0x9d8a12 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_BODY_BYTES = 0xb2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_NEXT_VA = 0x009d8a20u; /* 0x9d8a20 0x34-stride reserve (v12) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_STRIDE = 0x10u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_MAX_COUNT = 0xfffffff; /* count cap (0xfffffff * 0x10 == 2^32) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_COUNT_LE_CAP_VA = 0x009d8972u; /* cmp edi,0xfffffff ; ja -> 0x415bc0 throw (cmp @0x9d896c) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_COUNT_VA = 0x009d8982u; /* sar ecx,4 — element count floor /0x10 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_GROWTH_OK_VA = 0x009d8998u; /* cmp ecx,eax ; jbe 0x9d89f5 (eax = 0xfffffff - (cap>>1)); cmp @0x9d8996 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_GROW_TARGET_COUNT_VA = 0x009d89fau; /* cmp esi,edi ; jae keep-target (cmp @0x9d89f8) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_GROW_TARGET_OK_VA = 0x009d8a06u; /* cmp esi,0xfffffff ; jbe alloc; ja -> 0x40cee0 throw (cmp @0x9d8a00) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_TAIL_FILL_NEEDED_VA = 0x009d89bbu; /* sub ecx,[ebp-4] ; je skip-memset 0xaf05e5 (sub @0x9d89b6) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8960_CALLER_VA_0 = 0x009d2bcau; /* IN reader giant 0x9d05d0 */

/* --- 0x9d8af0 — 8-stride reserve twin (cap 0x1fffffff; ret 8 @0x9d8bb1;
 *     INLINE {0,0xffffffff} slot init + 8-byte copy loop; commit 0x4268e0) --- */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_VA = 0x009d8af0u; /* 8-stride reserve twin (cap 0x1fffffff); 1 caller */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_END_VA = 0x009d8bd8u; /* ret 8 @0x9d8bb1; int3 pad @0x9d8bd8 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_BODY_BYTES = 0xe8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_NEXT_VA = 0x009d8be0u; /* v14 LANDED: g_Manager can-save mode (al 0/1/2) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_STRIDE = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_MAX_COUNT = 0x1fffffff; /* count cap (0x1fffffff * 8 == 2^32) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_COUNT_LE_CAP_VA = 0x009d8b07u; /* cmp ebx,0x1fffffff ; ja -> 0x415bc0 throw (cmp @0x9d8b01) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_COUNT_VA = 0x009d8b17u; /* sar ecx,3 — element count floor /8 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_GROWTH_OK_VA = 0x009d8b2du; /* cmp ecx,eax ; jbe 0x9d8bb4 (eax = 0x1fffffff - (cap>>1)); cmp @0x9d8b2b */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_GROW_TARGET_COUNT_VA = 0x009d8bb9u; /* cmp edi,ebx ; jae keep-target (cmp @0x9d8bb7) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_GROW_TARGET_OK_VA = 0x009d8bc8u; /* cmp edi,0x1fffffff ; jbe alloc; ja -> 0x40cee0 throw (cmp @0x9d8bc2) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_TAIL_INIT_NEEDED_VA = 0x009d8b53u; /* sub edx,eax ; je skip-init (sub @0x9d8b51) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_TAIL_INIT_MORE_VA = 0x009d8b73u; /* sub edx,1 ; jne 0x9d8b60 — countdown (W16 lane7 / T2 class) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_COPY_NEEDED_VA = 0x009d8b82u; /* cmp edx,eax ; je skip-copy (cmp @0x9d8b80) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_COPY_MORE_VA = 0x009d8b99u; /* cmp edx,ebx ; jne 0x9d8b86 — 8-byte walk (cmp @0x9d8b97) */
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8AF0_CALLER_VA_0 = 0x009d1379u; /* IN reader giant 0x9d05d0 */

/* ---------------------------------------------------------------------------
 * T1 — 0x9d88a0 count-le-cap (PE 0x009d88ac cmp / 0x009d88b2 ja ->
 *   0x415bc0 throw): UNSIGNED count <= 0x1fffffff.  FULL-dword.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d88a0_count_le_cap(uint32_t count);

/* ---------------------------------------------------------------------------
 * T2 — 0x9d88a0 element count (PE 0x009d88c2 sar ecx,3):
 *   (int32)(end-begin) >> 3 — arithmetic-shift floor (9d45c0
 *   count_sar3 twin; exact for all u32 diffs).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d88a0_element_count_8(uint32_t begin,
                                                 uint32_t end);

/* ---------------------------------------------------------------------------
 * T3 — 0x9d88a0 growth-within-cap pre-check (PE 0x009d88d6 cmp /
 *   0x009d88d8 jbe 0x9d8936): UNSIGNED cap <= 0x1fffffff - (cap>>1) —
 *   the normal 1.5x target path; 0 else => the grow-to-max arm (esi =
 *   0x1fffffff).  (cap>>1) is the LOGICAL shift.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d88a0_growth_ok(uint32_t cap);

/* ---------------------------------------------------------------------------
 * T4 — 0x9d88a0 grow-target merge (PE 0x009d8939 cmp / 0x009d893b jae
 *   keep): max(new_count, cap + (cap>>1)) u32 — 1.5x growth policy
 *   (9d8660_grow_target_count twin).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d88a0_grow_target_count(uint32_t new_count,
                                                   uint32_t cap);

/* ---------------------------------------------------------------------------
 * T5 — 0x9d88a0 grow-target-ok (PE 0x009d8941 cmp / 0x009d8947 jbe
 *   alloc; ja -> 0x40cee0 throw): UNSIGNED target <= 0x1fffffff.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d88a0_grow_target_ok(uint32_t target);

/* ---------------------------------------------------------------------------
 * T6 — 0x9d88a0 tail-fill trigger (PE 0x009d88f8 je skip-memset):
 *   ((new_count - old_count) u32) != 0 -> the grown tail is zero-filled
 *   via 0xaf05e5.  FULL-dword subtraction equality (mod 2^32).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d88a0_tail_fill_needed(uint32_t new_count,
                                                 uint32_t old_count);

/* ---------------------------------------------------------------------------
 * U1 — 0x9d8960 count-le-cap (PE 0x009d896c cmp / 0x009d8972 ja ->
 *   0x415bc0 throw): UNSIGNED count <= 0xfffffff (T1 twin, own cap).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8960_count_le_cap(uint32_t count);

/* ---------------------------------------------------------------------------
 * U2 — 0x9d8960 element count (PE 0x009d8982 sar ecx,4):
 *   (int32)(end-begin) >> 4 — arithmetic-shift floor /0x10.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8960_element_count_16(uint32_t begin,
                                                  uint32_t end);

/* ---------------------------------------------------------------------------
 * U3 — 0x9d8960 growth-within-cap pre-check (PE 0x009d8996 cmp /
 *   0x009d8998 jbe 0x9d89f5): UNSIGNED cap <= 0xfffffff - (cap>>1).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8960_growth_ok(uint32_t cap);

/* ---------------------------------------------------------------------------
 * U4 — 0x9d8960 grow-target merge (PE 0x009d89f8 cmp / 0x009d89fa jae
 *   keep): max(new_count, cap + (cap>>1)) u32.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8960_grow_target_count(uint32_t new_count,
                                                   uint32_t cap);

/* ---------------------------------------------------------------------------
 * U5 — 0x9d8960 grow-target-ok (PE 0x009d8a00 cmp / 0x009d8a06 jbe
 *   alloc; ja -> 0x40cee0 throw): UNSIGNED target <= 0xfffffff.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8960_grow_target_ok(uint32_t target);

/* ---------------------------------------------------------------------------
 * U6 — 0x9d8960 tail-fill trigger (PE 0x009d89bb je skip-memset):
 *   ((new_count - old_count) u32) != 0 (T6 twin).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8960_tail_fill_needed(uint32_t new_count,
                                                 uint32_t old_count);

/* ---------------------------------------------------------------------------
 * V1 — 0x9d8af0 count-le-cap (PE 0x009d8b01 cmp / 0x009d8b07 ja ->
 *   0x415bc0 throw): UNSIGNED count <= 0x1fffffff (T1 twin, own pins).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_count_le_cap(uint32_t count);

/* ---------------------------------------------------------------------------
 * V2 — 0x9d8af0 element count (PE 0x009d8b17 sar ecx,3):
 *   (int32)(end-begin) >> 3 floor (T2 twin).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8af0_element_count_8(uint32_t begin,
                                                 uint32_t end);

/* ---------------------------------------------------------------------------
 * V3 — 0x9d8af0 growth-within-cap pre-check (PE 0x009d8b2b cmp /
 *   0x009d8b2d jbe 0x9d8bb4): UNSIGNED cap <= 0x1fffffff - (cap>>1).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_growth_ok(uint32_t cap);

/* ---------------------------------------------------------------------------
 * V4 — 0x9d8af0 grow-target merge (PE 0x009d8bb7 cmp / 0x009d8bb9 jae
 *   keep): max(new_count, cap + (cap>>1)) u32.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9d8af0_grow_target_count(uint32_t new_count,
                                                   uint32_t cap);

/* ---------------------------------------------------------------------------
 * V5 — 0x9d8af0 grow-target-ok (PE 0x009d8bc2 cmp / 0x009d8bc8 jbe
 *   alloc; ja -> 0x40cee0 throw): UNSIGNED target <= 0x1fffffff.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_grow_target_ok(uint32_t target);

/* ---------------------------------------------------------------------------
 * V6 — 0x9d8af0 tail-init trigger (PE 0x009d8b51 sub / 0x009d8b53 je
 *   skip-init): ((new_count - old_count) u32) != 0 -> the INLINE slot
 *   init loop ({0, 0xffffffff} per 8-byte slot).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_tail_init_needed(uint32_t new_count,
                                                 uint32_t old_count);

/* ---------------------------------------------------------------------------
 * V7 — 0x9d8af0 tail-init loop bound (PE 0x009d8b70 sub,1 / 0x009d8b73
 *   jne): ((remaining - 1) != 0) u32 — the countdown (W16 lane7 / T2 /
 *   X1 class).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_tail_init_more(uint32_t remaining);

/* ---------------------------------------------------------------------------
 * V8 — 0x9d8af0 copy-entry gate (PE 0x009d8b80 cmp / 0x009d8b82 je
 *   skip-copy): FULL-dword begin != end — the old range is copied iff
 *   non-empty (9d8660_copy_more entry shape).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_copy_needed(uint32_t begin, uint32_t end);

/* ---------------------------------------------------------------------------
 * V9 — 0x9d8af0 8-byte copy walk bound (PE 0x009d8b97 cmp / 0x009d8b99
 *   jne): FULL-dword cur != end (9d8660_copy_more / 9d45c0
 *   walk_continue_3c0 shape).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9d8af0_copy_more(uint32_t cur, uint32_t end);

/* --- ABI v13 accessors: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 --- */
uint32_t isaac_game_state_9d88a0_va(void);
uint32_t isaac_game_state_9d88a0_end_va(void);
uint32_t isaac_game_state_9d88a0_body_bytes(void);
uint32_t isaac_game_state_9d88a0_next_va(void);
uint32_t isaac_game_state_9d88a0_stride(void);
uint32_t isaac_game_state_9d88a0_max_count(void);
uint32_t isaac_game_state_9d88a0_count_le_cap_va(void);
uint32_t isaac_game_state_9d88a0_count_va(void);
uint32_t isaac_game_state_9d88a0_growth_ok_va(void);
uint32_t isaac_game_state_9d88a0_grow_target_count_va(void);
uint32_t isaac_game_state_9d88a0_grow_target_ok_va(void);
uint32_t isaac_game_state_9d88a0_tail_fill_needed_va(void);
uint32_t isaac_game_state_9d88a0_caller_count(void);
uint32_t isaac_game_state_9d88a0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8960_va(void);
uint32_t isaac_game_state_9d8960_end_va(void);
uint32_t isaac_game_state_9d8960_body_bytes(void);
uint32_t isaac_game_state_9d8960_next_va(void);
uint32_t isaac_game_state_9d8960_stride(void);
uint32_t isaac_game_state_9d8960_max_count(void);
uint32_t isaac_game_state_9d8960_count_le_cap_va(void);
uint32_t isaac_game_state_9d8960_count_va(void);
uint32_t isaac_game_state_9d8960_growth_ok_va(void);
uint32_t isaac_game_state_9d8960_grow_target_count_va(void);
uint32_t isaac_game_state_9d8960_grow_target_ok_va(void);
uint32_t isaac_game_state_9d8960_tail_fill_needed_va(void);
uint32_t isaac_game_state_9d8960_caller_count(void);
uint32_t isaac_game_state_9d8960_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8af0_va(void);
uint32_t isaac_game_state_9d8af0_end_va(void);
uint32_t isaac_game_state_9d8af0_body_bytes(void);
uint32_t isaac_game_state_9d8af0_next_va(void);
uint32_t isaac_game_state_9d8af0_stride(void);
uint32_t isaac_game_state_9d8af0_max_count(void);
uint32_t isaac_game_state_9d8af0_count_le_cap_va(void);
uint32_t isaac_game_state_9d8af0_count_va(void);
uint32_t isaac_game_state_9d8af0_growth_ok_va(void);
uint32_t isaac_game_state_9d8af0_grow_target_count_va(void);
uint32_t isaac_game_state_9d8af0_grow_target_ok_va(void);
uint32_t isaac_game_state_9d8af0_tail_init_needed_va(void);
uint32_t isaac_game_state_9d8af0_tail_init_more_va(void);
uint32_t isaac_game_state_9d8af0_copy_needed_va(void);
uint32_t isaac_game_state_9d8af0_copy_more_va(void);
uint32_t isaac_game_state_9d8af0_caller_count(void);
uint32_t isaac_game_state_9d8af0_caller_va_at(uint32_t index);

/* --- ABI v14: 0x9d8be0 g_Manager can-save mode (census
 *     section-notes/game-state-v13-reserve-leaves/NOTES.md §7;
 *     landing section-notes/game-state-v14-9d8be0/NOTES.md).
 *     Leaf 0x9d8be0..0x9d8c98 (51 insns, 0xb8 bytes, 3 rets:
 *     xor al,al / ret @0x9d8c40; mov al,1 / ret @0x9d8c92;
 *     mov al,2 / ret @0x9d8c95). Zero E8, zero SEH, zero cookie.
 *     identify-zhl EMPTY. 3 direct E8 callers 0x98ace7 / 0x9d9e91 /
 *     0x9db1e8. Reads Manager [0xc7169c] + Game [0xc71678].
 *     Byte gates mask & 0xff INSIDE the body; FULL-dword gates
 *     unmasked; +0xf18 uses SIGNED jg (i64 sign-extend form).
 *     No uint8_t scalar params. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_VA = 0x009d8be0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_END_VA = 0x009d8c98u; /* first int3 after ret al=2 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_BODY_BYTES = 0xb8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_NEXT_VA = 0x009d8ca0u; /* v15 LANDED flag scan */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_INSN_COUNT = 51u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_RET0_VA = 0x009d8c40u; /* xor al,al ; ret */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_RET1_VA = 0x009d8c94u; /* mov al,1 ; ret @0x9d8c94 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_RET2_VA = 0x009d8c97u; /* mov al,2 @0x9d8c95 ; ret */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_MGR_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_2C9 = 0x2c9u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_8 = 0x8u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_26630 = 0x26630u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_26589 = 0x26589u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_19F = 0x19fu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_A80 = 0xa80u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_F18 = 0xf18u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_OFF_2C7 = 0x2c7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_MODE_2 = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_BYTE_2C9_VA = 0x009d8be6u; /* cmp byte [ecx+0x2c9],0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_MODE_EQ_2_VA = 0x009d8bfbu; /* cmp edx,2 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_GAME_NZ_VA = 0x009d8c00u; /* test eax,eax */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_DWORD_26630_VA = 0x009d8c04u; /* cmp dword [eax+0x26630],0 ; ja */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_BYTE_26589_VA = 0x009d8c11u; /* cmp byte [eax+0x26589],0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_BYTE_19F_VA = 0x009d8c1au; /* cmp byte [ecx+0x19f],0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_DWORD_A80_VA = 0x009d8c5cu; /* cmp dword [ecx+0xa80],0 ; ja */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_DWORD_F18_VA = 0x009d8c65u; /* cmp dword [ecx+0xf18],0 ; jg SIGNED */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_BYTE_2C7_VA = 0x009d8c6eu; /* cmp byte [ecx+0x2c7],0 */
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_CALLER_COUNT = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_CALLER_VA_0 = 0x0098ace7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_CALLER_VA_1 = 0x009d9e91u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8BE0_CALLER_VA_2 = 0x009db1e8u;

/* G1 — cmp byte [Manager+0x2c9],0 ; jne ret2. LOW-BYTE. */
int32_t isaac_game_state_9d8be0_byte_2c9_nz(uint32_t mgr_2c9);
/* G2 — cmp edx,2 ; jne. FULL-dword Manager+8 == 2. */
int32_t isaac_game_state_9d8be0_mode_eq_2(uint32_t mgr_8);
/* G3 — test eax,eax ; je. FULL-dword Game pointer nonzero. */
int32_t isaac_game_state_9d8be0_game_nonzero(uint32_t game);
/* G4 — cmp dword [Game+0x26630],0 ; ja. UNSIGNED != 0. */
int32_t isaac_game_state_9d8be0_dword_26630_busy(uint32_t game_26630);
/* G5 — cmp byte [Game+0x26589],0 ; jne. LOW-BYTE. */
int32_t isaac_game_state_9d8be0_byte_26589_nz(uint32_t game_26589);
/* G6 — cmp byte [Manager+0x19f],0 ; jne. LOW-BYTE. */
int32_t isaac_game_state_9d8be0_byte_19f_nz(uint32_t mgr_19f);
/* G7 — cmp dword [Manager+0xa80],0 ; ja. UNSIGNED != 0. */
int32_t isaac_game_state_9d8be0_dword_a80_busy(uint32_t mgr_a80);
/* G8 — cmp dword [Manager+0xf18],0 ; jg. SIGNED > 0 (i64 form). */
int32_t isaac_game_state_9d8be0_dword_f18_positive(uint32_t mgr_f18);
/* G9 — cmp byte [Manager+0x2c7],0 ; jne. LOW-BYTE. */
int32_t isaac_game_state_9d8be0_byte_2c7_nz(uint32_t mgr_2c7);
/* Composed PE CFG: returns AL in {0,1,2}. */
uint32_t isaac_game_state_9d8be0_can_save_mode(
    uint32_t mgr_2c9, uint32_t mgr_8, uint32_t game,
    uint32_t game_26630, uint32_t game_26589, uint32_t mgr_19f,
    uint32_t mgr_a80, uint32_t mgr_f18, uint32_t mgr_2c7);

uint32_t isaac_game_state_9d8be0_va(void);
uint32_t isaac_game_state_9d8be0_end_va(void);
uint32_t isaac_game_state_9d8be0_body_bytes(void);
uint32_t isaac_game_state_9d8be0_next_va(void);
uint32_t isaac_game_state_9d8be0_insn_count(void);
uint32_t isaac_game_state_9d8be0_caller_count(void);
uint32_t isaac_game_state_9d8be0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8be0_mgr_global(void);
uint32_t isaac_game_state_9d8be0_game_global(void);
uint32_t isaac_game_state_9d8be0_off_2c9(void);
uint32_t isaac_game_state_9d8be0_off_f18(void);
uint32_t isaac_game_state_9d8be0_byte_2c9_va(void);
uint32_t isaac_game_state_9d8be0_dword_f18_va(void);

/* --- ABI v15: 0x9d8ca0 Manager+0x2d0 &0xc flag scan (AL 0/1).
 *     Body 0x9d8ca0..0x9d8d41 (55 insns, 0xa1 bytes). /GS cookie
 *     0xbf93b4 + check 0xaef12b are HOST epilogue bookkeeping (not
 *     modelled). Zero SEH. Nested scan: edi 0..0x14, edx 0xc35ed0
 *     step 0x90, inner eax 0..0xc. Cell ecx = 0 when edx==0 or
 *     SIGNED edx>=0xc375e0, else [edx + table[eax]*8]. Fail AL=0
 *     iff test byte [Manager+ecx*4+0x2d0],0xc is zero. Success AL=1.
 *     identify-zhl EMPTY. 3 E8 callers 0x98acf3 / 0x9d9e99 / 0x9db1f0
 *     (same sites as v14 +8). Table from rdata xmm copies. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_VA = 0x009d8ca0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_END_VA = 0x009d8d41u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_BODY_BYTES = 0xa1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_NEXT_VA = 0x009d8d50u; /* SEH dtor cluster HOST */
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_INSN_COUNT = 55u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_RET1_VA = 0x009d8d2eu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_RET0_VA = 0x009d8d40u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_COOKIE_VA = 0x00bf93b4u; /* HOST */
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_COOKIE_CHECK_VA = 0x00aef12bu; /* HOST */
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_MGR_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_ROW_BASE = 0x00c35ed0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_ROW_END = 0x00c375e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_ROW_STRIDE = 0x90u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_OUTER_COUNT = 0x14u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_INNER_COUNT = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_FLAG_MASK = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_BYTE_OFF = 0x2d0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_COUNT = 12u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_0 = 0u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_1 = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_2 = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_3 = 4u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_4 = 5u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_5 = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_6 = 6u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_7 = 9u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_8 = 0xcu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_9 = 7u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_10 = 0xdu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_TABLE_11 = 0xeu;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_CALLER_COUNT = 3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_CALLER_VA_0 = 0x0098acf3u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_CALLER_VA_1 = 0x009d9e99u;
static constexpr uint32_t ISAAC_GAME_STATE_9D8CA0_CALLER_VA_2 = 0x009db1f0u;

int32_t isaac_game_state_9d8ca0_outer_done(uint32_t edi);
int32_t isaac_game_state_9d8ca0_edx_ge_end(uint32_t edx);
int32_t isaac_game_state_9d8ca0_edx_is_null(uint32_t edx);
int32_t isaac_game_state_9d8ca0_skip_cell_load(uint32_t edx);
int32_t isaac_game_state_9d8ca0_inner_more(uint32_t eax);
uint32_t isaac_game_state_9d8ca0_table_index(uint32_t eax);
int32_t isaac_game_state_9d8ca0_flag_ok(uint32_t byte);
uint32_t isaac_game_state_9d8ca0_row_next(uint32_t edx);
uint32_t isaac_game_state_9d8ca0_cell_ecx(uint32_t edx, uint32_t loaded);
uint32_t isaac_game_state_9d8ca0_byte_off(uint32_t ecx);
uint32_t isaac_game_state_9d8ca0_after_row(uint32_t edi, uint32_t edx);

uint32_t isaac_game_state_9d8ca0_va(void);
uint32_t isaac_game_state_9d8ca0_end_va(void);
uint32_t isaac_game_state_9d8ca0_body_bytes(void);
uint32_t isaac_game_state_9d8ca0_next_va(void);
uint32_t isaac_game_state_9d8ca0_insn_count(void);
uint32_t isaac_game_state_9d8ca0_caller_count(void);
uint32_t isaac_game_state_9d8ca0_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9d8ca0_row_end(void);
uint32_t isaac_game_state_9d8ca0_flag_mask(void);

/* --- ABI v16 (atomic bump): 0x9dc6e0 zero-init ctor — PURE-COMPLETE
 *     mem-law class (census
 *     section-notes/gamestate-scan-9d9550/NOTES.md UNIT 5 §U5-3;
 *     landing section-notes/gamestate-v16-9dc6e0/NOTES.md).
 *     Body 0x9dc6e0..0x9dc743 (16 insns, 0x64 bytes). NO prologue:
 *     opens directly with `mov dword ptr [ecx],0`; NO SEH, NO GS
 *     cookie, zero branches/calls/globals/fs:. 14 FULL-dword constant
 *     stores in PE order: zeros at +{0x00,0x04,0x0c,0x10,0x14,0x18,
 *     0x1c,0x20,0x24,0x28,0x2c,0x30,0x34} and the magic stamp
 *     0x12345678 @+0x08 (@0x9dc6ef), then `mov eax,ecx` @0x9dc6e6 +
 *     bare `ret` @0x9dc743 — returns the receiver. identify-zhl
 *     EMPTY; raw dword scan: ZERO data refs. Both callers are the
 *     classic new+ctor pattern (`push 0x38; call 0xa0f4c0 operator
 *     new; test eax; mov ecx,eax; call 0x9dc6e0`) -> OBJ_SIZE 0x38.
 *     Mem-law discipline (room-transition 428a70 / P5/P8 class):
 *     u32 LE stores, offset add wraps u32. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_VA = 0x009dc6e0u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_END_VA = 0x009dc744u; /* first int3 after ret @0x9dc743 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_BODY_BYTES = 0x64u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_NEXT_VA = 0x009dc750u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_INSN_COUNT = 16u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_RET_EAX_VA = 0x009dc6e6u; /* mov eax,ecx */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_RET_VA = 0x009dc743u; /* bare ret */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_MAGIC_STAMP_VA = 0x009dc6efu; /* mov dword [ecx+0x08],0x12345678 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_NEW_VA = 0x00a0f4c0u; /* operator new at both callers */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_OBJ_SIZE = 0x38u; /* push 0x38 before operator new */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_MAGIC = 0x12345678u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_MAGIC_OFF = 0x08u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_STORE_COUNT = 14u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_COUNT = 13u;

/* Zero-store offsets in PE store order (store-site VA pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_0 = 0x00u; /* @0x9dc6e0 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_1 = 0x04u; /* @0x9dc6e8 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_2 = 0x0cu; /* @0x9dc6f6 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_3 = 0x10u; /* @0x9dc6fd */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_4 = 0x14u; /* @0x9dc719 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_5 = 0x18u; /* @0x9dc720 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_6 = 0x1cu; /* @0x9dc727 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_7 = 0x20u; /* @0x9dc72e */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_8 = 0x24u; /* @0x9dc735 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_9 = 0x28u; /* @0x9dc73c */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_10 = 0x2cu; /* @0x9dc704 */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_11 = 0x30u; /* @0x9dc70b */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_12 = 0x34u; /* @0x9dc712 */

/* 2 direct rel32 callers, both new(0x38)+ctor via operator new. */
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_CALLER_VA_0 = 0x009dce5au;
static constexpr uint32_t ISAAC_GAME_STATE_9DC6E0_CALLER_VA_1 = 0x009dfcd6u;

/* ---------------------------------------------------------------------------
 * K1 — zero_dwords (PE sites 0x9dc6e0/0x9dc6e8/0x9dc6f6/0x9dc6fd/
 *   0x9dc704/0x9dc70b/0x9dc712/0x9dc719/0x9dc720/0x9dc727/0x9dc72e/
 *   0x9dc735/0x9dc73c): mov dword ptr [ecx+N],0.  13 FULL-dword u32 LE
 *   zero stores at this_off + {0x00,0x04,0x0c,0x10,0x14,0x18,0x1c,
 *   0x20,0x24,0x28,0x2c,0x30,0x34}; offset add wraps u32.
 * ------------------------------------------------------------------------- */
void isaac_game_state_9dc6e0_zero_dwords(uint8_t* mem, uint32_t this_off);

/* ---------------------------------------------------------------------------
 * K2 — magic_stamp (PE 0x9dc6ef): mov dword ptr [ecx+0x08],0x12345678.
 *   FULL-dword u32 LE magic at this_off + 0x08 (u32-wrap add).
 * ------------------------------------------------------------------------- */
void isaac_game_state_9dc6e0_magic_stamp(uint8_t* mem, uint32_t this_off);

/* ---------------------------------------------------------------------------
 * K3 — return_this (PE 0x9dc6e6 + 0x9dc743): mov eax,ecx ; ret.
 *   Returns the receiver unchanged.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9dc6e0_return_this(uint32_t this_off);

/* --- accessors (constants pinned through the wasm ABI) --- */
uint32_t isaac_game_state_9dc6e0_va(void);
uint32_t isaac_game_state_9dc6e0_end_va(void);
uint32_t isaac_game_state_9dc6e0_body_bytes(void);
uint32_t isaac_game_state_9dc6e0_next_va(void);
uint32_t isaac_game_state_9dc6e0_insn_count(void);
uint32_t isaac_game_state_9dc6e0_new_va(void);
uint32_t isaac_game_state_9dc6e0_obj_size(void);
uint32_t isaac_game_state_9dc6e0_magic(void);
uint32_t isaac_game_state_9dc6e0_magic_off(void);
uint32_t isaac_game_state_9dc6e0_store_count(void);
uint32_t isaac_game_state_9dc6e0_zero_count(void);
uint32_t isaac_game_state_9dc6e0_caller_count(void);
uint32_t isaac_game_state_9dc6e0_caller_va_at(uint32_t index);

/* --- ABI v17 (atomic bump): 0x9e0150 complement-index vector fetch —
 *     PURE-COMPLETE mem-law class (census
 *     section-notes/gamestate-scan-9d9550/NOTES.md UNIT 7 §U7-3;
 *     landing section-notes/gamestate-v17-9e0150/NOTES.md).
 *     Body 0x9e0150..0x9e017b (22 insns, 0x2c bytes). Minimal frame
 *     `push ebp; mov ebp,esp` + push esi; NO SEH, NO GS cookie, zero
 *     calls/globals/fs:. edx = ~[ebp+8] (FULL-dword NOT @0x9e0156);
 *     SIGNED edx < 0 -> return 0 (js @0x9e015b); begin=[ecx] and
 *     end=[ecx+4]; count = SIGNED(end-begin)>>2 (sar @0x9e0164);
 *     SIGNED edx >= count -> return 0 (jge @0x9e0169); elem = u32 LE
 *     at (begin + edx*4) @0x9e016b; result = u32 LE at mem + elem
 *     @0x9e016f; ret 4 @0x9e0172 (hit) / xor eax,eax + ret 4 @0x9e0179
 *     (null). identify-zhl EMPTY; raw dword scan: ZERO data refs.
 *     1 direct rel32 caller 0x005c02f1 (PGD region: call after
 *     0x417280 arg fetch; result deref'd [eax+0x74] verified).
 *     Mem-law discipline (P5/P8 class): u32 LE loads with u32-wrap
 *     address adds; BOTH gates FULL-dword SIGNED — byte-gate
 *     discipline: params uint32_t only, NO masking anywhere. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9E0150_VA = 0x009e0150u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_END_VA = 0x009e017cu; /* first int3 after the null-path ret @0x9e0179..0x9e017b */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_BODY_BYTES = 0x2cu;
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_NEXT_VA = 0x009e0180u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_INSN_COUNT = 22u;

/* Gate / load / exit PE addresses (pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_NOT_VA = 0x009e0156u; /* not edx (FULL-dword NOT) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_JS_GATE_VA = 0x009e015bu; /* js -> null: SIGNED (~v) < 0 */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_SUB_VA = 0x009e0162u; /* sub eax,esi (end - begin) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_SAR_VA = 0x009e0164u; /* sar eax,2 (SIGNED count) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_CMP_VA = 0x009e0167u; /* cmp edx,eax */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_JGE_GATE_VA = 0x009e0169u; /* jge -> null: SIGNED idx >= count */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_INNER_LOAD_VA = 0x009e016bu; /* mov eax,[esi+edx*4] */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_OUTER_LOAD_VA = 0x009e016fu; /* mov eax,[eax] */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_RET_OK_VA = 0x009e0172u; /* ret 4 (hit path) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_RET_NULL_VA = 0x009e0179u; /* ret 4 (xor eax,eax null path) */

/* 1 direct rel32 caller (census-callers-fixed.py). */
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0150_CALLER_VA_0 = 0x005c02f1u;

/* ---------------------------------------------------------------------------
 * O1 — complement-index sign gate (PE 0x9e0156 not + 0x9e0159 test +
 *   0x9e015b js): idx = ~v FULL-dword; SIGNED idx < 0 -> return 0.
 *   Returns 1 iff the one's-complement index is signed-nonnegative.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9e0150_not_nonneg(uint32_t v);

/* ---------------------------------------------------------------------------
 * O2 — complement-index vs element-count gate (PE 0x9e0162 sub +
 *   0x9e0164 sar 2 + 0x9e0167 cmp + 0x9e0169 jge):
 *   SIGNED(~v) < (int32)((end - begin) >> 2) — else return 0.  The span
 *   subtract wraps u32 and the count shift is ARITHMETIC (sar).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9e0150_idx_lt_count(uint32_t v, uint32_t begin,
                                             uint32_t end);

/* ---------------------------------------------------------------------------
 * O3 — double-deref fetch (mem-law, PE 0x9e015d/0x9e0160 begin/end
 *   loads + 0x9e016b inner + 0x9e016f outer): begin/end = u32 LE at
 *   vec_off/+4; when O1 && O2 pass, returns u32 LE at (mem + u32 LE at
 *   (mem + begin + (~v)*4)) with u32-wrapping address adds; else 0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9e0150_fetch(const uint8_t* mem, uint32_t vec_off,
                                       uint32_t v);

/* --- accessors (constants pinned through the wasm ABI) --- */
uint32_t isaac_game_state_9e0150_va(void);
uint32_t isaac_game_state_9e0150_end_va(void);
uint32_t isaac_game_state_9e0150_body_bytes(void);
uint32_t isaac_game_state_9e0150_next_va(void);
uint32_t isaac_game_state_9e0150_insn_count(void);
uint32_t isaac_game_state_9e0150_not_va(void);
uint32_t isaac_game_state_9e0150_js_gate_va(void);
uint32_t isaac_game_state_9e0150_sub_va(void);
uint32_t isaac_game_state_9e0150_sar_va(void);
uint32_t isaac_game_state_9e0150_cmp_va(void);
uint32_t isaac_game_state_9e0150_jge_gate_va(void);
uint32_t isaac_game_state_9e0150_inner_load_va(void);
uint32_t isaac_game_state_9e0150_outer_load_va(void);
uint32_t isaac_game_state_9e0150_ret_ok_va(void);
uint32_t isaac_game_state_9e0150_ret_null_va(void);
uint32_t isaac_game_state_9e0150_caller_count(void);
uint32_t isaac_game_state_9e0150_caller_va_at(uint32_t index);

/* --- ABI v18 (atomic bump): 0x9e0180 complement-index ELEMENT fetch —
 *     PURE-COMPLETE candidate #3, law-TWIN of 0x9e0150 minus the second
 *     deref (census
 *     section-notes/gamestate-scan-9d9550/NOTES.md UNIT 8 §U8-2;
 *     landing section-notes/gamestate-v18-9e0180/NOTES.md).
 *     Body 0x9e0180..0x9e01a4 (15 insns, 0x27 bytes). Minimal frame
 *     `push ebp; mov ebp,esp`; NO SEH, NO GS cookie, zero
 *     calls/globals/fs:. eax = ~[ebp+8] (FULL-dword NOT @0x9e0186);
 *     SIGNED eax < 0 -> return 0 (js @0x9e018a); begin=[ecx] and
 *     end=[ecx+4]; count = SIGNED(end-begin)>>2 (sar @0x9e0193);
 *     SIGNED eax >= count -> return 0 (jge @0x9e0198); RESULT = u32 LE
 *     at (begin + eax*4) @0x9e019a — SINGLE deref (returns the ELEMENT
 *     dword; O returns *elem); ret 4 @0x9e019e (hit) / xor eax,eax +
 *     ret 4 @0x9e01a4 (null). identify-zhl EMPTY.
 *     2 direct rel32 callers 0x006e7ff5 / 0x006e818a — both context-
 *     decoded: mov ecx,[0xc71678]; push <v>; add/lea ecx,+0x67758;
 *     call — receiver is the Game-global dword vector (the SAME vector
 *     body Q 0x9e01b0 searches).
 *     Mem-law discipline identical to O: u32 LE loads with u32-wrap
 *     address adds; BOTH gates FULL-dword SIGNED — byte-gate
 *     discipline: params uint32_t only, NO masking anywhere. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9E0180_VA = 0x009e0180u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_END_VA = 0x009e01a7u; /* first int3 after the null-path ret @0x9e01a4..0x9e01a6 */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_BODY_BYTES = 0x27u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_NEXT_VA = 0x009e01b0u; /* Q global-vector search HOST */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_INSN_COUNT = 15u;

/* Gate / load / exit PE addresses (pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_NOT_VA = 0x009e0186u; /* not eax (FULL-dword NOT) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_JS_GATE_VA = 0x009e018au; /* js -> null: SIGNED (~v) < 0 */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_SUB_VA = 0x009e0191u; /* sub ecx,edx (end - begin) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_SAR_VA = 0x009e0193u; /* sar ecx,2 (SIGNED count) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_CMP_VA = 0x009e0196u; /* cmp eax,ecx */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_JGE_GATE_VA = 0x009e0198u; /* jge -> null: SIGNED idx >= count */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_ELEM_LOAD_VA = 0x009e019au; /* mov eax,[edx+eax*4] — SINGLE deref */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_RET_OK_VA = 0x009e019eu; /* ret 4 (hit path) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_RET_NULL_VA = 0x009e01a4u; /* ret 4 (xor eax,eax null path) */

/* 2 direct rel32 callers (census-callers-fixed.py; receivers verified by context decode). */
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_CALLER_VA_0 = 0x006e7ff5u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_CALLER_VA_1 = 0x006e818au;
static constexpr uint32_t ISAAC_GAME_STATE_9E0180_GAME_VEC_OFF = 0x67758u; /* both callers: [Game 0xc71678] + 0x67758 */

/* ---------------------------------------------------------------------------
 * P1 — complement-index sign gate (PE 0x9e0186 not + 0x9e0188 test +
 *   0x9e018a js): idx = ~v FULL-dword; SIGNED idx < 0 -> return 0.
 *   Returns 1 iff the one's-complement index is signed-nonnegative.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9e0180_not_nonneg(uint32_t v);

/* ---------------------------------------------------------------------------
 * P2 — complement-index vs element-count gate (PE 0x9e0191 sub +
 *   0x9e0193 sar 2 + 0x9e0196 cmp + 0x9e0198 jge):
 *   SIGNED(~v) < (int32)((end - begin) >> 2) — else return 0.  The span
 *   subtract wraps u32 and the count shift is ARITHMETIC (sar).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9e0180_idx_lt_count(uint32_t v, uint32_t begin,
                                             uint32_t end);

/* ---------------------------------------------------------------------------
 * P3 — element fetch (mem-law, PE 0x9e018c/0x9e018e begin/end loads +
 *   0x9e019a): begin/end = u32 LE at vec_off/+4; when P1 && P2 pass,
 *   returns u32 LE at (mem + begin + (~v)*4) — the ELEMENT dword,
 *   SINGLE deref (O double-derefs) — with u32-wrapping address adds;
 *   else 0.
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9e0180_elem_fetch(const uint8_t* mem,
                                            uint32_t vec_off, uint32_t v);

/* --- accessors (constants pinned through the wasm ABI) --- */
uint32_t isaac_game_state_9e0180_va(void);
uint32_t isaac_game_state_9e0180_end_va(void);
uint32_t isaac_game_state_9e0180_body_bytes(void);
uint32_t isaac_game_state_9e0180_next_va(void);
uint32_t isaac_game_state_9e0180_insn_count(void);
uint32_t isaac_game_state_9e0180_not_va(void);
uint32_t isaac_game_state_9e0180_js_gate_va(void);
uint32_t isaac_game_state_9e0180_sub_va(void);
uint32_t isaac_game_state_9e0180_sar_va(void);
uint32_t isaac_game_state_9e0180_cmp_va(void);
uint32_t isaac_game_state_9e0180_jge_gate_va(void);
uint32_t isaac_game_state_9e0180_elem_load_va(void);
uint32_t isaac_game_state_9e0180_ret_ok_va(void);
uint32_t isaac_game_state_9e0180_ret_null_va(void);
uint32_t isaac_game_state_9e0180_caller_count(void);
uint32_t isaac_game_state_9e0180_caller_va_at(uint32_t index);
uint32_t isaac_game_state_9e0180_game_vec_off(void);

/* --- ABI v19 (atomic bump): 0x9e0650 forward-index BYTE getter —
 *     PURE-COMPLETE mem-law class (census
 *     section-notes/gamestate-scan-9dc750/NOTES.md UNIT 12 §U12-2;
 *     landing section-notes/gamestate-v19-9e0650/NOTES.md).
 *     Body 0x9e0650..0x9e0676 (19 insns, 0x27 bytes). Minimal frame
 *     `push ebp; mov ebp,esp` + push esi; NO SEH, NO GS cookie, zero
 *     calls/globals/fs:/mem-stores. edx = [ebp+8] (idx); SIGNED
 *     idx < 0 -> zero path (test/js @0x9e0657/@0x9e0659); span
 *     n = [ecx+0x10] - [ecx+0xc] in BYTE units (sub @0x9e0661, NO
 *     shift — the v17 twin sars its dword count by 2, this body does
 *     not); SIGNED idx >= n -> zero path (cmp/jge @0x9e0663/
 *     @0x9e0665); hit path returns the ZERO-EXTENDED byte at
 *     begin+idx (movzx @0x9e0667) through ret 4 @0x9e066d; zero path
 *     xor eax,eax @0x9e0670 + ret 4 @0x9e0674. Sole caller
 *     0x00770bb6 is HUD 770ba1's pinned host-leaf call site.
 *
 *     CROSS-FAMILY PIN RESOLUTION: hud_post_update_pure_helpers.* +
 *     hud-post-update-pure-model.mjs KEEP ISAAC_HUD_770BA1_HOST_VA_9E0650
 *     as an address-stable HOST leaf (their r1 sample; the jg gate
 *     (int32)r > 0 @0x770bbd stays valid against the landed law — the
 *     hit path returns a movzx'd 0..255 byte, fail path 0). BOTH facts
 *     recorded; the HUD family consumes this body at its call boundary
 *     and does not re-source r1 through the GameState export.
 *
 *     Mem-law discipline (v16/v17 class): u32 LE loads, offset adds
 *     wrap u32, byte load zero-extends. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9E0650_VA = 0x009e0650u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_END_VA = 0x009e0677u; /* first int3 after the zero-path ret 4 @0x9e0674 */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_BODY_BYTES = 0x27u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_NEXT_VA = 0x009e0680u; /* next body Y: frame-effect-pinned host broadcast */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_INSN_COUNT = 19u;

/* Gate / load / exit PE addresses (pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_JS_GATE_VA = 0x009e0659u; /* js -> zero: SIGNED idx < 0 */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_END_LOAD_VA = 0x009e065bu; /* mov eax,[ecx+0x10] */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_BEGIN_LOAD_VA = 0x009e065eu; /* mov esi,[ecx+0xc] */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_SUB_VA = 0x009e0661u; /* sub eax,esi — BYTE units, NO shift */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_CMP_VA = 0x009e0663u; /* cmp edx,eax */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_JGE_GATE_VA = 0x009e0665u; /* jge -> zero: SIGNED idx >= n */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_BYTE_LOAD_VA = 0x009e0667u; /* movzx eax,byte ptr [esi+edx] */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_RET_OK_VA = 0x009e066du; /* ret 4 (hit path) */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_ZERO_PATH_VA = 0x009e0670u; /* xor eax,eax */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_RET_ZERO_VA = 0x009e0674u; /* ret 4 (zero path) */

/* Span field offsets on the receiver (two FULL-dword loads, adjacent). */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_BEGIN_OFF = 0xcu;  /* [this+0xc] begin */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_END_OFF = 0x10u;   /* [this+0x10] end */
static_assert(ISAAC_GAME_STATE_9E0650_END_OFF ==
                  ISAAC_GAME_STATE_9E0650_BEGIN_OFF + 4u,
              "9e0650 span pair adjacency");

/* 1 direct rel32 caller (census-callers-fixed.py): HUD 770ba1's site. */
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_GAME_STATE_9E0650_CALLER_VA_0 = 0x00770bb6u;

/* ---------------------------------------------------------------------------
 * X1 — forward-index sign guard (PE 0x9e0657 test edx,edx +
 *   0x9e0659 js): SIGNED idx < 0 routes to the zero path. Returns 1
 *   iff idx is signed-nonnegative (FORWARD index; no complement step).
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9e0650_forward_index_guard(int32_t idx);

/* ---------------------------------------------------------------------------
 * X2 — byte-span size (PE 0x9e065b/0x9e065e dword loads +
 *   0x9e0661 sub): n = end - begin over the u32-wrapped dword pair.
 *   BYTE units — NO shift (v17's vector twin sars by 2; here the
 *   element width is 1).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9e0650_byte_span_size(uint32_t begin, uint32_t end);

/* ---------------------------------------------------------------------------
 * X3 — bounds check (PE 0x9e0663 cmp + 0x9e0665 jge):
 *   SIGNED(idx) < SIGNED(n) required — else zero path. The span
 *   subtract wraps u32; the comparison is SIGNED on BOTH sides.
 * ------------------------------------------------------------------------- */
int32_t isaac_game_state_9e0650_bounds_check(int32_t idx, uint32_t begin,
                                             uint32_t end);

/* ---------------------------------------------------------------------------
 * X4/X5 — composite getter (mem-law, PE 0x9e065b..0x9e0674):
 *   begin/end = u32 LE at this_off+0xc/+0x10; when X1 && X3 pass,
 *   returns the ZERO-EXTENDED byte at (mem + begin + idx) with
 *   u32-wrapping address adds (movzx @0x9e0667); else the ZERO-PATH
 *   value 0 (xor eax,eax @0x9e0670). Both exits are ret 4
 *   (@0x9e066d / @0x9e0674).
 * ------------------------------------------------------------------------- */
uint32_t isaac_game_state_9e0650_byte_getter(const uint8_t* mem,
                                             uint32_t this_off, int32_t idx);

/* --- accessors (constants pinned through the wasm ABI) --- */
uint32_t isaac_game_state_9e0650_va(void);
uint32_t isaac_game_state_9e0650_end_va(void);
uint32_t isaac_game_state_9e0650_body_bytes(void);
uint32_t isaac_game_state_9e0650_next_va(void);
uint32_t isaac_game_state_9e0650_insn_count(void);
uint32_t isaac_game_state_9e0650_js_gate_va(void);
uint32_t isaac_game_state_9e0650_end_load_va(void);
uint32_t isaac_game_state_9e0650_begin_load_va(void);
uint32_t isaac_game_state_9e0650_sub_va(void);
uint32_t isaac_game_state_9e0650_cmp_va(void);
uint32_t isaac_game_state_9e0650_jge_gate_va(void);
uint32_t isaac_game_state_9e0650_byte_load_va(void);
uint32_t isaac_game_state_9e0650_ret_ok_va(void);
uint32_t isaac_game_state_9e0650_zero_path_va(void);
uint32_t isaac_game_state_9e0650_ret_zero_va(void);
uint32_t isaac_game_state_9e0650_caller_count(void);
uint32_t isaac_game_state_9e0650_caller_va_at(uint32_t index);


/* --- ABI v20 (atomic bump): 0x9e3450 grid-adjacency door-direction
 *     checker — PURE-COMPLETE under the host-resolved-read-only-table
 *     convention (frame-effect v41 g1/g2 BSS-input precedent; census
 *     section-notes/gamestate-scan-9dc750/NOTES.md UNIT 17 §U17-3;
 *     landing section-notes/gamestate-v20-9e3450/NOTES.md).
 *     Body 0x9e3450..0x9e3551 (101 insns, 0x103 bytes). Minimal plain
 *     frame push ebp/mov ebp,esp + ecx/ebx/esi/edi spills; NO SEH, NO
 *     GS cookie, ZERO calls/indirect/fs:. thiscall bool(ecx=this,
 *     idxA @ebp+8, idxB @ebp+0xc). w = [[this]+0xc] double deref
 *     (@0x9e345d/0x9e3461); row=q=idx/w col=r=idx%w SIGNED idiv both
 *     args (@0x9e3467/0x9e3471); dCol=qB-qA @0x9e3473, dRow=rB-rA
 *     @0x9e347a; REQUIRE |dCol|+|dRow| == 1 FULL-dword (xor-sub abs
 *     @0x9e3482..0x9e348d, cmp/jne @0x9e348f/92); REQUIRE idxA <=u
 *     0x1bf (@0x9e3498/0x9e349e ja); b = u8[this+4+idxA] SINGLE deref
 *     (@0x9e34a7 — [ebp-4] holds raw this saved @0x9e3456 BEFORE the
 *     width deref; census U17-3 over-deref corrected vs dump); REQUIRE
 *     b != 0xFF (@0x9e34ab/0x9e34ad je); t = b & 0xf (@0x9e34b8);
 *     cnt = s32[table + t*68] (@0x9e34c2 mov ebx,[ecx*4+0xc37610]);
 *     REQUIRE cnt > 0 SIGNED (test/jle @0x9e34c9/0x9e34cb); scan
 *     entries at table + t*68 + 4 stride 8 {f32 x,f32 y} (@0x9e34d5
 *     lea): signum via ucomiss/lahf/test ah,0x44/cmov vs -13.0f
 *     @0xbaadd0 / +13.0f @0xbaa83c (NaN unordered -> 0 both arms);
 *     HIT iff signum(x)==dRow (@0x9e352b jne) && signum(y)==dCol
 *     (@0x9e3530 je hit) — x pairs with the ROW delta, y with the COL
 *     delta; al=1 hit @0x9e354a / xor al,al fail @0x9e353f; dual ret 8
 *     @0x9e3545 / 0x9e3550; int3 pad 0x9e3553..0x9e3560.
 *     Convention decision (ticket option a): table base 0xc37610 is
 *     HOST-RESOLVED INPUT (door_table_ptr param each call) — writer
 *     scan negative across the full image (all five .text refs are
 *     reads), type-0 row constant {(13,0),(13,0)} signed (-13/+13)
 *     — matching frame-effect v41 g1/g2 read-only-BSS precedent;
 *     float consts stay PINNED (.rdata, truly constant). idiv #DE
 *     (w==0) is a HOST crash outside the pure surface. identify-zhl
 *     EMPTY; data refs to body VA ZERO. 6 direct rel32 callers:
 *     0x4b7178 / 0x4b72f2 / 0x4b748d / 0x4b75ed / 0x4bbd2a (0x4b
 *     subsystem x5) + 0x9e3774 (in-band AJ builder).
 *     Mem-law discipline (P5/P8 class): u32 LE loads with u32-wrap
 *     address adds; params uint32_t/int32_t only, NO masking beyond
 *     the pinned & 0xf type select. --- */

static constexpr uint32_t ISAAC_GAME_STATE_9E3450_VA = 0x009e3450u;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_END_VA = 0x009e3553u; /* first int3 after the hit-path ret @0x9e3550..0x9e3552 */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_BODY_BYTES = 0x103u;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_NEXT_VA = 0x009e3560u; /* AJ grid-query builder (SEH HOST) */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_INSN_COUNT = 101u;

/* Gate / load / exit PE addresses (pins). */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_WIDTH_LOAD_VA = 0x009e3461u; /* mov esi,[eax+0xc] — [[this]+0xc] */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_MANHATTAN_JNE_VA = 0x009e3492u; /* cmp ecx,1 ; jne fail */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_BOUND_CMP_VA = 0x009e3498u; /* cmp ebx,0x1bf */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_BOUND_JA_VA = 0x009e349eu; /* ja fail — UNSIGNED above */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CELL_READ_VA = 0x009e34a7u; /* mov al,[ebx+eax+4] — SINGLE deref */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_SENTINEL_JE_VA = 0x009e34abu; /* cmp al,0xff ; je fail (@0x9e34ad) */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_TYPE_MASK_VA = 0x009e34b8u; /* and eax,0xf */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_COUNT_LOAD_VA = 0x009e34c2u; /* mov ebx,[ecx*4+0xc37610] */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_COUNT_JLE_VA = 0x009e34cbu; /* test ebx,ebx ; jle fail — SIGNED <= 0 */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_ENTRY_LEA_VA = 0x009e34d5u; /* lea esi,[ecx*4+0xc37614] */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CMP_DROW_VA = 0x009e352bu; /* cmp edx,[ebp+8]: signum(x) vs dRow */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CMP_DCOL_VA = 0x009e3530u; /* cmp ecx,[ebp+0xc]: signum(y) vs dCol */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_RET_FAIL_VA = 0x009e3545u; /* xor al,al arm ret 8 */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_RET_HIT_VA = 0x009e3550u; /* mov al,1 arm ret 8 */

/* Pinned shape constants. */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_GRID_BOUND = 0x1bfu; /* 448 cells - 1 */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_WIDTH_INNER_OFF = 0xcu; /* [this]->width */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CELL_TABLE_OFF = 0x4u; /* u8[this+4+idx] */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_SENTINEL = 0xffu;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_TYPE_MASK = 0xfu;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_DOOR_TABLE_VA = 0x00c37610u; /* HOST-resolved: callers supply live bytes */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_TYPE_ROW_STRIDE = 68u; /* shl 4 + add => t*17 dwords */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_ENTRY_STRIDE = 8u; /* {f32 x, f32 y} */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_FLT_NEG_VA = 0x00baadd0u; /* -13.0f (.rdata) */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_FLT_POS_VA = 0x00baa83cu; /* +13.0f (.rdata) */

/* 6 direct rel32 callers (census-callers-fixed.py; U17-3). */
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_COUNT = 6u;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_VA_0 = 0x004b7178u;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_VA_1 = 0x004b72f2u;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_VA_2 = 0x004b748du;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_VA_3 = 0x004b75edu;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_VA_4 = 0x004bbd2au;
static constexpr uint32_t ISAAC_GAME_STATE_9E3450_CALLER_VA_5 = 0x009e3774u;

/* ---------------------------------------------------------------------------
 * AI-composite — door_dir (full PE CFG 0x9e3450..0x9e3551):
 *   __thiscall bool(this, idxA, idxB) over a HOST-RESOLVED door table.
 *   Returns AL in {0,1}: 1 iff idxA/idxB are Manhattan-adjacent cells
 *   (w = [[this]+0xc]), idxA <=u 0x1bf, cell byte != 0xFF, and some
 *   entry of type (byte&0xf) carries signum(x)==dRow && signum(y)==dCol
 *   (signum: ==-13 -> -1, ==+13 -> +1, NaN/other -> 0).
 * ------------------------------------------------------------------------- */
uint8_t isaac_game_state_9e3450_door_dir(uint32_t this_ptr, int32_t idx_a,
                                         int32_t idx_b,
                                         uint32_t door_table_ptr);

/* --- accessors (constants pinned through the wasm ABI) --- */
uint32_t isaac_game_state_9e3450_va(void);
uint32_t isaac_game_state_9e3450_end_va(void);
uint32_t isaac_game_state_9e3450_body_bytes(void);
uint32_t isaac_game_state_9e3450_next_va(void);
uint32_t isaac_game_state_9e3450_insn_count(void);
uint32_t isaac_game_state_9e3450_width_load_va(void);
uint32_t isaac_game_state_9e3450_manhattan_jne_va(void);
uint32_t isaac_game_state_9e3450_bound_cmp_va(void);
uint32_t isaac_game_state_9e3450_bound_ja_va(void);
uint32_t isaac_game_state_9e3450_cell_read_va(void);
uint32_t isaac_game_state_9e3450_sentinel_je_va(void);
uint32_t isaac_game_state_9e3450_type_mask_va(void);
uint32_t isaac_game_state_9e3450_count_load_va(void);
uint32_t isaac_game_state_9e3450_count_jle_va(void);
uint32_t isaac_game_state_9e3450_entry_lea_va(void);
uint32_t isaac_game_state_9e3450_cmp_drow_va(void);
uint32_t isaac_game_state_9e3450_cmp_dcol_va(void);
uint32_t isaac_game_state_9e3450_ret_fail_va(void);
uint32_t isaac_game_state_9e3450_ret_hit_va(void);
uint32_t isaac_game_state_9e3450_grid_bound(void);
uint32_t isaac_game_state_9e3450_width_inner_off(void);
uint32_t isaac_game_state_9e3450_cell_table_off(void);
uint32_t isaac_game_state_9e3450_sentinel(void);
uint32_t isaac_game_state_9e3450_type_mask(void);
uint32_t isaac_game_state_9e3450_door_table_va(void);
uint32_t isaac_game_state_9e3450_type_row_stride(void);
uint32_t isaac_game_state_9e3450_entry_stride(void);
uint32_t isaac_game_state_9e3450_flt_neg_va(void);
uint32_t isaac_game_state_9e3450_flt_pos_va(void);
uint32_t isaac_game_state_9e3450_caller_count(void);
uint32_t isaac_game_state_9e3450_caller_va_at(uint32_t index);

uint32_t isaac_game_state_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif