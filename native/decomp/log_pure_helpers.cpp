#include "log_pure_helpers.h"

#include <stddef.h>

/* Logger 0x00a112c0 pure level-gate, family ABI v1.

   Root (address-stable; no exact ZHL match — see header):
     0x00a112c0 cdecl varargs logger (level, fmt, ...)

   Evidence: whole body disassembled instruction-by-instruction in
   native/decomp/log_pure_helpers.h (gate flow 0x00a112e8..0x00a1148d, jump
   table 0x00a114a4, index table 0x00a114bc); IAT identities from the PE
   import directory; whole-.text callsite and writer censuses recorded in
   the header (3286 callsites, zero address escapes, zero return-value
   consumers).

   The format tail (__stdio_common_vsprintf shims 0x00420a80 / 0x00709bc0),
   OutputDebugStringA, the critical-section lock/unlock pair
   (0x00a157f0 / 0x00a159a0), the mutex-holder init 0x00a15770 (guest
   allocator) and the log.txt sink (fopen/fwrite/fflush object, vtable
   0x00ba5184) stay address-stable HOST actions. Everything decided BEFORE
   any I/O — the guard equality, listener pre/post gates, low-byte
   emit/console gates, guard state machine, prefix selection, append window
   arithmetic, atLineStart law, buffer reset byte, callsite marshalling —
   is translated here.

   D-LOG-1 is REPRODUCED, never corrected: a len==0 append reads the
   never-written pre-buffer byte 0x00c7b647 (constant 0), so the newline
   compare fails and atLineStart is CLEARED by an empty emit.
   D-LOG-2 is pinned: 0x00a15770 ends `mov al, 1` on every path, so the
   init-fail drop arm (`test al,al ; je 0x00a11381`) is structurally dead
   in this binary; it is translated anyway. */

namespace {

/* test bl, bl — the LOW BYTE of the wide level argument. The parameter is
   deliberately WIDE and narrowed here (uint8_t-parameter toolchain defect
   guard: the Wasm ABI does not narrow i32 arguments). */
inline uint32_t level_low_byte_impl(uint32_t level) {
  return level & 0xffu;
}

/* cmp [0xc79bd8], 0 ; je  +  test [0xc79bdc], ebx ; je — the pointer null
   test and a FULL 32-bit AND of mask and level (no byte narrowing here:
   the PE uses `test dword ptr`). */
inline int32_t listener_hit_impl(uint32_t ptr, uint32_t mask, uint32_t level) {
  if (ptr == 0u) {
    return 0;
  }
  return (mask & level) != 0u ? 1 : 0;
}

/* test bl,bl ; jne proceed  +  test cl,cl ; je epilogue. */
inline int32_t emit_gate_impl(uint32_t level, uint32_t ptr, uint32_t mask) {
  if (level_low_byte_impl(level) != 0u) {
    return 1;
  }
  return listener_hit_impl(ptr, mask, level);
}

/* cmp eax, 1 ; je epilogue — FULL 32-bit equality. */
inline int32_t guard_blocks_impl(uint32_t guard) {
  return guard == 1u ? 1 : 0;
}

/* test al, al after the init call — LOW BYTE of the returned AL. */
inline uint32_t guard_after_init_impl(uint32_t init_ok) {
  return (init_ok & 0xffu) != 0u ? 2u : 0u;
}

/* lea eax,[ebx-1] ; cmp eax,0xf ; ja default ; movzx byte table.
   The compare is UNSIGNED STRICT ABOVE (`ja`): idx == 0xf takes the table
   (level 0x10 -> case 4), idx 0x10 and the level-0 wrap take default. */
inline int32_t prefix_case_impl(uint32_t level) {
  const uint32_t idx = level - 1u; /* 32-bit wrap: level 0 -> 0xffffffff */
  if (idx > static_cast<uint32_t>(ISAAC_LOG_PREFIX_INDEX_BOUND)) {
    return ISAAC_LOG_PREFIX_CASE_DEFAULT;
  }
  /* Index table at 0x00a114bc, 16 bytes, pinned from the raw image:
     00 01 05 02 05 05 05 03 05 05 05 05 05 05 05 04. */
  static const uint8_t kIndex[16] = {0, 1, 5, 2, 5, 5, 5, 3,
                                     5, 5, 5, 5, 5, 5, 5, 4};
  return static_cast<int32_t>(kIndex[idx]);
}

inline uint32_t prefix_va_impl(uint32_t level) {
  switch (prefix_case_impl(level)) {
    case ISAAC_LOG_PREFIX_CASE_INFO:
      return static_cast<uint32_t>(ISAAC_LOG_PREFIX_VA_INFO);
    case ISAAC_LOG_PREFIX_CASE_NET:
      return static_cast<uint32_t>(ISAAC_LOG_PREFIX_VA_NET);
    case ISAAC_LOG_PREFIX_CASE_WARN:
      return static_cast<uint32_t>(ISAAC_LOG_PREFIX_VA_WARN);
    case ISAAC_LOG_PREFIX_CASE_ERROR:
      return static_cast<uint32_t>(ISAAC_LOG_PREFIX_VA_ERROR);
    case ISAAC_LOG_PREFIX_CASE_ASSERT:
      return static_cast<uint32_t>(ISAAC_LOG_PREFIX_VA_ASSERT);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_PREFIX_VA_DEFAULT);
  }
}

inline uint32_t prefix_len_impl(uint32_t level) {
  switch (prefix_case_impl(level)) {
    case ISAAC_LOG_PREFIX_CASE_INFO:
      return ISAAC_LOG_PREFIX_LEN_INFO;
    case ISAAC_LOG_PREFIX_CASE_NET:
      return ISAAC_LOG_PREFIX_LEN_NET;
    case ISAAC_LOG_PREFIX_CASE_WARN:
      return ISAAC_LOG_PREFIX_LEN_WARN;
    case ISAAC_LOG_PREFIX_CASE_ERROR:
      return ISAAC_LOG_PREFIX_LEN_ERROR;
    case ISAAC_LOG_PREFIX_CASE_ASSERT:
      return ISAAC_LOG_PREFIX_LEN_ASSERT;
    default:
      return ISAAC_LOG_PREFIX_LEN_DEFAULT;
  }
}

}  // namespace

/* ---------- LA: entry gates ---------- */

extern "C" int32_t isaac_log_guard_blocks(uint32_t guard) {
  return guard_blocks_impl(guard);
}

extern "C" int32_t isaac_log_listener_hit_pre(uint32_t listener_ptr,
                                              uint32_t listener_mask,
                                              uint32_t level) {
  return listener_hit_impl(listener_ptr, listener_mask, level);
}

extern "C" uint32_t isaac_log_level_low_byte(uint32_t level) {
  return level_low_byte_impl(level);
}

extern "C" int32_t isaac_log_emit_gate(uint32_t level,
                                       uint32_t listener_ptr,
                                       uint32_t listener_mask) {
  return emit_gate_impl(level, listener_ptr, listener_mask);
}

extern "C" int32_t isaac_log_message_dropped(uint32_t guard,
                                             uint32_t level,
                                             uint32_t listener_ptr,
                                             uint32_t listener_mask,
                                             uint32_t init_ok) {
  if (guard_blocks_impl(guard) != 0) {
    return 1;
  }
  if (emit_gate_impl(level, listener_ptr, listener_mask) == 0) {
    return 1;
  }
  /* guard 0 -> init; `test al,al ; je 0x00a11381` drops on AL low byte 0.
     Structurally dead (D-LOG-2) but translated. */
  if (guard == 0u && (init_ok & 0xffu) == 0u) {
    return 1;
  }
  return 0;
}

/* ---------- LB: guard state machine ---------- */

extern "C" int32_t isaac_log_init_needed(uint32_t guard,
                                         uint32_t level,
                                         uint32_t listener_ptr,
                                         uint32_t listener_mask) {
  if (guard_blocks_impl(guard) != 0) {
    return 0;
  }
  if (emit_gate_impl(level, listener_ptr, listener_mask) == 0) {
    return 0;
  }
  /* test eax,eax ; jne locked — only guard 0 initialises. */
  return guard == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_log_guard_after_init(uint32_t init_ok) {
  return guard_after_init_impl(init_ok);
}

extern "C" uint32_t isaac_log_guard_after(uint32_t guard,
                                          uint32_t level,
                                          uint32_t listener_ptr,
                                          uint32_t listener_mask,
                                          uint32_t init_ok) {
  if (guard_blocks_impl(guard) != 0) {
    return guard; /* ==1: untouched */
  }
  if (emit_gate_impl(level, listener_ptr, listener_mask) == 0) {
    return guard; /* dropped before the init block */
  }
  if (guard == 0u) {
    /* [0xc7de48]=1 ; call init ; test al,al -> 2 (ok) or 0 (dead arm). */
    return guard_after_init_impl(init_ok);
  }
  return guard; /* nonzero non-1 guards pass through unchanged */
}

extern "C" int32_t isaac_log_init_always_succeeds(void) {
  /* D-LOG-2: 0x00a15770 ends `mov al, 1` on every path (0x00a157b1), even
     when its 0x1c-byte allocation fails. Pinned; the fail arm is dead. */
  return 1;
}

/* ---------- LC: prefix selection ---------- */

extern "C" int32_t isaac_log_prefix_case(uint32_t level) {
  return prefix_case_impl(level);
}

extern "C" uint32_t isaac_log_prefix_va(uint32_t level) {
  return prefix_va_impl(level);
}

extern "C" uint32_t isaac_log_prefix_len(uint32_t level) {
  return prefix_len_impl(level);
}

extern "C" int32_t isaac_log_prefix_written(uint32_t at_line_start_byte) {
  /* cmp byte ptr [0xc33911], 0 ; je — a one-byte memory cell, parameter
     wide, narrowed here. */
  return (at_line_start_byte & 0xffu) != 0u ? 1 : 0;
}

/* ---------- LD: append window ---------- */

extern "C" uint32_t isaac_log_append_dest_off(uint32_t len) {
  /* lea ecx, [ecx + 0xc7b648] with ecx = strlen(buffer): dest = buf + len. */
  return len;
}

extern "C" uint32_t isaac_log_append_capacity(uint32_t len) {
  /* mov edx, 0x2800 ; sub edx, ecx — 32-bit wrap, no clamp. */
  return static_cast<uint32_t>(ISAAC_LOG_BUFFER_CAPACITY) - len;
}

/* ---------- LE: output gates ---------- */

extern "C" int32_t isaac_log_console_gate(uint32_t level) {
  /* test bl, bl at 0x00a11405 — LOW BYTE ONLY. */
  return level_low_byte_impl(level) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_log_listener_gate_post(uint32_t pre_flag_byte,
                                                uint32_t listener_ptr_post,
                                                uint32_t listener_mask_post,
                                                uint32_t level) {
  /* cmp byte [ebp-0xd], 0 ; je — the stored pre-call flag byte... */
  if ((pre_flag_byte & 0xffu) == 0u) {
    return 0;
  }
  /* ...then the pointer and mask are RE-READ after the format calls
     (mov ecx,[0xc79bd8] ; test ecx,ecx ; je + test [0xc79bdc], ebx ; je).
     Not folded to the pre-call snapshot. */
  return listener_hit_impl(listener_ptr_post, listener_mask_post, level);
}

/* ---------- LF: atLineStart law ---------- */

extern "C" int32_t isaac_log_next_at_line_start(uint32_t appended_len,
                                                uint32_t last_byte) {
  if (appended_len == 0u) {
    /* cmp byte [0 + 0xc7b647], 0xa — the pre-buffer byte. Censused: ONE
       reference in all of .text (this cmp), ZERO writers, BSS zero at
       load, so the compare is false for the process lifetime (D-LOG-1). */
    return 0;
  }
  return (last_byte & 0xffu) ==
                 static_cast<uint32_t>(ISAAC_LOG_NEWLINE_BYTE)
             ? 1
             : 0;
}

extern "C" int32_t isaac_log_empty_append_clears_line_start(void) {
  return 1; /* D-LOG-1, REPRODUCED never corrected. */
}

extern "C" uint32_t isaac_log_buffer_reset_byte(void) {
  /* mov [0xc7b648], al — AL is the terminator the strlen loop just read. */
  return 0u;
}

extern "C" uint32_t isaac_log_initial_at_line_start(void) {
  /* File-backed initial byte at 0x00c33911 (raw offset 0x00831911): 0x01. */
  return 1u;
}

/* ---------- v17: the mid-body DISPATCH + TAIL length laws ---------- */

extern "C" uint32_t isaac_log_dispatch_nmemb_len(uint32_t append_len,
                                                 uint32_t dispatch_len) {
  /* D-LOG-15: 0xa11440 re-derives the buffer length AFTER the vsnprintf
     shim; the append-window pass at 0xa113dd measured it BEFORE. The
     pushed nmemb (0xa11449) is the re-derived value. */
  (void)append_len;
  return dispatch_len;
}

extern "C" uint32_t isaac_log_tail_len_after_dispatch(
    uint32_t dispatch_len, uint32_t tail_len) {
  /* D-LOG-16: 0xa11453 re-derives the length AFTER the listener vcall
     0xa11451; the newline compare at 0xa11469 reads buf[len3-1] with that
     third-pass value. The dispatch snapshot is not reused. */
  (void)dispatch_len;
  return tail_len;
}

extern "C" int32_t isaac_log_dispatch_return_dropped(void) {
  /* D-LOG-17: eax after call esi (0xa11451) is never read — the buffer
     reset at 0xa11470 stores al = the strlen NUL, and ret (0xa114a1)
     returns the unlock vcall's residue. */
  return 1;
}

extern "C" uint32_t isaac_log_dispatch_strlen_pass_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_DISPATCH_STRLEN_PASS);
}

extern "C" uint32_t isaac_log_dispatch_nmemb_push_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_DISPATCH_NMEMB_PUSH);
}

extern "C" uint32_t isaac_log_tail_strlen_pass_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_TAIL_STRLEN_PASS);
}

extern "C" uint32_t isaac_log_tail_newline_cmp_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_TAIL_NEWLINE_CMP);
}

/* ---------- v18: the shared sub-object VECTOR dtor 0x00426980 ---------- */

namespace {

/* mov eax,[esi] ; test eax,eax ; je 0x4269c9 — FULL 32-bit begin gate.
   0x100 / 0x1ff / 0xffffffff ALL fire the free AND the null stores; only
   0 skips (early ret: no free, no nulls). A low-byte reading misfires. */
inline int32_t sub_dtor_needed_impl(uint32_t begin) {
  return begin != 0u ? 1 : 0;
}

/* mov ecx,[esi+8] ; sub ecx,eax ; and ecx,0xfffffff8 — the byte count is
   (end - begin) with 32-bit wrap BEFORE the &~7 mask (an end < begin
   range wraps and is then aligned down). */
inline uint32_t sub_dtor_byte_count_impl(uint32_t begin, uint32_t end) {
  return (end - begin) & static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_COUNT_MASK);
}

/* cmp ecx,0x1000 ; jb 0x4269ab — UNSIGNED below: LARGE iff count >=
   0x1000 (0x1000 / 0xffffffff are large; 0xfff is small). */
inline int32_t sub_dtor_large_impl(uint32_t begin, uint32_t end) {
  return sub_dtor_byte_count_impl(begin, end) >=
                 static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_SMALL_BOUND)
             ? 1
             : 0;
}

/* sub eax,edx ; add eax,-4 ; cmp eax,0x1f ; ja 0x4269cb — the header is
   sane iff (u32)(begin - header - 4) <= 0x1f (UNSIGNED above). The
   subtraction wraps 32-bit exactly like the machine's two-step
   `sub eax,edx` + `add eax,-4`. */
inline int32_t sub_dtor_header_sane_impl(uint32_t begin, uint32_t header) {
  uint32_t delta = begin - header;
  delta -= 4u;
  return delta <= static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_HEADER_DELTA_MAX)
             ? 1
             : 0;
}

inline uint32_t sub_dtor_free_plan_impl(uint32_t begin, uint32_t end,
                                        uint32_t header) {
  if (begin == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_NONE);
  }
  if (sub_dtor_large_impl(begin, end) == 0) {
    return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_SMALL);
  }
  return sub_dtor_header_sane_impl(begin, header) != 0
             ? static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_LARGE)
             : static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_INVALID);
}

inline uint32_t sub_dtor_free_ptr_impl(uint32_t begin, uint32_t end,
                                       uint32_t header) {
  const uint32_t plan = sub_dtor_free_plan_impl(begin, end, header);
  if (plan == static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_SMALL)) {
    return begin; /* push eax — eax still holds begin on the small arm */
  }
  if (plan == static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_LARGE)) {
    return header; /* mov eax,edx — the header on the large arm */
  }
  return 0u; /* NONE / INVALID: no free runs */
}

inline uint32_t sub_dtor_free_size_impl(uint32_t begin, uint32_t end,
                                        uint32_t header) {
  const uint32_t count = sub_dtor_byte_count_impl(begin, end);
  if (sub_dtor_free_plan_impl(begin, end, header) ==
      static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_SMALL)) {
    return count; /* push ecx — the aligned byte count */
  }
  if (sub_dtor_free_plan_impl(begin, end, header) ==
      static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_LARGE)) {
    /* add ecx,0x23 — computed BEFORE the sanity check, on the large arm */
    return count + static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_LARGE_SIZE_BIAS);
  }
  return 0u; /* NONE / INVALID: no free runs */
}

inline int32_t sub_dtor_invalid_needed_impl(uint32_t begin, uint32_t end,
                                            uint32_t header) {
  return sub_dtor_free_plan_impl(begin, end, header) ==
                 static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_PLAN_INVALID)
             ? 1
             : 0;
}

/* mov [esi],0 ; mov [esi+4],0 ; mov [esi+8],0 — the three cells are
   NULLed on BOTH free paths (small and large join at 0x4269ab before the
   call). begin == 0 -> early ret: NO nulls. */
inline int32_t sub_dtor_null_after_impl(uint32_t begin, uint32_t end,
                                        uint32_t header) {
  (void)end;
  (void)header;
  return begin != 0u ? 1 : 0;
}

}  // namespace

extern "C" int32_t isaac_log_sub_dtor_needed(uint32_t begin) {
  return sub_dtor_needed_impl(begin);
}

extern "C" uint32_t isaac_log_sub_dtor_byte_count(uint32_t begin,
                                                  uint32_t end) {
  return sub_dtor_byte_count_impl(begin, end);
}

extern "C" int32_t isaac_log_sub_dtor_large(uint32_t begin, uint32_t end) {
  return sub_dtor_large_impl(begin, end);
}

extern "C" int32_t isaac_log_sub_dtor_header_sane(uint32_t begin,
                                                  uint32_t header) {
  return sub_dtor_header_sane_impl(begin, header);
}

extern "C" uint32_t isaac_log_sub_dtor_free_plan(uint32_t begin, uint32_t end,
                                                 uint32_t header) {
  return sub_dtor_free_plan_impl(begin, end, header);
}

extern "C" uint32_t isaac_log_sub_dtor_free_ptr(uint32_t begin, uint32_t end,
                                                uint32_t header) {
  return sub_dtor_free_ptr_impl(begin, end, header);
}

extern "C" uint32_t isaac_log_sub_dtor_free_size(uint32_t begin, uint32_t end,
                                                 uint32_t header) {
  return sub_dtor_free_size_impl(begin, end, header);
}

extern "C" int32_t isaac_log_sub_dtor_invalid_needed(uint32_t begin,
                                                     uint32_t end,
                                                     uint32_t header) {
  return sub_dtor_invalid_needed_impl(begin, end, header);
}

extern "C" int32_t isaac_log_sub_dtor_null_after(uint32_t begin, uint32_t end,
                                                 uint32_t header) {
  return sub_dtor_null_after_impl(begin, end, header);
}

extern "C" uint32_t isaac_log_sub_dtor_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SUB_DTOR);
}

extern "C" uint32_t isaac_log_sub_dtor_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_BODY_BYTES);
}

extern "C" uint32_t isaac_log_sub_dtor_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_INSN_COUNT);
}

extern "C" uint32_t isaac_log_sub_dtor_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_sub_dtor_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_RET_ARGS);
}

extern "C" uint32_t isaac_log_sub_dtor_begin_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_BEGIN_OFFSET);
}

extern "C" uint32_t isaac_log_sub_dtor_mylast_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_MYLAST_OFFSET);
}

extern "C" uint32_t isaac_log_sub_dtor_myend_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_MYEND_OFFSET);
}

extern "C" uint32_t isaac_log_sub_dtor_delete_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_DELETE_VA);
}

extern "C" uint32_t isaac_log_sub_dtor_invalid_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_INVALID_IAT);
}

extern "C" uint32_t isaac_log_sub_dtor_invalid_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_INVALID_CALL_VA);
}

extern "C" uint32_t isaac_log_sub_dtor_e8_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_E8_CALLSITES);
}

extern "C" uint32_t isaac_log_sub_dtor_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SUB_DTOR_RAW_OCCURRENCES);
}

/* ---------- v19: the open-helper path-combine 0x00a5a7a0 ---------- */

inline uint32_t combine_last_byte_impl(uint32_t last_byte) {
  /* cmp al, 0x2f / cmp al, 0x5c — 8-bit compares. */
  return last_byte & 0xffu;
}

inline int32_t combine_has_trailing_sep_impl(uint32_t len_base,
                                             uint32_t last_byte) {
  /* 0xa5a7df je 0xa5a7f6 — len_base == 0 CLEARS the flag without reading
     base[-1]; then cmp last, '/' ; je set ; cmp last, '\\' ; jne clear. */
  if (len_base == 0u) {
    return 0;
  }
  const uint32_t b = combine_last_byte_impl(last_byte);
  return (b == ISAAC_LOG_OPEN_COMBINE_SEP_SLASH ||
          b == ISAAC_LOG_OPEN_COMBINE_SEP_BACKSLASH)
             ? 1
             : 0;
}

inline int32_t combine_both_empty_impl(uint32_t len_path, uint32_t len_base) {
  /* test esi,esi ; jne combine + test edi,edi ; jne combine — both-zero
     falls into the counted-empty arm 0xa5a803. */
  return (len_path == 0u && len_base == 0u) ? 1 : 0;
}

inline uint32_t combine_counter_va_impl(uint32_t init_ptr) {
  /* mov esi,[0xc7de78]; test esi,esi; je default; add esi,0x30. */
  return init_ptr != 0u
             ? (init_ptr + ISAAC_LOG_OPEN_COMBINE_COUNTER_INIT_OFFSET)
             : static_cast<uint32_t>(
                   ISAAC_LOG_OPEN_COMBINE_COUNTER_DEFAULT_VA);
}

inline uint32_t combine_alloc_size_impl(uint32_t len_path, uint32_t len_base,
                                        uint32_t trailing_flag) {
  /* movzx eax, byte [ebp+0xc]; add eax,2; add eax,edi; add eax,esi —
     the flag is BYTE-zero-extended; the three adds wrap 32-bit. */
  return (len_path + len_base + (trailing_flag & 0xffu) +
          ISAAC_LOG_OPEN_COMBINE_SIZE_SLACK);
}

inline uint32_t combine_mode_impl(uint32_t len_path, uint32_t len_base) {
  /* test edi,edi ; jne base-arm ; (then) test esi,esi ; jne join-arm.
     The combine arm is reached only when len_path+len_base > 0. */
  if (len_base == 0u) {
    return ISAAC_LOG_OPEN_COMBINE_MODE_COPY_PATH;
  }
  if (len_path == 0u) {
    return ISAAC_LOG_OPEN_COMBINE_MODE_COPY_BASE;
  }
  return ISAAC_LOG_OPEN_COMBINE_MODE_JOIN;
}

inline uint32_t combine_join_uses_sep_impl(uint32_t has_trailing_sep) {
  /* cmp byte [esp+0x13],0 ; je 0xa5a8c5 -> "%s/%s" ; fallthrough ->
     "%s%s". has_sep=1 skips the inserted separator. */
  return combine_last_byte_impl(has_trailing_sep) != 0u ? 0u : 1u;
}

inline uint32_t combine_normalize_char_impl(uint32_t ch,
                                            uint32_t lowercase_flag) {
  /* mov al,dl ; sub al,0x41 ; cmp al,0x19 ; ja skip — 8-bit sub with
     unsigned STRICT-ABOVE: only 0x41..0x5A (A-Z) qualify; the 8-bit wrap
     sends every other byte > 0x19. Then add dl,0x20. */
  uint32_t b = combine_last_byte_impl(ch);
  if (combine_last_byte_impl(lowercase_flag) != 0u) {
    const uint32_t d = (b - 0x41u) & 0xffu;
    if (d <= 0x19u) {
      b = (b + 0x20u) & 0xffu;
    }
  }
  /* cmp byte [ecx],0x5c ; jne next ; mov byte [ecx],0x2f — UNCONDITIONAL
     on the stored (possibly lowercased) byte. */
  if (b == ISAAC_LOG_OPEN_COMBINE_SEP_BACKSLASH) {
    b = ISAAC_LOG_OPEN_COMBINE_SEP_SLASH;
  }
  return b;
}

inline int32_t combine_trailing_needed_impl(uint32_t trailing_flag,
                                            uint32_t last_byte) {
  /* cmp byte [ebp+0xc],0 ; je skip  +  cmp byte [out+len-1],0x2f ; je
     skip — the len==0 read is the pre-buffer byte out[-1] (the caller
     passes it via last_byte; D-LOG-1 convention, never corrected). */
  if (combine_last_byte_impl(trailing_flag) == 0u) {
    return 0;
  }
  return combine_last_byte_impl(last_byte) == ISAAC_LOG_OPEN_COMBINE_SEP_SLASH
             ? 0
             : 1;
}

extern "C" int32_t isaac_log_combine_has_trailing_sep(uint32_t len_base,
                                                      uint32_t last_byte) {
  return combine_has_trailing_sep_impl(len_base, last_byte);
}

extern "C" int32_t isaac_log_combine_both_empty(uint32_t len_path,
                                                uint32_t len_base) {
  return combine_both_empty_impl(len_path, len_base);
}

extern "C" uint32_t isaac_log_combine_counter_va(uint32_t init_ptr) {
  return combine_counter_va_impl(init_ptr);
}

extern "C" uint32_t isaac_log_combine_both_empty_header(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_BOTH_EMPTY_HEADER);
}

extern "C" uint32_t isaac_log_combine_both_empty_delta(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_BOTH_EMPTY_DELTA);
}

extern "C" uint32_t isaac_log_combine_alloc_size(uint32_t len_path,
                                                 uint32_t len_base,
                                                 uint32_t trailing_flag) {
  return combine_alloc_size_impl(len_path, len_base, trailing_flag);
}

extern "C" uint32_t isaac_log_combine_copy_count(uint32_t src_len) {
  /* lea ecx,[esi+1] — count = src_len + 1 (NUL included), 32-bit wrap. */
  return src_len + 1u;
}

extern "C" uint32_t isaac_log_combine_mode(uint32_t len_path,
                                           uint32_t len_base) {
  return combine_mode_impl(len_path, len_base);
}

extern "C" uint32_t isaac_log_combine_join_uses_sep(uint32_t has_trailing_sep) {
  return combine_join_uses_sep_impl(has_trailing_sep);
}

extern "C" uint32_t isaac_log_combine_normalize_char(uint32_t ch,
                                                     uint32_t lowercase_flag) {
  return combine_normalize_char_impl(ch, lowercase_flag);
}

extern "C" int32_t isaac_log_combine_trailing_needed(uint32_t trailing_flag,
                                                     uint32_t last_byte) {
  return combine_trailing_needed_impl(trailing_flag, last_byte);
}

extern "C" int32_t isaac_log_combine_fail_crashes(void) {
  /* push 0x7fcb9dd6 ; call 0xa23200 (list-walk broadcast, head
     0xc37974) ; xor eax,eax ; mov byte ptr [eax], al — the directed
     write-to-VA-0 crash. No value ever returns on this arm. */
  return 1;
}

extern "C" uint32_t isaac_log_combine_fail_code(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_FAIL_CODE);
}

extern "C" uint32_t isaac_log_combine_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_OPEN_COMBINE);
}

extern "C" uint32_t isaac_log_combine_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_END);
}

extern "C" uint32_t isaac_log_combine_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_BODY_BYTES);
}

extern "C" uint32_t isaac_log_combine_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_INSN_COUNT);
}

extern "C" uint32_t isaac_log_combine_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_combine_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_RET_ARGS);
}

extern "C" uint32_t isaac_log_combine_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_RETS);
}

extern "C" uint32_t isaac_log_combine_inbound_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_INBOUND_CALLSITES);
}

extern "C" uint32_t isaac_log_combine_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_combine_join_sep_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_JOIN_SEP_VA);
}

extern "C" uint32_t isaac_log_combine_join_nosep_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_JOIN_NOSEP_VA);
}

extern "C" uint32_t isaac_log_combine_slash_str_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_SLASH_STR_VA);
}

extern "C" uint32_t isaac_log_combine_fail_broadcast_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_FAIL_BROADCAST_VA);
}

extern "C" uint32_t isaac_log_combine_alloc_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_ALLOC_VA);
}

extern "C" uint32_t isaac_log_combine_malloc_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_MALLOC_IAT);
}

extern "C" uint32_t isaac_log_combine_strncpy_s_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_STRNCPY_S_IAT);
}

extern "C" uint32_t isaac_log_combine_strcat_s_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_STRCAT_S_IAT);
}

/* ---------- LG: callsite marshalling law ---------- */

extern "C" uint32_t isaac_log_vararg_dword_count(uint32_t add_esp_imm) {
  /* cdecl: N cleans level + fmt + varargs. (N - 8) >> 2, unsigned. */
  return (add_esp_imm - 8u) >> 2;
}

extern "C" uint32_t isaac_log_va_start_stack_disp(void) {
  /* lea eax, [ebp + 0x10] — varargs start at the third stack dword. */
  return static_cast<uint32_t>(ISAAC_LOG_VA_START_STACK_DISP);
}

/* ---------- LH: plan ---------- */

extern "C" void isaac_log_emit_plan(uint32_t level,
                                    uint32_t guard,
                                    uint32_t listener_ptr,
                                    uint32_t listener_mask,
                                    uint32_t at_line_start_byte,
                                    uint32_t init_ok,
                                    IsaacLogEmitPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t blocked = guard_blocks_impl(guard);
  const int32_t pre = listener_hit_impl(listener_ptr, listener_mask, level);
  const int32_t gate = emit_gate_impl(level, listener_ptr, listener_mask);

  out->dropped_guard = blocked;
  out->listener_pre = 0;
  out->emit_gate = 0;
  out->dropped_gate = 0;
  out->init_needed = 0;
  out->init_fail_drops = 0;
  out->guard_after = guard;
  out->lock_needed = 0;
  out->prefix_written = 0;
  out->prefix_case = -1;
  out->prefix_va = 0u;
  out->prefix_len = 0u;
  out->console_needed = 0;
  out->unlock_needed = 0;
  if (blocked != 0) {
    return; /* guard == 1: nothing else is even computed by the PE */
  }

  /* The listener flag byte is computed and stored BEFORE the bl test. */
  out->listener_pre = pre;
  out->emit_gate = gate;
  if (gate == 0) {
    out->dropped_gate = 1;
    return; /* no init, no lock, no state change */
  }
  if (guard == 0u) {
    out->init_needed = 1;
    if ((init_ok & 0xffu) == 0u) {
      /* dead in this binary (D-LOG-2) but translated: guard reset to 0,
         message dropped BEFORE the lock. */
      out->init_fail_drops = 1;
      out->guard_after = 0u;
      return;
    }
    out->guard_after = 2u;
  }
  out->lock_needed = 1;
  out->unlock_needed = 1; /* vcall +0x10 runs on every emit path */
  if ((at_line_start_byte & 0xffu) != 0u) {
    out->prefix_written = 1;
    out->prefix_case = prefix_case_impl(level);
    out->prefix_va = prefix_va_impl(level);
    out->prefix_len = prefix_len_impl(level);
  }
  out->console_needed = level_low_byte_impl(level) != 0u ? 1 : 0;
}

