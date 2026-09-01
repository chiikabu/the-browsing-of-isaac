#pragma once

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Game render root slice — composition of the render-shell pure helpers
   (ABI v29, game-logic complete) into one root entry with an explicit
   host-event ABI and typed continuations.

   Root: frame shell FUN_0080ea80 (VA 0x0080ea80 / RVA 0x40ea80). The shell
   has NO exact ZHL match and keeps an address-stable name. The entity root
   Game::Render @ 0x00806c20 IS an exact ZHL match and is deliberately kept
   as a host mega-event: this slice calls it once per entity, it does not
   translate it.

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
   PE evidence: output/decomp/5129df723e64/section-notes/render-slice-v1/
   disasm-80ea80-full.txt (complete shell disassembly, entry to ret at
   VA 0x0080f1f8) plus the render-advance-2 … render-v29 note chain.

   THIS IS A ROOT SLICE ABI, NOT A PE-FREE RENDER. The shell's own control
   flow, gates and arithmetic are translated; every remaining boundary is an
   explicit, address-stable host event. It is not wired into the live frame
   loop and makes no performance claim of any kind.

   Recapture discipline (structural, from five confirmed stale-state defects
   in this section: 0x00408590 pair B, 0x0040c550 dest control, 0x0074f690
   stage id, 0x00740bc0 once-guard, 0x0080eead entity loop):

   Every Game-object field the PE reads AFTER a host boundary is an explicit
   parameter of the resume entry that crosses that boundary. It is NOT read
   from the entry-captured state, so a folded reading is not expressible:
     - the option-ON body reads every one of its Game fields after at least
       one host call (the prolog host 0x00419b50 receives &Game+0x1204 /
       ecx=Game+0x1218), so ALL of them arrive via resume parameters;
     - room flags [*(Game+4)+0x44] are read THREE times by the PE
       (VA 0x0080ebcc G2, VA 0x0080ecfe G10, VA 0x0080edc6 G12) with hosts
       between each pair of reads — three separate parameters;
     - Game+8 is read at VA 0x0080ed55 (boost mode) and again at
       VA 0x0080ef08 (overlay gate) across the entity/grid host loops — two
       separate parameters;
     - the entity loop re-derives BOTH its bound ([Game+0x1264] re-read at
       VA 0x0080eecb after every Game::Render) and its array base
       ([Game+0x125c] re-read at VA 0x0080eebc at the top of every
       iteration). The resume takes per-iteration arrays; there is no
       single-count overload;
     - the grid product IS folded once by the PE (VA 0x0080eed6 into a stack
       slot, decremented) — recorded as a deliberate asymmetry;
     - manager/global values consumed after a host boundary come from the
       runtime-inputs struct, which the caller must refresh before each
       resume (per-field timing documented in decomp/game-render-slice.json).

   The always-host prolog (VA 0x0080ea80…0x0080eb1b: 0x006856c0, 0x00684f30,
   0x00a18300(DAT_00c797b4,0), 0x00a18230, 0x00419b50, 0x00a19180(1),
   0x006836c0, plus the manager dword0/dword1 snapshot) is a precondition of
   isaac_game_render_slice_step, not an event this slice emits. */
enum { ISAAC_GAME_RENDER_SLICE_ABI_VERSION = 73 };

enum {
  ISAAC_GAME_RENDER_GAME_OBJECT_MIN_SIZE = 0x3bb20,
  ISAAC_GAME_RENDER_ENTITY_MAX_STEPS = 64,
  ISAAC_GAME_RENDER_GRID_MAX_STEPS = 512
};

