#include "game_render_slice.h"

#include "render_shell_pure_helpers.h"

/* Composition of the render-shell pure helpers (ABI v29) into one root
   entry over frame shell FUN_0080ea80.

   Evidence: output/decomp/5129df723e64/section-notes/render-slice-v1/
   disasm-80ea80-full.txt (complete shell disassembly) and the
   render-advance-2 … render-v29 note chain. Hash-bound to
   tools/isaac-ng.unpacked.exe SHA-256 5129DF72…

   ROOT SLICE ABI, NOT A PE-FREE RENDER. Not wired into the live frame
   loop; no performance claim. */

static_assert(sizeof(IsaacGameRenderSliceState) == 108,
              "render state ABI changed");
static_assert(offsetof(IsaacGameRenderSliceState, entity_count_entry) == 28,
              "render state ABI changed");
static_assert(offsetof(IsaacGameRenderSliceState, stage_1d18) == 68,
              "render state ABI changed");
static_assert(offsetof(IsaacGameRenderSliceState, tree_count_730c) == 92,
              "render state ABI changed");
static_assert(offsetof(IsaacGameRenderSliceState, flag_cleared) == 104,
              "render state ABI changed");
static_assert(sizeof(IsaacGameRenderSliceRuntimeInputs) == 248,
              "render runtime inputs ABI changed (v2 +30 fields)");
static_assert(offsetof(IsaacGameRenderSliceRuntimeInputs, tls_once_epoch) ==
                  116,
              "render runtime inputs ABI changed");
static_assert(offsetof(IsaacGameRenderSliceRuntimeInputs, present_38) == 120,
              "render runtime inputs ABI changed");
static_assert(offsetof(IsaacGameRenderSliceRuntimeInputs, bitset_2654c_hi) ==
                  204,
              "render runtime inputs ABI changed");
static_assert(offsetof(IsaacGameRenderSliceRuntimeInputs, room_aabb_20_bits) ==
                  236,
              "render runtime inputs ABI changed");
static_assert(sizeof(IsaacGameRenderSliceEvents) == 1368,
              "render events ABI changed");

namespace {

/* Sparse Game offsets recovered from the shell body (all PE-proven; the
   option gate is a MANAGER byte and deliberately has no entry here). */
enum : uint32_t {
  kOffGameMode = 0x0008,
  kOffGridW = 0x000c,
  kOffGridH = 0x0010,
  kOffFlag11f6 = 0x11f6,
  kOffCameraX = 0x1204,
  kOffCameraY = 0x1208,
  kOffEntityArray = 0x125c,
  kOffEntityCount = 0x1264,
  kOffFadeSrcR = 0x1b5c,
  kOffFadeSrcG = 0x1b60,
  kOffFadeSrcB = 0x1b64,
  kOffFadeSrcA = 0x1b68,
  kOffFadeWord6c = 0x1b6c,
  kOffFadeDstR = 0x1b70,
  kOffFadeDstG = 0x1b74,
  kOffFadeDstB = 0x1b78,
  kOffFadeDstA = 0x1b7c,
  kOffStage1d18 = 0x1d18,
  kOffOverlaySwap = 0x6eb0,
  kOffOverlayScaleX = 0x6edc,
  kOffOverlayScaleY = 0x6ee0,
  kOffOverlayColor = 0x6ee8,
  kOffOverlayDraw = 0x6f49,
  kOffTreeHead = 0x7308,
  kOffTreeCount = 0x730c
};

uint32_t load_u32(const uint8_t* p, uint32_t off) {
  return static_cast<uint32_t>(p[off]) |
         (static_cast<uint32_t>(p[off + 1]) << 8) |
         (static_cast<uint32_t>(p[off + 2]) << 16) |
         (static_cast<uint32_t>(p[off + 3]) << 24);
}

void store_u32(uint8_t* p, uint32_t off, uint32_t v) {
  p[off] = static_cast<uint8_t>(v & 0xffu);
  p[off + 1] = static_cast<uint8_t>((v >> 8) & 0xffu);
  p[off + 2] = static_cast<uint8_t>((v >> 16) & 0xffu);
  p[off + 3] = static_cast<uint8_t>((v >> 24) & 0xffu);
}

float bits_to_f32(uint32_t bits) { return __builtin_bit_cast(float, bits); }
uint32_t f32_to_bits(float v) { return __builtin_bit_cast(uint32_t, v); }

int32_t cont_needs_recapture(uint32_t cont) {
  switch (cont) {
case ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_825DE0:
    case ISAAC_GAME_RENDER_CONTINUE_AT_RT_REBIND:
    case ISAAC_GAME_RENDER_CONTINUE_AT_BIND_A1DFD0:
    case ISAAC_GAME_RENDER_CONTINUE_AT_STAGE39:
    case ISAAC_GAME_RENDER_CONTINUE_AT_FADE_POLLS:
    case ISAAC_GAME_RENDER_CONTINUE_AT_BOOST_74EFD0:
    case ISAAC_GAME_RENDER_CONTINUE_AT_BOOST_827BC0:
    case ISAAC_GAME_RENDER_CONTINUE_AT_FADE_CLOSE:
    case ISAAC_GAME_RENDER_CONTINUE_AT_COLOR_BIND:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TREE_ERASE:
    case ISAAC_GAME_RENDER_CONTINUE_AT_ENTITY:
    case ISAAC_GAME_RENDER_CONTINUE_AT_GRID_ENTRY:
    case ISAAC_GAME_RENDER_CONTINUE_AT_GRID:
    case ISAAC_GAME_RENDER_CONTINUE_AT_OVERLAY_GATE:
    case ISAAC_GAME_RENDER_CONTINUE_AT_AUX_POLLS:
    case ISAAC_GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TRUNK_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_16_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_46_817830:
      return 1;
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830:
      return 1;
    case ISAAC_GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_47_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830:
      return 1;
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830:
    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830:
      return 1;
    default:
      return 0;
  }
}

void clear_events(IsaacGameRenderSliceEvents* e) {
  if (e == nullptr) {
    return;
  }
  uint32_t* words = reinterpret_cast<uint32_t*>(e);
  const size_t n = sizeof(IsaacGameRenderSliceEvents) / sizeof(uint32_t);
  for (size_t i = 0; i < n; ++i) {
    words[i] = 0u;
  }
}

void emit(IsaacGameRenderSliceEvents* e, uint32_t cont, uint32_t kind,
          uint32_t va, uint32_t receiver, uint32_t slot, uint32_t repeat) {
  if (e == nullptr) {
    return;
  }
  e->continuation_kind = cont;
  e->host_kind = kind;
  e->host_va = va;
  e->host_receiver = receiver;
  e->host_vtable_slot = slot;
  e->host_repeat = repeat;
  e->needs_recapture =
      static_cast<uint32_t>(cont_needs_recapture(cont) != 0 ? 1 : 0);
}

/* Recapture request: no host action, resume named by the continuation. */
void emit_recapture(IsaacGameRenderSliceEvents* e, uint32_t cont) {
  emit(e, cont, ISAAC_GAME_RENDER_HOST_NONE, 0u, 0u, 0u, 0u);
}

/* Pure 6f9400/6f95a0 masks (helper ABI v31) over the sparse presence bytes
   and the manager words READ AT THE POLL SITE (VA 0x0080ed15 / 0x0080ed1e).
   Shared by resume_fade_polls and the pure 0x74efd0 probe body so the two
   sites agree by construction (same per-site inputs). */
struct PollMasks {
  uint32_t poll_a;
  uint32_t poll_b;
};

PollMasks poll_masks(const IsaacGameRenderSliceRuntimeInputs* inputs) {
  const int32_t gate39 = isaac_render_shell_6f9400_gate39(
      inputs->mgr_mode_26584, static_cast<int32_t>(inputs->mgr_word0_now),
      inputs->mgr_difficulty_269c8);
  PollMasks r;
  r.poll_a = isaac_render_shell_6f9400_mask(
      inputs->present_38, inputs->present_39, inputs->present_3a,
      inputs->present_3b, inputs->present_3c, inputs->present_3d,
      inputs->present_3e, gate39);
  r.poll_b = isaac_render_shell_6f95a0_mask(
      inputs->present_3f, inputs->present_40, inputs->present_41,
      inputs->present_42, inputs->present_43, inputs->present_44,
      inputs->present_46, inputs->present_4f);
  return r;
}

/* FUN_0074efd0 body (VA 0x0074efd0..0x0074f02e), receiver = Game ptr
   (= [0xc71678] at the render callsite VA 0x0080ed62). Returns the AL byte
   0/1. The inner callee 0x00748490 (VA 0x00748490..0x007484b4) is the poll
   combine (~pollB & (pollA | ([mgr+0x26550] | [mgr+0xc]))), bit 2 decided
   at VA 0x74f023; its 6f9400/6f95a0 calls re-walk the SAME action map and
   manager words as the fade poll site (no writes between 0x0080ed15 and
   0x0080ed62), so the shared per-site sparse inputs apply. */
uint32_t boost_74efd0_al(const IsaacGameRenderSliceRuntimeInputs* inputs) {
  const int32_t difficulty =
      static_cast<int32_t>(inputs->mgr_difficulty_269c8);
  if (difficulty == 2 || difficulty == 3) return 0; /* 0x74efdf/0x74efe4 */
  const uint32_t this0 = inputs->mgr_word0_now;      /* [mgr+0] */
  if ((this0 - 1u) <= 5u) {                          /* 0x74efeb..0x74eff1 */
    if ((inputs->mgr_flags_2654c & 0x10000u) != 0u) {
      return 0;                                      /* 0x74eff3..0x74f003 */
    }
  }
  const uint32_t this4 = inputs->mgr_word1_now;      /* [mgr+4] */
  if (this4 != 4u && this4 != 5u) return 0;          /* 0x74f005..0x74f010 */
  if (this0 == 4u) return 1;                         /* 0x74f012 */
  if (this0 != 3u) return 0;                         /* 0x74f017 */
  const PollMasks m = poll_masks(inputs);            /* 0x74f01e call 0x748490 */
  const uint32_t mgr_or = isaac_render_shell_fade_mgr_words_or(
      inputs->mgr_26550, inputs->mgr_word_0c);
  const uint32_t combined = (~m.poll_b) & (m.poll_a | mgr_or);
  return (combined & 2u) != 0u ? 1u : 0u;            /* 0x74f023 test al,2 */
}

}  /* namespace */

extern "C" int32_t isaac_game_render_slice_capture(
    const uint8_t* game_object, size_t game_object_size,
    IsaacGameRenderSliceState* state) {
  if (game_object == nullptr || state == nullptr ||
      game_object_size <
          static_cast<size_t>(ISAAC_GAME_RENDER_GAME_OBJECT_MIN_SIZE)) {
    return 0;
  }
  state->game_mode = static_cast<int32_t>(load_u32(game_object, kOffGameMode));
  state->grid_w = static_cast<int32_t>(load_u32(game_object, kOffGridW));
  state->grid_h = static_cast<int32_t>(load_u32(game_object, kOffGridH));
  state->flag_11f6 = game_object[kOffFlag11f6];
  state->camera_base_x_bits = load_u32(game_object, kOffCameraX);
  state->camera_base_y_bits = load_u32(game_object, kOffCameraY);
  state->entity_array_entry = load_u32(game_object, kOffEntityArray);
  state->entity_count_entry = load_u32(game_object, kOffEntityCount);
  state->fade_src_r_bits = load_u32(game_object, kOffFadeSrcR);
  state->fade_src_g_bits = load_u32(game_object, kOffFadeSrcG);
  state->fade_src_b_bits = load_u32(game_object, kOffFadeSrcB);
  state->fade_src_a_bits = load_u32(game_object, kOffFadeSrcA);
  state->fade_word_1b6c = load_u32(game_object, kOffFadeWord6c);
  state->fade_dst_r_bits = load_u32(game_object, kOffFadeDstR);
  state->fade_dst_g_bits = load_u32(game_object, kOffFadeDstG);
  state->fade_dst_b_bits = load_u32(game_object, kOffFadeDstB);
  state->fade_dst_a_bits = load_u32(game_object, kOffFadeDstA);
  state->stage_1d18 = static_cast<int32_t>(load_u32(game_object, kOffStage1d18));
  state->overlay_swap_flag = game_object[kOffOverlaySwap];
  state->overlay_scale_x_bits = load_u32(game_object, kOffOverlayScaleX);
  state->overlay_scale_y_bits = load_u32(game_object, kOffOverlayScaleY);
  state->overlay_draw_flag = game_object[kOffOverlayDraw];
  state->tree_head_7308 = load_u32(game_object, kOffTreeHead);
  state->tree_count_730c =
      static_cast<int32_t>(load_u32(game_object, kOffTreeCount));
  state->tree_cleared = 0u;
  state->overlay_written = 0u;
  state->flag_cleared = 0u;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_apply(
    const IsaacGameRenderSliceState* state, uint8_t* game_object,
    size_t game_object_size) {
  if (game_object == nullptr || state == nullptr ||
      game_object_size <
          static_cast<size_t>(ISAAC_GAME_RENDER_GAME_OBJECT_MIN_SIZE)) {
    return 0;
  }
  /* Marker-gated sparse writes ONLY. Each write happens at its PE event
     position (the caller sets the marker right after the matching event and
     calls apply); unset markers leave every byte untouched, so host writes
     and untranslated bytes are preserved. */
  if (state->flag_cleared != 0u) {
    game_object[kOffFlag11f6] = static_cast<uint8_t>(state->flag_11f6 & 0xffu);
  }
  if (state->tree_cleared != 0u) {
    store_u32(game_object, kOffTreeCount,
              static_cast<uint32_t>(state->tree_count_730c));
  }
  if (state->overlay_written != 0u) {
    store_u32(game_object, kOffOverlayScaleX, state->overlay_scale_x_bits);
    store_u32(game_object, kOffOverlayScaleY, state->overlay_scale_y_bits);
    /* White color init (VA 0x0080f051…0x0080f0a9): movaps (1,1,1,1) to
       +0x6ee8, movups zeros to +0x6ef8, movq zeros to +0x6f08, dword 0 to
       +0x6f10. The MSVC self-assign check compares Game+0x6ee8 against a
       stack address and can never be equal in the PE — pinned always-write. */
    const uint32_t one = 0x3f800000u;
    store_u32(game_object, kOffOverlayColor + 0x00u, one);
    store_u32(game_object, kOffOverlayColor + 0x04u, one);
    store_u32(game_object, kOffOverlayColor + 0x08u, one);
    store_u32(game_object, kOffOverlayColor + 0x0cu, one);
    store_u32(game_object, kOffOverlayColor + 0x10u, 0u);
    store_u32(game_object, kOffOverlayColor + 0x14u, 0u);
    store_u32(game_object, kOffOverlayColor + 0x18u, 0u);
    store_u32(game_object, kOffOverlayColor + 0x1cu, 0u);
    store_u32(game_object, kOffOverlayColor + 0x20u, 0u);
    store_u32(game_object, kOffOverlayColor + 0x24u, 0u);
    store_u32(game_object, kOffOverlayColor + 0x28u, 0u);
  }
  return 1;
}

extern "C" void isaac_game_render_slice_step(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return;
  }
  /* G0 (VA 0x0080eb1c): manager option byte — NOT a Game field. Closed →
     the PE jumps to the common epilog, which still hosts 0x00825de0 and
     runs the flag11f6 one-shot. */
  if (isaac_render_shell_main_body_needed(
          static_cast<uint8_t>(inputs->option_2a3c3 & 0xffu)) == 0) {
    events->body_skipped = 1u;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_825DE0,
         ISAAC_GAME_RENDER_HOST_EPILOG_825DE0,
         ISAAC_GAME_RENDER_VA_EPILOG_825DE0, 0u, 0u, 1u);
    return;
  }
  /* G1 (VA 0x0080eb2e): the comiss fade gate at VA 0x0080eb3c decides
     whether the PE runs the top polls (VA 0x0080eb3e/0x0080eb43). The polls
     are pure READ-ONLY calls whose results the PE DISCARDS (0x0080eb48
     overwrites eax) — v2 skips them on both paths. */
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_REBIND,
       ISAAC_GAME_RENDER_HOST_RT_REBIND, ISAAC_GAME_RENDER_VA_RT_A18300, 0u,
       0u, 1u);
}

extern "C" int32_t isaac_game_render_slice_resume_fade_prep(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t fade_1b5c_bits,
    uint32_t fade_1b60_bits, uint32_t fade_1b64_bits, uint32_t fade_1b68_bits,
    uint32_t fade_word_1b6c, uint32_t flags_g2,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* G2 (VA 0x0080ec00): bit9 of the FIRST room-flags read replaces the fade
     locals with the DAT_00babf20 pack and zeroes the fifth dword. The
     Game+0x1b68 load is dead either way: its stack slot is overwritten by
     the Game+0x1b7c re-read before the bind (VA 0x0080ee14). */
  (void)fade_1b68_bits;
  const int32_t bit9 = isaac_render_shell_room_flags_bit9(flags_g2);
  if (bit9 != 0) {
    events->fade_local_r_bits = ISAAC_GAME_RENDER_OVERRIDE_R_BITS;
    events->fade_local_g_bits = ISAAC_GAME_RENDER_OVERRIDE_G_BITS;
    events->fade_local_b_bits = ISAAC_GAME_RENDER_OVERRIDE_B_BITS;
    events->fade_word50 = 0u;
  } else {
    events->fade_local_r_bits = fade_1b5c_bits;
    events->fade_local_g_bits = fade_1b60_bits;
    events->fade_local_b_bits = fade_1b64_bits;
    events->fade_word50 = fade_word_1b6c;
  }
  /* The 0x00a10d00 quad pack ahead of the bind is pure (helper ABI v24);
     its output is consumed only by the 0x00a1dfd0 host argument. */
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_BIND_A1DFD0,
       ISAAC_GAME_RENDER_HOST_BIND_A1DFD0, ISAAC_GAME_RENDER_VA_BIND_A1DFD0,
       0u, 0u, 1u);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_fade_stage(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, int32_t stage_1d18_after,
    uint32_t game_1204_bits, uint32_t game_1208_bits, uint32_t flags_g10,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Pure global posts (VA 0x0080ec6f…0x0080ecb4): c79900=0, c79908=1,
     c7990c=1, c79910=1 and the c79904 cmove keyed on DAT_00c798e4 bit 2. */
  events->g_c79904_value =
      (inputs->dat_c798e4 &
       static_cast<uint32_t>(ISAAC_GAME_RENDER_C798E4_TEST_BIT)) == 0u
          ? static_cast<uint32_t>(ISAAC_GAME_RENDER_C79904_BIT_CLEAR_VALUE)
          : static_cast<uint32_t>(ISAAC_GAME_RENDER_C79904_BIT_SET_VALUE);
  events->g_c79900_applied = 1u;
  /* P0 camera build (VA 0x0080ecbd…0x0080ece3) happens BEFORE the stage
     branch resolves, on both paths. */
  float cam_x = 0.0f;
  float cam_y = 0.0f;
  isaac_render_shell_camera_offset(bits_to_f32(game_1204_bits),
                                   bits_to_f32(game_1208_bits),
                                   bits_to_f32(inputs->mgr_cam_x_2650c_bits),
                                   bits_to_f32(inputs->mgr_cam_y_26510_bits),
                                   &cam_x, &cam_y);
  events->camera_x_bits = f32_to_bits(cam_x);
  events->camera_y_bits = f32_to_bits(cam_y);
  /* G3 (VA 0x0080ecb6/0x0080ece9): stage == 0x39 → host 0x0083a1b0 with
     ecx=Game+0x776c, then jmp to the tree phase. */
  if (isaac_render_shell_stage39_host_needed(stage_1d18_after) != 0) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_STAGE39,
         ISAAC_GAME_RENDER_HOST_STAGE39_83A1B0,
         ISAAC_GAME_RENDER_VA_STAGE39_83A1B0, ISAAC_GAME_RENDER_RECV_STAGE39,
         0u, 1u);
    return 1;
  }
  /* G10 (VA 0x0080ed06): bit9 of the SECOND room-flags read skips the whole
     fade block straight to the tree phase (no host in between). */
  if (isaac_render_shell_non39_fade_block_needed(flags_g10) == 0) {
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY);
    return 1;
  }
  /* P4a OR word and the polls are pure over runtime inputs (VA 0x0080ed15/
     0x0080ed1e, helper ABI v31). Recapture point: the caller refreshes the
     presence bytes + per-site manager words, then calls resume_fade_polls. */
  emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_FADE_POLLS);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_fade_polls(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, int32_t game_mode_ed55,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const PollMasks m = poll_masks(inputs);
  events->poll_a_bits = m.poll_a;
  events->poll_b_bits = m.poll_b;
  const uint32_t mgr_or =
      isaac_render_shell_fade_mgr_words_or(inputs->mgr_26550,
                                           inputs->mgr_word_0c);
  const int32_t selects =
      isaac_render_shell_fade_poll_selects_one(mgr_or, m.poll_a, m.poll_b);
  events->poll_selects_one = static_cast<uint32_t>(selects);
  const float base = isaac_render_shell_fade_base(
      selects, bits_to_f32(inputs->mgr_fade_2651c_bits),
      bits_to_f32(inputs->mgr_fade_26518_bits));
  events->fade_base_bits = f32_to_bits(base);
  /* G11 (VA 0x0080ed55): Game+8 RE-READ. Mode 8 / 0x1d boosts without the
     probe hosts. */
  if (isaac_render_shell_fade_boost_mode_open(game_mode_ed55) != 0) {
    events->fade_boost = 1u;
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
    /* emit_recapture cleared host fields only; keep computed values. */
    return 1;
  }
  /* v5: the 0x74efd0 probe body is pure (boost_74efd0_al); the recapture
     only re-reads [mgr+0x1830c] (VA 0x0080ed71). No host runs. */
  emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_BOOST_74EFD0);
  return 1;
}