/* ================= v2: LI — teardown listener uninstall =================
   0x00a71823..0x00a71852. Reached on every path through 0x00a71770. */

extern "C" int32_t isaac_log_teardown_flush_needed(uint32_t listener_ptr_pre) {
  /* 0x00a71823 mov ecx,[0xc79bd8] ; 0x00a71829 test ecx,ecx ; je 0xa7184c */
  return listener_ptr_pre != 0u ? 1 : 0;
}

extern "C" int32_t isaac_log_teardown_destroy_needed(
    uint32_t listener_ptr_pre, uint32_t listener_ptr_post) {
  /* The flush vcall at 0x00a7182f can run arbitrary sink code, so the machine
     RE-READS the global at 0x00a71832 and tests it again at 0x00a71838. Both
     tests must pass; the pre-call value is NOT reused. */
  if (listener_ptr_pre == 0u) {
    return 0;
  }
  return listener_ptr_post != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_log_teardown_listener_ptr_after(
    uint32_t listener_ptr_pre, uint32_t listener_ptr_post) {
  if (isaac_log_teardown_destroy_needed(listener_ptr_pre, listener_ptr_post) !=
      0) {
    return 0u; /* 0x00a71842 mov [0xc79bd8], 0 */
  }
  if (listener_ptr_pre == 0u) {
    /* je taken at 0x00a7182b: no store, the cell still holds the pre value. */
    return listener_ptr_pre;
  }
  /* je taken at 0x00a7183a: no store, the cell holds what the re-read saw. */
  return listener_ptr_post;
}

extern "C" uint32_t isaac_log_teardown_listener_mask_after(
    uint32_t listener_mask_before) {
  /* 0x00a71852 mov dword [0xc79bdc], 0 — at the join, no predicate. The
     previous value is discarded whatever it was. */
  (void)listener_mask_before;
  return 0u;
}

extern "C" int32_t isaac_log_teardown_mask_clear_unconditional(void) {
  return 1;
}

extern "C" int32_t isaac_log_teardown_second_flush_reached(
    uint32_t listener_ptr_pre, uint32_t listener_ptr_post) {
  /* 0x00a71a19 mov ecx,[0xc79bd8] ; test ecx,ecx ; je 0xa71a28. Derived from
     the pointer law rather than hard-coded 0, so a mutant on that law shows
     up here too (D-LOG-5). */
  return isaac_log_teardown_listener_ptr_after(listener_ptr_pre,
                                               listener_ptr_post) != 0u
             ? 1
             : 0;
}

/* ============ v2: LJ — the `== 2` gate and critical-section destroy ====== */

extern "C" int32_t isaac_log_teardown_engaged(uint32_t guard) {
  /* 0x00a71bac cmp dword ptr [0xc7de48], 2 ; 0x00a71bbd jne 0xa71bf6.
     FULL 32-bit equality — 0x102 is not 2. Note this is a DIFFERENT width
     decision from the logger's low-byte emit gates on purpose. */
  return guard == static_cast<uint32_t>(ISAAC_LOG_TEARDOWN_ENGAGE_VALUE) ? 1
                                                                         : 0;
}

extern "C" int32_t isaac_log_teardown_critsec_delete_needed(
    uint32_t guard, uint32_t critsec_ptr) {
  if (isaac_log_teardown_engaged(guard) == 0) {
    return 0;
  }
  /* 0x00a71bc5 test esi,esi ; je 0xa71be5 */
  return critsec_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_log_teardown_critsec_ptr_after(uint32_t guard,
                                                         uint32_t critsec_ptr) {
  if (isaac_log_teardown_critsec_delete_needed(guard, critsec_ptr) != 0) {
    return 0u; /* 0x00a71bdb */
  }
  return critsec_ptr;
}

extern "C" uint32_t isaac_log_teardown_holder_flags_after(
    uint32_t guard, uint32_t holder_flags) {
  /* [0xc3795c] is a ONE-BYTE cell; the parameter is wide (toolchain defect
     guard) and narrowed here before the BYTE `and`. */
  const uint32_t cell = holder_flags & 0xffu;
  if (isaac_log_teardown_engaged(guard) == 0) {
    return cell; /* the jne skipped the whole block */
  }
  /* 0x00a71be5 and byte ptr [0xc3795c], 0xfe */
  return cell & static_cast<uint32_t>(ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK);
}

extern "C" uint32_t isaac_log_teardown_guard_after(uint32_t guard) {
  if (isaac_log_teardown_engaged(guard) == 0) {
    /* D-LOG-3: no store at all. guard 0 stays 0 and the logger stays LIVE. */
    return guard;
  }
  return 1u; /* 0x00a71bec mov dword ptr [0xc7de48], 1 */
}

extern "C" uint32_t isaac_log_teardown_byte_after(uint32_t guard) {
  /* 0x00a71bf6 is the `jne` target AND the fallthrough from 0x00a71bec: it
     runs whether or not the guard block did. */
  (void)guard;
  return 0u;
}

extern "C" int32_t isaac_log_post_teardown_blocks_all(uint32_t guard_before) {
  /* Compose with the v1 entry gate rather than restating it. */
  return isaac_log_guard_blocks(isaac_log_teardown_guard_after(guard_before));
}

extern "C" int32_t isaac_log_teardown_leaves_logger_live(
    uint32_t guard_before) {
  return isaac_log_post_teardown_blocks_all(guard_before) != 0 ? 0 : 1;
}

extern "C" uint32_t isaac_log_teardown_critsec_free_size(void) {
  /* push 0x1c at 0x00a71bd0, matching the push 0x1c allocation at
     0x00a15780 in the holder init. */
  return static_cast<uint32_t>(ISAAC_LOG_CRITSEC_SIZE);
}

/* ==================== v2: LK — the boot-side installer ================== */

extern "C" int32_t isaac_log_installer_prev_destroy_needed(
    uint32_t prev_listener_ptr) {
  /* 0x00a5f3c5 mov ecx,[0xc79bd8] ; 0x00a5f3cb test ecx,ecx ; je 0xa5f3df */
  return prev_listener_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_log_installer_listener_ptr_after(uint32_t sink_ptr) {
  /* 0x00a5f478 stores ESI on the success arm; 0x00a5f480 stores 0 on the
     allocation-failure arm, and ESI is exactly 0 there. */
  return sink_ptr;
}

extern "C" uint32_t isaac_log_installer_listener_mask_after(
    uint32_t sink_ptr) {
  /* 0x00a5f48a is the JOIN of the success `jmp 0xa5f48a` and the failure
     fallthrough from 0x00a5f480, so the store does not depend on sink_ptr
     (nor on any configuration value — the function reads none). */
  (void)sink_ptr;
  return static_cast<uint32_t>(ISAAC_LOG_INSTALLER_MASK);
}

extern "C" int32_t isaac_log_installer_mask_unconditional(void) {
  return 1;
}

extern "C" int32_t isaac_log_installer_mask_set_without_sink(void) {
  return 1; /* D-LOG-4, REPRODUCED never corrected. */
}

extern "C" int32_t isaac_log_installer_sink_state(uint32_t sink_ptr,
                                                  uint32_t file_handle) {
  if (sink_ptr == 0u) {
    return ISAAC_LOG_SINK_STATE_NONE;
  }
  /* 0x00a5f3fd mov [esi+4], 2 ; then 0x00a5f442 test eax,eax ; je 0xa5f460
     skips 0x00a5f44c mov [esi+4], 1. FULL 32-bit test on the FILE*. */
  return file_handle != 0u ? ISAAC_LOG_SINK_STATE_OPEN
                           : ISAAC_LOG_SINK_STATE_NO_FILE;
}

extern "C" int32_t isaac_log_listener_hit_after_install(uint32_t sink_ptr,
                                                        uint32_t level) {
  return isaac_log_listener_hit_pre(
      isaac_log_installer_listener_ptr_after(sink_ptr),
      isaac_log_installer_listener_mask_after(sink_ptr), level);
}

/* ==================== v2: LL — the whole lifecycle plan ================= */

extern "C" void isaac_log_teardown_plan(uint32_t guard,
                                        uint32_t listener_ptr_pre,
                                        uint32_t listener_ptr_post,
                                        uint32_t listener_mask,
                                        uint32_t critsec_ptr,
                                        uint32_t holder_flags,
                                        IsaacLogTeardownPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* Block (A) first — it precedes block (B) by ~0x360 bytes of unrelated
     engine teardown, and nothing between them touches these cells. */
  out->flush_needed = isaac_log_teardown_flush_needed(listener_ptr_pre);
  out->destroy_needed =
      isaac_log_teardown_destroy_needed(listener_ptr_pre, listener_ptr_post);
  out->listener_ptr_after =
      isaac_log_teardown_listener_ptr_after(listener_ptr_pre, listener_ptr_post);
  out->listener_mask_after =
      isaac_log_teardown_listener_mask_after(listener_mask);
  out->second_flush_reached =
      isaac_log_teardown_second_flush_reached(listener_ptr_pre,
                                              listener_ptr_post);
  /* Block (B). */
  out->engaged = isaac_log_teardown_engaged(guard);
  out->critsec_delete_needed =
      isaac_log_teardown_critsec_delete_needed(guard, critsec_ptr);
  out->critsec_ptr_after =
      isaac_log_teardown_critsec_ptr_after(guard, critsec_ptr);
  out->holder_flags_after =
      isaac_log_teardown_holder_flags_after(guard, holder_flags);
  out->guard_after = isaac_log_teardown_guard_after(guard);
  out->logger_live_after = isaac_log_teardown_leaves_logger_live(guard);
  out->teardown_byte_after = isaac_log_teardown_byte_after(guard);
}

/* ================= v3: LM — the init 0x00a710a0 =================
   Body 0x00a710a0..0x00a714db, decoded linearly with resync: 271
   instructions, ZERO undecodable bytes, ZERO orphan blocks. Single caller
   0x00a5f18c, zero address escapes, zero inbound transfers. Everything
   below the pure gates — the guest allocations (0x40, 0x1c, 0xc, 0x10),
   InitializeCriticalSection, the window/thread/engine setup, the virtual
   calls and the two logger edges themselves — stays an address-stable HOST
   action. */

extern "C" int32_t isaac_log_init_already_initialized(
    uint32_t lifecycle_byte) {
  /* 0x00a710cb cmp byte ptr [0xc78aad], 0 ; 0x00a710d2 je 0x00a710e3.
     Grp1 Eb,Ib against ZERO: this is NOT the bit-0 `test Eb,1` that the two
     later gates use, so a cell holding 2 DOES warn here. The parameter is
     wide and narrowed here (toolchain defect guard). */
  return (lifecycle_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_log_init_warn_level(void) {
  /* push 0x10 at 0x00a710d9 and again at 0x00a71406 (6a 10 both times). */
  return static_cast<uint32_t>(ISAAC_LOG_INIT_WARN_LEVEL);
}

extern "C" uint32_t isaac_log_init_warn_vararg_count(void) {
  /* add esp, 8 at 0x00a710e0 / 0x00a7140d. Routed through the v1 law. */
  return isaac_log_vararg_dword_count(
      static_cast<uint32_t>(ISAAC_LOG_INIT_WARN_CLEANUP_IMM));
}

extern "C" int32_t isaac_log_init_args_published(void) {
  /* 0x00a710e5 dominates both rets (measured), as does 0x00a710eb. */
  return 1;
}

extern "C" int32_t isaac_log_init_object_allocated(uint32_t alloc_result) {
  /* 0x00a71105 test esi,esi ; 0x00a71107 je 0x00a711e2 — FULL 32-bit. */
  return alloc_result != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_log_init_object_after(uint32_t object_before,
                                                uint32_t alloc_result) {
  if (isaac_log_init_object_allocated(alloc_result) == 0) {
    /* 0x00a711e2 `xor esi,esi` joins at 0x00a711e4, AFTER the publish at
       0x00a711da: the global is simply not written on this arm. */
    return object_before;
  }
  return alloc_result;
}

extern "C" int32_t isaac_log_init_critsec_init_runs(uint32_t critsec_flags) {
  /* 0x00a7139a test byte ptr [0xc5ab48], 1 ; 0x00a713a1 jne 0x00a713db.
     Grp3 Eb,Ib — bit 0 of the LOW BYTE only. */
  return ((critsec_flags & 0xffu) &
          static_cast<uint32_t>(ISAAC_LOG_INIT_CRITSEC_READY_BIT)) != 0u
             ? 0
             : 1;
}

extern "C" uint32_t isaac_log_init_critsec_flags_after(
    uint32_t critsec_flags) {
  const uint32_t cell = critsec_flags & 0xffu;
  if (isaac_log_init_critsec_init_runs(critsec_flags) == 0) {
    return cell; /* the jne skipped the block entirely */
  }
  /* 0x00a713c5 movzx eax, byte ; 0x00a713cc bts eax, 0 ; 0x00a713d6 mov
     byte back — the bts operates on the zero-extended DWORD but only the
     low byte is stored. */
  return cell | static_cast<uint32_t>(ISAAC_LOG_INIT_CRITSEC_READY_BIT);
}

extern "C" uint32_t isaac_log_init_critsec_ptr_after(
    uint32_t critsec_flags, uint32_t critsec_ptr_before,
    uint32_t alloc_result) {
  if (isaac_log_init_critsec_init_runs(critsec_flags) == 0) {
    return critsec_ptr_before;
  }
  /* 0x00a713d0 `mov [0xc5ab4c], esi` sits in the tail SHARED by the
     InitializeCriticalSection arm and the allocation-failure arm
     (0x00a713c3 `xor esi,esi`), so it stores the raw allocation result. */
  return alloc_result;
}

extern "C" int32_t isaac_log_init_critsec_marked_without_critsec(void) {
  return 1; /* D-LOG-6, REPRODUCED never corrected. */
}

extern "C" int32_t isaac_log_init_cmd_thread_warns(
    uint32_t cmd_thread_flags) {
  /* 0x00a713f8 test byte ptr [0xc79a7c], 1 ; 0x00a713ff je 0x00a71412.
     Bit 0 again — a cell holding 2 does NOT warn. */
  return ((cmd_thread_flags & 0xffu) &
          static_cast<uint32_t>(ISAAC_LOG_INIT_CMD_THREAD_READY_BIT)) != 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_log_init_cmd_thread_creates(
    uint32_t cmd_thread_flags) {
  return isaac_log_init_cmd_thread_warns(cmd_thread_flags) != 0 ? 0 : 1;
}

extern "C" uint32_t isaac_log_init_cmd_thread_flags_after(
    uint32_t cmd_thread_flags) {
  const uint32_t cell = cmd_thread_flags & 0xffu;
  if (isaac_log_init_cmd_thread_creates(cmd_thread_flags) == 0) {
    /* 0x00a71410 jmp 0x00a7145f jumps PAST the bts/store pair. */
    return cell;
  }
  /* 0x00a7144f movzx / 0x00a71456 bts eax,0 / 0x00a7145a mov byte back. */
  return cell |
         static_cast<uint32_t>(ISAAC_LOG_INIT_CMD_THREAD_READY_BIT);
}

extern "C" uint32_t isaac_log_init_lifecycle_byte_after(
    uint32_t lifecycle_before, uint32_t init_ok) {
  const uint32_t cell = lifecycle_before & 0xffu;
  if ((init_ok & 0xffu) == 0u) {
    /* the AL=0 return at 0x00a714db is reached through one of the three
       `je 0x00a714c9` branches, all of which precede 0x00a714af. */
    return cell;
  }
  return 1u; /* 0x00a714af mov byte ptr [0xc78aad], 1 */
}

extern "C" int32_t isaac_log_init_devirtualizes_to_mutex_init(void) {
  /* 0x00a711a5 cmp eax, 0x00a15770 — the immediate IS the logger's own
     holder-init body (static_assert below). */
  return 1;
}

extern "C" uint32_t isaac_log_init_guard_after(uint32_t guard,
                                               uint32_t lifecycle_byte,
                                               uint32_t cmd_thread_flags) {
  uint32_t g = guard;
  const uint32_t level = isaac_log_init_warn_level();
  /* Edge 1 at 0x00a710db, then edge 2 at 0x00a71408 — PE order. Both are
     level 0x10, whose LOW BYTE is nonzero, so the v1 emit gate passes
     regardless of listener state; 0/0 is therefore not a simplification
     but the same answer any listener pair would give (asserted in tests).
     init_ok comes from the D-LOG-2 pin rather than a literal. */
  const uint32_t init_ok =
      static_cast<uint32_t>(isaac_log_init_always_succeeds());
  if (isaac_log_init_already_initialized(lifecycle_byte) != 0) {
    g = isaac_log_guard_after(g, level, 0u, 0u, init_ok);
  }
  if (isaac_log_init_cmd_thread_warns(cmd_thread_flags) != 0) {
    g = isaac_log_guard_after(g, level, 0u, 0u, init_ok);
  }
  return g;
}

/* ================= v3: LN — the D-LOG-3 answer ================= */

extern "C" uint32_t isaac_log_boot_log_level(void) {
  /* 0x00931170 `6a 01` — the immediate pushed for the site at 0x00931172
     that dominates the teardown call 0x0093140e. */
  return static_cast<uint32_t>(ISAAC_LOG_BOOT_LOG_LEVEL);
}

extern "C" int32_t isaac_log_boot_site_dominates_teardown(void) {
  /* Measured on IsaacMain's per-instruction CFG (259 instructions, zero
     undecodable bytes). The single orphan block 0x00931458 is the unwind
     funclet and it `ret`s; the __except handler 0x00931461 returns from
     IsaacMain without reaching 0x0093140e. */
  return 1;
}

extern "C" uint32_t isaac_log_guard_after_boot_site(uint32_t guard_before) {
  return isaac_log_guard_after(
      guard_before, isaac_log_boot_log_level(), 0u, 0u,
      static_cast<uint32_t>(isaac_log_init_always_succeeds()));
}

extern "C" uint32_t isaac_log_shipped_guard_at_teardown(
    uint32_t guard_at_boot_site) {
  /* Between 0x00931172 and 0x00a71bac the only writer that could restore 0
     is 0x00a11381, structurally dead (D-LOG-2), so the boot-site transition
     is the whole story. */
  return isaac_log_guard_after_boot_site(guard_at_boot_site);
}

extern "C" int32_t isaac_log_guard_zero_at_teardown_reachable(void) {
  return 0; /* D-LOG-3 answered: it cannot. */
}

extern "C" int32_t isaac_log_shipped_teardown_leaves_logger_live(void) {
  /* The guard is 0 at load; the dominating site takes it to 2, the teardown
     gate engages and pins 1, and the v1 entry gate then blocks. Derived
     from the pinned laws so any mutant on them lands here. */
  return isaac_log_teardown_leaves_logger_live(
      isaac_log_shipped_guard_at_teardown(
          static_cast<uint32_t>(ISAAC_LOG_GUARD_UNINIT)));
}

extern "C" int32_t isaac_log_shipped_post_teardown_blocks_all(
    uint32_t guard_at_boot_site) {
  return isaac_log_post_teardown_blocks_all(
      isaac_log_shipped_guard_at_teardown(guard_at_boot_site));
}

extern "C" int32_t isaac_log_guard_value_reachable(uint32_t guard) {
  /* The four enumerated writers store the literals 1, 2, 0 and 1; the cell
     has zero address escapes in any of the five sections, so nothing else
     can produce a value. */
  return (guard == static_cast<uint32_t>(ISAAC_LOG_GUARD_UNINIT) ||
          guard == static_cast<uint32_t>(ISAAC_LOG_GUARD_BUSY) ||
          guard == static_cast<uint32_t>(ISAAC_LOG_GUARD_READY))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_lifecycle_byte_after_init_then_teardown(
    uint32_t lifecycle_before, uint32_t init_ok) {
  /* 0x00a714af (conditional on success) then 0x00a71bf6 (unconditional).
     The teardown byte store ignores the guard, so the composition collapses
     to 0 — but it is COMPOSED, not written as 0, so a mutant that makes
     0x00a71bf6 conditional changes this result. */
  const uint32_t after_init =
      isaac_log_init_lifecycle_byte_after(lifecycle_before, init_ok);
  return isaac_log_teardown_byte_after(after_init);
}

/* ==================== v3: LO — the init plan ==================== */

extern "C" void isaac_log_init_plan(uint32_t lifecycle_byte,
                                    uint32_t guard,
                                    uint32_t object_before,
                                    uint32_t object_alloc,
                                    uint32_t critsec_flags,
                                    uint32_t critsec_ptr_before,
                                    uint32_t critsec_alloc,
                                    uint32_t cmd_thread_flags,
                                    uint32_t init_ok,
                                    IsaacLogInitPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t already = isaac_log_init_already_initialized(lifecycle_byte);
  const int32_t warns = isaac_log_init_cmd_thread_warns(cmd_thread_flags);

  out->already_initialized = already;
  out->warn_emitted = already;
  out->args_published = isaac_log_init_args_published();
  out->object_allocated = isaac_log_init_object_allocated(object_alloc);
  out->object_after = isaac_log_init_object_after(object_before, object_alloc);
  out->critsec_init_runs = isaac_log_init_critsec_init_runs(critsec_flags);
  out->critsec_flags_after = isaac_log_init_critsec_flags_after(critsec_flags);
  out->critsec_ptr_after = isaac_log_init_critsec_ptr_after(
      critsec_flags, critsec_ptr_before, critsec_alloc);
  out->cmd_thread_warns = warns;
  out->cmd_thread_creates = isaac_log_init_cmd_thread_creates(cmd_thread_flags);
  out->cmd_thread_flags_after =
      isaac_log_init_cmd_thread_flags_after(cmd_thread_flags);
  out->log_sites_taken = already + warns;
  out->guard_after =
      isaac_log_init_guard_after(guard, lifecycle_byte, cmd_thread_flags);
  out->returns_ok = (init_ok & 0xffu) != 0u ? 1 : 0;
  out->lifecycle_byte_after =
      isaac_log_init_lifecycle_byte_after(lifecycle_byte, init_ok);
}

/* ================== v4: the mutex lock / unlock pair ==================
   0x00a157f0 (vtbl+0xc) and 0x00a159a0 (vtbl+0x10). Reached ONLY through
   the vtable: 0 direct rel32 calls, 0 tail jumps, 0 immediate
   materialisations, and exactly one raw LE-dword occurrence each across all
   five sections (the slot itself, .rdata 0x00b81c18 / 0x00b81c1c).

   EnterCriticalSection / TryEnterCriticalSection / LeaveCriticalSection /
   Sleep / QueryPerformanceCounter / QueryPerformanceFrequency are KERNEL32
   imports and stay platform primitives under the logger standing decision.
   Every decision AROUND them is translated below.

   D-LOG-7 and D-LOG-8 are REPRODUCED, never corrected. */

namespace {

/* Grp3 `F6 /0 ib` with imm8 = 1 on holder+4 — bit 0 of the LOW BYTE. The
   parameter is deliberately wide; the mask is explicit. */
inline int32_t ready_bit_set_impl(uint32_t holder_flags) {
  return ((holder_flags & 0xffu) &
          static_cast<uint32_t>(ISAAC_LOG_LOCK_READY_BIT)) != 0u
             ? 1
             : 0;
}

/* `cmp byte ptr [esi+0x18], 0` — the ownership cell, LOW BYTE only. */
inline int32_t owned_low_byte_set_impl(uint32_t owned_byte) {
  return (owned_byte & 0xffu) != 0u ? 1 : 0;
}

/* The MSVC magic division transcribed limb by limb from 0x00a15858, not
   folded to a `/`: eight 32x32 `mul`s against 0x431bde82d7b634db, the adc
   chain of 0x00a15894..0x00a158b6, then `shrd ecx,edx,0x12` + `shr edx,
   0x12`. Kept in this shape on purpose — the JS oracle does the same
   arithmetic as one 128-bit BigInt product, so a mis-transcription here
   cannot agree with it by construction. */
struct MsPair {
  uint32_t lo;
  uint32_t hi;
};

inline MsPair ticks_to_ms_impl(uint32_t ns_hi, uint32_t ns_lo) {
  const uint32_t ml = ISAAC_LOG_LOCK_MS_MAGIC_LO;
  const uint32_t mh = ISAAC_LOG_LOCK_MS_MAGIC_HI;
  const uint64_t p0 = static_cast<uint64_t>(ns_lo) * ml; /* mul edx  */
  const uint64_t p1 = static_cast<uint64_t>(ns_lo) * mh; /* mul edi  */
  const uint64_t p2 = static_cast<uint64_t>(ns_hi) * ml; /* mul ecx  */
  const uint64_t p3 = static_cast<uint64_t>(ns_hi) * mh; /* mul edx  */

  /* 0x00a15894 add ecx, esi  (lo(hi*ml) + hi(lo*ml)) */
  uint64_t t = static_cast<uint64_t>(static_cast<uint32_t>(p2)) +
               static_cast<uint32_t>(p0 >> 32);
  uint32_t ecx = static_cast<uint32_t>(t);
  /* 0x00a1589a adc ebx, 0 */
  uint32_t ebx = static_cast<uint32_t>((p2 >> 32) + (t >> 32));
  /* 0x00a1589d add edi, ecx */
  t = static_cast<uint64_t>(static_cast<uint32_t>(p1)) + ecx;
  /* 0x00a158a3 adc ecx, 0  (ecx now holds hi(lo*mh)) */
  const uint32_t ecx2 = static_cast<uint32_t>((p1 >> 32) + (t >> 32));
  /* 0x00a158aa xor eax,eax ; 0x00a158ac add ebx, ecx ; 0x00a158b2 adc eax,eax */
  t = static_cast<uint64_t>(ebx) + ecx2;
  ebx = static_cast<uint32_t>(t);
  const uint32_t eax = static_cast<uint32_t>(t >> 32);
  /* 0x00a158b4 add ecx, ebx ; 0x00a158b6 adc edx, eax */
  t = static_cast<uint64_t>(static_cast<uint32_t>(p3)) + ebx;
  const uint32_t lo128hi = static_cast<uint32_t>(t);
  const uint32_t hi128hi =
      static_cast<uint32_t>((p3 >> 32) + eax + (t >> 32));
  /* 0x00a158b8 shrd ecx, edx, 0x12 ; 0x00a158bc shr edx, 0x12 */
  const uint32_t sh = ISAAC_LOG_LOCK_MS_SHIFT;
  MsPair out;
  out.lo = static_cast<uint32_t>((lo128hi >> sh) | (hi128hi << (32u - sh)));
  out.hi = hi128hi >> sh;
  return out;
}

}  // namespace

/* ---------- LP: the shared assert guard ---------- */

extern "C" int32_t isaac_log_lock_assert_fires(uint32_t holder_flags) {
  /* 0x00a157fe test byte [eax+4],1 ; 0x00a15806 jne 0x00a1581b — the assert
     runs on the FALL-THROUGH, i.e. when bit 0 is CLEAR. */
  return ready_bit_set_impl(holder_flags) != 0 ? 0 : 1;
}

extern "C" int32_t isaac_log_unlock_assert_fires(uint32_t holder_flags) {
  /* 0x00a159a3 / 0x00a159a7 — the same template, ESI operand form. Written
     out again rather than aliased so a cross-helper differential can prove
     the two encodings implement one law. */
  return ((holder_flags & 0xffu) &
          static_cast<uint32_t>(ISAAC_LOG_LOCK_READY_BIT)) == 0u
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_lock_assert_string_va(uint32_t is_unlock,
                                                    uint32_t holder_flags) {
  if (is_unlock != 0u) {
    return isaac_log_unlock_assert_fires(holder_flags) != 0
               ? static_cast<uint32_t>(ISAAC_LOG_UNLOCK_ASSERT_STRING_VA)
               : 0u;
  }
  return isaac_log_lock_assert_fires(holder_flags) != 0
             ? static_cast<uint32_t>(ISAAC_LOG_LOCK_ASSERT_STRING_VA)
             : 0u;
}

extern "C" uint32_t isaac_log_lock_assert_vararg_count(void) {
  /* `add esp, 8` at 0x00a15818 and 0x00a159b5, through the v1 law. */
  return isaac_log_vararg_dword_count(
      static_cast<uint32_t>(ISAAC_LOG_LOCK_ASSERT_CLEANUP_IMM));
}

extern "C" int32_t isaac_log_lock_assert_sets_ready_bit(void) {
  /* Byte-diffed against the lazy-init template: this one has no `6a 1c`
     allocation, no `ff 15 78 82 b1 00`, no `0f ba e8 00` and no store to
     holder+4 on ANY path. */
  return 0;
}

extern "C" int32_t isaac_log_lock_assert_is_lazy_init_template(void) {
  /* THE v4 FINDING: only the 4-byte predicate is shared. */
  return 0;
}

extern "C" uint32_t isaac_log_lock_holder_flags_after(uint32_t holder_flags) {
  return holder_flags & 0xffu;
}

extern "C" int32_t isaac_log_lock_assert_reachable_from_logger(void) {
  return 0;
}

/* ---------- LQ: the timeout discriminator ---------- */

extern "C" int32_t isaac_log_lock_timeout_infinite(uint32_t timeout) {
  /* 0x00a1581b cmp dword ptr [ebp+8], -1 ; 0x00a1581f jne — FULL 32-bit
     equality. A sign test would wrongly take 0x80000000. */
  return timeout == static_cast<uint32_t>(ISAAC_LOG_LOCK_TIMEOUT_INFINITE)
             ? 1
             : 0;
}

extern "C" int32_t isaac_log_lock_timeout_arm(uint32_t timeout) {
  if (isaac_log_lock_timeout_infinite(timeout) != 0) {
    return ISAAC_LOG_LOCK_ARM_INFINITE;
  }
  /* 0x00a158bf cmp dword ptr [ebp+8], 0 ; 0x00a158cb jbe — UNSIGNED, and
     `cmp x,0` never sets CF, so the branch is exactly `x == 0`. A `jle`
     reading would send 0x80000000 down the immediate-failure arm. */
  if (timeout == 0u) {
    return ISAAC_LOG_LOCK_ARM_ZERO_TIMEOUT;
  }
  return ISAAC_LOG_LOCK_ARM_TIMED;
}

extern "C" int32_t isaac_log_lock_zero_timeout_tries(void) {
  /* The `jbe` at 0x00a158cb targets 0x00a1598e, above the loop head. */
  return 0;
}

/* ---------- LR: the INFINITE spin loop ---------- */

extern "C" int32_t isaac_log_lock_spin_entered(uint32_t owned_byte) {
  /* 0x00a1582b cmp byte ptr [esi+0x18], 0 ; 0x00a1582f je 0x00a15844. */
  return owned_low_byte_set_impl(owned_byte);
}

extern "C" int32_t isaac_log_lock_spin_continues(uint32_t owned_byte) {
  /* 0x00a1583e / 0x00a15842 jne 0x00a15837 — the same low-byte test at the
     bottom of every iteration. */
  return owned_low_byte_set_impl(owned_byte);
}

extern "C" uint32_t isaac_log_lock_spin_sleep_ms(void) {
  return ISAAC_LOG_LOCK_SPIN_SLEEP_MS;
}

extern "C" int32_t isaac_log_lock_spin_reloads_critsec(void) {
  /* ESI is written once, at 0x00a15821, above the loop. */
  return 0;
}

extern "C" int32_t isaac_log_lock_timed_reloads_critsec(void) {
  /* 0x00a158d1 mov eax,[esp+0x10] ; 0x00a158d5 mov esi,[eax+8] — inside the
     retry loop, so the timed arm DOES re-read it every pass. */
  return 1;
}

extern "C" int32_t isaac_log_lock_spin_bounded(void) {
  return 0;
}

extern "C" int32_t isaac_log_lock_spin_rereads_sleep_pointer(void) {
  /* 0x00a15831 mov edi,[0x00b182d8] sits ABOVE the loop head 0x00a15837. */
  return 0;
}

extern "C" int32_t isaac_log_lock_spin_holds_critsec(void) {
  /* D-LOG-8: 0x00a15825 enters and no back-edge path leaves. */
  return 1;
}

extern "C" int32_t isaac_log_unlock_enters_critsec(void) {
  /* 0x00a159a0..0x00a159c7 contains exactly one API call, and it is
     LeaveCriticalSection [0x00b18268] at 0x00a159c0. */
  return 0;
}

extern "C" int32_t isaac_log_lock_self_reentrant_spins_forever(void) {
  return 1;
}

extern "C" uint32_t isaac_log_lock_spin_iterations(uint32_t owned_byte,
                                                   uint32_t clear_after,
                                                   uint32_t ever_clears) {
  if (isaac_log_lock_spin_entered(owned_byte) == 0) {
    return 0u; /* 0x00a1582f took the je straight to 0x00a15844 */
  }
  if (ever_clears == 0u) {
    return ISAAC_LOG_LOCK_SPIN_NEVER_RETURNS;
  }
  /* The loop sleeps, THEN re-tests, so observing the byte clear after N
     sleeps costs exactly N iterations and N >= 1. */
  return clear_after == 0u ? 1u : clear_after;
}

/* ---------- LS: the timed retry arm ---------- */

extern "C" int32_t isaac_log_lock_try_entered(uint32_t try_result) {
  /* 0x00a158df test eax,eax ; setne cl — FULL 32-bit on the BOOL. */
  return try_result != 0u ? 1 : 0;
}

extern "C" int32_t isaac_log_lock_try_arm(uint32_t try_result,
                                          uint32_t owned_byte) {
  if (isaac_log_lock_try_entered(try_result) == 0) {
    /* 0x00a158e6 je 0x00a158f7, then `test cl,cl` with cl == 0. */
    return ISAAC_LOG_LOCK_TRY_ARM_SLEEP;
  }
  if (owned_low_byte_set_impl(owned_byte) != 0) {
    /* 0x00a158ec falls through to the give-back Leave at 0x00a158ef. */
    return ISAAC_LOG_LOCK_TRY_ARM_LEAVE_AND_SLEEP;
  }
  /* 0x00a158f9 jne 0x00a15848. */
  return ISAAC_LOG_LOCK_TRY_ARM_SUCCESS;
}

extern "C" int32_t isaac_log_lock_try_leaves(uint32_t try_result,
                                             uint32_t owned_byte) {
  return isaac_log_lock_try_arm(try_result, owned_byte) ==
                 ISAAC_LOG_LOCK_TRY_ARM_LEAVE_AND_SLEEP
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_lock_retry_sleep_ms(void) {
  return ISAAC_LOG_LOCK_RETRY_SLEEP_MS;
}

extern "C" uint32_t isaac_log_lock_ticks_to_ms_lo(uint32_t ns_hi,
                                                  uint32_t ns_lo) {
  return ticks_to_ms_impl(ns_hi, ns_lo).lo;
}

extern "C" uint32_t isaac_log_lock_ticks_to_ms_hi(uint32_t ns_hi,
                                                  uint32_t ns_lo) {
  return ticks_to_ms_impl(ns_hi, ns_lo).hi;
}

extern "C" int32_t isaac_log_lock_elapsed_expired(uint32_t elapsed_hi,
                                                  uint32_t elapsed_lo,
                                                  uint32_t timeout) {
  /* 0x00a1597b test edx,edx clears CF, so 0x00a1597d `jb 0x00a158d1` is
     statically dead and the high dword can only EXPIRE (0x00a15983 ja),
     never retry. */
  if (elapsed_hi != 0u) {
    return 1;
  }
  /* 0x00a15985 cmp ecx,[ebp+8] ; 0x00a15988 jb 0x00a158d1 — UNSIGNED and
     STRICT, so elapsed == timeout expires. */
  return elapsed_lo < timeout ? 0 : 1;
}

extern "C" int32_t isaac_log_lock_underflow_branch_dead(void) {
  return 1;
}

extern "C" int32_t isaac_log_lock_start_refetched(void) {
  /* 0x00a15853 is above the loop head 0x00a158d1; [esp+0xc]/[esp+0x20] are
     not written by the second clock block (0x00a15914/0x18/0x28). */
  return 0;
}

extern "C" int32_t isaac_log_lock_now_refetched(void) {
  /* 0x00a15907 call 0x00a68490 is inside the loop. */
  return 1;
}

/* ---------- LT: the ownership store, and D-LOG-7 ---------- */

extern "C" int32_t isaac_log_lock_marks_owned(uint32_t timeout,
                                              uint32_t try_result,
                                              uint32_t owned_byte) {
  const int32_t arm = isaac_log_lock_timeout_arm(timeout);
  if (arm == ISAAC_LOG_LOCK_ARM_INFINITE) {
    /* 0x00a15844 is on the INFINITE arm's fall-through and on the spin
       exit; both reach it. */
    return 1;
  }
  if (arm == ISAAC_LOG_LOCK_ARM_ZERO_TIMEOUT) {
    return 0;
  }
  /* D-LOG-7: the timed success branch 0x00a158f9 targets 0x00a15848 and
     jumps OVER 0x00a15844. Reproduced, never corrected. */
  (void)try_result;
  (void)owned_byte;
  return 0;
}

extern "C" uint32_t isaac_log_lock_owned_byte_after(uint32_t timeout,
                                                    uint32_t try_result,
                                                    uint32_t owned_byte) {
  if (isaac_log_lock_marks_owned(timeout, try_result, owned_byte) != 0) {
    return ISAAC_LOG_LOCK_OWNED_VALUE;
  }
  return owned_byte & 0xffu;
}

extern "C" int32_t isaac_log_timed_success_skips_owned_store(void) {
  return 1;
}

extern "C" int32_t isaac_log_lock_acquired(uint32_t timeout,
                                           uint32_t try_result,
                                           uint32_t owned_byte,
                                           uint32_t elapsed_hi,
                                           uint32_t elapsed_lo) {
  const int32_t arm = isaac_log_lock_timeout_arm(timeout);
  if (arm == ISAAC_LOG_LOCK_ARM_INFINITE) {
    return 1; /* 0x00a15848 mov al,1 — the only exit of that arm */
  }
  if (arm == ISAAC_LOG_LOCK_ARM_ZERO_TIMEOUT) {
    return 0; /* 0x00a158cb jbe 0x00a1598e -> xor al,al */
  }
  if (isaac_log_lock_try_arm(try_result, owned_byte) ==
      ISAAC_LOG_LOCK_TRY_ARM_SUCCESS) {
    return 1;
  }
  /* One pass of the retry test: expired -> 0x00a1598e, else another try. */
  return isaac_log_lock_elapsed_expired(elapsed_hi, elapsed_lo, timeout) != 0
             ? 0
             : -1; /* -1: the loop takes another pass, no ret yet */
}

/* ---------- LU: the unlock ---------- */

extern "C" uint32_t isaac_log_unlock_owned_byte_after(uint32_t owned_before) {
  /* 0x00a159bc mov byte ptr [eax+0x18], 0 — unconditional, and reached even
     on the arm that just asserted the mutex is uninitialised. */
  (void)owned_before;
  return 0u;
}

extern "C" int32_t isaac_log_unlock_clears_before_leave(void) {
  /* 0x00a159bc precedes 0x00a159c0. */
  return 1;
}

extern "C" int32_t isaac_log_unlock_takes_timeout(void) {
  /* 0x00a159c7 is a plain `ret`; 0x00a15850 / 0x00a15996 are `ret 4`. */
  return 0;
}

/* ---------- LV: the D-LOG-6 interaction ---------- */

extern "C" int32_t isaac_log_lock_null_critsec_reached(uint32_t holder_flags,
                                                       uint32_t critsec_ptr) {
  /* The wrapper dereferences holder+8 on EVERY arm; the only thing that
     could have stopped it is the assert, and the assert only reads bit 0 —
     which D-LOG-6 sets on the allocation-failure arm of 0x00a15770. */
  if (critsec_ptr != 0u) {
    return 0;
  }
  return ready_bit_set_impl(holder_flags);
}

extern "C" int32_t isaac_log_lock_asserts_on_failed_init(void) {
  return 0;
}

extern "C" uint32_t isaac_log_lock_first_null_access_va(uint32_t is_unlock,
                                                        uint32_t timeout) {
  if (is_unlock != 0u) {
    /* A STORE, and it precedes the API call. */
    return ISAAC_LOG_VA_UNLOCK_OWNED_STORE;
  }
  return isaac_log_lock_timeout_arm(timeout) == ISAAC_LOG_LOCK_ARM_INFINITE
             ? static_cast<uint32_t>(ISAAC_LOG_VA_LOCK_ENTER_CALL)
             : static_cast<uint32_t>(ISAAC_LOG_VA_LOCK_TRY_CALL);
}

/* ---------- LW: the plans ---------- */

extern "C" void isaac_log_lock_plan(uint32_t holder_flags,
                                    uint32_t critsec_ptr,
                                    uint32_t timeout,
                                    uint32_t owned_byte,
                                    uint32_t try_result,
                                    uint32_t spin_ever_clears,
                                    uint32_t elapsed_hi,
                                    uint32_t elapsed_lo,
                                    IsaacLogLockPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t arm = isaac_log_lock_timeout_arm(timeout);
  const int32_t fires = isaac_log_lock_assert_fires(holder_flags);
  out->assert_fires = fires;
  out->assert_string_va = isaac_log_lock_assert_string_va(0u, holder_flags);
  out->arm = arm;
  out->enter_call = arm == ISAAC_LOG_LOCK_ARM_INFINITE ? 1 : 0;
  out->try_call = arm == ISAAC_LOG_LOCK_ARM_TIMED ? 1 : 0;
  out->leave_call = arm == ISAAC_LOG_LOCK_ARM_TIMED
                        ? isaac_log_lock_try_leaves(try_result, owned_byte)
                        : 0;
  out->spin_entered = arm == ISAAC_LOG_LOCK_ARM_INFINITE
                          ? isaac_log_lock_spin_entered(owned_byte)
                          : 0;
  if (arm == ISAAC_LOG_LOCK_ARM_INFINITE) {
    out->sleep_ms = out->spin_entered != 0 ? isaac_log_lock_spin_sleep_ms()
                                           : 0u;
  } else if (arm == ISAAC_LOG_LOCK_ARM_TIMED) {
    out->sleep_ms = isaac_log_lock_try_arm(try_result, owned_byte) ==
                            ISAAC_LOG_LOCK_TRY_ARM_SUCCESS
                        ? 0u
                        : isaac_log_lock_retry_sleep_ms();
  } else {
    out->sleep_ms = 0u;
  }
  const int32_t spins_forever =
      arm == ISAAC_LOG_LOCK_ARM_INFINITE && out->spin_entered != 0 &&
      spin_ever_clears == 0u;
  out->returns = spins_forever ? 0 : 1;
  const int32_t al =
      isaac_log_lock_acquired(timeout, try_result, owned_byte, elapsed_hi,
                              elapsed_lo);
  out->acquired = spins_forever ? 0 : al;
  const int32_t marks =
      isaac_log_lock_marks_owned(timeout, try_result, owned_byte);
  out->marks_owned = spins_forever ? 0 : marks;
  out->owned_byte_after =
      spins_forever
          ? (owned_byte & 0xffu)
          : isaac_log_lock_owned_byte_after(timeout, try_result, owned_byte);
  out->critsec_ptr = critsec_ptr;
  out->null_critsec_fault =
      isaac_log_lock_null_critsec_reached(holder_flags, critsec_ptr);
  out->fault_va = out->null_critsec_fault != 0
                      ? isaac_log_lock_first_null_access_va(0u, timeout)
                      : 0u;
}

extern "C" void isaac_log_unlock_plan(uint32_t holder_flags,
                                      uint32_t critsec_ptr,
                                      uint32_t owned_byte,
                                      IsaacLogLockPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->assert_fires = isaac_log_unlock_assert_fires(holder_flags);
  out->assert_string_va = isaac_log_lock_assert_string_va(1u, holder_flags);
  out->arm = -1;      /* the unlock has no timeout argument at all */
  out->enter_call = isaac_log_unlock_enters_critsec();
  out->try_call = 0;
  out->leave_call = 1; /* 0x00a159c0, unconditional */
  out->spin_entered = 0;
  out->sleep_ms = 0u;
  out->returns = 1;
  out->acquired = 0;
  out->marks_owned = 0;
  out->owned_byte_after = isaac_log_unlock_owned_byte_after(owned_byte);
  out->critsec_ptr = critsec_ptr;
  out->null_critsec_fault =
      isaac_log_lock_null_critsec_reached(holder_flags, critsec_ptr);
  out->fault_va =
      out->null_critsec_fault != 0
          ? isaac_log_lock_first_null_access_va(1u, 0u)
          : 0u;
}

/* ================= v5: the mutex destroy template =====================
   0x00a157c0 (vtbl+0x8), 0x00a15730 and 0x00a156e0 (vtbl+0x0), plus the two
   constant-folded inline copies that operate on the logger's own holder:
   0x00a71bbf (the v2 teardown) and 0x00b16b20 (the atexit static dtor).

   DeleteCriticalSection (KERNEL32 import, IAT 0x00b18274) and the guest free
   behind 0x00aef15c -> 0x00a0f500 -> 0x00a648b0 stay PLATFORM PRIMITIVES.
   The ORDER in which they are issued, the arm that issues them, the size
   operands, the pointer store, the byte-wise ready-bit clear and both vtable
   stores are all game logic and are translated here.

   D-LOG-9 and D-LOG-10 are REPRODUCED, never corrected. */

namespace {

/* variant -> the entry instruction of the body (0 for an unknown index). */
inline uint32_t destroy_body_va_impl(uint32_t variant) {
  switch (variant) {
    case ISAAC_LOG_DESTROY_VARIANT_DESTROY:
      return ISAAC_LOG_VA_MUTEX_DESTROY;
    case ISAAC_LOG_DESTROY_VARIANT_UNWIND:
      return ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY;
    case ISAAC_LOG_DESTROY_VARIANT_DTOR:
      return ISAAC_LOG_VA_MUTEX_DTOR;
    case ISAAC_LOG_DESTROY_VARIANT_TEARDOWN:
      return ISAAC_LOG_VA_TEARDOWN_INLINE_DESTROY;
    case ISAAC_LOG_DESTROY_VARIANT_STATIC:
      return ISAAC_LOG_VA_STATIC_DTOR;
    default:
      return 0u;
  }
}

/* Variants 1, 2 and 4 carry `mov dword [this], 0x00b81c0c` on entry.
   Variants 0 and 3 do not touch the vptr at all. */
inline int32_t destroy_stores_vtable_impl(uint32_t variant) {
  return (variant == ISAAC_LOG_DESTROY_VARIANT_UNWIND ||
          variant == ISAAC_LOG_DESTROY_VARIANT_DTOR ||
          variant == ISAAC_LOG_DESTROY_VARIANT_STATIC)
             ? 1
             : 0;
}

inline int32_t destroy_variant_known_impl(uint32_t variant) {
  return variant < static_cast<uint32_t>(ISAAC_LOG_DESTROY_VARIANTS) ? 1 : 0;
}

}  // namespace

/* ---------- LX: the destroy body, gate by gate ---------- */

extern "C" int32_t isaac_log_destroy_frees_critsec(uint32_t critsec_ptr) {
  /* 0x00a157c7 `test edi, edi` ; 0x00a157c9 `je 0x00a157e4`. The operand is
     the whole pointer — deliberately NOT narrowed. */
  return critsec_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_log_destroy_stores_null_critsec(uint32_t critsec_ptr) {
  /* 0x00a157dd sits below the `je` target, so only the non-NULL arm stores. */
  return isaac_log_destroy_frees_critsec(critsec_ptr);
}

extern "C" uint32_t isaac_log_destroy_critsec_ptr_after(uint32_t critsec_ptr) {
  /* Non-NULL arm stores 0; NULL arm was already 0. */
  return isaac_log_destroy_stores_null_critsec(critsec_ptr) != 0 ? 0u
                                                                 : critsec_ptr;
}

extern "C" uint32_t isaac_log_destroy_critsec_free_size(void) {
  return static_cast<uint32_t>(ISAAC_LOG_MUTEX_CRITSEC_SIZE);
}

extern "C" int32_t isaac_log_destroy_sized_delete_ignores_size(void) {
  /* 0x00aef15c: `push [ebp+8] ; call 0x00a0f500 ; pop ecx ; ret` — the
     0x1c pushed at 0x00a157d2 never reaches the allocator. */
  return 1;
}

extern "C" uint32_t isaac_log_destroy_flags_after(uint32_t holder_flags) {
  /* 0x00a157e4 `80 66 04 fe` — Grp1 Eb,Ib. The AND applies to the LOW BYTE
     only; bits 8..31 of the cell are untouched. Written as an explicit
     recombination so -O2 cannot fold it away for a narrow argument. */
  const uint32_t low = holder_flags & 0xffu;
  const uint32_t cleared =
      low & static_cast<uint32_t>(ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK);
  return (holder_flags & 0xffffff00u) | cleared;
}

extern "C" int32_t isaac_log_destroy_clears_ready_bit(void) {
  return 1;
}

extern "C" int32_t isaac_log_destroy_clear_unconditional(void) {
  /* The `je` at 0x00a157c9 targets 0x00a157e4, which IS the clear. */
  return 1;
}

extern "C" int32_t isaac_log_destroy_is_idempotent(void) {
  /* From (0, NULL) the body takes the `je` and re-clears an already-clear
     bit: no call, no free, same end state. */
  return 1;
}

/* ---------- LY: the five instances of one template ---------- */

extern "C" uint32_t isaac_log_destroy_variants(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DESTROY_VARIANTS);
}

extern "C" uint32_t isaac_log_destroy_body_va(uint32_t variant) {
  return destroy_body_va_impl(variant);
}

extern "C" uint32_t isaac_log_destroy_entry_vtable_va(uint32_t variant) {
  return destroy_stores_vtable_impl(variant) != 0
             ? static_cast<uint32_t>(ISAAC_LOG_MUTEX_VTABLE_VA)
             : 0u;
}

extern "C" uint32_t isaac_log_destroy_exit_vtable_va(uint32_t variant) {
  return destroy_stores_vtable_impl(variant) != 0
             ? static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_BASE_VTABLE)
             : 0u;
}

extern "C" uint32_t isaac_log_destroy_clear_va(uint32_t variant) {
  switch (variant) {
    case ISAAC_LOG_DESTROY_VARIANT_DESTROY:
      return ISAAC_LOG_VA_DESTROY_CLEAR;
    case ISAAC_LOG_DESTROY_VARIANT_UNWIND:
      return ISAAC_LOG_VA_UNWIND_CLEAR;
    case ISAAC_LOG_DESTROY_VARIANT_DTOR:
      return ISAAC_LOG_VA_DTOR_CLEAR;
    case ISAAC_LOG_DESTROY_VARIANT_TEARDOWN:
      return ISAAC_LOG_VA_TEARDOWN_CLEAR;
    case ISAAC_LOG_DESTROY_VARIANT_STATIC:
      return ISAAC_LOG_VA_STATIC_DTOR_CLEAR;
    default:
      return 0u;
  }
}

extern "C" uint32_t isaac_log_destroy_stack_bytes_popped(uint32_t variant) {
  /* Only 0x00a156e0 ends `ret 4`; every other body ends with a plain `ret`
     (the two inline copies are not calls at all and pop nothing). */
  return variant == ISAAC_LOG_DESTROY_VARIANT_DTOR ? 4u : 0u;
}

extern "C" int32_t isaac_log_destroy_returns_this(uint32_t variant) {
  /* 0x00a15729 `mov eax, esi`, dtor only. */
  return variant == ISAAC_LOG_DESTROY_VARIANT_DTOR ? 1 : 0;
}

extern "C" int32_t isaac_log_destroy_has_delete_flag_gate(uint32_t variant) {
  return variant == ISAAC_LOG_DESTROY_VARIANT_DTOR ? 1 : 0;
}

extern "C" int32_t isaac_log_destroy_operates_on_logger_holder(
    uint32_t variant) {
  /* Variants 3 and 4 fold `this` to the literal 0x00c37958; the three
     out-of-line bodies take it in ecx and are never reached with it. */
  return (variant == ISAAC_LOG_DESTROY_VARIANT_TEARDOWN ||
          variant == ISAAC_LOG_DESTROY_VARIANT_STATIC)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_destroy_body_bytes(uint32_t variant) {
  switch (variant) {
    case ISAAC_LOG_DESTROY_VARIANT_DESTROY:
      return static_cast<uint32_t>(ISAAC_LOG_DESTROY_BODY_BYTES);
    case ISAAC_LOG_DESTROY_VARIANT_UNWIND:
      return static_cast<uint32_t>(ISAAC_LOG_UNWIND_DESTROY_BODY_BYTES);
    case ISAAC_LOG_DESTROY_VARIANT_DTOR:
      return static_cast<uint32_t>(ISAAC_LOG_DTOR_BODY_BYTES);
    default:
      return 0u; /* the inline copies have no standalone extent */
  }
}

extern "C" uint32_t isaac_log_destroy_shared_bytes(uint32_t variant_a,
                                                   uint32_t variant_b) {
  const uint32_t lo = variant_a < variant_b ? variant_a : variant_b;
  const uint32_t hi = variant_a < variant_b ? variant_b : variant_a;
  if (lo == hi) {
    return isaac_log_destroy_body_bytes(lo);
  }
  if (lo == ISAAC_LOG_DESTROY_VARIANT_DESTROY &&
      hi == ISAAC_LOG_DESTROY_VARIANT_UNWIND) {
    return static_cast<uint32_t>(ISAAC_LOG_DESTROY_SHARED_BYTES_0_1);
  }
  if (lo == ISAAC_LOG_DESTROY_VARIANT_UNWIND &&
      hi == ISAAC_LOG_DESTROY_VARIANT_DTOR) {
    return static_cast<uint32_t>(ISAAC_LOG_DESTROY_SHARED_BYTES_1_2);
  }
  if (lo == ISAAC_LOG_DESTROY_VARIANT_DESTROY &&
      hi == ISAAC_LOG_DESTROY_VARIANT_DTOR) {
    return static_cast<uint32_t>(ISAAC_LOG_DESTROY_SHARED_BYTES_0_2);
  }
  return 0u;
}

extern "C" int32_t isaac_log_destroy_is_one_template(void) {
  /* 41 of 43 and 52 of 55 shared bytes, with every delta accounted for:
     two 6-byte vtable stores, the forced rel32 half, the ebp prologue and
     the delete-flag arm. Not an assumption — a diff. */
  return 1;
}

/* ---------- LZ: the dtor delete-flag gate ---------- */

extern "C" int32_t isaac_log_dtor_frees_object(uint32_t delete_flag) {
  /* 0x00a15711 `f6 45 08 01` — Grp3 Eb,Ib. BIT 0 of the LOW BYTE, so the
     wide value 0x100 does NOT free and 0x101 does. */
  return ((delete_flag & 0xffu) &
          static_cast<uint32_t>(ISAAC_LOG_MUTEX_DTOR_DELETE_BIT)) != 0u
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_dtor_object_free_size(void) {
  return static_cast<uint32_t>(ISAAC_LOG_MUTEX_OBJECT_SIZE);
}

extern "C" int32_t isaac_log_dtor_restores_base_vtable_unconditionally(void) {
  /* 0x00a15715 is above the branch at 0x00a1571b, not inside its arm. */
  return 1;
}

extern "C" int32_t isaac_log_dtor_vtable_store_preserves_flags(void) {
  /* `mov r/m32, imm32` writes no EFLAGS, so the `je` at 0x00a1571b still
     consumes the `test` from 0x00a15711 across the store. */
  return 1;
}

/* ---------- LAA: the ready-bit lifecycle ---------- */

extern "C" int32_t isaac_log_ready_state(uint32_t holder_flags,
                                         uint32_t critsec_ptr) {
  const int32_t ready = ready_bit_set_impl(holder_flags);
  if (ready != 0) {
    return critsec_ptr != 0u ? ISAAC_LOG_READY_STATE_LIVE
                             : ISAAC_LOG_READY_STATE_FAILED;
  }
  return critsec_ptr != 0u ? ISAAC_LOG_READY_STATE_IMPOSSIBLE
                           : ISAAC_LOG_READY_STATE_DOWN;
}

extern "C" int32_t isaac_log_ready_state_reachable(uint32_t state) {
  /* (0, non-NULL) has no producer: 0x00a157aa is immediately followed by
     0x00a157ad with no branch between, and every clear either stores 0
     first or was reached by a `je` proving the pointer already 0. */
  return state == static_cast<uint32_t>(ISAAC_LOG_READY_STATE_IMPOSSIBLE) ? 0
         : state <= static_cast<uint32_t>(ISAAC_LOG_READY_STATE_FAILED) ? 1
                                                                        : 0;
}

extern "C" int32_t isaac_log_ready_state_after_init(uint32_t holder_flags,
                                                    uint32_t critsec_ptr,
                                                    uint32_t alloc_result) {
  /* 0x00a1577a `test byte [edi+4], 1 ; jne 0x00a157b0` — already-ready is a
     no-op that still returns AL = 1 (D-LOG-2). */
  if (ready_bit_set_impl(holder_flags) != 0) {
    return isaac_log_ready_state(holder_flags, critsec_ptr);
  }
  /* 0x00a1578f `test esi, esi ; je 0x00a157a0` -> `xor esi, esi`; the bit is
     published on BOTH arms at 0x00a157ad. */
  return alloc_result != 0u ? ISAAC_LOG_READY_STATE_LIVE
                            : ISAAC_LOG_READY_STATE_FAILED;
}

extern "C" int32_t isaac_log_ready_state_after_destroy(uint32_t holder_flags,
                                                       uint32_t critsec_ptr) {
  return isaac_log_ready_state(
      isaac_log_destroy_flags_after(holder_flags),
      isaac_log_destroy_critsec_ptr_after(critsec_ptr));
}

extern "C" uint32_t isaac_log_holder_ready_bit_setters(void) {
  return static_cast<uint32_t>(ISAAC_LOG_HOLDER_READY_BIT_SETTERS);
}

extern "C" uint32_t isaac_log_holder_ready_bit_clearers(void) {
  return static_cast<uint32_t>(ISAAC_LOG_HOLDER_READY_BIT_CLEARERS);
}

extern "C" uint32_t isaac_log_holder_ready_bit_clear_va(uint32_t index) {
  if (index == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_VA_TEARDOWN_CLEAR);
  }
  if (index == 1u) {
    return static_cast<uint32_t>(ISAAC_LOG_VA_STATIC_DTOR_CLEAR);
  }
  return 0u;
}

extern "C" uint32_t isaac_log_holder_ready_bit_set_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_HOLDER_READY_BIT_SET);
}

extern "C" int32_t isaac_log_lock_null_deref_reached(uint32_t holder_flags,
                                                     uint32_t critsec_ptr) {
  /* The assert arms at 0x00a15806 / 0x00a159a7 skip only the log call:
     0x00a15818 falls into 0x00a1581b and 0x00a159b5 falls into 0x00a159b8.
     So the flags argument does not gate the dereference at all — it is read
     and deliberately discarded, which is exactly the fact under test. */
  (void)holder_flags;
  return critsec_ptr == 0u ? 1 : 0;
}

extern "C" int32_t isaac_log_destroy_then_lock_asserts(uint32_t holder_flags,
                                                       uint32_t critsec_ptr) {
  /* The pointer plays no part: 0x00a157fe reads the flags cell only. Taken
     as a parameter so the export mirrors the state pair the caller holds. */
  (void)critsec_ptr;
  return isaac_log_lock_assert_fires(
      isaac_log_destroy_flags_after(holder_flags));
}

extern "C" int32_t isaac_log_destroy_then_lock_faults(uint32_t holder_flags,
                                                      uint32_t critsec_ptr) {
  return isaac_log_lock_null_deref_reached(
      isaac_log_destroy_flags_after(holder_flags),
      isaac_log_destroy_critsec_ptr_after(critsec_ptr));
}

extern "C" uint32_t isaac_log_destroy_then_lock_fault_va(uint32_t holder_flags,
                                                         uint32_t critsec_ptr,
                                                         uint32_t timeout) {
  return isaac_log_destroy_then_lock_faults(holder_flags, critsec_ptr) != 0
             ? isaac_log_lock_first_null_access_va(0u, timeout)
             : 0u;
}

extern "C" uint32_t isaac_log_post_destroy_lock_dispatch_va(uint32_t variant) {
  /* D-LOG-10. Variants that restore 0x00ba04b4 re-point slots +0xc and
     +0x10 at 0x00af05d3; the ones that leave 0x00b81c0c in place keep
     dispatching to the real lock. Unknown variants report 0. */
  if (destroy_variant_known_impl(variant) == 0) {
    return 0u;
  }
  return destroy_stores_vtable_impl(variant) != 0
             ? static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_BASE_PURECALL)
             : static_cast<uint32_t>(ISAAC_LOG_VA_LOCK);
}

/* ---------- LAB: D-LOG-9, the dangling window ---------- */

extern "C" int32_t isaac_log_destroy_holds_lock(void) {
  /* No Enter/TryEnter anywhere in any of the five instances. */
  return 0;
}

extern "C" int32_t isaac_log_destroy_clears_before_free(void) {
  /* 0x00a157e4 comes AFTER 0x00a157cc and 0x00a157d5. */
  return 0;
}

extern "C" uint32_t isaac_log_destroy_dangling_window_start_va(
    uint32_t variant) {
  switch (variant) {
    case ISAAC_LOG_DESTROY_VARIANT_DESTROY:
      return ISAAC_LOG_VA_DESTROY_DELETE_CALL;
    case ISAAC_LOG_DESTROY_VARIANT_UNWIND:
      return 0x00a15742u;
    case ISAAC_LOG_DESTROY_VARIANT_DTOR:
      return 0x00a156f5u;
    case ISAAC_LOG_DESTROY_VARIANT_TEARDOWN:
      return ISAAC_LOG_VA_TEARDOWN_DELETE_CALL;
    case ISAAC_LOG_DESTROY_VARIANT_STATIC:
      return ISAAC_LOG_VA_STATIC_DTOR_DELETE_CALL;
    default:
      return 0u;
  }
}

extern "C" uint32_t isaac_log_destroy_dangling_window_end_va(uint32_t variant) {
  return isaac_log_destroy_clear_va(variant);
}

extern "C" uint32_t isaac_log_destroy_dangling_window_insns(uint32_t variant) {
  /* 0x00a157cc, d2, d4, d5, da, dd — six instructions before the clear.
     The same six in every instance; the inline copies differ only in the
     encoding width of the absolute operands. */
  return destroy_variant_known_impl(variant) != 0
             ? static_cast<uint32_t>(ISAAC_LOG_DESTROY_DANGLING_WINDOW_INSNS)
             : 0u;
}

/* ---------- LAC: the reach census ---------- */

extern "C" uint32_t isaac_log_destroy_reach_sites(uint32_t variant,
                                                  uint32_t channel) {
  if (channel >= static_cast<uint32_t>(ISAAC_LOG_REACH_CHANNELS)) {
    return 0u;
  }
  switch (variant) {
    case ISAAC_LOG_DESTROY_VARIANT_DESTROY:
      return channel == static_cast<uint32_t>(ISAAC_LOG_REACH_CHANNEL_RAW_DWORD)
                 ? static_cast<uint32_t>(ISAAC_LOG_DESTROY_RAW_OCCURRENCES)
                 : 0u;
    case ISAAC_LOG_DESTROY_VARIANT_DTOR:
      return channel == static_cast<uint32_t>(ISAAC_LOG_REACH_CHANNEL_RAW_DWORD)
                 ? static_cast<uint32_t>(ISAAC_LOG_DTOR_RAW_OCCURRENCES)
                 : 0u;
    case ISAAC_LOG_DESTROY_VARIANT_UNWIND:
      /* THE CORRECTION: ten `E9` tail entries, zero raw dwords. */
      return channel == static_cast<uint32_t>(ISAAC_LOG_REACH_CHANNEL_TAIL_JUMP)
                 ? static_cast<uint32_t>(ISAAC_LOG_UNWIND_DESTROY_TAIL_JUMPS)
                 : 0u;
    default:
      return 0u; /* the inline copies are not call targets */
  }
}

extern "C" uint32_t isaac_log_destroy_total_reach(uint32_t variant) {
  uint32_t total = 0u;
  for (uint32_t c = 0u; c < static_cast<uint32_t>(ISAAC_LOG_REACH_CHANNELS);
       ++c) {
    total += isaac_log_destroy_reach_sites(variant, c);
  }
  return total;
}

extern "C" uint32_t isaac_log_unwind_destroy_reach_measured(void) {
  return static_cast<uint32_t>(ISAAC_LOG_UNWIND_DESTROY_TAIL_JUMPS);
}

extern "C" uint32_t isaac_log_unwind_destroy_reach_v4_reported(void) {
  return static_cast<uint32_t>(ISAAC_LOG_UNWIND_DESTROY_REACH_V4_REPORTED);
}

extern "C" int32_t isaac_log_unwind_destroy_is_dead_code(void) {
  return isaac_log_unwind_destroy_reach_measured() == 0u ? 1 : 0;
}

/* ---------- LAD: the plan and its ordered host actions ---------- */

extern "C" uint32_t isaac_log_destroy_action_count(uint32_t variant,
                                                   uint32_t critsec_ptr,
                                                   uint32_t delete_flag) {
  if (destroy_variant_known_impl(variant) == 0) {
    return 0u;
  }
  uint32_t n = 1u; /* the clear always runs */
  n += static_cast<uint32_t>(destroy_stores_vtable_impl(variant)) * 2u;
  if (isaac_log_destroy_frees_critsec(critsec_ptr) != 0) {
    n += 3u; /* delete, free, store NULL */
  }
  if (isaac_log_destroy_has_delete_flag_gate(variant) != 0 &&
      isaac_log_dtor_frees_object(delete_flag) != 0) {
    n += 1u;
  }
  return n;
}

extern "C" uint32_t isaac_log_destroy_action_at(uint32_t variant,
                                                uint32_t critsec_ptr,
                                                uint32_t delete_flag,
                                                uint32_t index) {
  uint32_t seq[ISAAC_LOG_DESTROY_ACTIONS_MAX];
  uint32_t n = 0u;
  if (destroy_variant_known_impl(variant) == 0) {
    return static_cast<uint32_t>(ISAAC_LOG_DESTROY_ACTION_NONE);
  }
  if (destroy_stores_vtable_impl(variant) != 0) {
    seq[n++] = ISAAC_LOG_DESTROY_ACTION_STORE_ENTRY_VTABLE;
  }
  if (isaac_log_destroy_frees_critsec(critsec_ptr) != 0) {
    seq[n++] = ISAAC_LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION;
    seq[n++] = ISAAC_LOG_DESTROY_ACTION_FREE_CRITSEC;
    seq[n++] = ISAAC_LOG_DESTROY_ACTION_STORE_NULL_CRITSEC;
  }
  seq[n++] = ISAAC_LOG_DESTROY_ACTION_CLEAR_READY_BIT;
  if (destroy_stores_vtable_impl(variant) != 0) {
    seq[n++] = ISAAC_LOG_DESTROY_ACTION_STORE_EXIT_VTABLE;
  }
  if (isaac_log_destroy_has_delete_flag_gate(variant) != 0 &&
      isaac_log_dtor_frees_object(delete_flag) != 0) {
    seq[n++] = ISAAC_LOG_DESTROY_ACTION_FREE_OBJECT;
  }
  return index < n ? seq[index]
                   : static_cast<uint32_t>(ISAAC_LOG_DESTROY_ACTION_NONE);
}

extern "C" int32_t isaac_log_destroy_action_is_platform(uint32_t action) {
  return (action ==
              static_cast<uint32_t>(
                  ISAAC_LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION) ||
          action == static_cast<uint32_t>(ISAAC_LOG_DESTROY_ACTION_FREE_CRITSEC) ||
          action == static_cast<uint32_t>(ISAAC_LOG_DESTROY_ACTION_FREE_OBJECT))
             ? 1
             : 0;
}

extern "C" void isaac_log_destroy_plan(uint32_t variant,
                                       uint32_t holder_flags,
                                       uint32_t critsec_ptr,
                                       uint32_t delete_flag,
                                       IsaacLogDestroyPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t known = destroy_variant_known_impl(variant);
  if (known == 0) {
    out->variant = -1;
    out->body_va = 0u;
    out->entry_vtable_va = 0u;
    out->delete_critical_section = 0;
    out->free_critsec = 0;
    out->critsec_free_size = 0u;
    out->stores_null_critsec = 0;
    out->critsec_ptr_after = critsec_ptr;
    out->flags_after = holder_flags;
    out->clears_ready_bit = 0;
    out->exit_vtable_va = 0u;
    out->frees_object = 0;
    out->object_free_size = 0u;
    out->returns_this = 0;
    out->stack_bytes_popped = 0u;
    out->ready_state_before = isaac_log_ready_state(holder_flags, critsec_ptr);
    out->ready_state_after = out->ready_state_before;
    out->dangling_window_start_va = 0u;
    out->dangling_window_end_va = 0u;
    out->action_count = 0u;
    return;
  }
  const int32_t frees = isaac_log_destroy_frees_critsec(critsec_ptr);
  out->variant = static_cast<int32_t>(variant);
  out->body_va = destroy_body_va_impl(variant);
  out->entry_vtable_va = isaac_log_destroy_entry_vtable_va(variant);
  out->delete_critical_section = frees;
  out->free_critsec = frees;
  out->critsec_free_size =
      frees != 0 ? isaac_log_destroy_critsec_free_size() : 0u;
  out->stores_null_critsec = isaac_log_destroy_stores_null_critsec(critsec_ptr);
  out->critsec_ptr_after = isaac_log_destroy_critsec_ptr_after(critsec_ptr);
  out->flags_after = isaac_log_destroy_flags_after(holder_flags);
  out->clears_ready_bit = isaac_log_destroy_clears_ready_bit();
  out->exit_vtable_va = isaac_log_destroy_exit_vtable_va(variant);
  out->frees_object =
      isaac_log_destroy_has_delete_flag_gate(variant) != 0
          ? isaac_log_dtor_frees_object(delete_flag)
          : 0;
  out->object_free_size =
      out->frees_object != 0 ? isaac_log_dtor_object_free_size() : 0u;
  out->returns_this = isaac_log_destroy_returns_this(variant);
  out->stack_bytes_popped = isaac_log_destroy_stack_bytes_popped(variant);
  out->ready_state_before = isaac_log_ready_state(holder_flags, critsec_ptr);
  out->ready_state_after =
      isaac_log_ready_state_after_destroy(holder_flags, critsec_ptr);
  out->dangling_window_start_va =
      frees != 0 ? isaac_log_destroy_dangling_window_start_va(variant) : 0u;
  out->dangling_window_end_va =
      frees != 0 ? isaac_log_destroy_dangling_window_end_va(variant) : 0u;
  out->action_count =
      isaac_log_destroy_action_count(variant, critsec_ptr, delete_flag);
}


/* ================= v6: LAE — the FULL-dword state==1 gate ============== */

namespace {

inline int32_t write_state_is_open_impl(uint32_t state) {
  /* 0x00a83fd7 `cmp dword [edi+4], 1` — the whole dword, so 0x101 misses. */
  return state == static_cast<uint32_t>(ISAAC_LOG_SINK_STATE_OPEN) ? 1 : 0;
}

inline uint32_t write_byte_count_impl(uint32_t fwrite_count, uint32_t size) {
  /* 0x00a8400a `imul ebx, dword [ebp+0xc]` — 32-bit wrap, no clamp. */
  return fwrite_count * size;
}

}  // namespace

extern "C" int32_t isaac_log_write_state_is_open(uint32_t state) {
  return write_state_is_open_impl(state);
}

extern "C" int32_t isaac_log_write_fwrite_needed(uint32_t state) {
  return write_state_is_open_impl(state);
}

extern "C" int32_t isaac_log_write_fflush_needed(uint32_t state) {
  /* Both arms call fflush. state is the unused operand a mutant would read. */
  (void)state;
  return 1;
}

extern "C" int32_t isaac_log_write_tests_file_null(uint32_t file_ptr) {
  /* FILE* is pushed and never tested. Discarded on purpose. */
  (void)file_ptr;
  return 0;
}

extern "C" int32_t isaac_log_write_fopen_fail_publishes_sink(void) {
  /* D-LOG-11: 0x00a5f478 is the join of fopen-ok and fopen-fail. */
  return 1;
}

extern "C" int32_t isaac_log_write_flush_vcall_is_nop(void) {
  /* vtbl+0x20 = 0x0040c200, which is `ret 0`. */
  return 1;
}

extern "C" uint32_t isaac_log_write_byte_count(uint32_t fwrite_count,
                                               uint32_t size) {
  return write_byte_count_impl(fwrite_count, size);
}

extern "C" uint32_t isaac_log_write_bytes_returned(uint32_t state,
                                                   uint32_t fwrite_count,
                                                   uint32_t size) {
  if (write_state_is_open_impl(state) == 0) {
    /* 0x00a83fe0 `xor ebx, ebx` — skip arm returns 0 after fflush. */
    return 0u;
  }
  return write_byte_count_impl(fwrite_count, size);
}

extern "C" uint32_t isaac_log_write_stack_bytes_popped(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_STACK_BYTES);
}

extern "C" uint32_t isaac_log_write_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_VTBL_SLOT_WRITE);
}

extern "C" uint32_t isaac_log_write_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_WRITE);
}

extern "C" uint32_t isaac_log_write_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_BODY_BYTES);
}

