/* RESTORATION NOTE (2026-08-21): the v71-era lua_engine_pure_helpers.cpp
 * (14307 lines incl. the v72 twin-law block, sha256
 * f845fb6baf3ba395eaa86348e07cf3f59c0dbd2bf88f29f45bfbfbd2b2a7bf76) was
 * destroyed by a bad backup restore during the lua-v72-899770 unit. This
 * file was reconstructed in-place from the intact ABI-72 triad — header
 * declarations/constants, scripts/decomp/lua-engine-pure-model.mjs oracles,
 * tests/decomp-lua-engine-pure-helpers.test.js pins — and verified
 * bit-exact against the last good build
 * output/decomp/lua-engine-pure/lua-engine-pure-helpers.wasm (21,152+
 * randomized differential checks, zero mismatches) plus the full suite at
 * 224/224 with all mutant tripwires non-vacuous. The lost original is NOT
 * byte-identical to this reconstruction; its sha above documents what was
 * lost. See section-notes/lua-cpp-recovery-plan/NOTES.md. */
#include "lua_engine_pure_helpers.h"

/* LuaEngine freestanding pure helpers. Evidence:
   output/decomp/5129df723e64/next-update/decompiled/008607a0_FrameOpaque_8607a0.c
   output/decomp/5129df723e64/section-notes/lua-pin-2/NOTES.md
   output/decomp/5129df723e64/section-notes/lua-residual-inventory/NOTES.md
   PE Capstone of Init 0x008604c0 / RegisterClasses 0x00866960 /
     RunBundled 0x0086e5e0 / FUN_0086e6c0 0x0086e6c0 /
     destroy 0x0086e520 / materialize 0x00872980 /
     method helpers 0x008a06a0 family / stack-ref 0x0085dab0 /
     0x008a7e10 / 0x0085d910 / pop 0x0085cce0 / class create /
     Vector 0x008a7c00 / SetReference method (ABI v8) /
     method IAT-chain absindex/rotate/cleanup (ABI v9) /
     SetReference wrapper 0x008a80d0 pure indices/keys (ABI v10) /
     check/get helper 0x0085c590 pure args/gates (ABI v11) /
     check/get remaining pure CF after host IAT (ABI v12) /
     frame residual 0x008607a0 + materialize 0x00872980 pure imms (ABI v13) /
     materialize residual CF around first IAT rawgeti (ABI v14) /
     RegisterClasses 0x00866960 … 0x0086e4c9 exhaustive structural scan —
       install-record shape/stride, operand role split, push/rel32
       encoding rules, builder-chain span, EH state slot, scope dtor and
       class-create prologue census, Vector per-entry table (ABI v15) /
     property-builder family 0x00875230…0x00875ae0 whole-body byte census,
       import-directory IAT re-resolution, image-wide call-site census,
       folded-member byte-exact derivation, and the Color/Sprite span
       receiver walk under the return contract (ABI v19)
   third_party/REPENTOGON/libzhl/functions/LuaEngine.zhl (struct + inlines)

   Not integrated into Game::Update host events. When wiring later, emit
   opaqueCall008607a0 only when frame_unref_needs_host != 0, then recapture
   nothing from Game (function mutates Lua registry only).
*/

int32_t isaac_lua_engine_frame_unref_needs_host(uint32_t engine_flag_byte) {
  /* PE tests one bit of a loaded byte; the mask keeps the test inside the
     low byte for any wide argument (v19 byte-width sweep). */
  return ((engine_flag_byte & 0xffu) & 2u) != 0 ? 1 : 0;
}

uint32_t isaac_lua_engine_get_masked_pointer(uint32_t pointer,
                                             uint32_t pointer_mask) {
  return pointer ^ pointer_mask;
}

int32_t isaac_lua_engine_get_debug(uint32_t debug_field) {
  /* PE byte test; explicit low-byte narrow (v19 byte-width sweep). */
  return (debug_field & 0xffu) != 0 ? 1 : 0;
}

/* x86 `mul r/m32`: EDX:EAX = EAX * r/m32 (unsigned). */
static void mul32(uint32_t a, uint32_t b, uint32_t *lo_out, uint32_t *hi_out) {
  const uint64_t p = (uint64_t)a * (uint64_t)b;
  *lo_out = (uint32_t)p;
  *hi_out = (uint32_t)(p >> 32);
}

uint32_t isaac_lua_engine_init_pointer_mask(uint32_t seed_lo, uint32_t seed_hi) {
  uint32_t lo1, hi1, lo2, hi2, lo3, hi3, lo4, hi4;
  uint32_t ecx, edi, edx, eax;
  uint64_t t;
  uint32_t cf;

  mul32(seed_lo, (uint32_t)ISAAC_LUA_INIT_MASK_MUL_C1, &lo1, &hi1);
  (void)lo1; /* PE multiplies for EDX:EAX; only hi1 feeds the accumulate. */
  mul32(seed_lo, (uint32_t)ISAAC_LUA_INIT_MASK_MUL_C2, &lo2, &hi2);
  mul32(seed_hi, (uint32_t)ISAAC_LUA_INIT_MASK_MUL_C1, &lo3, &hi3);
  mul32(seed_hi, (uint32_t)ISAAC_LUA_INIT_MASK_MUL_C2, &lo4, &hi4);

  /* add ecx, edi  ; lo3 + hi1 */
  t = (uint64_t)lo3 + (uint64_t)hi1;
  ecx = (uint32_t)t;
  cf = (uint32_t)(t >> 32);
  /* adc edx, 0    ; hi3 + CF */
  t = (uint64_t)hi3 + (uint64_t)cf;
  edx = (uint32_t)t;
  /* add eax, ecx  ; lo2 + (lo3+hi1); CF only retained */
  t = (uint64_t)lo2 + (uint64_t)ecx;
  cf = (uint32_t)(t >> 32);
  /* adc ecx, 0    ; hi2 + CF */
  t = (uint64_t)hi2 + (uint64_t)cf;
  ecx = (uint32_t)t;
  /* xor eax, eax ; add edx, ecx ; adc eax, eax */
  t = (uint64_t)edx + (uint64_t)ecx;
  edx = (uint32_t)t;
  eax = (uint32_t)(t >> 32); /* 0 or 1 */
  /* add edi, edx  ; lo4 + mid */
  t = (uint64_t)lo4 + (uint64_t)edx;
  edi = (uint32_t)t;
  cf = (uint32_t)(t >> 32);
  /* adc ecx, eax  ; hi4 + eax + CF  (ecx was hi4) */
  t = (uint64_t)hi4 + (uint64_t)eax + (uint64_t)cf;
  ecx = (uint32_t)t;

  /* shrd edi, ecx, 0x12 */
  {
    const uint64_t wide = ((uint64_t)ecx << 32) | (uint64_t)edi;
    edi = (uint32_t)(wide >> (uint32_t)ISAAC_LUA_INIT_MASK_SHRD_BITS);
  }

  eax = edi >> (uint32_t)ISAAC_LUA_INIT_MASK_SHR_A;
  edi ^= eax;
  ecx = edi;
  edi <<= (uint32_t)ISAAC_LUA_INIT_MASK_SHL_B;
  ecx ^= (uint32_t)ISAAC_LUA_INIT_MASK_XOR_DEADBEEF;
  ecx += edi;
  eax = ecx >> (uint32_t)ISAAC_LUA_INIT_MASK_SHR_C;
  eax ^= ecx;
  return eax;
}

int32_t isaac_lua_engine_init_use_custom_newstate(uint32_t allocator_global) {
  return allocator_global != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_init_custom_newstate_ok(uint32_t state_ptr) {
  return state_ptr != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_init_take_debug_path(uint32_t debug_arg) {
  /* PE: cmp byte ptr [ebp+8], 0 — low byte only (v19 byte-width sweep). */
  return (debug_arg & 0xffu) != 0 ? 1 : 0;
}

int32_t isaac_lua_engine_init_requiref_table_ready(uint32_t first_openf) {
  return first_openf != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_init_requiref_continue(uint32_t next_openf) {
  return next_openf != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_init_debug_arg_store_byte(uint32_t debug_arg) {
  /* PE: mov al, byte [ebp+8]; mov [esi+0x1c], al — the stored value is the
     low byte of the pushed dword (v19 byte-width sweep). */
  return debug_arg & 0xffu;
}

int32_t isaac_lua_engine_heap_tracker_use_global(uint32_t tracker_global) {
  return tracker_global != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_heap_tracker_base(uint32_t tracker_global,
                                           uint32_t default_base) {
  if (tracker_global != 0u) {
    return tracker_global + (uint32_t)ISAAC_LUA_HEAP_TRACKER_DELTA;
  }
  return default_base;
}

int32_t isaac_lua_engine_alloc_nonnull(uint32_t alloc_ptr) {
  return alloc_ptr != 0u ? 1 : 0;
}

/* ---- ABI v3 ---- */

uint32_t isaac_lua_engine_tracked_alloc_payload(uint32_t alloc_ptr) {
  return alloc_ptr + (uint32_t)ISAAC_LUA_TRACKED_ALLOC_HEADER_SIZE;
}

int32_t isaac_lua_engine_tracked_payload_usable(uint32_t payload) {
  return payload != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_heap_tracker_add_lo(uint32_t lo, uint32_t size) {
  return lo + size; /* 32-bit wrap */
}

uint32_t isaac_lua_engine_heap_tracker_add_hi(uint32_t lo, uint32_t hi,
                                             uint32_t size) {
  const uint64_t t = (uint64_t)lo + (uint64_t)size;
  const uint32_t cf = (uint32_t)(t >> 32);
  return hi + cf; /* x86 adc dword ptr [tracker+4], 0 */
}

uint32_t isaac_lua_engine_init_state_store(uint32_t state_ptr) {
  return state_ptr;
}

uint32_t isaac_lua_engine_init_registry_null_store(void) {
  return 0u;
}

int32_t isaac_lua_engine_init_registry_store_nonnull(uint32_t object_ptr) {
  return object_ptr != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_register_classes_state_ready(uint32_t state_ptr) {
  return state_ptr != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_relative_stack_index_minus_2(void) {
  return (uint32_t)ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_2_U32;
}

int32_t isaac_lua_engine_file_handle_open(uint32_t file_handle) {
  return file_handle != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_run_script_list_empty(uint32_t head,
                                              uint32_t sentinel) {
  return head == sentinel ? 1 : 0;
}

int32_t isaac_lua_engine_msvc_string_sso_local(uint32_t capacity) {
  return capacity < (uint32_t)ISAAC_LUA_MSVC_STRING_HEAP_THRESHOLD ? 1 : 0;
}

uint32_t isaac_lua_engine_msvc_string_data_ptr(uint32_t local_buf,
                                              uint32_t heap_ptr,
                                              uint32_t capacity) {
  if (capacity < (uint32_t)ISAAC_LUA_MSVC_STRING_HEAP_THRESHOLD) {
    return local_buf;
  }
  return heap_ptr;
}

int32_t isaac_lua_engine_msvc_string_needs_heap_free(uint32_t capacity) {
  return capacity >= (uint32_t)ISAAC_LUA_MSVC_STRING_HEAP_THRESHOLD ? 1 : 0;
}

uint32_t isaac_lua_engine_msvc_string_free_bytes(uint32_t capacity) {
  return capacity + 1u;
}

int32_t isaac_lua_engine_msvc_string_aligned_free(uint32_t free_bytes) {
  return free_bytes >= (uint32_t)ISAAC_LUA_MSVC_STRING_ALIGN_THRESHOLD ? 1
                                                                      : 0;
}

int32_t isaac_lua_engine_msvc_string_aligned_header_ok(uint32_t ptr,
                                                      uint32_t real_base) {
  /* PE: mov ecx,[ptr-4]; sub eax,ecx; add eax,-4; cmp eax,0x1f; ja abort
   * eax starts as ptr. slack = (ptr - real_base) + (-4) as unsigned wrap. */
  const uint32_t slack =
      (ptr - real_base) + (uint32_t)0xfffffffcu; /* add eax, -4 */
  return slack <= (uint32_t)ISAAC_LUA_MSVC_STRING_ALIGN_SLACK_MAX ? 1 : 0;
}

int32_t isaac_lua_engine_run_script_take_debug_path(uint32_t debug_arg_byte) {
  /* PE: cmp byte ptr [engine+0x1c], 0 (v19 byte-width sweep). */
  return (debug_arg_byte & 0xffu) != 0 ? 1 : 0;
}

int32_t isaac_lua_engine_lua_status_ok(int32_t status) {
  return status == 0 ? 1 : 0;
}

int32_t isaac_lua_engine_run_script_fail_flag(int32_t load_status,
                                             int32_t pcall_status) {
  if (load_status != 0) {
    return 1;
  }
  if (pcall_status != 0) {
    return 1;
  }
  return 0;
}

int32_t isaac_lua_engine_run_script_success_bool(int32_t fail_flag) {
  return fail_flag == 0 ? 1 : 0;
}

/* ---- ABI v4 ---- */

int32_t isaac_lua_engine_destroy_list_empty(uint32_t head, uint32_t sentinel) {
  return head == sentinel ? 1 : 0;
}

uint32_t isaac_lua_engine_destroy_list_node_payload(uint32_t node) {
  return node + (uint32_t)ISAAC_LUA_LIST_NODE_PAYLOAD_OFF; /* 32-bit wrap */
}

uint32_t isaac_lua_engine_destroy_list_self_link(uint32_t sentinel) {
  return sentinel;
}

uint32_t isaac_lua_engine_destroy_list_count_clear(void) {
  return 0u;
}

int32_t isaac_lua_engine_destroy_registry_present(uint32_t object_ptr) {
  return object_ptr != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_destroy_field_null_store(void) {
  return 0u;
}

uint32_t isaac_lua_engine_destroy_registry_free_size(void) {
  return (uint32_t)ISAAC_LUA_DESTROY_REGISTRY_FREE_SIZE;
}

uint32_t isaac_lua_engine_list_unlink_prev_next_store(uint32_t next) {
  return next;
}

uint32_t isaac_lua_engine_list_unlink_next_prev_store(uint32_t prev) {
  return prev;
}

uint32_t isaac_lua_engine_list_count_dec(uint32_t count) {
  return count - 1u; /* PE dec dword; 32-bit wrap */
}

uint32_t isaac_lua_engine_materialize_call_nargs(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_CALL_NARGS;
}

uint32_t isaac_lua_engine_materialize_call_nresults(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_CALL_NRESULTS;
}

int32_t isaac_lua_engine_materialize_call_ok(int32_t status) {
  return status == 0 ? 1 : 0;
}

uint32_t isaac_lua_engine_registry_object_state(uint32_t state_field) {
  return state_field;
}

uint32_t isaac_lua_engine_registry_object_ref(uint32_t ref_field) {
  return ref_field;
}

uint32_t isaac_lua_engine_register_userdata_size(void) {
  return (uint32_t)ISAAC_LUA_REGISTER_USERDATA_SIZE;
}

uint32_t isaac_lua_engine_register_closure_nups(void) {
  return (uint32_t)ISAAC_LUA_REGISTER_CLOSURE_NUPS;
}

/* ---- ABI v5 ---- */

uint32_t isaac_lua_engine_relative_stack_index_minus_1(void) {
  return (uint32_t)ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_1_U32;
}

uint32_t isaac_lua_engine_relative_stack_index_minus_3(void) {
  return (uint32_t)ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_3_U32;
}

uint32_t isaac_lua_engine_relative_stack_index_minus_4(void) {
  return (uint32_t)ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_4_U32;
}

uint32_t isaac_lua_engine_relative_stack_index_minus_5(void) {
  return (uint32_t)ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_5_U32;
}

uint32_t isaac_lua_engine_register_method_closure_nups(void) {
  return (uint32_t)ISAAC_LUA_REGISTER_METHOD_CLOSURE_NUPS;
}

uint32_t isaac_lua_engine_register_set_meta_push_n(void) {
  return (uint32_t)ISAAC_LUA_REGISTER_SET_META_PUSH_N;
}

uint32_t isaac_lua_engine_register_userdata_fn_store(uint32_t fn_ptr) {
  return fn_ptr;
}

int32_t isaac_lua_engine_register_metatable_create_needed(
    uint32_t getmetatable_result) {
  return getmetatable_result == 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_stack_ref_nest_take_slots(uint32_t src_slots) {
  return src_slots + (uint32_t)ISAAC_LUA_STACK_REF_NEST_DELTA; /* wrap */
}

uint32_t isaac_lua_engine_stack_ref_nest_src_clear(void) {
  return 0u;
}

uint32_t isaac_lua_engine_stack_ref_return_dest_slots(uint32_t src_slots) {
  return src_slots - (uint32_t)ISAAC_LUA_STACK_REF_NEST_DELTA; /* wrap sub 3 */
}

uint32_t isaac_lua_engine_stack_ref_return_src_leave(void) {
  return (uint32_t)ISAAC_LUA_STACK_REF_RETURN_LEAVE;
}

int32_t isaac_lua_engine_stack_ref_settop_needed(int32_t gettop) {
  /* PE: cmp eax, 3; jl skip — signed compare */
  return gettop >= (int32_t)ISAAC_LUA_STACK_REF_SETTOP_THRESHOLD ? 1 : 0;
}

uint32_t isaac_lua_engine_stack_ref_settop_index(void) {
  return (uint32_t)ISAAC_LUA_RELATIVE_STACK_INDEX_MINUS_4_U32;
}

uint32_t isaac_lua_engine_stack_ref_slots_after_settop(uint32_t slots) {
  return slots - (uint32_t)ISAAC_LUA_STACK_REF_NEST_DELTA; /* add -3 wrap */
}

/* ---- ABI v6 ---- */

uint32_t isaac_lua_engine_stack_ref_construct_state_store(uint32_t state) {
  return state; /* PE mov [esi], edx */
}

uint32_t isaac_lua_engine_stack_ref_construct_slots_init(void) {
  return 0u; /* PE mov [esi+4], 0 */
}

uint32_t isaac_lua_engine_stack_ref_construct_slots_after_global(
    uint32_t slots) {
  return slots + (uint32_t)ISAAC_LUA_STACK_REF_CONSTRUCT_PUSH_DELTA; /* inc */
}

uint32_t isaac_lua_engine_stack_ref_construct_return_this(uint32_t this_ptr) {
  return this_ptr; /* PE mov eax, esi */
}

int32_t isaac_lua_engine_stack_ref_pop_slots_ready(int32_t slots,
                                                  int32_t count) {
  /* PE: cmp [esi+4], edi; jl skip — signed. Also gettop vs count. */
  return slots >= count ? 1 : 0;
}

uint32_t isaac_lua_engine_stack_ref_pop_settop_index(uint32_t count) {
  return ~count; /* PE not eax; lua_settop(L, ~count) pops `count` */
}

uint32_t isaac_lua_engine_stack_ref_pop_slots_after(uint32_t slots,
                                                   uint32_t count) {
  return slots - count; /* PE sub [esi+4], edi; 32-bit wrap */
}

/* ---- ABI v7 ---- */

uint32_t isaac_lua_engine_stack_ref_class_create_state_store(
    uint32_t src_state) {
  return src_state; /* PE mov eax,[src]; mov [dest],eax */
}

uint32_t isaac_lua_engine_stack_ref_class_create_slots_init(void) {
  return 0u; /* PE mov [dest+4], 0 before nest take */
}

uint32_t isaac_lua_engine_stack_ref_class_create_return_this(
    uint32_t this_ptr) {
  return this_ptr; /* PE mov eax, ebx */
}

uint32_t isaac_lua_engine_class_create_registry_key_minus_1(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_1;
}

uint32_t isaac_lua_engine_class_create_registry_key_minus_2(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_2;
}

uint32_t isaac_lua_engine_class_create_registry_key_minus_3(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_MINUS_3;
}

uint32_t isaac_lua_engine_class_create_registry_key_at_rel(
    uint32_t key_minus_1, int32_t rel_index) {
  /* key(rel) = key_m1 + rel + 1 with 32-bit wrap (PE consecutive keys). */
  return key_minus_1 + (uint32_t)rel_index + 1u;
}

uint32_t isaac_lua_engine_class_create_entityptr_name_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ENTITYPTR_NAME_VA;
}

uint32_t isaac_lua_engine_class_create_entityptr_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ENTITYPTR_CTOR_VA;
}

uint32_t isaac_lua_engine_class_create_meta_gc_name_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_META_GC_NAME_VA;
}

uint32_t isaac_lua_engine_class_create_meta_class_name_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_META_CLASS_NAME_VA;
}

uint32_t isaac_lua_engine_class_create_meta_const_name_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_META_CONST_NAME_VA;
}

/* ---- ABI v8 ---- */

uint32_t isaac_lua_engine_method_setreference_name_va(void) {
  return (uint32_t)ISAAC_LUA_METHOD_SETREFERENCE_NAME_VA;
}

uint32_t isaac_lua_engine_method_setreference_wrapper_va(void) {
  return (uint32_t)ISAAC_LUA_METHOD_SETREFERENCE_WRAPPER_VA;
}

uint32_t isaac_lua_engine_method_setreference_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_METHOD_SETREFERENCE_REAL_FN_VA;
}

uint32_t isaac_lua_engine_method_install_table_pushvalue_index(void) {
  return (uint32_t)ISAAC_LUA_METHOD_INSTALL_TABLE_PUSHVALUE_INDEX_U32;
}

uint32_t isaac_lua_engine_class_create_first_pushvalue_index(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_FIRST_PUSHVALUE_INDEX_U32;
}

uint32_t isaac_lua_engine_class_create_already_setmeta_index_a(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_A_U32;
}

uint32_t isaac_lua_engine_class_create_already_setmeta_index_b(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ALREADY_SETMETA_INDEX_B_U32;
}

uint32_t isaac_lua_engine_class_create_vector_name_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_VECTOR_NAME_VA;
}

uint32_t isaac_lua_engine_class_create_vector_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_VECTOR_CTOR_VA;
}

uint32_t isaac_lua_engine_class_create_vector_registry_key_minus_1(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_1;
}

uint32_t isaac_lua_engine_class_create_vector_registry_key_minus_2(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_2;
}

uint32_t isaac_lua_engine_class_create_vector_registry_key_minus_3(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_VECTOR_REGISTRY_KEY_MINUS_3;
}

/* ---- ABI v9 ---- */

uint32_t isaac_lua_engine_method_install_absindex_index(void) {
  return (uint32_t)ISAAC_LUA_METHOD_INSTALL_ABSINDEX_INDEX_U32;
}

uint32_t isaac_lua_engine_method_install_rotate_index(void) {
  return (uint32_t)ISAAC_LUA_METHOD_INSTALL_ROTATE_INDEX_U32;
}

uint32_t isaac_lua_engine_method_install_rotate_n(void) {
  return (uint32_t)ISAAC_LUA_METHOD_INSTALL_ROTATE_N;
}

uint32_t isaac_lua_engine_method_install_stack_arg_bytes(void) {
  return (uint32_t)ISAAC_LUA_METHOD_INSTALL_STACK_ARG_BYTES;
}

uint32_t isaac_lua_engine_method_install_rawset_index(uint32_t abs_index) {
  return abs_index;
}

/* ---- ABI v10 ---- */

uint32_t isaac_lua_engine_setref_wrapper_type_index_1(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_TYPE_INDEX_1;
}

uint32_t isaac_lua_engine_setref_wrapper_type_index_2(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_TYPE_INDEX_2;
}

uint32_t isaac_lua_engine_setref_wrapper_registry_key_arg1(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG1;
}

uint32_t isaac_lua_engine_setref_wrapper_registry_key_arg2(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_REGISTRY_KEY_ARG2;
}

uint32_t isaac_lua_engine_setref_wrapper_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_TOUSERDATA_INDEX_U32;
}

int32_t isaac_lua_engine_setref_wrapper_type_nonzero(int32_t lua_type_result) {
  return lua_type_result != 0 ? 1 : 0;
}

uint32_t isaac_lua_engine_setref_wrapper_check_stack_index_1(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_1;
}

uint32_t isaac_lua_engine_setref_wrapper_check_stack_index_2(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_CHECK_STACK_INDEX_2;
}

uint32_t isaac_lua_engine_setref_wrapper_check_flags(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_CHECK_FLAGS;
}

uint32_t isaac_lua_engine_setref_wrapper_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_setref_wrapper_return_ok(void) {
  return (uint32_t)ISAAC_LUA_SETREF_WRAPPER_RETURN_OK;
}

uint32_t isaac_lua_engine_lua_upvalueindex(uint32_t n) {
  /* Lua 5.3: lua_upvalueindex(n) = LUA_REGISTRYINDEX - (n)  (32-bit wrap). */
  return (uint32_t)ISAAC_LUA53_REGISTRY_INDEX_U32 - n;
}

/* ---- ABI v11 — check/get helper 0x0085c590 ---- */

uint32_t isaac_lua_engine_check_get_rawgetp_registry_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_RAWGETP_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_got_init(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_GOT_INIT;
}

int32_t isaac_lua_engine_check_get_isuserdata_continue(
    int32_t isuserdata_result) {
  return isuserdata_result != 0 ? 1 : 0;
}

uint32_t isaac_lua_engine_check_get_identity_key_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_IDENTITY_KEY_VA;
}

uint32_t isaac_lua_engine_check_get_identity_type_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_IDENTITY_TYPE_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_lua_tboolean(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_LUA_TBOOLEAN;
}

int32_t isaac_lua_engine_check_get_identity_is_boolean(
    int32_t lua_type_result) {
  return lua_type_result == (int32_t)ISAAC_LUA_CHECK_GET_LUA_TBOOLEAN ? 1 : 0;
}

uint32_t isaac_lua_engine_check_get_settop_pop_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_SETTOP_POP_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_const_name_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_CONST_NAME_VA;
}

uint32_t isaac_lua_engine_check_get_cannot_be_const_msg_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_CANNOT_BE_CONST_MSG_VA;
}

uint32_t isaac_lua_engine_check_get_parent_name_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_PARENT_NAME_VA;
}

uint32_t isaac_lua_engine_check_get_type_name_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TYPE_NAME_VA;
}

uint32_t isaac_lua_engine_check_get_expected_fmt_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_EXPECTED_FMT_VA;
}

int32_t isaac_lua_engine_check_get_is_const_from_type(int32_t lua_type_result) {
  /* PE: test esi,esi; sete [ebp-1] after lua_type of __const field.
     type==0 (LUA_TNIL) → object is const (LuaBridge isConst = lua_isnil). */
  return lua_type_result == 0 ? 1 : 0;
}

int32_t isaac_lua_engine_check_get_needs_const_argerror(
    uint32_t is_const_flag, uint32_t can_be_const_flag) {
  /* PE @ 0x0085c68a..0x0085c694:
       cmp [ebp-1],0; je success      ; !isConst      (byte compare)
       cmp [ebp+0xc],0; jne success   ; canBeConst    (byte compare)
       → luaL_argerror("cannot be const")
     Explicit low-byte narrows (v19 byte-width sweep). */
  return ((is_const_flag & 0xffu) != 0 && (can_be_const_flag & 0xffu) == 0)
             ? 1
             : 0;
}

uint32_t isaac_lua_engine_check_get_rawequal_index_a(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_RAWEQUAL_INDEX_A_U32;
}

uint32_t isaac_lua_engine_check_get_rawequal_index_b(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_RAWEQUAL_INDEX_B_U32;
}

uint32_t isaac_lua_engine_check_get_match_settop_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_MATCH_SETTOP_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_error_return_null(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_ERROR_RETURN_NULL;
}

/* ---- ABI v12 — check/get 0x0085c590 remaining pure CF ---- */

int32_t isaac_lua_engine_check_get_rawequal_match(int32_t rawequal_result) {
  /* PE @ 0x0085c67e: test eax,eax; je parent_walk — nonzero continues match. */
  return rawequal_result != 0 ? 1 : 0;
}

int32_t isaac_lua_engine_check_get_parent_type_present(int32_t lua_type_result) {
  /* PE @ 0x0085c6d5: test eax,eax; je no_parent — nonzero → parent rotate. */
  return lua_type_result != 0 ? 1 : 0;
}

uint32_t isaac_lua_engine_check_get_copy_dest_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_COPY_DEST_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_copy_src_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_COPY_SRC_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_parent_rotate_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_PARENT_ROTATE_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_parent_nil_rotate_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_PARENT_NIL_ROTATE_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_parent_rotate_n(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_PARENT_ROTATE_N_U32;
}

uint32_t isaac_lua_engine_check_get_type_rotate_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TYPE_ROTATE_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_type_rotate_n(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TYPE_ROTATE_N;
}

uint32_t isaac_lua_engine_check_get_tolstring_len_null(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TOLSTRING_LEN_NULL;
}

uint32_t isaac_lua_engine_check_get_tolstring_got_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TOLSTRING_GOT_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_tolstring_mismatch_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TOLSTRING_MISMATCH_INDEX_U32;
}

int32_t isaac_lua_engine_check_get_got_needs_typename(uint32_t got_ptr) {
  /* PE @ 0x0085c792: test ebx,ebx; jne skip_typename — null got → typename. */
  return got_ptr == 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_check_get_absindex_index(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_ABSINDEX_INDEX_U32;
}

uint32_t isaac_lua_engine_check_get_stack_index_store(uint32_t stack_index) {
  /* PE @ 0x0085c5a6: mov [ebp-8],esi — esi was edx (caller stack index). */
  return stack_index;
}

/* ---- ABI v13 — frame residual 0x008607a0 + materialize 0x00872980 ---- */

uint32_t isaac_lua_engine_frame_unref_engine_global_dat(void) {
  return (uint32_t)ISAAC_LUA_FRAME_UNREF_ENGINE_GLOBAL_DAT;
}

uint32_t isaac_lua_engine_frame_unref_flag_mask(void) {
  return (uint32_t)ISAAC_LUA_FRAME_UNREF_FLAG_MASK;
}

uint32_t isaac_lua_engine_frame_unref_registry_holder_off(void) {
  return (uint32_t)ISAAC_LUA_FRAME_UNREF_REGISTRY_HOLDER_OFF;
}

uint32_t isaac_lua_engine_frame_unref_materialize_arg1(void) {
  return (uint32_t)ISAAC_LUA_FRAME_UNREF_MATERIALIZE_ARG1;
}

uint32_t isaac_lua_engine_frame_unref_materialize_arg2(void) {
  return (uint32_t)ISAAC_LUA_FRAME_UNREF_MATERIALIZE_ARG2_U32;
}

uint32_t isaac_lua_engine_frame_unref_registry_index(void) {
  return (uint32_t)ISAAC_LUA53_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_frame_unref_try_level(void) {
  return (uint32_t)ISAAC_LUA_FRAME_UNREF_TRY_LEVEL;
}

uint32_t isaac_lua_engine_materialize_input_holder_off(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_INPUT_OFF_HOLDER;
}

uint32_t isaac_lua_engine_materialize_input_arg1_off(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_INPUT_OFF_ARG1;
}

uint32_t isaac_lua_engine_materialize_input_arg2_off(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_INPUT_OFF_ARG2;
}

uint32_t isaac_lua_engine_materialize_rawgeti_registry_index(void) {
  return (uint32_t)ISAAC_LUA53_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_materialize_pcall_msgh(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_PCALL_MSGH;
}

uint32_t isaac_lua_engine_materialize_pcall_ctx(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_PCALL_CTX;
}

uint32_t isaac_lua_engine_materialize_pcall_k(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_PCALL_K;
}

uint32_t isaac_lua_engine_materialize_pushvalue_index(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_PUSHVALUE_INDEX_U32;
}

uint32_t isaac_lua_engine_materialize_ref_registry_index(void) {
  return (uint32_t)ISAAC_LUA53_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_materialize_settop_index(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_SETTOP_INDEX_U32;
}

uint32_t isaac_lua_engine_materialize_out_state_store(uint32_t state_ptr) {
  /* PE @ 0x008729ea: mov [esi], ebx — out+0 = L. */
  return state_ptr;
}

uint32_t isaac_lua_engine_materialize_out_ref_store(uint32_t ref_value) {
  /* PE @ 0x008729f5: mov [esi+4], eax — out+4 = luaL_ref result. */
  return ref_value;
}

/* ---- ABI v14 — materialize residual pure CF around first IAT ---- */

uint32_t isaac_lua_engine_materialize_holder_off_state(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_HOLDER_OFF_STATE;
}

uint32_t isaac_lua_engine_materialize_holder_off_key(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_HOLDER_OFF_KEY;
}

uint32_t isaac_lua_engine_materialize_holder_state_addr(uint32_t holder) {
  /* PE @ 0x0087298e: mov ebx, [eax] — L at holder+0. */
  return holder + (uint32_t)ISAAC_LUA_MATERIALIZE_HOLDER_OFF_STATE;
}

uint32_t isaac_lua_engine_materialize_holder_key_addr(uint32_t holder) {
  /* PE @ 0x00872990: mov eax, [eax+4] — key at holder+4. */
  return holder + (uint32_t)ISAAC_LUA_MATERIALIZE_HOLDER_OFF_KEY;
}

uint32_t isaac_lua_engine_materialize_lua_integer_lo(uint32_t value) {
  /* PE cdq low dword is the original s32 bit pattern. */
  return value;
}

uint32_t isaac_lua_engine_materialize_lua_integer_hi(uint32_t value) {
  /* PE @ 0x00872993 / 0x008729ab / 0x008729b7: cdq → edx = sar eax, 31. */
  return (uint32_t)((int32_t)value >> 31);
}

uint32_t isaac_lua_engine_materialize_stack_clean_rawgeti_pushint(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_STACK_CLEAN_RAWGETI_PUSHINT;
}

uint32_t isaac_lua_engine_materialize_stack_clean_pushint(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_STACK_CLEAN_PUSHINT;
}

uint32_t isaac_lua_engine_materialize_stack_clean_pcall(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_STACK_CLEAN_PCALL;
}

uint32_t isaac_lua_engine_materialize_stack_clean_success(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_STACK_CLEAN_SUCCESS;
}

uint32_t isaac_lua_engine_materialize_return_out(uint32_t out_ptr) {
  /* PE @ 0x00872a01: mov eax, esi — return out. */
  return out_ptr;
}

/* ---- ABI v25 — FUN_00872980 materialize body: ordered host-event program
 *      (PE facts re-derived this unit: fn 0x00872980..0x00872a1d, success
 *      `ret 8` @ 0x00872a09, error path 0x00872a0c..0x00872a1d no-return). */

namespace {
/* Event kinds in exact PE program order (event 3's gate is modelled by
   materialize_program_gate; events 4..6 run only on the success path). */
constexpr uint32_t kMaterializeEventKinds[7] = {
    ISAAC_LUA_MATERIALIZE_EVENT_RAWGETI,
    ISAAC_LUA_MATERIALIZE_EVENT_PUSHINTEGER_1,
    ISAAC_LUA_MATERIALIZE_EVENT_PUSHINTEGER_2,
    ISAAC_LUA_MATERIALIZE_EVENT_PCALLK,
    ISAAC_LUA_MATERIALIZE_EVENT_PUSHVALUE,
    ISAAC_LUA_MATERIALIZE_EVENT_LUAL_REF,
    ISAAC_LUA_MATERIALIZE_EVENT_SETTOP,
};
/* IAT slot per event (Lua5.3.3r.dll import-directory addresses, address-
   stable host surface). */
constexpr uint32_t kMaterializeEventIat[7] = {
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_RAWGETI,
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_PUSHINTEGER,
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_PUSHINTEGER,
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_PCALLK,
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_PUSHVALUE,
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_LUAL_REF,
    ISAAC_LUA_MATERIALIZE_EVENT_IAT_SETTOP,
};
/* Stack-arg count per event (push count incl. L). */
constexpr uint32_t kMaterializeEventArgs[7] = {
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_RAWGETI,
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PUSHINTEGER,
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PUSHINTEGER,
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PCALLK,
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_PUSHVALUE,
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_LUAL_REF,
    ISAAC_LUA_MATERIALIZE_EVENT_ARGS_SETTOP,
};
/* imm-slot count per event (imms only; runtime sext values are not imms). */
constexpr uint32_t kMaterializeEventIms[7] = {
    ISAAC_LUA_MATERIALIZE_EVENT_IMS_RAWGETI,
    0,  /* pushinteger(arg1): runtime value */
    0,  /* pushinteger(arg2): runtime value */
    ISAAC_LUA_MATERIALIZE_EVENT_IMS_PCALLK,
    ISAAC_LUA_MATERIALIZE_EVENT_IMS_PUSHVALUE,
    ISAAC_LUA_MATERIALIZE_EVENT_IMS_LUAL_REF,
    ISAAC_LUA_MATERIALIZE_EVENT_IMS_SETTOP,
};

constexpr uint32_t kMaterializeImm(uint32_t event, uint32_t slot) {
  switch (event) {
    case ISAAC_LUA_MATERIALIZE_EVENT_RAWGETI:
      /* slot 0: LUA_REGISTRYINDEX (PE push 0xfff0b9d8 @ 0x00872996). */
      return slot == 0 ? ISAAC_LUA53_REGISTRY_INDEX_U32 : 0u;
    case ISAAC_LUA_MATERIALIZE_EVENT_PCALLK:
      /* slots 0..2 msgh/ctx/k = 0, slot 3 nresults = 1, slot 4 nargs = 2
         (PE pushes @ 0x008729c0..0x008729c8). */
      switch (slot) {
        case 0: return ISAAC_LUA_MATERIALIZE_PCALL_MSGH;
        case 1: return ISAAC_LUA_MATERIALIZE_PCALL_CTX;
        case 2: return ISAAC_LUA_MATERIALIZE_PCALL_K;
        case 3: return ISAAC_LUA_MATERIALIZE_CALL_NRESULTS;
        case 4: return ISAAC_LUA_MATERIALIZE_CALL_NARGS;
        default: return 0u;
      }
    case ISAAC_LUA_MATERIALIZE_EVENT_PUSHVALUE:
      /* slot 0: -1 (PE push -1 @ 0x008729d8). */
      return slot == 0 ? ISAAC_LUA_MATERIALIZE_PUSHVALUE_INDEX_U32 : 0u;
    case ISAAC_LUA_MATERIALIZE_EVENT_LUAL_REF:
      /* slot 1: LUA_REGISTRYINDEX (PE push @ 0x008729e4). */
      return slot == 1 ? ISAAC_LUA53_REGISTRY_INDEX_U32 : 0u;
    case ISAAC_LUA_MATERIALIZE_EVENT_SETTOP:
      /* slot 0: -2 (PE push @ 0x008729f2). */
      return slot == 0 ? ISAAC_LUA_MATERIALIZE_SETTOP_INDEX_U32 : 0u;
    default:
      return 0u;
  }
}
}  // namespace

uint32_t isaac_lua_engine_materialize_program_event_count(void) {
  return ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT;
}

int32_t isaac_lua_engine_materialize_program_event_kind(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) {
    return -1;
  }
  return (int32_t)kMaterializeEventKinds[index];
}

uint32_t isaac_lua_engine_materialize_program_event_iat_slot(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) {
    return 0u;
  }
  return kMaterializeEventIat[index];
}

uint32_t isaac_lua_engine_materialize_program_event_args(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) {
    return 0u;
  }
  return kMaterializeEventArgs[index];
}

uint32_t isaac_lua_engine_materialize_program_event_ims(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT) {
    return 0u;
  }
  return kMaterializeEventIms[index];
}

uint32_t isaac_lua_engine_materialize_program_event_imm(int32_t index,
                                                        int32_t slot) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_PROGRAM_EVENT_COUNT ||
      slot < 0) {
    return 0u;
  }
  return kMaterializeImm(kMaterializeEventKinds[index], (uint32_t)slot);
}

int32_t isaac_lua_engine_materialize_program_gate(int32_t status) {
  /* PE @ 0x008729d4: test eax,eax; jne 0x872a0c — success iff status == 0.
     Full-dword test; driven UNMASKED with wide values in the test. */
  return status == 0 ? 1 : 0;
}

int32_t isaac_lua_engine_materialize_out_state_store_before_ref(void) {
  /* PE @ 0x008729ea stores out->state BEFORE the luaL_ref call @ 0x008729ec;
     out->ref is stored @ 0x008729f5 AFTER luaL_ref and BEFORE settop. */
  return 1;
}

uint32_t isaac_lua_engine_materialize_error_builder_va(void) {
  /* 0x85c080(L, &buf): MSVC error-string builder; returns normally
     (ret 8 @ 0x85c1c5). Address-stable host. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_ERROR_BUILDER_VA;
}

uint32_t isaac_lua_engine_materialize_error_raiser_va(void) {
  /* 0x8727d0: raise; never returns (first int3 @ 0x00872a1d after the
     call site @ 0x00872a18; materialize's ret 8 is unreachable on this
     path). Address-stable host. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_ERROR_RAISER_VA;
}

int32_t isaac_lua_engine_materialize_error_path_no_return(void) {
  return 1;
}

uint32_t isaac_lua_engine_materialize_error_buf_size(void) {
  /* PE @ 0x00872a0c: sub esp, 0x28 before 0x85c080. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_ERROR_BUF_SIZE;
}

uint32_t isaac_lua_engine_materialize_entry_align_mask(void) {
  /* PE @ 0x00872983: and esp, 0xfffffff8. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_ENTRY_ALIGN_MASK;
}

uint32_t isaac_lua_engine_materialize_ret_dwords(void) {
  /* PE @ 0x00872a09: ret 8 = 2 stack dwords (out + dead Game arg from the
     sole caller 0x008607a0 @ 0x008607ec). */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RET_DWORDS;
}

uint32_t isaac_lua_engine_materialize_success_ret_end(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_SUCCESS_RET_END;
}

uint32_t isaac_lua_engine_materialize_error_path_start(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_ERROR_PATH_START;
}

uint32_t isaac_lua_engine_materialize_fn_end(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_FN_END;
}

/* ---------------------------------------------------------------------------
 * ABI v26 -- error-path callee bodies inside the v25 materialize boundary.
 * Evidence: PE Capstone of 0x85c080 (132 insns, ret 8 @ 0x85c1c5) and
 * 0x8727d0 (int3 @ 0x872819, no ret) plus the image-wide caller census
 * (49 identical builder+raiser pairs); import directory names the Lua VM
 * IAT slots (lua_gettop 0xb183d4, lua_tolstring 0xb183d0), the shared
 * helpers (std::string::assign 0x40ccd0, operator new 0x40cf00, CRT
 * memcpy 0xaf08bd) and the C++ throw machinery (_CxxThrowException via
 * IAT 0xb18758, thunk 0xaf05eb, _ThrowInfo 0xbd5bf8). All stay
 * address-stable host; the exports pin the pure decisions, immediates,
 * layout and ordering. No uint8_t scalar parameter anywhere.
 * ------------------------------------------------------------------------- */
namespace {
constexpr uint32_t kBuilderEventKinds[5] = {
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_GETTOP,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_TOSTRING,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ASSIGN,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_MEMCPY,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_NEW,
};
/* Per-event call-target VA: IAT slot for the lua_* events, helper VA for
   the shared string/CRT helpers. */
constexpr uint32_t kBuilderEventCallVa[5] = {
    ISAAC_LUA_MATERIALIZE_BUILDER_IAT_GETTOP,
    ISAAC_LUA_MATERIALIZE_BUILDER_IAT_TOSTRING,
    ISAAC_LUA_MATERIALIZE_BUILDER_ASSIGN_VA,
    ISAAC_LUA_MATERIALIZE_BUILDER_MEMCPY_VA,
    ISAAC_LUA_MATERIALIZE_BUILDER_NEW_VA,
};
constexpr uint32_t kBuilderEventArgs[5] = {
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_GETTOP,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_TOSTRING,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_ASSIGN,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_MEMCPY,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_ARGS_NEW,
};
constexpr uint32_t kBuilderEventIms[5] = {
    0,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_IMS_TOSTRING,
    0,
    ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_IMS_MEMCPY,
    0,
};
constexpr uint32_t kRaiserEventKinds[2] = {
    ISAAC_LUA_MATERIALIZE_RAISER_EVENT_EXC_CTOR,
    ISAAC_LUA_MATERIALIZE_RAISER_EVENT_THROW,
};
constexpr uint32_t kRaiserEventCallVa[2] = {
    ISAAC_LUA_MATERIALIZE_RAISER_EXC_CTOR_VA,
    ISAAC_LUA_MATERIALIZE_RAISER_THROW_VA,
};
constexpr uint32_t kRaiserEventArgs[2] = {
    ISAAC_LUA_MATERIALIZE_RAISER_EVENT_ARGS_EXC_CTOR,
    ISAAC_LUA_MATERIALIZE_RAISER_EVENT_ARGS_THROW,
};
}  // namespace

uint32_t isaac_lua_engine_materialize_builder_va(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_FN_VA;
}

uint32_t isaac_lua_engine_materialize_builder_ret_end(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_RET_END;
}

uint32_t isaac_lua_engine_materialize_builder_event_count(void) {
  return ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT;
}

int32_t isaac_lua_engine_materialize_builder_event_kind(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT) {
    return -1;
  }
  return (int32_t)kBuilderEventKinds[index];
}

uint32_t isaac_lua_engine_materialize_builder_event_iat_slot(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT) {
    return 0u;
  }
  return kBuilderEventCallVa[index];
}

uint32_t isaac_lua_engine_materialize_builder_event_args(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT) {
    return 0u;
  }
  return kBuilderEventArgs[index];
}

uint32_t isaac_lua_engine_materialize_builder_event_ims(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT) {
    return 0u;
  }
  return kBuilderEventIms[index];
}

uint32_t isaac_lua_engine_materialize_builder_event_imm(int32_t index,
                                                        int32_t slot) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_COUNT ||
      slot < 0) {
    return 0u;
  }
  const uint32_t kind = kBuilderEventKinds[index];
  const uint32_t s = (uint32_t)slot;
  if (kind == ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_TOSTRING) {
    /* Push order: slot 0 = len-null (0), slot 1 = index -1
       (PE pushes @ 0x85c0f1 / 0x85c0f3). */
    return s == 0 ? ISAAC_LUA_MATERIALIZE_BUILDER_TOSTRING_LEN_NULL
                  : (s == 1 ? ISAAC_LUA_MATERIALIZE_BUILDER_TOSTRING_INDEX_U32
                            : 0u);
  }
  if (kind == ISAAC_LUA_MATERIALIZE_BUILDER_EVENT_MEMCPY) {
    /* Push order: slot 0 = len 0xd, slot 1 = src literal VA
       (PE pushes @ 0x85c13b / 0x85c13d). */
    return s == 0 ? ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_LEN
                  : (s == 1 ? (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_VA
                            : 0u);
  }
  return 0u;
}

int32_t isaac_lua_engine_materialize_builder_gettop_gate(int32_t top) {
  /* PE @ 0x85c0ed: test eax,eax; jle 0x85c128 - tostring path iff top > 0.
     SIGNED full-dword test (lua_gettop returns int); driven UNMASKED. */
  return top > 0 ? 1 : 0;
}

uint32_t isaac_lua_engine_materialize_builder_tostring_result(uint32_t str) {
  /* PE @ 0x85c101..0x85c108: mov ecx,0xb1a4ec; test eax,eax;
     cmovne ecx,eax - nonzero result wins, else the default literal
     (first byte 0, so the inline strlen yields 0 -> empty assign). */
  return str != 0u ? str : (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_DEFAULT_LITERAL_VA;
}

int32_t isaac_lua_engine_materialize_builder_reuse_gate(uint32_t cap) {
  /* PE @ 0x85c12b: cmp ecx,0xd; jb 0x85c158 - reuse iff cap >= 0xd
     (UNSIGNED). Capacity is RE-READ from [this+0x24] @ 0x85c128 per
     call - never folded from a pre-call snapshot. */
  return cap >= ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_LEN ? 1 : 0;
}

int32_t isaac_lua_engine_materialize_builder_sso_gate(uint32_t cap) {
  /* PE @ 0x85c133: cmp ecx,0x10; jb 0x85c13b - SSO buffer iff cap < 0x10
     (UNSIGNED), else heap ptr [this+0x10]. */
  return cap < 0x10u ? 1 : 0;
}

uint32_t isaac_lua_engine_materialize_builder_grow_capacity(uint32_t cap) {
  /* PE @ 0x85c158..0x85c17b, ALL unsigned (shr / jbe / cmova):
       edx = cap >> 1; eax = 0x7fffffff - edx;
       if (cap <= eax)  newcap = max(0xf, cap + edx)
       else             newcap = 0x7fffffff
     cap + edx cannot wrap on the taken branch (cap <= 0x7fffffff - edx). */
  const uint32_t half = cap >> 1;
  const uint32_t limit = 0x7fffffffu - half;
  if (cap <= limit) {
    const uint32_t cand = half + cap;
    return cand > 0xfu ? cand : 0xfu;
  }
  return 0x7fffffffu;
}

uint32_t isaac_lua_engine_materialize_builder_grow_alloc_size(uint32_t cap) {
  /* PE @ 0x85c17b: lea ecx,[ebx+1] - allocation size = newcap + 1 (u32
     wrap; 0x7fffffff -> 0x80000000). newcap computed by the grow law. */
  return isaac_lua_engine_materialize_builder_grow_capacity(cap) + 1u;
}

uint32_t isaac_lua_engine_materialize_builder_literal_va(void) {
  /* "missing error" @ 0xb6e96c, 13 bytes (PE push @ 0x85c13d). */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_VA;
}

uint32_t isaac_lua_engine_materialize_builder_literal_len(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_LITERAL_LEN;
}

uint32_t isaac_lua_engine_materialize_builder_default_literal_va(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_DEFAULT_LITERAL_VA;
}

uint32_t isaac_lua_engine_materialize_builder_vtable_va(void) {
  /* PE mov [edi],0xb753d0 @ 0x85c0bd (dtor pair 0x85c210/0x85c200). */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_VTABLE_VA;
}

uint32_t isaac_lua_engine_materialize_builder_off_state(void) {
  /* PE mov [edi+0xc],eax @ 0x85c0c3 (arg1 = L). */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_OFF_STATE;
}

uint32_t isaac_lua_engine_materialize_builder_off_string(void) {
  /* std::string at +0x10: SSO buf 0x10..0x1f, size +0x20, cap +0x24. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_OFF_STRING;
}

uint32_t isaac_lua_engine_materialize_builder_off_size(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_OFF_SIZE;
}

uint32_t isaac_lua_engine_materialize_builder_off_capacity(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_OFF_CAPACITY;
}

uint32_t isaac_lua_engine_materialize_builder_init_capacity(void) {
  /* PE mov [edi+0x24],0xf @ 0x85c0d4; size init 0 @ 0x85c0cd. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_INIT_CAPACITY;
}

uint32_t isaac_lua_engine_materialize_builder_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_materialize_builder_ret_dwords(void) {
  /* ret 8 @ 0x85c1c5: (L, &buf); &buf == this at every one of the 49
     call sites, and [ebp+0xc] is never read in the body. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_RET_DWORDS;
}

int32_t isaac_lua_engine_materialize_builder_return_this(void) {
  /* Epilogue @ 0x85c1b2: mov eax,edi - returns this. */
  return 1;
}

int32_t isaac_lua_engine_materialize_builder_buf_ptr_store_last(void) {
  /* Grow path store order: size @ 0x85c183, cap @ 0x85c18a, literal copy
     @ 0x85c18d..0x85c1a8, null term @ 0x85c1ab, heap ptr @ 0x85c1af LAST. */
  return 1;
}

uint32_t isaac_lua_engine_materialize_builder_callsite_count(void) {
  /* Whole-image linear census (this unit): 49 direct E8 callers, every one
     the identical `sub esp,0x28; mov ecx,esp; push ecx; push L` prelude
     followed 5 bytes later by `call 0x8727d0; int3`. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_BUILDER_CALLSITE_COUNT;
}

uint32_t isaac_lua_engine_materialize_raiser_va(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_FN_VA;
}

uint32_t isaac_lua_engine_materialize_raiser_fn_end(void) {
  /* First int3 @ 0x872819; no ret instruction in the body. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_FN_END;
}

uint32_t isaac_lua_engine_materialize_raiser_event_count(void) {
  return ISAAC_LUA_MATERIALIZE_RAISER_EVENT_COUNT;
}

int32_t isaac_lua_engine_materialize_raiser_event_kind(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_RAISER_EVENT_COUNT) {
    return -1;
  }
  return (int32_t)kRaiserEventKinds[index];
}

uint32_t isaac_lua_engine_materialize_raiser_event_iat_slot(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_RAISER_EVENT_COUNT) {
    return 0u;
  }
  return kRaiserEventCallVa[index];
}

uint32_t isaac_lua_engine_materialize_raiser_event_args(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_RAISER_EVENT_COUNT) {
    return 0u;
  }
  return kRaiserEventArgs[index];
}

uint32_t isaac_lua_engine_materialize_raiser_event_ims(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_MATERIALIZE_RAISER_EVENT_COUNT) {
    return 0u;
  }
  return 0u;
}

uint32_t isaac_lua_engine_materialize_raiser_event_imm(int32_t index,
                                                       int32_t slot) {
  (void)index;
  (void)slot;
  return 0u;
}

int32_t isaac_lua_engine_materialize_raiser_no_return(void) {
  /* int3 @ 0x872819 follows the throw thunk; no ret exists. */
  return 1;
}

uint32_t isaac_lua_engine_materialize_raiser_exc_local_off(void) {
  /* PE lea ecx,[ebp-0x38] @ 0x872803. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_EXC_LOCAL_OFF;
}

uint32_t isaac_lua_engine_materialize_raiser_varargs_src_off(void) {
  /* PE lea eax,[ebp+8] @ 0x8727f8 - first vararg dword is the builder
     object's vtable value (the 0x28 buffer sits at esp when called). */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_VARARGS_SRC_OFF;
}

uint32_t isaac_lua_engine_materialize_raiser_throw_info_va(void) {
  /* _ThrowInfo @ 0xbd5bf8 (attributes 0, unwind = dtor 0x85c1d0,
     catchable-type array @ 0xbd5c08). PE push @ 0x87280b. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_THROW_INFO_VA;
}

uint32_t isaac_lua_engine_materialize_raiser_exc_ctor_va(void) {
  /* Error-exc ctor 0x897620 (sole caller): this=&local, arg=&varargs;
     copies std::exception subobject (__std_exception_copy 0xb1877c), L
     from src+0xc, string copy ctor 0x40cf50 from src+0x10; ret 4. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_EXC_CTOR_VA;
}

uint32_t isaac_lua_engine_materialize_raiser_throw_iat(void) {
  /* _CxxThrowException import slot behind the 0xaf05eb thunk. */
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_THROW_IAT;
}

uint32_t isaac_lua_engine_materialize_raiser_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_MATERIALIZE_RAISER_SEH_HANDLER_VA;
}



/* ---- ABI v15 — RegisterClasses structural table-install model ---- */

uint32_t isaac_lua_engine_register_push_imm_bytes(uint32_t value) {
  /* MSVC selects `push imm8` (6A ib, sign-extended) whenever the pushed
     dword is representable as a signed byte, else `push imm32` (68 id).
     Verified over every immediate push in the RegisterClasses body. */
  const int32_t s = (int32_t)value;
  if (s >= -0x80 && s <= 0x7f) {
    return (uint32_t)ISAAC_LUA_REGISTER_PUSH_IMM8_BYTES;
  }
  return (uint32_t)ISAAC_LUA_REGISTER_PUSH_IMM32_BYTES;
}

uint32_t isaac_lua_engine_register_recv_load_bytes(int32_t base_only) {
  return base_only != 0
             ? (uint32_t)ISAAC_LUA_REGISTER_RECV_LOAD_BASE_BYTES
             : (uint32_t)ISAAC_LUA_REGISTER_RECV_LOAD_DISP8_BYTES;
}

uint32_t isaac_lua_engine_register_install_record_bytes(int32_t base_only) {
  /* receiver load + add esp,imm8 + mov edx,imm32 + push imm32 + call rel32.
     The three operand instructions are emitted in three different orders
     across the body; every ordering encodes to the same total. */
  return isaac_lua_engine_register_recv_load_bytes(base_only) +
         (uint32_t)ISAAC_LUA_REGISTER_ADD_ESP_IMM8_BYTES +
         (uint32_t)ISAAC_LUA_REGISTER_MOV_EDX_IMM32_BYTES +
         (uint32_t)ISAAC_LUA_REGISTER_PUSH_IMM32_BYTES +
         (uint32_t)ISAAC_LUA_REGISTER_CALL_REL32_BYTES;
}

uint32_t isaac_lua_engine_register_install_next_call_va(uint32_t prev_call_va,
                                                        int32_t base_only) {
  return (uint32_t)(prev_call_va +
                    isaac_lua_engine_register_install_record_bytes(base_only));
}

uint32_t isaac_lua_engine_register_builder_entry_bytes(uint32_t arg0,
                                                       uint32_t arg1,
                                                       uint32_t arg2,
                                                       int32_t chained) {
  /* PE order is `push arg2; push arg1; push arg0` (cdecl right-to-left),
     optional `mov ecx, eax` receiver chain, then `call rel32`. */
  uint32_t bytes = isaac_lua_engine_register_push_imm_bytes(arg2) +
                   isaac_lua_engine_register_push_imm_bytes(arg1) +
                   isaac_lua_engine_register_push_imm_bytes(arg0);
  if (chained != 0) {
    bytes += (uint32_t)ISAAC_LUA_REGISTER_MOV_ECX_EAX_BYTES;
  }
  return bytes + (uint32_t)ISAAC_LUA_REGISTER_CALL_REL32_BYTES;
}

uint32_t isaac_lua_engine_register_call_target(uint32_t site_va,
                                               uint32_t rel32) {
  return (uint32_t)(site_va + (uint32_t)ISAAC_LUA_REGISTER_CALL_REL32_BYTES +
                    rel32);
}

uint32_t isaac_lua_engine_register_call_rel32(uint32_t site_va,
                                              uint32_t target_va) {
  return (uint32_t)(target_va - site_va -
                    (uint32_t)ISAAC_LUA_REGISTER_CALL_REL32_BYTES);
}

int32_t isaac_lua_engine_register_operand_section(uint32_t value) {
  if (value >= (uint32_t)ISAAC_LUA_PE_TEXT_LO_VA &&
      value < (uint32_t)ISAAC_LUA_PE_TEXT_HI_VA) {
    return ISAAC_LUA_PE_OPERAND_SECTION_TEXT;
  }
  if (value >= (uint32_t)ISAAC_LUA_PE_RDATA_LO_VA &&
      value < (uint32_t)ISAAC_LUA_PE_RDATA_HI_VA) {
    return ISAAC_LUA_PE_OPERAND_SECTION_RDATA;
  }
  return ISAAC_LUA_PE_OPERAND_SECTION_OTHER;
}

int32_t isaac_lua_engine_register_install_is_metamethod(uint32_t edx_imm) {
  /* The metamethod setter is the only install whose edx is a relative stack
     index rather than a name pointer (10/10 sites carry −2). */
  return edx_imm == (uint32_t)ISAAC_LUA_REGISTER_INSTALL_META_INDEX_U32 ? 1 : 0;
}

uint32_t isaac_lua_engine_register_install_name_va(uint32_t edx_imm,
                                                   uint32_t push_imm) {
  return isaac_lua_engine_register_install_is_metamethod(edx_imm) != 0
             ? push_imm
             : edx_imm;
}

uint32_t isaac_lua_engine_register_install_target_va(uint32_t edx_imm,
                                                     uint32_t push_imm) {
  /* Metamethod sites push the name and carry no code operand. */
  return isaac_lua_engine_register_install_is_metamethod(edx_imm) != 0
             ? 0u
             : push_imm;
}

int32_t isaac_lua_engine_register_install_operands_well_formed(
    uint32_t edx_imm, uint32_t push_imm) {
  if (isaac_lua_engine_register_install_is_metamethod(edx_imm) != 0) {
    return isaac_lua_engine_register_operand_section(push_imm) ==
                   ISAAC_LUA_PE_OPERAND_SECTION_RDATA
               ? 1
               : 0;
  }
  return (isaac_lua_engine_register_operand_section(edx_imm) ==
              ISAAC_LUA_PE_OPERAND_SECTION_RDATA &&
          isaac_lua_engine_register_operand_section(push_imm) ==
              ISAAC_LUA_PE_OPERAND_SECTION_TEXT)
             ? 1
             : 0;
}

uint32_t isaac_lua_engine_register_eh_state_apply(uint32_t prev_state,
                                                  uint32_t value,
                                                  int32_t byte_form) {
  /* `mov byte ptr [ebp-4], ib` writes only the low byte; the upper three
     bytes of the previous state survive. `mov dword ptr [ebp-4], id`
     replaces the whole slot. */
  if (byte_form != 0) {
    return (uint32_t)((prev_state & 0xffffff00u) | (value & 0xffu));
  }
  return value;
}

int32_t isaac_lua_engine_register_eh_byte_form_safe(uint32_t prev_state) {
  /* Byte form only reproduces the intended state when the surviving upper
     bytes are already zero. Holds at all 103 byte-form stores. */
  return prev_state <= 0xffu ? 1 : 0;
}

uint32_t isaac_lua_engine_register_eh_store_bytes(int32_t byte_form) {
  return byte_form != 0
             ? (uint32_t)ISAAC_LUA_REGISTER_EH_BYTE_STORE_BYTES
             : (uint32_t)ISAAC_LUA_REGISTER_EH_DWORD_STORE_BYTES;
}

uint32_t isaac_lua_engine_register_dtor_payload_addr(uint32_t local_addr) {
  /* Every scope exit is `lea ecx,[ebp-N]; push dword ptr [ebp-N+4];
     call 0x0085cce0` — delta 4 on all 19 sites. */
  return (uint32_t)(local_addr +
                    (uint32_t)ISAAC_LUA_REGISTER_DTOR_PAYLOAD_DELTA);
}

uint32_t isaac_lua_engine_register_class_state_addr(uint32_t engine_ptr) {
  /* All 37 class-create prologues load the Lua state via
     `mov edx, dword ptr [ebx + 0x18]`. */
  return (uint32_t)(engine_ptr + (uint32_t)ISAAC_LUA_ENGINE_OFF_STATE);
}

/* Representative Vector class span, recovered entry by entry from the
   instruction stream (0x00866a82 … 0x00866c72). Name VAs are the literal
   .rdata pointers the PE passes; target VAs stay address-stable. */
struct IsaacLuaRegisterInstallEntry {
  uint32_t call_va;
  uint32_t name_va;
  uint32_t target_va; /* 0 for metamethod sites */
  uint32_t helper_va;
  int32_t is_metamethod;
  int32_t adjacent; /* previous record ends exactly one record earlier */
};

static const IsaacLuaRegisterInstallEntry kVectorInstalls[] = {
    {0x00866a82u, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
    {0x00866a97u, 0x00b701c0u, 0x00a0ffc0u, 0x008a05a0u, 0, 1}, /* Normalize */
    {0x00866aacu, 0x00b701ccu, 0x00a10030u, 0x008a0500u, 0, 1}, /* Normalized */
    {0x00866ac1u, 0x00b701b4u, 0x00a10180u, 0x008a0460u, 0, 1}, /* Dot */
    {0x00866ad6u, 0x00b701b8u, 0x00a101a0u, 0x008a0460u, 0, 1}, /* Cross */
    {0x00866aebu, 0x00b70244u, 0x00a10210u, 0x008a0400u, 0, 1}, /* Lerp */
    {0x00866b00u, 0x00b7024cu, 0x00a0ff30u, 0x008a0460u, 0, 1}, /* Distance */
    {0x00866b15u, 0x00b7022cu, 0x00a0ff90u, 0x008a0460u, 0, 1}, /* DistanceSquared */
    {0x00866b2au, 0x00b7023cu, 0x00a102e0u, 0x008a0360u, 0, 1}, /* Rotated */
    {0x00866b61u, 0x00b70210u, 0x00000000u, 0x0085bf90u, 1, 0}, /* FromAngle */
    {0x00866b76u, 0x00b7021cu, 0x00a10390u, 0x008a0220u, 0, 1}, /* GetAngleDegrees */
    {0x00866b8bu, 0x00b70200u, 0x00a100b0u, 0x008a01c0u, 0, 1}, /* Resize */
    {0x00866ba0u, 0x00b70208u, 0x00a10100u, 0x008a0360u, 0, 1}, /* Resized */
    {0x00866bb5u, 0x00b70290u, 0x00a103c0u, 0x008a0160u, 0, 1}, /* Clamp */
    {0x00866bcau, 0x00b70298u, 0x00a103f0u, 0x008a00c0u, 0, 1}, /* Clamped */
    {0x00866bdfu, 0x00b70278u, 0x00a0fea0u, 0x008a0220u, 0, 1}, /* Length */
    {0x00866bf4u, 0x00b70280u, 0x00a0fed0u, 0x008a0220u, 0, 1}, /* LengthSquared */
    {0x00866c09u, 0x00b70268u, 0x00a10420u, 0x008a0020u, 0, 1}, /* __add */
    {0x00866c1eu, 0x00b70270u, 0x00a10480u, 0x008a0020u, 0, 1}, /* __sub */
    {0x00866c33u, 0x00b70258u, 0x00a104e0u, 0x0089ff80u, 0, 1}, /* __mul */
    {0x00866c48u, 0x00b70260u, 0x00a105a0u, 0x0089ff80u, 0, 1}, /* __div */
    {0x00866c5du, 0x00b702f8u, 0x00a10660u, 0x008a0500u, 0, 1}, /* __unm */
    {0x00866c72u, 0x00b70300u, 0x0085e630u, 0x0089fee0u, 0, 1}, /* __tostring */
};

/* Trailing property/builder entries of the same class:
   `push a2; push a1; push <name>; [mov ecx,eax]; call <builder>`.
   ABI v19 adds the call site and builder VAs per entry (the v19 census
   reproduces every one of the 20 image-wide family call sites). */
struct IsaacLuaRegisterFieldEntry {
  uint32_t name_va;
  uint32_t arg1;
  uint32_t arg2;
  uint32_t call_va;
  uint32_t builder_va;
};

static const IsaacLuaRegisterFieldEntry kVectorFields[] = {
    {0x00b6a748u, 0x00000000u, 0x00000001u, 0x00866c86u, 0x00875230u}, /* X */
    {0x00b6d134u, 0x00000004u, 0x00000001u, 0x00866c96u, 0x00875230u}, /* Y */
};

static const int32_t kVectorInstallCount =
    (int32_t)(sizeof(kVectorInstalls) / sizeof(kVectorInstalls[0]));
static const int32_t kVectorFieldCount =
    (int32_t)(sizeof(kVectorFields) / sizeof(kVectorFields[0]));

static int32_t vector_install_in_range(int32_t index) {
  return (index >= 0 && index < kVectorInstallCount) ? 1 : 0;
}

static int32_t vector_field_in_range(int32_t index) {
  return (index >= 0 && index < kVectorFieldCount) ? 1 : 0;
}

int32_t isaac_lua_engine_register_vector_install_count(void) {
  return kVectorInstallCount;
}

uint32_t isaac_lua_engine_register_vector_install_call_va(int32_t index) {
  return vector_install_in_range(index) ? kVectorInstalls[index].call_va : 0u;
}

uint32_t isaac_lua_engine_register_vector_install_name_va(int32_t index) {
  return vector_install_in_range(index) ? kVectorInstalls[index].name_va : 0u;
}

uint32_t isaac_lua_engine_register_vector_install_target_va(int32_t index) {
  return vector_install_in_range(index) ? kVectorInstalls[index].target_va : 0u;
}

uint32_t isaac_lua_engine_register_vector_install_helper_va(int32_t index) {
  return vector_install_in_range(index) ? kVectorInstalls[index].helper_va : 0u;
}

int32_t isaac_lua_engine_register_vector_install_is_metamethod(int32_t index) {
  return vector_install_in_range(index) ? kVectorInstalls[index].is_metamethod
                                        : -1;
}

int32_t isaac_lua_engine_register_vector_install_adjacent(int32_t index) {
  return vector_install_in_range(index) ? kVectorInstalls[index].adjacent : -1;
}

int32_t isaac_lua_engine_register_vector_field_count(void) {
  return kVectorFieldCount;
}

uint32_t isaac_lua_engine_register_vector_field_name_va(int32_t index) {
  return vector_field_in_range(index) ? kVectorFields[index].name_va : 0u;
}

uint32_t isaac_lua_engine_register_vector_field_arg1(int32_t index) {
  return vector_field_in_range(index) ? kVectorFields[index].arg1 : 0u;
}

uint32_t isaac_lua_engine_register_vector_field_arg2(int32_t index) {
  return vector_field_in_range(index) ? kVectorFields[index].arg2 : 0u;
}

/* ---- ABI v16 — RegisterClasses branch + tail + per-class table ---- */

uint32_t isaac_lua_engine_register_debug_byte_at_entry(
    uint32_t init_debug_arg) {
  /* PE @ 0x00860647: `mov al, byte ptr [ebp + 8]` reads only the low byte of
     the pushed dword; 0x0086064c stores that byte to engine+0x1c and
     0x0086064f calls RegisterClasses with nothing in between. */
  return init_debug_arg & 0xffu;
}

uint32_t isaac_lua_engine_init_reload_debug_arg(uint32_t stored_byte) {
  /* Reload callers @ 0x008f8c21 / 0x009b2468: `movzx eax, byte [esi+0x1c]`
     then `push eax` into the same bool parameter. */
  return stored_byte & 0xffu;
}

int32_t isaac_lua_engine_register_require_install_gate(uint32_t debug_byte) {
  /* PE @ 0x0086e461: `cmp byte ptr [ebx + 0x1c], 0` / `jne 0x0086e483`.
     The guarded record executes only when the byte compares equal to 0. */
  return (debug_byte & 0xffu) == 0u ? 1 : 0;
}

int32_t isaac_lua_engine_register_gate_complements_init(uint32_t debug_byte) {
  /* Init @ 0x008605b0 takes the debug arm when the same byte is nonzero. */
  const int32_t gate = isaac_lua_engine_register_require_install_gate(debug_byte);
  const int32_t init_debug = isaac_lua_engine_init_take_debug_path(debug_byte);
  return gate == (init_debug != 0 ? 0 : 1) ? 1 : 0;
}

uint32_t isaac_lua_engine_register_global_record_bytes(
    int32_t merged_cleanup) {
  return merged_cleanup != 0
             ? (uint32_t)ISAAC_LUA_REGISTER_GLOBAL_RECORD_BYTES_MERGED
             : (uint32_t)ISAAC_LUA_REGISTER_GLOBAL_RECORD_BYTES;
}

struct IsaacLuaRegisterGlobalEntry {
  uint32_t pushcclosure_va;
  uint32_t cfunc_va;
  uint32_t name_va;
  int32_t gated;
};

static const IsaacLuaRegisterGlobalEntry kTailGlobals[] = {
    {0x0086e449u, 0x008603d0u, 0x00b75254u, 0}, /* GetPtrHash */
    {0x0086e471u, 0x0085fec0u, 0x00b75260u, 1}, /* require (gated) */
    {0x0086e48du, 0x00860000u, 0x00b75244u, 0}, /* include */
    {0x0086e4a6u, 0x008601f0u, 0x00b7524cu, 0}, /* print */
};

static const int32_t kTailGlobalCount =
    (int32_t)(sizeof(kTailGlobals) / sizeof(kTailGlobals[0]));

static int32_t tail_global_in_range(int32_t index) {
  return (index >= 0 && index < kTailGlobalCount) ? 1 : 0;
}

int32_t isaac_lua_engine_register_global_count(void) { return kTailGlobalCount; }

uint32_t isaac_lua_engine_register_global_pushcclosure_va(int32_t index) {
  return tail_global_in_range(index) ? kTailGlobals[index].pushcclosure_va : 0u;
}

uint32_t isaac_lua_engine_register_global_cfunc_va(int32_t index) {
  return tail_global_in_range(index) ? kTailGlobals[index].cfunc_va : 0u;
}

uint32_t isaac_lua_engine_register_global_name_va(int32_t index) {
  return tail_global_in_range(index) ? kTailGlobals[index].name_va : 0u;
}

int32_t isaac_lua_engine_register_global_gated(int32_t index) {
  return tail_global_in_range(index) ? kTailGlobals[index].gated : -1;
}

int32_t isaac_lua_engine_register_global_installed(int32_t index,
                                                   uint32_t debug_byte) {
  if (tail_global_in_range(index) == 0) {
    return -1;
  }
  if (kTailGlobals[index].gated == 0) {
    return 1;
  }
  return isaac_lua_engine_register_require_install_gate(debug_byte);
}

int32_t isaac_lua_engine_register_global_installed_count(uint32_t debug_byte) {
  int32_t total = 0;
  for (int32_t i = 0; i < kTailGlobalCount; ++i) {
    if (isaac_lua_engine_register_global_installed(i, debug_byte) == 1) {
      total += 1;
    }
  }
  return total;
}

uint32_t isaac_lua_engine_register_closure_prelude_bytes(int32_t base_only) {
  /* add esp,4 + push imm8 + push L + call + mov reg,[IAT] + push imm8 +
     push imm32 + mov [eax],imm32 + push L + call. Only the two `push L`
     encodings vary. */
  const uint32_t push_l =
      base_only != 0 ? (uint32_t)ISAAC_LUA_REGISTER_RECV_LOAD_BASE_BYTES
                     : (uint32_t)ISAAC_LUA_REGISTER_RECV_LOAD_DISP8_BYTES;
  return (uint32_t)ISAAC_LUA_REGISTER_CLOSURE_PRELUDE_FIXED_BYTES + push_l +
         push_l;
}

uint32_t isaac_lua_engine_register_install_next_call_va_after_prelude(
    uint32_t prev_call_va, int32_t prelude_base_only, int32_t recv_base_only) {
  /* previous call end (+5) + prelude + record, minus the trailing 5 bytes of
     the next call itself — the two 5s cancel. */
  return (uint32_t)(prev_call_va +
                    isaac_lua_engine_register_closure_prelude_bytes(
                        prelude_base_only) +
                    isaac_lua_engine_register_install_record_bytes(
                        recv_base_only));
}

/* Named class registrations, in PE order. Names are the literal .rdata
   strings the PE passes to the create helper. */
struct IsaacLuaRegisterClassEntry {
  uint32_t name_va;
  uint32_t create_helper_va;
  uint32_t create_call_va;
  int32_t populated;
  int32_t install_count;
  const IsaacLuaRegisterInstallEntry *installs;
  int32_t field_count;
  uint32_t field_helper_va;
  const IsaacLuaRegisterFieldEntry *fields;
};

static const IsaacLuaRegisterInstallEntry kEntityPtrInstalls[] = {
    {0x008669d3u, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
    {0x008669e8u, 0x00b701f0u, 0x00872050u, 0x008a06a0u, 0, 1}, /* SetReference */
};

static const IsaacLuaRegisterInstallEntry kKColorInstalls[] = {
    {0x00866d1bu, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
};

/* ABI v17 — recovered from the proven class-span rule (span = own create
   call .. next create call; every install in the span uses the slot the
   create `lea ecx, [ebp-slot]` wrote; 13/13 and 10/10 agreement). */
static const IsaacLuaRegisterInstallEntry kFontRenderSettingsInstalls[] = {
    {0x00866da2u, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
    {0x00866db7u, 0x00b702d8u, 0x00a1a5c0u, 0x0089fe80u, 0, 1}, /* SetAlignment */
    {0x00866dccu, 0x00b702a0u, 0x0040c3a0u, 0x0089fde0u, 0, 1}, /* GetAlignment */
    {0x00866de1u, 0x00b702b0u, 0x00a1a5d0u, 0x0089fd80u, 0, 1}, /* SetMaxCharacters */
    {0x00866df6u, 0x00b70394u, 0x00a1a5e0u, 0x0089fce0u, 0, 1}, /* GetMaxCharacters */
    {0x00866e0bu, 0x00b703a8u, 0x0085e450u, 0x0089fd80u, 0, 1}, /* EnableAutoWrap */
    {0x00866e20u, 0x00b7036cu, 0x00a1a5f0u, 0x0089fc40u, 0, 1}, /* IsAutoWrapEnabled */
    {0x00866e35u, 0x00b70380u, 0x00a1a600u, 0x0089fd80u, 0, 1}, /* EnableTruncation */
    {0x00866e4au, 0x00b70340u, 0x00a1a620u, 0x0089fc40u, 0, 1}, /* IsTruncationEnabled */
    {0x00866e5fu, 0x00b70354u, 0x00407280u, 0x0089fbe0u, 0, 1}, /* SetLineHeightModifier */
    {0x00866e74u, 0x00b7030cu, 0x00407270u, 0x0089fb40u, 0, 1}, /* GetLineHeightModifier */
    {0x00866e89u, 0x00b70324u, 0x00a1a630u, 0x0089fae0u, 0, 1}, /* SetMissingCharacterOverride */
    {0x00866e9eu, 0x00b70408u, 0x0040c2e0u, 0x0089fa40u, 0, 1}, /* GetMissingCharacterOverride */
};

static const IsaacLuaRegisterInstallEntry kFontInstalls[] = {
    {0x00866ee7u, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
    {0x00866efcu, 0x00b703f8u, 0x0085e470u, 0x0089f9e0u, 0, 1}, /* Load */
    {0x00866f11u, 0x00b70400u, 0x00a1ad90u, 0x0089f980u, 0, 1}, /* Unload */
    {0x00866f26u, 0x00b703d8u, 0x006b83d0u, 0x0089f8e0u, 0, 1}, /* IsLoaded */
    {0x00866f3bu, 0x00b703e4u, 0x00a1ae70u, 0x0089f840u, 0, 1}, /* GetCharacterWidth */
    {0x00866f50u, 0x00b703b8u, 0x00a1ae80u, 0x0089f7a0u, 0, 1}, /* GetStringWidth */
    {0x00866f65u, 0x00b703c8u, 0x00a1aea0u, 0x0089f700u, 0, 1}, /* GetLineHeight */
    {0x00866f7au, 0x00b70454u, 0x00a1aeb0u, 0x0089f700u, 0, 1}, /* GetBaselineHeight */
    {0x00866f8fu, 0x00b70468u, 0x00a1b140u, 0x0089f660u, 0, 1}, /* DrawString */
    {0x00866fa4u, 0x00b7043cu, 0x00a1b3b0u, 0x0089f600u, 0, 1}, /* SetMissingCharacter */
};

static const IsaacLuaRegisterFieldEntry kKColorFields[] = {
    {0x00b6d1ccu, 0x0000000cu, 0x00000001u, 0x00866d2fu, 0x008753a0u}, /* Alpha */
    {0x00b633c4u, 0x00000000u, 0x00000001u, 0x00866d3fu, 0x008753a0u}, /* Red */
    {0x00b702f0u, 0x00000004u, 0x00000001u, 0x00866d4fu, 0x008753a0u}, /* Green */
    {0x00b634c0u, 0x00000008u, 0x00000001u, 0x00866d5fu, 0x008753a0u}, /* Blue */
};

/* ---- ABI v19 — Color and Sprite, populated via the property-builder
   return contract (receiver walk: 14/14 and 45/45 resolved, 0 unresolved).
   Install rows are the machine-extracted (edx, push) operand pairs; field
   rows are the family call sites with their 3 pushed args. ---- */

static const IsaacLuaRegisterInstallEntry kColorInstalls[] = {
    {0x00867077u, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
    {0x00867128u, 0x00b1ce7cu, 0x00682ed0u, 0x0089f4a0u, 0, 0}, /* Reset */
    {0x0086713cu, 0x00b704b4u, 0x00682f20u, 0x0089f440u, 0, 1}, /* SetTint */
    {0x00867150u, 0x00b704bcu, 0x00682fb0u, 0x0089f440u, 0, 1}, /* SetColorize */
    {0x00867164u, 0x00b704a0u, 0x00682fe0u, 0x0089f3e0u, 0, 1}, /* SetOffset */
    /* after closure prelude B (0x00867169); v16 after-prelude law lands
       0x00867164 -> 0x00867198 exactly. rawsetfield form (edx = -2). */
    {0x00867198u, 0x00b70244u, 0x00000000u, 0x0085bf90u, 1, 0}, /* Lerp */
    {0x008671acu, 0x00b70258u, 0x006831c0u, 0x0089f250u, 0, 1}, /* __mul */
};

static const IsaacLuaRegisterInstallEntry kSpriteInstalls[] = {
    {0x0086723du, 0x00b75378u, 0x00000000u, 0x0085bf90u, 1, 0}, /* __call */
    {0x00867252u, 0x00b7048cu, 0x0040a530u, 0x0089f1b0u, 0, 1}, /* IsFinished */
    {0x00867267u, 0x00b70498u, 0x0040a360u, 0x0089f150u, 0, 1}, /* Play */
    {0x0086727cu, 0x00b70474u, 0x0040a690u, 0x0089f0f0u, 0, 1}, /* SetFrame */
    {0x00867291u, 0x00b70480u, 0x0040a720u, 0x0089f090u, 0, 1}, /* SetFrame_1 */
    {0x008672a6u, 0x00b1ce7cu, 0x00407f10u, 0x0089f030u, 0, 1}, /* Reset */
    {0x008672bbu, 0x00b70518u, 0x00409100u, 0x0089f030u, 0, 1}, /* Update */
    {0x008672d0u, 0x00b70520u, 0x0040a0d0u, 0x0089efd0u, 0, 1}, /* Render */
    {0x008672e5u, 0x00b70504u, 0x0040a140u, 0x0089ef70u, 0, 1}, /* RenderLayer */
    {0x008672fau, 0x00b703f8u, 0x0040bd50u, 0x0089f150u, 0, 1}, /* Load */
    {0x0086730fu, 0x00b70510u, 0x0040bea0u, 0x0089f030u, 0, 1}, /* Reload */
    {0x00867324u, 0x00b704e0u, 0x0040bf30u, 0x0089ef10u, 0, 1}, /* ReplaceSpritesheet */
    {0x00867339u, 0x00b704f4u, 0x0040bff0u, 0x0089f030u, 0, 1}, /* LoadGraphics */
    {0x0086734eu, 0x00b703d8u, 0x00420160u, 0x0089ee70u, 0, 1}, /* IsLoaded */
    {0x00867363u, 0x00b704c8u, 0x004312e0u, 0x0089edd0u, 0, 1}, /* GetFilename */
    {0x00867378u, 0x00b704d4u, 0x0040a2b0u, 0x0089ed70u, 0, 1}, /* PlayRandom */
    {0x0086738du, 0x00b1d6f4u, 0x0040a910u, 0x0089f030u, 0, 1}, /* Stop */
    {0x008673a2u, 0x00b70590u, 0x0040a5b0u, 0x0089ed10u, 0, 1}, /* SetAnimation */
    {0x008673b7u, 0x00b705a0u, 0x0040a780u, 0x0089ec70u, 0, 1}, /* GetFrame */
    {0x008673ccu, 0x00b70574u, 0x0040a760u, 0x0089f030u, 0, 1}, /* SetLastFrame */
    {0x008673e1u, 0x00b70584u, 0x0040a4b0u, 0x0089f1b0u, 0, 1}, /* IsPlaying */
    {0x008673f6u, 0x00b70558u, 0x0040a7e0u, 0x0089ec10u, 0, 1}, /* SetLayerFrame */
    {0x0086740bu, 0x00b70568u, 0x0040a920u, 0x0089f150u, 0, 1}, /* PlayOverlay */
    {0x00867420u, 0x00b70528u, 0x0040aad0u, 0x0089ed10u, 0, 1}, /* SetOverlayAnimation */
    {0x00867435u, 0x00b7053cu, 0x00431300u, 0x0089ebb0u, 0, 1}, /* SetOverlayRenderPriority */
    {0x0086744au, 0x00b7061cu, 0x0040abb0u, 0x0089f0f0u, 0, 1}, /* SetOverlayFrame */
    {0x0086745fu, 0x00b7062cu, 0x0040ac50u, 0x0089eb50u, 0, 1}, /* GetOverlayFrame */
    {0x00867474u, 0x00b705f8u, 0x0040ac60u, 0x0089f030u, 0, 1}, /* RemoveOverlay */
    {0x00867489u, 0x00b70608u, 0x0040a9d0u, 0x0089f1b0u, 0, 1}, /* IsOverlayPlaying */
    {0x0086749eu, 0x00b705d0u, 0x0040aa50u, 0x0089f1b0u, 0, 1}, /* IsOverlayFinished */
    {0x008674b3u, 0x00b705e4u, 0x0040b000u, 0x0089f1b0u, 0, 1}, /* IsEventTriggered */
    {0x008674c8u, 0x00b705acu, 0x0040b060u, 0x0089f1b0u, 0, 1}, /* WasEventTriggered */
    {0x008674ddu, 0x00b705c0u, 0x00440e40u, 0x0089eab0u, 0, 1}, /* GetLayerCount */
    {0x008674f2u, 0x00b7068cu, 0x004a5cf0u, 0x0089ea10u, 0, 1}, /* GetDefaultAnimationName */
    /* after the Offset/Scale/Rotation/Color property chain; [esi] receiver */
    {0x00867561u, 0x00b70678u, 0x0040b590u, 0x0089e610u, 0, 0}, /* GetTexel */
    /* after the FlipX/FlipY/PlaybackSpeed property chain; [esi] receiver */
    {0x008675b9u, 0x00b7063cu, 0x004a5cf0u, 0x0089ea10u, 0, 0}, /* GetDefaultAnimation */
    {0x008675cdu, 0x00b70650u, 0x0085db20u, 0x0089edd0u, 0, 1}, /* GetAnimation */
    {0x008675e1u, 0x00b706f0u, 0x0085db70u, 0x0089edd0u, 0, 1}, /* GetOverlayAnimation */
};

static const IsaacLuaRegisterFieldEntry kColorFields[] = {
    {0x00b70450u, 0x00407240u, 0x005cd370u, 0x00867091u, 0x00875510u}, /* R */
    {0x00b70434u, 0x00407250u, 0x005cd380u, 0x008670a7u, 0x00875510u}, /* G */
    {0x00b6d178u, 0x00407260u, 0x005cd3a0u, 0x008670bdu, 0x00875510u}, /* B */
    {0x00b6d17cu, 0x00407270u, 0x00407280u, 0x008670d3u, 0x00875510u}, /* A */
    {0x00b70438u, 0x004072b0u, 0x005cd3d0u, 0x008670e9u, 0x00875510u}, /* RO */
    {0x00b7042cu, 0x004072c0u, 0x005cd3f0u, 0x008670ffu, 0x00875510u}, /* GO */
    {0x00b70430u, 0x004072d0u, 0x005cd410u, 0x00867115u, 0x00875510u}, /* BO */
};

static const IsaacLuaRegisterFieldEntry kSpriteFields[] = {
    {0x00b6c978u, 0x0049cb40u, 0x00456340u, 0x0086750cu, 0x00875680u}, /* Offset */
    {0x00b706a4u, 0x00417200u, 0x00420170u, 0x00867522u, 0x00875680u}, /* Scale */
    {0x00b1b4ccu, 0x00417210u, 0x0043ee80u, 0x00867538u, 0x008757f0u}, /* Rotation */
    /* the folded member: the caller pushes exactly the folded immediates */
    {0x00b6508cu, 0x00407410u, 0x004073d0u, 0x0086754eu, 0x00875960u}, /* Color */
    {0x00b70684u, 0x00407420u, 0x00435c60u, 0x0086757au, 0x00875ae0u}, /* FlipX */
    {0x00b70660u, 0x00407430u, 0x00505b50u, 0x00867590u, 0x00875ae0u}, /* FlipY */
    {0x00b70668u, 0x00456360u, 0x00440e50u, 0x008675a6u, 0x008757f0u}, /* PlaybackSpeed */
};

static const IsaacLuaRegisterClassEntry kClasses[] = {
    {0x00b701e4u, 0x008a7e10u, 0x008669a8u, 1, 2, kEntityPtrInstalls, 0, 0u,
     (const IsaacLuaRegisterFieldEntry *)0}, /* EntityPtr */
    {0x00b701dcu, 0x008a7c00u, 0x00866a5du, 1, 23, kVectorInstalls, 2,
     0x00875230u, kVectorFields}, /* Vector */
    {0x00b702e8u, 0x008a79f0u, 0x00866cf6u, 1, 1, kKColorInstalls, 4,
     0x008753a0u, kKColorFields}, /* KColor */
    {0x00b702c4u, 0x008a77e0u, 0x00866d7du, 1, 13, kFontRenderSettingsInstalls,
     0, 0u, (const IsaacLuaRegisterFieldEntry *)0}, /* FontRenderSettings */
    {0x00b70424u, 0x008a75d0u, 0x00866ec2u, 1, 10, kFontInstalls, 0, 0u,
     (const IsaacLuaRegisterFieldEntry *)0}, /* Font */
    /* ABI v19: populated via the property-builder return contract
       (receiver walk 14/14 resolved). Field helper 0x00875510 for all 7. */
    {0x00b6508cu, 0x008a73c0u, 0x00867052u, 1, 7, kColorInstalls, 7,
     0x00875510u, kColorFields}, /* Color */
    /* ABI v19: populated (receiver walk 45/45 resolved). Heterogeneous
       builders — class-level field helper stays 0; per-entry builder_va
       carries the real one. */
    {0x00b704acu, 0x008a71b0u, 0x00867218u, 1, 38, kSpriteInstalls, 7, 0u,
     kSpriteFields}, /* Sprite */
    {0x00b70704u, 0x008a6fa0u, 0x0086764du, 0, 0,
     (const IsaacLuaRegisterInstallEntry *)0, 0, 0u,
     (const IsaacLuaRegisterFieldEntry *)0}, /* EntityRef */
};

static const int32_t kClassCount =
    (int32_t)(sizeof(kClasses) / sizeof(kClasses[0]));

static const IsaacLuaRegisterClassEntry *class_at(int32_t cls) {
  return (cls >= 0 && cls < kClassCount) ? &kClasses[cls]
                                         : (const IsaacLuaRegisterClassEntry *)0;
}

static const IsaacLuaRegisterInstallEntry *class_install_at(int32_t cls,
                                                            int32_t index) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  if (c == 0 || c->installs == 0 || index < 0 || index >= c->install_count) {
    return (const IsaacLuaRegisterInstallEntry *)0;
  }
  return &c->installs[index];
}

static const IsaacLuaRegisterFieldEntry *class_field_at(int32_t cls,
                                                        int32_t index) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  if (c == 0 || c->fields == 0 || index < 0 || index >= c->field_count) {
    return (const IsaacLuaRegisterFieldEntry *)0;
  }
  return &c->fields[index];
}

int32_t isaac_lua_engine_register_class_count(void) { return kClassCount; }

uint32_t isaac_lua_engine_register_class_name_va(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->name_va : 0u;
}

uint32_t isaac_lua_engine_register_class_create_helper_va(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->create_helper_va : 0u;
}

uint32_t isaac_lua_engine_register_class_create_call_va(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->create_call_va : 0u;
}

int32_t isaac_lua_engine_register_class_populated(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->populated : -1;
}

int32_t isaac_lua_engine_register_class_install_count(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->install_count : -1;
}

uint32_t isaac_lua_engine_register_class_install_call_va(int32_t cls,
                                                         int32_t index) {
  const IsaacLuaRegisterInstallEntry *e = class_install_at(cls, index);
  return e != 0 ? e->call_va : 0u;
}

uint32_t isaac_lua_engine_register_class_install_name_va(int32_t cls,
                                                         int32_t index) {
  const IsaacLuaRegisterInstallEntry *e = class_install_at(cls, index);
  return e != 0 ? e->name_va : 0u;
}

uint32_t isaac_lua_engine_register_class_install_target_va(int32_t cls,
                                                           int32_t index) {
  const IsaacLuaRegisterInstallEntry *e = class_install_at(cls, index);
  return e != 0 ? e->target_va : 0u;
}

uint32_t isaac_lua_engine_register_class_install_helper_va(int32_t cls,
                                                           int32_t index) {
  const IsaacLuaRegisterInstallEntry *e = class_install_at(cls, index);
  return e != 0 ? e->helper_va : 0u;
}

int32_t isaac_lua_engine_register_class_install_is_metamethod(int32_t cls,
                                                              int32_t index) {
  const IsaacLuaRegisterInstallEntry *e = class_install_at(cls, index);
  return e != 0 ? e->is_metamethod : -1;
}

int32_t isaac_lua_engine_register_class_install_adjacent(int32_t cls,
                                                         int32_t index) {
  const IsaacLuaRegisterInstallEntry *e = class_install_at(cls, index);
  return e != 0 ? e->adjacent : -1;
}

int32_t isaac_lua_engine_register_class_field_count(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->field_count : -1;
}

uint32_t isaac_lua_engine_register_class_field_helper_va(int32_t cls) {
  const IsaacLuaRegisterClassEntry *c = class_at(cls);
  return c != 0 ? c->field_helper_va : 0u;
}

uint32_t isaac_lua_engine_register_class_field_name_va(int32_t cls,
                                                       int32_t index) {
  const IsaacLuaRegisterFieldEntry *e = class_field_at(cls, index);
  return e != 0 ? e->name_va : 0u;
}

uint32_t isaac_lua_engine_register_class_field_arg1(int32_t cls,
                                                    int32_t index) {
  const IsaacLuaRegisterFieldEntry *e = class_field_at(cls, index);
  return e != 0 ? e->arg1 : 0u;
}

uint32_t isaac_lua_engine_register_class_field_arg2(int32_t cls,
                                                    int32_t index) {
  const IsaacLuaRegisterFieldEntry *e = class_field_at(cls, index);
  return e != 0 ? e->arg2 : 0u;
}

/* ---- ABI v17 — class-create template family arithmetic ---- */

static int32_t class_index_in_range(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_CLASS_CREATE_TEMPLATE_COUNT) ? 1 : 0;
}

uint32_t isaac_lua_engine_class_create_helper_va_for_index(int32_t index) {
  if (class_index_in_range(index) == 0) {
    return 0u;
  }
  return (uint32_t)((uint32_t)ISAAC_LUA_CLASS_CREATE_HELPER_BASE_VA -
                    (uint32_t)ISAAC_LUA_CLASS_CREATE_HELPER_STRIDE *
                        (uint32_t)index);
}

uint32_t isaac_lua_engine_class_create_gc_closure_va_for_index(int32_t index) {
  if (class_index_in_range(index) == 0) {
    return 0u;
  }
  return (uint32_t)((uint32_t)ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA -
                    (uint32_t)ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_STRIDE *
                        (uint32_t)index);
}

uint32_t isaac_lua_engine_class_create_registry_key_for_index(int32_t index,
                                                              int32_t rel) {
  /* The template pushes key(-3) with pushvalue(-3), key(-2) with
     pushvalue(-2) and key(-1) with pushvalue(-1); the triple is
     consecutive, base at rel = -3. */
  if (class_index_in_range(index) == 0 || rel > -1 || rel < -3) {
    return 0u;
  }
  return (uint32_t)((uint32_t)ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_BASE +
                    (uint32_t)ISAAC_LUA_CLASS_CREATE_REGISTRY_KEY_STRIDE *
                        (uint32_t)index +
                    (uint32_t)(int32_t)(rel + 3));
}

int32_t isaac_lua_engine_class_create_index_for_helper_va(uint32_t helper_va) {
  uint32_t delta;
  if (helper_va > (uint32_t)ISAAC_LUA_CLASS_CREATE_HELPER_BASE_VA) {
    return -1;
  }
  delta = (uint32_t)ISAAC_LUA_CLASS_CREATE_HELPER_BASE_VA - helper_va;
  if (delta % (uint32_t)ISAAC_LUA_CLASS_CREATE_HELPER_STRIDE != 0u) {
    return -1;
  }
  delta /= (uint32_t)ISAAC_LUA_CLASS_CREATE_HELPER_STRIDE;
  if (delta >= (uint32_t)ISAAC_LUA_CLASS_CREATE_TEMPLATE_COUNT) {
    return -1;
  }
  return (int32_t)delta;
}

int32_t isaac_lua_engine_class_create_index_for_gc_closure_va(uint32_t va) {
  uint32_t delta;
  if (va > (uint32_t)ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA) {
    return -1;
  }
  delta = (uint32_t)ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_BASE_VA - va;
  if (delta % (uint32_t)ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_STRIDE != 0u) {
    return -1;
  }
  delta /= (uint32_t)ISAAC_LUA_CLASS_CREATE_GC_CLOSURE_STRIDE;
  if (delta >= (uint32_t)ISAAC_LUA_CLASS_CREATE_TEMPLATE_COUNT) {
    return -1;
  }
  return (int32_t)delta;
}

uint32_t isaac_lua_engine_register_class_gc_closure_va(int32_t cls) {
  return isaac_lua_engine_class_create_gc_closure_va_for_index(cls);
}

uint32_t isaac_lua_engine_register_class_registry_key(int32_t cls,
                                                      int32_t rel) {
  return isaac_lua_engine_class_create_registry_key_for_index(cls, rel);
}

int32_t isaac_lua_engine_register_class_span_status(int32_t cls) {
  if (class_at(cls) == 0) {
    return -1;
  }
  if (cls == ISAAC_LUA_CLASS_COLOR || cls == ISAAC_LUA_CLASS_SPRITE) {
    return ISAAC_LUA_CLASS_SPAN_MIXED_RECEIVER;
  }
  if (cls == ISAAC_LUA_CLASS_ENTITYREF) {
    return ISAAC_LUA_CLASS_SPAN_NO_SUCCESSOR;
  }
  return ISAAC_LUA_CLASS_SPAN_OK;
}

int32_t isaac_lua_engine_register_class_receiver_clean(int32_t cls) {
  const int32_t status = isaac_lua_engine_register_class_span_status(cls);
  if (status < 0) {
    return -1;
  }
  /* EntityRef's installs do agree with its slot; only its upper bound is
     unproven, so it counts as receiver-clean but stays unpopulated. */
  return status == ISAAC_LUA_CLASS_SPAN_MIXED_RECEIVER ? 0 : 1;
}

/* ---- ABI v42 — class-create template BODY control flow (8 sites) ----
 *
 * The template BODY (0x8a7e10 - 0x210*r, first ret @ 0x8a8017, ret 8) is
 * identical in all 8 instances; the 25 variant bytes are the v17 immediates
 * (name VA / __gc closure VA / registry keys), all covered by the v17 laws.
 * The body CF transcribed from the PE instruction stream of 0x008a7e10:
 *   prologue nest (v5 law by reference) -> gate absindex/pushstring(name)/
 *   rawget/lua_type(L,-1) FULL-WORD test eax,eax; jne ALREADY ->
 *   CREATE arm: settop(-2) once; 3 iterations: builder k(name) then, for
 *   iterations 1..2, the __gc record (pushcclosure(gc,0) + absindex(-2) +
 *   pushstring("__gc") + rotate(-2,1) + rawset); iteration 3 instead does
 *   pushvalue(-k)/rawsetp(REGISTRYINDEX, key rel -k) for k = 1..3 ->
 *   ALREADY arm: __class/__const rawget pair + rotate(-3,1)/rotate(-2,1) ->
 *   epilogue return this ; ret 8.
 * ----------------------------------------------------------------------- */

static const uint32_t kClassCreateNames[ISAAC_LUA_CLASS_CREATE_TEMPLATE_COUNT] = {
    0x00b701e4u, /* EntityPtr */
    0x00b701dcu, /* Vector */
    0x00b702e8u, /* KColor */
    0x00b702c4u, /* FontRenderSettings */
    0x00b70424u, /* Font */
    0x00b6508cu, /* Color */
    0x00b704acu, /* Sprite */
    0x00b70704u, /* EntityRef */
};

static const uint32_t kClassCreateBuilders[ISAAC_LUA_CLASS_CREATE_CREATE_ITERATIONS] = {
    0x0085d040u, /* iteration 1: metatable builder A (const metatable) */
    0x0085d2c0u, /* iteration 2: metatable builder B (class metatable) */
    0x0085d500u, /* iteration 3: metatable builder C (static metatable) */
};

static int32_t class_create_iteration_in_range(int32_t iteration) {
  return (iteration >= 1 &&
          iteration <= ISAAC_LUA_CLASS_CREATE_CREATE_ITERATIONS)
             ? 1
             : 0;
}

uint32_t isaac_lua_engine_class_create_body_bytes(void) {
  /* 0x8a8017 - 0x8a7e10 = 0x207 to the first (only) ret; 0x210 to the
     next function (the 9 int3 pad bytes are not part of the body). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_BODY_BYTES;
}

uint32_t isaac_lua_engine_class_create_first_ret_va(void) {
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_FIRST_RET_VA;
}

uint32_t isaac_lua_engine_class_create_ret_args(void) {
  /* PE: `c2 08 00` at 0x8a8017 - two stack args (this src + src stack-ref). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_RET_ARGS;
}

uint32_t isaac_lua_engine_class_create_name_va_for_index(int32_t index) {
  if (class_index_in_range(index) == 0) {
    return 0u;
  }
  return kClassCreateNames[index];
}

int32_t isaac_lua_engine_class_create_arm_select(uint32_t type) {
  /* PE 0x8a7e85: call lua_type(L,-1); 0x8a7e8e: test eax,eax; 0x8a7e90:
     jne 0x8a7fa6 (ALREADY). FULL-WORD test - 0x100 IS ALREADY, a low-byte
     read would wrongly send it to CREATE. lua_type returns LUA_TNIL = 0
     for a not-yet-registered class. */
  return type != 0u ? ISAAC_LUA_CLASS_CREATE_ARM_ALREADY
                    : ISAAC_LUA_CLASS_CREATE_ARM_CREATE;
}

int32_t isaac_lua_engine_class_create_create_iterations(void) {
  return ISAAC_LUA_CLASS_CREATE_CREATE_ITERATIONS;
}

uint32_t isaac_lua_engine_class_create_create_entry_settop_index(void) {
  /* PE 0x8a7e96: push -2; push [ebx]; call lua_settop - pops the rawget
     result once, before builder A. */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_CREATE_ENTRY_SETTOP_INDEX_U32;
}

uint32_t isaac_lua_engine_class_create_iteration_builder_va(int32_t iteration) {
  if (class_create_iteration_in_range(iteration) == 0) {
    return 0u;
  }
  return kClassCreateBuilders[iteration - 1];
}

int32_t isaac_lua_engine_class_create_iteration_has_gc_record(
    int32_t iteration) {
  if (class_create_iteration_in_range(iteration) == 0) {
    return -1;
  }
  /* PE: the pushcclosure(gc)/__gc rawset record follows builders A and B
     (0x8a7eb8 / 0x8a7f0d); builder C (0x8a7f4e) is followed directly by
     the pushvalue/rawsetp key stores. */
  return iteration <= ISAAC_LUA_CLASS_CREATE_GC_RECORD_ITERATIONS ? 1 : 0;
}

uint32_t isaac_lua_engine_class_create_iteration_gc_closure_va(
    int32_t iteration, int32_t index) {
  if (class_create_iteration_in_range(iteration) == 0 ||
      iteration > ISAAC_LUA_CLASS_CREATE_GC_RECORD_ITERATIONS) {
    return 0u;
  }
  return isaac_lua_engine_class_create_gc_closure_va_for_index(index);
}

uint32_t isaac_lua_engine_class_create_iteration_absindex_index(void) {
  /* PE 0x8a7ec3 / 0x8a7f18: push -2 before lua_absindex in the __gc record. */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ITERATION_ABSINDEX_INDEX_U32;
}

uint32_t isaac_lua_engine_class_create_iteration_rotate_index(void) {
  /* PE 0x8a7edc / 0x8a7f31: rotate(L, -2, 1). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ITERATION_ROTATE_INDEX_U32;
}

int32_t isaac_lua_engine_class_create_iteration_rotate_n(void) {
  return ISAAC_LUA_CLASS_CREATE_ITERATION_ROTATE_N;
}

int32_t isaac_lua_engine_class_create_iteration_store_rel(int32_t iteration) {
  if (class_create_iteration_in_range(iteration) == 0) {
    return 0;
  }
  /* pushvalue(-k) stores the key at rel -k, k = 1..3 (PE order: -1 first,
     then -2, then -3). */
  return -iteration;
}

uint32_t isaac_lua_engine_class_create_iteration_pushvalue_index(
    int32_t iteration) {
  if (class_create_iteration_in_range(iteration) == 0) {
    return 0u;
  }
  return (uint32_t)(int32_t)(-iteration);
}

uint32_t isaac_lua_engine_class_create_iteration_registry_key(
    int32_t iteration, int32_t index) {
  if (class_create_iteration_in_range(iteration) == 0) {
    return 0u;
  }
  return isaac_lua_engine_class_create_registry_key_for_index(index,
                                                              -iteration);
}

uint32_t isaac_lua_engine_class_create_already_absindex_index(void) {
  /* PE 0x8a7fa8 / 0x8a7fc9: absindex(L, -1) for each __class/__const rawget. */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ALREADY_ABSINDEX_INDEX_U32;
}

uint32_t isaac_lua_engine_class_create_already_class_key_va(void) {
  /* PE 0x8a7fb1: push 0xb6ea70 - "__class" (rdata, verified). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_META_CLASS_NAME_VA;
}

uint32_t isaac_lua_engine_class_create_already_const_key_va(void) {
  /* PE 0x8a7fd2: push 0xb6e9c4 - "__const" (rdata, verified). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_META_CONST_NAME_VA;
}

uint32_t isaac_lua_engine_class_create_already_rotate_index_a(void) {
  /* PE 0x8a7ff0: rotate(L, -3, 1). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_A_U32;
}

uint32_t isaac_lua_engine_class_create_already_rotate_index_b(void) {
  /* PE 0x8a7ffb: rotate(L, -2, 1). */
  return (uint32_t)ISAAC_LUA_CLASS_CREATE_ALREADY_ROTATE_INDEX_B_U32;
}

int32_t isaac_lua_engine_class_create_already_rotate_n(void) {
  return ISAAC_LUA_CLASS_CREATE_ALREADY_ROTATE_N;
}

/* ---------------------------------------------------------------------
   ABI v43 — std::vector<T>::at family (3 compiled sites, one template).

   Bodies 0x008a8020 / 0x008a8050 / 0x008a8080, all MSVC bounds-checked
   vector at(): byte_count = end-begin (32-bit wrap) ; size = SAR(byte_count,
   log2(stride)) ; cmp/jbe UNSIGNED against index ; lea begin + index*stride ;
   ret 4 (c2 04 00) ; OOB path calls 0x008ba150 (std::_Xout_of_range throw,
   noreturn — host). Stride(site) = 16 >> site; shift(site) = 4 - site.
   --------------------------------------------------------------------- */

namespace {

constexpr uint32_t kAtVaForSite(int32_t site) {
  return (uint32_t)ISAAC_LUA_AT_TEMPLATE_BASE_VA +
         (uint32_t)((uint32_t)site * ISAAC_LUA_AT_TEMPLATE_STRIDE_VA);
}

constexpr uint32_t kAtFirstRetForSite(int32_t site) {
  switch (site) {
    case 0:
      return (uint32_t)ISAAC_LUA_AT_FIRST_RET_0_VA;
    case 1:
      return (uint32_t)ISAAC_LUA_AT_FIRST_RET_1_VA;
    case 2:
      return (uint32_t)ISAAC_LUA_AT_FIRST_RET_2_VA;
    default:
      return 0u;
  }
}

int32_t at_site_in_range(int32_t site) {
  return (site >= 0 && site < ISAAC_LUA_AT_TEMPLATE_COUNT) ? 1 : 0;
}

}  // namespace

int32_t isaac_lua_engine_at_count(void) {
  return ISAAC_LUA_AT_TEMPLATE_COUNT;
}

uint32_t isaac_lua_engine_at_va_for_index(int32_t index) {
  return at_site_in_range(index) != 0 ? kAtVaForSite(index) : 0u;
}

int32_t isaac_lua_engine_at_stride_for_index(int32_t index) {
  /* PE sar imm per site: 16>>0 = 16 (sar 4), 16>>1 = 8 (sar 3),
     16>>2 = 4 (sar 2); lea scaling matches (ecx*8 + add / ecx*8 / ecx*4). */
  return at_site_in_range(index) != 0 ? (ISAAC_LUA_AT_STRIDE_BASE >> index) : 0;
}

int32_t isaac_lua_engine_at_shift_for_index(int32_t index) {
  /* sar imm = log2(stride) = 4 - site (4, 3, 2 at 0x8a802d / 0x8a805d /
     0x8a808d). */
  return at_site_in_range(index) != 0 ? (ISAAC_LUA_AT_SHIFT_BASE - index) : 0;
}

uint32_t isaac_lua_engine_at_first_ret_va_for_index(int32_t index) {
  /* Site 0 carries an extra `add ecx,ecx` (lea x8 for stride 16), so its
     first ret is only 0x2e after site 0; sites 1..2 are 0x18-byte bodies. */
  return at_site_in_range(index) != 0 ? kAtFirstRetForSite(index) : 0u;
}

uint32_t isaac_lua_engine_at_body_bytes_for_index(int32_t index) {
  /* first ret - body VA: 0x1a / 0x18 / 0x18 (ret 4 excluded, same
     convention as the class-create 0x207). */
  if (at_site_in_range(index) == 0) {
    return 0u;
  }
  return kAtFirstRetForSite(index) - kAtVaForSite(index);
}

int32_t isaac_lua_engine_at_index_for_va(uint32_t va) {
  uint32_t delta;
  if (va < (uint32_t)ISAAC_LUA_AT_TEMPLATE_BASE_VA) {
    return -1;
  }
  delta = va - (uint32_t)ISAAC_LUA_AT_TEMPLATE_BASE_VA;
  if (delta % ISAAC_LUA_AT_TEMPLATE_STRIDE_VA != 0u ||
      delta / ISAAC_LUA_AT_TEMPLATE_STRIDE_VA >=
          (uint32_t)ISAAC_LUA_AT_TEMPLATE_COUNT) {
    return -1;
  }
  return (int32_t)(delta / ISAAC_LUA_AT_TEMPLATE_STRIDE_VA);
}

int32_t isaac_lua_engine_at_ret_args(void) {
  /* PE `c2 04 00` @ 0x8a803a / 0x8a8068 / 0x8a8098: this + 1 stack arg. */
  return ISAAC_LUA_AT_RET_ARGS;
}

uint32_t isaac_lua_engine_at_fatal_va(void) {
  return (uint32_t)ISAAC_LUA_AT_FATAL_VA;
}

uint32_t isaac_lua_engine_at_fatal_string_va(void) {
  /* rdata 0xb75380 = "invalid vector subscript" (raw-byte verified). */
  return (uint32_t)ISAAC_LUA_AT_FATAL_STRING_VA;
}

uint32_t isaac_lua_engine_at_fatal_iat_va(void) {
  /* MSVCP140 std::_Xout_of_range (lua-v16/iat.txt). */
  return (uint32_t)ISAAC_LUA_AT_FATAL_IAT_VA;
}

int32_t isaac_lua_engine_at_oob_noreturn(void) {
  /* call 0x8ba150 then int3: the throw never returns a value. */
  return ISAAC_LUA_AT_OOB_NORETURN;
}

uint32_t isaac_lua_engine_at_size(uint32_t byte_count, int32_t site) {
  /* PE 0x8a802d / 0x8a805d / 0x8a808d: `sar eax, imm` — SIGNED arithmetic
     shift of the wrapped 32-bit byte count. */
  if (at_site_in_range(site) == 0) {
    return 0u;
  }
  return (uint32_t)((int32_t)byte_count >>
                    (ISAAC_LUA_AT_SHIFT_BASE - site));
}

int32_t isaac_lua_engine_at_gate(uint32_t end, uint32_t begin, uint32_t index,
                                 int32_t site) {
  /* PE: sub eax,edx ; sar eax,imm ; cmp eax,ecx ; jbe OOB. The jbe is an
     UNSIGNED below-or-equal: OOB iff size <= index; in-bounds iff
     (uint32)size > (uint32)index. Full word, never a byte mask. */
  if (at_site_in_range(site) == 0) {
    return -1;
  }
  const uint32_t size = (uint32_t)((int32_t)(end - begin) >>
                                   (ISAAC_LUA_AT_SHIFT_BASE - site));
  return size > index ? 1 : 0;
}

uint32_t isaac_lua_engine_at_compute(uint32_t begin, uint32_t index,
                                     int32_t site) {
  /* PE: add ecx,ecx (site 0) / lea eax,[edx+ecx*8] (sites 0+1, stride 16/8)
     / lea eax,[edx+ecx*4] (site 2). Result = begin + index*stride with
     32-bit wrap. */
  if (at_site_in_range(site) == 0) {
    return 0u;
  }
  const uint32_t stride = (uint32_t)(ISAAC_LUA_AT_STRIDE_BASE >> site);
  return begin + index * stride;
}

/* ---------------------------------------------------------------------
   ABI v44 — LuaRef-holder destructor 0x008a80b0 (sequential body after
   the v43 at() family). See the header block for the full transcription
   and the note that the v46-handoff VA 0x008a80c0 is a misaligned decode
   of this body. The IAT luaL_unref and the shared 0x40d040 string Tidy
   stay host; here we pin the pure CF laws: member offsets, push order /
   full-word arg conduct, registryindex imm, cleanup, ret 0, reachability
   thunk sites, and the Tidy-before-unref call ordering.
   --------------------------------------------------------------------- */

namespace {

int32_t lua_ref_thunk_in_range(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_REF_DTOR_THUNK_COUNT) ? 1 : 0;
}

uint32_t kLuaRefThunkVa(int32_t index) {
  switch (index) {
    case 0:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_0_VA;
    case 1:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_1_VA;
    case 2:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_2_VA;
    default:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_3_VA;
  }
}

uint32_t kLuaRefThunkDisp(int32_t index) {
  switch (index) {
    case 0:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_0_LOCAL_DISP;
    case 1:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_1_LOCAL_DISP;
    case 2:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_2_LOCAL_DISP;
    default:
      return (uint32_t)ISAAC_LUA_REF_DTOR_THUNK_3_LOCAL_DISP;
  }
}

}  // namespace

uint32_t isaac_lua_engine_lua_ref_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_REF_DTOR_VA;
}

uint32_t isaac_lua_engine_lua_ref_dtor_ret_va(void) {
  return (uint32_t)ISAAC_LUA_REF_DTOR_RET_VA;
}

uint32_t isaac_lua_engine_lua_ref_dtor_body_bytes(void) {
  /* first ret - body VA = 0x1f (ret instruction excluded; 32 bytes
   0x8a80b0..0x8a80cf including it). */
  return (uint32_t)(ISAAC_LUA_REF_DTOR_RET_VA - ISAAC_LUA_REF_DTOR_VA);
}

int32_t isaac_lua_engine_lua_ref_dtor_insn_count(void) {
  return ISAAC_LUA_REF_DTOR_INSN_COUNT;
}

uint32_t isaac_lua_engine_lua_ref_state_off(void) {
  /* this+0: `push dword ptr [esi]` (luaL_unref arg L). */
  return (uint32_t)ISAAC_LUA_REF_OFF_STATE;
}

uint32_t isaac_lua_engine_lua_ref_ref_off(void) {
  /* this+4: `push dword ptr [esi+4]` (luaL_unref arg ref). */
  return (uint32_t)ISAAC_LUA_REF_OFF_REF;
}

uint32_t isaac_lua_engine_lua_ref_string_off(void) {
  /* this+8: `lea ecx, [esi+8]` (sub-object MSVC basic_string). */
  return (uint32_t)ISAAC_LUA_REF_OFF_STRING;
}

uint32_t isaac_lua_engine_lua_ref_dtor_string_tidy_va(void) {
  /* PE E8 @ 0x8a80b6 -> 0x0040d040 (basic_string::_Tidy). */
  return (uint32_t)ISAAC_LUA_REF_DTOR_STRING_TIDY_VA;
}

uint32_t isaac_lua_engine_lua_ref_dtor_unref_iat_va(void) {
  /* call dword ptr [0xb1831c] = Lua5.3.3r.dll!luaL_unref (iat.txt). */
  return (uint32_t)ISAAC_LUA_REF_DTOR_UNREF_IAT_VA;
}

uint32_t isaac_lua_engine_lua_ref_dtor_unref_registry_index(void) {
  /* push 0xfff0b9d8 = Lua 5.3 LUA_REGISTRYINDEX. */
  return (uint32_t)ISAAC_LUA_REF_DTOR_UNREF_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_lua_ref_dtor_stack_cleanup(void) {
  /* add esp,0xc (cdecl cleanup of the 3 pushed args). */
  return (uint32_t)ISAAC_LUA_REF_DTOR_STACK_CLEANUP;
}

uint32_t isaac_lua_engine_lua_ref_dtor_ret_args(void) {
  /* `ret` (c3): no stack args to pop (the args were pushed inside the
     body; entry comes by `jmp` from a scope-dtor thunk). */
  return (uint32_t)ISAAC_LUA_REF_DTOR_RET_ARGS;
}

int32_t isaac_lua_engine_lua_ref_dtor_reach_thunk_count(void) {
  /* 4 COMDAT scope-dtor tail thunks target 0x8a80b0. */
  return ISAAC_LUA_REF_DTOR_THUNK_COUNT;
}

uint32_t isaac_lua_engine_lua_ref_dtor_reach_thunk_va_for_index(
    int32_t index) {
  return lua_ref_thunk_in_range(index) != 0 ? kLuaRefThunkVa(index) : 0u;
}

uint32_t isaac_lua_engine_lua_ref_dtor_reach_thunk_local_disp_for_index(
    int32_t index) {
  return lua_ref_thunk_in_range(index) != 0 ? kLuaRefThunkDisp(index) : 0u;
}

uint32_t isaac_lua_engine_lua_ref_dtor_unref_arg_at(uint32_t argument,
                                                    uint32_t state,
                                                    uint32_t ref) {
  /* Push order before IAT luaL_unref: [esi+4] (ref), 0xfff0b9d8
     (registryindex), [esi] (state L). Each is a FULL-WORD push — never
     byte-masked. OOR position -> 0. */
  switch (argument) {
    case 0:
      return ref;
    case 1:
      return (uint32_t)ISAAC_LUA_REF_DTOR_UNREF_REGISTRY_INDEX_U32;
    case 2:
      return state;
    default:
      return 0u;
  }
}

int32_t isaac_lua_engine_lua_ref_dtor_tidy_before_unref(void) {
  /* call 0x40d040 at +0x06 precedes call [0xb1831c] at +0x15. */
  return 1;
}

/* ---------------------------------------------------------------------
   ABI v45 — SetReference wrapper successors 0x008a8180 / 0x008a81d0 /
   0x008a8270 (the "0x008a80d0+ band" after the landed v10 wrapper).
   See the header block for the full transcription and the handoff
   correction (the v47 "0x008a82c0" is the TAIL of 0x8a8270, not a body).
   The lua_* IAT calls, the check/get helper 0x0085c590, the ud[0]
   thiscall and the newuserdata/metatable record stay host; here we pin
   the pure CF laws: shared registry ref-set decision, per-wrapper check
   flags / return values, wrapper #2 newuserdata + vtable-tag + payload +
   rawgetp/setmetatable args, wrapper #3 getArgObject/pushNumber helper
   geometry + the float widening law.
   --------------------------------------------------------------------- */

namespace {

int32_t setref_successor_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_SETREF_SUCCESSOR_COUNT) ? 1 : 0;
}

uint32_t kSetrefSuccessorVa(int32_t index) {
  switch (index) {
    case 0:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_0_VA;
    case 1:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_1_VA;
    default:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_2_VA;
  }
}

uint32_t kSetrefSuccessorRetVa(int32_t index) {
  switch (index) {
    case 0:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_0_RET_VA;
    case 1:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_1_RET_VA;
    default:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_2_RET_VA;
  }
}

uint32_t kSetrefSuccessorInstallVa(int32_t index) {
  switch (index) {
    case 0:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_0_INSTALL_VA;
    case 1:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_1_INSTALL_VA;
    default:
      return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_2_INSTALL_VA;
  }
}

int32_t kSetrefSuccessorInsnCount(int32_t index) {
  switch (index) {
    case 0:
      return ISAAC_LUA_SETREF_SUCCESSOR_0_INSN_COUNT;
    case 1:
      return ISAAC_LUA_SETREF_SUCCESSOR_1_INSN_COUNT;
    default:
      return ISAAC_LUA_SETREF_SUCCESSOR_2_INSN_COUNT;
  }
}

int32_t kSetrefSuccessorCheckFlags(int32_t index) {
  switch (index) {
    case 0:
      return ISAAC_LUA_SETREF_SUCCESSOR_0_CHECK_FLAGS;
    case 1:
      return ISAAC_LUA_SETREF_SUCCESSOR_1_CHECK_FLAGS;
    default:
      return ISAAC_LUA_SETREF_SUCCESSOR_2_CHECK_FLAGS;
  }
}

int32_t kSetrefSuccessorReturnValue(int32_t index) {
  switch (index) {
    case 0:
      return ISAAC_LUA_SETREF_SUCCESSOR_0_RETURN_VALUE;
    case 1:
      return ISAAC_LUA_SETREF_SUCCESSOR_1_RETURN_VALUE;
    default:
      return ISAAC_LUA_SETREF_SUCCESSOR_2_RETURN_VALUE;
  }
}

}  // namespace

int32_t isaac_lua_engine_setref_successor_count(void) {
  return ISAAC_LUA_SETREF_SUCCESSOR_COUNT;
}

uint32_t isaac_lua_engine_setref_successor_va(int32_t index) {
  return setref_successor_index_ok(index) != 0 ? kSetrefSuccessorVa(index)
                                               : 0u;
}

uint32_t isaac_lua_engine_setref_successor_ret_va(int32_t index) {
  return setref_successor_index_ok(index) != 0 ? kSetrefSuccessorRetVa(index)
                                               : 0u;
}

uint32_t isaac_lua_engine_setref_successor_body_bytes(int32_t index) {
  if (setref_successor_index_ok(index) == 0) return 0u;
  /* first ret - body VA (ret excluded, family convention). */
  return (uint32_t)(kSetrefSuccessorRetVa(index) - kSetrefSuccessorVa(index));
}

int32_t isaac_lua_engine_setref_successor_insn_count(int32_t index) {
  return setref_successor_index_ok(index) != 0 ? kSetrefSuccessorInsnCount(index)
                                               : -1;
}

uint32_t isaac_lua_engine_setref_successor_install_va(int32_t index) {
  return setref_successor_index_ok(index) != 0
             ? kSetrefSuccessorInstallVa(index)
             : 0u;
}

int32_t isaac_lua_engine_setref_successor_check_flags(int32_t index) {
  return setref_successor_index_ok(index) != 0 ? kSetrefSuccessorCheckFlags(index)
                                               : -1;
}

int32_t isaac_lua_engine_setref_successor_return_value(int32_t index) {
  return setref_successor_index_ok(index) != 0
             ? kSetrefSuccessorReturnValue(index)
             : -1;
}

uint32_t isaac_lua_engine_setref_successor_type_index(void) {
  /* push 1; push L; call lua_type @ 0x8a8188 / 0x8a81db / 0x8a827b. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_TYPE_INDEX;
}

uint32_t isaac_lua_engine_setref_successor_check_stack_index(void) {
  /* mov edx,1 before the 0x85c590 check on all three wrappers. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_CHECK_STACK_INDEX;
}

uint32_t isaac_lua_engine_setref_successor_registry_key(void) {
  /* push 0xc82980 before 0x85c590 (all three; also the rawgetp key in #2
     and the getArgObject helper key). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_REGISTRY_KEY;
}

uint32_t isaac_lua_engine_setref_successor_object_field_off(void) {
  /* mov edi,[eax+4] after the check helper (all three). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_setref_successor_touserdata_index(void) {
  /* push 0xfff0b9d7 = lua_upvalueindex(1) before lua_touserdata. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_setref_successor_fn_off(void) {
  /* mov eax,[ud+0] (the thiscall fn loaded from the userdata). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_FN_OFF;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_pushcclosure(void) {
  /* install helpers 0x8a0470/0x8a0510/0x8a05a0 call this with the wrapper
     VA as the fn literal. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_PUSHCClOSURE;
}

uint32_t isaac_lua_engine_setref_successor_object_resolve(
    uint32_t type_result, uint32_t check_field) {
  /* PE `test eax,eax; je obj_zero` — FULL-WORD test of lua_type(L,1).
     Zero -> obj = 0 (xor edi,edi); nonzero -> obj = [ret+4] (check_field).
     Never byte-masked: 0x100/0x1ff/0xffffffff all resolve to check_field. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_setref_successor_ret_slot_stack_off(void) {
  /* lea ecx,[ebp-8] pushed before wrapper #2's ud[0](obj,&ret8) call. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_RET_SLOT_STACK_OFF;
}

uint32_t isaac_lua_engine_setref_successor_newuserdata_size(void) {
  /* push 0x10; push L; call lua_newuserdata @ 0x8a8221. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_setref_successor_vtable_tag_va(void) {
  /* mov [newud], 0xb73574 @ 0x8a823a (.rdata: dword 0x008bae70 +
     "RoomDescriptor" — class-info record stored as the tag). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_VTABLE_TAG_VA;
}

uint32_t isaac_lua_engine_setref_successor_payload_self_off(void) {
  /* mov [newud+4], eax with eax = lea [newud+8] @ 0x8a8240. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_SELF_OFF;
}

uint32_t isaac_lua_engine_setref_successor_payload_off(void) {
  /* lea eax,[edi+8] — the payload lives at newud+8 (0x10-byte userdata). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_OFF;
}

uint32_t isaac_lua_engine_setref_successor_metatable_rawgetp_key(void) {
  /* push 0xc82980; push 0xfff0b9d8; push L; call lua_rawgetp @ 0x8a822c.
     The metatable key EQUALS the check-helper registry key. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_METATABLE_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_setref_successor_lua_registry_index(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_LUA_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_setref_successor_setmeta_index(void) {
  /* push -2; push L; call lua_setmetatable @ 0x8a8249. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_setref_successor_payload_lo_off(void) {
  /* mov [ecx],edx with edx=[ebp-8] (ret lo) @ 0x8a8267. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_LO_OFF;
}

uint32_t isaac_lua_engine_setref_successor_payload_hi_off(void) {
  /* mov [ecx+4],esi with esi=[ebp-4] (ret hi) @ 0x8a8264. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PAYLOAD_HI_OFF;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_setref_successor_arg2_stack_index(void) {
  /* mov edx,2 before the 0x8baa50 getArgObject call @ 0x8a82bb. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_ARG2_STACK_INDEX;
}

uint32_t isaac_lua_engine_setref_successor_arg2_vec_float_count(void) {
  /* movss xmm1,[eax]; movss xmm0,[eax+4]; unpcklps; movq [ebp-0x14] —
     two float32 lanes packed into the 8-byte vec. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_ARG2_VEC_FLOAT_COUNT;
}

uint32_t isaac_lua_engine_setref_successor_arg2_vec_off_0(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_0;
}

uint32_t isaac_lua_engine_setref_successor_arg2_vec_off_1(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_ARG2_VEC_OFF_1;
}

uint32_t isaac_lua_engine_setref_successor_fn_slot_stack_off(void) {
  /* mov [ebp-8],eax (fn copied from ud[0] via eax); call [ebp-8] @ 0x8a82e4. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_FN_SLOT_STACK_OFF;
}

uint32_t isaac_lua_engine_setref_successor_float_ret_slot_stack_off(void) {
  /* fstp dword ptr [ebp-8]; movss xmm1,[ebp-8] @ 0x8a82ef — float32
     return slot round trip through memory. */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_FLOAT_RET_SLOT_STACK_OFF;
}

uint32_t isaac_lua_engine_setref_successor_get_arg_object_va(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_VA;
}

uint32_t isaac_lua_engine_setref_successor_get_arg_object_error_ret_va(void) {
  /* error path `ret` @ 0x8baa7a (after luaL_error, eax=0). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_ERROR_RET_VA;
}

uint32_t isaac_lua_engine_setref_successor_get_arg_object_ret_va(void) {
  /* success path `ret` @ 0x8baaa8 (after the null re-check). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_GET_ARG_OBJECT_RET_VA;
}

uint32_t isaac_lua_engine_setref_successor_error_string_va(void) {
  /* push 0xb7539c before luaL_error — .rdata "nil passed to reference". */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_ERROR_STRING_VA;
}

uint32_t isaac_lua_engine_setref_successor_iat_lua_l_error(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_IAT_LUA_L_ERROR;
}

uint32_t isaac_lua_engine_setref_successor_push_number_va(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_VA;
}

uint32_t isaac_lua_engine_setref_successor_push_number_ret_va(void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_RET_VA;
}

uint32_t isaac_lua_engine_setref_successor_push_number_iat_lua_pushnumber(
    void) {
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_IAT_LUA_PUSHNUMBER;
}

uint32_t isaac_lua_engine_setref_successor_push_number_cleanup(void) {
  /* add esp,0xc after the IAT pushnumber (2 pushed args + ret slot). */
  return (uint32_t)ISAAC_LUA_SETREF_SUCCESSOR_PUSH_NUMBER_CLEANUP;
}

uint32_t isaac_lua_engine_setref_successor_get_arg_object(
    uint32_t type_result, uint32_t check_field) {
  /* Helper 0x8baa50 (ecx=L, edx=idx): lua_type(L,idx) == 0 -> luaL_error
     (0xb7539c), ret 0. Else check 0x85c590 -> obj=[eax+4]; obj == 0 ->
     luaL_error AGAIN, ret 0. Else ret obj. Both gates are FULL-WORD
     tests (test eax,eax / test esi,esi); never byte-masked. */
  if (type_result == 0u) return 0u;          /* first error (nil arg) */
  if (check_field == 0u) return 0u;          /* second error (null obj) */
  return check_field;
}

uint32_t isaac_lua_engine_setref_successor_push_number_widen_hi(
    uint32_t f32_bits) {
  /* Helper 0x85c050: cvtss2sd xmm1 -> xmm0 — EXACT float32 -> float64
     widening (no rounding for finite/inf/zero/denormal). Reproduce the
     IEEE widening; return the high dword of the f64 bit pattern. */
  float f;
  double d;
  uint64_t u;
  __builtin_memcpy(&f, &f32_bits, sizeof(f));
  d = (double)f;
  __builtin_memcpy(&u, &d, sizeof(u));
  return (uint32_t)(u >> 32);
}

uint32_t isaac_lua_engine_setref_successor_push_number_widen_lo(
    uint32_t f32_bits) {
  float f;
  double d;
  uint64_t u;
  __builtin_memcpy(&f, &f32_bits, sizeof(f));
  d = (double)f;
  __builtin_memcpy(&u, &d, sizeof(u));
  return (uint32_t)(u & 0xffffffffu);
}

/* ---------------------------------------------------------------------
   ABI v47 — closure-install helpers 0x8a0460 .. 0x89fee0 (12 bodies,
   one C++ template with per-site laws). Nine new bodies that unit:
   indices 3..11. DUAL (REGISTER-held), SINGLE (IMMEDIATE-held) and the
   NEW DUAL_IMM shape (dual chains, immediates). Full machine
   transcription: section-notes/lua-v50/NOTES.md.
   ABI v50 — two more bodies of the same template: helpers 12 (0x89fde0,
   DUAL_IMM: GetAlignment install, name imm 0xb702a0 x2, ud[0] imm
   0x40c3a0, chains @ -5/-3, cleanups 0x40+0x24) and 13 (0x89fd80,
   SINGLE-reg: setter install, name edx REGISTER, ud[0] = [ebp+8]
   REGISTER, one chain @ -3, cleanup 0x38) + per-helper SOURCE tables
   (shape alone cannot express SINGLE-reg) + sites 21..24 (the four
   FontRenderSettings installs 0x866dcc..0x866e35). Full machine
   transcription: section-notes/lua-v53/NOTES.md.
   --------------------------------------------------------------------- */

static int32_t install_helper_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_INSTALL_HELPER_COUNT) ? 1 : 0;
}

static const uint32_t kInstallHelperVa[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_HELPER_0_VA,
    ISAAC_LUA_INSTALL_HELPER_1_VA,
    ISAAC_LUA_INSTALL_HELPER_2_VA,
    ISAAC_LUA_INSTALL_HELPER_3_VA,
    ISAAC_LUA_INSTALL_HELPER_4_VA,
    ISAAC_LUA_INSTALL_HELPER_5_VA,
    ISAAC_LUA_INSTALL_HELPER_6_VA,
    ISAAC_LUA_INSTALL_HELPER_7_VA,
    ISAAC_LUA_INSTALL_HELPER_8_VA,
    ISAAC_LUA_INSTALL_HELPER_9_VA,
    ISAAC_LUA_INSTALL_HELPER_10_VA,
    ISAAC_LUA_INSTALL_HELPER_11_VA,
    ISAAC_LUA_INSTALL_HELPER_12_VA,
    ISAAC_LUA_INSTALL_HELPER_13_VA,
    ISAAC_LUA_INSTALL_HELPER_14_VA,
    ISAAC_LUA_INSTALL_HELPER_15_VA,
    ISAAC_LUA_INSTALL_HELPER_16_VA,
    ISAAC_LUA_INSTALL_HELPER_17_VA,
    ISAAC_LUA_INSTALL_HELPER_18_VA,
    ISAAC_LUA_INSTALL_HELPER_19_VA,
    ISAAC_LUA_INSTALL_HELPER_20_VA,
    ISAAC_LUA_INSTALL_HELPER_21_VA,
    ISAAC_LUA_INSTALL_HELPER_22_VA,
    ISAAC_LUA_INSTALL_HELPER_23_VA,
    ISAAC_LUA_INSTALL_HELPER_24_VA,
    ISAAC_LUA_INSTALL_HELPER_25_VA,
    ISAAC_LUA_INSTALL_HELPER_26_VA,
    ISAAC_LUA_INSTALL_HELPER_27_VA,
    ISAAC_LUA_INSTALL_HELPER_28_VA};

static const uint32_t kInstallHelperRetVa[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_HELPER_0_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_1_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_2_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_3_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_4_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_5_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_6_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_7_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_8_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_9_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_10_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_11_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_12_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_13_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_14_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_15_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_16_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_17_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_18_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_19_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_20_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_21_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_22_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_23_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_24_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_25_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_26_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_27_RET_VA,
    ISAAC_LUA_INSTALL_HELPER_28_RET_VA};

static const int32_t kInstallHelperInsnCount[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_HELPER_0_INSNS,
    ISAAC_LUA_INSTALL_HELPER_1_INSNS,
    ISAAC_LUA_INSTALL_HELPER_2_INSNS,
    ISAAC_LUA_INSTALL_HELPER_3_INSNS,
    ISAAC_LUA_INSTALL_HELPER_4_INSNS,
    ISAAC_LUA_INSTALL_HELPER_5_INSNS,
    ISAAC_LUA_INSTALL_HELPER_6_INSNS,
    ISAAC_LUA_INSTALL_HELPER_7_INSNS,
    ISAAC_LUA_INSTALL_HELPER_8_INSNS,
    ISAAC_LUA_INSTALL_HELPER_9_INSNS,
    ISAAC_LUA_INSTALL_HELPER_10_INSNS,
    ISAAC_LUA_INSTALL_HELPER_11_INSNS,
    ISAAC_LUA_INSTALL_HELPER_12_INSNS,
    ISAAC_LUA_INSTALL_HELPER_13_INSNS,
    ISAAC_LUA_INSTALL_HELPER_14_INSNS,
    ISAAC_LUA_INSTALL_HELPER_15_INSNS,
    ISAAC_LUA_INSTALL_HELPER_16_INSNS,
    ISAAC_LUA_INSTALL_HELPER_17_INSNS,
    ISAAC_LUA_INSTALL_HELPER_18_INSNS,
    ISAAC_LUA_INSTALL_HELPER_19_INSNS,
    ISAAC_LUA_INSTALL_HELPER_20_INSNS,
    ISAAC_LUA_INSTALL_HELPER_21_INSNS,
    ISAAC_LUA_INSTALL_HELPER_22_INSNS,
    ISAAC_LUA_INSTALL_HELPER_23_INSNS,
    ISAAC_LUA_INSTALL_HELPER_24_INSNS,
    ISAAC_LUA_INSTALL_HELPER_25_INSNS,
    ISAAC_LUA_INSTALL_HELPER_26_INSNS,
    ISAAC_LUA_INSTALL_HELPER_27_INSNS,
    ISAAC_LUA_INSTALL_HELPER_28_INSNS};

static const uint32_t kInstallHelperWrapperVa[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_HELPER_0_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_1_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_2_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_3_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_4_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_5_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_6_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_7_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_8_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_9_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_10_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_11_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_12_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_13_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_14_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_15_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_16_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_17_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_18_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_19_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_20_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_21_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_22_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_23_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_24_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_25_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_26_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_27_WRAPPER_VA,
    ISAAC_LUA_INSTALL_HELPER_28_WRAPPER_VA};

static const int32_t kInstallHelperShape[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 0x8a0460 — pushvalue + 2 chains */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 0x8a0500 — pushvalue + 2 chains */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 0x8a05a0 — 1 chain */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 0x8a0400 — 1 chain (Lerp) */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 0x8a0360 — pushvalue + 2 chains */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 0x8a0220 — pushvalue + 2 chains */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 0x8a01c0 — 1 chain (Resize) */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 0x8a0160 — 1 chain (Clamp) */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 0x8a00c0 — 2 chains, imms */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 0x8a0020 — pushvalue + 2 chains */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 0x89ff80 — pushvalue + 2 chains */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 0x89fee0 — 2 chains, imms */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 0x89fde0 (v50) — 2 chains, imms */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 0x89fd80 (v50) — 1 chain, REG */
    /* v51 FontRenderSettings install run. */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 14 0x89fe80 SetAlignment */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 15 0x89fce0 GetMaxCharacters */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 16 0x89fc40 — DUAL-reg */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 17 0x89fbe0 SetLineHeightModifier */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 18 0x89fb40 GetLineHeightModifier */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 19 0x89fae0 SetMissingCharacterOverride */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 20 0x89fa40 GetMissingCharacterOverride */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 21 0x89f9e0 Load */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE,     /* 22 0x89f980 Unload */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 23 0x89f8e0 IsLoaded */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 24 0x89f840 GetCharacterWidth */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 25 0x89f7a0 GetStringWidth */
    ISAAC_LUA_INSTALL_SHAPE_DUAL,       /* 26 0x89f700 — DUAL-reg */
    ISAAC_LUA_INSTALL_SHAPE_DUAL_IMM,   /* 27 0x89f660 DrawString */
    ISAAC_LUA_INSTALL_SHAPE_SINGLE};    /* 28 0x89f600 SetMissingCharacter */

/* Per-helper operand-source tables (ABI v50, 14 rows + v51 rows 14..28).
 * REGISTER: DUAL rows 0/1/4/5/9/10, the SINGLE-reg helper 13 (0x89fd80 —
 * name from edx `mov edi,edx` @ 0x89fd88, ud[0] = [ebp+8] `mov esi,[ebp+8]`
 * @ 0x89fd93), and the DUAL-reg helpers 16/26 (0x89fc40/0x89f700 — name
 * pushed from edx via ebx, ud[0] = [ebp+8] `mov [eax],esi`).
 * IMMEDIATE: SINGLE-imm rows 2/3/6/7 + DUAL_IMM rows 8/11/12/15/18/20/
 * 23/24/25/27 + SINGLE-imm rows 14/17/19/21/22/28 (name pushed twice as
 * imm or once, ud[0] imm). */
static const int32_t kInstallHelperNameSource[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_SOURCE_REGISTER, ISAAC_LUA_INSTALL_SOURCE_REGISTER,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE,
    ISAAC_LUA_INSTALL_SOURCE_REGISTER, ISAAC_LUA_INSTALL_SOURCE_REGISTER,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, ISAAC_LUA_INSTALL_SOURCE_REGISTER,
    ISAAC_LUA_INSTALL_SOURCE_REGISTER, ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 12 0x89fde0 DUAL_IMM */
    ISAAC_LUA_INSTALL_SOURCE_REGISTER,  /* 13 0x89fd80 SINGLE-reg */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 14 0x89fe80 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 15 0x89fce0 */
    ISAAC_LUA_INSTALL_SOURCE_REGISTER,  /* 16 0x89fc40 (edx name) */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 17 0x89fbe0 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 18 0x89fb40 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 19 0x89fae0 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 20 0x89fa40 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 21 0x89f9e0 (Load) */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 22 0x89f980 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 23 0x89f8e0 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 24 0x89f840 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 25 0x89f7a0 */
    ISAAC_LUA_INSTALL_SOURCE_REGISTER,  /* 26 0x89f700 (edx name) */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 27 0x89f660 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE}; /* 28 0x89f600 */

static const int32_t kInstallHelperRealFnSource[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    ISAAC_LUA_INSTALL_SOURCE_REGISTER, ISAAC_LUA_INSTALL_SOURCE_REGISTER,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE,
    ISAAC_LUA_INSTALL_SOURCE_REGISTER, ISAAC_LUA_INSTALL_SOURCE_REGISTER,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, ISAAC_LUA_INSTALL_SOURCE_REGISTER,
    ISAAC_LUA_INSTALL_SOURCE_REGISTER, ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE,
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 12 0x89fde0 DUAL_IMM */
    ISAAC_LUA_INSTALL_SOURCE_REGISTER,  /* 13 0x89fd80 SINGLE-reg */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 14 0x89fe80 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 15 0x89fce0 */
    ISAAC_LUA_INSTALL_SOURCE_REGISTER,  /* 16 0x89fc40 ([ebp+8]) */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 17 0x89fbe0 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 18 0x89fb40 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 19 0x89fae0 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 20 0x89fa40 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 21 0x89f9e0 (Load) */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 22 0x89f980 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 23 0x89f8e0 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 24 0x89f840 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 25 0x89f7a0 */
    ISAAC_LUA_INSTALL_SOURCE_REGISTER,  /* 26 0x89f700 ([ebp+8]) */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE, /* 27 0x89f660 */
    ISAAC_LUA_INSTALL_SOURCE_IMMEDIATE}; /* 28 0x89f600 */

static const uint32_t kInstallHelperNameImm[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    0u, 0u, ISAAC_LUA_INSTALL_HELPER_2_NAME_VA,
    ISAAC_LUA_INSTALL_HELPER_3_NAME_VA, 0u, 0u,
    ISAAC_LUA_INSTALL_HELPER_6_NAME_VA, ISAAC_LUA_INSTALL_HELPER_7_NAME_VA,
    ISAAC_LUA_INSTALL_HELPER_8_NAME_VA, 0u, 0u,
    ISAAC_LUA_INSTALL_HELPER_11_NAME_VA, ISAAC_LUA_INSTALL_HELPER_12_NAME_VA,
    0u, /* 13 register-held */
    ISAAC_LUA_INSTALL_HELPER_14_NAME_VA, ISAAC_LUA_INSTALL_HELPER_15_NAME_VA,
    0u, /* 16 register-held */
    ISAAC_LUA_INSTALL_HELPER_17_NAME_VA, ISAAC_LUA_INSTALL_HELPER_18_NAME_VA,
    ISAAC_LUA_INSTALL_HELPER_19_NAME_VA, ISAAC_LUA_INSTALL_HELPER_20_NAME_VA,
    ISAAC_LUA_INSTALL_HELPER_21_NAME_VA, ISAAC_LUA_INSTALL_HELPER_22_NAME_VA,
    ISAAC_LUA_INSTALL_HELPER_23_NAME_VA, ISAAC_LUA_INSTALL_HELPER_24_NAME_VA,
    ISAAC_LUA_INSTALL_HELPER_25_NAME_VA,
    0u, /* 26 register-held */
    ISAAC_LUA_INSTALL_HELPER_27_NAME_VA, ISAAC_LUA_INSTALL_HELPER_28_NAME_VA};

static const uint32_t kInstallHelperRealFnImm[ISAAC_LUA_INSTALL_HELPER_COUNT] = {
    0u, 0u, ISAAC_LUA_INSTALL_HELPER_2_REAL_FN_VA,
    ISAAC_LUA_INSTALL_HELPER_3_REAL_FN_VA, 0u, 0u,
    ISAAC_LUA_INSTALL_HELPER_6_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_7_REAL_FN_VA,
    ISAAC_LUA_INSTALL_HELPER_8_REAL_FN_VA, 0u, 0u,
    ISAAC_LUA_INSTALL_HELPER_11_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_12_REAL_FN_VA,
    0u, /* 13 register-held */
    ISAAC_LUA_INSTALL_HELPER_14_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_15_REAL_FN_VA,
    0u, /* 16 register-held */
    ISAAC_LUA_INSTALL_HELPER_17_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_18_REAL_FN_VA,
    ISAAC_LUA_INSTALL_HELPER_19_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_20_REAL_FN_VA,
    ISAAC_LUA_INSTALL_HELPER_21_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_22_REAL_FN_VA,
    ISAAC_LUA_INSTALL_HELPER_23_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_24_REAL_FN_VA,
    ISAAC_LUA_INSTALL_HELPER_25_REAL_FN_VA,
    0u, /* 26 register-held */
    ISAAC_LUA_INSTALL_HELPER_27_REAL_FN_VA, ISAAC_LUA_INSTALL_HELPER_28_REAL_FN_VA};

int32_t isaac_lua_engine_install_helper_count(void) {
  return ISAAC_LUA_INSTALL_HELPER_COUNT;
}

uint32_t isaac_lua_engine_install_helper_va(int32_t index) {
  return install_helper_index_ok(index) != 0 ? kInstallHelperVa[index] : 0u;
}

uint32_t isaac_lua_engine_install_helper_ret_va(int32_t index) {
  return install_helper_index_ok(index) != 0 ? kInstallHelperRetVa[index] : 0u;
}

uint32_t isaac_lua_engine_install_helper_body_bytes(int32_t index) {
  if (install_helper_index_ok(index) == 0) return 0u;
  /* first ret - body VA (ret excluded, family convention). */
  return (uint32_t)(kInstallHelperRetVa[index] - kInstallHelperVa[index]);
}

int32_t isaac_lua_engine_install_helper_insn_count(int32_t index) {
  return install_helper_index_ok(index) != 0 ? kInstallHelperInsnCount[index]
                                             : -1;
}

uint32_t isaac_lua_engine_install_helper_wrapper_va(int32_t index) {
  /* pushcclosure fn literal (push imm at 0x8a0481 / 0x8a0521 / 0x8a05af). */
  return install_helper_index_ok(index) != 0 ? kInstallHelperWrapperVa[index]
                                             : 0u;
}

int32_t isaac_lua_engine_install_helper_shape(int32_t index) {
  return install_helper_index_ok(index) != 0 ? kInstallHelperShape[index] : -1;
}

int32_t isaac_lua_engine_install_helper_name_source(int32_t index) {
  if (install_helper_index_ok(index) == 0) return -1;
  /* Per-helper 14-row table (ABI v50) — SINGLE-reg helper 13 (0x89fd80)
     spells name from edx, so shape alone cannot decide the source. */
  return kInstallHelperNameSource[index];
}

int32_t isaac_lua_engine_install_helper_real_fn_source(int32_t index) {
  if (install_helper_index_ok(index) == 0) return -1;
  /* Same tables; helper 13 stores ud[0] = [ebp+8] (0x89fd93/0x89fd9e). */
  return kInstallHelperRealFnSource[index];
}

uint32_t isaac_lua_engine_install_helper_name_imm_va(int32_t index) {
  return install_helper_index_ok(index) != 0 ? kInstallHelperNameImm[index]
                                             : 0u;
}

uint32_t isaac_lua_engine_install_helper_real_fn_imm_va(int32_t index) {
  return install_helper_index_ok(index) != 0 ? kInstallHelperRealFnImm[index]
                                             : 0u;
}

uint32_t isaac_lua_engine_install_helper_newuserdata_size(void) {
  /* push 4; push L; call lua_newuserdata (all four band helpers). */
  return (uint32_t)ISAAC_LUA_INSTALL_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_install_helper_closure_nups(void) {
  /* push 1 before pushcclosure — the userdata is the single upvalue. */
  return (uint32_t)ISAAC_LUA_INSTALL_CLOSURE_NUPS;
}

uint32_t isaac_lua_engine_install_helper_pushvalue_index(void) {
  /* push −1; push L; call lua_pushvalue @ 0x8a048f (dual) — duplicates
     the closure for the second rawset chain. */
  return (uint32_t)ISAAC_LUA_INSTALL_PUSHVALUE_INDEX_U32;
}

uint32_t isaac_lua_engine_install_helper_dual_absindex_first(void) {
  /* chain 1: push −5; push L; call lua_absindex @ 0x8a0498. */
  return (uint32_t)ISAAC_LUA_INSTALL_DUAL_ABSINDEX_FIRST_U32;
}

uint32_t isaac_lua_engine_install_helper_dual_absindex_second(void) {
  /* chain 2: push −3; push L; call lua_absindex @ 0x8a04c5. */
  return (uint32_t)ISAAC_LUA_INSTALL_DUAL_ABSINDEX_SECOND_U32;
}

uint32_t isaac_lua_engine_install_helper_single_absindex_index(void) {
  /* single shape: push −3 @ 0x8a05c1 (same u32 as dual chain 2). */
  return (uint32_t)ISAAC_LUA_INSTALL_ABSINDEX_INDEX_U32;
}

uint32_t isaac_lua_engine_install_helper_rotate_index(void) {
  /* push 1; push −2; push L; call lua_rotate (all four band helpers). */
  return (uint32_t)ISAAC_LUA_INSTALL_ROTATE_INDEX_U32;
}

uint32_t isaac_lua_engine_install_helper_rotate_n(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_ROTATE_N;
}

uint32_t isaac_lua_engine_install_helper_dual_cleanup_first(void) {
  /* add esp, 0x40 after the first rawset @ 0x8a04c2 (16 pushes). */
  return (uint32_t)ISAAC_LUA_INSTALL_DUAL_CLEANUP_FIRST;
}

uint32_t isaac_lua_engine_install_helper_dual_cleanup_second(void) {
  /* add esp, 0x24 at the epilogue @ 0x8a04ed (9 pushes). */
  return (uint32_t)ISAAC_LUA_INSTALL_DUAL_CLEANUP_SECOND;
}

uint32_t isaac_lua_engine_install_helper_single_cleanup(void) {
  /* add esp, 0x38 @ 0x8a05eb (14 pushes). */
  return (uint32_t)ISAAC_LUA_INSTALL_SINGLE_CLEANUP;
}

uint32_t isaac_lua_engine_install_helper_iat_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_NEWUSERDATA;
}

uint32_t isaac_lua_engine_install_helper_iat_pushcclosure(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_PUSHCClOSURE;
}

uint32_t isaac_lua_engine_install_helper_iat_pushvalue(void) {
  /* Same slot as materialize v25 event pushvalue (0xb183c8). */
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_PUSHVALUE;
}

uint32_t isaac_lua_engine_install_helper_iat_absindex(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_ABSINDEX;
}

uint32_t isaac_lua_engine_install_helper_iat_pushstring(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_PUSHSTRING;
}

uint32_t isaac_lua_engine_install_helper_iat_rotate(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_ROTATE;
}

uint32_t isaac_lua_engine_install_helper_iat_rawset(void) {
  return (uint32_t)ISAAC_LUA_INSTALL_IAT_RAWSET;
}

/* ---------------------------------------------------------------------------
 * ABI v48 — wrapper BODIES 0x8a8310..0x8a88f0 (9 closures) + helper
 * 0x8ba890 getArgVector.
 *
 * Shared arg conduct (all 9): L=[ebp+8]; lua_type(L,1) @0xb18400; FULL-WORD
 * gate; check 0x85c590 (flags vary); obj1=[eax+4]; touserdata(L,
 * 0xfff0b9d7) @0xb183b0; fn=ud[0]; per-wrapper args -> ud[0](obj1,...);
 * per-wrapper tail. See ISAAC_LUA_WRAPPER_* constants for the per-site
 * table. All lua_* IAT bodies + the check/get 0x85c590 body (v11/v12) +
 * the real_fn stay host. No uint8_t scalar params.
 * ------------------------------------------------------------------------- */

static int32_t wrapper_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_WRAPPER_COUNT) ? 1 : 0;
}

static const uint32_t kWrapperVa[ISAAC_LUA_WRAPPER_COUNT] = {
    ISAAC_LUA_WRAPPER_0_VA, ISAAC_LUA_WRAPPER_1_VA, ISAAC_LUA_WRAPPER_2_VA,
    ISAAC_LUA_WRAPPER_3_VA, ISAAC_LUA_WRAPPER_4_VA, ISAAC_LUA_WRAPPER_5_VA,
    ISAAC_LUA_WRAPPER_6_VA, ISAAC_LUA_WRAPPER_7_VA, ISAAC_LUA_WRAPPER_8_VA,
};

static const uint32_t kWrapperRetVa[ISAAC_LUA_WRAPPER_COUNT] = {
    ISAAC_LUA_WRAPPER_0_RET_VA, ISAAC_LUA_WRAPPER_1_RET_VA,
    ISAAC_LUA_WRAPPER_2_RET_VA, ISAAC_LUA_WRAPPER_3_RET_VA,
    ISAAC_LUA_WRAPPER_4_RET_VA, ISAAC_LUA_WRAPPER_5_RET_VA,
    ISAAC_LUA_WRAPPER_6_RET_VA, ISAAC_LUA_WRAPPER_7_RET_VA,
    ISAAC_LUA_WRAPPER_8_RET_VA,
};

static const int32_t kWrapperInsnCount[ISAAC_LUA_WRAPPER_COUNT] = {
    ISAAC_LUA_WRAPPER_0_INSNS, ISAAC_LUA_WRAPPER_1_INSNS,
    ISAAC_LUA_WRAPPER_2_INSNS, ISAAC_LUA_WRAPPER_3_INSNS,
    ISAAC_LUA_WRAPPER_4_INSNS, ISAAC_LUA_WRAPPER_5_INSNS,
    ISAAC_LUA_WRAPPER_6_INSNS, ISAAC_LUA_WRAPPER_7_INSNS,
    ISAAC_LUA_WRAPPER_8_INSNS,
};

static const int32_t kWrapperCheckFlags[ISAAC_LUA_WRAPPER_COUNT] = {
    ISAAC_LUA_WRAPPER_0_CHECK_FLAGS, ISAAC_LUA_WRAPPER_1_CHECK_FLAGS,
    ISAAC_LUA_WRAPPER_2_CHECK_FLAGS, ISAAC_LUA_WRAPPER_3_CHECK_FLAGS,
    ISAAC_LUA_WRAPPER_4_CHECK_FLAGS, ISAAC_LUA_WRAPPER_5_CHECK_FLAGS,
    ISAAC_LUA_WRAPPER_6_CHECK_FLAGS, ISAAC_LUA_WRAPPER_7_CHECK_FLAGS,
    ISAAC_LUA_WRAPPER_8_CHECK_FLAGS,
};

static const int32_t kWrapperReturnValue[ISAAC_LUA_WRAPPER_COUNT] = {
    ISAAC_LUA_WRAPPER_0_RETURN_VALUE, ISAAC_LUA_WRAPPER_1_RETURN_VALUE,
    ISAAC_LUA_WRAPPER_2_RETURN_VALUE, ISAAC_LUA_WRAPPER_3_RETURN_VALUE,
    ISAAC_LUA_WRAPPER_4_RETURN_VALUE, ISAAC_LUA_WRAPPER_5_RETURN_VALUE,
    ISAAC_LUA_WRAPPER_6_RETURN_VALUE, ISAAC_LUA_WRAPPER_7_RETURN_VALUE,
    ISAAC_LUA_WRAPPER_8_RETURN_VALUE,
};

static const int32_t kWrapperArg2Kind[ISAAC_LUA_WRAPPER_COUNT] = {
    /* 0x8a8310 Lerp   */ ISAAC_LUA_WRAPPER_ARG2_GET_ARG_OBJECT_VEC2,
    /* 0x8a8430 Rotated */ ISAAC_LUA_WRAPPER_ARG2_CHECKNUMBER_F32,
    /* 0x8a8510 GetAngle */ ISAAC_LUA_WRAPPER_ARG2_NONE,
    /* 0x8a8580 Resize  */ ISAAC_LUA_WRAPPER_ARG2_CHECKNUMBER_F32,
    /* 0x8a8610 Clamp   */ ISAAC_LUA_WRAPPER_ARG2_GET_ARG_VECTOR,
    /* 0x8a8680 Clamped */ ISAAC_LUA_WRAPPER_ARG2_GET_ARG_VECTOR,
    /* 0x8a8740 __add   */ ISAAC_LUA_WRAPPER_ARG2_GET_ARG_OBJECT_VEC2,
    /* 0x8a8810 __mul   */ ISAAC_LUA_WRAPPER_ARG2_CHECKNUMBER_F32,
    /* 0x8a88f0 __tostr */ ISAAC_LUA_WRAPPER_ARG2_NONE,
};

static const int32_t kWrapperArg2Index[ISAAC_LUA_WRAPPER_COUNT] = {
    2, 2, 0, 2, 2, 2, 2, 2, 0,
};

static const int32_t kWrapperArg3Kind[ISAAC_LUA_WRAPPER_COUNT] = {
    /* Lerp only: checknumber(L,3) -> f32 t. */
    ISAAC_LUA_WRAPPER_ARG3_CHECKNUMBER_F32, ISAAC_LUA_WRAPPER_ARG3_NONE,
    ISAAC_LUA_WRAPPER_ARG3_NONE, ISAAC_LUA_WRAPPER_ARG3_NONE,
    ISAAC_LUA_WRAPPER_ARG3_NONE, ISAAC_LUA_WRAPPER_ARG3_NONE,
    ISAAC_LUA_WRAPPER_ARG3_NONE, ISAAC_LUA_WRAPPER_ARG3_NONE,
    ISAAC_LUA_WRAPPER_ARG3_NONE,
};

static const int32_t kWrapperArg3Index[ISAAC_LUA_WRAPPER_COUNT] = {
    3, 0, 0, 0, 0, 0, 0, 0, 0,
};

static const int32_t kWrapperArg4Index[ISAAC_LUA_WRAPPER_COUNT] = {
    /* Lerp only: lua_toboolean(L,4) -> flag. */
    4, 0, 0, 0, 0, 0, 0, 0, 0,
};

static const int32_t kWrapperTailKind[ISAAC_LUA_WRAPPER_COUNT] = {
    ISAAC_LUA_WRAPPER_TAIL_BOX8, ISAAC_LUA_WRAPPER_TAIL_BOX10,
    ISAAC_LUA_WRAPPER_TAIL_FLOAT, ISAAC_LUA_WRAPPER_TAIL_VOID,
    ISAAC_LUA_WRAPPER_TAIL_VOID, ISAAC_LUA_WRAPPER_TAIL_BOX10,
    ISAAC_LUA_WRAPPER_TAIL_BOX10, ISAAC_LUA_WRAPPER_TAIL_BOX10,
    ISAAC_LUA_WRAPPER_TAIL_PUSHSTRING,
};

int32_t isaac_lua_engine_wrapper_count(void) {
  return ISAAC_LUA_WRAPPER_COUNT;
}

uint32_t isaac_lua_engine_wrapper_va(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperVa[index] : 0u;
}

uint32_t isaac_lua_engine_wrapper_ret_va(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperRetVa[index] : 0u;
}

uint32_t isaac_lua_engine_wrapper_body_bytes(int32_t index) {
  if (wrapper_index_ok(index) == 0) return 0u;
  /* first ret - body VA (ret excluded, family convention). */
  return (uint32_t)(kWrapperRetVa[index] - kWrapperVa[index]);
}

int32_t isaac_lua_engine_wrapper_insn_count(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperInsnCount[index] : -1;
}

int32_t isaac_lua_engine_wrapper_check_flags(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperCheckFlags[index] : -1;
}

int32_t isaac_lua_engine_wrapper_return_value(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperReturnValue[index] : -1;
}

int32_t isaac_lua_engine_wrapper_arg2_kind(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperArg2Kind[index] : -1;
}

int32_t isaac_lua_engine_wrapper_arg2_index(int32_t index) {
  if (wrapper_index_ok(index) == 0) return -1;
  /* GET_ARG_VECTOR reads the 4 numbers at 2..5 via the helper (the index
     law is on the helper's call order); others read the single listed
     index or none. */
  return kWrapperArg2Index[index];
}

int32_t isaac_lua_engine_wrapper_arg3_kind(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperArg3Kind[index] : -1;
}

int32_t isaac_lua_engine_wrapper_arg3_index(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperArg3Index[index] : -1;
}

int32_t isaac_lua_engine_wrapper_arg4_index(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperArg4Index[index] : -1;
}

int32_t isaac_lua_engine_wrapper_tail_kind(int32_t index) {
  return wrapper_index_ok(index) != 0 ? kWrapperTailKind[index] : -1;
}

uint32_t isaac_lua_engine_wrapper_type_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_TYPE_INDEX;
}

uint32_t isaac_lua_engine_wrapper_check_stack_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_CHECK_STACK_INDEX;
}

uint32_t isaac_lua_engine_wrapper_registry_key(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_REGISTRY_KEY;
}

uint32_t isaac_lua_engine_wrapper_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_wrapper_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_wrapper_fn_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_FN_OFF;
}

uint32_t isaac_lua_engine_wrapper_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_CHECK_HELPER_VA;
}

uint32_t isaac_lua_engine_wrapper_get_arg_object_va(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_GET_ARG_OBJECT_VA;
}

uint32_t isaac_lua_engine_wrapper_push_number_va(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_PUSH_NUMBER_VA;
}

uint32_t isaac_lua_engine_wrapper_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_wrapper_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_wrapper_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_IAT_LUA_CHECKNUMBER;
}

uint32_t isaac_lua_engine_wrapper_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_IAT_LUA_TOBOOLEAN;
}

uint32_t isaac_lua_engine_wrapper_object_resolve(uint32_t type_result,
                                                 uint32_t check_field) {
  /* PE `test eax,eax; je obj_zero` @ 0x8a8327 etc. — FULL-WORD zero test
     of the lua_type(L,1) result; obj = (type != 0) ? check_field : 0. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_wrapper_arg2_get_arg_object(
    uint32_t type_result, uint32_t check_field) {
  /* getArgObject 0x8baa50 two-gate law (v45): type==0 -> error ret 0;
     obj=check_field; obj==0 -> error again; else obj. Both gates
     FULL-WORD (test eax,eax / test esi,esi). */
  if (type_result == 0u) return 0u;
  if (check_field == 0u) return 0u;
  return check_field;
}

uint32_t isaac_lua_engine_wrapper_toboolean_flag(uint32_t toboolean_result) {
  /* PE @ 0x8a8368: test eax,eax; setne byte — FULL-WORD test of the
     lua_toboolean(L,4) result. lua_toboolean already yields 0/1; a
     low-byte mutant would diverge at 0x100. */
  return toboolean_result != 0u ? 1u : 0u;
}

uint32_t isaac_lua_engine_wrapper_float_f32_bits(uint32_t hi, uint32_t lo) {
  /* PE `fstp dword ptr [ebp-4]` @ 0x8a855f: takes the fn's x87 ST0 double
     and stores float32 (round-to-nearest-even, x87 default). Reconstruct
     the double from its 64 bits (little-endian), narrow exactly. */
  uint64_t bits = ((uint64_t)hi << 32) | lo;
  double d;
  uint32_t f32_bits;
  __builtin_memcpy(&d, &bits, sizeof(d));
  float f = (float)d;
  __builtin_memcpy(&f32_bits, &f, sizeof(f32_bits));
  return f32_bits;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_va(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_VA;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_ret_va(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_RET_VA;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_body_bytes(void) {
  /* first ret - body VA (ret excluded). */
  return (int32_t)(ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_RET_VA -
                   ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_VA);
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_insn_count(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_INSNS;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_call_order_at(
    int32_t position) {
  switch (position) {
    case 0: return ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_0;
    case 1: return ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_1;
    case 2: return ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_2;
    case 3: return ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_CALL_ORDER_3;
    default: return 0;
  }
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_index_at(int32_t position) {
  /* out[p] reads luaL_checknumber(L, p+2): out[0]=ck2 .. out[12]=ck5. */
  if (position < 0 || position >=
      ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_COUNT) {
    return 0;
  }
  return position + 2;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_out_f32_count(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_COUNT;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_out_stride(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_F32_STRIDE;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_out_l_ptr_off(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_OUT_L_PTR_OFF;
}

int32_t isaac_lua_engine_wrapper_get_arg_vector_ret_args(void) {
  return (int32_t)ISAAC_LUA_WRAPPER_GET_ARG_VECTOR_RET_ARGS;
}

uint32_t isaac_lua_engine_wrapper_box10_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_wrapper_box10_vtable_tag_va(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_VTABLE_TAG_VA;
}

uint32_t isaac_lua_engine_wrapper_box10_payload_self_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_SELF_OFF;
}

uint32_t isaac_lua_engine_wrapper_box10_payload_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_OFF;
}

uint32_t isaac_lua_engine_wrapper_box10_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_METATABLE_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_wrapper_box10_registry_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_wrapper_box10_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_wrapper_box10_payload_lo_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_LO_OFF;
}

uint32_t isaac_lua_engine_wrapper_box10_payload_hi_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX10_PAYLOAD_HI_OFF;
}

uint32_t isaac_lua_engine_wrapper_box8_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX8_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_wrapper_box8_vtable_tag_va(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX8_VTABLE_TAG_VA;
}

uint32_t isaac_lua_engine_wrapper_box8_payload_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX8_PAYLOAD_OFF;
}

uint32_t isaac_lua_engine_wrapper_box8_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX8_METATABLE_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_wrapper_box8_registry_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX8_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_wrapper_box8_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_BOX8_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_wrapper_float_slot_stack_off(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_FLOAT_SLOT_STACK_OFF;
}

uint32_t isaac_lua_engine_wrapper_pushstring_iat_lua_pushstring(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHSTRING;
}

uint32_t isaac_lua_engine_wrapper_pushstring_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_WRAPPER_PUSHSTRING_IAT_LUA_PUSHNIL;
}

/* ---------------------------------------------------------------------------
 * ABI v49 — FontRenderSettings accessor wrapper BODIES 0x008a89e0
 * (GetAlignment) + 0x008a8a40 (SetMaxCharacters/EnableAutoWrap/
 * EnableTruncation). Shared arg conduct: L=[ebp+8]; lua_type(L,1)
 * @0xb18400; FULL-WORD gate; check 0x85c590 (flags vary) with key
 * 0xc82986; obj1=[eax+4]; touserdata(L, 0xfff0b9d7) @0xb183b0;
 * fn=ud[0]; per-wrapper conduct/tail. The lua_* IAT calls, the
 * check/get helper body and the real_fn stay host. No uint8_t.
 * ------------------------------------------------------------------------- */

static int32_t fontsettings_wrapper_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT) ? 1 : 0;
}

static const uint32_t kFontsettingsWrapperVa[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_VA};

static const uint32_t kFontsettingsWrapperRetVa[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_RET_VA};

/* First ret the disassembler hits (Load's MID-BODY RET TRAP 0x8a8d53;
 * equal to ret_va everywhere else). Body geometry uses the TRUE tail ret. */
static const uint32_t kFontsettingsWrapperFirstRetVa[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_FIRST_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_RET_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_RET_VA};

static const int32_t kFontsettingsWrapperInsnCount[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_INSNS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_INSNS};

static const int32_t kFontsettingsWrapperCheckFlags[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_CHECK_FLAGS,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_CHECK_FLAGS};

static const int32_t kFontsettingsWrapperReturnValue[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_RETURN_VALUE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_RETURN_VALUE};

static const int32_t kFontsettingsWrapperArg2Kind[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_LOWW,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_FULLWORD,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKNUMBER_F32,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_GATED,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_BYTE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKLSTRING_GATED,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_NONE,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_CHECKINTEGER_FULLWORD};

static const int32_t kFontsettingsWrapperArg2Index[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    0, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 2, 0, 2};

static const int32_t kFontsettingsWrapperTailKind[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHBOOLEAN,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHNUMBER_F32,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHBOOLEAN,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINTEGER_HI0,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_PUSHINT_HELPER,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_TAIL_VOID};

/* Tail helper/IAT slot per row (VOID/PUSHINTEGER rows -> 0). */
static const uint32_t kFontsettingsWrapperTailHelperVa[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHINTEGER,
    0u, 0u,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_TAIL_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_TAIL_HELPER_VA,
    0u,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_TAIL_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_TAIL_HELPER_VA,
    0u, 0u,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_TAIL_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_TAIL_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_TAIL_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_TAIL_HELPER_VA,
    0u};

/* Per-row registry keys: alpha 0xc82986 (indices 0..7) / beta 0xc82989
 * (8..14 — the Load install run). */
static const uint32_t kFontsettingsWrapperRegistryKey[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_ALPHA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY_BETA};

static const uint32_t kFontsettingsWrapperInstallVa[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_INSTALL_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_INSTALL_VA};

static const uint32_t kFontsettingsWrapperInstallLiteralVa[ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_WRAPPER_0_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_1_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_2_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_3_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_4_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_5_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_6_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_7_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_8_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_9_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_10_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_11_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_12_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_13_INSTALL_SITE_VA,
    ISAAC_LUA_FONTSETTINGS_WRAPPER_14_INSTALL_SITE_VA};

int32_t isaac_lua_engine_fontsettings_wrapper_count(void) {
  return ISAAC_LUA_FONTSETTINGS_WRAPPER_COUNT;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_va(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_ret_va(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperRetVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_body_bytes(int32_t index) {
  if (fontsettings_wrapper_index_ok(index) == 0) return 0u;
  /* first ret - body VA (ret excluded, family convention). */
  return (uint32_t)(kFontsettingsWrapperRetVa[index] -
                    kFontsettingsWrapperVa[index]);
}

int32_t isaac_lua_engine_fontsettings_wrapper_insn_count(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperInsnCount[index]
             : -1;
}

int32_t isaac_lua_engine_fontsettings_wrapper_check_flags(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperCheckFlags[index]
             : -1;
}

int32_t isaac_lua_engine_fontsettings_wrapper_return_value(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperReturnValue[index]
             : -1;
}

int32_t isaac_lua_engine_fontsettings_wrapper_arg2_kind(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperArg2Kind[index]
             : -1;
}

int32_t isaac_lua_engine_fontsettings_wrapper_arg2_index(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperArg2Index[index]
             : -1;
}

int32_t isaac_lua_engine_fontsettings_wrapper_tail_kind(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperTailKind[index]
             : -1;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_type_index(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_TYPE_INDEX;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_check_stack_index(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_CHECK_STACK_INDEX;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_registry_key(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_REGISTRY_KEY;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_fn_off(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_FN_OFF;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_CHECK_HELPER_VA;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_pushinteger(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHINTEGER;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_object_resolve(
    uint32_t type_result, uint32_t check_field) {
  /* PE `test eax,eax; je obj_zero` @ 0x8a89f4 / 0x8a8a55 — FULL-WORD
     zero test of the lua_type(L,1) result; obj = (type != 0) ?
     check_field : 0. Never byte-masked: 0x100/0x1ff/0xffffffff all
     resolve to check_field. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_arg2_low_word(uint32_t value) {
  /* PE `movzx edx, ax` @ 0x8a8a90 — LOW-WORD (16-bit) zero-extend of the
     luaL_checkinteger(L,2) result, passed to ud[0](obj, word). Never a
     byte mask (0x100 must survive) and never a full-word pass (0x10000
     must drop to 0). */
  return value & (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_ARG2_LOW_WORD_MASK;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_getter_lua_integer_hi(
    uint32_t value) {
  /* PE `cdq` @ 0x8a8a2a sign-extends the fn's i32 return (eax) into
     edx:eax before lua_pushinteger. hi = bit31 ? 0xffffffff : 0. */
  return (value & 0x80000000u) != 0u ? 0xffffffffu : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_getter_push_cleanup(void) {
  /* add esp, 0xc @ 0x8a8a34 after call [0xb183f8] (3 pushed dwords:
     hi, lo, L). */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_GETTER_PUSH_CLEAN;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_setter_stack_clean(void) {
  /* add esp, 0x10 @ 0x8a8a8d after call [0xb183f4] (4 pushed dwords:
     touserdata upvalueindex + L, checkinteger index + L). */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_SETTER_STACK_CLEAN;
}

/* ABI v51 — Load-band wrapper laws (0x8a8970..0x8a9180). */

uint32_t isaac_lua_engine_fontsettings_wrapper_registry_key_i(int32_t index) {
  /* Per-row keys: 0xc82986 (GetAlignment/setter/0x8a8970..0x8a8c80 band)
     vs 0xc82989 (Load/Unload/IsLoaded/GetCharacterWidth/GetStringWidth/
     GetLineHeight/SetMissingCharacter). PE push 0xc82986 @ 0x8a8996 /
     push 0xc82989 @ 0x8a8d05. */
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperRegistryKey[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_first_ret_va(int32_t index) {
  /* Load's mid-body ret trap 0x8a8d53 (reached only from the nil path);
     the jne @0x8a8d3e branches past it. Equal to ret_va everywhere else. */
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperFirstRetVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_tail_helper_va(int32_t index) {
  /* Tail slots: PUSHBOOLEAN IAT 0xb183ec, PUSHINT_HELPER
     0x85c010/0x85bff0, PUSHNUMBER_F32 0x85c050, PUSHINTEGER_HI0 IAT
     0xb183f8. 0 for VOID/PUSHINTEGER rows. */
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperTailHelperVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_arg2_full_word(uint32_t value) {
  /* PE `push eax` @ 0x8a89cf (0x8a8970) / 0x8a91df (0x8a9180): the WHOLE
     checkinteger result crosses to ud[0] — no movzx (unlike the 0x8a8a40
     setter's low-word). 0x10000 must survive. */
  return value;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_arg2_byte0(uint32_t value) {
  /* PE `mov dl,[eax]` @ 0x8a8e95 (0x8a8e40): byte0 of the checklstring.
     The pushed dword carries garbage upper bytes from the [ebp-4] slot;
     the meaningful law is the low byte (0x1ff -> 0xff, 0x100 -> 0). */
  return value & 0xffu;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_checklstring_gate(
    uint32_t type_result, uint32_t string_result) {
  /* PE second lua_type(L,2) + FULL-WORD `test eax,eax` @ 0x8a8d3c (Load) /
     0x8a8f1c (GetStringWidth): nil -> NULL arg to ud[0], any non-zero
     type -> the luaL_checklstring(L,2,NULL) result. Never byte-masked. */
  return type_result != 0u ? string_result : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_bool_low_byte(uint32_t value) {
  /* PE `xor ecx,ecx; test al,al; setne cl` @ 0x8a8b5a (0x8a8b10) /
     0x8a8e1a (0x8a8dd0): LOW-BYTE test of the fn's bool return,
     normalized to 0/1 before lua_pushboolean. */
  return (value & 0xffu) != 0u ? 1u : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_checklstring(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_CHECKLSTRING;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_IAT_LUA_PUSHBOOLEAN;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_second_type_clean(void) {
  /* add esp, 0x10 @ 0x8a8d39 / 0x8a8f19 (4 dwords: upvalueindex + L +
     type-2 index + L). */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_SECOND_TYPE_CLEAN;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_checklstring_clean(void) {
  /* add esp, 0xc @ 0x8a8d63 / 0x8a8f2b (3 pushed dwords: &len=0, index 2,
     L). */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_CHECKLSTRING_CLEAN;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_charbyte_stack_clean(void) {
  /* add esp, 0x14 @ 0x8a8e90 (5 pushed dwords: upvalueindex + L + 0 +
     index 2 + L). */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_CHARBYTE_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_pushinteger_hi0(void) {
  /* GetStringWidth tail `push 0` @ 0x8a8f3b: pushinteger(L, hi=0, lo) —
     UNSIGNED, unlike GetAlignment's cdq sign-extend. */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_pushinteger_hi0_clean(void) {
  /* add esp, 0xc @ 0x8a8f45 (hi, lo, L). */
  return (uint32_t)ISAAC_LUA_FONTSETTINGS_WRAPPER_PUSHINTEGER_HI0_CLEAN;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_install_va(int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperInstallVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_wrapper_install_literal_va(
    int32_t index) {
  return fontsettings_wrapper_index_ok(index) != 0
             ? kFontsettingsWrapperInstallLiteralVa[index]
             : 0u;
}

static int32_t fontsettings_site_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_FONTSETTINGS_SITE_COUNT) ? 1 : 0;
}

static const uint32_t kFontsettingsSiteCallVa[ISAAC_LUA_FONTSETTINGS_SITE_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_SITE_0_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_1_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_2_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_3_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_4_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_5_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_6_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_7_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_8_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_9_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_10_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_11_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_12_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_13_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_14_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_15_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_16_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_17_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_18_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_19_CALL_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_20_CALL_VA};

static const uint32_t kFontsettingsSiteNameVa[ISAAC_LUA_FONTSETTINGS_SITE_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_SITE_0_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_1_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_2_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_3_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_4_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_5_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_6_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_7_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_8_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_9_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_10_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_11_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_12_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_13_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_14_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_15_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_16_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_17_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_18_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_19_NAME_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_20_NAME_VA};

static const uint32_t kFontsettingsSiteRealFnVa[ISAAC_LUA_FONTSETTINGS_SITE_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_SITE_0_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_1_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_2_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_3_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_4_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_5_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_6_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_7_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_8_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_9_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_10_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_11_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_12_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_13_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_14_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_15_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_16_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_17_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_18_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_19_REAL_FN_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_20_REAL_FN_VA};

static const uint32_t kFontsettingsSiteHelperVa[ISAAC_LUA_FONTSETTINGS_SITE_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_SITE_0_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_1_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_2_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_3_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_4_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_5_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_6_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_7_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_8_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_9_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_10_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_11_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_12_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_13_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_14_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_15_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_16_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_17_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_18_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_19_HELPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_20_HELPER_VA};

static const uint32_t kFontsettingsSiteWrapperVa[ISAAC_LUA_FONTSETTINGS_SITE_COUNT] = {
    ISAAC_LUA_FONTSETTINGS_SITE_0_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_1_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_2_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_3_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_4_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_5_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_6_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_7_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_8_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_9_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_10_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_11_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_12_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_13_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_14_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_15_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_16_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_17_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_18_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_19_WRAPPER_VA,
    ISAAC_LUA_FONTSETTINGS_SITE_20_WRAPPER_VA};

int32_t isaac_lua_engine_fontsettings_site_count(void) {
  return ISAAC_LUA_FONTSETTINGS_SITE_COUNT;
}

uint32_t isaac_lua_engine_fontsettings_site_call_va(int32_t index) {
  return fontsettings_site_index_ok(index) != 0 ? kFontsettingsSiteCallVa[index]
                                                : 0u;
}

uint32_t isaac_lua_engine_fontsettings_site_name_va(int32_t index) {
  return fontsettings_site_index_ok(index) != 0 ? kFontsettingsSiteNameVa[index]
                                                : 0u;
}

uint32_t isaac_lua_engine_fontsettings_site_real_fn_va(int32_t index) {
  return fontsettings_site_index_ok(index) != 0
             ? kFontsettingsSiteRealFnVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_site_helper_va(int32_t index) {
  return fontsettings_site_index_ok(index) != 0
             ? kFontsettingsSiteHelperVa[index]
             : 0u;
}

uint32_t isaac_lua_engine_fontsettings_site_wrapper_va(int32_t index) {
  return fontsettings_site_index_ok(index) != 0
             ? kFontsettingsSiteWrapperVa[index]
             : 0u;
}

/* ---- ABI v52 — DrawString wrapper 0x008a8fc0 + vec-construction helper
 * 0x008baab0 + getRef helper 0x008bb070.
 *
 * DrawString 0x8a8fc0 (127 insns, ret 0x8a917a): lua_type(L,1) FULL-WORD
 * gate; flags=1 key=0xc82989 edx=1 -> 0x85c590 -> obj=[eax+4];
 * touserdata(L, 0xfff0b9d7); lea ecx,[ebp-0xec]; push L; call 0x8baab0
 * (vec helper; ret 4) -> vec=OUT; lua_type(L,2) FULL-WORD gate; nil ->
 * text=0, else luaL_checklstring(L,2,NULL) @0xb183e4 (cleanup 0xc);
 * real_fn=ud[0]; call fn(obj, text, vec[0], vec[4], vec[8], vec[0xc],
 * &copyA, &copyB); ret 0. SEH: handler 0xb053a8, cookie 0xbf93b4.
 * vec helper 0x8baab0 (100 insns, ret 4): gate lua_type(L,8) FULL-WORD;
 * flags=1 key=0xc82986 edx=8 -> 0x85c590 -> obj8=[eax+4]; obj8==0 ->
 * error ("nil passed to reference" 0xb7539c via 0xb18390); edx=7;
 * ecx=L; call 0x8bb070 -> obj7; four luaL_checknumber(L,6..3)
 * @0xb18324; OUT f32 lanes (3..6) at OUT+{0,4,8,0xc}, obj7 f32 lanes
 * (4..7) at obj7+{0,4,8,0xc}, u32 at OUT+0x20 = obj7+0x10, 16B at
 * OUT+0x24 = obj8+0, 16B at OUT+0x34 = obj8[0x10..0x17]+obj8[0x18]
 * (12 meaningful bytes).
 * getRef 0x8bb070 (36 insns; rets 0x8bb09a nil + 0x8bb0c8 main):
 * (ecx=L, edx=idx REGISTER). lua_type(L,idx) FULL-WORD gate; nil ->
 * error + ret 0; else flags=1 key=0xc82983 edx=idx -> 0x85c590 ->
 * obj=[eax+4]; obj==0 -> error; ret obj. All lua_* IAT + 0x85c590
 * bodies + real_fn stay host. No uint8_t scalar params. */

uint32_t isaac_lua_engine_drawstring_object_resolve(
    uint32_t type_result, uint32_t check_field) {
  /* PE `test eax,eax; je obj_zero` @ 0x8a8ff8 — FULL-WORD gate of the
     lua_type(L,1) result; obj = (type != 0) ? [eax+4] : 0. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_drawstring_text_arg(
    uint32_t type_result, uint32_t lstring_result) {
  /* PE second `lua_type(L,2)` @ 0x8a9041 + FULL-WORD `test eax,eax`
     @ 0x8a904a: nil -> text=0 (skip checklstring); any non-zero type ->
     the luaL_checklstring(L,2,NULL) result. Never byte-masked. */
  return type_result != 0u ? lstring_result : 0u;
}

uint32_t isaac_lua_engine_drawstring_vec_out_f32_off_at(
    int32_t checknumber_index) {
  /* PE `fstp dword [esp+...]` stores: (L,6) -> OUT+0x0c, (L,5) ->
     OUT+0x08, (L,4) -> OUT+0x04, (L,3) -> OUT+0x00 (`fstp [eax]` tail). */
  if (checknumber_index < 3 || checknumber_index > 6) return 0u;
  return (uint32_t)(checknumber_index - 3) << 2;
}

uint32_t isaac_lua_engine_drawstring_vec_obj7_f32_off_at(int32_t lane) {
  /* OUT f32 lanes 4..7 read obj7 + {0x00, 0x04, 0x08, 0x0c}. */
  if (lane < 4 || lane > 7) return 0u;
  return (uint32_t)(lane - 4) << 2;
}

uint32_t isaac_lua_engine_drawstring_vec_gate(
    uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD two-gate (arg8): `test eax,eax; jne` @ 0x8baace then
     `test esi,esi; jne` @ 0x8baaef — any 0 -> luaL_error (raises); the
     law value is the object (or 0 on the error path). */
  return (type_result != 0u && check_field != 0u) ? check_field : 0u;
}

uint32_t isaac_lua_engine_drawstring_getref_resolve(
    uint32_t type_result, uint32_t check_field) {
  /* PE `test eax,eax` @ 0x8bb081 — FULL-WORD gate; nil -> error + ret 0;
     else obj=[eax+4]; obj==0 -> error; ret obj. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_drawstring_getref_edx_index(uint32_t index) {
  /* The idx REGISTER (edx) crosses unchanged to lua_type(L,idx) and the
     0x85c590 edx — FULL-WORD passthrough (0x100/0x10000 survive). */
  return index;
}

uint32_t isaac_lua_engine_drawstring_wrapper_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_WRAPPER_VA;
}
uint32_t isaac_lua_engine_drawstring_wrapper_ret_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_WRAPPER_RET_VA;
}
uint32_t isaac_lua_engine_drawstring_wrapper_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_DRAWSTRING_WRAPPER_RET_VA -
                    ISAAC_LUA_DRAWSTRING_WRAPPER_VA);
}
int32_t isaac_lua_engine_drawstring_wrapper_insn_count(void) {
  return ISAAC_LUA_DRAWSTRING_WRAPPER_INSNS;
}
uint32_t isaac_lua_engine_drawstring_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_SEH_HANDLER_VA;
}
uint32_t isaac_lua_engine_drawstring_gs_cookie_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GS_COOKIE_VA;
}
int32_t isaac_lua_engine_drawstring_check_flags(void) {
  return ISAAC_LUA_DRAWSTRING_CHECK_FLAGS;
}
uint32_t isaac_lua_engine_drawstring_registry_key(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_REGISTRY_KEY;
}
int32_t isaac_lua_engine_drawstring_check_edx(void) {
  return ISAAC_LUA_DRAWSTRING_CHECK_EDX;
}
uint32_t isaac_lua_engine_drawstring_type_index(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_TYPE_INDEX;
}
uint32_t isaac_lua_engine_drawstring_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_OBJECT_FIELD_OFF;
}
uint32_t isaac_lua_engine_drawstring_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_drawstring_fn_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_FN_OFF;
}
uint32_t isaac_lua_engine_drawstring_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_drawstring_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_drawstring_iat_lua_checklstring(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_IAT_LUA_CHECKLSTRING;
}
uint32_t isaac_lua_engine_drawstring_checklstring_clean(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_CHECKLSTRING_CLEAN;
}
uint32_t isaac_lua_engine_drawstring_vec_helper_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_HELPER_VA;
}
uint32_t isaac_lua_engine_drawstring_vec_out_frame_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_OUT_FRAME_OFF;
}
int32_t isaac_lua_engine_drawstring_call_args(void) {
  return ISAAC_LUA_DRAWSTRING_CALL_ARGS;
}
int32_t isaac_lua_engine_drawstring_call_f32_count(void) {
  return ISAAC_LUA_DRAWSTRING_CALL_F32_COUNT;
}
int32_t isaac_lua_engine_drawstring_call_struct_count(void) {
  return ISAAC_LUA_DRAWSTRING_CALL_STRUCT_COUNT;
}
int32_t isaac_lua_engine_drawstring_return_value(void) {
  return ISAAC_LUA_DRAWSTRING_RETURN_VALUE;
}
uint32_t isaac_lua_engine_drawstring_install_helper_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_INSTALL_HELPER_VA;
}
uint32_t isaac_lua_engine_drawstring_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_drawstring_vec_helper_ret_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_RET_VA;
}
uint32_t isaac_lua_engine_drawstring_vec_helper_body_bytes(void) {
  return (uint32_t)((uint32_t)ISAAC_LUA_DRAWSTRING_VEC_RET_VA -
                    (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_HELPER_VA);
}
int32_t isaac_lua_engine_drawstring_vec_helper_insn_count(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_INSNS;
}
int32_t isaac_lua_engine_drawstring_vec_helper_ret_clean(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_RET_CLEAN;
}
int32_t isaac_lua_engine_drawstring_vec_out_ecx(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_OUT_ECX;
}
uint32_t isaac_lua_engine_drawstring_vec_gate_type_index(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_GATE_TYPE_INDEX;
}
int32_t isaac_lua_engine_drawstring_vec_gate_check_flags(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_GATE_CHECK_FLAGS;
}
uint32_t isaac_lua_engine_drawstring_vec_gate_registry_key(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_GATE_REGISTRY_KEY;
}
int32_t isaac_lua_engine_drawstring_vec_gate_check_edx(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_GATE_CHECK_EDX;
}
uint32_t isaac_lua_engine_drawstring_vec_gate_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_GATE_OBJECT_FIELD_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_error_msg_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_ERROR_MSG_VA;
}
uint32_t isaac_lua_engine_drawstring_vec_iat_lua_error(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_IAT_LUA_ERROR;
}
int32_t isaac_lua_engine_drawstring_vec_getref_edx(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_GETREF_EDX;
}
uint32_t isaac_lua_engine_drawstring_vec_getref_helper_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_GETREF_HELPER_VA;
}
uint32_t isaac_lua_engine_drawstring_vec_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_IAT_LUA_CHECKNUMBER;
}
int32_t isaac_lua_engine_drawstring_vec_checknumber_count(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_CHECKNUMBER_COUNT;
}
uint32_t isaac_lua_engine_drawstring_vec_u32_out_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_U32_OUT_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_u32_obj7_field_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_U32_OBJ7_FIELD_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_block16_a_out_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_A_OUT_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_block16_a_src_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_A_SRC_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_block16_b_out_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_OUT_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_block16_b_src_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_OFF;
}
uint32_t isaac_lua_engine_drawstring_vec_block16_b_src_dword_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_SRC_DWORD_OFF;
}
int32_t isaac_lua_engine_drawstring_vec_block16_b_valid_bytes(void) {
  return ISAAC_LUA_DRAWSTRING_VEC_BLOCK16_B_VALID_BYTES;
}

uint32_t isaac_lua_engine_drawstring_getref_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_VA;
}
uint32_t isaac_lua_engine_drawstring_getref_ret_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_RET_VA;
}
uint32_t isaac_lua_engine_drawstring_getref_nil_ret_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_NIL_RET_VA;
}
uint32_t isaac_lua_engine_drawstring_getref_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_DRAWSTRING_GETREF_RET_VA -
                    ISAAC_LUA_DRAWSTRING_GETREF_VA);
}
int32_t isaac_lua_engine_drawstring_getref_insn_count(void) {
  return ISAAC_LUA_DRAWSTRING_GETREF_INSNS;
}
int32_t isaac_lua_engine_drawstring_getref_check_flags(void) {
  return ISAAC_LUA_DRAWSTRING_GETREF_CHECK_FLAGS;
}
uint32_t isaac_lua_engine_drawstring_getref_registry_key(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_REGISTRY_KEY;
}
int32_t isaac_lua_engine_drawstring_getref_edx_register(void) {
  return ISAAC_LUA_DRAWSTRING_GETREF_EDX_REGISTER;
}
uint32_t isaac_lua_engine_drawstring_getref_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_OBJECT_FIELD_OFF;
}
uint32_t isaac_lua_engine_drawstring_getref_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_drawstring_getref_iat_lua_error(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_IAT_LUA_ERROR;
}
uint32_t isaac_lua_engine_drawstring_getref_error_msg_va(void) {
  return (uint32_t)ISAAC_LUA_DRAWSTRING_GETREF_ERROR_MSG_VA;
}

/* ---- ABI v53 — pusher leaf stubs 0x85c050 / 0x85bff0 / 0x85c010 + the
 * 0x85c590 true-body bounds. Machine truth: cpu-dump/0085c050.txt /
 * 0085bff0.txt / 0085c010.txt / 0085c590.txt + 0085c70f.txt tail
 * (section-notes/lua-v53-pushers). All three pushers share the leaf
 * stub: push ebp; mov ebp,esp; and esp,ALIGN; <marshal>; push ecx;
 * push args; call IAT; add esp,CLEANUP; mov esp,ebp; pop ebp; ret. */

static int32_t pusher_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_PUSHER_COUNT) ? 1 : 0;
}

static const uint32_t kPusherVa[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_0_VA, ISAAC_LUA_PUSHER_1_VA, ISAAC_LUA_PUSHER_2_VA,
    ISAAC_LUA_PUSHER_3_VA};

static const uint32_t kPusherRetVa[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_0_RET_VA, ISAAC_LUA_PUSHER_1_RET_VA,
    ISAAC_LUA_PUSHER_2_RET_VA, ISAAC_LUA_PUSHER_3_RET_VA};

static const int32_t kPusherInsnCount[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_0_INSNS, ISAAC_LUA_PUSHER_1_INSNS,
    ISAAC_LUA_PUSHER_2_INSNS, ISAAC_LUA_PUSHER_3_INSNS};

static const uint32_t kPusherStackAlignMask[ISAAC_LUA_PUSHER_COUNT] = {
    (uint32_t)ISAAC_LUA_PUSHER_0_STACK_ALIGN_MASK,
    (uint32_t)ISAAC_LUA_PUSHER_1_STACK_ALIGN_MASK,
    (uint32_t)ISAAC_LUA_PUSHER_2_STACK_ALIGN_MASK,
    (uint32_t)ISAAC_LUA_PUSHER_3_STACK_ALIGN_MASK};

static const int32_t kPusherF64SlotBytes[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_0_F64_SLOT_BYTES, ISAAC_LUA_PUSHER_1_F64_SLOT_BYTES,
    ISAAC_LUA_PUSHER_2_F64_SLOT_BYTES, ISAAC_LUA_PUSHER_3_F64_SLOT_BYTES};

static const uint32_t kPusherIatVa[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_0_IAT_VA, ISAAC_LUA_PUSHER_1_IAT_VA,
    ISAAC_LUA_PUSHER_2_IAT_VA, ISAAC_LUA_PUSHER_3_IAT_VA};

static const int32_t kPusherCleanup[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_0_CLEANUP, ISAAC_LUA_PUSHER_1_CLEANUP,
    ISAAC_LUA_PUSHER_2_CLEANUP, ISAAC_LUA_PUSHER_3_CLEANUP};

static const int32_t kPusherKind[ISAAC_LUA_PUSHER_COUNT] = {
    ISAAC_LUA_PUSHER_KIND_PUSHNUMBER_F32, ISAAC_LUA_PUSHER_KIND_PUSHINT_U32,
    ISAAC_LUA_PUSHER_KIND_PUSHINT_U16, ISAAC_LUA_PUSHER_KIND_PUSHINT_I32_SEXT};

int32_t isaac_lua_engine_pusher_count(void) {
  return ISAAC_LUA_PUSHER_COUNT;
}

uint32_t isaac_lua_engine_pusher_va(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherVa[index] : 0u;
}

uint32_t isaac_lua_engine_pusher_ret_va(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherRetVa[index] : 0u;
}

uint32_t isaac_lua_engine_pusher_body_bytes(int32_t index) {
  if (pusher_index_ok(index) == 0) return 0u;
  return (uint32_t)(kPusherRetVa[index] - kPusherVa[index]);
}

int32_t isaac_lua_engine_pusher_insn_count(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherInsnCount[index] : -1;
}

uint32_t isaac_lua_engine_pusher_stack_align_mask(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherStackAlignMask[index] : 0u;
}

int32_t isaac_lua_engine_pusher_f64_slot_bytes(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherF64SlotBytes[index] : -1;
}

uint32_t isaac_lua_engine_pusher_iat_va(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherIatVa[index] : 0u;
}

int32_t isaac_lua_engine_pusher_call_cleanup(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherCleanup[index] : -1;
}

int32_t isaac_lua_engine_pusher_kind(int32_t index) {
  return pusher_index_ok(index) != 0 ? kPusherKind[index] : -1;
}

uint32_t isaac_lua_engine_pusher_pushnumber_f32_widen_hi(uint32_t f32_bits) {
  /* cvtss2sd xmm0,xmm1 @0x85c05c — EXACT IEEE f32->f64 widening (RN;
     f32 fits in f64, no double rounding). Return the f64 HIGH dword. */
  float f;
  double d;
  uint64_t u;
  __builtin_memcpy(&f, &f32_bits, sizeof(f));
  d = (double)f;
  __builtin_memcpy(&u, &d, sizeof(u));
  return (uint32_t)(u >> 32);
}

uint32_t isaac_lua_engine_pusher_pushnumber_f32_widen_lo(uint32_t f32_bits) {
  float f;
  double d;
  uint64_t u;
  __builtin_memcpy(&f, &f32_bits, sizeof(f));
  d = (double)f;
  __builtin_memcpy(&u, &d, sizeof(u));
  return (uint32_t)(u & 0xffffffffu);
}

uint32_t isaac_lua_engine_pusher_pushint_u32_lo(uint32_t value) {
  /* push edx @0x85bff8 — the FULL 32-bit word, no mask (a u16/byte fold
     is wrong: 0xffffffff / 0x10000 must survive). */
  return value;
}

uint32_t isaac_lua_engine_pusher_pushint_u32_hi(uint32_t value) {
  /* push 0 @0x85bff6 — hi is the literal 0, never a sign-extend. */
  (void)value;
  return 0u;
}

uint32_t isaac_lua_engine_pusher_pushint_u16_lo(uint32_t value) {
  /* movzx eax,dx @0x85c016 — the 16-bit LOW WORD only. */
  return (uint32_t)(value & 0xffffu);
}

uint32_t isaac_lua_engine_pusher_pushint_u16_hi(uint32_t value) {
  /* cdq @0x85c019 after movzx: eax in [0,0xffff] is never sign-negative,
     so hi is ALWAYS 0 (a movsx/sign16 fold fails dx=0x8000). */
  (void)value;
  return 0u;
}

uint32_t isaac_lua_engine_pusher_pushint_i32_sext_lo(uint32_t value) {
  /* v55 — 0x85bfd0 `mov eax, edx` @0x85bfd6: the FULL 32-bit word, no
     mask (a u16/byte fold is WRONG: 0xffffffff / 0x10000 survive). */
  return value;
}

uint32_t isaac_lua_engine_pusher_pushint_i32_sext_hi(uint32_t value) {
  /* v55 — 0x85bfd8 `cdq` after mov eax,edx: EDX becomes the replicated
     sign of the FULL 32-bit value (bit31). 0x80000000 -> 0xffffffff;
     0x100 -> 0; 0x00008000 -> 0 (bit15 is IRRELEVANT; a movsx/sign16
     fold fails). NOT the literal-0 PUSHINT_U32 law (0x85bff6). */
  return (value & 0x80000000u) != 0u ? 0xffffffffu : 0u;
}

uint32_t isaac_lua_engine_check_get_body_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_BODY_VA;
}

uint32_t isaac_lua_engine_check_get_success_ret_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_SUCCESS_RET_VA;
}

uint32_t isaac_lua_engine_check_get_true_ret_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TRUE_RET_VA;
}

uint32_t isaac_lua_engine_check_get_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_CHECK_GET_TRUE_RET_VA -
                    ISAAC_LUA_CHECK_GET_BODY_VA);
}

int32_t isaac_lua_engine_check_get_insn_count(void) {
  return ISAAC_LUA_CHECK_GET_BODY_INSNS;
}

int32_t isaac_lua_engine_check_get_dual_ret(void) {
  return (ISAAC_LUA_CHECK_GET_SUCCESS_RET_VA != ISAAC_LUA_CHECK_GET_TRUE_RET_VA)
             ? 1
             : 0;
}

uint32_t isaac_lua_engine_check_get_success_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_SUCCESS_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_check_get_success_cleanup(void) {
  return ISAAC_LUA_CHECK_GET_SUCCESS_CLEANUP;
}

/* ---- ABI v47 — per-site install records (RegisterClasses Vector) ---- */

struct IsaacLuaInstallSiteEntry {
  uint32_t call_va;   /* register-held call site (mov ecx,L; mov edx,name;
                         push real_fn; call helper; add esp,4) */
  int32_t helper_index;
  uint32_t name_va;   /* edx immediate at the site */
  uint32_t real_fn_va; /* pushed immediate at the site */
};

static const IsaacLuaInstallSiteEntry kInstallSites[] = {
    {0x00866a97u, 2, 0x00b701c0u, 0x00a0ffc0u}, /* Normalize */
    {0x00866aacu, 1, 0x00b701ccu, 0x00a10030u}, /* Normalized */
    {0x00866ac1u, 0, 0x00b701b4u, 0x00a10180u}, /* Dot */
    {0x00866ad6u, 0, 0x00b701b8u, 0x00a101a0u}, /* Cross */
    {0x00866aebu, 3, 0x00b70244u, 0x00a10210u}, /* Lerp */
    {0x00866b00u, 0, 0x00b7024cu, 0x00a0ff30u}, /* Distance */
    {0x00866b15u, 0, 0x00b7022cu, 0x00a0ff90u}, /* DistanceSquared */
    {0x00866b2au, 4, 0x00b7023cu, 0x00a102e0u}, /* Rotated */
    {0x00866b76u, 5, 0x00b7021cu, 0x00a10390u}, /* GetAngleDegrees */
    {0x00866b8bu, 6, 0x00b70200u, 0x00a100b0u}, /* Resize */
    {0x00866ba0u, 4, 0x00b70208u, 0x00a10100u}, /* Resized */
    {0x00866bb5u, 7, 0x00b70290u, 0x00a103c0u}, /* Clamp */
    {0x00866bcau, 8, 0x00b70298u, 0x00a103f0u}, /* Clamped */
    {0x00866bdfu, 5, 0x00b70278u, 0x00a0fea0u}, /* Length */
    {0x00866bf4u, 5, 0x00b70280u, 0x00a0fed0u}, /* LengthSquared */
    {0x00866c09u, 9, 0x00b70268u, 0x00a10420u}, /* __add */
    {0x00866c1eu, 9, 0x00b70270u, 0x00a10480u}, /* __sub */
    {0x00866c33u, 10, 0x00b70258u, 0x00a104e0u}, /* __mul */
    {0x00866c48u, 10, 0x00b70260u, 0x00a105a0u}, /* __div */
    {0x00866c5du, 1, 0x00b702f8u, 0x00a10660u}, /* __unm */
    {0x00866c72u, 11, 0x00b70300u, 0x0085e630u}, /* __tostring */
    /* v50 — FontRenderSettings install run (E8 into helpers 12/13). */
    {0x00866dccu, 12, 0x00b702a0u, 0x0040c3a0u}, /* GetAlignment */
    {0x00866de1u, 13, 0x00b702b0u, 0x00a1a5d0u}, /* SetMaxCharacters */
    {0x00866e0bu, 13, 0x00b703a8u, 0x0085e450u}, /* EnableAutoWrap */
    {0x00866e35u, 13, 0x00b70380u, 0x00a1a600u}, /* EnableTruncation */
    /* v51 — FontRenderSettings install-run sites 25..41 (helpers 14..28). */
    {0x00866db7u, 14, 0x00b702d8u, 0x00a1a5c0u}, /* SetAlignment */
    {0x00866df6u, 15, 0x00b70394u, 0x00a1a5e0u}, /* GetMaxCharacters */
    {0x00866e20u, 16, 0x00b7036cu, 0x00a1a5f0u}, /* IsAutoWrapEnabled */
    {0x00866e4au, 16, 0x00b70340u, 0x00a1a620u}, /* IsTruncationEnabled */
    {0x00866e5fu, 17, 0x00b70354u, 0x00407280u}, /* SetLineHeightModifier */
    {0x00866e74u, 18, 0x00b7030cu, 0x00407270u}, /* GetLineHeightModifier */
    {0x00866e89u, 19, 0x00b70324u, 0x00a1a630u}, /* SetMissingCharacterOverride */
    {0x00866e9eu, 20, 0x00b70408u, 0x0040c2e0u}, /* GetMissingCharacterOverride */
    {0x00866efcu, 21, 0x00b703f8u, 0x0085e470u}, /* Load */
    {0x00866f11u, 22, 0x00b70400u, 0x00a1ad90u}, /* Unload */
    {0x00866f26u, 23, 0x00b703d8u, 0x006b83d0u}, /* IsLoaded */
    {0x00866f3bu, 24, 0x00b703e4u, 0x00a1ae70u}, /* GetCharacterWidth */
    {0x00866f50u, 25, 0x00b703b8u, 0x00a1ae80u}, /* GetStringWidth */
    {0x00866f65u, 26, 0x00b703c8u, 0x00a1aea0u}, /* GetLineHeight */
    {0x00866f7au, 26, 0x00b70454u, 0x00a1aeb0u}, /* GetBaselineHeight */
    {0x00866f8fu, 27, 0x00b70468u, 0x00a1b140u}, /* DrawString */
    {0x00866fa4u, 28, 0x00b7043cu, 0x00a1b3b0u}, /* SetMissingCharacter */
};

static int32_t install_site_index_ok(int32_t index) {
  return (index >= 0 && index < ISAAC_LUA_INSTALL_SITE_COUNT) ? 1 : 0;
}

int32_t isaac_lua_engine_install_site_count(void) {
  return ISAAC_LUA_INSTALL_SITE_COUNT;
}

uint32_t isaac_lua_engine_install_site_call_va(int32_t index) {
  return install_site_index_ok(index) != 0 ? kInstallSites[index].call_va : 0u;
}

int32_t isaac_lua_engine_install_site_helper_index(int32_t index) {
  return install_site_index_ok(index) != 0 ? kInstallSites[index].helper_index
                                           : -1;
}

uint32_t isaac_lua_engine_install_site_name_va(int32_t index) {
  return install_site_index_ok(index) != 0 ? kInstallSites[index].name_va : 0u;
}

uint32_t isaac_lua_engine_install_site_real_fn_va(int32_t index) {
  return install_site_index_ok(index) != 0 ? kInstallSites[index].real_fn_va
                                           : 0u;
}

int32_t isaac_lua_engine_install_site_index_for_call_va(uint32_t call_va) {
  int32_t i;
  for (i = 0; i < ISAAC_LUA_INSTALL_SITE_COUNT; ++i) {
    if (kInstallSites[i].call_va == call_va) {
      return i;
    }
  }
  return -1;
}

int32_t isaac_lua_engine_install_site_chain_count(int32_t index) {
  if (install_site_index_ok(index) == 0) return -1;
  /* rawset chains: dual + dual-imm shapes run the install record TWICE
     (pushvalue duplicated the closure), single runs it once. */
  return kInstallHelperShape[kInstallSites[index].helper_index] ==
                 ISAAC_LUA_INSTALL_SHAPE_SINGLE
             ? 1
             : 2;
}

uint32_t isaac_lua_engine_install_site_consumed_name_va(int32_t index,
                                                        uint32_t name_va) {
  /* Register-vs-immediate consume law, keyed on the per-helper SOURCE
     table (ABI v50): REGISTER helpers (DUAL rows 0/1/4/5/9/10 + SINGLE-reg
     helper 13) CONSUME the edx register — pass the operand through;
     IMMEDIATE helpers (SINGLE-imm + DUAL_IMM incl. helper 12) IGNORE the
     passed operand and return the body imm. Never mask. */
  if (install_site_index_ok(index) == 0) return 0u;
  const int32_t helper = kInstallSites[index].helper_index;
  if (kInstallHelperNameSource[helper] == ISAAC_LUA_INSTALL_SOURCE_REGISTER) {
    return name_va;
  }
  return kInstallHelperNameImm[helper];
}

uint32_t isaac_lua_engine_install_site_consumed_real_fn_va(int32_t index,
                                                           uint32_t real_fn_va) {
  /* Same law for ud[0]: REGISTER helpers store [ebp+8] (DUAL rows
     0x8a0487 / 0x8a0527 / 0x8a0387; SINGLE-reg helper 13 @ 0x89fd93/0x89fd9e),
     IMMEDIATE helpers store the imm (SINGLE-imm 0x8a05b5, DUAL_IMM
     0x8a00dc / 0x89fefc / 0x89fdfc helper 12). */
  if (install_site_index_ok(index) == 0) return 0u;
  const int32_t helper = kInstallSites[index].helper_index;
  if (kInstallHelperRealFnSource[helper] == ISAAC_LUA_INSTALL_SOURCE_REGISTER) {
    return real_fn_va;
  }
  return kInstallHelperRealFnImm[helper];
}

uint32_t isaac_lua_engine_install_site_stack_arg_bytes_total(int32_t index) {
  /* Total host stack-arg bytes the helper cleans: dual + dual-imm
     shapes 0x40 then 0x24 (25 pushes), single 0x38 (14 pushes). */
  if (install_site_index_ok(index) == 0) return 0u;
  if (kInstallHelperShape[kInstallSites[index].helper_index] ==
      ISAAC_LUA_INSTALL_SHAPE_SINGLE) {
    return (uint32_t)ISAAC_LUA_INSTALL_SINGLE_CLEANUP;
  }
  return (uint32_t)(ISAAC_LUA_INSTALL_DUAL_CLEANUP_FIRST +
                    ISAAC_LUA_INSTALL_DUAL_CLEANUP_SECOND);
}

/* ---- ABI v18 — metatable builders shared by the class-create template ---- */

int32_t isaac_lua_engine_metatable_protect_gate(uint32_t gate_return) {
  /* PE @ 0x0085d261 / 0x0085d4ba / 0x0085d6a7: `test al, al` reads only the
     low byte of the return, then `je` skips the __metatable install. */
  return (gate_return & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_const_prefix_string_len(uint32_t class_name_len) {
  return (uint32_t)((uint32_t)ISAAC_LUA_CONST_PREFIX_LEN + class_name_len);
}

struct IsaacLuaMetafieldEntry {
  uint32_t call_va;   /* the pushstring that names the field */
  uint32_t name_va;
  int32_t value_kind;
  uint32_t value_va;    /* closure VA for CLOSURE, else 0 */
  uint32_t value_index; /* stack index for PUSHVALUE, else 0 */
  uint32_t absindex;
  int32_t gated;
};

static const IsaacLuaMetafieldEntry kConstMetafields[] = {
    {0x0085d185u, 0x00b6e9ccu, ISAAC_LUA_METAFIELD_VALUE_STRING_PREFIXED, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d1c5u, 0x00b6ea78u, ISAAC_LUA_METAFIELD_VALUE_CLOSURE, 0x0085cd40u, 0u,
     0xfffffffeu, 0},
    {0x0085d205u, 0x00b6ea80u, ISAAC_LUA_METAFIELD_VALUE_CLOSURE, 0x0085cf30u, 0u,
     0xfffffffeu, 0},
    {0x0085d240u, 0x00b6e994u, ISAAC_LUA_METAFIELD_VALUE_NEWTABLE, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d280u, 0x00b6ea64u, ISAAC_LUA_METAFIELD_VALUE_NIL, 0u, 0u,
     0xfffffffeu, 1},
};

static const IsaacLuaMetafieldEntry kClassMetafields[] = {
    {0x0085d326u, 0x00b6e9ccu, ISAAC_LUA_METAFIELD_VALUE_STRING_NAME, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d366u, 0x00b6ea78u, ISAAC_LUA_METAFIELD_VALUE_CLOSURE, 0x0085cd40u, 0u,
     0xfffffffeu, 0},
    {0x0085d3a6u, 0x00b6ea80u, ISAAC_LUA_METAFIELD_VALUE_CLOSURE, 0x0085cf30u, 0u,
     0xfffffffeu, 0},
    {0x0085d3e6u, 0x00b6e994u, ISAAC_LUA_METAFIELD_VALUE_NEWTABLE, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d420u, 0x00b6ea38u, ISAAC_LUA_METAFIELD_VALUE_NEWTABLE, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d45eu, 0x00b6e9c4u, ISAAC_LUA_METAFIELD_VALUE_PUSHVALUE, 0u,
     0xfffffffeu, 0xfffffffeu, 0},
    /* the one absindex(-3) record in the whole family */
    {0x0085d499u, 0x00b6ea70u, ISAAC_LUA_METAFIELD_VALUE_PUSHVALUE, 0u,
     0xffffffffu, 0xfffffffdu, 0},
    {0x0085d4d9u, 0x00b6ea64u, ISAAC_LUA_METAFIELD_VALUE_NIL, 0u, 0u,
     0xfffffffeu, 1},
};

static const IsaacLuaMetafieldEntry kStaticMetafields[] = {
    {0x0085d594u, 0x00b6ea78u, ISAAC_LUA_METAFIELD_VALUE_CLOSURE, 0x0085c810u, 0u,
     0xfffffffeu, 0},
    {0x0085d5d3u, 0x00b6ea80u, ISAAC_LUA_METAFIELD_VALUE_CLOSURE, 0x0085c970u, 0u,
     0xfffffffeu, 0},
    {0x0085d613u, 0x00b6e994u, ISAAC_LUA_METAFIELD_VALUE_NEWTABLE, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d64du, 0x00b6ea38u, ISAAC_LUA_METAFIELD_VALUE_NEWTABLE, 0u, 0u,
     0xfffffffeu, 0},
    {0x0085d686u, 0x00b6ea70u, ISAAC_LUA_METAFIELD_VALUE_PUSHVALUE, 0u,
     0xfffffffeu, 0xfffffffeu, 0},
    {0x0085d6c6u, 0x00b6ea64u, ISAAC_LUA_METAFIELD_VALUE_NIL, 0u, 0u,
     0xfffffffeu, 1},
};

struct IsaacLuaMetatableBuilder {
  uint32_t builder_va;
  int32_t count;
  const IsaacLuaMetafieldEntry *entries;
};

static const IsaacLuaMetatableBuilder kMetatableBuilders[] = {
    {0x0085d040u, 5, kConstMetafields},
    {0x0085d2c0u, 8, kClassMetafields},
    {0x0085d500u, 6, kStaticMetafields},
};

static const int32_t kMetatableBuilderCount =
    (int32_t)(sizeof(kMetatableBuilders) / sizeof(kMetatableBuilders[0]));

static const IsaacLuaMetatableBuilder *builder_at(int32_t builder) {
  return (builder >= 0 && builder < kMetatableBuilderCount)
             ? &kMetatableBuilders[builder]
             : (const IsaacLuaMetatableBuilder *)0;
}

static const IsaacLuaMetafieldEntry *metafield_at(int32_t builder,
                                                  int32_t index) {
  const IsaacLuaMetatableBuilder *b = builder_at(builder);
  if (b == 0 || index < 0 || index >= b->count) {
    return (const IsaacLuaMetafieldEntry *)0;
  }
  return &b->entries[index];
}

int32_t isaac_lua_engine_metatable_builder_count(void) {
  return kMetatableBuilderCount;
}

uint32_t isaac_lua_engine_metatable_builder_va(int32_t builder) {
  const IsaacLuaMetatableBuilder *b = builder_at(builder);
  return b != 0 ? b->builder_va : 0u;
}

int32_t isaac_lua_engine_metafield_count(int32_t builder) {
  const IsaacLuaMetatableBuilder *b = builder_at(builder);
  return b != 0 ? b->count : -1;
}

uint32_t isaac_lua_engine_metafield_call_va(int32_t builder, int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->call_va : 0u;
}

uint32_t isaac_lua_engine_metafield_name_va(int32_t builder, int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->name_va : 0u;
}

int32_t isaac_lua_engine_metafield_value_kind(int32_t builder, int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->value_kind : -1;
}

uint32_t isaac_lua_engine_metafield_value_va(int32_t builder, int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->value_va : 0u;
}

uint32_t isaac_lua_engine_metafield_value_index(int32_t builder,
                                                int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->value_index : 0u;
}

uint32_t isaac_lua_engine_metafield_absindex(int32_t builder, int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->absindex : 0u;
}

int32_t isaac_lua_engine_metafield_gated(int32_t builder, int32_t index) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  return e != 0 ? e->gated : -1;
}

int32_t isaac_lua_engine_metafield_installed(int32_t builder, int32_t index,
                                             uint32_t gate_return) {
  const IsaacLuaMetafieldEntry *e = metafield_at(builder, index);
  if (e == 0) {
    return -1;
  }
  if (e->gated == 0) {
    return 1;
  }
  return isaac_lua_engine_metatable_protect_gate(gate_return);
}

int32_t isaac_lua_engine_metafield_installed_count(int32_t builder,
                                                   uint32_t gate_return) {
  const IsaacLuaMetatableBuilder *b = builder_at(builder);
  int32_t total = 0;
  int32_t i;
  if (b == 0) {
    return -1;
  }
  for (i = 0; i < b->count; ++i) {
    if (isaac_lua_engine_metafield_installed(builder, i, gate_return) == 1) {
      total += 1;
    }
  }
  return total;
}

/* ---- ABI v19 — property-builder family + return contract ---- */

/* Family table, ascending VA. Every row is machine-derived from the byte
   census (diff offsets, trampoline imms, ud disp, image-wide E8 scan). */
struct IsaacLuaPropertyBuilderEntry {
  uint32_t va;
  int32_t kind;
  uint32_t get_trampoline_va;
  uint32_t set_trampoline_va;
  uint32_t body_bytes;
  uint32_t body_insns;
  int32_t callsite_count;
};

static const IsaacLuaPropertyBuilderEntry kPropertyBuilders[] = {
    {0x00875230u, ISAAC_LUA_PROPERTY_BUILDER_KIND_SHARED_ARG, 0x008bb2e0u,
     0x008bb340u, 0x16au, 133, 2}, /* Vector X/Y */
    {0x008753a0u, ISAAC_LUA_PROPERTY_BUILDER_KIND_SHARED_ARG, 0x008bb420u,
     0x008bb480u, 0x16au, 133, 4}, /* KColor */
    {0x00875510u, ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG, 0x0089f590u,
     0x0089f500u, 0x16au, 133, 7}, /* Color R/G/B/A/RO/GO/BO */
    {0x00875680u, ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG, 0x0089e970u,
     0x0089e8e0u, 0x16au, 133, 2}, /* Sprite Offset/Scale */
    {0x008757f0u, ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG, 0x0089e870u,
     0x0089e7e0u, 0x16au, 133, 2}, /* Sprite Rotation/PlaybackSpeed */
    {0x00875960u, ISAAC_LUA_PROPERTY_BUILDER_KIND_FOLDED, 0x0089e740u,
     0x0089e6b0u, 0x172u, 131, 1}, /* Sprite Color (folded) */
    {0x00875ae0u, ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG, 0x0089e5a0u,
     0x0089e530u, 0x16au, 133, 2}, /* Sprite FlipX/FlipY */
};

static const int32_t kPropertyBuilderCount =
    (int32_t)(sizeof(kPropertyBuilders) / sizeof(kPropertyBuilders[0]));

static const IsaacLuaPropertyBuilderEntry *property_builder_at(int32_t index) {
  return (index >= 0 && index < kPropertyBuilderCount)
             ? &kPropertyBuilders[index]
             : (const IsaacLuaPropertyBuilderEntry *)0;
}

int32_t isaac_lua_engine_property_builder_count(void) {
  return kPropertyBuilderCount;
}

uint32_t isaac_lua_engine_property_builder_va(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->va : 0u;
}

int32_t isaac_lua_engine_property_builder_kind(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->kind : -1;
}

uint32_t isaac_lua_engine_property_builder_get_trampoline_va(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->get_trampoline_va : 0u;
}

uint32_t isaac_lua_engine_property_builder_set_trampoline_va(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->set_trampoline_va : 0u;
}

uint32_t isaac_lua_engine_property_builder_body_bytes(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->body_bytes : 0u;
}

uint32_t isaac_lua_engine_property_builder_body_insns(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->body_insns : 0u;
}

int32_t isaac_lua_engine_property_builder_callsite_count(int32_t index) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  return e != 0 ? e->callsite_count : -1;
}

int32_t isaac_lua_engine_property_builder_index_for_va(uint32_t va) {
  int32_t i;
  for (i = 0; i < kPropertyBuilderCount; ++i) {
    if (kPropertyBuilders[i].va == va) {
      return i;
    }
  }
  return -1;
}

uint32_t isaac_lua_engine_property_builder_next_va(int32_t index) {
  /* VA deltas measured: 0x170 between all consecutive members except after
     the folded member (0x172 body padded to 0x180). */
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  if (e == 0 || index + 1 >= kPropertyBuilderCount) {
    return 0u;
  }
  return e->va + (e->kind == ISAAC_LUA_PROPERTY_BUILDER_KIND_FOLDED
                      ? (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_STRIDE_AFTER_FOLDED
                      : (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_STRIDE);
}

uint32_t isaac_lua_engine_property_builder_return_this(uint32_t this_ptr) {
  /* PE epilogue in all 7: mov eax, esi with esi = [ebp-4] = entry ecx,
     stored once and never rewritten. */
  return this_ptr;
}

uint32_t isaac_lua_engine_property_builder_chain_receiver(uint32_t prev_return) {
  /* Chained entry: mov ecx, eax — the receiver is the previous return, so
     with return_this the chain receiver is invariant. */
  return prev_return;
}

uint32_t isaac_lua_engine_property_builder_state_addr(uint32_t this_ptr) {
  /* mov edi, [<this>] — the ABI v5 stack-ref state field at +0; the body
     never writes through this, so [esi] after `mov esi, eax` is the same
     slot state. */
  return this_ptr + (uint32_t)ISAAC_LUA_STACK_REF_OFF_STATE;
}

uint32_t isaac_lua_engine_property_builder_getter_ud_value(int32_t index,
                                                           uint32_t arg2,
                                                           uint32_t arg3) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  (void)arg3; /* the getter userdata never reads arg3 in any member */
  if (e == 0) {
    return 0u;
  }
  if (e->kind == ISAAC_LUA_PROPERTY_BUILDER_KIND_FOLDED) {
    return (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_FOLDED_GET_UD;
  }
  return arg2;
}

uint32_t isaac_lua_engine_property_builder_setter_ud_value(int32_t index,
                                                           uint32_t arg2,
                                                           uint32_t arg3) {
  const IsaacLuaPropertyBuilderEntry *e = property_builder_at(index);
  if (e == 0) {
    return 0u;
  }
  switch (e->kind) {
    case ISAAC_LUA_PROPERTY_BUILDER_KIND_SHARED_ARG:
      return arg2; /* mov ecx,[ebp+0xc] again — arg3 pushed but dead */
    case ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG:
      return arg3; /* mov ecx,[ebp+0x10] */
    default:
      return (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_FOLDED_SET_UD;
  }
}

uint32_t isaac_lua_engine_property_builder_folded_name_va(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_FOLDED_NAME_VA;
}

uint32_t isaac_lua_engine_property_builder_folded_get_ud(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_FOLDED_GET_UD;
}

uint32_t isaac_lua_engine_property_builder_folded_set_ud(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_FOLDED_SET_UD;
}

uint32_t isaac_lua_engine_property_builder_folded_caller_va(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_BUILDER_FOLDED_CALLER_VA;
}

int32_t isaac_lua_engine_register_class_span_resolution(int32_t cls) {
  if (class_at(cls) == 0) {
    return -1;
  }
  if (cls == ISAAC_LUA_CLASS_COLOR || cls == ISAAC_LUA_CLASS_SPRITE) {
    return ISAAC_LUA_CLASS_SPAN_RESOLVED_RETURN_CONTRACT;
  }
  if (cls == ISAAC_LUA_CLASS_ENTITYREF) {
    return ISAAC_LUA_CLASS_SPAN_UNRESOLVED;
  }
  return ISAAC_LUA_CLASS_SPAN_RESOLVED_DIRECT;
}

uint32_t isaac_lua_engine_register_class_field_call_va(int32_t cls,
                                                       int32_t index) {
  const IsaacLuaRegisterFieldEntry *e = class_field_at(cls, index);
  return e != 0 ? e->call_va : 0u;
}

uint32_t isaac_lua_engine_register_class_field_builder_va(int32_t cls,
                                                          int32_t index) {
  const IsaacLuaRegisterFieldEntry *e = class_field_at(cls, index);
  return e != 0 ? e->builder_va : 0u;
}


/* ---------------------------------------------------------------------------
 * ABI v20 — EntityRef data-builder band 0x00875c50…0x008763b0.
 *
 * Six members, one template — the exact 28-call body of the v19 property
 * builders. Per-member data transcribed from the PE Capstone dumps in
 * section-notes/lua-v20/ (band / fresh-band / entityref-span / 8763b0):
 *
 *   m0 0x00875c50 FOLDED   get 0x8bb900  set 0x8bb960  ud 0/0    name 0xb6d1a4
 *   m1 0x00875dd0 SHARED   get 0x8bb9c0  set 0x8bb960  ud [0xc]/[0xc]
 *   m2 0x00875f40 FOLDED   get 0x8bba20  set 0x8bb960  ud 8/8     name 0xb706e4
 *   m3 0x008760c0 FOLDED   get 0x8bba80  set 0x8bbb20  ud 0x10/10  name 0xb65080
 *   m4 0x00876240 SPLIT    get 0x89e4c0  set 0x89e450  ud [0xc]/[0x10]
 *   m5 0x008763b0 FOLDED   get 0x8bbbc0  set 0x8bbc60  ud 0x24/24  name 0xb706b8
 *
 * FOLDED members fold the single caller's name/ud pushes as immediates
 * (LTCG); ARG members read the ud from [ebp+0xc] (SHARED) or
 * [ebp+0xc]/[ebp+0x10] (SPLIT). Call sites: 8 total in RegisterClasses'
 * EntityRef span: m0 0x00867686, m1 0x00867696+0x008676b6, m2 0x008676a6,
 * m3 0x008676c6, m4 0x008676dc+0x008676f2, m5 0x00867702.
 * The get/set closure imms sit at body offsets 0x62 / 0x118 — the same
 * operand fields v19 measured on its sibling template.
 * --------------------------------------------------------------------------- */
struct IsaacLuaEntityRefBuilderEntry {
  uint32_t va;
  int32_t kind;
  uint32_t get_closure_va;
  uint32_t set_closure_va;
  uint32_t body_bytes;
  uint32_t body_insns;
  uint32_t callsite_count;
  uint32_t first_call_site_va;
  /* Folded immediates (0 for ARG members). */
  uint32_t folded_name_va;
  uint32_t folded_get_ud;
  uint32_t folded_set_ud;
};

static const IsaacLuaEntityRefBuilderEntry kEntityRefBuilders[] = {
    {0x00875c50u, ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED, 0x008bb900u,
     0x008bb960u, ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_BYTES,
     ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_INSNS, 1, 0x00867686u,
     ISAAC_LUA_ENTITYREF_BAND_TYPE_NAME_VA, 0x00u, 0x00u}, /* "Type" */
    {0x00875dd0u, ISAAC_LUA_ENTITYREF_BAND_KIND_SHARED_ARG, 0x008bb9c0u,
     0x008bb960u, ISAAC_LUA_ENTITYREF_BAND_TEMPLATE_BYTES,
     ISAAC_LUA_ENTITYREF_BAND_TEMPLATE_INSNS, 2, 0x00867696u, 0u, 0u, 0u},
    {0x00875f40u, ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED, 0x008bba20u,
     0x008bb960u, ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_BYTES,
     ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_INSNS, 1, 0x008676a6u,
     ISAAC_LUA_ENTITYREF_BAND_SPAWNER_TYPE_NAME_VA, 0x08u,
     0x08u}, /* "SpawnerType" */
    {0x008760c0u, ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED, 0x008bba80u,
     0x008bbb20u, ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_BYTES,
     ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_INSNS, 1, 0x008676c6u,
     ISAAC_LUA_ENTITYREF_BAND_POSITION_NAME_VA, 0x10u,
     0x10u}, /* "Position" */
    {0x00876240u, ISAAC_LUA_ENTITYREF_BAND_KIND_SPLIT_ARG, 0x0089e4c0u,
     0x0089e450u, ISAAC_LUA_ENTITYREF_BAND_TEMPLATE_BYTES,
     ISAAC_LUA_ENTITYREF_BAND_TEMPLATE_INSNS, 2, 0x008676dcu, 0u, 0u, 0u},
    {0x008763b0u, ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED, 0x008bbbc0u,
     0x008bbc60u, ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_BYTES,
     ISAAC_LUA_ENTITYREF_BAND_FOLDED_BODY_INSNS, 1, 0x00867702u,
     ISAAC_LUA_ENTITYREF_BAND_ENTITY_NAME_VA, 0x24u,
     0x24u}, /* "Entity" */
};

static const int32_t kEntityRefBuilderCount =
    (int32_t)(sizeof(kEntityRefBuilders) / sizeof(kEntityRefBuilders[0]));

static const IsaacLuaEntityRefBuilderEntry *entityref_builder_at(
    int32_t index) {
  return (index >= 0 && index < kEntityRefBuilderCount)
             ? &kEntityRefBuilders[index]
             : (const IsaacLuaEntityRefBuilderEntry *)0;
}

int32_t isaac_lua_engine_entityref_data_builder_count(void) {
  return kEntityRefBuilderCount;
}

uint32_t isaac_lua_engine_entityref_data_builder_va(int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->va : 0u;
}

int32_t isaac_lua_engine_entityref_data_builder_kind(int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->kind : -1;
}

uint32_t isaac_lua_engine_entityref_data_builder_get_closure_va(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->get_closure_va : 0u;
}

uint32_t isaac_lua_engine_entityref_data_builder_set_closure_va(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->set_closure_va : 0u;
}

uint32_t isaac_lua_engine_entityref_data_builder_body_bytes(int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->body_bytes : 0u;
}

uint32_t isaac_lua_engine_entityref_data_builder_body_insns(int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->body_insns : 0u;
}

int32_t isaac_lua_engine_entityref_data_builder_callsite_count(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->callsite_count : -1;
}

uint32_t isaac_lua_engine_entityref_data_builder_first_call_site_va(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->first_call_site_va : 0u;
}

int32_t isaac_lua_engine_entityref_data_builder_index_for_va(uint32_t va) {
  int32_t i;
  for (i = 0; i < kEntityRefBuilderCount; ++i) {
    if (kEntityRefBuilders[i].va == va) {
      return i;
    }
  }
  return -1;
}

uint32_t isaac_lua_engine_entityref_data_builder_next_va(int32_t index) {
  /* Stride law (isomorphic to v19): 0x180 after a FOLDED member (0x172
     body padded to 0x180), 0x170 after an ARG member (0x16a padded to
     0x170). Verified for all 5 adjacent pairs in the band. */
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  if (e == 0 || index + 1 >= kEntityRefBuilderCount) {
    return 0u;
  }
  return e->va + (e->kind == ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED
                      ? (uint32_t)ISAAC_LUA_ENTITYREF_BAND_STRIDE_AFTER_FOLDED
                      : (uint32_t)ISAAC_LUA_ENTITYREF_BAND_STRIDE);
}

uint32_t isaac_lua_engine_entityref_data_builder_return_this(
    uint32_t this_ptr) {
  /* PE epilogue in all 6 members: mov eax, esi with esi = [ebp-4] = entry
     ecx, stored once and never rewritten — return this. */
  return this_ptr;
}

uint32_t isaac_lua_engine_entityref_data_builder_getter_ud_value(
    int32_t index, uint32_t arg2, uint32_t arg3) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  (void)arg3; /* the getter userdata never reads arg3 in any member */
  if (e == 0) {
    return 0u;
  }
  if (e->kind == ISAAC_LUA_ENTITYREF_BAND_KIND_FOLDED) {
    return e->folded_get_ud;
  }
  return arg2; /* mov ecx, [ebp+0xc] in every ARG member (= GET ud source) */
}

uint32_t isaac_lua_engine_entityref_data_builder_setter_ud_value(
    int32_t index, uint32_t arg2, uint32_t arg3) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  if (e == 0) {
    return 0u;
  }
  if (e->kind == ISAAC_LUA_ENTITYREF_BAND_KIND_SHARED_ARG) {
    return arg2; /* mov ecx, [ebp+0xc] again — arg3 pushed but dead */
  }
  if (e->kind == ISAAC_LUA_ENTITYREF_BAND_KIND_SPLIT_ARG) {
    return arg3; /* mov ecx, [ebp+0x10] */
  }
  return e->folded_set_ud;
}

uint32_t isaac_lua_engine_entityref_data_builder_folded_name_va(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->folded_name_va : 0u;
}

uint32_t isaac_lua_engine_entityref_data_builder_folded_get_ud(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->folded_get_ud : 0u;
}

uint32_t isaac_lua_engine_entityref_data_builder_folded_set_ud(
    int32_t index) {
  const IsaacLuaEntityRefBuilderEntry *e = entityref_builder_at(index);
  return e != 0 ? e->folded_set_ud : 0u;
}

/* ---------------------------------------------------------------------------
 * ABI v21 — the whole-image property-builder population (173 members).
 *
 * Transcribed from the whole-.text census of the exact 28-call program:
 * prologue scan (55 8bec 51 53 56 8bc1 57 6afe) -> decode to `ret` ->
 * resolved call program equality against representative 0x00875510.
 * 195 prologue hits, 173 members. Row fields come from the instruction
 * stream: the fold axis from whether the 3 name pushes read [ebp+8], the
 * shared axis from the setter ud source (disp 0x0c vs 0x10 for ARG, and
 * for FOLDED from which caller argument the folded immediate equals), the
 * closure VAs from the imm32 feeding each lua_pushcclosure, and the call
 * sites from an image-wide E8 scan.
 * --------------------------------------------------------------------------- */

namespace {

struct IsaacLuaPropertyFamilyEntry {
  uint32_t va;
  uint32_t folded;     /* name + both uds are immediates */
  uint32_t shared;     /* setter ud is arg2 (1) or arg3 (0) */
  uint32_t get_closure;
  uint32_t set_closure;
  int32_t callsites;
  uint32_t first_site;
  uint32_t folded_name;
  uint32_t folded_get_ud;
  uint32_t folded_set_ud;
};

const IsaacLuaPropertyFamilyEntry kIsaacLuaPropertyFamily[] = {
    {0x00875230u, 0, 1, 0x008bb2e0u, 0x008bb340u, 2, 0x00866c86u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008753a0u, 0, 1, 0x008bb420u, 0x008bb480u, 4, 0x00866d2fu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00875510u, 0, 0, 0x0089f590u, 0x0089f500u, 7, 0x00867091u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00875680u, 0, 0, 0x0089e970u, 0x0089e8e0u, 2, 0x0086750cu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008757f0u, 0, 0, 0x0089e870u, 0x0089e7e0u, 2, 0x00867538u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00875960u, 1, 0, 0x0089e740u, 0x0089e6b0u, 1, 0x0086754eu, 0x00b6508cu, 0x00407410u, 0x004073d0u},
    {0x00875ae0u, 0, 0, 0x0089e5a0u, 0x0089e530u, 2, 0x0086757au, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00875c50u, 1, 1, 0x008bb900u, 0x008bb960u, 1, 0x00867686u, 0x00b6d1a4u, 0x00000000u, 0x00000000u},
    {0x00875dd0u, 0, 1, 0x008bb9c0u, 0x008bb960u, 2, 0x00867696u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00875f40u, 1, 1, 0x008bba20u, 0x008bb960u, 1, 0x008676a6u, 0x00b706e4u, 0x00000008u, 0x00000008u},
    {0x008760c0u, 1, 1, 0x008bba80u, 0x008bbb20u, 1, 0x008676c6u, 0x00b65080u, 0x00000010u, 0x00000010u},
    {0x00876240u, 0, 0, 0x0089e4c0u, 0x0089e450u, 2, 0x008676dcu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008763b0u, 1, 1, 0x008bbbc0u, 0x008bbc60u, 1, 0x00867702u, 0x00b706b8u, 0x00000024u, 0x00000024u},
    {0x00876840u, 1, 1, 0x008bbdb0u, 0x008bbe10u, 1, 0x00867827u, 0x00b70710u, 0x00000000u, 0x00000000u},
    {0x008769c0u, 0, 1, 0x008bbe80u, 0x008bbee0u, 13, 0x00867837u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00876b30u, 1, 1, 0x008bbf50u, 0x008bbfb0u, 1, 0x008678d7u, 0x00b6508cu, 0x0000002cu, 0x0000002cu},
    {0x00876cb0u, 0, 1, 0x008bc070u, 0x008bc0d0u, 2, 0x008678e7u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00876e20u, 0, 1, 0x008bc130u, 0x008bc1d0u, 3, 0x008678f7u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00876f90u, 0, 1, 0x008bc270u, 0x008bc2d0u, 3, 0x00867937u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008774f0u, 0, 1, 0x008bc3c0u, 0x008bc420u, 2, 0x00867a91u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00877b00u, 0, 1, 0x008bc480u, 0x008bc4e0u, 4, 0x00867c48u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00877c70u, 0, 1, 0x008bc540u, 0x008bc5b0u, 3, 0x00867c68u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00877de0u, 1, 1, 0x008bc6c0u, 0x008bc720u, 1, 0x00867c98u, 0x00b709d4u, 0x00000050u, 0x00000050u},
    {0x00877f70u, 1, 1, 0x008bc790u, 0x008bc4e0u, 1, 0x00867ca8u, 0x00b709e8u, 0x00000054u, 0x00000054u},
    {0x008780f0u, 1, 1, 0x008bc7f0u, 0x008bc4e0u, 1, 0x00867cb8u, 0x00b709b8u, 0x00000058u, 0x00000058u},
    {0x00878270u, 1, 1, 0x008bc7f0u, 0x008bc4e0u, 1, 0x00867cc8u, 0x00b709c4u, 0x0000005cu, 0x0000005cu},
    {0x008784b0u, 0, 1, 0x008bc850u, 0x008bc8b0u, 4, 0x00867d9au, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00878620u, 1, 1, 0x008bc910u, 0x008bc980u, 1, 0x00867dbau, 0x00b1b350u, 0x00000008u, 0x00000008u},
    {0x008787a0u, 1, 1, 0x008bca90u, 0x008bcaf0u, 1, 0x00867dcau, 0x00b709d4u, 0x00000038u, 0x00000038u},
    {0x00878920u, 0, 1, 0x008bcb60u, 0x008bc8b0u, 2, 0x00867ddau, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00878a90u, 0, 1, 0x008bcbc0u, 0x008bcc50u, 2, 0x00867e1au, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00878d70u, 0, 1, 0x008bccf0u, 0x008bcd50u, 15, 0x00867ef6u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00878ee0u, 0, 1, 0x008bcdb0u, 0x008bce20u, 3, 0x00867f16u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00879050u, 1, 1, 0x008bcf30u, 0x008bcd50u, 1, 0x00867f56u, 0x00b70ab0u, 0x00000054u, 0x00000054u},
    {0x008791d0u, 0, 1, 0x008bcf90u, 0x008bd000u, 6, 0x00867ff9u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00879340u, 0, 1, 0x008bd070u, 0x008bd0d0u, 2, 0x00868009u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008795b0u, 1, 1, 0x008bd130u, 0x008bcd50u, 1, 0x00868040u, 0x00b70ba0u, 0x000000acu, 0x000000acu},
    {0x00879730u, 1, 1, 0x008bd190u, 0x008bd1f0u, 1, 0x008680c2u, 0x00b70c1cu, 0x000000b8u, 0x000000b8u},
    {0x00879a30u, 0, 1, 0x008bd250u, 0x008bd2b0u, 2, 0x00868192u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00879ba0u, 1, 1, 0x008bd310u, 0x008bd380u, 1, 0x008681a2u, 0x00b70be0u, 0x00000004u, 0x00000004u},
    {0x00879d20u, 0, 1, 0x008bd490u, 0x008bd4f0u, 4, 0x008681c2u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00879e90u, 1, 1, 0x008bd560u, 0x008bd5f0u, 1, 0x008681f2u, 0x00b70c68u, 0x00000024u, 0x00000024u},
    {0x0087b150u, 0, 1, 0x008bd690u, 0x008bd6f0u, 2, 0x008683f3u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087b2c0u, 1, 1, 0x008bd750u, 0x008bd7b0u, 1, 0x00868413u, 0x00b70dd0u, 0x00000008u, 0x00000008u},
    {0x0087b440u, 1, 1, 0x008bd870u, 0x008bd900u, 1, 0x00868423u, 0x00b70ddcu, 0x00000038u, 0x00000038u},
    {0x0087b5c0u, 0, 1, 0x008bd990u, 0x008bd9f0u, 3, 0x00868433u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087b750u, 1, 1, 0x008bda60u, 0x008bdb00u, 1, 0x008684bfu, 0x00b67800u, 0x00000000u, 0x00000000u},
    {0x0087b8d0u, 1, 1, 0x008bdb90u, 0x008bdbf0u, 1, 0x008684cfu, 0x00b1d668u, 0x00000004u, 0x00000004u},
    {0x0087ba50u, 1, 0, 0x0089e220u, 0x0089e1b0u, 1, 0x008684e5u, 0x00b63968u, 0x007538f0u, 0x0085e1d0u},
    {0x0087bf10u, 1, 1, 0x008bdc50u, 0x008bdcf0u, 1, 0x00868554u, 0x00b67800u, 0x00000000u, 0x00000000u},
    {0x0087c090u, 0, 1, 0x008bdd80u, 0x008bdde0u, 2, 0x00868564u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087d130u, 0, 1, 0x008bde40u, 0x008bdee0u, 2, 0x0086880du, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087d2c0u, 0, 1, 0x008bdf80u, 0x008bdfe0u, 6, 0x00868850u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087d430u, 1, 1, 0x008be040u, 0x008be0a0u, 1, 0x008688a0u, 0x00b70facu, 0x00000018u, 0x00000018u},
    {0x0087d5d0u, 1, 1, 0x008be110u, 0x008be170u, 1, 0x00868937u, 0x00b7105cu, 0x0000036cu, 0x0000036cu},
    {0x0087d7b0u, 0, 0, 0x0089e0b0u, 0x0089e020u, 3, 0x0086895eu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087d920u, 1, 0, 0x0089df90u, 0x0089def0u, 1, 0x0086898au, 0x00b6508cu, 0x00871ed0u, 0x00871f70u},
    {0x0087ddd0u, 0, 0, 0x0089de30u, 0x0089dab0u, 3, 0x00868a6cu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087df50u, 0, 0, 0x0089de90u, 0x0089dab0u, 4, 0x00868a98u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087e290u, 1, 0, 0x0089dd90u, 0x0089dd00u, 1, 0x00868b08u, 0x00b71074u, 0x004e47a0u, 0x00456380u},
    {0x0087e410u, 0, 0, 0x0089dc90u, 0x0089dc20u, 2, 0x00868b1eu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087e580u, 0, 0, 0x0089db80u, 0x0089e020u, 3, 0x00868b34u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087e6f0u, 1, 0, 0x0089db20u, 0x0089dab0u, 1, 0x00868b60u, 0x00b71140u, 0x00592250u, 0x00565dd0u},
    {0x0087e8d0u, 0, 0, 0x0089da40u, 0x0089d9b0u, 6, 0x00868bc9u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087ea40u, 1, 0, 0x0089d930u, 0x0089d8b0u, 1, 0x00868bf0u, 0x00b6d1acu, 0x00871f90u, 0x00871fa0u},
    {0x0087ed10u, 1, 0, 0x0089db80u, 0x0089d800u, 1, 0x00868c80u, 0x00b70834u, 0x004aad30u, 0x00435d60u},
    {0x0087f3d0u, 0, 0, 0x0089d760u, 0x0089d6b0u, 4, 0x00868ec5u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087fdd0u, 0, 0, 0x0089c9c0u, 0x0089c930u, 5, 0x00869067u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0087ff40u, 1, 0, 0x0089c890u, 0x0089c7f0u, 1, 0x008690bfu, 0x00b70ddcu, 0x004177c0u, 0x00676150u},
    {0x00880340u, 0, 1, 0x008be1e0u, 0x008be240u, 2, 0x0086915fu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008805a0u, 0, 1, 0x008be2b0u, 0x008be310u, 2, 0x00869183u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00880710u, 0, 1, 0x008be370u, 0x008be410u, 3, 0x00869196u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00880880u, 1, 1, 0x008be4b0u, 0x008be550u, 1, 0x008691cdu, 0x00b715a8u, 0x00000478u, 0x00000478u},
    {0x00880a00u, 1, 1, 0x008be5e0u, 0x008be640u, 1, 0x00869206u, 0x00b71558u, 0x000007e8u, 0x000007e8u},
    {0x00881950u, 1, 0, 0x0089c650u, 0x0089c5a0u, 1, 0x00869772u, 0x00b719c0u, 0x00753930u, 0x007792f0u},
    {0x008824d0u, 1, 0, 0x0089c530u, 0x0089c4c0u, 1, 0x00869beau, 0x00b71e5cu, 0x006b84a0u, 0x005b17a0u},
    {0x00882650u, 1, 0, 0x0089c460u, 0x0089c3f0u, 1, 0x00869c00u, 0x00b71e20u, 0x0085e250u, 0x005b17b0u},
    {0x00882d50u, 1, 0, 0x0089c350u, 0x0089c2b0u, 1, 0x00869e36u, 0x00b72068u, 0x005cd7d0u, 0x005cd7a0u},
    {0x008830a0u, 1, 0, 0x0089c000u, 0x0089bf70u, 1, 0x00869e90u, 0x00b71124u, 0x0060d0a0u, 0x0085e2a0u},
    {0x008837c0u, 1, 0, 0x0089bea0u, 0x0089be10u, 1, 0x0086a0c6u, 0x00b7234cu, 0x00782a70u, 0x00782ab0u},
    {0x00883940u, 0, 1, 0x008be6b0u, 0x008be710u, 10, 0x0086a0d9u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00883ab0u, 1, 1, 0x008be780u, 0x008be810u, 1, 0x0086a171u, 0x00b70ddcu, 0x00001488u, 0x00001488u},
    {0x00883c30u, 0, 1, 0x008be8a0u, 0x008be900u, 2, 0x0086a184u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00883da0u, 1, 1, 0x008be9c0u, 0x008bea20u, 1, 0x0086a1aau, 0x00b723ccu, 0x00001570u, 0x00001570u},
    {0x00883f40u, 1, 1, 0x008bea90u, 0x008beb20u, 1, 0x0086a1d0u, 0x00b723b4u, 0x00001aecu, 0x00001aecu},
    {0x008840c0u, 1, 1, 0x008bebc0u, 0x008bec60u, 1, 0x0086a1e3u, 0x00b7247cu, 0x000017c4u, 0x000017c4u},
    {0x00884240u, 0, 1, 0x008becf0u, 0x008bed50u, 3, 0x0086a1f6u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008849b0u, 0, 0, 0x0089bdb0u, 0x0089bd40u, 6, 0x0086a524u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00884c70u, 0, 0, 0x0089bcd0u, 0x0089bc60u, 2, 0x0086a588u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00884ea0u, 1, 1, 0x008bedb0u, 0x008bee10u, 1, 0x0086a648u, 0x00b727e4u, 0x00000584u, 0x00000584u},
    {0x008850a0u, 0, 0, 0x0089bbf0u, 0x0089bb60u, 4, 0x0086a695u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00885330u, 0, 1, 0x008bee70u, 0x008beed0u, 3, 0x0086a72eu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008854a0u, 0, 1, 0x008bef40u, 0x008befa0u, 4, 0x0086a741u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00885610u, 1, 1, 0x008bf000u, 0x008bf060u, 1, 0x0086a7a0u, 0x00b72808u, 0x00000464u, 0x00000464u},
    {0x00885790u, 1, 1, 0x008bf0d0u, 0x008bf170u, 1, 0x0086a7b3u, 0x00b71538u, 0x00000468u, 0x00000468u},
    {0x00885990u, 1, 0, 0x0089bac0u, 0x0089ba10u, 1, 0x0086a832u, 0x00b728d4u, 0x004361f0u, 0x0062e020u},
    {0x00885b10u, 0, 0, 0x0089b9b0u, 0x0089b940u, 3, 0x0086a848u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00885f80u, 0, 1, 0x008bf210u, 0x008bf270u, 8, 0x0086a9cau, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008860f0u, 0, 1, 0x008bf2d0u, 0x008bf330u, 2, 0x0086aa29u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00886260u, 1, 1, 0x008bf3a0u, 0x008bf440u, 1, 0x0086aa3cu, 0x00b72a1cu, 0x00000d64u, 0x00000d64u},
    {0x008863e0u, 0, 1, 0x008bf4e0u, 0x008bf540u, 2, 0x0086aa9bu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00886570u, 0, 0, 0x0089b850u, 0x0089b7c0u, 10, 0x0086aaeau, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00886740u, 0, 0, 0x0089b760u, 0x0089b6f0u, 2, 0x0086aba1u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00886910u, 0, 0, 0x0089b690u, 0x0089b620u, 2, 0x0086abc8u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00886b60u, 1, 0, 0x0089b5b0u, 0x0089b540u, 1, 0x0086accfu, 0x00b7136cu, 0x008c5d0bu, 0x00436220u},
    {0x00886ff0u, 1, 0, 0x0089b310u, 0x0089b280u, 1, 0x0086ad7eu, 0x00b706a4u, 0x004567a0u, 0x006d6610u},
    {0x00887660u, 1, 0, 0x0089b140u, 0x0089b090u, 1, 0x0086ae71u, 0x00b70704u, 0x004e4850u, 0x006d0c20u},
    {0x008877e0u, 0, 1, 0x008bf5b0u, 0x008bf610u, 6, 0x0086ae84u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00887950u, 1, 1, 0x008bf670u, 0x008bf700u, 1, 0x0086ae97u, 0x00b72c90u, 0x00000414u, 0x00000414u},
    {0x00887ad0u, 1, 1, 0x008bf920u, 0x008bf610u, 1, 0x0086aeaau, 0x00b727e4u, 0x00000b64u, 0x00000b64u},
    {0x00887c50u, 0, 1, 0x008bf980u, 0x008bfa20u, 2, 0x0086aee3u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00887de0u, 1, 0, 0x0089aff0u, 0x0089af50u, 1, 0x0086af6bu, 0x00b72d18u, 0x005cd560u, 0x006a6910u},
    {0x00887f70u, 1, 0, 0x0089aee0u, 0x0089ae70u, 1, 0x0086af81u, 0x00b72cf4u, 0x004316a0u, 0x0060cdb0u},
    {0x008880f0u, 0, 0, 0x0089ae00u, 0x0089ad70u, 2, 0x0086af97u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00888340u, 1, 0, 0x0089abf0u, 0x0089ab50u, 1, 0x0086b008u, 0x00b70ddcu, 0x004177c0u, 0x00456830u},
    {0x008884c0u, 0, 0, 0x0089aae0u, 0x0089aa50u, 2, 0x0086b01eu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00888a70u, 0, 1, 0x008bfac0u, 0x008bfb60u, 2, 0x0086b135u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00888be0u, 0, 1, 0x008bfc00u, 0x008bfc60u, 10, 0x0086b148u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00888d50u, 1, 1, 0x008bfcd0u, 0x008bfd60u, 1, 0x0086b181u, 0x00b70ddcu, 0x00000428u, 0x00000428u},
    {0x00888ed0u, 1, 1, 0x008bfdf0u, 0x008bfe50u, 1, 0x0086b194u, 0x00b7276cu, 0x00000458u, 0x00000458u},
    {0x00889050u, 0, 1, 0x008bfeb0u, 0x008bff10u, 6, 0x0086b1a7u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008891c0u, 1, 1, 0x008bff80u, 0x008c0010u, 1, 0x0086b1bau, 0x00b72e70u, 0x0000045du, 0x0000045du},
    {0x00889340u, 1, 1, 0x008c00b0u, 0x008c0140u, 1, 0x0086b1f3u, 0x00b72e58u, 0x00000464u, 0x00000464u},
    {0x008894c0u, 1, 1, 0x008c0230u, 0x008bfe50u, 1, 0x0086b23fu, 0x00b72ef0u, 0x000004c4u, 0x000004c4u},
    {0x00889640u, 1, 1, 0x008c0290u, 0x008c0320u, 1, 0x0086b28bu, 0x00b72ec0u, 0x000004d4u, 0x000004d4u},
    {0x008897c0u, 1, 1, 0x008c03c0u, 0x008c0460u, 1, 0x0086b2c4u, 0x00b72eb4u, 0x000004e8u, 0x000004e8u},
    {0x00889960u, 1, 0, 0x0089a810u, 0x0089a770u, 1, 0x0086b339u, 0x00b70ddcu, 0x0085de90u, 0x005cd5c0u},
    {0x00889ae0u, 0, 0, 0x0089a700u, 0x0089a670u, 2, 0x0086b34fu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00889f70u, 0, 1, 0x008c04f0u, 0x008c0550u, 6, 0x0086b3efu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088a100u, 0, 1, 0x008c05c0u, 0x008c0620u, 4, 0x0086b575u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088a270u, 0, 1, 0x008c0680u, 0x008c0620u, 3, 0x0086b585u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088a3e0u, 1, 1, 0x008c06e0u, 0x008c0740u, 1, 0x0086b5d5u, 0x00b72ff4u, 0x00000018u, 0x00000018u},
    {0x0088a740u, 1, 0, 0x0089a570u, 0x0089a4a0u, 1, 0x0086b68du, 0x00b727e4u, 0x004176f0u, 0x00665b70u},
    {0x0088ac20u, 1, 0, 0x0089a510u, 0x0089a4a0u, 1, 0x0086b76fu, 0x00b71054u, 0x0067efc0u, 0x00718ed0u},
    {0x0088ada0u, 1, 1, 0x008c07b0u, 0x008c0850u, 1, 0x0086b77fu, 0x00b730d4u, 0x00000004u, 0x00000004u},
    {0x0088af40u, 1, 1, 0x008c08f0u, 0x008c0950u, 1, 0x0086b78fu, 0x00b730dcu, 0x0000003cu, 0x0000003cu},
    {0x0088b600u, 0, 0, 0x00899b70u, 0x00899b00u, 3, 0x0086b83eu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088bb60u, 0, 1, 0x008c09b0u, 0x008c0a10u, 4, 0x0086b98du, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088bcd0u, 1, 1, 0x008c0a70u, 0x008c0b00u, 1, 0x0086b9c6u, 0x00b732ccu, 0x0000027cu, 0x0000027cu},
    {0x0088be50u, 0, 1, 0x008c0c10u, 0x008c0c70u, 2, 0x0086b9d9u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088bfd0u, 1, 1, 0x008c0ce0u, 0x008c0d70u, 1, 0x0086ba12u, 0x00b732bcu, 0x00000398u, 0x00000398u},
    {0x0088c150u, 1, 1, 0x008c0e10u, 0x008c0ea0u, 1, 0x0086ba25u, 0x00b73294u, 0x0000039cu, 0x0000039cu},
    {0x0088c2d0u, 0, 1, 0x008c0f40u, 0x008c0fb0u, 4, 0x0086ba38u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088c4c0u, 1, 1, 0x008c10c0u, 0x008c1120u, 1, 0x0086baccu, 0x00b73304u, 0x00000154u, 0x00000154u},
    {0x0088c640u, 1, 1, 0x008c1180u, 0x008c11f0u, 1, 0x0086badfu, 0x00b73310u, 0x00000158u, 0x00000158u},
    {0x0088c7c0u, 1, 1, 0x008c1300u, 0x008c1360u, 1, 0x0086baf2u, 0x00b732e8u, 0x00000170u, 0x00000170u},
    {0x0088ca80u, 1, 1, 0x008c13d0u, 0x008c1430u, 1, 0x0086bb61u, 0x00b733b4u, 0x00000154u, 0x00000154u},
    {0x0088ce40u, 0, 1, 0x008c14a0u, 0x008c1510u, 2, 0x0086bbdeu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088cfb0u, 1, 1, 0x008c1620u, 0x008c1680u, 1, 0x0086bc04u, 0x00b73420u, 0x00000190u, 0x00000190u},
    {0x0088d150u, 1, 1, 0x008c16e0u, 0x008c1740u, 1, 0x0086bc3au, 0x00b73420u, 0x00000154u, 0x00000154u},
    {0x0088d350u, 1, 1, 0x008c17a0u, 0x008c1830u, 1, 0x0086bc84u, 0x00b733e0u, 0x00000154u, 0x00000154u},
    {0x0088d4d0u, 1, 1, 0x008c1940u, 0x008c19c0u, 1, 0x0086bc97u, 0x00b7349cu, 0x00000268u, 0x00000268u},
    {0x0088d650u, 1, 1, 0x008c1a50u, 0x008c1ae0u, 1, 0x0086bcaau, 0x00b734b0u, 0x0000026cu, 0x0000026cu},
    {0x0088d7f0u, 1, 1, 0x008c1b70u, 0x008c1bd0u, 1, 0x0086bce6u, 0x00b7276cu, 0x00000154u, 0x00000154u},
    {0x0088df10u, 1, 1, 0x008c1c30u, 0x008c1c90u, 1, 0x0086be03u, 0x00b6d1a4u, 0x00000000u, 0x00000000u},
    {0x0088e090u, 0, 1, 0x008c1cf0u, 0x008c1d50u, 2, 0x0086be13u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088e200u, 1, 1, 0x008c1db0u, 0x008c1e10u, 1, 0x0086be33u, 0x00b6a14cu, 0x00000008u, 0x00000008u},
    {0x0088e450u, 0, 1, 0x008c1e80u, 0x008c1ee0u, 2, 0x0086be7du, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088e6c0u, 1, 1, 0x008c1f40u, 0x008c1fa0u, 1, 0x0086beaeu, 0x00b73508u, 0x00000008u, 0x00000008u},
    {0x0088e840u, 1, 1, 0x008c2000u, 0x008c2060u, 1, 0x0086bebeu, 0x00b73514u, 0x0000000cu, 0x0000000cu},
    {0x0088f2c0u, 0, 1, 0x008c23b0u, 0x008c2410u, 5, 0x0086c08cu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088f430u, 0, 1, 0x008c2470u, 0x008c2510u, 2, 0x0086c0bcu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088f5a0u, 1, 1, 0x008c25a0u, 0x008c2630u, 1, 0x0086c0dcu, 0x00b73638u, 0x00000018u, 0x00000018u},
    {0x0088f720u, 0, 1, 0x008c26d0u, 0x008c2410u, 6, 0x0086c0ecu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088f890u, 0, 0, 0x008998c0u, 0x00899850u, 7, 0x0086c122u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x0088fa00u, 1, 1, 0x008c2730u, 0x008c2790u, 1, 0x0086c132u, 0x00b735d4u, 0x0000004au, 0x0000004au},
    {0x0088fb80u, 0, 1, 0x008c27f0u, 0x008c2790u, 3, 0x0086c1c6u, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008920c0u, 0, 0, 0x00899710u, 0x008994f0u, 3, 0x0086cc6cu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x008922e0u, 1, 0, 0x00899670u, 0x008995c0u, 1, 0x0086cca9u, 0x00b7409cu, 0x0085e140u, 0x0057be60u},
    {0x008927f0u, 1, 0, 0x00899560u, 0x008994f0u, 1, 0x0086ce8fu, 0x00b74330u, 0x0070c5b0u, 0x00753800u},
    {0x00894950u, 0, 0, 0x00899140u, 0x008990d0u, 3, 0x0086d69eu, 0x00000000u, 0x00000000u, 0x00000000u},
    {0x00894c80u, 1, 0, 0x00899030u, 0x00898f80u, 1, 0x0086d8a6u, 0x00b74a30u, 0x00407490u, 0x007e92e0u},
    {0x008952b0u, 1, 1, 0x008c2850u, 0x008c28b0u, 1, 0x0086da12u, 0x00b74c10u, 0x000264fcu, 0x000264fcu},
};

constexpr int32_t kIsaacLuaPropertyFamilyCount =
    static_cast<int32_t>(sizeof(kIsaacLuaPropertyFamily) /
                         sizeof(kIsaacLuaPropertyFamily[0]));

static_assert(kIsaacLuaPropertyFamilyCount == ISAAC_LUA_PROPERTY_FAMILY_COUNT,
              "v21 member table must match the censused population");
/* Axis partitions are exhaustive and disjoint. */
static_assert(ISAAC_LUA_PROPERTY_FAMILY_ARG_MEMBERS +
                      ISAAC_LUA_PROPERTY_FAMILY_FOLDED_MEMBERS ==
                  ISAAC_LUA_PROPERTY_FAMILY_COUNT,
              "fold axis must partition the population");
static_assert(ISAAC_LUA_PROPERTY_FAMILY_SHARED_MEMBERS +
                      ISAAC_LUA_PROPERTY_FAMILY_SPLIT_MEMBERS ==
                  ISAAC_LUA_PROPERTY_FAMILY_COUNT,
              "shared axis must partition the population");
static_assert(ISAAC_LUA_PROPERTY_FAMILY_ARG_SHARED +
                      ISAAC_LUA_PROPERTY_FAMILY_ARG_SPLIT ==
                  ISAAC_LUA_PROPERTY_FAMILY_ARG_MEMBERS,
              "ARG members split by the shared axis");
static_assert(ISAAC_LUA_PROPERTY_FAMILY_FOLDED_SHARED +
                      ISAAC_LUA_PROPERTY_FAMILY_FOLDED_SPLIT ==
                  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_MEMBERS,
              "FOLDED members split by the shared axis");
static_assert(ISAAC_LUA_PROPERTY_FAMILY_ARG_SHARED +
                      ISAAC_LUA_PROPERTY_FAMILY_FOLDED_SHARED ==
                  ISAAC_LUA_PROPERTY_FAMILY_SHARED_MEMBERS,
              "shared totals agree across the fold axis");
/* L3: the fold edit script accounts for the whole size delta. */
static_assert(ISAAC_LUA_PROPERTY_FAMILY_ARG_BODY_BYTES +
                      ISAAC_LUA_PROPERTY_FAMILY_FOLD_SIZE_DELTA ==
                  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_BODY_BYTES,
              "folded body is the ARG body plus the edit-script delta");
static_assert(ISAAC_LUA_PROPERTY_FAMILY_FOLD_UD_SITES *
                          ISAAC_LUA_PROPERTY_FAMILY_FOLD_UD_SITE_DELTA +
                      ISAAC_LUA_PROPERTY_FAMILY_FOLD_NAME_SITES *
                          ISAAC_LUA_PROPERTY_FAMILY_FOLD_NAME_SITE_DELTA ==
                  ISAAC_LUA_PROPERTY_FAMILY_FOLD_SIZE_DELTA,
              "2*(+1) + 3*(+2) = +8");
/* L2: variable/invariant byte accounting over the folded template. */
static_assert(ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_VARIABLE_BYTES +
                      ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_INVARIANT_BYTES ==
                  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_BODY_BYTES,
              "folded template bytes are variable or invariant, nothing else");
static_assert(ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_FIELDS *
                      ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_FIELD_VARY_BYTES ==
                  ISAAC_LUA_PROPERTY_TEMPLATE_FOLDED_VARIABLE_BYTES,
              "7 fields x 3 varying bytes = 21");
/* L6: adjacency accounting. */
static_assert(ISAAC_LUA_PROPERTY_FAMILY_ALIGN_LAW_EXACT +
                      ISAAC_LUA_PROPERTY_FAMILY_ALIGN_EXCEPTIONS ==
                  ISAAC_LUA_PROPERTY_FAMILY_ADJACENT_PAIRS,
              "every adjacent pair either satisfies the pad law or is one of "
              "the two recorded exceptions");
static_assert(ISAAC_LUA_PROPERTY_FAMILY_ADJACENT_PAIRS +
                      ISAAC_LUA_PROPERTY_FAMILY_NON_ADJACENT_PAIRS ==
                  ISAAC_LUA_PROPERTY_FAMILY_COUNT - 1,
              "consecutive pairs are adjacent or separated");
/* L4: the caller law explains every folded setter ud. */
static_assert(ISAAC_LUA_PROPERTY_CENSUS_SET_UD_IS_ARG2 +
                      ISAAC_LUA_PROPERTY_CENSUS_SET_UD_IS_ARG3 ==
                  ISAAC_LUA_PROPERTY_FAMILY_FOLDED_MEMBERS,
              "folded setter ud is arg2 or arg3, never unexplained");
static_assert(ISAAC_LUA_PROPERTY_CENSUS_CALLER_UNEXPLAINED == 0,
              "no folded member is unexplained by its caller");
static_assert(static_cast<int>(ISAAC_LUA_PROPERTY_CENSUS_LEGACY_ROWS) ==
                  static_cast<int>(ISAAC_LUA_PROPERTY_BUILDER_COUNT) +
                      static_cast<int>(ISAAC_LUA_ENTITYREF_BAND_COUNT),
              "cross-family check covers every v19 and v20 row");
static_assert(ISAAC_LUA_PROPERTY_CENSUS_LEGACY_DISAGREEMENTS == 0,
              "the independent census reproduces v19 and v20 exactly");

const IsaacLuaPropertyFamilyEntry *property_family_at(int32_t index) {
  if (index < 0 || index >= kIsaacLuaPropertyFamilyCount) {
    return 0;
  }
  return &kIsaacLuaPropertyFamily[index];
}

uint32_t property_family_pad16(uint32_t value) {
  const uint32_t align =
      static_cast<uint32_t>(ISAAC_LUA_PROPERTY_FAMILY_BODY_ALIGN);
  return (value + (align - 1u)) & ~(align - 1u);
}

}  // namespace

int32_t isaac_lua_engine_property_family_count(void) {
  return kIsaacLuaPropertyFamilyCount;
}

uint32_t isaac_lua_engine_property_family_va(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->va : 0u;
}

int32_t isaac_lua_engine_property_family_is_folded(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? static_cast<int32_t>(e->folded) : -1;
}

int32_t isaac_lua_engine_property_family_is_shared(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? static_cast<int32_t>(e->shared) : -1;
}

int32_t isaac_lua_engine_property_family_kind(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  if (e == 0) {
    return -1;
  }
  /* The v19 projection is lossy: it cannot express FOLDED x shared. */
  if (e->folded != 0u) {
    return ISAAC_LUA_PROPERTY_BUILDER_KIND_FOLDED;
  }
  return e->shared != 0u ? ISAAC_LUA_PROPERTY_BUILDER_KIND_SHARED_ARG
                         : ISAAC_LUA_PROPERTY_BUILDER_KIND_SPLIT_ARG;
}

uint32_t isaac_lua_engine_property_family_get_closure_va(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->get_closure : 0u;
}

uint32_t isaac_lua_engine_property_family_set_closure_va(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->set_closure : 0u;
}

uint32_t isaac_lua_engine_property_family_body_bytes(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  if (e == 0) {
    return 0u;
  }
  return e->folded != 0u
             ? static_cast<uint32_t>(ISAAC_LUA_PROPERTY_FAMILY_FOLDED_BODY_BYTES)
             : static_cast<uint32_t>(ISAAC_LUA_PROPERTY_FAMILY_ARG_BODY_BYTES);
}

uint32_t isaac_lua_engine_property_family_body_insns(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  if (e == 0) {
    return 0u;
  }
  return e->folded != 0u
             ? static_cast<uint32_t>(ISAAC_LUA_PROPERTY_FAMILY_FOLDED_BODY_INSNS)
             : static_cast<uint32_t>(ISAAC_LUA_PROPERTY_FAMILY_ARG_BODY_INSNS);
}

uint32_t isaac_lua_engine_property_family_body_end_va(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  if (e == 0) {
    return 0u;
  }
  return property_family_pad16(
      e->va + isaac_lua_engine_property_family_body_bytes(index));
}

uint32_t isaac_lua_engine_property_family_next_va(int32_t index) {
  if (index < 0 || index + 1 >= kIsaacLuaPropertyFamilyCount) {
    return 0u;
  }
  /* Censused successor. Deriving it from a per-kind stride would be wrong
     at the two extra-padded ARG members and at all 70 non-adjacent pairs. */
  return kIsaacLuaPropertyFamily[index + 1].va;
}

int32_t isaac_lua_engine_property_family_is_adjacent(int32_t index) {
  const uint32_t next = isaac_lua_engine_property_family_next_va(index);
  if (next == 0u) {
    return 0;
  }
  return next == isaac_lua_engine_property_family_body_end_va(index) ? 1 : 0;
}

int32_t isaac_lua_engine_property_family_callsite_count(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->callsites : -1;
}

uint32_t isaac_lua_engine_property_family_first_callsite_va(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->first_site : 0u;
}

int32_t isaac_lua_engine_property_family_index_for_va(uint32_t va) {
  for (int32_t i = 0; i < kIsaacLuaPropertyFamilyCount; ++i) {
    if (kIsaacLuaPropertyFamily[i].va == va) {
      return i;
    }
  }
  return -1;
}

uint32_t isaac_lua_engine_property_family_folded_name_va(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->folded_name : 0u;
}

uint32_t isaac_lua_engine_property_family_folded_get_ud(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->folded_get_ud : 0u;
}

uint32_t isaac_lua_engine_property_family_folded_set_ud(int32_t index) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  return e != 0 ? e->folded_set_ud : 0u;
}

uint32_t isaac_lua_engine_property_family_name_value(int32_t index,
                                                     uint32_t arg1) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  if (e == 0) {
    return 0u;
  }
  /* FOLDED bodies push the name immediate 3x and never touch [ebp+8]. */
  return e->folded != 0u ? e->folded_name : arg1;
}

uint32_t isaac_lua_engine_property_family_getter_ud_value(int32_t index,
                                                          uint32_t arg2,
                                                          uint32_t arg3) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  (void)arg3; /* the getter ud is arg2 in every ARG member (disp 0x0c). */
  if (e == 0) {
    return 0u;
  }
  return e->folded != 0u ? e->folded_get_ud : arg2;
}

uint32_t isaac_lua_engine_property_family_setter_ud_value(int32_t index,
                                                          uint32_t arg2,
                                                          uint32_t arg3) {
  const IsaacLuaPropertyFamilyEntry *e = property_family_at(index);
  if (e == 0) {
    return 0u;
  }
  if (e->folded != 0u) {
    return e->folded_set_ud;
  }
  /* mov ecx,[ebp+0x0c] on SHARED (arg3 pushed but dead), [ebp+0x10] on
     SPLIT — the disp8 at template offset 0x114. */
  return e->shared != 0u ? arg2 : arg3;
}

uint32_t isaac_lua_engine_property_family_return_this(uint32_t this_ptr) {
  /* epilogue mov eax, esi with esi = [ebp-4] = entry ecx, stored once and
     never rewritten; the only memory writes are the two userdata stores. */
  return this_ptr;
}

int32_t isaac_lua_engine_property_family_folded_from_callsites(
    int32_t callsite_count) {
  /* L5: LTCG folds the arguments exactly when there is a single caller. */
  return callsite_count == 1 ? 1 : 0;
}

/* v19 byte-width sweep: pin every formerly-uint8_t export signature at
   compile time. A uint8_t scalar parameter lets -O2 delete the narrowing
   the Wasm ABI never performs; these assignments fail to compile if any
   signature regresses. */
namespace {
using IsaacU32GateFn = int32_t (*)(uint32_t);
using IsaacU32PairGateFn = int32_t (*)(uint32_t, uint32_t);
using IsaacU32MapFn = uint32_t (*)(uint32_t);
[[maybe_unused]] constexpr IsaacU32GateFn kSigFrameUnref =
    &isaac_lua_engine_frame_unref_needs_host;
[[maybe_unused]] constexpr IsaacU32GateFn kSigGetDebug =
    &isaac_lua_engine_get_debug;
[[maybe_unused]] constexpr IsaacU32GateFn kSigInitDebugPath =
    &isaac_lua_engine_init_take_debug_path;
[[maybe_unused]] constexpr IsaacU32MapFn kSigDebugStoreByte =
    &isaac_lua_engine_init_debug_arg_store_byte;
[[maybe_unused]] constexpr IsaacU32GateFn kSigRunScriptDebug =
    &isaac_lua_engine_run_script_take_debug_path;
[[maybe_unused]] constexpr IsaacU32PairGateFn kSigConstArgerror =
    &isaac_lua_engine_check_get_needs_const_argerror;
[[maybe_unused]] constexpr IsaacU32GateFn kSigProtectGate =
    &isaac_lua_engine_metatable_protect_gate;

/* v21: same guard for the new population exports. Every scalar parameter
   is int32_t (an index / a count) or uint32_t (a VA / an operand value);
   none is uint8_t, so -O2 has no narrowing it may assume. The three pins
   below fail to compile if any v21 signature regresses to a narrow type. */
using IsaacU32IndexMapFn = uint32_t (*)(int32_t);
using IsaacI32IndexMapFn = int32_t (*)(int32_t);
using IsaacU32OperandFn = uint32_t (*)(int32_t, uint32_t, uint32_t);
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigFamilyVa =
    &isaac_lua_engine_property_family_va;
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigFamilyBodyEnd =
    &isaac_lua_engine_property_family_body_end_va;
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigFamilyFoldedSetUd =
    &isaac_lua_engine_property_family_folded_set_ud;
[[maybe_unused]] constexpr IsaacI32IndexMapFn kSigFamilyIsFolded =
    &isaac_lua_engine_property_family_is_folded;
[[maybe_unused]] constexpr IsaacI32IndexMapFn kSigFamilyIsShared =
    &isaac_lua_engine_property_family_is_shared;
[[maybe_unused]] constexpr IsaacI32IndexMapFn kSigFamilyFoldedFromSites =
    &isaac_lua_engine_property_family_folded_from_callsites;
[[maybe_unused]] constexpr IsaacU32OperandFn kSigFamilyGetterUd =
    &isaac_lua_engine_property_family_getter_ud_value;
[[maybe_unused]] constexpr IsaacU32OperandFn kSigFamilySetterUd =
    &isaac_lua_engine_property_family_setter_ud_value;
[[maybe_unused]] constexpr IsaacU32MapFn kSigFamilyReturnThis =
    &isaac_lua_engine_property_family_return_this;
/* takes a VA, so it is the wide-gate shape int32_t(uint32_t). */
[[maybe_unused]] constexpr IsaacU32GateFn kSigFamilyIndexForVa =
    &isaac_lua_engine_property_family_index_for_va;
}  // namespace


/* =====================================================================
   v22 - get/set closure population (326 bodies, 62 template clusters).

   Nothing below executes guest behaviour: these are the censused facts of
   the 326 closure bodies plus the pure x86 semantics their bodies contain
   (extension width, byte gates, store narrowing). Every call target inside
   those bodies stays an address-stable host action.
   ===================================================================== */

namespace {

struct IsaacLuaClosureCluster {
  uint32_t rep_va;
  int32_t bodies;
  uint32_t body_bytes;
  uint32_t body_insns;
  int32_t band;
  int32_t operand_fields;
  int32_t free_fields;
};

struct IsaacLuaClosureRow {
  uint32_t va;
  int32_t cluster;
  int32_t role;
  int32_t push_kind;
  int32_t store_kind;
  uint32_t class_key;
  int32_t member;
};

/* Descending population; index is the cluster id used by the closure rows. */
constexpr IsaacLuaClosureCluster kIsaacLuaClosureClusters[] = {
    {0x8bb900u, 34, 0x59, 33, 1, 17, 2},
    {0x8bb960u, 27, 0x5c, 37, 1, 17, 1},
    {0x8bb2e0u, 14, 0x5b, 33, 1, 17, 1},
    {0x8bb340u, 14, 0x69, 41, 1, 19, 1},
    {0x8bbdb0u, 14, 0x5f, 36, 1, 17, 1},
    {0x8bbe10u, 14, 0x61, 39, 1, 17, 1},
    {0x899140u, 12, 0x5c, 35, 0, 17, 2},
    {0x89a670u, 11, 0x82, 45, 0, 26, 1},
    {0x89a700u, 11, 0x69, 39, 0, 21, 1},
    {0x899030u, 10, 0x9b, 56, 0, 30, 2},
    {0x8990d0u, 9, 0x6c, 41, 0, 22, 1},
    {0x899850u, 9, 0x69, 43, 0, 19, 1},
    {0x8998c0u, 9, 0x65, 39, 0, 18, 1},
    {0x8bba80u, 8, 0x91, 52, 1, 29, 1},
    {0x8bbb20u, 8, 0x93, 52, 1, 29, 1},
    {0x8bc540u, 7, 0x68, 40, 1, 22, 1},
    {0x8bc5b0u, 7, 0x101, 92, 1, 54, 1},
    {0x8bbbc0u, 6, 0x98, 54, 1, 30, 2},
    {0x8bd560u, 6, 0x8b, 50, 1, 27, 3},
    {0x8bd5f0u, 6, 0x92, 58, 1, 27, 2},
    {0x8bdb00u, 5, 0x90, 57, 1, 27, 3},
    {0x898f80u, 4, 0xad, 56, 0, 37, 1},
    {0x89a770u, 4, 0x93, 53, 0, 32, 1},
    {0x89a810u, 4, 0x9a, 54, 0, 31, 1},
    {0x8bba20u, 4, 0x5c, 36, 1, 17, 1},
    {0x8bd0d0u, 4, 0x60, 38, 1, 17, 1},
    {0x8bd870u, 4, 0x8d, 50, 1, 27, 3},
    {0x8bd900u, 4, 0x8c, 50, 1, 31, 2},
    {0x899670u, 3, 0x9e, 56, 0, 33, 1},
    {0x89b090u, 3, 0xa3, 60, 0, 33, 2},
    {0x89bf70u, 3, 0x83, 47, 0, 26, 1},
    {0x8bbf50u, 3, 0x58, 33, 1, 17, 1},
    {0x8bbfb0u, 3, 0xbc, 66, 1, 40, 1},
    {0x8bc070u, 3, 0x5d, 34, 1, 18, 1},
    {0x8bc0d0u, 3, 0x60, 38, 1, 18, 1},
    {0x8bd070u, 3, 0x5d, 36, 1, 17, 1},
    {0x8bf670u, 3, 0x90, 50, 1, 28, 5},
    {0x89dd00u, 2, 0x90, 51, 0, 27, 1},
    {0x8bcbc0u, 2, 0x8b, 50, 1, 27, 1},
    {0x8bcc50u, 2, 0x94, 59, 1, 27, 1},
    {0x8c0b00u, 2, 0xfd, 75, 1, 50, 1},
    {0x8c1cf0u, 2, 0x5a, 33, 1, 17, 1},
    {0x89b620u, 1, 0x6d, 42, 0, 22, 0},
    {0x89b690u, 1, 0x5f, 37, 0, 18, 0},
    {0x89c2b0u, 1, 0x9c, 57, 0, 33, 0},
    {0x89d8b0u, 1, 0x76, 45, 0, 23, 0},
    {0x89d930u, 1, 0x7c, 44, 0, 23, 0},
    {0x89db20u, 1, 0x60, 38, 0, 18, 0},
    {0x89def0u, 1, 0xa0, 55, 0, 32, 0},
    {0x89df90u, 1, 0x82, 47, 0, 25, 0},
    {0x8bbc60u, 1, 0xf3, 88, 1, 46, 0},
    {0x8bebc0u, 1, 0x93, 52, 1, 29, 0},
    {0x8bec60u, 1, 0x8d, 52, 1, 29, 0},
    {0x8bf700u, 1, 0x217, 147, 1, 105, 0},
    {0x8c00b0u, 1, 0x8d, 50, 1, 28, 0},
    {0x8c0140u, 1, 0xe6, 76, 1, 50, 0},
    {0x8c07b0u, 1, 0x95, 52, 1, 29, 0},
    {0x8c0850u, 1, 0x94, 52, 1, 33, 0},
    {0x8c1940u, 1, 0x74, 45, 1, 22, 0},
    {0x8c19c0u, 1, 0x81, 53, 1, 25, 0},
    {0x8c1f40u, 1, 0x5d, 36, 1, 17, 0},
    {0x8c1fa0u, 1, 0x5c, 37, 1, 17, 0},
};

constexpr int32_t kIsaacLuaClosureClusterCount =
    static_cast<int32_t>(sizeof(kIsaacLuaClosureClusters) /
                         sizeof(kIsaacLuaClosureClusters[0]));

/* Ascending VA. */
constexpr IsaacLuaClosureRow kIsaacLuaClosures[] = {
    {0x898f80u, 21, 1, 0, 4, 0xc82a13u, 171},
    {0x899030u, 9, 0, 0, 4, 0xc82a13u, 171},
    {0x8990d0u, 10, 1, 0, 4, 0xc82a13u, 170},
    {0x899140u, 6, 0, 1, 4, 0xc82a13u, 170},
    {0x8994f0u, 10, 1, 0, 4, 0xc82a0au, 167},
    {0x899560u, 6, 0, 2, 4, 0xc82a0au, 169},
    {0x8995c0u, 21, 1, 0, 4, 0xc82a0au, 168},
    {0x899670u, 28, 0, 0, 4, 0xc82a0au, 168},
    {0x899710u, 6, 0, 1, 4, 0xc82a0au, 167},
    {0x899850u, 11, 1, 0, 4, 0xc82a04u, 164},
    {0x8998c0u, 12, 0, 0, 4, 0xc82a04u, 164},
    {0x899b00u, 10, 1, 0, 4, 0xc829e6u, 136},
    {0x899b70u, 6, 0, 1, 4, 0xc829e6u, 136},
    {0x89a4a0u, 10, 1, 0, 4, 0xc82a1eu, 132},
    {0x89a510u, 6, 0, 1, 4, 0xc82a1eu, 133},
    {0x89a570u, 6, 0, 2, 4, 0xc82a1eu, 132},
    {0x89a670u, 7, 1, 0, 4, 0xc829e0u, 127},
    {0x89a700u, 8, 0, 5, 4, 0xc829e0u, 127},
    {0x89a770u, 22, 1, 0, 4, 0xc829e0u, 126},
    {0x89a810u, 23, 0, 0, 4, 0xc829e0u, 126},
    {0x89aa50u, 7, 1, 0, 4, 0xc829ddu, 115},
    {0x89aae0u, 8, 0, 5, 4, 0xc829ddu, 115},
    {0x89ab50u, 22, 1, 0, 4, 0xc829ddu, 114},
    {0x89abf0u, 23, 0, 0, 4, 0xc829ddu, 114},
    {0x89ad70u, 7, 1, 0, 4, 0xc829dau, 113},
    {0x89ae00u, 8, 0, 5, 4, 0xc829dau, 113},
    {0x89ae70u, 11, 1, 0, 4, 0xc829dau, 112},
    {0x89aee0u, 12, 0, 0, 4, 0xc829dau, 112},
    {0x89af50u, 22, 1, 0, 4, 0xc829dau, 111},
    {0x89aff0u, 23, 0, 0, 4, 0xc829dau, 111},
    {0x89b090u, 29, 1, 0, 4, 0xc829d7u, 106},
    {0x89b140u, 9, 0, 0, 4, 0xc829d7u, 106},
    {0x89b280u, 7, 1, 0, 4, 0xc829d7u, 105},
    {0x89b310u, 8, 0, 5, 4, 0xc829d7u, 105},
    {0x89b540u, 11, 1, 0, 4, 0xc829d7u, 104},
    {0x89b5b0u, 12, 0, 0, 4, 0xc829d7u, 104},
    {0x89b620u, 42, 1, 0, 4, 0xc829d4u, 103},
    {0x89b690u, 43, 0, 4, 4, 0xc829d4u, 103},
    {0x89b6f0u, 10, 1, 0, 4, 0xc829d4u, 102},
    {0x89b760u, 6, 0, 1, 4, 0xc829d4u, 102},
    {0x89b7c0u, 7, 1, 0, 4, 0xc829d4u, 101},
    {0x89b850u, 8, 0, 5, 4, 0xc829d4u, 101},
    {0x89b940u, 10, 1, 0, 4, 0xc829d1u, 96},
    {0x89b9b0u, 6, 0, 1, 4, 0xc829d1u, 96},
    {0x89ba10u, 29, 1, 0, 4, 0xc829d1u, 95},
    {0x89bac0u, 9, 0, 0, 4, 0xc829d1u, 95},
    {0x89bb60u, 7, 1, 0, 4, 0xc829ceu, 90},
    {0x89bbf0u, 8, 0, 5, 4, 0xc829ceu, 90},
    {0x89bc60u, 11, 1, 0, 4, 0xc829cbu, 88},
    {0x89bcd0u, 12, 0, 0, 4, 0xc829cbu, 88},
    {0x89bd40u, 10, 1, 0, 4, 0xc829cbu, 87},
    {0x89bdb0u, 6, 0, 1, 4, 0xc829cbu, 87},
    {0x89be10u, 7, 1, 0, 4, 0xc829c8u, 79},
    {0x89bea0u, 8, 0, 5, 4, 0xc829c8u, 79},
    {0x89bf70u, 30, 1, 0, 4, 0xc829c8u, 78},
    {0x89c000u, 28, 0, 0, 4, 0xc829c8u, 78},
    {0x89c2b0u, 44, 1, 0, 4, 0xc829c8u, 77},
    {0x89c350u, 9, 0, 0, 4, 0xc829c8u, 77},
    {0x89c3f0u, 10, 1, 0, 4, 0xc829c8u, 76},
    {0x89c460u, 6, 0, 1, 4, 0xc829c8u, 76},
    {0x89c4c0u, 11, 1, 0, 4, 0xc829c8u, 75},
    {0x89c530u, 12, 0, 0, 4, 0xc829c8u, 75},
    {0x89c5a0u, 21, 1, 0, 4, 0xc829c8u, 74},
    {0x89c650u, 9, 0, 0, 4, 0xc829c8u, 74},
    {0x89c7f0u, 22, 1, 0, 4, 0xc829c5u, 68},
    {0x89c890u, 23, 0, 0, 4, 0xc829c5u, 68},
    {0x89c930u, 7, 1, 0, 4, 0xc829c5u, 67},
    {0x89c9c0u, 8, 0, 5, 4, 0xc829c5u, 67},
    {0x89d6b0u, 29, 1, 0, 4, 0xc8297au, 66},
    {0x89d760u, 9, 0, 0, 4, 0xc8297au, 66},
    {0x89d800u, 21, 1, 0, 4, 0xc8297au, 65},
    {0x89d8b0u, 45, 1, 0, 4, 0xc8297au, 64},
    {0x89d930u, 46, 0, 0, 4, 0xc8297au, 64},
    {0x89d9b0u, 7, 1, 0, 4, 0xc8297au, 63},
    {0x89da40u, 8, 0, 5, 4, 0xc8297au, 63},
    {0x89dab0u, 10, 1, 0, 4, 0xc8297au, 57},
    {0x89db20u, 47, 0, 0, 4, 0xc8297au, 62},
    {0x89db80u, 9, 0, 0, 4, 0xc8297au, 61},
    {0x89dc20u, 11, 1, 0, 4, 0xc8297au, 60},
    {0x89dc90u, 12, 0, 0, 4, 0xc8297au, 60},
    {0x89dd00u, 37, 1, 0, 4, 0xc8297au, 59},
    {0x89dd90u, 9, 0, 0, 4, 0xc8297au, 59},
    {0x89de30u, 6, 0, 2, 4, 0xc8297au, 57},
    {0x89de90u, 6, 0, 1, 4, 0xc8297au, 58},
    {0x89def0u, 48, 1, 0, 4, 0xc8297au, 56},
    {0x89df90u, 49, 0, 0, 4, 0xc8297au, 56},
    {0x89e020u, 30, 1, 0, 4, 0xc8297au, 55},
    {0x89e0b0u, 28, 0, 0, 4, 0xc8297au, 55},
    {0x89e1b0u, 11, 1, 0, 4, 0xc829b3u, 48},
    {0x89e220u, 12, 0, 0, 4, 0xc829b3u, 48},
    {0x89e450u, 11, 1, 0, 4, 0xc82992u, 11},
    {0x89e4c0u, 12, 0, 0, 4, 0xc82992u, 11},
    {0x89e530u, 11, 1, 0, 4, 0xc8298fu, 6},
    {0x89e5a0u, 12, 0, 0, 4, 0xc8298fu, 6},
    {0x89e6b0u, 37, 1, 0, 4, 0xc8298fu, 5},
    {0x89e740u, 9, 0, 0, 4, 0xc8298fu, 5},
    {0x89e7e0u, 7, 1, 0, 4, 0xc8298fu, 4},
    {0x89e870u, 8, 0, 5, 4, 0xc8298fu, 4},
    {0x89e8e0u, 30, 1, 0, 4, 0xc8298fu, 3},
    {0x89e970u, 9, 0, 0, 4, 0xc8298fu, 3},
    {0x89f500u, 7, 1, 0, 4, 0xc8298cu, 2},
    {0x89f590u, 8, 0, 5, 4, 0xc8298cu, 2},
    {0x8bb2e0u, 2, 0, 5, 4, 0xc82980u, 0},
    {0x8bb340u, 3, 1, 0, 3, 0xc82980u, 0},
    {0x8bb420u, 2, 0, 5, 4, 0xc82983u, 1},
    {0x8bb480u, 3, 1, 0, 3, 0xc82983u, 1},
    {0x8bb900u, 0, 0, 1, 4, 0xc82992u, 7},
    {0x8bb960u, 1, 1, 0, 2, 0xc82992u, 7},
    {0x8bb9c0u, 0, 0, 2, 4, 0xc82992u, 8},
    {0x8bba20u, 24, 0, 0, 4, 0xc82992u, 9},
    {0x8bba80u, 13, 0, 0, 4, 0xc82992u, 10},
    {0x8bbb20u, 14, 1, 0, 3, 0xc82992u, 10},
    {0x8bbbc0u, 17, 0, 0, 4, 0xc82992u, 12},
    {0x8bbc60u, 50, 1, 0, 2, 0xc82992u, 12},
    {0x8bbdb0u, 4, 0, 0, 4, 0xc82998u, 13},
    {0x8bbe10u, 5, 1, 0, 0, 0xc82998u, 13},
    {0x8bbe80u, 2, 0, 5, 4, 0xc82998u, 14},
    {0x8bbee0u, 3, 1, 0, 3, 0xc82998u, 14},
    {0x8bbf50u, 31, 0, 0, 4, 0xc82998u, 15},
    {0x8bbfb0u, 32, 1, 0, 4, 0xc82998u, 15},
    {0x8bc070u, 33, 0, 4, 4, 0xc82998u, 16},
    {0x8bc0d0u, 34, 1, 0, 2, 0xc82998u, 16},
    {0x8bc130u, 13, 0, 0, 4, 0xc82998u, 17},
    {0x8bc1d0u, 14, 1, 0, 3, 0xc82998u, 17},
    {0x8bc270u, 0, 0, 1, 4, 0xc82998u, 18},
    {0x8bc2d0u, 1, 1, 0, 2, 0xc82998u, 18},
    {0x8bc3c0u, 33, 0, 4, 4, 0xc8299bu, 19},
    {0x8bc420u, 34, 1, 0, 2, 0xc8299bu, 19},
    {0x8bc480u, 0, 0, 1, 4, 0xc829a1u, 20},
    {0x8bc4e0u, 1, 1, 0, 2, 0xc829a1u, 20},
    {0x8bc540u, 15, 0, 0, 4, 0xc829a1u, 21},
    {0x8bc5b0u, 16, 1, 0, 4, 0xc829a1u, 21},
    {0x8bc6c0u, 4, 0, 0, 4, 0xc829a1u, 22},
    {0x8bc720u, 5, 1, 0, 0, 0xc829a1u, 22},
    {0x8bc790u, 0, 0, 2, 4, 0xc829a1u, 23},
    {0x8bc7f0u, 24, 0, 0, 4, 0xc829a1u, 24},
    {0x8bc850u, 0, 0, 1, 4, 0xc829a4u, 26},
    {0x8bc8b0u, 1, 1, 0, 2, 0xc829a4u, 26},
    {0x8bc910u, 15, 0, 0, 4, 0xc829a4u, 27},
    {0x8bc980u, 16, 1, 0, 4, 0xc829a4u, 27},
    {0x8bca90u, 4, 0, 0, 4, 0xc829a4u, 28},
    {0x8bcaf0u, 5, 1, 0, 0, 0xc829a4u, 28},
    {0x8bcb60u, 24, 0, 0, 4, 0xc829a4u, 29},
    {0x8bcbc0u, 38, 0, 0, 4, 0xc829a4u, 30},
    {0x8bcc50u, 39, 1, 0, 0, 0xc829a4u, 30},
    {0x8bccf0u, 0, 0, 1, 4, 0xc829a7u, 31},
    {0x8bcd50u, 1, 1, 0, 2, 0xc829a7u, 31},
    {0x8bcdb0u, 15, 0, 0, 4, 0xc829a7u, 32},
    {0x8bce20u, 16, 1, 0, 4, 0xc829a7u, 32},
    {0x8bcf30u, 0, 0, 2, 4, 0xc829a7u, 33},
    {0x8bcf90u, 4, 0, 0, 4, 0xc829a7u, 34},
    {0x8bd000u, 5, 1, 0, 0, 0xc829a7u, 34},
    {0x8bd070u, 35, 0, 0, 4, 0xc829a7u, 35},
    {0x8bd0d0u, 25, 1, 0, 1, 0xc829a7u, 35},
    {0x8bd130u, 24, 0, 0, 4, 0xc829a7u, 36},
    {0x8bd190u, 33, 0, 4, 4, 0xc829a7u, 37},
    {0x8bd1f0u, 34, 1, 0, 2, 0xc829a7u, 37},
    {0x8bd250u, 0, 0, 1, 4, 0xc829aau, 38},
    {0x8bd2b0u, 1, 1, 0, 2, 0xc829aau, 38},
    {0x8bd310u, 15, 0, 0, 4, 0xc829aau, 39},
    {0x8bd380u, 16, 1, 0, 4, 0xc829aau, 39},
    {0x8bd490u, 4, 0, 0, 4, 0xc829aau, 40},
    {0x8bd4f0u, 5, 1, 0, 0, 0xc829aau, 40},
    {0x8bd560u, 18, 0, 0, 4, 0xc829aau, 41},
    {0x8bd5f0u, 19, 1, 0, 2, 0xc829aau, 41},
    {0x8bd690u, 0, 0, 1, 4, 0xc829b0u, 42},
    {0x8bd6f0u, 1, 1, 0, 2, 0xc829b0u, 42},
    {0x8bd750u, 31, 0, 0, 4, 0xc829b0u, 43},
    {0x8bd7b0u, 32, 1, 0, 4, 0xc829b0u, 43},
    {0x8bd870u, 26, 0, 0, 4, 0xc829b0u, 44},
    {0x8bd900u, 27, 1, 0, 4, 0xc829b0u, 44},
    {0x8bd990u, 2, 0, 5, 4, 0xc829b0u, 45},
    {0x8bd9f0u, 3, 1, 0, 3, 0xc829b0u, 45},
    {0x8bda60u, 17, 0, 0, 4, 0xc829b3u, 46},
    {0x8bdb00u, 20, 1, 0, 2, 0xc829b3u, 46},
    {0x8bdb90u, 0, 0, 1, 4, 0xc829b3u, 47},
    {0x8bdbf0u, 1, 1, 0, 2, 0xc829b3u, 47},
    {0x8bdc50u, 17, 0, 0, 4, 0xc829b6u, 49},
    {0x8bdcf0u, 20, 1, 0, 2, 0xc829b6u, 49},
    {0x8bdd80u, 0, 0, 1, 4, 0xc829b6u, 50},
    {0x8bdde0u, 1, 1, 0, 2, 0xc829b6u, 50},
    {0x8bde40u, 13, 0, 0, 4, 0xc829bfu, 51},
    {0x8bdee0u, 14, 1, 0, 3, 0xc829bfu, 51},
    {0x8bdf80u, 0, 0, 1, 4, 0xc829c2u, 52},
    {0x8bdfe0u, 1, 1, 0, 2, 0xc829c2u, 52},
    {0x8be040u, 2, 0, 5, 4, 0xc829c2u, 53},
    {0x8be0a0u, 3, 1, 0, 3, 0xc829c2u, 53},
    {0x8be110u, 2, 0, 5, 4, 0xc8297au, 54},
    {0x8be170u, 3, 1, 0, 3, 0xc8297au, 54},
    {0x8be1e0u, 2, 0, 5, 4, 0xc829c5u, 69},
    {0x8be240u, 3, 1, 0, 3, 0xc829c5u, 69},
    {0x8be2b0u, 0, 0, 1, 4, 0xc829c5u, 70},
    {0x8be310u, 1, 1, 0, 2, 0xc829c5u, 70},
    {0x8be370u, 13, 0, 0, 4, 0xc829c5u, 71},
    {0x8be410u, 14, 1, 0, 3, 0xc829c5u, 71},
    {0x8be4b0u, 17, 0, 0, 4, 0xc829c5u, 72},
    {0x8be550u, 20, 1, 0, 2, 0xc829c5u, 72},
    {0x8be5e0u, 4, 0, 0, 4, 0xc829c5u, 73},
    {0x8be640u, 5, 1, 0, 0, 0xc829c5u, 73},
    {0x8be6b0u, 2, 0, 5, 4, 0xc829c8u, 80},
    {0x8be710u, 3, 1, 0, 3, 0xc829c8u, 80},
    {0x8be780u, 26, 0, 0, 4, 0xc829c8u, 81},
    {0x8be810u, 27, 1, 0, 4, 0xc829c8u, 81},
    {0x8be8a0u, 31, 0, 0, 4, 0xc829c8u, 82},
    {0x8be900u, 32, 1, 0, 4, 0xc829c8u, 82},
    {0x8be9c0u, 4, 0, 0, 4, 0xc829c8u, 83},
    {0x8bea20u, 5, 1, 0, 0, 0xc829c8u, 83},
    {0x8bea90u, 18, 0, 0, 4, 0xc829c8u, 84},
    {0x8beb20u, 19, 1, 0, 2, 0xc829c8u, 84},
    {0x8bebc0u, 51, 0, 0, 4, 0xc829c8u, 85},
    {0x8bec60u, 52, 1, 0, 2, 0xc829c8u, 85},
    {0x8becf0u, 0, 0, 1, 4, 0xc829c8u, 86},
    {0x8bed50u, 1, 1, 0, 2, 0xc829c8u, 86},
    {0x8bedb0u, 0, 0, 2, 4, 0xc829cbu, 89},
    {0x8bee10u, 1, 1, 0, 2, 0xc829cbu, 89},
    {0x8bee70u, 2, 0, 5, 4, 0xc829ceu, 91},
    {0x8beed0u, 3, 1, 0, 3, 0xc829ceu, 91},
    {0x8bef40u, 0, 0, 1, 4, 0xc829ceu, 92},
    {0x8befa0u, 1, 1, 0, 2, 0xc829ceu, 92},
    {0x8bf000u, 4, 0, 0, 4, 0xc829ceu, 93},
    {0x8bf060u, 5, 1, 0, 0, 0xc829ceu, 93},
    {0x8bf0d0u, 13, 0, 0, 4, 0xc829ceu, 94},
    {0x8bf170u, 14, 1, 0, 3, 0xc829ceu, 94},
    {0x8bf210u, 0, 0, 1, 4, 0xc829d1u, 97},
    {0x8bf270u, 1, 1, 0, 2, 0xc829d1u, 97},
    {0x8bf2d0u, 2, 0, 5, 4, 0xc829d1u, 98},
    {0x8bf330u, 3, 1, 0, 3, 0xc829d1u, 98},
    {0x8bf3a0u, 13, 0, 0, 4, 0xc829d1u, 99},
    {0x8bf440u, 14, 1, 0, 3, 0xc829d1u, 99},
    {0x8bf4e0u, 4, 0, 0, 4, 0xc829d1u, 100},
    {0x8bf540u, 5, 1, 0, 0, 0xc829d1u, 100},
    {0x8bf5b0u, 0, 0, 1, 4, 0xc829d7u, 107},
    {0x8bf610u, 1, 1, 0, 2, 0xc829d7u, 107},
    {0x8bf670u, 36, 0, 0, 4, 0xc829d7u, 108},
    {0x8bf700u, 53, 1, 0, 4, 0xc829d7u, 108},
    {0x8bf920u, 0, 0, 2, 4, 0xc829d7u, 109},
    {0x8bf980u, 13, 0, 0, 4, 0xc829d7u, 110},
    {0x8bfa20u, 14, 1, 0, 3, 0xc829d7u, 110},
    {0x8bfac0u, 13, 0, 0, 4, 0xc829ddu, 116},
    {0x8bfb60u, 14, 1, 0, 3, 0xc829ddu, 116},
    {0x8bfc00u, 2, 0, 5, 4, 0xc829ddu, 117},
    {0x8bfc60u, 3, 1, 0, 3, 0xc829ddu, 117},
    {0x8bfcd0u, 26, 0, 0, 4, 0xc829ddu, 118},
    {0x8bfd60u, 27, 1, 0, 4, 0xc829ddu, 118},
    {0x8bfdf0u, 0, 0, 1, 4, 0xc829ddu, 119},
    {0x8bfe50u, 1, 1, 0, 2, 0xc829ddu, 119},
    {0x8bfeb0u, 4, 0, 0, 4, 0xc829ddu, 120},
    {0x8bff10u, 5, 1, 0, 0, 0xc829ddu, 120},
    {0x8bff80u, 38, 0, 0, 4, 0xc829ddu, 121},
    {0x8c0010u, 39, 1, 0, 0, 0xc829ddu, 121},
    {0x8c00b0u, 54, 0, 0, 4, 0xc829ddu, 122},
    {0x8c0140u, 55, 1, 0, 4, 0xc829ddu, 122},
    {0x8c0230u, 0, 0, 2, 4, 0xc829ddu, 123},
    {0x8c0290u, 18, 0, 0, 4, 0xc829ddu, 124},
    {0x8c0320u, 19, 1, 0, 2, 0xc829ddu, 124},
    {0x8c03c0u, 17, 0, 0, 4, 0xc829ddu, 125},
    {0x8c0460u, 20, 1, 0, 2, 0xc829ddu, 125},
    {0x8c04f0u, 2, 0, 5, 4, 0xc829e0u, 128},
    {0x8c0550u, 3, 1, 0, 3, 0xc829e0u, 128},
    {0x8c05c0u, 0, 0, 1, 4, 0xc829e3u, 129},
    {0x8c0620u, 1, 1, 0, 2, 0xc829e3u, 129},
    {0x8c0680u, 0, 0, 2, 4, 0xc829e3u, 130},
    {0x8c06e0u, 4, 0, 0, 4, 0xc829e3u, 131},
    {0x8c0740u, 5, 1, 0, 0, 0xc829e3u, 131},
    {0x8c07b0u, 56, 0, 0, 4, 0xc82a1eu, 134},
    {0x8c0850u, 57, 1, 0, 4, 0xc82a1eu, 134},
    {0x8c08f0u, 0, 0, 1, 4, 0xc82a1eu, 135},
    {0x8c0950u, 1, 1, 0, 2, 0xc82a1eu, 135},
    {0x8c09b0u, 0, 0, 1, 4, 0xc829e6u, 137},
    {0x8c0a10u, 1, 1, 0, 2, 0xc829e6u, 137},
    {0x8c0a70u, 36, 0, 0, 4, 0xc829e6u, 138},
    {0x8c0b00u, 40, 1, 0, 4, 0xc829e6u, 138},
    {0x8c0c10u, 4, 0, 0, 4, 0xc829e6u, 139},
    {0x8c0c70u, 5, 1, 0, 0, 0xc829e6u, 139},
    {0x8c0ce0u, 18, 0, 0, 4, 0xc829e6u, 140},
    {0x8c0d70u, 19, 1, 0, 2, 0xc829e6u, 140},
    {0x8c0e10u, 18, 0, 0, 4, 0xc829e6u, 141},
    {0x8c0ea0u, 19, 1, 0, 2, 0xc829e6u, 141},
    {0x8c0f40u, 15, 0, 0, 4, 0xc829e6u, 142},
    {0x8c0fb0u, 16, 1, 0, 4, 0xc829e6u, 142},
    {0x8c10c0u, 0, 0, 1, 4, 0xc829e9u, 143},
    {0x8c1120u, 1, 1, 0, 2, 0xc829e9u, 143},
    {0x8c1180u, 15, 0, 0, 4, 0xc829e9u, 144},
    {0x8c11f0u, 16, 1, 0, 4, 0xc829e9u, 144},
    {0x8c1300u, 4, 0, 0, 4, 0xc829e9u, 145},
    {0x8c1360u, 5, 1, 0, 0, 0xc829e9u, 145},
    {0x8c13d0u, 4, 0, 0, 4, 0xc829ecu, 146},
    {0x8c1430u, 5, 1, 0, 0, 0xc829ecu, 146},
    {0x8c14a0u, 15, 0, 0, 4, 0xc829efu, 147},
    {0x8c1510u, 16, 1, 0, 4, 0xc829efu, 147},
    {0x8c1620u, 0, 0, 1, 4, 0xc829efu, 148},
    {0x8c1680u, 1, 1, 0, 2, 0xc829efu, 148},
    {0x8c16e0u, 0, 0, 1, 4, 0xc829f2u, 149},
    {0x8c1740u, 1, 1, 0, 2, 0xc829f2u, 149},
    {0x8c17a0u, 36, 0, 0, 4, 0xc829f5u, 150},
    {0x8c1830u, 40, 1, 0, 4, 0xc829f5u, 150},
    {0x8c1940u, 58, 0, 0, 4, 0xc829f5u, 151},
    {0x8c19c0u, 59, 1, 0, 2, 0xc829f5u, 151},
    {0x8c1a50u, 26, 0, 0, 4, 0xc829f5u, 152},
    {0x8c1ae0u, 27, 1, 0, 4, 0xc829f5u, 152},
    {0x8c1b70u, 0, 0, 1, 4, 0xc829f8u, 153},
    {0x8c1bd0u, 1, 1, 0, 2, 0xc829f8u, 153},
    {0x8c1c30u, 0, 0, 1, 4, 0xc829fbu, 154},
    {0x8c1c90u, 1, 1, 0, 2, 0xc829fbu, 154},
    {0x8c1cf0u, 41, 0, 3, 4, 0xc829fbu, 155},
    {0x8c1d50u, 25, 1, 0, 1, 0xc829fbu, 155},
    {0x8c1db0u, 2, 0, 5, 4, 0xc829fbu, 156},
    {0x8c1e10u, 3, 1, 0, 3, 0xc829fbu, 156},
    {0x8c1e80u, 35, 0, 0, 4, 0xc829feu, 157},
    {0x8c1ee0u, 25, 1, 0, 1, 0xc829feu, 157},
    {0x8c1f40u, 60, 0, 0, 4, 0xc829feu, 158},
    {0x8c1fa0u, 61, 1, 0, 0, 0xc829feu, 158},
    {0x8c2000u, 2, 0, 5, 4, 0xc829feu, 159},
    {0x8c2060u, 3, 1, 0, 3, 0xc829feu, 159},
    {0x8c23b0u, 0, 0, 1, 4, 0xc82a04u, 160},
    {0x8c2410u, 1, 1, 0, 2, 0xc82a04u, 160},
    {0x8c2470u, 17, 0, 0, 4, 0xc82a04u, 161},
    {0x8c2510u, 20, 1, 0, 2, 0xc82a04u, 161},
    {0x8c25a0u, 18, 0, 0, 4, 0xc82a04u, 162},
    {0x8c2630u, 19, 1, 0, 2, 0xc82a04u, 162},
    {0x8c26d0u, 0, 0, 2, 4, 0xc82a04u, 163},
    {0x8c2730u, 41, 0, 3, 4, 0xc82a04u, 165},
    {0x8c2790u, 25, 1, 0, 1, 0xc82a04u, 165},
    {0x8c27f0u, 35, 0, 0, 4, 0xc82a04u, 166},
    {0x8c2850u, 0, 0, 1, 4, 0xc82a13u, 172},
    {0x8c28b0u, 1, 1, 0, 2, 0xc82a13u, 172},
};

constexpr int32_t kIsaacLuaClosureCount =
    static_cast<int32_t>(sizeof(kIsaacLuaClosures) / sizeof(kIsaacLuaClosures[0]));

const IsaacLuaClosureRow* isaac_lua_closure_at(int32_t index) {
  if (index < 0 || index >= kIsaacLuaClosureCount) {
    return nullptr;
  }
  return &kIsaacLuaClosures[index];
}

const IsaacLuaClosureCluster* isaac_lua_closure_cluster_at(int32_t index) {
  if (index < 0 || index >= kIsaacLuaClosureClusterCount) {
    return nullptr;
  }
  return &kIsaacLuaClosureClusters[index];
}

}  // namespace

static_assert(kIsaacLuaClosureCount == ISAAC_LUA_PROPERTY_CLOSURE_TOTAL,
              "v22 closure table must hold the whole censused population");
static_assert(kIsaacLuaClosureClusterCount ==
                  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTER_COUNT,
              "v22 cluster table must hold every template cluster");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_COUNT +
                      ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_COUNT ==
                  ISAAC_LUA_PROPERTY_CLOSURE_TOTAL,
              "the two bands partition the closure population");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_GET_ONLY +
                      ISAAC_LUA_PROPERTY_CLOSURE_SET_ONLY +
                      ISAAC_LUA_PROPERTY_CLOSURE_DUAL_ROLE ==
                  ISAAC_LUA_PROPERTY_CLOSURE_TOTAL,
              "roles partition the closure population (C8)");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_0_FREE +
                      ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_1_FREE +
                      ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_2_FREE +
                      ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_3_FREE +
                      ISAAC_LUA_PROPERTY_CLOSURE_CLUSTERS_5_FREE ==
                  ISAAC_LUA_PROPERTY_CLOSURE_CLUSTER_COUNT,
              "free-field histogram covers every cluster");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_SINGLE_CHECK +
                      ISAAC_LUA_PROPERTY_CLOSURE_DOUBLE_CHECK ==
                  ISAAC_LUA_PROPERTY_CLOSURE_TOTAL,
              "every body performs one or two class checks (C3)");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_STORE_BYTE +
                      ISAAC_LUA_PROPERTY_CLOSURE_STORE_WORD +
                      ISAAC_LUA_PROPERTY_CLOSURE_STORE_DWORD +
                      ISAAC_LUA_PROPERTY_CLOSURE_STORE_MOVSS +
                      ISAAC_LUA_PROPERTY_CLOSURE_STORE_INDIRECT ==
                  ISAAC_LUA_PROPERTY_CLOSURE_SET_ONLY,
              "store-width census covers every setter");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_GET_RETURN_EXACT +
                      ISAAC_LUA_PROPERTY_CLOSURE_SET_RETURN_EXACT +
                      ISAAC_LUA_PROPERTY_CLOSURE_RETURN_EXCEPTIONS ==
                  ISAAC_LUA_PROPERTY_CLOSURE_TOTAL,
              "C6 return law plus its one recorded exception is total");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_GET_FLAG_SITES ==
                      ISAAC_LUA_PROPERTY_CLOSURE_GET_ONLY &&
                  ISAAC_LUA_PROPERTY_CLOSURE_SET_FLAG_SITES ==
                      ISAAC_LUA_PROPERTY_CLOSURE_SET_ONLY,
              "C5 const flag is a total function of the role");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_FULLWORD_TESTS +
                      ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_BYTE_TESTS ==
                  ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_CALLS,
              "C7 accounts for every lua_type site");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_LUA_TYPE_BYTE_TESTS == 0,
              "C7: the lua_type gate is never a low-byte test");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_CENSUS_MISMATCH == 0 &&
                  ISAAC_LUA_PROPERTY_CLOSURE_CENSUS_EXACT ==
                      ISAAC_LUA_PROPERTY_CLOSURE_TOTAL,
              "C1 reconstruction is byte-exact on the whole population");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_MEMBER_KEY_DISAGREE == 0 &&
                  static_cast<int>(ISAAC_LUA_PROPERTY_CLOSURE_MEMBER_KEY_AGREE) ==
                      static_cast<int>(ISAAC_LUA_PROPERTY_FAMILY_COUNT),
              "C4 ties every v21 member to one class key");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_UNMODELLED +
                      ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_UNMODELLED ==
                  ISAAC_LUA_PROPERTY_CLOSURE_BAND_UNMODELLED,
              "orphan split matches the orphan total");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_ORPHAN_A_PROPERTY_SHAPED +
                      ISAAC_LUA_PROPERTY_CLOSURE_ORPHAN_B_PROPERTY_SHAPED ==
                  ISAAC_LUA_PROPERTY_CLOSURE_ORPHAN_PROPERTY_SHAPED,
              "property-shaped orphan split matches its total");
static_assert(ISAAC_LUA_PROPERTY_CLOSURE_CLASS_KEY_FILE_BACKED == 0,
              "the class-key blob is BSS: never read bytes through it");

int32_t isaac_lua_engine_closure_count(void) { return kIsaacLuaClosureCount; }

uint32_t isaac_lua_engine_closure_va(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->va : 0u;
}

int32_t isaac_lua_engine_closure_cluster(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->cluster : -1;
}

int32_t isaac_lua_engine_closure_role(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->role : -1;
}

uint32_t isaac_lua_engine_closure_class_key(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->class_key : 0u;
}

int32_t isaac_lua_engine_closure_member(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->member : -1;
}

int32_t isaac_lua_engine_closure_push_kind(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->push_kind : -1;
}

int32_t isaac_lua_engine_closure_store_kind(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? row->store_kind : -1;
}

uint32_t isaac_lua_engine_closure_body_bytes(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  if (row == nullptr) {
    return 0u;
  }
  return kIsaacLuaClosureClusters[row->cluster].body_bytes;
}

uint32_t isaac_lua_engine_closure_body_insns(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  if (row == nullptr) {
    return 0u;
  }
  return kIsaacLuaClosureClusters[row->cluster].body_insns;
}

int32_t isaac_lua_engine_closure_band_for_va(uint32_t va) {
  if (va >= static_cast<uint32_t>(ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_LO) &&
      va <= static_cast<uint32_t>(ISAAC_LUA_PROPERTY_CLOSURE_BAND_A_HI)) {
    return ISAAC_LUA_PROPERTY_CLOSURE_BAND_A;
  }
  if (va >= static_cast<uint32_t>(ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_LO) &&
      va <= static_cast<uint32_t>(ISAAC_LUA_PROPERTY_CLOSURE_BAND_B_HI)) {
    return ISAAC_LUA_PROPERTY_CLOSURE_BAND_B;
  }
  return -1;
}

int32_t isaac_lua_engine_closure_band(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  return row != nullptr ? isaac_lua_engine_closure_band_for_va(row->va) : -1;
}

int32_t isaac_lua_engine_closure_index_for_va(uint32_t va) {
  for (int32_t i = 0; i < kIsaacLuaClosureCount; ++i) {
    if (kIsaacLuaClosures[i].va == va) {
      return i;
    }
  }
  return -1;
}

int32_t isaac_lua_engine_closure_const_flag(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  if (row == nullptr) {
    return -1;
  }
  return row->role == ISAAC_LUA_PROPERTY_CLOSURE_ROLE_GET
             ? ISAAC_LUA_PROPERTY_CLOSURE_GET_CONST_FLAG
             : ISAAC_LUA_PROPERTY_CLOSURE_SET_CONST_FLAG;
}

int32_t isaac_lua_engine_closure_return_value(int32_t index) {
  const IsaacLuaClosureRow* row = isaac_lua_closure_at(index);
  if (row == nullptr) {
    return -1;
  }
  /* One body breaks the role law and is reproduced, not corrected. */
  if (row->va == static_cast<uint32_t>(
                     ISAAC_LUA_PROPERTY_CLOSURE_RETURN_EXCEPTION_VA)) {
    return 1;
  }
  return row->role == ISAAC_LUA_PROPERTY_CLOSURE_ROLE_GET
             ? ISAAC_LUA_PROPERTY_CLOSURE_GET_RETURN
             : ISAAC_LUA_PROPERTY_CLOSURE_SET_RETURN;
}

int32_t isaac_lua_engine_closure_cluster_count(void) {
  return kIsaacLuaClosureClusterCount;
}

uint32_t isaac_lua_engine_closure_cluster_rep_va(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->rep_va : 0u;
}

int32_t isaac_lua_engine_closure_cluster_bodies(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->bodies : -1;
}

uint32_t isaac_lua_engine_closure_cluster_body_bytes(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->body_bytes : 0u;
}

uint32_t isaac_lua_engine_closure_cluster_body_insns(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->body_insns : 0u;
}

int32_t isaac_lua_engine_closure_cluster_band(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->band : -1;
}

int32_t isaac_lua_engine_closure_cluster_operand_fields(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->operand_fields : -1;
}

int32_t isaac_lua_engine_closure_cluster_free_fields(int32_t index) {
  const IsaacLuaClosureCluster* c = isaac_lua_closure_cluster_at(index);
  return c != nullptr ? c->free_fields : -1;
}

/* ---- x86 semantics ---------------------------------------------------- */

int32_t isaac_lua_engine_closure_type_gate_taken(uint32_t lua_type_result) {
  /* 85 c0 test eax,eax / 75 xx jne - the whole register, not AL. */
  return lua_type_result != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_closure_const_gate_raises(uint32_t const_marker,
                                                   uint32_t flag_arg) {
  /* 80 7d ff 00 cmp byte ptr [ebp-1],0 / 74 xx je  -> skip when zero
     80 7d 0c 00 cmp byte ptr [ebp+0xc],0 / 75 xx jne -> skip when nonzero
     Both operands are BYTES; re-narrow explicitly because the Wasm ABI
     hands us the caller's full 32-bit value. */
  const uint32_t marker_byte = const_marker & 0xffu;
  const uint32_t flag_byte = flag_arg & 0xffu;
  return (marker_byte != 0u && flag_byte == 0u) ? 1 : 0;
}

int32_t isaac_lua_engine_closure_boolean_normalize(uint32_t value) {
  /* 85 c0 test eax,eax / 0f 95 45 fc setne byte ptr [ebp-4]. */
  return value != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_closure_push_i32_lo(uint32_t value) {
  return value;
}

uint32_t isaac_lua_engine_closure_push_i32_hi(uint32_t value) {
  /* 99 cdq: EDX becomes the replicated sign bit of EAX. */
  return (value & 0x80000000u) != 0u ? 0xffffffffu : 0u;
}

uint32_t isaac_lua_engine_closure_push_u32_lo(uint32_t value) {
  return value;
}

uint32_t isaac_lua_engine_closure_push_u32_hi(uint32_t value) {
  (void)value;
  /* 6a 00 push 0 supplies the high dword unconditionally. */
  return 0u;
}

uint32_t isaac_lua_engine_closure_push_u16_lo(uint32_t value) {
  /* 0f b7 c2 movzx eax,dx narrows first, so cdq can never see a sign bit. */
  return value & 0xffffu;
}

uint32_t isaac_lua_engine_closure_push_u16_hi(uint32_t value) {
  (void)value;
  return 0u;
}

uint32_t isaac_lua_engine_closure_store_value(int32_t store_kind,
                                              uint32_t value) {
  switch (store_kind) {
    case ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_BYTE:
      return value & 0xffu;
    case ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_WORD:
      return value & 0xffffu;
    case ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_DWORD:
    case ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_MOVSS:
    case ISAAC_LUA_PROPERTY_CLOSURE_STORE_KIND_INDIRECT:
      return value;
    default:
      return 0u;
  }
}

uint32_t isaac_lua_engine_closure_upvalue_index(int32_t n) {
  const int32_t registry =
      -(ISAAC_LUA_PROPERTY_CLOSURE_LUAI_MAXSTACK + 1000);
  return static_cast<uint32_t>(registry - n);
}

namespace {
/* v22 signature pins: index maps are int32_t, VA maps take uint32_t, and the
   byte gates take uint32_t so the in-body mask survives -O2. */
using IsaacU32PairMapFn = uint32_t (*)(int32_t, uint32_t);
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigClosureVa =
    &isaac_lua_engine_closure_va;
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigClosureClassKey =
    &isaac_lua_engine_closure_class_key;
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigClosureBodyBytes =
    &isaac_lua_engine_closure_body_bytes;
[[maybe_unused]] constexpr IsaacI32IndexMapFn kSigClosureRole =
    &isaac_lua_engine_closure_role;
[[maybe_unused]] constexpr IsaacI32IndexMapFn kSigClosureReturnValue =
    &isaac_lua_engine_closure_return_value;
[[maybe_unused]] constexpr IsaacU32GateFn kSigClosureBandForVa =
    &isaac_lua_engine_closure_band_for_va;
[[maybe_unused]] constexpr IsaacU32GateFn kSigClosureIndexForVa =
    &isaac_lua_engine_closure_index_for_va;
[[maybe_unused]] constexpr IsaacU32GateFn kSigClosureTypeGate =
    &isaac_lua_engine_closure_type_gate_taken;
[[maybe_unused]] constexpr IsaacU32GateFn kSigClosureBoolNormalize =
    &isaac_lua_engine_closure_boolean_normalize;
[[maybe_unused]] constexpr IsaacU32PairGateFn kSigClosureConstGate =
    &isaac_lua_engine_closure_const_gate_raises;
[[maybe_unused]] constexpr IsaacU32MapFn kSigClosurePushI32Hi =
    &isaac_lua_engine_closure_push_i32_hi;
[[maybe_unused]] constexpr IsaacU32MapFn kSigClosurePushU32Hi =
    &isaac_lua_engine_closure_push_u32_hi;
[[maybe_unused]] constexpr IsaacU32MapFn kSigClosurePushU16Lo =
    &isaac_lua_engine_closure_push_u16_lo;
[[maybe_unused]] constexpr IsaacU32PairMapFn kSigClosureStoreValue =
    &isaac_lua_engine_closure_store_value;
[[maybe_unused]] constexpr IsaacU32IndexMapFn kSigClosureUpvalueIndex =
    &isaac_lua_engine_closure_upvalue_index;
}  // namespace

/* ---------------------------------------------------------------------
   v23: inline property-installer family + its 21 read-only getters.
   --------------------------------------------------------------------- */
namespace {

struct IsaacLuaInlineOrphanRow {
  uint32_t va;
  int32_t band;       /* 0 = A, 1 = B */
  uint32_t class_key; /* receiver class-check key (first check) */
  int32_t calls_upvalue;
  int32_t ret_value;
  int32_t check_count;
  uint32_t size;
};

struct IsaacLuaInlineInstallerRow {
  uint32_t va;
  uint32_t body;      /* installed orphan getter body */
  uint32_t ud_value;  /* 0 when discipline == CALLER_ARG */
  int32_t ud_disc;    /* ISAAC_LUA_INLINE_UD_* */
  uint32_t ret_imm;
  int32_t propget_pushes;
  uint32_t size;
};

/* {va, band, receiver key, calls_upvalue, ret, checks, body bytes} */
constexpr IsaacLuaInlineOrphanRow kInlineOrphans[] = {
    {0x00899930u, 0, 0x00c82a01u, 1, 1, 1, 0xa2u},
    {0x008999e0u, 0, 0x00c82a01u, 1, 1, 1, 0x66u},
    {0x00899a50u, 0, 0x00c829feu, 1, 1, 1, 0xa2u},
    {0x0089a5d0u, 0, 0x00c82a1eu, 0, 1, 1, 0x9eu},
    {0x0089a8b0u, 0, 0x00c8297au, 0, 1, 1, 0x19eu},
    {0x0089b1e0u, 0, 0x00c829d7u, 0, 1, 1, 0x9bu},
    {0x0089b380u, 0, 0x00c82980u, 0, 1, 2, 0x1b3u},
    {0x0089bf10u, 0, 0x00c829c8u, 0, 1, 1, 0x5cu},
    {0x0089c0a0u, 0, 0x00c82a20u, 0, 1, 3, 0x20au},
    {0x0089c6f0u, 0, 0x00c829c5u, 0, 1, 1, 0x9bu},
    {0x0089c790u, 0, 0x00c829c5u, 0, 1, 1, 0x5cu},
    {0x0089e150u, 0, 0x00c829bcu, 0, 1, 1, 0x5cu},
    {0x0089e290u, 0, 0x00c829a7u, 1, 1, 1, 0x68u},
    {0x0089e3b0u, 0, 0x00c829a7u, 0, 1, 1, 0x9bu},
    {0x008c20d0u, 1, 0x00c82a01u, 0, 1, 1, 0x59u},
    {0x008c2130u, 1, 0x00c82a01u, 0, 1, 1, 0x59u},
    {0x008c2190u, 1, 0x00c82a01u, 0, 1, 1, 0x8bu},
    {0x008c2220u, 1, 0x00c82a01u, 0, 1, 1, 0x68u},
    {0x008c2290u, 1, 0x00c82a01u, 0, 1, 1, 0x5bu},
    {0x008c22f0u, 1, 0x00c82a01u, 0, 1, 1, 0x5au},
    {0x008c2350u, 1, 0x00c82a01u, 0, 1, 1, 0x5du},
};

/* {va, installed body, ud value(0=caller_arg), discipline, ret imm,
    __propget pushes, size} */
constexpr IsaacLuaInlineInstallerRow kInlineInstallers[] = {
    {0x008794b0u, 0x0089e3b0u, 0x0085dbc0u, 1, 0x8u, 2, 0xf5u},
    {0x0087ad70u, 0x0089e290u, 0x0085dbd0u, 1, 0x8u, 0, 0x5bu},
    {0x0087ce80u, 0x0089e150u, 0x004176f0u, 1, 0x8u, 2, 0xf5u},
    {0x0087cfb0u, 0x0089e150u, 0x004176f0u, 1, 0x8u, 0, 0xa3u},
    {0x008800c0u, 0x0089c790u, 0x004aade0u, 1, 0x8u, 2, 0xf5u},
    {0x00880b80u, 0x0089c6f0u, 0x0085dd90u, 1, 0x8u, 2, 0xf5u},
    {0x00881390u, 0x0089bf10u, 0x00000000u, 2, 0x8u, 0, 0x9eu},
    {0x00882f90u, 0x0089c0a0u, 0x00782160u, 1, 0x8u, 0, 0x5bu},
    {0x00883220u, 0x0089bf10u, 0x00423950u, 1, 0x8u, 2, 0xf5u},
    {0x00886d80u, 0x0089b380u, 0x006c2750u, 1, 0x8u, 0, 0x5bu},
    {0x00887570u, 0x0089b1e0u, 0x00000000u, 2, 0x8u, 2, 0xf0u},
    {0x00888a10u, 0x0089a8b0u, 0x0096fd60u, 1, 0x8u, 0, 0x5bu},
    {0x0088a580u, 0x0089a5d0u, 0x00709df0u, 1, 0x8u, 2, 0xf5u},
    {0x0088e5c0u, 0x00899a50u, 0x00872000u, 1, 0x8u, 2, 0xf5u},
    {0x0088e9e0u, 0x008c20d0u, 0x00000000u, 2, 0xcu, 2, 0xf0u},
    {0x0088ead0u, 0x008c2130u, 0x00000000u, 2, 0xcu, 2, 0xf0u},
    {0x0088ebc0u, 0x008c2190u, 0x00000004u, 0, 0xcu, 2, 0xf5u},
    {0x0088ecc0u, 0x008c2220u, 0x00000014u, 0, 0xcu, 2, 0xf5u},
    {0x0088edc0u, 0x008c2290u, 0x00000000u, 2, 0xcu, 2, 0xf0u},
    {0x0088eeb0u, 0x008999e0u, 0x00872040u, 1, 0x8u, 2, 0xf5u},
    {0x0088efb0u, 0x00899930u, 0x00872020u, 1, 0x8u, 2, 0xf5u},
    {0x0088f0b0u, 0x008c22f0u, 0x00000044u, 0, 0xcu, 2, 0xf5u},
    {0x0088f1b0u, 0x008c2350u, 0x00000000u, 2, 0xcu, 2, 0xf0u},
};

constexpr int32_t kInlineOrphanCount =
    static_cast<int32_t>(sizeof(kInlineOrphans) / sizeof(kInlineOrphans[0]));
constexpr int32_t kInlineInstallerCount =
    static_cast<int32_t>(sizeof(kInlineInstallers) /
                         sizeof(kInlineInstallers[0]));

const IsaacLuaInlineOrphanRow* inline_orphan_at(int32_t index) {
  if (index < 0 || index >= kInlineOrphanCount) {
    return nullptr;
  }
  return &kInlineOrphans[index];
}

const IsaacLuaInlineInstallerRow* inline_installer_at(int32_t index) {
  if (index < 0 || index >= kInlineInstallerCount) {
    return nullptr;
  }
  return &kInlineInstallers[index];
}

}  // namespace

static_assert(kInlineInstallerCount == ISAAC_LUA_INLINE_INSTALLER_COUNT,
              "v23 installer table must hold every censused install site");
static_assert(kInlineOrphanCount == ISAAC_LUA_INLINE_ORPHAN_COUNT,
              "v23 orphan table must hold every property-shaped orphan");
static_assert(ISAAC_LUA_INLINE_ORPHAN_BAND_A + ISAAC_LUA_INLINE_ORPHAN_BAND_B ==
                  ISAAC_LUA_INLINE_ORPHAN_COUNT,
              "the two bands partition the 21 orphans");
static_assert(ISAAC_LUA_INLINE_INSTALLER_CODE_PTR +
                      ISAAC_LUA_INLINE_INSTALLER_FIELD_OFFSET +
                      ISAAC_LUA_INLINE_INSTALLER_CALLER_ARG ==
                  ISAAC_LUA_INLINE_INSTALLER_COUNT,
              "the three ud disciplines partition every installer");
static_assert(ISAAC_LUA_INLINE_INSTALLER_RET8 + ISAAC_LUA_INLINE_INSTALLER_RET_C ==
                  ISAAC_LUA_INLINE_INSTALLER_COUNT,
              "ret 8 / ret 0xc partition every installer");
static_assert(ISAAC_LUA_INLINE_SURFACE_V22 + ISAAC_LUA_INLINE_SURFACE_V23 +
                      ISAAC_LUA_ACCESSOR_SURFACE_V24 ==
                  ISAAC_LUA_INLINE_SURFACE_MODELLED,
              "v24: modelled surface = v22 + v23 + v24 bodies");
static_assert(ISAAC_LUA_INLINE_SURFACE_COMPLETE == 1,
              "the property-accessor surface IS complete after v24");

int32_t isaac_lua_engine_inline_installer_count(void) {
  return kInlineInstallerCount;
}

uint32_t isaac_lua_engine_inline_installer_va(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->va : 0u;
}

uint32_t isaac_lua_engine_inline_installer_body(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->body : 0u;
}

uint32_t isaac_lua_engine_inline_installer_ud_value(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->ud_value : 0u;
}

int32_t isaac_lua_engine_inline_installer_ud_discipline(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->ud_disc : -1;
}

uint32_t isaac_lua_engine_inline_installer_ret_imm(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->ret_imm : 0u;
}

int32_t isaac_lua_engine_inline_installer_propget_pushes(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->propget_pushes : -1;
}

uint32_t isaac_lua_engine_inline_installer_size(int32_t index) {
  const IsaacLuaInlineInstallerRow* row = inline_installer_at(index);
  return row != nullptr ? row->size : 0u;
}

int32_t isaac_lua_engine_inline_installer_index_for_va(uint32_t va) {
  for (int32_t i = 0; i < kInlineInstallerCount; ++i) {
    if (kInlineInstallers[i].va == va) {
      return i;
    }
  }
  return -1;
}

uint32_t isaac_lua_engine_inline_orphan_va(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->va : 0u;
}

int32_t isaac_lua_engine_inline_orphan_band(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->band : -1;
}

uint32_t isaac_lua_engine_inline_orphan_class_key(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->class_key : 0u;
}

int32_t isaac_lua_engine_inline_orphan_calls_upvalue(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->calls_upvalue : -1;
}

int32_t isaac_lua_engine_inline_orphan_return_value(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->ret_value : -1;
}

int32_t isaac_lua_engine_inline_orphan_check_count(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->check_count : -1;
}

uint32_t isaac_lua_engine_inline_orphan_size(int32_t index) {
  const IsaacLuaInlineOrphanRow* row = inline_orphan_at(index);
  return row != nullptr ? row->size : 0u;
}

int32_t isaac_lua_engine_inline_orphan_index_for_va(uint32_t va) {
  for (int32_t i = 0; i < kInlineOrphanCount; ++i) {
    if (kInlineOrphans[i].va == va) {
      return i;
    }
  }
  return -1;
}

int32_t isaac_lua_engine_inline_ud_discipline_for_value(uint32_t ud_value) {
  /* uint32_t parameter, re-narrowed by explicit comparisons - never a
     uint8_t. A field offset is a small immediate; a code pointer is inside
     .text resolved from the section table; anything else is a data pointer. */
  const uint32_t value = ud_value & 0xffffffffu;
  if (value < static_cast<uint32_t>(ISAAC_LUA_INLINE_FIELD_OFFSET_LIMIT)) {
    return ISAAC_LUA_INLINE_UD_FIELD_OFFSET;
  }
  if (value >= static_cast<uint32_t>(ISAAC_LUA_INLINE_TEXT_LO) &&
      value < static_cast<uint32_t>(ISAAC_LUA_INLINE_TEXT_HI)) {
    return ISAAC_LUA_INLINE_UD_CODE_PTR;
  }
  return -1; /* data pointer: outside .text and not a small offset */
}

/* v23 signature pins - a uint8_t parameter here would let -O2 delete a mask
   the Wasm ABI never applies. The classifier takes uint32_t and is driven
   UNMASKED with 0x100 / 0x1ff / 0x80000000 / 0xffffffff in the test. */
namespace {
using IsaacU32GateFnV23 = int32_t (*)(uint32_t);
using IsaacU32IndexMapFnV23 = uint32_t (*)(int32_t);
using IsaacI32IndexMapFnV23 = int32_t (*)(int32_t);
[[maybe_unused]] constexpr IsaacU32GateFnV23 kSigInlineUdDiscipline =
    &isaac_lua_engine_inline_ud_discipline_for_value;
[[maybe_unused]] constexpr IsaacU32GateFnV23 kSigInlineInstallerForVa =
    &isaac_lua_engine_inline_installer_index_for_va;
[[maybe_unused]] constexpr IsaacU32GateFnV23 kSigInlineOrphanForVa =
    &isaac_lua_engine_inline_orphan_index_for_va;
[[maybe_unused]] constexpr IsaacU32IndexMapFnV23 kSigInlineInstallerUd =
    &isaac_lua_engine_inline_installer_ud_value;
[[maybe_unused]] constexpr IsaacU32IndexMapFnV23 kSigInlineInstallerBody =
    &isaac_lua_engine_inline_installer_body;
[[maybe_unused]] constexpr IsaacU32IndexMapFnV23 kSigInlineOrphanKey =
    &isaac_lua_engine_inline_orphan_class_key;
[[maybe_unused]] constexpr IsaacI32IndexMapFnV23 kSigInlineInstallerDisc =
    &isaac_lua_engine_inline_installer_ud_discipline;
[[maybe_unused]] constexpr IsaacI32IndexMapFnV23 kSigInlineOrphanCalls =
    &isaac_lua_engine_inline_orphan_calls_upvalue;
[[maybe_unused]] constexpr IsaacI32IndexMapFnV23 kSigInlineOrphanBand =
    &isaac_lua_engine_inline_orphan_band;
}  // namespace

/* ---------------------------------------------------------------------
   v24: band C (26 getters) closes the property-accessor surface, plus the
   fourth region (10) the v23 census missed. Tables transcribed from the
   whole-image install-side census (section-table resolved, branch-aware).
   --------------------------------------------------------------------- */
namespace {

struct IsaacLuaBandCRow {
  uint32_t va;
  int32_t shape;       /* 0 primary (0x5c) / 1 secondary (0xa4) */
  uint32_t class_key;  /* receiver class-check key (BSS registry address) */
  uint32_t ud_value;   /* CODE_PTR immediate written into the userdata */
  uint32_t installer_va;
  uint32_t body_bytes;
};

struct IsaacLuaFourthRow {
  uint32_t va;
  int32_t role;         /* 0 get / 1 set */
  int32_t calls_upvalue;
  int32_t disc_mask;    /* OR of ISAAC_LUA_UD_BIT_* over install sites */
  uint32_t code_ud;     /* CODE_PTR immediate when a CODE_PTR site exists */
  uint32_t class_key;   /* 0 when the body takes no receiver class-check */
  int32_t ret_value;    /* -1 = raises (read-only reject), no normal return */
  uint32_t body_bytes;
};

/* {va, shape, class key, CODE_PTR ud, installer, body bytes} - 26 getters.
   All __propget, all call the upvalue, all return 1, all CODE_PTR. */
constexpr IsaacLuaBandCRow kBandC[] = {
    {0x008c32d0u, 0, 0x00c82a30u, 0x0040c3a0u, 0x00891750u, 0x5cu},
    {0x008c3330u, 0, 0x00c82a3cu, 0x0040c3a0u, 0x00891490u, 0x5cu},
    {0x008c3390u, 0, 0x00c82a33u, 0x0040c3a0u, 0x0088dc30u, 0x5cu},
    {0x008c33f0u, 0, 0x00c82a36u, 0x0040c3a0u, 0x0088d970u, 0x5cu},
    {0x008c3450u, 0, 0x00c82a45u, 0x007dca60u, 0x0087c200u, 0x5cu},
    {0x008c34b0u, 0, 0x00c82a47u, 0x0042f160u, 0x0087bbd0u, 0x5cu},
    {0x008c3510u, 0, 0x00c82a2du, 0x0089e390u, 0x0087a940u, 0x5cu},
    {0x008c3570u, 0, 0x00c82a3fu, 0x00417840u, 0x0087a630u, 0x5cu},
    {0x008c35d0u, 0, 0x00c82a43u, 0x00417840u, 0x0087a320u, 0x5cu},
    {0x008c3630u, 0, 0x00c82a41u, 0x00417840u, 0x0087a010u, 0x5cu},
    {0x008c4e90u, 1, 0x00c82a41u, 0x008a8080u, 0x0087a010u, 0xa4u},
    {0x008c4f50u, 1, 0x00c82a41u, 0x008a8080u, 0x0087a010u, 0xa4u},
    {0x008c5010u, 1, 0x00c82a43u, 0x008a8080u, 0x0087a320u, 0xa4u},
    {0x008c50d0u, 1, 0x00c82a43u, 0x008a8080u, 0x0087a320u, 0xa4u},
    {0x008c5190u, 1, 0x00c82a3fu, 0x008a8080u, 0x0087a630u, 0xa4u},
    {0x008c5250u, 1, 0x00c82a3fu, 0x008a8080u, 0x0087a630u, 0xa4u},
    {0x008c5310u, 1, 0x00c82a2du, 0x0089e350u, 0x0087a940u, 0xa4u},
    {0x008c53d0u, 1, 0x00c82a2du, 0x0089e350u, 0x0087a940u, 0xa4u},
    {0x008c5490u, 1, 0x00c82a47u, 0x008a8050u, 0x0087bbd0u, 0xa4u},
    {0x008c5550u, 1, 0x00c82a47u, 0x008a8050u, 0x0087bbd0u, 0xa4u},
    {0x008c5610u, 1, 0x00c82a45u, 0x008a8020u, 0x0087c200u, 0xa4u},
    {0x008c56d0u, 1, 0x00c82a45u, 0x008a8020u, 0x0087c200u, 0xa4u},
    {0x008c5790u, 1, 0x00c82a36u, 0x008a0720u, 0x0088d970u, 0xa4u},
    {0x008c5850u, 1, 0x00c82a33u, 0x008a0700u, 0x0088dc30u, 0xa4u},
    {0x008c5910u, 1, 0x00c82a3cu, 0x00899790u, 0x00891490u, 0xa4u},
    {0x008c59d0u, 1, 0x00c82a30u, 0x00899770u, 0x00891750u, 0xa4u},
};

/* {va, role, calls_upvalue, disc mask, CODE_PTR ud, class key, ret, bytes}. */
constexpr IsaacLuaFourthRow kFourth[] = {
    {0x0085cad0u, 1, 0, 0x0c, 0x00000000u, 0x00000000u, -1, 0x203u},
    {0x008976a0u, 0, 1, 0x02, 0x0085eee0u, 0x00000000u, 1, 0x31u},
    {0x008976f0u, 1, 1, 0x04, 0x00000000u, 0x00000000u, 0, 0x32u},
    {0x00897730u, 1, 1, 0x04, 0x00000000u, 0x00000000u, 0, 0x37u},
    {0x00897770u, 0, 1, 0x04, 0x00000000u, 0x00000000u, 1, 0x30u},
    {0x008977a0u, 1, 1, 0x04, 0x00000000u, 0x00000000u, 0, 0x4du},
    {0x00897930u, 0, 1, 0x04, 0x00000000u, 0x00000000u, 1, 0x36u},
    {0x00898f50u, 0, 1, 0x04, 0x00000000u, 0x00000000u, 1, 0x29u},
    {0x008991a0u, 0, 1, 0x06, 0x009e9ab0u, 0x00000000u, 1, 0x29u},
    {0x008a0600u, 0, 1, 0x02, 0x0040c3a0u, 0x00c8297du, 1, 0x88u},
};

constexpr int32_t kBandCCount =
    static_cast<int32_t>(sizeof(kBandC) / sizeof(kBandC[0]));
constexpr int32_t kFourthCount =
    static_cast<int32_t>(sizeof(kFourth) / sizeof(kFourth[0]));

const IsaacLuaBandCRow* band_c_at(int32_t index) {
  if (index < 0 || index >= kBandCCount) {
    return nullptr;
  }
  return &kBandC[index];
}

const IsaacLuaFourthRow* fourth_at(int32_t index) {
  if (index < 0 || index >= kFourthCount) {
    return nullptr;
  }
  return &kFourth[index];
}

}  // namespace

static_assert(kBandCCount == ISAAC_LUA_BAND_C_COUNT,
              "band C table holds every censused getter");
static_assert(kFourthCount == ISAAC_LUA_FOURTH_COUNT,
              "fourth-region table holds every censused body");
static_assert(ISAAC_LUA_BAND_C_PRIMARY_COUNT + ISAAC_LUA_BAND_C_SECONDARY_COUNT ==
                  ISAAC_LUA_BAND_C_COUNT,
              "primary + secondary partition band C");
static_assert(ISAAC_LUA_FOURTH_GETTERS + ISAAC_LUA_FOURTH_SETTERS ==
                  ISAAC_LUA_FOURTH_COUNT,
              "getters + setters partition the fourth region");
static_assert(static_cast<int>(ISAAC_LUA_ACCESSOR_SURFACE_V24) ==
                  static_cast<int>(ISAAC_LUA_BAND_C_COUNT) +
                      static_cast<int>(ISAAC_LUA_FOURTH_COUNT),
              "v24 surface = band C + fourth region");
static_assert(ISAAC_LUA_ACCESSOR_SURFACE_V22 + ISAAC_LUA_ACCESSOR_SURFACE_V23 +
                      ISAAC_LUA_ACCESSOR_SURFACE_V24 ==
                  ISAAC_LUA_ACCESSOR_SURFACE_TOTAL,
              "the real total is 383");
static_assert(ISAAC_LUA_ACCESSOR_SURFACE_IN_FUNCTION +
                      ISAAC_LUA_ACCESSOR_SURFACE_CHAIN ==
                  ISAAC_LUA_ACCESSOR_SURFACE_TOTAL,
              "in-function census + chain route == total");

int32_t isaac_lua_engine_band_c_count(void) { return kBandCCount; }

uint32_t isaac_lua_engine_band_c_va(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  return row != nullptr ? row->va : 0u;
}

int32_t isaac_lua_engine_band_c_shape(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  return row != nullptr ? row->shape : -1;
}

uint32_t isaac_lua_engine_band_c_body_bytes(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  return row != nullptr ? row->body_bytes : 0u;
}

uint32_t isaac_lua_engine_band_c_class_key(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  return row != nullptr ? row->class_key : 0u;
}

uint32_t isaac_lua_engine_band_c_ud_value(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  return row != nullptr ? row->ud_value : 0u;
}

int32_t isaac_lua_engine_band_c_ud_discipline(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  if (row == nullptr) {
    return -1;
  }
  /* every band C ud is a .text immediate -> CODE_PTR, resolved through the
     classifier from the value (never assumed). */
  return isaac_lua_engine_inline_ud_discipline_for_value(row->ud_value);
}

uint32_t isaac_lua_engine_band_c_installer_va(int32_t index) {
  const IsaacLuaBandCRow* row = band_c_at(index);
  return row != nullptr ? row->installer_va : 0u;
}

int32_t isaac_lua_engine_band_c_calls_upvalue(int32_t index) {
  /* every band C body does `mov edx,[ud]; call edx` - calls the upvalue. */
  return band_c_at(index) != nullptr ? 1 : -1;
}

int32_t isaac_lua_engine_band_c_return_value(int32_t index) {
  return band_c_at(index) != nullptr ? 1 : -1;
}

int32_t isaac_lua_engine_band_c_role(int32_t index) {
  return band_c_at(index) != nullptr ? ISAAC_LUA_ACCESSOR_ROLE_GET : -1;
}

int32_t isaac_lua_engine_band_c_index_for_va(uint32_t va) {
  for (int32_t i = 0; i < kBandCCount; ++i) {
    if (kBandC[i].va == va) {
      return i;
    }
  }
  return -1;
}

int32_t isaac_lua_engine_fourth_count(void) { return kFourthCount; }

uint32_t isaac_lua_engine_fourth_va(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->va : 0u;
}

int32_t isaac_lua_engine_fourth_role(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->role : -1;
}

int32_t isaac_lua_engine_fourth_calls_upvalue(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->calls_upvalue : -1;
}

int32_t isaac_lua_engine_fourth_discipline_mask(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->disc_mask : -1;
}

uint32_t isaac_lua_engine_fourth_code_ud_value(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->code_ud : 0u;
}

uint32_t isaac_lua_engine_fourth_class_key(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->class_key : 0u;
}

int32_t isaac_lua_engine_fourth_return_value(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->ret_value : -2;
}

uint32_t isaac_lua_engine_fourth_body_bytes(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  return row != nullptr ? row->body_bytes : 0u;
}

int32_t isaac_lua_engine_fourth_index_for_va(uint32_t va) {
  for (int32_t i = 0; i < kFourthCount; ++i) {
    if (kFourth[i].va == va) {
      return i;
    }
  }
  return -1;
}

int32_t isaac_lua_engine_fourth_is_law_counterexample(int32_t index) {
  const IsaacLuaFourthRow* row = fourth_at(index);
  if (row == nullptr) {
    return -1;
  }
  /* counterexample to v23's both-sided law: the body CALLS its upvalue as a
     function yet is installed via CALLER_ARG (a run-time code pointer, not a
     CODE_PTR immediate). */
  const int32_t caller_arg = (row->disc_mask & ISAAC_LUA_UD_BIT_CALLER_ARG) != 0;
  return (row->calls_upvalue == 1 && caller_arg) ? 1 : 0;
}

int32_t isaac_lua_engine_accessor_site_discipline(uint32_t ud_value,
                                                  int32_t is_register,
                                                  int32_t has_newuserdata) {
  /* uint32_t / int32_t parameters, re-narrowed explicitly - never uint8_t.
     A STACKVAL site has no newuserdata (the upvalue is a captured pushstring
     value); a register write is CALLER_ARG; otherwise classify the immediate
     through the section-table classifier (FIELD_OFFSET / CODE_PTR / data). */
  const uint32_t value = ud_value & 0xffffffffu;
  if (has_newuserdata == 0) {
    return ISAAC_LUA_INLINE_UD_STACKVAL;
  }
  if (is_register != 0) {
    return ISAAC_LUA_INLINE_UD_CALLER_ARG;
  }
  const int32_t imm = isaac_lua_engine_inline_ud_discipline_for_value(value);
  if (imm >= 0) {
    return imm;
  }
  return ISAAC_LUA_INLINE_UD_DATA_PTR;
}

/* v24 signature pins - no uint8_t scalar parameter may reach an x86 byte gate
   across the Wasm boundary. The site classifier takes uint32_t + int32_t and
   is driven UNMASKED in the test. */
namespace {
using IsaacU32IdxV24 = uint32_t (*)(int32_t);
using IsaacI32IdxV24 = int32_t (*)(int32_t);
using IsaacU32GateV24 = int32_t (*)(uint32_t);
using IsaacSiteDiscFnV24 = int32_t (*)(uint32_t, int32_t, int32_t);
[[maybe_unused]] constexpr IsaacU32IdxV24 kSigBandCVa =
    &isaac_lua_engine_band_c_va;
[[maybe_unused]] constexpr IsaacU32IdxV24 kSigBandCUd =
    &isaac_lua_engine_band_c_ud_value;
[[maybe_unused]] constexpr IsaacU32IdxV24 kSigBandCKey =
    &isaac_lua_engine_band_c_class_key;
[[maybe_unused]] constexpr IsaacI32IdxV24 kSigBandCShape =
    &isaac_lua_engine_band_c_shape;
[[maybe_unused]] constexpr IsaacU32IdxV24 kSigFourthVa =
    &isaac_lua_engine_fourth_va;
[[maybe_unused]] constexpr IsaacI32IdxV24 kSigFourthMask =
    &isaac_lua_engine_fourth_discipline_mask;
[[maybe_unused]] constexpr IsaacI32IdxV24 kSigFourthCounterexample =
    &isaac_lua_engine_fourth_is_law_counterexample;
[[maybe_unused]] constexpr IsaacU32GateV24 kSigBandCForVa =
    &isaac_lua_engine_band_c_index_for_va;
[[maybe_unused]] constexpr IsaacU32GateV24 kSigFourthForVa =
    &isaac_lua_engine_fourth_index_for_va;
[[maybe_unused]] constexpr IsaacSiteDiscFnV24 kSigSiteDisc =
    &isaac_lua_engine_accessor_site_discipline;
}  // namespace

/* v25 signature pins - no uint8_t scalar parameter may reach an x86 byte
   gate across the Wasm boundary. All v25 exports take int32_t indices/slots/
   status (or nothing) and return uint32_t/int32_t; the program gate is a
   full-dword test driven UNMASKED in the test. */
namespace {
using IsaacU32NoArgV25 = uint32_t (*)(void);
using IsaacI32NoArgV25 = int32_t (*)(void);
using IsaacU32IdxV25 = uint32_t (*)(int32_t);
using IsaacI32IdxV25 = int32_t (*)(int32_t);
using IsaacI32GateV25 = int32_t (*)(int32_t);
using IsaacU32ImmV25 = uint32_t (*)(int32_t, int32_t);
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatEventCount =
    &isaac_lua_engine_materialize_program_event_count;
[[maybe_unused]] constexpr IsaacI32IdxV25 kSigMatEventKind =
    &isaac_lua_engine_materialize_program_event_kind;
[[maybe_unused]] constexpr IsaacU32IdxV25 kSigMatEventIat =
    &isaac_lua_engine_materialize_program_event_iat_slot;
[[maybe_unused]] constexpr IsaacU32IdxV25 kSigMatEventArgs =
    &isaac_lua_engine_materialize_program_event_args;
[[maybe_unused]] constexpr IsaacU32IdxV25 kSigMatEventIms =
    &isaac_lua_engine_materialize_program_event_ims;
[[maybe_unused]] constexpr IsaacU32ImmV25 kSigMatEventImm =
    &isaac_lua_engine_materialize_program_event_imm;
[[maybe_unused]] constexpr IsaacI32GateV25 kSigMatGate =
    &isaac_lua_engine_materialize_program_gate;
[[maybe_unused]] constexpr IsaacI32NoArgV25 kSigMatNoReturn =
    &isaac_lua_engine_materialize_error_path_no_return;
[[maybe_unused]] constexpr IsaacI32NoArgV25 kSigMatStoreOrder =
    &isaac_lua_engine_materialize_out_state_store_before_ref;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatErrBuilder =
    &isaac_lua_engine_materialize_error_builder_va;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatErrRaiser =
    &isaac_lua_engine_materialize_error_raiser_va;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatErrBufSize =
    &isaac_lua_engine_materialize_error_buf_size;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatAlign =
    &isaac_lua_engine_materialize_entry_align_mask;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatRetDwords =
    &isaac_lua_engine_materialize_ret_dwords;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatSuccessEnd =
    &isaac_lua_engine_materialize_success_ret_end;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatErrorStart =
    &isaac_lua_engine_materialize_error_path_start;
[[maybe_unused]] constexpr IsaacU32NoArgV25 kSigMatFnEnd =
    &isaac_lua_engine_materialize_fn_end;
}  // namespace

/* ---------------------------------------------------------------------------
 * ABI v27 -- first band-C primary getter BODY 0x008c32d0 pure islands.
 * Evidence: PE bytes at raw 0x4c26d0 (section table), 0x5c bytes:
 *   55 8b ec 56 8b 75 08 57 6a 01 56 ff 15 00 84 b1 00
 *   83 c4 08 85 c0 75 04 33 ff eb 19 6a 01 68 30 2a c8 00
 *   ba 01 00 00 00 8b ce e8 91 92 f9 ff 83 c4 08 8b 78 04
 *   68 d7 b9 f0 ff 56 ff 15 b0 83 b1 00 83 c4 08 8b cf 8b 10
 *   ff d2 8b d0 8b ce e8 cd 8c f9 ff 5f b8 01 00 00 00 5e 5d c3
 * identify-zhl-address.mjs: no exact match. Rel32 0x8c330c+5+(-0x66d6f)
 * = 0x85c590; 0x8c3328+5+(-0x67333) = 0x85bff0. IAT slots named by the
 * import directory (lua_type 0xb18400, lua_touserdata 0xb183b0).
 * Host: both IAT, 0x85c590, the upvalue fn, 0x85bff0. No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_band_c_primary_va(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_BODY_VA;
}

uint32_t isaac_lua_engine_band_c_primary_type_index(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_TYPE_INDEX;
}

int32_t isaac_lua_engine_band_c_primary_type_gate_taken(uint32_t lua_type_result) {
  /* PE 0x8c32e4: 85 c0 test eax,eax / 75 04 jne - FULL-WORD. */
  return lua_type_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_band_c_primary_this(uint32_t lua_type_result,
                                              uint32_t checked_this) {
  /* type==0: xor edi,edi (this=0). else edi=[eax+4] from the check. */
  return lua_type_result != 0u ? checked_this : 0u;
}

int32_t isaac_lua_engine_band_c_primary_nil_still_calls(void) {
  /* After the type gate both paths fall into touserdata + call edx. */
  return ISAAC_LUA_BAND_C_PRIMARY_NIL_STILL_CALLS;
}

uint32_t isaac_lua_engine_band_c_primary_check_flag(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_CHECK_FLAG;
}

uint32_t isaac_lua_engine_band_c_primary_check_stack_index(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_CHECK_STACK_INDEX;
}

uint32_t isaac_lua_engine_band_c_primary_class_key(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_CLASS_KEY;
}

uint32_t isaac_lua_engine_band_c_primary_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_band_c_primary_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_band_c_primary_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_band_c_primary_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_band_c_primary_push_va(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PUSH_I32_VA;
}

uint32_t isaac_lua_engine_band_c_primary_return_value(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_RETURN;
}

uint32_t isaac_lua_engine_band_c_next_va(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v28 -- band-C primary template (10 x 0x5c, stride 0x60).
 * Byte-diff vs 0x008c32d0: 87/92 identical on every sibling. Union diffs
 * only at +0x1f (push class-key imm32) and the two E8 rel32s
 * (+0x2b -> 0x0085c590, +0x4f -> 0x0085bff0). identify-zhl: no exact
 * match on any of the 10. Shared CF reuses the v27 law by reference.
 * Host: both IAT, 0x85c590, the upvalue fn, 0x85bff0. No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_band_c_primary_stride(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_STRIDE;
}

uint32_t isaac_lua_engine_band_c_primary_identical_bytes(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_IDENTICAL_BYTES;
}

uint32_t isaac_lua_engine_band_c_primary_va_at(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_BAND_C_PRIMARY_COUNT) {
    return 0u;
  }
  return (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_BODY_VA +
         (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_STRIDE * (uint32_t)index;
}

uint32_t isaac_lua_engine_band_c_primary_class_key_at(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_BAND_C_PRIMARY_COUNT) {
    return 0u;
  }
  return isaac_lua_engine_band_c_class_key(index);
}

int32_t isaac_lua_engine_band_c_primary_index_for_va(uint32_t va) {
  const uint32_t base = (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_BODY_VA;
  const uint32_t stride = (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_STRIDE;
  if (va < base) {
    return -1;
  }
  const uint32_t delta = va - base;
  if ((delta % stride) != 0u) {
    return -1;
  }
  const uint32_t index = delta / stride;
  if (index >= (uint32_t)ISAAC_LUA_BAND_C_PRIMARY_COUNT) {
    return -1;
  }
  return (int32_t)index;
}

static_assert(ISAAC_LUA_BAND_C_PRIMARY_BODY_VA +
                      ISAAC_LUA_BAND_C_PRIMARY_STRIDE *
                          (ISAAC_LUA_BAND_C_PRIMARY_COUNT - 1u) ==
                  0x008c3630u,
              "primary VA law covers all 10 sites");
static_assert(ISAAC_LUA_BAND_C_NEXT_PRIMARY_VA == 0x008c4e90u,
              "first secondary is the v29 template base");
static_assert(ISAAC_LUA_BAND_C_SECONDARY_BODY_VA +
                      ISAAC_LUA_BAND_C_SECONDARY_STRIDE *
                          (ISAAC_LUA_BAND_C_SECONDARY_COUNT - 1u) ==
                  0x008c59d0u,
              "secondary VA law covers all 16 sites");
static_assert(ISAAC_LUA_BAND_C_NEXT_VA == 0x008c5a90u,
              "first insn after last secondary is the classified dtor");
static_assert((uint32_t)ISAAC_LUA_INLINE_NEXT_VA ==
                  (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_NEXT_VA,
              "inline NEXT_VA tracks the next body after the peeled one");
static_assert(ISAAC_LUA_LEFTOVER_EXTRA_BODY_VA == 0x008a0600u,
              "leftover extra body is the v23/v24 straddler");
static_assert(ISAAC_LUA_LEFTOVER_EXTRA_NEXT_VA == 0x008c5b90u,
              "v30 sequential handoff after the two dtors");
static_assert(ISAAC_LUA_FOURTH_GETTER_BODY_VA == 0x008976a0u,
              "v31 peels the first fourth-region getter");
static_assert(ISAAC_LUA_FOURTH_GETTER_NEXT_VA == 0x008976f0u,
              "v31 next is the v32 setter");
static_assert(ISAAC_LUA_FOURTH_SETTER_BODY_VA == 0x008976f0u,
              "v32 peels the first fourth-region setter");
static_assert(ISAAC_LUA_FOURTH_SETTER_NEXT_VA == 0x00897730u,
              "v32 next is the v33 boolean setter");
static_assert(ISAAC_LUA_FOURTH_BOOL_SETTER_BODY_VA == 0x00897730u,
              "v33 peels the fourth-region boolean setter");
static_assert(ISAAC_LUA_FOURTH_BOOL_SETTER_NEXT_VA == 0x00897770u,
              "v33 next is the v34 boolean getter");
static_assert(ISAAC_LUA_FOURTH_BOOL_GETTER_BODY_VA == 0x00897770u,
              "v34 peels the fourth-region boolean getter");
static_assert(ISAAC_LUA_FOURTH_BOOL_GETTER_NEXT_VA == 0x008977a0u,
              "v34 next is the v35 number setter");
static_assert(ISAAC_LUA_FOURTH_NUMBER_SETTER_BODY_VA == 0x008977a0u,
              "v35 peels the fourth-region number setter");
static_assert(ISAAC_LUA_FOURTH_NUMBER_SETTER_NEXT_VA == 0x008977f0u,
              "v35 next is the skipped 0x008977f0 ctor");
static_assert(ISAAC_LUA_FOURTH_NUMBER_GETTER_BODY_VA == 0x00897930u,
              "v36 peels the fourth-region number getter");
static_assert(ISAAC_LUA_FOURTH_NUMBER_GETTER_NEXT_VA == 0x00897970u,
              "v36 next is the skipped 0x00897970 ctor");
static_assert(ISAAC_LUA_FOURTH_INT_BOOL_SETTER_BODY_VA == 0x00897f00u,
              "v37 peels the sequential indexed bool setter");
static_assert(ISAAC_LUA_FOURTH_INT_BOOL_SETTER_NEXT_VA == 0x00897f50u,
              "do not open 0x00897f50");
static_assert(ISAAC_LUA_FOURTH_INT_BOOL_SETTER_SKIPPED_CTOR_VA == 0x00897970u,
              "do not reopen the skipped 0x00897970 ctor");
static_assert(ISAAC_LUA_FOURTH_INT_GETTER_BODY_VA == 0x008984e0u,
              "v38 peels the sequential indexed integer getter");
static_assert(ISAAC_LUA_FOURTH_INT_GETTER_NEXT_VA == 0x00898530u,
              "do not open 0x00898530");
static_assert(ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_SEH_VA == 0x00897f50u,
              "do not reopen the skipped 0x00897f50 SEH body");
static_assert(ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA == 0x00898140u,
              "do not reopen the skipped 0x00898140 wrap/ctor");
static_assert(ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA != 0x00897970u,
              "v38 skipped ctor is not the v37 skipped ctor");
static_assert(ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA != 0x008977f0u,
              "do not reopen 0x008977f0");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_BODY_VA == 0x00898f50u,
              "v39 peels the fourth-region i32 getter");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_NEXT_VA == 0x00898f80u,
              "do not open 0x00898f80");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_HOST_VA == 0x00898530u,
              "do not translate the skipped 0x00898530 host body");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA == 0x00898600u,
              "do not reopen the skipped 0x00898600 wrap/ctor");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_SEH_VA == 0x008986d0u,
              "do not reopen the skipped 0x008986d0 SEH body");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_HOST_VA_PUSH ==
                  (uint32_t)ISAAC_LUA_BAND_C_PUSH_I32_VA,
              "v39 host push is the band-C i32 pusher by reference");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_HOST_VA_PUSH !=
                  (uint32_t)ISAAC_LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH,
              "v39 host push is not the v36 f32 pusher");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_HOST_VA ==
                  (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_NEXT_VA,
              "v38 next stays the skipped host");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_BODY_BYTES == 0x29u,
              "census row 7 body bytes");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_CENSUS_INDEX == 7u,
              "already a fourth-region census row; not an 11th");
static_assert(ISAAC_LUA_FOURTH_COUNT == 10,
              "fourth census table unchanged");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA != 0x00897970u,
              "v39 skipped ctor is not the v37 skipped ctor");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA != 0x008977f0u,
              "do not reopen 0x008977f0");
static_assert(ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA != 0x00898140u,
              "do not reopen 0x00898140");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_VA == 0x008991a0u,
              "v40 peels the fourth-region i32 sign-extend getter");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_NEXT_VA == 0x008991d0u,
              "do not open 0x008991d0");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA == 0x00898f80u,
              "do not translate the skipped 0x00898f80 host body");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA == 0x00899030u,
              "do not reopen the skipped 0x00899030 wrap/ctor");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_CHECK_VA == 0x008990d0u,
              "do not reopen the skipped 0x008990d0 host setter");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_TYPE_VA == 0x00899140u,
              "do not reopen the skipped 0x00899140 host body");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HOST_VA_PUSH ==
                  (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA,
              "v40 host push is the closure i32-sext pusher by reference");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HOST_VA_PUSH !=
                  (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_HOST_VA_PUSH,
              "v40 host push is not the v39 band-C zero-extend pusher");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA ==
                  (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_NEXT_VA,
              "v39 next stays the skipped host");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_BYTES == 0x29u,
              "census row 8 body bytes");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_CENSUS_INDEX == 8u,
              "already a fourth-region census row; not an 11th");
static_assert(ISAAC_LUA_FOURTH_COUNT == 10,
              "fourth census table unchanged");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA != 0x00897970u,
              "v40 skipped wrap is not the v37 skipped ctor");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA != 0x008977f0u,
              "do not reopen 0x008977f0");
static_assert(ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA != 0x00898530u,
              "do not reopen 0x00898530");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_VA !=
                  (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_BODY_VA,
              "v40 body is not the v39 i32 getter");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA == 0x008991d0u,
              "v41 peels the sequential no-arg setter-shaped island");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_NEXT_VA == 0x008991f0u,
              "do not open 0x008991f0");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA ==
                  (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_NEXT_VA,
              "v40 next stays the peeled v41 body");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_BYTES == 0x1cu,
              "no-arg setter body bytes through ret");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_STACK_CLEAN == 0x08u,
              "touserdata add esp,8");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_SKIP_COUNT == 0u,
              "no wrap/ctor/SEH/class-check before the peel");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_CODE_UD_VA == 0x009e94e0u,
              "installer CODE_PTR upvalue");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_INSTALLER_VA == 0x00893270u,
              "single pushcclosure install site");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_CODE_UD_VA !=
                  0x009e9ab0u,
              "v41 CODE_PTR is not the v40 getter ud 0x9e9ab0");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_PUSH == 0,
              "no result push");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_CHECKINTEGER == 0,
              "no checkinteger");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_RETURN == 0,
              "xor eax,eax; ret 0");
static_assert(ISAAC_LUA_FOURTH_NOARG_SETTER_SIBLING_COUNT == 1,
              "exact 0x1c-byte body image-wide 1 hit");
static_assert(ISAAC_LUA_FOURTH_COUNT == 10,
              "fourth census table unchanged");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA !=
                  (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_VA,
              "v41 body is not the v40 i32-sext getter");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA !=
                  (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_BODY_VA,
              "do not reopen 0x00898f50");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA != 0x00898530u,
              "do not reopen 0x00898530");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA != 0x00897970u,
              "do not reopen 0x00897970");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA != 0x008977f0u,
              "do not reopen 0x008977f0");
static_assert((uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA != 0x00898140u,
              "do not reopen 0x00898140");

/* ---------------------------------------------------------------------------
 * ABI v29 -- band-C secondary template (16 x 0xa4, stride 0xc0).
 * Byte-diff vs 0x008c4e90: 158/164 identical on every sibling. Union
 * diffs only at +0x25 (check-flag imm8), +0x27 (class-key imm32),
 * +0x33 (E8 rel32 -> 0x0085c590), +0x74 (wrap-key imm32).
 * identify-zhl: no exact match on any of the 16. Shared CF reuses the
 * v27 law by reference plus the indexed wrap / FULL-WORD null gate.
 * Host: IAT surface, 0x85c590, the upvalue fn. No uint8_t.
 * ------------------------------------------------------------------------- */
namespace {
constexpr uint32_t kBandCSecondaryWrapKeys[ISAAC_LUA_BAND_C_SECONDARY_COUNT] = {
    0x00c82a4au, 0x00c82a49u, 0x00c82a4cu, 0x00c82a4bu,
    0x00c82a4eu, 0x00c82a4du, 0x00c829aau, 0x00c829a9u,
    0x00c82980u, 0x00c8297fu, 0x00c829b6u, 0x00c829b5u,
    0x00c829fau, 0x00c829fdu, 0x00c82a03u, 0x00c82a4fu,
};
constexpr uint32_t kBandCSecondaryCheckFlags[ISAAC_LUA_BAND_C_SECONDARY_COUNT] = {
    0u, 1u, 0u, 1u, 0u, 1u, 0u, 1u, 0u, 1u, 0u, 1u, 1u, 1u, 1u, 1u,
};
}  // namespace

uint32_t isaac_lua_engine_band_c_secondary_stride(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_STRIDE;
}

uint32_t isaac_lua_engine_band_c_secondary_identical_bytes(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_IDENTICAL_BYTES;
}

uint32_t isaac_lua_engine_band_c_secondary_va_at(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_BAND_C_SECONDARY_COUNT) {
    return 0u;
  }
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_BODY_VA +
         (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_STRIDE * (uint32_t)index;
}

uint32_t isaac_lua_engine_band_c_secondary_class_key_at(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_BAND_C_SECONDARY_COUNT) {
    return 0u;
  }
  return isaac_lua_engine_band_c_class_key(
      (int32_t)ISAAC_LUA_BAND_C_PRIMARY_COUNT + index);
}

uint32_t isaac_lua_engine_band_c_secondary_check_flag_at(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_BAND_C_SECONDARY_COUNT) {
    return 0u;
  }
  return kBandCSecondaryCheckFlags[index];
}

uint32_t isaac_lua_engine_band_c_secondary_wrap_key_at(int32_t index) {
  if (index < 0 || index >= (int32_t)ISAAC_LUA_BAND_C_SECONDARY_COUNT) {
    return 0u;
  }
  return kBandCSecondaryWrapKeys[index];
}

int32_t isaac_lua_engine_band_c_secondary_index_for_va(uint32_t va) {
  const uint32_t base = (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_BODY_VA;
  const uint32_t stride = (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_STRIDE;
  if (va < base) {
    return -1;
  }
  const uint32_t delta = va - base;
  if ((delta % stride) != 0u) {
    return -1;
  }
  const uint32_t index = delta / stride;
  if (index >= (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_COUNT) {
    return -1;
  }
  return (int32_t)index;
}

int32_t isaac_lua_engine_band_c_secondary_result_null_gate(uint32_t result) {
  /* PE 0x8c4ef6: 85 f6 test esi,esi / 74 3a je - FULL-WORD. */
  return result == 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_band_c_secondary_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_CHECKINTEGER_INDEX;
}

uint32_t isaac_lua_engine_band_c_secondary_wrap_ud_size(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_WRAP_UD_SIZE;
}

uint32_t isaac_lua_engine_band_c_secondary_wrap_tag_va(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_WRAP_TAG_VA;
}

uint32_t isaac_lua_engine_band_c_secondary_return_value(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_RETURN;
}

/* ---------------------------------------------------------------------------
 * ABI v30 -- leftover extra getter BODY 0x008a0600 pure islands.
 * Evidence: PE bytes at raw 0x49fa00 (section table), 0x88 bytes to first
 * ret (null-path ret @ 0x008a069a):
 *   55 8b ec 56 8b 75 08 57 6a 01 56 ff 15 00 84 b1 00
 *   83 c4 08 85 c0 75 04 33 ff eb 19 6a 01 68 7d 29 c8 00
 *   ba 01 00 00 00 8b ce e8 61 bf fb ff 83 c4 08 8b 78 04
 *   68 d7 b9 f0 ff 56 ff 15 b0 83 b1 00 83 c4 08 8b cf 8b 00
 *   ff d0 8b f8 85 ff 74 38 6a 08 56 ff 15 9c 83 b1 00
 *   68 7a 29 c8 00 68 d8 b9 f0 ff 56 c7 00 c8 53 b7 00
 *   89 78 04 ff 15 bc 83 b1 00 6a fe 56 ff 15 98 83 b1 00
 *   83 c4 1c b8 01 00 00 00 5f 5e 5d c3
 * identify-zhl-address.mjs: no exact match. Rel32 0x8a062a+5+(-0x4409f)
 * = 0x85c590. IAT slots named by the import directory (lua_type
 * 0xb18400, touserdata 0xb183b0, newuserdata 0xb1839c, rawgetp
 * 0xb183bc, setmetatable 0xb18398, pushnil 0xb183e0).
 * Shared CF reuses the v27 law (type gate / this / nil-still-calls)
 * and the v29 wrap (FULL-WORD null gate / userdata(8)+tag / rawgetp /
 * setmetatable / pushnil still ret 1) BY REFERENCE. Distinct: no
 * luaL_checkinteger; wrap key 0xc8297a; class key 0xc8297d.
 * Host: IAT surface, 0x85c590, the upvalue fn. No uint8_t.
 * v31 census: 0x008c5b90 is 10 release/unref
 * wrappers (0x1e / stride 0x20, all E8 0x85c3e0 then vtbl[0](0);
 * xor eax,eax; ret). identify-zhl empty. Next getter-shaped
 * 0x008976a0 is peeled in ABI v31.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_leftover_extra_va(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_BODY_VA;
}

uint32_t isaac_lua_engine_leftover_extra_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_BODY_BYTES;
}

uint32_t isaac_lua_engine_leftover_extra_class_key(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_CLASS_KEY;
}

uint32_t isaac_lua_engine_leftover_extra_check_flag(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_CHECK_FLAG;
}

uint32_t isaac_lua_engine_leftover_extra_wrap_key(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_WRAP_KEY;
}

uint32_t isaac_lua_engine_leftover_extra_code_ud_va(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_CODE_UD_VA;
}

int32_t isaac_lua_engine_leftover_extra_has_checkinteger(void) {
  return ISAAC_LUA_LEFTOVER_EXTRA_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_leftover_extra_result_null_gate(uint32_t result) {
  /* PE 0x8a064c: 85 ff test edi,edi / 74 38 je - FULL-WORD.
     Reuses the v29 law by reference (same encoding). */
  return isaac_lua_engine_band_c_secondary_result_null_gate(result);
}

uint32_t isaac_lua_engine_leftover_extra_return_value(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_RETURN;
}

uint32_t isaac_lua_engine_leftover_extra_next_va(void) {
  return (uint32_t)ISAAC_LUA_LEFTOVER_EXTRA_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v31 -- fourth-region string getter BODY 0x008976a0 pure islands.
 * Evidence: PE bytes at raw 0x496aa0 (section table), 0x31 bytes to
 * first ret (non-null @ 0x008976d0); whole body 0x43 to last ret
 * (null-path @ 0x008976e2):
 *   55 8b ec 56 8b 75 08 68 d7 b9 f0 ff 56 ff 15 b0 83 b1 00
 *   83 c4 08 8b 00 ff d0 85 c0 74 13 50 56 ff 15 14 84 b1 00
 *   83 c4 08 b8 01 00 00 00 5e 5d c3
 *   56 ff 15 e0 83 b1 00 83 c4 04 b8 01 00 00 00 5e 5d c3
 * identify-zhl-address.mjs: no exact match. Image-wide exact 0x31
 * body: 1 hit. Nearby fourth bodies are different shapes.
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * pushstring 0xb18414, pushnil 0xb183e0).
 * Shared CF reuses the v29 FULL-WORD null gate BY REFERENCE.
 * Distinct: no lua_type / this-select (v27 law is a different
 * shape); no userdata(8)/tag/rawgetp/setmetatable (v29 wrap).
 * Host: IAT surface + the upvalue fn. No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_getter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_getter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_getter_full_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_FULL_BYTES;
}

uint32_t isaac_lua_engine_fourth_getter_code_ud_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_CODE_UD_VA;
}

uint32_t isaac_lua_engine_fourth_getter_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_fourth_getter_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_fourth_getter_iat_lua_pushstring(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_IAT_LUA_PUSHSTRING;
}

uint32_t isaac_lua_engine_fourth_getter_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_IAT_LUA_PUSHNIL;
}

int32_t isaac_lua_engine_fourth_getter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_GETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_getter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_GETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_getter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_GETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_getter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_GETTER_SIBLING_COUNT;
}

int32_t isaac_lua_engine_fourth_getter_result_null_gate(uint32_t result) {
  /* PE 0x8976ba: 85 c0 test eax,eax / 74 13 je - FULL-WORD.
     Reuses the v29 law by reference (same encoding). */
  return isaac_lua_engine_band_c_secondary_result_null_gate(result);
}

uint32_t isaac_lua_engine_fourth_getter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_getter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_GETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v32 -- fourth-region integer setter BODY 0x008976f0 pure islands.
 * Evidence: PE bytes at raw 0x496af0 (section table), 0x32 bytes to ret
 * (first_ret 0x00897721):
 *   55 8b ec 83 e4 f8 51 57 68 d7 b9 f0 ff ff 75 08
 *   ff 15 b0 83 b1 00 6a 01 ff 75 08 8b f8
 *   ff 15 f4 83 b1 00 50 8b 07 ff d0 83 c4 14
 *   33 c0 5f 8b e5 5d c3
 * identify-zhl-address.mjs: no exact match. Image-wide exact 0x32
 * body: 1 hit. Nearby fourth bodies are different shapes
 * (0x00897730 toboolean, 0x00897770 pushboolean, 0x008977a0
 * checknumber).
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * checkinteger 0xb183f4).
 * Shared CF reuses v31 touserdata index/IAT and v29 checkinteger
 * IAT BY REFERENCE. Distinct: checkinteger index is 1 (v29 uses 2);
 * no FULL-WORD null gate / pushstring / pushnil (v31 getter is a
 * different shape); ret 0. Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_setter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_SETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_setter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_SETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_setter_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_SETTER_CHECKINTEGER_INDEX;
}

uint32_t isaac_lua_engine_fourth_setter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_SETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_setter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_setter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_setter_iat_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_setter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_SETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_setter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_SETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_setter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_SETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_setter_has_push(void) {
  return ISAAC_LUA_FOURTH_SETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_setter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_SETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_setter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_SETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_setter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_SETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v33 -- fourth-region boolean setter BODY 0x00897730 pure islands.
 * Evidence: PE bytes at raw 0x496b30 (section table), 0x37 bytes to ret
 * (first_ret 0x00897766):
 *   55 8b ec 51 57 68 d7 b9 f0 ff ff 75 08
 *   ff 15 b0 83 b1 00 6a 01 ff 75 08 8b f8
 *   ff 15 e8 83 b1 00 85 c0 8b 07 0f 95 45 fc
 *   ff 75 fc ff d0 83 c4 14
 *   33 c0 5f 8b e5 5d c3
 * identify-zhl-address.mjs: no exact match. Image-wide exact 0x37
 * body: 1 hit. touserdata+toboolean+setne mid: 1 hit.
 * setne+call+ret0 tail: 1 hit. Nearby fourth bodies are
 * different shapes (0x00897770 pushboolean, 0x008977a0
 * checknumber).
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * toboolean 0xb183e8).
 * Shared CF reuses v31 touserdata index/IAT, v22 toboolean IAT,
 * and v22 FULL-WORD boolean-normalize BY REFERENCE. Distinct:
 * toboolean not checkinteger (v32 setter is a different shape);
 * no FULL-WORD null gate / pushstring / pushnil (v31 getter is a
 * different shape); ret 0. Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_bool_setter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_SETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_bool_setter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_SETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_bool_setter_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_SETTER_TOBOOLEAN_INDEX;
}

uint32_t isaac_lua_engine_fourth_bool_setter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_SETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_bool_setter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_bool_setter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_bool_setter_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_TOBOOLEAN;
}

int32_t isaac_lua_engine_fourth_bool_setter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_bool_setter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_bool_setter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_bool_setter_has_push(void) {
  return ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_bool_setter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_BOOL_SETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_bool_setter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_BOOL_SETTER_SIBLING_COUNT;
}

int32_t isaac_lua_engine_fourth_bool_setter_boolean_normalize(uint32_t value) {
  /* PE 0x897750: 85 c0 test eax,eax / 0f 95 45 fc setne.
     Reuses the v22 law by reference (same encoding). */
  return isaac_lua_engine_closure_boolean_normalize(value);
}

uint32_t isaac_lua_engine_fourth_bool_setter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_SETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_bool_setter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_SETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v34 -- fourth-region boolean getter BODY 0x00897770 pure islands.
 * Evidence: PE bytes at raw 0x496b70 (section table), 0x30 bytes to
 * first ret (first_ret 0x0089779f). Do not open 0x008977a0.
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * pushboolean 0xb183ec).
 * Shared CF reuses v31 touserdata index/IAT and v22 pushboolean IAT
 * BY REFERENCE. Distinct: BYTE test al,al / setne (v33 setter is
 * FULL-WORD test eax,eax); ret 1 / stack 0x10 (v33 is ret 0 /
 * 0x14); no FULL-WORD null gate / pushstring / pushnil (v31
 * getter is a different shape). Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_bool_getter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_GETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_bool_getter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_GETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_bool_getter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_GETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_bool_getter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_bool_getter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_bool_getter_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHBOOLEAN;
}

int32_t isaac_lua_engine_fourth_bool_getter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_bool_getter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_bool_getter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_bool_getter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_BOOL_GETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_bool_getter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_BOOL_GETTER_SIBLING_COUNT;
}

int32_t isaac_lua_engine_fourth_bool_getter_boolean_normalize(uint32_t value) {
  /* PE 0x897787: 84 c0 test al,al / 0f 95 c1 setne cl.
     Low byte only. Drive UNMASKED: 0x100 -> AL=0 -> push 0. */
  return ((value & 0xffu) != 0u) ? 1 : 0;
}

uint32_t isaac_lua_engine_fourth_bool_getter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_GETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_bool_getter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_BOOL_GETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v35 -- fourth-region number setter BODY 0x008977a0 pure islands.
 * Evidence: PE bytes at raw 0x496ba0 (section table), 0x4d bytes to
 * ret (first_ret 0x008977ec). Do not open past int3 0x008977ed.
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * checknumber 0xb18324).
 * Shared CF reuses v31 touserdata index/IAT and v22 checknumber IAT
 * BY REFERENCE. Distinct: checknumber not checkinteger (v32 is
 * IAT 0xb183f4); ret 0 / stack 0xc then 4 (v34 is ret 1 / 0x10);
 * no toboolean / pushboolean (v33/v34 are different shapes).
 * Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_number_setter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_number_setter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_number_setter_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_CHECKNUMBER_INDEX;
}

uint32_t isaac_lua_engine_fourth_number_setter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_number_setter_stack_clean_host(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_STACK_CLEAN_HOST;
}

uint32_t isaac_lua_engine_fourth_number_setter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_number_setter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_number_setter_iat_checknumber(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUAL_CHECKNUMBER;
}

int32_t isaac_lua_engine_fourth_number_setter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_number_setter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_number_setter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_number_setter_has_push(void) {
  return ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_number_setter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_NUMBER_SETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_number_setter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_NUMBER_SETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_number_setter_f32_bits(uint32_t bits) {
  /* PE 0x8977ce..0x8977d2: mov ecx,[esp+0xc]; mov [esp+0xc],ecx.
     Bit-stable f32 store-reload. Drive UNMASKED. */
  return bits;
}

uint32_t isaac_lua_engine_fourth_number_setter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_number_setter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_SETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v36 -- fourth-region number getter BODY 0x00897930 pure islands.
 * Evidence: PE bytes at raw 0x496d30 (section table), 0x36 bytes to
 * first_ret 0x00897965. Skip 0x008977f0 ctor. Do not open 0x00897970.
 * IAT slot named by the import directory (touserdata 0xb183b0).
 * Shared CF reuses v31 touserdata index/IAT BY REFERENCE.
 * 0x85c050 stays host (typed VA export).
 * Distinct: ret 1 / host push-f32 (v35 is ret 0 / checknumber);
 * no FULL-WORD null gate (v31 is pushstring/pushnil);
 * no pushboolean (v34 is a different IAT).
 * Host: IAT surface + the upvalue fn + 0x85c050.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_number_getter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_GETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_number_getter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_GETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_number_getter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_number_getter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_number_getter_host_va_push(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_GETTER_HOST_VA_PUSH;
}

int32_t isaac_lua_engine_fourth_number_getter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_number_getter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_number_getter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_number_getter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_NUMBER_GETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_number_getter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_NUMBER_GETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_number_getter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_GETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_number_getter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NUMBER_GETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v37 -- sequential indexed bool setter BODY 0x00897f00 pure islands.
 * Evidence: PE bytes at raw 0x497300 (section table), 0x49 bytes to
 * first_ret 0x00897f48. Skip 0x00897970 Vector wrap/ctor. Skip SEH
 * 0x00897a10..0x00897d50. Do not reopen 0x008977f0.
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * toboolean 0xb183e8, checkinteger 0xb183f4).
 * Shared CF reuses v31 touserdata index/IAT, v22 toboolean IAT +
 * FULL-WORD boolean-normalize, and v32 checkinteger IAT BY REFERENCE.
 * Distinct: toboolean index 2 (v33 is 1); checkinteger present
 * (v33 has none); stack 0x20 (v32/v33 are 0x14); ret 0.
 * Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_int_bool_setter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_TOBOOLEAN_INDEX;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_CHECKINTEGER_INDEX;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_stack_align_mask(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_STACK_ALIGN_MASK;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_skipped_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_SKIPPED_CTOR_VA;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_TOBOOLEAN;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_iat_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_has_push(void) {
  return ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_INT_BOOL_SETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_INT_BOOL_SETTER_SIBLING_COUNT;
}

int32_t isaac_lua_engine_fourth_int_bool_setter_boolean_normalize(uint32_t value) {
  /* PE 0x897f25..0x897f2e: 85 c0 test eax,eax / 0f 95 setne byte.
     Reuses the v22 law by reference (FULL-WORD). Drive UNMASKED. */
  return isaac_lua_engine_closure_boolean_normalize(value);
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_int_bool_setter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_BOOL_SETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v38 -- sequential indexed integer getter BODY 0x008984e0 pure islands.
 * Evidence: PE bytes at raw 0x4978e0 (section table), 0x41 bytes to
 * first_ret 0x00898521. Skip SEH 0x00897f50. Skip wrap/ctor 0x00898140.
 * Skip SEH 0x008981b0..0x008983e0. Skip unref 0x00898490. Do not
 * reopen 0x008977f0 / 0x00897970.
 * IAT slots named by the import directory (touserdata 0xb183b0,
 * checkinteger 0xb183f4, pushinteger 0xb183f8).
 * Shared CF reuses v31 touserdata index/IAT, v32 checkinteger IAT,
 * v14 cdq lua_Integer hi, and v22 pushinteger IAT BY REFERENCE.
 * Distinct: ret 1 / has_push (v32 is ret 0 / no push); no toboolean
 * (v37 has toboolean index 2); stack 0x14 then 0xc.
 * Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_int_getter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_int_getter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_int_getter_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_CHECKINTEGER_INDEX;
}

uint32_t isaac_lua_engine_fourth_int_getter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_int_getter_stack_clean_push(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_STACK_CLEAN_PUSH;
}

uint32_t isaac_lua_engine_fourth_int_getter_stack_align_mask(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_STACK_ALIGN_MASK;
}

uint32_t isaac_lua_engine_fourth_int_getter_skipped_seh_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_SEH_VA;
}

uint32_t isaac_lua_engine_fourth_int_getter_skipped_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_SKIPPED_CTOR_VA;
}

uint32_t isaac_lua_engine_fourth_int_getter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_int_getter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

uint32_t isaac_lua_engine_fourth_int_getter_iat_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_BAND_C_SECONDARY_IAT_CHECKINTEGER;
}

uint32_t isaac_lua_engine_fourth_int_getter_iat_pushinteger(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_IAT_LUA_PUSHINTEGER;
}

int32_t isaac_lua_engine_fourth_int_getter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_INT_GETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_int_getter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_INT_GETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_int_getter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_INT_GETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_int_getter_has_push(void) {
  return ISAAC_LUA_FOURTH_INT_GETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_int_getter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_INT_GETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_int_getter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_INT_GETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_int_getter_lua_integer_hi(uint32_t value) {
  /* PE 0x89850a: 99 cdq. Reuses the v14 materialize law by reference.
     Drive UNMASKED: 0x80000000 -> 0xffffffff, not 0. */
  return isaac_lua_engine_materialize_lua_integer_hi(value);
}

uint32_t isaac_lua_engine_fourth_int_getter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_int_getter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_INT_GETTER_NEXT_VA;
}


/* ---------------------------------------------------------------------------
 * ABI v39 -- fourth-region i32 getter BODY 0x00898f50 pure islands.
 * Evidence: PE bytes at raw 0x498350 (section table), 0x29 bytes
 * through ret 0x00898f78. Skip host 0x00898530. Skip wrap/ctor
 * 0x00898600. Skip SEH 0x008986d0 / 0x00898890. Skip wrap
 * 0x00898ae0 / 0x00898c00. Skip SEH 0x00898cf0. Skip wrap
 * 0x00898d90 / 0x00898e00 / 0x00898e70 / 0x00898ee0. Do not
 * reopen 0x008977f0 / 0x00897970 / 0x00898140.
 * IAT slot named by the import directory (touserdata 0xb183b0).
 * Shared CF reuses v31 touserdata index/IAT and band-C push-i32
 * 0x0085bff0 BY REFERENCE. 0x85bff0 stays host.
 * Distinct: host 0x85bff0 (v36 is 0x85c050); no checkinteger /
 * cdq / pushinteger IAT (v38); ret 1 / has_push (v32 is ret 0);
 * no toboolean (v37); no BYTE setne / pushboolean (v34).
 * Host: IAT surface + the upvalue fn + 0x85bff0.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_i32_getter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_i32_getter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_i32_getter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_i32_getter_host_va_push(void) {
  /* Band-C push-i32 BY REFERENCE. Drive as uint32_t. */
  return (uint32_t)ISAAC_LUA_BAND_C_PUSH_I32_VA;
}

uint32_t isaac_lua_engine_fourth_i32_getter_skipped_host_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_HOST_VA;
}

uint32_t isaac_lua_engine_fourth_i32_getter_skipped_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_CTOR_VA;
}

uint32_t isaac_lua_engine_fourth_i32_getter_skipped_seh_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_SKIPPED_SEH_VA;
}

uint32_t isaac_lua_engine_fourth_i32_getter_skip_count(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_SKIP_COUNT;
}

uint32_t isaac_lua_engine_fourth_i32_getter_census_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_CENSUS_INDEX;
}

uint32_t isaac_lua_engine_fourth_i32_getter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_i32_getter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

int32_t isaac_lua_engine_fourth_i32_getter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_I32_GETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_i32_getter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_I32_GETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_i32_getter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_I32_GETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_i32_getter_has_push(void) {
  return ISAAC_LUA_FOURTH_I32_GETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_i32_getter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_I32_GETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_i32_getter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_I32_GETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_i32_getter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_i32_getter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_GETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v40 -- fourth-region i32 sign-extend getter BODY 0x008991a0
 * pure islands.
 * Evidence: PE bytes at raw 0x4985a0 (section table), 0x29 bytes
 * through ret 0x008991c8. Skip host 0x00898f80. Skip wrap/ctor
 * 0x00899030. Skip host setter 0x008990d0. Skip host 0x00899140.
 * Do not reopen 0x00898530 / 0x00898f50 / 0x008977f0 / 0x00897970 /
 * 0x00897f50 / 0x008984e0.
 * IAT slot named by the import directory (touserdata 0xb183b0).
 * Shared CF reuses v31 touserdata index/IAT and v22 closure
 * push-i32-sext 0x0085bfd0 BY REFERENCE — LANDED v55 as pusher
 * ROW 3 (PUSHINT_I32_SEXT); v55 FOURTH_I32_SEXT_GETTER_PUSH_ROW
 * pin == PUSHER_3_VA. Distinct: host 0x85bfd0 (v39 is 0x85bff0);
 * no checkinteger / pushinteger IAT (v38); ret 1 / has_push (v32 is
 * ret 0); no toboolean (v37); no BYTE setne / pushboolean (v34).
 * Host: IAT surface + the upvalue fn.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_i32_sext_getter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_host_va_push(void) {
  /* Closure push-i32-sext, LANDED v55 as pusher ROW 3. Drive as uint32_t. */
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA;
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_push_row(void) {
  /* v55 re-point: 0x85bfd0 IS pusher ROW 3 (PUSHINT_I32_SEXT). */
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_PUSH_ROW;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_host_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_HOST_VA;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_wrap_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_WRAP_VA;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_check_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_CHECK_VA;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_skipped_type_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIPPED_TYPE_VA;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_skip_count(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SKIP_COUNT;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_census_index(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_CENSUS_INDEX;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_has_push(void) {
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_i32_sext_getter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_I32_SEXT_GETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_lua_integer_hi(uint32_t value) {
  /* PE 0x85bfd8: 99 cdq. Reuses the v22 closure push-i32-sext law
     by reference. Drive UNMASKED: 0x80000000 -> 0xffffffff, not 0;
     0x100 stays 0 (not a byte gate). */
  return isaac_lua_engine_closure_push_i32_hi(value);
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_i32_sext_getter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_NEXT_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v41 -- sequential no-arg setter-shaped BODY 0x008991d0
 * pure islands.
 * Evidence: PE bytes at raw 0x4985d0 (section table), 0x1c bytes
 * through ret 0x008991eb. Skip count 0. Do not reopen 0x00898f50 /
 * 0x008991a0 / 0x00898530 / 0x00897970 / 0x008977f0 / 0x00898140.
 * IAT slot named by the import directory (touserdata 0xb183b0).
 * Shared CF reuses v31 touserdata index/IAT BY REFERENCE.
 * Distinct: ret 0 / has_push 0 (v40/v39 are ret 1 / has_push);
 * no checkinteger (v32/v38); body 0x1c not 0x29 / 0x32 / 0x41;
 * no host pusher. Always calls. Image-wide 1 site.
 * Host: IAT surface + the upvalue fn 0x009e94e0.
 * No uint8_t.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_fourth_noarg_setter_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_VA;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_BODY_BYTES;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_stack_clean(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_STACK_CLEAN;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_skip_count(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_SKIP_COUNT;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_code_ud_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_CODE_UD_VA;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_installer_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_INSTALLER_VA;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_touserdata_index(void) {
  return isaac_lua_engine_fourth_getter_touserdata_index();
}

uint32_t isaac_lua_engine_fourth_noarg_setter_iat_lua_touserdata(void) {
  return isaac_lua_engine_fourth_getter_iat_lua_touserdata();
}

int32_t isaac_lua_engine_fourth_noarg_setter_has_type_gate(void) {
  return ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_TYPE_GATE;
}

int32_t isaac_lua_engine_fourth_noarg_setter_has_this_select(void) {
  return ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_THIS_SELECT;
}

int32_t isaac_lua_engine_fourth_noarg_setter_has_null_gate(void) {
  return ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_NULL_GATE;
}

int32_t isaac_lua_engine_fourth_noarg_setter_has_push(void) {
  return ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_PUSH;
}

int32_t isaac_lua_engine_fourth_noarg_setter_has_checkinteger(void) {
  return ISAAC_LUA_FOURTH_NOARG_SETTER_HAS_CHECKINTEGER;
}

int32_t isaac_lua_engine_fourth_noarg_setter_sibling_count(void) {
  return ISAAC_LUA_FOURTH_NOARG_SETTER_SIBLING_COUNT;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_return_value(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_RETURN;
}

uint32_t isaac_lua_engine_fourth_noarg_setter_next_va(void) {
  return (uint32_t)ISAAC_LUA_FOURTH_NOARG_SETTER_NEXT_VA;
}

/* v27/v28/v29/v30/v31/v32/v33/v34/v35/v36/v37/v38/v39/v40/v41 signature pins - no uint8_t
   scalar parameter. Type gate, this-select, null gate, boolean-
   normalize, f32-bits, cdq-hi, and index_for_va take uint32_t and are
   driven UNMASKED. */
namespace {
using IsaacU32NoArgV27 = uint32_t (*)(void);
using IsaacI32NoArgV27 = int32_t (*)(void);
using IsaacU32GateV27 = int32_t (*)(uint32_t);
using IsaacThisSelV27 = uint32_t (*)(uint32_t, uint32_t);
using IsaacU32IdxV28 = uint32_t (*)(int32_t);
using IsaacI32VaV28 = int32_t (*)(uint32_t);
using IsaacU32BitsV35 = uint32_t (*)(uint32_t);
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigBcPrimaryVa =
    &isaac_lua_engine_band_c_primary_va;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigBcPrimaryTypeGate =
    &isaac_lua_engine_band_c_primary_type_gate_taken;
[[maybe_unused]] constexpr IsaacThisSelV27 kSigBcPrimaryThis =
    &isaac_lua_engine_band_c_primary_this;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigBcPrimaryNilCalls =
    &isaac_lua_engine_band_c_primary_nil_still_calls;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigBcPrimaryNext =
    &isaac_lua_engine_band_c_next_va;
[[maybe_unused]] constexpr IsaacU32IdxV28 kSigBcPrimaryVaAt =
    &isaac_lua_engine_band_c_primary_va_at;
[[maybe_unused]] constexpr IsaacU32IdxV28 kSigBcPrimaryKeyAt =
    &isaac_lua_engine_band_c_primary_class_key_at;
[[maybe_unused]] constexpr IsaacI32VaV28 kSigBcPrimaryIdxForVa =
    &isaac_lua_engine_band_c_primary_index_for_va;
[[maybe_unused]] constexpr IsaacU32IdxV28 kSigBcSecondaryVaAt =
    &isaac_lua_engine_band_c_secondary_va_at;
[[maybe_unused]] constexpr IsaacU32IdxV28 kSigBcSecondaryKeyAt =
    &isaac_lua_engine_band_c_secondary_class_key_at;
[[maybe_unused]] constexpr IsaacU32IdxV28 kSigBcSecondaryFlagAt =
    &isaac_lua_engine_band_c_secondary_check_flag_at;
[[maybe_unused]] constexpr IsaacU32IdxV28 kSigBcSecondaryWrapAt =
    &isaac_lua_engine_band_c_secondary_wrap_key_at;
[[maybe_unused]] constexpr IsaacI32VaV28 kSigBcSecondaryIdxForVa =
    &isaac_lua_engine_band_c_secondary_index_for_va;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigBcSecondaryNullGate =
    &isaac_lua_engine_band_c_secondary_result_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigLeftoverExtraVa =
    &isaac_lua_engine_leftover_extra_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigLeftoverExtraHasCheck =
    &isaac_lua_engine_leftover_extra_has_checkinteger;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigLeftoverExtraNullGate =
    &isaac_lua_engine_leftover_extra_result_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigLeftoverExtraNext =
    &isaac_lua_engine_leftover_extra_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthGetterVa =
    &isaac_lua_engine_fourth_getter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthGetterHasType =
    &isaac_lua_engine_fourth_getter_has_type_gate;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthGetterHasThis =
    &isaac_lua_engine_fourth_getter_has_this_select;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigFourthGetterNullGate =
    &isaac_lua_engine_fourth_getter_result_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthGetterNext =
    &isaac_lua_engine_fourth_getter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthSetterVa =
    &isaac_lua_engine_fourth_setter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthSetterHasNull =
    &isaac_lua_engine_fourth_setter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthSetterCheckIdx =
    &isaac_lua_engine_fourth_setter_checkinteger_index;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthSetterNext =
    &isaac_lua_engine_fourth_setter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthBoolSetterVa =
    &isaac_lua_engine_fourth_bool_setter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthBoolSetterHasNull =
    &isaac_lua_engine_fourth_bool_setter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthBoolSetterToBoolIdx =
    &isaac_lua_engine_fourth_bool_setter_toboolean_index;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigFourthBoolSetterNorm =
    &isaac_lua_engine_fourth_bool_setter_boolean_normalize;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthBoolSetterNext =
    &isaac_lua_engine_fourth_bool_setter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthBoolGetterVa =
    &isaac_lua_engine_fourth_bool_getter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthBoolGetterHasNull =
    &isaac_lua_engine_fourth_bool_getter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigFourthBoolGetterNorm =
    &isaac_lua_engine_fourth_bool_getter_boolean_normalize;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthBoolGetterNext =
    &isaac_lua_engine_fourth_bool_getter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNumberSetterVa =
    &isaac_lua_engine_fourth_number_setter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthNumberSetterHasNull =
    &isaac_lua_engine_fourth_number_setter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNumberSetterCheckIdx =
    &isaac_lua_engine_fourth_number_setter_checknumber_index;
[[maybe_unused]] constexpr IsaacU32BitsV35 kSigFourthNumberSetterF32 =
    &isaac_lua_engine_fourth_number_setter_f32_bits;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNumberSetterNext =
    &isaac_lua_engine_fourth_number_setter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNumberGetterVa =
    &isaac_lua_engine_fourth_number_getter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthNumberGetterHasNull =
    &isaac_lua_engine_fourth_number_getter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNumberGetterHostPush =
    &isaac_lua_engine_fourth_number_getter_host_va_push;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNumberGetterNext =
    &isaac_lua_engine_fourth_number_getter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthIntBoolSetterVa =
    &isaac_lua_engine_fourth_int_bool_setter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthIntBoolSetterHasNull =
    &isaac_lua_engine_fourth_int_bool_setter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthIntBoolSetterCheckIdx =
    &isaac_lua_engine_fourth_int_bool_setter_checkinteger_index;
[[maybe_unused]] constexpr IsaacU32GateV27 kSigFourthIntBoolSetterNorm =
    &isaac_lua_engine_fourth_int_bool_setter_boolean_normalize;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthIntBoolSetterNext =
    &isaac_lua_engine_fourth_int_bool_setter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthIntGetterVa =
    &isaac_lua_engine_fourth_int_getter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthIntGetterHasNull =
    &isaac_lua_engine_fourth_int_getter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthIntGetterCheckIdx =
    &isaac_lua_engine_fourth_int_getter_checkinteger_index;
[[maybe_unused]] constexpr IsaacU32BitsV35 kSigFourthIntGetterCdqHi =
    &isaac_lua_engine_fourth_int_getter_lua_integer_hi;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthIntGetterNext =
    &isaac_lua_engine_fourth_int_getter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthI32GetterVa =
    &isaac_lua_engine_fourth_i32_getter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthI32GetterHasNull =
    &isaac_lua_engine_fourth_i32_getter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthI32GetterHostPush =
    &isaac_lua_engine_fourth_i32_getter_host_va_push;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthI32GetterHasCheck =
    &isaac_lua_engine_fourth_i32_getter_has_checkinteger;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthI32GetterNext =
    &isaac_lua_engine_fourth_i32_getter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthI32SextGetterVa =
    &isaac_lua_engine_fourth_i32_sext_getter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthI32SextGetterHasNull =
    &isaac_lua_engine_fourth_i32_sext_getter_has_null_gate;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthI32SextGetterHostPush =
    &isaac_lua_engine_fourth_i32_sext_getter_host_va_push;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthI32SextGetterHasCheck =
    &isaac_lua_engine_fourth_i32_sext_getter_has_checkinteger;
[[maybe_unused]] constexpr IsaacU32BitsV35 kSigFourthI32SextGetterCdqHi =
    &isaac_lua_engine_fourth_i32_sext_getter_lua_integer_hi;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthI32SextGetterNext =
    &isaac_lua_engine_fourth_i32_sext_getter_next_va;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNoargSetterVa =
    &isaac_lua_engine_fourth_noarg_setter_va;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthNoargSetterHasNull =
    &isaac_lua_engine_fourth_noarg_setter_has_null_gate;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthNoargSetterHasPush =
    &isaac_lua_engine_fourth_noarg_setter_has_push;
[[maybe_unused]] constexpr IsaacI32NoArgV27 kSigFourthNoargSetterHasCheck =
    &isaac_lua_engine_fourth_noarg_setter_has_checkinteger;
[[maybe_unused]] constexpr IsaacU32NoArgV27 kSigFourthNoargSetterNext =
    &isaac_lua_engine_fourth_noarg_setter_next_va;
}  // namespace

int32_t isaac_lua_engine_pure_helpers_abi_version(void) {
  return ISAAC_LUA_ENGINE_PURE_HELPERS_ABI_VERSION;
}

/* ---------------------------------------------------------------------------
 * wave-16 · ABI v25h — getArgObject BODY 0x008baa50 (ecx=L, edx=idx -> obj).
 *
 * Machine truth: cpu-dump/008baa50.txt + 008baa7b.txt (36 insns, plain
 * ret; dual rets 0x8baa7a nil / 0x8baaa8 main; body 0x58). The VA was
 * only PINNED before (v45/v48 composed call-site law); these land the
 * BODY: register conduct (idx FULL 32-bit passthrough), both FULL-WORD
 * gates, key/flags/cleanups, IAT + error-string pins, caller census (86
 * E8 sites), and the caller-side vec lane laws. lua_* IAT bodies
 * (0xb18400 / 0xb18390) and the check body 0x85c590 stay host.
 * No uint8_t scalar params (gates take uint32_t, driven UNMASKED).
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_get_arg_object_body_va(void) {
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_BODY_VA;
}

uint32_t isaac_lua_engine_get_arg_object_nil_ret_va(void) {
  /* error path `ret` @0x8baa7a (after luaL_error, eax=0). */
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_NIL_RET_VA;
}

uint32_t isaac_lua_engine_get_arg_object_main_ret_va(void) {
  /* success path `ret` @0x8baaa8 (obj or 0 on the null re-check). */
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_MAIN_RET_VA;
}

uint32_t isaac_lua_engine_get_arg_object_body_bytes(void) {
  /* main ret - body VA (ret excluded, family convention). */
  return (uint32_t)(ISAAC_LUA_GET_ARG_OBJECT_MAIN_RET_VA -
                    ISAAC_LUA_GET_ARG_OBJECT_BODY_VA);
}

int32_t isaac_lua_engine_get_arg_object_insn_count(void) {
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_BODY_INSNS;
}

int32_t isaac_lua_engine_get_arg_object_dual_ret(void) {
  /* PE rets at both 0x8baa7a (nil) and 0x8baaa8 (main). */
  return ISAAC_LUA_GET_ARG_OBJECT_NIL_RET_VA !=
             ISAAC_LUA_GET_ARG_OBJECT_MAIN_RET_VA
         ? 1
         : 0;
}

uint32_t isaac_lua_engine_get_arg_object_idx_passthrough(uint32_t value) {
  /* PE `mov esi,edx` @0x8baa52 + `mov edx,esi` @0x8baa82 — the idx
     register round-trips UNMASKED (full 32-bit word: 0x100/0x1ff/
     0xffffffff all survive; never a low-byte/low-word fold). */
  return value;
}

int32_t isaac_lua_engine_get_arg_object_type_gate_taken(uint32_t value) {
  /* PE `test eax,eax; jne main` @0x8baa61 — FULL-WORD zero test of the
     lua_type(L,idx) result; error path taken when type == 0. A low-byte
     mutant diverges at 0x100/0x1ff. */
  return value == 0u ? 1 : 0;
}

int32_t isaac_lua_engine_get_arg_object_obj_gate_taken(uint32_t value) {
  /* PE `test esi,esi; jne ret` @0x8baa91 — FULL-WORD zero test of the
     obj field read [eax+4]; error path taken when obj == 0. */
  return value == 0u ? 1 : 0;
}

int32_t isaac_lua_engine_get_arg_object_check_flags(void) {
  /* push 1 @0x8baa7b — the 0x85c590 check-helper CHKFLAGS. */
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_CHECK_FLAGS;
}

uint32_t isaac_lua_engine_get_arg_object_registry_key(void) {
  /* push 0xc82980 @0x8baa7d — the Vector registry key (same as the
     v45 setref-successor key). */
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_REGISTRY_KEY;
}

uint32_t isaac_lua_engine_get_arg_object_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_CHECK_HELPER_VA;
}

int32_t isaac_lua_engine_get_arg_object_check_cleanup(void) {
  /* add esp,8 @0x8baa8b after call 0x85c590 (2 dwords: flags+key). */
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_CHECK_CLEANUP;
}

int32_t isaac_lua_engine_get_arg_object_check_edx_register(void) {
  /* edx = idx carried in a REGISTER (mov esi,edx / mov edx,esi), not an
     immediate — never a literal. */
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_CHECK_EDX_REGISTER;
}

uint32_t isaac_lua_engine_get_arg_object_object_field_off(void) {
  /* mov esi,[eax+4] @0x8baa8e — obj = check_field[4]. */
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_get_arg_object_error_string_va(void) {
  /* push 0xb7539c before luaL_error (both gates) — .rdata "nil passed
     to reference" (same string as the v52 getRef 0x8bb070). */
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_ERROR_STRING_VA;
}

uint32_t isaac_lua_engine_get_arg_object_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_get_arg_object_iat_lua_l_error(void) {
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_IAT_LUA_L_ERROR;
}

int32_t isaac_lua_engine_get_arg_object_type_call_cleanup(void) {
  /* add esp,8 @0x8baa5e after call [0xb18400] lua_type(L,idx). */
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_TYPE_CALL_CLEANUP;
}

uint32_t isaac_lua_engine_get_arg_object_resolve(uint32_t type_result,
                                                 uint32_t check_field) {
  /* Body-level two-gate result law (mirrors the v45 composed call-site
     law, now backed by the body constants): type==0 -> error ret 0;
     obj==0 -> error ret 0; else ret obj. Both gates FULL-WORD. */
  if (type_result == 0u) return 0u;
  if (check_field == 0u) return 0u;
  return check_field;
}

int32_t isaac_lua_engine_get_arg_object_lane_count(void) {
  /* caller (0x8a8270) reads two f32 lanes {obj2[0], obj2[4]}. */
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_LANE_COUNT;
}

int32_t isaac_lua_engine_get_arg_object_lane_stride(void) {
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_LANE_STRIDE;
}

uint32_t isaac_lua_engine_get_arg_object_lane_off_0(void) {
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_LANE_OFF_0;
}

uint32_t isaac_lua_engine_get_arg_object_lane_off_1(void) {
  return (uint32_t)ISAAC_LUA_GET_ARG_OBJECT_LANE_OFF_1;
}

int32_t isaac_lua_engine_get_arg_object_out_ptr_is_return(void) {
  /* eax (the returned obj) IS the vec base pointer — callers index it
     directly (obj2[0], obj2[4]), no separate out-pointer arg. */
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_OUT_PTR_IS_RETURN;
}

int32_t isaac_lua_engine_get_arg_object_caller_count(void) {
  return (int32_t)ISAAC_LUA_GET_ARG_OBJECT_CALLER_COUNT;
}

uint32_t isaac_lua_engine_get_arg_object_caller_va_at(int32_t index) {
  /* 86 E8 rel32 call sites (whole-image scan; sorted ascending). */
  static const uint32_t callers[ISAAC_LUA_GET_ARG_OBJECT_CALLER_COUNT] = {
    0x00897990u, 0x008985a8u, 0x0089862cu, 0x00898b23u, 0x0089a928u,
    0x0089a951u, 0x0089a978u, 0x0089b455u, 0x0089bfc4u, 0x0089e074u,
    0x0089e934u, 0x008a82c4u, 0x008a8387u, 0x008a8794u, 0x008a97f7u,
    0x008a9815u, 0x008a9849u, 0x008a9904u, 0x008a9922u, 0x008a9956u,
    0x008aa93du, 0x008aa9f3u, 0x008aab23u, 0x008ab8d4u, 0x008abc43u,
    0x008ac9b4u, 0x008ace04u, 0x008acee7u, 0x008acf05u, 0x008ad463u,
    0x008ad554u, 0x008ae9b1u, 0x008aeb13u, 0x008aec67u, 0x008aedeau,
    0x008aee5bu, 0x008af009u, 0x008af034u, 0x008af384u, 0x008af5c4u,
    0x008af6d3u, 0x008af7edu, 0x008afc74u, 0x008aff23u, 0x008b0014u,
    0x008b0134u, 0x008b0152u, 0x008b02a9u, 0x008b03f3u, 0x008b0504u,
    0x008b0a00u, 0x008b0b74u, 0x008b0c04u, 0x008b0ce3u, 0x008b151au,
    0x008b1557u, 0x008b16cau, 0x008b1ce0u, 0x008b1d4du, 0x008b23d4u,
    0x008b38b4u, 0x008b3e73u, 0x008b3eb0u, 0x008b3fd7u, 0x008b3ff5u,
    0x008b41b4u, 0x008b43b7u, 0x008b44cdu, 0x008b45cdu, 0x008b5230u,
    0x008b7368u, 0x008b7393u, 0x008b77e4u, 0x008b7a70u, 0x008b7c76u,
    0x008b7e10u, 0x008b7f5cu, 0x008b8090u, 0x008b821du, 0x008b85c4u,
    0x008b869du, 0x008b9166u, 0x008b9531u, 0x008b9f26u, 0x008b9f53u,
    0x008baca2u
  };
  if (index < 0 || index >= ISAAC_LUA_GET_ARG_OBJECT_CALLER_COUNT) {
    return 0u;
  }
  return callers[index];
}

/* ---- v25g — PUSH_I64_PAIR 0x85c030 hi/lo pair laws (NO ABI bump; the
 * coordinator merges per-family ABI bumps after the wave; ABI stays 53).
 * Machine truth: section-notes/lua-v25g-85c030 (cpu-dump/0085c030.txt +
 * caller dumps 0089b690.txt / 008ae860.txt). Body (11 insns, ret
 * 0x85c049, body 0x19 = 25):
 *   push ebp; mov ebp,esp; and esp,0xfffffff8; push [ebp+0xc] (HI);
 *   push [ebp+8] (LO); push ecx (L); call [0xb183f8] lua_pushinteger;
 *   add esp,0xc; mov esp,ebp; pop ebp; ret.
 * The 8-byte arg reaches lua_pushinteger as lo@[esp+4], hi@[esp+8]
 * (little-endian int64). The marshal is IDENTITY on both lanes — no mask,
 * no sign-extension; the int64 sign lives in hi bit 31 (lo bit 31 is
 * irrelevant). 5 true E8 callers (4 property-closure band rows + one
 * out-of-band clone 0x8ae89e); the v21/v53 census pins the 4 band rows. */

uint32_t isaac_lua_engine_property_closure_push_i64_pair_ret_va(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_RET_VA;
}

uint32_t isaac_lua_engine_property_closure_push_i64_pair_body_bytes(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_RET_VA -
         (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_VA;
}

int32_t isaac_lua_engine_property_closure_push_i64_pair_insn_count(void) {
  return ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_INSNS;
}

uint32_t isaac_lua_engine_property_closure_push_i64_pair_stack_align_mask(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_STACK_ALIGN_MASK;
}

uint32_t isaac_lua_engine_property_closure_push_i64_pair_iat_va(void) {
  return (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_IAT_VA;
}

int32_t isaac_lua_engine_property_closure_push_i64_pair_call_cleanup(void) {
  return ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_CALL_CLEANUP;
}

int32_t isaac_lua_engine_property_closure_push_i64_pair_e8_callers(void) {
  return ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_E8_CALLERS;
}

uint32_t isaac_lua_engine_property_closure_push_i64_pair_lo(uint32_t lo,
                                                             uint32_t hi) {
  /* push dword ptr [ebp+8] @0x85c039 — lo is a FULL 32-bit lane, NO mask:
     0xffffffff / 0x10000 survive (a u16/byte mask is WRONG). */
  (void)hi;
  return lo;
}

uint32_t isaac_lua_engine_property_closure_push_i64_pair_hi(uint32_t lo,
                                                             uint32_t hi) {
  /* push dword ptr [ebp+0xc] @0x85c036 — hi is a FULL 32-bit lane, NO mask;
     a forced-0 fold is the PUSHINT_U32 'push 0; push edx' law, not this
     one (hi=0x80000000 must survive). */
  (void)lo;
  return hi;
}

int32_t isaac_lua_engine_property_closure_push_i64_pair_sign(uint32_t lo,
                                                              uint32_t hi) {
  /* int64(hi:lo) < 0 iff hi bit 31 set; lo bit 31 is IRRELEVANT (a fold
     that reads the sign from lo bit 31 is WRONG). */
  (void)lo;
  return (hi & ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I64_PAIR_SIGN_MASK) ? 1 : 0;
}

/* ---- v25i — pusher-band ROW consolidation + 0x85c590 tail islands (NO
 * ABI bump; ABI stays 53). Re-points the v36/v39 getter host-push pins
 * at the landed pusher rows (row 0 == PUSHNUMBER_F32 0x85c050 == the v36
 * FOURTH_NUMBER_GETTER_HOST_VA_PUSH; row 1 == PUSHINT_U32 0x85bff0 ==
 * the v39 FOURTH_I32_GETTER_HOST_VA_PUSH). Completes the pusher table
 * with per-row width + row-dispatched lo/hi VALUE laws (v53 had only
 * per-kind laws). 0x85c590 tail CF/IAT facts from cpu-dump/0085c590.txt
 * (142 insns) + 0085c70f.txt (89 insns): settop ebx-cache, identity-fail
 * direct-IAT settop(-3), typename IAT, pushfstring IAT + msg arg order,
 * argerror IAT + saved idx, const-fail argreloop, got tolstring prep +
 * gotB=ebx receiver + gotA=[ebp-0xc] spill. All lua_* IAT bodies stay
 * host; no uint8_t scalar params. */

static int32_t pusher_row_for_va(uint32_t va) {
  for (int32_t i = 0; i < ISAAC_LUA_PUSHER_COUNT; ++i) {
    if (kPusherVa[i] == va) return i;
  }
  return -1;
}

int32_t isaac_lua_engine_pusher_row_for_va(uint32_t va) {
  return pusher_row_for_va(va);
}

int32_t isaac_lua_engine_pusher_width_bits(int32_t row) {
  if (pusher_index_ok(row) == 0) return -1;
  static const int32_t kWidth[ISAAC_LUA_PUSHER_COUNT] = {
      ISAAC_LUA_PUSHER_WIDTH_BITS_0, ISAAC_LUA_PUSHER_WIDTH_BITS_1,
      ISAAC_LUA_PUSHER_WIDTH_BITS_2, ISAAC_LUA_PUSHER_WIDTH_BITS_3};
  return kWidth[row];
}

uint32_t isaac_lua_engine_pusher_value_lo(int32_t row, uint32_t value) {
  /* Row-dispatched pushed lo dword, per the v53/v55 kind laws:
     row 0 PUSHNUMBER_F32 -> cvtss2sd widen lo (f32 bits in);
     row 1 PUSHINT_U32 -> FULL 32-bit word (no mask);
     row 2 PUSHINT_U16 -> u16 LOW WORD (0x10000 -> 0);
     row 3 PUSHINT_I32_SEXT -> FULL 32-bit word (mov eax,edx). */
  if (pusher_index_ok(row) == 0) return 0u;
  switch (kPusherKind[row]) {
    case ISAAC_LUA_PUSHER_KIND_PUSHNUMBER_F32:
      return isaac_lua_engine_pusher_pushnumber_f32_widen_lo(value);
    case ISAAC_LUA_PUSHER_KIND_PUSHINT_U32:
      return value;
    case ISAAC_LUA_PUSHER_KIND_PUSHINT_I32_SEXT:
      return isaac_lua_engine_pusher_pushint_i32_sext_lo(value);
    default:
      return (uint32_t)(value & 0xffffu);
  }
}

uint32_t isaac_lua_engine_pusher_value_hi(int32_t row, uint32_t value) {
  /* Row-dispatched pushed hi dword: row 0 -> widen hi; row 1/2 -> 0
     (literal push 0 / movzx+cdq); row 3 -> cdq sign replicate of bit31.
     OOR row -> 0. */
  if (pusher_index_ok(row) == 0) return 0u;
  switch (kPusherKind[row]) {
    case ISAAC_LUA_PUSHER_KIND_PUSHNUMBER_F32:
      return isaac_lua_engine_pusher_pushnumber_f32_widen_hi(value);
    case ISAAC_LUA_PUSHER_KIND_PUSHINT_I32_SEXT:
      return isaac_lua_engine_pusher_pushint_i32_sext_hi(value);
    default:
      return 0u;
  }
}

int32_t isaac_lua_engine_fourth_number_getter_push_row(void) {
  /* Re-pointed v36 pin: host push 0x85c050 == pusher ROW 0. */
  return ISAAC_LUA_FOURTH_NUMBER_GETTER_PUSH_ROW;
}

int32_t isaac_lua_engine_fourth_i32_getter_push_row(void) {
  /* Re-pointed v39 pin: host push 0x85bff0 == pusher ROW 1. */
  return ISAAC_LUA_FOURTH_I32_GETTER_PUSH_ROW;
}

uint32_t isaac_lua_engine_check_get_settop_ebx_cache_iat_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_SETTOP_EBX_CACHE_IAT_VA;
}

uint32_t isaac_lua_engine_check_get_settop_ebx_cache_site_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_SETTOP_EBX_CACHE_SITE_VA;
}

int32_t isaac_lua_engine_check_get_settop_ebx_call_sites(void) {
  /* mov ebx,[0xb18328] @0x85c5ef + 7 call-ebx settop sites. */
  return ISAAC_LUA_CHECK_GET_SETTOP_EBX_CALL_SITES;
}

uint32_t isaac_lua_engine_check_get_identity_fail_settop_index(void) {
  /* jne @0x85c5e9 -> 0x85c753: push -3; push edi; call [0xb18328]
     DIRECT (ebx cache load @0x85c5ef never runs on this path). */
  return (uint32_t)ISAAC_LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_INDEX_U32;
}

int32_t isaac_lua_engine_check_get_identity_fail_settop_direct_iat(void) {
  return ISAAC_LUA_CHECK_GET_IDENTITY_FAIL_SETTOP_DIRECT_IAT;
}

uint32_t isaac_lua_engine_check_get_typename_iat_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_TYPENAME_IAT_VA;
}

int32_t isaac_lua_engine_check_get_typename_type_index_saved(void) {
  /* lua_type(L, esi=[ebp-8]) @0x85c798 — the SAVED caller stack index,
     not -1 (a relative-index fold is wrong). */
  return ISAAC_LUA_CHECK_GET_TYPENAME_TYPE_INDEX_SAVED;
}

uint32_t isaac_lua_engine_check_get_pushfstring_iat_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_PUSHFSTRING_IAT_VA;
}

int32_t isaac_lua_engine_check_get_msg_got_a_first(void) {
  /* push ebx(gotB); push eax(gotA); push fmt; push edi; call pushfstring
     -> args (L, fmt, gotA, gotB): gotA=[ebp-0xc] FIRST, gotB=ebx SECOND. */
  return ISAAC_LUA_CHECK_GET_MSG_GOT_A_FIRST;
}

uint32_t isaac_lua_engine_check_get_argerror_iat_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_ARGERROR_IAT_VA;
}

int32_t isaac_lua_engine_check_get_argerror_index_saved(void) {
  /* push eax(msg); push esi(saved idx); push edi; call argerror — the
     SAVED idx ([ebp-8]), not a relative stack index. */
  return ISAAC_LUA_CHECK_GET_ARGERROR_INDEX_SAVED;
}

int32_t isaac_lua_engine_check_get_error_tail_cleanup(void) {
  /* add esp,0x1c @0x85c7c5 = pushfstring 4 args (0x10) + argerror 3 args
     (0xc), cleaned together after the argerror tail. */
  return ISAAC_LUA_CHECK_GET_ERROR_TAIL_CLEANUP;
}

int32_t isaac_lua_engine_check_get_const_fail_argerror_cleanup(void) {
  /* const-fail @0x85c696..0x85c6a3: 3 args (msg 0xb6e9b4, idx, L) ->
     add esp,0xc; then jmp 0x85c670 (reloop). */
  return ISAAC_LUA_CHECK_GET_CONST_FAIL_ARGERROR_CLEANUP;
}

int32_t isaac_lua_engine_check_get_const_fail_reloops(void) {
  /* jmp 0x85c670 @0x85c6a6 — argerror-then-RELOOP into the rawequal loop
     head (not a terminal error path). */
  return ISAAC_LUA_CHECK_GET_CONST_FAIL_RELOOPS;
}

uint32_t isaac_lua_engine_check_get_got_tolstring_iat_va(void) {
  return (uint32_t)ISAAC_LUA_CHECK_GET_GOT_TOLSTRING_IAT_VA;
}

int32_t isaac_lua_engine_check_get_got_b_receiver_ebx(void) {
  /* parent-walk got prep @0x85c741..0x85c74f: lua_tolstring(L,-2,NULL)
     -> mov ebx,eax (gotB receiver = ebx); jmp 0x85c75f. */
  return ISAAC_LUA_CHECK_GET_GOT_B_RECEIVER_EBX;
}

int32_t isaac_lua_engine_check_get_got_a_spill_frame_slot(void) {
  /* mismatch tail @0x85c77e..0x85c78f: tolstring(L,-1,NULL) ->
     mov [ebp-0xc],eax (gotA spill); reload @0x85c7ab for the msg arg. */
  return ISAAC_LUA_CHECK_GET_GOT_A_SPILL_FRAME_SLOT;
}

/* ---- ABI v55 — PUSH_I32_SEXT 0x85bfd0 completes the pusher table at
 * ROW 3 and re-points the v40 pin (static_asserts; the behavioural laws
 * live in the v55 test group). ---- */
static_assert(ISAAC_LUA_PUSHER_COUNT == 4, "v55 pusher table has 4 rows");
static_assert(ISAAC_LUA_PUSHER_3_VA == 0x0085bfd0u,
              "v55 row 3 is the closure push-i32-sext");
static_assert(ISAAC_LUA_PUSHER_3_RET_VA == 0x0085bfe8u,
              "row 3 ret ends the sext pusher body");
static_assert(ISAAC_LUA_PUSHER_3_INSNS == 13, "row 3 body insns");
static_assert(ISAAC_LUA_PUSHER_3_STACK_ALIGN_MASK == 0xfffffff8u,
              "row 3 and esp alignment");
static_assert(ISAAC_LUA_PUSHER_3_F64_SLOT_BYTES == 0,
              "row 3 marshals i32, no f64 slot");
static_assert(ISAAC_LUA_PUSHER_3_IAT_VA == 0x00b183f8u,
              "row 3 calls the lua_pushinteger IAT");
static_assert(ISAAC_LUA_PUSHER_3_IAT_VA == ISAAC_LUA_PUSHER_1_IAT_VA,
              "row 3 shares the pushinteger IAT with rows 1/2");
static_assert(ISAAC_LUA_PUSHER_3_CLEANUP == 0x0cu, "row 3 call cleanup");
static_assert(ISAAC_LUA_PUSHER_KIND_PUSHINT_I32_SEXT == 3,
              "sext kind is row 3");
static_assert(ISAAC_LUA_PUSHER_WIDTH_BITS_3 == 32,
              "sext input width is the full word");
static_assert((uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_PUSH_ROW == 3u,
              "v55 re-points the v40 pin at pusher ROW 3");
static_assert((uint32_t)ISAAC_LUA_PUSHER_3_VA ==
                  (uint32_t)ISAAC_LUA_FOURTH_I32_SEXT_GETTER_HOST_VA_PUSH,
              "row 3 VA is the v40 host push by reference");
static_assert((uint32_t)ISAAC_LUA_PUSHER_3_VA ==
                  (uint32_t)ISAAC_LUA_PROPERTY_CLOSURE_PUSH_I32_SEXT_VA,
              "row 3 VA is the property-closure sext pusher");
static_assert((uint32_t)ISAAC_LUA_PUSHER_3_VA !=
                  (uint32_t)ISAAC_LUA_PUSHER_1_VA,
              "row 3 is not the 0x85bff0 zext pusher");
static_assert((uint32_t)ISAAC_LUA_PUSHER_3_VA !=
                  (uint32_t)ISAAC_LUA_PUSHER_0_VA,
              "row 3 is not the 0x85c050 f32 pusher");
static_assert((uint32_t)ISAAC_LUA_PUSHER_3_VA !=
                  (uint32_t)ISAAC_LUA_PUSHER_2_VA,
              "row 3 is not the 0x85c010 u16 pusher");
/* ===========================================================================
 * ABI v56 — EntityRef vec-helper band (wrapper 0x8b91d0 "GetAmbush",
 * vec-A 0x8b9270 "Fadein", vec-B 0x8b9380 "Fadeout").
 * See header ABI v56 block + lua-v56-vecband notes for the full PE-truth
 * transcription. All lua_* IAT bodies, 0x85c590 (v11/v12), 0x8bb070
 * (v52), the ud[0] real_fns and the ret-8 installer bodies stay host.
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_vecband_object_resolve(uint32_t type_result,
                                                 uint32_t check_field) {
  /* PE `test eax,eax` (wrapper @0x8b91e4, vec-A @0x8b928b, vec-B
     @0x8b939b) — FULL-WORD lua_type(L,1) gate; nil -> 0, else the
     0x85c590 check result field. 0x100/0xffffffff survive. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_vecband_wrapper_result_gate(uint32_t result) {
  /* PE `test edi,edi; je 0x8b9258` @0x8b921c — FULL-WORD real_fn result
     gate: nonzero -> WRAP path (1), zero -> NIL path (0). */
  return result != 0u ? 1u : 0u;
}

uint32_t isaac_lua_engine_vecband_vec_a_flag_byte(uint32_t tobool_result) {
  /* PE `test eax,eax; setne bl` @0x8b9303/0x8b930a — FULL-WORD
     lua_toboolean(L,3) test folded to a BYTE: 0x100 -> 0x01, 0 -> 0x00.
     Byte-gated law (byte store [esp+0x38] = bl). */
  return (tobool_result != 0u) ? 1u : 0u;
}

uint32_t isaac_lua_engine_vecband_vec_b_arg_word(uint32_t checkint_result) {
  /* PE `mov esi,eax` @0x8b9418 (luaL_checkinteger(L,3) result) — FULL WORD
     kept; dword store [esp+0x38] = esi @0x8b946a; push esi. 0x100 /
     0x10000 / 0xffffffff ALL survive. Never masked. */
  return checkint_result;
}

uint32_t isaac_lua_engine_vecband_vec_getref_edx(uint32_t index) {
  /* PE `mov edx,4` @0x8b92be/0x8b93ce — the getRef index REGISTER crosses
     to lua_type(L,idx) and the 0x85c590 edx unchanged (REGISTER call
     through 0x8bb070; v52 getRef edx-passthrough law). */
  return index;
}

uint32_t isaac_lua_engine_vecband_vec_out_f32_off_at(int32_t lane) {
  /* PE 4x movss [esp+0x30..0x48] lane copies (vec-A @0x8b9320..0x8b9361,
     vec-B @0x8b942d..0x8b946e): out[0..0xc] = obj4[0..0xc] f32 lanes. */
  return (lane >= 0 && lane < 4) ? (uint32_t)(lane << 2) : 0u;
}

uint32_t isaac_lua_engine_vecband_vec_u32_out_off(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_U32_OUT_OFF;
}

uint32_t isaac_lua_engine_vecband_wrapper_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAPPER_VA;
}
uint32_t isaac_lua_engine_vecband_wrapper_wrap_ret_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAPPER_WRAP_RET_VA;
}
uint32_t isaac_lua_engine_vecband_wrapper_nil_ret_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAPPER_NIL_RET_VA;
}
uint32_t isaac_lua_engine_vecband_wrapper_body_bytes(void) {
  /* RET_VA - VA convention (family-wide): 0x8b926a - 0x8b91d0 = 0x9a. */
  return (uint32_t)(ISAAC_LUA_VECBAND_WRAPPER_NIL_RET_VA -
                    ISAAC_LUA_VECBAND_WRAPPER_VA);
}
int32_t isaac_lua_engine_vecband_wrapper_insn_count(void) {
  return (int32_t)ISAAC_LUA_VECBAND_WRAPPER_INSNS;
}
int32_t isaac_lua_engine_vecband_check_flags(void) {
  return (int32_t)ISAAC_LUA_VECBAND_CHECK_FLAGS;
}
uint32_t isaac_lua_engine_vecband_check_key(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_CHECK_KEY;
}
int32_t isaac_lua_engine_vecband_check_edx(void) {
  return (int32_t)ISAAC_LUA_VECBAND_CHECK_EDX;
}
uint32_t isaac_lua_engine_vecband_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_vecband_fn_off(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_FN_OFF;
}
uint32_t isaac_lua_engine_vecband_wrap_ud_size(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAP_UD_SIZE;
}
uint32_t isaac_lua_engine_vecband_wrap_vtable_tag_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAP_VTABLE_TAG_VA;
}
uint32_t isaac_lua_engine_vecband_wrap_result_off(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAP_RESULT_OFF;
}
uint32_t isaac_lua_engine_vecband_wrap_key(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAP_KEY;
}
uint32_t isaac_lua_engine_vecband_registry_index(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_vecband_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_SETMETA_INDEX_U32;
}
uint32_t isaac_lua_engine_vecband_wrap_cleanup(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_WRAP_CLEANUP;
}
uint32_t isaac_lua_engine_vecband_vec_a_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_A_VA;
}
uint32_t isaac_lua_engine_vecband_vec_a_ret_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_A_RET_VA;
}
uint32_t isaac_lua_engine_vecband_vec_a_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_VECBAND_VEC_A_RET_VA -
                    ISAAC_LUA_VECBAND_VEC_A_VA);
}
int32_t isaac_lua_engine_vecband_vec_a_insn_count(void) {
  return (int32_t)ISAAC_LUA_VECBAND_VEC_A_INSNS;
}
uint32_t isaac_lua_engine_vecband_vec_b_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_B_VA;
}
uint32_t isaac_lua_engine_vecband_vec_b_ret_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_B_RET_VA;
}
uint32_t isaac_lua_engine_vecband_vec_b_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_VECBAND_VEC_B_RET_VA -
                    ISAAC_LUA_VECBAND_VEC_B_VA);
}
int32_t isaac_lua_engine_vecband_vec_b_insn_count(void) {
  return (int32_t)ISAAC_LUA_VECBAND_VEC_B_INSNS;
}
uint32_t isaac_lua_engine_vecband_vec_getref_helper_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_GETREF_HELPER_VA;
}
uint32_t isaac_lua_engine_vecband_vec_checknumber_iat_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_CHECKNUMBER_IAT_VA;
}
uint32_t isaac_lua_engine_vecband_vec_toboolean_iat_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_TOBOOLEAN_IAT_VA;
}
uint32_t isaac_lua_engine_vecband_vec_checkinteger_iat_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_CHECKINTEGER_IAT_VA;
}
uint32_t isaac_lua_engine_vecband_vec_arg2_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_ARG2_CHECKNUMBER_INDEX_U32;
}
uint32_t isaac_lua_engine_vecband_vec_arg3_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_ARG3_TOBOOLEAN_INDEX_U32;
}
uint32_t isaac_lua_engine_vecband_vec_arg3_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_VEC_ARG3_CHECKINTEGER_INDEX_U32;
}
int32_t isaac_lua_engine_vecband_vec_out_dwords(void) {
  return (int32_t)ISAAC_LUA_VECBAND_VEC_OUT_DWORDS;
}
int32_t isaac_lua_engine_vecband_vec_lane_count(void) {
  return (int32_t)ISAAC_LUA_VECBAND_VEC_LANE_COUNT;
}
int32_t isaac_lua_engine_vecband_return_value(void) {
  return (int32_t)ISAAC_LUA_VECBAND_RETURN_VALUE;
}
uint32_t isaac_lua_engine_vecband_install_getambush_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_VA;
}
uint32_t isaac_lua_engine_vecband_install_getambush_literal_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_LITERAL_VA;
}
uint32_t isaac_lua_engine_vecband_install_getambush_name_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_NAME_VA;
}
uint32_t isaac_lua_engine_vecband_install_getambush_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_GETAMBUSH_REAL_FN_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadein_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEIN_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadein_literal_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEIN_LITERAL_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadein_name_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEIN_NAME_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadein_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEIN_REAL_FN_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadeout_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEOUT_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadeout_literal_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEOUT_LITERAL_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadeout_name_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEOUT_NAME_VA;
}
uint32_t isaac_lua_engine_vecband_install_fadeout_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_VECBAND_INSTALL_FADEOUT_REAL_FN_VA;
}

/* ===========================================================================
 * ABI v57 — sibling band (wrapper 0x8b9490 "MakeShockwave", wrapper
 * 0x8b95a0 "Play"). See header ABI v57 block + lua-v57-siblings notes.
 * All lua_* IAT bodies, 0x85c590 (v11/v12), 0x8baa50 (v25h BODY), the
 * ud[0] real_fns (0x703770 / 0x92dc30) and the ret-8 installer bodies
 * (0x895250 / 0x895450) stay host. Both siblings: FULL-WORD lua_type
 * gate; touserdata upvalueindex(1) 0xfff0b9d7 (NO add esp,8 — locals
 * ebp-relative); real_fn = ud[0]; ecx = obj1; ret 0.
 * A: KEY 0xc82a13; getArgObject edx 2; out 6 dwords [r0, r1, num3,
 * num4, int5, ud]; args (&out, num3, num4, int5).
 * B: KEY 0xc82a16; args (int2, num3, int4, bool5 LOW-BYTE, num6, num7).
 * ------------------------------------------------------------------------- */
uint32_t isaac_lua_engine_v57_object_resolve(uint32_t type_result,
                                             uint32_t check_field) {
  /* PE `test eax,eax` (sib-A @0x8b94ba, sib-B @0x8b95ca) — FULL-WORD
     lua_type(L,1) gate; nil -> 0, else the resolved obj. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v57_bool_low_byte(uint32_t tobool_result) {
  /* PE `test eax,eax; setne byte [ebp-0x20]` @0x8b962e/0x8b9638 —
     FULL-WORD toboolean(L,5) test folded to a BYTE. The pushed dword is
     a MEMORY reload (movups xmm1,[ebp-0x40] @0x8b9677; psrldq xmm0,4;
     movd eax @0x8b96a1) whose high 3 bytes are STALE frame garbage —
     only the LOW BYTE is deterministic. Byte-gated law. */
  return (tobool_result != 0u ? 1u : 0u) & 0xffu;
}

uint32_t isaac_lua_engine_v57_int_word(uint32_t checkint_result) {
  /* PE `mov esi,eax` @0x8b94fa (A arg3), `mov edx,eax` @0x8b967e (B
     arg0), `mov [ebp-0x40],eax` @0x8b9652 (B arg2) — checkinteger FULL
     WORD kept; 0x100 / 0x10000 / 0xffffffff ALL survive. Never masked. */
  return checkint_result;
}

uint32_t isaac_lua_engine_v57_out_f32_off_at(int32_t lane) {
  /* PE 4x f32 out lanes (sib-A @0x8b9558 movaps [ebp-0x50]): out+0x00
     = r0 (getArgObject[0]), +0x04 = r1 ([4]), +0x08 = num3, +0x0c =
     num4 (checknumber copies). */
  return (lane >= 0 && lane < 4) ? (uint32_t)(lane << 2) : 0u;
}

uint32_t isaac_lua_engine_v57_out_u32_off(void) {
  /* movq [ebp-0x40],xmm0 @0x8b9563: int5 at out+0x10. */
  return (uint32_t)ISAAC_LUA_V57_SIB_A_OUT_U32_OFF;
}

uint32_t isaac_lua_engine_v57_out_ud_off(void) {
  /* same movq: ud (touserdata result) at out+0x14. */
  return (uint32_t)ISAAC_LUA_V57_SIB_A_OUT_UD_OFF;
}

uint32_t isaac_lua_engine_v57_sib_a_va(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_A_VA;
}
uint32_t isaac_lua_engine_v57_sib_a_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_A_RET_VA;
}
uint32_t isaac_lua_engine_v57_sib_a_body_bytes(void) {
  /* RET_VA - VA convention (family-wide): 0x8b959f - 0x8b9490 = 0x10f. */
  return (uint32_t)(ISAAC_LUA_V57_SIB_A_RET_VA - ISAAC_LUA_V57_SIB_A_VA);
}
int32_t isaac_lua_engine_v57_sib_a_insn_count(void) {
  return (int32_t)ISAAC_LUA_V57_SIB_A_INSNS;
}
uint32_t isaac_lua_engine_v57_sib_b_va(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_VA;
}
uint32_t isaac_lua_engine_v57_sib_b_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_RET_VA;
}
uint32_t isaac_lua_engine_v57_sib_b_body_bytes(void) {
  /* 0x8b96c8 - 0x8b95a0 = 0x128. */
  return (uint32_t)(ISAAC_LUA_V57_SIB_B_RET_VA - ISAAC_LUA_V57_SIB_B_VA);
}
int32_t isaac_lua_engine_v57_sib_b_insn_count(void) {
  return (int32_t)ISAAC_LUA_V57_SIB_B_INSNS;
}
int32_t isaac_lua_engine_v57_check_flags(void) {
  return (int32_t)ISAAC_LUA_V57_CHECK_FLAGS;
}
int32_t isaac_lua_engine_v57_check_edx(void) {
  return (int32_t)ISAAC_LUA_V57_CHECK_EDX;
}
uint32_t isaac_lua_engine_v57_key_a(void) {
  return (uint32_t)ISAAC_LUA_V57_KEY_A;
}
uint32_t isaac_lua_engine_v57_key_b(void) {
  return (uint32_t)ISAAC_LUA_V57_KEY_B;
}
uint32_t isaac_lua_engine_v57_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V57_OBJECT_FIELD_OFF;
}
uint32_t isaac_lua_engine_v57_type_index(void) {
  return (uint32_t)ISAAC_LUA_V57_TYPE_INDEX;
}
uint32_t isaac_lua_engine_v57_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V57_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V57_FN_OFF;
}
uint32_t isaac_lua_engine_v57_get_arg_object_va(void) {
  return (uint32_t)ISAAC_LUA_V57_GET_ARG_OBJECT_VA;
}
uint32_t isaac_lua_engine_v57_get_arg_edx(void) {
  return (uint32_t)ISAAC_LUA_V57_GET_ARG_EDX;
}
uint32_t isaac_lua_engine_v57_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V57_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_v57_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V57_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_v57_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V57_IAT_LUA_CHECKINTEGER;
}
uint32_t isaac_lua_engine_v57_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V57_IAT_LUA_CHECKNUMBER;
}
uint32_t isaac_lua_engine_v57_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_V57_IAT_LUA_TOBOOLEAN;
}
uint32_t isaac_lua_engine_v57_sib_a_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_A_ARG1_CHECKNUMBER_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_a_arg2_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_A_ARG2_CHECKNUMBER_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_a_arg3_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_A_ARG3_CHECKINTEGER_INDEX_U32;
}
int32_t isaac_lua_engine_v57_sib_a_out_f32_count(void) {
  return (int32_t)ISAAC_LUA_V57_SIB_A_OUT_F32_COUNT;
}
int32_t isaac_lua_engine_v57_sib_a_out_dwords(void) {
  return (int32_t)ISAAC_LUA_V57_SIB_A_OUT_DWORDS;
}
uint32_t isaac_lua_engine_v57_sib_b_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_ARG0_CHECKINTEGER_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_b_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_ARG1_CHECKNUMBER_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_b_arg2_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_ARG2_CHECKINTEGER_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_b_arg3_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_ARG3_TOBOOLEAN_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_b_arg4_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_ARG4_CHECKNUMBER_INDEX_U32;
}
uint32_t isaac_lua_engine_v57_sib_b_arg5_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V57_SIB_B_ARG5_CHECKNUMBER_INDEX_U32;
}
int32_t isaac_lua_engine_v57_return_value(void) {
  return (int32_t)ISAAC_LUA_V57_RETURN_VALUE;
}
uint32_t isaac_lua_engine_v57_install_a_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_A_VA;
}
uint32_t isaac_lua_engine_v57_install_a_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_A_LITERAL_VA;
}
uint32_t isaac_lua_engine_v57_install_a_name_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_A_NAME_VA;
}
uint32_t isaac_lua_engine_v57_install_a_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_A_REAL_FN_VA;
}
uint32_t isaac_lua_engine_v57_install_b_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_B_VA;
}
uint32_t isaac_lua_engine_v57_install_b_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_B_LITERAL_VA;
}
uint32_t isaac_lua_engine_v57_install_b_name_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_B_NAME_VA;
}
uint32_t isaac_lua_engine_v57_install_b_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V57_INSTALL_B_REAL_FN_VA;
}
static_assert((ISAAC_LUA_PUSHER_3_RET_VA - ISAAC_LUA_PUSHER_3_VA) == 0x18u,
              "0x85bfe8 - 0x85bfd0 = 0x18 body bytes through ret start");

/* ---------------------------------------------------------------------------
 * ABI v58 — 0x8b96d0 wrapper family pure islands (incident restoration:
 * bodies mirror scripts/decomp/lua-engine-pure-model.mjs oracles; see
 * section-notes/lua-cpp-recovery-plan/NOTES.md)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v58_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v58_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v58_va(void) {
  return (uint32_t)ISAAC_LUA_V58_VA;
}

uint32_t isaac_lua_engine_v58_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V58_RET_VA;
}

uint32_t isaac_lua_engine_v58_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V58_RET_VA - ISAAC_LUA_V58_VA);
}

int32_t isaac_lua_engine_v58_insn_count(void) {
  return (int32_t)ISAAC_LUA_V58_INSNS;
}

int32_t isaac_lua_engine_v58_check_flags(void) {
  return (int32_t)ISAAC_LUA_V58_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v58_check_edx(void) {
  return (int32_t)ISAAC_LUA_V58_CHECK_EDX;
}

uint32_t isaac_lua_engine_v58_key(void) {
  return (uint32_t)ISAAC_LUA_V58_KEY;
}

uint32_t isaac_lua_engine_v58_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V58_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v58_type_index(void) {
  return (uint32_t)ISAAC_LUA_V58_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v58_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V58_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v58_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V58_FN_OFF;
}

uint32_t isaac_lua_engine_v58_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V58_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v58_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V58_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v58_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V58_IAT_LUA_CHECKNUMBER;
}

uint32_t isaac_lua_engine_v58_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V58_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v58_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V58_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v58_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V58_ARG1_CHECKNUMBER_INDEX_U32;
}

int32_t isaac_lua_engine_v58_return_value(void) {
  return (int32_t)ISAAC_LUA_V58_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v58_install_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_VA;
}

uint32_t isaac_lua_engine_v58_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v58_install_real_fn_a_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_REAL_FN_A_VA;
}

uint32_t isaac_lua_engine_v58_install_name_a_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_NAME_A_VA;
}

uint32_t isaac_lua_engine_v58_install_caller_a_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_CALLER_A_VA;
}

uint32_t isaac_lua_engine_v58_install_real_fn_b_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_REAL_FN_B_VA;
}

uint32_t isaac_lua_engine_v58_install_name_b_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_NAME_B_VA;
}

uint32_t isaac_lua_engine_v58_install_caller_b_va(void) {
  return (uint32_t)ISAAC_LUA_V58_INSTALL_CALLER_B_VA;
}

uint32_t isaac_lua_engine_v59_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v59_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v59_va(void) {
  return (uint32_t)ISAAC_LUA_V59_VA;
}

uint32_t isaac_lua_engine_v59_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V59_RET_VA;
}

uint32_t isaac_lua_engine_v59_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V59_RET_VA - ISAAC_LUA_V59_VA);
}

int32_t isaac_lua_engine_v59_insn_count(void) {
  return (int32_t)ISAAC_LUA_V59_INSNS;
}

int32_t isaac_lua_engine_v59_check_flags(void) {
  return (int32_t)ISAAC_LUA_V59_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v59_check_edx(void) {
  return (int32_t)ISAAC_LUA_V59_CHECK_EDX;
}

uint32_t isaac_lua_engine_v59_key(void) {
  return (uint32_t)ISAAC_LUA_V59_KEY;
}

uint32_t isaac_lua_engine_v59_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V59_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v59_type_index(void) {
  return (uint32_t)ISAAC_LUA_V59_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v59_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V59_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v59_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V59_FN_OFF;
}

uint32_t isaac_lua_engine_v59_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V59_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v59_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V59_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v59_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V59_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v59_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V59_ARG0_CHECKINTEGER_INDEX_U32;
}

int32_t isaac_lua_engine_v59_return_value(void) {
  return (int32_t)ISAAC_LUA_V59_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v59_install_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_VA;
}

uint32_t isaac_lua_engine_v59_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v59_install_real_fn_a_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_REAL_FN_A_VA;
}

uint32_t isaac_lua_engine_v59_install_name_a_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_NAME_A_VA;
}

uint32_t isaac_lua_engine_v59_install_caller_a_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_CALLER_A_VA;
}

uint32_t isaac_lua_engine_v59_install_real_fn_b_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_REAL_FN_B_VA;
}

uint32_t isaac_lua_engine_v59_install_name_b_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_NAME_B_VA;
}

uint32_t isaac_lua_engine_v59_install_caller_b_va(void) {
  return (uint32_t)ISAAC_LUA_V59_INSTALL_CALLER_B_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v60–v62 wrapper families pure islands (incident restoration:
 * bodies mirror scripts/decomp/lua-engine-pure-model.mjs oracles)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v60_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v60_va(void) {
  return (uint32_t)ISAAC_LUA_V60_VA;
}

uint32_t isaac_lua_engine_v60_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V60_RET_VA;
}

uint32_t isaac_lua_engine_v60_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V60_RET_VA - ISAAC_LUA_V60_VA);
}

int32_t isaac_lua_engine_v60_insn_count(void) {
  return (int32_t)ISAAC_LUA_V60_INSNS;
}

int32_t isaac_lua_engine_v60_check_flags(void) {
  return (int32_t)ISAAC_LUA_V60_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v60_check_edx(void) {
  return (int32_t)ISAAC_LUA_V60_CHECK_EDX;
}

uint32_t isaac_lua_engine_v60_key(void) {
  return (uint32_t)ISAAC_LUA_V60_KEY;
}

uint32_t isaac_lua_engine_v60_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V60_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v60_type_index(void) {
  return (uint32_t)ISAAC_LUA_V60_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v60_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V60_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v60_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V60_FN_OFF;
}

uint32_t isaac_lua_engine_v60_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V60_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v60_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V60_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v60_return_value(void) {
  return (int32_t)ISAAC_LUA_V60_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v60_install_va(void) {
  return (uint32_t)ISAAC_LUA_V60_INSTALL_VA;
}

uint32_t isaac_lua_engine_v60_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V60_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v60_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V60_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v60_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V60_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v60_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V60_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v61_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v61_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v61_return_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v61_va(void) {
  return (uint32_t)ISAAC_LUA_V61_VA;
}

uint32_t isaac_lua_engine_v61_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V61_RET_VA;
}

uint32_t isaac_lua_engine_v61_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V61_RET_VA - ISAAC_LUA_V61_VA);
}

int32_t isaac_lua_engine_v61_insn_count(void) {
  return (int32_t)ISAAC_LUA_V61_INSNS;
}

int32_t isaac_lua_engine_v61_check_flags(void) {
  return (int32_t)ISAAC_LUA_V61_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v61_check_edx(void) {
  return (int32_t)ISAAC_LUA_V61_CHECK_EDX;
}

uint32_t isaac_lua_engine_v61_key(void) {
  return (uint32_t)ISAAC_LUA_V61_KEY;
}

uint32_t isaac_lua_engine_v61_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V61_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v61_type_index(void) {
  return (uint32_t)ISAAC_LUA_V61_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v61_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V61_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v61_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V61_FN_OFF;
}

uint32_t isaac_lua_engine_v61_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V61_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v61_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V61_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v61_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V61_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v61_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V61_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v61_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V61_IAT_LUA_PUSHBOOLEAN;
}

int32_t isaac_lua_engine_v61_return_value(void) {
  return (int32_t)ISAAC_LUA_V61_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v61_install_va(void) {
  return (uint32_t)ISAAC_LUA_V61_INSTALL_VA;
}

uint32_t isaac_lua_engine_v61_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V61_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v61_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V61_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v61_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V61_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v61_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V61_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v62_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v62_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v62_va(void) {
  return (uint32_t)ISAAC_LUA_V62_VA;
}

uint32_t isaac_lua_engine_v62_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V62_RET_VA;
}

uint32_t isaac_lua_engine_v62_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V62_RET_VA - ISAAC_LUA_V62_VA);
}

int32_t isaac_lua_engine_v62_insn_count(void) {
  return (int32_t)ISAAC_LUA_V62_INSNS;
}

int32_t isaac_lua_engine_v62_check_flags(void) {
  return (int32_t)ISAAC_LUA_V62_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v62_check_edx(void) {
  return (int32_t)ISAAC_LUA_V62_CHECK_EDX;
}

uint32_t isaac_lua_engine_v62_key(void) {
  return (uint32_t)ISAAC_LUA_V62_KEY;
}

uint32_t isaac_lua_engine_v62_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V62_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v62_type_index(void) {
  return (uint32_t)ISAAC_LUA_V62_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v62_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V62_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v62_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V62_FN_OFF;
}

uint32_t isaac_lua_engine_v62_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V62_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v62_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V62_ARG1_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v62_arg2_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V62_ARG2_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v62_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V62_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v62_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V62_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v62_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V62_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v62_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V62_IAT_LUA_CHECKNUMBER;
}

int32_t isaac_lua_engine_v62_return_value(void) {
  return (int32_t)ISAAC_LUA_V62_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v62_install_va(void) {
  return (uint32_t)ISAAC_LUA_V62_INSTALL_VA;
}

uint32_t isaac_lua_engine_v62_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V62_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v62_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V62_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v62_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V62_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v62_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V62_INSTALL_CALLER_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v63–v66 wrapper families pure islands (incident restoration:
 * bodies mirror scripts/decomp/lua-engine-pure-model.mjs oracles)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v63_num_bosses_count(uint32_t head_field, uint32_t base_field) {
  return (uint32_t)(((int32_t)(head_field - base_field)) >> ISAAC_LUA_V63_NUM_BOSSES_STRIDE_SHIFT);
}

uint32_t isaac_lua_engine_v63_shake_countdown_ptr(uint32_t this_ptr) {
  return (uint32_t)(this_ptr + ISAAC_LUA_V63_SHAKE_COUNTDOWN_FIELD_OFF);
}

uint32_t isaac_lua_engine_v63_num_bosses_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_RET_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V63_NUM_BOSSES_RET_VA - ISAAC_LUA_V63_NUM_BOSSES_VA);
}

int32_t isaac_lua_engine_v63_num_bosses_insn_count(void) {
  return (int32_t)ISAAC_LUA_V63_NUM_BOSSES_INSNS;
}

uint32_t isaac_lua_engine_v63_num_bosses_head_off(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_HEAD_OFF;
}

uint32_t isaac_lua_engine_v63_num_bosses_base_off(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_BASE_OFF;
}

int32_t isaac_lua_engine_v63_num_bosses_stride_shift(void) {
  return (int32_t)ISAAC_LUA_V63_NUM_BOSSES_STRIDE_SHIFT;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_HELPER_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_fill_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_FILL_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_trampoline_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_TRAMPOLINE_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v63_num_bosses_install_call_va(void) {
  return (uint32_t)ISAAC_LUA_V63_NUM_BOSSES_INSTALL_CALL_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_RET_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V63_SHAKE_COUNTDOWN_RET_VA - ISAAC_LUA_V63_SHAKE_COUNTDOWN_VA);
}

int32_t isaac_lua_engine_v63_shake_countdown_insn_count(void) {
  return (int32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSNS;
}

uint32_t isaac_lua_engine_v63_shake_countdown_field_off(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_FIELD_OFF;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_HELPER_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_fill_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_FILL_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_trampoline_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_TRAMPOLINE_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v63_shake_countdown_install_call_va(void) {
  return (uint32_t)ISAAC_LUA_V63_SHAKE_COUNTDOWN_INSTALL_CALL_VA;
}

uint32_t isaac_lua_engine_v64_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v64_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v64_f32_trunc_bits(uint32_t ret_hi, uint32_t ret_lo) {
  /* `fstp dword ptr [esp+0xc]` — real_fn x87 ST0 double truncated to
   float32 (round-to-nearest-even); returned as the f32 bit pattern. */
  double d;
  {
    const uint32_t words[2] = { ret_lo, ret_hi }; /* lo, hi */
    __builtin_memcpy(&d, words, sizeof d);
  }
  const float f = (float)d;
  uint32_t bits;
  __builtin_memcpy(&bits, &f, sizeof bits);
  return bits;
}

uint32_t isaac_lua_engine_v64_va(void) {
  return (uint32_t)ISAAC_LUA_V64_VA;
}

uint32_t isaac_lua_engine_v64_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V64_RET_VA;
}

uint32_t isaac_lua_engine_v64_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V64_RET_VA - ISAAC_LUA_V64_VA);
}

int32_t isaac_lua_engine_v64_insn_count(void) {
  return (int32_t)ISAAC_LUA_V64_INSNS;
}

int32_t isaac_lua_engine_v64_check_flags(void) {
  return (int32_t)ISAAC_LUA_V64_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v64_check_edx(void) {
  return (int32_t)ISAAC_LUA_V64_CHECK_EDX;
}

uint32_t isaac_lua_engine_v64_key(void) {
  return (uint32_t)ISAAC_LUA_V64_KEY;
}

uint32_t isaac_lua_engine_v64_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V64_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v64_type_index(void) {
  return (uint32_t)ISAAC_LUA_V64_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v64_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V64_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v64_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V64_FN_OFF;
}

uint32_t isaac_lua_engine_v64_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V64_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v64_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V64_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v64_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V64_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v64_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V64_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v64_iat_lua_pushnumber(void) {
  return (uint32_t)ISAAC_LUA_V64_IAT_LUA_PUSHNUMBER;
}

int32_t isaac_lua_engine_v64_return_value(void) {
  return (int32_t)ISAAC_LUA_V64_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v64_install_va(void) {
  return (uint32_t)ISAAC_LUA_V64_INSTALL_VA;
}

uint32_t isaac_lua_engine_v64_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V64_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v64_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V64_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v64_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V64_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v64_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V64_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v65_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v65_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v65_va(void) {
  return (uint32_t)ISAAC_LUA_V65_VA;
}

uint32_t isaac_lua_engine_v65_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V65_RET_VA;
}

uint32_t isaac_lua_engine_v65_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V65_RET_VA - ISAAC_LUA_V65_VA);
}

int32_t isaac_lua_engine_v65_insn_count(void) {
  return (int32_t)ISAAC_LUA_V65_INSNS;
}

int32_t isaac_lua_engine_v65_check_flags(void) {
  return (int32_t)ISAAC_LUA_V65_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v65_check_edx(void) {
  return (int32_t)ISAAC_LUA_V65_CHECK_EDX;
}

uint32_t isaac_lua_engine_v65_key(void) {
  return (uint32_t)ISAAC_LUA_V65_KEY;
}

uint32_t isaac_lua_engine_v65_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V65_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v65_type_index(void) {
  return (uint32_t)ISAAC_LUA_V65_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v65_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V65_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v65_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V65_FN_OFF;
}

uint32_t isaac_lua_engine_v65_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V65_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v65_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V65_ARG1_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v65_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V65_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v65_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V65_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v65_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V65_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v65_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V65_IAT_LUA_CHECKNUMBER;
}

int32_t isaac_lua_engine_v65_return_value(void) {
  return (int32_t)ISAAC_LUA_V65_RETURN_VALUE;
}

int32_t isaac_lua_engine_v65_install_count(void) {
  return (int32_t)ISAAC_LUA_V65_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v65_install_a_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_A_VA;
}

uint32_t isaac_lua_engine_v65_install_a_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_A_RET_VA;
}

uint32_t isaac_lua_engine_v65_install_a_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_A_LITERAL_VA;
}

uint32_t isaac_lua_engine_v65_install_a_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_A_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v65_install_a_name_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_A_NAME_VA;
}

uint32_t isaac_lua_engine_v65_install_a_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_A_CALLER_VA;
}

uint32_t isaac_lua_engine_v65_install_b_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_B_VA;
}

uint32_t isaac_lua_engine_v65_install_b_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_B_RET_VA;
}

uint32_t isaac_lua_engine_v65_install_b_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_B_LITERAL_VA;
}

uint32_t isaac_lua_engine_v65_install_b_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_B_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v65_install_b_name_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_B_NAME_VA;
}

uint32_t isaac_lua_engine_v65_install_b_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V65_INSTALL_B_CALLER_VA;
}

uint32_t isaac_lua_engine_v66_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v66_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v66_va(void) {
  return (uint32_t)ISAAC_LUA_V66_VA;
}

uint32_t isaac_lua_engine_v66_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V66_RET_VA;
}

uint32_t isaac_lua_engine_v66_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V66_RET_VA - ISAAC_LUA_V66_VA);
}

int32_t isaac_lua_engine_v66_insn_count(void) {
  return (int32_t)ISAAC_LUA_V66_INSNS;
}

int32_t isaac_lua_engine_v66_check_flags(void) {
  return (int32_t)ISAAC_LUA_V66_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v66_check_edx(void) {
  return (int32_t)ISAAC_LUA_V66_CHECK_EDX;
}

uint32_t isaac_lua_engine_v66_key(void) {
  return (uint32_t)ISAAC_LUA_V66_KEY;
}

uint32_t isaac_lua_engine_v66_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V66_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v66_type_index(void) {
  return (uint32_t)ISAAC_LUA_V66_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v66_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V66_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v66_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V66_FN_OFF;
}

uint32_t isaac_lua_engine_v66_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V66_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v66_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V66_ARG1_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v66_arg2_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V66_ARG2_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v66_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V66_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v66_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V66_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v66_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V66_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v66_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V66_IAT_LUA_CHECKNUMBER;
}

int32_t isaac_lua_engine_v66_return_value(void) {
  return (int32_t)ISAAC_LUA_V66_RETURN_VALUE;
}

int32_t isaac_lua_engine_v66_install_count(void) {
  return (int32_t)ISAAC_LUA_V66_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v66_install_va(void) {
  return (uint32_t)ISAAC_LUA_V66_INSTALL_VA;
}

uint32_t isaac_lua_engine_v66_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V66_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v66_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V66_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v66_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V66_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v66_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V66_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v66_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V66_INSTALL_CALLER_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v67 audio band (queue/fadeout/pause/enablelayer/islayerenabled/
 * isenabled/volumeslide/getcurrentmusicid) pure islands (incident
 * restoration: bodies mirror scripts/decomp/lua-engine-pure-model.mjs)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v67_queue_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_queue_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v67_queue_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_VA;
}

uint32_t isaac_lua_engine_v67_queue_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_RET_VA;
}

uint32_t isaac_lua_engine_v67_queue_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_QUEUE_RET_VA - ISAAC_LUA_V67_QUEUE_VA);
}

int32_t isaac_lua_engine_v67_queue_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_QUEUE_INSNS;
}

int32_t isaac_lua_engine_v67_queue_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_QUEUE_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_queue_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_QUEUE_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_queue_key(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_KEY;
}

uint32_t isaac_lua_engine_v67_queue_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_queue_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_queue_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_queue_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_FN_OFF;
}

uint32_t isaac_lua_engine_v67_queue_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_queue_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_queue_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v67_queue_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_IAT_LUA_CHECKINTEGER;
}

int32_t isaac_lua_engine_v67_queue_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_QUEUE_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_queue_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_QUEUE_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_queue_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_queue_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_queue_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_queue_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_queue_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_queue_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_QUEUE_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_fadeout_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_RET_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_FADEOUT_RET_VA - ISAAC_LUA_V67_FADEOUT_VA);
}

int32_t isaac_lua_engine_v67_fadeout_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_FADEOUT_INSNS;
}

int32_t isaac_lua_engine_v67_fadeout_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_FADEOUT_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_fadeout_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_FADEOUT_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_fadeout_key(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_KEY;
}

uint32_t isaac_lua_engine_v67_fadeout_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_fadeout_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_fadeout_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_fadeout_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_FN_OFF;
}

uint32_t isaac_lua_engine_v67_fadeout_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_ARG1_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_fadeout_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_fadeout_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v67_fadeout_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_IAT_LUA_CHECKNUMBER;
}

int32_t isaac_lua_engine_v67_fadeout_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_FADEOUT_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_fadeout_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_fadeout_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_fadeout_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_FADEOUT_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_pause_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_pause_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_VA;
}

uint32_t isaac_lua_engine_v67_pause_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_RET_VA;
}

uint32_t isaac_lua_engine_v67_pause_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_PAUSE_RET_VA - ISAAC_LUA_V67_PAUSE_VA);
}

int32_t isaac_lua_engine_v67_pause_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_PAUSE_INSNS;
}

int32_t isaac_lua_engine_v67_pause_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_PAUSE_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_pause_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_PAUSE_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_pause_key(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_KEY;
}

uint32_t isaac_lua_engine_v67_pause_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_pause_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_pause_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_pause_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_FN_OFF;
}

uint32_t isaac_lua_engine_v67_pause_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_pause_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v67_pause_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_PAUSE_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_pause_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_PAUSE_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_pause_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_pause_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_pause_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_pause_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_pause_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_pause_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_PAUSE_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_enablelayer_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v67_enablelayer_bool_word(uint32_t toboolean_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return toboolean_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v67_enablelayer_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_RET_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_ENABLELAYER_RET_VA - ISAAC_LUA_V67_ENABLELAYER_VA);
}

int32_t isaac_lua_engine_v67_enablelayer_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_ENABLELAYER_INSNS;
}

int32_t isaac_lua_engine_v67_enablelayer_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_ENABLELAYER_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_enablelayer_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_ENABLELAYER_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_enablelayer_key(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_KEY;
}

uint32_t isaac_lua_engine_v67_enablelayer_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_enablelayer_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_enablelayer_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_enablelayer_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_FN_OFF;
}

uint32_t isaac_lua_engine_v67_enablelayer_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_enablelayer_arg1_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_ARG1_TOBOOLEAN_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_TOBOOLEAN;
}

uint32_t isaac_lua_engine_v67_enablelayer_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_IAT_LUA_CHECKINTEGER;
}

int32_t isaac_lua_engine_v67_enablelayer_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_ENABLELAYER_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_enablelayer_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_enablelayer_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_enablelayer_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ENABLELAYER_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_islayerenabled_int_word(uint32_t checkint_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)checkint_result;
}

uint32_t isaac_lua_engine_v67_islayerenabled_return_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v67_islayerenabled_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_RET_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_ISLAYERENABLED_RET_VA - ISAAC_LUA_V67_ISLAYERENABLED_VA);
}

int32_t isaac_lua_engine_v67_islayerenabled_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSNS;
}

int32_t isaac_lua_engine_v67_islayerenabled_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_ISLAYERENABLED_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_islayerenabled_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_ISLAYERENABLED_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_islayerenabled_key(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_KEY;
}

uint32_t isaac_lua_engine_v67_islayerenabled_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_islayerenabled_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_islayerenabled_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_islayerenabled_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_FN_OFF;
}

uint32_t isaac_lua_engine_v67_islayerenabled_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v67_islayerenabled_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_IAT_LUA_PUSHBOOLEAN;
}

int32_t isaac_lua_engine_v67_islayerenabled_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_ISLAYERENABLED_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_islayerenabled_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_islayerenabled_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_islayerenabled_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISLAYERENABLED_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_isenabled_return_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v67_isenabled_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_RET_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_ISENABLED_RET_VA - ISAAC_LUA_V67_ISENABLED_VA);
}

int32_t isaac_lua_engine_v67_isenabled_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_ISENABLED_INSNS;
}

int32_t isaac_lua_engine_v67_isenabled_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_ISENABLED_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_isenabled_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_ISENABLED_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_isenabled_key(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_KEY;
}

uint32_t isaac_lua_engine_v67_isenabled_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_isenabled_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_isenabled_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_isenabled_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_FN_OFF;
}

uint32_t isaac_lua_engine_v67_isenabled_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_isenabled_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v67_isenabled_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_IAT_LUA_PUSHBOOLEAN;
}

int32_t isaac_lua_engine_v67_isenabled_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_ISENABLED_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_isenabled_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_isenabled_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_isenabled_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_ISENABLED_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_volumeslide_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_RET_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_VOLUMESLIDE_RET_VA - ISAAC_LUA_V67_VOLUMESLIDE_VA);
}

int32_t isaac_lua_engine_v67_volumeslide_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSNS;
}

int32_t isaac_lua_engine_v67_volumeslide_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_VOLUMESLIDE_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_volumeslide_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_VOLUMESLIDE_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_volumeslide_key(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_KEY;
}

uint32_t isaac_lua_engine_v67_volumeslide_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_volumeslide_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_volumeslide_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_volumeslide_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_FN_OFF;
}

uint32_t isaac_lua_engine_v67_volumeslide_arg1_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_ARG1_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_volumeslide_arg2_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_ARG2_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_volumeslide_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_volumeslide_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v67_volumeslide_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_IAT_LUA_CHECKNUMBER;
}

int32_t isaac_lua_engine_v67_volumeslide_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_VOLUMESLIDE_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_volumeslide_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_volumeslide_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_volumeslide_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_VOLUMESLIDE_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_object_resolve(uint32_t type_result, uint32_t check_field) {
  /* FULL-WORD lua_type gate (`test eax,eax`): nil -> 0, else check_field; never byte-masked. */
  return type_result != 0u ? check_field : 0u;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_result_word(uint32_t real_fn_result) {
  /* checkinteger FULL WORD passthrough (`push eax`); never masked. */
  return (uint32_t)real_fn_result;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_RET_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V67_GETCURRENTMUSICID_RET_VA - ISAAC_LUA_V67_GETCURRENTMUSICID_VA);
}

int32_t isaac_lua_engine_v67_getcurrentmusicid_insn_count(void) {
  return (int32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSNS;
}

int32_t isaac_lua_engine_v67_getcurrentmusicid_check_flags(void) {
  return (int32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_CHECK_FLAGS;
}

int32_t isaac_lua_engine_v67_getcurrentmusicid_check_edx(void) {
  return (int32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_CHECK_EDX;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_key(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_KEY;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_object_field_off(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_OBJECT_FIELD_OFF;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_type_index(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_TYPE_INDEX;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_FN_OFF;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_sext_push_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_SEXT_PUSH_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_IAT_LUA_TYPE;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v67_getcurrentmusicid_return_value(void) {
  return (int32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_RETURN_VALUE;
}

int32_t isaac_lua_engine_v67_getcurrentmusicid_install_count(void) {
  return (int32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v67_getcurrentmusicid_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V67_GETCURRENTMUSICID_INSTALL_CALLER_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v68 entity/manager band (game0/getbuiltincallbackstate/buttons/
 * getromentities/music+sfx managers/randomvector) pure islands (incident
 * restoration: bodies mirror scripts/decomp/lua-engine-pure-model.mjs)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v68_game0_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_GAME0_RET_VA - ISAAC_LUA_V68_GAME0_VA);
}

uint32_t isaac_lua_engine_v68_game0_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_FN_OFF;
}

uint32_t isaac_lua_engine_v68_game0_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v68_game0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v68_game0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v68_game0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_game0_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_GAME0_INSNS;
}

uint32_t isaac_lua_engine_v68_game0_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_game0_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_GAME0_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_game0_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_game0_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_game0_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_game0_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_game0_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_game0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v68_game0_null_gate(uint32_t real_fn_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return real_fn_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v68_game0_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v68_game0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_game0_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_RET_VA;
}

int32_t isaac_lua_engine_v68_game0_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_GAME0_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_game0_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_game0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_game0_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v68_game0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v68_game0_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GAME0_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_RET_VA - ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_VA);
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_FN_OFF;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_PUSHBOOLEAN;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_getbuiltincallbackstate_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSNS;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_RET_VA;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_return_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_v68_getbuiltincallbackstate_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_stack_align_mask(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_STACK_ALIGN_MASK;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getbuiltincallbackstate_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUILTINCALLBACKSTATE_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_arg1_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_ARG1_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_GETBUTTONVALUE_RET_VA - ISAAC_LUA_V68_GETBUTTONVALUE_VA);
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_f32_slot_off(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_F32_SLOT_OFF_U32;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_FN_OFF;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_getbuttonvalue_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSNS;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_getbuttonvalue_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_number_push_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_NUMBER_PUSH_VA;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_RET_VA;
}

int32_t isaac_lua_engine_v68_getbuttonvalue_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_GETBUTTONVALUE_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getbuttonvalue_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETBUTTONVALUE_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_GETROOMENTITIES_RET_VA - ISAAC_LUA_V68_GETROOMENTITIES_VA);
}

uint32_t isaac_lua_engine_v68_getromentities_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_FN_OFF;
}

uint32_t isaac_lua_engine_v68_getromentities_iat_lua_lual_unref(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_IAT_LUA_LUAL_UNREF;
}

uint32_t isaac_lua_engine_v68_getromentities_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_getromentities_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSNS;
}

uint32_t isaac_lua_engine_v68_getromentities_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_getromentities_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_getromentities_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_rawgeti_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_RAWGETI_HELPER_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_registry_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getromentities_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_RET_VA;
}

int32_t isaac_lua_engine_v68_getromentities_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_GETROOMENTITIES_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_getromentities_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_getromentities_va(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_VA;
}

uint32_t isaac_lua_engine_v68_getromentities_vec_off_lo(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_VEC_OFF_LO_U32;
}

uint32_t isaac_lua_engine_v68_getromentities_vec_off_ref(void) {
  return (uint32_t)ISAAC_LUA_V68_GETROOMENTITIES_VEC_OFF_REF_U32;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_arg0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_ARG0_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_arg1_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_ARG1_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_ISBUTTONTRIGGERED_RET_VA - ISAAC_LUA_V68_ISBUTTONTRIGGERED_VA);
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_FN_OFF;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_CHECKINTEGER;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_PUSHBOOLEAN;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_isbuttontriggered_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSNS;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_isbuttontriggered_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_RET_VA;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_return_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_v68_isbuttontriggered_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_isbuttontriggered_va(void) {
  return (uint32_t)ISAAC_LUA_V68_ISBUTTONTRIGGERED_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_MUSICMANAGER_RET_VA - ISAAC_LUA_V68_MUSICMANAGER_VA);
}

uint32_t isaac_lua_engine_v68_musicmanager_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_FN_OFF;
}

uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v68_musicmanager_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_musicmanager_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_MUSICMANAGER_INSNS;
}

uint32_t isaac_lua_engine_v68_musicmanager_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_musicmanager_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_musicmanager_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v68_musicmanager_null_gate(uint32_t real_fn_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return real_fn_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v68_musicmanager_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v68_musicmanager_registry_index(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_musicmanager_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_RET_VA;
}

int32_t isaac_lua_engine_v68_musicmanager_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_MUSICMANAGER_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_musicmanager_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_musicmanager_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_musicmanager_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v68_musicmanager_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v68_musicmanager_va(void) {
  return (uint32_t)ISAAC_LUA_V68_MUSICMANAGER_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_RANDOMVECTOR_RET_VA - ISAAC_LUA_V68_RANDOMVECTOR_VA);
}

uint32_t isaac_lua_engine_v68_randomvector_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_FN_OFF;
}

uint32_t isaac_lua_engine_v68_randomvector_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v68_randomvector_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v68_randomvector_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v68_randomvector_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_randomvector_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSNS;
}

uint32_t isaac_lua_engine_v68_randomvector_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_randomvector_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_randomvector_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v68_randomvector_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v68_randomvector_registry_index(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_randomvector_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_RET_VA;
}

int32_t isaac_lua_engine_v68_randomvector_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_RANDOMVECTOR_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_randomvector_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_randomvector_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_randomvector_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_UD_PAYLOAD_OFF;
}

uint32_t isaac_lua_engine_v68_randomvector_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v68_randomvector_va(void) {
  return (uint32_t)ISAAC_LUA_V68_RANDOMVECTOR_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V68_SFXMANAGER_RET_VA - ISAAC_LUA_V68_SFXMANAGER_VA);
}

uint32_t isaac_lua_engine_v68_sfxmanager_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_FN_OFF;
}

uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v68_sfxmanager_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v68_sfxmanager_insn_count(void) {
  return (int32_t)ISAAC_LUA_V68_SFXMANAGER_INSNS;
}

uint32_t isaac_lua_engine_v68_sfxmanager_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v68_sfxmanager_install_count(void) {
  return (int32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v68_sfxmanager_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_install_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_INSTALL_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v68_sfxmanager_null_gate(uint32_t real_fn_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return real_fn_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v68_sfxmanager_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v68_sfxmanager_registry_index(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_sfxmanager_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_RET_VA;
}

int32_t isaac_lua_engine_v68_sfxmanager_return_value(void) {
  return (int32_t)ISAAC_LUA_V68_SFXMANAGER_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v68_sfxmanager_setmeta_index(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_sfxmanager_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v68_sfxmanager_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v68_sfxmanager_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v68_sfxmanager_va(void) {
  return (uint32_t)ISAAC_LUA_V68_SFXMANAGER_VA;
}


/* ---------------------------------------------------------------------------
 * ABI v69 moddata/text band (getbyname/gettextwidth/debugstring/
 * executecommand/getplayertypebyname/spawn/gridspawn/rendertext/
 * updatestrangeattractor + moddata quintet) pure islands (incident
 * restoration: bodies mirror scripts/decomp/lua-engine-pure-model.mjs)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v69_getbyname_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_RET_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_GETBYNAME_RET_VA - ISAAC_LUA_V69_GETBYNAME_VA);
}

int32_t isaac_lua_engine_v69_getbyname_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETBYNAME_INSNS;
}

uint32_t isaac_lua_engine_v69_getbyname_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_getbyname_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_FN_OFF;
}

uint32_t isaac_lua_engine_v69_getbyname_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_getbyname_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_GETBYNAME_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_getbyname_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_getbyname_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_check_string_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_CHECK_STRING_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_getbyname_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_getbyname_pusher_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_PUSHER_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_pusher_row(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_PUSHER_ROW;
}

uint32_t isaac_lua_engine_v69_getbyname_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_getbyname_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETBYNAME_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v69_getbyname_site_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETBYNAME_SITE_COUNT;
}

uint32_t isaac_lua_engine_v69_getbyname_site_caller_va_at(int32_t index) {
  static const uint32_t kVas[] = {
    ISAAC_LUA_V69_GETBYNAME_SITE_0_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_1_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_2_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_3_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_4_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_5_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_6_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_7_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_8_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_9_CALLER_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_10_CALLER_VA,
  };
  return (index >= 0 && index < (int32_t)(sizeof(kVas) / sizeof(kVas[0]))) ? kVas[index] : 0u;
}

uint32_t isaac_lua_engine_v69_getbyname_site_real_fn_va_at(int32_t index) {
  static const uint32_t kVas[] = {
    ISAAC_LUA_V69_GETBYNAME_SITE_0_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_1_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_2_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_3_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_4_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_5_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_6_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_7_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_8_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_9_REAL_FN_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_10_REAL_FN_VA,
  };
  return (index >= 0 && index < (int32_t)(sizeof(kVas) / sizeof(kVas[0]))) ? kVas[index] : 0u;
}

uint32_t isaac_lua_engine_v69_getbyname_site_name_va_at(int32_t index) {
  static const uint32_t kVas[] = {
    ISAAC_LUA_V69_GETBYNAME_SITE_0_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_1_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_2_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_3_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_4_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_5_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_6_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_7_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_8_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_9_NAME_VA,
    ISAAC_LUA_V69_GETBYNAME_SITE_10_NAME_VA,
  };
  return (index >= 0 && index < (int32_t)(sizeof(kVas) / sizeof(kVas[0]))) ? kVas[index] : 0u;
}

uint32_t isaac_lua_engine_v69_gettextwidth_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_RET_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_GETTEXTWIDTH_RET_VA - ISAAC_LUA_V69_GETTEXTWIDTH_VA);
}

int32_t isaac_lua_engine_v69_gettextwidth_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSNS;
}

uint32_t isaac_lua_engine_v69_gettextwidth_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gettextwidth_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_FN_OFF;
}

uint32_t isaac_lua_engine_v69_gettextwidth_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_gettextwidth_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_GETTEXTWIDTH_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_gettextwidth_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_gettextwidth_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_check_string_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_CHECK_STRING_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_gettextwidth_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_gettextwidth_pusher_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_PUSHER_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_pusher_row(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_PUSHER_ROW;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_a_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_a_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_RET_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_a_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_a_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_a_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_NAME_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_a_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_A_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_b_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_b_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_RET_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_b_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_b_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_b_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_NAME_VA;
}

uint32_t isaac_lua_engine_v69_gettextwidth_install_b_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETTEXTWIDTH_INSTALL_B_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_RET_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_DEBUGSTRING_RET_VA - ISAAC_LUA_V69_DEBUGSTRING_VA);
}

int32_t isaac_lua_engine_v69_debugstring_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_DEBUGSTRING_INSNS;
}

uint32_t isaac_lua_engine_v69_debugstring_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_debugstring_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_FN_OFF;
}

uint32_t isaac_lua_engine_v69_debugstring_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_debugstring_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_DEBUGSTRING_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_debugstring_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_debugstring_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_check_string_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_CHECK_STRING_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_debugstring_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_debugstring_pusher_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_PUSHER_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_pusher_row(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_PUSHER_ROW;
}

uint32_t isaac_lua_engine_v69_debugstring_install_a_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_a_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_RET_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_a_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_a_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_a_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_NAME_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_a_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_A_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_b_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_b_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_RET_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_b_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_b_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_b_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_NAME_VA;
}

uint32_t isaac_lua_engine_v69_debugstring_install_b_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_DEBUGSTRING_INSTALL_B_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_RET_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_EXECUTECOMMAND_RET_VA - ISAAC_LUA_V69_EXECUTECOMMAND_VA);
}

int32_t isaac_lua_engine_v69_executecommand_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSNS;
}

uint32_t isaac_lua_engine_v69_executecommand_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_executecommand_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_FN_OFF;
}

uint32_t isaac_lua_engine_v69_executecommand_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_executecommand_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_EXECUTECOMMAND_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_executecommand_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_executecommand_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_check_string_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_CHECK_STRING_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_executecommand_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_executecommand_iat_lua_pushlstring(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_IAT_LUA_PUSHLSTRING;
}

uint32_t isaac_lua_engine_v69_executecommand_sso_cap_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_SSO_CAP_U32;
}

uint32_t isaac_lua_engine_v69_executecommand_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_executecommand_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_EXECUTECOMMAND_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_arg1_gate(uint32_t toboolean_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (toboolean_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_arg1_word_lane(uint32_t gate, uint32_t spill) {
  /* 16-bit copy law `mov ax,[ebp-0x46]`: low byte = gate, high byte =
   [ebp-0x45] residue. */
  return (uint32_t)(((gate & 0xffu) | ((spill & 0xffu) << 8)) & 0xffffu);
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_RET_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_RET_VA - ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_VA);
}

int32_t isaac_lua_engine_v69_getplayertypebyname_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSNS;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_FN_OFF;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_getplayertypebyname_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_getplayertypebyname_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_checklstring_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_IAT_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_checklstring_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_CHECKLSTRING_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_string_assign_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_STRING_ASSIGN_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_toboolean_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_IAT_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_toboolean_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_TOBOOLEAN_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_byte_gate_off_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_BYTE_GATE_OFF_U32;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_word_slot_off_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_WORD_SLOT_OFF_U32;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_pusher_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_pusher_row(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_PUSHER_ROW;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_DTOR_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_getplayertypebyname_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GETPLAYERTYPEBYNAME_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_spawn_null_gate(uint32_t real_fn_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return real_fn_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_spawn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_VA;
}

uint32_t isaac_lua_engine_v69_spawn_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_RET_VA;
}

uint32_t isaac_lua_engine_v69_spawn_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_SPAWN_RET_VA - ISAAC_LUA_V69_SPAWN_VA);
}

int32_t isaac_lua_engine_v69_spawn_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_SPAWN_INSNS;
}

uint32_t isaac_lua_engine_v69_spawn_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_spawn_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_FN_OFF;
}

uint32_t isaac_lua_engine_v69_spawn_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_spawn_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_SPAWN_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_spawn_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_SPAWN_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_spawn_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_spawn_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_spawn_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_spawn_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v69_spawn_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v69_spawn_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v69_spawn_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v69_spawn_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_spawn_setmeta_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_spawn_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v69_spawn_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v69_spawn_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v69_spawn_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_IAT_LUA_PUSHNIL;
}

uint32_t isaac_lua_engine_v69_spawn_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_spawn_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_spawn_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_spawn_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_spawn_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_spawn_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SPAWN_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_null_gate(uint32_t real_fn_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return real_fn_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_gridspawn_has_arg4_gate(uint32_t toboolean_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (toboolean_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_gridspawn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_RET_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_GRIDSPAWN_RET_VA - ISAAC_LUA_V69_GRIDSPAWN_VA);
}

int32_t isaac_lua_engine_v69_gridspawn_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_GRIDSPAWN_INSNS;
}

uint32_t isaac_lua_engine_v69_gridspawn_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_FN_OFF;
}

uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_gridspawn_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_GRIDSPAWN_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_gridspawn_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_gridspawn_toboolean_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_TOBOOLEAN_IAT_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_toboolean_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_TOBOOLEAN_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_checkinteger_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_CHECKINTEGER_IAT_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_arg1_checkinteger_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_ARG1_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_arg2_checkinteger_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_ARG2_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_getargobject_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_GETARGOBJECT_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_getargobject_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_GETARGOBJECT_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_gridspawn_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_gridspawn_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v69_gridspawn_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v69_gridspawn_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v69_gridspawn_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_setmeta_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v69_gridspawn_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_IAT_LUA_PUSHNIL;
}

uint32_t isaac_lua_engine_v69_gridspawn_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_gridspawn_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_GRIDSPAWN_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_f32_lane_bits(uint32_t double_lo, uint32_t double_hi) {
  /* (float)luaL_checknumber lane `fstp dword` after IAT 0xb18324:
   f64 bit lanes -> f32 bit pattern (round-to-nearest-even). */
  double d;
  {
    const uint32_t words[2] = { double_lo, double_hi }; /* lo, hi */
    __builtin_memcpy(&d, words, sizeof d);
  }
  const float f = (float)d;
  uint32_t bits;
  __builtin_memcpy(&bits, &f, sizeof bits);
  return bits;
}

uint32_t isaac_lua_engine_v69_rendertext_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_RET_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_RENDERTEXT_RET_VA - ISAAC_LUA_V69_RENDERTEXT_VA);
}

int32_t isaac_lua_engine_v69_rendertext_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_RENDERTEXT_INSNS;
}

uint32_t isaac_lua_engine_v69_rendertext_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_rendertext_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_FN_OFF;
}

uint32_t isaac_lua_engine_v69_rendertext_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_rendertext_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_RENDERTEXT_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_rendertext_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_rendertext_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_checklstring_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_CHECKLSTRING_IAT_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_checklstring_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_CHECKLSTRING_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_rendertext_string_assign_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_STRING_ASSIGN_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_DTOR_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_rendertext_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_rendertext_checknumber_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_CHECKNUMBER_IAT_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_float_lane_first_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_FLOAT_LANE_FIRST_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_rendertext_float_lane_count(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_FLOAT_LANE_COUNT;
}

uint32_t isaac_lua_engine_v69_rendertext_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_rendertext_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_RENDERTEXT_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_f32_lane_bits(uint32_t double_lo, uint32_t double_hi) {
  /* (float)luaL_checknumber lane `fstp dword` after IAT 0xb18324:
   f64 bit lanes -> f32 bit pattern (round-to-nearest-even). */
  double d;
  {
    const uint32_t words[2] = { double_lo, double_hi }; /* lo, hi */
    __builtin_memcpy(&d, words, sizeof d);
  }
  const float f = (float)d;
  uint32_t bits;
  __builtin_memcpy(&bits, &f, sizeof bits);
  return bits;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_RET_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_RET_VA - ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_VA);
}

int32_t isaac_lua_engine_v69_updatestrangeattractor_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSNS;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_FN_OFF;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_updatestrangeattractor_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_updatestrangeattractor_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_CHECK_HELPER_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg1_check_edx_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_EDX_U32;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg1_check_key(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG1_CHECK_KEY;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_getargobject_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_GETARGOBJECT_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg2_getargobject_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG2_GETARGOBJECT_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_checknumber_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_CHECKNUMBER_IAT_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg3_lane_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG3_LANE_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_arg4_lane_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_ARG4_LANE_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_updatestrangeattractor_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_UPDATESTRANGEATTRACTOR_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_refnil_gate(int32_t ref) {
  /* LUA_REFNIL gate (`cmp ref,-1; je`). Param is int32_t; -1 == LUA_REFNIL. */
  return ref == -1 ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_removemoddata_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_RET_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_REMOVEMODDATA_RET_VA - ISAAC_LUA_V69_REMOVEMODDATA_VA);
}

int32_t isaac_lua_engine_v69_removemoddata_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSNS;
}

uint32_t isaac_lua_engine_v69_removemoddata_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_removemoddata_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_FN_OFF;
}

uint32_t isaac_lua_engine_v69_removemoddata_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_removemoddata_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_REMOVEMODDATA_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_removemoddata_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_removemoddata_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_rawgeti_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_RAWGETI_HELPER_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_lual_ref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_LUAL_REF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_lual_unref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_LUAL_UNREF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_removemoddata_refnil_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_REFNIL_U32;
}

uint32_t isaac_lua_engine_v69_removemoddata_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_removemoddata_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_removemoddata_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_removemoddata_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_REMOVEMODDATA_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_return_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_hashmoddata_refnil_gate(int32_t ref) {
  /* LUA_REFNIL gate (`cmp ref,-1; je`). Param is int32_t; -1 == LUA_REFNIL. */
  return ref == -1 ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_hashmoddata_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_RET_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_HASHMODDATA_RET_VA - ISAAC_LUA_V69_HASHMODDATA_VA);
}

int32_t isaac_lua_engine_v69_hashmoddata_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_HASHMODDATA_INSNS;
}

uint32_t isaac_lua_engine_v69_hashmoddata_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_hashmoddata_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_FN_OFF;
}

uint32_t isaac_lua_engine_v69_hashmoddata_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_hashmoddata_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_HASHMODDATA_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_hashmoddata_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_hashmoddata_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_rawgeti_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_RAWGETI_HELPER_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_lual_ref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_LUAL_REF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_lual_unref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_LUAL_UNREF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_hashmoddata_refnil_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_REFNIL_U32;
}

uint32_t isaac_lua_engine_v69_hashmoddata_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_hashmoddata_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_hashmoddata_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_IAT_LUA_PUSHBOOLEAN;
}

uint32_t isaac_lua_engine_v69_hashmoddata_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_hashmoddata_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_HASHMODDATA_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_refnil_gate(int32_t ref) {
  /* LUA_REFNIL gate (`cmp ref,-1; je`). Param is int32_t; -1 == LUA_REFNIL. */
  return ref == -1 ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_loadmoddata_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_RET_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_LOADMODDATA_RET_VA - ISAAC_LUA_V69_LOADMODDATA_VA);
}

int32_t isaac_lua_engine_v69_loadmoddata_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_LOADMODDATA_INSNS;
}

uint32_t isaac_lua_engine_v69_loadmoddata_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_loadmoddata_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_FN_OFF;
}

uint32_t isaac_lua_engine_v69_loadmoddata_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_loadmoddata_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_LOADMODDATA_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_loadmoddata_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_loadmoddata_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_rawgeti_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_RAWGETI_HELPER_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_lual_ref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_LUAL_REF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_lual_unref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_LUAL_UNREF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_loadmoddata_refnil_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_REFNIL_U32;
}

uint32_t isaac_lua_engine_v69_loadmoddata_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_loadmoddata_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_loadmoddata_iat_lua_pushlstring(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_IAT_LUA_PUSHLSTRING;
}

uint32_t isaac_lua_engine_v69_loadmoddata_sso_cap_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_SSO_CAP_U32;
}

uint32_t isaac_lua_engine_v69_loadmoddata_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_loadmoddata_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_LOADMODDATA_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_refnil_gate(int32_t ref) {
  /* LUA_REFNIL gate (`cmp ref,-1; je`). Param is int32_t; -1 == LUA_REFNIL. */
  return ref == -1 ? 1 : 0;
}

uint32_t isaac_lua_engine_v69_savemoddata_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_RET_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V69_SAVEMODDATA_RET_VA - ISAAC_LUA_V69_SAVEMODDATA_VA);
}

int32_t isaac_lua_engine_v69_savemoddata_insn_count(void) {
  return (int32_t)ISAAC_LUA_V69_SAVEMODDATA_INSNS;
}

uint32_t isaac_lua_engine_v69_savemoddata_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_savemoddata_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_FN_OFF;
}

uint32_t isaac_lua_engine_v69_savemoddata_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v69_savemoddata_return_value(void) {
  return (int32_t)ISAAC_LUA_V69_SAVEMODDATA_RETURN_VALUE;
}

int32_t isaac_lua_engine_v69_savemoddata_install_count(void) {
  return (int32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v69_savemoddata_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_BUILDER_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_rawgeti_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_RAWGETI_HELPER_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_lual_ref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_LUAL_REF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_lual_unref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_LUAL_UNREF_IAT_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v69_savemoddata_refnil_u32(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_REFNIL_U32;
}

uint32_t isaac_lua_engine_v69_savemoddata_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v69_savemoddata_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v69_savemoddata_pushvalue_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_PUSHVALUE_IAT_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_install_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v69_savemoddata_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V69_SAVEMODDATA_INSTALL_CALLER_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v70 world/mod band (screentoworld/getmouseposition/getitemconfig/
 * getfreenearposition/registermod/renderscaledtext) pure islands (incident
 * restoration: bodies mirror scripts/decomp/lua-engine-pure-model.mjs)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v70_getfreenearposition_arg2_checknumber_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_ARG2_CHECKNUMBER_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V70_GETFREENEARPOSITION_RET_VA - ISAAC_LUA_V70_GETFREENEARPOSITION_VA);
}

uint32_t isaac_lua_engine_v70_getfreenearposition_checknumber_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_CHECKNUMBER_IAT_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_FN_OFF;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_getargobject_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_getargobject_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_GETARGOBJECT_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v70_getfreenearposition_insn_count(void) {
  return (int32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSNS;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v70_getfreenearposition_install_count(void) {
  return (int32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_install_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_INSTALL_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_RET_VA;
}

int32_t isaac_lua_engine_v70_getfreenearposition_return_value(void) {
  return (int32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_setmeta_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v70_getfreenearposition_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETFREENEARPOSITION_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V70_GETITEMCONFIG_RET_VA - ISAAC_LUA_V70_GETITEMCONFIG_VA);
}

uint32_t isaac_lua_engine_v70_getitemconfig_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_FN_OFF;
}

uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_PUSHNIL;
}

uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v70_getitemconfig_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v70_getitemconfig_insn_count(void) {
  return (int32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSNS;
}

uint32_t isaac_lua_engine_v70_getitemconfig_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v70_getitemconfig_install_count(void) {
  return (int32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v70_getitemconfig_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_install_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_INSTALL_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v70_getitemconfig_nil_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_NIL_RET_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_null_gate(uint32_t real_fn_result) {
  /* FULL-WORD gate (`test reg,reg`); never masked. */
  return real_fn_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v70_getitemconfig_null_gate_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_NULL_GATE_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v70_getitemconfig_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v70_getitemconfig_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v70_getitemconfig_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getitemconfig_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_RET_VA;
}

int32_t isaac_lua_engine_v70_getitemconfig_return_value(void) {
  return (int32_t)ISAAC_LUA_V70_GETITEMCONFIG_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v70_getitemconfig_setmeta_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getitemconfig_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getitemconfig_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v70_getitemconfig_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v70_getitemconfig_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETITEMCONFIG_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V70_GETMOUSEPOSITION_RET_VA - ISAAC_LUA_V70_GETMOUSEPOSITION_VA);
}

uint32_t isaac_lua_engine_v70_getmouseposition_bool_gate(uint32_t toboolean_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (toboolean_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v70_getmouseposition_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_FN_OFF;
}

uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOBOOLEAN;
}

uint32_t isaac_lua_engine_v70_getmouseposition_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v70_getmouseposition_insn_count(void) {
  return (int32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSNS;
}

uint32_t isaac_lua_engine_v70_getmouseposition_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v70_getmouseposition_install_count(void) {
  return (int32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v70_getmouseposition_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_install_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_INSTALL_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v70_getmouseposition_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v70_getmouseposition_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v70_getmouseposition_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v70_getmouseposition_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getmouseposition_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_RET_VA;
}

int32_t isaac_lua_engine_v70_getmouseposition_return_value(void) {
  return (int32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v70_getmouseposition_setmeta_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getmouseposition_toboolean_gate_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_GATE_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_toboolean_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_TOBOOLEAN_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getmouseposition_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_getmouseposition_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v70_getmouseposition_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v70_getmouseposition_va(void) {
  return (uint32_t)ISAAC_LUA_V70_GETMOUSEPOSITION_VA;
}

uint32_t isaac_lua_engine_v70_registermod_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V70_REGISTERMOD_RET_VA - ISAAC_LUA_V70_REGISTERMOD_VA);
}

uint32_t isaac_lua_engine_v70_registermod_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_BUILDER_VA;
}

uint32_t isaac_lua_engine_v70_registermod_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_FN_OFF;
}

uint32_t isaac_lua_engine_v70_registermod_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v70_registermod_insn_count(void) {
  return (int32_t)ISAAC_LUA_V70_REGISTERMOD_INSNS;
}

uint32_t isaac_lua_engine_v70_registermod_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v70_registermod_install_count(void) {
  return (int32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v70_registermod_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v70_registermod_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v70_registermod_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v70_registermod_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v70_registermod_install_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_INSTALL_VA;
}

uint32_t isaac_lua_engine_v70_registermod_lual_ref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_LUAL_REF_IAT_VA;
}

uint32_t isaac_lua_engine_v70_registermod_lual_unref_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_LUAL_UNREF_IAT_VA;
}

uint32_t isaac_lua_engine_v70_registermod_pushvalue_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_PUSHVALUE_IAT_VA;
}

uint32_t isaac_lua_engine_v70_registermod_rawgeti_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_RAWGETI_HELPER_VA;
}

uint32_t isaac_lua_engine_v70_registermod_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v70_registermod_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v70_registermod_refnil_gate(int32_t ref) {
  /* LUA_REFNIL gate (`cmp ref,-1; je`). Param is int32_t; -1 == LUA_REFNIL. */
  return ref == -1 ? 1 : 0;
}

uint32_t isaac_lua_engine_v70_registermod_refnil_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_REFNIL_U32;
}

uint32_t isaac_lua_engine_v70_registermod_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_registermod_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_RET_VA;
}

int32_t isaac_lua_engine_v70_registermod_return_value(void) {
  return (int32_t)ISAAC_LUA_V70_REGISTERMOD_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v70_registermod_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v70_registermod_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v70_registermod_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v70_registermod_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_registermod_va(void) {
  return (uint32_t)ISAAC_LUA_V70_REGISTERMOD_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V70_RENDERSCALEDTEXT_RET_VA - ISAAC_LUA_V70_RENDERSCALEDTEXT_VA);
}

uint32_t isaac_lua_engine_v70_renderscaledtext_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_BUILDER_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_checklstring_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_IAT_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_checklstring_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_CHECKLSTRING_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_float_lane_count(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_FLOAT_LANE_COUNT;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_FN_OFF;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v70_renderscaledtext_insn_count(void) {
  return (int32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSNS;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v70_renderscaledtext_install_count(void) {
  return (int32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_install_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_INSTALL_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_RET_VA;
}

int32_t isaac_lua_engine_v70_renderscaledtext_return_value(void) {
  return (int32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_sso_cap_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_SSO_CAP_U32;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_string_assign_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_STRING_ASSIGN_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_renderscaledtext_va(void) {
  return (uint32_t)ISAAC_LUA_V70_RENDERSCALEDTEXT_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V70_SCREENTOWORLD_RET_VA - ISAAC_LUA_V70_SCREENTOWORLD_VA);
}

uint32_t isaac_lua_engine_v70_screentoworld_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_FN_OFF;
}

uint32_t isaac_lua_engine_v70_screentoworld_getargobject_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_GETARGOBJECT_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_screentoworld_getargobject_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_GETARGOBJECT_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_NEWUSERDATA;
}

uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_RAWGETP;
}

uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_SETMETATABLE;
}

uint32_t isaac_lua_engine_v70_screentoworld_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_IAT_LUA_TOUSERDATA;
}

int32_t isaac_lua_engine_v70_screentoworld_insn_count(void) {
  return (int32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSNS;
}

uint32_t isaac_lua_engine_v70_screentoworld_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_CALLER_VA;
}

int32_t isaac_lua_engine_v70_screentoworld_install_count(void) {
  return (int32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v70_screentoworld_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_install_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_INSTALL_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_NEWUSERDATA_SIZE;
}

uint32_t isaac_lua_engine_v70_screentoworld_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_RAWGETP_KEY;
}

uint32_t isaac_lua_engine_v70_screentoworld_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v70_screentoworld_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v70_screentoworld_registry_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_REGISTRY_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_screentoworld_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_RET_VA;
}

int32_t isaac_lua_engine_v70_screentoworld_return_value(void) {
  return (int32_t)ISAAC_LUA_V70_SCREENTOWORLD_RETURN_VALUE;
}

uint32_t isaac_lua_engine_v70_screentoworld_setmeta_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_SETMETA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_screentoworld_site_caller_va_at(int32_t index) {
  static const uint32_t kVas[] = {
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_0_CALLER_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_1_CALLER_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_2_CALLER_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_3_CALLER_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_4_CALLER_VA,
  };
  return (index >= 0 && index < (int32_t)(sizeof(kVas) / sizeof(kVas[0]))) ? kVas[index] : 0u;
}

int32_t isaac_lua_engine_v70_screentoworld_site_count(void) {
  return (int32_t)ISAAC_LUA_V70_SCREENTOWORLD_SITE_COUNT;
}

uint32_t isaac_lua_engine_v70_screentoworld_site_name_va_at(int32_t index) {
  static const uint32_t kVas[] = {
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_0_NAME_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_1_NAME_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_2_NAME_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_3_NAME_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_4_NAME_VA,
  };
  return (index >= 0 && index < (int32_t)(sizeof(kVas) / sizeof(kVas[0]))) ? kVas[index] : 0u;
}

uint32_t isaac_lua_engine_v70_screentoworld_site_real_fn_va_at(int32_t index) {
  static const uint32_t kVas[] = {
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_0_REAL_FN_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_1_REAL_FN_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_2_REAL_FN_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_3_REAL_FN_VA,
    ISAAC_LUA_V70_SCREENTOWORLD_SITE_4_REAL_FN_VA,
  };
  return (index >= 0 && index < (int32_t)(sizeof(kVas) / sizeof(kVas[0]))) ? kVas[index] : 0u;
}

uint32_t isaac_lua_engine_v70_screentoworld_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v70_screentoworld_ud_object_off(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_UD_OBJECT_OFF;
}

uint32_t isaac_lua_engine_v70_screentoworld_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_UD_VTABLE_VA;
}

uint32_t isaac_lua_engine_v70_screentoworld_va(void) {
  return (uint32_t)ISAAC_LUA_V70_SCREENTOWORLD_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v71 seed/dungeon band (isstringvalidseed/seed2string/removecurses/
 * getdungeonplacementseed/dungeonreturnpositionsetter) pure islands
 * (incident restoration: bodies mirror scripts/decomp/lua-engine-pure-model.mjs)
 * ------------------------------------------------------------------------- */

uint32_t isaac_lua_engine_v71_isstringvalidseed_byte_gate(uint32_t real_fn_result) {
  /* BYTE gate on AL (`test al,al; setne`): only (& 0xff) matters. */
  return (real_fn_result & 0xffu) != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_RET_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V71_ISSTRINGVALIDSEED_RET_VA - ISAAC_LUA_V71_ISSTRINGVALIDSEED_VA);
}

int32_t isaac_lua_engine_v71_isstringvalidseed_insn_count(void) {
  return (int32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSNS;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_FN_OFF;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_seh_handler_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_SEH_HANDLER_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_check_string_builder_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_CHECK_STRING_BUILDER_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_string_copy_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_STRING_COPY_CTOR_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_string_dtor_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_STRING_DTOR_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_byte_gate_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_BYTE_GATE_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_IAT_LUA_PUSHBOOLEAN;
}

int32_t isaac_lua_engine_v71_isstringvalidseed_return_value(void) {
  return (int32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_RETURN_VALUE;
}

int32_t isaac_lua_engine_v71_isstringvalidseed_install_count(void) {
  return (int32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_RET_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_LITERAL_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_name_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_NAME_VA;
}

uint32_t isaac_lua_engine_v71_isstringvalidseed_install_b_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V71_ISSTRINGVALIDSEED_INSTALL_B_CALLER_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_RET_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V71_SEED2STRING_RET_VA - ISAAC_LUA_V71_SEED2STRING_VA);
}

int32_t isaac_lua_engine_v71_seed2string_insn_count(void) {
  return (int32_t)ISAAC_LUA_V71_SEED2STRING_INSNS;
}

uint32_t isaac_lua_engine_v71_seed2string_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_seed2string_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_FN_OFF;
}

uint32_t isaac_lua_engine_v71_seed2string_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v71_seed2string_checkinteger_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_CHECKINTEGER_IAT_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_checkinteger_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_seed2string_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v71_seed2string_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_REAL_FN_CLEANUP;
}

uint32_t isaac_lua_engine_v71_seed2string_iat_lua_pushlstring(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_IAT_LUA_PUSHLSTRING;
}

uint32_t isaac_lua_engine_v71_seed2string_sso_cap_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_SSO_CAP_U32;
}

uint32_t isaac_lua_engine_v71_seed2string_heap_threshold_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_HEAP_THRESHOLD_U32;
}

uint32_t isaac_lua_engine_v71_seed2string_align_slack_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_ALIGN_SLACK_U32;
}

uint32_t isaac_lua_engine_v71_seed2string_free_tail_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_FREE_TAIL_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_cookie_dat_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_COOKIE_DAT_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_security_check_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_SECURITY_CHECK_VA;
}

int32_t isaac_lua_engine_v71_seed2string_return_value(void) {
  return (int32_t)ISAAC_LUA_V71_SEED2STRING_RETURN_VALUE;
}

int32_t isaac_lua_engine_v71_seed2string_install_count(void) {
  return (int32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v71_seed2string_install_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v71_seed2string_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V71_SEED2STRING_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_RET_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V71_REMOVECURSES_RET_VA - ISAAC_LUA_V71_REMOVECURSES_VA);
}

int32_t isaac_lua_engine_v71_removecurses_insn_count(void) {
  return (int32_t)ISAAC_LUA_V71_REMOVECURSES_INSNS;
}

uint32_t isaac_lua_engine_v71_removecurses_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_removecurses_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_FN_OFF;
}

uint32_t isaac_lua_engine_v71_removecurses_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v71_removecurses_lua_type_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_LUA_TYPE_IAT_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_type_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_TYPE_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_removecurses_type_gate_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_TYPE_GATE_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_CHECK_HELPER_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_check_flags_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_CHECK_FLAGS_U32;
}

uint32_t isaac_lua_engine_v71_removecurses_check_key_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_CHECK_KEY_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_check_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_CHECK_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_removecurses_checkinteger_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_CHECKINTEGER_IAT_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_checkinteger_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_CHECKINTEGER_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_removecurses_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v71_removecurses_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_REAL_FN_CLEANUP;
}

int32_t isaac_lua_engine_v71_removecurses_return_value(void) {
  return (int32_t)ISAAC_LUA_V71_REMOVECURSES_RETURN_VALUE;
}

int32_t isaac_lua_engine_v71_removecurses_install_count(void) {
  return (int32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v71_removecurses_install_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v71_removecurses_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V71_REMOVECURSES_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_RET_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_RET_VA - ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_VA);
}

int32_t isaac_lua_engine_v71_getdungeonplacementseed_insn_count(void) {
  return (int32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSNS;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_FN_OFF;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_lua_type_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_LUA_TYPE_IAT_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_type_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_type_gate_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_TYPE_GATE_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_HELPER_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_flags_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_FLAGS_U32;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_key_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_KEY_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_check_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_CHECK_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_pusher_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_pusher_row(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_PUSHER_ROW;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_REAL_FN_CLEANUP;
}

int32_t isaac_lua_engine_v71_getdungeonplacementseed_return_value(void) {
  return (int32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_RETURN_VALUE;
}

int32_t isaac_lua_engine_v71_getdungeonplacementseed_install_count(void) {
  return (int32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v71_getdungeonplacementseed_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V71_GETDUNGEONPLACEMENTSEED_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_RET_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_body_bytes(void) {
  return (uint32_t)(ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_RET_VA - ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_VA);
}

int32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_insn_count(void) {
  return (int32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSNS;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_TOUSERDATA_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_fn_off(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_FN_OFF;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_IAT_LUA_TOUSERDATA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_lua_type_iat_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_LUA_TYPE_IAT_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_type_1_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_1_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_type_2_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_TYPE_2_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_gate_1_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_1_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_gate_2_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_GATE_2_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_helper_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_HELPER_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_1_flags_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_FLAGS_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_1_key_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_KEY_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_1_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_1_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_2_flags_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_FLAGS_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_2_key_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_KEY_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_check_2_arg_index_u32(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_CHECK_2_ARG_INDEX_U32;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_real_fn_arg_count(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_ARG_COUNT;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_real_fn_cleanup(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_REAL_FN_CLEANUP;
}

int32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_return_value(void) {
  return (int32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_RETURN_VALUE;
}

int32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_count(void) {
  return (int32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_COUNT;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_ret_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_RET_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_literal_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_LITERAL_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_real_fn_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_REAL_FN_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_name_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_NAME_VA;
}

uint32_t isaac_lua_engine_v71_dungeonreturnpositionsetter_install_caller_va(void) {
  return (uint32_t)ISAAC_LUA_V71_DUNGEONRETURNPOSITIONSETTER_INSTALL_CALLER_VA;
}

uint32_t isaac_lua_engine_899770_index4(uint32_t bound, uint32_t base, uint32_t arg) {
  /* Law A (PE 0x899770..0x89978a): bounds-gated element address,
   bound=[this+0], base=[this+4], STRIDE 4; OOB -> 0. */
  const uint32_t b = bound;
  const uint32_t a = arg;
  return a < b ? (base + a * 4u) : 0u;
}

uint32_t isaac_lua_engine_899790_indexb8(uint32_t bound, uint32_t base, uint32_t arg) {
  /* Law B (PE 0x899790..0x8997ad): same gate, STRIDE 0xb8; OOB -> 0. */
  const uint32_t b = bound;
  const uint32_t a = arg;
  return a < b ? (base + a * 0xb8u) : 0u;
}

uint32_t isaac_lua_engine_899770_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_VA;
}

uint32_t isaac_lua_engine_899770_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_END_VA;
}

uint32_t isaac_lua_engine_899770_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_NEXT_VA;
}

uint32_t isaac_lua_engine_899770_bound_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_BOUND_OFF;
}

uint32_t isaac_lua_engine_899770_base_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_BASE_OFF;
}

uint32_t isaac_lua_engine_899770_stride(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_STRIDE;
}

uint32_t isaac_lua_engine_899770_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_STACK_ARGS;
}

uint32_t isaac_lua_engine_899770_this_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_THISCALL;
}

uint32_t isaac_lua_engine_899770_wrapper_row_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_WRAPPER_ROW_VA;
}

uint32_t isaac_lua_engine_899770_class_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_CLASS_KEY;
}

uint32_t isaac_lua_engine_899770_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_HELPER_VA;
}

uint32_t isaac_lua_engine_899770_slot_store_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899770_SLOT_STORE_VA;
}

uint32_t isaac_lua_engine_899790_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_VA;
}

uint32_t isaac_lua_engine_899790_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_END_VA;
}

uint32_t isaac_lua_engine_899790_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_NEXT_VA;
}

uint32_t isaac_lua_engine_899790_bound_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_BOUND_OFF;
}

uint32_t isaac_lua_engine_899790_base_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_BASE_OFF;
}

uint32_t isaac_lua_engine_899790_stride(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_STRIDE;
}

uint32_t isaac_lua_engine_899790_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_STACK_ARGS;
}

uint32_t isaac_lua_engine_899790_this_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_THISCALL;
}

uint32_t isaac_lua_engine_899790_wrapper_row_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_WRAPPER_ROW_VA;
}

uint32_t isaac_lua_engine_899790_class_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_CLASS_KEY;
}

uint32_t isaac_lua_engine_899790_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_HELPER_VA;
}

uint32_t isaac_lua_engine_899790_slot_store_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899790_SLOT_STORE_VA;
}

/* ---------------------------------------------------------------------------
 * ABI v72 — twin bounds-gated element-address laws (0x899770 / 0x899790).
 * Incident restoration per section-notes/lua-v72-899770/NOTES.md §4.
 * ------------------------------------------------------------------------- */
static_assert(ISAAC_LUA_ENGINE_899770_VA == 0x00899770u &&
                  ISAAC_LUA_ENGINE_899770_END_VA == 0x0089978au &&
                  ISAAC_LUA_ENGINE_899770_NEXT_VA == 0x00899790u &&
                  ISAAC_LUA_ENGINE_899770_BOUND_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_899770_BASE_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899770_STRIDE == 0x4u &&
                  ISAAC_LUA_ENGINE_899770_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899770_THISCALL == 0x1u &&
                  ISAAC_LUA_ENGINE_899770_WRAPPER_ROW_VA == 0x008c59d0u &&
                  ISAAC_LUA_ENGINE_899770_CLASS_KEY == 0x00c82a30u &&
                  ISAAC_LUA_ENGINE_899770_HELPER_VA == 0x00891750u &&
                  ISAAC_LUA_ENGINE_899770_SLOT_STORE_VA == 0x00891946u &&
                  ISAAC_LUA_ENGINE_899790_VA == 0x00899790u &&
                  ISAAC_LUA_ENGINE_899790_END_VA == 0x008997adu &&
                  ISAAC_LUA_ENGINE_899790_NEXT_VA == 0x008997b0u &&
                  ISAAC_LUA_ENGINE_899790_BOUND_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_899790_BASE_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899790_STRIDE == 0xb8u &&
                  ISAAC_LUA_ENGINE_899790_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899790_THISCALL == 0x1u,
              "v72 twin span/law pins must match the PE decode");


/* ---------------------------------------------------------------------------
 * ABI v73 — wrapper-band continuation past the v72 twins:
 * 0x8997b0 straight-line HOST wrapper (imms lawed, zero pure decisions)
 * and 0x899850 pure islands (full-word type gate + check/get args +
 * setne bool word). Evidence section-notes/lua-v73-8997b0/NOTES.md.
 * ------------------------------------------------------------------------- */
static_assert(ISAAC_LUA_ENGINE_8997B0_VA == 0x008997b0u &&
                  ISAAC_LUA_ENGINE_8997B0_END_VA == 0x00899847u &&
                  ISAAC_LUA_ENGINE_8997B0_NEXT_VA == 0x00899850u &&
                  ISAAC_LUA_ENGINE_8997B0_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_8997B0_ECX_ARG == 0x1u &&
                  ISAAC_LUA_ENGINE_8997B0_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_8997B0_UD_PAYLOAD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_8997B0_NEWUSERDATA_SIZE == 0x4u &&
                  ISAAC_LUA_ENGINE_8997B0_CLOSURE_FN_VA == 0x008b3440u &&
                  ISAAC_LUA_ENGINE_8997B0_CLOSURE_NUPS == 0x1u &&
                  ISAAC_LUA_ENGINE_8997B0_PUSHVALUE_INDEX_U32 == 0xffffffffu &&
                  ISAAC_LUA_ENGINE_8997B0_TABLE_A_ABSINDEX_INDEX_U32 ==
                      0xfffffffbu &&
                  ISAAC_LUA_ENGINE_8997B0_TABLE_B_ABSINDEX_INDEX_U32 ==
                      0xfffffffdu &&
                  ISAAC_LUA_ENGINE_8997B0_ROTATE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_8997B0_ROTATE_N == 0x1u &&
                  ISAAC_LUA_ENGINE_8997B0_RAWSET_COUNT == 0x2u &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_NEWUSERDATA ==
                      0x00b1839cu &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHCCLOSURE ==
                      0x00b183fcu &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHVALUE == 0x00b183c8u &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_ABSINDEX == 0x00b18418u &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHSTRING == 0x00b18414u &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_ROTATE == 0x00b1840cu &&
                  ISAAC_LUA_ENGINE_8997B0_IAT_LUA_RAWSET == 0x00b18408u,
              "v73 0x8997b0 span/imm pins must match the PE decode");
static_assert(ISAAC_LUA_ENGINE_899850_VA == 0x00899850u &&
                  ISAAC_LUA_ENGINE_899850_END_VA == 0x008998b9u &&
                  ISAAC_LUA_ENGINE_899850_NEXT_VA == 0x008998c0u &&
                  ISAAC_LUA_ENGINE_899850_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899850_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899850_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_899850_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899850_CHECKGET_KEY == 0x00c82a04u &&
                  ISAAC_LUA_ENGINE_899850_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899850_CHECKGET_DEF_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899850_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899850_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899850_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899850_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899850_TOBOOLEAN_INDEX == 0x2u &&
                  ISAAC_LUA_ENGINE_899850_IAT_LUA_TOBOOLEAN == 0x00b183e8u &&
                  ISAAC_LUA_ENGINE_899850_METHOD_VTABLE_FIELD_OFF == 0x0u,
              "v73 0x899850 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899850_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x89986e`
     @0x899866/@0x899868): nil -> null-object path, else check/get
     path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_899850_bool_word(uint32_t toboolean_result) {
  /* FULL-WORD lua_toboolean(L,2) normalize (`test eax,eax` @0x8998a3 /
     `setne byte ptr [ebp-4]` @0x8998a7): the method-call arg is this
     0/1 word. 0x100 -> 1, 0xffffffff -> 1. */
  return toboolean_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_8997b0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_VA;
}
uint32_t isaac_lua_engine_8997b0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_END_VA;
}
uint32_t isaac_lua_engine_8997b0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_NEXT_VA;
}
uint32_t isaac_lua_engine_8997b0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_STACK_ARGS;
}
uint32_t isaac_lua_engine_8997b0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_ECX_ARG;
}
uint32_t isaac_lua_engine_8997b0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_8997b0_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_UD_PAYLOAD_OFF;
}
uint32_t isaac_lua_engine_8997b0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_8997b0_closure_fn_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_CLOSURE_FN_VA;
}
uint32_t isaac_lua_engine_8997b0_closure_nups(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_CLOSURE_NUPS;
}
uint32_t isaac_lua_engine_8997b0_pushvalue_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_PUSHVALUE_INDEX_U32;
}
uint32_t isaac_lua_engine_8997b0_table_a_absindex_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_TABLE_A_ABSINDEX_INDEX_U32;
}
uint32_t isaac_lua_engine_8997b0_table_b_absindex_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_TABLE_B_ABSINDEX_INDEX_U32;
}
uint32_t isaac_lua_engine_8997b0_rotate_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_ROTATE_INDEX_U32;
}
uint32_t isaac_lua_engine_8997b0_rotate_n(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_ROTATE_N;
}
uint32_t isaac_lua_engine_8997b0_rawset_count(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_RAWSET_COUNT;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_newuserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_NEWUSERDATA;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_pushcclosure(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHCCLOSURE;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_pushvalue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHVALUE;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_absindex(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_ABSINDEX;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_pushstring(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_PUSHSTRING;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_rotate(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_ROTATE;
}
uint32_t isaac_lua_engine_8997b0_iat_lua_rawset(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8997B0_IAT_LUA_RAWSET;
}
uint32_t isaac_lua_engine_899850_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_VA;
}
uint32_t isaac_lua_engine_899850_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_END_VA;
}
uint32_t isaac_lua_engine_899850_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_NEXT_VA;
}
uint32_t isaac_lua_engine_899850_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_STACK_ARGS;
}
uint32_t isaac_lua_engine_899850_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_ECX_ARG;
}
uint32_t isaac_lua_engine_899850_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899850_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899850_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899850_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899850_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899850_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899850_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899850_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899850_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899850_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_TOBOOLEAN_INDEX;
}
uint32_t isaac_lua_engine_899850_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_IAT_LUA_TOBOOLEAN;
}
uint32_t isaac_lua_engine_899850_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899850_METHOD_VTABLE_FIELD_OFF;
}

/* ---------------------------------------------------------------------------
 * ABI v74 — wrapper-band continuation: 0x8998c0 boolean getter (full-word
 * type gate + check/get 0xc82a04 + BYTE al gate + pushboolean) and
 * 0x899930 box constructor (check/get 0xc82a01 + method out-pair +
 * 16-byte userdata box {vtable 0xb73538, self-ptr, payload} +
 * rawgetp/setmetatable). Evidence section-notes/lua-v74-8998c0/NOTES.md.
 * ------------------------------------------------------------------------- */
static_assert(ISAAC_LUA_ENGINE_8998C0_VA == 0x008998c0u &&
                  ISAAC_LUA_ENGINE_8998C0_END_VA == 0x00899925u &&
                  ISAAC_LUA_ENGINE_8998C0_NEXT_VA == 0x00899930u &&
                  ISAAC_LUA_ENGINE_8998C0_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_8998C0_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_8998C0_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_8998C0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_8998C0_CHECKGET_KEY == 0x00c82a04u &&
                  ISAAC_LUA_ENGINE_8998C0_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_8998C0_CHECKGET_DEF_ARG == 0x1u &&
                  ISAAC_LUA_ENGINE_8998C0_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_8998C0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_8998C0_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_8998C0_IAT_LUA_TOUSERDATA ==
                      0x00b183b0u &&
                  ISAAC_LUA_ENGINE_8998C0_METHOD_VTABLE_FIELD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_8998C0_IAT_LUA_PUSHBOOLEAN ==
                      0x00b183ecu &&
                  ISAAC_LUA_ENGINE_8998C0_RETURN_VALUE == 0x1u,
              "v74 0x8998c0 span/island pins must match the PE decode");
static_assert(ISAAC_LUA_ENGINE_899930_VA == 0x00899930u &&
                  ISAAC_LUA_ENGINE_899930_END_VA == 0x008999d2u &&
                  ISAAC_LUA_ENGINE_899930_NEXT_VA == 0x008999e0u &&
                  ISAAC_LUA_ENGINE_899930_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899930_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899930_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_899930_ALIGNED_PROLOGUE == 0x1u &&
                  ISAAC_LUA_ENGINE_899930_IAT_LUA_TOUSERDATA ==
                      0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899930_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899930_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899930_CHECKGET_KEY == 0x00c82a01u &&
                  ISAAC_LUA_ENGINE_899930_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899930_CHECKGET_DEF_ARG == 0x1u &&
                  ISAAC_LUA_ENGINE_899930_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899930_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899930_METHOD_VTABLE_FIELD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_899930_NEWUSERDATA_SIZE == 0x10u &&
                  ISAAC_LUA_ENGINE_899930_UD_VTABLE_VA == 0x00b73538u &&
                  ISAAC_LUA_ENGINE_899930_UD_PAYLOAD_PTR_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899930_UD_PAYLOAD_OFF == 0x8u &&
                  ISAAC_LUA_ENGINE_899930_REGISTRY_INDEX_U32 ==
                      0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899930_METATABLE_RAWGETP_KEY ==
                      0x00c82a33u &&
                  ISAAC_LUA_ENGINE_899930_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899930_IAT_LUA_SETMETATABLE ==
                      0x00b18398u &&
                  ISAAC_LUA_ENGINE_899930_SETMETATABLE_INDEX_U32 ==
                      0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899930_RETURN_VALUE == 0x1u,
              "v74 0x899930 span/island pins must match the PE decode");

int32_t isaac_lua_engine_8998c0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x8998dc`
     @0x8998d4/@0x8998d6): nil -> null-object path, else check/get
     path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_8998c0_method_return_byte_gate(
    uint32_t method_result) {
  /* METHOD RETURN BYTE GATE (`test al,al; setne cl` @0x89990c/
     @0x89990e): only the bool return's LOW BYTE matters — 0x100/
     0xff00 behave like 0, 0x1ff/0xff like 1 (v61_return_gate shape;
     NOT the 0x899850 full-word bool word). */
  return (method_result & 0xffu) != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_899930_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x899960`
     @0x899958/@0x89995a): nil -> null object (ecx=0), else check/get
     0xc82a01. Never byte-masked. */
  return type_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_8998c0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_VA;
}
uint32_t isaac_lua_engine_8998c0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_END_VA;
}
uint32_t isaac_lua_engine_8998c0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_NEXT_VA;
}
uint32_t isaac_lua_engine_8998c0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_STACK_ARGS;
}
uint32_t isaac_lua_engine_8998c0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_ECX_ARG;
}
uint32_t isaac_lua_engine_8998c0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_8998c0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_8998c0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_8998c0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_8998c0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_8998c0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_8998c0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_8998c0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_8998c0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_8998c0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_8998c0_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_IAT_LUA_PUSHBOOLEAN;
}
uint32_t isaac_lua_engine_8998c0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8998C0_RETURN_VALUE;
}
uint32_t isaac_lua_engine_899930_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_VA;
}
uint32_t isaac_lua_engine_899930_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_END_VA;
}
uint32_t isaac_lua_engine_899930_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_NEXT_VA;
}
uint32_t isaac_lua_engine_899930_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_STACK_ARGS;
}
uint32_t isaac_lua_engine_899930_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_ECX_ARG;
}
uint32_t isaac_lua_engine_899930_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899930_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899930_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899930_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899930_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899930_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899930_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899930_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899930_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899930_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899930_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899930_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899930_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899930_ud_payload_ptr_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_UD_PAYLOAD_PTR_OFF;
}
uint32_t isaac_lua_engine_899930_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_UD_PAYLOAD_OFF;
}
uint32_t isaac_lua_engine_899930_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899930_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899930_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899930_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899930_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899930_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899930_RETURN_VALUE;
}

/* ---------------------------------------------------------------------------
 * ABI v75 — wrapper-band continuation: 0x8999e0 integer getter (full-word
 * type gate + check/get 0xc82a01 + method(obj) stack-arg call +
 * zero-extended dword result -> lua_pushinteger) and 0x899a50 box
 * constructor (clone of the 0x899930 band: key 0xc829fe, vtable
 * 0xb7354c, metatable rawgetp key 0xc82a36). Evidence
 * section-notes/lua-v75-8999e0/NOTES.md.
 * ------------------------------------------------------------------------- */
static_assert(ISAAC_LUA_ENGINE_8999E0_VA == 0x008999e0u &&
                  ISAAC_LUA_ENGINE_8999E0_END_VA == 0x00899a46u &&
                  ISAAC_LUA_ENGINE_8999E0_NEXT_VA == 0x00899a50u &&
                  ISAAC_LUA_ENGINE_8999E0_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_8999E0_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_8999E0_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_8999E0_ALIGNED_PROLOGUE == 0x1u &&
                  ISAAC_LUA_ENGINE_8999E0_IAT_LUA_TOUSERDATA ==
                      0x00b183b0u &&
                  ISAAC_LUA_ENGINE_8999E0_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_8999E0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_8999E0_CHECKGET_KEY == 0x00c82a01u &&
                  ISAAC_LUA_ENGINE_8999E0_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_8999E0_CHECKGET_DEF_ARG == 0x1u &&
                  ISAAC_LUA_ENGINE_8999E0_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_8999E0_CHECKGET_HELPER_VA ==
                      0x0085c590u &&
                  ISAAC_LUA_ENGINE_8999E0_METHOD_VTABLE_FIELD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_8999E0_METHOD_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_8999E0_IAT_LUA_PUSHINTEGER ==
                      0x00b183f8u &&
                  ISAAC_LUA_ENGINE_8999E0_PUSHINTEGER_HI_WORD == 0x0u &&
                  ISAAC_LUA_ENGINE_8999E0_RETURN_VALUE == 0x1u,
              "v75 0x8999e0 span/island pins must match the PE decode");
static_assert(ISAAC_LUA_ENGINE_899A50_VA == 0x00899a50u &&
                  ISAAC_LUA_ENGINE_899A50_END_VA == 0x00899af2u &&
                  ISAAC_LUA_ENGINE_899A50_NEXT_VA == 0x00899b00u &&
                  ISAAC_LUA_ENGINE_899A50_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899A50_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899A50_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_899A50_ALIGNED_PROLOGUE == 0x1u &&
                  ISAAC_LUA_ENGINE_899A50_IAT_LUA_TOUSERDATA ==
                      0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A50_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A50_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A50_CHECKGET_KEY == 0x00c829feu &&
                  ISAAC_LUA_ENGINE_899A50_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899A50_CHECKGET_DEF_ARG == 0x1u &&
                  ISAAC_LUA_ENGINE_899A50_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899A50_CHECKGET_HELPER_VA ==
                      0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A50_METHOD_VTABLE_FIELD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_899A50_METHOD_STACK_ARGS == 0x2u &&
                  ISAAC_LUA_ENGINE_899A50_NEWUSERDATA_SIZE == 0x10u &&
                  ISAAC_LUA_ENGINE_899A50_UD_VTABLE_VA == 0x00b7354cu &&
                  ISAAC_LUA_ENGINE_899A50_UD_PAYLOAD_PTR_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899A50_UD_PAYLOAD_OFF == 0x8u &&
                  ISAAC_LUA_ENGINE_899A50_REGISTRY_INDEX_U32 ==
                      0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A50_METATABLE_RAWGETP_KEY ==
                      0x00c82a36u &&
                  ISAAC_LUA_ENGINE_899A50_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A50_IAT_LUA_SETMETATABLE ==
                      0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A50_SETMETATABLE_INDEX_U32 ==
                      0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A50_RETURN_VALUE == 0x1u,
              "v75 0x899a50 span/island pins must match the PE decode");

int32_t isaac_lua_engine_8999e0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x899a0d`
     @0x899a05/@0x899a07): nil -> null-object path (edx=0), else
     check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_899a50_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x899a80`
     @0x899a78/@0x899a7a): nil -> null-object path (ecx=0), else
     check/get 0xc829fe. Never byte-masked. */
  return type_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_8999e0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_VA;
}
uint32_t isaac_lua_engine_8999e0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_END_VA;
}
uint32_t isaac_lua_engine_8999e0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_NEXT_VA;
}
uint32_t isaac_lua_engine_8999e0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_STACK_ARGS;
}
uint32_t isaac_lua_engine_8999e0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_ECX_ARG;
}
uint32_t isaac_lua_engine_8999e0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_8999e0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_8999e0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_8999e0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_8999e0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_8999e0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_8999e0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_8999e0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_8999e0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_8999e0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_8999e0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_8999e0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_8999e0_iat_lua_pushinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_IAT_LUA_PUSHINTEGER;
}
uint32_t isaac_lua_engine_8999e0_pushinteger_hi_word(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_PUSHINTEGER_HI_WORD;
}
uint32_t isaac_lua_engine_8999e0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_8999E0_RETURN_VALUE;
}
uint32_t isaac_lua_engine_899a50_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_VA;
}
uint32_t isaac_lua_engine_899a50_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_END_VA;
}
uint32_t isaac_lua_engine_899a50_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_NEXT_VA;
}
uint32_t isaac_lua_engine_899a50_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a50_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_ECX_ARG;
}
uint32_t isaac_lua_engine_899a50_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a50_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a50_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a50_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a50_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a50_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a50_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a50_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a50_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a50_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a50_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a50_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a50_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a50_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a50_ud_payload_ptr_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_UD_PAYLOAD_PTR_OFF;
}
uint32_t isaac_lua_engine_899a50_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_UD_PAYLOAD_OFF;
}
uint32_t isaac_lua_engine_899a50_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a50_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a50_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a50_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a50_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a50_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A50_RETURN_VALUE;
}

/* ---------------------------------------------------------------------------
 * ABI v76 — wrapper-band continuation: 0x899b00 integer-arg method call
 * (full-word type gate + check/get 0xc829e6 def 0 + lua_checkinteger(L,2)
 * + method(arg, obj) stack-arg call, ret 0) and 0x899b70 sext-pusher band
 * (check/get 0xc829e6 def 1 + method(obj) no-arg call + result -> 0x85bfd0
 * sext pusher, ret 1). Evidence section-notes/lua-v76-899b00/NOTES.md.
 * ------------------------------------------------------------------------- */
static_assert(ISAAC_LUA_ENGINE_899B00_VA == 0x00899b00u &&
                  ISAAC_LUA_ENGINE_899B00_END_VA == 0x00899b6cu &&
                  ISAAC_LUA_ENGINE_899B00_NEXT_VA == 0x00899b70u &&
                  ISAAC_LUA_ENGINE_899B00_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899B00_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899B00_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_899B00_ALIGNED_PROLOGUE == 0x1u &&
                  ISAAC_LUA_ENGINE_899B00_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B00_CHECKGET_KEY == 0x00c829e6u &&
                  ISAAC_LUA_ENGINE_899B00_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899B00_CHECKGET_DEF_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899B00_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899B00_CHECKGET_HELPER_VA ==
                      0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B00_IAT_LUA_TOUSERDATA ==
                      0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B00_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B00_METHOD_VTABLE_FIELD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_899B00_IAT_LUA_CHECKINTEGER ==
                      0x00b183f4u &&
                  ISAAC_LUA_ENGINE_899B00_CHECKINTEGER_INDEX == 0x2u &&
                  ISAAC_LUA_ENGINE_899B00_METHOD_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899B00_RETURN_VALUE == 0x0u,
              "v76 0x899b00 span/island pins must match the PE decode");
static_assert(ISAAC_LUA_ENGINE_899B70_VA == 0x00899b70u &&
                  ISAAC_LUA_ENGINE_899B70_END_VA == 0x00899bccu &&
                  ISAAC_LUA_ENGINE_899B70_NEXT_VA == 0x00899bd0u &&
                  ISAAC_LUA_ENGINE_899B70_STACK_ARGS == 0x1u &&
                  ISAAC_LUA_ENGINE_899B70_ECX_ARG == 0x0u &&
                  ISAAC_LUA_ENGINE_899B70_CALLEE_POPS_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_899B70_ALIGNED_PROLOGUE == 0x0u &&
                  ISAAC_LUA_ENGINE_899B70_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B70_CHECKGET_KEY == 0x00c829e6u &&
                  ISAAC_LUA_ENGINE_899B70_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899B70_CHECKGET_DEF_ARG == 0x1u &&
                  ISAAC_LUA_ENGINE_899B70_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899B70_CHECKGET_HELPER_VA ==
                      0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B70_IAT_LUA_TOUSERDATA ==
                      0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B70_TOUSERDATA_INDEX_U32 ==
                      0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B70_METHOD_VTABLE_FIELD_OFF == 0x0u &&
                  ISAAC_LUA_ENGINE_899B70_METHOD_STACK_ARGS == 0x0u &&
                  ISAAC_LUA_ENGINE_899B70_PUSHER_HELPER_VA == 0x0085bfd0u &&
                  ISAAC_LUA_ENGINE_899B70_RETURN_VALUE == 0x1u,
              "v76 0x899b70 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b00_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x899b24`
     @0x899b1a/@0x899b1c): nil -> null-object path ([esp+0xc]=eax=0),
     else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_899b70_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne 0x899b8c`
     @0x899b84/@0x899b86): nil -> null-object path (edi=0), else
     check/get path. Never byte-masked. */
  return type_result != 0u ? 1 : 0;
}

uint32_t isaac_lua_engine_899b00_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_VA;
}
uint32_t isaac_lua_engine_899b00_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_END_VA;
}
uint32_t isaac_lua_engine_899b00_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_NEXT_VA;
}
uint32_t isaac_lua_engine_899b00_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b00_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_ECX_ARG;
}
uint32_t isaac_lua_engine_899b00_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b00_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b00_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b00_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b00_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b00_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b00_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b00_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b00_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b00_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b00_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b00_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_IAT_LUA_CHECKINTEGER;
}
uint32_t isaac_lua_engine_899b00_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_CHECKINTEGER_INDEX;
}
uint32_t isaac_lua_engine_899b00_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b00_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B00_RETURN_VALUE;
}
uint32_t isaac_lua_engine_899b70_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_VA;
}
uint32_t isaac_lua_engine_899b70_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_END_VA;
}
uint32_t isaac_lua_engine_899b70_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_NEXT_VA;
}
uint32_t isaac_lua_engine_899b70_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b70_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_ECX_ARG;
}
uint32_t isaac_lua_engine_899b70_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b70_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b70_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b70_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b70_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b70_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b70_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b70_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b70_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b70_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b70_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b70_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b70_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899b70_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B70_RETURN_VALUE;
}

static_assert(ISAAC_LUA_ENGINE_899C70_VA == 0x00899c70u &&
                  ISAAC_LUA_ENGINE_899C70_END_VA == 0x00899d09u &&
                  ISAAC_LUA_ENGINE_899C70_NEXT_VA == 0x00899d10u &&
                  ISAAC_LUA_ENGINE_899C70_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899C70_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899C70_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899C70_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899C70_GATE_INVERTED_ENCODING == 0x1u &&
                  ISAAC_LUA_ENGINE_899C70_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899C70_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899C70_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899C70_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899C70_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899C70_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899C70_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899C70_CAST_VF_DELTA == 0x0u &&
                  ISAAC_LUA_ENGINE_899C70_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899C70_CAST_DST_TYPE_VA == 0x00c5e8ecu &&
                  ISAAC_LUA_ENGINE_899C70_CAST_IS_REFERENCE == 0x0u &&
                  ISAAC_LUA_ENGINE_899C70_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899C70_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899C70_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899C70_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899C70_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899C70_METATABLE_RAWGETP_KEY == 0x00c829f2u &&
                  ISAAC_LUA_ENGINE_899C70_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899C70_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899C70_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899C70_RETURN_VALUE == 0x1u,
              "v77 0x899c70 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899c70_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je` @0x899c86): nil SKIPS the check/get (obj stays
     null for the dynamic_cast), non-nil takes it. Same truth table as
     the prior bands: taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899c70_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_VA;
}
uint32_t isaac_lua_engine_899c70_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_END_VA;
}
uint32_t isaac_lua_engine_899c70_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_NEXT_VA;
}
uint32_t isaac_lua_engine_899c70_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_STACK_ARGS;
}
uint32_t isaac_lua_engine_899c70_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_ECX_ARG;
}
uint32_t isaac_lua_engine_899c70_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899c70_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899c70_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899c70_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899c70_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899c70_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899c70_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899c70_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899c70_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899c70_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899c70_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899c70_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899c70_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899c70_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899c70_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899c70_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899c70_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899c70_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899c70_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899c70_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899c70_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899c70_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899c70_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899c70_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899C70_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899D10_VA == 0x00899d10u &&
                  ISAAC_LUA_ENGINE_899D10_END_VA == 0x00899da9u &&
                  ISAAC_LUA_ENGINE_899D10_NEXT_VA == 0x00899db0u &&
                  ISAAC_LUA_ENGINE_899D10_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899D10_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899D10_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899D10_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899D10_GATE_INVERTED_ENCODING == 0x1u &&
                  ISAAC_LUA_ENGINE_899D10_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899D10_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899D10_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899D10_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899D10_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899D10_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899D10_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899D10_CAST_VF_DELTA == 0x0u &&
                  ISAAC_LUA_ENGINE_899D10_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899D10_CAST_DST_TYPE_VA == 0x00c5d804u &&
                  ISAAC_LUA_ENGINE_899D10_CAST_IS_REFERENCE == 0x0u &&
                  ISAAC_LUA_ENGINE_899D10_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899D10_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899D10_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899D10_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899D10_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899D10_METATABLE_RAWGETP_KEY == 0x00c829f7u &&
                  ISAAC_LUA_ENGINE_899D10_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899D10_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899D10_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899D10_RETURN_VALUE == 0x1u,
              "v78 0x899d10 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899d10_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je` @0x899d26): nil SKIPS the check/get (obj stays
     null for the dynamic_cast), non-nil takes it. Same truth table as
     the prior bands: taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899d10_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_VA;
}
uint32_t isaac_lua_engine_899d10_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_END_VA;
}
uint32_t isaac_lua_engine_899d10_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_NEXT_VA;
}
uint32_t isaac_lua_engine_899d10_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_STACK_ARGS;
}
uint32_t isaac_lua_engine_899d10_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_ECX_ARG;
}
uint32_t isaac_lua_engine_899d10_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899d10_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899d10_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899d10_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899d10_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899d10_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899d10_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899d10_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899d10_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899d10_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899d10_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899d10_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899d10_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899d10_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899d10_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899d10_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899d10_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899d10_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899d10_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899d10_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899d10_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899d10_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899d10_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899d10_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899D10_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899DB0_VA == 0x00899db0u &&
                  ISAAC_LUA_ENGINE_899DB0_END_VA == 0x00899e49u &&
                  ISAAC_LUA_ENGINE_899DB0_NEXT_VA == 0x00899e50u &&
                  ISAAC_LUA_ENGINE_899DB0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899DB0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899DB0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899DB0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899DB0_GATE_INVERTED_ENCODING == 0x1u &&
                  ISAAC_LUA_ENGINE_899DB0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899DB0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899DB0_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899DB0_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899DB0_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899DB0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899DB0_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899DB0_CAST_VF_DELTA == 0x0u &&
                  ISAAC_LUA_ENGINE_899DB0_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899DB0_CAST_DST_TYPE_VA == 0x00c5d804u &&
                  ISAAC_LUA_ENGINE_899DB0_CAST_IS_REFERENCE == 0x0u &&
                  ISAAC_LUA_ENGINE_899DB0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899DB0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899DB0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899DB0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899DB0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899DB0_METATABLE_RAWGETP_KEY == 0x00c829f8u &&
                  ISAAC_LUA_ENGINE_899DB0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899DB0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899DB0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899DB0_RETURN_VALUE == 0x1u,
              "v78 0x899db0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899db0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je` @0x899dc6): nil SKIPS the check/get (obj stays
     null for the dynamic_cast), non-nil takes it. Same truth table as
     the prior bands: taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899db0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_VA;
}
uint32_t isaac_lua_engine_899db0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_END_VA;
}
uint32_t isaac_lua_engine_899db0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_NEXT_VA;
}
uint32_t isaac_lua_engine_899db0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899db0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_ECX_ARG;
}
uint32_t isaac_lua_engine_899db0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899db0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899db0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899db0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899db0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899db0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899db0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899db0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899db0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899db0_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899db0_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899db0_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899db0_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899db0_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899db0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899db0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899db0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899db0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899db0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899db0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899db0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899db0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899db0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899db0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899DB0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899E50_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899E50_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899E50_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899E50_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899E50_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899E50_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899E50_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899E50_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899E50_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899E50_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899E50_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899E50_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899E50_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899E50_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899E50_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899E50_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899E50_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899E50_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899E50_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899E50_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899E50_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899E50_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899E50_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899E50_VA == 0x00899e50u &&
                  ISAAC_LUA_ENGINE_899E50_END_VA == 0x00899ee9u &&
                  ISAAC_LUA_ENGINE_899E50_NEXT_VA == 0x00899ef0u &&
                  ISAAC_LUA_ENGINE_899E50_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899E50_CAST_DST_TYPE_VA == 0x00c5e814u &&
                  ISAAC_LUA_ENGINE_899E50_METATABLE_RAWGETP_KEY == 0x00c829f4u,
              "v79 0x899e50 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899e50_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899e50_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_VA;
}
uint32_t isaac_lua_engine_899e50_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_END_VA;
}
uint32_t isaac_lua_engine_899e50_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_NEXT_VA;
}
uint32_t isaac_lua_engine_899e50_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_STACK_ARGS;
}
uint32_t isaac_lua_engine_899e50_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_ECX_ARG;
}
uint32_t isaac_lua_engine_899e50_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899e50_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899e50_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899e50_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899e50_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899e50_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899e50_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899e50_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899e50_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899e50_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899e50_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899e50_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899e50_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899e50_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899e50_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899e50_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899e50_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899e50_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899e50_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899e50_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899e50_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899e50_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899e50_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899e50_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899E50_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899EF0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899EF0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899EF0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899EF0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899EF0_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899EF0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899EF0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899EF0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899EF0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899EF0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899EF0_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899EF0_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899EF0_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899EF0_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899EF0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899EF0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899EF0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899EF0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899EF0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899EF0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899EF0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899EF0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899EF0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899EF0_VA == 0x00899ef0u &&
                  ISAAC_LUA_ENGINE_899EF0_END_VA == 0x00899f89u &&
                  ISAAC_LUA_ENGINE_899EF0_NEXT_VA == 0x00899fa0u &&
                  ISAAC_LUA_ENGINE_899EF0_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899EF0_CAST_DST_TYPE_VA == 0x00c5e814u &&
                  ISAAC_LUA_ENGINE_899EF0_METATABLE_RAWGETP_KEY == 0x00c829f5u,
              "v79 0x899ef0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899ef0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899ef0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_VA;
}
uint32_t isaac_lua_engine_899ef0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_END_VA;
}
uint32_t isaac_lua_engine_899ef0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_NEXT_VA;
}
uint32_t isaac_lua_engine_899ef0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ef0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_ECX_ARG;
}
uint32_t isaac_lua_engine_899ef0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ef0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899ef0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899ef0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899ef0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ef0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ef0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ef0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ef0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899ef0_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899ef0_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899ef0_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899ef0_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899ef0_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899ef0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899ef0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899ef0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899ef0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ef0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899ef0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899ef0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899ef0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899ef0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899ef0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899EF0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899FA0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899FA0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899FA0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899FA0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899FA0_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899FA0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899FA0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899FA0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899FA0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899FA0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899FA0_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899FA0_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899FA0_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899FA0_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899FA0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899FA0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899FA0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899FA0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899FA0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899FA0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899FA0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899FA0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899FA0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899FA0_VA == 0x00899fa0u &&
                  ISAAC_LUA_ENGINE_899FA0_END_VA == 0x0089a039u &&
                  ISAAC_LUA_ENGINE_899FA0_NEXT_VA == 0x0089a040u &&
                  ISAAC_LUA_ENGINE_899FA0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899FA0_CAST_DST_TYPE_VA == 0x00c5d8ccu &&
                  ISAAC_LUA_ENGINE_899FA0_METATABLE_RAWGETP_KEY == 0x00c829eeu,
              "v80 0x899fa0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899fa0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899fa0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_VA;
}
uint32_t isaac_lua_engine_899fa0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_END_VA;
}
uint32_t isaac_lua_engine_899fa0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_NEXT_VA;
}
uint32_t isaac_lua_engine_899fa0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899fa0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_ECX_ARG;
}
uint32_t isaac_lua_engine_899fa0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899fa0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899fa0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899fa0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899fa0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899fa0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899fa0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899fa0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899fa0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899fa0_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899fa0_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899fa0_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899fa0_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899fa0_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899fa0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899fa0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899fa0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899fa0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899fa0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899fa0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899fa0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899fa0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899fa0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899fa0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899FA0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A040_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A040_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A040_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A040_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A040_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A040_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A040_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A040_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A040_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A040_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A040_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A040_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A040_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A040_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A040_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A040_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A040_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A040_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A040_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A040_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A040_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A040_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A040_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A040_VA == 0x0089a040u &&
                  ISAAC_LUA_ENGINE_899A040_END_VA == 0x0089a0d9u &&
                  ISAAC_LUA_ENGINE_899A040_NEXT_VA == 0x0089a0e0u &&
                  ISAAC_LUA_ENGINE_899A040_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A040_CAST_DST_TYPE_VA == 0x00c5d8ccu &&
                  ISAAC_LUA_ENGINE_899A040_METATABLE_RAWGETP_KEY == 0x00c829efu,
              "v80 0x89a040 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a040_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a040_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_VA;
}
uint32_t isaac_lua_engine_899a040_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_END_VA;
}
uint32_t isaac_lua_engine_899a040_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_NEXT_VA;
}
uint32_t isaac_lua_engine_899a040_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a040_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_ECX_ARG;
}
uint32_t isaac_lua_engine_899a040_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a040_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a040_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a040_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a040_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a040_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a040_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a040_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a040_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a040_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a040_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a040_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a040_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a040_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a040_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a040_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a040_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a040_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a040_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a040_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a040_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a040_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a040_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a040_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A040_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A0E0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A0E0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A0E0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A0E0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A0E0_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A0E0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A0E0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A0E0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A0E0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A0E0_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A0E0_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A0E0_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A0E0_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A0E0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A0E0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A0E0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A0E0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A0E0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A0E0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A0E0_VA == 0x0089a0e0u &&
                  ISAAC_LUA_ENGINE_899A0E0_END_VA == 0x0089a179u &&
                  ISAAC_LUA_ENGINE_899A0E0_NEXT_VA == 0x0089a180u &&
                  ISAAC_LUA_ENGINE_899A0E0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A0E0_CAST_DST_TYPE_VA == 0x00c5d770u &&
                  ISAAC_LUA_ENGINE_899A0E0_METATABLE_RAWGETP_KEY == 0x00c829e8u,
              "v81 0x89a0e0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a0e0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a0e0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_VA;
}
uint32_t isaac_lua_engine_899a0e0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_END_VA;
}
uint32_t isaac_lua_engine_899a0e0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_NEXT_VA;
}
uint32_t isaac_lua_engine_899a0e0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a0e0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_ECX_ARG;
}
uint32_t isaac_lua_engine_899a0e0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a0e0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a0e0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a0e0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a0e0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a0e0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a0e0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a0e0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a0e0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a0e0_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a0e0_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a0e0_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a0e0_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a0e0_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a0e0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a0e0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a0e0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a0e0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a0e0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a0e0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a0e0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a0e0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a0e0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a0e0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A0E0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A180_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A180_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A180_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A180_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A180_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A180_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A180_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A180_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A180_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A180_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A180_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A180_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A180_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A180_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A180_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A180_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A180_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A180_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A180_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A180_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A180_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A180_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A180_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A180_VA == 0x0089a180u &&
                  ISAAC_LUA_ENGINE_899A180_END_VA == 0x0089a219u &&
                  ISAAC_LUA_ENGINE_899A180_NEXT_VA == 0x0089a220u &&
                  ISAAC_LUA_ENGINE_899A180_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A180_CAST_DST_TYPE_VA == 0x00c5d770u &&
                  ISAAC_LUA_ENGINE_899A180_METATABLE_RAWGETP_KEY == 0x00c829e9u,
              "v81 0x89a180 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a180_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a180_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_VA;
}
uint32_t isaac_lua_engine_899a180_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_END_VA;
}
uint32_t isaac_lua_engine_899a180_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_NEXT_VA;
}
uint32_t isaac_lua_engine_899a180_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a180_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_ECX_ARG;
}
uint32_t isaac_lua_engine_899a180_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a180_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a180_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a180_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a180_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a180_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a180_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a180_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a180_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a180_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a180_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a180_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a180_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a180_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a180_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a180_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a180_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a180_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a180_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a180_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a180_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a180_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a180_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a180_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A180_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A220_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A220_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A220_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A220_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A220_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A220_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A220_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A220_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A220_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A220_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A220_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A220_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A220_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A220_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A220_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A220_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A220_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A220_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A220_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A220_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A220_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A220_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A220_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A220_VA == 0x0089a220u &&
                  ISAAC_LUA_ENGINE_899A220_END_VA == 0x0089a2b9u &&
                  ISAAC_LUA_ENGINE_899A220_NEXT_VA == 0x0089a2c0u &&
                  ISAAC_LUA_ENGINE_899A220_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A220_CAST_DST_TYPE_VA == 0x00c5e8b8u &&
                  ISAAC_LUA_ENGINE_899A220_METATABLE_RAWGETP_KEY == 0x00c829ebu,
              "v82 0x89a220 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a220_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a220_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_VA;
}
uint32_t isaac_lua_engine_899a220_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_END_VA;
}
uint32_t isaac_lua_engine_899a220_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_NEXT_VA;
}
uint32_t isaac_lua_engine_899a220_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a220_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_ECX_ARG;
}
uint32_t isaac_lua_engine_899a220_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a220_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a220_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a220_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a220_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a220_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a220_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a220_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a220_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a220_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a220_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a220_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a220_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a220_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a220_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a220_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a220_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a220_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a220_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a220_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a220_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a220_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a220_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a220_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A220_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A2C0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A2C0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A2C0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A2C0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A2C0_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A2C0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A2C0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A2C0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A2C0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A2C0_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A2C0_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A2C0_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A2C0_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A2C0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A2C0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A2C0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A2C0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A2C0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A2C0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A2C0_VA == 0x0089a2c0u &&
                  ISAAC_LUA_ENGINE_899A2C0_END_VA == 0x0089a359u &&
                  ISAAC_LUA_ENGINE_899A2C0_NEXT_VA == 0x0089a360u &&
                  ISAAC_LUA_ENGINE_899A2C0_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A2C0_CAST_DST_TYPE_VA == 0x00c5e8b8u &&
                  ISAAC_LUA_ENGINE_899A2C0_METATABLE_RAWGETP_KEY == 0x00c829ecu,
              "v82 0x89a2c0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a2c0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a2c0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_VA;
}
uint32_t isaac_lua_engine_899a2c0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_END_VA;
}
uint32_t isaac_lua_engine_899a2c0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_NEXT_VA;
}
uint32_t isaac_lua_engine_899a2c0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a2c0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_ECX_ARG;
}
uint32_t isaac_lua_engine_899a2c0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a2c0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a2c0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a2c0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a2c0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a2c0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a2c0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a2c0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a2c0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a2c0_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a2c0_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a2c0_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a2c0_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a2c0_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a2c0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a2c0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a2c0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a2c0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a2c0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a2c0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a2c0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a2c0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a2c0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a2c0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A2C0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A360_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A360_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A360_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A360_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A360_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A360_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A360_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A360_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A360_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A360_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A360_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A360_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A360_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A360_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A360_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A360_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A360_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A360_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A360_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A360_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A360_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A360_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A360_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A360_VA == 0x0089a360u &&
                  ISAAC_LUA_ENGINE_899A360_END_VA == 0x0089a3f9u &&
                  ISAAC_LUA_ENGINE_899A360_NEXT_VA == 0x0089a400u &&
                  ISAAC_LUA_ENGINE_899A360_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A360_CAST_DST_TYPE_VA == 0x00c5d964u &&
                  ISAAC_LUA_ENGINE_899A360_METATABLE_RAWGETP_KEY == 0x00c829e5u,
              "v83 0x89a360 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a360_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a360_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_VA;
}
uint32_t isaac_lua_engine_899a360_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_END_VA;
}
uint32_t isaac_lua_engine_899a360_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_NEXT_VA;
}
uint32_t isaac_lua_engine_899a360_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a360_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_ECX_ARG;
}
uint32_t isaac_lua_engine_899a360_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a360_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a360_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a360_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a360_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a360_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a360_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a360_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a360_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a360_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a360_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a360_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a360_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a360_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a360_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a360_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a360_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a360_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a360_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a360_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a360_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a360_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a360_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a360_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A360_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A400_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A400_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A400_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A400_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A400_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A400_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A400_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A400_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A400_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A400_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A400_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899A400_CAST_VF_DELTA == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A400_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899A400_CAST_IS_REFERENCE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A400_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899A400_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A400_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899A400_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A400_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A400_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899A400_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899A400_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899A400_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A400_VA == 0x0089a400u &&
                  ISAAC_LUA_ENGINE_899A400_END_VA == 0x0089a499u &&
                  ISAAC_LUA_ENGINE_899A400_NEXT_VA == 0x0089a4a0u &&
                  ISAAC_LUA_ENGINE_899A400_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A400_CAST_DST_TYPE_VA == 0x00c5d964u &&
                  ISAAC_LUA_ENGINE_899A400_METATABLE_RAWGETP_KEY == 0x00c829e6u,
              "v83 0x89a400 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a400_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je`): nil SKIPS the check/get (obj stays null for the
     dynamic_cast), non-nil takes it. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a400_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_VA;
}
uint32_t isaac_lua_engine_899a400_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_END_VA;
}
uint32_t isaac_lua_engine_899a400_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_NEXT_VA;
}
uint32_t isaac_lua_engine_899a400_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a400_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_ECX_ARG;
}
uint32_t isaac_lua_engine_899a400_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a400_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a400_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a400_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a400_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a400_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a400_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a400_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a400_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a400_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899a400_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899a400_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899a400_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899a400_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899a400_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899a400_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a400_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a400_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a400_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a400_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a400_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899a400_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899a400_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899a400_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A400_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A4A0_VA == 0x0089a4a0u &&
                  ISAAC_LUA_ENGINE_899A4A0_END_VA == 0x0089a50cu &&
                  ISAAC_LUA_ENGINE_899A4A0_NEXT_VA == 0x0089a510u &&
                  ISAAC_LUA_ENGINE_899A4A0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A4A0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A4A0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A4A0_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A4A0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A4A0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A4A0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A4A0_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A4A0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A4A0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A4A0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A4A0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_CHECKINTEGER == 0x00b183f4u &&
                  ISAAC_LUA_ENGINE_899A4A0_CHECKINTEGER_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899A4A0_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A4A0_RETURN_VALUE == 0x00000000u,
              "v84 0x89a4a0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a4a0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a4a0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_VA;
}
uint32_t isaac_lua_engine_899a4a0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_END_VA;
}
uint32_t isaac_lua_engine_899a4a0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_NEXT_VA;
}
uint32_t isaac_lua_engine_899a4a0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a4a0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_ECX_ARG;
}
uint32_t isaac_lua_engine_899a4a0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a4a0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a4a0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a4a0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a4a0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a4a0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a4a0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a4a0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a4a0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a4a0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a4a0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a4a0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a4a0_iat_lua_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_IAT_LUA_CHECKINTEGER;
}
uint32_t isaac_lua_engine_899a4a0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_CHECKINTEGER_INDEX;
}
uint32_t isaac_lua_engine_899a4a0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a4a0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A4A0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A510_VA == 0x0089a510u &&
                  ISAAC_LUA_ENGINE_899A510_END_VA == 0x0089a56cu &&
                  ISAAC_LUA_ENGINE_899A510_NEXT_VA == 0x0089a570u &&
                  ISAAC_LUA_ENGINE_899A510_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A510_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A510_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A510_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A510_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A510_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A510_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A510_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A510_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A510_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A510_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A510_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A510_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A510_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A510_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A510_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A510_PUSHER_HELPER_VA == 0x0085bfd0u,
              "v84 0x89a510 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a510_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a510_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_VA;
}
uint32_t isaac_lua_engine_899a510_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_END_VA;
}
uint32_t isaac_lua_engine_899a510_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_NEXT_VA;
}
uint32_t isaac_lua_engine_899a510_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a510_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_ECX_ARG;
}
uint32_t isaac_lua_engine_899a510_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a510_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a510_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a510_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a510_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a510_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a510_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a510_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a510_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a510_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a510_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a510_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a510_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a510_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899a510_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A510_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A570_VA == 0x0089a570u &&
                  ISAAC_LUA_ENGINE_899A570_END_VA == 0x0089a5ccu &&
                  ISAAC_LUA_ENGINE_899A570_NEXT_VA == 0x0089a5d0u &&
                  ISAAC_LUA_ENGINE_899A570_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A570_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A570_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A570_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A570_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A570_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A570_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A570_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A570_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A570_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A570_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A570_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A570_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A570_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A570_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A570_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A570_PUSHER_HELPER_VA == 0x0085bff0u,
              "v85 0x89a570 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a570_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a570_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_VA;
}
uint32_t isaac_lua_engine_899a570_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_END_VA;
}
uint32_t isaac_lua_engine_899a570_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_NEXT_VA;
}
uint32_t isaac_lua_engine_899a570_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a570_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_ECX_ARG;
}
uint32_t isaac_lua_engine_899a570_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a570_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a570_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a570_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a570_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a570_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a570_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a570_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a570_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a570_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a570_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a570_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a570_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a570_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899a570_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A570_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A5D0_VA == 0x0089a5d0u &&
                  ISAAC_LUA_ENGINE_899A5D0_END_VA == 0x0089a66eu &&
                  ISAAC_LUA_ENGINE_899A5D0_NEXT_VA == 0x0089a670u &&
                  ISAAC_LUA_ENGINE_899A5D0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A5D0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A5D0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A5D0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A5D0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A5D0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A5D0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A5D0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A5D0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A5D0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A5D0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A5D0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A5D0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A5D0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A5D0_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A5D0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A5D0_NEWUSERDATA_SIZE == 0x00000010u &&
                  ISAAC_LUA_ENGINE_899A5D0_UD_VTABLE_VA == 0x00b73574u &&
                  ISAAC_LUA_ENGINE_899A5D0_UD_PAYLOAD_PTR_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A5D0_UD_PAYLOAD_OFF == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A5D0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A5D0_METATABLE_RAWGETP_KEY == 0x00c82980u,
              "v85 0x89a5d0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a5d0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a5d0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_VA;
}
uint32_t isaac_lua_engine_899a5d0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_END_VA;
}
uint32_t isaac_lua_engine_899a5d0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_NEXT_VA;
}
uint32_t isaac_lua_engine_899a5d0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a5d0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_ECX_ARG;
}
uint32_t isaac_lua_engine_899a5d0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a5d0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a5d0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a5d0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a5d0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a5d0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a5d0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a5d0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a5d0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a5d0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a5d0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a5d0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a5d0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a5d0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a5d0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a5d0_ud_payload_ptr_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_UD_PAYLOAD_PTR_OFF;
}
uint32_t isaac_lua_engine_899a5d0_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_UD_PAYLOAD_OFF;
}
uint32_t isaac_lua_engine_899a5d0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a5d0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a5d0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A5D0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A670_VA == 0x0089a670u &&
                  ISAAC_LUA_ENGINE_899A670_END_VA == 0x0089a6f2u &&
                  ISAAC_LUA_ENGINE_899A670_NEXT_VA == 0x0089a700u &&
                  ISAAC_LUA_ENGINE_899A670_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A670_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A670_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A670_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A670_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A670_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A670_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A670_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A670_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A670_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A670_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A670_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A670_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A670_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A670_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A670_RETURN_VALUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A670_FLOAT_LANE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A670_IAT_LUA_CHECKNUMBER == 0x00b18324u &&
                  ISAAC_LUA_ENGINE_899A670_CHECKNUMBER_INDEX == 0x00000002u,
              "v85 0x89a670 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a670_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a670_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_VA;
}
uint32_t isaac_lua_engine_899a670_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_END_VA;
}
uint32_t isaac_lua_engine_899a670_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_NEXT_VA;
}
uint32_t isaac_lua_engine_899a670_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a670_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_ECX_ARG;
}
uint32_t isaac_lua_engine_899a670_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a670_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a670_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a670_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a670_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a670_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a670_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a670_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a670_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a670_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a670_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a670_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a670_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a670_float_lane(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_FLOAT_LANE;
}
uint32_t isaac_lua_engine_899a670_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_IAT_LUA_CHECKNUMBER;
}
uint32_t isaac_lua_engine_899a670_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899a670_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A670_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A700_VA == 0x0089a700u &&
                  ISAAC_LUA_ENGINE_899A700_END_VA == 0x0089a769u &&
                  ISAAC_LUA_ENGINE_899A700_NEXT_VA == 0x0089a770u &&
                  ISAAC_LUA_ENGINE_899A700_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A700_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A700_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A700_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A700_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A700_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A700_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899A700_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A700_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A700_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A700_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A700_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A700_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A700_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A700_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A700_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A700_FLOAT_PUSHER_HELPER_VA == 0x0085c050u &&
                  ISAAC_LUA_ENGINE_899A700_FLOAT_LANE == 0x00000001u,
              "v85 0x89a700 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a700_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a700_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_VA;
}
uint32_t isaac_lua_engine_899a700_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_END_VA;
}
uint32_t isaac_lua_engine_899a700_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_NEXT_VA;
}
uint32_t isaac_lua_engine_899a700_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a700_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_ECX_ARG;
}
uint32_t isaac_lua_engine_899a700_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a700_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a700_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a700_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a700_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a700_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a700_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a700_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a700_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a700_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a700_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a700_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a700_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a700_float_lane(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_FLOAT_LANE;
}
uint32_t isaac_lua_engine_899a700_float_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_FLOAT_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899a700_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A700_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A770_VA == 0x0089a770u &&
                  ISAAC_LUA_ENGINE_899A770_END_VA == 0x0089a803u &&
                  ISAAC_LUA_ENGINE_899A770_NEXT_VA == 0x0089a810u &&
                  ISAAC_LUA_ENGINE_899A770_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A770_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A770_CHECKGET_KEY == 0x00c829e0u &&
                  ISAAC_LUA_ENGINE_899A770_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A770_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A770_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A770_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A770_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A770_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A770_RETURN_VALUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_KEY == 0x00c8299bu &&
                  ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A770_METHOD_STRUCT_ARG_BYTES == 0x00000010u,
              "v87 0x89a770 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a770_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a770_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_VA;
}
uint32_t isaac_lua_engine_899a770_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_END_VA;
}
uint32_t isaac_lua_engine_899a770_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_NEXT_VA;
}
uint32_t isaac_lua_engine_899a770_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a770_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_ECX_ARG;
}
uint32_t isaac_lua_engine_899a770_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a770_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a770_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a770_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a770_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a770_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a770_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a770_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a770_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a770_second_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a770_second_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a770_second_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a770_second_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_SECOND_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a770_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a770_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a770_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a770_method_struct_arg_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_METHOD_STRUCT_ARG_BYTES;
}
uint32_t isaac_lua_engine_899a770_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a770_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A770_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A810_VA == 0x0089a810u &&
                  ISAAC_LUA_ENGINE_899A810_END_VA == 0x0089a8aau &&
                  ISAAC_LUA_ENGINE_899A810_NEXT_VA == 0x0089a8b0u &&
                  ISAAC_LUA_ENGINE_899A810_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A810_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A810_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A810_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A810_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A810_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A810_CHECKGET_KEY == 0x00c829e0u &&
                  ISAAC_LUA_ENGINE_899A810_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A810_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A810_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A810_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A810_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A810_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A810_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A810_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A810_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A810_NEWUSERDATA_SIZE == 0x00000018u &&
                  ISAAC_LUA_ENGINE_899A810_UD_VTABLE_VA == 0x00b7364cu &&
                  ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_PTR_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_OFF == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_BYTES == 0x00000010u &&
                  ISAAC_LUA_ENGINE_899A810_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A810_METATABLE_RAWGETP_KEY == 0x00c8299bu,
              "v87 0x89a810 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a810_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. Never byte-masked (0x100 -> taken). */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a810_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_VA;
}
uint32_t isaac_lua_engine_899a810_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_END_VA;
}
uint32_t isaac_lua_engine_899a810_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_NEXT_VA;
}
uint32_t isaac_lua_engine_899a810_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a810_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_ECX_ARG;
}
uint32_t isaac_lua_engine_899a810_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a810_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a810_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a810_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a810_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a810_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a810_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a810_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a810_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a810_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a810_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a810_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a810_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a810_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a810_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a810_ud_payload_ptr_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_PTR_OFF;
}
uint32_t isaac_lua_engine_899a810_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_OFF;
}
uint32_t isaac_lua_engine_899a810_ud_payload_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_UD_PAYLOAD_BYTES;
}
uint32_t isaac_lua_engine_899a810_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a810_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a810_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A810_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899A8B0_VA == 0x0089a8b0u &&
                  ISAAC_LUA_ENGINE_899A8B0_END_VA == 0x0089aa4eu &&
                  ISAAC_LUA_ENGINE_899A8B0_NEXT_VA == 0x0089aa50u &&
                  ISAAC_LUA_ENGINE_899A8B0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A8B0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A8B0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A8B0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A8B0_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A8B0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899A8B0_CHECKGET_KEY == 0x00c8297au &&
                  ISAAC_LUA_ENGINE_899A8B0_CHECKGET_INDEX == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A8B0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A8B0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A8B0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899A8B0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899A8B0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899A8B0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899A8B0_METHOD_STACK_ARGS == 0x00000006u &&
                  ISAAC_LUA_ENGINE_899A8B0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A8B0_FRAME_REALIGNMENT == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A8B0_PRE_GATE_TOUSERDATA == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899A8B0_CHECKNUMBER_INDEX == 0x00000005u &&
                  ISAAC_LUA_ENGINE_899A8B0_VECTOR_HELPER_VA == 0x008baa50u &&
                  ISAAC_LUA_ENGINE_899A8B0_VECTOR_CALL_COUNT == 0x00000003u &&
                  ISAAC_LUA_ENGINE_899A8B0_NEWUSERDATA_SIZE == 0x00000010u &&
                  ISAAC_LUA_ENGINE_899A8B0_UD_VTABLE_VA == 0x00b73574u &&
                  ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_PTR_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_OFF == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_BYTES == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899A8B0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899A8B0_METATABLE_RAWGETP_KEY == 0x00c82980u,
              "v88 0x89a8b0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899a8b0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with INVERTED encoding (`test eax,eax; je`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899a8b0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_VA;
}
uint32_t isaac_lua_engine_899a8b0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_END_VA;
}
uint32_t isaac_lua_engine_899a8b0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_NEXT_VA;
}
uint32_t isaac_lua_engine_899a8b0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a8b0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_ECX_ARG;
}
uint32_t isaac_lua_engine_899a8b0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a8b0_frame_realignment(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_FRAME_REALIGNMENT;
}
uint32_t isaac_lua_engine_899a8b0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899a8b0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899a8b0_pre_gate_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_PRE_GATE_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a8b0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899a8b0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899a8b0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899a8b0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899a8b0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a8b0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899a8b0_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899a8b0_vector_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_VECTOR_HELPER_VA;
}
uint32_t isaac_lua_engine_899a8b0_vector_call_count(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_VECTOR_CALL_COUNT;
}
uint32_t isaac_lua_engine_899a8b0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899a8b0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899a8b0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899a8b0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899a8b0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899a8b0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899a8b0_ud_payload_ptr_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_PTR_OFF;
}
uint32_t isaac_lua_engine_899a8b0_ud_payload_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_OFF;
}
uint32_t isaac_lua_engine_899a8b0_ud_payload_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_UD_PAYLOAD_BYTES;
}
uint32_t isaac_lua_engine_899a8b0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899a8b0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899a8b0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899A8B0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AA50_VA == 0x0089aa50u &&
                  ISAAC_LUA_ENGINE_899AA50_END_VA == 0x0089aad2u &&
                  ISAAC_LUA_ENGINE_899AA50_NEXT_VA == 0x0089aae0u &&
                  ISAAC_LUA_ENGINE_899AA50_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AA50_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AA50_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AA50_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AA50_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AA50_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AA50_CHECKGET_KEY == 0x00c829ddu &&
                  ISAAC_LUA_ENGINE_899AA50_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AA50_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AA50_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AA50_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AA50_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AA50_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AA50_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AA50_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AA50_RETURN_VALUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AA50_CHECKNUMBER_INDEX == 0x00000002u,
              "v88 0x89aa50 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899aa50_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with standard encoding (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899aa50_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_VA;
}
uint32_t isaac_lua_engine_899aa50_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_END_VA;
}
uint32_t isaac_lua_engine_899aa50_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_NEXT_VA;
}
uint32_t isaac_lua_engine_899aa50_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aa50_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_ECX_ARG;
}
uint32_t isaac_lua_engine_899aa50_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aa50_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899aa50_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899aa50_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899aa50_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899aa50_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899aa50_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899aa50_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aa50_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899aa50_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899aa50_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899aa50_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899aa50_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aa50_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aa50_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AA50_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AAE0_VA == 0x0089aae0u &&
                  ISAAC_LUA_ENGINE_899AAE0_END_VA == 0x0089ab49u &&
                  ISAAC_LUA_ENGINE_899AAE0_NEXT_VA == 0x0089ab50u &&
                  ISAAC_LUA_ENGINE_899AAE0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AAE0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AAE0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AAE0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AAE0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AAE0_CHECKGET_KEY == 0x00c829ddu &&
                  ISAAC_LUA_ENGINE_899AAE0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AAE0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AAE0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AAE0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AAE0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AAE0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AAE0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AAE0_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AAE0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AAE0_PUSHER_HELPER_VA == 0x0085c050u,
              "v89 0x89aae0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899aae0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899aae0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_VA;
}
uint32_t isaac_lua_engine_899aae0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_END_VA;
}
uint32_t isaac_lua_engine_899aae0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_NEXT_VA;
}
uint32_t isaac_lua_engine_899aae0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aae0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_ECX_ARG;
}
uint32_t isaac_lua_engine_899aae0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aae0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899aae0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899aae0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899aae0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899aae0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899aae0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aae0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899aae0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899aae0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899aae0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aae0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aae0_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899aae0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AAE0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AB50_VA == 0x0089ab50u &&
                  ISAAC_LUA_ENGINE_899AB50_END_VA == 0x0089abe3u &&
                  ISAAC_LUA_ENGINE_899AB50_NEXT_VA == 0x0089abf0u &&
                  ISAAC_LUA_ENGINE_899AB50_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AB50_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AB50_CHECKGET_KEY == 0x00c829ddu &&
                  ISAAC_LUA_ENGINE_899AB50_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AB50_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AB50_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AB50_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AB50_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AB50_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AB50_RETURN_VALUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_KEY == 0x00c8299bu &&
                  ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AB50_METHOD_STRUCT_ARG_BYTES == 0x00000010u,
              "v89 0x89ab50 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899ab50_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899ab50_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_VA;
}
uint32_t isaac_lua_engine_899ab50_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_END_VA;
}
uint32_t isaac_lua_engine_899ab50_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_NEXT_VA;
}
uint32_t isaac_lua_engine_899ab50_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ab50_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_ECX_ARG;
}
uint32_t isaac_lua_engine_899ab50_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ab50_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899ab50_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899ab50_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ab50_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ab50_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ab50_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ab50_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899ab50_second_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ab50_second_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ab50_second_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ab50_second_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_SECOND_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ab50_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ab50_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899ab50_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ab50_method_struct_arg_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_METHOD_STRUCT_ARG_BYTES;
}
uint32_t isaac_lua_engine_899ab50_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ab50_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AB50_RETURN_VALUE;
};

static_assert(ISAAC_LUA_ENGINE_899BD0_VA == 0x00899bd0u &&
                  ISAAC_LUA_ENGINE_899BD0_END_VA == 0x00899c69u &&
                  ISAAC_LUA_ENGINE_899BD0_NEXT_VA == 0x00899c70u &&
                  ISAAC_LUA_ENGINE_899BD0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BD0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BD0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BD0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BD0_GATE_INVERTED_ENCODING == 0x1u &&
                  ISAAC_LUA_ENGINE_899BD0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899BD0_CHECKGET_KEY == 0x00c82a1eu &&
                  ISAAC_LUA_ENGINE_899BD0_CHECKGET_INDEX == 0x1u &&
                  ISAAC_LUA_ENGINE_899BD0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BD0_CHECKGET_FIELD_OFF == 0x4u &&
                  ISAAC_LUA_ENGINE_899BD0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899BD0_CAST_HELPER_VA == 0x00af08b1u &&
                  ISAAC_LUA_ENGINE_899BD0_CAST_VF_DELTA == 0x0u &&
                  ISAAC_LUA_ENGINE_899BD0_CAST_SRC_TYPE_VA == 0x00c5d7a4u &&
                  ISAAC_LUA_ENGINE_899BD0_CAST_DST_TYPE_VA == 0x00c5e8ecu &&
                  ISAAC_LUA_ENGINE_899BD0_CAST_IS_REFERENCE == 0x0u &&
                  ISAAC_LUA_ENGINE_899BD0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899BD0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899BD0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899BD0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899BD0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899BD0_METATABLE_RAWGETP_KEY == 0x00c829f1u &&
                  ISAAC_LUA_ENGINE_899BD0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899BD0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899BD0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899BD0_RETURN_VALUE == 0x1u,
              "v77 0x899bd0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899bd0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate written with inverted encoding (`test
     eax,eax; je` @0x899be6): nil SKIPS the check/get (obj stays
     null for the dynamic_cast), non-nil takes it. Same truth table as
     the prior bands: taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899bd0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_VA;
}
uint32_t isaac_lua_engine_899bd0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_END_VA;
}
uint32_t isaac_lua_engine_899bd0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_NEXT_VA;
}
uint32_t isaac_lua_engine_899bd0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899bd0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_ECX_ARG;
}
uint32_t isaac_lua_engine_899bd0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899bd0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899bd0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899bd0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899bd0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899bd0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899bd0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899bd0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899bd0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899bd0_cast_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CAST_HELPER_VA;
}
uint32_t isaac_lua_engine_899bd0_cast_vf_delta(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CAST_VF_DELTA;
}
uint32_t isaac_lua_engine_899bd0_cast_src_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CAST_SRC_TYPE_VA;
}
uint32_t isaac_lua_engine_899bd0_cast_dst_type_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CAST_DST_TYPE_VA;
}
uint32_t isaac_lua_engine_899bd0_cast_is_reference(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_CAST_IS_REFERENCE;
}
uint32_t isaac_lua_engine_899bd0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899bd0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899bd0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899bd0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899bd0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899bd0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899bd0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899bd0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899bd0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899bd0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BD0_RETURN_VALUE;
}


int32_t isaac_lua_engine_899ae70_bool_word(uint32_t toboolean_result) {
  return toboolean_result != 0u ? 1 : 0;
}

int32_t isaac_lua_engine_899aee0_method_return_byte_gate(uint32_t method_result) {
  return (method_result & 0xffu) != 0u ? 1 : 0;
}

static_assert(ISAAC_LUA_ENGINE_899ABF0_VA == 0x0089abf0u &&
                  ISAAC_LUA_ENGINE_899ABF0_END_VA == 0x0089ac8au &&
                  ISAAC_LUA_ENGINE_899ABF0_NEXT_VA == 0x0089ac90u &&
                  ISAAC_LUA_ENGINE_899ABF0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899ABF0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899ABF0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899ABF0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899ABF0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899ABF0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899ABF0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899ABF0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899ABF0_CHECKGET_KEY == 0x00c829ddu &&
                  ISAAC_LUA_ENGINE_899ABF0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899ABF0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899ABF0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899ABF0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899ABF0_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899ABF0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899ABF0_NEWUSERDATA_SIZE == 0x00000018u &&
                  ISAAC_LUA_ENGINE_899ABF0_UD_VTABLE_VA == 0x00b7364cu &&
                  ISAAC_LUA_ENGINE_899ABF0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899ABF0_UD_PAYLOAD_BYTES == 0x00000010u &&
                  ISAAC_LUA_ENGINE_899ABF0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899ABF0_METATABLE_RAWGETP_KEY == 0x00c8299bu,
              "v90 0x89abf0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899abf0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899abf0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_VA;
}
uint32_t isaac_lua_engine_899abf0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_END_VA;
}
uint32_t isaac_lua_engine_899abf0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_NEXT_VA;
}
uint32_t isaac_lua_engine_899abf0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899abf0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_ECX_ARG;
}
uint32_t isaac_lua_engine_899abf0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899abf0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899abf0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899abf0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899abf0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899abf0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899abf0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899abf0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899abf0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899abf0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899abf0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899abf0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899abf0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899abf0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899abf0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899abf0_ud_payload_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_UD_PAYLOAD_BYTES;
}
uint32_t isaac_lua_engine_899abf0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899abf0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899abf0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899ABF0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AC90_VA == 0x0089ac90u &&
                  ISAAC_LUA_ENGINE_899AC90_END_VA == 0x0089ad6du &&
                  ISAAC_LUA_ENGINE_899AC90_NEXT_VA == 0x0089ad70u &&
                  ISAAC_LUA_ENGINE_899AC90_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AC90_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AC90_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AC90_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AC90_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AC90_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AC90_METHOD_STACK_ARGS == 0x00000007u &&
                  ISAAC_LUA_ENGINE_899AC90_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AC90_FRAME_REALIGNMENT == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AC90_PRE_GATE_TOUSERDATA == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AC90_STRUCT_HELPER_VA == 0x008b1c80u &&
                  ISAAC_LUA_ENGINE_899AC90_NULL_RESULT_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899AC90_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899AC90_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899AC90_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AC90_UD_PAYLOAD_BYTES == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899AC90_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899AC90_METATABLE_RAWGETP_KEY == 0x00c829ddu,
              "v90 0x89ac90 span/island pins must match the PE decode");

uint32_t isaac_lua_engine_899ac90_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_VA;
}
uint32_t isaac_lua_engine_899ac90_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_END_VA;
}
uint32_t isaac_lua_engine_899ac90_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_NEXT_VA;
}
uint32_t isaac_lua_engine_899ac90_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ac90_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_ECX_ARG;
}
uint32_t isaac_lua_engine_899ac90_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ac90_frame_realignment(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_FRAME_REALIGNMENT;
}
uint32_t isaac_lua_engine_899ac90_pre_gate_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_PRE_GATE_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ac90_struct_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_STRUCT_HELPER_VA;
}
uint32_t isaac_lua_engine_899ac90_null_result_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_NULL_RESULT_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899ac90_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ac90_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899ac90_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ac90_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ac90_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899ac90_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899ac90_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ac90_ud_payload_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_UD_PAYLOAD_BYTES;
}
uint32_t isaac_lua_engine_899ac90_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899ac90_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899ac90_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AC90_RETURN_VALUE;
}

static_assert(ISAAC_LUA_ENGINE_899AD70_VA == 0x0089ad70u &&
                  ISAAC_LUA_ENGINE_899AD70_END_VA == 0x0089adf2u &&
                  ISAAC_LUA_ENGINE_899AD70_NEXT_VA == 0x0089ae00u &&
                  ISAAC_LUA_ENGINE_899AD70_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AD70_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AD70_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AD70_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AD70_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AD70_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AD70_CHECKGET_KEY == 0x00c829dau &&
                  ISAAC_LUA_ENGINE_899AD70_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AD70_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AD70_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AD70_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AD70_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AD70_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AD70_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AD70_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AD70_RETURN_VALUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AD70_CHECKNUMBER_INDEX == 0x00000002u,
              "v91 0x89ad70 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899ad70_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899ad70_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_VA;
}
uint32_t isaac_lua_engine_899ad70_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_END_VA;
}
uint32_t isaac_lua_engine_899ad70_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_NEXT_VA;
}
uint32_t isaac_lua_engine_899ad70_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ad70_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_ECX_ARG;
}
uint32_t isaac_lua_engine_899ad70_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ad70_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899ad70_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899ad70_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899ad70_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ad70_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ad70_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ad70_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ad70_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899ad70_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ad70_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899ad70_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ad70_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ad70_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899ad70_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AD70_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AE00_VA == 0x0089ae00u &&
                  ISAAC_LUA_ENGINE_899AE00_END_VA == 0x0089ae69u &&
                  ISAAC_LUA_ENGINE_899AE00_NEXT_VA == 0x0089ae70u &&
                  ISAAC_LUA_ENGINE_899AE00_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE00_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE00_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE00_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE00_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE00_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AE00_CHECKGET_KEY == 0x00c829dau &&
                  ISAAC_LUA_ENGINE_899AE00_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE00_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE00_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AE00_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AE00_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AE00_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AE00_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE00_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE00_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE00_PUSHER_HELPER_VA == 0x0085c050u,
              "v91 0x89ae00 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899ae00_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899ae00_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_VA;
}
uint32_t isaac_lua_engine_899ae00_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_END_VA;
}
uint32_t isaac_lua_engine_899ae00_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_NEXT_VA;
}
uint32_t isaac_lua_engine_899ae00_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ae00_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_ECX_ARG;
}
uint32_t isaac_lua_engine_899ae00_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ae00_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899ae00_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899ae00_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899ae00_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ae00_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ae00_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ae00_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ae00_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899ae00_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ae00_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899ae00_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ae00_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ae00_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899ae00_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE00_RETURN_VALUE;
}

static_assert(ISAAC_LUA_ENGINE_899AE70_VA == 0x0089ae70u &&
                  ISAAC_LUA_ENGINE_899AE70_END_VA == 0x0089aed9u &&
                  ISAAC_LUA_ENGINE_899AE70_NEXT_VA == 0x0089aee0u &&
                  ISAAC_LUA_ENGINE_899AE70_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE70_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE70_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE70_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AE70_CHECKGET_KEY == 0x00c829dau &&
                  ISAAC_LUA_ENGINE_899AE70_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE70_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE70_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AE70_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AE70_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AE70_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE70_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AE70_RETURN_VALUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TOBOOLEAN == 0x00b183e8u &&
                  ISAAC_LUA_ENGINE_899AE70_TOBOOLEAN_INDEX == 0x00000002u,
              "v92 0x89ae70 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899ae70_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899ae70_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_VA;
}
uint32_t isaac_lua_engine_899ae70_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_END_VA;
}
uint32_t isaac_lua_engine_899ae70_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_NEXT_VA;
}
uint32_t isaac_lua_engine_899ae70_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ae70_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_ECX_ARG;
}
uint32_t isaac_lua_engine_899ae70_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ae70_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899ae70_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899ae70_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ae70_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ae70_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ae70_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ae70_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899ae70_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ae70_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899ae70_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ae70_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_IAT_LUA_TOBOOLEAN;
}
uint32_t isaac_lua_engine_899ae70_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_TOBOOLEAN_INDEX;
}
uint32_t isaac_lua_engine_899ae70_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ae70_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AE70_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AEE0_VA == 0x0089aee0u &&
                  ISAAC_LUA_ENGINE_899AEE0_END_VA == 0x0089af45u &&
                  ISAAC_LUA_ENGINE_899AEE0_NEXT_VA == 0x0089af50u &&
                  ISAAC_LUA_ENGINE_899AEE0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AEE0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AEE0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AEE0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AEE0_CHECKGET_KEY == 0x00c829dau &&
                  ISAAC_LUA_ENGINE_899AEE0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AEE0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AEE0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AEE0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AEE0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AEE0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AEE0_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AEE0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_PUSHBOOLEAN == 0x00b183ecu,
              "v92 0x89aee0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899aee0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899aee0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_VA;
}
uint32_t isaac_lua_engine_899aee0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_END_VA;
}
uint32_t isaac_lua_engine_899aee0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_NEXT_VA;
}
uint32_t isaac_lua_engine_899aee0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aee0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_ECX_ARG;
}
uint32_t isaac_lua_engine_899aee0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aee0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899aee0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899aee0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899aee0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899aee0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899aee0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aee0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899aee0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899aee0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899aee0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aee0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aee0_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_IAT_LUA_PUSHBOOLEAN;
}
uint32_t isaac_lua_engine_899aee0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AEE0_RETURN_VALUE;
}

static_assert(ISAAC_LUA_ENGINE_899AF50_VA == 0x0089af50u &&
                  ISAAC_LUA_ENGINE_899AF50_END_VA == 0x0089afe3u &&
                  ISAAC_LUA_ENGINE_899AF50_NEXT_VA == 0x0089aff0u &&
                  ISAAC_LUA_ENGINE_899AF50_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AF50_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AF50_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AF50_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AF50_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AF50_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AF50_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AF50_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AF50_CHECKGET_KEY == 0x00c829ddu &&
                  ISAAC_LUA_ENGINE_899AF50_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AF50_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AF50_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AF50_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AF50_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AF50_RETURN_VALUE == 0x00000000u,
              "v93 0x89af50 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899af50_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899af50_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_VA;
}
uint32_t isaac_lua_engine_899af50_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_END_VA;
}
uint32_t isaac_lua_engine_899af50_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_NEXT_VA;
}
uint32_t isaac_lua_engine_899af50_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_STACK_ARGS;
}
uint32_t isaac_lua_engine_899af50_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_ECX_ARG;
}
uint32_t isaac_lua_engine_899af50_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899af50_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899af50_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899af50_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899af50_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899af50_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899af50_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899af50_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899af50_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899af50_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899af50_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899af50_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899af50_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AF50_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899AFF0_VA == 0x0089aff0u &&
                  ISAAC_LUA_ENGINE_899AFF0_END_VA == 0x0089b08au &&
                  ISAAC_LUA_ENGINE_899AFF0_NEXT_VA == 0x0089b090u &&
                  ISAAC_LUA_ENGINE_899AFF0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AFF0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AFF0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AFF0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899AFF0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899AFF0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AFF0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899AFF0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899AFF0_CHECKGET_KEY == 0x00c829ddu &&
                  ISAAC_LUA_ENGINE_899AFF0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AFF0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AFF0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AFF0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899AFF0_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AFF0_RETURN_VALUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899AFF0_NEWUSERDATA_SIZE == 0x00000018u &&
                  ISAAC_LUA_ENGINE_899AFF0_UD_VTABLE_VA == 0x00b7364cu &&
                  ISAAC_LUA_ENGINE_899AFF0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899AFF0_UD_PAYLOAD_BYTES == 0x00000010u &&
                  ISAAC_LUA_ENGINE_899AFF0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899AFF0_METATABLE_RAWGETP_KEY == 0x00c8299bu,
              "v93 0x89aff0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899aff0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne`): nil -> null
     object, else check/get path. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899aff0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_VA;
}
uint32_t isaac_lua_engine_899aff0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_END_VA;
}
uint32_t isaac_lua_engine_899aff0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_NEXT_VA;
}
uint32_t isaac_lua_engine_899aff0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aff0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_ECX_ARG;
}
uint32_t isaac_lua_engine_899aff0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aff0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899aff0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899aff0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899aff0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899aff0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899aff0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aff0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899aff0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899aff0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899aff0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aff0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899aff0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899aff0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899aff0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899aff0_ud_payload_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_UD_PAYLOAD_BYTES;
}
uint32_t isaac_lua_engine_899aff0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899aff0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899aff0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899AFF0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B090_VA == 0x0089b090u &&
                  ISAAC_LUA_ENGINE_899B090_END_VA == 0x0089b133u &&
                  ISAAC_LUA_ENGINE_899B090_NEXT_VA == 0x0089b140u &&
                  ISAAC_LUA_ENGINE_899B090_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B090_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B090_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_TYPE_GATES == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B090_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B090_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B090_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B090_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B090_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B090_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B090_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B090_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B090_NIL_PATH_METHOD_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_KEY == 0x00c8297au &&
                  ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B090_RETURN_VALUE == 0x00000000u,
              "v94 0x89b090 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b090_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b0ab):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
int32_t isaac_lua_engine_899b090_type2_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,2) gate (`test eax,eax; jne` @0x89b0ee):
     nil arg2 -> method(0) through [ud+0]; non-nil -> wrap check/get
     path (key 0xc8297a, idx 2). taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b090_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_VA;
}
uint32_t isaac_lua_engine_899b090_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_END_VA;
}
uint32_t isaac_lua_engine_899b090_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_NEXT_VA;
}
uint32_t isaac_lua_engine_899b090_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b090_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_ECX_ARG;
}
uint32_t isaac_lua_engine_899b090_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b090_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b090_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b090_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b090_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b090_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b090_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b090_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b090_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b090_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b090_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b090_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b090_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b090_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b090_nil_path_method_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_NIL_PATH_METHOD_ARG;
}
uint32_t isaac_lua_engine_899b090_wrap_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b090_wrap_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b090_wrap_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_WRAP_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b090_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B090_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B140_VA == 0x0089b140u &&
                  ISAAC_LUA_ENGINE_899B140_END_VA == 0x0089b1dbu &&
                  ISAAC_LUA_ENGINE_899B140_NEXT_VA == 0x0089b1e0u &&
                  ISAAC_LUA_ENGINE_899B140_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B140_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B140_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B140_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B140_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B140_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B140_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B140_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B140_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B140_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B140_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B140_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B140_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B140_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B140_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B140_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B140_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899B140_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899B140_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899B140_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B140_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899B140_METATABLE_RAWGETP_KEY == 0x00c8297au &&
                  ISAAC_LUA_ENGINE_899B140_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899B140_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899B140_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899B140_RETURN_VALUE == 0x00000001u,
              "v94 0x89b140 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b140_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b156):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b140_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_VA;
}
uint32_t isaac_lua_engine_899b140_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_END_VA;
}
uint32_t isaac_lua_engine_899b140_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_NEXT_VA;
}
uint32_t isaac_lua_engine_899b140_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b140_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_ECX_ARG;
}
uint32_t isaac_lua_engine_899b140_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b140_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b140_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b140_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b140_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b140_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b140_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b140_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b140_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b140_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b140_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b140_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b140_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b140_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b140_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899b140_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899b140_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899b140_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b140_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899b140_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899b140_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899b140_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899b140_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899b140_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B140_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B1E0_VA == 0x0089b1e0u &&
                  ISAAC_LUA_ENGINE_899B1E0_END_VA == 0x0089b27bu &&
                  ISAAC_LUA_ENGINE_899B1E0_NEXT_VA == 0x0089b280u &&
                  ISAAC_LUA_ENGINE_899B1E0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B1E0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B1E0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B1E0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B1E0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B1E0_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B1E0_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B1E0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B1E0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B1E0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B1E0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B1E0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B1E0_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B1E0_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899B1E0_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899B1E0_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899B1E0_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B1E0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899B1E0_METATABLE_RAWGETP_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899B1E0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899B1E0_RETURN_VALUE == 0x00000001u,
              "v95 0x89b1e0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b1e0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b1f6):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b1e0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_VA;
}
uint32_t isaac_lua_engine_899b1e0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_END_VA;
}
uint32_t isaac_lua_engine_899b1e0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_NEXT_VA;
}
uint32_t isaac_lua_engine_899b1e0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b1e0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_ECX_ARG;
}
uint32_t isaac_lua_engine_899b1e0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b1e0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b1e0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b1e0_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b1e0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b1e0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b1e0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b1e0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b1e0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b1e0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b1e0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b1e0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b1e0_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b1e0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b1e0_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899b1e0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899b1e0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899b1e0_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b1e0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899b1e0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899b1e0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899b1e0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899b1e0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899b1e0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B1E0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B280_VA == 0x0089b280u &&
                  ISAAC_LUA_ENGINE_899B280_END_VA == 0x0089b302u &&
                  ISAAC_LUA_ENGINE_899B280_NEXT_VA == 0x0089b310u &&
                  ISAAC_LUA_ENGINE_899B280_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B280_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B280_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B280_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B280_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B280_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B280_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B280_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B280_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B280_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B280_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B280_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B280_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B280_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B280_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B280_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B280_FLOAT_LANE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B280_IAT_LUA_CHECKNUMBER == 0x00b18324u &&
                  ISAAC_LUA_ENGINE_899B280_CHECKNUMBER_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B280_RETURN_VALUE == 0x00000000u,
              "v95 0x89b280 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b280_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b29c):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b280_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_VA;
}
uint32_t isaac_lua_engine_899b280_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_END_VA;
}
uint32_t isaac_lua_engine_899b280_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_NEXT_VA;
}
uint32_t isaac_lua_engine_899b280_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b280_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_ECX_ARG;
}
uint32_t isaac_lua_engine_899b280_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b280_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b280_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b280_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b280_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b280_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b280_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b280_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b280_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b280_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b280_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b280_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b280_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b280_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b280_float_lane(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_FLOAT_LANE;
}
uint32_t isaac_lua_engine_899b280_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_IAT_LUA_CHECKNUMBER;
}
uint32_t isaac_lua_engine_899b280_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899b280_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B280_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B310_VA == 0x0089b310u &&
                  ISAAC_LUA_ENGINE_899B310_END_VA == 0x0089b379u &&
                  ISAAC_LUA_ENGINE_899B310_NEXT_VA == 0x0089b380u &&
                  ISAAC_LUA_ENGINE_899B310_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B310_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B310_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B310_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B310_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B310_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B310_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B310_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B310_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B310_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B310_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B310_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B310_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B310_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B310_METHOD_VTABLE_FIELD_OFF == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B310_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B310_FLOAT_LANE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B310_FLOAT_PUSHER_HELPER_VA == 0x0085c050u &&
                  ISAAC_LUA_ENGINE_899B310_RETURN_VALUE == 0x00000001u,
              "v96 0x89b310 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b310_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b327):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b310_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_VA;
}
uint32_t isaac_lua_engine_899b310_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_END_VA;
}
uint32_t isaac_lua_engine_899b310_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_NEXT_VA;
}
uint32_t isaac_lua_engine_899b310_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b310_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_ECX_ARG;
}
uint32_t isaac_lua_engine_899b310_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b310_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b310_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b310_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b310_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b310_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b310_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b310_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b310_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b310_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b310_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b310_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b310_method_vtable_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_METHOD_VTABLE_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b310_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b310_float_lane(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_FLOAT_LANE;
}
uint32_t isaac_lua_engine_899b310_float_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_FLOAT_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899b310_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B310_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B380_VA == 0x0089b380u &&
                  ISAAC_LUA_ENGINE_899B380_END_VA == 0x0089b533u &&
                  ISAAC_LUA_ENGINE_899B380_NEXT_VA == 0x0089b540u &&
                  ISAAC_LUA_ENGINE_899B380_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B380_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B380_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_ALIGN_MASK == 0xfffffff0u &&
                  ISAAC_LUA_ENGINE_899B380_PRE_GATE_TOUSERDATA == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B380_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B380_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_TYPE_GATES == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B380_TYPE_IAT_VIA_REGISTER == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_ARG3_GATE_INVERTED_ENCODING == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_ARG2_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_CHECKNUMBER == 0x00b18324u &&
                  ISAAC_LUA_ENGINE_899B380_CHECKNUMBER_INDEX == 0x00000005u &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_TOBOOLEAN == 0x00b183e8u &&
                  ISAAC_LUA_ENGINE_899B380_TOBOOLEAN_INDEX == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_KEY == 0x00c82980u &&
                  ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_INDEX == 0x00000003u &&
                  ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_KEY == 0x00c8297au &&
                  ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B380_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B380_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B380_WRAP_CTOR_VA == 0x008baa50u &&
                  ISAAC_LUA_ENGINE_899B380_METHOD_STACK_ARGS == 0x00000006u &&
                  ISAAC_LUA_ENGINE_899B380_METHOD_SRET_OUT == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B380_METHOD_FLOAT_COMPONENTS == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B380_METHOD_CALLER_CLEANUP == 0x00000018u &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_PUSHNIL == 0x00b183e0u &&
                  ISAAC_LUA_ENGINE_899B380_NEWUSERDATA_SIZE == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899B380_UD_VTABLE_VA == 0x00b753c8u &&
                  ISAAC_LUA_ENGINE_899B380_UD_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B380_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899B380_METATABLE_RAWGETP_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899B380_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899B380_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899B380_RETURN_VALUE == 0x00000001u,
              "v97 0x89b380 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b380_type3_gate_taken(uint32_t type_result) {
  /* lua_type(L,3) gate: `test eax,eax; je` INVERTED encoding
     (@0x89b3d3, nil skips the Vector fetch) — truth table identical
     to jne. taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
int32_t isaac_lua_engine_899b380_type2_gate_taken(uint32_t type_result) {
  /* lua_type(L,2) gate: `test eax,eax; jne` (@0x89b417). taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b380_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_VA;
}
uint32_t isaac_lua_engine_899b380_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_END_VA;
}
uint32_t isaac_lua_engine_899b380_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_NEXT_VA;
}
uint32_t isaac_lua_engine_899b380_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b380_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_ECX_ARG;
}
uint32_t isaac_lua_engine_899b380_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b380_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b380_align_mask(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_ALIGN_MASK;
}
uint32_t isaac_lua_engine_899b380_pre_gate_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_PRE_GATE_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b380_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b380_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b380_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b380_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b380_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b380_type_iat_via_register(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_TYPE_IAT_VIA_REGISTER;
}
uint32_t isaac_lua_engine_899b380_arg3_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_ARG3_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b380_arg2_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_ARG2_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b380_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_CHECKNUMBER;
}
uint32_t isaac_lua_engine_899b380_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899b380_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_TOBOOLEAN;
}
uint32_t isaac_lua_engine_899b380_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_TOBOOLEAN_INDEX;
}
uint32_t isaac_lua_engine_899b380_vector_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b380_vector_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b380_vector_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_VECTOR_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b380_wrap_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b380_wrap_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b380_wrap_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_WRAP_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b380_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b380_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b380_wrap_ctor_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_WRAP_CTOR_VA;
}
uint32_t isaac_lua_engine_899b380_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b380_method_sret_out(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_METHOD_SRET_OUT;
}
uint32_t isaac_lua_engine_899b380_method_float_components(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_METHOD_FLOAT_COMPONENTS;
}
uint32_t isaac_lua_engine_899b380_method_caller_cleanup(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_METHOD_CALLER_CLEANUP;
}
uint32_t isaac_lua_engine_899b380_iat_lua_pushnil(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_PUSHNIL;
}
uint32_t isaac_lua_engine_899b380_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899b380_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899b380_ud_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_UD_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b380_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899b380_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899b380_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899b380_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899b380_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899b380_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B380_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B540_VA == 0x0089b540u &&
                  ISAAC_LUA_ENGINE_899B540_END_VA == 0x0089b5a9u &&
                  ISAAC_LUA_ENGINE_899B540_NEXT_VA == 0x0089b5b0u &&
                  ISAAC_LUA_ENGINE_899B540_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B540_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B540_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B540_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B540_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B540_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B540_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B540_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B540_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B540_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B540_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B540_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B540_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B540_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B540_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B540_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B540_IAT_LUA_TOBOOLEAN == 0x00b183e8u &&
                  ISAAC_LUA_ENGINE_899B540_TOBOOLEAN_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B540_BOOL_ARG_SETNE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B540_RETURN_VALUE == 0x00000000u,
              "v98 0x89b540 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b540_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b558):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b540_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_VA;
}
uint32_t isaac_lua_engine_899b540_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_END_VA;
}
uint32_t isaac_lua_engine_899b540_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_NEXT_VA;
}
uint32_t isaac_lua_engine_899b540_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b540_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_ECX_ARG;
}
uint32_t isaac_lua_engine_899b540_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b540_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b540_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b540_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b540_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b540_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b540_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b540_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b540_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b540_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b540_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b540_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b540_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b540_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b540_iat_lua_toboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_IAT_LUA_TOBOOLEAN;
}
uint32_t isaac_lua_engine_899b540_toboolean_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_TOBOOLEAN_INDEX;
}
uint32_t isaac_lua_engine_899b540_bool_arg_setne(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_BOOL_ARG_SETNE;
}
uint32_t isaac_lua_engine_899b540_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B540_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B5B0_VA == 0x0089b5b0u &&
                  ISAAC_LUA_ENGINE_899B5B0_END_VA == 0x0089b615u &&
                  ISAAC_LUA_ENGINE_899B5B0_NEXT_VA == 0x0089b620u &&
                  ISAAC_LUA_ENGINE_899B5B0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B5B0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B5B0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B5B0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B5B0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B5B0_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B5B0_CHECKGET_KEY == 0x00c829d7u &&
                  ISAAC_LUA_ENGINE_899B5B0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B5B0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B5B0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B5B0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B5B0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B5B0_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B5B0_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B5B0_METHOD_RESULT_LOW_BYTE_GATE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_PUSHBOOLEAN == 0x00b183ecu &&
                  ISAAC_LUA_ENGINE_899B5B0_RETURN_VALUE == 0x00000001u,
              "v98 0x89b5b0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b5b0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b5c6):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b5b0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_VA;
}
uint32_t isaac_lua_engine_899b5b0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_END_VA;
}
uint32_t isaac_lua_engine_899b5b0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_NEXT_VA;
}
uint32_t isaac_lua_engine_899b5b0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b5b0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_ECX_ARG;
}
uint32_t isaac_lua_engine_899b5b0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b5b0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b5b0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b5b0_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b5b0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b5b0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b5b0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b5b0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b5b0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b5b0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b5b0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b5b0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b5b0_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b5b0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b5b0_method_result_low_byte_gate(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_METHOD_RESULT_LOW_BYTE_GATE;
}
uint32_t isaac_lua_engine_899b5b0_iat_lua_pushboolean(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_IAT_LUA_PUSHBOOLEAN;
}
uint32_t isaac_lua_engine_899b5b0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B5B0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B620_VA == 0x0089b620u &&
                  ISAAC_LUA_ENGINE_899B620_END_VA == 0x0089b68du &&
                  ISAAC_LUA_ENGINE_899B620_NEXT_VA == 0x0089b690u &&
                  ISAAC_LUA_ENGINE_899B620_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B620_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B620_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B620_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B620_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B620_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B620_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B620_CHECKGET_KEY == 0x00c829d4u &&
                  ISAAC_LUA_ENGINE_899B620_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B620_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B620_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B620_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B620_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B620_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B620_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B620_METHOD_STACK_ARGS == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B620_METHOD_I64_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B620_IAT_LUAL_CHECKINTEGER == 0x00b183f4u &&
                  ISAAC_LUA_ENGINE_899B620_CHECKINTEGER_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B620_RETURN_VALUE == 0x00000000u,
              "v99 0x89b620 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b620_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b63c):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b620_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_VA;
}
uint32_t isaac_lua_engine_899b620_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_END_VA;
}
uint32_t isaac_lua_engine_899b620_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_NEXT_VA;
}
uint32_t isaac_lua_engine_899b620_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b620_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_ECX_ARG;
}
uint32_t isaac_lua_engine_899b620_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b620_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b620_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b620_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b620_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b620_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b620_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b620_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b620_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b620_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b620_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b620_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b620_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b620_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b620_method_i64_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_METHOD_I64_ARG;
}
uint32_t isaac_lua_engine_899b620_iat_lual_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_IAT_LUAL_CHECKINTEGER;
}
uint32_t isaac_lua_engine_899b620_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_CHECKINTEGER_INDEX;
}
uint32_t isaac_lua_engine_899b620_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B620_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B690_VA == 0x0089b690u &&
                  ISAAC_LUA_ENGINE_899B690_END_VA == 0x0089b6efu &&
                  ISAAC_LUA_ENGINE_899B690_NEXT_VA == 0x0089b6f0u &&
                  ISAAC_LUA_ENGINE_899B690_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B690_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B690_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B690_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B690_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B690_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B690_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B690_CHECKGET_KEY == 0x00c829d4u &&
                  ISAAC_LUA_ENGINE_899B690_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B690_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B690_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B690_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B690_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B690_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B690_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B690_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B690_METHOD_I64_RETURN == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B690_I64_PUSHER_HELPER_VA == 0x0085c030u &&
                  ISAAC_LUA_ENGINE_899B690_RETURN_VALUE == 0x00000001u,
              "v99 0x89b690 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b690_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b6a6):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b690_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_VA;
}
uint32_t isaac_lua_engine_899b690_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_END_VA;
}
uint32_t isaac_lua_engine_899b690_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_NEXT_VA;
}
uint32_t isaac_lua_engine_899b690_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b690_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_ECX_ARG;
}
uint32_t isaac_lua_engine_899b690_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b690_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b690_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b690_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b690_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b690_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b690_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b690_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b690_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b690_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b690_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b690_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b690_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b690_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b690_method_i64_return(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_METHOD_I64_RETURN;
}
uint32_t isaac_lua_engine_899b690_i64_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_I64_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899b690_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B690_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B6F0_VA == 0x0089b6f0u &&
                  ISAAC_LUA_ENGINE_899B6F0_END_VA == 0x0089b75cu &&
                  ISAAC_LUA_ENGINE_899B6F0_NEXT_VA == 0x0089b760u &&
                  ISAAC_LUA_ENGINE_899B6F0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B6F0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B6F0_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B6F0_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B6F0_CHECKGET_KEY == 0x00c829d4u &&
                  ISAAC_LUA_ENGINE_899B6F0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B6F0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B6F0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B6F0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B6F0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B6F0_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_METHOD_I32_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B6F0_IAT_LUAL_CHECKINTEGER == 0x00b183f4u &&
                  ISAAC_LUA_ENGINE_899B6F0_CHECKINTEGER_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B6F0_RETURN_VALUE == 0x00000000u,
              "v100 0x89b6f0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b6f0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b70c):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b6f0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_VA;
}
uint32_t isaac_lua_engine_899b6f0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_END_VA;
}
uint32_t isaac_lua_engine_899b6f0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_NEXT_VA;
}
uint32_t isaac_lua_engine_899b6f0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b6f0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_ECX_ARG;
}
uint32_t isaac_lua_engine_899b6f0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b6f0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b6f0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b6f0_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b6f0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b6f0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b6f0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b6f0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b6f0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b6f0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b6f0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b6f0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b6f0_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b6f0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b6f0_method_i32_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_METHOD_I32_ARG;
}
uint32_t isaac_lua_engine_899b6f0_iat_lual_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_IAT_LUAL_CHECKINTEGER;
}
uint32_t isaac_lua_engine_899b6f0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_CHECKINTEGER_INDEX;
}
uint32_t isaac_lua_engine_899b6f0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B6F0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B760_VA == 0x0089b760u &&
                  ISAAC_LUA_ENGINE_899B760_END_VA == 0x0089b7bcu &&
                  ISAAC_LUA_ENGINE_899B760_NEXT_VA == 0x0089b7c0u &&
                  ISAAC_LUA_ENGINE_899B760_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B760_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B760_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B760_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B760_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B760_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B760_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B760_CHECKGET_KEY == 0x00c829d4u &&
                  ISAAC_LUA_ENGINE_899B760_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B760_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B760_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B760_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B760_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B760_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B760_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B760_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B760_METHOD_I32_RETURN == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B760_I32_SEXT_PUSHER_HELPER_VA == 0x0085bfd0u &&
                  ISAAC_LUA_ENGINE_899B760_RETURN_VALUE == 0x00000001u,
              "v100 0x89b760 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b760_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b776):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b760_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_VA;
}
uint32_t isaac_lua_engine_899b760_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_END_VA;
}
uint32_t isaac_lua_engine_899b760_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_NEXT_VA;
}
uint32_t isaac_lua_engine_899b760_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b760_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_ECX_ARG;
}
uint32_t isaac_lua_engine_899b760_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b760_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b760_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b760_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b760_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b760_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b760_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b760_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b760_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b760_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b760_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b760_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b760_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b760_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b760_method_i32_return(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_METHOD_I32_RETURN;
}
uint32_t isaac_lua_engine_899b760_i32_sext_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_I32_SEXT_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899b760_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B760_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B7C0_VA == 0x0089b7c0u &&
                  ISAAC_LUA_ENGINE_899B7C0_END_VA == 0x0089b842u &&
                  ISAAC_LUA_ENGINE_899B7C0_NEXT_VA == 0x0089b850u &&
                  ISAAC_LUA_ENGINE_899B7C0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B7C0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B7C0_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B7C0_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B7C0_CHECKGET_KEY == 0x00c829d4u &&
                  ISAAC_LUA_ENGINE_899B7C0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B7C0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B7C0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B7C0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B7C0_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_FLOAT_LANE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_CHECKNUMBER == 0x00b18324u &&
                  ISAAC_LUA_ENGINE_899B7C0_CHECKNUMBER_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B7C0_RETURN_VALUE == 0x00000000u,
              "v101 0x89b7c0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b7c0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b7dc):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b7c0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_VA;
}
uint32_t isaac_lua_engine_899b7c0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_END_VA;
}
uint32_t isaac_lua_engine_899b7c0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_NEXT_VA;
}
uint32_t isaac_lua_engine_899b7c0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b7c0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_ECX_ARG;
}
uint32_t isaac_lua_engine_899b7c0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b7c0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b7c0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b7c0_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b7c0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b7c0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b7c0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b7c0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b7c0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b7c0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b7c0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b7c0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b7c0_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b7c0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b7c0_float_lane(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_FLOAT_LANE;
}
uint32_t isaac_lua_engine_899b7c0_iat_lua_checknumber(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_IAT_LUA_CHECKNUMBER;
}
uint32_t isaac_lua_engine_899b7c0_checknumber_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_CHECKNUMBER_INDEX;
}
uint32_t isaac_lua_engine_899b7c0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B7C0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B850_VA == 0x0089b850u &&
                  ISAAC_LUA_ENGINE_899B850_END_VA == 0x0089b8b9u &&
                  ISAAC_LUA_ENGINE_899B850_NEXT_VA == 0x0089b8c0u &&
                  ISAAC_LUA_ENGINE_899B850_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B850_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B850_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B850_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B850_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B850_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B850_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B850_CHECKGET_KEY == 0x00c829d4u &&
                  ISAAC_LUA_ENGINE_899B850_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B850_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B850_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B850_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B850_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B850_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B850_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B850_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B850_FLOAT_LANE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B850_FLOAT_PUSHER_HELPER_VA == 0x0085c050u &&
                  ISAAC_LUA_ENGINE_899B850_RETURN_VALUE == 0x00000001u,
              "v101 0x89b850 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b850_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b867):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b850_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_VA;
}
uint32_t isaac_lua_engine_899b850_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_END_VA;
}
uint32_t isaac_lua_engine_899b850_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_NEXT_VA;
}
uint32_t isaac_lua_engine_899b850_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b850_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_ECX_ARG;
}
uint32_t isaac_lua_engine_899b850_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b850_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b850_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b850_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b850_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b850_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b850_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b850_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b850_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b850_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b850_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b850_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b850_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b850_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b850_float_lane(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_FLOAT_LANE;
}
uint32_t isaac_lua_engine_899b850_float_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_FLOAT_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899b850_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B850_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B8C0_VA == 0x0089b8c0u &&
                  ISAAC_LUA_ENGINE_899B8C0_END_VA == 0x0089b93eu &&
                  ISAAC_LUA_ENGINE_899B8C0_NEXT_VA == 0x0089b940u &&
                  ISAAC_LUA_ENGINE_899B8C0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B8C0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B8C0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B8C0_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B8C0_TYPE_GATES == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B8C0_PRE_GATE_TOUSERDATA == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B8C0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B8C0_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B8C0_METHOD_STACK_ARGS == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B8C0_METHOD_SRET_OUT == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B8C0_SRET_COPY_BYTES == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899B8C0_IAT_LUAL_CHECKINTEGER == 0x00b183f4u &&
                  ISAAC_LUA_ENGINE_899B8C0_CHECKINTEGER_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B8C0_NEWUSERDATA_SIZE == 0x00000010u &&
                  ISAAC_LUA_ENGINE_899B8C0_UD_VTABLE_VA == 0x00b73574u &&
                  ISAAC_LUA_ENGINE_899B8C0_UD_SELF_PTR_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B8C0_PAYLOAD_FIELD_OFF == 0x00000008u &&
                  ISAAC_LUA_ENGINE_899B8C0_REGISTRY_INDEX_U32 == 0xfff0b9d8u &&
                  ISAAC_LUA_ENGINE_899B8C0_METATABLE_RAWGETP_KEY == 0x00c82980u &&
                  ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_RAWGETP == 0x00b183bcu &&
                  ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_SETMETATABLE == 0x00b18398u &&
                  ISAAC_LUA_ENGINE_899B8C0_SETMETATABLE_INDEX_U32 == 0xfffffffeu &&
                  ISAAC_LUA_ENGINE_899B8C0_RETURN_VALUE == 0x00000001u,
              "v102 0x89b8c0 span/island pins must match the PE decode");

uint32_t isaac_lua_engine_899b8c0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_VA;
}
uint32_t isaac_lua_engine_899b8c0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_END_VA;
}
uint32_t isaac_lua_engine_899b8c0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_NEXT_VA;
}
uint32_t isaac_lua_engine_899b8c0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b8c0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_ECX_ARG;
}
uint32_t isaac_lua_engine_899b8c0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b8c0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b8c0_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b8c0_pre_gate_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_PRE_GATE_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b8c0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b8c0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b8c0_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b8c0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b8c0_method_sret_out(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_METHOD_SRET_OUT;
}
uint32_t isaac_lua_engine_899b8c0_sret_copy_bytes(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_SRET_COPY_BYTES;
}
uint32_t isaac_lua_engine_899b8c0_iat_lual_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_IAT_LUAL_CHECKINTEGER;
}
uint32_t isaac_lua_engine_899b8c0_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_CHECKINTEGER_INDEX;
}
uint32_t isaac_lua_engine_899b8c0_newuserdata_size(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_NEWUSERDATA_SIZE;
}
uint32_t isaac_lua_engine_899b8c0_ud_vtable_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_UD_VTABLE_VA;
}
uint32_t isaac_lua_engine_899b8c0_ud_self_ptr_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_UD_SELF_PTR_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b8c0_payload_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_PAYLOAD_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b8c0_registry_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_REGISTRY_INDEX_U32;
}
uint32_t isaac_lua_engine_899b8c0_metatable_rawgetp_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_METATABLE_RAWGETP_KEY;
}
uint32_t isaac_lua_engine_899b8c0_iat_lua_rawgetp(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_RAWGETP;
}
uint32_t isaac_lua_engine_899b8c0_iat_lua_setmetatable(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_IAT_LUA_SETMETATABLE;
}
uint32_t isaac_lua_engine_899b8c0_setmetatable_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_SETMETATABLE_INDEX_U32;
}
uint32_t isaac_lua_engine_899b8c0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B8C0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B940_VA == 0x0089b940u &&
                  ISAAC_LUA_ENGINE_899B940_END_VA == 0x0089b9acu &&
                  ISAAC_LUA_ENGINE_899B940_NEXT_VA == 0x0089b9b0u &&
                  ISAAC_LUA_ENGINE_899B940_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B940_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B940_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B940_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B940_CHECKGET_KEY == 0x00c829d1u &&
                  ISAAC_LUA_ENGINE_899B940_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B940_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B940_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B940_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B940_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B940_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_METHOD_I32_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B940_IAT_LUAL_CHECKINTEGER == 0x00b183f4u &&
                  ISAAC_LUA_ENGINE_899B940_CHECKINTEGER_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899B940_RETURN_VALUE == 0x00000000u,
              "v102 0x89b940 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b940_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b95c):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b940_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_VA;
}
uint32_t isaac_lua_engine_899b940_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_END_VA;
}
uint32_t isaac_lua_engine_899b940_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_NEXT_VA;
}
uint32_t isaac_lua_engine_899b940_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b940_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_ECX_ARG;
}
uint32_t isaac_lua_engine_899b940_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b940_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b940_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b940_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b940_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b940_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b940_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b940_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b940_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b940_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b940_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b940_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b940_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b940_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b940_method_i32_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_METHOD_I32_ARG;
}
uint32_t isaac_lua_engine_899b940_iat_lual_checkinteger(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_IAT_LUAL_CHECKINTEGER;
}
uint32_t isaac_lua_engine_899b940_checkinteger_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_CHECKINTEGER_INDEX;
}
uint32_t isaac_lua_engine_899b940_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B940_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899B9B0_VA == 0x0089b9b0u &&
                  ISAAC_LUA_ENGINE_899B9B0_END_VA == 0x0089ba0cu &&
                  ISAAC_LUA_ENGINE_899B9B0_NEXT_VA == 0x0089ba10u &&
                  ISAAC_LUA_ENGINE_899B9B0_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B9B0_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B9B0_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B9B0_ALIGNED_PROLOGUE == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B9B0_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B9B0_TYPE_GATES == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B9B0_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899B9B0_CHECKGET_KEY == 0x00c829d1u &&
                  ISAAC_LUA_ENGINE_899B9B0_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B9B0_CHECKGET_DEF_ARG == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B9B0_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899B9B0_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899B9B0_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899B9B0_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899B9B0_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B9B0_METHOD_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899B9B0_METHOD_I32_RETURN == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899B9B0_I32_SEXT_PUSHER_HELPER_VA == 0x0085bfd0u &&
                  ISAAC_LUA_ENGINE_899B9B0_RETURN_VALUE == 0x00000001u,
              "v103 0x89b9b0 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899b9b0_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89b9c6):
     nil -> obj stays null, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899b9b0_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_VA;
}
uint32_t isaac_lua_engine_899b9b0_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_END_VA;
}
uint32_t isaac_lua_engine_899b9b0_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_NEXT_VA;
}
uint32_t isaac_lua_engine_899b9b0_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b9b0_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_ECX_ARG;
}
uint32_t isaac_lua_engine_899b9b0_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b9b0_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899b9b0_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899b9b0_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_TYPE_GATES;
}
uint32_t isaac_lua_engine_899b9b0_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899b9b0_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899b9b0_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899b9b0_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899b9b0_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899b9b0_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899b9b0_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899b9b0_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899b9b0_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899b9b0_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899b9b0_method_i32_return(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_METHOD_I32_RETURN;
}
uint32_t isaac_lua_engine_899b9b0_i32_sext_pusher_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_I32_SEXT_PUSHER_HELPER_VA;
}
uint32_t isaac_lua_engine_899b9b0_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899B9B0_RETURN_VALUE;
}
static_assert(ISAAC_LUA_ENGINE_899BA10_VA == 0x0089ba10u &&
                  ISAAC_LUA_ENGINE_899BA10_END_VA == 0x0089bab3u &&
                  ISAAC_LUA_ENGINE_899BA10_NEXT_VA == 0x0089bac0u &&
                  ISAAC_LUA_ENGINE_899BA10_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BA10_ECX_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BA10_CALLEE_POPS_STACK_ARGS == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BA10_ALIGNED_PROLOGUE == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BA10_GATE_INVERTED_ENCODING == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BA10_TYPE_GATES == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899BA10_IAT_LUA_TYPE == 0x00b18400u &&
                  ISAAC_LUA_ENGINE_899BA10_CHECKGET_KEY == 0x00c829d1u &&
                  ISAAC_LUA_ENGINE_899BA10_CHECKGET_INDEX == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BA10_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BA10_CHECKGET_FIELD_OFF == 0x00000004u &&
                  ISAAC_LUA_ENGINE_899BA10_CHECKGET_HELPER_VA == 0x0085c590u &&
                  ISAAC_LUA_ENGINE_899BA10_IAT_LUA_TOUSERDATA == 0x00b183b0u &&
                  ISAAC_LUA_ENGINE_899BA10_TOUSERDATA_INDEX_U32 == 0xfff0b9d7u &&
                  ISAAC_LUA_ENGINE_899BA10_UD_FN_POINTER_CALL == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BA10_METHOD_STACK_ARGS == 0x00000001u &&
                  ISAAC_LUA_ENGINE_899BA10_NIL_PATH_METHOD_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_KEY == 0x00c829c8u &&
                  ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_INDEX == 0x00000002u &&
                  ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_DEF_ARG == 0x00000000u &&
                  ISAAC_LUA_ENGINE_899BA10_RETURN_VALUE == 0x00000000u,
              "v103 0x89ba10 span/island pins must match the PE decode");

int32_t isaac_lua_engine_899ba10_type1_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,1) gate (`test eax,eax; jne` @0x89ba2b):
     nil -> val slot stays 0, else check/get path. taken <=>
     type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
int32_t isaac_lua_engine_899ba10_type2_gate_taken(uint32_t type_result) {
  /* FULL-WORD lua_type(L,2) gate (`test eax,eax; jne` @0x89ba6e):
     nil arg2 -> method(0) through [ud+0]; non-nil -> wrap check/get
     path (key 0xc829c8, idx 2). taken <=> type_result != 0. */
  return type_result != 0u ? 1 : 0;
}
uint32_t isaac_lua_engine_899ba10_host_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_VA;
}
uint32_t isaac_lua_engine_899ba10_end_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_END_VA;
}
uint32_t isaac_lua_engine_899ba10_next_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_NEXT_VA;
}
uint32_t isaac_lua_engine_899ba10_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ba10_ecx_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_ECX_ARG;
}
uint32_t isaac_lua_engine_899ba10_callee_pops_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_CALLEE_POPS_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ba10_aligned_prologue(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_ALIGNED_PROLOGUE;
}
uint32_t isaac_lua_engine_899ba10_gate_inverted_encoding(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_GATE_INVERTED_ENCODING;
}
uint32_t isaac_lua_engine_899ba10_type_gates(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_TYPE_GATES;
}
uint32_t isaac_lua_engine_899ba10_iat_lua_type(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_IAT_LUA_TYPE;
}
uint32_t isaac_lua_engine_899ba10_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ba10_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ba10_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ba10_checkget_field_off(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_CHECKGET_FIELD_OFF;
}
uint32_t isaac_lua_engine_899ba10_checkget_helper_va(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_CHECKGET_HELPER_VA;
}
uint32_t isaac_lua_engine_899ba10_iat_lua_touserdata(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_IAT_LUA_TOUSERDATA;
}
uint32_t isaac_lua_engine_899ba10_touserdata_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_TOUSERDATA_INDEX_U32;
}
uint32_t isaac_lua_engine_899ba10_ud_fn_pointer_call(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_UD_FN_POINTER_CALL;
}
uint32_t isaac_lua_engine_899ba10_method_stack_args(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_METHOD_STACK_ARGS;
}
uint32_t isaac_lua_engine_899ba10_nil_path_method_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_NIL_PATH_METHOD_ARG;
}
uint32_t isaac_lua_engine_899ba10_wrap_checkget_key(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_KEY;
}
uint32_t isaac_lua_engine_899ba10_wrap_checkget_index(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_INDEX;
}
uint32_t isaac_lua_engine_899ba10_wrap_checkget_def_arg(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_WRAP_CHECKGET_DEF_ARG;
}
uint32_t isaac_lua_engine_899ba10_return_value(void) {
  return (uint32_t)ISAAC_LUA_ENGINE_899BA10_RETURN_VALUE;
}
