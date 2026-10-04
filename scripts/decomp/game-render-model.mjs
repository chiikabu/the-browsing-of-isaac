/**
 * Independent JavaScript oracle for the Game render root slice.
 * Composes render-shell pure helpers into one root entry over
 * FUN_0080ea80 with an explicit host-event ABI and typed continuations.
 *
 * Binary: tools/isaac-ng.unpacked.exe
 * SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
 *
 * ROOT SLICE ABI, NOT A PE-FREE RENDER. Not wired into the live frame
 * loop; no performance claim.
 */

import {
  renderShell408590PostAPlan,
  renderShell40c550ResumePlan,
  renderShell40c550HookNeeded,
  renderShell74f690ResolvePost,
  renderShell740bc0OnceInitResume,
  renderShell740bc0EmptyVa,
  renderShell6f9400Gate39,
  renderShell6f9400Mask,
  renderShell6f95a0Mask,
  renderShell74ea50EvalAlFromPresence,
  renderShell812d00Compute,
  renderShell817830LroomLoopStep,
  renderShell817830LroomQuadPost,
  renderShell817830LroomPairAdvance,
  renderShell817830RoomDescOpen,
  renderShell817830RoomTypeEq9,
  renderShell817830Type9Cell0,
  renderShell817830Type9Cell1,
  renderShellEntityLoopNeeded,
  renderShellEntityLoopRun,
  renderShellEntityLoopStep,
  renderShellFadeApplyBoost,
  renderShellFadeForceFullNeeded,
  renderShellFadeT,
  renderShellFadeLerpChannel,
  renderShellC379b8Next,
  renderShellMainBodyNeeded,
  renderShellRoomFlagsBit9,
  renderShellCameraOffset,
  renderShellFadeMgrWordsOr,
  renderShellStage39HostNeeded,
  renderShellNon39FadeBlockNeeded,
  renderShellFadePollSelectsOne,
  renderShellFadeBase,
  renderShellFadeBoostModeOpen,
  renderShellGridCellCount,
  renderShellGridLoopNeeded,
  renderShellGridSlotNeedsRender,
  renderShellStageOverlayDualOpen,
  renderShellStageOverlayHostOpen,
  renderShellStageOverlayScale,
  renderShellAf0917Floor,
  renderShellStageOverlayPreFloorX,
  renderShellStageOverlayPreFloorY,
  renderShellStageOverlayDrawPos,
  renderShellStageOverlayDrawPlan,
  renderShellStageOverlayAnimOffsets,
  renderShellOptionAuxOpen,
  renderShellManagerFadePollNeeded,
  renderShellAux817830Needed,
  renderShellRtPopDepthStep,
  renderShellFlag11f6Oneshot,
  RENDER_SHELL_408590_POST_A_PAIR_B,
  RENDER_SHELL_40C550_RESUME_RELEASE,
  RENDER_SHELL_GET_STAGE_ID_MODE_44,
  RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT,
  RENDER_SHELL_OVERLAY_PLAN_SKIP,
  RENDER_SHELL_408590_VT_PAIR_B_OFF,
  RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF,
} from "./render-shell-pure-model.mjs";

export const CONTINUE_AT_TYPE9_A102E0_90_817830 = 140;
export const TYPE9_A102E0_90_817830 = 140;

export const CONTINUE_AT_TYPE9_A102E0_91_817830 = 141;
export const TYPE9_A102E0_91_817830 = 141;

export const CONTINUE_AT_TYPE9_A102E0_92_817830 = 142;
export const TYPE9_A102E0_92_817830 = 142;

export const CONTINUE_AT_TYPE9_A102E0_93_817830 = 143;
export const TYPE9_A102E0_93_817830 = 143;

export const CONTINUE_AT_TYPE9_A102E0_94_817830 = 144;
export const TYPE9_A102E0_94_817830 = 144;

export const CONTINUE_AT_TYPE9_A102E0_95_817830 = 145;
export const TYPE9_A102E0_95_817830 = 145;

export const CONTINUE_AT_TYPE9_A102E0_96_817830 = 146;
export const TYPE9_A102E0_96_817830 = 146;

export const CONTINUE_AT_TYPE9_A102E0_97_817830 = 147;
export const TYPE9_A102E0_97_817830 = 147;

export const CONTINUE_AT_TYPE9_A102E0_98_817830 = 148;
export const TYPE9_A102E0_98_817830 = 148;

export const CONTINUE_AT_TYPE9_A102E0_99_817830 = 149;
export const TYPE9_A102E0_99_817830 = 149;

export const CONTINUE_AT_TYPE9_A102E0_100_817830 = 150;
export const TYPE9_A102E0_100_817830 = 150;

export const CONTINUE_AT_TYPE9_A102E0_101_817830 = 151;
export const TYPE9_A102E0_101_817830 = 151;

export const CONTINUE_AT_TYPE9_A102E0_102_817830 = 152;
export const TYPE9_A102E0_102_817830 = 152;

export const CONTINUE_AT_TYPE9_A102E0_103_817830 = 153;
export const TYPE9_A102E0_103_817830 = 153;

export const CONTINUE_AT_TYPE9_A102E0_104_817830 = 154;
export const TYPE9_A102E0_104_817830 = 154;

export const CONTINUE_AT_TYPE9_A102E0_105_817830 = 155;
export const TYPE9_A102E0_105_817830 = 155;

export const CONTINUE_AT_TYPE9_A102E0_106_817830 = 156;
export const TYPE9_A102E0_106_817830 = 156;

export const CONTINUE_AT_TYPE9_A102E0_107_817830 = 157;
export const TYPE9_A102E0_107_817830 = 157;

export const CONTINUE_AT_TYPE9_A102E0_108_817830 = 158;
export const TYPE9_A102E0_108_817830 = 158;

export const CONTINUE_AT_TYPE9_A102E0_109_817830 = 159;
export const TYPE9_A102E0_109_817830 = 159;

export const GAME_RENDER_SLICE_ABI_VERSION = 73; /* v69: transform-chained packs 86-88 peeled (a102e0_86 @ 0x0081c64a + a102e0_87 @ 0x0081c6a8 + a102e0_88 @ 0x0081c706, all pure continuations; pack-88 emits parked pack-89 @ 0x0081c75f whose continuation carries the a11130/a112a0 pair per the every-4th cadence); ALSO propagates the v68-era cpp conversion: a106e0_4 emits LROOM_REMAIN(30) and a102e0_12 lroomNextVa moves to A102E0_11 @ 0x00818497) */ /* v68: transform-chained packs 83-85 peeled (a102e0_83 @ 0x0081c514 + a102e0_84 @ 0x0081c56f + a102e0_85 @ 0x0081c5c8 folds the a11130/a112a0 pair; pack-85 emits parked pack-86 @ 0x0081c64a; pair cadence steady every-4th: ...77/81/85) */ /* v67: transform-chained packs 80-82 peeled (a102e0_80 @ 0x0081c3e1 + a102e0_81 @ 0x0081c43a folds the a11130/a112a0 pair + a102e0_82 @ 0x0081c4b6; pack-82 emits parked pack-83 @ 0x0081c514; pair cadence steady every-4th: ...73/77/81) */ /* v66: transform-chained packs 77-79 peeled (a102e0_77 @ 0x0081c2ac folds the a11130/a112a0 pair + a102e0_78 @ 0x0081c328 + a102e0_79 @ 0x0081c386; pack-79 emits parked pack-80 @ 0x0081c3e1; pair cadence steady every-4th since 53: 53/57/61/65/69/73/77) */ /* v65: transform-chained packs 74-76 peeled (a102e0_74 @ 0x0081c194 + a102e0_75 @ 0x0081c1f5 + a102e0_76 @ 0x0081c250, all pure continuations; pack-76 emits parked pack-77 @ 0x0081c2ac; TRUE END BOUND: last cluster callsite is 0x0081d90f -- zero further a102e0/a106e0 calls up to 0x00840000, terminal continuation folds pair + a0f550 draw-band) */ /* v64: transform-chained packs 71-73 peeled (a102e0_71 @ 0x0081c067 + a102e0_72 @ 0x0081c0c5 + a102e0_73 @ 0x0081c11b folds the a11130/a112a0 pair; pack-73 emits parked pack-74 @ 0x0081c194; CENSUS CORRECTION: the c0ec adder is NOT terminal -- 37 further callsites run to at least 0x0081d90f) */ /* v63: transform-chained packs 68-70 peeled (a102e0_68 @ 0x0081b4b2 + a102e0_69 @ 0x0081b50b folds pair AND a0f550 draw-band station + ~0xa00 pure draw-band stretch + a102e0_70 @ 0x0081c00c; pack-70 emits parked pack-71 @ 0x0081c067 -- cluster's final stretch) */ /* v62: transform-chained packs 65-67 peeled (a102e0_65 @ 0x0081b37d folds the a11130/a112a0 pair + a102e0_66 @ 0x0081b3f9 + a102e0_67 @ 0x0081b457; pack-67 emits parked pack-68 @ 0x0081b4b2; beyond it pack-69's continuation carries another pair PLUS the a0f550 draw-band station and 67f310 draws -- terminal draw-band stretch ahead) */ /* v61: transform-chained packs 62-64 peeled (a102e0_62 @ 0x0081b265 + a102e0_63 @ 0x0081b2c6 + a102e0_64 @ 0x0081b321; all pure continuations; pack-64 emits parked pack-65 @ 0x0081b37d whose continuation carries the a11130/a112a0 pair) */ /* v60: transform-chained packs 59-61 peeled (a102e0_59 @ 0x0081b135 + a102e0_60 @ 0x0081b193 + a102e0_61 @ 0x0081b1ec; pack-61 folds the a11130/a112a0 pair; pack-61 emits parked pack-62 @ 0x0081b265; pair cadence packs 50/53/57/61/65 -- one gap of 3 then every 4th) */ /* v59: transform-chained packs 56-58 peeled (a102e0_56 @ 0x0081b005 + a102e0_57 @ 0x0081b05e + a102e0_58 @ 0x0081b0d7; pack-58 emits parked pack-59 @ 0x0081b135; host-pair cadence correction: pairs in packs 50/53/57/61 continuations, gaps 3/4/4, data-dependent) */ /* v58: transform-chained packs 53-55 peeled (a102e0_53 @ 0x0081aed3 + a102e0_54 @ 0x0081af4c + a102e0_55 @ 0x0081afaa; pack-55 emits parked pack-56 @ 0x0081b005) */ /* v57: transform-chained packs 50-52 peeled (a102e0_50 @ 0x0081ad42 + a102e0_51 @ 0x0081adbb + a102e0_52 @ 0x0081ae1c; pack-52 emits parked pack-53 @ 0x0081aed3) */ /* v52: pack-42 @ 0x00819ef3 peeled (chain break to a106e0-11) + ELEVENTH a106e0 seam @ 0x00819f35 peeled */ /* v51: packs 40-41 peeled (a102e0_40 @ 0x00819e47 + a102e0_41 @ 0x00819e9d) */ /* v49: packs 37-38 peeled (a102e0_37 @ 0x00819cea + a102e0_38 @ 0x00819d3d; chain breaks to a106e0-10) */ /* v47: pack-34 @ 0x00819b84 peeled (chain break to a106e0-9) + a106e0-9 seam @ 0x00819bcf peeled */ /* v46: type-10 run packs 5-6 peeled (a102e0_32 @ 0x00819ade + a102e0_33 @ 0x00819b31) */ /* v45: a106e0-8 seam @ 0x00819a1c + a102e0_31 @ 0x00819a87 peeled */ /* v44: packs 29-30 peeled (a102e0_29 @ 0x00819928 + a102e0_30 @ 0x008199d1) */ /* v43: a106e0-7 seam @ 0x00819863 + a102e0_28 @ 0x008198ce peeled */ /* v42: type-10 run packs 3-4 peeled (a102e0_26 @ 0x008197c9 + a102e0_27 @ 0x00819818; chain breaks to a106e0_7) */ /* v40: LROOM join gate 0x00819394 peeled (type==10 full-dword eq; both arms land on pinned joins) */
export const GAME_RENDER_GAME_OBJECT_MIN_SIZE = 0x3bb20;
export const GAME_RENDER_ENTITY_MAX_STEPS = 64;
export const GAME_RENDER_GRID_MAX_STEPS = 512;

/* Continuation kinds (PE order). v2 removed AT_TOP_POLLS (results
   discarded, pure calls skipped), AT_74EA50 and AT_812D00 (bodies pure). */
export const GAME_RENDER_CONTINUE_DONE = 0;
export const GAME_RENDER_CONTINUE_AT_EPILOG_825DE0 = 1;
export const GAME_RENDER_CONTINUE_AT_RT_REBIND = 2;
export const GAME_RENDER_CONTINUE_AT_BIND_A1DFD0 = 3;
export const GAME_RENDER_CONTINUE_AT_STAGE39 = 4;
export const GAME_RENDER_CONTINUE_AT_FADE_POLLS = 5;
export const GAME_RENDER_CONTINUE_AT_BOOST_74EFD0 = 6;
export const GAME_RENDER_CONTINUE_AT_BOOST_827BC0 = 7;
export const GAME_RENDER_CONTINUE_AT_FADE_CLOSE = 8;
export const GAME_RENDER_CONTINUE_AT_COLOR_BIND = 9;
export const GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY = 10;
export const GAME_RENDER_CONTINUE_AT_TREE_ERASE = 11;
export const GAME_RENDER_CONTINUE_AT_ENTITY = 12;
export const GAME_RENDER_CONTINUE_AT_GRID_ENTRY = 13;
export const GAME_RENDER_CONTINUE_AT_GRID = 14;
export const GAME_RENDER_CONTINUE_AT_OVERLAY_GATE = 15;
export const GAME_RENDER_CONTINUE_AT_ANIM_RENDER = 16;
export const GAME_RENDER_CONTINUE_AT_AUX_GATE = 17;
export const GAME_RENDER_CONTINUE_AT_AUX_POLLS = 18;
export const GAME_RENDER_CONTINUE_AT_BODY_817830 = 19;
export const GAME_RENDER_CONTINUE_AT_RT_POP_A19180 = 20;
export const GAME_RENDER_CONTINUE_AT_RT_POP_RESTORE = 21;
export const GAME_RENDER_CONTINUE_AT_EPILOG_826AE0 = 22;
export const GAME_RENDER_CONTINUE_AT_EPILOG_820FD0 = 23;
export const GAME_RENDER_CONTINUE_NESTED = 24;
export const GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830 = 25;
export const GAME_RENDER_CONTINUE_AT_TRUNK_817830 = 26;
export const GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830 = 27;
export const GAME_RENDER_CONTINUE_AT_TAIL_817830 = 28;
export const GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830 = 29;
export const GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830 = 30;
export const GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830 = 31;
export const GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830 = 32;
export const GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830 = 33;
export const GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830 = 34;
export const GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830 = 35;
export const GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830 = 36;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830 = 37;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830 = 38;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830 = 39;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830 = 40;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830 = 41;
/* v18: host typed a102e0 @ 0x00818122 then fifth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830 = 42;
/* v19: host typed a102e0 @ 0x0081817c then sixth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830 = 43;
/* v20: host typed a102e0 @ 0x008181d2 then seventh a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830 = 44;
/* v21: host typed a102e0 @ 0x00818228 then eighth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830 = 45;
/* v22: host typed a106e0 @ 0x00818273 then second a106e0 seam. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830 = 46;
/* v23: host typed a102e0 @ 0x008182de then ninth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830 = 47;
/* v24: host typed a102e0 @ 0x00818338 then tenth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830 = 48;
/* v25: host typed a102e0 @ 0x0081838b then eleventh a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830 = 49;
/* v26: host typed a102e0 @ 0x008183e7 then twelfth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830 = 50;
/* v27: host typed a106e0 @ 0x0081842c then third a106e0 seam. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830 = 51;
/* v28: host typed a102e0 @ 0x00818497 then thirteenth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830 = 52;
/* v29: host typed a102e0 @ 0x008184ee then fourteenth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830 = 53;
/* v30: host typed a102e0 @ 0x00818547 then fifteenth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830 = 54;
/* v31: host typed a102e0 @ 0x0081859a then sixteenth a102e0 pack. */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830 = 55;
/* v32: host typed a106e0 @ 0x008185e8 then fourth a106e0 seam
   (closes the third a106e0 seam group). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830 = 56;
/* v33: host typed a102e0 @ 0x00818656 then seventeenth a102e0 pack
   (first pack of the fourth a106e0 seam group). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_16_817830 = 57;
/* v34: host typed a102e0 @ 0x008186ad then eighteenth a102e0 pack
   (second pack of the fourth a106e0 seam group). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830 = 58;
/* v35: host typed a102e0 @ 0x00818703 then nineteenth a102e0 pack
   (third pack of the fourth a106e0 seam group). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830 = 59;
/* v35: host typed a102e0 @ 0x0081875c then twentieth a102e0 pack
   (fourth pack of the fourth a106e0 seam group). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830 = 60;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830 = 62;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830 = 63;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830 = 64;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830 = 65;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830 = 66;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830 = 67;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830 = 68;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830 = 69;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830 = 70;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830 = 71;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830 = 72;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830 = 73;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830 = 74;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830 = 75;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830 = 76;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830 = 77;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830 = 78;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830 = 79;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830 = 80;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830 = 81;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830 = 82;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830 = 83;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830 = 84;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830 = 85;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830 = 86;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830 = 87;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830 = 88;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830 = 89;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830 = 90;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830 = 91;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830 = 92;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830 = 93;
export const TYPE9_A102E0_45_817830 = 93;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_46_817830 = 94;
export const TYPE9_A102E0_46_817830 = 94;
/* v55: TWELFTH a106e0 seam @ 0x0081a0ee (pack-46 chain-breaks into it). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830 = 95;
export const TYPE9_A106E0_12_817830 = 95;
/* v55 remain: draw-band host station (call 0xa0f550 @ 0x0081a132). */
export const GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830 = 96;
export const HOST_A0F550_817830 = 96;
/* v56/v57: transform-chained packs 47-52 (setter 0xa0fe90 + adder
   0xa10420 are pure; pack-53 @ 0x0081aed3 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_47_817830 = 97;
export const TYPE9_A102E0_47_817830 = 97;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830 = 98;
export const TYPE9_A102E0_48_817830 = 98;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830 = 99;
export const TYPE9_A102E0_49_817830 = 99;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830 = 100;
export const TYPE9_A102E0_50_817830 = 100;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830 = 101;
export const TYPE9_A102E0_51_817830 = 101;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830 = 102;
export const TYPE9_A102E0_52_817830 = 102;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830 = 103;
export const TYPE9_A102E0_53_817830 = 103;
/* v58: transform-chained packs 53-55 (pack-53 folds the a11130/a112a0
   host pair; pack-56 @ 0x0081b005 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830 = 104;
export const TYPE9_A102E0_54_817830 = 104;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830 = 105;
export const TYPE9_A102E0_55_817830 = 105;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830 = 106;
export const TYPE9_A102E0_56_817830 = 106;
/* v59: transform-chained packs 56-58 (pack-57 folds the a11130/a112a0
   host pair; pack-59 @ 0x0081b135 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830 = 107;
export const TYPE9_A102E0_57_817830 = 107;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830 = 108;
export const TYPE9_A102E0_58_817830 = 108;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830 = 109;
export const TYPE9_A102E0_59_817830 = 109;
/* v60: transform-chained packs 59-61 (pack-61 folds the a11130/a112a0
   host pair; pack-62 @ 0x0081b265 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830 = 110;
export const TYPE9_A102E0_60_817830 = 110;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830 = 111;
export const TYPE9_A102E0_61_817830 = 111;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830 = 112;
export const TYPE9_A102E0_62_817830 = 112;
/* v61: transform-chained packs 62-64 (all pure continuations; the
   next pair belongs to pack-65 per the every-4th cadence; pack-65
   @ 0x0081b37d parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830 = 113;
export const TYPE9_A102E0_63_817830 = 113;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830 = 114;
export const TYPE9_A102E0_64_817830 = 114;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830 = 115;
export const TYPE9_A102E0_65_817830 = 115;
/* v62: transform-chained packs 65-67 (pack-65 folds the a11130/a112a0
   host pair; 66/67 pure; pack-68 @ 0x0081b4b2 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830 = 116;
export const TYPE9_A102E0_66_817830 = 116;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830 = 117;
export const TYPE9_A102E0_67_817830 = 117;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830 = 118;
export const TYPE9_A102E0_68_817830 = 118;
/* v63: transform-chained packs 68-70 (pack-69 folds the a11130/a112a0
   pair AND the a0f550 draw-band station + ~0xa00-byte pure draw-band
   stretch; pack-71 @ 0x0081c067 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830 = 119;
export const TYPE9_A102E0_69_817830 = 119;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830 = 120;
export const TYPE9_A102E0_70_817830 = 120;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830 = 121;
export const TYPE9_A102E0_71_817830 = 121;
/* v64: transform-chained packs 71-73 (pure continuations EXCEPT
   pack-73, which folds the a11130/a112a0 pair; the c0ec adder inside
   pack-72's continuation is typed NOT terminal -- 37 further
   callsites run beyond it to at least 0x0081d90f; pack-74 @
   0x0081c194 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830 = 122;
export const TYPE9_A102E0_72_817830 = 122;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830 = 123;
export const TYPE9_A102E0_73_817830 = 123;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830 = 124;
export const TYPE9_A102E0_74_817830 = 124;
/* v65: transform-chained packs 74-76 (all pure continuations;
   TRUE END BOUND: last cluster callsite is 0x0081d90f, zero further
   a102e0/a106e0 calls up to 0x00840000; pack-77 @ 0x0081c2ac
   parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830 = 125;
export const TYPE9_A102E0_75_817830 = 125;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830 = 126;
export const TYPE9_A102E0_76_817830 = 126;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830 = 127;
export const TYPE9_A102E0_77_817830 = 127;
/* v66: transform-chained packs 77-79 (pack-77 folds the a11130/a112a0
   host pair; 78/79 pure; pack-80 @ 0x0081c3e1 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830 = 128;
export const TYPE9_A102E0_78_817830 = 128;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830 = 129;
export const TYPE9_A102E0_79_817830 = 129;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830 = 130;
export const TYPE9_A102E0_80_817830 = 130;
/* v67: transform-chained packs 80-82 (pack-81 folds the a11130/a112a0
   host pair; 80/82 pure; pack-83 @ 0x0081c514 parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830 = 131;
export const TYPE9_A102E0_81_817830 = 131;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830 = 132;
export const TYPE9_A102E0_82_817830 = 132;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830 = 133;
export const TYPE9_A102E0_83_817830 = 133;
/* v68: transform-chained packs 83-85 (83/84 pure; pack-85 folds the
   a11130/a112a0 host pair; pack-86 @ 0x0081c64a parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830 = 134;
export const TYPE9_A102E0_84_817830 = 134;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830 = 135;
export const TYPE9_A102E0_85_817830 = 135;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830 = 136;
export const TYPE9_A102E0_86_817830 = 136;
/* v69: transform-chained packs 86-88 (all pure continuations; the
   next pair belongs to pack-89 per the every-4th cadence; pack-89 @
   0x0081c75f parked). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830 = 137;
export const TYPE9_A102E0_87_817830 = 137;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830 = 138;
export const TYPE9_A102E0_88_817830 = 138;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830 = 139;
export const TYPE9_A102E0_89_817830 = 139;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830 = 140;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830 = 141;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830 = 142;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830 = 143;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830 = 144;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830 = 145;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830 = 146;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830 = 147;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830 = 148;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830 = 149;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830 = 150;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830 = 151;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830 = 152;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830 = 153;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830 = 154;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830 = 155;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830 = 156;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830 = 157;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830 = 158;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830 = 159;
export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_110_817830 = 160;
export const TYPE9_A102E0_110_817830 = 160;
export const TYPE9_A102E0_44_817830 = 92;
/* v35: host typed a106e0 @ 0x008187a1 then fifth a106e0 seam (starts
   the fifth a106e0 seam group). */