/* Typed continuations, in PE order. Recovered from game-render-model.mjs. */
enum {
  ISAAC_GAME_RENDER_CONTINUE_DONE = 0,
  ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_825DE0 = 1,
  ISAAC_GAME_RENDER_CONTINUE_AT_RT_REBIND = 2,
  ISAAC_GAME_RENDER_CONTINUE_AT_BIND_A1DFD0 = 3,
  ISAAC_GAME_RENDER_CONTINUE_AT_STAGE39 = 4,
  ISAAC_GAME_RENDER_CONTINUE_AT_FADE_POLLS = 5,
  ISAAC_GAME_RENDER_CONTINUE_AT_BOOST_74EFD0 = 6,
  ISAAC_GAME_RENDER_CONTINUE_AT_BOOST_827BC0 = 7,
  ISAAC_GAME_RENDER_CONTINUE_AT_FADE_CLOSE = 8,
  ISAAC_GAME_RENDER_CONTINUE_AT_COLOR_BIND = 9,
  ISAAC_GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY = 10,
  ISAAC_GAME_RENDER_CONTINUE_AT_TREE_ERASE = 11,
  ISAAC_GAME_RENDER_CONTINUE_AT_ENTITY = 12,
  ISAAC_GAME_RENDER_CONTINUE_AT_GRID_ENTRY = 13,
  ISAAC_GAME_RENDER_CONTINUE_AT_GRID = 14,
  ISAAC_GAME_RENDER_CONTINUE_AT_OVERLAY_GATE = 15,
  ISAAC_GAME_RENDER_CONTINUE_AT_ANIM_RENDER = 16,
  ISAAC_GAME_RENDER_CONTINUE_AT_AUX_GATE = 17,
  ISAAC_GAME_RENDER_CONTINUE_AT_AUX_POLLS = 18,
  ISAAC_GAME_RENDER_CONTINUE_AT_BODY_817830 = 19,
  ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_A19180 = 20,
  ISAAC_GAME_RENDER_CONTINUE_AT_RT_POP_RESTORE = 21,
  ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_826AE0 = 22,
  ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_820FD0 = 23,
  ISAAC_GAME_RENDER_CONTINUE_NESTED = 24,
  ISAAC_GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830 = 25,
  ISAAC_GAME_RENDER_CONTINUE_AT_TRUNK_817830 = 26,
  ISAAC_GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830 = 27,
  ISAAC_GAME_RENDER_CONTINUE_AT_TAIL_817830 = 28,
  ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830 = 29,
  ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830 = 30,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830 = 31,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830 = 32,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830 = 33,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830 = 34,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830 = 35,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830 = 36,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830 = 37,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830 = 38,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830 = 39,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830 = 40,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830 = 41,
  /* v18: host typed a102e0 @ 0x00818122 -> resume_817830_type9_a102e0_4 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830 = 42,
  /* v19: host typed a102e0 @ 0x0081817c -> resume_817830_type9_a102e0_5 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830 = 43,
  /* v20: host typed a102e0 @ 0x008181d2 -> resume_817830_type9_a102e0_6 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830 = 44,
  /* v21: host typed a102e0 @ 0x00818228 -> resume_817830_type9_a102e0_7 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830 = 45,
  /* v22: host typed a106e0 @ 0x00818273 -> resume_817830_type9_a106e0_2 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830 = 46,
  /* v23: host typed a102e0 @ 0x008182de -> resume_817830_type9_a102e0_8 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830 = 47,
  /* v24: host typed a102e0 @ 0x00818338 -> resume_817830_type9_a102e0_9 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830 = 48,
  /* v25: host typed a102e0 @ 0x0081838b -> resume_817830_type9_a102e0_10 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830 = 49,
  /* v26: host typed a102e0 @ 0x008183e7 -> resume_817830_type9_a102e0_11 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830 = 50,
  /* v27: host typed a106e0 @ 0x0081842c -> resume_817830_type9_a106e0_3 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830 = 51,
  /* v28: host typed a102e0 @ 0x00818497 -> resume_817830_type9_a102e0_12 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830 = 52,
  /* v29: host typed a102e0 @ 0x008184ee -> resume_817830_type9_a102e0_13 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830 = 53,
  /* v30: host typed a102e0 @ 0x00818547 -> resume_817830_type9_a102e0_14 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830 = 54,
  /* v31: host typed a102e0 @ 0x0081859a -> resume_817830_type9_a102e0_15 */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830 = 55,
  /* v32: host typed a106e0 @ 0x008185e8 -> resume_817830_type9_a106e0_4
     (fourth type-9 a106e0 seam; closes the third seam group) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830 = 56,
  /* v33: host typed a102e0 @ 0x00818656 -> resume_817830_type9_a102e0_16
     (seventeenth type-9 a102e0 pack; first pack of the fourth seam
     group) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_16_817830 = 57,
  /* v34: host typed a102e0 @ 0x008186ad -> resume_817830_type9_a102e0_17
     (eighteenth type-9 a102e0 pack; second pack of the fourth seam
     group) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830 = 58,
  /* v35: host typed a102e0 @ 0x00818703 -> resume_817830_type9_a102e0_18
     (nineteenth type-9 a102e0 pack; third pack of the fourth seam
     group) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830 = 59,
  /* v35: host typed a102e0 @ 0x0081875c -> resume_817830_type9_a102e0_19
     (twentieth type-9 a102e0 pack; fourth pack of the fourth seam
     group; the a102e0_18 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830 = 60,
  /* v35: host typed a106e0 @ 0x008187a1 -> resume_817830_type9_a106e0_5
     (fifth type-9 a106e0 seam; starts the fifth seam group; the
     a102e0_19 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830 = 61,
  /* v36: host typed a102e0 @ 0x0081880c -> resume_817830_type9_a102e0_20
     (twenty-first type-9 a102e0 pack; first pack of the fifth seam
     group; the a106e0_5 resume now emits it instead of kind 30) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830 = 62,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830 = 63,
  /* v37: host typed a102e0 @ 0x008188b9 -> resume_817830_type9_a102e0_21
     (twenty-third type-9 a102e0 pack; third pack of the fifth seam
     group; the a102e0_21 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830 = 64,
  /* v38: host typed a102e0 @ 0x0081890f -> resume_817830_type9_a102e0_22
     (twenty-fourth type-9 a102e0 pack; fourth pack of the fifth seam
     group; the a102e0_22 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830 = 65,
  /* v39: host typed a106e0 @ 0x0081895a -> resume_817830_type9_a106e0_6
     (SIXTH type-9 a106e0 seam; starts the sixth seam group; the
     a102e0_23 resume now emits it -- pack-24 breaks the a102e0 chain:
     its continuation feeds an a106e0, not another a102e0) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830 = 66,
  /* v41: host typed a102e0 @ 0x00819720 -> resume_817830_type9_a102e0_24
     (twenty-fourth a102e0 pack of the type-10 run; first post-gate
     pack; the lroom_join_9394 fall-through now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830 = 67,
  /* v41: host typed a102e0 @ 0x00819773 -> resume_817830_type9_a102e0_25
     (twenty-fifth pack; the a102e0_24 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830 = 68,
  /* v41 remain: host typed a102e0 @ 0x008197c9 (twenty-sixth pack;
     still host; the a102e0_25 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830 = 69,
  /* v42: host typed a102e0 @ 0x00819818 -> resume_817830_type9_a102e0_27
     (twenty-seventh pack; fourth of the type-10 run; the a102e0_26
     resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830 = 70,
  /* v42 remain: host typed a106e0 @ 0x00819863 (SEVENTH a106e0 seam;
     still host; the a102e0_27 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830 = 71,
  /* v43: host typed a102e0 @ 0x008198ce -> resume_817830_type9_a102e0_28
     (twenty-eighth pack; the a106e0_7 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830 = 72,
  /* v43 remain: host typed a102e0 @ 0x00819928 (twenty-ninth pack;
     still host; the a102e0_28 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830 = 73,
  /* v44: host typed a102e0 @ 0x008199d1 -> resume_817830_type9_a102e0_30
     (thirtieth pack; the a102e0_29 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830 = 74,
  /* v44 remain: host typed a106e0 @ 0x00819a1c (EIGHTH a106e0 seam;
     still host; the a102e0_30 resume emits it -- pack-30's continuation
     feeds an a106e0: second chain break in the type-10 run) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830 = 75,
  /* v45: host typed a102e0 @ 0x00819a87 -> resume_817830_type9_a102e0_31
     (thirty-first pack; the a106e0_8 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830 = 76,
  /* v45 remain: host typed a102e0 @ 0x00819ade (thirty-second pack;
     still host; the a102e0_31 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830 = 77,
  /* v46: host typed a102e0 @ 0x00819b31 -> resume_817830_type9_a102e0_33
     (thirty-third pack; the a102e0_32 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830 = 78,
  /* v46 remain: host typed a102e0 @ 0x00819b84 (thirty-fourth pack;
     still host; the a102e0_33 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830 = 79,
  /* v47: host typed a106e0 @ 0x00819bcf -> resume_817830_type9_a106e0_9
     (NINTH a106e0 seam; the a102e0_34 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830 = 80,
  /* v47 remain: host typed a102e0 @ 0x00819c3d (thirty-fifth pack;
     still host; the a106e0_9 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830 = 81,
  /* v48: host typed a102e0 @ 0x00819c94 -> resume_817830_type9_a102e0_36
     (thirty-sixth pack; the a102e0_35 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830 = 82,
  /* v48 remain: host typed a102e0 @ 0x00819cea (thirty-seventh pack;
     still host; the a102e0_36 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830 = 83,
  /* v49: host typed a102e0 @ 0x00819d3d -> resume_817830_type9_a102e0_38
     (thirty-eighth pack; the a102e0_37 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830 = 84,
  /* v49 remain: host typed a106e0 @ 0x00819d7f (TENTH a106e0 seam;
     still host; the a102e0_38 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830 = 85,
  /* v50: host typed a102e0 @ 0x00819ded -> resume_817830_type9_a102e0_39
     (thirty-ninth pack; the a106e0_10 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830 = 86,
  /* v50 remain: host typed a102e0 @ 0x00819e47 (fortieth pack; still
     host; the a102e0_39 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830 = 87,
  /* v51: host typed a102e0 @ 0x00819e9d -> resume_817830_type9_a102e0_41
     (forty-first pack; the a102e0_40 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830 = 88,
  /* v51 remain: host typed a102e0 @ 0x00819ef3 (forty-second pack;
     still host; the a102e0_41 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830 = 89,
  /* v52: host typed a106e0 @ 0x00819f35 -> resume_817830_type9_a106e0_11
     (ELEVENTH a106e0 seam; the a102e0_42 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830 = 90,
  /* v52 remain: host typed a102e0 @ 0x00819fa0 (forty-third pack;
     still host; the a106e0_11 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830 = 91,
  /* v53: host typed a102e0 @ 0x00819ffa -> resume_817830_type9_a102e0_44
     (forty-fourth pack; the a102e0_43 resume now emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830 = 92,
  /* v53 remain: host typed a102e0 @ 0x0081a04d (forty-fifth pack;
     still host; the a102e0_44 resume emits it) */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830 = 93,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_46_817830 = 94,
  /* v55: TWELFTH a106e0 seam @ 0x0081a0ee -> resume_817830_type9_a106e0_12
     (pack-46's resume emits it -- second-to-last chain break). */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830 = 95,
  /* v55 remain: draw-band host station after the twelfth seam
     (call 0xa0f550 @ 0x0081a132; irreducible terminal; the
     a106e0_12 resume emits it). */
  ISAAC_GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830 = 96,
  /* v56: transform-chained packs 47-49; each resume emits the NEXT
     pack kind; pack-49 emits pack-50. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_47_817830 = 97,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830 = 98,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830 = 99,
  /* v57: transform-chained packs 50-52 @ 0x0081ad42/0x0081adbb/
     0x0081ae1c peeled (same chained law; pack-50's continuation folds
     the a11130/a112a0 host pair -- no typed recapture); each resume
     emits the NEXT pack kind; pack-52 emits pack-53. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830 = 100,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830 = 101,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830 = 102,
  /* v58: transform-chained packs 53-55 @ 0x0081aed3/0x0081af4c/
     0x0081afaa peeled (same chained law; pack-53's continuation folds
     the a11130/a112a0 host pair -- no typed recapture); each resume
     emits the NEXT pack kind; pack-55 emits parked pack-56. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830 = 103,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830 = 104,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830 = 105,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830 = 106,
  /* v59: transform-chained packs 56-58 @ 0x0081b005/0x0081b05e/
     0x0081b0d7 peeled (same chained law; pack-57's continuation folds
     the a11130/a112a0 host pair -- no typed recapture); each resume
     emits the NEXT pack kind; pack-58 emits parked pack-59. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830 = 107,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830 = 108,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830 = 109,
  /* v60: transform-chained packs 59-61 @ 0x0081b135/0x0081b193/
     0x0081b1ec peeled (same chained law; pack-61's continuation folds
     the a11130/a112a0 host pair -- no typed recapture); each resume
     emits the NEXT pack kind; pack-61 emits parked pack-62. Pair
     cadence: packs 50/53/57/61/65 -- one gap of 3 then every 4th. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830 = 110,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830 = 111,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830 = 112,
  /* v61: transform-chained packs 62-64 @ 0x0081b265/0x0081b2c6/
     0x0081b321 peeled (same chained law; all three continuations
     pure -- the next pair-continuation belongs to pack-65 per the
     every-4th cadence); each resume emits the NEXT pack kind;
     pack-64 emits parked pack-65. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830 = 113,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830 = 114,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830 = 115,
  /* v62: transform-chained packs 65-67 @ 0x0081b37d/0x0081b3f9/
     0x0081b457 peeled (same chained law; pack-65's continuation folds
     the a11130/a112a0 host pair -- no typed recapture; 66/67 pure);
     each resume emits the NEXT pack kind; pack-67 emits parked
     pack-68. Beyond the parked target, pack-69's continuation carries
     another pair PLUS the 0xa0f550 draw-band station and 0x67f310
     draws -- the cluster is entering its terminal draw-band stretch. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830 = 116,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830 = 117,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830 = 118,
  /* v63: transform-chained packs 68-70 @ 0x0081b4b2/0x0081b50b/
     0x0081c00c peeled (same chained law; pack-69's continuation folds
     the a11130/a112a0 host pair AND the a0f550 draw-band station plus
     a ~0xa00-byte pure draw-band stretch -- 0x67f310 draws with
     draw-result adders and a10dd0/a11060, all host-side, no typed
     recapture); each resume emits the NEXT pack kind; pack-70 emits
     parked pack-71 (the cluster's final three callsites follow:
     0x0081c067/0x0081c0c5 + terminal @ 0x0081c0ec). */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830 = 119,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830 = 120,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830 = 121,
  /* v64: transform-chained packs 71-73 @ 0x0081c067/0x0081c0c5/
     0x0081c11b peeled (same chained law; pure continuations EXCEPT
     pack-73, whose continuation folds the a11130/a112a0 pair; the
     adder @ 0x0081c0ec inside pack-72's continuation is typed, NOT
     terminal -- CENSUS CORRECTION: 37 further a102e0 callsites run
     beyond it to at least 0x0081d90f); each resume emits the NEXT
     pack kind; pack-73 emits parked pack-74. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830 = 122,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830 = 123,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830 = 124,
  /* v65: transform-chained packs 74-76 @ 0x0081c194/0x0081c1f5/
     0x0081c250 peeled (same chained law; all three continuations
     pure); each resume emits the NEXT pack kind; pack-76 emits
     parked pack-77. TRUE END BOUND (byte-pattern scan, supersedes
     all prior bounds): the cluster's LAST callsite is 0x0081d90f --
     zero further a102e0/a106e0 calls up to 0x00840000; the terminal
     continuation folds the a11130/a112a0 pair + a0f550 draw-band. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830 = 125,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830 = 126,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830 = 127,
  /* v66: transform-chained packs 77-79 @ 0x0081c2ac/0x0081c328/
     0x0081c386 peeled (same chained law; pack-77's continuation folds
     the a11130/a112a0 host pair -- no typed recapture; 78/79 pure;
     pack-78 has a benign shape deviation: mov esi,eax precedes the
     movss); each resume emits the NEXT pack kind; pack-79 emits
     parked pack-80. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830 = 128,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830 = 129,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830 = 130,
  /* v67: transform-chained packs 80-82 @ 0x0081c3e1/0x0081c43a/
     0x0081c4b6 peeled (same chained law; pack-81's continuation folds
     the a11130/a112a0 host pair -- no typed recapture; 80/82 pure);
     each resume emits the NEXT pack kind; pack-82 emits parked
     pack-83. Pair cadence holds: ...69/73/77/81 -- every 4th. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830 = 131,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830 = 132,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830 = 133,
  /* v68: transform-chained packs 83-85 @ 0x0081c514/0x0081c56f/
     0x0081c5c8 peeled (same chained law; 83/84 pure; pack-85's
     continuation folds the a11130/a112a0 host pair -- no typed
     recapture); each resume emits the NEXT pack kind; pack-85 emits
     parked pack-86. Pair cadence holds: ...73/77/81/85 -- every 4th. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830 = 134,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830 = 135,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830 = 136,
  /* v69: transform-chained packs 86-88 @ 0x0081c64a/0x0081c6a8/
     0x0081c706 peeled (same chained law; all three continuations
     pure -- the next pair-continuation belongs to pack-89 per the
     every-4th cadence); each resume emits the NEXT pack kind;
     pack-88 emits parked pack-89. */
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830 = 137,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830 = 138,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830 = 139,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830 = 140,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830 = 141,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830 = 142,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830 = 143,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830 = 144,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830 = 145,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830 = 146,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830 = 147,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830 = 148,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830 = 149,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830 = 150,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830 = 151,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830 = 152,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830 = 153,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830 = 154,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830 = 155,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830 = 156,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830 = 157,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830 = 158,
  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830 = 159
};

