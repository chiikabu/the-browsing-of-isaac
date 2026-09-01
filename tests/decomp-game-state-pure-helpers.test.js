import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as MODEL from "../scripts/decomp/game-state-pure-model.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "native", "decomp", "game_state_pure_helpers.cpp");
const header = join(root, "native", "decomp", "game_state_pure_helpers.h");
const outDir = join(root, "output", "decomp", "game-state-pure");
const wasmPath = join(outDir, `game-state-pure-helpers-${process.pid}.wasm`); /* pid-unique: concurrent suites must not share one artifact */

function firstExisting(candidates, label) {
  for (const c of candidates) {
    if (c && existsSync(c)) return c;
  }
  throw new Error(`none of ${label} candidates exist: ${candidates.join(", ")}`);
}

const EXPORTS = [
  "isaac_game_state_9c8350_steam_present",
  "isaac_game_state_9c8350_cloud_gate_ok",
  "isaac_game_state_9c8350_use_steam_arm",
  "isaac_game_state_9c8350_statname_heap_used",
  "isaac_game_state_9c8350_statname_ptr",
  "isaac_game_state_9c8350_steam_arm_continue",
  "isaac_game_state_9c8350_filename_present",
  "isaac_game_state_9c8350_filename_ptr",
  // accessors
  "isaac_game_state_9c8350_va",
  "isaac_game_state_9c8350_end_va",
  "isaac_game_state_9c8350_body_bytes",
  "isaac_game_state_9c8350_next_va",
  "isaac_game_state_9c8350_tail_va",
  "isaac_game_state_9c8350_steam_iat",
  "isaac_game_state_9c8350_steam_arg",
  "isaac_game_state_9c8350_remove_iat",
  "isaac_game_state_9c8350_logger_va",
  "isaac_game_state_9c8350_log_str_va",
  "isaac_game_state_9c8350_mgr_global_dat",
  "isaac_game_state_9c8350_cloud_off",
  "isaac_game_state_9c8350_filename_size_off",
  "isaac_game_state_9c8350_filename_buf_off",
  "isaac_game_state_9c8350_statname_size_off",
  "isaac_game_state_9c8350_statname_buf_off",
  "isaac_game_state_9c8350_sso_threshold",
  "isaac_game_state_9c8350_vtbl34_slot",
  "isaac_game_state_9c8350_vtbl18_slot",
  "isaac_game_state_9c8350_caller_count",
  "isaac_game_state_9c8350_caller_va_at",
  // ABI v2: DeleteRerun 0x009c8410 laws
  "isaac_game_state_9c8410_steam_present",
  "isaac_game_state_9c8410_cloud_gate_ok",
  "isaac_game_state_9c8410_use_steam_arm",
  "isaac_game_state_9c8410_statname_heap_used",
  "isaac_game_state_9c8410_statname_ptr",
  "isaac_game_state_9c8410_steam_arm_continue",
  "isaac_game_state_9c8410_filename_present",
  "isaac_game_state_9c8410_filename_ptr",
  // ABI v2 accessors: DeleteRerun
  "isaac_game_state_9c8410_va",
  "isaac_game_state_9c8410_end_va",
  "isaac_game_state_9c8410_body_bytes",
  "isaac_game_state_9c8410_next_va",
  "isaac_game_state_9c8410_steam_ret_va",
  "isaac_game_state_9c8410_tail_ret_va",
  "isaac_game_state_9c8410_steam_iat",
  "isaac_game_state_9c8410_steam_arg",
  "isaac_game_state_9c8410_remove_iat",
  "isaac_game_state_9c8410_logger_va",
  "isaac_game_state_9c8410_log_str_va",
  "isaac_game_state_9c8410_mgr_global_dat",
  "isaac_game_state_9c8410_cloud_off",
  "isaac_game_state_9c8410_filename_empty_size_off",
  "isaac_game_state_9c8410_filename_size_off",
  "isaac_game_state_9c8410_filename_buf_off",
  "isaac_game_state_9c8410_statname_size_off",
  "isaac_game_state_9c8410_statname_buf_off",
  "isaac_game_state_9c8410_sso_threshold",
  "isaac_game_state_9c8410_vtbl34_slot",
  "isaac_game_state_9c8410_vtbl18_slot",
  "isaac_game_state_9c8410_caller_count",
  "isaac_game_state_9c8410_caller_va_at",
  // ABI v2 accessors: write typed-host lease
  "isaac_game_state_9c9340_va",
  "isaac_game_state_9c9340_end_va",
  "isaac_game_state_9c9340_body_bytes",
  "isaac_game_state_9c9340_next_va",
  "isaac_game_state_9c9340_stream_vtbl_slot",
  "isaac_game_state_9c9340_row_writer_va",
  "isaac_game_state_9c9340_stream_init_va",
  "isaac_game_state_9c9340_gsr_format_str_va",
  "isaac_game_state_9c9340_seeded_log_str_va",
  "isaac_game_state_9c9340_logger_va",
  "isaac_game_state_9c9340_se_handler_dat",
  "isaac_game_state_9c9340_gs_cookie_dat",
  "isaac_game_state_9c9340_cookie_tail_va",
  "isaac_game_state_9c9340_invalid_param_iat",
  "isaac_game_state_9c9340_free_va",
  "isaac_game_state_9c9340_game_state_io_off",
  "isaac_game_state_9c9340_serializer_8d20_va",
  "isaac_game_state_9c9340_serializer_87e0_va",
  "isaac_game_state_9c9340_serializer_85d0_va",
  "isaac_game_state_9c9340_leaf_9d77e0_va",
  "isaac_game_state_9c9340_leaf_9d45c0_va",
  "isaac_game_state_9c9340_leaf_9cec80_va",
  "isaac_game_state_9c9340_leaf_9d84d0_va",
  "isaac_game_state_9c9340_leaf_9eb5b0_va",
  "isaac_game_state_9c9340_leaf_4288a0_va",
  "isaac_game_state_9c9340_leaf_708ae0_va",
  "isaac_game_state_9c9340_leaf_af05e5_va",
  "isaac_game_state_9c9340_caller_count",
  "isaac_game_state_9c9340_caller_va_at",
  // ABI v3: serializer tree leaf laws (0x9c84c0..0x9c8d20)
  "isaac_game_state_9c84c0_lane_count",
  "isaac_game_state_9c84c0_clear_needed",
  "isaac_game_state_9c84c0_lane_flush",
  "isaac_game_state_9c84c0_lane_bit_set",
  "isaac_game_state_9c85d0_flush_every8",
  "isaac_game_state_9c85d0_flush_remainder",
  "isaac_game_state_9c85d0_source_bit",
  "isaac_game_state_9c86e0_sentinel_layout",
  "isaac_game_state_9c87e0_sentinel_layout",
  "isaac_game_state_9c88e0_flags",
  "isaac_game_state_9c88e0_blob_present",
  "isaac_game_state_9c88e0_child_present",
  "isaac_game_state_9c88e0_returns_true",
  "isaac_game_state_9c8d20_slot_present",
  "isaac_game_state_9c8d20_table_more",
  "isaac_game_state_9c8d20_element_count",
  "isaac_game_state_9c8d20_count_nonzero",
  "isaac_game_state_9c8d20_walk_continue",
  // ABI v3 accessors: serializer tree
  "isaac_game_state_9c84c0_va",
  "isaac_game_state_9c84c0_end_va",
  "isaac_game_state_9c84c0_body_bytes",
  "isaac_game_state_9c84c0_next_va",
  "isaac_game_state_9c84c0_lane_count_gate_va",
  "isaac_game_state_9c84c0_clear_gate_va",
  "isaac_game_state_9c84c0_flush_gate_va",
  "isaac_game_state_9c84c0_bit_select_gate_va",
  "isaac_game_state_9c84c0_caller_count",
  "isaac_game_state_9c84c0_caller_va_at",
  "isaac_game_state_9c85d0_va",
  "isaac_game_state_9c85d0_end_va",
  "isaac_game_state_9c85d0_body_bytes",
  "isaac_game_state_9c85d0_next_va",
  "isaac_game_state_9c85d0_flush8_gate_va",
  "isaac_game_state_9c85d0_remainder_gate_va",
  "isaac_game_state_9c85d0_bit_test_gate_va",
  "isaac_game_state_9c85d0_caller_count",
  "isaac_game_state_9c85d0_caller_va_at",
  "isaac_game_state_9c86e0_va",
  "isaac_game_state_9c86e0_end_va",
  "isaac_game_state_9c86e0_body_bytes",
  "isaac_game_state_9c86e0_next_va",
  "isaac_game_state_9c86e0_sentinel_gate_va",
  "isaac_game_state_9c86e0_caller_count",
  "isaac_game_state_9c86e0_caller_va_at",
  "isaac_game_state_9c87e0_va",
  "isaac_game_state_9c87e0_end_va",
  "isaac_game_state_9c87e0_body_bytes",
  "isaac_game_state_9c87e0_next_va",
  "isaac_game_state_9c87e0_sentinel_gate_va",
  "isaac_game_state_9c87e0_caller_count",
  "isaac_game_state_9c87e0_caller_va_at",
  "isaac_game_state_9c88e0_va",
  "isaac_game_state_9c88e0_end_va",
  "isaac_game_state_9c88e0_body_bytes",
  "isaac_game_state_9c88e0_next_va",
  "isaac_game_state_9c88e0_flags_bit0_gate_va",
  "isaac_game_state_9c88e0_flags_bit1_gate_va",
  "isaac_game_state_9c88e0_blob_gate_va",
  "isaac_game_state_9c88e0_child_gate_va",
  "isaac_game_state_9c88e0_ret_true_va",
  "isaac_game_state_9c88e0_caller_count",
  "isaac_game_state_9c88e0_caller_va_at",
  "isaac_game_state_9c8d20_va",
  "isaac_game_state_9c8d20_end_va",
  "isaac_game_state_9c8d20_body_bytes",
  "isaac_game_state_9c8d20_next_va",
  "isaac_game_state_9c8d20_slot_gate_va",
  "isaac_game_state_9c8d20_table_bound_gate_va",
  "isaac_game_state_9c8d20_element_count_va",
  "isaac_game_state_9c8d20_count_zero_gate_va",
  "isaac_game_state_9c8d20_count_zero_gate_va_2",
  "isaac_game_state_9c8d20_walk_empty_gate_va",
  "isaac_game_state_9c8d20_walk_tail_gate_va",
  "isaac_game_state_9c8d20_caller_count",
  "isaac_game_state_9c8d20_caller_va_at",
  // ABI v4: save-orchestrator host A/B decision laws S1..S6
  "isaac_game_state_9cad40_pool_select",
  "isaac_game_state_9cad40_name_gate_ok",
  "isaac_game_state_9cad40_open_gate_ok",
  "isaac_game_state_9caea0_rerun_gate_ok",
  "isaac_game_state_9caea0_rerun_success",
  "isaac_game_state_9cad40_io_dtor_needed",
  // ABI v4 accessors: host A 0x9cad40
  "isaac_game_state_9cad40_va",
  "isaac_game_state_9cad40_end_va",
  "isaac_game_state_9cad40_body_bytes",
  "isaac_game_state_9cad40_next_va",
  "isaac_game_state_9cad40_io_dtor_gate_va",
  "isaac_game_state_9cad40_pool_select_va",
  "isaac_game_state_9cad40_name_gate_va",
  "isaac_game_state_9cad40_open_gate_va",
  "isaac_game_state_9cad40_write_call_va",
  "isaac_game_state_9cad40_statname_sso_gate_va",
  "isaac_game_state_9cad40_close_call_va",
  "isaac_game_state_9cad40_fail_log_call_va",
  "isaac_game_state_9cad40_fail_close_call_va",
  "isaac_game_state_9cad40_log_str_va",
  "isaac_game_state_9cad40_caller_count",
  "isaac_game_state_9cad40_caller_va_at",
  // ABI v4 accessors: host B 0x9caea0
  "isaac_game_state_9caea0_va",
  "isaac_game_state_9caea0_end_va",
  "isaac_game_state_9caea0_body_bytes",
  "isaac_game_state_9caea0_next_va",
  "isaac_game_state_9caea0_io_dtor_gate_va",
  "isaac_game_state_9caea0_pool_select_va",
  "isaac_game_state_9caea0_rerun_gate_va",
  "isaac_game_state_9caea0_open_gate_va",
  "isaac_game_state_9caea0_rerun_call_va",
  "isaac_game_state_9caea0_success_gate_va",
  "isaac_game_state_9caea0_success_store_va",
  "isaac_game_state_9caea0_delete_rerun_call_va",
  "isaac_game_state_9caea0_rerun_flag_word_off",
  "isaac_game_state_9caea0_rerun_success_byte_off",
  "isaac_game_state_9caea0_rerun_statname_buf_off",
  "isaac_game_state_9caea0_rerun_statname_size_off",
  "isaac_game_state_9caea0_statname_sso_gate_va",
  "isaac_game_state_9caea0_log_str_va",
  "isaac_game_state_9caea0_caller_count",
  "isaac_game_state_9caea0_caller_va_at",
  // ABI v4 accessors: shared GameStateIO / write-record constants
  "isaac_game_state_io_vtable",
  "isaac_game_state_io_ctor_version",
  "isaac_game_state_io_alloc_size",
  "isaac_game_state_io_alloc_iat",
  "isaac_game_state_io_fail_alloc_va",
  "isaac_game_state_io_checksum_va",
  "isaac_game_state_io_checksum_size",
  "isaac_game_state_io_pool_global_dat",
  "isaac_game_state_io_pool_fallback",
  "isaac_game_state_io_pool_step",
  "isaac_game_state_io_vtbl_open_slot",
  "isaac_game_state_io_vtbl_close_slot",
  "isaac_game_state_io_vtbl_rerun_slot",
  "isaac_game_state_io_vtbl_dtor_slot",
  "isaac_game_state_write_record_seed",
  "isaac_game_state_write_record_flags",
  // ABI v4 lease: GameState::read_rerun 0x9d7d50 (typed-host)
  "isaac_game_state_9d7d50_va",
  "isaac_game_state_9d7d50_end_va",
  "isaac_game_state_9d7d50_body_bytes",
  "isaac_game_state_9d7d50_next_va",
  "isaac_game_state_9d7d50_caller_count",
  "isaac_game_state_9d7d50_caller_va_at",
  "isaac_game_state_9d7d50_checksum_xor",
  "isaac_game_state_9d7d50_checksum_off",
  "isaac_game_state_9d7d50_version_off",
  "isaac_game_state_9d7d50_rerun_success_byte_off",
  "isaac_game_state_9d7d50_gs_cookie_dat",
  "isaac_game_state_9d7d50_cookie_tail_va",
  // ABI v4 accessors: helper-cluster spans + reader row
  "isaac_game_state_9d45c0_end_va",
  "isaac_game_state_9d45c0_body_bytes",
  "isaac_game_state_9d45c0_next_va",
  "isaac_game_state_9d77e0_end_va",
  "isaac_game_state_9d77e0_body_bytes",
  "isaac_game_state_9d77e0_next_va",
  "isaac_game_state_9cec80_end_va",
  "isaac_game_state_9cec80_body_bytes",
  "isaac_game_state_9cec80_next_va",
  "isaac_game_state_9d84d0_end_va",
  "isaac_game_state_9d84d0_body_bytes",
  "isaac_game_state_9d84d0_next_va",
  "isaac_game_state_9d84a0_end_va",
  "isaac_game_state_9d84a0_body_bytes",
  "isaac_game_state_9d84a0_next_va",
  "isaac_game_state_9d8550_end_va",
  "isaac_game_state_9d8550_body_bytes",
  "isaac_game_state_9d8550_next_va",
  "isaac_game_state_9cb020_va",
  "isaac_game_state_9cb020_caller_count",
  "isaac_game_state_9cb020_caller_va_at",
  // ABI v5: write-span loop/decision laws W1..W22 + U1 + N1
  "isaac_game_state_9c8d20_element_loop_more",
  "isaac_game_state_9c9340_hash_count_nonzero",
  "isaac_game_state_9c9340_hash_probe_slot",
  "isaac_game_state_9c9340_hash_loop_more",
  "isaac_game_state_9c9340_value_count_nonzero",
  "isaac_game_state_9c9340_value_loop_more",
  "isaac_game_state_9c9340_reorder_entry_negative",
  "isaac_game_state_9c9340_reorder_pending_flush",
  "isaac_game_state_9c9340_reorder_run_word",
  "isaac_game_state_9c9340_reorder_final_flush",
  "isaac_game_state_9c9340_div0xc_count",
  "isaac_game_state_9c9340_div0xc_resize_needed",
  "isaac_game_state_9c9340_div0xc_count_byte",
  "isaac_game_state_9c9340_div0xc_loop_needed",
  "isaac_game_state_9c9340_div0xc_loop_more",
  "isaac_game_state_9c9340_lane7_count",
  "isaac_game_state_9c9340_lane7_loop_more",
  "isaac_game_state_9c9340_byte_count_needed",
  "isaac_game_state_9c9340_byte_count_more",
  "isaac_game_state_9c9340_finalize_needed",
  "isaac_game_state_9c9340_finalize_pad_bytes",
  "isaac_game_state_9c9340_finalize_ror_add",
  "isaac_game_state_9c9340_checksum_stream_word",
  "isaac_game_state_683930_name_gate_ok",
  // ABI v5 accessors: write-span + 0x683930
  "isaac_game_state_9c8d20_element_loop_more_va",
  "isaac_game_state_9c8d20_element_loop_more_va_2",
  "isaac_game_state_9c9340_hash_count_gate_va",
  "isaac_game_state_9c9340_hash_probe_va",
  "isaac_game_state_9c9340_hash_bound_gate_va",
  "isaac_game_state_9c9340_value_count_gate_va",
  "isaac_game_state_9c9340_value_bound_gate_va",
  "isaac_game_state_9c9340_reorder_neg_gate_va",
  "isaac_game_state_9c9340_reorder_flush_gate_va",
  "isaac_game_state_9c9340_reorder_run_word_va",
  "isaac_game_state_9c9340_reorder_final_flush_va",
  "isaac_game_state_9c9340_div0xc_count_va",
  "isaac_game_state_9c9340_div0xc_resize_gate_va",
  "isaac_game_state_9c9340_div0xc_count_byte_va",
  "isaac_game_state_9c9340_div0xc_needed_gate_va",
  "isaac_game_state_9c9340_div0xc_bound_gate_va",
  "isaac_game_state_9c9340_lane7_count_va",
  "isaac_game_state_9c9340_lane7_more_va",
  "isaac_game_state_9c9340_byte_count_needed_va",
  "isaac_game_state_9c9340_byte_count_needed_va_2",
  "isaac_game_state_9c9340_byte_count_more_va",
  "isaac_game_state_9c9340_byte_count_more_va_2",
  "isaac_game_state_9c9340_finalize_mode_gate_va",
  "isaac_game_state_9c9340_finalize_partial_gate_va",
  "isaac_game_state_9c9340_finalize_pad_va",
  "isaac_game_state_9c9340_finalize_fold_va",
  "isaac_game_state_9c9340_checksum_store_xor_va",
  "isaac_game_state_9c9340_hash_table_off",
  "isaac_game_state_9c9340_hash_cap_off",
  "isaac_game_state_9c9340_hash_state_off",
  "isaac_game_state_9c9340_hash_count_off",
  "isaac_game_state_9c9340_value_count_off",
  "isaac_game_state_9c9340_value_base_off",
  "isaac_game_state_9c9340_holder_base_off",
  "isaac_game_state_9c9340_value_stride",
  "isaac_game_state_9c9340_holder_stride",
  "isaac_game_state_9c9340_reorder_table_off",
  "isaac_game_state_9c9340_reorder_entries",
  "isaac_game_state_9c9340_reorder_run_marker",
  "isaac_game_state_9c9340_div0xc_begin_off",
  "isaac_game_state_9c9340_div0xc_magic",
  "isaac_game_state_9c9340_div0xc_divisor",
  "isaac_game_state_9c9340_div0xc_cap",
  "isaac_game_state_9c9340_lane7_base_off",
  "isaac_game_state_9c9340_lane7_stride",
  "isaac_game_state_9c9340_lane7_count",
  "isaac_game_state_9c9340_checksum_off",
  "isaac_game_state_9c9340_checksum_xor",
  "isaac_game_state_9c9340_state_mode_off",
  "isaac_game_state_9c9340_state_partial_off",
  "isaac_game_state_9c9340_state_acc_off",
  "isaac_game_state_9c9340_state_lane_off",
  "isaac_game_state_683930_va",
  "isaac_game_state_683930_end_va",
  "isaac_game_state_683930_body_bytes",
  "isaac_game_state_683930_next_va",
  "isaac_game_state_683930_steam_iat",
  "isaac_game_state_683930_steam_arg",
  "isaac_game_state_683930_steam_gate_va",
  "isaac_game_state_683930_caller_count",
  "isaac_game_state_683930_caller_va_at",
  // ABI v6: reader row 0x9cb020 format-gate laws R1..R14 + fixed-count loop laws T1..T4
  "isaac_game_state_9cb020_gate_0x3b",
  "isaac_game_state_9cb020_gate_0x46",
  "isaac_game_state_9cb020_gate_0x47",
  "isaac_game_state_9cb020_gate_0x5b",
  "isaac_game_state_9cb020_gate_0x67",
  "isaac_game_state_9cb020_gate_0x6c",
  "isaac_game_state_9cb020_gate_0x88",
  "isaac_game_state_9cb020_gate_0x96",
  "isaac_game_state_9cb020_gate_0x9e",
  "isaac_game_state_9cb020_old_u64_gate",
  "isaac_game_state_9cb020_sub_0x64_present",
  "isaac_game_state_9cb020_sub_0x6c_present",
  "isaac_game_state_9cb020_old_byte_to_bool",
  "isaac_game_state_9cb020_old_u64_type_4",
  "isaac_game_state_9c9c30_fixed_count",
  "isaac_game_state_9c9c30_loop_more",
  "isaac_game_state_9c9d66_fixed_count",
  "isaac_game_state_9c9d66_loop_more",
  // ABI v6 accessors: reader row + fixed-count loops
  "isaac_game_state_9cb020_end_va",
  "isaac_game_state_9cb020_body_bytes",
  "isaac_game_state_9cb020_next_va",
  "isaac_game_state_9cb020_format_off",
  "isaac_game_state_9cb020_vtbl14_slot",
  "isaac_game_state_9cb020_row_writer_va",
  "isaac_game_state_9cb020_recurse_call_va",
  "isaac_game_state_9cb020_sub64_ctor_va",
  "isaac_game_state_9cb020_sub6c_ctor_va",
  "isaac_game_state_9cb020_flags_off",
  "isaac_game_state_9cb020_sub64_off",
  "isaac_game_state_9cb020_sub6c_off",
  "isaac_game_state_9cb020_sub64_alloc",
  "isaac_game_state_9cb020_sub6c_alloc",
  "isaac_game_state_9cb020_sub64_bytes",
  "isaac_game_state_9cb020_old_compat_type",
  "isaac_game_state_9cb020_alloc_iat",
  "isaac_game_state_9cb020_fail_alloc_va",
  "isaac_game_state_9cb020_gate_0x3b_va",
  "isaac_game_state_9cb020_gate_0x46_va",
  "isaac_game_state_9cb020_gate_0x47_va",
  "isaac_game_state_9cb020_gate_0x5b_va",
  "isaac_game_state_9cb020_gate_0x67_va",
  "isaac_game_state_9cb020_gate_0x6c_va",
  "isaac_game_state_9cb020_gate_0x88_va",
  "isaac_game_state_9cb020_gate_0x96_va",
  "isaac_game_state_9cb020_gate_0x9e_va",
  "isaac_game_state_9cb020_old_u64_gate_va",
  "isaac_game_state_9cb020_bit0_gate_va",
  "isaac_game_state_9cb020_bit1_gate_va",
  "isaac_game_state_9cb020_byte_to_bool_va",
  "isaac_game_state_9cb020_type4_gate_va",
  "isaac_game_state_9c9c30_fixed_count_va",
  "isaac_game_state_9c9c30_loop_head_va",
  "isaac_game_state_9c9c30_more_va",
  "isaac_game_state_9c9c30_base_off",
  "isaac_game_state_9c9c30_stride",
  "isaac_game_state_9c9d66_fixed_count_va",
  "isaac_game_state_9c9d66_loop_head_va",
  "isaac_game_state_9c9d66_more_va",
  "isaac_game_state_9c9d66_value_base_off",
  "isaac_game_state_9c9d66_holder_base_off",
  "isaac_game_state_9c9d66_value_stride",
  "isaac_game_state_9c9d66_holder_stride",
  // ABI v7: reorder-table loop bound + value word + 7-lane per-lane geometry
  "isaac_game_state_9c9340_reorder_loop_more",
  "isaac_game_state_9c9340_reorder_value_word",
  "isaac_game_state_9c9340_lane7_lane_base",
  "isaac_game_state_9c9340_lane7_value1_ptr",
  "isaac_game_state_9c9340_lane7_holder1_ptr",
  "isaac_game_state_9c9340_lane7_value2_ptr",
  "isaac_game_state_9c9340_lane7_holder2_ptr",
  // ABI v7 accessors: reorder + 7-lane
  "isaac_game_state_9c9340_reorder_loop_more_va",
  "isaac_game_state_9c9340_reorder_loop_more_va_2",
  "isaac_game_state_9c9340_reorder_value_word_va",
  "isaac_game_state_9c9340_reorder_value_word_va_2",
  "isaac_game_state_9c9340_lane7_lane_base_va",
  "isaac_game_state_9c9340_lane7_lane_base_va_2",
  "isaac_game_state_9c9340_lane7_elem1_value_va",
  "isaac_game_state_9c9340_lane7_elem1_holder_va",
  "isaac_game_state_9c9340_lane7_elem2_value_va",
  "isaac_game_state_9c9340_lane7_elem2_holder_va",
  "isaac_game_state_9c9340_lane7_elem1_value_off",
  "isaac_game_state_9c9340_lane7_elem1_holder_off",
  "isaac_game_state_9c9340_lane7_elem2_value_off",
  "isaac_game_state_9c9340_lane7_elem2_holder_off",
  "isaac_game_state_9c9340_lane7_byte_off_1",
  "isaac_game_state_9c9340_lane7_byte_off_2",
  "isaac_game_state_9c9340_lane7_byte_off_3",
  "isaac_game_state_9c9340_lane7_byte_off_4",
  // ABI v8: pill reader 0x9cb620 laws V1..V20
  "isaac_game_state_9cb620_io_ready",
  "isaac_game_state_9cb620_io_gate_0x3d",
  "isaac_game_state_9cb620_io_gate_0x4b",
  "isaac_game_state_9cb620_io_gate_0x7b",
  "isaac_game_state_9cb620_io_gate_0x7d",
  "isaac_game_state_9cb620_gs_gate_0x21",
  "isaac_game_state_9cb620_gs_gate_0x3f",
  "isaac_game_state_9cb620_gs_gate_0x49",
  "isaac_game_state_9cb620_gs_gate_0x82",
  "isaac_game_state_9cb620_slot_count_needed",
  "isaac_game_state_9cb620_string_copy_needed",
  "isaac_game_state_9cb620_slot_positive",
  "isaac_game_state_9cb620_slot_more",
  "isaac_game_state_9cb620_array74_needed",
  "isaac_game_state_9cb620_array74_more",
  "isaac_game_state_9cb620_array88_needed",
  "isaac_game_state_9cb620_array88_more",
  "isaac_game_state_9cb620_fixed8_count",
  "isaac_game_state_9cb620_fixed8_more",
  "isaac_game_state_9cb620_flag_byte_set",
  // ABI v8 accessors: pill reader 0x9cb620
  "isaac_game_state_9cb620_va",
  "isaac_game_state_9cb620_end_va",
  "isaac_game_state_9cb620_body_bytes",
  "isaac_game_state_9cb620_next_va",
  "isaac_game_state_9cb620_seh_handler_dat",
  "isaac_game_state_9cb620_io_format_off",
  "isaac_game_state_9cb620_gs_format_off",
  "isaac_game_state_9cb620_io_vtbl10_slot",
  "isaac_game_state_9cb620_vtbl14_slot",
  "isaac_game_state_9cb620_row_writer_va",
  "isaac_game_state_9cb620_serializer_row_call_va",
  "isaac_game_state_9cb620_reader_row_call_74_va",
  "isaac_game_state_9cb620_reader_row_call_88_va",
  "isaac_game_state_9cb620_vector_ctor_va",
  "isaac_game_state_9cb620_vector_init_va",
  "isaac_game_state_9cb620_list_insert_va",
  "isaac_game_state_9cb620_string_copy_va",
  "isaac_game_state_9cb620_string_empty_dat",
  "isaac_game_state_9cb620_flags_off",
  "isaac_game_state_9cb620_flag_bit_0",
  "isaac_game_state_9cb620_flag_bit_1",
  "isaac_game_state_9cb620_flag_bit_2",
  "isaac_game_state_9cb620_flag_bit_3",
  "isaac_game_state_9cb620_flag_bit_4",
  "isaac_game_state_9cb620_flag_bit_5",
  "isaac_game_state_9cb620_table_off",
  "isaac_game_state_9cb620_table_bytes",
  "isaac_game_state_9cb620_table_stride",
  "isaac_game_state_9cb620_table_slots",
  "isaac_game_state_9cb620_array74_off",
  "isaac_game_state_9cb620_array88_off",
  "isaac_game_state_9cb620_array_stride",
  "isaac_game_state_9cb620_fixed8_count_va",
  "isaac_game_state_9cb620_fixed8_more_va",
  "isaac_game_state_9cb620_io_ready_gate_va",
  "isaac_game_state_9cb620_io_ready_gate_va_2",
  "isaac_game_state_9cb620_io_ready_gate_va_3",
  "isaac_game_state_9cb620_io_ready_gate_va_4",
  "isaac_game_state_9cb620_io_gate_0x3d_va",
  "isaac_game_state_9cb620_io_gate_0x4b_va",
  "isaac_game_state_9cb620_io_gate_0x7b_va",
  "isaac_game_state_9cb620_io_gate_0x7b_jne_va",
  "isaac_game_state_9cb620_io_gate_0x7d_va",
  "isaac_game_state_9cb620_io_gate_0x7d_jne_va",
  "isaac_game_state_9cb620_gs_gate_0x21_va",
  "isaac_game_state_9cb620_gs_gate_0x3f_va",
  "isaac_game_state_9cb620_gs_gate_0x3f_jne_va",
  "isaac_game_state_9cb620_gs_gate_0x49_va",
  "isaac_game_state_9cb620_gs_gate_0x49_jne_va",
  "isaac_game_state_9cb620_gs_gate_0x82_va",
  "isaac_game_state_9cb620_slot_count_gate_va",
  "isaac_game_state_9cb620_string_copy_gate_va",
  "isaac_game_state_9cb620_slot_positive_va",
  "isaac_game_state_9cb620_slot_more_va",
  "isaac_game_state_9cb620_array74_needed_va",
  "isaac_game_state_9cb620_array74_more_va",
  "isaac_game_state_9cb620_array88_needed_va",
  "isaac_game_state_9cb620_array88_more_va",
  "isaac_game_state_9cb620_flag_gate_va",
  "isaac_game_state_9cb620_flag_bit1_or_va",
  "isaac_game_state_9cb620_flag_bit2_or_va",
  "isaac_game_state_9cb620_flag_bit3_or_va",
  "isaac_game_state_9cb620_flag_bit4_or_va",
  "isaac_game_state_9cb620_flag_bit5_or_va",
  "isaac_game_state_9cb620_caller_count",
  "isaac_game_state_9cb620_caller_va_at",
  // ABI v9: giant read entry 0x9cc1a0 laws
  "isaac_game_state_9cc1a0_gs_gate_0x2b",
  "isaac_game_state_9cc1a0_gs_gate_0x2e",
  "isaac_game_state_9cc1a0_gs_gate_0x2f",
  "isaac_game_state_9cc1a0_gs_gate_0x30",
  "isaac_game_state_9cc1a0_gs_gate_0x33",
  "isaac_game_state_9cc1a0_gs_gate_0x34",
  "isaac_game_state_9cc1a0_gs_gate_0x40",
  "isaac_game_state_9cc1a0_gs_gate_0x42",
  "isaac_game_state_9cc1a0_gs_gate_0x43",
  "isaac_game_state_9cc1a0_gs_gate_0x44",
  "isaac_game_state_9cc1a0_gs_gate_0x47",
  "isaac_game_state_9cc1a0_gs_gate_0x48",
  "isaac_game_state_9cc1a0_gs_gate_0x50",
  "isaac_game_state_9cc1a0_gs_gate_0x53",
  "isaac_game_state_9cc1a0_gs_gate_0x54",
  "isaac_game_state_9cc1a0_gs_gate_0x57",
  "isaac_game_state_9cc1a0_gs_gate_0x59",
  "isaac_game_state_9cc1a0_gs_gate_0x85",
  "isaac_game_state_9cc1a0_gs_gate_0x86",
  "isaac_game_state_9cc1a0_gs_gate_0x87",
  "isaac_game_state_9cc1a0_gs_gate_0x89",
  "isaac_game_state_9cc1a0_gs_gate_0x8a",
  "isaac_game_state_9cc1a0_gs_gate_0x8d",
  "isaac_game_state_9cc1a0_gs_gate_0x93",
  "isaac_game_state_9cc1a0_gs_gate_0x95",
  "isaac_game_state_9cc1a0_gs_gate_0x98",
  "isaac_game_state_9cc1a0_gs_gate_0x9b",
  "isaac_game_state_9cc1a0_io_gate_0x56",
  "isaac_game_state_9cc1a0_io_gate_0x7c",
  "isaac_game_state_9cc1a0_io_gate_0xa5",
  "isaac_game_state_9cc1a0_dispatch_count",
  "isaac_game_state_9cc1a0_dispatch_second_pass_needed",
  "isaac_game_state_9cc1a0_t164_count",
  "isaac_game_state_9cc1a0_count_1fb_below",
  "isaac_game_state_9cc1a0_table_19d1c_more",
  "isaac_game_state_9cc1a0_byte_0x50_more",
  "isaac_game_state_9cc1a0_byte_0x4d_more",
  "isaac_game_state_9cc1a0_word_0x25_more",
  "isaac_game_state_9cc1a0_word_more",
  "isaac_game_state_9cc1a0_count8_more",
  "isaac_game_state_9cc1a0_signed_byte_count_positive",
  "isaac_game_state_9cc1a0_signed_idx_lt_movsx8",
  "isaac_game_state_9cc1a0_signed_idx_lt_count",
  "isaac_game_state_9cc1a0_signed_byte_lt",
  "isaac_game_state_9cc1a0_byte_zero_ok",
  "isaac_game_state_9cc1a0_tail_ready_ok",
  "isaac_game_state_9cc1a0_checksum_pass",
  "isaac_game_state_9cc1a0_checksum_matches",
  "isaac_game_state_9cc1a0_clamp_0x35",
  "isaac_game_state_9cc1a0_clamp_0x1a",
  // ABI v9 accessors: giant read entry 0x9cc1a0
  "isaac_game_state_9cc1a0_va",
  "isaac_game_state_9cc1a0_end_va",
  "isaac_game_state_9cc1a0_body_bytes",
  "isaac_game_state_9cc1a0_next_va",
  "isaac_game_state_9cc1a0_seh_handler_dat",
  "isaac_game_state_9cc1a0_gs_cookie_dat",
  "isaac_game_state_9cc1a0_io_format_off",
  "isaac_game_state_9cc1a0_gs_format_off",
  "isaac_game_state_9cc1a0_io_format_store_va",
  "isaac_game_state_9cc1a0_delete_call_va",
  "isaac_game_state_9cc1a0_read_pill_call_va_0",
  "isaac_game_state_9cc1a0_read_pill_call_va_1",
  "isaac_game_state_9cc1a0_read_pill_call_va_2",
  "isaac_game_state_9cc1a0_read_pill_call_va_3",
  "isaac_game_state_9cc1a0_body_c_call_va",
  "isaac_game_state_9cc1a0_cf000_call_va",
  "isaac_game_state_9cc1a0_serializer_ctor_call_va",
  "isaac_game_state_9cc1a0_checksum_magic",
  "isaac_game_state_9cc1a0_mgr_global_dat",
  "isaac_game_state_9cc1a0_mgr_f98_off",
  "isaac_game_state_9cc1a0_lane19c_off",
  "isaac_game_state_9cc1a0_lane19c_bound",
  "isaac_game_state_9cc1a0_holders1_off",
  "isaac_game_state_9cc1a0_values1_off",
  "isaac_game_state_9cc1a0_holders2_off",
  "isaac_game_state_9cc1a0_values2_off",
  "isaac_game_state_9cc1a0_table19530_off",
  "isaac_game_state_9cc1a0_table19d1c_end",
  "isaac_game_state_9cc1a0_slot13_base_off",
  "isaac_game_state_9cc1a0_byte80_bound",
  "isaac_game_state_9cc1a0_byte4d_bound",
  "isaac_game_state_9cc1a0_word25_bound",
  "isaac_game_state_9cc1a0_clamp35_const",
  "isaac_game_state_9cc1a0_clamp1a_const",
  "isaac_game_state_9cc1a0_stride_b8",
  "isaac_game_state_9cc1a0_stride_c",
  "isaac_game_state_9cc1a0_gs_gate_0x2b_va",
  "isaac_game_state_9cc1a0_gs_gate_0x2e_va",
  "isaac_game_state_9cc1a0_gs_gate_0x2f_va",
  "isaac_game_state_9cc1a0_gs_gate_0x30_va",
  "isaac_game_state_9cc1a0_gs_gate_0x33_va",
  "isaac_game_state_9cc1a0_gs_gate_0x34_va",
  "isaac_game_state_9cc1a0_gs_gate_0x40_va",
  "isaac_game_state_9cc1a0_gs_gate_0x42_va",
  "isaac_game_state_9cc1a0_gs_gate_0x43_va",
  "isaac_game_state_9cc1a0_gs_gate_0x44_va",
  "isaac_game_state_9cc1a0_gs_gate_0x47_va",
  "isaac_game_state_9cc1a0_gs_gate_0x48_va",
  "isaac_game_state_9cc1a0_gs_gate_0x50_va",
  "isaac_game_state_9cc1a0_gs_gate_0x53_va",
  "isaac_game_state_9cc1a0_gs_gate_0x54_va",
  "isaac_game_state_9cc1a0_gs_gate_0x57_va",
  "isaac_game_state_9cc1a0_gs_gate_0x59_va",
  "isaac_game_state_9cc1a0_gs_gate_0x85_va",
  "isaac_game_state_9cc1a0_gs_gate_0x86_va",
  "isaac_game_state_9cc1a0_gs_gate_0x87_va",
  "isaac_game_state_9cc1a0_gs_gate_0x89_va",
  "isaac_game_state_9cc1a0_gs_gate_0x8a_va",
  "isaac_game_state_9cc1a0_gs_gate_0x8d_va",
  "isaac_game_state_9cc1a0_gs_gate_0x93_va",
  "isaac_game_state_9cc1a0_gs_gate_0x95_va",
  "isaac_game_state_9cc1a0_gs_gate_0x98_va",
  "isaac_game_state_9cc1a0_gs_gate_0x9b_va",
  "isaac_game_state_9cc1a0_io_gate_0x56_va",
  "isaac_game_state_9cc1a0_io_gate_0x7c_va",
  "isaac_game_state_9cc1a0_io_gate_0xa5_va",
  "isaac_game_state_9cc1a0_gs_gate_0x21_va",
  "isaac_game_state_9cc1a0_io_gate_0x7b_va",
  "isaac_game_state_9cc1a0_io_gate_0x7b_va_2",
  "isaac_game_state_9cc1a0_dispatch0_va",
  "isaac_game_state_9cc1a0_dispatch1_va",
  "isaac_game_state_9cc1a0_dispatch2_va",
  "isaac_game_state_9cc1a0_dispatch3_va",
  "isaac_game_state_9cc1a0_dispatch4_va",
  "isaac_game_state_9cc1a0_dispatch5_va",
  "isaac_game_state_9cc1a0_dispatch6_va",
  "isaac_game_state_9cc1a0_dispatch7_va",
  "isaac_game_state_9cc1a0_dispatch_second_pass_va",
  "isaac_game_state_9cc1a0_t164_count_va",
  "isaac_game_state_9cc1a0_count_1fb_gate_va",
  "isaac_game_state_9cc1a0_table_19d1c_more_va",
  "isaac_game_state_9cc1a0_byte_0x50_more_va",
  "isaac_game_state_9cc1a0_byte_0x4d_more_va",
  "isaac_game_state_9cc1a0_word_0x25_more_va",
  "isaac_game_state_9cc1a0_word_more_va",
  "isaac_game_state_9cc1a0_count8_more_va",
  "isaac_game_state_9cc1a0_signed_byte_pos_va",
  "isaac_game_state_9cc1a0_signed_idx_movsx8_va",
  "isaac_game_state_9cc1a0_signed_idx_count_va",
  "isaac_game_state_9cc1a0_signed_byte_lt_va",
  "isaac_game_state_9cc1a0_byte_zero_gate_va",
  "isaac_game_state_9cc1a0_tail_ready_gate_va",
  "isaac_game_state_9cc1a0_checksum_pass_va",
  "isaac_game_state_9cc1a0_checksum_match_va",
  "isaac_game_state_9cc1a0_clamp35_va",
  "isaac_game_state_9cc1a0_clamp1a_va",
  "isaac_game_state_9cc1a0_caller_count",
  "isaac_game_state_9cc1a0_caller_va_at",
  // ABI v10: body C 0x9ce720 + full-field reader giant 0x9d05d0 laws
  "isaac_game_state_9ce720_dispatch_count",
  "isaac_game_state_9ce720_count_fits",
  "isaac_game_state_9ce720_io_gate_0x4a",
  "isaac_game_state_9ce720_io_gate_0x37",
  "isaac_game_state_9ce720_default_count_0x1ff_0x2dd",
  "isaac_game_state_9ce720_default_count_0x78_0xbe",
  "isaac_game_state_9ce720_count_0xe_0xf",
  "isaac_game_state_9ce720_io_gate_0x4e",
  "isaac_game_state_9d05d0_io_gate_0x1e",
  "isaac_game_state_9d05d0_io_gate_0x1f",
  "isaac_game_state_9d05d0_io_gate_0x20",
  "isaac_game_state_9d05d0_io_gate_0x23",
  "isaac_game_state_9d05d0_io_gate_0x27",
  "isaac_game_state_9d05d0_io_gate_0x28",
  "isaac_game_state_9d05d0_io_gate_0x29",
  "isaac_game_state_9d05d0_io_gate_0x2d",
  "isaac_game_state_9d05d0_io_gate_0x2f",
  "isaac_game_state_9d05d0_io_gate_0x30",
  "isaac_game_state_9d05d0_io_gate_0x38",
  "isaac_game_state_9d05d0_io_gate_0x39",
  "isaac_game_state_9d05d0_io_gate_0x3a",
  "isaac_game_state_9d05d0_io_gate_0x3b",
  "isaac_game_state_9d05d0_io_gate_0x3e",
  "isaac_game_state_9d05d0_io_gate_0x40",
  "isaac_game_state_9d05d0_io_gate_0x41",
  "isaac_game_state_9d05d0_io_gate_0x43",
  "isaac_game_state_9d05d0_io_gate_0x45",
  "isaac_game_state_9d05d0_io_gate_0x4c",
  "isaac_game_state_9d05d0_io_gate_0x4d",
  "isaac_game_state_9d05d0_io_gate_0x4f",
  "isaac_game_state_9d05d0_io_gate_0x50",
  "isaac_game_state_9d05d0_io_gate_0x51",
  "isaac_game_state_9d05d0_io_gate_0x52",
  "isaac_game_state_9d05d0_io_gate_0x55",
  "isaac_game_state_9d05d0_io_gate_0x58",
  "isaac_game_state_9d05d0_io_gate_0x5a",
  "isaac_game_state_9d05d0_io_gate_0x5b",
  "isaac_game_state_9d05d0_io_gate_0x5c",
  "isaac_game_state_9d05d0_io_gate_0x5d",
  "isaac_game_state_9d05d0_io_gate_0x5e",
  "isaac_game_state_9d05d0_io_gate_0x5f",
  "isaac_game_state_9d05d0_io_gate_0x60",
  "isaac_game_state_9d05d0_io_gate_0x61",
  "isaac_game_state_9d05d0_io_gate_0x62",
  "isaac_game_state_9d05d0_io_gate_0x63",
  "isaac_game_state_9d05d0_io_gate_0x64",
  "isaac_game_state_9d05d0_io_gate_0x65",
  "isaac_game_state_9d05d0_io_gate_0x67",
  "isaac_game_state_9d05d0_io_gate_0x6a",
  "isaac_game_state_9d05d0_io_gate_0x6c",
  "isaac_game_state_9d05d0_io_gate_0x6e",
  "isaac_game_state_9d05d0_io_gate_0x6f",
  "isaac_game_state_9d05d0_io_gate_0x72",
  "isaac_game_state_9d05d0_io_gate_0x73",
  "isaac_game_state_9d05d0_io_gate_0x74",
  "isaac_game_state_9d05d0_io_gate_0x75",
  "isaac_game_state_9d05d0_io_gate_0x76",
  "isaac_game_state_9d05d0_io_gate_0x78",
  "isaac_game_state_9d05d0_io_gate_0x79",
  "isaac_game_state_9d05d0_io_gate_0x7e",
  "isaac_game_state_9d05d0_io_gate_0x7f",
  "isaac_game_state_9d05d0_io_gate_0x80",
  "isaac_game_state_9d05d0_io_gate_0x81",
  "isaac_game_state_9d05d0_io_gate_0x82",
  "isaac_game_state_9d05d0_io_gate_0x83",
  "isaac_game_state_9d05d0_io_gate_0x8a",
  "isaac_game_state_9d05d0_io_gate_0x8b",
  "isaac_game_state_9d05d0_io_gate_0x8c",
  "isaac_game_state_9d05d0_io_gate_0x8f",
  "isaac_game_state_9d05d0_io_gate_0x90",
  "isaac_game_state_9d05d0_io_gate_0x97",
  "isaac_game_state_9d05d0_io_gate_0x99",
  "isaac_game_state_9d05d0_io_gate_0x9c",
  "isaac_game_state_9d05d0_io_gate_0x9d",
  "isaac_game_state_9d05d0_io_gate_0xa0",
  "isaac_game_state_9d05d0_io_gate_0xa4",
  "isaac_game_state_9d05d0_io_gate_0xa5",
  "isaac_game_state_9d05d0_io_gate_0xa6",
  "isaac_game_state_9d05d0_io_gate_0xa8",
  "isaac_game_state_9d05d0_io_gate_0xa9",
  "isaac_game_state_9d05d0_io_gate_0x23_above",
  "isaac_game_state_9d05d0_io_gate_0x24_above",
  "isaac_game_state_9d05d0_lane_count_1_4",
  "isaac_game_state_9d05d0_lane_count_2_4",
  "isaac_game_state_9d05d0_count_0xf_0x10",
  "isaac_game_state_9d05d0_format_in_range",
  "isaac_game_state_9d05d0_count_cap_ok",
  "isaac_game_state_9d05d0_idx_le_vecsize",
  "isaac_game_state_9d05d0_slot_cap_lt_3",
  "isaac_game_state_9d05d0_clamp_0x14",
  "isaac_game_state_9d05d0_clamp_signed_0xa",
  "isaac_game_state_9d05d0_head_nonneg",
  "isaac_game_state_9d05d0_head_lt_vecsize",
  "isaac_game_state_9d05d0_signed_positive",
  "isaac_game_state_9d05d0_signed_idx_lt_vecsize",
  "isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize",
  "isaac_game_state_9d05d0_value_neg_override",
  "isaac_game_state_9d05d0_byte_nonzero",
  "isaac_game_state_9d05d0_byte_eq_1",
  "isaac_game_state_9d05d0_byte_ff_ok",
  "isaac_game_state_9d05d0_u32_count_needed",
  "isaac_game_state_9d05d0_ready_ok",
  "isaac_game_state_9d05d0_v2fd10_result_ok",
  "isaac_game_state_9d05d0_c7350_result_ok",
  "isaac_game_state_9d05d0_cff40_result_ok",
  "isaac_game_state_9d05d0_byte_idx_lt_byte",
  "isaac_game_state_9d05d0_idx_lt_2",
  "isaac_game_state_9d05d0_idx_lt_6",
  "isaac_game_state_9d05d0_idx_lt_8",
  "isaac_game_state_9d05d0_word_idx_lt_count",
  "isaac_game_state_9d05d0_uint_idx_lt_count",
  "isaac_game_state_9ce720_dispatch_count_va",
  "isaac_game_state_9ce720_count_fits_va",
  "isaac_game_state_9ce720_io_gate_0x4a_va",
  "isaac_game_state_9ce720_io_gate_0x37_va",
  "isaac_game_state_9ce720_default_count_0x1ff_0x2dd_va",
  "isaac_game_state_9ce720_default_count_0x78_0xbe_va",
  "isaac_game_state_9ce720_count_0xe_0xf_va",
  "isaac_game_state_9ce720_io_gate_0x4e_va",
  "isaac_game_state_9d05d0_io_gate_0x1e_va",
  "isaac_game_state_9d05d0_io_gate_0x1f_va",
  "isaac_game_state_9d05d0_io_gate_0x20_va",
  "isaac_game_state_9d05d0_io_gate_0x23_va",
  "isaac_game_state_9d05d0_io_gate_0x27_va",
  "isaac_game_state_9d05d0_io_gate_0x28_va",
  "isaac_game_state_9d05d0_io_gate_0x29_va",
  "isaac_game_state_9d05d0_io_gate_0x2d_va",
  "isaac_game_state_9d05d0_io_gate_0x2f_va",
  "isaac_game_state_9d05d0_io_gate_0x30_va",
  "isaac_game_state_9d05d0_io_gate_0x38_va",
  "isaac_game_state_9d05d0_io_gate_0x39_va",
  "isaac_game_state_9d05d0_io_gate_0x3a_va",
  "isaac_game_state_9d05d0_io_gate_0x3b_va",
  "isaac_game_state_9d05d0_io_gate_0x3e_va",
  "isaac_game_state_9d05d0_io_gate_0x40_va",
  "isaac_game_state_9d05d0_io_gate_0x41_va",
  "isaac_game_state_9d05d0_io_gate_0x43_va",
  "isaac_game_state_9d05d0_io_gate_0x45_va",
  "isaac_game_state_9d05d0_io_gate_0x4c_va",
  "isaac_game_state_9d05d0_io_gate_0x4d_va",
  "isaac_game_state_9d05d0_io_gate_0x4f_va",
  "isaac_game_state_9d05d0_io_gate_0x50_va",
  "isaac_game_state_9d05d0_io_gate_0x51_va",
  "isaac_game_state_9d05d0_io_gate_0x52_va",
  "isaac_game_state_9d05d0_io_gate_0x55_va",
  "isaac_game_state_9d05d0_io_gate_0x58_va",
  "isaac_game_state_9d05d0_io_gate_0x5a_va",
  "isaac_game_state_9d05d0_io_gate_0x5b_va",
  "isaac_game_state_9d05d0_io_gate_0x5c_va",
  "isaac_game_state_9d05d0_io_gate_0x5d_va",
  "isaac_game_state_9d05d0_io_gate_0x5e_va",
  "isaac_game_state_9d05d0_io_gate_0x5f_va",
  "isaac_game_state_9d05d0_io_gate_0x60_va",
  "isaac_game_state_9d05d0_io_gate_0x61_va",
  "isaac_game_state_9d05d0_io_gate_0x62_va",
  "isaac_game_state_9d05d0_io_gate_0x63_va",
  "isaac_game_state_9d05d0_io_gate_0x64_va",
  "isaac_game_state_9d05d0_io_gate_0x65_va",
  "isaac_game_state_9d05d0_io_gate_0x67_va",
  "isaac_game_state_9d05d0_io_gate_0x6a_va",
  "isaac_game_state_9d05d0_io_gate_0x6c_va",
  "isaac_game_state_9d05d0_io_gate_0x6e_va",
  "isaac_game_state_9d05d0_io_gate_0x6f_va",
  "isaac_game_state_9d05d0_io_gate_0x72_va",
  "isaac_game_state_9d05d0_io_gate_0x73_va",
  "isaac_game_state_9d05d0_io_gate_0x74_va",
  "isaac_game_state_9d05d0_io_gate_0x75_va",
  "isaac_game_state_9d05d0_io_gate_0x76_va",
  "isaac_game_state_9d05d0_io_gate_0x78_va",
  "isaac_game_state_9d05d0_io_gate_0x79_va",
  "isaac_game_state_9d05d0_io_gate_0x7e_va",
  "isaac_game_state_9d05d0_io_gate_0x7f_va",
  "isaac_game_state_9d05d0_io_gate_0x80_va",
  "isaac_game_state_9d05d0_io_gate_0x81_va",
  "isaac_game_state_9d05d0_io_gate_0x82_va",
  "isaac_game_state_9d05d0_io_gate_0x83_va",
  "isaac_game_state_9d05d0_io_gate_0x8a_va",
  "isaac_game_state_9d05d0_io_gate_0x8b_va",
  "isaac_game_state_9d05d0_io_gate_0x8c_va",
  "isaac_game_state_9d05d0_io_gate_0x8f_va",
  "isaac_game_state_9d05d0_io_gate_0x90_va",
  "isaac_game_state_9d05d0_io_gate_0x97_va",
  "isaac_game_state_9d05d0_io_gate_0x99_va",
  "isaac_game_state_9d05d0_io_gate_0x9c_va",
  "isaac_game_state_9d05d0_io_gate_0x9d_va",
  "isaac_game_state_9d05d0_io_gate_0xa0_va",
  "isaac_game_state_9d05d0_io_gate_0xa4_va",
  "isaac_game_state_9d05d0_io_gate_0xa5_va",
  "isaac_game_state_9d05d0_io_gate_0xa6_va",
  "isaac_game_state_9d05d0_io_gate_0xa8_va",
  "isaac_game_state_9d05d0_io_gate_0xa9_va",
  "isaac_game_state_9d05d0_io_gate_0x23_above_va",
  "isaac_game_state_9d05d0_io_gate_0x24_above_va",
  "isaac_game_state_9d05d0_lane_count_1_4_va",
  "isaac_game_state_9d05d0_lane_count_2_4_va",
  "isaac_game_state_9d05d0_count_0xf_0x10_va",
  "isaac_game_state_9d05d0_format_in_range_va",
  "isaac_game_state_9d05d0_count_cap_ok_va",
  "isaac_game_state_9d05d0_idx_le_vecsize_va",
  "isaac_game_state_9d05d0_slot_cap_lt_3_va",
  "isaac_game_state_9d05d0_clamp_0x14_va",
  "isaac_game_state_9d05d0_clamp_signed_0xa_va",
  "isaac_game_state_9d05d0_head_nonneg_va",
  "isaac_game_state_9d05d0_head_lt_vecsize_va",
  "isaac_game_state_9d05d0_signed_positive_va",
  "isaac_game_state_9d05d0_signed_idx_lt_vecsize_va",
  "isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize_va",
  "isaac_game_state_9d05d0_value_neg_override_va",
  "isaac_game_state_9d05d0_byte_nonzero_va",
  "isaac_game_state_9d05d0_byte_eq_1_va",
  "isaac_game_state_9d05d0_byte_ff_ok_va",
  "isaac_game_state_9d05d0_u32_count_needed_va",
  "isaac_game_state_9d05d0_ready_ok_va",
  "isaac_game_state_9d05d0_v2fd10_result_ok_va",
  "isaac_game_state_9d05d0_c7350_result_ok_va",
  "isaac_game_state_9d05d0_cff40_result_ok_va",
  "isaac_game_state_9d05d0_byte_idx_lt_byte_va",
  "isaac_game_state_9d05d0_idx_lt_2_va",
  "isaac_game_state_9d05d0_idx_lt_6_va",
  "isaac_game_state_9d05d0_idx_lt_8_va",
  "isaac_game_state_9d05d0_word_idx_lt_count_va",
  "isaac_game_state_9d05d0_uint_idx_lt_count_va",
  "isaac_game_state_9ce720_va",
  "isaac_game_state_9ce720_end_va",
  "isaac_game_state_9ce720_body_bytes",
  "isaac_game_state_9ce720_next_va",
  "isaac_game_state_9ce720_io_format_off",
  "isaac_game_state_9ce720_mgr_global_dat",
  "isaac_game_state_9ce720_mgr_vec_a_start_off",
  "isaac_game_state_9ce720_mgr_vec_a_end_off",
  "isaac_game_state_9ce720_mgr_vec_b_start_off",
  "isaac_game_state_9ce720_mgr_vec_b_end_off",
  "isaac_game_state_9d05d0_va",
  "isaac_game_state_9d05d0_end_va",
  "isaac_game_state_9d05d0_body_bytes",
  "isaac_game_state_9d05d0_next_va",
  "isaac_game_state_9d05d0_seh_handler_dat",
  "isaac_game_state_9d05d0_gs_cookie_dat",
  "isaac_game_state_9d05d0_io_format_off",
  "isaac_game_state_9d05d0_reader_row_call_va",
  "isaac_game_state_9d05d0_mgr_global_dat",
  "isaac_game_state_9d05d0_mgr_vec_2a404",
  "isaac_game_state_9d05d0_mgr_vec_2a408",
  "isaac_game_state_9d05d0_mgr_vec_2a410",
  "isaac_game_state_9d05d0_mgr_vec_2a414",
  "isaac_game_state_9d05d0_count_cap",
  "isaac_game_state_9d05d0_clamp0x14_const",
  "isaac_game_state_9d05d0_clamp0xa_const",
  "isaac_game_state_9d05d0_range_lo",
  "isaac_game_state_9d05d0_range_hi",
  "isaac_game_state_9d05d0_stride_148",
  "isaac_game_state_9d05d0_mask_7fff",
  "isaac_game_state_9ce720_caller_count",
  "isaac_game_state_9ce720_caller_va_at",
  "isaac_game_state_9d05d0_caller_count",
  "isaac_game_state_9d05d0_caller_va_at",
  // ABI v11: small-body + writer-giant/reader-tail laws
  "isaac_game_state_9cf000_clear_more",
  "isaac_game_state_9cff40_io8_ge_0x92",
  "isaac_game_state_9d0440_byte_c_nonzero",
  "isaac_game_state_9d0440_byte_d_nonzero",
  "isaac_game_state_9d0440_flag_byte",
  "isaac_game_state_9d45c0_flags_pack",
  "isaac_game_state_9d45c0_count_sar3",
  "isaac_game_state_9d45c0_count_nonzero",
  "isaac_game_state_9d45c0_idx_lt_count",
  "isaac_game_state_9d45c0_count_22c_positive",
  "isaac_game_state_9d45c0_idx_lt_count_22c",
  "isaac_game_state_9d45c0_element_count_78",
  "isaac_game_state_9d45c0_byte_count_36",
  "isaac_game_state_9d45c0_byte_idx_lt_byte_count",
  "isaac_game_state_9d45c0_byte_count_nonzero",
  "isaac_game_state_9d45c0_byte_398_nonzero",
  "isaac_game_state_9d45c0_word_idx_lt_count",
  "isaac_game_state_9d45c0_idx_lt_8",
  "isaac_game_state_9d45c0_idx_lt_6",
  "isaac_game_state_9d45c0_idx_lt_byte_count_u32",
  "isaac_game_state_9d45c0_element_count_34",
  "isaac_game_state_9d45c0_byte_ne_ff",
  "isaac_game_state_9d45c0_walk_continue_3c0",
  "isaac_game_state_9d45c0_element_byte_nonzero",
  "isaac_game_state_9d45c0_value_nonneg",
  "isaac_game_state_9d45c0_scan_value_nonneg",
  "isaac_game_state_9d45c0_scan_remaining_nonneg",
  "isaac_game_state_9d45c0_walk_continue_5d4",
  "isaac_game_state_9d71b0_io8_ge_0xa2",
  "isaac_game_state_9d71b0_io8_ge_0x9f",
  "isaac_game_state_9d71b0_io8_ge_0xa3",
  "isaac_game_state_9d71b0_count_pos_signed",
  "isaac_game_state_9d71b0_idx_lt_count_signed",
  "isaac_game_state_9d71b0_byte_nonzero_setne",
  "isaac_game_state_9d71b0_vec_slot_full",
  "isaac_game_state_9d71b0_count_nonzero",
  "isaac_game_state_9d71b0_idx_lt_count",
  // ABI v11 accessors
  "isaac_game_state_9cf000_va",
  "isaac_game_state_9cf000_end_va",
  "isaac_game_state_9cf000_body_bytes",
  "isaac_game_state_9cf000_next_va",
  "isaac_game_state_9cf000_clear_more_va",
  "isaac_game_state_9cf000_caller_count",
  "isaac_game_state_9cf000_caller_va_at",
  // ABI v12: 0x9d77e0 sub-object serializer + 0x9d8190 save-piece writer
  // + shared leaves 0x9d8660/0x9d8820/0x9d8a20 (laws + accessors)
  "isaac_game_state_9d77e0_element_count_0xc",
  "isaac_game_state_9d77e0_loop_count_nonzero",
  "isaac_game_state_9d77e0_idx_lt_count",
  "isaac_game_state_9d77e0_elem_byte4_nonzero",
  "isaac_game_state_9d77e0_elem_byte8_nonzero",
  "isaac_game_state_9d8190_piece_count_positive",
  "isaac_game_state_9d8190_piece_idx_lt_count",
  "isaac_game_state_9d8190_seed_obj_present",
  "isaac_game_state_9d8190_msg_sso_heap_used",
  "isaac_game_state_9d8190_msg_sso_ptr",
  "isaac_game_state_9d8190_checksum_stream_word",
  "isaac_game_state_9d8660_element_count_0xc",
  "isaac_game_state_9d8660_count_not_maxed",
  "isaac_game_state_9d8660_grow_target_count",
  "isaac_game_state_9d8660_grow_target_ok",
  "isaac_game_state_9d8660_copy_more",
  "isaac_game_state_9d8820_count_nonzero",
  "isaac_game_state_9d8820_loop_more",
  "isaac_game_state_9d8a20_element_count_0x34",
  "isaac_game_state_9d8a20_count_le_cap",
  "isaac_game_state_9d8a20_grow_target_ok",
  "isaac_game_state_9d77e0_va",
  "isaac_game_state_9d77e0_end_va",
  "isaac_game_state_9d77e0_body_bytes",
  "isaac_game_state_9d77e0_next_va",
  "isaac_game_state_9d77e0_stride",
  "isaac_game_state_9d77e0_loop_a_base_off",
  "isaac_game_state_9d77e0_loop_a_end_off",
  "isaac_game_state_9d77e0_loop_b_base_off",
  "isaac_game_state_9d77e0_loop_b_end_off",
  "isaac_game_state_9d77e0_loop_c_base_off",
  "isaac_game_state_9d77e0_loop_c_end_off",
  "isaac_game_state_9d77e0_loop_d_base_off",
  "isaac_game_state_9d77e0_loop_d_end_off",
  "isaac_game_state_9d77e0_elem_byte4_off",
  "isaac_game_state_9d77e0_elem_byte8_off",
  "isaac_game_state_9d77e0_count_magic",
  "isaac_game_state_9d77e0_count_va",
  "isaac_game_state_9d77e0_count_zero_gate_va",
  "isaac_game_state_9d77e0_loop_more_va",
  "isaac_game_state_9d77e0_byte4_gate_va",
  "isaac_game_state_9d77e0_byte8_gate_va",
  "isaac_game_state_9d77e0_caller_count",
  "isaac_game_state_9d77e0_caller_va_at",
  "isaac_game_state_9d8190_piece_count_off",
  "isaac_game_state_9d8190_piece_base_off",
  "isaac_game_state_9d8190_piece_stride",
  "isaac_game_state_9d8190_seed_ptr_off",
  "isaac_game_state_9d8190_piece_count_pos_va",
  "isaac_game_state_9d8190_piece_idx_lt_va",
  "isaac_game_state_9d8190_45c0_call_va",
  "isaac_game_state_9d8190_seed_gate_va",
  "isaac_game_state_9d8190_sso_heap_gate_va",
  "isaac_game_state_9d8190_sso_free_gate_va",
  "isaac_game_state_9d8190_checksum_store_va",
  "isaac_game_state_9d8190_checksum_xor_va",
  "isaac_game_state_9d8190_seed_log_str_va",
  "isaac_game_state_9d8190_checksum_xor",
  "isaac_game_state_9d8190_checksum_off",
  "isaac_game_state_9d8660_va",
  "isaac_game_state_9d8660_end_va",
  "isaac_game_state_9d8660_body_bytes",
  "isaac_game_state_9d8660_next_va",
  "isaac_game_state_9d8660_stride",
  "isaac_game_state_9d8660_max_count",
  "isaac_game_state_9d8660_count_0xc_va",
  "isaac_game_state_9d8660_count_max_gate_va",
  "isaac_game_state_9d8660_grow_max_cmov_va",
  "isaac_game_state_9d8660_grow_target_ok_va",
  "isaac_game_state_9d8660_copy_more_va",
  "isaac_game_state_9d8660_caller_count",
  "isaac_game_state_9d8660_caller_va_at",
  "isaac_game_state_9d8820_va",
  "isaac_game_state_9d8820_end_va",
  "isaac_game_state_9d8820_body_bytes",
  "isaac_game_state_9d8820_next_va",
  "isaac_game_state_9d8820_stride",
  "isaac_game_state_9d8820_slot_dwords",
  "isaac_game_state_9d8820_count_gate_va",
  "isaac_game_state_9d8820_loop_more_va",
  "isaac_game_state_9d8820_caller_count",
  "isaac_game_state_9d8820_caller_va_at",
  "isaac_game_state_9d8a20_va",
  "isaac_game_state_9d8a20_end_va",
  "isaac_game_state_9d8a20_body_bytes",
  "isaac_game_state_9d8a20_next_va",
  "isaac_game_state_9d8a20_stride",
  "isaac_game_state_9d8a20_max_count",
  "isaac_game_state_9d8a20_count_0x34_va",
  "isaac_game_state_9d8a20_count_le_cap_va",
  "isaac_game_state_9d8a20_grow_target_ok_va",
  "isaac_game_state_9d8a20_caller_count",
  "isaac_game_state_9d8a20_caller_va_at",
  // ABI v13: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 (laws + accessors)
  "isaac_game_state_9d88a0_count_le_cap",
  "isaac_game_state_9d88a0_element_count_8",
  "isaac_game_state_9d88a0_growth_ok",
  "isaac_game_state_9d88a0_grow_target_count",
  "isaac_game_state_9d88a0_grow_target_ok",
  "isaac_game_state_9d88a0_tail_fill_needed",
  "isaac_game_state_9d8960_count_le_cap",
  "isaac_game_state_9d8960_element_count_16",
  "isaac_game_state_9d8960_growth_ok",
  "isaac_game_state_9d8960_grow_target_count",
  "isaac_game_state_9d8960_grow_target_ok",
  "isaac_game_state_9d8960_tail_fill_needed",
  "isaac_game_state_9d8af0_count_le_cap",
  "isaac_game_state_9d8af0_element_count_8",
  "isaac_game_state_9d8af0_growth_ok",
  "isaac_game_state_9d8af0_grow_target_count",
  "isaac_game_state_9d8af0_grow_target_ok",
  "isaac_game_state_9d8af0_tail_init_needed",
  "isaac_game_state_9d8af0_tail_init_more",
  "isaac_game_state_9d8af0_copy_needed",
  "isaac_game_state_9d8af0_copy_more",
  "isaac_game_state_9d88a0_va",
  "isaac_game_state_9d88a0_end_va",
  "isaac_game_state_9d88a0_body_bytes",
  "isaac_game_state_9d88a0_next_va",
  "isaac_game_state_9d88a0_stride",
  "isaac_game_state_9d88a0_max_count",
  "isaac_game_state_9d88a0_count_le_cap_va",
  "isaac_game_state_9d88a0_count_va",
  "isaac_game_state_9d88a0_growth_ok_va",
  "isaac_game_state_9d88a0_grow_target_count_va",
  "isaac_game_state_9d88a0_grow_target_ok_va",
  "isaac_game_state_9d88a0_tail_fill_needed_va",
  "isaac_game_state_9d88a0_caller_count",
  "isaac_game_state_9d88a0_caller_va_at",
  "isaac_game_state_9d8960_va",
  "isaac_game_state_9d8960_end_va",
  "isaac_game_state_9d8960_body_bytes",
  "isaac_game_state_9d8960_next_va",
  "isaac_game_state_9d8960_stride",
  "isaac_game_state_9d8960_max_count",
  "isaac_game_state_9d8960_count_le_cap_va",
  "isaac_game_state_9d8960_count_va",
  "isaac_game_state_9d8960_growth_ok_va",
  "isaac_game_state_9d8960_grow_target_count_va",
  "isaac_game_state_9d8960_grow_target_ok_va",
  "isaac_game_state_9d8960_tail_fill_needed_va",
  "isaac_game_state_9d8960_caller_count",
  "isaac_game_state_9d8960_caller_va_at",
  "isaac_game_state_9d8af0_va",
  "isaac_game_state_9d8af0_end_va",
  "isaac_game_state_9d8af0_body_bytes",
  "isaac_game_state_9d8af0_next_va",
  "isaac_game_state_9d8af0_stride",
  "isaac_game_state_9d8af0_max_count",
  "isaac_game_state_9d8af0_count_le_cap_va",
  "isaac_game_state_9d8af0_count_va",
  "isaac_game_state_9d8af0_growth_ok_va",
  "isaac_game_state_9d8af0_grow_target_count_va",
  "isaac_game_state_9d8af0_grow_target_ok_va",
  "isaac_game_state_9d8af0_tail_init_needed_va",
  "isaac_game_state_9d8af0_tail_init_more_va",
  "isaac_game_state_9d8af0_copy_needed_va",
  "isaac_game_state_9d8af0_copy_more_va",
  "isaac_game_state_9d8af0_caller_count",
  "isaac_game_state_9d8af0_caller_va_at",
  // ABI v14: 0x9d8be0 can-save mode
  "isaac_game_state_9d8be0_byte_2c9_nz",
  "isaac_game_state_9d8be0_mode_eq_2",
  "isaac_game_state_9d8be0_game_nonzero",
  "isaac_game_state_9d8be0_dword_26630_busy",
  "isaac_game_state_9d8be0_byte_26589_nz",
  "isaac_game_state_9d8be0_byte_19f_nz",
  "isaac_game_state_9d8be0_dword_a80_busy",
  "isaac_game_state_9d8be0_dword_f18_positive",
  "isaac_game_state_9d8be0_byte_2c7_nz",
  "isaac_game_state_9d8be0_can_save_mode",
  "isaac_game_state_9d8be0_va",
  "isaac_game_state_9d8be0_end_va",
  "isaac_game_state_9d8be0_body_bytes",
  "isaac_game_state_9d8be0_next_va",
  "isaac_game_state_9d8be0_insn_count",
  "isaac_game_state_9d8be0_caller_count",
  "isaac_game_state_9d8be0_caller_va_at",
  "isaac_game_state_9d8be0_mgr_global",
  "isaac_game_state_9d8be0_game_global",
  "isaac_game_state_9d8be0_off_2c9",
  "isaac_game_state_9d8be0_off_f18",
  "isaac_game_state_9d8be0_byte_2c9_va",
  "isaac_game_state_9d8be0_dword_f18_va",
  // ABI v15: 0x9d8ca0 flag scan
  "isaac_game_state_9d8ca0_outer_done",
  "isaac_game_state_9d8ca0_edx_ge_end",
  "isaac_game_state_9d8ca0_edx_is_null",
  "isaac_game_state_9d8ca0_skip_cell_load",
  "isaac_game_state_9d8ca0_inner_more",
  "isaac_game_state_9d8ca0_table_index",
  "isaac_game_state_9d8ca0_flag_ok",
  "isaac_game_state_9d8ca0_row_next",
  "isaac_game_state_9d8ca0_cell_ecx",
  "isaac_game_state_9d8ca0_byte_off",
  "isaac_game_state_9d8ca0_after_row",
  "isaac_game_state_9d8ca0_va",
  "isaac_game_state_9d8ca0_end_va",
  "isaac_game_state_9d8ca0_body_bytes",
  "isaac_game_state_9d8ca0_next_va",
  "isaac_game_state_9d8ca0_insn_count",
  "isaac_game_state_9d8ca0_caller_count",
  "isaac_game_state_9d8ca0_caller_va_at",
  "isaac_game_state_9d8ca0_row_end",
  "isaac_game_state_9d8ca0_flag_mask",
  "isaac_game_state_9cf050_va",
  "isaac_game_state_9cf050_end_va",
  "isaac_game_state_9cf050_body_bytes",
  "isaac_game_state_9cf050_next_va",
  "isaac_game_state_9cf050_caller_count",
  "isaac_game_state_9cf050_caller_va_at",
  "isaac_game_state_9cff40_va",
  "isaac_game_state_9cff40_end_va",
  "isaac_game_state_9cff40_body_bytes",
  "isaac_game_state_9cff40_next_va",
  "isaac_game_state_9cff40_io8_gate_0x92_va",
  "isaac_game_state_9cff40_caller_count",
  "isaac_game_state_9cff40_caller_va_at",
  "isaac_game_state_9d0100_va",
  "isaac_game_state_9d0100_end_va",
  "isaac_game_state_9d0100_body_bytes",
  "isaac_game_state_9d0100_next_va",
  "isaac_game_state_9d0100_caller_count",
  "isaac_game_state_9d0100_caller_va_at",
  "isaac_game_state_9d02c0_va",
  "isaac_game_state_9d02c0_end_va",
  "isaac_game_state_9d02c0_body_bytes",
  "isaac_game_state_9d02c0_next_va",
  "isaac_game_state_9d02c0_caller_count",
  "isaac_game_state_9d02c0_caller_va_at",
  "isaac_game_state_9d0440_va",
  "isaac_game_state_9d0440_end_va",
  "isaac_game_state_9d0440_body_bytes",
  "isaac_game_state_9d0440_next_va",
  "isaac_game_state_9d0440_byte_c_gate_va",
  "isaac_game_state_9d0440_byte_d_gate_va",
  "isaac_game_state_9d0440_caller_count",
  "isaac_game_state_9d0440_caller_va_at",
  "isaac_game_state_9d71b0_va",
  "isaac_game_state_9d71b0_end_va",
  "isaac_game_state_9d71b0_body_bytes",
  "isaac_game_state_9d71b0_next_va",
  "isaac_game_state_9d71b0_gs_cookie_dat",
  "isaac_game_state_9d71b0_caller_count",
  "isaac_game_state_9d71b0_caller_va_at",
  "isaac_game_state_9d8190_va",
  "isaac_game_state_9d8190_end_va",
  "isaac_game_state_9d8190_body_bytes",
  "isaac_game_state_9d8190_next_va",
  "isaac_game_state_9d8190_caller_count",
  "isaac_game_state_9d8190_caller_va_at",
  "isaac_game_state_9d83f0_va",
  "isaac_game_state_9d83f0_end_va",
  "isaac_game_state_9d83f0_body_bytes",
  "isaac_game_state_9d83f0_next_va",
  "isaac_game_state_9d83f0_caller_count",
  "isaac_game_state_9d83f0_caller_va_at",
  "isaac_game_state_9d8470_va",
  "isaac_game_state_9d8470_end_va",
  "isaac_game_state_9d8470_body_bytes",
  "isaac_game_state_9d8470_next_va",
  "isaac_game_state_9d8470_caller_count",
  "isaac_game_state_9d8470_caller_va_at",
  "isaac_game_state_9d45c0_flags_pack_va",
  "isaac_game_state_9d45c0_count_sar3_va",
  "isaac_game_state_9d45c0_count_nonzero_va",
  "isaac_game_state_9d45c0_idx_lt_count_va",
  "isaac_game_state_9d45c0_count_22c_positive_va",
  "isaac_game_state_9d45c0_idx_lt_count_22c_va",
  "isaac_game_state_9d45c0_element_count_78_va",
  "isaac_game_state_9d45c0_byte_count_36_va",
  "isaac_game_state_9d45c0_byte_idx_lt_byte_count_va",
  "isaac_game_state_9d45c0_byte_count_nonzero_va",
  "isaac_game_state_9d45c0_byte_398_nonzero_va",
  "isaac_game_state_9d45c0_word_idx_lt_count_va",
  "isaac_game_state_9d45c0_idx_lt_8_va",
  "isaac_game_state_9d45c0_idx_lt_6_va",
  "isaac_game_state_9d45c0_idx_lt_byte_count_u32_va",
  "isaac_game_state_9d45c0_element_count_34_va",
  "isaac_game_state_9d45c0_byte_ne_ff_va",
  "isaac_game_state_9d45c0_walk_continue_3c0_va",
  "isaac_game_state_9d45c0_element_byte_nonzero_va",
  "isaac_game_state_9d45c0_value_nonneg_va",
  "isaac_game_state_9d45c0_scan_value_nonneg_va",
  "isaac_game_state_9d45c0_scan_remaining_nonneg_va",
  "isaac_game_state_9d45c0_walk_continue_5d4_va",
  "isaac_game_state_9d71b0_io8_ge_0xa2_va",
  "isaac_game_state_9d71b0_io8_ge_0x9f_va",
  "isaac_game_state_9d71b0_io8_ge_0xa3_va",
  "isaac_game_state_9d71b0_count_pos_signed_va",
  "isaac_game_state_9d71b0_idx_lt_count_signed_va",
  "isaac_game_state_9d71b0_byte_nonzero_setne_va",
  "isaac_game_state_9d71b0_vec_slot_full_va",
  "isaac_game_state_9d71b0_count_nonzero_va",
  "isaac_game_state_9d71b0_idx_lt_count_va",
  // ABI v16: 0x9dc6e0 zero-init ctor
  "isaac_game_state_9dc6e0_zero_dwords",
  "isaac_game_state_9dc6e0_magic_stamp",
  "isaac_game_state_9dc6e0_return_this",
  "isaac_game_state_9dc6e0_va",
  "isaac_game_state_9dc6e0_end_va",
  "isaac_game_state_9dc6e0_body_bytes",
  "isaac_game_state_9dc6e0_next_va",
  "isaac_game_state_9dc6e0_insn_count",
  "isaac_game_state_9dc6e0_new_va",
  "isaac_game_state_9dc6e0_obj_size",
  "isaac_game_state_9dc6e0_magic",
  "isaac_game_state_9dc6e0_magic_off",
  "isaac_game_state_9dc6e0_store_count",
  "isaac_game_state_9dc6e0_zero_count",
  "isaac_game_state_9dc6e0_caller_count",
  "isaac_game_state_9dc6e0_caller_va_at",
  // ABI v17: 0x9e0150 complement-index vector fetch
  "isaac_game_state_9e0150_not_nonneg",
  "isaac_game_state_9e0150_idx_lt_count",
  "isaac_game_state_9e0150_fetch",
  "isaac_game_state_9e0150_va",
  "isaac_game_state_9e0150_end_va",
  "isaac_game_state_9e0150_body_bytes",
  "isaac_game_state_9e0150_next_va",
  "isaac_game_state_9e0150_insn_count",
  "isaac_game_state_9e0150_not_va",
  "isaac_game_state_9e0150_js_gate_va",
  "isaac_game_state_9e0150_sub_va",
  "isaac_game_state_9e0150_sar_va",
  "isaac_game_state_9e0150_cmp_va",
  "isaac_game_state_9e0150_jge_gate_va",
  "isaac_game_state_9e0150_inner_load_va",
  "isaac_game_state_9e0150_outer_load_va",
  "isaac_game_state_9e0150_ret_ok_va",
  "isaac_game_state_9e0150_ret_null_va",
  "isaac_game_state_9e0150_caller_count",
  "isaac_game_state_9e0150_caller_va_at",
  // ABI v18: 0x9e0180 complement-index element fetch (P twin of O)
  "isaac_game_state_9e0180_not_nonneg",
  "isaac_game_state_9e0180_idx_lt_count",
  "isaac_game_state_9e0180_elem_fetch",
  "isaac_game_state_9e0180_va",
  "isaac_game_state_9e0180_end_va",
  "isaac_game_state_9e0180_body_bytes",
  "isaac_game_state_9e0180_next_va",
  "isaac_game_state_9e0180_insn_count",
  "isaac_game_state_9e0180_not_va",
  "isaac_game_state_9e0180_js_gate_va",
  "isaac_game_state_9e0180_sub_va",
  "isaac_game_state_9e0180_sar_va",
  "isaac_game_state_9e0180_cmp_va",
  "isaac_game_state_9e0180_jge_gate_va",
  "isaac_game_state_9e0180_elem_load_va",
  "isaac_game_state_9e0180_ret_ok_va",
  "isaac_game_state_9e0180_ret_null_va",
  "isaac_game_state_9e0180_caller_count",
  "isaac_game_state_9e0180_caller_va_at",
  "isaac_game_state_9e0180_game_vec_off",
  // ABI v19: 0x9e0650 forward-index BYTE getter
  "isaac_game_state_9e0650_forward_index_guard",
  "isaac_game_state_9e0650_byte_span_size",
  "isaac_game_state_9e0650_bounds_check",
  "isaac_game_state_9e0650_byte_getter",
  "isaac_game_state_9e0650_va",
  "isaac_game_state_9e0650_end_va",
  "isaac_game_state_9e0650_body_bytes",
  "isaac_game_state_9e0650_next_va",
  "isaac_game_state_9e0650_insn_count",
  "isaac_game_state_9e0650_js_gate_va",
  "isaac_game_state_9e0650_end_load_va",
  "isaac_game_state_9e0650_begin_load_va",
  "isaac_game_state_9e0650_sub_va",
  "isaac_game_state_9e0650_cmp_va",
  "isaac_game_state_9e0650_jge_gate_va",
  "isaac_game_state_9e0650_byte_load_va",
  "isaac_game_state_9e0650_ret_ok_va",
  "isaac_game_state_9e0650_zero_path_va",
  "isaac_game_state_9e0650_ret_zero_va",
  "isaac_game_state_9e0650_caller_count",
  "isaac_game_state_9e0650_caller_va_at",
  // ABI v20: 0x9e3450 grid-adjacency door-direction checker
  "isaac_game_state_9e3450_door_dir",
  "isaac_game_state_9e3450_va",
  "isaac_game_state_9e3450_end_va",
  "isaac_game_state_9e3450_body_bytes",
  "isaac_game_state_9e3450_next_va",
  "isaac_game_state_9e3450_insn_count",
  "isaac_game_state_9e3450_width_load_va",
  "isaac_game_state_9e3450_manhattan_jne_va",
  "isaac_game_state_9e3450_bound_cmp_va",
  "isaac_game_state_9e3450_bound_ja_va",
  "isaac_game_state_9e3450_cell_read_va",
  "isaac_game_state_9e3450_sentinel_je_va",
  "isaac_game_state_9e3450_type_mask_va",
  "isaac_game_state_9e3450_count_load_va",
  "isaac_game_state_9e3450_count_jle_va",
  "isaac_game_state_9e3450_entry_lea_va",
  "isaac_game_state_9e3450_cmp_drow_va",
  "isaac_game_state_9e3450_cmp_dcol_va",
  "isaac_game_state_9e3450_ret_fail_va",
  "isaac_game_state_9e3450_ret_hit_va",
  "isaac_game_state_9e3450_grid_bound",
  "isaac_game_state_9e3450_width_inner_off",
  "isaac_game_state_9e3450_cell_table_off",
  "isaac_game_state_9e3450_sentinel",
  "isaac_game_state_9e3450_type_mask",
  "isaac_game_state_9e3450_door_table_va",
  "isaac_game_state_9e3450_type_row_stride",
  "isaac_game_state_9e3450_entry_stride",
  "isaac_game_state_9e3450_flt_neg_va",
  "isaac_game_state_9e3450_flt_pos_va",
  "isaac_game_state_9e3450_caller_count",
  "isaac_game_state_9e3450_caller_va_at",
  "isaac_game_state_pure_helpers_abi_version",
];

function buildWasm() {
  mkdirSync(outDir, { recursive: true });
  const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
  const clang = firstExisting(
    [
      process.env.CLANGXX,
      join(emsdk, "upstream", "bin", "clang++.exe"),
      join(emsdk, "upstream", "bin", "clang++"),
    ],
  );
  const emxx = firstExisting(
    [
      process.env.EMXX,
      join(emsdk, "upstream", "emscripten", "em++.exe"),
      join(emsdk, "upstream", "emscripten", "em++"),
    ],
    "Emscripten em++",
  );
  const syntax = spawnSync(
    clang,
    [source, "-std=c++20", "-I", join(root, "native", "decomp"), "-fsyntax-only", "-Wall", "-Wextra", "-Werror"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  // Export flags go through an em++ response file: with 600+ exports the
  // flat -Wl,--export=... argv exceeds the Windows 32K CreateProcess
  // command-line limit (ENAMETOOLONG), so keep the argv short and let
  // emcc/clang expand the @-file (one flag per line, no quoting needed).
  const flagsFile = join(outDir, `export-flags-${process.pid}.rsp`); /* pid-unique: concurrent suites must not share one rsp */
  writeFileSync(
    flagsFile,
    EXPORTS.map((name) => `-Wl,--export=${name}`).join("\n") + "\n",
    "utf8",
  );
  const built = spawnSync(
    emxx,
    [
      source,
      "-std=c++20",
      "-O2",
      "-I", join(root, "native", "decomp"),
      "--no-entry",
      "-sSTANDALONE_WASM=1",
      "-sERROR_ON_UNDEFINED_SYMBOLS=1",
      `@${flagsFile}`,
      "-o", wasmPath,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(WebAssembly.Module.imports(module).length, 0, "game-state pure helpers must be zero-import");
  const instance = new WebAssembly.Instance(module, {});
  const wasm = instance.exports;
  const exp = (name) => {
    const fn = wasm[name] ?? wasm[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    return fn;
  };
  const out = { memory: wasm.memory };
  for (const name of EXPORTS) {
    const key = name.replace(/^isaac_game_state_/, "").replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    out[key] = exp(name);
  }
  return out;
}

/* deterministic PRNG for differential draws */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0x9c8350);

function randU32() {
  return Math.floor(rng() * 0x100000000) >>> 0;
}

/* PE byte-truth helpers (section table: .text raw 0x400, vaddr 0x401000) */
function peBytes() {
  return readFileSync(join(root, "tools", "isaac-ng.unpacked.exe"));
}
function peAt(va, len) {
  const off = 0x400 + (va - 0x401000);
  return peBytes().subarray(off, off + len);
}

test("header declares game-state pure helpers ABI v6 and tracked pins", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_PURE_HELPERS_ABI_VERSION = 20/);
  assert.match(h, /isaac_game_state_9c8350_steam_present\(/);
  assert.match(h, /isaac_game_state_9c8350_cloud_gate_ok\(/);
  assert.match(h, /isaac_game_state_9c8350_use_steam_arm\(/);
  assert.match(h, /isaac_game_state_9c8350_statname_heap_used\(/);
  assert.match(h, /isaac_game_state_9c8350_statname_ptr\(/);
  assert.match(h, /isaac_game_state_9c8350_steam_arm_continue\(/);
  assert.match(h, /isaac_game_state_9c8350_filename_present\(/);
  assert.match(h, /isaac_game_state_9c8350_filename_ptr\(/);
  // ABI v2: DeleteRerun laws + write typed-host lease
  assert.match(h, /isaac_game_state_9c8410_steam_present\(/);
  assert.match(h, /isaac_game_state_9c8410_cloud_gate_ok\(/);
  assert.match(h, /isaac_game_state_9c8410_use_steam_arm\(/);
  assert.match(h, /isaac_game_state_9c8410_statname_heap_used\(/);
  assert.match(h, /isaac_game_state_9c8410_statname_ptr\(/);
  assert.match(h, /isaac_game_state_9c8410_steam_arm_continue\(/);
  assert.match(h, /isaac_game_state_9c8410_filename_present\(/);
  assert.match(h, /isaac_game_state_9c8410_filename_ptr\(/);
  assert.match(h, /ISAAC_GAME_STATE_9C8410_STATNAME_SIZE_OFF = 0x1fe20/);
  assert.match(h, /ISAAC_GAME_STATE_9C8410_STATNAME_BUF_OFF = 0x1fe0c/);
  assert.match(h, /ISAAC_GAME_STATE_9C8410_FILENAME_SIZE_OFF = 0x1fdd8/);
  assert.match(h, /ISAAC_GAME_STATE_9C8410_FILENAME_BUF_OFF = 0x1fdc4/);
  assert.match(h, /ISAAC_GAME_STATE_9C8410_FILENAME_EMPTY_SIZE_OFF = 0x1fdbc/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_END_VA = 0x009cad3b/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_GAME_STATE_IO_OFF = 0x1fe24/);
  // ABI v3: serializer tree leaf laws + constants
  assert.match(h, /isaac_game_state_9c84c0_lane_count\(/);
  assert.match(h, /isaac_game_state_9c84c0_clear_needed\(/);
  assert.match(h, /isaac_game_state_9c84c0_lane_flush\(/);
  assert.match(h, /isaac_game_state_9c84c0_lane_bit_set\(/);
  assert.match(h, /isaac_game_state_9c85d0_flush_every8\(/);
  assert.match(h, /isaac_game_state_9c85d0_flush_remainder\(/);
  assert.match(h, /isaac_game_state_9c85d0_source_bit\(/);
  assert.match(h, /isaac_game_state_9c86e0_sentinel_layout\(/);
  assert.match(h, /isaac_game_state_9c87e0_sentinel_layout\(/);
  assert.match(h, /isaac_game_state_9c88e0_flags\(/);
  assert.match(h, /isaac_game_state_9c88e0_blob_present\(/);
  assert.match(h, /isaac_game_state_9c88e0_child_present\(/);
  assert.match(h, /isaac_game_state_9c88e0_returns_true\(/);
  assert.match(h, /isaac_game_state_9c8d20_slot_present\(/);
  assert.match(h, /isaac_game_state_9c8d20_table_more\(/);
  assert.match(h, /isaac_game_state_9c8d20_element_count\(/);
  assert.match(h, /isaac_game_state_9c8d20_count_nonzero\(/);
  assert.match(h, /isaac_game_state_9c8d20_walk_continue\(/);
  assert.match(h, /ISAAC_GAME_STATE_TRIPLE_SENTINEL = 0x80000000/);
  assert.match(h, /ISAAC_GAME_STATE_9C8D20_TABLE_BYTES = 0x3800/);
  assert.match(h, /ISAAC_GAME_STATE_9C8D20_ELEMENT_STRIDE = 0x78/);
  assert.match(h, /ISAAC_GAME_STATE_9C88E0_BLOB_SIZE = 0x20/);
  assert.match(h, /ISAAC_GAME_STATE_9C8350_FILENAME_SIZE_OFF = 0x1fdbc/);
  assert.match(h, /ISAAC_GAME_STATE_9C8350_CLOUD_OFF = 0x2a3a4/);
  // ABI v4: save-orchestrator host A/B laws + read_rerun lease + cluster spans
  assert.match(h, /isaac_game_state_9cad40_pool_select\(/);
  assert.match(h, /isaac_game_state_9cad40_name_gate_ok\(/);
  assert.match(h, /isaac_game_state_9cad40_open_gate_ok\(/);
  assert.match(h, /isaac_game_state_9caea0_rerun_gate_ok\(/);
  assert.match(h, /isaac_game_state_9caea0_rerun_success\(/);
  assert.match(h, /isaac_game_state_9cad40_io_dtor_needed\(/);
  assert.match(h, /ISAAC_GAME_STATE_9CAD40_VA = 0x009cad40/);
  assert.match(h, /ISAAC_GAME_STATE_9CAEA0_VA = 0x009caea0/);
  assert.match(h, /ISAAC_GAME_STATE_9D7D50_VA = 0x009d7d50/);
  assert.match(h, /ISAAC_GAME_STATE_9D7D50_RERUN_SUCCESS_BYTE_OFF = 0x1fded/);
  assert.match(h, /ISAAC_GAME_STATE_IO_VTABLE = 0x00b65724/);
  assert.match(h, /ISAAC_GAME_STATE_IO_POOL_GLOBAL_DAT = 0x00c7de78/);
  assert.match(h, /ISAAC_GAME_STATE_IO_POOL_FALLBACK = 0x00c7f618/);
  assert.match(h, /ISAAC_GAME_STATE_WRITE_RECORD_SEED = 0xfedcba76/);
  assert.match(h, /ISAAC_GAME_STATE_9D84D0_BODY_BYTES = 0x79/);
  // ABI v5: write-span loop/decision laws + 0x683930
  assert.match(h, /isaac_game_state_9c8d20_element_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9340_hash_count_nonzero\(/);
  assert.match(h, /isaac_game_state_9c9340_hash_probe_slot\(/);
  assert.match(h, /isaac_game_state_9c9340_hash_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9340_value_count_nonzero\(/);
  assert.match(h, /isaac_game_state_9c9340_value_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9340_reorder_entry_negative\(/);
  assert.match(h, /isaac_game_state_9c9340_reorder_pending_flush\(/);
  assert.match(h, /isaac_game_state_9c9340_reorder_run_word\(/);
  assert.match(h, /isaac_game_state_9c9340_reorder_final_flush\(/);
  assert.match(h, /isaac_game_state_9c9340_div0xc_count\(/);
  assert.match(h, /isaac_game_state_9c9340_div0xc_resize_needed\(/);
  assert.match(h, /isaac_game_state_9c9340_div0xc_count_byte\(/);
  assert.match(h, /isaac_game_state_9c9340_div0xc_loop_needed\(/);
  assert.match(h, /isaac_game_state_9c9340_div0xc_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_count\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9340_byte_count_needed\(/);
  assert.match(h, /isaac_game_state_9c9340_byte_count_more\(/);
  assert.match(h, /isaac_game_state_9c9340_finalize_needed\(/);
  assert.match(h, /isaac_game_state_9c9340_finalize_pad_bytes\(/);
  assert.match(h, /isaac_game_state_9c9340_finalize_ror_add\(/);
  assert.match(h, /isaac_game_state_9c9340_checksum_stream_word\(/);
  assert.match(h, /isaac_game_state_683930_name_gate_ok\(/);
  assert.match(h, /ISAAC_GAME_STATE_9C8D20_ELEMENT_LOOP_MORE_VA = 0x009c9157/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_DIV0XC_MAGIC = 0x2aaaaaab/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_REORDER_ENTRIES = 0x1fb/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_CHECKSUM_XOR = 0x96696996/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_CHECKSUM_OFF = 0x1fda4/);
  assert.match(h, /ISAAC_GAME_STATE_683930_VA = 0x00683930/);
  assert.match(h, /ISAAC_GAME_STATE_683930_STEAM_GATE_VA = 0x0068394a/);
  assert.match(h, /ISAAC_GAME_STATE_683930_CALLER_VA_0 = 0x00928f7b/);
  // ABI v6: reader row 0x9cb020 + fixed-count loops
  assert.match(h, /isaac_game_state_9cb020_gate_0x3b\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x46\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x47\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x5b\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x67\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x6c\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x88\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x96\(/);
  assert.match(h, /isaac_game_state_9cb020_gate_0x9e\(/);
  assert.match(h, /isaac_game_state_9cb020_old_u64_gate\(/);
  assert.match(h, /isaac_game_state_9cb020_sub_0x64_present\(/);
  assert.match(h, /isaac_game_state_9cb020_sub_0x6c_present\(/);
  assert.match(h, /isaac_game_state_9cb020_old_byte_to_bool\(/);
  assert.match(h, /isaac_game_state_9cb020_old_u64_type_4\(/);
  assert.match(h, /isaac_game_state_9c9c30_fixed_count\(/);
  assert.match(h, /isaac_game_state_9c9c30_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9d66_fixed_count\(/);
  assert.match(h, /isaac_game_state_9c9d66_loop_more\(/);
  assert.match(h, /ISAAC_GAME_STATE_9CB020_VA = 0x009cb020/);
  assert.match(h, /ISAAC_GAME_STATE_9CB020_END_VA = 0x009cb619/);
  assert.match(h, /ISAAC_GAME_STATE_9CB020_FORMAT_OFF = 0x8/);
  assert.match(h, /ISAAC_GAME_STATE_9CB020_GATE_0X88_VA = 0x009cb1cb/);
  assert.match(h, /ISAAC_GAME_STATE_9CB020_OLD_COMPAT_TYPE = 0x4/);
  assert.match(h, /ISAAC_GAME_STATE_9C9C30_FIXED_COUNT = 0xe/);
  assert.match(h, /ISAAC_GAME_STATE_9C9D66_FIXED_COUNT = 0x14/);
  assert.match(h, /ISAAC_GAME_STATE_9C9D66_VALUE_BASE_OFF = 0x16e08/);
  // ABI v7: reorder-table loop bound + value word + 7-lane per-lane geometry
  assert.match(h, /isaac_game_state_9c9340_reorder_loop_more\(/);
  assert.match(h, /isaac_game_state_9c9340_reorder_value_word\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_lane_base\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_value1_ptr\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_holder1_ptr\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_value2_ptr\(/);
  assert.match(h, /isaac_game_state_9c9340_lane7_holder2_ptr\(/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_REORDER_LOOP_MORE_VA = 0x009c9dfe/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_REORDER_VALUE_WORD_VA = 0x009c9dc2/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_LANE7_LANE_BASE_VA = 0x009caa97/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_LANE7_ELEM1_VALUE_OFF = 0xfffffce4/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_LANE7_ELEM2_HOLDER_OFF = 0xffffffdc/);
  assert.match(h, /ISAAC_GAME_STATE_9C9340_LANE7_STRIDE_ADD_VA = 0x009cac1c/);
  // ABI v8: pill reader 0x9cb620 laws V1..V20
  assert.match(h, /isaac_game_state_9cb620_io_ready\(/);
  assert.match(h, /isaac_game_state_9cb620_io_gate_0x3d\(/);
  assert.match(h, /isaac_game_state_9cb620_io_gate_0x4b\(/);
  assert.match(h, /isaac_game_state_9cb620_io_gate_0x7b\(/);
  assert.match(h, /isaac_game_state_9cb620_io_gate_0x7d\(/);
  assert.match(h, /isaac_game_state_9cb620_gs_gate_0x21\(/);
  assert.match(h, /isaac_game_state_9cb620_gs_gate_0x3f\(/);
  assert.match(h, /isaac_game_state_9cb620_gs_gate_0x49\(/);
  assert.match(h, /isaac_game_state_9cb620_gs_gate_0x82\(/);
  assert.match(h, /isaac_game_state_9cb620_slot_count_needed\(/);
  assert.match(h, /isaac_game_state_9cb620_string_copy_needed\(/);
  assert.match(h, /isaac_game_state_9cb620_slot_positive\(/);
  assert.match(h, /isaac_game_state_9cb620_slot_more\(/);
  assert.match(h, /isaac_game_state_9cb620_array74_needed\(/);
  assert.match(h, /isaac_game_state_9cb620_array74_more\(/);
  assert.match(h, /isaac_game_state_9cb620_array88_needed\(/);
  assert.match(h, /isaac_game_state_9cb620_array88_more\(/);
  assert.match(h, /isaac_game_state_9cb620_fixed8_count\(/);
  assert.match(h, /isaac_game_state_9cb620_fixed8_more\(/);
  assert.match(h, /isaac_game_state_9cb620_flag_byte_set\(/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_VA = 0x009cb620/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_END_VA = 0x009cc18e/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_BODY_BYTES = 0xa6e/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_NEXT_VA = 0x009cc1a0/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_IO_FORMAT_OFF = 0x8/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_GS_FORMAT_OFF = 0x1fdf0/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_IO_VTBL10_SLOT = 0x10/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_FLAGS_OFF = 0x44/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_TABLE_BYTES = 0x3800/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_TABLE_SLOTS = 0x1c0/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_ARRAY_STRIDE = 0x78/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_FIXED8_COUNT = 0x8/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_IO_READY_GATE_VA = 0x009cb65d/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_IO_GATE_0X3D_VA = 0x009cba1b/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_GS_GATE_0X21_VA = 0x009cbd86/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_SLOT_COUNT_GATE_VA = 0x009cbbb1/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_SLOT_POSITIVE_VA = 0x009cbc57/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_SLOT_MORE_VA = 0x009cbdc0/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_ARRAY74_MORE_VA = 0x009cbe50/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_ARRAY88_MORE_VA = 0x009cbf93/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_FLAG_GATE_VA = 0x009cb93b/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_CALLER_VA_0 = 0x009ccf75/);
  assert.match(h, /ISAAC_GAME_STATE_9CB620_CALLER_VA_3 = 0x009ce3ce/);
  // ABI v9: giant read entry 0x9cc1a0 laws + constants
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x2b\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x2e\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x2f\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x30\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x33\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x34\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x40\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x42\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x43\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x44\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x47\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x48\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x50\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x53\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x54\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x57\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x59\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x85\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x86\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x87\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x89\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x8a\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x8d\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x93\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x95\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x98\(/);
  assert.match(h, /isaac_game_state_9cc1a0_gs_gate_0x9b\(/);
  assert.match(h, /isaac_game_state_9cc1a0_io_gate_0x56\(/);
  assert.match(h, /isaac_game_state_9cc1a0_io_gate_0x7c\(/);
  assert.match(h, /isaac_game_state_9cc1a0_io_gate_0xa5\(/);
  assert.match(h, /isaac_game_state_9cc1a0_dispatch_count\(/);
  assert.match(h, /isaac_game_state_9cc1a0_dispatch_second_pass_needed\(/);
  assert.match(h, /isaac_game_state_9cc1a0_t164_count\(/);
  assert.match(h, /isaac_game_state_9cc1a0_count_1fb_below\(/);
  assert.match(h, /isaac_game_state_9cc1a0_table_19d1c_more\(/);
  assert.match(h, /isaac_game_state_9cc1a0_word_more\(/);
  assert.match(h, /isaac_game_state_9cc1a0_count8_more\(/);
  assert.match(h, /isaac_game_state_9cc1a0_signed_byte_count_positive\(/);
  assert.match(h, /isaac_game_state_9cc1a0_signed_idx_lt_movsx8\(/);
  assert.match(h, /isaac_game_state_9cc1a0_signed_idx_lt_count\(/);
  assert.match(h, /isaac_game_state_9cc1a0_signed_byte_lt\(/);
  assert.match(h, /isaac_game_state_9cc1a0_byte_zero_ok\(/);
  assert.match(h, /isaac_game_state_9cc1a0_tail_ready_ok\(/);
  assert.match(h, /isaac_game_state_9cc1a0_checksum_pass\(/);
  assert.match(h, /isaac_game_state_9cc1a0_checksum_matches\(/);
  assert.match(h, /isaac_game_state_9cc1a0_clamp_0x35\(/);
  assert.match(h, /isaac_game_state_9cc1a0_clamp_0x1a\(/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_VA = 0x009cc1a0/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_END_VA = 0x009ce597/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_BODY_BYTES = 0x23f7/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_NEXT_VA = 0x009ce5a0/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_SEH_HANDLER_DAT = 0x00b0f33b/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_GS_COOKIE_DAT = 0x00bf93b4/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_IO_FORMAT_STORE_VA = 0x009cc352/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_DELETE_CALL_VA = 0x009cc254/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_CHECKSUM_MAGIC = 0x96696996/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_LANE19C_BOUND = 0x1fb/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_TABLE19D1C_END = 0x19d1c/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_CALLER_VA_0 = 0x00918366/);
  assert.match(h, /ISAAC_GAME_STATE_9CC1A0_CALLER_VA_2 = 0x009ce677/);
  // ABI v10: body C 0x9ce720 + reader giant 0x9d05d0 laws + constants
  assert.match(h, /ISAAC_GAME_STATE_9CE720_VA = 0x009ce720/);
  assert.match(h, /ISAAC_GAME_STATE_9CE720_END_VA = 0x009cec74/);
  assert.match(h, /ISAAC_GAME_STATE_9D05D0_VA = 0x009d05d0/);
  assert.match(h, /ISAAC_GAME_STATE_9D05D0_END_VA = 0x009d45b7/);
  assert.match(h, /ISAAC_GAME_STATE_9D05D0_SEH_HANDLER_DAT = 0x00b0f39e/);
  assert.match(h, /ISAAC_GAME_STATE_9D05D0_GS_COOKIE_DAT = 0x00bf93b4/);
  assert.match(h, /ISAAC_GAME_STATE_9D05D0_BODY_BYTES = 0x3fe7/);
  assert.match(h, /isaac_game_state_9ce720_dispatch_count\(/);
  assert.match(h, /isaac_game_state_9ce720_count_fits\(/);
  assert.match(h, /isaac_game_state_9ce720_io_gate_0x4a\(/);
  assert.match(h, /isaac_game_state_9ce720_io_gate_0x37\(/);
  assert.match(h, /isaac_game_state_9ce720_default_count_0x1ff_0x2dd\(/);
  assert.match(h, /isaac_game_state_9ce720_default_count_0x78_0xbe\(/);
  assert.match(h, /isaac_game_state_9ce720_count_0xe_0xf\(/);
  assert.match(h, /isaac_game_state_9ce720_io_gate_0x4e\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x1e\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x1f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x20\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x23\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x27\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x28\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x29\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x2d\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x2f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x30\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x38\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x39\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x3a\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x3b\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x3e\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x40\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x41\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x43\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x45\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x4c\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x4d\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x4f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x50\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x51\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x52\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x55\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x58\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5a\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5b\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5c\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5d\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5e\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x60\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x61\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x62\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x63\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x64\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x65\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x67\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6a\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6c\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6e\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x72\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x73\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x74\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x75\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x76\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x78\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x79\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x7e\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x7f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x80\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x81\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x82\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x83\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8a\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8b\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8c\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8f\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x90\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x97\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x99\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x9c\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x9d\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa0\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa4\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa5\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa6\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa8\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa9\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x23_above\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x24_above\(/);
  assert.match(h, /isaac_game_state_9d05d0_lane_count_1_4\(/);
  assert.match(h, /isaac_game_state_9d05d0_lane_count_2_4\(/);
  assert.match(h, /isaac_game_state_9d05d0_count_0xf_0x10\(/);
  assert.match(h, /isaac_game_state_9d05d0_format_in_range\(/);
  assert.match(h, /isaac_game_state_9d05d0_count_cap_ok\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_le_vecsize\(/);
  assert.match(h, /isaac_game_state_9d05d0_slot_cap_lt_3\(/);
  assert.match(h, /isaac_game_state_9d05d0_clamp_0x14\(/);
  assert.match(h, /isaac_game_state_9d05d0_clamp_signed_0xa\(/);
  assert.match(h, /isaac_game_state_9d05d0_head_nonneg\(/);
  assert.match(h, /isaac_game_state_9d05d0_head_lt_vecsize\(/);
  assert.match(h, /isaac_game_state_9d05d0_signed_positive\(/);
  assert.match(h, /isaac_game_state_9d05d0_signed_idx_lt_vecsize\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize\(/);
  assert.match(h, /isaac_game_state_9d05d0_value_neg_override\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_nonzero\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_eq_1\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_ff_ok\(/);
  assert.match(h, /isaac_game_state_9d05d0_u32_count_needed\(/);
  assert.match(h, /isaac_game_state_9d05d0_ready_ok\(/);
  assert.match(h, /isaac_game_state_9d05d0_v2fd10_result_ok\(/);
  assert.match(h, /isaac_game_state_9d05d0_c7350_result_ok\(/);
  assert.match(h, /isaac_game_state_9d05d0_cff40_result_ok\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_idx_lt_byte\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_lt_2\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_lt_6\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_lt_8\(/);
  assert.match(h, /isaac_game_state_9d05d0_word_idx_lt_count\(/);
  assert.match(h, /isaac_game_state_9d05d0_uint_idx_lt_count\(/);
  assert.match(h, /isaac_game_state_9ce720_dispatch_count_va\(/);
  assert.match(h, /isaac_game_state_9ce720_count_fits_va\(/);
  assert.match(h, /isaac_game_state_9ce720_io_gate_0x4a_va\(/);
  assert.match(h, /isaac_game_state_9ce720_io_gate_0x37_va\(/);
  assert.match(h, /isaac_game_state_9ce720_default_count_0x1ff_0x2dd_va\(/);
  assert.match(h, /isaac_game_state_9ce720_default_count_0x78_0xbe_va\(/);
  assert.match(h, /isaac_game_state_9ce720_count_0xe_0xf_va\(/);
  assert.match(h, /isaac_game_state_9ce720_io_gate_0x4e_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x1e_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x1f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x20_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x23_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x27_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x28_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x29_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x2d_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x2f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x30_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x38_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x39_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x3a_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x3b_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x3e_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x40_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x41_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x43_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x45_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x4c_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x4d_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x4f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x50_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x51_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x52_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x55_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x58_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5a_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5b_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5c_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5d_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5e_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x5f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x60_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x61_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x62_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x63_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x64_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x65_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x67_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6a_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6c_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6e_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x6f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x72_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x73_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x74_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x75_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x76_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x78_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x79_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x7e_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x7f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x80_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x81_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x82_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x83_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8a_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8b_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8c_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x8f_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x90_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x97_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x99_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x9c_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x9d_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa0_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa4_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa5_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa6_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa8_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0xa9_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x23_above_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_io_gate_0x24_above_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_lane_count_1_4_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_lane_count_2_4_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_count_0xf_0x10_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_format_in_range_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_count_cap_ok_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_le_vecsize_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_slot_cap_lt_3_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_clamp_0x14_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_clamp_signed_0xa_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_head_nonneg_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_head_lt_vecsize_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_signed_positive_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_signed_idx_lt_vecsize_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_masked_7fff_lt_vecsize_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_value_neg_override_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_nonzero_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_eq_1_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_ff_ok_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_u32_count_needed_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_ready_ok_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_v2fd10_result_ok_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_c7350_result_ok_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_cff40_result_ok_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_byte_idx_lt_byte_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_lt_2_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_lt_6_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_idx_lt_8_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_word_idx_lt_count_va\(/);
  assert.match(h, /isaac_game_state_9d05d0_uint_idx_lt_count_va\(/);
  // byte-gate discipline: no uint8_t scalar params anywhere in the new code
  const lawBody = h.slice(h.indexOf("/* P1"));
  assert.doesNotMatch(lawBody, /uint8_t \w+ [^;]*[,)]/);
});

test("model constants agree with the pinned PE values", () => {
  assert.equal(MODEL.GAME_STATE_PURE_ABI_VERSION, 20);
  assert.equal(MODEL.GS9C8350_VA, 0x009c8350);
  assert.equal(MODEL.GS9C8350_END_VA, 0x009c840a);
  assert.equal(MODEL.GS9C8350_BODY_BYTES, 0xba);
  assert.equal(MODEL.GS9C8350_NEXT_VA, 0x009c8410);
  assert.equal(MODEL.GS9C8350_TAIL_VA, 0x009c79a0);
  assert.equal(MODEL.GS9C8350_STEAM_IAT, 0x00b18a1c);
  assert.equal(MODEL.GS9C8350_STEAM_ARG, 0x00c5c3a4);
  assert.equal(MODEL.GS9C8350_REMOVE_IAT, 0x00b187cc);
  assert.equal(MODEL.GS9C8350_LOGGER_VA, 0x00a112c0);
  assert.equal(MODEL.GS9C8350_LOG_STR_VA, 0x00b7f1ac);
  assert.equal(MODEL.GS9C8350_MGR_GLOBAL_DAT, 0x00c7169c);
  assert.equal(MODEL.GS9C8350_CLOUD_OFF, 0x2a3a4);
  assert.equal(MODEL.GS9C8350_FILENAME_SIZE_OFF, 0x1fdbc);
  assert.equal(MODEL.GS9C8350_FILENAME_BUF_OFF, 0x1fdac);
  assert.equal(MODEL.GS9C8350_STATNAME_SIZE_OFF, 0x1fe08);
  assert.equal(MODEL.GS9C8350_STATNAME_BUF_OFF, 0x1fdf4);
  assert.equal(MODEL.GS9C8350_SSO_THRESHOLD, 0x10);
  assert.equal(MODEL.GS9C8350_VTBL34_SLOT, 0x34);
  assert.equal(MODEL.GS9C8350_VTBL18_SLOT, 0x18);
  assert.equal(MODEL.GS9C8350_CALLER_COUNT, 5);
  assert.deepEqual(MODEL.GS9C8350_CALLER_VAS, [
    0x0095915d, 0x0095a243, 0x009cc254, 0x009ce68f, 0x009d9df7,
  ]);
  // ABI v2: DeleteRerun 0x009c8410
  assert.equal(MODEL.GS9C8410_VA, 0x009c8410);
  assert.equal(MODEL.GS9C8410_END_VA, 0x009c84bb);
  assert.equal(MODEL.GS9C8410_BODY_BYTES, 0xab);
  assert.equal(MODEL.GS9C8410_NEXT_VA, 0x009c84c0);
  assert.equal(MODEL.GS9C8410_STEAM_RET_VA, 0x009c8483);
  assert.equal(MODEL.GS9C8410_TAIL_RET_VA, 0x009c84ba);
  assert.equal(MODEL.GS9C8410_STEAM_IAT, 0x00b18a1c);
  assert.equal(MODEL.GS9C8410_STEAM_ARG, 0x00c5c3a4);
  assert.equal(MODEL.GS9C8410_REMOVE_IAT, 0x00b187cc);
  assert.equal(MODEL.GS9C8410_LOGGER_VA, 0x00a112c0);
  assert.equal(MODEL.GS9C8410_LOG_STR_VA, 0x00b7f1e0);
  assert.equal(MODEL.GS9C8410_MGR_GLOBAL_DAT, 0x00c7169c);
  assert.equal(MODEL.GS9C8410_CLOUD_OFF, 0x2a3a4);
  assert.equal(MODEL.GS9C8410_FILENAME_EMPTY_SIZE_OFF, 0x1fdbc);
  assert.equal(MODEL.GS9C8410_FILENAME_SIZE_OFF, 0x1fdd8);
  assert.equal(MODEL.GS9C8410_FILENAME_BUF_OFF, 0x1fdc4);
  assert.equal(MODEL.GS9C8410_STATNAME_SIZE_OFF, 0x1fe20);
  assert.equal(MODEL.GS9C8410_STATNAME_BUF_OFF, 0x1fe0c);
  assert.equal(MODEL.GS9C8410_SSO_THRESHOLD, 0x10);
  assert.equal(MODEL.GS9C8410_VTBL34_SLOT, 0x34);
  assert.equal(MODEL.GS9C8410_VTBL18_SLOT, 0x18);
  assert.equal(MODEL.GS9C8410_CALLER_COUNT, 5);
  assert.deepEqual(MODEL.GS9C8410_CALLER_VAS, [
    0x00958fca, 0x0095a414, 0x009cad4d, 0x009caf8f, 0x009d7dc6,
  ]);
  // ABI v2: write 0x009c9340 typed-host lease
  assert.equal(MODEL.GS9C9340_VA, 0x009c9340);
  assert.equal(MODEL.GS9C9340_END_VA, 0x009cad3b);
  assert.equal(MODEL.GS9C9340_BODY_BYTES, 0x19fb);
  assert.equal(MODEL.GS9C9340_NEXT_VA, 0x009cad40);
  assert.equal(MODEL.GS9C9340_STREAM_VTBL_SLOT, 0x1c);
  assert.equal(MODEL.GS9C9340_ROW_WRITER_VA, 0x00683410);
  assert.equal(MODEL.GS9C9340_STREAM_INIT_VA, 0x00420a80);
  assert.equal(MODEL.GS9C9340_GSR_FORMAT_STR_VA, 0x00b7f218);
  assert.equal(MODEL.GS9C9340_SEEDED_LOG_STR_VA, 0x00b1c640);
  assert.equal(MODEL.GS9C9340_LOGGER_VA, 0x00a112c0);
  assert.equal(MODEL.GS9C9340_SE_HANDLER_DAT, 0x00b0f2d0);
  assert.equal(MODEL.GS9C9340_GS_COOKIE_DAT, 0x00bf93b4);
  assert.equal(MODEL.GS9C9340_COOKIE_TAIL_VA, 0x00aef12b);
  assert.equal(MODEL.GS9C9340_INVALID_PARAM_IAT, 0x00b18894);
  assert.equal(MODEL.GS9C9340_FREE_VA, 0x00aef15c);
  assert.equal(MODEL.GS9C9340_GAME_STATE_IO_OFF, 0x1fe24);
  assert.equal(MODEL.GS9C9340_SERIALIZER_8D20_VA, 0x009c8d20);
  assert.equal(MODEL.GS9C9340_SERIALIZER_87E0_VA, 0x009c87e0);
  assert.equal(MODEL.GS9C9340_SERIALIZER_85D0_VA, 0x009c85d0);
  assert.equal(MODEL.GS9C9340_LEAF_9D77E0_VA, 0x009d77e0);
  assert.equal(MODEL.GS9C9340_LEAF_9D45C0_VA, 0x009d45c0);
  assert.equal(MODEL.GS9C9340_LEAF_9CEC80_VA, 0x009cec80);
  assert.equal(MODEL.GS9C9340_LEAF_9D84D0_VA, 0x009d84d0);
  assert.equal(MODEL.GS9C9340_LEAF_9EB5B0_VA, 0x009eb5b0);
  assert.equal(MODEL.GS9C9340_LEAF_4288A0_VA, 0x004288a0);
  assert.equal(MODEL.GS9C9340_LEAF_708AE0_VA, 0x00708ae0);
  assert.equal(MODEL.GS9C9340_LEAF_AF05E5_VA, 0x00af05e5);
  assert.equal(MODEL.GS9C9340_CALLER_COUNT, 3);
  assert.deepEqual(MODEL.GS9C9340_CALLER_VAS, [
    0x00917577, 0x00959076, 0x009cae15,
  ]);
  // ABI v3: serializer tree
  assert.equal(MODEL.GS9C84C0_VA, 0x009c84c0);
  assert.equal(MODEL.GS9C84C0_END_VA, 0x009c85d0);
  assert.equal(MODEL.GS9C84C0_LANE_COUNT_GATE_VA, 0x009c850e);
  assert.equal(MODEL.GS9C84C0_CLEAR_GATE_VA, 0x009c851e);
  assert.deepEqual(MODEL.GS9C84C0_CALLER_VAS, [
    0x009cdefe, 0x009d3036, 0x009d3048,
  ]);
  assert.equal(MODEL.GS9C85D0_END_VA, 0x009c86d3);
  assert.equal(MODEL.GS9C85D0_FLUSH8_GATE_VA, 0x009c8661);
  assert.deepEqual(MODEL.GS9C85D0_CALLER_VAS, [0x009ca78a]);
  assert.equal(MODEL.GS9C86E0_SENTINEL_GATE_VA, 0x009c870b);
  assert.equal(MODEL.GS9C86E0_CALLER_COUNT, 2);
  assert.equal(MODEL.GS9C87E0_SENTINEL_GATE_VA, 0x009c880b);
  assert.equal(MODEL.GS_TRIPLE_SENTINEL, 0x80000000);
  assert.equal(MODEL.GS9C88E0_FLAGS_BIT0_GATE_VA, 0x009c8ca3);
  assert.equal(MODEL.GS9C88E0_FLAGS_BIT1_GATE_VA, 0x009c8cb0);
  assert.equal(MODEL.GS9C88E0_BLOB_GATE_VA, 0x009c8ce6);
  assert.equal(MODEL.GS9C88E0_CHILD_GATE_VA, 0x009c8d04);
  assert.equal(MODEL.GS9C88E0_RET_TRUE_VA, 0x009c8d11);
  assert.equal(MODEL.GS9C8D20_TABLE_BYTES, 0x3800);
  assert.equal(MODEL.GS9C8D20_SLOT_GATE_VA, 0x009c8ff8);
  assert.equal(MODEL.GS9C8D20_TABLE_BOUND_GATE_VA, 0x009c90e5);
  assert.equal(MODEL.GS9C8D20_ELEMENT_STRIDE, 0x78);
  assert.equal(MODEL.GS9C8D20_COUNT_ZERO_GATE_VA, 0x009c9132);
  assert.equal(MODEL.GS9C8D20_COUNT_ZERO_GATE_VA_2, 0x009c921b);
  assert.equal(MODEL.GS9C8D20_WALK_EMPTY_GATE_VA, 0x009c9195);
  assert.equal(MODEL.GS9C8D20_WALK_TAIL_GATE_VA, 0x009c91d5);
  assert.deepEqual(MODEL.GS9C8D20_CALLER_VAS, [
    0x009c9d3b, 0x009c9d87, 0x009cab5d, 0x009cabdd,
  ]);
  // ABI v4: save-orchestrator hosts + read_rerun lease + cluster spans
  assert.equal(MODEL.GS9CAD40_VA, 0x009cad40);
  assert.equal(MODEL.GS9CAD40_END_VA, 0x009caea0);
  assert.equal(MODEL.GS9CAD40_BODY_BYTES, 0x160);
  assert.equal(MODEL.GS9CAD40_IO_DTOR_GATE_VA, 0x009cad58);
  assert.equal(MODEL.GS9CAD40_POOL_SELECT_VA, 0x009cad68);
  assert.equal(MODEL.GS9CAD40_NAME_GATE_VA, 0x009cadb6);
  assert.equal(MODEL.GS9CAD40_OPEN_GATE_VA, 0x009cadcb);
  assert.equal(MODEL.GS9CAD40_WRITE_CALL_VA, 0x009cae15);
  assert.deepEqual(MODEL.GS9CAD40_CALLER_VAS, [0x00958fa1]);
  assert.equal(MODEL.GS9CAEA0_VA, 0x009caea0);
  assert.equal(MODEL.GS9CAEA0_END_VA, 0x009cb01a);
  assert.equal(MODEL.GS9CAEA0_BODY_BYTES, 0x17a);
  assert.equal(MODEL.GS9CAEA0_RERUN_GATE_VA, 0x009caf18);
  assert.equal(MODEL.GS9CAEA0_OPEN_GATE_VA, 0x009caf2d);
  assert.equal(MODEL.GS9CAEA0_SUCCESS_GATE_VA, 0x009caf89);
  assert.equal(MODEL.GS9CAEA0_SUCCESS_STORE_VA, 0x009cafe9);
  assert.equal(MODEL.GS9CAEA0_RERUN_SUCCESS_BYTE_OFF, 0x1fded);
  assert.equal(MODEL.GS9CAEA0_RERUN_FLAG_WORD_OFF, 0x1fdec);
  assert.deepEqual(MODEL.GS9CAEA0_CALLER_VAS, [0x0095a0eb]);
  assert.equal(MODEL.GS_IO_VTABLE, 0x00b65724);
  assert.equal(MODEL.GS_IO_ALLOC_SIZE, 0x28);
  assert.equal(MODEL.GS_IO_CHECKSUM_VA, 0x00683930);
  assert.equal(MODEL.GS_IO_CHECKSUM_SIZE, 0x100000);
  assert.equal(MODEL.GS_IO_POOL_GLOBAL_DAT, 0x00c7de78);
  assert.equal(MODEL.GS_IO_POOL_FALLBACK, 0x00c7f618);
  assert.equal(MODEL.GS_IO_POOL_STEP, 0x30);
  assert.equal(MODEL.GS_IO_VTBL_OPEN_SLOT, 0x30);
  assert.equal(MODEL.GS_IO_VTBL_CLOSE_SLOT, 0x34);
  assert.equal(MODEL.GS_IO_VTBL_RERUN_SLOT, 0x24);
  assert.equal(MODEL.GS_WRITE_RECORD_SEED, 0xfedcba76);
  assert.equal(MODEL.GS9D7D50_VA, 0x009d7d50);
  assert.equal(MODEL.GS9D7D50_END_VA, 0x009d8183);
  assert.equal(MODEL.GS9D7D50_BODY_BYTES, 0x433);
  assert.equal(MODEL.GS9D7D50_CHECKSUM_XOR, 0x96696996);
  assert.equal(MODEL.GS9D7D50_CHECKSUM_OFF, 0x1fda8);
  assert.equal(MODEL.GS9D7D50_VERSION_OFF, 0x1fdf0);
  assert.deepEqual(MODEL.GS9D7D50_CALLER_VAS, [0x0095a3c8, 0x009caf77]);
  assert.equal(MODEL.GS9D45C0_END_VA, 0x009d71a1);
  assert.equal(MODEL.GS9D45C0_BODY_BYTES, 0x2be1);
  assert.equal(MODEL.GS9D77E0_END_VA, 0x009d7d49);
  assert.equal(MODEL.GS9CEC80_END_VA, 0x009ceff1);
  assert.equal(MODEL.GS9D84D0_END_VA, 0x009d8549);
  assert.equal(MODEL.GS9D84D0_BODY_BYTES, 0x79);
  assert.equal(MODEL.GS_READER_ROW_NEXT_VA, 0x009cb020);
  // ABI v5: write-span loop/decision laws + 0x683930
  assert.equal(MODEL.GS9C8D20_ELEMENT_LOOP_MORE_VA, 0x009c9157);
  assert.equal(MODEL.GS9C8D20_ELEMENT_LOOP_MORE_VA_2, 0x009c9249);
  assert.equal(MODEL.GS9C9340_HASH_COUNT_GATE_VA, 0x009c9ca0);
  assert.equal(MODEL.GS9C9340_HASH_PROBE_VA, 0x009c9cc0);
  assert.equal(MODEL.GS9C9340_HASH_BOUND_GATE_VA, 0x009c9cd8);
  assert.equal(MODEL.GS9C9340_VALUE_COUNT_GATE_VA, 0x009c9d17);
  assert.equal(MODEL.GS9C9340_VALUE_BOUND_GATE_VA, 0x009c9d5c);
  assert.equal(MODEL.GS9C9340_REORDER_NEG_GATE_VA, 0x009c9dc5);
  assert.equal(MODEL.GS9C9340_REORDER_FLUSH_GATE_VA, 0x009c9dcf);
  assert.equal(MODEL.GS9C9340_REORDER_RUN_WORD_VA, 0x009c9dd5);
  assert.equal(MODEL.GS9C9340_REORDER_FINAL_FLUSH_VA, 0x009c9e07);
  assert.equal(MODEL.GS9C9340_DIV0XC_COUNT_VA, 0x009ca858);
  assert.equal(MODEL.GS9C9340_DIV0XC_RESIZE_GATE_VA, 0x009ca868);
  assert.equal(MODEL.GS9C9340_DIV0XC_COUNT_BYTE_VA, 0x009ca8ad);
  assert.equal(MODEL.GS9C9340_DIV0XC_NEEDED_GATE_VA, 0x009ca8fd);
  assert.equal(MODEL.GS9C9340_DIV0XC_BOUND_GATE_VA, 0x009ca9e1);
  assert.equal(MODEL.GS9C9340_LANE7_COUNT_VA, 0x009caa9c);
  assert.equal(MODEL.GS9C9340_LANE7_MORE_VA, 0x009cac22);
  assert.equal(MODEL.GS9C9340_BYTE_COUNT_NEEDED_VA, 0x009cab2a);
  assert.equal(MODEL.GS9C9340_BYTE_COUNT_NEEDED_VA_2, 0x009cabb9);
  assert.equal(MODEL.GS9C9340_BYTE_COUNT_MORE_VA, 0x009cab70);
  assert.equal(MODEL.GS9C9340_BYTE_COUNT_MORE_VA_2, 0x009cabf0);
  assert.equal(MODEL.GS9C9340_FINALIZE_MODE_GATE_VA, 0x009cacb2);
  assert.equal(MODEL.GS9C9340_FINALIZE_PARTIAL_GATE_VA, 0x009cacbb);
  assert.equal(MODEL.GS9C9340_FINALIZE_PAD_VA, 0x009cacbf);
  assert.equal(MODEL.GS9C9340_FINALIZE_FOLD_VA, 0x009cacdc);
  assert.equal(MODEL.GS9C9340_CHECKSUM_STORE_XOR_VA, 0x009cad00);
  assert.equal(MODEL.GS9C9340_HASH_TABLE_OFF, 0x19520);
  assert.equal(MODEL.GS9C9340_HASH_CAP_OFF, 0x19524);
  assert.equal(MODEL.GS9C9340_HASH_STATE_OFF, 0x19528);
  assert.equal(MODEL.GS9C9340_HASH_COUNT_OFF, 0x1952c);
  assert.equal(MODEL.GS9C9340_VALUE_COUNT_OFF, 0x19c);
  assert.equal(MODEL.GS9C9340_VALUE_BASE_OFF, 0x1a0);
  assert.equal(MODEL.GS9C9340_HOLDER_BASE_OFF, 0x17c68);
  assert.equal(MODEL.GS9C9340_VALUE_STRIDE, 0xb8);
  assert.equal(MODEL.GS9C9340_HOLDER_STRIDE, 0xc);
  assert.equal(MODEL.GS9C9340_REORDER_TABLE_OFF, 0x19530);
  assert.equal(MODEL.GS9C9340_REORDER_ENTRIES, 0x1fb);
  assert.equal(MODEL.GS9C9340_REORDER_RUN_MARKER, 0x8000);
  assert.equal(MODEL.GS9C9340_DIV0XC_BEGIN_OFF, 0x1e790);
  assert.equal(MODEL.GS9C9340_DIV0XC_MAGIC, 0x2aaaaaab);
  assert.equal(MODEL.GS9C9340_DIV0XC_DIVISOR, 0xc);
  assert.equal(MODEL.GS9C9340_DIV0XC_CAP, 0xff);
  assert.equal(MODEL.GS9C9340_LANE7_BASE_OFF, 0x1ead0);
  assert.equal(MODEL.GS9C9340_LANE7_STRIDE, 0x320);
  assert.equal(MODEL.GS9C9340_LANE7_COUNT, 7);
  assert.equal(MODEL.GS9C9340_CHECKSUM_OFF, 0x1fda4);
  assert.equal(MODEL.GS9C9340_CHECKSUM_XOR, 0x96696996);
  assert.equal(MODEL.GS9C9340_STATE_MODE_OFF, 0xc);
  assert.equal(MODEL.GS9C9340_STATE_PARTIAL_OFF, 0x4);
  assert.equal(MODEL.GS9C9340_STATE_ACC_OFF, 0x8);
  assert.equal(MODEL.GS9C9340_STATE_LANE_OFF, 0x0);
  assert.equal(MODEL.GS683930_VA, 0x00683930);
  assert.equal(MODEL.GS683930_END_VA, 0x006839a0);
  assert.equal(MODEL.GS683930_BODY_BYTES, 0x70);
  assert.equal(MODEL.GS683930_NEXT_VA, 0x006839b0);
  assert.equal(MODEL.GS683930_STEAM_IAT, 0x00b18a1c);
  assert.equal(MODEL.GS683930_STEAM_ARG, 0x00c5c3a4);
  assert.equal(MODEL.GS683930_STEAM_GATE_VA, 0x0068394a);
  assert.equal(MODEL.GS683930_CALLER_COUNT, 3);
  assert.deepEqual(MODEL.GS683930_CALLER_VAS, [
    0x00928f7b, 0x009592ef, 0x009cadb1,
  ]);
  // ABI v6: reader row 0x9cb020 + fixed-count loops
  assert.equal(MODEL.GS9CB020_VA, 0x009cb020);
  assert.equal(MODEL.GS9CB020_END_VA, 0x009cb619);
  assert.equal(MODEL.GS9CB020_BODY_BYTES, 0x5f9);
  assert.equal(MODEL.GS9CB020_NEXT_VA, 0x009cb620);
  assert.equal(MODEL.GS9CB020_FORMAT_OFF, 0x8);
  assert.equal(MODEL.GS9CB020_VTBL14_SLOT, 0x14);
  assert.equal(MODEL.GS9CB020_ROW_WRITER_VA, 0x00683410);
  assert.equal(MODEL.GS9CB020_RECURSE_CALL_VA, 0x009cb5ee);
  assert.equal(MODEL.GS9CB020_SUB64_CTOR_VA, 0x00827f70);
  assert.equal(MODEL.GS9CB020_SUB6C_CTOR_VA, 0x006eee10);
  assert.equal(MODEL.GS9CB020_FLAGS_OFF, 0x60);
  assert.equal(MODEL.GS9CB020_SUB64_OFF, 0x64);
  assert.equal(MODEL.GS9CB020_SUB6C_OFF, 0x6c);
  assert.equal(MODEL.GS9CB020_SUB64_ALLOC, 0x24);
  assert.equal(MODEL.GS9CB020_SUB6C_ALLOC, 0x7c);
  assert.equal(MODEL.GS9CB020_SUB64_BYTES, 0x20);
  assert.equal(MODEL.GS9CB020_OLD_COMPAT_TYPE, 0x4);
  assert.equal(MODEL.GS9CB020_ALLOC_IAT, 0x00b187e0);
  assert.equal(MODEL.GS9CB020_FAIL_ALLOC_VA, 0x00a23200);
  assert.equal(MODEL.GS9CB020_GATE_0X3B_VA, 0x009cb122);
  assert.equal(MODEL.GS9CB020_GATE_0X46_VA, 0x009cb466);
  assert.equal(MODEL.GS9CB020_GATE_0X47_VA, 0x009cb179);
  assert.equal(MODEL.GS9CB020_GATE_0X5B_VA, 0x009cb254);
  assert.equal(MODEL.GS9CB020_GATE_0X67_VA, 0x009cb500);
  assert.equal(MODEL.GS9CB020_GATE_0X6C_VA, 0x009cb4d0);
  assert.equal(MODEL.GS9CB020_GATE_0X88_VA, 0x009cb1cb);
  assert.equal(MODEL.GS9CB020_GATE_0X96_VA, 0x009cb3ae);
  assert.equal(MODEL.GS9CB020_GATE_0X9E_VA, 0x009cb49a);
  assert.equal(MODEL.GS9CB020_OLD_U64_GATE_VA, 0x009cb302);
  assert.equal(MODEL.GS9CB020_BIT0_GATE_VA, 0x009cb53b);
  assert.equal(MODEL.GS9CB020_BIT1_GATE_VA, 0x009cb5ad);
  assert.equal(MODEL.GS9CB020_BYTE_TO_BOOL_VA, 0x009cb2aa);
  assert.equal(MODEL.GS9CB020_TYPE4_GATE_VA, 0x009cb33b);
  assert.equal(MODEL.GS9CB020_CALLER_COUNT, 4);
  assert.deepEqual(MODEL.GS9CB020_CALLER_VAS, [
    0x009cb5ee, 0x009cbe40, 0x009cbf83, 0x009d1df0,
  ]);
  assert.equal(MODEL.GS9C9C30_FIXED_COUNT, 0xe);
  assert.equal(MODEL.GS9C9C30_COUNT_STORE_VA, 0x009c9c24);
  assert.equal(MODEL.GS9C9C30_LOOP_HEAD_VA, 0x009c9c30);
  assert.equal(MODEL.GS9C9C30_MORE_VA, 0x009c9c57);
  assert.equal(MODEL.GS9C9C30_BASE_OFF, 0x164);
  assert.equal(MODEL.GS9C9C30_STRIDE, 0x4);
  assert.equal(MODEL.GS9C9D66_FIXED_COUNT, 0x14);
  assert.equal(MODEL.GS9C9D66_COUNT_STORE_VA, 0x009c9d6c);
  assert.equal(MODEL.GS9C9D66_LOOP_HEAD_VA, 0x009c9d84);
  assert.equal(MODEL.GS9C9D66_MORE_VA, 0x009c9d95);
  assert.equal(MODEL.GS9C9D66_VALUE_BASE_OFF, 0x16e08);
  assert.equal(MODEL.GS9C9D66_HOLDER_BASE_OFF, 0x1942c);
  assert.equal(MODEL.GS9C9D66_VALUE_STRIDE, 0xb8);
  assert.equal(MODEL.GS9C9D66_HOLDER_STRIDE, 0xc);
  // ABI v7: reorder-table loop bound + value word + 7-lane per-lane geometry
  assert.equal(MODEL.GS9C9340_REORDER_LOOP_MORE_VA, 0x009c9dfe);
  assert.equal(MODEL.GS9C9340_REORDER_LOOP_MORE_JNE_VA, 0x009c9e05);
  assert.equal(MODEL.GS9C9340_REORDER_VALUE_WORD_VA, 0x009c9dc2);
  assert.equal(MODEL.GS9C9340_REORDER_VALUE_STORE_VA, 0x009c9df0);
  assert.equal(MODEL.GS9C9340_LANE7_LANE_BASE_VA, 0x009caa97);
  assert.equal(MODEL.GS9C9340_LANE7_STRIDE_ADD_VA, 0x009cac1c);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM1_VALUE_VA, 0x009cab43);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM1_HOLDER_VA, 0x009cab53);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM2_VALUE_VA, 0x009cabc4);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM2_HOLDER_VA, 0x009cabca);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM1_VALUE_OFF, 0xfffffce4);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM1_HOLDER_OFF, 0xfffffe54);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM2_VALUE_OFF, 0xfffffe6c);
  assert.equal(MODEL.GS9C9340_LANE7_ELEM2_HOLDER_OFF, 0xffffffdc);
  assert.equal(MODEL.GS9C9340_LANE7_BYTE_OFF_1, 0xfffffffc);
  assert.equal(MODEL.GS9C9340_LANE7_BYTE_OFF_2, 0xfffffff4);
  assert.equal(MODEL.GS9C9340_LANE7_BYTE_OFF_3, 0xfffffff8);
  assert.equal(MODEL.GS9C9340_LANE7_BYTE_OFF_4, 0x0);
  // ABI v8: pill reader 0x9cb620
  assert.equal(MODEL.GS9CB620_VA, 0x009cb620);
  assert.equal(MODEL.GS9CB620_END_VA, 0x009cc18e);
  assert.equal(MODEL.GS9CB620_BODY_BYTES, 0xa6e);
  assert.equal(MODEL.GS9CB620_NEXT_VA, 0x009cc1a0);
  assert.equal(MODEL.GS9CB620_SEH_HANDLER_DAT, 0x00b0f300);
  assert.equal(MODEL.GS9CB620_IO_FORMAT_OFF, 0x8);
  assert.equal(MODEL.GS9CB620_GS_FORMAT_OFF, 0x1fdf0);
  assert.equal(MODEL.GS9CB620_IO_VTBL10_SLOT, 0x10);
  assert.equal(MODEL.GS9CB620_VTBL14_SLOT, 0x14);
  assert.equal(MODEL.GS9CB620_ROW_WRITER_VA, 0x00683410);
  assert.equal(MODEL.GS9CB620_SERIALIZER_ROW_CALL_VA, 0x009cb66c);
  assert.equal(MODEL.GS9CB620_READER_ROW_CALL_74_VA, 0x009cbe40);
  assert.equal(MODEL.GS9CB620_READER_ROW_CALL_88_VA, 0x009cbf83);
  assert.equal(MODEL.GS9CB620_VECTOR_CTOR_VA, 0x007dc9b0);
  assert.equal(MODEL.GS9CB620_VECTOR_INIT_VA, 0x00424540);
  assert.equal(MODEL.GS9CB620_LIST_INSERT_VA, 0x004e45c0);
  assert.equal(MODEL.GS9CB620_STRING_COPY_VA, 0x007e90f0);
  assert.equal(MODEL.GS9CB620_STRING_EMPTY_DAT, 0x00b1f7e0);
  assert.equal(MODEL.GS9CB620_FLAGS_OFF, 0x44);
  assert.equal(MODEL.GS9CB620_FLAG_BIT_0, 0x1);
  assert.equal(MODEL.GS9CB620_FLAG_BIT_5, 0x20);
  assert.equal(MODEL.GS9CB620_TABLE_OFF, 0x68);
  assert.equal(MODEL.GS9CB620_TABLE_BYTES, 0x3800);
  assert.equal(MODEL.GS9CB620_TABLE_STRIDE, 0x20);
  assert.equal(MODEL.GS9CB620_TABLE_SLOTS, 0x1c0);
  assert.equal(MODEL.GS9CB620_ARRAY74_OFF, 0x74);
  assert.equal(MODEL.GS9CB620_ARRAY88_OFF, 0x88);
  assert.equal(MODEL.GS9CB620_ARRAY_STRIDE, 0x78);
  assert.equal(MODEL.GS9CB620_FIXED8_COUNT, 0x8);
  assert.equal(MODEL.GS9CB620_FIXED8_COUNT_STORE_VA, 0x009cc11b);
  assert.equal(MODEL.GS9CB620_FIXED8_MORE_VA, 0x009cc145);
  assert.equal(MODEL.GS9CB620_IO_READY_GATE_VA, 0x009cb65d);
  assert.equal(MODEL.GS9CB620_IO_READY_GATE_VA_2, 0x009cbe30);
  assert.equal(MODEL.GS9CB620_IO_READY_GATE_VA_3, 0x009cbec0);
  assert.equal(MODEL.GS9CB620_IO_READY_GATE_VA_4, 0x009cbf70);
  assert.equal(MODEL.GS9CB620_IO_GATE_0X3D_VA, 0x009cba1b);
  assert.equal(MODEL.GS9CB620_IO_GATE_0X4B_VA, 0x009cbb0a);
  assert.equal(MODEL.GS9CB620_IO_GATE_0X7B_VA, 0x009cbb77);
  assert.equal(MODEL.GS9CB620_IO_GATE_0X7B_JNE_VA, 0x009cbb85);
  assert.equal(MODEL.GS9CB620_IO_GATE_0X7D_VA, 0x009cb671);
  assert.equal(MODEL.GS9CB620_IO_GATE_0X7D_JNE_VA, 0x009cb67e);
  assert.equal(MODEL.GS9CB620_GS_GATE_0X21_VA, 0x009cbd86);
  assert.equal(MODEL.GS9CB620_GS_GATE_0X3F_VA, 0x009cb835);
  assert.equal(MODEL.GS9CB620_GS_GATE_0X3F_JNE_VA, 0x009cb83f);
  assert.equal(MODEL.GS9CB620_GS_GATE_0X49_VA, 0x009cbfad);
  assert.equal(MODEL.GS9CB620_GS_GATE_0X49_JNE_VA, 0x009cbfb4);
  assert.equal(MODEL.GS9CB620_GS_GATE_0X82_VA, 0x009cb875);
  assert.equal(MODEL.GS9CB620_SLOT_COUNT_GATE_VA, 0x009cbbb1);
  assert.equal(MODEL.GS9CB620_STRING_COPY_GATE_VA, 0x009cbb3a);
  assert.equal(MODEL.GS9CB620_SLOT_POSITIVE_VA, 0x009cbc57);
  assert.equal(MODEL.GS9CB620_SLOT_MORE_VA, 0x009cbdc0);
  assert.equal(MODEL.GS9CB620_ARRAY74_NEEDED_VA, 0x009cbe08);
  assert.equal(MODEL.GS9CB620_ARRAY74_MORE_VA, 0x009cbe50);
  assert.equal(MODEL.GS9CB620_ARRAY88_NEEDED_VA, 0x009cbf43);
  assert.equal(MODEL.GS9CB620_ARRAY88_MORE_VA, 0x009cbf93);
  assert.equal(MODEL.GS9CB620_FLAG_GATE_VA, 0x009cb93b);
  assert.equal(MODEL.GS9CB620_FLAG_BIT1_OR_VA, 0x009cb994);
  assert.equal(MODEL.GS9CB620_FLAG_BIT2_OR_VA, 0x009cb9c0);
  assert.equal(MODEL.GS9CB620_FLAG_BIT3_OR_VA, 0x009cb9ec);
  assert.equal(MODEL.GS9CB620_FLAG_BIT4_OR_VA, 0x009cba18);
  assert.equal(MODEL.GS9CB620_FLAG_BIT5_OR_VA, 0x009cba72);
  assert.equal(MODEL.GS9CB620_CALLER_COUNT, 4);
  assert.deepEqual(MODEL.GS9CB620_CALLER_VAS, [
    0x009ccf75, 0x009ccfe8, 0x009ce33f, 0x009ce3ce,
  ]);
});

test("PE byte-truth pins: Delete + DeleteRerun gate sites, write span edges", () => {
  // 0x9c8350: push ebx / mov ebx,[0xb18a1c] / push esi / push edi
  assert.deepEqual([...peAt(0x9c8350, 7)], [0x53, 0x8b, 0x1d, 0x1c, 0x8a, 0xb1, 0x00]);
  // 0x9c836b: cmp dword ptr [eax], 0  (FULL-dword steam gate)
  assert.deepEqual([...peAt(0x9c836b, 3)], [0x83, 0x38, 0x00]);
  // 0x9c8370: cmp byte ptr [edi+0x2a3a4], 0  (LOW-BYTE cloud gate)
  assert.deepEqual([...peAt(0x9c8370, 7)], [0x80, 0xbf, 0xa4, 0xa3, 0x02, 0x00, 0x00]);
  // 0x9c8379: cmp dword ptr [esi+0x1fe08], 0x10  (SSO threshold)
  assert.deepEqual([...peAt(0x9c8379, 7)], [0x83, 0xbe, 0x08, 0xfe, 0x01, 0x00, 0x10]);
  // 0x9c83ad: test al, al  (vtbl+0x34 result gate)
  assert.deepEqual([...peAt(0x9c83ad, 2)], [0x84, 0xc0]);
  // 0x9c83cd: cmp dword ptr [esi+0x1fdbc], 0  (filename EMPTY gate)
  assert.deepEqual([...peAt(0x9c83cd, 7)], [0x83, 0xbe, 0xbc, 0xfd, 0x01, 0x00, 0x00]);
  // 0x9c83e5: cmp dword ptr [esi+0x1fdc0], 0x10  (filename SSO threshold)
  assert.deepEqual([...peAt(0x9c83e5, 7)], [0x83, 0xbe, 0xc0, 0xfd, 0x01, 0x00, 0x10]);

  // DeleteRerun 0x009c8410: prologue + gate sites (ABI v2)
  // 0x9c8410: push ebx / mov ebx,[0xc7169c] / push esi / push edi
  assert.deepEqual([...peAt(0x9c8410, 7)], [0x53, 0x8b, 0x1d, 0x9c, 0x16, 0xc7, 0x00]);
  // 0x9c842b: cmp dword ptr [eax], 0  (FULL-dword steam gate)
  assert.deepEqual([...peAt(0x9c842b, 3)], [0x83, 0x38, 0x00]);
  // 0x9c8430: cmp byte ptr [ebx+0x2a3a4], 0  (LOW-BYTE cloud gate)
  assert.deepEqual([...peAt(0x9c8430, 7)], [0x80, 0xbb, 0xa4, 0xa3, 0x02, 0x00, 0x00]);
  // 0x9c843f: cmp dword ptr [esi+0x14], 0x10  (stat-name SSO threshold; esi=this+0x1fe0c)
  assert.deepEqual([...peAt(0x9c843f, 4)], [0x83, 0x7e, 0x14, 0x10]);
  // 0x9c846a: test al, al  (vtbl+0x34 result gate)
  assert.deepEqual([...peAt(0x9c846a, 2)], [0x84, 0xc0]);
  // 0x9c8484: cmp dword ptr [esi+0x1fdbc], 0  (filename EMPTY gate, shared field)
  assert.deepEqual([...peAt(0x9c8484, 7)], [0x83, 0xbe, 0xbc, 0xfd, 0x01, 0x00, 0x00]);
  // 0x9c849c: cmp dword ptr [esi+0x1fdd8], 0x10  (filename SSO threshold)
  assert.deepEqual([...peAt(0x9c849c, 7)], [0x83, 0xbe, 0xd8, 0xfd, 0x01, 0x00, 0x10]);
  // 0x9c84ba: terminal ret of the body (int3 pad @0x9c84bb)
  assert.deepEqual([...peAt(0x9c84ba, 1)], [0xc3]);
  assert.deepEqual([...peAt(0x9c84bb, 1)], [0xcc]);

  // write 0x009c9340: SEH prologue + terminal ret 4 (typed-host lease pins)
  assert.deepEqual([...peAt(0x9c9340, 6)], [0x55, 0x8b, 0xec, 0x6a, 0xff, 0x68]); // push ebp / mov ebp,esp / push -1 / push 0xb0f2d0
  assert.deepEqual([...peAt(0x9cad38, 3)], [0xc2, 0x04, 0x00]); // ret 4 (thiscall + GameStateIO**)
  assert.deepEqual([...peAt(0x9cad3b, 1)], [0xcc]); // int3 pad

  // serializer tree 0x9c84c0..0x9c8d20 gate sites (ABI v3)
  // 0x9c850e: cmp eax,ecx ; push ecx ; cmovb eax,ecx  (R1 lane count max)
  assert.deepEqual([...peAt(0x9c850e, 6)], [0x3b, 0xc1, 0x51, 0x0f, 0x42, 0xc1]);
  // 0x9c851e: cmp [ebx+0xc],0 ; jbe  (R2 clear gate)
  assert.deepEqual([...peAt(0x9c851e, 4)], [0x39, 0x73, 0x0c, 0x76]);
  // 0x9c8550: test bx,bx ; jne  (R3 lane flush)
  assert.deepEqual([...peAt(0x9c8550, 4)], [0x66, 0x85, 0xdb, 0x75]);
  // 0x9c85ad: test byte [esp+0xf],dl ; je ; bts  (R4 bit select)
  assert.deepEqual([...peAt(0x9c85ad, 7)], [0x84, 0x54, 0x24, 0x0f, 0x74, 0x05, 0x0f]);
  // 0x9c8661: cmp di,8 ; jne  (R5 flush-every-8)
  assert.deepEqual([...peAt(0x9c8661, 4)], [0x66, 0x83, 0xff, 0x08]);
  // 0x9c86a0: test di,di ; je  (R6 remainder flush)
  assert.deepEqual([...peAt(0x9c86a0, 4)], [0x66, 0x85, 0xff, 0x74]);
  // 0x9c864a: test [ecx+esi*4],edx ; je  (R7 source bit)
  assert.deepEqual([...peAt(0x9c864a, 4)], [0x85, 0x14, 0xb1, 0x74]);
  // 0x9c870b / 0x9c880b: cmp [esi],0x80000000 ; 8d 46 08  (R8/R9 sentinel)
  assert.deepEqual([...peAt(0x9c870b, 8)], [0x81, 0x3e, 0x00, 0x00, 0x00, 0x80, 0x8d, 0x46]);
  assert.deepEqual([...peAt(0x9c880b, 8)], [0x81, 0x3e, 0x00, 0x00, 0x00, 0x80, 0x8d, 0x46]);
  // 0x9c8ca3: cmp [edi+0x64],0 ; je  (R10 flags bit0)
  assert.deepEqual([...peAt(0x9c8ca3, 6)], [0x83, 0x7f, 0x64, 0x00, 0x74, 0x07]);
  // 0x9c8cb0: cmp [edi+0x6c],0 ; je ; or al,2  (R10 flags bit1)
  assert.deepEqual([...peAt(0x9c8cb0, 7)], [0x83, 0x7f, 0x6c, 0x00, 0x74, 0x06, 0x0c]);
  // 0x9c8ce6: test esi,esi ; je  (R11 blob)
  assert.deepEqual([...peAt(0x9c8ce6, 4)], [0x85, 0xf6, 0x74, 0x17]);
  // 0x9c8d04: test ecx,ecx ; je  (R12 child)
  assert.deepEqual([...peAt(0x9c8d04, 4)], [0x85, 0xc9, 0x74, 0x07]);
  // 0x9c8d11: mov al,1  (R13 returns true)
  assert.deepEqual([...peAt(0x9c8d11, 2)], [0xb0, 0x01]);
  // 0x9c8ff8: test edi,edi ; je rel32  (R14 slot presence)
  assert.deepEqual([...peAt(0x9c8ff8, 8)], [0x85, 0xff, 0x0f, 0x84, 0xd9, 0x00, 0x00, 0x00]);
  // 0x9c90e5: cmp ecx,0x3800 ; jb rel32  (R15 table bound)
  assert.deepEqual([...peAt(0x9c90e5, 11)], [0x81, 0xf9, 0x00, 0x38, 0x00, 0x00, 0x0f, 0x82, 0xd3, 0xfe, 0xff]);
  // 0x9c90f1: mov edi,[ebp+0xc] ; mov eax,0x88888889  (R16 element count)
  assert.deepEqual([...peAt(0x9c90f1, 8)], [0x8b, 0x7d, 0x0c, 0xb8, 0x89, 0x88, 0x88, 0x88]);
  // 0x9c9132: cmp [ebp-8],0  (R17 zero gate)
  assert.deepEqual([...peAt(0x9c9132, 3)], [0x83, 0x7d, 0xf8, 0x00].slice(0, 3));
  // 0x9c9195: cmp eax,ecx ; je  (R18 walk empty)
  assert.deepEqual([...peAt(0x9c9195, 4)], [0x3b, 0xc1, 0x74, 0x3e]);
  // 0x9c91d5: jne rel32  (R18 walk tail)
  assert.deepEqual([...peAt(0x9c91d5, 3)], [0x75, 0xc9, 0x8b]);

  // GameStateIO save-orchestrator hosts (ABI v4)
  // 0x9cad40 (host A) prologue: push ebp / mov ebp,esp / and esp,-8 / sub esp,0x20
  assert.deepEqual([...peAt(0x9cad40, 7)], [0x55, 0x8b, 0xec, 0x83, 0xe4, 0xf8, 0x83]);
  // 0x9cad58: test ecx,ecx ; je +6  (S6 io-dtor gate A)
  assert.deepEqual([...peAt(0x9cad58, 4)], [0x85, 0xc9, 0x74, 0x06]);
  // 0x9cad68: test esi,esi ; je +5 ; add esi,0x30  (S1 pool select A)
  assert.deepEqual([...peAt(0x9cad68, 7)], [0x85, 0xf6, 0x74, 0x05, 0x83, 0xc6, 0x30]);
  // 0x9cadb6: test al,al ; je rel32  (S2 name gate)
  assert.deepEqual([...peAt(0x9cadb6, 7)], [0x84, 0xc0, 0x0f, 0x84, 0xb9, 0x00, 0x00]);
  // 0x9cadcb: test al,al ; je rel32  (S3 open gate A)
  assert.deepEqual([...peAt(0x9cadcb, 7)], [0x84, 0xc0, 0x0f, 0x84, 0xa4, 0x00, 0x00]);
  // 0x9caea0 (host B) prologue: push ebp / mov ebp,esp / and esp,-8 / sub esp,0x24
  assert.deepEqual([...peAt(0x9caea0, 7)], [0x55, 0x8b, 0xec, 0x83, 0xe4, 0xf8, 0x83]);
  // 0x9caebd: test ecx,ecx ; je +6  (S6 io-dtor gate B twin)
  assert.deepEqual([...peAt(0x9caebd, 4)], [0x85, 0xc9, 0x74, 0x06]);
  // 0x9caecd: test esi,esi ; je +5 ; add esi,0x30  (S1 pool select B twin)
  assert.deepEqual([...peAt(0x9caecd, 7)], [0x85, 0xf6, 0x74, 0x05, 0x83, 0xc6, 0x30]);
  // 0x9caf18: test al,al ; je rel32  (S4 rerun gate)
  assert.deepEqual([...peAt(0x9caf18, 7)], [0x84, 0xc0, 0x0f, 0x84, 0xd9, 0x00, 0x00]);
  // 0x9caf2d: test al,al ; je rel32  (S3 open gate B twin)
  assert.deepEqual([...peAt(0x9caf2d, 7)], [0x84, 0xc0, 0x0f, 0x84, 0xc4, 0x00, 0x00]);
  // 0x9caf89: test bl,bl ; jne +0x5c  (S5 success gate)
  assert.deepEqual([...peAt(0x9caf89, 4)], [0x84, 0xdb, 0x75, 0x5c]);
  // 0x9cafe9: mov byte [edi+0x1fded],1 ; mov al,1  (S5 success store)
  assert.deepEqual([...peAt(0x9cafe9, 8)], [0xc6, 0x87, 0xed, 0xfd, 0x01, 0x00, 0x01, 0xb0]);
  // 0x9cb01a: int3 pad after host B
  assert.deepEqual([...peAt(0x9cb01a, 1)], [0xcc]);
  // 0x9d7d50 (GameState::read_rerun) prologue + cookie load
  assert.deepEqual([...peAt(0x9d7d50, 7)], [0x55, 0x8b, 0xec, 0x83, 0xec, 0x78, 0xa1]);
  // 0x9d7dc6: call DeleteRerun (restore-on-version-fail arm) — e8 45 06 ff ff
  assert.deepEqual([...peAt(0x9d7dc6, 5)], [0xe8, 0x45, 0x06, 0xff, 0xff]);
  // 0x9d8180: read_rerun terminal ret 4 (lease end)
  assert.deepEqual([...peAt(0x9d8180, 3)], [0xc2, 0x04, 0x00]);
  // 0x9d8546 (0x9d84d0 leaf) terminal ret 4 + int3 pad
  assert.deepEqual([...peAt(0x9d8546, 4)], [0xc2, 0x04, 0x00, 0xcc]);

  // write-span loop/decision law sites (ABI v5)
  // 0x9c9157 / 0x9c9249: cmp eax,[ebp-8] ; jb / cmp eax,[ebp-0xc] ; jb (U1)
  assert.deepEqual([...peAt(0x9c9157, 5)], [0x3b, 0x45, 0xf8, 0x72, 0xe5]);
  assert.deepEqual([...peAt(0x9c9249, 5)], [0x3b, 0x45, 0xf4, 0x72, 0xe2]);
  // 0x9c9ca0: cmp [esi+0x1952c],0 ; jbe (W1 hash count gate)
  assert.deepEqual([...peAt(0x9c9ca0, 8)], [0x83, 0xbe, 0x2c, 0x95, 0x01, 0x00, 0x00, 0x76]);
  // 0x9c9cc0: mov eax,[esi+0x19524] ; dec eax ; and ecx,eax (W2 probe)
  assert.deepEqual([...peAt(0x9c9cc0, 7)], [0x8b, 0x86, 0x24, 0x95, 0x01, 0x00, 0x48]);
  // 0x9c9cd8: cmp edi,[esi+0x1952c] ; jb (W3 hash bound)
  assert.deepEqual([...peAt(0x9c9cd8, 7)], [0x3b, 0xbe, 0x2c, 0x95, 0x01, 0x00, 0x72]);
  // 0x9c9d17: cmp [esi+0x19c],0 ; jbe (W4 value count gate)
  assert.deepEqual([...peAt(0x9c9d17, 8)], [0x83, 0xbe, 0x9c, 0x01, 0x00, 0x00, 0x00, 0xc7]);
  // 0x9c9d5c: cmp eax,[ecx] ; jb (W5 value bound)
  assert.deepEqual([...peAt(0x9c9d5c, 3)], [0x3b, 0x01, 0x72]);
  // 0x9c9dc5: test eax,eax ; jns (W6 reorder entry sign)
  assert.deepEqual([...peAt(0x9c9dc5, 4)], [0x85, 0xc0, 0x79, 0x03]);
  // 0x9c9dcc: test cx,cx ; je +0x15 (W7 pending flush)
  assert.deepEqual([...peAt(0x9c9dcc, 5)], [0x66, 0x85, 0xc9, 0x74, 0x15]);
  // 0x9c9dd5: or ecx,0x8000 ; mov word (W8 run word)
  assert.deepEqual([...peAt(0x9c9dd5, 6)], [0x81, 0xc9, 0x00, 0x80, 0x00, 0x00]);
  // 0x9c9e07: test cx,cx ; je (W9 final flush)
  assert.deepEqual([...peAt(0x9c9e07, 4)], [0x66, 0x85, 0xc9, 0x74]);
  // 0x9ca858: mov eax,0x2aaaaaab ; imul ecx ; sar edx,1 (W10 div-0xc)
  assert.deepEqual([...peAt(0x9ca858, 8)], [0xb8, 0xab, 0xaa, 0xaa, 0x2a, 0xf7, 0xe9, 0xd1]);
  // 0x9ca868: cmp eax,0xff ; jbe (W11 resize)
  assert.deepEqual([...peAt(0x9ca868, 6)], [0x3d, 0xff, 0x00, 0x00, 0x00, 0x76]);
  // 0x9ca8ad: mov byte [ebp-0x44d],al (W12 count byte)
  assert.deepEqual([...peAt(0x9ca8ad, 3)], [0x88, 0x85, 0xb3]);
  // 0x9ca8fd: je rel32 (W13 loop needed)
  assert.deepEqual([...peAt(0x9ca8fd, 6)], [0x0f, 0x84, 0xec, 0x00, 0x00, 0x00]);
  // 0x9ca9e1: cmp esi,eax ; jb rel32 (W14 loop bound)
  assert.deepEqual([...peAt(0x9ca9e1, 6)], [0x3b, 0xf0, 0x0f, 0x82, 0x27, 0xff]);
  // 0x9caa9c: mov [ebp-0x44c],7 (W15 lane7 count)
  assert.deepEqual([...peAt(0x9caa9c, 7)], [0xc7, 0x85, 0xb4, 0xfb, 0xff, 0xff, 0x07]);
  // 0x9cac22: sub [ebp-0x44c],1 ; jne rel32 (W16 lane7 more)
  assert.deepEqual([...peAt(0x9cac22, 7)], [0x83, 0xad, 0xb4, 0xfb, 0xff, 0xff, 0x01]);
  // 0x9cab2a / 0x9cabb9: cmp byte [ebp-0x44d],al ; jle (W17 entry, SIGNED)
  assert.deepEqual([...peAt(0x9cab2a, 7)], [0x38, 0x85, 0xb3, 0xfb, 0xff, 0xff, 0x7e]);
  assert.deepEqual([...peAt(0x9cabb9, 7)], [0x38, 0x85, 0xb3, 0xfb, 0xff, 0xff, 0x7e]);
  // 0x9cab70 / 0x9cabf0: cmp al,[ebp-0x44d] ; jl (W18 bound, SIGNED)
  assert.deepEqual([...peAt(0x9cab70, 7)], [0x3a, 0x85, 0xb3, 0xfb, 0xff, 0xff, 0x7c]);
  assert.deepEqual([...peAt(0x9cabf0, 7)], [0x3a, 0x85, 0xb3, 0xfb, 0xff, 0xff, 0x7c]);
  // 0x9cacb2: cmp dword [edi+0xc],0 ; jne / 0x9cacbb: test dl,dl ; je (W19)
  assert.deepEqual([...peAt(0x9cacb2, 7)], [0x83, 0x7f, 0x0c, 0x00, 0x75, 0x39, 0x8a]);
  assert.deepEqual([...peAt(0x9cacbb, 4)], [0x84, 0xd2, 0x74, 0x32]);
  // 0x9cacbf: cmp dl,4 ; jae / mov al,4 / sub al,dl (W20 pad)
  assert.deepEqual([...peAt(0x9cacbf, 7)], [0x80, 0xfa, 0x04, 0x73, 0x18, 0xb0, 0x04]);
  // 0x9cacdc: mov eax,[edi+8] ; shr ecx,1 ; shl eax,0x1f (W21 fold)
  assert.deepEqual([...peAt(0x9cacdc, 7)], [0x8b, 0x47, 0x08, 0x8b, 0xc8, 0xd1, 0xe9]);
  // 0x9cad00: mov [esi+0x1fda4],eax ; xor eax,0x96696996 (W22 store+xor)
  assert.deepEqual([...peAt(0x9cad00, 7)], [0x89, 0x86, 0xa4, 0xfd, 0x01, 0x00, 0x35]);
  // 0x9cad06: xor eax,0x96696996 (W22 xor imm32, LE = 96 69 69 96)
  assert.deepEqual([...peAt(0x9cad06, 5)], [0x35, 0x96, 0x69, 0x69, 0x96]);
  // 0x683930: push [0xc5c3a4] steam arg / call [0xb18a1c] (N1 helper open)
  assert.deepEqual([...peAt(0x68393a, 7)], [0x68, 0xa4, 0xc3, 0xc5, 0x00, 0x8b, 0xd9]);
  // 0x68394a: cmp dword [eax],0 ; jne (N1 steam gate, FULL-dword)
  assert.deepEqual([...peAt(0x68394a, 5)], [0x83, 0x38, 0x00, 0x75, 0x0b]);
  // 0x68399e: ret 8 (N1 body terminal) + int3 pad
  assert.deepEqual([...peAt(0x68399e, 4)], [0xc2, 0x08, 0x00, 0xcc]);
  // reorder-table loop bound + value word + 7-lane per-lane geometry (ABI v7)
  // 0x9c9db4: mov [ebp-0x458],0x1fb (X1 count init)
  assert.deepEqual([...peAt(0x9c9db4, 10)], [0xc7, 0x85, 0xa8, 0xfb, 0xff, 0xff, 0xfb, 0x01, 0x00, 0x00]);
  // 0x9c9dfe: sub [ebp-0x458],1 ; 0x9c9e05: jne rel8 (X1 countdown)
  assert.deepEqual([...peAt(0x9c9dfe, 7)], [0x83, 0xad, 0xa8, 0xfb, 0xff, 0xff, 0x01]);
  assert.deepEqual([...peAt(0x9c9e05, 2)], [0x75, 0xb9]);
  // 0x9c9dc2: movzx edi,ax (X2 value word truncation)
  assert.deepEqual([...peAt(0x9c9dc2, 3)], [0x0f, 0xb7, 0xf8]);
  // 0x9c9df0: mov word [ebp+eax*2-0x42c],di (X2 value word store)
  assert.deepEqual([...peAt(0x9c9df0, 8)], [0x66, 0x89, 0xbc, 0x45, 0xd4, 0xfb, 0xff, 0xff]);
  // 0x9caa97: add eax,0x1ead0 (Y1 lane-0 base)
  assert.deepEqual([...peAt(0x9caa97, 5)], [0x05, 0xd0, 0xea, 0x01, 0x00]);
  // 0x9cac1c: add esi,0x320 (Y1 stride advance)
  assert.deepEqual([...peAt(0x9cac1c, 6)], [0x81, 0xc6, 0x20, 0x03, 0x00, 0x00]);
  // 0x9cab40: movsx ecx,al (Y2/Y3 idx sign-extend)
  assert.deepEqual([...peAt(0x9cab40, 3)], [0x0f, 0xbe, 0xc8]);
  // 0x9cab43: lea edx,[esi-0x31c] (Y2 value1 base)
  assert.deepEqual([...peAt(0x9cab43, 6)], [0x8d, 0x96, 0xe4, 0xfc, 0xff, 0xff]);
  // 0x9cab49: imul eax,ecx,0xb8 (Y2 stride)
  assert.deepEqual([...peAt(0x9cab49, 6)], [0x69, 0xc1, 0xb8, 0x00, 0x00, 0x00]);
  // 0x9cab53/0x9cab56/0x9cab59: lea chain (Y3 holder1)
  assert.deepEqual([...peAt(0x9cab53, 6)], [0x8d, 0x41, 0x2e, 0x8d, 0x04, 0x41]);
  assert.deepEqual([...peAt(0x9cab59, 4)], [0x8d, 0x04, 0x82, 0x50]);
  // 0x9cabc1: movsx ecx,al (Y4/Y5 idx sign-extend)
  assert.deepEqual([...peAt(0x9cabc1, 3)], [0x0f, 0xbe, 0xc8]);
  // 0x9cabc4: imul eax,ecx,0xb8 (Y4 value2 stride)
  assert.deepEqual([...peAt(0x9cabc4, 6)], [0x69, 0xc1, 0xb8, 0x00, 0x00, 0x00]);
  // 0x9cabca: add ecx,-3 (Y5 holder2 offset)
  assert.deepEqual([...peAt(0x9cabca, 3)], [0x83, 0xc1, 0xfd]);
  // 0x9cabd3: add eax,esi (Y4 value2 base add)
  assert.deepEqual([...peAt(0x9cabd3, 2)], [0x03, 0xc6]);
  // 0x9cabd6/0x9cabd9: lea chain (Y5 holder2)
  assert.deepEqual([...peAt(0x9cabd6, 6)], [0x8d, 0x04, 0x49, 0x8d, 0x04, 0x86]);
  // reader row + fixed-count loops (ABI v6)
  // 0x9cb020 prologue: push ebp / mov ebp,esp / and esp,-8 / sub esp,0x24 / push ebx/esi/edi
  assert.deepEqual([...peAt(0x9cb020, 12)], [0x55, 0x8b, 0xec, 0x83, 0xe4, 0xf8, 0x83, 0xec, 0x24, 0x53, 0x56, 0x57]);
  // 0x9cb5fb: ret (terminal, al=1) + int3 pad 0x9cb619..0x9cb61f
  assert.deepEqual([...peAt(0x9cb5fb, 1)], [0xc3]);
  assert.deepEqual([...peAt(0x9cb619, 7)], [0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc, 0xcc]);
  // R1 0x9cb122: cmp [edi+8],0x3b ; jb (format >= 0x3b, flags-byte read)
  assert.deepEqual([...peAt(0x9cb122, 6)], [0x83, 0x7f, 0x08, 0x3b, 0x72, 0x28]);
  // R2 0x9cb466: mov eax,[edi+8] / cmp eax,0x46 ; jb (format >= 0x46, u16 @+0x20)
  assert.deepEqual([...peAt(0x9cb466, 8)], [0x8b, 0x47, 0x08, 0x83, 0xf8, 0x46, 0x72, 0x2c]);
  // R3 0x9cb179: cmp [edi+8],0x47 ; jb (format >= 0x47, u32 @+0x1c)
  assert.deepEqual([...peAt(0x9cb179, 6)], [0x83, 0x7f, 0x08, 0x47, 0x72, 0x28]);
  // R4 0x9cb254: cmp [edi+8],0x5b (format >= 0x5b, u32-direct @+0x30);
  // jb 0x9cb287 follows at 0x9cb265 (after the vtbl fetch setup)
  assert.deepEqual([...peAt(0x9cb254, 4)], [0x83, 0x7f, 0x08, 0x5b]);
  assert.deepEqual([...peAt(0x9cb265, 2)], [0x72, 0x20]);
  // R5 0x9cb500: cmp eax,0x67 ; jb 0x9cb5f3 (format >= 0x67, flags processing)
  assert.deepEqual([...peAt(0x9cb500, 9)], [0x83, 0xf8, 0x67, 0x0f, 0x82, 0xea, 0x00, 0x00, 0x00]);
  // R6 0x9cb4d0: cmp eax,0x6c ; jb (format >= 0x6c, u32 @+0x5c)
  assert.deepEqual([...peAt(0x9cb4d0, 5)], [0x83, 0xf8, 0x6c, 0x72, 0x2b]);
  // R7 0x9cb1cb: cmp [edi+8],0x88 ; jb (format >= 0x88, u32 @+0x24)
  assert.deepEqual([...peAt(0x9cb1cb, 9)], [0x81, 0x7f, 0x08, 0x88, 0x00, 0x00, 0x00, 0x72, 0x28]);
  // R8 0x9cb3ae: cmp [edi+8],0x96 ; jb (format >= 0x96, u64 @+0x48)
  assert.deepEqual([...peAt(0x9cb3ae, 9)], [0x81, 0x7f, 0x08, 0x96, 0x00, 0x00, 0x00, 0x72, 0x2f]);
  // R9 0x9cb49a: cmp eax,0x9e ; jb (format >= 0x9e, float @+0x58)
  assert.deepEqual([...peAt(0x9cb49a, 6)], [0x3d, 0x9e, 0x00, 0x00, 0x00, 0x72]);
  // R10 0x9cb302: cmp [edi+8],0x47 ; jae (format < 0x47, old 8-B compat)
  assert.deepEqual([...peAt(0x9cb302, 6)], [0x83, 0x7f, 0x08, 0x47, 0x73, 0x56]);
  // R11 0x9cb53b: test al,1 ; je (bit0 -> sub +0x64)
  assert.deepEqual([...peAt(0x9cb53b, 4)], [0xa8, 0x01, 0x74, 0x6e]);
  // R12 0x9cb5ad: test al,2 ; je (bit1 -> sub +0x6c recursive read)
  assert.deepEqual([...peAt(0x9cb5ad, 4)], [0xa8, 0x02, 0x74, 0x42]);
  // R13 0x9cb2aa: xor eax,eax / cmp byte [esp+0x10],al / setne al / mov [esi+0x30],eax
  assert.deepEqual([...peAt(0x9cb2aa, 10)], [0x33, 0xc0, 0x38, 0x44, 0x24, 0x10, 0x0f, 0x95, 0xc0, 0x89]);
  // R14 0x9cb33b: cmp [esi],4 ; jne (old-format store gate)
  assert.deepEqual([...peAt(0x9cb33b, 5)], [0x83, 0x3e, 0x04, 0x75, 0x22]);
  // T1 0x9c9c24: mov [ebp-0x458],0xe (0xe loop count)
  assert.deepEqual([...peAt(0x9c9c24, 10)], [0xc7, 0x85, 0xa8, 0xfb, 0xff, 0xff, 0x0e, 0x00, 0x00, 0x00]);
  // T2 0x9c9c57: sub [ebp-0x458],1 ; jne 0x9c9c30 (0xe loop countdown)
  assert.deepEqual([...peAt(0x9c9c57, 8)], [0x83, 0xad, 0xa8, 0xfb, 0xff, 0xff, 0x01, 0x75]);
  // T3 0x9c9d6c: mov [ebp-0x458],0x14 (0x14 loop count)
  assert.deepEqual([...peAt(0x9c9d6c, 10)], [0xc7, 0x85, 0xa8, 0xfb, 0xff, 0xff, 0x14, 0x00, 0x00, 0x00]);
  // T4 0x9c9d95: sub [ebp-0x458],1 ; jne 0x9c9d84 (0x14 loop countdown)
  assert.deepEqual([...peAt(0x9c9d95, 8)], [0x83, 0xad, 0xa8, 0xfb, 0xff, 0xff, 0x01, 0x75]);
  // 0x9cb5ee: call 0x9cb020 (SELF-recursion, E8 rel32)
  assert.deepEqual([...peAt(0x9cb5ee, 5)], [0xe8, 0x2d, 0xfa, 0xff, 0xff]);
  // 0x9cb620: next body prologue (SEH + GS cookie)
  assert.deepEqual([...peAt(0x9cb620, 8)], [0x55, 0x8b, 0xec, 0x6a, 0xff, 0x68, 0x00, 0xf3]);
  // pill reader 0x9cb620 laws (ABI v8)
  // V1 io-ready: test al,al ; jne FAIL (4 sites)
  assert.deepEqual([...peAt(0x9cb65d, 8)], [0x84, 0xc0, 0x0f, 0x85, 0x13, 0x0b, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9cbe30, 8)], [0x84, 0xc0, 0x0f, 0x85, 0x40, 0x03, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9cbec0, 8)], [0x84, 0xc0, 0x0f, 0x85, 0xb0, 0x02, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9cbf70, 8)], [0x84, 0xc0, 0x0f, 0x85, 0x00, 0x02, 0x00, 0x00]);
  // V2 0x9cba1b: cmp [esi+8],0x3d ; jb  (io gate)
  assert.deepEqual([...peAt(0x9cba1b, 6)], [0x83, 0x7e, 0x08, 0x3d, 0x72, 0x25]);
  // V3 0x9cbb0a: cmp [esi+8],0x4b ; jb
  assert.deepEqual([...peAt(0x9cbb0a, 6)], [0x83, 0x7e, 0x08, 0x4b, 0x72, 0x27]);
  // V4 0x9cbb77/0x9cbb85: cmp [esi+8],0x7b ; jb rel32
  assert.deepEqual([...peAt(0x9cbb77, 4)], [0x83, 0x7e, 0x08, 0x7b]);
  assert.deepEqual([...peAt(0x9cbb85, 6)], [0x0f, 0x82, 0xf9, 0x00, 0x00, 0x00]);
  // V5 0x9cb671/0x9cb67e: cmp [esi+8],0x7d ; jb rel32
  assert.deepEqual([...peAt(0x9cb671, 4)], [0x83, 0x7e, 0x08, 0x7d]);
  assert.deepEqual([...peAt(0x9cb67e, 6)], [0x0f, 0x82, 0xa5, 0x00, 0x00, 0x00]);
  // V6 0x9cbd86/0x9cbd8d: cmp [eax+0x1fdf0],0x21 ; jb (gs gate)
  assert.deepEqual([...peAt(0x9cbd86, 7)], [0x83, 0xb8, 0xf0, 0xfd, 0x01, 0x00, 0x21]);
  assert.deepEqual([...peAt(0x9cbd8d, 2)], [0x72, 0x25]);
  // V7 0x9cb835/0x9cb83f: cmp [eax+0x1fdf0],0x3f ; jb rel32
  assert.deepEqual([...peAt(0x9cb835, 7)], [0x83, 0xb8, 0xf0, 0xfd, 0x01, 0x00, 0x3f]);
  assert.deepEqual([...peAt(0x9cb83f, 6)], [0x0f, 0x82, 0xcf, 0x00, 0x00, 0x00]);
  // V8 0x9cbfad/0x9cbfb4: cmp [eax+0x1fdf0],0x49 ; jb rel32
  assert.deepEqual([...peAt(0x9cbfad, 7)], [0x83, 0xb8, 0xf0, 0xfd, 0x01, 0x00, 0x49]);
  assert.deepEqual([...peAt(0x9cbfb4, 6)], [0x0f, 0x82, 0x05, 0x01, 0x00, 0x00]);
  // V9 0x9cb875/0x9cb87f: cmp [eax+0x1fdf0],0x82 ; jb
  assert.deepEqual([...peAt(0x9cb875, 10)], [0x81, 0xb8, 0xf0, 0xfd, 0x01, 0x00, 0x82, 0x00, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9cb87f, 2)], [0x72, 0x41]);
  // V10 0x9cbbb1: test eax,eax ; je rel32 (slot count gate)
  assert.deepEqual([...peAt(0x9cbbb1, 8)], [0x85, 0xc0, 0x0f, 0x84, 0xfe, 0x01, 0x00, 0x00]);
  // V11 0x9cbb3a: test eax,eax ; je +0x22 (string-copy ptr gate)
  assert.deepEqual([...peAt(0x9cbb3a, 4)], [0x85, 0xc0, 0x74, 0x22]);
  // V12 0x9cbc57/0x9cbc5f/0x9cbc62: cmp [ecx+0xc],0 ; setg al ; mov [ecx+0x18],al
  assert.deepEqual([...peAt(0x9cbc57, 4)], [0x83, 0x79, 0x0c, 0x00]);
  assert.deepEqual([...peAt(0x9cbc5f, 4)], [0x0f, 0x9f, 0xc0, 0x88]);
  // V13 0x9cbdc0/0x9cbdc6: cmp ecx,0x3800 ; jb rel32 (slot-table bound)
  assert.deepEqual([...peAt(0x9cbdc0, 6)], [0x81, 0xf9, 0x00, 0x38, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9cbdc6, 6)], [0x0f, 0x82, 0xa4, 0xfd, 0xff, 0xff]);
  // V14/V15 0x9cbe08/0x9cbe13/0x9cbe50/0x9cbe53: +0x74 array entry + bound
  assert.deepEqual([...peAt(0x9cbe08, 4)], [0x83, 0x7d, 0xdc, 0x00]);
  assert.deepEqual([...peAt(0x9cbe13, 2)], [0x76, 0x40]);
  assert.deepEqual([...peAt(0x9cbe50, 4)], [0x3b, 0x45, 0xdc, 0x72]);
  // V16/V17 0x9cbf43/0x9cbf4e/0x9cbf93/0x9cbf96: +0x88 array entry + bound
  assert.deepEqual([...peAt(0x9cbf43, 4)], [0x83, 0x7d, 0xd8, 0x00]);
  assert.deepEqual([...peAt(0x9cbf4e, 2)], [0x76, 0x48]);
  assert.deepEqual([...peAt(0x9cbf93, 4)], [0x3b, 0x45, 0xd8, 0x72]);
  // V18 0x9cc11b: mov [ebp+0x10],8 (fixed-8 count)
  assert.deepEqual([...peAt(0x9cc11b, 7)], [0xc7, 0x45, 0x10, 0x08, 0x00, 0x00, 0x00]);
  // V19 0x9cc145/0x9cc154: sub [ebp+0x10],1 ; jne (fixed-8 countdown)
  assert.deepEqual([...peAt(0x9cc145, 4)], [0x83, 0x6d, 0x10, 0x01]);
  assert.deepEqual([...peAt(0x9cc154, 2)], [0x75, 0xcc]);
  // V20 0x9cb93b: cmp byte [ebp+0x13],0 ; je ; or [edi+0x44],1 (flag bit0)
  assert.deepEqual([...peAt(0x9cb93b, 10)], [0x80, 0x7d, 0x13, 0x00, 0x74, 0x04, 0x83, 0x4f, 0x44, 0x01]);
  // V20 or-bit twins: or [edi],2/4/8/0x10 ; or [ecx],0x20
  assert.deepEqual([...peAt(0x9cb994, 3)], [0x83, 0x0f, 0x02]);
  assert.deepEqual([...peAt(0x9cb9c0, 3)], [0x83, 0x0f, 0x04]);
  assert.deepEqual([...peAt(0x9cb9ec, 3)], [0x83, 0x0f, 0x08]);
  assert.deepEqual([...peAt(0x9cba18, 3)], [0x83, 0x0f, 0x10]);
  assert.deepEqual([...peAt(0x9cba72, 3)], [0x83, 0x09, 0x20]);
  // body edges: main epilogue ret 0xc @0x9cc0bc, fail ret 0xc @0x9cc18b,
  // int3 pad 0x9cc18e.., reader-row calls @0x9cbe40/@0x9cbf83 (E8 to 0x9cb020)
  assert.deepEqual([...peAt(0x9cc0bc, 3)], [0xc2, 0x0c, 0x00]);
  assert.deepEqual([...peAt(0x9cc18b, 3)], [0xc2, 0x0c, 0x00]);
  assert.deepEqual([...peAt(0x9cc18e, 4)], [0xcc, 0xcc, 0xcc, 0xcc]);
  assert.deepEqual([...peAt(0x9cbe40, 5)], [0xe8, 0xdb, 0xf1, 0xff, 0xff]);
  assert.deepEqual([...peAt(0x9cbf83, 5)], [0xe8, 0x98, 0xf0, 0xff, 0xff]);
});

test("Wasm zero-import exports match JS oracle on fixed cases (ABI v3)", () => {
  const exp = loadExports();
  const M = MODEL;

  // P1 steam_present — FULL-dword; 0x100 IS present
  for (const v of [1, 0x100, 0x1ff, 0xffffffff]) {
    assert.equal(exp["9c8350SteamPresent"](v) >>> 0, 1);
    assert.equal(M.gs9c8350SteamPresent(v), 1);
  }
  assert.equal(exp["9c8350SteamPresent"](0) >>> 0, 0);
  assert.equal(M.gs9c8350SteamPresent(0), 0);

  // P2 cloud_gate_ok — LOW-BYTE mask; 0x100 -> byte 0x00 -> closed
  for (const v of [1, 0xff, 0x101]) {
    assert.equal(exp["9c8350CloudGateOk"](v) >>> 0, 1);
    assert.equal(M.gs9c8350CloudGateOk(v), 1);
  }
  assert.equal(exp["9c8350CloudGateOk"](0) >>> 0, 0);
  assert.equal(exp["9c8350CloudGateOk"](0x100) >>> 0, 0, "0x100 low byte is 0");
  assert.equal(exp["9c8350CloudGateOk"](0x200) >>> 0, 0);
  assert.equal(M.gs9c8350CloudGateOk(0x100), 0);

  // P3 use_steam_arm — AND (mutant: OR would flip the (1,0) row)
  assert.equal(exp["9c8350UseSteamArm"](1, 1) >>> 0, 1);
  assert.equal(exp["9c8350UseSteamArm"](1, 0) >>> 0, 0);
  assert.equal(exp["9c8350UseSteamArm"](0, 1) >>> 0, 0);
  assert.equal(exp["9c8350UseSteamArm"](0, 0) >>> 0, 0);
  assert.equal(exp["9c8350UseSteamArm"](0x100, 1) >>> 0, 1);
  assert.equal(M.gs9c8350UseSteamArm(1, 0), 0);

  // P4 statname_heap_used — FULL-dword UNSIGNED vs 0x10; 0x100 -> heap
  assert.equal(exp["9c8350StatnameHeapUsed"](0) >>> 0, 0);
  assert.equal(exp["9c8350StatnameHeapUsed"](0xf) >>> 0, 0, "0xf inline");
  assert.equal(exp["9c8350StatnameHeapUsed"](0x10) >>> 0, 1, "0x10 heap");
  assert.equal(exp["9c8350StatnameHeapUsed"](0x100) >>> 0, 1, "0x100 heap (byte-narrow would flip)");
  assert.equal(exp["9c8350StatnameHeapUsed"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8350StatnameHeapUsed(0x100), 1);

  // P5 statname_ptr — mem law: inline addr (this_off + buf off, u32 wrap)
  // vs heap load32 at mem + this_off + buf off
  const VIEW = new DataView(exp.memory.buffer);
  const memBase = 0x10000; // wasm memory is 16 MB initial; our arena stays clear
  const oracleMem = new DataView(exp.memory.buffer, memBase); // oracle mem base == wasm mem param
  VIEW.setUint32(memBase + 0x1fdf4, 0x12345678, true);
  assert.equal(exp["9c8350StatnamePtr"](memBase, 0, 0xf) >>> 0, 0x1fdf4,
    "inline arm returns this_off + 0x1fdf4");
  assert.equal(exp["9c8350StatnamePtr"](memBase, 0, 0x10) >>> 0, 0x12345678,
    "heap arm loads the pointer dword at mem + this_off + 0x1fdf4");
  assert.equal(exp["9c8350StatnamePtr"](memBase, 0xf0000000, 0xf) >>> 0, (0xf0000000 + 0x1fdf4) >>> 0,
    "offset add wraps u32");
  assert.equal(exp["9c8350StatnamePtr"](memBase, 0, 0x100) >>> 0, 0x12345678,
    "WIDE size still loads the heap pointer");
  assert.equal(M.gs9c8350StatnamePtr(oracleMem, 0, 0x10), 0x12345678);

  // P6 steam_arm_continue — LOW-BYTE result gate; 0x100 -> AL byte 0 -> tail
  assert.equal(exp["9c8350SteamArmContinue"](1) >>> 0, 1);
  assert.equal(exp["9c8350SteamArmContinue"](0) >>> 0, 0);
  assert.equal(exp["9c8350SteamArmContinue"](0x100) >>> 0, 0, "0x100 AL byte is 0");
  assert.equal(exp["9c8350SteamArmContinue"](0x101) >>> 0, 1);
  assert.equal(exp["9c8350SteamArmContinue"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8350SteamArmContinue(0x100), 0);

  // P7 filename_present — FULL-dword; mirror of exit v46 on the same field
  assert.equal(exp["9c8350FilenamePresent"](0) >>> 0, 0);
  assert.equal(exp["9c8350FilenamePresent"](1) >>> 0, 1);
  assert.equal(exp["9c8350FilenamePresent"](0x100) >>> 0, 1, "0x100 size present");
  assert.equal(exp["9c8350FilenamePresent"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8350FilenamePresent(0), 0);
  assert.equal(M.gs9c8350FilenamePresent(0x100), 1);

  // P8 filename_ptr — mem law: inline addr (this_off + buf off) vs heap
  // load32 at mem + this_off + 0x1fdac
  VIEW.setUint32(memBase + 0x1fdac, 0xdeadbeef, true);
  assert.equal(exp["9c8350FilenamePtr"](memBase, 0, 0xf) >>> 0, 0x1fdac);
  assert.equal(exp["9c8350FilenamePtr"](memBase, 0, 0x10) >>> 0, 0xdeadbeef);
  assert.equal(exp["9c8350FilenamePtr"](memBase, 0x80000000, 0xf) >>> 0, (0x80000000 + 0x1fdac) >>> 0);
  assert.equal(M.gs9c8350FilenamePtr(oracleMem, 0, 0x10), 0xdeadbeef);

  // ---- DeleteRerun 0x009c8410 (ABI v2) ----
  // Q1 steam_present — FULL-dword; 0x100 IS present
  for (const v of [1, 0x100, 0x1ff, 0xffffffff]) {
    assert.equal(exp["9c8410SteamPresent"](v) >>> 0, 1);
    assert.equal(M.gs9c8410SteamPresent(v), 1);
  }
  assert.equal(exp["9c8410SteamPresent"](0) >>> 0, 0);
  assert.equal(M.gs9c8410SteamPresent(0), 0);

  // Q2 cloud_gate_ok — LOW-BYTE mask; 0x100 -> byte 0x00 -> closed
  for (const v of [1, 0xff, 0x101]) {
    assert.equal(exp["9c8410CloudGateOk"](v) >>> 0, 1);
    assert.equal(M.gs9c8410CloudGateOk(v), 1);
  }
  assert.equal(exp["9c8410CloudGateOk"](0) >>> 0, 0);
  assert.equal(exp["9c8410CloudGateOk"](0x100) >>> 0, 0, "0x100 low byte is 0");
  assert.equal(M.gs9c8410CloudGateOk(0x100), 0);

  // Q3 use_steam_arm — AND (mutant: OR would flip the (1,0) row)
  assert.equal(exp["9c8410UseSteamArm"](1, 1) >>> 0, 1);
  assert.equal(exp["9c8410UseSteamArm"](1, 0) >>> 0, 0);
  assert.equal(exp["9c8410UseSteamArm"](0, 1) >>> 0, 0);
  assert.equal(exp["9c8410UseSteamArm"](0, 0) >>> 0, 0);
  assert.equal(exp["9c8410UseSteamArm"](0x100, 1) >>> 0, 1);
  assert.equal(M.gs9c8410UseSteamArm(1, 0), 0);

  // Q4 statname_heap_used — FULL-dword UNSIGNED vs 0x10; 0x100 -> heap
  assert.equal(exp["9c8410StatnameHeapUsed"](0) >>> 0, 0);
  assert.equal(exp["9c8410StatnameHeapUsed"](0xf) >>> 0, 0, "0xf inline");
  assert.equal(exp["9c8410StatnameHeapUsed"](0x10) >>> 0, 1, "0x10 heap");
  assert.equal(exp["9c8410StatnameHeapUsed"](0x100) >>> 0, 1, "0x100 heap (byte-narrow would flip)");
  assert.equal(exp["9c8410StatnameHeapUsed"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8410StatnameHeapUsed(0x100), 1);

  // Q5 statname_ptr — mem law at 0x1fe0c
  VIEW.setUint32(memBase + 0x1fe0c, 0x12345678, true);
  assert.equal(exp["9c8410StatnamePtr"](memBase, 0, 0xf) >>> 0, 0x1fe0c,
    "inline arm returns this_off + 0x1fe0c");
  assert.equal(exp["9c8410StatnamePtr"](memBase, 0, 0x10) >>> 0, 0x12345678,
    "heap arm loads the pointer dword at mem + this_off + 0x1fe0c");
  assert.equal(exp["9c8410StatnamePtr"](memBase, 0xf0000000, 0xf) >>> 0, (0xf0000000 + 0x1fe0c) >>> 0,
    "offset add wraps u32");
  assert.equal(exp["9c8410StatnamePtr"](memBase, 0, 0x100) >>> 0, 0x12345678,
    "WIDE size still loads the heap pointer");
  assert.equal(M.gs9c8410StatnamePtr(oracleMem, 0, 0x10), 0x12345678);

  // Q6 steam_arm_continue — LOW-BYTE result gate; 0x100 -> AL byte 0 -> tail
  assert.equal(exp["9c8410SteamArmContinue"](1) >>> 0, 1);
  assert.equal(exp["9c8410SteamArmContinue"](0) >>> 0, 0);
  assert.equal(exp["9c8410SteamArmContinue"](0x100) >>> 0, 0, "0x100 AL byte is 0");
  assert.equal(exp["9c8410SteamArmContinue"](0x101) >>> 0, 1);
  assert.equal(exp["9c8410SteamArmContinue"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8410SteamArmContinue(0x100), 0);

  // Q7 filename_present — FULL-dword on the SHARED +0x1fdbc field
  assert.equal(exp["9c8410FilenamePresent"](0) >>> 0, 0);
  assert.equal(exp["9c8410FilenamePresent"](1) >>> 0, 1);
  assert.equal(exp["9c8410FilenamePresent"](0x100) >>> 0, 1, "0x100 size present");
  assert.equal(exp["9c8410FilenamePresent"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8410FilenamePresent(0), 0);
  assert.equal(M.gs9c8410FilenamePresent(0x100), 1);

  // Q8 filename_ptr — mem law at 0x1fdc4
  VIEW.setUint32(memBase + 0x1fdc4, 0xdeadbeef, true);
  assert.equal(exp["9c8410FilenamePtr"](memBase, 0, 0xf) >>> 0, 0x1fdc4);
  assert.equal(exp["9c8410FilenamePtr"](memBase, 0, 0x10) >>> 0, 0xdeadbeef);
  assert.equal(exp["9c8410FilenamePtr"](memBase, 0x80000000, 0xf) >>> 0, (0x80000000 + 0x1fdc4) >>> 0);
  assert.equal(M.gs9c8410FilenamePtr(oracleMem, 0, 0x10), 0xdeadbeef);
});

test("Wasm/JS accessors and constants agree (ABI v4)", () => {
  const exp = loadExports();
  assert.equal(exp["9c8350Va"]() >>> 0, MODEL.GS9C8350_VA);
  assert.equal(exp["9c8350EndVa"]() >>> 0, MODEL.GS9C8350_END_VA);
  assert.equal(exp["9c8350BodyBytes"]() >>> 0, MODEL.GS9C8350_BODY_BYTES);
  assert.equal(exp["9c8350NextVa"]() >>> 0, MODEL.GS9C8350_NEXT_VA);
  assert.equal(exp["9c8350TailVa"]() >>> 0, MODEL.GS9C8350_TAIL_VA);
  assert.equal(exp["9c8350SteamIat"]() >>> 0, MODEL.GS9C8350_STEAM_IAT);
  assert.equal(exp["9c8350SteamArg"]() >>> 0, MODEL.GS9C8350_STEAM_ARG);
  assert.equal(exp["9c8350RemoveIat"]() >>> 0, MODEL.GS9C8350_REMOVE_IAT);
  assert.equal(exp["9c8350LoggerVa"]() >>> 0, MODEL.GS9C8350_LOGGER_VA);
  assert.equal(exp["9c8350LogStrVa"]() >>> 0, MODEL.GS9C8350_LOG_STR_VA);
  assert.equal(exp["9c8350MgrGlobalDat"]() >>> 0, MODEL.GS9C8350_MGR_GLOBAL_DAT);
  assert.equal(exp["9c8350CloudOff"]() >>> 0, MODEL.GS9C8350_CLOUD_OFF);
  assert.equal(exp["9c8350FilenameSizeOff"]() >>> 0, MODEL.GS9C8350_FILENAME_SIZE_OFF);
  assert.equal(exp["9c8350FilenameBufOff"]() >>> 0, MODEL.GS9C8350_FILENAME_BUF_OFF);
  assert.equal(exp["9c8350StatnameSizeOff"]() >>> 0, MODEL.GS9C8350_STATNAME_SIZE_OFF);
  assert.equal(exp["9c8350StatnameBufOff"]() >>> 0, MODEL.GS9C8350_STATNAME_BUF_OFF);
  assert.equal(exp["9c8350SsoThreshold"]() >>> 0, MODEL.GS9C8350_SSO_THRESHOLD);
  assert.equal(exp["9c8350Vtbl34Slot"]() >>> 0, MODEL.GS9C8350_VTBL34_SLOT);
  assert.equal(exp["9c8350Vtbl18Slot"]() >>> 0, MODEL.GS9C8350_VTBL18_SLOT);
  assert.equal(exp["9c8350CallerCount"]() >>> 0, MODEL.GS9C8350_CALLER_COUNT);
  assert.equal(exp["9c8350CallerVaAt"](0) >>> 0, MODEL.GS9C8350_CALLER_VAS[0]);
  assert.equal(exp["9c8350CallerVaAt"](4) >>> 0, MODEL.GS9C8350_CALLER_VAS[4]);
  assert.equal(exp["9c8350CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");

  // DeleteRerun 0x009c8410 accessors
  assert.equal(exp["9c8410Va"]() >>> 0, MODEL.GS9C8410_VA);
  assert.equal(exp["9c8410EndVa"]() >>> 0, MODEL.GS9C8410_END_VA);
  assert.equal(exp["9c8410BodyBytes"]() >>> 0, MODEL.GS9C8410_BODY_BYTES);
  assert.equal(exp["9c8410NextVa"]() >>> 0, MODEL.GS9C8410_NEXT_VA);
  assert.equal(exp["9c8410SteamRetVa"]() >>> 0, MODEL.GS9C8410_STEAM_RET_VA);
  assert.equal(exp["9c8410TailRetVa"]() >>> 0, MODEL.GS9C8410_TAIL_RET_VA);
  assert.equal(exp["9c8410SteamIat"]() >>> 0, MODEL.GS9C8410_STEAM_IAT);
  assert.equal(exp["9c8410SteamArg"]() >>> 0, MODEL.GS9C8410_STEAM_ARG);
  assert.equal(exp["9c8410RemoveIat"]() >>> 0, MODEL.GS9C8410_REMOVE_IAT);
  assert.equal(exp["9c8410LoggerVa"]() >>> 0, MODEL.GS9C8410_LOGGER_VA);
  assert.equal(exp["9c8410LogStrVa"]() >>> 0, MODEL.GS9C8410_LOG_STR_VA);
  assert.equal(exp["9c8410MgrGlobalDat"]() >>> 0, MODEL.GS9C8410_MGR_GLOBAL_DAT);
  assert.equal(exp["9c8410CloudOff"]() >>> 0, MODEL.GS9C8410_CLOUD_OFF);
  assert.equal(exp["9c8410FilenameEmptySizeOff"]() >>> 0, MODEL.GS9C8410_FILENAME_EMPTY_SIZE_OFF);
  assert.equal(exp["9c8410FilenameSizeOff"]() >>> 0, MODEL.GS9C8410_FILENAME_SIZE_OFF);
  assert.equal(exp["9c8410FilenameBufOff"]() >>> 0, MODEL.GS9C8410_FILENAME_BUF_OFF);
  assert.equal(exp["9c8410StatnameSizeOff"]() >>> 0, MODEL.GS9C8410_STATNAME_SIZE_OFF);
  assert.equal(exp["9c8410StatnameBufOff"]() >>> 0, MODEL.GS9C8410_STATNAME_BUF_OFF);
  assert.equal(exp["9c8410SsoThreshold"]() >>> 0, MODEL.GS9C8410_SSO_THRESHOLD);
  assert.equal(exp["9c8410Vtbl34Slot"]() >>> 0, MODEL.GS9C8410_VTBL34_SLOT);
  assert.equal(exp["9c8410Vtbl18Slot"]() >>> 0, MODEL.GS9C8410_VTBL18_SLOT);
  assert.equal(exp["9c8410CallerCount"]() >>> 0, MODEL.GS9C8410_CALLER_COUNT);
  assert.equal(exp["9c8410CallerVaAt"](0) >>> 0, MODEL.GS9C8410_CALLER_VAS[0]);
  assert.equal(exp["9c8410CallerVaAt"](4) >>> 0, MODEL.GS9C8410_CALLER_VAS[4]);
  assert.equal(exp["9c8410CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");

  // write 0x009c9340 typed-host lease accessors
  assert.equal(exp["9c9340Va"]() >>> 0, MODEL.GS9C9340_VA);
  assert.equal(exp["9c9340EndVa"]() >>> 0, MODEL.GS9C9340_END_VA);
  assert.equal(exp["9c9340BodyBytes"]() >>> 0, MODEL.GS9C9340_BODY_BYTES);
  assert.equal(exp["9c9340NextVa"]() >>> 0, MODEL.GS9C9340_NEXT_VA);
  assert.equal(exp["9c9340StreamVtblSlot"]() >>> 0, MODEL.GS9C9340_STREAM_VTBL_SLOT);
  assert.equal(exp["9c9340RowWriterVa"]() >>> 0, MODEL.GS9C9340_ROW_WRITER_VA);
  assert.equal(exp["9c9340StreamInitVa"]() >>> 0, MODEL.GS9C9340_STREAM_INIT_VA);
  assert.equal(exp["9c9340GsrFormatStrVa"]() >>> 0, MODEL.GS9C9340_GSR_FORMAT_STR_VA);
  assert.equal(exp["9c9340SeededLogStrVa"]() >>> 0, MODEL.GS9C9340_SEEDED_LOG_STR_VA);
  assert.equal(exp["9c9340LoggerVa"]() >>> 0, MODEL.GS9C9340_LOGGER_VA);
  assert.equal(exp["9c9340SeHandlerDat"]() >>> 0, MODEL.GS9C9340_SE_HANDLER_DAT);
  assert.equal(exp["9c9340GsCookieDat"]() >>> 0, MODEL.GS9C9340_GS_COOKIE_DAT);
  assert.equal(exp["9c9340CookieTailVa"]() >>> 0, MODEL.GS9C9340_COOKIE_TAIL_VA);
  assert.equal(exp["9c9340InvalidParamIat"]() >>> 0, MODEL.GS9C9340_INVALID_PARAM_IAT);
  assert.equal(exp["9c9340FreeVa"]() >>> 0, MODEL.GS9C9340_FREE_VA);
  assert.equal(exp["9c9340GameStateIoOff"]() >>> 0, MODEL.GS9C9340_GAME_STATE_IO_OFF);
  assert.equal(exp["9c9340Serializer8d20Va"]() >>> 0, MODEL.GS9C9340_SERIALIZER_8D20_VA);
  assert.equal(exp["9c9340Serializer87e0Va"]() >>> 0, MODEL.GS9C9340_SERIALIZER_87E0_VA);
  assert.equal(exp["9c9340Serializer85d0Va"]() >>> 0, MODEL.GS9C9340_SERIALIZER_85D0_VA);
  assert.equal(exp["9c9340Leaf9d77e0Va"]() >>> 0, MODEL.GS9C9340_LEAF_9D77E0_VA);
  assert.equal(exp["9c9340Leaf9d45c0Va"]() >>> 0, MODEL.GS9C9340_LEAF_9D45C0_VA);
  assert.equal(exp["9c9340Leaf9cec80Va"]() >>> 0, MODEL.GS9C9340_LEAF_9CEC80_VA);
  assert.equal(exp["9c9340Leaf9d84d0Va"]() >>> 0, MODEL.GS9C9340_LEAF_9D84D0_VA);
  assert.equal(exp["9c9340Leaf9eb5b0Va"]() >>> 0, MODEL.GS9C9340_LEAF_9EB5B0_VA);
  assert.equal(exp["9c9340Leaf4288a0Va"]() >>> 0, MODEL.GS9C9340_LEAF_4288A0_VA);
  assert.equal(exp["9c9340Leaf708ae0Va"]() >>> 0, MODEL.GS9C9340_LEAF_708AE0_VA);
  assert.equal(exp["9c9340LeafAf05e5Va"]() >>> 0, MODEL.GS9C9340_LEAF_AF05E5_VA);
  assert.equal(exp["9c9340CallerCount"]() >>> 0, MODEL.GS9C9340_CALLER_COUNT);
  assert.equal(exp["9c9340CallerVaAt"](0) >>> 0, MODEL.GS9C9340_CALLER_VAS[0]);
  assert.equal(exp["9c9340CallerVaAt"](2) >>> 0, MODEL.GS9C9340_CALLER_VAS[2]);
  assert.equal(exp["9c9340CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");

  assert.equal(exp["pureHelpersAbiVersion"](), 20, "wasm ABI version");
  assert.equal(MODEL.GAME_STATE_PURE_ABI_VERSION, 20);
  // header<->model agreement on the cross-family shared offsets
  assert.equal(MODEL.GS9C8350_CLOUD_OFF, 0x2a3a4);
  assert.equal(MODEL.GS9C8350_FILENAME_SIZE_OFF, 0x1fdbc);
  assert.equal(MODEL.GS9C8410_FILENAME_EMPTY_SIZE_OFF, 0x1fdbc);
  assert.equal(MODEL.GS9C9340_GAME_STATE_IO_OFF, 0x1fe24);

  // ABI v4: save-orchestrator host A accessors
  assert.equal(exp["9cad40Va"]() >>> 0, MODEL.GS9CAD40_VA);
  assert.equal(exp["9cad40EndVa"]() >>> 0, MODEL.GS9CAD40_END_VA);
  assert.equal(exp["9cad40BodyBytes"]() >>> 0, MODEL.GS9CAD40_BODY_BYTES);
  assert.equal(exp["9cad40NextVa"]() >>> 0, MODEL.GS9CAD40_NEXT_VA);
  assert.equal(exp["9cad40IoDtorGateVa"]() >>> 0, MODEL.GS9CAD40_IO_DTOR_GATE_VA);
  assert.equal(exp["9cad40PoolSelectVa"]() >>> 0, MODEL.GS9CAD40_POOL_SELECT_VA);
  assert.equal(exp["9cad40NameGateVa"]() >>> 0, MODEL.GS9CAD40_NAME_GATE_VA);
  assert.equal(exp["9cad40OpenGateVa"]() >>> 0, MODEL.GS9CAD40_OPEN_GATE_VA);
  assert.equal(exp["9cad40WriteCallVa"]() >>> 0, MODEL.GS9CAD40_WRITE_CALL_VA);
  assert.equal(exp["9cad40StatnameSsoGateVa"]() >>> 0, MODEL.GS9CAD40_STATNAME_SSO_GATE_VA);
  assert.equal(exp["9cad40CloseCallVa"]() >>> 0, MODEL.GS9CAD40_CLOSE_CALL_VA);
  assert.equal(exp["9cad40FailLogCallVa"]() >>> 0, MODEL.GS9CAD40_FAIL_LOG_CALL_VA);
  assert.equal(exp["9cad40FailCloseCallVa"]() >>> 0, MODEL.GS9CAD40_FAIL_CLOSE_CALL_VA);
  assert.equal(exp["9cad40LogStrVa"]() >>> 0, MODEL.GS9CAD40_LOG_STR_VA);
  assert.equal(exp["9cad40CallerCount"]() >>> 0, MODEL.GS9CAD40_CALLER_COUNT);
  assert.equal(exp["9cad40CallerVaAt"](0) >>> 0, MODEL.GS9CAD40_CALLER_VAS[0]);
  assert.equal(exp["9cad40CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");

  // ABI v4: host B accessors
  assert.equal(exp["9caea0Va"]() >>> 0, MODEL.GS9CAEA0_VA);
  assert.equal(exp["9caea0EndVa"]() >>> 0, MODEL.GS9CAEA0_END_VA);
  assert.equal(exp["9caea0BodyBytes"]() >>> 0, MODEL.GS9CAEA0_BODY_BYTES);
  assert.equal(exp["9caea0NextVa"]() >>> 0, MODEL.GS9CAEA0_NEXT_VA);
  assert.equal(exp["9caea0IoDtorGateVa"]() >>> 0, MODEL.GS9CAEA0_IO_DTOR_GATE_VA);
  assert.equal(exp["9caea0PoolSelectVa"]() >>> 0, MODEL.GS9CAEA0_POOL_SELECT_VA);
  assert.equal(exp["9caea0RerunGateVa"]() >>> 0, MODEL.GS9CAEA0_RERUN_GATE_VA);
  assert.equal(exp["9caea0OpenGateVa"]() >>> 0, MODEL.GS9CAEA0_OPEN_GATE_VA);
  assert.equal(exp["9caea0RerunCallVa"]() >>> 0, MODEL.GS9CAEA0_RERUN_CALL_VA);
  assert.equal(exp["9caea0SuccessGateVa"]() >>> 0, MODEL.GS9CAEA0_SUCCESS_GATE_VA);
  assert.equal(exp["9caea0SuccessStoreVa"]() >>> 0, MODEL.GS9CAEA0_SUCCESS_STORE_VA);
  assert.equal(exp["9caea0DeleteRerunCallVa"]() >>> 0, MODEL.GS9CAEA0_DELETE_RERUN_CALL_VA);
  assert.equal(exp["9caea0RerunFlagWordOff"]() >>> 0, MODEL.GS9CAEA0_RERUN_FLAG_WORD_OFF);
  assert.equal(exp["9caea0RerunSuccessByteOff"]() >>> 0, MODEL.GS9CAEA0_RERUN_SUCCESS_BYTE_OFF);
  assert.equal(exp["9caea0RerunStatnameBufOff"]() >>> 0, MODEL.GS9CAEA0_RERUN_STATNAME_BUF_OFF);
  assert.equal(exp["9caea0RerunStatnameSizeOff"]() >>> 0, MODEL.GS9CAEA0_RERUN_STATNAME_SIZE_OFF);
  assert.equal(exp["9caea0StatnameSsoGateVa"]() >>> 0, MODEL.GS9CAEA0_STATNAME_SSO_GATE_VA);
  assert.equal(exp["9caea0LogStrVa"]() >>> 0, MODEL.GS9CAEA0_LOG_STR_VA);
  assert.equal(exp["9caea0CallerCount"]() >>> 0, MODEL.GS9CAEA0_CALLER_COUNT);
  assert.equal(exp["9caea0CallerVaAt"](0) >>> 0, MODEL.GS9CAEA0_CALLER_VAS[0]);
  assert.equal(exp["9caea0CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");

  // ABI v4: shared GameStateIO / write-record constants
  assert.equal(exp["ioVtable"]() >>> 0, MODEL.GS_IO_VTABLE);
  assert.equal(exp["ioCtorVersion"]() >>> 0, MODEL.GS_IO_CTOR_VERSION);
  assert.equal(exp["ioAllocSize"]() >>> 0, MODEL.GS_IO_ALLOC_SIZE);
  assert.equal(exp["ioAllocIat"]() >>> 0, MODEL.GS_IO_ALLOC_IAT);
  assert.equal(exp["ioFailAllocVa"]() >>> 0, MODEL.GS_IO_FAIL_ALLOC_VA);
  assert.equal(exp["ioChecksumVa"]() >>> 0, MODEL.GS_IO_CHECKSUM_VA);
  assert.equal(exp["ioChecksumSize"]() >>> 0, MODEL.GS_IO_CHECKSUM_SIZE);
  assert.equal(exp["ioPoolGlobalDat"]() >>> 0, MODEL.GS_IO_POOL_GLOBAL_DAT);
  assert.equal(exp["ioPoolFallback"]() >>> 0, MODEL.GS_IO_POOL_FALLBACK);
  assert.equal(exp["ioPoolStep"]() >>> 0, MODEL.GS_IO_POOL_STEP);
  assert.equal(exp["ioVtblOpenSlot"]() >>> 0, MODEL.GS_IO_VTBL_OPEN_SLOT);
  assert.equal(exp["ioVtblCloseSlot"]() >>> 0, MODEL.GS_IO_VTBL_CLOSE_SLOT);
  assert.equal(exp["ioVtblRerunSlot"]() >>> 0, MODEL.GS_IO_VTBL_RERUN_SLOT);
  assert.equal(exp["ioVtblDtorSlot"]() >>> 0, MODEL.GS_IO_VTBL_DTOR_SLOT);
  assert.equal(exp["writeRecordSeed"]() >>> 0, MODEL.GS_WRITE_RECORD_SEED);
  assert.equal(exp["writeRecordFlags"]() >>> 0, MODEL.GS_WRITE_RECORD_FLAGS);

  // ABI v4: read_rerun lease + cluster spans + reader row
  assert.equal(exp["9d7d50Va"]() >>> 0, MODEL.GS9D7D50_VA);
  assert.equal(exp["9d7d50EndVa"]() >>> 0, MODEL.GS9D7D50_END_VA);
  assert.equal(exp["9d7d50BodyBytes"]() >>> 0, MODEL.GS9D7D50_BODY_BYTES);
  assert.equal(exp["9d7d50NextVa"]() >>> 0, MODEL.GS9D7D50_NEXT_VA);
  assert.equal(exp["9d7d50CallerCount"]() >>> 0, MODEL.GS9D7D50_CALLER_COUNT);
  assert.equal(exp["9d7d50CallerVaAt"](0) >>> 0, MODEL.GS9D7D50_CALLER_VAS[0]);
  assert.equal(exp["9d7d50CallerVaAt"](1) >>> 0, MODEL.GS9D7D50_CALLER_VAS[1]);
  assert.equal(exp["9d7d50CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");
  assert.equal(exp["9d7d50ChecksumXor"]() >>> 0, MODEL.GS9D7D50_CHECKSUM_XOR);
  assert.equal(exp["9d7d50ChecksumOff"]() >>> 0, MODEL.GS9D7D50_CHECKSUM_OFF);
  assert.equal(exp["9d7d50VersionOff"]() >>> 0, MODEL.GS9D7D50_VERSION_OFF);
  assert.equal(exp["9d7d50RerunSuccessByteOff"]() >>> 0, MODEL.GS9D7D50_RERUN_SUCCESS_BYTE_OFF);
  assert.equal(exp["9d7d50GsCookieDat"]() >>> 0, MODEL.GS9D7D50_GS_COOKIE_DAT);
  assert.equal(exp["9d7d50CookieTailVa"]() >>> 0, MODEL.GS9D7D50_COOKIE_TAIL_VA);
  assert.equal(exp["9d45c0EndVa"]() >>> 0, MODEL.GS9D45C0_END_VA);
  assert.equal(exp["9d45c0BodyBytes"]() >>> 0, MODEL.GS9D45C0_BODY_BYTES);
  assert.equal(exp["9d45c0NextVa"]() >>> 0, MODEL.GS9D45C0_NEXT_VA);
  assert.equal(exp["9d77e0EndVa"]() >>> 0, MODEL.GS9D77E0_END_VA);
  assert.equal(exp["9d77e0BodyBytes"]() >>> 0, MODEL.GS9D77E0_BODY_BYTES);
  assert.equal(exp["9d77e0NextVa"]() >>> 0, MODEL.GS9D77E0_NEXT_VA);
  assert.equal(exp["9cec80EndVa"]() >>> 0, MODEL.GS9CEC80_END_VA);
  assert.equal(exp["9cec80BodyBytes"]() >>> 0, MODEL.GS9CEC80_BODY_BYTES);
  assert.equal(exp["9cec80NextVa"]() >>> 0, MODEL.GS9CEC80_NEXT_VA);
  assert.equal(exp["9d84d0EndVa"]() >>> 0, MODEL.GS9D84D0_END_VA);
  assert.equal(exp["9d84d0BodyBytes"]() >>> 0, MODEL.GS9D84D0_BODY_BYTES);
  assert.equal(exp["9d84d0NextVa"]() >>> 0, MODEL.GS9D84D0_NEXT_VA);
  assert.equal(exp["9d84a0EndVa"]() >>> 0, MODEL.GS9D84A0_END_VA);
  assert.equal(exp["9d84a0BodyBytes"]() >>> 0, MODEL.GS9D84A0_BODY_BYTES);
  assert.equal(exp["9d84a0NextVa"]() >>> 0, MODEL.GS9D84A0_NEXT_VA);
  assert.equal(exp["9d8550EndVa"]() >>> 0, MODEL.GS9D8550_END_VA);
  assert.equal(exp["9d8550BodyBytes"]() >>> 0, MODEL.GS9D8550_BODY_BYTES);
  assert.equal(exp["9d8550NextVa"]() >>> 0, MODEL.GS9D8550_NEXT_VA);
  assert.equal(exp["9cb020Va"]() >>> 0, MODEL.GS_READER_ROW_NEXT_VA);
  assert.equal(exp["9cb020CallerCount"]() >>> 0, MODEL.gs9cb020CallerCount());
  assert.equal(exp["9cb020CallerVaAt"](3) >>> 0, MODEL.gs9cb020CallerVaAt(3));
  assert.equal(exp["9cb020CallerVaAt"](99) >>> 0, 0, "OOB index -> 0");
});

test("Wasm vs JS differential: randomized gates + SSO mem laws (ABI v2)", () => {
  const exp = loadExports();
  const M = MODEL;
  // deterministic full-u32 draws on the scalar gates
  for (let i = 0; i < 200; i++) {
    const steam = randU32();
    const cloud = randU32();
    const sizeStat = randU32();
    const sizeFile = randU32();
    const al = randU32();
    assert.equal(exp["9c8350SteamPresent"](steam) >>> 0, M.gs9c8350SteamPresent(steam),
      `steam_present(0x${steam.toString(16)})`);
    assert.equal(exp["9c8350CloudGateOk"](cloud) >>> 0, M.gs9c8350CloudGateOk(cloud),
      `cloud_gate_ok(0x${cloud.toString(16)})`);
    assert.equal(exp["9c8350StatnameHeapUsed"](sizeStat) >>> 0, M.gs9c8350StatnameHeapUsed(sizeStat),
      `statname_heap_used(0x${sizeStat.toString(16)})`);
    assert.equal(exp["9c8350FilenamePresent"](sizeFile) >>> 0, M.gs9c8350FilenamePresent(sizeFile),
      `filename_present(0x${sizeFile.toString(16)})`);
    assert.equal(exp["9c8350SteamArmContinue"](al) >>> 0, M.gs9c8350SteamArmContinue(al),
      `steam_arm_continue(0x${al.toString(16)})`);
    assert.equal(
      exp["9c8350UseSteamArm"](M.gs9c8350SteamPresent(steam), M.gs9c8350CloudGateOk(cloud)) >>> 0,
      M.gs9c8350UseSteamArm(M.gs9c8350SteamPresent(steam), M.gs9c8350CloudGateOk(cloud)),
    );
    // DeleteRerun (ABI v2) mirrors on its own offsets
    assert.equal(exp["9c8410SteamPresent"](steam) >>> 0, M.gs9c8410SteamPresent(steam),
      `rerun steam_present(0x${steam.toString(16)})`);
    assert.equal(exp["9c8410CloudGateOk"](cloud) >>> 0, M.gs9c8410CloudGateOk(cloud),
      `rerun cloud_gate_ok(0x${cloud.toString(16)})`);
    assert.equal(exp["9c8410StatnameHeapUsed"](sizeStat) >>> 0, M.gs9c8410StatnameHeapUsed(sizeStat),
      `rerun statname_heap_used(0x${sizeStat.toString(16)})`);
    assert.equal(exp["9c8410FilenamePresent"](sizeFile) >>> 0, M.gs9c8410FilenamePresent(sizeFile),
      `rerun filename_present(0x${sizeFile.toString(16)})`);
    assert.equal(exp["9c8410SteamArmContinue"](al) >>> 0, M.gs9c8410SteamArmContinue(al),
      `rerun steam_arm_continue(0x${al.toString(16)})`);
    assert.equal(
      exp["9c8410UseSteamArm"](M.gs9c8410SteamPresent(steam), M.gs9c8410CloudGateOk(cloud)) >>> 0,
      M.gs9c8410UseSteamArm(M.gs9c8410SteamPresent(steam), M.gs9c8410CloudGateOk(cloud)),
    );
  }
  // mem-law draws: build a small arena in wasm memory, write a heap pointer
  // at the stat-name and filename SSO buffer slots, cross-check wasm vs JS.
  // The heap arm ADDS mem + this_off + 0x1fdf4, so this_off stays small for
  // heap draws; wrap semantics get their own inline-arm draws below (the
  // inline arm never touches memory).
  const VIEW = new DataView(exp.memory.buffer);
  const memBase = 0x20000;
  const oracleMem = new DataView(exp.memory.buffer, memBase); // oracle mem base == wasm mem param
  for (let i = 0; i < 60; i++) {
    const thisOff = randU32() % 0x1000;
    const sizeStat = randU32();
    const sizeFile = randU32();
    const heapStat = randU32();
    const heapFile = randU32();
    VIEW.setUint32(memBase + 0x1fdf4, heapStat, true);
    VIEW.setUint32(memBase + 0x1fdac, heapFile, true);
    VIEW.setUint32(memBase + 0x1fe0c, heapStat, true);
    VIEW.setUint32(memBase + 0x1fdc4, heapFile, true);
    assert.equal(
      exp["9c8350StatnamePtr"](memBase, thisOff, sizeStat) >>> 0,
      M.gs9c8350StatnamePtr(oracleMem, thisOff, sizeStat),
      `statname_ptr(this=${thisOff.toString(16)}, size=${sizeStat.toString(16)})`,
    );
    assert.equal(
      exp["9c8350FilenamePtr"](memBase, thisOff, sizeFile) >>> 0,
      M.gs9c8350FilenamePtr(oracleMem, thisOff, sizeFile),
      `filename_ptr(this=${thisOff.toString(16)}, size=${sizeFile.toString(16)})`,
    );
    // DeleteRerun (ABI v2): same draws against the +0x1fe0c / +0x1fdc4 slots
    assert.equal(
      exp["9c8410StatnamePtr"](memBase, thisOff, sizeStat) >>> 0,
      M.gs9c8410StatnamePtr(oracleMem, thisOff, sizeStat),
      `rerun statname_ptr(this=${thisOff.toString(16)}, size=${sizeStat.toString(16)})`,
    );
    assert.equal(
      exp["9c8410FilenamePtr"](memBase, thisOff, sizeFile) >>> 0,
      M.gs9c8410FilenamePtr(oracleMem, thisOff, sizeFile),
      `rerun filename_ptr(this=${thisOff.toString(16)}, size=${sizeFile.toString(16)})`,
    );
  }
  // u32-wrap draws on the INLINE arms (no memory access by the wasm body)
  for (let i = 0; i < 40; i++) {
    const thisOff = randU32();
    assert.equal(
      exp["9c8350StatnamePtr"](memBase, thisOff, randU32() & 0xf) >>> 0,
      M.gs9c8350StatnamePtr(oracleMem, thisOff, randU32() & 0xf),
      `statname_ptr inline wrap this=${thisOff.toString(16)}`,
    );
    assert.equal(
      exp["9c8350FilenamePtr"](memBase, thisOff, randU32() & 0xf) >>> 0,
      M.gs9c8350FilenamePtr(oracleMem, thisOff, randU32() & 0xf),
      `filename_ptr inline wrap this=${thisOff.toString(16)}`,
    );
    assert.equal(
      exp["9c8410StatnamePtr"](memBase, thisOff, randU32() & 0xf) >>> 0,
      M.gs9c8410StatnamePtr(oracleMem, thisOff, randU32() & 0xf),
      `rerun statname_ptr inline wrap this=${thisOff.toString(16)}`,
    );
    assert.equal(
      exp["9c8410FilenamePtr"](memBase, thisOff, randU32() & 0xf) >>> 0,
      M.gs9c8410FilenamePtr(oracleMem, thisOff, randU32() & 0xf),
      `rerun filename_ptr inline wrap this=${thisOff.toString(16)}`,
    );
  }
});

test("v1/v2 guards are not vacuous (self-check)", () => {
  // each law must have at least one 0 and one 1 row over fixed boxes
  assert.notEqual(MODEL.gs9c8350SteamPresent(0), MODEL.gs9c8350SteamPresent(1));
  assert.notEqual(MODEL.gs9c8350CloudGateOk(0), MODEL.gs9c8350CloudGateOk(0xff));
  assert.notEqual(MODEL.gs9c8350UseSteamArm(1, 0), MODEL.gs9c8350UseSteamArm(1, 1));
  assert.notEqual(MODEL.gs9c8350StatnameHeapUsed(0xf), MODEL.gs9c8350StatnameHeapUsed(0x10));
  assert.notEqual(MODEL.gs9c8350SteamArmContinue(0), MODEL.gs9c8350SteamArmContinue(1));
  assert.notEqual(MODEL.gs9c8350FilenamePresent(0), MODEL.gs9c8350FilenamePresent(1));
  assert.notEqual(
    MODEL.gs9c8350StatnamePtr(null, 0, 0xf),
    MODEL.gs9c8350StatnamePtr(null, 0, 0x10),
    "statname inline vs heap arms differ",
  );
  assert.notEqual(
    MODEL.gs9c8350FilenamePtr(null, 0, 0xf),
    MODEL.gs9c8350FilenamePtr(null, 0, 0x10),
    "filename inline vs heap arms differ",
  );
  // DeleteRerun (ABI v2) mirror self-check
  assert.notEqual(MODEL.gs9c8410SteamPresent(0), MODEL.gs9c8410SteamPresent(1));
  assert.notEqual(MODEL.gs9c8410CloudGateOk(0), MODEL.gs9c8410CloudGateOk(0xff));
  assert.notEqual(MODEL.gs9c8410UseSteamArm(1, 0), MODEL.gs9c8410UseSteamArm(1, 1));
  assert.notEqual(MODEL.gs9c8410StatnameHeapUsed(0xf), MODEL.gs9c8410StatnameHeapUsed(0x10));
  assert.notEqual(MODEL.gs9c8410SteamArmContinue(0), MODEL.gs9c8410SteamArmContinue(1));
  assert.notEqual(MODEL.gs9c8410FilenamePresent(0), MODEL.gs9c8410FilenamePresent(1));
  assert.notEqual(
    MODEL.gs9c8410StatnamePtr(null, 0, 0xf),
    MODEL.gs9c8410StatnamePtr(null, 0, 0x10),
    "rerun statname inline vs heap arms differ",
  );
  assert.notEqual(
    MODEL.gs9c8410FilenamePtr(null, 0, 0xf),
    MODEL.gs9c8410FilenamePtr(null, 0, 0x10),
    "rerun filename inline vs heap arms differ",
  );
});
test("Wasm zero-import exports match JS oracle on fixed cases (ABI v3 serializers)", () => {
  const exp = loadExports();
  const M = MODEL;

  // R1 lane_count — UNSIGNED max of cap and the stream-read count
  assert.equal(exp["9c84c0LaneCount"](0, 0) >>> 0, 0);
  assert.equal(exp["9c84c0LaneCount"](5, 3) >>> 0, 5);
  assert.equal(exp["9c84c0LaneCount"](3, 5) >>> 0, 5);
  assert.equal(exp["9c84c0LaneCount"](0x100, 0x200) >>> 0, 0x200);
  assert.equal(exp["9c84c0LaneCount"](0xffffffff, 1) >>> 0, 0xffffffff, "cap wins on WIDE");
  assert.equal(exp["9c84c0LaneCount"](1, 0xffffffff) >>> 0, 0xffffffff);
  assert.equal(M.gs9c84c0LaneCount(0xffffffff, 1), 0xffffffff);

  // R2 clear_needed — FULL-dword != 0
  assert.equal(exp["9c84c0ClearNeeded"](0) >>> 0, 0);
  assert.equal(exp["9c84c0ClearNeeded"](1) >>> 0, 1);
  assert.equal(exp["9c84c0ClearNeeded"](0x100) >>> 0, 1, "WIDE count nonzero");
  assert.equal(exp["9c84c0ClearNeeded"](0xffffffff) >>> 0, 1);

  // R3 lane_flush — (lane & 7) == 0 (lane 0 of each group)
  for (const v of [0, 8, 0x10, 0x100]) {
    assert.equal(exp["9c84c0LaneFlush"](v) >>> 0, 1, `lane ${v} flushes`);
    assert.equal(M.gs9c84c0LaneFlush(v), 1);
  }
  for (const v of [1, 7, 9, 0x10f]) {
    assert.equal(exp["9c84c0LaneFlush"](v) >>> 0, 0, `lane ${v} does not flush`);
  }

  // R4 lane_bit_set — (byte >> (lane & 7)) & 1
  assert.equal(exp["9c84c0LaneBitSet"](0x80, 7) >>> 0, 1);
  assert.equal(exp["9c84c0LaneBitSet"](0x80, 0) >>> 0, 0);
  assert.equal(exp["9c84c0LaneBitSet"](0x1, 8) >>> 0, 1, "lane 8 -> bit 0");
  assert.equal(exp["9c84c0LaneBitSet"](0x2, 9) >>> 0, 1, "lane 9 -> bit 1");
  assert.equal(exp["9c84c0LaneBitSet"](0xff, 3) >>> 0, 1);
  assert.equal(exp["9c84c0LaneBitSet"](0, 3) >>> 0, 0);
  assert.equal(M.gs9c84c0LaneBitSet(0x1, 8), 1);

  // R5 flush_every8 — idx == 8 exactly (counter resets after flush)
  assert.equal(exp["9c85d0FlushEvery8"](8) >>> 0, 1);
  assert.equal(exp["9c85d0FlushEvery8"](0) >>> 0, 0);
  assert.equal(exp["9c85d0FlushEvery8"](7) >>> 0, 0);
  assert.equal(exp["9c85d0FlushEvery8"](16) >>> 0, 0, "counter is 0..7; 16 never equals 8");
  assert.equal(exp["9c85d0FlushEvery8"](0x108) >>> 0, 0);
  assert.equal(M.gs9c85d0FlushEvery8(8), 1);

  // R6 flush_remainder — idx != 0 (final partial group flush)
  assert.equal(exp["9c85d0FlushRemainder"](0) >>> 0, 0);
  for (const v of [1, 7, 0x100]) {
    assert.equal(exp["9c85d0FlushRemainder"](v) >>> 0, 1);
  }

  // R7 source_bit — (word >> (idx & 0x1f)) & 1
  assert.equal(exp["9c85d0SourceBit"](1, 0) >>> 0, 1);
  assert.equal(exp["9c85d0SourceBit"](1, 1) >>> 0, 0);
  assert.equal(exp["9c85d0SourceBit"](0x80000000, 31) >>> 0, 1);
  assert.equal(exp["9c85d0SourceBit"](1, 32) >>> 0, 1, "idx 32 -> bit 0 (word 1)");
  assert.equal(exp["9c85d0SourceBit"](0, 0xffffffff) >>> 0, 0);
  assert.equal(M.gs9c85d0SourceBit(0x80000000, 31), 1);

  // R8/R9 sentinel_layout — FULL-dword equality with 0x80000000
  assert.equal(exp["9c86e0SentinelLayout"](0x80000000) >>> 0, 1);
  assert.equal(exp["9c86e0SentinelLayout"](0x80000001) >>> 0, 0);
  assert.equal(exp["9c86e0SentinelLayout"](0) >>> 0, 0);
  assert.equal(exp["9c86e0SentinelLayout"](0xffffffff) >>> 0, 0);
  assert.equal(exp["9c87e0SentinelLayout"](0x80000000) >>> 0, 1, "twin body same gate");
  assert.equal(exp["9c87e0SentinelLayout"](0x7fffffff) >>> 0, 0);
  assert.equal(M.gs9c86e0SentinelLayout(0x80000000), 1);

  // R10 flags — bit0 = p64 != 0 ; bit1 = p6c != 0
  assert.equal(exp["9c88e0Flags"](0, 0) >>> 0, 0);
  assert.equal(exp["9c88e0Flags"](1, 0) >>> 0, 1);
  assert.equal(exp["9c88e0Flags"](0, 2) >>> 0, 2);
  assert.equal(exp["9c88e0Flags"](1, 2) >>> 0, 3);
  assert.equal(exp["9c88e0Flags"](0x100, 0x200) >>> 0, 3, "WIDE pointers both present");
  assert.equal(exp["9c88e0Flags"](0xffffffff, 0) >>> 0, 1);
  assert.equal(M.gs9c88e0Flags(0x100, 0x200), 3);

  // R11/R12 presence gates — ptr != 0
  assert.equal(exp["9c88e0BlobPresent"](0) >>> 0, 0);
  assert.equal(exp["9c88e0BlobPresent"](1) >>> 0, 1);
  assert.equal(exp["9c88e0BlobPresent"](0xffffffff) >>> 0, 1);
  assert.equal(exp["9c88e0ChildPresent"](0) >>> 0, 0);
  assert.equal(exp["9c88e0ChildPresent"](0x1234) >>> 0, 1);

  // R13 returns_true — constant 1
  assert.equal(exp["9c88e0ReturnsTrue"]() >>> 0, 1);

  // R14 slot_present — WORD gate (v & 0xffff) != 0
  assert.equal(exp["9c8d20SlotPresent"](0) >>> 0, 0);
  assert.equal(exp["9c8d20SlotPresent"](1) >>> 0, 1);
  assert.equal(exp["9c8d20SlotPresent"](0x10000) >>> 0, 0, "lo word zero -> absent");
  assert.equal(exp["9c8d20SlotPresent"](0x10001) >>> 0, 1, "lo word nonzero -> present");
  assert.equal(exp["9c8d20SlotPresent"](0x100) >>> 0, 1, "bit 8 lives in the low word (byte-narrow would flip)");
  assert.equal(exp["9c8d20SlotPresent"](0xff00) >>> 0, 1, "high byte of the low word counts");
  assert.equal(exp["9c8d20SlotPresent"](0xffff) >>> 0, 1);
  assert.equal(M.gs9c8d20SlotPresent(0x10000), 0);

  // R15 table_more — UNSIGNED offset < 0x3800
  assert.equal(exp["9c8d20TableMore"](0) >>> 0, 1);
  assert.equal(exp["9c8d20TableMore"](0x37ff) >>> 0, 1);
  assert.equal(exp["9c8d20TableMore"](0x3800) >>> 0, 0, "bound exclusive");
  assert.equal(exp["9c8d20TableMore"](0xffffffff) >>> 0, 0, "WIDE unsigned");
  assert.equal(M.gs9c8d20TableMore(0xffffffff), 0);

  // R16 element_count — signed floor div-0x78 of the u32 diff
  assert.equal(exp["9c8d20ElementCount"](0x1000, 0x1078) >>> 0, 1);
  assert.equal(exp["9c8d20ElementCount"](0x1000, 0x1000 + 2 * 0x78) >>> 0, 2);
  assert.equal(exp["9c8d20ElementCount"](0x1000, 0x1000) >>> 0, 0);
  // negative diffs (begin > end / wrap): the magic-imul division is SIGNED
  // and floors (sar + sign correction), so d = -1 -> floor(-1/0x78) = -1
  assert.equal(exp["9c8d20ElementCount"](0, 0xffffffff) >>> 0, 0xffffffff,
    "u32 diff 0xffffffff is int32 -1 -> floor -> -1");
  assert.equal(exp["9c8d20ElementCount"](0x1000, 0xfff) >>> 0, 0xffffffff,
    "-1/0x78 floors to -1");
  assert.equal(exp["9c8d20ElementCount"](0x1000, 0x800) >>> 0, 0xffffffee,
    "-0x800/0x78 = floor(-17.07) = -18");
  assert.equal(exp["9c8d20ElementCount"](0, 0x80000000) >>> 0, 0xfeeeeeee,
    "INT_MIN diff: floor(-2147483648/120) = -17895698");
  assert.equal(M.gs9c8d20ElementCount(0x1000, 0xfff), 0xffffffff);

  // R17 count_nonzero — FULL-dword != 0 (unsigned jbe skip)
  assert.equal(exp["9c8d20CountNonzero"](0) >>> 0, 0);
  assert.equal(exp["9c8d20CountNonzero"](1) >>> 0, 1);
  assert.equal(exp["9c8d20CountNonzero"](0x100) >>> 0, 1);
  assert.equal(exp["9c8d20CountNonzero"](0xffffffff) >>> 0, 1);

  // R18 walk_continue — node != head (empty list: node == head stops)
  assert.equal(exp["9c8d20WalkContinue"](0x1234, 0x1234) >>> 0, 0);
  assert.equal(exp["9c8d20WalkContinue"](0x1235, 0x1234) >>> 0, 1);
  assert.equal(exp["9c8d20WalkContinue"](0, 0) >>> 0, 0);
  assert.equal(exp["9c8d20WalkContinue"](0, 0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c8d20WalkContinue(0x1234, 0x1234), 0);
});

test("Wasm vs JS differential: randomized serializer leaf gates (ABI v3)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV3 = mulberry32(0x9c8d20);
  const rnd = () => Math.floor(rngV3() * 0x100000000) >>> 0;
  for (let i = 0; i < 200; i++) {
    const a = rnd();
    const b = rnd();
    const lane = rnd();
    const byteVal = rnd();
    const word = rnd();
    assert.equal(exp["9c84c0LaneCount"](a, b) >>> 0, M.gs9c84c0LaneCount(a, b), `lane_count(${a.toString(16)},${b.toString(16)})`);
    assert.equal(exp["9c84c0ClearNeeded"](a) >>> 0, M.gs9c84c0ClearNeeded(a));
    assert.equal(exp["9c84c0LaneFlush"](lane) >>> 0, M.gs9c84c0LaneFlush(lane));
    assert.equal(exp["9c84c0LaneBitSet"](byteVal, lane) >>> 0, M.gs9c84c0LaneBitSet(byteVal, lane));
    assert.equal(exp["9c85d0FlushEvery8"](a & 0xf) >>> 0, M.gs9c85d0FlushEvery8(a & 0xf));
    assert.equal(exp["9c85d0FlushRemainder"](a & 7) >>> 0, M.gs9c85d0FlushRemainder(a & 7));
    assert.equal(exp["9c85d0SourceBit"](word, a) >>> 0, M.gs9c85d0SourceBit(word, a));
    assert.equal(exp["9c86e0SentinelLayout"](a) >>> 0, M.gs9c86e0SentinelLayout(a));
    assert.equal(exp["9c87e0SentinelLayout"](a) >>> 0, M.gs9c87e0SentinelLayout(a));
    assert.equal(exp["9c88e0Flags"](a, b) >>> 0, M.gs9c88e0Flags(a, b));
    assert.equal(exp["9c88e0BlobPresent"](a) >>> 0, M.gs9c88e0BlobPresent(a));
    assert.equal(exp["9c88e0ChildPresent"](a) >>> 0, M.gs9c88e0ChildPresent(a));
    assert.equal(exp["9c8d20SlotPresent"](a) >>> 0, M.gs9c8d20SlotPresent(a));
    assert.equal(exp["9c8d20TableMore"](a) >>> 0, M.gs9c8d20TableMore(a));
    assert.equal(exp["9c8d20ElementCount"](a, b) >>> 0, M.gs9c8d20ElementCount(a, b),
      `element_count(${a.toString(16)},${b.toString(16)})`);
    assert.equal(exp["9c8d20CountNonzero"](a) >>> 0, M.gs9c8d20CountNonzero(a));
    assert.equal(exp["9c8d20WalkContinue"](a, b) >>> 0, M.gs9c8d20WalkContinue(a, b));
  }
  // 40 structured element_count draws around the 0x78 stride and wrap edges
  for (let i = 0; i < 40; i++) {
    const begin = rnd() % 0x10000;
    const delta = (rnd() % 0x2000) - 0x1000;
    const end = (begin + delta) >>> 0;
    assert.equal(exp["9c8d20ElementCount"](begin, end) >>> 0, M.gs9c8d20ElementCount(begin, end),
      `element_count structured ${begin.toString(16)} -> ${end.toString(16)}`);
  }
});

test("v3 serializer guards are not vacuous (self-check)", () => {
  assert.equal(MODEL.gs9c84c0LaneCount(3, 5), 5);
  assert.notEqual(MODEL.gs9c84c0LaneCount(3, 5), MODEL.gs9c84c0LaneCount(6, 5));
  assert.notEqual(MODEL.gs9c84c0ClearNeeded(0), MODEL.gs9c84c0ClearNeeded(1));
  assert.notEqual(MODEL.gs9c84c0LaneFlush(1), MODEL.gs9c84c0LaneFlush(8));
  assert.notEqual(MODEL.gs9c84c0LaneBitSet(0x1, 0), MODEL.gs9c84c0LaneBitSet(0x1, 1));
  assert.notEqual(MODEL.gs9c85d0FlushEvery8(7), MODEL.gs9c85d0FlushEvery8(8));
  assert.notEqual(MODEL.gs9c85d0FlushRemainder(0), MODEL.gs9c85d0FlushRemainder(1));
  assert.notEqual(MODEL.gs9c85d0SourceBit(1, 0), MODEL.gs9c85d0SourceBit(1, 1));
  assert.notEqual(MODEL.gs9c86e0SentinelLayout(0x80000000), MODEL.gs9c86e0SentinelLayout(0));
  assert.notEqual(MODEL.gs9c87e0SentinelLayout(0x80000000), MODEL.gs9c87e0SentinelLayout(1));
  assert.notEqual(MODEL.gs9c88e0Flags(1, 0), MODEL.gs9c88e0Flags(0, 2));
  assert.notEqual(MODEL.gs9c88e0BlobPresent(0), MODEL.gs9c88e0BlobPresent(1));
  assert.notEqual(MODEL.gs9c88e0ChildPresent(0), MODEL.gs9c88e0ChildPresent(1));
  assert.equal(MODEL.gs9c88e0ReturnsTrue(), 1, "constant law is pinned");
  assert.notEqual(MODEL.gs9c8d20SlotPresent(0), MODEL.gs9c8d20SlotPresent(1));
  assert.notEqual(MODEL.gs9c8d20TableMore(0x3800), MODEL.gs9c8d20TableMore(0x37ff));
  assert.notEqual(MODEL.gs9c8d20ElementCount(0x1000, 0x1000 + 0x78), MODEL.gs9c8d20ElementCount(0x1000, 0x1000));
  assert.notEqual(MODEL.gs9c8d20CountNonzero(0), MODEL.gs9c8d20CountNonzero(1));
  assert.notEqual(MODEL.gs9c8d20WalkContinue(1, 1), MODEL.gs9c8d20WalkContinue(1, 2));
});

test("Wasm zero-import exports match JS oracle on fixed cases (ABI v4 hosts)", () => {
  const exp = loadExports();
  const M = MODEL;

  // S1 pool_select — FULL-dword presence of [0xc7de78]; nonzero -> pool + 0x30
  assert.equal(exp["9cad40PoolSelect"](0) >>> 0, 0x00c7f618, "zero -> fallback pool");
  assert.equal(exp["9cad40PoolSelect"](1) >>> 0, (1 + 0x30) >>> 0, "nonzero -> pool + 0x30");
  assert.equal(exp["9cad40PoolSelect"](0x100) >>> 0, 0x130, "WIDE pool present (byte-narrow would flip)");
  assert.equal(exp["9cad40PoolSelect"](0xffffffff) >>> 0, (0xffffffff + 0x30) >>> 0, "u32 add wraps");
  assert.equal(exp["9cad40PoolSelect"](0x7cde78) >>> 0, 0x7cdea8);
  assert.equal(M.gs9cad40PoolSelect(0), 0x00c7f618);
  assert.equal(M.gs9cad40PoolSelect(0x100), 0x130);

  // S2 name_gate_ok — LOW-BYTE checksum AL; 0x100 -> byte 0x00 -> fail
  for (const v of [1, 0xff, 0x101, 0xffffffff]) {
    assert.equal(exp["9cad40NameGateOk"](v) >>> 0, 1);
    assert.equal(M.gs9cad40NameGateOk(v), 1);
  }
  assert.equal(exp["9cad40NameGateOk"](0) >>> 0, 0);
  assert.equal(exp["9cad40NameGateOk"](0x100) >>> 0, 0, "0x100 low byte is 0");
  assert.equal(M.gs9cad40NameGateOk(0x100), 0);

  // S3 open_gate_ok — LOW-BYTE vtbl+0x30 AL
  for (const v of [1, 0xff, 0x101]) {
    assert.equal(exp["9cad40OpenGateOk"](v) >>> 0, 1);
    assert.equal(M.gs9cad40OpenGateOk(v), 1);
  }
  assert.equal(exp["9cad40OpenGateOk"](0) >>> 0, 0);
  assert.equal(exp["9cad40OpenGateOk"](0x100) >>> 0, 0, "0x100 low byte is 0");
  assert.equal(M.gs9cad40OpenGateOk(0x100), 0);

  // S4 rerun_gate_ok — LOW-BYTE vtbl+0x24 AL (host B)
  for (const v of [1, 0xff, 0x101]) {
    assert.equal(exp["9caea0RerunGateOk"](v) >>> 0, 1);
    assert.equal(M.gs9caea0RerunGateOk(v), 1);
  }
  assert.equal(exp["9caea0RerunGateOk"](0) >>> 0, 0);
  assert.equal(exp["9caea0RerunGateOk"](0x100) >>> 0, 0, "0x100 low byte is 0");
  assert.equal(M.gs9caea0RerunGateOk(0x100), 0);

  // S5 rerun_success — LOW-BYTE read_rerun AL -> byte [+0x1fded] store value
  for (const v of [1, 0xff, 0x101]) {
    assert.equal(exp["9caea0RerunSuccess"](v) >>> 0, 1, "stored byte = 1");
    assert.equal(M.gs9caea0RerunSuccess(v), 1);
  }
  assert.equal(exp["9caea0RerunSuccess"](0) >>> 0, 0, "DeleteRerun fallback + al=0");
  assert.equal(exp["9caea0RerunSuccess"](0x100) >>> 0, 0, "0x100 low byte is 0");
  assert.equal(M.gs9caea0RerunSuccess(0x100), 0);

  // S6 io_dtor_needed — FULL-dword presence of GameStateIO* at +0x1fe24
  assert.equal(exp["9cad40IoDtorNeeded"](0) >>> 0, 0);
  for (const v of [1, 0x100, 0xffffffff]) {
    assert.equal(exp["9cad40IoDtorNeeded"](v) >>> 0, 1, "0x100 is a valid pointer");
    assert.equal(M.gs9cad40IoDtorNeeded(v), 1);
  }
  assert.equal(M.gs9cad40IoDtorNeeded(0), 0);
});

test("Wasm vs JS differential: randomized host A/B gates (ABI v4)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV4 = mulberry32(0x9cad40);
  const rnd = () => Math.floor(rngV4() * 0x100000000) >>> 0;
  for (let i = 0; i < 200; i++) {
    const pool = rnd();
    const checksum = rnd();
    const open = rnd();
    const rerun = rnd();
    const readRerun = rnd();
    const ioPtr = rnd();
    assert.equal(exp["9cad40PoolSelect"](pool) >>> 0, M.gs9cad40PoolSelect(pool),
      `pool_select(${pool.toString(16)})`);
    assert.equal(exp["9cad40NameGateOk"](checksum) >>> 0, M.gs9cad40NameGateOk(checksum));
    assert.equal(exp["9cad40OpenGateOk"](open) >>> 0, M.gs9cad40OpenGateOk(open));
    assert.equal(exp["9caea0RerunGateOk"](rerun) >>> 0, M.gs9caea0RerunGateOk(rerun));
    assert.equal(exp["9caea0RerunSuccess"](readRerun) >>> 0, M.gs9caea0RerunSuccess(readRerun));
    assert.equal(exp["9cad40IoDtorNeeded"](ioPtr) >>> 0, M.gs9cad40IoDtorNeeded(ioPtr));
  }
});

test("v4 host A/B guards are not vacuous (self-check)", () => {
  assert.notEqual(MODEL.gs9cad40PoolSelect(0), MODEL.gs9cad40PoolSelect(0x100));
  assert.notEqual(MODEL.gs9cad40PoolSelect(0), 0xc7f618 + 0x30, "fallback arm is not the pool+step arm");
  assert.notEqual(MODEL.gs9cad40NameGateOk(0), MODEL.gs9cad40NameGateOk(1));
  assert.equal(MODEL.gs9cad40NameGateOk(0x100), 0, "byte-narrow pin");
  assert.notEqual(MODEL.gs9cad40OpenGateOk(0), MODEL.gs9cad40OpenGateOk(1));
  assert.notEqual(MODEL.gs9caea0RerunGateOk(0), MODEL.gs9caea0RerunGateOk(1));
  assert.notEqual(MODEL.gs9caea0RerunSuccess(0), MODEL.gs9caea0RerunSuccess(1));
  assert.notEqual(MODEL.gs9cad40IoDtorNeeded(0), MODEL.gs9cad40IoDtorNeeded(0x100));
});

test("ABI v3 serializer-tree accessors: every 9c84c0..9c8d20 wasm accessor pinned (assertion census)", () => {
  /* Assertion census (wave-25): the 18 ABI-v3 serializer-tree LAWS are
     driven wasm-vs-model with WIDE inputs (fixed cases + differential),
     but the 57 ABI-v3 constant accessors (isaac_game_state_9c84c0_* /
     _9c85d0_* / _9c86e0_* / _9c87e0_* / _9c88e0_* / _9c8d20_*) appeared
     ONLY in the EXPORTS list + loadExports bindings; a subset of the
     model constants is literal-pinned in the header-declares test. This
     pins EVERY wasm accessor against the model constant (the model
     constants are the header/PE transcriptions; the cpp accessors return
     the header enum by construction, so the model-literal layer is the
     discriminator — a mutated header/cpp constant fails here). */
  const exp = loadExports();
  const rows = [
    ["9c84c0Va", MODEL.GS9C84C0_VA],
    ["9c84c0EndVa", MODEL.GS9C84C0_END_VA],
    ["9c84c0BodyBytes", MODEL.GS9C84C0_BODY_BYTES],
    ["9c84c0NextVa", MODEL.GS9C84C0_NEXT_VA],
    ["9c84c0LaneCountGateVa", MODEL.GS9C84C0_LANE_COUNT_GATE_VA],
    ["9c84c0ClearGateVa", MODEL.GS9C84C0_CLEAR_GATE_VA],
    ["9c84c0FlushGateVa", MODEL.GS9C84C0_FLUSH_GATE_VA],
    ["9c84c0BitSelectGateVa", MODEL.GS9C84C0_BIT_SELECT_GATE_VA],
    ["9c84c0CallerCount", MODEL.GS9C84C0_CALLER_COUNT],
    ["9c85d0Va", MODEL.GS9C85D0_VA],
    ["9c85d0EndVa", MODEL.GS9C85D0_END_VA],
    ["9c85d0BodyBytes", MODEL.GS9C85D0_BODY_BYTES],
    ["9c85d0NextVa", MODEL.GS9C85D0_NEXT_VA],
    ["9c85d0Flush8GateVa", MODEL.GS9C85D0_FLUSH8_GATE_VA],
    ["9c85d0RemainderGateVa", MODEL.GS9C85D0_REMAINDER_GATE_VA],
    ["9c85d0BitTestGateVa", MODEL.GS9C85D0_BIT_TEST_GATE_VA],
    ["9c85d0CallerCount", MODEL.GS9C85D0_CALLER_COUNT],
    ["9c86e0Va", MODEL.GS9C86E0_VA],
    ["9c86e0EndVa", MODEL.GS9C86E0_END_VA],
    ["9c86e0BodyBytes", MODEL.GS9C86E0_BODY_BYTES],
    ["9c86e0NextVa", MODEL.GS9C86E0_NEXT_VA],
    ["9c86e0SentinelGateVa", MODEL.GS9C86E0_SENTINEL_GATE_VA],
    ["9c86e0CallerCount", MODEL.GS9C86E0_CALLER_COUNT],
    ["9c87e0Va", MODEL.GS9C87E0_VA],
    ["9c87e0EndVa", MODEL.GS9C87E0_END_VA],
    ["9c87e0BodyBytes", MODEL.GS9C87E0_BODY_BYTES],
    ["9c87e0NextVa", MODEL.GS9C87E0_NEXT_VA],
    ["9c87e0SentinelGateVa", MODEL.GS9C87E0_SENTINEL_GATE_VA],
    ["9c87e0CallerCount", MODEL.GS9C87E0_CALLER_COUNT],
    ["9c88e0Va", MODEL.GS9C88E0_VA],
    ["9c88e0EndVa", MODEL.GS9C88E0_END_VA],
    ["9c88e0BodyBytes", MODEL.GS9C88E0_BODY_BYTES],
    ["9c88e0NextVa", MODEL.GS9C88E0_NEXT_VA],
    ["9c88e0FlagsBit0GateVa", MODEL.GS9C88E0_FLAGS_BIT0_GATE_VA],
    ["9c88e0FlagsBit1GateVa", MODEL.GS9C88E0_FLAGS_BIT1_GATE_VA],
    ["9c88e0BlobGateVa", MODEL.GS9C88E0_BLOB_GATE_VA],
    ["9c88e0ChildGateVa", MODEL.GS9C88E0_CHILD_GATE_VA],
    ["9c88e0RetTrueVa", MODEL.GS9C88E0_RET_TRUE_VA],
    ["9c88e0CallerCount", MODEL.GS9C88E0_CALLER_COUNT],
    ["9c8d20Va", MODEL.GS9C8D20_VA],
    ["9c8d20EndVa", MODEL.GS9C8D20_END_VA],
    ["9c8d20BodyBytes", MODEL.GS9C8D20_BODY_BYTES],
    ["9c8d20NextVa", MODEL.GS9C8D20_NEXT_VA],
    ["9c8d20SlotGateVa", MODEL.GS9C8D20_SLOT_GATE_VA],
    ["9c8d20TableBoundGateVa", MODEL.GS9C8D20_TABLE_BOUND_GATE_VA],
    ["9c8d20ElementCountVa", MODEL.GS9C8D20_ELEMENT_COUNT_VA],
    ["9c8d20CountZeroGateVa", MODEL.GS9C8D20_COUNT_ZERO_GATE_VA],
    ["9c8d20CountZeroGateVa2", MODEL.GS9C8D20_COUNT_ZERO_GATE_VA_2],
    ["9c8d20WalkEmptyGateVa", MODEL.GS9C8D20_WALK_EMPTY_GATE_VA],
    ["9c8d20WalkTailGateVa", MODEL.GS9C8D20_WALK_TAIL_GATE_VA],
    ["9c8d20CallerCount", MODEL.GS9C8D20_CALLER_COUNT],
    ["9c8d20ElementLoopMoreVa", MODEL.GS9C8D20_ELEMENT_LOOP_MORE_VA],
    ["9c8d20ElementLoopMoreVa2", MODEL.GS9C8D20_ELEMENT_LOOP_MORE_VA_2],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    assert.notEqual(want, 0, key + " pin is non-trivial");
  }
  /* caller_va_at index accessors (0 / last / OOB 99 -> 0). */
  const vaRows = [
    ["9c84c0CallerVaAt", MODEL.GS9C84C0_CALLER_VAS, 2],
    ["9c85d0CallerVaAt", MODEL.GS9C85D0_CALLER_VAS, 0],
    ["9c86e0CallerVaAt", MODEL.GS9C86E0_CALLER_VAS, 1],
    ["9c87e0CallerVaAt", MODEL.GS9C87E0_CALLER_VAS, 1],
    ["9c88e0CallerVaAt", MODEL.GS9C88E0_CALLER_VAS, 3],
    ["9c8d20CallerVaAt", MODEL.GS9C8D20_CALLER_VAS, 3],
  ];
  for (const [key, vas, last] of vaRows) {
    assert.equal(exp[key](0) >>> 0, vas[0], `${key}(0)`);
    assert.equal(exp[key](last) >>> 0, vas[last], `${key}(${last})`);
    assert.equal(exp[key](99) >>> 0, 0, `${key}(99) OOB`);
  }
});

test("Wasm zero-import exports match JS oracle on fixed cases (ABI v5 loops)", () => {
  const exp = loadExports();
  const M = MODEL;

  // U1 element-loop bound (PE 0x9c9157 cmp eax,[ebp-8] ; jb): UNSIGNED
  assert.equal(exp["9c8d20ElementLoopMore"](0, 5) >>> 0, 1);
  assert.equal(exp["9c8d20ElementLoopMore"](5, 5) >>> 0, 0);
  assert.equal(exp["9c8d20ElementLoopMore"](0x100, 5) >>> 0, 0, "0x100 > 5");
  assert.equal(exp["9c8d20ElementLoopMore"](0xffffffff, 0xffffffff) >>> 0, 0);
  assert.equal(M.gs9c8d20ElementLoopMore(4, 5), 1);
  assert.equal(M.gs9c8d20ElementLoopMore(5, 5), 0);

  // W1 hash count gate (PE 0x9c9ca0 cmp [..],0 ; jbe): UNSIGNED
  assert.equal(exp["9c9340HashCountNonzero"](0) >>> 0, 0);
  for (const v of [1, 0x100, 0xffffffff]) {
    assert.equal(exp["9c9340HashCountNonzero"](v) >>> 0, 1, "W1 wide present");
    assert.equal(M.gs9c9340HashCountNonzero(v), 1);
  }
  assert.equal(M.gs9c9340HashCountNonzero(0), 0);

  // W2 hash probe slot (PE 0x9c9cc0): (idx + hash) & (cap - 1)
  assert.equal(exp["9c9340HashProbeSlot"](0, 0, 0x100) >>> 0, 0);
  assert.equal(exp["9c9340HashProbeSlot"](3, 0x1c, 0x20) >>> 0, 0x1f);
  assert.equal(exp["9c9340HashProbeSlot"](0xffffffff, 0, 0x100) >>> 0, 0xff, "u32 wrap then mask");
  assert.equal(exp["9c9340HashProbeSlot"](0, 1, 1) >>> 0, 0, "cap 1 -> mask 0");
  assert.equal(M.gs9c9340HashProbeSlot(3, 0x1c, 0x20), 0x1f);

  // W3 hash loop bound (PE 0x9c9cd8): UNSIGNED
  assert.equal(exp["9c9340HashLoopMore"](0, 1) >>> 0, 1);
  assert.equal(exp["9c9340HashLoopMore"](1, 1) >>> 0, 0);
  assert.equal(exp["9c9340HashLoopMore"](0x100, 0x100) >>> 0, 0);
  assert.equal(M.gs9c9340HashLoopMore(0x100, 0x101), 1);

  // W4 value count gate (PE 0x9c9d17): UNSIGNED
  assert.equal(exp["9c9340ValueCountNonzero"](0) >>> 0, 0);
  assert.equal(exp["9c9340ValueCountNonzero"](0x100) >>> 0, 1, "W4 wide present");
  assert.equal(M.gs9c9340ValueCountNonzero(0x100), 1);

  // W5 value loop bound (PE 0x9c9d5c): UNSIGNED
  assert.equal(exp["9c9340ValueLoopMore"](9, 10) >>> 0, 1);
  assert.equal(exp["9c9340ValueLoopMore"](10, 10) >>> 0, 0);
  assert.equal(M.gs9c9340ValueLoopMore(0x100, 0x100), 0);

  // W6 reorder entry negative (PE 0x9c9dc5 test eax,eax ; jns): SIGNED
  assert.equal(exp["9c9340ReorderEntryNegative"](0) >>> 0, 0);
  assert.equal(exp["9c9340ReorderEntryNegative"](0x7fffffff) >>> 0, 0);
  assert.equal(exp["9c9340ReorderEntryNegative"](0x80000000) >>> 0, 1, "bit31 negative");
  assert.equal(exp["9c9340ReorderEntryNegative"](0xffffffff) >>> 0, 1, "-1 negative");
  assert.equal(exp["9c9340ReorderEntryNegative"](0x100) >>> 0, 0);
  assert.equal(M.gs9c9340ReorderEntryNegative(0x80000000), 1);

  // W7/W9 pending-run flush (PE 0x9c9dcc/0x9c9e07 test cx,cx ; je): WORD
  assert.equal(exp["9c9340ReorderPendingFlush"](0) >>> 0, 0);
  assert.equal(exp["9c9340ReorderPendingFlush"](1) >>> 0, 1);
  assert.equal(exp["9c9340ReorderPendingFlush"](0x10000) >>> 0, 0, "0x10000 word is 0");
  assert.equal(exp["9c9340ReorderFinalFlush"](0) >>> 0, 0);
  assert.equal(exp["9c9340ReorderFinalFlush"](0x10001) >>> 0, 1, "low word 1");
  assert.equal(M.gs9c9340ReorderPendingFlush(0x10000), 0);

  // W8 reorder run word (PE 0x9c9dd5 dec ecx / or ecx,0x8000)
  assert.equal(exp["9c9340ReorderRunWord"](1) >>> 0, 0x8000);
  assert.equal(exp["9c9340ReorderRunWord"](2) >>> 0, 0x8001);
  assert.equal(exp["9c9340ReorderRunWord"](0x10000) >>> 0, 0xffff, "(0xffff|0x8000)&0xffff");
  assert.equal(M.gs9c9340ReorderRunWord(2), 0x8001);

  // W10 div-0xc count (PE 0x9ca858 magic 0x2aaaaaab, TRUNC): trunc((int32)(end-begin)/0xc)
  assert.equal(exp["9c9340Div0xcCount"](0, 12) >>> 0, 1);
  assert.equal(exp["9c9340Div0xcCount"](0, 11) >>> 0, 0);
  assert.equal(exp["9c9340Div0xcCount"](0, 24) >>> 0, 2);
  assert.equal(exp["9c9340Div0xcCount"](0, 0xc0) >>> 0, 0x10);
  assert.equal(exp["9c9340Div0xcCount"](0, 0x80000000) >>> 0, 0xf5555556, "INT32_MIN trunc");
  assert.equal(exp["9c9340Div0xcCount"](13, 0) >>> 0, 0xffffffff, "-13 -> -1 (TRUNC not floor)");
  assert.equal(exp["9c9340Div0xcCount"](12, 0) >>> 0, 0xffffffff, "-12 -> -1");
  assert.equal(exp["9c9340Div0xcCount"](0xffffffff, 0) >>> 0, 0, "diff -1 trunc 0");
  assert.equal(M.gs9c9340Div0xcCount(0, 12), 1);
  assert.equal(M.gs9c9340Div0xcCount(13, 0), 0xffffffff);

  // W11 resize trigger (PE 0x9ca868 cmp eax,0xff ; jbe): UNSIGNED > 0xff
  assert.equal(exp["9c9340Div0xcResizeNeeded"](0xff) >>> 0, 0);
  assert.equal(exp["9c9340Div0xcResizeNeeded"](0x100) >>> 0, 1);
  assert.equal(exp["9c9340Div0xcResizeNeeded"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9c9340Div0xcResizeNeeded(0x100), 1);

  // W12 count byte (PE 0x9ca8ad mov byte): count & 0xff
  assert.equal(exp["9c9340Div0xcCountByte"](0x100) >>> 0, 0);
  assert.equal(exp["9c9340Div0xcCountByte"](0x1234ff) >>> 0, 0xff);
  assert.equal(M.gs9c9340Div0xcCountByte(0x100), 0);

  // W13 loop needed (PE 0x9ca8fd je): count != 0
  assert.equal(exp["9c9340Div0xcLoopNeeded"](0) >>> 0, 0);
  assert.equal(exp["9c9340Div0xcLoopNeeded"](1) >>> 0, 1);
  assert.equal(M.gs9c9340Div0xcLoopNeeded(0xffffffff), 1);

  // W14 loop bound (PE 0x9ca9e1): UNSIGNED
  assert.equal(exp["9c9340Div0xcLoopMore"](0, 1) >>> 0, 1);
  assert.equal(exp["9c9340Div0xcLoopMore"](1, 1) >>> 0, 0);
  assert.equal(M.gs9c9340Div0xcLoopMore(0x100, 0x100), 0);

  // W15 lane count (PE 0x9caa9c): 7
  assert.equal(exp["9c9340Lane7Count"]() >>> 0, 7);
  assert.equal(M.gs9c9340Lane7Count(), 7);

  // W16 lane7 loop more (PE 0x9cac22 sub,1 ; jne): (remaining-1) != 0
  assert.equal(exp["9c9340Lane7LoopMore"](7) >>> 0, 1);
  assert.equal(exp["9c9340Lane7LoopMore"](1) >>> 0, 0);
  assert.equal(exp["9c9340Lane7LoopMore"](0) >>> 0, 1, "0-1 wraps to 0xffffffff");
  assert.equal(M.gs9c9340Lane7LoopMore(1), 0);
  assert.equal(M.gs9c9340Lane7LoopMore(0), 1);

  // W17 byte-count entry (PE 0x9cab2a cmp byte,0 ; jle): SIGNED (int8) > 0
  assert.equal(exp["9c9340ByteCountNeeded"](0) >>> 0, 0);
  assert.equal(exp["9c9340ByteCountNeeded"](1) >>> 0, 1);
  assert.equal(exp["9c9340ByteCountNeeded"](0x7f) >>> 0, 1);
  assert.equal(exp["9c9340ByteCountNeeded"](0x80) >>> 0, 0, "0x80 = -128 signed");
  assert.equal(exp["9c9340ByteCountNeeded"](0xff) >>> 0, 0, "0xff = -1 signed");
  assert.equal(exp["9c9340ByteCountNeeded"](0x100) >>> 0, 0, "0x100 low byte 0");
  assert.equal(exp["9c9340ByteCountNeeded"](0x181) >>> 0, 0, "0x181 low byte 0x81 = -127, not > 0");
  assert.equal(M.gs9c9340ByteCountNeeded(0x80), 0);
  assert.equal(M.gs9c9340ByteCountNeeded(0x7f), 1);

  // W18 byte-count more (PE 0x9cab70 cmp al,byte ; jl): SIGNED (int8) < (int8)
  assert.equal(exp["9c9340ByteCountMore"](0, 5) >>> 0, 1);
  assert.equal(exp["9c9340ByteCountMore"](5, 5) >>> 0, 0);
  assert.equal(exp["9c9340ByteCountMore"](0x80, 0x7f) >>> 0, 1, "-128 < 127 true");
  assert.equal(exp["9c9340ByteCountMore"](0x7f, 0x80) >>> 0, 0, "127 < -128 false");
  assert.equal(exp["9c9340ByteCountMore"](0x80, 0xff) >>> 0, 1, "-128 < -1 true");
  assert.equal(exp["9c9340ByteCountMore"](0xff, 0x80) >>> 0, 0, "-1 < -128 false");
  assert.equal(exp["9c9340ByteCountMore"](0x100, 5) >>> 0, 1, "0x100 low byte 0 < 5");
  assert.equal(M.gs9c9340ByteCountMore(0x80, 0xff), 1);

  // W19 finalize needed (PE 0x9cacb2+0x9cacbb): mode==0 FULL && partial byte != 0
  assert.equal(exp["9c9340FinalizeNeeded"](0, 0) >>> 0, 0);
  assert.equal(exp["9c9340FinalizeNeeded"](0, 1) >>> 0, 1);
  assert.equal(exp["9c9340FinalizeNeeded"](0, 0x100) >>> 0, 0, "partial 0x100 byte 0");
  assert.equal(exp["9c9340FinalizeNeeded"](1, 1) >>> 0, 0, "mode 1 (CRC) skips");
  assert.equal(exp["9c9340FinalizeNeeded"](0x100, 1) >>> 0, 0, "mode 0x100 != 0");
  assert.equal(M.gs9c9340FinalizeNeeded(0, 1), 1);
  assert.equal(M.gs9c9340FinalizeNeeded(1, 1), 0);

  // W20 pad bytes (PE 0x9cacbf cmp dl,4 ; jae): partial<4 ? 4-partial : 0
  assert.equal(exp["9c9340FinalizePadBytes"](1) >>> 0, 3);
  assert.equal(exp["9c9340FinalizePadBytes"](3) >>> 0, 1);
  assert.equal(exp["9c9340FinalizePadBytes"](4) >>> 0, 0);
  assert.equal(exp["9c9340FinalizePadBytes"](0xff) >>> 0, 0, "0xff >= 4 no pad");
  assert.equal(exp["9c9340FinalizePadBytes"](0x101) >>> 0, 3, "0x101 low byte 1");
  assert.equal(M.gs9c9340FinalizePadBytes(1), 3);

  // W21 fold (PE 0x9cacdc): ror32(acc,1) + lane
  assert.equal(exp["9c9340FinalizeRorAdd"](0, 0) >>> 0, 0);
  assert.equal(exp["9c9340FinalizeRorAdd"](0, 4) >>> 0, 4);
  assert.equal(exp["9c9340FinalizeRorAdd"](1, 0) >>> 0, 0x80000000, "ror32(1,1) = 0x80000000");
  assert.equal(exp["9c9340FinalizeRorAdd"](0x80000000, 0) >>> 0, 0x40000000);
  assert.equal(exp["9c9340FinalizeRorAdd"](0xffffffff, 1) >>> 0, 0, "u32 wrap: ror(0xffffffff)=0xffffffff +1 = 0");
  assert.equal(M.gs9c9340FinalizeRorAdd(1, 0), 0x80000000);

  // W22 checksum stream word (PE 0x9cad00): acc ^ 0x96696996
  assert.equal(exp["9c9340ChecksumStreamWord"](0x96696996) >>> 0, 0);
  assert.equal(exp["9c9340ChecksumStreamWord"](0) >>> 0, 0x96696996);
  assert.equal(M.gs9c9340ChecksumStreamWord(0x96696996), 0);

  // N1 name-open gate (PE 0x68394a cmp dword [eax],0 ; jne): FULL-dword
  assert.equal(exp["683930NameGateOk"](0) >>> 0, 0);
  for (const v of [1, 0x100, 0xffffffff]) {
    assert.equal(exp["683930NameGateOk"](v) >>> 0, 1, "N1 wide present");
    assert.equal(M.gs683930NameGateOk(v), 1);
  }
  assert.equal(M.gs683930NameGateOk(0), 0);
});

test("Wasm vs JS differential: randomized write-loop laws (ABI v5)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV5 = mulberry32(0x9c9340);
  const rnd = () => Math.floor(rngV5() * 0x100000000) >>> 0;
  for (let i = 0; i < 200; i++) {
    const idx = rnd();
    const count = rnd();
    const entry = rnd();
    const pending = rnd();
    const begin = rnd();
    const end = rnd();
    const mode = rnd();
    const partial = rnd();
    const acc = rnd();
    const lane = rnd();
    const steam = rnd();
    const probeHash = rnd();
    assert.equal(exp["9c8d20ElementLoopMore"](idx, count) >>> 0, M.gs9c8d20ElementLoopMore(idx, count));
    assert.equal(exp["9c9340HashCountNonzero"](count) >>> 0, M.gs9c9340HashCountNonzero(count));
    assert.equal(exp["9c9340HashProbeSlot"](idx, probeHash, count) >>> 0, M.gs9c9340HashProbeSlot(idx, probeHash, count));
    assert.equal(exp["9c9340HashLoopMore"](idx, count) >>> 0, M.gs9c9340HashLoopMore(idx, count));
    assert.equal(exp["9c9340ValueCountNonzero"](count) >>> 0, M.gs9c9340ValueCountNonzero(count));
    assert.equal(exp["9c9340ValueLoopMore"](idx, count) >>> 0, M.gs9c9340ValueLoopMore(idx, count));
    assert.equal(exp["9c9340ReorderEntryNegative"](entry) >>> 0, M.gs9c9340ReorderEntryNegative(entry));
    assert.equal(exp["9c9340ReorderPendingFlush"](pending) >>> 0, M.gs9c9340ReorderPendingFlush(pending));
    assert.equal(exp["9c9340ReorderRunWord"](pending) >>> 0, M.gs9c9340ReorderRunWord(pending));
    assert.equal(exp["9c9340ReorderFinalFlush"](pending) >>> 0, M.gs9c9340ReorderFinalFlush(pending));
    assert.equal(exp["9c9340Div0xcCount"](begin, end) >>> 0, M.gs9c9340Div0xcCount(begin, end));
    assert.equal(exp["9c9340Div0xcResizeNeeded"](count) >>> 0, M.gs9c9340Div0xcResizeNeeded(count));
    assert.equal(exp["9c9340Div0xcCountByte"](count) >>> 0, M.gs9c9340Div0xcCountByte(count));
    assert.equal(exp["9c9340Div0xcLoopNeeded"](count) >>> 0, M.gs9c9340Div0xcLoopNeeded(count));
    assert.equal(exp["9c9340Div0xcLoopMore"](idx, count) >>> 0, M.gs9c9340Div0xcLoopMore(idx, count));
    assert.equal(exp["9c9340Lane7Count"]() >>> 0, M.gs9c9340Lane7Count());
    assert.equal(exp["9c9340Lane7LoopMore"](count) >>> 0, M.gs9c9340Lane7LoopMore(count));
    assert.equal(exp["9c9340ByteCountNeeded"](count) >>> 0, M.gs9c9340ByteCountNeeded(count));
    assert.equal(exp["9c9340ByteCountMore"](idx, count) >>> 0, M.gs9c9340ByteCountMore(idx, count));
    assert.equal(exp["9c9340FinalizeNeeded"](mode, partial) >>> 0, M.gs9c9340FinalizeNeeded(mode, partial));
    assert.equal(exp["9c9340FinalizePadBytes"](partial) >>> 0, M.gs9c9340FinalizePadBytes(partial));
    assert.equal(exp["9c9340FinalizeRorAdd"](acc, lane) >>> 0, M.gs9c9340FinalizeRorAdd(acc, lane));
    assert.equal(exp["9c9340ChecksumStreamWord"](acc) >>> 0, M.gs9c9340ChecksumStreamWord(acc));
    assert.equal(exp["683930NameGateOk"](steam) >>> 0, M.gs683930NameGateOk(steam));
  }
});

test("v5 write-loop guards are not vacuous (self-check)", () => {
  assert.notEqual(MODEL.gs9c8d20ElementLoopMore(0, 1), MODEL.gs9c8d20ElementLoopMore(1, 1));
  assert.notEqual(MODEL.gs9c9340HashCountNonzero(0), MODEL.gs9c9340HashCountNonzero(0x100));
  assert.notEqual(MODEL.gs9c9340HashProbeSlot(0, 0, 0x20), MODEL.gs9c9340HashProbeSlot(0, 1, 0x20));
  assert.notEqual(MODEL.gs9c9340HashLoopMore(0, 1), MODEL.gs9c9340HashLoopMore(1, 1));
  assert.notEqual(MODEL.gs9c9340ValueCountNonzero(0), MODEL.gs9c9340ValueCountNonzero(0x100));
  assert.notEqual(MODEL.gs9c9340ValueLoopMore(1, 2), MODEL.gs9c9340ValueLoopMore(2, 2));
  assert.notEqual(MODEL.gs9c9340ReorderEntryNegative(0), MODEL.gs9c9340ReorderEntryNegative(0x80000000));
  assert.notEqual(MODEL.gs9c9340ReorderEntryNegative(0x7fffffff), MODEL.gs9c9340ReorderEntryNegative(0x80000000));
  assert.notEqual(MODEL.gs9c9340ReorderPendingFlush(0), MODEL.gs9c9340ReorderPendingFlush(0xffff));
  assert.equal(MODEL.gs9c9340ReorderPendingFlush(0x10000), 0, "word gate 0x10000");
  assert.notEqual(MODEL.gs9c9340ReorderRunWord(1), MODEL.gs9c9340ReorderRunWord(2));
  assert.equal(MODEL.gs9c9340ReorderRunWord(1), 0x8000, "marker bit");
  assert.notEqual(MODEL.gs9c9340ReorderFinalFlush(0), MODEL.gs9c9340ReorderFinalFlush(1));
  assert.notEqual(MODEL.gs9c9340Div0xcCount(0, 12), MODEL.gs9c9340Div0xcCount(0, 11));
  assert.equal(MODEL.gs9c9340Div0xcCount(13, 0), 0xffffffff, "TRUNC -13 -> -1");
  assert.equal(MODEL.gs9c9340Div0xcCount(0, 0x80000000), 0xf5555556, "INT32_MIN trunc");
  assert.notEqual(MODEL.gs9c9340Div0xcResizeNeeded(0xff), MODEL.gs9c9340Div0xcResizeNeeded(0x100));
  assert.notEqual(MODEL.gs9c9340Div0xcCountByte(0), MODEL.gs9c9340Div0xcCountByte(0x1ff));
  assert.notEqual(MODEL.gs9c9340Div0xcLoopNeeded(0), MODEL.gs9c9340Div0xcLoopNeeded(0x100));
  assert.notEqual(MODEL.gs9c9340Div0xcLoopMore(0, 1), MODEL.gs9c9340Div0xcLoopMore(1, 1));
  assert.equal(MODEL.gs9c9340Lane7Count(), 7);
  assert.notEqual(MODEL.gs9c9340Lane7LoopMore(1), MODEL.gs9c9340Lane7LoopMore(2));
  assert.notEqual(MODEL.gs9c9340ByteCountNeeded(0x7f), MODEL.gs9c9340ByteCountNeeded(0x80), "signed byte entry");
  assert.notEqual(MODEL.gs9c9340ByteCountMore(0x80, 0xff), MODEL.gs9c9340ByteCountMore(0xff, 0x80), "signed byte more: -128<-1 vs -1<-128");
  assert.notEqual(MODEL.gs9c9340FinalizeNeeded(0, 1), MODEL.gs9c9340FinalizeNeeded(1, 1), "mode gate");
  assert.equal(MODEL.gs9c9340FinalizeNeeded(0, 0x100), 0, "partial byte gate");
  assert.notEqual(MODEL.gs9c9340FinalizePadBytes(1), MODEL.gs9c9340FinalizePadBytes(4));
  assert.notEqual(MODEL.gs9c9340FinalizeRorAdd(1, 0), MODEL.gs9c9340FinalizeRorAdd(1, 1));
  assert.notEqual(MODEL.gs9c9340ChecksumStreamWord(0), MODEL.gs9c9340ChecksumStreamWord(0x96696996));
  assert.notEqual(MODEL.gs683930NameGateOk(0), MODEL.gs683930NameGateOk(0x100), "N1 steam FULL-dword");
});

test("ABI v5 write-span accessors: every W1..W22/U1/N1 wasm accessor pinned (assertion census)", () => {
  /* Every ABI-v5 constant accessor is pinned wasm-vs-model; a mutated
     header/cpp constant fails here. */
  const exp = loadExports();
  const rows = [
    ["9c8d20ElementLoopMoreVa", MODEL.GS9C8D20_ELEMENT_LOOP_MORE_VA],
    ["9c8d20ElementLoopMoreVa2", MODEL.GS9C8D20_ELEMENT_LOOP_MORE_VA_2],
    ["9c9340HashCountGateVa", MODEL.GS9C9340_HASH_COUNT_GATE_VA],
    ["9c9340HashProbeVa", MODEL.GS9C9340_HASH_PROBE_VA],
    ["9c9340HashBoundGateVa", MODEL.GS9C9340_HASH_BOUND_GATE_VA],
    ["9c9340ValueCountGateVa", MODEL.GS9C9340_VALUE_COUNT_GATE_VA],
    ["9c9340ValueBoundGateVa", MODEL.GS9C9340_VALUE_BOUND_GATE_VA],
    ["9c9340ReorderNegGateVa", MODEL.GS9C9340_REORDER_NEG_GATE_VA],
    ["9c9340ReorderFlushGateVa", MODEL.GS9C9340_REORDER_FLUSH_GATE_VA],
    ["9c9340ReorderRunWordVa", MODEL.GS9C9340_REORDER_RUN_WORD_VA],
    ["9c9340ReorderFinalFlushVa", MODEL.GS9C9340_REORDER_FINAL_FLUSH_VA],
    ["9c9340Div0xcCountVa", MODEL.GS9C9340_DIV0XC_COUNT_VA],
    ["9c9340Div0xcResizeGateVa", MODEL.GS9C9340_DIV0XC_RESIZE_GATE_VA],
    ["9c9340Div0xcCountByteVa", MODEL.GS9C9340_DIV0XC_COUNT_BYTE_VA],
    ["9c9340Div0xcNeededGateVa", MODEL.GS9C9340_DIV0XC_NEEDED_GATE_VA],
    ["9c9340Div0xcBoundGateVa", MODEL.GS9C9340_DIV0XC_BOUND_GATE_VA],
    ["9c9340Lane7CountVa", MODEL.GS9C9340_LANE7_COUNT_VA],
    ["9c9340Lane7MoreVa", MODEL.GS9C9340_LANE7_MORE_VA],
    ["9c9340ByteCountNeededVa", MODEL.GS9C9340_BYTE_COUNT_NEEDED_VA],
    ["9c9340ByteCountNeededVa2", MODEL.GS9C9340_BYTE_COUNT_NEEDED_VA_2],
    ["9c9340ByteCountMoreVa", MODEL.GS9C9340_BYTE_COUNT_MORE_VA],
    ["9c9340ByteCountMoreVa2", MODEL.GS9C9340_BYTE_COUNT_MORE_VA_2],
    ["9c9340FinalizeModeGateVa", MODEL.GS9C9340_FINALIZE_MODE_GATE_VA],
    ["9c9340FinalizePartialGateVa", MODEL.GS9C9340_FINALIZE_PARTIAL_GATE_VA],
    ["9c9340FinalizePadVa", MODEL.GS9C9340_FINALIZE_PAD_VA],
    ["9c9340FinalizeFoldVa", MODEL.GS9C9340_FINALIZE_FOLD_VA],
    ["9c9340ChecksumStoreXorVa", MODEL.GS9C9340_CHECKSUM_STORE_XOR_VA],
    ["9c9340HashTableOff", MODEL.GS9C9340_HASH_TABLE_OFF],
    ["9c9340HashCapOff", MODEL.GS9C9340_HASH_CAP_OFF],
    ["9c9340HashStateOff", MODEL.GS9C9340_HASH_STATE_OFF],
    ["9c9340HashCountOff", MODEL.GS9C9340_HASH_COUNT_OFF],
    ["9c9340ValueCountOff", MODEL.GS9C9340_VALUE_COUNT_OFF],
    ["9c9340ValueBaseOff", MODEL.GS9C9340_VALUE_BASE_OFF],
    ["9c9340HolderBaseOff", MODEL.GS9C9340_HOLDER_BASE_OFF],
    ["9c9340ValueStride", MODEL.GS9C9340_VALUE_STRIDE],
    ["9c9340HolderStride", MODEL.GS9C9340_HOLDER_STRIDE],
    ["9c9340ReorderTableOff", MODEL.GS9C9340_REORDER_TABLE_OFF],
    ["9c9340ReorderEntries", MODEL.GS9C9340_REORDER_ENTRIES],
    ["9c9340ReorderRunMarker", MODEL.GS9C9340_REORDER_RUN_MARKER],
    ["9c9340Div0xcBeginOff", MODEL.GS9C9340_DIV0XC_BEGIN_OFF],
    ["9c9340Div0xcMagic", MODEL.GS9C9340_DIV0XC_MAGIC],
    ["9c9340Div0xcDivisor", MODEL.GS9C9340_DIV0XC_DIVISOR],
    ["9c9340Div0xcCap", MODEL.GS9C9340_DIV0XC_CAP],
    ["9c9340Lane7BaseOff", MODEL.GS9C9340_LANE7_BASE_OFF],
    ["9c9340Lane7Stride", MODEL.GS9C9340_LANE7_STRIDE],
    ["9c9340ChecksumOff", MODEL.GS9C9340_CHECKSUM_OFF],
    ["9c9340ChecksumXor", MODEL.GS9C9340_CHECKSUM_XOR],
    ["9c9340StateModeOff", MODEL.GS9C9340_STATE_MODE_OFF],
    ["9c9340StatePartialOff", MODEL.GS9C9340_STATE_PARTIAL_OFF],
    ["9c9340StateAccOff", MODEL.GS9C9340_STATE_ACC_OFF],
    ["9c9340StateLaneOff", MODEL.GS9C9340_STATE_LANE_OFF],
    ["683930Va", MODEL.GS683930_VA],
    ["683930EndVa", MODEL.GS683930_END_VA],
    ["683930BodyBytes", MODEL.GS683930_BODY_BYTES],
    ["683930NextVa", MODEL.GS683930_NEXT_VA],
    ["683930SteamIat", MODEL.GS683930_STEAM_IAT],
    ["683930SteamArg", MODEL.GS683930_STEAM_ARG],
    ["683930SteamGateVa", MODEL.GS683930_STEAM_GATE_VA],
    ["683930CallerCount", MODEL.GS683930_CALLER_COUNT],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    if (key !== "9c9340StateLaneOff") {
      assert.notEqual(want, 0, key + " pin is non-trivial");
    }
  }
  for (let i = 0; i < 3; i++) {
    assert.equal(exp["683930CallerVaAt"](i) >>> 0, MODEL.GS683930_CALLER_VAS[i], `683930CallerVaAt(${i})`);
  }
  assert.equal(exp["683930CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
});

test("Wasm zero-import exports match JS oracle on fixed cases (ABI v6 reader + fixed loops)", () => {
  const exp = loadExports();
  const M = MODEL;

  // R1..R9/R10 reader format gates (PE: cmp dword [edi+8],N ; jb):
  // FULL-dword UNSIGNED format >= N; R10 = format < 0x47 (jae skip).
  assert.equal(exp["9cb020Gate0x3b"](0x3b - 1) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x3b"](0x3b) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x3b"](0x100) >>> 0, 1, "R1 wide format");
  assert.equal(exp["9cb020Gate0x3b"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x3b(0x3b), 1);
  assert.equal(M.gs9cb020Gate0x3b(0x3a), 0);
  assert.equal(exp["9cb020Gate0x46"](0x46) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x46"](0x45) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x46"](0x100) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x46(0x46), 1);
  assert.equal(M.gs9cb020Gate0x46(0x45), 0);
  assert.equal(exp["9cb020Gate0x47"](0x47 - 1) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x47"](0x47) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x47"](0x180) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x47(0x47), 1);
  assert.equal(M.gs9cb020Gate0x47(0x46), 0);
  assert.equal(exp["9cb020Gate0x5b"](0x5b) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x5b"](0x5a) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x5b"](0x100) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x5b(0x5b), 1);
  assert.equal(M.gs9cb020Gate0x5b(0x5a), 0);
  assert.equal(exp["9cb020Gate0x67"](0x67) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x67"](0x66) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x67"](0x100) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x67(0x67), 1);
  assert.equal(M.gs9cb020Gate0x67(0x66), 0);
  assert.equal(exp["9cb020Gate0x6c"](0x6c) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x6c"](0x6b) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x6c"](0x200) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x6c(0x6c), 1);
  assert.equal(M.gs9cb020Gate0x6c(0x6b), 0);
  assert.equal(exp["9cb020Gate0x88"](0x88) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x88"](0x87) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x88"](0x100) >>> 0, 1, "R7 0x100 present");
  assert.equal(M.gs9cb020Gate0x88(0x88), 1);
  assert.equal(M.gs9cb020Gate0x88(0x87), 0);
  assert.equal(exp["9cb020Gate0x96"](0x96) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x96"](0x95) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x96"](0x100) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x96(0x96), 1);
  assert.equal(M.gs9cb020Gate0x96(0x95), 0);
  assert.equal(exp["9cb020Gate0x9e"](0x9e) >>> 0, 1);
  assert.equal(exp["9cb020Gate0x9e"](0x9d) >>> 0, 0);
  assert.equal(exp["9cb020Gate0x9e"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9cb020Gate0x9e(0x9e), 1);
  assert.equal(M.gs9cb020Gate0x9e(0x9d), 0);
  assert.equal(exp["9cb020OldU64Gate"](0x46) >>> 0, 1, "R10 format < 0x47");
  assert.equal(exp["9cb020OldU64Gate"](0x47) >>> 0, 0);
  assert.equal(exp["9cb020OldU64Gate"](0x100) >>> 0, 0, "R10 wide closed");
  assert.equal(M.gs9cb020OldU64Gate(0x46), 1);
  assert.equal(M.gs9cb020OldU64Gate(0x47), 0);

  // R11/R12 flags byte-gates (PE test al,1 / test al,2): LOW-BYTE
  assert.equal(exp["9cb020Sub0x64Present"](0) >>> 0, 0);
  assert.equal(exp["9cb020Sub0x64Present"](1) >>> 0, 1);
  assert.equal(exp["9cb020Sub0x64Present"](2) >>> 0, 0, "bit1 does not open +0x64");
  assert.equal(exp["9cb020Sub0x64Present"](0x100) >>> 0, 0, "0x100 low byte 0");
  assert.equal(exp["9cb020Sub0x64Present"](0x101) >>> 0, 1);
  assert.equal(M.gs9cb020Sub0x64Present(1), 1);
  assert.equal(exp["9cb020Sub0x6cPresent"](0) >>> 0, 0);
  assert.equal(exp["9cb020Sub0x6cPresent"](2) >>> 0, 1);
  assert.equal(exp["9cb020Sub0x6cPresent"](1) >>> 0, 0, "bit0 does not open +0x6c");
  assert.equal(exp["9cb020Sub0x6cPresent"](0x200) >>> 0, 0, "0x200 low byte 0");
  assert.equal(exp["9cb020Sub0x6cPresent"](3) >>> 0, 1);
  assert.equal(M.gs9cb020Sub0x6cPresent(2), 1);

  // R13 old byte->bool (PE xor/setne): (byte & 0xff) != 0 ? 1 : 0
  assert.equal(exp["9cb020OldByteToBool"](0) >>> 0, 0);
  assert.equal(exp["9cb020OldByteToBool"](1) >>> 0, 1);
  assert.equal(exp["9cb020OldByteToBool"](0x100) >>> 0, 0, "0x100 low byte 0");
  assert.equal(exp["9cb020OldByteToBool"](0xff) >>> 0, 1);
  assert.equal(M.gs9cb020OldByteToBool(0xff), 1);
  assert.equal(M.gs9cb020OldByteToBool(0x100), 0);

  // R14 old-u64 type-4 gate (PE cmp [esi],4 ; jne): FULL-dword equality
  assert.equal(exp["9cb020OldU64Type4"](4) >>> 0, 1);
  assert.equal(exp["9cb020OldU64Type4"](0) >>> 0, 0);
  assert.equal(exp["9cb020OldU64Type4"](0x100) >>> 0, 0, "0x100 != 4");
  assert.equal(exp["9cb020OldU64Type4"](0xffffffff) >>> 0, 0);
  assert.equal(M.gs9cb020OldU64Type4(4), 1);
  assert.equal(M.gs9cb020OldU64Type4(0x100), 0);

  // T1/T3 fixed counts (PE 0x9c9c24 / 0x9c9d6c): 0xe / 0x14
  assert.equal(exp["9c9c30FixedCount"]() >>> 0, 0xe);
  assert.equal(M.gs9c9c30FixedCount(), 0xe);
  assert.equal(exp["9c9d66FixedCount"]() >>> 0, 0x14);
  assert.equal(M.gs9c9d66FixedCount(), 0x14);

  // T2/T4 fixed loop more (PE sub,1 ; jne): (remaining-1) != 0
  assert.equal(exp["9c9c30LoopMore"](0xe) >>> 0, 1);
  assert.equal(exp["9c9c30LoopMore"](1) >>> 0, 0);
  assert.equal(exp["9c9c30LoopMore"](0) >>> 0, 1, "0-1 wraps to 0xffffffff");
  assert.equal(exp["9c9c30LoopMore"](0x100) >>> 0, 1);
  assert.equal(M.gs9c9c30LoopMore(1), 0);
  assert.equal(M.gs9c9c30LoopMore(0), 1);
  assert.equal(exp["9c9d66LoopMore"](0x14) >>> 0, 1);
  assert.equal(exp["9c9d66LoopMore"](1) >>> 0, 0);
  assert.equal(exp["9c9d66LoopMore"](0) >>> 0, 1, "0-1 wraps");
  assert.equal(M.gs9c9d66LoopMore(1), 0);
  assert.equal(M.gs9c9d66LoopMore(0), 1);
});

test("Wasm vs JS differential: randomized reader-format gates + fixed loops (ABI v6)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV6 = mulberry32(0x9cb020);
  const rnd = () => Math.floor(rngV6() * 0x100000000) >>> 0;
  for (let i = 0; i < 200; i++) {
    const format = rnd();
    const flags = rnd();
    const byte = rnd();
    const field0 = rnd();
    const remaining = rnd();
    assert.equal(exp["9cb020Gate0x3b"](format) >>> 0, M.gs9cb020Gate0x3b(format));
    assert.equal(exp["9cb020Gate0x46"](format) >>> 0, M.gs9cb020Gate0x46(format));
    assert.equal(exp["9cb020Gate0x47"](format) >>> 0, M.gs9cb020Gate0x47(format));
    assert.equal(exp["9cb020Gate0x5b"](format) >>> 0, M.gs9cb020Gate0x5b(format));
    assert.equal(exp["9cb020Gate0x67"](format) >>> 0, M.gs9cb020Gate0x67(format));
    assert.equal(exp["9cb020Gate0x6c"](format) >>> 0, M.gs9cb020Gate0x6c(format));
    assert.equal(exp["9cb020Gate0x88"](format) >>> 0, M.gs9cb020Gate0x88(format));
    assert.equal(exp["9cb020Gate0x96"](format) >>> 0, M.gs9cb020Gate0x96(format));
    assert.equal(exp["9cb020Gate0x9e"](format) >>> 0, M.gs9cb020Gate0x9e(format));
    assert.equal(exp["9cb020OldU64Gate"](format) >>> 0, M.gs9cb020OldU64Gate(format));
    assert.equal(exp["9cb020Sub0x64Present"](flags) >>> 0, M.gs9cb020Sub0x64Present(flags));
    assert.equal(exp["9cb020Sub0x6cPresent"](flags) >>> 0, M.gs9cb020Sub0x6cPresent(flags));
    assert.equal(exp["9cb020OldByteToBool"](byte) >>> 0, M.gs9cb020OldByteToBool(byte));
    assert.equal(exp["9cb020OldU64Type4"](field0) >>> 0, M.gs9cb020OldU64Type4(field0));
    assert.equal(exp["9c9c30FixedCount"]() >>> 0, M.gs9c9c30FixedCount());
    assert.equal(exp["9c9c30LoopMore"](remaining) >>> 0, M.gs9c9c30LoopMore(remaining));
    assert.equal(exp["9c9d66FixedCount"]() >>> 0, M.gs9c9d66FixedCount());
    assert.equal(exp["9c9d66LoopMore"](remaining) >>> 0, M.gs9c9d66LoopMore(remaining));
  }
});

test("v6 reader/fixed-loop guards are not vacuous (self-check)", () => {
  assert.notEqual(MODEL.gs9cb020Gate0x3b(0x3b), MODEL.gs9cb020Gate0x3b(0x3a));
  assert.notEqual(MODEL.gs9cb020Gate0x46(0x46), MODEL.gs9cb020Gate0x46(0x45));
  assert.notEqual(MODEL.gs9cb020Gate0x47(0x47), MODEL.gs9cb020Gate0x47(0x46));
  assert.notEqual(MODEL.gs9cb020Gate0x5b(0x5b), MODEL.gs9cb020Gate0x5b(0x5a));
  assert.notEqual(MODEL.gs9cb020Gate0x67(0x67), MODEL.gs9cb020Gate0x67(0x66));
  assert.notEqual(MODEL.gs9cb020Gate0x6c(0x6c), MODEL.gs9cb020Gate0x6c(0x6b));
  assert.notEqual(MODEL.gs9cb020Gate0x88(0x88), MODEL.gs9cb020Gate0x88(0x87));
  assert.notEqual(MODEL.gs9cb020Gate0x96(0x96), MODEL.gs9cb020Gate0x96(0x95));
  assert.notEqual(MODEL.gs9cb020Gate0x9e(0x9e), MODEL.gs9cb020Gate0x9e(0x9d));
  assert.notEqual(MODEL.gs9cb020OldU64Gate(0x46), MODEL.gs9cb020OldU64Gate(0x47), "R10 polarity");
  assert.equal(MODEL.gs9cb020OldU64Gate(0x100), 0, "R10 wide closed");
  assert.notEqual(MODEL.gs9cb020Sub0x64Present(1), MODEL.gs9cb020Sub0x64Present(2), "R11 bit 0 only");
  assert.notEqual(MODEL.gs9cb020Sub0x6cPresent(2), MODEL.gs9cb020Sub0x6cPresent(1), "R12 bit 1 only");
  assert.equal(MODEL.gs9cb020Sub0x64Present(0x100), 0, "R11 byte mask");
  assert.equal(MODEL.gs9cb020Sub0x6cPresent(0x200), 0, "R12 byte mask");
  assert.notEqual(MODEL.gs9cb020OldByteToBool(0), MODEL.gs9cb020OldByteToBool(1));
  assert.equal(MODEL.gs9cb020OldByteToBool(0x100), 0, "R13 byte mask");
  assert.notEqual(MODEL.gs9cb020OldU64Type4(4), MODEL.gs9cb020OldU64Type4(0));
  assert.equal(MODEL.gs9cb020OldU64Type4(0x100), 0, "R14 0x100 != 4");
  assert.equal(MODEL.gs9c9c30FixedCount(), 0xe);
  assert.equal(MODEL.gs9c9d66FixedCount(), 0x14);
  assert.notEqual(MODEL.gs9c9c30LoopMore(1), MODEL.gs9c9c30LoopMore(2), "T2 countdown");
  assert.equal(MODEL.gs9c9c30LoopMore(0), 1, "T2 wrap");
  assert.notEqual(MODEL.gs9c9d66LoopMore(1), MODEL.gs9c9d66LoopMore(2), "T4 countdown");
  assert.equal(MODEL.gs9c9d66LoopMore(0), 1, "T4 wrap");
});

test("ABI v6 reader/fixed-loop accessors: every R1..R14/T1..T4 wasm accessor pinned (assertion census)", () => {
  /* Every ABI-v6 constant accessor is pinned wasm-vs-model; a mutated
     header/cpp constant fails here. */
  const exp = loadExports();
  const rows = [
    ["9cb020EndVa", MODEL.GS9CB020_END_VA],
    ["9cb020BodyBytes", MODEL.GS9CB020_BODY_BYTES],
    ["9cb020NextVa", MODEL.GS9CB020_NEXT_VA],
    ["9cb020FormatOff", MODEL.GS9CB020_FORMAT_OFF],
    ["9cb020Vtbl14Slot", MODEL.GS9CB020_VTBL14_SLOT],
    ["9cb020RowWriterVa", MODEL.GS9CB020_ROW_WRITER_VA],
    ["9cb020RecurseCallVa", MODEL.GS9CB020_RECURSE_CALL_VA],
    ["9cb020Sub64CtorVa", MODEL.GS9CB020_SUB64_CTOR_VA],
    ["9cb020Sub6cCtorVa", MODEL.GS9CB020_SUB6C_CTOR_VA],
    ["9cb020FlagsOff", MODEL.GS9CB020_FLAGS_OFF],
    ["9cb020Sub64Off", MODEL.GS9CB020_SUB64_OFF],
    ["9cb020Sub6cOff", MODEL.GS9CB020_SUB6C_OFF],
    ["9cb020Sub64Alloc", MODEL.GS9CB020_SUB64_ALLOC],
    ["9cb020Sub6cAlloc", MODEL.GS9CB020_SUB6C_ALLOC],
    ["9cb020Sub64Bytes", MODEL.GS9CB020_SUB64_BYTES],
    ["9cb020OldCompatType", MODEL.GS9CB020_OLD_COMPAT_TYPE],
    ["9cb020AllocIat", MODEL.GS9CB020_ALLOC_IAT],
    ["9cb020FailAllocVa", MODEL.GS9CB020_FAIL_ALLOC_VA],
    ["9cb020Gate0x3bVa", MODEL.GS9CB020_GATE_0X3B_VA],
    ["9cb020Gate0x46Va", MODEL.GS9CB020_GATE_0X46_VA],
    ["9cb020Gate0x47Va", MODEL.GS9CB020_GATE_0X47_VA],
    ["9cb020Gate0x5bVa", MODEL.GS9CB020_GATE_0X5B_VA],
    ["9cb020Gate0x67Va", MODEL.GS9CB020_GATE_0X67_VA],
    ["9cb020Gate0x6cVa", MODEL.GS9CB020_GATE_0X6C_VA],
    ["9cb020Gate0x88Va", MODEL.GS9CB020_GATE_0X88_VA],
    ["9cb020Gate0x96Va", MODEL.GS9CB020_GATE_0X96_VA],
    ["9cb020Gate0x9eVa", MODEL.GS9CB020_GATE_0X9E_VA],
    ["9cb020OldU64GateVa", MODEL.GS9CB020_OLD_U64_GATE_VA],
    ["9cb020Bit0GateVa", MODEL.GS9CB020_BIT0_GATE_VA],
    ["9cb020Bit1GateVa", MODEL.GS9CB020_BIT1_GATE_VA],
    ["9cb020ByteToBoolVa", MODEL.GS9CB020_BYTE_TO_BOOL_VA],
    ["9cb020Type4GateVa", MODEL.GS9CB020_TYPE4_GATE_VA],
    ["9c9c30FixedCountVa", MODEL.GS9C9C30_COUNT_STORE_VA],
    ["9c9c30LoopHeadVa", MODEL.GS9C9C30_LOOP_HEAD_VA],
    ["9c9c30MoreVa", MODEL.GS9C9C30_MORE_VA],
    ["9c9c30BaseOff", MODEL.GS9C9C30_BASE_OFF],
    ["9c9c30Stride", MODEL.GS9C9C30_STRIDE],
    ["9c9d66FixedCountVa", MODEL.GS9C9D66_COUNT_STORE_VA],
    ["9c9d66LoopHeadVa", MODEL.GS9C9D66_LOOP_HEAD_VA],
    ["9c9d66MoreVa", MODEL.GS9C9D66_MORE_VA],
    ["9c9d66ValueBaseOff", MODEL.GS9C9D66_VALUE_BASE_OFF],
    ["9c9d66HolderBaseOff", MODEL.GS9C9D66_HOLDER_BASE_OFF],
    ["9c9d66ValueStride", MODEL.GS9C9D66_VALUE_STRIDE],
    ["9c9d66HolderStride", MODEL.GS9C9D66_HOLDER_STRIDE],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    assert.notEqual(want, 0, key + " pin is non-trivial");
  }
  // the v4-pinned reader-row identifiers still hold
  assert.equal(exp["9cb020Va"]() >>> 0, MODEL.GS9CB020_VA);
  assert.equal(exp["9cb020CallerCount"]() >>> 0, MODEL.gs9cb020CallerCount());
  for (let i = 0; i < 4; i++) {
    assert.equal(exp["9cb020CallerVaAt"](i) >>> 0, MODEL.GS9CB020_CALLER_VAS[i], `9cb020CallerVaAt(${i})`);
  }
  assert.equal(exp["9cb020CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
});

test("Wasm zero-import exports match JS oracle on fixed cases (ABI v7 loops)", () => {
  const exp = loadExports();
  const M = MODEL;

  // X1 reorder-table loop bound (PE 0x9c9dfe sub,1 ; jne): (remaining-1) != 0
  assert.equal(exp["9c9340ReorderLoopMore"](0x1fb) >>> 0, 1);
  assert.equal(exp["9c9340ReorderLoopMore"](2) >>> 0, 1);
  assert.equal(exp["9c9340ReorderLoopMore"](1) >>> 0, 0, "last iteration");
  assert.equal(exp["9c9340ReorderLoopMore"](0) >>> 0, 1, "0-1 wraps to 0xffffffff");
  assert.equal(exp["9c9340ReorderLoopMore"](0x100) >>> 0, 1, "0x100 wide-present (byte-narrow decay would exit)");
  assert.equal(exp["9c9340ReorderLoopMore"](0x101) >>> 0, 1);
  assert.equal(M.gs9c9340ReorderLoopMore(1), 0);
  assert.equal(M.gs9c9340ReorderLoopMore(0x100), 1);

  // X2 reorder value word (PE 0x9c9dc2 movzx edi,ax): entry & 0xffff
  assert.equal(exp["9c9340ReorderValueWord"](0) >>> 0, 0);
  assert.equal(exp["9c9340ReorderValueWord"](1) >>> 0, 1);
  assert.equal(exp["9c9340ReorderValueWord"](0xffff) >>> 0, 0xffff);
  assert.equal(exp["9c9340ReorderValueWord"](0x10000) >>> 0, 0, "0x10000 word is 0");
  assert.equal(exp["9c9340ReorderValueWord"](0x1234abcd) >>> 0, 0xabcd);
  assert.equal(exp["9c9340ReorderValueWord"](0xffffffff) >>> 0, 0xffff);
  assert.equal(M.gs9c9340ReorderValueWord(0x10000), 0);
  assert.equal(M.gs9c9340ReorderValueWord(0x1234abcd), 0xabcd);

  // Y1 lane base offset (PE 0x9caa97 add 0x1ead0 / 0x9cac1c add 0x320)
  assert.equal(exp["9c9340Lane7LaneBase"](0) >>> 0, 0x1ead0);
  assert.equal(exp["9c9340Lane7LaneBase"](1) >>> 0, 0x1edf0);
  assert.equal(exp["9c9340Lane7LaneBase"](6) >>> 0, 0x1fd90);
  assert.equal(exp["9c9340Lane7LaneBase"](7) >>> 0, 0x200b0);
  assert.equal(exp["9c9340Lane7LaneBase"](0xffffffff) >>> 0, 0x1e7b0, "u32 wrap: -0x320 + 0x1ead0 mod 2^32");
  assert.equal(M.gs9c9340Lane7LaneBase(6), 0x1fd90);

  // Y2 loop-1 value ptr (PE 0x9cab43 lea -0x31c / imul 0xb8 / add):
  // lane_base + (int8)i*0xb8 - 0x31c
  assert.equal(exp["9c9340Lane7Value1Ptr"](0x10000, 0) >>> 0, 0xfce4);
  assert.equal(exp["9c9340Lane7Value1Ptr"](0x10000, 1) >>> 0, 0xfd9c);
  assert.equal(exp["9c9340Lane7Value1Ptr"](0x10000, 0x80) >>> 0, 0xa0e4, "i 0x80 -> movsx -128: 0x10000-0x5c00-0x31c");
  assert.equal(exp["9c9340Lane7Value1Ptr"](0, 0x7f) >>> 0, 0x582c, "0x7f*0xb8-0x31c");
  assert.equal(M.gs9c9340Lane7Value1Ptr(0x10000, 1), 0xfd9c);
  assert.equal(M.gs9c9340Lane7Value1Ptr(0x10000, 0x80), 0xa0e4);

  // Y3 loop-1 holder ptr (PE 0x9cab53..0x9cab59): lane_base + (int8)i*0xc - 0x1ac
  assert.equal(exp["9c9340Lane7Holder1Ptr"](0x10000, 0) >>> 0, 0xfe54);
  assert.equal(exp["9c9340Lane7Holder1Ptr"](0x10000, 1) >>> 0, 0xfe60);
  assert.equal(exp["9c9340Lane7Holder1Ptr"](0x10000, 3) >>> 0, 0xfe78, "3*0xc-0x1ac = -0x188");
  assert.equal(M.gs9c9340Lane7Holder1Ptr(0x10000, 1), 0xfe60);

  // Y4 loop-2 value ptr (PE 0x9cabc4 imul 0xb8 / add -0x194 / add esi)
  assert.equal(exp["9c9340Lane7Value2Ptr"](0x10000, 0) >>> 0, 0xfe6c);
  assert.equal(exp["9c9340Lane7Value2Ptr"](0x10000, 1) >>> 0, 0xff24);
  assert.equal(exp["9c9340Lane7Value2Ptr"](0x10000, 0x80) >>> 0, 0xa26c, "0x10000-0x5c00-0x194");
  assert.equal(M.gs9c9340Lane7Value2Ptr(0x10000, 1), 0xff24);

  // Y5 loop-2 holder ptr (PE 0x9cabca add -3 / lea chain): lane_base + (int8)i*0xc - 0x24
  assert.equal(exp["9c9340Lane7Holder2Ptr"](0x10000, 0) >>> 0, 0xffdc);
  assert.equal(exp["9c9340Lane7Holder2Ptr"](0x10000, 1) >>> 0, 0xffe8);
  assert.equal(exp["9c9340Lane7Holder2Ptr"](0x10000, 2) >>> 0, 0xfff4, "2*0xc-0x24 = -0xc (12*(2-3))");
  assert.equal(exp["9c9340Lane7Holder2Ptr"](0x10000, 3) >>> 0, 0x10000, "3*0xc-0x24 = 0");
  assert.equal(M.gs9c9340Lane7Holder2Ptr(0x10000, 2), 0xfff4);
});

test("Wasm vs JS differential: reorder + 7-lane per-lane laws (ABI v7)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV7 = mulberry32(0x9caa91);
  const rnd = () => Math.floor(rngV7() * 0x100000000) >>> 0;
  for (let i = 0; i < 200; i++) {
    const remaining = rnd();
    const entry = rnd();
    const lane = rnd();
    const laneBase = rnd();
    const idx = rnd();
    assert.equal(exp["9c9340ReorderLoopMore"](remaining) >>> 0, M.gs9c9340ReorderLoopMore(remaining));
    assert.equal(exp["9c9340ReorderValueWord"](entry) >>> 0, M.gs9c9340ReorderValueWord(entry));
    assert.equal(exp["9c9340Lane7LaneBase"](lane) >>> 0, M.gs9c9340Lane7LaneBase(lane));
    assert.equal(exp["9c9340Lane7Value1Ptr"](laneBase, idx) >>> 0, M.gs9c9340Lane7Value1Ptr(laneBase, idx));
    assert.equal(exp["9c9340Lane7Holder1Ptr"](laneBase, idx) >>> 0, M.gs9c9340Lane7Holder1Ptr(laneBase, idx));
    assert.equal(exp["9c9340Lane7Value2Ptr"](laneBase, idx) >>> 0, M.gs9c9340Lane7Value2Ptr(laneBase, idx));
    assert.equal(exp["9c9340Lane7Holder2Ptr"](laneBase, idx) >>> 0, M.gs9c9340Lane7Holder2Ptr(laneBase, idx));
  }
});

test("v7 reorder/lane guards are not vacuous (self-check)", () => {
  assert.notEqual(MODEL.gs9c9340ReorderLoopMore(1), MODEL.gs9c9340ReorderLoopMore(2));
  assert.equal(MODEL.gs9c9340ReorderLoopMore(1), 0, "countdown last iteration");
  assert.notEqual(MODEL.gs9c9340ReorderValueWord(0), MODEL.gs9c9340ReorderValueWord(0xffff));
  assert.equal(MODEL.gs9c9340ReorderValueWord(0x10000), 0, "word truncation");
  assert.notEqual(MODEL.gs9c9340Lane7LaneBase(0), MODEL.gs9c9340Lane7LaneBase(1), "stride 0x320");
  assert.equal(MODEL.gs9c9340Lane7LaneBase(6) - MODEL.gs9c9340Lane7LaneBase(0), 6 * 0x320);
  assert.notEqual(MODEL.gs9c9340Lane7Value1Ptr(0, 0), MODEL.gs9c9340Lane7Value1Ptr(0, 1), "stride 0xb8");
  assert.notEqual(MODEL.gs9c9340Lane7Value1Ptr(0x10000, 0x80), MODEL.gs9c9340Lane7Value1Ptr(0x10000, 0), "movsx i8 index: i 0x80 is -128, not 0");
  assert.notEqual(MODEL.gs9c9340Lane7Holder1Ptr(0, 0), MODEL.gs9c9340Lane7Holder1Ptr(0, 1), "holder stride 0xc");
  assert.notEqual(MODEL.gs9c9340Lane7Value2Ptr(0, 0), MODEL.gs9c9340Lane7Value2Ptr(0, 1));
  assert.notEqual(MODEL.gs9c9340Lane7Holder2Ptr(0, 0), MODEL.gs9c9340Lane7Holder2Ptr(0, 1));
  assert.equal(MODEL.gs9c9340Lane7Holder2Ptr(0, 3), 0, "12*(3-3) == 0");
});

test("ABI v7 accessors: every X1..X2/Y1..Y5 wasm accessor pinned (assertion census)", () => {
  const exp = loadExports();
  const rows = [
    ["9c9340ReorderLoopMoreVa", MODEL.GS9C9340_REORDER_LOOP_MORE_VA],
    ["9c9340ReorderLoopMoreVa2", MODEL.GS9C9340_REORDER_LOOP_MORE_JNE_VA],
    ["9c9340ReorderValueWordVa", MODEL.GS9C9340_REORDER_VALUE_WORD_VA],
    ["9c9340ReorderValueWordVa2", MODEL.GS9C9340_REORDER_VALUE_STORE_VA],
    ["9c9340Lane7LaneBaseVa", MODEL.GS9C9340_LANE7_LANE_BASE_VA],
    ["9c9340Lane7LaneBaseVa2", MODEL.GS9C9340_LANE7_STRIDE_ADD_VA],
    ["9c9340Lane7Elem1ValueVa", MODEL.GS9C9340_LANE7_ELEM1_VALUE_VA],
    ["9c9340Lane7Elem1HolderVa", MODEL.GS9C9340_LANE7_ELEM1_HOLDER_VA],
    ["9c9340Lane7Elem2ValueVa", MODEL.GS9C9340_LANE7_ELEM2_VALUE_VA],
    ["9c9340Lane7Elem2HolderVa", MODEL.GS9C9340_LANE7_ELEM2_HOLDER_VA],
    ["9c9340Lane7Elem1ValueOff", MODEL.GS9C9340_LANE7_ELEM1_VALUE_OFF],
    ["9c9340Lane7Elem1HolderOff", MODEL.GS9C9340_LANE7_ELEM1_HOLDER_OFF],
    ["9c9340Lane7Elem2ValueOff", MODEL.GS9C9340_LANE7_ELEM2_VALUE_OFF],
    ["9c9340Lane7Elem2HolderOff", MODEL.GS9C9340_LANE7_ELEM2_HOLDER_OFF],
    ["9c9340Lane7ByteOff1", MODEL.GS9C9340_LANE7_BYTE_OFF_1],
    ["9c9340Lane7ByteOff2", MODEL.GS9C9340_LANE7_BYTE_OFF_2],
    ["9c9340Lane7ByteOff3", MODEL.GS9C9340_LANE7_BYTE_OFF_3],
    ["9c9340Lane7ByteOff4", MODEL.GS9C9340_LANE7_BYTE_OFF_4],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    if (key !== "9c9340Lane7ByteOff4") {
      assert.notEqual(want, 0, key + " pin is non-trivial");
    }
  }
});

test("Wasm zero-import exports match JS oracle on fixed cases (ABI v8)", () => {
  const exp = loadExports();
  const M = MODEL;

  // V1 io-ready (PE 0x9cb65d test al,al ; jne FAIL): LOW-BYTE == 0
  for (const v of [0, 0x100, 0x200, 0x1ff00]) {
    assert.equal(exp["9cb620IoReady"](v) >>> 0, 1, `io_ready(${v})`);
    assert.equal(M.gs9cb620IoReady(v), 1);
  }
  for (const v of [1, 0xff, 0x101, 0xffffffff]) {
    assert.equal(exp["9cb620IoReady"](v) >>> 0, 0, `io_ready(${v})`);
    assert.equal(M.gs9cb620IoReady(v), 0);
  }

  // V2..V5 io+8 format gates — FULL-dword UNSIGNED >= N
  assert.equal(exp["9cb620IoGate0x3d"](0x3c) >>> 0, 0);
  assert.equal(exp["9cb620IoGate0x3d"](0x3d) >>> 0, 1);
  assert.equal(exp["9cb620IoGate0x3d"](0x100) >>> 0, 1, "0x100 >= every threshold");
  assert.equal(exp["9cb620IoGate0x4b"](0x4a) >>> 0, 0);
  assert.equal(exp["9cb620IoGate0x4b"](0x4b) >>> 0, 1);
  assert.equal(exp["9cb620IoGate0x7b"](0x7a) >>> 0, 0);
  assert.equal(exp["9cb620IoGate0x7b"](0x7b) >>> 0, 1);
  assert.equal(exp["9cb620IoGate0x7d"](0x7c) >>> 0, 0);
  assert.equal(exp["9cb620IoGate0x7d"](0x7d) >>> 0, 1);
  assert.equal(exp["9cb620IoGate0x7d"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9cb620IoGate0x3d(0x3d), 1);
  assert.equal(M.gs9cb620IoGate0x4b(0x4a), 0);
  assert.equal(M.gs9cb620IoGate0x7b(0x7b), 1);
  assert.equal(M.gs9cb620IoGate0x7d(0x7d), 1);

  // V6..V9 gs format gates — FULL-dword UNSIGNED >= N
  assert.equal(exp["9cb620GsGate0x21"](0x20) >>> 0, 0);
  assert.equal(exp["9cb620GsGate0x21"](0x21) >>> 0, 1);
  assert.equal(exp["9cb620GsGate0x3f"](0x3e) >>> 0, 0);
  assert.equal(exp["9cb620GsGate0x3f"](0x3f) >>> 0, 1);
  assert.equal(exp["9cb620GsGate0x49"](0x48) >>> 0, 0);
  assert.equal(exp["9cb620GsGate0x49"](0x49) >>> 0, 1);
  assert.equal(exp["9cb620GsGate0x82"](0x81) >>> 0, 0);
  assert.equal(exp["9cb620GsGate0x82"](0x82) >>> 0, 1);
  assert.equal(exp["9cb620GsGate0x82"](0x100) >>> 0, 1);
  assert.equal(M.gs9cb620GsGate0x21(0x21), 1);
  assert.equal(M.gs9cb620GsGate0x3f(0x3f), 1);
  assert.equal(M.gs9cb620GsGate0x49(0x48), 0);
  assert.equal(M.gs9cb620GsGate0x82(0x82), 1);

  // V10 slot count gate — FULL-dword != 0
  assert.equal(exp["9cb620SlotCountNeeded"](0) >>> 0, 0);
  assert.equal(exp["9cb620SlotCountNeeded"](1) >>> 0, 1);
  assert.equal(exp["9cb620SlotCountNeeded"](0x100) >>> 0, 1, "0x100 count present");
  assert.equal(exp["9cb620SlotCountNeeded"](0xffffffff) >>> 0, 1);
  assert.equal(M.gs9cb620SlotCountNeeded(0x100), 1);

  // V11 string-copy ptr gate — FULL-dword != 0
  assert.equal(exp["9cb620StringCopyNeeded"](0) >>> 0, 0);
  assert.equal(exp["9cb620StringCopyNeeded"](1) >>> 0, 1);
  assert.equal(exp["9cb620StringCopyNeeded"](0x100) >>> 0, 1, "0x100 ptr present");
  assert.equal(M.gs9cb620StringCopyNeeded(0x100), 1);

  // V12 slot bool — SIGNED (setg); 0x80000000..0xffffffff are NEGATIVE
  assert.equal(exp["9cb620SlotPositive"](0) >>> 0, 0);
  assert.equal(exp["9cb620SlotPositive"](1) >>> 0, 1);
  assert.equal(exp["9cb620SlotPositive"](0x7fffffff) >>> 0, 1, "INT32_MAX positive");
  assert.equal(exp["9cb620SlotPositive"](0x80000000) >>> 0, 0, "INT32_MIN negative");
  assert.equal(exp["9cb620SlotPositive"](0xffffffff) >>> 0, 0, "-1 negative");
  assert.equal(exp["9cb620SlotPositive"](0x100) >>> 0, 1);
  assert.equal(M.gs9cb620SlotPositive(0x80000000), 0);
  assert.equal(M.gs9cb620SlotPositive(0xffffffff), 0);

  // V13 slot-table bound — UNSIGNED byte_off < 0x3800
  assert.equal(exp["9cb620SlotMore"](0) >>> 0, 1);
  assert.equal(exp["9cb620SlotMore"](0x37ff) >>> 0, 1);
  assert.equal(exp["9cb620SlotMore"](0x3800) >>> 0, 0, "boundary excluded");
  assert.equal(exp["9cb620SlotMore"](0x3801) >>> 0, 0);
  assert.equal(exp["9cb620SlotMore"](0xffffffff) >>> 0, 0);
  assert.equal(M.gs9cb620SlotMore(0x3800), 0);

  // V14..V17 sub-array gates — FULL-dword entry + UNSIGNED bound
  assert.equal(exp["9cb620Array74Needed"](0) >>> 0, 0);
  assert.equal(exp["9cb620Array74Needed"](0x100) >>> 0, 1);
  assert.equal(exp["9cb620Array74More"](0, 1) >>> 0, 1);
  assert.equal(exp["9cb620Array74More"](1, 1) >>> 0, 0, "idx == count exits");
  assert.equal(exp["9cb620Array74More"](0x100, 1) >>> 0, 0, "UNSIGNED: 0x100 !< 1");
  assert.equal(exp["9cb620Array88Needed"](0) >>> 0, 0);
  assert.equal(exp["9cb620Array88Needed"](1) >>> 0, 1);
  assert.equal(exp["9cb620Array88More"](1, 2) >>> 0, 1);
  assert.equal(exp["9cb620Array88More"](2, 2) >>> 0, 0);
  assert.equal(M.gs9cb620Array74More(1, 1), 0);
  assert.equal(M.gs9cb620Array88More(2, 2), 0);

  // V18 fixed-8 count — constant 8
  assert.equal(exp["9cb620Fixed8Count"]() >>> 0, 8);
  assert.equal(M.gs9cb620Fixed8Count(), 8);

  // V19 fixed-8 bound — ((remaining-1) != 0) countdown
  assert.equal(exp["9cb620Fixed8More"](8) >>> 0, 1);
  assert.equal(exp["9cb620Fixed8More"](2) >>> 0, 1);
  assert.equal(exp["9cb620Fixed8More"](1) >>> 0, 0, "last iteration");
  assert.equal(exp["9cb620Fixed8More"](0) >>> 0, 1, "0-1 wraps to 0xffffffff");
  assert.equal(M.gs9cb620Fixed8More(1), 0);

  // V20 flag-byte gate — LOW-BYTE != 0
  for (const v of [1, 0xff, 0x101]) {
    assert.equal(exp["9cb620FlagByteSet"](v) >>> 0, 1, `flag(${v})`);
    assert.equal(M.gs9cb620FlagByteSet(v), 1);
  }
  assert.equal(exp["9cb620FlagByteSet"](0) >>> 0, 0);
  assert.equal(exp["9cb620FlagByteSet"](0x100) >>> 0, 0, "0x100 byte is 0");
  assert.equal(exp["9cb620FlagByteSet"](0x200) >>> 0, 0);
  assert.equal(M.gs9cb620FlagByteSet(0x100), 0);
});

test("Wasm vs JS differential: pill-reader gates (ABI v8)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV8 = mulberry32(0x9cb620);
  const rnd = () => Math.floor(rngV8() * 0x100000000) >>> 0;
  for (let i = 0; i < 200; i++) {
    const openAl = rnd();
    const format = rnd();
    const count = rnd();
    const ptr60 = rnd();
    const byteOff = rnd();
    const idx = rnd();
    const cnt = rnd();
    const byte = rnd();
    const remaining = rnd();
    assert.equal(exp["9cb620IoReady"](openAl) >>> 0, M.gs9cb620IoReady(openAl));
    assert.equal(exp["9cb620IoGate0x3d"](format) >>> 0, M.gs9cb620IoGate0x3d(format));
    assert.equal(exp["9cb620IoGate0x4b"](format) >>> 0, M.gs9cb620IoGate0x4b(format));
    assert.equal(exp["9cb620IoGate0x7b"](format) >>> 0, M.gs9cb620IoGate0x7b(format));
    assert.equal(exp["9cb620IoGate0x7d"](format) >>> 0, M.gs9cb620IoGate0x7d(format));
    assert.equal(exp["9cb620GsGate0x21"](format) >>> 0, M.gs9cb620GsGate0x21(format));
    assert.equal(exp["9cb620GsGate0x3f"](format) >>> 0, M.gs9cb620GsGate0x3f(format));
    assert.equal(exp["9cb620GsGate0x49"](format) >>> 0, M.gs9cb620GsGate0x49(format));
    assert.equal(exp["9cb620GsGate0x82"](format) >>> 0, M.gs9cb620GsGate0x82(format));
    assert.equal(exp["9cb620SlotCountNeeded"](count) >>> 0, M.gs9cb620SlotCountNeeded(count));
    assert.equal(exp["9cb620StringCopyNeeded"](ptr60) >>> 0, M.gs9cb620StringCopyNeeded(ptr60));
    assert.equal(exp["9cb620SlotPositive"](count) >>> 0, M.gs9cb620SlotPositive(count));
    assert.equal(exp["9cb620SlotMore"](byteOff) >>> 0, M.gs9cb620SlotMore(byteOff));
    assert.equal(exp["9cb620Array74Needed"](count) >>> 0, M.gs9cb620Array74Needed(count));
    assert.equal(exp["9cb620Array74More"](idx, cnt) >>> 0, M.gs9cb620Array74More(idx, cnt));
    assert.equal(exp["9cb620Array88Needed"](count) >>> 0, M.gs9cb620Array88Needed(count));
    assert.equal(exp["9cb620Array88More"](idx, cnt) >>> 0, M.gs9cb620Array88More(idx, cnt));
    assert.equal(exp["9cb620Fixed8Count"]() >>> 0, M.gs9cb620Fixed8Count());
    assert.equal(exp["9cb620Fixed8More"](remaining) >>> 0, M.gs9cb620Fixed8More(remaining));
    assert.equal(exp["9cb620FlagByteSet"](byte) >>> 0, M.gs9cb620FlagByteSet(byte));
  }
});

test("v8 pill-reader guards are not vacuous (self-check)", () => {
  assert.notEqual(MODEL.gs9cb620IoReady(0), MODEL.gs9cb620IoReady(1), "io-ready byte gate");
  assert.equal(MODEL.gs9cb620IoReady(0x100), 1, "0x100 -> byte 0 -> ready");
  assert.notEqual(MODEL.gs9cb620IoGate0x3d(0x3c), MODEL.gs9cb620IoGate0x3d(0x3d), ">= vs <");
  assert.notEqual(MODEL.gs9cb620IoGate0x4b(0x4a), MODEL.gs9cb620IoGate0x4b(0x4b));
  assert.notEqual(MODEL.gs9cb620IoGate0x7b(0x7a), MODEL.gs9cb620IoGate0x7b(0x7b));
  assert.notEqual(MODEL.gs9cb620IoGate0x7d(0x7c), MODEL.gs9cb620IoGate0x7d(0x7d));
  assert.notEqual(MODEL.gs9cb620GsGate0x21(0x20), MODEL.gs9cb620GsGate0x21(0x21));
  assert.notEqual(MODEL.gs9cb620GsGate0x3f(0x3e), MODEL.gs9cb620GsGate0x3f(0x3f));
  assert.notEqual(MODEL.gs9cb620GsGate0x49(0x48), MODEL.gs9cb620GsGate0x49(0x49));
  assert.notEqual(MODEL.gs9cb620GsGate0x82(0x81), MODEL.gs9cb620GsGate0x82(0x82));
  assert.notEqual(MODEL.gs9cb620SlotCountNeeded(0), MODEL.gs9cb620SlotCountNeeded(0x100), "FULL-dword count");
  assert.notEqual(MODEL.gs9cb620StringCopyNeeded(0), MODEL.gs9cb620StringCopyNeeded(1));
  assert.notEqual(MODEL.gs9cb620SlotPositive(0x7fffffff), MODEL.gs9cb620SlotPositive(0x80000000), "SIGNED setg: INT32_MAX vs INT32_MIN");
  assert.equal(MODEL.gs9cb620SlotPositive(0xffffffff), 0, "-1 negative");
  assert.notEqual(MODEL.gs9cb620SlotMore(0x37ff), MODEL.gs9cb620SlotMore(0x3800), "0x3800 bound");
  assert.notEqual(MODEL.gs9cb620Array74Needed(0), MODEL.gs9cb620Array74Needed(1));
  assert.notEqual(MODEL.gs9cb620Array74More(1, 2), MODEL.gs9cb620Array74More(2, 2), "UNSIGNED bound");
  assert.notEqual(MODEL.gs9cb620Array88Needed(0), MODEL.gs9cb620Array88Needed(1));
  assert.notEqual(MODEL.gs9cb620Array88More(1, 2), MODEL.gs9cb620Array88More(2, 2));
  assert.equal(MODEL.gs9cb620Fixed8Count(), 8);
  assert.notEqual(MODEL.gs9cb620Fixed8More(1), MODEL.gs9cb620Fixed8More(2), "fixed-8 countdown");
  assert.equal(MODEL.gs9cb620Fixed8More(1), 0, "last iteration");
  assert.notEqual(MODEL.gs9cb620FlagByteSet(0), MODEL.gs9cb620FlagByteSet(1), "flag byte gate");
  assert.equal(MODEL.gs9cb620FlagByteSet(0x100), 0, "0x100 -> byte 0 -> clear");
});

test("ABI v8 accessors: every V1..V20 wasm accessor pinned (assertion census)", () => {
  const exp = loadExports();
  const rows = [
    ["9cb620Va", MODEL.GS9CB620_VA],
    ["9cb620EndVa", MODEL.GS9CB620_END_VA],
    ["9cb620BodyBytes", MODEL.GS9CB620_BODY_BYTES],
    ["9cb620NextVa", MODEL.GS9CB620_NEXT_VA],
    ["9cb620SehHandlerDat", MODEL.GS9CB620_SEH_HANDLER_DAT],
    ["9cb620IoFormatOff", MODEL.GS9CB620_IO_FORMAT_OFF],
    ["9cb620GsFormatOff", MODEL.GS9CB620_GS_FORMAT_OFF],
    ["9cb620IoVtbl10Slot", MODEL.GS9CB620_IO_VTBL10_SLOT],
    ["9cb620Vtbl14Slot", MODEL.GS9CB620_VTBL14_SLOT],
    ["9cb620RowWriterVa", MODEL.GS9CB620_ROW_WRITER_VA],
    ["9cb620SerializerRowCallVa", MODEL.GS9CB620_SERIALIZER_ROW_CALL_VA],
    ["9cb620ReaderRowCall74Va", MODEL.GS9CB620_READER_ROW_CALL_74_VA],
    ["9cb620ReaderRowCall88Va", MODEL.GS9CB620_READER_ROW_CALL_88_VA],
    ["9cb620VectorCtorVa", MODEL.GS9CB620_VECTOR_CTOR_VA],
    ["9cb620VectorInitVa", MODEL.GS9CB620_VECTOR_INIT_VA],
    ["9cb620ListInsertVa", MODEL.GS9CB620_LIST_INSERT_VA],
    ["9cb620StringCopyVa", MODEL.GS9CB620_STRING_COPY_VA],
    ["9cb620StringEmptyDat", MODEL.GS9CB620_STRING_EMPTY_DAT],
    ["9cb620FlagsOff", MODEL.GS9CB620_FLAGS_OFF],
    ["9cb620FlagBit0", MODEL.GS9CB620_FLAG_BIT_0],
    ["9cb620FlagBit1", MODEL.GS9CB620_FLAG_BIT_1],
    ["9cb620FlagBit2", MODEL.GS9CB620_FLAG_BIT_2],
    ["9cb620FlagBit3", MODEL.GS9CB620_FLAG_BIT_3],
    ["9cb620FlagBit4", MODEL.GS9CB620_FLAG_BIT_4],
    ["9cb620FlagBit5", MODEL.GS9CB620_FLAG_BIT_5],
    ["9cb620TableOff", MODEL.GS9CB620_TABLE_OFF],
    ["9cb620TableBytes", MODEL.GS9CB620_TABLE_BYTES],
    ["9cb620TableStride", MODEL.GS9CB620_TABLE_STRIDE],
    ["9cb620TableSlots", MODEL.GS9CB620_TABLE_SLOTS],
    ["9cb620Array74Off", MODEL.GS9CB620_ARRAY74_OFF],
    ["9cb620Array88Off", MODEL.GS9CB620_ARRAY88_OFF],
    ["9cb620ArrayStride", MODEL.GS9CB620_ARRAY_STRIDE],
    ["9cb620Fixed8CountVa", MODEL.GS9CB620_FIXED8_COUNT_STORE_VA],
    ["9cb620Fixed8MoreVa", MODEL.GS9CB620_FIXED8_MORE_VA],
    ["9cb620IoReadyGateVa", MODEL.GS9CB620_IO_READY_GATE_VA],
    ["9cb620IoReadyGateVa2", MODEL.GS9CB620_IO_READY_GATE_VA_2],
    ["9cb620IoReadyGateVa3", MODEL.GS9CB620_IO_READY_GATE_VA_3],
    ["9cb620IoReadyGateVa4", MODEL.GS9CB620_IO_READY_GATE_VA_4],
    ["9cb620IoGate0x3dVa", MODEL.GS9CB620_IO_GATE_0X3D_VA],
    ["9cb620IoGate0x4bVa", MODEL.GS9CB620_IO_GATE_0X4B_VA],
    ["9cb620IoGate0x7bVa", MODEL.GS9CB620_IO_GATE_0X7B_VA],
    ["9cb620IoGate0x7bJneVa", MODEL.GS9CB620_IO_GATE_0X7B_JNE_VA],
    ["9cb620IoGate0x7dVa", MODEL.GS9CB620_IO_GATE_0X7D_VA],
    ["9cb620IoGate0x7dJneVa", MODEL.GS9CB620_IO_GATE_0X7D_JNE_VA],
    ["9cb620GsGate0x21Va", MODEL.GS9CB620_GS_GATE_0X21_VA],
    ["9cb620GsGate0x3fVa", MODEL.GS9CB620_GS_GATE_0X3F_VA],
    ["9cb620GsGate0x3fJneVa", MODEL.GS9CB620_GS_GATE_0X3F_JNE_VA],
    ["9cb620GsGate0x49Va", MODEL.GS9CB620_GS_GATE_0X49_VA],
    ["9cb620GsGate0x49JneVa", MODEL.GS9CB620_GS_GATE_0X49_JNE_VA],
    ["9cb620GsGate0x82Va", MODEL.GS9CB620_GS_GATE_0X82_VA],
    ["9cb620SlotCountGateVa", MODEL.GS9CB620_SLOT_COUNT_GATE_VA],
    ["9cb620StringCopyGateVa", MODEL.GS9CB620_STRING_COPY_GATE_VA],
    ["9cb620SlotPositiveVa", MODEL.GS9CB620_SLOT_POSITIVE_VA],
    ["9cb620SlotMoreVa", MODEL.GS9CB620_SLOT_MORE_VA],
    ["9cb620Array74NeededVa", MODEL.GS9CB620_ARRAY74_NEEDED_VA],
    ["9cb620Array74MoreVa", MODEL.GS9CB620_ARRAY74_MORE_VA],
    ["9cb620Array88NeededVa", MODEL.GS9CB620_ARRAY88_NEEDED_VA],
    ["9cb620Array88MoreVa", MODEL.GS9CB620_ARRAY88_MORE_VA],
    ["9cb620FlagGateVa", MODEL.GS9CB620_FLAG_GATE_VA],
    ["9cb620FlagBit1OrVa", MODEL.GS9CB620_FLAG_BIT1_OR_VA],
    ["9cb620FlagBit2OrVa", MODEL.GS9CB620_FLAG_BIT2_OR_VA],
    ["9cb620FlagBit3OrVa", MODEL.GS9CB620_FLAG_BIT3_OR_VA],
    ["9cb620FlagBit4OrVa", MODEL.GS9CB620_FLAG_BIT4_OR_VA],
    ["9cb620FlagBit5OrVa", MODEL.GS9CB620_FLAG_BIT5_OR_VA],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    assert.notEqual(want, 0, key + " pin is non-trivial");
  }
  assert.equal(exp["9cb620CallerCount"]() >>> 0, MODEL.gs9cb620CallerCount());
  for (let i = 0; i < 4; i++) {
    assert.equal(exp["9cb620CallerVaAt"](i) >>> 0, MODEL.GS9CB620_CALLER_VAS[i], `9cb620CallerVaAt(${i})`);
  }
  assert.equal(exp["9cb620CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
});
test("v9 model constants agree with the pinned PE values", () => {
  assert.equal(MODEL.GS9CC1A0_VA, 0x009cc1a0);
  assert.equal(MODEL.GS9CC1A0_END_VA, 0x009ce597);
  assert.equal(MODEL.GS9CC1A0_BODY_BYTES, 0x23f7);
  assert.equal(MODEL.GS9CC1A0_NEXT_VA, 0x009ce5a0);
  assert.equal(MODEL.GS9CC1A0_SEH_HANDLER_DAT, 0x00b0f33b);
  assert.equal(MODEL.GS9CC1A0_GS_COOKIE_DAT, 0x00bf93b4);
  assert.equal(MODEL.GS9CC1A0_IO_FORMAT_STORE_VA, 0x009cc352);
  assert.equal(MODEL.GS9CC1A0_DELETE_CALL_VA, 0x009cc254);
  assert.equal(MODEL.GS9CC1A0_CHECKSUM_MAGIC, 0x96696996);
  assert.equal(MODEL.GS9CC1A0_MGR_GLOBAL_DAT, 0x00c7169c);
  assert.equal(MODEL.GS9CC1A0_MGR_F98_OFF, 0xf98);
  assert.equal(MODEL.GS9CC1A0_LANE19C_BOUND, 0x1fb);
  assert.equal(MODEL.GS9CC1A0_TABLE19D1C_END, 0x19d1c);
  assert.equal(MODEL.GS9CC1A0_BYTE80_BOUND, 0x50);
  assert.equal(MODEL.GS9CC1A0_BYTE4D_BOUND, 0x4d);
  assert.equal(MODEL.GS9CC1A0_WORD25_BOUND, 0x25);
  assert.equal(MODEL.GS9CC1A0_CLAMP35_CONST, 0x35);
  assert.equal(MODEL.GS9CC1A0_CLAMP1A_CONST, 0x1a);
  for (const [k, n] of Object.entries({
    GS9CC1A0_GS_GATE_0X2B_VA: 0x009cc761, GS9CC1A0_GS_GATE_0X33_VA: 0x009cc35a,
    GS9CC1A0_GS_GATE_0X42_VA: 0x009cdedb, GS9CC1A0_GS_GATE_0X43_VA: 0x009cc510,
    GS9CC1A0_GS_GATE_0X57_VA: 0x009cc444, GS9CC1A0_GS_GATE_0X86_VA: 0x009cd355,
    GS9CC1A0_GS_GATE_0X89_VA: 0x009ce2b6, GS9CC1A0_GS_GATE_0X8D_VA: 0x009cd71c,
    GS9CC1A0_GS_GATE_0X93_VA: 0x009cc4a9, GS9CC1A0_GS_GATE_0X9B_VA: 0x009cc4c1,
    GS9CC1A0_IO_GATE_0X56_VA: 0x009cccb7, GS9CC1A0_IO_GATE_0X7C_VA: 0x009cd1d9,
    GS9CC1A0_IO_GATE_0XA5_VA: 0x009cd246, GS9CC1A0_DISPATCH0_VA: 0x009cce5d,
    GS9CC1A0_DISPATCH7_VA: 0x009ccf06, GS9CC1A0_DISPATCH_SECOND_PASS_VA: 0x009ccfc3,
    GS9CC1A0_T164_COUNT_VA: 0x009ccc64, GS9CC1A0_COUNT_1FB_GATE_VA: 0x009ccf1e,
    GS9CC1A0_TABLE_19D1C_MORE_VA: 0x009cd158, GS9CC1A0_BYTE_0X50_MORE_VA: 0x009cdbe0,
    GS9CC1A0_BYTE_0X4D_MORE_VA: 0x009cdb63, GS9CC1A0_WORD_0X25_MORE_VA: 0x009cdf86,
    GS9CC1A0_WORD_MORE_VA: 0x009cdf42, GS9CC1A0_COUNT8_MORE_VA: 0x009cdc62,
    GS9CC1A0_SIGNED_BYTE_POS_VA: 0x009cd772, GS9CC1A0_SIGNED_IDX_MOVSX8_VA: 0x009cd86e,
    GS9CC1A0_SIGNED_IDX_COUNT_VA: 0x009cdec9, GS9CC1A0_SIGNED_BYTE_LT_VA: 0x009ce358,
    GS9CC1A0_BYTE_ZERO_GATE_VA: 0x009cc301, GS9CC1A0_TAIL_READY_GATE_VA: 0x009ce55f,
    GS9CC1A0_CHECKSUM_PASS_VA: 0x009cc313, GS9CC1A0_CHECKSUM_MATCH_VA: 0x009ce545,
    GS9CC1A0_CLAMP35_VA: 0x009cc3e7, GS9CC1A0_CLAMP1A_VA: 0x009ccb13,
  })) {
    assert.equal(MODEL[k], n, k);
  }
  assert.equal(MODEL.gs9cc1a0CallerCount(), 3);
  assert.equal(MODEL.GS9CC1A0_CALLER_VAS[0], 0x00918366);
  assert.equal(MODEL.GS9CC1A0_CALLER_VAS[2], 0x009ce677);
});
test("v10 model constants agree with the pinned PE values", () => {
  assert.equal(MODEL.GS9CE720_VA, 0x9ce720);
  assert.equal(MODEL.GS9CE720_END_VA, 0x9cec74);
  assert.equal(MODEL.GS9CE720_BODY_BYTES, 0x154);
  assert.equal(MODEL.GS9CE720_NEXT_VA, 0x9cec80);
  assert.equal(MODEL.GS9CE720_IO_FORMAT_OFF, 0x8);
  assert.equal(MODEL.GS9CE720_MGR_GLOBAL_DAT, 0xc7169c);
  assert.equal(MODEL.GS9CE720_MGR_VEC_A_START_OFF, 0x2a404);
  assert.equal(MODEL.GS9CE720_MGR_VEC_A_END_OFF, 0x2a408);
  assert.equal(MODEL.GS9CE720_MGR_VEC_B_START_OFF, 0x2a410);
  assert.equal(MODEL.GS9CE720_MGR_VEC_B_END_OFF, 0x2a414);
  assert.equal(MODEL.GS9D05D0_VA, 0x9d05d0);
  assert.equal(MODEL.GS9D05D0_END_VA, 0x9d45b7);
  assert.equal(MODEL.GS9D05D0_BODY_BYTES, 0x3fe7);
  assert.equal(MODEL.GS9D05D0_NEXT_VA, 0x9d45c0);
  assert.equal(MODEL.GS9D05D0_SEH_HANDLER_DAT, 0xb0f39e);
  assert.equal(MODEL.GS9D05D0_GS_COOKIE_DAT, 0xbf93b4);
  assert.equal(MODEL.GS9D05D0_IO_FORMAT_OFF, 0x8);
  assert.equal(MODEL.GS9D05D0_READER_ROW_CALL_VA, 0x9d1df0);
  assert.equal(MODEL.GS9D05D0_MGR_GLOBAL_DAT, 0xc7169c);
  assert.equal(MODEL.GS9D05D0_MGR_VEC_2A404, 0x2a404);
  assert.equal(MODEL.GS9D05D0_MGR_VEC_2A408, 0x2a408);
  assert.equal(MODEL.GS9D05D0_MGR_VEC_2A410, 0x2a410);
  assert.equal(MODEL.GS9D05D0_MGR_VEC_2A414, 0x2a414);
  assert.equal(MODEL.GS9D05D0_COUNT_CAP, 0x2222222);
  assert.equal(MODEL.GS9D05D0_CLAMP0X14_CONST, 0x14);
  assert.equal(MODEL.GS9D05D0_CLAMP0XA_CONST, 0xa);
  assert.equal(MODEL.GS9D05D0_RANGE_LO, 0x2f);
  assert.equal(MODEL.GS9D05D0_RANGE_HI, 0x61);
  assert.equal(MODEL.GS9D05D0_STRIDE_148, 0x148);
  assert.equal(MODEL.GS9D05D0_MASK_7FFF, 0x7fff);
  assert.equal(MODEL.gs9ce720DispatchCountVa(), 0x9ce73d);
  assert.equal(MODEL.gs9ce720CountFitsVa(), 0x9ce9c0);
  assert.equal(MODEL.gs9ce720IoGate0x4aVa(), 0x9ce938);
  assert.equal(MODEL.gs9ce720IoGate0x37Va(), 0x9ce96b);
  assert.equal(MODEL.gs9ce720DefaultCount0x1ff0x2ddVa(), 0x9ce997);
  assert.equal(MODEL.gs9ce720DefaultCount0x78_0xbeVa(), 0x9ceac4);
  assert.equal(MODEL.gs9ce720Count0xe_0xfVa(), 0x9cebea);
  assert.equal(MODEL.gs9ce720IoGate0x4eVa(), 0x9cec35);
  assert.equal(MODEL.gs9d05d0IoGate0x1EVa(), 0x9d1ade);
  assert.equal(MODEL.gs9d05d0IoGate0x1FVa(), 0x9d1a4f);
  assert.equal(MODEL.gs9d05d0IoGate0x20Va(), 0x9d222f);
  assert.equal(MODEL.gs9d05d0IoGate0x23Va(), 0x9d21f8);
  assert.equal(MODEL.gs9d05d0IoGate0x27Va(), 0x9d12ab);
  assert.equal(MODEL.gs9d05d0IoGate0x28Va(), 0x9d0c24);
  assert.equal(MODEL.gs9d05d0IoGate0x29Va(), 0x9d1020);
  assert.equal(MODEL.gs9d05d0IoGate0x2DVa(), 0x9d0a7c);
  assert.equal(MODEL.gs9d05d0IoGate0x2FVa(), 0x9d120d);
  assert.equal(MODEL.gs9d05d0IoGate0x30Va(), 0x9d17b3);
  assert.equal(MODEL.gs9d05d0IoGate0x38Va(), 0x9d0dbd);
  assert.equal(MODEL.gs9d05d0IoGate0x39Va(), 0x9d1c8a);
  assert.equal(MODEL.gs9d05d0IoGate0x3AVa(), 0x9d09e7);
  assert.equal(MODEL.gs9d05d0IoGate0x3BVa(), 0x9d0afa);
  assert.equal(MODEL.gs9d05d0IoGate0x3EVa(), 0x9d0aab);
  assert.equal(MODEL.gs9d05d0IoGate0x40Va(), 0x9d258c);
  assert.equal(MODEL.gs9d05d0IoGate0x41Va(), 0x9d2702);
  assert.equal(MODEL.gs9d05d0IoGate0x43Va(), 0x9d4066);
  assert.equal(MODEL.gs9d05d0IoGate0x45Va(), 0x9d0c2d);
  assert.equal(MODEL.gs9d05d0IoGate0x4CVa(), 0x9d11aa);
  assert.equal(MODEL.gs9d05d0IoGate0x4DVa(), 0x9d093b);
  assert.equal(MODEL.gs9d05d0IoGate0x4FVa(), 0x9d27db);
  assert.equal(MODEL.gs9d05d0IoGate0x50Va(), 0x9d280f);
  assert.equal(MODEL.gs9d05d0IoGate0x51Va(), 0x9d4323);
  assert.equal(MODEL.gs9d05d0IoGate0x52Va(), 0x9d2869);
  assert.equal(MODEL.gs9d05d0IoGate0x55Va(), 0x9d240a);
  assert.equal(MODEL.gs9d05d0IoGate0x58Va(), 0x9d2737);
  assert.equal(MODEL.gs9d05d0IoGate0x5AVa(), 0x9d2470);
  assert.equal(MODEL.gs9d05d0IoGate0x5BVa(), 0x9d1ec5);
  assert.equal(MODEL.gs9d05d0IoGate0x5CVa(), 0x9d2988);
  assert.equal(MODEL.gs9d05d0IoGate0x5DVa(), 0x9d291c);
  assert.equal(MODEL.gs9d05d0IoGate0x5EVa(), 0x9d1f1d);
  assert.equal(MODEL.gs9d05d0IoGate0x5FVa(), 0x9d2a01);
  assert.equal(MODEL.gs9d05d0IoGate0x60Va(), 0x9d2b1d);
  assert.equal(MODEL.gs9d05d0IoGate0x61Va(), 0x9d2c61);
  assert.equal(MODEL.gs9d05d0IoGate0x62Va(), 0x9d2dc8);
  assert.equal(MODEL.gs9d05d0IoGate0x63Va(), 0x9d29c9);
  assert.equal(MODEL.gs9d05d0IoGate0x64Va(), 0x9d0ef5);
  assert.equal(MODEL.gs9d05d0IoGate0x65Va(), 0x9d42ad);
  assert.equal(MODEL.gs9d05d0IoGate0x67Va(), 0x9d1de2);
  assert.equal(MODEL.gs9d05d0IoGate0x6AVa(), 0x9d2e36);
  assert.equal(MODEL.gs9d05d0IoGate0x6CVa(), 0x9d0f28);
  assert.equal(MODEL.gs9d05d0IoGate0x6EVa(), 0x9d3df9);
  assert.equal(MODEL.gs9d05d0IoGate0x6FVa(), 0x9d3eb7);
  assert.equal(MODEL.gs9d05d0IoGate0x72Va(), 0x9d2769);
  assert.equal(MODEL.gs9d05d0IoGate0x73Va(), 0x9d3f17);
  assert.equal(MODEL.gs9d05d0IoGate0x74Va(), 0x9d1c35);
  assert.equal(MODEL.gs9d05d0IoGate0x75Va(), 0x9d354a);
  assert.equal(MODEL.gs9d05d0IoGate0x76Va(), 0x9d357d);
  assert.equal(MODEL.gs9d05d0IoGate0x78Va(), 0x9d35ad);
  assert.equal(MODEL.gs9d05d0IoGate0x79Va(), 0x9d08cf);
  assert.equal(MODEL.gs9d05d0IoGate0x7EVa(), 0x9d35e4);
  assert.equal(MODEL.gs9d05d0IoGate0x7FVa(), 0x9d3f4a);
  assert.equal(MODEL.gs9d05d0IoGate0x80Va(), 0x9d399b);
  assert.equal(MODEL.gs9d05d0IoGate0x81Va(), 0x9d3c9c);
  assert.equal(MODEL.gs9d05d0IoGate0x82Va(), 0x9d0849);
  assert.equal(MODEL.gs9d05d0IoGate0x83Va(), 0x9d3d6f);
  assert.equal(MODEL.gs9d05d0IoGate0x8AVa(), 0x9d4403);
  assert.equal(MODEL.gs9d05d0IoGate0x8BVa(), 0x9d1314);
  assert.equal(MODEL.gs9d05d0IoGate0x8CVa(), 0x9d2197);
  assert.equal(MODEL.gs9d05d0IoGate0x8FVa(), 0x9d24ad);
  assert.equal(MODEL.gs9d05d0IoGate0x90Va(), 0x9d2f1a);
  assert.equal(MODEL.gs9d05d0IoGate0x97Va(), 0x9d131f);
  assert.equal(MODEL.gs9d05d0IoGate0x99Va(), 0x9d0e7b);
  assert.equal(MODEL.gs9d05d0IoGate0x9CVa(), 0x9d24ec);
  assert.equal(MODEL.gs9d05d0IoGate0x9DVa(), 0x9d44d3);
  assert.equal(MODEL.gs9d05d0IoGate0xA0Va(), 0x9d252f);
  assert.equal(MODEL.gs9d05d0IoGate0xA4Va(), 0x9d35f8);
  assert.equal(MODEL.gs9d05d0IoGate0xA5Va(), 0x9d0a4b);
  assert.equal(MODEL.gs9d05d0IoGate0xA6Va(), 0x9d0c58);
  assert.equal(MODEL.gs9d05d0IoGate0xA8Va(), 0x9d3d05);
  assert.equal(MODEL.gs9d05d0IoGate0xA9Va(), 0x9d3d37);
  assert.equal(MODEL.gs9d05d0IoGate0x23AboveVa(), 0x9d09b4);
  assert.equal(MODEL.gs9d05d0IoGate0x24AboveVa(), 0x9d0a1a);
  assert.equal(MODEL.gs9d05d0LaneCount1_4Va(), 0x9d0df7);
  assert.equal(MODEL.gs9d05d0LaneCount2_4Va(), 0x9d1085);
  assert.equal(MODEL.gs9d05d0Count0xf0x10Va(), 0x9d1171);
  assert.equal(MODEL.gs9d05d0FormatInRangeVa(), 0x9d15ef);
  assert.equal(MODEL.gs9d05d0CountCapOkVa(), 0x9d1ce2);
  assert.equal(MODEL.gs9d05d0IdxLeVecsizeVa(), 0x9d2b9a);
  assert.equal(MODEL.gs9d05d0SlotCapLt3Va(), 0x9d3061);
  assert.equal(MODEL.gs9d05d0Clamp0x14Va(), 0x9d340e);
  assert.equal(MODEL.gs9d05d0ClampSigned0xaVa(), 0x9d1b13);
  assert.equal(MODEL.gs9d05d0HeadNonnegVa(), 0x9d0644);
  assert.equal(MODEL.gs9d05d0HeadLtVecsizeVa(), 0x9d0670);
  assert.equal(MODEL.gs9d05d0SignedPositiveVa(), 0x9d0e58);
  assert.equal(MODEL.gs9d05d0SignedIdxLtVecsizeVa(), 0x9d2fc0);
  assert.equal(MODEL.gs9d05d0IdxMasked7fffLtVecsizeVa(), 0x9d41d2);
  assert.equal(MODEL.gs9d05d0ValueNegOverrideVa(), 0x9d4250);
  assert.equal(MODEL.gs9d05d0ByteNonzeroVa(), 0x9d251d);
  assert.equal(MODEL.gs9d05d0ByteEq1Va(), 0x9d1118);
  assert.equal(MODEL.gs9d05d0ByteFfOkVa(), 0x9d3f7f);
  assert.equal(MODEL.gs9d05d0U32CountNeededVa(), 0x9d16f4);
  assert.equal(MODEL.gs9d05d0ReadyOkVa(), 0x9d170b);
  assert.equal(MODEL.gs9d05d0V2fd10ResultOkVa(), 0x9d0e70);
  assert.equal(MODEL.gs9d05d0C7350ResultOkVa(), 0x9d178f);
  assert.equal(MODEL.gs9d05d0Cff40ResultOkVa(), 0x9d268d);
  assert.equal(MODEL.gs9d05d0ByteIdxLtByteVa(), 0x9d2699);
  assert.equal(MODEL.gs9d05d0IdxLt2Va(), 0x9d3aed);
  assert.equal(MODEL.gs9d05d0IdxLt6Va(), 0x9d33e3);
  assert.equal(MODEL.gs9d05d0IdxLt8Va(), 0x9d333d);
  assert.equal(MODEL.gs9d05d0WordIdxLtCountVa(), 0x9d2c55);
  assert.equal(MODEL.gs9d05d0UintIdxLtCountVa(), 0x9d17a1);
  assert.equal(MODEL.gs9ce720CallerCount(), 1);
  assert.equal(MODEL.gs9d05d0CallerCount(), 7);
  assert.equal(MODEL.GS9D05D0_CALLER_VAS[6], 0x009d80f3);
});

test("PE byte-truth pins: giant read entry 0x9cc1a0 sites", () => {
  const bytes = [
    // body edges
    [0x9cc1b8, [0x68, 0x3b, 0xf3, 0xb0, 0x00]],
    [0x9cc1cb, [0xa1, 0xb4, 0x93, 0xbf, 0x00]],
    [0x9cc27c, [0xc2, 0x08, 0x00]],
    [0x9cc352, [0x89, 0x47, 0x08]],
    [0x9ce597, [0xcc, 0xcc, 0xcc, 0xcc]],
    // F: gs format gates (cmp + branch)
    [0x9cc761, [0x83, 0xf8, 0x2b, 0x72, 0x3a]],
    [0x9cc7a0, [0x83, 0xf8, 0x2e, 0x72, 0x34]],
    [0x9cdd29, [0x83, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x2f]],
    [0x9cdd36, [0x0f, 0x82, 0x9f, 0x01, 0x00, 0x00]],
    [0x9cde80, [0x83, 0xb9, 0xf0, 0xfd, 0x01, 0x00, 0x30, 0x72, 0x27]],
    [0x9cc35a, [0x83, 0xbe, 0xf0, 0xfd, 0x01, 0x00, 0x33, 0x72, 0x0b]],
    [0x9cd6ba, [0x83, 0xf8, 0x33, 0x72, 0x3a]],
    [0x9cc4fa, [0x83, 0xf8, 0x34, 0x72, 0x11]],
    [0x9cc479, [0x83, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x40, 0x72, 0x0b]],
    [0x9cdedb, [0x83, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x42]],
    [0x9cdeee, [0x0f, 0x82, 0xc8, 0x00, 0x00, 0x00]],
    [0x9cc510, [0x83, 0xf8, 0x43, 0x0f, 0x83, 0x0e, 0x02, 0x00, 0x00]],
    [0x9cd6ff, [0x83, 0xf8, 0x44, 0x0f, 0x83, 0xe2, 0x00, 0x00, 0x00]],
    [0x9cd4a3, [0x83, 0xf8, 0x47, 0x0f, 0x82, 0xd6, 0x00, 0x00, 0x00]],
    [0x9cd5fb, [0x83, 0xf8, 0x48, 0x72, 0x34]],
    [0x9cdfc9, [0x83, 0xf8, 0x50, 0x72, 0x3a]],
    [0x9ce18c, [0x83, 0xf9, 0x53, 0x0f, 0x82, 0x82, 0x00, 0x00, 0x00]],
    [0x9cdae3, [0x83, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x54]],
    [0x9cdafd, [0x0f, 0x83, 0x6a, 0x00, 0x00, 0x00]],
    [0x9cc444, [0x83, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x57, 0x72, 0x0b]],
    [0x9ce00e, [0x83, 0xf8, 0x59, 0x0f, 0x82, 0x6d, 0x01, 0x00, 0x00]],
    [0x9ce437, [0x3d, 0x85, 0x00, 0x00, 0x00, 0x72, 0x41]],
    [0x9cd355, [0x81, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x86, 0x00, 0x00, 0x00]],
    [0x9cd35f, [0x0f, 0x82, 0x04, 0x01, 0x00, 0x00]],
    [0x9cd582, [0x3d, 0x87, 0x00, 0x00, 0x00, 0x0f, 0x82, 0x6e, 0x00, 0x00, 0x00]],
    [0x9ce2b6, [0x81, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x89, 0x00, 0x00, 0x00]],
    [0x9ce47f, [0x3d, 0x8a, 0x00, 0x00, 0x00, 0x72, 0x14]],
    [0x9cd71c, [0x81, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x8d, 0x00, 0x00, 0x00]],
    [0x9cc4a9, [0x3d, 0x93, 0x00, 0x00, 0x00, 0x72, 0x11]],
    [0x9ce4e1, [0x3d, 0x95, 0x00, 0x00, 0x00, 0x72, 0x0e]],
    [0x9ce49a, [0x3d, 0x98, 0x00, 0x00, 0x00, 0x72, 0x3a]],
    [0x9cc4c1, [0x3d, 0x9b, 0x00, 0x00, 0x00, 0x72, 0x0b]],
    [0x9cc9be, [0x83, 0xbf, 0xf0, 0xfd, 0x01, 0x00, 0x21, 0x72, 0x38]],
    // I: io+8 gates
    [0x9cccb7, [0x83, 0x7e, 0x08, 0x56, 0x0f, 0x82, 0x6a, 0x01, 0x00, 0x00]],
    [0x9cd1d9, [0x83, 0xf9, 0x7c, 0x72, 0x2e]],
    [0x9cd246, [0x81, 0x78, 0x08, 0xa5, 0x00, 0x00, 0x00, 0x72, 0x68]],
    [0x9cd027, [0x83, 0x7e, 0x08, 0x7b]],
    [0x9cd02d, [0x73, 0x55]],
    [0x9cd19d, [0x83, 0xf9, 0x7b, 0x72, 0x37]],
    // D1 dispatch chain
    [0x9cce5d, [0x83, 0xf8, 0x56, 0x73, 0x3a]],
    [0x9cce9c, [0x83, 0xf8, 0x6b, 0x73, 0x0c]],
    [0x9ccead, [0x83, 0xf8, 0x6d, 0x73, 0x0c]],
    [0x9ccebe, [0x83, 0xf8, 0x76, 0x73, 0x0c]],
    [0x9ccecf, [0x83, 0xf8, 0x7b, 0x73, 0x0c]],
    [0x9ccee0, [0x3d, 0x84, 0x00, 0x00, 0x00, 0x73, 0x0c]],
    [0x9ccef3, [0x3d, 0x94, 0x00, 0x00, 0x00, 0x73, 0x0c]],
    [0x9ccf06, [0x3d, 0x9a, 0x00, 0x00, 0x00, 0x1b, 0xc0, 0x05, 0x0f, 0x02, 0x00, 0x00]],
    [0x9ccfc3, [0x39, 0x85, 0x80, 0xf9, 0xff, 0xff, 0x76, 0x5c]],
    [0x9ccc64, [0x3b, 0x46, 0x08, 0x1b, 0xc0, 0xf7, 0xd8, 0x83, 0xc0, 0x0d]],
    // B bounds
    [0x9ccf1e, [0x81, 0xf9, 0xfb, 0x01, 0x00, 0x00, 0x72, 0x26]],
    [0x9cd158, [0x81, 0xfe, 0x1c, 0x9d, 0x01, 0x00, 0x72, 0xb0]],
    [0x9cdbe0, [0x83, 0xfe, 0x50, 0x0f, 0x83, 0x9e, 0x00, 0x00, 0x00]],
    [0x9cdc31, [0x83, 0xfe, 0x50, 0x73, 0x31]],
    [0x9cdb63, [0x83, 0xfe, 0x4d, 0x72, 0xe8]],
    [0x9cdf86, [0x66, 0x83, 0xfa, 0x25, 0x73, 0x18]],
    [0x9cdf42, [0x66, 0x3b, 0x85, 0x80, 0xf9, 0xff, 0xff, 0x0f, 0x83, 0x74, 0x00, 0x00, 0x00]],
    [0x9cdfab, [0x66, 0x3b, 0x95, 0x80, 0xf9, 0xff, 0xff, 0x72, 0x9e]],
    [0x9cdc62, [0x83, 0xf9, 0x08, 0x7c, 0xca]],
    // S signed
    [0x9cd772, [0x85, 0xc0, 0x0f, 0x8e, 0x93, 0x02, 0x00, 0x00]],
    [0x9cd830, [0x85, 0xc0, 0x0f, 0x8e, 0xe4, 0xfe, 0xff, 0xff]],
    [0x9ce30f, [0x84, 0xc9, 0x7e, 0x4d]],
    [0x9ce3a9, [0x84, 0xc9, 0x7e, 0x42]],
    [0x9cd86e, [0x3b, 0x8f, 0x78, 0x9d, 0x01, 0x00, 0x7c, 0xce]],
    [0x9cda01, [0x3b, 0x85, 0x88, 0xf9, 0xff, 0xff, 0x0f, 0x8c, 0x79, 0xfd, 0xff, 0xff]],
    [0x9cdec9, [0x3b, 0x85, 0x80, 0xf9, 0xff, 0xff, 0x0f, 0x8c, 0x5b, 0xff, 0xff, 0xff]],
    [0x9ce170, [0x3b, 0xf0, 0x0f, 0x82, 0x28, 0xff, 0xff, 0xff]],
    [0x9ce358, [0x3a, 0x85, 0x93, 0xf9, 0xff, 0xff, 0x7c, 0xc0]],
    [0x9ce3e7, [0x3a, 0x85, 0x93, 0xf9, 0xff, 0xff, 0x7c, 0xc1]],
    // L byte gates
    [0x9cc301, [0x80, 0x7b, 0x0c, 0x00]],
    [0x9cc30b, [0x74, 0x3c]],
    [0x9ce54d, [0x80, 0xbd, 0x83, 0xf9, 0xff, 0xff, 0x00, 0x75, 0x14]],
    [0x9ce55f, [0x84, 0xc0, 0x74, 0x07]],
    // K checksum
    [0x9cc313, [0x3b, 0xc1, 0x75, 0x0d]],
    [0x9cc31c, [0x3b, 0x88, 0x98, 0x0f, 0x00, 0x00, 0x74, 0x25]],
    [0x9ce545, [0x3b, 0x87, 0xa4, 0xfd, 0x01, 0x00, 0x75, 0x1d]],
    // M clamps
    [0x9cc3e7, [0x66, 0x3b, 0x0e]],
    [0x9cc3f6, [0x0f, 0x43, 0xc6]],
    [0x9cc3dd, [0xc7, 0x85, 0x70, 0xf9, 0xff, 0xff, 0x35, 0x00, 0x00, 0x00]],
    [0x9ccb13, [0x66, 0x3b, 0x0e]],
    [0x9ccb1c, [0x0f, 0x43, 0xc6]],
    [0x9ccb09, [0xc7, 0x85, 0x88, 0xf9, 0xff, 0xff, 0x1a, 0x00, 0x00, 0x00]],
    // callsites
    [0x9cc254, [0xe8, 0xf7, 0xc0, 0xff, 0xff]],
    [0x9ccf75, [0xe8, 0xa6, 0xe6, 0xff, 0xff]],
    [0x9ccfe8, [0xe8, 0x33, 0xe6, 0xff, 0xff]],
    [0x9ce33f, [0xe8, 0xdc, 0xd2, 0xff, 0xff]],
    [0x9ce3ce, [0xe8, 0x4d, 0xd2, 0xff, 0xff]],
    [0x9cda14, [0xe8, 0x07, 0x0d, 0x00, 0x00]],
    [0x9cdfbe, [0xe8, 0x3d, 0x10, 0x00, 0x00]],
  ];
  for (const [va, want] of bytes) {
    assert.deepEqual([...peAt(va, want.length)], want, `0x${va.toString(16)}`);
  }
});


test("Wasm zero-import exports match JS oracle on fixed cases (ABI v9)", () => {
  const exp = loadExports();
  const M = MODEL;
  // every law on discriminating edge values (mutant discriminator rows)
  const eq = (key, args, want) => {
    assert.equal(exp[key](...args) >>> 0, want >>> 0, key);
    assert.equal(M[key.replace("9cc1a0", "gs9cc1a0")](...args) >>> 0, want >>> 0, key + " model");
  };
  for (const n of [0x2b, 0x2e, 0x2f, 0x30, 0x33, 0x34, 0x40, 0x42, 0x43, 0x44, 0x47, 0x48, 0x50, 0x53, 0x54, 0x57, 0x59, 0x85, 0x86, 0x87, 0x89, 0x8a, 0x8d, 0x93, 0x95, 0x98, 0x9b]) {
    eq(`9cc1a0GsGate0x${n.toString(16).padStart(2, "0")}`, [n - 1], 0);
    eq(`9cc1a0GsGate0x${n.toString(16).padStart(2, "0")}`, [n], 1);
    eq(`9cc1a0GsGate0x${n.toString(16).padStart(2, "0")}`, [0xffffffff], 1);
    eq(`9cc1a0GsGate0x${n.toString(16).padStart(2, "0")}`, [0], 0);
  }
  for (const n of [0x56, 0x7c, 0xa5]) {
    eq(`9cc1a0IoGate0x${n.toString(16).padStart(2, "0")}`, [n - 1], 0);
    eq(`9cc1a0IoGate0x${n.toString(16).padStart(2, "0")}`, [n], 1);
    eq(`9cc1a0IoGate0x${n.toString(16).padStart(2, "0")}`, [0xffffffff], 1);
  }
  // D1 dispatch: every band boundary
  eq("9cc1a0DispatchCount", [0x55], 0x89);
  eq("9cc1a0DispatchCount", [0x56], 0x8f);
  eq("9cc1a0DispatchCount", [0x6a], 0x8f);
  eq("9cc1a0DispatchCount", [0x6b], 0x90);
  eq("9cc1a0DispatchCount", [0x6c], 0x90);
  eq("9cc1a0DispatchCount", [0x6d], 0x91);
  eq("9cc1a0DispatchCount", [0x76], 0x92);
  eq("9cc1a0DispatchCount", [0x7b], 0x164);
  eq("9cc1a0DispatchCount", [0x84], 0x20d);
  eq("9cc1a0DispatchCount", [0x94], 0x20e);
  eq("9cc1a0DispatchCount", [0x99], 0x20e);
  eq("9cc1a0DispatchCount", [0x9a], 0x20f);
  eq("9cc1a0DispatchCount", [0xffffffff], 0x20f);
  // D2 second pass
  eq("9cc1a0DispatchSecondPassNeeded", [0x1fb], 0);
  eq("9cc1a0DispatchSecondPassNeeded", [0x1fc], 1);
  eq("9cc1a0DispatchSecondPassNeeded", [0xffffffff], 1);
  // C1 t164 count
  eq("9cc1a0T164Count", [0x50], 13);
  eq("9cc1a0T164Count", [0x51], 14);
  eq("9cc1a0T164Count", [0xffffffff], 14);
  // B bounds
  eq("9cc1a0Count1fbBelow", [0x1fa], 1);
  eq("9cc1a0Count1fbBelow", [0x1fb], 0);
  eq("9cc1a0Table19d1cMore", [0x19d1b], 1);
  eq("9cc1a0Table19d1cMore", [0x19d1c], 0);
  eq("9cc1a0Byte0x50More", [0x4f], 1);
  eq("9cc1a0Byte0x50More", [0x50], 0);
  eq("9cc1a0Byte0x4dMore", [0x4c], 1);
  eq("9cc1a0Byte0x4dMore", [0x4d], 0);
  eq("9cc1a0Word0x25More", [0x24], 1);
  eq("9cc1a0Word0x25More", [0x25], 0);
  eq("9cc1a0Word0x25More", [0x10025], 0, "word-masked");
  eq("9cc1a0WordMore", [0x10000, 0x100], 1, "masked idx 0 < 0x100");
  eq("9cc1a0WordMore", [0x100, 0x4], 0, "masked 0 not < 4");
  eq("9cc1a0WordMore", [0xffff, 0xffff], 0);
  eq("9cc1a0Count8More", [0x7], 1);
  eq("9cc1a0Count8More", [0x8], 0);
  eq("9cc1a0Count8More", [0x80000000], 1, "SIGNED: INT32_MIN < 8");
  // S signed
  eq("9cc1a0SignedByteCountPositive", [0x7f], 1);
  eq("9cc1a0SignedByteCountPositive", [0x80], 0);
  eq("9cc1a0SignedByteCountPositive", [0xff], 0);
  eq("9cc1a0SignedByteCountPositive", [0x100], 0, "0x100 -> byte 0");
  eq("9cc1a0SignedIdxLtMovsx8", [0, 0x10], 1);
  eq("9cc1a0SignedIdxLtMovsx8", [0x10, 0x10], 0);
  eq("9cc1a0SignedIdxLtMovsx8", [0, 0xff], 0, "count -1");
  eq("9cc1a0SignedIdxLtMovsx8", [0xffffffff, 1], 1, "-1 < 1");
  eq("9cc1a0SignedIdxLtCount", [0, 1], 1);
  eq("9cc1a0SignedIdxLtCount", [1, 1], 0);
  eq("9cc1a0SignedIdxLtCount", [0xffffffff, 0], 1, "-1 < 0");
  eq("9cc1a0SignedIdxLtCount", [0, 0xffffffff], 0, "0 < -1 FALSE");
  eq("9cc1a0SignedByteLt", [0, 1], 1);
  eq("9cc1a0SignedByteLt", [0xff, 0xfe], 0, "-1 < -2 FALSE");
  eq("9cc1a0SignedByteLt", [0xfe, 0xff], 1, "-2 < -1");
  eq("9cc1a0SignedByteLt", [0x100, 0x101], 1, "masked 0 < 1");
  // L byte gates
  eq("9cc1a0ByteZeroOk", [0], 1);
  eq("9cc1a0ByteZeroOk", [0x100], 1);
  eq("9cc1a0ByteZeroOk", [1], 0);
  eq("9cc1a0TailReadyOk", [0], 0);
  eq("9cc1a0TailReadyOk", [0x100], 0);
  eq("9cc1a0TailReadyOk", [1], 1);
  // K checksum
  eq("9cc1a0ChecksumPass", [1, 1, 9], 1);
  eq("9cc1a0ChecksumPass", [1, 9, 9], 1, "mgr override");
  eq("9cc1a0ChecksumPass", [1, 2, 3], 0);
  eq("9cc1a0ChecksumPass", [0xffffffff, 0xffffffff, 0], 1);
  eq("9cc1a0ChecksumMatches", [7, 7], 1);
  eq("9cc1a0ChecksumMatches", [7, 8], 0);
  eq("9cc1a0ChecksumMatches", [0xffffffff, 0xffffffff], 1);
  // M clamps
  eq("9cc1a0Clamp0x35", [0x10], 0x35);
  eq("9cc1a0Clamp0x35", [0x35], 0x35);
  eq("9cc1a0Clamp0x35", [0x36], 0x36);
  eq("9cc1a0Clamp0x35", [0xffff], 0xffff);
  eq("9cc1a0Clamp0x35", [0x10034], 0x35, "word-masked floor");
  eq("9cc1a0Clamp0x1a", [0x10], 0x1a);
  eq("9cc1a0Clamp0x1a", [0x19], 0x1a, "floor below 0x1a");
  eq("9cc1a0Clamp0x1a", [0x1a], 0x1a);
  eq("9cc1a0Clamp0x1a", [0xffff], 0xffff);
});

test("Wasm vs JS differential: giant read-entry gates (ABI v9)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rngV9 = mulberry32(0x9cc1a0);
  const rnd = () => Math.floor(rngV9() * 0x100000000) >>> 0;
  const gs = [0x2b,0x2e,0x2f,0x30,0x33,0x34,0x40,0x42,0x43,0x44,0x47,0x48,0x50,0x53,0x54,0x57,0x59,0x85,0x86,0x87,0x89,0x8a,0x8d,0x93,0x95,0x98,0x9b];
  const io = [0x56,0x7c,0xa5];
  for (let i = 0; i < 200; i++) {
    const format = rnd();
    const io8 = rnd();
    const disp = rnd();
    const idx = rnd();
    const cnt = rnd();
    const byte = rnd();
    const al = rnd();
    const st = rnd();
    const ex = rnd();
    const mgr = rnd();
    const rem = rnd();
    for (const n of gs) {
      assert.equal(exp[`9cc1a0GsGate0x${n.toString(16).padStart(2,"0")}`](format) >>> 0,
                   M[`gs9cc1a0GsGate0x${n.toString(16).padStart(2,"0")}`](format), `gs gate 0x${n.toString(16)}`);
    }
    for (const n of io) {
      assert.equal(exp[`9cc1a0IoGate0x${n.toString(16).padStart(2,"0")}`](io8) >>> 0,
                   M[`gs9cc1a0IoGate0x${n.toString(16).padStart(2,"0")}`](io8), `io gate 0x${n.toString(16)}`);
    }
    assert.equal(exp["9cc1a0DispatchCount"](io8) >>> 0, M.gs9cc1a0DispatchCount(io8));
    assert.equal(exp["9cc1a0DispatchSecondPassNeeded"](disp) >>> 0, M.gs9cc1a0DispatchSecondPassNeeded(disp));
    assert.equal(exp["9cc1a0T164Count"](io8) >>> 0, M.gs9cc1a0T164Count(io8));
    assert.equal(exp["9cc1a0Count1fbBelow"](cnt) >>> 0, M.gs9cc1a0Count1fbBelow(cnt));
    assert.equal(exp["9cc1a0Table19d1cMore"](idx) >>> 0, M.gs9cc1a0Table19d1cMore(idx));
    assert.equal(exp["9cc1a0Byte0x50More"](idx) >>> 0, M.gs9cc1a0Byte0x50More(idx));
    assert.equal(exp["9cc1a0Byte0x4dMore"](idx) >>> 0, M.gs9cc1a0Byte0x4dMore(idx));
    assert.equal(exp["9cc1a0Word0x25More"](idx) >>> 0, M.gs9cc1a0Word0x25More(idx));
    assert.equal(exp["9cc1a0WordMore"](idx, cnt) >>> 0, M.gs9cc1a0WordMore(idx, cnt));
    assert.equal(exp["9cc1a0Count8More"](idx) >>> 0, M.gs9cc1a0Count8More(idx));
    assert.equal(exp["9cc1a0SignedByteCountPositive"](byte) >>> 0, M.gs9cc1a0SignedByteCountPositive(byte));
    assert.equal(exp["9cc1a0SignedIdxLtMovsx8"](idx, byte) >>> 0, M.gs9cc1a0SignedIdxLtMovsx8(idx, byte));
    assert.equal(exp["9cc1a0SignedIdxLtCount"](idx, cnt) >>> 0, M.gs9cc1a0SignedIdxLtCount(idx, cnt));
    assert.equal(exp["9cc1a0SignedByteLt"](idx, byte) >>> 0, M.gs9cc1a0SignedByteLt(idx, byte));
    assert.equal(exp["9cc1a0ByteZeroOk"](byte) >>> 0, M.gs9cc1a0ByteZeroOk(byte));
    assert.equal(exp["9cc1a0TailReadyOk"](al) >>> 0, M.gs9cc1a0TailReadyOk(al));
    assert.equal(exp["9cc1a0ChecksumPass"](st, ex, mgr) >>> 0, M.gs9cc1a0ChecksumPass(st, ex, mgr));
    assert.equal(exp["9cc1a0ChecksumMatches"](st, ex) >>> 0, M.gs9cc1a0ChecksumMatches(st, ex));
    assert.equal(exp["9cc1a0Clamp0x35"](rem) >>> 0, M.gs9cc1a0Clamp0x35(rem));
    assert.equal(exp["9cc1a0Clamp0x1a"](rem) >>> 0, M.gs9cc1a0Clamp0x1a(rem));
  }
});

test("v9 giant guards are not vacuous (self-check)", () => {
  assert.notEqual(MODEL.gs9cc1a0GsGate0x2b(0x2a), MODEL.gs9cc1a0GsGate0x2b(0x2b), ">= vs <");
  assert.notEqual(MODEL.gs9cc1a0GsGate0x9b(0x9a), MODEL.gs9cc1a0GsGate0x9b(0x9b));
  assert.notEqual(MODEL.gs9cc1a0IoGate0x56(0x55), MODEL.gs9cc1a0IoGate0x56(0x56));
  assert.notEqual(MODEL.gs9cc1a0IoGate0xa5(0xa4), MODEL.gs9cc1a0IoGate0xa5(0xa5));
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x55), 0x89);
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x56), 0x8f);
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x6a), 0x8f);
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x6d), 0x91, "0x6d is NOT < 0x6d -> band 0x91");
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x84), 0x20d);
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x94), 0x20e);
  assert.equal(MODEL.gs9cc1a0DispatchCount(0x9a), 0x20f);
  assert.equal(MODEL.gs9cc1a0DispatchCount(0xffffffff), 0x20f, "band map unsigned");
  assert.equal(MODEL.gs9cc1a0DispatchSecondPassNeeded(0x1fb), 0, "> not >=");
  assert.equal(MODEL.gs9cc1a0DispatchSecondPassNeeded(0x1fc), 1);
  assert.equal(MODEL.gs9cc1a0T164Count(0x50), 13);
  assert.equal(MODEL.gs9cc1a0T164Count(0x51), 14, "io8 > 0x50 not >=");
  assert.equal(MODEL.gs9cc1a0Count1fbBelow(0x1fb), 0, "strict < 0x1fb");
  assert.equal(MODEL.gs9cc1a0Count1fbBelow(0x1fa), 1);
  assert.equal(MODEL.gs9cc1a0Table19d1cMore(0x19d1c), 0, "strict");
  assert.equal(MODEL.gs9cc1a0Byte0x50More(0x50), 0);
  assert.equal(MODEL.gs9cc1a0Byte0x4dMore(0x4d), 0);
  assert.equal(MODEL.gs9cc1a0Word0x25More(0x25), 0, "word 0x25 cutoff");
  assert.equal(MODEL.gs9cc1a0WordMore(0x10000, 0x100), 1, "word-masked idx 0x10000 -> 0 < 0x100");
  assert.equal(MODEL.gs9cc1a0WordMore(0x100, 0x4), 0, "word-masked 0x100 == 0 not < 4");
  assert.equal(MODEL.gs9cc1a0WordMore(4, 0x100), 1);
  assert.equal(MODEL.gs9cc1a0Count8More(0x80000000), 1, "SIGNED: INT32_MIN < 8");
  assert.equal(MODEL.gs9cc1a0Count8More(8), 0, "8 not < 8");
  assert.equal(MODEL.gs9cc1a0Count8More(7), 1);
  assert.equal(MODEL.gs9cc1a0SignedByteCountPositive(0x80), 0, "0x80..0xff negative");
  assert.equal(MODEL.gs9cc1a0SignedByteCountPositive(0x7f), 1);
  assert.equal(MODEL.gs9cc1a0SignedByteCountPositive(0x100), 0, "0x100 -> byte 0 -> not positive");
  assert.equal(MODEL.gs9cc1a0SignedByteCountPositive(0xff), 0, "-1 negative");
  assert.equal(MODEL.gs9cc1a0SignedIdxLtMovsx8(0, 0xff), 0, "count -1 -> no iterations");
  assert.equal(MODEL.gs9cc1a0SignedIdxLtMovsx8(0, 0x10), 1);
  assert.equal(MODEL.gs9cc1a0SignedIdxLtCount(0xffffffff, 0), 1, "SIGNED -1 < 0 is TRUE");
  assert.equal(MODEL.gs9cc1a0SignedIdxLtCount(0, 0xffffffff), 0, "0 < -1 FALSE");
  assert.equal(MODEL.gs9cc1a0SignedByteLt(0xff, 0xfe), 0, "-1 < -2 FALSE");
  assert.equal(MODEL.gs9cc1a0SignedByteLt(0xfe, 0xff), 1, "-2 < -1");
  assert.equal(MODEL.gs9cc1a0ByteZeroOk(0), 1);
  assert.equal(MODEL.gs9cc1a0ByteZeroOk(0x100), 1, "0x100 -> byte 0 -> ok");
  assert.equal(MODEL.gs9cc1a0ByteZeroOk(1), 0);
  assert.equal(MODEL.gs9cc1a0TailReadyOk(0), 0);
  assert.equal(MODEL.gs9cc1a0TailReadyOk(0x100), 0, "0x100 -> byte 0 -> not ok");
  assert.equal(MODEL.gs9cc1a0TailReadyOk(1), 1);
  assert.equal(MODEL.gs9cc1a0ChecksumPass(1, 1, 9), 1, "streamed == expected");
  assert.equal(MODEL.gs9cc1a0ChecksumPass(1, 9, 9), 1, "expected == mgr override");
  assert.equal(MODEL.gs9cc1a0ChecksumPass(1, 2, 3), 0);
  assert.equal(MODEL.gs9cc1a0ChecksumMatches(7, 7), 1);
  assert.equal(MODEL.gs9cc1a0ChecksumMatches(7, 8), 0);
  assert.equal(MODEL.gs9cc1a0Clamp0x35(0x10), 0x35);
  assert.equal(MODEL.gs9cc1a0Clamp0x35(0x35), 0x35);
  assert.equal(MODEL.gs9cc1a0Clamp0x35(0x1234), 0x1234);
  assert.equal(MODEL.gs9cc1a0Clamp0x35(0x10034), 0x35, "word-masked 0x34 < 0x35 -> floor 0x35");
  assert.equal(MODEL.gs9cc1a0Clamp0x1a(0x10), 0x1a);
  assert.equal(MODEL.gs9cc1a0Clamp0x1a(0x1a), 0x1a);
  assert.equal(MODEL.gs9cc1a0Clamp0x1a(0x2000), 0x2000);
});

test("ABI v9 accessors: giant read-entry wasm accessor census", () => {
  const exp = loadExports();
  const rows = [
    ["9cc1a0Va", MODEL.GS9CC1A0_VA],
    ["9cc1a0EndVa", MODEL.GS9CC1A0_END_VA],
    ["9cc1a0BodyBytes", MODEL.GS9CC1A0_BODY_BYTES],
    ["9cc1a0NextVa", MODEL.GS9CC1A0_NEXT_VA],
    ["9cc1a0SehHandlerDat", MODEL.GS9CC1A0_SEH_HANDLER_DAT],
    ["9cc1a0GsCookieDat", MODEL.GS9CC1A0_GS_COOKIE_DAT],
    ["9cc1a0IoFormatOff", MODEL.GS9CC1A0_IO_FORMAT_OFF],
    ["9cc1a0GsFormatOff", MODEL.GS9CC1A0_GS_FORMAT_OFF],
    ["9cc1a0IoFormatStoreVa", MODEL.GS9CC1A0_IO_FORMAT_STORE_VA],
    ["9cc1a0DeleteCallVa", MODEL.GS9CC1A0_DELETE_CALL_VA],
    ["9cc1a0ReadPillCallVa0", MODEL.GS9CC1A0_READ_PILL_CALL_VA_0],
    ["9cc1a0ReadPillCallVa1", MODEL.GS9CC1A0_READ_PILL_CALL_VA_1],
    ["9cc1a0ReadPillCallVa2", MODEL.GS9CC1A0_READ_PILL_CALL_VA_2],
    ["9cc1a0ReadPillCallVa3", MODEL.GS9CC1A0_READ_PILL_CALL_VA_3],
    ["9cc1a0BodyCCallVa", MODEL.GS9CC1A0_BODY_C_CALL_VA],
    ["9cc1a0Cf000CallVa", MODEL.GS9CC1A0_CF000_CALL_VA],
    ["9cc1a0SerializerCtorCallVa", MODEL.GS9CC1A0_SERIALIZER_CTOR_CALL_VA],
    ["9cc1a0ChecksumMagic", MODEL.GS9CC1A0_CHECKSUM_MAGIC],
    ["9cc1a0MgrGlobalDat", MODEL.GS9CC1A0_MGR_GLOBAL_DAT],
    ["9cc1a0MgrF98Off", MODEL.GS9CC1A0_MGR_F98_OFF],
    ["9cc1a0Lane19cOff", MODEL.GS9CC1A0_LANE19C_OFF],
    ["9cc1a0Lane19cBound", MODEL.GS9CC1A0_LANE19C_BOUND],
    ["9cc1a0Holders1Off", MODEL.GS9CC1A0_HOLDERS1_OFF],
    ["9cc1a0Values1Off", MODEL.GS9CC1A0_VALUES1_OFF],
    ["9cc1a0Holders2Off", MODEL.GS9CC1A0_HOLDERS2_OFF],
    ["9cc1a0Values2Off", MODEL.GS9CC1A0_VALUES2_OFF],
    ["9cc1a0Table19530Off", MODEL.GS9CC1A0_TABLE19530_OFF],
    ["9cc1a0Table19d1cEnd", MODEL.GS9CC1A0_TABLE19D1C_END],
    ["9cc1a0Slot13BaseOff", MODEL.GS9CC1A0_SLOT13_BASE_OFF],
    ["9cc1a0Byte80Bound", MODEL.GS9CC1A0_BYTE80_BOUND],
    ["9cc1a0Byte4dBound", MODEL.GS9CC1A0_BYTE4D_BOUND],
    ["9cc1a0Word25Bound", MODEL.GS9CC1A0_WORD25_BOUND],
    ["9cc1a0Clamp35Const", MODEL.GS9CC1A0_CLAMP35_CONST],
    ["9cc1a0Clamp1aConst", MODEL.GS9CC1A0_CLAMP1A_CONST],
    ["9cc1a0StrideB8", MODEL.GS9CC1A0_STRIDE_B8],
    ["9cc1a0StrideC", MODEL.GS9CC1A0_STRIDE_C],
    ["9cc1a0GsGate0x2bVa", MODEL.GS9CC1A0_GS_GATE_0X2B_VA],
    ["9cc1a0GsGate0x2eVa", MODEL.GS9CC1A0_GS_GATE_0X2E_VA],
    ["9cc1a0GsGate0x2fVa", MODEL.GS9CC1A0_GS_GATE_0X2F_VA],
    ["9cc1a0GsGate0x30Va", MODEL.GS9CC1A0_GS_GATE_0X30_VA],
    ["9cc1a0GsGate0x33Va", MODEL.GS9CC1A0_GS_GATE_0X33_VA],
    ["9cc1a0GsGate0x34Va", MODEL.GS9CC1A0_GS_GATE_0X34_VA],
    ["9cc1a0GsGate0x40Va", MODEL.GS9CC1A0_GS_GATE_0X40_VA],
    ["9cc1a0GsGate0x42Va", MODEL.GS9CC1A0_GS_GATE_0X42_VA],
    ["9cc1a0GsGate0x43Va", MODEL.GS9CC1A0_GS_GATE_0X43_VA],
    ["9cc1a0GsGate0x44Va", MODEL.GS9CC1A0_GS_GATE_0X44_VA],
    ["9cc1a0GsGate0x47Va", MODEL.GS9CC1A0_GS_GATE_0X47_VA],
    ["9cc1a0GsGate0x48Va", MODEL.GS9CC1A0_GS_GATE_0X48_VA],
    ["9cc1a0GsGate0x50Va", MODEL.GS9CC1A0_GS_GATE_0X50_VA],
    ["9cc1a0GsGate0x53Va", MODEL.GS9CC1A0_GS_GATE_0X53_VA],
    ["9cc1a0GsGate0x54Va", MODEL.GS9CC1A0_GS_GATE_0X54_VA],
    ["9cc1a0GsGate0x57Va", MODEL.GS9CC1A0_GS_GATE_0X57_VA],
    ["9cc1a0GsGate0x59Va", MODEL.GS9CC1A0_GS_GATE_0X59_VA],
    ["9cc1a0GsGate0x85Va", MODEL.GS9CC1A0_GS_GATE_0X85_VA],
    ["9cc1a0GsGate0x86Va", MODEL.GS9CC1A0_GS_GATE_0X86_VA],
    ["9cc1a0GsGate0x87Va", MODEL.GS9CC1A0_GS_GATE_0X87_VA],
    ["9cc1a0GsGate0x89Va", MODEL.GS9CC1A0_GS_GATE_0X89_VA],
    ["9cc1a0GsGate0x8aVa", MODEL.GS9CC1A0_GS_GATE_0X8A_VA],
    ["9cc1a0GsGate0x8dVa", MODEL.GS9CC1A0_GS_GATE_0X8D_VA],
    ["9cc1a0GsGate0x93Va", MODEL.GS9CC1A0_GS_GATE_0X93_VA],
    ["9cc1a0GsGate0x95Va", MODEL.GS9CC1A0_GS_GATE_0X95_VA],
    ["9cc1a0GsGate0x98Va", MODEL.GS9CC1A0_GS_GATE_0X98_VA],
    ["9cc1a0GsGate0x9bVa", MODEL.GS9CC1A0_GS_GATE_0X9B_VA],
    ["9cc1a0IoGate0x56Va", MODEL.GS9CC1A0_IO_GATE_0X56_VA],
    ["9cc1a0IoGate0x7cVa", MODEL.GS9CC1A0_IO_GATE_0X7C_VA],
    ["9cc1a0IoGate0xa5Va", MODEL.GS9CC1A0_IO_GATE_0XA5_VA],
    ["9cc1a0GsGate0x21Va", MODEL.GS9CC1A0_GS_GATE_0X21_VA],
    ["9cc1a0IoGate0x7bVa", MODEL.GS9CC1A0_IO_GATE_0X7B_VA],
    ["9cc1a0IoGate0x7bVa2", MODEL.GS9CC1A0_IO_GATE_0X7B_VA_2],
    ["9cc1a0Dispatch0Va", MODEL.GS9CC1A0_DISPATCH0_VA],
    ["9cc1a0Dispatch1Va", MODEL.GS9CC1A0_DISPATCH1_VA],
    ["9cc1a0Dispatch2Va", MODEL.GS9CC1A0_DISPATCH2_VA],
    ["9cc1a0Dispatch3Va", MODEL.GS9CC1A0_DISPATCH3_VA],
    ["9cc1a0Dispatch4Va", MODEL.GS9CC1A0_DISPATCH4_VA],
    ["9cc1a0Dispatch5Va", MODEL.GS9CC1A0_DISPATCH5_VA],
    ["9cc1a0Dispatch6Va", MODEL.GS9CC1A0_DISPATCH6_VA],
    ["9cc1a0Dispatch7Va", MODEL.GS9CC1A0_DISPATCH7_VA],
    ["9cc1a0DispatchSecondPassVa", MODEL.GS9CC1A0_DISPATCH_SECOND_PASS_VA],
    ["9cc1a0T164CountVa", MODEL.GS9CC1A0_T164_COUNT_VA],
    ["9cc1a0Count1fbGateVa", MODEL.GS9CC1A0_COUNT_1FB_GATE_VA],
    ["9cc1a0Table19d1cMoreVa", MODEL.GS9CC1A0_TABLE_19D1C_MORE_VA],
    ["9cc1a0Byte0x50MoreVa", MODEL.GS9CC1A0_BYTE_0X50_MORE_VA],
    ["9cc1a0Byte0x4dMoreVa", MODEL.GS9CC1A0_BYTE_0X4D_MORE_VA],
    ["9cc1a0Word0x25MoreVa", MODEL.GS9CC1A0_WORD_0X25_MORE_VA],
    ["9cc1a0WordMoreVa", MODEL.GS9CC1A0_WORD_MORE_VA],
    ["9cc1a0Count8MoreVa", MODEL.GS9CC1A0_COUNT8_MORE_VA],
    ["9cc1a0SignedBytePosVa", MODEL.GS9CC1A0_SIGNED_BYTE_POS_VA],
    ["9cc1a0SignedIdxMovsx8Va", MODEL.GS9CC1A0_SIGNED_IDX_MOVSX8_VA],
    ["9cc1a0SignedIdxCountVa", MODEL.GS9CC1A0_SIGNED_IDX_COUNT_VA],
    ["9cc1a0SignedByteLtVa", MODEL.GS9CC1A0_SIGNED_BYTE_LT_VA],
    ["9cc1a0ByteZeroGateVa", MODEL.GS9CC1A0_BYTE_ZERO_GATE_VA],
    ["9cc1a0TailReadyGateVa", MODEL.GS9CC1A0_TAIL_READY_GATE_VA],
    ["9cc1a0ChecksumPassVa", MODEL.GS9CC1A0_CHECKSUM_PASS_VA],
    ["9cc1a0ChecksumMatchVa", MODEL.GS9CC1A0_CHECKSUM_MATCH_VA],
    ["9cc1a0Clamp35Va", MODEL.GS9CC1A0_CLAMP35_VA],
    ["9cc1a0Clamp1aVa", MODEL.GS9CC1A0_CLAMP1A_VA],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    assert.notEqual(want, 0, key + " pin is non-trivial");
  }
  assert.equal(exp["9cc1a0CallerCount"]() >>> 0, MODEL.gs9cc1a0CallerCount());
  for (let i = 0; i < 3; i++) {
    assert.equal(exp["9cc1a0CallerVaAt"](i) >>> 0, MODEL.GS9CC1A0_CALLER_VAS[i], `9cc1a0CallerVaAt(${i})`);
  }
  assert.equal(exp["9cc1a0CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
});
test("PE byte-truth pins: body C 0x9ce720 + reader giant 0x9d05d0 sites", () => {
  const bytes = [
    // body C edges
    [0x9ce720, [0x55, 0x8b, 0xec, 0x83, 0xec, 0x38]],
    [0x9cec66, [0xc2, 0x04, 0x00]],
    [0x9cec71, [0xc2, 0x04, 0x00]],
    [0x9cec74, [0xcc, 0xcc, 0xcc, 0xcc]],
    [0x9ce7e6, [0xe8, 0xf5, 0x28, 0xd6, 0xff]],
    // body C pins (law sites)
    [0x9ce73d, [0x83, 0xf8, 0x7a, 0x89, 0x55, 0xf0, 0x8b, 0xda, 0x1b, 0xff, 0x83, 0xe7, 0xfe]],
    [0x9ce74d, [0x83, 0xf8, 0x70, 0x0f, 0x42, 0xfe, 0x83, 0xf8, 0x69, 0xbe]],
    [0x9ce753, [0x83, 0xf8, 0x69, 0xbe, 0x1b, 0x00, 0x00, 0x00, 0x0f, 0x42, 0xfe, 0xbe]],
    [0x9ce763, [0x83, 0xf8, 0x57, 0x0f, 0x42, 0xfe, 0x8d, 0x71]],
    [0x9ce9c0, [0x3b, 0xd0, 0x0f, 0x87, 0xa1, 0x02]],
    [0x9ceaea, [0x3b, 0xd0, 0x0f, 0x87, 0x77, 0x01]],
    [0x9ce938, [0x83, 0xf8, 0x4a, 0x72, 0x2e]],
    [0x9ce96b, [0x83, 0xf8, 0x37, 0x72, 0x27]],
    [0x9cea98, [0x83, 0xf8, 0x37, 0x72, 0x27]],
    [0x9ce997, [0x83, 0xf8, 0x35, 0x1b, 0xd2, 0x81, 0xe2, 0x22, 0xff, 0xff, 0xff, 0x81]],
    [0x9ceac4, [0x83, 0xf8, 0x35, 0x1b, 0xd2, 0x83, 0xe2, 0xba, 0x81, 0xc2, 0xbe, 0x00, 0x00, 0x00]],
    [0x9cebea, [0x83, 0xf8, 0x77, 0x8b, 0x75, 0xf0, 0x1b, 0xff, 0x81]],
    [0x9cec35, [0x83, 0x7b, 0x08, 0x4e, 0x72, 0x23, 0x8b]],

    // giant edges
    [0x9d05e8, [0x68, 0x9e, 0xf3, 0xb0, 0x00]],
    [0x9d05fe, [0xa1, 0xb4, 0x93, 0xbf, 0x00]],
    [0x9d45af, [0xc2, 0x04, 0x00]],
    [0x9d45b2, [0xe8, 0x09, 0x16, 0xa4, 0xff]],
    [0x9d45b7, [0xcc, 0xcc, 0xcc, 0xcc]],
    [0x9d1df0, [0xe8, 0x2b, 0x92, 0xff, 0xff]],  // reader-row call -> 0x9cb020
    // giant law sites (primary pins)
    [0x9d1ade, [0x83, 0xf8, 0x1e, 0x0f, 0x82]],
    [0x9d1a4f, [0x83, 0xf8, 0x1f, 0x0f, 0x82]],
    [0x9d222f, [0x83, 0x7f, 0x08, 0x20, 0x0f]],
    [0x9d21f8, [0x83, 0x7f, 0x08, 0x23, 0x8d]],
    [0x9d12ab, [0x83, 0xf8, 0x27, 0x72, 0x61]],
    [0x9d0c24, [0x83, 0x7f, 0x08, 0x28, 0x8b]],
    [0x9d1020, [0x83, 0xf8, 0x29, 0x72, 0x5b]],
    [0x9d0a7c, [0x83, 0xf8, 0x2d, 0x72, 0x2a]],
    [0x9d120d, [0x83, 0xf8, 0x2f, 0x0f, 0x82]],
    [0x9d17f3, [0x83, 0xf8, 0x2f, 0x72, 0x57]],
    [0x9d17b3, [0x83, 0xf8, 0x30, 0x72, 0x3b]],
    [0x9d0dbd, [0x8b, 0x47, 0x08, 0x83, 0xf8]],
    [0x9d1c8a, [0x83, 0x7f, 0x08, 0x39, 0x0f]],
    [0x9d09e7, [0x83, 0xf8, 0x3a, 0x72, 0x2b]],
    [0x9d0afa, [0x83, 0xf8, 0x3b, 0x72, 0x22]],
    [0x9d0aab, [0x83, 0xf8, 0x3e, 0x72, 0x4a]],
    [0x9d258c, [0x83, 0x7f, 0x08, 0x40, 0x0f]],
    [0x9d2702, [0x83, 0x7f, 0x08, 0x41, 0x0f]],
    [0x9d4066, [0x83, 0x7f, 0x08, 0x43, 0x0f]],
    [0x9d0c2d, [0x83, 0x7f, 0x08, 0x45, 0x8d]],
    [0x9d11aa, [0x83, 0xf8, 0x4c, 0x72, 0x5b]],
    [0x9d093b, [0x83, 0xf8, 0x4d, 0x72, 0x74]],
    [0x9d1252, [0x83, 0xf8, 0x4d, 0x73, 0x54]],
    [0x9d190c, [0x83, 0x7f, 0x08, 0x4d, 0x8b]],
    [0x9d27db, [0x83, 0xfa, 0x4f, 0x72, 0x2c]],
    [0x9d280f, [0x83, 0xfa, 0x50, 0x72, 0x55]],
    [0x9d4323, [0x83, 0x7f, 0x08, 0x51, 0x0f]],
    [0x9d2869, [0x83, 0xfa, 0x52, 0x72, 0x2d]],
    [0x9d240a, [0x83, 0xf9, 0x55, 0x72, 0x61]],
    [0x9d2737, [0x83, 0xfa, 0x58, 0x72, 0x2d]],
    [0x9d2470, [0x83, 0xf9, 0x5a, 0x72, 0x33]],
    [0x9d1ec5, [0x83, 0xf8, 0x5b, 0x72, 0x53]],
    [0x9d289b, [0x83, 0xfa, 0x5b, 0x0f, 0x82]],
    [0x9d2988, [0x83, 0xfa, 0x5c, 0x72, 0x39]],
    [0x9d291c, [0x83, 0xfa, 0x5d, 0x72, 0x5e]],
    [0x9d1f1d, [0x83, 0xf8, 0x5e, 0x72, 0x55]],
    [0x9d2a01, [0x83, 0xfa, 0x5f, 0x0f, 0x82]],
    [0x9d2b1d, [0x83, 0xfa, 0x60, 0x0f, 0x82]],
    [0x9d2c61, [0x83, 0xf8, 0x61, 0x0f, 0x82]],
    [0x9d2dc8, [0x83, 0xf8, 0x62, 0x72, 0x2d]],
    [0x9d29c9, [0x83, 0xfa, 0x63, 0x72, 0x30]],
    [0x9d0ef5, [0x83, 0xf8, 0x64, 0x72, 0x2e]],
    [0x9d2dfa, [0x83, 0xf8, 0x64, 0x0f, 0x82]],
    [0x9d42ad, [0x83, 0x7f, 0x08, 0x65, 0x0f]],
    [0x9d1de2, [0x83, 0x7f, 0x08, 0x67, 0x72]],
    [0x9d2e36, [0x83, 0xf8, 0x6a, 0x0f, 0x82]],
    [0x9d0f28, [0x83, 0xf8, 0x6c, 0x72, 0x27]],
    [0x9d2eea, [0x83, 0xf8, 0x6c, 0x0f, 0x82]],
    [0x9d3df9, [0x83, 0xf8, 0x6e, 0x0f, 0x82]],
    [0x9d3eb7, [0x83, 0x7f, 0x08, 0x6f, 0x72]],
    [0x9d2769, [0x83, 0xfa, 0x72, 0x72, 0x64]],
    [0x9d3f17, [0x83, 0xf8, 0x73, 0x72, 0x2b]],
    [0x9d1c35, [0x83, 0x7f, 0x08, 0x74, 0x8b]],
    [0x9d354a, [0x83, 0xfa, 0x75, 0x72, 0x2e]],
    [0x9d357d, [0x83, 0xfa, 0x76, 0x72, 0x2b]],
    [0x9d35ad, [0x83, 0xfa, 0x78, 0x72, 0x2f]],
    [0x9d08cf, [0x83, 0x7f, 0x08, 0x79, 0x8d]],
    [0x9d35e4, [0x83, 0xfa, 0x7e, 0x72, 0x0f]],
    [0x9d3f4a, [0x83, 0xf8, 0x7f, 0x0f, 0x82]],
    [0x9d399b, [0x3d, 0x80, 0x00, 0x00, 0x00]],
    [0x9d3c9c, [0x3d, 0x81, 0x00, 0x00, 0x00]],
    [0x9d0849, [0x81, 0x7f, 0x08, 0x82, 0x00]],
    [0x9d3af5, [0x3d, 0x82, 0x00, 0x00, 0x00]],
    [0x9d3ccb, [0x3d, 0x82, 0x00, 0x00, 0x00]],
    [0x9d3d6f, [0x3d, 0x83, 0x00, 0x00, 0x00]],
    [0x9d4403, [0x81, 0x7f, 0x08, 0x8a, 0x00]],
    [0x9d1314, [0x3d, 0x8b, 0x00, 0x00, 0x00]],
    [0x9d2197, [0x81, 0x7f, 0x08, 0x8c, 0x00]],
    [0x9d24ad, [0x81, 0xf9, 0x8f, 0x00, 0x00]],
    [0x9d2f1a, [0x81, 0x7f, 0x08, 0x90, 0x00]],
    [0x9d131f, [0x3d, 0x97, 0x00, 0x00, 0x00]],
    [0x9d0e7b, [0x81, 0x7f, 0x08, 0x99, 0x00]],
    [0x9d336a, [0x81, 0x7f, 0x08, 0x99, 0x00]],
    [0x9d24ec, [0x81, 0x7f, 0x08, 0x9c, 0x00]],
    [0x9d44d3, [0x81, 0x7f, 0x08, 0x9d, 0x00]],
    [0x9d252f, [0x81, 0x7f, 0x08, 0xa0, 0x00]],
    [0x9d35f8, [0x81, 0xfa, 0xa4, 0x00, 0x00]],
    [0x9d0a4b, [0x3d, 0xa5, 0x00, 0x00, 0x00]],
    [0x9d0c58, [0x81, 0x7f, 0x08, 0xa6, 0x00]],
    [0x9d3d05, [0x3d, 0xa8, 0x00, 0x00, 0x00]],
    [0x9d3d37, [0x3d, 0xa9, 0x00, 0x00, 0x00]],
    [0x9d09b4, [0x83, 0xf8, 0x23, 0x76, 0x2e]],
    [0x9d0a1a, [0x83, 0xf8, 0x24, 0x76, 0x29]],
    [0x9d0df7, [0x83, 0xf8, 0x3c, 0x73, 0x09]],
    [0x9d0e05, [0x83, 0xf8, 0x66, 0x73, 0x09]],
    [0x9d0e13, [0x83, 0xf8, 0x71, 0xba, 0x03]],
    [0x9d1085, [0x83, 0xf8, 0x66, 0x73, 0x16]],
    [0x9d10a0, [0x83, 0xf8, 0x71, 0xb8, 0x03]],
    [0x9d1171, [0x81, 0x7f, 0x08, 0xa7, 0x00]],
    [0x9d15ef, [0x83, 0xe8, 0x2f, 0x83, 0xf8, 0x61, 0x77, 0x62, 0x8b]],
    [0x9d1ce2, [0x81, 0xf9, 0x22, 0x22, 0x22, 0x02]],
    [0x9d2b9a, [0x3b, 0xca, 0x73, 0x0e, 0xc1]],
    [0x9d3061, [0x83, 0xbe, 0xc0, 0x04, 0x00, 0x00, 0x03, 0x0f]],
    [0x9d31d0, [0x83, 0xbe, 0xc0, 0x04, 0x00, 0x00, 0x03, 0x0f]],
    [0x9d340e, [0xba, 0x14, 0x00, 0x00, 0x00, 0x38, 0x55, 0xe3, 0x8b]],
    [0x9d1b13, [0x83, 0xbe, 0x2c, 0x02, 0x00, 0x00, 0x0a, 0x8d, 0x8e, 0x2c, 0x02, 0x00, 0x00]],
    [0x9d0644, [0x85, 0xc9, 0x0f, 0x88, 0x3e, 0x3f, 0x00, 0x00]],
    [0x9d0670, [0x3b, 0xc8, 0x0f, 0x8d, 0x12, 0x3f, 0x00, 0x00]],
    [0x9d0e58, [0x8b, 0x32, 0x85, 0xf6, 0x7e]],
    [0x9d364f, [0x83, 0x7d, 0xc8, 0x00, 0xc7, 0x45, 0xb8]],
    [0x9d3ee4, [0x85, 0xf6, 0x7e, 0x2c, 0x8b]],
    [0x9d43d6, [0x7e, 0x1a, 0x8b, 0x0d, 0x9c]],
    [0x9d2fc0, [0x0f, 0x8d, 0x2d, 0xe2, 0xff, 0xff, 0x83]],
    [0x9d1837, [0x0f, 0x8d, 0x68, 0x01, 0x00, 0x00, 0x83]],
    [0x9d4044, [0x7d, 0x06, 0x83, 0x3c, 0x8a, 0x00, 0x75]],
    [0x9d41f1, [0x0f, 0x8d, 0xb8, 0x01, 0x00, 0x00, 0x8b]],
    [0x9d41d2, [0x81, 0xe2, 0xff, 0x7f, 0x00, 0x00, 0x8b, 0xb8]],
    [0x9d159e, [0x81, 0xe1, 0xff, 0x7f, 0x00, 0x00, 0x8b, 0x3d]],
    [0x9d3aaa, [0x81, 0xe1, 0xff, 0x7f, 0x00, 0x00, 0x8b, 0x80]],
    [0x9d3c4e, [0x81, 0xe1, 0xff, 0x7f, 0x00, 0x00, 0x8b, 0x80]],
    [0x9d4250, [0x85, 0xc0, 0x79, 0x0e, 0xa1]],
    [0x9d251d, [0x84, 0xc0, 0x8b, 0x45, 0xc0]],
    [0x9d2563, [0x84, 0xc0, 0x8b, 0x45, 0xc0]],
    [0x9d38ba, [0x80, 0x7d, 0xd7, 0x00, 0x8b, 0x55, 0xd8, 0x0f]],
    [0x9d38f3, [0x80, 0x7d, 0xe3, 0x00, 0x8b, 0x75, 0xd8, 0x0f]],
    [0x9d265e, [0x76, 0x3e, 0x8b, 0x0f, 0x8b]],
    [0x9d2f51, [0x0f, 0x86, 0x9f, 0x03, 0x00]],
    [0x9d3438, [0x38, 0x4d, 0xe3, 0x76, 0x38]],
    [0x9d3e3f, [0x38, 0x45, 0xe3, 0x0f, 0x86]],
    [0x9d42da, [0x80, 0x7d, 0xd7, 0x00, 0xc6]],
    [0x9d4368, [0x0f, 0x86, 0x95, 0x00, 0x00]],
    [0x9d1118, [0x80, 0x7d, 0xe3, 0x01, 0x8b]],
    [0x9d2f9b, [0x80, 0x7d, 0xb4, 0x01, 0x75]],
    [0x9d3a0d, [0x80, 0x7d, 0xd7, 0x01, 0x8b]],
    [0x9d3f7f, [0x80, 0xbe, 0xbc, 0x05, 0x00, 0x00, 0xff, 0x0f, 0x84]],
    [0x9d16f4, [0x00, 0xc7, 0x45, 0xbc, 0x00, 0x00, 0x00]],
    [0x9d2289, [0x83, 0xbe, 0x7c, 0x03, 0x00, 0x00, 0x00]],
    [0x9d409e, [0x0f, 0x86, 0x09, 0x02, 0x00]],
    [0x9d4433, [0x83, 0x7d, 0xc4, 0x00, 0xc7]],
    [0x9d450c, [0x83, 0x7d, 0xd8, 0x00, 0xc7]],
    [0x9d170b, [0x84, 0xc0, 0x0f, 0x85, 0x75, 0x02, 0x00, 0x00]],
    [0x9d22b0, [0x84, 0xc0, 0x0f, 0x85, 0x24]],
    [0x9d2669, [0x84, 0xc0, 0x0f, 0x85, 0x72]],
    [0x9d3670, [0x84, 0xc0, 0x0f, 0x85, 0xdc]],
    [0x9d40ad, [0x84, 0xc0, 0x74, 0x15, 0xff]],
    [0x9d0e70, [0x85, 0xc0, 0x0f, 0x84, 0x1b, 0x02]],
    [0x9d3e99, [0x85, 0xc0, 0x0f, 0x84, 0x68]],
    [0x9d3efa, [0x85, 0xc0, 0x75, 0x16, 0x56]],
    [0x9d400b, [0x85, 0xc0, 0x75, 0x13, 0xff]],
    [0x9d4220, [0x85, 0xc0, 0x0f, 0x84, 0x92]],
    [0x9d43ea, [0x85, 0xc0, 0x0f, 0x84, 0x8e]],
    [0x9d178f, [0x84, 0xc0, 0x0f, 0x84, 0xd9, 0x01, 0x00]],
    [0x9d2d93, [0x84, 0xc0, 0x74, 0x16, 0x8b]],
    [0x9d268d, [0x84, 0xc0, 0x74, 0x4a, 0x8a]],
    [0x9d26d7, [0x84, 0xc0, 0x75, 0x27, 0x8b]],
    [0x9d2699, [0x3a, 0x45, 0xe3, 0x72, 0xc2]],
    [0x9d2fdb, [0x0f, 0x82, 0x76, 0xff, 0xff]],
    [0x9d3471, [0x3b, 0xc8, 0x72, 0xcb, 0x8b]],
    [0x9d3eac, [0x3a, 0x45, 0xe3, 0x72, 0x9f]],
    [0x9d431e, [0x3a, 0x55, 0xd7, 0x72, 0xc1]],
    [0x9d43fd, [0x0f, 0x82, 0x6d, 0xff, 0xff]],
    [0x9d3aed, [0x83, 0xf9, 0x02, 0x72, 0xa2]],
    [0x9d3c94, [0x83, 0xf9, 0x02, 0x72, 0x9b]],
    [0x9d33e3, [0x83, 0xf8, 0x06, 0x72, 0xcc]],
    [0x9d333d, [0x83, 0xf8, 0x08, 0x72, 0xce]],
    [0x9d2c55, [0x66, 0x3b, 0x45, 0xd0, 0x72, 0x48]],
    [0x9d2d9e, [0x66, 0x3b, 0x45, 0xd0, 0x0f, 0x82]],
    [0x9d17a1, [0x3b, 0x86, 0xd0, 0x01, 0x00, 0x00, 0x0f]],
    [0x9d1168, [0x3b, 0x45, 0x8c, 0x0f, 0x82]],
    [0x9d2019, [0x0f, 0x82, 0xf1, 0xfc, 0xff]],
    [0x9d2583, [0x0f, 0x82, 0x1e, 0xfd, 0xff]],
    [0x9d42a7, [0x0f, 0x82, 0xf7, 0xfd, 0xff]],
    [0x9d4577, [0x3b, 0x45, 0xd8, 0x72, 0xa4]],
  ];
  for (const [va, want] of bytes) {
    assert.deepEqual([...peAt(va, want.length)], want, `0x${va.toString(16)}`);
  }
});
test("Wasm zero-import exports match JS oracle on fixed cases (ABI v10)", () => {
  const exp = loadExports();
  const M = MODEL;
  const key10 = (sfx) => sfx.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
  const eq = (key, mk, args, want, note) => {
    assert.equal(exp[key](...args) >>> 0, want >>> 0, key + (note ? " " + note : ""));
    assert.equal(M[mk](...args) >>> 0, want >>> 0, key + " model");
  };
  const row = (l, args, want, note) =>
    eq(key10(l.sfx), l.model, args, want, note);
  const laws10_9ce720_dispatch_count = { sfx: "9ce720_dispatch_count", model: "gs9ce720DispatchCount" };
  const laws10_9ce720_count_fits = { sfx: "9ce720_count_fits", model: "gs9ce720CountFits" };
  const laws10_9ce720_io_gate_0x4a = { sfx: "9ce720_io_gate_0x4a", model: "gs9ce720IoGate0x4a" };
  const laws10_9ce720_io_gate_0x37 = { sfx: "9ce720_io_gate_0x37", model: "gs9ce720IoGate0x37" };
  const laws10_9ce720_default_count_0x1ff_0x2dd = { sfx: "9ce720_default_count_0x1ff_0x2dd", model: "gs9ce720DefaultCount0x1ff0x2dd" };
  const laws10_9ce720_default_count_0x78_0xbe = { sfx: "9ce720_default_count_0x78_0xbe", model: "gs9ce720DefaultCount0x78_0xbe" };
  const laws10_9ce720_count_0xe_0xf = { sfx: "9ce720_count_0xe_0xf", model: "gs9ce720Count0xe_0xf" };
  const laws10_9ce720_io_gate_0x4e = { sfx: "9ce720_io_gate_0x4e", model: "gs9ce720IoGate0x4e" };
  const laws10_9d05d0_io_gate_0x1e = { sfx: "9d05d0_io_gate_0x1e", model: "gs9d05d0IoGate0x1E" };
  const laws10_9d05d0_io_gate_0x1f = { sfx: "9d05d0_io_gate_0x1f", model: "gs9d05d0IoGate0x1F" };
  const laws10_9d05d0_io_gate_0x20 = { sfx: "9d05d0_io_gate_0x20", model: "gs9d05d0IoGate0x20" };
  const laws10_9d05d0_io_gate_0x23 = { sfx: "9d05d0_io_gate_0x23", model: "gs9d05d0IoGate0x23" };
  const laws10_9d05d0_io_gate_0x27 = { sfx: "9d05d0_io_gate_0x27", model: "gs9d05d0IoGate0x27" };
  const laws10_9d05d0_io_gate_0x28 = { sfx: "9d05d0_io_gate_0x28", model: "gs9d05d0IoGate0x28" };
  const laws10_9d05d0_io_gate_0x29 = { sfx: "9d05d0_io_gate_0x29", model: "gs9d05d0IoGate0x29" };
  const laws10_9d05d0_io_gate_0x2d = { sfx: "9d05d0_io_gate_0x2d", model: "gs9d05d0IoGate0x2D" };
  const laws10_9d05d0_io_gate_0x2f = { sfx: "9d05d0_io_gate_0x2f", model: "gs9d05d0IoGate0x2F" };
  const laws10_9d05d0_io_gate_0x30 = { sfx: "9d05d0_io_gate_0x30", model: "gs9d05d0IoGate0x30" };
  const laws10_9d05d0_io_gate_0x38 = { sfx: "9d05d0_io_gate_0x38", model: "gs9d05d0IoGate0x38" };
  const laws10_9d05d0_io_gate_0x39 = { sfx: "9d05d0_io_gate_0x39", model: "gs9d05d0IoGate0x39" };
  const laws10_9d05d0_io_gate_0x3a = { sfx: "9d05d0_io_gate_0x3a", model: "gs9d05d0IoGate0x3A" };
  const laws10_9d05d0_io_gate_0x3b = { sfx: "9d05d0_io_gate_0x3b", model: "gs9d05d0IoGate0x3B" };
  const laws10_9d05d0_io_gate_0x3e = { sfx: "9d05d0_io_gate_0x3e", model: "gs9d05d0IoGate0x3E" };
  const laws10_9d05d0_io_gate_0x40 = { sfx: "9d05d0_io_gate_0x40", model: "gs9d05d0IoGate0x40" };
  const laws10_9d05d0_io_gate_0x41 = { sfx: "9d05d0_io_gate_0x41", model: "gs9d05d0IoGate0x41" };
  const laws10_9d05d0_io_gate_0x43 = { sfx: "9d05d0_io_gate_0x43", model: "gs9d05d0IoGate0x43" };
  const laws10_9d05d0_io_gate_0x45 = { sfx: "9d05d0_io_gate_0x45", model: "gs9d05d0IoGate0x45" };
  const laws10_9d05d0_io_gate_0x4c = { sfx: "9d05d0_io_gate_0x4c", model: "gs9d05d0IoGate0x4C" };
  const laws10_9d05d0_io_gate_0x4d = { sfx: "9d05d0_io_gate_0x4d", model: "gs9d05d0IoGate0x4D" };
  const laws10_9d05d0_io_gate_0x4f = { sfx: "9d05d0_io_gate_0x4f", model: "gs9d05d0IoGate0x4F" };
  const laws10_9d05d0_io_gate_0x50 = { sfx: "9d05d0_io_gate_0x50", model: "gs9d05d0IoGate0x50" };
  const laws10_9d05d0_io_gate_0x51 = { sfx: "9d05d0_io_gate_0x51", model: "gs9d05d0IoGate0x51" };
  const laws10_9d05d0_io_gate_0x52 = { sfx: "9d05d0_io_gate_0x52", model: "gs9d05d0IoGate0x52" };
  const laws10_9d05d0_io_gate_0x55 = { sfx: "9d05d0_io_gate_0x55", model: "gs9d05d0IoGate0x55" };
  const laws10_9d05d0_io_gate_0x58 = { sfx: "9d05d0_io_gate_0x58", model: "gs9d05d0IoGate0x58" };
  const laws10_9d05d0_io_gate_0x5a = { sfx: "9d05d0_io_gate_0x5a", model: "gs9d05d0IoGate0x5A" };
  const laws10_9d05d0_io_gate_0x5b = { sfx: "9d05d0_io_gate_0x5b", model: "gs9d05d0IoGate0x5B" };
  const laws10_9d05d0_io_gate_0x5c = { sfx: "9d05d0_io_gate_0x5c", model: "gs9d05d0IoGate0x5C" };
  const laws10_9d05d0_io_gate_0x5d = { sfx: "9d05d0_io_gate_0x5d", model: "gs9d05d0IoGate0x5D" };
  const laws10_9d05d0_io_gate_0x5e = { sfx: "9d05d0_io_gate_0x5e", model: "gs9d05d0IoGate0x5E" };
  const laws10_9d05d0_io_gate_0x5f = { sfx: "9d05d0_io_gate_0x5f", model: "gs9d05d0IoGate0x5F" };
  const laws10_9d05d0_io_gate_0x60 = { sfx: "9d05d0_io_gate_0x60", model: "gs9d05d0IoGate0x60" };
  const laws10_9d05d0_io_gate_0x61 = { sfx: "9d05d0_io_gate_0x61", model: "gs9d05d0IoGate0x61" };
  const laws10_9d05d0_io_gate_0x62 = { sfx: "9d05d0_io_gate_0x62", model: "gs9d05d0IoGate0x62" };
  const laws10_9d05d0_io_gate_0x63 = { sfx: "9d05d0_io_gate_0x63", model: "gs9d05d0IoGate0x63" };
  const laws10_9d05d0_io_gate_0x64 = { sfx: "9d05d0_io_gate_0x64", model: "gs9d05d0IoGate0x64" };
  const laws10_9d05d0_io_gate_0x65 = { sfx: "9d05d0_io_gate_0x65", model: "gs9d05d0IoGate0x65" };
  const laws10_9d05d0_io_gate_0x67 = { sfx: "9d05d0_io_gate_0x67", model: "gs9d05d0IoGate0x67" };
  const laws10_9d05d0_io_gate_0x6a = { sfx: "9d05d0_io_gate_0x6a", model: "gs9d05d0IoGate0x6A" };
  const laws10_9d05d0_io_gate_0x6c = { sfx: "9d05d0_io_gate_0x6c", model: "gs9d05d0IoGate0x6C" };
  const laws10_9d05d0_io_gate_0x6e = { sfx: "9d05d0_io_gate_0x6e", model: "gs9d05d0IoGate0x6E" };
  const laws10_9d05d0_io_gate_0x6f = { sfx: "9d05d0_io_gate_0x6f", model: "gs9d05d0IoGate0x6F" };
  const laws10_9d05d0_io_gate_0x72 = { sfx: "9d05d0_io_gate_0x72", model: "gs9d05d0IoGate0x72" };
  const laws10_9d05d0_io_gate_0x73 = { sfx: "9d05d0_io_gate_0x73", model: "gs9d05d0IoGate0x73" };
  const laws10_9d05d0_io_gate_0x74 = { sfx: "9d05d0_io_gate_0x74", model: "gs9d05d0IoGate0x74" };
  const laws10_9d05d0_io_gate_0x75 = { sfx: "9d05d0_io_gate_0x75", model: "gs9d05d0IoGate0x75" };
  const laws10_9d05d0_io_gate_0x76 = { sfx: "9d05d0_io_gate_0x76", model: "gs9d05d0IoGate0x76" };
  const laws10_9d05d0_io_gate_0x78 = { sfx: "9d05d0_io_gate_0x78", model: "gs9d05d0IoGate0x78" };
  const laws10_9d05d0_io_gate_0x79 = { sfx: "9d05d0_io_gate_0x79", model: "gs9d05d0IoGate0x79" };
  const laws10_9d05d0_io_gate_0x7e = { sfx: "9d05d0_io_gate_0x7e", model: "gs9d05d0IoGate0x7E" };
  const laws10_9d05d0_io_gate_0x7f = { sfx: "9d05d0_io_gate_0x7f", model: "gs9d05d0IoGate0x7F" };
  const laws10_9d05d0_io_gate_0x80 = { sfx: "9d05d0_io_gate_0x80", model: "gs9d05d0IoGate0x80" };
  const laws10_9d05d0_io_gate_0x81 = { sfx: "9d05d0_io_gate_0x81", model: "gs9d05d0IoGate0x81" };
  const laws10_9d05d0_io_gate_0x82 = { sfx: "9d05d0_io_gate_0x82", model: "gs9d05d0IoGate0x82" };
  const laws10_9d05d0_io_gate_0x83 = { sfx: "9d05d0_io_gate_0x83", model: "gs9d05d0IoGate0x83" };
  const laws10_9d05d0_io_gate_0x8a = { sfx: "9d05d0_io_gate_0x8a", model: "gs9d05d0IoGate0x8A" };
  const laws10_9d05d0_io_gate_0x8b = { sfx: "9d05d0_io_gate_0x8b", model: "gs9d05d0IoGate0x8B" };
  const laws10_9d05d0_io_gate_0x8c = { sfx: "9d05d0_io_gate_0x8c", model: "gs9d05d0IoGate0x8C" };
  const laws10_9d05d0_io_gate_0x8f = { sfx: "9d05d0_io_gate_0x8f", model: "gs9d05d0IoGate0x8F" };
  const laws10_9d05d0_io_gate_0x90 = { sfx: "9d05d0_io_gate_0x90", model: "gs9d05d0IoGate0x90" };
  const laws10_9d05d0_io_gate_0x97 = { sfx: "9d05d0_io_gate_0x97", model: "gs9d05d0IoGate0x97" };
  const laws10_9d05d0_io_gate_0x99 = { sfx: "9d05d0_io_gate_0x99", model: "gs9d05d0IoGate0x99" };
  const laws10_9d05d0_io_gate_0x9c = { sfx: "9d05d0_io_gate_0x9c", model: "gs9d05d0IoGate0x9C" };
  const laws10_9d05d0_io_gate_0x9d = { sfx: "9d05d0_io_gate_0x9d", model: "gs9d05d0IoGate0x9D" };
  const laws10_9d05d0_io_gate_0xa0 = { sfx: "9d05d0_io_gate_0xa0", model: "gs9d05d0IoGate0xA0" };
  const laws10_9d05d0_io_gate_0xa4 = { sfx: "9d05d0_io_gate_0xa4", model: "gs9d05d0IoGate0xA4" };
  const laws10_9d05d0_io_gate_0xa5 = { sfx: "9d05d0_io_gate_0xa5", model: "gs9d05d0IoGate0xA5" };
  const laws10_9d05d0_io_gate_0xa6 = { sfx: "9d05d0_io_gate_0xa6", model: "gs9d05d0IoGate0xA6" };
  const laws10_9d05d0_io_gate_0xa8 = { sfx: "9d05d0_io_gate_0xa8", model: "gs9d05d0IoGate0xA8" };
  const laws10_9d05d0_io_gate_0xa9 = { sfx: "9d05d0_io_gate_0xa9", model: "gs9d05d0IoGate0xA9" };
  const laws10_9d05d0_io_gate_0x23_above = { sfx: "9d05d0_io_gate_0x23_above", model: "gs9d05d0IoGate0x23Above" };
  const laws10_9d05d0_io_gate_0x24_above = { sfx: "9d05d0_io_gate_0x24_above", model: "gs9d05d0IoGate0x24Above" };
  const laws10_9d05d0_lane_count_1_4 = { sfx: "9d05d0_lane_count_1_4", model: "gs9d05d0LaneCount1_4" };
  const laws10_9d05d0_lane_count_2_4 = { sfx: "9d05d0_lane_count_2_4", model: "gs9d05d0LaneCount2_4" };
  const laws10_9d05d0_count_0xf_0x10 = { sfx: "9d05d0_count_0xf_0x10", model: "gs9d05d0Count0xf0x10" };
  const laws10_9d05d0_format_in_range = { sfx: "9d05d0_format_in_range", model: "gs9d05d0FormatInRange" };
  const laws10_9d05d0_count_cap_ok = { sfx: "9d05d0_count_cap_ok", model: "gs9d05d0CountCapOk" };
  const laws10_9d05d0_idx_le_vecsize = { sfx: "9d05d0_idx_le_vecsize", model: "gs9d05d0IdxLeVecsize" };
  const laws10_9d05d0_slot_cap_lt_3 = { sfx: "9d05d0_slot_cap_lt_3", model: "gs9d05d0SlotCapLt3" };
  const laws10_9d05d0_clamp_0x14 = { sfx: "9d05d0_clamp_0x14", model: "gs9d05d0Clamp0x14" };
  const laws10_9d05d0_clamp_signed_0xa = { sfx: "9d05d0_clamp_signed_0xa", model: "gs9d05d0ClampSigned0xa" };
  const laws10_9d05d0_head_nonneg = { sfx: "9d05d0_head_nonneg", model: "gs9d05d0HeadNonneg" };
  const laws10_9d05d0_head_lt_vecsize = { sfx: "9d05d0_head_lt_vecsize", model: "gs9d05d0HeadLtVecsize" };
  const laws10_9d05d0_signed_positive = { sfx: "9d05d0_signed_positive", model: "gs9d05d0SignedPositive" };
  const laws10_9d05d0_signed_idx_lt_vecsize = { sfx: "9d05d0_signed_idx_lt_vecsize", model: "gs9d05d0SignedIdxLtVecsize" };
  const laws10_9d05d0_idx_masked_7fff_lt_vecsize = { sfx: "9d05d0_idx_masked_7fff_lt_vecsize", model: "gs9d05d0IdxMasked7fffLtVecsize" };
  const laws10_9d05d0_value_neg_override = { sfx: "9d05d0_value_neg_override", model: "gs9d05d0ValueNegOverride" };
  const laws10_9d05d0_byte_nonzero = { sfx: "9d05d0_byte_nonzero", model: "gs9d05d0ByteNonzero" };
  const laws10_9d05d0_byte_eq_1 = { sfx: "9d05d0_byte_eq_1", model: "gs9d05d0ByteEq1" };
  const laws10_9d05d0_byte_ff_ok = { sfx: "9d05d0_byte_ff_ok", model: "gs9d05d0ByteFfOk" };
  const laws10_9d05d0_u32_count_needed = { sfx: "9d05d0_u32_count_needed", model: "gs9d05d0U32CountNeeded" };
  const laws10_9d05d0_ready_ok = { sfx: "9d05d0_ready_ok", model: "gs9d05d0ReadyOk" };
  const laws10_9d05d0_v2fd10_result_ok = { sfx: "9d05d0_v2fd10_result_ok", model: "gs9d05d0V2fd10ResultOk" };
  const laws10_9d05d0_c7350_result_ok = { sfx: "9d05d0_c7350_result_ok", model: "gs9d05d0C7350ResultOk" };
  const laws10_9d05d0_cff40_result_ok = { sfx: "9d05d0_cff40_result_ok", model: "gs9d05d0Cff40ResultOk" };
  const laws10_9d05d0_byte_idx_lt_byte = { sfx: "9d05d0_byte_idx_lt_byte", model: "gs9d05d0ByteIdxLtByte" };
  const laws10_9d05d0_idx_lt_2 = { sfx: "9d05d0_idx_lt_2", model: "gs9d05d0IdxLt2" };
  const laws10_9d05d0_idx_lt_6 = { sfx: "9d05d0_idx_lt_6", model: "gs9d05d0IdxLt6" };
  const laws10_9d05d0_idx_lt_8 = { sfx: "9d05d0_idx_lt_8", model: "gs9d05d0IdxLt8" };
  const laws10_9d05d0_word_idx_lt_count = { sfx: "9d05d0_word_idx_lt_count", model: "gs9d05d0WordIdxLtCount" };
  const laws10_9d05d0_uint_idx_lt_count = { sfx: "9d05d0_uint_idx_lt_count", model: "gs9d05d0UintIdxLtCount" };
  row(laws10_9d05d0_io_gate_0x1e, [29], 0);
  row(laws10_9d05d0_io_gate_0x1e, [30], 1);
  row(laws10_9d05d0_io_gate_0x1e, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x1f, [30], 0);
  row(laws10_9d05d0_io_gate_0x1f, [31], 1);
  row(laws10_9d05d0_io_gate_0x1f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x20, [31], 0);
  row(laws10_9d05d0_io_gate_0x20, [32], 1);
  row(laws10_9d05d0_io_gate_0x20, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x23, [34], 0);
  row(laws10_9d05d0_io_gate_0x23, [35], 1);
  row(laws10_9d05d0_io_gate_0x23, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x27, [38], 0);
  row(laws10_9d05d0_io_gate_0x27, [39], 1);
  row(laws10_9d05d0_io_gate_0x27, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x28, [39], 0);
  row(laws10_9d05d0_io_gate_0x28, [40], 1);
  row(laws10_9d05d0_io_gate_0x28, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x29, [40], 0);
  row(laws10_9d05d0_io_gate_0x29, [41], 1);
  row(laws10_9d05d0_io_gate_0x29, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x2d, [44], 0);
  row(laws10_9d05d0_io_gate_0x2d, [45], 1);
  row(laws10_9d05d0_io_gate_0x2d, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x2f, [46], 0);
  row(laws10_9d05d0_io_gate_0x2f, [47], 1);
  row(laws10_9d05d0_io_gate_0x2f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x30, [47], 0);
  row(laws10_9d05d0_io_gate_0x30, [48], 1);
  row(laws10_9d05d0_io_gate_0x30, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x38, [55], 0);
  row(laws10_9d05d0_io_gate_0x38, [56], 1);
  row(laws10_9d05d0_io_gate_0x38, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x39, [56], 0);
  row(laws10_9d05d0_io_gate_0x39, [57], 1);
  row(laws10_9d05d0_io_gate_0x39, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x3a, [57], 0);
  row(laws10_9d05d0_io_gate_0x3a, [58], 1);
  row(laws10_9d05d0_io_gate_0x3a, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x3b, [58], 0);
  row(laws10_9d05d0_io_gate_0x3b, [59], 1);
  row(laws10_9d05d0_io_gate_0x3b, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x3e, [61], 0);
  row(laws10_9d05d0_io_gate_0x3e, [62], 1);
  row(laws10_9d05d0_io_gate_0x3e, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x40, [63], 0);
  row(laws10_9d05d0_io_gate_0x40, [64], 1);
  row(laws10_9d05d0_io_gate_0x40, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x41, [64], 0);
  row(laws10_9d05d0_io_gate_0x41, [65], 1);
  row(laws10_9d05d0_io_gate_0x41, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x43, [66], 0);
  row(laws10_9d05d0_io_gate_0x43, [67], 1);
  row(laws10_9d05d0_io_gate_0x43, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x45, [68], 0);
  row(laws10_9d05d0_io_gate_0x45, [69], 1);
  row(laws10_9d05d0_io_gate_0x45, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x4c, [75], 0);
  row(laws10_9d05d0_io_gate_0x4c, [76], 1);
  row(laws10_9d05d0_io_gate_0x4c, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x4d, [76], 0);
  row(laws10_9d05d0_io_gate_0x4d, [77], 1);
  row(laws10_9d05d0_io_gate_0x4d, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x4f, [78], 0);
  row(laws10_9d05d0_io_gate_0x4f, [79], 1);
  row(laws10_9d05d0_io_gate_0x4f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x50, [79], 0);
  row(laws10_9d05d0_io_gate_0x50, [80], 1);
  row(laws10_9d05d0_io_gate_0x50, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x51, [80], 0);
  row(laws10_9d05d0_io_gate_0x51, [81], 1);
  row(laws10_9d05d0_io_gate_0x51, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x52, [81], 0);
  row(laws10_9d05d0_io_gate_0x52, [82], 1);
  row(laws10_9d05d0_io_gate_0x52, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x55, [84], 0);
  row(laws10_9d05d0_io_gate_0x55, [85], 1);
  row(laws10_9d05d0_io_gate_0x55, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x58, [87], 0);
  row(laws10_9d05d0_io_gate_0x58, [88], 1);
  row(laws10_9d05d0_io_gate_0x58, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x5a, [89], 0);
  row(laws10_9d05d0_io_gate_0x5a, [90], 1);
  row(laws10_9d05d0_io_gate_0x5a, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x5b, [90], 0);
  row(laws10_9d05d0_io_gate_0x5b, [91], 1);
  row(laws10_9d05d0_io_gate_0x5b, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x5c, [91], 0);
  row(laws10_9d05d0_io_gate_0x5c, [92], 1);
  row(laws10_9d05d0_io_gate_0x5c, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x5d, [92], 0);
  row(laws10_9d05d0_io_gate_0x5d, [93], 1);
  row(laws10_9d05d0_io_gate_0x5d, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x5e, [93], 0);
  row(laws10_9d05d0_io_gate_0x5e, [94], 1);
  row(laws10_9d05d0_io_gate_0x5e, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x5f, [94], 0);
  row(laws10_9d05d0_io_gate_0x5f, [95], 1);
  row(laws10_9d05d0_io_gate_0x5f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x60, [95], 0);
  row(laws10_9d05d0_io_gate_0x60, [96], 1);
  row(laws10_9d05d0_io_gate_0x60, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x61, [96], 0);
  row(laws10_9d05d0_io_gate_0x61, [97], 1);
  row(laws10_9d05d0_io_gate_0x61, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x62, [97], 0);
  row(laws10_9d05d0_io_gate_0x62, [98], 1);
  row(laws10_9d05d0_io_gate_0x62, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x63, [98], 0);
  row(laws10_9d05d0_io_gate_0x63, [99], 1);
  row(laws10_9d05d0_io_gate_0x63, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x64, [99], 0);
  row(laws10_9d05d0_io_gate_0x64, [100], 1);
  row(laws10_9d05d0_io_gate_0x64, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x65, [100], 0);
  row(laws10_9d05d0_io_gate_0x65, [101], 1);
  row(laws10_9d05d0_io_gate_0x65, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x67, [102], 0);
  row(laws10_9d05d0_io_gate_0x67, [103], 1);
  row(laws10_9d05d0_io_gate_0x67, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x6a, [105], 0);
  row(laws10_9d05d0_io_gate_0x6a, [106], 1);
  row(laws10_9d05d0_io_gate_0x6a, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x6c, [107], 0);
  row(laws10_9d05d0_io_gate_0x6c, [108], 1);
  row(laws10_9d05d0_io_gate_0x6c, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x6e, [109], 0);
  row(laws10_9d05d0_io_gate_0x6e, [110], 1);
  row(laws10_9d05d0_io_gate_0x6e, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x6f, [110], 0);
  row(laws10_9d05d0_io_gate_0x6f, [111], 1);
  row(laws10_9d05d0_io_gate_0x6f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x72, [113], 0);
  row(laws10_9d05d0_io_gate_0x72, [114], 1);
  row(laws10_9d05d0_io_gate_0x72, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x73, [114], 0);
  row(laws10_9d05d0_io_gate_0x73, [115], 1);
  row(laws10_9d05d0_io_gate_0x73, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x74, [115], 0);
  row(laws10_9d05d0_io_gate_0x74, [116], 1);
  row(laws10_9d05d0_io_gate_0x74, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x75, [116], 0);
  row(laws10_9d05d0_io_gate_0x75, [117], 1);
  row(laws10_9d05d0_io_gate_0x75, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x76, [117], 0);
  row(laws10_9d05d0_io_gate_0x76, [118], 1);
  row(laws10_9d05d0_io_gate_0x76, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x78, [119], 0);
  row(laws10_9d05d0_io_gate_0x78, [120], 1);
  row(laws10_9d05d0_io_gate_0x78, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x79, [120], 0);
  row(laws10_9d05d0_io_gate_0x79, [121], 1);
  row(laws10_9d05d0_io_gate_0x79, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x7e, [125], 0);
  row(laws10_9d05d0_io_gate_0x7e, [126], 1);
  row(laws10_9d05d0_io_gate_0x7e, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x7f, [126], 0);
  row(laws10_9d05d0_io_gate_0x7f, [127], 1);
  row(laws10_9d05d0_io_gate_0x7f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x80, [127], 0);
  row(laws10_9d05d0_io_gate_0x80, [128], 1);
  row(laws10_9d05d0_io_gate_0x80, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x81, [128], 0);
  row(laws10_9d05d0_io_gate_0x81, [129], 1);
  row(laws10_9d05d0_io_gate_0x81, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x82, [129], 0);
  row(laws10_9d05d0_io_gate_0x82, [130], 1);
  row(laws10_9d05d0_io_gate_0x82, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x83, [130], 0);
  row(laws10_9d05d0_io_gate_0x83, [131], 1);
  row(laws10_9d05d0_io_gate_0x83, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x8a, [137], 0);
  row(laws10_9d05d0_io_gate_0x8a, [138], 1);
  row(laws10_9d05d0_io_gate_0x8a, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x8b, [138], 0);
  row(laws10_9d05d0_io_gate_0x8b, [139], 1);
  row(laws10_9d05d0_io_gate_0x8b, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x8c, [139], 0);
  row(laws10_9d05d0_io_gate_0x8c, [140], 1);
  row(laws10_9d05d0_io_gate_0x8c, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x8f, [142], 0);
  row(laws10_9d05d0_io_gate_0x8f, [143], 1);
  row(laws10_9d05d0_io_gate_0x8f, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x90, [143], 0);
  row(laws10_9d05d0_io_gate_0x90, [144], 1);
  row(laws10_9d05d0_io_gate_0x90, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x97, [150], 0);
  row(laws10_9d05d0_io_gate_0x97, [151], 1);
  row(laws10_9d05d0_io_gate_0x97, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x99, [152], 0);
  row(laws10_9d05d0_io_gate_0x99, [153], 1);
  row(laws10_9d05d0_io_gate_0x99, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x9c, [155], 0);
  row(laws10_9d05d0_io_gate_0x9c, [156], 1);
  row(laws10_9d05d0_io_gate_0x9c, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x9d, [156], 0);
  row(laws10_9d05d0_io_gate_0x9d, [157], 1);
  row(laws10_9d05d0_io_gate_0x9d, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0xa0, [159], 0);
  row(laws10_9d05d0_io_gate_0xa0, [160], 1);
  row(laws10_9d05d0_io_gate_0xa0, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0xa4, [163], 0);
  row(laws10_9d05d0_io_gate_0xa4, [164], 1);
  row(laws10_9d05d0_io_gate_0xa4, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0xa5, [164], 0);
  row(laws10_9d05d0_io_gate_0xa5, [165], 1);
  row(laws10_9d05d0_io_gate_0xa5, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0xa6, [165], 0);
  row(laws10_9d05d0_io_gate_0xa6, [166], 1);
  row(laws10_9d05d0_io_gate_0xa6, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0xa8, [167], 0);
  row(laws10_9d05d0_io_gate_0xa8, [168], 1);
  row(laws10_9d05d0_io_gate_0xa8, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0xa9, [168], 0);
  row(laws10_9d05d0_io_gate_0xa9, [169], 1);
  row(laws10_9d05d0_io_gate_0xa9, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x23_above, [35], 0, "strict ABOVE");
  row(laws10_9d05d0_io_gate_0x23_above, [36], 1);
  row(laws10_9d05d0_io_gate_0x23_above, [0xffffffff], 1);
  row(laws10_9d05d0_io_gate_0x24_above, [36], 0, "strict ABOVE");
  row(laws10_9d05d0_io_gate_0x24_above, [37], 1);
  row(laws10_9d05d0_io_gate_0x24_above, [0xffffffff], 1);
  // body C 0x9ce720
  row(laws10_9ce720_dispatch_count, [86], 0x1a);
  row(laws10_9ce720_dispatch_count, [87], 0x1b);
  row(laws10_9ce720_dispatch_count, [104], 0x1b);
  row(laws10_9ce720_dispatch_count, [105], 0x1c);
  row(laws10_9ce720_dispatch_count, [111], 0x1c);
  row(laws10_9ce720_dispatch_count, [112], 0x1d);
  row(laws10_9ce720_dispatch_count, [121], 0x1d);
  row(laws10_9ce720_dispatch_count, [122], 0x1f);
  row(laws10_9ce720_dispatch_count, [4294967295], 0x1f);
  row(laws10_9ce720_count_fits, [16,16], 0x1);
  row(laws10_9ce720_count_fits, [17,16], 0x0);
  row(laws10_9ce720_count_fits, [4294967295,4294967295], 0x1);
  row(laws10_9ce720_io_gate_0x4a, [73], 0x0);
  row(laws10_9ce720_io_gate_0x4a, [74], 0x1);
  row(laws10_9ce720_io_gate_0x37, [54], 0x0);
  row(laws10_9ce720_io_gate_0x37, [55], 0x1);
  row(laws10_9ce720_io_gate_0x4e, [77], 0x0);
  row(laws10_9ce720_io_gate_0x4e, [78], 0x1);
  row(laws10_9ce720_default_count_0x1ff_0x2dd, [52], 0x1ff);
  row(laws10_9ce720_default_count_0x1ff_0x2dd, [53], 0x2dd);
  row(laws10_9ce720_default_count_0x78_0xbe, [52], 0x78);
  row(laws10_9ce720_default_count_0x78_0xbe, [53], 0xbe);
  row(laws10_9ce720_count_0xe_0xf, [118], 0xe);
  row(laws10_9ce720_count_0xe_0xf, [119], 0xf);
  // giant 0x9d05d0 D-group
  row(laws10_9d05d0_lane_count_1_4, [59], 0x1);
  row(laws10_9d05d0_lane_count_1_4, [60], 0x2);
  row(laws10_9d05d0_lane_count_1_4, [101], 0x2);
  row(laws10_9d05d0_lane_count_1_4, [102], 0x3);
  row(laws10_9d05d0_lane_count_1_4, [112], 0x3);
  row(laws10_9d05d0_lane_count_1_4, [113], 0x4);
  row(laws10_9d05d0_lane_count_1_4, [4294967295], 0x4);
  row(laws10_9d05d0_lane_count_2_4, [101], 0x2);
  row(laws10_9d05d0_lane_count_2_4, [102], 0x3);
  row(laws10_9d05d0_lane_count_2_4, [112], 0x3);
  row(laws10_9d05d0_lane_count_2_4, [113], 0x4);
  row(laws10_9d05d0_count_0xf_0x10, [166], 0xf);
  row(laws10_9d05d0_count_0xf_0x10, [167], 0x10);
  row(laws10_9d05d0_count_0xf_0x10, [4294967295], 0x10);
  row(laws10_9d05d0_format_in_range, [46], 0x0);
  row(laws10_9d05d0_format_in_range, [47], 0x1);
  row(laws10_9d05d0_format_in_range, [144], 0x1);
  row(laws10_9d05d0_format_in_range, [145], 0x0);
  row(laws10_9d05d0_format_in_range, [4294967295], 0x0);
  row(laws10_9d05d0_count_cap_ok, [35791394], 0x1);
  row(laws10_9d05d0_count_cap_ok, [35791395], 0x0);
  row(laws10_9d05d0_count_cap_ok, [4294967295], 0x0);
  row(laws10_9d05d0_idx_le_vecsize, [4,4], 0x1);
  row(laws10_9d05d0_idx_le_vecsize, [5,4], 0x0);
  row(laws10_9d05d0_slot_cap_lt_3, [2], 0x1);
  row(laws10_9d05d0_slot_cap_lt_3, [3], 0x0);
  row(laws10_9d05d0_clamp_0x14, [19], 0x13);
  row(laws10_9d05d0_clamp_0x14, [20], 0x14);
  row(laws10_9d05d0_clamp_0x14, [21], 0x14);
  row(laws10_9d05d0_clamp_0x14, [4294967295], 0x14);
  row(laws10_9d05d0_clamp_signed_0xa, [0], 0x0);
  row(laws10_9d05d0_clamp_signed_0xa, [10], 0xa);
  row(laws10_9d05d0_clamp_signed_0xa, [11], 0xa);
  row(laws10_9d05d0_clamp_signed_0xa, [4294967295], 0xffffffff);
  row(laws10_9d05d0_clamp_signed_0xa, [2147483648], 0x80000000);
  // S-group signed
  row(laws10_9d05d0_head_nonneg, [0], 0x1);
  row(laws10_9d05d0_head_nonneg, [2147483647], 0x1);
  row(laws10_9d05d0_head_nonneg, [2147483648], 0x0);
  row(laws10_9d05d0_head_nonneg, [4294967295], 0x0);
  row(laws10_9d05d0_head_lt_vecsize, [0,1], 0x1);
  row(laws10_9d05d0_head_lt_vecsize, [1,1], 0x0);
  row(laws10_9d05d0_head_lt_vecsize, [2147483648,1], 0x1);
  row(laws10_9d05d0_head_lt_vecsize, [1,2147483648], 0x0);
  row(laws10_9d05d0_signed_positive, [1], 0x1);
  row(laws10_9d05d0_signed_positive, [0], 0x0);
  row(laws10_9d05d0_signed_positive, [4294967295], 0x0);
  row(laws10_9d05d0_signed_positive, [2147483648], 0x0);
  row(laws10_9d05d0_signed_idx_lt_vecsize, [0,1], 0x1);
  row(laws10_9d05d0_signed_idx_lt_vecsize, [1,1], 0x0);
  row(laws10_9d05d0_signed_idx_lt_vecsize, [4294967295,0], 0x1);
  row(laws10_9d05d0_idx_masked_7fff_lt_vecsize, [32766,32767], 0x1);
  row(laws10_9d05d0_idx_masked_7fff_lt_vecsize, [32767,32767], 0x0);
  row(laws10_9d05d0_idx_masked_7fff_lt_vecsize, [32768,32767], 0x1);
  row(laws10_9d05d0_idx_masked_7fff_lt_vecsize, [65535,0], 0x0);
  row(laws10_9d05d0_value_neg_override, [4294967295], 0x1);
  row(laws10_9d05d0_value_neg_override, [2147483648], 0x1);
  row(laws10_9d05d0_value_neg_override, [0], 0x0);
  row(laws10_9d05d0_value_neg_override, [2147483647], 0x0);
  // L-group byte/result gates
  row(laws10_9d05d0_byte_nonzero, [0], 0x0);
  row(laws10_9d05d0_byte_nonzero, [1], 0x1);
  row(laws10_9d05d0_byte_nonzero, [256], 0x0);
  row(laws10_9d05d0_byte_nonzero, [255], 0x1);
  row(laws10_9d05d0_byte_eq_1, [0], 0x0);
  row(laws10_9d05d0_byte_eq_1, [1], 0x1);
  row(laws10_9d05d0_byte_eq_1, [257], 0x1);
  row(laws10_9d05d0_byte_eq_1, [2], 0x0);
  row(laws10_9d05d0_byte_ff_ok, [255], 0x0);
  row(laws10_9d05d0_byte_ff_ok, [511], 0x0);
  row(laws10_9d05d0_byte_ff_ok, [254], 0x1);
  row(laws10_9d05d0_byte_ff_ok, [0], 0x1);
  row(laws10_9d05d0_u32_count_needed, [0], 0x0);
  row(laws10_9d05d0_u32_count_needed, [1], 0x1);
  row(laws10_9d05d0_u32_count_needed, [4294967295], 0x1);
  row(laws10_9d05d0_ready_ok, [0], 0x1);
  row(laws10_9d05d0_ready_ok, [256], 0x1);
  row(laws10_9d05d0_ready_ok, [1], 0x0);
  row(laws10_9d05d0_v2fd10_result_ok, [0], 0x0);
  row(laws10_9d05d0_v2fd10_result_ok, [1], 0x1);
  row(laws10_9d05d0_v2fd10_result_ok, [256], 0x1);
  row(laws10_9d05d0_c7350_result_ok, [0], 0x0);
  row(laws10_9d05d0_c7350_result_ok, [1], 0x1);
  row(laws10_9d05d0_c7350_result_ok, [256], 0x0);
  row(laws10_9d05d0_cff40_result_ok, [0], 0x0);
  row(laws10_9d05d0_cff40_result_ok, [255], 0x1);
  row(laws10_9d05d0_cff40_result_ok, [256], 0x0);
  // B-group loop bounds
  row(laws10_9d05d0_byte_idx_lt_byte, [0,1], 0x1);
  row(laws10_9d05d0_byte_idx_lt_byte, [1,1], 0x0);
  row(laws10_9d05d0_byte_idx_lt_byte, [256,257], 0x1);
  row(laws10_9d05d0_byte_idx_lt_byte, [255,254], 0x0);
  row(laws10_9d05d0_byte_idx_lt_byte, [128,127], 0x0);
  row(laws10_9d05d0_idx_lt_2, [1], 0x1);
  row(laws10_9d05d0_idx_lt_2, [2], 0x0);
  row(laws10_9d05d0_idx_lt_2, [4294967295], 0x0);
  row(laws10_9d05d0_idx_lt_6, [5], 0x1);
  row(laws10_9d05d0_idx_lt_6, [6], 0x0);
  row(laws10_9d05d0_idx_lt_8, [7], 0x1);
  row(laws10_9d05d0_idx_lt_8, [8], 0x0);
  row(laws10_9d05d0_word_idx_lt_count, [65536,256], 0x1);
  row(laws10_9d05d0_word_idx_lt_count, [256,256], 0x0);
  row(laws10_9d05d0_word_idx_lt_count, [65535,65535], 0x0);
  row(laws10_9d05d0_uint_idx_lt_count, [0,1], 0x1);
  row(laws10_9d05d0_uint_idx_lt_count, [1,1], 0x0);
  row(laws10_9d05d0_uint_idx_lt_count, [4294967295,0], 0x0);
  row(laws10_9d05d0_uint_idx_lt_count, [0,4294967295], 0x1);
});
test("Wasm vs JS differential: io+8 dispatch + full-field reader gates (ABI v10)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rng = mulberry32(0x9d05d0);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  for (let i = 0; i < 240; i++) {
    const io8 = rnd();
    const idx = rnd();
    const cnt = rnd();
    const byte = rnd();
    const al = rnd();
    const res = rnd();
    const v = rnd();
    assert.equal(exp["9d05d0IoGate0x1e"](io8) >>> 0, M.gs9d05d0IoGate0x1E(io8), "9d05d0_io_gate_0x1e");
    assert.equal(exp["9d05d0IoGate0x1f"](io8) >>> 0, M.gs9d05d0IoGate0x1F(io8), "9d05d0_io_gate_0x1f");
    assert.equal(exp["9d05d0IoGate0x20"](io8) >>> 0, M.gs9d05d0IoGate0x20(io8), "9d05d0_io_gate_0x20");
    assert.equal(exp["9d05d0IoGate0x23"](io8) >>> 0, M.gs9d05d0IoGate0x23(io8), "9d05d0_io_gate_0x23");
    assert.equal(exp["9d05d0IoGate0x27"](io8) >>> 0, M.gs9d05d0IoGate0x27(io8), "9d05d0_io_gate_0x27");
    assert.equal(exp["9d05d0IoGate0x28"](io8) >>> 0, M.gs9d05d0IoGate0x28(io8), "9d05d0_io_gate_0x28");
    assert.equal(exp["9d05d0IoGate0x29"](io8) >>> 0, M.gs9d05d0IoGate0x29(io8), "9d05d0_io_gate_0x29");
    assert.equal(exp["9d05d0IoGate0x2d"](io8) >>> 0, M.gs9d05d0IoGate0x2D(io8), "9d05d0_io_gate_0x2d");
    assert.equal(exp["9d05d0IoGate0x2f"](io8) >>> 0, M.gs9d05d0IoGate0x2F(io8), "9d05d0_io_gate_0x2f");
    assert.equal(exp["9d05d0IoGate0x30"](io8) >>> 0, M.gs9d05d0IoGate0x30(io8), "9d05d0_io_gate_0x30");
    assert.equal(exp["9d05d0IoGate0x38"](io8) >>> 0, M.gs9d05d0IoGate0x38(io8), "9d05d0_io_gate_0x38");
    assert.equal(exp["9d05d0IoGate0x39"](io8) >>> 0, M.gs9d05d0IoGate0x39(io8), "9d05d0_io_gate_0x39");
    assert.equal(exp["9d05d0IoGate0x3a"](io8) >>> 0, M.gs9d05d0IoGate0x3A(io8), "9d05d0_io_gate_0x3a");
    assert.equal(exp["9d05d0IoGate0x3b"](io8) >>> 0, M.gs9d05d0IoGate0x3B(io8), "9d05d0_io_gate_0x3b");
    assert.equal(exp["9d05d0IoGate0x3e"](io8) >>> 0, M.gs9d05d0IoGate0x3E(io8), "9d05d0_io_gate_0x3e");
    assert.equal(exp["9d05d0IoGate0x40"](io8) >>> 0, M.gs9d05d0IoGate0x40(io8), "9d05d0_io_gate_0x40");
    assert.equal(exp["9d05d0IoGate0x41"](io8) >>> 0, M.gs9d05d0IoGate0x41(io8), "9d05d0_io_gate_0x41");
    assert.equal(exp["9d05d0IoGate0x43"](io8) >>> 0, M.gs9d05d0IoGate0x43(io8), "9d05d0_io_gate_0x43");
    assert.equal(exp["9d05d0IoGate0x45"](io8) >>> 0, M.gs9d05d0IoGate0x45(io8), "9d05d0_io_gate_0x45");
    assert.equal(exp["9d05d0IoGate0x4c"](io8) >>> 0, M.gs9d05d0IoGate0x4C(io8), "9d05d0_io_gate_0x4c");
    assert.equal(exp["9d05d0IoGate0x4d"](io8) >>> 0, M.gs9d05d0IoGate0x4D(io8), "9d05d0_io_gate_0x4d");
    assert.equal(exp["9d05d0IoGate0x4f"](io8) >>> 0, M.gs9d05d0IoGate0x4F(io8), "9d05d0_io_gate_0x4f");
    assert.equal(exp["9d05d0IoGate0x50"](io8) >>> 0, M.gs9d05d0IoGate0x50(io8), "9d05d0_io_gate_0x50");
    assert.equal(exp["9d05d0IoGate0x51"](io8) >>> 0, M.gs9d05d0IoGate0x51(io8), "9d05d0_io_gate_0x51");
    assert.equal(exp["9d05d0IoGate0x52"](io8) >>> 0, M.gs9d05d0IoGate0x52(io8), "9d05d0_io_gate_0x52");
    assert.equal(exp["9d05d0IoGate0x55"](io8) >>> 0, M.gs9d05d0IoGate0x55(io8), "9d05d0_io_gate_0x55");
    assert.equal(exp["9d05d0IoGate0x58"](io8) >>> 0, M.gs9d05d0IoGate0x58(io8), "9d05d0_io_gate_0x58");
    assert.equal(exp["9d05d0IoGate0x5a"](io8) >>> 0, M.gs9d05d0IoGate0x5A(io8), "9d05d0_io_gate_0x5a");
    assert.equal(exp["9d05d0IoGate0x5b"](io8) >>> 0, M.gs9d05d0IoGate0x5B(io8), "9d05d0_io_gate_0x5b");
    assert.equal(exp["9d05d0IoGate0x5c"](io8) >>> 0, M.gs9d05d0IoGate0x5C(io8), "9d05d0_io_gate_0x5c");
    assert.equal(exp["9d05d0IoGate0x5d"](io8) >>> 0, M.gs9d05d0IoGate0x5D(io8), "9d05d0_io_gate_0x5d");
    assert.equal(exp["9d05d0IoGate0x5e"](io8) >>> 0, M.gs9d05d0IoGate0x5E(io8), "9d05d0_io_gate_0x5e");
    assert.equal(exp["9d05d0IoGate0x5f"](io8) >>> 0, M.gs9d05d0IoGate0x5F(io8), "9d05d0_io_gate_0x5f");
    assert.equal(exp["9d05d0IoGate0x60"](io8) >>> 0, M.gs9d05d0IoGate0x60(io8), "9d05d0_io_gate_0x60");
    assert.equal(exp["9d05d0IoGate0x61"](io8) >>> 0, M.gs9d05d0IoGate0x61(io8), "9d05d0_io_gate_0x61");
    assert.equal(exp["9d05d0IoGate0x62"](io8) >>> 0, M.gs9d05d0IoGate0x62(io8), "9d05d0_io_gate_0x62");
    assert.equal(exp["9d05d0IoGate0x63"](io8) >>> 0, M.gs9d05d0IoGate0x63(io8), "9d05d0_io_gate_0x63");
    assert.equal(exp["9d05d0IoGate0x64"](io8) >>> 0, M.gs9d05d0IoGate0x64(io8), "9d05d0_io_gate_0x64");
    assert.equal(exp["9d05d0IoGate0x65"](io8) >>> 0, M.gs9d05d0IoGate0x65(io8), "9d05d0_io_gate_0x65");
    assert.equal(exp["9d05d0IoGate0x67"](io8) >>> 0, M.gs9d05d0IoGate0x67(io8), "9d05d0_io_gate_0x67");
    assert.equal(exp["9d05d0IoGate0x6a"](io8) >>> 0, M.gs9d05d0IoGate0x6A(io8), "9d05d0_io_gate_0x6a");
    assert.equal(exp["9d05d0IoGate0x6c"](io8) >>> 0, M.gs9d05d0IoGate0x6C(io8), "9d05d0_io_gate_0x6c");
    assert.equal(exp["9d05d0IoGate0x6e"](io8) >>> 0, M.gs9d05d0IoGate0x6E(io8), "9d05d0_io_gate_0x6e");
    assert.equal(exp["9d05d0IoGate0x6f"](io8) >>> 0, M.gs9d05d0IoGate0x6F(io8), "9d05d0_io_gate_0x6f");
    assert.equal(exp["9d05d0IoGate0x72"](io8) >>> 0, M.gs9d05d0IoGate0x72(io8), "9d05d0_io_gate_0x72");
    assert.equal(exp["9d05d0IoGate0x73"](io8) >>> 0, M.gs9d05d0IoGate0x73(io8), "9d05d0_io_gate_0x73");
    assert.equal(exp["9d05d0IoGate0x74"](io8) >>> 0, M.gs9d05d0IoGate0x74(io8), "9d05d0_io_gate_0x74");
    assert.equal(exp["9d05d0IoGate0x75"](io8) >>> 0, M.gs9d05d0IoGate0x75(io8), "9d05d0_io_gate_0x75");
    assert.equal(exp["9d05d0IoGate0x76"](io8) >>> 0, M.gs9d05d0IoGate0x76(io8), "9d05d0_io_gate_0x76");
    assert.equal(exp["9d05d0IoGate0x78"](io8) >>> 0, M.gs9d05d0IoGate0x78(io8), "9d05d0_io_gate_0x78");
    assert.equal(exp["9d05d0IoGate0x79"](io8) >>> 0, M.gs9d05d0IoGate0x79(io8), "9d05d0_io_gate_0x79");
    assert.equal(exp["9d05d0IoGate0x7e"](io8) >>> 0, M.gs9d05d0IoGate0x7E(io8), "9d05d0_io_gate_0x7e");
    assert.equal(exp["9d05d0IoGate0x7f"](io8) >>> 0, M.gs9d05d0IoGate0x7F(io8), "9d05d0_io_gate_0x7f");
    assert.equal(exp["9d05d0IoGate0x80"](io8) >>> 0, M.gs9d05d0IoGate0x80(io8), "9d05d0_io_gate_0x80");
    assert.equal(exp["9d05d0IoGate0x81"](io8) >>> 0, M.gs9d05d0IoGate0x81(io8), "9d05d0_io_gate_0x81");
    assert.equal(exp["9d05d0IoGate0x82"](io8) >>> 0, M.gs9d05d0IoGate0x82(io8), "9d05d0_io_gate_0x82");
    assert.equal(exp["9d05d0IoGate0x83"](io8) >>> 0, M.gs9d05d0IoGate0x83(io8), "9d05d0_io_gate_0x83");
    assert.equal(exp["9d05d0IoGate0x8a"](io8) >>> 0, M.gs9d05d0IoGate0x8A(io8), "9d05d0_io_gate_0x8a");
    assert.equal(exp["9d05d0IoGate0x8b"](io8) >>> 0, M.gs9d05d0IoGate0x8B(io8), "9d05d0_io_gate_0x8b");
    assert.equal(exp["9d05d0IoGate0x8c"](io8) >>> 0, M.gs9d05d0IoGate0x8C(io8), "9d05d0_io_gate_0x8c");
    assert.equal(exp["9d05d0IoGate0x8f"](io8) >>> 0, M.gs9d05d0IoGate0x8F(io8), "9d05d0_io_gate_0x8f");
    assert.equal(exp["9d05d0IoGate0x90"](io8) >>> 0, M.gs9d05d0IoGate0x90(io8), "9d05d0_io_gate_0x90");
    assert.equal(exp["9d05d0IoGate0x97"](io8) >>> 0, M.gs9d05d0IoGate0x97(io8), "9d05d0_io_gate_0x97");
    assert.equal(exp["9d05d0IoGate0x99"](io8) >>> 0, M.gs9d05d0IoGate0x99(io8), "9d05d0_io_gate_0x99");
    assert.equal(exp["9d05d0IoGate0x9c"](io8) >>> 0, M.gs9d05d0IoGate0x9C(io8), "9d05d0_io_gate_0x9c");
    assert.equal(exp["9d05d0IoGate0x9d"](io8) >>> 0, M.gs9d05d0IoGate0x9D(io8), "9d05d0_io_gate_0x9d");
    assert.equal(exp["9d05d0IoGate0xa0"](io8) >>> 0, M.gs9d05d0IoGate0xA0(io8), "9d05d0_io_gate_0xa0");
    assert.equal(exp["9d05d0IoGate0xa4"](io8) >>> 0, M.gs9d05d0IoGate0xA4(io8), "9d05d0_io_gate_0xa4");
    assert.equal(exp["9d05d0IoGate0xa5"](io8) >>> 0, M.gs9d05d0IoGate0xA5(io8), "9d05d0_io_gate_0xa5");
    assert.equal(exp["9d05d0IoGate0xa6"](io8) >>> 0, M.gs9d05d0IoGate0xA6(io8), "9d05d0_io_gate_0xa6");
    assert.equal(exp["9d05d0IoGate0xa8"](io8) >>> 0, M.gs9d05d0IoGate0xA8(io8), "9d05d0_io_gate_0xa8");
    assert.equal(exp["9d05d0IoGate0xa9"](io8) >>> 0, M.gs9d05d0IoGate0xA9(io8), "9d05d0_io_gate_0xa9");
    assert.equal(exp["9d05d0IoGate0x23Above"](io8) >>> 0, M.gs9d05d0IoGate0x23Above(io8), "9d05d0_io_gate_0x23_above");
    assert.equal(exp["9d05d0IoGate0x24Above"](io8) >>> 0, M.gs9d05d0IoGate0x24Above(io8), "9d05d0_io_gate_0x24_above");
    assert.equal(exp["9ce720DispatchCount"](io8) >>> 0, M.gs9ce720DispatchCount(io8), "9ce720_dispatch_count");
    assert.equal(exp["9ce720CountFits"](cnt, v) >>> 0, M.gs9ce720CountFits(cnt, v), "9ce720_count_fits");
    assert.equal(exp["9ce720IoGate0x4a"](io8) >>> 0, M.gs9ce720IoGate0x4a(io8), "9ce720_io_gate_0x4a");
    assert.equal(exp["9ce720IoGate0x37"](io8) >>> 0, M.gs9ce720IoGate0x37(io8), "9ce720_io_gate_0x37");
    assert.equal(exp["9ce720DefaultCount0x1ff0x2dd"](io8) >>> 0, M.gs9ce720DefaultCount0x1ff0x2dd(io8), "9ce720_default_count_0x1ff_0x2dd");
    assert.equal(exp["9ce720DefaultCount0x780xbe"](io8) >>> 0, M.gs9ce720DefaultCount0x78_0xbe(io8), "9ce720_default_count_0x78_0xbe");
    assert.equal(exp["9ce720Count0xe0xf"](io8) >>> 0, M.gs9ce720Count0xe_0xf(io8), "9ce720_count_0xe_0xf");
    assert.equal(exp["9ce720IoGate0x4e"](io8) >>> 0, M.gs9ce720IoGate0x4e(io8), "9ce720_io_gate_0x4e");
    assert.equal(exp["9d05d0LaneCount14"](io8) >>> 0, M.gs9d05d0LaneCount1_4(io8), "9d05d0_lane_count_1_4");
    assert.equal(exp["9d05d0LaneCount24"](io8) >>> 0, M.gs9d05d0LaneCount2_4(io8), "9d05d0_lane_count_2_4");
    assert.equal(exp["9d05d0Count0xf0x10"](io8) >>> 0, M.gs9d05d0Count0xf0x10(io8), "9d05d0_count_0xf_0x10");
    assert.equal(exp["9d05d0FormatInRange"](io8) >>> 0, M.gs9d05d0FormatInRange(io8), "9d05d0_format_in_range");
    assert.equal(exp["9d05d0CountCapOk"](cnt) >>> 0, M.gs9d05d0CountCapOk(cnt), "9d05d0_count_cap_ok");
    assert.equal(exp["9d05d0IdxLeVecsize"](idx, v) >>> 0, M.gs9d05d0IdxLeVecsize(idx, v), "9d05d0_idx_le_vecsize");
    assert.equal(exp["9d05d0SlotCapLt3"](cnt) >>> 0, M.gs9d05d0SlotCapLt3(cnt), "9d05d0_slot_cap_lt_3");
    assert.equal(exp["9d05d0Clamp0x14"](cnt) >>> 0, M.gs9d05d0Clamp0x14(cnt), "9d05d0_clamp_0x14");
    assert.equal(exp["9d05d0ClampSigned0xa"](cnt) >>> 0, M.gs9d05d0ClampSigned0xa(cnt), "9d05d0_clamp_signed_0xa");
    assert.equal(exp["9d05d0HeadNonneg"](v) >>> 0, M.gs9d05d0HeadNonneg(v), "9d05d0_head_nonneg");
    assert.equal(exp["9d05d0HeadLtVecsize"](cnt, v) >>> 0, M.gs9d05d0HeadLtVecsize(cnt, v), "9d05d0_head_lt_vecsize");
    assert.equal(exp["9d05d0SignedPositive"](cnt) >>> 0, M.gs9d05d0SignedPositive(cnt), "9d05d0_signed_positive");
    assert.equal(exp["9d05d0SignedIdxLtVecsize"](idx, v) >>> 0, M.gs9d05d0SignedIdxLtVecsize(idx, v), "9d05d0_signed_idx_lt_vecsize");
    assert.equal(exp["9d05d0IdxMasked7fffLtVecsize"](idx, v) >>> 0, M.gs9d05d0IdxMasked7fffLtVecsize(idx, v), "9d05d0_idx_masked_7fff_lt_vecsize");
    assert.equal(exp["9d05d0ValueNegOverride"](v) >>> 0, M.gs9d05d0ValueNegOverride(v), "9d05d0_value_neg_override");
    assert.equal(exp["9d05d0ByteNonzero"](byte) >>> 0, M.gs9d05d0ByteNonzero(byte), "9d05d0_byte_nonzero");
    assert.equal(exp["9d05d0ByteEq1"](byte) >>> 0, M.gs9d05d0ByteEq1(byte), "9d05d0_byte_eq_1");
    assert.equal(exp["9d05d0ByteFfOk"](byte) >>> 0, M.gs9d05d0ByteFfOk(byte), "9d05d0_byte_ff_ok");
    assert.equal(exp["9d05d0U32CountNeeded"](cnt) >>> 0, M.gs9d05d0U32CountNeeded(cnt), "9d05d0_u32_count_needed");
    assert.equal(exp["9d05d0ReadyOk"](al) >>> 0, M.gs9d05d0ReadyOk(al), "9d05d0_ready_ok");
    assert.equal(exp["9d05d0V2fd10ResultOk"](res) >>> 0, M.gs9d05d0V2fd10ResultOk(res), "9d05d0_v2fd10_result_ok");
    assert.equal(exp["9d05d0C7350ResultOk"](al) >>> 0, M.gs9d05d0C7350ResultOk(al), "9d05d0_c7350_result_ok");
    assert.equal(exp["9d05d0Cff40ResultOk"](al) >>> 0, M.gs9d05d0Cff40ResultOk(al), "9d05d0_cff40_result_ok");
    assert.equal(exp["9d05d0ByteIdxLtByte"](idx, cnt) >>> 0, M.gs9d05d0ByteIdxLtByte(idx, cnt), "9d05d0_byte_idx_lt_byte");
    assert.equal(exp["9d05d0IdxLt2"](idx) >>> 0, M.gs9d05d0IdxLt2(idx), "9d05d0_idx_lt_2");
    assert.equal(exp["9d05d0IdxLt6"](idx) >>> 0, M.gs9d05d0IdxLt6(idx), "9d05d0_idx_lt_6");
    assert.equal(exp["9d05d0IdxLt8"](idx) >>> 0, M.gs9d05d0IdxLt8(idx), "9d05d0_idx_lt_8");
    assert.equal(exp["9d05d0WordIdxLtCount"](idx, cnt) >>> 0, M.gs9d05d0WordIdxLtCount(idx, cnt), "9d05d0_word_idx_lt_count");
    assert.equal(exp["9d05d0UintIdxLtCount"](idx, cnt) >>> 0, M.gs9d05d0UintIdxLtCount(idx, cnt), "9d05d0_uint_idx_lt_count");
  }
});
test("v10 body-C + reader-giant guards are not vacuous (self-check)", () => {
  assert.equal(MODEL.gs9ce720DispatchCount(0x56), 0x1a);
  assert.equal(MODEL.gs9ce720DispatchCount(0x57), 0x1b);
  assert.equal(MODEL.gs9ce720DispatchCount(0x69), 0x1c);
  assert.equal(MODEL.gs9ce720DispatchCount(0x70), 0x1d);
  assert.equal(MODEL.gs9ce720DispatchCount(0x7a), 0x1f);
  assert.equal(MODEL.gs9ce720DispatchCount(0xffffffff), 0x1f, "unsigned top band");
  assert.equal(MODEL.gs9ce720CountFits(0x10, 0x10), 1, "<= not <");
  assert.equal(MODEL.gs9ce720CountFits(0x10, 0x9), 0);
  assert.equal(MODEL.gs9ce720DefaultCount0x1ff0x2dd(0x34), 0x1ff);
  assert.equal(MODEL.gs9ce720DefaultCount0x1ff0x2dd(0x35), 0x2dd, "0x35 -> 0x2dd");
  assert.equal(MODEL.gs9ce720DefaultCount0x78_0xbe(0x35), 0xbe);
  assert.equal(MODEL.gs9ce720Count0xe_0xf(0x77), 0xf, "0x77 -> 0xf");
  assert.equal(MODEL.gs9ce720IoGate0x37(0x36), 0);
  assert.equal(MODEL.gs9ce720IoGate0x37(0x37), 1);
  assert.notEqual(MODEL.gs9d05d0IoGate0x1E(0x1d), MODEL.gs9d05d0IoGate0x1E(0x1e));
  assert.notEqual(MODEL.gs9d05d0IoGate0x67(0x66), MODEL.gs9d05d0IoGate0x67(0x67), "READER-ROW pre-gate");
  assert.notEqual(MODEL.gs9d05d0IoGate0xA9(0xa8), MODEL.gs9d05d0IoGate0xA9(0xa9));
  assert.equal(MODEL.gs9d05d0IoGate0x23Above(0x23), 0, "strict ABOVE: 0x23 NOT > 0x23");
  assert.equal(MODEL.gs9d05d0IoGate0x23Above(0x24), 1, "0x24 > 0x23 -> arm");
  assert.equal(MODEL.gs9d05d0IoGate0x24Above(0x24), 0, "strict ABOVE: 0x24 NOT > 0x24");
  assert.equal(MODEL.gs9d05d0IoGate0x24Above(0x25), 1, "0x25 > 0x24 -> arm");
  assert.equal(MODEL.gs9d05d0LaneCount1_4(0x3b), 1);
  assert.equal(MODEL.gs9d05d0LaneCount1_4(0x3c), 2);
  assert.equal(MODEL.gs9d05d0LaneCount1_4(0x66), 3);
  assert.equal(MODEL.gs9d05d0LaneCount1_4(0x71), 4);
  assert.equal(MODEL.gs9d05d0LaneCount2_4(0x65), 2);
  assert.equal(MODEL.gs9d05d0LaneCount2_4(0x66), 3);
  assert.equal(MODEL.gs9d05d0Count0xf0x10(0xa6), 0xf);
  assert.equal(MODEL.gs9d05d0Count0xf0x10(0xa7), 0x10, "0xa7 -> 0x10");
  assert.equal(MODEL.gs9d05d0FormatInRange(0x2f), 1);
  assert.equal(MODEL.gs9d05d0FormatInRange(0x90), 1);
  assert.equal(MODEL.gs9d05d0FormatInRange(0x2e), 0, "below 0x2f");
  assert.equal(MODEL.gs9d05d0FormatInRange(0x91), 0);
  assert.equal(MODEL.gs9d05d0CountCapOk(0x2222222), 1);
  assert.equal(MODEL.gs9d05d0CountCapOk(0x2222223), 0);
  assert.equal(MODEL.gs9d05d0IdxLeVecsize(4, 4), 1, "<= not <");
  assert.equal(MODEL.gs9d05d0SlotCapLt3(3), 0, "< 3 not <=");
  assert.equal(MODEL.gs9d05d0Clamp0x14(0x15), 0x14);
  assert.equal(MODEL.gs9d05d0Clamp0x14(0x13), 0x13);
  assert.equal(MODEL.gs9d05d0ClampSigned0xa(0xffffffff), 0xffffffff, "SIGNED -1 <= 0xa");
  assert.equal(MODEL.gs9d05d0ClampSigned0xa(0xb), 0xa);
  assert.equal(MODEL.gs9d05d0HeadNonneg(0x80000000), 0, "SIGNED");
  assert.equal(MODEL.gs9d05d0HeadNonneg(0), 1);
  assert.equal(MODEL.gs9d05d0HeadLtVecsize(0x80000000, 1), 1, "SIGNED INT32_MIN < 1");
  assert.equal(MODEL.gs9d05d0HeadLtVecsize(1, 0x80000000), 0, "1 < INT32_MIN FALSE");
  assert.equal(MODEL.gs9d05d0SignedPositive(0), 0);
  assert.equal(MODEL.gs9d05d0SignedPositive(0xffffffff), 0, "-1 not > 0");
  assert.equal(MODEL.gs9d05d0SignedIdxLtVecsize(0xffffffff, 0), 1, "-1 < 0");
  assert.equal(MODEL.gs9d05d0IdxMasked7fffLtVecsize(0x8000, 0x7fff), 1, "masked 0 < 0x7fff -> pass");
  assert.equal(MODEL.gs9d05d0IdxMasked7fffLtVecsize(0x7fff, 0x10000), 1);
  assert.equal(MODEL.gs9d05d0ValueNegOverride(0xffffffff), 1);
  assert.equal(MODEL.gs9d05d0ValueNegOverride(0), 0);
  assert.equal(MODEL.gs9d05d0ByteNonzero(0x100), 0, "0x100 -> byte 0");
  assert.equal(MODEL.gs9d05d0ByteNonzero(0xff), 1);
  assert.equal(MODEL.gs9d05d0ByteEq1(0x101), 1, "masked 1");
  assert.equal(MODEL.gs9d05d0ByteFfOk(0x1ff), 0, "masked 0xff");
  assert.equal(MODEL.gs9d05d0U32CountNeeded(0), 0);
  assert.equal(MODEL.gs9d05d0ReadyOk(0x100), 1, "0x100 -> byte 0 -> ready");
  assert.equal(MODEL.gs9d05d0ReadyOk(1), 0);
  assert.equal(MODEL.gs9d05d0V2fd10ResultOk(0x100), 1, "FULL-dword nonzero");
  assert.equal(MODEL.gs9d05d0C7350ResultOk(0x100), 0, "byte 0");
  assert.equal(MODEL.gs9d05d0Cff40ResultOk(0xff), 1);
  assert.equal(MODEL.gs9d05d0ByteIdxLtByte(0x100, 0x101), 1, "masked 0 < 1");
  assert.equal(MODEL.gs9d05d0ByteIdxLtByte(0xff, 0xfe), 0);
  assert.equal(MODEL.gs9d05d0IdxLt2(2), 0);
  assert.equal(MODEL.gs9d05d0IdxLt6(6), 0);
  assert.equal(MODEL.gs9d05d0IdxLt8(8), 0);
  assert.equal(MODEL.gs9d05d0WordIdxLtCount(0x10000, 0x100), 1, "word-masked");
  assert.equal(MODEL.gs9d05d0UintIdxLtCount(0xffffffff, 0), 0);
  assert.equal(MODEL.gs9d05d0UintIdxLtCount(0, 0xffffffff), 1);
});
test("ABI v10 accessors: body-C + reader-giant wasm accessor census", () => {
  const exp = loadExports();
  const rows = [
    ["9ce720Va", MODEL.GS9CE720_VA],
    ["9ce720EndVa", MODEL.GS9CE720_END_VA],
    ["9ce720BodyBytes", MODEL.GS9CE720_BODY_BYTES],
    ["9ce720NextVa", MODEL.GS9CE720_NEXT_VA],
    ["9ce720IoFormatOff", MODEL.GS9CE720_IO_FORMAT_OFF],
    ["9ce720MgrGlobalDat", MODEL.GS9CE720_MGR_GLOBAL_DAT],
    ["9ce720MgrVecAStartOff", MODEL.GS9CE720_MGR_VEC_A_START_OFF],
    ["9ce720MgrVecAEndOff", MODEL.GS9CE720_MGR_VEC_A_END_OFF],
    ["9ce720MgrVecBStartOff", MODEL.GS9CE720_MGR_VEC_B_START_OFF],
    ["9ce720MgrVecBEndOff", MODEL.GS9CE720_MGR_VEC_B_END_OFF],
    ["9d05d0Va", MODEL.GS9D05D0_VA],
    ["9d05d0EndVa", MODEL.GS9D05D0_END_VA],
    ["9d05d0BodyBytes", MODEL.GS9D05D0_BODY_BYTES],
    ["9d05d0NextVa", MODEL.GS9D05D0_NEXT_VA],
    ["9d05d0SehHandlerDat", MODEL.GS9D05D0_SEH_HANDLER_DAT],
    ["9d05d0GsCookieDat", MODEL.GS9D05D0_GS_COOKIE_DAT],
    ["9d05d0IoFormatOff", MODEL.GS9D05D0_IO_FORMAT_OFF],
    ["9d05d0ReaderRowCallVa", MODEL.GS9D05D0_READER_ROW_CALL_VA],
    ["9d05d0MgrGlobalDat", MODEL.GS9D05D0_MGR_GLOBAL_DAT],
    ["9d05d0MgrVec2a404", MODEL.GS9D05D0_MGR_VEC_2A404],
    ["9d05d0MgrVec2a408", MODEL.GS9D05D0_MGR_VEC_2A408],
    ["9d05d0MgrVec2a410", MODEL.GS9D05D0_MGR_VEC_2A410],
    ["9d05d0MgrVec2a414", MODEL.GS9D05D0_MGR_VEC_2A414],
    ["9d05d0CountCap", MODEL.GS9D05D0_COUNT_CAP],
    ["9d05d0Clamp0x14Const", MODEL.GS9D05D0_CLAMP0X14_CONST],
    ["9d05d0Clamp0xaConst", MODEL.GS9D05D0_CLAMP0XA_CONST],
    ["9d05d0RangeLo", MODEL.GS9D05D0_RANGE_LO],
    ["9d05d0RangeHi", MODEL.GS9D05D0_RANGE_HI],
    ["9d05d0Stride148", MODEL.GS9D05D0_STRIDE_148],
    ["9d05d0Mask7fff", MODEL.GS9D05D0_MASK_7FFF],
    ["9ce720DispatchCountVa", MODEL.gs9ce720DispatchCountVa()],
    ["9ce720CountFitsVa", MODEL.gs9ce720CountFitsVa()],
    ["9ce720IoGate0x4aVa", MODEL.gs9ce720IoGate0x4aVa()],
    ["9ce720IoGate0x37Va", MODEL.gs9ce720IoGate0x37Va()],
    ["9ce720DefaultCount0x1ff0x2ddVa", MODEL.gs9ce720DefaultCount0x1ff0x2ddVa()],
    ["9ce720DefaultCount0x780xbeVa", MODEL.gs9ce720DefaultCount0x78_0xbeVa()],
    ["9ce720Count0xe0xfVa", MODEL.gs9ce720Count0xe_0xfVa()],
    ["9ce720IoGate0x4eVa", MODEL.gs9ce720IoGate0x4eVa()],
    ["9d05d0IoGate0x1eVa", MODEL.gs9d05d0IoGate0x1EVa()],
    ["9d05d0IoGate0x1fVa", MODEL.gs9d05d0IoGate0x1FVa()],
    ["9d05d0IoGate0x20Va", MODEL.gs9d05d0IoGate0x20Va()],
    ["9d05d0IoGate0x23Va", MODEL.gs9d05d0IoGate0x23Va()],
    ["9d05d0IoGate0x27Va", MODEL.gs9d05d0IoGate0x27Va()],
    ["9d05d0IoGate0x28Va", MODEL.gs9d05d0IoGate0x28Va()],
    ["9d05d0IoGate0x29Va", MODEL.gs9d05d0IoGate0x29Va()],
    ["9d05d0IoGate0x2dVa", MODEL.gs9d05d0IoGate0x2DVa()],
    ["9d05d0IoGate0x2fVa", MODEL.gs9d05d0IoGate0x2FVa()],
    ["9d05d0IoGate0x30Va", MODEL.gs9d05d0IoGate0x30Va()],
    ["9d05d0IoGate0x38Va", MODEL.gs9d05d0IoGate0x38Va()],
    ["9d05d0IoGate0x39Va", MODEL.gs9d05d0IoGate0x39Va()],
    ["9d05d0IoGate0x3aVa", MODEL.gs9d05d0IoGate0x3AVa()],
    ["9d05d0IoGate0x3bVa", MODEL.gs9d05d0IoGate0x3BVa()],
    ["9d05d0IoGate0x3eVa", MODEL.gs9d05d0IoGate0x3EVa()],
    ["9d05d0IoGate0x40Va", MODEL.gs9d05d0IoGate0x40Va()],
    ["9d05d0IoGate0x41Va", MODEL.gs9d05d0IoGate0x41Va()],
    ["9d05d0IoGate0x43Va", MODEL.gs9d05d0IoGate0x43Va()],
    ["9d05d0IoGate0x45Va", MODEL.gs9d05d0IoGate0x45Va()],
    ["9d05d0IoGate0x4cVa", MODEL.gs9d05d0IoGate0x4CVa()],
    ["9d05d0IoGate0x4dVa", MODEL.gs9d05d0IoGate0x4DVa()],
    ["9d05d0IoGate0x4fVa", MODEL.gs9d05d0IoGate0x4FVa()],
    ["9d05d0IoGate0x50Va", MODEL.gs9d05d0IoGate0x50Va()],
    ["9d05d0IoGate0x51Va", MODEL.gs9d05d0IoGate0x51Va()],
    ["9d05d0IoGate0x52Va", MODEL.gs9d05d0IoGate0x52Va()],
    ["9d05d0IoGate0x55Va", MODEL.gs9d05d0IoGate0x55Va()],
    ["9d05d0IoGate0x58Va", MODEL.gs9d05d0IoGate0x58Va()],
    ["9d05d0IoGate0x5aVa", MODEL.gs9d05d0IoGate0x5AVa()],
    ["9d05d0IoGate0x5bVa", MODEL.gs9d05d0IoGate0x5BVa()],
    ["9d05d0IoGate0x5cVa", MODEL.gs9d05d0IoGate0x5CVa()],
    ["9d05d0IoGate0x5dVa", MODEL.gs9d05d0IoGate0x5DVa()],
    ["9d05d0IoGate0x5eVa", MODEL.gs9d05d0IoGate0x5EVa()],
    ["9d05d0IoGate0x5fVa", MODEL.gs9d05d0IoGate0x5FVa()],
    ["9d05d0IoGate0x60Va", MODEL.gs9d05d0IoGate0x60Va()],
    ["9d05d0IoGate0x61Va", MODEL.gs9d05d0IoGate0x61Va()],
    ["9d05d0IoGate0x62Va", MODEL.gs9d05d0IoGate0x62Va()],
    ["9d05d0IoGate0x63Va", MODEL.gs9d05d0IoGate0x63Va()],
    ["9d05d0IoGate0x64Va", MODEL.gs9d05d0IoGate0x64Va()],
    ["9d05d0IoGate0x65Va", MODEL.gs9d05d0IoGate0x65Va()],
    ["9d05d0IoGate0x67Va", MODEL.gs9d05d0IoGate0x67Va()],
    ["9d05d0IoGate0x6aVa", MODEL.gs9d05d0IoGate0x6AVa()],
    ["9d05d0IoGate0x6cVa", MODEL.gs9d05d0IoGate0x6CVa()],
    ["9d05d0IoGate0x6eVa", MODEL.gs9d05d0IoGate0x6EVa()],
    ["9d05d0IoGate0x6fVa", MODEL.gs9d05d0IoGate0x6FVa()],
    ["9d05d0IoGate0x72Va", MODEL.gs9d05d0IoGate0x72Va()],
    ["9d05d0IoGate0x73Va", MODEL.gs9d05d0IoGate0x73Va()],
    ["9d05d0IoGate0x74Va", MODEL.gs9d05d0IoGate0x74Va()],
    ["9d05d0IoGate0x75Va", MODEL.gs9d05d0IoGate0x75Va()],
    ["9d05d0IoGate0x76Va", MODEL.gs9d05d0IoGate0x76Va()],
    ["9d05d0IoGate0x78Va", MODEL.gs9d05d0IoGate0x78Va()],
    ["9d05d0IoGate0x79Va", MODEL.gs9d05d0IoGate0x79Va()],
    ["9d05d0IoGate0x7eVa", MODEL.gs9d05d0IoGate0x7EVa()],
    ["9d05d0IoGate0x7fVa", MODEL.gs9d05d0IoGate0x7FVa()],
    ["9d05d0IoGate0x80Va", MODEL.gs9d05d0IoGate0x80Va()],
    ["9d05d0IoGate0x81Va", MODEL.gs9d05d0IoGate0x81Va()],
    ["9d05d0IoGate0x82Va", MODEL.gs9d05d0IoGate0x82Va()],
    ["9d05d0IoGate0x83Va", MODEL.gs9d05d0IoGate0x83Va()],
    ["9d05d0IoGate0x8aVa", MODEL.gs9d05d0IoGate0x8AVa()],
    ["9d05d0IoGate0x8bVa", MODEL.gs9d05d0IoGate0x8BVa()],
    ["9d05d0IoGate0x8cVa", MODEL.gs9d05d0IoGate0x8CVa()],
    ["9d05d0IoGate0x8fVa", MODEL.gs9d05d0IoGate0x8FVa()],
    ["9d05d0IoGate0x90Va", MODEL.gs9d05d0IoGate0x90Va()],
    ["9d05d0IoGate0x97Va", MODEL.gs9d05d0IoGate0x97Va()],
    ["9d05d0IoGate0x99Va", MODEL.gs9d05d0IoGate0x99Va()],
    ["9d05d0IoGate0x9cVa", MODEL.gs9d05d0IoGate0x9CVa()],
    ["9d05d0IoGate0x9dVa", MODEL.gs9d05d0IoGate0x9DVa()],
    ["9d05d0IoGate0xa0Va", MODEL.gs9d05d0IoGate0xA0Va()],
    ["9d05d0IoGate0xa4Va", MODEL.gs9d05d0IoGate0xA4Va()],
    ["9d05d0IoGate0xa5Va", MODEL.gs9d05d0IoGate0xA5Va()],
    ["9d05d0IoGate0xa6Va", MODEL.gs9d05d0IoGate0xA6Va()],
    ["9d05d0IoGate0xa8Va", MODEL.gs9d05d0IoGate0xA8Va()],
    ["9d05d0IoGate0xa9Va", MODEL.gs9d05d0IoGate0xA9Va()],
    ["9d05d0IoGate0x23AboveVa", MODEL.gs9d05d0IoGate0x23AboveVa()],
    ["9d05d0IoGate0x24AboveVa", MODEL.gs9d05d0IoGate0x24AboveVa()],
    ["9d05d0LaneCount14Va", MODEL.gs9d05d0LaneCount1_4Va()],
    ["9d05d0LaneCount24Va", MODEL.gs9d05d0LaneCount2_4Va()],
    ["9d05d0Count0xf0x10Va", MODEL.gs9d05d0Count0xf0x10Va()],
    ["9d05d0FormatInRangeVa", MODEL.gs9d05d0FormatInRangeVa()],
    ["9d05d0CountCapOkVa", MODEL.gs9d05d0CountCapOkVa()],
    ["9d05d0IdxLeVecsizeVa", MODEL.gs9d05d0IdxLeVecsizeVa()],
    ["9d05d0SlotCapLt3Va", MODEL.gs9d05d0SlotCapLt3Va()],
    ["9d05d0Clamp0x14Va", MODEL.gs9d05d0Clamp0x14Va()],
    ["9d05d0ClampSigned0xaVa", MODEL.gs9d05d0ClampSigned0xaVa()],
    ["9d05d0HeadNonnegVa", MODEL.gs9d05d0HeadNonnegVa()],
    ["9d05d0HeadLtVecsizeVa", MODEL.gs9d05d0HeadLtVecsizeVa()],
    ["9d05d0SignedPositiveVa", MODEL.gs9d05d0SignedPositiveVa()],
    ["9d05d0SignedIdxLtVecsizeVa", MODEL.gs9d05d0SignedIdxLtVecsizeVa()],
    ["9d05d0IdxMasked7fffLtVecsizeVa", MODEL.gs9d05d0IdxMasked7fffLtVecsizeVa()],
    ["9d05d0ValueNegOverrideVa", MODEL.gs9d05d0ValueNegOverrideVa()],
    ["9d05d0ByteNonzeroVa", MODEL.gs9d05d0ByteNonzeroVa()],
    ["9d05d0ByteEq1Va", MODEL.gs9d05d0ByteEq1Va()],
    ["9d05d0ByteFfOkVa", MODEL.gs9d05d0ByteFfOkVa()],
    ["9d05d0U32CountNeededVa", MODEL.gs9d05d0U32CountNeededVa()],
    ["9d05d0ReadyOkVa", MODEL.gs9d05d0ReadyOkVa()],
    ["9d05d0V2fd10ResultOkVa", MODEL.gs9d05d0V2fd10ResultOkVa()],
    ["9d05d0C7350ResultOkVa", MODEL.gs9d05d0C7350ResultOkVa()],
    ["9d05d0Cff40ResultOkVa", MODEL.gs9d05d0Cff40ResultOkVa()],
    ["9d05d0ByteIdxLtByteVa", MODEL.gs9d05d0ByteIdxLtByteVa()],
    ["9d05d0IdxLt2Va", MODEL.gs9d05d0IdxLt2Va()],
    ["9d05d0IdxLt6Va", MODEL.gs9d05d0IdxLt6Va()],
    ["9d05d0IdxLt8Va", MODEL.gs9d05d0IdxLt8Va()],
    ["9d05d0WordIdxLtCountVa", MODEL.gs9d05d0WordIdxLtCountVa()],
    ["9d05d0UintIdxLtCountVa", MODEL.gs9d05d0UintIdxLtCountVa()],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want >>> 0, key);
    assert.notEqual(want, 0, key + " pin is non-trivial");
  }
  assert.equal(exp["9ce720CallerCount"]() >>> 0, 1);
  assert.equal(exp["9ce720CallerVaAt"](0) >>> 0, 0x009cda14);
  assert.equal(exp["9ce720CallerVaAt"](9) >>> 0, 0, "OOB -> 0");
  assert.equal(exp["9d05d0CallerCount"]() >>> 0, 7);
  for (const [i, want] of [[0, 0x0090c933], [1, 0x009cd70f], [4, 0x009cd8aa], [5, 0x009d806b], [6, 0x009d80f3]]) {
    assert.equal(exp["9d05d0CallerVaAt"](i) >>> 0, want, `9d05d0 caller {i}`);
  }
  assert.equal(exp["9d05d0CallerVaAt"](7) >>> 0, 0);
});

test("ABI v11 accessors: small-body + giant-split wasm accessor census", () => {
  const exp = loadExports();
  const rows = [
    ["9cf000Va", MODEL.GS9CF000_VA], ["9cf000EndVa", MODEL.GS9CF000_END_VA],
    ["9cf000BodyBytes", MODEL.GS9CF000_BODY_BYTES], ["9cf000NextVa", MODEL.GS9CF000_NEXT_VA],
    ["9cf000ClearMoreVa", MODEL.GS9CF000_CLEAR_MORE_VA],
    ["9cf050Va", MODEL.GS9CF050_VA], ["9cf050EndVa", MODEL.GS9CF050_END_VA],
    ["9cf050BodyBytes", MODEL.GS9CF050_BODY_BYTES], ["9cf050NextVa", MODEL.GS9CF050_NEXT_VA],
    ["9cff40Va", MODEL.GS9CFF40_VA], ["9cff40EndVa", MODEL.GS9CFF40_END_VA],
    ["9cff40BodyBytes", MODEL.GS9CFF40_BODY_BYTES], ["9cff40NextVa", MODEL.GS9CFF40_NEXT_VA],
    ["9cff40Io8Gate0x92Va", MODEL.GS9CFF40_IO8_GATE_0X92_VA],
    ["9d0100Va", MODEL.GS9D0100_VA], ["9d0100EndVa", MODEL.GS9D0100_END_VA],
    ["9d0100BodyBytes", MODEL.GS9D0100_BODY_BYTES], ["9d0100NextVa", MODEL.GS9D0100_NEXT_VA],
    ["9d02c0Va", MODEL.GS9D02C0_VA], ["9d02c0EndVa", MODEL.GS9D02C0_END_VA],
    ["9d02c0BodyBytes", MODEL.GS9D02C0_BODY_BYTES], ["9d02c0NextVa", MODEL.GS9D02C0_NEXT_VA],
    ["9d0440Va", MODEL.GS9D0440_VA], ["9d0440EndVa", MODEL.GS9D0440_END_VA],
    ["9d0440BodyBytes", MODEL.GS9D0440_BODY_BYTES], ["9d0440NextVa", MODEL.GS9D0440_NEXT_VA],
    ["9d0440ByteCGateVa", MODEL.GS9D0440_BYTE_C_GATE_VA],
    ["9d0440ByteDGateVa", MODEL.GS9D0440_BYTE_D_GATE_VA],
    ["9d71b0Va", MODEL.GS9D71B0_VA], ["9d71b0EndVa", MODEL.GS9D71B0_END_VA],
    ["9d71b0BodyBytes", MODEL.GS9D71B0_BODY_BYTES], ["9d71b0NextVa", MODEL.GS9D71B0_NEXT_VA],
    ["9d71b0GsCookieDat", MODEL.GS9D71B0_GS_COOKIE_DAT],
    ["9d8190Va", MODEL.GS9D8190_VA], ["9d8190EndVa", MODEL.GS9D8190_END_VA],
    ["9d8190BodyBytes", MODEL.GS9D8190_BODY_BYTES], ["9d8190NextVa", MODEL.GS9D8190_NEXT_VA],
    ["9d83f0Va", MODEL.GS9D83F0_VA], ["9d83f0EndVa", MODEL.GS9D83F0_END_VA],
    ["9d83f0BodyBytes", MODEL.GS9D83F0_BODY_BYTES], ["9d83f0NextVa", MODEL.GS9D83F0_NEXT_VA],
    ["9d8470Va", MODEL.GS9D8470_VA], ["9d8470EndVa", MODEL.GS9D8470_END_VA],
    ["9d8470BodyBytes", MODEL.GS9D8470_BODY_BYTES], ["9d8470NextVa", MODEL.GS9D8470_NEXT_VA],
    ["9d45c0FlagsPackVa", MODEL.GS9D45C0_FLAGS_PACK_VA],
    ["9d45c0CountSar3Va", MODEL.GS9D45C0_COUNT_SAR3_VA],
    ["9d45c0CountNonzeroVa", MODEL.GS9D45C0_COUNT_NONZERO_VA],
    ["9d45c0IdxLtCountVa", MODEL.GS9D45C0_IDX_LT_COUNT_VA],
    ["9d45c0Count22cPositiveVa", MODEL.GS9D45C0_COUNT_22C_POSITIVE_VA],
    ["9d45c0IdxLtCount22cVa", MODEL.GS9D45C0_IDX_LT_COUNT_22C_VA],
    ["9d45c0ElementCount78Va", MODEL.GS9D45C0_ELEMENT_COUNT_78_VA],
    ["9d45c0ByteCount36Va", MODEL.GS9D45C0_BYTE_COUNT_36_VA],
    ["9d45c0ByteIdxLtByteCountVa", MODEL.GS9D45C0_BYTE_IDX_LT_BYTE_COUNT_VA],
    ["9d45c0ByteCountNonzeroVa", MODEL.GS9D45C0_BYTE_COUNT_NONZERO_VA],
    ["9d45c0Byte398NonzeroVa", MODEL.GS9D45C0_BYTE_398_NONZERO_VA],
    ["9d45c0WordIdxLtCountVa", MODEL.GS9D45C0_WORD_IDX_LT_COUNT_VA],
    ["9d45c0IdxLt8Va", MODEL.GS9D45C0_IDX_LT_8_VA],
    ["9d45c0IdxLt6Va", MODEL.GS9D45C0_IDX_LT_6_VA],
    ["9d45c0IdxLtByteCountU32Va", MODEL.GS9D45C0_IDX_LT_BYTE_COUNT_U32_VA],
    ["9d45c0ElementCount34Va", MODEL.GS9D45C0_ELEMENT_COUNT_34_VA],
    ["9d45c0ByteNeFfVa", MODEL.GS9D45C0_BYTE_NE_FF_VA],
    ["9d45c0WalkContinue3c0Va", MODEL.GS9D45C0_WALK_CONTINUE_3C0_VA],
    ["9d45c0ElementByteNonzeroVa", MODEL.GS9D45C0_ELEMENT_BYTE_NONZERO_VA],
    ["9d45c0ValueNonnegVa", MODEL.GS9D45C0_VALUE_NONNEG_VA],
    ["9d45c0ScanValueNonnegVa", MODEL.GS9D45C0_SCAN_VALUE_NONNEG_VA],
    ["9d45c0ScanRemainingNonnegVa", MODEL.GS9D45C0_SCAN_REMAINING_NONNEG_VA],
    ["9d45c0WalkContinue5d4Va", MODEL.GS9D45C0_WALK_CONTINUE_5D4_VA],
    ["9d71b0Io8Ge0xa2Va", MODEL.GS9D71B0_IO8_GE_0XA2_VA],
    ["9d71b0Io8Ge0x9fVa", MODEL.GS9D71B0_IO8_GE_0X9F_VA],
    ["9d71b0Io8Ge0xa3Va", MODEL.GS9D71B0_IO8_GE_0XA3_VA],
    ["9d71b0CountPosSignedVa", MODEL.GS9D71B0_COUNT_POS_SIGNED_VA],
    ["9d71b0IdxLtCountSignedVa", MODEL.GS9D71B0_IDX_LT_COUNT_SIGNED_VA],
    ["9d71b0ByteNonzeroSetneVa", MODEL.GS9D71B0_BYTE_NONZERO_SETNE_VA],
    ["9d71b0VecSlotFullVa", MODEL.GS9D71B0_VEC_SLOT_FULL_VA],
    ["9d71b0CountNonzeroVa", MODEL.GS9D71B0_COUNT_NONZERO_VA],
    ["9d71b0IdxLtCountVa", MODEL.GS9D71B0_IDX_LT_COUNT_VA],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want, `v11 accessor ${key}`);
  }
  assert.equal(exp["9cf000CallerCount"]() >>> 0, 2);
  assert.equal(exp["9cf000CallerVaAt"](0) >>> 0, 0x9c7ee4);
  assert.equal(exp["9cf000CallerVaAt"](1) >>> 0, 0x9cdfbe);
  assert.equal(exp["9cff40CallerCount"]() >>> 0, 2);
  assert.equal(exp["9cff40CallerVaAt"](1) >>> 0, 0x9d26d2);
  assert.equal(exp["9d02c0CallerVaAt"](0) >>> 0, 0x9d35f0);
  assert.equal(exp["9d0440CallerVaAt"](0) >>> 0, 0x9d65a6);
  assert.equal(exp["9d71b0CallerVaAt"](0) >>> 0, 0x9cc84d);
  assert.equal(exp["9d8190CallerCount"]() >>> 0, 2);
  assert.equal(exp["9d8470CallerVaAt"](0) >>> 0, 0x9cc3d3);
  assert.equal(exp["9d45c0EndVa"]() >>> 0, 0x9d71a1, "giant split: writer ends @0x9d719e");
  assert.equal(exp["9d45c0NextVa"]() >>> 0, 0x9d71b0);
  assert.equal(exp["9cec80EndVa"]() >>> 0, 0x9ceff1, "0x9cec80 span fix");
  assert.equal(exp["9cec80NextVa"]() >>> 0, 0x9cf000);
});

test("Wasm vs JS differential: v11 small-body + writer-giant/reader-tail laws", () => {
  const exp = loadExports();
  const M = MODEL;
  const rng = mulberry32(0x9d45c0);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  for (let i = 0; i < 180; i++) {
    const io8 = rnd();
    const idx = rnd();
    const cnt = rnd();
    const b1 = rnd();
    const b2 = rnd();
    const b3 = rnd();
    const begin = rnd();
    const end = (begin + (rnd() % 0x8000)) >>> 0;
    assert.equal(exp["9cf000ClearMore"](idx) >>> 0, M.gs9cf000ClearMore(idx), "9cf000_clear_more");
    assert.equal(exp["9cff40Io8Ge0x92"](io8) >>> 0, M.gs9cff40Io8Ge0x92(io8), "9cff40_io8_ge_0x92");
    assert.equal(exp["9d0440ByteCNonzero"](b1) >>> 0, M.gs9d0440ByteCNonzero(b1), "9d0440_byte_c_nonzero");
    assert.equal(exp["9d0440ByteDNonzero"](b2) >>> 0, M.gs9d0440ByteDNonzero(b2), "9d0440_byte_d_nonzero");
    assert.equal(exp["9d0440FlagByte"](b1, b2) >>> 0, M.gs9d0440FlagByte(b1, b2), "9d0440_flag_byte");
    assert.equal(exp["9d45c0FlagsPack"](b1, b2, b3) >>> 0, M.gs9d45c0FlagsPack(b1, b2, b3), "9d45c0_flags_pack");
    assert.equal(exp["9d45c0CountSar3"](begin, end) >>> 0, M.gs9d45c0CountSar3(begin, end), "9d45c0_count_sar3");
    assert.equal(exp["9d45c0CountNonzero"](cnt) >>> 0, M.gs9d45c0CountNonzero(cnt), "9d45c0_count_nonzero");
    assert.equal(exp["9d45c0IdxLtCount"](idx, cnt) >>> 0, M.gs9d45c0IdxLtCount(idx, cnt), "9d45c0_idx_lt_count");
    assert.equal(exp["9d45c0Count22cPositive"](cnt) >>> 0, M.gs9d45c0Count22cPositive(cnt), "9d45c0_count_22c_positive");
    assert.equal(exp["9d45c0IdxLtCount22c"](idx, cnt) >>> 0, M.gs9d45c0IdxLtCount22c(idx, cnt), "9d45c0_idx_lt_count_22c");
    assert.equal(exp["9d45c0ElementCount78"](begin, end) >>> 0, M.gs9d45c0ElementCount78(begin, end), "9d45c0_element_count_78");
    assert.equal(exp["9d45c0ByteCount36"](begin, end) >>> 0, M.gs9d45c0ByteCount36(begin, end), "9d45c0_byte_count_36");
    assert.equal(exp["9d45c0ByteIdxLtByteCount"](idx, cnt) >>> 0, M.gs9d45c0ByteIdxLtByteCount(idx, cnt), "9d45c0_byte_idx_lt_byte_count");
    assert.equal(exp["9d45c0ByteCountNonzero"](b1) >>> 0, M.gs9d45c0ByteCountNonzero(b1), "9d45c0_byte_count_nonzero");
    assert.equal(exp["9d45c0Byte398Nonzero"](b1) >>> 0, M.gs9d45c0Byte398Nonzero(b1), "9d45c0_byte_398_nonzero");
    assert.equal(exp["9d45c0WordIdxLtCount"](idx, cnt) >>> 0, M.gs9d45c0WordIdxLtCount(idx, cnt), "9d45c0_word_idx_lt_count");
    assert.equal(exp["9d45c0IdxLt8"](idx) >>> 0, M.gs9d45c0IdxLt8(idx), "9d45c0_idx_lt_8");
    assert.equal(exp["9d45c0IdxLt6"](idx) >>> 0, M.gs9d45c0IdxLt6(idx), "9d45c0_idx_lt_6");
    assert.equal(exp["9d45c0IdxLtByteCountU32"](idx, cnt) >>> 0, M.gs9d45c0IdxLtByteCountU32(idx, cnt), "9d45c0_idx_lt_byte_count_u32");
    assert.equal(exp["9d45c0ElementCount34"](begin, end) >>> 0, M.gs9d45c0ElementCount34(begin, end), "9d45c0_element_count_34");
    assert.equal(exp["9d45c0ByteNeFf"](b1) >>> 0, M.gs9d45c0ByteNeFf(b1), "9d45c0_byte_ne_ff");
    assert.equal(exp["9d45c0WalkContinue3c0"](idx, cnt) >>> 0, M.gs9d45c0WalkContinue3c0(idx, cnt), "9d45c0_walk_continue_3c0");
    assert.equal(exp["9d45c0ElementByteNonzero"](b1) >>> 0, M.gs9d45c0ElementByteNonzero(b1), "9d45c0_element_byte_nonzero");
    assert.equal(exp["9d45c0ValueNonneg"](b1) >>> 0, M.gs9d45c0ValueNonneg(b1), "9d45c0_value_nonneg");
    assert.equal(exp["9d45c0ScanValueNonneg"](b1) >>> 0, M.gs9d45c0ScanValueNonneg(b1), "9d45c0_scan_value_nonneg");
    assert.equal(exp["9d45c0ScanRemainingNonneg"](b1) >>> 0, M.gs9d45c0ScanRemainingNonneg(b1), "9d45c0_scan_remaining_nonneg");
    assert.equal(exp["9d45c0WalkContinue5d4"](idx, cnt) >>> 0, M.gs9d45c0WalkContinue5d4(idx, cnt), "9d45c0_walk_continue_5d4");
    assert.equal(exp["9d71b0Io8Ge0xa2"](io8) >>> 0, M.gs9d71b0Io8Ge0xa2(io8), "9d71b0_io8_ge_0xa2");
    assert.equal(exp["9d71b0Io8Ge0x9f"](io8) >>> 0, M.gs9d71b0Io8Ge0x9f(io8), "9d71b0_io8_ge_0x9f");
    assert.equal(exp["9d71b0Io8Ge0xa3"](io8) >>> 0, M.gs9d71b0Io8Ge0xa3(io8), "9d71b0_io8_ge_0xa3");
    assert.equal(exp["9d71b0CountPosSigned"](cnt) >>> 0, M.gs9d71b0CountPosSigned(cnt), "9d71b0_count_pos_signed");
    assert.equal(exp["9d71b0IdxLtCountSigned"](idx, cnt) >>> 0, M.gs9d71b0IdxLtCountSigned(idx, cnt), "9d71b0_idx_lt_count_signed");
    assert.equal(exp["9d71b0ByteNonzeroSetne"](b1) >>> 0, M.gs9d71b0ByteNonzeroSetne(b1), "9d71b0_byte_nonzero_setne");
    assert.equal(exp["9d71b0VecSlotFull"](idx, cnt) >>> 0, M.gs9d71b0VecSlotFull(idx, cnt), "9d71b0_vec_slot_full");
    assert.equal(exp["9d71b0CountNonzero"](cnt) >>> 0, M.gs9d71b0CountNonzero(cnt), "9d71b0_count_nonzero");
    assert.equal(exp["9d71b0IdxLtCount"](idx, cnt) >>> 0, M.gs9d71b0IdxLtCount(idx, cnt), "9d71b0_idx_lt_count");
  }
});

test("v11 laws are not vacuous (self-check)", () => {
  assert.equal(MODEL.gs9cff40Io8Ge0x92(0x91), 0);
  assert.equal(MODEL.gs9cff40Io8Ge0x92(0x92), 1);
  assert.equal(MODEL.gs9d71b0Io8Ge0xa2(0xa1), 0);
  assert.equal(MODEL.gs9d71b0Io8Ge0xa2(0xa2), 1);
  assert.equal(MODEL.gs9d71b0Io8Ge0xa2(0xffffffff), 1, "unsigned");
  assert.equal(MODEL.gs9d71b0Io8Ge0x9f(0x9e), 0);
  assert.equal(MODEL.gs9d71b0Io8Ge0xa3(0xa3), 1);
  assert.equal(MODEL.gs9d45c0FlagsPack(0x101, 0, 0xff), 5, "masked bytes: bit0+bit2");
  assert.equal(MODEL.gs9d0440FlagByte(0x1, 0x2), 3, "bit0 + bit1");
  assert.equal(MODEL.gs9d45c0Count22cPositive(0xffffffff), 0, "signed negative");
  assert.equal(MODEL.gs9d71b0IdxLtCountSigned(0xffffffff, 1), 1, "signed -1 < 1");
  assert.equal(MODEL.gs9d45c0ByteIdxLtByteCount(0x101, 0x1ff), 1, "bytes: 0x01 < 0xff");
  assert.equal(MODEL.gs9d45c0WordIdxLtCount(0x10001, 0x1ffff), 1, "words: 0x0001 < 0xffff");
  assert.equal(MODEL.gs9d45c0IdxLtByteCountU32(0x100, 0x1ff), 0, "u32 idx vs byte count");
  assert.equal(MODEL.gs9cf000ClearMore(0x67), 1);
  assert.equal(MODEL.gs9cf000ClearMore(0x68), 0, "0x68 bound");
  assert.equal(MODEL.gs9d45c0IdxLt8(7), 1);
  assert.equal(MODEL.gs9d45c0IdxLt8(8), 0, "8 bound");
  assert.equal(MODEL.gs9d45c0IdxLt6(6), 0, "6 bound");
  assert.equal(MODEL.gs9d45c0ByteNeFf(0xff), 0, "0xff excluded");
  assert.equal(MODEL.gs9d45c0WalkContinue3c0(0x100, 0x100), 0, "walk end");
  assert.equal(MODEL.gs9d71b0VecSlotFull(0x100, 0x100), 1, "slot full");
  assert.equal(MODEL.gs9d45c0ElementCount78(0x100, 0x100 + 0x78 + 1), 1, "floor div 0x78");
  assert.equal(MODEL.gs9d45c0CountSar3(0x10000000, 0x10000020), 4, "sar3");
});

test("v11 boundary pins: wasm agrees with model at every gate edge", () => {
  const exp = loadExports();
  const M = MODEL;
  const cases = [
    ["9cf000ClearMore", [0x68], [0x67]],
    ["9d45c0IdxLt8", [8], [7]],
    ["9d45c0IdxLt6", [6], [5]],
    ["9d45c0ByteNeFf", [0xff], [0xfe]],
    ["9d45c0WalkContinue3c0", [5, 5], [4, 5]],
    ["9d71b0VecSlotFull", [5, 5], [4, 5]],
    ["9d71b0Io8Ge0xa2", [0xa2], [0xa1]],
    ["9d71b0Io8Ge0x9f", [0x9f], [0x9e]],
    ["9d71b0Io8Ge0xa3", [0xa3], [0xa2]],
    ["9cff40Io8Ge0x92", [0x92], [0x91]],
  ];
  for (const [key, edge, near] of cases) {
    assert.equal(exp[key](...edge) >>> 0, M[key === "9cf000ClearMore" ? "gs9cf000ClearMore" : key === "9d45c0IdxLt8" ? "gs9d45c0IdxLt8" : key === "9d45c0IdxLt6" ? "gs9d45c0IdxLt6" : key === "9d45c0ByteNeFf" ? "gs9d45c0ByteNeFf" : key === "9d45c0WalkContinue3c0" ? "gs9d45c0WalkContinue3c0" : key === "9d71b0VecSlotFull" ? "gs9d71b0VecSlotFull" : key === "9d71b0Io8Ge0xa2" ? "gs9d71b0Io8Ge0xa2" : key === "9d71b0Io8Ge0x9f" ? "gs9d71b0Io8Ge0x9f" : key === "9d71b0Io8Ge0xa3" ? "gs9d71b0Io8Ge0xa3" : "gs9cff40Io8Ge0x92"](...edge), `edge ${key}`);
    assert.equal(exp[key](...near) >>> 0, M[key === "9cf000ClearMore" ? "gs9cf000ClearMore" : key === "9d45c0IdxLt8" ? "gs9d45c0IdxLt8" : key === "9d45c0IdxLt6" ? "gs9d45c0IdxLt6" : key === "9d45c0ByteNeFf" ? "gs9d45c0ByteNeFf" : key === "9d45c0WalkContinue3c0" ? "gs9d45c0WalkContinue3c0" : key === "9d71b0VecSlotFull" ? "gs9d71b0VecSlotFull" : key === "9d71b0Io8Ge0xa2" ? "gs9d71b0Io8Ge0xa2" : key === "9d71b0Io8Ge0x9f" ? "gs9d71b0Io8Ge0x9f" : key === "9d71b0Io8Ge0xa3" ? "gs9d71b0Io8Ge0xa3" : "gs9cff40Io8Ge0x92"](...near), `near ${key}`);
  }
});

/* ============ ABI v12: sub-object serializer 0x9d77e0 + save-piece
   writer 0x9d8190 + shared leaves 0x9d8660/0x9d8820/0x9d8a20
   (section-notes/game-state-v12-savepiece/NOTES.md §5; 21 laws) ========== */

test("ABI v12 accessors: 0x9d77e0/0x9d8190/0x9d8660/0x9d8820/0x9d8a20 wasm accessor census", () => {
  const exp = loadExports();
  const M = MODEL;
  const rows = [
    ["9d77e0Va", M.GS9D77E0_VA], ["9d77e0EndVa", M.GS9D77E0_END_VA],
    ["9d77e0BodyBytes", M.GS9D77E0_BODY_BYTES], ["9d77e0NextVa", M.GS9D77E0_NEXT_VA],
    ["9d77e0Stride", M.GS9D77E0_STRIDE],
    ["9d77e0LoopABaseOff", M.GS9D77E0_LOOP_A_BASE_OFF], ["9d77e0LoopAEndOff", M.GS9D77E0_LOOP_A_END_OFF],
    ["9d77e0LoopBBaseOff", M.GS9D77E0_LOOP_B_BASE_OFF], ["9d77e0LoopBEndOff", M.GS9D77E0_LOOP_B_END_OFF],
    ["9d77e0LoopCBaseOff", M.GS9D77E0_LOOP_C_BASE_OFF], ["9d77e0LoopCEndOff", M.GS9D77E0_LOOP_C_END_OFF],
    ["9d77e0LoopDBaseOff", M.GS9D77E0_LOOP_D_BASE_OFF], ["9d77e0LoopDEndOff", M.GS9D77E0_LOOP_D_END_OFF],
    ["9d77e0ElemByte4Off", M.GS9D77E0_ELEM_BYTE4_OFF], ["9d77e0ElemByte8Off", M.GS9D77E0_ELEM_BYTE8_OFF],
    ["9d77e0CountMagic", M.GS9D77E0_COUNT_0XC_MAGIC],
    ["9d77e0CountVa", M.GS9D77E0_COUNT_VA], ["9d77e0CountZeroGateVa", M.GS9D77E0_COUNT_ZERO_GATE_VA],
    ["9d77e0LoopMoreVa", M.GS9D77E0_LOOP_MORE_VA], ["9d77e0Byte4GateVa", M.GS9D77E0_BYTE4_GATE_VA],
    ["9d77e0Byte8GateVa", M.GS9D77E0_BYTE8_GATE_VA],
    ["9d8190PieceCountOff", M.GS9D8190_PIECE_COUNT_OFF], ["9d8190PieceBaseOff", M.GS9D8190_PIECE_BASE_OFF],
    ["9d8190PieceStride", M.GS9D8190_PIECE_STRIDE], ["9d8190SeedPtrOff", M.GS9D8190_SEED_PTR_OFF],
    ["9d8190PieceCountPosVa", M.GS9D8190_PIECE_COUNT_POS_VA], ["9d8190PieceIdxLtVa", M.GS9D8190_PIECE_IDX_LT_VA],
    ["9d819045c0CallVa", M.GS9D8190_45C0_CALL_VA], ["9d8190SeedGateVa", M.GS9D8190_SEED_GATE_VA],
    ["9d8190SsoHeapGateVa", M.GS9D8190_SSO_HEAP_GATE_VA], ["9d8190SsoFreeGateVa", M.GS9D8190_SSO_FREE_GATE_VA],
    ["9d8190ChecksumStoreVa", M.GS9D8190_CHECKSUM_STORE_VA], ["9d8190ChecksumXorVa", M.GS9D8190_CHECKSUM_XOR_VA],
    ["9d8190SeedLogStrVa", M.GS9D8190_SEED_LOG_STR_VA],
    ["9d8190ChecksumXor", M.GS9D8190_CHECKSUM_XOR], ["9d8190ChecksumOff", M.GS9D8190_CHECKSUM_OFF],
    ["9d8660Va", M.GS9D8660_VA], ["9d8660EndVa", M.GS9D8660_END_VA],
    ["9d8660BodyBytes", M.GS9D8660_BODY_BYTES], ["9d8660NextVa", M.GS9D8660_NEXT_VA],
    ["9d8660Stride", M.GS9D8660_STRIDE], ["9d8660MaxCount", M.GS9D8660_MAX_COUNT],
    ["9d8660Count0xcVa", M.GS9D8660_COUNT_0XC_VA], ["9d8660CountMaxGateVa", M.GS9D8660_COUNT_MAX_GATE_VA],
    ["9d8660GrowMaxCmovVa", M.GS9D8660_GROW_MAX_CMOV_VA], ["9d8660GrowTargetOkVa", M.GS9D8660_GROW_TARGET_OK_VA],
    ["9d8660CopyMoreVa", M.GS9D8660_COPY_MORE_VA],
    ["9d8820Va", M.GS9D8820_VA], ["9d8820EndVa", M.GS9D8820_END_VA],
    ["9d8820BodyBytes", M.GS9D8820_BODY_BYTES], ["9d8820NextVa", M.GS9D8820_NEXT_VA],
    ["9d8820Stride", M.GS9D8820_STRIDE], ["9d8820SlotDwords", M.GS9D8820_SLOT_DWORDS],
    ["9d8820CountGateVa", M.GS9D8820_COUNT_GATE_VA], ["9d8820LoopMoreVa", M.GS9D8820_LOOP_MORE_VA],
    ["9d8a20Va", M.GS9D8A20_VA], ["9d8a20EndVa", M.GS9D8A20_END_VA],
    ["9d8a20BodyBytes", M.GS9D8A20_BODY_BYTES], ["9d8a20NextVa", M.GS9D8A20_NEXT_VA],
    ["9d8a20Stride", M.GS9D8A20_STRIDE], ["9d8a20MaxCount", M.GS9D8A20_MAX_COUNT],
    ["9d8a20Count0x34Va", M.GS9D8A20_COUNT_0X34_VA], ["9d8a20CountLeCapVa", M.GS9D8A20_COUNT_LE_CAP_VA],
    ["9d8a20GrowTargetOkVa", M.GS9D8A20_GROW_TARGET_OK_VA],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want, `v12 accessor ${key}`);
  }
  assert.equal(exp["9d77e0CallerCount"]() >>> 0, 1);
  assert.equal(exp["9d77e0CallerVaAt"](0) >>> 0, 0x9c988c);
  assert.equal(exp["9d77e0CallerVaAt"](1) >>> 0, 0, "OOB -> 0");
  assert.equal(exp["9d8190CallerCount"]() >>> 0, 2);
  assert.equal(exp["9d8190CallerVaAt"](0) >>> 0, 0x959353);
  assert.equal(exp["9d8190CallerVaAt"](1) >>> 0, 0x9594b4);
  assert.equal(exp["9d8660CallerCount"]() >>> 0, 8);
  assert.equal(exp["9d8660CallerVaAt"](0) >>> 0, 0x6fde3e);
  assert.equal(exp["9d8660CallerVaAt"](7) >>> 0, 0x9e5aa3);
  assert.equal(exp["9d8820CallerCount"]() >>> 0, 2);
  assert.equal(exp["9d8820CallerVaAt"](0) >>> 0, 0x9d845e);
  assert.equal(exp["9d8820CallerVaAt"](1) >>> 0, 0x9d8a9c);
  assert.equal(exp["9d8a20CallerCount"]() >>> 0, 1);
  assert.equal(exp["9d8a20CallerVaAt"](0) >>> 0, 0x9d8449);
});

test("Wasm vs JS differential: v12 save-piece cluster laws (0x9d77e0/0x9d8190/0x9d8660/0x9d8820/0x9d8a20)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rng = mulberry32(0x9d8a20);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  const VIEW = new DataView(exp.memory.buffer);
  const memBase = 0x30000;
  const oracleMem = new DataView(exp.memory.buffer, memBase);
  for (let i = 0; i < 180; i++) {
    const begin = rnd();
    const end = (begin + (rnd() % 0x8000)) >>> 0;
    const cnt = rnd();
    const idx = rnd();
    const b1 = rnd();
    const b2 = rnd();
    const nc = rnd();
    const cc = rnd();
    const target = rnd();
    const cur = rnd();
    const remaining = rnd();
    assert.equal(exp["9d77e0ElementCount0xc"](begin, end) >>> 0,
      M.gs9d77e0ElementCount0xc(begin, end), "9d77e0_element_count_0xc");
    assert.equal(exp["9d77e0LoopCountNonzero"](cnt) >>> 0,
      M.gs9d77e0LoopCountNonzero(cnt), "9d77e0_loop_count_nonzero");
    assert.equal(exp["9d77e0IdxLtCount"](idx, cnt) >>> 0,
      M.gs9d77e0IdxLtCount(idx, cnt), "9d77e0_idx_lt_count");
    assert.equal(exp["9d77e0ElemByte4Nonzero"](b1) >>> 0,
      M.gs9d77e0ElemByte4Nonzero(b1), "9d77e0_elem_byte4_nonzero");
    assert.equal(exp["9d77e0ElemByte8Nonzero"](b2) >>> 0,
      M.gs9d77e0ElemByte8Nonzero(b2), "9d77e0_elem_byte8_nonzero");
    assert.equal(exp["9d8190PieceCountPositive"](cnt) >>> 0,
      M.gs9d8190PieceCountPositive(cnt), "9d8190_piece_count_positive");
    assert.equal(exp["9d8190PieceIdxLtCount"](idx, cnt) >>> 0,
      M.gs9d8190PieceIdxLtCount(idx, cnt), "9d8190_piece_idx_lt_count");
    assert.equal(exp["9d8190SeedObjPresent"](cnt) >>> 0,
      M.gs9d8190SeedObjPresent(cnt), "9d8190_seed_obj_present");
    assert.equal(exp["9d8190MsgSsoHeapUsed"](cnt) >>> 0,
      M.gs9d8190MsgSsoHeapUsed(cnt), "9d8190_msg_sso_heap_used");
    assert.equal(exp["9d8190ChecksumStreamWord"](cnt) >>> 0,
      M.gs9d8190ChecksumStreamWord(cnt), "9d8190_checksum_stream_word");
    /* mem-law draw: heap arm reads [mem + sso_off] LE u32; inline arm never
       touches memory. */
    const ssoOff = rnd() % 0x1000;
    const size = rnd();
    VIEW.setUint32(memBase + ssoOff, rnd(), true);
    assert.equal(exp["9d8190MsgSsoPtr"](memBase, ssoOff, size) >>> 0,
      M.gs9d8190MsgSsoPtr(oracleMem, ssoOff, size),
      `9d8190_msg_sso_ptr(off=${ssoOff.toString(16)},size=${size.toString(16)})`);
    assert.equal(exp["9d8660ElementCount0xc"](begin, end) >>> 0,
      M.gs9d8660ElementCount0xc(begin, end), "9d8660_element_count_0xc");
    assert.equal(exp["9d8660CountNotMaxed"](cnt) >>> 0,
      M.gs9d8660CountNotMaxed(cnt), "9d8660_count_not_maxed");
    assert.equal(exp["9d8660GrowTargetCount"](nc, cc) >>> 0,
      M.gs9d8660GrowTargetCount(nc, cc), "9d8660_grow_target_count");
    assert.equal(exp["9d8660GrowTargetOk"](target) >>> 0,
      M.gs9d8660GrowTargetOk(target), "9d8660_grow_target_ok");
    assert.equal(exp["9d8660CopyMore"](cur, end) >>> 0,
      M.gs9d8660CopyMore(cur, end), "9d8660_copy_more");
    assert.equal(exp["9d8820CountNonzero"](cnt) >>> 0,
      M.gs9d8820CountNonzero(cnt), "9d8820_count_nonzero");
    assert.equal(exp["9d8820LoopMore"](remaining) >>> 0,
      M.gs9d8820LoopMore(remaining), "9d8820_loop_more");
    assert.equal(exp["9d8a20ElementCount0x34"](begin, end) >>> 0,
      M.gs9d8a20ElementCount0x34(begin, end), "9d8a20_element_count_0x34");
    assert.equal(exp["9d8a20CountLeCap"](cnt) >>> 0,
      M.gs9d8a20CountLeCap(cnt), "9d8a20_count_le_cap");
    assert.equal(exp["9d8a20GrowTargetOk"](target) >>> 0,
      M.gs9d8a20GrowTargetOk(target), "9d8a20_grow_target_ok");
  }
});

test("v12 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  assert.equal(M.gs9d77e0ElementCount0xc(0x100, 0x100 + 0xc), 1);
  assert.equal(M.gs9d77e0ElementCount0xc(0x100, 0x100 + 0xc + 1), 1, "floor div 0xc");
  assert.equal(M.gs9d77e0ElementCount0xc(0x102, 0x100), 0xffffffff, "signed negative floor");
  assert.equal(M.gs9d77e0LoopCountNonzero(0), 0);
  assert.equal(M.gs9d77e0LoopCountNonzero(0x100), 1, "FULL-dword");
  assert.equal(M.gs9d77e0IdxLtCount(0xffffffff, 4), 0, "UNSIGNED idx");
  assert.equal(M.gs9d77e0ElemByte4Nonzero(0x100), 0, "LOW-BYTE 0x100 -> low byte 0");
  assert.equal(M.gs9d77e0ElemByte4Nonzero(0x1ff), 1, "LOW-BYTE 0x1ff -> low byte 0xff");
  assert.equal(M.gs9d77e0ElemByte4Nonzero(0), 0);
  assert.equal(M.gs9d77e0ElemByte8Nonzero(0x100), 0, "LOW-BYTE 0x100 -> low byte 0");
  assert.equal(M.gs9d77e0ElemByte8Nonzero(0x1ff), 1, "LOW-BYTE 0x1ff -> low byte 0xff");
  assert.equal(M.gs9d8190PieceCountPositive(0), 0);
  assert.equal(M.gs9d8190PieceCountPositive(0xffffffff), 0, "SIGNED negative");
  assert.equal(M.gs9d8190PieceCountPositive(1), 1);
  assert.equal(M.gs9d8190PieceIdxLtCount(0xffffffff, 1), 1, "SIGNED -1 < 1");
  assert.equal(M.gs9d8190SeedObjPresent(0), 0);
  assert.equal(M.gs9d8190SeedObjPresent(0x100), 1, "FULL-dword ptr");
  assert.equal(M.gs9d8190MsgSsoHeapUsed(0xf), 0);
  assert.equal(M.gs9d8190MsgSsoHeapUsed(0x10), 1, "SSO 0x10 bound");
  assert.equal(M.gs9d8190MsgSsoHeapUsed(0xffffffff), 1, "UNSIGNED");
  assert.equal(M.gs9d8190ChecksumStreamWord(0), 0x96696996);
  assert.equal(M.gs9d8190ChecksumStreamWord(0x96696996), 0, "xor involutive");
  assert.equal(M.gs9d8660ElementCount0xc(0x100, 0x100 + 0xc), 1);
  assert.equal(M.gs9d8660CountNotMaxed(0x15555555), 0, "max count excluded");
  assert.equal(M.gs9d8660CountNotMaxed(0xffffffff), 1);
  assert.equal(M.gs9d8660GrowTargetCount(0x10, 0x10), 0x18, "cap + cap>>1");
  assert.equal(M.gs9d8660GrowTargetCount(0xffffffff, 0), 0xffffffff, "new > growth");
  assert.equal(M.gs9d8660GrowTargetOk(0x15555555), 1, "cap inclusive");
  assert.equal(M.gs9d8660GrowTargetOk(0x15555556), 0, "over cap -> throw");
  assert.equal(M.gs9d8660CopyMore(5, 5), 0, "walk end");
  assert.equal(M.gs9d8660CopyMore(4, 5), 1);
  assert.equal(M.gs9d8820CountNonzero(0), 0);
  assert.equal(M.gs9d8820CountNonzero(0x100), 1);
  assert.equal(M.gs9d8820LoopMore(1), 0, "remaining 1 -> sub 1 -> 0");
  assert.equal(M.gs9d8820LoopMore(2), 1);
  assert.equal(M.gs9d8820LoopMore(0), 1, "0 - 1 wraps -> nonzero");
  assert.equal(M.gs9d8a20ElementCount0x34(0, 0x68), 2);
  assert.equal(M.gs9d8a20ElementCount0x34(0x100, 0x100 + 0x34), 1);
  assert.equal(M.gs9d8a20CountLeCap(0x4ec4ec4), 1, "cap inclusive");
  assert.equal(M.gs9d8a20CountLeCap(0x4ec4ec5), 0, "over cap -> throw");
  assert.equal(M.gs9d8a20GrowTargetOk(0x4ec4ec4), 1);
  assert.equal(M.gs9d8a20GrowTargetOk(0xffffffff), 0);
});

test("v12 boundary pins: wasm agrees with model at every gate edge", () => {
  const exp = loadExports();
  const M = MODEL;
  const map = {
    "9d77e0LoopCountNonzero": M.gs9d77e0LoopCountNonzero,
    "9d77e0ElemByte4Nonzero": M.gs9d77e0ElemByte4Nonzero,
    "9d77e0ElemByte8Nonzero": M.gs9d77e0ElemByte8Nonzero,
    "9d8190PieceCountPositive": M.gs9d8190PieceCountPositive,
    "9d8190MsgSsoHeapUsed": M.gs9d8190MsgSsoHeapUsed,
    "9d8190SeedObjPresent": M.gs9d8190SeedObjPresent,
    "9d8660CountNotMaxed": M.gs9d8660CountNotMaxed,
    "9d8660GrowTargetOk": M.gs9d8660GrowTargetOk,
    "9d8660CopyMore": M.gs9d8660CopyMore,
    "9d8820CountNonzero": M.gs9d8820CountNonzero,
    "9d8820LoopMore": M.gs9d8820LoopMore,
    "9d8a20CountLeCap": M.gs9d8a20CountLeCap,
    "9d8a20GrowTargetOk": M.gs9d8a20GrowTargetOk,
  };
  const cases = [
    ["9d77e0LoopCountNonzero", [0], [1]],
    ["9d77e0ElemByte4Nonzero", [0], [0x100]],
    ["9d77e0ElemByte8Nonzero", [0], [0x100]],
    ["9d8190PieceCountPositive", [0], [1]],
    ["9d8190PieceCountPositive", [0xffffffff], [0], true],
    ["9d8190MsgSsoHeapUsed", [0xf], [0x10]],
    ["9d8190SeedObjPresent", [0], [1]],
    ["9d8660CountNotMaxed", [0x15555555], [0x15555554]],
    ["9d8660GrowTargetOk", [0x15555555], [0x15555556]],
    ["9d8660CopyMore", [5, 5], [4, 5]],
    ["9d8820CountNonzero", [0], [1]],
    ["9d8820LoopMore", [1], [2]],
    ["9d8a20CountLeCap", [0x4ec4ec4], [0x4ec4ec5]],
    ["9d8a20GrowTargetOk", [0x4ec4ec4], [0x4ec4ec5]],
  ];
  for (const [key, edge, near] of cases) {
    const m = map[key];
    const w = exp[key];
    assert.equal(w(...edge) >>> 0, m(...edge) >>> 0, `edge ${key}`);
    assert.equal(w(...near) >>> 0, m(...near) >>> 0, `near ${key}`);
  }
});

/* ============ ABI v13: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0
   (section-notes/game-state-v13-reserve-leaves/NOTES.md §4; 21 laws) ========== */

test("ABI v13 accessors: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 wasm accessor census", () => {
  const exp = loadExports();
  const M = MODEL;
  const rows = [
    ["9d88a0Va", M.GS9D88A0_VA], ["9d88a0EndVa", M.GS9D88A0_END_VA],
    ["9d88a0BodyBytes", M.GS9D88A0_BODY_BYTES], ["9d88a0NextVa", M.GS9D88A0_NEXT_VA],
    ["9d88a0Stride", M.GS9D88A0_STRIDE], ["9d88a0MaxCount", M.GS9D88A0_MAX_COUNT],
    ["9d88a0CountLeCapVa", M.GS9D88A0_COUNT_LE_CAP_VA], ["9d88a0CountVa", M.GS9D88A0_COUNT_VA],
    ["9d88a0GrowthOkVa", M.GS9D88A0_GROWTH_OK_VA], ["9d88a0GrowTargetCountVa", M.GS9D88A0_GROW_TARGET_COUNT_VA],
    ["9d88a0GrowTargetOkVa", M.GS9D88A0_GROW_TARGET_OK_VA], ["9d88a0TailFillNeededVa", M.GS9D88A0_TAIL_FILL_NEEDED_VA],
    ["9d8960Va", M.GS9D8960_VA], ["9d8960EndVa", M.GS9D8960_END_VA],
    ["9d8960BodyBytes", M.GS9D8960_BODY_BYTES], ["9d8960NextVa", M.GS9D8960_NEXT_VA],
    ["9d8960Stride", M.GS9D8960_STRIDE], ["9d8960MaxCount", M.GS9D8960_MAX_COUNT],
    ["9d8960CountLeCapVa", M.GS9D8960_COUNT_LE_CAP_VA], ["9d8960CountVa", M.GS9D8960_COUNT_VA],
    ["9d8960GrowthOkVa", M.GS9D8960_GROWTH_OK_VA], ["9d8960GrowTargetCountVa", M.GS9D8960_GROW_TARGET_COUNT_VA],
    ["9d8960GrowTargetOkVa", M.GS9D8960_GROW_TARGET_OK_VA], ["9d8960TailFillNeededVa", M.GS9D8960_TAIL_FILL_NEEDED_VA],
    ["9d8af0Va", M.GS9D8AF0_VA], ["9d8af0EndVa", M.GS9D8AF0_END_VA],
    ["9d8af0BodyBytes", M.GS9D8AF0_BODY_BYTES], ["9d8af0NextVa", M.GS9D8AF0_NEXT_VA],
    ["9d8af0Stride", M.GS9D8AF0_STRIDE], ["9d8af0MaxCount", M.GS9D8AF0_MAX_COUNT],
    ["9d8af0CountLeCapVa", M.GS9D8AF0_COUNT_LE_CAP_VA], ["9d8af0CountVa", M.GS9D8AF0_COUNT_VA],
    ["9d8af0GrowthOkVa", M.GS9D8AF0_GROWTH_OK_VA], ["9d8af0GrowTargetCountVa", M.GS9D8AF0_GROW_TARGET_COUNT_VA],
    ["9d8af0GrowTargetOkVa", M.GS9D8AF0_GROW_TARGET_OK_VA],
    ["9d8af0TailInitNeededVa", M.GS9D8AF0_TAIL_INIT_NEEDED_VA], ["9d8af0TailInitMoreVa", M.GS9D8AF0_TAIL_INIT_MORE_VA],
    ["9d8af0CopyNeededVa", M.GS9D8AF0_COPY_NEEDED_VA], ["9d8af0CopyMoreVa", M.GS9D8AF0_COPY_MORE_VA],
  ];
  for (const [key, want] of rows) {
    assert.equal(exp[key]() >>> 0, want, `v13 accessor ${key}`);
  }
  assert.equal(exp["9d88a0CallerCount"]() >>> 0, 1);
  assert.equal(exp["9d88a0CallerVaAt"](0) >>> 0, 0x9cddc0);
  assert.equal(exp["9d88a0CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
  assert.equal(exp["9d8960CallerCount"]() >>> 0, 1);
  assert.equal(exp["9d8960CallerVaAt"](0) >>> 0, 0x9d2bca);
  assert.equal(exp["9d8960CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
  assert.equal(exp["9d8af0CallerCount"]() >>> 0, 1);
  assert.equal(exp["9d8af0CallerVaAt"](0) >>> 0, 0x9d1379);
  assert.equal(exp["9d8af0CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
});

test("Wasm vs JS differential: v13 reserve-leaves laws (0x9d88a0/0x9d8960/0x9d8af0)", () => {
  const exp = loadExports();
  const M = MODEL;
  const rng = mulberry32(0x9d8af0);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  for (let i = 0; i < 180; i++) {
    const begin = rnd();
    const end = (begin + (rnd() % 0x8000)) >>> 0;
    const cnt = rnd();
    const nc = rnd();
    const cc = rnd();
    const target = rnd();
    const cur = rnd();
    const remaining = rnd();
    // structured sar-count wrap draws: end BEFORE begin (negative diff)
    const wrapEnd = (begin - (rnd() % 0x1000)) >>> 0;
    assert.equal(exp["9d88a0CountLeCap"](cnt) >>> 0,
      M.gs9d88a0CountLeCap(cnt), "9d88a0_count_le_cap");
    assert.equal(exp["9d88a0ElementCount8"](begin, end) >>> 0,
      M.gs9d88a0ElementCount8(begin, end), "9d88a0_element_count_8");
    assert.equal(exp["9d88a0ElementCount8"](begin, wrapEnd) >>> 0,
      M.gs9d88a0ElementCount8(begin, wrapEnd), "9d88a0_element_count_8 wrap");
    assert.equal(exp["9d88a0GrowthOk"](cc) >>> 0,
      M.gs9d88a0GrowthOk(cc), "9d88a0_growth_ok");
    assert.equal(exp["9d88a0GrowTargetCount"](nc, cc) >>> 0,
      M.gs9d88a0GrowTargetCount(nc, cc), "9d88a0_grow_target_count");
    assert.equal(exp["9d88a0GrowTargetOk"](target) >>> 0,
      M.gs9d88a0GrowTargetOk(target), "9d88a0_grow_target_ok");
    assert.equal(exp["9d88a0TailFillNeeded"](nc, cc) >>> 0,
      M.gs9d88a0TailFillNeeded(nc, cc), "9d88a0_tail_fill_needed");
    assert.equal(exp["9d8960CountLeCap"](cnt) >>> 0,
      M.gs9d8960CountLeCap(cnt), "9d8960_count_le_cap");
    assert.equal(exp["9d8960ElementCount16"](begin, end) >>> 0,
      M.gs9d8960ElementCount16(begin, end), "9d8960_element_count_16");
    assert.equal(exp["9d8960ElementCount16"](begin, wrapEnd) >>> 0,
      M.gs9d8960ElementCount16(begin, wrapEnd), "9d8960_element_count_16 wrap");
    assert.equal(exp["9d8960GrowthOk"](cc) >>> 0,
      M.gs9d8960GrowthOk(cc), "9d8960_growth_ok");
    assert.equal(exp["9d8960GrowTargetCount"](nc, cc) >>> 0,
      M.gs9d8960GrowTargetCount(nc, cc), "9d8960_grow_target_count");
    assert.equal(exp["9d8960GrowTargetOk"](target) >>> 0,
      M.gs9d8960GrowTargetOk(target), "9d8960_grow_target_ok");
    assert.equal(exp["9d8960TailFillNeeded"](nc, cc) >>> 0,
      M.gs9d8960TailFillNeeded(nc, cc), "9d8960_tail_fill_needed");
    assert.equal(exp["9d8af0CountLeCap"](cnt) >>> 0,
      M.gs9d8af0CountLeCap(cnt), "9d8af0_count_le_cap");
    assert.equal(exp["9d8af0ElementCount8"](begin, end) >>> 0,
      M.gs9d8af0ElementCount8(begin, end), "9d8af0_element_count_8");
    assert.equal(exp["9d8af0ElementCount8"](begin, wrapEnd) >>> 0,
      M.gs9d8af0ElementCount8(begin, wrapEnd), "9d8af0_element_count_8 wrap");
    assert.equal(exp["9d8af0GrowthOk"](cc) >>> 0,
      M.gs9d8af0GrowthOk(cc), "9d8af0_growth_ok");
    assert.equal(exp["9d8af0GrowTargetCount"](nc, cc) >>> 0,
      M.gs9d8af0GrowTargetCount(nc, cc), "9d8af0_grow_target_count");
    assert.equal(exp["9d8af0GrowTargetOk"](target) >>> 0,
      M.gs9d8af0GrowTargetOk(target), "9d8af0_grow_target_ok");
    assert.equal(exp["9d8af0TailInitNeeded"](nc, cc) >>> 0,
      M.gs9d8af0TailInitNeeded(nc, cc), "9d8af0_tail_init_needed");
    assert.equal(exp["9d8af0TailInitMore"](remaining) >>> 0,
      M.gs9d8af0TailInitMore(remaining), "9d8af0_tail_init_more");
    assert.equal(exp["9d8af0CopyNeeded"](begin, end) >>> 0,
      M.gs9d8af0CopyNeeded(begin, end), "9d8af0_copy_needed");
    assert.equal(exp["9d8af0CopyMore"](cur, end) >>> 0,
      M.gs9d8af0CopyMore(cur, end), "9d8af0_copy_more");
  }
});

test("v13 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  assert.equal(M.gs9d88a0CountLeCap(0x1fffffff), 1, "cap inclusive");
  assert.equal(M.gs9d88a0CountLeCap(0x20000000), 0, "over cap -> throw");
  assert.equal(M.gs9d88a0CountLeCap(0x100), 1, "FULL-dword present");
  assert.equal(M.gs9d88a0ElementCount8(0x100, 0x100 + 8), 1);
  assert.equal(M.gs9d88a0ElementCount8(0x100, 0x100 + 9), 1, "floor");
  assert.equal(M.gs9d88a0ElementCount8(0x108, 0x100), -1 >>> 0, "negative diff sar floor");
  assert.equal(M.gs9d88a0GrowthOk(0), 1);
  assert.equal(M.gs9d88a0GrowthOk(0x15555555), 1, "1.5x target == cap exactly");
  assert.equal(M.gs9d88a0GrowthOk(0x15555556), 0, "1.5x target over cap");
  assert.equal(M.gs9d88a0GrowthOk(0x40000000), 1, "wrap region: lim wraps to 0xffffffff (throw moves to grow_target_ok)");
  assert.equal(M.gs9d88a0GrowTargetCount(0x10, 0x10), 0x18, "cap + cap>>1");
  assert.equal(M.gs9d88a0GrowTargetCount(0xffffffff, 0), 0xffffffff, "new > growth");
  assert.equal(M.gs9d88a0GrowTargetOk(0x1fffffff), 1);
  assert.equal(M.gs9d88a0GrowTargetOk(0x20000000), 0);
  assert.equal(M.gs9d88a0TailFillNeeded(0x100, 0x100), 0, "no growth -> no memset");
  assert.equal(M.gs9d88a0TailFillNeeded(0x100, 0), 1);
  assert.equal(M.gs9d88a0TailFillNeeded(0x100, 0x200), 1, "mod-2^32 diff nonzero");
  assert.equal(M.gs9d8960CountLeCap(0xfffffff), 1);
  assert.equal(M.gs9d8960CountLeCap(0x10000000), 0);
  assert.equal(M.gs9d8960ElementCount16(0x100, 0x110), 1);
  assert.equal(M.gs9d8960ElementCount16(0x110, 0x100), -1 >>> 0, "negative diff sar floor");
  assert.equal(M.gs9d8960GrowthOk(0x0aaaaaaa), 1, "1.5x target == 0xfffffff exactly");
  assert.equal(M.gs9d8960GrowthOk(0x0aaaaaab), 0, "1.5x target over cap");
  assert.equal(M.gs9d8960GrowthOk(0x20000000), 1, "wrap region: lim wraps -> throw moves to grow_target_ok");
  assert.equal(M.gs9d8960GrowTargetCount(0x20, 0x10), 0x20, "new > 1.5x target -> new");
  assert.equal(M.gs9d8960GrowTargetOk(0xfffffff), 1);
  assert.equal(M.gs9d8960GrowTargetOk(0x10000000), 0);
  assert.equal(M.gs9d8960TailFillNeeded(4, 4), 0);
  assert.equal(M.gs9d8960TailFillNeeded(4, 3), 1);
  assert.equal(M.gs9d8af0CountLeCap(0x1fffffff), 1);
  assert.equal(M.gs9d8af0CountLeCap(0x20000000), 0);
  assert.equal(M.gs9d8af0ElementCount8(0x100, 0x108), 1);
  assert.equal(M.gs9d8af0ElementCount8(0x100, 0x10f), 1, "floor");
  assert.equal(M.gs9d8af0GrowthOk(0x10000000), 1, "1.5x target 0x18000000 inside cap");
  assert.equal(M.gs9d8af0GrowthOk(0x15555555), 1, "1.5x target == cap exactly");
  assert.equal(M.gs9d8af0GrowthOk(0x15555556), 0);
  assert.equal(M.gs9d8af0GrowthOk(0x40000000), 1, "wrap region: lim wraps -> throw moves to grow_target_ok");
  assert.equal(M.gs9d8af0GrowTargetCount(0x40, 0x20), 0x40, "new > 1.5x target -> new");
  assert.equal(M.gs9d8af0GrowTargetOk(0x1fffffff), 1);
  assert.equal(M.gs9d8af0GrowTargetOk(0x20000000), 0);
  assert.equal(M.gs9d8af0TailInitNeeded(8, 8), 0, "no growth -> no inline init");
  assert.equal(M.gs9d8af0TailInitNeeded(8, 0), 1);
  assert.equal(M.gs9d8af0TailInitMore(1), 0, "remaining 1 -> sub 1 -> 0");
  assert.equal(M.gs9d8af0TailInitMore(0), 1, "0 - 1 wraps -> nonzero");
  assert.equal(M.gs9d8af0CopyNeeded(0x100, 0x100), 0, "empty old range");
  assert.equal(M.gs9d8af0CopyNeeded(0x100, 0x108), 1);
  assert.equal(M.gs9d8af0CopyMore(0x108, 0x108), 0, "walk end");
  assert.equal(M.gs9d8af0CopyMore(0x100, 0x108), 1);
});

test("v13 boundary pins: wasm agrees with model at every gate edge", () => {
  const exp = loadExports();
  const M = MODEL;
  const map = {
    "9d88a0CountLeCap": M.gs9d88a0CountLeCap,
    "9d88a0GrowthOk": M.gs9d88a0GrowthOk,
    "9d88a0GrowTargetCount": M.gs9d88a0GrowTargetCount,
    "9d88a0GrowTargetOk": M.gs9d88a0GrowTargetOk,
    "9d88a0TailFillNeeded": M.gs9d88a0TailFillNeeded,
    "9d8960CountLeCap": M.gs9d8960CountLeCap,
    "9d8960GrowthOk": M.gs9d8960GrowthOk,
    "9d8960GrowTargetCount": M.gs9d8960GrowTargetCount,
    "9d8960GrowTargetOk": M.gs9d8960GrowTargetOk,
    "9d8960TailFillNeeded": M.gs9d8960TailFillNeeded,
    "9d8af0CountLeCap": M.gs9d8af0CountLeCap,
    "9d8af0GrowthOk": M.gs9d8af0GrowthOk,
    "9d8af0GrowTargetCount": M.gs9d8af0GrowTargetCount,
    "9d8af0GrowTargetOk": M.gs9d8af0GrowTargetOk,
    "9d8af0TailInitNeeded": M.gs9d8af0TailInitNeeded,
    "9d8af0TailInitMore": M.gs9d8af0TailInitMore,
    "9d8af0CopyNeeded": M.gs9d8af0CopyNeeded,
    "9d8af0CopyMore": M.gs9d8af0CopyMore,
  };
  const cases = [
    ["9d88a0CountLeCap", [0x1fffffff], [0x20000000]],
    ["9d88a0GrowthOk", [0x15555555], [0x15555556]],
    ["9d88a0GrowTargetCount", [0x10, 0x10], [0x10, 0x20]],
    ["9d88a0GrowTargetOk", [0x1fffffff], [0x20000000]],
    ["9d88a0TailFillNeeded", [0x100, 0x100], [0x100, 0x0]],
    ["9d8960CountLeCap", [0xfffffff], [0x10000000]],
    ["9d8960GrowthOk", [0x0aaaaaaa], [0x0aaaaaab]],
    ["9d8960GrowTargetCount", [0x10, 0x10], [0x10, 0x20]],
    ["9d8960GrowTargetOk", [0xfffffff], [0x10000000]],
    ["9d8960TailFillNeeded", [4, 4], [4, 3]],
    ["9d8af0CountLeCap", [0x1fffffff], [0x20000000]],
    ["9d8af0GrowthOk", [0x15555555], [0x15555556]],
    ["9d8af0GrowTargetCount", [0x10, 0x10], [0x10, 0x20]],
    ["9d8af0GrowTargetOk", [0x1fffffff], [0x20000000]],
    ["9d8af0TailInitNeeded", [8, 8], [8, 0]],
    ["9d8af0TailInitMore", [1], [2]],
    ["9d8af0CopyNeeded", [0x100, 0x100], [0x100, 0x108]],
    ["9d8af0CopyMore", [0x108, 0x108], [0x100, 0x108]],
  ];
  for (const [key, edge, near] of cases) {
    const m = map[key];
    const w = exp[key];
    assert.equal(w(...edge) >>> 0, m(...edge) >>> 0, `edge ${key}`);
    assert.equal(w(...near) >>> 0, m(...near) >>> 0, `near ${key}`);
  }
});

/* ============ ABI v14: 0x9d8be0 g_Manager can-save mode ========== */

test("ABI v14 accessors: 0x9d8be0 can-save mode census", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9d8be0Va"]() >>> 0, M.GS9D8BE0_VA);
  assert.equal(exp["9d8be0EndVa"]() >>> 0, M.GS9D8BE0_END_VA);
  assert.equal(exp["9d8be0BodyBytes"]() >>> 0, M.GS9D8BE0_BODY_BYTES);
  assert.equal(exp["9d8be0NextVa"]() >>> 0, M.GS9D8BE0_NEXT_VA);
  assert.equal(exp["9d8be0InsnCount"]() >>> 0, M.GS9D8BE0_INSN_COUNT);
  assert.equal(exp["9d8be0CallerCount"]() >>> 0, 3);
  assert.equal(exp["9d8be0CallerVaAt"](0) >>> 0, 0x98ace7);
  assert.equal(exp["9d8be0CallerVaAt"](1) >>> 0, 0x9d9e91);
  assert.equal(exp["9d8be0CallerVaAt"](2) >>> 0, 0x9db1e8);
  assert.equal(exp["9d8be0CallerVaAt"](99) >>> 0, 0, "OOB -> 0");
  assert.equal(exp["9d8be0MgrGlobal"]() >>> 0, 0xc7169c);
  assert.equal(exp["9d8be0GameGlobal"]() >>> 0, 0xc71678);
  assert.equal(exp["9d8be0Off2c9"]() >>> 0, 0x2c9);
  assert.equal(exp["9d8be0OffF18"]() >>> 0, 0xf18);
  assert.equal(exp["9d8be0Byte2c9Va"]() >>> 0, 0x9d8be6);
  assert.equal(exp["9d8be0DwordF18Va"]() >>> 0, 0x9d8c65);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_9D8BE0_VA = 0x009d8be0u/);
  assert.match(h, /isaac_game_state_9d8be0_can_save_mode\(/);
  assert.deepEqual([...peAt(0x9d8be0, 7)], [0x8b, 0x0d, 0x9c, 0x16, 0xc7, 0x00, 0x80]);
  assert.deepEqual([...peAt(0x9d8c95, 3)], [0xb0, 0x02, 0xc3]);
});

test("v14 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  assert.equal(M.gs9d8be0Byte2c9Nz(0), 0);
  assert.equal(M.gs9d8be0Byte2c9Nz(1), 1);
  assert.equal(M.gs9d8be0Byte2c9Nz(0x100), 0, "LOW-BYTE: 0x100 is closed");
  assert.equal(M.gs9d8be0ModeEq2(2), 1);
  assert.equal(M.gs9d8be0ModeEq2(0x102), 0, "FULL-dword: 0x102 is not mode 2");
  assert.equal(M.gs9d8be0GameNonzero(0), 0);
  assert.equal(M.gs9d8be0GameNonzero(0x100), 1, "FULL-dword pointer");
  assert.equal(M.gs9d8be0Dword26630Busy(0), 0);
  assert.equal(M.gs9d8be0Dword26630Busy(0x80000000), 1, "UNSIGNED ja: high bit busy");
  assert.equal(M.gs9d8be0Byte26589Nz(0x100), 0, "LOW-BYTE");
  assert.equal(M.gs9d8be0Byte19fNz(1), 1);
  assert.equal(M.gs9d8be0DwordA80Busy(1), 1);
  assert.equal(M.gs9d8be0DwordF18Positive(1), 1);
  assert.equal(M.gs9d8be0DwordF18Positive(0), 0);
  assert.equal(M.gs9d8be0DwordF18Positive(0x80000000), 0, "SIGNED jg: min-int not > 0");
  assert.equal(M.gs9d8be0Byte2c7Nz(0xff), 1);
  /* composed: 2c9 nz -> 2 */
  assert.equal(M.gs9d8be0CanSaveMode(1, 0, 0, 0, 0, 0, 0, 0, 0), 2);
  /* composed: 2c9=0x100 stays NOT 2 */
  assert.equal(M.gs9d8be0CanSaveMode(0x100, 0, 0, 0, 0, 0, 0, 0, 0), 0);
  /* composed: mode2 + game + 26630 -> 2 */
  assert.equal(M.gs9d8be0CanSaveMode(0, 2, 1, 1, 0, 0, 0, 0, 0), 2);
  /* composed: mode 0x102 must not take greed-busy ret2 */
  assert.equal(M.gs9d8be0CanSaveMode(0, 0x102, 1, 1, 0, 1, 0, 0, 0), 1);
  /* composed: 19f=0 -> 0 after not returning 2 */
  assert.equal(M.gs9d8be0CanSaveMode(0, 0, 0, 0, 0, 0, 0, 0, 0), 0);
  /* composed: 19f set, no busy, a80/f18/2c7 clear -> 1 */
  assert.equal(M.gs9d8be0CanSaveMode(0, 0, 0, 0, 0, 1, 0, 0, 0), 1);
  /* composed: f18 signed positive -> 0 */
  assert.equal(M.gs9d8be0CanSaveMode(0, 0, 0, 0, 0, 1, 0, 1, 0), 0);
  /* composed: f18 = 0x80000000 SIGNED not positive -> 1 */
  assert.equal(M.gs9d8be0CanSaveMode(0, 0, 0, 0, 0, 1, 0, 0x80000000, 0), 1);
});

test("Wasm vs JS differential: v14 0x9d8be0 can-save mode", () => {
  const exp = loadExports();
  const M = MODEL;
  const rng = mulberry32(0x9d8be0);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  const edges = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0x100, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 1, 0, 0, 0, 0, 0],
    [0, 0x102, 1, 1, 0, 1, 0, 0, 0],
    [0, 2, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0x80000000, 0],
    [0, 0, 0, 0, 0, 1, 0, 0xffffffff, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 2, 1, 0, 1, 1, 0, 0, 0],
    [0, 2, 1, 0, 0x100, 1, 0, 0, 0],
  ];
  for (const args of edges) {
    assert.equal(exp["9d8be0CanSaveMode"](...args) >>> 0,
      M.gs9d8be0CanSaveMode(...args), `edge ${args}`);
  }
  for (let i = 0; i < 80; i++) {
    const args = [rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd()];
    assert.equal(exp["9d8be0CanSaveMode"](...args) >>> 0,
      M.gs9d8be0CanSaveMode(...args), `draw ${i}`);
    assert.equal(exp["9d8be0Byte2c9Nz"](args[0]) >>> 0, M.gs9d8be0Byte2c9Nz(args[0]));
    assert.equal(exp["9d8be0ModeEq2"](args[1]) >>> 0, M.gs9d8be0ModeEq2(args[1]));
    assert.equal(exp["9d8be0GameNonzero"](args[2]) >>> 0, M.gs9d8be0GameNonzero(args[2]));
    assert.equal(exp["9d8be0Dword26630Busy"](args[3]) >>> 0, M.gs9d8be0Dword26630Busy(args[3]));
    assert.equal(exp["9d8be0Byte26589Nz"](args[4]) >>> 0, M.gs9d8be0Byte26589Nz(args[4]));
    assert.equal(exp["9d8be0Byte19fNz"](args[5]) >>> 0, M.gs9d8be0Byte19fNz(args[5]));
    assert.equal(exp["9d8be0DwordA80Busy"](args[6]) >>> 0, M.gs9d8be0DwordA80Busy(args[6]));
    assert.equal(exp["9d8be0DwordF18Positive"](args[7]) >>> 0, M.gs9d8be0DwordF18Positive(args[7]));
    assert.equal(exp["9d8be0Byte2c7Nz"](args[8]) >>> 0, M.gs9d8be0Byte2c7Nz(args[8]));
  }
});

test("v14 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeFileSync(source, toFile(bad));
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    withMutant("v14 2c9 low-byte mask dropped",
      (s) => s.replace(
        "  /* v14: cmp byte [ecx+0x2c9],0 ; jne ret2 — LOW-BYTE */\n" +
        "  const uint32_t b2c9 = mgr_2c9 & 0xffu;",
        "  /* v14: cmp byte [ecx+0x2c9],0 ; jne ret2 — LOW-BYTE */\n" +
        "  const uint32_t b2c9 = mgr_2c9;"),
      (exp) => {
        assert.equal(exp["9d8be0CanSaveMode"](0x100, 0, 0, 0, 0, 0, 0, 0, 0) >>> 0, 0,
          "0x100 must stay not-ret2");
      });
    withMutant("v14 f18 signed jg folded unsigned",
      (s) => s.replace(
        "  /* v14: cmp dword [ecx+0xf18],0 ; jg ret0 — SIGNED */\n" +
        "  if ((int64_t)(int32_t)mgr_f18 > (int64_t)0) {",
        "  /* v14: cmp dword [ecx+0xf18],0 ; jg ret0 — SIGNED */\n" +
        "  if (mgr_f18 != 0u) {"),
      (exp) => {
        assert.equal(exp["9d8be0CanSaveMode"](0, 0, 0, 0, 0, 1, 0, 0x80000000, 0) >>> 0, 1,
          "0x80000000 SIGNED must not ret0");
      });
    withMutant("v14 mode-eq-2 narrowed to low byte",
      (s) => s.replace(
        "  /* v14: cmp edx,2 FULL-dword (0x102 must NOT take the greed arm) */\n" +
        "  if (mgr_8 == ISAAC_GAME_STATE_9D8BE0_MODE_2) {",
        "  /* v14: cmp edx,2 FULL-dword (0x102 must NOT take the greed arm) */\n" +
        "  if ((mgr_8 & 0xffu) == ISAAC_GAME_STATE_9D8BE0_MODE_2) {"),
      (exp) => {
        assert.equal(exp["9d8be0CanSaveMode"](0, 0x102, 1, 1, 0, 1, 0, 0, 0) >>> 0, 1,
          "0x102 must not greed-busy ret2");
      });
    withMutant("v14 19f zero-arm inverted",
      (s) => s.replace(
        "  /* v14: cmp byte [ecx+0x19f],0 ; je ret0-arm — LOW-BYTE */\n" +
        "  if (b19f == 0u) {",
        "  /* v14: cmp byte [ecx+0x19f],0 ; je ret0-arm — LOW-BYTE */\n" +
        "  if (b19f != 0u) {"),
      (exp) => {
        assert.equal(exp["9d8be0CanSaveMode"](0, 0, 0, 0, 0, 0, 0, 0, 0) >>> 0, 0,
          "19f==0 must ret0");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});

/* ============ ABI v15: 0x9d8ca0 Manager+0x2d0 flag scan ========== */

test("ABI v15 accessors: 0x9d8ca0 flag scan census", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9d8ca0Va"]() >>> 0, M.GS9D8CA0_VA);
  assert.equal(exp["9d8ca0EndVa"]() >>> 0, M.GS9D8CA0_END_VA);
  assert.equal(exp["9d8ca0BodyBytes"]() >>> 0, M.GS9D8CA0_BODY_BYTES);
  assert.equal(exp["9d8ca0NextVa"]() >>> 0, M.GS9D8CA0_NEXT_VA);
  assert.equal(exp["9d8ca0InsnCount"]() >>> 0, 55);
  assert.equal(exp["9d8ca0CallerCount"]() >>> 0, 3);
  assert.equal(exp["9d8ca0CallerVaAt"](0) >>> 0, 0x98acf3);
  assert.equal(exp["9d8ca0CallerVaAt"](1) >>> 0, 0x9d9e99);
  assert.equal(exp["9d8ca0CallerVaAt"](2) >>> 0, 0x9db1f0);
  assert.equal(exp["9d8ca0CallerVaAt"](99) >>> 0, 0);
  assert.equal(exp["9d8ca0RowEnd"]() >>> 0, 0xc375e0);
  assert.equal(exp["9d8ca0FlagMask"]() >>> 0, 0xc);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_9D8CA0_VA = 0x009d8ca0u/);
  assert.deepEqual([...peAt(0x9d8ca0, 5)], [0x55, 0x8b, 0xec, 0x83, 0xec]);
  assert.deepEqual([...peAt(0x9d8d40, 1)], [0xc3]);
});

test("v15 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  assert.equal(M.gs9d8ca0OuterDone(0x14), 1);
  assert.equal(M.gs9d8ca0OuterDone(0x13), 0);
  assert.equal(M.gs9d8ca0InnerMore(0xb), 1);
  assert.equal(M.gs9d8ca0InnerMore(0xc), 0, "UNSIGNED 0xc not more");
  assert.equal(M.gs9d8ca0EdxGeEnd(0xc375e0), 1);
  assert.equal(M.gs9d8ca0EdxGeEnd(0xc375df), 0);
  assert.equal(M.gs9d8ca0EdxGeEnd(0x80000000), 0, "SIGNED: min-int not >= end");
  assert.equal(M.gs9d8ca0SkipCellLoad(0), 1);
  assert.equal(M.gs9d8ca0SkipCellLoad(0x80000000), 0);
  assert.equal(M.gs9d8ca0TableIndex(0), 0);
  assert.equal(M.gs9d8ca0TableIndex(3), 4);
  assert.equal(M.gs9d8ca0TableIndex(8), 0xc);
  assert.equal(M.gs9d8ca0TableIndex(11), 0xe);
  assert.equal(M.gs9d8ca0TableIndex(12), 0);
  assert.equal(M.gs9d8ca0FlagOk(0), 0);
  assert.equal(M.gs9d8ca0FlagOk(0x4), 1);
  assert.equal(M.gs9d8ca0FlagOk(0x8), 1);
  assert.equal(M.gs9d8ca0FlagOk(0x1), 0, "bit 0 not in mask 0xc");
  assert.equal(M.gs9d8ca0FlagOk(0x100), 0, "LOW-BYTE");
  assert.equal(M.gs9d8ca0FlagOk(0x10c), 1);
  assert.equal(M.gs9d8ca0CellEcx(0, 5), 0, "null edx -> ecx 0");
  assert.equal(M.gs9d8ca0CellEcx(0xc35ed0, 5), 5);
  assert.equal(M.gs9d8ca0ByteOff(0), 0x2d0);
  assert.equal(M.gs9d8ca0ByteOff(1), 0x2d4);
  const edx19 = (0xc35ed0 + 19 * 0x90) >>> 0;
  assert.equal(M.gs9d8ca0AfterRow(19, edx19), 1, "20th row succeeds via edi==0x14");
  assert.equal(M.gs9d8ca0AfterRow(0, 0xc35ed0), 0, "first row continues");
  assert.equal(M.gs9d8ca0AfterRow(0, 0xc375e0 - 0x90), 1, "edx end fallthrough success");
});

test("Wasm vs JS differential: v15 0x9d8ca0 flag scan", () => {
  const exp = loadExports();
  const M = MODEL;
  const rng = mulberry32(0x9d8ca0);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  const table = [0, 1, 2, 4, 5, 3, 6, 9, 0xc, 7, 0xd, 0xe];
  for (let i = 0; i < 12; i++) {
    assert.equal(exp["9d8ca0TableIndex"](i) >>> 0, table[i], `table ${i}`);
  }
  const edges = [
    [0x14, 0xc375e0, 0xc, 0, 0],
    [0x13, 0xc375df, 0xb, 1, 0x4],
    [0, 0x80000000, 0, 5, 0x100],
    [19, (0xc35ed0 + 19 * 0x90) >>> 0, 0xc, 7, 0x8],
  ];
  for (const [edi, edx, eax, loaded, byte] of edges) {
    assert.equal(exp["9d8ca0OuterDone"](edi) >>> 0, M.gs9d8ca0OuterDone(edi));
    assert.equal(exp["9d8ca0EdxGeEnd"](edx) >>> 0, M.gs9d8ca0EdxGeEnd(edx));
    assert.equal(exp["9d8ca0SkipCellLoad"](edx) >>> 0, M.gs9d8ca0SkipCellLoad(edx));
    assert.equal(exp["9d8ca0InnerMore"](eax) >>> 0, M.gs9d8ca0InnerMore(eax));
    assert.equal(exp["9d8ca0CellEcx"](edx, loaded) >>> 0, M.gs9d8ca0CellEcx(edx, loaded));
    assert.equal(exp["9d8ca0FlagOk"](byte) >>> 0, M.gs9d8ca0FlagOk(byte));
    assert.equal(exp["9d8ca0AfterRow"](edi, edx) >>> 0, M.gs9d8ca0AfterRow(edi, edx));
  }
  for (let i = 0; i < 80; i++) {
    const edi = rnd(), edx = rnd(), eax = rnd(), loaded = rnd(), byte = rnd();
    assert.equal(exp["9d8ca0OuterDone"](edi) >>> 0, M.gs9d8ca0OuterDone(edi));
    assert.equal(exp["9d8ca0EdxGeEnd"](edx) >>> 0, M.gs9d8ca0EdxGeEnd(edx));
    assert.equal(exp["9d8ca0EdxIsNull"](edx) >>> 0, M.gs9d8ca0EdxIsNull(edx));
    assert.equal(exp["9d8ca0SkipCellLoad"](edx) >>> 0, M.gs9d8ca0SkipCellLoad(edx));
    assert.equal(exp["9d8ca0InnerMore"](eax) >>> 0, M.gs9d8ca0InnerMore(eax));
    assert.equal(exp["9d8ca0TableIndex"](eax) >>> 0, M.gs9d8ca0TableIndex(eax));
    assert.equal(exp["9d8ca0FlagOk"](byte) >>> 0, M.gs9d8ca0FlagOk(byte));
    assert.equal(exp["9d8ca0RowNext"](edx) >>> 0, M.gs9d8ca0RowNext(edx));
    assert.equal(exp["9d8ca0CellEcx"](edx, loaded) >>> 0, M.gs9d8ca0CellEcx(edx, loaded));
    assert.equal(exp["9d8ca0ByteOff"](loaded) >>> 0, M.gs9d8ca0ByteOff(loaded));
    assert.equal(exp["9d8ca0AfterRow"](edi, edx) >>> 0, M.gs9d8ca0AfterRow(edi, edx));
  }
});

test("v15 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeFileSync(source, toFile(bad));
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    withMutant("v15 outer 0x14 folded to 0x15",
      (s) => s.replace(
        "/* v15: cmp edi,0x14 ; je success */\n" +
        "extern \"C\" int32_t isaac_game_state_9d8ca0_outer_done(uint32_t edi) {\n" +
        "  return (edi == ISAAC_GAME_STATE_9D8CA0_OUTER_COUNT) ? 1 : 0;\n" +
        "}",
        "/* v15: cmp edi,0x14 ; je success */\n" +
        "extern \"C\" int32_t isaac_game_state_9d8ca0_outer_done(uint32_t edi) {\n" +
        "  return (edi == 0x15u) ? 1 : 0;\n" +
        "}"),
      (exp) => {
        assert.equal(exp["9d8ca0OuterDone"](0x14) >>> 0, 1, "edi==0x14 must be done");
      });
    withMutant("v15 inner < 0xc folded to <=",
      (s) => s.replace(
        "/* v15: cmp eax,0xc ; jb inner — UNSIGNED */\n" +
        "extern \"C\" int32_t isaac_game_state_9d8ca0_inner_more(uint32_t eax) {\n" +
        "  return (eax < ISAAC_GAME_STATE_9D8CA0_INNER_COUNT) ? 1 : 0;\n" +
        "}",
        "/* v15: cmp eax,0xc ; jb inner — UNSIGNED */\n" +
        "extern \"C\" int32_t isaac_game_state_9d8ca0_inner_more(uint32_t eax) {\n" +
        "  return (eax <= ISAAC_GAME_STATE_9D8CA0_INNER_COUNT) ? 1 : 0;\n" +
        "}"),
      (exp) => {
        assert.equal(exp["9d8ca0InnerMore"](0xc) >>> 0, 0, "eax==0xc must stop");
      });
    withMutant("v15 edx>=end SIGNED folded unsigned",
      (s) => s.replace(
        "  return ((int64_t)(int32_t)edx >=\n" +
        "          (int64_t)(int32_t)ISAAC_GAME_STATE_9D8CA0_ROW_END)\n" +
        "             ? 1\n" +
        "             : 0;",
        "  return (edx >= ISAAC_GAME_STATE_9D8CA0_ROW_END) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9d8ca0EdxGeEnd"](0x80000000) >>> 0, 0,
          "SIGNED min-int must not be >= end");
      });
    withMutant("v15 flag mask 0xc dropped",
      (s) => s.replace(
        "  const uint32_t b = byte & 0xffu;\n" +
        "  return ((b & ISAAC_GAME_STATE_9D8CA0_FLAG_MASK) != 0u) ? 1 : 0;",
        "  const uint32_t b = byte & 0xffu;\n" +
        "  return (b != 0u) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9d8ca0FlagOk"](1) >>> 0, 0, "bit0 must fail mask 0xc");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});

/* ============ ABI v16: 0x9dc6e0 zero-init ctor ========== */

test("ABI v16 accessors: 0x9dc6e0 zero-init ctor census + PE byte-truth", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9dc6e0Va"]() >>> 0, M.GS9DC6E0_VA);
  assert.equal(exp["9dc6e0EndVa"]() >>> 0, M.GS9DC6E0_END_VA);
  assert.equal(exp["9dc6e0BodyBytes"]() >>> 0, M.GS9DC6E0_BODY_BYTES);
  assert.equal(exp["9dc6e0NextVa"]() >>> 0, M.GS9DC6E0_NEXT_VA);
  assert.equal(exp["9dc6e0InsnCount"]() >>> 0, 16);
  assert.equal(exp["9dc6e0NewVa"]() >>> 0, 0xa0f4c0);
  assert.equal(exp["9dc6e0ObjSize"]() >>> 0, 0x38);
  assert.equal(exp["9dc6e0Magic"]() >>> 0, 0x12345678);
  assert.equal(exp["9dc6e0MagicOff"]() >>> 0, 0x08);
  assert.equal(exp["9dc6e0StoreCount"]() >>> 0, 14);
  assert.equal(exp["9dc6e0ZeroCount"]() >>> 0, 13);
  assert.equal(exp["9dc6e0CallerCount"]() >>> 0, 2);
  assert.equal(exp["9dc6e0CallerVaAt"](0) >>> 0, 0x9dce5a);
  assert.equal(exp["9dc6e0CallerVaAt"](1) >>> 0, 0x9dfcd6);
  assert.equal(exp["9dc6e0CallerVaAt"](99) >>> 0, 0);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_9DC6E0_VA = 0x009dc6e0u/);
  assert.match(h, /ISAAC_GAME_STATE_9DC6E0_END_VA = 0x009dc744u/);
  assert.match(h, /ISAAC_GAME_STATE_9DC6E0_NEXT_VA = 0x009dc750u/);
  assert.match(h, /ISAAC_GAME_STATE_9DC6E0_MAGIC_STAMP_VA = 0x009dc6efu/);
  assert.match(h, /ISAAC_GAME_STATE_9DC6E0_RET_EAX_VA = 0x009dc6e6u/);
  // PE byte-truth: body opens with the +0x00 zero store, mov eax,ecx,
  // the magic stamp insn, and the bare ret.
  assert.deepEqual([...peAt(0x9dc6e0, 6)], [0xc7, 0x01, 0x00, 0x00, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9dc6e6, 2)], [0x8b, 0xc1]);
  assert.deepEqual(
    [...peAt(0x9dc6ef, 7)],
    [0xc7, 0x41, 0x08, 0x78, 0x56, 0x34, 0x12],
  );
  assert.deepEqual([...peAt(0x9dc743, 1)], [0xc3]);
});

test("v16 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  const dv = new DataView(new ArrayBuffer(0x100));
  for (let i = 0; i < 0x100; i++) dv.setUint8(i, 0xa5);
  M.gs9dc6e0ZeroDwords(dv, 0x40);
  for (const off of M.GS9DC6E0_ZERO_OFFS) {
    assert.equal(dv.getUint32(0x40 + off, true), 0, `zero @+${off.toString(16)}`);
  }
  // bytes outside the covered dwords keep their dirty marker
  assert.equal(dv.getUint8(0x3f), 0xa5, "pre-object byte untouched");
  assert.equal(dv.getUint8(0x78), 0xa5, "post-object byte untouched");
  // magic stamp writes exactly 78 56 34 12 LE at +0x08
  M.gs9dc6e0MagicStamp(dv, 0x40);
  assert.equal(dv.getUint32(0x48, true), 0x12345678, "magic LE at this+0x08");
  assert.equal(dv.getUint8(0x48), 0x78, "low byte first");
  assert.equal(dv.getUint8(0x4b), 0x12, "high byte last");
  // return_this is identity, NOT return-0
  assert.equal(M.gs9dc6e0ReturnThis(0), 0);
  assert.equal(M.gs9dc6e0ReturnThis(0x1234), 0x1234);
  assert.notEqual(M.gs9dc6e0ReturnThis(0xbeef), 0, "not return-0");
  // zero-offset set is exactly the census set (no dupes, none missing)
  assert.deepEqual(
    [...M.GS9DC6E0_ZERO_OFFS].sort((a, b) => a - b),
    [0x00, 0x04, 0x0c, 0x10, 0x14, 0x18, 0x1c, 0x20, 0x24, 0x28, 0x2c, 0x30, 0x34],
  );
});

test("Wasm vs JS differential: v16 zero-init ctor", () => {
  const exp = loadExports();
  const M = MODEL;
  const VIEW = new DataView(exp.memory.buffer);
  const WASM_BASE = 0x300000; /* wasm arm arena (< 16 MB linear mem) */
  const JS_BASE = 0x700000; /* oracle twin arena */
  const rng = mulberry32(0x9dc6e0);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  for (let i = 0; i < 80; i++) {
    const thisOff = Math.floor(rng() * 0x41); /* 0..0x40: slot stays < 0x80 */
    const wa = WASM_BASE + i * 0x80;
    const ja = JS_BASE + i * 0x80;
    const dirty = [];
    for (let b = 0; b < 0x80; b++) {
      const byte = rnd() & 0xff;
      VIEW.setUint8(wa + b, byte);
      VIEW.setUint8(ja + b, byte);
      if (byte !== 0) dirty.push(b);
    }
    exp["9dc6e0ZeroDwords"](wa, thisOff);
    exp["9dc6e0MagicStamp"](wa, thisOff);
    M.gs9dc6e0ZeroDwords(new DataView(exp.memory.buffer, ja), thisOff);
    M.gs9dc6e0MagicStamp(new DataView(exp.memory.buffer, ja), thisOff);
    // behavioural: every zero dword is 0 and the magic is stamped
    for (const off of M.GS9DC6E0_ZERO_OFFS) {
      assert.equal(VIEW.getUint32(wa + thisOff + off, true), 0,
        `draw ${i} zero @+${off.toString(16)}`);
    }
    assert.equal(VIEW.getUint32(wa + thisOff + 0x08, true) >>> 0, 0x12345678,
      `draw ${i} magic`);
    // wasm vs oracle: identical final bytes over the whole slot
    for (const b of dirty) {
      assert.equal(VIEW.getUint8(wa + b), VIEW.getUint8(ja + b),
        `draw ${i} byte ${b} wasm-vs-oracle`);
    }
  }
  // pure scalar law: full-u32 differential draws
  for (let i = 0; i < 80; i++) {
    const t = rnd();
    assert.equal(exp["9dc6e0ReturnThis"](t) >>> 0, M.gs9dc6e0ReturnThis(t),
      `return-this draw ${i}`);
  }
  // edge draws on return_this
  for (const t of [0, 1, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(exp["9dc6e0ReturnThis"](t) >>> 0, t >>> 0, `edge ${t}`);
  }
});

test("v16 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeFileSync(source, toFile(bad));
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    withMutant("v16 magic stamp dropped",
      (s) => s.replace(
        "  const uint32_t addr = this_off + ISAAC_GAME_STATE_9DC6E0_MAGIC_OFF;\n" +
        "  const uint32_t v = ISAAC_GAME_STATE_9DC6E0_MAGIC;\n" +
        "  mem[addr + 0u] = static_cast<uint8_t>((v >> 0) & 0xffu);\n" +
        "  mem[addr + 1u] = static_cast<uint8_t>((v >> 8) & 0xffu);\n" +
        "  mem[addr + 2u] = static_cast<uint8_t>((v >> 16) & 0xffu);\n" +
        "  mem[addr + 3u] = static_cast<uint8_t>((v >> 24) & 0xffu);",
        "  (void)mem;\n" +
        "  (void)this_off;"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        VIEW.setUint32(0x400000 + 0x08, 0xdeadbeef, true);
        exp["9dc6e0MagicStamp"](0x400000, 0);
        assert.equal(VIEW.getUint32(0x400000 + 0x08, true) >>> 0, 0x12345678,
          "magic must overwrite dirty marker");
      });
    withMutant("v16 magic offset slip 0x8 -> 0x9",
      (s) => s.replace(
        "  const uint32_t addr = this_off + ISAAC_GAME_STATE_9DC6E0_MAGIC_OFF;",
        "  const uint32_t addr = this_off + 0x9u;"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        VIEW.setUint32(0x400000 + 0x08, 0xdeadbeef, true);
        exp["9dc6e0MagicStamp"](0x400000, 0);
        assert.equal(VIEW.getUint32(0x400000 + 0x08, true) >>> 0, 0x12345678,
          "magic must land at +0x08, not +0x09");
      });
    withMutant("v16 magic value slip 0x12345678 -> 0x12345679",
      (s) => s.replace(
        "  const uint32_t v = ISAAC_GAME_STATE_9DC6E0_MAGIC;",
        "  const uint32_t v = 0x12345679u;"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        VIEW.setUint32(0x400000 + 0x08, 0xdeadbeef, true);
        exp["9dc6e0MagicStamp"](0x400000, 0);
        assert.equal(VIEW.getUint32(0x400000 + 0x08, true) >>> 0, 0x12345678,
          "magic value must be exactly 0x12345678");
      });
    withMutant("v16 return-this folded to return-0",
      (s) => s.replace(
        "extern \"C\" uint32_t isaac_game_state_9dc6e0_return_this(uint32_t this_off) {\n" +
        "  return this_off;\n" +
        "}",
        "extern \"C\" uint32_t isaac_game_state_9dc6e0_return_this(uint32_t this_off) {\n" +
        "  (void)this_off;\n" +
        "  return 0u;\n" +
        "}"),
      (exp) => {
        assert.equal(exp["9dc6e0ReturnThis"](0xbeef) >>> 0, 0xbeef,
          "receiver must be returned unchanged");
      });
    withMutant("v16 one zero offset dropped (+0x14 -> dup +0x04)",
      (s) => s.replace(
        "    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_4,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_5,",
        "    ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_1,  ISAAC_GAME_STATE_9DC6E0_ZERO_OFF_5,"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        VIEW.setUint32(0x400010 + 0x14, 0xcafebabe, true);
        exp["9dc6e0ZeroDwords"](0x400010, 0);
        assert.equal(VIEW.getUint32(0x400010 + 0x14, true), 0,
          "+0x14 must be zeroed by K1");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});

/* ============ ABI v17: 0x9e0150 complement-index vector fetch ========== */

test("ABI v17 accessors: 0x9e0150 complement-index vector fetch census + PE byte-truth", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9e0150Va"]() >>> 0, M.GS9E0150_VA);
  assert.equal(exp["9e0150EndVa"]() >>> 0, M.GS9E0150_END_VA);
  assert.equal(exp["9e0150BodyBytes"]() >>> 0, M.GS9E0150_BODY_BYTES);
  assert.equal(exp["9e0150NextVa"]() >>> 0, M.GS9E0150_NEXT_VA);
  assert.equal(exp["9e0150InsnCount"]() >>> 0, 22);
  assert.equal(exp["9e0150NotVa"]() >>> 0, 0x9e0156);
  assert.equal(exp["9e0150JsGateVa"]() >>> 0, 0x9e015b);
  assert.equal(exp["9e0150SubVa"]() >>> 0, 0x9e0162);
  assert.equal(exp["9e0150SarVa"]() >>> 0, 0x9e0164);
  assert.equal(exp["9e0150CmpVa"]() >>> 0, 0x9e0167);
  assert.equal(exp["9e0150JgeGateVa"]() >>> 0, 0x9e0169);
  assert.equal(exp["9e0150InnerLoadVa"]() >>> 0, 0x9e016b);
  assert.equal(exp["9e0150OuterLoadVa"]() >>> 0, 0x9e016f);
  assert.equal(exp["9e0150RetOkVa"]() >>> 0, 0x9e0172);
  assert.equal(exp["9e0150RetNullVa"]() >>> 0, 0x9e0179);
  assert.equal(exp["9e0150CallerCount"]() >>> 0, 1);
  assert.equal(exp["9e0150CallerVaAt"](0) >>> 0, 0x5c02f1);
  assert.equal(exp["9e0150CallerVaAt"](99) >>> 0, 0);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_9E0150_VA = 0x009e0150u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0150_END_VA = 0x009e017cu/);
  assert.match(h, /ISAAC_GAME_STATE_9E0150_NEXT_VA = 0x009e0180u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0150_JS_GATE_VA = 0x009e015bu/);
  assert.match(h, /ISAAC_GAME_STATE_9E0150_JGE_GATE_VA = 0x009e0169u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0150_OUTER_LOAD_VA = 0x009e016fu/);
  // PE byte-truth: prologue+arg load, FULL-dword NOT, js, sar, jge,
  // both ret 4 exits, and the single caller E8.
  assert.deepEqual([...peAt(0x9e0150, 6)], [0x55, 0x8b, 0xec, 0x8b, 0x55, 0x08]);
  assert.deepEqual([...peAt(0x9e0156, 2)], [0xf7, 0xd2]);
  assert.deepEqual([...peAt(0x9e015b, 2)], [0x78, 0x18]);
  assert.deepEqual([...peAt(0x9e0164, 3)], [0xc1, 0xf8, 0x02]);
  assert.deepEqual([...peAt(0x9e0169, 2)], [0x7d, 0x0a]);
  assert.deepEqual([...peAt(0x9e0172, 3)], [0xc2, 0x04, 0x00]);
  assert.deepEqual([...peAt(0x9e0179, 3)], [0xc2, 0x04, 0x00]);
  assert.deepEqual([...peAt(0x5c02f1, 5)], [0xe8, 0x5a, 0xfe, 0x41, 0x00]);
});

test("v17 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  // O1: FULL-dword NOT sign edges (both arms exercised)
  assert.equal(M.gs9e0150NotNonneg(0), 0, "~0 = -1 -> null");
  assert.equal(M.gs9e0150NotNonneg(0xffffffff), 1, "~0xffffffff = 0 -> pass");
  assert.equal(M.gs9e0150NotNonneg(0x80000000), 1, "~0x80000000 = 0x7fffffff");
  assert.equal(M.gs9e0150NotNonneg(0x7fffffff), 0, "~0x7fffffff is negative");
  assert.equal(M.gs9e0150NotNonneg(0x100), 0, "high bits matter: no byte mask");
  // O2: strict SIGNED idx < count; arithmetic span shift
  assert.equal(M.gs9e0150IdxLtCount(0xfffffffc, 0x100, 0x110), 1, "idx 3 < count 4");
  assert.equal(M.gs9e0150IdxLtCount(0xfffffffb, 0x100, 0x110), 0, "idx == count rejected");
  assert.equal(M.gs9e0150IdxLtCount(0xffffffff, 0x100, 0x110), 1, "idx 0 < count 4");
  assert.equal(M.gs9e0150IdxLtCount(0xffffffff, 0x110, 0x100), 0, "negative span: count -4 closes gate");
  assert.equal(M.gs9e0150IdxLtCount(0xffffffff, 0x500, 0x4fc), 0, "sar keeps sign: span 0xfffffffc -> count -1");
  assert.notEqual(
    M.gs9e0150IdxLtCount(0xfffffffe, 0x100, 0x10b),
    M.gs9e0150IdxLtCount(0xfffffffd, 0x100, 0x10b),
    "non-multiple span floor-div edge flips",
  );
  // O3 composite on a scratch buffer: hit path + both null gates
  const dv = new DataView(new ArrayBuffer(0x100));
  const u32 = (a, w) => dv.setUint32(a, w >>> 0, true);
  u32(0x10, 0x20); u32(0x14, 0x28); /* vec {begin=0x20, end=0x28}: count 1 */
  u32(0x20, 0x60); /* elem[0] -> 0x60 */
  u32(0x60, 0x1234); /* *elem */
  assert.equal(M.gs9e0150Fetch(dv, 0x10, 0xffffffff), 0x1234, "hit path double-deref");
  assert.equal(M.gs9e0150Fetch(dv, 0x10, 0), 0, "v=0 -> ~v=-1 -> js null");
  assert.equal(M.gs9e0150Fetch(dv, 0x10, 0xfffffffe), 0, "idx==count -> jge null");
});

test("Wasm vs JS differential: v17 complement-index vector fetch", () => {
  const exp = loadExports();
  const M = MODEL;
  const VIEW = new DataView(exp.memory.buffer);
  const BASE = 0x300000; /* nonzero arena base (< 16 MB linear mem) */
  const SLOT = 0x1000;
  const rng = mulberry32(0x9e0150);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  // scalar laws: deterministic full-u32 differential draws
  for (let i = 0; i < 200; i++) {
    const v = rnd(), b = rnd(), e = rnd();
    assert.equal(exp["9e0150NotNonneg"](v) >>> 0, M.gs9e0150NotNonneg(v),
      `O1 draw ${i}`);
    assert.equal(exp["9e0150IdxLtCount"](v, b, e) >>> 0,
      M.gs9e0150IdxLtCount(v, b, e), `O2 draw ${i}`);
  }
  // boundary edges (mutant discriminators) wasm-vs-model
  for (const v of [0, 1, 0x7fffffff, 0x80000000, 0xfffffffe, 0xffffffff, 0x100]) {
    assert.equal(exp["9e0150NotNonneg"](v) >>> 0, M.gs9e0150NotNonneg(v),
      `O1 edge ${v}`);
  }
  const o2Edges = [
    [0xfffffffc, 0x100, 0x110], [0xfffffffb, 0x100, 0x110],
    [0xffffffff, 0x100, 0x110], [0xffffffff, 0x110, 0x100],
    [0xffffffff, 0x500, 0x4fc], [0xfffffffe, 0x100, 0x10b],
    [0xfffffffd, 0x100, 0x10b],
  ];
  for (const [v, b, e] of o2Edges) {
    assert.equal(exp["9e0150IdxLtCount"](v, b, e) >>> 0,
      M.gs9e0150IdxLtCount(v, b, e), `O2 edge ${v} [${b},${e})`);
  }
  // O3 composite: structured slots, wasm vs oracle over the SAME bytes
  for (let i = 0; i < 80; i++) {
    const vecRel = i * SLOT;
    const arrRel = vecRel + 0x40;
    const payRel = vecRel + 0x80;
    const n = 1 + (rnd() % 6);
    VIEW.setUint32(BASE + vecRel, arrRel >>> 0, true);
    VIEW.setUint32(BASE + vecRel + 4, (arrRel + n * 4) >>> 0, true);
    for (let k = 0; k < 8; k++) {
      VIEW.setUint32(BASE + arrRel + k * 4, (payRel + k * 4) >>> 0, true);
      VIEW.setUint32(BASE + payRel + k * 4, (0xc0ffee000 + i * 8 + k) >>> 0, true);
    }
    const sub = new DataView(exp.memory.buffer, BASE);
    for (let k = 0; k < n + 2; k++) {
      const v = (~k) >>> 0;
      const got = exp["9e0150Fetch"](BASE, vecRel, v) >>> 0;
      assert.equal(got, M.gs9e0150Fetch(sub, vecRel, v) >>> 0,
        `draw ${i} k=${k} wasm-vs-oracle`);
      if (k < n) {
        assert.equal(got, (0xc0ffee000 + i * 8 + k) >>> 0,
          `draw ${i} k=${k} hit value`);
      } else {
        assert.equal(got, 0, `draw ${i} k=${k} out-of-range null`);
      }
    }
    // forced SIGNED-negative idx (top bit of v clear) -> null on both sides
    for (const v of [0, rnd() >>> 1]) {
      assert.equal(exp["9e0150Fetch"](BASE, vecRel, v >>> 0) >>> 0, 0,
        `draw ${i} negative-idx null`);
      assert.equal(M.gs9e0150Fetch(sub, vecRel, v >>> 0), 0,
        `draw ${i} negative-idx oracle null`);
    }
  }
});

test("v17 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  /* Windows AV/indexer/peer-snapshot locks can briefly EBUSY a fresh
     write during the write->compile->restore cycle; retry with backoff
     so a transient share violation cannot strand a mutant on disk. */
  const writeRetry = (data, label) => {
    for (let attempt = 0; ; attempt++) {
      try {
        writeFileSync(source, data);
        return;
      } catch (e) {
        if (attempt >= 9) throw e;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
          25 * (attempt + 1));
        void label;
      }
    }
  };
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeRetry(toFile(bad), label);
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeRetry(original, label);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    withMutant("v17 js gate dropped (negative idx reaches deref)",
      (s) => s.replace(
        "  const uint32_t idx = ~v; /* not @0x9e0156 */\n" +
        "  if ((int64_t)(int32_t)idx < 0) {\n" +
        "    return 0u; /* js @0x9e015b */\n" +
        "  }",
        "  const uint32_t idx = ~v; /* not @0x9e0156 */"),
      (exp) => {
        /* mem=MEMBASE; every stored dword and vec_off is MEMBASE-relative
           (the cpp computes mem[addr] == linear[MEMBASE + addr]). */
        const VIEW = new DataView(exp.memory.buffer);
        const MEMBASE = 0x400000;
        const VEC = 0x100, E = 0x200, P = 0x300; /* rel */
        VIEW.setUint32(MEMBASE + VEC, E, true);
        VIEW.setUint32(MEMBASE + VEC + 4, E + 4, true); /* count 1 */
        VIEW.setUint32(MEMBASE + E - 4, P, true); /* elem[-1] via wrap */
        VIEW.setUint32(MEMBASE + P, 0xc0ffee, true);
        assert.equal(exp["9e0150Fetch"](MEMBASE, VEC, 0) >>> 0, 0,
          "v=0 (~v=-1) must be nulled by the js gate");
      });
    withMutant("v17 jge loosened to jg (idx==count accepted)",
      (s) => s.replace(
        "  if ((int64_t)(int32_t)idx >= (int64_t)count) {",
        "  if ((int64_t)(int32_t)idx > (int64_t)count) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        const MEMBASE = 0x400000;
        const VEC = 0x100, E = 0x200, P = 0x300; /* rel */
        VIEW.setUint32(MEMBASE + VEC, E, true);
        VIEW.setUint32(MEMBASE + VEC + 4, E + 4, true); /* count 1 */
        VIEW.setUint32(MEMBASE + E, P, true);
        VIEW.setUint32(MEMBASE + E + 4, P, true); /* elem slot AT idx==count */
        VIEW.setUint32(MEMBASE + P, 0xc0ffee, true);
        assert.equal(exp["9e0150Fetch"](MEMBASE, VEC, 0xfffffffe) >>> 0, 0,
          "idx==count must be nulled by the jge gate");
      });
    withMutant("v17 sar -> shr (count loses sign)",
      (s) => s.replace(
        "  const int32_t count = static_cast<int32_t>(end - begin) >> 2;",
        "  const int32_t count = static_cast<int32_t>((end - begin) >> 2);"),
      (exp) => {
        assert.equal(exp["9e0150IdxLtCount"](0xffffffff, 0x500, 0x4fc) >>> 0, 0,
          "span 0xfffffffc must sar to count -1 (gate closed), not shr to 0x3fffffff");
      });
    withMutant("v17 outer deref dropped (returns elem not *elem)",
      (s) => s.replace(
        "  return isaac_game_state_9e0150_load_u32(mem, elem); /* outer @0x9e016f */",
        "  return elem;"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        const MEMBASE = 0x400000;
        const VEC = 0x100, E = 0x200, P = 0x300; /* rel */
        VIEW.setUint32(MEMBASE + VEC, E, true);
        VIEW.setUint32(MEMBASE + VEC + 4, E + 4, true); /* count 1 */
        VIEW.setUint32(MEMBASE + E, P, true);
        VIEW.setUint32(MEMBASE + P, 0x1234, true);
        assert.equal(exp["9e0150Fetch"](MEMBASE, VEC, 0xffffffff) >>> 0, 0x1234,
          "must return *elem (0x1234), not the elem pointer");
      });
    withMutant("v17 NOT masked to low byte",
      (s) => s.replace(
        "  const uint32_t idx = ~v;\n" +
        "  return ((int64_t)(int32_t)idx >= 0) ? 1 : 0;",
        "  const uint32_t idx = (~v) & 0xffu;\n" +
        "  return ((int64_t)(int32_t)idx >= 0) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9e0150NotNonneg"](0x100) >>> 0, 0,
          "~0x100 is negative FULL-dword; a byte mask would flip the gate");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});

/* ============ ABI v18: 0x9e0180 complement-index element fetch ========== */

test("ABI v18 accessors: 0x9e0180 complement-index element fetch census + PE byte-truth", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9e0180Va"]() >>> 0, M.GS9E0180_VA);
  assert.equal(exp["9e0180EndVa"]() >>> 0, M.GS9E0180_END_VA);
  assert.equal(exp["9e0180BodyBytes"]() >>> 0, M.GS9E0180_BODY_BYTES);
  assert.equal(exp["9e0180NextVa"]() >>> 0, M.GS9E0180_NEXT_VA);
  assert.equal(exp["9e0180InsnCount"]() >>> 0, 15);
  assert.equal(exp["9e0180NotVa"]() >>> 0, 0x9e0186);
  assert.equal(exp["9e0180JsGateVa"]() >>> 0, 0x9e018a);
  assert.equal(exp["9e0180SubVa"]() >>> 0, 0x9e0191);
  assert.equal(exp["9e0180SarVa"]() >>> 0, 0x9e0193);
  assert.equal(exp["9e0180CmpVa"]() >>> 0, 0x9e0196);
  assert.equal(exp["9e0180JgeGateVa"]() >>> 0, 0x9e0198);
  assert.equal(exp["9e0180ElemLoadVa"]() >>> 0, 0x9e019a);
  assert.equal(exp["9e0180RetOkVa"]() >>> 0, 0x9e019e);
  assert.equal(exp["9e0180RetNullVa"]() >>> 0, 0x9e01a4);
  assert.equal(exp["9e0180CallerCount"]() >>> 0, 2);
  assert.equal(exp["9e0180CallerVaAt"](0) >>> 0, 0x6e7ff5);
  assert.equal(exp["9e0180CallerVaAt"](1) >>> 0, 0x6e818a);
  assert.equal(exp["9e0180CallerVaAt"](99) >>> 0, 0);
  assert.equal(exp["9e0180GameVecOff"]() >>> 0, 0x67758);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_9E0180_VA = 0x009e0180u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0180_END_VA = 0x009e01a7u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0180_NEXT_VA = 0x009e01b0u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0180_JS_GATE_VA = 0x009e018au/);
  assert.match(h, /ISAAC_GAME_STATE_9E0180_JGE_GATE_VA = 0x009e0198u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0180_ELEM_LOAD_VA = 0x009e019au/);
  assert.match(h, /ISAAC_GAME_STATE_9E0180_GAME_VEC_OFF = 0x67758u/);
  // PE byte-truth: prologue+arg load, FULL-dword NOT, js, sar, jge,
  // both ret 4 exits, and both caller E8s.
  assert.deepEqual([...peAt(0x9e0180, 6)], [0x55, 0x8b, 0xec, 0x8b, 0x45, 0x08]);
  assert.deepEqual([...peAt(0x9e0186, 2)], [0xf7, 0xd0]);
  assert.deepEqual([...peAt(0x9e018a, 2)], [0x78, 0x15]);
  assert.deepEqual([...peAt(0x9e0193, 3)], [0xc1, 0xf9, 0x02]);
  assert.deepEqual([...peAt(0x9e0198, 2)], [0x7d, 0x07]);
  assert.deepEqual([...peAt(0x9e019e, 3)], [0xc2, 0x04, 0x00]);
  assert.deepEqual([...peAt(0x9e01a4, 3)], [0xc2, 0x04, 0x00]);
  assert.deepEqual([...peAt(0x6e7ff5, 5)], [0xe8, 0x86, 0x81, 0x2f, 0x00]);
  assert.deepEqual([...peAt(0x6e818a, 5)], [0xe8, 0xf1, 0x7f, 0x2f, 0x00]);
});

test("v18 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  // P1: FULL-dword NOT sign edges (both arms exercised)
  assert.equal(M.gs9e0180NotNonneg(0), 0, "~0 = -1 -> null");
  assert.equal(M.gs9e0180NotNonneg(0xffffffff), 1, "~0xffffffff = 0 -> pass");
  assert.equal(M.gs9e0180NotNonneg(0x80000000), 1, "~0x80000000 = 0x7fffffff");
  assert.equal(M.gs9e0180NotNonneg(0x7fffffff), 0, "~0x7fffffff is negative");
  assert.equal(M.gs9e0180NotNonneg(0x100), 0, "high bits matter: no byte mask");
  // P2: strict SIGNED idx < count; arithmetic span shift
  assert.equal(M.gs9e0180IdxLtCount(0xfffffffc, 0x100, 0x110), 1, "idx 3 < count 4");
  assert.equal(M.gs9e0180IdxLtCount(0xfffffffb, 0x100, 0x110), 0, "idx == count rejected");
  assert.equal(M.gs9e0180IdxLtCount(0xffffffff, 0x100, 0x110), 1, "idx 0 < count 4");
  assert.equal(M.gs9e0180IdxLtCount(0xffffffff, 0x110, 0x100), 0, "negative span: count -4 closes gate");
  assert.equal(M.gs9e0180IdxLtCount(0xffffffff, 0x500, 0x4fc), 0, "sar keeps sign: span 0xfffffffc -> count -1");
  assert.notEqual(
    M.gs9e0180IdxLtCount(0xfffffffe, 0x100, 0x10b),
    M.gs9e0180IdxLtCount(0xfffffffd, 0x100, 0x10b),
    "non-multiple span floor-div edge flips",
  );
  // P3 composite on a scratch buffer: hit path + both null gates
  const dv = new DataView(new ArrayBuffer(0x100));
  const u32 = (a, w) => dv.setUint32(a, w >>> 0, true);
  u32(0x10, 0x20); u32(0x14, 0x28); /* vec {begin=0x20, end=0x28}: count 1 */
  u32(0x20, 0x1234); /* elem[0] — the ELEMENT itself, no second deref */
  assert.equal(M.gs9e0180ElemFetch(dv, 0x10, 0xffffffff), 0x1234,
    "hit path returns the ELEMENT dword (single deref)");
  assert.equal(M.gs9e0180ElemFetch(dv, 0x10, 0), 0, "v=0 -> ~v=-1 -> js null");
  assert.equal(M.gs9e0180ElemFetch(dv, 0x10, 0xfffffffe), 0, "idx==count -> jge null");
});

test("Wasm vs JS differential: v18 complement-index element fetch", () => {
  const exp = loadExports();
  const M = MODEL;
  const VIEW = new DataView(exp.memory.buffer);
  const BASE = 0x300000; /* nonzero arena base (< 16 MB linear mem) */
  const SLOT = 0x1000;
  const rng = mulberry32(0x9e0180);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  // scalar laws: deterministic full-u32 differential draws
  for (let i = 0; i < 200; i++) {
    const v = rnd(), b = rnd(), e = rnd();
    assert.equal(exp["9e0180NotNonneg"](v) >>> 0, M.gs9e0180NotNonneg(v),
      `P1 draw ${i}`);
    assert.equal(exp["9e0180IdxLtCount"](v, b, e) >>> 0,
      M.gs9e0180IdxLtCount(v, b, e), `P2 draw ${i}`);
  }
  // boundary edges (mutant discriminators) wasm-vs-model
  for (const v of [0, 1, 0x7fffffff, 0x80000000, 0xfffffffe, 0xffffffff, 0x100]) {
    assert.equal(exp["9e0180NotNonneg"](v) >>> 0, M.gs9e0180NotNonneg(v),
      `P1 edge ${v}`);
  }
  const p2Edges = [
    [0xfffffffc, 0x100, 0x110], [0xfffffffb, 0x100, 0x110],
    [0xffffffff, 0x100, 0x110], [0xffffffff, 0x110, 0x100],
    [0xffffffff, 0x500, 0x4fc], [0xfffffffe, 0x100, 0x10b],
    [0xfffffffd, 0x100, 0x10b],
  ];
  for (const [v, b, e] of p2Edges) {
    assert.equal(exp["9e0180IdxLtCount"](v, b, e) >>> 0,
      M.gs9e0180IdxLtCount(v, b, e), `P2 edge ${v} [${b},${e})`);
  }
  // P3 composite: structured slots, wasm vs oracle over the SAME bytes
  for (let i = 0; i < 80; i++) {
    const vecRel = i * SLOT;
    const arrRel = vecRel + 0x40;
    const n = 1 + (rnd() % 6);
    VIEW.setUint32(BASE + vecRel, arrRel >>> 0, true);
    VIEW.setUint32(BASE + vecRel + 4, (arrRel + n * 4) >>> 0, true);
    for (let k = 0; k < 8; k++) {
      VIEW.setUint32(BASE + arrRel + k * 4, (0xc0ffee000 + i * 8 + k) >>> 0, true);
    }
    const sub = new DataView(exp.memory.buffer, BASE);
    for (let k = 0; k < n + 2; k++) {
      const v = (~k) >>> 0;
      const got = exp["9e0180ElemFetch"](BASE, vecRel, v) >>> 0;
      assert.equal(got, M.gs9e0180ElemFetch(sub, vecRel, v) >>> 0,
        `draw ${i} k=${k} wasm-vs-oracle`);
      if (k < n) {
        assert.equal(got, (0xc0ffee000 + i * 8 + k) >>> 0,
          `draw ${i} k=${k} hit value`);
      } else {
        assert.equal(got, 0, `draw ${i} k=${k} out-of-range null`);
      }
    }
    // forced SIGNED-negative idx (top bit of v clear) -> null on both sides
    for (const v of [0, rnd() >>> 1]) {
      assert.equal(exp["9e0180ElemFetch"](BASE, vecRel, v >>> 0) >>> 0, 0,
        `draw ${i} negative-idx null`);
      assert.equal(M.gs9e0180ElemFetch(sub, vecRel, v >>> 0), 0,
        `draw ${i} negative-idx oracle null`);
    }
  }
});

test("v18 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  /* Windows AV/indexer/peer-snapshot locks can briefly EBUSY a fresh
     write during the write->compile->restore cycle; retry with backoff
     so a transient share violation cannot strand a mutant on disk. */
  const writeRetry = (data, label) => {
    for (let attempt = 0; ; attempt++) {
      try {
        writeFileSync(source, data);
        return;
      } catch (e) {
        if (attempt >= 9) throw e;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
          25 * (attempt + 1));
        void label;
      }
    }
  };
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeRetry(toFile(bad), label);
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeRetry(original, label);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    withMutant("v18 js gate dropped (negative idx reaches deref)",
      (s) => s.replace(
        "  const uint32_t idx = ~v; /* not @0x9e0186 */\n" +
        "  if ((int64_t)(int32_t)idx < 0) {\n" +
        "    return 0u; /* js @0x9e018a */\n" +
        "  }",
        "  const uint32_t idx = ~v; /* not @0x9e0186 */"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        const M = 0x300000, V = 0x100000, A = 0x100100;
        VIEW.setUint32(M + V, A, true); /* begin (M-relative offset) */
        VIEW.setUint32(M + V + 4, A + 4, true); /* count 1 */
        VIEW.setUint32(M + A - 4, 0xc0ffee, true); /* elem[-1] via idx wrap */
        assert.equal(exp["9e0180ElemFetch"](M, V, 0) >>> 0, 0,
          "v=0 (~v=-1) must be nulled by the js gate");
      });
    withMutant("v18 jge loosened to jg (idx==count accepted)",
      (s) => s.replace(
        "  if ((int64_t)(int32_t)idx >= (int64_t)count) {\n" +
        "    return 0u; /* jge @0x9e0198 */\n" +
        "  }",
        "  if ((int64_t)(int32_t)idx > (int64_t)count) {\n" +
        "    return 0u; /* jge @0x9e0198 */\n" +
        "  }"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        const M = 0x300000, V = 0x110000, A = 0x110100;
        VIEW.setUint32(M + V, A, true);
        VIEW.setUint32(M + V + 4, A + 4, true); /* count 1 */
        VIEW.setUint32(M + A + 4, 0xc0ffee, true); /* slot AT idx==count */
        assert.equal(exp["9e0180ElemFetch"](M, V, 0xfffffffe) >>> 0, 0,
          "idx==count must be nulled by the jge gate");
      });
    withMutant("v18 sar -> shr (count loses sign)",
      (s) => s.replace(
        "  const int32_t count = static_cast<int32_t>(end - begin) >> 2; /* sar @0x9e0193 */",
        "  const int32_t count = static_cast<int32_t>((end - begin) >> 2); /* sar @0x9e0193 */"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        const M = 0x300000, V = 0x130000, A = 0x130100;
        VIEW.setUint32(M + V, A, true);
        VIEW.setUint32(M + V + 4, A - 8, true); /* span -8: sar -> count -2 closes */
        VIEW.setUint32(M + A, 0xc0ffee, true); /* what shr would let through */
        assert.equal(exp["9e0180ElemFetch"](M, V, 0xffffffff) >>> 0, 0,
          "negative span must sar to a negative count (gate closed), not shr");
      });
    withMutant("v18 elem load folded to const (return-const)",
      (s) => s.replace(
        "  return isaac_game_state_9e0180_load_u32(mem, begin + idx * 4u); /* elem @0x9e019a */",
        "  (void)mem;\n" +
        "  return 0xdeadbeefu; /* MUTANT: elem folded to const */"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        const M = 0x300000, V = 0x120000, A = 0x120100;
        VIEW.setUint32(M + V, A, true);
        VIEW.setUint32(M + V + 4, A + 4, true);
        VIEW.setUint32(M + A, 0x1234, true);
        assert.equal(exp["9e0180ElemFetch"](M, V, 0xffffffff) >>> 0, 0x1234,
          "must return the ELEMENT dword, not a constant");
      });
    withMutant("v18 NOT masked to low byte",
      (s) => s.replace(
        "extern \"C\" int32_t isaac_game_state_9e0180_not_nonneg(uint32_t v) {\n" +
        "  const uint32_t idx = ~v;\n" +
        "  return ((int64_t)(int32_t)idx >= 0) ? 1 : 0;",
        "extern \"C\" int32_t isaac_game_state_9e0180_not_nonneg(uint32_t v) {\n" +
        "  const uint32_t idx = (~v) & 0xffu;\n" +
        "  return ((int64_t)(int32_t)idx >= 0) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9e0180NotNonneg"](0x100) >>> 0, 0,
          "~0x100 is negative FULL-dword; a byte mask would flip the gate");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});

test("ABI v19 accessors: 0x9e0650 forward-index BYTE getter census + PE byte-truth", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9e0650Va"]() >>> 0, M.GS9E0650_VA);
  assert.equal(exp["9e0650EndVa"]() >>> 0, M.GS9E0650_END_VA);
  assert.equal(exp["9e0650BodyBytes"]() >>> 0, M.GS9E0650_BODY_BYTES);
  assert.equal(exp["9e0650NextVa"]() >>> 0, M.GS9E0650_NEXT_VA);
  assert.equal(exp["9e0650InsnCount"]() >>> 0, 19);
  assert.equal(exp["9e0650JsGateVa"]() >>> 0, 0x9e0659);
  assert.equal(exp["9e0650EndLoadVa"]() >>> 0, 0x9e065b);
  assert.equal(exp["9e0650BeginLoadVa"]() >>> 0, 0x9e065e);
  assert.equal(exp["9e0650SubVa"]() >>> 0, 0x9e0661);
  assert.equal(exp["9e0650CmpVa"]() >>> 0, 0x9e0663);
  assert.equal(exp["9e0650JgeGateVa"]() >>> 0, 0x9e0665);
  assert.equal(exp["9e0650ByteLoadVa"]() >>> 0, 0x9e0667);
  assert.equal(exp["9e0650RetOkVa"]() >>> 0, 0x9e066d);
  assert.equal(exp["9e0650ZeroPathVa"]() >>> 0, 0x9e0670);
  assert.equal(exp["9e0650RetZeroVa"]() >>> 0, 0x9e0674);
  assert.equal(exp["9e0650CallerCount"]() >>> 0, 1);
  assert.equal(exp["9e0650CallerVaAt"](0) >>> 0, 0x770bb6);
  assert.equal(exp["9e0650CallerVaAt"](99) >>> 0, 0);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_9E0650_VA = 0x009e0650u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0650_END_VA = 0x009e0677u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0650_NEXT_VA = 0x009e0680u/);
  assert.match(h, /ISAAC_GAME_STATE_9E0650_BEGIN_OFF = 0xcu/);
  assert.match(h, /ISAAC_GAME_STATE_9E0650_END_OFF = 0x10u/);
  // PE byte-truth: prologue+arg load+push esi, test/js, both dword
  // field loads, NO-shift sub, cmp/jge, movzx (NOT movsx), BOTH
  // ret 4 exits, and the single caller E8.
  assert.deepEqual([...peAt(0x9e0650, 7)], [0x55, 0x8b, 0xec, 0x8b, 0x55, 0x08, 0x56]);
  assert.deepEqual([...peAt(0x9e0657, 4)], [0x85, 0xd2, 0x78, 0x15]);
  assert.deepEqual([...peAt(0x9e065b, 3)], [0x8b, 0x41, 0x10]);
  assert.deepEqual([...peAt(0x9e065e, 3)], [0x8b, 0x71, 0x0c]);
  assert.deepEqual([...peAt(0x9e0661, 2)], [0x2b, 0xc6]); /* sub eax,esi — byte units */
  assert.deepEqual([...peAt(0x9e0663, 4)], [0x3b, 0xd0, 0x7d, 0x09]);
  assert.deepEqual([...peAt(0x9e0667, 4)], [0x0f, 0xb6, 0x04, 0x16]);
  assert.deepEqual([...peAt(0x9e066b, 5)], [0x5e, 0x5d, 0xc2, 0x04, 0x00]);
  assert.deepEqual([...peAt(0x9e0670, 7)], [0x33, 0xc0, 0x5e, 0x5d, 0xc2, 0x04, 0x00]);
  assert.deepEqual([...peAt(0x770bb6, 5)], [0xe8, 0x95, 0xfa, 0x26, 0x00]);
});

test("v19 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  // X1: both arms over signed extremes
  assert.equal(M.gs9e0650ForwardIndexGuard(-1), 0, "negative -> zero path");
  assert.equal(M.gs9e0650ForwardIndexGuard(-0x80000000 | 0), 0);
  assert.equal(M.gs9e0650ForwardIndexGuard(0), 1, "zero is FORWARD-valid");
  assert.equal(M.gs9e0650ForwardIndexGuard(0x7fffffff), 1);
  // X2: BYTE units — no shift; wrap keeps u32 identity
  assert.equal(M.gs9e0650ByteSpanSize(0x100, 0x100), 0);
  assert.equal(M.gs9e0650ByteSpanSize(0x100, 0x110), 0x10);
  assert.equal(M.gs9e0650ByteSpanSize(0x110, 0x100), 0xfffffff0, "wrap");
  // X3: strict SIGNED bound against the BYTE-unit span
  assert.equal(M.gs9e0650BoundsCheck(0, 0x100, 0x100), 0, "empty span");
  assert.equal(M.gs9e0650BoundsCheck(-1, 0x100, 0x110), 1,
    "X3 is SIGNED both sides: -1 < 16 admits (X1/js owns negatives)");
  assert.equal(M.gs9e0650BoundsCheck(0xf, 0x100, 0x110), 1);
  assert.equal(M.gs9e0650BoundsCheck(0x10, 0x100, 0x110), 0, "idx==n closed");
  assert.equal(M.gs9e0650BoundsCheck(0, 0x110, 0x100), 0, "negative span closes all");
  assert.equal(M.gs9e0650BoundsCheck(0x7fffffff, 0x110, 0x100), 0,
    "INT_MAX >= negative span: jge fires");
  // X5: the zero-path VALUE is 0
  assert.equal(M.gs9e0650ZeroReturn(), 0);
});

test("v19 fixed edge cases: wasm vs JS oracle (js/jge/empty/negative-span/movzx)", () => {
  const exp = loadExports();
  const M = MODEL;
  // scalar laws at signed boundaries
  for (const idx of [-0x80000000 | 0, -1, 0, 1, 0x7fffffff]) {
    assert.equal(exp["9e0650ForwardIndexGuard"](idx) >>> 0,
      M.gs9e0650ForwardIndexGuard(idx), `guard ${idx}`);
    assert.equal(exp["9e0650ByteSpanSize"](idx, 0x200) >>> 0,
      M.gs9e0650ByteSpanSize(idx >>> 0, 0x200), `span ${idx}`);
    assert.equal(exp["9e0650BoundsCheck"](idx, 0x300, 0x310) >>> 0,
      M.gs9e0650BoundsCheck(idx, 0x300, 0x310), `bounds ${idx}`);
  }
  // composite over a scratch arena: hit + every fail shape, SAME bytes
  const VIEW = new DataView(exp.memory.buffer);
  const BASE = 0x300000;
  const recv = BASE + 0x20, arrRel = 0x40; /* stored ptrs are mem-RELATIVE */
  const u32 = (a, w) => VIEW.setUint32(a, w >>> 0, true);
  const u8 = (a, v) => VIEW.setUint8(a, v & 0xff);
  u32(recv + 0xc, arrRel); u32(recv + 0x10, arrRel + 8); /* span fields [this+0xc]/[this+0x10] */
  u8(BASE + arrRel, 0x90); u8(BASE + arrRel + 1, 0x11); u8(BASE + arrRel + 7, 0xff);
  const sub = new DataView(exp.memory.buffer, BASE);
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 0) >>> 0, 0x90,
    "movzx: high bit NOT sign-extended (movsx discriminator)");
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 1) >>> 0, 0x11);
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 7) >>> 0, 0xff);
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, -1) >>> 0, 0, "js gate");
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 8) >>> 0, 0, "idx==n jge");
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 9) >>> 0, 0, "idx>n");
  assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, -0x80000000 | 0) >>> 0, 0);
  assert.equal(M.gs9e0650ByteGetter(sub, recv - BASE, 0), 0x90, "oracle agrees");
  // empty span: begin==end -> every forward idx rejected
  u32(recv + 0x4c, arrRel + 0x20); u32(recv + 0x50, arrRel + 0x20);
  for (const k of [0, 1, 5]) {
    assert.equal(exp["9e0650ByteGetter"](BASE, recv + 0x40 - BASE, k) >>> 0, 0,
      `empty span idx ${k}`);
  }
  // negative span (end < begin): SIGNED n < 0 closes against every nonneg idx
  u32(recv + 0x8c, arrRel + 0x30); u32(recv + 0x90, arrRel + 0x20);
  for (const k of [0, 0x7fffffff]) {
    assert.equal(exp["9e0650ByteGetter"](BASE, recv + 0x80 - BASE, k) >>> 0, 0,
      `negative span idx ${k}`);
  }
});

test("Wasm vs JS differential: v19 forward-index byte getter", () => {
  const exp = loadExports();
  const M = MODEL;
  const VIEW = new DataView(exp.memory.buffer);
  const BASE = 0x300000; /* nonzero arena base (< 16 MB linear mem) */
  const SLOT = 0x1000;
  const rng = mulberry32(0x9e0650);
  const rnd = () => Math.floor(rng() * 0x100000000) >>> 0;
  // scalar laws: deterministic full-u32 differential draws
  for (let i = 0; i < 200; i++) {
    const idx = rnd(), b = rnd(), e = rnd();
    assert.equal(exp["9e0650ForwardIndexGuard"](idx | 0) >>> 0,
      M.gs9e0650ForwardIndexGuard(idx | 0), `X1 draw ${i}`);
    assert.equal(exp["9e0650ByteSpanSize"](b, e) >>> 0,
      M.gs9e0650ByteSpanSize(b, e), `X2 draw ${i}`);
    assert.equal(exp["9e0650BoundsCheck"](idx | 0, b, e) >>> 0,
      M.gs9e0650BoundsCheck(idx | 0, b, e), `X3 draw ${i}`);
  }
  // boundary edges (mutant discriminators) wasm-vs-model
  for (const idx of [-1, 0, 1, 0x7fffffff, -0x80000000 | 0]) {
    assert.equal(exp["9e0650ForwardIndexGuard"](idx) >>> 0,
      M.gs9e0650ForwardIndexGuard(idx), `X1 edge ${idx}`);
  }
  const x3Edges = [
    [0, 0x100, 0x100], [-1, 0x100, 0x110], [0xf, 0x100, 0x110],
    [0x10, 0x100, 0x110], [0x11, 0x100, 0x110], [0, 0x110, 0x100],
    [0x7fffffff, 0x110, 0x100], [4, 4, 5],
  ];
  for (const [idx, b, e] of x3Edges) {
    assert.equal(exp["9e0650BoundsCheck"](idx, b, e) >>> 0,
      M.gs9e0650BoundsCheck(idx, b, e), `X3 edge ${idx} [${b},${e})`);
  }
  // structured slots: wasm vs oracle over the SAME bytes
  for (let i = 0; i < 80; i++) {
    const recvRel = i * SLOT;
    const arrRel = recvRel + 0x40;
    const n = 1 + (rnd() % 6);
    VIEW.setUint32(BASE + recvRel + 0xc, arrRel >>> 0, true);
    VIEW.setUint32(BASE + recvRel + 0x10, (arrRel + n) >>> 0, true);
    for (let k = 0; k < 8; k++) {
      VIEW.setUint8(BASE + arrRel + k, (0x80 | ((i * 13 + k * 29) & 0x7f)) & 0xff);
    }
    const sub = new DataView(exp.memory.buffer, BASE);
    for (let k = 0; k < n + 2; k++) {
      const got = exp["9e0650ByteGetter"](BASE, recvRel, k) >>> 0;
      assert.equal(got, M.gs9e0650ByteGetter(sub, recvRel, k) >>> 0,
        `draw ${i} k=${k} wasm-vs-oracle`);
      if (k < n) {
        assert.equal(got, VIEW.getUint8(BASE + arrRel + k),
          `draw ${i} k=${k} exact byte`);
      } else {
        assert.equal(got, 0, `draw ${i} k=${k} out-of-range zero`);
      }
    }
    // forced negative idx -> zero path on both sides
    for (const k of [-1, -(1 + (rnd() % 0x7fffffff))]) {
      assert.equal(exp["9e0650ByteGetter"](BASE, recvRel, k) >>> 0, 0,
        `draw ${i} negative-idx zero`);
      assert.equal(M.gs9e0650ByteGetter(sub, recvRel, k) >>> 0, 0,
        `draw ${i} negative-idx oracle zero`);
    }
  }
});

test("v19 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  /* Windows AV/indexer/peer-snapshot locks can briefly EBUSY a fresh
     write during the write->compile->restore cycle; retry with backoff
     so a transient share violation cannot strand a mutant on disk. */
  const writeRetry = (data, label) => {
    for (let attempt = 0; ; attempt++) {
      try {
        writeFileSync(source, data);
        return;
      } catch (e) {
        if (attempt >= 9) throw e;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
          25 * (attempt + 1));
        void label;
      }
    }
  };
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeRetry(toFile(bad), label);
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeRetry(original, label);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    /* M js-flip: census "js->jns flip" — guard accepts negatives,
       rejects positives. */
    withMutant("v19 js flipped to jns (guard accepts negatives)",
      (s) => s.replace(
        "return ((int64_t)idx >= 0) ? 1 : 0;",
        "return ((int64_t)idx <= 0) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9e0650ForwardIndexGuard"](1) >>> 0, 1,
          "idx=1 must pass the FORWARD-index guard");
      });
    /* M sar-slip: census "missing byte-span" — adding the vector-twin
       >>2 that THIS body does not have (byte units). */
    withMutant("v19 phantom sar >>2 added to the byte-span bound",
      (s) => s.replace(
        "return ((int64_t)idx < (int64_t)(int32_t)(end - begin)) ? 1 : 0;",
        "return ((int64_t)idx <\n" +
        "          (int64_t)(int32_t)((end - begin) >> 2)) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9e0650BoundsCheck"](0, 0x100, 0x101) >>> 0, 1,
          "single-byte span must admit idx 0 (NO shift in byte units)");
      });
    /* M jge-flip: strict bound loosened — idx==n accepted. */
    withMutant("v19 jge loosened to jg (idx==n accepted)",
      (s) => s.replace(
        "return ((int64_t)idx < (int64_t)(int32_t)(end - begin)) ? 1 : 0;",
        "return ((int64_t)idx <= (int64_t)(int32_t)(end - begin)) ? 1 : 0;"),
      (exp) => {
        assert.equal(exp["9e0650BoundsCheck"](0x10, 0x100, 0x110) >>> 0, 0,
          "idx==n must take the zero path (strict signed bound)");
      });
    /* M movsx-slip: census "movzx->movsx slip" — 0x90 must stay 0x90. */
    withMutant("v19 movzx slipped to movsx (high bit sign-extends)",
      (s) => s.replace(
        "return isaac_game_state_9e0650_load_u8(mem, addr);",
        "return (uint32_t)(int32_t)(int8_t)\n" +
        "      isaac_game_state_9e0650_load_u8(mem, addr);"),
      (exp) => {
        const BASE = 0x380000, recv = BASE + 0x20, arrRel = 0x40;
        VIEW.setUint32(recv + 0xc, arrRel, true);
        VIEW.setUint32(recv + 0x10, arrRel + 1, true);
        VIEW.setUint8(BASE + arrRel, 0x90);
        assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 0) >>> 0, 0x90,
          "movzx must ZERO-extend: 0x90 stays 0x90");
      });
    /* M off-by-one: census "off-by-one begin+idx". */
    withMutant("v19 off-by-one fetch at begin+idx+1",
      (s) => s.replace(
        "const uint32_t addr = begin + static_cast<uint32_t>(idx);",
        "const uint32_t addr = begin + static_cast<uint32_t>(idx + 1);"),
      (exp) => {
        const BASE = 0x390000, recv = BASE + 0x20, arrRel = 0x40;
        VIEW.setUint32(recv + 0xc, arrRel, true);
        VIEW.setUint32(recv + 0x10, arrRel + 2, true);
        VIEW.setUint8(BASE + arrRel, 0x11);
        VIEW.setUint8(BASE + arrRel + 1, 0x22);
        assert.equal(exp["9e0650ByteGetter"](BASE, recv - BASE, 0) >>> 0, 0x11,
          "idx 0 must read the FIRST byte");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});
/* ============ ABI v20: 0x9e3450 grid-adjacency door-direction checker ===== */
/* Shared scratch-world layout for the wasm-side door-direction tests.
   [INNER+0xc]=width; [THIS]=INNER; cells u8[THIS+4+i] i<0x200;
   TABLE rows t=0..255: s32 count + count x {f32,f32} entries. */
const V20_INNER = 0x300000;
const V20_THIS = 0x301000;
const V20_TABLE = 0x302000;

function vnnWorldBase(VIEW, width, cellFn, rows) {
  VIEW.setUint32(V20_THIS, V20_INNER, true);
  VIEW.setUint32(V20_INNER + 0xc, width >>> 0, true);
  for (let i = 0; i < 0x200; i++) {
    VIEW.setUint8(V20_THIS + 4 + i, cellFn(i));
  }
  for (let t = 0; t < 256; t++) {
    const row = V20_TABLE + t * 68;
    const ents = (rows && rows[t]) || [];
    VIEW.setInt32(row, ents.length, true);
    ents.forEach(([x, y], k) => {
      VIEW.setFloat32(row + 4 + k * 8, x, true);
      VIEW.setFloat32(row + 8 + k * 8, y, true);
    });
  }
}
/* w=8 cells type 3, type3=[[13,0]] */
function vnnWorldStd(VIEW) {
  vnnWorldBase(VIEW, 8, () => 0x03, { 3: [[13, 0]] });
}
/* w=16 cells type 3, type3=[[-13,0]] (boundary pair A=0x1bf rem-1) */
function vnnWorldNeg(VIEW) {
  vnnWorldBase(VIEW, 16, () => 0x03, { 3: [[-13, 0]] });
}
/* sentinel at i%50==7; rows 3 AND 15 armed with [[13,0]] so a polarity
   flip that lets 0xFF through still lands on a live row */
function vnnWorldSent(VIEW) {
  const cellFn = (i) => (i % 50 === 7 ? 0xff : 0x03);
  vnnWorldBase(VIEW, 8, cellFn, { 3: [[13, 0]], 15: [[13, 0]] });
}

test("ABI v20 accessors: 0x9e3450 grid door-direction census + PE byte-truth", () => {
  const exp = loadExports();
  const M = MODEL;
  assert.equal(exp["9e3450Va"]() >>> 0, M.GS9E3450_VA);
  assert.equal(exp["9e3450EndVa"]() >>> 0, M.GS9E3450_END_VA);
  assert.equal(exp["9e3450BodyBytes"]() >>> 0, M.GS9E3450_BODY_BYTES);
  assert.equal(exp["9e3450NextVa"]() >>> 0, M.GS9E3450_NEXT_VA);
  assert.equal(exp["9e3450InsnCount"]() >>> 0, 101);
  assert.equal(exp["9e3450WidthLoadVa"]() >>> 0, 0x9e3461);
  assert.equal(exp["9e3450ManhattanJneVa"]() >>> 0, 0x9e3492);
  assert.equal(exp["9e3450BoundCmpVa"]() >>> 0, 0x9e3498);
  assert.equal(exp["9e3450BoundJaVa"]() >>> 0, 0x9e349e);
  assert.equal(exp["9e3450CellReadVa"]() >>> 0, 0x9e34a7);
  assert.equal(exp["9e3450SentinelJeVa"]() >>> 0, 0x9e34ab);
  assert.equal(exp["9e3450TypeMaskVa"]() >>> 0, 0x9e34b8);
  assert.equal(exp["9e3450CountLoadVa"]() >>> 0, 0x9e34c2);
  assert.equal(exp["9e3450CountJleVa"]() >>> 0, 0x9e34cb);
  assert.equal(exp["9e3450EntryLeaVa"]() >>> 0, 0x9e34d5);
  assert.equal(exp["9e3450CmpDrowVa"]() >>> 0, 0x9e352b);
  assert.equal(exp["9e3450CmpDcolVa"]() >>> 0, 0x9e3530);
  assert.equal(exp["9e3450RetFailVa"]() >>> 0, 0x9e3545);
  assert.equal(exp["9e3450RetHitVa"]() >>> 0, 0x9e3550);
  assert.equal(exp["9e3450GridBound"]() >>> 0, 0x1bf);
  assert.equal(exp["9e3450WidthInnerOff"]() >>> 0, 0xc);
  assert.equal(exp["9e3450CellTableOff"]() >>> 0, 4);
  assert.equal(exp["9e3450Sentinel"]() >>> 0, 0xff);
  assert.equal(exp["9e3450TypeMask"]() >>> 0, 0xf);
  assert.equal(exp["9e3450DoorTableVa"]() >>> 0, 0xc37610);
  assert.equal(exp["9e3450TypeRowStride"]() >>> 0, 68);
  assert.equal(exp["9e3450EntryStride"]() >>> 0, 8);
  assert.equal(exp["9e3450FltNegVa"]() >>> 0, 0xbaadd0);
  assert.equal(exp["9e3450FltPosVa"]() >>> 0, 0xbaa83c);
  assert.equal(exp["9e3450CallerCount"]() >>> 0, 6);
  assert.equal(exp["9e3450CallerVaAt"](0) >>> 0, 0x4b7178);
  assert.equal(exp["9e3450CallerVaAt"](1) >>> 0, 0x4b72f2);
  assert.equal(exp["9e3450CallerVaAt"](2) >>> 0, 0x4b748d);
  assert.equal(exp["9e3450CallerVaAt"](3) >>> 0, 0x4b75ed);
  assert.equal(exp["9e3450CallerVaAt"](4) >>> 0, 0x4bbd2a);
  assert.equal(exp["9e3450CallerVaAt"](5) >>> 0, 0x9e3774);
  assert.equal(exp["9e3450CallerVaAt"](99) >>> 0, 0);
  assert.equal(exp["pureHelpersAbiVersion"](), 20);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_GAME_STATE_PURE_HELPERS_ABI_VERSION = 20/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_VA = 0x009e3450u/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_END_VA = 0x009e3553u/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_NEXT_VA = 0x009e3560u/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_GRID_BOUND = 0x1bfu/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_DOOR_TABLE_VA = 0x00c37610u/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_FLT_NEG_VA = 0x00baadd0u/);
  assert.match(h, /ISAAC_GAME_STATE_9E3450_FLT_POS_VA = 0x00baa83cu/);
  /* PE byte-truth: prologue, width deref, gates, table load, movss
     consts, direction compares, dual ret 8, int3 pad. */
  assert.deepEqual([...peAt(0x9e3450, 6)], [0x55, 0x8b, 0xec, 0x51, 0x8b, 0xc1]);
  assert.deepEqual([...peAt(0x9e345d, 3)], [0x8b, 0x00, 0x56]);
  assert.deepEqual([...peAt(0x9e3461, 3)], [0x8b, 0x70, 0x0c]);
  assert.deepEqual([...peAt(0x9e3467, 2)], [0xf7, 0xfe]);
  assert.deepEqual([...peAt(0x9e348f, 3)], [0x83, 0xf9, 0x01]);
  assert.deepEqual([...peAt(0x9e3492, 6)], [0x0f, 0x85, 0xa5, 0x00, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9e3498, 6)], [0x81, 0xfb, 0xbf, 0x01, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9e349e, 6)], [0x0f, 0x87, 0x99, 0x00, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9e34a4, 3)], [0x8b, 0x45, 0xfc]);
  assert.deepEqual([...peAt(0x9e34a7, 4)], [0x8a, 0x44, 0x03, 0x04]);
  assert.deepEqual([...peAt(0x9e34ab, 2)], [0x3c, 0xff]);
  assert.deepEqual([...peAt(0x9e34ad, 6)], [0x0f, 0x84, 0x8a, 0x00, 0x00, 0x00]);
  assert.deepEqual([...peAt(0x9e34b8, 3)], [0x83, 0xe0, 0x0f]);
  assert.deepEqual([...peAt(0x9e34bd, 3)], [0xc1, 0xe1, 0x04]);
  assert.deepEqual([...peAt(0x9e34c2, 7)], [0x8b, 0x1c, 0x8d, 0x10, 0x76, 0xc3, 0x00]);
  assert.deepEqual([...peAt(0x9e34cb, 2)], [0x7e, 0x70]);
  assert.deepEqual([...peAt(0x9e34cd, 8)], [0xf3, 0x0f, 0x10, 0x0d, 0xd0, 0xad, 0xba, 0x00]);
  assert.deepEqual([...peAt(0x9e34d5, 7)], [0x8d, 0x34, 0x8d, 0x14, 0x76, 0xc3, 0x00]);
  assert.deepEqual([...peAt(0x9e34dc, 8)], [0xf3, 0x0f, 0x10, 0x15, 0x3c, 0xa8, 0xba, 0x00]);
  assert.deepEqual([...peAt(0x9e352b, 3)], [0x3b, 0x55, 0x08]);
  assert.deepEqual([...peAt(0x9e3530, 3)], [0x3b, 0x4d, 0x0c]);
  assert.deepEqual([...peAt(0x9e3533, 2)], [0x74, 0x13]);
  assert.deepEqual([...peAt(0x9e353f, 2)], [0x32, 0xc0]);
  assert.deepEqual([...peAt(0x9e3545, 3)], [0xc2, 0x08, 0x00]);
  assert.deepEqual([...peAt(0x9e354a, 2)], [0xb0, 0x01]);
  assert.deepEqual([...peAt(0x9e3550, 3)], [0xc2, 0x08, 0x00]);
  assert.deepEqual([...peAt(0x9e3553, 2)], [0xcc, 0xcc]);
});

test("v20 laws are not vacuous (self-check)", () => {
  const M = MODEL;
  // AI2: FULL-dword == 1; cdq-mask abs (sign-BIT abs would break negatives)
  assert.equal(M.gs9e3450ManhattanOne(1, 0), 1);
  assert.equal(M.gs9e3450ManhattanOne(0, -1), 1);
  assert.equal(M.gs9e3450ManhattanOne(-1, 1), 0, "|−1|+|1|=2");
  assert.equal(M.gs9e3450ManhattanOne(2, 0), 0);
  assert.equal(M.gs9e3450ManhattanOne(0, 0), 0);
  assert.equal(M.gs9e3450ManhattanOne(-0x80000000, 0), 0,
    "abs(INT_MIN) wraps to 0x80000000, never 1");
  assert.equal(M.gs9e3450ManhattanOne(-0x80000000, -0x80000000), 0,
    "double-wrap sum truncates to 0, not 1");
  // AI1: SIGNED idiv truncates toward zero (floor would give q=-1,r=+3)
  const dv0 = new DataView(new ArrayBuffer(64));
  dv0.setUint32(0x10, 0x20, true); /* [this] -> inner @0x20 */
  dv0.setUint32(0x20 + 0xc, 8, true); /* width */
  const g = M.gs9e3450GridSplit(dv0, 0x10, -5, -4);
  assert.deepEqual(g, { dCol: 0, dRow: 1 }, "trunc-toward-zero idiv");
  // AI3: UNSIGNED bound
  assert.equal(M.gs9e3450IndexBound(0x1bf), 1);
  assert.equal(M.gs9e3450IndexBound(0x1c0), 0);
  assert.equal(M.gs9e3450IndexBound(-1), 0, "0xffffffff above bound");
  assert.equal(M.gs9e3450IndexBound(0), 1);
  // AI5: LOW nibble only
  assert.equal(M.gs9e3450TypeSelect(0xab), 0xb);
  assert.equal(M.gs9e3450TypeSelect(0xa3), 3);
  assert.equal(M.gs9e3450TypeSelect(0xff), 0xf);
  assert.equal(M.gs9e3450TypeSelect(0x70), 0);
  // signum: exact ±13 equality; f32 neighbors of 13 -> 0; NaN -> 0
  assert.equal(M.gs9e3450Signum13(-13), -1);
  assert.equal(M.gs9e3450Signum13(13), 1);
  assert.equal(M.gs9e3450Signum13(0), 0);
  assert.equal(M.gs9e3450Signum13(NaN), 0, "unordered both arms");
  const bits = new DataView(new ArrayBuffer(4));
  bits.setUint32(0, 0x414fffff, true);
  assert.equal(M.gs9e3450Signum13(bits.getFloat32(0, true)), 0,
    "12.99999952… nextfloat below 13");
  bits.setUint32(0, 0x41500001, true);
  assert.equal(M.gs9e3450Signum13(bits.getFloat32(0, true)), 0,
    "13.00000095… nextfloat above 13");
  // AI6 gate: signed count <= 0 fails both ways
  const dv1 = new DataView(new ArrayBuffer(0x100));
  dv1.setInt32(0, 0, true);
  assert.equal(M.gs9e3450DoorDirScan(dv1, 0, 0, 0, 1), 0, "count 0");
  dv1.setInt32(0, -1, true);
  assert.equal(M.gs9e3450DoorDirScan(dv1, 0, 0, 0, 1), 0, "count -1 (SIGNED jle)");
});

test("Wasm vs JS fixed edges + differential: v20 grid door-direction", () => {
  const exp = loadExports();
  const M = MODEL;
  const VIEW = new DataView(exp.memory.buffer);
  const INNER = 0x300000, THIS = 0x301000, TABLE = 0x302000;
  const CELL_N = 0x200, TYPES = 256;
  const U32 = (a, v) => VIEW.setUint32(a, v >>> 0, true);
  const I32 = (a, v) => VIEW.setInt32(a, v | 0, true);
  const F32 = (a, v) => VIEW.setFloat32(a, v, true);
  const U8 = (a, v) => VIEW.setUint8(a, v & 0xff);
  const setup = (width, cellFn, rows) => {
    U32(THIS, INNER);
    U32(INNER + 0xc, width);
    for (let i = 0; i < CELL_N; i++) U8(THIS + 4 + i, cellFn(i));
    for (let t = 0; t < TYPES; t++) {
      const row = TABLE + t * 68;
      const ents = (rows && rows[t]) || [];
      I32(row, ents.length);
      ents.forEach(([x, y], k) => {
        F32(row + 4 + k * 8, x);
        F32(row + 8 + k * 8, y);
      });
    }
  };
  const chk = (label, a, b, want) => {
    const got = exp["9e3450DoorDir"](THIS, a, b, TABLE) >>> 0;
    const refv = M.gs9e3450DoorDir(VIEW, THIS, a, b, TABLE) >>> 0;
    assert.equal(got, refv, `${label}: wasm-vs-oracle`);
    assert.equal(got, want >>> 0, label);
  };

  /* W1: w=8 cells type 3, [[13,0]] — remainder step +1 hits (x<->ROW) */
  setup(8, () => 0x03, { 3: [[13, 0]] });
  chk("hit x-pos rem+1", 5, 6, 1);
  chk("miss rem-1", 6, 5, 0);
  chk("miss quot+1", 5, 13, 0);
  chk("same cell", 5, 5, 0);
  chk("manhattan 2", 5, 7, 0);
  chk("diagonal", 5, 14, 0);
  /* W1b: boundary 0x1bf pass / 0x1c0 fail (w=16 keeps rem-step valid) */
  setup(16, () => 0x03, { 3: [[13, 0]] });
  chk("bound edge 0x1bd->0x1be hit", 0x1bd, 0x1be, 1);
  chk("bound out 0x1c0", 0x1c0, 0x1c1, 0);
  /* W2..W4: remaining directions */
  setup(8, () => 0x03, { 3: [[-13, 0]] });
  chk("hit x-neg rem-1", 6, 5, 1);
  setup(8, () => 0x03, { 3: [[0, 13]] });
  chk("hit y-pos quot+1", 5, 13, 1);
  chk("miss quot-1", 13, 5, 0);
  setup(8, () => 0x03, { 3: [[0, -13]] });
  chk("hit y-neg quot-1", 13, 5, 1);
  /* W5: sentinel + multi-entry scan */
  setup(8, (i) => (i % 50 === 7 ? 0xff : 0x03), { 3: [[7, 7], [13, 0]] });
  chk("sentinel idxA fails", 57, 58, 0);
  chk("non-sentinel neighbor control", 58, 59, 1);
  chk("multi-entry finds 2nd", 14, 15, 1);
  /* W6: count gates */
  setup(8, (i) => (i === 9 ? 0x08 : 0x07), { 7: [], 8: [[13, 0]] });
  chk("count-0 type7", 10, 11, 0);
  chk("type8 hit", 9, 10, 1);
  setup(8, () => 0x09, { 9: [[13, 0]] });
  VIEW.setInt32(TABLE + 9 * 68, -1, true);
  chk("count -1 fails", 4, 5, 0);
  /* W7: NaN entries never match */
  setup(8, () => 0x0a, { 10: [[NaN, 0], [0, NaN]] });
  chk("NaN entries fail", 3, 4, 0);
  /* W8: high nibble ignored (0xA3 acts as type 3) */
  setup(8, () => 0xa3, { 3: [[13, 0]] });
  chk("mask &0xf (0xA3 -> t=3)", 2, 3, 1);
  /* W9: width 1 — r always 0, +-1 moves are pure quotient (y) steps */
  setup(1, () => 0x01, { 1: [[0, 13], [0, -13]] });
  chk("w1 quot+1 hit", 5, 6, 1);
  chk("w1 quot-1 hit", 6, 5, 1);
  /* W10: negative idxA dies on the unsigned bound */
  setup(8, () => 0x03, { 3: [[13, 0]] });
  chk("negative idxA bound fail", -5, -4, 0);

  /* randomized differential: LCG high bits (mulberry32, VA seed),
     wasm vs oracle over the SAME scratch bytes */
  const rng = mulberry32(0x9e3450);
  const rnd = (n) => Math.floor(rng() * n);
  const POOL = [
    [13, 0], [-13, 0], [0, 13], [0, -13],
    [7, 7], [NaN, 0], [13, NaN], [-0, 0],
  ];
  let hits = 0;
  const DRAWS = 400;
  for (let d = 0; d < DRAWS; d++) {
    const width = 1 + rnd(16);
    const rows = {};
    for (let t = 0; t < 16; t++) {
      const cnt = [-1, 0, 1, 1, 2, 3][rnd(6)];
      rows[t] = [];
      for (let k = 0; k < Math.max(cnt, 0); k++) rows[t].push(POOL[rnd(POOL.length)]);
    }
    const cellFn = (i) => (rng() < 0.1 ? 0xff : (0xa0 | rnd(12)) >>> 0);
    setup(width, cellFn, rows);
    const idxA = rnd(0x200);
    let idxB;
    if (rng() < 0.6) {
      const dirs = [[1, 0], [-1, 0], [0, width], [0, -width]];
      const [dc, dr] = dirs[rnd(4)];
      idxB = Math.min(Math.max(idxA + dc + dr, 0), 0x1ff);
    } else {
      idxB = rnd(0x100000000);
    }
    const got = exp["9e3450DoorDir"](THIS, idxA | 0, idxB | 0, TABLE) >>> 0;
    const want = M.gs9e3450DoorDir(VIEW, THIS, idxA | 0, idxB | 0, TABLE) >>> 0;
    assert.equal(got, want, `diff draw ${d} w=${width} A=${idxA} B=${idxB}`);
    hits += got;
  }
  assert.ok(hits >= 5, `hit-rate floor: only ${hits}/${DRAWS} hits`);
});

test("v20 mutants: break translation, fail, sha256-restore", () => {
  const original = readFileSync(source);
  const origHash = createHash("sha256").update(original).digest("hex");
  const text = original.toString("utf8");
  const crlf = text.includes("\r\n");
  const base = text.replaceAll("\r\n", "\n");
  const toFile = (s) => (crlf ? s.replaceAll("\n", "\r\n") : s);
  const shaOf = (buf) => createHash("sha256").update(buf).digest("hex");
  /* Windows AV/indexer/peer-snapshot locks can briefly EBUSY a fresh
     write during the write->compile->restore cycle; retry with backoff
     so a transient share violation cannot strand a mutant on disk. */
  const writeRetry = (data, label) => {
    for (let attempt = 0; ; attempt++) {
      try {
        writeFileSync(source, data);
        return;
      } catch (e) {
        if (attempt >= 9) throw e;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
          25 * (attempt + 1));
        void label;
      }
    }
  };
  const withMutant = (label, mutate, check) => {
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeRetry(toFile(bad), label);
    let threw = false;
    try {
      const exp = loadExports();
      check(exp);
    } catch {
      threw = true;
    }
    writeRetry(original, label);
    assert.equal(shaOf(readFileSync(source)), origHash, `${label}: restore hash`);
    assert.ok(threw, `${label}: mutant survived`);
  };
  try {
    withMutant("v20 manhattan slip !=1 -> !=2 (adjacency gate)",
      (s) => s.replace(
        "  if (manhattan != 1u) {",
        "  if (manhattan != 2u) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldStd(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 5, 6, V20_TABLE) >>> 0, 1,
          "adjacent rem+1 pair must still hit on the clean build");
      });
    withMutant("v20 bound off-by-one > -> >= (boundary rejected)",
      (s) => s.replace(
        "if (static_cast<uint32_t>(idx_a) > ISAAC_GAME_STATE_9E3450_GRID_BOUND) {",
        "if (static_cast<uint32_t>(idx_a) >= ISAAC_GAME_STATE_9E3450_GRID_BOUND) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldNeg(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 0x1bf, 0x1be, V20_TABLE) >>> 0, 1,
          "idxA == 0x1bf itself must stay admissible");
      });
    withMutant("v20 sentinel polarity == -> !=",
      (s) => s.replace(
        "if (b == ISAAC_GAME_STATE_9E3450_SENTINEL) {",
        "if (b != ISAAC_GAME_STATE_9E3450_SENTINEL) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldSent(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 57, 58, V20_TABLE) >>> 0, 0,
          "sentinel cell must fail even with row 15 armed");
      });
    withMutant("v20 mask &0xf -> &0xf0",
      (s) => s.replace(
        "const uint32_t t = b & ISAAC_GAME_STATE_9E3450_TYPE_MASK;",
        "const uint32_t t = b & 0xf0u;"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldStd(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 2, 3, V20_TABLE) >>> 0, 1,
          "byte 0x03 must select type 3, not 0x00");
      });
    withMutant("v20 ladder swap ja -> jb",
      (s) => s.replace(
        "if (static_cast<uint32_t>(idx_a) > ISAAC_GAME_STATE_9E3450_GRID_BOUND) {",
        "if (static_cast<uint32_t>(idx_a) < ISAAC_GAME_STATE_9E3450_GRID_BOUND) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldStd(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 5, 6, V20_TABLE) >>> 0, 1,
          "small in-bound idxA must stay admissible");
      });
    withMutant("v20 thresholds swapped NEG<->POS",
      (s) => s.replace(
        "  if (v == ISAAC_GAME_STATE_9E3450_FLT_NEG_F) {\n" +
        "    return -1; /* first ucomiss equal arm (or edx=-1 path @0x9e34f6) */\n" +
        "  }\n" +
        "  if (v == ISAAC_GAME_STATE_9E3450_FLT_POS_F) {",
        "  if (v == ISAAC_GAME_STATE_9E3450_FLT_POS_F) {\n" +
        "    return -1; /* first ucomiss equal arm (or edx=-1 path @0x9e34f6) */\n" +
        "  }\n" +
        "  if (v == ISAAC_GAME_STATE_9E3450_FLT_NEG_F) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldStd(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 5, 6, V20_TABLE) >>> 0, 1,
          "+13 entry must map sx=+1 against dRow=+1");
      });
    withMutant("v20 dCol/dRow crosswire",
      (s) => s.replace(
        "if (s_x == d_row && s_y == d_col) {",
        "if (s_x == d_col && s_y == d_row) {"),
      (exp) => {
        const VIEW = new DataView(exp.memory.buffer);
        vnnWorldStd(VIEW);
        assert.equal(exp["9e3450DoorDir"](V20_THIS, 5, 6, V20_TABLE) >>> 0, 1,
          "rem+1 step carries dRow=+1,dCol=0 — crosswiring must miss");
      });
  } finally {
    writeFileSync(source, original);
    assert.equal(shaOf(readFileSync(source)), origHash, "final restore");
  }
});