extern "C" uint32_t isaac_game_render_slice_boost_74efd0_al(
    const IsaacGameRenderSliceRuntimeInputs* inputs) {
  if (inputs == nullptr) {
    return 0;
  }
  return boost_74efd0_al(inputs);
}

extern "C" int32_t isaac_game_render_slice_resume_boost_74efd0(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t mgr_1830c_after,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* v5: the AL byte is the pure 0x74efd0 body over the per-site sparse
     inputs. Gate (VA 0x0080ed67 test al,al / VA 0x0080ed71 cmp
     [mgr+0x1830c],1): both true → boost without the second probe. */
  if (boost_74efd0_al(inputs) != 0u && mgr_1830c_after == 1u) {
    events->fade_boost = 1u;
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
    return 1;
  }
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_BOOST_827BC0,
       ISAAC_GAME_RENDER_HOST_BOOST_827BC0, ISAAC_GAME_RENDER_VA_BOOST_827BC0,
       0u, 0u, 1u);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_boost_827bc0(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t al_827bc0,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* VA 0x0080ed87: test al,al; jne boost. */
  events->fade_boost = (al_827bc0 & 0xffu) != 0u ? 1u : 0u;
  emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_fade_close(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t fade_base_bits,
    uint32_t boost, uint32_t flags_g12, uint32_t local_r_bits,
    uint32_t local_g_bits, uint32_t local_b_bits, uint32_t dst_1b70_bits,
    uint32_t dst_1b74_bits, uint32_t dst_1b78_bits, uint32_t dst_1b7c_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* P5 boost apply (minss clamps at 1.0f; NaN → 1.0f). */
  const float boosted = isaac_render_shell_fade_apply_boost(
      bits_to_f32(fade_base_bits), boost != 0u ? 1 : 0);
  events->fade_boost = boost != 0u ? 1u : 0u;
  /* G12 (VA 0x0080edb5…0x0080edce): the PROLOG SNAPSHOT manager words with
     the THIRD room-flags read; forces exactly 1.0f. */
  const int32_t force = isaac_render_shell_fade_force_full_needed(
      static_cast<int32_t>(inputs->mgr_word0),
      static_cast<int32_t>(inputs->mgr_word1), flags_g12);
  events->fade_force_full = static_cast<uint32_t>(force);
  const float faded = force != 0 ? bits_to_f32(0x3f800000u) : boosted;
  /* P6 (VA 0x0080edd3/0x0080edf8): subtract then maxss 0 (NaN → 0). */
  const float t =
      isaac_render_shell_fade_t(faded, bits_to_f32(inputs->mgr_67734_bits));
  events->fade_t_bits = f32_to_bits(t);
  /* P7 lerp channels; quad alpha is the RAW Game+0x1b7c re-read. */
  events->fade_color_bits_r = f32_to_bits(isaac_render_shell_fade_lerp_channel(
      bits_to_f32(local_r_bits), bits_to_f32(dst_1b70_bits), t));
  events->fade_color_bits_g = f32_to_bits(isaac_render_shell_fade_lerp_channel(
      bits_to_f32(local_g_bits), bits_to_f32(dst_1b74_bits), t));
  events->fade_color_bits_b = f32_to_bits(isaac_render_shell_fade_lerp_channel(
      bits_to_f32(local_b_bits), bits_to_f32(dst_1b78_bits), t));
  events->fade_color_bits_a = dst_1b7c_bits;
  /* P8 (VA 0x0080ee5c…0x0080ee6c): pointer from the PREP-TIME snapshot, byte
     and current global read NOW; the store runs whenever the snapshot is
     non-null. */
  events->c379b8_next_value = isaac_render_shell_c379b8_next(
      inputs->dat_c379b8_snap,
      static_cast<uint8_t>(inputs->c379b8_byte4 & 0xffu),
      inputs->dat_c379b8_now);
  events->c379b8_store_applied = inputs->dat_c379b8_snap != 0u ? 1u : 0u;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_COLOR_BIND,
       ISAAC_GAME_RENDER_HOST_COLOR_9956E0, ISAAC_GAME_RENDER_VA_COLOR_BIND,
       ISAAC_GAME_RENDER_RECV_COLOR_BIND, 0u, 1u);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_tree_erase(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t tree_head_7308,
    uint32_t head_right4, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* VA 0x0080ee81…0x0080eea9. Pure posts after the erase host: the head
     self-links ([H]=[H+4]=[H+8]=H) and Game+0x730c=0. The caller applies
     them via the tree_cleared marker + apply(). */
  events->tree_head = tree_head_7308;
  events->tree_posts_applied = 1u;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TREE_ERASE,
       ISAAC_GAME_RENDER_HOST_TREE_ERASE_424540,
       ISAAC_GAME_RENDER_VA_TREE_ERASE_424540, ISAAC_GAME_RENDER_RECV_TREE,
       0u, 1u);
  events->host_arg0 = ISAAC_GAME_RENDER_RECV_TREE;
  events->host_arg1 = head_right4;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_entity(
    const IsaacGameRenderSliceState* state, uint32_t entry_count,
    const uint32_t* base_seq, const uint32_t* count_seq, int32_t seq_len,
    uint32_t* out_slots, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || events == nullptr) {
    return 0;
  }
  /* Entry gate (VA 0x0080eead) on the RECAPTURED count — the entry-captured
     state value is deliberately not consulted. */
  if (isaac_render_shell_entity_loop_needed(entry_count) == 0) {
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_GRID_ENTRY);
    return 1;
  }
  if (base_seq == nullptr || count_seq == nullptr || seq_len <= 0) {
    /* Gate open but no recaptured iterations supplied: at least one
       Game::Render is required. Never invent it. */
    events->sample_exhausted = 1u;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_ENTITY,
         ISAAC_GAME_RENDER_HOST_ENTITY_806C20,
         ISAAC_GAME_RENDER_VA_ENTITY_RENDER, 0u, 0u, 1u);
    return 1;
  }
  int32_t capped = seq_len;
  if (capped > ISAAC_GAME_RENDER_ENTITY_MAX_STEPS) {
    capped = ISAAC_GAME_RENDER_ENTITY_MAX_STEPS;
  }
  /* v29 driver: base recaptured per iteration (VA 0x0080eebc), count
     recaptured after each host call (VA 0x0080eecb). Both are parameters;
     neither can be derived from state. */
  const int32_t calls = isaac_render_shell_entity_loop_run(
      entry_count, base_seq, count_seq, capped, out_slots);
  events->entity_render_calls = static_cast<uint32_t>(calls);
  if (calls > 0 && calls == capped &&
      isaac_render_shell_entity_loop_step(static_cast<uint32_t>(calls - 1),
                                          count_seq[calls - 1]) != 0) {
    events->sample_exhausted = 1u;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_ENTITY,
         ISAAC_GAME_RENDER_HOST_ENTITY_806C20,
         ISAAC_GAME_RENDER_VA_ENTITY_RENDER, 0u, 0u, 1u);
    events->entity_render_calls = static_cast<uint32_t>(calls);
    return 1;
  }
  emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_GRID_ENTRY);
  events->entity_render_calls = static_cast<uint32_t>(calls);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_grid(
    const IsaacGameRenderSliceState* state, int32_t grid_w_after,
    int32_t grid_h_after, const uint32_t* slots, int32_t slots_len,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || events == nullptr) {
    return 0;
  }
  /* VA 0x0080eed3…0x0080eee0: signed imul then jle. The product IS folded
     once by the PE into a stack slot and decremented — a recorded
     asymmetry with the entity loop. */
  const int32_t cells =
      isaac_render_shell_grid_cell_count(grid_w_after, grid_h_after);
  events->grid_cell_count = cells;
  if (isaac_render_shell_grid_loop_needed(cells) == 0) {
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
    events->grid_cell_count = cells;
    return 1;
  }
  int32_t needed = cells;
  if (needed > ISAAC_GAME_RENDER_GRID_MAX_STEPS) {
    needed = ISAAC_GAME_RENDER_GRID_MAX_STEPS;
    events->sample_exhausted = 1u;
  }
  int32_t supplied = slots_len;
  if (slots == nullptr) {
    supplied = 0;
  }
  if (supplied < needed) {
    events->sample_exhausted = 1u;
  }
  const int32_t n = supplied < needed ? supplied : needed;
  uint32_t nonnull = 0u;
  uint32_t first_slot = 0u;
  for (int32_t i = 0; i < n; ++i) {
    /* G6 (VA 0x0080eee7): null slots are skipped without a call. */
    if (isaac_render_shell_grid_slot_needs_render(slots[i]) != 0) {
      if (nonnull == 0u) {
        first_slot = slots[i];
      }
      ++nonnull;
    }
  }
  events->grid_draw_calls = nonnull;
  if (events->sample_exhausted != 0u || nonnull > 0u) {
    const uint32_t exhausted = events->sample_exhausted;
    const int32_t cell_echo = cells;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_GRID,
         ISAAC_GAME_RENDER_HOST_GRID_80C810, ISAAC_GAME_RENDER_VA_GRID_DRAW,
         0u, 0u, nonnull);
    events->host_arg0 = first_slot;
    events->sample_exhausted = exhausted;
    events->grid_cell_count = cell_echo;
    events->grid_draw_calls = nonnull;
    return 1;
  }
  emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
  events->grid_cell_count = cells;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_overlay_gate(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, int32_t game_mode_ef08,
    int32_t room_type_10, uint32_t camera_x_bits, uint32_t camera_y_bits,
    uint32_t flag_6f49_after, uint32_t flag_6eb0_after,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* G7 dual (VA 0x0080ef08/0x0080ef18) on the RE-READ Game+8 and the nested
     room type. Closed → the aux gate. */
  if (isaac_render_shell_stage_overlay_dual_open(game_mode_ef08,
                                                 room_type_10) == 0) {
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_AUX_GATE);
    return 1;
  }
  /* Pure 0x0074ea50 probe (VA 0x0080ef28, helper ABI v31) from the sparse
     presence bytes, the per-site manager words and the 64-bit bitset limb
     [mgr+0x26548]|[mgr+0x2654c]. */
  const uint64_t bitset =
      (static_cast<uint64_t>(inputs->bitset_2654c_hi) << 32u) |
      static_cast<uint64_t>(inputs->bitset_26548_lo);
  const uint32_t mgr_or = isaac_render_shell_fade_mgr_words_or(
      inputs->mgr_26550, inputs->mgr_word_0c);
  const int32_t al_74ea50 = isaac_render_shell_74ea50_eval_al_from_presence(
      inputs->mgr_difficulty_269c8, inputs->mgr_word0_now,
      inputs->mgr_word1_now, inputs->mgr_flags_2654c, mgr_or,
      inputs->present_38, inputs->present_39, inputs->present_3a,
      inputs->present_3b, inputs->present_3c, inputs->present_3d,
      inputs->present_3e, inputs->mgr_mode_26584,
      static_cast<int32_t>(inputs->mgr_word0_now), inputs->present_3f,
      inputs->present_40, inputs->present_41, inputs->present_42,
      inputs->present_43, inputs->present_44, inputs->present_46,
      inputs->present_4f, bitset);
  /* G31 (VA 0x0080ef2d): test al,al. */
  if (isaac_render_shell_stage_overlay_host_open(
          static_cast<uint8_t>(al_74ea50 & 0xffu)) == 0) {
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_AUX_GATE);
    return 1;
  }
  /* Pure 0x00812d00 Vector producer (VA 0x0080ef3c, helper ABI v31) over
     the sparse Room words (room = [mgr+0x18300] at the call). */
  float vec_x = 0.0f;
  float vec_y = 0.0f;
  isaac_render_shell_812d00_compute(
      inputs->room_desc, inputs->room_desc_nested, inputs->room_type_48,
      inputs->room_width_c, bits_to_f32(inputs->room_aabb_14_bits),
      bits_to_f32(inputs->room_aabb_18_bits),
      bits_to_f32(inputs->room_aabb_1c_bits),
      bits_to_f32(inputs->room_aabb_20_bits), &vec_x, &vec_y);
  /* Scroll/floor math (VA 0x0080ef41…0x0080f0cf). floor is the translated
     CRT primitive (helper ABI v26); scale is the pure 1.0*2.0 product. */
  const float scale = isaac_render_shell_stage_overlay_scale();
  const float fx = isaac_render_shell_af0917_floor(
      isaac_render_shell_stage_overlay_pre_floor_x(
          bits_to_f32(inputs->dat_c78dc4_bits), vec_x, scale));
  const float fy = isaac_render_shell_af0917_floor(
      isaac_render_shell_stage_overlay_pre_floor_y(
          bits_to_f32(inputs->dat_c78edc_bits), vec_y, scale));
  float out_x = 0.0f;
  float out_y = 0.0f;
  isaac_render_shell_stage_overlay_draw_pos(bits_to_f32(camera_x_bits),
                                            bits_to_f32(camera_y_bits), fx, fy,
                                            scale, &out_x, &out_y);
  /* The draw position is computed BEFORE the flag branch resolves (SSE moves
     do not touch EFLAGS) — always produced. */
  events->overlay_pos_x_bits = f32_to_bits(out_x);
  events->overlay_pos_y_bits = f32_to_bits(out_y);
  /* Game stores (VA 0x0080f033/0x0080f049 + white color init). Applied via
     the overlay_written marker + apply(). */
  events->overlay_scale_x_bits = inputs->dat_c3793c_bits;
  events->overlay_scale_y_bits = inputs->dat_c37940_bits;
  events->overlay_stores_applied = 1u;
  const int32_t plan = isaac_render_shell_stage_overlay_draw_plan(
      static_cast<uint8_t>(flag_6f49_after & 0xffu),
      static_cast<uint8_t>(flag_6eb0_after & 0xffu));
  if (plan == ISAAC_RENDER_SHELL_OVERLAY_PLAN_SKIP) {
    emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_AUX_GATE);
    return 1;
  }
  uint32_t first = 0u;
  uint32_t second = 0u;
  isaac_render_shell_stage_overlay_anim_offsets(plan, &first, &second);
  events->overlay_first_off = first;
  events->overlay_second_off = second;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_ANIM_RENDER,
       ISAAC_GAME_RENDER_HOST_ANIM_40A030, ISAAC_GAME_RENDER_VA_ANIM_40A030,
       first, 0u, 2u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_OVERLAY_CLAMP;
  events->host_arg1 = ISAAC_GAME_RENDER_VA_OVERLAY_CLAMP;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_aux_gate(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* G8 (VA 0x0080f131): aux option byte closed → RT pop. */
  if (isaac_render_shell_option_aux_open(
          static_cast<uint8_t>(inputs->option_2a3c5 & 0xffu)) == 0) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
         ISAAC_GAME_RENDER_HOST_RT_POP_A19180, ISAAC_GAME_RENDER_VA_RT_A19180,
         ISAAC_GAME_RENDER_VA_RT_MANAGER_C798E0, 0u, 1u);
    events->host_arg0 = 1u; /* push 1 */
    return 1;
  }
  /* G13 (VA 0x0080f14a): fade strictly > 0 calls 0x00817830 directly.
     v3: the entrance (0x00817830) hosts Game::GetStageID first — a typed
     host — and the pure resume_817830_gate decides whether the 0x66dc-byte
     body is needed at all (VA 0x0081784e…0x008178c8). */
  if (isaac_render_shell_manager_fade_poll_needed(
          bits_to_f32(inputs->mgr_fade_26518_bits)) == 0) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
         ISAAC_GAME_RENDER_HOST_GET_STAGE_ID_738470,
         ISAAC_GAME_RENDER_VA_GET_STAGE_ID, inputs->dat_c71678, 0u, 0u);
    return 1;
  }
  /* VA 0x0080f158/0x0080f161: the polls are pure (helper ABI v31) —
     recapture point; the caller refreshes inputs, then resume_aux_polls. */
  emit_recapture(events, ISAAC_GAME_RENDER_CONTINUE_AT_AUX_POLLS);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_aux_polls(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* VA 0x0080f14f…0x0080f170: pure masks over the sparse presence bytes
     and the manager words READ AT THE POLL SITE (VA 0x0080f158/0x0080f161);
     bit set calls the body, clear skips to RT pop. */
  const int32_t gate39 = isaac_render_shell_6f9400_gate39(
      inputs->mgr_mode_26584, static_cast<int32_t>(inputs->mgr_word0_now),
      inputs->mgr_difficulty_269c8);
  const uint32_t poll_a = isaac_render_shell_6f9400_mask(
      inputs->present_38, inputs->present_39, inputs->present_3a,
      inputs->present_3b, inputs->present_3c, inputs->present_3d,
      inputs->present_3e, gate39);
  const uint32_t poll_b = isaac_render_shell_6f95a0_mask(
      inputs->present_3f, inputs->present_40, inputs->present_41,
      inputs->present_42, inputs->present_43, inputs->present_44,
      inputs->present_46, inputs->present_4f);
  events->poll_a_bits = poll_a;
  events->poll_b_bits = poll_b;
  const uint32_t mgr_or = isaac_render_shell_fade_mgr_words_or(
      inputs->mgr_26550, inputs->mgr_word_0c);
  const int32_t selects =
      isaac_render_shell_fade_poll_selects_one(mgr_or, poll_a, poll_b);
  events->poll_selects_one = static_cast<uint32_t>(selects);
  if (isaac_render_shell_aux_817830_needed(1, selects) != 0) {
    /* v3: the entrance (0x00817830) runs Game::GetStageID first; the pure
       gate after it decides whether the body itself is needed. */
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
         ISAAC_GAME_RENDER_HOST_GET_STAGE_ID_738470,
         ISAAC_GAME_RENDER_VA_GET_STAGE_ID, inputs->dat_c71678, 0u, 0u);
    events->poll_selects_one = static_cast<uint32_t>(selects);
    return 1;
  }
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
       ISAAC_GAME_RENDER_HOST_RT_POP_A19180, ISAAC_GAME_RENDER_VA_RT_A19180,
       ISAAC_GAME_RENDER_VA_RT_MANAGER_C798E0, 0u, 1u);
  events->host_arg0 = 1u;
  events->poll_selects_one = static_cast<uint32_t>(selects);
  return 1;
}