extern "C" uint32_t isaac_log_write_logger_size_imm(void) {
  return static_cast<uint32_t>(ISAAC_LOG_LOGGER_WRITE_SIZE_IMM);
}

extern "C" uint32_t isaac_log_write_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_write_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_write_logger_dispatch_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_LOGGER_DISPATCH_SITES);
}

extern "C" uint32_t isaac_log_write_action_count(uint32_t state) {
  return write_state_is_open_impl(state) != 0 ? 2u : 1u;
}

extern "C" uint32_t isaac_log_write_action_at(uint32_t state, uint32_t index) {
  if (write_state_is_open_impl(state) != 0) {
    if (index == 0u) {
      return static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_FWRITE);
    }
    if (index == 1u) {
      return static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_FFLUSH);
    }
    return static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_NONE);
  }
  if (index == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_FFLUSH);
  }
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_NONE);
}

extern "C" int32_t isaac_log_write_action_is_platform(uint32_t action) {
  return action == static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_FWRITE) ||
                 action == static_cast<uint32_t>(ISAAC_LOG_WRITE_ACTION_FFLUSH)
             ? 1
             : 0;
}

extern "C" void isaac_log_write_plan(uint32_t state,
                                     uint32_t file_ptr,
                                     uint32_t fwrite_count,
                                     uint32_t size,
                                     IsaacLogWritePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t open = write_state_is_open_impl(state);
  out->state_is_open = open;
  out->fwrite = open;
  out->fflush = isaac_log_write_fflush_needed(state);
  out->tests_file_null = isaac_log_write_tests_file_null(file_ptr);
  out->bytes_returned =
      isaac_log_write_bytes_returned(state, fwrite_count, size);
  out->stack_bytes_popped = isaac_log_write_stack_bytes_popped();
  out->vtbl_slot = isaac_log_write_vtbl_slot();
  out->body_va = isaac_log_write_body_va();
  out->fwrite_iat = static_cast<uint32_t>(ISAAC_LOG_IAT_FWRITE);
  out->fflush_iat = static_cast<uint32_t>(ISAAC_LOG_IAT_FFLUSH);
  out->action_count = isaac_log_write_action_count(state);
}