export const GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830 = 61;

export const GAME_RENDER_HOST_NONE = 0;
export const GAME_RENDER_HOST_BOOST_74EFD0 = 1;
export const GAME_RENDER_HOST_BOOST_827BC0 = 2;
export const GAME_RENDER_HOST_COLOR_9956E0 = 3;
export const GAME_RENDER_HOST_ENTITY_806C20 = 4;
export const GAME_RENDER_HOST_GRID_80C810 = 5;
export const GAME_RENDER_HOST_ANIM_40A030 = 6;
export const GAME_RENDER_HOST_BODY_817830 = 7;
export const GAME_RENDER_HOST_RT_POP = 8;
export const GAME_RENDER_HOST_VT_408590_PAIR_A = 9;
export const GAME_RENDER_HOST_VT_408590_PAIR_B = 10;
export const GAME_RENDER_HOST_VT_40C550_ADDREF = 11;
export const GAME_RENDER_HOST_VT_40C550_RELEASE = 12;
export const GAME_RENDER_HOST_HOOK_C7163C = 13;
export const GAME_RENDER_HOST_GETROOMBYIDX = 14;
export const GAME_RENDER_HOST_ONCE_HEADER = 15;
export const GAME_RENDER_HOST_ONCE_CTOR = 16;
export const GAME_RENDER_HOST_ONCE_ATEXIT = 17;
export const GAME_RENDER_HOST_ONCE_FOOTER = 18;
export const GAME_RENDER_HOST_ALLOC = 19;
export const GAME_RENDER_HOST_ASSERT_A112C0 = 20;
export const GAME_RENDER_HOST_EPILOG_825DE0 = 21;
export const GAME_RENDER_HOST_EPILOG_826AE0 = 22;
export const GAME_RENDER_HOST_EPILOG_820FD0 = 23;
export const GAME_RENDER_HOST_RT_REBIND = 24;
export const GAME_RENDER_HOST_BIND_A1DFD0 = 25;
export const GAME_RENDER_HOST_STAGE39_83A1B0 = 26;
export const GAME_RENDER_HOST_TREE_ERASE_424540 = 27;
export const GAME_RENDER_HOST_RT_POP_A19180 = 28;
export const GAME_RENDER_HOST_GET_STAGE_ID_738470 = 29;
export const GAME_RENDER_HOST_BODY_817830_TRUNK = 30;
export const GAME_RENDER_HOST_BODY_817830_TAIL = 31;
export const GAME_RENDER_HOST_GETLROOM_81F8B0 = 32;
export const GAME_RENDER_HOST_A10690 = 33;
export const GAME_RENDER_HOST_A102E0 = 34;
export const GAME_RENDER_HOST_A106E0 = 35;

export const GAME_RENDER_VA_SHELL = 0x0080ea80;
export const GAME_RENDER_VA_ENTITY_RENDER = 0x00806c20;
export const GAME_RENDER_VA_GRID_DRAW = 0x0080c810;
export const GAME_RENDER_VA_BODY_817830 = 0x00817830;
export const GAME_RENDER_VA_GET_STAGE_ID = 0x00738470;
export const GAME_RENDER_VA_COLOR_BIND = 0x009956e0;
export const GAME_RENDER_VA_GETROOMBYIDX = 0x00740bc0;
export const GAME_RENDER_VA_ROOMDESC_CTOR = 0x006ef590;
export const GAME_RENDER_VA_BOOST_74EFD0 = 0x0074efd0;
export const GAME_RENDER_VA_BOOST_827BC0 = 0x00827bc0;
export const GAME_RENDER_VA_STAGE39_83A1B0 = 0x0083a1b0;
export const GAME_RENDER_VA_TREE_ERASE_424540 = 0x00424540;
export const GAME_RENDER_VA_BIND_A1DFD0 = 0x00a1dfd0;
export const GAME_RENDER_VA_EPILOG_825DE0 = 0x00825de0;
export const GAME_RENDER_VA_EPILOG_826AE0 = 0x00826ae0;
export const GAME_RENDER_VA_EPILOG_820FD0 = 0x00820fd0;
export const GAME_RENDER_VA_RT_A19180 = 0x00a19180;
export const GAME_RENDER_VA_RT_A18300 = 0x00a18300;
export const GAME_RENDER_VA_RT_684F30 = 0x00684f30;
export const GAME_RENDER_VA_ANIM_40A030 = 0x0040a030;
export const GAME_RENDER_VA_ASSERT_A112C0 = 0x00a112c0;
export const GAME_RENDER_VA_RT_EMPTY_MSG = 0x00b655e4;
export const GAME_RENDER_VA_RT_EMPTY_MSG_ARG = 0x10;
export const GAME_RENDER_VA_OVERLAY_CLAMP = 0x00c7b640;
export const GAME_RENDER_VA_RT_MANAGER_C798E0 = 0x00c798e0;
export const GAME_RENDER_VA_BODY_817830_LROOM = 0x00817b53;
export const GAME_RENDER_VA_BODY_817830_OTHER = 0x0081d20a;
export const GAME_RENDER_VA_BODY_817830_EXIT = 0x0081def9;
export const GAME_RENDER_VA_SHADER_NAME = 0x00b1a5b0;
export const GAME_RENDER_817830_KAGE_HASH = 0xb3d14323;
export const GAME_RENDER_VA_BODY_817830_PACK = 0x00817b58;
export const GAME_RENDER_VA_GETLROOM = 0x0081f8b0;
export const GAME_RENDER_VA_A10690 = 0x00a10690;
export const GAME_RENDER_VA_A0F550 = 0x00a0f550;
export const GAME_RENDER_VA_A10C00 = 0x00a10c00;
export const GAME_RENDER_VA_TYPE9_A10690 = 0x00817c3d;
export const GAME_RENDER_VA_TYPE9_A10690_NEXT = 0x00817ccc;
export const GAME_RENDER_VA_TYPE9_A10690_CELL2 = 0x00817d5c;
export const GAME_RENDER_VA_TYPE9_A10690_CELL3 = 0x00817de0;
export const GAME_RENDER_VA_TYPE9_A10690_CELL4 = 0x00817e78;
export const GAME_RENDER_VA_TYPE9_A10690_CELL5 = 0x00817f06;
export const GAME_RENDER_VA_TYPE9_A102E0_CELL6 = 0x00817f74;
export const GAME_RENDER_VA_A102E0 = 0x00a102e0;
export const GAME_RENDER_VA_TYPE9_A102E0_NEXT = 0x00817fcd;
export const GAME_RENDER_VA_TYPE9_A102E0_1 = 0x00818023;
export const GAME_RENDER_VA_TYPE9_A102E0_2 = 0x00818072;
export const GAME_RENDER_VA_TYPE9_A106E0 = 0x008180b4;
export const GAME_RENDER_VA_A106E0 = 0x00a106e0;
export const GAME_RENDER_VA_TYPE9_A102E0_3 = 0x00818122;
/* v19: sixth type-9 a102e0 host callsite (peeled). */
export const GAME_RENDER_VA_TYPE9_A102E0_4 = 0x0081817c;
/* v20: seventh type-9 a102e0 host callsite (peeled). */
export const GAME_RENDER_VA_TYPE9_A102E0_5 = 0x008181d2;
/* v21: eighth type-9 a102e0 host callsite (peeled). */
export const GAME_RENDER_VA_TYPE9_A102E0_6 = 0x00818228;
/* v22: second a106e0 host callsite (peeled; typed HOST_A106E0). */
export const GAME_RENDER_VA_TYPE9_A106E0_2 = 0x00818273;
/* v23: ninth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_7 = 0x008182de;
/* v24: tenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_8 = 0x00818338;
/* v25: eleventh type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_9 = 0x0081838b;
/* v26: twelfth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_10 = 0x008183e7;
/* v27: third type-9 a106e0 host callsite (peeled; typed HOST_A106E0). */
export const GAME_RENDER_VA_TYPE9_A106E0_3 = 0x0081842c;
/* v28: thirteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_11 = 0x00818497;
/* v29: fourteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_12 = 0x008184ee;
/* v30: fifteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_13 = 0x00818547;
/* v31: sixteenth type-9 a102e0 host callsite (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_14 = 0x0081859a;
/* v32: fourth type-9 a106e0 seam host callsite (peeled; typed
   HOST_A106E0; closes the third a106e0 seam group). */
export const GAME_RENDER_VA_TYPE9_A106E0_4 = 0x008185e8;
/* v33: seventeenth type-9 a102e0 host callsite, first pack of the
   fourth seam group (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_16 = 0x00818656;
/* v33 remain→v34: eighteenth type-9 a102e0 host callsite, second pack
   of the fourth seam group (peeled since v34; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_17 = 0x008186ad;
/* v34 remain→v35: nineteenth type-9 a102e0 host callsite, third pack
   of the fourth seam group (peeled since v35; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_18 = 0x00818703;
/* v35: twentieth type-9 a102e0 host callsite, fourth pack of the
   fourth seam group (peeled; typed HOST_A102E0). */
export const GAME_RENDER_VA_TYPE9_A102E0_19 = 0x0081875c;
/* v35: fifth type-9 a106e0 seam host callsite, starts the fifth seam
   group (peeled; typed HOST_A106E0). */
export const GAME_RENDER_VA_TYPE9_A106E0_5 = 0x008187a1;
/* v35 remain: twenty-first type-9 a102e0 host callsite, first pack of
   the fifth seam group (still host; kind 30 LROOM_REMAIN). */
export const GAME_RENDER_VA_TYPE9_A102E0_20 = 0x0081880c;
export const GAME_RENDER_VA_TYPE9_A102E0_21 = 0x00818866;
export const GAME_RENDER_VA_TYPE9_A102E0_22 = 0x008188b9;
export const GAME_RENDER_VA_TYPE9_A102E0_23 = 0x0081890f;
export const GAME_RENDER_VA_TYPE9_A106E0_6 = 0x0081895a;
export const GAME_RENDER_VA_LROOM_GATE_9394 = 0x00819394;
export const GAME_RENDER_VA_LROOM_GATE_JNE_9398 = 0x00819398;
export const GAME_RENDER_VA_TYPE10_FIRST_PACK_9720 = 0x00819720;
export const GAME_RENDER_VA_TYPE9_A102E0_25 = 0x00819773;
export const GAME_RENDER_VA_TYPE9_A102E0_26 = 0x008197c9;
export const GAME_RENDER_VA_TYPE9_A102E0_27 = 0x00819818;
export const GAME_RENDER_VA_TYPE9_A102E0_28 = 0x008198ce;
export const GAME_RENDER_VA_TYPE9_A102E0_29 = 0x00819928;
export const GAME_RENDER_VA_TYPE9_A102E0_30 = 0x008199d1;
export const GAME_RENDER_VA_TYPE9_A106E0_8 = 0x00819a1c;
export const GAME_RENDER_VA_TYPE9_A102E0_31 = 0x00819a87;
export const GAME_RENDER_VA_TYPE9_A102E0_32 = 0x00819ade;
export const GAME_RENDER_VA_TYPE9_A102E0_33 = 0x00819b31;
export const GAME_RENDER_VA_TYPE9_A102E0_34 = 0x00819b84;
export const GAME_RENDER_VA_TYPE9_A106E0_9 = 0x00819bcf;
export const GAME_RENDER_VA_TYPE9_A102E0_35 = 0x00819c3d;
export const GAME_RENDER_VA_TYPE9_A102E0_36 = 0x00819c94;
export const GAME_RENDER_VA_TYPE9_A102E0_37 = 0x00819cea;
export const GAME_RENDER_VA_TYPE9_A102E0_38 = 0x00819d3d;
export const GAME_RENDER_VA_TYPE9_A106E0_10 = 0x00819d7f;
export const GAME_RENDER_VA_TYPE9_A102E0_39 = 0x00819ded;
export const GAME_RENDER_VA_TYPE9_A102E0_40 = 0x00819e47;
export const GAME_RENDER_VA_TYPE9_A102E0_41 = 0x00819e9d;
export const GAME_RENDER_VA_TYPE9_A102E0_42 = 0x00819ef3;
export const GAME_RENDER_VA_TYPE9_A106E0_11 = 0x00819f35;
export const GAME_RENDER_VA_TYPE9_A102E0_43 = 0x00819fa0;
export const GAME_RENDER_VA_TYPE9_A102E0_44 = 0x00819ffa;
export const GAME_RENDER_VA_TYPE9_A102E0_45 = 0x0081a04d;
export const TYPE9_A102E0_45 = 0x0081a04d;
export const GAME_RENDER_VA_TYPE9_A102E0_46 = 0x0081a0a3;
export const TYPE9_A102E0_46 = 0x0081a0a3;
export const GAME_RENDER_VA_TYPE9_A106E0_12 = 0x0081a0ee;
export const TYPE9_A106E0_12 = 0x0081a0ee;
export const GAME_RENDER_VA_HOST_A0F550_CALLSITE = 0x0081a132;
export const HOST_A0F550_CALLSITE = 0x0081a132;
export const GAME_RENDER_VA_TYPE9_A102E0_47 = 0x0081ac33;
export const TYPE9_A102E0_47 = 0x0081ac33;
export const GAME_RENDER_VA_TYPE9_A102E0_48 = 0x0081ac8e;
export const TYPE9_A102E0_48 = 0x0081ac8e;
export const GAME_RENDER_VA_TYPE9_A102E0_49 = 0x0081acec;
export const TYPE9_A102E0_49 = 0x0081acec;
export const GAME_RENDER_VA_TYPE9_A102E0_50 = 0x0081ad42;
export const TYPE9_A102E0_50 = 0x0081ad42;
export const GAME_RENDER_VA_TYPE9_A102E0_51 = 0x0081adbb;
export const TYPE9_A102E0_51 = 0x0081adbb;
export const GAME_RENDER_VA_TYPE9_A102E0_52 = 0x0081ae1c;
export const TYPE9_A102E0_52 = 0x0081ae1c;
export const GAME_RENDER_VA_TYPE9_A102E0_53 = 0x0081aed3;
export const TYPE9_A102E0_53 = 0x0081aed3;
export const GAME_RENDER_VA_TYPE9_A102E0_54 = 0x0081af4c;
export const TYPE9_A102E0_54 = 0x0081af4c;
export const GAME_RENDER_VA_TYPE9_A102E0_55 = 0x0081afaa;
export const TYPE9_A102E0_55 = 0x0081afaa;
export const GAME_RENDER_VA_TYPE9_A102E0_56 = 0x0081b005;
export const TYPE9_A102E0_56 = 0x0081b005;
export const GAME_RENDER_VA_TYPE9_A102E0_57 = 0x0081b05e;
export const TYPE9_A102E0_57 = 0x0081b05e;
export const GAME_RENDER_VA_TYPE9_A102E0_58 = 0x0081b0d7;
export const TYPE9_A102E0_58 = 0x0081b0d7;
export const GAME_RENDER_VA_TYPE9_A102E0_59 = 0x0081b135;
export const TYPE9_A102E0_59 = 0x0081b135;
export const GAME_RENDER_VA_TYPE9_A102E0_60 = 0x0081b193;
export const TYPE9_A102E0_60 = 0x0081b193;
export const GAME_RENDER_VA_TYPE9_A102E0_61 = 0x0081b1ec;
export const TYPE9_A102E0_61 = 0x0081b1ec;
export const GAME_RENDER_VA_TYPE9_A102E0_62 = 0x0081b265;
export const TYPE9_A102E0_62 = 0x0081b265;
export const GAME_RENDER_VA_TYPE9_A102E0_63 = 0x0081b2c6;
export const TYPE9_A102E0_63 = 0x0081b2c6;
export const GAME_RENDER_VA_TYPE9_A102E0_64 = 0x0081b321;
export const TYPE9_A102E0_64 = 0x0081b321;
export const GAME_RENDER_VA_TYPE9_A102E0_65 = 0x0081b37d;
export const TYPE9_A102E0_65 = 0x0081b37d;
export const GAME_RENDER_VA_TYPE9_A102E0_66 = 0x0081b3f9;
export const TYPE9_A102E0_66 = 0x0081b3f9;
export const GAME_RENDER_VA_TYPE9_A102E0_67 = 0x0081b457;
export const TYPE9_A102E0_67 = 0x0081b457;
export const GAME_RENDER_VA_TYPE9_A102E0_68 = 0x0081b4b2;
export const TYPE9_A102E0_68 = 0x0081b4b2;
export const GAME_RENDER_VA_TYPE9_A102E0_69 = 0x0081b50b;
export const TYPE9_A102E0_69 = 0x0081b50b;
export const GAME_RENDER_VA_TYPE9_A102E0_70 = 0x0081c00c;
export const TYPE9_A102E0_70 = 0x0081c00c;
export const GAME_RENDER_VA_TYPE9_A102E0_71 = 0x0081c067;
export const TYPE9_A102E0_71 = 0x0081c067;
export const GAME_RENDER_VA_TYPE9_A102E0_72 = 0x0081c0c5;
export const TYPE9_A102E0_72 = 0x0081c0c5;
export const GAME_RENDER_VA_TYPE9_A102E0_73 = 0x0081c11b;
export const TYPE9_A102E0_73 = 0x0081c11b;
export const GAME_RENDER_VA_TYPE9_A102E0_74 = 0x0081c194;
export const TYPE9_A102E0_74 = 0x0081c194;
export const GAME_RENDER_VA_TYPE9_A102E0_75 = 0x0081c1f5;
export const TYPE9_A102E0_75 = 0x0081c1f5;
export const GAME_RENDER_VA_TYPE9_A102E0_76 = 0x0081c250;
export const TYPE9_A102E0_76 = 0x0081c250;
export const GAME_RENDER_VA_TYPE9_A102E0_77 = 0x0081c2ac;
export const TYPE9_A102E0_77 = 0x0081c2ac;
export const GAME_RENDER_VA_TYPE9_A102E0_78 = 0x0081c328;
export const TYPE9_A102E0_78 = 0x0081c328;
export const GAME_RENDER_VA_TYPE9_A102E0_79 = 0x0081c386;
export const TYPE9_A102E0_79 = 0x0081c386;
export const GAME_RENDER_VA_TYPE9_A102E0_80 = 0x0081c3e1;
export const TYPE9_A102E0_80 = 0x0081c3e1;
export const GAME_RENDER_VA_TYPE9_A102E0_81 = 0x0081c43a;
export const TYPE9_A102E0_81 = 0x0081c43a;
export const GAME_RENDER_VA_TYPE9_A102E0_82 = 0x0081c4b6;
export const TYPE9_A102E0_82 = 0x0081c4b6;
export const GAME_RENDER_VA_TYPE9_A102E0_83 = 0x0081c514;
export const TYPE9_A102E0_83 = 0x0081c514;
export const GAME_RENDER_VA_TYPE9_A102E0_84 = 0x0081c56f;
export const TYPE9_A102E0_84 = 0x0081c56f;
export const GAME_RENDER_VA_TYPE9_A102E0_85 = 0x0081c5c8;
export const TYPE9_A102E0_85 = 0x0081c5c8;
export const GAME_RENDER_VA_TYPE9_A102E0_86 = 0x0081c64a;
export const TYPE9_A102E0_86 = 0x0081c64a;
export const GAME_RENDER_VA_TYPE9_A102E0_87 = 0x0081c6a8;
export const TYPE9_A102E0_87 = 0x0081c6a8;
export const GAME_RENDER_VA_TYPE9_A102E0_88 = 0x0081c706;
export const TYPE9_A102E0_88 = 0x0081c706;
export const GAME_RENDER_VA_TYPE9_A102E0_89 = 0x0081c75f;
export const TYPE9_A102E0_89 = 0x0081c75f;
export const GAME_RENDER_VA_TYPE9_A102E0_90 = 0x81c7de;
export const TYPE9_A102E0_90 = 0x81c7de;
export const GAME_RENDER_VA_TYPE9_A102E0_91 = 0x81c83f;
export const TYPE9_A102E0_91 = 0x81c83f;
export const GAME_RENDER_VA_TYPE9_A102E0_92 = 0x81c89a;
/* v73 terminal */
export const GAME_RENDER_VA_HOST_A0F550_TERMINAL_109 = 0x0081dab9;
export const TYPE9_A102E0_92 = 0x81c89a;
export const GAME_RENDER_VA_TYPE9_A102E0_93 = 0x81c8f6;
export const TYPE9_A102E0_93 = 0x81c8f6;
export const GAME_RENDER_VA_TYPE9_A102E0_94 = 0x81d377;
export const TYPE9_A102E0_94 = 0x81d377;
export const GAME_RENDER_VA_TYPE9_A102E0_95 = 0x81d3d2;
export const TYPE9_A102E0_95 = 0x81d3d2;
export const GAME_RENDER_VA_TYPE9_A102E0_96 = 0x81d430;
export const TYPE9_A102E0_96 = 0x81d430;
export const GAME_RENDER_VA_TYPE9_A102E0_97 = 0x81d486;
export const TYPE9_A102E0_97 = 0x81d486;
export const GAME_RENDER_VA_TYPE9_A102E0_98 = 0x81d4f5;
export const TYPE9_A102E0_98 = 0x81d4f5;
export const GAME_RENDER_VA_TYPE9_A102E0_99 = 0x81d556;
export const TYPE9_A102E0_99 = 0x81d556;
export const GAME_RENDER_VA_TYPE9_A102E0_100 = 0x81d5b1;
export const TYPE9_A102E0_100 = 0x81d5b1;
export const GAME_RENDER_VA_TYPE9_A102E0_101 = 0x81d60d;
export const TYPE9_A102E0_101 = 0x81d60d;
export const GAME_RENDER_VA_TYPE9_A102E0_102 = 0x81d67c;
export const TYPE9_A102E0_102 = 0x81d67c;
export const GAME_RENDER_VA_TYPE9_A102E0_103 = 0x81d6da;
export const TYPE9_A102E0_103 = 0x81d6da;
export const GAME_RENDER_VA_TYPE9_A102E0_104 = 0x81d735;
export const TYPE9_A102E0_104 = 0x81d735;
export const GAME_RENDER_VA_TYPE9_A102E0_105 = 0x81d78e;
export const TYPE9_A102E0_105 = 0x81d78e;
export const GAME_RENDER_VA_TYPE9_A102E0_106 = 0x81d7fd;
export const TYPE9_A102E0_106 = 0x81d7fd;
export const GAME_RENDER_VA_TYPE9_A102E0_107 = 0x81d85b;
export const TYPE9_A102E0_107 = 0x81d85b;
export const GAME_RENDER_VA_TYPE9_A102E0_108 = 0x81d8b6;
export const TYPE9_A102E0_108 = 0x81d8b6;
export const GAME_RENDER_VA_TYPE9_A102E0_109 = 0x81d90f;
export const TYPE9_A102E0_109 = 0x81d90f;
export const TYPE9_A102E0_44 = 0x00819ffa;
export const GAME_RENDER_VA_TYPE9_A106E0_7 = 0x00819863;
export const GAME_RENDER_VA_LROOM_JOIN_A975 = 0x0081a975;
export const GAME_RENDER_VA_LROOM_JOIN_9394 = 0x00819394;
export const GAME_RENDER_LROOM_QUAD_COUNT = 0x0c;
export const GAME_RENDER_LROOM_QUAD_STRIDE = 0x24;
export const GAME_RENDER_LROOM_PAIR_COUNT = 6;
export const GAME_RENDER_LROOM_PAIR_STRIDE = 0x70;