/* Host event kinds. Address-stable. Recovered from game-render-model.mjs. */
enum {
  ISAAC_GAME_RENDER_HOST_NONE = 0,
  ISAAC_GAME_RENDER_HOST_BOOST_74EFD0 = 1,
  ISAAC_GAME_RENDER_HOST_BOOST_827BC0 = 2,
  ISAAC_GAME_RENDER_HOST_COLOR_9956E0 = 3,
  ISAAC_GAME_RENDER_HOST_ENTITY_806C20 = 4,
  ISAAC_GAME_RENDER_HOST_GRID_80C810 = 5,
  ISAAC_GAME_RENDER_HOST_ANIM_40A030 = 6,
  ISAAC_GAME_RENDER_HOST_BODY_817830 = 7,
  ISAAC_GAME_RENDER_HOST_RT_POP = 8,
  ISAAC_GAME_RENDER_HOST_VT_408590_PAIR_A = 9,
  ISAAC_GAME_RENDER_HOST_VT_408590_PAIR_B = 10,
  ISAAC_GAME_RENDER_HOST_VT_40C550_ADDREF = 11,
  ISAAC_GAME_RENDER_HOST_VT_40C550_RELEASE = 12,
  ISAAC_GAME_RENDER_HOST_HOOK_C7163C = 13,
  ISAAC_GAME_RENDER_HOST_GETROOMBYIDX = 14,
  ISAAC_GAME_RENDER_HOST_ONCE_HEADER = 15,
  ISAAC_GAME_RENDER_HOST_ONCE_CTOR = 16,
  ISAAC_GAME_RENDER_HOST_ONCE_ATEXIT = 17,
  ISAAC_GAME_RENDER_HOST_ONCE_FOOTER = 18,
  ISAAC_GAME_RENDER_HOST_ALLOC = 19,
  ISAAC_GAME_RENDER_HOST_ASSERT_A112C0 = 20,
  ISAAC_GAME_RENDER_HOST_EPILOG_825DE0 = 21,
  ISAAC_GAME_RENDER_HOST_EPILOG_826AE0 = 22,
  ISAAC_GAME_RENDER_HOST_EPILOG_820FD0 = 23,
  ISAAC_GAME_RENDER_HOST_RT_REBIND = 24,
  ISAAC_GAME_RENDER_HOST_BIND_A1DFD0 = 25,
  ISAAC_GAME_RENDER_HOST_STAGE39_83A1B0 = 26,
  ISAAC_GAME_RENDER_HOST_TREE_ERASE_424540 = 27,
  ISAAC_GAME_RENDER_HOST_RT_POP_A19180 = 28,
  ISAAC_GAME_RENDER_HOST_GET_STAGE_ID_738470 = 29,
  ISAAC_GAME_RENDER_HOST_BODY_817830_TRUNK = 30,
  ISAAC_GAME_RENDER_HOST_BODY_817830_TAIL = 31,
  ISAAC_GAME_RENDER_HOST_GETLROOM_81F8B0 = 32,
  ISAAC_GAME_RENDER_HOST_A10690 = 33,
  ISAAC_GAME_RENDER_HOST_A102E0 = 34,
  ISAAC_GAME_RENDER_HOST_A106E0 = 35
};