extern "C" uint32_t isaac_log_pure_helpers_abi_version(void) {
  return ISAAC_LOG_PURE_HELPERS_ABI_VERSION;
}

/* ================= v7: LAJ — FULL-dword state==1, no fflush ============ */

namespace {

inline int32_t sibling_write_state_is_open_impl(uint32_t state) {
  /* 0x00a52853 `cmp dword [ecx+4], 1` — the whole dword, so 0x101 misses. */
  return state == static_cast<uint32_t>(ISAAC_LOG_SINK_STATE_OPEN) ? 1 : 0;
}

inline uint32_t sibling_write_byte_count_impl(uint32_t fwrite_count,
                                             uint32_t size) {
  /* 0x00a52874 `imul eax, dword [ebp+0xc]` — 32-bit wrap, no clamp. */
  return fwrite_count * size;
}

}  // namespace

extern "C" int32_t isaac_log_sibling_write_state_is_open(uint32_t state) {
  return sibling_write_state_is_open_impl(state);
}

extern "C" int32_t isaac_log_sibling_write_fwrite_needed(uint32_t state) {
  return sibling_write_state_is_open_impl(state);
}

extern "C" int32_t isaac_log_sibling_write_fflush_needed(uint32_t state) {
  /* Neither arm calls fflush. state is the unused operand a mutant that
     copies v6's always-1 would read. */
  (void)state;
  return 0;
}

extern "C" int32_t isaac_log_sibling_write_tests_file_null(uint32_t file_ptr) {
  (void)file_ptr;
  return 0;
}

extern "C" int32_t isaac_log_sibling_flush_tests_file_null(uint32_t file_ptr) {
  /* 0x00a52880 pushes [ecx+0xc] and never tests it. */
  (void)file_ptr;
  return 0;
}

extern "C" int32_t isaac_log_sibling_flush_vcall_is_nop(void) {
  /* vtbl+0x20 = 0x00a52880, a real fflush. Contrast v6's 0x0040c200. */
  return 0;
}

extern "C" uint32_t isaac_log_sibling_write_byte_count(uint32_t fwrite_count,
                                                       uint32_t size) {
  return sibling_write_byte_count_impl(fwrite_count, size);
}

extern "C" uint32_t isaac_log_sibling_write_bytes_returned(
    uint32_t state, uint32_t fwrite_count, uint32_t size) {
  if (sibling_write_state_is_open_impl(state) == 0) {
    /* 0x00a52859 `xor eax, eax` — skip arm returns 0, no fflush. */
    return 0u;
  }
  return sibling_write_byte_count_impl(fwrite_count, size);
}

extern "C" uint32_t isaac_log_sibling_write_stack_bytes_popped(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_STACK_BYTES);
}

extern "C" uint32_t isaac_log_sibling_write_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_VTBL_SLOT_WRITE);
}

extern "C" uint32_t isaac_log_sibling_write_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_WRITE);
}

extern "C" uint32_t isaac_log_sibling_write_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_BODY_BYTES);
}

extern "C" uint32_t isaac_log_sibling_write_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_sibling_write_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_sibling_flush_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FLUSH);
}

extern "C" uint32_t isaac_log_sibling_flush_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FLUSH_BODY_BYTES);
}

extern "C" int32_t isaac_log_sibling_write_is_one_template_with_v6(void) {
  return 0;
}

extern "C" uint32_t isaac_log_sibling_write_shared_prefix_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_SHARED_PREFIX_BYTES);
}

extern "C" int32_t isaac_log_sibling_fread_is_one_template(void) {
  return 1;
}

extern "C" uint32_t isaac_log_sibling_fread_shared_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_SHARED_BYTES);
}

extern "C" uint32_t isaac_log_sibling_write_action_count(uint32_t state) {
  return sibling_write_state_is_open_impl(state) != 0 ? 1u : 0u;
}

extern "C" uint32_t isaac_log_sibling_write_action_at(uint32_t state,
                                                      uint32_t index) {
  if (sibling_write_state_is_open_impl(state) != 0 && index == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_ACTION_FWRITE);
  }
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_ACTION_NONE);
}

extern "C" int32_t isaac_log_sibling_write_action_is_platform(uint32_t action) {
  return action == static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_ACTION_FWRITE)
             ? 1
             : 0;
}

extern "C" void isaac_log_sibling_write_plan(uint32_t state,
                                             uint32_t file_ptr,
                                             uint32_t fwrite_count,
                                             uint32_t size,
                                             IsaacLogSiblingWritePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t open = sibling_write_state_is_open_impl(state);
  out->state_is_open = open;
  out->fwrite = open;
  out->fflush = isaac_log_sibling_write_fflush_needed(state);
  out->tests_file_null = isaac_log_sibling_write_tests_file_null(file_ptr);
  out->bytes_returned =
      isaac_log_sibling_write_bytes_returned(state, fwrite_count, size);
  out->stack_bytes_popped = isaac_log_sibling_write_stack_bytes_popped();
  out->vtbl_slot = isaac_log_sibling_write_vtbl_slot();
  out->body_va = isaac_log_sibling_write_body_va();
  out->fwrite_iat = static_cast<uint32_t>(ISAAC_LOG_IAT_FWRITE);
  out->flush_body_va = isaac_log_sibling_flush_body_va();
  out->action_count = isaac_log_sibling_write_action_count(state);
}

/* ================= v8: LAO — FULL-dword state==0, transcribed from PE === */

namespace {

inline int32_t sibling_fread_state_is_readable_impl(uint32_t state) {
  /* 0x00a52823 `cmp dword [ecx+4], 0` — the whole dword, so 0x100 misses.
     NOT `== 1`. Opposite of sibling_write_state_is_open_impl. */
  return state == static_cast<uint32_t>(ISAAC_LOG_SINK_STATE_OPEN_READ) ? 1
                                                                        : 0;
}

inline uint32_t sibling_fread_byte_count_impl(uint32_t fread_count,
                                             uint32_t size) {
  /* 0x00a52844 `imul eax, dword [ebp+0xc]` — 32-bit wrap, no clamp. */
  return fread_count * size;
}

}  // namespace

extern "C" int32_t isaac_log_sibling_fread_state_is_readable(uint32_t state) {
  return sibling_fread_state_is_readable_impl(state);
}

extern "C" int32_t isaac_log_sibling_fread_needed(uint32_t state) {
  return sibling_fread_state_is_readable_impl(state);
}

extern "C" int32_t isaac_log_sibling_fread_fflush_needed(uint32_t state) {
  /* Neither arm calls fflush. Transcribed from this body; not copied from
     the v7 write (which also happens to be 0, but for a different VA). */
  (void)state;
  return 0;
}

extern "C" int32_t isaac_log_sibling_fread_tests_file_null(uint32_t file_ptr) {
  (void)file_ptr;
  return 0;
}

extern "C" uint32_t isaac_log_sibling_fread_byte_count(uint32_t fread_count,
                                                      uint32_t size) {
  return sibling_fread_byte_count_impl(fread_count, size);
}

extern "C" uint32_t isaac_log_sibling_fread_bytes_returned(
    uint32_t state, uint32_t fread_count, uint32_t size) {
  if (sibling_fread_state_is_readable_impl(state) == 0) {
    /* 0x00a52829 `xor eax, eax` — skip arm returns 0, no fflush. */
    return 0u;
  }
  return sibling_fread_byte_count_impl(fread_count, size);
}

extern "C" uint32_t isaac_log_sibling_fread_stack_bytes_popped(void) {
  return static_cast<uint32_t>(ISAAC_LOG_WRITE_STACK_BYTES);
}

extern "C" uint32_t isaac_log_sibling_fread_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_VTBL_SLOT_FREAD);
}

extern "C" uint32_t isaac_log_sibling_fread_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FREAD);
}

extern "C" uint32_t isaac_log_sibling_fread_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_BODY_BYTES);
}

extern "C" uint32_t isaac_log_sibling_fread_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_sibling_fread_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_sibling_fread_write_sibling_va(void) {
  /* v7 peel, consumed by reference. */
  return static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_WRITE);
}

extern "C" int32_t isaac_log_sibling_fread_is_folded_into_v7(void) {
  return 0;
}

extern "C" uint32_t isaac_log_sibling_fread_action_count(uint32_t state) {
  return sibling_fread_state_is_readable_impl(state) != 0 ? 1u : 0u;
}

extern "C" uint32_t isaac_log_sibling_fread_action_at(uint32_t state,
                                                     uint32_t index) {
  if (sibling_fread_state_is_readable_impl(state) != 0 && index == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_ACTION_FREAD);
  }
  return static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_ACTION_NONE);
}

extern "C" int32_t isaac_log_sibling_fread_action_is_platform(uint32_t action) {
  return action == static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_ACTION_FREAD)
             ? 1
             : 0;
}

extern "C" void isaac_log_sibling_fread_plan(uint32_t state,
                                            uint32_t file_ptr,
                                            uint32_t fread_count,
                                            uint32_t size,
                                            IsaacLogSiblingFreadPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t readable = sibling_fread_state_is_readable_impl(state);
  out->state_is_readable = readable;
  out->fread = readable;
  out->fflush = isaac_log_sibling_fread_fflush_needed(state);
  out->tests_file_null = isaac_log_sibling_fread_tests_file_null(file_ptr);
  out->bytes_returned =
      isaac_log_sibling_fread_bytes_returned(state, fread_count, size);
  out->stack_bytes_popped = isaac_log_sibling_fread_stack_bytes_popped();
  out->vtbl_slot = isaac_log_sibling_fread_vtbl_slot();
  out->body_va = isaac_log_sibling_fread_body_va();
  out->fread_iat = static_cast<uint32_t>(ISAAC_LOG_IAT_FREAD);
  out->write_sibling_va = isaac_log_sibling_fread_write_sibling_va();
  out->action_count = isaac_log_sibling_fread_action_count(state);
}

/* ---------- v9: sink/neighbor deleting-dtor island ---------- */

/* Deterministic variant select: 1 -> NEIGHBOR, 2 -> SIBLING, everything
   else -> SINK (variant 0 is the canonical default; pinned in the tests). */
namespace {

inline uint32_t dtor_island_select_impl(uint32_t variant) {
  if (variant == static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR)) {
    return static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR);
  }
  if (variant == static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING)) {
    return static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING);
  }
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_SINK);
}

}  // namespace

extern "C" uint32_t isaac_log_dtor_island_variants(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANTS);
}

extern "C" uint32_t isaac_log_dtor_island_body_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_DTOR_BODY);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR);
  }
}

extern "C" uint32_t isaac_log_dtor_island_body_bytes(uint32_t variant) {
  return dtor_island_select_impl(variant) ==
                 static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR)
             ? static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_BODY_BYTES)
             : (dtor_island_select_impl(variant) ==
                        static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING)
                    ? static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_BODY_BYTES)
                    : static_cast<uint32_t>(ISAAC_LOG_SINK_DTOR_BODY_BYTES));
}

extern "C" uint32_t isaac_log_dtor_island_inner_body_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_INNER);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_INNER);
  }
}

extern "C" uint32_t isaac_log_dtor_island_free_size(uint32_t variant) {
  return dtor_island_select_impl(variant) ==
                 static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR)
             ? static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_FREE_SIZE)
             : static_cast<uint32_t>(ISAAC_LOG_SINK_DTOR_FREE_SIZE);
}

extern "C" uint32_t isaac_log_dtor_island_vtable_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_VTABLE);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_VTABLE);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_SINK_VTABLE_VA);
  }
}

extern "C" uint32_t isaac_log_dtor_island_vtable_entry_va(uint32_t variant) {
  /* The vtable slot entry that HOLDS the wrapper body: sink vtable
     0x00ba5184+0, neighbor (0x00ba5520 stored inside the inner, no entry
     read), sibling vtable 0x00b9e940+0 (file 0x79cf40). The neighbor has
     no vtable entry of its own (the vtable is inner-stored), so it shares
     the sink's entry-address answer 0x00ba5184. */
  return dtor_island_select_impl(variant) ==
                 static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING)
             ? static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_VTABLE_ENTRY)
             : static_cast<uint32_t>(ISAAC_LOG_SINK_VTABLE_VA);
}

extern "C" uint32_t isaac_log_dtor_island_inner_call_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER_CALL);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_INNER_CALL_VA);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_INNER_CALL);
  }
}

extern "C" int32_t isaac_log_dtor_island_wrapper_stores_vtable(
    uint32_t variant) {
  /* sink stores 0xba5184 in the wrapper (0x00a83fa6, before the inner
     call); the neighbor stores 0xba5520 inside its inner body 0x00a84060
     (0x00a84089); the sibling stores NOTHING in its wrapper — the inner
     0xa52410 stores the sibling vtable 0xb9e940 at 0x00a52438 (v11 inner
     vtable #1, ALWAYS, before its fclose gate). */
  return dtor_island_select_impl(variant) ==
                 static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_VARIANT_SINK)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_dtor_island_ret_args(void) {
  /* ret 4 — the deleting dtor cleans its one stack argument itself. */
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_RET_ARGS);
}

extern "C" int32_t isaac_log_dtor_island_returns_this(void) {
  /* mov eax, esi — both wrappers return `this`. */
  return 1;
}

extern "C" int32_t isaac_log_dtor_island_delete_needed(uint32_t delete_flag) {
  /* test byte ptr [ebp + 8], 1 ; je — bit 0 of the LOW BYTE ONLY (the
     parameter is wide and narrowed here; the Wasm ABI does not narrow). */
  return (delete_flag & static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_FLAG_BIT)) !=
                 0u
             ? 1
             : 0;
}

/* ======================= v15: the deleting-dtor WRAPPER bodies ========== */

/* W1 — the inner body fires FIRST and UNCONDITIONALLY: the E8 at
   0x00a84036 (neighbor -> 0xa84060) / 0x00a83fac (sink -> 0xa52410) /
   0x00a523e6 (sibling -> 0xa52410, the SAME inner as the sink) sits
   between the prologue and the delete gate; NO flag value suppresses it
   (the gate only controls the sized-delete). */
extern "C" int32_t isaac_log_dtor_island_inner_fires(uint32_t delete_flag,
                                                     uint32_t variant) {
  (void)delete_flag;
  (void)dtor_island_select_impl(variant); /* all variants share the law */
  return 1;
}

namespace {

/* W3 — the sized-delete (`push <size>; push esi; call 0xaef15c; add esp,8`)
   fires ONLY when the gate passes, with the variant free-size immediate
   (0x10 sink / 0x30 neighbor). The host shim drops the size; the LAW is
   the gate + size pair, never the shim's behaviour. */
inline uint32_t dtor_island_sized_delete_size_impl(uint32_t delete_flag,
                                                   uint32_t variant) {
  if (isaac_log_dtor_island_delete_needed(delete_flag) == 0) {
    return 0u;
  }
  return isaac_log_dtor_island_free_size(variant);
}

}  // namespace

extern "C" uint32_t isaac_log_dtor_island_sized_delete_size(
    uint32_t delete_flag, uint32_t variant) {
  return dtor_island_sized_delete_size_impl(delete_flag, variant);
}

extern "C" void isaac_log_dtor_island_wrapper_plan(
    uint32_t delete_flag, uint32_t variant, IsaacLogDtorIslandPlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t v = dtor_island_select_impl(variant);
  const uint32_t gate_fires =
      isaac_log_dtor_island_delete_needed(delete_flag) != 0u ? 1u : 0u;
  out->inner_va = isaac_log_dtor_island_inner_body_va(v);
  out->inner_fires = 1; /* W1: the call HAS run before the gate */
  out->gate_va = isaac_log_dtor_island_gate_va(v);
  out->delete_fires = static_cast<int32_t>(gate_fires);
  out->delete_size =
      gate_fires != 0u ? isaac_log_dtor_island_free_size(v) : 0u;
  out->delete_va =
      static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_SIZED_DELETE_VA);
  out->returns_this = 1; /* mov eax, esi — all wrappers return `this` */
  out->ret_args = static_cast<uint32_t>(ISAAC_LOG_DTOR_ISLAND_RET_ARGS);
}

/* v16: per-variant wrapper call-site/return VAs (address-stable PE truth).
   gate_va is the `test byte [ebp+8],1` (sink 0xa83fb1, neighbor 0xa8403b,
   sibling 0xa523eb); delete_call_va the `call 0xaef15c`; ret_va the
   `ret 4`. All narrow every unknown variant to the SINK default. */
extern "C" uint32_t isaac_log_dtor_island_gate_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_GATE);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_GATE_VA);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_GATE);
  }
}

extern "C" uint32_t isaac_log_dtor_island_delete_call_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_DELETE_CALL);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_DELETE_CALL_VA);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_DELETE_CALL);
  }
}

extern "C" uint32_t isaac_log_dtor_island_ret_va(uint32_t variant) {
  switch (dtor_island_select_impl(variant)) {
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR:
      return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_RET_VA);
    case ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING:
      return static_cast<uint32_t>(ISAAC_LOG_SIBLING_DTOR_FIRST_RET_VA);
    default:
      return static_cast<uint32_t>(ISAAC_LOG_SINK_DTOR_RET_VA);
  }
}

/* ---------- v10: the open helpers (vtbl +0x24 / +0x28) ---------- */

namespace {

/* 0x00a52579 `test esi, esi ; je 0xa525ed` — the read's PATH GATE. esi is
   the HOST combine result; NULL blocks everything and returns 0. */
inline int32_t open_read_path_gate_impl(uint32_t path_combine_ok) {
  return path_combine_ok != 0u ? 1 : 0;
}

/* 0x00a52649 `cmp byte ptr [ebp + 0xc], 0` ; 0x00a52659 `cmove edx, eax` —
   LOW BYTE ONLY: (flag & 0xff) == 0 selects "wb", else "ab". */
inline uint32_t open_write_mode_va_impl(uint32_t append_flag) {
  return (append_flag & 0xffu) == 0u
             ? static_cast<uint32_t>(ISAAC_LOG_OPEN_MODE_WB_VA)
             : static_cast<uint32_t>(ISAAC_LOG_OPEN_MODE_AB_VA);
}

/* The FILE* store at 0x00a5258c / 0x00a52667 is UNCONDITIONAL: the cell
   is OVERWRITTEN with the raw fopen result even when fopen returned NULL
   (a previous non-NULL handle is clobbered by a failed re-open). */
inline uint32_t open_file_after_impl(uint32_t file_before,
                                     uint32_t fopen_result) {
  (void)file_before;
  return fopen_result;
}

/* 0x00a52599 stores 0 (fopen success only); 0x00a52678 stores 1 (fopen
   success only). Failures leave the previous state cell untouched. */
inline uint32_t open_read_state_after_impl(uint32_t state_before,
                                           uint32_t fopen_ok) {
  return fopen_ok != 0u ? static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_STATE)
                        : state_before;
}

inline uint32_t open_write_state_after_impl(uint32_t state_before,
                                            uint32_t fopen_ok) {
  return fopen_ok != 0u ? static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_STATE)
                        : state_before;
}

/* The second HOST combine's result is stored on the success arm only. */
inline uint32_t open_path_after_impl(uint32_t path_before,
                                     uint32_t fopen_ok,
                                     uint32_t combine2_result) {
  return fopen_ok != 0u ? combine2_result : path_before;
}

/* The read returns 1 iff gate && fopen; the write returns 1 iff fopen
   ALONE (bl is set only from the fopen test at 0x00a5266a). */
inline int32_t open_read_returns_impl(uint32_t path_combine_ok,
                                      uint32_t fopen_ok) {
  return (path_combine_ok != 0u && fopen_ok != 0u) ? 1 : 0;
}

inline int32_t open_write_returns_impl(uint32_t fopen_ok) {
  return fopen_ok != 0u ? 1 : 0;
}

/* Allocator accounting: read reaches it from EITHER fopen arm (both
   gated by the path gate); write reaches it from the join gated on the
   combine result. Both sites are HOST; this is the reach flag. */
