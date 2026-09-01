#include "hud_post_update_pure_helpers.h"

#include <stddef.h>

static_assert(sizeof(IsaacHistoryHudSlotSparse) == 0x14,
              "HistoryHUD slot sparse layout must match PE stride 0x14");
static_assert(offsetof(IsaacHistoryHudSlotSparse, player) == 0, "slot.player");
static_assert(offsetof(IsaacHistoryHudSlotSparse, dirty) == 4, "slot.dirty");
static_assert(offsetof(IsaacHistoryHudSlotSparse, list_begin) == 8, "slot.list_begin");
static_assert(offsetof(IsaacHistoryHudSlotSparse, list_end) == 0xc, "slot.list_end");
static_assert(offsetof(IsaacHistoryHudSlotSparse, list_cap) == 0x10, "slot.list_cap");

/* HUD::PostUpdate (VA 0x009a2b30) pure helpers. Evidence:
   output/decomp/5129df723e64/player-manager-update/decompiled/009a2b30_HUD_PostUpdate.c
   PE disassembly at raw mapping of RVA 0x5a2b30; exact ZHL HUD::PostUpdate.
   Nested callees:
     0x00842230 — large PlayerHUD host (no exact ZHL)
     0x0083b850 — HistoryHUD refresh/RecomputeAll-shaped host (no exact ZHL)
     0x0083b280 — exact HistoryHUD::Recompute
     0x0084c170 — StatHUD tail host + pure countdown (no exact ZHL)

   Machine structure:
     for i in 0..7:
       if (*(HUD + i*0x6dc) != 0) call 0x00842230(PlayerHUD)
     if (*(int*)(Manager+0x2a384) > 0):
       if (HUD+0x5c7c == 0) { HUD+0x5c7c = 1; call 0x0083b850(HistoryHUD, 0) }
       for i in 0..1:
         if (*(u8*)(HUD+0x5c58 + i*0x14) != 0)
           call HistoryHUD::Recompute(i, 1)
     call 0x0084c170(StatHUD at HUD+0x59a4)

   Helpers ABI v2 residual peels:
     HistoryHUD::Recompute pure-complete (idx>1 / null player / immediate==0)
     StatHUD FCO owner-flag + player-vector CF + call-site imms / host VAs

   Helpers ABI v3 residual peels (0x0083b850):
     pure-complete empty shell; reverse walk CF; invalid clear; compact gate;
     player+dirty shift; twin dirty post; list free predicates / free size;
     host VAs GetPlayerIdx + CRT free

   Helpers ABI v4 residual peels (0x0083bbc0 GetPlayerIdx-shaped):
     pure netplay range-empty; pure player eligibility; pure 2-slot resolve
     (match / first-empty cmovs / assign); try_pure with host sample for
     exact NetplayManager::IsIdxLocalPlayer when range non-empty

   Helpers ABI v9 residual peels (0x0083b850 list teardown / sized free):
     both move-3 teardown sites (0x0083b947, 0x0083b9fc) modelled as gates +
     node walk CF + exact free-size magic + CRT header resolve; host leaf
     edges only for the per-node virtual release, the global callback, the
     sized-delete shim 0x00aef15c and _invalid_parameter_noinfo 0x0083bba5.
     Reachable compact emits no free (site A begin always 0; site B gated
     on slot-vs-stack address equality).
*/

extern "C" uint32_t isaac_hud_player_hud_occupied_mask(
    const uint32_t player_ptrs[ISAAC_HUD_PLAYER_HUD_COUNT]) {
  uint32_t mask = 0;
  if (player_ptrs == nullptr) {
    return 0;
  }
  for (int i = 0; i < ISAAC_HUD_PLAYER_HUD_COUNT; ++i) {
    if (player_ptrs[i] != 0u) {
      mask |= (1u << i);
    }
  }
  return mask;
}

extern "C" int32_t isaac_hud_history_block_needed(int32_t manager_history_count) {
  return manager_history_count > 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_history_recompute_all_needed(
    uint32_t history_flag_5c7c) {
  /* Byte test (cmp byte [ebx+0x5c7c],0): widened param, explicit mask. */
  return (history_flag_5c7c & 0xffu) == 0u ? 1 : 0;
}

extern "C" void isaac_hud_history_flag_set(uint8_t* history_flag_5c7c) {
  if (history_flag_5c7c == nullptr) {
    return;
  }
  *history_flag_5c7c = 1;
}

extern "C" int32_t isaac_hud_history_slot_recompute_needed(uint32_t slot_flag) {
  /* Byte test (cmp byte [edi],0): widened param, explicit mask. */
  return (slot_flag & 0xffu) != 0u ? 1 : 0;
}

/* ---- Helpers ABI v18: HUD::PostUpdate per-slot flag loop ----
   Machine order (0x009a2b83..0x009a2baa, cpu-dump 009a2b30):
     xor esi,esi / lea edi,[ebx+0x5c58]    ; i=0, flag_ptr = HUD+0x5c58
     0x009a2b90 cmp byte [edi],0 ; je skip ; per-slot flag byte gate
     0x009a2b95 push 1                     ; immediate = 1
     0x009a2b97 push esi                   ; idx = i
     0x009a2b98 lea ecx,[ebx+0x5c54]       ; this = HistoryHUD
     0x009a2b9e call 0x83b280              ; host HistoryHUD::Recompute(i,1)
     skip 0x009a2ba3 inc esi / add edi,0x14
     0x009a2ba7 cmp esi,2 ; jl 0x009a2b90  ; SIGNED loop-back i<2
   The two slot flag bytes live at HUD+0x5c58 (slot 0) and HUD+0x5c6c
   (slot 1, +0x14 stride). */

extern "C" uint32_t isaac_hud_history_slot_loop_flag_addr(
    uint32_t hud_ptr, uint32_t slot_index) {
  /* 0x009a2b85 lea edi,[ebx+0x5c58]; 0x009a2ba4 add edi,0x14 per step. */
  return hud_ptr + ISAAC_HUD_HISTORY_SLOT0_FLAG_OFFSET +
         slot_index * ISAAC_HUD_HISTORY_SLOT_STRIDE;
}

extern "C" int32_t isaac_hud_history_slot_loop_continue(int32_t next_index) {
  /* 0x009a2ba7 cmp esi,2; 0x009a2baa jl — SIGNED (i+1) < 2 re-enters. */
  return next_index < 2 ? 1 : 0;
}

extern "C" void isaac_hud_history_slot_loop_plan(
    uint32_t slot0_flag,
    uint32_t slot1_flag,
    IsaacHistoryHudSlotLoopPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t s0 = isaac_hud_history_slot_recompute_needed(slot0_flag);
  const int32_t s1 = isaac_hud_history_slot_recompute_needed(slot1_flag);
  out->slot0_recompute = s0;
  out->slot1_recompute = s1;
  out->host_edge_count = s0 + s1;
  out->pure_complete = (s0 == 0 && s1 == 0) ? 1 : 0;
}

extern "C" uint32_t isaac_hud_history_slot_loop_va_head(void) {
  return ISAAC_HUD_HISTORY_SLOT_LOOP_VA_HEAD;
}

extern "C" uint32_t isaac_hud_history_slot_loop_va_flag_gate(void) {
  return ISAAC_HUD_HISTORY_SLOT_LOOP_VA_FLAG_GATE;
}

extern "C" uint32_t isaac_hud_history_slot_loop_va_recompute(void) {
  return ISAAC_HUD_HISTORY_SLOT_LOOP_VA_RECOMPUTE;
}

extern "C" uint32_t isaac_hud_history_slot_loop_va_skip(void) {
  return ISAAC_HUD_HISTORY_SLOT_LOOP_VA_SKIP;
}

extern "C" uint32_t isaac_hud_history_slot_loop_va_loop_back(void) {
  return ISAAC_HUD_HISTORY_SLOT_LOOP_VA_LOOP_BACK;
}

extern "C" uint32_t isaac_hud_history_slot_loop_immediate(void) {
  return static_cast<uint32_t>(ISAAC_HUD_HISTORY_SLOT_LOOP_IMMEDIATE);
}

extern "C" uint32_t isaac_hud_history_slot_loop_recompute_host(void) {
  return ISAAC_HUD_HISTORY_SLOT_LOOP_RECOMPUTE_HOST;
}

extern "C" int32_t isaac_stat_hud_post_update_needed(uint32_t manager_stat_flag) {
  /* Byte test (cmp byte [eax+0x2a37c],0): widened param, explicit mask. */
  return (manager_stat_flag & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_post_update_try_pure(
    uint32_t player_hud_occupied_mask,
    int32_t manager_history_count,
    uint32_t manager_stat_flag) {
  /* Any occupied PlayerHUD slot → host 0x00842230 residual. */
  if ((player_hud_occupied_mask & 0xffu) != 0u) {
    return 1;
  }
  /* Manager history count > 0 → host HistoryHUD residual. */
  if (manager_history_count > 0) {
    return 1;
  }
  /* Manager stat flag ≠ 0 (byte test, low byte masked) → StatHUD tail has
     host player walk + countdown. */
  if ((manager_stat_flag & 0xffu) != 0u) {
    return 1;
  }
  /* Full pure no-op: empty PlayerHUD loop, skipped history, StatHUD early-out. */
  return 0;
}

extern "C" int32_t isaac_hud_post_update_snapshot_safe(
    uint32_t player_hud_occupied_mask) {
  /* The PE reads Manager+0x2a384 at 0x009a2b5a and Manager+0x2a37c at
     0x0084c178, both after the 8-slot `call 0x842230` loop. A pre-dispatch
     snapshot of the two fields is valid only when no slot is occupied. */
  return (player_hud_occupied_mask & 0xffu) == 0u ? 1 : 0;
}

static void tick_group(int32_t* counters, int count) {
  for (int i = 0; i < count; ++i) {
    if (counters[i] > 0) {
      counters[i] -= 1;
    }
  }
}

extern "C" void isaac_stat_hud_countdown_tick(IsaacStatHudCountdownState* state) {
  if (state == nullptr) {
    return;
  }
  tick_group(state->group0, ISAAC_STAT_HUD_COUNTDOWN_PER_GROUP);
  tick_group(state->group1, ISAAC_STAT_HUD_COUNTDOWN_PER_GROUP);
}

extern "C" void isaac_stat_hud_countdown_tick_at(int32_t* base_at_0x13c) {
  if (base_at_0x13c == nullptr) {
    return;
  }
  /* Machine: piVar6 = StatHUD+0x13c; two outer iterations; each ticks
     piVar6[-5], *piVar6, piVar6[5], ... piVar6[0x28] (10 counters, stride 5
     dwords); then piVar6 += 0x33. */
  int32_t* pi = base_at_0x13c;
  for (int group = 0; group < ISAAC_STAT_HUD_COUNTDOWN_GROUPS; ++group) {
    for (int i = 0; i < ISAAC_STAT_HUD_COUNTDOWN_PER_GROUP; ++i) {
      /* i==0 → pi[-5]; i==1 → pi[0]; i==2 → pi[5]; ... pi[0x28] */
      int32_t* slot =
          pi + (i - 1) * ISAAC_STAT_HUD_COUNTDOWN_INNER_STRIDE_DWORDS;
      if (*slot > 0) {
        *slot -= 1;
      }
    }
    pi += ISAAC_STAT_HUD_COUNTDOWN_GROUP_STRIDE_DWORDS;
  }
}

/* ---- Helpers ABI v2: HistoryHUD::Recompute pure-complete shell ---- */

extern "C" int32_t isaac_history_hud_recompute_try_pure(
    uint32_t idx,
    uint32_t immediate,
    uint32_t player_ptr,
    uint8_t* slot_dirty_flag) {
  /* PE: cmp idx, 1; ja epilogue (no store). */
  if (idx > 1u) {
    return 0;
  }
  /* PE: test player; je epilogue (no store). */
  if (player_ptr == 0u) {
    return 0;
  }
  /* PE: cmp immediate, 0; je pure dirty store @ 0x0083b811 — byte test,
     low byte masked. */
  if ((immediate & 0xffu) == 0u) {
    if (slot_dirty_flag != nullptr) {
      *slot_dirty_flag = 1;
    }
    return 0;
  }
  /* immediate != 0 → host residual body. */
  return 1;
}

extern "C" void isaac_history_hud_slot_dirty_set(uint8_t* slot_dirty_flag) {
  if (slot_dirty_flag == nullptr) {
    return;
  }
  *slot_dirty_flag = 1;
}

/* ---- Helpers ABI v2: StatHUD residual pure posts ---- */

extern "C" uint32_t isaac_stat_hud_collectible_id(void) {
  return ISAAC_STAT_HUD_COLLECTIBLE_ID;
}

extern "C" uint32_t isaac_stat_hud_owner_laz_shared_tag(void) {
  return ISAAC_STAT_HUD_OWNER_LAZ_SHARED_TAG;
}

extern "C" uint32_t isaac_stat_hud_player_list_game_offset(void) {
  return ISAAC_STAT_HUD_PLAYER_LIST_GAME_OFFSET;
}

extern "C" uint32_t isaac_stat_hud_owner_flag_offset(void) {
  return ISAAC_STAT_HUD_OWNER_FLAG_OFFSET;
}

extern "C" uint32_t isaac_stat_hud_recompute_flags(void) {
  return ISAAC_STAT_HUD_RECOMPUTE_FLAGS;
}

extern "C" void isaac_stat_hud_apply_owner_flag(
    uint8_t* owner_flag_2ac, uint32_t owner_ptr) {
  if (owner_flag_2ac == nullptr) {
    return;
  }
  /* PE: test eax,eax; setne al; mov [ebx+0x2ac], al */
  *owner_flag_2ac = owner_ptr != 0u ? 1u : 0u;
}

extern "C" int32_t isaac_stat_hud_player_vector_count(
    uint32_t list_begin, uint32_t list_end) {
  /* PE: mov eax, end; sub eax, begin; sar eax, 2 */
  const int32_t diff = static_cast<int32_t>(list_end - list_begin);
  return diff >> 2;
}

extern "C" int32_t isaac_stat_hud_player_walk_needed(int32_t player_count) {
  return player_count != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_stat_hud_player_slot_addr(
    uint32_t list_begin, uint32_t idx, int32_t player_count) {
  /* PE: if (idx < (uint)count) lea eax, [begin+idx*4]; else begin; */
  const uint32_t count = static_cast<uint32_t>(player_count);
  if (idx < count) {
    return list_begin + idx * 4u;
  }
  return list_begin;
}

/* ---- Helpers ABI v5: StatHUD tail walk CF + resolved plan ---- */

extern "C" int32_t isaac_stat_hud_walk_index_select(uint32_t index,
                                                    int32_t count) {
  /* PE 0x0084c1ec: cmp edi, ecx ; jae skip_lea (unsigned). */
  if (index < static_cast<uint32_t>(count)) {
    return static_cast<int32_t>(index);
  }
  return 0;
}

extern "C" int32_t isaac_stat_hud_walk_needs_empty_fatal(int32_t count_now) {
  /* PE 0x0084c1cf: test eax,eax ; jne skip_fatal. */
  return count_now == 0 ? 1 : 0;
}

extern "C" int32_t isaac_stat_hud_walk_continue(uint32_t next_index,
                                                int32_t count_reloaded) {
  /* PE 0x0084c220: cmp edi, eax ; jb loop_top (unsigned). */
  return next_index < static_cast<uint32_t>(count_reloaded) ? 1 : 0;
}

extern "C" int32_t isaac_stat_hud_recompute_count_arg(int32_t count_now) {
  /* PE 0x0084c1f5: push ecx — ecx is the count from `sar ecx,2`. */
  return count_now;
}

extern "C" int32_t isaac_stat_hud_owner_flag_value(uint32_t owner_ptr) {
  return owner_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_stat_hud_tail_host_call_count(int32_t tail_needed,
                                                       int32_t iterations) {
  if (tail_needed == 0) {
    return 0;
  }
  const int32_t n = iterations > 0 ? iterations : 0;
  return 1 + 2 * n;
}

extern "C" int32_t isaac_stat_hud_tail_pure_complete(
    uint32_t manager_stat_flag) {
  return isaac_stat_hud_post_update_needed(manager_stat_flag) == 0 ? 1 : 0;
}

extern "C" void isaac_stat_hud_tail_plan(uint32_t manager_stat_flag,
                                         uint32_t list_begin,
                                         uint32_t list_end,
                                         uint32_t owner_sample,
                                         int32_t owner_known,
                                         IsaacStatHudTailPlan* out) {
  if (out == nullptr) {
    return;
  }

  const int32_t needed = isaac_stat_hud_post_update_needed(manager_stat_flag);
  if (needed == 0) {
    out->tail_needed = 0;
    out->pure_complete = 1;
    out->fco_host_needed = 0;
    out->owner_flag = 0;
    out->owner_flag_known = 0;
    out->player_count = 0;
    out->walk_iterations = 0;
    out->host_call_count = 0;
    out->empty_fatal_needed = 0;
    out->countdown_applied = 0;
    return;
  }

  const int32_t count =
      isaac_stat_hud_player_vector_count(list_begin, list_end);
  const int32_t known = owner_known != 0 ? 1 : 0;
  const int32_t iterations = count > 0 ? count : 0;
  /* A negative count enters the loop (test/je rejects only zero) and the
     unsigned continue never terminates on a stable vector — refuse to model
     it purely. */
  const int32_t torn = count < 0 ? 1 : 0;

  out->tail_needed = 1;
  out->pure_complete = 0;
  out->fco_host_needed = 1;
  out->owner_flag = known != 0 ? isaac_stat_hud_owner_flag_value(owner_sample)
                               : 0;
  out->owner_flag_known = known;
  out->player_count = count;
  out->walk_iterations = torn != 0 ? 0 : iterations;
  out->host_call_count =
      isaac_stat_hud_tail_host_call_count(1, out->walk_iterations);
  out->empty_fatal_needed = torn;
  out->countdown_applied = 1;
}

/* ---- Helpers ABI v5: gate-1ba78 host 0x0092f1c0 head/tail PE-split ---- */

extern "C" int32_t isaac_hud_gate_92f1c0_dispatch_case(uint32_t mode) {
  /* PE: mov eax,[ebx]; dec eax; cmp eax,3; ja tail; jmp [eax*4+0x92ffa4] */
  const uint32_t index = mode - 1u;
  if (index > 3u) {
    return -1;
  }
  return static_cast<int32_t>(index);
}

extern "C" uint32_t isaac_hud_gate_92f1c0_case_va(int32_t dispatch_case) {
  switch (dispatch_case) {
    case 0:
      return static_cast<uint32_t>(ISAAC_HUD_GATE_92F1C0_CASE1_VA);
    case 1:
      return static_cast<uint32_t>(ISAAC_HUD_GATE_92F1C0_CASE2_VA);
    case 2:
      return static_cast<uint32_t>(ISAAC_HUD_GATE_92F1C0_CASE3_VA);
    case 3:
      return static_cast<uint32_t>(ISAAC_HUD_GATE_92F1C0_CASE4_VA);
    default:
      return 0u;
  }
}

extern "C" int32_t isaac_hud_gate_92f1c0_body_host_needed(uint32_t mode) {
  return isaac_hud_gate_92f1c0_dispatch_case(mode) >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_gate_92f1c0_try_pure(uint32_t mode) {
  return isaac_hud_gate_92f1c0_body_host_needed(mode) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_gate_92f1c0_counter_next(int32_t counter) {
  /* PE: inc dword [ebx+4] — wraps at 32 bits. */
  return static_cast<int32_t>(static_cast<uint32_t>(counter) + 1u);
}

extern "C" int32_t isaac_hud_gate_92f1c0_tail_stores_needed(
    uint32_t mode_after_body) {
  /* PE 0x0092ff63: mov eax,[ebx]; cmp eax,3; je store; cmp eax,2; jne skip */
  return (mode_after_body == 3u || mode_after_body == 2u) ? 1 : 0;
}

extern "C" void isaac_hud_gate_92f1c0_plan(uint32_t mode,
                                           uint32_t mode_after_body,
                                           int32_t counter,
                                           IsaacHudGate92f1c0Plan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t dispatch = isaac_hud_gate_92f1c0_dispatch_case(mode);
  out->dispatch_case = dispatch;
  out->body_host_needed = dispatch >= 0 ? 1 : 0;
  out->pure_complete = dispatch >= 0 ? 0 : 1;
  out->counter_out = isaac_hud_gate_92f1c0_counter_next(counter);
  out->tail_stores_needed =
      isaac_hud_gate_92f1c0_tail_stores_needed(mode_after_body);
  out->case_va = isaac_hud_gate_92f1c0_case_va(dispatch);
}

/* ---- Helpers ABI v3: HistoryHUD RecomputeAll-shaped (0x0083b850) ---- */

extern "C" int32_t isaac_history_hud_recompute_all_try_pure(
    uint32_t slot0_player,
    uint32_t slot1_player,
    int32_t player_count) {
  /* Pure no-op only when both slots empty and player list empty.
     Any non-null slot needs host GetPlayerIdx (and possible free/compact).
     Any player needs host GetPlayerIdx + Recompute. */
  if (slot0_player != 0u || slot1_player != 0u) {
    return 1;
  }
  if (player_count != 0) {
    return 1;
  }
  return 0;
}

extern "C" uint32_t isaac_history_hud_slot_count(void) {
  return static_cast<uint32_t>(ISAAC_HUD_HISTORY_SLOT_COUNT);
}

extern "C" uint32_t isaac_history_hud_slot_stride(void) {
  return static_cast<uint32_t>(ISAAC_HUD_HISTORY_SLOT_STRIDE);
}

extern "C" uint32_t isaac_history_hud_reverse_walk_start_cursor(void) {
  return static_cast<uint32_t>(ISAAC_HISTORY_HUD_REVERSE_WALK_START_CURSOR);
}

extern "C" uint32_t isaac_history_hud_reverse_walk_start_offset(void) {
  return static_cast<uint32_t>(ISAAC_HISTORY_HUD_REVERSE_WALK_START_OFFSET);
}

extern "C" uint32_t isaac_history_hud_twin_ptr_offset(void) {
  return ISAAC_HISTORY_HUD_TWIN_PTR_OFFSET;
}

extern "C" uint32_t isaac_history_hud_character_type_offset(void) {
  return ISAAC_HISTORY_HUD_CHARACTER_TYPE_OFFSET;
}

extern "C" uint32_t isaac_history_hud_twin_char_a(void) {
  return ISAAC_HISTORY_HUD_TWIN_CHAR_A;
}

extern "C" uint32_t isaac_history_hud_twin_char_b(void) {
  return ISAAC_HISTORY_HUD_TWIN_CHAR_B;
}

extern "C" uint32_t isaac_history_hud_list_elem_stride(void) {
  return static_cast<uint32_t>(ISAAC_HISTORY_HUD_LIST_ELEM_STRIDE);
}

extern "C" uint32_t isaac_history_hud_player_list_game_offset(void) {
  return ISAAC_HISTORY_HUD_PLAYER_LIST_GAME_OFFSET;
}

extern "C" int32_t isaac_history_hud_reverse_walk_step(
    uint32_t* cursor, uint32_t* offset) {
  if (cursor == nullptr || offset == nullptr) {
    return 0;
  }
  /* PE: dec ebx; sub esi, 0x14; cmp ebx, 1; jge loop */
  *cursor = (*cursor - 1u) & 0xffffffffu;
  *offset = (*offset - static_cast<uint32_t>(ISAAC_HUD_HISTORY_SLOT_STRIDE)) &
            0xffffffffu;
  /* i64 sign-extend (wasm compare-flip class): (int32)*cursor >= 1. */
  return (int64_t)(int32_t)(*cursor) >= 1 ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_player_idx_invalid(
    int32_t get_player_idx_result) {
  /* PE: test eax,eax; jns keep — invalid when signed negative. */
  return get_player_idx_result < 0 ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_slot_compact_needed(
    uint32_t reverse_cursor) {
  /* PE: cmp ebx, 2; jae skip_compact — compact when cursor < 2. */
  return reverse_cursor < 2u ? 1 : 0;
}

extern "C" void isaac_history_hud_slot_player_clear(uint32_t* slot_player) {
  if (slot_player == nullptr) {
    return;
  }
  *slot_player = 0u;
}

extern "C" int32_t isaac_history_hud_slot_compact_triple_move_needed(
    uint32_t dst_slot_addr, uint32_t src_slot_addr) {
  /* PE 0x0083b908: cmp (&dst.list_begin), (&src.list_begin) ; je skip. */
  const uint32_t dst_list =
      dst_slot_addr + static_cast<uint32_t>(ISAAC_HISTORY_HUD_SLOT_LIST_BEGIN_OFFSET);
  const uint32_t src_list =
      src_slot_addr + static_cast<uint32_t>(ISAAC_HISTORY_HUD_SLOT_LIST_BEGIN_OFFSET);
  return dst_list != src_list ? 1 : 0;
}

extern "C" void isaac_history_hud_slot_compact_swap(
    IsaacHistoryHudSlotSparse* dst,
    IsaacHistoryHudSlotSparse* src,
    IsaacHistoryHudSlotListTriple* out_dst_old_list) {
  if (dst == nullptr || src == nullptr) {
    return;
  }

  /* move 1 (temp := dst). 0x0083b8c2 / 0x0083b8c8 save dst.dirty and
     dst.player; 0x0083b8ce..0x0083b8e3 read dst's triple into the stack temp
     (PE order cap, end, begin) and zero the slot's copy. */
  const uint8_t saved_dst_dirty = dst->dirty;
  const uint32_t saved_dst_player = dst->player;
  const uint32_t old_cap = dst->list_cap;
  dst->list_cap = 0u;
  const uint32_t old_end = dst->list_end;
  dst->list_end = 0u;
  const uint32_t old_begin = dst->list_begin;
  dst->list_begin = 0u;

  /* move 2 (dst := src). 0x0083b8f0 / 0x0083b8f6 copy src's player and
     dirty down; 0x0083b90c..0x0083b929 move src's list triple into dst and
     zero src's, behind the 0x0083b908 address guard (equal only when
     dst==src, where the slot triple is already zero from move 1). */
  dst->player = src->player;
  dst->dirty = src->dirty;
  if (isaac_history_hud_slot_compact_triple_move_needed(
          ISAAC_HISTORY_HUD_SLOT_LIST_BEGIN_OFFSET,
          ISAAC_HISTORY_HUD_SLOT_LIST_BEGIN_OFFSET +
              ISAAC_HUD_HISTORY_SLOT_STRIDE) != 0 &&
      dst != src) {
    dst->list_begin = src->list_begin;
    dst->list_end = src->list_end;
    dst->list_cap = src->list_cap;
    src->list_begin = 0u;
    src->list_end = 0u;
    src->list_cap = 0u;
  }

  /* move 3 (src := temp). 0x0083b936 / 0x0083b93c store the SAVED dst
     scalars into src; the 0x0083b947 destination-empty test always passes
     (src.begin was zeroed by move 2, or by move 1 when dst==src), so the
     destructor walk + free at 0x0083b951..0x0083b9de never runs and the
     adopt at 0x0083b9ec..0x0083b9f4 moves dst's FORMER triple into src.
     0x0083ba90..0x0083ba9e zero the temp — nothing is ever freed. */
  src->dirty = saved_dst_dirty;
  src->player = saved_dst_player;
  src->list_begin = old_begin;
  src->list_end = old_end;
  src->list_cap = old_cap;

  /* Observability only: the triple now held by src (NOT a free residual). */
  if (out_dst_old_list != nullptr) {
    out_dst_old_list->list_begin = old_begin;
    out_dst_old_list->list_end = old_end;
    out_dst_old_list->list_cap = old_cap;
  }
}

extern "C" int32_t isaac_history_hud_slot_compact_loop_continue(
    int32_t cursor_after_inc) {
  /* PE 0x0083bab2: inc eax ; cmp eax, 2 ; jl 0x83b8c2 — SIGNED. */
  return cursor_after_inc < 2 ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_twin_char_eligible(int32_t character_type) {
  return (character_type == static_cast<int32_t>(ISAAC_HISTORY_HUD_TWIN_CHAR_A) ||
          character_type == static_cast<int32_t>(ISAAC_HISTORY_HUD_TWIN_CHAR_B))
             ? 1
             : 0;
}

extern "C" int32_t isaac_history_hud_twin_dirty_needed(
    uint32_t twin_ptr,
    int32_t character_type,
    uint32_t twin_idx,
    uint32_t slot_player_at_twin_idx) {
  /* PE after nested Recompute:
       twin = player+0x1e6c; if twin==0 skip
       type = player+0x13c0; if type!=0x1d && type!=0x26 skip
       twin_idx = host GetPlayerIdx(twin)
       if twin_idx > 1 (unsigned ja) skip
       if HistoryHUD[twin_idx].player == 0 skip
       else pure dirty = 1 */
  if (twin_ptr == 0u) {
    return 0;
  }
  if (isaac_history_hud_twin_char_eligible(character_type) == 0) {
    return 0;
  }
  if (twin_idx > 1u) {
    return 0;
  }
  if (slot_player_at_twin_idx == 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_history_hud_list_byte_size(
    uint32_t list_begin, uint32_t list_end) {
  /* PE: size = ((end - begin) / 0x28) * 0x28 via imul 0x66666667 magic.
     Equivalent: truncate byte length down to multiple of 0x28. */
  const int32_t diff = static_cast<int32_t>(list_end - list_begin);
  if (diff <= 0) {
    return 0u;
  }
  const uint32_t n = static_cast<uint32_t>(diff) / static_cast<uint32_t>(
                                                       ISAAC_HISTORY_HUD_LIST_ELEM_STRIDE);
  return n * static_cast<uint32_t>(ISAAC_HISTORY_HUD_LIST_ELEM_STRIDE);
}

extern "C" int32_t isaac_history_hud_list_free_needed(uint32_t list_begin) {
  return list_begin != 0u ? 1 : 0;
}

/* ---- Helpers ABI v4: GetPlayerIdx-shaped (0x0083bbc0) ---- */

extern "C" uint32_t isaac_history_get_player_idx_netplay_embed_off(void) {
  return ISAAC_HISTORY_GET_PLAYER_IDX_NETPLAY_EMBED_OFF;
}

extern "C" uint32_t isaac_history_get_player_idx_player_net_idx_off(void) {
  return ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_NET_IDX_OFF;
}

extern "C" uint32_t isaac_history_get_player_idx_player_field_2c_off(void) {
  return ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_FIELD_2C_OFF;
}

extern "C" uint32_t isaac_history_get_player_idx_player_field_3bc_off(void) {
  return ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_FIELD_3BC_OFF;
}

extern "C" uint32_t isaac_history_get_player_idx_player_char_type_off(void) {
  return ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_CHAR_TYPE_OFF;
}

extern "C" uint32_t isaac_history_get_player_idx_reject_char(void) {
  return static_cast<uint32_t>(ISAAC_HISTORY_GET_PLAYER_IDX_REJECT_CHAR);
}

extern "C" int32_t isaac_history_hud_get_player_idx_netplay_range_empty(
    uint32_t netplay_begin, uint32_t netplay_end) {
  /* PE: mov eax,[ecx]; cmp eax,[ecx+4]; je skip_local_check */
  return netplay_begin == netplay_end ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_get_player_idx_player_eligible(
    uint32_t player_field_2c,
    uint32_t player_field_3bc,
    int32_t player_char_type) {
  /* PE:
       cmp dword [edi+0x2c], 0; jne reject
       cmp dword [edi+0x3bc], 0; jne reject
       cmp dword [edi+0x13c0], 0x28; je reject */
  if (player_field_2c != 0u) {
    return 0;
  }
  if (player_field_3bc != 0u) {
    return 0;
  }
  if (player_char_type == static_cast<int32_t>(ISAAC_HISTORY_GET_PLAYER_IDX_REJECT_CHAR)) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_history_hud_get_player_idx_resolve(
    uint32_t slot0_player,
    uint32_t slot1_player,
    uint32_t player_ptr,
    uint32_t* out_slot0_player,
    uint32_t* out_slot1_player) {
  /* PE 2-slot walk: match → return i; else first empty (cmovs) with assign. */
  const uint32_t slots[2] = {slot0_player, slot1_player};
  int32_t empty = -1;
  for (int32_t i = 0; i < ISAAC_HUD_HISTORY_SLOT_COUNT; ++i) {
    if (slots[static_cast<uint32_t>(i)] == player_ptr) {
      return i;
    }
    if (slots[static_cast<uint32_t>(i)] == 0u) {
      /* PE: test eax,eax; cmovs eax, ecx — keep first empty only. */
      if (empty < 0) {
        empty = i;
      }
    }
  }
  if (empty < 0) {
    return -1;
  }
  /* Assign player into first empty slot (side effect). */
  if (empty == 0) {
    if (out_slot0_player != nullptr) {
      *out_slot0_player = player_ptr;
    }
    if (out_slot1_player != nullptr) {
      *out_slot1_player = slot1_player;
    }
  } else {
    if (out_slot0_player != nullptr) {
      *out_slot0_player = slot0_player;
    }
    if (out_slot1_player != nullptr) {
      *out_slot1_player = player_ptr;
    }
  }
  return empty;
}

extern "C" int32_t isaac_history_hud_get_player_idx_try_pure(
    uint32_t netplay_begin,
    uint32_t netplay_end,
    int32_t netplay_local_known,
    uint32_t player_field_2c,
    uint32_t player_field_3bc,
    int32_t player_char_type,
    uint32_t slot0_player,
    uint32_t slot1_player,
    uint32_t player_ptr,
    uint32_t* out_slot0_player,
    uint32_t* out_slot1_player,
    int32_t* out_idx) {
  /* Host IsIdxLocalPlayer when range non-empty and sample unknown. */
  if (isaac_history_hud_get_player_idx_netplay_range_empty(netplay_begin,
                                                           netplay_end) == 0) {
    if (netplay_local_known < 0) {
      return 1;
    }
    if (netplay_local_known == 0) {
      if (out_idx != nullptr) {
        *out_idx = -1;
      }
      return 0;
    }
    /* local_known == 1 → fall through to pure eligibility/resolve */
  }

  if (isaac_history_hud_get_player_idx_player_eligible(
          player_field_2c, player_field_3bc, player_char_type) == 0) {
    if (out_idx != nullptr) {
      *out_idx = -1;
    }
    return 0;
  }

  const int32_t idx = isaac_history_hud_get_player_idx_resolve(
      slot0_player, slot1_player, player_ptr, out_slot0_player,
      out_slot1_player);
  if (out_idx != nullptr) {
    *out_idx = idx;
  }
  return 0;
}

/* ---- Helpers ABI v9: list teardown / sized free residual (0x0083b850) ---- */

extern "C" int32_t isaac_history_hud_list_teardown_needed(
    uint32_t list_begin) {
  /* PE 0x0083b947/0x0083b9fc: mov esi,[dest]; test esi,esi; je skip. */
  return list_begin != 0u ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_list_walk_needed(
    uint32_t list_begin, uint32_t list_end) {
  /* PE 0x0083b957/0x0083ba04: cmp begin,end; je free-only. The buffer is
     freed even when the node walk is skipped. */
  return list_begin != list_end ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_list_walk_count(
    uint32_t list_begin, uint32_t list_end) {
  /* The PE walk is a pointer loop (`add esi,0x28 ; cmp esi,end ; jne`),
     not a counted loop. The node count is exact only for a well-formed
     span (0 <= end-begin, multiple of the 0x28 stride); every other span
     makes the loop unbounded, so the caller must run the monolithic host. */
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  if (span < 0 || (span % static_cast<int32_t>(ISAAC_HISTORY_HUD_LIST_ELEM_STRIDE)) != 0) {
    return -1;
  }
  return span / static_cast<int32_t>(ISAAC_HISTORY_HUD_LIST_ELEM_STRIDE);
}

extern "C" int32_t isaac_history_hud_list_walk_continue(
    uint32_t next_elem, uint32_t list_end) {
  /* PE 0x0083b999/0x0083ba45: cmp next,end ; jne loop. */
  return next_elem != list_end ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_list_teardown_node_release_needed(
    uint32_t node_sub_ptr) {
  /* PE 0x0083b967/0x0083ba17: mov ecx,[node+8]; test ecx,ecx; je skip.
     The release itself is a host virtual call: vtable at *(node+8), entry
     +0xc, this = node+8, no stack args, byte result. */
  return node_sub_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_list_teardown_callback_needed(
    uint32_t callback_global) {
  /* PE 0x0083b979/0x0083ba29: mov ecx,[0xc7163c]; test ecx,ecx; je skip.
     The callback is host: callback(node+4), cdecl. */
  return callback_global != 0u ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_list_teardown_free_size(
    uint32_t list_begin, uint32_t list_cap) {
  /* PE 0x0083b9a3..0x0083b9bf (site A) / 0x0083ba4c..0x0083ba65 (site B):
       span = (int32)(cap - begin)
       edx:eax = span * 0x66666667        (imul, signed 64-bit)
       edx >>= 4                          (sar)
       eax = edx; eax >>= 31              (logical); eax += edx
       size = eax*5*8  →  trunc_toward_zero(span / 0x28) * 0x28
     Negative spans stay negative (32-bit wrap); they then trip the
     unsigned large gate below. */
  const int32_t span = static_cast<int32_t>(list_cap - list_begin);
  const int64_t prod = static_cast<int64_t>(span) * INT64_C(0x66666667);
  int32_t hi = static_cast<int32_t>(static_cast<uint64_t>(prod) >> 32u);
  hi >>= 4; /* sar */
  const int32_t rounded =
      hi + static_cast<int32_t>(static_cast<uint32_t>(hi) >> 31u);
  return static_cast<int32_t>(static_cast<uint32_t>(rounded) * 40u);
}

extern "C" int32_t isaac_history_hud_list_teardown_large_gate(
    int32_t free_size) {
  /* PE 0x0083b9bf/0x0083ba68: cmp size,0x1000; jb skip — UNSIGNED. */
  return static_cast<uint32_t>(free_size) >= ISAAC_HISTORY_HUD_FREE_LARGE_GATE
             ? 1
             : 0;
}

extern "C" int32_t isaac_history_hud_list_teardown_header_resolve(
    uint32_t header,
    uint32_t list_begin,
    int32_t free_size,
    uint32_t* out_free_ptr,
    int32_t* out_free_size_arg) {
  /* PE 0x0083b9c6..0x0083b9da (site A) / 0x0083ba70..0x0083ba84 (site B):
       header   = *(begin - 4)              (runtime sample)
       size_arg = free_size + 0x23
       if ((u32)(begin - header - 4) > 0x1f) → _invalid_parameter_noinfo
       free_ptr = header
     Returns 1 when the invalid_parameter edge must be taken (host, no
     return); 0 with out_free_ptr / out_free_size_arg set. */
  const uint32_t offset_check = list_begin - header - 4u;
  if (offset_check > ISAAC_HISTORY_HUD_FREE_HEADER_OFFSET_BOUND) {
    return 1;
  }
  if (out_free_ptr != nullptr) {
    *out_free_ptr = header;
  }
  if (out_free_size_arg != nullptr) {
    *out_free_size_arg = static_cast<int32_t>(
        static_cast<uint32_t>(free_size) + ISAAC_HISTORY_HUD_FREE_HEADER_SIZE);
  }
  return 0;
}

extern "C" void isaac_history_hud_list_teardown_plan(
    uint32_t list_begin,
    uint32_t list_end,
    uint32_t list_cap,
    int32_t header_known,
    uint32_t header,
    IsaacHistoryHudListTeardownPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t teardown = isaac_history_hud_list_teardown_needed(list_begin);
  const int32_t walk = isaac_history_hud_list_walk_needed(list_begin, list_end);
  const int32_t count = isaac_history_hud_list_walk_count(list_begin, list_end);
  const int32_t unbounded = count < 0 ? 1 : 0;
  const int32_t free_size =
      isaac_history_hud_list_teardown_free_size(list_begin, list_cap);
  const int32_t large = isaac_history_hud_list_teardown_large_gate(free_size);
  const int32_t known = header_known != 0 ? 1 : 0;

  out->teardown_needed = teardown;
  out->walk_needed = walk;
  out->walk_count = count;
  out->unbounded = unbounded;
  out->host_node_edges = (teardown != 0 && walk != 0 && unbounded == 0) ? count : 0;
  out->free_size = free_size;
  out->large_gate = large;
  out->invalid_parameter_needed = 0;
  out->free_ptr = 0u;
  out->free_size_arg = 0;
  out->host_free_needed = 0;
  out->free_monolithic = 0;

  if (teardown == 0) {
    return;
  }
  if (unbounded != 0) {
    /* A non-stride/negative span makes the PE pointer walk unbounded, so
       the free edge is not enumerable from the pure model: the host runs
       the whole teardown body as-is. */
    out->host_free_needed = 1;
    out->free_monolithic = 1;
    return;
  }
  if (large == 0) {
    out->free_ptr = list_begin;
    out->free_size_arg = free_size;
    out->host_free_needed = 1;
    return;
  }
  if (known == 0) {
    /* Large buffer, no *(begin-4) sample: the host must resolve the CRT
       header itself. */
    out->host_free_needed = 1;
    out->free_monolithic = 1;
    return;
  }
  if (isaac_history_hud_list_teardown_header_resolve(
          header, list_begin, free_size, &out->free_ptr,
          &out->free_size_arg) != 0) {
    out->invalid_parameter_needed = 1;
    return;
  }
  out->host_free_needed = 1;
}

extern "C" void isaac_history_hud_slot_compact_teardown_order(
    uint32_t src_begin_addr,
    uint32_t temp_addr,
    uint32_t src_begin_after_move2,
    uint32_t temp_begin,
    IsaacHistoryHudCompactTeardownOrder* out) {
  /* Ordering of frees inside the compact (0x0083b8bc..0x0083ba9e):
       move 3 `b = std::move(temp)`:
         site A (0x0083b947): teardown b's CURRENT list BEFORE b adopts
           temp's triple. In the reachable compact b == src, whose triple
           move 2 zeroed → begin_after_move2 == 0 → never fires.
         site B (0x0083b9fc): the self-move branch, gated on the ADDRESS
           equality &b.begin == &temp (0x0083b93f cmp eax,edx; je). A slot
           address never equals a stack temp in this function → never
           fires. When it WOULD fire it tears down temp's list instead of
           adopting it, then the temp is zeroed (0x0083ba90). */
  if (out == nullptr) {
    return;
  }
  const int32_t site_a =
      isaac_history_hud_list_teardown_needed(src_begin_after_move2);
  const int32_t site_b =
      (src_begin_addr == temp_addr) != 0
          ? isaac_history_hud_list_teardown_needed(temp_begin)
          : 0;
  out->site_a_needed = site_a;
  out->site_b_needed = site_b;
  out->any_teardown_needed = (site_a != 0 || site_b != 0) ? 1 : 0;
}

extern "C" uint32_t isaac_history_hud_list_node_sub_offset(void) {
  return ISAAC_HISTORY_HUD_LIST_NODE_SUB_OFF;
}

extern "C" uint32_t isaac_history_hud_list_node_callback_arg_offset(void) {
  return ISAAC_HISTORY_HUD_LIST_NODE_CALLBACK_ARG_OFF;
}

extern "C" uint32_t isaac_history_hud_list_vtable_release_entry(void) {
  return ISAAC_HISTORY_HUD_LIST_VTABLE_RELEASE_ENTRY;
}

extern "C" uint32_t isaac_history_hud_list_callback_global(void) {
  return ISAAC_HISTORY_HUD_LIST_CALLBACK_GLOBAL;
}

extern "C" uint32_t isaac_history_hud_free_large_gate(void) {
  return ISAAC_HISTORY_HUD_FREE_LARGE_GATE;
}

extern "C" uint32_t isaac_history_hud_free_header_size(void) {
  return ISAAC_HISTORY_HUD_FREE_HEADER_SIZE;
}

extern "C" uint32_t isaac_history_hud_free_header_offset_bound(void) {
  return ISAAC_HISTORY_HUD_FREE_HEADER_OFFSET_BOUND;
}

/* ---- Helpers ABI v10: nested Recompute walk continuation (0x0083b850
   phase-2 player walk). Machine order (0x83baf8..0x83bb91):
     entry  0x83bae5 count = (end-begin)>>2; test; je exit        (skip all)
     loop   0x83baf8 reload end; count2 = (end-begin)>>2
            0x83bb02 test count2; jne body  -> 0 -> fatal 0x00a112c0
            0x83bb18 select addr (UNSIGNED), load player
            0x83bb2d host GetPlayerIdx(player) -> idx
            0x83bb36 host Recompute(idx, immediate)
            0x83bb3b twin chain + char gate -> 0x83bb59 host GetPlayerIdx(twin)
            0x83bb5e twin_idx <= 1 (unsigned) && slot player != 0
            0x83bb6f *(u8*)(hud + twin_idx*0x14 + 4) = 1
     back  0x83bb89 ++idx; jb while idx < (u32) RELOADED count
   The immediate is loaded once before the loop and re-pushed per node as
   the second Recompute argument. The imported gate only rejects a ZERO
   entry count; negative counts run away -> plan monolithic. */

extern "C" int32_t isaac_history_hud_recompute_walk_entry_needed(
    int32_t player_count) {
  /* 0x0083bad7 mov esi,[0xc71678]; xor edi,edi; add esi,0x1baa8;
     0x0083bae5 mov eax,[esi+4]; sub eax,[esi]; sar eax,2;
     0x0083baed test eax,eax; je 0x83bb91 (whole walk skipped, no events). */
  return player_count != 0 ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_recompute_walk_player_count(
    uint32_t list_begin, uint32_t list_end) {
  /* 0x0083bae5 mov eax,[esi+4] ; sub eax,[esi] ; sar eax,2. */
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  return span >> 2;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_select_addr(
    uint32_t list_begin, uint32_t idx, int32_t player_count) {
  /* 0x0083bb1f cmp edi,ecx ; jae 0x83bb26 ; lea eax,[eax+edi*4] — UNSIGNED
     bound; an out-of-range index falls back to list_begin (the PE then
     re-reads player 0). */
  if (idx < static_cast<uint32_t>(player_count)) {
    return list_begin + idx * 4u;
  }
  return list_begin;
}

extern "C" int32_t isaac_history_hud_recompute_walk_fatal_needed(
    int32_t count_reloaded) {
  /* 0x0083bb02 test eax,eax ; jne 0x83bb18 — only a ZERO reloaded count
     logs the fatal. The entry zero-count path skips the walk instead. */
  return count_reloaded == 0 ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_recompute_walk_continue(
    uint32_t next_index, int32_t count_reloaded) {
  /* 0x0083bb89 cmp edi,eax ; jb 0x83baf8 — UNSIGNED idx < count, and the
     count is RELOADED from the live vector at the loop back, never a
     saved bound. */
  return next_index < static_cast<uint32_t>(count_reloaded) ? 1 : 0;
}

extern "C" void isaac_history_hud_recompute_walk_plan(
    uint32_t list_begin,
    uint32_t list_end,
    IsaacHistoryHudRecomputeWalkPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t count = isaac_history_hud_recompute_walk_player_count(
      list_begin, list_end);
  const int32_t walk = count != 0 ? 1 : 0;
  const int32_t monolithic = count < 0 ? 1 : 0;
  const int32_t iterations = (walk != 0 && monolithic == 0) ? count : 0;
  out->walk_needed = walk;
  out->player_count = count;
  out->pure_complete = (count == 0) ? 1 : 0;
  out->monolithic = monolithic;
  out->iterations = iterations;
  /* Max host edges per iteration: GetPlayerIdx + Recompute + twin
     GetPlayerIdx. The per-node plan narrows this (v2/v4 shells make the
     GetPlayerIdx / Recompute body replaceable by pure islands; the ternary
     only counts calls the PE texture executes). */
  out->host_edge_budget = iterations * 3;
  /* Stable vector: the entry gate guarantees every reloaded count is the
     same nonzero value, so the mid-loop fatal (0x00a112c0) is unreachable.
     A live vector that empties inside host bodies is reported per
     iteration by isaac_history_hud_recompute_walk_fatal_needed. */
  out->fatal_reachable = 0;
}

extern "C" void isaac_history_hud_recompute_walk_node_plan(
    uint32_t hud_ptr,
    uint32_t list_begin,
    uint32_t idx,
    int32_t player_count,
    uint32_t immediate,
    uint32_t netplay_begin,
    uint32_t netplay_end,
    int32_t netplay_local_known,
    uint32_t player_ptr,
    int32_t idx_for_recompute,
    uint32_t twin_ptr,
    int32_t twin_character_type,
    int32_t twin_idx_result,
    uint32_t slot0_player,
    uint32_t slot1_player,
    IsaacHistoryHudRecomputeWalkNode* out) {
  if (out == nullptr) {
    return;
  }
  out->iteration = idx;
  out->player_addr = isaac_history_hud_recompute_walk_select_addr(
      list_begin, idx, player_count);
  out->idx_for_recompute = static_cast<uint32_t>(idx_for_recompute);

  /* GetPlayerIdx body host edge (v4 shell): the exact body 0x0083bbc0 calls
     the virtual NetplayManager::IsIdxLocalPlayer when the netplay range at
     *Mgr+0x4b3d8 is non-empty and the caller has no local sample. */
  const int32_t netplay_host =
      (netplay_begin != netplay_end) != 0 && netplay_local_known < 0 ? 1 : 0;
  out->get_player_idx_host = netplay_host;

  /* Recompute body 0x0083b280 host edge / pure dirty store: the PE tests
     idx with `cmp eax,1; ja` (UNSIGNED <=1), the slot player (already the
     dereferenced player*), and the immediate BYTE (`cmp byte [ebx+0xc],0`).
     Wide immediates must be masked: 0x100 behaves like 0 (pure dirty). */
  const int32_t recompute_body_needed =
      (static_cast<uint32_t>(idx_for_recompute) <= 1u &&
       player_ptr != 0u && (immediate & 0xffu) != 0u)
          ? 1
          : 0;
  const int32_t recompute_pure_dirty =
      (static_cast<uint32_t>(idx_for_recompute) <= 1u &&
       player_ptr != 0u && (immediate & 0xffu) == 0u)
          ? 1
          : 0;
  out->recompute_host = recompute_body_needed;
  out->recompute_pure_dirty = recompute_pure_dirty;
  out->recompute_dirty_addr =
      recompute_pure_dirty != 0
          ? hud_ptr + static_cast<uint32_t>(idx_for_recompute) * 0x14u + 4u
          : 0u;

  /* Twin chain: 0x83bb3b mov ecx,[esi+0x1e6c]; test; je skip;
     0x83bb45 mov eax,[esi+0x13c0]; cmp 0x1d; je; cmp 0x26; jne skip. */
  const int32_t twin_eligible =
      (twin_ptr != 0u &&
       (twin_character_type == ISAAC_HISTORY_HUD_TWIN_CHAR_A ||
        twin_character_type == ISAAC_HISTORY_HUD_TWIN_CHAR_B))
          ? 1
          : 0;
  out->twin_present = twin_eligible;
  out->twin_get_player_idx_host =
      (twin_eligible != 0 && netplay_host != 0) ? 1 : 0;

  /* Twin mark: 0x83bb5e cmp eax,1; ja skip (UNSIGNED <=1);
     0x83bb63 lea eax,[eax+eax*4]; 0x83bb69 cmp [edx+eax*4],0; je skip;
     0x83bb6f mov byte [edx+eax*4+4],1. slot[twin_idx].player is chosen
     from the two live slot samples — the caller must pass the CURRENT
     values (the pure GetPlayerIdx resolves may have assigned one). */
  const uint32_t twin_idx = static_cast<uint32_t>(twin_idx_result);
  const uint32_t twin_slot_player =
      twin_idx == 0u ? slot0_player : (twin_idx == 1u ? slot1_player : 0u);
  const int32_t twin_dirty =
      (twin_eligible != 0 && twin_idx <= 1u && twin_slot_player != 0u) ? 1 : 0;
  out->twin_dirty = twin_dirty;
  out->twin_dirty_slot_addr =
      twin_dirty != 0 ? hud_ptr + twin_idx * 0x14u + 4u : 0u;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_va_get_player_idx(void) {
  return ISAAC_HISTORY_HUD_WALK_VA_GET_PLAYER_IDX;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_va_recompute(void) {
  return ISAAC_HISTORY_HUD_WALK_VA_RECOMPUTE;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_va_twin_get_player_idx(void) {
  return ISAAC_HISTORY_HUD_WALK_VA_TWIN_GET_PLAYER_IDX;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_va_fatal(void) {
  return ISAAC_HISTORY_HUD_WALK_VA_FATAL;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_va_mark(void) {
  return ISAAC_HISTORY_HUD_WALK_VA_TWIN_MARK;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_fatal_string(void) {
  return ISAAC_HISTORY_HUD_WALK_FATAL_STRING_VA;
}

extern "C" uint32_t isaac_history_hud_recompute_walk_fatal_arg(void) {
  return ISAAC_HISTORY_HUD_WALK_FATAL_ARG;
}

extern "C" uint32_t isaac_hud_host_va_invalid_parameter(void) {
  return ISAAC_HUD_HOST_VA_INVALID_PARAMETER;
}

extern "C" uint32_t isaac_hud_host_va_history_recompute(void) {
  return ISAAC_HUD_HOST_VA_HISTORY_RECOMPUTE;
}

extern "C" uint32_t isaac_hud_host_va_history_recompute_all(void) {
  return ISAAC_HUD_HOST_VA_HISTORY_RECOMPUTE_ALL;
}

extern "C" uint32_t isaac_hud_host_va_history_get_player_idx(void) {
  return ISAAC_HUD_HOST_VA_HISTORY_GET_PLAYER_IDX;
}

extern "C" uint32_t isaac_hud_host_va_first_collectible_owner(void) {
  return ISAAC_HUD_HOST_VA_FIRST_COLLECTIBLE_OWNER;
}

extern "C" uint32_t isaac_hud_host_va_stat_get_player_id(void) {
  return ISAAC_HUD_HOST_VA_STAT_GET_PLAYER_ID;
}

extern "C" uint32_t isaac_hud_host_va_stat_recompute_stats(void) {
  return ISAAC_HUD_HOST_VA_STAT_RECOMPUTE_STATS;
}

extern "C" uint32_t isaac_hud_host_va_stat_post_update(void) {
  return ISAAC_HUD_HOST_VA_STAT_POST_UPDATE;
}

extern "C" uint32_t isaac_hud_host_va_fatal_log(void) {
  return ISAAC_HUD_HOST_VA_FATAL_LOG;
}

extern "C" uint32_t isaac_hud_host_va_crt_free(void) {
  return ISAAC_HUD_HOST_VA_CRT_FREE;
}

extern "C" uint32_t isaac_hud_host_va_netplay_is_idx_local(void) {
  return ISAAC_HUD_HOST_VA_NETPLAY_IS_IDX_LOCAL;
}

/* ---- Helpers ABI v11: exact NetplayManager::IsIdxLocalPlayer (0x0090b100)
   Machine order (evidence: section-notes/hud-v11/disasm-90b100-islocallocal.txt):
     0x90b103 mov eax,[ecx]        ; begin
     0x90b105 xor edx,edx          ; i = 0
     0x90b107 mov ecx,[ecx+4]      ; end
     0x90b10a sub ecx,eax
     0x90b10c sar ecx,2            ; count
     0x90b111 test ecx,ecx ; je 0x90b127   -> pure true
     0x90b115 mov edi,[ebp+8]      ; idx
     loop 0x90b118: mov esi,[eax]  ; p = begin[i]
       0x90b11a cmp [esi+0xc],edi ; je 0x90b12f (found)
       0x90b11f inc edx ; add eax,4
       0x90b123 cmp edx,ecx ; jb loop       ; UNSIGNED loop-back
     0x90b127: al = 1 ; ret                 ; true (no match)
     0x90b12f: mov eax,[esi+0x370] ; lea ecx,[esi+0x370]
       0x90b13b mov eax,[eax+0x14] ; call eax   ; HOST virtual leaf
       0x90b140: ret 4                        ; byte result
   A negative count passes the zero gate but the unsigned loop-back runs
   away (u32 count >= 0x80000000) -> the plan reports monolithic. */

extern "C" int32_t isaac_netplay_is_idx_local_player_count(
    uint32_t list_begin, uint32_t list_end) {
  /* 0x90b10a sub ecx,eax ; sar ecx,2. */
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  return span >> 2;
}

extern "C" int32_t isaac_netplay_is_idx_local_player_empty(
    int32_t player_count) {
  /* 0x90b111 test ecx,ecx ; je 0x90b127 (return true). */
  return player_count == 0 ? 1 : 0;
}

extern "C" int32_t isaac_netplay_is_idx_local_player_match(
    uint32_t player_field_c, uint32_t idx) {
  /* 0x90b11a cmp [esi+0xc], edi ; je found — dword compare. */
  return player_field_c == idx ? 1 : 0;
}

extern "C" int32_t isaac_netplay_is_idx_local_player_continue(
    uint32_t next_index, int32_t player_count) {
  /* 0x90b123 cmp edx,ecx ; jb loop — UNSIGNED. */
  return next_index < static_cast<uint32_t>(player_count) ? 1 : 0;
}

extern "C" void isaac_netplay_is_idx_local_player_plan(
    uint32_t list_begin,
    uint32_t list_end,
    int32_t match_index,
    IsaacNetplayIsIdxLocalPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t count =
      isaac_netplay_is_idx_local_player_count(list_begin, list_end);
  const int32_t empty = isaac_netplay_is_idx_local_player_empty(count);
  const int32_t monolithic = count < 0 ? 1 : 0;
  const int32_t match = (monolithic == 0 && match_index >= 0) ? match_index : -1;
  const int32_t host =
      (match >= 0 && monolithic == 0) ? 1 : 0;
  const int32_t pure =
      (empty != 0 || (monolithic == 0 && match < 0)) ? 1 : 0;

  out->count = count;
  out->empty = empty;
  out->monolithic = monolithic;
  out->match_index = match;
  out->match_player_addr =
      match >= 0 ? list_begin + static_cast<uint32_t>(match) * 4u : 0u;
  out->host_virtual_needed = host;
  out->pure_complete = pure;
  out->pure_result = pure;
  out->result_known = pure;
}

extern "C" uint32_t isaac_netplay_is_idx_local_player_field_c_off(void) {
  return ISAAC_NETPLAY_IS_IDX_LOCAL_PLAYER_FIELD_C_OFF;
}

extern "C" uint32_t isaac_netplay_is_idx_local_player_vtable_off(void) {
  return ISAAC_NETPLAY_IS_IDX_LOCAL_PLAYER_VTABLE_OFF;
}

extern "C" uint32_t isaac_netplay_is_idx_local_player_vtable_entry_off(void) {
  return ISAAC_NETPLAY_IS_IDX_LOCAL_VTABLE_ENTRY_OFF;
}

/* ---- Helpers ABI v11: exact Entity_Player::IsHologram (0x007db700)
   Machine order (0x7db700..0x7db73f), all pure:
     0x7db700 cmp byte [ecx+0x172],0 ; je false
     0x7db709 mov eax,[ecx+0x13c0]
     0x7db70f cmp eax,0x1d ; je next
     0x7db714 cmp eax,0x26 ; jne false
     0x7db719 mov eax,[ecx+0x1e68] ; test eax,eax ; je false
     0x7db723 mov edx,[eax+0x161c] ; cmp edx,-1 ; je false
     0x7db72e cmp edx,[ecx+0x161c] ; jge false    (SIGNED)
     0x7db736 cmp eax,ecx ; je false              (twin == self)
     0x7db73a mov al,1 ; ret
     0x7db73d xor al,al ; ret */

extern "C" int32_t isaac_entity_player_is_hologram_pure(
    uint32_t hologram_flag_172,
    int32_t character_type,
    uint32_t twin_ptr,
    int32_t twin_net_idx,
    int32_t own_net_idx,
    uint32_t self_ptr) {
  /* Byte test at +0x172: widened param, explicit low-byte mask. */
  if ((hologram_flag_172 & 0xffu) == 0u) {
    return 0;
  }
  if (character_type != static_cast<int32_t>(ISAAC_HISTORY_HUD_TWIN_CHAR_A) &&
      character_type != static_cast<int32_t>(ISAAC_HISTORY_HUD_TWIN_CHAR_B)) {
    return 0;
  }
  if (twin_ptr == 0u) {
    return 0;
  }
  if (twin_net_idx == -1) {
    return 0;
  }
  /* SIGNED compare (jge): twin net idx >= own net idx rejects. */
  if (twin_net_idx >= own_net_idx) {
    return 0;
  }
  if (twin_ptr == self_ptr) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_entity_player_is_hologram_flag_off(void) {
  return ISAAC_ENTITY_PLAYER_IS_HOLOGRAM_FLAG_OFF;
}

extern "C" uint32_t isaac_entity_player_twin_ptr_off(void) {
  return ISAAC_ENTITY_PLAYER_TWIN_PTR_OFF;
}

extern "C" uint32_t isaac_entity_player_net_idx_off(void) {
  return ISAAC_ENTITY_PLAYER_NET_IDX_OFF;
}

/* ---- Helpers ABI v11: StatHUD GetPlayerId-shaped body (0x0084bf30)
   Call site 0x84c1fe passes ONLY the player (ret 4); the 0xfffffeff /
   count pushes belong to RecomputeStats (ret 0xc).
   Machine order (0x84bf30..0x84bfcb):
     0x84bf34 mov ebx,ecx                ; this = StatHUD
     0x84bf36 mov ecx,[0xc7169c] ; add ecx,0x4b3d8   ; Manager netplay
     0x84bf46 mov eax,[ecx] ; cmp eax,[ecx+4] ; je 0x84bf5c  (empty skip)
       0x84bf4d push [edi+0x1618] ; call 0x0090b100 (IsIdxLocalPlayer)
       0x84bf58 test al,al ; je reject 0x84bfc5
     0x84bf5c cmp [edi+0x2c],0 ; jne reject
     0x84bf62 cmp [edi+0x3bc],0 ; jne reject
     0x84bf6b cmp [edi+0x13c0],0x28 ; je reject
     0x84bf74 mov ecx,edi ; call 0x007db700 (IsHologram)
       0x84bf7b test al,al ; jne reject
     0x84bf7f or edx,0xffffffff        ; empty = -1
     0x84bf82 lea ecx,[ebx+0x114]      ; slot base
     0x84bf88 xor eax,eax              ; i = 0
     loop 0x84bf90: mov esi,[ecx]
       0x84bf92 cmp esi,edi ; je 0x84bfbe  → return i (eax)
       0x84bf96 test esi,esi ; jne skip ; test edx,edx ; cmovs edx,eax
       0x84bf9f inc eax ; add ecx,0xcc
       0x84bfa6 cmp eax,2 ; jb loop         ; UNSIGNED bound
     0x84bfab test edx,edx ; js 0x84bfbc    ; empty < 0 -> return -1
     0x84bfaf imul ecx,edx,0xcc
     0x84bfb5 mov [ecx+ebx+0x114],edi      ; slot[empty] = player
     0x84bfbc mov eax,edx ; ret 4
     0x84bfc5 or eax,0xffffffff ; ret 4     ; -1 */

extern "C" uint32_t isaac_stat_hud_get_player_id_slot_base_off(void) {
  return ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_BASE_OFF;
}

extern "C" uint32_t isaac_stat_hud_get_player_id_slot_stride(void) {
  return ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_STRIDE;
}

extern "C" uint32_t isaac_stat_hud_get_player_id_slot_count(void) {
  return ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_COUNT;
}

extern "C" uint32_t isaac_stat_hud_get_player_id_slot_addr(
    uint32_t slot_base, uint32_t slot_index) {
  /* 0x84bf82 lea ecx,[ebx+0x114] ; 0x84bfa0 add ecx,0xcc ; 0x84bfaf imul. */
  return slot_base + slot_index * ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_STRIDE;
}

extern "C" int32_t isaac_stat_hud_get_player_id_try_pure(
    uint32_t netplay_begin,
    uint32_t netplay_end,
    int32_t netplay_local_known,
    uint32_t player_field_2c,
    uint32_t player_field_3bc,
    int32_t player_char_type,
    int32_t is_hologram,
    uint32_t slot0_player,
    uint32_t slot1_player,
    uint32_t player_ptr,
    uint32_t* out_slot0_player,
    uint32_t* out_slot1_player,
    int32_t* out_idx) {
  /* Netplay gate (0x84bf46..0x84bf5a): host IsIdxLocalPlayer virtual only
     when the range is non-empty and the sample is unknown. */
  if (netplay_begin != netplay_end) {
    if (netplay_local_known < 0) {
      return 1;
    }
    if (netplay_local_known == 0) {
      if (out_idx != nullptr) {
        *out_idx = -1;
      }
      if (out_slot0_player != nullptr) {
        *out_slot0_player = slot0_player;
      }
      if (out_slot1_player != nullptr) {
        *out_slot1_player = slot1_player;
      }
      return 0;
    }
    /* local_known == 1 -> fall through to the pure gates. */
  }

  /* Eligibility + hologram rejects (0x84bf5c..0x84bf7b). */
  if (player_field_2c != 0u || player_field_3bc != 0u ||
      player_char_type == static_cast<int32_t>(ISAAC_HISTORY_GET_PLAYER_IDX_REJECT_CHAR) ||
      is_hologram != 0) {
    if (out_idx != nullptr) {
      *out_idx = -1;
    }
    if (out_slot0_player != nullptr) {
      *out_slot0_player = slot0_player;
    }
    if (out_slot1_player != nullptr) {
      *out_slot1_player = slot1_player;
    }
    return 0;
  }

  /* 2-slot scan (0x84bf90..0x84bfa9), UNSIGNED bound. */
  const uint32_t slots[2] = {slot0_player, slot1_player};
  int32_t empty = -1;
  for (int32_t i = 0; i < static_cast<int32_t>(ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_COUNT); ++i) {
    const uint32_t s = slots[static_cast<uint32_t>(i)];
    if (s == player_ptr) {
      if (out_idx != nullptr) {
        *out_idx = i;
      }
      if (out_slot0_player != nullptr) {
        *out_slot0_player = slot0_player;
      }
      if (out_slot1_player != nullptr) {
        *out_slot1_player = slot1_player;
      }
      return 0;
    }
    if (s == 0u && empty < 0) {
      empty = i;
    }
  }
  if (empty < 0) {
    if (out_idx != nullptr) {
      *out_idx = -1;
    }
    if (out_slot0_player != nullptr) {
      *out_slot0_player = slot0_player;
    }
    if (out_slot1_player != nullptr) {
      *out_slot1_player = slot1_player;
    }
    return 0;
  }
  /* Assign into the first empty slot (0x84bfaf..0x84bfb5). */
  if (empty == 0) {
    if (out_slot0_player != nullptr) {
      *out_slot0_player = player_ptr;
    }
    if (out_slot1_player != nullptr) {
      *out_slot1_player = slot1_player;
    }
  } else {
    if (out_slot0_player != nullptr) {
      *out_slot0_player = slot0_player;
    }
    if (out_slot1_player != nullptr) {
      *out_slot1_player = player_ptr;
    }
  }
  if (out_idx != nullptr) {
    *out_idx = empty;
  }
  return 0;
}

extern "C" int32_t isaac_stat_hud_tail_host_call_count_v11(
    int32_t tail_needed,
    int32_t iterations,
    int32_t netplay_virtual_edges) {
  if (tail_needed == 0) {
    return 0;
  }
  const int32_t n = iterations > 0 ? iterations : 0;
  const int32_t edges = netplay_virtual_edges > 0 ? netplay_virtual_edges : 0;
  /* 1 FirstCollectibleOwner + n RecomputeStats bodies + IsIdxLocal virtual
     edges (GetPlayerId-shaped body is pure after v11). */
  return 1 + n + edges;
}


/* ---- Helpers ABI v12: RecomputeAll phase-1 elimination pass ----
   (0x0083b850, VA 0x83b878..0x83bad1) — the reverse two-slot scan. All
   branch semantics transcribed from the instruction stream; the compact
   body is the v7 three-move swap whose teardown sites are structurally
   dead (v9 pin), so the exchange is a pure five-field move.
   Anchors: head 0x83b890 (test eax,eax; je STEP), GetPlayerIdx call
   0x83b89d (body 0x0083bbc0), clear 0x83b8aa (mov [esi],0), compact gate
   0x83b8b3 (cmp ebx,2; jae), step 0x83bac4 (dec ebx; sub esi,0x14),
   loop back 0x83bace (cmp ebx,1; jge). */

extern "C" int32_t isaac_history_hud_elimination_slot_occupied(
    uint32_t player) {
  /* 0x83b890 mov eax,[esi]; 0x83b892 test eax,eax; 0x83b894 je STEP. */
  return player != 0u ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_elimination_clear_needed(
    int32_t get_player_idx_result) {
  /* 0x83b8a2 test eax,eax; 0x83b8a4 jns 0x83bac1 — SIGNED: any negative
     GetPlayerIdx result (in practice -1) clears the slot. */
  return get_player_idx_result < 0 ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_elimination_compact_needed(
    uint32_t clear_needed, uint32_t cursor) {
  /* 0x83b8b3 cmp ebx,2; 0x83b8b6 jae 0x83bac1 — UNSIGNED cursor >= 2
     skips the compact; only cursor 1 (slot 0) can compact. */
  return (clear_needed != 0u && cursor < 2u) ? 1 : 0;
}

extern "C" int32_t isaac_history_hud_elimination_step_continue(
    int32_t cursor_after_dec) {
  /* 0x83bac4 dec ebx; 0x83bace cmp ebx,1; 0x83bad1 jge 0x83b890 — SIGNED
     (cursor-1) >= 1 re-enters the head. */
  return cursor_after_dec >= 1 ? 1 : 0;
}

extern "C" uint32_t isaac_history_hud_elimination_slot_addr(
    uint32_t hud_ptr, uint32_t cursor) {
  /* esi walking law: 0x83b882 lea esi,[edx+0x14] with cursor 2, then
     0x83bac5 sub esi,0x14 per step. */
  return hud_ptr + (cursor - 1u) * ISAAC_HISTORY_HUD_ELIMINATION_SLOT_STRIDE;
}

namespace {

/* One elimination step's decisions (shared by the node export and the
   whole-pass plan). prior_host != 0 poisons every decision: an earlier
   host GetPlayerIdx call (opaque IsIdxLocalPlayer virtual leaf) could
   have rewritten either slot, so nothing after it is knowable without a
   recapture. */
void elimination_node_fill(
    uint32_t hud_ptr,
    uint32_t cursor,
    uint32_t slot_player,
    uint32_t player_field_2c,
    uint32_t player_field_3bc,
    int32_t player_char_type,
    uint32_t slot0_player,
    uint32_t slot1_player,
    uint32_t netplay_begin,
    uint32_t netplay_end,
    int32_t netplay_local_known,
    int32_t prior_host,
    IsaacHistoryHudEliminationNode* n) {
  n->cursor = cursor;
  n->slot_index = cursor - 1u;
  n->slot_addr =
      hud_ptr + n->slot_index * ISAAC_HISTORY_HUD_ELIMINATION_SLOT_STRIDE;
  n->occupied = slot_player != 0u ? 1 : 0;
  /* GetPlayerIdx body 0x0083bbc0 host edge: occupied && netplay range at
     *Mgr+0x4b3d8 non-empty && no local sample (v4 shell contract). */
  n->gpi_host = (n->occupied != 0 && netplay_begin != netplay_end &&
                 netplay_local_known < 0)
                    ? 1
                    : 0;
  n->decision_known = (n->gpi_host == 0 && prior_host == 0) ? 1 : 0;
  n->gpi_idx = 0;
  n->clear = 0;
  n->compact = 0;
  n->compact_dst_addr = 0u;
  n->compact_src_addr = 0u;
  if (n->decision_known != 0 && n->occupied != 0) {
    uint32_t out_s0 = slot0_player;
    uint32_t out_s1 = slot1_player;
    int32_t idx = 0;
    /* The v4 shell: pure when the netplay range is empty or the local
       sample is known; on the pure path the queried player always equals
       its own slot, so idx is the match index and -1 only from the
       eligibility / not-local gates. */
    const int32_t host = isaac_history_hud_get_player_idx_try_pure(
        netplay_begin, netplay_end, netplay_local_known, player_field_2c,
        player_field_3bc, player_char_type, out_s0, out_s1, slot_player,
        &out_s0, &out_s1, &idx);
    (void)host; /* decision_known already guarantees 0 */
    n->gpi_idx = idx;
    n->clear = (idx < 0) ? 1 : 0; /* jns at 0x83b8a4 */
    n->compact = (n->clear != 0 && cursor < 2u) ? 1 : 0; /* jae 0x83b8b6 */
  }
  if (n->compact != 0) {
    n->compact_dst_addr = n->slot_addr;
    n->compact_src_addr = n->slot_addr + ISAAC_HISTORY_HUD_ELIMINATION_SLOT_STRIDE;
  }
  n->step_continue =
      (static_cast<int32_t>(cursor - 1u) >= 1) ? 1 : 0; /* jge 0x83bad1 */
}

}  // namespace

extern "C" void isaac_history_hud_elimination_node_plan(
    uint32_t hud_ptr,
    uint32_t cursor,
    uint32_t slot_player,
    uint32_t player_field_2c,
    uint32_t player_field_3bc,
    int32_t player_char_type,
    uint32_t slot0_player,
    uint32_t slot1_player,
    uint32_t netplay_begin,
    uint32_t netplay_end,
    int32_t netplay_local_known,
    int32_t prior_host,
    IsaacHistoryHudEliminationNode* out) {
  if (out == nullptr) {
    return;
  }
  elimination_node_fill(
      hud_ptr, cursor, slot_player, player_field_2c, player_field_3bc,
      player_char_type, slot0_player, slot1_player, netplay_begin,
      netplay_end, netplay_local_known, prior_host, out);
}

extern "C" void isaac_history_hud_elimination_plan(
    uint32_t hud_ptr,
    uint32_t netplay_begin,
    uint32_t netplay_end,
    int32_t netplay_local_known,
    uint32_t s0_player,
    uint32_t s0_dirty,
    uint32_t s0_list_begin,
    uint32_t s0_list_end,
    uint32_t s0_list_cap,
    uint32_t s0_field_2c,
    uint32_t s0_field_3bc,
    int32_t s0_char_type,
    uint32_t s1_player,
    uint32_t s1_dirty,
    uint32_t s1_list_begin,
    uint32_t s1_list_end,
    uint32_t s1_list_cap,
    uint32_t s1_field_2c,
    uint32_t s1_field_3bc,
    int32_t s1_char_type,
    IsaacHistoryHudEliminationPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* Live slot state (the PE reads memory at each head: 0x83b890). */
  uint32_t s0p = s0_player;
  uint32_t s0d = s0_dirty & 0xffu; /* byte moves in the swap */
  uint32_t s0lb = s0_list_begin;
  uint32_t s0le = s0_list_end;
  uint32_t s0lc = s0_list_cap;
  uint32_t s1p = s1_player;
  uint32_t s1d = s1_dirty & 0xffu;
  uint32_t s1lb = s1_list_begin;
  uint32_t s1le = s1_list_end;
  uint32_t s1lc = s1_list_cap;

  /* Iteration 1: cursor 2, slot 1 (PE order; esi = this+0x14). */
  IsaacHistoryHudEliminationNode n1;
  elimination_node_fill(
      hud_ptr, 2u, s1p, s1_field_2c, s1_field_3bc, s1_char_type, s0p, s1p,
      netplay_begin, netplay_end, netplay_local_known, 0, &n1);
  const int32_t host1 = n1.gpi_host;
  if (n1.decision_known != 0 && n1.clear != 0) {
    /* 0x83b8aa mov [esi],0 — cursor 2 never compacts (jae 0x83b8b6). */
    s1p = 0u;
  }

  /* Iteration 2: cursor 1, slot 0. A host edge at iteration 1 poisons
     iteration 2's decisions (recapture boundary). */
  IsaacHistoryHudEliminationNode n2;
  elimination_node_fill(
      hud_ptr, 1u, s0p, s0_field_2c, s0_field_3bc, s0_char_type, s0p, s1p,
      netplay_begin, netplay_end, netplay_local_known, host1, &n2);
  const int32_t host2 = n2.gpi_host;
  const int32_t state_known = (host1 == 0 && host2 == 0) ? 1 : 0;
  if (n2.decision_known != 0 && n2.clear != 0) {
    /* 0x83b8aa mov [esi],0 (slot 0). */
    s0p = 0u;
    if (n2.compact != 0) {
      /* v7 three-move swap: dst (slot 0) takes src (slot 1)'s full state;
         src takes dst's old state (player already cleared to 0). Teardown
         sites A/B are structurally dead (v9 pin) — nothing is freed. */
      const uint32_t tp = s0p, td = s0d, tlb = s0lb, tle = s0le, tlc = s0lc;
      s0p = s1p;
      s0d = s1d;
      s0lb = s1lb;
      s0le = s1le;
      s0lc = s1lc;
      s1p = tp;
      s1d = td;
      s1lb = tlb;
      s1le = tle;
      s1lc = tlc;
    }
  }

  out->it1_occupied = n1.occupied;
  out->it1_gpi_host = n1.gpi_host;
  out->it1_decision_known = n1.decision_known;
  out->it1_gpi_idx = n1.gpi_idx;
  out->it1_clear = n1.clear;
  out->it1_compact = n1.compact;
  out->it2_occupied = n2.occupied;
  out->it2_gpi_host = n2.gpi_host;
  out->it2_decision_known = n2.decision_known;
  out->it2_gpi_idx = n2.gpi_idx;
  out->it2_clear = n2.clear;
  out->it2_compact = n2.compact;
  out->host_edge_count = host1 + host2;
  out->pure_complete = state_known;
  out->state_known = state_known;
  /* Host edges leave later slot states UNKNOWN: emit the known decision
     fields (it1/it2) but zero the final-state block — the recapture
     boundary. Never fold a post-call value into the pre-call snap. */
  if (state_known == 0) {
    s0p = s0d = s0lb = s0le = s0lc = 0u;
    s1p = s1d = s1lb = s1le = s1lc = 0u;
  }
  out->slot0_player = s0p;
  out->slot0_dirty = s0d;
  out->slot0_list_begin = s0lb;
  out->slot0_list_end = s0le;
  out->slot0_list_cap = s0lc;
  out->slot1_player = s1p;
  out->slot1_dirty = s1d;
  out->slot1_list_begin = s1lb;
  out->slot1_list_end = s1le;
  out->slot1_list_cap = s1lc;
}


extern "C" uint32_t isaac_hud_host_va_get_collectible(void) {
  return ISAAC_HUD_HOST_VA_GET_COLLECTIBLE;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE;
}

/* ---- Helpers ABI v13: exact ItemConfig::GetCollectible (0x0072fd10) +
   exact PlayerManager::FirstCollectibleOwner (0x009be080) prefix.
   GetCollectible is a complete pure island (25 ins, 0 calls, 0 stores,
   ret 4). FCO walk CF is translated; remaining typed host leaf is
   address-stable HasCollectible-shaped 0x007706e0 (narrowed != removed).
   v5/v11/v12 helpers consumed by reference: player_vector_count (SAR),
   player_walk_needed, netplay_range_empty, elimination_slot_occupied. */

static_assert(sizeof(IsaacItemConfigGetCollectiblePlan) == 32,
              "GetCollectible plan is 8 x int32");
static_assert(sizeof(IsaacHudFcoNode) == 32, "FCO node is 8 x int32");
static_assert(sizeof(IsaacHudFcoPlan) == 40, "FCO plan is 10 x int32");

extern "C" int32_t isaac_item_config_get_collectible_negative(int32_t id) {
  /* 0x72fd1f test edx,edx; jns table — SIGNED id < 0 takes trinket/NULL. */
  return id < 0 ? 1 : 0;
}

extern "C" int32_t isaac_item_config_get_collectible_trinket_index(int32_t id) {
  /* 0x72fd29 not edx */
  return ~id;
}

extern "C" int32_t isaac_item_config_get_collectible_in_bounds(int32_t index,
                                                            int32_t count) {
  /* 0x72fd36 / 0x72fd51 cmp edx,eax; jge NULL — SIGNED. */
  return index < count ? 1 : 0;
}

extern "C" uint32_t isaac_item_config_get_collectible_slot_addr(uint32_t begin,
                                                              int32_t index) {
  /* lea eax, [ecx+edx*4] — edx used as the scaled index. */
  return begin + static_cast<uint32_t>(index) * 4u;
}

extern "C" int32_t isaac_item_config_get_collectible_kind(
    uint32_t game_ptr,
    int32_t id,
    uint32_t config_begin,
    uint32_t config_end,
    uint32_t trinket_begin,
    uint32_t trinket_end) {
  if (isaac_item_config_get_collectible_negative(id) != 0) {
    if (game_ptr == 0u) {
      /* 0x72fd43 test edx,edx; js NULL */
      return ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL;
    }
    const int32_t index = isaac_item_config_get_collectible_trinket_index(id);
    const int32_t count =
        isaac_stat_hud_player_vector_count(trinket_begin, trinket_end);
    if (isaac_item_config_get_collectible_in_bounds(index, count) == 0) {
      return ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL;
    }
    return ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_TRINKET;
  }
  const int32_t count =
      isaac_stat_hud_player_vector_count(config_begin, config_end);
  if (isaac_item_config_get_collectible_in_bounds(id, count) == 0) {
    return ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL;
  }
  return ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_TABLE;
}

extern "C" void isaac_item_config_get_collectible_plan(
    uint32_t game_ptr,
    int32_t id,
    uint32_t config_begin,
    uint32_t config_end,
    uint32_t trinket_begin,
    uint32_t trinket_end,
    uint32_t slot_sample,
    uint32_t inner_sample,
    IsaacItemConfigGetCollectiblePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t negative = isaac_item_config_get_collectible_negative(id);
  const int32_t trinket_index =
      isaac_item_config_get_collectible_trinket_index(id);
  const int32_t kind = isaac_item_config_get_collectible_kind(
      game_ptr, id, config_begin, config_end, trinket_begin, trinket_end);
  int32_t count = 0;
  if (negative != 0 && game_ptr != 0u) {
    count = isaac_stat_hud_player_vector_count(trinket_begin, trinket_end);
  } else if (negative == 0) {
    count = isaac_stat_hud_player_vector_count(config_begin, config_end);
  }
  int32_t in_bounds = 0;
  uint32_t slot_addr = 0u;
  uint32_t result = 0u;
  if (kind == ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_TABLE) {
    in_bounds = 1;
    slot_addr = isaac_item_config_get_collectible_slot_addr(config_begin, id);
    result = slot_sample;
  } else if (kind == ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_TRINKET) {
    in_bounds = 1;
    slot_addr = isaac_item_config_get_collectible_slot_addr(trinket_begin,
                                                           trinket_index);
    result = inner_sample;
  }
  out->negative = negative;
  out->trinket_index = trinket_index;
  out->count = count;
  out->in_bounds = in_bounds;
  out->kind = kind;
  out->slot_addr = slot_addr;
  out->result = result;
  out->result_known = 1;
}

extern "C" uint32_t isaac_item_config_trinket_begin_off(void) {
  return ISAAC_ITEM_CONFIG_TRINKET_BEGIN_OFF;
}

extern "C" uint32_t isaac_item_config_trinket_end_off(void) {
  return ISAAC_ITEM_CONFIG_TRINKET_END_OFF;
}

extern "C" uint32_t isaac_item_config_game_global(void) {
  return ISAAC_ITEM_CONFIG_GAME_GLOBAL;
}

extern "C" int32_t isaac_fco_twin_walk_flag(uint32_t laz_shared_tag,
                                           uint32_t config_ptr,
                                           uint32_t config_field_b8) {
  /* 0x9be0a7 cmp byte [ebp+0x10],0 ; test eax ; [eax+0xb8] & 0x80000000 */
  if ((laz_shared_tag & 0xffu) == 0u) {
    return 0;
  }
  if (config_ptr == 0u) {
    return 0;
  }
  if ((config_field_b8 & ISAAC_FCO_TWIN_BIT) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_fco_list_empty(uint32_t list_begin, uint32_t list_end) {
  return isaac_history_hud_get_player_idx_netplay_range_empty(list_begin,
                                                             list_end);
}

extern "C" int32_t isaac_fco_player_slot_active(uint32_t player_field_2c) {
  /* 0x9be0d9 cmp dword [player+0x2c],0 ; jne STEP */
  return player_field_2c == 0u ? 1 : 0;
}

extern "C" int32_t isaac_fco_twin_present(uint32_t twin_ptr) {
  return isaac_history_hud_elimination_slot_occupied(twin_ptr);
}

extern "C" int32_t isaac_fco_has_collectible_hit(uint32_t al_byte) {
  /* 0x9be0e9 / 0x9be105 test al,al */
  return (al_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_fco_list_continue(uint32_t list_cur, uint32_t list_end) {
  /* 0x9be10c add esi,4 ; cmp esi,[vec+4] ; jne loop */
  return (list_cur + ISAAC_FCO_LIST_STRIDE) != list_end ? 1 : 0;
}

extern "C" void isaac_fco_node_plan(
    uint32_t player_ptr,
    uint32_t player_field_2c,
    uint32_t twin_ptr,
    int32_t twin_flag,
    int32_t primary_known,
    uint32_t primary_al,
    int32_t twin_known,
    uint32_t twin_al,
    IsaacHudFcoNode* out) {
  if (out == nullptr) {
    return;
  }
  out->skip = isaac_fco_player_slot_active(player_field_2c) == 0 ? 1 : 0;
  out->host_primary = 0;
  out->primary_hit = 0;
  out->host_twin = 0;
  out->twin_hit = 0;
  out->result = 0u;
  out->result_known = 0;
  out->step_continue = 0;
  if (out->skip != 0) {
    out->step_continue = 1;
    return;
  }
  out->host_primary = 1;
  if (primary_known == 0) {
    return;
  }
  out->primary_hit = isaac_fco_has_collectible_hit(primary_al);
  if (out->primary_hit != 0) {
    out->result = player_ptr;
    out->result_known = 1;
    return;
  }
  if (twin_flag == 0 || isaac_fco_twin_present(twin_ptr) == 0) {
    out->step_continue = 1;
    return;
  }
  out->host_twin = 1;
  if (twin_known == 0) {
    return;
  }
  out->twin_hit = isaac_fco_has_collectible_hit(twin_al);
  if (out->twin_hit != 0) {
    out->result = twin_ptr;
    out->result_known = 1;
    return;
  }
  out->step_continue = 1;
}

extern "C" void isaac_fco_plan(
    uint32_t laz_shared_tag,
    uint32_t config_ptr,
    uint32_t config_field_b8,
    uint32_t list_begin,
    uint32_t list_end,
    int32_t hit_kind,
    uint32_t hit_player,
    uint32_t hit_twin,
    IsaacHudFcoPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t twin_flag =
      isaac_fco_twin_walk_flag(laz_shared_tag, config_ptr, config_field_b8);
  const int32_t empty = isaac_fco_list_empty(list_begin, list_end);
  const int32_t count =
      isaac_stat_hud_player_vector_count(list_begin, list_end);
  const int32_t monolithic = count < 0 ? 1 : 0;
  const int32_t walk_needed = isaac_stat_hud_player_walk_needed(count);
  out->twin_flag = twin_flag;
  out->empty = empty;
  out->count = count;
  out->monolithic = monolithic;
  out->walk_needed = walk_needed;
  out->get_collectible_pure = 1;
  if (empty != 0) {
    out->host_has_collectible = 0;
    out->pure_complete = 1;
    out->result_known = 1;
    out->result = 0u;
    return;
  }
  if (monolithic != 0) {
    out->host_has_collectible = 1;
    out->pure_complete = 0;
    out->result_known = 0;
    out->result = 0u;
    return;
  }
  /* Walk reachable: 0x007706e0 remains a typed host leaf. */
  out->host_has_collectible = 1;
  out->pure_complete = 0;
  if (hit_kind == 0) {
    out->result_known = 1;
    out->result = 0u;
  } else if (hit_kind == 1) {
    out->result_known = 1;
    out->result = hit_player;
  } else if (hit_kind == 2) {
    out->result_known = 1;
    out->result = hit_twin;
  } else {
    out->result_known = 0;
    out->result = 0u;
  }
}

extern "C" uint32_t isaac_fco_item_flags_off(void) {
  return ISAAC_FCO_ITEM_FLAGS_OFF;
}

extern "C" uint32_t isaac_fco_twin_bit(void) {
  return ISAAC_FCO_TWIN_BIT;
}

extern "C" uint32_t isaac_fco_item_config_off(void) {
  return ISAAC_FCO_ITEM_CONFIG_OFF;
}

extern "C" uint32_t isaac_fco_player_field_2c_off(void) {
  return ISAAC_FCO_PLAYER_FIELD_2C_OFF;
}

extern "C" uint32_t isaac_fco_twin_ptr_off(void) {
  return ISAAC_FCO_TWIN_PTR_OFF;
}

extern "C" int32_t isaac_stat_hud_tail_host_call_count_v13(
    int32_t tail_needed,
    int32_t iterations,
    int32_t netplay_virtual_edges,
    int32_t fco_has_edges) {
  if (tail_needed == 0) {
    return 0;
  }
  const int32_t n = iterations > 0 ? iterations : 0;
  const int32_t edges = netplay_virtual_edges > 0 ? netplay_virtual_edges : 0;
  const int32_t fco = fco_has_edges > 0 ? fco_has_edges : 0;
  /* v11 opaque +1 FCO body is replaced by counted 0x7706e0 edges. */
  return fco + n + edges;
}

/* ---- Helpers ABI v14: HasCollectible-shaped 0x007706e0 prefix + inventory
   island, plus exact Game::GetPlayer 0x00417870. Remaining host: the
   ignoreModifiers==0 modifier ladder and trinket 0x009e04b0. Narrowed !=
   removed. Frozen bodies not reopened. 0x00aef12b is the cookie check
   (platform). */

static_assert(sizeof(IsaacGameGetPlayerPlan) == 28,
              "GetPlayer plan is 7 x 4");
static_assert(sizeof(IsaacHasCollectibleRedirectNode) == 24,
              "HasCollectible redirect node is 6 x 4");
static_assert(sizeof(IsaacHasCollectiblePlan) == 72,
              "HasCollectible plan is 18 x 4");

extern "C" int32_t isaac_game_get_player_empty(int32_t count) {
  /* 0x41788b test eax,eax ; jne skip_fatal — count==0 hosts 0xa112c0. */
  return isaac_stat_hud_walk_needs_empty_fatal(count);
}

extern "C" int32_t isaac_game_get_player_in_bounds(uint32_t index,
                                                  int32_t count) {
  /* 0x4178b2 cmp eax,edx ; jae clamp — UNSIGNED. */
  return index < static_cast<uint32_t>(count) ? 1 : 0;
}

extern "C" uint32_t isaac_game_get_player_slot_addr(uint32_t list_begin,
                                                   uint32_t index,
                                                   int32_t count) {
  /* In-bounds: [begin+index*4]. UNSIGNED jae clamp: *[begin]. */
  return isaac_stat_hud_player_slot_addr(list_begin, index, count);
}

extern "C" void isaac_game_get_player_plan(uint32_t list_begin,
                                          uint32_t list_end,
                                          uint32_t index,
                                          uint32_t slot_sample,
                                          IsaacGameGetPlayerPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t count =
      isaac_stat_hud_player_vector_count(list_begin, list_end);
  const int32_t empty = isaac_game_get_player_empty(count);
  out->count = count;
  out->empty = empty;
  out->in_bounds = isaac_game_get_player_in_bounds(index, count);
  out->slot_addr =
      isaac_game_get_player_slot_addr(list_begin, index, count);
  if (empty != 0) {
    /* Fatal then recapture begin/end — do not fold the pre-call sample. */
    out->host_fatal = 1;
    out->result = 0u;
    out->result_known = 0;
    return;
  }
  out->host_fatal = 0;
  out->result = slot_sample;
  out->result_known = 1;
}

extern "C" uint32_t isaac_hud_host_va_game_get_player(void) {
  return ISAAC_HUD_HOST_VA_GAME_GET_PLAYER;
}

extern "C" uint32_t isaac_hud_host_va_has_trinket(void) {
  return ISAAC_HUD_HOST_VA_HAS_TRINKET;
}

extern "C" int32_t isaac_has_collectible_config_null(uint32_t config_ptr) {
  /* 0x770712 test esi,esi ; je 0x77075a false. */
  return config_ptr == 0u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_redirect_needed(uint32_t field_2c) {
  /* 0x770716 cmp dword [edi+0x2c],1 ; jne inventory — EQUALITY to 1. */
  return field_2c == 1u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_parent_qualify(
    uint32_t parent_ptr, uint32_t parent_field_28) {
  /* 0x77071c test eax,eax ; je GetPlayer
     0x770726 cmp dword [eax+0x28],1 ; je adopt parent. */
  if (parent_ptr == 0u) {
    return 0;
  }
  return parent_field_28 == 1u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_quest_hide(uint32_t flag_20a9,
                                                   int32_t challenge,
                                                   uint32_t item_flags) {
  /* 0x77076f cmp byte [edi+0x20a9],0 ; je skip
     0x77077d cmp dword [Game+0x26614],2 ; jge skip  (SIGNED)
     0x77078c and flags,0x8000 ; je false. */
  if ((flag_20a9 & 0xffu) == 0u) {
    return 0;
  }
  if (challenge >= 2) {
    return 0;
  }
  if ((item_flags & ISAAC_HAS_COLLECTIBLE_QUEST_BIT) == 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_has_collectible_held_true(uint32_t held_id,
                                                  int32_t id,
                                                  uint32_t held_flag) {
  /* 0x770796 test held; je skip
     0x7707a0 cmp ebx,held ; jne skip
     0x7707a4 cmp byte [edi+0x2ef0],0 ; jne TRUE. */
  if (held_id == 0u) {
    return 0;
  }
  if (held_id != static_cast<uint32_t>(id)) {
    return 0;
  }
  return (held_flag & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_id_negative(int32_t id) {
  /* 0x7707b1 test ebx,ebx ; jns continue — SIGNED. */
  return isaac_item_config_get_collectible_negative(id);
}

extern "C" int32_t isaac_has_collectible_ignore_modifiers(
    uint32_t ignore_mod) {
  /* 0x7707d4 cmp byte [ebp+0xc],0 ; jne inventory tail. */
  return (ignore_mod & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_inventory_threshold(
    uint32_t held_id, int32_t id, uint32_t held_flag) {
  /* 0x770c3e: held match AND byte+0x2ef0==0 → cmp count,1 ; else cmp count,0. */
  if (held_id == 0u) {
    return 0;
  }
  if (held_id != static_cast<uint32_t>(id)) {
    return 0;
  }
  return (held_flag & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_count_hit(int32_t count,
                                                  int32_t threshold) {
  /* 0x770c61 / 0x770c84 cmp dword [table+id*4], imm ; setg al — SIGNED. */
  return count > threshold ? 1 : 0;
}

extern "C" uint32_t isaac_has_collectible_count_slot_addr(uint32_t table,
                                                         int32_t id) {
  /* 0x770c5d / 0x770c80 [eax+ebx*4] — full 32-bit scaled index. */
  return table + static_cast<uint32_t>(id) * 4u;
}

extern "C" void isaac_has_collectible_redirect_node(
    uint32_t player_in,
    uint32_t field_2c,
    uint32_t parent_ptr,
    uint32_t parent_field_28,
    int32_t get_player_known,
    uint32_t get_player_result,
    IsaacHasCollectibleRedirectNode* out) {
  if (out == nullptr) {
    return;
  }
  out->redirect_needed = isaac_has_collectible_redirect_needed(field_2c);
  out->parent_qualify = 0;
  out->host_get_player = 0;
  out->player_out = player_in;
  out->player_known = 1;
  out->fall_to_inventory = 0;
  if (out->redirect_needed == 0) {
    return;
  }
  out->parent_qualify =
      isaac_has_collectible_parent_qualify(parent_ptr, parent_field_28);
  if (out->parent_qualify != 0) {
    out->player_out = parent_ptr;
    return;
  }
  out->host_get_player = 1;
  if (get_player_known == 0) {
    out->player_out = 0u;
    out->player_known = 0;
    return;
  }
  if (get_player_result == 0u) {
    /* 0x770739 test eax,eax ; je 0x77076f — edi unchanged. */
    out->player_out = player_in;
    out->fall_to_inventory = 1;
    return;
  }
  out->player_out = get_player_result;
}

extern "C" void isaac_has_collectible_plan(
    uint32_t config_ptr,
    uint32_t player_in,
    uint32_t field_2c,
    uint32_t parent_ptr,
    uint32_t parent_field_28,
    uint32_t list_begin,
    uint32_t list_end,
    uint32_t player0_sample,
    uint32_t flag_20a9,
    int32_t challenge,
    uint32_t item_flags,
    uint32_t held_id,
    uint32_t held_flag,
    int32_t id,
    uint32_t ignore_mod,
    int32_t count_sample,
    IsaacHasCollectiblePlan* out) {
  if (out == nullptr) {
    return;
  }
  out->config_null = isaac_has_collectible_config_null(config_ptr);
  out->redirect_needed = 0;
  out->parent_qualify = 0;
  out->host_get_player = 0;
  out->get_player_fatal = 0;
  out->player_known = 0;
  out->player_out = 0u;
  out->quest_hide = 0;
  out->held_true = 0;
  out->id_negative = 0;
  out->host_trinket = 0;
  out->ignore_modifiers = 0;
  out->host_modifier_body = 0;
  out->inventory_threshold = 0;
  out->count_hit = 0;
  out->result = 0;
  out->result_known = 0;
  out->pure_complete = 0;
  if (out->config_null != 0) {
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }

  IsaacGameGetPlayerPlan gp;
  isaac_game_get_player_plan(list_begin, list_end, 0u, player0_sample, &gp);
  const int32_t gp_known = gp.result_known;
  const uint32_t gp_result = gp.result;
  IsaacHasCollectibleRedirectNode node;
  isaac_has_collectible_redirect_node(
      player_in, field_2c, parent_ptr, parent_field_28, gp_known, gp_result,
      &node);
  out->redirect_needed = node.redirect_needed;
  out->parent_qualify = node.parent_qualify;
  out->host_get_player = node.host_get_player;
  out->player_out = node.player_out;
  out->player_known = node.player_known;
  if (node.host_get_player != 0) {
    out->get_player_fatal = gp.host_fatal;
    if (gp.host_fatal != 0 || node.player_known == 0) {
      /* Recapture boundary: never fold inventory over an unknown redirect. */
      return;
    }
  }

  out->quest_hide =
      isaac_has_collectible_quest_hide(flag_20a9, challenge, item_flags);
  if (out->quest_hide != 0) {
    out->result = 0;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  out->held_true =
      isaac_has_collectible_held_true(held_id, id, held_flag);
  if (out->held_true != 0) {
    out->result = 1;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  out->id_negative = isaac_has_collectible_id_negative(id);
  if (out->id_negative != 0) {
    out->host_trinket = 1;
    return;
  }
  out->ignore_modifiers = isaac_has_collectible_ignore_modifiers(ignore_mod);
  out->inventory_threshold =
      isaac_has_collectible_inventory_threshold(held_id, id, held_flag);
  out->count_hit = isaac_has_collectible_count_hit(
      count_sample, out->inventory_threshold);
  if (out->ignore_modifiers != 0) {
    /* 0x7707d8 jne 0x770c3e — skip modifier ladder, inventory is pure. */
    out->result = out->count_hit;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  /* ignoreModifiers==0: modifier ladder still hosts. Do not fold inventory. */
  out->host_modifier_body = 1;
}

extern "C" uint32_t isaac_has_collectible_player_field_2c_off(void) {
  return ISAAC_HAS_COLLECTIBLE_PLAYER_FIELD_2C_OFF;
}

extern "C" uint32_t isaac_has_collectible_parent_ptr_off(void) {
  return ISAAC_HAS_COLLECTIBLE_PARENT_PTR_OFF;
}

extern "C" uint32_t isaac_has_collectible_quest_hide_off(void) {
  return ISAAC_HAS_COLLECTIBLE_QUEST_HIDE_OFF;
}

extern "C" uint32_t isaac_has_collectible_held_id_off(void) {
  return ISAAC_HAS_COLLECTIBLE_HELD_ID_OFF;
}

extern "C" uint32_t isaac_has_collectible_count_table_off(void) {
  return ISAAC_HAS_COLLECTIBLE_COUNT_TABLE_OFF;
}

extern "C" uint32_t isaac_has_collectible_quest_bit(void) {
  return ISAAC_HAS_COLLECTIBLE_QUEST_BIT;
}

/* ---- Helpers ABI v15: ignoreModifiers==0 modifier ladder gates ----
   The unconditional call 0x007db8d0 at 0x770a44 was the last v15 blocker;
   v16 narrows it below (asan resolve gates + scan/fatal residuals). */

extern "C" int32_t isaac_has_collectible_mod_arm(int32_t id) {
  /* Chain of DWORD cmp ebx,imm ; jne next. IDs are distinct. */
  const uint32_t u = static_cast<uint32_t>(id);
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_147 ||
      u == ISAAC_HAS_COLLECTIBLE_MOD_ID_148) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_147_148;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_139) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_139;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_9) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_9;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_3B) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_3B;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_131) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_131;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_101) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_101;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_E7) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_E7;
  }
  if (u == ISAAC_HAS_COLLECTIBLE_MOD_ID_B6) {
    return ISAAC_HAS_COLLECTIBLE_MOD_ARM_B6;
  }
  return ISAAC_HAS_COLLECTIBLE_MOD_ARM_OTHER;
}

extern "C" int32_t isaac_has_collectible_flags_2028_bit(uint32_t flags_2028,
                                                       uint32_t mask) {
  /* test byte [edi+0x2028], imm — low byte only. */
  return ((flags_2028 & 0xffu) & (mask & 0xffu)) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_seed_mod4(int32_t seed) {
  /* 0x770808 and eax,0x80000003 ; jns ; dec ; or 0xfffffffc ; inc.
     MSVC signed remainder by 4 (towards-zero). */
  const uint32_t masked = static_cast<uint32_t>(seed) & 0x80000003u;
  int32_t eax = static_cast<int32_t>(masked);
  if (eax >= 0) {
    return eax;
  }
  eax -= 1;
  eax |= static_cast<int32_t>(0xfffffffc);
  eax += 1;
  return eax;
}

extern "C" int32_t isaac_has_collectible_inner_true(int32_t id,
                                                   int32_t num_15,
                                                   int32_t seed_mod4) {
  /* 0x770820 cmp eax,1 ; jle  — SIGNED. Only entered when id is 0x147/0x148. */
  const uint32_t u = static_cast<uint32_t>(id);
  if (u != ISAAC_HAS_COLLECTIBLE_MOD_ID_147 &&
      u != ISAAC_HAS_COLLECTIBLE_MOD_ID_148) {
    return 0;
  }
  if (num_15 > 1) {
    return (seed_mod4 == 0 || seed_mod4 == 1) ? 1 : 0;
  }
  if (seed_mod4 == 0) {
    return u == ISAAC_HAS_COLLECTIBLE_MOD_ID_147 ? 1 : 0;
  }
  if (seed_mod4 == 1) {
    return u == ISAAC_HAS_COLLECTIBLE_MOD_ID_148 ? 1 : 0;
  }
  return 0;
}

extern "C" int32_t isaac_has_collectible_type_10(int32_t char_type) {
  /* 0x770868 cmp dword [edi+0x13c0],0xa ; je skip HasNullEffect. */
  return char_type == ISAAC_HAS_COLLECTIBLE_MOD_TYPE_10 ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_type_31(int32_t char_type) {
  /* 0x770886 cmp dword [edi+0x13c0],0x1f ; je 0x770a44. */
  return char_type == ISAAC_HAS_COLLECTIBLE_MOD_TYPE_31 ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_type_3_or_c(int32_t char_type) {
  /* 0x7da776 cmp eax,3 ; je ; cmp eax,0xc ; jne FALSE. EQUALITY. */
  if (char_type == ISAAC_HAS_COLLECTIBLE_MOD_TYPE_3) {
    return 1;
  }
  return char_type == ISAAC_HAS_COLLECTIBLE_MOD_TYPE_C ? 1 : 0;
}

extern "C" int32_t isaac_tempfx_has_null_disabled(uint32_t disabled) {
  /* 0x930683 cmp byte [ecx+0x11],0 ; jne FALSE. */
  return (disabled & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_tempfx_has_null_empty(uint32_t begin, uint32_t end) {
  /* 0x930690 cmp eax,ecx ; je FALSE. */
  return begin == end ? 1 : 0;
}

extern "C" int32_t isaac_tempfx_has_null_node_match(int32_t item_type,
                                                   int32_t item_id,
                                                   int32_t wanted) {
  /* mov edx,[eax] ; cmp dword [edx],0 ; jne next ; cmp dword [edx+4],esi. */
  if (item_type != ISAAC_TEMPFX_ITEM_TYPE_NULL) {
    return 0;
  }
  return item_id == wanted ? 1 : 0;
}

extern "C" int32_t isaac_tempfx_has_null_walk_continue(uint32_t next,
                                                      uint32_t end) {
  /* add eax,0x10 ; cmp eax,ecx ; jne loop — inequality, not unsigned jb. */
  return next != end ? 1 : 0;
}

extern "C" void isaac_tempfx_has_null_plan(uint32_t disabled,
                                          uint32_t begin,
                                          uint32_t end,
                                          int32_t item_type,
                                          int32_t item_id,
                                          int32_t wanted,
                                          IsaacTempfxHasNullPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->disabled = isaac_tempfx_has_null_disabled(disabled);
  out->empty = isaac_tempfx_has_null_empty(begin, end);
  out->node_match = 0;
  out->walk_continue = 0;
  out->result = 0;
  out->result_known = 0;
  out->pure_complete = 0;
  if (out->disabled != 0) {
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  if (out->empty != 0) {
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  out->node_match =
      isaac_tempfx_has_null_node_match(item_type, item_id, wanted);
  const uint32_t next = begin + ISAAC_TEMPFX_ELEM_STRIDE;
  out->walk_continue = isaac_tempfx_has_null_walk_continue(next, end);
  if (out->node_match != 0) {
    out->result = 1;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  if (out->walk_continue == 0) {
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
}

extern "C" void isaac_has_collectible_modifier_plan(
    int32_t id,
    uint32_t flags_2028,
    int32_t char_type,
    int32_t seed_264f8,
    int32_t has_effect_15_known,
    int32_t has_effect_15,
    int32_t num_15_known,
    int32_t num_15,
    int32_t has_null_known,
    int32_t has_null,
    int32_t has_effect_5d_known,
    int32_t has_effect_5d,
    int32_t rec_26b_known,
    int32_t rec_26b,
    IsaacHasCollectibleModifierPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->arm = isaac_has_collectible_mod_arm(id);
  out->bit_true = 0;
  out->type_10 = isaac_has_collectible_type_10(char_type);
  out->type_31 = isaac_has_collectible_type_31(char_type);
  out->type_3_or_c = isaac_has_collectible_type_3_or_c(char_type);
  out->seed_mod4 = isaac_has_collectible_seed_mod4(seed_264f8);
  out->inner_true = 0;
  out->host_771550 = 0;
  out->host_7cb6e0 = 0;
  out->need_has_null = 0;
  out->host_rec_26b = 0;
  out->host_7db8d0 = 0;
  out->host_139_body = 0;
  out->host_9_body = 0;
  out->result = 0;
  out->result_known = 0;
  out->pure_complete = 0;

  const int32_t arm = out->arm;
  if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_147_148) {
    out->host_771550 = 1;
    if (has_effect_15_known == 0) {
      return;
    }
    if ((has_effect_15 & 0xff) == 0) {
      out->host_7db8d0 = 1;
      return;
    }
    out->host_7cb6e0 = 1;
    if (num_15_known == 0) {
      return;
    }
    out->inner_true =
        isaac_has_collectible_inner_true(id, num_15, out->seed_mod4);
    if (out->inner_true != 0) {
      out->result = 1;
      out->result_known = 1;
      out->pure_complete = 1;
      return;
    }
    out->host_7db8d0 = 1;
    return;
  }

  if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_139) {
    if (out->type_10 != 0) {
      out->host_139_body = 1;
      return;
    }
    out->need_has_null = 1;
    if (has_null_known == 0) {
      return;
    }
    if ((has_null & 0xff) == 0) {
      out->host_7db8d0 = 1;
      return;
    }
    if (out->type_31 != 0) {
      out->host_7db8d0 = 1;
      return;
    }
    out->host_139_body = 1;
    return;
  }

  if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_9) {
    out->host_771550 = 1;
    if (has_effect_5d_known == 0) {
      return;
    }
    if ((has_effect_5d & 0xff) == 0) {
      out->host_7db8d0 = 1;
      return;
    }
    out->host_9_body = 1;
    return;
  }

  if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_3B) {
    if (out->type_3_or_c == 0) {
      out->host_7db8d0 = 1;
      return;
    }
    out->host_rec_26b = 1;
    if (rec_26b_known == 0) {
      return;
    }
    if ((rec_26b & 0xff) != 0) {
      out->result = 1;
      out->result_known = 1;
      out->pure_complete = 1;
      return;
    }
    out->host_7db8d0 = 1;
    return;
  }

  uint32_t bit_mask = 0;
  if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_131) {
    bit_mask = ISAAC_HAS_COLLECTIBLE_MOD_BIT_131;
  } else if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_101) {
    bit_mask = ISAAC_HAS_COLLECTIBLE_MOD_BIT_101;
  } else if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_E7) {
    bit_mask = ISAAC_HAS_COLLECTIBLE_MOD_BIT_E7;
  } else if (arm == ISAAC_HAS_COLLECTIBLE_MOD_ARM_B6) {
    bit_mask = ISAAC_HAS_COLLECTIBLE_MOD_BIT_B6;
  }
  if (bit_mask != 0u) {
    out->bit_true =
        isaac_has_collectible_flags_2028_bit(flags_2028, bit_mask);
    if (out->bit_true != 0) {
      out->result = 1;
      out->result_known = 1;
      out->pure_complete = 1;
      return;
    }
    out->host_7db8d0 = 1;
    return;
  }

  out->host_7db8d0 = 1;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible_771550(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_771550;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible_7cb6e0(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7CB6E0;
}

extern "C" uint32_t isaac_hud_host_va_tempfx_has_null(void) {
  return ISAAC_HUD_HOST_VA_TEMPFX_HAS_NULL;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible_7da770(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7DA770;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible_7db8d0(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7DB8D0;
}

extern "C" uint32_t isaac_tempfx_disabled_off(void) {
  return ISAAC_TEMPFX_DISABLED_OFF;
}

extern "C" uint32_t isaac_tempfx_elem_stride(void) {
  return ISAAC_TEMPFX_ELEM_STRIDE;
}

extern "C" uint32_t isaac_has_collectible_flags_2028_off(void) {
  return ISAAC_HAS_COLLECTIBLE_FLAGS_2028_OFF;
}

/* ---- Helpers ABI v16: 0x007db8d0 resolver gates ----
   Full chain 0x007db8d0 -> 0x007db860 -> 0x004288a0 is READ-ONLY (store
   census: every store lands in a caller frame; zero observable stores).
   Residual: the shared GetPlayer-style empty-count fatal 0x00a112c0 on the
   slow path when [Game+0x1bb88]==0 (v14 precedent keeps it host), and the
   Game+0x1bbd8 scan walk itself (host data source; pure decision modelled
   over sampled last-node fields). */

extern "C" int32_t isaac_has_collectible_mod_scan_active(
    uint32_t last_node_disabled,
    uint32_t last_node_value,
    uint32_t last_node_is_head,
    uint32_t buf_begin,
    uint32_t buf_end) {
  /* 0x7db88d cmp byte [last+0xd],0 ; jne 0 ; 0x7db893 cmp dword
     [last+0x10],0x4f ; jg 0 ; 0x7db899 cmp last,[Game+0x1bbd8] ; je 0 ;
     0x7db8a1 sub eax,[p+0x1fd4] (eax=[p+0x1fd8]) ; 0x7db8af cmp eax,0x8f
     ; jle 0. The last-node fields come from the 0x004288a0 walk out
     struct (its last node: set on a value >= 0x4f match; head otherwise). */
  if ((last_node_disabled & 0xffu) != 0u) {
    return 0;
  }
  if (last_node_value >
      static_cast<uint32_t>(ISAAC_HAS_COLLECTIBLE_MOD_SCAN_WANTED)) {
    return 0;
  }
  if (last_node_is_head != 0u) {
    return 0;
  }
  if (static_cast<int32_t>(buf_end - buf_begin) <=
      static_cast<int32_t>(ISAAC_HAS_COLLECTIBLE_MOD_SCAN_BUF_GATE_LEN)) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_has_collectible_mod_scan_mode(
    uint32_t last_node_disabled,
    uint32_t last_node_value,
    uint32_t last_node_is_head,
    uint32_t buf_begin,
    uint32_t buf_end,
    int32_t buf_byte) {
  /* 0x7db8b6 movzx eax, byte ptr [begin+0x8f] — only reached when the
     gate above passes; else the function returns 0 at 0x7db8c3. */
  if (isaac_has_collectible_mod_scan_active(
          last_node_disabled, last_node_value, last_node_is_head, buf_begin,
          buf_end) == 0) {
    return 0;
  }
  return buf_byte & 0xff;
}

extern "C" int32_t isaac_has_collectible_mod_fast_applicable(uint32_t mode) {
  /* 0x7db8e9 cmp esi,7 ; ja 0x7db987 — UNSIGNED > 7 takes the slow path. */
  return mode <= static_cast<uint32_t>(ISAAC_HAS_COLLECTIBLE_MOD_FAST_MAX) ? 1
                                                                           : 0;
}

extern "C" int32_t isaac_has_collectible_mod_fast_result(uint32_t mode) {
  /* Jump table 0x7dba10: entries {0,1} -> -1 (0x7db8f9), then
     0x7db90c/0x7db91e/0x7db933/0x7db948/0x7db95d/0x7db972 -> 0..5. */
  static const int32_t kFastTable[ISAAC_HAS_COLLECTIBLE_MOD_FAST_MAX + 1] = {
      -1, -1, 0, 1, 2, 3, 4, 5,
  };
  if (mode > static_cast<uint32_t>(ISAAC_HAS_COLLECTIBLE_MOD_FAST_MAX)) {
    return 0;
  }
  return kFastTable[mode];
}

extern "C" int32_t isaac_has_collectible_mod_slow_fatal(int32_t game_count) {
  /* 0x7db993 test eax,eax ; jne skip — slow path fatal when count == 0. */
  return game_count == 0 ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_mod_slow_hash(uint32_t game_count,
                                                       uint32_t mode) {
  /* 0x7db9ac..0x7dba0e. eax = [Game+0x1bb88] + mode (32-bit wrap);
     v = max(1, sum) via cmp eax,1 ; cmova esi,eax (UNSIGNED).
     xor-shift hash with shift dwords [0xb1f57c],[0xb1f580],[0xb1f584]
     (shr/shl mask to 5 bits); result = (h & 3) + 2. */
  const uint32_t sum = game_count + mode;
  const uint32_t v = sum > 1u ? sum : 1u;
  uint32_t t = v >> (ISAAC_HAS_COLLECTIBLE_MOD_HASH_C1 & 31u);
  t ^= v;
  uint32_t u = t << (ISAAC_HAS_COLLECTIBLE_MOD_HASH_C2 & 31u);
  u ^= t;
  uint32_t w = u >> (ISAAC_HAS_COLLECTIBLE_MOD_HASH_C3 & 31u);
  w ^= u;
  return static_cast<int32_t>((w & ISAAC_HAS_COLLECTIBLE_MOD_SLOW_RESULT_MASK) +
                              ISAAC_HAS_COLLECTIBLE_MOD_SLOW_RESULT_ADD);
}

extern "C" void isaac_has_collectible_mod_resolve_plan(
    uint32_t last_node_disabled,
    uint32_t last_node_value,
    uint32_t last_node_is_head,
    uint32_t buf_begin,
    uint32_t buf_end,
    int32_t buf_byte,
    int32_t count_known,
    int32_t game_count,
    IsaacHasCollectibleModResolvePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t active = isaac_has_collectible_mod_scan_active(
      last_node_disabled, last_node_value, last_node_is_head, buf_begin,
      buf_end);
  const int32_t mode = isaac_has_collectible_mod_scan_mode(
      last_node_disabled, last_node_value, last_node_is_head, buf_begin,
      buf_end, buf_byte);
  out->scan_active = active;
  out->mode = mode;
  out->fast_applicable =
      isaac_has_collectible_mod_fast_applicable(static_cast<uint32_t>(mode));
  out->fast_result =
      isaac_has_collectible_mod_fast_result(static_cast<uint32_t>(mode));
  out->slow_fatal = 0;
  out->slow_hash = 0;
  out->result = 0;
  out->result_known = 0;
  out->host_needed = 0;
  out->pure_complete = 0;
  if (out->fast_applicable != 0) {
    /* Fast path never reads Game+0x1bb88: pure regardless of the count. */
    out->result = out->fast_result;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }
  out->slow_hash = isaac_has_collectible_mod_slow_hash(
      static_cast<uint32_t>(game_count), static_cast<uint32_t>(mode));
  if (count_known == 0) {
    out->host_needed = 1;
    return;
  }
  out->slow_fatal = isaac_has_collectible_mod_slow_fatal(game_count);
  if (out->slow_fatal != 0) {
    out->host_needed = 1;
    return;
  }
  out->result = out->slow_hash;
  out->result_known = 1;
  out->pure_complete = 1;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible_7db860(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7DB860;
}

extern "C" uint32_t isaac_hud_host_va_has_collectible_scan_4288a0(void) {
  return ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_SCAN_4288A0;
}

/* ---- Helpers ABI v17: 0x00771550 narrowed gates ----
   Body 0x00771550..0x00771612 (ret 8; this=player, id=[ebp+8],
   flag=[ebp+0xc]). Store census ZERO (mem-stores 0), no cookie frame.
   Pure gates (evidence: section-notes/hud-v17/00771550.txt +
   007715d9.txt):
     early TRUE   f=[player+0x2ef8]; f!=0 && f==id && byte[player+0x2ef0]
                  != 0 -> return TRUE (0x771565..0x771574, 0x7715ce);
     flag==0      strict = (f!=0 && f==id && byte[player+0x2ef0]==0)
                  (0x7715d9..0x7715e8); count = host 0x7cb6e0(player, id);
                  return count > (strict ? 1 : 0) — SIGNED setg both arms
                  (0x7715f3 cmp eax,1 ; setg / 0x771609 test eax,eax ;
                  setg);
     flag!=0      width = 1 + (HasCollectible(player,0x8b,0) [0x7706e0]
                  || HasCollectible(player,0x1ca,0)); the 0x1ca call is
                  SHORT-CIRCUITED (0x77158f jne skips it when 0x8b true);
                  scan player+0x16c0 stride 4 for `width` slots, UNSIGNED
                  loop (0x7715bf cmp ecx,ebx ; jb), TRUE iff any
                  (slot & 0x7fff) == id (0x7715b7 cmp eax,edi ; je
                  0x7715ce), else FALSE (0x7715c3 xor al,al).
   Ladder call sites 0x7707f4 (arm 0x147/0x148, id 0x15, flag 0) and
   0x770920 (arm 9, id 0x5d, flag 0) both use the flag==0 path; the
   early-TRUE gate runs before the flag dispatch (both flags). Host
   residual: 0x7cb6e0 (count) on flag==0, the two 0x7706e0 HasCollectible
   samples on flag!=0. Next peel VA 0x007cb6e0. */

static_assert(sizeof(IsaacHasCollectible771550Plan) == 52,
              "771550 plan is 13 x int32");

extern "C" int32_t isaac_has_collectible_771550_owned(uint32_t field_2ef8,
                                                      int32_t byte_2ef0,
                                                      uint32_t id) {
  /* 0x771565 test eax,eax ; je 0x771576 ; 0x771569 cmp eax,edi ; jne ;
     0x77156d cmp byte [esi+0x2ef0],0 ; jne 0x7715ce. Full dword field
     equality; the +0x2ef0 gate is a BYTE compare (low-byte mask). */
  if (field_2ef8 == 0u) {
    return 0;
  }
  if (field_2ef8 != id) {
    return 0;
  }
  if ((byte_2ef0 & 0xff) == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_has_collectible_771550_strict(uint32_t field_2ef8,
                                                       int32_t byte_2ef0,
                                                       uint32_t id) {
  /* 0x7715d9 test eax,eax ; je 0x7715ff ; cmp eax,edi ; jne ; cmp byte
     [esi+0x2ef0],0 ; jne 0x7715ff — strict iff field set, equal AND the
     byte is ZERO (the != 0 byte case returned TRUE earlier). */
  if (field_2ef8 == 0u) {
    return 0;
  }
  if (field_2ef8 != id) {
    return 0;
  }
  if ((byte_2ef0 & 0xff) != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_has_collectible_771550_count_gt(int32_t count,
                                                         int32_t strict) {
  /* 0x7715f0 cmp eax,1 ; setg al (strict) / 0x771606 test eax,eax ; setg
     al (loose). Both SIGNED (setg). */
  const int32_t threshold =
      strict != 0 ? static_cast<int32_t>(ISAAC_HAS_COLLECTIBLE_771550_STRICT_CMP)
                  : 0;
  return count > threshold ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_771550_scan_width(int32_t has_8b,
                                                           int32_t has_1ca) {
  /* 0x771583 mov ebx,1 ; HasCollectible(0x8b): jne 0x7715a3 -> ebx=2 ;
     0x771591..0x7715a1 HasCollectible(0x1ca): je 0x7715a8 keeps 1, else
     falls to 0x7715a3 -> 2. Both results byte-masked (test al,al). */
  if ((has_8b & 0xff) != 0) {
    return 2;
  }
  if ((has_1ca & 0xff) != 0) {
    return 2;
  }
  return 1;
}

extern "C" int32_t isaac_has_collectible_771550_slot_match(uint32_t slot,
                                                           uint32_t id) {
  /* 0x7715b2 and eax,0x7fff ; 0x7715b7 cmp eax,edi ; je 0x7715ce. */
  return (slot & ISAAC_HAS_COLLECTIBLE_771550_SLOT_MASK) == id ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_771550_scan_result(
    uint32_t slot0, uint32_t slot1, int32_t scan_width, uint32_t id) {
  /* 0x7715a8..0x7715c3: ecx=0, edx=player+0x16c0; loop reads [edx],
     masks 0x7fff, compares to id (TRUE on match); UNSIGNED continue
     while ecx < width (0x7715bf cmp ecx,ebx ; jb). */
  for (int32_t i = 0; static_cast<uint32_t>(i) <
                      static_cast<uint32_t>(scan_width);
       ++i) {
    const uint32_t slot = i == 0 ? slot0 : slot1;
    if (isaac_has_collectible_771550_slot_match(slot, id) != 0) {
      return 1;
    }
  }
  return 0;
}

extern "C" void isaac_has_collectible_771550_plan(
    uint32_t field_2ef8,
    int32_t byte_2ef0,
    uint32_t id,
    int32_t flag,
    int32_t count_known,
    int32_t count,
    int32_t has_8b_known,
    int32_t has_8b,
    int32_t has_1ca_known,
    int32_t has_1ca,
    uint32_t slot0,
    uint32_t slot1,
    IsaacHasCollectible771550Plan* out) {
  if (out == nullptr) {
    return;
  }
  out->owned = isaac_has_collectible_771550_owned(field_2ef8, byte_2ef0, id);
  out->strict = isaac_has_collectible_771550_strict(field_2ef8, byte_2ef0,
                                                     id);
  out->host_7cb6e0 = 0;
  out->count_known = 0;
  out->count = 0;
  out->host_has_8b = 0;
  out->host_has_1ca = 0;
  out->scan_width = 0;
  out->scan_result = 0;
  out->result = 0;
  out->result_known = 0;
  out->host_needed = 0;
  out->pure_complete = 0;

  if (out->owned != 0) {
    /* Early TRUE — no host call at all (checked before the flag
       dispatch in the PE). */
    out->result = 1;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }

  if ((flag & 0xff) == 0) {
    /* 0x771576 cmp byte [ebp+0xc],0 ; je 0x7715d9. */
    out->host_7cb6e0 = 1;
    out->count_known = count_known != 0 ? 1 : 0;
    out->count = count;
    if (count_known == 0) {
      out->host_needed = 1;
      return;
    }
    out->result = isaac_has_collectible_771550_count_gt(count, out->strict);
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }

  /* flag != 0 path: two recursive HasCollectible samples. */
  out->host_has_8b = 1;
  if (has_8b_known == 0) {
    out->host_needed = 1;
    return;
  }
  if ((has_8b & 0xff) != 0) {
    /* Short-circuit: the 0x1ca call is skipped when 0x8b is true. */
    out->scan_width = 2;
    out->host_has_1ca = 0;
  } else {
    out->host_has_1ca = 1;
    if (has_1ca_known == 0) {
      out->host_needed = 1;
      return;
    }
    out->scan_width = isaac_has_collectible_771550_scan_width(has_8b, has_1ca);
  }
  out->scan_result = isaac_has_collectible_771550_scan_result(
      slot0, slot1, out->scan_width, id);
  out->result = out->scan_result;
  out->result_known = 1;
  out->pure_complete = 1;
}

extern "C" uint32_t isaac_has_collectible_771550_field_off(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_FIELD_OFF;
}

extern "C" uint32_t isaac_has_collectible_771550_byte_off(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_BYTE_OFF;
}

extern "C" uint32_t isaac_has_collectible_771550_slot_base_off(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_SLOT_BASE_OFF;
}

extern "C" uint32_t isaac_has_collectible_771550_slot_stride(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_SLOT_STRIDE;
}

extern "C" uint32_t isaac_has_collectible_771550_slot_mask(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_SLOT_MASK;
}

extern "C" uint32_t isaac_has_collectible_771550_which_8b(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_WHICH_8B;
}

extern "C" uint32_t isaac_has_collectible_771550_which_1ca(void) {
  return ISAAC_HAS_COLLECTIBLE_771550_WHICH_1CA;
}

/* ---- Helpers ABI v19: the 0x007cb6e0 count resolver ----
   Body 0x007cb6e0..0x007cba1f (ret 4; this=player, arg1=id). Full
   instruction stream in output/decomp/5129df723e64/section-notes/
   cpu-dump/007cb6e0.txt + 007cb7fd.txt + 007cb940.txt. Pure laws below
   are transcribed branch-by-branch; host edges stay host (GetPlayer
   0x00417870 walk, 0x00740bc0 + RNG 0x007e9020, 0x00930aa0, recursive
   HasCollectible 0x007706e0). The recursed self-calls (ids 0x15/0x40/
   0x4b) only reach the sampling region, so the model recursion
   terminates; each invocation re-reads the same samples. */
static_assert(sizeof(IsaacHudCount7cb6e0Plan) == 80,
              "count resolver plan is 20 x int32");

static const uint32_t kIsaacHudCount7cb6e0Table[ISAAC_HUD_COUNT_7CB6E0_TABLE_SIZE] = {
    0x00000009u, 0x0000000bu, 0x00000041u, 0x0000001bu, 0x0000000au,
    0x0000000cu, 0x0000001au, 0x00000042u, 0x00000060u, 0x00000090u,
};

extern "C" uint32_t isaac_hud_count_7cb6e0_table_va(void) {
  return ISAAC_HUD_COUNT_7CB6E0_TABLE_VA;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_table_size(void) {
  return ISAAC_HUD_COUNT_7CB6E0_TABLE_SIZE;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_table_value(uint32_t index) {
  /* 0x7cb780 cmp ebx,[eax+0xb6bad0]; eax=0; add eax,4; cmp eax,0x28;
     jb loop — 10 dwords, UNSIGNED bound. */
  return index < ISAAC_HUD_COUNT_7CB6E0_TABLE_SIZE
             ? kIsaacHudCount7cb6e0Table[index]
             : 0u;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_sampling_va(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_SAMPLING;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_mode_gate(void) {
  return ISAAC_HUD_COUNT_7CB6E0_MODE_GATE;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_mask(void) {
  return ISAAC_HUD_COUNT_7CB6E0_MASK;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_slot_base_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_SLOT_BASE_OFF;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_slot_stride(void) {
  return ISAAC_HUD_COUNT_7CB6E0_SLOT_STRIDE;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_item_begin_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_ITEM_BEGIN_OFF;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_item_end_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_ITEM_END_OFF;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_byte_begin_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_BYTE_BEGIN_OFF;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_byte_end_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_BYTE_END_OFF;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_which_1b7(void) {
  return ISAAC_HUD_COUNT_7CB6E0_HC_1B7;
}

extern "C" int32_t isaac_hud_count_7cb6e0_char56_boost(uint32_t field_13c0,
                                                      uint32_t id) {
  /* 0x7cb735 cmp ebx,0x56 ; jne 0x7cb749 ; 0x7cb73a cmp [edi+0x13c0],4 ;
     mov eax,1 ; 0x7cb746 cmove esi,eax — UNMASKED id compare. */
  return (id == ISAAC_HUD_COUNT_7CB6E0_ID_56 &&
          field_13c0 == 4u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_early_gate_202c(uint32_t flag_202c) {
  /* 0x7cb749 cmp byte [edi+0x202c],0 ; jne 0x7cba0d — byte test, widened
     param masked (v8 rule). */
  return (flag_202c & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_early_gate_20a9(uint32_t flag_20a9) {
  /* 0x7cb756 cmp byte [edi+0x20a9],0 ; jne 0x7cba0d. */
  return (flag_20a9 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_id_mask(uint32_t id) {
  /* 0x7cb768 and ebx,0x7fff — AFTER the 0x56 boost and the two byte
     gates. */
  return id & ISAAC_HUD_COUNT_7CB6E0_MASK;
}

extern "C" int32_t isaac_hud_count_7cb6e0_mode_table_hit(uint32_t manager_mode,
                                                        uint32_t id_masked) {
  /* 0x7cb76e cmp [eax+0x2663c],0x1c ; jne 0x7cb793 ; 0x7cb777..0x7cb792
     UNSIGNED 10-entry scan (eax=0; cmp eax,0x28 ; jb), match -> esi++. */
  if (manager_mode != ISAAC_HUD_COUNT_7CB6E0_MODE_GATE) {
    return 0;
  }
  for (uint32_t i = 0; i < ISAAC_HUD_COUNT_7CB6E0_TABLE_SIZE; ++i) {
    if (kIsaacHudCount7cb6e0Table[i] == id_masked) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_special_id(uint32_t id_masked) {
  /* 0x7cb793 cmp ebx,0x15 ; je 0x7cb8d8 ; 0x7cb79c cmp ebx,0x40 ; je ;
     0x7cb7a5 cmp ebx,0x4b ; je — special ids jump straight to the
     sampling region. */
  return (id_masked == ISAAC_HUD_COUNT_7CB6E0_ID_15 ||
          id_masked == ISAAC_HUD_COUNT_7CB6E0_ID_40 ||
          id_masked == ISAAC_HUD_COUNT_7CB6E0_ID_4B)
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_seed_mod4(int32_t seed_264f8) {
  /* 0x7cb7c7 and ecx,0x80000003 ; jns 0x7cb7d4 ; dec ecx ; or
     ecx,0xfffffffc ; inc ecx — C signed % 4 (v15 idiom, exact). */
  int32_t ecx = (int32_t)((uint32_t)seed_264f8 & ISAAC_HUD_COUNT_7CB6E0_MOD4_MASK);
  if (ecx >= 0) {
    return ecx;
  }
  ecx -= 1;
  ecx |= (int32_t)0xfffffffc;
  ecx += 1;
  return ecx;
}

extern "C" uint32_t isaac_hud_count_7cb6e0_seed_table_index(int32_t seed_264f8) {
  /* 0x7cb813..0x7cb835: mov eax,0xb60b60b7 ; imul ecx (SIGNED 64-bit
     product) ; add edx,ecx ; sar edx,6 ; mov eax,edx ; shr eax,0x1f ;
     add eax,edx ; xor edx,edx ; div ecx(10) — q = trunc(seed / 90) via
     the signed div-by-90 magic; remainder = UNSIGNED q % 10 (q may be
     negative; the unsigned remainder is of the bit pattern). */
  const int64_t prod =
      (int64_t)seed_264f8 *
      (int64_t)(int32_t)ISAAC_HUD_COUNT_7CB6E0_SEED_DIV_MAGIC; /* exact */
  uint32_t edx = (uint32_t)((uint64_t)prod >> 32); /* imul high dword */
  edx = edx + (uint32_t)seed_264f8;                /* add edx,ecx */
  edx = (uint32_t)((int32_t)edx >> ISAAC_HUD_COUNT_7CB6E0_SEED_DIV_SHIFT); /* sar */
  const uint32_t eax = edx >> 31;                  /* shr eax,0x1f */
  const uint32_t q = eax + edx;                    /* add eax,edx */
  return q % ISAAC_HUD_COUNT_7CB6E0_SEED_IDX_MOD;  /* div ecx; rem */
}

extern "C" int32_t isaac_hud_count_7cb6e0_seed_gate(int32_t seed_264f8,
                                                    uint32_t id_masked) {
  /* 0x7cb835 cmp ebx,[edx*4+0xb6bad0] ; jne 0x7cb841 ; 0x7cb83e add
     esi,[ebp-0x18] — the count40 branch's table gate. */
  const uint32_t idx =
      isaac_hud_count_7cb6e0_seed_table_index(seed_264f8);
  return kIsaacHudCount7cb6e0Table[idx] == id_masked ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_id30_gate(uint32_t id_masked,
                                                    int32_t count15,
                                                    int32_t mod4) {
  /* 0x7cb7b7 test eax,eax ; jle 0x7cb7fd (count15>0 SIGNED);
     0x7cb7d4 cmp ebx,0x30 ; jne 0x7cb7fd (only id==0x30);
     0x7cb7d9 cmp ecx,2 ; je 0x7cb7e8 (RETURN);
     0x7cb7de cmp eax,1 ; jle 0x7cb7fd (count15>1 SIGNED);
     0x7cb7e3 cmp ecx,3 ; jne 0x7cb7fd — RETURN when mod4==3. */
  if (id_masked != ISAAC_HUD_COUNT_7CB6E0_ID_30) {
    return 0;
  }
  if (count15 <= 0) {
    return 0;
  }
  if (mod4 == 2) {
    return 1;
  }
  return (count15 > 1 && mod4 == 3) ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_7a29_skip(uint32_t id_masked,
                                                    uint32_t manager_mode_26584) {
  /* 0x7cb857 cmp ebx,0x7a ; jne 0x7cb865 ; 0x7cb85c cmp [ecx+0x26584],
     0x29 ; je 0x7cb8d8 — jumps past the 0x4b add AND part F. */
  return (id_masked == ISAAC_HUD_COUNT_7CB6E0_ID_7A &&
          manager_mode_26584 == ISAAC_HUD_COUNT_7CB6E0_MODE_7A_GATE)
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_4b_compare(uint32_t rng_plus1,
                                                     uint32_t id_masked) {
  /* 0x7cb89e inc eax ; 0x7cb89f cmp ebx,eax ; jne 0x7cb8a6 — the RNG
     result +1 must equal the masked id. */
  return rng_plus1 == id_masked ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_slot16c0(uint32_t slot,
                                                   uint32_t id_masked) {
  /* 0x7cb915..0x7cb929: (slot & 0x7fff) == idm -> inc esi (0x7cb920);
     slot & 0x8000 -> inc esi (0x7cb929) — two INDEPENDENT increments,
     so a matching slot with bit 15 set adds 2. */
  int32_t add = 0;
  if ((slot & ISAAC_HUD_COUNT_7CB6E0_MASK) == id_masked) {
    add += 1;
  }
  if ((slot & 0x8000u) != 0u) {
    add += 1;
  }
  return add;
}

extern "C" int32_t isaac_hud_count_7cb6e0_scan_width(int32_t has_8b,
                                                     int32_t has_1ca) {
  /* 0x7cb8d8..0x7cb8ff: HasCollectible(0x8b) ; jne -> width 2 ;
     HasCollectible(0x1ca) short-circuited ; width 1 or 2. */
  if ((has_8b & 0xff) != 0) {
    return 2;
  }
  if ((has_1ca & 0xff) != 0) {
    return 2;
  }
  return 1;
}

extern "C" int32_t isaac_hud_count_7cb6e0_block17c4(uint32_t block_ptr,
                                                    uint32_t block0,
                                                    uint32_t block4,
                                                    uint32_t field_2ef8,
                                                    uint32_t id_masked) {
  /* 0x7cb935..0x7cb957: ptr != 0 && ptr[0] == 2 && ptr[4] == idm &&
     (f2ef8 == 0 || f2ef8 == idm) -> inc esi. */
  if (block_ptr == 0u) {
    return 0;
  }
  if (block0 != 2u) {
    return 0;
  }
  if (block4 != id_masked) {
    return 0;
  }
  if (field_2ef8 != 0u && field_2ef8 != id_masked) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_hud_count_7cb6e0_block_flag_17cc(uint32_t flag_17cc) {
  /* 0x7cb958 test byte [edi+0x17cc],2 ; je 0x7cb962 ; inc esi. */
  return (flag_17cc & 0x02u) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_item_span(uint32_t begin_1748,
                                                    uint32_t end_174c) {
  /* 0x7cb96e sub eax,edx ; sar eax,2 — (end-begin) >> 2 arithmetic. */
  return (int32_t)(end_174c - begin_1748) >> 2;
}

extern "C" int32_t isaac_hud_count_7cb6e0_item_list_add(
    uint32_t id_masked, int32_t item_span, int32_t item_id,
    int32_t item_count) {
  /* 0x7cb973 cmp ebx,eax ; jae skip — UNSIGNED bound; 0x7cb977 movsx
     word [edx+ebx*4] (item id) ; 0x7cb97b movsx word [..+2] (count) ;
     0x7cb982 lea esi,[eax+ecx*2] — esi += item_id + 2*count (32-bit
     wrap). */
  if (!(static_cast<uint32_t>(id_masked) <
        static_cast<uint32_t>(item_span))) {
    return 0;
  }
  return (int32_t)((uint32_t)item_id + (uint32_t)item_count * 2u);
}

extern "C" int32_t isaac_hud_count_7cb6e0_bytebuf_add(uint32_t id_masked,
                                                      int32_t byte_span,
                                                      uint32_t byte_value) {
  /* 0x7cb993 cmp ebx,eax ; jge 0x7cb99d — SIGNED bound (jge); else
     movzx byte [ecx+ebx] ; 0x7cb9aa cmove (b==0 keeps esi) -> +1 iff
     the byte is non-zero. */
  if (static_cast<int32_t>(id_masked) >= byte_span) {
    return 0;
  }
  return (byte_value & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_2ef8_adjust(int32_t esi,
                                                      uint32_t field_2ef8,
                                                      uint32_t byte_2ef0,
                                                      uint32_t id_masked) {
  /* 0x7cb9af..0x7cb9f3: f=[p+0x2ef8]; f==0 || (f&0x7fff)!=idm -> no
     change. byte[p+0x2ef0]!=0: esi += ((f&0x8000)?1:0) + 1
     (neg/sbb/neg idiom 0x7cb9c9..0x7cb9d6). byte==0: esi =
     max(0,esi-1) (cmovg 0x7cb9da..0x7cb9e1), then (f&0x8000) ->
     esi = max(0,esi-1) again (0x7cb9ec..0x7cb9f3). */
  if (field_2ef8 == 0u) {
    return esi;
  }
  if ((field_2ef8 & ISAAC_HUD_COUNT_7CB6E0_MASK) != id_masked) {
    return esi;
  }
  if ((byte_2ef0 & 0xffu) != 0u) {
    const int32_t t = (field_2ef8 & 0x8000u) != 0u ? 1 : 0;
    return esi + t + 1;
  }
  int32_t s = esi - 1;
  if (s <= 0) {
    s = 0;
  }
  if ((field_2ef8 & 0x8000u) != 0u) {
    s = s - 1;
    if (s <= 0) {
      s = 0;
    }
  }
  return s;
}

extern "C" int32_t isaac_hud_count_7cb6e0_final_gate(int32_t esi,
                                                     int32_t has_1b7) {
  /* 0x7cb9f6 test esi,esi ; jle 0x7cba0d — SIGNED; 0x7cba08 test al,al ;
     je ; inc esi. */
  if (esi <= 0) {
    return esi;
  }
  return (has_1b7 & 0xff) != 0 ? esi + 1 : esi;
}

extern "C" void isaac_hud_count_7cb6e0_walk_step(
    uint32_t player_ptr,
    uint32_t player_field_2c,
    uint32_t parent_ptr,
    uint32_t parent_field_28,
    int32_t get_player_known,
    uint32_t get_player_result,
    uint32_t candidate_field_2c,
    uint32_t* out_player,
    int32_t* out_host_edge,
    int32_t* out_continue) {
  /* One loop iteration of the preamble walk 0x7cb6fb..0x7cb72e:
       0x7cb6fb cmp [edi+0x2c],1 ; jne 0x7cb733   (field_2c != 1 skips)
       parent 0x3bc qualifies iff non-null && +0x28 == 1 (0x7cb70b) —
       then NO GetPlayer call (0x7cb70f je 0x7cb728);
       else GetPlayer(0) 0x7cb71f (host 0x00417870); null exits with the
       OLD player (0x7cb726 je 0x7cb730);
       0x7cb728..0x7cb72e: candidate 0x2c == 1 -> loop again (edi =
       candidate) else stop (edi = candidate). Valid only when
       get_player_known != 0 on the GetPlayer path. */
  if (out_player != nullptr) {
    *out_player = player_ptr;
  }
  if (out_host_edge != nullptr) {
    *out_host_edge = 0;
  }
  if (out_continue != nullptr) {
    *out_continue = 0;
  }
  if (player_field_2c != 1u) {
    return;
  }
  if (parent_ptr != 0u && parent_field_28 == 1u) {
    if (out_player != nullptr) {
      *out_player = parent_ptr;
    }
    if (out_continue != nullptr) {
      *out_continue = candidate_field_2c == 1u ? 1 : 0;
    }
    return;
  }
  if (out_host_edge != nullptr && get_player_known != 0) {
    *out_host_edge = 1;
  }
  if (get_player_result == 0u) {
    return;
  }
  if (out_player != nullptr) {
    *out_player = get_player_result;
  }
  if (out_continue != nullptr) {
    *out_continue = candidate_field_2c == 1u ? 1 : 0;
  }
}

/* PART G..M of 0x007cb6e0 (0x7cb8d8..0x7cba0c): the shared sampling
   region run by the outer call and by each recursed special-id call.
   Returns the esi contribution; *out_edges receives that invocation's
   0x7706e0 host edge count (1 x has_8b, +1 x has_1ca when has_8b is
   FALSE, +1 x has_1b7 when the SIGNED pre-gate esi > 0); *out_gate_esi
   receives the pre-1b7 esi (the 0x7cb9f8 gate decision). */
static int32_t hud_count_7cb6e0_sampling(
    uint32_t id_masked,
    uint32_t slot0,
    uint32_t slot1,
    uint32_t block_ptr,
    uint32_t block0,
    uint32_t block4,
    uint32_t flag_17cc,
    uint32_t item_begin,
    uint32_t item_end,
    int32_t item_id,
    int32_t item_count,
    uint32_t byte_begin,
    uint32_t byte_end,
    uint32_t byte_value,
    uint32_t field_2ef8,
    uint32_t byte_2ef0,
    int32_t has_8b,
    int32_t has_1ca,
    int32_t has_1b7,
    int32_t* out_edges,
    int32_t* out_gate_esi) {
  int32_t esi = 0;
  const int32_t width = isaac_hud_count_7cb6e0_scan_width(has_8b, has_1ca);
  for (int32_t i = 0;
       static_cast<uint32_t>(i) < static_cast<uint32_t>(width);
       ++i) {
    esi += isaac_hud_count_7cb6e0_slot16c0(i == 0 ? slot0 : slot1,
                                           id_masked);
  }
  esi += isaac_hud_count_7cb6e0_block17c4(block_ptr, block0, block4,
                                          field_2ef8, id_masked);
  esi += isaac_hud_count_7cb6e0_block_flag_17cc(flag_17cc);
  esi += isaac_hud_count_7cb6e0_item_list_add(
      id_masked, isaac_hud_count_7cb6e0_item_span(item_begin, item_end),
      item_id, item_count);
  esi += isaac_hud_count_7cb6e0_bytebuf_add(
      id_masked, static_cast<int32_t>(byte_end - byte_begin), byte_value);
  esi = isaac_hud_count_7cb6e0_2ef8_adjust(esi, field_2ef8, byte_2ef0,
                                           id_masked);
  int32_t edges = 1; /* has_8b sample call */
  if ((has_8b & 0xff) == 0) {
    edges += 1; /* has_1ca sample call (short-circuited when 8b true) */
  }
  if (out_edges != nullptr) {
    *out_edges = edges;
  }
  if (out_gate_esi != nullptr) {
    *out_gate_esi = esi;
  }
  if (esi > 0) {
    if (out_edges != nullptr) {
      *out_edges += 1; /* has_1b7 sample call */
    }
  }
  return isaac_hud_count_7cb6e0_final_gate(esi, has_1b7);
}

/* The recursed count for a special id (0x15/0x40/0x4b): the full pure
   head (boost, early gates, mask, mode table) then the sampling region.
   The special-id jump (0x7cb793..0x7cb7a8) means the recursion never
   reaches the count15/40/4b branches, so it terminates. */
static int32_t hud_count_7cb6e0_count_for(
    uint32_t id,
    uint32_t field_13c0,
    uint32_t flag_202c,
    uint32_t flag_20a9,
    uint32_t manager_mode_2663c,
    uint32_t slot0,
    uint32_t slot1,
    uint32_t block_ptr,
    uint32_t block0,
    uint32_t block4,
    uint32_t flag_17cc,
    uint32_t item_begin,
    uint32_t item_end,
    int32_t item_id,
    int32_t item_count,
    uint32_t byte_begin,
    uint32_t byte_end,
    uint32_t byte_value,
    uint32_t field_2ef8,
    uint32_t byte_2ef0,
    int32_t has_8b,
    int32_t has_1ca,
    int32_t has_1b7,
    int32_t* out_edges,
    int32_t* out_gate_esi) {
  int32_t esi = isaac_hud_count_7cb6e0_char56_boost(field_13c0, id);
  if (isaac_hud_count_7cb6e0_early_gate_202c(flag_202c) != 0 ||
      isaac_hud_count_7cb6e0_early_gate_20a9(flag_20a9) != 0) {
    if (out_edges != nullptr) {
      *out_edges = 0;
    }
    if (out_gate_esi != nullptr) {
      *out_gate_esi = esi;
    }
    return esi;
  }
  const uint32_t idm = isaac_hud_count_7cb6e0_id_mask(id);
  esi += isaac_hud_count_7cb6e0_mode_table_hit(manager_mode_2663c, idm);
  esi += hud_count_7cb6e0_sampling(
      idm, slot0, slot1, block_ptr, block0, block4, flag_17cc, item_begin,
      item_end, item_id, item_count, byte_begin, byte_end, byte_value,
      field_2ef8, byte_2ef0, has_8b, has_1ca, has_1b7, out_edges,
      out_gate_esi);
  return esi;
}

extern "C" void isaac_hud_count_7cb6e0_plan(
    uint32_t id,
    uint32_t field_13c0,
    uint32_t flag_202c,
    uint32_t flag_20a9,
    uint32_t manager_mode_2663c,
    int32_t manager_seed_264f8,
    uint32_t manager_mode_26584,
    uint32_t slot0,
    uint32_t slot1,
    uint32_t block_ptr,
    uint32_t block0,
    uint32_t block4,
    uint32_t flag_17cc,
    uint32_t item_begin,
    uint32_t item_end,
    int32_t item_id,
    int32_t item_count,
    uint32_t byte_begin,
    uint32_t byte_end,
    uint32_t byte_value,
    uint32_t field_2ef8,
    uint32_t byte_2ef0,
    int32_t field_18dc,
    int32_t field_18e0,
    int32_t has_8b_known,
    int32_t has_8b,
    int32_t has_1ca_known,
    int32_t has_1ca,
    int32_t has_1b7_known,
    int32_t has_1b7,
    int32_t host_17_known,
    int32_t host_17,
    int32_t host_4b_known,
    int32_t host_4b,
    IsaacHudCount7cb6e0Plan* out) {
  if (out == nullptr) {
    return;
  }
  out->boost = isaac_hud_count_7cb6e0_char56_boost(field_13c0, id);
  out->early_gate =
      (isaac_hud_count_7cb6e0_early_gate_202c(flag_202c) != 0 ||
       isaac_hud_count_7cb6e0_early_gate_20a9(flag_20a9) != 0)
          ? 1
          : 0;
  const uint32_t idm = isaac_hud_count_7cb6e0_id_mask(id);
  out->id_masked = idm;
  out->table_hit = 0;
  out->special_id = isaac_hud_count_7cb6e0_special_id(idm);
  out->seed_mod4 = isaac_hud_count_7cb6e0_seed_mod4(manager_seed_264f8);
  out->seed_idx =
      static_cast<int32_t>(
          isaac_hud_count_7cb6e0_seed_table_index(manager_seed_264f8));
  out->id30_returned = 0;
  out->skip_7a29 = 0;
  out->host_4b_needed = 0;
  out->host_17_needed = 0;
  out->count15 = 0;
  out->count40 = 0;
  out->count4b = 0;
  out->sampling_add = 0;
  out->result = 0;
  out->result_known = 0;
  out->host_needed = 0;
  out->pure_complete = 0;
  out->host_edge_count = 0;

  if (out->early_gate != 0) {
    /* 0x7cb749/0x7cb756: return esi (= boost) before anything else. */
    out->result = out->boost;
    out->result_known = 1;
    out->pure_complete = 1;
    return;
  }

  int32_t esi = out->boost;
  out->table_hit =
      isaac_hud_count_7cb6e0_mode_table_hit(manager_mode_2663c, idm);
  esi += out->table_hit;

  int32_t host_edges = 0;
  int32_t gate_esi_any = 0;
  int32_t c15_edges = 0;
  int32_t c40_edges = 0;
  int32_t c4b_edges = 0;
  int32_t c15_gate = 0;
  int32_t c40_gate = 0;
  int32_t c4b_gate = 0;

  if (out->special_id != 0) {
    /* 0x7cb793..0x7cb7a8: jump straight to the sampling region. */
    int32_t sedges = 0;
    int32_t sgate = 0;
    out->sampling_add = hud_count_7cb6e0_sampling(
        idm, slot0, slot1, block_ptr, block0, block4, flag_17cc,
        item_begin, item_end, item_id, item_count, byte_begin, byte_end,
        byte_value, field_2ef8, byte_2ef0, has_8b, has_1ca, has_1b7,
        &sedges, &sgate);
    esi += out->sampling_add;
    host_edges += sedges;
    if (sgate > 0) {
      gate_esi_any = 1;
    }
  } else {
    /* 0x7cb7ae: recursed count(id 0x15). */
    out->count15 = hud_count_7cb6e0_count_for(
        ISAAC_HUD_COUNT_7CB6E0_ID_15, field_13c0, flag_202c, flag_20a9,
        manager_mode_2663c, slot0, slot1, block_ptr, block0, block4,
        flag_17cc, item_begin, item_end, item_id, item_count, byte_begin,
        byte_end, byte_value, field_2ef8, byte_2ef0, has_8b, has_1ca,
        has_1b7, &c15_edges, &c15_gate);
    host_edges += c15_edges;
    if (c15_gate > 0) {
      gate_esi_any = 1;
    }
    if (isaac_hud_count_7cb6e0_id30_gate(idm, out->count15,
                                         out->seed_mod4) != 0) {
      /* 0x7cb7e8: pop/add — return count15 + esi, no sampling. */
      out->id30_returned = 1;
      out->result = out->count15 + esi;
      out->host_edge_count = host_edges;
      out->host_needed = has_8b_known == 0 ? 1 : 0;
      if ((has_8b & 0xff) == 0 && has_1ca_known == 0) {
        out->host_needed = 1;
      }
      if (gate_esi_any != 0 && has_1b7_known == 0) {
        out->host_needed = 1;
      }
      out->result_known = out->host_needed == 0 ? 1 : 0;
      out->pure_complete = out->result_known;
      return;
    }
    /* 0x7cb7fd: recursed count(id 0x40). */
    out->count40 = hud_count_7cb6e0_count_for(
        ISAAC_HUD_COUNT_7CB6E0_ID_40, field_13c0, flag_202c, flag_20a9,
        manager_mode_2663c, slot0, slot1, block_ptr, block0, block4,
        flag_17cc, item_begin, item_end, item_id, item_count, byte_begin,
        byte_end, byte_value, field_2ef8, byte_2ef0, has_8b, has_1ca,
        has_1b7, &c40_edges, &c40_gate);
    host_edges += c40_edges;
    if (c40_gate > 0) {
      gate_esi_any = 1;
    }
    if (out->count40 > 0 &&
        isaac_hud_count_7cb6e0_seed_gate(manager_seed_264f8, idm) != 0) {
      esi += out->count40; /* 0x7cb83e */
    }
    /* 0x7cb841: recursed count(id 0x4b). */
    out->count4b = hud_count_7cb6e0_count_for(
        ISAAC_HUD_COUNT_7CB6E0_ID_4B, field_13c0, flag_202c, flag_20a9,
        manager_mode_2663c, slot0, slot1, block_ptr, block0, block4,
        flag_17cc, item_begin, item_end, item_id, item_count, byte_begin,
        byte_end, byte_value, field_2ef8, byte_2ef0, has_8b, has_1ca,
        has_1b7, &c4b_edges, &c4b_gate);
    host_edges += c4b_edges;
    if (c4b_gate > 0) {
      gate_esi_any = 1;
    }
    if (out->count4b > 0) {
      out->skip_7a29 = isaac_hud_count_7cb6e0_7a29_skip(
          idm, manager_mode_26584);
      if (out->skip_7a29 == 0) {
        /* 0x7cb865..0x7cb8a3: host 0x740bc0 + RNG 0x7e9020 chain; the
           pure decision is (rng_plus1 == idm). */
        out->host_4b_needed = 1;
        host_edges += 2;
        if (host_4b_known != 0 &&
            isaac_hud_count_7cb6e0_4b_compare(host_4b, idm) != 0) {
          esi += out->count4b;
        }
      }
    }
    if (out->skip_7a29 == 0) {
      /* PART F: 0x7cb8a6..0x7cb8d7. */
      if (idm == ISAAC_HUD_COUNT_7CB6E0_ID_17) {
        out->host_17_needed = 1;
        host_edges += 1; /* 0x930aa0 */
        if (host_17_known != 0) {
          esi += host_17;
        }
      } else if (idm == ISAAC_HUD_COUNT_7CB6E0_ID_18) {
        if (field_18dc > 0) {
          esi += 1; /* 0x7cb8d5 jle skip */
        }
      } else if (idm == ISAAC_HUD_COUNT_7CB6E0_ID_13) {
        if (field_18e0 > 0) {
          esi += 1;
        }
      }
    }
    /* 0x7cb8d8: the sampling region. */
    int32_t sedges = 0;
    int32_t sgate = 0;
    out->sampling_add = hud_count_7cb6e0_sampling(
        idm, slot0, slot1, block_ptr, block0, block4, flag_17cc,
        item_begin, item_end, item_id, item_count, byte_begin, byte_end,
        byte_value, field_2ef8, byte_2ef0, has_8b, has_1ca, has_1b7,
        &sedges, &sgate);
    esi += out->sampling_add;
    host_edges += sedges;
    if (sgate > 0) {
      gate_esi_any = 1;
    }
  }

  out->result = esi;
  out->host_edge_count = host_edges;
  /* Host-sample requirement (v17 known/unknown convention): a sample is
     REQUIRED only when the pure computation actually uses it. */
  int32_t unknown = 0;
  if (has_8b_known == 0) {
    unknown = 1;
  }
  if ((has_8b & 0xff) == 0 && has_1ca_known == 0) {
    unknown = 1;
  }
  if (gate_esi_any != 0 && has_1b7_known == 0) {
    unknown = 1;
  }
  if (out->host_4b_needed != 0 && host_4b_known == 0) {
    unknown = 1;
  }
  if (out->host_17_needed != 0 && host_17_known == 0) {
    unknown = 1;
  }
  out->host_needed = unknown;
  out->result_known = unknown ? 0 : 1;
  out->pure_complete = out->result_known;
}

/* ---- Helpers ABI v23: 0x007cb6e0 preamble walk / count4b RNG-draw /
   twin + recursion PREP laws (evidence: section-notes/hud-v23-7cb6e0/
   NOTES.md; cpu-dump/007cb6e0.txt + 007cb7fd.txt). Host leaves stay host
   (GetPlayer 0x00417870, GetRoomByIdx 0x00740bc0, RNG::RandomInt
   0x007e9020, GetTrinketEffectNum 0x00930aa0); these laws are the pure
   decisions and receiver/arg preps around them. ---- */

namespace {

inline uint32_t count_load_u32(uint32_t addr) {
  uint32_t value = 0;
  const uint8_t* p = reinterpret_cast<const uint8_t*>(static_cast<uint32_t>(addr));
  value |= static_cast<uint32_t>(p[0]);
  value |= static_cast<uint32_t>(p[1]) << 8;
  value |= static_cast<uint32_t>(p[2]) << 16;
  value |= static_cast<uint32_t>(p[3]) << 24;
  return value;
}

}  // namespace

extern "C" int32_t isaac_hud_count_7cb6e0_walk_active(uint32_t player_field_2c) {
  /* 0x7cb6fb cmp dword [edi+0x2c],1 ; jne 0x7cb733 — FULL-WORD == 1
     (0x101 must NOT walk). */
  return player_field_2c == 1u ? 1 : 0;
}

extern "C" int32_t isaac_hud_count_7cb6e0_m3bc_eligible(uint32_t parent_ptr,
                                                        uint32_t parent_field_28) {
  /* 0x7cb707 test eax,eax ; je 0x7cb711 ; 0x7cb70b cmp dword [eax+0x28],1
     ; je 0x7cb728 — full-dword qualify. */
  return (parent_ptr != 0u && parent_field_28 == 1u) ? 1 : 0;
}

extern "C" void isaac_hud_count_7cb6e0_walk_plan(
    uint32_t player_ptr,
    uint32_t samples_addr,
    uint32_t samples_count,
    uint32_t iter_cap,
    IsaacHudCount7cb6e0WalkPlan* out) {
  /* Composed preamble walk 0x7cb6fb..0x7cb733. GetPlayer(0) (0x00417870)
     results come from the caller's samples table (8 bytes/entry:
     {u32 known, u32 result}); one consumed per host edge. */
  if (out == nullptr) {
    return;
  }
  out->resolved_player = player_ptr;
  out->walk_active = 0;
  out->iterations = 0;
  out->host_edges = 0;
  out->truncated = 0;
  out->stopped_null = 0;
  out->host_needed = 0;
  uint32_t edi = player_ptr;
  /* 0x7cb6fb: cmp dword [edi+0x2c],1 ; jne 0x7cb733. */
  if (count_load_u32(edi + ISAAC_HUD_COUNT_7CB6E0_FIELD_2C_OFF) != 1u) {
    out->resolved_player = edi;
    return;
  }
  out->walk_active = 1;
  uint32_t sample_idx = 0;
  for (;;) {
    /* 0x7cb701: eax = [edi+0x3bc]; qualify iff non-null && +0x28 == 1. */
    const uint32_t cand = count_load_u32(edi + ISAAC_HUD_COUNT_7CB6E0_FIELD_3BC_OFF);
    uint32_t next;
    if (cand != 0u &&
        count_load_u32(cand + ISAAC_HUD_COUNT_7CB6E0_FIELD_28_OFF) == 1u) {
      next = cand;
    } else {
      /* 0x7cb711 (defensive re-test; reachable states always have ==1). */
      if (count_load_u32(edi + ISAAC_HUD_COUNT_7CB6E0_FIELD_2C_OFF) != 1u) {
        break;
      }
      if (sample_idx >= samples_count) {
        out->host_needed = 1;
        break;
      }
      const uint32_t known = count_load_u32(samples_addr + sample_idx * 8u);
      const uint32_t result = count_load_u32(samples_addr + sample_idx * 8u + 4u);
      sample_idx += 1;
      out->host_edges = static_cast<int32_t>(sample_idx);
      if (known == 0u) {
        out->host_needed = 1;
        break;
      }
      /* 0x7cb724: test eax,eax ; je 0x7cb730 — null keeps current player. */
      if (result == 0u) {
        out->stopped_null = 1;
        break;
      }
      next = result;
    }
    /* 0x7cb728: cmp dword [eax+0x2c],1 ; mov edi,eax ; je 0x7cb701. */
    edi = next;
    out->iterations += 1;
    if (count_load_u32(edi + ISAAC_HUD_COUNT_7CB6E0_FIELD_2C_OFF) != 1u) {
      break;
    }
    if (static_cast<uint32_t>(out->iterations) >= iter_cap) {
      out->truncated = 1;
      break;
    }
  }
  out->resolved_player = edi;
}

extern "C" int32_t isaac_hud_count_7cb6e0_rng_gate(uint32_t room_field_5c) {
  /* 0x7cb872 mov eax,[eax+0x5c] ; 0x7cb875 test eax,eax ; je 0x7cb8a6 —
     full dword != 0. */
  return room_field_5c != 0u ? 1 : 0;
}

extern "C" void isaac_hud_count_7cb6e0_rng_prep(uint32_t room_field_5c,
                                                IsaacHudCount7cb6e0RngPrep* out) {
  /* 0x7cb879..0x7cb896: 16-byte RandomInt receiver buffer (ebp-0x14):
     seed = [room+0x5c]; a_lo/a_hi = qword .rdata 0xb1f564 (dwords 0x2,
     0x7); b = dword .rdata 0xb1f56c (0x19). */
  if (out == nullptr) {
    return;
  }
  out->seed = room_field_5c;
  out->a_lo = ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_A_LO;
  out->a_hi = ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_A_HI;
  out->b = ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_B;
}

extern "C" void isaac_hud_count_7cb6e0_room_prep(uint32_t game_ptr,
                                                 uint32_t game_field_18304,
                                                 uint32_t* out_receiver,
                                                 int32_t* out_idx,
                                                 int32_t* out_arg2) {
  /* 0x7cb865 push -1 ; 0x7cb867 push [ecx+0x18304] ; 0x7cb86d call
     0x740bc0 — receiver = Game (ecx = [0xc71678]), idx = [Game+0x18304],
     arg2 = -1. */
  if (out_receiver != nullptr) {
    *out_receiver = game_ptr;
  }
  if (out_idx != nullptr) {
    *out_idx = static_cast<int32_t>(game_field_18304);
  }
  if (out_arg2 != nullptr) {
    *out_arg2 = -1;
  }
}

extern "C" uint32_t isaac_hud_count_7cb6e0_rng_max(void) {
  /* 0x7cb88c push 0xbd. */
  return ISAAC_HUD_COUNT_7CB6E0_RNG_MAX;
}

extern "C" int32_t isaac_hud_count_7cb6e0_4b_chain(uint32_t room_field_5c,
                                                   int32_t rng_known,
                                                   uint32_t rng_result,
                                                   int32_t count4b,
                                                   uint32_t id_masked) {
  /* 0x7cb875 gate -> 0x7cb899 RNG::RandomInt -> 0x7cb89e inc eax (u32
     wrap) -> 0x7cb89f cmp ebx,eax ; jne skip ; 0x7cb8a3 add esi,count4b. */
  if (room_field_5c == 0u || rng_known == 0) {
    return 0;
  }
  return (rng_result + 1u) == id_masked ? count4b : 0;
}

extern "C" void isaac_hud_count_7cb6e0_twin17_prep(uint32_t player_ptr,
                                                   uint32_t* out_receiver,
                                                   uint32_t* out_arg) {
  /* 0x7cb8ab push ebx (idm == 0x17 here) ; 0x7cb8ac lea ecx,[edi+0x1508]
     ; 0x7cb8b2 call 0x930aa0 — receiver = resolved player + 0x1508 (32-bit
     wrap), arg = 0x17. */
  if (out_receiver != nullptr) {
    *out_receiver = player_ptr + ISAAC_HUD_COUNT_7CB6E0_TWIN_RECV_OFF;
  }
  if (out_arg != nullptr) {
    *out_arg = ISAAC_HUD_COUNT_7CB6E0_ID_17;
  }
}

extern "C" void isaac_hud_count_7cb6e0_recurse_prep(uint32_t player_ptr,
                                                    uint32_t id,
                                                    uint32_t* out_receiver,
                                                    uint32_t* out_arg) {
  /* 0x7cb7ae/0x7cb7fd/0x7cb841: push const ; mov ecx,edi ; call 0x7cb6e0
     — receiver = the RESOLVED player (verbatim), arg = id VERBATIM (no
     0x7fff mask; the machine pushes the constants). */
  if (out_receiver != nullptr) {
    *out_receiver = player_ptr;
  }
  if (out_arg != nullptr) {
    *out_arg = id;
  }
}

extern "C" uint32_t isaac_hud_count_7cb6e0_rng_const_va(void) {
  return ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_VA;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_rng_const_a_lo(void) {
  return ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_A_LO;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_rng_const_a_hi(void) {
  return ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_A_HI;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_rng_const_b(void) {
  return ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_B;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_field_2c_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_FIELD_2C_OFF;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_field_3bc_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_FIELD_3BC_OFF;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_field_28_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_FIELD_28_OFF;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_game_room_idx_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_GAME_ROOM_IDX_OFF;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_room_field_5c_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_ROOM_FIELD_5C_OFF;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_twin_recv_off(void) {
  return ISAAC_HUD_COUNT_7CB6E0_TWIN_RECV_OFF;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_va_walk_gate(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_WALK_GATE;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_va_getplayer_call(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_GETPLAYER_CALL;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_va_room_call(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_ROOM_CALL;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_va_rng_gate(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_RNG_GATE;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_va_rng_call(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_RNG_CALL;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_va_twin17_call(void) {
  return ISAAC_HUD_COUNT_7CB6E0_VA_TWIN17_CALL;
}
extern "C" uint32_t isaac_hud_count_7cb6e0_walk_iter_cap(void) {
  return ISAAC_HUD_COUNT_7CB6E0_WALK_ITER_CAP;
}

/* ---- ABI v24: RNG::RandomInt BODY (0x007e9020) — SEPARATE xorshift32 ----
   Evidence: section-notes/hud-v24-rng/NOTES.md; cpu-dump/007e9020.txt
   (0x7e9020..0x7e9075, ret 4). The receiver is a 16-byte xorshift state
   {seed, s1, s2, s3}; this is NOT the room MT19937 (0x006eef60). The
   full body law: seed==0 -> CRT fatal (log 0xa112c0 + int3, host edge),
   else xorshift (shifts CL-masked &31), state[0] stored BEFORE the
   max==0 test, return (max==0) ? 0 : x % max (UNSIGNED div). */

extern "C" int32_t isaac_hud_rng_7e9020_seed_zero(uint32_t seed) {
  /* 0x7e9026 mov edx,[esi] ; 0x7e9028 test edx,edx ; 0x7e902a jne 0x7e9042
     — FULL-DWORD compare on state[0]: 0x100 must NOT be a fatal (only
     seed==0 enters the 0xa112c0 log + int3 @0x7e9041). */
  return seed == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_hud_rng_7e9020_xorshift(uint32_t seed,
                                                  uint32_t shift1,
                                                  uint32_t shift2,
                                                  uint32_t shift3) {
  /* 0x7e9042..0x7e9060 RNG::Next core embedded in RandomInt:
       eax = (seed >> s1) ^ seed
       edx = (eax << s2) ^ eax
       eax = (edx >> s3) ^ edx
     The shift counts are reloaded per step from state[1..3] and used as
     `cl` — x86 masks variable shifts to 5 bits, so &31 in-body. */
  uint32_t eax = (seed >> (shift1 & 31u)) ^ seed;
  const uint32_t edx = (eax << (shift2 & 31u)) ^ eax;
  eax = (edx >> (shift3 & 31u)) ^ edx;
  return eax;
}

extern "C" void isaac_hud_rng_7e9020_random_int(uint32_t seed,
                                                uint32_t shift1,
                                                uint32_t shift2,
                                                uint32_t shift3,
                                                uint32_t max,
                                                IsaacHudRng7e9020Draw* out) {
  /* Full RandomInt body: 0x7e9020..0x7e9075. */
  if (out == nullptr) {
    return;
  }
  if (seed == 0u) {
    /* 0x7e9028 test edx,edx ; 0x7e902a jne skip — seed==0 runs the CRT
       fatal: call 0xa112c0("RNG Seed is zero!") then int3 @0x7e9041.
       No successor state exists (the re-read stays zero). */
    out->value = 0u;
    out->seed_after = 0u;
    out->fatal = 1;
    return;
  }
  const uint32_t next = isaac_hud_rng_7e9020_xorshift(seed, shift1, shift2,
                                                      shift3);
  /* 0x7e9060 mov [esi],eax — the state store happens BEFORE the max test
     (0x7e9062 test ecx,ecx), so max==0 still advances. */
  out->seed_after = next;
  out->fatal = 0;
  if (max == 0u) {
    /* 0x7e9066 xor eax,eax ; ret 4 — value 0, state already advanced. */
    out->value = 0u;
    return;
  }
  /* 0x7e906d xor edx,edx ; div ecx ; eax = edx — UNSIGNED 32-bit
     remainder of next % max (edx pre-zeroed: 64/32 div). */
  out->value = next % max;
}

extern "C" uint32_t isaac_hud_rng_7e9020_va(void) {
  return ISAAC_HUD_RNG_7E9020_VA;
}
extern "C" uint32_t isaac_hud_rng_7e9020_ret_va_max0(void) {
  return ISAAC_HUD_RNG_7E9020_RET_VA_MAX0;
}
extern "C" uint32_t isaac_hud_rng_7e9020_ret_va_mod(void) {
  return ISAAC_HUD_RNG_7E9020_RET_VA_MOD;
}
extern "C" uint32_t isaac_hud_rng_7e9020_fatal_log_va(void) {
  return ISAAC_HUD_RNG_7E9020_FATAL_LOG_VA;
}
extern "C" uint32_t isaac_hud_rng_7e9020_fatal_str_va(void) {
  return ISAAC_HUD_RNG_7E9020_FATAL_STR_VA;
}
extern "C" uint32_t isaac_hud_rng_7e9020_fatal_level(void) {
  return ISAAC_HUD_RNG_7E9020_FATAL_LEVEL;
}
extern "C" uint32_t isaac_hud_rng_7e9020_fatal_int3_va(void) {
  return ISAAC_HUD_RNG_7E9020_FATAL_INT3_VA;
}
extern "C" uint32_t isaac_hud_rng_7e9020_state_bytes(void) {
  return ISAAC_HUD_RNG_7E9020_STATE_BYTES;
}
extern "C" uint32_t isaac_hud_rng_7e9020_seed_off(void) {
  return ISAAC_HUD_RNG_7E9020_SEED_OFF;
}
extern "C" uint32_t isaac_hud_rng_7e9020_shift1_off(void) {
  return ISAAC_HUD_RNG_7E9020_SHIFT1_OFF;
}
extern "C" uint32_t isaac_hud_rng_7e9020_shift2_off(void) {
  return ISAAC_HUD_RNG_7E9020_SHIFT2_OFF;
}
extern "C" uint32_t isaac_hud_rng_7e9020_shift3_off(void) {
  return ISAAC_HUD_RNG_7E9020_SHIFT3_OFF;
}
extern "C" uint32_t isaac_hud_rng_7e9020_count4b_shift1(void) {
  return ISAAC_HUD_RNG_7E9020_COUNT4B_SHIFT1;
}
extern "C" uint32_t isaac_hud_rng_7e9020_count4b_shift2(void) {
  return ISAAC_HUD_RNG_7E9020_COUNT4B_SHIFT2;
}
extern "C" uint32_t isaac_hud_rng_7e9020_count4b_shift3(void) {
  return ISAAC_HUD_RNG_7E9020_COUNT4B_SHIFT3;
}
extern "C" uint32_t isaac_hud_rng_7e9020_count4b_max(void) {
  return ISAAC_HUD_RNG_7E9020_COUNT4B_MAX;
}

/* ---- Helpers ABI v20: FUN_008318a0 shared signed-advance + rewrite + tail ----
   Evidence: output/decomp/5129df723e64/section-notes/hud-v20/NOTES.md;
   cpu-dump/008318a0.txt (0x008318a0..0x00831b9f head + mode gate),
   cpu-dump/00831f90.txt (0x00831fa1..0x00832288 mode-2/3 island),
   cpu-dump/00832640.txt (0x00832663..0x008326bc common tail). */

extern "C" uint32_t isaac_hud_8318a0_head_candidate(uint32_t field_234_ptr,
                                                    uint32_t type_28,
                                                    uint32_t kind_2c) {
  /* 0x8318e2 mov eax,[ebx+0x234]; 0x8318eb test eax,eax; je gate;
     0x8318ef cmp [eax+0x28],0x3c5; jne gate; 0x8318f8 cmp [eax+0x2c],0xa;
     0x8318fc cmove ecx,eax — candidate only when all three hold. */
  if (field_234_ptr == 0u) {
    return 0u;
  }
  if (type_28 != ISAAC_HUD_8318A0_HEAD_TYPE ||
      kind_2c != ISAAC_HUD_8318A0_HEAD_KIND) {
    return 0u;
  }
  return field_234_ptr;
}

extern "C" int32_t isaac_hud_8318a0_advance_fires(uint32_t mode,
                                                  uint32_t field_238,
                                                  uint32_t counter,
                                                  uint32_t limit) {
  /* Mode 2 (case 1): 0x831fa1 cmp [ebx+0x238],0; je 0x83209c (fast path);
     0x83209f cmp [ebx+4],[ebx+8]; 0x8320a2 jl 0x8320bd — SIGNED. Only the
     field_238==0 fast path can advance (slow path never tests the pair).
     Mode 3 (case 2): 0x8320c9 cmp [ebx+4],[ebx+8]; 0x8320cc jl 0x8320bd —
     SIGNED, with NO field_238 gate. Other modes never advance. */
  if (mode == 2u) {
    if (field_238 != 0u) {
      return 0;
    }
  } else if (mode != 3u) {
    return 0;
  }
  return static_cast<int32_t>(counter) < static_cast<int32_t>(limit) ? 1 : 0;
}

extern "C" uint32_t isaac_hud_8318a0_counter_next(uint32_t counter) {
  /* LAB_008320bd: inc eax; mov [ebx+4],eax — full u32 wrap. */
  return counter + 1u;
}

extern "C" uint32_t isaac_hud_8318a0_ratio_f32_bits(uint32_t counter,
                                                    uint32_t limit) {
  /* 0x832663/0x832668 movd; 0x83266d/0x832672 cvtdq2ps (SIGNED int32->f32);
     0x832675 divss (f32/f32, IEEE); 0x832679 movss [ebx+0xc] — the store is
     the f32 result (decompiler (int) cast is an artifact). */
  const float c = static_cast<float>(static_cast<int32_t>(counter));
  const float l = static_cast<float>(static_cast<int32_t>(limit));
  const float ratio = c / l;
  /* f32 bit pattern via the object representation (x86 + wasm are LE;
     no <bit> dependency for the host clang tag-check build). */
  const uint8_t* p = reinterpret_cast<const uint8_t*>(&ratio);
  return static_cast<uint32_t>(p[0]) |
         (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

extern "C" int32_t isaac_hud_8318a0_tail_stores_needed(uint32_t mode_after_body) {
  /* 0x832670 mov eax,[ebx] — mode RE-READ after the body (v5 recapture);
     0x83267e cmp eax,2; je store; 0x832683 cmp eax,3; jne skip. */
  return (mode_after_body == 2u || mode_after_body == 3u) ? 1 : 0;
}

extern "C" int32_t isaac_hud_8318a0_rewrite_needed(uint32_t field_6c,
                                                   uint32_t field_7c) {
  /* 0x832024 cmp dword [ebx+0x6c],0; je 0x832034 — FULL-WORD test;
     0x83202a cmp byte [ebx+0x7c],0; jne 0x832663 — LOW-BYTE test (v8 rule:
     uint32_t param + &0xff in the body). */
  return (field_6c == 0u || (field_7c & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_hud_8318a0_player_418_next(int32_t value) {
  /* 0x83207c mov ecx,0xa; 0x832081 cmp edx,ecx; 0x832083 cmovg ecx,edx
     -> SIGNED max(10, value): value > 10 ? value : 10. */
  return value > ISAAC_HUD_8318A0_PLAYER_418_MIN ? value
                                                 : ISAAC_HUD_8318A0_PLAYER_418_MIN;
}

extern "C" void isaac_hud_8318a0_advance_plan(uint32_t mode,
                                              uint32_t field_238,
                                              uint32_t counter,
                                              uint32_t limit,
                                              uint32_t mode_after_body,
                                              IsaacHud8318a0AdvancePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t fires =
      isaac_hud_8318a0_advance_fires(mode, field_238, counter, limit);
  const uint32_t counter_out = isaac_hud_8318a0_counter_next(counter);
  out->advance_fires = fires;
  out->counter_out = counter_out;
  /* The common tail reads [ebx+4] AFTER the advance store, so the ratio
     uses the POST-advance counter. */
  out->ratio_bits = isaac_hud_8318a0_ratio_f32_bits(counter_out, limit);
  out->tail_stores_needed =
      isaac_hud_8318a0_tail_stores_needed(mode_after_body);
  /* When the advance does not fire the PE runs host: mode-2 fast reset
     (0x8320a6 [ebx+4]=0; mode=3; call 0x830950) or the mode-3 body. */
  out->host_needed = fires ? 0 : 1;
  out->pure_complete = fires;
}

extern "C" void isaac_hud_8318a0_rewrite_plan(uint32_t field_6c,
                                              uint32_t field_7c,
                                              uint32_t receiver_limit,
                                              uint32_t player_begin,
                                              uint32_t player_end,
                                              IsaacHud8318a0RewritePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t rewrite =
      isaac_hud_8318a0_rewrite_needed(field_6c, field_7c);
  out->rewrite_needed = rewrite;
  out->host_leaf_needed = rewrite; /* 0x7eb1b0 only when the gate is open */
  out->game_22ed0_store = rewrite ? ISAAC_HUD_8318A0_GAME_22ED0_VALUE : 0;
  out->counter_out = rewrite ? receiver_limit : receiver_limit;
  out->mode_out = rewrite ? ISAAC_HUD_8318A0_MODE_AFTER_REWRITE : 0;
  /* Player walk Game+0x1baa8..0x1baac, stride 4, only after the rewrite. */
  out->player_walk_count =
      rewrite ? static_cast<int32_t>((player_end - player_begin) / 4u) : 0;
  out->pure_complete = rewrite ? 0 : 1;
}

extern "C" uint32_t isaac_hud_8318a0_va_head(void) {
  return ISAAC_HUD_8318A0_VA_HEAD;
}
extern "C" uint32_t isaac_hud_8318a0_va_mode_gate(void) {
  return ISAAC_HUD_8318A0_VA_MODE_GATE;
}
extern "C" uint32_t isaac_hud_8318a0_jump_table_va(void) {
  return ISAAC_HUD_8318A0_JUMP_TABLE_VA;
}
extern "C" uint32_t isaac_hud_8318a0_case_va(int32_t dispatch_case) {
  switch (dispatch_case) {
    case 0:
      return ISAAC_HUD_8318A0_CASE_VA_MODE1;
    case 1:
      return ISAAC_HUD_8318A0_CASE_VA_MODE2;
    case 2:
      return ISAAC_HUD_8318A0_CASE_VA_MODE3;
    case 3:
      return ISAAC_HUD_8318A0_CASE_VA_MODE4;
    default:
      return 0u;
  }
}
extern "C" uint32_t isaac_hud_8318a0_va_mode2_fast(void) {
  return ISAAC_HUD_8318A0_VA_MODE2_FAST;
}
extern "C" uint32_t isaac_hud_8318a0_va_shared_advance(void) {
  return ISAAC_HUD_8318A0_VA_SHARED_ADVANCE;
}
extern "C" uint32_t isaac_hud_8318a0_va_rewrite_gate(void) {
  return ISAAC_HUD_8318A0_VA_REWRITE_GATE;
}
extern "C" uint32_t isaac_hud_8318a0_va_common_tail(void) {
  return ISAAC_HUD_8318A0_VA_COMMON_TAIL;
}
extern "C" uint32_t isaac_hud_8318a0_host_va_tree_walk_prep(void) {
  return ISAAC_HUD_8318A0_HOST_VA_TREE_WALK_PREP;
}
extern "C" uint32_t isaac_hud_8318a0_host_va_reset(void) {
  return ISAAC_HUD_8318A0_HOST_VA_RESET;
}
extern "C" uint32_t isaac_hud_8318a0_host_va_7eb1b0(void) {
  return ISAAC_HUD_8318A0_HOST_VA_7EB1B0;
}
extern "C" uint32_t isaac_hud_8318a0_host_va_mode1(void) {
  return ISAAC_HUD_8318A0_HOST_VA_MODE1;
}
extern "C" uint32_t isaac_hud_8318a0_counter_off(void) {
  return ISAAC_HUD_8318A0_COUNTER_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_limit_off(void) {
  return ISAAC_HUD_8318A0_LIMIT_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_ratio_off(void) {
  return ISAAC_HUD_8318A0_RATIO_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_field_238_off(void) {
  return ISAAC_HUD_8318A0_FIELD_238_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_field_6c_off(void) {
  return ISAAC_HUD_8318A0_FIELD_6C_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_field_7c_off(void) {
  return ISAAC_HUD_8318A0_FIELD_7C_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_game_22ed0_off(void) {
  return ISAAC_HUD_8318A0_GAME_22ED0_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_game_22ed4_off(void) {
  return ISAAC_HUD_8318A0_GAME_22ED4_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_game_22edc_off(void) {
  return ISAAC_HUD_8318A0_GAME_22EDC_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_tail_store_value(void) {
  return ISAAC_HUD_8318A0_TAIL_STORE_VALUE;
}
extern "C" uint32_t isaac_hud_8318a0_player_list_off(void) {
  return ISAAC_HUD_8318A0_PLAYER_LIST_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_player_stride(void) {
  return ISAAC_HUD_8318A0_PLAYER_STRIDE;
}
extern "C" uint32_t isaac_hud_8318a0_player_418_off(void) {
  return ISAAC_HUD_8318A0_PLAYER_418_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_player_418_min(void) {
  return ISAAC_HUD_8318A0_PLAYER_418_MIN;
}
extern "C" uint32_t isaac_hud_8318a0_rewrite_mode(void) {
  return ISAAC_HUD_8318A0_MODE_AFTER_REWRITE;
}
extern "C" uint32_t isaac_hud_8318a0_game_ivar1_off(void) {
  return ISAAC_HUD_8318A0_GAME_IVAR1_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_head_field_off(void) {
  return ISAAC_HUD_8318A0_HEAD_FIELD_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_head_type_off(void) {
  return ISAAC_HUD_8318A0_HEAD_TYPE_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_head_kind_off(void) {
  return ISAAC_HUD_8318A0_HEAD_KIND_OFF;
}
extern "C" uint32_t isaac_hud_8318a0_head_type(void) {
  return ISAAC_HUD_8318A0_HEAD_TYPE;
}
extern "C" uint32_t isaac_hud_8318a0_head_kind(void) {
  return ISAAC_HUD_8318A0_HEAD_KIND;
}


/* ---- v21: 0x008318a0 mode-2 slow-path _Tree successor-walk gates -------- */

extern "C" int32_t isaac_hud_8318a0_tree_empty(uint32_t first_addr,
                                               uint32_t head_addr) {
  /* 0x831fbe cmp esi,eax ; je 0x832024 — first == head -> container empty. */
  return first_addr == head_addr ? 1 : 0;
}
extern "C" int32_t isaac_hud_8318a0_tree_visit_gate(uint32_t gate_11d) {
  /* 0x831fc2 cmp byte [esi+0x11d],0 ; je 0x831fdb — LOW BYTE test. */
  return (gate_11d & 0xffu) != 0u ? 1 : 0;
}
extern "C" int32_t isaac_hud_8318a0_tree_right_is_real(uint32_t right_isnil) {
  /* 0x831fde cmp byte [eax+0xd],0 ; je 0x832004 (descend leftmost) — the
     right node is REAL iff its _Isnil byte == 0. */
  return (right_isnil & 0xffu) == 0u ? 1 : 0;
}
extern "C" int32_t isaac_hud_8318a0_tree_left_is_real(uint32_t left_isnil) {
  /* 0x832010..0x83201a: descend while left node _Isnil == 0. */
  return (left_isnil & 0xffu) == 0u ? 1 : 0;
}
extern "C" int32_t isaac_hud_8318a0_tree_climb_continue(
    int32_t node_is_right_child, uint32_t parent_isnil) {
  /* 0x831ff0 cmp esi,[eax+8] ; jne 0x832000 ; 0x831ffa cmp byte [eax+0xd],0
     ; je 0x831ff0 — keep climbing iff node==parent.right AND the next
     parent is REAL (_Isnil==0). */
  return (node_is_right_child != 0 && (parent_isnil & 0xffu) == 0u) ? 1 : 0;
}

/* ---- v22: 0x008318a0 mode-2 slow-path WALK-ORDER plan (PE 0x831fa1..
   0x832022) ------------------------------------------------------------
   The visit loop (0x831fc2..0x832022) walks the std::_Tree-shaped
   container at [this+0x224] from begin() to end() in MSVC in-order
   successor order. The plan export resolves the WHOLE walk from linear
   memory (absolute node addresses, same contract as the exit family's
   IsaacExitRootMapWalkPlan): slow gate -> prep host -> empty gate -> per
   node {visit gate -> HOST_A+HOST_B pair} -> successor -> continue while
   node != head. The 0x409030 pair + 0x409100 prep stay host leaves. */

namespace {

inline const uint8_t* tree_node_ptr(uint32_t addr) {
  return reinterpret_cast<const uint8_t*>(static_cast<uint32_t>(addr));
}

inline uint32_t tree_load_u32(uint32_t addr) {
  uint32_t value = 0;
  const uint8_t* p = tree_node_ptr(addr);
  value |= static_cast<uint32_t>(p[0]);
  value |= static_cast<uint32_t>(p[1]) << 8;
  value |= static_cast<uint32_t>(p[2]) << 16;
  value |= static_cast<uint32_t>(p[3]) << 24;
  return value;
}

inline uint8_t tree_load_isnil(uint32_t node_addr) {
  return tree_node_ptr(node_addr +
                       static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_ISNIL_OFF))[0];
}

}  // namespace

extern "C" int32_t isaac_hud_8318a0_tree_slow_gate(uint32_t field_238) {
  /* 0x831fa1 cmp dword [ebx+0x238],0 ; je 0x83209c — FULL-DWORD test (not
     a byte gate): any nonzero word (e.g. 0x100) runs the slow path. */
  return field_238 != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_hud_8318a0_tree_prep_receiver(uint32_t this_base) {
  /* 0x831fae lea ecx,[ebx+0x38] — 32-bit wrap. */
  return static_cast<uint32_t>(
      this_base + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_PREP_RECV_OFF));
}

extern "C" uint32_t isaac_hud_8318a0_tree_walk_next(uint32_t node_addr) {
  /* 0x831fdb..0x83201a — the INLINE MSVC tree iterator++ (same algorithm
     as the exit family's isaac_exit_root_map_walk_next / 0x00414a80):
       right = [node+8]; right REAL (byte[+0xd]==0) -> leftmost-of-right
       descend; else climb while node == parent->right and parent REAL. */
  if (node_addr == 0u) {
    return 0u;
  }
  const uint32_t right = tree_load_u32(
      node_addr + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_RIGHT_OFF));
  if (tree_load_isnil(right) != 0u) {
    /* Climb (0x831fe4..0x832002): result is a parent; head when the root
       is climbed past. */
    uint32_t cur = node_addr;
    uint32_t parent = tree_load_u32(
        cur + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_PARENT_OFF));
    if (tree_load_isnil(parent) == 0u) {
      while (cur == tree_load_u32(
                       parent + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_RIGHT_OFF))) {
        cur = parent;
        parent = tree_load_u32(
            cur + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_PARENT_OFF));
        if (tree_load_isnil(parent) != 0u) {
          break;
        }
      }
    }
    return parent;
  }
  /* Descend (0x832004..0x83201a): esi = right; while left REAL keep
     descending left. */
  uint32_t walk = right;
  uint32_t left = tree_load_u32(
      walk + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_LEFT_OFF));
  while (tree_load_isnil(left) == 0u) {
    walk = left;
    left = tree_load_u32(
        walk + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_LEFT_OFF));
  }
  return walk;
}

extern "C" int32_t isaac_hud_8318a0_tree_walk_continue(uint32_t node_addr,
                                                       uint32_t head_addr) {
  /* 0x83201c cmp esi,[ebx+0x224] ; 0x832022 jne 0x831fc2 — keep visiting
     while the successor != head. This is the walk TERMINATION law. */
  return node_addr != head_addr ? 1 : 0;
}

extern "C" uint32_t isaac_hud_8318a0_tree_visit_host_a(uint32_t node_addr) {
  /* 0x831fcb lea ecx,[esi+0x44] — first 0x409030 receiver. */
  return static_cast<uint32_t>(
      node_addr + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_CALL_A_OFF));
}

extern "C" uint32_t isaac_hud_8318a0_tree_visit_host_b(uint32_t node_addr) {
  /* 0x831fd3 lea ecx,[esi+0x64] — second 0x409030 receiver. */
  return static_cast<uint32_t>(
      node_addr + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_CALL_B_OFF));
}

namespace {

inline void tree_walk_push_event(IsaacHud8318a0TreeWalkPlan* out,
                                 uint32_t kind, uint32_t payload,
                                 uint32_t* emitted) {
  if (*emitted < static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_EVENT_CAP)) {
    out->event[*emitted] =
        ((kind << 24) | (payload & 0xffffffu)) & 0xffffffffu;
    *emitted += 1u;
  } else {
    out->truncated = 1;
  }
}

}  // namespace

extern "C" void isaac_hud_8318a0_tree_walk_plan(
    IsaacHud8318a0TreeWalkPlan* out, uint32_t this_base) {
  if (out == nullptr) {
    return;
  }
  out->slow_path = 0;
  out->prep_host_needed = 0;
  out->prep_receiver = 0u;
  out->head_addr = 0u;
  out->first_node = 0u;
  out->walk_active = 0;
  out->node_count = 0;
  out->visit_gated_count = 0;
  out->host_call_count = 0;
  out->terminated = 0;
  out->truncated = 0;
  for (uint32_t i = 0;
       i < static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_EVENT_CAP); ++i) {
    out->event[i] = 0u;
  }
  uint32_t emitted = 0u;

  /* 0x831fa1: slow gate — FULL dword at [this+0x238]. Closed -> the PE
     jumps to the fast path 0x83209c and NEVER walks. */
  const uint32_t field_238 =
      tree_load_u32(this_base + static_cast<uint32_t>(ISAAC_HUD_8318A0_FIELD_238_OFF));
  if (field_238 == 0u) {
    return;
  }
  out->slow_path = 1;
  out->prep_host_needed = 1;
  out->prep_receiver = isaac_hud_8318a0_tree_prep_receiver(this_base);
  out->host_call_count = 1; /* 0x409100 prep edge (0x831fb1) */
  /* 0x831fae/0x831fb1: the prep host runs BEFORE the walk, even when the
     container is empty. */
  tree_walk_push_event(
      out, static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_KIND_PREP),
      out->prep_receiver, &emitted);

  /* 0x831fb6 mov eax,[ebx+0x224] (head); 0x831fbc mov esi,[eax] (first);
     0x831fbe cmp esi,eax / 0x831fc0 je 0x832024 — EMPTY gate. */
  const uint32_t head =
      tree_load_u32(this_base + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_LIST_HEAD_OFF));
  out->head_addr = head;
  const uint32_t first = tree_load_u32(head);
  out->first_node = first;
  if (first == head) {
    return; /* empty: prep only, no node events (PE je 0x832024) */
  }
  out->walk_active = 1;

  /* Visit loop (0x831fc2..0x832022). */
  uint32_t node = first;
  uint32_t iterations = 0u;
  for (;;) {
    if (++iterations >
        static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_NODE_CAP)) {
      out->truncated = 1;
      break;
    }
    out->node_count = static_cast<int32_t>(iterations);

    /* 0x831fc2: the visit gate is a LOW-BYTE test of [node+0x11d]. */
    tree_walk_push_event(
        out, static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_KIND_NODE),
        node, &emitted);
    const uint8_t gate = tree_node_ptr(
        node + static_cast<uint32_t>(ISAAC_HUD_8318A0_MEMBER_NODE_GATE_OFF))[0];
    if (gate != 0u) {
      /* 0x831fcb/0x831fce and 0x831fd3/0x831fd6: EXACTLY TWO 0x409030
         host edges per gated node. */
      out->visit_gated_count += 1;
      out->host_call_count += 2;
      tree_walk_push_event(
          out, static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_KIND_HOST_A),
          isaac_hud_8318a0_tree_visit_host_a(node), &emitted);
      tree_walk_push_event(
          out, static_cast<uint32_t>(ISAAC_HUD_8318A0_TREE_WALK_KIND_HOST_B),
          isaac_hud_8318a0_tree_visit_host_b(node), &emitted);
    }

    /* successor (0x831fdb..0x83201a) + termination (0x83201c/0x832022). */
    node = isaac_hud_8318a0_tree_walk_next(node);
    if (node == head) {
      out->terminated = 1;
      break;
    }
  }
}

extern "C" uint32_t isaac_hud_post_update_pure_helpers_abi_version(void) {
  return ISAAC_HUD_POST_UPDATE_PURE_HELPERS_ABI_VERSION;
}

/* ---- Helpers ABI v24: HasCollectible 0x007706e0 QUERY accept gate + ----
   composed redirect WALK (v23 handoff; v14-frozen prefix scalars stay).
   Evidence: cpu-dump/007706e0.txt (full body 0x7706e0..0x770c92) +
   section-notes/hud-v24-has-collectible/NOTES.md. The query is invoked
   cdecl 0x1b7 / 0 from the process-input record 0x009be6b0; its result
   is accepted as a LOW BYTE (0x009be71f test al,al) merged with bl
   (0x009be719 test bl,bl). The walk (0x77070d..0x770758) loops over
   config + GetPlayer(0) samples; item-config 0x72fd10 stays the shared
   typed-host (sampled, never folded). */

static_assert(sizeof(IsaacHasCollectibleWalkPlan) == 24,
              "HasCollectible walk plan is 6 x 4");

extern "C" uint32_t isaac_has_collectible_query_arg_id(void) {
  return ISAAC_HAS_COLLECTIBLE_QUERY_ARG_ID;
}

extern "C" uint32_t isaac_has_collectible_query_arg_ignore(void) {
  return ISAAC_HAS_COLLECTIBLE_QUERY_ARG_IGNORE;
}

extern "C" int32_t isaac_has_collectible_query_hit(uint32_t query_result) {
  /* 0x009be71f test al,al ; jne epilogue-B — the 0x7706e0 result is
     accepted as a LOW BYTE. RAW uint32: 0x100 is a miss. */
  return (query_result & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_has_collectible_accept_gate(uint32_t bl,
                                                     uint32_t query_result) {
  /* 0x009be719 test bl,bl ; je skip-store ; 0x009be71f test al,al — both
     are LOW-BYTE tests (bl carries a setg/1 value at the callsite). */
  if ((bl & 0xffu) == 0u) {
    return 0;
  }
  return (query_result & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_has_collectible_walk_plan(
    uint32_t player_ptr,
    uint32_t samples_addr,
    uint32_t samples_count,
    uint32_t iter_cap,
    IsaacHasCollectibleWalkPlan* out) {
  /* Composed redirect walk 0x77070d..0x770758. GetCollectible
     (0x72fd10, shared typed-host) and GetPlayer(0) (0x417870) results
     come from the caller's samples table — 16 bytes/entry
     {config_known, config_result, gp_known, gp_result}, one entry per
     walk iteration. [p+0x2c], [p+0x3bc] and [parent+0x28] are read from
     linear memory. Statuses: 0 interior (field_2c != 1) · 1 config_null
     (FALSE) · 2 getplayer_null (interior, edi unchanged) · 3 host_needed
     · 4 truncated. */
  if (out == nullptr) {
    return;
  }
  out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_INTERIOR;
  out->resolved_player = player_ptr;
  out->config_ptr = 0u;
  out->iterations = 0;
  out->host_edges = 0;
  out->host_needed = 0;
  uint32_t edi = player_ptr;
  uint32_t config = 0u;
  uint32_t idx = 0u;

  /* 0x77070d: entry config = GetCollectible(p, id) — sampled. */
  if (idx >= samples_count) {
    out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
    out->resolved_player = edi;
    out->host_needed = 1;
    return;
  }
  const uint32_t c0_known = count_load_u32(samples_addr + idx * 16u);
  config = count_load_u32(samples_addr + idx * 16u + 4u);
  out->host_edges = 1;
  if (c0_known == 0u) {
    out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
    out->resolved_player = edi;
    out->host_needed = 1;
    return;
  }
  for (;;) {
    /* 0x770712: test esi,esi ; je 0x77075a — config NULL -> FALSE. */
    if (config == 0u) {
      out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_CONFIG_NULL;
      out->resolved_player = edi;
      out->config_ptr = 0u;
      return;
    }
    /* 0x770716: cmp dword [edi+0x2c],1 ; jne 0x77076f — no redirect. */
    if (count_load_u32(edi + ISAAC_HAS_COLLECTIBLE_PLAYER_FIELD_2C_OFF) !=
        1u) {
      out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_INTERIOR;
      out->resolved_player = edi;
      out->config_ptr = config;
      return;
    }
    /* 0x77071c/0x770726: parent [edi+0x3bc] qualifies iff [+0x28]==1. */
    const uint32_t parent =
        count_load_u32(edi + ISAAC_HAS_COLLECTIBLE_PARENT_PTR_OFF);
    uint32_t next;
    if (parent != 0u &&
        count_load_u32(parent + ISAAC_HAS_COLLECTIBLE_PARENT_FLAG_OFF) ==
            1u) {
      next = parent;
    } else {
      /* 0x77072c: GetPlayer(0) — sampled. */
      if (idx >= samples_count) {
        out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
        out->resolved_player = edi;
        out->host_needed = 1;
        return;
      }
      const uint32_t gp_known =
          count_load_u32(samples_addr + idx * 16u + 8u);
      const uint32_t gp_result =
          count_load_u32(samples_addr + idx * 16u + 12u);
      out->host_edges += 1;
      if (gp_known == 0u) {
        out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
        out->resolved_player = edi;
        out->host_needed = 1;
        return;
      }
      /* 0x770739: test eax,eax ; je 0x77076f — NULL keeps edi. */
      if (gp_result == 0u) {
        out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_GETPLAYER_NULL;
        out->resolved_player = edi;
        out->config_ptr = config;
        return;
      }
      next = gp_result;
    }
    /* 0x77073d: mov edi,eax — adopt. */
    edi = next;
    out->iterations += 1;
    if (static_cast<uint32_t>(out->iterations) >= iter_cap) {
      /* Port safety bound: the PE walk has no cap; continuation unknown. */
      out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_TRUNCATED;
      out->resolved_player = edi;
      out->config_ptr = 0u;
      out->host_needed = 1;
      return;
    }
    /* 0x77074c: config = GetCollectible(new edi, id) — sampled. */
    idx += 1;
    if (idx >= samples_count) {
      out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
      out->resolved_player = edi;
      out->host_needed = 1;
      return;
    }
    const uint32_t cn_known = count_load_u32(samples_addr + idx * 16u);
    config = count_load_u32(samples_addr + idx * 16u + 4u);
    out->host_edges += 1;
    if (cn_known == 0u) {
      out->status = ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
      out->resolved_player = edi;
      out->host_needed = 1;
      return;
    }
    /* 0x770756: test esi,esi ; jne 0x770716 — loop back. */
  }
}

extern "C" uint32_t isaac_has_collectible_walk_iter_cap(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_ITER_CAP;
}

extern "C" uint32_t isaac_has_collectible_walk_sample_stride(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_SAMPLE_STRIDE;
}

extern "C" uint32_t isaac_has_collectible_accept_va_bl(void) {
  return ISAAC_HAS_COLLECTIBLE_ACCEPT_VA_BL;
}

extern "C" uint32_t isaac_has_collectible_accept_va_al(void) {
  return ISAAC_HAS_COLLECTIBLE_ACCEPT_VA_AL;
}

extern "C" uint32_t isaac_has_collectible_walk_va_config_test(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_CONFIG_TEST;
}

extern "C" uint32_t isaac_has_collectible_walk_va_f2c_gate(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_F2C_GATE;
}

extern "C" uint32_t isaac_has_collectible_walk_va_parent_probe(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_PARENT_PROBE;
}

extern "C" uint32_t isaac_has_collectible_walk_va_parent_test(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_PARENT_TEST;
}

extern "C" uint32_t isaac_has_collectible_walk_va_getplayer(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_GETPLAYER;
}

extern "C" uint32_t isaac_has_collectible_walk_va_getplayer_test(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_GETPLAYER_TEST;
}

extern "C" uint32_t isaac_has_collectible_walk_va_adopt(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_ADOPT;
}

extern "C" uint32_t isaac_has_collectible_walk_va_config_refetch(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_CONFIG_REFETCH;
}

extern "C" uint32_t isaac_has_collectible_walk_va_config_loop(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_CONFIG_LOOP;
}

extern "C" uint32_t isaac_has_collectible_walk_va_false(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_FALSE;
}

extern "C" uint32_t isaac_has_collectible_walk_va_interior(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_VA_INTERIOR;
}

extern "C" int32_t isaac_has_collectible_walk_status_interior(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_STATUS_INTERIOR;
}

extern "C" int32_t isaac_has_collectible_walk_status_config_null(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_STATUS_CONFIG_NULL;
}

extern "C" int32_t isaac_has_collectible_walk_status_getplayer_null(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_STATUS_GETPLAYER_NULL;
}

extern "C" int32_t isaac_has_collectible_walk_status_host_needed(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED;
}

extern "C" int32_t isaac_has_collectible_walk_status_truncated(void) {
  return ISAAC_HAS_COLLECTIBLE_WALK_STATUS_TRUNCATED;
}

/* ---- Helpers ABI v25: HasCollectible 0x007706e0 RNG-path PREPs ----
   Evidence: section-notes/hud-v25-rng-preps/NOTES.md;
   cpu-dump/007706e0.txt. Region A (0x770a7e..0x770ad9): the ladder RNG
   path — countA = 0x7db860(player), SIGNED gate (int32)countA > 8
   (0x770a88 jle), extra = 0x436140(&g_game->[0x1bb84]), countB =
   0x7db860(player) RE-CALLED (never folded from countA), seed =
   (u32)(countB + extra) > 1u ? sum : 1 (0x770abc cmova, UNSIGNED),
   draw = RandomInt(&recv{seed,1,0x1b,0x1b}, 6), hit iff id ==
   table[draw] (0xb6bcd0, 6 dwords) -> TRUE (0x770c29). The cmova clamps
   seed >= 1 so the v24 RNG law never fatals on this path. Region B
   (0x770915..0x770979): id==9 arm — 0x771550(_,0x5d,0) LOW-BYTE gate
   (0x770925 test al,al), seed walks g_game->[0x18300]->[+4] (->[+0x58]
   iff p18300_4 != 0, else seed 0 = FATAL int3), draw = RandomInt(
   &recv{seed,1,0xb,6}, 0x64), hit iff (u32)draw < 0x21 (0x770967 jb),
   else TRUE iff (int32)Game+0x26614 >= 2 (0x770979 jl). */

extern "C" int32_t isaac_hud_770a7e_open(uint32_t count_a) {
  /* 0x770a85 cmp eax,8 ; 0x770a88 jle 0x770ae2 — SIGNED compare: a
     full-word -1 (0xffffffff) CLOSES the path (jle taken), an
     unsigned test would wrongly open it. */
  /* The wasm32 target compiles `static_cast<int32_t>(x) > 8` to i32.gt_u
     (third instance of the wasm-pipeline compare-flip class; host clang
     gives gt_s at -O0). An explicit i64 sign-extend makes the signed
     32-bit test unambiguous: (int32)x > 8 <=> (int64)(int32)x > 8. */
  return (int64_t)(int32_t)count_a > (int64_t)ISAAC_HUD_770A7E_OPEN_GT ? 1 : 0;
}

extern "C" uint32_t isaac_hud_770a7e_seed(uint32_t count_b,
                                          uint32_t extra) {
  /* 0x770aac add eax,esi (32-bit wrap) ; 0x770ab8 cmp eax,1 ;
     0x770abc cmova ecx,eax — UNSIGNED above: seed = sum > 1u ? sum : 1.
     0xffffffff > 1u keeps 0xffffffff (a signed cmovg would clamp). */
  const uint32_t sum = count_b + extra;
  return sum > ISAAC_HUD_770A7E_CMOVA_MIN ? sum : 1u;
}

extern "C" void isaac_hud_770a7e_draw(uint32_t count_b, uint32_t extra,
                                      IsaacHud770a7eDraw* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t seed = isaac_hud_770a7e_seed(count_b, extra);
  IsaacHudRng7e9020Draw d;
  /* seed >= 1 by the cmova clamp — the v24 law cannot fatal here. */
  isaac_hud_rng_7e9020_random_int(seed, ISAAC_HUD_770A7E_SHIFT1,
                                  ISAAC_HUD_770A7E_SHIFT2,
                                  ISAAC_HUD_770A7E_SHIFT3,
                                  ISAAC_HUD_770A7E_MAX, &d);
  out->seed = seed;
  out->draw = d.value;
}

extern "C" void isaac_hud_770a7e_plan(uint32_t id, uint32_t count_a,
                                      uint32_t count_b, uint32_t extra,
                                      IsaacHud770a7ePlan* out) {
  if (out == nullptr) {
    return;
  }
  out->seed = 0u;
  out->draw = 0u;
  if (isaac_hud_770a7e_open(count_a) == 0) {
    /* Only the countA call ran (0x770a80) before the 0x770a88 jle. */
    out->status = ISAAC_HUD_770A7E_STATUS_CLOSED;
    out->host_edges = 1;
    return;
  }
  IsaacHud770a7eDraw d;
  isaac_hud_770a7e_draw(count_b, extra, &d);
  out->seed = d.seed;
  out->draw = d.draw;
  out->host_edges = 3; /* countA + extra + countB (RNG is the v24 law) */
  /* 0x770ad2 cmp ebx,[eax*4+0xb6bcd0] ; 0x770ad9 je 0x770c29 (TRUE). */
  if (id == isaac_hud_770a7e_table_entry(d.draw)) {
    out->status = ISAAC_HUD_770A7E_STATUS_HIT;
  } else {
    /* 0x770adf miss -> 0x770ae2 tail (0x771200 host). */
    out->status = ISAAC_HUD_770A7E_STATUS_MISS;
  }
}

extern "C" uint32_t isaac_hud_770a7e_table_entry(uint32_t index) {
  /* .rdata 0xb6bcd0 = {0x131,3,0x23a,0x101,0x254,0xe0}. Draw is in
     [0,6) (max 6); out-of-range returns a visible 0xffffffff sentinel
     so a bad index can never silently look like a table hit. */
  switch (index) {
    case 0: return ISAAC_HUD_770A7E_TABLE_0;
    case 1: return ISAAC_HUD_770A7E_TABLE_1;
    case 2: return ISAAC_HUD_770A7E_TABLE_2;
    case 3: return ISAAC_HUD_770A7E_TABLE_3;
    case 4: return ISAAC_HUD_770A7E_TABLE_4;
    case 5: return ISAAC_HUD_770A7E_TABLE_5;
    default: return ISAAC_HUD_770A7E_TABLE_OOB;
  }
}

extern "C" int32_t isaac_hud_770915_open(uint32_t id,
                                         uint32_t h1550_result) {
  /* 0x770915 cmp ebx,9 (full dword) ; 0x770925 test al,al — the
     0x771550 bool return is accepted as a LOW BYTE (0x100 is false). */
  if (id != ISAAC_HUD_770915_ARM_ID) {
    return 0;
  }
  return ((h1550_result & 0xffu) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_hud_770915_seed(uint32_t p18300_4,
                                          uint32_t p18300_4_58) {
  /* 0x77093b test eax,eax ; 0x77093d je 0x770942 — the [+0x58] read
     happens ONLY when p18300_4 != 0; a null p18300_4 leaves seed 0
     (the PE RNG call then int3s: FATAL). */
  return (p18300_4 != 0u) ? p18300_4_58 : 0u;
}

extern "C" void isaac_hud_770915_draw(uint32_t seed,
                                      IsaacHud770915Draw* out) {
  if (out == nullptr) {
    return;
  }
  IsaacHudRng7e9020Draw d;
  isaac_hud_rng_7e9020_random_int(seed, ISAAC_HUD_770915_SHIFT1,
                                  ISAAC_HUD_770915_SHIFT2,
                                  ISAAC_HUD_770915_SHIFT3,
                                  ISAAC_HUD_770915_MAX, &d);
  out->draw = d.value;
  out->fatal = d.fatal;
}

extern "C" int32_t isaac_hud_770915_hit(uint32_t draw) {
  /* 0x770964 cmp eax,0x21 ; 0x770967 jb 0x770c29 — UNSIGNED strict
     below: draw 0x21 is a miss, 0x20 is a hit. */
  return draw < ISAAC_HUD_770915_HIT_THRESHOLD ? 1 : 0;
}

extern "C" int32_t isaac_hud_770915_tail_gate(uint32_t game_26614) {
  /* 0x770972 cmp [eax+0x26614],2 ; 0x770979 jl 0x770a44 — SIGNED: a
     full-word -1 (0xffffffff) CHAINS (0), >= 2 is the TRUE epilogue. */
  /* i64 sign-extend: the wasm32 pipeline compiles the int32 signed
     compare as unsigned (compare-flip class). */
  return (int64_t)(int32_t)game_26614 >=
                 (int64_t)ISAAC_HUD_770915_GATE2_THRESHOLD
             ? 1
             : 0;
}

extern "C" void isaac_hud_770915_plan(uint32_t id, uint32_t h1550_result,
                                      uint32_t p18300_4,
                                      uint32_t p18300_4_58,
                                      uint32_t game_26614,
                                      IsaacHud770915Plan* out) {
  if (out == nullptr) {
    return;
  }
  out->seed = 0u;
  out->draw = 0u;
  out->hit_draw = 0;
  out->tail_true = 0;
  out->result = 0;
  if (isaac_hud_770915_open(id, h1550_result) == 0) {
    /* 0x770918 jne 0x770994 (id != 9) / 0x770927 je 0x770a44 (h1550
       low byte 0 -> chain). */
    out->status = (id == ISAAC_HUD_770915_ARM_ID)
                      ? ISAAC_HUD_770915_STATUS_H1550_FALSE
                      : ISAAC_HUD_770915_STATUS_CLOSED;
    return;
  }
  const uint32_t seed = isaac_hud_770915_seed(p18300_4, p18300_4_58);
  out->seed = seed;
  IsaacHud770915Draw d;
  isaac_hud_770915_draw(seed, &d);
  out->draw = d.draw;
  if (d.fatal != 0) {
    /* seed==0: the PE RNG call hits the 0x7e9020 int3 — no compare. */
    out->status = ISAAC_HUD_770915_STATUS_FATAL;
    return;
  }
  out->hit_draw = isaac_hud_770915_hit(d.draw);
  out->tail_true = isaac_hud_770915_tail_gate(game_26614);
  if (out->hit_draw != 0) {
    out->status = ISAAC_HUD_770915_STATUS_HIT;
    out->result = 1;
    return;
  }
  if (out->tail_true != 0) {
    /* 0x770979 jl NOT taken -> 0x77097f TRUE epilogue. */
    out->status = ISAAC_HUD_770915_STATUS_MISS_TRUE;
    out->result = 1;
    return;
  }
  out->status = ISAAC_HUD_770915_STATUS_MISS_CHAIN;
}

extern "C" uint32_t isaac_hud_770a7e_table_va(void) {
  return ISAAC_HUD_770A7E_TABLE_VA;
}
extern "C" uint32_t isaac_hud_770a7e_table_size(void) {
  return ISAAC_HUD_770A7E_TABLE_SIZE;
}
extern "C" uint32_t isaac_hud_770a7e_va(void) {
  return ISAAC_HUD_770A7E_VA;
}
extern "C" uint32_t isaac_hud_770a7e_va_open_gate(void) {
  return ISAAC_HUD_770A7E_VA_OPEN_CMP;
}
extern "C" uint32_t isaac_hud_770a7e_va_jle(void) {
  return ISAAC_HUD_770A7E_VA_OPEN_JLE;
}
extern "C" uint32_t isaac_hud_770a7e_va_count_a_call(void) {
  return ISAAC_HUD_770A7E_VA_COUNT_A_CALL;
}
extern "C" uint32_t isaac_hud_770a7e_va_extra_call(void) {
  return ISAAC_HUD_770A7E_VA_EXTRA_CALL;
}
extern "C" uint32_t isaac_hud_770a7e_va_count_b_call(void) {
  return ISAAC_HUD_770A7E_VA_COUNT_B_CALL;
}
extern "C" uint32_t isaac_hud_770a7e_va_rng_call(void) {
  return ISAAC_HUD_770A7E_VA_RNG_CALL;
}
extern "C" uint32_t isaac_hud_770a7e_va_table_cmp(void) {
  return ISAAC_HUD_770A7E_VA_TABLE_CMP;
}
extern "C" uint32_t isaac_hud_770a7e_va_table_je(void) {
  return ISAAC_HUD_770A7E_VA_TABLE_JE;
}
extern "C" uint32_t isaac_hud_770a7e_va_miss(void) {
  return ISAAC_HUD_770A7E_VA_MISS;
}
extern "C" uint32_t isaac_hud_770a7e_va_tail(void) {
  return ISAAC_HUD_770A7E_VA_TAIL;
}
extern "C" uint32_t isaac_hud_770a7e_va_true(void) {
  return ISAAC_HUD_770A7E_VA_TRUE;
}
extern "C" uint32_t isaac_hud_770a7e_host_va_count(void) {
  return ISAAC_HUD_770A7E_HOST_VA_COUNT;
}
extern "C" uint32_t isaac_hud_770a7e_host_va_extra(void) {
  return ISAAC_HUD_770A7E_HOST_VA_EXTRA;
}
extern "C" uint32_t isaac_hud_770a7e_game_global(void) {
  return ISAAC_HUD_770A7E_GAME_GLOBAL;
}
extern "C" uint32_t isaac_hud_770a7e_game_extra_off(void) {
  return ISAAC_HUD_770A7E_GAME_EXTRA_OFF;
}
extern "C" uint32_t isaac_hud_770a7e_shifts_const_va(void) {
  return ISAAC_HUD_770A7E_SHIFTS_CONST_VA;
}
extern "C" uint32_t isaac_hud_770a7e_shift3_const_va(void) {
  return ISAAC_HUD_770A7E_SHIFT3_CONST_VA;
}
extern "C" uint32_t isaac_hud_770a7e_shift1(void) {
  return ISAAC_HUD_770A7E_SHIFT1;
}
extern "C" uint32_t isaac_hud_770a7e_shift2(void) {
  return ISAAC_HUD_770A7E_SHIFT2;
}
extern "C" uint32_t isaac_hud_770a7e_shift3(void) {
  return ISAAC_HUD_770A7E_SHIFT3;
}
extern "C" uint32_t isaac_hud_770a7e_max(void) {
  return ISAAC_HUD_770A7E_MAX;
}
extern "C" uint32_t isaac_hud_770a7e_cmova_min(void) {
  return ISAAC_HUD_770A7E_CMOVA_MIN;
}
extern "C" uint32_t isaac_hud_770a7e_open_gt(void) {
  return ISAAC_HUD_770A7E_OPEN_GT;
}
extern "C" int32_t isaac_hud_770a7e_status_closed(void) {
  return ISAAC_HUD_770A7E_STATUS_CLOSED;
}
extern "C" int32_t isaac_hud_770a7e_status_hit(void) {
  return ISAAC_HUD_770A7E_STATUS_HIT;
}
extern "C" int32_t isaac_hud_770a7e_status_miss(void) {
  return ISAAC_HUD_770A7E_STATUS_MISS;
}
extern "C" uint32_t isaac_hud_770915_va(void) {
  return ISAAC_HUD_770915_VA_ARM;
}
extern "C" uint32_t isaac_hud_770915_va_id_jne(void) {
  return ISAAC_HUD_770915_VA_ID_JNE;
}
extern "C" uint32_t isaac_hud_770915_va_1550_call(void) {
  return ISAAC_HUD_770915_VA_1550_CALL;
}
extern "C" uint32_t isaac_hud_770915_va_1550_test(void) {
  return ISAAC_HUD_770915_VA_1550_TEST;
}
extern "C" uint32_t isaac_hud_770915_va_1550_false_chain(void) {
  return ISAAC_HUD_770915_VA_1550_FALSE_CHAIN;
}
extern "C" uint32_t isaac_hud_770915_va_seed_load(void) {
  return ISAAC_HUD_770915_VA_SEED_LOAD;
}
extern "C" uint32_t isaac_hud_770915_va_seed_je(void) {
  return ISAAC_HUD_770915_VA_SEED_JE;
}
extern "C" uint32_t isaac_hud_770915_va_prep(void) {
  return ISAAC_HUD_770915_VA_PREP;
}
extern "C" uint32_t isaac_hud_770915_va_shift3_load(void) {
  return ISAAC_HUD_770915_VA_SHIFT3_LOAD;
}
extern "C" uint32_t isaac_hud_770915_va_rng_call(void) {
  return ISAAC_HUD_770915_VA_RNG_CALL;
}
extern "C" uint32_t isaac_hud_770915_va_hit_cmp(void) {
  return ISAAC_HUD_770915_VA_HIT_CMP;
}
extern "C" uint32_t isaac_hud_770915_va_hit_jb(void) {
  return ISAAC_HUD_770915_VA_HIT_JB;
}
extern "C" uint32_t isaac_hud_770915_va_gate2_load(void) {
  return ISAAC_HUD_770915_VA_GATE2_LOAD;
}
extern "C" uint32_t isaac_hud_770915_va_gate2_cmp(void) {
  return ISAAC_HUD_770915_VA_GATE2_CMP;
}
extern "C" uint32_t isaac_hud_770915_va_gate2_jl(void) {
  return ISAAC_HUD_770915_VA_GATE2_JL;
}
extern "C" uint32_t isaac_hud_770915_va_true(void) {
  return ISAAC_HUD_770915_VA_TRUE;
}
extern "C" uint32_t isaac_hud_770915_host_va_1550(void) {
  return ISAAC_HUD_770915_HOST_VA_1550;
}
extern "C" uint32_t isaac_hud_770915_game_global(void) {
  return ISAAC_HUD_770915_GAME_GLOBAL;
}
extern "C" uint32_t isaac_hud_770915_game_p18300_off(void) {
  return ISAAC_HUD_770915_GAME_P18300_OFF;
}
extern "C" uint32_t isaac_hud_770915_game_p18300_p4_off(void) {
  return ISAAC_HUD_770915_GAME_P18300_P4_OFF;
}
extern "C" uint32_t isaac_hud_770915_game_p18300_p4_58_off(void) {
  return ISAAC_HUD_770915_GAME_P18300_P4_58_OFF;
}
extern "C" uint32_t isaac_hud_770915_game_26614_off(void) {
  return ISAAC_HUD_770915_GAME_26614_OFF;
}
extern "C" uint32_t isaac_hud_770915_shifts_const_va(void) {
  return ISAAC_HUD_770915_SHIFTS_CONST_VA;
}
extern "C" uint32_t isaac_hud_770915_shift3_const_va(void) {
  return ISAAC_HUD_770915_SHIFT3_CONST_VA;
}
extern "C" uint32_t isaac_hud_770915_shift1(void) {
  return ISAAC_HUD_770915_SHIFT1;
}
extern "C" uint32_t isaac_hud_770915_shift2(void) {
  return ISAAC_HUD_770915_SHIFT2;
}
extern "C" uint32_t isaac_hud_770915_shift3(void) {
  return ISAAC_HUD_770915_SHIFT3;
}
extern "C" uint32_t isaac_hud_770915_max(void) {
  return ISAAC_HUD_770915_MAX;
}
extern "C" uint32_t isaac_hud_770915_arm_id(void) {
  return ISAAC_HUD_770915_ARM_ID;
}
extern "C" uint32_t isaac_hud_770915_arg_id(void) {
  return ISAAC_HUD_770915_ARG_ID;
}
extern "C" uint32_t isaac_hud_770915_arg_flag(void) {
  return ISAAC_HUD_770915_ARG_FLAG;
}
extern "C" uint32_t isaac_hud_770915_hit_threshold(void) {
  return ISAAC_HUD_770915_HIT_THRESHOLD;
}
extern "C" uint32_t isaac_hud_770915_gate2_threshold(void) {
  return ISAAC_HUD_770915_GATE2_THRESHOLD;
}
extern "C" int32_t isaac_hud_770915_status_closed(void) {
  return ISAAC_HUD_770915_STATUS_CLOSED;
}
extern "C" int32_t isaac_hud_770915_status_h1550_false(void) {
  return ISAAC_HUD_770915_STATUS_H1550_FALSE;
}
extern "C" int32_t isaac_hud_770915_status_fatal(void) {
  return ISAAC_HUD_770915_STATUS_FATAL;
}
extern "C" int32_t isaac_hud_770915_status_hit(void) {
  return ISAAC_HUD_770915_STATUS_HIT;
}
extern "C" int32_t isaac_hud_770915_status_miss_true(void) {
  return ISAAC_HUD_770915_STATUS_MISS_TRUE;
}
extern "C" int32_t isaac_hud_770915_status_miss_chain(void) {
  return ISAAC_HUD_770915_STATUS_MISS_CHAIN;
}

/* ---- Helpers ABI v26: HasCollectible 0x007706e0 tail true-chain ----
   (notes hud-v26-next/NOTES.md). The window after the 0x770ae2
   0x771200 tail gate: scalar gate 0x770ba1..0x770bad (mov eax,
   [edi+0x1fb8]; test eax,eax; je 0x770baf; cmp eax,ebx; je 0x770c29)
   is PURE — (p_1fb8 != 0) && (p_1fb8 == id), FULL-dword equality.
   The recorded sampled tail gates get pure DECISION laws, each
   consuming exactly one host sample (v25 770915_open style): 0x170/
   0x202c byte gates, the 0x1f84 dword gate, the 0x557b00-resolved
   element +0x14 SIGNED jg, the 0x9e0650 SIGNED jg, the 0x9305f0 LOW-
   BYTE gate (id arm), the 0x7911c0 SIGNED jns, the 0xbf recursion
   LOW-BYTE gate + [p+0x1390] equality, the 0x1e8 LOW-BYTE gate +
   [p+0x1388] equality. All compare senses pinned in the notes; the
   signed ones use the explicit i64 sign-extend form (wasm32 compare-
   flip class) with wide-case 0xffffffff coverage in the tests. The
   0x770c3e counter epilogue (0x2ef4/0x2ef0/0x16c8, setg > 1 / > 0)
   is the next frontier. */

extern "C" int32_t isaac_hud_770ba1_scalar_gate(uint32_t p_1fb8,
                                                uint32_t id) {
  /* 0x770ba1 mov eax,[edi+0x1fb8] ; 0x770ba7 test eax,eax ;
     0x770ba9 je 0x770baf — a NULL p_1fb8 SKIPS the gate entirely (so
     p_1fb8 0 + id 0 is FALSE); 0x770bab cmp eax,ebx ; 0x770bad
     je 0x770c29 — FULL-dword equality (no byte masking). */
  return (p_1fb8 != 0u) && (p_1fb8 == id) ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_gate_170(uint32_t byte_170) {
  /* 0x770b0c cmp byte [edi+0x170],0 ; je 0x770b45 — byte test, widened
     param masked (byte-gate discipline: 0x100 is false). */
  return (byte_170 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_gate_202c(uint32_t byte_202c) {
  /* 0x770b45 cmp byte [edi+0x202c],0 ; je 0x770b70 — byte test, widened
     param masked (byte-gate discipline: 0x100 is false). */
  return (byte_202c & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_gate_1f84(uint32_t p_1f84) {
  /* 0x770b70 cmp dword [edi+0x1f84],0 ; je 0x770ba1 — FULL-dword zero
     test: 0x100 OPENS the gate (a low-byte fold would close it). */
  return p_1f84 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_elem_557b00_open(uint32_t field_14) {
  /* 0x770b95 cmp dword [eax+0x14],0 ; 0x770b9b jg 0x770c29 — SIGNED:
     the 0x557b00-resolved element's +0x14 field must be > 0; a
     full-word -1 (0xffffffff) must NOT open. */
  /* i64 sign-extend: the wasm32 pipeline compiles the int32 signed
     compare as unsigned (compare-flip class). */
  return (int64_t)(int32_t)field_14 > 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_9e0650_open(uint32_t host_result) {
  /* 0x770bbb test eax,eax ; 0x770bbd jg 0x770c29 — SIGNED: the
     0x9e0650(&p+0x1fc8, id) result is accepted as a full dword:
     (int32)host_result > 0 (0xffffffff is FALSE). */
  return (int64_t)(int32_t)host_result > 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_9305f0_open(uint32_t host_result) {
  /* 0x770bdb test al,al ; 0x770bdd jne 0x770c29 — LOW-BYTE: the
     0x9305f0(&p+0x1508, id) bool return (0x100 is false). */
  return (host_result & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_7911c0_open(uint32_t host_result) {
  /* 0x770be7 test eax,eax ; 0x770be9 jns 0x770c29 — SIGNED: the
     0x7911c0(player, id) result must be >= 0 (0xffffffff is FALSE). */
  return (int64_t)(int32_t)host_result >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_bf_recursive_open(uint32_t host_result) {
  /* 0x770c01 test al,al ; je 0x770c0d — LOW-BYTE: the recursive
     0x7706e0(player, 0xbf, 0) bool return (0x100 is false). */
  return (host_result & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_9305f0_1e8_open(uint32_t host_result) {
  /* 0x770c1d test al,al ; je 0x770c3e — LOW-BYTE: the
     0x9305f0(&p+0x1508, 0x1e8) bool return (0x100 is false). */
  return (host_result & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_field_1390_eq(uint32_t p_1390,
                                                  uint32_t id) {
  /* 0x770c05 cmp ebx,[edi+0x1390] ; 0x770c0b je 0x770c29 — FULL-dword
     equality of the sampled recursion-id field. */
  return p_1390 == id ? 1 : 0;
}

extern "C" int32_t isaac_hud_770ba1_field_1388_eq(uint32_t p_1388,
                                                  uint32_t id) {
  /* 0x770c21 cmp ebx,[edi+0x1388] ; 0x770c27 jne 0x770c3e — FULL-dword
     equality of the sampled 0x1e8-arm id field. */
  return p_1388 == id ? 1 : 0;
}

extern "C" uint32_t isaac_hud_770ba1_va_gate(void) {
  return ISAAC_HUD_770BA1_VA_GATE;
}
extern "C" uint32_t isaac_hud_770ba1_va_test(void) {
  return ISAAC_HUD_770BA1_VA_TEST;
}
extern "C" uint32_t isaac_hud_770ba1_va_je(void) {
  return ISAAC_HUD_770BA1_VA_JE;
}
extern "C" uint32_t isaac_hud_770ba1_va_cmp(void) {
  return ISAAC_HUD_770BA1_VA_CMP;
}
extern "C" uint32_t isaac_hud_770ba1_va_je_true(void) {
  return ISAAC_HUD_770BA1_VA_JE_TRUE;
}
extern "C" uint32_t isaac_hud_770ba1_va_jg_9e0650(void) {
  return ISAAC_HUD_770BA1_VA_JG_9E0650;
}
extern "C" uint32_t isaac_hud_770ba1_va_jns_7911c0(void) {
  return ISAAC_HUD_770BA1_VA_JNS_7911C0;
}
extern "C" uint32_t isaac_hud_770ba1_va_jg_557b00(void) {
  return ISAAC_HUD_770BA1_VA_JG_557B00;
}
extern "C" uint32_t isaac_hud_770ba1_va_cmp_557b00(void) {
  return ISAAC_HUD_770BA1_VA_CMP_557B00;
}
extern "C" uint32_t isaac_hud_770ba1_va_je_1390(void) {
  return ISAAC_HUD_770BA1_VA_JE_1390;
}
extern "C" uint32_t isaac_hud_770ba1_va_cmp_1390(void) {
  return ISAAC_HUD_770BA1_VA_CMP_1390;
}
extern "C" uint32_t isaac_hud_770ba1_va_je_1388(void) {
  return ISAAC_HUD_770BA1_VA_JE_1388;
}
extern "C" uint32_t isaac_hud_770ba1_va_cmp_1388(void) {
  return ISAAC_HUD_770BA1_VA_CMP_1388;
}
extern "C" uint32_t isaac_hud_770ba1_va_test_9305f0(void) {
  return ISAAC_HUD_770BA1_VA_TEST_9305F0;
}
extern "C" uint32_t isaac_hud_770ba1_va_test_rec(void) {
  return ISAAC_HUD_770BA1_VA_TEST_REC;
}
extern "C" uint32_t isaac_hud_770ba1_va_test_1e8(void) {
  return ISAAC_HUD_770BA1_VA_TEST_1E8;
}
extern "C" uint32_t isaac_hud_770ba1_va_gate_170(void) {
  return ISAAC_HUD_770BA1_VA_GATE_170;
}
extern "C" uint32_t isaac_hud_770ba1_va_gate_202c(void) {
  return ISAAC_HUD_770BA1_VA_GATE_202C;
}
extern "C" uint32_t isaac_hud_770ba1_va_gate_1f84(void) {
  return ISAAC_HUD_770BA1_VA_GATE_1F84;
}
extern "C" uint32_t isaac_hud_770ba1_va_true(void) {
  return ISAAC_HUD_770BA1_VA_TRUE;
}
extern "C" uint32_t isaac_hud_770ba1_va_counter_epilogue(void) {
  return ISAAC_HUD_770BA1_VA_COUNTER_EPILOGUE;
}
extern "C" uint32_t isaac_hud_770ba1_off_1fb8(void) {
  return ISAAC_HUD_770BA1_OFF_1FB8;
}
extern "C" uint32_t isaac_hud_770ba1_off_170(void) {
  return ISAAC_HUD_770BA1_OFF_170;
}
extern "C" uint32_t isaac_hud_770ba1_off_202c(void) {
  return ISAAC_HUD_770BA1_OFF_202C;
}
extern "C" uint32_t isaac_hud_770ba1_off_1f84(void) {
  return ISAAC_HUD_770BA1_OFF_1F84;
}
extern "C" uint32_t isaac_hud_770ba1_off_1f80(void) {
  return ISAAC_HUD_770BA1_OFF_1F80;
}
extern "C" uint32_t isaac_hud_770ba1_off_1fc8(void) {
  return ISAAC_HUD_770BA1_OFF_1FC8;
}
extern "C" uint32_t isaac_hud_770ba1_off_1508(void) {
  return ISAAC_HUD_770BA1_OFF_1508;
}
extern "C" uint32_t isaac_hud_770ba1_off_1390(void) {
  return ISAAC_HUD_770BA1_OFF_1390;
}
extern "C" uint32_t isaac_hud_770ba1_off_1388(void) {
  return ISAAC_HUD_770BA1_OFF_1388;
}
extern "C" uint32_t isaac_hud_770ba1_off_1e6c(void) {
  return ISAAC_HUD_770BA1_OFF_1E6C;
}
extern "C" uint32_t isaac_hud_770ba1_elem_14_off(void) {
  return ISAAC_HUD_770BA1_ELEM_14_OFF;
}
extern "C" uint32_t isaac_hud_770ba1_host_va_9e0650(void) {
  return ISAAC_HUD_770BA1_HOST_VA_9E0650;
}
extern "C" uint32_t isaac_hud_770ba1_host_va_557b00(void) {
  return ISAAC_HUD_770BA1_HOST_VA_557B00;
}
extern "C" uint32_t isaac_hud_770ba1_host_va_9305f0(void) {
  return ISAAC_HUD_770BA1_HOST_VA_9305F0;
}
extern "C" uint32_t isaac_hud_770ba1_host_va_7307b0(void) {
  return ISAAC_HUD_770BA1_HOST_VA_7307B0;
}
extern "C" uint32_t isaac_hud_770ba1_host_va_7911c0(void) {
  return ISAAC_HUD_770BA1_HOST_VA_7911C0;
}
extern "C" uint32_t isaac_hud_770ba1_host_va_771200(void) {
  return ISAAC_HUD_770BA1_HOST_VA_771200;
}
extern "C" uint32_t isaac_hud_770ba1_rec_id(void) {
  return ISAAC_HUD_770BA1_REC_ID;
}
extern "C" uint32_t isaac_hud_770ba1_id_1e8(void) {
  return ISAAC_HUD_770BA1_ID_1E8;
}
extern "C" uint32_t isaac_hud_770ba1_rec_flag(void) {
  return ISAAC_HUD_770BA1_REC_FLAG;
}

/* ---- Helpers ABI v27: HasCollectible counter epilogue 0x770c3e + the
   composed region-C tail plan ----
   (notes hud-v27-770c3e/NOTES.md). The function's LAST block
   (0x770c3e..0x770c92, ret 8): held_id = dword[p+0x2ef4]; the STRICT
   path (count > 1) is taken iff held_id != 0u && id == held_id (FULL
   dword both) && byte[p+0x2ef0] == 0 (LOW-BYTE); else the LOOSE path
   (count > 0). table = dword[p+0x16c8], [eax+ebx*4] full 32-bit
   scaled index. Both compares are cmp dword,imm ; setg — SIGNED (i64
   sign-extend form; wide case 0xffffffff is FALSE for both). The tail
   plan composes region C (0x770b0c..0x770c27, the v26 gate laws) with
   this epilogue in machine order; host leaves stay samples with
   v17/v19 known/unknown pairs. ---- */

extern "C" int32_t isaac_hud_770c3e_strict(uint32_t held_id, uint32_t id,
                                           uint32_t held_flag) {
  /* 0x770c3e mov eax,[edi+0x2ef4] ; 0x770c44 test eax,eax ; 0x770c46
     je 0x770c75 ; 0x770c48 cmp ebx,eax ; 0x770c4a jne 0x770c75 —
     FULL-dword test/cmp on held_id (0x100 is a valid held id);
     0x770c4c cmp byte [edi+0x2ef0],0 ; 0x770c53 jne 0x770c75 — the
     held byte must be CLEAR, LOW-BYTE (0x100 masks to 0 -> strict). */
  if (held_id == 0u) {
    return 0;
  }
  if (held_id != id) {
    return 0;
  }
  return (held_flag & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_770c3e_count_gt_1(uint32_t count) {
  /* 0x770c5d cmp dword [eax+ebx*4],1 ; 0x770c62 setg al — SIGNED:
     a full-word -1 (0xffffffff) must NOT satisfy count > 1. */
  /* i64 sign-extend: the wasm32 pipeline compiles the int32 signed
     compare as unsigned (compare-flip class). */
  return (int64_t)(int32_t)count > 1 ? 1 : 0;
}

extern "C" int32_t isaac_hud_770c3e_count_gt_0(uint32_t count) {
  /* 0x770c80 cmp dword [eax+ebx*4],0 ; 0x770c85 setg al — SIGNED:
     a full-word -1 (0xffffffff) must NOT satisfy count > 0. */
  return (int64_t)(int32_t)count > 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_770c3e_result(int32_t strict, uint32_t count) {
  /* The 0x770c46/0x770c4a/0x770c53 path selector: strict -> cmp 1
     (0x770c5d), loose -> cmp 0 (0x770c80). */
  if (strict != 0) {
    return isaac_hud_770c3e_count_gt_1(count);
  }
  return isaac_hud_770c3e_count_gt_0(count);
}

extern "C" uint32_t isaac_hud_770c3e_table_addr(uint32_t table,
                                                uint32_t id) {
  /* 0x770c55/0x770c75 mov eax,[edi+0x16c8] ; [eax+ebx*4] — full 32-bit
     scaled index (u32 wrap). */
  return table + id * 4u;
}

extern "C" void isaac_hud_770c3e_tail_plan(
    uint32_t id,
    uint32_t byte_170,
    uint32_t byte_202c,
    uint32_t p_1f84,
    uint32_t cfg,
    uint32_t twin,
    int32_t ra_known, uint32_t ra,
    int32_t rb_known, uint32_t rb,
    int32_t rc_known, uint32_t rc,
    int32_t elem_known, uint32_t resolved_elem, uint32_t elem_14,
    uint32_t p_1f80,
    uint32_t p_1fb8,
    int32_t r1_known, uint32_t r1,
    int32_t r2_known, uint32_t r2,
    int32_t r3_known, uint32_t r3,
    int32_t r4_known, uint32_t r4,
    int32_t r5_known, uint32_t r5,
    uint32_t p_1390,
    int32_t r6_known, uint32_t r6,
    uint32_t p_1388,
    uint32_t held_id,
    uint32_t held_flag,
    int32_t count,
    IsaacHud770c3eTailPlan* out) {
  /* Composed region-C tail (0x770b0c..0x770c27, v26 gate laws) + the
     counter epilogue (0x770c3e..0x770c92) in machine order. Host
     results are known/unknown pairs; a sample is REQUIRED only when the
     chain actually reaches it (short-circuit). result_known = 1 iff
     every required sample is known; host_needed reports the opposite. */
  if (out == nullptr) {
    return;
  }
  out->gate_170 = isaac_hud_770ba1_gate_170(byte_170);
  out->gate_202c = isaac_hud_770ba1_gate_202c(byte_202c);
  out->gate_1f84 = isaac_hud_770ba1_gate_1f84(p_1f84);
  out->scalar_hit = isaac_hud_770ba1_scalar_gate(p_1fb8, id);
  out->arm_170_active = (out->gate_170 != 0 && cfg != 0u) ? 1 : 0;
  out->arm_202c_active = (out->gate_202c != 0 && cfg != 0u) ? 1 : 0;
  out->elem_arm = out->gate_1f84;
  out->pair_active = cfg != 0u ? 1 : 0;
  out->rec_bf_active = id != 0xbfu ? 1 : 0;
  out->exit_kind = ISAAC_HUD_770C3E_EXIT_EPILOGUE;
  out->epilogue_strict =
      isaac_hud_770c3e_strict(held_id, id, held_flag);
  out->result = 0;
  out->result_known = 0;
  out->host_needed = 0;
  out->host_edge_count = 0;
  out->pure_complete = 0;

  int32_t needed = 0; /* unknown REQUIRED sample seen */
  int32_t edges = 0;
  int32_t done = 0;   /* an exit already fired */

  /* 0x770b0c..0x770b43: the 0x170 arm (ra / twin / rb). */
  if (out->arm_170_active != 0) {
    if (ra_known == 0) {
      needed = 1;
    }
    edges += 1;
    if ((ra & 0xffu) != 0u && twin != 0u) {
      if (rb_known == 0) {
        needed = 1;
      }
      edges += 1;
      if ((rb & 0xffu) != 0u) {
        /* 0x770b3f jne 0x770c29 — TRUE. */
        out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
        out->result = 1;
        done = 1;
      }
    }
  }
  /* 0x770b45..0x770b6a: the 0x202c arm (rc + the 0x216 FALSE exit). */
  if (done == 0 && out->arm_202c_active != 0) {
    if (rc_known == 0) {
      needed = 1;
    }
    edges += 1;
    if ((rc & 0xffu) == 0u && id != ISAAC_HUD_770C3E_ID_216) {
      /* 0x770b6a jne 0x77075a — FALSE exit (al=0). */
      out->exit_kind = ISAAC_HUD_770C3E_EXIT_FALSE_216;
      out->result = 0;
      done = 1;
    }
  }
  /* 0x770b70..0x770b9b: the 0x1f84 / 0x557b00 arm. */
  if (done == 0 && out->elem_arm != 0) {
    if (elem_known == 0) {
      needed = 1;
    }
    edges += 1;
    if (resolved_elem != p_1f80) {
      /* 0x770b97 cmp dword [eax+0x14],0 ; 0x770b9b jg 0x770c29. */
      if (isaac_hud_770ba1_elem_557b00_open(elem_14) != 0) {
        out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
        out->result = 1;
        done = 1;
      }
    }
  }
  /* 0x770ba1..0x770bad: the pure scalar gate. */
  if (done == 0 && out->scalar_hit != 0) {
    out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
    out->result = 1;
    done = 1;
  }
  /* 0x770baf..0x770bbd: 0x9e0650 r1. */
  if (done == 0) {
    if (r1_known == 0) {
      needed = 1;
    }
    edges += 1;
    if (isaac_hud_770ba1_9e0650_open(r1) != 0) {
      out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
      out->result = 1;
      done = 1;
    }
  }
  /* 0x770bbf..0x770bdd: the esi-gated 0x7307b0 / 0x9305f0 pair. */
  if (done == 0 && cfg != 0u) {
    if (r2_known == 0) {
      needed = 1;
    }
    edges += 1;
    if ((r2 & 0xffu) != 0u) {
      if (r3_known == 0) {
        needed = 1;
      }
      edges += 1;
      if (isaac_hud_770ba1_9305f0_open(r3) != 0) {
        out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
        out->result = 1;
        done = 1;
      }
    }
  }
  /* 0x770bdf..0x770be9: 0x7911c0 r4. */
  if (done == 0) {
    if (r4_known == 0) {
      needed = 1;
    }
    edges += 1;
    if (isaac_hud_770ba1_7911c0_open(r4) != 0) {
      out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
      out->result = 1;
      done = 1;
    }
  }
  /* 0x770beb..0x770c0b: the 0xbf recursion (skipped for id == 0xbf). */
  if (done == 0 && id != 0xbfu) {
    if (r5_known == 0) {
      needed = 1;
    }
    edges += 1;
    if (isaac_hud_770ba1_bf_recursive_open(r5) != 0 &&
        isaac_hud_770ba1_field_1390_eq(p_1390, id) != 0) {
      out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
      out->result = 1;
      done = 1;
    }
  }
  /* 0x770c0d..0x770c27: the 0x1e8 arm. */
  if (done == 0) {
    if (r6_known == 0) {
      needed = 1;
    }
    edges += 1;
    if (isaac_hud_770ba1_9305f0_1e8_open(r6) != 0 &&
        isaac_hud_770ba1_field_1388_eq(p_1388, id) != 0) {
      out->exit_kind = ISAAC_HUD_770C3E_EXIT_TRUE;
      out->result = 1;
      done = 1;
    }
  }
  /* 0x770c3e: the counter epilogue (final path when nothing exited). */
  if (done == 0) {
    out->result = isaac_hud_770c3e_result(out->epilogue_strict, count);
  }
  out->host_edge_count = edges;
  out->host_needed = needed;
  out->result_known = needed == 0 ? 1 : 0;
  out->pure_complete = out->result_known;
}

extern "C" uint32_t isaac_hud_770c3e_va_head(void) {
  return ISAAC_HUD_770C3E_VA_HEAD;
}
extern "C" uint32_t isaac_hud_770c3e_va_test_held(void) {
  return ISAAC_HUD_770C3E_VA_TEST_HELD;
}
extern "C" uint32_t isaac_hud_770c3e_va_je_held(void) {
  return ISAAC_HUD_770C3E_VA_JE_HELD;
}
extern "C" uint32_t isaac_hud_770c3e_va_cmp_held(void) {
  return ISAAC_HUD_770C3E_VA_CMP_HELD;
}
extern "C" uint32_t isaac_hud_770c3e_va_jne_held(void) {
  return ISAAC_HUD_770C3E_VA_JNE_HELD;
}
extern "C" uint32_t isaac_hud_770c3e_va_cmp_byte(void) {
  return ISAAC_HUD_770C3E_VA_CMP_BYTE;
}
extern "C" uint32_t isaac_hud_770c3e_va_jne_byte(void) {
  return ISAAC_HUD_770C3E_VA_JNE_BYTE;
}
extern "C" uint32_t isaac_hud_770c3e_va_table_load(void) {
  return ISAAC_HUD_770C3E_VA_TABLE_LOAD;
}
extern "C" uint32_t isaac_hud_770c3e_va_cmp_1(void) {
  return ISAAC_HUD_770C3E_VA_CMP_1;
}
extern "C" uint32_t isaac_hud_770c3e_va_setg_1(void) {
  return ISAAC_HUD_770C3E_VA_SETG_1;
}
extern "C" uint32_t isaac_hud_770c3e_va_path_b(void) {
  return ISAAC_HUD_770C3E_VA_PATH_B;
}
extern "C" uint32_t isaac_hud_770c3e_va_cmp_0(void) {
  return ISAAC_HUD_770C3E_VA_CMP_0;
}
extern "C" uint32_t isaac_hud_770c3e_va_setg_0(void) {
  return ISAAC_HUD_770C3E_VA_SETG_0;
}
extern "C" uint32_t isaac_hud_770c3e_va_ret(void) {
  return ISAAC_HUD_770C3E_VA_RET;
}
extern "C" uint32_t isaac_hud_770c3e_va_true(void) {
  return ISAAC_HUD_770C3E_VA_TRUE;
}
extern "C" uint32_t isaac_hud_770c3e_va_false_216(void) {
  return ISAAC_HUD_770C3E_VA_FALSE_216;
}
extern "C" uint32_t isaac_hud_770c3e_va_false(void) {
  return ISAAC_HUD_770C3E_VA_FALSE;
}
extern "C" uint32_t isaac_hud_770c3e_va_region_c(void) {
  return ISAAC_HUD_770C3E_VA_REGION_C;
}
extern "C" uint32_t isaac_hud_770c3e_held_id_off(void) {
  return ISAAC_HUD_770C3E_HELD_ID_OFF;
}
extern "C" uint32_t isaac_hud_770c3e_held_flag_off(void) {
  return ISAAC_HUD_770C3E_HELD_FLAG_OFF;
}
extern "C" uint32_t isaac_hud_770c3e_table_off(void) {
  return ISAAC_HUD_770C3E_TABLE_OFF;
}
extern "C" uint32_t isaac_hud_770c3e_strict_threshold(void) {
  return ISAAC_HUD_770C3E_STRICT_THRESHOLD;
}
extern "C" uint32_t isaac_hud_770c3e_loose_threshold(void) {
  return ISAAC_HUD_770C3E_LOOSE_THRESHOLD;
}
extern "C" uint32_t isaac_hud_770c3e_id_216(void) {
  return ISAAC_HUD_770C3E_ID_216;
}
extern "C" uint32_t isaac_hud_770c3e_arm170_flag(void) {
  return ISAAC_HUD_770C3E_ARM170_FLAG;
}
extern "C" uint32_t isaac_hud_770c3e_arm202c_flag(void) {
  return ISAAC_HUD_770C3E_ARM202C_FLAG;
}
extern "C" uint32_t isaac_hud_770c3e_host_va_5b1500(void) {
  return ISAAC_HUD_770C3E_HOST_VA_5B1500;
}
extern "C" int32_t isaac_hud_770c3e_exit_epilogue(void) {
  return ISAAC_HUD_770C3E_EXIT_EPILOGUE;
}
extern "C" int32_t isaac_hud_770c3e_exit_true(void) {
  return ISAAC_HUD_770C3E_EXIT_TRUE;
}
extern "C" int32_t isaac_hud_770c3e_exit_false_216(void) {
  return ISAAC_HUD_770C3E_EXIT_FALSE_216;
}

/* ---- Helpers ABI v28: the 0x770ae2 tail gate + the 0x771200 body ----
   (notes hud-v28-771200/NOTES.md). The last un-narrowed region-C
   predecessor of HasCollectible 0x007706e0. The gate at 0x770ae2:
   `call 0x771200(player, id, flag)` (flag is a DEAD param — stale ecx
   from the RNG call, never read inside 0x771200); `test al,al` (LOW
   BYTE) -> TRUE exit 0x770c29; else `cmp ebx,0x76` (FULL dword) opens
   the 0x9305f0(&player->[0x1508], 0x76) arm, LOW-BYTE -> TRUE; else
   falls into region C 0x770b0c (v26/v27 lawed). The 0x771200 body
   (0x00771200..0x0077140a, ret 8): the find preamble (room vector
   [0x4b3d8]/[0x4b3dc] emptiness, the 0x731ee0 pair find over
   &room->[0x4c440], record byte[+0xd] / unsigned u64 pair / sentinel
   checks, the 0x914150 resolve into edi) stays HOST — samples only.
   The pure surface is the mode dispatch dword[player+0x13c0] over
   {0xd,0xa,2,5,6,8,0xb,0x12} (FULL dword cmp chain 0x7712bc..0x7712f6,
   default FALSE 0x771402) with per-case gates, all FULL-dword id
   compares; byte gates mask & 0xff (uint32_t params, no uint8_t).
   room_game (0x77134d..0x77136f / 0x7713b5..0x7713d8): [room+8] == 2
   (FULL dword) && g_game = dword[0xc71678] != 0 && ((u32)
   [g_game+0x26630] > 0 (ja — UNSIGNED; 0xffffffff OPENS) ||
   byte[g_game+0x26589] != 0 (LOW BYTE)). Mode 8 adds [g_game+0x26584]
   == 0 (FULL dword, 0x77137a); mode 0x12: id == 0x248 && 26584 not in
   {0x25, 0x26}. NO signed compares in the body. ---- */

extern "C" int32_t isaac_hud_771200_mode_open(uint32_t mode) {
  /* 0x7712bc cmp eax,0xd ; je 0x7713e9 ... 0x7712f3 cmp eax,0x12 ;
     jne 0x771402 — FULL-dword dispatch; every other mode is FALSE. */
  switch (mode) {
    case ISAAC_HUD_771200_MODE_D:
    case ISAAC_HUD_771200_MODE_A:
    case ISAAC_HUD_771200_MODE_2:
    case ISAAC_HUD_771200_MODE_5:
    case ISAAC_HUD_771200_MODE_6:
    case ISAAC_HUD_771200_MODE_8:
    case ISAAC_HUD_771200_MODE_B:
    case ISAAC_HUD_771200_MODE_12:
      return 1;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_hud_771200_room_game_open(uint32_t room_8,
                                                   uint32_t g_game,
                                                   uint32_t g_game_26630,
                                                   uint32_t g_game_26589) {
  /* 0x77134d cmp dword [esi+8],2 ; jne 0x771402 — FULL dword room
     state; 0x771357 test ecx,ecx ; je 0x771402 — g_game null;
     0x77135f cmp dword [ecx+0x26630],0 ; ja 0x771375 — UNSIGNED
     (0xffffffff OPENS); 0x771368 cmp byte [ecx+0x26589],0 ; je
     0x771402 — LOW BYTE (0x100 is FALSE). */
  if (room_8 != ISAAC_HUD_771200_ROOM_STATE_2) {
    return 0;
  }
  if (g_game == 0u) {
    return 0;
  }
  if ((uint64_t)g_game_26630 > 0u) {
    return 1;
  }
  return (g_game_26589 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771200_case_d(uint32_t id) {
  /* 0x7713e9 mov eax,[ebp+8] ; 0x7713ec cmp eax,0x168 ; 0x7713f1 je
     0x771326 ; 0x7713f7 cmp eax,0x19c ; 0x7713fc je 0x771326 — FULL
     dword id equality. */
  if (id == ISAAC_HUD_771200_ID_168) {
    return 1;
  }
  return id == ISAAC_HUD_771200_ID_19C ? 1 : 0;
}

extern "C" int32_t isaac_hud_771200_case_a(uint32_t id,
                                           uint32_t byte_edi_132,
                                           uint32_t room_8, uint32_t g_game,
                                           uint32_t g_game_26630,
                                           uint32_t g_game_26589) {
  /* 0x77139f cmp dword [ebp+8],0x139 ; jne 0x771402 — FULL dword;
     0x7713a8 cmp byte [edi+0x132],0 ; jne 0x771326 — LOW BYTE; else
     the shared room_game chain 0x7713b5..0x7713d8. */
  if (id != ISAAC_HUD_771200_ID_139) {
    return 0;
  }
  if ((byte_edi_132 & 0xffu) != 0u) {
    return 1;
  }
  return isaac_hud_771200_room_game_open(room_8, g_game, g_game_26630,
                                         g_game_26589);
}

extern "C" int32_t isaac_hud_771200_case_2(uint32_t id) {
  /* 0x771399 cmp dword [ebp+8],0x2e ; jmp 0x771320 — FULL dword. */
  return id == ISAAC_HUD_771200_ID_2E ? 1 : 0;
}

extern "C" int32_t isaac_hud_771200_case_5(uint32_t id) {
  /* 0x77138c mov eax,[ebp+8] ; 0x77138f cmp eax,0x7a ; 0x771392 je
     0x771326 ; 0x771394 cmp eax,0x75 ; jmp 0x771320 — FULL dword. */
  if (id == ISAAC_HUD_771200_ID_7A) {
    return 1;
  }
  return id == ISAAC_HUD_771200_ID_75 ? 1 : 0;
}

extern "C" int32_t isaac_hud_771200_case_6(uint32_t id) {
  /* 0x771383 cmp dword [ebp+8],0x9d ; jmp 0x771320 — FULL dword. */
  return id == ISAAC_HUD_771200_ID_9D ? 1 : 0;
}

extern "C" int32_t isaac_hud_771200_case_8(uint32_t id,
                                           uint32_t byte_edi_183,
                                           uint32_t room_8, uint32_t g_game,
                                           uint32_t g_game_26630,
                                           uint32_t g_game_26589,
                                           uint32_t g_game_26584) {
  /* 0x771331 cmp dword [ebp+8],0xd6 ; jne 0x771402 — FULL dword;
     0x77133e cmp byte [edi+0x183],0 ; jne 0x771375 — LOW BYTE; else
     the shared room_game chain 0x77134d..0x77136f; then 0x771375
     (mode != 0xb here) falls to 0x77137a cmp dword [g_game+0x26584],0
     whose flags feed 0x771320 jne 0x771402 — [g_game+0x26584] == 0
     required, FULL dword. NOTE: the byte[edi+0x183] path derefs
     g_game at 0x77137a with no null test (PE assumes non-null). */
  if (id != ISAAC_HUD_771200_ID_D6) {
    return 0;
  }
  if ((byte_edi_183 & 0xffu) == 0u &&
      isaac_hud_771200_room_game_open(room_8, g_game, g_game_26630,
                                      g_game_26589) == 0) {
    return 0;
  }
  return g_game_26584 == 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771200_case_b(uint32_t id,
                                           uint32_t byte_edi_183,
                                           uint32_t room_8, uint32_t g_game,
                                           uint32_t g_game_26630,
                                           uint32_t g_game_26589) {
  /* 0x771331 id == 0xd6 (FULL dword) ; byte[edi+0x183] LOW BYTE or
     room_game; 0x771375 cmp eax,0xb ; je 0x771326 — mode 0xb TRUEs at
     the shared gate WITHOUT the [g_game+0x26584] test. */
  if (id != ISAAC_HUD_771200_ID_D6) {
    return 0;
  }
  if ((byte_edi_183 & 0xffu) != 0u) {
    return 1;
  }
  return isaac_hud_771200_room_game_open(room_8, g_game, g_game_26630,
                                         g_game_26589);
}

extern "C" int32_t isaac_hud_771200_case_18(uint32_t id,
                                            uint32_t g_game_26584) {
  /* 0x7712fc mov eax,[0xc71678] ; 0x771301 mov eax,[eax+0x26584] —
     UNCONDITIONAL g_game deref (PE assumes non-null); 0x771307 cmp
     eax,0x25 ; je 0x771402 ; 0x771310 cmp eax,0x26 ; je 0x771402 ;
     0x771319 cmp dword [ebp+8],0x248 ; jne 0x771402 — FULL dword. */
  if (id != ISAAC_HUD_771200_ID_248) {
    return 0;
  }
  if (g_game_26584 == ISAAC_HUD_771200_GAME_26584_EXCLUDE_1) {
    return 0;
  }
  return g_game_26584 == ISAAC_HUD_771200_GAME_26584_EXCLUDE_2 ? 0 : 1;
}

extern "C" int32_t isaac_hud_771200_gate(uint32_t id, uint32_t mode,
                                         uint32_t byte_edi_132,
                                         uint32_t byte_edi_183,
                                         uint32_t room_8, uint32_t g_game,
                                         uint32_t g_game_26630,
                                         uint32_t g_game_26589,
                                         uint32_t g_game_26584) {
  /* The composed 0x771200 decision: dispatch on mode (FULL dword),
     then the per-case gate. Each case consumes exactly the samples
     the PE reads on that path. */
  switch (mode) {
    case ISAAC_HUD_771200_MODE_D:
      return isaac_hud_771200_case_d(id);
    case ISAAC_HUD_771200_MODE_A:
      return isaac_hud_771200_case_a(id, byte_edi_132, room_8, g_game,
                                     g_game_26630, g_game_26589);
    case ISAAC_HUD_771200_MODE_2:
      return isaac_hud_771200_case_2(id);
    case ISAAC_HUD_771200_MODE_5:
      return isaac_hud_771200_case_5(id);
    case ISAAC_HUD_771200_MODE_6:
      return isaac_hud_771200_case_6(id);
    case ISAAC_HUD_771200_MODE_8:
      return isaac_hud_771200_case_8(id, byte_edi_183, room_8, g_game,
                                     g_game_26630, g_game_26589,
                                     g_game_26584);
    case ISAAC_HUD_771200_MODE_B:
      return isaac_hud_771200_case_b(id, byte_edi_183, room_8, g_game,
                                     g_game_26630, g_game_26589);
    case ISAAC_HUD_771200_MODE_12:
      return isaac_hud_771200_case_18(id, g_game_26584);
    default:
      return 0;
  }
}

extern "C" int32_t isaac_hud_770ae2_open(uint32_t r_771200, uint32_t id,
                                         uint32_t r_9305f0) {
  /* 0x770aeb test al,al ; 0x770aed jne 0x770c29 — LOW BYTE of the
     0x771200 result (0x100 is CLOSED); 0x770af3 cmp ebx,0x76 — FULL
     dword; 0x770b04 test al,al ; 0x770b06 jne 0x770c29 — LOW BYTE of
     the 0x9305f0(0x76) result. FALSE falls into region C 0x770b0c. */
  if ((r_771200 & 0xffu) != 0u) {
    return 1;
  }
  if (id != ISAAC_HUD_770AE2_ID_76) {
    return 0;
  }
  return (r_9305f0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_hud_771200_va_head(void) {
  return ISAAC_HUD_771200_VA_HEAD;
}
extern "C" uint32_t isaac_hud_771200_va_find_gate(void) {
  return ISAAC_HUD_771200_VA_FIND_GATE;
}
extern "C" uint32_t isaac_hud_771200_va_find_je(void) {
  return ISAAC_HUD_771200_VA_FIND_JE;
}
extern "C" uint32_t isaac_hud_771200_va_1e50(void) {
  return ISAAC_HUD_771200_VA_1E50;
}
extern "C" uint32_t isaac_hud_771200_va_find_call(void) {
  return ISAAC_HUD_771200_VA_FIND_CALL;
}
extern "C" uint32_t isaac_hud_771200_va_rec_byte(void) {
  return ISAAC_HUD_771200_VA_REC_BYTE;
}
extern "C" uint32_t isaac_hud_771200_va_pair_cmp(void) {
  return ISAAC_HUD_771200_VA_PAIR_CMP;
}
extern "C" uint32_t isaac_hud_771200_va_sentinel(void) {
  return ISAAC_HUD_771200_VA_SENTINEL;
}
extern "C" uint32_t isaac_hud_771200_va_resolve_call(void) {
  return ISAAC_HUD_771200_VA_RESOLVE_CALL;
}
extern "C" uint32_t isaac_hud_771200_va_mode_load(void) {
  return ISAAC_HUD_771200_VA_MODE_LOAD;
}
extern "C" uint32_t isaac_hud_771200_va_dispatch(void) {
  return ISAAC_HUD_771200_VA_DISPATCH;
}
extern "C" uint32_t isaac_hud_771200_va_dispatch_jne(void) {
  return ISAAC_HUD_771200_VA_DISPATCH_JNE;
}
extern "C" uint32_t isaac_hud_771200_va_case_18(void) {
  return ISAAC_HUD_771200_VA_CASE_18;
}
extern "C" uint32_t isaac_hud_771200_va_exclude_25(void) {
  return ISAAC_HUD_771200_VA_EXCLUDE_25;
}
extern "C" uint32_t isaac_hud_771200_va_exclude_26(void) {
  return ISAAC_HUD_771200_VA_EXCLUDE_26;
}
extern "C" uint32_t isaac_hud_771200_va_cmp_248(void) {
  return ISAAC_HUD_771200_VA_CMP_248;
}
extern "C" uint32_t isaac_hud_771200_va_jne_false(void) {
  return ISAAC_HUD_771200_VA_JNE_FALSE;
}
extern "C" uint32_t isaac_hud_771200_va_true(void) {
  return ISAAC_HUD_771200_VA_TRUE;
}
extern "C" uint32_t isaac_hud_771200_va_case_8b(void) {
  return ISAAC_HUD_771200_VA_CASE_8B;
}
extern "C" uint32_t isaac_hud_771200_va_byte_183(void) {
  return ISAAC_HUD_771200_VA_BYTE_183;
}
extern "C" uint32_t isaac_hud_771200_va_room_8(void) {
  return ISAAC_HUD_771200_VA_ROOM_8;
}
extern "C" uint32_t isaac_hud_771200_va_game_null(void) {
  return ISAAC_HUD_771200_VA_GAME_NULL;
}
extern "C" uint32_t isaac_hud_771200_va_26630(void) {
  return ISAAC_HUD_771200_VA_26630;
}
extern "C" uint32_t isaac_hud_771200_va_26589(void) {
  return ISAAC_HUD_771200_VA_26589;
}
extern "C" uint32_t isaac_hud_771200_va_shared(void) {
  return ISAAC_HUD_771200_VA_SHARED;
}
extern "C" uint32_t isaac_hud_771200_va_26584(void) {
  return ISAAC_HUD_771200_VA_26584;
}
extern "C" uint32_t isaac_hud_771200_va_case_6(void) {
  return ISAAC_HUD_771200_VA_CASE_6;
}
extern "C" uint32_t isaac_hud_771200_va_case_5(void) {
  return ISAAC_HUD_771200_VA_CASE_5;
}
extern "C" uint32_t isaac_hud_771200_va_cmp_7a(void) {
  return ISAAC_HUD_771200_VA_CMP_7A;
}
extern "C" uint32_t isaac_hud_771200_va_cmp_75(void) {
  return ISAAC_HUD_771200_VA_CMP_75;
}
extern "C" uint32_t isaac_hud_771200_va_case_2(void) {
  return ISAAC_HUD_771200_VA_CASE_2;
}
extern "C" uint32_t isaac_hud_771200_va_case_a(void) {
  return ISAAC_HUD_771200_VA_CASE_A;
}
extern "C" uint32_t isaac_hud_771200_va_byte_132(void) {
  return ISAAC_HUD_771200_VA_BYTE_132;
}
extern "C" uint32_t isaac_hud_771200_va_false_de(void) {
  return ISAAC_HUD_771200_VA_FALSE_DE;
}
extern "C" uint32_t isaac_hud_771200_va_case_d(void) {
  return ISAAC_HUD_771200_VA_CASE_D;
}
extern "C" uint32_t isaac_hud_771200_va_cmp_168(void) {
  return ISAAC_HUD_771200_VA_CMP_168;
}
extern "C" uint32_t isaac_hud_771200_va_cmp_19c(void) {
  return ISAAC_HUD_771200_VA_CMP_19C;
}
extern "C" uint32_t isaac_hud_771200_va_false(void) {
  return ISAAC_HUD_771200_VA_FALSE;
}
extern "C" uint32_t isaac_hud_771200_va_ret(void) {
  return ISAAC_HUD_771200_VA_RET;
}
extern "C" uint32_t isaac_hud_771200_host_va_731ee0(void) {
  return ISAAC_HUD_771200_HOST_VA_731EE0;
}
extern "C" uint32_t isaac_hud_771200_host_va_914150(void) {
  return ISAAC_HUD_771200_HOST_VA_914150;
}
extern "C" uint32_t isaac_hud_771200_game_global(void) {
  return ISAAC_HUD_771200_GAME_GLOBAL;
}
extern "C" uint32_t isaac_hud_771200_room_global(void) {
  return ISAAC_HUD_771200_ROOM_GLOBAL;
}
extern "C" uint32_t isaac_hud_771200_player_1e50_off(void) {
  return ISAAC_HUD_771200_PLAYER_1E50_OFF;
}
extern "C" uint32_t isaac_hud_771200_player_mode_off(void) {
  return ISAAC_HUD_771200_PLAYER_MODE_OFF;
}
extern "C" uint32_t isaac_hud_771200_room_begin_off(void) {
  return ISAAC_HUD_771200_ROOM_BEGIN_OFF;
}
extern "C" uint32_t isaac_hud_771200_room_end_off(void) {
  return ISAAC_HUD_771200_ROOM_END_OFF;
}
extern "C" uint32_t isaac_hud_771200_room_container_off(void) {
  return ISAAC_HUD_771200_ROOM_CONTAINER_OFF;
}
extern "C" uint32_t isaac_hud_771200_room_state_off(void) {
  return ISAAC_HUD_771200_ROOM_STATE_OFF;
}
extern "C" uint32_t isaac_hud_771200_game_26584_off(void) {
  return ISAAC_HUD_771200_GAME_26584_OFF;
}
extern "C" uint32_t isaac_hud_771200_game_26630_off(void) {
  return ISAAC_HUD_771200_GAME_26630_OFF;
}
extern "C" uint32_t isaac_hud_771200_game_26589_off(void) {
  return ISAAC_HUD_771200_GAME_26589_OFF;
}
extern "C" uint32_t isaac_hud_771200_edi_132_off(void) {
  return ISAAC_HUD_771200_EDI_132_OFF;
}
extern "C" uint32_t isaac_hud_771200_edi_183_off(void) {
  return ISAAC_HUD_771200_EDI_183_OFF;
}
extern "C" uint32_t isaac_hud_771200_mode_d(void) {
  return ISAAC_HUD_771200_MODE_D;
}
extern "C" uint32_t isaac_hud_771200_mode_a(void) {
  return ISAAC_HUD_771200_MODE_A;
}
extern "C" uint32_t isaac_hud_771200_mode_2(void) {
  return ISAAC_HUD_771200_MODE_2;
}
extern "C" uint32_t isaac_hud_771200_mode_5(void) {
  return ISAAC_HUD_771200_MODE_5;
}
extern "C" uint32_t isaac_hud_771200_mode_6(void) {
  return ISAAC_HUD_771200_MODE_6;
}
extern "C" uint32_t isaac_hud_771200_mode_8(void) {
  return ISAAC_HUD_771200_MODE_8;
}
extern "C" uint32_t isaac_hud_771200_mode_b(void) {
  return ISAAC_HUD_771200_MODE_B;
}
extern "C" uint32_t isaac_hud_771200_mode_12(void) {
  return ISAAC_HUD_771200_MODE_12;
}
extern "C" uint32_t isaac_hud_771200_id_248(void) {
  return ISAAC_HUD_771200_ID_248;
}
extern "C" uint32_t isaac_hud_771200_id_d6(void) {
  return ISAAC_HUD_771200_ID_D6;
}
extern "C" uint32_t isaac_hud_771200_id_139(void) {
  return ISAAC_HUD_771200_ID_139;
}
extern "C" uint32_t isaac_hud_771200_id_9d(void) {
  return ISAAC_HUD_771200_ID_9D;
}
extern "C" uint32_t isaac_hud_771200_id_7a(void) {
  return ISAAC_HUD_771200_ID_7A;
}
extern "C" uint32_t isaac_hud_771200_id_75(void) {
  return ISAAC_HUD_771200_ID_75;
}
extern "C" uint32_t isaac_hud_771200_id_2e(void) {
  return ISAAC_HUD_771200_ID_2E;
}
extern "C" uint32_t isaac_hud_771200_id_168(void) {
  return ISAAC_HUD_771200_ID_168;
}
extern "C" uint32_t isaac_hud_771200_id_19c(void) {
  return ISAAC_HUD_771200_ID_19C;
}
extern "C" uint32_t isaac_hud_771200_room_state_2(void) {
  return ISAAC_HUD_771200_ROOM_STATE_2;
}
extern "C" uint32_t isaac_hud_771200_game_26584_exclude_1(void) {
  return ISAAC_HUD_771200_GAME_26584_EXCLUDE_1;
}
extern "C" uint32_t isaac_hud_771200_game_26584_exclude_2(void) {
  return ISAAC_HUD_771200_GAME_26584_EXCLUDE_2;
}
extern "C" uint32_t isaac_hud_770ae2_va_call(void) {
  return ISAAC_HUD_770AE2_VA_CALL;
}
extern "C" uint32_t isaac_hud_770ae2_va_call_771200(void) {
  return ISAAC_HUD_770AE2_VA_CALL_771200;
}
extern "C" uint32_t isaac_hud_770ae2_va_test(void) {
  return ISAAC_HUD_770AE2_VA_TEST;
}
extern "C" uint32_t isaac_hud_770ae2_va_jne_true(void) {
  return ISAAC_HUD_770AE2_VA_JNE_TRUE;
}
extern "C" uint32_t isaac_hud_770ae2_va_cmp_76(void) {
  return ISAAC_HUD_770AE2_VA_CMP_76;
}
extern "C" uint32_t isaac_hud_770ae2_va_jne_region_c(void) {
  return ISAAC_HUD_770AE2_VA_JNE_REGION_C;
}
extern "C" uint32_t isaac_hud_770ae2_va_call_9305f0(void) {
  return ISAAC_HUD_770AE2_VA_CALL_9305F0;
}
extern "C" uint32_t isaac_hud_770ae2_va_test_9305f0(void) {
  return ISAAC_HUD_770AE2_VA_TEST_9305F0;
}
extern "C" uint32_t isaac_hud_770ae2_va_jne_true2(void) {
  return ISAAC_HUD_770AE2_VA_JNE_TRUE2;
}
extern "C" uint32_t isaac_hud_770ae2_va_region_c(void) {
  return ISAAC_HUD_770AE2_VA_REGION_C;
}
extern "C" uint32_t isaac_hud_770ae2_host_va_9305f0(void) {
  return ISAAC_HUD_770AE2_HOST_VA_9305F0;
}
extern "C" uint32_t isaac_hud_770ae2_id_76(void) {
  return ISAAC_HUD_770AE2_ID_76;
}

/* ---- Entity_Player::VoidHasCollectible 0x7711a0 (EXACT ZHL) ----
   (identify-zhl-prologues.json results[8]: catalog
   third_party/REPENTOGON/libzhl/functions/EntityPlayer.zhl,
   `__thiscall bool Entity_Player::VoidHasCollectible(int id)`, 10
   pattern bytes, ret 4). The function directly BEFORE the packed true
   start 0x771200 (0x7711fd ret 4 -> 0x771200 push ebp). FULLY PURE:
   (1) 4-slot scan at player+0x1580 (stride 0x20) for 0x1dd —
   0x7711b0 cmp dword [edx],0x1dd ; je 0x7711c8, FULL dword; loop
   0x7711bf cmp eax,4 ; jb (UNSIGNED); miss -> 0x7711c1 FALSE. The
   found index only feeds the DEAD js guard 0x7711c8 test eax,eax ;
   0x7711ca js 0x7711c1 (index in [0,4) is never negative).
   (2) void-id list scan [player+0x1754..0x1758): count =
   sar(end-begin,2) — 0x7711dc; 0x7711df test edx,edx ; je FALSE
   (FULL dword gate); per elem 0x7711e6 cmp dword [eax],esi ; je
   0x7711f9 TRUE, loop 0x7711f0 cmp ecx,edx ; jb (UNSIGNED).
   result = slot_hit && count != 0 && elem_hit. All compares FULL
   dword; no uint8_t; no uint32_t masking anywhere. ---- */

extern "C" int32_t isaac_hud_7711a0_void_slot_hit(uint32_t slot_0,
                                                  uint32_t slot_1,
                                                  uint32_t slot_2,
                                                  uint32_t slot_3) {
  /* 0x7711b0 cmp dword [edx],0x1dd ; je 0x7711c8 — FULL-dword compare:
     0x101dd is NOT a match. Miss (all four) -> 0x7711c1 FALSE. */
  if (slot_0 == ISAAC_HUD_7711A0_ID_1DD) {
    return 1;
  }
  if (slot_1 == ISAAC_HUD_7711A0_ID_1DD) {
    return 1;
  }
  if (slot_2 == ISAAC_HUD_7711A0_ID_1DD) {
    return 1;
  }
  return slot_3 == ISAAC_HUD_7711A0_ID_1DD ? 1 : 0;
}

extern "C" int32_t isaac_hud_7711a0_void_list_gate(uint32_t count) {
  /* 0x7711df test edx,edx ; je 0x7711c1 — FULL-dword count gate (count
     = sar(end-begin,2) sampled from the player; 0x100 is non-zero). */
  return count != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7711a0_void_elem_hit(uint32_t elem,
                                                  uint32_t void_id) {
  /* 0x7711e6 cmp dword [eax],esi ; je 0x7711f9 — FULL-dword equality
     per vector element. */
  return elem == void_id ? 1 : 0;
}

extern "C" int32_t isaac_hud_7711a0_void_has(int32_t slot_hit,
                                             uint32_t count,
                                             int32_t elem_hit) {
  /* The composed decision chain: 0x7711b6 je (slot found) -> the list
     scan; 0x7711df je FALSE (empty list); 0x7711e8 je TRUE (elem
     match). result = slot_hit && count != 0 && elem_hit. */
  if (slot_hit == 0) {
    return 0;
  }
  if (count == 0u) {
    return 0;
  }
  return elem_hit != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_hud_7711a0_va_head(void) {
  return ISAAC_HUD_7711A0_VA_HEAD;
}
extern "C" uint32_t isaac_hud_7711a0_va_slot_scan(void) {
  return ISAAC_HUD_7711A0_VA_SLOT_SCAN;
}
extern "C" uint32_t isaac_hud_7711a0_va_slot_je(void) {
  return ISAAC_HUD_7711A0_VA_SLOT_JE;
}
extern "C" uint32_t isaac_hud_7711a0_va_slot_loop(void) {
  return ISAAC_HUD_7711A0_VA_SLOT_LOOP;
}
extern "C" uint32_t isaac_hud_7711a0_va_false(void) {
  return ISAAC_HUD_7711A0_VA_FALSE;
}
extern "C" uint32_t isaac_hud_7711a0_va_test_idx(void) {
  return ISAAC_HUD_7711A0_VA_TEST_IDX;
}
extern "C" uint32_t isaac_hud_7711a0_va_js_guard(void) {
  return ISAAC_HUD_7711A0_VA_JS_GUARD;
}
extern "C" uint32_t isaac_hud_7711a0_va_count_sar(void) {
  return ISAAC_HUD_7711A0_VA_COUNT_SAR;
}
extern "C" uint32_t isaac_hud_7711a0_va_count_gate(void) {
  return ISAAC_HUD_7711A0_VA_COUNT_GATE;
}
extern "C" uint32_t isaac_hud_7711a0_va_elem_cmp(void) {
  return ISAAC_HUD_7711A0_VA_ELEM_CMP;
}
extern "C" uint32_t isaac_hud_7711a0_va_elem_je(void) {
  return ISAAC_HUD_7711A0_VA_ELEM_JE;
}
extern "C" uint32_t isaac_hud_7711a0_va_elem_loop(void) {
  return ISAAC_HUD_7711A0_VA_ELEM_LOOP;
}
extern "C" uint32_t isaac_hud_7711a0_va_true(void) {
  return ISAAC_HUD_7711A0_VA_TRUE;
}
extern "C" uint32_t isaac_hud_7711a0_va_ret(void) {
  return ISAAC_HUD_7711A0_VA_RET;
}
extern "C" uint32_t isaac_hud_7711a0_id_1dd(void) {
  return ISAAC_HUD_7711A0_ID_1DD;
}
extern "C" uint32_t isaac_hud_7711a0_slot_count(void) {
  return ISAAC_HUD_7711A0_SLOT_COUNT;
}
extern "C" uint32_t isaac_hud_7711a0_slot_stride(void) {
  return ISAAC_HUD_7711A0_SLOT_STRIDE;
}
extern "C" uint32_t isaac_hud_7711a0_slots_off(void) {
  return ISAAC_HUD_7711A0_SLOTS_OFF;
}
extern "C" uint32_t isaac_hud_7711a0_list_begin_off(void) {
  return ISAAC_HUD_7711A0_LIST_BEGIN_OFF;
}
extern "C" uint32_t isaac_hud_7711a0_list_end_off(void) {
  return ISAAC_HUD_7711A0_LIST_END_OFF;
}

/* ---- Helpers ABI v29: the 0x771410 id-walk loop ----
   (notes hud-v29-771410/NOTES.md; cpu-dump/00771410.txt +
   0077153f.txt). PACKED TRUE START (0x77140d..0x77140f int3 pads),
   0x00771410..0x00771545 ret 0, this = player. The 0x2dd walk:
   per-iteration r1 = 0x771200(player, id, dead-flag) is a HOST
   sample; LOW(r1) selects PATH A (edition arm: [g_game+0x26584] !=
   0x2b FULL dword; 0x733ff0 edge iff id == 0x1e4 FULL dword; THE one
   observable store iff id UNSIGNED < [g_game+0x1a740+0x688]:
   *([g_game+0x1a740+0x67c] + (id>>5)*4) |= 1 << (id & 0x1f); then
   ALWAYS the room fire: sar(end-begin,2) with begin/end =
   [room+0x2a404]/[0x2a408], 0x75d1d0 edge iff (int32)id <
   (int32)room_count (SIGNED jge) && elem = begin[id] != 0 FULL
   dword) vs PATH B (0x7706e0 edge ALWAYS — the second 0x771200 call
   at 0x7714ac is effect-DEAD; LOW(r3)/LOW(r4) byte gates skip;
   0x72fd10 edge; 0x75d850 edge iff r5 != 0 FULL dword). Walk bound
   cmp esi,0x2dd ; jl — SIGNED (wasm32 compare-flip class: i64
   sign-extend form). Tail: mode == 5 FULL dword -> 0x75d850 edge
   with arg = (int32)((end-begin) & 0xfffffffc) > 0x1e8 (SIGNED jg)
   ? dword[begin+0x1e8] (sample) : 0. All gates uint32_t; byte gates
   mask & 0xff. ---- */

extern "C" int32_t isaac_hud_771410_walk_continue(uint32_t id) {
  /* 0x7714ee cmp esi,0x2dd ; 0x7714f4 jl 0x771420 — SIGNED: the i64
     sign-extend form (int64_t)(int32_t)id < 0x2dd (wasm32
     compare-flip class; id 0xffffffff = -1 CONTINUES). */
  return (int64_t)(int32_t)id < (int64_t)ISAAC_HUD_771410_WALK_BOUND
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_771410_path_a_open(uint32_t r_771200) {
  /* 0x771429 test al,al ; 0x77142b je 0x7714a8 — LOW BYTE of the
     0x771200 result (0x100 is CLOSED). */
  return (r_771200 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_edition_gate(uint32_t g_game_26584) {
  /* 0x771432 cmp dword [eax+0x26584],0x2b ; 0x77143f je 0x77147b —
     FULL dword: 0x12b == 0x2b IS the skip state. */
  return g_game_26584 != ISAAC_HUD_771410_EDITION_SKIP ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_challenge_gate(uint32_t id) {
  /* 0x771441 cmp esi,0x1e4 ; 0x771447 jne 0x771459 — FULL dword.
     Open -> host 0x733ff0(g_game+0x1a740, 0x126, 0, 0). */
  return id == ISAAC_HUD_771410_CHALLENGE_ID ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_bit_set_open(uint32_t g_game_26584,
                                                 uint32_t id,
                                                 uint32_t bitset_count) {
  /* 0x771459 cmp esi,[ebx+0x688] ; 0x77145f jae 0x77147b — UNSIGNED
     id < bitset_count; the arm is entered only when the edition gate
     is open (0x77143f je skips it when 26584 == 0x2b). */
  if (isaac_hud_771410_edition_gate(g_game_26584) == 0) {
    return 0;
  }
  return id < bitset_count ? 1 : 0;
}

extern "C" uint32_t isaac_hud_771410_bit_word(uint32_t bits_word,
                                              uint32_t id) {
  /* 0x77146f mov ecx,esi ; 0x771473 and ecx,0x1f ; 0x771476 bts
     eax,ecx — bit index masked to [0,31], FULL-dword word value. */
  return bits_word | (1u << (id & ISAAC_HUD_771410_BIT_MASK));
}

extern "C" uint32_t isaac_hud_771410_bit_addr(uint32_t bits_ptr,
                                              uint32_t id) {
  /* 0x771469 shr ecx,5 ; 0x77146c lea edx,[eax+ecx*4] — word index
     id >> 5, dword stride 4; full 32-bit wrap. */
  return bits_ptr + (id >> ISAAC_HUD_771410_WORD_SHIFT) *
                        ISAAC_HUD_771410_WORD_STRIDE;
}

extern "C" uint32_t isaac_hud_771410_room_count_sar(uint32_t begin,
                                                    uint32_t end) {
  /* 0x77148c sub eax,ecx ; 0x77148e sar eax,2 — ARITHMETIC shift of
     the 32-bit span (negative spans stay negative). */
  return (uint32_t)((int32_t)(end - begin) >> 2);
}

extern "C" int32_t isaac_hud_771410_room_fire_open(uint32_t room_count,
                                                   uint32_t id) {
  /* 0x771491 cmp esi,eax ; 0x771493 jge 0x7714ed — SIGNED: the i64
     sign-extend form (int64_t)(int32_t)id < (int64_t)(int32_t)
     room_count (wasm32 compare-flip class). */
  return (int64_t)(int32_t)id < (int64_t)(int32_t)room_count ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_elem_fire_open(uint32_t elem) {
  /* 0x771498 test eax,eax ; 0x77149a je 0x7714ed — FULL dword:
     0x100 is non-zero. Open -> host 0x75d1d0(player, elem, 0). */
  return elem != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_hc_skip_open(uint32_t r_7706e0) {
  /* 0x7714bb test al,al ; 0x7714bd jne 0x7714ed — LOW BYTE of the
     0x7706e0 result (0x100 is CLOSED). */
  return (r_7706e0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_trinket_skip_open(uint32_t r_9305f0) {
  /* 0x7714cb test al,al ; 0x7714cd jne 0x7714ed — LOW BYTE of the
     0x9305f0 result (0x100 is CLOSED). */
  return (r_9305f0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_list_fire_open(uint32_t r_72fd10) {
  /* 0x7714e1 test eax,eax ; 0x7714e3 je 0x7714ed — FULL dword:
     0x100 fires. Open -> host 0x75d850(player, r5). */
  return r_72fd10 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_tail_fire(uint32_t mode) {
  /* 0x7714fa cmp dword [edi+0x13c0],5 ; 0x771501 jne 0x77153f —
     FULL dword: mode 0x105 != 5. */
  return mode == ISAAC_HUD_771410_TAIL_MODE ? 1 : 0;
}

extern "C" int32_t isaac_hud_771410_tail_large_gate(uint32_t begin,
                                                    uint32_t end) {
  /* 0x771516 and eax,0xfffffffc ; 0x771519 cmp eax,0x1e8 ;
     0x77151e jg 0x771531 — SIGNED on the MASKED span: (int64_t)
     (int32_t)((end-begin) & 0xfffffffc) > 0x1e8 (wasm32
     compare-flip class; span 0x1e9 masks to 0x1e8 -> CLOSED). */
  const uint32_t masked = (end - begin) & ISAAC_HUD_771410_SPAN_MASK;
  return (int64_t)(int32_t)masked > (int64_t)ISAAC_HUD_771410_TAIL_THRESHOLD
             ? 1
             : 0;
}

extern "C" uint32_t isaac_hud_771410_tail_arg(uint32_t begin_1e8,
                                              uint32_t begin,
                                              uint32_t end) {
  /* 0x771520 xor eax,eax (small path -> arg 0) vs 0x771531 mov
     eax,[ecx+0x1e8] (large path -> dword[begin+0x1e8] sample). */
  return isaac_hud_771410_tail_large_gate(begin, end) != 0
             ? (uint32_t)begin_1e8
             : 0u;
}

extern "C" int32_t isaac_hud_771410_iter_mask(uint32_t id,
                                              uint32_t r_771200,
                                              uint32_t g_game_26584,
                                              uint32_t bitset_count,
                                              uint32_t room_count,
                                              uint32_t elem,
                                              uint32_t r_7706e0,
                                              uint32_t r_9305f0,
                                              uint32_t r_72fd10) {
  /* The composed per-iteration dispatch (machine order, 0x771420..):
     PATH A (LOW(r1) open): edition arm -> 0x733ff0 edge iff id ==
     0x1e4; bit-set store iff id < bitset_count (UNSIGNED); then the
     room fire (path A ONLY): 0x75d1d0 edge iff (int32)id <
     (int32)room_count && elem != 0. PATH B: 0x7706e0 edge ALWAYS,
     then LOW(r3)/LOW(r4) byte skips, 0x72fd10 edge, 0x75d850 edge
     iff r5 != 0. The dead r2 0x771200 call (0x7714ac) has NO effect
     and is NOT in the mask. */
  int32_t mask = 0;
  if (isaac_hud_771410_path_a_open(r_771200) != 0) {
    if (isaac_hud_771410_edition_gate(g_game_26584) != 0) {
      if (isaac_hud_771410_challenge_gate(id) != 0) {
        mask |= ISAAC_HUD_771410_MASK_HOST_733FF0;
      }
      if (id < bitset_count) {
        mask |= ISAAC_HUD_771410_MASK_BIT_STORE;
      }
    }
    if (isaac_hud_771410_room_fire_open(room_count, id) != 0 &&
        isaac_hud_771410_elem_fire_open(elem) != 0) {
      mask |= ISAAC_HUD_771410_MASK_HOST_75D1D0;
    }
  } else {
    mask |= ISAAC_HUD_771410_MASK_HOST_7706E0;
    if (isaac_hud_771410_hc_skip_open(r_7706e0) == 0) {
      mask |= ISAAC_HUD_771410_MASK_HOST_9305F0;
      if (isaac_hud_771410_trinket_skip_open(r_9305f0) == 0) {
        mask |= ISAAC_HUD_771410_MASK_HOST_72FD10;
        if (isaac_hud_771410_list_fire_open(r_72fd10) != 0) {
          mask |= ISAAC_HUD_771410_MASK_HOST_75D850;
        }
      }
    }
  }
  return mask;
}

extern "C" uint32_t isaac_hud_771410_span_masked(uint32_t begin,
                                                 uint32_t end) {
  /* 0x771514 sub eax,ecx ; 0x771516 and eax,0xfffffffc — the tail
     span mask (keeps the sign of negative spans). */
  return (end - begin) & ISAAC_HUD_771410_SPAN_MASK;
}

extern "C" uint32_t isaac_hud_771410_va_head(void) {
  return ISAAC_HUD_771410_VA_HEAD;
}
extern "C" uint32_t isaac_hud_771410_va_loop_head(void) {
  return ISAAC_HUD_771410_VA_LOOP_HEAD;
}
extern "C" uint32_t isaac_hud_771410_va_call_771200(void) {
  return ISAAC_HUD_771410_VA_CALL_771200;
}
extern "C" uint32_t isaac_hud_771410_va_test_al(void) {
  return ISAAC_HUD_771410_VA_TEST_AL;
}
extern "C" uint32_t isaac_hud_771410_va_je_path_b(void) {
  return ISAAC_HUD_771410_VA_JE_PATH_B;
}
extern "C" uint32_t isaac_hud_771410_va_edition_cmp(void) {
  return ISAAC_HUD_771410_VA_EDITION_CMP;
}
extern "C" uint32_t isaac_hud_771410_va_edition_je(void) {
  return ISAAC_HUD_771410_VA_EDITION_JE;
}
extern "C" uint32_t isaac_hud_771410_va_challenge_cmp(void) {
  return ISAAC_HUD_771410_VA_CHALLENGE_CMP;
}
extern "C" uint32_t isaac_hud_771410_va_challenge_jne(void) {
  return ISAAC_HUD_771410_VA_CHALLENGE_JNE;
}
extern "C" uint32_t isaac_hud_771410_va_call_733ff0(void) {
  return ISAAC_HUD_771410_VA_CALL_733FF0;
}
extern "C" uint32_t isaac_hud_771410_va_bit_bound_cmp(void) {
  return ISAAC_HUD_771410_VA_BIT_BOUND_CMP;
}
extern "C" uint32_t isaac_hud_771410_va_bit_bound_jae(void) {
  return ISAAC_HUD_771410_VA_BIT_BOUND_JAE;
}
extern "C" uint32_t isaac_hud_771410_va_word_shr(void) {
  return ISAAC_HUD_771410_VA_WORD_SHR;
}
extern "C" uint32_t isaac_hud_771410_va_word_lea(void) {
  return ISAAC_HUD_771410_VA_WORD_LEA;
}
extern "C" uint32_t isaac_hud_771410_va_bit_and(void) {
  return ISAAC_HUD_771410_VA_BIT_AND;
}
extern "C" uint32_t isaac_hud_771410_va_bts(void) {
  return ISAAC_HUD_771410_VA_BTS;
}
extern "C" uint32_t isaac_hud_771410_va_bit_store(void) {
  return ISAAC_HUD_771410_VA_BIT_STORE;
}
extern "C" uint32_t isaac_hud_771410_va_room_load(void) {
  return ISAAC_HUD_771410_VA_ROOM_LOAD;
}
extern "C" uint32_t isaac_hud_771410_va_room_sar(void) {
  return ISAAC_HUD_771410_VA_ROOM_SAR;
}
extern "C" uint32_t isaac_hud_771410_va_room_jge(void) {
  return ISAAC_HUD_771410_VA_ROOM_JGE;
}
extern "C" uint32_t isaac_hud_771410_va_elem_load(void) {
  return ISAAC_HUD_771410_VA_ELEM_LOAD;
}
extern "C" uint32_t isaac_hud_771410_va_elem_test(void) {
  return ISAAC_HUD_771410_VA_ELEM_TEST;
}
extern "C" uint32_t isaac_hud_771410_va_elem_je(void) {
  return ISAAC_HUD_771410_VA_ELEM_JE;
}
extern "C" uint32_t isaac_hud_771410_va_call_75d1d0(void) {
  return ISAAC_HUD_771410_VA_CALL_75D1D0;
}
extern "C" uint32_t isaac_hud_771410_va_path_b(void) {
  return ISAAC_HUD_771410_VA_PATH_B;
}
extern "C" uint32_t isaac_hud_771410_va_dead_call_771200(void) {
  return ISAAC_HUD_771410_VA_DEAD_CALL_771200;
}
extern "C" uint32_t isaac_hud_771410_va_call_7706e0(void) {
  return ISAAC_HUD_771410_VA_CALL_7706E0;
}
extern "C" uint32_t isaac_hud_771410_va_hc_test(void) {
  return ISAAC_HUD_771410_VA_HC_TEST;
}
extern "C" uint32_t isaac_hud_771410_va_hc_jne(void) {
  return ISAAC_HUD_771410_VA_HC_JNE;
}
extern "C" uint32_t isaac_hud_771410_va_call_9305f0(void) {
  return ISAAC_HUD_771410_VA_CALL_9305F0;
}
extern "C" uint32_t isaac_hud_771410_va_trinket_test(void) {
  return ISAAC_HUD_771410_VA_TRINKET_TEST;
}
extern "C" uint32_t isaac_hud_771410_va_trinket_jne(void) {
  return ISAAC_HUD_771410_VA_TRINKET_JNE;
}
extern "C" uint32_t isaac_hud_771410_va_call_72fd10(void) {
  return ISAAC_HUD_771410_VA_CALL_72FD10;
}
extern "C" uint32_t isaac_hud_771410_va_list_test(void) {
  return ISAAC_HUD_771410_VA_LIST_TEST;
}
extern "C" uint32_t isaac_hud_771410_va_list_je(void) {
  return ISAAC_HUD_771410_VA_LIST_JE;
}
extern "C" uint32_t isaac_hud_771410_va_call_75d850(void) {
  return ISAAC_HUD_771410_VA_CALL_75D850;
}
extern "C" uint32_t isaac_hud_771410_va_inc(void) {
  return ISAAC_HUD_771410_VA_INC;
}
extern "C" uint32_t isaac_hud_771410_va_bound_cmp(void) {
  return ISAAC_HUD_771410_VA_BOUND_CMP;
}
extern "C" uint32_t isaac_hud_771410_va_bound_jl(void) {
  return ISAAC_HUD_771410_VA_BOUND_JL;
}
extern "C" uint32_t isaac_hud_771410_va_tail_mode_cmp(void) {
  return ISAAC_HUD_771410_VA_TAIL_MODE_CMP;
}
extern "C" uint32_t isaac_hud_771410_va_tail_mode_jne(void) {
  return ISAAC_HUD_771410_VA_TAIL_MODE_JNE;
}
extern "C" uint32_t isaac_hud_771410_va_span_mask(void) {
  return ISAAC_HUD_771410_VA_SPAN_MASK;
}
extern "C" uint32_t isaac_hud_771410_va_tail_cmp(void) {
  return ISAAC_HUD_771410_VA_TAIL_CMP;
}
extern "C" uint32_t isaac_hud_771410_va_tail_jg(void) {
  return ISAAC_HUD_771410_VA_TAIL_JG;
}
extern "C" uint32_t isaac_hud_771410_va_tail_xor(void) {
  return ISAAC_HUD_771410_VA_TAIL_XOR;
}
extern "C" uint32_t isaac_hud_771410_va_tail_call_0(void) {
  return ISAAC_HUD_771410_VA_TAIL_CALL_0;
}
extern "C" uint32_t isaac_hud_771410_va_tail_ret(void) {
  return ISAAC_HUD_771410_VA_TAIL_RET;
}
extern "C" uint32_t isaac_hud_771410_va_tail_arg_load(void) {
  return ISAAC_HUD_771410_VA_TAIL_ARG_LOAD;
}
extern "C" uint32_t isaac_hud_771410_va_tail_call_arg(void) {
  return ISAAC_HUD_771410_VA_TAIL_CALL_ARG;
}
extern "C" uint32_t isaac_hud_771410_va_ret(void) {
  return ISAAC_HUD_771410_VA_RET;
}
extern "C" uint32_t isaac_hud_771410_host_va_733ff0(void) {
  return ISAAC_HUD_771410_HOST_VA_733FF0;
}
extern "C" uint32_t isaac_hud_771410_host_va_75d1d0(void) {
  return ISAAC_HUD_771410_HOST_VA_75D1D0;
}
extern "C" uint32_t isaac_hud_771410_host_va_75d850(void) {
  return ISAAC_HUD_771410_HOST_VA_75D850;
}
extern "C" uint32_t isaac_hud_771410_host_va_9305f0(void) {
  return ISAAC_HUD_771410_HOST_VA_9305F0;
}
extern "C" uint32_t isaac_hud_771410_host_va_72fd10(void) {
  return ISAAC_HUD_771410_HOST_VA_72FD10;
}
extern "C" uint32_t isaac_hud_771410_host_va_7706e0(void) {
  return ISAAC_HUD_771410_HOST_VA_7706E0;
}
extern "C" uint32_t isaac_hud_771410_host_va_771200(void) {
  return ISAAC_HUD_771410_HOST_VA_771200;
}
extern "C" uint32_t isaac_hud_771410_game_global(void) {
  return ISAAC_HUD_771410_GAME_GLOBAL;
}
extern "C" uint32_t isaac_hud_771410_room_global(void) {
  return ISAAC_HUD_771410_ROOM_GLOBAL;
}
extern "C" uint32_t isaac_hud_771410_player_mode_off(void) {
  return ISAAC_HUD_771410_PLAYER_MODE_OFF;
}
extern "C" uint32_t isaac_hud_771410_player_trinket_recv_off(void) {
  return ISAAC_HUD_771410_PLAYER_TRINKET_RECV_OFF;
}
extern "C" uint32_t isaac_hud_771410_room_begin_off(void) {
  return ISAAC_HUD_771410_ROOM_BEGIN_OFF;
}
extern "C" uint32_t isaac_hud_771410_room_end_off(void) {
  return ISAAC_HUD_771410_ROOM_END_OFF;
}
extern "C" uint32_t isaac_hud_771410_game_26584_off(void) {
  return ISAAC_HUD_771410_GAME_26584_OFF;
}
extern "C" uint32_t isaac_hud_771410_bitset_base_off(void) {
  return ISAAC_HUD_771410_BITSET_BASE_OFF;
}
extern "C" uint32_t isaac_hud_771410_bitset_count_off(void) {
  return ISAAC_HUD_771410_BITSET_COUNT_OFF;
}
extern "C" uint32_t isaac_hud_771410_bitset_ptr_off(void) {
  return ISAAC_HUD_771410_BITSET_PTR_OFF;
}
extern "C" uint32_t isaac_hud_771410_begin_1e8_off(void) {
  return ISAAC_HUD_771410_BEGIN_1E8_OFF;
}
extern "C" uint32_t isaac_hud_771410_walk_bound(void) {
  return ISAAC_HUD_771410_WALK_BOUND;
}
extern "C" uint32_t isaac_hud_771410_challenge_id(void) {
  return ISAAC_HUD_771410_CHALLENGE_ID;
}
extern "C" uint32_t isaac_hud_771410_challenge_arg(void) {
  return ISAAC_HUD_771410_CHALLENGE_ARG;
}
extern "C" uint32_t isaac_hud_771410_edition_skip(void) {
  return ISAAC_HUD_771410_EDITION_SKIP;
}
extern "C" uint32_t isaac_hud_771410_tail_threshold(void) {
  return ISAAC_HUD_771410_TAIL_THRESHOLD;
}
extern "C" uint32_t isaac_hud_771410_tail_mode(void) {
  return ISAAC_HUD_771410_TAIL_MODE;
}
extern "C" uint32_t isaac_hud_771410_bit_mask(void) {
  return ISAAC_HUD_771410_BIT_MASK;
}
extern "C" uint32_t isaac_hud_771410_span_mask(void) {
  return ISAAC_HUD_771410_SPAN_MASK;
}
extern "C" uint32_t isaac_hud_771410_word_shift(void) {
  return ISAAC_HUD_771410_WORD_SHIFT;
}
extern "C" uint32_t isaac_hud_771410_word_stride(void) {
  return ISAAC_HUD_771410_WORD_STRIDE;
}
extern "C" uint32_t isaac_hud_771410_mask_bit_store(void) {
  return ISAAC_HUD_771410_MASK_BIT_STORE;
}
extern "C" uint32_t isaac_hud_771410_mask_host_733ff0(void) {
  return ISAAC_HUD_771410_MASK_HOST_733FF0;
}
extern "C" uint32_t isaac_hud_771410_mask_host_75d1d0(void) {
  return ISAAC_HUD_771410_MASK_HOST_75D1D0;
}
extern "C" uint32_t isaac_hud_771410_mask_host_7706e0(void) {
  return ISAAC_HUD_771410_MASK_HOST_7706E0;
}
extern "C" uint32_t isaac_hud_771410_mask_host_9305f0(void) {
  return ISAAC_HUD_771410_MASK_HOST_9305F0;
}
extern "C" uint32_t isaac_hud_771410_mask_host_72fd10(void) {
  return ISAAC_HUD_771410_MASK_HOST_72FD10;
}
extern "C" uint32_t isaac_hud_771410_mask_host_75d850(void) {
  return ISAAC_HUD_771410_MASK_HOST_75D850;
}
/* ---- Helpers ABI v30: HasCollectible 0x007706e0 branch selection ----
   Evidence: section-notes/hud-v30-76arm/NOTES.md + disasm-7706e0-
   full.txt (0x007706e0..0x00770c92). All byte gates uint32_t + 0xff
   (0x100 CLOSED); no uint8_t params. */

extern "C" int32_t isaac_hud_7706e0_interior_false(uint32_t byte_20a9,
                                                   uint32_t game_26614,
                                                   uint32_t cfg_b8) {
  /* 0x77076f cmp byte [edi+0x20a9],0 ; je skip — LOW BYTE;
     0x77077d cmp dword [g+0x26614],2 ; 0x770784 jge skip — SIGNED
     (i64 sign-extend form); 0x77078c and eax,0x8000 ; je FALSE. */
  if ((byte_20a9 & 0xffu) == 0u) {
    return 0;
  }
  if ((int64_t)(int32_t)game_26614 >= (int64_t)ISAAC_HUD_7706E0_26614_THRESHOLD) {
    return 0;
  }
  return (cfg_b8 & ISAAC_HUD_7706E0_CFG_B8_BIT) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_held_true(uint32_t held_id, uint32_t id,
                                              uint32_t held_flag) {
  /* 0x77079c test eax,eax (FULL) ; 0x7707a0 cmp ebx,eax (FULL) ;
     0x7707a4 cmp byte [edi+0x2ef0],0 ; jne TRUE — LOW BYTE. */
  if (held_id == 0u || id != held_id) {
    return 0;
  }
  return (held_flag & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_id_negative(uint32_t id) {
  /* 0x7707b1 test ebx,ebx ; 0x7707b3 jns 0x7707d4 — SIGNED
     (wasm32 compare-flip class: (int64_t)(int32_t)id < 0). */
  return (int64_t)(int32_t)id < 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_trinket_return(uint32_t r_9e04b0) {
  /* 0x7707bc call 0x9e04b0 ; 0x7707c1 epilogue: al = result LOW byte
     (mov al,al passthrough — the PE returns the host's own byte). */
  return (r_9e04b0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_flag_epilogue(uint32_t flag) {
  /* 0x7707d4 cmp byte [ebp+0xc],0 ; 0x7707d8 jne 0x770c3e — LOW BYTE
     of the flag param (the ONLY read of param_3 in the body). */
  return (flag & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_arm_147148_open(uint32_t id) {
  /* 0x7707de cmp ebx,0x147 ; je ; 0x7707e6 cmp ebx,0x148 ; jne — FULL
     dword ids. */
  return (id == ISAAC_HUD_7706E0_ID_147 || id == ISAAC_HUD_7706E0_ID_148)
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_7706e0_mod4(uint32_t game_264f8) {
  /* 0x770808 and eax,0x80000003 ; 0x77080d jns skip ; 0x77080f dec ;
     0x770810 or eax,0xfffffffc ; 0x770813 inc — C-style SIGNED
     remainder of the masked value (value -3..3). */
  return (int32_t)(game_264f8 & ISAAC_HUD_7706E0_264F8_MOD_MASK) % 4;
}

extern "C" int32_t isaac_hud_7706e0_arm_147148_hit(uint32_t id,
                                                   uint32_t r_771550,
                                                   int32_t mod4,
                                                   uint32_t count) {
  /* 0x7707f9 test al,al ; je 0x77085c — LOW BYTE of the 0x771550(0x15)
     result. 0x770820 cmp eax,1 ; 0x770826 jle 0x77083f — count vs 1
     SIGNED. n <= 1: mod == 0 -> id 0x147 (0x770831 je TRUE), mod == 1
     -> id 0x148 (0x770850 je TRUE), else miss. n > 1: mod in {0,1}
     -> id 0x147 (0x770831) OR id 0x148 (0x770850) (0x770828 test /
     0x77082c cmp eax,1). */
  if ((r_771550 & 0xffu) == 0u) {
    return 0;
  }
  if ((int64_t)(int32_t)count <= (int64_t)ISAAC_HUD_7706E0_COUNT_LE1) {
    if (mod4 == 0) {
      return id == ISAAC_HUD_7706E0_ID_147 ? 1 : 0;
    }
    if (mod4 == 1) {
      return id == ISAAC_HUD_7706E0_ID_148 ? 1 : 0;
    }
    return 0;
  }
  if (mod4 != 0 && mod4 != 1) {
    return 0;
  }
  return (id == ISAAC_HUD_7706E0_ID_147 || id == ISAAC_HUD_7706E0_ID_148)
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_7706e0_arm_139_open(uint32_t id) {
  /* 0x77085c cmp ebx,0x139 ; jne 0x770915 — FULL dword. */
  return id == ISAAC_HUD_7706E0_ID_139 ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_139_mode_gate(uint32_t mode,
                                                  uint32_t r_930680) {
  /* 0x770868 cmp dword [edi+0x13c0],0xa ; je 0x770893 — FULL dword;
     0x77087e test al,al — LOW BYTE of the 0x930680(&player[0x1508],
     0x70) result; 0x770886 cmp dword,0x1f ; je CHAIN — FULL dword.
     Machine order: mode == 0xa enters WITHOUT the 0x930680 edge. */
  if (mode == ISAAC_HUD_7706E0_MODE_A) {
    return 1;
  }
  if ((r_930680 & 0xffu) == 0u) {
    return 0;
  }
  return mode != ISAAC_HUD_7706E0_MODE_1F ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_139_byte132(uint32_t byte_132) {
  /* 0x7708d3 cmp byte [ecx+0x132],0 ; 0x7708da jne 0x770c29 — LOW
     BYTE of byte[v+0x132] (v = resolved or &room[0x14], cmovne). */
  return (byte_132 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_room_game_true(uint32_t room_8,
                                                   uint32_t g_game,
                                                   uint32_t g_game_26630,
                                                   uint32_t g_game_26589) {
  /* The v28-G2 SHARED room-game gate (0x7708e0..0x770910; identical
     shape to 0x77134d..0x77136f): room+8 == 2 FULL ; g_game != 0
     FULL ; (u32)26630 > 0 (ja 0x770903 — genuine-UNSIGNED) ||
     byte 26589 != 0 (LOW; jmp 0x770a3e shared jne TRUE). */
  if (room_8 != ISAAC_HUD_7706E0_ROOM_8_EQ || g_game == 0u) {
    return 0;
  }
  if ((uint64_t)g_game_26630 > 0u) {
    return 1;
  }
  return (g_game_26589 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_arm_3b_open(uint32_t id,
                                                uint32_t r_7da770) {
  /* 0x770994 cmp ebx,0x3b ; jne — FULL dword; 0x7709a0 test al,al ;
     je 0x770a44 — LOW BYTE of the 0x7da770(player) result. */
  if (id != ISAAC_HUD_7706E0_ID_3B) {
    return 0;
  }
  return (r_7da770 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7706e0_arm_bit_open(uint32_t id,
                                                 uint32_t byte_2028) {
  /* 0x7709c5/0x7709eb/0x770a11/0x770a37 test byte [edi+0x2028],imm —
     LOW BYTE of the field + imm masks (0x10/8/0x20/0x40); id compares
     FULL dword; the 0xb6 test shares the 0x770a3e jne TRUE target. */
  if (id == ISAAC_HUD_7706E0_ID_131) {
    return (byte_2028 & ISAAC_HUD_7706E0_2028_BIT_131) != 0u ? 1 : 0;
  }
  if (id == ISAAC_HUD_7706E0_ID_101) {
    return (byte_2028 & ISAAC_HUD_7706E0_2028_BIT_101) != 0u ? 1 : 0;
  }
  if (id == ISAAC_HUD_7706E0_ID_E7) {
    return (byte_2028 & ISAAC_HUD_7706E0_2028_BIT_E7) != 0u ? 1 : 0;
  }
  if (id == ISAAC_HUD_7706E0_ID_B6) {
    return (byte_2028 & ISAAC_HUD_7706E0_2028_BIT_B6) != 0u ? 1 : 0;
  }
  return 0;
}

extern "C" int32_t isaac_hud_7706e0_14a99_gate(uint32_t id,
                                               uint32_t r_7db8d0) {
  /* 0x770a53 cmp eax,1 ; jne 0x770a7e — FULL dword (the 0x14a hit
     returns the host LOW byte via mov al,al == 1); 0x770a75 cmp
     eax,2 ; je 0x770c29 — FULL dword (the 0x99 hit). */
  if (id == ISAAC_HUD_7706E0_ID_14A) {
    return r_7db8d0 == ISAAC_HUD_7706E0_7DB8D0_EQ_1 ? 1 : 0;
  }
  if (id == ISAAC_HUD_7706E0_ID_99) {
    return r_7db8d0 == ISAAC_HUD_7706E0_7DB8D0_EQ_2 ? 1 : 0;
  }
  return 0;
}

extern "C" int32_t isaac_hud_7706e0_arm_76_open(uint32_t r_9305f0) {
  /* 0x770b04 test al,al ; 0x770b06 jne 0x770c29 — LOW BYTE of the
     0x9305f0(&player[0x1508], 0x76) result (0x100 is CLOSED). The
     arm runs only when r_771200 LOW == 0 && id == 0x76 (v28 gate). */
  return (r_9305f0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_hud_7706e0_branch_plan(
    uint32_t id,
    uint32_t flag,
    uint32_t cfg_b8,
    uint32_t byte_20a9,
    uint32_t game_26614,
    uint32_t held_id,
    uint32_t held_flag,
    uint32_t r_9e04b0,
    uint32_t r_771550_15,
    uint32_t game_264f8,
    uint32_t count_7cb6e0,
    uint32_t mode,
    uint32_t r_930680,
    uint32_t byte_132,
    uint32_t room_begin,
    uint32_t room_end,
    uint32_t room_8,
    uint32_t g_game,
    uint32_t g_game_26630,
    uint32_t g_game_26589,
    uint32_t r_7da770,
    uint32_t byte_2028,
    uint32_t r_7db8d0,
    uint32_t count_a,
    uint32_t count_b,
    uint32_t extra,
    uint32_t r_771550_5d,
    uint32_t p18300_4,
    uint32_t p18300_4_58,
    uint32_t r_771200,
    uint32_t r_9305f0_76,
    IsaacHud7706e0BranchPlan* out) {
  /* Composed parent branch selection, strict machine order
     (0x77076f..0x770b06; REGION_C = the v27 sub-plan's step).
     Reuses the v25 770915 arm (own 0x771550(0x5d) call + RNG) and
     the v25 770a7e ladder (0x7db860 x2 + 0x436140; RNG is lawed
     in-module, not a host edge) + the v28 770ae2 tail gate. */
  int32_t interior_false = isaac_hud_7706e0_interior_false(
      byte_20a9, game_26614, cfg_b8);
  int32_t held_true =
      isaac_hud_7706e0_held_true(held_id, id, held_flag);
  int32_t id_negative = isaac_hud_7706e0_id_negative(id);
  int32_t flag_epilogue = isaac_hud_7706e0_flag_epilogue(flag);
  int32_t arm_147148_open = isaac_hud_7706e0_arm_147148_open(id);
  int32_t mod4 = isaac_hud_7706e0_mod4(game_264f8);
  int32_t arm_139 = isaac_hud_7706e0_arm_139_open(id);
  int32_t arm_3b = isaac_hud_7706e0_arm_3b_open(id, r_7da770);
  int32_t arm_bits = isaac_hud_7706e0_arm_bit_open(id, byte_2028);
  int32_t arm_14a99 = isaac_hud_7706e0_14a99_gate(id, r_7db8d0);
  int32_t ladder_open = isaac_hud_770a7e_open(count_a);
  int32_t tail_gate = isaac_hud_770ae2_open(r_771200, id, r_9305f0_76);
  int32_t arm_76 = isaac_hud_7706e0_arm_76_open(r_9305f0_76);
  int32_t room_game = isaac_hud_7706e0_room_game_true(
      room_8, g_game, g_game_26630, g_game_26589);

  int32_t exit_kind = ISAAC_HUD_7706E0_EXIT_REGION_C;
  int32_t result = 0;
  int32_t stages = 0;
  int32_t arm_bits_out = 0;
  int32_t edges = 0;
  int32_t done = 0;

  if (interior_false != 0) {
    exit_kind = ISAAC_HUD_7706E0_EXIT_FALSE_INTERIOR;
    done = 1;
  } else if (held_true != 0) {
    exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_HELD;
    result = 1;
    done = 1;
  } else if (id_negative != 0) {
    exit_kind = ISAAC_HUD_7706E0_EXIT_NEGATIVE_ARM;
    result = isaac_hud_7706e0_trinket_return(r_9e04b0);
    stages |= ISAAC_HUD_7706E0_STAGE_NEGATIVE;
    edges += 1;
    done = 1;
  } else if (flag_epilogue != 0) {
    exit_kind = ISAAC_HUD_7706E0_EXIT_EPILOGUE_FLAG;
    done = 1;
  } else if (arm_147148_open != 0) {
    stages |= ISAAC_HUD_7706E0_STAGE_1550;
    edges += 1;
    if ((r_771550_15 & 0xffu) != 0u) {
      stages |= ISAAC_HUD_7706E0_STAGE_COUNT;
      edges += 1;
    }
    if (isaac_hud_7706e0_arm_147148_hit(id, r_771550_15, mod4,
                                        count_7cb6e0) != 0) {
      exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_147148;
      result = 1;
      done = 1;
      arm_bits_out |= (id == ISAAC_HUD_7706E0_ID_147)
                          ? ISAAC_HUD_7706E0_ARM_BIT_147
                          : ISAAC_HUD_7706E0_ARM_BIT_148;
    }
    /* miss: falls through the id chain — 0x147/0x148 match no other
       arm -> reaches the 7db8d0 stage below. */
  } else if (arm_139 != 0) {
    int32_t mode_gate =
        isaac_hud_7706e0_139_mode_gate(mode, r_930680);
    if (mode != ISAAC_HUD_7706E0_MODE_A) {
      stages |= ISAAC_HUD_7706E0_STAGE_930680;
      edges += 1;
    }
    if (mode_gate != 0 && room_begin != room_end) {
      stages |= ISAAC_HUD_7706E0_STAGE_PAIR;
      edges += 2;
      if (isaac_hud_7706e0_139_byte132(byte_132) != 0) {
        exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_139;
        result = 1;
        done = 1;
      } else if (room_game != 0) {
        exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_139;
        result = 1;
        done = 1;
      }
    }
    /* mode_gate closed / byte132+room_game closed: chain 0x770a44 ->
       the 7db8d0 stage below. */
  } else if (id == ISAAC_HUD_7706E0_ID_9) {
    stages |= ISAAC_HUD_7706E0_STAGE_1550;
    edges += 1;
    if (isaac_hud_770915_open(id, r_771550_5d) != 0) {
      uint32_t seed = isaac_hud_770915_seed(p18300_4, p18300_4_58);
      IsaacHud770915Draw dr;
      isaac_hud_770915_draw(seed, &dr);
      if (dr.fatal == 0 &&
          (isaac_hud_770915_hit(dr.draw) != 0 ||
           isaac_hud_770915_tail_gate(game_26614) != 0)) {
        exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_9;
        result = 1;
        done = 1;
        arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_9;
      }
      /* fatal / miss_chain: chain 0x770a44 -> 7db8d0 stage. */
    }
  } else if (arm_3b != 0) {
    stages |= ISAAC_HUD_7706E0_STAGE_7DA770;
    edges += 1;
    exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_3B;
    result = 1;
    done = 1;
    arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_3B;
  } else if (arm_bits != 0) {
    exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_BITS;
    result = 1;
    done = 1;
    if (id == ISAAC_HUD_7706E0_ID_131) {
      arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_131;
    } else if (id == ISAAC_HUD_7706E0_ID_101) {
      arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_101;
    } else if (id == ISAAC_HUD_7706E0_ID_E7) {
      arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_E7;
    } else {
      arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_B6;
    }
  }

  if (done == 0) {
    /* chain 0x770a44: the 0x7db8d0 edge + the 14a99 gate. */
    stages |= ISAAC_HUD_7706E0_STAGE_7DB8D0;
    edges += 1;
    if (arm_14a99 != 0) {
      exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_14A99;
      result = 1;
      done = 1;
      arm_bits_out |= (id == ISAAC_HUD_7706E0_ID_14A)
                          ? ISAAC_HUD_7706E0_ARM_BIT_14A
                          : ISAAC_HUD_7706E0_ARM_BIT_99;
    }
  }

  if (done == 0) {
    /* ladder 0x770a7e (v25 law; RNG draw lawed in-module). */
    stages |= ISAAC_HUD_7706E0_STAGE_LADDER;
    edges += ladder_open != 0 ? 3 : 1;
    if (ladder_open != 0) {
      IsaacHud770a7eDraw dr;
      isaac_hud_770a7e_draw(count_b, extra, &dr);
      if (id == isaac_hud_770a7e_table_entry(dr.draw)) {
        exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_LADDER;
        result = 1;
        done = 1;
      }
    }
  }

  if (done == 0) {
    /* tail gate 0x770ae2 (v28 law) + the 0x76-arm edge. */
    stages |= ISAAC_HUD_7706E0_STAGE_TAIL;
    if (id == ISAAC_HUD_7706E0_ID_76 && (r_771200 & 0xffu) == 0u) {
      /* the 0x76 arm's 0x9305f0(0x76) edge fires only after the
         0x771200 LOW-byte gate is CLOSED (v28 machine order). */
      stages |= ISAAC_HUD_7706E0_STAGE_76_ARM;
      arm_bits_out |= ISAAC_HUD_7706E0_ARM_BIT_76;
    }
    if (tail_gate != 0) {
      exit_kind = ISAAC_HUD_7706E0_EXIT_TRUE_TAILGATE;
      result = 1;
    }
    /* else REGION_C (the v27 sub-plan resolves TRUE/FALSE/EPILOGUE;
       the 0x76 arm's LOW result is part of tail_gate). */
  }

  out->exit_kind = exit_kind;
  out->result = result;
  out->stages = stages;
  out->arm_bits = arm_bits_out;
  out->host_edge_count = edges;
  out->interior_false = interior_false;
  out->held_true = held_true;
  out->id_negative = id_negative;
  out->flag_epilogue = flag_epilogue;
  out->arm_147148 = arm_147148_open != 0
                        ? isaac_hud_7706e0_arm_147148_hit(
                              id, r_771550_15, mod4, count_7cb6e0)
                        : 0;
  out->arm_139 = arm_139;
  out->room_game = room_game;
  out->arm_9 = 0;
  out->arm_3b = arm_3b;
  out->bit_arm = arm_bits;
  out->arm_14a99 = arm_14a99;
  out->ladder_open = ladder_open;
  out->ladder_hit = 0;
  out->arm_76 = arm_76;
  out->tail_gate = tail_gate;
}

extern "C" uint32_t isaac_hud_7706e0_va_false(void) {
  return ISAAC_HUD_7706E0_VA_FALSE;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_head(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_HEAD;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_26614_load(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_26614_LOAD;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_26614_cmp(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_26614_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_26614_jge(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_26614_JGE;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_cfg_b8(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_CFG_B8;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_cfg_and(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_CFG_AND;
}
extern "C" uint32_t isaac_hud_7706e0_va_interior_cfg_je(void) {
  return ISAAC_HUD_7706E0_VA_INTERIOR_CFG_JE;
}
extern "C" uint32_t isaac_hud_7706e0_va_held_head(void) {
  return ISAAC_HUD_7706E0_VA_HELD_HEAD;
}
extern "C" uint32_t isaac_hud_7706e0_va_held_test(void) {
  return ISAAC_HUD_7706E0_VA_HELD_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_held_cmp(void) {
  return ISAAC_HUD_7706E0_VA_HELD_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_held_byte(void) {
  return ISAAC_HUD_7706E0_VA_HELD_BYTE;
}
extern "C" uint32_t isaac_hud_7706e0_va_held_jne_true(void) {
  return ISAAC_HUD_7706E0_VA_HELD_JNE_TRUE;
}
extern "C" uint32_t isaac_hud_7706e0_va_neg_test(void) {
  return ISAAC_HUD_7706E0_VA_NEG_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_neg_jns(void) {
  return ISAAC_HUD_7706E0_VA_NEG_JNS;
}
extern "C" uint32_t isaac_hud_7706e0_va_neg_call(void) {
  return ISAAC_HUD_7706E0_VA_NEG_CALL;
}
extern "C" uint32_t isaac_hud_7706e0_va_neg_ret(void) {
  return ISAAC_HUD_7706E0_VA_NEG_RET;
}
extern "C" uint32_t isaac_hud_7706e0_va_flag_cmp(void) {
  return ISAAC_HUD_7706E0_VA_FLAG_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_flag_jne_epilogue(void) {
  return ISAAC_HUD_7706E0_VA_FLAG_JNE_EPILOGUE;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmp_147(void) {
  return ISAAC_HUD_7706E0_VA_CMP_147;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmp_148(void) {
  return ISAAC_HUD_7706E0_VA_CMP_148;
}
extern "C" uint32_t isaac_hud_7706e0_va_1550_call(void) {
  return ISAAC_HUD_7706E0_VA_1550_CALL;
}
extern "C" uint32_t isaac_hud_7706e0_va_1550_test(void) {
  return ISAAC_HUD_7706E0_VA_1550_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_mod4_and(void) {
  return ISAAC_HUD_7706E0_VA_MOD4_AND;
}
extern "C" uint32_t isaac_hud_7706e0_va_mod4_jns(void) {
  return ISAAC_HUD_7706E0_VA_MOD4_JNS;
}
extern "C" uint32_t isaac_hud_7706e0_va_mod4_fixup(void) {
  return ISAAC_HUD_7706E0_VA_MOD4_FIXUP;
}
extern "C" uint32_t isaac_hud_7706e0_va_count_call(void) {
  return ISAAC_HUD_7706E0_VA_COUNT_CALL;
}
extern "C" uint32_t isaac_hud_7706e0_va_count_cmp(void) {
  return ISAAC_HUD_7706E0_VA_COUNT_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_count_jle(void) {
  return ISAAC_HUD_7706E0_VA_COUNT_JLE;
}
extern "C" uint32_t isaac_hud_7706e0_va_rule_n_le1_mod0(void) {
  return ISAAC_HUD_7706E0_VA_RULE_N_LE1_MOD0;
}
extern "C" uint32_t isaac_hud_7706e0_va_rule_n_le1_mod1(void) {
  return ISAAC_HUD_7706E0_VA_RULE_N_LE1_MOD1;
}
extern "C" uint32_t isaac_hud_7706e0_va_rule_n_le1_chk(void) {
  return ISAAC_HUD_7706E0_VA_RULE_N_LE1_CHK;
}
extern "C" uint32_t isaac_hud_7706e0_va_rule_n_gt1_chk(void) {
  return ISAAC_HUD_7706E0_VA_RULE_N_GT1_CHK;
}
extern "C" uint32_t isaac_hud_7706e0_va_rule_n_gt1_mod1(void) {
  return ISAAC_HUD_7706E0_VA_RULE_N_GT1_MOD1;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmp_139(void) {
  return ISAAC_HUD_7706E0_VA_CMP_139;
}
extern "C" uint32_t isaac_hud_7706e0_va_mode_a_cmp(void) {
  return ISAAC_HUD_7706E0_VA_MODE_A_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_call_930680(void) {
  return ISAAC_HUD_7706E0_VA_CALL_930680;
}
extern "C" uint32_t isaac_hud_7706e0_va_930680_test(void) {
  return ISAAC_HUD_7706E0_VA_930680_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_mode_1f_cmp(void) {
  return ISAAC_HUD_7706E0_VA_MODE_1F_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_room_begin_cmp(void) {
  return ISAAC_HUD_7706E0_VA_ROOM_BEGIN_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_pair_call(void) {
  return ISAAC_HUD_7706E0_VA_PAIR_CALL;
}
extern "C" uint32_t isaac_hud_7706e0_va_resolve_call(void) {
  return ISAAC_HUD_7706E0_VA_RESOLVE_CALL;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmovne(void) {
  return ISAAC_HUD_7706E0_VA_CMOVNE;
}
extern "C" uint32_t isaac_hud_7706e0_va_byte132_cmp(void) {
  return ISAAC_HUD_7706E0_VA_BYTE132_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_byte132_jne(void) {
  return ISAAC_HUD_7706E0_VA_BYTE132_JNE;
}
extern "C" uint32_t isaac_hud_7706e0_va_room_8_cmp(void) {
  return ISAAC_HUD_7706E0_VA_ROOM_8_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_room_8_jne(void) {
  return ISAAC_HUD_7706E0_VA_ROOM_8_JNE;
}
extern "C" uint32_t isaac_hud_7706e0_va_game_test(void) {
  return ISAAC_HUD_7706E0_VA_GAME_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_game_je(void) {
  return ISAAC_HUD_7706E0_VA_GAME_JE;
}
extern "C" uint32_t isaac_hud_7706e0_va_26630_cmp(void) {
  return ISAAC_HUD_7706E0_VA_26630_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_26630_ja(void) {
  return ISAAC_HUD_7706E0_VA_26630_JA;
}
extern "C" uint32_t isaac_hud_7706e0_va_26589_cmp(void) {
  return ISAAC_HUD_7706E0_VA_26589_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_shared_jne_true(void) {
  return ISAAC_HUD_7706E0_VA_SHARED_JNE_TRUE;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmp_3b(void) {
  return ISAAC_HUD_7706E0_VA_CMP_3B;
}
extern "C" uint32_t isaac_hud_7706e0_va_call_7da770(void) {
  return ISAAC_HUD_7706E0_VA_CALL_7DA770;
}
extern "C" uint32_t isaac_hud_7706e0_va_7da770_test(void) {
  return ISAAC_HUD_7706E0_VA_7DA770_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_bit_131(void) {
  return ISAAC_HUD_7706E0_VA_BIT_131;
}
extern "C" uint32_t isaac_hud_7706e0_va_bit_101(void) {
  return ISAAC_HUD_7706E0_VA_BIT_101;
}
extern "C" uint32_t isaac_hud_7706e0_va_bit_e7(void) {
  return ISAAC_HUD_7706E0_VA_BIT_E7;
}
extern "C" uint32_t isaac_hud_7706e0_va_bit_b6(void) {
  return ISAAC_HUD_7706E0_VA_BIT_B6;
}
extern "C" uint32_t isaac_hud_7706e0_va_call_7db8d0(void) {
  return ISAAC_HUD_7706E0_VA_CALL_7DB8D0;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmp_14a(void) {
  return ISAAC_HUD_7706E0_VA_CMP_14A;
}
extern "C" uint32_t isaac_hud_7706e0_va_7db8d0_cmp_1(void) {
  return ISAAC_HUD_7706E0_VA_7DB8D0_CMP_1;
}
extern "C" uint32_t isaac_hud_7706e0_va_7db8d0_al_ret(void) {
  return ISAAC_HUD_7706E0_VA_7DB8D0_AL_RET;
}
extern "C" uint32_t isaac_hud_7706e0_va_cmp_99(void) {
  return ISAAC_HUD_7706E0_VA_CMP_99;
}
extern "C" uint32_t isaac_hud_7706e0_va_7db8d0_cmp_2(void) {
  return ISAAC_HUD_7706E0_VA_7DB8D0_CMP_2;
}
extern "C" uint32_t isaac_hud_7706e0_va_ladder(void) {
  return ISAAC_HUD_7706E0_VA_LADDER;
}
extern "C" uint32_t isaac_hud_7706e0_va_76_cmp(void) {
  return ISAAC_HUD_7706E0_VA_76_CMP;
}
extern "C" uint32_t isaac_hud_7706e0_va_76_jne(void) {
  return ISAAC_HUD_7706E0_VA_76_JNE;
}
extern "C" uint32_t isaac_hud_7706e0_va_call_9305f0_76(void) {
  return ISAAC_HUD_7706E0_VA_CALL_9305F0_76;
}
extern "C" uint32_t isaac_hud_7706e0_va_76_test(void) {
  return ISAAC_HUD_7706E0_VA_76_TEST;
}
extern "C" uint32_t isaac_hud_7706e0_va_76_jne_true(void) {
  return ISAAC_HUD_7706E0_VA_76_JNE_TRUE;
}
extern "C" uint32_t isaac_hud_7706e0_va_chain_7db8d0(void) {
  return ISAAC_HUD_7706E0_VA_CHAIN_7DB8D0;
}
extern "C" uint32_t isaac_hud_7706e0_va_epilogue(void) {
  return ISAAC_HUD_7706E0_VA_EPILOGUE;
}
extern "C" uint32_t isaac_hud_7706e0_va_true(void) {
  return ISAAC_HUD_7706E0_VA_TRUE;
}
extern "C" uint32_t isaac_hud_7706e0_va_region_c(void) {
  return ISAAC_HUD_7706E0_VA_REGION_C;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_9e04b0(void) {
  return ISAAC_HUD_7706E0_HOST_VA_9E04B0;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_771550(void) {
  return ISAAC_HUD_7706E0_HOST_VA_771550;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_7cb6e0(void) {
  return ISAAC_HUD_7706E0_HOST_VA_7CB6E0;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_930680(void) {
  return ISAAC_HUD_7706E0_HOST_VA_930680;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_a23920(void) {
  return ISAAC_HUD_7706E0_HOST_VA_A23920;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_90c300(void) {
  return ISAAC_HUD_7706E0_HOST_VA_90C300;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_7da770(void) {
  return ISAAC_HUD_7706E0_HOST_VA_7DA770;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_7db8d0(void) {
  return ISAAC_HUD_7706E0_HOST_VA_7DB8D0;
}
extern "C" uint32_t isaac_hud_7706e0_host_va_9305f0(void) {
  return ISAAC_HUD_7706E0_HOST_VA_9305F0;
}
extern "C" uint32_t isaac_hud_7706e0_game_global(void) {
  return ISAAC_HUD_7706E0_GAME_GLOBAL;
}
extern "C" uint32_t isaac_hud_7706e0_room_global(void) {
  return ISAAC_HUD_7706E0_ROOM_GLOBAL;
}
extern "C" uint32_t isaac_hud_7706e0_off_20a9(void) {
  return ISAAC_HUD_7706E0_OFF_20A9;
}
extern "C" uint32_t isaac_hud_7706e0_off_26614(void) {
  return ISAAC_HUD_7706E0_OFF_26614;
}
extern "C" uint32_t isaac_hud_7706e0_off_cfg_b8(void) {
  return ISAAC_HUD_7706E0_OFF_CFG_B8;
}
extern "C" uint32_t isaac_hud_7706e0_off_held_id(void) {
  return ISAAC_HUD_7706E0_OFF_HELD_ID;
}
extern "C" uint32_t isaac_hud_7706e0_off_held_flag(void) {
  return ISAAC_HUD_7706E0_OFF_HELD_FLAG;
}
extern "C" uint32_t isaac_hud_7706e0_off_1fc8(void) {
  return ISAAC_HUD_7706E0_OFF_1FC8;
}
extern "C" uint32_t isaac_hud_7706e0_off_264f8(void) {
  return ISAAC_HUD_7706E0_OFF_264F8;
}
extern "C" uint32_t isaac_hud_7706e0_off_13c0(void) {
  return ISAAC_HUD_7706E0_OFF_13C0;
}
extern "C" uint32_t isaac_hud_7706e0_off_1508(void) {
  return ISAAC_HUD_7706E0_OFF_1508;
}
extern "C" uint32_t isaac_hud_7706e0_off_1e4c(void) {
  return ISAAC_HUD_7706E0_OFF_1E4C;
}
extern "C" uint32_t isaac_hud_7706e0_off_room_begin(void) {
  return ISAAC_HUD_7706E0_OFF_ROOM_BEGIN;
}
extern "C" uint32_t isaac_hud_7706e0_off_room_end(void) {
  return ISAAC_HUD_7706E0_OFF_ROOM_END;
}
extern "C" uint32_t isaac_hud_7706e0_off_room_8(void) {
  return ISAAC_HUD_7706E0_OFF_ROOM_8;
}
extern "C" uint32_t isaac_hud_7706e0_off_room_default(void) {
  return ISAAC_HUD_7706E0_OFF_ROOM_DEFAULT;
}
extern "C" uint32_t isaac_hud_7706e0_off_v_132(void) {
  return ISAAC_HUD_7706E0_OFF_V_132;
}
extern "C" uint32_t isaac_hud_7706e0_off_26630(void) {
  return ISAAC_HUD_7706E0_OFF_26630;
}
extern "C" uint32_t isaac_hud_7706e0_off_26589(void) {
  return ISAAC_HUD_7706E0_OFF_26589;
}
extern "C" uint32_t isaac_hud_7706e0_off_2028(void) {
  return ISAAC_HUD_7706E0_OFF_2028;
}
extern "C" uint32_t isaac_hud_7706e0_id_9(void) {
  return ISAAC_HUD_7706E0_ID_9;
}
extern "C" uint32_t isaac_hud_7706e0_id_147(void) {
  return ISAAC_HUD_7706E0_ID_147;
}
extern "C" uint32_t isaac_hud_7706e0_id_148(void) {
  return ISAAC_HUD_7706E0_ID_148;
}
extern "C" uint32_t isaac_hud_7706e0_id_139(void) {
  return ISAAC_HUD_7706E0_ID_139;
}
extern "C" uint32_t isaac_hud_7706e0_id_3b(void) {
  return ISAAC_HUD_7706E0_ID_3B;
}
extern "C" uint32_t isaac_hud_7706e0_id_131(void) {
  return ISAAC_HUD_7706E0_ID_131;
}
extern "C" uint32_t isaac_hud_7706e0_id_101(void) {
  return ISAAC_HUD_7706E0_ID_101;
}
extern "C" uint32_t isaac_hud_7706e0_id_e7(void) {
  return ISAAC_HUD_7706E0_ID_E7;
}
extern "C" uint32_t isaac_hud_7706e0_id_b6(void) {
  return ISAAC_HUD_7706E0_ID_B6;
}
extern "C" uint32_t isaac_hud_7706e0_id_14a(void) {
  return ISAAC_HUD_7706E0_ID_14A;
}
extern "C" uint32_t isaac_hud_7706e0_id_99(void) {
  return ISAAC_HUD_7706E0_ID_99;
}
extern "C" uint32_t isaac_hud_7706e0_id_76(void) {
  return ISAAC_HUD_7706E0_ID_76;
}
extern "C" uint32_t isaac_hud_7706e0_arg_15(void) {
  return ISAAC_HUD_7706E0_ARG_15;
}
extern "C" uint32_t isaac_hud_7706e0_arg_70(void) {
  return ISAAC_HUD_7706E0_ARG_70;
}
extern "C" uint32_t isaac_hud_7706e0_264f8_mod_mask(void) {
  return ISAAC_HUD_7706E0_264F8_MOD_MASK;
}
extern "C" uint32_t isaac_hud_7706e0_cfg_b8_bit(void) {
  return ISAAC_HUD_7706E0_CFG_B8_BIT;
}
extern "C" uint32_t isaac_hud_7706e0_2028_bit_131(void) {
  return ISAAC_HUD_7706E0_2028_BIT_131;
}
extern "C" uint32_t isaac_hud_7706e0_2028_bit_101(void) {
  return ISAAC_HUD_7706E0_2028_BIT_101;
}
extern "C" uint32_t isaac_hud_7706e0_2028_bit_e7(void) {
  return ISAAC_HUD_7706E0_2028_BIT_E7;
}
extern "C" uint32_t isaac_hud_7706e0_2028_bit_b6(void) {
  return ISAAC_HUD_7706E0_2028_BIT_B6;
}
extern "C" uint32_t isaac_hud_7706e0_26614_threshold(void) {
  return ISAAC_HUD_7706E0_26614_THRESHOLD;
}
extern "C" uint32_t isaac_hud_7706e0_count_le1(void) {
  return ISAAC_HUD_7706E0_COUNT_LE1;
}
extern "C" uint32_t isaac_hud_7706e0_7db8d0_eq_1(void) {
  return ISAAC_HUD_7706E0_7DB8D0_EQ_1;
}
extern "C" uint32_t isaac_hud_7706e0_7db8d0_eq_2(void) {
  return ISAAC_HUD_7706E0_7DB8D0_EQ_2;
}
extern "C" uint32_t isaac_hud_7706e0_mode_a(void) {
  return ISAAC_HUD_7706E0_MODE_A;
}
extern "C" uint32_t isaac_hud_7706e0_mode_1f(void) {
  return ISAAC_HUD_7706E0_MODE_1F;
}
extern "C" uint32_t isaac_hud_7706e0_room_8_eq(void) {
  return ISAAC_HUD_7706E0_ROOM_8_EQ;
}
extern "C" uint32_t isaac_hud_7706e0_stage_76_arm(void) {
  return ISAAC_HUD_7706E0_STAGE_76_ARM;
}
extern "C" uint32_t isaac_hud_7706e0_stage_negative(void) {
  return ISAAC_HUD_7706E0_STAGE_NEGATIVE;
}
extern "C" uint32_t isaac_hud_7706e0_stage_1550(void) {
  return ISAAC_HUD_7706E0_STAGE_1550;
}
extern "C" uint32_t isaac_hud_7706e0_stage_count(void) {
  return ISAAC_HUD_7706E0_STAGE_COUNT;
}
extern "C" uint32_t isaac_hud_7706e0_stage_930680(void) {
  return ISAAC_HUD_7706E0_STAGE_930680;
}
extern "C" uint32_t isaac_hud_7706e0_stage_pair(void) {
  return ISAAC_HUD_7706E0_STAGE_PAIR;
}
extern "C" uint32_t isaac_hud_7706e0_stage_7da770(void) {
  return ISAAC_HUD_7706E0_STAGE_7DA770;
}
extern "C" uint32_t isaac_hud_7706e0_stage_7db8d0(void) {
  return ISAAC_HUD_7706E0_STAGE_7DB8D0;
}
extern "C" uint32_t isaac_hud_7706e0_stage_ladder(void) {
  return ISAAC_HUD_7706E0_STAGE_LADDER;
}
extern "C" uint32_t isaac_hud_7706e0_stage_tail(void) {
  return ISAAC_HUD_7706E0_STAGE_TAIL;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_147(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_147;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_148(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_148;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_139(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_139;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_9(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_9;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_3b(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_3B;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_131(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_131;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_101(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_101;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_e7(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_E7;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_b6(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_B6;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_14a(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_14A;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_99(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_99;
}
extern "C" uint32_t isaac_hud_7706e0_arm_bit_76(void) {
  return ISAAC_HUD_7706E0_ARM_BIT_76;
}
extern "C" int32_t isaac_hud_7706e0_exit_false_interior(void) {
  return ISAAC_HUD_7706E0_EXIT_FALSE_INTERIOR;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_held(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_HELD;
}
extern "C" int32_t isaac_hud_7706e0_exit_negative_arm(void) {
  return ISAAC_HUD_7706E0_EXIT_NEGATIVE_ARM;
}
extern "C" int32_t isaac_hud_7706e0_exit_epilogue_flag(void) {
  return ISAAC_HUD_7706E0_EXIT_EPILOGUE_FLAG;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_147148(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_147148;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_139(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_139;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_9(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_9;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_3b(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_3B;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_bits(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_BITS;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_14a99(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_14A99;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_ladder(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_LADDER;
}
extern "C" int32_t isaac_hud_7706e0_exit_true_tailgate(void) {
  return ISAAC_HUD_7706E0_EXIT_TRUE_TAILGATE;
}
extern "C" int32_t isaac_hud_7706e0_exit_region_c(void) {
  return ISAAC_HUD_7706E0_EXIT_REGION_C;
}
/* ---- Helpers ABI v31: the HasCollectible sibling leaf 0x00771620 ----
   Evidence: section-notes/hud-v31-scan/NOTES.md + cpu-dump/00771620.txt
   (0x00771620..0x007716bd, ret 4; 2 x 0x7706e0 edges, 1 cookie store,
   6 callers). All byte gates uint32_t + 0xff (0x100 CLOSED); no
   uint8_t params; loop jb UNSIGNED, word jg SIGNED 16-bit. */

extern "C" int32_t isaac_hud_771620_8b_open(uint32_t r_8b) {
  /* 0x77163d test al,al ; jne 0x771653 — LOW BYTE of the
     HasCollectible(p, 0x8b, 0) result. */
  return (r_8b & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771620_1ca_open(uint32_t r_1ca) {
  /* 0x77164f test al,al ; je 0x771658 — LOW BYTE of the
     HasCollectible(p, 0x1ca, 0) result. */
  return (r_1ca & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771620_scan_width(uint32_t r_8b,
                                               uint32_t r_1ca) {
  /* 0x77162b mov edi,1 ; 0x771653 mov edi,2 — the 0x1ca call is
     SHORT-CIRCUITED when LOW(r_8b) != 0 (0x77163f jne 0x771653). */
  return (int32_t)ISAAC_HUD_771620_WIDTH_BASE +
         (isaac_hud_771620_8b_open(r_8b) != 0 ||
          isaac_hud_771620_1ca_open(r_1ca) != 0);
}

extern "C" int32_t isaac_hud_771620_1ca_edge_needed(uint32_t r_8b) {
  /* 0x77163f jne 0x771653 — the 0x1ca call fires ONLY when the 0x8b
     call closed (edge count: 1 + this). */
  return isaac_hud_771620_8b_open(r_8b) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_771620_slot_hit(uint32_t slot,
                                             uint32_t id) {
  /* 0x771667 and eax,0x7fff ; 0x77166c cmp eax,ebx (FULL dword) ;
     0x771670 test esi,0x8000 ; 0x771676 jne TRUE. */
  if ((slot & ISAAC_HUD_771620_SLOT_MASK) != id) {
    return 0;
  }
  return (slot & ISAAC_HUD_771620_SLOT_BIT) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_771620_loop_continue(uint32_t index,
                                                  uint32_t width) {
  /* 0x77167c cmp ecx,edi ; 0x77167e jb 0x771663 — UNSIGNED
     (wasm32 compare-flip class). */
  return (uint64_t)index < (uint64_t)width ? 1 : 0;
}

extern "C" int32_t isaac_hud_771620_list_word_true(uint32_t word) {
  /* 0x771689 cmp word ptr [lst+id*4+2],0 ; 0x77168f jg 0x7716b5 —
     SIGNED 16-bit compare (the word is sign-extended; 0xffff = -1
     does NOT open). */
  return (int32_t)(int16_t)(uint16_t)word > 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_771620_held_true(uint32_t held,
                                              uint32_t id) {
  /* 0x771699 and eax,0x7fff ; 0x77169e cmp eax,ebx (FULL dword) ;
     0x7716a2 test ecx,0x8000 ; 0x7716a8 jne 0x7716b5 TRUE. */
  if ((held & ISAAC_HUD_771620_SLOT_MASK) != id) {
    return 0;
  }
  return (held & ISAAC_HUD_771620_SLOT_BIT) != 0u ? 1 : 0;
}

extern "C" void isaac_hud_771620_plan(uint32_t id,
                                      uint32_t r_8b,
                                      uint32_t r_1ca,
                                      uint32_t slot0,
                                      uint32_t slot1,
                                      uint32_t list_word,
                                      uint32_t held,
                                      IsaacHud771620Plan* out) {
  /* Composed machine-order plan: slot scan (0x771658..0x77167e) ->
     list word (0x771680..0x77168f) -> held (0x771691..0x7716a8);
     TRUE exit 0x7716b5 (shared), FALSE epilogue 0x7716b2. The slot1
     sample is consumed only when width == 2 (jb loop bound). */
  int32_t width = isaac_hud_771620_scan_width(r_8b, r_1ca);
  int32_t edge =
      (int32_t)1 + isaac_hud_771620_1ca_edge_needed(r_8b);
  int32_t s0 = isaac_hud_771620_slot_hit(slot0, id);
  int32_t s1 = (width == 2) ? isaac_hud_771620_slot_hit(slot1, id) : 0;
  int32_t word = isaac_hud_771620_list_word_true(list_word);
  int32_t h = isaac_hud_771620_held_true(held, id);

  int32_t result;
  int32_t stages;
  if (s0 != 0 || s1 != 0) {
    result = 1;
    stages = ISAAC_HUD_771620_STAGE_SLOT;
  } else if (word != 0) {
    result = 1;
    stages = ISAAC_HUD_771620_STAGE_SLOT | ISAAC_HUD_771620_STAGE_LIST;
  } else if (h != 0) {
    result = 1;
    stages = ISAAC_HUD_771620_STAGE_SLOT | ISAAC_HUD_771620_STAGE_LIST |
             ISAAC_HUD_771620_STAGE_HELD;
  } else {
    result = 0;
    stages = ISAAC_HUD_771620_STAGE_SLOT | ISAAC_HUD_771620_STAGE_LIST |
             ISAAC_HUD_771620_STAGE_HELD;
  }

  out->result = result;
  out->stages = stages;
  out->host_edge_count = edge;
  out->width = width;
  out->eight_b_open = isaac_hud_771620_8b_open(r_8b);
  out->one_ca_open = isaac_hud_771620_1ca_open(r_1ca);
  out->one_ca_edge = isaac_hud_771620_1ca_edge_needed(r_8b);
  out->slot0_hit = s0;
  out->slot1_hit = s1;
  out->list_word_true = word;
  out->held_true = h;
}

extern "C" uint32_t isaac_hud_771620_va_head(void) {
  return ISAAC_HUD_771620_VA_HEAD;
}
extern "C" uint32_t isaac_hud_771620_va_width_1(void) {
  return ISAAC_HUD_771620_VA_WIDTH_1;
}
extern "C" uint32_t isaac_hud_771620_va_width_2(void) {
  return ISAAC_HUD_771620_VA_WIDTH_2;
}
extern "C" uint32_t isaac_hud_771620_va_call_8b(void) {
  return ISAAC_HUD_771620_VA_CALL_8B;
}
extern "C" uint32_t isaac_hud_771620_va_test_8b(void) {
  return ISAAC_HUD_771620_VA_TEST_8B;
}
extern "C" uint32_t isaac_hud_771620_va_call_1ca(void) {
  return ISAAC_HUD_771620_VA_CALL_1CA;
}
extern "C" uint32_t isaac_hud_771620_va_test_1ca(void) {
  return ISAAC_HUD_771620_VA_TEST_1CA;
}
extern "C" uint32_t isaac_hud_771620_va_slots_lea(void) {
  return ISAAC_HUD_771620_VA_SLOTS_LEA;
}
extern "C" uint32_t isaac_hud_771620_va_slot_load(void) {
  return ISAAC_HUD_771620_VA_SLOT_LOAD;
}
extern "C" uint32_t isaac_hud_771620_va_slot_and(void) {
  return ISAAC_HUD_771620_VA_SLOT_AND;
}
extern "C" uint32_t isaac_hud_771620_va_slot_cmp(void) {
  return ISAAC_HUD_771620_VA_SLOT_CMP;
}
extern "C" uint32_t isaac_hud_771620_va_slot_test(void) {
  return ISAAC_HUD_771620_VA_SLOT_TEST;
}
extern "C" uint32_t isaac_hud_771620_va_slot_jne_true(void) {
  return ISAAC_HUD_771620_VA_SLOT_JNE_TRUE;
}
extern "C" uint32_t isaac_hud_771620_va_loop_cmp(void) {
  return ISAAC_HUD_771620_VA_LOOP_CMP;
}
extern "C" uint32_t isaac_hud_771620_va_loop_jb(void) {
  return ISAAC_HUD_771620_VA_LOOP_JB;
}
extern "C" uint32_t isaac_hud_771620_va_list_load(void) {
  return ISAAC_HUD_771620_VA_LIST_LOAD;
}
extern "C" uint32_t isaac_hud_771620_va_word_cmp(void) {
  return ISAAC_HUD_771620_VA_WORD_CMP;
}
extern "C" uint32_t isaac_hud_771620_va_word_jg(void) {
  return ISAAC_HUD_771620_VA_WORD_JG;
}
extern "C" uint32_t isaac_hud_771620_va_held_load(void) {
  return ISAAC_HUD_771620_VA_HELD_LOAD;
}
extern "C" uint32_t isaac_hud_771620_va_held_and(void) {
  return ISAAC_HUD_771620_VA_HELD_AND;
}
extern "C" uint32_t isaac_hud_771620_va_held_cmp(void) {
  return ISAAC_HUD_771620_VA_HELD_CMP;
}
extern "C" uint32_t isaac_hud_771620_va_held_jne_false(void) {
  return ISAAC_HUD_771620_VA_HELD_JNE_FALSE;
}
extern "C" uint32_t isaac_hud_771620_va_held_test(void) {
  return ISAAC_HUD_771620_VA_HELD_TEST;
}
extern "C" uint32_t isaac_hud_771620_va_held_jne_true(void) {
  return ISAAC_HUD_771620_VA_HELD_JNE_TRUE;
}
extern "C" uint32_t isaac_hud_771620_va_false(void) {
  return ISAAC_HUD_771620_VA_FALSE;
}
extern "C" uint32_t isaac_hud_771620_va_ret_false(void) {
  return ISAAC_HUD_771620_VA_RET_FALSE;
}
extern "C" uint32_t isaac_hud_771620_va_true(void) {
  return ISAAC_HUD_771620_VA_TRUE;
}
extern "C" uint32_t isaac_hud_771620_va_ret_true(void) {
  return ISAAC_HUD_771620_VA_RET_TRUE;
}
extern "C" uint32_t isaac_hud_771620_host_va_7706e0(void) {
  return ISAAC_HUD_771620_HOST_VA_7706E0;
}
extern "C" uint32_t isaac_hud_771620_off_slots(void) {
  return ISAAC_HUD_771620_OFF_SLOTS;
}
extern "C" uint32_t isaac_hud_771620_off_list(void) {
  return ISAAC_HUD_771620_OFF_LIST;
}
extern "C" uint32_t isaac_hud_771620_off_held(void) {
  return ISAAC_HUD_771620_OFF_HELD;
}
extern "C" uint32_t isaac_hud_771620_off_word(void) {
  return ISAAC_HUD_771620_OFF_WORD;
}
extern "C" uint32_t isaac_hud_771620_id_8b(void) {
  return ISAAC_HUD_771620_ID_8B;
}
extern "C" uint32_t isaac_hud_771620_id_1ca(void) {
  return ISAAC_HUD_771620_ID_1CA;
}
extern "C" uint32_t isaac_hud_771620_slot_mask(void) {
  return ISAAC_HUD_771620_SLOT_MASK;
}
extern "C" uint32_t isaac_hud_771620_slot_bit(void) {
  return ISAAC_HUD_771620_SLOT_BIT;
}
extern "C" uint32_t isaac_hud_771620_width_base(void) {
  return ISAAC_HUD_771620_WIDTH_BASE;
}
extern "C" uint32_t isaac_hud_771620_arg_flag(void) {
  return ISAAC_HUD_771620_ARG_FLAG;
}
extern "C" int32_t isaac_hud_771620_stage_slot(void) {
  return ISAAC_HUD_771620_STAGE_SLOT;
}
extern "C" int32_t isaac_hud_771620_stage_list(void) {
  return ISAAC_HUD_771620_STAGE_LIST;
}
extern "C" int32_t isaac_hud_771620_stage_held(void) {
  return ISAAC_HUD_771620_STAGE_HELD;
}

/* ---- Helpers ABI v32: the HasCollectible sibling-family leaf
   0x007716c0 ----
   Evidence: section-notes/hud-v32-7716c0/NOTES.md + cpu-dump/007716c0.txt
   (0x007716c0..0x007716e2, ret 4; 0 E8, 0 indirect, 0 mem-stores,
   2 callers). FULL dword id arg; masked = id & 0x7fff (UNSIGNED);
   TRUE iff masked == 0x29 || masked == 0x87 (shared TRUE exit
   0x7716dd); FALSE epilogue 0x7716d7. NO byte gates (no test al/al
   in the body — full-dword equality after the full-dword and), NO
   signed compare; all params uint32_t, no uint8_t. */

extern "C" int32_t isaac_hud_7716c0_id_masked(uint32_t id) {
  /* 0x7716c6 and eax,0x7fff — FULL dword mask, UNSIGNED (bit 15
     cleared; compare operand always in [0, 0x7fff]). */
  return (int32_t)(uint32_t)(id & ISAAC_HUD_7716C0_ID_MASK);
}

extern "C" int32_t isaac_hud_7716c0_open_a(uint32_t id) {
  /* 0x7716cb cmp eax,0x29 ; 0x7716ce je 0x7716dd — FULL dword
     equality on the masked id (sign-agnostic compare-flip class:
     no signed compare in this body). */
  return (uint64_t)(id & ISAAC_HUD_7716C0_ID_MASK) ==
                 (uint64_t)ISAAC_HUD_7716C0_ID_A
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_7716c0_open_b(uint32_t id) {
  /* 0x7716d0 cmp eax,0x87 ; 0x7716d5 je 0x7716dd — FULL dword
     equality on the masked id. */
  return (uint64_t)(id & ISAAC_HUD_7716C0_ID_MASK) ==
                 (uint64_t)ISAAC_HUD_7716C0_ID_B
             ? 1
             : 0;
}

extern "C" int32_t isaac_hud_7716c0_result(uint32_t id) {
  /* TRUE exit 0x7716dd is the SHARED target of both je's; FALSE
     epilogue 0x7716d7 (xor al,al). */
  return isaac_hud_7716c0_open_a(id) != 0 ||
                 isaac_hud_7716c0_open_b(id) != 0
             ? 1
             : 0;
}

extern "C" void isaac_hud_7716c0_plan(uint32_t id,
                                      IsaacHud7716c0Plan* out) {
  /* Composed machine-order plan: masked (0x7716c6) -> open_a
     (0x7716cb/0x7716ce) -> open_b (0x7716d0/0x7716d5) -> exit TRUE
     0x7716dd (shared) / FALSE 0x7716d7. Single straight-line stage;
     host_edge_count = 0 (the body has no E8). */
  int32_t masked = isaac_hud_7716c0_id_masked(id);
  int32_t a = isaac_hud_7716c0_open_a(id);
  int32_t b = isaac_hud_7716c0_open_b(id);

  out->result = (a != 0 || b != 0) ? 1 : 0;
  out->stages = ISAAC_HUD_7716C0_STAGE_COMPARE;
  out->host_edge_count = 0;
  out->masked_id = masked;
  out->open_a = a;
  out->open_b = b;
}

extern "C" uint32_t isaac_hud_7716c0_va_head(void) {
  return ISAAC_HUD_7716C0_VA_HEAD;
}
extern "C" uint32_t isaac_hud_7716c0_va_and(void) {
  return ISAAC_HUD_7716C0_VA_AND;
}
extern "C" uint32_t isaac_hud_7716c0_va_cmp_a(void) {
  return ISAAC_HUD_7716C0_VA_CMP_A;
}
extern "C" uint32_t isaac_hud_7716c0_va_je_a(void) {
  return ISAAC_HUD_7716C0_VA_JE_A;
}
extern "C" uint32_t isaac_hud_7716c0_va_cmp_b(void) {
  return ISAAC_HUD_7716C0_VA_CMP_B;
}
extern "C" uint32_t isaac_hud_7716c0_va_je_b(void) {
  return ISAAC_HUD_7716C0_VA_JE_B;
}
extern "C" uint32_t isaac_hud_7716c0_va_false(void) {
  return ISAAC_HUD_7716C0_VA_FALSE;
}
extern "C" uint32_t isaac_hud_7716c0_va_ret_false(void) {
  return ISAAC_HUD_7716C0_VA_RET_FALSE;
}
extern "C" uint32_t isaac_hud_7716c0_va_true(void) {
  return ISAAC_HUD_7716C0_VA_TRUE;
}
extern "C" uint32_t isaac_hud_7716c0_va_ret_true(void) {
  return ISAAC_HUD_7716C0_VA_RET_TRUE;
}
extern "C" uint32_t isaac_hud_7716c0_id_a(void) {
  return ISAAC_HUD_7716C0_ID_A;
}
extern "C" uint32_t isaac_hud_7716c0_id_b(void) {
  return ISAAC_HUD_7716C0_ID_B;
}
extern "C" uint32_t isaac_hud_7716c0_id_mask(void) {
  return ISAAC_HUD_7716C0_ID_MASK;
}
extern "C" int32_t isaac_hud_7716c0_stage_compare(void) {
  return ISAAC_HUD_7716C0_STAGE_COMPARE;
}

/* ---- Helpers ABI v33: the HasCollectible sibling-family WIDTH leaf
   0x007717c0 ----
   Evidence: section-notes/hud-v33-scan/NOTES.md + cpu-dump/007717c0.txt
   (0x007717c0..0x007717f1, ret c3 — NO stack args, thiscall no-arg;
   2 x 0x7706e0 edges, 0 indirect, 0 mem-stores, 4 callers). The
   hud-v31-scan band table CONFLATED this body inside the 0x7716f0
   HOST row (0x7716f0's FALSE-epilogue ret @0x7717bb followed by a
   2-byte int3 pad — decode_span walked through); the corrected re-
   scan's E8-target entry list caught it (0x68ecc7 / 0x68ef35 /
   0x6ec314 / 0x778df9). width = 1 + (LOW(r_8b) != 0 || LOW(r_1ca)
   != 0); the 0x1ca edge is SHORT-CIRCUITED when LOW(r_8b) != 0
   (0x7717d1 jne). All byte gates uint32_t + 0xff (0x100 CLOSED); no
   uint8_t; no signed compare (je/jne zero-tests only). */

extern "C" int32_t isaac_hud_7717c0_8b_open(uint32_t r_8b) {
  /* 0x7717cf test al,al ; 0x7717d1 jne 0x7717ea — LOW BYTE of the
     HasCollectible(p, 0x8b, 0) result. */
  return (r_8b & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7717c0_1ca_open(uint32_t r_1ca) {
  /* 0x7717e1 test al,al ; 0x7717e8 je 0x7717ef — LOW BYTE of the
     HasCollectible(p, 0x1ca, 0) result. */
  return (r_1ca & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7717c0_1ca_edge_needed(uint32_t r_8b) {
  /* 0x7717d1 jne 0x7717ea — the 0x1ca edge fires ONLY when the 0x8b
     edge closed (host_edge_count = 1 + this). */
  return isaac_hud_7717c0_8b_open(r_8b) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_hud_7717c0_width(uint32_t r_8b,
                                          uint32_t r_1ca) {
  /* 0x7717e3 mov eax,1 ; 0x7717ea mov eax,2 — width = 1 + (L1 || L2);
     the 0x1ca sample is only ever read when L1 closed. */
  return (int32_t)ISAAC_HUD_7717C0_WIDTH_BASE +
         (isaac_hud_7717c0_8b_open(r_8b) != 0 ||
          isaac_hud_7717c0_1ca_open(r_1ca) != 0);
}

extern "C" void isaac_hud_7717c0_plan(uint32_t r_8b,
                                      uint32_t r_1ca,
                                      IsaacHud7717c0Plan* out) {
  /* Composed machine-order plan: stage 8b (edge 0x7706e0(p,0x8b,0) +
     LOW test 0x7717cf) -> if open: width 2 (0x7717d1 jne 0x7717ea),
     NO 0x1ca edge; else stage 1ca (edge 0x7706e0(p,0x1ca,0) + LOW
     test 0x7717e1) -> width 1 (0x7717e3/0x7717e8 je) or 2
     (0x7717ea). result = width; stages = STAGE_8B | (L3 ? STAGE_1CA
     : 0); host_edge_count = 1 + L3; pure_complete = 1 (both edges
     are in-family landed laws sampled as LOW bytes). */
  int32_t r8b = isaac_hud_7717c0_8b_open(r_8b);
  int32_t r1ca = isaac_hud_7717c0_1ca_open(r_1ca);
  int32_t one_ca = isaac_hud_7717c0_1ca_edge_needed(r_8b);

  out->result = (int32_t)ISAAC_HUD_7717C0_WIDTH_BASE + (r8b != 0 || r1ca != 0);
  out->stages = ISAAC_HUD_7717C0_STAGE_8B |
                (one_ca != 0 ? ISAAC_HUD_7717C0_STAGE_1CA : 0);
  out->host_edge_count = 1 + one_ca;
  out->pure_complete = 1;
  out->r_8b_open = r8b;
  out->r_1ca_open = r1ca;
  out->one_ca_edge = one_ca;
}

extern "C" uint32_t isaac_hud_7717c0_va_head(void) {
  return ISAAC_HUD_7717C0_VA_HEAD;
}
extern "C" uint32_t isaac_hud_7717c0_va_call_8b(void) {
  return ISAAC_HUD_7717C0_VA_CALL_8B;
}
extern "C" uint32_t isaac_hud_7717c0_va_test_8b(void) {
  return ISAAC_HUD_7717C0_VA_TEST_8B;
}
extern "C" uint32_t isaac_hud_7717c0_va_jne_8b(void) {
  return ISAAC_HUD_7717C0_VA_JNE_8B;
}
extern "C" uint32_t isaac_hud_7717c0_va_call_1ca(void) {
  return ISAAC_HUD_7717C0_VA_CALL_1CA;
}
extern "C" uint32_t isaac_hud_7717c0_va_test_1ca(void) {
  return ISAAC_HUD_7717C0_VA_TEST_1CA;
}
extern "C" uint32_t isaac_hud_7717c0_va_width_1(void) {
  return ISAAC_HUD_7717C0_VA_WIDTH_1;
}
extern "C" uint32_t isaac_hud_7717c0_va_je_1ca(void) {
  return ISAAC_HUD_7717C0_VA_JE_1CA;
}
extern "C" uint32_t isaac_hud_7717c0_va_width_2(void) {
  return ISAAC_HUD_7717C0_VA_WIDTH_2;
}
extern "C" uint32_t isaac_hud_7717c0_va_ret(void) {
  return ISAAC_HUD_7717C0_VA_RET;
}
extern "C" uint32_t isaac_hud_7717c0_id_8b(void) {
  return ISAAC_HUD_7717C0_ID_8B;
}
extern "C" uint32_t isaac_hud_7717c0_id_1ca(void) {
  return ISAAC_HUD_7717C0_ID_1CA;
}
extern "C" uint32_t isaac_hud_7717c0_flag(void) {
  return ISAAC_HUD_7717C0_FLAG;
}
extern "C" uint32_t isaac_hud_7717c0_width_base(void) {
  return static_cast<uint32_t>(ISAAC_HUD_7717C0_WIDTH_BASE);
}
extern "C" uint32_t isaac_hud_7717c0_host_7706e0(void) {
  return ISAAC_HUD_7717C0_HOST_7706E0;
}
extern "C" int32_t isaac_hud_7717c0_stage_8b(void) {
  return ISAAC_HUD_7717C0_STAGE_8B;
}
extern "C" int32_t isaac_hud_7717c0_stage_1ca(void) {
  return ISAAC_HUD_7717C0_STAGE_1CA;
}

/* ---- Helpers ABI v34: the 0x007716f0 loop-control islands
   (NARROWED — the body is the virtual-eax HOST of the
   0x7716c0/0x7716f0 sibling pair; the single host virtual edge
   (*(*(game+0x26620)))[0x50](player) @0x77177c stays host as a
   sampled edge). Body 0x007716f0..0x007717bb (ret 4; TRUE epilogue
   0x7717b0, FALSE epilogue 0x7717bb; 1 caller 0x6ec22a, verified
   byte-level e8 c1 54 08 00). E8 census: 2 x 0x7706e0 (landed
   v25-v30, LOW-byte samples) + 1 x 0x7716c0 (landed v32); indirect
   1 (the host virtual edge). Store census: 2 in-frame cookie
   locals, zero observable. The loop walks player+0x16c0 (stride 4)
   with the width RECOMPUTED at every loop back (0x771706) — the
   recompute is byte-identical to the v33 0x7717c0 width leaf, so
   isaac_hud_7717c0_width is REUSED (never re-landed). Byte gates
   uint32_t + & 0xff (v8 convention, 0x100 CLOSED); no uint8_t.
   Compare-flip: loop gate jae UNSIGNED; game gate jl SIGNED; the
   dispatch and slot-zero are FULL-dword. identify-zhl MISS. */

extern "C" int32_t isaac_hud_7716f0_loop_continue(uint32_t index,
                                                  uint32_t width) {
  /* 0x771738 cmp edi,esi ; 0x77173a jae 0x7717b3 — UNSIGNED: the
     iteration runs while index < width. */
  return index < width ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_masked_35(uint32_t slot) {
  /* 0x771740 and eax,0x7fff ; 0x771745 cmp eax,0x35 ; 0x771748 jne —
     FULL mask + FULL equality (bit 15 cleared). */
  return (slot & ISAAC_HUD_7716F0_SLOT_MASK) == ISAAC_HUD_7716F0_SLOT_35
           ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_iso_open(uint32_t r_iso) {
  /* 0x771752 test al,al ; 0x771754 je 0x77175a — LOW byte of the
     0x7716c0(arg) result (the v32 is_trinket_id leaf). */
  return (r_iso & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_bl_set(uint32_t slot,
                                           uint32_t r_iso) {
  /* 0x771756 mov bl,1 / 0x77175a xor bl,bl — masked_35 AND
     iso_open (the 0x7716c0 edge fires iff masked_35). */
  return (isaac_hud_7716f0_masked_35(slot) != 0 &&
          isaac_hud_7716f0_iso_open(r_iso) != 0) ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_slot_zero(uint32_t slot) {
  /* 0x77175c test ecx,ecx ; 0x77175e je 0x7717a8 — FULL dword zero
     test on the slot: 0 -> early TRUE exit (skips every later
     edge of the iteration). */
  return slot == 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_game_gate(uint32_t game_26614) {
  /* 0x771765 cmp [eax+0x26614],2 ; 0x77176c jl 0x771782 — SIGNED
     (int32) game+0x26614 >= 2 opens the host virtual edge. */
  return static_cast<int32_t>(game_26614) >=
             ISAAC_HUD_7716F0_GAME_GATE_MIN ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_virtual_true(uint32_t r_v) {
  /* 0x77177e test al,al ; 0x771793 jne 0x7717a8 — LOW byte of the
     virtual edge result (consumed iff the edge fires). */
  return (r_v & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_dispatch_gate(uint32_t slot,
                                                  uint32_t game_26584) {
  /* 0x771782..0x771793 — FULL dword dispatch on the game-gate-closed
     path: slot==0x35 -> bl gate (je 0x771795); slot==0x40 &&
     game+0x26584==0x1c -> bl gate; else TRUE exit. 1 = the bl gate
     is reached. */
  return (slot == ISAAC_HUD_7716F0_SLOT_35 ||
          (slot == ISAAC_HUD_7716F0_SLOT_40 &&
           game_26584 == ISAAC_HUD_7716F0_GAME_DISPATCH_MODE)) ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_bl_gate(uint32_t bl) {
  /* 0x771795 test bl,bl ; 0x771797 jne 0x7717a8 — LOW byte of bl:
     nonzero -> TRUE exit. */
  return (bl & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7716f0_iter_continue(uint32_t index,
                                                  uint32_t width,
                                                  uint32_t slot,
                                                  uint32_t r_iso,
                                                  uint32_t game_26614,
                                                  uint32_t game_26584,
                                                  uint32_t r_v) {
  /* Composed machine-order continuation: loop gate AND !slot_zero
     AND !bl AND (game_gate ? !virtual_true : dispatch_gate). The
     r_v == 0 virtual edge still reaches the bl gate (0x771780 jmp
     0x771793). */
  if (isaac_hud_7716f0_loop_continue(index, width) == 0) return 0;
  if (isaac_hud_7716f0_slot_zero(slot) != 0) return 0;
  if (isaac_hud_7716f0_bl_set(slot, r_iso) != 0) return 0;
  if (isaac_hud_7716f0_game_gate(game_26614) != 0) {
    if (isaac_hud_7716f0_virtual_true(r_v) != 0) return 0;
  } else if (isaac_hud_7716f0_dispatch_gate(slot, game_26584) == 0) {
    return 0;
  }
  return 1;
}

extern "C" void isaac_hud_7716f0_iter_plan(uint32_t index,
                                           uint32_t r_8b,
                                           uint32_t r_1ca,
                                           uint32_t slot,
                                           uint32_t r_iso,
                                           uint32_t game_26614,
                                           uint32_t game_26584,
                                           uint32_t r_v,
                                           IsaacHud7716f0IterPlan* out) {
  /* Composed per-iteration machine-order plan. width = the REUSED
     v33 law (isaac_hud_7717c0_width — the 0x771706 recompute is
     byte-identical to the 0x7717c0 leaf). exit_kind: EXIT_FALSE
     (loop gate closed), EXIT_TRUE (any TRUE exit), EXIT_CONTINUE
     (gates passed). The slot == 0 early TRUE skips the game gate,
     so virtual_edge = !slot_zero && game_gate. host_edge_count =
     1 [0x8b] + (LOW(r_8b)==0) [0x1ca] + iso_edge + virtual_edge. */
  int32_t width = isaac_hud_7717c0_width(r_8b, r_1ca);
  int32_t loop_continue = isaac_hud_7716f0_loop_continue(index,
                                                          (uint32_t)width);
  int32_t masked_35 = isaac_hud_7716f0_masked_35(slot);
  int32_t iso_edge = masked_35;
  int32_t bl = (masked_35 != 0 && isaac_hud_7716f0_iso_open(r_iso) != 0)
                 ? 1 : 0;
  int32_t slot_zero = isaac_hud_7716f0_slot_zero(slot);
  int32_t game_gate = isaac_hud_7716f0_game_gate(game_26614);
  int32_t virtual_edge = (slot_zero == 0 && game_gate != 0) ? 1 : 0;
  int32_t virtual_true = isaac_hud_7716f0_virtual_true(r_v);
  int32_t dispatch_gate = isaac_hud_7716f0_dispatch_gate(slot,
                                                         game_26584);
  int32_t bl_gate = isaac_hud_7716f0_bl_gate((uint32_t)bl);
  int32_t exit_kind = ISAAC_HUD_7716F0_EXIT_CONTINUE;
  if (loop_continue == 0) {
    exit_kind = ISAAC_HUD_7716F0_EXIT_FALSE;
  } else if (slot_zero != 0 ||
             (game_gate != 0 && virtual_true != 0) ||
             (game_gate == 0 && dispatch_gate == 0) ||
             bl_gate != 0) {
    exit_kind = ISAAC_HUD_7716F0_EXIT_TRUE;
  }
  int32_t one_ca = isaac_hud_7717c0_1ca_edge_needed(r_8b);
  out->width = width;
  out->loop_continue = loop_continue;
  out->masked_35 = masked_35;
  out->iso_edge = iso_edge;
  out->bl = bl;
  out->slot_zero = slot_zero;
  out->game_gate = game_gate;
  out->virtual_edge = virtual_edge;
  out->virtual_true = virtual_true;
  out->dispatch_gate = dispatch_gate;
  out->bl_gate = bl_gate;
  out->exit_kind = exit_kind;
  out->host_edge_count = 1 + one_ca + iso_edge + virtual_edge;
  out->pure_complete = virtual_edge == 0 ? 1 : 0;
}

extern "C" void isaac_hud_7716f0_plan(uint32_t r_8b_0, uint32_t r_1ca_0,
                                      uint32_t slot_0, uint32_t r_iso_0,
                                      uint32_t game_26614_0,
                                      uint32_t game_26584_0,
                                      uint32_t r_v_0, uint32_t r_8b_1,
                                      uint32_t r_1ca_1, uint32_t slot_1,
                                      uint32_t r_iso_1,
                                      uint32_t game_26614_1,
                                      uint32_t game_26584_1,
                                      uint32_t r_v_1,
                                      IsaacHud7716f0Plan* out) {
  /* Composed FULL-BODY plan over both iterations. Iteration 1's
     samples are consumed (edges counted, gates decide) ONLY when
     iteration 0 CONTINUED — the PE recomputes the width at the
     0x7717a3 loop back before the iteration-1 0x8b call. result =
     the ret-4 value (1 TRUE / 0 FALSE); a CONTINUE at i == 1
     (width 2) resolves to FALSE at the next gate (i == 2 >=
     width). Iteration-1 fields are always computed for shape but
     consume NO edges when loop_continue_0 == 0. */
  IsaacHud7716f0IterPlan it0;
  IsaacHud7716f0IterPlan it1;
  isaac_hud_7716f0_iter_plan(0, r_8b_0, r_1ca_0, slot_0, r_iso_0,
                             game_26614_0, game_26584_0, r_v_0, &it0);
  isaac_hud_7716f0_iter_plan(1, r_8b_1, r_1ca_1, slot_1, r_iso_1,
                             game_26614_1, game_26584_1, r_v_1, &it1);
  int32_t iter_1_ran =
    it0.exit_kind == ISAAC_HUD_7716F0_EXIT_CONTINUE ? 1 : 0;
  int32_t result = 0;
  int32_t exit_kind = ISAAC_HUD_7716F0_EXIT_FALSE;
  if (it0.exit_kind == ISAAC_HUD_7716F0_EXIT_TRUE ||
      (iter_1_ran != 0 && it1.exit_kind == ISAAC_HUD_7716F0_EXIT_TRUE)) {
    result = 1;
    exit_kind = ISAAC_HUD_7716F0_EXIT_TRUE;
  }
  int32_t host_edge_count =
    it0.host_edge_count + (iter_1_ran != 0 ? it1.host_edge_count : 0);
  int32_t pure_complete =
    (it0.virtual_edge == 0 && (iter_1_ran == 0 || it1.virtual_edge == 0))
      ? 1 : 0;

  out->width_0 = it0.width;
  out->loop_continue_0 = it0.loop_continue;
  out->masked_35_0 = it0.masked_35;
  out->iso_edge_0 = it0.iso_edge;
  out->bl_0 = it0.bl;
  out->slot_zero_0 = it0.slot_zero;
  out->game_gate_0 = it0.game_gate;
  out->virtual_edge_0 = it0.virtual_edge;
  out->virtual_true_0 = it0.virtual_true;
  out->dispatch_gate_0 = it0.dispatch_gate;
  out->bl_gate_0 = it0.bl_gate;
  out->exit_0 = it0.exit_kind;
  out->width_1 = it1.width;
  out->loop_continue_1 = it1.loop_continue;
  out->masked_35_1 = it1.masked_35;
  out->iso_edge_1 = it1.iso_edge;
  out->bl_1 = it1.bl;
  out->slot_zero_1 = it1.slot_zero;
  out->game_gate_1 = it1.game_gate;
  out->virtual_edge_1 = it1.virtual_edge;
  out->virtual_true_1 = it1.virtual_true;
  out->dispatch_gate_1 = it1.dispatch_gate;
  out->bl_gate_1 = it1.bl_gate;
  out->exit_1 = it1.exit_kind;
  out->iter_1_ran = iter_1_ran;
  out->result = result;
  out->exit_kind = exit_kind;
  out->host_edge_count = host_edge_count;
  out->pure_complete = pure_complete;
}

extern "C" uint32_t isaac_hud_7716f0_va_head(void) {
  return ISAAC_HUD_7716F0_VA_HEAD;
}
extern "C" uint32_t isaac_hud_7716f0_va_width_1(void) {
  return ISAAC_HUD_7716F0_VA_WIDTH_1;
}
extern "C" uint32_t isaac_hud_7716f0_va_call_8b(void) {
  return ISAAC_HUD_7716F0_VA_CALL_8B;
}
extern "C" uint32_t isaac_hud_7716f0_va_test_8b(void) {
  return ISAAC_HUD_7716F0_VA_TEST_8B;
}
extern "C" uint32_t isaac_hud_7716f0_va_jne_8b(void) {
  return ISAAC_HUD_7716F0_VA_JNE_8B;
}
extern "C" uint32_t isaac_hud_7716f0_va_call_1ca(void) {
  return ISAAC_HUD_7716F0_VA_CALL_1CA;
}
extern "C" uint32_t isaac_hud_7716f0_va_test_1ca(void) {
  return ISAAC_HUD_7716F0_VA_TEST_1CA;
}
extern "C" uint32_t isaac_hud_7716f0_va_je_1ca(void) {
  return ISAAC_HUD_7716F0_VA_JE_1CA;
}
extern "C" uint32_t isaac_hud_7716f0_va_width_2(void) {
  return ISAAC_HUD_7716F0_VA_WIDTH_2;
}
extern "C" uint32_t isaac_hud_7716f0_va_loop_cmp(void) {
  return ISAAC_HUD_7716F0_VA_LOOP_CMP;
}
extern "C" uint32_t isaac_hud_7716f0_va_loop_jae(void) {
  return ISAAC_HUD_7716F0_VA_LOOP_JAE;
}
extern "C" uint32_t isaac_hud_7716f0_va_slot_load(void) {
  return ISAAC_HUD_7716F0_VA_SLOT_LOAD;
}
extern "C" uint32_t isaac_hud_7716f0_va_slot_and(void) {
  return ISAAC_HUD_7716F0_VA_SLOT_AND;
}
extern "C" uint32_t isaac_hud_7716f0_va_slot_cmp(void) {
  return ISAAC_HUD_7716F0_VA_SLOT_CMP;
}
extern "C" uint32_t isaac_hud_7716f0_va_slot_jne(void) {
  return ISAAC_HUD_7716F0_VA_SLOT_JNE;
}
extern "C" uint32_t isaac_hud_7716f0_va_call_7716c0(void) {
  return ISAAC_HUD_7716F0_VA_CALL_7716C0;
}
extern "C" uint32_t isaac_hud_7716f0_va_test_iso(void) {
  return ISAAC_HUD_7716F0_VA_TEST_ISO;
}
extern "C" uint32_t isaac_hud_7716f0_va_je_iso(void) {
  return ISAAC_HUD_7716F0_VA_JE_ISO;
}
extern "C" uint32_t isaac_hud_7716f0_va_bl_1(void) {
  return ISAAC_HUD_7716F0_VA_BL_1;
}
extern "C" uint32_t isaac_hud_7716f0_va_bl_0(void) {
  return ISAAC_HUD_7716F0_VA_BL_0;
}
extern "C" uint32_t isaac_hud_7716f0_va_slot_test(void) {
  return ISAAC_HUD_7716F0_VA_SLOT_TEST;
}
extern "C" uint32_t isaac_hud_7716f0_va_je_slot_zero(void) {
  return ISAAC_HUD_7716F0_VA_JE_SLOT_ZERO;
}
extern "C" uint32_t isaac_hud_7716f0_va_game_load(void) {
  return ISAAC_HUD_7716F0_VA_GAME_LOAD;
}
extern "C" uint32_t isaac_hud_7716f0_va_game_cmp(void) {
  return ISAAC_HUD_7716F0_VA_GAME_CMP;
}
extern "C" uint32_t isaac_hud_7716f0_va_game_jl(void) {
  return ISAAC_HUD_7716F0_VA_GAME_JL;
}
extern "C" uint32_t isaac_hud_7716f0_va_vtable_load(void) {
  return ISAAC_HUD_7716F0_VA_VTABLE_LOAD;
}
extern "C" uint32_t isaac_hud_7716f0_va_virtual_call(void) {
  return ISAAC_HUD_7716F0_VA_VIRTUAL_CALL;
}
extern "C" uint32_t isaac_hud_7716f0_va_test_v(void) {
  return ISAAC_HUD_7716F0_VA_TEST_V;
}
extern "C" uint32_t isaac_hud_7716f0_va_disp_cmp_35(void) {
  return ISAAC_HUD_7716F0_VA_DISP_CMP_35;
}
extern "C" uint32_t isaac_hud_7716f0_va_disp_je_35(void) {
  return ISAAC_HUD_7716F0_VA_DISP_JE_35;
}
extern "C" uint32_t isaac_hud_7716f0_va_disp_cmp_40(void) {
  return ISAAC_HUD_7716F0_VA_DISP_CMP_40;
}
extern "C" uint32_t isaac_hud_7716f0_va_disp_jne_40(void) {
  return ISAAC_HUD_7716F0_VA_DISP_JNE_40;
}
extern "C" uint32_t isaac_hud_7716f0_va_disp_cmp_1c(void) {
  return ISAAC_HUD_7716F0_VA_DISP_CMP_1C;
}
extern "C" uint32_t isaac_hud_7716f0_va_merge_jne(void) {
  return ISAAC_HUD_7716F0_VA_MERGE_JNE;
}
extern "C" uint32_t isaac_hud_7716f0_va_bl_test(void) {
  return ISAAC_HUD_7716F0_VA_BL_TEST;
}
extern "C" uint32_t isaac_hud_7716f0_va_bl_jne(void) {
  return ISAAC_HUD_7716F0_VA_BL_JNE;
}
extern "C" uint32_t isaac_hud_7716f0_va_loop_cont(void) {
  return ISAAC_HUD_7716F0_VA_LOOP_CONT;
}
extern "C" uint32_t isaac_hud_7716f0_va_loop_inc(void) {
  return ISAAC_HUD_7716F0_VA_LOOP_INC;
}
extern "C" uint32_t isaac_hud_7716f0_va_loop_back(void) {
  return ISAAC_HUD_7716F0_VA_LOOP_BACK;
}
extern "C" uint32_t isaac_hud_7716f0_va_true(void) {
  return ISAAC_HUD_7716F0_VA_TRUE;
}
extern "C" uint32_t isaac_hud_7716f0_va_ret_true(void) {
  return ISAAC_HUD_7716F0_VA_RET_TRUE;
}
extern "C" uint32_t isaac_hud_7716f0_va_false(void) {
  return ISAAC_HUD_7716F0_VA_FALSE;
}
extern "C" uint32_t isaac_hud_7716f0_va_ret_false(void) {
  return ISAAC_HUD_7716F0_VA_RET_FALSE;
}
extern "C" uint32_t isaac_hud_7716f0_off_slots(void) {
  return ISAAC_HUD_7716F0_OFF_SLOTS;
}
extern "C" uint32_t isaac_hud_7716f0_slot_stride(void) {
  return ISAAC_HUD_7716F0_SLOT_STRIDE;
}
extern "C" uint32_t isaac_hud_7716f0_slot_mask(void) {
  return ISAAC_HUD_7716F0_SLOT_MASK;
}
extern "C" uint32_t isaac_hud_7716f0_slot_35(void) {
  return ISAAC_HUD_7716F0_SLOT_35;
}
extern "C" uint32_t isaac_hud_7716f0_slot_40(void) {
  return ISAAC_HUD_7716F0_SLOT_40;
}
extern "C" uint32_t isaac_hud_7716f0_game_global(void) {
  return ISAAC_HUD_7716F0_GAME_GLOBAL;
}
extern "C" uint32_t isaac_hud_7716f0_game_field_26614(void) {
  return ISAAC_HUD_7716F0_GAME_FIELD_26614;
}
extern "C" uint32_t isaac_hud_7716f0_game_field_26620(void) {
  return ISAAC_HUD_7716F0_GAME_FIELD_26620;
}
extern "C" uint32_t isaac_hud_7716f0_game_field_26584(void) {
  return ISAAC_HUD_7716F0_GAME_FIELD_26584;
}
extern "C" uint32_t isaac_hud_7716f0_game_gate_min(void) {
  return ISAAC_HUD_7716F0_GAME_GATE_MIN;
}
extern "C" uint32_t isaac_hud_7716f0_game_dispatch_mode(void) {
  return ISAAC_HUD_7716F0_GAME_DISPATCH_MODE;
}
extern "C" uint32_t isaac_hud_7716f0_host_vtable_entry(void) {
  return ISAAC_HUD_7716F0_HOST_VTABLE_ENTRY;
}
extern "C" uint32_t isaac_hud_7716f0_host_va_7706e0(void) {
  return ISAAC_HUD_7716F0_HOST_VA_7706E0;
}
extern "C" uint32_t isaac_hud_7716f0_host_va_7716c0(void) {
  return ISAAC_HUD_7716F0_HOST_VA_7716C0;
}
extern "C" uint32_t isaac_hud_7716f0_host_va_virtual(void) {
  return ISAAC_HUD_7716F0_HOST_VA_VIRTUAL;
}
extern "C" int32_t isaac_hud_7716f0_stage_8b(void) {
  return ISAAC_HUD_7716F0_STAGE_8B;
}
extern "C" int32_t isaac_hud_7716f0_stage_1ca(void) {
  return ISAAC_HUD_7716F0_STAGE_1CA;
}
extern "C" int32_t isaac_hud_7716f0_stage_iso(void) {
  return ISAAC_HUD_7716F0_STAGE_ISO;
}
extern "C" int32_t isaac_hud_7716f0_stage_virtual(void) {
  return ISAAC_HUD_7716F0_STAGE_VIRTUAL;
}
extern "C" int32_t isaac_hud_7716f0_exit_continue(void) {
  return ISAAC_HUD_7716F0_EXIT_CONTINUE;
}
extern "C" int32_t isaac_hud_7716f0_exit_true(void) {
  return ISAAC_HUD_7716F0_EXIT_TRUE;
}
extern "C" int32_t isaac_hud_7716f0_exit_false(void) {
  return ISAAC_HUD_7716F0_EXIT_FALSE;
}
extern "C" int32_t isaac_hud_7716f0_iter_cap(void) {
  return ISAAC_HUD_7716F0_ITER_CAP;
}

/* ---- Helpers ABI v35: the 0x76143f caller-guard laws (0x226 gate
   class; evidence: section-notes/hud-v35-76143f/NOTES.md; canonical
   dump section-notes/cpu-dump/0076143f.txt). The 0x76143f site is
   HasCollectible(p,0x226,0) (0x007706e0, LANDED v25-v30 — an
   UNCONDITIONAL in-family call) inside the int3-unseparated HOST draw
   span A (0x760c8c..0x762d4c); the FULL-dword cmp/jne gates select the
   [ebp-0x1c8] pair-sum ACCUMULATOR, never the call. Block (LOW(r_226)
   open): 0x78f840 x2 (0x226/0x227) + 0x75f0e0 (0x228) + the pure 4-slot
   0x228 scan (UB 0x20, UNSIGNED jb eax,4, FULL cmp dword) + SIGNED idx
   js gate + 0x791420(p, acc, idx). ALL params uint32_t, no uint8_t;
   byte gates uint32_t + & 0xff (v8 convention). ---- */

extern "C" int32_t isaac_hud_76143f_class_226(uint32_t field) {
  /* 0x7613fa / 0x761418 cmp dword [reg+off],0x226 — FULL 32-bit
     equality (0x100226 must NOT open; the machine compares the full
     dword imm32). */
  return field == ISAAC_HUD_76143F_CLASS_226 ? 1 : 0;
}

extern "C" uint32_t isaac_hud_76143f_pair_sum(uint32_t lo, uint32_t hi) {
  /* 0x7613ee / 0x76140c / 0x76142a add eax,[reg+off] — 32-bit
     wrapping add of the two field dwords (hi is loaded first into
     eax; addition commutes). */
  return lo + hi;
}

extern "C" uint32_t isaac_hud_76143f_accumulate(
    uint32_t base_lo, uint32_t base_hi, uint32_t field_15c0,
    uint32_t c8, uint32_t cc, uint32_t field_15e0,
    uint32_t e8, uint32_t ec) {
  /* Machine order (0x7613e8..0x761430): acc = sum(base_lo,base_hi)
     [0x7613e8/0x7613f4]; if FULL class_226(field_15c0): acc =
     sum(c8,cc) [0x761406..0x761412]; if FULL class_226(field_15e0):
     acc = sum(e8,ec) [0x761424..0x761430] — the 15e0 write
     OVERWRITES the 15c0 write (LAST match wins). */
  uint32_t acc = isaac_hud_76143f_pair_sum(base_lo, base_hi);
  if (isaac_hud_76143f_class_226(field_15c0) != 0) {
    acc = isaac_hud_76143f_pair_sum(c8, cc);
  }
  if (isaac_hud_76143f_class_226(field_15e0) != 0) {
    acc = isaac_hud_76143f_pair_sum(e8, ec);
  }
  return acc;
}

extern "C" int32_t isaac_hud_76143f_has_open(uint32_t r_226) {
  /* 0x761444 test al,al ; 0x761446 je 0x762806 — LOW byte of the
     in-family 0x7706e0 result (0x100 CLOSED). */
  return (r_226 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_76143f_scan_continue(uint32_t index) {
  /* 0x761494 cmp eax,4 ; 0x761497 jb 0x761488 — UNSIGNED loop gate
     (0xffffffff must NOT continue). */
  return index < ISAAC_HUD_76143F_SCAN_COUNT ? 1 : 0;
}

extern "C" int32_t isaac_hud_76143f_scan_found(uint32_t slot) {
  /* 0x761488 cmp dword [esi],0x228 ; 0x76148e je — FULL-dword
     equality (0x100228 must NOT match). */
  return slot == ISAAC_HUD_76143F_SCAN_ID ? 1 : 0;
}

extern "C" int32_t isaac_hud_76143f_scan_index(
    uint32_t slot0, uint32_t slot1, uint32_t slot2, uint32_t slot3) {
  /* 0x761486..0x761499: FIRST index in [0,4) whose slot == 0x228
     (slot_i tested while eax == i; stride 0x20), else 4 (eax runs
     past the UNSIGNED jb bound). */
  const uint32_t slots[4] = {slot0, slot1, slot2, slot3};
  for (uint32_t i = 0; i < ISAAC_HUD_76143F_SCAN_COUNT; ++i) {
    if (isaac_hud_76143f_scan_found(slots[i]) != 0) {
      return static_cast<int32_t>(i);
    }
  }
  return static_cast<int32_t>(ISAAC_HUD_76143F_SCAN_COUNT);
}

extern "C" int32_t isaac_hud_76143f_idx_ok(int32_t idx) {
  /* 0x76149e test eax,eax ; 0x7614a0 js 0x762806 — SIGNED (int32)
     index >= 0 (structurally dead on-path: scan_index is 0..3 before
     the je; pinned for the compare-flip class). */
  return idx >= 0 ? 1 : 0;
}

extern "C" void isaac_hud_76143f_guard_plan(
    uint32_t base_lo, uint32_t base_hi, uint32_t field_15c0,
    uint32_t c8, uint32_t cc, uint32_t field_15e0,
    uint32_t e8, uint32_t ec, uint32_t r_226,
    uint32_t slot0, uint32_t slot1, uint32_t slot2, uint32_t slot3,
    IsaacHud76143fPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->stage_base = 1;
  out->class_15c0 = isaac_hud_76143f_class_226(field_15c0);
  out->stage_15c0 = out->class_15c0;
  out->class_15e0 = isaac_hud_76143f_class_226(field_15e0);
  out->stage_15e0 = out->class_15e0;
  out->acc = static_cast<int32_t>(isaac_hud_76143f_accumulate(
      base_lo, base_hi, field_15c0, c8, cc, field_15e0, e8, ec));
  out->call_fires = 1; /* 0x76143f — unconditional in-family call */
  out->has_open = isaac_hud_76143f_has_open(r_226);
  const int32_t si = isaac_hud_76143f_scan_index(slot0, slot1, slot2,
                                                 slot3);
  out->scan_index = si;
  out->scan_found = (si < static_cast<int32_t>(ISAAC_HUD_76143F_SCAN_COUNT))
                        ? 1
                        : 0;
  out->idx_ok = isaac_hud_76143f_idx_ok(si);
  /* Block edges: 2 x 0x78f840 + 1 x 0x75f0e0 (always in the block),
     then 0x791420 iff the scan found a slot with a signed-valid index. */
  out->block_edges = 0;
  if (out->has_open != 0) {
    out->block_edges = 3;
    if (out->scan_found != 0 && out->idx_ok != 0) {
      out->block_edges += 1;
    }
  }
  out->host_edge_count = 1 + out->block_edges;
  out->pure_complete = out->has_open == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_hud_76143f_va_gate_15c0(void) {
  return ISAAC_HUD_76143F_VA_GATE_15C0;
}
extern "C" uint32_t isaac_hud_76143f_va_jne_15c0(void) {
  return ISAAC_HUD_76143F_VA_JNE_15C0;
}
extern "C" uint32_t isaac_hud_76143f_va_sum_15c0(void) {
  return ISAAC_HUD_76143F_VA_SUM_15C0;
}
extern "C" uint32_t isaac_hud_76143f_va_store_15c0(void) {
  return ISAAC_HUD_76143F_VA_STORE_15C0;
}
extern "C" uint32_t isaac_hud_76143f_va_gate_15e0(void) {
  return ISAAC_HUD_76143F_VA_GATE_15E0;
}
extern "C" uint32_t isaac_hud_76143f_va_jne_15e0(void) {
  return ISAAC_HUD_76143F_VA_JNE_15E0;
}
extern "C" uint32_t isaac_hud_76143f_va_sum_15e0(void) {
  return ISAAC_HUD_76143F_VA_SUM_15E0;
}
extern "C" uint32_t isaac_hud_76143f_va_store_15e0(void) {
  return ISAAC_HUD_76143F_VA_STORE_15E0;
}
extern "C" uint32_t isaac_hud_76143f_va_call_has(void) {
  return ISAAC_HUD_76143F_VA_CALL_HAS;
}
extern "C" uint32_t isaac_hud_76143f_va_test_al(void) {
  return ISAAC_HUD_76143F_VA_TEST_AL;
}
extern "C" uint32_t isaac_hud_76143f_va_je_skip(void) {
  return ISAAC_HUD_76143F_VA_JE_SKIP;
}
extern "C" uint32_t isaac_hud_76143f_va_block(void) {
  return ISAAC_HUD_76143F_VA_BLOCK;
}
extern "C" uint32_t isaac_hud_76143f_va_call2_a(void) {
  return ISAAC_HUD_76143F_VA_CALL2_A;
}
extern "C" uint32_t isaac_hud_76143f_va_call2_b(void) {
  return ISAAC_HUD_76143F_VA_CALL2_B;
}
extern "C" uint32_t isaac_hud_76143f_va_call3(void) {
  return ISAAC_HUD_76143F_VA_CALL3;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_cmp(void) {
  return ISAAC_HUD_76143F_VA_SCAN_CMP;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_je(void) {
  return ISAAC_HUD_76143F_VA_SCAN_JE;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_inc(void) {
  return ISAAC_HUD_76143F_VA_SCAN_INC;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_stride(void) {
  return ISAAC_HUD_76143F_VA_SCAN_STRIDE;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_cmp_4(void) {
  return ISAAC_HUD_76143F_VA_SCAN_CMP_4;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_jb(void) {
  return ISAAC_HUD_76143F_VA_SCAN_JB;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_fail(void) {
  return ISAAC_HUD_76143F_VA_SCAN_FAIL;
}
extern "C" uint32_t isaac_hud_76143f_va_scan_found(void) {
  return ISAAC_HUD_76143F_VA_SCAN_FOUND;
}
extern "C" uint32_t isaac_hud_76143f_va_test_idx(void) {
  return ISAAC_HUD_76143F_VA_TEST_IDX;
}
extern "C" uint32_t isaac_hud_76143f_va_push_acc(void) {
  return ISAAC_HUD_76143F_VA_PUSH_ACC;
}
extern "C" uint32_t isaac_hud_76143f_va_call4(void) {
  return ISAAC_HUD_76143F_VA_CALL4;
}
extern "C" uint32_t isaac_hud_76143f_va_merge(void) {
  return ISAAC_HUD_76143F_VA_MERGE;
}
extern "C" uint32_t isaac_hud_76143f_va_skip(void) {
  return ISAAC_HUD_76143F_VA_SKIP;
}
extern "C" uint32_t isaac_hud_76143f_off_base_lo(void) {
  return ISAAC_HUD_76143F_OFF_BASE_LO;
}
extern "C" uint32_t isaac_hud_76143f_off_base_hi(void) {
  return ISAAC_HUD_76143F_OFF_BASE_HI;
}
extern "C" uint32_t isaac_hud_76143f_off_15c0(void) {
  return ISAAC_HUD_76143F_OFF_15C0;
}
extern "C" uint32_t isaac_hud_76143f_off_15c8(void) {
  return ISAAC_HUD_76143F_OFF_15C8;
}
extern "C" uint32_t isaac_hud_76143f_off_15cc(void) {
  return ISAAC_HUD_76143F_OFF_15CC;
}
extern "C" uint32_t isaac_hud_76143f_off_15e0(void) {
  return ISAAC_HUD_76143F_OFF_15E0;
}
extern "C" uint32_t isaac_hud_76143f_off_15e8(void) {
  return ISAAC_HUD_76143F_OFF_15E8;
}
extern "C" uint32_t isaac_hud_76143f_off_15ec(void) {
  return ISAAC_HUD_76143F_OFF_15EC;
}
extern "C" uint32_t isaac_hud_76143f_acc_cookie_off(void) {
  return ISAAC_HUD_76143F_ACC_COOKIE_OFF;
}
extern "C" uint32_t isaac_hud_76143f_class_226_id(void) {
  return ISAAC_HUD_76143F_CLASS_226;
}
extern "C" uint32_t isaac_hud_76143f_scan_id(void) {
  return ISAAC_HUD_76143F_SCAN_ID;
}
extern "C" uint32_t isaac_hud_76143f_scan_count(void) {
  return static_cast<uint32_t>(ISAAC_HUD_76143F_SCAN_COUNT);
}
extern "C" uint32_t isaac_hud_76143f_scan_stride(void) {
  return ISAAC_HUD_76143F_SCAN_STRIDE;
}
extern "C" uint32_t isaac_hud_76143f_host_7706e0(void) {
  return ISAAC_HUD_76143F_HOST_7706E0;
}
extern "C" uint32_t isaac_hud_76143f_host_78f840(void) {
  return ISAAC_HUD_76143F_HOST_78F840;
}
extern "C" uint32_t isaac_hud_76143f_host_75f0e0(void) {
  return ISAAC_HUD_76143F_HOST_75F0E0;
}
extern "C" uint32_t isaac_hud_76143f_host_791420(void) {
  return ISAAC_HUD_76143F_HOST_791420;
}
extern "C" int32_t isaac_hud_76143f_stage_base(void) {
  return ISAAC_HUD_76143F_STAGE_BASE;
}
extern "C" int32_t isaac_hud_76143f_stage_15c0(void) {
  return ISAAC_HUD_76143F_STAGE_15C0;
}
extern "C" int32_t isaac_hud_76143f_stage_15e0(void) {
  return ISAAC_HUD_76143F_STAGE_15E0;
}

/* ---- Helpers ABI v36: the 0x7616ad caller-guard laws (0x771620(p,0x79)
   gated on LOW(r_771550); evidence: section-notes/hud-v36-7616ad/NOTES.md;
   canonical dump section-notes/cpu-dump/007616ad.txt). The site is
   dispatch case 13 (0x762ec0[13] = 0x76169a) of draw span A's two-level
   switch. Machine order: r_1550 = 0x771550(p,0x79,0) UNCONDITIONAL
   in-family v17-narrowed sample (0x7616a0) — the gates decide the LATER
   edges; LOW(r_1550)!=0 (test al,al 0x7616a5 ; je 0x7616a7) -> r_1620 =
   0x771620(p,0x79) in-family v31-landed (0x7616ad); LOW(r_1620)!=0
   (test al,al 0x7616b2 ; jne 0x7616b4) -> host 0x7db0a0(p) (0x7616b8,
   3 callers). Merge 0x7616bd -> host continuation: count=0x7cb6e0(p,
   0x6d), SIGNED count>1 (cmp eax,1 ; jle 0x762806) && FULL [p+0x1ef0]==0
   (cmp dword ; jne 0x762806) -> OBSERVABLE [p+0x1ef0]=1 (0x7616dc), jmp
   0x762806. Guard gates are LOW-byte (uint32_t + & 0xff, v8 convention);
   count_open SIGNED; slot_empty FULL dword. */

extern "C" int32_t isaac_hud_7616ad_1550_open(uint32_t r_1550) {
  /* 0x7616a5 test al,al ; 0x7616a7 je 0x7616bd — LOW byte of the
     in-family 0x771550 result (0x100 CLOSED; guard A). */
  return (r_1550 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7616ad_1620_edge_needed(uint32_t r_1550) {
  /* The 0x771620(p,0x79) edge fires ONLY when guard A is open (the
     0x7616a7 je skips it straight to the merge). */
  return (r_1550 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7616ad_1620_open(uint32_t r_1620) {
  /* 0x7616b2 test al,al ; 0x7616b4 jne 0x7616bd — LOW byte of the
     in-family 0x771620 result (0x100 CLOSED; guard B). */
  return (r_1620 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_7616ad_7db0a0_edge_needed(uint32_t r_1550,
                                                       uint32_t r_1620) {
  /* The host 0x7db0a0 edge fires ONLY when guard A is open AND guard B
     is closed (0x7616b4 jne skips it when the 0x771620 result is open). */
  return ((r_1550 & 0xffu) != 0u && (r_1620 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_hud_7616ad_count_open(int32_t count) {
  /* 0x7616c6 cmp eax,1 ; 0x7616c9 jle 0x762806 — SIGNED count > 1
     (the continuation store requires count >= 2; 0xffffffff as -1
     closes). */
  return count > 1 ? 1 : 0;
}

extern "C" int32_t isaac_hud_7616ad_slot_empty(uint32_t field_1ef0) {
  /* 0x7616cf cmp dword [edi+0x1ef0],0 ; 0x7616d6 jne 0x762806 — FULL
     dword zero-test (0x100 must NOT be empty). */
  return field_1ef0 == 0u ? 1 : 0;
}

extern "C" void isaac_hud_7616ad_guard_plan(
    uint32_t r_1550, uint32_t r_1620, int32_t count,
    uint32_t field_1ef0, IsaacHud7616adPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->edge_1550 = 1; /* 0x7616a0 — unconditional in-family sample */
  out->edge_1620 = isaac_hud_7616ad_1620_edge_needed(r_1550);
  out->edge_7db0a0 = isaac_hud_7616ad_7db0a0_edge_needed(r_1550, r_1620);
  out->host_edge_count = 1 + out->edge_1620 + out->edge_7db0a0;
  out->count_open = isaac_hud_7616ad_count_open(count);
  out->slot_empty = isaac_hud_7616ad_slot_empty(field_1ef0);
  out->store_1ef0 = (out->count_open != 0 && out->slot_empty != 0) ? 1 : 0;
  out->pure_complete =
      (out->edge_7db0a0 == 0 && out->store_1ef0 == 0) ? 1 : 0;
}

extern "C" uint32_t isaac_hud_7616ad_va_case(void) {
  return ISAAC_HUD_7616AD_VA_CASE;
}
extern "C" uint32_t isaac_hud_7616ad_va_push_flag(void) {
  return ISAAC_HUD_7616AD_VA_PUSH_FLAG;
}
extern "C" uint32_t isaac_hud_7616ad_va_push_id_1550(void) {
  return ISAAC_HUD_7616AD_VA_PUSH_ID_1550;
}
extern "C" uint32_t isaac_hud_7616ad_va_mov_ecx_1550(void) {
  return ISAAC_HUD_7616AD_VA_MOV_ECX_1550;
}
extern "C" uint32_t isaac_hud_7616ad_va_call_1550(void) {
  return ISAAC_HUD_7616AD_VA_CALL_1550;
}
extern "C" uint32_t isaac_hud_7616ad_va_test_1550(void) {
  return ISAAC_HUD_7616AD_VA_TEST_1550;
}
extern "C" uint32_t isaac_hud_7616ad_va_je_merge_1550(void) {
  return ISAAC_HUD_7616AD_VA_JE_MERGE_1550;
}
extern "C" uint32_t isaac_hud_7616ad_va_push_id_1620(void) {
  return ISAAC_HUD_7616AD_VA_PUSH_ID_1620;
}
extern "C" uint32_t isaac_hud_7616ad_va_call_1620(void) {
  return ISAAC_HUD_7616AD_VA_CALL_1620;
}
extern "C" uint32_t isaac_hud_7616ad_va_test_1620(void) {
  return ISAAC_HUD_7616AD_VA_TEST_1620;
}
extern "C" uint32_t isaac_hud_7616ad_va_jne_merge_1620(void) {
  return ISAAC_HUD_7616AD_VA_JNE_MERGE_1620;
}
extern "C" uint32_t isaac_hud_7616ad_va_call_7db0a0(void) {
  return ISAAC_HUD_7616AD_VA_CALL_7DB0A0;
}
extern "C" uint32_t isaac_hud_7616ad_va_merge(void) {
  return ISAAC_HUD_7616AD_VA_MERGE;
}
extern "C" uint32_t isaac_hud_7616ad_va_count_push(void) {
  return ISAAC_HUD_7616AD_VA_COUNT_PUSH;
}
extern "C" uint32_t isaac_hud_7616ad_va_count_call(void) {
  return ISAAC_HUD_7616AD_VA_COUNT_CALL;
}
extern "C" uint32_t isaac_hud_7616ad_va_count_cmp(void) {
  return ISAAC_HUD_7616AD_VA_COUNT_CMP;
}
extern "C" uint32_t isaac_hud_7616ad_va_count_jle(void) {
  return ISAAC_HUD_7616AD_VA_COUNT_JLE;
}
extern "C" uint32_t isaac_hud_7616ad_va_1ef0_cmp(void) {
  return ISAAC_HUD_7616AD_VA_1EF0_CMP;
}
extern "C" uint32_t isaac_hud_7616ad_va_1ef0_jne(void) {
  return ISAAC_HUD_7616AD_VA_1EF0_JNE;
}
extern "C" uint32_t isaac_hud_7616ad_va_store_1ef0(void) {
  return ISAAC_HUD_7616AD_VA_STORE_1EF0;
}
extern "C" uint32_t isaac_hud_7616ad_va_tail_jump(void) {
  return ISAAC_HUD_7616AD_VA_TAIL_JUMP;
}
extern "C" uint32_t isaac_hud_7616ad_va_skip(void) {
  return ISAAC_HUD_7616AD_VA_SKIP;
}
extern "C" uint32_t isaac_hud_7616ad_va_dispatch_movzx(void) {
  return ISAAC_HUD_7616AD_VA_DISPATCH_MOVZX;
}
extern "C" uint32_t isaac_hud_7616ad_va_dispatch_jmp(void) {
  return ISAAC_HUD_7616AD_VA_DISPATCH_JMP;
}
extern "C" uint32_t isaac_hud_7616ad_dispatch_table_va(void) {
  return ISAAC_HUD_7616AD_DISPATCH_TABLE_VA;
}
extern "C" uint32_t isaac_hud_7616ad_dispatch_byte_table_va(void) {
  return ISAAC_HUD_7616AD_DISPATCH_BYTE_TABLE_VA;
}
extern "C" int32_t isaac_hud_7616ad_dispatch_case(void) {
  return ISAAC_HUD_7616AD_DISPATCH_CASE;
}
extern "C" uint32_t isaac_hud_7616ad_arg_id(void) {
  return ISAAC_HUD_7616AD_ARG_ID;
}
extern "C" uint32_t isaac_hud_7616ad_arg_flag(void) {
  return ISAAC_HUD_7616AD_ARG_FLAG;
}
extern "C" uint32_t isaac_hud_7616ad_count_id(void) {
  return ISAAC_HUD_7616AD_COUNT_ID;
}
extern "C" uint32_t isaac_hud_7616ad_off_1ef0(void) {
  return ISAAC_HUD_7616AD_OFF_1EF0;
}
extern "C" uint32_t isaac_hud_7616ad_host_771550(void) {
  return ISAAC_HUD_7616AD_HOST_771550;
}
extern "C" uint32_t isaac_hud_7616ad_host_771620(void) {
  return ISAAC_HUD_7616AD_HOST_771620;
}
extern "C" uint32_t isaac_hud_7616ad_host_7db0a0(void) {
  return ISAAC_HUD_7616AD_HOST_7DB0A0;
}
extern "C" uint32_t isaac_hud_7616ad_host_7cb6e0(void) {
  return ISAAC_HUD_7616AD_HOST_7CB6E0;
}
extern "C" int32_t isaac_hud_7616ad_stage_1550(void) {
  return ISAAC_HUD_7616AD_STAGE_1550;
}
extern "C" int32_t isaac_hud_7616ad_stage_1620(void) {
  return ISAAC_HUD_7616AD_STAGE_1620;
}
extern "C" int32_t isaac_hud_7616ad_stage_7db0a0(void) {
  return ISAAC_HUD_7616AD_STAGE_7DB0A0;
}
extern "C" int32_t isaac_hud_7616ad_stage_count(void) {
  return ISAAC_HUD_7616AD_STAGE_COUNT;
}
extern "C" int32_t isaac_hud_7616ad_stage_store(void) {
  return ISAAC_HUD_7616AD_STAGE_STORE;
}
/* ---- Helpers ABI v37: the 0x76280f caller-guard laws (the LAST
   span-A site -- the shared tail block 0x762806..0x76288b of draw span
   A) + the span-B unconditional 0x7706e0 caller-guard class; evidence:
   section-notes/hud-v37-76280f/NOTES.md; canonical dump
   section-notes/hud-v37-76280f/cpu-dump/0076280f.txt. The 0x762806
   head is the COMMON TAIL of the span-A dispatch (the v35 and v36
   blocks both jmp 0x762806): r_298 = 0x7706e0(p,0x298,0) UNCONDITIONAL
   in-family v25-v30-landed sample (0x76280f); LOW(r_298)!=0 (test
   al,al 0x762814 ; je 0x76285b) -> block: r_5b = 0x5b1500([ebp-0x1e0],
   0x40000,0) HOST (0x762825); LOW(r_5b)!=0 (0x762830 test al,al ;
   0x762832 je 0x76288b) && LOW(cl)!=0 (0x762834 test cl,cl ; 0x762836
   je 0x76288b; cl = byte [ebp-0x1c0] loaded 0x76282a AFTER the call)
   -> clamp = SIGNED max(field,0x384) (0x762843 cmp ; 0x762847 cmovl),
   OBSERVABLE [p+0x1e74]=clamp (0x762850), host 0x758a70(p,2,0,0)
   (0x762856). Merge 0x76285b re-enters the case-index dispatch
   (0x762867..0x762884); the closed-path notch 0x76288b re-joins it.
   All gates LOW-byte (uint32_t + & 0xff, v8 convention); the clamp is
   SIGNED int32; the store is observable. The span-B class: 138
   strict imm-imm unconditional 0x7706e0 sites (straight-line push
   flag / push id, flag==0 everywhere) each with a test al,al post-call
   LOW gate; kind 0 = continuation-on-open (je merge), kind 1 =
   continuation-on-closed (jne merge). Per-site table rows keep the
   byte-verified VA/id/flag/test/jcc/target. The span-B bodies stay
   host; only the per-site decision layer is landed. */

extern "C" int32_t isaac_hud_76280f_has_open(uint32_t r_298) {
  /* 0x762814 test al,al ; 0x762816 je 0x76285b -- LOW byte of the
     in-family 0x7706e0 result (0x100 CLOSED; gate A). */
  return (r_298 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_76280f_5b1500_open(uint32_t r_5b) {
  /* 0x762830 test al,al ; 0x762832 je 0x76288b -- LOW byte of the
     host 0x5b1500 result (0x100 CLOSED; gate B). */
  return (r_5b & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_76280f_arm_open(uint32_t cl) {
  /* 0x762834 test cl,cl ; 0x762836 je 0x76288b -- LOW byte of the arm
     byte [ebp-0x1c0] (0x100 CLOSED; gate C). */
  return (cl & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_76280f_clamp_1e74(int32_t field) {
  /* 0x762843 cmp eax,0x384 ; 0x762847 cmovl eax,ecx -- SIGNED max:
     field < 0x384 ? 0x384 : field on int32 (0xffffffff as -1 clamps
     UP to 0x384; 0x80000000 clamps UP; 0x1000 stays). */
  return (field < static_cast<int32_t>(ISAAC_HUD_76280F_CLAMP_MIN))
             ? static_cast<int32_t>(ISAAC_HUD_76280F_CLAMP_MIN)
             : field;
}

extern "C" int32_t isaac_hud_76280f_store_needed(uint32_t r_298,
                                                 uint32_t r_5b,
                                                 uint32_t cl) {
  /* Gates A && B && C: the OBSERVABLE [p+0x1e74]=clamp store fires
     (and the 0x758a70 edge fires, machine order store-then-call). */
  return ((r_298 & 0xffu) != 0u && (r_5b & 0xffu) != 0u &&
          (cl & 0xffu) != 0u)
             ? 1
             : 0;
}

extern "C" void isaac_hud_76280f_guard_plan(
    uint32_t r_298, uint32_t r_5b, uint32_t cl, int32_t field,
    IsaacHud76280fPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->edge_7706e0 = 1; /* the sample is the shared-tail head -- always */
  out->has_open = isaac_hud_76280f_has_open(r_298);
  out->edge_5b1500 = out->has_open; /* block's first edge */
  out->arm_open = isaac_hud_76280f_arm_open(cl);
  out->clamp_1e74 = isaac_hud_76280f_clamp_1e74(field);
  out->store_1e74 =
      (out->edge_5b1500 != 0 && isaac_hud_76280f_5b1500_open(r_5b) != 0 &&
       out->arm_open != 0)
          ? 1
          : 0;
  out->edge_758a70 = out->store_1e74;
  out->host_edge_count = out->edge_5b1500 + out->edge_758a70;
  out->pure_complete = (out->has_open == 0) ? 1 : 0;
}

extern "C" uint32_t isaac_hud_76280f_va_head(void) {
  return ISAAC_HUD_76280F_VA_HEAD;
}
extern "C" uint32_t isaac_hud_76280f_va_push_flag(void) {
  return ISAAC_HUD_76280F_VA_PUSH_FLAG;
}
extern "C" uint32_t isaac_hud_76280f_va_push_id(void) {
  return ISAAC_HUD_76280F_VA_PUSH_ID;
}
extern "C" uint32_t isaac_hud_76280f_va_mov_ecx(void) {
  return ISAAC_HUD_76280F_VA_MOV_ECX;
}
extern "C" uint32_t isaac_hud_76280f_va_call_7706e0(void) {
  return ISAAC_HUD_76280F_VA_CALL_7706E0;
}
extern "C" uint32_t isaac_hud_76280f_va_test(void) {
  return ISAAC_HUD_76280F_VA_TEST;
}
extern "C" uint32_t isaac_hud_76280f_va_je_merge(void) {
  return ISAAC_HUD_76280F_VA_JE_MERGE;
}
extern "C" uint32_t isaac_hud_76280f_va_block(void) {
  return ISAAC_HUD_76280F_VA_BLOCK;
}
extern "C" uint32_t isaac_hud_76280f_va_call_5b1500(void) {
  return ISAAC_HUD_76280F_VA_CALL_5B1500;
}
extern "C" uint32_t isaac_hud_76280f_va_test_5b(void) {
  return ISAAC_HUD_76280F_VA_TEST_5B;
}
extern "C" uint32_t isaac_hud_76280f_va_je_5b(void) {
  return ISAAC_HUD_76280F_VA_JE_5B;
}
extern "C" uint32_t isaac_hud_76280f_va_test_cl(void) {
  return ISAAC_HUD_76280F_VA_TEST_CL;
}
extern "C" uint32_t isaac_hud_76280f_va_je_cl(void) {
  return ISAAC_HUD_76280F_VA_JE_CL;
}
extern "C" uint32_t isaac_hud_76280f_va_load_1e74(void) {
  return ISAAC_HUD_76280F_VA_LOAD_1E74;
}
extern "C" uint32_t isaac_hud_76280f_va_clamp_cmp(void) {
  return ISAAC_HUD_76280F_VA_CLAMP_CMP;
}
extern "C" uint32_t isaac_hud_76280f_va_cmovl(void) {
  return ISAAC_HUD_76280F_VA_CMOVL;
}
extern "C" uint32_t isaac_hud_76280f_va_store_1e74(void) {
  return ISAAC_HUD_76280F_VA_STORE_1E74;
}
extern "C" uint32_t isaac_hud_76280f_va_call_758a70(void) {
  return ISAAC_HUD_76280F_VA_CALL_758A70;
}
extern "C" uint32_t isaac_hud_76280f_va_merge(void) {
  return ISAAC_HUD_76280F_VA_MERGE;
}
extern "C" uint32_t isaac_hud_76280f_va_merge_head(void) {
  return ISAAC_HUD_76280F_VA_MERGE_HEAD;
}
extern "C" uint32_t isaac_hud_76280f_va_dispatch_add(void) {
  return ISAAC_HUD_76280F_VA_DISPATCH_ADD;
}
extern "C" uint32_t isaac_hud_76280f_va_dispatch_cmp(void) {
  return ISAAC_HUD_76280F_VA_DISPATCH_CMP;
}
extern "C" uint32_t isaac_hud_76280f_va_dispatch_movzx(void) {
  return ISAAC_HUD_76280F_VA_DISPATCH_MOVZX;
}
extern "C" uint32_t isaac_hud_76280f_va_dispatch_jmp(void) {
  return ISAAC_HUD_76280F_VA_DISPATCH_JMP;
}
extern "C" uint32_t isaac_hud_76280f_va_notch(void) {
  return ISAAC_HUD_76280F_VA_NOTCH;
}
extern "C" uint32_t isaac_hud_76280f_dispatch_table_va(void) {
  return ISAAC_HUD_76280F_DISPATCH_TABLE_VA;
}
extern "C" uint32_t isaac_hud_76280f_dispatch_byte_table_va(void) {
  return ISAAC_HUD_76280F_DISPATCH_BYTE_TABLE_VA;
}
extern "C" uint32_t isaac_hud_76280f_arg_id(void) {
  return ISAAC_HUD_76280F_ARG_ID;
}
extern "C" uint32_t isaac_hud_76280f_arg_flag(void) {
  return ISAAC_HUD_76280F_ARG_FLAG;
}
extern "C" uint32_t isaac_hud_76280f_clamp_min(void) {
  return ISAAC_HUD_76280F_CLAMP_MIN;
}
extern "C" uint32_t isaac_hud_76280f_off_1e74(void) {
  return ISAAC_HUD_76280F_OFF_1E74;
}
extern "C" uint32_t isaac_hud_76280f_gate_5b_arg0(void) {
  return ISAAC_HUD_76280F_GATE_5B_ARG0;
}
extern "C" uint32_t isaac_hud_76280f_gate_5b_arg1(void) {
  return ISAAC_HUD_76280F_GATE_5B_ARG1;
}
extern "C" int32_t isaac_hud_76280f_call_758a70_arg0(void) {
  return ISAAC_HUD_76280F_CALL_758A70_ARG0;
}
extern "C" int32_t isaac_hud_76280f_call_758a70_arg1(void) {
  return ISAAC_HUD_76280F_CALL_758A70_ARG1;
}
extern "C" int32_t isaac_hud_76280f_call_758a70_arg2(void) {
  return ISAAC_HUD_76280F_CALL_758A70_ARG2;
}
extern "C" uint32_t isaac_hud_76280f_host_7706e0(void) {
  return ISAAC_HUD_76280F_HOST_7706E0;
}
extern "C" uint32_t isaac_hud_76280f_host_5b1500(void) {
  return ISAAC_HUD_76280F_HOST_5B1500;
}
extern "C" uint32_t isaac_hud_76280f_host_758a70(void) {
  return ISAAC_HUD_76280F_HOST_758A70;
}
extern "C" int32_t isaac_hud_76280f_stage_open(void) {
  return ISAAC_HUD_76280F_STAGE_OPEN;
}
extern "C" int32_t isaac_hud_76280f_stage_5b(void) {
  return ISAAC_HUD_76280F_STAGE_5B;
}
extern "C" int32_t isaac_hud_76280f_stage_arm(void) {
  return ISAAC_HUD_76280F_STAGE_ARM;
}
extern "C" int32_t isaac_hud_76280f_stage_store(void) {
  return ISAAC_HUD_76280F_STAGE_STORE;
}
extern "C" int32_t isaac_hud_76280f_stage_758a70(void) {
  return ISAAC_HUD_76280F_STAGE_758A70;
}

/* ---- Helpers ABI v37: span-B unconditional 0x7706e0 site table ----
   Rows from the lea-corrected image-wide census (byte-verified this
   unit); row = {va, id, flag, kind, test_va, jcc_va, tgt_va}. All
   flags are 0 (the strict imm-imm class). kind 0 = je merge
   (continuation-on-open); kind 1 = jne merge (continuation-on-closed).
   Every landed continuation contains >= 1 host E8 within 0x400 bytes. */

static const uint32_t kIsaacHudSpanbUncondSites[ISAAC_HUD_SPANB_UNCOND_COUNT][7] = {
  {0x00763714u, 0x298u, 0u, 0, 0x00763719u, 0x0076371bu, 0x0076395au},
  {0x00763967u, 0x29fu, 0u, 0, 0x00763974u, 0x00763976u, 0x00763a48u},
  {0x00763a55u, 0x2aeu, 0u, 0, 0x00763a5au, 0x00763a5cu, 0x00763b36u},
  {0x00763c99u, 0x2a6u, 0u, 0, 0x00763ca4u, 0x00763ca6u, 0x00763cb1u},
  {0x00763cb5u, 0x72u, 0u, 1, 0x00763cbau, 0x00763cbcu, 0x00763d1au},
  {0x00763d0du, 0x72u, 0u, 0, 0x00763d12u, 0x00763d14u, 0x00763e56u},
  {0x00763de1u, 0x18bu, 0u, 0, 0x00763decu, 0x00763deeu, 0x00763df6u},
  {0x00763dfau, 0x44u, 0u, 0, 0x00763e05u, 0x00763e07u, 0x00763e0fu},
  {0x00763e16u, 0x149u, 0u, 0, 0x00763e21u, 0x00763e23u, 0x00763e2bu},
  {0x00763e32u, 0xe5u, 0u, 0, 0x00763e3fu, 0x00763e41u, 0x00763e47u},
  {0x007640c6u, 0x130u, 0u, 1, 0x007640cbu, 0x007640cdu, 0x007640e1u},
  {0x00764945u, 0x258u, 0u, 0, 0x00764952u, 0x00764954u, 0x00764966u},
  {0x007649b0u, 0x197u, 0u, 0, 0x007649b5u, 0x007649b7u, 0x007649deu},
  {0x00764c4du, 0x78u, 0u, 1, 0x00764c52u, 0x00764c54u, 0x00764c67u},
  {0x00764f3bu, 0xf5u, 0u, 1, 0x00764f40u, 0x00764f42u, 0x00764ff5u},
  {0x00765002u, 0x95u, 0u, 0, 0x00765007u, 0x00765009u, 0x00765056u},
  {0x00765063u, 0x213u, 0u, 0, 0x00765068u, 0x0076506au, 0x007651beu},
  {0x00765138u, 0x76u, 0u, 0, 0x0076513du, 0x0076513fu, 0x0076514bu},
  {0x00765155u, 0x34u, 0u, 0, 0x0076515au, 0x0076515cu, 0x0076516eu},
  {0x00765286u, 0x98u, 0u, 0, 0x00765293u, 0x00765295u, 0x007652a7u},
  {0x007652cfu, 0x136u, 0u, 0, 0x007652d4u, 0x007652d6u, 0x007652f0u},
  {0x0076535fu, 0x231u, 0u, 0, 0x00765364u, 0x00765366u, 0x0076537au},
  {0x00765387u, 0x14au, 0u, 0, 0x00765394u, 0x00765396u, 0x007653a8u},
  {0x007653d0u, 0x170u, 0u, 0, 0x007653ddu, 0x007653edu, 0x00765418u},
  {0x0076551fu, 0x2b7u, 0u, 0, 0x00765524u, 0x00765526u, 0x00765580u},
  {0x0076578eu, 0x7u, 0u, 0, 0x00765793u, 0x00765795u, 0x007657a7u},
  {0x007657b1u, 0x5au, 0u, 0, 0x007657b6u, 0x007657b8u, 0x007657cau},
  {0x007657d7u, 0xd8u, 0u, 0, 0x007657dcu, 0x007657deu, 0x007657f0u},
  {0x0076583cu, 0x6du, 0u, 0, 0x00765851u, 0x00765853u, 0x0076589cu},
  {0x007658abu, 0x28eu, 0u, 0, 0x007658b0u, 0x007658b2u, 0x0076595bu},
  {0x007659e0u, 0x2ccu, 0u, 0, 0x007659e5u, 0x007659e7u, 0x00765a2fu},
  {0x007661f2u, 0x2b6u, 0u, 0, 0x007661f7u, 0x007661ffu, 0x0076621cu},
  {0x00766222u, 0x3bu, 0u, 0, 0x00766227u, 0x00766229u, 0x00766276u},
  {0x007662b3u, 0x78u, 0u, 1, 0x007662b8u, 0x007662bau, 0x007662c9u},
  {0x00766646u, 0x197u, 0u, 0, 0x0076664bu, 0x0076664du, 0x0076667eu},
  {0x00766a43u, 0x201u, 0u, 0, 0x00766a48u, 0x00766a4au, 0x00766a64u},
  {0x00766ad9u, 0x19fu, 0u, 0, 0x00766adeu, 0x00766ae0u, 0x00766b06u},
  {0x00766b0fu, 0xb6u, 0u, 0, 0x00766b14u, 0x00766b16u, 0x00766b38u},
  {0x00766b3eu, 0x3bu, 0u, 0, 0x00766b43u, 0x00766b45u, 0x00766b79u},
  {0x00766b82u, 0x23du, 0u, 1, 0x00766b87u, 0x00766b89u, 0x00766b94u},
  {0x00766bb5u, 0x1edu, 0u, 1, 0x00766bbau, 0x00766bbcu, 0x00766bceu},
  {0x00766c45u, 0x9du, 0u, 0, 0x00766c4au, 0x00766c4cu, 0x00766cc9u},
  {0x00766dc7u, 0x213u, 0u, 0, 0x00766dd4u, 0x00766dd6u, 0x00766de8u},
  {0x00766df9u, 0x95u, 0u, 0, 0x00766dfeu, 0x00766e00u, 0x00766e73u},
  {0x00766e79u, 0x4u, 0u, 1, 0x00766e7eu, 0x00766e80u, 0x00766ebau},
  {0x00766ef3u, 0x136u, 0u, 0, 0x00766ef8u, 0x00766efau, 0x00766f24u},
  {0x00766f2du, 0x231u, 0u, 0, 0x00766f32u, 0x00766f34u, 0x00766f60u},
  {0x00766f69u, 0x14au, 0u, 0, 0x00766f6eu, 0x00766f70u, 0x00766fa2u},
  {0x00766fabu, 0xf5u, 0u, 1, 0x00766fb0u, 0x00766fb2u, 0x00766fbdu},
  {0x00766ff6u, 0x175u, 0u, 0, 0x00767007u, 0x00767009u, 0x0076703bu},
  {0x007678aeu, 0x5u, 0u, 1, 0x007678b3u, 0x007678b5u, 0x007678c8u},
  {0x007678f3u, 0x95u, 0u, 0, 0x007678f8u, 0x007678fau, 0x0076790eu},
  {0x00767f3eu, 0x23cu, 0u, 0, 0x00767f43u, 0x00767f45u, 0x00767f77u},
  {0x00767f80u, 0x252u, 0u, 0, 0x00767f85u, 0x00767f87u, 0x00767fa1u},
  {0x00767faau, 0x256u, 0u, 1, 0x00767fb5u, 0x00767fb7u, 0x00767fc9u},
  {0x00767feau, 0x2ccu, 0u, 0, 0x00767fefu, 0x00767ff1u, 0x00768033u},
  {0x007681bau, 0x197u, 0u, 0, 0x007681bfu, 0x007681c1u, 0x007681f4u},
  {0x007681fdu, 0x95u, 0u, 1, 0x00768202u, 0x00768204u, 0x0076822cu},
  {0x00768269u, 0xe9u, 0u, 0, 0x0076826eu, 0x00768270u, 0x007682a2u},
  {0x007682abu, 0x133u, 0u, 1, 0x007682b0u, 0x007682b2u, 0x007682c2u},
  {0x007682e3u, 0xd6u, 0u, 1, 0x007682e8u, 0x007682eau, 0x007682fcu},
  {0x007684b0u, 0x6u, 0u, 1, 0x007684b5u, 0x007684b7u, 0x007684f9u},
  {0x00768577u, 0x5u, 0u, 1, 0x0076857cu, 0x0076857eu, 0x0076858du},
  {0x00768cddu, 0x252u, 0u, 0, 0x00768ce2u, 0x00768ce4u, 0x00768d15u},
  {0x00768d1eu, 0x2b7u, 0u, 0, 0x00768d23u, 0x00768d25u, 0x00768d79u},
  {0x00768d82u, 0x2ccu, 0u, 0, 0x00768d87u, 0x00768d89u, 0x00768dbeu},
  {0x00768f26u, 0xe6u, 0u, 0, 0x00768f2bu, 0x00768f2du, 0x00768f47u},
  {0x00768f9au, 0x82u, 0u, 1, 0x00768f9fu, 0x00768fa1u, 0x00768fb5u},
  {0x00768fe1u, 0x12bu, 0u, 1, 0x00768fe6u, 0x00768fe8u, 0x00768ff8u},
  {0x00769041u, 0x12cu, 0u, 1, 0x00769046u, 0x00769048u, 0x00769058u},
  {0x00769079u, 0x132u, 0u, 1, 0x0076907eu, 0x00769080u, 0x00769090u},
  {0x007690b1u, 0x133u, 0u, 1, 0x007690b6u, 0x007690b8u, 0x007690c8u},
  {0x007690e9u, 0x13au, 0u, 0, 0x007690eeu, 0x007690f0u, 0x0076910au},
  {0x00769113u, 0x197u, 0u, 0, 0x00769118u, 0x0076911au, 0x0076914du},
  {0x0076930fu, 0x254u, 0u, 1, 0x00769314u, 0x00769316u, 0x00769328u},
  {0x00769341u, 0x250u, 0u, 1, 0x00769346u, 0x00769348u, 0x0076935au},
  {0x00769395u, 0x23au, 0u, 0, 0x0076939au, 0x0076939cu, 0x007693aeu},
  {0x007693b7u, 0xb6u, 0u, 1, 0x007693bcu, 0x007693beu, 0x00769416u},
  {0x00769441u, 0x84u, 0u, 0, 0x00769446u, 0x00769448u, 0x00769466u},
  {0x0076946fu, 0x20cu, 0u, 0, 0x00769474u, 0x00769476u, 0x00769488u},
  {0x00769491u, 0x105u, 0u, 1, 0x00769496u, 0x00769498u, 0x007694aau},
  {0x007694c3u, 0xb9u, 0u, 1, 0x007694c8u, 0x007694cau, 0x007695ebu},
  {0x00769601u, 0x30u, 0u, 1, 0x00769606u, 0x00769608u, 0x0076966bu},
  {0x00769684u, 0xa9u, 0u, 0, 0x00769689u, 0x0076968bu, 0x007696a9u},
  {0x007696b2u, 0x131u, 0u, 1, 0x007696b7u, 0x007696b9u, 0x007696c9u},
  {0x007696dfu, 0x68u, 0u, 0, 0x007696e4u, 0x007696e6u, 0x007696f8u},
  {0x007696feu, 0x5u, 0u, 1, 0x00769703u, 0x00769705u, 0x00769714u},
  {0x00769793u, 0x95u, 0u, 0, 0x00769798u, 0x0076979au, 0x007697dfu},
  {0x007697e8u, 0xe9u, 0u, 0, 0x007697edu, 0x007697efu, 0x00769815u},
  {0x0076981eu, 0xdeu, 0u, 0, 0x00769823u, 0x00769825u, 0x0076987fu},
  {0x00769888u, 0xe0u, 0u, 0, 0x0076988du, 0x0076988fu, 0x007698a1u},
  {0x007698aau, 0xddu, 0u, 0, 0x007698afu, 0x007698b1u, 0x007698c3u},
  {0x007698ccu, 0x13bu, 0u, 0, 0x007698d1u, 0x007698d3u, 0x007698e5u},
  {0x0076990du, 0x135u, 0u, 1, 0x00769912u, 0x00769914u, 0x00769957u},
  {0x007699f5u, 0x14bu, 0u, 0, 0x007699fau, 0x007699fcu, 0x00769a0eu},
  {0x00769a17u, 0x171u, 0u, 0, 0x00769a1cu, 0x00769a1eu, 0x00769a44u},
  {0x00769a4du, 0x18du, 0u, 0, 0x00769a52u, 0x00769a54u, 0x00769a66u},
  {0x00769a6fu, 0x215u, 0u, 0, 0x00769a74u, 0x00769a76u, 0x00769a88u},
  {0x00769a91u, 0x101u, 0u, 1, 0x00769a96u, 0x00769a98u, 0x00769aaau},
  {0x00769ac3u, 0x13du, 0u, 1, 0x00769ac8u, 0x00769acau, 0x00769adcu},
  {0x00769af5u, 0x103u, 0u, 1, 0x00769afau, 0x00769afcu, 0x00769b0eu},
  {0x00769b27u, 0x1c5u, 0u, 0, 0x00769b2cu, 0x00769b2eu, 0x00769b40u},
  {0x00769b49u, 0x1ceu, 0u, 0, 0x00769b4eu, 0x00769b50u, 0x00769b76u},
  {0x00769b7fu, 0x1eeu, 0u, 0, 0x00769b84u, 0x00769b86u, 0x00769b98u},
  {0x00769ba1u, 0x214u, 0u, 0, 0x00769ba6u, 0x00769ba8u, 0x00769bbau},
  {0x00769bc3u, 0x211u, 0u, 0, 0x00769bc8u, 0x00769bcau, 0x00769bdcu},
  {0x00769be5u, 0x21cu, 0u, 0, 0x00769beau, 0x00769becu, 0x00769bfeu},
  {0x00769c07u, 0xd5u, 0u, 1, 0x00769c0cu, 0x00769c0eu, 0x00769c23u},
  {0x00769c48u, 0x1fau, 0u, 0, 0x00769c4du, 0x00769c4fu, 0x00769c61u},
  {0x00769d0fu, 0xb6u, 0u, 1, 0x00769d14u, 0x00769d16u, 0x0076a377u},
  {0x00769d6bu, 0x23cu, 0u, 1, 0x00769d70u, 0x00769d72u, 0x0076a353u},
  {0x00769dcbu, 0x67u, 0u, 1, 0x00769dd0u, 0x00769dd2u, 0x0076a32fu},
  {0x00769e68u, 0x59u, 0u, 0, 0x00769e6du, 0x00769e6fu, 0x00769e98u},
  {0x00769ea1u, 0x13bu, 0u, 1, 0x00769ea6u, 0x00769ea8u, 0x0076a232u},
  {0x00769f30u, 0x229u, 0u, 0, 0x00769f35u, 0x00769f37u, 0x00769f60u},
  {0x00769f69u, 0x1eeu, 0u, 0, 0x00769f6eu, 0x00769f70u, 0x00769fc9u},
  {0x00769fcfu, 0x6u, 0u, 1, 0x00769fd4u, 0x00769fd6u, 0x0076a308u},
  {0x0076a07au, 0x18eu, 0u, 1, 0x0076a07fu, 0x0076a081u, 0x0076a2bau},
  {0x0076a0dau, 0x231u, 0u, 0, 0x0076a0dfu, 0x0076a0e1u, 0x0076a10au},
  {0x0076a113u, 0x14au, 0u, 0, 0x0076a118u, 0x0076a11au, 0x0076a143u},
  {0x0076a14cu, 0x84u, 0u, 0, 0x0076a151u, 0x0076a153u, 0x0076a1ceu},
  {0x0076a1d7u, 0x103u, 0u, 0, 0x0076a1dcu, 0x0076a1deu, 0x0076a259u},
  {0x0076a447u, 0x13du, 0u, 1, 0x0076a44cu, 0x0076a44eu, 0x0076aa72u},
  {0x0076a504u, 0xb6u, 0u, 1, 0x0076a509u, 0x0076a50bu, 0x0076a9dau},
  {0x0076a592u, 0x68u, 0u, 0, 0x0076a597u, 0x0076a599u, 0x0076a5cdu},
  {0x0076a5d3u, 0x45u, 0u, 0, 0x0076a5d8u, 0x0076a5dau, 0x0076a61fu},
  {0x0076a625u, 0x6u, 0u, 1, 0x0076a62au, 0x0076a62cu, 0x0076a965u},
  {0x0076a6d0u, 0xddu, 0u, 0, 0x0076a6d5u, 0x0076a6d7u, 0x0076a725u},
  {0x0076a72eu, 0x150u, 0u, 0, 0x0076a733u, 0x0076a735u, 0x0076a77au},
  {0x0076a783u, 0x231u, 0u, 0, 0x0076a788u, 0x0076a78au, 0x0076a7beu},
  {0x0076a7c7u, 0x14au, 0u, 1, 0x0076a7ccu, 0x0076a7ceu, 0x0076a9dau},
  {0x0076aacau, 0x73u, 0u, 1, 0x0076aacfu, 0x0076aad1u, 0x0076ab99u},
  {0x0076e6afu, 0x184u, 0u, 0, 0x0076e6b4u, 0x0076e6b6u, 0x0076e7e4u},
  {0x0076f74cu, 0x1ecu, 0u, 0, 0x0076f751u, 0x0076f753u, 0x0076f76du},
  {0x0076fca0u, 0x22au, 0u, 0, 0x0076fca5u, 0x0076fca7u, 0x0076fd17u},
  {0x0076fd4eu, 0xdu, 0u, 0, 0x0076fd53u, 0x0076fd55u, 0x0076fd84u},
  {0x0076fd8du, 0x15eu, 0u, 0, 0x0076fd92u, 0x0076fd94u, 0x0076fe09u},
  {0x0076fffdu, 0x130u, 0u, 1, 0x00770002u, 0x00770004u, 0x00770018u}
};

extern "C" uint32_t isaac_hud_spanb_uncond_count(void) {
  return ISAAC_HUD_SPANB_UNCOND_COUNT;
}

static const uint32_t* spanb_row(uint32_t idx) {
  if (idx >= ISAAC_HUD_SPANB_UNCOND_COUNT) {
    return nullptr;
  }
  return kIsaacHudSpanbUncondSites[idx];
}

extern "C" uint32_t isaac_hud_spanb_uncond_va(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? r[0] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_uncond_id(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? r[1] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_uncond_flag(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? r[2] : 0u;
}
extern "C" int32_t isaac_hud_spanb_uncond_kind(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? static_cast<int32_t>(r[3]) : 0;
}
extern "C" uint32_t isaac_hud_spanb_uncond_test_va(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? r[4] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_uncond_jcc_va(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? r[5] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_uncond_tgt_va(uint32_t idx) {
  const uint32_t* r = spanb_row(idx);
  return r != nullptr ? r[6] : 0u;
}

extern "C" int32_t isaac_hud_spanb_sample_open(uint32_t sample) {
  /* Shared test al,al law: the sample is consumed LOW (0x100 CLOSED --
     the v31 0x771620-style sample consumption). */
  return (sample & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_spanb_continuation(int32_t kind,
                                                uint32_t sample) {
  /* kind 0 (je merge): the OPEN path falls through -> continuation on
     open; kind 1 (jne merge): the OPEN path jumps away -> continuation
     on closed. */
  const int32_t open = isaac_hud_spanb_sample_open(sample);
  if (kind == ISAAC_HUD_SPANB_GATE_KIND_CONT_ON_OPEN) {
    return open;
  }
  return open == 0 ? 1 : 0;
}

extern "C" void isaac_hud_spanb_site_plan(uint32_t idx, uint32_t sample,
                                          IsaacHudSpanbSitePlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t* r = spanb_row(idx);
  if (r == nullptr) {
    out->va = 0u;
    out->id = 0u;
    out->flag = 0u;
    out->kind = 0;
    out->sample_open = 0;
    out->continuation = 0;
    out->host_edge_count_min = 0;
    out->pure_complete = 1;
    return;
  }
  out->va = r[0];
  out->id = r[1];
  out->flag = r[2];
  out->kind = static_cast<int32_t>(r[3]);
  out->sample_open = isaac_hud_spanb_sample_open(sample);
  out->continuation =
      isaac_hud_spanb_continuation(out->kind, sample);
  out->host_edge_count_min = out->continuation != 0 ? 1 : 0;
  out->pure_complete = out->continuation != 0 ? 0 : 1;
}

extern "C" uint32_t isaac_hud_spanb_span_b_begin(void) {
  return ISAAC_HUD_SPANB_SPAN_B_BEGIN;
}
extern "C" uint32_t isaac_hud_spanb_span_b_end(void) {
  return ISAAC_HUD_SPANB_SPAN_B_END;
}
extern "C" uint32_t isaac_hud_spanb_uncond_count_const(void) {
  return ISAAC_HUD_SPANB_UNCOND_COUNT;
}
extern "C" uint32_t isaac_hud_spanb_site_row_stride(void) {
  return ISAAC_HUD_SPANB_SITE_ROW_STRIDE;
}
extern "C" int32_t isaac_hud_spanb_gate_kind_cont_on_open(void) {
  return ISAAC_HUD_SPANB_GATE_KIND_CONT_ON_OPEN;
}
extern "C" int32_t isaac_hud_spanb_gate_kind_cont_on_closed(void) {
  return ISAAC_HUD_SPANB_GATE_KIND_CONT_ON_CLOSED;
}
extern "C" int32_t isaac_hud_spanb_sample_is_low(void) {
  return ISAAC_HUD_SPANB_SAMPLE_IS_LOW;
}
extern "C" uint32_t isaac_hud_spanb_host_7706e0(void) {
  return ISAAC_HUD_SPANB_HOST_7706E0;
}

/* ---- Helpers ABI v38: span-B far-guarded 0x7706e0 site table ----
   Rows from the lea-corrected image-wide census (byte-verified this
   unit; census6-final.py in the notes dir); row = {va, id, flag,
   kind, test_va, jcc_va, tgt_va}. All flags are 0. kind 0 = je
   bypass (continuation-on-open — the OPEN path falls through into
   the call); kind 1 = jne bypass (continuation-on-closed — the
   CLOSED path falls through into the call). Every landed
   continuation contains >= 1 host E8 within 0x400 bytes (verified
   for all 67 this unit). The 18 field-cmp/test-cl-gated far rows,
   2 far-flag sites 0x763c7a / 0x763d64, 3 shared-tail sites
   0x763d2b / 0x76674b / 0x768235, the runtime-flag site 0x769cac
   and the widen outlier 0x765f8a are NOT in the table (documented
   in the header). */

static const uint32_t kIsaacHudSpanbFarSites[ISAAC_HUD_SPANB_FAR_COUNT][7] = {
  {0x00763c42u, 0x243u, 0u, 1, 0x00763c2du, 0x00763c2fu, 0x00763d1au},
  {0x00763c58u, 0x2a6u, 0u, 0, 0x00763c4fu, 0x00763c51u, 0x00763c75u},
  {0x00763ccbu, 0x213u, 0u, 1, 0x00763cbau, 0x00763cbcu, 0x00763d1au},
  {0x00763ce1u, 0xe5u, 0u, 0, 0x00763cd8u, 0x00763cdau, 0x00763d29u},
  {0x00763d41u, 0xe5u, 0u, 0, 0x00763d38u, 0x00763d3au, 0x00763d62u},
  {0x00763d7au, 0x18bu, 0u, 0, 0x00763d69u, 0x00763d6bu, 0x00763d83u},
  {0x00763ea6u, 0x76u, 0u, 0, 0x00763e94u, 0x00763e96u, 0x00763f23u},
  {0x00763ebcu, 0x18bu, 0u, 0, 0x00763eabu, 0x00763eadu, 0x00763ec5u},
  {0x00764f55u, 0x99u, 0u, 1, 0x00764f40u, 0x00764f42u, 0x00764ff5u},
  {0x00764f6fu, 0xa9u, 0u, 1, 0x00764f5au, 0x00764f5cu, 0x00764fddu},
  {0x00764f93u, 0x2u, 0u, 0, 0x00764f85u, 0x00764f87u, 0x00764fddu},
  {0x0076507du, 0x95u, 0u, 0, 0x00765068u, 0x0076506au, 0x007651beu},
  {0x00765212u, 0x76u, 0u, 0, 0x00765202u, 0x00765204u, 0x00765279u},
  {0x00765331u, 0xe5u, 0u, 0, 0x00765320u, 0x00765322u, 0x00765352u},
  {0x00765489u, 0x3bu, 0u, 0, 0x0076547bu, 0x0076547du, 0x007654eau},
  {0x00765b29u, 0x3bu, 0u, 0, 0x00765b1bu, 0x00765b1du, 0x00765b92u},
  {0x00766762u, 0x2u, 0u, 0, 0x00766750u, 0x00766752u, 0x007667d7u},
  {0x00766778u, 0x99u, 0u, 1, 0x00766767u, 0x00766769u, 0x007667c7u},
  {0x007667acu, 0xf5u, 0u, 1, 0x0076679bu, 0x0076679du, 0x007667c7u},
  {0x00766aafu, 0x72u, 0u, 0, 0x00766aa5u, 0x00766aa7u, 0x00766ad0u},
  {0x00766b50u, 0x290u, 0u, 0, 0x00766b43u, 0x00766b45u, 0x00766b79u},
  {0x00766cefu, 0x76u, 0u, 0, 0x00766ce5u, 0x00766ce7u, 0x00766d4eu},
  {0x00766d0eu, 0x149u, 0u, 0, 0x00766d01u, 0x00766d03u, 0x00766d29u},
  {0x00766d8eu, 0x76u, 0u, 0, 0x00766d84u, 0x00766d86u, 0x00766dbeu},
  {0x00766d9du, 0x44u, 0u, 0, 0x00766d93u, 0x00766d95u, 0x00766dbeu},
  {0x00766e95u, 0x7u, 0u, 0, 0x00766e8bu, 0x00766e8du, 0x00766e9eu},
  {0x00766ea4u, 0xcu, 0u, 1, 0x00766e9au, 0x00766e9cu, 0x00766ebau},
  {0x0076820fu, 0x213u, 0u, 1, 0x00768202u, 0x00768204u, 0x0076822cu},
  {0x00768221u, 0xe0u, 0u, 1, 0x00768214u, 0x00768216u, 0x0076822cu},
  {0x007684cfu, 0x1b8u, 0u, 1, 0x007684c2u, 0x007684c4u, 0x007684f9u},
  {0x00768facu, 0xb5u, 0u, 1, 0x00768f9fu, 0x00768fa1u, 0x00768fb5u},
  {0x007693c6u, 0x3u, 0u, 1, 0x007693bcu, 0x007693beu, 0x00769416u},
  {0x007693f5u, 0x14bu, 0u, 1, 0x007693e8u, 0x007693eau, 0x00769416u},
  {0x007694d6u, 0x73u, 0u, 1, 0x007694c8u, 0x007694cau, 0x007695ebu},
  {0x007694ecu, 0x9fu, 0u, 1, 0x007694dbu, 0x007694ddu, 0x007695ebu},
  {0x00769524u, 0x150u, 0u, 1, 0x00769513u, 0x00769515u, 0x007695ebu},
  {0x0076953au, 0x17bu, 0u, 1, 0x00769529u, 0x0076952bu, 0x007695ebu},
  {0x00769550u, 0x166u, 0u, 1, 0x0076953fu, 0x00769541u, 0x007695ebu},
  {0x00769613u, 0xedu, 0u, 1, 0x00769606u, 0x00769608u, 0x0076966bu},
  {0x00769635u, 0x132u, 0u, 1, 0x00769628u, 0x0076962au, 0x0076966bu},
  {0x00769662u, 0x150u, 0u, 1, 0x00769655u, 0x00769657u, 0x0076966bu},
  {0x007697b2u, 0x21cu, 0u, 0, 0x007697a5u, 0x007697a7u, 0x007697bbu},
  {0x00769857u, 0x13cu, 0u, 0, 0x0076984au, 0x0076984cu, 0x0076986fu},
  {0x00769866u, 0x45u, 0u, 1, 0x0076985cu, 0x0076985eu, 0x0076987fu},
  {0x0076994eu, 0x250u, 0u, 1, 0x00769941u, 0x00769943u, 0x00769957u},
  {0x00769cd6u, 0x95u, 0u, 1, 0x00769cc5u, 0x00769cc7u, 0x0076a39bu},
  {0x00769d95u, 0x101u, 0u, 1, 0x00769d84u, 0x00769d86u, 0x0076a353u},
  {0x00769de1u, 0x13du, 0u, 1, 0x00769dd0u, 0x00769dd2u, 0x0076a32fu},
  {0x00769df7u, 0x131u, 0u, 1, 0x00769de6u, 0x00769de8u, 0x0076a32fu},
  {0x00769e32u, 0x68u, 0u, 1, 0x00769e24u, 0x00769e26u, 0x0076a32fu},
  {0x00769ecbu, 0x191u, 0u, 1, 0x00769ebau, 0x00769ebcu, 0x0076a232u},
  {0x00769ee1u, 0x269u, 0u, 1, 0x00769ed0u, 0x00769ed2u, 0x0076a232u},
  {0x00769ef7u, 0x26au, 0u, 1, 0x00769ee6u, 0x00769ee8u, 0x0076a232u},
  {0x00769ff3u, 0x3u, 0u, 1, 0x00769fe5u, 0x00769fe7u, 0x0076a308u},
  {0x0076a0a1u, 0x45u, 0u, 1, 0x0076a093u, 0x0076a095u, 0x0076a2bau},
  {0x0076a471u, 0x101u, 0u, 1, 0x0076a460u, 0x0076a462u, 0x0076aa72u},
  {0x0076a49bu, 0x103u, 0u, 1, 0x0076a48au, 0x0076a48cu, 0x0076aa29u},
  {0x0076a4c5u, 0x95u, 0u, 1, 0x0076a4b4u, 0x0076a4b6u, 0x0076aa0cu},
  {0x0076a551u, 0x84u, 0u, 1, 0x0076a540u, 0x0076a542u, 0x0076a9a8u},
  {0x0076a649u, 0x3u, 0u, 1, 0x0076a63bu, 0x0076a63du, 0x0076a965u},
  {0x0076a7ddu, 0x18eu, 0u, 1, 0x0076a7ccu, 0x0076a7ceu, 0x0076a9dau},
  {0x0076a84bu, 0x213u, 0u, 0, 0x0076a83eu, 0x0076a840u, 0x0076a886u},
  {0x0076ab37u, 0xb9u, 0u, 1, 0x0076ab2au, 0x0076ab2cu, 0x0076ab99u},
  {0x0076ae77u, 0x279u, 0u, 1, 0x0076ae6au, 0x0076ae6cu, 0x0076ae8du},
  {0x0076df28u, 0x75u, 0u, 1, 0x0076df1eu, 0x0076df20u, 0x0076df50u},
  {0x0076e6c5u, 0x116u, 0u, 0, 0x0076e6b4u, 0x0076e6b6u, 0x0076e7e4u},
  {0x0076e6dbu, 0x90u, 0u, 0, 0x0076e6cau, 0x0076e6ccu, 0x0076e7e4u},
};

static const uint32_t* spanb_far_row(uint32_t idx) {
  if (idx >= ISAAC_HUD_SPANB_FAR_COUNT) {
    return nullptr;
  }
  return kIsaacHudSpanbFarSites[idx];
}

extern "C" uint32_t isaac_hud_spanb_far_count(void) {
  return ISAAC_HUD_SPANB_FAR_COUNT;
}

extern "C" uint32_t isaac_hud_spanb_far_va(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? r[0] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_far_id(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? r[1] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_far_flag(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? r[2] : 0u;
}
extern "C" int32_t isaac_hud_spanb_far_kind(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? static_cast<int32_t>(r[3]) : 0;
}
extern "C" uint32_t isaac_hud_spanb_far_test_va(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? r[4] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_far_jcc_va(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? r[5] : 0u;
}
extern "C" uint32_t isaac_hud_spanb_far_tgt_va(uint32_t idx) {
  const uint32_t* r = spanb_far_row(idx);
  return r != nullptr ? r[6] : 0u;
}

extern "C" int32_t isaac_hud_spanb_far_sample_open(uint32_t sample) {
  /* Far-guarded shared test al,al law: the sample is consumed LOW
     (0x100 CLOSED -- the v31 0x771620-style consumption, same as the
     v37 unconditional class). uint32_t param + low-byte mask; no
     uint8_t (v8 convention). */
  return (sample & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_hud_spanb_far_continuation(int32_t kind,
                                                    uint32_t sample) {
  /* kind 0 (je bypass): the OPEN path falls through into the call ->
     continuation on open; kind 1 (jne bypass): the OPEN path jumps
     past the call -> continuation on closed. */
  const int32_t open = isaac_hud_spanb_far_sample_open(sample);
  if (kind == ISAAC_HUD_SPANB_GATE_KIND_CONT_ON_OPEN) {
    return open;
  }
  return open == 0 ? 1 : 0;
}

extern "C" void isaac_hud_spanb_far_site_plan(uint32_t idx, uint32_t sample,
                                              IsaacHudSpanbFarSitePlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t* r = spanb_far_row(idx);
  if (r == nullptr) {
    out->va = 0u;
    out->id = 0u;
    out->flag = 0u;
    out->kind = 0;
    out->sample_open = 0;
    out->continuation = 0;
    out->host_edge_count_min = 0;
    out->pure_complete = 1;
    return;
  }
  out->va = r[0];
  out->id = r[1];
  out->flag = r[2];
  out->kind = static_cast<int32_t>(r[3]);
  out->sample_open = isaac_hud_spanb_far_sample_open(sample);
  out->continuation =
      isaac_hud_spanb_far_continuation(out->kind, sample);
  out->host_edge_count_min = out->continuation != 0 ? 1 : 0;
  out->pure_complete = out->continuation != 0 ? 0 : 1;
}

extern "C" uint32_t isaac_hud_spanb_far_count_const(void) {
  return ISAAC_HUD_SPANB_FAR_COUNT;
}
extern "C" uint32_t isaac_hud_spanb_far_site_row_stride(void) {
  return ISAAC_HUD_SPANB_FAR_ROW_STRIDE;
}
extern "C" int32_t isaac_hud_spanb_far_sample_is_low(void) {
  return ISAAC_HUD_SPANB_FAR_SAMPLE_IS_LOW;
}
extern "C" uint32_t isaac_hud_spanb_far_host_7706e0(void) {
  return ISAAC_HUD_SPANB_FAR_HOST_7706E0;
}

/* ==================================================================
   Helpers ABI v39 - span-B recorded-residual laws
   (section-notes/hud-v39-frontier/). Byte gates re-narrow & 0xff in
   the body only; no uint8_t scalar params (pointer outs stay the
   family's layout exception; none used here).
   ================================================================== */

extern "C" uint32_t isaac_hud_spanb_arg_d13(uint32_t sample) {
  /* 0x00763c5f xor ecx,ecx ; 0x00763c63 setne cl ; 0x00763c66 add ecx,0xd
     -- the LOW-byte sample gate, wide values driven by & 0xff. */
  const uint32_t bit = (sample & 0xffu) != 0u ? 1u : 0u;
  return (uint32_t)ISAAC_HUD_SPANB_ARG_D13_BASE + bit;
}
extern "C" uint32_t isaac_hud_spanb_arg_2n5(uint32_t sample) {
  /* 0x00763d48 xor ecx,ecx ; 0x00763d4c setne cl ; 0x00763d4f
     lea ecx,[ecx*2+5] */
  const uint32_t bit = (sample & 0xffu) != 0u ? 1u : 0u;
  return (uint32_t)ISAAC_HUD_SPANB_ARG_2N5_BASE +
         bit * (uint32_t)ISAAC_HUD_SPANB_ARG_2N5_OPEN_MUL;
}
extern "C" uint32_t isaac_hud_spanb_widen_byte(uint32_t sample) {
  /* 0x00765f96 movzx esi,al -- the widen outlier's widen step. */
  return sample & (uint32_t)ISAAC_HUD_SPANB_WIDEN_MASK;
}
extern "C" uint32_t isaac_hud_spanb_arg_d13_site_va(void) {
  return ISAAC_HUD_SPANB_ARG_D13_SITE_VA;
}
extern "C" uint32_t isaac_hud_spanb_arg_2n5_site_va(void) {
  return ISAAC_HUD_SPANB_ARG_2N5_SITE_VA;
}
extern "C" uint32_t isaac_hud_spanb_widen_site_va(void) {
  return ISAAC_HUD_SPANB_WIDEN_SITE_VA;
}
extern "C" int32_t isaac_hud_spanb_arg_d13_base(void) {
  return ISAAC_HUD_SPANB_ARG_D13_BASE;
}
extern "C" int32_t isaac_hud_spanb_arg_2n5_base(void) {
  return ISAAC_HUD_SPANB_ARG_2N5_BASE;
}
extern "C" int32_t isaac_hud_spanb_arg_2n5_open_mul(void) {
  return ISAAC_HUD_SPANB_ARG_2N5_OPEN_MUL;
}
extern "C" int32_t isaac_hud_spanb_widen_sum_edges(void) {
  return ISAAC_HUD_SPANB_WIDEN_SUM_EDGES;
}
extern "C" uint32_t isaac_hud_spanb_farflag_a_va(void) {
  return ISAAC_HUD_SPANB_FARFLAG_A_VA;
}
extern "C" uint32_t isaac_hud_spanb_farflag_b_va(void) {
  return ISAAC_HUD_SPANB_FARFLAG_B_VA;
}
extern "C" uint32_t isaac_hud_spanb_runtime_flag_va(void) {
  return ISAAC_HUD_SPANB_RUNTIME_FLAG_VA;
}