export const GAME_RENDER_RECV_STAGE39 = 0x776c;
export const GAME_RENDER_RECV_COLOR_BIND = 0x1618;
export const GAME_RENDER_RECV_TREE = 0x7308;
export const GAME_RENDER_RECV_ANIM_A = 0x6e70;
export const GAME_RENDER_RECV_ANIM_B = 0x6e90;

export const GAME_RENDER_VA_OVERRIDE_PACK = 0x00babf20;
export const GAME_RENDER_OVERRIDE_R_BITS = 0x00000000;
export const GAME_RENDER_OVERRIDE_G_BITS = 0x00000000;
export const GAME_RENDER_OVERRIDE_B_BITS = 0x00000000;
export const GAME_RENDER_OVERRIDE_W3_BITS = 0x3f800000;

export const GAME_RENDER_C79904_BIT_CLEAR_VALUE = 6;
export const GAME_RENDER_C79904_BIT_SET_VALUE = 1;
export const GAME_RENDER_C798E4_TEST_BIT = 0x04;

export const GAME_RENDER_OFF = {
  gameMode: 0x0008,
  gridW: 0x000c,
  gridH: 0x0010,
  flag11f6: 0x11f6,
  cameraBaseX: 0x1204,
  cameraBaseY: 0x1208,
  entityArray: 0x125c,
  entityCount: 0x1264,
  fadeSrcR: 0x1b5c,
  fadeSrcG: 0x1b60,
  fadeSrcB: 0x1b64,
  fadeSrcA: 0x1b68,
  fadeWord6c: 0x1b6c,
  fadeDstR: 0x1b70,
  fadeDstG: 0x1b74,
  fadeDstB: 0x1b78,
  fadeDstA: 0x1b7c,
  stage1d18: 0x1d18,
  overlaySwapFlag: 0x6eb0,
  overlayScaleX: 0x6edc,
  overlayScaleY: 0x6ee0,
  overlayColor: 0x6ee8,
  overlayDrawFlag: 0x6f49,
  treeHead: 0x7308,
  treeCount: 0x730c,
};

export const GAME_RENDER_VT_SLOT = {
  pairA: 0x44,
  pairB: 0x48,
  addref: 0x04,
  release: 0x0c,
};


export const GAME_RENDER_STATE_FIELDS = [
  "gameMode",
  "gridW",
  "gridH",
  "flag11f6",
  "cameraBaseXBits",
  "cameraBaseYBits",
  "entityArrayEntry",
  "entityCountEntry",
  "fadeSrcRBits",
  "fadeSrcGBits",
  "fadeSrcBBits",
  "fadeSrcABits",
  "fadeWord1b6c",
  "fadeDstRBits",
  "fadeDstGBits",
  "fadeDstBBits",
  "fadeDstABits",
  "stage1d18",
  "overlaySwapFlag",
  "overlayScaleXBits",
  "overlayScaleYBits",
  "overlayDrawFlag",
  "treeHead7308",
  "treeCount730c",
  "treeCleared",
  "overlayWritten",
  "flagCleared",
];

export const GAME_RENDER_INPUT_FIELDS = [
  "option2a3c3",
  "option2a3c5",
  "mgrWord0",
  "mgrWord1",
  "mgrFade26518Bits",
  "mgrFade2651cBits",
  "mgr26550",
  "mgrWord0c",
  "mgr1830c",
  "mgr67734Bits",
  "mgrCamX2650cBits",
  "mgrCamY26510Bits",
  "datC798e4",
  "datC379b8Snap",
  "datC379b8Now",
  "c379b8Byte4",
  "datC78dc4Bits",
  "datC78edcBits",
  "datC3793cBits",
  "datC37940Bits",
  "datC79790",
  "datC7978c",
  "datC7977d",
  "datC71678",
  "datC33910",
  "datC7b640Bits",
  "datC7b644Bits",
  "datC7163c",
  "datC8108c",
  "tlsOnceEpoch",
  "present38",
  "present39",
  "present3a",
  "present3b",
  "present3c",
  "present3d",
  "present3e",
  "present3f",
  "present40",
  "present41",
  "present42",
  "present43",
  "present44",
  "present46",
  "present4f",
  "mgrWord0Now",
  "mgrWord1Now",
  "mgrMode26584",
  "mgrDifficulty269c8",
  "mgrFlags2654c",
  "bitset26548Lo",
  "bitset2654cHi",
  "roomDesc",
  "roomDescNested",
  "roomType48",
  "roomWidthC",
  "roomAabb14Bits",
  "roomAabb18Bits",
  "roomAabb1cBits",
  "roomAabb20Bits",
  "mgr264f8",
  "datC379bc",
];

export const GAME_RENDER_EVENT_FIELDS = [
  "continuationKind",
  "hostKind",
  "hostVa",
  "hostReceiver",
  "hostVtableSlot",
  "hostArg0",
  "hostArg1",
  "hostRepeat",
  "needsRecapture",
  "bodySkipped",
  "entityRenderCalls",
  "gridDrawCalls",
  "vtableDispatchCalls",
  "allocCalls",
  "sampleExhausted",
  "fadeLocalRBits",
  "fadeLocalGBits",
  "fadeLocalBBits",
  "fadeWord50",
  "fadeBaseBits",
  "fadeBoost",
  "fadeForceFull",
  "fadeTBits",
  "fadeColorBitsR",
  "fadeColorBitsG",
  "fadeColorBitsB",
  "fadeColorBitsA",
  "cameraXBits",
  "cameraYBits",
  "gC79904Value",
  "gC79900Applied",
  "c379b8NextValue",
  "c379b8StoreApplied",
  "treeHead",
  "treePostsApplied",
  "gridCellCount",
  "overlayPosXBits",
  "overlayPosYBits",
  "overlayScaleXBits",
  "overlayScaleYBits",
  "overlayStoresApplied",
  "overlayFirstOff",
  "overlaySecondOff",
  "rtDepthAfter",
  "rtBaseCleared",
  "rtAssertNeeded",
  "flag11f6Cleared",
  "pollSelectsOne",
  "pollABits",
  "pollBBits",
  "a14050Found",
  "tailStartVa",
  "tailBlend398Bits",
  "tailScale28Bits",
  "tailScale18Bits",
  "tailScale80Bits",
  "lroomNextVa",
  "lroomQuadInits",
  "lroomPairInits",
  "type9Cell0HalfABits",
  "type9Cell0XBits",
  "type9Cell0YBits",
  "type9Cell1HalfBBits",
  "type9Cell1SumBits",
  "type9Cell1Y2Bits",
  "type9Cell2X2Bits",
  "type9Cell2Y3Bits",
  "type9Cell2Sum2Bits",
  "type9Cell3X3Bits",
  "type9Cell3Y4Bits",
  "type9Cell3Sum3Bits",
  "type9Cell4DblBits",
  "type9Cell4AcBits",
  "type9Cell4Sum4Bits",
  "type9Cell4Y5Bits",
  "type9Cell5DblBits",
  "type9Cell5AcBits",
  "type9Cell5Sum5Bits",
  "type9Cell5Y6Bits",
  "type9Cell6XBits",
  "type9Cell6YBits",
  "type9Cell6AngleBits",
  "type9A102e0XBits",
  "type9A102e0YBits",
  "type9A102e01XBits",
  "type9A102e01YBits",
  "type9A102e02XBits",
  "type9A102e02YBits",
  "type9A102e03XBits",
  "type9A102e03YBits",
  "type9A106e0XBits",
  "type9A106e0YBits",
  "type9A106e0AngleBits",
  "type9A102e04XBits",
  "type9A102e04YBits",
  "type9A102e05XBits",
  "type9A102e05YBits",
  "type9A102e06XBits",
  "type9A102e06YBits",
  "type9A102e07XBits",
  "type9A102e07YBits",
  "type9A106e02XBits",
  "type9A106e02YBits",
  "type9A106e02AngleBits",
  "type9A106e02GateBits",
  "type9A102e08XBits",
  "type9A102e08YBits",
  "type9A102e09XBits",
  "type9A102e09YBits",
  "type9A102e010XBits",
  "type9A102e010YBits",
  "type9A102e011XBits",
  "type9A102e011YBits",
  "type9A106e03XBits",
  "type9A106e03YBits",
  "type9A106e03AngleBits",
  "type9A106e03GateBits",
  "type9A102e012XBits",
  "type9A102e012YBits",
  "type9A102e013XBits",
  "type9A102e013YBits",
  "type9A102e014XBits",
  "type9A102e014YBits",
  "type9A102e015XBits",
  "type9A102e015YBits",
  "type9A106e04XBits",
  "type9A106e04YBits",
  "type9A106e04AngleBits",
  "type9A106e04GateBits",
  "type9A102e016XBits",
  "type9A102e016YBits",
  "type9A102e017XBits",
  "type9A102e017YBits",
  "type9A102e018XBits",
  "type9A102e018YBits",
  "type9A102e019XBits",
  "type9A102e019YBits",
  "type9A102e020XBits",
  "type9A102e020YBits",
  "type9A102e021XBits",
  "type9A102e021YBits",
  "type9A102e022XBits",
  "type9A102e022YBits",
  "type9A102e023XBits",
  "type9A102e023YBits",
  "type9A102e024XBits",
  "type9A102e024YBits",
  "type9A102e025XBits",
  "type9A102e025YBits",
  "type9A102e026XBits",
  "type9A102e026YBits",
  "type9A102e027XBits",
  "type9A102e027YBits",
  "type9A106e07XBits",
  "type9A106e07YBits",
  "type9A106e07AngleBits",
  "type9A106e07GateBits",
  "type9A102e028XBits",
  "type9A102e028YBits",
  "type9A102e029XBits",
  "type9A102e029YBits",
  "type9A102e030XBits",
  "type9A102e030YBits",
  "type9A106e08XBits",
  "type9A106e08YBits",
  "type9A106e08AngleBits",
  "type9A106e08GateBits",
  "type9A102e031XBits",
  "type9A102e031YBits",
  "type9A102e032XBits",
  "type9A102e032YBits",
  "type9A102e033XBits",
  "type9A102e033YBits",
  "type9A102e034XBits",
  "type9A102e034YBits",
  "type9A106e09XBits",
  "type9A106e09YBits",
  "type9A106e09AngleBits",
  "type9A106e09GateBits",
  "type9A102e035XBits",
  "type9A102e035YBits",
  "type9A102e036XBits",
  "type9A102e036YBits",
  "type9A102e037XBits",
  "type9A102e037YBits",
  "type9A102e038XBits",
  "type9A102e038YBits",
  "type9A106e010XBits",
  "type9A106e010YBits",
  "type9A106e010AngleBits",
  "type9A106e010GateBits",
  "type9A102e039XBits",
  "type9A102e039YBits",
  "type9A102e040XBits",
  "type9A102e040YBits",
  "type9A102e041XBits",
  "type9A102e041YBits",
  "type9A102e042XBits",
  "type9A102e042YBits",
  "type9A106e011XBits",
  "type9A106e011YBits",
  "type9A106e011AngleBits",
  "type9A106e011GateBits",
  "type9A102e043XBits",
  "type9A102e043YBits",
  "type9A102e044XBits",
  "type9A102e044YBits",
  "type9A102e045XBits",
  "type9A102e045YBits",
  "type9A102e046XBits",
  "type9A102e046YBits",
  "type9A106e05XBits",
  "type9A106e05YBits",
  "type9A106e05AngleBits",
  "type9A106e05GateBits",
  "type9A106e012GateBits",
  "type9A102e047XBits",
  "type9A102e047YBits",
  "type9A102e048XBits",
  "type9A102e048YBits",
  "type9A102e049XBits",
  "type9A102e049YBits",
  "type9A102e050XBits",
  "type9A102e050YBits",
  "type9A102e051XBits",
  "type9A102e051YBits",
  "type9A102e052XBits",
  "type9A102e052YBits",
  "type9A102e053XBits",
  "type9A102e053YBits",
  "type9A102e054XBits",
  "type9A102e054YBits",
  "type9A102e055XBits",
  "type9A102e055YBits",
  "type9A102e056XBits",
  "type9A102e056YBits",
  "type9A102e057XBits",
  "type9A102e057YBits",
  "type9A102e058XBits",
  "type9A102e058YBits",
  "type9A102e059XBits",
  "type9A102e059YBits",
  "type9A102e060XBits",
  "type9A102e060YBits",
  "type9A102e061XBits",
  "type9A102e061YBits",
  "type9A102e062XBits",
  "type9A102e062YBits",
  "type9A102e063XBits",
  "type9A102e063YBits",
  "type9A102e064XBits",
  "type9A102e064YBits",
  "type9A102e065XBits",
  "type9A102e065YBits",
  "type9A102e066XBits",
  "type9A102e066YBits",
  "type9A102e067XBits",
  "type9A102e067YBits",
  "type9A102e068XBits",
  "type9A102e068YBits",
  "type9A102e069XBits",
  "type9A102e069YBits",
  "type9A102e070XBits",
  "type9A102e070YBits",
  "type9A102e071XBits",
  "type9A102e071YBits",
  "type9A102e072XBits",
  "type9A102e072YBits",
  "type9A102e073XBits",
  "type9A102e073YBits",
  "type9A102e074XBits",
  "type9A102e074YBits",
  "type9A102e075XBits",
  "type9A102e075YBits",
  "type9A102e076XBits",
  "type9A102e076YBits",
  "type9A102e077XBits",
  "type9A102e077YBits",
  "type9A102e078XBits",
  "type9A102e078YBits",
  "type9A102e079XBits",
  "type9A102e079YBits",
  "type9A102e080XBits",
  "type9A102e080YBits",
  "type9A102e081XBits",
  "type9A102e081YBits",
  "type9A102e082XBits",
  "type9A102e082YBits",
  "type9A102e083XBits",
  "type9A102e083YBits",
  "type9A102e084XBits",
  "type9A102e084YBits",
  "type9A102e085XBits",
  "type9A102e085YBits",
  "type9A102e086XBits",
  "type9A102e086YBits",
  "type9A102e087XBits",
  "type9A102e087YBits",
  "type9A102e088XBits",
  "type9A102e088YBits",

  "type9A102e089XBits",
  "type9A102e089YBits",
  "type9A102e090XBits",
  "type9A102e090YBits",
  "type9A102e091XBits",
  "type9A102e091YBits",
  "type9A102e092XBits",
  "type9A102e092YBits",
  "type9A102e093XBits",
  "type9A102e093YBits",
  "type9A102e094XBits",
  "type9A102e094YBits",
  "type9A102e095XBits",
  "type9A102e095YBits",
  "type9A102e096XBits",
  "type9A102e096YBits",
  "type9A102e097XBits",
  "type9A102e097YBits",
  "type9A102e098XBits",
  "type9A102e098YBits",
  "type9A102e099XBits",
  "type9A102e099YBits",
  "type9A102e0100XBits",
  "type9A102e0100YBits",
  "type9A102e0101XBits",
  "type9A102e0101YBits",
  "type9A102e0102XBits",
  "type9A102e0102YBits",
  "type9A102e0103XBits",
  "type9A102e0103YBits",
  "type9A102e0104XBits",
  "type9A102e0104YBits",
  "type9A102e0105XBits",
  "type9A102e0105YBits",
  "type9A102e0106XBits",
  "type9A102e0106YBits",
  "type9A102e0107XBits",
  "type9A102e0107YBits",
  "type9A102e0108XBits",
  "type9A102e0108YBits",
  "type9A102e0109XBits",
  "type9A102e0109YBits",
];

const u32 = (v) => v >>> 0;
const u8 = (v) => (v >>> 0) & 0xff;
const i32 = (v) => v | 0;
const fr = Math.fround;

const _f32dv = new DataView(new ArrayBuffer(4));
function bitsToF32(bits) {
  _f32dv.setUint32(0, u32(bits), true);
  return _f32dv.getFloat32(0, true);
}
function f32ToBits(v) {
  _f32dv.setFloat32(0, fr(v), true);
  return _f32dv.getUint32(0, true);
}
const f32bits = f32ToBits;
function addssBits(aBits, bBits) {
  return f32ToBits(fr(bitsToF32(aBits) + bitsToF32(bBits)));
}

const minss = (a, b) => (a < b ? a : b);
const maxss = (a, b) => (a > b ? a : b);

const F32_ONE = bitsToF32(0x3f800000);
const F32_THIRTY = bitsToF32(0x41f00000);
const F32_HUNDREDTH = bitsToF32(0x3c23d70a);
const F32_HALF = bitsToF32(0x3f000000);
const F32_TENTH = bitsToF32(0x3dcccccd);

const RECAPTURE_KINDS = new Set([
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830,
  GAME_RENDER_CONTINUE_AT_EPILOG_825DE0,
  GAME_RENDER_CONTINUE_AT_RT_REBIND,
  GAME_RENDER_CONTINUE_AT_BIND_A1DFD0,
  GAME_RENDER_CONTINUE_AT_STAGE39,
  GAME_RENDER_CONTINUE_AT_FADE_POLLS,
  GAME_RENDER_CONTINUE_AT_BOOST_74EFD0,
  GAME_RENDER_CONTINUE_AT_BOOST_827BC0,
  GAME_RENDER_CONTINUE_AT_FADE_CLOSE,
  GAME_RENDER_CONTINUE_AT_COLOR_BIND,
  GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY,
  GAME_RENDER_CONTINUE_AT_TREE_ERASE,
  GAME_RENDER_CONTINUE_AT_ENTITY,
  GAME_RENDER_CONTINUE_AT_GRID_ENTRY,
  GAME_RENDER_CONTINUE_AT_GRID,
  GAME_RENDER_CONTINUE_AT_OVERLAY_GATE,
  GAME_RENDER_CONTINUE_AT_AUX_POLLS,
  GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
  GAME_RENDER_CONTINUE_AT_TRUNK_817830,
  GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830,
  GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_16_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_46_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830,
  GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_47_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830,

  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830,
  CONTINUE_AT_TYPE9_A102E0_109_817830,
  CONTINUE_AT_TYPE9_A102E0_108_817830,
  CONTINUE_AT_TYPE9_A102E0_107_817830,
  CONTINUE_AT_TYPE9_A102E0_106_817830,
  CONTINUE_AT_TYPE9_A102E0_105_817830,
  CONTINUE_AT_TYPE9_A102E0_104_817830,
  CONTINUE_AT_TYPE9_A102E0_103_817830,
  CONTINUE_AT_TYPE9_A102E0_102_817830,
  CONTINUE_AT_TYPE9_A102E0_101_817830,
  CONTINUE_AT_TYPE9_A102E0_100_817830,
  CONTINUE_AT_TYPE9_A102E0_99_817830,
  CONTINUE_AT_TYPE9_A102E0_98_817830,
  CONTINUE_AT_TYPE9_A102E0_97_817830,
  CONTINUE_AT_TYPE9_A102E0_96_817830,
  CONTINUE_AT_TYPE9_A102E0_95_817830,
  CONTINUE_AT_TYPE9_A102E0_94_817830,
  CONTINUE_AT_TYPE9_A102E0_93_817830,
  CONTINUE_AT_TYPE9_A102E0_92_817830,
  CONTINUE_AT_TYPE9_A102E0_91_817830,
  CONTINUE_AT_TYPE9_A102E0_90_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830,
  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_110_817830,
]);

