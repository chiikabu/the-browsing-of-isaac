#include "playerhud_post_update_pure_helpers.h"

#include <stddef.h>

/* PlayerHUD residual FUN_00842230 pure helpers. Evidence:
   PE disassembly at VA 0x00842230 (raw 0x441630); decompile
   output/decomp/5129df723e64/update-boundaries/decompiled/00842230_FUN_00842230.c
   identify-zhl: 0x00842230 none; 0x00841e20 exact PlayerHUD::UpdateHearts;
   0x007cafe0 exact Entity_Player::GetHealthType; 0x007706e0 none (host);
   0x009588a0 exact Manager::LoadImage; 0x00407f10 exact ANM2::Reset;
   0x0040bd50 exact ANM2::Load; 0x00694fb0 exact EntityConfig::GetEntity;
   0x00740bc0 exact Game/Level::GetRoomByIdx; 0x0072fd10 exact
   ItemConfig::GetCollectible. Remaining callees address-stable.

   ABI v2: pure UpdateHearts body at 0x00841e20 (disasm section-notes/
   hud-residual-next/disasm-841e20-UpdateHearts.txt).
   ABI v3: pure book-overlay id at 0x008423e8..0x00842486 (residual
   0x0084240d); disasm section-notes/playerhud-v3/disasm-84240d-book-overlay.txt.
   ABI v4: pure cached active-id/book compare + offsets at 0x00842486
   (cmp @ 0x0084248c / book @ 0x00842a3e); LoadImage/ANM2 host.
   disasm section-notes/playerhud-v4/disasm-842486-cached-active.txt.
   ABI v5: pure ItemConfig resolve + active path kind/VA at 0x00842499;
   LoadImage/SP clear/ANM2/config-string still host.
   disasm section-notes/playerhud-v5/disasm-842499-itemcfg-path.txt.
   ABI v6: residual 0x0084250f FUN_0040c7f0 SP clear pure islands +
   LoadImage prep (skip gate / CONFIG SSO / SP pair swap). Host still owns
   alloc/virtual/callback, LoadImage body, materialize, ANM2.
   disasm section-notes/playerhud-v6/ + exit-40c7f0/disasm-40c7f0.txt.
   ABI v7: residual 0x0084298b Manager::LoadImage pure call-site args
   (path/result/materialize EBP offs + dirty + packed call plan). LoadImage
   body still host. disasm section-notes/playerhud-v7/.
   ABI v8: residual 0x00842a5b book-overlay LoadImage / SP-clear pure
   call-site plan (per-kind EBP slots + book SP + dirty). LoadImage /
   materialize / 40c7f0 bodies still host. disasm section-notes/playerhud-v8/.
   ABI v9: residual 0x00842c92 trinket-pair pure CF (mask / secondary /
   0x4b remask / cache / resolve / LoadImage call plan). GetRoomByIdx /
   LoadImage / SP::swap / FUN_009a8970 still host.
   disasm section-notes/playerhud-v9/.
   ABI v10: residual 0x00842f8a pocket/charge pure CF (clamp / type-id
   resolve / cache / GetEntity+ANM2 path plan). GetEntity / ANM2::Load /
   ANM2::Reset / pill table body still host.
   disasm section-notes/playerhud-v10/.
   ABI v20: action-id string select at 0x0084d740 (cmp ecx,0x1f; ja;
   jmp [ecx*4+0x84d828]; taken mov eax,imm; ret. Default host log
   0x00a112c0 then eax=0xb1a4ec). identify-zhl: no exact match.
   ABI v21: 2-segment SSE intersect at 0x0084d8b0 (94 insns, 0
   calls, ret 0 @ 0x84d9fe/0x84da19/0x84da1f). identify-zhl: no
   exact match.
   ABI v22: thiscall SSO-string + zero-tail init at 0x0084da20
   (23 stores, 0 calls, ret 0 @ 0x84dac2). identify-zhl: no
   exact match. Next VA 0x0084dad0.
   ABI v23: thiscall SEH ctor prefix stores at 0x0084dad0
   (SSO at +8, zeros +0x20..+0x40, byte +0x44, host
   0x6efa40 at +0x48). identify-zhl: no exact match.
   Next VA 0x0084db90.
   ABI v24: typed host plan for 4-subobject dtor chain at
   0x0084db90 (3x 0x8562b0 at +0x38/+0x2c/+0x20, e9
   0x40d040 at +8). identify-zhl: no exact match.
   Next VA 0x0084dbc0.
   ABI v25: typed host plan for 7-subobject dtor chain at
   0x0084dbc0 (6x 0x4149d0 at +0x54/+0x48/+0x3c/+0x30/
   +0x24/+0x18, e9 0x40d040 at +0). identify-zhl: no
   exact match. Next VA 0x0084dc00.
   ABI v26: typed host plan for range wipe at 0x00856840
   (ecx=begin, edx=end; empty range no-op; stride 0x68
   v22 by ref; per-object v25 0x84dbc0 offs/host VAs
   by ref). identify-zhl: no exact match. Next VA
   0x008568a0.
   ABI v27: typed host GATE/PLAN for FUN_0084dea0 /
   FUN_0084e200. Gate [this+4]==0 skip. Six host
   0x84dc00 calls; 0x84e200 xorps-neg xmm1 with
   v21 0xbacb70. 0x84dc00 stays host. Next VA
   0x0084e5b0.
   ABI v28: FUN_0084e5b0 predicate GATE/PLAN +
   pure islands. Signed /0x68 count, unsigned
   in-range, [this+4]==0 early-true. Char lists
   pure; 0x7706e0 / 0x771550 host. Next VA
   0x0084e820.
   ABI v29: FUN_0084e820 counter GATE/PLAN +
   pure islands. [this+4]==0 early-return /0x68.
   Game+0x2a448 list; 0x72fe80 / 0x72fec0 /
   0x84e5b0 stay host. Next VA 0x0084e9d0 (v19,
   done; real frontier is the v26 chain 0x008568a0).
   ABI v30: typed host COPY plan for FUN_008568a0
   (0x68 object copy-ctor). thiscall dest=ecx +
   stdcall src [ebp+8]; ret 4; eax=dest. Seven
   calls: 1x 0x40cf50 SSO-string copy-ctor
   (this=dest, arg=src) then 6x 0x43eca0 0xc-vector
   copy-ctor (this=dest+off, arg=src+off) at
   +0x18..+0x54 low-to-high (v28 vec offs by ref).
   Pure tail dwords +0x60/+0x64 (v28 completion /
   mode by ref). Not Update-wired. Next VA
   0x00856960.
   ABI v31: FUN_00856960 stdcall range move-ctor
   (0x68-object vector reallocation loop; v30's
   next). [ebp+8]=src_begin, [ebp+0xc]=src_end,
   [ebp+0x10]=dest; ret 0xc; eax=dest_end. Full-dword
   gate src_begin != src_end; stride 0x68 (v22 by
   ref); per-element thiscall move-ctor 0x856e10
   (ret 4, eax=dest). Trailing 0x856840(dest_end,
   dest_end) invariant-empty: always no-op, omitted.
   FUN_00856e10 peeled pure (0 E8, 46 stores):
   dest[0..0x68) = src[0..0x68); src reset empty
   (byte +0 = 0, +0x10 = 0, +0x14 = 0xf SSO cap,
   six 0xc triples +0x18..+0x5c zeroed, v28 vec offs
   by ref); tail +0x60/+0x64 copied, src keeps them.
   Both Not Update-wired. Next VA 0x008569a0. */
static_assert(sizeof(IsaacPlayerHud84db90Plan) == 44,
              "84db90 plan ABI changed");
static_assert(sizeof(IsaacPlayerHud84dbc0Plan) == 68,
              "84dbc0 plan ABI changed");
static_assert(sizeof(IsaacPlayerHud856840Plan) == 68,
              "856840 plan ABI changed");
static_assert(sizeof(IsaacPlayerHud8568a0CopyPlan) == 104,
              "8568a0 copy plan ABI changed");
static_assert(sizeof(IsaacPlayerHud84dea0Plan) == 112,
              "84dea0 plan ABI changed");
static_assert(sizeof(IsaacPlayerHud84e5b0Plan) == 76,
              "84e5b0 plan ABI changed");
static_assert(sizeof(IsaacPlayerHud84e820Plan) == 72,
              "84e820 plan ABI changed");
static_assert(sizeof(IsaacPlayerHudActiveCountdownState) == 16,
              "active countdown ABI changed");
static_assert(sizeof(IsaacPlayerHudTailCharCountdownState) == 3,
              "tail char countdown ABI changed");
static_assert(sizeof(IsaacPlayerHudUpdateHeartsInput) == 52,
              "UpdateHearts input ABI changed");
static_assert(sizeof(IsaacPlayerHudActiveGfxCachePlan) == 28,
              "active gfx cache plan ABI changed");
static_assert(sizeof(IsaacPlayerHudItemConfigResolve) == 12,
              "item config resolve ABI changed");
static_assert(sizeof(IsaacPlayerHudActivePathInputs) == 24,
              "active path inputs ABI changed");
static_assert(sizeof(IsaacPlayerHudActivePathPlan) == 12,
              "active path plan ABI changed");
static_assert(sizeof(IsaacPlayerHudActiveLoadImagePrep) == 40,
              "active load image prep ABI changed");
static_assert(sizeof(IsaacPlayerHudActiveLoadImageCall) == 60,
              "active load image call ABI changed");
static_assert(sizeof(IsaacPlayerHudBookLoadImageCall) == 64,
              "book load image call ABI changed");
static_assert(sizeof(IsaacPlayerHudTrinketGfxPlan) == 72,
              "trinket gfx plan ABI changed");
static_assert(sizeof(IsaacPlayerHudPocketGfxPlan) == 76,
              "pocket gfx plan ABI changed");
static_assert(sizeof(IsaacPlayerHudPocketUpgradePlan) == 124,
              "pocket upgrade plan ABI changed");
static_assert(offsetof(IsaacPlayerHudPocketUpgradePlan, branch_kind) == 0 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           resolve_table_kind) == 4 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           resolve_lookup_index) == 8 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, insert_value) == 12 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, slot_byte_off) == 16 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           array_element_dword_index) == 20 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           build_node_result_ebp_off) == 24 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           build_node_obj_ebp_off) == 28 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, list_head_ebp_off) ==
                      32 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, value_ebp_off) == 36 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, elem_ebp_off) == 40 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, virtual_ebp_off) ==
                      44 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, global_arg_ebp_off) ==
                      48 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, seh_first) == 52 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, seh_count) == 56 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, callback_count) ==
                      60 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, result_copy_off) ==
                      64 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, config_is_sso) == 68 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, config_path_ptr) ==
                      72 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           config_load_image_result_ebp_off) == 76 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, config_elem2_ebp_off) ==
                      80 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, config_value2_ebp_off) ==
                      84 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           config_virtual2_ebp_off) == 88 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           config_virtual3_ebp_off) == 92 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, host_va_build_node) ==
                      96 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, host_va_node_remove) ==
                      100 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan,
                           host_va_materialize) == 104 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, host_va_elem_init) ==
                      108 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, host_va_push_grow) ==
                      112 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, host_va_load_image) ==
                      116 &&
                  offsetof(IsaacPlayerHudPocketUpgradePlan, host_va_free) == 120,
              "pocket upgrade plan layout changed");

/* GetHealthType jump-index table for (type - 4) in 0..0x24 (PE 0x007cb02c). */
static const uint8_t kHealthTypeIndex[0x25] = {
    0, 4, 4, 4, 4, 4, 1, 4, 0, 4, 2, 4, 3, 0, 4, 4, 4, 4, 4,
    4, 0, 0, 4, 4, 4, 4, 4, 1, 4, 2, 4, 0, 0, 4, 4, 4, 1};

/* Index → health type: 0→1, 1→2, 2→3, 3→4, 4→0 (PE 0x007caffc..). */
static const int32_t kHealthTypeRet[5] = {1, 2, 3, 4, 0};

static int32_t i32_sat_nonneg(int32_t v) {
  return v < 0 ? 0 : v;
}

/* PE: and eax, 0x80000001; jns; dec; or -2; inc — signed n % 2. */
static int32_t signed_mod2(int32_t x) {
  int32_t a = static_cast<int32_t>(static_cast<uint32_t>(x) & 0x80000001u);
  if (a >= 0) {
    return a;
  }
  a = a - 1;
  a = static_cast<int32_t>(static_cast<uint32_t>(a) | 0xfffffffeu);
  return a + 1;
}

/* PE toward-zero signed /2: cdq; sub eax,edx; sar eax,1 (no prior inc). */
static int32_t signed_div2_tz(int32_t n) {
  const int32_t edx = n < 0 ? -1 : 0;
  return (n - edx) >> 1;
}

static uint32_t rol32(uint32_t x) {
  return (x << 1) | (x >> 31);
}

extern "C" void isaac_playerhud_entry_clear_heart_byte1(
    uint8_t flags[ISAAC_PLAYERHUD_HEART_SLOT_COUNT]) {
  if (flags == nullptr) {
    return;
  }
  for (int i = 0; i < ISAAC_PLAYERHUD_HEART_SLOT_COUNT; ++i) {
    flags[i] = 0;
  }
}

extern "C" void isaac_playerhud_entry_clear_heart_byte1_at(uint8_t* player_hud) {
  if (player_hud == nullptr) {
    return;
  }
  /* PE VA 0x00842290:
       lea eax, [edi+0x11]
       mov ecx, 0x18
     L: mov byte ptr [eax], 0
        lea eax, [eax+0x10]
        sub ecx, 1
        jne L
  */
  uint8_t* p = player_hud + ISAAC_PLAYERHUD_HEART_BYTE1_BASE;
  for (int i = 0; i < ISAAC_PLAYERHUD_HEART_SLOT_COUNT; ++i) {
    *p = 0;
    p += ISAAC_PLAYERHUD_HEART_STRIDE;
  }
}

extern "C" int32_t isaac_playerhud_update_hearts_uses_twin(
    uint32_t twin_ptr,
    int32_t player_type,
    int32_t field_3bc) {
  /* PE VA 0x0084229b..0x008422ba inverted: twin path when
     twin != 0 && (type == 0x10 || type == 0x11) && field_3bc == 0. */
  if (twin_ptr == 0u) {
    return 0;
  }
  if (player_type != 0x10 && player_type != 0x11) {
    return 0;
  }
  if (field_3bc != 0) {
    return 0;
  }
  return 1;
}

extern "C" void isaac_playerhud_update_hearts_call_plan(
    IsaacPlayerHudUpdateHeartsCallPlan* out,
    uint32_t twin_ptr,
    int32_t player_type,
    int32_t field_3bc) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x008422b3..0x008422ee. Gate (inverted je/jne) is exactly
     isaac_playerhud_update_hearts_uses_twin. Twin path pushes
     right-to-left: first call arg0=hud+0x10, arg1=6, arg2=player;
     second call re-reads [player+0x1d98] (0x008422ca) and pushes
     arg0=hud+0x70 (lea edx,[eax+0x6a] with eax=6), arg1=6, arg2=twin.
     Single path pushes arg0=hud+0x10, arg1=0x18, arg2=player. */
  const int32_t twin = isaac_playerhud_update_hearts_uses_twin(
      twin_ptr, player_type, field_3bc);
  out->is_twin = twin;
  if (twin != 0) {
    out->call_count = 2;
    out->calls[0].heart_slots_off = ISAAC_PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF;
    out->calls[0].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS;
    out->calls[0].arg_source = ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER;
    out->calls[1].heart_slots_off =
        ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF;
    out->calls[1].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS;
    out->calls[1].arg_source = ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_TWIN;
  } else {
    out->call_count = 1;
    out->calls[0].heart_slots_off = ISAAC_PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF;
    out->calls[0].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS;
    out->calls[0].arg_source = ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER;
    out->calls[1].heart_slots_off = 0;
    out->calls[1].max_slots = 0;
    out->calls[1].arg_source = 0;
  }
}

extern "C" int32_t isaac_playerhud_get_health_type(int32_t player_type) {
  /* Exact Entity_Player::GetHealthType @ 0x007cafe0. */
  const int32_t a = player_type - 4;
  if (static_cast<uint32_t>(a) > 0x24u) {
    return 0;
  }
  return kHealthTypeRet[kHealthTypeIndex[a]];
}

extern "C" int32_t isaac_playerhud_signed_ceil_half(int32_t value) {
  /* PE: inc eax; cdq; sub eax,edx; sar eax,1 */
  int32_t eax = value + 1;
  const int32_t edx = eax < 0 ? -1 : 0;
  eax = eax - edx;
  return eax >> 1;
}

extern "C" int32_t isaac_playerhud_update_hearts_pure(
    uint8_t* heart_slots,
    int32_t max_slots,
    const IsaacPlayerHudUpdateHeartsInput* input) {
  if (heart_slots == nullptr || input == nullptr || max_slots <= 0) {
    /* PE still early-outs on health_type==2 without needing slots; treat
       null/non-positive as no-op return 0 for freestanding safety. */
    if (input != nullptr) {
      const int32_t ht = isaac_playerhud_get_health_type(input->player_type);
      if (ht == 2) {
        return 0;
      }
    }
    return 0;
  }

  const int32_t health_type =
      isaac_playerhud_get_health_type(input->player_type);
  if (health_type == 2) {
    return 0;
  }

  int32_t containers = isaac_playerhud_signed_ceil_half(input->max_hearts);
  int32_t rotten = input->rotten_hearts;
  const int32_t broken = input->broken_hearts;
  int32_t red_rem = input->red_hearts - (rotten + rotten);
  int32_t filled = 0;
  int32_t i = 0;

  uint8_t special = 0;
  if (input->player_type == 0x16 && input->field_1ef4 > 0) {
    special = 1;
  }

  const int32_t anim_base =
      (input->has_collectible_0x26b != 0) ? 6 : 4;
  const int8_t hud_c = input->hud_char_c;
  const int8_t hud_d = input->hud_char_d;

  auto slot = [&](int32_t idx) -> uint8_t* {
    return heart_slots + static_cast<size_t>(idx) * ISAAC_PLAYERHUD_HEART_STRIDE;
  };
  auto set_path = [&](int32_t idx, uint32_t path) {
    uint8_t* s = slot(idx);
    s[8] = static_cast<uint8_t>(path);
    s[9] = static_cast<uint8_t>(path >> 8);
    s[10] = static_cast<uint8_t>(path >> 16);
    s[11] = static_cast<uint8_t>(path >> 24);
  };

  /* --- Loop 1: max-heart containers (red / rotten / empty) --- */
  if (containers > 0) {
    while (i < containers) {
      if (i >= max_slots) {
        break;
      }
      uint8_t* s = slot(i);
      s[0] = 1;
      if (special != 0) {
        const int32_t thr = anim_base >> 1;
        s[3] = (i >= thr) ? 1 : 0;
      } else {
        s[3] = 0;
      }

      if (red_rem > 0) {
        filled += 1;
        s[2] = 1;
        if (health_type == 3) {
          const uint32_t path = (red_rem <= 1)
                                    ? ISAAC_PLAYERHUD_PATH_COIN_HEART_HALF
                                    : ISAAC_PLAYERHUD_PATH_COIN_HEART_FULL;
          set_path(i, path);
          /* setle; dec; and 4 → 0 if hud_c<=0 else 4 */
          uint8_t anim = (hud_c <= 0) ? 1 : 0;
          anim = static_cast<uint8_t>(anim - 1);
          anim = static_cast<uint8_t>(anim & 4);
          s[4] = anim;
        } else {
          const uint32_t path = (red_rem <= 1)
                                    ? ISAAC_PLAYERHUD_PATH_RED_HEART_HALF
                                    : ISAAC_PLAYERHUD_PATH_RED_HEART_FULL;
          set_path(i, path);
          s[4] = (hud_c > 0) ? 1 : 0;
        }
        red_rem = i32_sat_nonneg(red_rem - 2);
      } else if (rotten > 0) {
        filled += 1;
        s[2] = 1;
        set_path(i, ISAAC_PLAYERHUD_PATH_ROTTEN_HEART_FULL);
        uint8_t anim = (hud_c <= 0) ? 1 : 0;
        anim = static_cast<uint8_t>(anim - 1);
        anim = static_cast<uint8_t>(anim & 5);
        s[4] = anim;
        rotten -= 1;
      } else {
        const uint32_t path = (health_type == 3)
                                  ? ISAAC_PLAYERHUD_PATH_COIN_EMPTY
                                  : ISAAC_PLAYERHUD_PATH_EMPTY_HEART;
        /* mov word ptr [heart+2], 0 */
        s[2] = 0;
        s[3] = 0;
        set_path(i, path);
        s[4] = 0;
      }
      i += 1;
    }
  }

  int32_t last = i32_sat_nonneg(i - 1);
  int32_t soul_rem = input->soul_hearts;
  const int32_t soul_total =
      isaac_playerhud_signed_ceil_half(input->soul_hearts) + input->bone_count;
  int32_t soul_idx = 1;
  uint32_t bone_bit = 1u;
  int32_t j = 0;
  const int32_t bone_count_gate = input->bone_count;
  const uint32_t bone_mask = static_cast<uint32_t>(input->bone_mask);
  const uint32_t black_mask = static_cast<uint32_t>(input->black_hearts_mask);

  /* --- Loop 2: soul / black / bone --- */
  if (soul_total > 0) {
    while (j < soul_total) {
      if (i >= max_slots) {
        break;
      }
      uint8_t* s = slot(i);
      filled += 1;
      s[3] = special;
      s[0] = 1;
      s[2] = 1;

      if (bone_count_gate > 0 && (bone_mask & bone_bit) != 0u) {
        if (red_rem > 0) {
          const uint32_t path = (red_rem <= 1)
                                    ? ISAAC_PLAYERHUD_PATH_BONE_HEART_HALF
                                    : ISAAC_PLAYERHUD_PATH_BONE_HEART_FULL;
          set_path(i, path);
          s[4] = (hud_c > 0) ? 1 : 0;
        } else if (rotten > 0) {
          rotten -= 1;
          set_path(i, ISAAC_PLAYERHUD_PATH_ROTTEN_BONE_HEART_FULL);
          uint8_t anim = (hud_c <= 0) ? 1 : 0;
          anim = static_cast<uint8_t>(anim - 1);
          anim = static_cast<uint8_t>(anim & 5);
          s[4] = anim;
        } else {
          set_path(i, ISAAC_PLAYERHUD_PATH_BONE_HEART_EMPTY);
          s[4] = 0;
        }
        /* last = (red_rem > 0) ? i : last; then red_rem = max(0, red_rem-2) */
        if (red_rem > 0) {
          last = i;
        }
        red_rem = i32_sat_nonneg(red_rem - 2);
      } else {
        bool drew_black = false;
        if (soul_idx <= input->soul_hearts && soul_idx >= 1) {
          if (signed_mod2(soul_idx) == 1) {
            /* PE: (soul_idx-1) toward-zero /2; shl uses cl (mask 5 bits). */
            const int32_t half = signed_div2_tz(soul_idx - 1);
            const uint32_t bit = 1u << (static_cast<uint32_t>(half) & 31u);
            if ((black_mask & bit) != 0u) {
              const uint32_t path = (soul_rem <= 1)
                                        ? ISAAC_PLAYERHUD_PATH_BLACK_HEART_HALF
                                        : ISAAC_PLAYERHUD_PATH_BLACK_HEART_FULL;
              set_path(i, path);
              uint8_t anim = (hud_d <= 0) ? 1 : 0;
              anim = static_cast<uint8_t>(anim - 1);
              anim = static_cast<uint8_t>(anim & 3);
              s[4] = anim;
              drew_black = true;
            }
          }
        }
        if (!drew_black) {
          const uint32_t path = (soul_rem <= 1)
                                    ? ISAAC_PLAYERHUD_PATH_BLUE_HEART_HALF
                                    : ISAAC_PLAYERHUD_PATH_BLUE_HEART_FULL;
          set_path(i, path);
          uint8_t anim = (hud_d <= 0) ? 1 : 0;
          anim = static_cast<uint8_t>(anim - 1);
          anim = static_cast<uint8_t>(anim & 2);
          s[4] = anim;
        }
        soul_rem = i32_sat_nonneg(soul_rem - 2);
        soul_idx = soul_idx + 2;
      }

      i += 1;
      bone_bit = rol32(bone_bit);
      j += 1;
    }
  }

  /* --- Eternal white overlay on last red container --- */
  if (input->eternal_hearts > 0) {
    uint8_t* s = slot(last);
    /* PE writes +0xc, +1, +4 only (path dword at +8 left as prior). */
    const uint32_t ov = ISAAC_PLAYERHUD_PATH_WHITE_HEART_OVERLAY;
    s[0xc] = static_cast<uint8_t>(ov);
    s[0xd] = static_cast<uint8_t>(ov >> 8);
    s[0xe] = static_cast<uint8_t>(ov >> 16);
    s[0xf] = static_cast<uint8_t>(ov >> 24);
    s[1] = 1;
    s[4] = 0;
  }

  /* --- Broken hearts --- */
  int32_t k = 0;
  while (k < broken) {
    if (i >= max_slots) {
      break;
    }
    uint8_t* s = slot(i);
    const uint32_t path = (health_type == 3)
                              ? ISAAC_PLAYERHUD_PATH_BROKEN_COIN_HEART
                              : ISAAC_PLAYERHUD_PATH_BROKEN_HEART;
    s[0] = 1;
    s[2] = 0;
    set_path(i, path);
    s[4] = 0;
    i += 1;
    k += 1;
  }

  /* --- Clear remaining present flags --- */
  while (i < max_slots) {
    slot(i)[0] = 0;
    i += 1;
  }

  /* --- PE tail: edi = filled - player+0x194c; clear heart+2 that many times --- */
  int32_t excess = filled - input->heart_icon_count;
  if (max_slots > 0 && excess > 0) {
    for (int32_t idx = 0; idx < max_slots; ++idx) {
      if (excess <= 0) {
        break;
      }
      uint8_t* s = slot(idx);
      if (s[0] != 0 && s[2] != 0) {
        s[2] = 0;
        excess -= 1;
      }
    }
  }

  return 1;
}

extern "C" int32_t isaac_playerhud_tramp_suppresses_critical_blink(
    const int32_t* types,
    const int32_t* variants,
    const int32_t* counts,
    int32_t count) {
  if (types == nullptr || variants == nullptr || counts == nullptr || count <= 0) {
    return 0;
  }
  for (int32_t i = 0; i < count; ++i) {
    const int32_t t = types[i];
    if ((t == 1 || t == 3 || t == 4) && variants[i] == 0x139) {
      if (counts[i] != 0) {
        return 1;
      }
      /* PE: match with count==0 → break (do not suppress). */
      return 0;
    }
  }
  return 0;
}

extern "C" int16_t isaac_playerhud_critical_heart_blink(
    int32_t hearts_sum,
    uint32_t player_flag_1519,
    int32_t tramp_suppress,
    int32_t frame_counter_264f8) {
  /* PE: mov word ptr [edi+0xa], 0 then optional overwrite. */
  if (hearts_sum != 1) {
    return 0;
  }
  /* PE: cmp byte [ebx+0x1519],0 — byte test, low byte masked. */
  if ((player_flag_1519 & 0xffu) == 0u) {
    if (tramp_suppress != 0) {
      return 0;
    }
  }
  /* idiv 0x2d; rem in edx; signed (toward-zero, rem sign = dividend).
     PE only skips when rem >= 10 (jge); negative rem still pulses. */
  const int32_t rem = frame_counter_264f8 % ISAAC_PLAYERHUD_CRITICAL_BLINK_MOD;
  if (rem >= ISAAC_PLAYERHUD_CRITICAL_BLINK_WINDOW) {
    return 0;
  }
  /* PE: ecx = (9 - rem) * 0xff; then signed / 9 via magic 0x38e38e39.
     Equivalent for non-negative ecx in range: ((9-rem)*255)/9. */
  const int32_t scaled = (9 - rem) * 0xff;
  /* Machine: imul 0x38e38e39; sar edx,1; add edx, (edx>>31). */
  const int64_t prod =
      static_cast<int64_t>(scaled) * static_cast<int64_t>(0x38e38e39);
  int32_t edx = static_cast<int32_t>(prod >> 32);
  edx = edx >> 1;
  const uint32_t sign = static_cast<uint32_t>(edx) >> 31;
  const int32_t word = edx + static_cast<int32_t>(sign);
  return static_cast<int16_t>(word);
}

extern "C" int32_t isaac_playerhud_active_slot_countdown_tick(
    IsaacPlayerHudActiveCountdownState* state) {
  if (state == nullptr) {
    return 0;
  }
  int32_t dirty = 0;
  for (int i = 0; i < ISAAC_PLAYERHUD_ACTIVE_SLOT_COUNT; ++i) {
    if (state->slots[i] >= 0) {
      state->slots[i] -= 1;
      dirty = 1;
    }
  }
  return dirty;
}

extern "C" int32_t isaac_playerhud_active_slot_countdown_tick_at(
    int32_t* player_hud_as_i32) {
  if (player_hud_as_i32 == nullptr) {
    return 0;
  }
  /* PE: for ecx in 0..3:
       edx = ecx*7
       eax = [edi + edx*4 + 0x1a8]
       if eax >= 0: dec; store; dirty=1
  */
  int32_t dirty = 0;
  for (int i = 0; i < ISAAC_PLAYERHUD_ACTIVE_SLOT_COUNT; ++i) {
    const int index =
        (ISAAC_PLAYERHUD_ACTIVE_COUNTDOWN_BASE / 4) + i * 7;
    int32_t v = player_hud_as_i32[index];
    if (v >= 0) {
      player_hud_as_i32[index] = v - 1;
      dirty = 1;
    }
  }
  return dirty;
}