/* ---------------------------------------------------------------------------
 * v3: 0x00817830 entrance peel — typed GetStageID host + pure body gate.
 * VA 0x0081784e…0x008178c8. All parameters are POST-CALL reads captured
 * after the Game::GetStageID host ran.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_gate(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    uint32_t stage_id_after, uint32_t slot_value_after,
    uint32_t room_word_54_after, uint32_t room_flags_44_after,
    uint32_t fade_7240_after, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* G14 (VA 0x00817869): slot == 0 -> early exit 0x0081def9. The slot is
     Game + 0x1d80 + 0x13c * [Game+0x1d18]; the caller recaptured its value. */
  if (slot_value_after == 0u) {
    events->body_skipped = 1u;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
         ISAAC_GAME_RENDER_HOST_RT_POP_A19180, ISAAC_GAME_RENDER_VA_RT_A19180,
         ISAAC_GAME_RENDER_VA_RT_MANAGER_C798E0, 0u, 1u);
    events->host_arg0 = 1u; /* push 1 */
    return 1;
  }
  /* G15 (VA 0x00817877…0x0081788e): stage-id special set {4,5,6,0x1b,0x1c}. */
  const uint32_t stage = stage_id_after;
  const int32_t special_stage =
      (stage == 4u || stage == 5u || stage == 6u || stage == 0x1bu ||
       stage == 0x1cu)
          ? 1
          : 0;
  /* G16 (VA 0x00817893): [room+0x54] signed >= 0 (jl closes).
     G17 (VA 0x00817899): ([room+0x44] >> 5) & 1 (shr eax,5; test al,1). */
  const int32_t room_special =
      (special_stage != 0 && static_cast<int32_t>(room_word_54_after) >= 0 &&
       ((room_flags_44_after >> 5u) & 1u) != 0u)
          ? 1
          : 0;
  /* G19 (VA 0x008178b4): comiss fade vs +0.0 -> ja; NaN sets CF -> closes. */
  const float fade = bits_to_f32(fade_7240_after);
  const int32_t fade_gt0 = fade > 0.0f ? 1 : 0;
  if (fade_gt0 != 0 || room_special != 0) {
    /* v4: the open path enters the body through the TRUNK edge — the host
       runs 0x00817830…0x00817adb (entrance + trunk float/color-ctor prefix,
       frame SAVED for the tail), then resume_817830_prefix peels the pure
       prefix 0x00817adc…0x00817b53 (blend t, shader scales, the a14050
       chain, the type ladder) natively. */
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TRUNK_817830,
         ISAAC_GAME_RENDER_HOST_BODY_817830_TRUNK,
         ISAAC_GAME_RENDER_VA_BODY_817830, 0u, 0u, 1u);
    events->host_arg0 = 1u; /* push 1 */
    return 1;
  }
  events->body_skipped = 1u;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
       ISAAC_GAME_RENDER_HOST_RT_POP_A19180, ISAAC_GAME_RENDER_VA_RT_A19180,
       ISAAC_GAME_RENDER_VA_RT_MANAGER_C798E0, 0u, 1u);
  events->host_arg0 = 1u;
  return 1;
}

extern "C" uint32_t isaac_game_render_slice_817830_slot_offset(uint32_t stage) {
  /* imul ecx, [esi+0x1d18], 0x13c (VA 0x0081785f): low 32 bits of the
     product; the slot read is Game + 0x1d80 + offset. */
  return stage * 0x13cu;
}


/* ---------------------------------------------------------------------------
 * v4: FUN_00817830 pure prefix (VA 0x00817adc…0x00817b53).
 * Entered after the TRUNK host event ran 0x00817830…0x00817adb with the
 * frame saved. The PE, in order:
 *   0x00817ae6  movss [esp+0x398], xmm1          ; blend t (P14/P15 result)
 *   0x00817af4  movd xmm1,[*0xc71678+0x264f8]    ; cvtdq2ps signed int -> f32
 *   0x00817b02  mulss xmm1,[0xbaa06c]  ; *0.01   -> [esp+0x28]
 *   0x00817b0a  mulss xmm0,[0xbaa2d0]  ; *0.5    -> [esp+0x18]
 *   0x00817b1e  mulss xmm0,[0xbaa120]  ; *0.1    -> [esp+0x80]
 *   0x00817b2f  call 0x00a14050                  ; pure chain (plan/resume)
 *   0x00817b34  mov eax,[esi+4]; [eax+0x10]; [eax+0x48]  ; room type ladder
 *      add eax,-9; cmp eax,3; ja 0x0081d20a
 *   0x00817b53  call Room::GetLRoomAreaDesc       ; type 9..12 tail start
 * The c379b8 store decision runs in the VALUE resume; the blend/scales are
 * re-derived there from refreshed recaptures (no carried event state).
 * --------------------------------------------------------------------------- */

/* P14 (VA 0x00817a8b): special ? clamp(cvtdq2ps([room+0x54])/30.0f, +0, 1.0)
   : +0. The special byte [esp+0x15b] was written by the entrance
   (G15 && G16 && G17) and is recomputed here from the recaptured reads —
   the PE reads the same three Game/room words. */
static float prefix_special_base_t(uint32_t stage_id, uint32_t room_word_54,
                                   uint32_t room_flags_44) {
  const uint32_t stage = stage_id;
  const int32_t special_stage =
      (stage == 4u || stage == 5u || stage == 6u || stage == 0x1bu ||
       stage == 0x1cu)
          ? 1
          : 0;
  if (special_stage == 0 ||
      static_cast<int32_t>(room_word_54) < 0 ||
      ((room_flags_44 >> 5u) & 1u) == 0u) {
    return 0.0f;
  }
  /* cvtdq2ps [room+0x54] / 30.0f, maxss +0.0f, minss 1.0f. The divisor
     DAT_00baa8d0 = 30.0f (.rdata read, section-table offset). */
  const float raw = static_cast<float>(static_cast<int32_t>(room_word_54)) /
                    30.0f;
  const float clamped = raw > 1.0f ? 1.0f : raw;  /* minss(.,1): a<b?a:b */
  return clamped > 0.0f ? clamped : 0.0f;          /* maxss(+0): a>0?a:0 */
}

/* P15 (VA 0x00817ac0): comiss [Game+0x7240], +0; jbe -> blend = base
   (NaN sets CF -> jbe -> no lerp; -0.0 likewise). Otherwise
   blend = base + (1-base) * fade, each op f32-rounded. */
static float prefix_blend_t(float base_t, uint32_t fade_7240) {
  const float fade = bits_to_f32(fade_7240);
  if (!(fade > 0.0f)) {
    return base_t;
  }
  return (base_t + (1.0f - base_t) * fade);
}

/* P17/P18 (VA 0x00817af4…0x00817b26). cvtdq2ps of [mgr+0x264f8] then
   mulss chains: mul01 = frame*0.01, mul05 = frame*0.5, mul005 = mul05*0.1. */
static void prefix_scales(uint32_t mgr_264f8, uint32_t* tail_28,
                          uint32_t* tail_18, uint32_t* tail_80) {
  const float frame = static_cast<float>(static_cast<int32_t>(mgr_264f8));
  const float mul01 = frame * 0.01f;
  const float mul05 = frame * 0.5f;
  const float mul005 = mul05 * 0.1f;
  *tail_28 = f32_to_bits(mul01);
  *tail_18 = f32_to_bits(mul05);
  *tail_80 = f32_to_bits(mul005);
}

/* The ladder (VA 0x00817b3d…0x00817b43): add eax,-9; cmp eax,3; ja.
   Unsigned 32-bit: type - 9 <= 3  <=>  type in {9,10,11,12}. */
static uint32_t prefix_tail_start_va(uint32_t room_desc_type_48) {
  const uint32_t adj = room_desc_type_48 - 9u;
  return adj <= 3u ? ISAAC_GAME_RENDER_VA_BODY_817830_LROOM
                   : ISAAC_GAME_RENDER_VA_BODY_817830_OTHER;
}
/* Shared tail-host emit for both resume entries. Type ∈ [9,12] now
   hosts only Room::GetLRoomAreaDesc (VA 0x00817b53) and recaptures
   into resume_817830_lroom_pack; other types keep the OTHER tail host. */
static void emit_tail_host(IsaacGameRenderSliceEvents* events) {
  if (events->tail_start_va == ISAAC_GAME_RENDER_VA_BODY_817830_LROOM) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830,
         ISAAC_GAME_RENDER_HOST_GETLROOM_81F8B0,
         ISAAC_GAME_RENDER_VA_GETLROOM, 0u, 0u, 1u);
    events->host_arg0 = ISAAC_GAME_RENDER_VA_BODY_817830_PACK;
    return;
  }
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TAIL_817830,
       ISAAC_GAME_RENDER_HOST_BODY_817830_TAIL, events->tail_start_va, 0u, 0u,
       1u);
}

extern "C" int32_t isaac_game_render_slice_resume_817830_prefix(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t stage_id_after,
    uint32_t room_word_54_after, uint32_t room_flags_44_after,
    uint32_t fade_7240_after, uint32_t mgr_264f8_after,
    uint32_t tree_head_c379bc_after, uint32_t bound_isnil_after,
    uint32_t bound_key_after, uint32_t bound_ptr_after,
    uint32_t room_desc_type48_after, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* P14/P15: the blend t stored by the PE to frame [esp+0x398]
     (VA 0x00817ae6). */
  const float base_t = prefix_special_base_t(stage_id_after,
                                             room_word_54_after,
                                             room_flags_44_after);
  const float blend_t = prefix_blend_t(base_t, fade_7240_after);
  events->tail_blend_398_bits = f32_to_bits(blend_t);
  /* P17/P18. */
  prefix_scales(mgr_264f8_after, &events->tail_scale_28_bits,
                &events->tail_scale_18_bits, &events->tail_scale_80_bits);
  /* a14050 chain plan (VA 0x00a1407b…0x00a1408c): byte isnil, unsigned
     key >= bound_key, bound != map head. Search key is the a159d0 hash of
     DAT_00b1a5b0 ("KAGE_ColorTextureShader") — PE-hardcoded at
     VA 0x00a14057, verified against the render-shell oracle. */
  const uint32_t key = ISAAC_GAME_RENDER_817830_KAGE_HASH;
  const int32_t found =
      ((bound_isnil_after & 0xffu) == 0u &&
       key >= bound_key_after &&
       bound_ptr_after != tree_head_c379bc_after)
          ? 1
          : 0;
  events->a14050_found = static_cast<uint32_t>(found);
  events->tail_start_va = prefix_tail_start_va(room_desc_type48_after);
  if (found == 0) {
    /* FAIL: the PE returns al=0 at 0x00a140b6 and reads the room type next;
       no store. The ladder has already picked the tail. */
    emit_tail_host(events);
    return 1;
  }
  /* FOUND: the value deref [bound+0x14] and byte [value+4] are host memory
     reads — recapture continuation, then resume_817830_a14050_value. */
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830,
       ISAAC_GAME_RENDER_HOST_NONE, 0u, 0u, 0u, 0u);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_a14050_value(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t stage_id_after,
    uint32_t room_word_54_after, uint32_t room_flags_44_after,
    uint32_t fade_7240_after, uint32_t mgr_264f8_after,
    uint32_t room_desc_type48_after, uint32_t value_at_14_after,
    uint32_t byte_at_value_plus_4_after,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Chain resume (VA 0x00a1409c…0x00a140a8): value == 0 -> no store;
     byte [value+4] & 1 == 0 -> no store; else store DAT_00c379b8 = value.
     The byte test is a byte test — wide inputs are narrowed in-body. */
  const int32_t store = (value_at_14_after != 0u &&
                         (byte_at_value_plus_4_after & 0xffu & 1u) != 0u)
                            ? 1
                            : 0;
  if (store != 0) {
    events->c379b8_next_value = value_at_14_after;
    events->c379b8_store_applied = 1u;
  }
  /* Pre-call reads for the tail are re-derived (same function as the
     prefix so the two resume entries agree on identical inputs). */
  const float base_t = prefix_special_base_t(stage_id_after,
                                         room_word_54_after,
                                         room_flags_44_after);
  const float blend_t = prefix_blend_t(base_t, fade_7240_after);
  events->tail_blend_398_bits = f32_to_bits(blend_t);
  prefix_scales(mgr_264f8_after, &events->tail_scale_28_bits,
                &events->tail_scale_18_bits, &events->tail_scale_80_bits);
  events->tail_start_va = prefix_tail_start_va(room_desc_type48_after);
  emit_tail_host(events);
  return 1;
}

extern "C" uint32_t isaac_game_render_slice_817830_kage_hash(void) {
  return ISAAC_GAME_RENDER_817830_KAGE_HASH;
}