enum {
  ISAAC_GAME_RENDER_VA_SHELL = 0x0080ea80,
  ISAAC_GAME_RENDER_VA_ENTITY_RENDER = 0x00806c20,
  ISAAC_GAME_RENDER_VA_GRID_DRAW = 0x0080c810,
  ISAAC_GAME_RENDER_VA_BODY_817830 = 0x00817830,
  ISAAC_GAME_RENDER_VA_GET_STAGE_ID = 0x00738470,
  ISAAC_GAME_RENDER_VA_COLOR_BIND = 0x009956e0,
  ISAAC_GAME_RENDER_VA_GETROOMBYIDX = 0x00740bc0,
  ISAAC_GAME_RENDER_VA_ROOMDESC_CTOR = 0x006ef590,
  ISAAC_GAME_RENDER_VA_BOOST_74EFD0 = 0x0074efd0,
  ISAAC_GAME_RENDER_VA_BOOST_827BC0 = 0x00827bc0,
  ISAAC_GAME_RENDER_VA_STAGE39_83A1B0 = 0x0083a1b0,
  ISAAC_GAME_RENDER_VA_TREE_ERASE_424540 = 0x00424540,
  ISAAC_GAME_RENDER_VA_BIND_A1DFD0 = 0x00a1dfd0,
  ISAAC_GAME_RENDER_VA_EPILOG_825DE0 = 0x00825de0,
  ISAAC_GAME_RENDER_VA_EPILOG_826AE0 = 0x00826ae0,
  ISAAC_GAME_RENDER_VA_EPILOG_820FD0 = 0x00820fd0,
  ISAAC_GAME_RENDER_VA_RT_A19180 = 0x00a19180,
  ISAAC_GAME_RENDER_VA_RT_A18300 = 0x00a18300,
  ISAAC_GAME_RENDER_VA_RT_684F30 = 0x00684f30,
  ISAAC_GAME_RENDER_VA_ANIM_40A030 = 0x0040a030,
  ISAAC_GAME_RENDER_VA_ASSERT_A112C0 = 0x00a112c0,
  ISAAC_GAME_RENDER_VA_RT_EMPTY_MSG = 0x00b655e4,
  ISAAC_GAME_RENDER_VA_RT_EMPTY_MSG_ARG = 0x10,
  ISAAC_GAME_RENDER_VA_OVERLAY_CLAMP = 0x00c7b640,
  ISAAC_GAME_RENDER_VA_RT_MANAGER_C798E0 = 0x00c798e0,
  ISAAC_GAME_RENDER_VA_BODY_817830_LROOM = 0x00817b53,
  ISAAC_GAME_RENDER_VA_BODY_817830_OTHER = 0x0081d20a,
  ISAAC_GAME_RENDER_VA_BODY_817830_EXIT = 0x0081def9,
  ISAAC_GAME_RENDER_VA_SHADER_NAME = 0x00b1a5b0,
  ISAAC_GAME_RENDER_817830_KAGE_HASH = 0xb3d14323,
  ISAAC_GAME_RENDER_VA_BODY_817830_PACK = 0x00817b58,
  ISAAC_GAME_RENDER_VA_GETLROOM = 0x0081f8b0,
  ISAAC_GAME_RENDER_VA_A10690 = 0x00a10690,
  ISAAC_GAME_RENDER_VA_A0F550 = 0x00a0f550,
  ISAAC_GAME_RENDER_VA_A10C00 = 0x00a10c00,
  ISAAC_GAME_RENDER_VA_TYPE9_A10690 = 0x00817c3d,
  ISAAC_GAME_RENDER_VA_TYPE9_A10690_NEXT = 0x00817ccc,
  ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL2 = 0x00817d5c,
  ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL3 = 0x00817de0,
  ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL4 = 0x00817e78,
  ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL5 = 0x00817f06,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_CELL6 = 0x00817f74,
  ISAAC_GAME_RENDER_VA_A102E0 = 0x00a102e0,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_NEXT = 0x00817fcd,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_1 = 0x00818023,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_2 = 0x00818072,
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0 = 0x008180b4,
  ISAAC_GAME_RENDER_VA_A106E0 = 0x00a106e0,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_3 = 0x00818122,
  /* v19: sixth type-9 a102e0 host callsite (peeled). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_4 = 0x0081817c,
  /* v20: seventh type-9 a102e0 host callsite (peeled). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_5 = 0x008181d2,
  /* v21: eighth type-9 a102e0 host callsite (peeled). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_6 = 0x00818228,
  /* v22: second type-9 a106e0 host callsite (peeled). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_2 = 0x00818273,
  /* v23: ninth type-9 a102e0 host callsite (peeled). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_7 = 0x008182de,
  /* v24: tenth type-9 a102e0 host callsite (peeled). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_8 = 0x00818338,
  /* v25: eleventh type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_9 = 0x0081838b,
  /* v26: twelfth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_10 = 0x008183e7,
  /* v27: third type-9 a106e0 host callsite (peeled; typed HOST_A106E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_3 = 0x0081842c,
  /* v28: thirteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_11 = 0x00818497,
  /* v29: fourteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_12 = 0x008184ee,
  /* v30: fifteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_13 = 0x00818547,
  /* v31: sixteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_14 = 0x0081859a,
  /* v32: fourth type-9 a106e0 seam host callsite (peeled; typed
     HOST_A106E0; closes the third a106e0 seam group). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_4 = 0x008185e8,
  /* v33: seventeenth type-9 a102e0 host callsite, first pack of the
     fourth seam group (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16 = 0x00818656,
  /* v34: eighteenth type-9 a102e0 host callsite, second pack of the
     fourth seam group (peeled; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_17 = 0x008186ad,
  /* v35: nineteenth type-9 a102e0 host callsite, third pack of the
     fourth seam group (peeled since v35; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_18 = 0x00818703,
  /* v35: twentieth type-9 a102e0 host callsite, fourth pack of the
     fourth seam group (peeled since v35; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_19 = 0x0081875c,
  /* v35: fifth type-9 a106e0 seam host callsite, starts the fifth
     seam group (peeled; typed HOST_A106E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_5 = 0x008187a1,
  /* v35/v36: twenty-first type-9 a102e0 host callsite, first pack of
     the fifth seam group (peeled since v36; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_20 = 0x0081880c,
  /* v36/v37: twenty-second type-9 a102e0 host callsite, second pack of
     the fifth seam group (peeled since v37; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_21 = 0x00818866,
  /* v37/v38: twenty-third type-9 a102e0 host callsite, third pack of
     the fifth seam group (peeled since v38; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_22 = 0x008188b9,
  /* v38/v39: twenty-fourth type-9 a102e0 host callsite, fourth pack
     of the fifth seam group (peeled since v39; typed HOST_A102E0; its
     continuation feeds an a106e0 -- the chain leaves the a102e0 class
     here). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_23 = 0x0081890f,
  /* v39 remain: SIXTH type-9 a106e0 seam host callsite (still host;
     the a102e0_23 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_6 = 0x0081895a,
  /* v39/v41 census: the sixth-seam body past its a106e0 edge is a LONG
     host draw chain (dest-copy cluster + byte-gate widen [esp+0x140]=1,
     0xa0f550 alloc, repeated 0x67f310 draws with float position glue)
     into the type-10 pack run from 0x00819720 -- ALL HOST except the
     ONE gate below and the two packs peeled since v41. */
  ISAAC_GAME_RENDER_VA_LROOM_GATE_9394 = 0x00819394,
  ISAAC_GAME_RENDER_VA_LROOM_GATE_JNE_9398 = 0x00819398,
  /* v39/v41: the gate's fall-through first pack of the post-gate
     a102e0 run (peeled since v41; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE10_FIRST_PACK_9720 = 0x00819720,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_44 = 0x00819ffa,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_45 = 0x0081a04d,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_46 = 0x0081a0a3,
  /* v37: twenty-fifth type-9 a102e0 host callsite, second pack of the
     type-10 run (peeled since v41; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_25 = 0x00819773,
  /* v41/v42: twenty-sixth type-9 a102e0 host callsite, third pack of
     the type-10 run (peeled since v42; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_26 = 0x008197c9,
  /* v42 remain: twenty-seventh type-9 a102e0 host callsite, fourth
     pack of the type-10 run (still host; the a102e0_26 resume emits
     it; ITS continuation feeds the a106e0 @ 0x00819863 -- chain leaves
     the a102e0 class there). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_27 = 0x00819818,
  /* v42/v43: twenty-seventh... SEVENTH a106e0 seam host callsite
     (peeled since v43; typed HOST_A106E0; its body is the dest-copy +
     byte-gate widen class per the sixth-seam precedent). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_7 = 0x00819863,
  /* v43 remain: twenty-eighth type-9 a102e0 host callsite (still host;
     the a106e0_7 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_28 = 0x008198ce,
  /* v43/v44: twenty-ninth type-9 a102e0 host callsite (peeled since
     v44; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_29 = 0x00819928,
  /* v44: thirtieth type-9 a102e0 host callsite (peeled since v44;
     typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_30 = 0x008199d1,
  /* v44/v45: EIGHTH a106e0 seam host callsite (peeled since v45;
     typed HOST_A106E0; dest-copy cluster class). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_8 = 0x00819a1c,
  /* v45 remain: thirty-first type-9 a102e0 host callsite (still host;
     the a106e0_8 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_31 = 0x00819a87,
  /* v45/v46: thirty-second type-9 a102e0 host callsite (peeled since
     v46; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_32 = 0x00819ade,
  /* v46 remain: thirty-third type-9 a102e0 host callsite (still host;
     the a102e0_32 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_33 = 0x00819b31,
  /* v46/v47: thirty-fourth type-9 a102e0 host callsite (peeled since
     v47; typed HOST_A102E0; CHAIN BREAK -- its continuation feeds an
     a106e0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_34 = 0x00819b84,
  /* v47 remain: NINTH a106e0 seam host callsite (still host; the
     a102e0_34 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_9 = 0x00819bcf,
  /* v47/v48: thirty-fifth type-9 a102e0 host callsite (peeled since
     v48; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_35 = 0x00819c3d,
  /* v48 remain: thirty-sixth type-9 a102e0 host callsite (still host;
     the a102e0_35 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_36 = 0x00819c94,
  /* v48/v49: thirty-seventh type-9 a102e0 host callsite (peeled since
     v49; typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_37 = 0x00819cea,
  /* v49 remain: thirty-eighth type-9 a102e0 host callsite (still host;
     the a102e0_37 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_38 = 0x00819d3d,
  /* v49/v50: TENTH a106e0 seam host callsite (peeled since v50; typed
     HOST_A106E0; dest-copy cluster class). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_10 = 0x00819d7f,
  /* v50 remain: thirty-ninth type-9 a102e0 host callsite (still host;
     the a106e0_10 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_39 = 0x00819ded,
  /* v50/v51: fortieth type-9 a102e0 host callsite (peeled since v51;
     typed HOST_A102E0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_40 = 0x00819e47,
  /* v51 remain: forty-first type-9 a102e0 host callsite (still host;
     the a102e0_40 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_41 = 0x00819e9d,
  /* v51/v52: forty-second type-9 a102e0 host callsite (peeled since
     v52; typed HOST_A102E0; CHAIN BREAK -- its continuation feeds an
     a106e0). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_42 = 0x00819ef3,
  /* v52 remain: ELEVENTH a106e0 seam host callsite (still host; the
     a102e0_42 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_11 = 0x00819f35,
  /* v55: TWELFTH a106e0 seam host callsite (peeled; dest-copy cluster
     class, gate-only recapture; pack-46 chain-breaks into it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A106E0_12 = 0x0081a0ee,
  /* v55 remain: draw-band host callsite after the twelfth seam
     (call 0xa0f550 @ 0x0081a132; irreducible terminal, stays host). */
  ISAAC_GAME_RENDER_VA_HOST_A0F550_CALLSITE = 0x0081a132,
  /* v56/v57: SECOND a102e0 cluster (transform-chained class): packs
     47-50 @ 0x0081ac33/0x0081ac8e/0x0081acec/0x0081ad42 peeled.
     Chaining: setter 0xa0fe90 (S->xy=(xmm1,xmm2), ret S) + adder
     0xa10420 (Q->xy = S->xy + this->xy, ret Q) are PURE; results
     feed the next pack this via mov ecx,eax. */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_47 = 0x0081ac33,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_48 = 0x0081ac8e,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_49 = 0x0081acec,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_50 = 0x0081ad42,
  /* v57/v58: transform-chained packs 51-55 peeled (same chained law;
     packs 50 and 53 fold the a11130/a112a0 host pair in their
     continuations -- no typed recapture); pack-56 @ 0x0081b005
     remains host (parked target of pack-55). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_51 = 0x0081adbb,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_52 = 0x0081ae1c,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_53 = 0x0081aed3,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_54 = 0x0081af4c,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_55 = 0x0081afaa,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_56 = 0x0081b005,
  /* v59: transform-chained packs 57-58 peeled (same chained law;
     pack-57's continuation folds the a11130/a112a0 host pair --
     no typed recapture); pack-59 @ 0x0081b135 remains host (parked
     target of pack-58). Pair cadence correction: pair-carrying
     continuations are packs 50/53/57/61 -- gaps 3/4/4,
     data-dependent, NOT every-third. */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_57 = 0x0081b05e,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_58 = 0x0081b0d7,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_59 = 0x0081b135,
  /* v60: transform-chained packs 60-61 peeled (same chained law;
     pack-61's continuation folds the a11130/a112a0 host pair -- no
     typed recapture); pack-62 @ 0x0081b265 remains host (parked
     target of pack-61). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_60 = 0x0081b193,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_61 = 0x0081b1ec,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_62 = 0x0081b265,
  /* v61: transform-chained packs 63-64 peeled (pure continuations;
     pack-65 @ 0x0081b37d remains host (parked target of pack-64);
     pack-65's continuation carries the a11130/a112a0 pair). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_63 = 0x0081b2c6,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_64 = 0x0081b321,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_65 = 0x0081b37d,
  /* v62: transform-chained packs 66-67 peeled (pure continuations);
     pack-68 @ 0x0081b4b2 remains host (parked target of pack-67). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_66 = 0x0081b3f9,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_67 = 0x0081b457,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_68 = 0x0081b4b2,
  /* v63: transform-chained packs 69-70 peeled (pack-69 folds pair +
     draw-band stretch; pack-70 pure); pack-71 @ 0x0081c067 remains
     host (parked target of pack-70). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_69 = 0x0081b50b,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_70 = 0x0081c00c,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_71 = 0x0081c067,
  /* v64: transform-chained packs 72-73 peeled (pack-73 folds the
     a11130/a112a0 pair); pack-74 @ 0x0081c194 remains host (parked
     target of pack-73). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_72 = 0x0081c0c5,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_73 = 0x0081c11b,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_74 = 0x0081c194,
  /* v65: transform-chained packs 75-76 peeled (pure continuations);
     pack-77 @ 0x0081c2ac remains host (parked target of pack-76). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_75 = 0x0081c1f5,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_76 = 0x0081c250,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_77 = 0x0081c2ac,
  /* v66: transform-chained packs 78-79 peeled (pure continuations);
     pack-80 @ 0x0081c3e1 remains host (parked target of pack-79). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_78 = 0x0081c328,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_79 = 0x0081c386,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_80 = 0x0081c3e1,
  /* v67: transform-chained packs 81-82 peeled (pack-81 folds the
     a11130/a112a0 pair); pack-83 @ 0x0081c514 remains host (parked
     target of pack-82). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_81 = 0x0081c43a,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_82 = 0x0081c4b6,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_83 = 0x0081c514,
  /* v68: transform-chained packs 84-85 peeled (pure continuations);
     pack-86 @ 0x0081c64a remains host (parked target of pack-85). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_84 = 0x0081c56f,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_85 = 0x0081c5c8,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_86 = 0x0081c64a,
  /* v69: transform-chained packs 87-88 peeled (pure continuations);
     pack-89 @ 0x0081c75f remains host (parked target of pack-88;
     its continuation carries the a11130/a112a0 pair). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_87 = 0x0081c6a8,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_88 = 0x0081c706,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_89 = 0x0081c75f,
  /* v52 remain: forty-third type-9 a102e0 host callsite (still host;
     the a106e0_11 resume emits it). */
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_43 = 0x00819fa0,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_90 = 0x81c7de,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_91 = 0x81c83f,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_92 = 0x81c89a,
  /* v73 terminal: pack-109's draw-band station instance */
  ISAAC_GAME_RENDER_VA_HOST_A0F550_TERMINAL_109 = 0x0081dab9,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_93 = 0x81c8f6,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_94 = 0x81d377,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_95 = 0x81d3d2,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_96 = 0x81d430,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_97 = 0x81d486,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_98 = 0x81d4f5,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_99 = 0x81d556,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_100 = 0x81d5b1,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_101 = 0x81d60d,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_102 = 0x81d67c,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_103 = 0x81d6da,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_104 = 0x81d735,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_105 = 0x81d78e,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_106 = 0x81d7fd,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_107 = 0x81d85b,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_108 = 0x81d8b6,
  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_109 = 0x81d90f,
  ISAAC_GAME_RENDER_VA_LROOM_JOIN_A975 = 0x0081a975,
  ISAAC_GAME_RENDER_VA_LROOM_JOIN_9394 = 0x00819394,
  ISAAC_GAME_RENDER_LROOM_QUAD_COUNT = 0x0c,
  ISAAC_GAME_RENDER_LROOM_QUAD_STRIDE = 0x24,
  ISAAC_GAME_RENDER_LROOM_PAIR_COUNT = 6,
  ISAAC_GAME_RENDER_LROOM_PAIR_STRIDE = 0x70,
  ISAAC_GAME_RENDER_RECV_STAGE39 = 0x776c,
  ISAAC_GAME_RENDER_RECV_COLOR_BIND = 0x1618,
  ISAAC_GAME_RENDER_RECV_TREE = 0x7308,
  ISAAC_GAME_RENDER_RECV_ANIM_A = 0x6e70,
  ISAAC_GAME_RENDER_RECV_ANIM_B = 0x6e90,
  ISAAC_GAME_RENDER_VA_OVERRIDE_PACK = 0x00babf20,
  ISAAC_GAME_RENDER_OVERRIDE_R_BITS = 0x00000000,
  ISAAC_GAME_RENDER_OVERRIDE_G_BITS = 0x00000000,
  ISAAC_GAME_RENDER_OVERRIDE_B_BITS = 0x00000000,
  ISAAC_GAME_RENDER_OVERRIDE_W3_BITS = 0x3f800000,
  ISAAC_GAME_RENDER_C79904_BIT_CLEAR_VALUE = 6,
  ISAAC_GAME_RENDER_C79904_BIT_SET_VALUE = 1,
  ISAAC_GAME_RENDER_C798E4_TEST_BIT = 0x04
};