extern "C" int32_t isaac_playerhud_active_book_overlay_id(
    int32_t slot_index,
    int32_t active_item_id,
    int32_t player_type,
    int8_t has_collectible_0x248,
    int8_t has_collectible_0x26b) {
  /* PE VA 0x008423e8..0x00842486 (slot loop residual after countdown):
       override = 0
       if slot_index != 0: skip probes → return 0
       if FUN_007706e0(0x248,0) && active != 0x248: override = 0x248
       if (type==3 || type==0xc) && FUN_007706e0(0x26b,0) && active != 0x3b:
         override = (override == 0x248) ? 0x3b : 0x22   // cmove
  */
  if (slot_index != 0) {
    return 0;
  }

  int32_t override_id = 0;
  if (has_collectible_0x248 != 0) {
    /* cmp edi, 0x248; mov ecx, 0x248; cmovne eax, ecx */
    if (active_item_id != ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES) {
      override_id = ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES;
    }
  }

  if (player_type == ISAAC_PLAYERHUD_TYPE_JUDAS ||
      player_type == ISAAC_PLAYERHUD_TYPE_DARK_JUDAS) {
    if (has_collectible_0x26b != 0) {
      if (active_item_id != ISAAC_PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL) {
        /* cmp override, 0x248; mov eax, 0x22; mov ecx, 0x3b; cmove eax, ecx */
        if (override_id == ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES) {
          override_id = ISAAC_PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL;
        } else {
          override_id = ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL;
        }
      }
    }
  }

  return override_id;
}

extern "C" uint32_t isaac_playerhud_host_va_has_collectible(void) {
  return 0x007706e0u; /* address-stable collectible-own probe; no exact ZHL */
}

extern "C" int32_t isaac_playerhud_active_slot_dword_index(int32_t slot_index) {
  /* PE VA 0x008423b0: lea edx,[ecx*8]; sub edx,ecx → slot*7. */
  return slot_index * 7;
}