/* ---------------------------------------------------------------------------
 * v6: FUN_00817830 type-9..12 pack (VA 0x00817b58…0x00817c3d).
 * Entered after host Room::GetLRoomAreaDesc @ 0x0081f8b0 (dest lea
 * [esp+0x2dc]). PE order:
 *   0x00817b58  lea edi,[esp+0x3b8]
 *   0x00817b5f  mov eax,0xc
 *   0x00817b64  movss xmm3,[0xbaa454]          ; 1.0f once
 *   loop 12: dec eax; xorps xmm1/xmm2; push 1.0f; call a10690;
 *            [edi+0x20]←0; edi+=0x24; test eax; jne
 *   0x00817b95  lea edi,[esp+0x568]
 *   0x00817b9c  lea esi,[eax+6]                ; eax==0 → 6
 *   loop 6: push -1; call a0f550; call a10c00; edi+=0x70; sub esi,1; jne
 *   0x00817bc9  [Game+4]; test; [Room+0x10]; test; je 0x0081a975
 *   0x00817bdf  cmp [nested+0x48],9; jne 0x00819394
 *   0x00817be9  P22 cell0; next host a10690 at 0x00817c3d
 * The 12+6 inits and P22 are consumed BY REFERENCE from render-shell
 * v31 (lroom_loop_step / lroom_quad_post / lroom_pair_advance /
 * type9_cell0 / room_desc_open / room_type_eq_9).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_lroom_pack(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t room_ptr_after,
    uint32_t nested_desc_ptr_after, uint32_t room_type48_after,
    uint32_t scale_a8_bits, uint32_t mul_005_bits, uint32_t mul_05_bits,
    uint32_t offset_c_bits, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* 12× a10690 unit-quad plan (VA 0x00817b5f…0x00817b93). Count is the
     pre-dec eax=0xc; each body: xmm1=0, xmm2=0, xmm3=1.0, w=1.0,
     [edi+0x20]←0, edi+=0x24. */
  uint32_t quad_count = ISAAC_GAME_RENDER_LROOM_QUAD_COUNT;
  uint32_t quad_inits = 0u;
  for (;;) {
    uint32_t after = 0u;
    const int32_t more =
        isaac_render_shell_817830_lroom_loop_step(quad_count, &after);
    quad_count = after;
    quad_inits += 1u;
    (void)isaac_render_shell_817830_lroom_quad_post(0u, nullptr);
    if (more == 0) {
      break;
    }
  }
  events->lroom_quad_inits = quad_inits;
  /* 6× (a0f550(-1)+a10c00) pair plan (VA 0x00817b9c…0x00817bc3).
     esi = eax+6 after the quad loop leaves eax=0. */
  uint32_t pair_count = ISAAC_GAME_RENDER_LROOM_PAIR_COUNT;
  uint32_t pair_inits = 0u;
  for (;;) {
    uint32_t after = 0u;
    const int32_t more =
        isaac_render_shell_817830_lroom_loop_step(pair_count, &after);
    pair_count = after;
    pair_inits += 1u;
    (void)isaac_render_shell_817830_lroom_pair_advance(0u);
    if (more == 0) {
      break;
    }
  }
  events->lroom_pair_inits = pair_inits;
  /* G22 (VA 0x00817bc9…0x00817bd9): Room* and [Room+0x10] both non-null. */
  if (isaac_render_shell_817830_room_desc_open(room_ptr_after,
                                               nested_desc_ptr_after) == 0) {
    events->lroom_next_va = ISAAC_GAME_RENDER_VA_LROOM_JOIN_A975;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
         ISAAC_GAME_RENDER_HOST_BODY_817830_TAIL,
         events->lroom_next_va, 0u, 0u, 1u);
    return 1;
  }
  /* G23 (VA 0x00817bdf): cmp dword [nested+0x48], 9. Wide 0x109 is not 9. */
  if (isaac_render_shell_817830_room_type_eq_9(
          static_cast<int32_t>(room_type48_after)) == 0) {
    events->lroom_next_va = ISAAC_GAME_RENDER_VA_LROOM_JOIN_9394;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
         ISAAC_GAME_RENDER_HOST_BODY_817830_TAIL,
         events->lroom_next_va, 0u, 0u, 1u);
    return 1;
  }
  /* P22 (VA 0x00817be9…0x00817c37). Next host is the first type-9 a10690
     at 0x00817c3d (push ecx / lea ecx,[esp+0x124] / call a10690). Dest
     copy 0x00817c42…0x00817c81 stays inside that host. */
  float half_a = 0.0f;
  float out_x = 0.0f;
  float out_y = 0.0f;
  isaac_render_shell_817830_type9_cell0(
      bits_to_f32(scale_a8_bits), bits_to_f32(mul_005_bits),
      bits_to_f32(mul_05_bits), bits_to_f32(offset_c_bits), &half_a, &out_x,
      &out_y);
  events->type9_cell0_half_a_bits = f32_to_bits(half_a);
  events->type9_cell0_x_bits = f32_to_bits(out_x);
  events->type9_cell0_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830,
       ISAAC_GAME_RENDER_HOST_A10690, ISAAC_GAME_RENDER_VA_A10690, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A10690;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v7: type-9 P23 after host a10690 @ 0x00817c3d.
 *   0x00817c89  movss xmm0,[esp+0x70]          ; scale_70 recapture
 *   0x00817c8f  mulss xmm0,[0xbaa2d0]          ; * 0.5f → half_b
 *   0x00817c9a  movss [esp+0x38],xmm0
 *   0x00817ca0  addss xmm1, [esp+0x94]         ; + half_a (P22 store)
 *   0x00817cb7  movss [esp+0x9c],xmm1          ; out_sum
 *   0x00817cc0  addss xmm3, [esp+0x18]         ; + mul_05 → out_y2
 * Next host is the second type-9 a10690 at 0x00817ccc. P23 consumed BY
 * REFERENCE from render-shell type9_cell1.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_cell1(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t scale_70_bits,
    uint32_t half_a_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  float half_b = 0.0f;
  float out_sum = 0.0f;
  float out_y2 = 0.0f;
  isaac_render_shell_817830_type9_cell1(
      bits_to_f32(scale_70_bits), bits_to_f32(half_a_bits),
      bits_to_f32(mul_05_bits), &half_b, &out_sum, &out_y2);
  events->type9_cell1_half_b_bits = f32_to_bits(half_b);
  events->type9_cell1_sum_bits = f32_to_bits(out_sum);
  events->type9_cell1_y2_bits = f32_to_bits(out_y2);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_NEXT;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830,
       ISAAC_GAME_RENDER_HOST_A10690, ISAAC_GAME_RENDER_VA_A10690, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A10690_NEXT;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v8: type-9 cell2 after host a10690 @ 0x00817ccc.
 *   dest-copy 0x00817cd1…0x00817d13 is host.
 *   0x00817d1a  movss xmm0,[esp+0x38]          ; half_b recapture
 *   0x00817d23  addss xmm2, [esp+0xac]         ; + offset_ac → x2
 *   0x00817d2c  addss xmm0, [esp+0x18]         ; + mul_05 → y3
 *   0x00817d35  movss [esp+0x40],xmm2
 *   0x00817d4d  addss xmm1, [esp+0x94]         ; y3 + half_a → sum2
 *   0x00817d56  movss [esp+0x38],xmm0
 * Next host is the third type-9 a10690 at 0x00817d5c.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_cell2(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t half_b_bits,
    uint32_t offset_ac_bits, uint32_t mul_05_bits, uint32_t half_a_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float half_b = bits_to_f32(half_b_bits);
  const float out_x2 = half_b + bits_to_f32(offset_ac_bits);
  const float out_y3 = half_b + bits_to_f32(mul_05_bits);
  const float out_sum2 = out_y3 + bits_to_f32(half_a_bits);
  events->type9_cell2_x2_bits = f32_to_bits(out_x2);
  events->type9_cell2_y3_bits = f32_to_bits(out_y3);
  events->type9_cell2_sum2_bits = f32_to_bits(out_sum2);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL2;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830,
       ISAAC_GAME_RENDER_HOST_A10690, ISAAC_GAME_RENDER_VA_A10690, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL2;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v9: type-9 cell3 after host a10690 @ 0x00817d5c.
 *   dest-copy 0x00817d70…0x00817dce is host.
 *   0x00817d61  movss xmm1,[esp+0x6c]          ; scale_6c recapture
 *   0x00817d67  addss xmm1, [esp+0xa8]         ; + offset_a8 → x3
 *   0x00817dab  movss [esp+0x48],xmm1
 *   0x00817db1  movss xmm1,[esp+0x38]          ; y3 recapture
 *   0x00817db7  addss xmm3, [esp+0x18]         ; x3 + mul_05 → sum3
 *   0x00817dbd  addss xmm1, [esp+0xac]         ; y3 + offset_ac → y4
 * Next host is the fourth type-9 a10690 at 0x00817de0.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_cell3(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t scale_6c_bits,
    uint32_t offset_a8_bits, uint32_t y3_bits, uint32_t offset_ac_bits,
    uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x3 = bits_to_f32(scale_6c_bits) + bits_to_f32(offset_a8_bits);
  const float out_y4 = bits_to_f32(y3_bits) + bits_to_f32(offset_ac_bits);
  const float out_sum3 = out_x3 + bits_to_f32(mul_05_bits);
  events->type9_cell3_x3_bits = f32_to_bits(out_x3);
  events->type9_cell3_y4_bits = f32_to_bits(out_y4);
  events->type9_cell3_sum3_bits = f32_to_bits(out_sum3);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL3;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830,
       ISAAC_GAME_RENDER_HOST_A10690, ISAAC_GAME_RENDER_VA_A10690, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL3;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v10: type-9 cell4 after host a10690 @ 0x00817de0.
 *   dest-copy 0x00817de5…0x00817e24 is host.
 *   0x00817dfc  movss xmm2,[esp+0xa8]          ; offset_a8 recapture
 *   0x00817e2c  movaps xmm0, xmm2
 *   0x00817e2f  addss xmm0, xmm2               ; a8+a8 → dbl
 *   0x00817e36  movss [esp+0x10],xmm0
 *   0x00817e3c  addss xmm1, [esp+0x70]         ; dbl + scale_70 → ac
 *   0x00817e50  movss [esp+0xac],xmm1
 *   0x00817e5f  addss xmm3, [esp+0x18]         ; ac + mul_05 → sum4
 *   0x00817e65  addss xmm1, xmm2               ; mul_05 + a8
 *   0x00817e72  addss xmm1, [esp+0x70]         ; + scale_70 → y5
 * Next host is the fifth type-9 a10690 at 0x00817e78.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_cell4(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_a8_bits,
    uint32_t scale_70_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float offset_a8 = bits_to_f32(offset_a8_bits);
  const float out_dbl = offset_a8 + offset_a8;
  const float out_ac = out_dbl + bits_to_f32(scale_70_bits);
  const float out_sum4 = out_ac + bits_to_f32(mul_05_bits);
  const float out_y5 =
      (bits_to_f32(mul_05_bits) + offset_a8) + bits_to_f32(scale_70_bits);
  events->type9_cell4_dbl_bits = f32_to_bits(out_dbl);
  events->type9_cell4_ac_bits = f32_to_bits(out_ac);
  events->type9_cell4_sum4_bits = f32_to_bits(out_sum4);
  events->type9_cell4_y5_bits = f32_to_bits(out_y5);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL4;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830,
       ISAAC_GAME_RENDER_HOST_A10690, ISAAC_GAME_RENDER_VA_A10690, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL4;
  return 1;
}
/* ---------------------------------------------------------------------------
 * v11: type-9 cell5 after host a10690 @ 0x00817e78.
 *   dest-copy 0x00817e8c…0x00817ed4 is host.
 *   0x00817e7d  movss xmm4,[esp+0x6c]          ; scale_6c recapture
 *   0x00817e9c  addss xmm2, xmm4               ; 6c+6c → dbl
 *   0x00817ec6  addss xmm2, [esp+0x10]         ; dbl + offset_10 → ac
 *   0x00817edf  movss [esp+0x30],xmm2
 *   0x00817eee  addss xmm3, xmm1               ; ac + 0
 *   0x00817ef8  addss xmm3, [esp+0x18]         ; + mul_05 → sum5
 *   0x00817efc  addss xmm1, [esp+0x10]         ; mul_05 + offset_10
 *   0x00817f02  addss xmm1, xmm4               ; + scale_6c → y6
 * Next host is the sixth type-9 a10690 at 0x00817f06.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_cell5(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t scale_6c_bits,
    uint32_t offset_10_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float scale_6c = bits_to_f32(scale_6c_bits);
  const float out_dbl = scale_6c + scale_6c;
  const float out_ac = out_dbl + bits_to_f32(offset_10_bits);
  const float out_sum5 = out_ac + bits_to_f32(mul_05_bits);
  const float out_y6 =
      (bits_to_f32(mul_05_bits) + bits_to_f32(offset_10_bits)) + scale_6c;
  events->type9_cell5_dbl_bits = f32_to_bits(out_dbl);
  events->type9_cell5_ac_bits = f32_to_bits(out_ac);
  events->type9_cell5_sum5_bits = f32_to_bits(out_sum5);
  events->type9_cell5_y6_bits = f32_to_bits(out_y6);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL5;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830,
       ISAAC_GAME_RENDER_HOST_A10690, ISAAC_GAME_RENDER_VA_A10690, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL5;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v12: type-9 cell6 after host a10690 @ 0x00817f06.
 *   dest-copy 0x00817f0b…0x00817f45 is host.
 *   0x00817f4d  movss xmm0,[esp+0x94]          ; half_a recapture
 *   0x00817f56  movss [esp+0x10],xmm0          ; → x
 *   0x00817f5c  movss xmm0,[esp+0xc]           ; offset_c recapture
 *   0x00817f62  movss [esp+0x14],xmm0          ; → y
 *   0x00817f68  movss xmm0,[esp+0x28]          ; scale_28 recapture
 *   0x00817f6e  movss [esp],xmm0               ; → angle
 * Next host is the first type-9 a102e0 at 0x00817f74.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_cell6(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t half_a_94_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_cell6_x_bits = half_a_94_bits;
  events->type9_cell6_y_bits = offset_c_bits;
  events->type9_cell6_angle_bits = scale_28_bits;
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_CELL6;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_CELL6;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v13: first type-9 a102e0 pack after host a102e0 @ 0x00817f74.
 *   0x00817f79  xorps xmm0,xmm0
 *   0x00817f7d  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x00817f82  addss xmm1,xmm0                ; + 0.0f → y
 *   0x00817f86  movss xmm0,[esp+0x18]          ; mul_05 recapture
 *   0x00817f8c  addss xmm0,[eax]               ; + ret_x → x
 *   0x00817f9f  movss [esp+0x84],xmm1          ; y
 *   0x00817fa8  movss [esp+0x80],xmm0          ; x
 * Next host is the second type-9 a102e0 at 0x00817fcd.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_0(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_NEXT;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_NEXT;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v14: second type-9 a102e0 pack after host a102e0 @ 0x00817fcd.
 *   0x00817fd2  xorps xmm0,xmm0
 *   0x00817fda  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x00817fdf  addss xmm1,xmm0                ; + 0.0f → y
 *   0x00817fe3  movss xmm0,[esp+0x18]          ; mul_05 recapture
 *   0x00817fe9  addss xmm0,[eax]               ; + ret_x → x
 *   0x00817ffc  movss [esp+0x6c],xmm1          ; y
 *   0x00818002  movss [esp+0x68],xmm0          ; x
 * Next host is the third type-9 a102e0 at 0x00818023.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_1(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_1_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_1_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_1;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_1;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v15: third type-9 a102e0 pack after host a102e0 @ 0x00818023.
 *   0x00818028  xorps xmm0,xmm0
 *   0x00818030  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x00818035  addss xmm1,xmm0                ; + 0.0f → y
 *   0x00818039  movss xmm0,[esp+0x18]          ; mul_05 recapture
 *   0x0081803f  addss xmm0,[eax]               ; + ret_x → x
 *   0x0081805a  movss [esp+0x5c],xmm1          ; y
 *   0x00818060  movss [esp+0x58],xmm0          ; x
 * Next host is the fourth type-9 a102e0 at 0x00818072.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_2(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_2_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_2_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_2;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_2;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v16: fourth type-9 a102e0 pack after host a102e0 @ 0x00818072.
 *   0x00818077  xorps xmm0,xmm0
 *   0x00818081  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x00818086  addss xmm1,xmm0                ; + 0.0f → y
 *   0x0081808a  movss xmm0,[esp+0x14]          ; mul_14 recapture
 *   0x00818090  addss xmm0,[eax]               ; + ret_x → x
 *   0x008180a2  movss [esp+0x54],xmm0          ; x
 *   0x008180ad  movss [esp+0x5c],xmm1          ; y
 * Next host is the first type-9 a106e0 at 0x008180b4.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_3(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_14_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_14_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_3_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_3_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v17: type-9 first a106e0 pack after host a106e0 @ 0x008180b4.
 *   dest-copy 0x008180b9…0x008180f3 is host.
 *   0x008180fb  movss xmm0,[esp+0x9c]          ; offset_9c recapture
 *   0x00818104  movss [esp+0x50],xmm0          ; → x
 *   0x0081810a  movss xmm0,[esp+0xc]           ; offset_c recapture
 *   0x00818110  movss [esp+0x54],xmm0          ; → y
 *   0x00818116  movss xmm0,[esp+0x28]          ; scale_28 recapture
 *   0x0081811c  movss [esp],xmm0               ; → angle
 * Next host is the fifth type-9 a102e0 at 0x00818122.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_9c_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_x_bits = offset_9c_bits;
  events->type9_a106e0_y_bits = offset_c_bits;
  events->type9_a106e0_angle_bits = scale_28_bits;
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_3;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_3;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v18: fifth type-9 a102e0 pack after host a102e0 @ 0x00818122.
 *   0x00818127  xorps xmm0,xmm0
 *   0x0081812a  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x0081812f  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x00818133  movss xmm0,[esp+0x14]          ; mul_14 recapture
 *   0x00818139  addss xmm0,[eax]               ; + ret_x -> x
 *   0x0081813d  movss [esp+0x38],xmm1          ; y
 *   0x00818143  movss [esp+0x34],xmm0          ; x
 * Dest-copy 0x008180b9..0x008180f3 stays host. Do not reopen 0x00818122.
 * Next host is the sixth type-9 a102e0 at 0x0081817c.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_4(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_14_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_14_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_4_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_4_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_4;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_4;
  return 1;
}




/* ---------------------------------------------------------------------------
 * v19: sixth type-9 a102e0 pack after host a102e0 @ 0x0081817c.
 *   0x00818181  xorps xmm0,xmm0
 *   0x00818189  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x0081818e  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x00818192  movss xmm0,[esp+0x18]          ; mul_05 recapture (after
 *                                              ; next-host push ecx)
 *   0x00818198  addss xmm0,[eax]               ; + ret_x -> x
 *   0x008181ab  movss [esp+0x64],xmm1          ; y
 *   0x008181b1  movss [esp+0x60],xmm0          ; x
 * Dest-copy 0x008180b9..0x008180f3 stays host. Host a106e0 stays host.
 * Do not reopen 0x00818122 (v18 fifth pack). Identity stores of later
 * arg-setup (0x0081819c...) stay with the next host. No addss beyond
 * the two recaptures. Next host is the seventh type-9 a102e0 at
 * 0x008181d2 (v20 typed HOST_A102E0, AT_TYPE9_A102E0_6_817830).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_5(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_5_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_5_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_5;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_5;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v20: seventh type-9 a102e0 pack after host a102e0 @ 0x008181d2.
 *   0x008181d7  xorps xmm0,xmm0
 *   0x008181da  push ecx
 *   0x008181df  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x008181e4  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x008181e8  movss xmm0,[esp+0x18]          ; mul_05 recapture (after
 *                                              ; next-host push ecx;
 *                                              ; resume-time [esp+0x14])
 *   0x008181ee  addss xmm0,[eax]               ; + ret_x -> x
 *   0x00818201  movss [esp+0x74],xmm1          ; y
 *   0x00818207  movss [esp+0x70],xmm0          ; x
 * Identity stores of later arg-setup (0x0081820d..0x00818227) stay with
 * the next host. Dest-copy 0x008180b9..0x008180f3 stays host. Host a106e0
 * stays host. Do not reopen 0x00818122 (v18 fifth pack) or 0x0081817c
 * (v19 sixth pack). No addss beyond the two recaptures. Next host is the
 * eighth type-9 a102e0 at 0x00818228 (v21 typed HOST_A102E0,
 * AT_TYPE9_A102E0_7_817830).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_6(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_6_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_6_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_6;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_6;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v21: eighth type-9 a102e0 pack after host a102e0 @ 0x00818228.
 *   0x0081822d  xorps xmm0,xmm0
 *   0x00818230  lea ecx,[esp+0x120]            ; next-host ecx setup
 *   0x00818237  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x0081823c  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x00818240  movss xmm0,[esp+0x14]          ; mul_05 recapture (no
 *                                              ; next-host push in this
 *                                              ; flow; resume-time slot
 *                                              ; [esp+0x14] directly)
 *   0x00818246  addss xmm0,[eax]               ; + ret_x -> x
 *   0x00818258  movss [esp+0x84],xmm0          ; x
 *   0x00818269  movss [esp+0x8c],xmm1          ; y
 * Identity stores of later arg-setup (0x00818278..0x008182dd) stay with
 * the next host. Dest-copy 0x008180b9..0x008180f3 stays host. Host a106e0
 * stays host. Do not reopen 0x00818122 (v18), 0x0081817c (v19) or
 * 0x008181d2 (v20). No addss beyond the two recaptures. Next host is
 * the second type-9 a106e0 at 0x00818273 (v22 typed HOST_A106E0,
 * AT_TYPE9_A106E0_2_817830).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_7(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_7_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_7_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_2;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_2;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v22: second a106e0-binding seam after host a106e0 @ 0x00818273.
 *   dest-copy 0x00818278..0x008182b2 is host (movups result copies,
 *   byte-gate, lea; host frame mutation).
 *   0x008182ba  movss xmm0,[esp+0x40]          ; offset_40 recapture
 *   0x008182c0  movss [esp+0x50],xmm0          ; -> x
 *   0x008182c6  movss xmm0,[esp+0xc]           ; offset_c recapture
 *   0x008182cc  movss [esp+0x54],xmm0          ; -> y
 *   0x008182d2  movss xmm0,[esp+0x28]          ; scale_28 recapture
 *   0x008182d8  movss [esp],xmm0               ; -> angle
 * Byte-gate: mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140]. The
 * widened value is (1u & 0xff) as uint32_t; NO uint8_t field (the Wasm
 * ABI does not narrow and -O2 deletes masks on uint8_t params).
 * v23: the ninth type-9 a102e0 @ 0x008182de is now a typed HOST_A102E0
 * (AT_TYPE9_A102E0_8_817830), not LROOM_REMAIN / BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_2(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_40_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_2_x_bits = offset_40_bits;
  events->type9_a106e0_2_y_bits = offset_c_bits;
  events->type9_a106e0_2_angle_bits = scale_28_bits;
  events->type9_a106e0_2_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_7;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_7;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v23: ninth type-9 a102e0 pack after host a102e0 @ 0x008182de.
 *   0x008182e3  xorps xmm0,xmm0
 *   0x008182e6  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x008182eb  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x008182ef  movss xmm0,[esp+0x14]          ; mul_05 recapture (no
 *                                              ; next-host push in this
 *                                              ; flow; resume-time slot
 *                                              ; [esp+0x14] directly)
 *   0x008182f5  addss xmm0,[eax]               ; + ret_x -> x
 *   0x00818301  movss [esp+0x3c],xmm1          ; y
 *   0x0081830b  movss [esp+0x38],xmm0          ; x
 * Identity stores of later arg-setup (0x00818311..0x00818337) stay with
 * the next host. Dest-copy 0x008180b9..0x008180f3 stays host. Host a106e0
 * stays host. Do not reopen 0x00818122 (v18), 0x0081817c (v19),
 * 0x008181d2 (v20), 0x00818228 (v21) or 0x00818273 (v22). No addss beyond
 * the two recaptures.
 * v24: the tenth type-9 a102e0 @ 0x00818338 is now a typed HOST_A102E0
 * (AT_TYPE9_A102E0_9_817830), not LROOM_REMAIN / BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_8(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_8_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_8_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_8;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_8;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v24: tenth type-9 a102e0 pack after host a102e0 @ 0x00818338.
 *   0x0081833d  xorps xmm0,xmm0
 *   0x00818340  push ecx                       ; first next-host arg push
 *                                              ; (stays host; shifts the
 *                                              ; subsequent slot refs by 4)
 *   0x00818341  lea ecx,[esp+0x68]             ; next-host this (host)
 *   0x00818345  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x0081834a  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x0081834e  movss xmm0,[esp+0x18]          ; mul_05 recapture (instruction
 *                                              ; operand AFTER the push ecx;
 *                                              ; resume-time slot [esp+0x14],
 *                                              ; same shape as v20/v21)
 *   0x00818354  addss xmm0,[eax]               ; + ret_x -> x
 *   0x00818358  lea eax,[esp+0xbc]             ; next-host arg (stays host)
 *   0x0081835f  mov dword [esp+0x6c],0         ; this+4 zero init (host:
 *                                              ; constant arg-setup store)
 *   0x00818367  movss [esp+0x64],xmm1          ; y (post-push offset)
 *   0x0081836d  movss [esp+0x60],xmm0          ; x (post-push offset)
 * Identity stores of later arg-setup (0x00818373..0x0081838a: movss
 * [esp+0x40]->[esp+0x68] x, movss [esp+0x28]->[esp] angle, push eax) stay
 * with the next host. No addss beyond the two recaptures. Dest-copy
 * clusters stay host. Host a102e0 stays host. Do not reopen 0x00818122
 * (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21),
 * 0x00818273 (v22) or 0x008182de (v23).
 * v25: the eleventh type-9 a102e0 @ 0x0081838b is now a typed HOST_A102E0
 * (AT_TYPE9_A102E0_10_817830 = 49), not LROOM_REMAIN / BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_9(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_9_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_9_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_9;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_9;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v25: eleventh type-9 a102e0 pack after host a102e0 @ 0x0081838b.
 *   0x00818390  xorps xmm0,xmm0
 *   0x00818393  push ecx                       ; first next-host arg push
 *                                              ; (stays host; shifts the
 *                                              ; subsequent slot refs by 4)
 *   0x00818394  lea ecx,[esp+0x10]             ; next-host this (host)
 *   0x00818398  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x0081839d  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x008183a1  movss xmm0,[esp+0x18]          ; mul_05 recapture (instruction
 *                                              ; operand AFTER the push ecx;
 *                                              ; resume-time slot [esp+0x14],
 *                                              ; same after-push shape as v24)
 *   0x008183a7  addss xmm0,[eax]               ; + ret_x -> x
 *   0x008183ab  lea eax,[esp+0xc4]             ; next-host arg (stays host)
 *   0x008183b2  mov dword [esp+0x14],0         ; this+4 zero init (host:
 *                                              ; constant arg-setup store)
 *   0x008183ba  movss [esp+0x98],xmm1          ; y (post-push offset)
 *   0x008183c3  movss [esp+0x94],xmm0          ; x (post-push offset)
 * Identity stores of later arg-setup (0x008183cc..0x008183e6: movss
 * [esp+0x9c]->[esp+0x10] x, movss [esp+0x28]->[esp] angle, push eax) stay
 * with the next host. No addss beyond the two recaptures. Dest-copy
 * clusters stay host. Host a102e0 stays host. Do not reopen 0x00818122
 * (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21),
 * 0x00818273 (v22), 0x008182de (v23) or 0x00818338 (v24).
 * v26: the twelfth type-9 a102e0 @ 0x008183e7 is now a typed HOST_A102E0
 * (AT_TYPE9_A102E0_11_817830 = 50), not LROOM_REMAIN / BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_10(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_10_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_10_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_10;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_10;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v26: twelfth type-9 a102e0 pack after host a102e0 @ 0x008183e7.
 *   0x008183ec  xorps xmm0,xmm0
 *   0x008183ef  lea ecx,[esp+0x120]          ; next-host this (stays host;
 *                                            ; NO push ecx in this flow)
 *   0x008183f6  movss xmm1,[eax+4]           ; ret_y recapture
 *   0x008183fb  addss xmm1,xmm0              ; + 0.0f -> y
 *   0x008183ff  movss xmm0,[esp+0x14]        ; mul_05 recapture (no next-host
 *                                            ; push BEFORE this read;
 *                                            ; resume-time slot [esp+0x14]
 *                                            ; directly — same shape as v23)
 *   0x00818405  addss xmm0,[eax]             ; + ret_x -> x
 *   0x00818409  lea eax,[esp+0x34]           ; next-host arg (stays host)
 *   0x0081840d  push eax                     ; first next-host arg push
 *                                            ; (shifts the later slot refs
 *                                            ; by 4)
 *   0x0081841a  movss [esp+0x74],xmm0        ; x (post-push offset)
 *   0x00818425  movss [esp+0x7c],xmm1        ; y (post-push offset)
 * Identity stores of later arg-setup (0x00818409..0x0081842b: three
 * lea/push arg pairs feeding the third a106e0 seam) stay with the next
 * host. No addss beyond the two recaptures. Dest-copy clusters stay host.
 * Host a102e0 stays host. Do not reopen 0x00818122 (v18), 0x0081817c
 * (v19), 0x008181d2 (v20), 0x00818228 (v21), 0x00818273 (v22),
 * 0x008182de (v23), 0x00818338 (v24) or 0x0081838b (v25).
 * v27: the third type-9 a106e0 seam @ 0x0081842c is now a typed
 * HOST_A106E0 (AT_TYPE9_A106E0_3_817830 = 51), not LROOM_REMAIN /
 * BODY_TAIL; its dest-copy cluster 0x00818431..0x0081846d stays host.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_11(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_11_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_11_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_3;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_3;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v27: third type-9 a106e0 seam after host a106e0 @ 0x0081842c.
 *   0x00818431..0x0081846d  dest-copy cluster (movups copies, byte-gate,
 *                           lea) stays host
 *   0x0081846f  movss xmm0,[esp+0x48]      ; offset_48 recapture
 *   0x00818475  movss [esp+0x50],xmm0      ; -> x
 *   0x0081847b  movss xmm0,[esp+0xc]       ; offset_c recapture
 *   0x00818481  movss [esp+0x54],xmm0      ; -> y
 *   0x00818487  movss xmm0,[esp+0x28]      ; scale_28 recapture
 *   0x0081848d  movss [esp],xmm0           ; -> angle
 * Identity stores: x = [esp+0x48], y = [esp+0xc], angle = [esp+0x28].
 * No addss. The byte-gate in the dest-copy cluster (`mov byte
 * [esp+0x140],1` then `mov eax,dword [esp+0x140]`) is landed as a pure
 * decision: the widened value is (1u & 0xff) as uint32_t; NO uint8_t
 * field (the Wasm ABI does not narrow and -O2 deletes masks on uint8_t
 * params).
 * v28: the thirteenth type-9 a102e0 @ 0x00818497 is now a typed
 * HOST_A102E0 (AT_TYPE9_A102E0_12_817830 = 52), not LROOM_REMAIN /
 * BODY_TAIL. Do not reopen 0x00818122 (v18), 0x0081817c (v19),
 * 0x008181d2 (v20), 0x00818228 (v21), 0x00818273 (v22), 0x008182de
 * (v23), 0x00818338 (v24), 0x0081838b (v25) or 0x008183e7 (v26).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_3(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_48_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_3_x_bits = offset_48_bits;
  events->type9_a106e0_3_y_bits = offset_c_bits;
  events->type9_a106e0_3_angle_bits = scale_28_bits;
  events->type9_a106e0_3_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_11;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_11;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v32: fourth type-9 a106e0 seam after host a106e0 @ 0x008185e8 (closes the
 * third a106e0 seam group).
 *   0x008185ed..0x0081861b  dest-copy cluster (movups [esp+0x120]->
 *                           [esp+0x4fc], byte-gate mov byte [esp+0x140],1 +
 *                           dword read-back, movups [esp+0x130]->
 *                           [esp+0x50c], mov [esp+0x51c],eax) stays host
 *   0x00818623  movss xmm0,[esp+0xa8]      ; offset_a8 recapture
 *   0x0081862c  movss [esp+0x4c],xmm0      ; -> x (pre-push)
 *   0x00818632  movss xmm0,[esp+8]         ; offset_c recapture
 *   0x00818638  push ecx                   ; next-host push (stays host)
 *   0x00818639  movss [esp+0x54],xmm0      ; -> y (post-push)
 *   0x0081863f  lea eax,[esp+0xa4]         ; next-host arg (stays host)
 *   0x00818646  movss xmm0,[esp+0x28]      ; scale_28 recapture
 *   0x0081864c  lea ecx,[esp+0x50]         ; next-host this (stays host)
 *   0x00818650  movss [esp],xmm0           ; -> angle (post-push)
 *   0x00818655  push eax                   ; arg push
 *   0x00818656  call 0x00a102e0            ; pack-17 a102e0 (seventeenth
 *                                          ; type-9 a102e0; first pack of
 *                                          ; the fourth seam group)
 * Identity stores: x = [esp+0xa8], y = [esp+8], angle = [esp+0x28].
 * No addss. The byte-gate in the dest-copy cluster (`mov byte
 * [esp+0x140],1` then `mov eax,dword [esp+0x140]`) is landed as a pure
 * decision: the widened value is (1u & 0xff) as uint32_t; NO uint8_t
 * field (the Wasm ABI does not narrow and -O2 deletes masks on uint8_t
 * params).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_4(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_a8_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_4_x_bits = offset_a8_bits;
  events->type9_a106e0_4_y_bits = offset_c_bits;
  events->type9_a106e0_4_angle_bits = scale_28_bits;
  events->type9_a106e0_4_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v28: thirteenth type-9 a102e0 pack after host a102e0 @ 0x00818497.
 *   0x0081849c  xorps xmm0,xmm0
 *   0x0081849f  push ecx                       ; next-host push (stays host;
 *                                              ; shifts later slot refs
 *                                              ; by 4)
 *   0x008184a0  lea ecx,[esp+0x58]             ; next-host this (stays host)
 *   0x008184a4  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x008184a9  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x008184ad  movss xmm0,[esp+0x18]          ; mul_05 recapture (instruction
 *                                              ; operand AFTER the push ecx;
 *                                              ; resume-time slot
 *                                              ; [esp+0x14], same after-push
 *                                              ; shape as v24/v25)
 *   0x008184b3  addss xmm0,[eax]               ; + ret_x -> x
 *   0x008184b7  lea eax,[esp+0xb4]             ; next-host arg (stays host)
 *   0x008184be  movss [esp+0x3c],xmm1          ; y (post-push offset)
 *   0x008184c4  movss [esp+0x38],xmm0          ; x (post-push offset)
 * Identity stores of later arg-setup (0x008184ca..0x008184e8: movss
 * [esp+0x40]->[esp+0x58] x, movss [esp+0xc]->[esp+0x5c] y, movss
 * [esp+0x28]->[esp] angle, push eax) stay with the next host. No addss
 * beyond the two recaptures. Dest-copy clusters stay host. Host a102e0
 * stays host. Do not reopen 0x00818122 (v18), 0x0081817c (v19),
 * 0x008181d2 (v20), 0x00818228 (v21), 0x00818273 (v22), 0x008182de
 * (v23), 0x00818338 (v24), 0x0081838b (v25), 0x008183e7 (v26) or
 * 0x0081842c (v27).
 * v29: the fourteenth type-9 a102e0 @ 0x008184ee is now a typed
 * HOST_A102E0 (AT_TYPE9_A102E0_13_817830 = 53), not LROOM_REMAIN /
 * BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_12(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_12_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_12_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_11;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_12;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v29: fourteenth type-9 a102e0 pack after host a102e0 @ 0x008184ee.
 *   0x008184f3  xorps xmm0,xmm0
 *   0x008184f6  push ecx                       ; next-host push (stays host;
 *                                              ; shifts later slot refs
 *                                              ; by 4)
 *   0x008184f7  lea ecx,[esp+0x68]             ; next-host this (stays host)
 *   0x008184fb  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x00818500  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x00818504  movss xmm0,[esp+0x18]          ; mul_05 recapture (instruction
 *                                              ; operand AFTER the push ecx;
 *                                              ; resume-time slot
 *                                              ; [esp+0x14], same after-push
 *                                              ; shape as v24/v25)
 *   0x0081850a  addss xmm0,[eax]               ; + ret_x -> x
 *   0x0081850e  lea eax,[esp+0xbc]             ; next-host arg (stays host)
 *   0x00818515  mov dword [esp+0x6c],0         ; this+4 zero init (host:
 *                                              ; constant arg-setup store)
 *   0x0081851d  movss [esp+0xa0],xmm1          ; y (post-push offset)
 *   0x00818526  movss [esp+0x9c],xmm0          ; x (post-push offset)
 * Identity stores of later arg-setup (0x0081852f..0x00818545: movss
 * [esp+0x48]->[esp+0x68] x, movss [esp+0x28]->[esp] angle, push eax) stay
 * with the next host. No addss beyond the two recaptures. Dest-copy
 * clusters stay host. Host a102e0 stays host. Do not reopen 0x00818122
 * (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21),
 * 0x00818273 (v22), 0x008182de (v23), 0x00818338 (v24), 0x0081838b (v25),
 * 0x008183e7 (v26), 0x0081842c (v27) or 0x00818497 (v28).
 * Next remain is the fifteenth type-9 a102e0 @ 0x00818547 (stays
 * host; not peeled in this ABI).
 * v30: the fifteenth type-9 a102e0 @ 0x00818547 is now a typed
 * HOST_A102E0 (AT_TYPE9_A102E0_14_817830 = 54), not LROOM_REMAIN /
 * BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_13(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_13_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_13_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_13;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_13;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v30: fifteenth type-9 a102e0 pack after host a102e0 @ 0x00818547.
 *   0x0081854c  xorps xmm0,xmm0
 *   0x0081854f  push ecx                       ; next-host push (stays host;
 *                                              ; shifts later slot refs
 *                                              ; by 4)
 *   0x00818550  lea ecx,[esp+0x10]             ; next-host this (stays host)
 *   0x00818554  movss xmm1,[eax+4]             ; ret_y recapture
 *   0x00818559  addss xmm1,xmm0                ; + 0.0f -> y
 *   0x0081855d  movss xmm0,[esp+0x18]          ; mul_05 recapture (instruction
 *                                              ; operand AFTER the push ecx;
 *                                              ; resume-time slot
 *                                              ; [esp+0x14], same after-push
 *                                              ; shape as v24/v25)
 *   0x00818563  addss xmm0,[eax]               ; + ret_x -> x
 *   0x00818567  lea eax,[esp+0xc4]             ; next-host arg (stays host)
 *   0x0081856e  mov dword [esp+0x14],0         ; this+4 zero init (host:
 *                                              ; constant arg-setup store)
 *   0x00818576  movss [esp+0x64],xmm1          ; y (post-push offset)
 *   0x0081857c  movss [esp+0x60],xmm0          ; x (post-push offset)
 * Identity stores of later arg-setup (0x00818582..0x00818598: movss
 * [esp+0x40]->[esp+0x10] x, movss [esp+0x28]->[esp] angle, push eax) stay
 * with the next host. No addss beyond the two recaptures. Dest-copy
 * clusters stay host. Host a102e0 stays host. Do not reopen 0x00818122
 * (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21),
 * 0x00818273 (v22), 0x008182de (v23), 0x00818338 (v24), 0x0081838b (v25),
 * 0x008183e7 (v26), 0x0081842c (v27), 0x00818497 (v28) or 0x008184ee
 * (v29). Pack shape identical to the v24 tenth pack (stores y ->
 * [esp+0x64], x -> [esp+0x60]; only the next-host this/identity targets
 * differ: [esp+0x10] vs [esp+0x68]).
 * Next remain is the sixteenth type-9 a102e0 @ 0x0081859a (stays
 * host; not peeled in this ABI).
 * v31: the sixteenth type-9 a102e0 @ 0x0081859a is now a typed
 * HOST_A102E0 (AT_TYPE9_A102E0_15_817830 = 55), not LROOM_REMAIN /
 * BODY_TAIL.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_14(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_14_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_14_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_14;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_14;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v31: sixteenth type-9 a102e0 pack after host a102e0 @ 0x0081859a.
 *   0x0081859f  xorps xmm0,xmm0
 *   0x008185a2  lea ecx,[esp+0x120]          ; next-host this (stays host;
 *                                            ; NO next-host push in this
 *                                            ; flow)
 *   0x008185a9  movss xmm1,[eax+4]           ; ret_y recapture
 *   0x008185ae  addss xmm1,xmm0              ; + 0.0f -> y
 *   0x008185b2  movss xmm0,[esp+0x14]        ; mul_05 recapture (no next-host
 *                                            ; push BEFORE this read;
 *                                            ; resume-time slot [esp+0x14]
 *                                            ; directly — same no-push shape
 *                                            ; as v23/v26)
 *   0x008185b8  addss xmm0,[eax]             ; + ret_x -> x
 *   0x008185bc  lea eax,[esp+0x34]           ; next-host arg 1 (stays host)
 *   0x008185c0  push eax                     ; arg push 1 (shifts the later
 *                                            ; slot refs by 4)
 *   0x008185c1  lea eax,[esp+0x9c]           ; next-host arg 2 (stays host)
 *   0x008185c8  push eax                     ; arg push 2
 *   0x008185c9  lea eax,[esp+0x64]           ; next-host arg 3 (stays host)
 *   0x008185cd  movss [esp+0x98],xmm0        ; x (post-push offset)
 *   0x008185d6  push eax                     ; arg push 3
 *   0x008185d7  lea eax,[esp+0x9c]           ; next-host arg 4 (stays host)
 *   0x008185de  movss [esp+0xa0],xmm1        ; y (post-push offset)
 *   0x008185e7  push eax                     ; arg push 4
 * Four lea/push arg pairs 0x008185bc..0x008185e7 feeding the fourth
 * a106e0 seam stay host. No addss beyond the two recaptures. Dest-copy
 * clusters stay host. Host a102e0 stays host. Do not reopen 0x00818122
 * (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21),
 * 0x00818273 (v22), 0x008182de (v23), 0x00818338 (v24), 0x0081838b (v25),
 * 0x008183e7 (v26), 0x0081842c (v27), 0x00818497 (v28), 0x008184ee (v29)
 * or 0x00818547 (v30). X stored BEFORE y (both post-push).
 * Next remain is the fourth type-9 a106e0 seam @ 0x008185e8 (stays
 * host; not peeled in this ABI).
 * v32: the fourth type-9 a106e0 seam @ 0x008185e8 is now a typed
 * HOST_A106E0 (AT_TYPE9_A106E0_4_817830 = 56), not LROOM_REMAIN /
 * BODY_TAIL; its dest-copy cluster 0x008185ed..0x0081861b stays host.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_15(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_15_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_15_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_4;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_4;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v33: seventeenth type-9 a102e0 pack after host a102e0 @ 0x00818656
 * (first pack of the FOURTH a106e0 seam group).
 *   0x0081865b  xorps xmm0,xmm0
 *   0x0081865e  push ecx                     ; next-host push (stays host;
 *                                            ; shifts later slot refs
 *                                            ; by 4)
 *   0x0081865f  lea ecx,[esp+0x58]           ; next-host this (stays host)
 *   0x00818663  movss xmm1,[eax+4]           ; ret_y recapture
 *   0x00818668  addss xmm1,xmm0              ; + 0.0f -> y
 *   0x0081866c  movss xmm0,[esp+0x18]        ; mul_05 recapture (instruction
 *                                            ; operand AFTER the push ecx;
 *                                            ; resume-time slot
 *                                            ; [esp+0x14], same after-push
 *                                            ; shape as v24/v25/v28)
 *   0x00818672  addss xmm0,[eax]             ; + ret_x -> x
 *   0x00818676  lea eax,[esp+0xb4]           ; next-host arg (stays host)
 *   0x0081867d  movss [esp+0x3c],xmm1        ; y (post-push offset)
 *   0x00818683  movss [esp+0x38],xmm0        ; x (post-push offset)
 * Identity arg-setup 0x00818689..0x008186ac ([esp+0x48]->[esp+0x58],
 * [esp+0xc]->[esp+0x5c], [esp+0x28]->[esp] angle, push eax) stays host
 * (v18-style; feeds pack-18). No addss beyond the two recaptures.
 * Dest-copy clusters stay host. Host a102e0 stays host. Do not reopen
 * 0x00818122 (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228
 * (v21), 0x00818273 (v22), 0x008182de (v23), 0x00818338 (v24),
 * 0x0081838b (v25), 0x008183e7 (v26), 0x0081842c (v27), 0x00818497
 * (v28), 0x008184ee (v29), 0x00818547 (v30), 0x0081859a (v31) or
 * 0x008185e8 (v32). Pack store offsets identical to the v28 twelfth
 * pack (y -> [esp+0x3c], x -> [esp+0x38]).
 * v34: now emits the typed AT_TYPE9_A102E0_17_817830 (58) to the
 * eighteenth type-9 a102e0 @ 0x008186ad (hostArg0 / lroomNextVa =
 * 0x008186ad).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_16(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_16_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_16_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_17;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_17;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v34: eighteenth type-9 a102e0 pack after host a102e0 @ 0x008186ad
 * (second pack of the FOURTH a106e0 seam group).
 *   0x008186b2  xorps xmm0,xmm0
 *   0x008186b5  push ecx                     ; next-host push (stays host;
 *                                            ; shifts later slot refs
 *                                            ; by 4)
 *   0x008186b6  lea ecx,[esp+0x68]           ; next-host this (stays host)
 *   0x008186ba  movss xmm1,[eax+4]           ; ret_y recapture
 *   0x008186bf  addss xmm1,xmm0              ; + 0.0f -> y
 *   0x008186c3  movss xmm0,[esp+0x18]        ; mul_05 recapture (instruction
 *                                            ; operand AFTER the push ecx;
 *                                            ; resume-time slot
 *                                            ; [esp+0x14], same after-push
 *                                            ; shape as v24/v25/v28/v33)
 *   0x008186c9  addss xmm0,[eax]             ; + ret_x -> x
 *   0x008186cd  lea eax,[esp+0xbc]           ; next-host arg (stays host)
 *   0x008186d4  mov dword [esp+0x6c],0       ; zero store (host: constant
 *                                            ; arg-setup store, same
 *                                            ; pattern as v24/v25/v29)
 *   0x008186dc  movss [esp+0x44],xmm1        ; y (post-push offset)
 *   0x008186e2  movss [esp+0x40],xmm0        ; x (post-push offset)
 * Identity arg-setup 0x008186e8..0x00818702 ([esp+0xac]->[esp+0x68],
 * [esp+0x28]->[esp] angle, push eax) stays host (v18-style; feeds
 * pack-19). No addss beyond the two recaptures. Dest-copy clusters
 * stay host. Host a102e0 stays host. Do not reopen 0x00818122 (v18),
 * 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21), 0x00818273
 * (v22), 0x008182de (v23), 0x00818338 (v24), 0x0081838b (v25),
 * 0x008183e7 (v26), 0x0081842c (v27), 0x00818497 (v28), 0x008184ee
 * (v29), 0x00818547 (v30), 0x0081859a (v31), 0x008185e8 (v32) or
* pack shape identical to the v33 pack but with
 * next-host this/arg [esp+0x68]/[esp+0xbc], the [esp+0x6c] zero
 * store and y -> [esp+0x44], x -> [esp+0x40].
 * v35: now emits the typed AT_TYPE9_A102E0_18_817830 (59) to the
 * nineteenth type-9 a102e0 @ 0x00818703 (hostArg0 / lroomNextVa =
 * 0x00818703).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_17(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_17_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_17_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_18;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_18;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v35: nineteenth type-9 a102e0 pack after host a102e0 @ 0x00818703
 * (third pack of the FOURTH a106e0 seam group).
 *   0x00818708  xorps xmm0,xmm0
 *   0x0081870b  push ecx                     ; next-host push (stays host;
 *                                            ; shifts later slot refs
 *                                            ; by 4)
 *   0x0081870c  lea ecx,[esp+0x10]           ; next-host this (stays host)
 *   0x00818710  movss xmm1,[eax+4]           ; ret_y recapture
 *   0x00818715  addss xmm1,xmm0              ; + 0.0f -> y
 *   0x00818719  movss xmm0,[esp+0x18]        ; mul_05 recapture (instruction
 *                                            ; operand AFTER the push ecx;
 *                                            ; resume-time slot
 *                                            ; [esp+0x14], same after-push
 *                                            ; shape as v24/v25/v28/v33/v34)
 *   0x0081871f  addss xmm0,[eax]             ; + ret_x -> x
 *   0x00818723  lea eax,[esp+0xc4]           ; next-host arg (stays host)
 *   0x0081872a  mov dword [esp+0x14],0       ; zero store (host: constant
 *                                            ; arg-setup store, same
 *                                            ; pattern as v24/v25/v29/v34)
 *   0x00818732  movss [esp+0xa0],xmm1        ; y (post-push offset)
 *   0x0081873b  movss [esp+0x9c],xmm0        ; x (post-push offset)
 * Identity arg-setup 0x00818744..0x0081875b ([esp+0x48]->[esp+0x10],
 * [esp+0x28]->[esp] angle, push eax) stays host (v18-style; feeds
 * pack-20). No addss beyond the two recaptures. Dest-copy clusters
 * stay host. Host a102e0 stays host. Do not reopen 0x00818122 (v18),
 * 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21), 0x00818273
 * (v22), 0x008182de (v23), 0x00818338 (v24), 0x0081838b (v25),
 * 0x008183e7 (v26), 0x0081842c (v27), 0x00818497 (v28), 0x008184ee
 * (v29), 0x00818547 (v30), 0x0081859a (v31), 0x008185e8 (v32),
 * 0x00818656 (v33) or 0x008186ad (v34). Pack store offsets
 * y -> [esp+0xa0], x -> [esp+0x9c] (post-push; identical store offsets
 * to the v29 fourteenth pack).
 * Next remain is the twentieth type-9 a102e0 @ 0x0081875c (fourth pack
 * of the fourth seam group; peeled in this ABI).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_18(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_18_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_18_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_19;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_19;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v35: twentieth type-9 a102e0 pack after host a102e0 @ 0x0081875c
 * (fourth pack of the FOURTH a106e0 seam group).
 *   0x00818761  xorps xmm0,xmm0
 *   0x00818764  lea ecx,[esp+0x120]         ; next-host this (stays host;
 *                                            ; NO next-host push in this
 *                                            ; flow)
 *   0x0081876b  movss xmm1,[eax+4]           ; ret_y recapture
 *   0x00818770  addss xmm1,xmm0              ; + 0.0f -> y
 *   0x00818774  movss xmm0,[esp+0x14]        ; mul_05 recapture (no next-host
 *                                            ; push BEFORE this read;
 *                                            ; resume-time slot [esp+0x14]
 *                                            ; directly — same no-push shape
 *                                            ; as v23/v26/v31)
 *   0x0081877a  addss xmm0,[eax]             ; + ret_x -> x
 *   0x0081877e  lea eax,[esp+0x34]           ; next-host arg 1 (stays host)
 *   0x00818782  push eax                     ; arg push 1 (shifts the later
 *                                            ; slot refs by 4)
 *   0x00818783  lea eax,[esp+0x40]           ; next-host arg 2 (stays host)
 *   0x00818787  push eax                     ; arg push 2
 *   0x00818788  lea eax,[esp+0xa0]           ; next-host arg 3 (stays host)
 *   0x0081878f  movss [esp+0x64],xmm0        ; x (post-push offset)
 *   0x00818795  push eax                     ; arg push 3
 *   0x00818796  lea eax,[esp+0x68]           ; next-host arg 4 (stays host)
 *   0x0081879a  movss [esp+0x6c],xmm1        ; y (post-push offset)
 *   0x008187a0  push eax                     ; arg push 4
 * Four lea/push arg pairs 0x0081877e..0x008187a0 feeding the fifth
 * a106e0 seam stay host. No addss beyond the two recaptures. Dest-copy
 * clusters stay host. Host a102e0 stays host. Do not reopen 0x00818122
 * (v18), 0x0081817c (v19), 0x008181d2 (v20), 0x00818228 (v21),
 * 0x00818273 (v22), 0x008182de (v23), 0x00818338 (v24), 0x0081838b
 * (v25), 0x008183e7 (v26), 0x0081842c (v27), 0x00818497 (v28),
 * 0x008184ee (v29), 0x00818547 (v30), 0x0081859a (v31), 0x008185e8
 * (v32), 0x00818656 (v33), 0x008186ad (v34) or 0x00818703 (v35).
 * Pack shape identical to the v31 sixteenth pack (no-push mul read
 * [esp+0x14]; x stored BEFORE y; four arg pairs), only the store
 * offsets differ: x -> [esp+0x64], y -> [esp+0x6c] (post-push).
 * Next remain is the fifth type-9 a106e0 seam @ 0x008187a1 (starts
 * the FIFTH seam group; peeled in this ABI).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_19(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_19_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_19_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_5;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_5;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v35: fifth type-9 a106e0 seam pack after host a106e0 @ 0x008187a1
 * (starts the FIFTH a106e0 seam group).
 *   0x008187a6  movups xmm0,[esp+0x120]      ; ┐ dest-copy cluster
 *   0x008187ae  mov byte [esp+0x140],1       ; │ byte-gate
 *   0x008187b6  movups [esp+0x520],xmm0      ; │
 *   0x008187be  movups xmm0,[esp+0x130]      ; │
 *   0x008187c6  mov eax,dword [esp+0x140]    ; │ dword read-back
 *   0x008187cd  movups [esp+0x530],xmm0      ; │
 *   0x008187d5  push ecx                     ; next-host push (stays host;
 *                                            ; shifts the later slot refs
 *                                            ; by 4)
 *   0x008187d6  movss xmm0,[esp+0x30]        ; offset_30 recapture
 *                                            ; (instruction operand AFTER
 *                                            ; the push ecx; resume-time
 *                                            ; slot [esp+0x2c])
 *   0x008187dc  lea ecx,[esp+0x50]           ; next-host this (stays host)
 *   0x008187e0  movss [esp+0x50],xmm0        ; -> x (post-push)
 *   0x008187e6  movss xmm0,[esp+0xc]         ; offset_c recapture (after
 *                                            ; the push ecx; resume-time
 *                                            ; slot [esp+8])
 *   0x008187ec  movss [esp+0x54],xmm0        ; -> y (post-push)
 *   0x008187f2  movss xmm0,[esp+0x28]        ; scale_28 recapture (after
 *                                            ; the push ecx; resume-time
 *                                            ; slot [esp+0x24])
 *   0x008187f8  mov [esp+0x544],eax          ; dword read-back store (host;
 *                                            ; dest-copy cluster)
 *   0x008187ff  lea eax,[esp+0xa4]           ; next-host arg (stays host)
 *   0x00818806  movss [esp],xmm0             ; -> angle (post-push)
 *   0x0081880b  push eax                     ; arg push
 *   0x0081880c  call 0x00a102e0              ; pack-21 a102e0
 *                                            ; (next remain, kind 30
 *                                            ; LROOM_REMAIN, first pack
 *                                            ; of the fifth seam group)
 * Identity stores: x = [esp+0x30] -> [esp+0x50], y = [esp+0xc] ->
 * [esp+0x54], angle = [esp+0x28] -> [esp], all post-push (the resume
 * writes the bits, the host glue places them). No addss. The byte-gate
 * in the dest-copy cluster (`mov byte [esp+0x140],1` then
 * `mov eax,dword [esp+0x140]`) is landed as a pure decision: the
 * widened value is (1u & 0xff) as uint32_t; NO uint8_t field (the
 * Wasm ABI does not narrow and -O2 deletes masks on uint8_t params).
 * Dest-copy 0x008187a6..0x008187cd + the read-back store [esp+0x544]
 * stay host.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_5(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_30_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_5_x_bits = offset_30_bits;
  events->type9_a106e0_5_y_bits = offset_c_bits;
  events->type9_a106e0_5_angle_bits = scale_28_bits;
  events->type9_a106e0_5_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_20;
  /* v36: the seam now emits the typed AT_TYPE9_A102E0_20_817830 (62)
     to the twenty-first a102e0 @ 0x0081880c (was kind 30 LROOM_REMAIN
     at ABI v35). */
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_20;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v36: twenty-first type-9 a102e0 pack after host a102e0 @ 0x0081880c
 * (first pack of the FIFTH a106e0 seam group).
 *   0x00818811  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00818814  push ecx                    ; next-host push (slots shift 4)
 *   0x00818815  lea ecx,[esp+0x58]          ; next-host this (stays host)
 *   0x00818819  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x0081881e  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00818822  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00818828  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x0081882c  lea eax,[esp+0xb4]          ; next-host arg (stays host)
 *   0x00818833  movss [esp+0x3c],xmm1       ; -> y (post-push)
 *   0x00818839  movss [esp+0x38],xmm0       ; -> x (post-push)
 *   0x0081883f..0x00818860 identity arg-setup ([esp+0xac]->[esp+0x58],
 *                               [esp+0xc]->[esp+0x5c], [esp+0x28]->[esp]
 *                               angle; v18-style; stays host)
 *   0x00818865  push eax ; 0x00818866 call 0x00a102e0  ; pack-22
 * Identity stores: y -> [esp+0x3c], x -> [esp+0x38], both post-push.
 * No zero store in this pack (unlike pack-22 which zeroes [esp+0x6c]).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_20(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_20_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_20_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_21;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_21;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v37: twenty-second type-9 a102e0 pack after host a102e0 @ 0x00818866
 * (second pack of the FIFTH a106e0 seam group).
 *   0x0081886b  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x0081886e  push ecx                    ; next-host push (slots shift 4)
 *   0x0081886f  lea ecx,[esp+0x68]          ; next-host this (stays host)
 *   0x00818873  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00818878  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x0081887c  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00818882  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00818886  lea eax,[esp+0xbc]          ; next-host arg (stays host)
 *   0x0081888d  mov dword [esp+0x6c],0      ; ZERO store (pack-22
 *                                           ; signature; stays HOST --
 *                                           ; same class as the _18-pack
 *                                           ; zero store)
 *   0x00818895  movss [esp+0x4c],xmm1       ; -> y (post-push)
 *   0x0081889b  movss [esp+0x48],xmm0       ; -> x (post-push)
 *   0x008188a1..0x008188b3 identity arg-setup ([esp+0x30]->[esp+0x68],
 *                               [esp+0x28]->[esp] angle; v18-style;
 *                               stays host)
 *   0x008188b8  push eax ; 0x008188b9 call 0x00a102e0  ; pack-23
 * Identity stores: y -> [esp+0x4c], x -> [esp+0x48]; identity src is
 * [esp+0x30] (NOT [esp+0xac] as in pack-21). The zero store stays host.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_21(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_21_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_21_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_22;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_22;
  return 1;
}
/* ---------------------------------------------------------------------------
 * v38: twenty-third type-9 a102e0 pack after host a102e0 @ 0x008188b9
 * (third pack of the FIFTH a106e0 seam group).
 *   0x008188be  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x008188c1  push ecx                    ; next-host push (slots shift 4)
 *   0x008188c2  lea ecx,[esp+0x10]          ; next-host this (stays host)
 *   0x008188c6  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x008188cb  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x008188cf  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x008188d5  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x008188d9  lea eax,[esp+0xc4]          ; next-host arg (stays host)
 *   0x008188e0  mov dword [esp+0x14],0      ; ZERO store -- STAYS HOST
 *   0x008188e8  movss [esp+0x44],xmm1       ; -> y (post-push)
 *   0x008188ee  movss [esp+0x40],xmm0       ; -> x (post-push)
 *   0x008188f4..0x00818909 identity arg-setup ([esp+0xac]->[esp+0x10],
 *                               [esp+0x28]->[esp] angle; v18-style;
 *                               stays host)
 *   0x0081890e  push eax ; 0x0081890f call 0x00a102e0  ; pack-24
 * Identity stores: y -> [esp+0x44], x -> [esp+0x40]; identity src is
 * [esp+0xac]. The zero store stays host.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_22(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_22_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_22_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_23;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_23;
  return 1;
}
/* ---------------------------------------------------------------------------
 * v39: twenty-fourth type-9 a102e0 pack after host a102e0 @ 0x0081890f
 * (fourth pack of the fifth a106e0 seam group -- CHAIN BREAK: this
 * pack's continuation feeds an A106E0, not another a102e0).
 *   0x00818914  xorps xmm1,xmm1             ; XMM1 normalizer (shape
 *                                           ; deviation: prior packs
 *                                           ; used XMM0)
 *   0x00818917  movss xmm0,[eax+4]          ; ret_y recapture (host return)
 *   0x0081891c  addss xmm0,xmm1             ; y = ret_y + 0.0f
 *   0x00818920  movss xmm1,[esp+0x14]       ; mul_05 recapture (NO
 *                                           ; next-host push before the
 *                                           ; reads -- pre-push shape,
 *                                           ; resume-time slot [esp+0x14])
 *   0x00818926  addss xmm1,[eax]            ; x = mul_05 + ret_x
 *   0x0081892a..53 four lea/push arg pairs + the x/y identity stores
 *               ([esp+0xa0] <- x, [esp+0xa8] <- y; all host glue)
 *   0x00818953  lea ecx,[esp+0x130]
 *   0x0081895a  call 0x00a106e0             ; SIXTH a106e0 seam
 * No zero store in this pack. Everything past the two addss stays
 * host (arg-setup + the a106e0 edge itself).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_23(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_23_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_23_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_6;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_6;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_rt_pop_begin(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
       ISAAC_GAME_RENDER_HOST_RT_POP_A19180, ISAAC_GAME_RENDER_VA_RT_A19180,
       ISAAC_GAME_RENDER_VA_RT_MANAGER_C798E0, 0u, 1u);
  events->host_arg0 = 1u;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_rt_pop_check(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* VA 0x0080f187: the depth REFRESHED after the a19180 host; zero logs the
     empty-stack diagnostic before the restore pair. */
  const int32_t assert_needed = inputs->dat_c79790 == 0u ? 1 : 0;
  events->rt_assert_needed = static_cast<uint32_t>(assert_needed);
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_RESTORE,
       ISAAC_GAME_RENDER_HOST_RT_POP, ISAAC_GAME_RENDER_VA_RT_A18300, 0u, 0u,
       1u);
  events->host_arg0 =
      assert_needed != 0 ? ISAAC_GAME_RENDER_VA_RT_EMPTY_MSG : 0u;
  events->host_arg1 =
      assert_needed != 0 ? ISAAC_GAME_RENDER_VA_RT_EMPTY_MSG_ARG : 0u;
  events->rt_assert_needed = static_cast<uint32_t>(assert_needed);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_rt_pop_final(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* P9 (VA 0x0080f1b5…0x0080f1c9): sub then cmove on ZF — the base clears
     only when the decremented depth is exactly 0 (0 wraps to 0xffffffff and
     does NOT clear). Depth is the value REFRESHED after the restore pair. */
  uint32_t depth_after = 0u;
  const int32_t cleared =
      isaac_render_shell_rt_pop_depth_step(inputs->dat_c79790, &depth_after);
  events->rt_depth_after = depth_after;
  events->rt_base_cleared = static_cast<uint32_t>(cleared);
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_825DE0,
       ISAAC_GAME_RENDER_HOST_EPILOG_825DE0,
       ISAAC_GAME_RENDER_VA_EPILOG_825DE0, 0u, 0u, 1u);
  events->rt_depth_after = depth_after;
  events->rt_base_cleared = static_cast<uint32_t>(cleared);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_epilog(
    const IsaacGameRenderSliceState* state, uint32_t flag11f6_after,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || events == nullptr) {
    return 0;
  }
  /* G9/P3 (VA 0x0080f1d5…0x0080f1e7): compares == 1 EXACTLY; 2..0xff do not
     trigger. flag11f6_after is the byte RE-READ after the 0x00825de0 host. */
  uint8_t flag = static_cast<uint8_t>(flag11f6_after & 0xffu);
  const int32_t ran = isaac_render_shell_flag11f6_oneshot(&flag);
  events->flag11f6_cleared = static_cast<uint32_t>(ran);
  if (ran != 0) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_826AE0,
         ISAAC_GAME_RENDER_HOST_EPILOG_826AE0,
         ISAAC_GAME_RENDER_VA_EPILOG_826AE0, 0u, 0u, 1u);
    events->flag11f6_cleared = static_cast<uint32_t>(ran);
    return 1;
  }
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_820FD0,
       ISAAC_GAME_RENDER_HOST_EPILOG_820FD0,
       ISAAC_GAME_RENDER_VA_EPILOG_820FD0, 0u, 0u, 1u);
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_epilog_final(
    const IsaacGameRenderSliceState* state,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || events == nullptr) {
    return 0;
  }
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_820FD0,
       ISAAC_GAME_RENDER_HOST_EPILOG_820FD0,
       ISAAC_GAME_RENDER_VA_EPILOG_820FD0, 0u, 0u, 1u);
  return 1;
}