typedef struct IsaacGameRenderSliceState {
  uint32_t game_mode;
  uint32_t grid_w;
  uint32_t grid_h;
  uint32_t flag_11f6;
  uint32_t camera_base_x_bits;
  uint32_t camera_base_y_bits;
  uint32_t entity_array_entry;
  uint32_t entity_count_entry;
  uint32_t fade_src_r_bits;
  uint32_t fade_src_g_bits;
  uint32_t fade_src_b_bits;
  uint32_t fade_src_a_bits;
  uint32_t fade_word_1b6c;
  uint32_t fade_dst_r_bits;
  uint32_t fade_dst_g_bits;
  uint32_t fade_dst_b_bits;
  uint32_t fade_dst_a_bits;
  uint32_t stage_1d18;
  uint32_t overlay_swap_flag;
  uint32_t overlay_scale_x_bits;
  uint32_t overlay_scale_y_bits;
  uint32_t overlay_draw_flag;
  uint32_t tree_head_7308;
  uint32_t tree_count_730c;
  uint32_t tree_cleared;
  uint32_t overlay_written;
  uint32_t flag_cleared;
} IsaacGameRenderSliceState;

typedef struct IsaacGameRenderSliceRuntimeInputs {
  uint32_t option_2a3c3;
  uint32_t option_2a3c5;
  uint32_t mgr_word0;
  uint32_t mgr_word1;
  uint32_t mgr_fade_26518_bits;
  uint32_t mgr_fade_2651c_bits;
  uint32_t mgr_26550;
  uint32_t mgr_word_0c;
  uint32_t mgr1830c;
  uint32_t mgr_67734_bits;
  uint32_t mgr_cam_x_2650c_bits;
  uint32_t mgr_cam_y_26510_bits;
  uint32_t dat_c798e4;
  uint32_t dat_c379b8_snap;
  uint32_t dat_c379b8_now;
  uint32_t c379b8_byte4;
  uint32_t dat_c78dc4_bits;
  uint32_t dat_c78edc_bits;
  uint32_t dat_c3793c_bits;
  uint32_t dat_c37940_bits;
  uint32_t dat_c79790;
  uint32_t dat_c7978c;
  uint32_t dat_c7977d;
  uint32_t dat_c71678;
  uint32_t dat_c33910;
  uint32_t dat_c7b640_bits;
  uint32_t dat_c7b644_bits;
  uint32_t dat_c7163c;
  uint32_t dat_c8108c;
  uint32_t tls_once_epoch;
  uint32_t present_38;
  uint32_t present_39;
  uint32_t present_3a;
  uint32_t present_3b;
  uint32_t present_3c;
  uint32_t present_3d;
  uint32_t present_3e;
  uint32_t present_3f;
  uint32_t present_40;
  uint32_t present_41;
  uint32_t present_42;
  uint32_t present_43;
  uint32_t present_44;
  uint32_t present_46;
  uint32_t present_4f;
  uint32_t mgr_word0_now;
  uint32_t mgr_word1_now;
  uint32_t mgr_mode_26584;
  uint32_t mgr_difficulty_269c8;
  uint32_t mgr_flags_2654c;
  uint32_t bitset_26548_lo;
  uint32_t bitset_2654c_hi;
  uint32_t room_desc;
  uint32_t room_desc_nested;
  uint32_t room_type_48;
  uint32_t room_width_c;
  uint32_t room_aabb_14_bits;
  uint32_t room_aabb_18_bits;
  uint32_t room_aabb_1c_bits;
  uint32_t room_aabb_20_bits;
  uint32_t mgr264f8;
  uint32_t dat_c379bc;
} IsaacGameRenderSliceRuntimeInputs;

