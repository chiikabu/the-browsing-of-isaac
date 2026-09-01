#include "game_state_pure_helpers.h"

/* GameState pure helpers — ABI v5 (write-span loop/decision laws W1..W22 + 0x9c8d20 bounds U1 + 0x683930 name-gate N1).
   Landed ABI v1: GameState::Delete 0x009c8350 decision laws. Landed ABI v2:
   GameState::DeleteRerun 0x009c8410 decision laws (Q1..Q8) + the
   GameState::write 0x009c9340 typed-host lease (constants only). Landed
   ABI v3: serializer tree leaf laws R1..R18 (bodies stay typed-host).
   Landed ABI v4: save-orchestrator host A/B decision laws S1..S6 +
   GameState::read_rerun 0x009d7d50 typed-host lease. Landed ABI v5:
ABI v5: the write-span LANE-FREE loop/decision laws W1..W22 (write body stays
   typed-host — exit-v41/pgd-v26 peel style), the 0x9c8d20 element-loop
   bounds U1, and the 0x683930 name-open gate N1. See
   game_state_pure_helpers.h for per-law PE evidence; decode evidence in
   output/decomp/5129df723e64/section-notes/game-state-v4-cloud/cpu-dump/
   and section-notes/game-state-v4-cloud/NOTES.md. */

/* Landed ABI v12: the save-piece cluster — 0x9d77e0 sub-object
   serializer decision gates (verified NO 0x9d45c0 E8; 24x 0x683410)
   + 0x9d8190 save-piece writer internal gates (0x19d78 signed piece
   loop, 0x1e728 null->logger, SSO>=0x10 cmov + mem-ptr, 0x96696996
   checksum stream word) + shared leaves census 0x9d8660/0x9d8820/
   0x9d8a20 + 0x9d45c0 4-caller accounting.  Census:
   section-notes/game-state-v12-savepiece/NOTES.md. */

static_assert(ISAAC_GAME_STATE_PURE_HELPERS_ABI_VERSION == 20,
              "ABI v20 (0x9e3450 grid-adjacency door-direction checker + 0x9e0650 forward-index byte getter + 0x9e0180 complement-index element fetch + 0x9e0150 vector fetch + 0x9dc6e0 zero-init ctor)");

/* Steam context presence (PE 0x009c836b / repeat 0x009c8394):
   cmp dword ptr [eax],0 ; je fallback. FULL-dword. */
extern "C" int32_t isaac_game_state_9c8350_steam_present(
    uint32_t steam_ctx_word) {
  return (steam_ctx_word != 0u) ? 1 : 0;
}

/* Manager+0x2a3a4 cloud byte (PE 0x009c8370): cmp byte ; je fallback.
   LOW-BYTE gate: mask & 0xff in the body (0x100 -> byte 0 -> closed). */
extern "C" int32_t isaac_game_state_9c8350_cloud_gate_ok(
    uint32_t mgr_byte_2a3a4) {
  const uint8_t byte = static_cast<uint8_t>(mgr_byte_2a3a4 & 0xffu);
  return (byte & 0xffu) != 0u ? 1 : 0;
}

/* Steam-arm combine (je CF @0x9c836e/0x9c8377): AND of both gates. */
extern "C" int32_t isaac_game_state_9c8350_use_steam_arm(
    uint32_t steam_present, uint32_t cloud_gate_ok) {
  return (steam_present != 0u && cloud_gate_ok != 0u) ? 1 : 0;
}

/* Stat-name SSO size select (PE 0x009c8379): cmp dword [esi+0x1fe08],0x10 ;
   jb inline. FULL-dword UNSIGNED: size >= 0x10 -> heap pointer. */
extern "C" int32_t isaac_game_state_9c8350_statname_heap_used(
    uint32_t size_1fe08) {
  return (size_1fe08 >= ISAAC_GAME_STATE_9C8350_SSO_THRESHOLD) ? 1 : 0;
}

/* Stat-name string pointer (mem-law): inline buffer address (u32 wrap) or
   heap pointer load32 at the buffer slot. */
extern "C" uint32_t isaac_game_state_9c8350_statname_ptr(
    const uint8_t* mem, uint32_t this_off, uint32_t size_1fe08) {
  const uint32_t buf_addr = this_off + ISAAC_GAME_STATE_9C8350_STATNAME_BUF_OFF;
  if (size_1fe08 < ISAAC_GAME_STATE_9C8350_SSO_THRESHOLD) {
    return buf_addr; /* inline SSO buffer at this+0x1fdf4 */
  }
  uint32_t v = 0u;
  if (mem != nullptr) {
    const uint8_t* p = mem + buf_addr;
    v = static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
        (static_cast<uint32_t>(p[2]) << 16) |
        (static_cast<uint32_t>(p[3]) << 24);
  }
  return v; /* heap pointer word */
}

/* Steam vtbl+0x34 result gate (PE 0x009c83ad): test al,al ; je tail.
   LOW-BYTE mask & 0xff (0x100 -> AL byte 0 -> closed). */
extern "C" int32_t isaac_game_state_9c8350_steam_arm_continue(
    uint32_t vtbl34_al) {
  const uint8_t al = static_cast<uint8_t>(vtbl34_al & 0xffu);
  return (al != 0u) ? 1 : 0;
}

/* Filename EMPTY gate (PE 0x009c83cd): cmp dword [esi+0x1fdbc],0 ;
   jne skip-log. FULL-dword: nonzero filename skips the no-filename
   logger; zero -> HOST log 0xa112c0 (1, 0xb7f1ac). Field shared with
   exit v46 isaac_exit_958ed0_local_filename_present. */
extern "C" int32_t isaac_game_state_9c8350_filename_present(
    uint32_t size_1fdbc) {
  return (size_1fdbc != 0u) ? 1 : 0;
}

/* Filename string pointer (mem-law): inline buffer address (u32 wrap) or
   heap pointer load32 at the buffer slot. */
extern "C" uint32_t isaac_game_state_9c8350_filename_ptr(
    const uint8_t* mem, uint32_t this_off, uint32_t size_1fdc0) {
  const uint32_t buf_addr = this_off + ISAAC_GAME_STATE_9C8350_FILENAME_BUF_OFF;
  if (size_1fdc0 < ISAAC_GAME_STATE_9C8350_SSO_THRESHOLD) {
    return buf_addr; /* inline SSO buffer at this+0x1fdac */
  }
  uint32_t v = 0u;
  if (mem != nullptr) {
    const uint8_t* p = mem + buf_addr;
    v = static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
        (static_cast<uint32_t>(p[2]) << 16) |
        (static_cast<uint32_t>(p[3]) << 24);
  }
  return v; /* heap pointer word */
}

/* --- ABI v2: GameState::DeleteRerun 0x009c8410 (exact ZHL) --- */

/* Steam context presence (PE 0x009c842b / repeat 0x009c8451):
   cmp dword ptr [eax],0 ; je fallback. FULL-dword. */
extern "C" int32_t isaac_game_state_9c8410_steam_present(
    uint32_t steam_ctx_word) {
  return (steam_ctx_word != 0u) ? 1 : 0;
}

/* Manager+0x2a3a4 cloud byte (PE 0x009c8430): cmp byte ; je fallback.
   LOW-BYTE gate: mask & 0xff in the body (0x100 -> byte 0 -> closed). */
extern "C" int32_t isaac_game_state_9c8410_cloud_gate_ok(
    uint32_t mgr_byte_2a3a4) {
  const uint8_t byte = static_cast<uint8_t>(mgr_byte_2a3a4 & 0xffu);
  return (byte & 0xffu) != 0u ? 1 : 0;
}

/* Steam-arm combine (je CF @0x9c842e/0x9c8437): AND of both gates. */
extern "C" int32_t isaac_game_state_9c8410_use_steam_arm(
    uint32_t steam_present, uint32_t cloud_gate_ok) {
  return (steam_present != 0u && cloud_gate_ok != 0u) ? 1 : 0;
}

/* Stat-name SSO size select (PE 0x009c843f): cmp dword [esi+0x14],0x10 ;
   jb inline (esi = this+0x1fe0c, so the size field is GameState+0x1fe20).
   FULL-dword UNSIGNED: size >= 0x10 -> heap pointer. */
extern "C" int32_t isaac_game_state_9c8410_statname_heap_used(
    uint32_t size_1fe20) {
  return (size_1fe20 >= ISAAC_GAME_STATE_9C8410_SSO_THRESHOLD) ? 1 : 0;
}

/* Stat-name string pointer (mem-law): inline buffer address (u32 wrap) or
   heap pointer load32 at the buffer slot (+0x1fe0c). */
extern "C" uint32_t isaac_game_state_9c8410_statname_ptr(
    const uint8_t* mem, uint32_t this_off, uint32_t size_1fe20) {
  const uint32_t buf_addr =
      this_off + ISAAC_GAME_STATE_9C8410_STATNAME_BUF_OFF;
  if (size_1fe20 < ISAAC_GAME_STATE_9C8410_SSO_THRESHOLD) {
    return buf_addr; /* inline SSO buffer at this+0x1fe0c */
  }
  uint32_t v = 0u;
  if (mem != nullptr) {
    const uint8_t* p = mem + buf_addr;
    v = static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
        (static_cast<uint32_t>(p[2]) << 16) |
        (static_cast<uint32_t>(p[3]) << 24);
  }
  return v; /* heap pointer word */
}

/* Steam vtbl+0x34 result gate (PE 0x009c846a): test al,al ; je tail.
   LOW-BYTE mask & 0xff (0x100 -> AL byte 0 -> closed). */
extern "C" int32_t isaac_game_state_9c8410_steam_arm_continue(
    uint32_t vtbl34_al) {
  const uint8_t al = static_cast<uint8_t>(vtbl34_al & 0xffu);
  return (al != 0u) ? 1 : 0;
}

/* Filename EMPTY gate (PE 0x009c8484): cmp dword [esi+0x1fdbc],0 ;
   jne skip-log. FULL-dword: nonzero filename skips the no-filename
   logger; zero -> HOST log 0xa112c0 (1, 0xb7f1e0 — Rerun's own string).
   SAME GameState+0x1fdbc size field as Delete P7 / exit v46
   isaac_exit_958ed0_local_filename_present. */
extern "C" int32_t isaac_game_state_9c8410_filename_present(
    uint32_t size_1fdbc) {
  return (size_1fdbc != 0u) ? 1 : 0;
}

/* Fallback filename string pointer (mem-law): inline buffer address
   (u32 wrap) or heap pointer load32 at the buffer slot (+0x1fdc4). */
extern "C" uint32_t isaac_game_state_9c8410_filename_ptr(
    const uint8_t* mem, uint32_t this_off, uint32_t size_1fdd8) {
  const uint32_t buf_addr =
      this_off + ISAAC_GAME_STATE_9C8410_FILENAME_BUF_OFF;
  if (size_1fdd8 < ISAAC_GAME_STATE_9C8410_SSO_THRESHOLD) {
    return buf_addr; /* inline SSO buffer at this+0x1fdc4 */
  }
  uint32_t v = 0u;
  if (mem != nullptr) {
    const uint8_t* p = mem + buf_addr;
    v = static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
        (static_cast<uint32_t>(p[2]) << 16) |
        (static_cast<uint32_t>(p[3]) << 24);
  }
  return v; /* heap pointer word */
}