/* ---------------------------------------------------------------------------
 * Deep nested-body continuations (FUN_00817830 subtree).
 * --------------------------------------------------------------------------- */

extern "C" int32_t isaac_game_render_slice_resume_sprite_pair_a(
    uint32_t sprite_pre, uint32_t sprite_after, uint32_t sprite_b0,
    uint32_t sprite_b1, uint32_t layer_b0, uint32_t layer_b1,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (events == nullptr) {
    return 0;
  }
  (void)sprite_pre;
  /* Post-A phase keyed on the RECAPTURED sprite pointer (VA 0x004085de). */
  const int32_t post = isaac_render_shell_408590_post_a_plan(
      sprite_after, sprite_b0, sprite_b1, layer_b0, layer_b1);
  if (post == ISAAC_RENDER_SHELL_408590_POST_A_PAIR_B) {
    events->vtable_dispatch_calls = 1u;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_NESTED,
         ISAAC_GAME_RENDER_HOST_VT_408590_PAIR_B, 0u, sprite_after,
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_408590_VT_PAIR_B_OFF), 1u);
    events->vtable_dispatch_calls = 1u;
    events->host_arg0 = layer_b0;
    events->host_arg1 = layer_b1;
    return 1;
  }
  events->continuation_kind = ISAAC_GAME_RENDER_CONTINUE_NESTED;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_shared_ptr(
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t addref_result,
    uint32_t dest_ctrl_after, uint32_t release_result,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* dest_ctrl_after is [dest+4] RE-READ at VA 0x0040c57e. */
  const int32_t resume =
      isaac_render_shell_40c550_resume_plan(addref_result, dest_ctrl_after);
  if (resume == ISAAC_RENDER_SHELL_40C550_RESUME_RELEASE) {
    events->vtable_dispatch_calls = 1u;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_NESTED,
         ISAAC_GAME_RENDER_HOST_VT_40C550_RELEASE, 0u, dest_ctrl_after,
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF),
         1u);
    events->vtable_dispatch_calls = 1u;
    return 1;
  }
  if (isaac_render_shell_40c550_hook_needed(release_result,
                                            inputs->dat_c7163c) != 0) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_NESTED,
         ISAAC_GAME_RENDER_HOST_HOOK_C7163C, inputs->dat_c7163c, 0u, 0u, 1u);
    return 1;
  }
  events->continuation_kind = ISAAC_GAME_RENDER_CONTINUE_NESTED;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_room_type(
    const IsaacGameRenderSliceState* state, uint32_t game_ptr,
    int32_t room_idx, int32_t stage_entry, int32_t stage_after,
    uint32_t stage_type_4, int32_t desc_dword0, int32_t desc_field10_nz,
    int32_t field14, uint32_t* out_type, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || events == nullptr) {
    return 0;
  }
  /* stage_after is [this+0] RE-READ at VA 0x0074f6f0; stage_entry is the
     pre-call read at VA 0x0074f6ad. Separate parameters on purpose. */
  const uint32_t type = isaac_render_shell_74f690_resolve_post(
      game_ptr, ISAAC_RENDER_SHELL_GET_STAGE_ID_MODE_44, room_idx, stage_entry,
      stage_after, stage_type_4, 0u, desc_dword0, desc_field10_nz, 0.0f, 0.0f,
      field14);
  if (out_type != nullptr) {
    *out_type = type;
  }
  events->continuation_kind = ISAAC_GAME_RENDER_CONTINUE_NESTED;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_once_init(
    uint32_t guard_after, IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (events == nullptr) {
    return 0;
  }
  /* guard_after is DAT_00c8108c RE-READ at VA 0x00740d50 vs -1. */
  const int32_t plan = isaac_render_shell_740bc0_once_init_resume(
      static_cast<int32_t>(guard_after));
  if (plan == ISAAC_RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT) {
    emit(events, ISAAC_GAME_RENDER_CONTINUE_NESTED,
         ISAAC_GAME_RENDER_HOST_ONCE_CTOR, ISAAC_GAME_RENDER_VA_ROOMDESC_CTOR,
         isaac_render_shell_740bc0_empty_va(), 0u, 1u);
    /* grid + tree sentinel allocations, VA 0x006ef629/0x006ef6bf. */
    events->alloc_calls = 2u;
    return 1;
  }
  events->continuation_kind = ISAAC_GAME_RENDER_CONTINUE_NESTED;
  return 1;
}