typedef struct IsaacGameRenderSliceEvents {
  uint32_t continuation_kind;
  uint32_t host_kind;
  uint32_t host_va;
  uint32_t host_receiver;
  uint32_t host_vtable_slot;
  uint32_t host_arg0;
  uint32_t host_arg1;
  uint32_t host_repeat;
  uint32_t needs_recapture;
  uint32_t body_skipped;
  uint32_t entity_render_calls;
  uint32_t grid_draw_calls;
  uint32_t vtable_dispatch_calls;
  uint32_t alloc_calls;
  uint32_t sample_exhausted;
  uint32_t fade_local_r_bits;
  uint32_t fade_local_g_bits;
  uint32_t fade_local_b_bits;
  uint32_t fade_word50;
  uint32_t fade_base_bits;
  uint32_t fade_boost;
  uint32_t fade_force_full;
  uint32_t fade_t_bits;
  uint32_t fade_color_bits_r;
  uint32_t fade_color_bits_g;
  uint32_t fade_color_bits_b;
  uint32_t fade_color_bits_a;
  uint32_t camera_x_bits;
  uint32_t camera_y_bits;
  uint32_t g_c79904_value;
  uint32_t g_c79900_applied;
  uint32_t c379b8_next_value;
  uint32_t c379b8_store_applied;
  uint32_t tree_head;
  uint32_t tree_posts_applied;
  uint32_t grid_cell_count;
  uint32_t overlay_pos_x_bits;
  uint32_t overlay_pos_y_bits;
  uint32_t overlay_scale_x_bits;
  uint32_t overlay_scale_y_bits;
  uint32_t overlay_stores_applied;
  uint32_t overlay_first_off;
  uint32_t overlay_second_off;
  uint32_t rt_depth_after;
  uint32_t rt_base_cleared;
  uint32_t rt_assert_needed;
  uint32_t flag11f6_cleared;
  uint32_t poll_selects_one;
  uint32_t poll_a_bits;
  uint32_t poll_b_bits;
  uint32_t a14050_found;
  uint32_t tail_start_va;
  uint32_t tail_blend_398_bits;
  uint32_t tail_scale_28_bits;
  uint32_t tail_scale_18_bits;
  uint32_t tail_scale_80_bits;
  uint32_t lroom_next_va;
  uint32_t lroom_quad_inits;
  uint32_t lroom_pair_inits;
  uint32_t type9_cell0_half_a_bits;
  uint32_t type9_cell0_x_bits;
  uint32_t type9_cell0_y_bits;
  uint32_t type9_cell1_half_b_bits;
  uint32_t type9_cell1_sum_bits;
  uint32_t type9_cell1_y2_bits;
  uint32_t type9_cell2_x2_bits;
  uint32_t type9_cell2_y3_bits;
  uint32_t type9_cell2_sum2_bits;
  uint32_t type9_cell3_x3_bits;
  uint32_t type9_cell3_y4_bits;
  uint32_t type9_cell3_sum3_bits;
  uint32_t type9_cell4_dbl_bits;
  uint32_t type9_cell4_ac_bits;
  uint32_t type9_cell4_sum4_bits;
  uint32_t type9_cell4_y5_bits;
  uint32_t type9_cell5_dbl_bits;
  uint32_t type9_cell5_ac_bits;
  uint32_t type9_cell5_sum5_bits;
  uint32_t type9_cell5_y6_bits;
  uint32_t type9_cell6_x_bits;
  uint32_t type9_cell6_y_bits;
  uint32_t type9_cell6_angle_bits;
  uint32_t type9_a102e0_x_bits;
  uint32_t type9_a102e0_y_bits;
  uint32_t type9_a102e0_1_x_bits;
  uint32_t type9_a102e0_1_y_bits;
  uint32_t type9_a102e0_2_x_bits;
  uint32_t type9_a102e0_2_y_bits;
  uint32_t type9_a102e0_3_x_bits;
  uint32_t type9_a102e0_3_y_bits;
  uint32_t type9_a106e0_x_bits;
  uint32_t type9_a106e0_y_bits;
  uint32_t type9_a106e0_angle_bits;
  uint32_t type9_a102e0_4_x_bits;
  uint32_t type9_a102e0_4_y_bits;
  uint32_t type9_a102e0_5_x_bits;
  uint32_t type9_a102e0_5_y_bits;
  uint32_t type9_a102e0_6_x_bits;
  uint32_t type9_a102e0_6_y_bits;
  uint32_t type9_a102e0_7_x_bits;
  uint32_t type9_a102e0_7_y_bits;
  uint32_t type9_a106e0_2_x_bits;
  uint32_t type9_a106e0_2_y_bits;
  uint32_t type9_a106e0_2_angle_bits;
  uint32_t type9_a106e0_2_gate_bits;
  uint32_t type9_a102e0_8_x_bits;
  uint32_t type9_a102e0_8_y_bits;
  uint32_t type9_a102e0_9_x_bits;
  uint32_t type9_a102e0_9_y_bits;
  uint32_t type9_a102e0_10_x_bits;
  uint32_t type9_a102e0_10_y_bits;
  uint32_t type9_a102e0_11_x_bits;
  uint32_t type9_a102e0_11_y_bits;
  uint32_t type9_a106e0_3_x_bits;
  uint32_t type9_a106e0_3_y_bits;
  uint32_t type9_a106e0_3_angle_bits;
  uint32_t type9_a106e0_3_gate_bits;
  uint32_t type9_a102e0_12_x_bits;
  uint32_t type9_a102e0_12_y_bits;
  uint32_t type9_a102e0_13_x_bits;
  uint32_t type9_a102e0_13_y_bits;
  uint32_t type9_a102e0_14_x_bits;
  uint32_t type9_a102e0_14_y_bits;
  uint32_t type9_a102e0_15_x_bits;
  uint32_t type9_a102e0_15_y_bits;
  uint32_t type9_a106e0_4_x_bits;
  uint32_t type9_a106e0_4_y_bits;
  uint32_t type9_a106e0_4_angle_bits;
  uint32_t type9_a106e0_4_gate_bits;
  uint32_t type9_a102e0_16_x_bits;
  uint32_t type9_a102e0_16_y_bits;
  uint32_t type9_a102e0_17_x_bits;
  uint32_t type9_a102e0_17_y_bits;
  uint32_t type9_a102e0_18_x_bits;
  uint32_t type9_a102e0_18_y_bits;
  uint32_t type9_a102e0_19_x_bits;
  uint32_t type9_a102e0_19_y_bits;
  uint32_t type9_a102e0_20_x_bits;
  uint32_t type9_a102e0_20_y_bits;
  uint32_t type9_a102e0_21_x_bits;
  uint32_t type9_a102e0_21_y_bits;
  uint32_t type9_a102e0_22_x_bits;
  uint32_t type9_a102e0_22_y_bits;
  uint32_t type9_a102e0_23_x_bits;
  uint32_t type9_a102e0_23_y_bits;
  uint32_t type9_a102e0_24_x_bits;
  uint32_t type9_a102e0_24_y_bits;
  uint32_t type9_a102e0_25_x_bits;
  uint32_t type9_a102e0_25_y_bits;
  uint32_t type9_a102e0_26_x_bits;
  uint32_t type9_a102e0_26_y_bits;
  uint32_t type9_a102e0_27_x_bits;
  uint32_t type9_a102e0_27_y_bits;
  uint32_t type9_a106e0_7_x_bits;
  uint32_t type9_a106e0_7_y_bits;
  uint32_t type9_a106e0_7_angle_bits;
  uint32_t type9_a106e0_7_gate_bits;
  uint32_t type9_a102e0_28_x_bits;
  uint32_t type9_a102e0_28_y_bits;
  uint32_t type9_a102e0_29_x_bits;
  uint32_t type9_a102e0_29_y_bits;
  uint32_t type9_a102e0_30_x_bits;
  uint32_t type9_a102e0_30_y_bits;
  uint32_t type9_a106e0_8_x_bits;
  uint32_t type9_a106e0_8_y_bits;
  uint32_t type9_a106e0_8_angle_bits;
  uint32_t type9_a106e0_8_gate_bits;
  uint32_t type9_a102e0_31_x_bits;
  uint32_t type9_a102e0_31_y_bits;
  uint32_t type9_a102e0_32_x_bits;
  uint32_t type9_a102e0_32_y_bits;
  uint32_t type9_a102e0_33_x_bits;
  uint32_t type9_a102e0_33_y_bits;
  uint32_t type9_a102e0_34_x_bits;
  uint32_t type9_a102e0_34_y_bits;
  uint32_t type9_a106e0_9_x_bits;
  uint32_t type9_a106e0_9_y_bits;
  uint32_t type9_a106e0_9_angle_bits;
  uint32_t type9_a106e0_9_gate_bits;
  uint32_t type9_a102e0_35_x_bits;
  uint32_t type9_a102e0_35_y_bits;
  uint32_t type9_a102e0_36_x_bits;
  uint32_t type9_a102e0_36_y_bits;
  uint32_t type9_a102e0_37_x_bits;
  uint32_t type9_a102e0_37_y_bits;
  uint32_t type9_a102e0_38_x_bits;
  uint32_t type9_a102e0_38_y_bits;
  uint32_t type9_a106e0_10_x_bits;
  uint32_t type9_a106e0_10_y_bits;
  uint32_t type9_a106e0_10_angle_bits;
  uint32_t type9_a106e0_10_gate_bits;
  uint32_t type9_a102e0_39_x_bits;
  uint32_t type9_a102e0_39_y_bits;
  uint32_t type9_a102e0_40_x_bits;
  uint32_t type9_a102e0_40_y_bits;
  uint32_t type9_a102e0_41_x_bits;
  uint32_t type9_a102e0_41_y_bits;
  uint32_t type9_a102e0_42_x_bits;
  uint32_t type9_a102e0_42_y_bits;
  uint32_t type9_a106e0_11_x_bits;
  uint32_t type9_a106e0_11_y_bits;
  uint32_t type9_a106e0_11_angle_bits;
  uint32_t type9_a106e0_11_gate_bits;
  uint32_t type9_a102e0_43_x_bits;
  uint32_t type9_a102e0_43_y_bits;
  uint32_t type9_a102e0_44_x_bits;
  uint32_t type9_a102e0_44_y_bits;
  uint32_t type9_a102e0_45_x_bits;
  uint32_t type9_a102e0_45_y_bits;
  uint32_t type9_a102e0_46_x_bits;
  uint32_t type9_a102e0_46_y_bits;
  uint32_t type9_a106e0_5_x_bits;
  uint32_t type9_a106e0_5_y_bits;
  uint32_t type9_a106e0_5_angle_bits;
  uint32_t type9_a106e0_5_gate_bits;
  uint32_t type9_a106e0_12_gate_bits;
  uint32_t type9_a102e0_47_x_bits;
  uint32_t type9_a102e0_47_y_bits;
  uint32_t type9_a102e0_48_x_bits;
  uint32_t type9_a102e0_48_y_bits;
  uint32_t type9_a102e0_49_x_bits;
  uint32_t type9_a102e0_49_y_bits;
  uint32_t type9_a102e0_50_x_bits;
  uint32_t type9_a102e0_50_y_bits;
  uint32_t type9_a102e0_51_x_bits;
  uint32_t type9_a102e0_51_y_bits;
  uint32_t type9_a102e0_52_x_bits;
  uint32_t type9_a102e0_52_y_bits;
  uint32_t type9_a102e0_53_x_bits;
  uint32_t type9_a102e0_53_y_bits;
  uint32_t type9_a102e0_54_x_bits;
  uint32_t type9_a102e0_54_y_bits;
  uint32_t type9_a102e0_55_x_bits;
  uint32_t type9_a102e0_55_y_bits;
  uint32_t type9_a102e0_56_x_bits;
  uint32_t type9_a102e0_56_y_bits;
  uint32_t type9_a102e0_57_x_bits;
  uint32_t type9_a102e0_57_y_bits;
  uint32_t type9_a102e0_58_x_bits;
  uint32_t type9_a102e0_58_y_bits;
  uint32_t type9_a102e0_59_x_bits;
  uint32_t type9_a102e0_59_y_bits;
  uint32_t type9_a102e0_60_x_bits;
  uint32_t type9_a102e0_60_y_bits;
  uint32_t type9_a102e0_61_x_bits;
  uint32_t type9_a102e0_61_y_bits;
  uint32_t type9_a102e0_62_x_bits;
  uint32_t type9_a102e0_62_y_bits;
  uint32_t type9_a102e0_63_x_bits;
  uint32_t type9_a102e0_63_y_bits;
  uint32_t type9_a102e0_64_x_bits;
  uint32_t type9_a102e0_64_y_bits;
  uint32_t type9_a102e0_65_x_bits;
  uint32_t type9_a102e0_65_y_bits;
  uint32_t type9_a102e0_66_x_bits;
  uint32_t type9_a102e0_66_y_bits;
  uint32_t type9_a102e0_67_x_bits;
  uint32_t type9_a102e0_67_y_bits;
  uint32_t type9_a102e0_68_x_bits;
  uint32_t type9_a102e0_68_y_bits;
  uint32_t type9_a102e0_69_x_bits;
  uint32_t type9_a102e0_69_y_bits;
  uint32_t type9_a102e0_70_x_bits;
  uint32_t type9_a102e0_70_y_bits;
  uint32_t type9_a102e0_71_x_bits;
  uint32_t type9_a102e0_71_y_bits;
  uint32_t type9_a102e0_72_x_bits;
  uint32_t type9_a102e0_72_y_bits;
  uint32_t type9_a102e0_73_x_bits;
  uint32_t type9_a102e0_73_y_bits;
  uint32_t type9_a102e0_74_x_bits;
  uint32_t type9_a102e0_74_y_bits;
  uint32_t type9_a102e0_75_x_bits;
  uint32_t type9_a102e0_75_y_bits;
  uint32_t type9_a102e0_76_x_bits;
  uint32_t type9_a102e0_76_y_bits;
  uint32_t type9_a102e0_77_x_bits;
  uint32_t type9_a102e0_77_y_bits;
  uint32_t type9_a102e0_78_x_bits;
  uint32_t type9_a102e0_78_y_bits;
  uint32_t type9_a102e0_79_x_bits;
  uint32_t type9_a102e0_79_y_bits;
  uint32_t type9_a102e0_80_x_bits;
  uint32_t type9_a102e0_80_y_bits;
  uint32_t type9_a102e0_81_x_bits;
  uint32_t type9_a102e0_81_y_bits;
  uint32_t type9_a102e0_82_x_bits;
  uint32_t type9_a102e0_82_y_bits;
  uint32_t type9_a102e0_83_x_bits;
  uint32_t type9_a102e0_83_y_bits;
  uint32_t type9_a102e0_84_x_bits;
  uint32_t type9_a102e0_84_y_bits;
  uint32_t type9_a102e0_85_x_bits;
  uint32_t type9_a102e0_85_y_bits;
  uint32_t type9_a102e0_86_x_bits;
  uint32_t type9_a102e0_86_y_bits;
  uint32_t type9_a102e0_87_x_bits;
  uint32_t type9_a102e0_87_y_bits;
  uint32_t type9_a102e0_88_x_bits;
  uint32_t type9_a102e0_88_y_bits;
  uint32_t type9_a102e0_89_x_bits;
  uint32_t type9_a102e0_89_y_bits;
  uint32_t type9_a102e0_90_x_bits;
  uint32_t type9_a102e0_90_y_bits;
  uint32_t type9_a102e0_91_x_bits;
  uint32_t type9_a102e0_91_y_bits;
  uint32_t type9_a102e0_92_x_bits;
  uint32_t type9_a102e0_92_y_bits;
  uint32_t type9_a102e0_93_x_bits;
  uint32_t type9_a102e0_93_y_bits;
  uint32_t type9_a102e0_94_x_bits;
  uint32_t type9_a102e0_94_y_bits;
  uint32_t type9_a102e0_95_x_bits;
  uint32_t type9_a102e0_95_y_bits;
  uint32_t type9_a102e0_96_x_bits;
  uint32_t type9_a102e0_96_y_bits;
  uint32_t type9_a102e0_97_x_bits;
  uint32_t type9_a102e0_97_y_bits;
  uint32_t type9_a102e0_98_x_bits;
  uint32_t type9_a102e0_98_y_bits;
  uint32_t type9_a102e0_99_x_bits;
  uint32_t type9_a102e0_99_y_bits;
  uint32_t type9_a102e0_100_x_bits;
  uint32_t type9_a102e0_100_y_bits;
  uint32_t type9_a102e0_101_x_bits;
  uint32_t type9_a102e0_101_y_bits;
  uint32_t type9_a102e0_102_x_bits;
  uint32_t type9_a102e0_102_y_bits;
  uint32_t type9_a102e0_103_x_bits;
  uint32_t type9_a102e0_103_y_bits;
  uint32_t type9_a102e0_104_x_bits;
  uint32_t type9_a102e0_104_y_bits;
  uint32_t type9_a102e0_105_x_bits;
  uint32_t type9_a102e0_105_y_bits;
  uint32_t type9_a102e0_106_x_bits;
  uint32_t type9_a102e0_106_y_bits;
  uint32_t type9_a102e0_107_x_bits;
  uint32_t type9_a102e0_107_y_bits;
  uint32_t type9_a102e0_108_x_bits;
  uint32_t type9_a102e0_108_y_bits;
  uint32_t type9_a102e0_109_x_bits;
  uint32_t type9_a102e0_109_y_bits;
} IsaacGameRenderSliceEvents;