inline int32_t open_read_accounting_impl(uint32_t path_combine_ok) {
  return path_combine_ok != 0u ? 1 : 0;
}

inline int32_t open_write_accounting_impl(uint32_t path_combine_ok) {
  return path_combine_ok != 0u ? 1 : 0;
}

}  // namespace

extern "C" int32_t isaac_log_open_read_path_gate(uint32_t path_combine_ok) {
  return open_read_path_gate_impl(path_combine_ok);
}

extern "C" uint32_t isaac_log_open_read_mode_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_MODE_RB_VA);
}

extern "C" uint32_t isaac_log_open_read_mode_len(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_MODE_LEN);
}

extern "C" uint32_t isaac_log_open_read_file_after(uint32_t file_before,
                                                   uint32_t fopen_result) {
  return open_file_after_impl(file_before, fopen_result);
}

extern "C" uint32_t isaac_log_open_read_state_after(uint32_t state_before,
                                                    uint32_t fopen_ok) {
  return open_read_state_after_impl(state_before, fopen_ok);
}

extern "C" uint32_t isaac_log_open_read_path_after(uint32_t path_before,
                                                   uint32_t fopen_ok,
                                                   uint32_t combine2_result) {
  return open_path_after_impl(path_before, fopen_ok, combine2_result);
}

extern "C" int32_t isaac_log_open_read_returns(uint32_t path_combine_ok,
                                               uint32_t fopen_ok) {
  return open_read_returns_impl(path_combine_ok, fopen_ok);
}

extern "C" int32_t isaac_log_open_read_accounting_reached(
    uint32_t path_combine_ok) {
  return open_read_accounting_impl(path_combine_ok);
}

extern "C" uint32_t isaac_log_open_read_accounting_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_ACCOUNTING_SITES);
}

extern "C" uint32_t isaac_log_open_write_mode_va(uint32_t append_flag) {
  return open_write_mode_va_impl(append_flag);
}

extern "C" uint32_t isaac_log_open_write_mode_len(uint32_t append_flag) {
  (void)append_flag;
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_MODE_LEN);
}

extern "C" int32_t isaac_log_open_write_fopen_gated(uint32_t path_combine_ok) {
  /* NO path gate before fopen at 0x00a5265e — the combine result is passed
     through even when NULL. Always 0; the parameter exists so a mutant
     that copies the read's gate changes an observable. */
  (void)path_combine_ok;
  return 0;
}

extern "C" uint32_t isaac_log_open_write_file_after(uint32_t file_before,
                                                    uint32_t fopen_result) {
  return open_file_after_impl(file_before, fopen_result);
}

extern "C" uint32_t isaac_log_open_write_state_after(uint32_t state_before,
                                                     uint32_t fopen_ok) {
  return open_write_state_after_impl(state_before, fopen_ok);
}

extern "C" uint32_t isaac_log_open_write_path_after(uint32_t path_before,
                                                    uint32_t fopen_ok,
                                                    uint32_t combine2_result) {
  return open_path_after_impl(path_before, fopen_ok, combine2_result);
}

extern "C" int32_t isaac_log_open_write_returns(uint32_t fopen_ok) {
  return open_write_returns_impl(fopen_ok);
}

extern "C" int32_t isaac_log_open_write_accounting_reached(
    uint32_t path_combine_ok) {
  return open_write_accounting_impl(path_combine_ok);
}

extern "C" uint32_t isaac_log_open_write_accounting_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_ACCOUNTING_SITES);
}

extern "C" uint32_t isaac_log_open_read_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_OPEN_READ);
}

extern "C" uint32_t isaac_log_open_read_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_BODY_BYTES);
}

extern "C" uint32_t isaac_log_open_read_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_INSN_COUNT);
}

extern "C" uint32_t isaac_log_open_read_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_RET_ARGS);
}

extern "C" uint32_t isaac_log_open_read_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_VTABLE_SLOT_READ);
}

extern "C" uint32_t isaac_log_open_read_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_open_read_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_READ_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_open_write_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_OPEN_WRITE);
}

extern "C" uint32_t isaac_log_open_write_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_BODY_BYTES);
}

extern "C" uint32_t isaac_log_open_write_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_INSN_COUNT);
}

extern "C" uint32_t isaac_log_open_write_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_RET_ARGS);
}

extern "C" uint32_t isaac_log_open_write_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_VTABLE_SLOT_WRITE);
}

extern "C" uint32_t isaac_log_open_write_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_open_write_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_WRITE_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_open_read_devirt_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_OPEN_READ_DEVIRT_CALL);
}

extern "C" uint32_t isaac_log_open_write_devirt_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_OPEN_WRITE_DEVIRT_CALL);
}

extern "C" uint32_t isaac_log_open_read_action_count(uint32_t path_combine_ok) {
  return open_read_path_gate_impl(path_combine_ok) != 0 ? 1u : 0u;
}

extern "C" uint32_t isaac_log_open_read_action_at(uint32_t path_combine_ok,
                                                  uint32_t index) {
  if (open_read_path_gate_impl(path_combine_ok) != 0 && index == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_OPEN_ACTION_FOPEN);
  }
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_ACTION_NONE);
}

extern "C" int32_t isaac_log_open_read_action_is_platform(uint32_t action) {
  return action == static_cast<uint32_t>(ISAAC_LOG_OPEN_ACTION_FOPEN) ? 1 : 0;
}

extern "C" void isaac_log_open_read_plan(uint32_t path_combine_ok,
                                         uint32_t fopen_ok,
                                         uint32_t file_before,
                                         uint32_t fopen_result,
                                         uint32_t state_before,
                                         uint32_t path_before,
                                         uint32_t combine2_result,
                                         IsaacLogOpenReadPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t path_ok = open_read_path_gate_impl(path_combine_ok);
  out->path_ok = path_ok;
  out->mode_va = isaac_log_open_read_mode_va();
  out->fopen = path_ok;
  out->file_after = open_file_after_impl(file_before, fopen_result);
  out->state_after = open_read_state_after_impl(state_before, fopen_ok);
  out->path_stored = fopen_ok != 0u ? 1 : 0;
  out->path_after = open_path_after_impl(path_before, fopen_ok, combine2_result);
  out->result = open_read_returns_impl(path_combine_ok, fopen_ok);
  out->accounting_reached = open_read_accounting_impl(path_combine_ok);
  out->accounting_sites = isaac_log_open_read_accounting_sites();
  out->ret_args = isaac_log_open_read_ret_args();
  out->body_va = isaac_log_open_read_body_va();
  out->action_count = isaac_log_open_read_action_count(path_combine_ok);
}

extern "C" uint32_t isaac_log_open_write_action_count(void) {
  /* fopen ALWAYS fires — there is no path gate in this body. */
  return 1u;
}

extern "C" uint32_t isaac_log_open_write_action_at(uint32_t index) {
  if (index == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_OPEN_ACTION_FOPEN);
  }
  return static_cast<uint32_t>(ISAAC_LOG_OPEN_ACTION_NONE);
}

extern "C" int32_t isaac_log_open_write_action_is_platform(uint32_t action) {
  return action == static_cast<uint32_t>(ISAAC_LOG_OPEN_ACTION_FOPEN) ? 1 : 0;
}

extern "C" void isaac_log_open_write_plan(uint32_t append_flag,
                                          uint32_t path_combine_ok,
                                          uint32_t fopen_ok,
                                          uint32_t file_before,
                                          uint32_t fopen_result,
                                          uint32_t state_before,
                                          uint32_t path_before,
                                          uint32_t combine2_result,
                                          IsaacLogOpenWritePlan* out) {
  if (out == nullptr) {
    return;
  }
  out->mode_va = open_write_mode_va_impl(append_flag);
  out->fopen = 1;
  out->file_after = open_file_after_impl(file_before, fopen_result);
  out->state_after = open_write_state_after_impl(state_before, fopen_ok);
  out->path_stored = fopen_ok != 0u ? 1 : 0;
  out->path_after = open_path_after_impl(path_before, fopen_ok, combine2_result);
  out->result = open_write_returns_impl(fopen_ok);
  out->accounting_reached = open_write_accounting_impl(path_combine_ok);
  out->accounting_sites = isaac_log_open_write_accounting_sites();
  out->ret_args = isaac_log_open_write_ret_args();
  out->body_va = isaac_log_open_write_body_va();
  out->action_count = isaac_log_open_write_action_count();
}

/* ---------- v11: the dtor inner body 0x00a52410 (SEH+GS) ---------- */

namespace {

/* test eax, eax ; je 0xa52453 — FCLOSE GATE on the FULL 32-bit FILE* cell
   at [this+0xc]. 0x100 / 0x1ff / 0xffffffff all fire; a low-byte reading
   would misfire on 0x100 and 0xffff0000. */
inline int32_t dtor_inner_fclose_gate_impl(uint32_t file_ptr) {
  return file_ptr != 0u ? 1 : 0;
}

/* mov [esi+0xc], 0 — FILE* cell NULLed only on the fclose arm. */
inline uint32_t dtor_inner_file_after_impl(uint32_t file_before,
                                           uint32_t fclose_fired) {
  return fclose_fired != 0u ? 0u : file_before;
}

/* test edx, edx ; je 0xa52486 — GUEST-FREE GATE on the FULL 32-bit path
   cell at [this+8]. Same width as the fclose gate. */
inline int32_t dtor_inner_free_gate_impl(uint32_t path_ptr) {
  return path_ptr != 0u ? 1 : 0;
}

/* mov [esi+8], 0 — path cell NULLed only on the free arm. */
inline uint32_t dtor_inner_path_after_impl(uint32_t path_before,
                                           uint32_t free_fired) {
  return free_fired != 0u ? 0u : path_before;
}

/* mov [esi+4], 2 — the state cell is written with the polar value 2 on
   BOTH arms: 0x00a52456 is unconditional (before the free gate) and
   0x00a5247d re-stores 2 on the free arm. state_before is deliberately a
   parameter so a mutant that keeps it on the skip arm is visible. */
inline uint32_t dtor_inner_state_after_impl(uint32_t state_before) {
  (void)state_before;
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_STATE_VALUE);
}

/* mov [esi], 0xb833d8 — the MID vtable store is the path == 0 arm ONLY
   (the no-free arm). On the free arm the chain jumps straight from the
   base 0xb9e940 to the final 0xb9c15c. */
inline int32_t dtor_inner_mid_stored_impl(uint32_t path_ptr) {
  return path_ptr == 0u ? 1 : 0;
}

/* mov [esi], 0xb9c15c — the FINAL store at 0x00a5248c runs in BOTH arms
   (the free arm jumps to 0xa5248c). The final vtable is constant. */
inline uint32_t dtor_inner_vtable_after_impl(uint32_t path_ptr) {
  (void)path_ptr;
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_VTABLE_FINAL);
}

}  // namespace

extern "C" int32_t isaac_log_dtor_inner_fclose_gate(uint32_t file_ptr) {
  return dtor_inner_fclose_gate_impl(file_ptr);
}

extern "C" uint32_t isaac_log_dtor_inner_fclose_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_IAT_FCLOSE);
}

extern "C" uint32_t isaac_log_dtor_inner_file_after(uint32_t file_before,
                                                    uint32_t fclose_fired) {
  return dtor_inner_file_after_impl(file_before, fclose_fired);
}

extern "C" int32_t isaac_log_dtor_inner_free_gate(uint32_t path_ptr) {
  return dtor_inner_free_gate_impl(path_ptr);
}

extern "C" uint32_t isaac_log_dtor_inner_free_helper_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SHARED_ALLOCATOR);
}

extern "C" uint32_t isaac_log_dtor_inner_path_after(uint32_t path_before,
                                                    uint32_t free_fired) {
  return dtor_inner_path_after_impl(path_before, free_fired);
}

extern "C" uint32_t isaac_log_dtor_inner_state_after(uint32_t state_before) {
  return dtor_inner_state_after_impl(state_before);
}

extern "C" uint32_t isaac_log_dtor_inner_state_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_STATE_VALUE);
}

extern "C" uint32_t isaac_log_dtor_inner_state_store_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_STATE_STORES);
}

extern "C" uint32_t isaac_log_dtor_inner_vtable_base(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_VTABLE_BASE);
}

extern "C" uint32_t isaac_log_dtor_inner_vtable_mid(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_VTABLE_MID);
}

extern "C" uint32_t isaac_log_dtor_inner_vtable_final(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_VTABLE_FINAL);
}

extern "C" int32_t isaac_log_dtor_inner_vtable_mid_stored(uint32_t path_ptr) {
  return dtor_inner_mid_stored_impl(path_ptr);
}

extern "C" uint32_t isaac_log_dtor_inner_vtable_after(uint32_t path_ptr) {
  return dtor_inner_vtable_after_impl(path_ptr);
}

extern "C" uint32_t isaac_log_dtor_inner_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_DTOR_INNER);
}

extern "C" uint32_t isaac_log_dtor_inner_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_BODY_BYTES);
}

extern "C" uint32_t isaac_log_dtor_inner_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_INSN_COUNT);
}

extern "C" uint32_t isaac_log_dtor_inner_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_RET_ARGS);
}

extern "C" uint32_t isaac_log_dtor_inner_seh_handler(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_SEH_HANDLER);
}

extern "C" uint32_t isaac_log_dtor_inner_inbound_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_INBOUND_CALLSITES);
}

extern "C" uint32_t isaac_log_dtor_inner_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_dtor_inner_fclose_iat_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_FCLOSE_IAT_SITES);
}

extern "C" uint32_t isaac_log_dtor_inner_action_count(uint32_t file_ptr,
                                                      uint32_t path_ptr) {
  return static_cast<uint32_t>(dtor_inner_fclose_gate_impl(file_ptr) +
                               dtor_inner_free_gate_impl(path_ptr));
}

extern "C" uint32_t isaac_log_dtor_inner_action_at(uint32_t file_ptr,
                                                   uint32_t path_ptr,
                                                   uint32_t index) {
  /* Ordered [FCLOSE, FREE]: the fclose fires at 0xa52443 BEFORE the state
     store and the free at 0xa5246e after it. */
  if (index == 0u) {
    return dtor_inner_fclose_gate_impl(file_ptr) != 0
               ? static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_FCLOSE)
               : static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_NONE);
  }
  if (index == 1u) {
    return dtor_inner_free_gate_impl(path_ptr) != 0
               ? static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_FREE)
               : static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_NONE);
  }
  return static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_NONE);
}

extern "C" int32_t isaac_log_dtor_inner_action_is_platform(uint32_t action) {
  return action ==
                     static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_FCLOSE)
                 ? 1
             : action ==
                       static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_ACTION_FREE)
                 ? 1
                 : 0;
}

/* ---------- v12: the neighbor dtor inner body 0x00a84060 (SEH+GS) ---------- */

namespace {

/* mov edx,[esi+0x20] ; test edx,edx ; je 0xa840af — FULL 32-bit path cell.
   0x100 / 0x1ff / 0xffffffff ALL fire the guest free; only 0 skips. A
   low-byte reading would misfire on 0x100. Same width law as the v11 sink
   inner, different cell offset (+0x20 vs +0x8). */
inline int32_t ndtor_free_gate_impl(uint32_t path_ptr) {
  return path_ptr != 0u ? 1 : 0;
}

/* mov [esi+0x20], 0 — path cell NULLed only on the free arm (0x00a840a8,
   after the host allocator call). */
inline uint32_t ndtor_path_after_impl(uint32_t path_before,
                                      uint32_t free_fired) {
  return free_fired != 0u ? 0u : path_before;
}

/* push [esi+0x28] ; call [0xb180a4] — the EOS LobbyDetails release has NO
   gate: the call fires for EVERY input, lobby cell 0 included. */
inline int32_t ndtor_release_unconditional_impl() { return 1; }

/* The release receives the PRE-null cell value: the NULL store at
   0x00a840bb sits AFTER the call. Identity — a mutant that folds the
   release argument to the post-null 0 changes an observable. */
inline uint32_t ndtor_release_arg_impl(uint32_t lobby_before) {
  return lobby_before;
}

/* mov [esi+0x28], 0 — lobby cell NULLed ALWAYS (both arms reach the
   store via the je join at 0xa840af). Parameter exists so a keep-old-cell
   mutant is visible. */
inline uint32_t ndtor_lobby_after_impl(uint32_t lobby_before) {
  (void)lobby_before;
  return 0u;
}

/* BOTH vtable stores are unconditional: #1 0xba5520 (0x00a84089, BEFORE
   the free gate) and #2 0xba2218 (0x00a840c2). There is NO conditional
   mid-store arm — that is the SINK inner's 3-store law, do not
   homogenise. path_ptr is a parameter so a mutant that moves the base
   store into the free arm is visible. */
inline int32_t ndtor_base_stored_impl(uint32_t path_ptr) {
  (void)path_ptr;
  return 1;
}

inline uint32_t ndtor_vtable_final_after_impl(uint32_t path_ptr) {
  (void)path_ptr;
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL);
}

}  // namespace

extern "C" int32_t isaac_log_neighbor_dtor_inner_free_gate(uint32_t path_ptr) {
  return ndtor_free_gate_impl(path_ptr);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_free_helper_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SHARED_ALLOCATOR);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_path_after(
    uint32_t path_before, uint32_t free_fired) {
  return ndtor_path_after_impl(path_before, free_fired);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_vtable_base(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_BASE);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_vtable_final(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL);
}

extern "C" int32_t isaac_log_neighbor_dtor_inner_vtable_base_stored(
    uint32_t path_ptr) {
  return ndtor_base_stored_impl(path_ptr);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_vtable_final_after(
    uint32_t path_ptr) {
  return ndtor_vtable_final_after_impl(path_ptr);
}

extern "C" int32_t isaac_log_neighbor_dtor_inner_release_unconditional(void) {
  return ndtor_release_unconditional_impl();
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_release_arg(
    uint32_t lobby_before) {
  return ndtor_release_arg_impl(lobby_before);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_lobby_after(
    uint32_t lobby_before) {
  return ndtor_lobby_after_impl(lobby_before);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_release_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_IAT_EOS_LOBBYDETAILS_RELEASE);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_sub_dtor_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_DTOR_VA);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_sub_dtor_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_OFFSET);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_BODY_BYTES);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_INSN_COUNT);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_RET_ARGS);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_seh_handler(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_SEH_HANDLER);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_inbound_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_INBOUND_CALLSITES);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_release_iat_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_RELEASE_IAT_SITES);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_action_count(
    uint32_t path_ptr) {
  /* [FREE, RELEASE]: free is gated, the EOS release ALWAYS fires. */
  return static_cast<uint32_t>(ndtor_free_gate_impl(path_ptr) + 1);
}

extern "C" uint32_t isaac_log_neighbor_dtor_inner_action_at(uint32_t path_ptr,
                                                            uint32_t index) {
  /* FREE fires at 0xa840a0 BEFORE the release at 0xa840b2. */
  if (index == 0u) {
    return ndtor_free_gate_impl(path_ptr) != 0
               ? static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE)
               : static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE);
  }
  if (index == 1u) {
    return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE);
  }
  return static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE);
}

extern "C" int32_t isaac_log_neighbor_dtor_inner_action_is_platform(
    uint32_t action) {
  return action ==
                     static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE)
                 ? 1
             : action ==
                       static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE)
                 ? 1
                 : 0;
}

/* ---------- v13: the sibling vtbl+0x20 flush slot 0x00a52880 ---------- */

namespace {

/* push dword ptr [ecx + 0xc] — the FILE* field offset is +0xc. The
   pushed dword is the FULL 32-bit cell: a mutant reading a different
   offset (or a low byte) changes an observable. */
inline int32_t flush_slot_call_unconditional_impl(uint32_t file_ptr) {
  (void)file_ptr; /* the machine NEVER tests it — see the disasm */
  return 1;
}

}  // namespace

extern "C" uint32_t isaac_log_flush_slot_file_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_FILE_OFFSET);
}

extern "C" uint32_t isaac_log_flush_slot_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_IAT_VA);
}

extern "C" int32_t isaac_log_flush_slot_call_unconditional(uint32_t file_ptr) {
  return flush_slot_call_unconditional_impl(file_ptr);
}

extern "C" uint32_t isaac_log_flush_slot_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_RET_ARGS);
}

extern "C" uint32_t isaac_log_flush_slot_stack_bytes_popped(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_STACK_BYTES_POPPED);
}

extern "C" int32_t isaac_log_flush_slot_ret_is_fflush(void) {
  /* push [ecx+0xc] ; call [0xb1891c] ; pop ecx ; ret — EAX is never
     touched between the call and the plain ret. */
  return 1;
}

extern "C" uint32_t isaac_log_flush_slot_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_FLUSH_SLOT);
}

extern "C" uint32_t isaac_log_flush_slot_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_BODY_BYTES);
}

extern "C" uint32_t isaac_log_flush_slot_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_INSN_COUNT);
}

extern "C" uint32_t isaac_log_flush_slot_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_flush_slot_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_SLOT);
}

extern "C" uint32_t isaac_log_flush_slot_vtbl_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_VA);
}

extern "C" uint32_t isaac_log_flush_slot_vtbl_entry_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_ENTRY_VA);
}

extern "C" uint32_t isaac_log_flush_slot_push_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_PUSH_VA);
}

extern "C" uint32_t isaac_log_flush_slot_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_CALL_VA);
}

extern "C" uint32_t isaac_log_flush_slot_pop_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_POP_VA);
}

extern "C" uint32_t isaac_log_flush_slot_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_RET_VA);
}

extern "C" uint32_t isaac_log_flush_slot_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_flush_slot_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_flush_slot_inbound(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_INBOUND);
}

extern "C" uint32_t isaac_log_flush_slot_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_flush_slot_fflush_iat_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_FFLUSH_IAT_SITES);
}

extern "C" int32_t isaac_log_flush_slot_vtbl_is_nop(void) {
  return static_cast<int32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_IS_NOP);
}

/* ---------- v14: the fd lock/unlock helper 0x00a52890 ---------- */

namespace {

/* mov eax, esi ; and eax, 0xfffffffb ; sub eax,1 ; je ;
   sub eax,1 ; je ; sub eax,6 ; je — the PURE dispatch. The `and` clears
   BIT 2 ONLY: high bits stay live, so 0x100 / 0x1ff / 0xffffffff /
   0x105 all reach the default EINVAL arm. Sequential subtraction
   arithmetic, 32-bit wrap exact (a `-1` carry can land on the first je). */
inline uint32_t fdlock_dispatch_impl(uint32_t mode) {
  uint32_t x =
      (mode & static_cast<uint32_t>(ISAAC_LOG_FDLOCK_MODE_MASK)) - 1u;
  if (x == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT);
  }
  x -= 1u;
  if (x == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE);
  }
  x -= 6u;
  if (x == 0u) {
    return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_UNLOCK_ONLY);
  }
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_NONE);
}

/* shr esi,2 ; and esi,1 — bit 2 of the ORIGINAL (pre-mask) mode; case 2
   adds 2. Flags are never computed on cases 8/default (export 0). */
inline uint32_t fdlock_lock_flags_impl(uint32_t mode) {
  const uint32_t bit2 = (mode >> 2u) & 1u;
  const uint32_t d = fdlock_dispatch_impl(mode);
  if (d == static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT)) {
    return bit2;
  }
  if (d == static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE)) {
    return bit2 + 2u;
  }
  return 0u;
}

/* The shared errno arm (0x00a528ee) is reached from the default dispatch
   AND from a failed LockFileEx (`test eax,eax ; je 0xa528ee`). lock_ok =
   the LockFileEx result (nonzero = success); it is NOT consulted on case 8
   (no lock call) or the default (already failing). */
inline uint32_t fdlock_errno_after_impl(uint32_t mode, uint32_t lock_ok) {
  const uint32_t d = fdlock_dispatch_impl(mode);
  const int32_t lock_fails =
      (d ==
           static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT) ||
       d ==
           static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE)) &&
              lock_ok == 0u
          ? 1
          : 0;
  if (d == static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_NONE) ||
      lock_fails != 0) {
    return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_ERRNO_EINVAL);
  }
  return 0u;
}

}  // namespace

extern "C" uint32_t isaac_log_fdlock_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_FDLOCK);
}

extern "C" uint32_t isaac_log_fdlock_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_BODY_BYTES);
}

extern "C" uint32_t isaac_log_fdlock_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_INSN_COUNT);
}

extern "C" uint32_t isaac_log_fdlock_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_fdlock_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_RET_ARGS);
}

extern "C" uint32_t isaac_log_fdlock_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_fdlock_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_fdlock_overlapped_zero_dwords(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_OVERLAPPED_ZERO_DWORDS);
}

extern "C" uint32_t isaac_log_fdlock_overlapped_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_OVERLAPPED_BYTES);
}

extern "C" uint32_t isaac_log_fdlock_osfhandle_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_IAT_OSFHANDLE);
}

extern "C" uint32_t isaac_log_fdlock_unlock_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_IAT_UNLOCK);
}

extern "C" uint32_t isaac_log_fdlock_lock_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_IAT_LOCK);
}

extern "C" uint32_t isaac_log_fdlock_errno_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_IAT_ERRNO);
}

extern "C" int32_t isaac_log_fdlock_osfhandle_unconditional(uint32_t fd,
                                                            uint32_t mode) {
  /* call [0xb188f0] at 0x00a5289b is the FIRST instruction effect after
     the prologue — no branch precedes it; neither input is tested. */
  (void)fd;
  (void)mode;
  return 1;
}

extern "C" int32_t isaac_log_fdlock_unlock_unconditional(uint32_t mode) {
  /* call [0xb18254] at 0x00a528d4 sits BEFORE the dispatch chain, so even
     a mode that then fails with EINVAL has already unlocked (D-LOG-12). */
  (void)mode;
  return 1;
}

extern "C" int32_t isaac_log_fdlock_unlock_result_ignored(void) {
  /* the unlock result (eax) is immediately overwritten by `mov eax, esi`
     at 0x00a528da — never tested (D-LOG-14). */
  return 1;
}

extern "C" uint32_t isaac_log_fdlock_unlock_reserved(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_UNLOCK_RESERVED);
}

extern "C" uint32_t isaac_log_fdlock_unlock_length_low(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_UNLOCK_LENGTH_LOW);
}

extern "C" uint32_t isaac_log_fdlock_unlock_length_high(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_UNLOCK_LENGTH_HIGH);
}

extern "C" int32_t isaac_log_fdlock_unlock_uses_overlapped(void) {
  /* the pushed eax (&ovl) is arg5 of the 5-arg UnlockFileEx — the 20
     zeroed bytes at [ebp-0x14..ebp-4] (contrast: the lock passes NULL). */
  return 1;
}

extern "C" uint32_t isaac_log_fdlock_dispatch(uint32_t mode) {
  return fdlock_dispatch_impl(mode);
}

extern "C" int32_t isaac_log_fdlock_lock_fires(uint32_t mode) {
  const uint32_t d = fdlock_dispatch_impl(mode);
  return (d ==
              static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT) ||
          d ==
              static_cast<uint32_t>(ISAAC_LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_fdlock_lock_flags(uint32_t mode) {
  return fdlock_lock_flags_impl(mode);
}

extern "C" uint32_t isaac_log_fdlock_lock_length_low(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_LOCK_LENGTH_LOW);
}

extern "C" uint32_t isaac_log_fdlock_lock_length_high(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_LOCK_LENGTH_HIGH);
}

extern "C" int32_t isaac_log_fdlock_lock_overlapped_null(void) {
  /* the lock call's arg5 is 0 (NULL): the push sequence is
     &ovl, 0, 1, 0, flags, hFile (6 dwords top->bottom) and the 5-arg
     stdcall consumes (hFile, flags, 0, 1, 0) — the &ovl dword is a STRAY
     the callee never reads; the epilogue's pop/pop + mov esp,ebp
     rebalance it (D-LOG-13). */
  return static_cast<int32_t>(ISAAC_LOG_FDLOCK_LOCK_OVERLAPPED_NULL);
}

extern "C" uint32_t isaac_log_fdlock_errno_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_ERRNO_EINVAL);
}

extern "C" uint32_t isaac_log_fdlock_fail_return(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FDLOCK_FAIL_RETURN);
}

extern "C" uint32_t isaac_log_fdlock_errno_after(uint32_t mode,
                                                 uint32_t lock_ok) {
  return fdlock_errno_after_impl(mode, lock_ok);
}

extern "C" int32_t isaac_log_fdlock_returns(uint32_t mode, uint32_t lock_ok) {
  /* or eax, 0xffffffff on the errno arm; xor eax, eax elsewhere. */
  return fdlock_errno_after_impl(mode, lock_ok) != 0u
             ? static_cast<int32_t>(ISAAC_LOG_FDLOCK_FAIL_RETURN)
             : 0;
}

/* ---------- compile-time pins ---------- */

static_assert(sizeof(IsaacLogOpenReadPlan) == 52,
              "IsaacLogOpenReadPlan layout is pinned in the tests");
static_assert(sizeof(IsaacLogOpenWritePlan) == 48,
              "IsaacLogOpenWritePlan layout is pinned in the tests");

static_assert(sizeof(IsaacLogEmitPlan) == 56,
              "IsaacLogEmitPlan layout is pinned in the tests");
static_assert(ISAAC_LOG_BUFFER_VA + ISAAC_LOG_BUFFER_CAPACITY ==
                  ISAAC_LOG_GUARD_VA,
              "the guard dword sits exactly at buffer end");
static_assert(ISAAC_LOG_PRE_BUFFER_BYTE_VA + 1 == ISAAC_LOG_BUFFER_VA,
              "the D-LOG-1 byte is buffer[-1]");
static_assert(ISAAC_LOG_GUARD_BUSY == 1 && ISAAC_LOG_GUARD_READY == 2,
              "guard state encoding");

/* v2 lifecycle pins. */
static_assert(sizeof(IsaacLogTeardownPlan) == 48,
              "IsaacLogTeardownPlan layout is pinned in the tests");
static_assert(static_cast<int>(ISAAC_LOG_TEARDOWN_ENGAGE_VALUE) ==
                  static_cast<int>(ISAAC_LOG_GUARD_READY),
              "the teardown engages on exactly the logger's READY state");
static_assert(ISAAC_LOG_HOLDER_FLAGS_VA == ISAAC_LOG_MUTEX_HOLDER_VA + 4 &&
                  ISAAC_LOG_CRITSEC_PTR_VA == ISAAC_LOG_MUTEX_HOLDER_VA + 8,
              "holder layout: flags at +4, CRITICAL_SECTION* at +8");
static_assert((ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK & ISAAC_LOG_HOLDER_INIT_BIT) ==
                  0,
              "0x00a71be5 clears exactly the bit 0x00a157a6 sets");
static_assert(ISAAC_LOG_TEARDOWN_CALLSITES == 1 &&
                  ISAAC_LOG_TEARDOWN_ADDRESS_ESCAPES == 0 &&
                  ISAAC_LOG_INSTALLER_CALLSITES == 1 &&
                  ISAAC_LOG_INSTALLER_ADDRESS_ESCAPES == 0,
              "both lifecycle roots are single-caller with no address escape");
static_assert(ISAAC_LOG_SINK_STATE_OPEN != ISAAC_LOG_SINK_STATE_NO_FILE &&
                  ISAAC_LOG_SINK_STATE_NONE < 0,
              "sink state encoding is distinguishable");

/* v3 init pins. */
static_assert(sizeof(IsaacLogInitPlan) == 60,
              "IsaacLogInitPlan layout is pinned in the tests");
static_assert(ISAAC_LOG_VA_INIT < ISAAC_LOG_VA_INIT_LIFECYCLE_TEST &&
                  ISAAC_LOG_VA_INIT_LIFECYCLE_STORE <
                      ISAAC_LOG_VA_INIT_RET_OK &&
                  ISAAC_LOG_VA_INIT_RET_OK < ISAAC_LOG_VA_INIT_FAIL_LABEL &&
                  ISAAC_LOG_VA_INIT_FAIL_LABEL < ISAAC_LOG_VA_INIT_RET_FAIL,
              "init body ordering: the AL=1 ret precedes the failure label");