extern "C" int32_t isaac_playerhud_cached_active_id_byte_offset(
    int32_t slot_index) {
  /* [edi + edx*4 + 0x190] with edx = slot*7 → 0x190 + slot*0x1c. */
  return ISAAC_PLAYERHUD_CACHED_ACTIVE_ID_BASE +
         slot_index * ISAAC_PLAYERHUD_ACTIVE_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_cached_book_overlay_byte_offset(
    int32_t slot_index) {
  /* [edi + edx*4 + 0x194] @ VA 0x00842a3e. */
  return ISAAC_PLAYERHUD_CACHED_BOOK_OVERLAY_BASE +
         slot_index * ISAAC_PLAYERHUD_ACTIVE_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_active_id_cache_changed(
    int32_t active_item_id,
    int32_t cached_active_id) {
  /* PE VA 0x0084248c: cmp esi, [edi+edx*4+0x190]; je skip_active_gfx */
  return (active_item_id != cached_active_id) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_book_overlay_cache_changed(
    int32_t book_overlay_id,
    int32_t cached_book_overlay_id) {
  /* PE VA 0x00842a3e: cmp eax, [edi+edx*4+0x194]; je skip_book_gfx */
  return (book_overlay_id != cached_book_overlay_id) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_book_overlay_path_kind(
    int32_t book_overlay_id) {
  /* PE VA 0x00842a5b..0x00842c7c after cache store:
       cmp eax, 0x248 → virtues LoadImage
       cmp eax, 0x22  → belial LoadImage
       cmp eax, 0x3b  → combined LoadImage
       else           → FUN_0040c7f0(0)
  */
  if (book_overlay_id == ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES) {
    return ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES;
  }
  if (book_overlay_id == ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL) {
    return ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL;
  }
  if (book_overlay_id == ISAAC_PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL) {
    return ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH;
  }
  return ISAAC_PLAYERHUD_BOOK_PATH_KIND_CLEAR;
}

extern "C" uint32_t isaac_playerhud_book_overlay_path_va(
    int32_t book_overlay_id) {
  switch (isaac_playerhud_book_overlay_path_kind(book_overlay_id)) {
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return ISAAC_PLAYERHUD_PATH_BOOK_OF_VIRTUES;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return ISAAC_PLAYERHUD_PATH_BOOK_OF_BELIAL;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return ISAAC_PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL;
    default:
      return 0u;
  }
}

extern "C" void isaac_playerhud_active_gfx_cache_plan(
    IsaacPlayerHudActiveGfxCachePlan* out,
    int32_t slot_index,
    int32_t active_item_id,
    int32_t cached_active_id,
    int32_t book_overlay_id,
    int32_t cached_book_overlay_id) {
  if (out == nullptr) {
    return;
  }
  out->needs_active_gfx =
      isaac_playerhud_active_id_cache_changed(active_item_id, cached_active_id);
  out->needs_book_gfx = isaac_playerhud_book_overlay_cache_changed(
      book_overlay_id, cached_book_overlay_id);
  out->book_path_kind = isaac_playerhud_book_overlay_path_kind(book_overlay_id);
  out->book_path_va = isaac_playerhud_book_overlay_path_va(book_overlay_id);
  out->slot_dword_index = isaac_playerhud_active_slot_dword_index(slot_index);
  out->cached_active_byte_off =
      isaac_playerhud_cached_active_id_byte_offset(slot_index);
  out->cached_book_byte_off =
      isaac_playerhud_cached_book_overlay_byte_offset(slot_index);
}

extern "C" int32_t isaac_playerhud_active_gfx_cache_apply_at(
    int32_t* player_hud_as_i32,
    int32_t slot_index,
    int32_t active_item_id,
    int32_t book_overlay_id) {
  if (player_hud_as_i32 == nullptr) {
    return 0;
  }
  /* dword indices: (0x190/4) + slot*7, (0x194/4) + slot*7 */
  const int32_t base_dwords = slot_index * 7;
  const int32_t active_idx =
      (ISAAC_PLAYERHUD_CACHED_ACTIVE_ID_BASE / 4) + base_dwords;
  const int32_t book_idx =
      (ISAAC_PLAYERHUD_CACHED_BOOK_OVERLAY_BASE / 4) + base_dwords;
  int32_t dirty = 0;
  if (player_hud_as_i32[active_idx] != active_item_id) {
    player_hud_as_i32[active_idx] = active_item_id;
    dirty |= 1;
  }
  if (player_hud_as_i32[book_idx] != book_overlay_id) {
    player_hud_as_i32[book_idx] = book_overlay_id;
    dirty |= 2;
  }
  return dirty;
}

extern "C" uint32_t isaac_playerhud_host_va_load_image(void) {
  return 0x009588a0u; /* exact ZHL Manager::LoadImage */
}

extern "C" uint32_t isaac_playerhud_host_va_smart_ptr_clear(void) {
  return 0x0040c7f0u; /* address-stable; KAGE smart-ptr clear path */
}

extern "C" uint32_t isaac_playerhud_host_va_item_config_get_collectible(void) {
  return 0x0072fd10u; /* exact ZHL ItemConfig::GetCollectible */
}

extern "C" int32_t isaac_playerhud_active_image_sp_byte_offset(
    int32_t slot_index) {
  /* VA 0x008424fd: add eax, 0x198; lea [eax+edx*4] with edx=slot*7. */
  return ISAAC_PLAYERHUD_ACTIVE_IMAGE_SP_BASE +
         slot_index * ISAAC_PLAYERHUD_ACTIVE_SLOT_STRIDE;
}

extern "C" void isaac_playerhud_item_config_resolve(
    IsaacPlayerHudItemConfigResolve* out,
    int32_t slot_index,
    int32_t active_item_id,
    int32_t game_present,
    int32_t game_neg_table_size,
    int32_t manager_table_size) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x00842499..0x008424f5 (after pure cache store @ 0x008424a4):
       eax = DAT_00c71678 (Game*); ecx = DAT_00c7169c (Manager*)
       if Game == 0:
         if active_id < 0: null
         else manager table[active_id]
       else if active_id < 0:
         idx = ~active_id
         if idx < 0 or idx >= game_neg_size: null
         else double-deref Game+0x67758[idx]
       else manager table[active_id]
       manager: if active_id >= manager_size: null
                else single-deref Manager+0x2a404[active_id]
  */
  out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_NULL;
  out->lookup_index = 0;
  out->active_image_sp_byte_off =
      isaac_playerhud_active_image_sp_byte_offset(slot_index);

  if (game_present == 0) {
    if (active_item_id < 0) {
      return;
    }
    if (active_item_id >= manager_table_size) {
      return;
    }
    out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER;
    out->lookup_index = active_item_id;
    return;
  }

  if (active_item_id < 0) {
    /* mov ecx, esi; not ecx; test ecx,ecx; js null */
    const int32_t idx =
        static_cast<int32_t>(~static_cast<uint32_t>(active_item_id));
    if (idx < 0) {
      return;
    }
    if (idx >= game_neg_table_size) {
      return;
    }
    out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_GAME_NEG;
    out->lookup_index = idx;
    return;
  }

  if (active_item_id >= manager_table_size) {
    return;
  }
  out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER;
  out->lookup_index = active_item_id;
}

extern "C" int32_t isaac_playerhud_active_item_path_kind(
    const IsaacPlayerHudActivePathInputs* input) {
  if (input == nullptr) {
    return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  }
  /* PE VA 0x0084251c..0x0084297d after ItemConfig non-null + SP clear.
     Special rdata paths; default copies ItemConfig_Item+0x38 (host). */
  const int32_t id = input->active_item_id;
  const int32_t slot = input->slot_index;

  if (id < 0x123) {
    if (id == 0x122) {
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x122;
    }
    /* id 0x23 special only when all player gates pass; else CONFIG. */
    if (id == 0x23) {
      if (input->player_byte_202c != 0) {
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      if (input->player_byte_20a9 != 0) {
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      if (input->player_dword_1818 < 3) {
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      if (input->player_active_charge != 1) {
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x23;
    }
    return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  }

  if (id < 0x1db) {
    if (id == 0x1da) {
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1da;
    }
    switch (id) {
      case 0x146:
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x146;
      case 0x160:
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x160;
      case 0x1a6:
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1a6;
      case 0x1b2:
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1b2;
      default:
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
    }
  }

  switch (id) {
    case 0x1df:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1df;
    case 0x1e3:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1e3;
    case 0x1e9:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1e9;
    case 0x20b:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x20b;
    case 0x280: {
      /* Judas/Dark Judas + host FUN_007706e0(0x26b) → belial urn path. */
      if ((input->player_type == ISAAC_PLAYERHUD_TYPE_JUDAS ||
           input->player_type == ISAAC_PLAYERHUD_TYPE_DARK_JUDAS) &&
          input->has_collectible_0x26b != 0) {
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL;
      }
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x280;
    }
    case 0x2ad:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2ad;
    case 0x2c6:
      /* slot == 2 → CONFIG (item+0x38); else bag path. */
      if (slot == 2) {
        return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2c6;
    case 0x2c7:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2c7;
    case 0x2d0:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2d0;
    default:
      return ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  }
}

extern "C" uint32_t isaac_playerhud_active_item_path_va(int32_t path_kind) {
  switch (path_kind) {
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x23:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x23;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x122:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x122;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x146:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x146;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x160:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x160;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1a6:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x1a6;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1b2:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x1b2;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1da:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x1da;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1df:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x1df;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1e3:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x1e3;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1e9:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x1e9;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x20b:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x20b;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x280:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x280;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x280_BELIAL;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2ad:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x2ad;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2c6:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x2c6;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2c7:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x2c7;
    case ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2d0:
      return ISAAC_PLAYERHUD_PATH_ACTIVE_0x2d0;
    default:
      return 0u; /* CONFIG */
  }
}

extern "C" void isaac_playerhud_active_item_path_plan(
    IsaacPlayerHudActivePathPlan* out,
    const IsaacPlayerHudActivePathInputs* input) {
  if (out == nullptr) {
    return;
  }
  const int32_t kind = isaac_playerhud_active_item_path_kind(input);
  out->path_kind = kind;
  out->path_va = isaac_playerhud_active_item_path_va(kind);
  out->uses_config_gfx =
      (kind == ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG) ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_active_sp_clear_arg(void) {
  /* PE VA 0x00842502: push 0 before call 0x40c7f0. */
  return 0u;
}

extern "C" uint32_t isaac_playerhud_sp_clear_alloc_size(void) {
  /* PE @ 0x0040c81a: push 0x18 before host alloc 0x00a0f4c0. */
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_SP_CLEAR_ALLOC_SIZE);
}

extern "C" int32_t isaac_playerhud_sp_clear_alloc_ok(uint32_t alloc_ptr) {
  /* PE @ 0x0040c833: test edi, edi; je null path. */
  return (alloc_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_sp_clear_old_object_present(
    uint32_t old_obj_ptr) {
  /* PE @ 0x0040c852: mov ecx,[esi+4]; test ecx; je skip virtual. */
  return (old_obj_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_sp_clear_callback_needed(
    uint32_t virtual_al,
    uint32_t global_fn) {
  /* PE @ 0x0040c860..0x0040c86b: virtual AL && DAT_00c7163c.
     `test al,al` is a byte test — widened parameter, low byte masked. */
  if ((virtual_al & 0xffu) == 0u) {
    return 0;
  }
  return (global_fn != 0u) ? 1 : 0;
}

extern "C" void isaac_playerhud_sp_clear_object_finish_apply(uint8_t* obj_base,
                                                             uint32_t arg) {
  /* PE @ 0x0040c83e..0x0040c844: *obj = 0xb1a6e0; *(obj+0x14) = arg. */
  if (obj_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(obj_base) =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_SP_CLEAR_VTABLE);
  *reinterpret_cast<uint32_t*>(obj_base + ISAAC_PLAYERHUD_SP_CLEAR_ARG_OFF) =
      arg;
}

extern "C" void isaac_playerhud_sp_clear_pair_apply_base(uint8_t* pair_base,
                                                         uint32_t arg,
                                                         uint32_t new_obj) {
  /* PE @ 0x0040c873..0x0040c875: *this = arg; this+4 = new_obj. */
  if (pair_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(pair_base + ISAAC_PLAYERHUD_SP_PAIR_VALUE_OFF) =
      arg;
  *reinterpret_cast<uint32_t*>(pair_base + ISAAC_PLAYERHUD_SP_PAIR_OBJ_OFF) =
      new_obj;
}

extern "C" uint32_t isaac_playerhud_sp_clear_vtable(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_SP_CLEAR_VTABLE);
}

extern "C" int32_t isaac_playerhud_skips_active_load_image(
    uint32_t item_entry_ptr) {
  /* PE VA 0x00842514: test edi, edi; je 0x842a25 (skip LoadImage). */
  return (item_entry_ptr == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_item_config_gfx_string_byte_offset(void) {
  return ISAAC_PLAYERHUD_ITEMCFG_GFX_STRING_OFF;
}

extern "C" int32_t isaac_playerhud_item_config_gfx_capacity_byte_offset(void) {
  return ISAAC_PLAYERHUD_ITEMCFG_GFX_CAPACITY_OFF;
}

extern "C" int32_t isaac_playerhud_config_gfx_string_is_sso(uint32_t capacity) {
  /* PE VA 0x0084295a: cmp [edi+0x4c], 0x10; jb SSO (data at +0x38). */
  return (capacity < static_cast<uint32_t>(
                         ISAAC_PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_playerhud_host_va_sp_materialize(void) {
  return 0x0040c550u; /* address-stable; no exact ZHL */
}

extern "C" void isaac_playerhud_sp_pair_swap(uint32_t* a_pair,
                                             uint32_t* b_pair) {
  /* PE VA 0x008429a3..0x008429bd: swap two 8-byte SP pairs dword-wise. */
  if (a_pair == nullptr || b_pair == nullptr) {
    return;
  }
  const uint32_t a0 = a_pair[0];
  const uint32_t a1 = a_pair[1];
  a_pair[0] = b_pair[0];
  a_pair[1] = b_pair[1];
  b_pair[0] = a0;
  b_pair[1] = a1;
}

extern "C" void isaac_playerhud_sp_pair_swap_at(uint8_t* a_base,
                                                uint8_t* b_base) {
  if (a_base == nullptr || b_base == nullptr) {
    return;
  }
  isaac_playerhud_sp_pair_swap(reinterpret_cast<uint32_t*>(a_base),
                               reinterpret_cast<uint32_t*>(b_base));
}

extern "C" void isaac_playerhud_active_load_image_prep(
    IsaacPlayerHudActiveLoadImagePrep* out,
    int32_t slot_index,
    uint32_t item_entry_ptr,
    const IsaacPlayerHudActivePathInputs* path_input,
    uint32_t config_capacity) {
  if (out == nullptr) {
    return;
  }
  /* Residual 0x0084250f after pure resolve + host table body:
       FUN_0040c7f0(PlayerHUD+0x198+slot*0x1c, 0)   // always
       if item_entry == 0: skip LoadImage
       else path plan → host path fill → LoadImage → materialize → SP swap
  */
  out->active_image_sp_byte_off =
      isaac_playerhud_active_image_sp_byte_offset(slot_index);
  out->sp_clear_arg = isaac_playerhud_active_sp_clear_arg();
  out->skips_load_image =
      isaac_playerhud_skips_active_load_image(item_entry_ptr);
  out->path_kind = ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  out->path_va = 0u;
  out->uses_config_gfx = 0;
  out->config_string_sso = 0;
  out->host_va_sp_clear = isaac_playerhud_host_va_smart_ptr_clear();
  out->host_va_load_image = isaac_playerhud_host_va_load_image();
  out->host_va_sp_materialize = isaac_playerhud_host_va_sp_materialize();

  if (out->skips_load_image != 0) {
    return;
  }

  IsaacPlayerHudActivePathPlan path;
  isaac_playerhud_active_item_path_plan(&path, path_input);
  out->path_kind = path.path_kind;
  out->path_va = path.path_va;
  out->uses_config_gfx = path.uses_config_gfx;
  if (path.uses_config_gfx != 0) {
    out->config_string_sso =
        isaac_playerhud_config_gfx_string_is_sso(config_capacity);
  }
}

extern "C" int32_t isaac_playerhud_load_image_path_buffer_ebp_off(void) {
  /* PE VA 0x0084297d: lea eax, [ebp - 0x418] → path push. */
  return ISAAC_PLAYERHUD_LOAD_IMAGE_PATH_BUF_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_load_image_result_ebp_off(void) {
  /* PE VA 0x00842984: lea eax, [ebp - 0x14a8] → LoadImage result out. */
  return ISAAC_PLAYERHUD_LOAD_IMAGE_RESULT_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_materialize_this_ebp_off(void) {
  /* PE VA 0x00842991: lea ecx, [ebp - 0x14a0] → FUN_0040c550 this. */
  return ISAAC_PLAYERHUD_MATERIALIZE_THIS_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_active_sp_saved_ebp_off(void) {
  /* PE VA 0x008429a3: mov edi, [ebp - 0x1428] (saved active SP). */
  return ISAAC_PLAYERHUD_ACTIVE_SP_SAVED_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_dirty_flag_ebp_off(void) {
  /* PE VA 0x00842a31: mov byte ptr [ebp - 0x1419], 1. */
  return ISAAC_PLAYERHUD_DIRTY_FLAG_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_load_image_result_obj_ebp_off(void) {
  /* PE VA 0x008429f4: mov ecx, [ebp - 0x14a4] (result SP obj = result+4). */
  return ISAAC_PLAYERHUD_LOAD_IMAGE_RESULT_OBJ_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_materialize_obj_ebp_off(void) {
  /* PE VA 0x008429c3: mov ecx, [ebp - 0x149c] (materialize SP obj). */
  return ISAAC_PLAYERHUD_MATERIALIZE_OBJ_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_materialize_seh_try_level(void) {
  /* PE VA 0x00842997: mov dword ptr [ebp - 4], 0. */
  return ISAAC_PLAYERHUD_MATERIALIZE_SEH_TRY_LEVEL;
}

extern "C" int32_t isaac_playerhud_active_dirty_after_gfx(void) {
  /* PE VA 0x00842a31: dirty byte = 1 on active gfx path (incl. skip). */
  return ISAAC_PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX;
}

extern "C" void isaac_playerhud_active_dirty_set(uint8_t* dirty_flag) {
  if (dirty_flag == nullptr) {
    return;
  }
  *dirty_flag = static_cast<uint8_t>(ISAAC_PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX);
}

extern "C" void isaac_playerhud_active_load_image_call(
    IsaacPlayerHudActiveLoadImageCall* out,
    int32_t slot_index,
    uint32_t item_entry_ptr,
    const IsaacPlayerHudActivePathInputs* path_input,
    uint32_t config_capacity) {
  if (out == nullptr) {
    return;
  }
  /* Residual 0x0084298b after pure prep + host path buffer fill:
       push path=[ebp-0x418]; push result=[ebp-0x14a8]
       call Manager::LoadImage          // HOST
       materialize this=[ebp-0x14a0], seh=0
       pure SP swap with *[ebp-0x1428]
       host temp teardown; dirty [ebp-0x1419]=1
  */
  out->path_buffer_ebp_off = isaac_playerhud_load_image_path_buffer_ebp_off();
  out->result_sp_ebp_off = isaac_playerhud_load_image_result_ebp_off();
  out->materialize_this_ebp_off = isaac_playerhud_materialize_this_ebp_off();
  out->active_sp_saved_ebp_off = isaac_playerhud_active_sp_saved_ebp_off();
  out->dirty_flag_ebp_off = isaac_playerhud_dirty_flag_ebp_off();
  out->materialize_seh_try_level = isaac_playerhud_materialize_seh_try_level();
  out->dirty_after = isaac_playerhud_active_dirty_after_gfx();
  out->active_image_sp_byte_off =
      isaac_playerhud_active_image_sp_byte_offset(slot_index);
  out->host_va_load_image = isaac_playerhud_host_va_load_image();
  out->host_va_sp_materialize = isaac_playerhud_host_va_sp_materialize();
  out->runs_load_image =
      (isaac_playerhud_skips_active_load_image(item_entry_ptr) == 0) ? 1 : 0;
  out->path_kind = ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  out->path_va = 0u;
  out->uses_config_gfx = 0;
  out->config_string_sso = 0;

  if (out->runs_load_image == 0) {
    return;
  }

  IsaacPlayerHudActivePathPlan path;
  isaac_playerhud_active_item_path_plan(&path, path_input);
  out->path_kind = path.path_kind;
  out->path_va = path.path_va;
  out->uses_config_gfx = path.uses_config_gfx;
  if (path.uses_config_gfx != 0) {
    out->config_string_sso =
        isaac_playerhud_config_gfx_string_is_sso(config_capacity);
  }
}

extern "C" int32_t isaac_playerhud_book_image_sp_byte_offset(
    int32_t slot_index) {
  /* PE VA 0x00842a52..0x00842a55:
       lea edi, [edi + edx*4]; add edi, 0x1a0
     edi was PlayerHUD base; edx = slot*7 → +slot*0x1c + 0x1a0. */
  return ISAAC_PLAYERHUD_BOOK_IMAGE_SP_BASE +
         slot_index * ISAAC_PLAYERHUD_ACTIVE_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_book_load_image_result_ebp_off(
    int32_t book_path_kind) {
  switch (book_path_kind) {
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_VIRTUES;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BELIAL;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BOTH;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_book_materialize_this_ebp_off(
    int32_t book_path_kind) {
  switch (book_path_kind) {
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_VIRTUES;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BELIAL;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BOTH;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_book_load_image_result_obj_ebp_off(
    int32_t book_path_kind) {
  switch (book_path_kind) {
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_VIRTUES;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BELIAL;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BOTH;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_book_materialize_obj_ebp_off(
    int32_t book_path_kind) {
  switch (book_path_kind) {
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_VIRTUES;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BELIAL;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BOTH;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_book_materialize_seh_try_level(
    int32_t book_path_kind) {
  /* PE before FUN_0040c550: mov [ebp-4], 3 / 6 / 9. */
  switch (book_path_kind) {
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_SEH_VIRTUES;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_SEH_BELIAL;
    case ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return ISAAC_PLAYERHUD_BOOK_MATERIALIZE_SEH_BOTH;
    default:
      return 0;
  }
}

extern "C" uint32_t isaac_playerhud_book_sp_clear_arg(void) {
  /* PE VA 0x00842c7c: push 0; mov ecx, edi; call 0x40c7f0. */
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_BOOK_SP_CLEAR_ARG);
}

extern "C" int32_t isaac_playerhud_book_dirty_after_gfx(void) {
  /* PE VA 0x00842c8b: mov byte ptr [ebp - 0x1419], 1. */
  return ISAAC_PLAYERHUD_BOOK_DIRTY_AFTER_GFX;
}

extern "C" void isaac_playerhud_book_load_image_call(
    IsaacPlayerHudBookLoadImageCall* out,
    int32_t slot_index,
    int32_t book_overlay_id) {
  if (out == nullptr) {
    return;
  }
  /* Residual 0x00842a5b after pure cache store at +0x194:
       book_sp = PlayerHUD + 0x1a0 + slot*0x1c
       if overlay == 0x248: LoadImage(result=ebp-0x14b8, path=virtues rdata)
                            materialize this=ebp-0x14b0 seh=3; SP swap; teardown
       else if overlay == 0x22:  LoadImage(ebp-0x14c8, belial); seh=6 …
       else if overlay == 0x3b:  LoadImage(ebp-0x14d8, both); seh=9 …
       else: FUN_0040c7f0(book_sp, 0)   // CLEAR
       dirty [ebp-0x1419] = 1
  */
  const int32_t kind = isaac_playerhud_book_overlay_path_kind(book_overlay_id);
  out->book_path_kind = kind;
  out->path_va = isaac_playerhud_book_overlay_path_va(book_overlay_id);
  out->runs_load_image =
      (kind == ISAAC_PLAYERHUD_BOOK_PATH_KIND_CLEAR) ? 0 : 1;
  out->runs_sp_clear =
      (kind == ISAAC_PLAYERHUD_BOOK_PATH_KIND_CLEAR) ? 1 : 0;
  out->book_image_sp_byte_off =
      isaac_playerhud_book_image_sp_byte_offset(slot_index);
  out->result_sp_ebp_off =
      isaac_playerhud_book_load_image_result_ebp_off(kind);
  out->materialize_this_ebp_off =
      isaac_playerhud_book_materialize_this_ebp_off(kind);
  out->result_obj_ebp_off =
      isaac_playerhud_book_load_image_result_obj_ebp_off(kind);
  out->materialize_obj_ebp_off =
      isaac_playerhud_book_materialize_obj_ebp_off(kind);
  out->materialize_seh_try_level =
      isaac_playerhud_book_materialize_seh_try_level(kind);
  out->dirty_flag_ebp_off = isaac_playerhud_dirty_flag_ebp_off();
  out->dirty_after = isaac_playerhud_book_dirty_after_gfx();
  out->host_va_load_image = isaac_playerhud_host_va_load_image();
  out->host_va_sp_materialize = isaac_playerhud_host_va_sp_materialize();
  out->host_va_sp_clear = isaac_playerhud_host_va_smart_ptr_clear();
  out->sp_clear_arg = isaac_playerhud_book_sp_clear_arg();
}

/* --- ABI v9: residual 0x00842c92 trinket-pair pure CF --- */

extern "C" int32_t isaac_playerhud_trinket_slot_count(void) {
  return ISAAC_PLAYERHUD_TRINKET_SLOT_COUNT;
}

extern "C" int32_t isaac_playerhud_cached_trinket_id_byte_offset(
    int32_t slot_index) {
  /* VA 0x00842cae: lea eax, [edi+0x204]; cache id at eax-4 = +0x200+slot*0x18 */
  return ISAAC_PLAYERHUD_CACHED_TRINKET_ID_BASE +
         slot_index * ISAAC_PLAYERHUD_TRINKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_cached_trinket_secondary_byte_offset(
    int32_t slot_index) {
  return ISAAC_PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE +
         slot_index * ISAAC_PLAYERHUD_TRINKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_trinket_image_sp_byte_offset(
    int32_t slot_index) {
  /* VA 0x00842e15: lea ecx, [esi+4] with esi = PlayerHUD+0x204+slot*0x18 */
  return ISAAC_PLAYERHUD_TRINKET_IMAGE_SP_BASE +
         slot_index * ISAAC_PLAYERHUD_TRINKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_player_trinket_id_byte_offset(
    int32_t slot_index) {
  /* VA 0x00842cbc: add edx, 0x16c0; then +4 per slot */
  return ISAAC_PLAYERHUD_PLAYER_TRINKET_ID_BASE +
         slot_index * ISAAC_PLAYERHUD_PLAYER_TRINKET_ID_STRIDE;
}

extern "C" int32_t isaac_playerhud_player_trinket_secondary_byte_offset(void) {
  /* VA 0x00842ce7: mov edi, dword ptr [edi + 0x1fb8] */
  return ISAAC_PLAYERHUD_PLAYER_TRINKET_SECONDARY;
}

extern "C" uint32_t isaac_playerhud_trinket_mask_id(uint32_t raw_trinket_id) {
  /* PE VA 0x00842cd2: and esi, 0x7fff */
  return raw_trinket_id & static_cast<uint32_t>(ISAAC_PLAYERHUD_TRINKET_ID_MASK);
}

extern "C" int32_t isaac_playerhud_trinket_secondary_id(
    int32_t cached_trinket_id,
    int32_t player_secondary_1fb8) {
  /* PE VA 0x00842cd8: cmp [eax-4], 0xa6 — uses *cached* id, not new mask. */
  if (cached_trinket_id == ISAAC_PLAYERHUD_TRINKET_TICK_CACHED_ID) {
    return player_secondary_1fb8;
  }
  return 0;
}

extern "C" int32_t isaac_playerhud_trinket_needs_room_seed_probe(
    uint32_t raw_trinket_id) {
  /* PE VA 0x00842cf1: cmp esi, 0x4b after mask — host GetRoomByIdx always. */
  return (isaac_playerhud_trinket_mask_id(raw_trinket_id) ==
          static_cast<uint32_t>(ISAAC_PLAYERHUD_TRINKET_SPECIAL_0x4b))
             ? 1
             : 0;
}

extern "C" int32_t isaac_playerhud_trinket_apply_0x4b_remask(
    int32_t masked_id,
    uint32_t room_seed) {
  /* PE VA 0x00842d0d..0x00842d40 after GetRoomByIdx:
       if (room+0x5c == 0) keep 0x4b
       else x = seed; x^=x>>2; x^=x<<7; x^=x>>0x19; id = x%0xbd + 1
  */
  if (masked_id != ISAAC_PLAYERHUD_TRINKET_SPECIAL_0x4b) {
    return masked_id;
  }
  if (room_seed == 0) {
    return ISAAC_PLAYERHUD_TRINKET_SPECIAL_0x4b;
  }
  uint32_t x = room_seed;
  x = (x >> 2) ^ x;
  x = (x << 7) ^ x;
  x = (x >> 0x19) ^ x;
  /* PE mul high of magic 0x5ac056b1 for unsigned / 0xbd. */
  const uint64_t prod =
      static_cast<uint64_t>(ISAAC_PLAYERHUD_TRINKET_0x4b_MAGIC) *
      static_cast<uint64_t>(x);
  const uint32_t hi = static_cast<uint32_t>(prod >> 32);
  uint32_t q = x - hi;
  q >>= 1;
  q += hi;
  q >>= 7;
  const uint32_t rem = x - q * static_cast<uint32_t>(ISAAC_PLAYERHUD_TRINKET_0x4b_MOD);
  return static_cast<int32_t>(rem + 1u);
}

extern "C" int32_t isaac_playerhud_trinket_cache_changed(
    int32_t masked_id,
    int32_t secondary_id,
    int32_t cached_id,
    int32_t cached_secondary) {
  /* PE VA 0x00842d53: cmp esi,[eax-4]; jne miss; cmp edi,[eax]; je hit */
  if (masked_id != cached_id) {
    return 1;
  }
  if (secondary_id != cached_secondary) {
    return 1;
  }
  return 0;
}

extern "C" void isaac_playerhud_trinket_cache_apply_at(
    uint8_t* player_hud,
    int32_t slot_index,
    int32_t masked_id,
    int32_t secondary_id) {
  if (player_hud == nullptr) {
    return;
  }
  /* PE VA 0x00842d60: mov [eax-4], esi; mov [eax], edi */
  const int32_t id_off =
      isaac_playerhud_cached_trinket_id_byte_offset(slot_index);
  const int32_t sec_off =
      isaac_playerhud_cached_trinket_secondary_byte_offset(slot_index);
  *reinterpret_cast<int32_t*>(player_hud + id_off) = masked_id;
  *reinterpret_cast<int32_t*>(player_hud + sec_off) = secondary_id;
}

extern "C" uint32_t isaac_playerhud_host_va_get_room_by_idx(void) {
  /* Exact ZHL Game/Level::GetRoomByIdx — PE call at 0x00842d05. */
  return 0x00740bc0u;
}

extern "C" uint32_t isaac_playerhud_host_va_sp_swap(void) {
  /* Exact ZHL KAGE_SmartPointer_ImageBase::swap — PE call at 0x00842e18. */
  return 0x0040c3b0u;
}

extern "C" uint32_t isaac_playerhud_host_va_dirty_notify(void) {
  /* Address-stable FUN_009a8970 — PE call at 0x00842f51 after dirty store. */
  return 0x009a8970u;
}

extern "C" int32_t isaac_playerhud_trinket_load_image_result_ebp_off(void) {
  return ISAAC_PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_trinket_load_image_result_obj_ebp_off(void) {
  return ISAAC_PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_trinket_seh_try_level(void) {
  /* PE VA 0x00842e0e: mov dword ptr [ebp-4], 0xc before swap. */
  return ISAAC_PLAYERHUD_TRINKET_SEH_TRY_LEVEL;
}

extern "C" int32_t isaac_playerhud_trinket_dirty_after_gfx(void) {
  /* PE VA 0x00842f44: mov byte ptr [ebp-0x1419], 1 on cache miss. */
  return ISAAC_PLAYERHUD_TRINKET_DIRTY_AFTER_GFX;
}

extern "C" void isaac_playerhud_trinket_gfx_plan(
    IsaacPlayerHudTrinketGfxPlan* out,
    int32_t slot_index,
    uint32_t raw_trinket_id,
    int32_t cached_id,
    int32_t cached_secondary,
    int32_t player_secondary_1fb8,
    uint32_t room_seed,
    int32_t game_present,
    int32_t game_neg_table_size,
    int32_t manager_collectible_table_size,
    int32_t manager_trinket_table_size) {
  if (out == nullptr) {
    return;
  }
  /* Residual 0x00842cd0 after active-slot dirty join 0x00842c92:
       esi = player_trinket[slot] & 0x7fff
       edi = (cached_id == 0xa6) ? player+0x1fb8 : 0
       if esi == 0x4b: host GetRoomByIdx; maybe remask from room+0x5c
       if esi != cached_id || edi != cached_secondary:
         store; resolve table; host LoadImage + swap + notify; dirty=1
  */
  const uint32_t masked_raw = isaac_playerhud_trinket_mask_id(raw_trinket_id);
  const int32_t needs_probe =
      isaac_playerhud_trinket_needs_room_seed_probe(raw_trinket_id);
  const int32_t secondary = isaac_playerhud_trinket_secondary_id(
      cached_id, player_secondary_1fb8);
  const int32_t masked = isaac_playerhud_trinket_apply_0x4b_remask(
      static_cast<int32_t>(masked_raw), room_seed);
  const int32_t needs = isaac_playerhud_trinket_cache_changed(
      masked, secondary, cached_id, cached_secondary);

  out->needs_trinket_gfx = needs;
  out->needs_room_seed_probe = needs_probe;
  out->masked_id = masked;
  out->secondary_id = secondary;
  out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_NULL;
  out->lookup_index = 0;
  out->cached_id_byte_off =
      isaac_playerhud_cached_trinket_id_byte_offset(slot_index);
  out->cached_secondary_byte_off =
      isaac_playerhud_cached_trinket_secondary_byte_offset(slot_index);
  out->trinket_image_sp_byte_off =
      isaac_playerhud_trinket_image_sp_byte_offset(slot_index);
  out->result_sp_ebp_off = isaac_playerhud_trinket_load_image_result_ebp_off();
  out->result_obj_ebp_off =
      isaac_playerhud_trinket_load_image_result_obj_ebp_off();
  out->seh_try_level = isaac_playerhud_trinket_seh_try_level();
  out->dirty_flag_ebp_off = isaac_playerhud_dirty_flag_ebp_off();
  out->dirty_after = needs ? isaac_playerhud_trinket_dirty_after_gfx() : 0;
  out->host_va_get_room_by_idx = isaac_playerhud_host_va_get_room_by_idx();
  out->host_va_load_image = isaac_playerhud_host_va_load_image();
  out->host_va_sp_swap = isaac_playerhud_host_va_sp_swap();
  out->host_va_dirty_notify = isaac_playerhud_host_va_dirty_notify();

  if (needs == 0) {
    return;
  }

  /* PE resolve after cache store (VA 0x00842d65):
       if secondary == 0: Manager trinket table[id] @ +0x2a410 (re-mask id)
       else: collectible resolve on secondary (same CF as active items)
  */
  if (secondary == 0) {
    const int32_t tid = static_cast<int32_t>(
        isaac_playerhud_trinket_mask_id(static_cast<uint32_t>(masked)));
    if (tid < manager_trinket_table_size) {
      out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER_TRINKET;
      out->lookup_index = tid;
    }
    return;
  }

  /* Collectible resolve on secondary (VA 0x00842d69..0x00842dbe). */
  if (game_present == 0) {
    if (secondary < 0) {
      return;
    }
    if (secondary >= manager_collectible_table_size) {
      return;
    }
    out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER;
    out->lookup_index = secondary;
    return;
  }
  if (secondary < 0) {
    const int32_t idx =
        static_cast<int32_t>(~static_cast<uint32_t>(secondary));
    if (idx < 0 || idx >= game_neg_table_size) {
      return;
    }
    out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_GAME_NEG;
    out->lookup_index = idx;
    return;
  }
  if (secondary >= manager_collectible_table_size) {
    return;
  }
  out->table_kind = ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER;
  out->lookup_index = secondary;
}

/* --- ABI v10: residual 0x00842f8a pocket/charge pure CF --- */

extern "C" int32_t isaac_playerhud_pocket_slot_count(void) {
  return ISAAC_PLAYERHUD_POCKET_SLOT_COUNT;
}

extern "C" int32_t isaac_playerhud_pocket_slot_stride(void) {
  return ISAAC_PLAYERHUD_POCKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_pocket_clamp_slot(int32_t slot_index) {
  /* PE VA 0x00842fa0..0x00842fb4 (type) and 0x00842fc4..0x00842fde (id):
       if slot <= 0 → 0; else if slot < 3 → slot; else → 3
     (cmovle/cmovl and jle/jl forms; equivalent for machine int32). */
  if (slot_index <= 0) {
    return 0;
  }
  if (slot_index < 3) {
    return slot_index;
  }
  return 3;
}

extern "C" int32_t isaac_playerhud_cached_pocket_type_byte_offset(
    int32_t slot_index) {
  /* VA 0x00843075: [slot*0x11c + PlayerHUD + 0x230] */
  return ISAAC_PLAYERHUD_CACHED_POCKET_TYPE_BASE +
         slot_index * ISAAC_PLAYERHUD_POCKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_cached_pocket_id_byte_offset(
    int32_t slot_index) {
  /* VA 0x0084307e: [slot*0x11c + PlayerHUD + 0x234] */
  return ISAAC_PLAYERHUD_CACHED_POCKET_ID_BASE +
         slot_index * ISAAC_PLAYERHUD_POCKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_pocket_anm2_byte_offset(int32_t slot_index) {
  /* VA 0x008430c8: lea ecx, [PlayerHUD + slot*0x11c + 0x238] */
  return ISAAC_PLAYERHUD_POCKET_ANM2_BASE +
         slot_index * ISAAC_PLAYERHUD_POCKET_SLOT_STRIDE;
}

extern "C" int32_t isaac_playerhud_player_pocket_id_byte_offset(
    int32_t slot_index) {
  /* VA 0x00842fe4: [esi + clamp*8 + 0x17a0] PocketItem._id */
  const int32_t idx = isaac_playerhud_pocket_clamp_slot(slot_index);
  return ISAAC_PLAYERHUD_PLAYER_POCKET_ID_BASE +
         idx * ISAAC_PLAYERHUD_PLAYER_POCKET_STRIDE;
}

extern "C" int32_t isaac_playerhud_player_pocket_type_byte_offset(
    int32_t slot_index) {
  /* VA 0x00842fb7: [esi + clamp*8 + 0x17a4] PocketItem._type */
  const int32_t idx = isaac_playerhud_pocket_clamp_slot(slot_index);
  return ISAAC_PLAYERHUD_PLAYER_POCKET_TYPE_BASE +
         idx * ISAAC_PLAYERHUD_PLAYER_POCKET_STRIDE;
}

extern "C" int32_t isaac_playerhud_pocket_resolved_id(
    int32_t pocket_type,
    int32_t pocket_id,
    int32_t pill_table_size,
    uint32_t pill_entry_ptr,
    int32_t pill_effect_id) {
  /* PE VA 0x00842feb..0x0084306f:
       if type == 1:
         if id < 0 → 0
         if id >= (end-begin)>>2 → 0
         if table[id] == 0 → 0
         else → *(table[id] + 0x54)   // host-supplied pill_effect_id
       else if type == 0:
         resolved = pocket_id         // cmove esi, eax
       else:
         resolved = 0
  */
  if (pocket_type == ISAAC_PLAYERHUD_POCKET_TYPE_PILL) {
    if (pocket_id < 0) {
      return 0;
    }
    if (pocket_id >= pill_table_size) {
      return 0;
    }
    if (pill_entry_ptr == 0) {
      return 0;
    }
    return pill_effect_id;
  }
  if (pocket_type == ISAAC_PLAYERHUD_POCKET_TYPE_CARD) {
    return pocket_id;
  }
  return 0;
}

extern "C" int32_t isaac_playerhud_pocket_cache_changed(
    int32_t pocket_type,
    int32_t resolved_id,
    int32_t cached_type,
    int32_t cached_id) {
  /* PE VA 0x00843075: cmp type,cached; jne miss; cmp resolved,cached_id; je hit */
  if (pocket_type != cached_type) {
    return 1;
  }
  if (resolved_id != cached_id) {
    return 1;
  }
  return 0;
}

extern "C" void isaac_playerhud_pocket_cache_apply_at(
    uint8_t* player_hud,
    int32_t slot_index,
    int32_t pocket_type,
    int32_t resolved_id) {
  if (player_hud == nullptr) {
    return;
  }
  /* PE VA 0x008430f8: mov [+0x230], type; mov [+0x234], resolved */
  const int32_t type_off =
      isaac_playerhud_cached_pocket_type_byte_offset(slot_index);
  const int32_t id_off =
      isaac_playerhud_cached_pocket_id_byte_offset(slot_index);
  *reinterpret_cast<int32_t*>(player_hud + type_off) = pocket_type;
  *reinterpret_cast<int32_t*>(player_hud + id_off) = resolved_id;
}

extern "C" int32_t isaac_playerhud_pocket_path_kind(
    int32_t pocket_type,
    int32_t resolved_id) {
  /* PE VA 0x0084308b..0x008430a4 after cache miss:
       type==1 && resolved!=0 → GetEntity(5, 0x12c, resolved)
       type==0 && resolved!=0 → GetEntity(5, 0x46, resolved)
       else → entity=0 → ANM2::Reset
  */
  if (pocket_type == ISAAC_PLAYERHUD_POCKET_TYPE_PILL && resolved_id != 0) {
    return ISAAC_PLAYERHUD_POCKET_PATH_KIND_PILL;
  }
  if (pocket_type == ISAAC_PLAYERHUD_POCKET_TYPE_CARD && resolved_id != 0) {
    return ISAAC_PLAYERHUD_POCKET_PATH_KIND_CARD;
  }
  return ISAAC_PLAYERHUD_POCKET_PATH_KIND_RESET;
}

extern "C" uint32_t isaac_playerhud_host_va_get_entity(void) {
  /* Exact ZHL EntityConfig::GetEntity — PE call at 0x008430b7. */
  return 0x00694fb0u;
}

extern "C" uint32_t isaac_playerhud_host_va_anm2_load(void) {
  /* Exact ZHL ANM2::Load — PE call at 0x008430da. */
  return 0x0040bd50u;
}

extern "C" uint32_t isaac_playerhud_host_va_anm2_reset(void) {
  /* Exact ZHL ANM2::Reset — PE call at 0x008430e1. */
  return 0x00407f10u;
}

extern "C" int32_t isaac_playerhud_get_entity_type(void) {
  return ISAAC_PLAYERHUD_GET_ENTITY_TYPE;
}

extern "C" int32_t isaac_playerhud_get_entity_variant_card(void) {
  return ISAAC_PLAYERHUD_GET_ENTITY_VARIANT_CARD;
}

extern "C" int32_t isaac_playerhud_get_entity_variant_pill(void) {
  return ISAAC_PLAYERHUD_GET_ENTITY_VARIANT_PILL;
}

extern "C" int32_t isaac_playerhud_manager_entity_config_byte_offset(void) {
  return ISAAC_PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF;
}

extern "C" int32_t isaac_playerhud_entity_anm_path_byte_offset(void) {
  return ISAAC_PLAYERHUD_ENTITY_ANM_PATH_OFF;
}

extern "C" int32_t isaac_playerhud_anm2_load_graphics(void) {
  return ISAAC_PLAYERHUD_ANM2_LOAD_GRAPHICS;
}

extern "C" void isaac_playerhud_pocket_gfx_plan(
    IsaacPlayerHudPocketGfxPlan* out,
    int32_t slot_index,
    int32_t pocket_type,
    int32_t pocket_id,
    int32_t cached_type,
    int32_t cached_id,
    int32_t pill_table_size,
    uint32_t pill_entry_ptr,
    int32_t pill_effect_id) {
  if (out == nullptr) {
    return;
  }
  /* Residual 0x00842f8a after trinket loop exit:
       clamp = clamp(slot, 0, 3)
       type = player[clamp]._type @ +0x17a4
       id   = player[clamp]._id   @ +0x17a0
       resolved = pill table CF or card id or 0
       if type != cached[+0x230] || resolved != cached[+0x234]:
         GetEntity / ANM2::Load or ANM2::Reset; store cache
  */
  const int32_t player_slot = isaac_playerhud_pocket_clamp_slot(slot_index);
  const int32_t resolved = isaac_playerhud_pocket_resolved_id(
      pocket_type, pocket_id, pill_table_size, pill_entry_ptr, pill_effect_id);
  const int32_t needs = isaac_playerhud_pocket_cache_changed(
      pocket_type, resolved, cached_type, cached_id);
  const int32_t path =
      needs ? isaac_playerhud_pocket_path_kind(pocket_type, resolved)
            : ISAAC_PLAYERHUD_POCKET_PATH_KIND_RESET;

  out->needs_pocket_gfx = needs;
  out->pocket_type = pocket_type;
  out->resolved_id = resolved;
  out->player_slot_index = player_slot;
  out->cached_type_byte_off =
      isaac_playerhud_cached_pocket_type_byte_offset(slot_index);
  out->cached_id_byte_off =
      isaac_playerhud_cached_pocket_id_byte_offset(slot_index);
  out->anm2_byte_off = isaac_playerhud_pocket_anm2_byte_offset(slot_index);
  out->host_path_kind = path;
  out->get_entity_type = 0;
  out->get_entity_variant = 0;
  out->get_entity_subtype = 0;
  out->manager_entity_config_off =
      isaac_playerhud_manager_entity_config_byte_offset();
  out->entity_anm_path_off = isaac_playerhud_entity_anm_path_byte_offset();
  out->anm2_load_graphics = isaac_playerhud_anm2_load_graphics();
  out->needs_pill_table_probe =
      (pocket_type == ISAAC_PLAYERHUD_POCKET_TYPE_PILL) ? 1 : 0;
  out->pill_table_lookup_index =
      (pocket_type == ISAAC_PLAYERHUD_POCKET_TYPE_PILL) ? pocket_id : 0;
  out->host_va_get_entity = isaac_playerhud_host_va_get_entity();
  out->host_va_anm2_load = isaac_playerhud_host_va_anm2_load();
  out->host_va_anm2_reset = isaac_playerhud_host_va_anm2_reset();

  if (needs == 0) {
    return;
  }
  if (path == ISAAC_PLAYERHUD_POCKET_PATH_KIND_CARD) {
    out->get_entity_type = isaac_playerhud_get_entity_type();
    out->get_entity_variant = isaac_playerhud_get_entity_variant_card();
    out->get_entity_subtype = resolved;
    return;
  }
  if (path == ISAAC_PLAYERHUD_POCKET_PATH_KIND_PILL) {
    out->get_entity_type = isaac_playerhud_get_entity_type();
    out->get_entity_variant = isaac_playerhud_get_entity_variant_pill();
    out->get_entity_subtype = resolved;
  }
}

extern "C" void isaac_playerhud_tail_float_step(
    float* value_6b8,
    int32_t predicate_true) {
  if (value_6b8 == nullptr) {
    return;
  }
  const float step = __builtin_bit_cast(float, ISAAC_PLAYERHUD_F32_STEP_0_25_BITS);
  const float zero = __builtin_bit_cast(float, ISAAC_PLAYERHUD_F32_ZERO_BITS);
  const float one = __builtin_bit_cast(float, ISAAC_PLAYERHUD_F32_ONE_BITS);
  float f = *value_6b8;
  if (predicate_true != 0) {
    /* PE 0x00843bc3: addss xmm0,step ; 0x00843bcb: minss xmm0,one.  SSE
       MINSS returns the SECOND operand when the first is NaN (or when
       both are 0.0s), so a NaN result clamps to 1.0 — a compare-based
       port would keep the NaN (v15 re-transcription; mutation-pinned). */
    f = f + step;
    *value_6b8 = (f != f || f > one) ? one : f;
  } else {
    /* PE 0x00843bd5: subss xmm0,step ; 0x00843bdd: maxss xmm0,zero —
       NaN clamps to 0.0; -0.0 vs +0.0 returns the second (+0.0). */
    f = f - step;
    *value_6b8 = (f != f || f < zero) ? zero : f;
  }
}

extern "C" void isaac_playerhud_tail_char_countdown(
    IsaacPlayerHudTailCharCountdownState* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: test al,al; jle skip; dec al — signed char > 0. */
  if (state->c0 > 0) {
    state->c0 = static_cast<int8_t>(state->c0 - 1);
  }
  if (state->c1 > 0) {
    state->c1 = static_cast<int8_t>(state->c1 - 1);
  }
  if (state->c2 > 0) {
    state->c2 = static_cast<int8_t>(state->c2 - 1);
  }
}

extern "C" void isaac_playerhud_tail_char_countdown_at(uint8_t* player_hud) {
  if (player_hud == nullptr) {
    return;
  }
  int8_t* c0 = reinterpret_cast<int8_t*>(player_hud + ISAAC_PLAYERHUD_TAIL_CHAR0_OFFSET);
  int8_t* c1 = reinterpret_cast<int8_t*>(player_hud + ISAAC_PLAYERHUD_TAIL_CHAR1_OFFSET);
  int8_t* c2 = reinterpret_cast<int8_t*>(player_hud + ISAAC_PLAYERHUD_TAIL_CHAR2_OFFSET);
  if (*c0 > 0) {
    *c0 = static_cast<int8_t>(*c0 - 1);
  }
  if (*c1 > 0) {
    *c1 = static_cast<int8_t>(*c1 - 1);
  }
  if (*c2 > 0) {
    *c2 = static_cast<int8_t>(*c2 - 1);
  }
}

/* ---- P5: residual after the pocket loop (VA 0x00843116), ABI v11 ---- */

extern "C" int32_t isaac_playerhud_p5_block_needed(uint32_t enable_6ac,
                                                   int32_t char_type_13c0) {
  /* PE 0x0084311c: cmp byte [esi+0x6ac],0 ; je 0x00843af1 — byte test, so
     mask explicitly (the parameter is wider than the PE slot on purpose). */
  if ((enable_6ac & 0xffu) == 0u) {
    return 0;
  }
  /* PE 0x0084312f: cmp dword [ecx+0x13c0],0x15 ; jne 0x00843667 */
  if (char_type_13c0 != ISAAC_PLAYERHUD_P5_CHAR_TYPE_MATCH) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_playerhud_p5_skip_va(uint32_t enable_6ac,
                                               int32_t char_type_13c0) {
  /* The enable byte is tested first, so its skip target wins. */
  if ((enable_6ac & 0xffu) == 0u) {
    return static_cast<uint32_t>(ISAAC_PLAYERHUD_P5_SKIP_VA_DISABLED);
  }
  if (char_type_13c0 != ISAAC_PLAYERHUD_P5_CHAR_TYPE_MATCH) {
    return static_cast<uint32_t>(ISAAC_PLAYERHUD_P5_SKIP_VA_WRONG_CHAR);
  }
  return 0u;
}

extern "C" int32_t isaac_playerhud_p5_node_flag_word(void) {
  return ISAAC_PLAYERHUD_P5_NODE_FLAG_WORD;
}

extern "C" uint32_t isaac_playerhud_p5_node_self_ptr(uint32_t node_base,
                                                     int32_t slot_offset) {
  /* PE 0x0084315a..0x0084315f: mov [eax],eax ; mov [eax+4],eax ;
     mov [eax+8],eax — every self-pointer slot receives the node address. */
  if (slot_offset != 0 && slot_offset != 4 && slot_offset != 8) {
    return 0u;
  }
  return node_base;
}

extern "C" int32_t isaac_playerhud_p5_walk_terminates(uint32_t cursor,
                                                      uint32_t end) {
  const int32_t span = static_cast<int32_t>(end - cursor);
  if (span < 0) {
    return 0;
  }
  return (span % ISAAC_PLAYERHUD_P5_WALK_STRIDE) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_p5_walk_steps(uint32_t cursor,
                                                 uint32_t end) {
  if (isaac_playerhud_p5_walk_terminates(cursor, end) == 0) {
    return -1;
  }
  const int32_t span = static_cast<int32_t>(end - cursor);
  return span / ISAAC_PLAYERHUD_P5_WALK_STRIDE;
}

extern "C" int32_t isaac_playerhud_p5_slot_needs_insert(int32_t slot_value) {
  /* PE 0x008431ed: test eax,eax ; jns 0x0084327d — sign bit only. */
  return slot_value < 0 ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_p5_slot_byte_offset(int32_t index) {
  const uint32_t off =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_P5_OFF_SLOT_BASE_1E00) +
      static_cast<uint32_t>(index) *
          static_cast<uint32_t>(ISAAC_PLAYERHUD_P5_SLOT_STRIDE);
  return static_cast<int32_t>(off);
}

extern "C" int32_t isaac_playerhud_p5_push_needs_grow(uint32_t list_end,
                                                      uint32_t list_cap) {
  /* PE 0x00843213: cmp ecx, [edi+8] ; je 0x00843235 (host grow). */
  return list_end == list_cap ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_p5_push_advance(uint32_t list_end) {
  /* PE 0x0084322f: add dword [edi+4], 0xc */
  return list_end + static_cast<uint32_t>(ISAAC_PLAYERHUD_P5_ELEM_STRIDE);
}


/* ---- P6 pocket-upgrade residual (VA 0x0084327d..0x008435ed), ABI v13 ----
   The 16-slot pocket loop (head 0x008431e0, tail 0x008435ed..0x008435fd)
   branches on the sign of player[0x1e00+i*4]: negative slots take the
   v11 P5E insert, non-negative slots take this upgrade path. The upgrade
   path resolves an ItemConfig entry, calls 0x4288a0 (host), then chooses
   RESULT / NEG / CONFIG. All bodies stay host; this unit peels the
   surrounding control flow and the packed frame plan. */

extern "C" int32_t isaac_playerhud_pocket_upgrade_slot_count(void) {
  /* PE 0x008435fa: cmp eax,0x10 ; jb 0x008431e0 — unsigned, 16 slots. */
  return ISAAC_PLAYERHUD_P6_SLOT_COUNT;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_slot_byte_offset(
    int32_t slot_index) {
  /* PE 0x008431e6: mov eax, [edx + eax*4 + 0x1e00] — 32-bit wrap. */
  const uint32_t off =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_P6_SLOT_BASE) +
      static_cast<uint32_t>(slot_index) *
          static_cast<uint32_t>(ISAAC_PLAYERHUD_P6_SLOT_STRIDE);
  return static_cast<int32_t>(off);
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_slot_is_upgrade(
    int32_t slot_value) {
  /* PE 0x008431ed: test eax,eax ; jns 0x0084327d — sign bit only. */
  return slot_value >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_array_ptr_byte_offset(void) {
  /* PE 0x00843286: mov eax, [edx + 0x1dec] — pointer to the 0x1c-stride
     collectible array. */
  return ISAAC_PLAYERHUD_P6_ARRAY_PTR_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_array_element_dword_index(
    int32_t slot_index) {
  /* PE 0x0084327d..0x00843284: lea ecx,[eax*8] ; sub ecx,eax → slot*7;
     0x0084329e: mov esi, [eax + ecx*4 + 8] → element slot*7+2. */
  const int32_t seven =
      static_cast<int32_t>(static_cast<uint32_t>(slot_index) * 7u);
  return static_cast<int32_t>(static_cast<uint32_t>(seven) +
                              static_cast<uint32_t>(ISAAC_PLAYERHUD_P6_ARRAY_ID_ELEM));
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_array_id_byte_offset(
    int32_t slot_index) {
  return static_cast<int32_t>(
      static_cast<uint32_t>(
          isaac_playerhud_pocket_upgrade_array_element_dword_index(slot_index)) *
      4u);
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_resolve_kind(
    int32_t game_present, int32_t id, int32_t game_neg_table_size,
    int32_t manager_table_size) {
  /* PE 0x008432a2..0x008432fb. Sign decisions:
       id >= 0        → manager table; SKIP when id >= size (jge).
       id < 0, Game 0 → SKIP directly (js 0x008435ed).
       id < 0, Game !0 → nid = ~id; SKIP when nid < 0 (js, unreachable for
       id<0 but modeled) or nid >= neg size (jge, signed). */
  if (id >= 0) {
    if (id < manager_table_size) {
      return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER;
    }
    return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_SKIP;
  }
  if (game_present == 0) {
    return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_SKIP;
  }
  const int32_t nid = static_cast<int32_t>(~static_cast<uint32_t>(id));
  if (nid < 0 || nid >= game_neg_table_size) {
    return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_SKIP;
  }
  return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_resolve_index(
    int32_t game_present, int32_t id, int32_t game_neg_table_size,
    int32_t manager_table_size) {
  if (id >= 0) {
    if (id < manager_table_size) {
      return id;
    }
    return 0;
  }
  if (game_present == 0) {
    return 0;
  }
  const int32_t nid = static_cast<int32_t>(~static_cast<uint32_t>(id));
  if (nid < 0 || nid >= game_neg_table_size) {
    return 0;
  }
  return nid;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_entry_usable(
    uint32_t entry_ptr, int32_t entry_type) {
  /* PE 0x00843301: test eax,eax ; je skip — null; 0x00843309:
     cmp dword [eax],3 ; je skip. */
  if (entry_ptr == 0u) {
    return 0;
  }
  return entry_type != ISAAC_PLAYERHUD_P6_ENTRY_TYPE_BLOCK ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_take_result_value(
    uint32_t result_byte_d, int32_t result_word_4, int32_t id,
    uint32_t result_ptr, uint32_t list_head) {
  /* PE 0x00843337: cmp byte [eax+0xd],0 ; jne alt — byte test, so mask
     explicitly (v12 rule; probed via wide draws in the test). */
  if ((result_byte_d & 0xffu) != 0u) {
    return 0;
  }
  /* PE 0x00843344: cmp esi, ecx ; jl alt — SIGNED: id >= result[4]. */
  if (id < result_word_4) {
    return 0;
  }
  /* PE 0x0084334c: cmp eax, [ebp-0x1450] ; je alt. */
  if (result_ptr == list_head) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_branch_kind(
    int32_t take_result, int32_t id) {
  if (take_result != 0) {
    return ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT;
  }
  /* PE 0x00843424: test esi,esi ; jns 0x008434ae (CONFIG). */
  if (id < 0) {
    return ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG;
  }
  return ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_insert_value(
    int32_t branch_kind, int32_t id, int32_t result_word_4,
    int32_t config_reinsert_id) {
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      /* PE 0x0084353b..0x00843539: mov [ecx], eax with eax = [ebp-0x145c]
         = result[4] (saved at 0x0084335b). */
      return result_word_4;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      /* PE 0x00843449..0x0084344f: value = [ebp-0x1468] = id. */
      return id;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      /* PE 0x00843533..0x00843539: value = [ebp-0x1474] = re-read
         array[slot*7+2] (host supplies the re-read). */
      return config_reinsert_id;
    default:
      return 0;
  }
}

extern "C" uint32_t isaac_playerhud_pocket_upgrade_config_path_ptr(
    uint32_t entry_ptr, int32_t is_sso, uint32_t config_heap_ptr) {
  /* PE 0x008434b4: add eax,0x38 ; cmp [eax+0x14],0x10 ; jb sso ;
     0x008434bd: mov eax,[eax] — heap ptr replaces the SSO buffer. */
  if (is_sso != 0) {
    return entry_ptr + static_cast<uint32_t>(ISAAC_PLAYERHUD_P6_CONFIG_STRING_OFF);
  }
  return config_heap_ptr;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_global_callback_needed(
    uint32_t virtual_al, uint32_t global_fn) {
  /* PE 0x0084325d: test al,al — low byte only (v12 rule); then
     mov eax,[0xc7163c] ; test eax,eax ; je skip. */
  if ((virtual_al & 0xffu) == 0u) {
    return 0;
  }
  return global_fn != 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_result_followup_needed(
    uint32_t node_word_18) {
  /* PE 0x008433ea: mov ecx, [esi+0x18] ; test ecx,ecx ; je free-only. */
  return node_word_18 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_result_copy_byte_offset(void) {
  /* PE 0x00843358: add eax,0x14 — RESULT materialize source. */
  return ISAAC_PLAYERHUD_P6_RESULT_COPY_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_build_node_result_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_build_node_obj_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_list_head_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_LIST_HEAD_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_value_ebp_off(
    int32_t branch_kind) {
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return ISAAC_PLAYERHUD_P6_RESULT_VALUE_EBP_OFF;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return ISAAC_PLAYERHUD_P6_NEG_VALUE_EBP_OFF;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return ISAAC_PLAYERHUD_P6_CONFIG_VALUE_EBP_OFF;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_elem_ebp_off(
    int32_t branch_kind) {
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return ISAAC_PLAYERHUD_P6_RESULT_ELEM_EBP_OFF;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return ISAAC_PLAYERHUD_P6_NEG_ELEM_EBP_OFF;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return ISAAC_PLAYERHUD_P6_CONFIG_ELEM_EBP_OFF;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_virtual_ebp_off(
    int32_t branch_kind) {
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return ISAAC_PLAYERHUD_P6_RESULT_VIRTUAL_EBP_OFF;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return ISAAC_PLAYERHUD_P6_NEG_VIRTUAL_EBP_OFF;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL_EBP_OFF;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_global_arg_ebp_off(
    int32_t branch_kind) {
  /* The global callback argument is the branch's elem slot. */
  return isaac_playerhud_pocket_upgrade_elem_ebp_off(branch_kind);
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_seh_first(
    int32_t branch_kind) {
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return ISAAC_PLAYERHUD_P6_SEH_RESULT_FIRST;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return ISAAC_PLAYERHUD_P6_SEH_NEG_FIRST;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return ISAAC_PLAYERHUD_P6_SEH_CONFIG_FIRST;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_seh_count(
    int32_t branch_kind) {
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return 3; /* 0x11, 0x12, 0x13 (0x0084336d/0x008433a5/0x008433e6) */
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return 2; /* 0x14, 0x15 (0x0084343d/0x00843475) */
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return 6; /* 0x16..0x1b (0x008434cc..0x008435bb) */
    default:
      return 0;
  }
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_callback_count(
    int32_t branch_kind) {
  /* RESULT: elem callback + 0x415d20 node followup. NEG: one elem
     callback. CONFIG: three virtual/global pairs (0x00843563/0x00843591/
     0x008435bf). */
  switch (branch_kind) {
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return 2;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return 1;
    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return 3;
    default:
      return 0;
  }
}

extern "C" int32_t
isaac_playerhud_pocket_upgrade_config_load_image_result_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_config_elem2_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_config_value2_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_config_virtual2_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_config_virtual3_ebp_off(void) {
  return ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_upgrade_config_capacity_byte_offset(void) {
  /* PE 0x008434b7: cmp [eax+0x14],0x10 with eax = entry+0x38. */
  return ISAAC_PLAYERHUD_P6_CONFIG_CAPACITY_OFF;
}

extern "C" uint32_t isaac_playerhud_host_va_pocket_upgrade_build_node(void) {
  return ISAAC_PLAYERHUD_P6_HOST_VA_BUILD_NODE;
}

extern "C" uint32_t isaac_playerhud_host_va_pocket_upgrade_node_remove(void) {
  return ISAAC_PLAYERHUD_P6_HOST_VA_NODE_REMOVE;
}

extern "C" uint32_t isaac_playerhud_host_va_free(void) {
  return ISAAC_PLAYERHUD_P6_HOST_VA_FREE;
}

extern "C" void isaac_playerhud_pocket_upgrade_plan(
    IsaacPlayerHudPocketUpgradePlan* out, int32_t slot_index,
    int32_t game_present, int32_t id, int32_t game_neg_table_size,
    int32_t manager_table_size, uint32_t entry_ptr, int32_t entry_type,
    uint32_t result_ptr, uint32_t result_byte_d, int32_t result_word_4,
    uint32_t list_head, int32_t config_capacity, uint32_t config_heap_ptr,
    int32_t config_reinsert_id) {
  const int32_t resolve_kind = isaac_playerhud_pocket_upgrade_resolve_kind(
      game_present, id, game_neg_table_size, manager_table_size);
  const int32_t resolve_index = isaac_playerhud_pocket_upgrade_resolve_index(
      game_present, id, game_neg_table_size, manager_table_size);
  const int32_t usable = isaac_playerhud_pocket_upgrade_entry_usable(
      entry_ptr, entry_type);
  const int32_t take = isaac_playerhud_pocket_upgrade_take_result_value(
      result_byte_d, result_word_4, id, result_ptr, list_head);
  const int32_t branch =
      (resolve_kind == ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_SKIP || usable == 0)
          ? ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP
          : isaac_playerhud_pocket_upgrade_branch_kind(take, id);
  const int32_t insert = isaac_playerhud_pocket_upgrade_insert_value(
      branch, id, result_word_4, config_reinsert_id);
  const int32_t is_sso =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG &&
       static_cast<uint32_t>(config_capacity) <
           static_cast<uint32_t>(ISAAC_PLAYERHUD_P6_CONFIG_SSO_THRESHOLD))
          ? 1
          : 0;

  out->branch_kind = branch;
  out->resolve_table_kind = resolve_kind;
  out->resolve_lookup_index = resolve_index;
  out->insert_value = insert;
  out->slot_byte_off =
      isaac_playerhud_pocket_upgrade_slot_byte_offset(slot_index);
  out->array_element_dword_index =
      isaac_playerhud_pocket_upgrade_array_element_dword_index(slot_index);
  out->build_node_result_ebp_off =
      ISAAC_PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF;
  out->build_node_obj_ebp_off = ISAAC_PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF;
  out->list_head_ebp_off = ISAAC_PLAYERHUD_P6_LIST_HEAD_EBP_OFF;
  out->value_ebp_off = isaac_playerhud_pocket_upgrade_value_ebp_off(branch);
  out->elem_ebp_off = isaac_playerhud_pocket_upgrade_elem_ebp_off(branch);
  out->virtual_ebp_off =
      isaac_playerhud_pocket_upgrade_virtual_ebp_off(branch);
  out->global_arg_ebp_off =
      isaac_playerhud_pocket_upgrade_global_arg_ebp_off(branch);
  out->seh_first = isaac_playerhud_pocket_upgrade_seh_first(branch);
  out->seh_count = isaac_playerhud_pocket_upgrade_seh_count(branch);
  out->callback_count = isaac_playerhud_pocket_upgrade_callback_count(branch);
  out->result_copy_off =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT)
          ? ISAAC_PLAYERHUD_P6_RESULT_COPY_OFF
          : 0;
  out->config_is_sso = is_sso;
  /* Only CONFIG consumes the gfx path; other branches report 0 (matches
     the JS oracle; the SSO flag is the host's job at runtime). */
  out->config_path_ptr =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG)
          ? isaac_playerhud_pocket_upgrade_config_path_ptr(
                entry_ptr, is_sso, config_heap_ptr)
          : 0;
  out->config_load_image_result_ebp_off =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG)
          ? ISAAC_PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF
          : 0;
  out->config_elem2_ebp_off =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG)
          ? ISAAC_PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF
          : 0;
  out->config_value2_ebp_off =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG)
          ? ISAAC_PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF
          : 0;
  out->config_virtual2_ebp_off =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG)
          ? ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF
          : 0;
  out->config_virtual3_ebp_off =
      (branch == ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG)
          ? ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF
          : 0;
  out->host_va_build_node = ISAAC_PLAYERHUD_P6_HOST_VA_BUILD_NODE;
  out->host_va_node_remove = ISAAC_PLAYERHUD_P6_HOST_VA_NODE_REMOVE;
  out->host_va_materialize = isaac_playerhud_host_va_sp_materialize();
  out->host_va_elem_init = ISAAC_PLAYERHUD_P5_HOST_VA_ELEM_INIT;
  out->host_va_push_grow = ISAAC_PLAYERHUD_P5_HOST_VA_PUSH_GROW;
  out->host_va_load_image = isaac_playerhud_host_va_load_image();
  out->host_va_free = ISAAC_PLAYERHUD_P6_HOST_VA_FREE;
}

/* ---- P7 second-list gates (VA 0x00843667..0x00843a5c), ABI v13 ---- */

extern "C" int32_t isaac_playerhud_pocket_second_list_gate(
    int32_t game_word_26584) {
  /* PE 0x0084366c: cmp dword [eax+0x26584],0x2b ; jne 0x00843aab. */
  return game_word_26584 == ISAAC_PLAYERHUD_P7_GAME_GATE_VALUE ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_second_list_count(
    uint32_t begin_1fa4, uint32_t end_1fa8) {
  /* PE 0x0084367f: sub eax,edx ; sar eax,2 — wrapped difference,
     arithmetic shift (element count, signed). */
  return static_cast<int32_t>(end_1fa8 - begin_1fa4) >> 2;
}

extern "C" int32_t isaac_playerhud_pocket_second_list_iteration_needed(
    int32_t index, uint32_t begin_1fa4, uint32_t end_1fa8) {
  /* PE 0x00843750: sub ecx,edx ; sar ecx,2 ; cmp esi,ecx ; jae skip —
     the bound is RE-DERIVED every iteration from the player fields, and
     the compare is UNSIGNED (jae). */
  const int32_t count =
      isaac_playerhud_pocket_second_list_count(begin_1fa4, end_1fa8);
  return static_cast<uint32_t>(index) < static_cast<uint32_t>(count) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_second_list_entry_usable(
    uint32_t entry_ptr) {
  /* PE 0x00843766: test edx,edx ; je 0x008439bf (continue). */
  return entry_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_pocket_second_list_vec_begin_byte_offset(void) {
  return ISAAC_PLAYERHUD_P7_VEC_BEGIN_OFF;
}

extern "C" int32_t isaac_playerhud_pocket_second_list_vec_end_byte_offset(void) {
  return ISAAC_PLAYERHUD_P7_VEC_END_OFF;
}

/* ---------------- ABI v14: tail residuals after the P6/P7 loops ----------------
 * P6 list clear 0x00843603..0x00843662; P7 list clear 0x00843a62..0x00843aa9;
 * P5-walk clear 0x00843aab..0x00843adf; enable store 0x00843aea; tail gfx
 * rebuild 0x00843af1..0x00843ba6; 0x956110 call args 0x00843ba6..0x00843bb7.
 */

extern "C" int32_t isaac_playerhud_pocket_list_clear_needed(
    uint32_t head_ptr, uint32_t head_word0) {
  /* PE 0x00843611 / 0x00843a70: cmp eax,ecx ; je skip — the walk runs only
     when head[0] != head.  Both P6 (head at [ebp-0x1450]) and P7 (head at
     [ebp-0x143c]) use the identical gate. */
  return head_word0 != head_ptr ? 1 : 0;
}

extern "C" void isaac_playerhud_pocket_list_clear_plan(
    IsaacPlayerHudPocketListClearPlan* out, int32_t kind, uint32_t head_ptr,
    uint32_t head_word0) {
  if (out == nullptr) {
    return;
  }
  const int32_t is_p7 = kind == ISAAC_PLAYERHUD_POCKET_LIST_CLEAR_KIND_P7;
  out->needs_clear =
      isaac_playerhud_pocket_list_clear_needed(head_ptr, head_word0);
  out->head_ebp_off =
      is_p7 != 0 ? static_cast<int32_t>(ISAAC_PLAYERHUD_P7_LIST_HEAD_EBP_OFF)
                 : static_cast<int32_t>(ISAAC_PLAYERHUD_P6_LIST_HEAD_EBP_OFF);
  out->cursor_ebp_off = ISAAC_PLAYERHUD_LIST_CLEAR_CURSOR_EBP_OFF;
  out->node_sp_clear_off = ISAAC_PLAYERHUD_LIST_CLEAR_NODE_SP_OFF;
  out->sp_clear_arg = ISAAC_PLAYERHUD_LIST_CLEAR_SP_ARG;
  out->seh_level = ISAAC_PLAYERHUD_LIST_CLEAR_SEH_LEVEL;
  out->host_va_advance = ISAAC_PLAYERHUD_TAIL_HOST_VA_ADVANCE;
  out->host_va_teardown =
      static_cast<uint32_t>(is_p7 ? ISAAC_PLAYERHUD_TAIL_HOST_VA_P7_LIST_CLEAR
                                  : ISAAC_PLAYERHUD_TAIL_HOST_VA_TREE_TEARDOWN);
  /* P6 runs 0x415800 then free inline; P7's 0x83b830 body is exactly
     those two calls (verified from the PE: 0x83b830 = 0x415800 +
     aef15c(0x1c)), so only P6 reports the free step. */
  out->teardown_runs_free = is_p7 ? 0 : 1;
  out->host_va_free = ISAAC_PLAYERHUD_P6_HOST_VA_FREE;
  out->free_size = ISAAC_PLAYERHUD_LIST_CLEAR_FREE_SIZE;
}

extern "C" int32_t isaac_playerhud_p5_walk_clear_needed(
    uint32_t cursor_6a0, uint32_t end_6a4) {
  /* PE 0x00843ab9: cmp esi,[edi+4] ; je 0x00843ae4 — the up-front equality
     skip goes PAST the teardown (unlike P5C, which always tears down). */
  return cursor_6a0 != end_6a4 ? 1 : 0;
}

extern "C" void isaac_playerhud_p5_walk_clear_plan(
    IsaacPlayerHudP5WalkClearPlan* out, uint32_t cursor_6a0,
    uint32_t end_6a4) {
  if (out == nullptr) {
    return;
  }
  out->needed = isaac_playerhud_p5_walk_clear_needed(cursor_6a0, end_6a4);
  out->walk_steps = isaac_playerhud_p5_walk_steps(cursor_6a0, end_6a4);
  out->cursor_byte_off = ISAAC_PLAYERHUD_P5_OFF_LIST_HEAD_6A0;
  out->end_byte_off = ISAAC_PLAYERHUD_P5_OFF_LIST_END_6A4;
  out->stride = ISAAC_PLAYERHUD_P5_WALK_STRIDE;
  out->node_sp_clear_off = ISAAC_PLAYERHUD_WALK_CLEAR_NODE_SP_OFF;
  out->sp_clear_arg = ISAAC_PLAYERHUD_LIST_CLEAR_SP_ARG;
  out->cursor_save_ebp_off = ISAAC_PLAYERHUD_WALK_CLEAR_CURSOR_SAVE_EBP_OFF;
  out->hud_ebp_off = ISAAC_PLAYERHUD_WALK_CLEAR_HUD_EBP_OFF;
  out->host_va_sp_clear = ISAAC_PLAYERHUD_TAIL_HOST_VA_SP_CLEAR;
  out->host_va_teardown = ISAAC_PLAYERHUD_TAIL_HOST_VA_WALK_CLEAR;
}

extern "C" void isaac_playerhud_tail_enable_store_clear(uint8_t* player_hud) {
  /* PE 0x00843aea: mov byte [esi+0x6ac],0 — always runs after the P6/P7
     list clears and the P5-walk clear join. */
  if (player_hud == nullptr) {
    return;
  }
  player_hud[ISAAC_PLAYERHUD_TAIL_ENABLE_BYTE_OFF] = 0;
}

extern "C" int32_t isaac_playerhud_tail_rebuild_gate(uint32_t byte_6ad) {
  /* PE 0x00843af1: cmp byte [esi+0x6ad],0 ; je 0x00843ba6 — byte test, so
     mask explicitly (the parameter is wider than the PE slot on purpose;
     v12 rule). */
  return (byte_6ad & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_tail_rebuild_path_kind(uint32_t probe_al) {
  /* PE 0x00843b37: test al,0x40 ; je 0x00843b63 — only AL participates.
     The 0x40 bit is below 0x100, so the full-word AND is exact; the
     comment pins the byte semantics for the wide-value probes. */
  return (probe_al & ISAAC_PLAYERHUD_TAIL_PROBE_MASK) != 0u
             ? ISAAC_PLAYERHUD_TAIL_PATH_FIXED
             : ISAAC_PLAYERHUD_TAIL_PATH_CONFIG;
}

extern "C" uint32_t isaac_playerhud_tail_config_string_data(
    uint32_t entry_ptr, uint32_t capacity, uint32_t heap_data_ptr) {
  /* FUN_0040d0c0 translated (no exact ZHL — std::string data pointer):
        cmp dword [ecx+0x14],0x10 ; jb 0x40d0c9
        mov eax,[ecx] ; ret          ; heap data at string+0
     0x40d0c9: mov eax,ecx ; ret     ; SSO base is the string itself
     this = entry+0x38, capacity at entry+0x4c. The heap data word is a
     host-supplied value (entry+0x38 deref), mirroring the P6 CONFIG
     path ptr law. */
  if (capacity < ISAAC_PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD) {
    return entry_ptr + ISAAC_PLAYERHUD_ITEMCFG_GFX_STRING_OFF;
  }
  return heap_data_ptr;
}

extern "C" void isaac_playerhud_tail_rebuild_plan(
    IsaacPlayerHudTailRebuildPlan* out, uint32_t byte_6ad, uint32_t entry_ptr,
    uint32_t probe_al, uint32_t config_capacity, uint32_t config_heap_ptr) {
  if (out == nullptr) {
    return;
  }
  const int32_t runs =
      isaac_playerhud_tail_rebuild_gate(byte_6ad);
  const int32_t entry_present = entry_ptr != 0u ? 1 : 0;
  /* path_kind is only meaningful when the LoadImage actually runs
     (gate open AND entry non-null); 0 otherwise. FIXED == 0 is a valid
     kind, so the skip state is carried by runs_image, not by kind. */
  const int32_t runs_image = (runs != 0 && entry_present != 0) ? 1 : 0;
  const int32_t path_kind =
      runs_image != 0 ? isaac_playerhud_tail_rebuild_path_kind(probe_al) : 0;
  const int32_t is_fixed = path_kind == ISAAC_PLAYERHUD_TAIL_PATH_FIXED;
  out->runs = runs;
  out->entry_present = entry_present;
  out->path_kind = path_kind;
  out->fixed_path_va = (runs_image != 0 && is_fixed) != 0
                           ? ISAAC_PLAYERHUD_TAIL_FIXED_PATH_VA
                           : 0u;
  out->result_ebp_off =
      runs_image == 0
          ? 0
          : (is_fixed ? ISAAC_PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF
                      : ISAAC_PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF);
  out->swap_seh_try_level =
      runs_image == 0
          ? 0
          : (is_fixed ? ISAAC_PLAYERHUD_TAIL_SEH_FIXED
                      : ISAAC_PLAYERHUD_TAIL_SEH_CONFIG);
  out->teardown_ecx_ebp_off = out->result_ebp_off;
  out->temp_teardown_seh =
      runs_image == 0 ? 0 : ISAAC_PLAYERHUD_TAIL_TEMP_TEARDOWN_SEH;
  out->anm2_sp_byte_off = ISAAC_PLAYERHUD_TAIL_ANM2_SP_OFF;
  out->sp_clear_arg = ISAAC_PLAYERHUD_LIST_CLEAR_SP_ARG;
  /* +0x6ad is cleared at 0x00843b99/0x00843b9f whenever the gate opens —
     on both the entry-null skip and the LoadImage paths. */
  out->clears_after = runs;
  const int32_t is_config = path_kind == ISAAC_PLAYERHUD_TAIL_PATH_CONFIG;
  out->config_path_sso =
      (is_config != 0 &&
       config_capacity < ISAAC_PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD)
          ? 1
          : 0;
  out->config_path_ptr =
      is_config != 0
          ? isaac_playerhud_tail_config_string_data(entry_ptr,
                                                    config_capacity,
                                                    config_heap_ptr)
          : 0u;
  out->get_collectible_this_off = ISAAC_PLAYERHUD_TAIL_GET_COLLECTIBLE_THIS_OFF;
  out->get_collectible_arg_off = ISAAC_PLAYERHUD_TAIL_COLLECTIBLE_ID_OFF;
  out->probe_mask = ISAAC_PLAYERHUD_TAIL_PROBE_MASK;
  out->host_va_get_collectible = ISAAC_PLAYERHUD_TAIL_HOST_VA_GET_COLLECTIBLE;
  out->host_va_sp_clear = ISAAC_PLAYERHUD_TAIL_HOST_VA_SP_CLEAR;
  out->host_va_load_image = ISAAC_PLAYERHUD_HOST_VA_LOAD_IMAGE;
  out->host_va_swap = ISAAC_PLAYERHUD_TAIL_HOST_VA_SP_SWAP;
  out->host_va_temp_teardown = ISAAC_PLAYERHUD_TAIL_HOST_VA_TEMP_TEARDOWN;
  out->host_va_probe = ISAAC_PLAYERHUD_TAIL_HOST_VA_PROBE;
}

extern "C" void isaac_playerhud_tail_predicate_call_args(
    IsaacPlayerHudTailPredicateCallArgs* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00843ba6..0x00843bb2: mov eax,[esi] (player) ; push ecx (leftover
     from the 0x40c440 call) ; push eax ; push [eax+0x1618] ; push 0xb ;
     call 0x956110 — cdecl, so arg0=0xb, arg1=player+0x1618, arg2=player,
     arg3=caller-saved ecx. */
  out->type_arg = ISAAC_PLAYERHUD_TAIL_PREDICATE_TYPE;
  out->arg1_player_off = ISAAC_PLAYERHUD_TAIL_PREDICATE_ARG1_OFF;
  out->arg2_is_player = 1;
  out->arg3_is_leftover_ecx = 1;
  out->host_va_predicate = ISAAC_PLAYERHUD_TAIL_HOST_VA_PREDICATE;
}

extern "C" int32_t isaac_playerhud_tail_dirty_notify_needed(
    uint32_t dirty_byte) {
  /* PE 0x00843c11: cmp byte ptr [ebp-0x1419],0 ; je 0x00843c24 — byte
     test with the shared dirty flag (P2 countdown / active gfx set it);
     widened parameter with an explicit low-byte mask (v12 rule). */
  return (dirty_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_playerhud_tail_dirty_notify_call_args(
    IsaacPlayerHudTailDirtyNotifyCallArgs* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00843c1a: mov ecx,[esi+0x4] (parent HUD*) ; 0x00843c1d: push 1 ;
     call 0x009a6110 (dirty notify, address-stable). */
  out->dirty_flag_ebp_off = ISAAC_PLAYERHUD_DIRTY_FLAG_EBP_OFF;
  out->hud_this_dword_off = ISAAC_PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF;
  out->notify_arg = ISAAC_PLAYERHUD_TAIL_DIRTY_ARG;
  out->host_va_notify = ISAAC_PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY;
}

static_assert(sizeof(IsaacPlayerHudStatBarTweenState) == 16,
              "stat bar tween out ABI changed");

extern "C" void isaac_playerhud_stat_bar_tween(
    IsaacPlayerHudStatBarTweenState* out,
    uint32_t current_bits,
    uint32_t prev_bits,
    uint32_t threshold_bits,
    int32_t timer,
    uint32_t target_bits,
    uint32_t mode) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084d6b0..0x0084d73c (ret 4). ecx = slot, xmm1 = target f32,
     [esp+4] = mode byte (low byte tested).  Disasm:
     section-notes/playerhud-v18/disasm-84d6b0-stat-bar-tween.txt
     17 direct callers: 11 in RecomputeStats 0x0084ca00 (slots
     esi+{0x118,0x12c,0x140,0x154,0x168,0x17c,0x190,0x1a4,0x1b8,0x1cc}+
     edi), 6 in 0x0084e9d0 (slots edi+{0x4c,0x60,0x74,0x88,0x9c,0xb0}). */
  const float current = __builtin_bit_cast(float, current_bits);
  const float target = __builtin_bit_cast(float, target_bits);

  if ((mode & 0xffu) == 0u) {
    /* Reset (0x0084d6bd..0x0084d6d0): prev=current, delta=0, timer=0,
       current=target. */
    out->prev_bits = current_bits;
    out->delta_bits = 0u;
    out->timer = 0;
    out->current_bits = target_bits;
    return;
  }

  if (target == current) {
    /* 0x0084d6d8 ucomiss xmm1,xmm2; lahf; test ah,0x44; jnp 0x84d737.
       The jnp is taken ONLY on equal (ZF=1,PF=0 -> odd parity of
       ah&0x44).  Ordered greater/less AND unordered NaN both fall into
       the tween.  Equal: current=target only — delta/prev/timer are NOT
       written (slot keeps its pre-call values). */
    out->current_bits = target_bits;
    return;
  }

  if (timer <= ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_SLOW) {
    /* 0x0084d6ed subss xmm0,xmm2: delta = target - current (f32);
       0x0084d6f1 prev=current; 0x0084d6f6 delta stored. */
    const float delta = target - current;
    const uint32_t delta_out = __builtin_bit_cast(uint32_t, delta);
    out->prev_bits = current_bits;
    out->delta_bits = delta_out;
    /* 0x0084d6fb andps xmm0,[0xbacb40] = fabs via sign-bit clear;
       0x0084d702 comiss xmm0,[ecx+0xc]; 0x0084d706 jb 0x84d737 — the
       write of 0x96 is skipped for ordered-less AND unordered (CF=1).
       The C++ >= is false for NaN, which reproduces jb-taken. */
    const float abs_delta =
        __builtin_bit_cast(float, delta_out &
                                      ISAAC_PLAYERHUD_STAT_BAR_TWEEN_ABS_MASK);
    const float threshold = __builtin_bit_cast(float, threshold_bits);
    if (abs_delta >= threshold) {
      out->timer = ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW;
    } else {
      out->timer = timer;
    }
    out->current_bits = target_bits;
    return;
  }

  /* timer > 30 (0x0084d716..0x0084d735):
     subss xmm0,[ecx+8]: delta = target - prev;
     cmovge + [ebp+8]=0x87: timer = max(timer, 135). */
  const float prev = __builtin_bit_cast(float, prev_bits);
  const float delta = target - prev;
  out->delta_bits = __builtin_bit_cast(uint32_t, delta);
  out->timer = timer >= ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR
                   ? timer
                   : ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR;
  out->current_bits = target_bits;
}

static_assert(sizeof(IsaacPlayerHud84e9d0SlotState) == 20,
              "84e9d0 slot state ABI changed");

extern "C" void isaac_playerhud_84e9d0_update(
    IsaacPlayerHud84e9d0SlotState out[6],
    uint32_t player_ptr,
    uint32_t player_1568_bits,
    uint32_t player_1460_bits,
    uint32_t player_1470_bits,
    uint32_t player_1480_bits,
    uint32_t player_1464_bits,
    uint32_t player_156c_bits,
    uint32_t mode) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084e9d0..0x0084ea85 (ret 4). Disasm:
     section-notes/playerhud-v18/disasm-84e9d0-updater-callsites.txt
     Gate (0x0084e9d6..0x0084e9db): mov eax,[edi+0x48]; test eax,eax;
     je 0x84ea80 — full-dword null test on the player ptr, all 6 slots
     untouched. Each call re-reads [edi+0x48] and pushes the SAME mode
     (mov esi,[ebp+8] once; push esi before every call). */
  if (player_ptr == 0u) {
    return;
  }
  const float t1568 = __builtin_bit_cast(float, player_1568_bits);
  const float t1460 = __builtin_bit_cast(float, player_1460_bits);
  const float t1470 = __builtin_bit_cast(float, player_1470_bits);
  const float t1480 = __builtin_bit_cast(float, player_1480_bits);
  const float t1464 = __builtin_bit_cast(float, player_1464_bits);
  const float t156c = __builtin_bit_cast(float, player_156c_bits);

  const uint32_t targets[6] = {
      /* k0 (0x0084e9e1): movss xmm1,[eax+0x1568]; call 0x84d6b0 @ edi+0x4c */
      __builtin_bit_cast(uint32_t, t1568),
      /* k1 (0x0084e9fc..0x0084ea15): movss xmm1,[0xbaa8d0] (30.0f);
         movss xmm0,[eax+0x1460]; addss xmm0,[0xbaa454] (1.0f);
         divss xmm1,xmm0 — 30.0f / (p1460 + 1.0f), plain f32 ops. */
      __builtin_bit_cast(uint32_t, 30.0f / (t1460 + 1.0f)),
      /* k2 (0x0084ea25): movss xmm1,[eax+0x1470]; call @ edi+0x74 */
      __builtin_bit_cast(uint32_t, t1470),
      /* k3 (0x0084ea3c..0x0084ea44): movss xmm1,[eax+0x1480];
         divss xmm1,[0xbaa904] (40.0f) — p1480 / 40.0f. */
      __builtin_bit_cast(uint32_t, t1480 / 40.0f),
      /* k4 (0x0084ea5b): movss xmm1,[eax+0x1464]; call @ edi+0x9c */
      __builtin_bit_cast(uint32_t, t1464),
      /* k5 (0x0084ea72): movss xmm1,[eax+0x156c]; call @ edi+0xb0 */
      __builtin_bit_cast(uint32_t, t156c),
  };

  for (int i = 0; i < ISAAC_PLAYERHUD_84E9D0_SLOT_COUNT; ++i) {
    IsaacPlayerHud84e9d0SlotState* s = &out[i];
    /* The tween's write set is branch-dependent: the equal fast-path
       writes ONLY current (0x0084d737), so delta/prev/timer keep their
       pre-call values.  Seed the temp from the slot state, then copy the
       whole temp back — exactly the residual-host apply semantics. */
    IsaacPlayerHudStatBarTweenState t;
    t.current_bits = s->current_bits;
    t.delta_bits = s->delta_bits;
    t.prev_bits = s->prev_bits;
    t.timer = s->timer;
    isaac_playerhud_stat_bar_tween(
        &t, s->current_bits, s->prev_bits, s->threshold_bits, s->timer,
        targets[i], mode);
    /* The tween writes only current/delta/prev/timer; the threshold at
       slot+0xc is read-only in the PE (never stored), so it is kept. */
    s->current_bits = t.current_bits;
    s->delta_bits = t.delta_bits;
    s->prev_bits = t.prev_bits;
    s->timer = t.timer;
  }
}

/* ABI v32: RecomputeStats 0x84ca00 mask-dispatch pure laws.  Body
   VA 0x0084ca00..0x0084cc38 (ret 0xc).  Disasm:
   section-notes/playerhud-v18/disasm-84ca00-recomputestats-callsites.txt
   Every game-state write goes through the v18 pure tween 0x84d6b0;
   the 3 opaque stat probes (0x7f92b0 float, 0x749830 bool, 0x7f96f0
   float) are host-resolved blob scalars.  All 11 tween calls push the
   same flag (setg result) as the mode arg. */

/* SSE maxss/minss: an unordered (NaN) dest operand returns the src
   operand; +-0.0 equal-sign returns src.  In this body the src is
   always a literal constant (0.0f / 1.0f), so only the dest-NaN rule
   is reachable. */
static inline float sse_maxss(float a, float b) {
  if (a != a) {
    return b;
  }
  return a > b ? a : b;
}
static inline float sse_minss(float a, float b) {
  if (a != a) {
    return b;
  }
  return a < b ? a : b;
}

extern "C" uint32_t isaac_playerhud_84ca00_flag(uint32_t game_frame,
                                                uint32_t entry_frame) {
  /* 0x0084ca28..0x0084ca42: mov eax,[Game+0x264f8];
     sub eax,[entry+0x328]; cmp eax,1; setg al.  32-bit wrap then a
     SIGNED greater-than vs 1; result is 0/1 (pushed as the tween
     mode arg at every call site). */
  const int32_t diff = (int32_t)(game_frame - entry_frame);
  return diff > 1 ? 1u : 0u;
}

extern "C" uint32_t isaac_playerhud_84ca00_clamp(uint32_t probe1_bits,
                                                 uint32_t probe2) {
  /* 0x0084cb5b..0x0084cb81: maxss(probe1,0.0); minss(...,1.0);
     then 0x749830 al (LOW byte) == 0 -> xorps -> 0.0.  probe1 is
     captured post-fstp by the host blob (x87 64->32 rounding already
     applied). */
  const float p1 = __builtin_bit_cast(float, probe1_bits);
  float c = sse_maxss(p1, 0.0f);
  c = sse_minss(c, 1.0f);
  if ((probe2 & 0xffu) == 0u) {
    c = 0.0f;
  }
  return __builtin_bit_cast(uint32_t, c);
}

extern "C" uint32_t isaac_playerhud_84ca00_slot_active(uint32_t mask,
                                                       uint32_t slot_index) {
  /* 0x0084ca45..0x0084cc34 mask dispatch: slots 0..5 gated by
     test bl,{1,2,4,8,0x10,0x20}; slots 6 (this+0x190) and 7
     (this+0x1a4) are BOTH gated by the single test bl,0xc0 (either
     bit 0x40 or 0x80 enables both tween calls); slot 8 (0x1b8) by
     test ebx,0x100; slot 9 (0x1cc) by test ebx,0x200. */
  const uint32_t m = mask;
  switch (slot_index) {
    case 0u: return (m & 0x01u) ? 1u : 0u;
    case 1u: return (m & 0x02u) ? 1u : 0u;
    case 2u: return (m & 0x04u) ? 1u : 0u;
    case 3u: return (m & 0x08u) ? 1u : 0u;
    case 4u: return (m & 0x10u) ? 1u : 0u;
    case 5u: return (m & 0x20u) ? 1u : 0u;
    case 6u: return (m & 0xc0u) ? 1u : 0u; /* 0x190 */
    case 7u: return (m & 0xc0u) ? 1u : 0u; /* 0x1a4 — coupled */
    case 8u: return (m & 0x100u) ? 1u : 0u; /* 0x1b8 */
    case 9u: return (m & 0x200u) ? 1u : 0u; /* 0x1cc */
    default: return 0u;
  }
}

extern "C" uint32_t isaac_playerhud_84ca00_slot_target(
    uint32_t slot_index,
    uint32_t e1568_bits,
    uint32_t e1460_bits,
    uint32_t e1470_bits,
    uint32_t e1480_bits,
    uint32_t e1464_bits,
    uint32_t e156c_bits,
    uint32_t probe1_bits,
    uint32_t probe2,
    uint32_t probe3_bits,
    uint32_t mode_byte,
    uint32_t game_1adb4_bits) {
  /* Per-slot xmm1 target at the 0x84d6b0 call site.  All SSE ops are
     plain f32 (no fast-math), one rounding per instruction. */
  const float f1460 = __builtin_bit_cast(float, e1460_bits);
  const float f1480 = __builtin_bit_cast(float, e1480_bits);
  const float fprobe3 = __builtin_bit_cast(float, probe3_bits);
  const float f1adb4 = __builtin_bit_cast(float, game_1adb4_bits);

  switch (slot_index) {
    case 0u: /* movss xmm1,[entry+0x1568] */
      return e1568_bits;
    case 1u: /* 30.0f / (e1460 + 1.0f) — addss then divss */
      return __builtin_bit_cast(uint32_t, 30.0f / (f1460 + 1.0f));
    case 2u: /* movss xmm1,[entry+0x1470] */
      return e1470_bits;
    case 3u: /* divss xmm1,[0xbaa904] — e1480 / 40.0f */
      return __builtin_bit_cast(uint32_t, f1480 / 40.0f);
    case 4u: /* movss xmm1,[entry+0x1464] */
      return e1464_bits;
    case 5u: /* movss xmm1,[entry+0x156c] */
      return e156c_bits;
    case 6u: { /* this+0x190 */
      const float clamped = __builtin_bit_cast(
          float, isaac_playerhud_84ca00_clamp(probe1_bits, probe2));
      if ((mode_byte & 0xffu) != 0u) {
        /* 0x0084cbaa: movss xmm1,[ebp+0xc]; mulss xmm1,xmm4 */
        return __builtin_bit_cast(uint32_t, clamped * 100.0f);
      }
      /* 0x0084cbba: movss xmm1,[0xbaa454]; subss xmm1,xmm5;
         mulss xmm1,[ebp+0xc]; mulss xmm1,xmm4 */
      const float sub = 1.0f - fprobe3;
      const float m1 = sub * clamped;
      return __builtin_bit_cast(uint32_t, m1 * 100.0f);
    }
    case 7u: { /* this+0x1a4: probe3 * clamped * 100.0f
                  (0x0084cbd4 mulss xmm5,[ebp+0xc]; mulss xmm5,xmm4) */
      const float clamped = __builtin_bit_cast(
          float, isaac_playerhud_84ca00_clamp(probe1_bits, probe2));
      const float m1 = fprobe3 * clamped;
      return __builtin_bit_cast(uint32_t, m1 * 100.0f);
    }
    case 8u: /* xorps xmm1,xmm1 -> 0.0f */
      return 0u;
    case 9u: /* movss xmm1,[Game+0x1adb4]; mulss xmm1,xmm4 */
      return __builtin_bit_cast(uint32_t, f1adb4 * 100.0f);
    default:
      return 0u;
  }
}

/* ABI v33: per-player StatHUD stats-pack updater FUN_0084cc40
   (VA 0x0084cc40..0x0084d6ad, ret 8).  Disasm:
   section-notes/playerhud-v33-84cc40/ (cpu-dump 0084cc40.txt,
   0084ce00.txt, 0084d0f0.txt, 0084d200.txt, 0084d500.txt).
   thiscall + 2 stdcall stack args read through the
   `push ebx; mov ebx,esp` frame: [ebx+8]=player_a, [ebx+0xc]=
   player_b.  Two player blocks from `this`, stride 0xcc (v32
   PLAYER_STRIDE); per-block player ptr at +0x114 (v32 ENTRY_PTR_OFF).
   Gate law (0x84cc9d cmp eax,[ebx+8]; jne 0x84d659; then 0x84d659
   cmp eax,edx):
     block==A -> store B into +0x114; if B != 0 re-run the stats pack
                 (v18 tween law per slot with v32 slot-target recipes;
                 mode byte this+0x2ac, v32 MODE_BYTE_OFF).
     block==B -> store A into +0x114 and call RecomputeStats
                 0x84ca00 (v32 pure laws by reference) with
                 (player_index=i, mask=-1, dead=i), ret 0xc.
     else     -> nothing.
   The 3 opaque stat probes 0x7f92b0/0x749830/0x7f96f0 are
   host-resolved blob scalars (v32 HOST_VA_PROBE1..3 by reference). */

extern "C" uint32_t isaac_playerhud_84cc40_block_count(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_COUNT);
}

extern "C" uint32_t isaac_playerhud_84cc40_block_stride(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_STRIDE);
}

extern "C" uint32_t isaac_playerhud_84cc40_block_player_off(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_PLAYER_OFF);
}

extern "C" uint32_t isaac_playerhud_84cc40_slot_base_off(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_SLOT_BASE_OFF);
}

extern "C" uint32_t isaac_playerhud_84cc40_slot_count(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_SLOT_COUNT);
}

extern "C" uint32_t isaac_playerhud_84cc40_slot_stride(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_SLOT_STRIDE);
}

extern "C" uint32_t isaac_playerhud_84cc40_mode_byte_off(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_MODE_BYTE_OFF);
}

extern "C" uint32_t isaac_playerhud_84cc40_block_kind(uint32_t block_player,
                                                      uint32_t player_a,
                                                      uint32_t player_b) {
  /* PE 0x0084cc9d cmp eax,[ebx+8]; jne 0x84d659 — A tested first.
     0x0084d659 cmp eax,edx; jne 0x84d698 — B second. */
  if (block_player == player_a) {
    return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_SWAP_UPDATE);
  }
  if (block_player == player_b) {
    return static_cast<uint32_t>(
        ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_SWAP_RECOMPUTE);
  }
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_NONE);
}

extern "C" uint32_t isaac_playerhud_84cc40_update_needed(uint32_t player_b) {
  /* PE 0x0084ccb5 test edx,edx; je 0x84d698 — full-dword null gate. */
  return player_b != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_playerhud_84cc40_path_flag(uint32_t game_frame,
                                                     uint32_t entry_frame) {
  /* 0x0084ccc2 mov eax,[Game+0x264f8]; sub eax,[entry+0x328];
     cmp eax,1; jg 0x84ce1b — signed setg, 32-bit wrap.  Identical
     to the v32 84ca00 flag law (by reference). */
  const int32_t diff = static_cast<int32_t>(game_frame - entry_frame);
  return diff > 1 ? 1u : 0u;
}

extern "C" uint32_t isaac_playerhud_84cc40_recompute_host_va(void) {
  return ISAAC_PLAYERHUD_84CC40_RECOMPUTE_HOST_VA;
}

extern "C" void isaac_playerhud_84cc40_recompute_plan(
    IsaacPlayerHud84cc40RecomputePlan* out, uint32_t player_index) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0084d660..0x0084d66d: push ecx; push -1; push ecx; mov
     ecx,esi; call 0x84ca00 — player_index and dead are the SAME
     register (loop index i); mask is -1; 0x84ca00 ret 0xc. */
  out->host_va = ISAAC_PLAYERHUD_84CC40_RECOMPUTE_HOST_VA;
  out->player_index = player_index;
  out->mask = ISAAC_PLAYERHUD_84CC40_RECOMPUTE_MASK;
  out->dead = player_index;
  out->ret_bytes = 0xcu;
}

extern "C" uint32_t isaac_playerhud_84cc40_va(void) {
  return ISAAC_PLAYERHUD_84CC40_VA;
}

extern "C" uint32_t isaac_playerhud_84cc40_ret_va(void) {
  return ISAAC_PLAYERHUD_84CC40_RET_VA;
}

extern "C" uint32_t isaac_playerhud_84cc40_next_va(void) {
  return ISAAC_PLAYERHUD_84CC40_NEXT_VA;
}

/* PE .rdata string VAs for ecx 0..0x1f (jump table 0x0084d828). */
static const uint32_t k84d740StringVa[ISAAC_PLAYERHUD_84D740_ACTION_COUNT] = {
    0x00b1cdf0u, /*  0 Left */
    0x00b1cde8u, /*  1 Right */
    0x00b1cde4u, /*  2 Up */
    0x00b1cddcu, /*  3 Down */
    0x00b60d0cu, /*  4 ShootLeft */
    0x00b60cf8u, /*  5 ShootRight */
    0x00b60d04u, /*  6 ShootUp */
    0x00b60cecu, /*  7 ShootDown */
    0x00b1ce1cu, /*  8 Bomb */
    0x00b67800u, /*  9 Item */
    0x00b6d524u, /* 10 PillCard */
    0x00b63f64u, /* 11 Drop */
    0x00b6b02cu, /* 12 Pause */
    0x00b6d530u, /* 13 Map */
    0x00b6e170u, /* 14 MenuConfirm */
    0x00b6e1bcu, /* 15 MenuBack */
    0x00b6e1c8u, /* 16 FullScreen */
    0x00b6e1acu, /* 17 Mute */
    0x00b6e1b4u, /* 18 Restart */
    0x00b6e190u, /* 19 JoinMultiplayer */
    0x00b6e1a0u, /* 20 MenuLeft */
    0x00b6e17cu, /* 21 MenuRight */
    0x00b6e188u, /* 22 MenuUp */
    0x00b6e208u, /* 23 MenuDown */
    0x00b6e214u, /* 24 MenuLB */
    0x00b6e1f8u, /* 25 MenuRB */
    0x00b6e200u, /* 26 MenuLT */
    0x00b6e1e8u, /* 27 MenuRT */
    0x00b6e1f0u, /* 28 MenuTab */
    0x00b6e1d4u, /* 29 MenuEx */
    0x00b6e1dcu, /* 30 EmoteMenu */
    0x00b6e21cu, /* 31 ToggleDescriptions */
};

static_assert(sizeof(IsaacPlayerHud84d740Plan) == 20,
              "84d740 plan ABI changed");

extern "C" uint32_t isaac_playerhud_84d740_string_va(uint32_t action_id) {
  /* PE VA 0x0084d740: cmp ecx,0x1f; ja 0x84d810. UNSIGNED. */
  if (action_id > ISAAC_PLAYERHUD_84D740_ACTION_MAX) {
    return ISAAC_PLAYERHUD_84D740_DEFAULT_STRING_VA;
  }
  return k84d740StringVa[action_id];
}

extern "C" int32_t isaac_playerhud_84d740_needs_log(uint32_t action_id) {
  return action_id > ISAAC_PLAYERHUD_84D740_ACTION_MAX ? 1 : 0;
}

extern "C" void isaac_playerhud_84d740_plan(IsaacPlayerHud84d740Plan* out,
                                            uint32_t action_id) {
  if (out == nullptr) {
    return;
  }
  /* Default arm 0x0084d810: push 0xb6e230; push 0x10; call 0xa112c0;
     add esp,8; mov eax,0xb1a4ec; ret. Taken arms: mov eax,imm; ret. */
  out->host_va_log = ISAAC_PLAYERHUD_HOST_VA_LOG;
  if (action_id > ISAAC_PLAYERHUD_84D740_ACTION_MAX) {
    out->string_va = ISAAC_PLAYERHUD_84D740_DEFAULT_STRING_VA;
    out->needs_log = 1;
    out->log_level = ISAAC_PLAYERHUD_84D740_LOG_LEVEL;
    out->log_fmt_va = ISAAC_PLAYERHUD_84D740_LOG_FMT_VA;
    return;
  }
  out->string_va = k84d740StringVa[action_id];
  out->needs_log = 0;
  out->log_level = 0;
  out->log_fmt_va = 0;
}

static_assert(sizeof(IsaacPlayerHud84d8b0Result) == 20,
              "84d8b0 result ABI changed");

extern "C" void isaac_playerhud_84d8b0_intersect(
    IsaacPlayerHud84d8b0Result* out,
    uint32_t ax_bits, uint32_t ay_bits,
    uint32_t bx_bits, uint32_t by_bits,
    uint32_t cx_bits, uint32_t cy_bits,
    uint32_t dx_bits, uint32_t dy_bits,
    uint32_t out_x_ptr, uint32_t out_y_ptr) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084d8b0..0x0084da1f (ret 0). Leaf SSE. */
  const float ax = __builtin_bit_cast(float, ax_bits);
  const float ay = __builtin_bit_cast(float, ay_bits);
  const float bx = __builtin_bit_cast(float, bx_bits);
  const float by = __builtin_bit_cast(float, by_bits);
  const float cx = __builtin_bit_cast(float, cx_bits);
  const float cy = __builtin_bit_cast(float, cy_bits);
  const float dx = __builtin_bit_cast(float, dx_bits);
  const float dy = __builtin_bit_cast(float, dy_bits);

  /* 0x84d8dc subss xmm0,xmm6; 0x84d8e3 subss xmm1,[ebp+0x14];
     0x84d8f3 subss xmm4,xmm7; 0x84d8d2 subss xmm7,xmm3. */
  const float axb = ax - bx;
  const float ayb = ay - by;
  const float cyd = cy - dy;
  const float cxd = cx - dx;
  /* 0x84d8fd mulss; 0x84d910 mulss; 0x84d91b subss. */
  const float denom = (cyd * axb) - (cxd * ayb);

  /* 0x84d92d cvtps2pd; 0x84d930 andps [0xbacb50];
     0x84d91f movsd xmm0,[0xbaa2a8]; 0x84d937 comisd; jae fail. */
  const double denom_pd = (double)denom;
  const uint64_t abs_bits =
      __builtin_bit_cast(uint64_t, denom_pd) & 0x7fffffffffffffffULL;
  const double abs_denom = __builtin_bit_cast(double, abs_bits);
  const uint64_t eps_bits =
      (uint64_t)ISAAC_PLAYERHUD_84D8B0_EPS_F64_LO |
      ((uint64_t)ISAAC_PLAYERHUD_84D8B0_EPS_F64_HI << 32);
  const double eps = __builtin_bit_cast(double, eps_bits);
  if (eps >= abs_denom) {
    out->hit = 0;
    out->write_x = 0;
    out->write_y = 0;
    return;
  }

  const float ayc = ay - cy;
  const float axc = ax - cx;
  /* tNum = xorps [0xbacb70] of ((Ay-Cy)*(Ax-Bx)-(Ax-Cx)*(Ay-By)). */
  const float t_unneg = (ayc * axb) - (axc * ayb);
  const float t_num = __builtin_bit_cast(
      float, __builtin_bit_cast(uint32_t, t_unneg) ^ 0x80000000u);
  /* uNum = (Ax-Cx)*(Cy-Dy) - (Ay-Cy)*(Cx-Dx). */
  const float u_num = (axc * cyd) - (ayc * cxd);
  const float t = t_num / denom;
  const float u = u_num / denom;

  /* 0x84d98c/0x84d99d/0x84d9a2/0x84d9a7 comiss jb -> fail.
     jb is taken for ordered-less AND unordered. */
  if (!(t >= 0.0f) || !(1.0f >= t) || !(u >= 0.0f) || !(1.0f >= u)) {
    out->hit = 0;
    out->write_x = 0;
    out->write_y = 0;
    return;
  }

  float px;
  float py;
  /* 0x84d9b0 comiss xmm5,xmm2; jbe CD. jbe = u<=t or NaN. */
  if (u > t) {
    px = (bx - ax) * u + ax;
    py = (by - ay) * u + ay;
  } else {
    px = (dx - cx) * t + cx;
    py = (dy - cy) * t + cy;
  }

  out->hit = 1;
  if (out_x_ptr != 0u) {
    out->x_bits = __builtin_bit_cast(uint32_t, px);
    out->write_x = 1;
  } else {
    out->write_x = 0;
  }
  if (out_y_ptr != 0u) {
    out->y_bits = __builtin_bit_cast(uint32_t, py);
    out->write_y = 1;
  } else {
    out->write_y = 0;
  }
}

extern "C" void isaac_playerhud_84da20_init(uint32_t* obj) {
  if (obj == nullptr) {
    return;
  }
  /* PE VA 0x0084da20..0x0084dac2 (ret 0). Leaf thiscall.
     mov [ecx],0; mov eax,ecx; mov [ecx+0x10],0;
     mov [ecx+0x14],0xf; then [ecx+0x18]..[ecx+0x64] = 0.
     +4/+8/+c are not stored. */
  obj[0] = 0;
  obj[ISAAC_PLAYERHUD_84DA20_SSO_SIZE_OFF / 4u] = 0;
  obj[ISAAC_PLAYERHUD_84DA20_SSO_CAP_OFF / 4u] =
      ISAAC_PLAYERHUD_84DA20_SSO_CAPACITY;
  for (uint32_t off = ISAAC_PLAYERHUD_84DA20_TAIL_BEGIN;
       off <= ISAAC_PLAYERHUD_84DA20_TAIL_LAST; off += 4u) {
    obj[off / 4u] = 0;
  }
}

extern "C" int32_t isaac_playerhud_84da20_writes_dword(uint32_t byte_off) {
  if ((byte_off & 3u) != 0u) {
    return 0;
  }
  if (byte_off == 0u || byte_off == ISAAC_PLAYERHUD_84DA20_SSO_SIZE_OFF ||
      byte_off == ISAAC_PLAYERHUD_84DA20_SSO_CAP_OFF) {
    return 1;
  }
  if (byte_off >= ISAAC_PLAYERHUD_84DA20_TAIL_BEGIN &&
      byte_off <= ISAAC_PLAYERHUD_84DA20_TAIL_LAST) {
    return 1;
  }
  return 0;
}

extern "C" uint32_t isaac_playerhud_84da20_object_size(void) {
  return ISAAC_PLAYERHUD_84DA20_OBJECT_SIZE;
}

extern "C" uint32_t isaac_playerhud_84da20_sso_capacity(void) {
  return ISAAC_PLAYERHUD_84DA20_SSO_CAPACITY;
}

extern "C" uint32_t isaac_playerhud_84da20_next_va(void) {
  return ISAAC_PLAYERHUD_84DA20_NEXT_VA;
}

extern "C" void isaac_playerhud_84dad0_init(uint32_t* obj) {
  if (obj == nullptr) {
    return;
  }
  /* PE VA 0x0084dad0..0x0084db86 (ret 0). SEH thiscall.
     mov [esi],0; [esi+4],0; [esi+8],0;
     [esi+0x18],0; [esi+0x1c],0xf; byte [esi+8],0;
     [esi+0x20]..[esi+0x40]=0; byte [esi+0x44],0.
     +0xc/+0x10/+0x14 are not stored. Host 0x6efa40(this+0x48)
     stays host. */
  obj[0] = 0;
  obj[1] = 0;
  obj[2] = 0;
  obj[ISAAC_PLAYERHUD_84DAD0_SSO_SIZE_OFF / 4u] = 0;
  obj[ISAAC_PLAYERHUD_84DAD0_SSO_CAP_OFF / 4u] =
      ISAAC_PLAYERHUD_84DAD0_SSO_CAPACITY;
  uint8_t* bytes = reinterpret_cast<uint8_t*>(obj);
  bytes[ISAAC_PLAYERHUD_84DAD0_SSO_OFF] = 0;
  for (uint32_t off = ISAAC_PLAYERHUD_84DAD0_TAIL_BEGIN;
       off <= ISAAC_PLAYERHUD_84DAD0_TAIL_LAST; off += 4u) {
    obj[off / 4u] = 0;
  }
  bytes[ISAAC_PLAYERHUD_84DAD0_FLAG_BYTE_OFF] = 0;
}

extern "C" int32_t isaac_playerhud_84dad0_writes_dword(uint32_t byte_off) {
  if ((byte_off & 3u) != 0u) {
    return 0;
  }
  if (byte_off == 0u || byte_off == 4u ||
      byte_off == ISAAC_PLAYERHUD_84DAD0_SSO_OFF ||
      byte_off == ISAAC_PLAYERHUD_84DAD0_SSO_SIZE_OFF ||
      byte_off == ISAAC_PLAYERHUD_84DAD0_SSO_CAP_OFF) {
    return 1;
  }
  if (byte_off >= ISAAC_PLAYERHUD_84DAD0_TAIL_BEGIN &&
      byte_off <= ISAAC_PLAYERHUD_84DAD0_TAIL_LAST) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_playerhud_84dad0_writes_byte(uint32_t byte_off) {
  if (byte_off == ISAAC_PLAYERHUD_84DAD0_SSO_OFF ||
      byte_off == ISAAC_PLAYERHUD_84DAD0_FLAG_BYTE_OFF) {
    return 1;
  }
  return 0;
}

extern "C" uint32_t isaac_playerhud_84dad0_object_size(void) {
  return ISAAC_PLAYERHUD_84DAD0_OBJECT_SIZE;
}

extern "C" uint32_t isaac_playerhud_84dad0_sso_capacity(void) {
  return ISAAC_PLAYERHUD_84DAD0_SSO_CAPACITY;
}

extern "C" uint32_t isaac_playerhud_84dad0_host_va(void) {
  return ISAAC_PLAYERHUD_84DAD0_HOST_VA;
}

extern "C" uint32_t isaac_playerhud_84dad0_host_this_off(void) {
  return ISAAC_PLAYERHUD_84DAD0_HOST_THIS_OFF;
}

extern "C" uint32_t isaac_playerhud_84dad0_next_va(void) {
  return ISAAC_PLAYERHUD_84DAD0_NEXT_VA;
}

extern "C" void isaac_playerhud_84db90_plan(IsaacPlayerHud84db90Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084db90..0x0084dbaf. thiscall.
     lea ecx,[esi+0x38]; call 0x8562b0
     lea ecx,[esi+0x2c]; call 0x8562b0
     lea ecx,[esi+0x20]; call 0x8562b0
     lea ecx,[esi+8];    jmp  0x40d040
     0x84dbc0 not folded. */
  out->call_count = ISAAC_PLAYERHUD_84DB90_CALL_COUNT;
  out->host_va_0 = ISAAC_PLAYERHUD_84DB90_HOST_VA_SUB;
  out->this_off_0 = ISAAC_PLAYERHUD_84DB90_THIS_OFF_0;
  out->host_va_1 = ISAAC_PLAYERHUD_84DB90_HOST_VA_SUB;
  out->this_off_1 = ISAAC_PLAYERHUD_84DB90_THIS_OFF_1;
  out->host_va_2 = ISAAC_PLAYERHUD_84DB90_HOST_VA_SUB;
  out->this_off_2 = ISAAC_PLAYERHUD_84DB90_THIS_OFF_2;
  out->host_va_3 = ISAAC_PLAYERHUD_84DB90_HOST_VA_STRING;
  out->this_off_3 = ISAAC_PLAYERHUD_84DB90_THIS_OFF_3;
  out->tail_jmp = 1;
  out->next_va = ISAAC_PLAYERHUD_84DB90_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_84db90_call_count(void) {
  return ISAAC_PLAYERHUD_84DB90_CALL_COUNT;
}

extern "C" uint32_t isaac_playerhud_84db90_this_off_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_84DB90_THIS_OFF_0;
  }
  if (index == 1u) {
    return ISAAC_PLAYERHUD_84DB90_THIS_OFF_1;
  }
  if (index == 2u) {
    return ISAAC_PLAYERHUD_84DB90_THIS_OFF_2;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84DB90_THIS_OFF_3;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84db90_host_va_at(uint32_t index) {
  if (index <= 2u) {
    return ISAAC_PLAYERHUD_84DB90_HOST_VA_SUB;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84DB90_HOST_VA_STRING;
  }
  return 0u;
}

extern "C" int32_t isaac_playerhud_84db90_is_tail_jmp(uint32_t index) {
  return index == 3u ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_84db90_next_va(void) {
  return ISAAC_PLAYERHUD_84DB90_NEXT_VA;
}

extern "C" void isaac_playerhud_84dbc0_plan(IsaacPlayerHud84dbc0Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084dbc0..0x0084dbf6. thiscall.
     lea ecx,[esi+0x54]; call 0x4149d0
     lea ecx,[esi+0x48]; call 0x4149d0
     lea ecx,[esi+0x3c]; call 0x4149d0
     lea ecx,[esi+0x30]; call 0x4149d0
     lea ecx,[esi+0x24]; call 0x4149d0
     lea ecx,[esi+0x18]; call 0x4149d0
     mov ecx,esi;          jmp  0x40d040
     0x84dc00 not folded. */
  out->call_count = ISAAC_PLAYERHUD_84DBC0_CALL_COUNT;
  out->host_va_0 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  out->this_off_0 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_0;
  out->host_va_1 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  out->this_off_1 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_1;
  out->host_va_2 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  out->this_off_2 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_2;
  out->host_va_3 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  out->this_off_3 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_3;
  out->host_va_4 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  out->this_off_4 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_4;
  out->host_va_5 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  out->this_off_5 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_5;
  out->host_va_6 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_STRING;
  out->this_off_6 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_6;
  out->tail_jmp = 1;
  out->next_va = ISAAC_PLAYERHUD_84DBC0_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_84dbc0_call_count(void) {
  return ISAAC_PLAYERHUD_84DBC0_CALL_COUNT;
}

extern "C" uint32_t isaac_playerhud_84dbc0_this_off_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_0;
  }
  if (index == 1u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_1;
  }
  if (index == 2u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_2;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_3;
  }
  if (index == 4u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_4;
  }
  if (index == 5u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_5;
  }
  if (index == 6u) {
    return ISAAC_PLAYERHUD_84DBC0_THIS_OFF_6;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84dbc0_host_va_at(uint32_t index) {
  if (index <= 5u) {
    return ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;
  }
  if (index == 6u) {
    return ISAAC_PLAYERHUD_84DBC0_HOST_VA_STRING;
  }
  return 0u;
}

extern "C" int32_t isaac_playerhud_84dbc0_is_tail_jmp(uint32_t index) {
  return index == 6u ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_84dbc0_next_va(void) {
  return ISAAC_PLAYERHUD_84DBC0_NEXT_VA;
}

extern "C" int32_t isaac_playerhud_856840_needed(uint32_t begin,
                                                 uint32_t end) {
  /* PE 0x00856843: cmp ecx,edi ; je DONE. Full-dword !=. */
  return begin != end ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_856840_count(uint32_t begin,
                                                 uint32_t end) {
  if (end < begin) {
    return 0u;
  }
  const uint32_t span = end - begin;
  const uint32_t stride =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_856840_STRIDE);
  if ((span % stride) != 0u) {
    return 0u;
  }
  return span / stride;
}

extern "C" void isaac_playerhud_856840_plan(IsaacPlayerHud856840Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x00856840..0x00856893. ecx=begin, edx=end.
     Per-object order is v25 0x84dbc0 by reference:
     lea ecx,[esi+0x0c]; call 0x4149d0   ; obj+0x54
     mov ecx,esi;       call 0x4149d0   ; obj+0x48
     lea ecx,[esi-0x0c]; call 0x4149d0   ; obj+0x3c
     lea ecx,[esi-0x18]; call 0x4149d0   ; obj+0x30
     lea ecx,[esi-0x24]; call 0x4149d0   ; obj+0x24
     lea ecx,[esi-0x30]; call 0x4149d0   ; obj+0x18
     lea ecx,[esi-0x48]; call 0x40d040   ; obj+0
     add esi,0x68
     0x8568a0 not folded. */
  out->call_count = ISAAC_PLAYERHUD_856840_CALL_COUNT;
  out->host_va_0 = ISAAC_PLAYERHUD_856840_HOST_VA_SUB;
  out->this_off_0 = ISAAC_PLAYERHUD_856840_THIS_OFF_0;
  out->host_va_1 = ISAAC_PLAYERHUD_856840_HOST_VA_SUB;
  out->this_off_1 = ISAAC_PLAYERHUD_856840_THIS_OFF_1;
  out->host_va_2 = ISAAC_PLAYERHUD_856840_HOST_VA_SUB;
  out->this_off_2 = ISAAC_PLAYERHUD_856840_THIS_OFF_2;
  out->host_va_3 = ISAAC_PLAYERHUD_856840_HOST_VA_SUB;
  out->this_off_3 = ISAAC_PLAYERHUD_856840_THIS_OFF_3;
  out->host_va_4 = ISAAC_PLAYERHUD_856840_HOST_VA_SUB;
  out->this_off_4 = ISAAC_PLAYERHUD_856840_THIS_OFF_4;
  out->host_va_5 = ISAAC_PLAYERHUD_856840_HOST_VA_SUB;
  out->this_off_5 = ISAAC_PLAYERHUD_856840_THIS_OFF_5;
  out->host_va_6 = ISAAC_PLAYERHUD_856840_HOST_VA_STRING;
  out->this_off_6 = ISAAC_PLAYERHUD_856840_THIS_OFF_6;
  out->stride = ISAAC_PLAYERHUD_856840_STRIDE;
  out->next_va = ISAAC_PLAYERHUD_856840_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_856840_call_count(void) {
  return ISAAC_PLAYERHUD_856840_CALL_COUNT;
}

extern "C" uint32_t isaac_playerhud_856840_this_off_at(uint32_t index) {
  /* v25 0x84dbc0 this-off table by reference. */
  return isaac_playerhud_84dbc0_this_off_at(index);
}

extern "C" uint32_t isaac_playerhud_856840_host_va_at(uint32_t index) {
  /* v25 0x84dbc0 host-VA table by reference. */
  return isaac_playerhud_84dbc0_host_va_at(index);
}

extern "C" uint32_t isaac_playerhud_856840_stride(void) {
  return ISAAC_PLAYERHUD_856840_STRIDE;
}

extern "C" uint32_t isaac_playerhud_856840_next_va(void) {
  return ISAAC_PLAYERHUD_856840_NEXT_VA;
}


extern "C" void isaac_playerhud_8568a0_plan(IsaacPlayerHud8568a0CopyPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x008568a0..0x00856954 (ret 4). thiscall dest=ecx, stdcall
     src=[ebp+8], eax=dest. SEH/GS prefix. Call order:
     push esi; call 0x40cf50            ; SSO-string copy-ctor,
                                            this=dest(+0), arg=src(+0)
     lea eax,[esi+0x18]; lea ecx,[edi+0x18]; push eax; call 0x43eca0
     ... +0x24,+0x30,+0x3c,+0x48,+0x54  ; 0xc-vector copy-ctor,
                                            this=dest+off, arg=src+off
     mov eax,[esi+0x60]; mov [edi+0x60],eax   ; pure tail
     mov eax,[esi+0x64]; mov [edi+0x64],eax   ; pure tail
     mov eax,edi; ret 4. Hosts 0x40cf50 /
     0x43eca0 stay host (both E8-free of this
     family; identify-zhl no exact match). */
  out->call_count = ISAAC_PLAYERHUD_8568A0_CALL_COUNT;
  out->host_va_0 = ISAAC_PLAYERHUD_8568A0_HOST_VA_STRING;
  out->this_off_0 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_0;
  out->arg_off_0 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_0;
  out->host_va_1 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  out->this_off_1 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_1;
  out->arg_off_1 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_1;
  out->host_va_2 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  out->this_off_2 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_2;
  out->arg_off_2 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_2;
  out->host_va_3 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  out->this_off_3 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_3;
  out->arg_off_3 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_3;
  out->host_va_4 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  out->this_off_4 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_4;
  out->arg_off_4 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_4;
  out->host_va_5 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  out->this_off_5 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_5;
  out->arg_off_5 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_5;
  out->host_va_6 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  out->this_off_6 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_6;
  out->arg_off_6 = ISAAC_PLAYERHUD_8568A0_THIS_OFF_6;
  out->tail_begin_off = ISAAC_PLAYERHUD_8568A0_TAIL_BEGIN_OFF;
  out->tail_dword_count = ISAAC_PLAYERHUD_8568A0_TAIL_DWORD_COUNT;
  out->object_size = ISAAC_PLAYERHUD_8568A0_OBJECT_SIZE;
  out->next_va = ISAAC_PLAYERHUD_8568A0_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_8568a0_call_count(void) {
  return ISAAC_PLAYERHUD_8568A0_CALL_COUNT;
}

extern "C" uint32_t isaac_playerhud_8568a0_this_off_at(uint32_t index) {
  /* Copy-call this (dest) offsets low-to-high; v28 vec offs by ref
     with the +0 string copy first. */
  const uint32_t offs[7] = {
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_0),
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_1),
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_2),
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_3),
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_4),
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_5),
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_THIS_OFF_6)};
  if (index >= 7u) {
    return 0u;
  }
  return offs[index];
}

extern "C" uint32_t isaac_playerhud_8568a0_arg_off_at(uint32_t index) {
  /* Mirror; PE pushes src+same off. */
  return isaac_playerhud_8568a0_this_off_at(index);
}

extern "C" uint32_t isaac_playerhud_8568a0_host_va_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_8568A0_HOST_VA_STRING;
  }
  if (index <= 6u) {
    return ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_8568a0_tail_begin_off(void) {
  return ISAAC_PLAYERHUD_8568A0_TAIL_BEGIN_OFF;
}

extern "C" uint32_t isaac_playerhud_8568a0_tail_dword_count(void) {
  return ISAAC_PLAYERHUD_8568A0_TAIL_DWORD_COUNT;
}

extern "C" uint32_t isaac_playerhud_8568a0_object_size(void) {
  return ISAAC_PLAYERHUD_8568A0_OBJECT_SIZE;
}

extern "C" uint32_t isaac_playerhud_8568a0_next_va(void) {
  return ISAAC_PLAYERHUD_8568A0_NEXT_VA;
}

extern "C" void isaac_playerhud_8568a0_tail_copy(uint32_t* dest,
                                                 const uint32_t* src) {
  /* PE 0x00856936..0x0085693f: two dword copies at +0x60/+0x64
     (v28 completion +0x60 / mode +0x64 by reference). */
  if (dest == nullptr || src == nullptr) {
    return;
  }
  const uint32_t begin =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_8568A0_TAIL_BEGIN_OFF);
  for (int i = 0; i < ISAAC_PLAYERHUD_8568A0_TAIL_DWORD_COUNT; ++i) {
    dest[begin / 4u + i] = src[begin / 4u + i];
  }
}


extern "C" uint32_t isaac_playerhud_856e10_move_ctor(
    uint8_t* dest, uint8_t* src) {
  /* PE VA 0x00856e10..0x00856f4a (ret 4). thiscall dest=ecx, stdcall
     src=[ebp+8], eax=dest. Pure leaf: 0 E8, 46 stores. Store order:
     header dwords 0..5 (+0x00..+0x17: movups 16 + movq 8), six 0xc
     triples +0x18..+0x5c (v28 vec offs by reference, low-to-high),
     tail dwords +0x60/+0x64 (v28 completion/mode by reference).
     src reset to empty: byte +0 = 0, dword +0x10 = 0, dword +0x14 =
     0xf (SSO cap), six 0xc triples +0x18..+0x5c zeroed. Tail dwords
     copied but NOT cleared from src. Two-phase copy-then-reset matches
     the PE net effect for disjoint dest/src (PE interleaves reads
     before its zeroing stores; aliased dest==src is PE-undefined).
     src is a NON-const move source: the PE stores into it. */
  if (dest == nullptr || src == nullptr) {
    return 0u;
  }
  uint32_t* d32 = reinterpret_cast<uint32_t*>(dest);
  uint32_t* s32 = reinterpret_cast<uint32_t*>(src);
  for (uint32_t i = 0; i < ISAAC_PLAYERHUD_856E10_VEC_BEGIN_OFF / 4u; ++i) {
    d32[i] = s32[i];
  }
  for (int t = 0; t < ISAAC_PLAYERHUD_856E10_VEC_TRIPLE_COUNT; ++t) {
    const uint32_t base = ISAAC_PLAYERHUD_856E10_VEC_BEGIN_OFF +
        static_cast<uint32_t>(t * ISAAC_PLAYERHUD_856E10_VEC_TRIPLE_STRIDE);
    d32[base / 4u] = s32[base / 4u];
    d32[base / 4u + 1] = s32[base / 4u + 1];
    d32[base / 4u + 2] = s32[base / 4u + 2];
  }
  for (int i = 0; i < ISAAC_PLAYERHUD_856E10_TAIL_DWORD_COUNT; ++i) {
    d32[ISAAC_PLAYERHUD_856E10_TAIL_BEGIN_OFF / 4u + i] =
        s32[ISAAC_PLAYERHUD_856E10_TAIL_BEGIN_OFF / 4u + i];
  }
  src[0] = 0;
  s32[ISAAC_PLAYERHUD_856E10_SSO_SIZE_OFF / 4u] = 0;
  s32[ISAAC_PLAYERHUD_856E10_SSO_CAP_OFF / 4u] =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_856E10_SSO_CAPACITY);
  for (int t = 0; t < ISAAC_PLAYERHUD_856E10_VEC_TRIPLE_COUNT; ++t) {
    const uint32_t base = ISAAC_PLAYERHUD_856E10_VEC_BEGIN_OFF +
        static_cast<uint32_t>(t * ISAAC_PLAYERHUD_856E10_VEC_TRIPLE_STRIDE);
    s32[base / 4u] = 0;
    s32[base / 4u + 1] = 0;
    s32[base / 4u + 2] = 0;
  }
  /* PE 0x00856f45: mov eax,edi (dest); ret 4. */
  return static_cast<uint32_t>(reinterpret_cast<uintptr_t>(dest));
}

extern "C" uint32_t isaac_playerhud_856e10_object_size(void) {
  return ISAAC_PLAYERHUD_856E10_OBJECT_SIZE;
}

extern "C" uint32_t isaac_playerhud_856e10_next_va(void) {
  return ISAAC_PLAYERHUD_856E10_NEXT_VA;
}

/* ABI v34: pure leaf gate FUN_00856f50 (VA 0x00856f50..0x00856f61,
   the v31 recorded next after FUN_00856e10 ret 4 @ 0x00856f4a; int3
   pad 0x856f4d..0x856f4f).  thiscall, no args, two early-exit rets
   (0x856f5e xor al,al / 0x856f61 mov al,1).  Disasm:
   section-notes/playerhud-v34/ (cpu-dump 00856f50.txt).
   PE 0x00856f50: mov eax,[ecx+8]; cmp eax,2; je 0x856f5f;
   test eax,eax; je 0x856f5f; xor al,al; ret; 0x856f5f: mov al,1;
   ret — returns 1 iff [this+8] == 2 || [this+8] == 0.  FULL-DWORD
   compares (cmp dword + test dword; no byte gate).  0 E8, 0
   stores, 0 indirect.  Sole direct rel32 caller 0x0085a554
   (mov ecx,esi; call; test al,al; je).  Next VA 0x00856f70 (SEH
   ctor host, 5 E8 — blocked). */

extern "C" uint32_t isaac_playerhud_856f50_gate(uint32_t field_8) {
  /* PE 0x00856f53 cmp eax,2; je 0x856f5f — full-dword equality.
     0x00856f58 test eax,eax; je 0x856f5f — full-dword null test. */
  if (field_8 == 2u || field_8 == 0u) {
    return 1u;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_856f50_field_off(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_856F50_FIELD_OFF);
}

extern "C" uint32_t isaac_playerhud_856f50_va(void) {
  return ISAAC_PLAYERHUD_856F50_VA;
}

extern "C" uint32_t isaac_playerhud_856f50_ret_va(void) {
  return ISAAC_PLAYERHUD_856F50_RET_VA;
}

extern "C" uint32_t isaac_playerhud_856f50_next_va(void) {
  return ISAAC_PLAYERHUD_856F50_NEXT_VA;
}

/* ABI v35: pure time-pack leaf FUN_0085af30 (VA 0x0085af30..0x0085afaf,
   ret).  ecx = out struct ptr, edx = value (u32), eax = out.  0 E8,
   0 indirect, 13 stores.  PE 0x0085af30: mov edi,edx; mov eax,0xd1b71759;
   mul edi; mov esi,edx; shr esi,0xd           -> q10000 = value/10000
   imul eax,esi,0xffffd8f0; add edi,eax        -> r10000 = value%10000
   mov eax,0x51eb851f; mul edi; shr edx,5      -> q100 = r10000/100
   imul eax,edx,0x64; sub edi,eax              -> rem100 = r10000%100
   Store set: byte +0 = 0 then or 2; dwords
   +8/+c/+10/+14/+18/+28/+2c/+30 = 0;
   +1c = rem100; +20 = q100 - 1; +24 = q10000 - 0x76c (1900).
   +4 is NOT stored (keeps the caller seed).  eax = out.  Callers pass
   edx = [this+0x250] (9 rel32 sites).  Next VA 0x0085afb0 is
   frame-effect-owned (ALREADY LANDED as isaac_frame_effect_85afb0_*). */
extern "C" void isaac_playerhud_85af30_pack(uint32_t* out, uint32_t value) {
  if (out == nullptr) {
    return;
  }
  const uint32_t q10000 =
      static_cast<uint32_t>((static_cast<uint64_t>(value) *
                             ISAAC_PLAYERHUD_85AF30_DIV10000_MAGIC) >>
                            ISAAC_PLAYERHUD_85AF30_DIV10000_SHIFT);
  const uint32_t r10000 = value - q10000 * 10000u;
  const uint32_t q100 =
      static_cast<uint32_t>((static_cast<uint64_t>(r10000) *
                             ISAAC_PLAYERHUD_85AF30_DIV100_MAGIC) >>
                            ISAAC_PLAYERHUD_85AF30_DIV100_SHIFT);
  const uint32_t rem100 = r10000 - q100 * 100u;
  uint8_t* bytes = reinterpret_cast<uint8_t*>(out);
  bytes[0] = 0;
  out[ISAAC_PLAYERHUD_85AF30_REM100_OFF / 4u] = rem100;
  out[ISAAC_PLAYERHUD_85AF30_Q100_MINUS1_OFF / 4u] = q100 - 1u;
  out[ISAAC_PLAYERHUD_85AF30_Q10000_MINUS1900_OFF / 4u] =
      q10000 - static_cast<uint32_t>(ISAAC_PLAYERHUD_85AF30_YEAR_BASE);
  for (uint32_t off = 0x8u; off <= 0x18u; off += 4u) {
    out[off / 4u] = 0;
  }
  for (uint32_t off = 0x28u; off <= 0x30u; off += 4u) {
    out[off / 4u] = 0;
  }
  bytes[0] = static_cast<uint8_t>(ISAAC_PLAYERHUD_85AF30_FLAG_BYTE);
}

extern "C" uint32_t isaac_playerhud_85af30_value_div10000(uint32_t value) {
  /* PE 0x0085af35..0x0085af40: mul 0xd1b71759; shr esi,0xd. */
  return static_cast<uint32_t>(
      (static_cast<uint64_t>(value) * ISAAC_PLAYERHUD_85AF30_DIV10000_MAGIC) >>
      ISAAC_PLAYERHUD_85AF30_DIV10000_SHIFT);
}

extern "C" uint32_t isaac_playerhud_85af30_value_rem100(uint32_t value) {
  /* PE: (value - q10000*10000) - q100*100 — the full magic chain. */
  const uint32_t q10000 = isaac_playerhud_85af30_value_div10000(value);
  const uint32_t r10000 = value - q10000 * 10000u;
  const uint32_t q100 =
      static_cast<uint32_t>((static_cast<uint64_t>(r10000) *
                             ISAAC_PLAYERHUD_85AF30_DIV100_MAGIC) >>
                            ISAAC_PLAYERHUD_85AF30_DIV100_SHIFT);
  return r10000 - q100 * 100u;
}

extern "C" int32_t isaac_playerhud_85af30_value_q100_minus1(
    uint32_t value) {
  /* PE 0x0085af98: lea eax,[edx-1] — signed int32 result. */
  const uint32_t q10000 = isaac_playerhud_85af30_value_div10000(value);
  const uint32_t r10000 = value - q10000 * 10000u;
  const uint32_t q100 =
      static_cast<uint32_t>((static_cast<uint64_t>(r10000) *
                             ISAAC_PLAYERHUD_85AF30_DIV100_MAGIC) >>
                            ISAAC_PLAYERHUD_85AF30_DIV100_SHIFT);
  return static_cast<int32_t>(q100 - 1u);
}

extern "C" int32_t isaac_playerhud_85af30_value_q10000_minus1900(
    uint32_t value) {
  /* PE 0x0085af9e: lea eax,[esi-0x76c] — signed int32 result. */
  const uint32_t q10000 = isaac_playerhud_85af30_value_div10000(value);
  return static_cast<int32_t>(
      q10000 - static_cast<uint32_t>(ISAAC_PLAYERHUD_85AF30_YEAR_BASE));
}

extern "C" uint32_t isaac_playerhud_85af30_va(void) {
  return ISAAC_PLAYERHUD_85AF30_VA;
}

extern "C" uint32_t isaac_playerhud_85af30_ret_va(void) {
  return ISAAC_PLAYERHUD_85AF30_RET_VA;
}

extern "C" uint32_t isaac_playerhud_85af30_next_va(void) {
  return ISAAC_PLAYERHUD_85AF30_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_85af30_object_size(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERHUD_85AF30_OBJECT_SIZE);
}

/* ABI v36: pure ordinal-suffix leaf FUN_00858870 (VA 0x00858870..
   0x008588e5, ret 4).  stdcall, 1 int32 arg [ebp+8], eax = .rdata
   suffix-string VA.  0 E8, 0 stores, 0 indirect.  Disasm:
   section-notes/playerhud-v36-census/ (+ cpu-dump 00858870.txt).
   PE 0x00858870: push ebp; mov ebp,esp; mov ecx,[ebp+8];
     mov eax,0x51eb851f; imul ecx; sar edx,5; mov eax,edx;
     shr eax,31; add eax,edx      -> q100 = trunc(value/100)
        (SIGNED magic 0x51eb851f sar 5 + sign fix; C `%` semantics)
     mov edx,ecx; imul eax,eax,0x64; sub edx,eax  -> r100 = value%100
     sub edx,0xb; je TH; sub edx,1; je TH; sub edx,1; je TH
                                   -> r100 == {11,12,13} -> TH
     mov eax,0x66666667; imul ecx; sar edx,2; mov eax,edx;
     shr eax,31; add eax,edx      -> q10 = trunc(value/10)
     lea eax,[eax+eax*4]; add eax,eax; sub ecx,eax  -> r10 = value%10
     sub ecx,1; je ST; sub ecx,1; je ND; sub ecx,1; jne TH
                                   -> r10 == 1 ST / 2 ND / 3 RD / TH
   Arms: ST = 0xb6e4cc "st", ND = 0xb6e4c0 "nd", RD = 0xb6e4c4 "rd",
   TH = 0xb6e4c8 "th" (4-byte "xx\0\0").  All compares full-dword
   sub/je (no byte gate).  SIGNED semantics: negative values never
   match 1/2/3/11/12/13 (e.g. -11 -> TH, NOT "st").  Callers
   0x858f20 / 0x85902e (both inside the 0x8588f0 SEH rank-display
   giant) push rank; sprintf "%d%s" (0xb6e6e8) renders "1st".."3rd",
   "11th"...  Next VA 0x008588f0 (SEH giant — blocked). */
extern "C" uint32_t isaac_playerhud_858870_ordinal_suffix_va(int32_t value) {
  /* PE 0x00858876..0x0085888d: signed magic div-by-100 = trunc toward
     zero (C `value / 100`); 0x0085888e..0x0085889b r100 sub/je chain
     (11/12/13 -> TH); 0x0085889d..0x008588b3 signed magic div-by-10;
     0x008588b5..0x008588c2 r10 sub/je chain (1 -> ST, 2 -> ND, 3 -> RD
     via jne-TH, else TH). */
  const int32_t q100 = value / 100;
  const int32_t r100 = value - q100 * 100;
  if (r100 == 11 || r100 == 12 || r100 == 13) {
    return ISAAC_PLAYERHUD_858870_TH_VA;
  }
  const int32_t q10 = value / 10;
  const int32_t r10 = value - q10 * 10;
  if (r10 == 1) {
    return ISAAC_PLAYERHUD_858870_ST_VA;
  }
  if (r10 == 2) {
    return ISAAC_PLAYERHUD_858870_ND_VA;
  }
  if (r10 == 3) {
    return ISAAC_PLAYERHUD_858870_RD_VA;
  }
  return ISAAC_PLAYERHUD_858870_TH_VA;
}

extern "C" int32_t isaac_playerhud_858870_value_rem100(int32_t value) {
  /* PE 0x00858887..0x0085888c: r100 = value - trunc(value/100)*100. */
  return value - (value / 100) * 100;
}

extern "C" int32_t isaac_playerhud_858870_value_rem10(int32_t value) {
  /* PE 0x008588ae..0x008588b3: r10 = value - trunc(value/10)*10. */
  return value - (value / 10) * 10;
}

extern "C" uint32_t isaac_playerhud_858870_va(void) {
  return ISAAC_PLAYERHUD_858870_VA;
}

extern "C" uint32_t isaac_playerhud_858870_ret_va(void) {
  return ISAAC_PLAYERHUD_858870_RET_VA;
}

extern "C" uint32_t isaac_playerhud_858870_next_va(void) {
  return ISAAC_PLAYERHUD_858870_NEXT_VA;
}

/* ABI v37: pure leaderboard type->entry getter FUN_00857400 (VA
   0x00857400..0x0085743c, ret 0).  thiscall, ecx = Leaderboard
   object, eax = entry pointer.  0 E8 in the 0..3 arms, 0 stores,
   1 indirect dispatch.  Disasm: section-notes/playerhud-v37-857400/
   (+ cpu-dump 00857400.txt).
   PE 0x00857400: mov eax,[ecx+8]      ; kind, FULL-DWORD load
     cmp eax,3; ja 0x85742b            ; UNSIGNED gate (no byte mask)
     jmp [eax*4+0x857440]              ; jump table 0x857440:
       0 -> 0x85740f mov eax,[ecx+0x238]; ret
       1 -> 0x857416 mov eax,[ecx+0x23c]; ret
       2 -> 0x85741d mov eax,[ecx+0x240]; ret
       3 -> 0x857424 mov eax,[ecx+0x244]; ret
     default 0x85742b: push 0xb6e4f0 ("Invalid leaderboard type \n");
       push 8; call 0xa112c0 (host log); add esp,8; xor eax,eax; ret
   Slot VAs: [this+0x238+4*kind] (leaderboard ctor 0x85867a writes
   kind as a DWORD from [ebp+8]).  9 callers 0x857a54/0x857a70/
   0x857a98/0x857ab4/0x857ff3/0x858018/0x8586ce/0x858778/0x858816 all
   test eax,eax; je (the default-arm 0 feeds the null path).  Next VA
   0x00857450 (game-update v56 rank display — ALREADY LANDED). */
static uint32_t playerHud857400Slot(uint32_t kind,
                                    uint32_t slot0, uint32_t slot1,
                                    uint32_t slot2, uint32_t slot3) {
  switch (kind) {
    case 0:
      return slot0;
    case 1:
      return slot1;
    case 2:
      return slot2;
    default:
      return slot3;
  }
}

extern "C" uint32_t isaac_playerhud_857400_entry(uint32_t kind,
                                                 uint32_t slot0,
                                                 uint32_t slot1,
                                                 uint32_t slot2,
                                                 uint32_t slot3) {
  /* PE 0x00857403..0x00857408: cmp eax,3; ja 0x85742b — FULL-DWORD
     UNSIGNED.  Default arm returns 0 after the host log. */
  if (kind > static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_KIND_MAX)) {
    return 0;
  }
  return playerHud857400Slot(kind, slot0, slot1, slot2, slot3);
}

extern "C" int32_t isaac_playerhud_857400_needs_log(uint32_t kind) {
  return kind > static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_KIND_MAX)
      ? 1
      : 0;
}

extern "C" void isaac_playerhud_857400_plan(IsaacPlayerHud857400Plan* out,
                                            uint32_t kind,
                                            uint32_t slot0,
                                            uint32_t slot1,
                                            uint32_t slot2,
                                            uint32_t slot3) {
  if (out == nullptr) {
    return;
  }
  /* Default arm 0x0085742b: push 0xb6e4f0; push 8; call 0xa112c0;
     add esp,8; xor eax,eax; ret.  Taken arms: mov eax,[ecx+off]; ret. */
  out->host_va_log = ISAAC_PLAYERHUD_HOST_VA_LOG;
  if (kind > static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_KIND_MAX)) {
    out->entry_va = 0;
    out->needs_log = 1;
    out->log_level = static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_LOG_LEVEL);
    out->log_fmt_va = ISAAC_PLAYERHUD_857400_LOG_FMT_VA;
    return;
  }
  out->entry_va = playerHud857400Slot(kind, slot0, slot1, slot2, slot3);
  out->needs_log = 0;
  out->log_level = 0;
  out->log_fmt_va = 0;
}

extern "C" uint32_t isaac_playerhud_857400_va(void) {
  return ISAAC_PLAYERHUD_857400_VA;
}

extern "C" uint32_t isaac_playerhud_857400_ret_va(void) {
  return ISAAC_PLAYERHUD_857400_RET_VA;
}

extern "C" uint32_t isaac_playerhud_857400_next_va(void) {
  return ISAAC_PLAYERHUD_857400_NEXT_VA;
}

/* ABI v38: pure float getter FUN_0085e360 (VA 0x0085e360..0x0085e366,
   ret 0).  thiscall, ecx = object, st0 = *(float*)(this+0x41c).
   Disasm: section-notes/playerhud-v38-85e000/ (+ cpu-dump 0085e360.txt).
   PE 0x0085e360: fld dword ptr [ecx+0x41c]   ; bit-preserving f32
     ret                                      ;   reinterpret (x87)
   0 E8, 0 stores, 0 indirect.  The law is identity over the field's
   4 bytes: the f32 view of [this+0x41c], no arithmetic, no NaN
   canonicalization (the PE never touches the value).  Twin setters
   (0 direct callers, not landed): 0x85e340 movss [ecx+0x41c],xmm0
   (ret 4); 0x85e330 movss [ecx+0x420],xmm0 (ret 4).  6 direct
   callers 0x668193/0x66f608/0x78639e/0x79d9eb/0x79dbf2/0x79df21 —
   all `mov ecx,<this>; call 0x85e360; fstp ...` consuming st0 (e.g.
   0x78639e fstp dword ptr [esp] feeds host 0xa10350; 0x79d9eb stores
   [ebp-0xa0c]).  Next VA 0x0085e370 (mov eax,[ecx+0x269d8];
   sub eax,[ecx+0x269d4]; sar eax,3; ret — pointer-delta getter,
   0 direct callers). */
static float playerHud85e360Float(uint32_t field_bits) {
  float out;
  __builtin_memcpy(&out, &field_bits, sizeof(out));
  return out;
}

extern "C" float isaac_playerhud_85e360_float_41c(uint32_t field_bits) {
  return playerHud85e360Float(field_bits);
}

extern "C" uint32_t isaac_playerhud_85e360_field_off(void) {
  return ISAAC_PLAYERHUD_85E360_FIELD_OFF;
}

extern "C" uint32_t isaac_playerhud_85e360_va(void) {
  return ISAAC_PLAYERHUD_85E360_VA;
}

extern "C" uint32_t isaac_playerhud_85e360_ret_va(void) {
  return ISAAC_PLAYERHUD_85E360_RET_VA;
}

extern "C" uint32_t isaac_playerhud_85e360_next_va(void) {
  return ISAAC_PLAYERHUD_85E360_NEXT_VA;
}


extern "C" int32_t isaac_playerhud_856960_needed(uint32_t src_begin,
                                                 uint32_t src_end) {
  /* PE 0x0085696f: cmp esi,ebx; je TAIL — full-dword != runs the
     per-element move loop. */
  return src_begin != src_end ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_856960_count(uint32_t src_begin,
                                                 uint32_t src_end) {
  /* Defensive trip count (v26 856840_count style). The raw PE loop
     walks 0x68 until src == end; callers always pass aligned spans,
     so a non-multiple/negative span reports 0 here. */
  if (src_end < src_begin) {
    return 0u;
  }
  const uint32_t span = src_end - src_begin;
  const uint32_t stride =
      static_cast<uint32_t>(ISAAC_PLAYERHUD_856960_STRIDE);
  if ((span % stride) != 0u) {
    return 0u;
  }
  return span / stride;
}

extern "C" uint32_t isaac_playerhud_856960_move_range(
    uint8_t* dest, uint8_t* src_begin, uint8_t* src_end) {
  /* PE VA 0x00856960..0x00856998 (ret 0xc). stdcall 3 args:
     [ebp+8]=src_begin(esi), [ebp+0xc]=src_end(ebx), [ebp+0x10]=dest(edi).
     Gate: cmp esi,ebx; je TAIL (full dword). Loop: push src;
     mov ecx,dest; call 0x856e10 (this=dest, arg=src move-ctor);
     add esi,0x68; add edi,0x68; cmp esi,ebx; jne LOOP. TAIL:
     push ecx; mov edx,edi; mov ecx,edi; call 0x856840; add esp,4 —
     begin==end (both dest_end) invariant: always a no-op, omitted.
     Return: mov eax,edi = dest_end (dest_begin + count*0x68); ret 0xc.
     src elements are MOVED: each 0x856e10 call empties its source. */
  if (dest == nullptr || src_begin == nullptr || src_end == nullptr) {
    return 0u;
  }
  if (src_begin == src_end) {
    return static_cast<uint32_t>(reinterpret_cast<uintptr_t>(dest));
  }
  uint8_t* d = dest;
  uint8_t* s = src_begin;
  while (s != src_end) {
    isaac_playerhud_856e10_move_ctor(d, s);
    s += ISAAC_PLAYERHUD_856960_STRIDE;
    d += ISAAC_PLAYERHUD_856960_STRIDE;
  }
  return static_cast<uint32_t>(reinterpret_cast<uintptr_t>(d));
}

extern "C" uint32_t isaac_playerhud_856960_stride(void) {
  return ISAAC_PLAYERHUD_856960_STRIDE;
}

extern "C" uint32_t isaac_playerhud_856960_move_ctor_va(void) {
  return ISAAC_PLAYERHUD_856960_MOVE_CTOR_VA;
}

extern "C" uint32_t isaac_playerhud_856960_wipe_va(void) {
  /* PE 0x0085698a: trailing 0x856840 call, begin==end invariant. */
  return ISAAC_PLAYERHUD_856960_WIPE_VA;
}

extern "C" uint32_t isaac_playerhud_856960_next_va(void) {
  return ISAAC_PLAYERHUD_856960_NEXT_VA;
}


extern "C" int32_t isaac_playerhud_84dea0_needed(uint32_t this_plus_4) {
  /* PE 0x0084decb / 0x0084e23f: cmp dword ptr [esi+4], 0; je SKIP.
     Full-dword != 0 runs the six host 0x84dc00 calls. */
  return this_plus_4 != 0u ? 1 : 0;
}

extern "C" void isaac_playerhud_84dea0_plan(IsaacPlayerHud84dea0Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084dea0 / sibling 0x0084e200. Six host 0x84dc00 calls.
     xmm1 offs are v19 0x84e9d0 slot base+4 by reference.
     0x84dc00 / 0x84ea90 / 0x84eb10 not folded. */
  out->call_count = ISAAC_PLAYERHUD_84DEA0_CALL_COUNT;
  out->host_va = ISAAC_PLAYERHUD_84DEA0_HOST_VA;
  out->gate_off = ISAAC_PLAYERHUD_84DEA0_GATE_OFF;
  out->player_ptr_off = ISAAC_PLAYERHUD_84DEA0_PLAYER_PTR_OFF;
  out->slot_count = ISAAC_PLAYERHUD_84DEA0_SLOT_COUNT;
  out->slot_stride = ISAAC_PLAYERHUD_84DEA0_SLOT_STRIDE;
  out->xmm1_off_0 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_0;
  out->label_va_0 = ISAAC_PLAYERHUD_84DEA0_LABEL_VA_0;
  out->label_size_0 = ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_0;
  out->xmm1_off_1 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_1;
  out->label_va_1 = ISAAC_PLAYERHUD_84DEA0_LABEL_VA_1;
  out->label_size_1 = ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_1;
  out->xmm1_off_2 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_2;
  out->label_va_2 = ISAAC_PLAYERHUD_84DEA0_LABEL_VA_2;
  out->label_size_2 = ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_2;
  out->xmm1_off_3 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_3;
  out->label_va_3 = ISAAC_PLAYERHUD_84DEA0_LABEL_VA_3;
  out->label_size_3 = ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_3;
  out->xmm1_off_4 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_4;
  out->label_va_4 = ISAAC_PLAYERHUD_84DEA0_LABEL_VA_4;
  out->label_size_4 = ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_4;
  out->xmm1_off_5 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_5;
  out->label_va_5 = ISAAC_PLAYERHUD_84DEA0_LABEL_VA_5;
  out->label_size_5 = ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_5;
  out->xorps_rdata = ISAAC_PLAYERHUD_84E200_RDATA_NEG;
  out->xorps_sibling = ISAAC_PLAYERHUD_84E200_XORPS;
  out->next_va = ISAAC_PLAYERHUD_84DEA0_NEXT_VA;
  out->sibling_next_va = ISAAC_PLAYERHUD_84E200_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_84dea0_call_count(void) {
  return ISAAC_PLAYERHUD_84DEA0_CALL_COUNT;
}

extern "C" uint32_t isaac_playerhud_84dea0_xmm1_off_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_0;
  }
  if (index == 1u) {
    return ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_1;
  }
  if (index == 2u) {
    return ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_2;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_3;
  }
  if (index == 4u) {
    return ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_4;
  }
  if (index == 5u) {
    return ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_5;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84dea0_label_va_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_VA_0;
  }
  if (index == 1u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_VA_1;
  }
  if (index == 2u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_VA_2;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_VA_3;
  }
  if (index == 4u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_VA_4;
  }
  if (index == 5u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_VA_5;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84dea0_label_size_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_0;
  }
  if (index == 1u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_1;
  }
  if (index == 2u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_2;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_3;
  }
  if (index == 4u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_4;
  }
  if (index == 5u) {
    return ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_5;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84dea0_host_va(void) {
  return ISAAC_PLAYERHUD_84DEA0_HOST_VA;
}

extern "C" uint32_t isaac_playerhud_84dea0_next_va(void) {
  return ISAAC_PLAYERHUD_84DEA0_NEXT_VA;
}

extern "C" int32_t isaac_playerhud_84e200_xorps_needed(void) {
  return ISAAC_PLAYERHUD_84E200_XORPS;
}

extern "C" uint32_t isaac_playerhud_84e200_next_va(void) {
  return ISAAC_PLAYERHUD_84E200_NEXT_VA;
}


extern "C" uint32_t isaac_playerhud_84e5b0_count(uint32_t begin,
                                                uint32_t end) {
  /* PE 0x0084e5c7..0x0084e5d9: edx=[this+0x30]-[this+0x2c];
     imul 0x4ec4ec4f; sar edx,5; add sign-bit. Signed /0x68
     toward zero. v22 OBJECT_SIZE / v26 STRIDE by reference. */
  const int32_t span = static_cast<int32_t>(end - begin);
  const int32_t stride =
      static_cast<int32_t>(ISAAC_PLAYERHUD_84E5B0_STRIDE);
  return static_cast<uint32_t>(span / stride);
}

extern "C" int32_t isaac_playerhud_84e5b0_in_range(uint32_t index,
                                                  uint32_t begin,
                                                  uint32_t end) {
  /* PE 0x0084e5db: cmp ecx,eax ; jae FAIL. Unsigned. */
  return index < isaac_playerhud_84e5b0_count(begin, end) ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e5b0_early_true(
    uint32_t this_plus_4) {
  /* PE 0x0084e5e3: cmp dword ptr [esi+4], 0; je SUCCESS.
     Full dword. Same gate off as v27, inverted polarity. */
  return this_plus_4 == 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e5b0_prefix(uint32_t index,
                                                uint32_t begin,
                                                uint32_t end,
                                                uint32_t this_plus_4) {
  /* Bounds check runs before the [this+4] early-true. */
  if (isaac_playerhud_84e5b0_in_range(index, begin, end) == 0) {
    return ISAAC_PLAYERHUD_84E5B0_PREFIX_FAIL;
  }
  if (isaac_playerhud_84e5b0_early_true(this_plus_4) != 0) {
    return ISAAC_PLAYERHUD_84E5B0_PREFIX_EARLY;
  }
  return ISAAC_PLAYERHUD_84E5B0_PREFIX_CONT;
}

extern "C" uint32_t isaac_playerhud_84e5b0_object_off(uint32_t index) {
  /* PE 0x0084e5f4: imul esi, ecx, 0x68. 32-bit wrap. */
  return index * static_cast<uint32_t>(ISAAC_PLAYERHUD_84E5B0_STRIDE);
}

extern "C" uint32_t isaac_playerhud_84e5b0_dword_count(uint32_t begin,
                                                      uint32_t end) {
  /* PE 0x0084e604: sub edx,eax ; sar edx,2. Signed. */
  return static_cast<uint32_t>(static_cast<int32_t>(end - begin) >> 2);
}

extern "C" int32_t isaac_playerhud_84e5b0_whitelist_ok(uint32_t count,
                                                      uint32_t has) {
  /* PE 0x0084e609 test edx,edx ; je OK. Match je OK.
     Exhausted nonempty -> FAIL. Wide has != 0 is a hit. */
  if (count == 0u) {
    return 1;
  }
  return has != 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e5b0_blacklist_ok(uint32_t has) {
  /* PE 0x0084e646: match je FAIL. Empty or no match OK. */
  return has == 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e5b0_completion_prefix(uint32_t id) {
  /* PE 0x0084e73e..0x0084e754.
     0 -> skip; -2 -> fail; js -> skip; jae 0x282 -> fail; else host. */
  if (id == 0u) {
    return 1;
  }
  if (id == static_cast<uint32_t>(ISAAC_PLAYERHUD_84E5B0_COMPLETION_NEG2)) {
    return 0;
  }
  if (static_cast<int32_t>(id) < 0) {
    return 1;
  }
  if (id >= static_cast<uint32_t>(ISAAC_PLAYERHUD_84E5B0_COMPLETION_MAX)) {
    return 0;
  }
  return 2;
}

extern "C" int32_t isaac_playerhud_84e5b0_mode_ok(uint32_t this_mode,
                                                 uint32_t obj_64,
                                                 uint32_t flags,
                                                 uint32_t game_269c8) {
  /* PE 0x0084e78f..0x0084e81a. al starts 1.
     obj+0x64==0 or [this]==0 -> true.
     mode 1: bit15 / ~bit15; mode 2: bit11 / ~bit11.
     mode 3 + obj+0x64==1: game+0x269c8 in {2,3} (host recapture).
     Full-dword cmps. flags shr is logical (uint32). */
  if (obj_64 == 0u) {
    return 1;
  }
  if (this_mode == 0u) {
    return 1;
  }
  if (this_mode == 1u) {
    if (obj_64 == 1u) {
      return static_cast<int32_t>(
          (flags >> static_cast<uint32_t>(
                        ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE1)) &
          1u);
    }
    if (obj_64 == 2u) {
      return static_cast<int32_t>(
          (~(flags >> static_cast<uint32_t>(
                          ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE1))) &
          1u);
    }
    return 1;
  }
  if (this_mode == 2u) {
    const uint32_t shifted =
        flags >>
        static_cast<uint32_t>(ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE2);
    if (obj_64 == 1u) {
      return static_cast<int32_t>(shifted & 1u);
    }
    if (obj_64 == 2u) {
      return static_cast<int32_t>((~shifted) & 1u);
    }
    return 1;
  }
  if (this_mode != 3u) {
    return 1;
  }
  if (obj_64 != 1u) {
    return 1;
  }
  if (game_269c8 == 2u || game_269c8 == 3u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_playerhud_84e5b0_decide(
    uint32_t index, uint32_t begin, uint32_t end, uint32_t this_plus_4,
    uint32_t wl_count, uint32_t wl_has, uint32_t bl_has, uint32_t req_col_ok,
    uint32_t forb_col_hit, uint32_t req_trk_ok, uint32_t forb_trk_hit,
    uint32_t completion_ok, uint32_t this_mode, uint32_t obj_64, uint32_t flags,
    uint32_t game_269c8) {
  /* Combiner. Host probes recaptured as the four ok/hit
     dwords plus completion_ok. 0x7706e0 / 0x771550 / +0x60
     globals stay host. */
  const int32_t prefix =
      isaac_playerhud_84e5b0_prefix(index, begin, end, this_plus_4);
  if (prefix == ISAAC_PLAYERHUD_84E5B0_PREFIX_FAIL) {
    return 0;
  }
  if (prefix == ISAAC_PLAYERHUD_84E5B0_PREFIX_EARLY) {
    return 1;
  }
  if (isaac_playerhud_84e5b0_whitelist_ok(wl_count, wl_has) == 0) {
    return 0;
  }
  if (isaac_playerhud_84e5b0_blacklist_ok(bl_has) == 0) {
    return 0;
  }
  if (req_col_ok == 0u) {
    return 0;
  }
  if (forb_col_hit != 0u) {
    return 0;
  }
  if (req_trk_ok == 0u) {
    return 0;
  }
  if (forb_trk_hit != 0u) {
    return 0;
  }
  if (completion_ok == 0u) {
    return 0;
  }
  return isaac_playerhud_84e5b0_mode_ok(this_mode, obj_64, flags,
                                        game_269c8);
}

extern "C" void isaac_playerhud_84e5b0_plan(IsaacPlayerHud84e5b0Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084e5b0..0x0084e81a ret 0xc. thiscall + 3 stack args.
     Parent vector this+0x2c/+0x30 of 0x68 objects (v22 by ref).
     Sub-vectors are v25 0x84dbc0 this-offs low-to-high.
     0x7706e0 / 0x771550 not folded. */
  out->stride = ISAAC_PLAYERHUD_84E5B0_STRIDE;
  out->vec_begin_off = ISAAC_PLAYERHUD_84E5B0_VEC_BEGIN_OFF;
  out->vec_end_off = ISAAC_PLAYERHUD_84E5B0_VEC_END_OFF;
  out->gate_off = ISAAC_PLAYERHUD_84E5B0_GATE_OFF;
  out->player_type_off = ISAAC_PLAYERHUD_84E5B0_PLAYER_TYPE_OFF;
  out->vec_off_0 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_0;
  out->vec_off_1 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_1;
  out->vec_off_2 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_2;
  out->vec_off_3 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_3;
  out->vec_off_4 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_4;
  out->vec_off_5 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_5;
  out->completion_off = ISAAC_PLAYERHUD_84E5B0_COMPLETION_OFF;
  out->mode_off = ISAAC_PLAYERHUD_84E5B0_MODE_OFF;
  out->host_va_col = ISAAC_PLAYERHUD_84E5B0_HOST_VA_COL;
  out->host_va_trk = ISAAC_PLAYERHUD_84E5B0_HOST_VA_TRK;
  out->flag_shr_mode1 = ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE1;
  out->flag_shr_mode2 = ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE2;
  out->completion_max = ISAAC_PLAYERHUD_84E5B0_COMPLETION_MAX;
  out->next_va = ISAAC_PLAYERHUD_84E5B0_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_84e5b0_vec_off_at(uint32_t index) {
  if (index == 0u) {
    return ISAAC_PLAYERHUD_84E5B0_VEC_OFF_0;
  }
  if (index == 1u) {
    return ISAAC_PLAYERHUD_84E5B0_VEC_OFF_1;
  }
  if (index == 2u) {
    return ISAAC_PLAYERHUD_84E5B0_VEC_OFF_2;
  }
  if (index == 3u) {
    return ISAAC_PLAYERHUD_84E5B0_VEC_OFF_3;
  }
  if (index == 4u) {
    return ISAAC_PLAYERHUD_84E5B0_VEC_OFF_4;
  }
  if (index == 5u) {
    return ISAAC_PLAYERHUD_84E5B0_VEC_OFF_5;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84e5b0_host_va_at(uint32_t index) {
  if (index == 2u || index == 3u) {
    return ISAAC_PLAYERHUD_84E5B0_HOST_VA_COL;
  }
  if (index == 4u || index == 5u) {
    return ISAAC_PLAYERHUD_84E5B0_HOST_VA_TRK;
  }
  return 0u;
}

extern "C" int32_t isaac_playerhud_84e5b0_fail_if_al_at(uint32_t index) {
  /* 0/1 char lists: no host. 2/4 required: je FAIL (al==0).
     3/5 forbidden: jne FAIL (al!=0). */
  if (index == 3u || index == 5u) {
    return 1;
  }
  return 0;
}

extern "C" uint32_t isaac_playerhud_84e5b0_stride(void) {
  return ISAAC_PLAYERHUD_84E5B0_STRIDE;
}

extern "C" uint32_t isaac_playerhud_84e5b0_next_va(void) {
  return ISAAC_PLAYERHUD_84E5B0_NEXT_VA;
}

extern "C" int32_t isaac_playerhud_84e820_gate_zero(uint32_t this_plus_4) {
  /* PE 0x0084e82e: test ebx, ebx; je early-return /0x68 count.
     Full dword. Same ==0 polarity as v28 early-true; here it
     returns the parent-vector count and skips the game list. */
  return this_plus_4 == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_playerhud_84e820_count(uint32_t begin,
                                                uint32_t end) {
  /* PE 0x0084e832..0x0084e847 and 0x0084e90b..0x0084e928:
     signed toward-zero /0x68. v28 count / v22 OBJECT_SIZE by ref. */
  return isaac_playerhud_84e5b0_count(begin, end);
}

extern "C" uint32_t isaac_playerhud_84e820_ptr_count(uint32_t begin,
                                                    uint32_t end) {
  /* PE 0x0084e875: sub eax,ecx ; sar eax,2. Signed. Game+0x2a448
     dword vector. Same recipe as v28 dword_count. */
  return isaac_playerhud_84e5b0_dword_count(begin, end);
}

extern "C" int32_t isaac_playerhud_84e820_in_range(uint32_t index,
                                                  uint32_t count) {
  /* PE 0x0084e882 test esi,esi; js SKIP. 0x0084e88e cmp esi,eax;
     jge SKIP. Signed body gate. */
  return (static_cast<int32_t>(index) >= 0 &&
          static_cast<int32_t>(index) < static_cast<int32_t>(count))
             ? 1
             : 0;
}

extern "C" int32_t isaac_playerhud_84e820_loop_cont(uint32_t index,
                                                   uint32_t count) {
  /* PE 0x0084e903: cmp esi,eax ; jb LOOP. Unsigned. */
  return index < count ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e820_range_empty(uint32_t lo,
                                                     uint32_t hi) {
  /* PE 0x0084e8ac: mov eax,[ecx+8]; or eax,[ecx+0xc]; je special. */
  return (lo | hi) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e820_special_ok(uint32_t kind,
                                                    uint32_t mode,
                                                    uint32_t this_plus_4) {
  /* PE 0x0084e980..0x0084e9bb. cmp dword [ptr], 0xf; then
     [this]==0 && ([this+4]==0x23 || ==0x106), or
     [this]==1 && [this+4]==0x30. Full-dword cmps. */
  if (kind != static_cast<uint32_t>(ISAAC_PLAYERHUD_84E820_SPECIAL_KIND)) {
    return 0;
  }
  if (mode == 0u) {
    if (this_plus_4 == static_cast<uint32_t>(
            ISAAC_PLAYERHUD_84E820_CHAR_MODE0_A) ||
        this_plus_4 == static_cast<uint32_t>(
            ISAAC_PLAYERHUD_84E820_CHAR_MODE0_B)) {
      return 1;
    }
    return 0;
  }
  if (mode == 1u) {
    return this_plus_4 == static_cast<uint32_t>(
               ISAAC_PLAYERHUD_84E820_CHAR_MODE1)
               ? 1
               : 0;
  }
  return 0;
}

extern "C" int32_t isaac_playerhud_84e820_al_hit(uint32_t host_al) {
  /* PE 0x0084e8ce / 0x0084e8ec / 0x0084e954: test al, al. Low byte. */
  return (host_al & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_playerhud_84e820_entry_inc(
    uint32_t ptr, uint32_t lo, uint32_t hi, uint32_t kind, uint32_t mode,
    uint32_t this_plus_4, uint32_t host_al) {
  /* Null ptr skips. Empty range takes the 0xf char-id island.
     Else mode 0/1 recapture host al; other [this] skips. */
  if (ptr == 0u) {
    return 0;
  }
  if (isaac_playerhud_84e820_range_empty(lo, hi) != 0) {
    return isaac_playerhud_84e820_special_ok(kind, mode, this_plus_4);
  }
  if (mode != 0u && mode != 1u) {
    return 0;
  }
  return isaac_playerhud_84e820_al_hit(host_al);
}

extern "C" uint32_t isaac_playerhud_84e820_extra_sum(uint32_t extra_count,
                                                    uint32_t acc) {
  /* PE 0x0084e928 add ebx,edx (ZF iff extra==0); lea ebx,[ebx+ecx];
     cmove ebx,ecx. Result is extra+acc; cmove is a no-op when extra==0. */
  if (extra_count == 0u) {
    return acc;
  }
  return extra_count + acc;
}

extern "C" int32_t isaac_playerhud_84e820_decide(
    uint32_t index, uint32_t ptr_count, uint32_t ptr, uint32_t lo, uint32_t hi,
    uint32_t kind, uint32_t mode, uint32_t this_plus_4, uint32_t host_al) {
  /* One Game-list entry. Signed in-range before load. Hosts
     0x72fe80 / 0x72fec0 recaptured as host_al. */
  if (isaac_playerhud_84e820_in_range(index, ptr_count) == 0) {
    return 0;
  }
  return isaac_playerhud_84e820_entry_inc(ptr, lo, hi, kind, mode, this_plus_4,
                                          host_al);
}

extern "C" void isaac_playerhud_84e820_plan(IsaacPlayerHud84e820Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE VA 0x0084e820..0x0084e97d ret 8. thiscall + 2 stdcall args.
     Cold tails 0x84e980 / 0x84e9c0 still in-body. 0x72fe80 /
     0x72fec0 / 0x84e5b0 not folded. Next body 0x84e9d0 (v19). */
  out->stride = ISAAC_PLAYERHUD_84E820_STRIDE;
  out->gate_off = ISAAC_PLAYERHUD_84E820_GATE_OFF;
  out->vec_begin_off = ISAAC_PLAYERHUD_84E820_VEC_BEGIN_OFF;
  out->vec_end_off = ISAAC_PLAYERHUD_84E820_VEC_END_OFF;
  out->extra_begin_off = ISAAC_PLAYERHUD_84E820_EXTRA_BEGIN_OFF;
  out->extra_end_off = ISAAC_PLAYERHUD_84E820_EXTRA_END_OFF;
  out->game_begin_off = ISAAC_PLAYERHUD_84E820_GAME_BEGIN_OFF;
  out->game_end_off = ISAAC_PLAYERHUD_84E820_GAME_END_OFF;
  out->range_lo_off = ISAAC_PLAYERHUD_84E820_RANGE_LO_OFF;
  out->range_hi_off = ISAAC_PLAYERHUD_84E820_RANGE_HI_OFF;
  out->special_kind = ISAAC_PLAYERHUD_84E820_SPECIAL_KIND;
  out->char_mode0_a = ISAAC_PLAYERHUD_84E820_CHAR_MODE0_A;
  out->char_mode0_b = ISAAC_PLAYERHUD_84E820_CHAR_MODE0_B;
  out->char_mode1 = ISAAC_PLAYERHUD_84E820_CHAR_MODE1;
  out->host_va_mode0 = ISAAC_PLAYERHUD_84E820_HOST_VA_MODE0;
  out->host_va_mode1 = ISAAC_PLAYERHUD_84E820_HOST_VA_MODE1;
  out->host_va_pred = ISAAC_PLAYERHUD_84E820_HOST_VA_PRED;
  out->next_va = ISAAC_PLAYERHUD_84E820_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_84e820_host_va_at(uint32_t mode) {
  if (mode == 0u) {
    return ISAAC_PLAYERHUD_84E820_HOST_VA_MODE0;
  }
  if (mode == 1u) {
    return ISAAC_PLAYERHUD_84E820_HOST_VA_MODE1;
  }
  return 0u;
}

extern "C" uint32_t isaac_playerhud_84e820_stride(void) {
  return ISAAC_PLAYERHUD_84E820_STRIDE;
}

extern "C" uint32_t isaac_playerhud_84e820_next_va(void) {
  return ISAAC_PLAYERHUD_84E820_NEXT_VA;
}


extern "C" uint32_t isaac_playerhud_host_va_log(void) {
  return ISAAC_PLAYERHUD_HOST_VA_LOG;
}

extern "C" uint32_t isaac_playerhud_post_update_pure_helpers_abi_version(void) {
  return ISAAC_PLAYERHUD_POST_UPDATE_PURE_HELPERS_ABI_VERSION;
}


/* ---- ABI v39: 7-leaf StatHUD conversion cluster (VA 0x009bfc00..0x009bfd38)
 *  HUD lane (ownership handed by the PI family process-input-v50-9bfc00;
 *  re-verified this unit: sole callers live in the 0x770000 HUD StatHUD
 *  stat-bar body except 0x9bfc40 whose caller 0x7619d3 sits in an
 *  entity-behavior body — same v32/v33 stat slots 0x1460/0x1470/0x1480/
 *  0x1568).  All leaves: xmm0 in / xmm0 out, ret 0, 1 direct rel32
 *  caller each.  4 pure (0 E8) + 3 pow-composed (blob-gated: host
 *  resolves the 0x4e4690 powf probe; the PI "atan2f" mis-ID CORRECTED —
 *  0x4e4690 = cvtss2sd x2; call 0xaf08ff; cvtsd2ss, and 0xaf08ff = jmp
 *  [IAT 0xb18830] = api-ms-win-crt-math-l1-1-0.dll._libm_sse2_pow_precise).
 *  Each SSE op is ONE f32 rounding (wasm f32, no fast-math). */

/* PE 0x009bfc00: mulss xmm0,[0xbaa778]; subss xmm0,[0xbaa630]; ret.
   law: x*4.5f - 2.0f (two roundings: mul then sub). */
extern "C" uint32_t isaac_playerhud_9bfc00_law(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float m = x * 4.5f;
  const float r = m - 2.0f;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_playerhud_9bfc00_va(void) {
  return ISAAC_PLAYERHUD_9BFC00_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc00_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFC00_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc00_next_va(void) {
  return ISAAC_PLAYERHUD_9BFC00_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc00_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFC00_CALLER1_VA;
}

/* PE 0x009bfc20: addss xmm0,[0xbaa630]; divss xmm0,[0xbaa778]; ret.
   law: (x + 2.0f) / 4.5f (add then div). */
extern "C" uint32_t isaac_playerhud_9bfc20_law(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float a = x + 2.0f;
  const float r = a / 4.5f;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_playerhud_9bfc20_va(void) {
  return ISAAC_PLAYERHUD_9BFC20_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc20_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFC20_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc20_next_va(void) {
  return ISAAC_PLAYERHUD_9BFC20_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc20_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFC20_CALLER1_VA;
}

/* PE 0x009bfc40:
     movaps xmm1,xmm0        ; xmm1 = x
     push   ecx
     addss  xmm1,[0xbaa454]  ; x+1.0f
     movss  xmm0,[0xbaa8d0]  ; 30.0f
     divss  xmm0,xmm1        ; 30.0f/(x+1.0f)
     movss  xmm1,[0xbaa380]  ; 0.75f
     call   0x4e4690         ; powf(base, 0.75f)  (host probe)
     mulss  xmm0,[0xbaa664]  ; * 2.12039089f
     subss  xmm0,[0xbaa630]  ; - 2.0f
     pop    ecx
     ret
   pow base (pure): 30.0f/(x+1.0f); exp bits = 0.75f.
   law(x, pow_bits): pow_bits * 2.12039089f - 2.0f (mul then sub). */
extern "C" uint32_t isaac_playerhud_9bfc40_pow_base(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float a = x + 1.0f;
  const float base = 30.0f / a;
  return __builtin_bit_cast(uint32_t, base);
}

extern "C" uint32_t isaac_playerhud_9bfc40_pow_exp_bits(void) {
  return ISAAC_PLAYERHUD_9BFC_075F_BITS;
}

extern "C" uint32_t isaac_playerhud_9bfc40_law(uint32_t x_bits,
                                              uint32_t pow_bits) {
  (void)x_bits; /* x only feeds the host's pow probe via pow_base. */
  const float p = __builtin_bit_cast(float, pow_bits);
  const float m = p * 2.12039089f;
  const float r = m - 2.0f;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_playerhud_9bfc40_va(void) {
  return ISAAC_PLAYERHUD_9BFC40_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc40_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFC40_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc40_next_va(void) {
  return ISAAC_PLAYERHUD_9BFC40_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc40_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFC40_CALLER1_VA;
}

/* PE 0x009bfc80:
     comiss xmm0,[0xbaad74]  ; vs -2.0f
     jbe 0x9bfcbe            ; x <= -2.0f OR unordered (NaN) -> 10000.0f
     addss  xmm0,[0xbaa630]  ; x+2.0f
     movss  xmm1,[0xbaa4ec]  ; 1.33333337f
     mulss  xmm0,[0xbaa2c0]  ; (x+2.0f)*0.471611142f
     call   0x4e4690         ; powf(base, 1.33333337f)  (host probe)
     movss  xmm1,[0xbaa8d0]  ; 30.0f
     divss  xmm1,xmm0        ; 30.0f/pow
     subss  xmm1,[0xbaa454]  ; - 1.0f
     movaps xmm0,xmm1
     ret
     0x9bfcbe: movss xmm0,[0xbaac34] ; 10000.0f
     ret
   gate: jbe on comiss flags — CF|ZF for x <= -2.0f AND for unordered
   (NaN takes the constant branch): mirrored as !(x > -2.0f).
   pow base (pure): (x+2.0f)*0.471611142f; exp = 1.33333337f.
   law(x, pow_bits): gate ? 10000.0f : 30.0f/pow - 1.0f. */
extern "C" uint32_t isaac_playerhud_9bfc80_gate(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  return !(x > -2.0f) ? 1u : 0u;
}

extern "C" uint32_t isaac_playerhud_9bfc80_pow_base(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float a = x + 2.0f;
  const float base = a * 0.471611142f;
  return __builtin_bit_cast(uint32_t, base);
}

extern "C" uint32_t isaac_playerhud_9bfc80_pow_exp_bits(void) {
  return ISAAC_PLAYERHUD_9BFC_13333F_BITS;
}

extern "C" uint32_t isaac_playerhud_9bfc80_law(uint32_t x_bits,
                                              uint32_t pow_bits) {
  if (isaac_playerhud_9bfc80_gate(x_bits) != 0u) {
    return ISAAC_PLAYERHUD_9BFC_10000F_BITS;
  }
  const float p = __builtin_bit_cast(float, pow_bits);
  const float d = 30.0f / p;
  const float r = d - 1.0f;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_playerhud_9bfc80_va(void) {
  return ISAAC_PLAYERHUD_9BFC80_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc80_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFC80_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc80_next_va(void) {
  return ISAAC_PLAYERHUD_9BFC80_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc80_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFC80_CALLER1_VA;
}

/* PE 0x009bfcd0:
     comiss xmm0,[0xbaad74]  ; vs -2.0f
     jbe 0x9bfcf6            ; x <= -2.0f OR unordered (NaN) -> 0.0f
     addss  xmm0,[0xbaa630]  ; x+2.0f
     movss  xmm1,[0xbaa5b0]  ; 1.78571427f
     mulss  xmm0,[0xbaa2b0]  ; (x+2.0f)*0.44819352f
     jmp 0x4e4690            ; tail: powf(base, 1.78571427f) (host probe)
     0x9bfcf6: xorps xmm0,xmm0 ; 0.0f
     ret
   gate: same comiss/jbe as 0x9bfc80.
   pow base (pure): (x+2.0f)*0.44819352f; exp = 1.78571427f.
   law(x, pow_bits): gate ? 0.0f : pow_bits (tail jmp = identity post). */
extern "C" uint32_t isaac_playerhud_9bfcd0_gate(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  return !(x > -2.0f) ? 1u : 0u;
}

extern "C" uint32_t isaac_playerhud_9bfcd0_pow_base(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float a = x + 2.0f;
  const float base = a * 0.44819352f;
  return __builtin_bit_cast(uint32_t, base);
}

extern "C" uint32_t isaac_playerhud_9bfcd0_pow_exp_bits(void) {
  return ISAAC_PLAYERHUD_9BFC_17857F_BITS;
}

extern "C" uint32_t isaac_playerhud_9bfcd0_law(uint32_t x_bits,
                                              uint32_t pow_bits) {
  if (isaac_playerhud_9bfcd0_gate(x_bits) != 0u) {
    return 0u; /* xorps xmm0,xmm0 -> 0.0f */
  }
  return pow_bits;
}

extern "C" uint32_t isaac_playerhud_9bfcd0_va(void) {
  return ISAAC_PLAYERHUD_9BFCD0_VA;
}

extern "C" uint32_t isaac_playerhud_9bfcd0_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFCD0_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfcd0_next_va(void) {
  return ISAAC_PLAYERHUD_9BFCD0_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfcd0_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFCD0_CALLER1_VA;
}

/* PE 0x009bfd00: subss xmm0,[0xbaaac0]; divss xmm0,[0xbaa950];
   addss xmm0,[0xbaa630]; ret.  law: (x - 230.0f)/60.0f + 2.0f. */
extern "C" uint32_t isaac_playerhud_9bfd00_law(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float s = x - 230.0f;
  const float d = s / 60.0f;
  const float r = d + 2.0f;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_playerhud_9bfd00_va(void) {
  return ISAAC_PLAYERHUD_9BFD00_VA;
}

extern "C" uint32_t isaac_playerhud_9bfd00_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFD00_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfd00_next_va(void) {
  return ISAAC_PLAYERHUD_9BFD00_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfd00_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFD00_CALLER1_VA;
}

/* PE 0x009bfd20: subss xmm0,[0xbaa630]; mulss xmm0,[0xbaa950];
   addss xmm0,[0xbaaac0]; ret.  law: (x - 2.0f)*60.0f + 230.0f. */
extern "C" uint32_t isaac_playerhud_9bfd20_law(uint32_t x_bits) {
  const float x = __builtin_bit_cast(float, x_bits);
  const float s = x - 2.0f;
  const float m = s * 60.0f;
  const float r = m + 230.0f;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_playerhud_9bfd20_va(void) {
  return ISAAC_PLAYERHUD_9BFD20_VA;
}

extern "C" uint32_t isaac_playerhud_9bfd20_ret_va(void) {
  return ISAAC_PLAYERHUD_9BFD20_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9bfd20_next_va(void) {
  return ISAAC_PLAYERHUD_9BFD20_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9bfd20_caller1_va(void) {
  return ISAAC_PLAYERHUD_9BFD20_CALLER1_VA;
}

extern "C" uint32_t isaac_playerhud_9bfc_host_va_powf(void) {

  return ISAAC_PLAYERHUD_9BFC40_HOST_VA_POWF;
}

/* ---------------- ABI v40: 0x009c0120 / 0x009c0170 lerp visitors ---- */

extern "C" uint32_t isaac_playerhud_9c0120_clamp01(uint32_t f_bits) {
  const float f = __builtin_bit_cast(float, f_bits);
  /* PE maxss xmm,[0xba9fe4]=0.0f: (a>b)?a:b, unordered -> src2, so
     NaN and -0.0f both collapse to +0.0f.  PE minss xmm,[0xbaa454]=
     1.0f caps the top. */
  float t = f > 0.0f ? f : 0.0f;
  t = t < 1.0f ? t : 1.0f;
  return __builtin_bit_cast(uint32_t, t);
}

extern "C" uint32_t isaac_playerhud_9c0120_value(uint32_t a_bits,
                                                 uint32_t b_bits,
                                                 uint32_t f_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  /* PE 0x9c012e subss xmm1,[esi+8] -> d = b - a (per-op f32). */
  const float d = b - a;
  const float t = __builtin_bit_cast(
      float, isaac_playerhud_9c0120_clamp01(f_bits));
  /* PE 0x9c0150 mulss xmm1,xmm2; 0x9c0154 addss xmm1,[esi+8]. */
  const float m = d * t;
  const float r = a + m;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" void isaac_playerhud_9c0170_pair(uint32_t a_bits,
                                            uint32_t b_bits,
                                            uint32_t c_bits,
                                            uint32_t d_bits,
                                            uint32_t f_bits,
                                            IsaacPlayerHud9c0170Pair* out) {
  if (out == nullptr) {
    return;
  }
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  const float c = __builtin_bit_cast(float, c_bits);
  const float d = __builtin_bit_cast(float, d_bits);
  /* The machine clamps ONCE (0x9c0193/0x9c019b) and reuses t for
     both components. */
  const uint32_t t_bits = isaac_playerhud_9c0120_clamp01(f_bits);
  const float t = __builtin_bit_cast(float, t_bits);
  const float d0 = c - a;
  const float m0 = d0 * t;
  const float r0 = a + m0;
  const float d1 = d - b;
  const float m1 = d1 * t;
  const float r1 = b + m1;
  out->out0_bits = __builtin_bit_cast(uint32_t, r0);
  out->out1_bits = __builtin_bit_cast(uint32_t, r1);
  out->t_bits = t_bits;
}

/* v40 census pins. */

extern "C" uint32_t isaac_playerhud_9c0120_va(void) {
  return ISAAC_PLAYERHUD_9C0120_VA;
}

extern "C" uint32_t isaac_playerhud_9c0120_ret_va(void) {
  return ISAAC_PLAYERHUD_9C0120_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9c0120_next_va(void) {
  return ISAAC_PLAYERHUD_9C0120_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9c0120_vtable_ref_rdata(void) {
  return ISAAC_PLAYERHUD_9C0120_VTABLE_REF_RDATA;
}

extern "C" uint32_t isaac_playerhud_9c0120_probe_slot(void) {
  return ISAAC_PLAYERHUD_9C0120_PROBE_SLOT;
}

extern "C" uint32_t isaac_playerhud_9c0120_probe_vtbl_off(void) {
  return ISAAC_PLAYERHUD_9C0120_PROBE_VTBL_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0120_a_off(void) {
  return ISAAC_PLAYERHUD_9C0120_A_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0120_b_off(void) {
  return ISAAC_PLAYERHUD_9C0120_B_OFF;
}

extern "C" uint32_t isaac_playerhud_clamp_lo_rdata(void) {
  return ISAAC_PLAYERHUD_CLAMP_LO_RDATA;
}

extern "C" uint32_t isaac_playerhud_clamp_hi_rdata(void) {
  return ISAAC_PLAYERHUD_CLAMP_HI_RDATA;
}

extern "C" uint32_t isaac_playerhud_clamp_zero_bits(void) {
  return ISAAC_PLAYERHUD_CLAMP_ZERO_BITS;
}

extern "C" uint32_t isaac_playerhud_clamp_one_bits(void) {
  return ISAAC_PLAYERHUD_CLAMP_ONE_BITS;
}

extern "C" uint32_t isaac_playerhud_9c0170_va(void) {
  return ISAAC_PLAYERHUD_9C0170_VA;
}

extern "C" uint32_t isaac_playerhud_9c0170_ret_va(void) {
  return ISAAC_PLAYERHUD_9C0170_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9c0170_next_va(void) {
  return ISAAC_PLAYERHUD_9C0170_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9c0170_vtable_ref_rdata(void) {
  return ISAAC_PLAYERHUD_9C0170_VTABLE_REF_RDATA;
}

extern "C" uint32_t isaac_playerhud_9c0170_ret_imm(void) {
  return ISAAC_PLAYERHUD_9C0170_RET_IMM;
}

extern "C" uint32_t isaac_playerhud_9c0170_a_off(void) {
  return ISAAC_PLAYERHUD_9C0170_A_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0170_b_off(void) {
  return ISAAC_PLAYERHUD_9C0170_B_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0170_c_off(void) {
  return ISAAC_PLAYERHUD_9C0170_C_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0170_d_off(void) {
  return ISAAC_PLAYERHUD_9C0170_D_OFF;
}

/* ---------------- ABI v41: 0x009c06a0 probe-sum vec2 law ---- */

extern "C" void isaac_playerhud_9c06a0_law(uint32_t a_bits,
                                           uint32_t b_bits,
                                           uint32_t c_bits,
                                           uint32_t d_bits,
                                           uint32_t g1_bits,
                                           uint32_t g2_bits,
                                           IsaacPlayerHud9c06a0Pair* out) {
  if (out == nullptr) {
    return;
  }
  const float a = __builtin_bit_cast(float, a_bits); /* [obj1+0] post-probe */
  const float b = __builtin_bit_cast(float, b_bits); /* [this+0x48]        */
  const float c = __builtin_bit_cast(float, c_bits); /* [obj1+4] post-probe */
  const float d = __builtin_bit_cast(float, d_bits); /* [this+0x4c]        */
  const float g1 = __builtin_bit_cast(float, g1_bits); /* BSS 0xc7997c     */
  const float g2 = __builtin_bit_cast(float, g2_bits); /* BSS 0xc79980     */
  const float k1 = __builtin_bit_cast(float, ISAAC_PLAYERHUD_K1_BITS);
  const float k2 = __builtin_bit_cast(float, ISAAC_PLAYERHUD_K2_BITS);
  /* PE 0x9c071a addss xmm3,[ebp-8]; 0x9c0712 mulss xmm0 (g1*K1);
     0x9c0729 addss xmm3,xmm0. */
  const float t0 = a + b;
  const float u0 = g1 * k1;
  const float r0 = t0 + u0;
  /* PE 0x9c0724 addss xmm2,[ebp-0x10]; 0x9c0735 mulss xmm0 (g2*K1);
     0x9c073d addss xmm2,xmm0; 0x9c0745 subss xmm2,[0xbaa804]. */
  const float t1 = c + d;
  const float u1 = g2 * k1;
  const float r1a = t1 + u1;
  const float r1 = r1a - k2;
  out->out0_bits = __builtin_bit_cast(uint32_t, r0);
  out->out1_bits = __builtin_bit_cast(uint32_t, r1);
}

/* v41 census pins. */

extern "C" uint32_t isaac_playerhud_9c06a0_va(void) {
  return ISAAC_PLAYERHUD_9C06A0_VA;
}

extern "C" uint32_t isaac_playerhud_9c06a0_ret_va(void) {
  return ISAAC_PLAYERHUD_9C06A0_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9c06a0_next_va(void) {
  return ISAAC_PLAYERHUD_9C06A0_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9c06a0_ret_imm(void) {
  return ISAAC_PLAYERHUD_9C06A0_RET_IMM;
}

extern "C" uint32_t isaac_playerhud_9c06a0_caller1_va(void) {
  return ISAAC_PLAYERHUD_9C06A0_CALLER1_VA;
}

extern "C" uint32_t isaac_playerhud_9c06a0_caller2_va(void) {
  return ISAAC_PLAYERHUD_9C06A0_CALLER2_VA;
}

extern "C" uint32_t isaac_playerhud_9c06a0_obj1_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_OBJ1_OFF;
}

extern "C" uint32_t isaac_playerhud_9c06a0_probe_slot(void) {
  return ISAAC_PLAYERHUD_9C06A0_PROBE_SLOT;
}

extern "C" uint32_t isaac_playerhud_9c06a0_probe_vtbl_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_PROBE_VTBL_OFF;
}

extern "C" uint32_t isaac_playerhud_9c06a0_obj1_x_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_OBJ1_X_OFF;
}

extern "C" uint32_t isaac_playerhud_9c06a0_obj1_y_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_OBJ1_Y_OFF;
}

extern "C" uint32_t isaac_playerhud_9c06a0_this_b_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_THIS_B_OFF;
}

extern "C" uint32_t isaac_playerhud_9c06a0_this_d_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_THIS_D_OFF;
}

extern "C" uint32_t isaac_playerhud_9c06a0_obj2_off(void) {
  return ISAAC_PLAYERHUD_9C06A0_OBJ2_OFF;
}

extern "C" uint32_t isaac_playerhud_global1_bss(void) {
  return ISAAC_PLAYERHUD_GLOBAL1_BSS;
}

extern "C" uint32_t isaac_playerhud_global2_bss(void) {
  return ISAAC_PLAYERHUD_GLOBAL2_BSS;
}

extern "C" uint32_t isaac_playerhud_k1_rdata(void) {
  return ISAAC_PLAYERHUD_K1_RDATA;
}

extern "C" uint32_t isaac_playerhud_k1_bits(void) {
  return ISAAC_PLAYERHUD_K1_BITS;
}

extern "C" uint32_t isaac_playerhud_k2_rdata(void) {
  return ISAAC_PLAYERHUD_K2_RDATA;
}

extern "C" uint32_t isaac_playerhud_k2_bits(void) {
  return ISAAC_PLAYERHUD_K2_BITS;
}

/* ---------------- ABI v42: 0x9c2210 slot-index advance machine ---- */

extern "C" int32_t isaac_playerhud_9c2210_advance(int32_t* index_cell,
                                                  int32_t arg,
                                                  const uint8_t* vec_begin,
                                                  const uint8_t* vec_end) {
  /* PE 0x9c2237/0x9c2259: magic 0x2aaaaaab imul; sar 3; shr 31 fixup
     == truncated-toward-zero division by the 0x30 stride. */
  const int32_t count = (int32_t)(vec_end - vec_begin) / 0x30;
  const int32_t orig = *index_cell; /* PE 0x9c2219 eax == [ebp-4] */
  int32_t esi = orig;
  int32_t cell = orig;
  int32_t failed = 0;
  for (;;) {
    const int32_t next = arg + esi; /* PE 0x9c2224 add edi,esi */
    esi = next;
    cell = next; /* PE 0x9c2228 store */
    if (next < 0) {
      if (orig < 0) { /* PE js 0x9c222f -> fail */
        failed = 1;
        break;
      }
      esi = next + count; /* PE 0x9c224e wrap up */
      cell = esi;         /* PE 0x9c2250 store */
    }
    if (esi >= count) { /* PE 0x9c2275 jl NOT taken */
      if (orig < 0) {   /* PE js 0x9c227b -> fail */
        failed = 1;
        break;
      }
      esi -= count; /* PE 0x9c227d wrap down */
      cell = esi;   /* PE 0x9c227f store */
    }
    if (esi == orig) { /* PE 0x9c2284 je done (no probe) */
      break;
    }
    /* PE 0x9c228b: probe elem[esi]+8 ONLY (not the +0xc twin).
       Offset math wraps mod 2^32 like the PE lea/add chain. */
    const uint32_t off =
        (uint32_t)esi * ISAAC_PLAYERHUD_9C2210_STRIDE +
        ISAAC_PLAYERHUD_9C2210_EMPTY_FLAG_OFF;
    int32_t flag;
    __builtin_memcpy(&flag, vec_begin + off, sizeof(flag));
    if (flag != -1) { /* occupied -> keep */
      break;
    }
    /* empty: esi carries as cur; head-eax stays orig (PE reloads
       [ebp-4] at 0x9c2292 -- invariant). */
  }
  *index_cell =
      failed ? (int32_t)ISAAC_PLAYERHUD_9C2210_FAIL_INDEX : cell;
  return *index_cell;
}

/* v42 census pins. */

extern "C" uint32_t isaac_playerhud_9c2210_va(void) {
  return ISAAC_PLAYERHUD_9C2210_VA;
}

extern "C" uint32_t isaac_playerhud_9c2210_ret_va(void) {
  return ISAAC_PLAYERHUD_9C2210_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9c2210_next_va(void) {
  return ISAAC_PLAYERHUD_9C2210_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9c2210_ret_imm(void) {
  return ISAAC_PLAYERHUD_9C2210_RET_IMM;
}

extern "C" uint32_t isaac_playerhud_9c2210_index_off(void) {
  return ISAAC_PLAYERHUD_9C2210_INDEX_OFF;
}

extern "C" uint32_t isaac_playerhud_9c2210_vec_begin_off(void) {
  return ISAAC_PLAYERHUD_9C2210_VEC_BEGIN_OFF;
}

extern "C" uint32_t isaac_playerhud_9c2210_vec_end_off(void) {
  return ISAAC_PLAYERHUD_9C2210_VEC_END_OFF;
}

extern "C" uint32_t isaac_playerhud_9c2210_stride(void) {
  return ISAAC_PLAYERHUD_9C2210_STRIDE;
}

extern "C" uint32_t isaac_playerhud_9c2210_div_magic(void) {
  return ISAAC_PLAYERHUD_9C2210_DIV_MAGIC;
}

extern "C" uint32_t isaac_playerhud_9c2210_div_shift(void) {
  return ISAAC_PLAYERHUD_9C2210_DIV_SHIFT;
}

extern "C" uint32_t isaac_playerhud_9c2210_empty_flag_off(void) {
  return ISAAC_PLAYERHUD_9C2210_EMPTY_FLAG_OFF;
}

extern "C" uint32_t isaac_playerhud_9c2210_empty_flag_bits(void) {
  return ISAAC_PLAYERHUD_9C2210_EMPTY_FLAG_BITS;
}

extern "C" uint32_t isaac_playerhud_9c2210_caller1_va(void) {
  return ISAAC_PLAYERHUD_9C2210_CALLER1_VA;
}

extern "C" uint32_t isaac_playerhud_9c2210_caller2_va(void) {
  return ISAAC_PLAYERHUD_9C2210_CALLER2_VA;
}

extern "C" uint32_t isaac_playerhud_9c2210_caller3_va(void) {
  return ISAAC_PLAYERHUD_9C2210_CALLER3_VA;
}

extern "C" uint32_t isaac_playerhud_9c2210_caller4_va(void) {
  return ISAAC_PLAYERHUD_9C2210_CALLER4_VA;
}

/* ---------------- ABI v43: 0x009c0870 merged slot-search/clear ----- */

extern "C" int32_t isaac_playerhud_9c0870_search_clear(
    int32_t* index_cell, int32_t which, int32_t lane, uint8_t* vec_begin,
    const uint8_t* vec_end) {
  const int32_t count = (int32_t)(vec_end - vec_begin) / 0x30;
  int32_t ordinal = 0;
  int32_t found = -1; /* PE esi at loop exit */
  for (int32_t i = 0; i < count; i++) {
    const uint32_t off = (uint32_t)i * ISAAC_PLAYERHUD_9C0870_STRIDE;
    int32_t f8;
    int32_t fc;
    __builtin_memcpy(&f8, vec_begin + off + ISAAC_PLAYERHUD_9C0870_FLAG_A_OFF,
                     sizeof(f8));
    __builtin_memcpy(&fc, vec_begin + off + ISAAC_PLAYERHUD_9C0870_FLAG_B_OFF,
                     sizeof(fc));
    if (f8 == -1 && fc == -1) {
      continue; /* EMPTY: not counted (PE 0x9c08b9 je) */
    }
    const int32_t old = ordinal; /* PE eax=edi */
    ordinal++;                   /* PE inc edi */
    if (old == which) {          /* PE cmp eax,[ebp+8]; je tail */
      found = i;
      break;
    }
  }
  if (found < 0) {
    return *index_cell; /* exhausted / count==0: plain ret @0x9c08d3 */
  }
  const uint32_t off = (uint32_t)found * ISAAC_PLAYERHUD_9C0870_STRIDE;
  uint8_t* p8 = vec_begin + off + ISAAC_PLAYERHUD_9C0870_FLAG_A_OFF;
  uint8_t* pc = vec_begin + off + ISAAC_PLAYERHUD_9C0870_FLAG_B_OFF;
  int32_t f8;
  int32_t fc;
  __builtin_memcpy(&f8, p8, sizeof(f8));
  __builtin_memcpy(&fc, pc, sizeof(fc));
  const int32_t neg1 = -1;
  if (lane != 0) {
    if (f8 != -1) { /* PE jne done @0x9c08ea */
      return *index_cell;
    }
    __builtin_memcpy(p8, &fc, sizeof(f8));   /* PE 0x9c08f0 */
    __builtin_memcpy(pc, &neg1, sizeof(fc)); /* PE 0x9c08fa */
  } else {
    if (fc != -1) { /* PE jne done @0x9c0909 */
      return *index_cell;
    }
    __builtin_memcpy(pc, &f8, sizeof(fc));   /* PE 0x9c090f */
    __builtin_memcpy(p8, &neg1, sizeof(f8)); /* PE 0x9c0919 */
  }
  int32_t cur = *index_cell;
  if (cur == found) {
    isaac_playerhud_9c2210_advance(index_cell, -1, vec_begin, vec_end);
    if (*index_cell == found) { /* PE cmp/jne @0x9c0931 */
      *index_cell = neg1;       /* PE 0x9c0938 */
    }
  } else if (cur == -1 && lane != 0) { /* PE 0x9c0946..4f */
    *index_cell = found;
  }
  return *index_cell;
}

/* v43 census pins. */

extern "C" uint32_t isaac_playerhud_9c0870_va(void) {
  return ISAAC_PLAYERHUD_9C0870_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_ret_va(void) {
  return ISAAC_PLAYERHUD_9C0870_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_ret_exhaust_va(void) {
  return ISAAC_PLAYERHUD_9C0870_RET_EXHAUST_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_ret_cleared_va(void) {
  return ISAAC_PLAYERHUD_9C0870_RET_CLEARED_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_next_va(void) {
  return ISAAC_PLAYERHUD_9C0870_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_ret_imm(void) {
  return ISAAC_PLAYERHUD_9C0870_RET_IMM;
}

extern "C" uint32_t isaac_playerhud_9c0870_index_off(void) {
  return ISAAC_PLAYERHUD_9C0870_INDEX_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0870_vec_begin_off(void) {
  return ISAAC_PLAYERHUD_9C0870_VEC_BEGIN_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0870_vec_end_off(void) {
  return ISAAC_PLAYERHUD_9C0870_VEC_END_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0870_stride(void) {
  return ISAAC_PLAYERHUD_9C0870_STRIDE;
}

extern "C" uint32_t isaac_playerhud_9c0870_div_magic(void) {
  return ISAAC_PLAYERHUD_9C0870_DIV_MAGIC;
}

extern "C" uint32_t isaac_playerhud_9c0870_div_shift(void) {
  return ISAAC_PLAYERHUD_9C0870_DIV_SHIFT;
}

extern "C" uint32_t isaac_playerhud_9c0870_flag_a_off(void) {
  return ISAAC_PLAYERHUD_9C0870_FLAG_A_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0870_flag_b_off(void) {
  return ISAAC_PLAYERHUD_9C0870_FLAG_B_OFF;
}

extern "C" uint32_t isaac_playerhud_9c0870_empty_bits(void) {
  return ISAAC_PLAYERHUD_9C0870_EMPTY_BITS;
}

extern "C" uint32_t isaac_playerhud_9c0870_caller1_va(void) {
  return ISAAC_PLAYERHUD_9C0870_CALLER1_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_caller2_va(void) {
  return ISAAC_PLAYERHUD_9C0870_CALLER2_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_caller3_va(void) {
  return ISAAC_PLAYERHUD_9C0870_CALLER3_VA;
}

extern "C" uint32_t isaac_playerhud_9c0870_caller4_va(void) {
  return ISAAC_PLAYERHUD_9C0870_CALLER4_VA;
}

/* ---------------- ABI v44: 0x009c2370 probe-threshold gate ---- */

extern "C" uint32_t isaac_playerhud_9c2370_gate(uint32_t f_bits) {
  const float f = __builtin_bit_cast(float, f_bits);
  /* PE comiss xmm0,[0xbaa454]=1.0f; setae al: CF=0 only when ORDERED
     >=.  NaN compares unordered -> CF=1 -> 0. */
  return (f >= 1.0f) ? 1u : 0u;
}

/* v44 census pins. */

extern "C" uint32_t isaac_playerhud_9c2370_va(void) {
  return ISAAC_PLAYERHUD_9C2370_VA;
}

extern "C" uint32_t isaac_playerhud_9c2370_ret_va(void) {
  return ISAAC_PLAYERHUD_9C2370_RET_VA;
}

extern "C" uint32_t isaac_playerhud_9c2370_next_va(void) {
  return ISAAC_PLAYERHUD_9C2370_NEXT_VA;
}

extern "C" uint32_t isaac_playerhud_9c2370_probe_slot(void) {
  return ISAAC_PLAYERHUD_9C2370_PROBE_SLOT;
}

extern "C" uint32_t isaac_playerhud_9c2370_probe_vtbl_off(void) {
  return ISAAC_PLAYERHUD_9C2370_PROBE_VTBL_OFF;
}

extern "C" uint32_t isaac_playerhud_9c2370_vtable_ref_rdata_a(void) {
  return ISAAC_PLAYERHUD_9C2370_VTABLE_REF_RDATA_A;
}

extern "C" uint32_t isaac_playerhud_9c2370_vtable_ref_rdata_b(void) {
  return ISAAC_PLAYERHUD_9C2370_VTABLE_REF_RDATA_B;
}

extern "C" uint32_t isaac_playerhud_9c2370_gate_rdata(void) {
  return ISAAC_PLAYERHUD_9C2370_GATE_RDATA;
}

extern "C" uint32_t isaac_playerhud_9c2370_gate_bits(void) {
  return ISAAC_PLAYERHUD_9C2370_GATE_BITS;
}