int32_t isaac_game_render_slice_capture(const uint8_t* game_object, size_t game_object_size, IsaacGameRenderSliceState* state);
int32_t isaac_game_render_slice_apply(const IsaacGameRenderSliceState* state, uint8_t* game_object, size_t game_object_size);
void isaac_game_render_slice_step(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_fade_prep(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t fade_1b5c_bits, uint32_t fade_1b60_bits, uint32_t fade_1b64_bits, uint32_t fade_1b68_bits, uint32_t fade_word_1b6c, uint32_t flags_g2, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_fade_stage(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, int32_t stage_1d18_after, uint32_t game_1204_bits, uint32_t game_1208_bits, uint32_t flags_g10, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_fade_polls(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, int32_t game_mode_ed55, IsaacGameRenderSliceEvents* events);
uint32_t isaac_game_render_slice_boost_74efd0_al(const IsaacGameRenderSliceRuntimeInputs* inputs);
int32_t isaac_game_render_slice_resume_boost_74efd0(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t mgr_1830c_after, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_boost_827bc0(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t al_827bc0, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_fade_close(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t fade_base_bits, uint32_t boost, uint32_t flags_g12, uint32_t local_r_bits, uint32_t local_g_bits, uint32_t local_b_bits, uint32_t dst_1b70_bits, uint32_t dst_1b74_bits, uint32_t dst_1b78_bits, uint32_t dst_1b7c_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_tree_erase(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t tree_head_7308, uint32_t head_right4, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_entity(const IsaacGameRenderSliceState* state, uint32_t entry_count, const uint32_t* base_seq, const uint32_t* count_seq, int32_t seq_len, uint32_t* out_slots, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_grid(const IsaacGameRenderSliceState* state, int32_t grid_w_after, int32_t grid_h_after, const uint32_t* slots, int32_t slots_len, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_overlay_gate(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, int32_t game_mode_ef08, int32_t room_type_10, uint32_t camera_x_bits, uint32_t camera_y_bits, uint32_t flag_6f49_after, uint32_t flag_6eb0_after, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_aux_gate(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_aux_polls(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_gate(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t stage_id_after, uint32_t slot_value_after, uint32_t room_word_54_after, uint32_t room_flags_44_after, uint32_t fade_7240_after, IsaacGameRenderSliceEvents* events);
uint32_t isaac_game_render_slice_817830_slot_offset(uint32_t stage);
int32_t isaac_game_render_slice_resume_817830_prefix(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t stage_id_after, uint32_t room_word_54_after, uint32_t room_flags_44_after, uint32_t fade_7240_after, uint32_t mgr_264f8_after, uint32_t tree_head_c379bc_after, uint32_t bound_isnil_after, uint32_t bound_key_after, uint32_t bound_ptr_after, uint32_t room_desc_type48_after, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_a14050_value(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t stage_id_after, uint32_t room_word_54_after, uint32_t room_flags_44_after, uint32_t fade_7240_after, uint32_t mgr_264f8_after, uint32_t room_desc_type48_after, uint32_t value_at_14_after, uint32_t byte_at_value_plus_4_after, IsaacGameRenderSliceEvents* events);
uint32_t isaac_game_render_slice_817830_kage_hash(void);
int32_t isaac_game_render_slice_resume_817830_lroom_pack(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t room_ptr_after, uint32_t nested_desc_ptr_after, uint32_t room_type48_after, uint32_t scale_a8_bits, uint32_t mul_005_bits, uint32_t mul_05_bits, uint32_t offset_c_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_cell1(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t scale_70_bits, uint32_t half_a_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_cell2(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t half_b_bits, uint32_t offset_ac_bits, uint32_t mul_05_bits, uint32_t half_a_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_cell3(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t scale_6c_bits, uint32_t offset_a8_bits, uint32_t y3_bits, uint32_t offset_ac_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_cell4(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_a8_bits, uint32_t scale_70_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_cell5(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t scale_6c_bits, uint32_t offset_10_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_cell6(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t half_a_94_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_0(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_1(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_2(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_3(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_14_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_9c_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_2(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_40_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_4(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_14_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_5(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_6(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_7(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_8(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_9(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_10(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_11(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_12(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_13(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_14(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_15(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_3(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_48_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_4(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_a8_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_16(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_17(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_18(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_19(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_20(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_21(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_22(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_23(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_24(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_25(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_26(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_27(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_7(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_48_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_29(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_30(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_8(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_40_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_31(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_32(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_33(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_34(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_9(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_9c_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_35(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_36(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_37(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_38(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_10(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_90_bits, uint32_t offset_8_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_40(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_41(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_42(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_11(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_30_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_12(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_47(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_48(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_49(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_50(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_51(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_52(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_53(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_54(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_55(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_56(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_57(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_58(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_43(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_44(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_45(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_46(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_39(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_28(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t mul_05_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_lroom_join_9394(const IsaacGameRenderSliceState* state, uint32_t room_type48_after, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_lroom_gate_type10_eq(uint32_t room_type48_after);
int32_t isaac_game_render_slice_resume_817830_type9_a106e0_5(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t offset_30_bits, uint32_t offset_c_bits, uint32_t scale_28_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_rt_pop_begin(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_rt_pop_check(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_rt_pop_final(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_epilog(const IsaacGameRenderSliceState* state, uint32_t flag11f6_after, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_epilog_final(const IsaacGameRenderSliceState* state, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_sprite_pair_a(uint32_t sprite_pre, uint32_t sprite_after, uint32_t sprite_b0, uint32_t sprite_b1, uint32_t layer_b0, uint32_t layer_b1, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_shared_ptr(const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t addref_result, uint32_t dest_ctrl_after, uint32_t release_result, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_room_type(const IsaacGameRenderSliceState* state, uint32_t game_ptr, int32_t room_idx, int32_t stage_entry, int32_t stage_after, uint32_t stage_type_4, int32_t desc_dword0, int32_t desc_field10_nz, int32_t field14, uint32_t* out_type, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_once_init(uint32_t guard_after, IsaacGameRenderSliceEvents* events);
uint32_t isaac_game_render_slice_abi_version(void);
uint32_t isaac_game_render_slice_state_size(void);
uint32_t isaac_game_render_slice_runtime_inputs_size(void);
uint32_t isaac_game_render_slice_events_size(void);
uint32_t isaac_game_render_slice_game_object_min_size(void);
uint32_t isaac_game_render_slice_root_va(void);
uint32_t isaac_game_render_slice_entity_render_va(void);
int32_t isaac_game_render_slice_host_is_vtable(uint32_t host_kind);
int32_t isaac_game_render_slice_continuation_needs_recapture(uint32_t cont);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_59(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_60(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_61(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_62(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_63(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_64(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_65(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_66(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_67(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_68(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_69(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_70(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_71(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_72(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_73(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_74(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_75(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_76(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_77(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_78(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_79(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_80(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_81(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_82(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_83(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_84(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_85(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_86(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_87(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_88(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_89(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_90(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_91(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_92(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_93(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_94(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_95(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_96(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_97(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_98(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_99(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_100(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_101(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_102(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_103(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_104(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_105(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_106(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_107(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_108(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);
int32_t isaac_game_render_slice_resume_817830_type9_a102e0_109(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);

#ifdef __cplusplus
}
#endif