/* ---------------------------------------------------------------------------
 * Introspection.
 * --------------------------------------------------------------------------- */

extern "C" uint32_t isaac_game_render_slice_abi_version(void) {
  return ISAAC_GAME_RENDER_SLICE_ABI_VERSION;
}
extern "C" uint32_t isaac_game_render_slice_state_size(void) {
  return static_cast<uint32_t>(sizeof(IsaacGameRenderSliceState));
}
extern "C" uint32_t isaac_game_render_slice_runtime_inputs_size(void) {
  return static_cast<uint32_t>(sizeof(IsaacGameRenderSliceRuntimeInputs));
}
extern "C" uint32_t isaac_game_render_slice_events_size(void) {
  return static_cast<uint32_t>(sizeof(IsaacGameRenderSliceEvents));
}
extern "C" uint32_t isaac_game_render_slice_game_object_min_size(void) {
  return static_cast<uint32_t>(ISAAC_GAME_RENDER_GAME_OBJECT_MIN_SIZE);
}
extern "C" uint32_t isaac_game_render_slice_root_va(void) {
  return ISAAC_GAME_RENDER_VA_SHELL;
}
extern "C" uint32_t isaac_game_render_slice_entity_render_va(void) {
  return ISAAC_GAME_RENDER_VA_ENTITY_RENDER;
}