export { gameRenderResume817830Type9A102e045, gameRenderResume817830Type9A102e046 };
export function gameRenderContinuationNeedsRecapture(cont) {
  return RECAPTURE_KINDS.has(cont | 0) ? 1 : 0;
}

export function gameRenderHostIsVtable(hostKind) {
  switch (hostKind | 0) {
    case GAME_RENDER_HOST_VT_408590_PAIR_A:
    case GAME_RENDER_HOST_VT_408590_PAIR_B:
    case GAME_RENDER_HOST_VT_40C550_ADDREF:
    case GAME_RENDER_HOST_VT_40C550_RELEASE:
      return 1;
    default:
      return 0;
  }
}

export function gameRenderEmptyEvents() {
  const e = {};
  for (const f of GAME_RENDER_EVENT_FIELDS) e[f] = 0;
  return e;
}

function emit(e, cont, kind, va, receiver, slot, repeat) {
  e.continuationKind = u32(cont);
  e.hostKind = u32(kind);
  e.hostVa = u32(va);
  e.hostReceiver = u32(receiver);
  e.hostVtableSlot = u32(slot);
  e.hostRepeat = u32(repeat);
  e.needsRecapture = gameRenderContinuationNeedsRecapture(cont);
  return e;
}
function emitRecapture(e, cont) {
  return emit(e, cont, GAME_RENDER_HOST_NONE, 0, 0, 0, 0);
}

function loadU32(view, off) {
  return view.getUint32(off, true) >>> 0;
}
function storeU32(view, off, v) {
  view.setUint32(off, u32(v), true);
}

function presenceA(inputs) {
  return {
    present38: inputs.present38,
    present39: inputs.present39,
    present3a: inputs.present3a,
    present3b: inputs.present3b,
    present3c: inputs.present3c,
    present3d: inputs.present3d,
    present3e: inputs.present3e,
  };
}
function presenceB(inputs) {
  return {
    present3f: inputs.present3f,
    present40: inputs.present40,
    present41: inputs.present41,
    present42: inputs.present42,
    present43: inputs.present43,
    present44: inputs.present44,
    present46: inputs.present46,
    present4f: inputs.present4f,
  };
}

function pollMasks(inputs) {
  const gate39 = renderShell6f9400Gate39(
    inputs.mgrMode26584, i32(inputs.mgrWord0Now), inputs.mgrDifficulty269c8,
  );
  return {
    pollA: renderShell6f9400Mask(presenceA(inputs), gate39) >>> 0,
    pollB: renderShell6f95a0Mask(presenceB(inputs)) >>> 0,
  };
}

function boost74efd0Al(inputs) {
  const difficulty = i32(inputs.mgrDifficulty269c8);
  if (difficulty === 2 || difficulty === 3) return 0;
  const this0 = u32(inputs.mgrWord0Now);
  if ((this0 - 1) >>> 0 <= 5) {
    if ((u32(inputs.mgrFlags2654c) & 0x10000) !== 0) return 0;
  }
  const this4 = u32(inputs.mgrWord1Now);
  if (this4 !== 4 && this4 !== 5) return 0;
  if (this0 === 4) return 1;
  if (this0 !== 3) return 0;
  const m = pollMasks(inputs);
  const mgrOr = renderShellFadeMgrWordsOr(inputs.mgr26550, inputs.mgrWord0c) >>> 0;
  const combined = (~m.pollB) & (m.pollA | mgrOr);
  return (combined & 2) !== 0 ? 1 : 0;
}

function bitset64(inputs) {
  return BigInt(u32(inputs.bitset26548Lo)) | (BigInt(u32(inputs.bitset2654cHi)) << 32n);
}

/** Sparse capture over a Game object DataView. */
export function gameRenderCapture(view, byteLength) {
  if (view == null || (byteLength >>> 0) < GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
    return null;
  }
  const off = GAME_RENDER_OFF;
  return {
    gameMode: loadU32(view, off.gameMode),
    gridW: loadU32(view, off.gridW),
    gridH: loadU32(view, off.gridH),
    flag11f6: view.getUint8(off.flag11f6),
    cameraBaseXBits: loadU32(view, off.cameraBaseX),
    cameraBaseYBits: loadU32(view, off.cameraBaseY),
    entityArrayEntry: loadU32(view, off.entityArray),
    entityCountEntry: loadU32(view, off.entityCount),
    fadeSrcRBits: loadU32(view, off.fadeSrcR),
    fadeSrcGBits: loadU32(view, off.fadeSrcG),
    fadeSrcBBits: loadU32(view, off.fadeSrcB),
    fadeSrcABits: loadU32(view, off.fadeSrcA),
    fadeWord1b6c: loadU32(view, off.fadeWord6c),
    fadeDstRBits: loadU32(view, off.fadeDstR),
    fadeDstGBits: loadU32(view, off.fadeDstG),
    fadeDstBBits: loadU32(view, off.fadeDstB),
    fadeDstABits: loadU32(view, off.fadeDstA),
    stage1d18: loadU32(view, off.stage1d18),
    overlaySwapFlag: view.getUint8(off.overlaySwapFlag),
    overlayScaleXBits: loadU32(view, off.overlayScaleX),
    overlayScaleYBits: loadU32(view, off.overlayScaleY),
    overlayDrawFlag: view.getUint8(off.overlayDrawFlag),
    treeHead7308: loadU32(view, off.treeHead),
    treeCount730c: loadU32(view, off.treeCount),
    treeCleared: 0,
    overlayWritten: 0,
    flagCleared: 0,
  };
}

/** Marker-gated sparse apply; untouched markers leave every byte alone. */
export function gameRenderApply(state, view, byteLength) {
  if (state == null || view == null ||
      (byteLength >>> 0) < GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
    return 0;
  }
  const off = GAME_RENDER_OFF;
  if (u32(state.flagCleared) !== 0) {
    view.setUint8(off.flag11f6, u8(state.flag11f6));
  }
  if (u32(state.treeCleared) !== 0) {
    storeU32(view, off.treeCount, state.treeCount730c);
  }
  if (u32(state.overlayWritten) !== 0) {
    storeU32(view, off.overlayScaleX, state.overlayScaleXBits);
    storeU32(view, off.overlayScaleY, state.overlayScaleYBits);
    const one = 0x3f800000;
    storeU32(view, off.overlayColor + 0x00, one);
    storeU32(view, off.overlayColor + 0x04, one);
    storeU32(view, off.overlayColor + 0x08, one);
    storeU32(view, off.overlayColor + 0x0c, one);
    storeU32(view, off.overlayColor + 0x10, 0);
    storeU32(view, off.overlayColor + 0x14, 0);
    storeU32(view, off.overlayColor + 0x18, 0);
    storeU32(view, off.overlayColor + 0x1c, 0);
    storeU32(view, off.overlayColor + 0x20, 0);
    storeU32(view, off.overlayColor + 0x24, 0);
    storeU32(view, off.overlayColor + 0x28, 0);
  }
  return 1;
}

/** Root entry (after the always-host prolog). */
export function gameRenderStep(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  if (!renderShellMainBodyNeeded(inputs.option2a3c3)) {
    e.bodySkipped = 1;
    return emit(e, GAME_RENDER_CONTINUE_AT_EPILOG_825DE0,
      GAME_RENDER_HOST_EPILOG_825DE0, GAME_RENDER_VA_EPILOG_825DE0, 0, 0, 1);
  }
  return emit(e, GAME_RENDER_CONTINUE_AT_RT_REBIND,
    GAME_RENDER_HOST_RT_REBIND, GAME_RENDER_VA_RT_A18300, 0, 0, 1);
}

export function gameRenderResumeFadePrep(
  state, inputs, fade1b5cBits, fade1b60Bits, fade1b64Bits, fade1b68Bits,
  fadeWord1b6c, flagsG2,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  void fade1b68Bits;
  if (renderShellRoomFlagsBit9(flagsG2)) {
    e.fadeLocalRBits = GAME_RENDER_OVERRIDE_R_BITS;
    e.fadeLocalGBits = GAME_RENDER_OVERRIDE_G_BITS;
    e.fadeLocalBBits = GAME_RENDER_OVERRIDE_B_BITS;
    e.fadeWord50 = 0;
  } else {
    e.fadeLocalRBits = u32(fade1b5cBits);
    e.fadeLocalGBits = u32(fade1b60Bits);
    e.fadeLocalBBits = u32(fade1b64Bits);
    e.fadeWord50 = u32(fadeWord1b6c);
  }
  return emit(e, GAME_RENDER_CONTINUE_AT_BIND_A1DFD0,
    GAME_RENDER_HOST_BIND_A1DFD0, GAME_RENDER_VA_BIND_A1DFD0, 0, 0, 1);
}

export function gameRenderResumeFadeStage(
  state, inputs, stage1d18After, game1204Bits, game1208Bits, flagsG10,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.gC79904Value = (u32(inputs.datC798e4) & GAME_RENDER_C798E4_TEST_BIT) === 0
    ? GAME_RENDER_C79904_BIT_CLEAR_VALUE
    : GAME_RENDER_C79904_BIT_SET_VALUE;
  e.gC79900Applied = 1;
  const cam = renderShellCameraOffset(
    bitsToF32(game1204Bits), bitsToF32(game1208Bits),
    bitsToF32(inputs.mgrCamX2650cBits), bitsToF32(inputs.mgrCamY26510Bits),
  );
  e.cameraXBits = f32ToBits(cam.outX);
  e.cameraYBits = f32ToBits(cam.outY);
  if (renderShellStage39HostNeeded(stage1d18After)) {
    return emit(e, GAME_RENDER_CONTINUE_AT_STAGE39,
      GAME_RENDER_HOST_STAGE39_83A1B0, GAME_RENDER_VA_STAGE39_83A1B0,
      GAME_RENDER_RECV_STAGE39, 0, 1);
  }
  if (!renderShellNon39FadeBlockNeeded(flagsG10)) {
    return emitRecapture(e, GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY);
  }
  return emitRecapture(e, GAME_RENDER_CONTINUE_AT_FADE_POLLS);
}

export function gameRenderResumeFadePolls(state, inputs, gameModeEd55) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const m = pollMasks(inputs);
  e.pollABits = m.pollA;
  e.pollBBits = m.pollB;
  const mgrOr = renderShellFadeMgrWordsOr(inputs.mgr26550, inputs.mgrWord0c) >>> 0;
  const selects = renderShellFadePollSelectsOne(mgrOr, m.pollA, m.pollB) ? 1 : 0;
  e.pollSelectsOne = selects;
  const base = renderShellFadeBase(
    selects, bitsToF32(inputs.mgrFade2651cBits), bitsToF32(inputs.mgrFade26518Bits),
  );
  e.fadeBaseBits = f32ToBits(base);
  if (renderShellFadeBoostModeOpen(gameModeEd55)) {
    e.fadeBoost = 1;
    return emitRecapture(e, GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
  }
  return emitRecapture(e, GAME_RENDER_CONTINUE_AT_BOOST_74EFD0);
}

export function gameRenderBoost74efd0Al(inputs) {
  if (inputs == null) return 0;
  return boost74efd0Al(inputs);
}

export function gameRenderResumeBoost74efd0(state, inputs, mgr1830cAfter) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  if (boost74efd0Al(inputs) !== 0 && u32(mgr1830cAfter) === 1) {
    e.fadeBoost = 1;
    return emitRecapture(e, GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
  }
  return emit(e, GAME_RENDER_CONTINUE_AT_BOOST_827BC0,
    GAME_RENDER_HOST_BOOST_827BC0, GAME_RENDER_VA_BOOST_827BC0, 0, 0, 1);
}

export function gameRenderResumeBoost827bc0(state, inputs, al827bc0) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.fadeBoost = u8(al827bc0) !== 0 ? 1 : 0;
  return emitRecapture(e, GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
}

export function gameRenderResumeFadeClose(
  state, inputs, fadeBaseBits, boost, flagsG12, localRBits, localGBits,
  localBBits, dst1b70Bits, dst1b74Bits, dst1b78Bits, dst1b7cBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const boosted = renderShellFadeApplyBoost(bitsToF32(fadeBaseBits), boost ? 1 : 0);
  e.fadeBoost = u32(boost) !== 0 ? 1 : 0;
  const force = renderShellFadeForceFullNeeded(
    i32(inputs.mgrWord0), i32(inputs.mgrWord1), flagsG12,
  ) ? 1 : 0;
  e.fadeForceFull = force;
  const faded = force !== 0 ? bitsToF32(0x3f800000) : boosted;
  const t = renderShellFadeT(faded, bitsToF32(inputs.mgr67734Bits));
  e.fadeTBits = f32ToBits(t);
  e.fadeColorBitsR = f32ToBits(renderShellFadeLerpChannel(
    bitsToF32(localRBits), bitsToF32(dst1b70Bits), t));
  e.fadeColorBitsG = f32ToBits(renderShellFadeLerpChannel(
    bitsToF32(localGBits), bitsToF32(dst1b74Bits), t));
  e.fadeColorBitsB = f32ToBits(renderShellFadeLerpChannel(
    bitsToF32(localBBits), bitsToF32(dst1b78Bits), t));
  e.fadeColorBitsA = u32(dst1b7cBits);
  e.c379b8NextValue = renderShellC379b8Next(
    inputs.datC379b8Snap, u8(inputs.c379b8Byte4), inputs.datC379b8Now) >>> 0;
  e.c379b8StoreApplied = u32(inputs.datC379b8Snap) !== 0 ? 1 : 0;
  return emit(e, GAME_RENDER_CONTINUE_AT_COLOR_BIND,
    GAME_RENDER_HOST_COLOR_9956E0, GAME_RENDER_VA_COLOR_BIND,
    GAME_RENDER_RECV_COLOR_BIND, 0, 1);
}

export function gameRenderResumeTreeErase(
  state, inputs, treeHead7308, headRight4,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.treeHead = u32(treeHead7308);
  e.treePostsApplied = 1;
  emit(e, GAME_RENDER_CONTINUE_AT_TREE_ERASE,
    GAME_RENDER_HOST_TREE_ERASE_424540, GAME_RENDER_VA_TREE_ERASE_424540,
    GAME_RENDER_RECV_TREE, 0, 1);
  e.hostArg0 = GAME_RENDER_RECV_TREE;
  e.hostArg1 = u32(headRight4);
  return e;
}

export function gameRenderResumeEntity(state, entryCount, baseSeq, countSeq) {
  const e = gameRenderEmptyEvents();
  e.slots = [];
  if (state == null) return e;
  if (!renderShellEntityLoopNeeded(entryCount)) {
    emitRecapture(e, GAME_RENDER_CONTINUE_AT_GRID_ENTRY);
    return e;
  }
  const bases = baseSeq || [];
  const counts = countSeq || [];
  const seqLen = Math.min(bases.length, counts.length);
  if (seqLen <= 0) {
    e.sampleExhausted = 1;
    emit(e, GAME_RENDER_CONTINUE_AT_ENTITY,
      GAME_RENDER_HOST_ENTITY_806C20, GAME_RENDER_VA_ENTITY_RENDER, 0, 0, 1);
    return e;
  }
  let capped = seqLen;
  if (capped > GAME_RENDER_ENTITY_MAX_STEPS) capped = GAME_RENDER_ENTITY_MAX_STEPS;
  const run = renderShellEntityLoopRun(
    entryCount, bases.slice(0, capped), counts.slice(0, capped),
  );
  const calls = run.calls | 0;
  e.slots = run.slots || [];
  e.entityRenderCalls = u32(calls);
  if (calls > 0 && calls === capped &&
      renderShellEntityLoopStep(calls - 1, counts[calls - 1])) {
    e.sampleExhausted = 1;
    emit(e, GAME_RENDER_CONTINUE_AT_ENTITY,
      GAME_RENDER_HOST_ENTITY_806C20, GAME_RENDER_VA_ENTITY_RENDER, 0, 0, 1);
    e.entityRenderCalls = u32(calls);
    return e;
  }
  emitRecapture(e, GAME_RENDER_CONTINUE_AT_GRID_ENTRY);
  e.entityRenderCalls = u32(calls);
  return e;
}