static_assert(ISAAC_LOG_INIT_WARN_LEVEL == 0x10 &&
                  ISAAC_LOG_BOOT_LOG_LEVEL == 1,
              "the init warns at ASSERT, the dominating boot site at INFO");
/* 0x00a711a5 compares the vtable slot against the logger's own holder-init
   body, and 0x00a71122 stores the logger's own holder vtable. */
static_assert(ISAAC_LOG_INIT_OBJECT_MAGIC != 0,
              "the 0x00a71113 immediate is pinned, not construed");
static_assert(static_cast<int>(ISAAC_LOG_INIT_CRITSEC_READY_BIT) ==
                      static_cast<int>(ISAAC_LOG_HOLDER_INIT_BIT) &&
                  static_cast<int>(ISAAC_LOG_INIT_CMD_THREAD_READY_BIT) ==
                      static_cast<int>(ISAAC_LOG_HOLDER_INIT_BIT),
              "all three lazy-init flags use bit 0, like the logger holder");
static_assert((static_cast<int>(ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK) &
               static_cast<int>(ISAAC_LOG_INIT_CRITSEC_READY_BIT)) == 0,
              "the teardown's byte `and 0xfe` clears exactly this bit");
static_assert(ISAAC_LOG_INIT_CALLSITES == 1 &&
                  ISAAC_LOG_INIT_ADDRESS_ESCAPES == 0 &&
                  ISAAC_LOG_INIT_INBOUND_TRANSFERS == 0 &&
                  ISAAC_LOG_INIT_UNDECODABLE_BYTES == 0 &&
                  ISAAC_LOG_INIT_ORPHAN_BLOCKS == 0,
              "the init root is single-caller with a clean linear decode");
static_assert(static_cast<int>(ISAAC_LOG_TEARDOWN_CALLSITES_V3) ==
                  static_cast<int>(ISAAC_LOG_TEARDOWN_CALLSITES),
              "v3 re-verified the teardown reach-site count independently");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V3) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V2) &&
                  static_cast<int>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V3) ==
                      static_cast<int>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V2),
              "same decode configuration as v2 (v1's figure still differs)");
static_assert(ISAAC_LOG_GUARD_ADDRESS_ESCAPES == 0 &&
                  ISAAC_LOG_GUARD_WRITERS == 4 &&
                  ISAAC_LOG_GUARD_DISTINCT_VALUES == 3,
              "the D-LOG-3 proof needs the guard writer census to be closed");
static_assert(ISAAC_LOG_LIFECYCLE_BYTE_WRITERS == 2 &&
                  ISAAC_LOG_LIFECYCLE_BYTE_READERS == 2,
              "lifecycle byte: init sets, teardown clears, two readers");
static_assert(ISAAC_LOG_INIT_FAIL_PREDECESSORS == 3,
              "the fail label has exactly three predecessors");

/* v4 lock/unlock pins. */
static_assert(sizeof(IsaacLogLockPlan) == 60,
              "IsaacLogLockPlan layout is pinned in the tests");
static_assert(static_cast<unsigned>(ISAAC_LOG_VA_LOCK) ==
                      static_cast<unsigned>(ISAAC_LOG_VA_MUTEX_LOCK) &&
                  static_cast<unsigned>(ISAAC_LOG_VA_UNLOCK) ==
                      static_cast<unsigned>(ISAAC_LOG_VA_MUTEX_UNLOCK),
              "v4 roots are the pair v1 already recorded as host actions");
static_assert(static_cast<unsigned>(ISAAC_LOG_VA_VTBL_LOCK_ENTRY) ==
                      static_cast<unsigned>(ISAAC_LOG_MUTEX_VTABLE_VA) +
                          static_cast<unsigned>(
                              ISAAC_LOG_MUTEX_VTBL_SLOT_LOCK) &&
                  static_cast<unsigned>(ISAAC_LOG_VA_VTBL_UNLOCK_ENTRY) ==
                      static_cast<unsigned>(ISAAC_LOG_MUTEX_VTABLE_VA) +
                          static_cast<unsigned>(
                              ISAAC_LOG_MUTEX_VTBL_SLOT_UNLOCK),
              "the two roots sit at vtbl+0xc and vtbl+0x10");
static_assert(static_cast<unsigned>(ISAAC_LOG_VA_MUTEX_INIT) ==
                  static_cast<unsigned>(ISAAC_LOG_VA_MUTEX_DTOR) + 0x90u,
              "vtable band: dtor 0x00a156e0, init 0x00a15770");
static_assert(ISAAC_LOG_LOCK_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_UNLOCK_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_LOCK_TAIL_JUMPS == 0 &&
                  ISAAC_LOG_UNLOCK_TAIL_JUMPS == 0 &&
                  ISAAC_LOG_LOCK_IMMEDIATE_SITES == 0 &&
                  ISAAC_LOG_UNLOCK_IMMEDIATE_SITES == 0 &&
                  ISAAC_LOG_LOCK_RAW_OCCURRENCES == 1 &&
                  ISAAC_LOG_UNLOCK_RAW_OCCURRENCES == 1,
              "the vtable slot is the ONLY reach channel for either root");
static_assert(ISAAC_LOG_MUTEX_VTABLE_RAW_OCCURRENCES ==
                  ISAAC_LOG_MUTEX_VTABLE_TEXT_STORES +
                      ISAAC_LOG_MUTEX_VTABLE_DATA_INSTANCES,
              "41 = 37 .text constructions + 4 file-backed .data instances");
static_assert(ISAAC_LOG_MUTEX_GLOBAL_DISPATCH_SITES ==
                      2 * ISAAC_LOG_MUTEX_GLOBAL_LOCK_SITES &&
                  ISAAC_LOG_MUTEX_GLOBAL_INFINITE_SITES ==
                      ISAAC_LOG_MUTEX_GLOBAL_LOCK_SITES &&
                  ISAAC_LOG_MUTEX_GLOBAL_FINITE_SITES == 0,
              "every statically resolvable global lock dispatch passes -1");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V4) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V3) &&
                  static_cast<int>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V4) ==
                      static_cast<int>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V3),
              "v4 reproduced the v2/v3 decode configuration exactly");
static_assert(static_cast<int>(ISAAC_LOG_LOCK_READY_BIT) ==
                      static_cast<int>(ISAAC_LOG_HOLDER_INIT_BIT) &&
                  static_cast<int>(ISAAC_LOG_LOCK_READY_BIT) ==
                      static_cast<int>(ISAAC_LOG_INIT_CRITSEC_READY_BIT),
              "all five `F6 /0 ib` sites test the same bit");
/* The predicate is shared five ways; the guarded body is not. */
static_assert(ISAAC_LOG_READY_BIT_PREDICATE_SITES == 5 &&
                  ISAAC_LOG_LAZY_INIT_TEMPLATE_INSTANCES == 2 &&
                  ISAAC_LOG_ASSERT_GUARD_TEMPLATE_INSTANCES == 2 &&
                  ISAAC_LOG_LAZY_INIT_TEMPLATE_INSTANCES +
                          ISAAC_LOG_ASSERT_GUARD_TEMPLATE_INSTANCES + 1 ==
                      ISAAC_LOG_READY_BIT_PREDICATE_SITES,
              "5 predicate sites = 2 lazy-init + 2 assert-guard + 0x00a713f8");
static_assert(static_cast<uint32_t>(ISAAC_LOG_LOCK_SPIN_SLEEP_MS) >
                  static_cast<uint32_t>(ISAAC_LOG_LOCK_RETRY_SLEEP_MS),
              "the INFINITE spin sleeps 1000 ms, the timed retry 10 ms");
static_assert(ISAAC_LOG_INIT_CRITSEC_ZERO_OFFSET == 0x18,
              "the byte the spin re-reads is the one both inits zero");
static_assert(ISAAC_LOG_VA_LOCK_OWNED_STORE < ISAAC_LOG_VA_LOCK_SUCCESS &&
                  ISAAC_LOG_VA_LOCK_SUCCESS < ISAAC_LOG_VA_LOCK_RET_TRUE,
              "D-LOG-7 needs the owned store to sit ABOVE the AL=1 label so "
              "the timed branch can jump over it");
static_assert(ISAAC_LOG_VA_LOCK_SLEEP_PTR_LOAD < ISAAC_LOG_VA_LOCK_SPIN_HEAD &&
                  ISAAC_LOG_VA_LOCK_SPIN_HEAD < ISAAC_LOG_VA_LOCK_SPIN_RETEST &&
                  ISAAC_LOG_VA_LOCK_SPIN_RETEST <
                      ISAAC_LOG_VA_LOCK_SPIN_BACK_EDGE,
              "the Sleep pointer load is hoisted above the loop head, and "
              "the back edge targets the push, not the IAT read");
static_assert(ISAAC_LOG_VA_LOCK_TIMED_ENTRY < ISAAC_LOG_VA_LOCK_RETRY_HEAD &&
                  ISAAC_LOG_VA_LOCK_RETRY_HEAD < ISAAC_LOG_VA_LOCK_NOW_READ,
              "the start timestamp is captured above the retry loop head "
              "while `now` is re-read inside it");
static_assert(ISAAC_LOG_VA_UNLOCK_OWNED_STORE < ISAAC_LOG_VA_UNLOCK_LEAVE_CALL,
              "the unlock clears the byte BEFORE LeaveCriticalSection");
static_assert(ISAAC_LOG_HOLDER_FLAGS_INDIRECT_READERS == 2 &&
                  ISAAC_LOG_HOLDER_FLAGS_READERS == 0,
              "the v2 absolute-displacement census stands; the two real "
              "readers reach the cell as [eax+4] / [esi+4]");
static_assert(ISAAC_LOG_HOLDER_LOAD_TIME_FLAGS == 0 &&
                  ISAAC_LOG_HOLDER_LOAD_TIME_CRITSEC == 0,
              "the logger holder ships with bit 0 clear and a NULL critsec");

/* ---------- v5 pins ---------- */

static_assert(sizeof(IsaacLogDestroyPlan) == 80,
              "IsaacLogDestroyPlan layout is pinned in the tests");
static_assert(ISAAC_LOG_PURE_HELPERS_ABI_VERSION == 25,
              "v27 lands the base-class flags-CLEAR twin 0xa649c0 "
              "(v25 lands the base-class open twins + the flags set1/flush "
              "clear leaves (0xb83418 / 0xb833d8 members): ABI 22 -> 23 "
              "(v22 lands the state!=2 getter 0x00a25440 — the 3-insn "
              "pure body `cmp dword ptr [ecx+4],2 ; setne al ; ret` — "
              "FULL-dword "
              "read of the state cell (byte-gate law), 0/1 boolean, no "
              "SEH/GS, no store, no call, plain ret; 3 devirt-cmp "
              "inlined copies at 0x92be28/0x92c008/0x92c1e8 inline the "
              "identical body (binary confirmation); carriers = the "
              "+0x30 slots of 0xb833d8/0xba5184/0xb9e940 plus the "
              "13-slot function table 0xb65724; 0xb9c15c corrected to a "
              "10-slot table (string data at +0x30, NOT a slot); census "
              "0 direct callers, RAW_OCCURRENCES 7 (4 .rdata + 3 .text "
              "imm); the deleting wrapper 0xa254c0 (vtable 0xb83418 "
              "+0x00) censused and classified EVIDENCE (vtbl class: "
              "2-store vtable chain, sized-free 0xaef15c x2, flags "
              "clear, deleting-flag byte gate, ret 4)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_VTBL_DESTROY_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_MUTEX_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_MUTEX_VTBL_SLOT_DESTROY) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_VTBL_DTOR_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_MUTEX_VTABLE_VA) +
                          static_cast<uint32_t>(ISAAC_LOG_MUTEX_VTBL_SLOT_DTOR),
              "the destroy and dtor slots sit at vtable +8 and +0");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DTOR) <
                      static_cast<uint32_t>(
                          ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY) <
                      static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_INIT) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_INIT) <
                      static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DESTROY) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DESTROY) <
                      static_cast<uint32_t>(ISAAC_LOG_VA_LOCK),
              "the five vtable-band bodies are laid out in this order");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DTOR_END) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY),
              "the dtor's `ret 4` ends exactly where 0x00a15730 begins");
static_assert(static_cast<uint32_t>(ISAAC_LOG_DTOR_BODY_BYTES) ==
                      static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DTOR_END) -
                          static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DTOR) &&
                  static_cast<uint32_t>(ISAAC_LOG_UNWIND_DESTROY_BODY_BYTES) ==
                      static_cast<uint32_t>(
                          ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY_END) -
                          static_cast<uint32_t>(
                              ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY) &&
                  static_cast<uint32_t>(ISAAC_LOG_DESTROY_BODY_BYTES) ==
                      static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DESTROY_END) -
                          static_cast<uint32_t>(ISAAC_LOG_VA_MUTEX_DESTROY),
              "the recorded body lengths agree with the recorded extents");
static_assert(ISAAC_LOG_DESTROY_SHARED_BYTES_0_1 +
                      ISAAC_LOG_DESTROY_FORCED_REL32_DELTA_BYTES ==
                  ISAAC_LOG_DESTROY_BODY_BYTES,
              "0x00a157c0 is 0x00a15730 minus the two vtable stores");
static_assert(ISAAC_LOG_DESTROY_SHARED_BYTES_0_1 +
                      ISAAC_LOG_DESTROY_FORCED_REL32_DELTA_BYTES +
                      2 * ISAAC_LOG_DESTROY_VTABLE_STORE_BYTES ==
                  ISAAC_LOG_UNWIND_DESTROY_BODY_BYTES,
              "the whole delta is exactly two 6-byte vtable stores");
static_assert(ISAAC_LOG_DESTROY_TEMPLATE_OUT_OF_LINE +
                      ISAAC_LOG_DESTROY_TEMPLATE_INLINED ==
                  ISAAC_LOG_DESTROY_TEMPLATE_INSTANCES,
              "27 template instances = 3 out-of-line + 24 inlined");
static_assert(static_cast<int>(ISAAC_LOG_DESTROY_TEMPLATE_INSTANCES) <
                  static_cast<int>(ISAAC_LOG_DELETE_CRITICAL_SECTION_SITES),
              "not every DeleteCriticalSection site is a template instance");
static_assert(ISAAC_LOG_UNWIND_DESTROY_FRAME_FUNCLETS +
                      ISAAC_LOG_UNWIND_DESTROY_ABSOLUTE_THUNKS ==
                  ISAAC_LOG_UNWIND_DESTROY_TAIL_JUMPS,
              "the ten tail entries split 8 funclets / 2 absolute thunks");
static_assert(ISAAC_LOG_UNWIND_DESTROY_TAIL_JUMPS !=
                  ISAAC_LOG_UNWIND_DESTROY_REACH_V4_REPORTED,
              "the inherited zero-reference claim is superseded, not copied");
static_assert(ISAAC_LOG_HOLDER_READY_BIT_ABSOLUTE_SETTERS == 0 &&
                  ISAAC_LOG_HOLDER_READY_BIT_SETTERS == 1 &&
                  ISAAC_LOG_HOLDER_READY_BIT_CLEARERS == 2,
              "the logger's ready bit: one indirect setter, two clearers");
static_assert(static_cast<int>(ISAAC_LOG_HOLDER_DESTROY_SITES) ==
                  static_cast<int>(ISAAC_LOG_HOLDER_READY_BIT_CLEARERS),
              "each logger destroy site is exactly one ready-bit clear");
static_assert((static_cast<int>(ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK) & 0xff) ==
                      (0xff & ~static_cast<int>(ISAAC_LOG_HOLDER_INIT_BIT)) &&
                  static_cast<int>(ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK) < 0x100,
              "0xfe clears exactly bit 0 and is a BYTE mask");
static_assert(static_cast<int>(ISAAC_LOG_MUTEX_CRITSEC_SIZE) == 0x1c &&
                  static_cast<int>(ISAAC_LOG_MUTEX_OWNED_OFFSET) == 0x18 &&
                  static_cast<int>(ISAAC_LOG_MUTEX_OWNED_OFFSET) <
                      static_cast<int>(ISAAC_LOG_MUTEX_CRITSEC_SIZE),
              "the ownership byte lives inside the 0x1c allocation");
static_assert(static_cast<int>(ISAAC_LOG_MUTEX_OBJECT_SIZE) == 0x0c &&
                  static_cast<int>(ISAAC_LOG_MUTEX_OBJECT_SIZE) ==
                      static_cast<int>(ISAAC_LOG_HOLDER_CRITSEC_OFFSET) + 4,
              "the holder is {vptr, flags, critsec} = 12 bytes");
static_assert(static_cast<int>(ISAAC_LOG_READY_STATES_REACHABLE) ==
                  static_cast<int>(ISAAC_LOG_READY_STATE_IMPOSSIBLE),
              "three reachable states plus the unreachable (0, non-NULL)");
static_assert(ISAAC_LOG_DESTROY_ACTIONS_MAX == 7,
              "variant 2 with a live critsec and the delete flag set is the "
              "longest action list: vptr, delete, free, null, clear, vptr, "
              "free object");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V5) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V4) &&
                  static_cast<long long>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V5) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V4),
              "v5 reproduces the v2/v3/v4 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V5_EXACT_ZHL_MATCHES) == 0,
              "no v5 VA has an exact ZHL signature; all stay address-stable");


/* ---------- v6 pins ---------- */

static_assert(sizeof(IsaacLogWritePlan) == 44,
              "IsaacLogWritePlan layout is pinned in the tests");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_WRITE) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_LISTENER_WRITE),
              "v6 root is the write VA v1 already recorded as a host action");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_VTBL_WRITE_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_SINK_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_VTBL_SLOT_WRITE) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_VTBL_FLUSH_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_SINK_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_VTBL_SLOT_FLUSH),
              "write sits at vtbl+0x1c and flush at vtbl+0x20");
static_assert(static_cast<uint32_t>(ISAAC_LOG_WRITE_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_WRITE_END) -
                      static_cast<uint32_t>(ISAAC_LOG_VA_WRITE),
              "body length agrees with the recorded extent");
static_assert(static_cast<int>(ISAAC_LOG_SINK_STATE_OPEN) == 1 &&
                  static_cast<int>(ISAAC_LOG_SINK_STATE_NO_FILE) == 2,
              "the cmp immediate is exactly the OPEN encoding");
static_assert(static_cast<int>(ISAAC_LOG_SINK_STATE_OFFSET) == 4 &&
                  static_cast<int>(ISAAC_LOG_SINK_FILE_OFFSET) == 0x0c &&
                  static_cast<int>(ISAAC_LOG_SINK_ALLOC_SIZE) == 0x10,
              "sink layout: {vptr, state, path, FILE*} = 16 bytes");
static_assert(ISAAC_LOG_WRITE_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_WRITE_RAW_OCCURRENCES == 1 &&
                  ISAAC_LOG_WRITE_LOGGER_DISPATCH_SITES == 1,
              "reached only through the vtable slot the logger loads");
static_assert(ISAAC_LOG_WRITE_FFLUSH_SITES_IN_BODY == 2 &&
                  ISAAC_LOG_WRITE_FWRITE_SITES_IN_BODY == 1,
              "fflush on both arms, fwrite on the open arm only");
static_assert(static_cast<int>(ISAAC_LOG_LOGGER_WRITE_SIZE_IMM) == 1,
              "the logger pushes size 1, so the shipped imul is identity");
static_assert(ISAAC_LOG_WRITE_SIBLING_BODY_BYTES != ISAAC_LOG_WRITE_BODY_BYTES,
              "the other vtable's write is not this body");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V6) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V5) &&
                  static_cast<long long>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V6) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V5),
              "v6 reproduces the v2/v3/v4/v5 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V6_EXACT_ZHL_MATCHES) == 0,
              "no v6 VA has an exact ZHL signature; all stay address-stable");

/* ---------- v7 pins ---------- */

static_assert(sizeof(IsaacLogSiblingWritePlan) == 44,
              "IsaacLogSiblingWritePlan layout is pinned in the tests");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_WRITE) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_WRITE_SIBLING),
              "v7 root is the sibling VA v6 already recorded as not translated");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_VTBL_WRITE_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_SIBLING_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_VTBL_SLOT_WRITE) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_VTBL_FLUSH_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_SIBLING_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_VTBL_SLOT_FLUSH),
              "sibling write sits at vtbl+0x1c and flush at vtbl+0x20");
static_assert(static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_BODY_BYTES) ==
                      static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_WRITE_END) -
                          static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_WRITE) &&
                  static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_BODY_BYTES) ==
                      static_cast<uint32_t>(ISAAC_LOG_WRITE_SIBLING_BODY_BYTES),
              "body length agrees with the recorded extent and the v6 pin");
static_assert(static_cast<uint32_t>(ISAAC_LOG_SIBLING_FLUSH_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FLUSH_END) -
                      static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FLUSH),
              "flush slot is 0xb bytes through the first int3");
static_assert(ISAAC_LOG_SIBLING_WRITE_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_SIBLING_WRITE_RAW_OCCURRENCES == 1,
              "reached only through the other vtable's write slot");
static_assert(ISAAC_LOG_SIBLING_WRITE_FFLUSH_SITES_IN_BODY == 0 &&
                  ISAAC_LOG_SIBLING_WRITE_FWRITE_SITES_IN_BODY == 1 &&
                  ISAAC_LOG_SIBLING_FLUSH_FFLUSH_SITES_IN_BODY == 1,
              "fwrite on the open arm only; fflush is a separate slot");
static_assert(ISAAC_LOG_SIBLING_SHARED_PREFIX_BYTES == 3 &&
                  static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_BODY_BYTES) !=
                      static_cast<uint32_t>(ISAAC_LOG_WRITE_BODY_BYTES),
              "shared prefix 55 8b ec is not one template with v6");
static_assert(ISAAC_LOG_SIBLING_FREAD_SHARED_BYTES +
                      ISAAC_LOG_SIBLING_FREAD_DIFF_BYTES ==
                  ISAAC_LOG_SIBLING_WRITE_BODY_BYTES,
              "fread is one template: 42 shared + 2 diffs = 0x2c");
static_assert(ISAAC_LOG_SIBLING_FREAD_RAW_OCCURRENCES == 2,
              "fread 0x00a52820 sits in BOTH vtables at +0x14");
static_assert(static_cast<uint32_t>(ISAAC_LOG_IAT_FREAD) + 4u ==
                  static_cast<uint32_t>(ISAAC_LOG_IAT_FWRITE),
              "fread IAT is the dword immediately before fwrite");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V7) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V6) &&
                  static_cast<long long>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V7) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V6),
              "v7 reproduces the v2..v6 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V7_EXACT_ZHL_MATCHES) == 0,
              "no v7 VA has an exact ZHL signature; all stay address-stable");

/* ---------- v8 pins ---------- */

static_assert(sizeof(IsaacLogSiblingFreadPlan) == 44,
              "IsaacLogSiblingFreadPlan layout is pinned in the tests");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FREAD_END) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FREAD) +
                      static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_BODY_BYTES),
              "body length agrees with the recorded extent");
static_assert(static_cast<uint32_t>(ISAAC_LOG_SIBLING_FREAD_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_SIBLING_WRITE_BODY_BYTES),
              "one template: fread and v7 write are both 0x2c");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_VTBL_FREAD_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_SIBLING_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_VTBL_SLOT_FREAD) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_SINK_VTBL_FREAD_ENTRY) ==
                      static_cast<uint32_t>(ISAAC_LOG_SINK_VTABLE_VA) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_VTBL_SLOT_FREAD),
              "fread sits at +0x14 of BOTH vtables");
static_assert(static_cast<int>(ISAAC_LOG_SINK_STATE_OPEN_READ) == 0 &&
                  static_cast<int>(ISAAC_LOG_SINK_STATE_OPEN_READ) !=
                      static_cast<int>(ISAAC_LOG_SINK_STATE_OPEN) &&
                  static_cast<int>(ISAAC_LOG_SINK_STATE_OPEN) == 1,
              "fread cmp immediate is 0; write cmp immediate is 1; do not fold");
static_assert(ISAAC_LOG_SIBLING_FREAD_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_SIBLING_FREAD_RAW_OCCURRENCES == 2,
              "reached only through the two vtable +0x14 slots");
static_assert(ISAAC_LOG_SIBLING_FREAD_FFLUSH_SITES_IN_BODY == 0 &&
                  ISAAC_LOG_SIBLING_FREAD_FREAD_SITES_IN_BODY == 1,
              "fread on the readable arm only; fflush is a separate slot");
static_assert(ISAAC_LOG_SIBLING_FREAD_SHARED_BYTES +
                      ISAAC_LOG_SIBLING_FREAD_DIFF_BYTES ==
                  ISAAC_LOG_SIBLING_FREAD_BODY_BYTES,
              "42 shared + 2 diffs = 0x2c");
static_assert(static_cast<uint32_t>(ISAAC_LOG_IAT_FREAD) + 4u ==
                  static_cast<uint32_t>(ISAAC_LOG_IAT_FWRITE),
              "fread IAT is the dword immediately before fwrite");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V8) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V7) &&
                  static_cast<long long>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V8) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V7),
              "v8 reproduces the v2..v7 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V8_EXACT_ZHL_MATCHES) == 0,
              "no v8 VA has an exact ZHL signature; all stay address-stable");

/* ---------- v11 pins ---------- */

static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_DTOR_INNER_END) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_DTOR_INNER) +
                      static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_BODY_BYTES),
              "0xa52410 + 0x92 = 0xa524a2 (first int3 after the ret)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_VTABLE_BASE) ==
                  static_cast<uint32_t>(ISAAC_LOG_SIBLING_VTABLE_VA),
              "the dtor inner body first stores the SIBLING vtable 0xb9e940 "
              "(the sink IS a sibling-class object)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_STATE_VALUE) ==
                  static_cast<uint32_t>(ISAAC_LOG_SINK_STATE_NO_FILE),
              "the dtor writes state 2 == the sink's NO_FILE polar value");
static_assert(ISAAC_LOG_DTOR_INNER_STATE_STORES == 2 &&
                  ISAAC_LOG_DTOR_INNER_ACTION_FCLOSE !=
                      ISAAC_LOG_DTOR_INNER_ACTION_FREE &&
                  ISAAC_LOG_DTOR_INNER_ACTIONS_MAX == 2 &&
                  ISAAC_LOG_DTOR_INNER_ACTION_NONE == 0,
              "two state stores write two distinct host actions");
static_assert(ISAAC_LOG_DTOR_INNER_FCLOSE_CALL_VA <
                  ISAAC_LOG_DTOR_INNER_STATE_STORE1_VA &&
              ISAAC_LOG_DTOR_INNER_STATE_STORE1_VA <
                  ISAAC_LOG_DTOR_INNER_FREE_CALL_VA &&
              ISAAC_LOG_DTOR_INNER_FREE_CALL_VA <
                  ISAAC_LOG_DTOR_INNER_VTABLE_STORE3_VA,
              "action order: fclose, then state=2, then free, then final "
              "vtable — the ffree is sandwiched between the two stores");
static_assert(ISAAC_LOG_DTOR_INNER_INBOUND_CALLSITES == 3 &&
                  ISAAC_LOG_DTOR_INNER_RAW_OCCURRENCES == 0,
              "three relative transfers bind the body; no data pointer does");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V11) ==
                  static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V10) &&
                  static_cast<long long>(
                      ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V11) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V10),
              "v11 reproduces the v2..v10 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V11_EXACT_ZHL_MATCHES) == 0,
              "no v11 VA has an exact ZHL signature; all stay address-stable");

/* ---------- v12 pins ---------- */

static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER_END) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER) +
                      static_cast<uint32_t>(
                          ISAAC_LOG_NEIGHBOR_DTOR_INNER_BODY_BYTES),
              "0xa84060 + 0x7d = 0xa840dd (first int3 after the ret)");
static_assert(static_cast<uint32_t>(
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_BASE) ==
                  static_cast<uint32_t>(ISAAC_LOG_NEIGHBOR_DTOR_VTABLE),
              "the inner stores the NEIGHBOR vtable 0xba5520 itself (the "
              "v9 wrapper does NOT — the sink's wrapper-store differs)");
static_assert(static_cast<uint32_t>(
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_BASE) !=
                      static_cast<uint32_t>(
                          ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL) &&
                  static_cast<uint32_t>(
                      ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL) !=
                      static_cast<uint32_t>(ISAAC_LOG_DTOR_INNER_VTABLE_BASE),
              "0xba2218 is the NEIGHBOR final, distinct from both sink "
              "vtable values — do not homogenise the two inner bodies");
static_assert(ISAAC_LOG_NEIGHBOR_DTOR_INNER_PATH_OFFSET == 0x20 &&
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_LOBBY_OFFSET == 0x28 &&
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_OFFSET == 0x10,
              "neighbor cell layout: path +0x20, EOS lobby +0x28, sub +0x10");
static_assert(ISAAC_LOG_NEIGHBOR_DTOR_INNER_FREE_CALL_VA <
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_RELEASE_CALL_VA &&
              ISAAC_LOG_NEIGHBOR_DTOR_INNER_RELEASE_CALL_VA <
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_LOBBY_NULL_VA &&
              ISAAC_LOG_NEIGHBOR_DTOR_INNER_LOBBY_NULL_VA <
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_STORE2_VA &&
              ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_STORE2_VA <
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_DTOR_CALL_VA,
              "action order: free, then release, then lobby-NULL, then the "
              "final vtable store, then the sub-object dtor (last)");
static_assert(ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE !=
                      ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE &&
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTIONS_MAX == 2 &&
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE == 0,
              "two distinct host actions; none == 0");
static_assert(ISAAC_LOG_NEIGHBOR_DTOR_INNER_INBOUND_CALLSITES == 2 &&
                  ISAAC_LOG_NEIGHBOR_DTOR_INNER_RAW_OCCURRENCES == 0,
              "two relative transfers bind the neighbor inner (wrapper "
              "0xa84036 + funclet 0xb14783); no data pointer does");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V12) ==
                  static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V11) &&
                  static_cast<long long>(
                      ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V12) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V11),
              "v12 reproduces the v2..v11 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V12_EXACT_ZHL_MATCHES) == 0,
              "no v12 VA has an exact ZHL signature; all stay address-stable");

/* ---------- v13 pins (flush slot 0x00a52880) ---------- */

static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_FLUSH_SLOT) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FLUSH) &&
              static_cast<uint32_t>(ISAAC_LOG_VA_FLUSH_SLOT_END) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_FLUSH_END) &&
              static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_SIBLING_FLUSH_BODY_BYTES),
              "the v13 slot IS the v7 sibling flush slot — same VA/end/bytes");
static_assert(static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_BODY_BYTES) ==
                      static_cast<uint32_t>(ISAAC_LOG_VA_FLUSH_SLOT_END) -
                          static_cast<uint32_t>(ISAAC_LOG_VA_FLUSH_SLOT),
              "flush slot is 0xb bytes through the first int3");
static_assert(static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_IAT_VA) ==
                  static_cast<uint32_t>(ISAAC_LOG_IAT_FFLUSH),
              "the slot calls the same fflush IAT the v6 write body calls");
static_assert(static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_ENTRY_VA) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_SIBLING_VTBL_FLUSH_ENTRY) &&
              static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_ENTRY_VA) ==
                  static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_VA) +
                      static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_VTBL_SLOT),
              "0xb9e940 + 0x20 = 0xb9e960 — the ONLY raw dword occurrence");
static_assert(ISAAC_LOG_FLUSH_SLOT_RET_ARGS == 0 &&
                  ISAAC_LOG_FLUSH_SLOT_STACK_BYTES_POPPED == 0 &&
                  ISAAC_LOG_FLUSH_SLOT_INDIRECT_CALLS == 1 &&
                  ISAAC_LOG_FLUSH_SLOT_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_FLUSH_SLOT_INBOUND == 0 &&
                  ISAAC_LOG_FLUSH_SLOT_RAW_OCCURRENCES == 1,
              "plain ret, balanced push/pop, one IAT call, zero direct "
              "refs, one data-dword bind (the vtable slot)");