extern "C" int32_t isaac_game_render_slice_host_is_vtable(uint32_t host_kind) {
  switch (host_kind) {
    case ISAAC_GAME_RENDER_HOST_VT_408590_PAIR_A:
    case ISAAC_GAME_RENDER_HOST_VT_408590_PAIR_B:
    case ISAAC_GAME_RENDER_HOST_VT_40C550_ADDREF:
    case ISAAC_GAME_RENDER_HOST_VT_40C550_RELEASE:
      return 1;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_game_render_slice_continuation_needs_recapture(
    uint32_t cont) {
  return cont_needs_recapture(cont);
}

/* ---------------------------------------------------------------------------
 * v39 CENSUS (sixth a106e0 seam @ 0x0081895a, body to the post-gate
 * pack run): dest-copy cluster (movups [esp+0x120] -> [esp+0x544];
 * byte-gate mov byte [esp+0x140],1 @0x00818967 + dword read-back
 * @0x00818976 -> [esp+0x568] -- the landed (1u & 0xff) widen class;
 * movups [esp+0x134] -> [esp+0x558]); push -1 + call 0xa0f550
 * @0x0081899e (alloc); then a LONG host draw chain -- repeated
 * call 0x67f310 (@0x00818a9f/0x818aff/0x818bb9/0x818c0a/0x818c67/
 * 0x818cbe...) with float position glue (mulss [0xbaa2d0] scale,
 * addss ret pairs, subss [esp+0xc]) and interleaved 0xa10dd0 +
 * 0xa0f550 pairs -- ALL HOST. The pack run resumes @0x00819720.
 * The seam's ONE decision is the gate below.
 *
 * v38/v39 context: lroom_pack G23 (type != 9) lands at
 * VA_LROOM_JOIN_9394 = 0x00819394. This resume consumes that remain:
 *   0x00819394  cmp dword [eax+0x48], 0xa   ; FULL dword, UNSIGNED eq
 *   0x00819398  jne 0x0081a975              ; type != 10 -> LROOM join
 * Fall-through (type == 10) continues the draw chain; the next
 * unpeeled host call is the first post-gate a102e0 pack @ 0x00819720.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_lroom_gate_type10_eq(
    uint32_t room_type48_after) {
  /* cmp dword [eax+0x48], 0xa -- FULL dword equality (a wide value
     with a low byte of 0x0a but high bits set is NOT equal). */
  return room_type48_after == 0xau ? 1 : 0;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_lroom_join_9394(
    const IsaacGameRenderSliceState* state, uint32_t room_type48_after,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || events == nullptr) {
    return 0;
  }
  if (isaac_game_render_slice_lroom_gate_type10_eq(room_type48_after)) {
    /* fall-through: v41 upgrades the remain to the typed AT_TYPE9_
       A102E0_24_817830 (67) -- the first post-gate a102e0 pack
       @ 0x00819720 is peeled this ABI. */
    events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE10_FIRST_PACK_9720;
    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830,
         ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u,
         0u, 1u);
    events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE10_FIRST_PACK_9720;
    return 1;
  }
  /* jne 0x0081a975: the already-pinned LROOM join. */
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_LROOM_JOIN_A975;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
       ISAAC_GAME_RENDER_HOST_BODY_817830_TAIL, events->lroom_next_va,
       0u, 0u, 1u);
  return 1;
}