export function gameRenderResumeGrid(state, gridWAfter, gridHAfter, slots) {
  const e = gameRenderEmptyEvents();
  if (state == null) return e;
  const cells = renderShellGridCellCount(gridWAfter, gridHAfter) | 0;
  e.gridCellCount = cells >>> 0;
  if (!renderShellGridLoopNeeded(cells)) {
    emitRecapture(e, GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
    e.gridCellCount = cells >>> 0;
    return e;
  }
  let needed = cells;
  if (needed > GAME_RENDER_GRID_MAX_STEPS) {
    needed = GAME_RENDER_GRID_MAX_STEPS;
    e.sampleExhausted = 1;
  }
  const list = slots || [];
  let supplied = list.length;
  if (supplied < needed) e.sampleExhausted = 1;
  const n = supplied < needed ? supplied : needed;
  let nonnull = 0;
  let firstSlot = 0;
  for (let i = 0; i < n; i += 1) {
    if (renderShellGridSlotNeedsRender(list[i])) {
      if (nonnull === 0) firstSlot = u32(list[i]);
      nonnull += 1;
    }
  }
  e.gridDrawCalls = u32(nonnull);
  if (e.sampleExhausted !== 0 || nonnull > 0) {
    const exhausted = e.sampleExhausted;
    emit(e, GAME_RENDER_CONTINUE_AT_GRID,
      GAME_RENDER_HOST_GRID_80C810, GAME_RENDER_VA_GRID_DRAW, 0, 0, nonnull);
    e.hostArg0 = firstSlot;
    e.sampleExhausted = exhausted;
    e.gridCellCount = cells >>> 0;
    e.gridDrawCalls = u32(nonnull);
    return e;
  }
  emitRecapture(e, GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
  e.gridCellCount = cells >>> 0;
  return e;
}

export function gameRenderResumeOverlayGate(
  state, inputs, gameModeEf08, roomType10, cameraXBits, cameraYBits,
  flag6f49After, flag6eb0After,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  if (!renderShellStageOverlayDualOpen(gameModeEf08, roomType10)) {
    return emitRecapture(e, GAME_RENDER_CONTINUE_AT_AUX_GATE);
  }
  const mgrOr = renderShellFadeMgrWordsOr(inputs.mgr26550, inputs.mgrWord0c) >>> 0;
  const al = renderShell74ea50EvalAlFromPresence(
    inputs.mgrDifficulty269c8,
    inputs.mgrWord0Now,
    inputs.mgrWord1Now,
    inputs.mgrFlags2654c,
    mgrOr,
    presenceA(inputs),
    inputs.mgrMode26584,
    i32(inputs.mgrWord0Now),
    presenceB(inputs),
    bitset64(inputs),
  );
  if (!renderShellStageOverlayHostOpen(al ? 1 : 0)) {
    return emitRecapture(e, GAME_RENDER_CONTINUE_AT_AUX_GATE);
  }
  const vec = renderShell812d00Compute(
    inputs.roomDesc, inputs.roomDescNested, inputs.roomType48,
    inputs.roomWidthC, bitsToF32(inputs.roomAabb14Bits),
    bitsToF32(inputs.roomAabb18Bits), bitsToF32(inputs.roomAabb1cBits),
    bitsToF32(inputs.roomAabb20Bits),
  );
  const scale = renderShellStageOverlayScale();
  const fx = renderShellAf0917Floor(renderShellStageOverlayPreFloorX(
    bitsToF32(inputs.datC78dc4Bits), vec.x, scale));
  const fy = renderShellAf0917Floor(renderShellStageOverlayPreFloorY(
    bitsToF32(inputs.datC78edcBits), vec.y, scale));
  const pos = renderShellStageOverlayDrawPos(
    bitsToF32(cameraXBits), bitsToF32(cameraYBits), fx, fy, scale,
  );
  e.overlayPosXBits = f32ToBits(pos.x);
  e.overlayPosYBits = f32ToBits(pos.y);
  e.overlayScaleXBits = u32(inputs.datC3793cBits);
  e.overlayScaleYBits = u32(inputs.datC37940Bits);
  e.overlayStoresApplied = 1;
  const plan = renderShellStageOverlayDrawPlan(
    u8(flag6f49After), u8(flag6eb0After),
  );
  if (plan === RENDER_SHELL_OVERLAY_PLAN_SKIP) {
    return emitRecapture(e, GAME_RENDER_CONTINUE_AT_AUX_GATE);
  }
  const offs = renderShellStageOverlayAnimOffsets(plan);
  e.overlayFirstOff = u32(offs.firstOff);
  e.overlaySecondOff = u32(offs.secondOff);
  emit(e, GAME_RENDER_CONTINUE_AT_ANIM_RENDER,
    GAME_RENDER_HOST_ANIM_40A030, GAME_RENDER_VA_ANIM_40A030,
    e.overlayFirstOff, 0, 2);
  e.hostArg0 = GAME_RENDER_VA_OVERLAY_CLAMP;
  e.hostArg1 = GAME_RENDER_VA_OVERLAY_CLAMP;
  return e;
}

export function gameRenderResumeAuxGate(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  if (!renderShellOptionAuxOpen(inputs.option2a3c5)) {
    emit(e, GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
      GAME_RENDER_HOST_RT_POP_A19180, GAME_RENDER_VA_RT_A19180,
      GAME_RENDER_VA_RT_MANAGER_C798E0, 0, 1);
    e.hostArg0 = 1;
    return e;
  }
  if (!renderShellManagerFadePollNeeded(bitsToF32(inputs.mgrFade26518Bits))) {
    emit(e, GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
      GAME_RENDER_HOST_GET_STAGE_ID_738470, GAME_RENDER_VA_GET_STAGE_ID,
      inputs.datC71678, 0, 0);
    return e;
  }
  return emitRecapture(e, GAME_RENDER_CONTINUE_AT_AUX_POLLS);
}

export function gameRenderResumeAuxPolls(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const gate39 = renderShell6f9400Gate39(
    inputs.mgrMode26584, i32(inputs.mgrWord0Now), inputs.mgrDifficulty269c8,
  );
  const pollA = renderShell6f9400Mask(presenceA(inputs), gate39) >>> 0;
  const pollB = renderShell6f95a0Mask(presenceB(inputs)) >>> 0;
  e.pollABits = pollA;
  e.pollBBits = pollB;
  const mgrOr = renderShellFadeMgrWordsOr(inputs.mgr26550, inputs.mgrWord0c) >>> 0;
  const selects = renderShellFadePollSelectsOne(mgrOr, pollA, pollB) ? 1 : 0;
  e.pollSelectsOne = selects;
  if (renderShellAux817830Needed(1, selects)) {
    emit(e, GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
      GAME_RENDER_HOST_GET_STAGE_ID_738470, GAME_RENDER_VA_GET_STAGE_ID,
      inputs.datC71678, 0, 0);
    e.pollSelectsOne = selects;
    return e;
  }
  emit(e, GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
    GAME_RENDER_HOST_RT_POP_A19180, GAME_RENDER_VA_RT_A19180,
    GAME_RENDER_VA_RT_MANAGER_C798E0, 0, 1);
  e.hostArg0 = 1;
  e.pollSelectsOne = selects;
  return e;
}

export function gameRenderResume817830Gate(
  state, inputs, stageIdAfter, slotValueAfter, roomWord54After,
  roomFlags44After, fade7240After,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  if (u32(slotValueAfter) === 0) {
    e.bodySkipped = 1;
    emit(e, GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
      GAME_RENDER_HOST_RT_POP_A19180, GAME_RENDER_VA_RT_A19180,
      GAME_RENDER_VA_RT_MANAGER_C798E0, 0, 1);
    e.hostArg0 = 1;
    return e;
  }
  const stage = u32(stageIdAfter);
  const specialStage = (stage === 4 || stage === 5 || stage === 6 ||
    stage === 0x1b || stage === 0x1c) ? 1 : 0;
  const roomSpecial = (specialStage !== 0 && i32(roomWord54After) >= 0 &&
    ((u32(roomFlags44After) >>> 5) & 1) !== 0) ? 1 : 0;
  const fade = bitsToF32(fade7240After);
  const fadeGt0 = fade > 0 ? 1 : 0;
  if (fadeGt0 !== 0 || roomSpecial !== 0) {
    emit(e, GAME_RENDER_CONTINUE_AT_TRUNK_817830,
      GAME_RENDER_HOST_BODY_817830_TRUNK, GAME_RENDER_VA_BODY_817830, 0, 0, 1);
    e.hostArg0 = 1;
    return e;
  }
  e.bodySkipped = 1;
  emit(e, GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
    GAME_RENDER_HOST_RT_POP_A19180, GAME_RENDER_VA_RT_A19180,
    GAME_RENDER_VA_RT_MANAGER_C798E0, 0, 1);
  e.hostArg0 = 1;
  return e;
}

export function gameRender817830SlotOffset(stage) {
  return Math.imul(u32(stage), 0x13c) >>> 0;
}

function prefixSpecialBaseT(stageId, roomWord54, roomFlags44) {
  const stage = u32(stageId);
  const specialStage = (stage === 4 || stage === 5 || stage === 6 ||
    stage === 0x1b || stage === 0x1c) ? 1 : 0;
  if (specialStage === 0 || i32(roomWord54) < 0 ||
      ((u32(roomFlags44) >>> 5) & 1) === 0) {
    return 0;
  }
  const raw = fr(fr(i32(roomWord54)) / F32_THIRTY);
  const clamped = raw > F32_ONE ? F32_ONE : raw;
  return clamped > 0 ? clamped : 0;
}

function prefixBlend(baseT, fade7240) {
  const fade = bitsToF32(fade7240);
  if (!(fade > 0)) return baseT;
  return fr(baseT + fr(fr(F32_ONE - baseT) * fade));
}

function prefixScales(mgrWord) {
  const frame = fr(i32(mgrWord));
  const mul01 = fr(frame * F32_HUNDREDTH);
  const mul05 = fr(frame * F32_HALF);
  const mul005 = fr(mul05 * F32_TENTH);
  return { tail28: f32ToBits(mul01), tail18: f32ToBits(mul05), tail80: f32ToBits(mul005) };
}

function prefixTailStartVa(roomDescType48) {
  const adj = (u32(roomDescType48) - 9) >>> 0;
  return adj <= 3 ? GAME_RENDER_VA_BODY_817830_LROOM : GAME_RENDER_VA_BODY_817830_OTHER;
}

function emitTailHost(e) {
  if (e.tailStartVa === GAME_RENDER_VA_BODY_817830_LROOM) {
    emit(e, GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830,
      GAME_RENDER_HOST_GETLROOM_81F8B0, GAME_RENDER_VA_GETLROOM, 0, 0, 1);
    e.hostArg0 = GAME_RENDER_VA_BODY_817830_PACK;
    return e;
  }
  return emit(e, GAME_RENDER_CONTINUE_AT_TAIL_817830,
    GAME_RENDER_HOST_BODY_817830_TAIL, e.tailStartVa, 0, 0, 1);
}

export function gameRenderResume817830Prefix(
  state, inputs, stageIdAfter, roomWord54After, roomFlags44After,
  fade7240After, mgr264f8After, treeHeadC379bcAfter, boundIsnilAfter,
  boundKeyAfter, boundPtrAfter, roomDescType48After,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const baseT = prefixSpecialBaseT(stageIdAfter, roomWord54After, roomFlags44After);
  e.tailBlend398Bits = f32ToBits(prefixBlend(baseT, fade7240After));
  const sc = prefixScales(mgr264f8After);
  e.tailScale28Bits = sc.tail28;
  e.tailScale18Bits = sc.tail18;
  e.tailScale80Bits = sc.tail80;
  const key = GAME_RENDER_817830_KAGE_HASH >>> 0;
  const found = ((u8(boundIsnilAfter) === 0) &&
    (key >>> 0) >= u32(boundKeyAfter) &&
    u32(boundPtrAfter) !== u32(treeHeadC379bcAfter)) ? 1 : 0;
  e.a14050Found = found;
  e.tailStartVa = prefixTailStartVa(roomDescType48After);
  if (found === 0) {
    return emitTailHost(e);
  }
  return emit(e, GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830,
    GAME_RENDER_HOST_NONE, 0, 0, 0, 0);
}

export function gameRenderResume817830A14050Value(
  state, inputs, stageIdAfter, roomWord54After, roomFlags44After,
  fade7240After, mgr264f8After, roomDescType48After, valueAt14After,
  byteAtValuePlus4After,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const store = (u32(valueAt14After) !== 0 &&
    (u8(byteAtValuePlus4After) & 1) !== 0) ? 1 : 0;
  if (store !== 0) {
    e.c379b8NextValue = u32(valueAt14After);
    e.c379b8StoreApplied = 1;
  }
  const baseT = prefixSpecialBaseT(stageIdAfter, roomWord54After, roomFlags44After);
  e.tailBlend398Bits = f32ToBits(prefixBlend(baseT, fade7240After));
  const sc = prefixScales(mgr264f8After);
  e.tailScale28Bits = sc.tail28;
  e.tailScale18Bits = sc.tail18;
  e.tailScale80Bits = sc.tail80;
  e.tailStartVa = prefixTailStartVa(roomDescType48After);
  return emitTailHost(e);
}

export function gameRender817830KageHash() {
  return GAME_RENDER_817830_KAGE_HASH >>> 0;
}

export function gameRenderResume817830LroomPack(
  state, inputs, roomPtrAfter, nestedDescPtrAfter, roomType48After,
  scaleA8Bits, mul005Bits, mul05Bits, offsetCBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  let quadCount = GAME_RENDER_LROOM_QUAD_COUNT;
  let quadInits = 0;
  for (;;) {
    const step = renderShell817830LroomLoopStep(quadCount);
    quadCount = step.countAfter >>> 0;
    quadInits += 1;
    renderShell817830LroomQuadPost(0, 0);
    if (!step.more) break;
  }
  e.lroomQuadInits = u32(quadInits);
  let pairCount = GAME_RENDER_LROOM_PAIR_COUNT;
  let pairInits = 0;
  for (;;) {
    const step = renderShell817830LroomLoopStep(pairCount);
    pairCount = step.countAfter >>> 0;
    pairInits += 1;
    renderShell817830LroomPairAdvance(0);
    if (!step.more) break;
  }
  e.lroomPairInits = u32(pairInits);
  if (!renderShell817830RoomDescOpen(roomPtrAfter, nestedDescPtrAfter)) {
    e.lroomNextVa = GAME_RENDER_VA_LROOM_JOIN_A975;
    return emit(e, GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
      GAME_RENDER_HOST_BODY_817830_TAIL, e.lroomNextVa, 0, 0, 1);
  }
  if (!renderShell817830RoomTypeEq9(i32(roomType48After))) {
    e.lroomNextVa = GAME_RENDER_VA_LROOM_JOIN_9394;
    return emit(e, GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
      GAME_RENDER_HOST_BODY_817830_TAIL, e.lroomNextVa, 0, 0, 1);
  }
  const cell0 = renderShell817830Type9Cell0(
    bitsToF32(scaleA8Bits), bitsToF32(mul005Bits),
    bitsToF32(mul05Bits), bitsToF32(offsetCBits),
  );
  e.type9Cell0HalfABits = f32ToBits(cell0.halfA);
  e.type9Cell0XBits = f32ToBits(cell0.outX);
  e.type9Cell0YBits = f32ToBits(cell0.outY);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A10690;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830,
    GAME_RENDER_HOST_A10690, GAME_RENDER_VA_A10690, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A10690;
  return e;
}

export function gameRenderResume817830Type9Cell1(
  state, inputs, scale70Bits, halfABits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const c = renderShell817830Type9Cell1(
    bitsToF32(scale70Bits), bitsToF32(halfABits), bitsToF32(mul05Bits),
  );
  e.type9Cell1HalfBBits = f32ToBits(c.halfB);
  e.type9Cell1SumBits = f32ToBits(c.outSum);
  e.type9Cell1Y2Bits = f32ToBits(c.outY2);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A10690_NEXT;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830,
    GAME_RENDER_HOST_A10690, GAME_RENDER_VA_A10690, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A10690_NEXT;
  return e;
}

export function gameRenderResume817830Type9Cell2(
  state, inputs, halfBBits, offsetAcBits, mul05Bits, halfABits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const halfB = bitsToF32(halfBBits);
  const outX2 = fr(halfB + bitsToF32(offsetAcBits));
  const outY3 = fr(halfB + bitsToF32(mul05Bits));
  const outSum2 = fr(outY3 + bitsToF32(halfABits));
  e.type9Cell2X2Bits = f32ToBits(outX2);
  e.type9Cell2Y3Bits = f32ToBits(outY3);
  e.type9Cell2Sum2Bits = f32ToBits(outSum2);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A10690_CELL2;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830,
    GAME_RENDER_HOST_A10690, GAME_RENDER_VA_A10690, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A10690_CELL2;
  return e;
}

export function gameRenderResume817830Type9Cell3(
  state, inputs, scale6cBits, offsetA8Bits, y3Bits, offsetAcBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const outX3 = fr(bitsToF32(scale6cBits) + bitsToF32(offsetA8Bits));
  const outY4 = fr(bitsToF32(y3Bits) + bitsToF32(offsetAcBits));
  const outSum3 = fr(outX3 + bitsToF32(mul05Bits));
  e.type9Cell3X3Bits = f32ToBits(outX3);
  e.type9Cell3Y4Bits = f32ToBits(outY4);
  e.type9Cell3Sum3Bits = f32ToBits(outSum3);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A10690_CELL3;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830,
    GAME_RENDER_HOST_A10690, GAME_RENDER_VA_A10690, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A10690_CELL3;
  return e;
}

export function gameRenderResume817830Type9Cell4(
  state, inputs, offsetA8Bits, scale70Bits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const offsetA8 = bitsToF32(offsetA8Bits);
  const outDbl = fr(offsetA8 + offsetA8);
  const outAc = fr(outDbl + bitsToF32(scale70Bits));
  const outSum4 = fr(outAc + bitsToF32(mul05Bits));
  const outY5 = fr(fr(bitsToF32(mul05Bits) + offsetA8) + bitsToF32(scale70Bits));
  e.type9Cell4DblBits = f32ToBits(outDbl);
  e.type9Cell4AcBits = f32ToBits(outAc);
  e.type9Cell4Sum4Bits = f32ToBits(outSum4);
  e.type9Cell4Y5Bits = f32ToBits(outY5);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A10690_CELL4;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830,
    GAME_RENDER_HOST_A10690, GAME_RENDER_VA_A10690, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A10690_CELL4;
  return e;
}

export function gameRenderResume817830Type9Cell5(
  state, inputs, scale6cBits, offset10Bits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const scale6c = bitsToF32(scale6cBits);
  const outDbl = fr(scale6c + scale6c);
  const outAc = fr(outDbl + bitsToF32(offset10Bits));
  const outSum5 = fr(outAc + bitsToF32(mul05Bits));
  const outY6 = fr(fr(bitsToF32(mul05Bits) + bitsToF32(offset10Bits)) + scale6c);
  e.type9Cell5DblBits = f32ToBits(outDbl);
  e.type9Cell5AcBits = f32ToBits(outAc);
  e.type9Cell5Sum5Bits = f32ToBits(outSum5);
  e.type9Cell5Y6Bits = f32ToBits(outY6);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A10690_CELL5;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830,
    GAME_RENDER_HOST_A10690, GAME_RENDER_VA_A10690, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A10690_CELL5;
  return e;
}

export function gameRenderResume817830Type9Cell6(
  state, inputs, halfA94Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9Cell6XBits = u32(halfA94Bits);
  e.type9Cell6YBits = u32(offsetCBits);
  e.type9Cell6AngleBits = u32(scale28Bits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_CELL6;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_CELL6;
  return e;
}

function a102e0Pack(eaxXBits, eaxYBits, mulBits, yField, xField, nextVa, nextCont) {
  const e = gameRenderEmptyEvents();
  const outX = fr(bitsToF32(mulBits) + bitsToF32(eaxXBits));
  const outY = fr(bitsToF32(eaxYBits) + 0);
  e[xField] = f32ToBits(outX);
  e[yField] = f32ToBits(outY);
  e.lroomNextVa = nextVa;
  emit(e, nextCont, GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = nextVa;
  return e;
}

export function gameRenderResume817830Type9A102e00(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  if (state == null || inputs == null) return gameRenderEmptyEvents();
  return a102e0Pack(eaxXBits, eaxYBits, mul05Bits,
    "type9A102e0YBits", "type9A102e0XBits",
    GAME_RENDER_VA_TYPE9_A102E0_NEXT,
    GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830);
}

export function gameRenderResume817830Type9A102e01(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  if (state == null || inputs == null) return gameRenderEmptyEvents();
  return a102e0Pack(eaxXBits, eaxYBits, mul05Bits,
    "type9A102e01YBits", "type9A102e01XBits",
    GAME_RENDER_VA_TYPE9_A102E0_1,
    GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830);
}

export function gameRenderResume817830Type9A102e02(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  if (state == null || inputs == null) return gameRenderEmptyEvents();
  return a102e0Pack(eaxXBits, eaxYBits, mul05Bits,
    "type9A102e02YBits", "type9A102e02XBits",
    GAME_RENDER_VA_TYPE9_A102E0_2,
    GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830);
}

export function gameRenderResume817830Type9A102e03(
  state, inputs, eaxXBits, eaxYBits, mul14Bits,
) {
  if (state == null || inputs == null) return gameRenderEmptyEvents();
  const e = gameRenderEmptyEvents();
  const outX = fr(bitsToF32(mul14Bits) + bitsToF32(eaxXBits));
  const outY = fr(bitsToF32(eaxYBits) + 0);
  e.type9A102e03XBits = f32ToBits(outX);
  e.type9A102e03YBits = f32ToBits(outY);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0;
  return e;
}

export function gameRenderResume817830Type9A106e0(
  state, inputs, offset9cBits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e0XBits = u32(offset9cBits);
  e.type9A106e0YBits = u32(offsetCBits);
  e.type9A106e0AngleBits = u32(scale28Bits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_3;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_3;
  return e;
}

/** After AT_TYPE9_A102E0_4_817830 (host a102e0 @ 0x00818122 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x14] mul_14.
 * Independent pack y=ret_y+0 -> [esp+0x38], x=mul_14+ret_x -> [esp+0x34].
 * Next host is sixth type-9 a102e0 at 0x0081817c. Pack math is not reopened. */
export function gameRenderResume817830Type9A102e04(
  state, inputs, eaxXBits, eaxYBits, mul14Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e04XBits = addssBits(mul14Bits, eaxXBits);
  e.type9A102e04YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_4;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_4;
  return e;
}

/** After AT_TYPE9_A102E0_5_817830 (host a102e0 @ 0x0081817c ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (after next-host push ecx; resume-time [esp+0x14]).
 * Independent pack y=ret_y+0, x=mul_05+ret_x.
 * Next host is the seventh type-9 a102e0 @ 0x008181d2 (v20 typed
 * HOST_A102E0, AT_TYPE9_A102E0_6_817830). Dest-copy 0x008180b9..0x008180f3
 * stays host. Host a106e0 stays host. Do not reopen 0x00818122. */
export function gameRenderResume817830Type9A102e05(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e05XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e05YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_5;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_5;
  return e;
}

/** After AT_TYPE9_A102E0_6_817830 (host a102e0 @ 0x008181d2 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (after next-host push ecx; resume-time [esp+0x14]).
 * Independent pack y=ret_y+0, x=mul_05+ret_x.
 * Next host is the eighth type-9 a102e0 @ 0x00818228 (v21 typed
 * HOST_A102E0, AT_TYPE9_A102E0_7_817830). Dest-copy 0x008180b9..0x008180f3
 * stays host. Host a106e0 stays host. Do not reopen 0x00818122 or
 * 0x0081817c. */
export function gameRenderResume817830Type9A102e06(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e06XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e06YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_6;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_6;
  return e;
}

/** After AT_TYPE9_A102E0_7_817830 (host a102e0 @ 0x00818228 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x14] mul_05
 * (this flow has no next-host push before the mul read; resume-time
 * slot is [esp+0x14] directly).
 * Independent pack y=ret_y+0, x=mul_05+ret_x.
 * Next host is the second type-9 a106e0 @ 0x00818273 (v22 typed
 * HOST_A106E0, AT_TYPE9_A106E0_2_817830). Dest-copy 0x00818278..0x008182b2
 * stays host. Do not reopen 0x00818122, 0x0081817c or 0x008181d2. */
export function gameRenderResume817830Type9A102e07(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e07XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e07YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_2;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_2;
  return e;
}

/** After AT_TYPE9_A106E0_2_817830 (host a106e0 @ 0x00818273 ran). POST-
 * A106E0 recaptures: [esp+0x40] offset_40, [esp+0xc] offset_c,
 * [esp+0x28] scale_28 (identity movss stores to the next-host arg
 * frame [esp+0x50]/[esp+0x54]/[esp]).
 * Byte-gate: mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140] —
 * the widened value is (1u & 0xff) as uint32_t, NO uint8_t field.
 * Dest-copy 0x00818278..0x008182b2 stays host.
 * Next host is the ninth type-9 a102e0 @ 0x008182de (v23 typed
 * HOST_A102E0, AT_TYPE9_A102E0_8_817830). */
export function gameRenderResume817830Type9A106e02(
  state, inputs, offset40Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e02XBits = u32(offset40Bits);
  e.type9A106e02YBits = u32(offsetCBits);
  e.type9A106e02AngleBits = u32(scale28Bits);
  e.type9A106e02GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_7;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_7;
  return e;
}

/** After AT_TYPE9_A102E0_8_817830 (host a102e0 @ 0x008182de ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x14] mul_05
 * (no next-host push before the mul read; resume-time slot is
 * [esp+0x14] directly — same shape as v21).
 * Independent pack y=ret_y+0, x=mul_05+ret_x.
 * v24: now emits the typed AT_TYPE9_A102E0_9_817830 (48) to the tenth
 * a102e0 @ 0x00818338 (hostArg0 / lroomNextVa = 0x00818338). */
export function gameRenderResume817830Type9A102e08(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e08XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e08YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_8;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_8;
  return e;
}

/** After AT_TYPE9_A102E0_9_817830 (host a102e0 @ 0x00818338 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (instruction operand AFTER the next-host push ecx at 0x00818340;
 * resume-time slot is [esp+0x14] — the same after-push shape as v20,
 * and the pre-push slot is the same [esp+0x14] the v21/v23 no-push
 * flows used).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x64],
 * x → [esp+0x60] (post-push offsets; the resume writes the bits, the
 * host glue places them). Identity arg-setup 0x00818373..0x0081838a
 * ([esp+0x40]→[esp+0x68], [esp+0x28]→[esp] angle, push eax) stays
 * host. The zero store [esp+0x6c] is host arg-setup.
 * v25: now emits the typed AT_TYPE9_A102E0_10_817830 (49) to the
 * eleventh a102e0 @ 0x0081838b (hostArg0 / lroomNextVa = 0x0081838b). */
export function gameRenderResume817830Type9A102e09(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e09XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e09YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_9;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_9;
  return e;
}

/** After AT_TYPE9_A102E0_10_817830 (host a102e0 @ 0x0081838b ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (instruction operand AFTER the next-host push ecx at 0x00818393;
 * resume-time slot is [esp+0x14] — the same after-push shape as v24).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x98],
 * x → [esp+0x94] (post-push offsets; the resume writes the bits, the
 * host glue places them). Identity arg-setup 0x008183cc..0x008183e6
 * ([esp+0x9c]→[esp+0x10], [esp+0x28]→[esp] angle, push eax) stays
 * host. The zero store [esp+0x14] is host arg-setup.
 * v26: now emits the typed AT_TYPE9_A102E0_11_817830 (50) to the
 * twelfth a102e0 @ 0x008183e7 (hostArg0 / lroomNextVa = 0x008183e7). */
export function gameRenderResume817830Type9A102e010(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e010XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e010YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_10;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_10;
  return e;
}

/** After AT_TYPE9_A102E0_11_817830 (host a102e0 @ 0x008183e7 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x14] mul_05
 * (NO next-host push BEFORE the mul read in this flow — the first push
 * is the arg lea at 0x0081840d, AFTER the recapture; resume-time slot
 * [esp+0x14] directly, the same no-push shape as v23).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x7c],
 * x → [esp+0x74] (post-push offsets; the resume writes the bits, the
 * host glue places them). Identity arg-setup 0x00818409..0x0081842b
 * (three lea/push arg pairs feeding the third a106e0 seam) stays host.
 * v27: now emits the typed AT_TYPE9_A106E0_3_817830 (51) to the third
 * a106e0 @ 0x0081842c (hostArg0 / lroomNextVa = 0x0081842c); the seam's
 * dest-copy cluster 0x00818431..0x0081846d stays host. */
export function gameRenderResume817830Type9A102e011(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e011XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e011YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_3;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_3;
  return e;
}

/** After AT_TYPE9_A106E0_3_817830 (host a106e0 @ 0x0081842c ran). POST-
 * A106E0 recaptures: [esp+0x48] offset_48, [esp+0xc] offset_c,
 * [esp+0x28] scale_28 (identity movss stores to the next-host arg
 * frame [esp+0x50]/[esp+0x54]/[esp]).
 * Byte-gate: mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140] —
 * the widened value is (1u & 0xff) as uint32_t, NO uint8_t field.
 * Dest-copy 0x00818431..0x0081846d stays host.
 * v28: now emits the typed AT_TYPE9_A102E0_12_817830 (52) to the
 * thirteenth a102e0 @ 0x00818497 (hostArg0 / lroomNextVa =
 * 0x00818497). */
export function gameRenderResume817830Type9A106e03(
  state, inputs, offset48Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e03XBits = u32(offset48Bits);
  e.type9A106e03YBits = u32(offsetCBits);
  e.type9A106e03AngleBits = u32(scale28Bits);
  e.type9A106e03GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_11;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_11;
  return e;
}

/** After AT_TYPE9_A106E0_4_817830 (host a106e0 @ 0x008185e8 ran; the
 * fourth a106e0 seam closes the third seam group). POST-A106E0
 * recaptures: [esp+0xa8] offset_a8, [esp+8] offset_c, [esp+0x28]
 * scale_28 (identity movss stores to the next-host arg frame
 * [esp+0x4c]/[esp+0x54]/[esp]; x stored BEFORE the next-host push).
 * Byte-gate: mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140] —
 * the widened value is (1u & 0xff) as uint32_t, NO uint8_t field.
 * Dest-copy 0x008185ed..0x0081861b stays host.
 * v68 conversion: the seam now emits the remain AT_LROOM_REMAIN_
 * 817830 (30); hostArg0 / lroomNextVa stay the seventeenth a102e0
 * @ 0x00818656. */
export function gameRenderResume817830Type9A106e04(
  state, inputs, offsetA8Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e04XBits = u32(offsetA8Bits);
  e.type9A106e04YBits = u32(offsetCBits);
  e.type9A106e04AngleBits = u32(scale28Bits);
  e.type9A106e04GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_16;
  emit(e, GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_16;
  return e;
}

/** After AT_TYPE9_A102E0_12_817830 (host a102e0 @ 0x00818497 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (instruction operand AFTER the next-host push ecx at 0x0081849f;
 * resume-time slot is [esp+0x14] — the same after-push shape as v24/v25).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x3c],
 * x → [esp+0x38] (post-push offsets; the resume writes the bits, the
 * host glue places them). Identity arg-setup 0x008184ca..0x008184e8
 * ([esp+0x40]→[esp+0x58], [esp+0xc]→[esp+0x5c], [esp+0x28]→[esp]
 * angle, push eax) stays host.
 * v68 conversion: lroomNextVa now points at the THIRTEENTH a102e0
 * @ 0x00818497 (was the fourteenth @ 0x008184ee); the typed
 * AT_TYPE9_A102E0_13_817830 (53) emission is unchanged. */
export function gameRenderResume817830Type9A102e012(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e012XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e012YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_11;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_12;
  return e;
}

/** After AT_TYPE9_A102E0_13_817830 (host a102e0 @ 0x008184ee ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (instruction operand AFTER the next-host push ecx at 0x008184f6;
 * resume-time slot is [esp+0x14] — the same after-push shape as v24/v25).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0xa0],
 * x → [esp+0x9c] (post-push offsets; the resume writes the bits, the
 * host glue places them). Zero store [esp+0x6c] and identity arg-setup
 * 0x0081852f..0x00818545 ([esp+0x48]→[esp+0x68], [esp+0x28]→[esp] angle,
 * push eax) stay host.
 * Next remain is the fifteenth type-9 a102e0 @ 0x00818547 (kind 30,
 * LROOM_REMAIN; not peeled in this ABI).
 * v30: now emits the typed AT_TYPE9_A102E0_14_817830 (54) to the
 * fifteenth a102e0 @ 0x00818547 (hostArg0 / lroomNextVa =
 * 0x00818547). */
export function gameRenderResume817830Type9A102e013(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e013XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e013YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_13;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_13;
  return e;
}

/** After AT_TYPE9_A102E0_14_817830 (host a102e0 @ 0x00818547 ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18] mul_05
 * (instruction operand AFTER the next-host push ecx at 0x0081854f;
 * resume-time slot is [esp+0x14] — the same after-push shape as v24/v25).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x64],
 * x → [esp+0x60] (post-push offsets; the resume writes the bits, the
 * host glue places them; identical store offsets to the v24 tenth pack).
 * Zero store [esp+0x14] and identity arg-setup 0x00818582..0x00818598
 * ([esp+0x40]→[esp+0x10], [esp+0x28]→[esp] angle, push eax) stay host.
 * Next remain is the sixteenth type-9 a102e0 @ 0x0081859a (kind 30,
 * LROOM_REMAIN; not peeled in this ABI).
 * v31: now emits the typed AT_TYPE9_A102E0_15_817830 (55) to the
 * sixteenth a102e0 @ 0x0081859a (hostArg0 / lroomNextVa =
 * 0x0081859a). */
export function gameRenderResume817830Type9A102e014(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e014XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e014YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_14;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_14;
  return e;
}

/** After AT_TYPE9_A102E0_15_817830 (host a102e0 @ 0x0081859a ran). POST-
 * A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (NO
 * next-host push BEFORE this read — the first push is the arg lea at
 * 0x008185c0, AFTER the recaptures; resume-time slot [esp+0x14]
 * directly, the same no-push shape as v23/v26).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores x → [esp+0x98],
 * y → [esp+0xa0] (post-push offsets; the resume writes the bits, the
 * host glue places them; x stored BEFORE y). Four lea/push arg pairs
 * 0x008185bc..0x008185e7 feeding the fourth a106e0 seam stay host.
 * Next remain is the fourth type-9 a106e0 seam @ 0x008185e8 (kind 30,
 * LROOM_REMAIN; not peeled in this ABI).
 * v32: now emits the typed AT_TYPE9_A106E0_4_817830 (56) to the fourth
 * a106e0 @ 0x008185e8 (hostArg0 / lroomNextVa = 0x008185e8); the seam's
 * dest-copy cluster 0x008185ed..0x0081861b stays host. */
export function gameRenderResume817830Type9A102e015(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e015XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e015YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_4;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_4;
  return e;
}

/** After AT_TYPE9_A102E0_16_817830 (host a102e0 @ 0x00818656 ran; the
 * seventeenth type-9 a102e0 pack, first pack of the fourth a106e0 seam
 * group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18]
 * mul_05 (instruction operand AFTER the next-host push ecx at
 * 0x0081865e; resume-time slot is [esp+0x14] — the same after-push shape
 * as v24/v25/v28).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x3c],
 * x → [esp+0x38] (post-push offsets; the resume writes the bits, the
 * host glue places them; identical store offsets to the v28 twelfth
 * pack). Identity arg-setup 0x00818689..0x008186ac ([esp+0x48]→[esp+0x58],
 * [esp+0xc]→[esp+0x5c], [esp+0x28]→[esp] angle, push eax) stays host
 * (v18-style; feeds pack-18).
 * v34: now emits the typed AT_TYPE9_A102E0_17_817830 (58) to the
 * eighteenth type-9 a102e0 @ 0x008186ad (hostArg0 / lroomNextVa =
 * 0x008186ad). */
export function gameRenderResume817830Type9A102e016(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e016XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e016YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_17;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_17;
  return e;
}

/** After AT_TYPE9_A102E0_17_817830 (host a102e0 @ 0x008186ad ran; the
 * eighteenth type-9 a102e0 pack, second pack of the fourth a106e0 seam
 * group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18]
 * mul_05 (instruction operand AFTER the next-host push ecx at
 * 0x008186b5; resume-time slot is [esp+0x14] — the same after-push shape
 * as v24/v25/v28/v33).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0x44],
 * x → [esp+0x40] (post-push offsets; the resume writes the bits, the
 * host glue places them). Zero store [esp+0x6c] (constant arg-setup,
 * same pattern as v24/v25/v29) stays host. Identity arg-setup
 * 0x008186e8..0x00818702 ([esp+0xac]→[esp+0x68], [esp+0x28]→[esp] angle,
 * push eax) stays host (v18-style; feeds pack-19).
 * Next remain is the nineteenth type-9 a102e0 @ 0x00818703 (kind 30,
 * LROOM_REMAIN) at v34.
 * v35: now emits the typed AT_TYPE9_A102E0_18_817830 (59) to the
 * nineteenth a102e0 @ 0x00818703 (hostArg0 / lroomNextVa =
 * 0x00818703). */
export function gameRenderResume817830Type9A102e017(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e017XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e017YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_18;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_18;
  return e;
}

/** After AT_TYPE9_A102E0_18_817830 (host a102e0 @ 0x00818703 ran; the
 * nineteenth type-9 a102e0 pack, third pack of the fourth a106e0 seam
 * group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x18]
 * mul_05 (instruction operand AFTER the next-host push ecx at
 * 0x0081870b; resume-time slot is [esp+0x14] — the same after-push shape
 * as v24/v25/v28/v33/v34).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores y → [esp+0xa0],
 * x → [esp+0x9c] (post-push offsets; the resume writes the bits, the
 * host glue places them; identical store offsets to the v29 fourteenth
 * pack). Zero store [esp+0x14] (constant arg-setup) stays host.
 * Identity arg-setup 0x00818744..0x0081875b ([esp+0x48]→[esp+0x10],
 * [esp+0x28]→[esp] angle, push eax) stays host (v18-style; feeds
 * pack-20).
 * v35: now emits the typed AT_TYPE9_A102E0_19_817830 (60) to the
 * twentieth a102e0 @ 0x0081875c (hostArg0 / lroomNextVa =
 * 0x0081875c). */
export function gameRenderResume817830Type9A102e018(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e018XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e018YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_19;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_19;
  return e;
}

/** After AT_TYPE9_A102E0_19_817830 (host a102e0 @ 0x0081875c ran; the
 * twentieth type-9 a102e0 pack, fourth pack of the fourth a106e0 seam
 * group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y, [esp+0x14]
 * mul_05 (NO next-host push BEFORE this read — the first push is the
 * arg lea at 0x00818782, AFTER the recaptures; resume-time slot
 * [esp+0x14] directly, the same no-push shape as v23/v26/v31).
 * Independent pack y=ret_y+0, x=mul_05+ret_x, stores x → [esp+0x64],
 * y → [esp+0x6c] (post-push offsets; the resume writes the bits, the
 * host glue places them; x stored BEFORE y, same shape as the v31
 * sixteenth pack). Four lea/push arg pairs 0x0081877e..0x008187a0
 * feeding the fifth a106e0 seam stay host.
 * v35: now emits the typed AT_TYPE9_A106E0_5_817830 (61) to the fifth
 * a106e0 @ 0x008187a1 (hostArg0 / lroomNextVa = 0x008187a1; starts the
 * fifth seam group). */
export function gameRenderResume817830Type9A102e019(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e019XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e019YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_5;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_5;
  return e;
}

/** After AT_TYPE9_A106E0_5_817830 (host a106e0 @ 0x008187a1 ran; the
 * fifth a106e0 seam starts the FIFTH a106e0 seam group). POST-A106E0
 * recaptures: [esp+0x30] offset_30, [esp+0xc] offset_c, [esp+0x28]
 * scale_28 — all three instruction operands AFTER the next-host push
 * ecx at 0x008187d5, so the resume-time slots are [esp+0x2c] / [esp+8] /
 * [esp+0x24] (the y slot is the same physical [esp+8] as the a106e0_4
 * seam). Identity movss stores to the next-host arg frame
 * [esp+0x50]/[esp+0x54]/[esp] (all post-push; x stored BEFORE y).
 * Byte-gate: mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140] — the
 * widened value is (1u & 0xff) as uint32_t, NO uint8_t field.
 * Dest-copy 0x008187a6..0x008187cd + the read-back store [esp+0x544]
 * stay host.
 * Next remain is the twenty-first type-9 a102e0 @ 0x0081880c (first
 * pack of the fifth seam group; kind 30 LROOM_REMAIN; not peeled in
 * this ABI). */
export function gameRenderResume817830Type9A106e05(
  state, inputs, offset30Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e05XBits = u32(offset30Bits);
  e.type9A106e05YBits = u32(offsetCBits);
  e.type9A106e05AngleBits = u32(scale28Bits);
  e.type9A106e05GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_20;
  /* v36: the seam now emits the typed AT_TYPE9_A102E0_20_817830 (62)
     to the twenty-first a102e0 @ 0x0081880c (was kind 30 at ABI v35). */
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_20;
  return e;
}

/** After AT_TYPE9_A102E0_20_817830 (host a102e0 @ 0x0081880c ran; the
 * twenty-first type-9 a102e0 pack, FIRST pack of the fifth a106e0 seam
 * group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y,
 * [esp+0x14] mul_05 (the read at 0x00818822 is AFTER the next-host
 * push ecx at 0x00818814; resume-time slot [esp+0x14], after-push
 * shape). Independent pack y=ret_y+0 (xorps normalizer), x=
 * mul_05+ret_x, stores y -> [esp+0x3c] then x -> [esp+0x38]; the
 * identity arg-setup ([esp+0xac]->[esp+0x58], [esp+0xc]->[esp+0x5c],
 * [esp+0x28]->[esp] angle, push eax) stays host (v18-style; feeds
 * pack-22).
 * v36: now emits the typed AT_TYPE9_A102E0_21_817830 (63) to the
 * twenty-second a102e0 @ 0x00818866 (hostArg0 / lroomNextVa =
 * 0x00818866). */
export function gameRenderResume817830Type9A102e020(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e020XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e020YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_21;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_21;
  return e;
}

/** After AT_TYPE9_A102E0_22_817830 (host a102e0 @ 0x00818866 ran; the
 * twenty-second type-9 a102e0 pack, SECOND pack of the fifth a106e0
 * seam group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y,
 * [esp+0x14] mul_05 (read at 0x0081887c is AFTER the next-host push
 * ecx at 0x0081886e; resume-time slot [esp+0x14], after-push shape).
 * Independent pack y=ret_y+0 (xorps normalizer), x=mul_05+ret_x,
 * stores y -> [esp+0x4c] then x -> [esp+0x48]; the ZERO store
 * [esp+0x6c]=0 (0x0081888d) stays HOST; the identity arg-setup
 * ([esp+0x30]->[esp+0x68], [esp+0x28]->[esp] angle, push eax) stays
 * host (v18-style; feeds pack-23).
 * v37: now emits the typed AT_TYPE9_A102E0_22_817830 (64) to the
 * twenty-third a102e0 @ 0x008188b9 (hostArg0 / lroomNextVa =
 * 0x008188b9). */
export function gameRenderResume817830Type9A102e021(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e021XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e021YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_22;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_22;
  return e;
}

/** After AT_TYPE9_A102E0_23_817830 (host a102e0 @ 0x008188b9 ran; the
 * twenty-third type-9 a102e0 pack, THIRD pack of the fifth a106e0 seam
 * group). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y,
 * [esp+0x14] mul_05 (read at 0x008188cf is AFTER the next-host push
 * ecx at 0x008188c1; resume-time slot [esp+0x14], after-push shape).
 * Independent pack y=ret_y+0 (xorps normalizer), x=mul_05+ret_x,
 * stores y -> [esp+0x44] then x -> [esp+0x40]; the ZERO store
 * [esp+0x14]=0 (0x008188e0) stays HOST; identity src is [esp+0xac]
 * (like packs 19/21, unlike 20/22's [esp+0x30]); angle [esp+0x28];
 * push eax feeds pack-24.
 * v38: now emits the typed AT_TYPE9_A102E0_23_817830 (65) to the
 * twenty-fourth a102e0 @ 0x0081890f (hostArg0 / lroomNextVa =
 * 0x0081890f). */
export function gameRenderResume817830Type9A102e022(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e022XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e022YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_23;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_23;
  return e;
}

/** After AT_TYPE9_A102E0_24_817830 (host a102e0 @ 0x00819720 ran; the
 * first post-gate pack of the type-10 run). POST-A102E0 recaptures:
 * [eax] ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819732 is
 * AFTER the next-host push ecx at 0x00819728; resume-time slot
 * [esp+0x14], after-push shape). Independent pack y=ret_y+0 (xorps
 * normalizer), x=mul_05+ret_x; ZERO store [esp+0x58]=0 (0x0081973c)
 * stays HOST; stores y -> [esp+0x3c], x -> [esp+0x38]; identity src
 * [esp+0xc] -> [esp+0x5c]; angle [esp+0x28].
 * v41: emits the typed AT_TYPE9_A102E0_25_817830 (68) to the
 * twenty-fifth a102e0 @ 0x00819773. */
export function gameRenderResume817830Type9A102e024(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e024XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e024YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_25;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_25;
  return e;
}

/** After AT_TYPE9_A102E0_25_817830 (host a102e0 @ 0x00819773 ran; the
 * second post-gate pack). Same shape as pack 24 but identity src is
 * [esp+0xac] -> [esp+0x68]; ZERO store [esp+0x6c]=0 (0x0081979a) stays
 * HOST; stores y -> [esp+0x64], x -> [esp+0x60].
 * v41: emits the typed AT_TYPE9_A102E0_26_817830 (69) to the
 * twenty-sixth a102e0 @ 0x008197c9 (parked). */
export function gameRenderResume817830Type9A102e025(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e025XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e025YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_26;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_26;
  return e;
}

/** After AT_TYPE9_A102E0_27_817830 (host a102e0 @ 0x008197c9 ran; the
 * third pack of the type-10 run). POST-A102E0 recaptures: [eax] ret_x,
 * [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x008197df is AFTER the
 * next-host push ecx at 0x008197d1; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; TWO zero stores ([esp+0x10]=0 AND [esp+0x14]=0 --
 * the second zeroes the mul slot itself) stay HOST; stores y ->
 * [esp+0x74], x -> [esp+0x70]; angle [esp+0x28].
 * v42: emits the typed AT_TYPE9_A102E0_27_817830 (70) to the
 * twenty-seventh a102e0 @ 0x00819818. */
export function gameRenderResume817830Type9A102e026(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e026XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e026YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_27;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_27;
  return e;
}

/** After AT_TYPE9_A106E0_7_817830 (host a102e0 @ 0x00819818 ran; the
 * fourth pack -- CHAIN BREAK: its continuation feeds the A106E0
 * @ 0x00819863). POST-A102E0 recaptures: [eax] ret_x, [eax+4] ret_y,
 * [esp+0x14] mul_05 (reads at 0x00819827/0x00819830 happen BEFORE any
 * next-host push -- pre-push shape, resume slot [esp+0x14] directly).
 * Independent pack y=ret_y+0 (xorps normalizer), x=mul_05+ret_x; NO
 * zero store; the four lea/push arg pairs + identity stores stay host.
 * v42: emits the typed AT_TYPE9_A106E0_7_817830 (71) to the seventh
 * a106e0 @ 0x00819863 (parked). */
export function gameRenderResume817830Type9A102e027(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e027XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e027YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_7;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_7;
  return e;
}

/** After AT_TYPE9_A102E0_28_817830 (host a106e0 @ 0x00819863 ran; the
 * SEVENTH a106e0 seam -- dest-copy cluster class). Identity recaptures:
 * [esp+0x48] -> x, [esp+0xc] -> y, [esp+0x28] -> angle (all read AFTER
 * the next-host push ecx at 0x00819887; resume-time slots
 * [esp+0x44]/[esp+8]/[esp+0x24]). Byte-gate widen: mov byte
 * [esp+0x140],1 ; mov eax,dword [esp+0x140] -> gate = (1u & 0xff).
 * Dest-copies ([esp+0x120]->[esp+0x490], [esp+0x134]->[esp+0x4a4],
 * widened dword -> [esp+0x4b4]) stay HOST.
 * v43: emits the typed AT_TYPE9_A102E0_28_817830 (72) to the
 * twenty-eighth a102e0 @ 0x008198ce. */
export function gameRenderResume817830Type9A106e07(
  state, inputs, offset48Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e07XBits = u32(offset48Bits);
  e.type9A106e07YBits = u32(offsetCBits);
  e.type9A106e07AngleBits = u32(scale28Bits);
  e.type9A106e07GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_28;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_28;
  return e;
}

/** After AT_TYPE9_A102E0_29_817830 (host a102e0 @ 0x008198ce ran; the
 * twenty-eighth type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 -- PRE-PUSH shape (no
 * next-host push before 0x0081990a; resume-time slot [esp+0x14]
 * directly). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; NO zero store; identity/glue stays host.
 * v43: emits the typed AT_TYPE9_A102E0_29_817830 (73) to the
 * twenty-ninth a102e0 @ 0x00819928 (parked). */
export function gameRenderResume817830Type9A102e028(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e028XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e028YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_29;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_29;
  return e;
}

/** After AT_TYPE9_A102E0_30_817830 (host a102e0 @ 0x00819928 ran; the
 * twenty-ninth type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x0081993e is AFTER
 * the next-host push ecx at 0x00819930; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x6c]=0 (0x0081994f) stays HOST;
 * stores y -> [esp+0x64], x -> [esp+0x60]; identity src is [esp+0x48]
 * -> [esp+0x68] (the a106e0_7 identity-source slot).
 * v44: emits the typed AT_TYPE9_A102E0_30_817830 (74) to the thirtieth
 * a102e0 @ 0x008199d1. */
export function gameRenderResume817830Type9A102e029(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e029XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e029YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_30;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_30;
  return e;
}

/** After AT_TYPE9_A106E0_8_817830 (host a102e0 @ 0x0081997b ran; the
 * thirtieth pack -- CHAIN BREAK: its continuation feeds the EIGHTH
 * a106e0 seam @ 0x00819a1c). Same after-push shape; ZERO store
 * [esp+0x14]=0 (0x008199a2 -- zeroes the mul slot itself) stays HOST;
 * identity src [esp+0xac] -> [esp+0x10]; stores y -> [esp+0x74],
 * x -> [esp+0x70].
 * v44: emits the typed AT_TYPE9_A106E0_8_817830 (75) to the eighth
 * a106e0 @ 0x00819a1c (parked). */
export function gameRenderResume817830Type9A102e030(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e030XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e030YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_8;
  /* CHAIN BREAK: pack-30 feeds the EIGHTH a106e0 seam. */
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_8;
  return e;
}

/** After AT_TYPE9_A102E0_31_817830 (host a106e0 @ 0x00819a1c ran; the
 * EIGHTH a106e0 seam -- dest-copy cluster class). Identity recaptures:
 * [esp+0x40] -> x, [esp+0xc] -> y, [esp+0x28] -> angle (all read AFTER
 * the next-host push ecx at 0x00819a40; resume-time slots
 * [esp+0x3c]/[esp+8]/[esp+0x24]). Byte-gate widen: mov byte
 * [esp+0x140],1 ; mov eax,dword [esp+0x140] -> gate = (1u & 0xff).
 * Dest-copies ([esp+0x120]->[esp+0x4b4], widened dword ->
 * [esp+0x4d8], [esp+0x134]->[esp+0x4c8]) stay HOST.
 * v45: emits the typed AT_TYPE9_A102E0_31_817830 (76) to the
 * thirty-first a102e0 @ 0x00819a87. */
export function gameRenderResume817830Type9A106e08(
  state, inputs, offset40Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e08XBits = u32(offset40Bits);
  e.type9A106e08YBits = u32(offsetCBits);
  e.type9A106e08AngleBits = u32(scale28Bits);
  e.type9A106e08GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_31;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_31;
  return e;
}

/** After AT_TYPE9_A102E0_32_817830 (host a102e0 @ 0x00819a87 ran; the
 * thirty-first type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 -- PRE-PUSH shape (no
 * next-host push before 0x00819aa2; resume-time slot [esp+0x14]
 * directly). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; NO zero store; identity/glue stays host.
 * v45: emits the typed AT_TYPE9_A102E0_32_817830 (77) to the
 * thirty-second a102e0 @ 0x00819ade (parked). */
export function gameRenderResume817830Type9A102e031(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e031XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e031YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_32;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_32;
  return e;
}

/** After AT_TYPE9_A102E0_33_817830 (host a102e0 @ 0x00819ade ran; the
 * thirty-second type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819af4 is AFTER
 * the next-host push ecx at 0x00819ae6; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x6c]=0 (0x00819b05) stays HOST;
 * stores y -> [esp+0x64], x -> [esp+0x60]; identity src is [esp+0x40]
 * -> [esp+0x68] (pack-32's own identity-source slot).
 * v46: emits the typed AT_TYPE9_A102E0_33_817830 (78) to the
 * thirty-third a102e0 @ 0x00819b31. */
export function gameRenderResume817830Type9A102e032(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e032XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e032YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_33;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_33;
  return e;
}

/** After AT_TYPE9_A102E0_34_817830 (host a102e0 @ 0x00819b31 ran; the
 * thirty-third type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819b47 is AFTER
 * the next-host push ecx at 0x00819b39; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x14]=0 (0x00819b58 -- zeroes the
 * mul slot itself) stays HOST; stores y -> [esp+0x74], x ->
 * [esp+0x70]; identity src is [esp+0x48] -> [esp+0x10].
 * v46: emits the typed AT_TYPE9_A102E0_34_817830 (79) to the
 * thirty-fourth a102e0 @ 0x00819b84 (parked). */
export function gameRenderResume817830Type9A102e033(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e033XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e033YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_34;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_34;
  return e;
}

/** After AT_TYPE9_A106E0_9_817830 (host a102e0 @ 0x00819b84 ran; the
 * thirty-fourth type-9 a102e0 pack -- CHAIN BREAK: its continuation
 * feeds the NINTH a106e0 seam). POST-A102E0 recaptures: [eax] ret_x,
 * [eax+4] ret_y, [esp+0x14] mul_05 -- PRE-PUSH shape (reads at
 * 0x00819b93/0x00819b9c happen BEFORE the first lea/push at
 * 0x00819baa; resume-time slot [esp+0x14] directly). Independent pack
 * y=ret_y+0 (xorps normalizer), x=mul_05+ret_x; NO zero store; the
 * identity stores ([esp+0x84] <- x, [esp+0x8c] <- y) stay host.
 * v47: emits the typed AT_TYPE9_A106E0_9_817830 (80) to the NINTH
 * a106e0 @ 0x00819bcf. */
export function gameRenderResume817830Type9A102e034(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e034XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e034YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_9;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_9;
  return e;
}

/** After AT_TYPE9_A102E0_35_817830 (host a106e0 @ 0x00819bcf ran; the
 * NINTH a106e0 seam -- dest-copy cluster class). Identity recaptures:
 * [esp+0x9c] -> x, [esp+0xc] -> y, [esp+0x28] -> angle (x read at
 * 0x00819c12 is AFTER the next-host push ecx at 0x00819bf3; resume-
 * time slot [esp+0x98]). Byte-gate widen: mov byte [esp+0x140],1 ;
 * mov eax,dword [esp+0x140] -> gate = (1u & 0xff). Dest-copies
 * ([esp+0x120]->[esp+0x4d8], widened dword -> [esp+0x4fc],
 * [esp+0x134]->[esp+0x4ec]) stay HOST.
 * v47: emits the typed AT_TYPE9_A102E0_35_817830 (81) to the
 * thirty-fifth a102e0 @ 0x00819c3d (parked). */
export function gameRenderResume817830Type9A106e09(
  state, inputs, offset9cBits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e09XBits = u32(offset9cBits);
  e.type9A106e09YBits = u32(offsetCBits);
  e.type9A106e09AngleBits = u32(scale28Bits);
  e.type9A106e09GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_35;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_35;
  return e;
}

/** After AT_TYPE9_A102E0_36_817830 (host a102e0 @ 0x00819c3d ran; the
 * thirty-fifth type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819c53 is AFTER
 * the next-host push ecx at 0x00819c45; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; NO zero store; stores y -> [esp+0x3c], x ->
 * [esp+0x38]; identity src [esp+0x40] -> [esp+0x58]; angle [esp+0x28].
 * v48: emits the typed AT_TYPE9_A102E0_36_817830 (82) to the
 * thirty-sixth a102e0 @ 0x00819c94. */
export function gameRenderResume817830Type9A102e035(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e035XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e035YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_36;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_36;
  return e;
}

/** After AT_TYPE9_A102E0_38_817830 (host a102e0 @ 0x00819cea ran; the
 * thirty-seventh type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819d00 is AFTER
 * the next-host push ecx at 0x00819cf2; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x14]=0 (0x00819d11 -- zeroes the
 * mul slot itself) stays HOST; stores y -> [esp+0x64], x ->
 * [esp+0x60]; identity src is [esp+0x40] -> [esp+0x10]; angle
 * [esp+0x28].
 * v49: emits the typed AT_TYPE9_A102E0_38_817830 (84) to the
 * thirty-eighth a102e0 @ 0x00819d3d. */
export function gameRenderResume817830Type9A102e037(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e037XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e037YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_38;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_38;
  return e;
}

/** After AT_TYPE9_A106E0_10_817830 (host a106e0 @ 0x00819d7f ran; the
 * TENTH a106e0 seam -- dest-copy cluster class). Identity recaptures:
 * [esp+0x90] -> x, [esp+8] -> y, [esp+0x28] -> angle -- ALL read BEFORE
 * any next-host push (pre-push shape; resume-time slots [esp+0x90]/
 * [esp+8]/[esp+0x24]). Byte-gate widen: mov byte [esp+0x140],1 ;
 * mov eax,dword [esp+0x140] -> gate = (1u & 0xff). Dest-copies
 * ([esp+0x120]->[esp+0x4fc], widened dword -> [esp+0x51c],
 * [esp+0x130]->[esp+0x50c]) stay HOST.
 * v50: emits the typed AT_TYPE9_A102E0_39_817830 (86) to the
 * thirty-ninth a102e0 @ 0x00819ded. */
export function gameRenderResume817830Type9A106e010(
  state, inputs, offset90Bits, offset8Bits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e010XBits = u32(offset90Bits);
  e.type9A106e010YBits = u32(offset8Bits);
  e.type9A106e010AngleBits = u32(scale28Bits);
  e.type9A106e010GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_39;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_39;
  return e;
}

/** After AT_TYPE9_A102E0_39_817830 (host a102e0 @ 0x00819ded ran; the
 * thirty-ninth type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819e03 is AFTER
 * the next-host push ecx at 0x00819df5; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; NO zero store; stores y -> [esp+0x3c], x ->
 * [esp+0x38]; identity src [esp+0x9c] -> [esp+0x58], [esp+0xc] ->
 * [esp+0x5c]; angle [esp+0x28].
 * v50: emits the typed AT_TYPE9_A102E0_40_817830 (87) to the fortieth
 * a102e0 @ 0x00819e47 (parked). */
export function gameRenderResume817830Type9A102e039(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e039XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e039YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_40;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_40;
  return e;
}

/** After AT_TYPE9_A102E0_41_817830 (host a102e0 @ 0x00819e47 ran; the
 * fortieth type-9 a102e0 pack). POST-A102E0 recaptures: [eax] ret_x,
 * [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819e5d is AFTER the
 * next-host push ecx at 0x00819e4f; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x6c]=0 (0x00819e6e) stays HOST;
 * stores y -> [esp+0x4c], x -> [esp+0x48]; identity src is [esp+0x94]
 * -> [esp+0x68]; angle [esp+0x28].
 * v51: emits the typed AT_TYPE9_A102E0_41_817830 (88) to the
 * forty-first a102e0 @ 0x00819e9d. */
export function gameRenderResume817830Type9A102e040(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e040XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e040YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_41;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_41;
  return e;
}

/** After AT_TYPE9_A102E0_42_817830 (host a102e0 @ 0x00819e9d ran; the
 * forty-first type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819eb3 is AFTER
 * the next-host push ecx at 0x00819ea5; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x14]=0 (0x00819ec4 -- zeroes the
 * mul slot itself) stays HOST; stores y -> [esp+0x44], x ->
 * [esp+0x40]; identity src is [esp+0x9c] -> [esp+0x10]; angle
 * [esp+0x28].
 * v51: emits the typed AT_TYPE9_A102E0_42_817830 (89) to the
 * forty-second a102e0 @ 0x00819ef3 (parked). */
export function gameRenderResume817830Type9A102e041(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e041XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e041YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_42;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_42;
  return e;
}

/** After AT_TYPE9_A106E0_11_817830 (host a102e0 @ 0x00819ef3 ran; the
 * forty-second type-9 a102e0 pack -- CHAIN BREAK: its continuation
 * feeds the ELEVENTH a106e0 seam). PRE-PUSH shape (xorps @ 0x00819ef8;
 * reads at 0x00819f02/f11 before the first lea/push at 0x00819f15;
 * mul read [esp+0x14] directly). Independent pack y=ret_y+0 (xorps
 * normalizer), x=mul_05+ret_x; NO zero store; four lea/push arg pairs
 * + identity stores ([esp+0x64] <- x, [esp+0x6c] <- y) stay host.
 * v52: emits the typed AT_TYPE9_A106E0_11_817830 (90) to the ELEVENTH
 * a106e0 seam @ 0x00819f35. */
export function gameRenderResume817830Type9A102e042(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e042XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e042YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_11;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_11;
  return e;
}

/** v53: pack-43 aftermath. */
export function gameRenderResume817830Type9A102e043(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e043XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e043YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_44;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_44;
  return e;
}

/** v53: pack-44 aftermath. */
export function gameRenderResume817830Type9A102e044(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e044XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e044YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_45;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_45;
  return e;
}

function gameRenderResume817830Type9A102e045(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e045XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e045YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_46;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_46;
  return e;
}

function gameRenderResume817830Type9A102e046(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e046XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e046YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_12;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_12;
  return e;
}

/** After AT_TYPE9_A102E0_46_817830 (host a106e0 @ 0x0081a0ee ran; the
 * TWELFTH a106e0 seam -- dest-copy cluster class). Gate-only typed law:
 * mov byte [esp+0x140],1 ; mov eax,dword [esp+0x140] -> gate=(1&0xff).
 * Dest-copies ([esp+0x120]->[esp+0x544], [esp+0x134]->[esp+0x558],
 * widened dword -> [esp+0x568]) stay HOST. No scalar recapture.
 * v55: emits AT_HOST_A0F550_817830 (96) -- draw-band station
 * @ 0x0081a132 (irreducible terminal, parked). */
export function gameRenderResume817830Type9A106e012(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e012GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_HOST_A0F550_CALLSITE;
  emit(e, GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_HOST_A0F550_CALLSITE;
  return e;
}

/** Transform-chained cluster pack-47 (SECOND a102e0 cluster @ 0x0081ac33):
 * setter S->xy=(chainScalar,0) then adder Q->xy=S->xy+packResult->xy.
 * Typed pair x=addss(chain,rx), y=addss(0,ry). Emits kind 98 to pack-48. */
export function gameRenderResume817830Type9A102e047(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e047XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e047YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_48;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_48;
  return e;
}

/** Pack-48: same chained law; emits kind 99 to pack-49. */
export function gameRenderResume817830Type9A102e048(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e048XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e048YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_49;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_49;
  return e;
}

/** Pack-49: same chained law; emits kind 100 to pack-50. */
export function gameRenderResume817830Type9A102e049(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e049XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e049YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_50;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_50;
  return e;
}

/** Transform-chained cluster pack-50 @ 0x0081ad42: same chained law;
 * its continuation folds the a11130/a112a0 host pair (Q consumed as
 * an arg; no typed recapture). Emits kind 101 to pack-51. */
export function gameRenderResume817830Type9A102e050(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e050XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e050YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_51;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_51;
  return e;
}

/** Pack-51 @ 0x0081adbb: same chained law; emits kind 102 to pack-52. */
export function gameRenderResume817830Type9A102e051(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e051XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e051YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_52;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_52;
  return e;
}

/** Pack-52 @ 0x0081ae1c: same chained law; emits kind 103 to PARKED
 * pack-53 @ 0x0081aed3 (still host). */
export function gameRenderResume817830Type9A102e052(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e052XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e052YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_53;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_53;
  return e;
}

/** Transform-chained cluster pack-53 @ 0x0081aed3: same chained law;
 * its continuation folds the a11130/a112a0 host pair (Q consumed as
 * an arg; no typed recapture). Emits kind 104 to pack-54. */
export function gameRenderResume817830Type9A102e053(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e053XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e053YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_54;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_54;
  return e;
}

/** Pack-54 @ 0x0081af4c: same chained law; emits kind 105 to pack-55. */
export function gameRenderResume817830Type9A102e054(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e054XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e054YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_55;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_55;
  return e;
}

/** Pack-55 @ 0x0081afaa: same chained law; emits kind 106 to PARKED
 * pack-56 @ 0x0081b005 (still host). */
export function gameRenderResume817830Type9A102e055(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e055XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e055YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_56;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_56;
  return e;
}


/** Transform-chained cluster pack-56 @ 0x0081b005: same chained law;
 * emits kind 107 to pack-57. */
export function gameRenderResume817830Type9A102e056(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e056XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e056YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_57;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_57;
  return e;
}

/** Transform-chained cluster pack-57 @ 0x0081b05e: same chained law;
 * its continuation folds the a11130/a112a0 host pair (Q consumed as
 * an arg; no typed recapture). Emits kind 108 to pack-58. */
export function gameRenderResume817830Type9A102e057(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e057XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e057YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_58;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_58;
  return e;
}

/** Pack-58 @ 0x0081b0d7: same chained law; emits kind 109 to PARKED
 * pack-59 @ 0x0081b135 (still host). */
export function gameRenderResume817830Type9A102e058(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e058XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e058YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_59;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_59;
  return e;
}

/** Transform-chained cluster pack-59 @ 0x0081b135: same chained law;
 * emits kind 110 to pack-60. */
export function gameRenderResume817830Type9A102e059(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e059XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e059YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_60;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_60;
  return e;
}

/** Transform-chained cluster pack-60 @ 0x0081b193: same chained law;
 * emits kind 111 to pack-61. */
export function gameRenderResume817830Type9A102e060(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e060XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e060YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_61;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_61;
  return e;
}

/** Pack-61 @ 0x0081b1ec: same chained law; its continuation folds the
 * a11130/a112a0 host pair (no typed recapture). Emits kind 112 to
 * PARKED pack-62 @ 0x0081b265 (still host). */
export function gameRenderResume817830Type9A102e061(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e061XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e061YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_62;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_62;
  return e;
}

/** Transform-chained cluster pack-62 @ 0x0081b265: same chained law;
 * emits kind 113 to pack-63. */
export function gameRenderResume817830Type9A102e062(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e062XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e062YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_63;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_63;
  return e;
}

/** Transform-chained cluster pack-63 @ 0x0081b2c6: same chained law;
 * emits kind 114 to pack-64. */
export function gameRenderResume817830Type9A102e063(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e063XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e063YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_64;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_64;
  return e;
}

/** Pack-64 @ 0x0081b321: same chained law; emits kind 115 to PARKED
 * pack-65 @ 0x0081b37d (still host; its continuation carries the
 * a11130/a112a0 pair per the every-4th cadence). */
export function gameRenderResume817830Type9A102e064(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e064XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e064YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_65;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_65;
  return e;
}

/** Transform-chained cluster pack-65 @ 0x0081b37d: same chained law;
 * its continuation folds the a11130/a112a0 host pair (Q consumed as
 * an arg; no typed recapture). Emits kind 116 to pack-66. */
export function gameRenderResume817830Type9A102e065(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e065XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e065YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_66;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_66;
  return e;
}

/** Transform-chained cluster pack-66 @ 0x0081b3f9: same chained law;
 * emits kind 117 to pack-67. */
export function gameRenderResume817830Type9A102e066(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e066XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e066YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_67;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_67;
  return e;
}

/** Pack-67 @ 0x0081b457: same chained law; emits kind 118 to PARKED
 * pack-68 @ 0x0081b4b2 (still host). */
export function gameRenderResume817830Type9A102e067(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e067XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e067YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_68;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_68;
  return e;
}

/** Transform-chained cluster pack-68 @ 0x0081b4b2: same chained law;
 * emits kind 119 to pack-69. */
export function gameRenderResume817830Type9A102e068(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e068XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e068YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_69;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_69;
  return e;
}

/** Transform-chained cluster pack-69 @ 0x0081b50b: same chained law;
 * its continuation folds the a11130/a112a0 host pair AND the a0f550
 * draw-band station plus a ~0xa00-byte pure draw-band stretch
 * (0x67f310 draws whose setters/adders chain off DRAW results -- no
 * typed recapture). Emits kind 120 to pack-70. */
export function gameRenderResume817830Type9A102e069(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e069XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e069YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_70;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_70;
  return e;
}

/** Pack-70 @ 0x0081c00c: same chained law; emits kind 121 to PARKED
 * pack-71 @ 0x0081c067 (still host; final stretch of the cluster). */
export function gameRenderResume817830Type9A102e070(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e070XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e070YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_71;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_71;
  return e;
}

/** Transform-chained cluster pack-71 @ 0x0081c067: same chained law;
 * emits kind 122 to pack-72. */
export function gameRenderResume817830Type9A102e071(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e071XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e071YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_72;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_72;
  return e;
}

/** Transform-chained cluster pack-72 @ 0x0081c0c5: same chained law;
 * the adder @ 0x0081c0ec inside its continuation is typed NOT
 * terminal (cluster runs on). Emits kind 123 to pack-73. */
export function gameRenderResume817830Type9A102e072(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e072XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e072YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_73;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_73;
  return e;
}

/** Pack-73 @ 0x0081c11b: same chained law; its continuation folds the
 * a11130/a112a0 host pair. Emits kind 124 to PARKED pack-74 @
 * 0x0081c194 (still host). */
export function gameRenderResume817830Type9A102e073(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e073XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e073YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_74;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_74;
  return e;
}

/** Transform-chained cluster pack-74 @ 0x0081c194: same chained law;
 * emits kind 125 to pack-75. */
export function gameRenderResume817830Type9A102e074(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e074XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e074YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_75;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_75;
  return e;
}

/** Transform-chained cluster pack-75 @ 0x0081c1f5: same chained law;
 * emits kind 126 to pack-76. */
export function gameRenderResume817830Type9A102e075(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e075XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e075YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_76;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_76;
  return e;
}

/** Pack-76 @ 0x0081c250: same chained law; emits kind 127 to PARKED
 * pack-77 @ 0x0081c2ac (still host; the chain runs on to the TRUE
 * end bound 0x0081d90f). */
export function gameRenderResume817830Type9A102e076(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e076XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e076YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_77;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_77;
  return e;
}

/** Transform-chained cluster pack-77 @ 0x0081c2ac: same chained law;
 * its continuation folds the a11130/a112a0 host pair (Q consumed as
 * an arg; no typed recapture). Emits kind 128 to pack-78. */
export function gameRenderResume817830Type9A102e077(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e077XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e077YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_78;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_78;
  return e;
}

/** Transform-chained cluster pack-78 @ 0x0081c328: same chained law
 * (shape deviation: mov esi,eax precedes the movss in the binary --
 * same semantics); emits kind 129 to pack-79. */
export function gameRenderResume817830Type9A102e078(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e078XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e078YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_79;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_79;
  return e;
}

/** Pack-79 @ 0x0081c386: same chained law; emits kind 130 to PARKED
 * pack-80 @ 0x0081c3e1 (still host). */
export function gameRenderResume817830Type9A102e079(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e079XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e079YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_80;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_80;
  return e;
}

/** Transform-chained cluster pack-80 @ 0x0081c3e1: same chained law;
 * emits kind 131 to pack-81. */
export function gameRenderResume817830Type9A102e080(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e080XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e080YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_81;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_81;
  return e;
}

/** Transform-chained cluster pack-81 @ 0x0081c43a: same chained law;
 * its continuation folds the a11130/a112a0 host pair (Q consumed as
 * an arg; no typed recapture). Emits kind 132 to pack-82. */
export function gameRenderResume817830Type9A102e081(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e081XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e081YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_82;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_82;
  return e;
}

/** Pack-82 @ 0x0081c4b6: same chained law; emits kind 133 to PARKED
 * pack-83 @ 0x0081c514 (still host). */
export function gameRenderResume817830Type9A102e082(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e082XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e082YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_83;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_83;
  return e;
}

/** Transform-chained cluster pack-83 @ 0x0081c514: same chained law;
 * emits kind 134 to pack-84. */
export function gameRenderResume817830Type9A102e083(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e083XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e083YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_84;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_84;
  return e;
}

/** Transform-chained cluster pack-84 @ 0x0081c56f: same chained law;
 * emits kind 135 to pack-85. */
export function gameRenderResume817830Type9A102e084(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e084XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e084YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_85;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_85;
  return e;
}

/** Pack-85 @ 0x0081c5c8: same chained law; its continuation folds the
 * a11130/a112a0 host pair. Emits kind 136 to PARKED pack-86 @
 * 0x0081c64a (still host). */
export function gameRenderResume817830Type9A102e085(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e085XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e085YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_86;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_86;
  return e;
}

/** Transform-chained cluster pack-86 @ 0x0081c64a: same chained law;
 * emits kind 137 to pack-87. */
export function gameRenderResume817830Type9A102e086(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e086XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e086YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_87;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_87;
  return e;
}

/** Transform-chained cluster pack-87 @ 0x0081c6a8: same chained law;
 * emits kind 138 to pack-88. */
export function gameRenderResume817830Type9A102e087(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e087XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e087YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_88;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_88;
  return e;
}

/** Pack-88 @ 0x0081c706: same chained law; emits kind 139 to PARKED
 * pack-89 @ 0x0081c75f (still host; its continuation carries the
 * a11130/a112a0 pair per the every-4th cadence). */
export function gameRenderResume817830Type9A102e088(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e088XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e088YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_89;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_89;
  return e;
}
/** After AT_TYPE9_A102E0_43_817830 (host a106e0 @ 0x00819f35 ran; the
 * ELEVENTH a106e0 seam -- dest-copy cluster class). Identity recapture:
 * [esp+0x30] -> x, [esp+0xc] -> y, [esp+0x28] -> angle (all read AFTER
 * the next-host push ecx at 0x00819f69; resume-time slots
 * [esp+0x2c]/[esp+8]/[esp+0x24]). Byte-gate widen: gate = (1u & 0xff).
 * Dest-copies ([esp+0x120]->[esp+0x520], widened dword ->
 * [esp+0x544], [esp+0x130]->[esp+0x530]) stay HOST.
 * v52: emits the typed AT_TYPE9_A102E0_43_817830 (91) to the
 * forty-third a102e0 @ 0x00819fa0 (parked). */
export function gameRenderResume817830Type9A106e011(
  state, inputs, offset30Bits, offsetCBits, scale28Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A106e011XBits = u32(offset30Bits);
  e.type9A106e011YBits = u32(offsetCBits);
  e.type9A106e011AngleBits = u32(scale28Bits);
  e.type9A106e011GateBits = (1 & 0xff) >>> 0;
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_43;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_43;
  return e;
}

/** After AT_TYPE9_A106E0_10_817830 (host a102e0 @ 0x00819d3d ran; the
 * thirty-eighth pack -- CHAIN BREAK: its continuation feeds the TENTH
 * a106e0 seam @ 0x00819d7f). POST-A102E0 recaptures: [eax] ret_x,
 * [eax+4] ret_y, [esp+0x14] mul_05 -- PRE-PUSH shape (no next-host
 * push before 0x00819d63; resume-time slot [esp+0x14] directly).
 * Independent pack y=ret_y+0 (xorps normalizer), x=mul_05+ret_x; NO
 * zero store; the four lea/push arg pairs + identity stores
 * ([esp+0x74] <- x, [esp+0x7c] <- y) stay host.
 * v49: emits the typed AT_TYPE9_A106E0_10_817830 (85) to the TENTH
 * a106e0 @ 0x00819d7f (parked). */
export function gameRenderResume817830Type9A102e038(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e038XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e038YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_10;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_10;
  return e;
}

/** After AT_TYPE9_A102E0_37_817830 (host a102e0 @ 0x00819c94 ran; the
 * thirty-sixth type-9 a102e0 pack). POST-A102E0 recaptures: [eax]
 * ret_x, [eax+4] ret_y, [esp+0x14] mul_05 (read at 0x00819caa is AFTER
 * the next-host push ecx at 0x00819c9c; resume-time slot [esp+0x14],
 * after-push shape). Independent pack y=ret_y+0 (xorps normalizer),
 * x=mul_05+ret_x; ZERO store [esp+0x6c]=0 (0x00819cbb) stays HOST;
 * stores y -> [esp+0x4c], x -> [esp+0x48]; identity src is [esp+0x9c]
 * -> [esp+0x68] (the a106e0_9 x-source slot); angle [esp+0x28].
 * v48: emits the typed AT_TYPE9_A102E0_37_817830 (83) to the
 * thirty-seventh a102e0 @ 0x00819cea (parked). */
export function gameRenderResume817830Type9A102e036(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e036XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e036YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_37;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_37;
  return e;
}

/** Transform-chained cluster pack-89: same chained law; emits kind 140 to pack-90. */
export function gameRenderResume817830Type9A102e089(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e089XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e089YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_90;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_90;
  return e;
}


/** Transform-chained cluster pack-90: same chained law; emits kind 141 to pack-91. */
export function gameRenderResume817830Type9A102e090(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e090XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e090YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_91;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_91;
  return e;
}


/** Transform-chained cluster pack-91: same chained law; emits kind 142 to pack-92. */
export function gameRenderResume817830Type9A102e091(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e091XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e091YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_92;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_92;
  return e;
}


/** Transform-chained cluster pack-92: same chained law; emits kind 143 to pack-93. */
export function gameRenderResume817830Type9A102e092(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e092XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e092YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_93;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_93;
  return e;
}


/** Transform-chained cluster pack-93: same chained law; emits kind 144 to pack-94. */
export function gameRenderResume817830Type9A102e093(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e093XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e093YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_94;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_94;
  return e;
}


/** Transform-chained cluster pack-94: same chained law; emits kind 145 to pack-95. */
export function gameRenderResume817830Type9A102e094(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e094XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e094YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_95;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_95;
  return e;
}


/** Transform-chained cluster pack-95: same chained law; emits kind 146 to pack-96. */
export function gameRenderResume817830Type9A102e095(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e095XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e095YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_96;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_96;
  return e;
}


/** Transform-chained cluster pack-96: same chained law; emits kind 147 to pack-97. */
export function gameRenderResume817830Type9A102e096(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e096XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e096YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_97;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_97;
  return e;
}


/** Transform-chained cluster pack-97: same chained law; emits kind 148 to pack-98. */
export function gameRenderResume817830Type9A102e097(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e097XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e097YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_98;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_98;
  return e;
}


/** Transform-chained cluster pack-98: same chained law; emits kind 149 to pack-99. */
export function gameRenderResume817830Type9A102e098(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e098XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e098YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_99;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_99;
  return e;
}


/** Transform-chained cluster pack-99: same chained law; emits kind 150 to pack-100. */
export function gameRenderResume817830Type9A102e099(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e099XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e099YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_100;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_100;
  return e;
}


/** Transform-chained cluster pack-100: same chained law; emits kind 151 to pack-101. */
export function gameRenderResume817830Type9A102e0100(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0100XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0100YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_101;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_101;
  return e;
}


/** Transform-chained cluster pack-101: same chained law; emits kind 152 to pack-102. */
export function gameRenderResume817830Type9A102e0101(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0101XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0101YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_102;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_102;
  return e;
}


/** Transform-chained cluster pack-102: same chained law; emits kind 153 to pack-103. */
export function gameRenderResume817830Type9A102e0102(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0102XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0102YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_103;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_103;
  return e;
}


/** Transform-chained cluster pack-103: same chained law; emits kind 154 to pack-104. */
export function gameRenderResume817830Type9A102e0103(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0103XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0103YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_104;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_104;
  return e;
}


/** Transform-chained cluster pack-104: same chained law; emits kind 155 to pack-105. */
export function gameRenderResume817830Type9A102e0104(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0104XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0104YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_105;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_105;
  return e;
}


/** Transform-chained cluster pack-105: same chained law; emits kind 156 to pack-106. */
export function gameRenderResume817830Type9A102e0105(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0105XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0105YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_106;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_106;
  return e;
}


/** Transform-chained cluster pack-106: same chained law; emits kind 157 to pack-107. */
export function gameRenderResume817830Type9A102e0106(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0106XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0106YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_107;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_107;
  return e;
}


/** Transform-chained cluster pack-107: same chained law; emits kind 158 to pack-108. */
export function gameRenderResume817830Type9A102e0107(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0107XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0107YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_108;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_108;
  return e;
}


/** Transform-chained cluster pack-108: same chained law; emits kind 159 to pack-109. */
export function gameRenderResume817830Type9A102e0108(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0108XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0108YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_109;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_109;
  return e;
}


/** Transform-chained cluster pack-109: same chained law TERMINAL -- folds pair + station + draw-band. */
export function gameRenderResume817830Type9A102e0109(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0109XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0109YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = GAME_RENDER_VA_HOST_A0F550_TERMINAL_109;
  emit(e, GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830,
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_HOST_A0F550_TERMINAL_109;
  return e;
}

/** After AT_TYPE9_A106E0_6_817830 (host a102e0 @ 0x0081890f ran; the
 * twenty-fourth type-9 a102e0 pack, FOURTH pack of the fifth seam
 * group -- CHAIN BREAK: this pack's continuation feeds an A106E0, not
 * another a102e0). POST-A102E0 recaptures: [eax] ret_x, [eax+4]
 * ret_y, [esp+0x14] mul_05 (reads at 0x00818917/0x00818920 happen
 * BEFORE any next-host push -- pre-push shape, resume-time slot
 * [esp+0x14] directly). Independent pack y=ret_y+0 (the XMM1
 * normalizer -- shape deviation: prior packs used XMM0),
 * x=mul_05+ret_x. The four lea/push arg pairs + identity stores
 * ([esp+0xa0] <- x, [esp+0xa8] <- y) stay host (v18-style glue;
 * feeds the SIXTH a106e0 seam @ 0x0081895a). No zero store.
 * v39: emits the typed AT_TYPE9_A106E0_6_817830 (66) to the sixth
 * a106e0 @ 0x0081895a (hostArg0 / lroomNextVa = 0x0081895a). */
export function gameRenderResume817830Type9A102e023(
  state, inputs, eaxXBits, eaxYBits, mul05Bits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e023XBits = addssBits(mul05Bits, eaxXBits);
  e.type9A102e023YBits = addssBits(eaxYBits, 0);
  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A106E0_6;
  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830,
    GAME_RENDER_HOST_A106E0, GAME_RENDER_VA_A106E0, 0, 0, 1);
  e.hostArg0 = GAME_RENDER_VA_TYPE9_A106E0_6;
  return e;
}

export function gameRenderResumeRtPopBegin(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  emit(e, GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
    GAME_RENDER_HOST_RT_POP_A19180, GAME_RENDER_VA_RT_A19180,
    GAME_RENDER_VA_RT_MANAGER_C798E0, 0, 1);
  e.hostArg0 = 1;
  return e;
}

export function gameRenderResumeRtPopCheck(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const assertNeeded = u32(inputs.datC79790) === 0 ? 1 : 0;
  e.rtAssertNeeded = assertNeeded;
  emit(e, GAME_RENDER_CONTINUE_AT_RT_POP_RESTORE,
    GAME_RENDER_HOST_RT_POP, GAME_RENDER_VA_RT_A18300, 0, 0, 1);
  e.hostArg0 = assertNeeded !== 0 ? GAME_RENDER_VA_RT_EMPTY_MSG : 0;
  e.hostArg1 = assertNeeded !== 0 ? GAME_RENDER_VA_RT_EMPTY_MSG_ARG : 0;
  e.rtAssertNeeded = assertNeeded;
  return e;
}

export function gameRenderResumeRtPopFinal(state, inputs) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  const step = renderShellRtPopDepthStep(inputs.datC79790);
  e.rtDepthAfter = u32(step.depthAfter);
  e.rtBaseCleared = step.clearStackPtr ? 1 : 0;
  emit(e, GAME_RENDER_CONTINUE_AT_EPILOG_825DE0,
    GAME_RENDER_HOST_EPILOG_825DE0, GAME_RENDER_VA_EPILOG_825DE0, 0, 0, 1);
  e.rtDepthAfter = u32(step.depthAfter);
  e.rtBaseCleared = step.clearStackPtr ? 1 : 0;
  return e;
}

export function gameRenderResumeEpilog(state, flag11f6After) {
  const e = gameRenderEmptyEvents();
  if (state == null) return e;
  const oneshot = renderShellFlag11f6Oneshot(flag11f6After);
  e.flag11f6Cleared = oneshot.hostNeeded ? 1 : 0;
  if (oneshot.hostNeeded) {
    emit(e, GAME_RENDER_CONTINUE_AT_EPILOG_826AE0,
      GAME_RENDER_HOST_EPILOG_826AE0, GAME_RENDER_VA_EPILOG_826AE0, 0, 0, 1);
    e.flag11f6Cleared = 1;
    return e;
  }
  return emit(e, GAME_RENDER_CONTINUE_AT_EPILOG_820FD0,
    GAME_RENDER_HOST_EPILOG_820FD0, GAME_RENDER_VA_EPILOG_820FD0, 0, 0, 1);
}

export function gameRenderResumeEpilogFinal(state) {
  const e = gameRenderEmptyEvents();
  if (state == null) return e;
  return emit(e, GAME_RENDER_CONTINUE_AT_EPILOG_820FD0,
    GAME_RENDER_HOST_EPILOG_820FD0, GAME_RENDER_VA_EPILOG_820FD0, 0, 0, 1);
}

export function gameRenderResumeSpritePairA(
  spritePre, spriteAfter, spriteB0, spriteB1, layerB0, layerB1,
) {
  const e = gameRenderEmptyEvents();
  void spritePre;
  const post = renderShell408590PostAPlan(
    spriteAfter, spriteB0, spriteB1, layerB0, layerB1,
  );
  if (post === RENDER_SHELL_408590_POST_A_PAIR_B) {
    e.vtableDispatchCalls = 1;
    emit(e, GAME_RENDER_CONTINUE_NESTED,
      GAME_RENDER_HOST_VT_408590_PAIR_B, 0, spriteAfter,
      u32(RENDER_SHELL_408590_VT_PAIR_B_OFF), 1);
    e.vtableDispatchCalls = 1;
    e.hostArg0 = u32(layerB0);
    e.hostArg1 = u32(layerB1);
    return e;
  }
  e.continuationKind = GAME_RENDER_CONTINUE_NESTED;
  return e;
}

export function gameRenderResumeSharedPtr(
  inputs, addrefResult, destCtrlAfter, releaseResult,
) {
  const e = gameRenderEmptyEvents();
  if (inputs == null) return e;
  const resume = renderShell40c550ResumePlan(addrefResult, destCtrlAfter);
  if (resume === RENDER_SHELL_40C550_RESUME_RELEASE) {
    e.vtableDispatchCalls = 1;
    emit(e, GAME_RENDER_CONTINUE_NESTED,
      GAME_RENDER_HOST_VT_40C550_RELEASE, 0, destCtrlAfter,
      u32(RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF), 1);
    e.vtableDispatchCalls = 1;
    return e;
  }
  if (renderShell40c550HookNeeded(releaseResult, inputs.datC7163c)) {
    return emit(e, GAME_RENDER_CONTINUE_NESTED,
      GAME_RENDER_HOST_HOOK_C7163C, inputs.datC7163c, 0, 0, 1);
  }
  e.continuationKind = GAME_RENDER_CONTINUE_NESTED;
  return e;
}

export function gameRenderResumeRoomType(
  view, state, gamePtr, roomIdx, stageEntry, stageAfter, stageType4,
  descDword0, descField10Nz, field14,
) {
  const e = gameRenderEmptyEvents();
  if (state == null) return { events: e, type: 0 };
  const type = renderShell74f690ResolvePost(view, gamePtr, {
    mode26584: RENDER_SHELL_GET_STAGE_ID_MODE_44,
    roomIdx,
    stageEntry,
    flag183a0: 0,
    stageType4,
    roomDescDword0: descDword0,
    roomDescField10Nz: descField10Nz,
    stageAfter,
    f183b0: 0,
    f18654: 0,
    field14,
  }) >>> 0;
  e.continuationKind = GAME_RENDER_CONTINUE_NESTED;
  return { events: e, type };
}

export function gameRenderResumeOnceInit(guardAfter) {
  const e = gameRenderEmptyEvents();
  const plan = renderShell740bc0OnceInitResume(i32(guardAfter));
  if (plan === RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT) {
    emit(e, GAME_RENDER_CONTINUE_NESTED,
      GAME_RENDER_HOST_ONCE_CTOR, GAME_RENDER_VA_ROOMDESC_CTOR,
      renderShell740bc0EmptyVa(), 0, 1);
    e.allocCalls = 2;
    return e;
  }
  e.continuationKind = GAME_RENDER_CONTINUE_NESTED;
  return e;
}


/** v39 census: the sixth a106e0 seam body (dest-copy cluster with the
 * landed (1u & 0xff) byte-gate widen; 0xa0f550 alloc; repeated 0x67f310
 * draws with float position glue; a10dd0/a0f550 pairs) is HOST up to
 * the post-gate pack run @ 0x00819720. Its ONE decision:
 * v40: after lroom_pack G23 lands the remain at JOIN_9394 = 0x00819394,
 * `cmp dword [eax+0x48], 0xa ; jne 0x0081a975` decides FULL-dword
 * whether room type is 10 (fall-through into the type-10 draw chain,
 * next unpeeled host call 0x00819720) or not (the pinned LROOM join
 * 0x0081a975). */
export function gameRenderLroomGateType10Eq(roomType48After) {
  return roomType48After >>> 0 === 0xa ? 1 : 0;
}

export function gameRenderResume817830LroomJoin9394(
  state, roomType48After,
) {
  const e = gameRenderEmptyEvents();
  if (state == null) return e;
  if (gameRenderLroomGateType10Eq(roomType48After)) {
    /* v41: fall-through emits the typed AT_TYPE9_A102E0_24_817830
       (67) -- pack @ 0x00819720 peeled this ABI. */
    e.lroomNextVa = GAME_RENDER_VA_TYPE10_FIRST_PACK_9720;
    emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830,
      GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
    e.hostArg0 = GAME_RENDER_VA_TYPE10_FIRST_PACK_9720;
    return e;
  }
  e.lroomNextVa = GAME_RENDER_VA_LROOM_JOIN_A975;
  return emit(e, GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
    GAME_RENDER_HOST_BODY_817830_TAIL, e.lroomNextVa, 0, 0, 1);
}