static_assert(ISAAC_LOG_FLUSH_SLOT_FFLUSH_IAT_SITES == 6 &&
                  ISAAC_LOG_FLUSH_SLOT_VTBL_IS_NOP == 0,
              "six whole-.text fflush call sites; the sibling slot is a "
              "REAL fflush (the sink 0x00ba5184 +0x20 nop differs)");
static_assert(ISAAC_LOG_FLUSH_SLOT_PUSH_VA < ISAAC_LOG_FLUSH_SLOT_CALL_VA &&
              ISAAC_LOG_FLUSH_SLOT_CALL_VA < ISAAC_LOG_FLUSH_SLOT_POP_VA &&
              ISAAC_LOG_FLUSH_SLOT_POP_VA < ISAAC_LOG_FLUSH_SLOT_RET_VA &&
              static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_RET_VA) ==
                  static_cast<uint32_t>(ISAAC_LOG_FLUSH_SLOT_FIRST_RET_VA),
              "program order: push [ecx+0xc], call [0xb1891c], pop ecx, "
              "plain ret — the ret IS the first (and only) return");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V13) ==
                  static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V12) &&
                  static_cast<long long>(
                      ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V13) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V12),
              "v13 reproduces the v2..v12 decode exactly");
static_assert(static_cast<int>(ISAAC_LOG_V13_EXACT_ZHL_MATCHES) == 0,
              "no v13 VA has an exact ZHL signature; all stay address-stable");

/* ---------- v14 pins (fd lock/unlock helper 0x00a52890) ---------- */

static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_FDLOCK_END) -
                      static_cast<uint32_t>(ISAAC_LOG_VA_FDLOCK) ==
                  static_cast<uint32_t>(ISAAC_LOG_FDLOCK_BODY_BYTES),
              "body 0x00a52890..0x00a52931 = 0xa2 bytes through the int3");
static_assert(ISAAC_LOG_FDLOCK_FIRST_RET_VA >= ISAAC_LOG_VA_FDLOCK &&
                  ISAAC_LOG_FDLOCK_FIRST_RET_VA < ISAAC_LOG_VA_FDLOCK_END,
              "the EINVAL arm ret 0x00a52902 is inside the body");
static_assert(ISAAC_LOG_FDLOCK_RET_ARGS == 0 &&
                  ISAAC_LOG_FDLOCK_INDIRECT_CALLS == 4 &&
                  ISAAC_LOG_FDLOCK_DIRECT_CALLSITES == 26,
              "plain ret, four IAT calls (osfhandle/unlock/lock/errno), "
              "26 whole-.text direct callers");
static_assert(ISAAC_LOG_FDLOCK_IAT_OSFHANDLE == 0x00b188f0u &&
                  ISAAC_LOG_FDLOCK_IAT_UNLOCK == 0x00b18254u &&
                  ISAAC_LOG_FDLOCK_IAT_LOCK == 0x00b18250u &&
                  ISAAC_LOG_FDLOCK_IAT_ERRNO == 0x00b18898u,
              "IAT identities resolved from the PE import directory this "
              "unit: _get_osfhandle / UnlockFileEx / LockFileEx / _errno");
static_assert(ISAAC_LOG_FDLOCK_OVERLAPPED_ZERO_DWORDS == 5 &&
                  ISAAC_LOG_FDLOCK_OVERLAPPED_BYTES == 20,
              "five zero dwords at [ebp-0x14..ebp-4] = a 20-byte OVERLAPPED");
static_assert(ISAAC_LOG_FDLOCK_UNLOCK_LENGTH_LOW == 1 &&
                  ISAAC_LOG_FDLOCK_UNLOCK_LENGTH_HIGH == 0 &&
                  ISAAC_LOG_FDLOCK_LOCK_LENGTH_LOW == 0 &&
                  ISAAC_LOG_FDLOCK_LOCK_LENGTH_HIGH == 1 &&
                  ISAAC_LOG_FDLOCK_LOCK_OVERLAPPED_NULL == 1,
              "the unlock/lock length asymmetry and the NULL lock overlapped "
              "are machine facts (D-LOG-13), never homogenised");
static_assert(ISAAC_LOG_FDLOCK_ERRNO_EINVAL == 0x16u &&
                  ISAAC_LOG_FDLOCK_FAIL_RETURN == 0xffffffffu,
              "mov [eax], 0x16 then or eax, 0xffffffff on the shared arm");
static_assert(ISAAC_LOG_FDLOCK_DISPATCH_NONE == 0 &&
                  ISAAC_LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT == 1 &&
                  ISAAC_LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE == 2 &&
                  ISAAC_LOG_FDLOCK_DISPATCH_UNLOCK_ONLY == 8 &&
                  ISAAC_LOG_FDLOCK_MODE_MASK == 0xfffffffbU,
              "and eax, ~4 clears bit 2 only; the switch values are 1/2/8");
static_assert(static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V14) ==
                      static_cast<long long>(ISAAC_LOG_TEXT_INSN_COUNT_V13) &&
                  static_cast<long long>(
                      ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V14) ==
                      static_cast<long long>(
                          ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V13),
              "v14 carries the v13 whole-.text decode (same binary SHA)");
static_assert(static_cast<int>(ISAAC_LOG_V14_BATCHED_VAS) == 4 &&
                  static_cast<int>(ISAAC_LOG_V14_EXACT_ZHL_MATCHES) == 0,
              "0xa52890 was identity-batched with v13 (0 exact ZHL)");

/* ---------- v15 pins (the deleting-dtor WRAPPER bodies) ---------- */

static_assert(sizeof(IsaacLogDtorIslandPlan) == 32,
              "IsaacLogDtorIslandPlan layout is pinned in the tests");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_INNER_CALL) <
                          static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_GATE) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_GATE) <
                      static_cast<uint32_t>(
                          ISAAC_LOG_VA_SINK_DTOR_DELETE_CALL) &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_DELETE_CALL) <
                      static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_SINK_DTOR_BODY_BYTES),
              "sink order: inner-first 0xa83fac < gate 0xa83fb1 < sized "
              "delete 0xa83fba < ret 0xa83fc6");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER_CALL) <
                          static_cast<uint32_t>(
                              ISAAC_LOG_VA_NEIGHBOR_DTOR_GATE) &&
                  static_cast<uint32_t>(
                      ISAAC_LOG_VA_NEIGHBOR_DTOR_GATE) <
                      static_cast<uint32_t>(
                          ISAAC_LOG_VA_NEIGHBOR_DTOR_DELETE_CALL) &&
                  static_cast<uint32_t>(
                      ISAAC_LOG_VA_NEIGHBOR_DTOR_DELETE_CALL) <
                      static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR) +
                          static_cast<uint32_t>(
                              ISAAC_LOG_NEIGHBOR_DTOR_BODY_BYTES),
              "neighbor order: inner-first 0xa84036 < gate 0xa8403b < sized "
              "delete 0xa84044 < ret 0xa84050");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_VTABLE_STORE) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_INNER_CALL),
              "the sink stores 0xba5184 in the wrapper BEFORE the inner call");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR_INNER_CALL) -
                          static_cast<uint32_t>(ISAAC_LOG_VA_SINK_DTOR) ==
                      12u &&
                  static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER_CALL) -
                          static_cast<uint32_t>(ISAAC_LOG_VA_NEIGHBOR_DTOR) ==
                      6u,
              "prologues: sink is push ebp/mov ebp,esp/push esi/mov "
              "esi,ecx + the 6-byte vtable store (12 bytes); neighbor is "
              "the 4-insn prologue only (6 bytes)");

/* ---------- toolchain defect guard ---------- */


/* The Wasm ABI does not narrow i32 arguments, and -O2 deletes in-body masks
   it can prove redundant for a uint8_t parameter. Every byte gate above
   takes uint32_t and narrows explicitly. This static check proves no export
   takes a uint8_t/uint16_t scalar parameter, so the guard cannot rot. */
template <typename... Ts>
struct has_narrow_scalar;
template <>
struct has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = has_narrow_scalar<Ps...>::value;
};

/* ---------- v25 pins (base-class tables 0xb83418 / 0xb833d8) ---------- */

static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN0) +
                      static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_END),
              "open0 body 0xa253e0..0xa25408 = 0x28 (first int3 after ret)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN1) +
                      static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_END),
              "open1 body 0xa25410..0xa2543a = 0x2a (first int3 after ret)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_SET1) +
                      static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_END),
              "flags-set1 body 0xa649b0..0xa649b7 = 7 bytes");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLUSH_CLEAR) +
                      static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_END),
              "flush-clear body 0xa24ea0..0xa24eb8 = 0x18 bytes");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_FLUSH_CALL_VA) <
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_CLEAR_VA),
              "the flush vcall (0xa24eaf) PRECEDES the bit-0 clear (0xa24eb2)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_STORE_VA) <
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_COMBINE_CALL_VA) &&
              static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_COMBINE_CALL_VA) <
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_CLEANUP_VA),
              "open0 order: state store, combine call, add esp 8 (PE order)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_STATE_STORE_VA) <
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_COMBINE_CALL_VA) &&
              static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_COMBINE_CALL_VA) <
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_CLEANUP_VA),
              "open1 order: state store, combine call, add esp 8 (PE order)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_VALUE) ==
                      static_cast<uint32_t>(ISAAC_LOG_SINK_STATE_OPEN_READ) &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_STATE_VALUE) ==
                      static_cast<uint32_t>(ISAAC_LOG_SINK_STATE_OPEN),
              "the base-class open twins mirror the sink state encodings");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN_COMBINE_BASE_NULL) == 1 &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN_COMBINE_FLAGS_ZERO) == 1 &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN_COMBINE_MODE) ==
                      static_cast<uint32_t>(ISAAC_LOG_OPEN_COMBINE_MODE_COPY_PATH),
              "base-open marshalling: base NULL + flags 0 = the COPY_PATH arm");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_RET_ARGS) == 8 &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_ARG2_DEAD) == 1 &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_RET_ARGS) == 4,
              "twin delta: open1 takes two stack dwords but reads only [ebp+8]");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_READ_WIDTH) == 4 &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_READ_WIDTH) == 4,
              "the or/and opcodes are FULL-dword (ENCODING laws: 83 49 04 01, "
              "83 66 04 fe)");
static_assert(ISAAC_LOG_BASE_FLAGS_SET1_VTABLE_SLOTS == 5 &&
                  ISAAC_LOG_BASE_FLAGS_SET1_RAW_OCCURRENCES == 5 &&
                  ISAAC_LOG_BASE_FLAGS_SET1_DIRECT_CALLSITES == 0,
              "flags-set1 reaches 5 vtable slots; zero direct refs");
static_assert(ISAAC_LOG_BASE_FLUSH_CLEAR_RAW_OCCURRENCES == 1 &&
                  ISAAC_LOG_BASE_FLUSH_CLEAR_DIRECT_CALLSITES == 0,
              "flush-clear reaches only the 0xb83418 +0x08 slot");
static_assert(ISAAC_LOG_BASE_OPEN0_RAW_OCCURRENCES == 1 &&
                  ISAAC_LOG_BASE_OPEN0_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_BASE_OPEN1_RAW_OCCURRENCES == 2 &&
                  ISAAC_LOG_BASE_OPEN1_DIRECT_CALLSITES == 0,
              "open twins reach only their slots (0xb833fc / 0xb6574c + "
              "0xb83400)");
static_assert(ISAAC_LOG_BASE_OPEN1_RAW_OCCURRENCES ==
                  ISAAC_LOG_BASE_OPEN0_RAW_OCCURRENCES + 1,
              "the extra carrier is the steamworks table's +0x28 (0xb6574c)");
static_assert(ISAAC_LOG_BASE_ACCESS_LEAF_DIRECT_CALLSITES == 1 &&
                  ISAAC_LOG_BASE_ACCESS_LEAF_CALLSITE_VA == 0x0091a3d0u,
              "v25 CORRECTS v21: the _access leaf has ONE direct caller");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_DTOR_WRAPPER) +
                      static_cast<uint32_t>(ISAAC_LOG_BASE_DTOR_WRAPPER_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_BASE_DTOR_WRAPPER_END),
              "dtor wrapper 0xa25350..0xa253d0 = 0x80 bytes");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLUSH_CLEAR) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN0) &&
              static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN0) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN1) &&
              static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN1) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_ACCESS_LEAF) &&
              static_cast<uint32_t>(ISAAC_LOG_VA_BASE_ACCESS_LEAF) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_GFA_LEAF) &&
              static_cast<uint32_t>(ISAAC_LOG_VA_BASE_GFA_LEAF) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_STATS_WRITER) &&
              static_cast<uint32_t>(ISAAC_LOG_VA_BASE_STATS_WRITER) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_SET1),
              "the base-table bodies are laid out in .text ascending order");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_2_VA) ==
                      static_cast<uint32_t>(ISAAC_LOG_BASE_TABLE_VA) + 0x04u &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_STORE_VA) >
                      static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN0) &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_STORE_VA) <
                      static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_COMBINE_CALL_VA),
              "slot identity: 0xb83418 +0x04 holds flags-set1; open0's state "
              "store sits inside the open0 body, before the combine call");

/* ---------- v27 pins (base-class flags-clear twin 0xa649c0) ---------- */

static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_CLEAR1) +
                      static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_BODY_BYTES) ==
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_END),
              "flags-clear1 body 0xa649c0..0xa649c5 = 5 bytes (first int3 "
              "after ret)");
static_assert(static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_SET1) <
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_CLEAR1),
          "the clear twin sits AFTER its set sibling in .text");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SIBLING_CLEAR_VA) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_CLEAR1),
          "the v25 recorded row and the landed body are the SAME VA");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SIBLING_SET_VA) ==
                  static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_SET1),
          "the clear twin's recorded set sibling is the landed set1");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_READ_WIDTH) == 4 &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_CLEAR_MASK) ==
                      0xfffffffeu &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_BYTE_MASK) ==
                      0xfeu,
              "the and is FULL-dword 0xfffffffe (ENCODING law: 83 61 04 fe; "
              "byte mask 0xfe is the low-byte view)");
static_assert(ISAAC_LOG_BASE_FLAGS_CLEAR1_VTABLE_SLOTS == 6 &&
                  ISAAC_LOG_BASE_FLAGS_CLEAR1_RAW_OCCURRENCES == 6 &&
                  ISAAC_LOG_BASE_FLAGS_CLEAR1_DIRECT_CALLSITES == 0 &&
                  ISAAC_LOG_BASE_FLAGS_CLEAR1_E8_CALLS == 0 &&
                  ISAAC_LOG_BASE_FLAGS_CLEAR1_INDIRECT_CALLS == 0,
              "flags-clear1 reaches exactly 6 .rdata vtable slots; zero "
              "direct refs in all of .text");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_2_VA) ==
                      static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_3_VA) + 4u &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_4_VA) ==
                      static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_4_VA) + 4u &&
                  static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_6_VA) ==
                      static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_5_VA) + 4u,
              "three tables carry the set1/clear1 pair ADJACENTLY (+4); the "
              "other three slots (0xb9e924 / 0xb9fa8c / 0xba315c) carry "
              "clear1 alone");
static_assert(static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_TO_CLEAR1_PAD_BYTES) == 9u,
              "nine int3 bytes pad between set1 END (0xa649b7) and clear1 "
              "(0xa649c0)");

#define ISAAC_LOG_NO_NARROW_PARAMS(FN)                                        \
  static_assert(!has_narrow_scalar<decltype(FN)>::value,                      \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_guard_blocks);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_listener_hit_pre);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_level_low_byte);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_emit_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_message_dropped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_guard_after_init);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_guard_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_always_succeeds);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_prefix_case);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_prefix_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_prefix_len);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_prefix_written);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_append_dest_off);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_append_capacity);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_console_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_listener_gate_post);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_next_at_line_start);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_empty_append_clears_line_start);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_buffer_reset_byte);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_initial_at_line_start);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dispatch_nmemb_len);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_tail_len_after_dispatch);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dispatch_return_dropped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dispatch_strlen_pass_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dispatch_nmemb_push_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_tail_strlen_pass_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_tail_newline_cmp_va);
/* v18 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_byte_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_large);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_header_sane);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_free_plan);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_free_ptr);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_free_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_invalid_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sub_dtor_null_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_vararg_dword_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_va_start_stack_disp);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_emit_plan);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_pure_helpers_abi_version);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_flush_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_destroy_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_listener_ptr_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_listener_mask_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_mask_clear_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_second_flush_reached);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_engaged);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_critsec_delete_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_critsec_ptr_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_holder_flags_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_guard_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_byte_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_post_teardown_blocks_all);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_leaves_logger_live);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_critsec_free_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_installer_prev_destroy_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_installer_listener_ptr_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_installer_listener_mask_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_installer_mask_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_installer_mask_set_without_sink);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_installer_sink_state);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_listener_hit_after_install);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_teardown_plan);
/* v3 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_already_initialized);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_warn_level);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_warn_vararg_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_args_published);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_object_allocated);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_object_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_critsec_init_runs);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_critsec_flags_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_critsec_ptr_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_critsec_marked_without_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_cmd_thread_warns);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_cmd_thread_creates);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_cmd_thread_flags_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_lifecycle_byte_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_devirtualizes_to_mutex_init);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_guard_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_boot_log_level);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_boot_site_dominates_teardown);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_guard_after_boot_site);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_shipped_guard_at_teardown);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_guard_zero_at_teardown_reachable);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_shipped_teardown_leaves_logger_live);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_shipped_post_teardown_blocks_all);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_guard_value_reachable);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lifecycle_byte_after_init_then_teardown);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_init_plan);
/* v4 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_assert_fires);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unlock_assert_fires);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_assert_string_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_assert_vararg_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_assert_sets_ready_bit);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_assert_is_lazy_init_template);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_holder_flags_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_assert_reachable_from_logger);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_timeout_infinite);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_timeout_arm);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_zero_timeout_tries);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_entered);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_continues);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_sleep_ms);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_reloads_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_timed_reloads_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_bounded);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_rereads_sleep_pointer);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_holds_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unlock_enters_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_self_reentrant_spins_forever);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_spin_iterations);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_try_entered);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_try_arm);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_try_leaves);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_retry_sleep_ms);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_ticks_to_ms_lo);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_ticks_to_ms_hi);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_elapsed_expired);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_underflow_branch_dead);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_start_refetched);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_now_refetched);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_marks_owned);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_owned_byte_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_timed_success_skips_owned_store);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_acquired);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unlock_owned_byte_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unlock_clears_before_leave);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unlock_takes_timeout);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_null_critsec_reached);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_asserts_on_failed_init);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_first_null_access_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_plan);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unlock_plan);
/* v5 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_frees_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_stores_null_critsec);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_critsec_ptr_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_critsec_free_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_sized_delete_ignores_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_flags_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_clears_ready_bit);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_clear_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_is_idempotent);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_variants);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_entry_vtable_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_exit_vtable_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_clear_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_stack_bytes_popped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_returns_this);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_has_delete_flag_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_operates_on_logger_holder);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_shared_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_is_one_template);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_frees_object);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_object_free_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_restores_base_vtable_unconditionally);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_vtable_store_preserves_flags);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_ready_state);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_ready_state_reachable);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_ready_state_after_init);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_ready_state_after_destroy);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_holder_ready_bit_setters);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_holder_ready_bit_clearers);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_holder_ready_bit_clear_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_holder_ready_bit_set_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_lock_null_deref_reached);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_then_lock_asserts);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_then_lock_faults);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_then_lock_fault_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_post_destroy_lock_dispatch_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_holds_lock);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_clears_before_free);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_dangling_window_start_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_dangling_window_end_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_dangling_window_insns);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_reach_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_total_reach);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unwind_destroy_reach_measured);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unwind_destroy_reach_v4_reported);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_unwind_destroy_is_dead_code);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_plan);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_destroy_action_is_platform);
/* v6 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_state_is_open);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_fwrite_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_fflush_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_tests_file_null);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_fopen_fail_publishes_sink);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_flush_vcall_is_nop);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_byte_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_bytes_returned);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_stack_bytes_popped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_vtbl_slot);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_logger_size_imm);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_logger_dispatch_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_action_is_platform);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_write_plan);
/* v7 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_state_is_open);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_fwrite_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_fflush_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_tests_file_null);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_flush_tests_file_null);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_flush_vcall_is_nop);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_byte_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_bytes_returned);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_stack_bytes_popped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_vtbl_slot);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_flush_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_flush_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_is_one_template_with_v6);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_shared_prefix_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_is_one_template);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_shared_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_action_is_platform);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_write_plan);

/* v8 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_state_is_readable);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_fflush_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_tests_file_null);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_byte_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_bytes_returned);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_stack_bytes_popped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_vtbl_slot);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_write_sibling_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_is_folded_into_v7);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_action_is_platform);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sibling_fread_plan);

/* v9 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_variants);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_inner_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_free_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_vtable_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_wrapper_stores_vtable);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_returns_this);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_delete_needed);

/* v10 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_path_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_mode_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_mode_len);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_file_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_state_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_path_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_returns);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_accounting_reached);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_accounting_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_mode_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_mode_len);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_fopen_gated);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_file_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_state_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_path_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_returns);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_accounting_reached);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_accounting_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_insn_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_vtbl_slot);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_insn_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_vtbl_slot);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_devirt_call_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_devirt_call_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_action_is_platform);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_read_plan);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_action_is_platform);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_open_write_plan);

/* v11 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_fclose_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_fclose_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_file_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_free_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_free_helper_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_path_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_state_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_state_value);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_state_store_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_vtable_base);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_vtable_mid);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_vtable_final);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_vtable_mid_stored);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_vtable_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_insn_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_seh_handler);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_inbound_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_fclose_iat_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_inner_action_is_platform);

/* v12 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_free_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_free_helper_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_path_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_vtable_base);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_vtable_final);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_vtable_base_stored);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_vtable_final_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_release_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_release_arg);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_lobby_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_release_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_sub_dtor_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_sub_dtor_offset);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_insn_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_seh_handler);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_inbound_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_release_iat_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_action_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_action_at);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_neighbor_dtor_inner_action_is_platform);

/* v13 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_file_offset);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_call_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_stack_bytes_popped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_ret_is_fflush);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_insn_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_first_ret_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_vtbl_slot);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_vtbl_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_vtbl_entry_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_push_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_call_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_pop_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_ret_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_indirect_calls);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_inbound);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_raw_occurrences);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_fflush_iat_sites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_flush_slot_vtbl_is_nop);
/* v14: the fd lock/unlock helper 0x00a52890 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_body_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_body_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_insn_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_first_ret_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_ret_args);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_direct_callsites);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_indirect_calls);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_overlapped_zero_dwords);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_overlapped_bytes);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_osfhandle_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_lock_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_errno_iat_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_osfhandle_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_unconditional);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_result_ignored);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_reserved);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_length_low);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_length_high);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_unlock_uses_overlapped);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_dispatch);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_lock_fires);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_lock_flags);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_lock_length_low);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_lock_length_high);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_lock_overlapped_null);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_errno_value);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_fail_return);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_errno_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_fdlock_returns);
/* v15: the deleting-dtor wrapper bodies */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_inner_fires);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_sized_delete_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_wrapper_plan);
/* v16: the sibling deleting-dtor wrapper 0x00a523e0 (variant 2) */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_inner_call_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_gate_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_delete_call_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_ret_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_dtor_island_vtable_entry_va);
/* v19: the open-helper path-combine laws (byte-gate params stay WIDE) */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_has_trailing_sep);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_both_empty);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_counter_va);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_alloc_size);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_copy_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_mode);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_join_uses_sep);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_normalize_char);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_combine_trailing_needed);
/* v20: the fail-broadcast walk laws (byte-gate params stay WIDE) */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_walk_empty);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_walk_continues);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_walk_terminates);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_visited_count);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_code_passthrough);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_dynamic_site_fires);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_broadcast_sentinel_tag_low_byte);
/* v21 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sink_close_file_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sink_close_file_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sink_close_state_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sink_close_free_gate);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_sink_close_path_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_state_getter_neq);
/* v25 */
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_base_flags_after_set1);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_base_flush_needed);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_base_flush_clears_bit0);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_base_open0_state_after);
ISAAC_LOG_NO_NARROW_PARAMS(isaac_log_base_open1_state_after);

#undef ISAAC_LOG_NO_NARROW_PARAMS

/* ================= v20: the fail-broadcast list walk 0x00a23200 ======== */

/* The shared fail-broadcast. Body 0xa23200..0xa2322e (0x2f bytes, 21
   insns, 1 indirect call, 0 E8, 0 stores). Walk:

     0xa23203  eax = [0xc37974]        head SNAPSHOT (read once)
     0xa23209  esi = [eax]             first node = head->next
     0xa2320b  cmp esi, eax ; je ret   ENTRY GATE vs SNAPSHOT
     0xa23210  edi = [ebp+8]           the fail code (1 stack arg)
     0xa23213  push [esi+0xc]          ctx (arg2, pushed first)
     0xa23216  eax = [esi+8]           fn
     0xa23219  push edi                code (arg1)
     0xa2321a  call eax                fn(code, ctx) — TYPED-HOST
     0xa2321c  esi = [esi]             node = node->next
     0xa2321e  add esp, 8              cdecl cleanup
     0xa23221  cmp esi, [0xc37974]     LOOP GATE vs LIVE head (re-read)
     0xa23227  jne 0xa23213
     0xa2322c  ret 4                   callee pops the code

   The callback dispatch (call eax) is typed-host per the standing
   decision — never modelled; the walk's own decisions below are pure. */

inline int32_t broadcast_walk_empty_impl(uint32_t head_snapshot,
                                         uint32_t first_next) {
  /* cmp esi,eax ; je 0xa2322a — FULL dword equality against the
     SNAPSHOT head (0xa23203 reads [0xc37974] ONCE). Empty -> 1: zero
     callbacks, the self-linked sentinel never fires. */
  return first_next == head_snapshot ? 1 : 0;
}

inline int32_t broadcast_walk_continues_impl(uint32_t node_next,
                                             uint32_t head_live) {
  /* cmp esi,[0xc37974] ; jne 0xa23213 — FULL dword inequality against
     the LIVE head, RE-READ from memory every iteration; the machine
     NEVER reuses the snapshot here. */
  return node_next != head_live ? 1 : 0;
}

inline int32_t broadcast_walk_terminates_impl(uint32_t head_snapshot,
                                              uint32_t head_live,
                                              uint32_t first_next,
                                              const uint32_t* nexts,
                                              uint32_t next_count) {
  /* The ONLY termination: the empty gate, or a visited node whose next
     returns to the LIVE head. No node cap, no NULL check, no callback
     result consulted. */
  if (broadcast_walk_empty_impl(head_snapshot, first_next) != 0) {
    return 1;
  }
  for (uint32_t i = 0; i < next_count; ++i) {
    if (nexts[i] == head_live) {
      return 1;
    }
  }
  return 0;
}

inline uint32_t broadcast_visited_count_impl(uint32_t head_snapshot,
                                             uint32_t head_live,
                                             uint32_t first_next,
                                             const uint32_t* nexts,
                                             uint32_t next_count) {
  /* Fired callbacks = (index of the FIRST nexts entry == head_live) + 1;
     0 for the empty gate; 0 when non-terminating. The fired node's
     [node+8]/[node+0xc] feed the typed-host dispatch — only the COUNT
     is the walk's own decision. */
  if (broadcast_walk_empty_impl(head_snapshot, first_next) != 0) {
    return 0u;
  }
  for (uint32_t i = 0; i < next_count; ++i) {
    if (nexts[i] == head_live) {
      return i + 1u;
    }
  }
  return 0u;
}

inline uint32_t broadcast_code_passthrough_impl(uint32_t code) {
  /* mov edi,[ebp+8]; push edi — the code reaches every callback as
     arg1 UNMODIFIED: no mask, no byte narrowing, full 32-bit. */
  return code;
}

inline int32_t broadcast_dynamic_site_fires_impl(uint32_t flag_byte,
                                                 uint32_t rank,
                                                 uint32_t node_rank,
                                                 uint32_t node_is_sentinel,
                                                 uint32_t payload_result) {
  /* The 0xa23129 site's gate chain (function 0xa230b0):
       0xa23101 cmp byte [ecx+0xd],0 ; jne 0xa23138   (BYTE flag)
       0xa23107 cmp esi,[ecx+0x10]   ; jb  0xa23138   (UNSIGNED rank)
       0xa2310c cmp ecx,[0xc3796c]   ; je  0xa23138   (sentinel gate)
       0xa23124 test edi,edi         ; jne 0xa2312e   (payload vtbl[4])
       0xa23128 push esi; call 0xa23200                (fires)
     The broadcast code at this site is the DYNAMIC rank (esi), not the
     constant. Byte-gate: flag_byte is narrowed with & 0xff. */
  if ((flag_byte & 0xffu) != 0u) {
    return 0;
  }
  if (rank < node_rank) { /* unsigned 32-bit compare */
    return 0;
  }
  if (node_is_sentinel != 0u) {
    return 0;
  }
  return payload_result == 0u ? 1 : 0;
}

extern "C" int32_t isaac_log_broadcast_walk_empty(uint32_t head_snapshot,
                                                  uint32_t first_next) {
  return broadcast_walk_empty_impl(head_snapshot, first_next);
}

extern "C" int32_t isaac_log_broadcast_walk_continues(uint32_t node_next,
                                                      uint32_t head_live) {
  return broadcast_walk_continues_impl(node_next, head_live);
}

extern "C" int32_t isaac_log_broadcast_walk_terminates(
    uint32_t head_snapshot, uint32_t head_live, uint32_t first_next,
    const uint32_t* nexts, uint32_t next_count) {
  return broadcast_walk_terminates_impl(head_snapshot, head_live,
                                        first_next, nexts, next_count);
}

extern "C" uint32_t isaac_log_broadcast_visited_count(
    uint32_t head_snapshot, uint32_t head_live, uint32_t first_next,
    const uint32_t* nexts, uint32_t next_count) {
  return broadcast_visited_count_impl(head_snapshot, head_live, first_next,
                                      nexts, next_count);
}

extern "C" uint32_t isaac_log_broadcast_code_passthrough(uint32_t code) {
  return broadcast_code_passthrough_impl(code);
}

extern "C" uint32_t isaac_log_broadcast_callback_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_CALLBACK_ARGS);
}

extern "C" uint32_t isaac_log_broadcast_callback_stack_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_CALLBACK_STACK_BYTES);
}

extern "C" int32_t isaac_log_broadcast_callback_dispatch_is_platform(void) {
  /* The MSVC node-list callback dispatch is a platform pattern (the
     alloc family's typed-host classification); 1 pins the audit edge. */
  return 1;
}

extern "C" uint32_t isaac_log_broadcast_fail_code(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_FAIL_CODE);
}

extern "C" int32_t isaac_log_broadcast_fail_code_matches_init_magic(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_FAIL_CODE) ==
                 static_cast<uint32_t>(ISAAC_LOG_INIT_OBJECT_MAGIC)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_log_broadcast_constant_code_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_CONSTANT_CODE_SITES);
}

extern "C" uint32_t isaac_log_broadcast_dynamic_code_site_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DYNAMIC_CODE_SITE_VA);
}

extern "C" uint32_t isaac_log_broadcast_dynamic_code_source_va(void) {
  return static_cast<uint32_t>(
      ISAAC_LOG_FAIL_BROADCAST_DYNAMIC_CODE_SOURCE_VA);
}

extern "C" int32_t isaac_log_broadcast_dynamic_site_fires(
    uint32_t flag_byte, uint32_t rank, uint32_t node_rank,
    uint32_t node_is_sentinel, uint32_t payload_result) {
  return broadcast_dynamic_site_fires_impl(flag_byte, rank, node_rank,
                                           node_is_sentinel, payload_result);
}