/* ---------------------------------------------------------------------------
 * v41: twenty-fourth type-9 a102e0 pack after host a102e0
 * @ 0x00819720 (first post-gate pack of the type-10 run).
 *   0x00819725  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819728  push ecx                    ; next-host push (slots shift 4)
 *   0x00819729  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x0081972e  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819732  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819738  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x0081973c  mov dword [esp+0x58],0      ; ZERO store -- STAYS HOST
 *   0x00819744  lea eax,[esp+0xb4]          ; next-host arg (stays host)
 *   0x0081974b  movss [esp+0x3c],xmm1       ; -> y (post-push)
 *   0x00819751  movss [esp+0x38],xmm0       ; -> x (post-push)
 *   0x00819757..69 identity arg-setup ([esp+0xc]->[esp+0x5c],
 *                               [esp+0x28]->[esp]; v18-style; host)
 *   0x0081976e  push eax ; 0x00819773 call 0x00a102e0  ; pack 25
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_24(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_24_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_24_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_25;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_25;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v41: twenty-fifth type-9 a102e0 pack after host a102e0 @ 0x00819773
 * (second pack of the type-10 run).
 *   0x00819778  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x0081977b  push ecx                    ; next-host push (slots shift 4)
 *   0x0081977c  lea ecx,[esp+0x68]          ; next-host this (stays host)
 *   0x00819780  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00819785  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819789  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x0081978f  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819793  lea eax,[esp+0xbc]          ; next-host arg (stays host)
 *   0x0081979a  mov dword [esp+0x6c],0      ; ZERO store -- STAYS HOST
 *   0x008197a2  movss [esp+0x64],xmm1       ; -> y (post-push)
 *   0x008197a8  movss [esp+0x60],xmm0       ; -> x (post-push)
 *   0x008197ae..c3 identity arg-setup ([esp+0xac]->[esp+0x68],
 *                               [esp+0x28]->[esp]; v18-style; host)
 *   0x008197c8  push eax ; 0x008197c9 call 0x00a102e0  ; pack 26
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_25(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_25_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_25_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_26;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_26;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v42: twenty-sixth type-9 a102e0 pack after host a102e0 @ 0x008197c9
 * (third pack of the type-10 run).
 *   0x008197ce  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x008197d1  push ecx                    ; next-host push (slots shift 4)
 *   0x008197d2  lea ecx,[esp+0x10]          ; next-host this (stays host)
 *   0x008197d6  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x008197db  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x008197df  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x008197e5  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x008197e9  lea eax,[esp+0xc4]          ; next-host arg (stays host)
 *   0x008197f0  mov dword [esp+0x10],0      ; ZERO store -- STAYS HOST
 *   0x008197f8  mov dword [esp+0x14],0      ; SECOND zero store -- also
 *                                           ; host (zeroes the mul slot
 *                                           ; itself after the read)
 *   0x00819800  movss [esp+0x74],xmm1       ; -> y (post-push)
 *   0x00819806  movss [esp+0x70],xmm0       ; -> x (post-push)
 *   0x0081980c..12 angle [esp+0x28]->[esp] (host glue)
 *   0x00819817  push eax ; 0x00819818 call 0x00a102e0  ; pack 27
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_26(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_26_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_26_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_27;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_27;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v42: twenty-seventh type-9 a102e0 pack after host a102e0
 * @ 0x00819818 (fourth pack of the type-10 run -- CHAIN BREAK: its
 * continuation feeds the A106E0 @ 0x00819863).
 *   0x0081981d  xorps xmm0,xmm0             ; +0.0f normalizer; NO
 *                                           ; next-host push before the
 *                                           ; reads (pre-push shape)
 *   0x00819820  lea ecx,[esp+0x120]         ; next-host this (stays host)
 *   0x00819827  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x0081982c  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819830  movss xmm0,[esp+0x14]       ; mul_05 recapture (resume-
 *                                           ; time slot [esp+0x14]
 *                                           ; directly)
 *   0x00819836  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x0081983a..62 four lea/push arg pairs + identity stores
 *               ([esp+0x84] <- x after two pushes, [esp+0x8c] <- y
 *               after three; all host glue); no zero store
 *   0x0081890f-style tail: push eax ; call 0x00a106e0 @ 0x00819863
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_27(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_27_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_27_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_7;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_7;
  return 1;
}
/* ---------------------------------------------------------------------------
 * v43: SEVENTH a106e0 seam pack after host a106e0 @ 0x00819863
 * (dest-copy cluster class, sixth-seam precedent).
 *   0x00819868  movups xmm0,[esp+0x120]    ; dest-copy -> [esp+0x490]
 *   0x00819870  mov byte [esp+0x140],1     ; byte-gate (HOST store)
 *   0x00819878  mov eax,[esp+0x140]        ; dword read-back
 *   0x00819890  mov [esp+0x4b4],eax        ; widened value stored (host)
 *   0x00819888/a2 movups [esp+0x134]->[esp+0x4a4] ; dest-copy (host)
 *   0x00819887  push ecx                   ; next-host push (slots +4)
 *   0x00819897  lea ecx,[esp+0x50]         ; next-host this (stays host)
 *   0x008198aa  movss xmm0,[esp+0x48]      ; offset_48 identity (resume-
 *                                          ; time slot [esp+0x44])
 *   0x008198b0  movss [esp+0x50],xmm0      ; -> x (identity copy)
 *   0x008198b6  movss xmm0,[esp+0xc]       ; offset_c identity
 *   0x008198bc  movss [esp+0x54],xmm0      ; -> y
 *   0x008198c2/c8 movss xmm0,[esp+0x28] -> [esp] ; angle
 *   0x0081989b/bb lea/push eax               ; arg setup (host)
 *   0x008198cd  push eax ; 0x008198ce call 0x00a102e0 ; pack 28
 * The widened byte-gate value is (1u & 0xff) -- the landed widen law.
 * Everything except the three identity copies stays host.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_7(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_48_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_7_x_bits = offset_48_bits;
  events->type9_a106e0_7_y_bits = offset_c_bits;
  events->type9_a106e0_7_angle_bits = scale_28_bits;
  events->type9_a106e0_7_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_28;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_28;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v43: twenty-eighth type-9 a102e0 pack after host a102e0 @ 0x008198ce
 *   0x008198d3  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x008198d6/d b movss xmm1,[eax+4]; addss xmm1,xmm0 ; y = ret_y + 0.0f
 *   0x008198df  movss xmm0,[esp+0x14]       ; mul_05 recapture -- PRE-PUSH
 *                                           ; shape (no next-host push
 *                                           ; before 0x0081990a; resume-
 *                                           ; time slot [esp+0x14])
 *   0x008198e5  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x008198e9/ef stores y -> [esp+0x38], x -> [esp+0x34]
 *   0x008198f5..22 identity/glue ([esp+0xa8]->[esp+0x54], [esp+8]->
 *                               [esp+0x5c] pre-push, push ecx @
 *                               0x0081990a, [esp+0x28]->[esp])
 *   0x00819927  push eax ; 0x00819928 call 0x00a102e0 ; pack 29
 * No zero store in this pack.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_28(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_28_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_28_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_29;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_29;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v44: twenty-ninth type-9 a102e0 pack after host a102e0 @ 0x00819928
 *   0x0081992d  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819930  push ecx                    ; next-host push (slots shift 4)
 *   0x00819931  lea ecx,[esp+0x68]          ; next-host this (stays host)
 *   0x00819935  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x0081993a  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x0081993e  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819944  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819948  lea eax,[esp+0xbc]          ; next-host arg (stays host)
 *   0x0081994f  mov dword [esp+0x6c],0      ; ZERO store -- STAYS HOST
 *   0x00819957  movss [esp+0x64],xmm1       ; -> y (post-push)
 *   0x0081995d  movss [esp+0x60],xmm0       ; -> x (post-push)
 *   0x00819963..75 identity arg-setup ([esp+0x48]->[esp+0x68] -- the
 *                               a106e0_7 identity-source slot; angle
 *                               [esp+0x28]->[esp]; host glue)
 *   0x0081997a  push eax ; 0x0081997b call 0x00a102e0  ; pack 30
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_29(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_29_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_29_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_30;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_30;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v44: thirtieth type-9 a102e0 pack after host a102e0 @ 0x0081997b
 *   0x00819980  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819983  push ecx                    ; next-host push (slots shift 4)
 *   0x00819984  lea ecx,[esp+0x10]          ; next-host this (stays host)
 *   0x00819988  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x0081998d  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819991  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819997  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x0081999b  lea eax,[esp+0xc4]          ; next-host arg (stays host)
 *   0x008199a2  mov dword [esp+0x14],0      ; ZERO store -- STAYS HOST
 *                                           ; (zeroes the mul slot itself)
 *   0x008199aa  movss [esp+0x74],xmm1       ; -> y (post-push)
 *   0x008199b0  movss [esp+0x70],xmm0       ; -> x (post-push)
 *   0x008199b6..cb identity arg-setup ([esp+0xac]->[esp+0x10], angle
 *                               [esp+0x28]->[esp]; host glue)
 *   0x008199d0  push eax ; 0x008199d1 call 0x00a102e0  ; pack 31
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_30(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_30_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_30_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_8;
  /* CHAIN BREAK: pack-30 feeds the EIGHTH a106e0 seam. */
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_8;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v45: EIGHTH a106e0 seam pack after host a106e0 @ 0x00819a1c
 * (dest-copy cluster class).
 *   0x00819a21  movups xmm0,[esp+0x120] -> [esp+0x4b4]  ; dest-copy HOST
 *   0x00819a29  mov byte [esp+0x140],1                 ; byte-gate HOST
 *   0x00819a31  mov eax,[esp+0x140]                    ; dword read-back
 *   0x00819a49  mov [esp+0x4d8],eax                    ; widened -> HOST
 *   0x00819a41/5b movups [esp+0x134]->[esp+0x4c8]      ; dest-copy HOST
 *   0x00819a40  push ecx                               ; slots shift 4
 *   0x00819a63  movss xmm0,[esp+0x40]                  ; offset_40
 *                                                      ; identity
 *                                                      ; (resume-time
 *                                                      ; slot [esp+0x3c])
 *   0x00819a69  movss [esp+0x50],xmm0                  ; -> x (identity)
 *   0x00819a6f  movss xmm0,[esp+0xc]                   ; offset_c identity
 *   0x00819a75  movss [esp+0x54],xmm0                  ; -> y
 *   0x00819a7b/81 angle [esp+0x28]->[esp]
 *   0x00819a54/bb lea/push eax                          ; arg setup HOST
 *   0x00819a86  push eax ; 0x00819a87 call 0x00a102e0  ; pack 31
 * The widened byte-gate value is (1u & 0xff) -- the landed widen law.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_8(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_40_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_8_x_bits = offset_40_bits;
  events->type9_a106e0_8_y_bits = offset_c_bits;
  events->type9_a106e0_8_angle_bits = scale_28_bits;
  events->type9_a106e0_8_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_31;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_31;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v45: thirty-first type-9 a102e0 pack after host a102e0 @ 0x00819a87
 *   0x00819a8c  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819a8f/db y = ret_y + 0.0f        ; ret reads [eax+4]/[eax]
 *   0x00819a98  movss xmm0,[esp+0x14]       ; mul_05 -- PRE-PUSH shape
 *                                           ; (no next-host push before
 *                                           ; 0x00819aa2; resume-time
 *                                           ; slot [esp+0x14])
 *   0x00819a9e  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819aaa  movss [esp+0x3c],xmm1       ; -> y
 *   0x00819ab4  movss [esp+0x38],xmm0       ; -> x
 *   0x00819aba/c0/c6/d8 identity/glue ([esp+0x48]->[esp+0x58],
 *                               [esp+0xc]->[esp+0x5c], angle
 *                               [esp+0x28]->[esp]; host)
 *   0x00819ade  call 0x00a102e0             ; pack 32 (PARKED)
 * No zero store in this pack.
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_31(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_31_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_31_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_32;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_32;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v46: thirty-second type-9 a102e0 pack after host a102e0 @ 0x00819ade
 * (third pack of the type-10 run continuation).
 *   0x00819ae3  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819ae6  push ecx                    ; next-host push (slots shift 4)
 *   0x00819aeb  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00819af0  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819af4  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819afa  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819b05  mov dword [esp+0x6c],0      ; ZERO store -- STAYS HOST
 *   0x00819b0d  movss [esp+0x64],xmm1       ; -> y (post-push)
 *   0x00819b13  movss [esp+0x60],xmm0       ; -> x (post-push)
 *   0x00819b19..2b identity arg-setup ([esp+0x40]->[esp+0x68] -- pack
 *                               32's own identity-source slot; angle
 *                               [esp+0x28]->[esp]; host glue)
 *   0x00819b30  push eax ; 0x00819b31 call 0x00a102e0  ; pack 33
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_32(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_32_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_32_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_33;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_33;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v46: thirty-third type-9 a102e0 pack after host a102e0 @ 0x00819b31
 *   0x00819b36  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819b39  push ecx                    ; next-host push (slots shift 4)
 *   0x00819b3e  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00819b43  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819b47  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819b4d  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819b58  mov dword [esp+0x14],0      ; ZERO store -- STAYS HOST
 *                                           ; (zeroes the mul slot itself)
 *   0x00819b60  movss [esp+0x74],xmm1       ; -> y (post-push)
 *   0x00819b66  movss [esp+0x70],xmm0       ; -> x (post-push)
 *   0x00819b6c..7e identity arg-setup ([esp+0x48]->[esp+0x10], angle
 *                               [esp+0x28]->[esp]; host glue)
 *   0x00819b83  push eax ; 0x00819b84 call 0x00a102e0  ; pack 34
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_33(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_33_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_33_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_34;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_34;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v47: thirty-fourth type-9 a102e0 pack after host a102e0 @ 0x00819b84
 * (fourth pack of the type-10 run -- CHAIN BREAK: its continuation
 * feeds the NINTH a106e0 seam).
 *   0x00819b89  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819b93/db y = ret_y + 0.0f        ; ret reads [eax+4]/[eax]
 *   0x00819b9c  movss xmm0,[esp+0x14]       ; mul_05 -- PRE-PUSH shape
 *                                           ; (no next-host push before
 *                                           ; 0x00819baa; resume-time
 *                                           ; slot [esp+0x14])
 *   0x00819ba2  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819bb4/b e x -> [esp+0x84], y -> [esp+0x8c] (identity stores,
 *                                           ; host glue inside the four
 *                                           ; lea/push arg pairs)
 *   NO zero store in this pack.
 *   0x00819bcf call 0x00a106e0              ; NINTH a106e0 seam
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_34(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_34_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_34_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_9;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_9;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v47: NINTH a106e0 seam pack after host a106e0 @ 0x00819bcf
 * (dest-copy cluster class).
 *   0x00819bd4  movups xmm0,[esp+0x120] -> [esp+0x4d8]  ; dest-copy HOST
 *   0x00819bdc  mov byte [esp+0x140],1                  ; byte-gate HOST
 *   0x00819be4  mov eax,[esp+0x140]                     ; dword read-back
 *   0x00819bfc  mov [esp+0x4fc],eax                     ; widened HOST
 *   0x00819bf4/a movups [esp+0x134]->[esp+0x4ec]        ; dest-copy HOST
 *   0x00819bf3  push ecx                                ; slots shift 4
 *   0x00819c12  movss xmm0,[esp+0x9c]                   ; offset_9c
 *                                                      ; identity
 *                                                      ; (resume-time
 *                                                      ; slot [esp+0x98])
 *   0x00819c1b  movss [esp+0x50],xmm0                   ; -> x (identity)
 *   0x00819c21  movss xmm0,[esp+0xc]                    ; offset_c identity
 *   0x00819c27  movss [esp+0x54],xmm0                   ; -> y
 *   0x00819c2d/33 angle [esp+0x28]->[esp]
 *   0x00819c03/38 lea/push eax                           ; arg setup HOST
 *   0x00819c39  lea ecx,[esp+0x54]
 *   0x00819c3d  call 0x00a102e0                          ; pack 35
 * The widened byte-gate value is (1u & 0xff).
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_9(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_9c_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_9_x_bits = offset_9c_bits;
  events->type9_a106e0_9_y_bits = offset_c_bits;
  events->type9_a106e0_9_angle_bits = scale_28_bits;
  events->type9_a106e0_9_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_35;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_35;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v48: thirty-fifth type-9 a102e0 pack after host a102e0 @ 0x00819c3d
 *   0x00819c42  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819c45  push ecx                    ; next-host push (slots shift 4)
 *   0x00819c4a  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00819c4f  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819c53  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819c59  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819c5d  lea eax,[esp+0xb4]          ; next-host arg (stays host)
 *   0x00819c64/c6a stores y -> [esp+0x3c], x -> [esp+0x38]; NO zero store
 *   identity src [esp+0x40]->[esp+0x58]; angle [esp+0x28]->[esp]
 *   0x00819c93  push eax ; 0x00819c94 call 0x00a102e0  ; pack 36
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_35(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_35_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_35_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_36;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_36;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v48: thirty-sixth type-9 a102e0 pack after host a102e0 @ 0x00819c94
 *   0x00819c99  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819c9c  push ecx                    ; next-host push (slots shift 4)
 *   0x00819ca1  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00819ca6  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819caa  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819cb0  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819cbb  mov dword [esp+0x6c],0      ; ZERO store -- STAYS HOST
 *   0x00819cc3  movss [esp+0x4c],xmm1       ; -> y (post-push)
 *   0x00819cc9  movss [esp+0x48],xmm0       ; -> x (post-push)
 *   0x00819ccf..e4 identity arg-setup ([esp+0x9c]->[esp+0x68] -- the
 *                               a106e0_9 x-source slot; angle
 *                               [esp+0x28]->[esp]; host glue)
 *   0x00819ce9  push eax ; 0x00819cea call 0x00a102e0  ; pack 37
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_36(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_36_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_36_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_37;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_37;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v49: thirty-seventh type-9 a102e0 pack after host a102e0 @ 0x00819cea
 *   0x00819cef  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819cf2  push ecx                    ; next-host push (slots shift 4)
 *   0x00819cf3  lea ecx,[esp+0x10]          ; next-host this (stays host)
 *   0x00819cf7  movss xmm1,[eax+4]          ; ret_y recapture (host return)
 *   0x00819cfc  addss xmm1,xmm0             ; y = ret_y + 0.0f
 *   0x00819d00  movss xmm0,[esp+0x18]       ; mul_05 recapture (AFTER the
 *                                           ; push ecx; resume-time slot
 *                                           ; [esp+0x14])
 *   0x00819d06  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   0x00819d0a  lea eax,[esp+0xc4]          ; next-host arg (stays host)
 *   0x00819d11  mov dword [esp+0x14],0      ; ZERO store -- STAYS HOST
 *                                           ; (zeroes the mul slot itself)
 *   0x00819d19  movss [esp+0x64],xmm1       ; -> y (post-push)
 *   0x00819d1f  movss [esp+0x60],xmm0       ; -> x (post-push)
 *   0x00819d25..37 identity arg-setup ([esp+0x40]->[esp+0x10], angle
 *                               [esp+0x28]->[esp]; host glue)
 *   0x00819d3c  push eax ; 0x00819d3d call 0x00a102e0  ; pack 38
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_37(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_37_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_37_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_38;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_38;
  return 1;
}

/* ---------------------------------------------------------------------------
 * v49: thirty-eighth type-9 a102e0 pack after host a102e0 @ 0x00819d3d
 *   0x00819d42  xorps xmm0,xmm0             ; +0.0f normalizer
 *   0x00819d45  lea ecx,[esp+0x120]         ; next-host this (stays host)
 *   0x00819d4c/db y = ret_y + 0.0f        ; ret reads [eax+4]/[eax]
 *   0x00819d55  movss xmm0,[esp+0x14]       ; mul_05 -- PRE-PUSH shape
 *                                           ; (no next-host push before
 *                                           ; 0x00819d63; resume-time
 *                                           ; slot [esp+0x14])
 *   0x00819d5b  addss xmm0,[eax]            ; x = mul_05 + ret_x
 *   NO zero store in this pack.
 *   0x00819d5f..7e four lea/push arg pairs + identity stores
 *               ([esp+0x74] <- x, [esp+0x7c] <- y; all host glue)
 *   0x00819d7f call 0x00a106e0              ; TENTH a106e0 seam --
 *                                           ; CHAIN BREAK out of the
 *                                           ; a102e0 class
 * --------------------------------------------------------------------------- */
extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_38(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_38_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_38_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_10;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_10;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_10(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_90_bits,
    uint32_t offset_8_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_10_x_bits = offset_90_bits;
  events->type9_a106e0_10_y_bits = offset_8_bits;
  events->type9_a106e0_10_angle_bits = scale_28_bits;
  events->type9_a106e0_10_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_39;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_39;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_39(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_39_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_39_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_40;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_40;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_40(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_40_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_40_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_41;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_41;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_41(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_41_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_41_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_42;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_42;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_42(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_42_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_42_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_11;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830,
       ISAAC_GAME_RENDER_HOST_A106E0, ISAAC_GAME_RENDER_VA_A106E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_11;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a106e0_11(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_30_bits,
    uint32_t offset_c_bits, uint32_t scale_28_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  events->type9_a106e0_11_x_bits = offset_30_bits;
  events->type9_a106e0_11_y_bits = offset_c_bits;
  events->type9_a106e0_11_angle_bits = scale_28_bits;
  events->type9_a106e0_11_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_43;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_43;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_43(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_43_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_43_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_44;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_44;
  return 1;
}

extern "C" int32_t isaac_game_render_slice_resume_817830_type9_a102e0_44(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_44_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_44_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_45;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_45;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_45(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_45_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_45_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_46;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_46;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_46(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t mul_05_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);
  const float out_y = bits_to_f32(eax_y_bits) + 0.0f;
  events->type9_a102e0_46_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_46_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_12;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_12;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a106e0_12(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* TWELFTH a106e0 seam (dest-copy cluster class): the only typed
     recapture in its continuation is the gate byte store
     mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140] ->
     gate = (1u & 0xffu). The movups dest-copies ([esp+0x120]->
     [esp+0x544], [esp+0x134]->[esp+0x558], widened dword ->
     [esp+0x568]) stay HOST. No scalar x/y/angle recapture exists in
     this seam's continuation (unlike seams 7..11). */
  events->type9_a106e0_12_gate_bits = (1u & 0xffu);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_HOST_A0F550_CALLSITE;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_HOST_A0F550_CALLSITE;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_47(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_47_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_47_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_48;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_48;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_48(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_48_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_48_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_49;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_49;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_49(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_49_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_49_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_50;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_50;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_50(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-50's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_50_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_50_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_51;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_51;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_51(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_51_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_51_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_52;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_52;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_52(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_52_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_52_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_53;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_53;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_53(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-53's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_53_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_53_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_54;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_54;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_54(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_54_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_54_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_55;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_55;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_55(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_55_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_55_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_56;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_56;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_56(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_56_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_56_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_57;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_57;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_57(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-57's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_57_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_57_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_58;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_58;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_58(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_58_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_58_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_59;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_59;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_59(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_59_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_59_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_60;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_60;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_60(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_60_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_60_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_61;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_61;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_61(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-61's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. Pair cadence so
     far: packs 50/53/57/61/65 -- one gap of 3 then every 4th. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_61_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_61_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_62;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_62;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_62(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_62_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_62_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_63;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_63;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_63(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_63_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_63_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_64;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_64;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_64(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_64_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_64_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_65;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_65;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_65(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-65's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. Pair cadence so
     far: 50/53/57/61/65/69 -- one gap of 3 then every 4th. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_65_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_65_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_66;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_66;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_66(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_66_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_66_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_67;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_67;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_67(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_67_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_67_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_68;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_68;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_68(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_68_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_68_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_69;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_69;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_69(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-69's
     continuation folds the a11130/a112a0 host pair AND the a0f550
     draw-band station plus a ~0xa00-byte pure draw-band stretch
     (0x67f310 draws whose setters/adders chain off DRAW results, not
     pack results -- no typed recapture; a10dd0/a11060 host too). */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_69_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_69_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_70;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_70;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_70(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_70_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_70_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_71;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_71;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_71(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_71_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_71_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_72;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_72;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_72(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 (at 0x0081c0ec -- typed,
     NOT terminal; the cluster runs on) computes Q->xy = S->xy +
     pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_72_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_72_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_73;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_73;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_73(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-73's
     continuation folds the a11130/a112a0 host pair before the next
     pack. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_73_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_73_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_74;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_74;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_74(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_74_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_74_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_75;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_75;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_75(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_75_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_75_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_76;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_76;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_76(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_76_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_76_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_77;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_77;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_77(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-77's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. Pair cadence so
     far: 50/53/57/61/65/69/73/77 -- steady every-4th since 53. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_77_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_77_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_78;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_78;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_78(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_78_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_78_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_79;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_79;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_79(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_79_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_79_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_80;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_80;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_80(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_80_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_80_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_81;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_81;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_81(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-81's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. Pair cadence so
     far: 50/53/57/61/65/69/73/77/81 -- steady every-4th since 53. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_81_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_81_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_82;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_82;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_82(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_82_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_82_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_83;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_83;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_83(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_83_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_83_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_84;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_84;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_84(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_84_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_84_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_85;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_85;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_85(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-85's
     continuation folds the a11130/a112a0 host pair (Q consumed as an
     arg; no typed recapture) before the next pack. Pair cadence so
     far: 50/53/57/61/65/69/73/77/81/85 -- steady every-4th since 53. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_85_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_85_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_86;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_86;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_86(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_86_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_86_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_87;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_87;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_87(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_87_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_87_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_88;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_88;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_88(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second
     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_88_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_88_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_89;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_89;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_89(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_89_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_89_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_90;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_90;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_90(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_90_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_90_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_91;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_91;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_91(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_91_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_91_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_92;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_92;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_92(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_92_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_92_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_93;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_93;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_93(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_93_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_93_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_94;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_94;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_94(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_94_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_94_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_95;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_95;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_95(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_95_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_95_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_96;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_96;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_96(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_96_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_96_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_97;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_97;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_97(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_97_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_97_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_98;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_98;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_98(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_98_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_98_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_99;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_99;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_99(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_99_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_99_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_100;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_100;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_100(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_100_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_100_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_101;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_101;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_101(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_101_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_101_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_102;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_102;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_102(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_102_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_102_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_103;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_103;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_103(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_103_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_103_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_104;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_104;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_104(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_104_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_104_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_105;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_105;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_105(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_105_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_105_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_106;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_106;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_106(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_106_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_106_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_107;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_107;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_107(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_107_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_107_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_108;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_108;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_108(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). The second\n     setter + next-pack this prep stay host. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_108_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_108_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_109;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_109;
  return 1;
}

int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_109(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-109 TERMINAL: folds pair + station @ 0x0081dab9 + draw-band.
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y). Pack-109 TERMINAL: folds pair + station @ 0x0081dab9 + draw-band. */
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_109_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_109_y_bits = f32_to_bits(out_y);
  events->lroom_next_va = ISAAC_GAME_RENDER_VA_HOST_A0F550_TERMINAL_109;
  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830,
       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,
       1u);
  events->host_arg0 = ISAAC_GAME_RENDER_VA_HOST_A0F550_TERMINAL_109;
  return 1;
}