/* --- ABI v1 accessors (constants pinned through the wasm ABI) --- */
extern "C" uint32_t isaac_game_state_9c8350_va(void) {
  return ISAAC_GAME_STATE_9C8350_VA;
}
extern "C" uint32_t isaac_game_state_9c8350_end_va(void) {
  return ISAAC_GAME_STATE_9C8350_END_VA;
}
extern "C" uint32_t isaac_game_state_9c8350_body_bytes(void) {
  return ISAAC_GAME_STATE_9C8350_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9c8350_next_va(void) {
  return ISAAC_GAME_STATE_9C8350_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9c8350_tail_va(void) {
  return ISAAC_GAME_STATE_9C8350_TAIL_VA;
}
extern "C" uint32_t isaac_game_state_9c8350_steam_iat(void) {
  return ISAAC_GAME_STATE_9C8350_STEAM_IAT;
}
extern "C" uint32_t isaac_game_state_9c8350_steam_arg(void) {
  return ISAAC_GAME_STATE_9C8350_STEAM_ARG;
}
extern "C" uint32_t isaac_game_state_9c8350_remove_iat(void) {
  return ISAAC_GAME_STATE_9C8350_REMOVE_IAT;
}
extern "C" uint32_t isaac_game_state_9c8350_logger_va(void) {
  return ISAAC_GAME_STATE_9C8350_LOGGER_VA;
}
extern "C" uint32_t isaac_game_state_9c8350_log_str_va(void) {
  return ISAAC_GAME_STATE_9C8350_LOG_STR_VA;
}
extern "C" uint32_t isaac_game_state_9c8350_mgr_global_dat(void) {
  return ISAAC_GAME_STATE_9C8350_MGR_GLOBAL_DAT;
}
extern "C" uint32_t isaac_game_state_9c8350_cloud_off(void) {
  return ISAAC_GAME_STATE_9C8350_CLOUD_OFF;
}
extern "C" uint32_t isaac_game_state_9c8350_filename_size_off(void) {
  return ISAAC_GAME_STATE_9C8350_FILENAME_SIZE_OFF;
}
extern "C" uint32_t isaac_game_state_9c8350_filename_buf_off(void) {
  return ISAAC_GAME_STATE_9C8350_FILENAME_BUF_OFF;
}
extern "C" uint32_t isaac_game_state_9c8350_statname_size_off(void) {
  return ISAAC_GAME_STATE_9C8350_STATNAME_SIZE_OFF;
}
extern "C" uint32_t isaac_game_state_9c8350_statname_buf_off(void) {
  return ISAAC_GAME_STATE_9C8350_STATNAME_BUF_OFF;
}
extern "C" uint32_t isaac_game_state_9c8350_sso_threshold(void) {
  return ISAAC_GAME_STATE_9C8350_SSO_THRESHOLD;
}
extern "C" uint32_t isaac_game_state_9c8350_vtbl34_slot(void) {
  return ISAAC_GAME_STATE_9C8350_VTBL34_SLOT;
}
extern "C" uint32_t isaac_game_state_9c8350_vtbl18_slot(void) {
  return ISAAC_GAME_STATE_9C8350_VTBL18_SLOT;
}
extern "C" uint32_t isaac_game_state_9c8350_caller_count(void) {
  return ISAAC_GAME_STATE_9C8350_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9c8350_caller_va_at(uint32_t index) {
  switch (index) {
    case 0u: return ISAAC_GAME_STATE_9C8350_CALLER_VA_0;
    case 1u: return ISAAC_GAME_STATE_9C8350_CALLER_VA_1;
    case 2u: return ISAAC_GAME_STATE_9C8350_CALLER_VA_2;
    case 3u: return ISAAC_GAME_STATE_9C8350_CALLER_VA_3;
    case 4u: return ISAAC_GAME_STATE_9C8350_CALLER_VA_4;
    default: return 0u;
  }
}

/* --- ABI v2 accessors: DeleteRerun 0x009c8410 --- */
extern "C" uint32_t isaac_game_state_9c8410_va(void) {
  return ISAAC_GAME_STATE_9C8410_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_end_va(void) {
  return ISAAC_GAME_STATE_9C8410_END_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_body_bytes(void) {
  return ISAAC_GAME_STATE_9C8410_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9c8410_next_va(void) {
  return ISAAC_GAME_STATE_9C8410_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_steam_ret_va(void) {
  return ISAAC_GAME_STATE_9C8410_STEAM_RET_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_tail_ret_va(void) {
  return ISAAC_GAME_STATE_9C8410_TAIL_RET_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_steam_iat(void) {
  return ISAAC_GAME_STATE_9C8410_STEAM_IAT;
}
extern "C" uint32_t isaac_game_state_9c8410_steam_arg(void) {
  return ISAAC_GAME_STATE_9C8410_STEAM_ARG;
}
extern "C" uint32_t isaac_game_state_9c8410_remove_iat(void) {
  return ISAAC_GAME_STATE_9C8410_REMOVE_IAT;
}
extern "C" uint32_t isaac_game_state_9c8410_logger_va(void) {
  return ISAAC_GAME_STATE_9C8410_LOGGER_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_log_str_va(void) {
  return ISAAC_GAME_STATE_9C8410_LOG_STR_VA;
}
extern "C" uint32_t isaac_game_state_9c8410_mgr_global_dat(void) {
  return ISAAC_GAME_STATE_9C8410_MGR_GLOBAL_DAT;
}
extern "C" uint32_t isaac_game_state_9c8410_cloud_off(void) {
  return ISAAC_GAME_STATE_9C8410_CLOUD_OFF;
}
extern "C" uint32_t isaac_game_state_9c8410_filename_empty_size_off(void) {
  return ISAAC_GAME_STATE_9C8410_FILENAME_EMPTY_SIZE_OFF;
}
extern "C" uint32_t isaac_game_state_9c8410_filename_size_off(void) {
  return ISAAC_GAME_STATE_9C8410_FILENAME_SIZE_OFF;
}
extern "C" uint32_t isaac_game_state_9c8410_filename_buf_off(void) {
  return ISAAC_GAME_STATE_9C8410_FILENAME_BUF_OFF;
}
extern "C" uint32_t isaac_game_state_9c8410_statname_size_off(void) {
  return ISAAC_GAME_STATE_9C8410_STATNAME_SIZE_OFF;
}
extern "C" uint32_t isaac_game_state_9c8410_statname_buf_off(void) {
  return ISAAC_GAME_STATE_9C8410_STATNAME_BUF_OFF;
}
extern "C" uint32_t isaac_game_state_9c8410_sso_threshold(void) {
  return ISAAC_GAME_STATE_9C8410_SSO_THRESHOLD;
}
extern "C" uint32_t isaac_game_state_9c8410_vtbl34_slot(void) {
  return ISAAC_GAME_STATE_9C8410_VTBL34_SLOT;
}
extern "C" uint32_t isaac_game_state_9c8410_vtbl18_slot(void) {
  return ISAAC_GAME_STATE_9C8410_VTBL18_SLOT;
}
extern "C" uint32_t isaac_game_state_9c8410_caller_count(void) {
  return ISAAC_GAME_STATE_9C8410_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9c8410_caller_va_at(uint32_t index) {
  switch (index) {
    case 0u: return ISAAC_GAME_STATE_9C8410_CALLER_VA_0;
    case 1u: return ISAAC_GAME_STATE_9C8410_CALLER_VA_1;
    case 2u: return ISAAC_GAME_STATE_9C8410_CALLER_VA_2;
    case 3u: return ISAAC_GAME_STATE_9C8410_CALLER_VA_3;
    case 4u: return ISAAC_GAME_STATE_9C8410_CALLER_VA_4;
    default: return 0u;
  }
}

/* --- ABI v2 accessors: write 0x009c9340 typed-host lease --- */
extern "C" uint32_t isaac_game_state_9c9340_va(void) {
  return ISAAC_GAME_STATE_9C9340_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_end_va(void) {
  return ISAAC_GAME_STATE_9C9340_END_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_body_bytes(void) {
  return ISAAC_GAME_STATE_9C9340_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9c9340_next_va(void) {
  return ISAAC_GAME_STATE_9C9340_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_stream_vtbl_slot(void) {
  return ISAAC_GAME_STATE_9C9340_STREAM_VTBL_SLOT;
}
extern "C" uint32_t isaac_game_state_9c9340_row_writer_va(void) {
  return ISAAC_GAME_STATE_9C9340_ROW_WRITER_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_stream_init_va(void) {
  return ISAAC_GAME_STATE_9C9340_STREAM_INIT_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_gsr_format_str_va(void) {
  return ISAAC_GAME_STATE_9C9340_GSR_FORMAT_STR_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_seeded_log_str_va(void) {
  return ISAAC_GAME_STATE_9C9340_SEEDED_LOG_STR_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_logger_va(void) {
  return ISAAC_GAME_STATE_9C9340_LOGGER_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_se_handler_dat(void) {
  return ISAAC_GAME_STATE_9C9340_SE_HANDLER_DAT;
}
extern "C" uint32_t isaac_game_state_9c9340_gs_cookie_dat(void) {
  return ISAAC_GAME_STATE_9C9340_GS_COOKIE_DAT;
}
extern "C" uint32_t isaac_game_state_9c9340_cookie_tail_va(void) {
  return ISAAC_GAME_STATE_9C9340_COOKIE_TAIL_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_invalid_param_iat(void) {
  return ISAAC_GAME_STATE_9C9340_INVALID_PARAM_IAT;
}
extern "C" uint32_t isaac_game_state_9c9340_free_va(void) {
  return ISAAC_GAME_STATE_9C9340_FREE_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_game_state_io_off(void) {
  return ISAAC_GAME_STATE_9C9340_GAME_STATE_IO_OFF;
}
extern "C" uint32_t isaac_game_state_9c9340_serializer_8d20_va(void) {
  return ISAAC_GAME_STATE_9C9340_SERIALIZER_8D20_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_serializer_87e0_va(void) {
  return ISAAC_GAME_STATE_9C9340_SERIALIZER_87E0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_serializer_85d0_va(void) {
  return ISAAC_GAME_STATE_9C9340_SERIALIZER_85D0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_9d77e0_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_9D77E0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_9d45c0_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_9D45C0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_9cec80_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_9CEC80_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_9d84d0_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_9D84D0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_9eb5b0_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_9EB5B0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_4288a0_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_4288A0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_708ae0_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_708AE0_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_leaf_af05e5_va(void) {
  return ISAAC_GAME_STATE_9C9340_LEAF_AF05E5_VA;
}
extern "C" uint32_t isaac_game_state_9c9340_caller_count(void) {
  return ISAAC_GAME_STATE_9C9340_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9c9340_caller_va_at(uint32_t index) {
  switch (index) {
    case 0u: return ISAAC_GAME_STATE_9C9340_CALLER_VA_0;
    case 1u: return ISAAC_GAME_STATE_9C9340_CALLER_VA_1;
    case 2u: return ISAAC_GAME_STATE_9C9340_CALLER_VA_2;
    default: return 0u;
  }
}

/* --- ABI v3: serializer tree 0x9c84c0..0x9c8d20 leaf laws (PURE-OPEN) --- */

/* R1 lane count (PE 0x009c850e cmp eax,ecx ; cmovb eax,ecx): UNSIGNED max. */
extern "C" int32_t isaac_game_state_9c84c0_lane_count(
    uint32_t cap, uint32_t read_count) {
  return (cap >= read_count) ? (int32_t)cap : (int32_t)read_count;
}

/* R2 clear gate (PE 0x009c851e cmp [ebx+0xc],0 ; jbe): FULL-dword != 0. */
extern "C" int32_t isaac_game_state_9c84c0_clear_needed(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* R3 lane flush (PE 0x009c8550 test bx,bx ; jne): lane 0 of each group. */
extern "C" int32_t isaac_game_state_9c84c0_lane_flush(uint32_t lane) {
  return ((lane & 0x7u) == 0u) ? 1 : 0;
}

/* R4 lane bit select (PE 0x009c85ad test byte,dl ; je btr / bts): the
   source lane byte's bit (lane & 7) becomes the target bit. */
extern "C" int32_t isaac_game_state_9c84c0_lane_bit_set(
    uint32_t byte_val, uint32_t lane) {
  return ((byte_val >> (lane & 0x7u)) & 1u) != 0u ? 1 : 0;
}

/* R5 flush every 8 (PE 0x009c8661 cmp di,8 ; jne): running counter == 8. */
extern "C" int32_t isaac_game_state_9c85d0_flush_every8(uint32_t idx) {
  return (idx == 8u) ? 1 : 0;
}

/* R6 remainder flush (PE 0x009c86a0 test di,di ; je): final partial group. */
extern "C" int32_t isaac_game_state_9c85d0_flush_remainder(uint32_t idx) {
  return (idx != 0u) ? 1 : 0;
}

/* R7 source bit (PE 0x009c864a test [ecx+esi*4],edx ; je / bts): bitmap
   bit idx (word = idx >> 5, mask = 1 << (idx & 0x1f)). */
extern "C" int32_t isaac_game_state_9c85d0_source_bit(
    uint32_t word, uint32_t idx) {
  return ((word >> (idx & 0x1fu)) & 1u) != 0u ? 1 : 0;
}

/* R8/R9 sentinel layout (PE 0x009c870b / 0x009c880b cmp [esi],0x80000000 ;
   jne arm B): FULL-dword equality with the triple sentinel. */
extern "C" int32_t isaac_game_state_9c86e0_sentinel_layout(
    uint32_t first_dword) {
  return (first_dword == ISAAC_GAME_STATE_TRIPLE_SENTINEL) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9c87e0_sentinel_layout(
    uint32_t first_dword) {
  return (first_dword == ISAAC_GAME_STATE_TRIPLE_SENTINEL) ? 1 : 0;
}

/* R10 flags byte (PE 0x009c8ca3 + 0x009c8cb0): bit0 = p64 != 0,
   bit1 = p6c != 0.  Byte output; inputs full-dword. */
extern "C" int32_t isaac_game_state_9c88e0_flags(uint32_t p64,
                                                 uint32_t p6c) {
  uint32_t f = 0u;
  if (p64 != 0u) f |= ISAAC_GAME_STATE_9C88E0_FLAG_BIT0;
  if (p6c != 0u) f |= ISAAC_GAME_STATE_9C88E0_FLAG_BIT1;
  return (int32_t)f;
}

/* R11 blob gate (PE 0x009c8ce6 test esi,esi ; je). */
extern "C" int32_t isaac_game_state_9c88e0_blob_present(uint32_t ptr_64) {
  return (ptr_64 != 0u) ? 1 : 0;
}

/* R12 child gate (PE 0x009c8d04 test ecx,ecx ; je). */
extern "C" int32_t isaac_game_state_9c88e0_child_present(uint32_t ptr_6c) {
  return (ptr_6c != 0u) ? 1 : 0;
}

/* R13 result law (PE 0x009c8d11 mov al,1): constant 1. */
extern "C" int32_t isaac_game_state_9c88e0_returns_true(void) {
  return 1;
}

/* R14 slot presence (PE 0x009c8ff8 test edi,edi ; je): WORD gate on the
   zero-extended u16 slot header. */
extern "C" int32_t isaac_game_state_9c8d20_slot_present(uint32_t slot_word) {
  return ((slot_word & 0xffffu) != 0u) ? 1 : 0;
}

/* R15 table bound (PE 0x009c90e5 cmp ecx,0x3800 ; jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9c8d20_table_more(uint32_t offset) {
  return (offset < ISAAC_GAME_STATE_9C8D20_TABLE_BYTES) ? 1 : 0;
}

/* R16 element count (PE 0x009c90f1, twin 0x009c91d7): magic 0x88888889
   div-by-0x78 — SIGNED floor division of the u32 diff (imul + sar 6 +
   sign correction; exact for all u32 diffs). */
extern "C" uint32_t isaac_game_state_9c8d20_element_count(
    uint32_t begin_ptr, uint32_t end_ptr) {
  int32_t d = (int32_t)(end_ptr - begin_ptr);
  int32_t q = d / (int32_t)ISAAC_GAME_STATE_9C8D20_ELEMENT_STRIDE;
  if (d % (int32_t)ISAAC_GAME_STATE_9C8D20_ELEMENT_STRIDE != 0 && d < 0) {
    q -= 1; /* C++ truncation -> floor for negatives (machine sar floor) */
  }
  return (uint32_t)q;
}

/* R17 zero-count skip (PE 0x009c9132 / 0x009c921b cmp,0 ; jbe): UNSIGNED. */
extern "C" int32_t isaac_game_state_9c8d20_count_nonzero(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* R18 list walk (PE 0x009c9195 je empty ; 0x009c91d5 jne tail): continue
   while node != head (empty list: node == head). */
extern "C" int32_t isaac_game_state_9c8d20_walk_continue(uint32_t node,
                                                         uint32_t head) {
  return (node != head) ? 1 : 0;
}

/* --- ABI v4: GameStateIO save-orchestrator host A/B decision laws --- */

/* S1 pool select (PE 0x009cad68, twin 0x009caecd test esi,esi ; je /
   add esi,0x30 / mov esi,0xc7f618): FULL-dword presence of the pool
   global [0xc7de78].  Returns the selected pool address: nonzero ->
   pool + 0x30 (u32 wrap), zero -> fallback 0xc7f618. */
extern "C" uint32_t isaac_game_state_9cad40_pool_select(
    uint32_t pool_global) {
  return (pool_global != 0u)
             ? (pool_global + ISAAC_GAME_STATE_IO_POOL_STEP)
             : ISAAC_GAME_STATE_IO_POOL_FALLBACK;
}

/* S2 name gate (PE 0x009cadb6 test al,al ; je fail): LOW-BYTE AL of the
   0x683930(name, 0x100000) checksum.  Mask & 0xff in the body (0x100 ->
   byte 0x00 -> fail path). */
extern "C" int32_t isaac_game_state_9cad40_name_gate_ok(
    uint32_t checksum_al) {
  return ((checksum_al & 0xffu) != 0u) ? 1 : 0;
}

/* S3 open gate (PE 0x009cadcb, twin 0x009caf2d test al,al ; je fail):
   LOW-BYTE AL of the vtbl+0x30 stream-open call.  Mask & 0xff. */
extern "C" int32_t isaac_game_state_9cad40_open_gate_ok(uint32_t open_al) {
  return ((open_al & 0xffu) != 0u) ? 1 : 0;
}

/* S4 rerun gate (PE 0x009caf18 test al,al ; je fail): LOW-BYTE AL of the
   vtbl+0x24 stat-name-arm call (host B).  Mask & 0xff. */
extern "C" int32_t isaac_game_state_9caea0_rerun_gate_ok(
    uint32_t rerun_al) {
  return ((rerun_al & 0xffu) != 0u) ? 1 : 0;
}

/* S5 rerun-success store law (PE 0x009caf89 test bl,bl ; jne 0x9cafe9 ;
   mov byte [edi+0x1fded],1 ; mov al,1): LOW-BYTE of GameState::
   read_rerun's bool AL.  Nonzero (masked & 0xff) -> the byte stored at
   [GameState+0x1fded] is 1 (and the function returns 1); zero ->
   DeleteRerun fallback + 0. */
extern "C" int32_t isaac_game_state_9caea0_rerun_success(
    uint32_t read_rerun_al) {
  return ((read_rerun_al & 0xffu) != 0u) ? 1 : 0;
}

/* S6 io-dtor gate (PE 0x009cad58, twin 0x009caebd test ecx,ecx ; je):
   FULL-dword presence of the existing GameStateIO* at [GameState+
   0x1fe24] -> the vtbl+0 release dtor call.  Same field+shape as exit
   v46 isaac_exit_958ed0_io_dtor_needed (GameState-owned twin). */
extern "C" int32_t isaac_game_state_9cad40_io_dtor_needed(
    uint32_t io_ptr_1fe24) {
  return (io_ptr_1fe24 != 0u) ? 1 : 0;
}

/* --- ABI v3 accessors: serializer tree (constants pinned through wasm) --- */
extern "C" uint32_t isaac_game_state_9c84c0_va(void) { return ISAAC_GAME_STATE_9C84C0_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_end_va(void) { return ISAAC_GAME_STATE_9C84C0_END_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_body_bytes(void) { return ISAAC_GAME_STATE_9C84C0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9c84c0_next_va(void) { return ISAAC_GAME_STATE_9C84C0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_lane_count_gate_va(void) { return ISAAC_GAME_STATE_9C84C0_LANE_COUNT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_clear_gate_va(void) { return ISAAC_GAME_STATE_9C84C0_CLEAR_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_flush_gate_va(void) { return ISAAC_GAME_STATE_9C84C0_FLUSH_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_bit_select_gate_va(void) { return ISAAC_GAME_STATE_9C84C0_BIT_SELECT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c84c0_caller_count(void) { return ISAAC_GAME_STATE_9C84C0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9c84c0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9C84C0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9C84C0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9C84C0_CALLER_VA_2;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9c85d0_va(void) { return ISAAC_GAME_STATE_9C85D0_VA; }
extern "C" uint32_t isaac_game_state_9c85d0_end_va(void) { return ISAAC_GAME_STATE_9C85D0_END_VA; }
extern "C" uint32_t isaac_game_state_9c85d0_body_bytes(void) { return ISAAC_GAME_STATE_9C85D0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9c85d0_next_va(void) { return ISAAC_GAME_STATE_9C85D0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9c85d0_flush8_gate_va(void) { return ISAAC_GAME_STATE_9C85D0_FLUSH8_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c85d0_remainder_gate_va(void) { return ISAAC_GAME_STATE_9C85D0_REMAINDER_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c85d0_bit_test_gate_va(void) { return ISAAC_GAME_STATE_9C85D0_BIT_TEST_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c85d0_caller_count(void) { return ISAAC_GAME_STATE_9C85D0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9c85d0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9C85D0_CALLER_VA_0;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9c86e0_va(void) { return ISAAC_GAME_STATE_9C86E0_VA; }
extern "C" uint32_t isaac_game_state_9c86e0_end_va(void) { return ISAAC_GAME_STATE_9C86E0_END_VA; }
extern "C" uint32_t isaac_game_state_9c86e0_body_bytes(void) { return ISAAC_GAME_STATE_9C86E0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9c86e0_next_va(void) { return ISAAC_GAME_STATE_9C86E0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9c86e0_sentinel_gate_va(void) { return ISAAC_GAME_STATE_9C86E0_SENTINEL_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c86e0_caller_count(void) { return ISAAC_GAME_STATE_9C86E0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9c86e0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9C86E0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9C86E0_CALLER_VA_1;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9c87e0_va(void) { return ISAAC_GAME_STATE_9C87E0_VA; }
extern "C" uint32_t isaac_game_state_9c87e0_end_va(void) { return ISAAC_GAME_STATE_9C87E0_END_VA; }
extern "C" uint32_t isaac_game_state_9c87e0_body_bytes(void) { return ISAAC_GAME_STATE_9C87E0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9c87e0_next_va(void) { return ISAAC_GAME_STATE_9C87E0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9c87e0_sentinel_gate_va(void) { return ISAAC_GAME_STATE_9C87E0_SENTINEL_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c87e0_caller_count(void) { return ISAAC_GAME_STATE_9C87E0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9c87e0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9C87E0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9C87E0_CALLER_VA_1;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9c88e0_va(void) { return ISAAC_GAME_STATE_9C88E0_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_end_va(void) { return ISAAC_GAME_STATE_9C88E0_END_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_body_bytes(void) { return ISAAC_GAME_STATE_9C88E0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9c88e0_next_va(void) { return ISAAC_GAME_STATE_9C88E0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_flags_bit0_gate_va(void) { return ISAAC_GAME_STATE_9C88E0_FLAGS_BIT0_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_flags_bit1_gate_va(void) { return ISAAC_GAME_STATE_9C88E0_FLAGS_BIT1_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_blob_gate_va(void) { return ISAAC_GAME_STATE_9C88E0_BLOB_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_child_gate_va(void) { return ISAAC_GAME_STATE_9C88E0_CHILD_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_ret_true_va(void) { return ISAAC_GAME_STATE_9C88E0_RET_TRUE_VA; }
extern "C" uint32_t isaac_game_state_9c88e0_caller_count(void) { return ISAAC_GAME_STATE_9C88E0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9c88e0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9C88E0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9C88E0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9C88E0_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9C88E0_CALLER_VA_3;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9c8d20_va(void) { return ISAAC_GAME_STATE_9C8D20_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_end_va(void) { return ISAAC_GAME_STATE_9C8D20_END_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_body_bytes(void) { return ISAAC_GAME_STATE_9C8D20_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9c8d20_next_va(void) { return ISAAC_GAME_STATE_9C8D20_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_slot_gate_va(void) { return ISAAC_GAME_STATE_9C8D20_SLOT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_table_bound_gate_va(void) { return ISAAC_GAME_STATE_9C8D20_TABLE_BOUND_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_element_count_va(void) { return ISAAC_GAME_STATE_9C8D20_ELEMENT_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_count_zero_gate_va(void) { return ISAAC_GAME_STATE_9C8D20_COUNT_ZERO_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_count_zero_gate_va_2(void) { return ISAAC_GAME_STATE_9C8D20_COUNT_ZERO_GATE_VA_2; }
extern "C" uint32_t isaac_game_state_9c8d20_walk_empty_gate_va(void) { return ISAAC_GAME_STATE_9C8D20_WALK_EMPTY_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_walk_tail_gate_va(void) { return ISAAC_GAME_STATE_9C8D20_WALK_TAIL_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_caller_count(void) { return ISAAC_GAME_STATE_9C8D20_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9c8d20_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9C8D20_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9C8D20_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9C8D20_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9C8D20_CALLER_VA_3;
    default: return 0u;
  }
}

/* --- ABI v4 accessors: save-orchestrator hosts 0x9cad40/0x9caea0 + read_rerun lease + cluster spans --- */
extern "C" uint32_t isaac_game_state_9cad40_va(void) { return ISAAC_GAME_STATE_9CAD40_VA; }
extern "C" uint32_t isaac_game_state_9cad40_end_va(void) { return ISAAC_GAME_STATE_9CAD40_END_VA; }
extern "C" uint32_t isaac_game_state_9cad40_body_bytes(void) { return ISAAC_GAME_STATE_9CAD40_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cad40_next_va(void) { return ISAAC_GAME_STATE_9CAD40_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cad40_io_dtor_gate_va(void) { return ISAAC_GAME_STATE_9CAD40_IO_DTOR_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cad40_pool_select_va(void) { return ISAAC_GAME_STATE_9CAD40_POOL_SELECT_VA; }
extern "C" uint32_t isaac_game_state_9cad40_name_gate_va(void) { return ISAAC_GAME_STATE_9CAD40_NAME_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cad40_open_gate_va(void) { return ISAAC_GAME_STATE_9CAD40_OPEN_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cad40_write_call_va(void) { return ISAAC_GAME_STATE_9CAD40_WRITE_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cad40_statname_sso_gate_va(void) { return ISAAC_GAME_STATE_9CAD40_STATNAME_SSO_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cad40_close_call_va(void) { return ISAAC_GAME_STATE_9CAD40_CLOSE_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cad40_fail_log_call_va(void) { return ISAAC_GAME_STATE_9CAD40_FAIL_LOG_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cad40_fail_close_call_va(void) { return ISAAC_GAME_STATE_9CAD40_FAIL_CLOSE_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cad40_log_str_va(void) { return ISAAC_GAME_STATE_9CAD40_LOG_STR_VA; }
extern "C" uint32_t isaac_game_state_9cad40_caller_count(void) { return ISAAC_GAME_STATE_9CAD40_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9cad40_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CAD40_CALLER_VA_0;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9caea0_va(void) { return ISAAC_GAME_STATE_9CAEA0_VA; }
extern "C" uint32_t isaac_game_state_9caea0_end_va(void) { return ISAAC_GAME_STATE_9CAEA0_END_VA; }
extern "C" uint32_t isaac_game_state_9caea0_body_bytes(void) { return ISAAC_GAME_STATE_9CAEA0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9caea0_next_va(void) { return ISAAC_GAME_STATE_9CAEA0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9caea0_io_dtor_gate_va(void) { return ISAAC_GAME_STATE_9CAEA0_IO_DTOR_GATE_VA; }
extern "C" uint32_t isaac_game_state_9caea0_pool_select_va(void) { return ISAAC_GAME_STATE_9CAEA0_POOL_SELECT_VA; }
extern "C" uint32_t isaac_game_state_9caea0_rerun_gate_va(void) { return ISAAC_GAME_STATE_9CAEA0_RERUN_GATE_VA; }
extern "C" uint32_t isaac_game_state_9caea0_open_gate_va(void) { return ISAAC_GAME_STATE_9CAEA0_OPEN_GATE_VA; }
extern "C" uint32_t isaac_game_state_9caea0_rerun_call_va(void) { return ISAAC_GAME_STATE_9CAEA0_RERUN_CALL_VA; }
extern "C" uint32_t isaac_game_state_9caea0_success_gate_va(void) { return ISAAC_GAME_STATE_9CAEA0_SUCCESS_GATE_VA; }
extern "C" uint32_t isaac_game_state_9caea0_success_store_va(void) { return ISAAC_GAME_STATE_9CAEA0_SUCCESS_STORE_VA; }
extern "C" uint32_t isaac_game_state_9caea0_delete_rerun_call_va(void) { return ISAAC_GAME_STATE_9CAEA0_DELETE_RERUN_CALL_VA; }
extern "C" uint32_t isaac_game_state_9caea0_rerun_flag_word_off(void) { return ISAAC_GAME_STATE_9CAEA0_RERUN_FLAG_WORD_OFF; }
extern "C" uint32_t isaac_game_state_9caea0_rerun_success_byte_off(void) { return ISAAC_GAME_STATE_9CAEA0_RERUN_SUCCESS_BYTE_OFF; }
extern "C" uint32_t isaac_game_state_9caea0_rerun_statname_buf_off(void) { return ISAAC_GAME_STATE_9CAEA0_RERUN_STATNAME_BUF_OFF; }
extern "C" uint32_t isaac_game_state_9caea0_rerun_statname_size_off(void) { return ISAAC_GAME_STATE_9CAEA0_RERUN_STATNAME_SIZE_OFF; }
extern "C" uint32_t isaac_game_state_9caea0_statname_sso_gate_va(void) { return ISAAC_GAME_STATE_9CAEA0_STATNAME_SSO_GATE_VA; }
extern "C" uint32_t isaac_game_state_9caea0_log_str_va(void) { return ISAAC_GAME_STATE_9CAEA0_LOG_STR_VA; }
extern "C" uint32_t isaac_game_state_9caea0_caller_count(void) { return ISAAC_GAME_STATE_9CAEA0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9caea0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CAEA0_CALLER_VA_0;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_io_vtable(void) { return ISAAC_GAME_STATE_IO_VTABLE; }
extern "C" uint32_t isaac_game_state_io_ctor_version(void) { return ISAAC_GAME_STATE_IO_CTOR_VERSION; }
extern "C" uint32_t isaac_game_state_io_alloc_size(void) { return ISAAC_GAME_STATE_IO_ALLOC_SIZE; }
extern "C" uint32_t isaac_game_state_io_alloc_iat(void) { return ISAAC_GAME_STATE_IO_ALLOC_IAT; }
extern "C" uint32_t isaac_game_state_io_fail_alloc_va(void) { return ISAAC_GAME_STATE_IO_FAIL_ALLOC_VA; }
extern "C" uint32_t isaac_game_state_io_checksum_va(void) { return ISAAC_GAME_STATE_IO_CHECKSUM_VA; }
extern "C" uint32_t isaac_game_state_io_checksum_size(void) { return ISAAC_GAME_STATE_IO_CHECKSUM_SIZE; }
extern "C" uint32_t isaac_game_state_io_pool_global_dat(void) { return ISAAC_GAME_STATE_IO_POOL_GLOBAL_DAT; }
extern "C" uint32_t isaac_game_state_io_pool_fallback(void) { return ISAAC_GAME_STATE_IO_POOL_FALLBACK; }
extern "C" uint32_t isaac_game_state_io_pool_step(void) { return ISAAC_GAME_STATE_IO_POOL_STEP; }
extern "C" uint32_t isaac_game_state_io_vtbl_open_slot(void) { return ISAAC_GAME_STATE_IO_VTBL_OPEN_SLOT; }
extern "C" uint32_t isaac_game_state_io_vtbl_close_slot(void) { return ISAAC_GAME_STATE_IO_VTBL_CLOSE_SLOT; }
extern "C" uint32_t isaac_game_state_io_vtbl_rerun_slot(void) { return ISAAC_GAME_STATE_IO_VTBL_RERUN_SLOT; }
extern "C" uint32_t isaac_game_state_io_vtbl_dtor_slot(void) { return ISAAC_GAME_STATE_IO_VTBL_DTOR_SLOT; }
extern "C" uint32_t isaac_game_state_write_record_seed(void) { return ISAAC_GAME_STATE_WRITE_RECORD_SEED; }
extern "C" uint32_t isaac_game_state_write_record_flags(void) { return ISAAC_GAME_STATE_WRITE_RECORD_FLAGS; }
extern "C" uint32_t isaac_game_state_9d7d50_va(void) { return ISAAC_GAME_STATE_9D7D50_VA; }
extern "C" uint32_t isaac_game_state_9d7d50_end_va(void) { return ISAAC_GAME_STATE_9D7D50_END_VA; }
extern "C" uint32_t isaac_game_state_9d7d50_body_bytes(void) { return ISAAC_GAME_STATE_9D7D50_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d7d50_next_va(void) { return ISAAC_GAME_STATE_9D7D50_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d7d50_caller_count(void) { return ISAAC_GAME_STATE_9D7D50_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d7d50_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D7D50_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D7D50_CALLER_VA_1;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9d7d50_checksum_xor(void) { return ISAAC_GAME_STATE_9D7D50_CHECKSUM_XOR; }
extern "C" uint32_t isaac_game_state_9d7d50_checksum_off(void) { return ISAAC_GAME_STATE_9D7D50_CHECKSUM_OFF; }
extern "C" uint32_t isaac_game_state_9d7d50_version_off(void) { return ISAAC_GAME_STATE_9D7D50_VERSION_OFF; }
extern "C" uint32_t isaac_game_state_9d7d50_rerun_success_byte_off(void) { return ISAAC_GAME_STATE_9D7D50_RERUN_SUCCESS_BYTE_OFF; }
extern "C" uint32_t isaac_game_state_9d7d50_gs_cookie_dat(void) { return ISAAC_GAME_STATE_9D7D50_GS_COOKIE_DAT; }
extern "C" uint32_t isaac_game_state_9d7d50_cookie_tail_va(void) { return ISAAC_GAME_STATE_9D7D50_COOKIE_TAIL_VA; }
extern "C" uint32_t isaac_game_state_9d45c0_end_va(void) { return ISAAC_GAME_STATE_9D45C0_END_VA; }
extern "C" uint32_t isaac_game_state_9d45c0_body_bytes(void) { return ISAAC_GAME_STATE_9D45C0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d45c0_next_va(void) { return ISAAC_GAME_STATE_9D45C0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cec80_end_va(void) { return ISAAC_GAME_STATE_9CEC80_END_VA; }
extern "C" uint32_t isaac_game_state_9cec80_body_bytes(void) { return ISAAC_GAME_STATE_9CEC80_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cec80_next_va(void) { return ISAAC_GAME_STATE_9CEC80_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d84d0_end_va(void) { return ISAAC_GAME_STATE_9D84D0_END_VA; }
extern "C" uint32_t isaac_game_state_9d84d0_body_bytes(void) { return ISAAC_GAME_STATE_9D84D0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d84d0_next_va(void) { return ISAAC_GAME_STATE_9D84D0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d84a0_end_va(void) { return ISAAC_GAME_STATE_9D84A0_END_VA; }
extern "C" uint32_t isaac_game_state_9d84a0_body_bytes(void) { return ISAAC_GAME_STATE_9D84A0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d84a0_next_va(void) { return ISAAC_GAME_STATE_9D84A0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8550_end_va(void) { return ISAAC_GAME_STATE_9D8550_END_VA; }
extern "C" uint32_t isaac_game_state_9d8550_body_bytes(void) { return ISAAC_GAME_STATE_9D8550_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8550_next_va(void) { return ISAAC_GAME_STATE_9D8550_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cb020_va(void) { return ISAAC_GAME_STATE_READER_ROW_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cb020_caller_count(void) { return 4u; }
extern "C" uint32_t isaac_game_state_9cb020_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return 0x009cb5eeu;
    case 1: return 0x009cbe40u;
    case 2: return 0x009cbf83u;
    case 3: return 0x009d1df0u;
    default: return 0u;
  }
}

/* --- ABI v5: write-span loop/decision laws (0x9c9340 peel) + 0x9c8d20 bounds + 0x683930 name gate --- */

/* U1 element-loop bound (PE 0x009c9157, twin 0x009c9249 cmp eax,count ;
   jb): UNSIGNED idx < count — the two div-0x78 element serialization
   loops (count = R16 law output). */
extern "C" int32_t isaac_game_state_9c8d20_element_loop_more(
    uint32_t idx, uint32_t count) {
  return (idx < count) ? 1 : 0;
}

/* W1 hash-table loop entry (PE 0x009c9ca0 cmp [esi+0x1952c],0 ; jbe):
   UNSIGNED count != 0. */
extern "C" int32_t isaac_game_state_9c9340_hash_count_nonzero(
    uint32_t count_1952c) {
  return (count_1952c != 0u) ? 1 : 0;
}

/* W2 hash probe slot (PE 0x009c9cc0 lea [hash+idx] / dec cap / and):
   (idx + hash) & (cap - 1), u32 wrap. */
extern "C" uint32_t isaac_game_state_9c9340_hash_probe_slot(
    uint32_t idx, uint32_t hash_19528, uint32_t cap_19524) {
  return (idx + hash_19528) & (cap_19524 - 1u);
}

/* W3 hash loop bound (PE 0x009c9cd8 cmp edi,count ; jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9c9340_hash_loop_more(
    uint32_t idx, uint32_t count_1952c) {
  return (idx < count_1952c) ? 1 : 0;
}

/* W4 value-array loop entry (PE 0x009c9d17 cmp [esi+0x19c],0 ; jbe):
   UNSIGNED count != 0. */
extern "C" int32_t isaac_game_state_9c9340_value_count_nonzero(
    uint32_t count_19c) {
  return (count_19c != 0u) ? 1 : 0;
}

/* W5 value loop bound (PE 0x009c9d5c cmp eax,[ecx] ; jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9c9340_value_loop_more(
    uint32_t idx, uint32_t count_19c) {
  return (idx < count_19c) ? 1 : 0;
}

/* W6 reorder entry sign (PE 0x009c9dc5 test eax,eax ; jns): SIGNED
   (int64)(int32)entry < 0 — wasm32 compare-flip class (i64 sign-
   extend; 0xffffffff / 0x80000000 ARE negative). */
extern "C" int32_t isaac_game_state_9c9340_reorder_entry_negative(
    uint32_t entry) {
  return ((int64_t)(int32_t)entry < (int64_t)0) ? 1 : 0;
}

/* W7 reorder pending-run flush (PE 0x009c9dcf test cx,cx ; je): WORD
   gate (pending & 0xffff) != 0. */
extern "C" int32_t isaac_game_state_9c9340_reorder_pending_flush(
    uint32_t pending) {
  return ((pending & 0xffffu) != 0u) ? 1 : 0;
}

/* W8 reorder run word (PE 0x009c9dd5 dec ecx / or ecx,0x8000 / mov
   word): (((pending - 1) | 0x8000) & 0xffff). */
extern "C" uint32_t isaac_game_state_9c9340_reorder_run_word(
    uint32_t pending) {
  return (((pending - 1u) | ISAAC_GAME_STATE_9C9340_REORDER_RUN_MARKER) &
          0xffffu);
}

/* W9 reorder post-loop tail flush (PE 0x009c9e07 test cx,cx ; je):
   WORD gate (twin of W7 for the after-loop remainder). */
extern "C" int32_t isaac_game_state_9c9340_reorder_final_flush(
    uint32_t pending) {
  return ((pending & 0xffffu) != 0u) ? 1 : 0;
}

/* W10 div-0xc element count (PE 0x009ca858, twin 0x009ca9c6):
   mov eax,0x2aaaaaab ; imul ecx ; sar edx,1 ; mov eax,edx ; shr
   eax,0x1f ; add eax,edx — the NO-ADD magic form:
   q = (hi >> 1) + ((uint32)(hi >> 1) >> 31), hi = high dword of
   (int64)(int32)(end - begin) * 0x2aaaaaab.  TRUNCATION toward zero
   (NOT floor: -13 -> 0xffffffff, INT32_MIN -> 0xf5555556). */
extern "C" uint32_t isaac_game_state_9c9340_div0xc_count(
    uint32_t begin_off, uint32_t end_off) {
  const int32_t diff = (int32_t)(end_off - begin_off); /* u32 wrap */
  const int64_t prod = (int64_t)diff * (int64_t)ISAAC_GAME_STATE_9C9340_DIV0XC_MAGIC;
  const int32_t hi = (int32_t)(prod >> 32); /* imul edx */
  const int32_t sar = hi >> 1; /* sar edx,1 */
  const uint32_t sign = ((uint32_t)sar >> 31) & 1u; /* shr eax,0x1f */
  return (uint32_t)(sar + (int32_t)sign); /* add eax,edx */
}

/* W11 div-0xc resize trigger (PE 0x009ca868 cmp eax,0xff ; jbe):
   UNSIGNED count > 0xff. */
extern "C" int32_t isaac_game_state_9c9340_div0xc_resize_needed(
    uint32_t count) {
  return (count > ISAAC_GAME_STATE_9C9340_DIV0XC_CAP) ? 1 : 0;
}

/* W12 div-0xc count byte (PE 0x009ca8ad mov byte [ebp-0x44d],al):
   count & 0xff (0x100 -> 0). */
extern "C" uint32_t isaac_game_state_9c9340_div0xc_count_byte(
    uint32_t count) {
  return count & 0xffu;
}

/* W13 div-0xc loop entry (PE 0x009ca8fd je 0x9ca9ef): count != 0
   (|diff| < 0xc skips the 3-u32-field loop). */
extern "C" int32_t isaac_game_state_9c9340_div0xc_loop_needed(
    uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* W14 div-0xc loop bound (PE 0x009ca9e1 cmp esi,eax ; jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9c9340_div0xc_loop_more(
    uint32_t idx, uint32_t count) {
  return (idx < count) ? 1 : 0;
}

/* W15 7-lane count (PE 0x009caa9c mov [ebp-0x44c],7): constant 7. */
extern "C" uint32_t isaac_game_state_9c9340_lane7_count(void) {
  return ISAAC_GAME_STATE_9C9340_LANE7_COUNT;
}

/* W16 7-lane loop bound (PE 0x009cac22 sub [ebp-0x44c],1 ; jne):
   (remaining - 1) != 0 u32 — the countdown 7..1. */
extern "C" int32_t isaac_game_state_9c9340_lane7_loop_more(
    uint32_t remaining) {
  return ((remaining - 1u) != 0u) ? 1 : 0;
}

/* W17 signed byte-count loop entry (PE 0x009cab2a, twin 0x009cabb9 cmp
   byte,0 ; jle skip): SIGNED byte (int8)(count & 0xff) > 0 (0x80..0xff
   negative -> skip; wasm32 compare-flip class, i8 sign-extend). */
extern "C" int32_t isaac_game_state_9c9340_byte_count_needed(
    uint32_t count_byte) {
  return ((int64_t)(int32_t)(int8_t)(count_byte & 0xffu) > (int64_t)0)
             ? 1
             : 0;
}

/* W18 signed byte-count loop bound (PE 0x009cab70, twin 0x009cabf0 cmp
   al,byte ; jl): (int8)(i & 0xff) < (int8)(count & 0xff) — wasm32
   compare-flip class. */
extern "C" int32_t isaac_game_state_9c9340_byte_count_more(
    uint32_t i_byte, uint32_t count_byte) {
  return ((int64_t)(int32_t)(int8_t)(i_byte & 0xffu) <
          (int64_t)(int32_t)(int8_t)(count_byte & 0xffu))
             ? 1
             : 0;
}

/* W19 checksum mode-0 finalize gate (PE 0x009cacb2 cmp [edi+0xc],0 ;
   jne skip + 0x009cacbb test dl,dl ; je skip): (mode == 0) FULL-dword
   && ((partial & 0xff) != 0) LOW-BYTE. */
extern "C" int32_t isaac_game_state_9c9340_finalize_needed(
    uint32_t mode, uint32_t partial) {
  return (mode == 0u && (partial & 0xffu) != 0u) ? 1 : 0;
}

/* W20 finalize pad bytes (PE 0x009cacbf cmp dl,4 ; jae / mov al,4 /
   sub al,dl): ((partial & 0xff) < 4) ? (4 - (partial & 0xff)) : 0. */
extern "C" uint32_t isaac_game_state_9c9340_finalize_pad_bytes(
    uint32_t partial) {
  const uint32_t p = partial & 0xffu;
  return (p < 4u) ? (4u - p) : 0u;
}

/* W21 finalize fold (PE 0x009cacdc shr ecx,1 / shl eax,0x1f / add
   ecx,eax / add ecx,[edi]): (ror32(acc,1) + lane) u32 wrap — the
   mode-0 fold (the two shifts never overlap, sum == rotate). */
extern "C" uint32_t isaac_game_state_9c9340_finalize_ror_add(
    uint32_t acc, uint32_t lane) {
  return ((acc >> 1u) | (acc << 31u)) + lane;
}

/* W22 checksum stream word (PE 0x009cad00 mov [esi+0x1fda4],eax / xor
   eax,0x96696996): acc ^ 0x96696996 — the final streamed dword (raw
   acc stored at GameState+0x1fda4). */
extern "C" uint32_t isaac_game_state_9c9340_checksum_stream_word(
    uint32_t acc) {
  return acc ^ ISAAC_GAME_STATE_9C9340_CHECKSUM_XOR;
}

/* N1 0x683930 name-open gate (PE 0x0068394a cmp dword [eax],0 ; jne):
   FULL-dword presence of the SteamInternal_ContextInit() first dword.
   Nonzero opens the stat-name checksum state (al=1); zero -> al=0
   (ret 8).  0x100 IS present. */
extern "C" int32_t isaac_game_state_683930_name_gate_ok(
    uint32_t steam_ctx_word) {
  return (steam_ctx_word != 0u) ? 1 : 0;
}

/* --- ABI v5 accessors: write-span loop/decision laws + 0x683930 --- */
extern "C" uint32_t isaac_game_state_9c8d20_element_loop_more_va(void) { return ISAAC_GAME_STATE_9C8D20_ELEMENT_LOOP_MORE_VA; }
extern "C" uint32_t isaac_game_state_9c8d20_element_loop_more_va_2(void) { return ISAAC_GAME_STATE_9C8D20_ELEMENT_LOOP_MORE_VA_2; }
extern "C" uint32_t isaac_game_state_9c9340_hash_count_gate_va(void) { return ISAAC_GAME_STATE_9C9340_HASH_COUNT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_hash_probe_va(void) { return ISAAC_GAME_STATE_9C9340_HASH_PROBE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_hash_bound_gate_va(void) { return ISAAC_GAME_STATE_9C9340_HASH_BOUND_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_value_count_gate_va(void) { return ISAAC_GAME_STATE_9C9340_VALUE_COUNT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_value_bound_gate_va(void) { return ISAAC_GAME_STATE_9C9340_VALUE_BOUND_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_neg_gate_va(void) { return ISAAC_GAME_STATE_9C9340_REORDER_NEG_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_flush_gate_va(void) { return ISAAC_GAME_STATE_9C9340_REORDER_FLUSH_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_run_word_va(void) { return ISAAC_GAME_STATE_9C9340_REORDER_RUN_WORD_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_final_flush_va(void) { return ISAAC_GAME_STATE_9C9340_REORDER_FINAL_FLUSH_VA; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_count_va(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_resize_gate_va(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_RESIZE_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_count_byte_va(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_COUNT_BYTE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_needed_gate_va(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_NEEDED_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_bound_gate_va(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_BOUND_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_count_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_more_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_MORE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_byte_count_needed_va(void) { return ISAAC_GAME_STATE_9C9340_BYTE_COUNT_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9c9340_byte_count_needed_va_2(void) { return ISAAC_GAME_STATE_9C9340_BYTE_COUNT_NEEDED_VA_2; }
extern "C" uint32_t isaac_game_state_9c9340_byte_count_more_va(void) { return ISAAC_GAME_STATE_9C9340_BYTE_COUNT_MORE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_byte_count_more_va_2(void) { return ISAAC_GAME_STATE_9C9340_BYTE_COUNT_MORE_VA_2; }
extern "C" uint32_t isaac_game_state_9c9340_finalize_mode_gate_va(void) { return ISAAC_GAME_STATE_9C9340_FINALIZE_MODE_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_finalize_partial_gate_va(void) { return ISAAC_GAME_STATE_9C9340_FINALIZE_PARTIAL_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_finalize_pad_va(void) { return ISAAC_GAME_STATE_9C9340_FINALIZE_PAD_VA; }
extern "C" uint32_t isaac_game_state_9c9340_finalize_fold_va(void) { return ISAAC_GAME_STATE_9C9340_FINALIZE_FOLD_VA; }
extern "C" uint32_t isaac_game_state_9c9340_checksum_store_xor_va(void) { return ISAAC_GAME_STATE_9C9340_CHECKSUM_STORE_XOR_VA; }
extern "C" uint32_t isaac_game_state_9c9340_hash_table_off(void) { return ISAAC_GAME_STATE_9C9340_HASH_TABLE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_hash_cap_off(void) { return ISAAC_GAME_STATE_9C9340_HASH_CAP_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_hash_state_off(void) { return ISAAC_GAME_STATE_9C9340_HASH_STATE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_hash_count_off(void) { return ISAAC_GAME_STATE_9C9340_HASH_COUNT_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_value_count_off(void) { return ISAAC_GAME_STATE_9C9340_VALUE_COUNT_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_value_base_off(void) { return ISAAC_GAME_STATE_9C9340_VALUE_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_holder_base_off(void) { return ISAAC_GAME_STATE_9C9340_HOLDER_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_value_stride(void) { return ISAAC_GAME_STATE_9C9340_VALUE_STRIDE; }
extern "C" uint32_t isaac_game_state_9c9340_holder_stride(void) { return ISAAC_GAME_STATE_9C9340_HOLDER_STRIDE; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_table_off(void) { return ISAAC_GAME_STATE_9C9340_REORDER_TABLE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_entries(void) { return ISAAC_GAME_STATE_9C9340_REORDER_ENTRIES; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_run_marker(void) { return ISAAC_GAME_STATE_9C9340_REORDER_RUN_MARKER; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_begin_off(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_BEGIN_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_magic(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_MAGIC; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_divisor(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_DIVISOR; }
extern "C" uint32_t isaac_game_state_9c9340_div0xc_cap(void) { return ISAAC_GAME_STATE_9C9340_DIV0XC_CAP; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_base_off(void) { return ISAAC_GAME_STATE_9C9340_LANE7_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_stride(void) { return ISAAC_GAME_STATE_9C9340_LANE7_STRIDE; }
extern "C" uint32_t isaac_game_state_9c9340_checksum_off(void) { return ISAAC_GAME_STATE_9C9340_CHECKSUM_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_checksum_xor(void) { return ISAAC_GAME_STATE_9C9340_CHECKSUM_XOR; }
extern "C" uint32_t isaac_game_state_9c9340_state_mode_off(void) { return ISAAC_GAME_STATE_9C9340_STATE_MODE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_state_partial_off(void) { return ISAAC_GAME_STATE_9C9340_STATE_PARTIAL_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_state_acc_off(void) { return ISAAC_GAME_STATE_9C9340_STATE_ACC_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_state_lane_off(void) { return ISAAC_GAME_STATE_9C9340_STATE_LANE_OFF; }
extern "C" uint32_t isaac_game_state_683930_va(void) { return ISAAC_GAME_STATE_683930_VA; }
extern "C" uint32_t isaac_game_state_683930_end_va(void) { return ISAAC_GAME_STATE_683930_END_VA; }
extern "C" uint32_t isaac_game_state_683930_body_bytes(void) { return ISAAC_GAME_STATE_683930_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_683930_next_va(void) { return ISAAC_GAME_STATE_683930_NEXT_VA; }
extern "C" uint32_t isaac_game_state_683930_steam_iat(void) { return ISAAC_GAME_STATE_683930_STEAM_IAT; }
extern "C" uint32_t isaac_game_state_683930_steam_arg(void) { return ISAAC_GAME_STATE_683930_STEAM_ARG; }
extern "C" uint32_t isaac_game_state_683930_steam_gate_va(void) { return ISAAC_GAME_STATE_683930_STEAM_GATE_VA; }
extern "C" uint32_t isaac_game_state_683930_caller_count(void) { return ISAAC_GAME_STATE_683930_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_683930_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_683930_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_683930_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_683930_CALLER_VA_2;
    default: return 0u;
  }
}

/* --- ABI v6: reader row 0x9cb020 format gates R1..R14 (typed-host
 *     lease) + fixed-count serializer loop laws T1..T4 (0x9c9c30 0xe /
 *     0x9c9d66 0x14).  Decode evidence:
 *     section-notes/game-state-v6-reader/cpu-dump/ + NOTES.md. --- */

/* R1..R10 — reader format gates: cmp dword [edi+8],N ; jb skip.
   FULL-dword UNSIGNED: format is the io+8 counter (>= N reads the
   field; R10 flips the 0x47 polarity for the old-format 8-B compat
   read).  0x100 IS >= every threshold. */
extern "C" int32_t isaac_game_state_9cb020_gate_0x3b(uint32_t format) {
  return (format >= 0x3bu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x46(uint32_t format) {
  return (format >= 0x46u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x47(uint32_t format) {
  return (format >= 0x47u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x5b(uint32_t format) {
  return (format >= 0x5bu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x67(uint32_t format) {
  return (format >= 0x67u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x6c(uint32_t format) {
  return (format >= 0x6cu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x88(uint32_t format) {
  return (format >= 0x88u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x96(uint32_t format) {
  return (format >= 0x96u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_gate_0x9e(uint32_t format) {
  return (format >= 0x9eu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_old_u64_gate(uint32_t format) {
  return (format < 0x47u) ? 1 : 0;
}

/* R11/R12 — flags byte-gates (PE 0x9cb53b test al,1 / 0x9cb5ad test
   al,2): LOW-BYTE mask & 0xff in the body (0x100 -> byte 0 -> closed). */
extern "C" int32_t isaac_game_state_9cb020_sub_0x64_present(
    uint32_t flags_byte) {
  const uint32_t flags = flags_byte & 0xffu;
  return (flags & 0x1u) != 0u ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb020_sub_0x6c_present(
    uint32_t flags_byte) {
  const uint32_t flags = flags_byte & 0xffu;
  return (flags & 0x2u) != 0u ? 1 : 0;
}

/* R13 — old-format byte->bool (PE 0x9cb2aa xor/setne): byte-gate
   ((byte & 0xff) != 0) ? 1 : 0 (the format<0x5b +0x30 conversion). */
extern "C" int32_t isaac_game_state_9cb020_old_byte_to_bool(uint32_t byte) {
  return (byte & 0xffu) != 0u ? 1 : 0;
}

/* R14 — old-u64 type-4 store gate (PE 0x9cb33b cmp [esi],4 ; jne):
   FULL-dword equality (field0 == 4). */
extern "C" int32_t isaac_game_state_9cb020_old_u64_type_4(uint32_t field0) {
  return (field0 == ISAAC_GAME_STATE_9CB020_OLD_COMPAT_TYPE) ? 1 : 0;
}

/* T1..T4 — fixed-count serializer loop laws (write-span peel; W16 lane7
   countdown class): the count constant + the ((remaining-1) != 0) u32
   loop-more gate (sub [ebp-0x458],1 ; jne). */
extern "C" uint32_t isaac_game_state_9c9c30_fixed_count(void) {
  return ISAAC_GAME_STATE_9C9C30_FIXED_COUNT;
}
extern "C" int32_t isaac_game_state_9c9c30_loop_more(uint32_t remaining) {
  return (remaining - 1u) != 0u ? 1 : 0;
}
extern "C" uint32_t isaac_game_state_9c9d66_fixed_count(void) {
  return ISAAC_GAME_STATE_9C9D66_FIXED_COUNT;
}
extern "C" int32_t isaac_game_state_9c9d66_loop_more(uint32_t remaining) {
  return (remaining - 1u) != 0u ? 1 : 0;
}

/* X1 reorder-table loop bound (PE 0x009c9dfe sub [ebp-0x458],1 ;
   0x009c9e05 jne 0x9c9dc0): (remaining - 1) != 0 u32 — the 0x1fb-entry
   countdown (init 0x9c9db4; runs 0x1fb times; W16 shape; 0x100 IS
   wide-present, a byte-narrow decay would exit at 0x100). */
extern "C" int32_t isaac_game_state_9c9340_reorder_loop_more(
    uint32_t remaining) {
  return ((remaining - 1u) != 0u) ? 1 : 0;
}

/* X2 reorder value word (PE 0x009c9dc2 movzx edi,ax ; store 0x009c9df0):
   entry & 0xffff — the u16 value word (0x10000 -> 0). */
extern "C" uint32_t isaac_game_state_9c9340_reorder_value_word(
    uint32_t entry) {
  return entry & 0xffffu;
}

/* Y1 7-lane lane base offset (PE 0x009caa97 add eax,0x1ead0 /
   0x009cac1c add esi,0x320): 0x1ead0 + lane*0x320 u32 wrap. */
extern "C" uint32_t isaac_game_state_9c9340_lane7_lane_base(
    uint32_t lane) {
  return ISAAC_GAME_STATE_9C9340_LANE7_BASE_OFF +
         lane * ISAAC_GAME_STATE_9C9340_LANE7_STRIDE;
}

/* Y2 loop-1 value ptr (PE 0x009cab43 lea edx,[esi-0x31c] / 0x009cab49
   imul eax,ecx,0xb8 / 0x009cab50 add eax,edx; idx movsx 0x009cab40):
   lane_base + (int32)(int8)(i & 0xff)*0xb8 - 0x31c u32 wrap. */
extern "C" uint32_t isaac_game_state_9c9340_lane7_value1_ptr(
    uint32_t lane_base, uint32_t i) {
  const int32_t si = (int32_t)(int8_t)(i & 0xffu); /* movsx ecx,al */
  return lane_base + (uint32_t)(si * 0xb8) - 0x31cu;
}

/* Y3 loop-1 holder ptr (PE 0x009cab53/0x009cab56/0x009cab59 lea chain,
   edx = lane_base - 0x31c): lane_base + (int32)(int8)(i & 0xff)*0xc
   - 0x1ac u32 wrap ((3i+0x5c)*4 + lane - 0x31c == lane + 12i - 0x1ac). */
extern "C" uint32_t isaac_game_state_9c9340_lane7_holder1_ptr(
    uint32_t lane_base, uint32_t i) {
  const int32_t si = (int32_t)(int8_t)(i & 0xffu); /* movsx ecx,al */
  return lane_base + (uint32_t)(si * 0xc) - 0x1acu;
}

/* Y4 loop-2 value ptr (PE 0x009cabc4 imul / 0x009cabce add 0xfffffe6c /
   0x009cabd3 add esi; idx movsx 0x009cabc1): lane_base +
   (int32)(int8)(i & 0xff)*0xb8 - 0x194 u32 wrap. */
extern "C" uint32_t isaac_game_state_9c9340_lane7_value2_ptr(
    uint32_t lane_base, uint32_t i) {
  const int32_t si = (int32_t)(int8_t)(i & 0xffu); /* movsx ecx,al */
  return lane_base + (uint32_t)(si * 0xb8) - 0x194u;
}

/* Y5 loop-2 holder ptr (PE 0x009cabca add ecx,-3 / 0x009cabd6 /
   0x009cabd9 lea chain): lane_base + (int32)(int8)(i & 0xff)*0xc
   - 0x24 u32 wrap (12*(i-3) + lane == lane + 12i - 0x24). */
extern "C" uint32_t isaac_game_state_9c9340_lane7_holder2_ptr(
    uint32_t lane_base, uint32_t i) {
  const int32_t si = (int32_t)(int8_t)(i & 0xffu); /* movsx ecx,al */
  return lane_base + (uint32_t)(si * 0xc) - 0x24u;
}

/* --- ABI v6 accessors: reader row 0x9cb020 + fixed-count loops --- */
extern "C" uint32_t isaac_game_state_9cb020_end_va(void) { return ISAAC_GAME_STATE_9CB020_END_VA; }
extern "C" uint32_t isaac_game_state_9cb020_body_bytes(void) { return ISAAC_GAME_STATE_9CB020_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cb020_next_va(void) { return ISAAC_GAME_STATE_9CB020_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cb020_format_off(void) { return ISAAC_GAME_STATE_9CB020_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9cb020_vtbl14_slot(void) { return ISAAC_GAME_STATE_9CB020_VTBL14_SLOT; }
extern "C" uint32_t isaac_game_state_9cb020_row_writer_va(void) { return ISAAC_GAME_STATE_9CB020_ROW_WRITER_VA; }
extern "C" uint32_t isaac_game_state_9cb020_recurse_call_va(void) { return ISAAC_GAME_STATE_9CB020_RECURSE_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cb020_sub64_ctor_va(void) { return ISAAC_GAME_STATE_9CB020_SUB64_CTOR_VA; }
extern "C" uint32_t isaac_game_state_9cb020_sub6c_ctor_va(void) { return ISAAC_GAME_STATE_9CB020_SUB6C_CTOR_VA; }
extern "C" uint32_t isaac_game_state_9cb020_flags_off(void) { return ISAAC_GAME_STATE_9CB020_FLAGS_OFF; }
extern "C" uint32_t isaac_game_state_9cb020_sub64_off(void) { return ISAAC_GAME_STATE_9CB020_SUB64_OFF; }
extern "C" uint32_t isaac_game_state_9cb020_sub6c_off(void) { return ISAAC_GAME_STATE_9CB020_SUB6C_OFF; }
extern "C" uint32_t isaac_game_state_9cb020_sub64_alloc(void) { return ISAAC_GAME_STATE_9CB020_SUB64_ALLOC; }
extern "C" uint32_t isaac_game_state_9cb020_sub6c_alloc(void) { return ISAAC_GAME_STATE_9CB020_SUB6C_ALLOC; }
extern "C" uint32_t isaac_game_state_9cb020_sub64_bytes(void) { return ISAAC_GAME_STATE_9CB020_SUB64_BYTES; }
extern "C" uint32_t isaac_game_state_9cb020_old_compat_type(void) { return ISAAC_GAME_STATE_9CB020_OLD_COMPAT_TYPE; }
extern "C" uint32_t isaac_game_state_9cb020_alloc_iat(void) { return ISAAC_GAME_STATE_9CB020_ALLOC_IAT; }
extern "C" uint32_t isaac_game_state_9cb020_fail_alloc_va(void) { return ISAAC_GAME_STATE_9CB020_FAIL_ALLOC_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x3b_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X3B_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x46_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X46_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x47_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X47_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x5b_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X5B_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x67_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X67_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x6c_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X6C_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x88_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X88_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x96_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X96_VA; }
extern "C" uint32_t isaac_game_state_9cb020_gate_0x9e_va(void) { return ISAAC_GAME_STATE_9CB020_GATE_0X9E_VA; }
extern "C" uint32_t isaac_game_state_9cb020_old_u64_gate_va(void) { return ISAAC_GAME_STATE_9CB020_OLD_U64_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb020_bit0_gate_va(void) { return ISAAC_GAME_STATE_9CB020_BIT0_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb020_bit1_gate_va(void) { return ISAAC_GAME_STATE_9CB020_BIT1_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb020_byte_to_bool_va(void) { return ISAAC_GAME_STATE_9CB020_BYTE_TO_BOOL_VA; }
extern "C" uint32_t isaac_game_state_9cb020_type4_gate_va(void) { return ISAAC_GAME_STATE_9CB020_TYPE4_GATE_VA; }
extern "C" uint32_t isaac_game_state_9c9c30_fixed_count_va(void) { return ISAAC_GAME_STATE_9C9C30_COUNT_STORE_VA; }
extern "C" uint32_t isaac_game_state_9c9c30_loop_head_va(void) { return ISAAC_GAME_STATE_9C9C30_LOOP_HEAD_VA; }
extern "C" uint32_t isaac_game_state_9c9c30_more_va(void) { return ISAAC_GAME_STATE_9C9C30_MORE_VA; }
extern "C" uint32_t isaac_game_state_9c9c30_base_off(void) { return ISAAC_GAME_STATE_9C9C30_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9c9c30_stride(void) { return ISAAC_GAME_STATE_9C9C30_STRIDE; }
extern "C" uint32_t isaac_game_state_9c9d66_fixed_count_va(void) { return ISAAC_GAME_STATE_9C9D66_COUNT_STORE_VA; }
extern "C" uint32_t isaac_game_state_9c9d66_loop_head_va(void) { return ISAAC_GAME_STATE_9C9D66_LOOP_HEAD_VA; }
extern "C" uint32_t isaac_game_state_9c9d66_more_va(void) { return ISAAC_GAME_STATE_9C9D66_MORE_VA; }
extern "C" uint32_t isaac_game_state_9c9d66_value_base_off(void) { return ISAAC_GAME_STATE_9C9D66_VALUE_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9c9d66_holder_base_off(void) { return ISAAC_GAME_STATE_9C9D66_HOLDER_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9c9d66_value_stride(void) { return ISAAC_GAME_STATE_9C9D66_VALUE_STRIDE; }
extern "C" uint32_t isaac_game_state_9c9d66_holder_stride(void) { return ISAAC_GAME_STATE_9C9D66_HOLDER_STRIDE; }

/* --- ABI v7 accessors: reorder-table + 7-lane per-lane laws --- */
extern "C" uint32_t isaac_game_state_9c9340_reorder_loop_more_va(void) { return ISAAC_GAME_STATE_9C9340_REORDER_LOOP_MORE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_loop_more_va_2(void) { return ISAAC_GAME_STATE_9C9340_REORDER_LOOP_MORE_JNE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_value_word_va(void) { return ISAAC_GAME_STATE_9C9340_REORDER_VALUE_WORD_VA; }
extern "C" uint32_t isaac_game_state_9c9340_reorder_value_word_va_2(void) { return ISAAC_GAME_STATE_9C9340_REORDER_VALUE_STORE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_lane_base_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_LANE_BASE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_lane_base_va_2(void) { return ISAAC_GAME_STATE_9C9340_LANE7_STRIDE_ADD_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem1_value_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_VALUE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem1_holder_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_HOLDER_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem2_value_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_VALUE_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem2_holder_va(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_HOLDER_VA; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem1_value_off(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_VALUE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem1_holder_off(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_HOLDER_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem2_value_off(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_VALUE_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_elem2_holder_off(void) { return ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_HOLDER_OFF; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_byte_off_1(void) { return ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_1; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_byte_off_2(void) { return ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_2; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_byte_off_3(void) { return ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_3; }
extern "C" uint32_t isaac_game_state_9c9340_lane7_byte_off_4(void) { return ISAAC_GAME_STATE_9C9340_LANE7_BYTE_OFF_4; }

/* --- ABI v8: pill reader 0x9cb620..0x9cc18d laws V1..V20 (typed-host
 *     lease; census game-state-v8-body/NOTES.md). --- */

/* V1 io-ready gate (PE 0x9cb65d + twins 0x9cbe30/0x9cbec0/0x9cbf70):
   test al,al ; jne FAIL.  LOW-BYTE: continue iff AL byte == 0. */
extern "C" int32_t isaac_game_state_9cb620_io_ready(uint32_t open_al) {
  return (open_al & 0xffu) == 0u ? 1 : 0;
}

/* V2..V5 io+8 format gates: cmp [esi+8],N ; jb.  FULL-dword UNSIGNED
   format >= N (same io+8 counter as the reader row R1..R10). */
extern "C" int32_t isaac_game_state_9cb620_io_gate_0x3d(uint32_t format) {
  return (format >= 0x3du) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_io_gate_0x4b(uint32_t format) {
  return (format >= 0x4bu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_io_gate_0x7b(uint32_t format) {
  return (format >= 0x7bu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_io_gate_0x7d(uint32_t format) {
  return (format >= 0x7du) ? 1 : 0;
}

/* V6..V9 GameState+0x1fdf0 format gates: cmp [eax+0x1fdf0],N ; jb.
   FULL-dword UNSIGNED format >= N on the gs counter. */
extern "C" int32_t isaac_game_state_9cb620_gs_gate_0x21(uint32_t format) {
  return (format >= 0x21u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_gs_gate_0x3f(uint32_t format) {
  return (format >= 0x3fu) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_gs_gate_0x49(uint32_t format) {
  return (format >= 0x49u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_gs_gate_0x82(uint32_t format) {
  return (format >= 0x82u) ? 1 : 0;
}

/* V10 slot count gate (PE 0x9cbbb1 test eax,eax ; je rel32):
   FULL-dword count != 0. */
extern "C" int32_t isaac_game_state_9cb620_slot_count_needed(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* V11 string-copy ptr gate (PE 0x9cbb3a test eax,eax ; je +0x22):
   FULL-dword ptr != 0. */
extern "C" int32_t isaac_game_state_9cb620_string_copy_needed(
    uint32_t ptr_60) {
  return (ptr_60 != 0u) ? 1 : 0;
}

/* V12 slot bool store (PE 0x9cbc57 cmp [ecx+0xc],0 ; setg al ; mov
   [ecx+0x18],al): SIGNED (int64)(int32)count > 0 — 0x80000000.. are
   NEGATIVE (wasm32 compare-flip class, i64 sign-extend form). */
extern "C" int32_t isaac_game_state_9cb620_slot_positive(uint32_t count) {
  return ((int64_t)(int32_t)count > 0) ? 1 : 0;
}

/* V13 slot-table loop bound (PE 0x9cbdc0 cmp ecx,0x3800 ; jb): UNSIGNED
   byte_off < 0x3800 (448 slots x 0x20). */
extern "C" int32_t isaac_game_state_9cb620_slot_more(uint32_t byte_off) {
  return (byte_off < ISAAC_GAME_STATE_9CB620_TABLE_BYTES) ? 1 : 0;
}

/* V14/V16 sub-array count gates (PE 0x9cbe08/0x9cbf43 cmp,0 ; jbe):
   FULL-dword count != 0.  V15/V17 sub-array bounds (PE 0x9cbe50/
   0x9cbf93 cmp,1 ; jb): UNSIGNED idx < count (stride 0x78; reader row
   0x9cb020 per element). */
extern "C" int32_t isaac_game_state_9cb620_array74_needed(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_array74_more(uint32_t idx,
                                                        uint32_t count) {
  return (idx < count) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_array88_needed(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9cb620_array88_more(uint32_t idx,
                                                        uint32_t count) {
  return (idx < count) ? 1 : 0;
}

/* V18 fixed-8 count (PE 0x9cc11b mov [ebp+0x10],8): constant 8. */
extern "C" uint32_t isaac_game_state_9cb620_fixed8_count(void) {
  return ISAAC_GAME_STATE_9CB620_FIXED8_COUNT;
}

/* V19 fixed-8 bound (PE 0x9cc145 sub,1 ; jne 0x9cc122): ((remaining -
   1) != 0) u32 — the countdown 8..1 (W16 lane7 / T2 / X1 class). */
extern "C" int32_t isaac_game_state_9cb620_fixed8_more(uint32_t remaining) {
  return (remaining - 1u) != 0u ? 1 : 0;
}

/* V20 flag-byte gate (PE 0x9cb93b + 5 or-bit twins): LOW-BYTE
   ((byte & 0xff) != 0) — gates each of the 6 flag-bit ORs into the
   +0x44 flags dword (0x100 -> byte 0 -> bit stays clear). */
extern "C" int32_t isaac_game_state_9cb620_flag_byte_set(uint32_t byte) {
  return (byte & 0xffu) != 0u ? 1 : 0;
}

/* --- ABI v8 accessors: pill reader 0x9cb620 --- */
extern "C" uint32_t isaac_game_state_9cb620_va(void) { return ISAAC_GAME_STATE_9CB620_VA; }
extern "C" uint32_t isaac_game_state_9cb620_end_va(void) { return ISAAC_GAME_STATE_9CB620_END_VA; }
extern "C" uint32_t isaac_game_state_9cb620_body_bytes(void) { return ISAAC_GAME_STATE_9CB620_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cb620_next_va(void) { return ISAAC_GAME_STATE_9CB620_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cb620_seh_handler_dat(void) { return ISAAC_GAME_STATE_9CB620_SEH_HANDLER_DAT; }
extern "C" uint32_t isaac_game_state_9cb620_io_format_off(void) { return ISAAC_GAME_STATE_9CB620_IO_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9cb620_gs_format_off(void) { return ISAAC_GAME_STATE_9CB620_GS_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9cb620_io_vtbl10_slot(void) { return ISAAC_GAME_STATE_9CB620_IO_VTBL10_SLOT; }
extern "C" uint32_t isaac_game_state_9cb620_vtbl14_slot(void) { return ISAAC_GAME_STATE_9CB620_VTBL14_SLOT; }
extern "C" uint32_t isaac_game_state_9cb620_row_writer_va(void) { return ISAAC_GAME_STATE_9CB620_ROW_WRITER_VA; }
extern "C" uint32_t isaac_game_state_9cb620_serializer_row_call_va(void) { return ISAAC_GAME_STATE_9CB620_SERIALIZER_ROW_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cb620_reader_row_call_74_va(void) { return ISAAC_GAME_STATE_9CB620_READER_ROW_CALL_74_VA; }
extern "C" uint32_t isaac_game_state_9cb620_reader_row_call_88_va(void) { return ISAAC_GAME_STATE_9CB620_READER_ROW_CALL_88_VA; }
extern "C" uint32_t isaac_game_state_9cb620_vector_ctor_va(void) { return ISAAC_GAME_STATE_9CB620_VECTOR_CTOR_VA; }
extern "C" uint32_t isaac_game_state_9cb620_vector_init_va(void) { return ISAAC_GAME_STATE_9CB620_VECTOR_INIT_VA; }
extern "C" uint32_t isaac_game_state_9cb620_list_insert_va(void) { return ISAAC_GAME_STATE_9CB620_LIST_INSERT_VA; }
extern "C" uint32_t isaac_game_state_9cb620_string_copy_va(void) { return ISAAC_GAME_STATE_9CB620_STRING_COPY_VA; }
extern "C" uint32_t isaac_game_state_9cb620_string_empty_dat(void) { return ISAAC_GAME_STATE_9CB620_STRING_EMPTY_DAT; }
extern "C" uint32_t isaac_game_state_9cb620_flags_off(void) { return ISAAC_GAME_STATE_9CB620_FLAGS_OFF; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit_0(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT_0; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit_1(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT_1; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit_2(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT_2; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit_3(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT_3; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit_4(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT_4; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit_5(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT_5; }
extern "C" uint32_t isaac_game_state_9cb620_table_off(void) { return ISAAC_GAME_STATE_9CB620_TABLE_OFF; }
extern "C" uint32_t isaac_game_state_9cb620_table_bytes(void) { return ISAAC_GAME_STATE_9CB620_TABLE_BYTES; }
extern "C" uint32_t isaac_game_state_9cb620_table_stride(void) { return ISAAC_GAME_STATE_9CB620_TABLE_STRIDE; }
extern "C" uint32_t isaac_game_state_9cb620_table_slots(void) { return ISAAC_GAME_STATE_9CB620_TABLE_SLOTS; }
extern "C" uint32_t isaac_game_state_9cb620_array74_off(void) { return ISAAC_GAME_STATE_9CB620_ARRAY74_OFF; }
extern "C" uint32_t isaac_game_state_9cb620_array88_off(void) { return ISAAC_GAME_STATE_9CB620_ARRAY88_OFF; }
extern "C" uint32_t isaac_game_state_9cb620_array_stride(void) { return ISAAC_GAME_STATE_9CB620_ARRAY_STRIDE; }
extern "C" uint32_t isaac_game_state_9cb620_fixed8_count_va(void) { return ISAAC_GAME_STATE_9CB620_FIXED8_COUNT_STORE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_fixed8_more_va(void) { return ISAAC_GAME_STATE_9CB620_FIXED8_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_ready_gate_va(void) { return ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_ready_gate_va_2(void) { return ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA_2; }
extern "C" uint32_t isaac_game_state_9cb620_io_ready_gate_va_3(void) { return ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA_3; }
extern "C" uint32_t isaac_game_state_9cb620_io_ready_gate_va_4(void) { return ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA_4; }
extern "C" uint32_t isaac_game_state_9cb620_io_gate_0x3d_va(void) { return ISAAC_GAME_STATE_9CB620_IO_GATE_0X3D_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_gate_0x4b_va(void) { return ISAAC_GAME_STATE_9CB620_IO_GATE_0X4B_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_gate_0x7b_va(void) { return ISAAC_GAME_STATE_9CB620_IO_GATE_0X7B_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_gate_0x7b_jne_va(void) { return ISAAC_GAME_STATE_9CB620_IO_GATE_0X7B_JNE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_gate_0x7d_va(void) { return ISAAC_GAME_STATE_9CB620_IO_GATE_0X7D_VA; }
extern "C" uint32_t isaac_game_state_9cb620_io_gate_0x7d_jne_va(void) { return ISAAC_GAME_STATE_9CB620_IO_GATE_0X7D_JNE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_gs_gate_0x21_va(void) { return ISAAC_GAME_STATE_9CB620_GS_GATE_0X21_VA; }
extern "C" uint32_t isaac_game_state_9cb620_gs_gate_0x3f_va(void) { return ISAAC_GAME_STATE_9CB620_GS_GATE_0X3F_VA; }
extern "C" uint32_t isaac_game_state_9cb620_gs_gate_0x3f_jne_va(void) { return ISAAC_GAME_STATE_9CB620_GS_GATE_0X3F_JNE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_gs_gate_0x49_va(void) { return ISAAC_GAME_STATE_9CB620_GS_GATE_0X49_VA; }
extern "C" uint32_t isaac_game_state_9cb620_gs_gate_0x49_jne_va(void) { return ISAAC_GAME_STATE_9CB620_GS_GATE_0X49_JNE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_gs_gate_0x82_va(void) { return ISAAC_GAME_STATE_9CB620_GS_GATE_0X82_VA; }
extern "C" uint32_t isaac_game_state_9cb620_slot_count_gate_va(void) { return ISAAC_GAME_STATE_9CB620_SLOT_COUNT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_string_copy_gate_va(void) { return ISAAC_GAME_STATE_9CB620_STRING_COPY_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_slot_positive_va(void) { return ISAAC_GAME_STATE_9CB620_SLOT_POSITIVE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_slot_more_va(void) { return ISAAC_GAME_STATE_9CB620_SLOT_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_array74_needed_va(void) { return ISAAC_GAME_STATE_9CB620_ARRAY74_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9cb620_array74_more_va(void) { return ISAAC_GAME_STATE_9CB620_ARRAY74_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_array88_needed_va(void) { return ISAAC_GAME_STATE_9CB620_ARRAY88_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9cb620_array88_more_va(void) { return ISAAC_GAME_STATE_9CB620_ARRAY88_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_flag_gate_va(void) { return ISAAC_GAME_STATE_9CB620_FLAG_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit1_or_va(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT1_OR_VA; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit2_or_va(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT2_OR_VA; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit3_or_va(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT3_OR_VA; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit4_or_va(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT4_OR_VA; }
extern "C" uint32_t isaac_game_state_9cb620_flag_bit5_or_va(void) { return ISAAC_GAME_STATE_9CB620_FLAG_BIT5_OR_VA; }
extern "C" uint32_t isaac_game_state_9cb620_caller_count(void) { return ISAAC_GAME_STATE_9CB620_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9cb620_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CB620_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9CB620_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9CB620_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9CB620_CALLER_VA_3;
    default: return 0u;
  }
}

/* --- ABI v9: giant read entry 0x9cc1a0..0x9ce596 laws (typed-host lease;
 *     census game-state-v9-giant/NOTES.md). --- */

/* F — gs format gate >= 0x2b (PE 0x009cc761 cmp,0x2b ; jb/jae):
   FULL-dword UNSIGNED format >= 0x2b on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x2b(uint32_t format) {
  return (format >= 0x2bu) ? 1 : 0;
}

/* F — gs format gate >= 0x2e (PE 0x009cc7a0 cmp,0x2e ; jb/jae):
   FULL-dword UNSIGNED format >= 0x2e on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x2e(uint32_t format) {
  return (format >= 0x2eu) ? 1 : 0;
}

/* F — gs format gate >= 0x2f (PE 0x009cdd29 cmp,0x2f ; jb/jae):
   FULL-dword UNSIGNED format >= 0x2f on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x2f(uint32_t format) {
  return (format >= 0x2fu) ? 1 : 0;
}

/* F — gs format gate >= 0x30 (PE 0x009cde80 cmp,0x30 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x30 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x30(uint32_t format) {
  return (format >= 0x30u) ? 1 : 0;
}

/* F — gs format gate >= 0x33 (PE 0x009cc35a cmp,0x33 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x33 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x33(uint32_t format) {
  return (format >= 0x33u) ? 1 : 0;
}

/* F — gs format gate >= 0x34 (PE 0x009cc4fa cmp,0x34 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x34 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x34(uint32_t format) {
  return (format >= 0x34u) ? 1 : 0;
}

/* F — gs format gate >= 0x40 (PE 0x009cc479 cmp,0x40 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x40 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x40(uint32_t format) {
  return (format >= 0x40u) ? 1 : 0;
}

/* F — gs format gate >= 0x42 (PE 0x009cdedb cmp,0x42 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x42 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x42(uint32_t format) {
  return (format >= 0x42u) ? 1 : 0;
}

/* F — gs format gate >= 0x43 (PE 0x009cc510 cmp,0x43 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x43 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x43(uint32_t format) {
  return (format >= 0x43u) ? 1 : 0;
}

/* F — gs format gate >= 0x44 (PE 0x009cd6ff cmp,0x44 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x44 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x44(uint32_t format) {
  return (format >= 0x44u) ? 1 : 0;
}

/* F — gs format gate >= 0x47 (PE 0x009cd4a3 cmp,0x47 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x47 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x47(uint32_t format) {
  return (format >= 0x47u) ? 1 : 0;
}

/* F — gs format gate >= 0x48 (PE 0x009cd5fb cmp,0x48 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x48 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x48(uint32_t format) {
  return (format >= 0x48u) ? 1 : 0;
}

/* F — gs format gate >= 0x50 (PE 0x009cdfc9 cmp,0x50 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x50 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x50(uint32_t format) {
  return (format >= 0x50u) ? 1 : 0;
}

/* F — gs format gate >= 0x53 (PE 0x009ce18c cmp,0x53 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x53 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x53(uint32_t format) {
  return (format >= 0x53u) ? 1 : 0;
}

/* F — gs format gate >= 0x54 (PE 0x009cdae3 cmp,0x54 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x54 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x54(uint32_t format) {
  return (format >= 0x54u) ? 1 : 0;
}

/* F — gs format gate >= 0x57 (PE 0x009cc444 cmp,0x57 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x57 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x57(uint32_t format) {
  return (format >= 0x57u) ? 1 : 0;
}

/* F — gs format gate >= 0x59 (PE 0x009ce00e cmp,0x59 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x59 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x59(uint32_t format) {
  return (format >= 0x59u) ? 1 : 0;
}

/* F — gs format gate >= 0x85 (PE 0x009ce437 cmp,0x85 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x85 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x85(uint32_t format) {
  return (format >= 0x85u) ? 1 : 0;
}

/* F — gs format gate >= 0x86 (PE 0x009cd355 cmp,0x86 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x86 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x86(uint32_t format) {
  return (format >= 0x86u) ? 1 : 0;
}

/* F — gs format gate >= 0x87 (PE 0x009cd582 cmp,0x87 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x87 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x87(uint32_t format) {
  return (format >= 0x87u) ? 1 : 0;
}

/* F — gs format gate >= 0x89 (PE 0x009ce2b6 cmp,0x89 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x89 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x89(uint32_t format) {
  return (format >= 0x89u) ? 1 : 0;
}

/* F — gs format gate >= 0x8a (PE 0x009ce47f cmp,0x8a ; jb/jae):
   FULL-dword UNSIGNED format >= 0x8a on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x8a(uint32_t format) {
  return (format >= 0x8au) ? 1 : 0;
}

/* F — gs format gate >= 0x8d (PE 0x009cd71c cmp,0x8d ; jb/jae):
   FULL-dword UNSIGNED format >= 0x8d on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x8d(uint32_t format) {
  return (format >= 0x8du) ? 1 : 0;
}

/* F — gs format gate >= 0x93 (PE 0x009cc4a9 cmp,0x93 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x93 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x93(uint32_t format) {
  return (format >= 0x93u) ? 1 : 0;
}

/* F — gs format gate >= 0x95 (PE 0x009ce4e1 cmp,0x95 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x95 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x95(uint32_t format) {
  return (format >= 0x95u) ? 1 : 0;
}

/* F — gs format gate >= 0x98 (PE 0x009ce49a cmp,0x98 ; jb/jae):
   FULL-dword UNSIGNED format >= 0x98 on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x98(uint32_t format) {
  return (format >= 0x98u) ? 1 : 0;
}

/* F — gs format gate >= 0x9b (PE 0x009cc4c1 cmp,0x9b ; jb/jae):
   FULL-dword UNSIGNED format >= 0x9b on GameState+0x1fdf0. */
extern "C" int32_t isaac_game_state_9cc1a0_gs_gate_0x9b(uint32_t format) {
  return (format >= 0x9bu) ? 1 : 0;
}

/* I — io+8 format gate >= 0x56 (PE 0x009cccb7 cmp,0x56 ; jb):
   FULL-dword UNSIGNED format >= 0x56 on io+8 (SAME counter as V2..V5). */
extern "C" int32_t isaac_game_state_9cc1a0_io_gate_0x56(uint32_t format) {
  return (format >= 0x56u) ? 1 : 0;
}

/* I — io+8 format gate >= 0x7c (PE 0x009cd1d9 cmp,0x7c ; jb):
   FULL-dword UNSIGNED format >= 0x7c on io+8 (SAME counter as V2..V5). */
extern "C" int32_t isaac_game_state_9cc1a0_io_gate_0x7c(uint32_t format) {
  return (format >= 0x7cu) ? 1 : 0;
}

/* I — io+8 format gate >= 0xa5 (PE 0x009cd246 cmp,0xa5 ; jb):
   FULL-dword UNSIGNED format >= 0xa5 on io+8 (SAME counter as V2..V5). */
extern "C" int32_t isaac_game_state_9cc1a0_io_gate_0xa5(uint32_t format) {
  return (format >= 0xa5u) ? 1 : 0;
}

/* D1 — io+8 -> variant-count dispatch (PE 0x9cce5d..0x9ccf06 cmp chain
   jae skip-assign; sbb/neg/add tail): UNSIGNED band map io8 in
   [0,0x56)->0x89, [0x56,0x6b)->0x8f, [0x6b,0x6d)->0x90,
   [0x6d,0x76)->0x91, [0x76,0x7b)->0x92, [0x7b,0x84)->0x164,
   [0x84,0x94)->0x20d, [0x94,0x9a)->0x20e, [0x9a,~)->0x20f. */
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch_count(uint32_t io8) {
  if (io8 < 0x56u) return 0x89u;
  if (io8 < 0x6bu) return 0x8fu;
  if (io8 < 0x6du) return 0x90u;
  if (io8 < 0x76u) return 0x91u;
  if (io8 < 0x7bu) return 0x92u;
  if (io8 < 0x84u) return 0x164u;
  if (io8 < 0x94u) return 0x20du;
  if (io8 < 0x9au) return 0x20eu;
  return 0x20fu;
}

/* D2 — second read-pill pass gate (PE 0x9ccfc3 cmp,0x1fb ; jbe skip):
   UNSIGNED disp_count > 0x1fb. */
extern "C" int32_t isaac_game_state_9cc1a0_dispatch_second_pass_needed(
    uint32_t disp_count) {
  return (disp_count > ISAAC_GAME_STATE_9CC1A0_LANE19C_BOUND) ? 1 : 0;
}

/* C1 — +0x164 lane-block u32 loop count (PE 0x9ccc64 cmp 0x50,[io+8] ;
   sbb/neg/add 0xd): io8 > 0x50 ? 14 : 13. */
extern "C" uint32_t isaac_game_state_9cc1a0_t164_count(uint32_t io8) {
  return (io8 > 0x50u) ? 14u : 13u;
}

/* B1 — +0x19c array size gate (PE 0x9ccf1e cmp ecx,0x1fb ; jb):
   UNSIGNED count < 0x1fb (else fail log). */
extern "C" int32_t isaac_game_state_9cc1a0_count_1fb_below(uint32_t count) {
  return (count < ISAAC_GAME_STATE_9CC1A0_LANE19C_BOUND) ? 1 : 0;
}

/* B2 — word-decode table loop bound (PE 0x9cd158 cmp esi,0x19d1c ; jb):
   UNSIGNED off < 0x19d1c (507 entries, stride 4). */
extern "C" int32_t isaac_game_state_9cc1a0_table_19d1c_more(uint32_t off) {
  return (off < ISAAC_GAME_STATE_9CC1A0_TABLE19D1C_END) ? 1 : 0;
}

/* B3 — +0x1e778 byte-array loop bound (PE 0x9cdbe0/0x9cdc31 cmp,0x50 ;
   jae exit): UNSIGNED idx < 0x50 (80). */
extern "C" int32_t isaac_game_state_9cc1a0_byte_0x50_more(uint32_t idx) {
  return (idx < ISAAC_GAME_STATE_9CC1A0_BYTE80_BOUND) ? 1 : 0;
}

/* B4 — gs<0x54 0x4d-byte arm loop bound (PE 0x9cdb63 cmp,0x4d ; jb):
   UNSIGNED idx < 0x4d (77). */
extern "C" int32_t isaac_game_state_9cc1a0_byte_0x4d_more(uint32_t idx) {
  return (idx < ISAAC_GAME_STATE_9CC1A0_BYTE4D_BOUND) ? 1 : 0;
}

/* B5 — +0x1e680 word-store cutoff (PE 0x9cdf86 cmp dx,0x25 ; jae):
   WORD (idx & 0xffff) < 0x25 (37). */
extern "C" int32_t isaac_game_state_9cc1a0_word_0x25_more(uint32_t idx) {
  return ((idx & 0xffffu) < ISAAC_GAME_STATE_9CC1A0_WORD25_BOUND) ? 1 : 0;
}

/* B6 — u16-count loop bound (PE 0x9cdf42/0x9cdfab cmp,word ; jae/jb):
   WORD (idx & 0xffff) < (count & 0xffff). */
extern "C" int32_t isaac_game_state_9cc1a0_word_more(uint32_t idx,
                                                     uint32_t count) {
  return ((idx & 0xffffu) < (count & 0xffffu)) ? 1 : 0;
}

/* B7 — 8-bit mask loop bound (PE 0x9cdc62 cmp ecx,8 ; jl): SIGNED
   (int64)(int32)idx < 8. */
extern "C" int32_t isaac_game_state_9cc1a0_count8_more(uint32_t idx) {
  return ((int64_t)(int32_t)idx < 8) ? 1 : 0;
}

/* S1 — movsx byte count gate (PE 0x9cd772/0x9cd830/0x9ce30f/0x9ce3a9
   test ; jle skip): (int64)(int32)(int8)(count & 0xff) > 0 —
   0x80..0xff negative -> skip (wasm32 compare-flip class). */
extern "C" int32_t isaac_game_state_9cc1a0_signed_byte_count_positive(
    uint32_t count) {
  return ((int64_t)(int32_t)(int8_t)(count & 0xffu) > 0) ? 1 : 0;
}

/* S2 — SIGNED loop bound vs movsx8 count (PE 0x9cd86e/0x9cda01 cmp ; jl):
   (int64)(int32)idx < (int64)(int32)(int8)(count & 0xff). */
extern "C" int32_t isaac_game_state_9cc1a0_signed_idx_lt_movsx8(
    uint32_t idx, uint32_t count) {
  return ((int64_t)(int32_t)idx <
          (int64_t)(int32_t)(int8_t)(count & 0xffu)) ? 1 : 0;
}

/* S3 — SIGNED loop bound vs u32 count (PE 0x9cdec9/0x9ce170 cmp ; jl):
   (int64)(int32)idx < (int64)(int32)count. */
extern "C" int32_t isaac_game_state_9cc1a0_signed_idx_lt_count(
    uint32_t idx, uint32_t count) {
  return ((int64_t)(int32_t)idx < (int64_t)(int32_t)count) ? 1 : 0;
}

/* S4 — 7-lane byte loop bound (PE 0x9ce358/0x9ce3e7 cmp al,byte ; jl):
   (int64)(int8)(idx & 0xff) < (int64)(int8)(count & 0xff). */
extern "C" int32_t isaac_game_state_9cc1a0_signed_byte_lt(uint32_t idx,
                                                          uint32_t count) {
  return ((int64_t)(int8_t)(idx & 0xffu) <
          (int64_t)(int8_t)(count & 0xffu)) ? 1 : 0;
}

/* L1 — byte == 0 gate (PE 0x9cc301 cmp byte [ebx+0xc],0 ; je;
   twin 0x9ce54d cmp byte,0 ; jne fail): LOW-BYTE
   ((byte & 0xff) == 0) ? 1 : 0 (0x100 -> byte 0 -> passes). */
extern "C" int32_t isaac_game_state_9cc1a0_byte_zero_ok(uint32_t byte) {
  return (byte & 0xffu) == 0u ? 1 : 0;
}

/* L2 — tail io-ready gate (PE 0x9ce55f test al,al ; je fail): LOW-BYTE
   ((al & 0xff) != 0) ? 1 : 0 — second vtbl+0x10 ready call (success). */
extern "C" int32_t isaac_game_state_9cc1a0_tail_ready_ok(uint32_t al) {
  return (al & 0xffu) != 0u ? 1 : 0;
}

/* K1 — streamed-checksum pass (PE 0x9cc313 cmp eax,ecx ; jne fail-arm;
   0x9cc31c cmp ecx,[mgr+0xf98] ; je ok): FULL-dword
   (streamed == expected) || (expected == mgr_f98) — streamed is the io
   read ^ 0x96696996. */
extern "C" int32_t isaac_game_state_9cc1a0_checksum_pass(
    uint32_t streamed, uint32_t expected, uint32_t mgr_f98) {
  return (streamed == expected || expected == mgr_f98) ? 1 : 0;
}

/* K2 — final checksum match (PE 0x9ce545 cmp eax,[edi+0x1fda4] ; jne):
   FULL-dword streamed == expected. */
extern "C" int32_t isaac_game_state_9cc1a0_checksum_matches(
    uint32_t streamed, uint32_t expected) {
  return (streamed == expected) ? 1 : 0;
}

/* M1 — u16 clamp >= 0x35 (PE 0x9cc3e7 cmp cx,word ; 0x9cc3f6 cmovae;
   const 0x9cc3dd): (count & 0xffff) >= 0x35 ? (count & 0xffff) : 0x35. */
extern "C" uint32_t isaac_game_state_9cc1a0_clamp_0x35(uint32_t count) {
  const uint32_t w = count & 0xffffu;
  return (w >= ISAAC_GAME_STATE_9CC1A0_CLAMP35_CONST)
             ? w
             : ISAAC_GAME_STATE_9CC1A0_CLAMP35_CONST;
}

/* M2 — u16 clamp >= 0x1a (PE 0x9ccb13 cmp cx,word ; 0x9ccb1c cmovae;
   const 0x9ccb09): (count & 0xffff) >= 0x1a ? (count & 0xffff) : 0x1a. */
extern "C" uint32_t isaac_game_state_9cc1a0_clamp_0x1a(uint32_t count) {
  const uint32_t w = count & 0xffffu;
  return (w >= ISAAC_GAME_STATE_9CC1A0_CLAMP1A_CONST)
             ? w
             : ISAAC_GAME_STATE_9CC1A0_CLAMP1A_CONST;
}

extern "C" uint32_t isaac_game_state_9cc1a0_va(void) { return ISAAC_GAME_STATE_9CC1A0_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_end_va(void) { return ISAAC_GAME_STATE_9CC1A0_END_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_body_bytes(void) { return ISAAC_GAME_STATE_9CC1A0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cc1a0_next_va(void) { return ISAAC_GAME_STATE_9CC1A0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_seh_handler_dat(void) { return ISAAC_GAME_STATE_9CC1A0_SEH_HANDLER_DAT; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_cookie_dat(void) { return ISAAC_GAME_STATE_9CC1A0_GS_COOKIE_DAT; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_format_off(void) { return ISAAC_GAME_STATE_9CC1A0_IO_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_format_off(void) { return ISAAC_GAME_STATE_9CC1A0_GS_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_format_store_va(void) { return ISAAC_GAME_STATE_9CC1A0_IO_FORMAT_STORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_delete_call_va(void) { return ISAAC_GAME_STATE_9CC1A0_DELETE_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_read_pill_call_va_0(void) { return ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_0; }
extern "C" uint32_t isaac_game_state_9cc1a0_read_pill_call_va_1(void) { return ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_1; }
extern "C" uint32_t isaac_game_state_9cc1a0_read_pill_call_va_2(void) { return ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_2; }
extern "C" uint32_t isaac_game_state_9cc1a0_read_pill_call_va_3(void) { return ISAAC_GAME_STATE_9CC1A0_READ_PILL_CALL_VA_3; }
extern "C" uint32_t isaac_game_state_9cc1a0_body_c_call_va(void) { return ISAAC_GAME_STATE_9CC1A0_BODY_C_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_cf000_call_va(void) { return ISAAC_GAME_STATE_9CC1A0_CF000_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_serializer_ctor_call_va(void) { return ISAAC_GAME_STATE_9CC1A0_SERIALIZER_CTOR_CALL_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_checksum_magic(void) { return ISAAC_GAME_STATE_9CC1A0_CHECKSUM_MAGIC; }
extern "C" uint32_t isaac_game_state_9cc1a0_mgr_global_dat(void) { return ISAAC_GAME_STATE_9CC1A0_MGR_GLOBAL_DAT; }
extern "C" uint32_t isaac_game_state_9cc1a0_mgr_f98_off(void) { return ISAAC_GAME_STATE_9CC1A0_MGR_F98_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_lane19c_off(void) { return ISAAC_GAME_STATE_9CC1A0_LANE19C_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_lane19c_bound(void) { return ISAAC_GAME_STATE_9CC1A0_LANE19C_BOUND; }
extern "C" uint32_t isaac_game_state_9cc1a0_holders1_off(void) { return ISAAC_GAME_STATE_9CC1A0_HOLDERS1_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_values1_off(void) { return ISAAC_GAME_STATE_9CC1A0_VALUES1_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_holders2_off(void) { return ISAAC_GAME_STATE_9CC1A0_HOLDERS2_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_values2_off(void) { return ISAAC_GAME_STATE_9CC1A0_VALUES2_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_table19530_off(void) { return ISAAC_GAME_STATE_9CC1A0_TABLE19530_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_table19d1c_end(void) { return ISAAC_GAME_STATE_9CC1A0_TABLE19D1C_END; }
extern "C" uint32_t isaac_game_state_9cc1a0_slot13_base_off(void) { return ISAAC_GAME_STATE_9CC1A0_SLOT13_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9cc1a0_byte80_bound(void) { return ISAAC_GAME_STATE_9CC1A0_BYTE80_BOUND; }
extern "C" uint32_t isaac_game_state_9cc1a0_byte4d_bound(void) { return ISAAC_GAME_STATE_9CC1A0_BYTE4D_BOUND; }
extern "C" uint32_t isaac_game_state_9cc1a0_word25_bound(void) { return ISAAC_GAME_STATE_9CC1A0_WORD25_BOUND; }
extern "C" uint32_t isaac_game_state_9cc1a0_clamp35_const(void) { return ISAAC_GAME_STATE_9CC1A0_CLAMP35_CONST; }
extern "C" uint32_t isaac_game_state_9cc1a0_clamp1a_const(void) { return ISAAC_GAME_STATE_9CC1A0_CLAMP1A_CONST; }
extern "C" uint32_t isaac_game_state_9cc1a0_stride_b8(void) { return ISAAC_GAME_STATE_9CC1A0_STRIDE_B8; }
extern "C" uint32_t isaac_game_state_9cc1a0_stride_c(void) { return ISAAC_GAME_STATE_9CC1A0_STRIDE_C; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x2b_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X2B_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x2e_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X2E_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x2f_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X2F_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x30_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X30_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x33_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X33_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x34_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X34_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x40_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X40_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x42_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X42_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x43_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X43_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x44_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X44_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x47_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X47_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x48_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X48_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x50_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X50_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x53_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X53_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x54_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X54_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x57_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X57_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x59_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X59_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x85_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X85_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x86_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X86_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x87_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X87_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x89_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X89_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x8a_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X8A_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x8d_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X8D_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x93_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X93_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x95_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X95_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x98_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X98_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x9b_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X9B_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_gate_0x56_va(void) { return ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X56_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_gate_0x7c_va(void) { return ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X7C_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_gate_0xa5_va(void) { return ISAAC_GAME_STATE_9CC1A0_IO_GATE_0XA5_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_gs_gate_0x21_va(void) { return ISAAC_GAME_STATE_9CC1A0_GS_GATE_0X21_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_gate_0x7b_va(void) { return ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X7B_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_io_gate_0x7b_va_2(void) { return ISAAC_GAME_STATE_9CC1A0_IO_GATE_0X7B_VA_2; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch0_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH0_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch1_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH1_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch2_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH2_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch3_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH3_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch4_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH4_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch5_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH5_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch6_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH6_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch7_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH7_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_dispatch_second_pass_va(void) { return ISAAC_GAME_STATE_9CC1A0_DISPATCH_SECOND_PASS_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_t164_count_va(void) { return ISAAC_GAME_STATE_9CC1A0_T164_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_count_1fb_gate_va(void) { return ISAAC_GAME_STATE_9CC1A0_COUNT_1FB_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_table_19d1c_more_va(void) { return ISAAC_GAME_STATE_9CC1A0_TABLE_19D1C_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_byte_0x50_more_va(void) { return ISAAC_GAME_STATE_9CC1A0_BYTE_0X50_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_byte_0x4d_more_va(void) { return ISAAC_GAME_STATE_9CC1A0_BYTE_0X4D_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_word_0x25_more_va(void) { return ISAAC_GAME_STATE_9CC1A0_WORD_0X25_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_word_more_va(void) { return ISAAC_GAME_STATE_9CC1A0_WORD_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_count8_more_va(void) { return ISAAC_GAME_STATE_9CC1A0_COUNT8_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_signed_byte_pos_va(void) { return ISAAC_GAME_STATE_9CC1A0_SIGNED_BYTE_POS_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_signed_idx_movsx8_va(void) { return ISAAC_GAME_STATE_9CC1A0_SIGNED_IDX_MOVSX8_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_signed_idx_count_va(void) { return ISAAC_GAME_STATE_9CC1A0_SIGNED_IDX_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_signed_byte_lt_va(void) { return ISAAC_GAME_STATE_9CC1A0_SIGNED_BYTE_LT_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_byte_zero_gate_va(void) { return ISAAC_GAME_STATE_9CC1A0_BYTE_ZERO_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_tail_ready_gate_va(void) { return ISAAC_GAME_STATE_9CC1A0_TAIL_READY_GATE_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_checksum_pass_va(void) { return ISAAC_GAME_STATE_9CC1A0_CHECKSUM_PASS_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_checksum_match_va(void) { return ISAAC_GAME_STATE_9CC1A0_CHECKSUM_MATCH_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_clamp35_va(void) { return ISAAC_GAME_STATE_9CC1A0_CLAMP35_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_clamp1a_va(void) { return ISAAC_GAME_STATE_9CC1A0_CLAMP1A_VA; }
extern "C" uint32_t isaac_game_state_9cc1a0_caller_count(void) { return ISAAC_GAME_STATE_9CC1A0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9cc1a0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CC1A0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9CC1A0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9CC1A0_CALLER_VA_2;
    default: return 0;
  }
}/* ====================== ABI v10 (body C + reader giant) ====================== */
/* gs9ce720DispatchCount (PE pins: 0x9ce73d, 0x9ce74d, 0x9ce753, 0x9ce763): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9ce720_dispatch_count(uint32_t io8) {
  if (io8 < 0x57u) return 0x1au;
    if (io8 < 0x69u) return 0x1bu;
    if (io8 < 0x70u) return 0x1cu;
    if (io8 < 0x7au) return 0x1du;
    return 0x1fu;
}
/* gs9ce720CountFits (PE pins: 0x9ce9c0, 0x9ceaea): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9ce720_count_fits(uint32_t count, uint32_t vecsize) {
  return (count <= vecsize) ? 1 : 0;
}
/* gs9ce720IoGate0x4a (PE pins: 0x9ce938): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9ce720_io_gate_0x4a(uint32_t io8) {
  return (io8 >= 0x4au) ? 1 : 0;
}
/* gs9ce720IoGate0x37 (PE pins: 0x9ce96b, 0x9cea98): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9ce720_io_gate_0x37(uint32_t io8) {
  return (io8 >= 0x37u) ? 1 : 0;
}
/* gs9ce720DefaultCount0x1ff0x2dd (PE pins: 0x9ce997): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9ce720_default_count_0x1ff_0x2dd(uint32_t io8) {
  return (io8 < 0x35u) ? 0x1ffu : 0x2ddu;
}
/* gs9ce720DefaultCount0x78_0xbe (PE pins: 0x9ceac4): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9ce720_default_count_0x78_0xbe(uint32_t io8) {
  return (io8 < 0x35u) ? 0x78u : 0xbeu;
}
/* gs9ce720Count0xe_0xf (PE pins: 0x9cebea): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9ce720_count_0xe_0xf(uint32_t io8) {
  return (io8 < 0x77u) ? 0xeu : 0xfu;
}
/* gs9ce720IoGate0x4e (PE pins: 0x9cec35): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9ce720_io_gate_0x4e(uint32_t io8) {
  return (io8 >= 0x4eu) ? 1 : 0;
}
/* gs9d05d0IoGate0x1E (PE pins: 0x9d1ade): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x1e(uint32_t io8) {
  return (io8 >= 0x1eu) ? 1 : 0;
}
/* gs9d05d0IoGate0x1F (PE pins: 0x9d1a4f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x1f(uint32_t io8) {
  return (io8 >= 0x1fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x20 (PE pins: 0x9d222f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x20(uint32_t io8) {
  return (io8 >= 0x20u) ? 1 : 0;
}
/* gs9d05d0IoGate0x23 (PE pins: 0x9d21f8): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x23(uint32_t io8) {
  return (io8 >= 0x23u) ? 1 : 0;
}
/* gs9d05d0IoGate0x27 (PE pins: 0x9d12ab): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x27(uint32_t io8) {
  return (io8 >= 0x27u) ? 1 : 0;
}
/* gs9d05d0IoGate0x28 (PE pins: 0x9d0c24): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x28(uint32_t io8) {
  return (io8 >= 0x28u) ? 1 : 0;
}
/* gs9d05d0IoGate0x29 (PE pins: 0x9d1020): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x29(uint32_t io8) {
  return (io8 >= 0x29u) ? 1 : 0;
}
/* gs9d05d0IoGate0x2D (PE pins: 0x9d0a7c): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x2d(uint32_t io8) {
  return (io8 >= 0x2du) ? 1 : 0;
}
/* gs9d05d0IoGate0x2F (PE pins: 0x9d120d, 0x9d17f3): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x2f(uint32_t io8) {
  return (io8 >= 0x2fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x30 (PE pins: 0x9d17b3): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x30(uint32_t io8) {
  return (io8 >= 0x30u) ? 1 : 0;
}
/* gs9d05d0IoGate0x38 (PE pins: 0x9d0dbd): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x38(uint32_t io8) {
  return (io8 >= 0x38u) ? 1 : 0;
}
/* gs9d05d0IoGate0x39 (PE pins: 0x9d1c8a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x39(uint32_t io8) {
  return (io8 >= 0x39u) ? 1 : 0;
}
/* gs9d05d0IoGate0x3A (PE pins: 0x9d09e7): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x3a(uint32_t io8) {
  return (io8 >= 0x3au) ? 1 : 0;
}
/* gs9d05d0IoGate0x3B (PE pins: 0x9d0afa): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x3b(uint32_t io8) {
  return (io8 >= 0x3bu) ? 1 : 0;
}
/* gs9d05d0IoGate0x3E (PE pins: 0x9d0aab): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x3e(uint32_t io8) {
  return (io8 >= 0x3eu) ? 1 : 0;
}
/* gs9d05d0IoGate0x40 (PE pins: 0x9d258c): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x40(uint32_t io8) {
  return (io8 >= 0x40u) ? 1 : 0;
}
/* gs9d05d0IoGate0x41 (PE pins: 0x9d2702): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x41(uint32_t io8) {
  return (io8 >= 0x41u) ? 1 : 0;
}
/* gs9d05d0IoGate0x43 (PE pins: 0x9d4066): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x43(uint32_t io8) {
  return (io8 >= 0x43u) ? 1 : 0;
}
/* gs9d05d0IoGate0x45 (PE pins: 0x9d0c2d): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x45(uint32_t io8) {
  return (io8 >= 0x45u) ? 1 : 0;
}
/* gs9d05d0IoGate0x4C (PE pins: 0x9d11aa): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x4c(uint32_t io8) {
  return (io8 >= 0x4cu) ? 1 : 0;
}
/* gs9d05d0IoGate0x4D (PE pins: 0x9d093b, 0x9d1252, 0x9d190c): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x4d(uint32_t io8) {
  return (io8 >= 0x4du) ? 1 : 0;
}
/* gs9d05d0IoGate0x4F (PE pins: 0x9d27db): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x4f(uint32_t io8) {
  return (io8 >= 0x4fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x50 (PE pins: 0x9d280f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x50(uint32_t io8) {
  return (io8 >= 0x50u) ? 1 : 0;
}
/* gs9d05d0IoGate0x51 (PE pins: 0x9d4323): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x51(uint32_t io8) {
  return (io8 >= 0x51u) ? 1 : 0;
}
/* gs9d05d0IoGate0x52 (PE pins: 0x9d2869): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x52(uint32_t io8) {
  return (io8 >= 0x52u) ? 1 : 0;
}
/* gs9d05d0IoGate0x55 (PE pins: 0x9d240a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x55(uint32_t io8) {
  return (io8 >= 0x55u) ? 1 : 0;
}
/* gs9d05d0IoGate0x58 (PE pins: 0x9d2737): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x58(uint32_t io8) {
  return (io8 >= 0x58u) ? 1 : 0;
}
/* gs9d05d0IoGate0x5A (PE pins: 0x9d2470): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x5a(uint32_t io8) {
  return (io8 >= 0x5au) ? 1 : 0;
}
/* gs9d05d0IoGate0x5B (PE pins: 0x9d1ec5, 0x9d289b): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x5b(uint32_t io8) {
  return (io8 >= 0x5bu) ? 1 : 0;
}
/* gs9d05d0IoGate0x5C (PE pins: 0x9d2988): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x5c(uint32_t io8) {
  return (io8 >= 0x5cu) ? 1 : 0;
}
/* gs9d05d0IoGate0x5D (PE pins: 0x9d291c): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x5d(uint32_t io8) {
  return (io8 >= 0x5du) ? 1 : 0;
}
/* gs9d05d0IoGate0x5E (PE pins: 0x9d1f1d): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x5e(uint32_t io8) {
  return (io8 >= 0x5eu) ? 1 : 0;
}
/* gs9d05d0IoGate0x5F (PE pins: 0x9d2a01): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x5f(uint32_t io8) {
  return (io8 >= 0x5fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x60 (PE pins: 0x9d2b1d): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x60(uint32_t io8) {
  return (io8 >= 0x60u) ? 1 : 0;
}
/* gs9d05d0IoGate0x61 (PE pins: 0x9d2c61): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x61(uint32_t io8) {
  return (io8 >= 0x61u) ? 1 : 0;
}
/* gs9d05d0IoGate0x62 (PE pins: 0x9d2dc8): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x62(uint32_t io8) {
  return (io8 >= 0x62u) ? 1 : 0;
}
/* gs9d05d0IoGate0x63 (PE pins: 0x9d29c9): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x63(uint32_t io8) {
  return (io8 >= 0x63u) ? 1 : 0;
}
/* gs9d05d0IoGate0x64 (PE pins: 0x9d0ef5, 0x9d2dfa): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x64(uint32_t io8) {
  return (io8 >= 0x64u) ? 1 : 0;
}
/* gs9d05d0IoGate0x65 (PE pins: 0x9d42ad): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x65(uint32_t io8) {
  return (io8 >= 0x65u) ? 1 : 0;
}
/* gs9d05d0IoGate0x67 (PE pins: 0x9d1de2): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x67(uint32_t io8) {
  return (io8 >= 0x67u) ? 1 : 0;
}
/* gs9d05d0IoGate0x6A (PE pins: 0x9d2e36): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x6a(uint32_t io8) {
  return (io8 >= 0x6au) ? 1 : 0;
}
/* gs9d05d0IoGate0x6C (PE pins: 0x9d0f28, 0x9d2eea): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x6c(uint32_t io8) {
  return (io8 >= 0x6cu) ? 1 : 0;
}
/* gs9d05d0IoGate0x6E (PE pins: 0x9d3df9): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x6e(uint32_t io8) {
  return (io8 >= 0x6eu) ? 1 : 0;
}
/* gs9d05d0IoGate0x6F (PE pins: 0x9d3eb7): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x6f(uint32_t io8) {
  return (io8 >= 0x6fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x72 (PE pins: 0x9d2769): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x72(uint32_t io8) {
  return (io8 >= 0x72u) ? 1 : 0;
}
/* gs9d05d0IoGate0x73 (PE pins: 0x9d3f17): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x73(uint32_t io8) {
  return (io8 >= 0x73u) ? 1 : 0;
}
/* gs9d05d0IoGate0x74 (PE pins: 0x9d1c35): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x74(uint32_t io8) {
  return (io8 >= 0x74u) ? 1 : 0;
}
/* gs9d05d0IoGate0x75 (PE pins: 0x9d354a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x75(uint32_t io8) {
  return (io8 >= 0x75u) ? 1 : 0;
}
/* gs9d05d0IoGate0x76 (PE pins: 0x9d357d): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x76(uint32_t io8) {
  return (io8 >= 0x76u) ? 1 : 0;
}
/* gs9d05d0IoGate0x78 (PE pins: 0x9d35ad): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x78(uint32_t io8) {
  return (io8 >= 0x78u) ? 1 : 0;
}
/* gs9d05d0IoGate0x79 (PE pins: 0x9d08cf): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x79(uint32_t io8) {
  return (io8 >= 0x79u) ? 1 : 0;
}
/* gs9d05d0IoGate0x7E (PE pins: 0x9d35e4): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x7e(uint32_t io8) {
  return (io8 >= 0x7eu) ? 1 : 0;
}
/* gs9d05d0IoGate0x7F (PE pins: 0x9d3f4a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x7f(uint32_t io8) {
  return (io8 >= 0x7fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x80 (PE pins: 0x9d399b): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x80(uint32_t io8) {
  return (io8 >= 0x80u) ? 1 : 0;
}
/* gs9d05d0IoGate0x81 (PE pins: 0x9d3c9c): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x81(uint32_t io8) {
  return (io8 >= 0x81u) ? 1 : 0;
}
/* gs9d05d0IoGate0x82 (PE pins: 0x9d0849, 0x9d3af5, 0x9d3ccb): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x82(uint32_t io8) {
  return (io8 >= 0x82u) ? 1 : 0;
}
/* gs9d05d0IoGate0x83 (PE pins: 0x9d3d6f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x83(uint32_t io8) {
  return (io8 >= 0x83u) ? 1 : 0;
}
/* gs9d05d0IoGate0x8A (PE pins: 0x9d4403): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x8a(uint32_t io8) {
  return (io8 >= 0x8au) ? 1 : 0;
}
/* gs9d05d0IoGate0x8B (PE pins: 0x9d1314): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x8b(uint32_t io8) {
  return (io8 >= 0x8bu) ? 1 : 0;
}
/* gs9d05d0IoGate0x8C (PE pins: 0x9d2197): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x8c(uint32_t io8) {
  return (io8 >= 0x8cu) ? 1 : 0;
}
/* gs9d05d0IoGate0x8F (PE pins: 0x9d24ad): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x8f(uint32_t io8) {
  return (io8 >= 0x8fu) ? 1 : 0;
}
/* gs9d05d0IoGate0x90 (PE pins: 0x9d2f1a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x90(uint32_t io8) {
  return (io8 >= 0x90u) ? 1 : 0;
}
/* gs9d05d0IoGate0x97 (PE pins: 0x9d131f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x97(uint32_t io8) {
  return (io8 >= 0x97u) ? 1 : 0;
}
/* gs9d05d0IoGate0x99 (PE pins: 0x9d0e7b, 0x9d336a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x99(uint32_t io8) {
  return (io8 >= 0x99u) ? 1 : 0;
}
/* gs9d05d0IoGate0x9C (PE pins: 0x9d24ec): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x9c(uint32_t io8) {
  return (io8 >= 0x9cu) ? 1 : 0;
}
/* gs9d05d0IoGate0x9D (PE pins: 0x9d44d3): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x9d(uint32_t io8) {
  return (io8 >= 0x9du) ? 1 : 0;
}
/* gs9d05d0IoGate0xA0 (PE pins: 0x9d252f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0xa0(uint32_t io8) {
  return (io8 >= 0xa0u) ? 1 : 0;
}
/* gs9d05d0IoGate0xA4 (PE pins: 0x9d35f8): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0xa4(uint32_t io8) {
  return (io8 >= 0xa4u) ? 1 : 0;
}
/* gs9d05d0IoGate0xA5 (PE pins: 0x9d0a4b): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0xa5(uint32_t io8) {
  return (io8 >= 0xa5u) ? 1 : 0;
}
/* gs9d05d0IoGate0xA6 (PE pins: 0x9d0c58): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0xa6(uint32_t io8) {
  return (io8 >= 0xa6u) ? 1 : 0;
}
/* gs9d05d0IoGate0xA8 (PE pins: 0x9d3d05): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0xa8(uint32_t io8) {
  return (io8 >= 0xa8u) ? 1 : 0;
}
/* gs9d05d0IoGate0xA9 (PE pins: 0x9d3d37): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0xa9(uint32_t io8) {
  return (io8 >= 0xa9u) ? 1 : 0;
}
/* gs9d05d0IoGate0x23Above (PE pins: 0x9d09b4): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x23_above(uint32_t io8) {
  return (io8 > 0x23u) ? 1 : 0;
}
/* gs9d05d0IoGate0x24Above (PE pins: 0x9d0a1a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_io_gate_0x24_above(uint32_t io8) {
  return (io8 > 0x24u) ? 1 : 0;
}
/* gs9d05d0LaneCount1_4 (PE pins: 0x9d0df7, 0x9d0e05, 0x9d0e13): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9d05d0_lane_count_1_4(uint32_t io8) {
  if (io8 < 0x3cu) return 1u;
    if (io8 < 0x66u) return 2u;
    if (io8 < 0x71u) return 3u;
    return 4u;
}
/* gs9d05d0LaneCount2_4 (PE pins: 0x9d1085, 0x9d10a0): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9d05d0_lane_count_2_4(uint32_t io8) {
  if (io8 < 0x66u) return 2u;
    if (io8 < 0x71u) return 3u;
    return 4u;
}
/* gs9d05d0Count0xf0x10 (PE pins: 0x9d1171): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9d05d0_count_0xf_0x10(uint32_t io8) {
  return (io8 < 0xa7u) ? 0xfu : 0x10u;
}
/* gs9d05d0FormatInRange (PE pins: 0x9d15ef): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_format_in_range(uint32_t io8) {
  return ((io8 - 0x2fu) <= 0x61u) ? 1 : 0;
}
/* gs9d05d0CountCapOk (PE pins: 0x9d1ce2): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_count_cap_ok(uint32_t count) {
  return (count <= 0x2222222u) ? 1 : 0;
}
/* gs9d05d0IdxLeVecsize (PE pins: 0x9d2b9a): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_idx_le_vecsize(uint32_t idx, uint32_t size) {
  return (idx <= size) ? 1 : 0;
}
/* gs9d05d0SlotCapLt3 (PE pins: 0x9d3061, 0x9d31d0): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_slot_cap_lt_3(uint32_t count) {
  return (count < 3u) ? 1 : 0;
}
/* gs9d05d0Clamp0x14 (PE pins: 0x9d340e): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9d05d0_clamp_0x14(uint32_t count) {
  return (count < 0x14u) ? count : 0x14u;
}
/* gs9d05d0ClampSigned0xa (PE pins: 0x9d1b13): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" uint32_t isaac_game_state_9d05d0_clamp_signed_0xa(uint32_t count) {
  const uint32_t c = count;
    return ((int64_t)(int32_t)c <= 0xa) ? c : 0xau;
}
/* gs9d05d0HeadNonneg (PE pins: 0x9d0644): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_head_nonneg(uint32_t v) {
  return ((int64_t)(int32_t)v >= 0) ? 1 : 0;
}
/* gs9d05d0HeadLtVecsize (PE pins: 0x9d0670): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_head_lt_vecsize(uint32_t count, uint32_t vecsize) {
  return ((int64_t)(int32_t)count < (int64_t)(int32_t)vecsize) ? 1 : 0;
}
/* gs9d05d0SignedPositive (PE pins: 0x9d0e58, 0x9d364f, 0x9d3ee4, 0x9d43d6): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_signed_positive(uint32_t count) {
  return ((int64_t)(int32_t)count > 0) ? 1 : 0;
}
/* gs9d05d0SignedIdxLtVecsize (PE pins: 0x9d2fc0, 0x9d1837, 0x9d4044, 0x9d41f1): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_signed_idx_lt_vecsize(uint32_t idx, uint32_t vecsize) {
  return ((int64_t)(int32_t)idx < (int64_t)(int32_t)vecsize) ? 1 : 0;
}
/* gs9d05d0IdxMasked7fffLtVecsize (PE pins: 0x9d41d2, 0x9d159e, 0x9d3aaa, 0x9d3c4e): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize(uint32_t idx, uint32_t vecsize) {
  return ((int64_t)(int32_t)(idx & 0x7fffu) < (int64_t)(int32_t)vecsize) ? 1 : 0;
}
/* gs9d05d0ValueNegOverride (PE pins: 0x9d4250): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_value_neg_override(uint32_t v) {
  return ((int64_t)(int32_t)v < 0) ? 1 : 0;
}
/* gs9d05d0ByteNonzero (PE pins: 0x9d251d, 0x9d2563, 0x9d38ba, 0x9d38f3, 0x9d265e, 0x9d2f51, 0x9d3438, 0x9d3e3f, 0x9d42da, 0x9d4368): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_byte_nonzero(uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}
/* gs9d05d0ByteEq1 (PE pins: 0x9d1118, 0x9d2f9b, 0x9d3a0d): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_byte_eq_1(uint32_t byte) {
  return ((byte & 0xffu) == 1u) ? 1 : 0;
}
/* gs9d05d0ByteFfOk (PE pins: 0x9d3f7f): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_byte_ff_ok(uint32_t byte) {
  return ((byte & 0xffu) != 0xffu) ? 1 : 0;
}
/* gs9d05d0U32CountNeeded (PE pins: 0x9d16f4, 0x9d2289, 0x9d409e, 0x9d4433, 0x9d450c): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_u32_count_needed(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}
/* gs9d05d0ReadyOk (PE pins: 0x9d170b, 0x9d22b0, 0x9d2669, 0x9d3670, 0x9d40ad): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_ready_ok(uint32_t al) {
  return ((al & 0xffu) == 0u) ? 1 : 0;
}
/* gs9d05d0V2fd10ResultOk (PE pins: 0x9d0e70, 0x9d3e99, 0x9d3efa, 0x9d400b, 0x9d4220, 0x9d43ea): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_v2fd10_result_ok(uint32_t result) {
  return (result != 0u) ? 1 : 0;
}
/* gs9d05d0C7350ResultOk (PE pins: 0x9d178f, 0x9d2d93): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_c7350_result_ok(uint32_t al) {
  return ((al & 0xffu) != 0u) ? 1 : 0;
}
/* gs9d05d0Cff40ResultOk (PE pins: 0x9d268d, 0x9d26d7): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_cff40_result_ok(uint32_t al) {
  return ((al & 0xffu) != 0u) ? 1 : 0;
}
/* gs9d05d0ByteIdxLtByte (PE pins: 0x9d2699, 0x9d2fdb, 0x9d3471, 0x9d3eac, 0x9d431e, 0x9d43fd): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_byte_idx_lt_byte(uint32_t idx, uint32_t count) {
  return (((idx & 0xffu) < (count & 0xffu)) ? 1 : 0);
}
/* gs9d05d0IdxLt2 (PE pins: 0x9d3aed, 0x9d3c94): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_idx_lt_2(uint32_t idx) {
  return (idx < 2u) ? 1 : 0;
}
/* gs9d05d0IdxLt6 (PE pins: 0x9d33e3): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_idx_lt_6(uint32_t idx) {
  return (idx < 6u) ? 1 : 0;
}
/* gs9d05d0IdxLt8 (PE pins: 0x9d333d): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_idx_lt_8(uint32_t idx) {
  return (idx < 8u) ? 1 : 0;
}
/* gs9d05d0WordIdxLtCount (PE pins: 0x9d2c55, 0x9d2d9e): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_word_idx_lt_count(uint32_t idx, uint32_t count) {
  return (((idx & 0xffffu) < (count & 0xffffu)) ? 1 : 0);
}
/* gs9d05d0UintIdxLtCount (PE pins: 0x9d17a1, 0x9d1168, 0x9d2019, 0x9d2583, 0x9d42a7, 0x9d4577): decision law, PE-decoded;
   byte gates mask & 0xff INSIDE the body; FULL-dword gates
   unmasked; SIGNED gates use the i64 sign-extend forms. */
extern "C" int32_t isaac_game_state_9d05d0_uint_idx_lt_count(uint32_t idx, uint32_t count) {
  return (idx < count) ? 1 : 0;
}
extern "C" uint32_t isaac_game_state_9ce720_dispatch_count_va(void) { return 0x009ce73du; }
extern "C" uint32_t isaac_game_state_9ce720_count_fits_va(void) { return 0x009ce9c0u; }
extern "C" uint32_t isaac_game_state_9ce720_io_gate_0x4a_va(void) { return 0x009ce938u; }
extern "C" uint32_t isaac_game_state_9ce720_io_gate_0x37_va(void) { return 0x009ce96bu; }
extern "C" uint32_t isaac_game_state_9ce720_default_count_0x1ff_0x2dd_va(void) { return 0x009ce997u; }
extern "C" uint32_t isaac_game_state_9ce720_default_count_0x78_0xbe_va(void) { return 0x009ceac4u; }
extern "C" uint32_t isaac_game_state_9ce720_count_0xe_0xf_va(void) { return 0x009cebeau; }
extern "C" uint32_t isaac_game_state_9ce720_io_gate_0x4e_va(void) { return 0x009cec35u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x1e_va(void) { return 0x009d1adeu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x1f_va(void) { return 0x009d1a4fu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x20_va(void) { return 0x009d222fu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x23_va(void) { return 0x009d21f8u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x27_va(void) { return 0x009d12abu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x28_va(void) { return 0x009d0c24u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x29_va(void) { return 0x009d1020u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x2d_va(void) { return 0x009d0a7cu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x2f_va(void) { return 0x009d120du; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x30_va(void) { return 0x009d17b3u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x38_va(void) { return 0x009d0dbdu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x39_va(void) { return 0x009d1c8au; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x3a_va(void) { return 0x009d09e7u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x3b_va(void) { return 0x009d0afau; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x3e_va(void) { return 0x009d0aabu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x40_va(void) { return 0x009d258cu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x41_va(void) { return 0x009d2702u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x43_va(void) { return 0x009d4066u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x45_va(void) { return 0x009d0c2du; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x4c_va(void) { return 0x009d11aau; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x4d_va(void) { return 0x009d093bu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x4f_va(void) { return 0x009d27dbu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x50_va(void) { return 0x009d280fu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x51_va(void) { return 0x009d4323u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x52_va(void) { return 0x009d2869u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x55_va(void) { return 0x009d240au; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x58_va(void) { return 0x009d2737u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x5a_va(void) { return 0x009d2470u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x5b_va(void) { return 0x009d1ec5u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x5c_va(void) { return 0x009d2988u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x5d_va(void) { return 0x009d291cu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x5e_va(void) { return 0x009d1f1du; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x5f_va(void) { return 0x009d2a01u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x60_va(void) { return 0x009d2b1du; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x61_va(void) { return 0x009d2c61u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x62_va(void) { return 0x009d2dc8u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x63_va(void) { return 0x009d29c9u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x64_va(void) { return 0x009d0ef5u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x65_va(void) { return 0x009d42adu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x67_va(void) { return 0x009d1de2u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x6a_va(void) { return 0x009d2e36u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x6c_va(void) { return 0x009d0f28u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x6e_va(void) { return 0x009d3df9u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x6f_va(void) { return 0x009d3eb7u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x72_va(void) { return 0x009d2769u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x73_va(void) { return 0x009d3f17u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x74_va(void) { return 0x009d1c35u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x75_va(void) { return 0x009d354au; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x76_va(void) { return 0x009d357du; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x78_va(void) { return 0x009d35adu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x79_va(void) { return 0x009d08cfu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x7e_va(void) { return 0x009d35e4u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x7f_va(void) { return 0x009d3f4au; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x80_va(void) { return 0x009d399bu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x81_va(void) { return 0x009d3c9cu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x82_va(void) { return 0x009d0849u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x83_va(void) { return 0x009d3d6fu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x8a_va(void) { return 0x009d4403u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x8b_va(void) { return 0x009d1314u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x8c_va(void) { return 0x009d2197u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x8f_va(void) { return 0x009d24adu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x90_va(void) { return 0x009d2f1au; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x97_va(void) { return 0x009d131fu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x99_va(void) { return 0x009d0e7bu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x9c_va(void) { return 0x009d24ecu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x9d_va(void) { return 0x009d44d3u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0xa0_va(void) { return 0x009d252fu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0xa4_va(void) { return 0x009d35f8u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0xa5_va(void) { return 0x009d0a4bu; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0xa6_va(void) { return 0x009d0c58u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0xa8_va(void) { return 0x009d3d05u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0xa9_va(void) { return 0x009d3d37u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x23_above_va(void) { return 0x009d09b4u; }
extern "C" uint32_t isaac_game_state_9d05d0_io_gate_0x24_above_va(void) { return 0x009d0a1au; }
extern "C" uint32_t isaac_game_state_9d05d0_lane_count_1_4_va(void) { return 0x009d0df7u; }
extern "C" uint32_t isaac_game_state_9d05d0_lane_count_2_4_va(void) { return 0x009d1085u; }
extern "C" uint32_t isaac_game_state_9d05d0_count_0xf_0x10_va(void) { return 0x009d1171u; }
extern "C" uint32_t isaac_game_state_9d05d0_format_in_range_va(void) { return 0x009d15efu; }
extern "C" uint32_t isaac_game_state_9d05d0_count_cap_ok_va(void) { return 0x009d1ce2u; }
extern "C" uint32_t isaac_game_state_9d05d0_idx_le_vecsize_va(void) { return 0x009d2b9au; }
extern "C" uint32_t isaac_game_state_9d05d0_slot_cap_lt_3_va(void) { return 0x009d3061u; }
extern "C" uint32_t isaac_game_state_9d05d0_clamp_0x14_va(void) { return 0x009d340eu; }
extern "C" uint32_t isaac_game_state_9d05d0_clamp_signed_0xa_va(void) { return 0x009d1b13u; }
extern "C" uint32_t isaac_game_state_9d05d0_head_nonneg_va(void) { return 0x009d0644u; }
extern "C" uint32_t isaac_game_state_9d05d0_head_lt_vecsize_va(void) { return 0x009d0670u; }
extern "C" uint32_t isaac_game_state_9d05d0_signed_positive_va(void) { return 0x009d0e58u; }
extern "C" uint32_t isaac_game_state_9d05d0_signed_idx_lt_vecsize_va(void) { return 0x009d2fc0u; }
extern "C" uint32_t isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize_va(void) { return 0x009d41d2u; }
extern "C" uint32_t isaac_game_state_9d05d0_value_neg_override_va(void) { return 0x009d4250u; }
extern "C" uint32_t isaac_game_state_9d05d0_byte_nonzero_va(void) { return 0x009d251du; }
extern "C" uint32_t isaac_game_state_9d05d0_byte_eq_1_va(void) { return 0x009d1118u; }
extern "C" uint32_t isaac_game_state_9d05d0_byte_ff_ok_va(void) { return 0x009d3f7fu; }
extern "C" uint32_t isaac_game_state_9d05d0_u32_count_needed_va(void) { return 0x009d16f4u; }
extern "C" uint32_t isaac_game_state_9d05d0_ready_ok_va(void) { return 0x009d170bu; }
extern "C" uint32_t isaac_game_state_9d05d0_v2fd10_result_ok_va(void) { return 0x009d0e70u; }
extern "C" uint32_t isaac_game_state_9d05d0_c7350_result_ok_va(void) { return 0x009d178fu; }
extern "C" uint32_t isaac_game_state_9d05d0_cff40_result_ok_va(void) { return 0x009d268du; }
extern "C" uint32_t isaac_game_state_9d05d0_byte_idx_lt_byte_va(void) { return 0x009d2699u; }
extern "C" uint32_t isaac_game_state_9d05d0_idx_lt_2_va(void) { return 0x009d3aedu; }
extern "C" uint32_t isaac_game_state_9d05d0_idx_lt_6_va(void) { return 0x009d33e3u; }
extern "C" uint32_t isaac_game_state_9d05d0_idx_lt_8_va(void) { return 0x009d333du; }
extern "C" uint32_t isaac_game_state_9d05d0_word_idx_lt_count_va(void) { return 0x009d2c55u; }
extern "C" uint32_t isaac_game_state_9d05d0_uint_idx_lt_count_va(void) { return 0x009d17a1u; }
extern "C" uint32_t isaac_game_state_9ce720_va(void) { return ISAAC_GAME_STATE_9CE720_VA; }
extern "C" uint32_t isaac_game_state_9ce720_end_va(void) { return ISAAC_GAME_STATE_9CE720_END_VA; }
extern "C" uint32_t isaac_game_state_9ce720_body_bytes(void) { return ISAAC_GAME_STATE_9CE720_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9ce720_next_va(void) { return ISAAC_GAME_STATE_9CE720_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9ce720_io_format_off(void) { return ISAAC_GAME_STATE_9CE720_IO_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9ce720_mgr_global_dat(void) { return ISAAC_GAME_STATE_9CE720_MGR_GLOBAL_DAT; }
extern "C" uint32_t isaac_game_state_9ce720_mgr_vec_a_start_off(void) { return ISAAC_GAME_STATE_9CE720_MGR_VEC_A_START_OFF; }
extern "C" uint32_t isaac_game_state_9ce720_mgr_vec_a_end_off(void) { return ISAAC_GAME_STATE_9CE720_MGR_VEC_A_END_OFF; }
extern "C" uint32_t isaac_game_state_9ce720_mgr_vec_b_start_off(void) { return ISAAC_GAME_STATE_9CE720_MGR_VEC_B_START_OFF; }
extern "C" uint32_t isaac_game_state_9ce720_mgr_vec_b_end_off(void) { return ISAAC_GAME_STATE_9CE720_MGR_VEC_B_END_OFF; }
extern "C" uint32_t isaac_game_state_9d05d0_va(void) { return ISAAC_GAME_STATE_9D05D0_VA; }
extern "C" uint32_t isaac_game_state_9d05d0_end_va(void) { return ISAAC_GAME_STATE_9D05D0_END_VA; }
extern "C" uint32_t isaac_game_state_9d05d0_body_bytes(void) { return ISAAC_GAME_STATE_9D05D0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d05d0_next_va(void) { return ISAAC_GAME_STATE_9D05D0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d05d0_seh_handler_dat(void) { return ISAAC_GAME_STATE_9D05D0_SEH_HANDLER_DAT; }
extern "C" uint32_t isaac_game_state_9d05d0_gs_cookie_dat(void) { return ISAAC_GAME_STATE_9D05D0_GS_COOKIE_DAT; }
extern "C" uint32_t isaac_game_state_9d05d0_io_format_off(void) { return ISAAC_GAME_STATE_9D05D0_IO_FORMAT_OFF; }
extern "C" uint32_t isaac_game_state_9d05d0_reader_row_call_va(void) { return ISAAC_GAME_STATE_9D05D0_READER_ROW_CALL_VA; }
extern "C" uint32_t isaac_game_state_9d05d0_mgr_global_dat(void) { return ISAAC_GAME_STATE_9D05D0_MGR_GLOBAL_DAT; }
extern "C" uint32_t isaac_game_state_9d05d0_mgr_vec_2a404(void) { return ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A404; }
extern "C" uint32_t isaac_game_state_9d05d0_mgr_vec_2a408(void) { return ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A408; }
extern "C" uint32_t isaac_game_state_9d05d0_mgr_vec_2a410(void) { return ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A410; }
extern "C" uint32_t isaac_game_state_9d05d0_mgr_vec_2a414(void) { return ISAAC_GAME_STATE_9D05D0_MGR_VEC_2A414; }
extern "C" uint32_t isaac_game_state_9d05d0_count_cap(void) { return ISAAC_GAME_STATE_9D05D0_COUNT_CAP; }
extern "C" uint32_t isaac_game_state_9d05d0_clamp0x14_const(void) { return ISAAC_GAME_STATE_9D05D0_CLAMP0X14_CONST; }
extern "C" uint32_t isaac_game_state_9d05d0_clamp0xa_const(void) { return ISAAC_GAME_STATE_9D05D0_CLAMP0XA_CONST; }
extern "C" uint32_t isaac_game_state_9d05d0_range_lo(void) { return ISAAC_GAME_STATE_9D05D0_RANGE_LO; }
extern "C" uint32_t isaac_game_state_9d05d0_range_hi(void) { return ISAAC_GAME_STATE_9D05D0_RANGE_HI; }
extern "C" uint32_t isaac_game_state_9d05d0_stride_148(void) { return ISAAC_GAME_STATE_9D05D0_STRIDE_148; }
extern "C" uint32_t isaac_game_state_9d05d0_mask_7fff(void) { return ISAAC_GAME_STATE_9D05D0_MASK_7FFF; }
extern "C" uint32_t isaac_game_state_9ce720_caller_count(void) { return ISAAC_GAME_STATE_9CE720_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9ce720_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CE720_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d05d0_caller_count(void) { return ISAAC_GAME_STATE_9D05D0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d05d0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_3;
    case 4: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_4;
    case 5: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_5;
    case 6: return ISAAC_GAME_STATE_9D05D0_CALLER_VA_6;
    default: return 0;
  }
}

/* --- ABI v11: small-body + writer-giant/reader-tail laws (§4
 *     section-notes/game-state-v11-small-bodies/NOTES.md) --- */

/* 9cf000 bitmap clear loop bound (PE 0x009cf037 cmp eax,0x68 ; jb):
   UNSIGNED fixed 0x68-bit clear. */
extern "C" int32_t isaac_game_state_9cf000_clear_more(uint32_t idx) {
  return (idx < 0x68u) ? 1 : 0;
}

/* 9cff40 io+8 format gate (PE 0x009d00a4 cmp [edi+8],0x92 ; jb):
   FULL-dword UNSIGNED: io8 >= 0x92 writes the extra u16 pair. */
extern "C" int32_t isaac_game_state_9cff40_io8_ge_0x92(uint32_t io8) {
  return (io8 >= 0x92u) ? 1 : 0;
}

/* 9d0440 writer-leaf byte gates (PE 0x009d04d4 / 0x009d04df cmp byte,0 ;
   je): LOW-BYTE nonzero -> bit0/bit1. */
extern "C" int32_t isaac_game_state_9d0440_byte_c_nonzero(uint32_t byte_c) {
  return ((byte_c & 0xffu) != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_game_state_9d0440_byte_d_nonzero(uint32_t byte_d) {
  return ((byte_d & 0xffu) != 0u) ? 1 : 0;
}
/* 9d0440 packed flags byte (or al,2 @0x9d04e5): bit0 = c!=0,
   bit1 = d!=0. */
extern "C" int32_t isaac_game_state_9d0440_flag_byte(uint32_t byte_c,
                                                     uint32_t byte_d) {
  int32_t flags = 0;
  if ((byte_c & 0xffu) != 0u) flags |= 1;
  if ((byte_d & 0xffu) != 0u) flags |= 2;
  return flags;
}

/* --- 0x9d45c0 writer giant (0x2be1 B) --- */

/* flags byte pack (PE 0x009d4825/0x009d4831/0x009d4840): bit0 = b32!=0,
   bit1 = b534!=0, bit2 = b535!=0 — LOW-BYTE gates. */
extern "C" int32_t isaac_game_state_9d45c0_flags_pack(uint32_t b32,
                                                      uint32_t b534,
                                                      uint32_t b535) {
  int32_t flags = 0;
  if ((b32 & 0xffu) != 0u) flags |= 1;
  if ((b534 & 0xffu) != 0u) flags |= 2;
  if ((b535 & 0xffu) != 0u) flags |= 4;
  return flags;
}

/* count law (PE 0x009d4f7b sar eax,3): (int32)(end-begin) >> 3 — the
   arithmetic-shift (floor) form, exact for all u32 diffs. */
extern "C" uint32_t isaac_game_state_9d45c0_count_sar3(uint32_t begin,
                                                       uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 8;
  if (d % 8 != 0 && d < 0) q -= 1; /* sar == floor */
  return (uint32_t)q;
}

/* count != 0 (PE 0x9d4fa8 jbe / 0x9d5084 jbe / 0x9d5550 je /
   0x9d579a jbe / 0x9d6f8b jz / 0x9d70c9 jbe): UNSIGNED. */
extern "C" int32_t isaac_game_state_9d45c0_count_nonzero(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* idx < count (PE 0x9d502a / 0x9d5103 / 0x9d558d / 0x9d5a90 / 0x9d6924 /
   0x9d6fd5 / 0x9d718c jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9d45c0_idx_lt_count(uint32_t idx,
                                                        uint32_t count) {
  return (idx < count) ? 1 : 0;
}

/* count_22c > 0 (PE 0x009d5390 cmp [esi+0x22c],0 ; jle): SIGNED. */
extern "C" int32_t isaac_game_state_9d45c0_count_22c_positive(
    uint32_t count) {
  return ((int64_t)(int32_t)count > 0) ? 1 : 0;
}

/* idx < count_22c (PE 0x009d54d6 cmp ecx,[edx] ; jl): SIGNED. */
extern "C" int32_t isaac_game_state_9d45c0_idx_lt_count_22c(
    uint32_t idx, uint32_t count) {
  return ((int64_t)(int32_t)idx < (int64_t)(int32_t)count) ? 1 : 0;
}

/* element count of the 0x78-stride array (PE 0x9d54e8/0x9d5536/0x9d5569/
   0x9d557b magic 0x88888889 div-by-0x78 SIGNED floor — R16 twin). */
extern "C" uint32_t isaac_game_state_9d45c0_element_count_78(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0x78;
  if (d % 0x78 != 0 && d < 0) q -= 1;
  return (uint32_t)q;
}

/* byte count of the 0x24-stride array (PE 0x9d5aa2/0x9d5aad magic
   0x92492493 div-by-0x24 SIGNED floor; low byte stored/compared). */
extern "C" uint32_t isaac_game_state_9d45c0_byte_count_36(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0x24;
  if (d % 0x24 != 0 && d < 0) q -= 1;
  return (uint32_t)q;
}

/* (idx&0xff) < (count&0xff) (PE 0x9d5aeb/0x9d5b16/0x9d6231/0x9d62f0/
   0x9d6bd3/0x9d6c1a/0x9d6ef1/0x9d6f37): BYTE-narrowed loop bounds. */
extern "C" int32_t isaac_game_state_9d45c0_byte_idx_lt_byte_count(
    uint32_t idx, uint32_t count) {
  return (((idx & 0xffu) < (count & 0xffu)) ? 1 : 0);
}

/* (b&0xff) != 0 (PE 0x9d5aef/0x9d6235/0x9d6bd7/0x9d6ef5 jbe): BYTE. */
extern "C" int32_t isaac_game_state_9d45c0_byte_count_nonzero(
    uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}

/* byte [src+0x398] != 0 (PE 0x009d5b42 je) -> extra 0x9d0100 writer. */
extern "C" int32_t isaac_game_state_9d45c0_byte_398_nonzero(uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}

/* (idx&0xffff) < (count&0xffff) (PE 0x9d5fb1/0x9d608e): WORD-narrowed. */
extern "C" int32_t isaac_game_state_9d45c0_word_idx_lt_count(
    uint32_t idx, uint32_t count) {
  return (((idx & 0xffffu) < (count & 0xffffu)) ? 1 : 0);
}

/* idx < 8 (PE 0x009d6339 jb): fixed cap. */
extern "C" int32_t isaac_game_state_9d45c0_idx_lt_8(uint32_t idx) {
  return (idx < 8u) ? 1 : 0;
}

/* idx < 6 (PE 0x009d63c9 jb): fixed cap. */
extern "C" int32_t isaac_game_state_9d45c0_idx_lt_6(uint32_t idx) {
  return (idx < 6u) ? 1 : 0;
}

/* idx < (count&0xff) (PE 0x9d63ff jbe / 0x9d643f movzx byte + jb): u32
   idx vs byte-extended count. */
extern "C" int32_t isaac_game_state_9d45c0_idx_lt_byte_count_u32(
    uint32_t idx, uint32_t count) {
  return (idx < (count & 0xffu)) ? 1 : 0;
}

/* element count of the 0x34-stride array (PE 0x9d68fe/0x9d6909/0x9d6918
   magic 0x4ec4ec4f div-by-0x34 SIGNED floor). */
extern "C" uint32_t isaac_game_state_9d45c0_element_count_34(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0x34;
  if (d % 0x34 != 0 && d < 0) q -= 1;
  return (uint32_t)q;
}

/* (b&0xff) != 0xff (PE 0x009d6c9a je skip twin u32s): LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d45c0_byte_ne_ff(uint32_t byte) {
  return ((byte & 0xffu) != 0xffu) ? 1 : 0;
}

/* walk continue (PE 0x9d6d4a je end / 0x9d6e8f jne): node != end. */
extern "C" int32_t isaac_game_state_9d45c0_walk_continue_3c0(
    uint32_t node, uint32_t end) {
  return (node != end) ? 1 : 0;
}

/* element byte flag (PE 0x9d6d56/0x9d6d5d cmp byte [esi+4],0 ; je):
   LOW-BYTE != 0 -> sign-magnitude encode arm. */
extern "C" int32_t isaac_game_state_9d45c0_element_byte_nonzero(
    uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}

/* (int32)value >= 0 (PE 0x9d6d5f/0x9d6d73 jns): SIGNED. */
extern "C" int32_t isaac_game_state_9d45c0_value_nonneg(uint32_t value) {
  return ((int64_t)(int32_t)value >= 0) ? 1 : 0;
}

/* (int32)value >= 0 scan gate (PE 0x009d6eb0 jge): SIGNED. */
extern "C" int32_t isaac_game_state_9d45c0_scan_value_nonneg(
    uint32_t value) {
  return ((int64_t)(int32_t)value >= 0) ? 1 : 0;
}

/* scan remaining >= 0 (PE 0x009d6ebb jns): SIGNED (16-entry cap). */
extern "C" int32_t isaac_game_state_9d45c0_scan_remaining_nonneg(
    uint32_t rem) {
  return ((int64_t)(int32_t)rem >= 0) ? 1 : 0;
}

/* walk continue (PE 0x9d7015 je head / 0x9d708b jne): node != head. */
extern "C" int32_t isaac_game_state_9d45c0_walk_continue_5d4(
    uint32_t node, uint32_t head) {
  return (node != head) ? 1 : 0;
}

/* --- 0x9d71b0 reader tail (0x62a B) --- */

/* io+8 >= 0xa2 (PE 0x009d72a0 cmp [edi+8],0x94 + DEAD sbb/add +
   0x009d72af cmp [edi+8],0xa2 ; jb 0x9d74ac): UNSIGNED; the 0x94 lead
   cmp feeds only the dead sbb ecx,ecx / add ecx,0x1f — single gate. */
extern "C" int32_t isaac_game_state_9d71b0_io8_ge_0xa2(uint32_t io8) {
  return (io8 >= 0xa2u) ? 1 : 0;
}

/* io+8 >= 0x9f (PE 0x009d75bf jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9d71b0_io8_ge_0x9f(uint32_t io8) {
  return (io8 >= 0x9fu) ? 1 : 0;
}

/* io+8 >= 0xa3 (PE 0x009d76c7 jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9d71b0_io8_ge_0xa3(uint32_t io8) {
  return (io8 >= 0xa3u) ? 1 : 0;
}

/* (int32)count > 0 (PE 0x9d72ef/0x9d73e3 cmp [ebp-0x24],0 ; jle):
   SIGNED tail-loop entry. */
extern "C" int32_t isaac_game_state_9d71b0_count_pos_signed(
    uint32_t count) {
  return ((int64_t)(int32_t)count > 0) ? 1 : 0;
}

/* (int32)idx < (int32)count (PE 0x9d73aa/0x9d749e jl): SIGNED. */
extern "C" int32_t isaac_game_state_9d71b0_idx_lt_count_signed(
    uint32_t idx, uint32_t count) {
  return ((int64_t)(int32_t)idx < (int64_t)(int32_t)count) ? 1 : 0;
}

/* byte != 0 (PE 0x9d734f/0x9d7443/0x9d767f/0x9d7787 cmp byte,0 ;
   setne bool): LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d71b0_byte_nonzero_setne(
    uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}

/* vec slot full (PE 0x9d737c/0x9d7470/0x9d74eb/0x9d7535/0x9d768a/
   0x9d7792 je -> 0x69ee50/0x9d8660 vector push): ptr == end. */
extern "C" int32_t isaac_game_state_9d71b0_vec_slot_full(uint32_t ptr,
                                                         uint32_t end) {
  return (ptr == end) ? 1 : 0;
}

/* count != 0 (PE 0x9d75ef/0x9d76f7 jbe): UNSIGNED. */
extern "C" int32_t isaac_game_state_9d71b0_count_nonzero(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* idx < count (PE 0x9d76b8/0x9d77c0 jb): UNSIGNED. */
extern "C" int32_t isaac_game_state_9d71b0_idx_lt_count(uint32_t idx,
                                                        uint32_t count) {
  return (idx < count) ? 1 : 0;
}

/* --- ABI v11 accessors --- */
extern "C" uint32_t isaac_game_state_9cf000_va(void) { return ISAAC_GAME_STATE_9CF000_VA; }
extern "C" uint32_t isaac_game_state_9cf000_end_va(void) { return ISAAC_GAME_STATE_9CF000_END_VA; }
extern "C" uint32_t isaac_game_state_9cf000_body_bytes(void) { return ISAAC_GAME_STATE_9CF000_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cf000_next_va(void) { return ISAAC_GAME_STATE_9CF000_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cf000_clear_more_va(void) { return ISAAC_GAME_STATE_9CF000_CLEAR_MORE_VA; }
extern "C" uint32_t isaac_game_state_9cf000_caller_count(void) { return ISAAC_GAME_STATE_9CF000_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9cf000_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CF000_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9CF000_CALLER_VA_1;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9cf050_va(void) { return ISAAC_GAME_STATE_9CF050_VA; }
extern "C" uint32_t isaac_game_state_9cf050_end_va(void) { return ISAAC_GAME_STATE_9CF050_END_VA; }
extern "C" uint32_t isaac_game_state_9cf050_body_bytes(void) { return ISAAC_GAME_STATE_9CF050_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cf050_next_va(void) { return ISAAC_GAME_STATE_9CF050_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cf050_caller_count(void) { return ISAAC_GAME_STATE_9CF050_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9cf050_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CF050_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9CF050_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9CF050_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9CF050_CALLER_VA_3;
    case 4: return ISAAC_GAME_STATE_9CF050_CALLER_VA_4;
    case 5: return ISAAC_GAME_STATE_9CF050_CALLER_VA_5;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9cff40_va(void) { return ISAAC_GAME_STATE_9CFF40_VA; }
extern "C" uint32_t isaac_game_state_9cff40_end_va(void) { return ISAAC_GAME_STATE_9CFF40_END_VA; }
extern "C" uint32_t isaac_game_state_9cff40_body_bytes(void) { return ISAAC_GAME_STATE_9CFF40_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9cff40_next_va(void) { return ISAAC_GAME_STATE_9CFF40_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9cff40_io8_gate_0x92_va(void) { return ISAAC_GAME_STATE_9CFF40_IO8_GATE_0X92_VA; }
extern "C" uint32_t isaac_game_state_9cff40_caller_count(void) { return ISAAC_GAME_STATE_9CFF40_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9cff40_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9CFF40_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9CFF40_CALLER_VA_1;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d0100_va(void) { return ISAAC_GAME_STATE_9D0100_VA; }
extern "C" uint32_t isaac_game_state_9d0100_end_va(void) { return ISAAC_GAME_STATE_9D0100_END_VA; }
extern "C" uint32_t isaac_game_state_9d0100_body_bytes(void) { return ISAAC_GAME_STATE_9D0100_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d0100_next_va(void) { return ISAAC_GAME_STATE_9D0100_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d0100_caller_count(void) { return ISAAC_GAME_STATE_9D0100_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d0100_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D0100_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D0100_CALLER_VA_1;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d02c0_va(void) { return ISAAC_GAME_STATE_9D02C0_VA; }
extern "C" uint32_t isaac_game_state_9d02c0_end_va(void) { return ISAAC_GAME_STATE_9D02C0_END_VA; }
extern "C" uint32_t isaac_game_state_9d02c0_body_bytes(void) { return ISAAC_GAME_STATE_9D02C0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d02c0_next_va(void) { return ISAAC_GAME_STATE_9D02C0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d02c0_caller_count(void) { return ISAAC_GAME_STATE_9D02C0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d02c0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D02C0_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d0440_va(void) { return ISAAC_GAME_STATE_9D0440_VA; }
extern "C" uint32_t isaac_game_state_9d0440_end_va(void) { return ISAAC_GAME_STATE_9D0440_END_VA; }
extern "C" uint32_t isaac_game_state_9d0440_body_bytes(void) { return ISAAC_GAME_STATE_9D0440_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d0440_next_va(void) { return ISAAC_GAME_STATE_9D0440_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d0440_byte_c_gate_va(void) { return ISAAC_GAME_STATE_9D0440_BYTE_C_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d0440_byte_d_gate_va(void) { return ISAAC_GAME_STATE_9D0440_BYTE_D_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d0440_caller_count(void) { return ISAAC_GAME_STATE_9D0440_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d0440_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D0440_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d71b0_va(void) { return ISAAC_GAME_STATE_9D71B0_VA; }
extern "C" uint32_t isaac_game_state_9d71b0_end_va(void) { return ISAAC_GAME_STATE_9D71B0_END_VA; }
extern "C" uint32_t isaac_game_state_9d71b0_body_bytes(void) { return ISAAC_GAME_STATE_9D71B0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d71b0_next_va(void) { return ISAAC_GAME_STATE_9D71B0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d71b0_gs_cookie_dat(void) { return ISAAC_GAME_STATE_9D71B0_GS_COOKIE_DAT; }
extern "C" uint32_t isaac_game_state_9d71b0_caller_count(void) { return ISAAC_GAME_STATE_9D71B0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d71b0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D71B0_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8190_va(void) { return ISAAC_GAME_STATE_9D8190_VA; }
extern "C" uint32_t isaac_game_state_9d8190_end_va(void) { return ISAAC_GAME_STATE_9D8190_END_VA; }
extern "C" uint32_t isaac_game_state_9d8190_body_bytes(void) { return ISAAC_GAME_STATE_9D8190_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8190_next_va(void) { return ISAAC_GAME_STATE_9D8190_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8190_caller_count(void) { return ISAAC_GAME_STATE_9D8190_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8190_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8190_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D8190_CALLER_VA_1;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d83f0_va(void) { return ISAAC_GAME_STATE_9D83F0_VA; }
extern "C" uint32_t isaac_game_state_9d83f0_end_va(void) { return ISAAC_GAME_STATE_9D83F0_END_VA; }
extern "C" uint32_t isaac_game_state_9d83f0_body_bytes(void) { return ISAAC_GAME_STATE_9D83F0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d83f0_next_va(void) { return ISAAC_GAME_STATE_9D83F0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d83f0_caller_count(void) { return ISAAC_GAME_STATE_9D83F0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d83f0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D83F0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D83F0_CALLER_VA_1;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8470_va(void) { return ISAAC_GAME_STATE_9D8470_VA; }
extern "C" uint32_t isaac_game_state_9d8470_end_va(void) { return ISAAC_GAME_STATE_9D8470_END_VA; }
extern "C" uint32_t isaac_game_state_9d8470_body_bytes(void) { return ISAAC_GAME_STATE_9D8470_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8470_next_va(void) { return ISAAC_GAME_STATE_9D8470_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8470_caller_count(void) { return ISAAC_GAME_STATE_9D8470_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8470_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8470_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d45c0_flags_pack_va(void) { return 0x009d4825u; }
extern "C" uint32_t isaac_game_state_9d45c0_count_sar3_va(void) { return 0x009d4f7bu; }
extern "C" uint32_t isaac_game_state_9d45c0_count_nonzero_va(void) { return 0x009d4fa8u; }
extern "C" uint32_t isaac_game_state_9d45c0_idx_lt_count_va(void) { return 0x009d502au; }
extern "C" uint32_t isaac_game_state_9d45c0_count_22c_positive_va(void) { return 0x009d5390u; }
extern "C" uint32_t isaac_game_state_9d45c0_idx_lt_count_22c_va(void) { return 0x009d54d6u; }
extern "C" uint32_t isaac_game_state_9d45c0_element_count_78_va(void) { return 0x009d54e8u; }
extern "C" uint32_t isaac_game_state_9d45c0_byte_count_36_va(void) { return 0x009d5aa2u; }
extern "C" uint32_t isaac_game_state_9d45c0_byte_idx_lt_byte_count_va(void) { return 0x009d5aebu; }
extern "C" uint32_t isaac_game_state_9d45c0_byte_count_nonzero_va(void) { return 0x009d5aefu; }
extern "C" uint32_t isaac_game_state_9d45c0_byte_398_nonzero_va(void) { return 0x009d5b42u; }
extern "C" uint32_t isaac_game_state_9d45c0_word_idx_lt_count_va(void) { return 0x009d5fb1u; }
extern "C" uint32_t isaac_game_state_9d45c0_idx_lt_8_va(void) { return 0x009d6339u; }
extern "C" uint32_t isaac_game_state_9d45c0_idx_lt_6_va(void) { return 0x009d63c9u; }
extern "C" uint32_t isaac_game_state_9d45c0_idx_lt_byte_count_u32_va(void) { return 0x009d63ffu; }
extern "C" uint32_t isaac_game_state_9d45c0_element_count_34_va(void) { return 0x009d68feu; }
extern "C" uint32_t isaac_game_state_9d45c0_byte_ne_ff_va(void) { return 0x009d6c9au; }
extern "C" uint32_t isaac_game_state_9d45c0_walk_continue_3c0_va(void) { return 0x009d6d4au; }
extern "C" uint32_t isaac_game_state_9d45c0_element_byte_nonzero_va(void) { return 0x009d6d56u; }
extern "C" uint32_t isaac_game_state_9d45c0_value_nonneg_va(void) { return 0x009d6d5fu; }
extern "C" uint32_t isaac_game_state_9d45c0_scan_value_nonneg_va(void) { return 0x009d6eb0u; }
extern "C" uint32_t isaac_game_state_9d45c0_scan_remaining_nonneg_va(void) { return 0x009d6ebbu; }
extern "C" uint32_t isaac_game_state_9d45c0_walk_continue_5d4_va(void) { return 0x009d7015u; }
extern "C" uint32_t isaac_game_state_9d71b0_io8_ge_0xa2_va(void) { return 0x009d72afu; }
extern "C" uint32_t isaac_game_state_9d71b0_io8_ge_0x9f_va(void) { return 0x009d75bfu; }
extern "C" uint32_t isaac_game_state_9d71b0_io8_ge_0xa3_va(void) { return 0x009d76c7u; }
extern "C" uint32_t isaac_game_state_9d71b0_count_pos_signed_va(void) { return 0x009d72efu; }
extern "C" uint32_t isaac_game_state_9d71b0_idx_lt_count_signed_va(void) { return 0x009d73aau; }
extern "C" uint32_t isaac_game_state_9d71b0_byte_nonzero_setne_va(void) { return 0x009d734fu; }
extern "C" uint32_t isaac_game_state_9d71b0_vec_slot_full_va(void) { return 0x009d737cu; }
extern "C" uint32_t isaac_game_state_9d71b0_count_nonzero_va(void) { return 0x009d75efu; }
extern "C" uint32_t isaac_game_state_9d71b0_idx_lt_count_va(void) { return 0x009d76b8u; }

/* --- ABI v12: save-piece cluster laws --- */

/* L1 — 0x9d77e0 element count (PE 0x009d78c4; twins 0x9d79da/0x9d7b31/
   0x9d7c3c): (int32)(end-begin)/0xc via the 0x2aaaaaab magic — SIGNED
   floor division by 12 (imul ecx / sar edx,1 / shr eax,0x1f / add). */
extern "C" uint32_t isaac_game_state_9d77e0_element_count_0xc(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0xc;
  if (d % 0xc != 0 && d < 0) q -= 1; /* sar-floor form */
  return (uint32_t)q;
}

/* L2 — 0x9d77e0 loop-entry gate (PE 0x009d790f; twins 0x9d7a27/0x9d7b7c/
   0x9d7c89): cmp eax,0 ; je skip. FULL-dword. */
extern "C" int32_t isaac_game_state_9d77e0_loop_count_nonzero(
    uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* L3 — 0x9d77e0 loop bound (PE 0x009d79c9; twins 0x9d7ada/0x9d7c2b/
   0x9d7d3a): cmp [ebp-0xc],eax ; jb. UNSIGNED idx < count. */
extern "C" int32_t isaac_game_state_9d77e0_idx_lt_count(uint32_t idx,
                                                        uint32_t count) {
  return (idx < count) ? 1 : 0;
}

/* L4 — 0x9d77e0 byte-flag @+4 (PE 0x009d7959 setne; twin 0x9d7a6b):
   cmp byte [elem+4],0 ; setne. LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d77e0_elem_byte4_nonzero(
    uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}

/* L5 — 0x9d77e0 byte-flag @+8 (PE 0x009d7bec setne; twin 0x9d7cf7):
   cmp byte [elem+8],0 ; setne. LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d77e0_elem_byte8_nonzero(
    uint32_t byte) {
  return ((byte & 0xffu) != 0u) ? 1 : 0;
}

/* L6 — 0x9d8190 piece-loop entry (PE 0x009d828f cmp [ebx+0x19d78],0 ;
   jle skip): SIGNED (int32)count > 0. */
extern "C" int32_t isaac_game_state_9d8190_piece_count_positive(
    uint32_t count) {
  return ((int64_t)(int32_t)count > 0) ? 1 : 0;
}

/* L7 — 0x9d8190 piece-loop bound (PE 0x009d82b1 cmp edi,[ebx+0x19d78] ;
   jl): SIGNED (int32)idx < (int32)count. */
extern "C" int32_t isaac_game_state_9d8190_piece_idx_lt_count(
    uint32_t idx, uint32_t count) {
  return ((int64_t)(int32_t)idx < (int64_t)(int32_t)count) ? 1 : 0;
}

/* L8 — 0x9d8190 seed-object gate (PE 0x009d82bf test eax,eax ; jne
   skip-log): FULL-dword ptr!=[GameState+0x1e728] -> 1 skips the HOST
   logger (0x10, 0xb1c640); 0 -> 0 (log + null seed string). */
extern "C" int32_t isaac_game_state_9d8190_seed_obj_present(
    uint32_t ptr_1e728) {
  return (ptr_1e728 != 0u) ? 1 : 0;
}

/* L9 — 0x9d8190 message SSO heap select (PE 0x009d82f2 cmp
   [ebp-0x28],0x10 ; cmovae): FULL-dword UNSIGNED size >= 0x10 loads the
   heap pointer word; else inline buffer (P4/Q4 shape). */
extern "C" int32_t isaac_game_state_9d8190_msg_sso_heap_used(
    uint32_t size) {
  return (size >= ISAAC_GAME_STATE_9D8190_SSO_THRESHOLD) ? 1 : 0;
}

/* L10 — 0x9d8190 message string pointer (mem-law, P5/Q5 shape):
   size < 0x10 -> sso_off (u32 wrap); else u32 LE at mem + sso_off. */
extern "C" uint32_t isaac_game_state_9d8190_msg_sso_ptr(
    const uint8_t* mem, uint32_t sso_off, uint32_t size) {
  if (size < ISAAC_GAME_STATE_9D8190_SSO_THRESHOLD) {
    return sso_off; /* inline SSO buffer address */
  }
  uint32_t v = 0u;
  if (mem != nullptr) {
    const uint8_t* p = mem + sso_off;
    v = static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
        (static_cast<uint32_t>(p[2]) << 16) |
        (static_cast<uint32_t>(p[3]) << 24);
  }
  return v; /* heap pointer word */
}

/* L11 — 0x9d8190 checksum stream word (PE 0x009d83b3 xor
   eax,0x96696996; raw acc stored @GameState+0x1fda4 @0x9d83ad):
   streamed dword = acc ^ 0x96696996 (W22/9d7d50 machine twin). */
extern "C" uint32_t isaac_game_state_9d8190_checksum_stream_word(
    uint32_t acc) {
  return acc ^ ISAAC_GAME_STATE_9D8190_CHECKSUM_XOR;
}

/* L12 — 0x9d8660 element count (PE 0x009d868c; index twin 0x9d867c):
   (int32)(end-begin)/0xc SIGNED floor (0x2aaaaaab magic). */
extern "C" uint32_t isaac_game_state_9d8660_element_count_0xc(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0xc;
  if (d % 0xc != 0 && d < 0) q -= 1;
  return (uint32_t)q;
}

/* L13 — 0x9d8660 count-not-max gate (PE 0x009d8697 cmp eax,0x15555555 ;
   je -> 0x415bc0 throw): FULL-dword COUNT != 0x15555555. */
extern "C" int32_t isaac_game_state_9d8660_count_not_maxed(
    uint32_t count) {
  return (count != ISAAC_GAME_STATE_9D8660_MAX_COUNT) ? 1 : 0;
}

/* L14 — 0x9d8660 growth target (PE 0x009d8734 cmovae ecx,eax):
   max(new_count, cap_count + (cap_count>>1)) — 1.5x growth policy. */
extern "C" uint32_t isaac_game_state_9d8660_grow_target_count(
    uint32_t new_count, uint32_t cap_count) {
  uint32_t t = cap_count + (cap_count >> 1u);
  return (t < new_count) ? new_count : t;
}

/* L15 — 0x9d8660 growth-target overflow gate (PE 0x009d873d cmp
   ecx,0x15555555 ; ja -> 0x40cee0 throw): UNSIGNED target <= MAX. */
extern "C" int32_t isaac_game_state_9d8660_grow_target_ok(
    uint32_t target) {
  return (target <= ISAAC_GAME_STATE_9D8660_MAX_COUNT) ? 1 : 0;
}

/* L16 — 0x9d8660 copy walk (PE 0x009d8726 cmp eax,edi ; jne; twins
   0x9d8765/0x9d8795): FULL-dword cur != end. */
extern "C" int32_t isaac_game_state_9d8660_copy_more(uint32_t cur,
                                                     uint32_t end) {
  return (cur != end) ? 1 : 0;
}

/* L17 — 0x9d8820 zero-fill entry (PE 0x009d8829 test ecx,ecx ; je
   skip): FULL-dword count != 0 (13-dword slots at 0x34 stride). */
extern "C" int32_t isaac_game_state_9d8820_count_nonzero(uint32_t count) {
  return (count != 0u) ? 1 : 0;
}

/* L18 — 0x9d8820 zero-fill bound (PE 0x009d888d sub ecx,1 ; jne):
   (remaining - 1) != 0 u32 (W16 lane7 / T2 countdown class). */
extern "C" int32_t isaac_game_state_9d8820_loop_more(uint32_t remaining) {
  return ((remaining - 1u) != 0u) ? 1 : 0;
}

/* L19 — 0x9d8a20 element count (PE 0x009d8a43 imul ecx / sar edx,4):
   (int32)(end-begin)/0x34 SIGNED floor (0x4ec4ec4f magic; R16/9d45c0
   element_count_34 twin). */
extern "C" uint32_t isaac_game_state_9d8a20_element_count_0x34(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0x34;
  if (d % 0x34 != 0 && d < 0) q -= 1;
  return (uint32_t)q;
}

/* L20 — 0x9d8a20 input count gate (PE 0x009d8a35 cmp ebx,0x4ec4ec4 ;
   ja -> 0x415bc0 throw): UNSIGNED count <= 0x4ec4ec4. */
extern "C" int32_t isaac_game_state_9d8a20_count_le_cap(uint32_t count) {
  return (count <= ISAAC_GAME_STATE_9D8A20_MAX_COUNT) ? 1 : 0;
}

/* L21 — 0x9d8a20 growth-target overflow gate (PE 0x009d8ad4 cmp
   edi,0x4ec4ec4 ; jbe alloc; ja -> 0x40cee0 throw): UNSIGNED
   target <= 0x4ec4ec4. */
extern "C" int32_t isaac_game_state_9d8a20_grow_target_ok(
    uint32_t target) {
  return (target <= ISAAC_GAME_STATE_9D8A20_MAX_COUNT) ? 1 : 0;
}

/* --- ABI v12 accessors --- */
extern "C" uint32_t isaac_game_state_9d77e0_va(void) { return ISAAC_GAME_STATE_9D77E0_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_end_va(void) { return ISAAC_GAME_STATE_9D77E0_END_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_body_bytes(void) { return ISAAC_GAME_STATE_9D77E0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d77e0_next_va(void) { return ISAAC_GAME_STATE_9D77E0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_stride(void) { return ISAAC_GAME_STATE_9D77E0_STRIDE; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_a_base_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_A_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_a_end_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_A_END_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_b_base_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_B_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_b_end_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_B_END_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_c_base_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_C_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_c_end_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_C_END_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_d_base_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_D_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_d_end_off(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_D_END_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_elem_byte4_off(void) { return ISAAC_GAME_STATE_9D77E0_ELEM_BYTE4_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_elem_byte8_off(void) { return ISAAC_GAME_STATE_9D77E0_ELEM_BYTE8_OFF; }
extern "C" uint32_t isaac_game_state_9d77e0_count_magic(void) { return ISAAC_GAME_STATE_9D77E0_COUNT_0XC_MAGIC; }
extern "C" uint32_t isaac_game_state_9d77e0_count_va(void) { return ISAAC_GAME_STATE_9D77E0_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_count_zero_gate_va(void) { return ISAAC_GAME_STATE_9D77E0_COUNT_ZERO_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_loop_more_va(void) { return ISAAC_GAME_STATE_9D77E0_LOOP_MORE_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_byte4_gate_va(void) { return ISAAC_GAME_STATE_9D77E0_BYTE4_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_byte8_gate_va(void) { return ISAAC_GAME_STATE_9D77E0_BYTE8_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d77e0_caller_count(void) { return ISAAC_GAME_STATE_9D77E0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d77e0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D77E0_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8190_piece_count_off(void) { return ISAAC_GAME_STATE_9D8190_PIECE_COUNT_OFF; }
extern "C" uint32_t isaac_game_state_9d8190_piece_base_off(void) { return ISAAC_GAME_STATE_9D8190_PIECE_BASE_OFF; }
extern "C" uint32_t isaac_game_state_9d8190_piece_stride(void) { return ISAAC_GAME_STATE_9D8190_PIECE_STRIDE; }
extern "C" uint32_t isaac_game_state_9d8190_seed_ptr_off(void) { return ISAAC_GAME_STATE_9D8190_SEED_PTR_OFF; }
extern "C" uint32_t isaac_game_state_9d8190_piece_count_pos_va(void) { return ISAAC_GAME_STATE_9D8190_PIECE_COUNT_POS_VA; }
extern "C" uint32_t isaac_game_state_9d8190_piece_idx_lt_va(void) { return ISAAC_GAME_STATE_9D8190_PIECE_IDX_LT_VA; }
extern "C" uint32_t isaac_game_state_9d8190_45c0_call_va(void) { return ISAAC_GAME_STATE_9D8190_45C0_CALL_VA; }
extern "C" uint32_t isaac_game_state_9d8190_seed_gate_va(void) { return ISAAC_GAME_STATE_9D8190_SEED_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d8190_sso_heap_gate_va(void) { return ISAAC_GAME_STATE_9D8190_SSO_HEAP_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d8190_sso_free_gate_va(void) { return ISAAC_GAME_STATE_9D8190_SSO_FREE_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d8190_checksum_store_va(void) { return ISAAC_GAME_STATE_9D8190_CHECKSUM_STORE_VA; }
extern "C" uint32_t isaac_game_state_9d8190_checksum_xor_va(void) { return ISAAC_GAME_STATE_9D8190_CHECKSUM_XOR_VA; }
extern "C" uint32_t isaac_game_state_9d8190_seed_log_str_va(void) { return ISAAC_GAME_STATE_9D8190_SEED_LOG_STR_VA; }
extern "C" uint32_t isaac_game_state_9d8190_checksum_xor(void) { return ISAAC_GAME_STATE_9D8190_CHECKSUM_XOR; }
extern "C" uint32_t isaac_game_state_9d8190_checksum_off(void) { return ISAAC_GAME_STATE_9D8190_CHECKSUM_OFF; }
extern "C" uint32_t isaac_game_state_9d8660_va(void) { return ISAAC_GAME_STATE_9D8660_VA; }
extern "C" uint32_t isaac_game_state_9d8660_end_va(void) { return ISAAC_GAME_STATE_9D8660_END_VA; }
extern "C" uint32_t isaac_game_state_9d8660_body_bytes(void) { return ISAAC_GAME_STATE_9D8660_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8660_next_va(void) { return ISAAC_GAME_STATE_9D8660_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8660_stride(void) { return ISAAC_GAME_STATE_9D8660_STRIDE; }
extern "C" uint32_t isaac_game_state_9d8660_max_count(void) { return ISAAC_GAME_STATE_9D8660_MAX_COUNT; }
extern "C" uint32_t isaac_game_state_9d8660_count_0xc_va(void) { return ISAAC_GAME_STATE_9D8660_COUNT_0XC_VA; }
extern "C" uint32_t isaac_game_state_9d8660_count_max_gate_va(void) { return ISAAC_GAME_STATE_9D8660_COUNT_MAX_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d8660_grow_max_cmov_va(void) { return ISAAC_GAME_STATE_9D8660_GROW_MAX_CMOV_VA; }
extern "C" uint32_t isaac_game_state_9d8660_grow_target_ok_va(void) { return ISAAC_GAME_STATE_9D8660_GROW_TARGET_OK_VA; }
extern "C" uint32_t isaac_game_state_9d8660_copy_more_va(void) { return ISAAC_GAME_STATE_9D8660_COPY_MORE_VA; }
extern "C" uint32_t isaac_game_state_9d8660_caller_count(void) { return ISAAC_GAME_STATE_9D8660_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8660_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8660_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D8660_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9D8660_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9D8660_CALLER_VA_3;
    case 4: return ISAAC_GAME_STATE_9D8660_CALLER_VA_4;
    case 5: return ISAAC_GAME_STATE_9D8660_CALLER_VA_5;
    case 6: return ISAAC_GAME_STATE_9D8660_CALLER_VA_6;
    case 7: return ISAAC_GAME_STATE_9D8660_CALLER_VA_7;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8820_va(void) { return ISAAC_GAME_STATE_9D8820_VA; }
extern "C" uint32_t isaac_game_state_9d8820_end_va(void) { return ISAAC_GAME_STATE_9D8820_END_VA; }
extern "C" uint32_t isaac_game_state_9d8820_body_bytes(void) { return ISAAC_GAME_STATE_9D8820_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8820_next_va(void) { return ISAAC_GAME_STATE_9D8820_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8820_stride(void) { return ISAAC_GAME_STATE_9D8820_STRIDE; }
extern "C" uint32_t isaac_game_state_9d8820_slot_dwords(void) { return ISAAC_GAME_STATE_9D8820_SLOT_DWORDS; }
extern "C" uint32_t isaac_game_state_9d8820_count_gate_va(void) { return ISAAC_GAME_STATE_9D8820_COUNT_GATE_VA; }
extern "C" uint32_t isaac_game_state_9d8820_loop_more_va(void) { return ISAAC_GAME_STATE_9D8820_LOOP_MORE_VA; }
extern "C" uint32_t isaac_game_state_9d8820_caller_count(void) { return ISAAC_GAME_STATE_9D8820_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8820_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8820_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D8820_CALLER_VA_1;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8a20_va(void) { return ISAAC_GAME_STATE_9D8A20_VA; }
extern "C" uint32_t isaac_game_state_9d8a20_end_va(void) { return ISAAC_GAME_STATE_9D8A20_END_VA; }
extern "C" uint32_t isaac_game_state_9d8a20_body_bytes(void) { return ISAAC_GAME_STATE_9D8A20_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8a20_next_va(void) { return ISAAC_GAME_STATE_9D8A20_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8a20_stride(void) { return ISAAC_GAME_STATE_9D8A20_STRIDE; }
extern "C" uint32_t isaac_game_state_9d8a20_max_count(void) { return ISAAC_GAME_STATE_9D8A20_MAX_COUNT; }
extern "C" uint32_t isaac_game_state_9d8a20_count_0x34_va(void) { return ISAAC_GAME_STATE_9D8A20_COUNT_0X34_VA; }
extern "C" uint32_t isaac_game_state_9d8a20_count_le_cap_va(void) { return ISAAC_GAME_STATE_9D8A20_COUNT_LE_CAP_VA; }
extern "C" uint32_t isaac_game_state_9d8a20_grow_target_ok_va(void) { return ISAAC_GAME_STATE_9D8A20_GROW_TARGET_OK_VA; }
extern "C" uint32_t isaac_game_state_9d8a20_caller_count(void) { return ISAAC_GAME_STATE_9D8A20_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8a20_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8A20_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d45c0_caller_count(void) { return ISAAC_GAME_STATE_9D45C0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d45c0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D45C0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D45C0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9D45C0_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9D45C0_CALLER_VA_3;
    default: return 0;
  }
}

/* --- ABI v13: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 (§4
 *     section-notes/game-state-v13-reserve-leaves/NOTES.md) --- */

/* 9d88a0 count-le-cap (PE 0x009d88ac cmp / 0x009d88b2 ja ->
   0x415bc0 throw): UNSIGNED count <= 0x1fffffff (FULL-dword). */
extern "C" int32_t isaac_game_state_9d88a0_count_le_cap(uint32_t count) {
  return (count <= ISAAC_GAME_STATE_9D88A0_MAX_COUNT) ? 1 : 0;
}

/* 9d88a0 element count (PE 0x009d88c2 sar ecx,3): (int32)(end-begin) >> 3
   — arithmetic-shift floor (9d45c0 count_sar3 twin). */
extern "C" uint32_t isaac_game_state_9d88a0_element_count_8(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 8;
  if (d % 8 != 0 && d < 0) q -= 1; /* sar == floor */
  return (uint32_t)q;
}

/* 9d88a0 growth pre-check (PE 0x009d88d6 cmp / 0x009d88d8 jbe 0x9d8936):
   UNSIGNED cap <= 0x1fffffff - (cap >> 1) — normal 1.5x path; else the
   grow-to-max arm.  (cap>>1) is the LOGICAL shift. */
extern "C" int32_t isaac_game_state_9d88a0_growth_ok(uint32_t cap) {
  uint32_t lim = ISAAC_GAME_STATE_9D88A0_MAX_COUNT - (cap >> 1u);
  return (cap <= lim) ? 1 : 0;
}

/* 9d88a0 grow-target merge (PE 0x009d8939 cmp / 0x009d893b jae keep):
   max(new_count, cap + (cap>>1)) u32 (9d8660_grow_target_count twin). */
extern "C" uint32_t isaac_game_state_9d88a0_grow_target_count(
    uint32_t new_count, uint32_t cap) {
  uint32_t t = cap + (cap >> 1u);
  return (t < new_count) ? new_count : t;
}

/* 9d88a0 grow-target-ok (PE 0x009d8941 cmp / 0x009d8947 jbe alloc; ja ->
   0x40cee0 throw): UNSIGNED target <= 0x1fffffff. */
extern "C" int32_t isaac_game_state_9d88a0_grow_target_ok(uint32_t target) {
  return (target <= ISAAC_GAME_STATE_9D88A0_MAX_COUNT) ? 1 : 0;
}

/* 9d88a0 tail-fill trigger (PE 0x009d88f8 je skip-memset 0xaf05e5):
   ((new_count - old_count) u32) != 0 — FULL-dword subtraction equality. */
extern "C" int32_t isaac_game_state_9d88a0_tail_fill_needed(
    uint32_t new_count, uint32_t old_count) {
  return (new_count - old_count) != 0u ? 1 : 0;
}

/* 9d8960 count-le-cap (PE 0x009d896c cmp / 0x009d8972 ja -> 0x415bc0
   throw): UNSIGNED count <= 0xfffffff. */
extern "C" int32_t isaac_game_state_9d8960_count_le_cap(uint32_t count) {
  return (count <= ISAAC_GAME_STATE_9D8960_MAX_COUNT) ? 1 : 0;
}

/* 9d8960 element count (PE 0x009d8982 sar ecx,4): (int32)(end-begin) >> 4
   — arithmetic-shift floor /0x10. */
extern "C" uint32_t isaac_game_state_9d8960_element_count_16(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 0x10;
  if (d % 0x10 != 0 && d < 0) q -= 1; /* sar == floor */
  return (uint32_t)q;
}

/* 9d8960 growth pre-check (PE 0x009d8996 cmp / 0x009d8998 jbe 0x9d89f5):
   UNSIGNED cap <= 0xfffffff - (cap >> 1). */
extern "C" int32_t isaac_game_state_9d8960_growth_ok(uint32_t cap) {
  uint32_t lim = ISAAC_GAME_STATE_9D8960_MAX_COUNT - (cap >> 1u);
  return (cap <= lim) ? 1 : 0;
}

/* 9d8960 grow-target merge (PE 0x009d89f8 cmp / 0x009d89fa jae keep):
   max(new_count, cap + (cap>>1)) u32. */
extern "C" uint32_t isaac_game_state_9d8960_grow_target_count(
    uint32_t new_count, uint32_t cap) {
  uint32_t t = cap + (cap >> 1u);
  return (t < new_count) ? new_count : t;
}

/* 9d8960 grow-target-ok (PE 0x009d8a00 cmp / 0x009d8a06 jbe alloc; ja ->
   0x40cee0 throw): UNSIGNED target <= 0xfffffff. */
extern "C" int32_t isaac_game_state_9d8960_grow_target_ok(uint32_t target) {
  return (target <= ISAAC_GAME_STATE_9D8960_MAX_COUNT) ? 1 : 0;
}

/* 9d8960 tail-fill trigger (PE 0x009d89bb je skip-memset 0xaf05e5):
   ((new_count - old_count) u32) != 0. */
extern "C" int32_t isaac_game_state_9d8960_tail_fill_needed(
    uint32_t new_count, uint32_t old_count) {
  return (new_count - old_count) != 0u ? 1 : 0;
}

/* 9d8af0 count-le-cap (PE 0x009d8b01 cmp / 0x009d8b07 ja -> 0x415bc0
   throw): UNSIGNED count <= 0x1fffffff. */
extern "C" int32_t isaac_game_state_9d8af0_count_le_cap(uint32_t count) {
  return (count <= ISAAC_GAME_STATE_9D8AF0_MAX_COUNT) ? 1 : 0;
}

/* 9d8af0 element count (PE 0x009d8b17 sar ecx,3): (int32)(end-begin) >> 3
   — arithmetic-shift floor (9d88a0 twin). */
extern "C" uint32_t isaac_game_state_9d8af0_element_count_8(
    uint32_t begin, uint32_t end) {
  int32_t d = (int32_t)(end - begin);
  int32_t q = d / 8;
  if (d % 8 != 0 && d < 0) q -= 1; /* sar == floor */
  return (uint32_t)q;
}

/* 9d8af0 growth pre-check (PE 0x009d8b2b cmp / 0x009d8b2d jbe 0x9d8bb4):
   UNSIGNED cap <= 0x1fffffff - (cap >> 1). */
extern "C" int32_t isaac_game_state_9d8af0_growth_ok(uint32_t cap) {
  uint32_t lim = ISAAC_GAME_STATE_9D8AF0_MAX_COUNT - (cap >> 1u);
  return (cap <= lim) ? 1 : 0;
}

/* 9d8af0 grow-target merge (PE 0x009d8bb7 cmp / 0x009d8bb9 jae keep):
   max(new_count, cap + (cap>>1)) u32. */
extern "C" uint32_t isaac_game_state_9d8af0_grow_target_count(
    uint32_t new_count, uint32_t cap) {
  uint32_t t = cap + (cap >> 1u);
  return (t < new_count) ? new_count : t;
}

/* 9d8af0 grow-target-ok (PE 0x009d8bc2 cmp / 0x009d8bc8 jbe alloc; ja ->
   0x40cee0 throw): UNSIGNED target <= 0x1fffffff. */
extern "C" int32_t isaac_game_state_9d8af0_grow_target_ok(uint32_t target) {
  return (target <= ISAAC_GAME_STATE_9D8AF0_MAX_COUNT) ? 1 : 0;
}

/* 9d8af0 tail-init trigger (PE 0x009d8b51 sub / 0x009d8b53 je skip-init):
   ((new_count - old_count) u32) != 0 -> INLINE {0,0xffffffff} slot init. */
extern "C" int32_t isaac_game_state_9d8af0_tail_init_needed(
    uint32_t new_count, uint32_t old_count) {
  return (new_count - old_count) != 0u ? 1 : 0;
}

/* 9d8af0 tail-init loop bound (PE 0x009d8b70 sub,1 / 0x009d8b73 jne):
   ((remaining - 1) != 0) u32 countdown (W16 lane7 / T2 / X1 class). */
extern "C" int32_t isaac_game_state_9d8af0_tail_init_more(
    uint32_t remaining) {
  return (remaining - 1u) != 0u ? 1 : 0;
}

/* 9d8af0 copy-entry gate (PE 0x009d8b80 cmp / 0x009d8b82 je skip-copy):
   FULL-dword begin != end (old range non-empty). */
extern "C" int32_t isaac_game_state_9d8af0_copy_needed(uint32_t begin,
                                                       uint32_t end) {
  return (begin != end) ? 1 : 0;
}

/* 9d8af0 8-byte copy walk bound (PE 0x009d8b97 cmp / 0x009d8b99 jne):
   FULL-dword cur != end (9d8660_copy_more shape). */
extern "C" int32_t isaac_game_state_9d8af0_copy_more(uint32_t cur,
                                                     uint32_t end) {
  return (cur != end) ? 1 : 0;
}

/* --- ABI v13 accessors: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 --- */
extern "C" uint32_t isaac_game_state_9d88a0_va(void) { return ISAAC_GAME_STATE_9D88A0_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_end_va(void) { return ISAAC_GAME_STATE_9D88A0_END_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_body_bytes(void) { return ISAAC_GAME_STATE_9D88A0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d88a0_next_va(void) { return ISAAC_GAME_STATE_9D88A0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_stride(void) { return ISAAC_GAME_STATE_9D88A0_STRIDE; }
extern "C" uint32_t isaac_game_state_9d88a0_max_count(void) { return ISAAC_GAME_STATE_9D88A0_MAX_COUNT; }
extern "C" uint32_t isaac_game_state_9d88a0_count_le_cap_va(void) { return ISAAC_GAME_STATE_9D88A0_COUNT_LE_CAP_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_count_va(void) { return ISAAC_GAME_STATE_9D88A0_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_growth_ok_va(void) { return ISAAC_GAME_STATE_9D88A0_GROWTH_OK_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_grow_target_count_va(void) { return ISAAC_GAME_STATE_9D88A0_GROW_TARGET_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_grow_target_ok_va(void) { return ISAAC_GAME_STATE_9D88A0_GROW_TARGET_OK_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_tail_fill_needed_va(void) { return ISAAC_GAME_STATE_9D88A0_TAIL_FILL_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9d88a0_caller_count(void) { return ISAAC_GAME_STATE_9D88A0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d88a0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D88A0_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8960_va(void) { return ISAAC_GAME_STATE_9D8960_VA; }
extern "C" uint32_t isaac_game_state_9d8960_end_va(void) { return ISAAC_GAME_STATE_9D8960_END_VA; }
extern "C" uint32_t isaac_game_state_9d8960_body_bytes(void) { return ISAAC_GAME_STATE_9D8960_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8960_next_va(void) { return ISAAC_GAME_STATE_9D8960_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8960_stride(void) { return ISAAC_GAME_STATE_9D8960_STRIDE; }
extern "C" uint32_t isaac_game_state_9d8960_max_count(void) { return ISAAC_GAME_STATE_9D8960_MAX_COUNT; }
extern "C" uint32_t isaac_game_state_9d8960_count_le_cap_va(void) { return ISAAC_GAME_STATE_9D8960_COUNT_LE_CAP_VA; }
extern "C" uint32_t isaac_game_state_9d8960_count_va(void) { return ISAAC_GAME_STATE_9D8960_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d8960_growth_ok_va(void) { return ISAAC_GAME_STATE_9D8960_GROWTH_OK_VA; }
extern "C" uint32_t isaac_game_state_9d8960_grow_target_count_va(void) { return ISAAC_GAME_STATE_9D8960_GROW_TARGET_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d8960_grow_target_ok_va(void) { return ISAAC_GAME_STATE_9D8960_GROW_TARGET_OK_VA; }
extern "C" uint32_t isaac_game_state_9d8960_tail_fill_needed_va(void) { return ISAAC_GAME_STATE_9D8960_TAIL_FILL_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9d8960_caller_count(void) { return ISAAC_GAME_STATE_9D8960_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8960_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8960_CALLER_VA_0;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8af0_va(void) { return ISAAC_GAME_STATE_9D8AF0_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_end_va(void) { return ISAAC_GAME_STATE_9D8AF0_END_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_body_bytes(void) { return ISAAC_GAME_STATE_9D8AF0_BODY_BYTES; }
extern "C" uint32_t isaac_game_state_9d8af0_next_va(void) { return ISAAC_GAME_STATE_9D8AF0_NEXT_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_stride(void) { return ISAAC_GAME_STATE_9D8AF0_STRIDE; }
extern "C" uint32_t isaac_game_state_9d8af0_max_count(void) { return ISAAC_GAME_STATE_9D8AF0_MAX_COUNT; }
extern "C" uint32_t isaac_game_state_9d8af0_count_le_cap_va(void) { return ISAAC_GAME_STATE_9D8AF0_COUNT_LE_CAP_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_count_va(void) { return ISAAC_GAME_STATE_9D8AF0_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_growth_ok_va(void) { return ISAAC_GAME_STATE_9D8AF0_GROWTH_OK_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_grow_target_count_va(void) { return ISAAC_GAME_STATE_9D8AF0_GROW_TARGET_COUNT_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_grow_target_ok_va(void) { return ISAAC_GAME_STATE_9D8AF0_GROW_TARGET_OK_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_tail_init_needed_va(void) { return ISAAC_GAME_STATE_9D8AF0_TAIL_INIT_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_tail_init_more_va(void) { return ISAAC_GAME_STATE_9D8AF0_TAIL_INIT_MORE_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_copy_needed_va(void) { return ISAAC_GAME_STATE_9D8AF0_COPY_NEEDED_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_copy_more_va(void) { return ISAAC_GAME_STATE_9D8AF0_COPY_MORE_VA; }
extern "C" uint32_t isaac_game_state_9d8af0_caller_count(void) { return ISAAC_GAME_STATE_9D8AF0_CALLER_COUNT; }
extern "C" uint32_t isaac_game_state_9d8af0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8AF0_CALLER_VA_0;
    default: return 0;
  }
}

/* --- ABI v14: 0x9d8be0 g_Manager can-save mode --- */

/* G1 PE 0x009d8be6 cmp byte [ecx+0x2c9],0 ; jne ret2. LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d8be0_byte_2c9_nz(uint32_t mgr_2c9) {
  return ((mgr_2c9 & 0xffu) != 0u) ? 1 : 0;
}

/* G2 PE 0x009d8bfb cmp edx,2 ; jne. FULL-dword. */
extern "C" int32_t isaac_game_state_9d8be0_mode_eq_2(uint32_t mgr_8) {
  return (mgr_8 == ISAAC_GAME_STATE_9D8BE0_MODE_2) ? 1 : 0;
}

/* G3 PE 0x009d8c00 test eax,eax ; je. FULL-dword. */
extern "C" int32_t isaac_game_state_9d8be0_game_nonzero(uint32_t game) {
  return (game != 0u) ? 1 : 0;
}

/* G4 PE 0x009d8c04 cmp dword [eax+0x26630],0 ; ja. UNSIGNED != 0. */
extern "C" int32_t isaac_game_state_9d8be0_dword_26630_busy(
    uint32_t game_26630) {
  return (game_26630 != 0u) ? 1 : 0;
}

/* G5 PE 0x009d8c11 cmp byte [eax+0x26589],0 ; jne. LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d8be0_byte_26589_nz(
    uint32_t game_26589) {
  return ((game_26589 & 0xffu) != 0u) ? 1 : 0;
}

/* G6 PE 0x009d8c1a cmp byte [ecx+0x19f],0 ; jne. LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d8be0_byte_19f_nz(uint32_t mgr_19f) {
  return ((mgr_19f & 0xffu) != 0u) ? 1 : 0;
}

/* G7 PE 0x009d8c5c cmp dword [ecx+0xa80],0 ; ja. UNSIGNED != 0. */
extern "C" int32_t isaac_game_state_9d8be0_dword_a80_busy(uint32_t mgr_a80) {
  return (mgr_a80 != 0u) ? 1 : 0;
}

/* G8 PE 0x009d8c65 cmp dword [ecx+0xf18],0 ; jg. SIGNED > 0. */
extern "C" int32_t isaac_game_state_9d8be0_dword_f18_positive(
    uint32_t mgr_f18) {
  return ((int64_t)(int32_t)mgr_f18 > (int64_t)0) ? 1 : 0;
}

/* G9 PE 0x009d8c6e cmp byte [ecx+0x2c7],0 ; jne. LOW-BYTE. */
extern "C" int32_t isaac_game_state_9d8be0_byte_2c7_nz(uint32_t mgr_2c7) {
  return ((mgr_2c7 & 0xffu) != 0u) ? 1 : 0;
}

/* Composed PE CFG 0x9d8be0..0x9d8c97. Returns AL in {0,1,2}. */
extern "C" uint32_t isaac_game_state_9d8be0_can_save_mode(
    uint32_t mgr_2c9, uint32_t mgr_8, uint32_t game,
    uint32_t game_26630, uint32_t game_26589, uint32_t mgr_19f,
    uint32_t mgr_a80, uint32_t mgr_f18, uint32_t mgr_2c7) {
  /* v14: cmp byte [ecx+0x2c9],0 ; jne ret2 — LOW-BYTE */
  const uint32_t b2c9 = mgr_2c9 & 0xffu;
  const uint32_t b26589 = game_26589 & 0xffu;
  const uint32_t b19f = mgr_19f & 0xffu;
  const uint32_t b2c7 = mgr_2c7 & 0xffu;
  if (b2c9 != 0u) {
    return 2u;
  }
  /* v14: cmp edx,2 FULL-dword (0x102 must NOT take the greed arm) */
  if (mgr_8 == ISAAC_GAME_STATE_9D8BE0_MODE_2) {
    if (game != 0u) {
      if (game_26630 != 0u) {
        return 2u;
      }
      if (b26589 != 0u) {
        return 2u;
      }
    }
  }
  int32_t at_c46 = 0;
  /* v14: cmp byte [ecx+0x19f],0 ; je ret0-arm — LOW-BYTE */
  if (b19f == 0u) {
    if (mgr_8 != ISAAC_GAME_STATE_9D8BE0_MODE_2) {
      return 0u;
    }
    if (game == 0u) {
      return 0u;
    }
    if (game_26630 != 0u || b26589 != 0u) {
      at_c46 = 1;
    } else {
      return 0u;
    }
  } else if (mgr_8 == ISAAC_GAME_STATE_9D8BE0_MODE_2) {
    at_c46 = 1;
  }
  if (at_c46 != 0) {
    if (game != 0u) {
      if (game_26630 != 0u) {
        return 0u;
      }
      if (b26589 != 0u) {
        return 0u;
      }
    }
  }
  if (mgr_a80 != 0u) {
    return 0u;
  }
  /* v14: cmp dword [ecx+0xf18],0 ; jg ret0 — SIGNED */
  if ((int64_t)(int32_t)mgr_f18 > (int64_t)0) {
    return 0u;
  }
  if (b2c7 != 0u) {
    return 0u;
  }
  if (mgr_8 != ISAAC_GAME_STATE_9D8BE0_MODE_2) {
    return 1u;
  }
  if (game == 0u) {
    return 1u;
  }
  if (game_26630 != 0u) {
    return 0u;
  }
  if (b26589 != 0u) {
    return 0u;
  }
  return 1u;
}

extern "C" uint32_t isaac_game_state_9d8be0_va(void) {
  return ISAAC_GAME_STATE_9D8BE0_VA;
}
extern "C" uint32_t isaac_game_state_9d8be0_end_va(void) {
  return ISAAC_GAME_STATE_9D8BE0_END_VA;
}
extern "C" uint32_t isaac_game_state_9d8be0_body_bytes(void) {
  return ISAAC_GAME_STATE_9D8BE0_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9d8be0_next_va(void) {
  return ISAAC_GAME_STATE_9D8BE0_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9d8be0_insn_count(void) {
  return ISAAC_GAME_STATE_9D8BE0_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9d8be0_caller_count(void) {
  return ISAAC_GAME_STATE_9D8BE0_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9d8be0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8BE0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D8BE0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9D8BE0_CALLER_VA_2;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8be0_mgr_global(void) {
  return ISAAC_GAME_STATE_9D8BE0_MGR_GLOBAL;
}
extern "C" uint32_t isaac_game_state_9d8be0_game_global(void) {
  return ISAAC_GAME_STATE_9D8BE0_GAME_GLOBAL;
}
extern "C" uint32_t isaac_game_state_9d8be0_off_2c9(void) {
  return ISAAC_GAME_STATE_9D8BE0_OFF_2C9;
}
extern "C" uint32_t isaac_game_state_9d8be0_off_f18(void) {
  return ISAAC_GAME_STATE_9D8BE0_OFF_F18;
}
extern "C" uint32_t isaac_game_state_9d8be0_byte_2c9_va(void) {
  return ISAAC_GAME_STATE_9D8BE0_BYTE_2C9_VA;
}
extern "C" uint32_t isaac_game_state_9d8be0_dword_f18_va(void) {
  return ISAAC_GAME_STATE_9D8BE0_DWORD_F18_VA;
}

/* --- ABI v15: 0x9d8ca0 Manager+0x2d0 flag scan --- */

static const uint32_t kIsaacGameState9d8ca0Table[12] = {
    ISAAC_GAME_STATE_9D8CA0_TABLE_0,  ISAAC_GAME_STATE_9D8CA0_TABLE_1,
    ISAAC_GAME_STATE_9D8CA0_TABLE_2,  ISAAC_GAME_STATE_9D8CA0_TABLE_3,
    ISAAC_GAME_STATE_9D8CA0_TABLE_4,  ISAAC_GAME_STATE_9D8CA0_TABLE_5,
    ISAAC_GAME_STATE_9D8CA0_TABLE_6,  ISAAC_GAME_STATE_9D8CA0_TABLE_7,
    ISAAC_GAME_STATE_9D8CA0_TABLE_8,  ISAAC_GAME_STATE_9D8CA0_TABLE_9,
    ISAAC_GAME_STATE_9D8CA0_TABLE_10, ISAAC_GAME_STATE_9D8CA0_TABLE_11};

/* v15: cmp edi,0x14 ; je success */
extern "C" int32_t isaac_game_state_9d8ca0_outer_done(uint32_t edi) {
  return (edi == ISAAC_GAME_STATE_9D8CA0_OUTER_COUNT) ? 1 : 0;
}

/* v15: cmp edx,0xc375e0 ; jge skip — SIGNED */
extern "C" int32_t isaac_game_state_9d8ca0_edx_ge_end(uint32_t edx) {
  return ((int64_t)(int32_t)edx >=
          (int64_t)(int32_t)ISAAC_GAME_STATE_9D8CA0_ROW_END)
             ? 1
             : 0;
}

extern "C" int32_t isaac_game_state_9d8ca0_edx_is_null(uint32_t edx) {
  return (edx == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_state_9d8ca0_skip_cell_load(uint32_t edx) {
  return (isaac_game_state_9d8ca0_edx_ge_end(edx) != 0 ||
          isaac_game_state_9d8ca0_edx_is_null(edx) != 0)
             ? 1
             : 0;
}

/* v15: cmp eax,0xc ; jb inner — UNSIGNED */
extern "C" int32_t isaac_game_state_9d8ca0_inner_more(uint32_t eax) {
  return (eax < ISAAC_GAME_STATE_9D8CA0_INNER_COUNT) ? 1 : 0;
}

extern "C" uint32_t isaac_game_state_9d8ca0_table_index(uint32_t eax) {
  if (eax >= ISAAC_GAME_STATE_9D8CA0_TABLE_COUNT) {
    return 0u;
  }
  return kIsaacGameState9d8ca0Table[eax];
}

/* v15: test byte,0xc ; je fail — LOW-BYTE then mask 0xc */
extern "C" int32_t isaac_game_state_9d8ca0_flag_ok(uint32_t byte) {
  const uint32_t b = byte & 0xffu;
  return ((b & ISAAC_GAME_STATE_9D8CA0_FLAG_MASK) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_state_9d8ca0_row_next(uint32_t edx) {
  return edx + ISAAC_GAME_STATE_9D8CA0_ROW_STRIDE;
}

extern "C" uint32_t isaac_game_state_9d8ca0_cell_ecx(uint32_t edx,
                                                    uint32_t loaded) {
  if (isaac_game_state_9d8ca0_skip_cell_load(edx) != 0) {
    return 0u;
  }
  return loaded;
}

extern "C" uint32_t isaac_game_state_9d8ca0_byte_off(uint32_t ecx) {
  return ecx * 4u + ISAAC_GAME_STATE_9D8CA0_BYTE_OFF;
}

/* After inner: add edx,0x90 ; inc edi ; cmp edx,end ; jl outer else AL=1.
   Outer head: cmp edi,0x14 ; je AL=1. Returns 1 = success, 0 = more rows. */
extern "C" uint32_t isaac_game_state_9d8ca0_after_row(uint32_t edi,
                                                     uint32_t edx) {
  const uint32_t edx2 = edx + ISAAC_GAME_STATE_9D8CA0_ROW_STRIDE;
  const uint32_t edi2 = edi + 1u;
  if ((int64_t)(int32_t)edx2 <
      (int64_t)(int32_t)ISAAC_GAME_STATE_9D8CA0_ROW_END) {
    if (edi2 == ISAAC_GAME_STATE_9D8CA0_OUTER_COUNT) {
      return 1u;
    }
    return 0u;
  }
  return 1u;
}

extern "C" uint32_t isaac_game_state_9d8ca0_va(void) {
  return ISAAC_GAME_STATE_9D8CA0_VA;
}
extern "C" uint32_t isaac_game_state_9d8ca0_end_va(void) {
  return ISAAC_GAME_STATE_9D8CA0_END_VA;
}
extern "C" uint32_t isaac_game_state_9d8ca0_body_bytes(void) {
  return ISAAC_GAME_STATE_9D8CA0_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9d8ca0_next_va(void) {
  return ISAAC_GAME_STATE_9D8CA0_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9d8ca0_insn_count(void) {
  return ISAAC_GAME_STATE_9D8CA0_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9d8ca0_caller_count(void) {
  return ISAAC_GAME_STATE_9D8CA0_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9d8ca0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9D8CA0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9D8CA0_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9D8CA0_CALLER_VA_2;
    default: return 0;
  }
}
extern "C" uint32_t isaac_game_state_9d8ca0_row_end(void) {
  return ISAAC_GAME_STATE_9D8CA0_ROW_END;
}
extern "C" uint32_t isaac_game_state_9d8ca0_flag_mask(void) {
  return ISAAC_GAME_STATE_9D8CA0_FLAG_MASK;
}

/* --- ABI v16: 0x9dc6e0 zero-init ctor (K1/K2/K3) --- */

static const uint32_t kIsaacGameState9dc6e0ZeroOff[ISAAC_GAME_STATE_9DC6E0_ZERO_COUNT] = {
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_0,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_1,
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_2,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_3,
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_4,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_5,
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_6,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_7,
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_8,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_9,
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_10, ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_11,
    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_12,
};

/* K1 PE sites 0x9dc6e0/0x9dc6e8/0x9dc6f6/0x9dc6fd/0x9dc704/0x9dc70b/
   0x9dc712/0x9dc719/0x9dc720/0x9dc727/0x9dc72e/0x9dc735/0x9dc73c:
   mov dword ptr [ecx+N],0 — FULL-dword u32 LE zero stores. */
extern "C" void isaac_game_state_9dc6e0_zero_dwords(uint8_t* mem,
                                                    uint32_t this_off) {
  for (uint32_t i = 0; i < ISAAC_GAME_STATE_9DC6E0_ZERO_COUNT; ++i) {
    const uint32_t addr = this_off + kIsaacGameState9dc6e0ZeroOff[i];
    mem[addr + 0u] = 0x00u;
    mem[addr + 1u] = 0x00u;
    mem[addr + 2u] = 0x00u;
    mem[addr + 3u] = 0x00u;
  }
}

/* K2 PE 0x9dc6ef: mov dword ptr [ecx+0x08],0x12345678 — FULL-dword u32 LE. */
extern "C" void isaac_game_state_9dc6e0_magic_stamp(uint8_t* mem,
                                                    uint32_t this_off) {
  const uint32_t addr = this_off + ISAAC_GAME_STATE_9DC6E0_MAGIC_OFF;
  const uint32_t v = ISAAC_GAME_STATE_9DC6E0_MAGIC;
  mem[addr + 0u] = static_cast<uint8_t>((v >> 0) & 0xffu);
  mem[addr + 1u] = static_cast<uint8_t>((v >> 8) & 0xffu);
  mem[addr + 2u] = static_cast<uint8_t>((v >> 16) & 0xffu);
  mem[addr + 3u] = static_cast<uint8_t>((v >> 24) & 0xffu);
}

/* K3 PE 0x9dc6e6 mov eax,ecx + bare ret @0x9dc743: returns the receiver. */
extern "C" uint32_t isaac_game_state_9dc6e0_return_this(uint32_t this_off) {
  return this_off;
}

extern "C" uint32_t isaac_game_state_9dc6e0_va(void) {
  return ISAAC_GAME_STATE_9DC6E0_VA;
}
extern "C" uint32_t isaac_game_state_9dc6e0_end_va(void) {
  return ISAAC_GAME_STATE_9DC6E0_END_VA;
}
extern "C" uint32_t isaac_game_state_9dc6e0_body_bytes(void) {
  return ISAAC_GAME_STATE_9DC6E0_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9dc6e0_next_va(void) {
  return ISAAC_GAME_STATE_9DC6E0_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9dc6e0_insn_count(void) {
  return ISAAC_GAME_STATE_9DC6E0_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9dc6e0_new_va(void) {
  return ISAAC_GAME_STATE_9DC6E0_NEW_VA;
}
extern "C" uint32_t isaac_game_state_9dc6e0_obj_size(void) {
  return ISAAC_GAME_STATE_9DC6E0_OBJ_SIZE;
}
extern "C" uint32_t isaac_game_state_9dc6e0_magic(void) {
  return ISAAC_GAME_STATE_9DC6E0_MAGIC;
}
extern "C" uint32_t isaac_game_state_9dc6e0_magic_off(void) {
  return ISAAC_GAME_STATE_9DC6E0_MAGIC_OFF;
}
extern "C" uint32_t isaac_game_state_9dc6e0_store_count(void) {
  return ISAAC_GAME_STATE_9DC6E0_STORE_COUNT;
}
extern "C" uint32_t isaac_game_state_9dc6e0_zero_count(void) {
  return ISAAC_GAME_STATE_9DC6E0_ZERO_COUNT;
}
extern "C" uint32_t isaac_game_state_9dc6e0_caller_count(void) {
  return ISAAC_GAME_STATE_9DC6E0_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9dc6e0_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9DC6E0_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9DC6E0_CALLER_VA_1;
    default: return 0u;
  }
}

/* --- ABI v17: 0x9e0150 complement-index vector fetch (O1/O2/O3) --- */

/* u32 LE load at a u32-wrapping address (P5/P8 mem-law class). */
static uint32_t isaac_game_state_9e0150_load_u32(const uint8_t* mem,
                                                 uint32_t addr) {
  if (mem == nullptr) {
    return 0u;
  }
  const uint8_t* p = mem + addr;
  return static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

/* O1 PE sites 0x9e0156 (not edx, FULL-dword NOT) + 0x9e0159 (test
   edx,edx) + 0x9e015b (js): SIGNED (~v) >= 0 passes to the count gate. */
extern "C" int32_t isaac_game_state_9e0150_not_nonneg(uint32_t v) {
  const uint32_t idx = ~v;
  return ((int64_t)(int32_t)idx >= 0) ? 1 : 0;
}

/* O2 PE sites 0x9e0162 (sub eax,esi) + 0x9e0164 (sar eax,2) +
   0x9e0167 (cmp edx,eax) + 0x9e0169 (jge): SIGNED idx < count where
   count = arithmetic (end-begin)>>2 over the u32-wrapped span. */
extern "C" int32_t isaac_game_state_9e0150_idx_lt_count(uint32_t v,
                                                        uint32_t begin,
                                                        uint32_t end) {
  const uint32_t idx = ~v;
  const int32_t count = static_cast<int32_t>(end - begin) >> 2;
  return ((int64_t)(int32_t)idx < (int64_t)count) ? 1 : 0;
}

/* O3 PE sites 0x9e015d/0x9e0160 (begin/end loads) + 0x9e016b (inner
   mov eax,[esi+edx*4]) + 0x9e016f (outer mov eax,[eax]): composite
   double-deref fetch; js @0x9e015b -> 0 first, then jge @0x9e0169. */
extern "C" uint32_t isaac_game_state_9e0150_fetch(const uint8_t* mem,
                                                  uint32_t vec_off,
                                                  uint32_t v) {
  const uint32_t idx = ~v; /* not @0x9e0156 */
  if ((int64_t)(int32_t)idx < 0) {
    return 0u; /* js @0x9e015b */
  }
  const uint32_t begin = isaac_game_state_9e0150_load_u32(mem, vec_off);
  const uint32_t end = isaac_game_state_9e0150_load_u32(mem, vec_off + 4u);
  const int32_t count = static_cast<int32_t>(end - begin) >> 2; /* sar @0x9e0164 */
  if ((int64_t)(int32_t)idx >= (int64_t)count) {
    return 0u; /* jge @0x9e0169 */
  }
  const uint32_t elem =
      isaac_game_state_9e0150_load_u32(mem, begin + idx * 4u); /* inner @0x9e016b */
  return isaac_game_state_9e0150_load_u32(mem, elem); /* outer @0x9e016f */
}

extern "C" uint32_t isaac_game_state_9e0150_va(void) {
  return ISAAC_GAME_STATE_9E0150_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_end_va(void) {
  return ISAAC_GAME_STATE_9E0150_END_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_body_bytes(void) {
  return ISAAC_GAME_STATE_9E0150_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9e0150_next_va(void) {
  return ISAAC_GAME_STATE_9E0150_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_insn_count(void) {
  return ISAAC_GAME_STATE_9E0150_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9e0150_not_va(void) {
  return ISAAC_GAME_STATE_9E0150_NOT_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_js_gate_va(void) {
  return ISAAC_GAME_STATE_9E0150_JS_GATE_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_sub_va(void) {
  return ISAAC_GAME_STATE_9E0150_SUB_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_sar_va(void) {
  return ISAAC_GAME_STATE_9E0150_SAR_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_cmp_va(void) {
  return ISAAC_GAME_STATE_9E0150_CMP_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_jge_gate_va(void) {
  return ISAAC_GAME_STATE_9E0150_JGE_GATE_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_inner_load_va(void) {
  return ISAAC_GAME_STATE_9E0150_INNER_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_outer_load_va(void) {
  return ISAAC_GAME_STATE_9E0150_OUTER_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_ret_ok_va(void) {
  return ISAAC_GAME_STATE_9E0150_RET_OK_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_ret_null_va(void) {
  return ISAAC_GAME_STATE_9E0150_RET_NULL_VA;
}
extern "C" uint32_t isaac_game_state_9e0150_caller_count(void) {
  return ISAAC_GAME_STATE_9E0150_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9e0150_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9E0150_CALLER_VA_0;
    default: return 0u;
  }
}

/* --- ABI v18: 0x9e0180 complement-index element fetch (P1/P2/P3) --- */

/* u32 LE load at a u32-wrapping address (P5/P8 mem-law class). */
static uint32_t isaac_game_state_9e0180_load_u32(const uint8_t* mem,
                                                 uint32_t addr) {
  if (mem == nullptr) {
    return 0u;
  }
  const uint8_t* p = mem + addr;
  return static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

/* P1 PE sites 0x9e0186 (not eax, FULL-dword NOT) + 0x9e0188 (test
   eax,eax) + 0x9e018a (js): SIGNED (~v) >= 0 passes to the count gate. */
extern "C" int32_t isaac_game_state_9e0180_not_nonneg(uint32_t v) {
  const uint32_t idx = ~v;
  return ((int64_t)(int32_t)idx >= 0) ? 1 : 0;
}

/* P2 PE sites 0x9e0191 (sub ecx,edx) + 0x9e0193 (sar ecx,2) +
   0x9e0196 (cmp eax,ecx) + 0x9e0198 (jge): SIGNED idx < count where
   count = arithmetic (end-begin)>>2 over the u32-wrapped span. */
extern "C" int32_t isaac_game_state_9e0180_idx_lt_count(uint32_t v,
                                                        uint32_t begin,
                                                        uint32_t end) {
  const uint32_t idx = ~v;
  const int32_t count = static_cast<int32_t>(end - begin) >> 2;
  return ((int64_t)(int32_t)idx < (int64_t)count) ? 1 : 0;
}

/* P3 PE sites 0x9e018c/0x9e018e (begin/end loads) + 0x9e019a (mov
   eax,[edx+eax*4]): composite element fetch, SINGLE deref (twin of O3
   minus the outer load); js @0x9e018a -> 0 first, then jge @0x9e0198. */
extern "C" uint32_t isaac_game_state_9e0180_elem_fetch(const uint8_t* mem,
                                                       uint32_t vec_off,
                                                       uint32_t v) {
  const uint32_t idx = ~v; /* not @0x9e0186 */
  if ((int64_t)(int32_t)idx < 0) {
    return 0u; /* js @0x9e018a */
  }
  const uint32_t begin = isaac_game_state_9e0180_load_u32(mem, vec_off);
  const uint32_t end = isaac_game_state_9e0180_load_u32(mem, vec_off + 4u);
  const int32_t count = static_cast<int32_t>(end - begin) >> 2; /* sar @0x9e0193 */
  if ((int64_t)(int32_t)idx >= (int64_t)count) {
    return 0u; /* jge @0x9e0198 */
  }
  return isaac_game_state_9e0180_load_u32(mem, begin + idx * 4u); /* elem @0x9e019a */
}

extern "C" uint32_t isaac_game_state_9e0180_va(void) {
  return ISAAC_GAME_STATE_9E0180_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_end_va(void) {
  return ISAAC_GAME_STATE_9E0180_END_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_body_bytes(void) {
  return ISAAC_GAME_STATE_9E0180_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9e0180_next_va(void) {
  return ISAAC_GAME_STATE_9E0180_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_insn_count(void) {
  return ISAAC_GAME_STATE_9E0180_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9e0180_not_va(void) {
  return ISAAC_GAME_STATE_9E0180_NOT_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_js_gate_va(void) {
  return ISAAC_GAME_STATE_9E0180_JS_GATE_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_sub_va(void) {
  return ISAAC_GAME_STATE_9E0180_SUB_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_sar_va(void) {
  return ISAAC_GAME_STATE_9E0180_SAR_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_cmp_va(void) {
  return ISAAC_GAME_STATE_9E0180_CMP_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_jge_gate_va(void) {
  return ISAAC_GAME_STATE_9E0180_JGE_GATE_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_elem_load_va(void) {
  return ISAAC_GAME_STATE_9E0180_ELEM_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_ret_ok_va(void) {
  return ISAAC_GAME_STATE_9E0180_RET_OK_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_ret_null_va(void) {
  return ISAAC_GAME_STATE_9E0180_RET_NULL_VA;
}
extern "C" uint32_t isaac_game_state_9e0180_caller_count(void) {
  return ISAAC_GAME_STATE_9E0180_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9e0180_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9E0180_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9E0180_CALLER_VA_1;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_game_state_9e0180_game_vec_off(void) {
  return ISAAC_GAME_STATE_9E0180_GAME_VEC_OFF;
}

/* --- ABI v19: 0x9e0650 forward-index BYTE getter (X1..X5) --- */

/* Zero-extending byte load at a u32-wrapping address (the PE movzx
   @0x9e0667 reads ONE byte; null mem mirrors the v17 load helper). */
static uint8_t isaac_game_state_9e0650_load_u8(const uint8_t* mem,
                                               uint32_t addr) {
  if (mem == nullptr) {
    return 0u;
  }
  return mem[addr];
}

/* X1 PE sites 0x9e0657 (test edx,edx) + 0x9e0659 (js): SIGNED
   idx >= 0 passes to the span gate. */
extern "C" int32_t isaac_game_state_9e0650_forward_index_guard(int32_t idx) {
  return ((int64_t)idx >= 0) ? 1 : 0;
}

/* X2 PE sites 0x9e065b/0x9e065e (mov eax,[ecx+0x10] /
   mov esi,[ecx+0xc]) + 0x9e0661 (sub eax,esi): u32-wrapped BYTE-unit
   difference — NO shift. */
extern "C" uint32_t isaac_game_state_9e0650_byte_span_size(uint32_t begin,
                                                           uint32_t end) {
  return end - begin;
}

/* X3 PE sites 0x9e0663 (cmp edx,eax) + 0x9e0665 (jge): the jge takes
   the ZERO path when SIGNED(idx) >= SIGNED(n), so the law returns 1
   iff the hit-side bound holds. The span subtract wraps u32 and the
   compare is signed on BOTH sides. */
extern "C" int32_t isaac_game_state_9e0650_bounds_check(int32_t idx,
                                                        uint32_t begin,
                                                        uint32_t end) {
  return ((int64_t)idx < (int64_t)(int32_t)(end - begin)) ? 1 : 0;
}

/* X4/X5 PE sites 0x9e065b..0x9e0674: js @0x9e0659 -> 0 first, then
   jge @0x9e0665 -> 0; hit path movzx byte [begin+idx] @0x9e0667
   through ret 4 @0x9e066d; zero path xor eax,eax @0x9e0670 + ret 4
   @0x9e0674. Loads reuse the TU-local 9e0150 u32 LE helper (generic
   mem-law, same class). */
extern "C" uint32_t isaac_game_state_9e0650_byte_getter(const uint8_t* mem,
                                                        uint32_t this_off,
                                                        int32_t idx) {
  if ((int64_t)idx < 0) {
    return 0u; /* js @0x9e0659 */
  }
  const uint32_t base = this_off;
  const uint32_t begin = isaac_game_state_9e0150_load_u32(
      mem, base + ISAAC_GAME_STATE_9E0650_BEGIN_OFF);
  const uint32_t end = isaac_game_state_9e0150_load_u32(
      mem, base + ISAAC_GAME_STATE_9E0650_END_OFF);
  const int32_t n =
      static_cast<int32_t>(end - begin); /* sub @0x9e0661 — NO shift */
  if ((int64_t)idx >= (int64_t)n) {
    return 0u; /* jge @0x9e0665 */
  }
  const uint32_t addr = begin + static_cast<uint32_t>(idx); /* u32 wrap */
  return isaac_game_state_9e0650_load_u8(mem, addr);        /* movzx @0x9e0667 */
}

extern "C" uint32_t isaac_game_state_9e0650_va(void) {
  return ISAAC_GAME_STATE_9E0650_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_end_va(void) {
  return ISAAC_GAME_STATE_9E0650_END_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_body_bytes(void) {
  return ISAAC_GAME_STATE_9E0650_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9e0650_next_va(void) {
  return ISAAC_GAME_STATE_9E0650_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_insn_count(void) {
  return ISAAC_GAME_STATE_9E0650_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9e0650_js_gate_va(void) {
  return ISAAC_GAME_STATE_9E0650_JS_GATE_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_end_load_va(void) {
  return ISAAC_GAME_STATE_9E0650_END_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_begin_load_va(void) {
  return ISAAC_GAME_STATE_9E0650_BEGIN_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_sub_va(void) {
  return ISAAC_GAME_STATE_9E0650_SUB_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_cmp_va(void) {
  return ISAAC_GAME_STATE_9E0650_CMP_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_jge_gate_va(void) {
  return ISAAC_GAME_STATE_9E0650_JGE_GATE_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_byte_load_va(void) {
  return ISAAC_GAME_STATE_9E0650_BYTE_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_ret_ok_va(void) {
  return ISAAC_GAME_STATE_9E0650_RET_OK_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_zero_path_va(void) {
  return ISAAC_GAME_STATE_9E0650_ZERO_PATH_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_ret_zero_va(void) {
  return ISAAC_GAME_STATE_9E0650_RET_ZERO_VA;
}
extern "C" uint32_t isaac_game_state_9e0650_caller_count(void) {
  return ISAAC_GAME_STATE_9E0650_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9e0650_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9E0650_CALLER_VA_0;
    default: return 0u;
  }
}

/* --- ABI v20: 0x9e3450 grid-adjacency door-direction checker --- */

/* Absolute-address mem law: wasm linear memory IS the PE address
   space; this_ptr/door_table_ptr arrive as flat u32 addresses and
   every load converts its absolute address directly (u32 LE, P5/P8
   class). */
static uint32_t isaac_game_state_9e3450_load_u32(uint32_t addr) {
  const uint8_t* p =
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
  return static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

static uint32_t isaac_game_state_9e3450_load_u8(uint32_t addr) {
  const uint8_t* p =
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
  return static_cast<uint32_t>(p[0]);
}

static float isaac_game_state_9e3450_load_f32(uint32_t addr) {
  const uint32_t bits = isaac_game_state_9e3450_load_u32(addr);
  float f;
  __builtin_memcpy(&f, &bits, sizeof(f));
  return f;
}

/* SIGNED idiv q/r (truncate toward zero, x86 idiv semantics).
   INT_MIN/-1 wraps like the hardware; #DE (w==0) is a HOST crash —
   outside the pure surface. */
static int32_t isaac_game_state_9e3450_idiv_q(int32_t a, int32_t b) {
  if (b == -1 && a == INT32_MIN) {
    return INT32_MIN; /* hardware wrap */
  }
  return a / b;
}

static int32_t isaac_game_state_9e3450_idiv_r(int32_t a, int32_t b) {
  if (b == -1 && a == INT32_MIN) {
    return 0; /* hardware remainder */
  }
  return a % b;
}

/* xor-sub abs idiom @0x9e347c..0x9e348b: INT_MIN wraps to INT_MIN
   (no C negation UB — mirrors the machine exactly). */
static uint32_t isaac_game_state_9e3450_abs_u32(int32_t v) {
  const uint32_t u = static_cast<uint32_t>(v);
  const uint32_t sign = 0u - (u >> 31); /* cdq: FULL sign mask, not the bit */
  return (u ^ sign) - sign;
}

/* Float twins of the pinned .rdata consts (comparison values only;
   the VAs stay pinned in the header for the wasm ABI). */
static constexpr float ISAAC_GAME_STATE_9E3450_FLT_NEG_F = -13.0f; /* @0xbaadd0 */
static constexpr float ISAAC_GAME_STATE_9E3450_FLT_POS_F = 13.0f; /* @0xbaa83c */

/* ucomiss/lahf/test ah,0x44/cmov signum @0x9e34ed..0x9e3504 (x arm)
   and @0x9e350c..0x9e3528 (y arm): ==-13 -> -1, ==+13 -> +1, else 0.
   NaN is unordered in BOTH ucomiss arms -> falls out 0. */
static int32_t isaac_game_state_9e3450_signum13(float v) {
  if (v == ISAAC_GAME_STATE_9E3450_FLT_NEG_F) {
    return -1; /* first ucomiss equal arm (or edx=-1 path @0x9e34f6) */
  }
  if (v == ISAAC_GAME_STATE_9E3450_FLT_POS_F) {
    return 1; /* cmovnp edx/ecx,1 arm @0x9e3504/0x9e3528 */
  }
  return 0;
}

extern "C" uint8_t isaac_game_state_9e3450_door_dir(uint32_t this_ptr,
                                                    int32_t idx_a,
                                                    int32_t idx_b,
                                                    uint32_t door_table_ptr) {
  /* AI1 @0x9e345d..0x9e347f: w = [[this]+0xc]; idiv split both indices. */
  const uint32_t inner = isaac_game_state_9e3450_load_u32(this_ptr);
  const int32_t w = static_cast<int32_t>(isaac_game_state_9e3450_load_u32(
      inner + ISAAC_GAME_STATE_9E3450_WIDTH_INNER_OFF)); /* @0x9e3461 */
  const int32_t q_a = isaac_game_state_9e3450_idiv_q(idx_a, w); /* idiv @0x9e3467 */
  const int32_t r_a = isaac_game_state_9e3450_idiv_r(idx_a, w);
  const int32_t q_b = isaac_game_state_9e3450_idiv_q(idx_b, w); /* idiv @0x9e3471 */
  const int32_t r_b = isaac_game_state_9e3450_idiv_r(idx_b, w);
  const int32_t d_col = q_b - q_a; /* sub eax,ecx @0x9e3473 */
  const int32_t d_row = r_b - r_a; /* sub esi,edi @0x9e347a */

  /* AI2 @0x9e3482..0x9e3492: |dCol|+|dRow| == 1 FULL-dword. */
  const uint32_t manhattan =
      isaac_game_state_9e3450_abs_u32(d_col) +
      isaac_game_state_9e3450_abs_u32(d_row);
  if (manhattan != 1u) {
    return 0; /* jne @0x9e3492 -> fail arm */
  }

  /* AI3 @0x9e3498/0x9e349e: UNSIGNED bound. */
  if (static_cast<uint32_t>(idx_a) > ISAAC_GAME_STATE_9E3450_GRID_BOUND) {
    return 0; /* ja @0x9e349e */
  }

  /* AI4 @0x9e34a4..0x9e34ad: SINGLE deref cell byte ([ebp-4] holds raw
     this saved @0x9e3456 BEFORE the width deref) + 0xFF sentinel. */
  const uint32_t cell_addr =
      this_ptr + ISAAC_GAME_STATE_9E3450_CELL_TABLE_OFF +
      static_cast<uint32_t>(idx_a); /* ebx+eax+4 @0x9e34a7, u32 wrap */
  const uint32_t b = isaac_game_state_9e3450_load_u8(cell_addr);
  if (b == ISAAC_GAME_STATE_9E3450_SENTINEL) {
    return 0; /* je @0x9e34ad */
  }

  /* AI5 @0x9e34b3/0x9e34b8: t = b & 0xf. */
  const uint32_t t = b & ISAAC_GAME_STATE_9E3450_TYPE_MASK;

  /* AI6 @0x9e34bd..0x9e353b: SIGNED count gate + direction scan over
     the HOST-resolved table (caller supplies the 0xc37610 row bytes). */
  const uint32_t type_row =
      door_table_ptr + t * ISAAC_GAME_STATE_9E3450_TYPE_ROW_STRIDE; /* shl4+add @0x9e34bd */
  const int32_t cnt = static_cast<int32_t>(
      isaac_game_state_9e3450_load_u32(type_row)); /* mov ebx,[ecx*4+...] @0x9e34c2 */
  if (cnt <= 0) {
    return 0; /* jle @0x9e34cb — SIGNED <= 0 */
  }
  const uint32_t entry_base = type_row + 4u; /* lea esi,[...+0xc37614] @0x9e34d5 (+4 into row) */
  for (int32_t k = 0; k < cnt; ++k) { /* cmp edi,ebx ; jl @0x9e353b — SIGNED */
    const uint32_t ea =
        entry_base +
        static_cast<uint32_t>(k) * ISAAC_GAME_STATE_9E3450_ENTRY_STRIDE;
    const int32_t s_x = isaac_game_state_9e3450_signum13(
        isaac_game_state_9e3450_load_f32(ea)); /* movss xmm0,[esi] @0x9e34e4 */
    const int32_t s_y = isaac_game_state_9e3450_signum13(
        isaac_game_state_9e3450_load_f32(ea + 4u)); /* [esi+4] @0x9e3507 */
    if (s_x == d_row && s_y == d_col) { /* cmp/jne @0x9e352b + cmp/je @0x9e3530: x<->ROW, y<->COL */
      return 1; /* mov al,1 @0x9e354a */
    }
  }
  return 0; /* xor al,al @0x9e353f */
}

extern "C" uint32_t isaac_game_state_9e3450_va(void) {
  return ISAAC_GAME_STATE_9E3450_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_end_va(void) {
  return ISAAC_GAME_STATE_9E3450_END_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_body_bytes(void) {
  return ISAAC_GAME_STATE_9E3450_BODY_BYTES;
}
extern "C" uint32_t isaac_game_state_9e3450_next_va(void) {
  return ISAAC_GAME_STATE_9E3450_NEXT_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_insn_count(void) {
  return ISAAC_GAME_STATE_9E3450_INSN_COUNT;
}
extern "C" uint32_t isaac_game_state_9e3450_width_load_va(void) {
  return ISAAC_GAME_STATE_9E3450_WIDTH_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_manhattan_jne_va(void) {
  return ISAAC_GAME_STATE_9E3450_MANHATTAN_JNE_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_bound_cmp_va(void) {
  return ISAAC_GAME_STATE_9E3450_BOUND_CMP_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_bound_ja_va(void) {
  return ISAAC_GAME_STATE_9E3450_BOUND_JA_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_cell_read_va(void) {
  return ISAAC_GAME_STATE_9E3450_CELL_READ_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_sentinel_je_va(void) {
  return ISAAC_GAME_STATE_9E3450_SENTINEL_JE_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_type_mask_va(void) {
  return ISAAC_GAME_STATE_9E3450_TYPE_MASK_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_count_load_va(void) {
  return ISAAC_GAME_STATE_9E3450_COUNT_LOAD_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_count_jle_va(void) {
  return ISAAC_GAME_STATE_9E3450_COUNT_JLE_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_entry_lea_va(void) {
  return ISAAC_GAME_STATE_9E3450_ENTRY_LEA_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_cmp_drow_va(void) {
  return ISAAC_GAME_STATE_9E3450_CMP_DROW_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_cmp_dcol_va(void) {
  return ISAAC_GAME_STATE_9E3450_CMP_DCOL_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_ret_fail_va(void) {
  return ISAAC_GAME_STATE_9E3450_RET_FAIL_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_ret_hit_va(void) {
  return ISAAC_GAME_STATE_9E3450_RET_HIT_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_grid_bound(void) {
  return ISAAC_GAME_STATE_9E3450_GRID_BOUND;
}
extern "C" uint32_t isaac_game_state_9e3450_width_inner_off(void) {
  return ISAAC_GAME_STATE_9E3450_WIDTH_INNER_OFF;
}
extern "C" uint32_t isaac_game_state_9e3450_cell_table_off(void) {
  return ISAAC_GAME_STATE_9E3450_CELL_TABLE_OFF;
}
extern "C" uint32_t isaac_game_state_9e3450_sentinel(void) {
  return ISAAC_GAME_STATE_9E3450_SENTINEL;
}
extern "C" uint32_t isaac_game_state_9e3450_type_mask(void) {
  return ISAAC_GAME_STATE_9E3450_TYPE_MASK;
}
extern "C" uint32_t isaac_game_state_9e3450_door_table_va(void) {
  return ISAAC_GAME_STATE_9E3450_DOOR_TABLE_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_type_row_stride(void) {
  return ISAAC_GAME_STATE_9E3450_TYPE_ROW_STRIDE;
}
extern "C" uint32_t isaac_game_state_9e3450_entry_stride(void) {
  return ISAAC_GAME_STATE_9E3450_ENTRY_STRIDE;
}
extern "C" uint32_t isaac_game_state_9e3450_flt_neg_va(void) {
  return ISAAC_GAME_STATE_9E3450_FLT_NEG_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_flt_pos_va(void) {
  return ISAAC_GAME_STATE_9E3450_FLT_POS_VA;
}
extern "C" uint32_t isaac_game_state_9e3450_caller_count(void) {
  return ISAAC_GAME_STATE_9E3450_CALLER_COUNT;
}
extern "C" uint32_t isaac_game_state_9e3450_caller_va_at(uint32_t index) {
  switch (index) {
    case 0: return ISAAC_GAME_STATE_9E3450_CALLER_VA_0;
    case 1: return ISAAC_GAME_STATE_9E3450_CALLER_VA_1;
    case 2: return ISAAC_GAME_STATE_9E3450_CALLER_VA_2;
    case 3: return ISAAC_GAME_STATE_9E3450_CALLER_VA_3;
    case 4: return ISAAC_GAME_STATE_9E3450_CALLER_VA_4;
    case 5: return ISAAC_GAME_STATE_9E3450_CALLER_VA_5;
    default: return 0u;
  }
}

extern "C" uint32_t isaac_game_state_pure_helpers_abi_version(void) {
  return ISAAC_GAME_STATE_PURE_HELPERS_ABI_VERSION;
}