extern "C" uint32_t isaac_log_broadcast_sentinel_tag(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_SENTINEL_TAG);
}

extern "C" uint32_t isaac_log_broadcast_sentinel_tag_low_byte(void) {
  /* word [A+0xc] = 0x101; the byte-gate law narrows with & 0xff. */
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_SENTINEL_TAG) &
         0xffu;
}

extern "C" uint32_t isaac_log_broadcast_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_FAIL_BROADCAST);
}
extern "C" uint32_t isaac_log_broadcast_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_END);
}
extern "C" uint32_t isaac_log_broadcast_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_BODY_BYTES);
}
extern "C" uint32_t isaac_log_broadcast_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_INSN_COUNT);
}
extern "C" uint32_t isaac_log_broadcast_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_FIRST_RET_VA);
}
extern "C" uint32_t isaac_log_broadcast_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_RET_ARGS);
}
extern "C" uint32_t isaac_log_broadcast_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_RETS);
}
extern "C" uint32_t isaac_log_broadcast_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_INDIRECT_CALLS);
}
extern "C" uint32_t isaac_log_broadcast_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_E8_CALLS);
}
extern "C" uint32_t isaac_log_broadcast_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DIRECT_CALLSITES);
}
extern "C" uint32_t isaac_log_broadcast_inlined_copies(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_INLINED_COPIES);
}
extern "C" uint32_t isaac_log_broadcast_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_RAW_OCCURRENCES);
}
extern "C" uint32_t isaac_log_broadcast_list_head_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_LIST_HEAD_VA);
}
extern "C" uint32_t isaac_log_broadcast_node_next_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_NODE_NEXT_OFFSET);
}
extern "C" uint32_t isaac_log_broadcast_node_prev_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_NODE_PREV_OFFSET);
}
extern "C" uint32_t isaac_log_broadcast_node_fn_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_NODE_FN_OFFSET);
}
extern "C" uint32_t isaac_log_broadcast_node_ctx_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_NODE_CTX_OFFSET);
}
extern "C" uint32_t isaac_log_broadcast_head_writers(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_HEAD_WRITERS);
}
extern "C" uint32_t isaac_log_broadcast_head_zero_write_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_HEAD_ZERO_WRITE_VA);
}
extern "C" uint32_t isaac_log_broadcast_head_sentinel_write_va(void) {
  return static_cast<uint32_t>(
      ISAAC_LOG_FAIL_BROADCAST_HEAD_SENTINEL_WRITE_VA);
}
extern "C" uint32_t isaac_log_broadcast_head_reader_sites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_HEAD_READER_SITES);
}
extern "C" uint32_t isaac_log_broadcast_head_load_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_HEAD_LOAD_VALUE);
}
extern "C" uint32_t isaac_log_broadcast_head_writes_after_init(void) {
  return static_cast<uint32_t>(
      ISAAC_LOG_FAIL_BROADCAST_HEAD_WRITES_AFTER_INIT);
}
extern "C" uint32_t isaac_log_broadcast_sentinel_self_links(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_SENTINEL_SELF_LINKS);
}
extern "C" uint32_t isaac_log_broadcast_init_thunk_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_INIT_THUNK_VA);
}
extern "C" uint32_t isaac_log_broadcast_init_table_slot_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_INIT_TABLE_SLOT_VA);
}
extern "C" uint32_t isaac_log_broadcast_init_seh_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_INIT_SEH_VA);
}
extern "C" uint32_t isaac_log_broadcast_object_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_OBJECT_VA);
}
extern "C" uint32_t isaac_log_broadcast_object_vtable_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_OBJECT_VTABLE_VA);
}
extern "C" uint32_t isaac_log_broadcast_active_list_head_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_ACTIVE_LIST_HEAD_VA);
}
extern "C" uint32_t isaac_log_broadcast_sentinel_a_size(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_SENTINEL_A_SIZE);
}
extern "C" uint32_t isaac_log_broadcast_sentinel_b_size(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_SENTINEL_B_SIZE);
}
extern "C" uint32_t isaac_log_broadcast_dtor_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_VA);
}
extern "C" uint32_t isaac_log_broadcast_dtor_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_BODY_BYTES);
}
extern "C" uint32_t isaac_log_broadcast_dtor_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_FIRST_RET_VA);
}
extern "C" uint32_t isaac_log_broadcast_dtor_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_RET_ARGS);
}
extern "C" uint32_t isaac_log_broadcast_dtor_head_delete_size(void) {
  return static_cast<uint32_t>(
      ISAAC_LOG_FAIL_BROADCAST_DTOR_HEAD_DELETE_SIZE);
}
extern "C" uint32_t isaac_log_broadcast_dtor_clears_head(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_CLEARS_HEAD);
}
extern "C" uint32_t isaac_log_broadcast_dtor_vtable_swap_1(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_1);
}
extern "C" uint32_t isaac_log_broadcast_dtor_vtable_swap_2(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_2);
}
extern "C" uint32_t isaac_log_broadcast_atexit_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_FAIL_BROADCAST_ATEXIT_VA);
}


/* ================= v21: the sink Close member 0x00a526f0 (vtbl+0x34, SEH 0xaf0a10) =========== */

namespace {

/* call [eax+0x2c] at 0xa52717 — the dispatch is UNCONDITIONAL: it is
   the FIRST action, no file/path/state read gates it. The FILE* presence
   gate lives inside the typed-host leaf 0xa526d0 (never here). */
inline int32_t sink_close_dispatch_fires_impl() {
  return 1;
}

/* Leaf gate on the FULL 32-bit FILE* cell at [this+0xc]: 0x100 / 0x1ff /
   0xffffffff close via fclose; 0 skips. A low-byte reading misfires on
   0x100 (same width semantics as the v11 dtor's inlined fclose gate). */
inline int32_t sink_close_file_gate_impl(uint32_t file_ptr) {
  return file_ptr != 0u ? 1 : 0;
}

/* mov [esi+0xc],0 at 0xa526e4 — the leaf NULLs the FILE* cell ONLY on
   the fclose arm; the skip arm leaves the cell untouched. */
inline uint32_t sink_close_file_after_impl(uint32_t file_before,
                                           uint32_t fclose_fired) {
  return fclose_fired != 0u ? 0u : file_before;
}

/* mov [esi+4],2 at 0xa5271d — state := 2 on ONE UNCONDITIONAL full-dword
   store, positioned AFTER the dispatch and BEFORE the free gate: BOTH
   arms end with state 2. state_before is a parameter so a mutant that
   keeps it on the skip arm is visible. (The v11 dtor re-stores 2 on the
   free arm; the Close member stores exactly once — STATE_STORES=1.) */
inline uint32_t sink_close_state_after_impl(uint32_t state_before) {
  (void)state_before;
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_STATE_VALUE);
}

/* test edx,edx ; je 0xa52744 — the FREE-PATH GATE on the FULL 32-bit
   path cell at [this+8]: 0x100 / 0x1ff / 0xffffffff fire, 0 skips. */
inline int32_t sink_close_free_gate_impl(uint32_t path_ptr) {
  return path_ptr != 0u ? 1 : 0;
}

/* mov [esi+8],0 at 0xa5273d — path cell NULLed ONLY on the free arm,
   AFTER the 0xa648b0 call; the skip arm leaves the cell untouched. */
inline uint32_t sink_close_path_after_impl(uint32_t path_before,
                                           uint32_t free_fired) {
  return free_fired != 0u ? 0u : path_before;
}

}  // namespace

extern "C" int32_t isaac_log_sink_close_dispatch_fires(void) {
  return sink_close_dispatch_fires_impl();
}

extern "C" uint32_t isaac_log_sink_close_dispatch_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_DISPATCH_VA);
}

extern "C" uint32_t isaac_log_sink_close_dispatch_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_DISPATCH_SLOT);
}

extern "C" uint32_t isaac_log_sink_close_fclose_leaf_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FCLOSE_LEAF_VA);
}

extern "C" int32_t isaac_log_sink_close_file_gate(uint32_t file_ptr) {
  return sink_close_file_gate_impl(file_ptr);
}

extern "C" uint32_t isaac_log_sink_close_file_after(uint32_t file_before,
                                                    uint32_t fclose_fired) {
  return sink_close_file_after_impl(file_before, fclose_fired);
}

extern "C" uint32_t isaac_log_sink_close_state_after(uint32_t state_before) {
  return sink_close_state_after_impl(state_before);
}

extern "C" uint32_t isaac_log_sink_close_state_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_STATE_VALUE);
}

extern "C" uint32_t isaac_log_sink_close_state_store_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_STATE_STORES);
}

extern "C" uint32_t isaac_log_sink_close_state_store_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_STATE_STORE_VA);
}

extern "C" uint32_t isaac_log_sink_close_state_getter_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_STATE_GETTER_VA);
}

extern "C" int32_t isaac_log_sink_close_free_gate(uint32_t path_ptr) {
  return sink_close_free_gate_impl(path_ptr);
}

extern "C" uint32_t isaac_log_sink_close_free_branch_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FREE_BRANCH_VA);
}

extern "C" uint32_t isaac_log_sink_close_free_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FREE_CALL_VA);
}

extern "C" uint32_t isaac_log_sink_close_free_mode(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FREE_MODE);
}

extern "C" uint32_t isaac_log_sink_close_free_helper_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FREE_HELPER_VA);
}

extern "C" uint32_t isaac_log_sink_close_path_null_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_PATH_NULL_VA);
}

extern "C" uint32_t isaac_log_sink_close_path_after(uint32_t path_before,
                                                    uint32_t free_fired) {
  return sink_close_path_after_impl(path_before, free_fired);
}

extern "C" uint32_t isaac_log_sink_close_file_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FILE_OFFSET);
}

extern "C" uint32_t isaac_log_sink_close_path_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_PATH_OFFSET);
}

extern "C" uint32_t isaac_log_sink_close_state_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_STATE_OFFSET);
}

extern "C" uint32_t isaac_log_sink_close_vtable_store_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_VTABLE_STORES);
}

extern "C" uint32_t isaac_log_sink_close_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_SINK_CLOSE);
}

extern "C" uint32_t isaac_log_sink_close_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_END);
}

extern "C" uint32_t isaac_log_sink_close_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_BODY_BYTES);
}

extern "C" uint32_t isaac_log_sink_close_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_INSN_COUNT);
}

extern "C" uint32_t isaac_log_sink_close_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_sink_close_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_RET_ARGS);
}

extern "C" uint32_t isaac_log_sink_close_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_RETS);
}

extern "C" uint32_t isaac_log_sink_close_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_E8_CALLS);
}

extern "C" uint32_t isaac_log_sink_close_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_sink_close_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_MEM_STORES);
}

extern "C" uint32_t isaac_log_sink_close_seh_handler(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_SEH_HANDLER);
}

extern "C" uint32_t isaac_log_sink_close_sink_slot_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_SINK_SLOT_VA);
}

extern "C" uint32_t isaac_log_sink_close_sibling_slot_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_SIBLING_SLOT_VA);
}

extern "C" uint32_t isaac_log_sink_close_vtable_slots(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_VTABLE_SLOTS);
}

extern "C" uint32_t isaac_log_sink_close_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_sink_close_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_DIRECT_CALLSITES);
}

extern "C" int32_t isaac_log_sink_close_dispatch_unconditional(void) {
  return static_cast<int32_t>(ISAAC_LOG_SINK_CLOSE_DISPATCH_UNCONDITIONAL);
}

extern "C" uint32_t isaac_log_sink_close_fclose_gate_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FCLOSE_GATE_VA);
}

extern "C" uint32_t isaac_log_sink_close_fclose_test_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FCLOSE_TEST_VA);
}

extern "C" uint32_t isaac_log_sink_close_fclose_branch_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FCLOSE_BRANCH_VA);
}

extern "C" uint32_t isaac_log_sink_close_fclose_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FCLOSE_CALL_VA);
}

extern "C" uint32_t isaac_log_sink_close_fclose_null_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_SINK_CLOSE_FCLOSE_NULL_VA);
}

/* ================= v22: the state!=2 getter 0x00a25440 (vtbl+0x30) =========== */

namespace {

/* cmp dword ptr [ecx+4], 2 ; setne al ; ret — the FULL-dword read of the
   state cell at +4 is the byte-gate law: state values 0x102 / 0x302 /
   0xff02 compare as full dwords (a low-byte read would misfire). The
   observable is the 0/1 boolean (state != 2), 2 == the Close law's
   SINK_STATE_NO_FILE. */
inline int32_t state_getter_neq_impl(uint32_t state) {
  return state != static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_COMPARE_VALUE)
             ? 1
             : 0;
}

}  // namespace

extern "C" int32_t isaac_log_state_getter_neq(uint32_t state) {
  return state_getter_neq_impl(state);
}

extern "C" uint32_t isaac_log_state_getter_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_STATE_GETTER);
}

extern "C" uint32_t isaac_log_state_getter_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_END);
}

extern "C" uint32_t isaac_log_state_getter_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_BODY_BYTES);
}

extern "C" uint32_t isaac_log_state_getter_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_INSN_COUNT);
}

extern "C" uint32_t isaac_log_state_getter_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_state_getter_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_RET_ARGS);
}

extern "C" uint32_t isaac_log_state_getter_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_RETS);
}

extern "C" uint32_t isaac_log_state_getter_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_E8_CALLS);
}

extern "C" uint32_t isaac_log_state_getter_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_state_getter_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_MEM_STORES);
}

extern "C" uint32_t isaac_log_state_getter_state_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_STATE_OFFSET);
}

extern "C" uint32_t isaac_log_state_getter_read_width(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_READ_WIDTH);
}

extern "C" uint32_t isaac_log_state_getter_compare_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_COMPARE_VALUE);
}

extern "C" uint32_t isaac_log_state_getter_vtable_slots(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_VTABLE_SLOTS);
}

extern "C" uint32_t isaac_log_state_getter_extra_slot_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_EXTRA_SLOT_VA);
}

extern "C" uint32_t isaac_log_state_getter_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_state_getter_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_state_getter_inlined_copies(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_INLINED_COPIES);
}

extern "C" uint32_t isaac_log_state_getter_devirt_cmp_1(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_DEVIRT_CMP_1);
}

extern "C" uint32_t isaac_log_state_getter_devirt_cmp_2(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_DEVIRT_CMP_2);
}

extern "C" uint32_t isaac_log_state_getter_devirt_cmp_3(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_DEVIRT_CMP_3);
}

extern "C" uint32_t isaac_log_state_getter_slot_dtor_base_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_SLOT_DTOR_BASE_VA);
}

extern "C" uint32_t isaac_log_state_getter_slot_sink_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_SLOT_SINK_VA);
}

extern "C" uint32_t isaac_log_state_getter_slot_sibling_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_STATE_GETTER_SLOT_SIBLING_VA);
}

/* ========== v25: base-class tables 0xb83418 / 0xb833d8 (ABI 22 -> 23) ========== */

namespace {

/* L1 — 0xa649b0: `or dword ptr [ecx+4],1 ; mov al,1 ; ret`. The stored
   cell is flags | 1. The read/write WIDTH is 4 (`83 49 04 01`) but the
   behavior is width-independent for bit 0 — so READ_WIDTH is an ENCODING
   law pinned in the header/PE-evidence block, and the behavioral law is
   the transform itself. */
inline uint32_t base_flags_after_set1_impl(uint32_t flags) {
  return flags | 1u;
}

/* L2 — 0xa24ea0: `mov ecx,[0xc79bd8] ; test ecx,ecx ; je` — the flush
   vcall fires iff the listener ptr is NONZERO (FULL 32-bit test: 0x100
   fires, 0 skips — same width semantics as the v2 teardown flush law). */
inline int32_t base_flush_needed_impl(uint32_t listener_ptr) {
  return listener_ptr != 0u ? 1 : 0;
}

/* The unconditional `and dword ptr [esi+4],0xfffffffe` — runs on BOTH
   arms (the null-skip and the flush arm), after the vcall. Full-dword
   mask (ENCODING `83 66 04 fe`; READ_WIDTH = 4). */
inline uint32_t base_flush_clears_bit0_impl(uint32_t flags) {
  return flags & 0xfffffffeu;
}

/* L3/L4 — the open twins: state := N (ONE full-dword store, BEFORE the
   combine call), then path := OPEN_COMBINE(path, NULL, 0, 0) — the v19
   body's COPY_PATH arm (edx=0 base, two pushed zeros) — then al := 1.
   The state store is unconditional: a skip-arm would leave state_before
   in the cell (the parameter makes that mutant visible). */
inline uint32_t base_open0_state_after_impl(uint32_t state_before) {
  (void)state_before;
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_VALUE);
}

inline uint32_t base_open1_state_after_impl(uint32_t state_before) {
  (void)state_before;
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_STATE_VALUE);
}

}  // namespace

extern "C" uint32_t isaac_log_base_flags_after_set1(uint32_t flags) {
  return base_flags_after_set1_impl(flags);
}

extern "C" int32_t isaac_log_base_flags_set1_returns_one(void) {
  /* mov al, 1 — unconditional, no predicate. */
  return 1;
}

extern "C" uint32_t isaac_log_base_flags_set1_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_SET1);
}

extern "C" uint32_t isaac_log_base_flags_set1_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_END);
}

extern "C" uint32_t isaac_log_base_flags_set1_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_BODY_BYTES);
}

extern "C" uint32_t isaac_log_base_flags_set1_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_INSN_COUNT);
}

extern "C" uint32_t isaac_log_base_flags_set1_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_RET_ARGS);
}

extern "C" uint32_t isaac_log_base_flags_set1_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_RETS);
}

extern "C" uint32_t isaac_log_base_flags_set1_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_E8_CALLS);
}

extern "C" uint32_t isaac_log_base_flags_set1_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_base_flags_set1_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_MEM_STORES);
}

extern "C" uint32_t isaac_log_base_flags_set1_state_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_STATE_OFFSET);
}

extern "C" uint32_t isaac_log_base_flags_set1_read_width(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_READ_WIDTH);
}

extern "C" uint32_t isaac_log_base_flags_set1_vtable_slots(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_VTABLE_SLOTS);
}

extern "C" uint32_t isaac_log_base_flags_set1_slot_1_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_1_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_slot_2_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_2_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_slot_3_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_3_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_slot_4_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_4_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_slot_5_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SLOT_5_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_base_flags_set1_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_base_flags_set1_sibling_clear_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_SIBLING_CLEAR_VA);
}

/* ---------------- v27: the base-class flags-CLEAR twin ---- */

extern "C" uint32_t isaac_log_base_flags_after_clear1(uint32_t flags) {
  /* PE 0xa649c0: `and dword ptr [ecx+4], 0xfffffffe ; ret` — bit 0
     cleared, ALL OTHER BITS PRESERVED (FULL-dword op — READ_WIDTH=4
     encoding law), no return value, no gate. */
  return flags & 0xfffffffeu; /* the 0xa649c0 clear mask */
}

extern "C" int32_t isaac_log_base_flags_clear1_unconditional(void) {
  return 1; /* the 0xa649c0 and has NO gate */
}

extern "C" uint32_t isaac_log_base_flags_clear1_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLAGS_CLEAR1);
}

extern "C" uint32_t isaac_log_base_flags_clear1_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_END);
}

extern "C" uint32_t isaac_log_base_flags_clear1_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_BODY_BYTES);
}

extern "C" uint32_t isaac_log_base_flags_clear1_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_INSN_COUNT);
}

extern "C" uint32_t isaac_log_base_flags_clear1_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_RET_ARGS);
}

extern "C" uint32_t isaac_log_base_flags_clear1_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_RETS);
}

extern "C" uint32_t isaac_log_base_flags_clear1_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_E8_CALLS);
}

extern "C" uint32_t isaac_log_base_flags_clear1_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_base_flags_clear1_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_MEM_STORES);
}

extern "C" uint32_t isaac_log_base_flags_clear1_state_offset(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_STATE_OFFSET);
}

extern "C" uint32_t isaac_log_base_flags_clear1_clear_mask(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_CLEAR_MASK);
}

extern "C" uint32_t isaac_log_base_flags_clear1_byte_mask(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_BYTE_MASK);
}

extern "C" uint32_t isaac_log_base_flags_clear1_read_width(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_READ_WIDTH);
}

extern "C" uint32_t isaac_log_base_flags_clear1_vtable_slots(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_VTABLE_SLOTS);
}

extern "C" uint32_t isaac_log_base_flags_clear1_slot_1_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_1_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_slot_2_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_2_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_slot_3_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_3_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_slot_4_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_4_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_slot_5_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_5_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_slot_6_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_6_VA);
}

extern "C" uint32_t isaac_log_base_flags_clear1_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_base_flags_clear1_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_base_flags_clear1_sibling_set_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_CLEAR1_SIBLING_SET_VA);
}

extern "C" uint32_t isaac_log_base_flags_set1_to_clear1_pad_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLAGS_SET1_TO_CLEAR1_PAD_BYTES);
}

extern "C" int32_t isaac_log_base_flush_needed(uint32_t listener_ptr) {
  return base_flush_needed_impl(listener_ptr);
}

extern "C" uint32_t isaac_log_base_flush_clears_bit0(uint32_t flags) {
  return base_flush_clears_bit0_impl(flags);
}

extern "C" int32_t isaac_log_base_flush_clear_unconditional(void) {
  /* the `and` at 0xa24eb2 sits BELOW the je 0xa24eb2 — the null-skip
     arm falls INTO the clear. */
  return 1;
}

extern "C" uint32_t isaac_log_base_flush_clear_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_BASE_FLUSH_CLEAR);
}

extern "C" uint32_t isaac_log_base_flush_clear_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_END);
}

extern "C" uint32_t isaac_log_base_flush_clear_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_BODY_BYTES);
}

extern "C" uint32_t isaac_log_base_flush_clear_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_INSN_COUNT);
}

extern "C" uint32_t isaac_log_base_flush_clear_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_base_flush_clear_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_RET_ARGS);
}

extern "C" uint32_t isaac_log_base_flush_clear_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_RETS);
}

extern "C" uint32_t isaac_log_base_flush_clear_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_E8_CALLS);
}

extern "C" uint32_t isaac_log_base_flush_clear_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_base_flush_clear_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_MEM_STORES);
}

extern "C" uint32_t isaac_log_base_flush_clear_listener_global_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_LISTENER_GLOBAL_VA);
}

extern "C" uint32_t isaac_log_base_flush_clear_flush_slot(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_FLUSH_SLOT);
}

extern "C" uint32_t isaac_log_base_flush_clear_clear_mask(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_CLEAR_MASK);
}

extern "C" uint32_t isaac_log_base_flush_clear_read_width(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_READ_WIDTH);
}

extern "C" uint32_t isaac_log_base_flush_clear_flush_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_FLUSH_CALL_VA);
}

extern "C" uint32_t isaac_log_base_flush_clear_clear_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_CLEAR_VA);
}

extern "C" uint32_t isaac_log_base_flush_clear_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_base_flush_clear_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_FLUSH_CLEAR_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_base_open0_state_after(uint32_t state_before) {
  return base_open0_state_after_impl(state_before);
}

extern "C" uint32_t isaac_log_base_open1_state_after(uint32_t state_before) {
  return base_open1_state_after_impl(state_before);
}

extern "C" int32_t isaac_log_base_open_combine_base_null(void) {
  /* xor edx, edx before the call — combine(base=NULL) -> COPY_PATH. */
  return 1;
}

extern "C" int32_t isaac_log_base_open_combine_flags_zero(void) {
  /* push 0 ; push 0 — lowercase=0 AND trailing=0 on both twins. */
  return 1;
}

extern "C" uint32_t isaac_log_base_open_combine_mode(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN_COMBINE_MODE);
}

extern "C" int32_t isaac_log_base_open_returns_one(void) {
  /* mov al, 1 — unconditional, no predicate, both twins. */
  return 1;
}

extern "C" uint32_t isaac_log_base_open0_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_RET_ARGS);
}

extern "C" uint32_t isaac_log_base_open1_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_RET_ARGS);
}

extern "C" int32_t isaac_log_base_open1_arg2_dead(void) {
  /* ret 8 cleans TWO stack dwords but only [ebp+8] is ever read —
     the second arg is dead by construction. */
  return 1;
}

extern "C" uint32_t isaac_log_base_open0_combine_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_COMBINE_CALL_VA);
}

extern "C" uint32_t isaac_log_base_open1_combine_call_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_COMBINE_CALL_VA);
}

extern "C" uint32_t isaac_log_base_open0_cleanup_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_CLEANUP_VA);
}

extern "C" uint32_t isaac_log_base_open1_cleanup_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_CLEANUP_VA);
}

extern "C" uint32_t isaac_log_base_open0_state_store_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_STORE_VA);
}

extern "C" uint32_t isaac_log_base_open1_state_store_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_STATE_STORE_VA);
}

extern "C" uint32_t isaac_log_base_open0_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN0);
}

extern "C" uint32_t isaac_log_base_open0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_END);
}

extern "C" uint32_t isaac_log_base_open0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_BODY_BYTES);
}

extern "C" uint32_t isaac_log_base_open0_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_INSN_COUNT);
}

extern "C" uint32_t isaac_log_base_open0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_base_open0_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_RETS);
}

extern "C" uint32_t isaac_log_base_open0_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_E8_CALLS);
}

extern "C" uint32_t isaac_log_base_open0_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_base_open0_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_MEM_STORES);
}

extern "C" uint32_t isaac_log_base_open0_state_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_STATE_VALUE);
}

extern "C" uint32_t isaac_log_base_open0_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_base_open0_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN0_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_base_open1_body_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_BASE_OPEN1);
}

extern "C" uint32_t isaac_log_base_open1_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_END);
}

extern "C" uint32_t isaac_log_base_open1_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_BODY_BYTES);
}

extern "C" uint32_t isaac_log_base_open1_insn_count(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_INSN_COUNT);
}

extern "C" uint32_t isaac_log_base_open1_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_FIRST_RET_VA);
}

extern "C" uint32_t isaac_log_base_open1_rets(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_RETS);
}

extern "C" uint32_t isaac_log_base_open1_e8_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_E8_CALLS);
}

extern "C" uint32_t isaac_log_base_open1_indirect_calls(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_INDIRECT_CALLS);
}

extern "C" uint32_t isaac_log_base_open1_mem_stores(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_MEM_STORES);
}

extern "C" uint32_t isaac_log_base_open1_state_value(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_STATE_VALUE);
}

extern "C" uint32_t isaac_log_base_open1_raw_occurrences(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_RAW_OCCURRENCES);
}

extern "C" uint32_t isaac_log_base_open1_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_OPEN1_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_base_dtor_wrapper_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_VA_BASE_DTOR_WRAPPER);
}

extern "C" uint32_t isaac_log_base_dtor_wrapper_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_DTOR_WRAPPER_END);
}

extern "C" uint32_t isaac_log_base_dtor_wrapper_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_DTOR_WRAPPER_BODY_BYTES);
}

extern "C" uint32_t isaac_log_base_dtor_wrapper_seh(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_DTOR_WRAPPER_SEH);
}

extern "C" uint32_t isaac_log_base_access_leaf_direct_callsites(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_ACCESS_LEAF_DIRECT_CALLSITES);
}

extern "C" uint32_t isaac_log_base_access_leaf_callsite_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_ACCESS_LEAF_CALLSITE_VA);
}

extern "C" uint32_t isaac_log_base_getter_18_end_va(void) {
  return static_cast<uint32_t>(ISAAC_LOG_BASE_GETTER_18_END);
}

extern "C" uint32_t isaac_log_text_insn_count_v25(void) {
  return static_cast<uint32_t>(ISAAC_LOG_TEXT_INSN_COUNT_V25);
}

extern "C" uint32_t isaac_log_text_undecodable_bytes_v25(void) {
  return static_cast<uint32_t>(ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V25);
}

/* ---------------- v26: the KAGE::MutexBase same-template trio ---- */

extern "C" uint32_t isaac_log_mutexbase_set1_after(uint32_t cell) {
  /* PE 0xa68470: movzx eax, byte [ecx+4] ; bts eax,0 ;
     mov [ecx+4],al — the LOW byte |= 1; the upper 3 dword bytes
     are UNTOUCHED (BYTE store — READ_WIDTH=1 encoding law). */
  const uint32_t low = (cell & 0xffu) | 0x01u;
  return (cell & 0xffffff00u) | low;
}

extern "C" int32_t isaac_log_mutexbase_set1_returns_one(void) {
  return 1; /* mov al,1 ALWAYS */
}

extern "C" uint32_t isaac_log_mutexbase_clear1_after(uint32_t cell) {
  /* PE 0xa68480: and byte [ecx+4],0xfe — the LOW byte bit 0
     cleared; upper 3 dword bytes untouched. */
  const uint32_t low = (cell & 0xffu) & 0xfeu;
  return (cell & 0xffffff00u) | low;
}

extern "C" int32_t isaac_log_mutexbase_clear1_unconditional(void) {
  return 1; /* the and has NO gate */
}

/* v26 census pins. */

extern "C" uint32_t isaac_log_mutexbase_sdtor_va(void) {
  return ISAAC_LOG_MUTEXBASE_SDTOR_VA;
}

extern "C" uint32_t isaac_log_mutexbase_sdtor_free_size(void) {
  return ISAAC_LOG_MUTEXBASE_SDTOR_FREE_SIZE;
}

extern "C" uint32_t isaac_log_mutexbase_sdtor_vtable(void) {
  return ISAAC_LOG_MUTEXBASE_SDTOR_VTABLE;
}

extern "C" uint32_t isaac_log_mutexbase_object_size(void) {
  return ISAAC_LOG_MUTEXBASE_OBJECT_SIZE;
}

extern "C" uint32_t isaac_log_mutexbase_lock_clock_recheck(void) {
  return ISAAC_LOG_MUTEXBASE_LOCK_CLOCK_RECHECK;
}

extern "C" uint32_t isaac_log_mutexbase_set1_body_va(void) {
  return ISAAC_LOG_VA_MUTEXBASE_SET1;
}

extern "C" uint32_t isaac_log_mutexbase_set1_end_va(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_END;
}

extern "C" uint32_t isaac_log_mutexbase_set1_body_bytes(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_BODY_BYTES;
}

extern "C" uint32_t isaac_log_mutexbase_set1_insn_count(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_INSN_COUNT;
}

extern "C" uint32_t isaac_log_mutexbase_set1_first_ret_va(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_FIRST_RET_VA;
}

extern "C" uint32_t isaac_log_mutexbase_set1_rets(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_RETS;
}

extern "C" uint32_t isaac_log_mutexbase_set1_mem_stores(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_MEM_STORES;
}

extern "C" uint32_t isaac_log_mutexbase_set1_cell_offset(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_CELL_OFFSET;
}

extern "C" uint32_t isaac_log_mutexbase_set1_read_width(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_READ_WIDTH;
}

extern "C" uint32_t isaac_log_mutexbase_set1_bit(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_BIT;
}

extern "C" uint32_t isaac_log_mutexbase_set1_vtable_ref_rdata(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_VTABLE_REF_RDATA;
}

extern "C" uint32_t isaac_log_mutexbase_set1_direct_callsites(void) {
  return ISAAC_LOG_MUTEXBASE_SET1_DIRECT_CALLSITES;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_body_va(void) {
  return ISAAC_LOG_VA_MUTEXBASE_CLEAR1;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_end_va(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_END;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_body_bytes(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_BODY_BYTES;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_insn_count(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_INSN_COUNT;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_byte_mask(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_BYTE_MASK;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_read_width(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_READ_WIDTH;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_cell_offset(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_CELL_OFFSET;
}

extern "C" uint32_t isaac_log_mutexbase_clear1_vtable_ref_rdata(void) {
  return ISAAC_LOG_MUTEXBASE_CLEAR1_VTABLE_REF_RDATA;
}
