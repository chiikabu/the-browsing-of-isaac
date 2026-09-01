#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from PlayerManager::Update (VA 0x009bb5d0 / RVA
   0x5bb5d0) PM0 dual-zero gate + PM1 death eligibility + PM2 intensity
   max-clamp island + PM3 residual plan + freestanding pure-complete wire
   decisions.
   Freestanding helpers ABI v5 — Update ABI v44 wires
   isaac_pm_intensity_wire_decide into resume_room_update_head (runtime packs
   + SFX event split). PM0 dual-zero already pure-gates death host emission
   in Update ABI v32; v4 freestanding peels the PM1 per-player eligibility CF
   so a future death pack wire can skip pure-complete walks without re-deriving
   anim/twin predicates. No Update ABI bump in this unit.
   See docs/decomp-port.md ABI v44 (intensity) / v32 (death dual-zero).

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
*/

/* v10: TD-MID: TriggerDeath middle/tail pure gates (ABI v10)
   HEART TAIL VEC CHAR SEQ GHOST RESET
   v9: class-wide byte-parameter sweep. Every uint8_t SCALAR parameter
   widened to uint32_t with an explicit low-byte mask in the body. */
enum { ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION = 45 };

/* ---- pinned needles (tests match these as regexes) ----
 * 0x009bb5d0
 * Update ABI v44|wired into resume_room_update_head
 * PM3
 * 0x1fc
 * wire_decide
 * ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE
 * ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC
 * heartbeat_pure_complete
 * heartbeat_plan
 * wire_decide
 * ISAAC_PM_INTENSITY_PLAYER_MAX
 * PLAY_FRAME_DELAY
 * 0x0092dc30
 * PM0|dual.zero
 * PM1|TriggerDeath|death_wire_decide|pm_death
 * 0x007a1090
 * ISAAC_PM_DEATH_RESIDUAL_NONE
 * ISAAC_PM_DEATH_RESIDUAL_WALK
 * ISAAC_PM_DEATH_RESIDUAL_MONOLITHIC
 * 0x1e68
 * 0x00956830
 * 0x00956780
 * 0x1b8
 * 0x1fc
 * 0x25
 * 0x12d
 * 0x94f2095|DIV_MAGIC
 * 0x1baa8
 * 0x1baac
 * 0x00c5d2b0
 * 0x007a10ad
 * 0x007a10f0
 * 0x007a1109
 * 0x007a1292
 * 0x007a1626
 * 0x007a1232
 * ISAAC_PM_TD_OFF_STATE_2C
 * 0x17a0
 * 0x59
 * 0x71
 * 0x007a12d4
 * 0x007a1bbd
 * 0x007a1c47
 * 0x0b
 * 0x2b0
 * 0x14c
 * 0x26b
 * 0x29b
 * 0x009305f0
 * 0x00930
 * 0x1c
 * 0x137
 * stage 9
 * path.split|path split|STAGE17
 * 0x007a23a0
 * 0x007a2a32
 * 0x007a2a11
 * 0x007a28e9
 * 0x007a2456
 * 0x007a25e3
 * 0x007a2811
 * 0x007a26e4
 * 0x0b
 * 0x51
 * 0xa1
 * 0xd4
 * 0x14c
 * 0x26b
 * 0x2b0
 * 0x137
 * 0x007a11dc
 * 0x00771550
 * TryUnlock|0x00929a20
 * 0x52
 * 0x007a1c47
 * 0x26b
 * 0x1f
 * check_only_termination
 * 0x007a2090
 * 0x007a1b04
 * 0xd4
 * 0x1c
 * 0xfffffff0
 * 0x007a2100
 * 0x00b62a7c
 * 0x00b64a88
 * 0x00b6bf54
 * 0x007a14f0
 * 0x007a13d6
 * 0x007a136e
 * 0x007a169f
 * AddBoneHearts|0x007ca840
 * GetHealthType|0x007cafe0
 * MorphToCoopGhost|0x007d96f0
 * IsCoopPlay|0x009bf990
 * HasCollectibleEffect|0x009305f0
 * TD-MID: TriggerDeath middle/tail pure gates (ABI v10)
 * ABI_VERSION = 34 }
 * v23 — BTT: VA 0x007caaa0 bit-test sibling (address-stable, NO exact
 * ZHL). PURE: signed [0x1d88] > 0 gate then bit-test [0x1d8c] with
 * 1 << (bit & 31); ret 4; bool in al (callers test al only).
 * ISAAC_PM_BTT_VA_BODY = 0x007caaa0
 * ISAAC_PM_BTT_VA_RET_ONE = 0x007caac3
 * ISAAC_PM_BTT_VA_RET_ZERO = 0x007caac9
 * ISAAC_PM_BTT_BODY_BYTES = 42
 * ISAAC_PM_BTT_CALLSITE_COUNT = 2
 * shl eax,cl ; mask mod 32
 * 0x1d88
 * 0x1d8c
 * v24 — TPD: TryPreventDeath 0x007caad0 pure dispatch (gate + switch +
 * per-case scalar guards); case bodies host
 * jmp dword ptr [eax*4 + 0x7caba8] ; jump table 0x7caba8
 * cmp eax,4 ; ja 0x7cab8d ; UNSIGNED over-range -> DEFAULT
 * xor al,al ; RET_FALSE tail (empty-hearts gate)
 * 7 direct rel32 callers 0x7604cb 0x762c6d 0x777f94 0x7a2062
 * 0x7c4fe3 0x7c5b6c 0x7ceba0
 * 0x7588a0 VERIFIED IMPURE -> host leaf (4 E8: 2x 0x7cafe0 pure,
 * 0x7706e0 HasCollectibleEffect host, 0x758d00 sibling host)
 * 0x758a70 apply host ; 0x7dd380 pure global-fatal leaf (ecx=1 fold)
 * [0x134c] = 1 ; DEFAULT-case store stays host
 * ISAAC_PM_TPD_VA_BODY = 0x007caad0
 * ISAAC_PM_TPD_VA_JUMP_TABLE = 0x007caba8
 * ISAAC_PM_TPD_BODY_BYTES = 213
 * ISAAC_PM_TPD_CALLSITE_COUNT = 7
 * RVB: RVH per-id body pure layer (ABI v11)
 * DISPROVEN at callsite (3 args)
 * "AddBoss" 12-byte exact match DISPROVEN
 * histogram {0:1,1:1,2:1,3:1,4:198}
 * 0x0069bd47 pop edi ; FALLBACK TAIL
 * 0x0069bd48 xor eax,eax ; return NULL
 * 0x0069bd44 ret 4 ; IN-RANGE exit
 * imul ecx ; SIGNED EDX:EAX = magic * span
 * sar edx,7 ; arithmetic shift of the HIGH dword
 * shr eax,0x1f ; sign fix
 * js 0x0069bd47 ; SIGNED: id < 0 -> fallback tail
 * jge 0x0069bd47 ; SIGNED: id >= count -> fallback
 * ceil(2^39 / 0x148)
 * 13094412
 * -6547206
 * 0x00c7169c IS RUNTIME STATE, NOT A CONSTANT
 * 0x009aaab0
 * 0x009ab8cc
 * ORIGINAL-BINARY DEFECT, reproduced and pinned, never corrected
 * NO exact match, so the VA stays address-stable
 * Body 0x007791f0..0x007792eb inclusive (252 bytes), ONE ret
 * 0x007792eb  ret ; the ONLY ret
 * int3 padding 0x007792ec..0x007792ef
 * ADOPT the twin UNCONDITIONALLY
 * LANDS ON the twin even when the twin is a non-walker
 * FULL-DWORD compare
 * PRE-value, read BEFORE the call
 * PURE LEAF: it reads only [ecx+0x13c0] and writes
 * EDX survives the call
 * sibling 0x007cb060
 * caller 0x009acd94
 * ht in {1,2} takes [0x1340] ALONE
 * jl  0x00779275 ; SIGNED: new < pre skips the scan
 * jb  0x00779260 ; UNSIGNED loop compare
 * FIRST match only
 * g_Game READ A (pre-scan only)
 * g_Game READ B (fresh re-read)
 * 0x00C71678 IS RUNTIME STATE, NOT A CONSTANT
 * 11298 reads and THREE writers
 * 0x00952847
 * 0x009597d0
 * 0x009ab8a9
 * exactly 8 rel32 CALL sites and ZERO tail jmps
 * PHANTOM decodes of a preceding jump-address table
 * DOMINATES every CASE0 exit path
 * "SetFullHearts"
 * registration EVIDENCE ONLY and does not rename
 * SURVIVES callsite verification (ecx receiver, zero args, int in eax
 * ZERO writes into [0x007cb018,0x007cb051)
 * callee-cleanup ret 4
 * This callee was NOT in the v12 handoff notes
 * ORIGINAL-BINARY DEFECT, reproduced and pinned, never corrected
 * NO cycle guard and NO hop bound
 * an affordance, not a correction
 * read AFTER the update_red_hearts host call
 * [0x194c] = cap store retires AFTER the 0x007ca2d0 host call
 * ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION = 32
 * UBH body 0x007cabc0..0x007caca2 inclusive (227 bytes), TWO rets
 * int3 padding 0x007cabbc..0x007cabbf
 * GHL body 0x007cae60..0x007cafd4 inclusive (373 bytes), FOUR `ret 4`
 * "jmp @ 0x007cae5e"
 * PHANTOM decode of the table bytes
 * 2,094,788 .text positions
 * trunc(limit/2) — HAS the fix
 * FLOOR((v1340+1+v134c)/2) — NO
 * round DIFFERENTLY
 * min_signed(v1d88, avail)
 * masks the count to CL & 31
 * clear bit edx MOD 32
 * set bit edx MOD 32
 * probe tracks bit edx & 31
 * rotate counts mask to 5 bits
 * iterations, NO early exit
 * RELOAD the word EVERY iteration
 * budget <= 0 exits at the TOP
 * budget ; of INT_MIN KEEPS the bit|budget of INT_MIN KEEPS the bit
 * loop 2 ENTERS while loop 1 was ;?skipped
 * exactly 19 rel32 CALL sites, ZERO tail jmps, ZERO raw LE-dword escapes
 * exactly 28 rel32 CALL sites
 * void __thiscall, plain ret
 * __thiscall void Entity_Player::update_bone_hearts()
 * __thiscall int Entity_Player::GetHealthLimit(bool keeper)
 * "GetHeartLimit"
 * registration EVIDENCE ONLY
 * exact ZHL TemporaryEffects::HasNullEffect(int)
 * NO exact ZHL match (family precedent: address-stable
 * exact ZHL Entity_Player::GetGreedsGulletHearts()
 * char READ 1
 * char READ 4
 * PE mixes a snapshot and a reload
 * the bool arg, LOW BYTE only
 * NO [0x1da0] clamp
 * widened to uint32_t with an explicit low-byte mask in the body (v9 rule)
 * base RESET to 0x18
 * bonus above is DISCARDED
 * q+1 kept when coins == 0x63 exactly
 * only STATEFUL hosts left on the whole 0x007791f0 CASE0 tail|only STATEFUL hosts left on the whole 0x007791f0 CASE0 tail
 * update_red_hearts 0x007c9ea0 and address-stable 0x007ca2d0
 * ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION = 32
 * URH body 0x007c9ea0..0x007ca2ce inclusive (1071 bytes), ONE plain ret
 * int3 at 0x007c9e9f anchors the start and int3 at 0x007ca2cf anchors
 * 2,094,788 .text positions finds no external call or jump
 * exactly 26 rel32 CALL sites, ZERO tail jmps, ZERO raw LE-dword file escapes
 * raw-E8 second-anchor
 * reproduces the SAME 26
 * __thiscall void Entity_Player::update_red_hearts()` SURVIVES callsite verification
 * exact ZHL Entity_Player::update_greeds_gullet()
 * exact ZHL ItemOverlay::Show(int, int, Entity_Player*)
 * the 13-byte pattern is weak alone
 * "AddBoss(int)" 12-byte exact match is DISPROVEN AGAIN
 * RemoveCollectibleEffect(int, int) — ret 8 (two args)
 * exact ZHL ANM2::Play(const char*, bool)
 * "FloatGlow" 0x00b6ae50 and "FloatNoGlow" 0x00b6ae44
 * address-stable PURE LEAF (6 censused callsites), translated whole
 * g_Game is loaded SEVEN times
 * [g+0x26614] is read FOUR times
 * [0x1344] FIVE times
 * g_reread_j1, w_g_reload), never folded
 * LOAD-2[\s;]+SNAPSHOT on the four J2 jumps
 * recapture on one[\s;]+path
 * al == 0 HERE
 * FULL 32-bit count
 * reproduced verbatim, no cap
 * counts ALL matches, no early exit
 * subtype 7 SKIPS
 * +1 wraps at 32 bits
 * ratio < 0.8 OR UNORDERED -> LOW
 * ordered 0.1 <= r <= 0.3 -> ADD
 * 0/0 NaN ratio takes LOW
 * cvtdq2ps(1)/cvtdq2ps(10) rounds to EXACTLY the 0x3dcccccd bit pattern
 * read through the SECTION TABLE from file-backed .rdata
 * STORE 2 — retires BEFORE the[\s;]+gullet host boundary
 * or dword [edi+0x1574],1
 * After v15 the only stateful host left on the whole 0x007791f0 CASE0 tail is the SEH-framed address-stable 0x007ca2d0
 * widened uint32_t with an explicit in-body low-byte mask (v9 rule). Nothing in v15 is Update-wired
 * ABI_VERSION = 22 }
 * v16 — HEAL
 * ISAAC_PM_HEAL_VA = 0x007ca2d0
 * ISAAC_PM_HEAL_VA_RET = 0x007ca2d0
 * ISAAC_PM_HEAL_VA_EXIT = 0x007ca7bd
 * ISAAC_PM_HEAL_SFX_PLAY_VA = 0x0092dc30u
 * ISAAC_PM_HEAL_PRE_ID_INITIAL = 0x1ab
 * gfx/293.000_UltraGreedCoins.anm2
 * CrumbleNoDebris
 * 0x007792d3
 * 0x007a331c
 * 0x007ca825
 * typedef struct IsaacPmHealInputs
 * typedef struct IsaacPmHealPlan
 * SEH heal host — closed in v16
 * ABI_VERSION = 22 }
 * v17 — HEAL-EMIT
 * ISAAC_PM_HEAL_EMIT_VA_BODY = 0x007ca7c0
 * ISAAC_PM_HEAL_EMIT_VA_RET = 0x007ca834
 * ISAAC_PM_HEAL_EMIT_BODY_BYTES = 119
 * ISAAC_PM_HEAL_EMIT_CALLSITE_COUNT = 12
 * 0x758a4d
 * 0x9ba20d
 * typedef struct IsaacPmHealEmitPlan
 * ISAAC_PM_HEAL_EMIT_PLAN_BYTES = 20
 * CLOSED in v17
 * ISAAC_PM_HEAL_EMIT_VA_NEXT_FUNC = 0x007ca840
 * ABI_VERSION = 22 }
 * v18 — PM1 walk per-iteration re-derived bounds law
 * ISAAC_PM_WALK_VA_LOOP_TOP = 0x009bb616
 * ISAAC_PM_WALK_VA_FATAL_RELOAD = 0x009bb636
 * ISAAC_PM_WALK_VA_SELECTOR = 0x009bb63c
 * ISAAC_PM_WALK_VA_TRIGGER_RELOAD = 0x009bb684
 * ISAAC_PM_WALK_VA_LOOP_BACK = 0x009bb68a
 * ISAAC_PM_WALK_GAME_GLOBAL_VA = 0x00c71678
 * ISAAC_PM_WALK_PLAN_BYTES = 36
 * ISAAC_PM_TD_VA_MAIN = 0x007a10f0
 * ISAAC_PM_TD_VA_REMOVE = 0x007a10bd
 * ISAAC_PM_TD_VA_NOOP = 0x007a1ca1
 * ISAAC_PM_TD_REMOVE_STORE_171 = 0x007a10d3
 * typedef struct IsaacPmWalkIterPlan
 * The plan carries NO per-player eligibility or trigger decision
 * 0x009bc120
 * ABI_VERSION = 22 }
 * typedef struct IsaacPmWalkTickPlan
 * IsaacPmWalkTickPlan
 * isaac_pm_walk_tick_plan
 * 0x009bb64a
 * 0x009bb67d
 * ABI_VERSION = 22 }
 * v20 — PM3 pre-play chain
 * typedef struct IsaacPmPrePlayChainPlan
 * isaac_pm_pre_play_chain_plan
 * ISAAC_PM_CHAIN_VA_STOP_PROBE = 0x009bb78e
 * ISAAC_PM_CHAIN_VA_STOP_TEST = 0x009bb793
 * ISAAC_PM_CHAIN_VA_STOP_CALL = 0x009bb7a2
 * ISAAC_PM_CHAIN_VA_UPDATE_PROBE = 0x009bb7ad
 * ISAAC_PM_CHAIN_VA_UPDATE_TEST = 0x009bb7b2
 * ISAAC_PM_CHAIN_VA_SET_VOLUME = 0x009bb7c9
 * ISAAC_PM_CHAIN_VA_SET_PITCH = 0x009bb7dd
 * ISAAC_PM_CHAIN_VA_PLAY_RELOAD = 0x009bb7e8
 * ISAAC_PM_CHAIN_VA_PRE_PLAY = 0x009bb7fa
 * ISAAC_PM_CHAIN_VA_PLAY = 0x009bb82b
 * ISAAC_PM_CHAIN_PLAN_BYTES = 48
 * test al,al
 * 0x007a2456..0x007a25de
 * 0x007a25e3..0x007a26df
 * 0x007a2811..0x007a28e4
 * 0x007a26e4..0x007a280c
 * 0x007a28e9..0x007a29be
 * 0x007a30a6..0x007a328a
 * 0x007a2eeb..0x007a30a1
 * 0x007a2ab7..0x007a2ee6
 * 0x007a29c3..0x007a2a0c
 * 0x007a2a32..0x007a2ab2
 * 0x00758a54
 * 0x00758ba4
 * 0x00758efd
 * 0x007591ce
 * 0x0075920f
 * 0x00778bd8
 * 0x007792e0
 * 0x007b4fcb
 * 0x007b5002
 * 0x007ca91a
 * 0x007cea75
 * 0x007ceba7
 * 0x007cf001
 * 0x007cf018
 * 0x007d311b
 * 0x007d3163
 * 0x007daa7f
 * 0x009ba214
 * 0x009bd845
 * 0x005c3082
 * 0x006e914a
 * 0x0075897a
 * 0x00758ea5
 * 0x0075908d
 * 0x00761e06
 * 0x00761e1e
 * 0x00761e30
 * 0x00762695
 * 0x007626c5
 * 0x00777f80
 * 0x007a224d
 * 0x007a5344
 * 0x007a5392
 * 0x007b3226
 * 0x007b5e96
 * 0x007c350e
 * 0x007ca937
 * 0x007ca968
 * 0x007caa5f
 * 0x007cabd9
 * 0x007cacd8
 * 0x007d0eae
 * 0x007d0ebd
 * 0x007d1573
 * 0x007d2a75
 * 0x007d9126
 * 0x00844ccf
 * 0x005b659a
 * 0x00612178
 * 0x00758a44
 * 0x00758b93
 * 0x007604b7
 * 0x00761f5e
 * 0x0077727a
 * 0x00777e3d
 * 0x00779277
 * 0x00793fd5
 * 0x007a17c5
 * 0x007a32bb
 * 0x007a355a
 * 0x007b7670
 * 0x007c5f0c
 * 0x007ca8be
 * 0x007ca921
 * 0x007ca9c5
 * 0x007cebae
 * 0x007cf008
 * 0x007cf01f
 * 0x007d310b
 * 0x007d3153
 * 0x007da8b2
 * 0x007da930
 * 0x007da956
 * 0x00758a4d
 * 0x00758b9d
 * 0x00758ef6
 * 0x00759208
 * 0x00778bd1
 * 0x007975b9
 * 0x007c9dda
 * 0x007cf011
 * 0x007d3114
 * 0x007d315c
 * 0x007daa78
 * 0x009ba20d
 * ISAAC_PM_URH_VA_GULLET_7CE420 = 0x007ce420u
 * ISAAC_PM_URH_VA_OVERLAY_SHOW = 0x009ad210u
 * ISAAC_PM_URH_VA_HAS_NULL_EFFECT = 0x00930680u
 * ISAAC_PM_URH_VA_HAS_EFFECT = 0x009305f0u
 * ISAAC_PM_URH_VA_REMOVE_EFFECT = 0x009304a0u
 * ISAAC_PM_URH_VA_ANM2_PLAY = 0x0040a380u
 * ISAAC_PM_URH_VA_EFFECT_ADD_930220 = 0x00930220u
 * ISAAC_PM_URH_VA_EFFECT_ADD_9302E0 = 0x009302e0u
 * ISAAC_PM_URH_VA_HAS_COLLECTIBLE = 0x007706e0u
 * ISAAC_PM_URH_VA_PROBE_6DACD0 = 0x006dacd0u
 * ISAAC_PM_URH_VA_HOST_763570 = 0x00763570u
 * ISAAC_PM_URH_STR_FLOATGLOW_VA = 0x00b6ae50u
 * ISAAC_PM_URH_STR_FLOATNOGLOW_VA = 0x00b6ae44u
 * ISAAC_PM_URH_F32_08_VA = 0x00baa3a4u
 * ISAAC_PM_URH_F32_01_VA = 0x00baa120u
 * ISAAC_PM_URH_F32_03_VA = 0x00baa1f8u
 * loop 2 ENTERS while loop 1 was skipped
 * LOAD-2 SNAPSHOT on the four J2 jumps
 * recapture on one path
 * STORE 2 — retires BEFORE the gullet host boundary
 */

enum {
  ISAAC_PM_C0T_BODY_BYTES = 252,
  ISAAC_PM_C0T_CALLSITE_COUNT = 8,
  ISAAC_PM_C0T_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_C0T_OFF_134C = 0x134c,
  ISAAC_PM_C0T_OFF_CHAR_13C0 = 0x13c0,
  ISAAC_PM_C0T_OFF_FATAL_1340 = 0x1340,
  ISAAC_PM_C0T_OFF_SOUL_1344 = 0x1344,
  ISAAC_PM_C0T_SCAN_BASE_OFF = 0x1da04,
  ISAAC_PM_C0T_SCAN_BYTE_OFF = 0xc,
  ISAAC_PM_C0T_SCAN_BYTE_VALUE = 4,
  ISAAC_PM_C0T_SCAN_NO_MATCH = 8,
  ISAAC_PM_C0T_SCAN_SKIPPED = -1,
  ISAAC_PM_C0T_SCAN_SLOTS = 8,
  ISAAC_PM_C0T_SCAN_STRIDE = 0x6dc,
  ISAAC_PM_C0T_STR_SETFULLHEARTS_VA = 0x00b719ec,
  ISAAC_PM_C0T_VA_BODY = 0x007791f0,
  ISAAC_PM_C0T_VA_CALLSITE_42C14B = 0x0042c14b,
  ISAAC_PM_C0T_VA_CALLSITE_717DAF = 0x00717daf,
  ISAAC_PM_C0T_VA_CALLSITE_7A258B = 0x007a258b,
  ISAAC_PM_C0T_VA_CALLSITE_7B35EE = 0x007b35ee,
  ISAAC_PM_C0T_VA_CALLSITE_7C4F0A = 0x007c4f0a,
  ISAAC_PM_C0T_VA_CALLSITE_7CB110 = 0x007cb110,
  ISAAC_PM_C0T_VA_CALLSITE_7FF46A = 0x007ff46a,
  ISAAC_PM_C0T_VA_CALLSITE_9ACDB4 = 0x009acdb4,
  ISAAC_PM_C0T_VA_GETTER_7CB060 = 0x007cb060,
  ISAAC_PM_C0T_VA_GET_HEALTH_LIMIT = 0x007cae60,
  ISAAC_PM_C0T_VA_GET_HEALTH_TYPE = 0x007cafe0,
  ISAAC_PM_C0T_VA_NEXT_FUNC = 0x007792f0,
  ISAAC_PM_C0T_VA_REGISTRATION_PUSH = 0x00869750,
  ISAAC_PM_C0T_VA_RET = 0x007792eb,
  ISAAC_PM_C0T_VA_UPDATE_BONE_HEARTS = 0x007cabc0,
  ISAAC_PM_C0T_WALK_CHAR = 0x11,
  ISAAC_PM_CHAIN_PLAN_BYTES = 48,
  ISAAC_PM_CHAIN_VA_PLAY = 0,
  ISAAC_PM_CHAIN_VA_PLAY_RELOAD = 0,
  ISAAC_PM_CHAIN_VA_PRE_PLAY = 0,
  ISAAC_PM_CHAIN_VA_SET_PITCH = 0,
  ISAAC_PM_CHAIN_VA_SET_VOLUME = 0,
  ISAAC_PM_CHAIN_VA_STOP_CALL = 0,
  ISAAC_PM_CHAIN_VA_STOP_PROBE = 0,
  ISAAC_PM_CHAIN_VA_STOP_TEST = 0,
  ISAAC_PM_CHAIN_VA_UPDATE_PROBE = 0,
  ISAAC_PM_CHAIN_VA_UPDATE_TEST = 0,
  ISAAC_PM_DEATH_HOST_VA_EMPTY_FATAL = 0x00a112c0,
  ISAAC_PM_DEATH_HOST_VA_TRIGGER_DEATH = 0x007a1090,
  ISAAC_PM_DEATH_OFF_ANIM_7C = 0x7c,
  ISAAC_PM_DEATH_OFF_ANIM_8C = 0x8c,
  ISAAC_PM_DEATH_OFF_DEAD_173 = 0x173,
  ISAAC_PM_DEATH_OFF_TWIN_1E68 = 0x1e68,
  ISAAC_PM_DEATH_PLAYER_MAX = 8,
  ISAAC_PM_DEATH_RESIDUAL_MONOLITHIC = 2,
  ISAAC_PM_DEATH_RESIDUAL_NONE = 0,
  ISAAC_PM_DEATH_RESIDUAL_WALK = 1,
  ISAAC_PM_DEATH_TRIGGER_ARG_CHECK_ONLY = 0,
  ISAAC_PM_EP_HT_BYTE_TABLE_VA = 0x007cb02c,
  ISAAC_PM_EP_HT_CHAR_MIN = 4,
  ISAAC_PM_EP_HT_INDEX_MAX = 0x24,
  ISAAC_PM_EP_HT_JUMP_RETURNS = 0,
  ISAAC_PM_EP_HT_JUMP_TABLE_VA = 0x007cb018,
  ISAAC_PM_EP_HT_TABLE_LEN = 0x25,
  ISAAC_PM_GHL_BASE_DEFAULT = 0x18,
  ISAAC_PM_GHL_BASE_SMALL = 0xc,
  ISAAC_PM_GHL_BODY_BYTES = 373,
  ISAAC_PM_GHL_CALLSITES = 0,
  ISAAC_PM_GHL_CALLSITE_COUNT = 28,
  ISAAC_PM_GHL_CHAR1_BONUS = 0xc,
  ISAAC_PM_GHL_CHAR_10_RESULT = 6,
  ISAAC_PM_GHL_CHAR_14_RESULT = 4,
  ISAAC_PM_GHL_COIN_DIV_MAGIC = 0x51eb851f,
  ISAAC_PM_GHL_COIN_DIV_MODULUS = 25,
  ISAAC_PM_GHL_COIN_DIV_SHIFT = 3,
  ISAAC_PM_GHL_COIN_SPECIAL_63 = 0x63,
  ISAAC_PM_GHL_COLLECTIBLE_1F5 = 0x1f5,
  ISAAC_PM_GHL_COLLECTIBLE_26B = 0x26b,
  ISAAC_PM_GHL_KEEPER_26B_BONUS = 2,
  ISAAC_PM_GHL_KEEPER_CAP = 0x18,
  ISAAC_PM_GHL_KEEPER_CHAR_21 = 0x21,
  ISAAC_PM_GHL_KEEPER_CHAR_E = 0xe,
  ISAAC_PM_GHL_KEEPER_SEL_BASE = 4,
  ISAAC_PM_GHL_NULL_EFFECT_78 = 0x78,
  ISAAC_PM_GHL_NULL_EFFECT_79 = 0x79,
  ISAAC_PM_GHL_OFF_CLAMP_1DA0 = 0x1da0,
  ISAAC_PM_GHL_OFF_COINS_1368 = 0x1368,
  ISAAC_PM_GHL_OFF_STATE_2C = 0x2c,
  ISAAC_PM_GHL_OFF_TEMP_EFFECTS_1508 = 0x1508,
  ISAAC_PM_GHL_RESULT_GATE_CLOSED = 0xa0,
  ISAAC_PM_GHL_STR_GETHEARTLIMIT_VA = 0x00b722b4,
  ISAAC_PM_GHL_VA_BODY = 0x007cae60,
  ISAAC_PM_GHL_VA_GULLET = 0x007ce390,
  ISAAC_PM_GHL_VA_HAS_COLLECTIBLE = 0x007706e0,
  ISAAC_PM_GHL_VA_HAS_NULL_EFFECT = 0x00930680,
  ISAAC_PM_GHL_VA_REGISTRATION_PUSH = 0x0086a04f,
  ISAAC_PM_GHL_VA_REGISTRATION_SINK = 0x008836b0,
  ISAAC_PM_GHL_VA_RET_A0 = 0x007cae85,
  ISAAC_PM_GHL_VA_RET_COMMON = 0x007cafd2,
  ISAAC_PM_GHL_VA_RET_NULL78 = 0x007caeb6,
  ISAAC_PM_GHL_VA_RET_NULL79 = 0x007caed4,
  ISAAC_PM_HEAL_BURST_DRAWS = 20,
  ISAAC_PM_HEAL_EMIT_BODY_BYTES = 119,
  ISAAC_PM_HEAL_EMIT_CALLSITE_COUNT = 12,
  ISAAC_PM_HEAL_EMIT_PLAN_BYTES = 20,
  ISAAC_PM_HEAL_EMIT_VA = 0x007ca7c0,
  ISAAC_PM_HEAL_EMIT_VA_BODY = 0x007ca7c0,
  ISAAC_PM_HEAL_EMIT_VA_NEXT_FUNC = 0x007ca840,
  ISAAC_PM_HEAL_EMIT_VA_RET = 0x007ca834,
  ISAAC_PM_HEAL_F32_033_BITS = 0x3ea8f5c3,
  ISAAC_PM_HEAL_F32_066_BITS = 0x3f28f5c3,
  ISAAC_PM_HEAL_F32_12_BITS = 0x41400000,
  ISAAC_PM_HEAL_F32_2NEG32_BITS = 0x2f800000,
  ISAAC_PM_HEAL_F32_8_BITS = 0x41000000,
  ISAAC_PM_HEAL_FROZEN_BIT = 0x400,
  ISAAC_PM_HEAL_INNER_MAX = 4,
  ISAAC_PM_HEAL_OUTER_MAX = 4,
  ISAAC_PM_HEAL_PRE_ID_INITIAL = 0x1ab,
  ISAAC_PM_HEAL_SFX_PLAY_VA = 0x0092dc30,
  ISAAC_PM_HEAL_TAIL_KIND_HI = 0x3dd,
  ISAAC_PM_HEAL_TAIL_KIND_LO = 0xa,
  ISAAC_PM_HEAL_TAIL_MAX = 8,
  ISAAC_PM_HEAL_VA = 0x007ca2d0,
  ISAAC_PM_HEAL_VA_EXIT = 0x007ca7bd,
  ISAAC_PM_HEAL_VA_RET = 0x007ca2d0,
  ISAAC_PM_INTENSITY_F32_ONE_BITS = 0x3f800000,
  ISAAC_PM_INTENSITY_F32_SCALE_20_BITS = 0x41a00000,
  ISAAC_PM_INTENSITY_F32_THRESHOLD_BITS = 0x3c23d70a,
  ISAAC_PM_INTENSITY_FLAG_BIT_40 = 0x40,
  ISAAC_PM_INTENSITY_HOST_VA_IS_PLAYING = 0x0092e560,
  ISAAC_PM_INTENSITY_HOST_VA_PLAY = 0x0092dc30,
  ISAAC_PM_INTENSITY_HOST_VA_PRE_PLAY = 0x00956780,
  ISAAC_PM_INTENSITY_HOST_VA_SET_PITCH = 0x0092e050,
  ISAAC_PM_INTENSITY_HOST_VA_SET_VOLUME = 0x0092df40,
  ISAAC_PM_INTENSITY_HOST_VA_STOP = 0x0092e230,
  ISAAC_PM_INTENSITY_OFF_DEAD_173 = 0x173,
  ISAAC_PM_INTENSITY_OFF_FLAGS_168 = 0x168,
  ISAAC_PM_INTENSITY_OFF_RAW_1EA8 = 0x1ea8,
  ISAAC_PM_INTENSITY_PLAYER_MAX = 8,
  ISAAC_PM_INTENSITY_PLAY_FRAME_DELAY = 2,
  ISAAC_PM_INTENSITY_PLAY_LOOP = 1,
  ISAAC_PM_INTENSITY_PLAY_PAN_BITS = 0,
  ISAAC_PM_INTENSITY_PLAY_PITCH_BITS = 0x3f800000,
  ISAAC_PM_INTENSITY_SFX_ID = 0x1fc,
  ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC = 4,
  ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE = 0,
  ISAAC_PM_INTENSITY_SFX_RESIDUAL_PLAY = 2,
  ISAAC_PM_INTENSITY_SFX_RESIDUAL_STOP = 3,
  ISAAC_PM_INTENSITY_SFX_RESIDUAL_UPDATE = 1,
  ISAAC_PM_PLAYER_PTR_SHIFT = 2,
  ISAAC_PM_PLAYER_VECTOR_BEGIN_OFF = 0x1baa8,
  ISAAC_PM_PLAYER_VECTOR_END_OFF = 0x1baac,
  ISAAC_PM_PRE_PLAY_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_PRE_PLAY_HOST_VA_MAP_LOOKUP = 0x004288a0,
  ISAAC_PM_PRE_PLAY_HOST_VA_SEED_ZERO_FATAL = 0x00a112c0,
  ISAAC_PM_PRE_PLAY_ID_DEFAULT = 0x1fc,
  ISAAC_PM_PRE_PLAY_ID_FOUND = 0x25,
  ISAAC_PM_PRE_PLAY_ID_RARE = 0x12d,
  ISAAC_PM_PRE_PLAY_MAP_KEY = 7,
  ISAAC_PM_PRE_PLAY_MAP_OFF = 0x1bbd8,
  ISAAC_PM_PRE_PLAY_RARE_MODULUS = 20,
  ISAAC_PM_PRE_PLAY_RNG_SEED_DEFAULT = 0x69696969,
  ISAAC_PM_PRE_PLAY_RNG_SEED_VA = 0x00c5d2b0,
  ISAAC_PM_PRE_PLAY_RNG_SHIFT1_DEFAULT = 2,
  ISAAC_PM_PRE_PLAY_RNG_SHIFT1_VA = 0x00c5d2b4,
  ISAAC_PM_PRE_PLAY_RNG_SHIFT2_DEFAULT = 7,
  ISAAC_PM_PRE_PLAY_RNG_SHIFT2_VA = 0x00c5d2b8,
  ISAAC_PM_PRE_PLAY_RNG_SHIFT3_DEFAULT = 7,
  ISAAC_PM_PRE_PLAY_RNG_SHIFT3_VA = 0x00c5d2bc,
  ISAAC_PM_PRE_PLAY_SEED_ZERO_FATAL_LEVEL = 0x10,
  ISAAC_PM_PRE_PLAY_SEED_ZERO_STR_VA = 0x00b6bf54,
  ISAAC_PM_SFX_ENTRY_DIV_MAGIC = 0x094f2095,
  ISAAC_PM_SFX_ENTRY_DIV_SHIFT = 4,
  ISAAC_PM_SFX_ENTRY_OFF_ENABLED_198 = 0x198,
  ISAAC_PM_SFX_ENTRY_OFF_VOICE_COUNT_190 = 0x190,
  ISAAC_PM_SFX_ENTRY_OFF_VOICE_PTR_20 = 0x20,
  ISAAC_PM_SFX_ENTRY_OFF_VOLUME_194 = 0x194,
  ISAAC_PM_SFX_ENTRY_STRIDE = 0x1b8,
  ISAAC_PM_SFX_ENTRY_VOICE_STRIDE = 0x38,
  ISAAC_PM_SFX_GATE_DISABLED = 2,
  ISAAC_PM_SFX_GATE_LIVE = 3,
  ISAAC_PM_SFX_GATE_MISS = 0,
  ISAAC_PM_SFX_GATE_NO_SAMPLES = 1,
  ISAAC_PM_SFX_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_SFX_MANAGER_OFF = 0x2a324,
  ISAAC_PM_SFX_WARN_LOG_LEVEL = 1,
  ISAAC_PM_SFX_WARN_LOG_STR_VA = 0x00b7b1fc,
  ISAAC_PM_SFX_WARN_LOG_VA = 0x00a112c0,
  ISAAC_PM_TD_CASCADE_CHAR_TYPE_MATCH = 8,
  ISAAC_PM_TD_CASCADE_STAGES = 10,
  ISAAC_PM_TD_CHAR_PATH_0 = 0,
  ISAAC_PM_TD_CHAR_PATH_1 = 1,
  ISAAC_PM_TD_CHAR_PATH_2 = 2,
  ISAAC_PM_TD_COMPACT_DWORD_MASK = 0xffffffff,
  ISAAC_PM_TD_EARLY_CHECK_ONLY = 1,
  ISAAC_PM_TD_EARLY_NONE = 0,
  ISAAC_PM_TD_EARLY_REMOVE = 2,
  ISAAC_PM_TD_GUARD_CHAR_TYPE = 1,
  ISAAC_PM_TD_GUARD_NONE = 0,
  ISAAC_PM_TD_GUARD_RNG_BIT = 2,
  ISAAC_PM_TD_GUARD_STAGE17 = 3,
  ISAAC_PM_TD_HEART_ACCEPT = 0xd,
  ISAAC_PM_TD_LIST_ELEM_STRIDE = 0x10,
  ISAAC_PM_TD_LIST_MATCH_ID = 0x71,
  ISAAC_PM_TD_LIST_MATCH_TAG = 0,
  ISAAC_PM_TD_OFF_CHAR_TYPE_13C0 = 0x13c0,
  ISAAC_PM_TD_OFF_DEAD_171 = 0x171,
  ISAAC_PM_TD_OFF_ORDER_161C = 0x161c,
  ISAAC_PM_TD_OFF_POCKET_BASE_17A0 = 0x17a0,
  ISAAC_PM_TD_OFF_STATE_2C = 0x2c,
  ISAAC_PM_TD_OFF_TWIN_1E68 = 0x1e68,
  ISAAC_PM_TD_POCKET_CLAMP_MAX = 3,
  ISAAC_PM_TD_POCKET_LAST_ID_VALUE = 0,
  ISAAC_PM_TD_POCKET_LAST_TYPE_VALUE = 1,
  ISAAC_PM_TD_POCKET_MATCH_ID = 0x59,
  ISAAC_PM_TD_POCKET_MATCH_TYPE = 1,
  ISAAC_PM_TD_POCKET_SLOTS = 4,
  ISAAC_PM_TD_POCKET_STRIDE = 8,
  ISAAC_PM_TD_PROBE_B_PATH_COUNT_GT0 = 2,
  ISAAC_PM_TD_PROBE_B_PATH_COUNT_GT1 = 1,
  ISAAC_PM_TD_PROBE_B_PATH_IMMEDIATE = 0,
  ISAAC_PM_TD_PROBE_KIND_A = 1,
  ISAAC_PM_TD_PROBE_KIND_B = 2,
  ISAAC_PM_TD_PROBE_KIND_NONE = 0,
  ISAAC_PM_TD_REMOVE_STORE_171 = 0,
  ISAAC_PM_TD_RESET_BRANCH_CHAR_12 = 4,
  ISAAC_PM_TD_RESET_BRANCH_ELSE = 5,
  ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_EQ3 = 1,
  ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_NE3 = 0,
  ISAAC_PM_TD_RESET_BRANCH_LE0_HT1_EQ4 = 2,
  ISAAC_PM_TD_RESET_BRANCH_LE0_HT2_EQ3 = 3,
  ISAAC_PM_TD_RESET_CHAR_MATCH = 0x12,
  ISAAC_PM_TD_RVB_ARM_CHAIN_SKIP = 2,
  ISAAC_PM_TD_RVB_ARM_FATAL = 1,
  ISAAC_PM_TD_RVB_ARM_NOTIFY = 3,
  ISAAC_PM_TD_RVB_ARM_SKIP = 0,
  ISAAC_PM_TD_RVB_BODY_CASE0 = 0,
  ISAAC_PM_TD_RVB_BODY_CASE1 = 1,
  ISAAC_PM_TD_RVB_BODY_CASE2 = 2,
  ISAAC_PM_TD_RVB_BODY_CASE3 = 3,
  ISAAC_PM_TD_RVB_BODY_DEFAULT = 8,
  ISAAC_PM_TD_RVB_BODY_EQ137 = 4,
  ISAAC_PM_TD_RVB_BODY_HIGH0 = 5,
  ISAAC_PM_TD_RVB_BODY_HIGH1 = 6,
  ISAAC_PM_TD_RVB_BODY_HIGH2 = 7,
  ISAAC_PM_TD_RVB_CASE0_BRANCH_CHAR12 = 4,
  ISAAC_PM_TD_RVB_CASE0_BRANCH_ELSE = 5,
  ISAAC_PM_TD_RVB_CASE0_BRANCH_HT1 = 0,
  ISAAC_PM_TD_RVB_CASE0_BRANCH_HT3 = 3,
  ISAAC_PM_TD_RVB_CASE0_BRANCH_HT4 = 1,
  ISAAC_PM_TD_RVB_CASE0_BRANCH_KEEP = 2,
  ISAAC_PM_TD_RVB_CASE1_BRANCH_ELSE = 3,
  ISAAC_PM_TD_RVB_CASE1_BRANCH_HT1 = 0,
  ISAAC_PM_TD_RVB_CASE1_BRANCH_HT2 = 2,
  ISAAC_PM_TD_RVB_CASE1_BRANCH_HT4 = 1,
  ISAAC_PM_TD_RVB_CASE2_CHAR_KEEP = 0x19,
  ISAAC_PM_TD_RVB_CASE2_CHAR_NEW = 4,
  ISAAC_PM_TD_RVB_CASE2_CONST_134C = 6,
  ISAAC_PM_TD_RVB_CFG_BEGIN_OFF = 8,
  ISAAC_PM_TD_RVB_CFG_DIV_MAGIC = 0x63e7063f,
  ISAAC_PM_TD_RVB_CFG_DIV_SHIFT = 7,
  ISAAC_PM_TD_RVB_CFG_END_OFF = 0xc,
  ISAAC_PM_TD_RVB_CFG_MANAGER_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_TD_RVB_CFG_OFF_B0 = 0xb0,
  ISAAC_PM_TD_RVB_CFG_OFF_B4 = 0xb4,
  ISAAC_PM_TD_RVB_CFG_OFF_B8 = 0xb8,
  ISAAC_PM_TD_RVB_CFG_PROBE_0 = 0,
  ISAAC_PM_TD_RVB_CFG_PROBE_1 = 1,
  ISAAC_PM_TD_RVB_CFG_SITE_5BE49E = 0x005be49e,
  ISAAC_PM_TD_RVB_CFG_SITE_65D7CE = 0x0065d7ce,
  ISAAC_PM_TD_RVB_CFG_SITE_8ECB88 = 0x008ecb88,
  ISAAC_PM_TD_RVB_CFG_SITE_9A2E30 = 0x009a2e30,
  ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT1_A = 0x007a24bb,
  ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT1_B = 0x007a24d9,
  ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT4 = 0x007a2518,
  ISAAC_PM_TD_RVB_CFG_SITE_CHECKED = 1,
  ISAAC_PM_TD_RVB_CFG_SITE_UNCHECKED = 0,
  ISAAC_PM_TD_RVB_CFG_SITE_UNKNOWN = -1,
  ISAAC_PM_TD_RVB_CFG_STRIDE = 0x148,
  ISAAC_PM_TD_RVB_CFG_VA_END = 0x0069bd4c,
  ISAAC_PM_TD_RVB_CFG_VA_RECEIVER_GETTER = 0x00417910,
  ISAAC_PM_TD_RVB_CFG_VA_RET_FALLBACK = 0x0069bd47,
  ISAAC_PM_TD_RVB_CFG_VA_RET_IN_RANGE = 0x0069bd44,
  ISAAC_PM_TD_RVB_CFG_VEC_OFF = 0x2a670,
  ISAAC_PM_TD_RVB_DEFAULT_FMT_VA = 0x00b6b138,
  ISAAC_PM_TD_RVB_DEFAULT_LOG_LEVEL = 4,
  ISAAC_PM_TD_RVB_EQ137_CHAR_KEEP = 0x18,
  ISAAC_PM_TD_RVB_EQ137_CHAR_NEW = 0xc,
  ISAAC_PM_TD_RVB_EQ137_CONST_134C = 4,
  ISAAC_PM_TD_RVB_EQ137_CONST_1350 = -1,
  ISAAC_PM_TD_RVB_FATAL_TIMER_78 = 0x78,
  ISAAC_PM_TD_RVB_HEAL_LIMIT = 2,
  ISAAC_PM_TD_RVB_HEAL_OFF_26614 = 0x26614,
  ISAAC_PM_TD_RVB_HIGH0_CFG_ELEM_OFF = 0x530,
  ISAAC_PM_TD_RVB_HIGH0_CFG_VEC_BEGIN_OFF = 0x2a404,
  ISAAC_PM_TD_RVB_HIGH0_CFG_VEC_END_OFF = 0x2a408,
  ISAAC_PM_TD_RVB_HIGH0_CHAR_KEEP_A = 0x1d,
  ISAAC_PM_TD_RVB_HIGH0_CHAR_KEEP_B = 0x26,
  ISAAC_PM_TD_RVB_HIGH0_CHAR_NEW = 0xb,
  ISAAC_PM_TD_RVB_HIGH0_CHAR_NO_PRE = 0x23,
  ISAAC_PM_TD_RVB_HIGH0_CHAR_SKIP_ALL = 8,
  ISAAC_PM_TD_RVB_HIGH0_COSTUME_FULL = 2,
  ISAAC_PM_TD_RVB_HIGH0_COSTUME_NO_PRE = 1,
  ISAAC_PM_TD_RVB_HIGH0_COSTUME_SKIP = 0,
  ISAAC_PM_TD_RVB_HIGH0_EXTRA_LIVES_OFF_1E74 = 0x1e74,
  ISAAC_PM_TD_RVB_HIGH0_EXTRA_LIVES_VALUE = 0x708,
  ISAAC_PM_TD_RVB_HIGH0_ITEM_ELEM_OFF = 0xc4,
  ISAAC_PM_TD_RVB_HIGH0_ITEM_VEC_BEGIN_OFF = 0x2a41c,
  ISAAC_PM_TD_RVB_HIGH0_ITEM_VEC_END_OFF = 0x2a420,
  ISAAC_PM_TD_RVB_HIGH1_CONST_134C = 1,
  ISAAC_PM_TD_RVB_HIGH1_NOTIFY_ARG = 0xe,
  ISAAC_PM_TD_RVB_HIGH2_1EFC_BITS = 0x40c00000,
  ISAAC_PM_TD_RVB_HIGH2_EFFECT_ID_2B0 = 0x2b0,
  ISAAC_PM_TD_RVB_HIGH2_NOTIFY_ARG = 6,
  ISAAC_PM_TD_RVB_NOTIFY_CLAMP_MAX = 7,
  ISAAC_PM_TD_RVB_NOTIFY_OFF_18308 = 0x18308,
  ISAAC_PM_TD_RVB_NOTIFY_OFF_18318 = 0x18318,
  ISAAC_PM_TD_RVB_NOTIFY_OFF_1831C = 0x1831c,
  ISAAC_PM_TD_RVB_OFF_1574 = 0x1574,
  ISAAC_PM_TD_RVB_OFF_BONE_1D88 = 0x1d88,
  ISAAC_PM_TD_RVB_OFF_RED_194C = 0x194c,
  ISAAC_PM_TD_RVB_OFF_TIMER_13BC = 0x13bc,
  ISAAC_PM_TD_RVB_OFF_TWIN_1D98 = 0x1d98,
  ISAAC_PM_TD_RVB_OFF_TWIN_1D9C = 0x1d9c,
  ISAAC_PM_TD_RVB_OR_1574_MASK = 0xffff,
  ISAAC_PM_TD_RVB_SFX_10A = 0x10a,
  ISAAC_PM_TD_RVB_SFX_1B = 0x1b,
  ISAAC_PM_TD_RVB_SFX_1C = 0x1c,
  ISAAC_PM_TD_RVB_SFX_50 = 0x50,
  ISAAC_PM_TD_RVB_SFX_VOL_1_0_BITS = 0x3f800000,
  ISAAC_PM_TD_RVB_SFX_VOL_1_25_BITS = 0x3fa00000,
  ISAAC_PM_TD_RVB_STAGE_CASE0 = 7,
  ISAAC_PM_TD_RVB_STAGE_CASE1 = 6,
  ISAAC_PM_TD_RVB_STAGE_CASE2 = 5,
  ISAAC_PM_TD_RVB_STAGE_CASE3 = 8,
  ISAAC_PM_TD_RVB_STAGE_EQ137 = 9,
  ISAAC_PM_TD_RVB_STR_PICKUP_VA = 0x00b61760,
  ISAAC_PM_TD_RVB_STR_SPARKLE_VA = 0x00b62268,
  ISAAC_PM_TD_RVB_TIMER_5A = 0x5a,
  ISAAC_PM_TD_RVB_VA_ADD_BLACK_HEARTS = 0x00758f90,
  ISAAC_PM_TD_RVB_VA_ADD_COSTUME = 0x0075d1d0,
  ISAAC_PM_TD_RVB_VA_ANIMATE = 0x007ab380,
  ISAAC_PM_TD_RVB_VA_CASE0_TAIL_HOST = 0x007791f0,
  ISAAC_PM_TD_RVB_VA_CONFIG_BY_CHAR = 0x0069bd10,
  ISAAC_PM_TD_RVB_VA_EFFECT_ADD_930220 = 0x00930220,
  ISAAC_PM_TD_RVB_VA_EFFECT_ADD_9302E0 = 0x009302e0,
  ISAAC_PM_TD_RVB_VA_EXIT_FLOOR = 0x007a3292,
  ISAAC_PM_TD_RVB_VA_EXIT_NOTIFY = 0x007a32b9,
  ISAAC_PM_TD_RVB_VA_GAME_NOTIFY_703670 = 0x00703670,
  ISAAC_PM_TD_RVB_VA_GET_COLLECTIBLE = 0x0072fd10,
  ISAAC_PM_TD_RVB_VA_HEAL_HOST = 0x007ca2d0,
  ISAAC_PM_TD_RVB_VA_HOST_7592A0 = 0x007592a0,
  ISAAC_PM_TD_RVB_VA_HOST_763570 = 0x00763570,
  ISAAC_PM_TD_RVB_VA_HOST_7BEBB0 = 0x007bebb0,
  ISAAC_PM_TD_RVB_VA_NOTIFY_SINK = 0x006fd7c0,
  ISAAC_PM_TD_RVB_VA_PRE_HOST_7C3620 = 0x007c3620,
  ISAAC_PM_TD_RVB_VA_UPDATE_RED_HEARTS = 0x007c9ea0,
  ISAAC_PM_TD_RVB_ZERO_MASK_CASE0 = 0xfc,
  ISAAC_PM_TD_RVB_ZERO_MASK_CASE1 = 0xf4,
  ISAAC_PM_TD_RVB_ZERO_MASK_CASE2 = 0xf7,
  ISAAC_PM_TD_RVB_ZERO_MASK_CASE3 = 0xfc,
  ISAAC_PM_TD_RVB_ZERO_MASK_DEFAULT = 0,
  ISAAC_PM_TD_RVB_ZERO_MASK_EQ137 = 0xe7,
  ISAAC_PM_TD_RVB_ZERO_MASK_HIGH0 = 0xfc,
  ISAAC_PM_TD_RVB_ZERO_MASK_HIGH1 = 0xf5,
  ISAAC_PM_TD_RVB_ZERO_MASK_HIGH2 = 0xfc,
  ISAAC_PM_TD_RVH_CHAIN_FIELD0_MATCH = 0x23,
  ISAAC_PM_TD_RVH_CHAIN_FIELD8_MATCH = 0x10,
  ISAAC_PM_TD_RVH_ID_CASE0 = 0xb,
  ISAAC_PM_TD_RVH_ID_CASE1 = 0x51,
  ISAAC_PM_TD_RVH_ID_CASE2 = 0xa1,
  ISAAC_PM_TD_RVH_ID_CASE3 = 0xd4,
  ISAAC_PM_TD_RVH_ID_HIGH0 = 0x14c,
  ISAAC_PM_TD_RVH_ID_HIGH1 = 0x26b,
  ISAAC_PM_TD_RVH_ID_HIGH2 = 0x2b0,
  ISAAC_PM_TD_RVH_ID_HIGH_BOUND = 0x137,
  ISAAC_PM_TD_RVH_REGION_DEFAULT = 3,
  ISAAC_PM_TD_RVH_REGION_EQ137 = 1,
  ISAAC_PM_TD_RVH_REGION_HIGH = 2,
  ISAAC_PM_TD_RVH_REGION_TABLE = 0,
  ISAAC_PM_TD_RVH_TABLE_BIAS = 0xb,
  ISAAC_PM_TD_RVH_TABLE_CASE_DEFAULT = 4,
  ISAAC_PM_TD_RVH_TABLE_LIMIT = 0xc9,
  ISAAC_PM_TD_RVH_VA_CASE0 = 0x7a2456,
  ISAAC_PM_TD_RVH_VA_CASE1 = 0x7a25e3,
  ISAAC_PM_TD_RVH_VA_CASE2 = 0x7a2811,
  ISAAC_PM_TD_RVH_VA_CASE3 = 0x7a26e4,
  ISAAC_PM_TD_RVH_VA_DEFAULT = 0x007a2a32,
  ISAAC_PM_TD_RVH_VA_EQ137 = 0x007a28e9,
  ISAAC_PM_TD_RVH_VA_HIGH = 0x007a2a11,
  ISAAC_PM_TD_RVH_VA_HIGH0 = 0x7a30a6,
  ISAAC_PM_TD_RVH_VA_HIGH1 = 0x7a2eeb,
  ISAAC_PM_TD_RVH_VA_HIGH2 = 0x7a2ab7,
  ISAAC_PM_TD_SEQ_ALT = 2,
  ISAAC_PM_TD_SEQ_FULL = 3,
  ISAAC_PM_TD_SEQ_NOT_DEAD = 0,
  ISAAC_PM_TD_SEQ_REMOVE = 1,
  ISAAC_PM_TD_STAGE17_ACCEPT_VALUE = 0xd,
  ISAAC_PM_TD_STAGE17_MGR_8_MATCH = 2,
  ISAAC_PM_TD_STAGE17_PATH_X = 0,
  ISAAC_PM_TD_STAGE17_PATH_Y = 1,
  ISAAC_PM_TD_STAGE17_RESULT_FALSE = 2,
  ISAAC_PM_TD_STAGE17_RESULT_HOST = 0,
  ISAAC_PM_TD_STAGE17_RESULT_TRUE = 1,
  ISAAC_PM_TD_TAIL_CHAR_MATCH = 0x1f,
  ISAAC_PM_TD_VA_MAIN = 0,
  ISAAC_PM_TD_VA_NOOP = 0,
  ISAAC_PM_TD_VA_REMOVE = 0,
  ISAAC_PM_UBH_BODY_BYTES = 227,
  ISAAC_PM_UBH_CALLSITES = 0,
  ISAAC_PM_UBH_CALLSITE_COUNT = 19,
  ISAAC_PM_UBH_GATE_LIMIT = 2,
  ISAAC_PM_UBH_OFF_BITS_1D8C = 0x1d8c,
  ISAAC_PM_UBH_VA_BODY = 0x007cabc0,
  ISAAC_PM_UBH_VA_RET_EARLY = 0x007cac22,
  ISAAC_PM_UBH_VA_RET_TAIL = 0x007caca2,
  ISAAC_PM_UBH_WORD_BITS = 0x20,
  ISAAC_PM_UPDATE_PURE_ABI_VERSION = 45,
  ISAAC_PM_URH_BODY_BYTES = 1071,
  ISAAC_PM_URH_CALLSITES = 0,
  ISAAC_PM_URH_CALLSITE_COUNT = 26,
  ISAAC_PM_URH_CHAR_1A = 0x1a,
  ISAAC_PM_URH_CHAR_5 = 5,
  ISAAC_PM_URH_ELEM_FIELD_78 = 0x78,
  ISAAC_PM_URH_ENT_OFF_DEAD_173 = 0x173,
  ISAAC_PM_URH_ENT_OFF_PARENT_410 = 0x410,
  ISAAC_PM_URH_ENT_OFF_SUBTYPE_30 = 0x30,
  ISAAC_PM_URH_ENT_OFF_TYPE_28 = 0x28,
  ISAAC_PM_URH_ENT_OFF_VARIANT_2C = 0x2c,
  ISAAC_PM_URH_ENT_SUBTYPE_SKIP_7 = 7,
  ISAAC_PM_URH_ENT_TYPE_3 = 3,
  ISAAC_PM_URH_ENT_VARIANT_EE = 0xee,
  ISAAC_PM_URH_F32_01_BITS = 0x3dcccccd,
  ISAAC_PM_URH_F32_01_VA = 0x00baa120,
  ISAAC_PM_URH_F32_03_BITS = 0x3e99999a,
  ISAAC_PM_URH_F32_03_VA = 0x00baa1f8,
  ISAAC_PM_URH_F32_08_BITS = 0x3f4ccccd,
  ISAAC_PM_URH_F32_08_VA = 0x00baa3a4,
  ISAAC_PM_URH_ID_19F = 0x19f,
  ISAAC_PM_URH_ID_1BA = 0x1ba,
  ISAAC_PM_URH_ID_1ED = 0x1ed,
  ISAAC_PM_URH_ID_26B = 0x26b,
  ISAAC_PM_URH_ID_7A = 0x7a,
  ISAAC_PM_URH_ID_NULL_6E = 0x6e,
  ISAAC_PM_URH_ITEMVEC_BEGIN_OFF = 0x2a41c,
  ISAAC_PM_URH_ITEMVEC_ELEM_OFF = 0x1b8,
  ISAAC_PM_URH_ITEMVEC_END_OFF = 0x2a420,
  ISAAC_PM_URH_ITEMVEC_SPAN_MIN = 0x1b8,
  ISAAC_PM_URH_OFF_1DA4 = 0x1da4,
  ISAAC_PM_URH_OFF_BYTE_13B5 = 0x13b5,
  ISAAC_PM_URH_OFF_BYTE_1824 = 0x1824,
  ISAAC_PM_URH_OFF_ETERNAL_1348 = 0x1348,
  ISAAC_PM_URH_OFF_FLAG_1574 = 0x1574,
  ISAAC_PM_URH_OFF_FRAME_264F8 = 0x264f8,
  ISAAC_PM_URH_OFF_OVERLAY_1C034 = 0x1c034,
  ISAAC_PM_URH_OFF_ROOM_11F0 = 0x11f0,
  ISAAC_PM_URH_OFF_ROOM_18300 = 0x18300,
  ISAAC_PM_URH_OFF_ROOM_COUNT_1254 = 0x1254,
  ISAAC_PM_URH_OFF_ROOM_LIST_124C = 0x124c,
  ISAAC_PM_URH_OR_1574_BIT = 1,
  ISAAC_PM_URH_ROOM_RECENT_MIN = 1,
  ISAAC_PM_URH_SHOW_DELAY = 3,
  ISAAC_PM_URH_SHOW_OVERLAY_ID = 3,
  ISAAC_PM_URH_SHOW_PLAYER_NULL = 0,
  ISAAC_PM_URH_SPRITE_530_OFF = 0x530,
  ISAAC_PM_URH_SPRITE_644_OFF = 0x644,
  ISAAC_PM_URH_STR_FLOATGLOW_VA = 0x00b6ae50,
  ISAAC_PM_URH_STR_FLOATNOGLOW_VA = 0x00b6ae44,
  ISAAC_PM_URH_THR2_LOW = 2,
  ISAAC_PM_URH_THR_HIGH = 0x10,
  ISAAC_PM_URH_THR_LOW = 1,
  ISAAC_PM_URH_VA_ANM2_PLAY = 0x0040a380,
  ISAAC_PM_URH_VA_BODY = 0x007c9ea0,
  ISAAC_PM_URH_VA_EFFECT_ADD_930220 = 0x00930220,
  ISAAC_PM_URH_VA_EFFECT_ADD_9302E0 = 0x009302e0,
  ISAAC_PM_URH_VA_END = 0x007ca2ce,
  ISAAC_PM_URH_VA_GULLET_7CE420 = 0x007ce420,
  ISAAC_PM_URH_VA_HAS_COLLECTIBLE = 0x007706e0,
  ISAAC_PM_URH_VA_HAS_EFFECT = 0x009305f0,
  ISAAC_PM_URH_VA_HAS_NULL_EFFECT = 0x00930680,
  ISAAC_PM_URH_VA_HOST_763570 = 0x00763570,
  ISAAC_PM_URH_VA_NEXT_FUNC = 0x007ca2d0,
  ISAAC_PM_URH_VA_OVERLAY_SHOW = 0x009ad210,
  ISAAC_PM_URH_VA_PROBE_6DACD0 = 0x006dacd0,
  ISAAC_PM_URH_VA_REMOVE_EFFECT = 0x009304a0,
  ISAAC_PM_URH_VA_RET = 0x007ca29a,
  ISAAC_PM_WALK_EMPTY_FATAL_LEVEL = 0x10,
  ISAAC_PM_WALK_EMPTY_FATAL_STR_VA = 0x00b7e6bc,
  ISAAC_PM_WALK_GAME_GLOBAL_VA = 0,
  ISAAC_PM_WALK_PLAN_BYTES = 36,
  ISAAC_PM_WALK_TICK_PLAN_BYTES = 44,
  ISAAC_PM_WALK_VA_CURSOR_LOAD = 0x009bb64a,
  ISAAC_PM_WALK_VA_ELIG_DEAD = 0x009bb64c,
  ISAAC_PM_WALK_VA_ELIG_IDLE_7C = 0x009bb655,
  ISAAC_PM_WALK_VA_ELIG_IDLE_8C = 0x009bb65b,
  ISAAC_PM_WALK_VA_ELIG_TWIN = 0x009bb664,
  ISAAC_PM_WALK_VA_FATAL_RELOAD = 0,
  ISAAC_PM_WALK_VA_LOOP_BACK = 0,
  ISAAC_PM_WALK_VA_LOOP_TOP = 0,
  ISAAC_PM_WALK_VA_SELECTOR = 0,
  ISAAC_PM_WALK_VA_TRIGGER_CALL = 0x009bb67d,
  ISAAC_PM_WALK_VA_TRIGGER_RELOAD = 0
};


typedef struct IsaacPlayerManagerIntensityPlayer {
  int32_t raw_1ea8;
  uint32_t flags_168;
  uint8_t dead_173;
} IsaacPlayerManagerIntensityPlayer;

typedef struct IsaacPlayerManagerDeathPlayer {
  int32_t anim_7c;
  int32_t twin_anim_7c;
  uint8_t dead_173;
  uint8_t anim_8c;
  uint8_t twin_null;
  uint8_t twin_anim_8c;
} IsaacPlayerManagerDeathPlayer;

typedef struct IsaacPlayerManagerIntensityPlan {
  float max_vol;
  int32_t sfx_start_needed;
  int32_t sfx_stop_candidate;
} IsaacPlayerManagerIntensityPlan;

typedef struct IsaacPlayerManagerHeartbeatPlan {
  float max_vol;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t pm2_pure;
  uint32_t sfx_id;
  int32_t play_frame_delay;
  int32_t play_loop;
  float play_pitch;
  float play_pan;
} IsaacPlayerManagerHeartbeatPlan;

typedef struct IsaacPlayerManagerDeathPlan {
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t death_walk_gate;
  int32_t pm1_pure;
  int32_t eligible_count;
  uint32_t eligible_mask;
  uint32_t trigger_death_va;
  int32_t trigger_arg;
} IsaacPlayerManagerDeathPlan;

typedef struct IsaacPlayerManagerSfxGate {
  int32_t kind;
  int32_t entry_count;
  int32_t entry_offset;
  int32_t index_in_range;
  int32_t warn_log_needed;
  int32_t probe_known;
  int32_t probe_result;
  int32_t voice_loop_needed;
  int32_t host_needed;
  int32_t pure_complete;
} IsaacPlayerManagerSfxGate;

typedef struct IsaacPlayerManagerPrePlayPlan {
  int32_t sound_id;
  uint32_t rng_seed_out;
  int32_t rng_advanced;
  int32_t host_lookup_needed;
  int32_t seed_zero_fatal;
  int32_t pure_complete;
} IsaacPlayerManagerPrePlayPlan;

typedef struct IsaacPlayerTriggerDeathOrderPlan {
  int32_t count;
  int32_t first_is_twin;
  int32_t second_is_twin;
  int32_t twin_present;
} IsaacPlayerTriggerDeathOrderPlan;

typedef struct IsaacPlayerPocketSlot {
  int32_t id;
  int32_t type;
} IsaacPlayerPocketSlot;

typedef struct IsaacPlayerTriggerDeathPocketPlan {
  int32_t found_index;
  int32_t found;
  int32_t shift_dwords;
  int32_t last_slot_id;
  int32_t last_slot_type;
  int32_t stores_applied;
} IsaacPlayerTriggerDeathPocketPlan;

typedef struct IsaacPmC0tPrePlan {
  uint32_t walked_addr;
  int32_t walk_terminated;
  int32_t pre_1344;
  int32_t health_type;
  int32_t new_1344;
  int32_t scan_runs;
  int32_t scan_index;
  int32_t scan_store_applied;
  uint32_t next_host_va;
} IsaacPmC0tPrePlan;

typedef struct IsaacPmC0tHealPlan {
  int32_t gate;
  int32_t capacity;
  int32_t applies;
  int32_t excess;
  uint32_t store_194c_after_host;
  uint32_t heal_host_va;
  uint32_t tail_host_va;
  uint32_t next_host_va;
} IsaacPmC0tHealPlan;

typedef struct IsaacPmUbhPlan {
  int32_t gate_open;
  int32_t new_bone;
  int32_t early_zero;
  int32_t total_slots;
  uint32_t mask;
  int32_t mask_applied;
  int32_t loop1_ran;
  int32_t loop2_entered;
  int32_t budget_after_loop1;
  int32_t final_1d88;
  uint32_t final_1d8c;
  uint32_t ret_va;
} IsaacPmUbhPlan;

typedef struct IsaacPmGhlInputs {
  int32_t game_26614;
  int32_t v2c;
  int32_t char_1;
  int32_t char_2;
  int32_t char_3;
  int32_t char_4;
  uint32_t keeper;
  uint32_t null78;
  uint32_t null79;
  uint32_t has26b_char1;
  int32_t gullet_7ce390;
  uint32_t has26b_charE;
  uint32_t has1f5;
  int32_t coins_1368;
  int32_t v1da0;
} IsaacPmGhlInputs;

typedef struct IsaacPmGhlPlan {
  int32_t result;
  uint32_t ret_va;
  int32_t base;
  int32_t keeper_skip;
  int32_t clamp_applied;
  int32_t probe78_issued;
  int32_t probe79_issued;
  int32_t has26b_char1_issued;
  int32_t gullet_issued;
  int32_t has26b_charE_issued;
  int32_t has1f5_issued;
  int32_t coin_bonus;
} IsaacPmGhlPlan;

typedef struct IsaacPmUrhInputs {
  int32_t game_26614_1; int32_t red_a; int32_t v1da4; int32_t dead_1; int32_t char_1;
  int32_t bone_1d88; int32_t red_194c; int32_t soul_134c; int32_t eternal_1348; int32_t red_b;
  uint32_t room_byte_1; int32_t frame_1; uint32_t room_11f0_1; uint32_t null6e; int32_t ent_count;
  int32_t scan_matches; uint32_t ivec_begin; uint32_t ivec_end; uint32_t elem_1b8; uint32_t elem_78;
  int32_t game_26614_2; int32_t dead_2; int32_t red_c; int32_t char_2; uint32_t has26b;
  uint32_t room_byte_2; int32_t frame_2; uint32_t room_11f0_2; uint32_t has7a; uint32_t eff7a;
  uint32_t byte_1824; uint32_t has19f; int32_t game_26614_3; int32_t red_d; int32_t max_d;
  uint32_t byte_13b5; int32_t char_3; int32_t p1340; int32_t p1d88; int32_t p1344;
  uint32_t eff19f_high; uint32_t eff19f_low; uint32_t has1ba; int32_t red_e; int32_t game_26614_4;
  int32_t max_e; uint32_t eff1ba_rm; uint32_t eff1ba_add; uint32_t has1ed; uint32_t eff1ed;
} IsaacPmUrhInputs;

typedef struct IsaacPmUrhProbes {
  uint32_t null6e; uint32_t has26b; uint32_t has7a; uint32_t eff7a; uint32_t has19f;
  uint32_t eff19f_high; uint32_t eff19f_low; uint32_t has1ba; uint32_t eff1ba_rm;
  uint32_t eff1ba_add; uint32_t has1ed; uint32_t eff1ed;
} IsaacPmUrhProbes;

typedef struct IsaacPmUrhPlan {
  int32_t fold_ran; int32_t store_1da4; int32_t store_1344;
  int32_t host_gullet; int32_t fg_gate; int32_t fg_sum;
  int32_t fg_sum_is_one; int32_t fg_room_gate; int32_t probe_null6e_issued;
  int32_t scan_ran; int32_t scan_matches; int32_t spawn_reached;
  int32_t host_show1; int32_t itemvec_gate; int32_t host_effect_930220;
  uint32_t pair_elem; uint32_t pair_elem78; int32_t g_reread_j1;
  int32_t w_thr0; int32_t w_low; int32_t w_char5; int32_t w_thr2;
  int32_t probe_has26b_issued; int32_t w_g_reload; int32_t w_room_gate;
  int32_t probe_has7a_issued; int32_t probe_eff7a_issued; int32_t host_show2;
  int32_t host_add_7a; int32_t probe_has19f_issued; int32_t c_ran;
  int32_t c_alt; int32_t probe_6dacd0_issued; int32_t probe_6dacd0_result;
  int32_t c_high; int32_t probe_eff19f_high_issued;
  int32_t probe_eff19f_low_issued; int32_t host_add_19f;
  int32_t host_remove_19f; uint32_t play_530_str_va; int32_t host_play_530;
  int32_t probe_has1ba_issued; int32_t d_ran; int32_t d_alt;
  int32_t d_add_side; int32_t probe_eff1ba_rm_issued;
  int32_t probe_eff1ba_add_issued; int32_t host_add_1ba;
  int32_t host_remove_1ba; uint32_t play_644_str_va; int32_t host_play_644;
  int32_t probe_has1ed_issued; int32_t probe_eff1ed_issued;
  int32_t store_1574_or1; int32_t host_763570; uint32_t ret_va;
} IsaacPmUrhPlan;

typedef struct IsaacPmHealInputs {
  int32_t amount;
  int32_t pre_initial_id;
  int32_t pre_game_null;
  int32_t pre_entry_found;
  uint32_t pre_seed;
  uint32_t pre_shift1;
  uint32_t pre_shift2;
  uint32_t pre_shift3;
  uint32_t anm_state_null;
  uint32_t anm_state34;
  uint32_t anm_a44;
  uint32_t anm_name_eq;
  uint32_t anm_set_result;
  uint32_t player_x340;
  uint32_t player_f350[4];
  uint32_t anm_pos_x[4][4];
  uint32_t anm_pos_y[4][4];
  uint32_t rng_f0[4];
  uint32_t rng_cnt[4];
  uint32_t rng_v2[4][4];
  uint32_t rng_spawn[4][4];
  int32_t tail_game_26614;
  uint32_t tail_count;
  uint32_t tail_free_flag;
  uint32_t tail_kind[8];
  uint32_t tail_is_player[8];
  uint32_t tail_frozen[8];
} IsaacPmHealInputs;

typedef struct IsaacPmHealPlan {
  int32_t applies;
  int32_t pre_id;
  uint32_t pre_seed_out;
  int32_t pre_advanced;
  int32_t pre_host;
  int32_t pre_fatal;
  int32_t sfx_play;
  int32_t spawn1;
  int32_t anm_load;
  int32_t anm_set_ran;
  int32_t anm_rewind_ran;
  int32_t vcall_a;
  int32_t spawn2;
  int32_t vcall_b;
  int32_t outer_runs;
  int32_t outer_overflow;
  uint32_t f0[4];
  int32_t inner_count[4];
  int32_t inner_overflow;
  uint32_t v2[4][4];
  uint32_t spawn_pos_x[4][4];
  uint32_t spawn_pos_y[4][4];
  int32_t tail_eligible;
  int32_t tail_frozen_cnt;
  int32_t tail_total;
  int32_t tail_overflow;
  int32_t list_free_ran;
  int32_t host_draws;
  uint32_t ret_va;
} IsaacPmHealPlan;

typedef struct IsaacPmHealEmitPlan {
  uint32_t applies;
  int32_t cap;
  uint32_t store;
  int32_t excess;
  uint32_t ret_va;
} IsaacPmHealEmitPlan;

typedef struct IsaacPmWalkIterPlan {
  int32_t count_top;
  int32_t fatal_top;
  int32_t count_sel;
  int32_t elem_index;
  uint32_t cursor;
  int32_t count_back;
  int32_t next_index;
  int32_t continues;
  int32_t base_reloaded;
} IsaacPmWalkIterPlan;

typedef struct IsaacPmWalkTickPlan {
  int32_t count_top;
  int32_t fatal_top;
  int32_t count_sel;
  int32_t elem_index;
  uint32_t cursor;
  int32_t count_back;
  int32_t next_index;
  int32_t continues;
  int32_t base_reloaded;
  int32_t cursor_eligible;
  int32_t should_trigger;
} IsaacPmWalkTickPlan;

typedef struct IsaacPmPrePlayChainPlan {
  int32_t residual_kind;
  int32_t playing;
  int32_t loud;
  int32_t host_needed;
  uint32_t probe_id;
  uint32_t probe_va;
  uint32_t receiver;
  int32_t receiver_reloaded;
  uint32_t call0_va;
  uint32_t call1_va;
  int32_t play_id;
  int32_t play_id_from_pre;
} IsaacPmPrePlayChainPlan;


/* =====================================================================
 * v21 — ABH: exact ZHL Entity_Player::AddBoneHearts(int amount)
 * @ 0x007ca840 prefix / gate peel. Body residual stays host
 * (narrowed != removed). Freestanding; not Update-wired.
 * v21 — ABH prefix/gate. test al,al not used here.
 */
enum {
  ISAAC_PM_ABH_VA_BODY = 0x007ca840,
  ISAAC_PM_ABH_VA_RET_TWIN = 0x007ca89c,
  ISAAC_PM_ABH_VA_RET_HT2 = 0x007ca9f8,
  ISAAC_PM_ABH_VA_NEXT_FUNC = 0x007caa00,
  ISAAC_PM_ABH_BODY_BYTES = 443,
  ISAAC_PM_ABH_CALLSITE_COUNT = 34,
  ISAAC_PM_ABH_PLAN_BYTES = 44,
  ISAAC_PM_ABH_WALK_CHAR = 0x28,
  ISAAC_PM_ABH_ESAU_CHAR = 0x11,
  ISAAC_PM_ABH_OFF_CHAR_13C0 = 0x13c0,
  ISAAC_PM_ABH_OFF_TWIN_1E68 = 0x1e68,
  ISAAC_PM_ABH_OFF_TWIN_1D98 = 0x1d98,
  ISAAC_PM_ABH_VA_GET_HEALTH_TYPE = 0x007cafe0,
  ISAAC_PM_ABH_VA_HOST_CACB0 = 0x007cacb0,
  ISAAC_PM_ABH_VA_HOST_URH = 0x007c9ea0,
  ISAAC_PM_ABH_VA_HOST_58850 = 0x00758850,
  ISAAC_PM_ABH_VA_HOST_GETTER = 0x007cb060,
  ISAAC_PM_ABH_VA_HOST_UBH = 0x007cabc0,
  ISAAC_PM_ABH_VA_HOST_GHL = 0x007cae60,
  ISAAC_PM_ABH_VA_HOST_58D00 = 0x00758d00,
  ISAAC_PM_ABH_VA_HOST_599D0 = 0x007599d0,
  ISAAC_PM_ABH_RESIDUAL_WALK_CAP = 0,
  ISAAC_PM_ABH_RESIDUAL_EARLY_HT2 = 1,
  ISAAC_PM_ABH_RESIDUAL_EARLY_HT3 = 2,
  ISAAC_PM_ABH_RESIDUAL_EARLY_TWIN = 3,
  ISAAC_PM_ABH_RESIDUAL_HOST_HT3 = 4,
  ISAAC_PM_ABH_RESIDUAL_HOST_HARD = 5,
  ISAAC_PM_ABH_RESIDUAL_HOST_NEG = 6,
  ISAAC_PM_ABH_RESIDUAL_HOST_POS = 7,
  ISAAC_PM_ABH_RESIDUAL_ESAU_HOP = 8
};

typedef struct IsaacPmAbhPlan {
  uint32_t walked_addr;
  int32_t walk_terminated;
  int32_t hops_28;
  int32_t hops_11;
  int32_t health_type;
  int32_t ht_probes;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  uint32_t ret_va;
  uint32_t next_host_va;
} IsaacPmAbhPlan;

int32_t isaac_pm_abh_walk_engaged(uint32_t char_type_13c0);
int32_t isaac_pm_abh_walk_continue(uint32_t char_type_13c0, uint32_t twin_1e68);
int32_t isaac_pm_abh_esau_engaged(uint32_t char_type_13c0);
int32_t isaac_pm_abh_esau_continue(uint32_t char_type_13c0, uint32_t twin_1d98);
int32_t isaac_pm_abh_ht2_early(int32_t health_type);
int32_t isaac_pm_abh_ht3_soul(int32_t health_type);
int32_t isaac_pm_abh_ht3_applies(int32_t health_type, int32_t amount);
int32_t isaac_pm_abh_game_hard(int32_t game_26614);
int32_t isaac_pm_abh_amount_neg(int32_t amount);
uint32_t isaac_pm_abh_walk_28(uint32_t player_addr, int32_t step_cap);
void isaac_pm_abh_prefix_plan(uint32_t char_type_13c0, uint32_t twin_1d98,
                              int32_t game_26614, int32_t amount,
                              IsaacPmAbhPlan* plan);
void isaac_pm_abh_run_pre(uint32_t player_addr, int32_t game_26614,
                          int32_t amount, int32_t walk_cap,
                          IsaacPmAbhPlan* plan);

/* =====================================================================
 * v22 — GHT: VA 0x007caa00, "GetHeartLimit" registration evidence,
 * NO exact ZHL (address-stable). Sibling after AddBoneHearts; the
 * v21 handoff's next frontier. FULLY PURE: 0 stores, 0 indirect, 2 E8
 * to already-pure leaves (0x7cafe0 GetHealthType, 0x7cae60
 * GetHealthLimit). 3 direct E8 callers 0x64eb74 / 0x6e975c /
 * 0x6ed8f4 (the family-death/revive band). ret 0, __thiscall, one
 * returned al predicate.
 */
enum {
  ISAAC_PM_GHT_VA_BODY = 0x007caa00,
  ISAAC_PM_GHT_VA_RET_ONE = 0x007caa84,
  ISAAC_PM_GHT_VA_RET_ZERO = 0x007caa8b,
  ISAAC_PM_GHT_VA_RET_HARD = 0x007caa9d,
  ISAAC_PM_GHT_BODY_BYTES = 158,
  ISAAC_PM_GHT_CALLSITE_COUNT = 3,
  ISAAC_PM_GHT_PLAN_BYTES = 44,
  ISAAC_PM_GHT_WALK_CHAR_28 = 0x28,
  ISAAC_PM_GHT_WALK_CHAR_11 = 0x11,
  ISAAC_PM_GHT_HARD_CAP_A0 = 0xa0,
  ISAAC_PM_GHT_OFF_CHAR_13C0 = 0x13c0,
  ISAAC_PM_GHT_OFF_TWIN_1E68 = 0x1e68,
  ISAAC_PM_GHT_OFF_TWIN_1D98 = 0x1d98,
  ISAAC_PM_GHT_OFF_V1340 = 0x1340,
  ISAAC_PM_GHT_OFF_V1D88 = 0x1d88,
  ISAAC_PM_GHT_VA_GET_HEALTH_TYPE = 0x007cafe0,
  ISAAC_PM_GHT_VA_GET_HEALTH_LIMIT = 0x007cae60,
  ISAAC_PM_GHT_VA_GAME_GLOBAL = 0x00c71678,
  ISAAC_PM_GHT_OFF_GAME_26614 = 0x26614
};

typedef struct IsaacPmGhtPlan {
  uint32_t walked_addr;
  int32_t walk_terminated;
  int32_t hops_28;
  int32_t hops_11;
  int32_t health_type;
  int32_t char_11_gate;
  int32_t limit;
  int32_t half_left;
  int32_t half_right;
  int32_t result;
  uint32_t ret_va;
} IsaacPmGhtPlan;

int32_t isaac_pm_ght_hard_gate(int32_t game_26614);
int32_t isaac_pm_ght_hard_result(int32_t v1340);
int32_t isaac_pm_ght_walk_engaged_28(uint32_t char_type_13c0);
int32_t isaac_pm_ght_walk_continue_28(uint32_t char_type_13c0,
                                      uint32_t twin_1e68);
int32_t isaac_pm_ght_walk_engaged_11(uint32_t char_type_13c0);
int32_t isaac_pm_ght_walk_continue_11(uint32_t char_type_13c0,
                                      uint32_t twin_1d98);
uint32_t isaac_pm_ght_walk(uint32_t player_addr, int32_t step_cap);
int32_t isaac_pm_ght_ht2_block(int32_t health_type);
int32_t isaac_pm_ght_char11_block(uint32_t char_type_13c0);
int32_t isaac_pm_ght_trunc_half(int32_t limit);
int32_t isaac_pm_ght_half_left(int32_t v1340, int32_t v1d88);
int32_t isaac_pm_ght_room_lt(int32_t half_left, int32_t half_right);
void isaac_pm_ght_plan(uint32_t player_addr, uint32_t game_addr,
                       int32_t walk_cap, uint32_t null78, uint32_t null79,
                       uint32_t has26b_char1, int32_t gullet,
                       uint32_t has26b_charE, uint32_t has1f5,
                       IsaacPmGhtPlan* plan);

/* =====================================================================
 * v23 — BTT: VA 0x007caaa0, NO exact ZHL (address-stable; the v22
 * handoff's "next sibling function"). FULLY PURE: 0 stores, 0 indirect,
 * 0 E8. 2 direct E8 callers 0x777013 / 0x7da98d (revive/heal band);
 * both consume the return with `test al, al` — bool in al.
 * ret 4 (__thiscall, ONE 4-byte stack arg = bit index).
 * Law: cmp [this+0x1d88],0 ; jle RET_ZERO (SIGNED count gate) ;
 * mov eax,1 ; shl eax,cl (x86 masks the count to CL & 31) ;
 * test [this+0x1d8c],eax ; je RET_ZERO ; mov al,1 ; ret 4 ;
 * RET_ZERO: xor al,al ; ret 4.
 */
enum {
  ISAAC_PM_BTT_VA_BODY = 0x007caaa0,
  ISAAC_PM_BTT_VA_RET_ONE = 0x007caac3,
  ISAAC_PM_BTT_VA_RET_ZERO = 0x007caac9,
  ISAAC_PM_BTT_BODY_BYTES = 42,
  ISAAC_PM_BTT_CALLSITE_COUNT = 2,
  ISAAC_PM_BTT_OFF_V1D88 = 0x1d88,
  ISAAC_PM_BTT_OFF_BITS_1D8C = 0x1d8c,
  ISAAC_PM_BTT_SHIFT_MOD = 31,
  ISAAC_PM_BTT_ARGBYTES = 4
};

int32_t isaac_pm_btt_count_gate(int32_t v1d88);
uint32_t isaac_pm_btt_mask(uint32_t bit_index);
int32_t isaac_pm_btt_bit_hit(uint32_t bits_1d8c, uint32_t bit_index);
int32_t isaac_pm_btt_result(int32_t v1d88, uint32_t bits_1d8c,
                            uint32_t bit_index);

/* =====================================================================
 * v24 — TPD: VA 0x007caad0 Entity_Player::TryPreventDeath (address-
 * stable). ret plain (__thiscall, self only); 7 direct rel32 callers
 * (0x7604cb, 0x762c6d, 0x777f94, 0x7a2062, 0x7c4fe3, 0x7c5b6c,
 * 0x7ceba0). 0 stores / 0 indirect / 3 E8 in the PRE-SWITCH span; pure
 * dispatch is in-module, case BODIES stay host: 0x7588a0 VERIFIED
 * IMPURE (host leaf: 4 E8 — 2x pure GetHealthType 0x7cafe0, host
 * HasCollectibleEffect 0x7706e0, sibling 0x758d00) -> host leaf;
 * 0x758a70 apply host; 0x7dd380 pure global-fatal leaf folded at the
 * CASE0-else callsite; the DEFAULT body's [0x134c] = 1 store stays host.
 * Law: sum [0x1d88]+[0x1344]+[0x134c] (wrapped 32-bit) != 0 -> RET_FALSE
 * (xor al,al @ 0x7cab9e); type = GetHealthType(this); cmp eax,4 ;
 * ja 0x7cab8d (UNSIGNED -> DEFAULT) ; jmp [eax*4+0x7caba8] with
 * table 0->CASE0(0x7cab3b), 1->DEFAULT(0x7cab8d), 2->DEFAULT,
 * 3->CASE3(0x7cab15), 4->CASE4(0x7cab07).
 */
enum {
  ISAAC_PM_TPD_VA_BODY = 0x007caad0,
  ISAAC_PM_TPD_VA_JUMP_TABLE = 0x007caba8,
  ISAAC_PM_TPD_VA_CASE0 = 0x007cab3b,
  ISAAC_PM_TPD_VA_CASE3 = 0x007cab15,
  ISAAC_PM_TPD_VA_CASE4 = 0x007cab07,
  ISAAC_PM_TPD_VA_DEFAULT = 0x007cab8d,
  ISAAC_PM_TPD_VA_RET_FALSE = 0x007caba4,
  ISAAC_PM_TPD_BODY_BYTES = 213,
  ISAAC_PM_TPD_CALLSITE_COUNT = 7,
  ISAAC_PM_TPD_CASE0 = 0,
  ISAAC_PM_TPD_CASE3 = 3,
  ISAAC_PM_TPD_CASE4 = 4,
  ISAAC_PM_TPD_CASE_DEFAULT = 1,
  ISAAC_PM_TPD_OFF_BONE_1D88 = 0x1d88,
  ISAAC_PM_TPD_OFF_SOUL_1344 = 0x1344,
  ISAAC_PM_TPD_OFF_ETERNAL_134C = 0x134c,
  ISAAC_PM_TPD_OFF_FATAL_1340 = 0x1340,
  ISAAC_PM_TPD_OFF_CHAR_13C0 = 0x13c0,
  ISAAC_PM_TPD_GAME_FIELD_26614 = 0x26614,
  ISAAC_PM_TPD_CHAR_12 = 0x12,
  ISAAC_PM_TPD_FATAL_CMP = 2,
  ISAAC_PM_TPD_DEFAULT_134C_VALUE = 1,
  ISAAC_PM_TPD_HOST_VA_HALF = 0x007588a0,
  ISAAC_PM_TPD_HOST_VA_APPLY = 0x00758a70,
  ISAAC_PM_TPD_HOST_VA_GLOBAL_FATAL = 0x007dd380,
  ISAAC_PM_TPD_C0_ELSE_GE2 = 8,
  ISAAC_PM_TPD_C0_ELSE_LT2 = 1
};

/* Gate: wrapped 32-bit sum of bone+soul+eternal hearts == 0 -> 1
 * (dispatch proceeds), else 0 (RET_FALSE @ 0x7cab9e). */
int32_t isaac_pm_tpd_gate(int32_t v1d88, int32_t v1344, int32_t v134c);
/* Jump-table selection: PM_TPD_CASE0 / CASE_DEFAULT / CASE3 / CASE4
 * with UNSIGNED over-range (ja) -> DEFAULT. */
int32_t isaac_pm_tpd_case(uint32_t health_type);
/* CASE0 char-type split: [0x13c0] == 0x12 (full dword). */
int32_t isaac_pm_tpd_case0_is_char12(uint32_t v13c0);
/* SIGNED fatal[0x1340] < 2 — runs the host half-heart call 0x7588a0
 * (shared by CASE3 0x7cab1c and CASE0-char12 0x7cab4d). */
int32_t isaac_pm_tpd_fatal_lt2(int32_t fatal1340);
/* CASE0-else: SIGNED fatal[0x1340] <= 0 -> DEFAULT body. */
int32_t isaac_pm_tpd_case0_fatal_le0(int32_t fatal1340);
/* CASE0-else host-call argument: fold of the PURE 0x7dd380(ecx=1)
 * callsite — game[0x26614] >= 2 (SIGNED) ? 8 : 1. */
int32_t isaac_pm_tpd_case0_else_fatal(int32_t game26614);

/* =====================================================================
 * v25 — GF: VA 0x007dd380 global-fatal scale leaf landed WHOLE in
 * general-ecx form (the v24 TPD unit consumed it only as the ecx=1
 * CASE0-else fold). ret plain (__thiscall, ecx input); 17 insns,
 * 0 E8 / 0 indirect / 0 mem-stores — PURE. Raw bytes (dump
 * 007dd380.txt): mov eax,[0xc71678] ; cmp [eax+0x26614],2 ;
 * lea eax,[ecx*8] (UNCONDITIONAL, 32-bit wrap) ; jge ret ;
 * mov eax,ecx ; ret. Law: game[0x26614] >= 2 (SIGNED jge) ?
 * ecx*8 : ecx. 21 direct rel32 E8 callers (0x758999, 0x775813,
 * 0x77583a, 0x778233, 0x778254, 0x7783cd, 0x778474, 0x78ab29,
 * 0x7b5255, 0x7b5274, 0x7b529d, 0x7b53a5, 0x7b53ce, 0x7b5451,
 * 0x7b54c7, 0x7c5edd, 0x7cab79 TPD, 0x7ce5a3, 0x7ce628,
 * 0x7ce668, 0x7da947); ecx is a genuine variable input
 * (0x7ce5a1 add ecx,ecx ; 0x7da944 lea ecx,[edi+1]).
 * [0xc71678] is the .data game-instance global (raw 0x7f6000 mapping:
 * .data VA 0xbf8000 raw 0x7f6000 — the pointer lives in .data, the
 * dereferenced field is passed as game26614).
 */
enum {
  ISAAC_PM_GF_VA_BODY = 0x007dd380,
  ISAAC_PM_GF_VA_RET = 0x007dd397,
  ISAAC_PM_GF_BODY_BYTES = 24,
  ISAAC_PM_GF_CALLSITE_COUNT = 21,
  ISAAC_PM_GF_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_GF_GAME_FIELD = 0x26614,
  ISAAC_PM_GF_CMP = 2,
  ISAAC_PM_GF_SCALE = 8,
  ISAAC_PM_GF_SCALE_SHIFT = 3
};

/* PURE leaf 0x7dd380 whole: game[0x26614] >= 2 (SIGNED jge) is the
 * branch; the lea ecx*8 runs unconditionally with 32-bit wrap. */
int32_t isaac_pm_global_fatal_scale(int32_t game26614, int32_t ecx);

/* =====================================================================
 * v26 — BF: VA 0x007db0a0 flag/effect decision island (NARROWED).
 * thiscall, ret plain. 73 insns, 2 E8 (0x7cb6e0 count resolver HUD v19
 * host event, 0x930220 effect-add host event — BOTH already typed PM
 * host events, bodies stay host), 0 indirect, 1 observable store
 * (byte [this+0x1eec]). Bounds 0x007db0a0..0x007db152 (ret), 179
 * bytes; int3 pad 0x007db153..0x007db15f; next function 0x007db160.
 * 3 direct rel32 E8 callers (0x7616b8, 0x7ad8c7, 0x7ad8e7). Address-
 * stable (no exact-ZHL claim).
 * Machine law (cpu-dump/007db0a0.txt):
 *   count = countResolver(this, 0x79)                 [HOST sample]
 *   mapped = count==0 ? 0 : count==1 ? 1 : 2           (sub/je chain)
 *   flag  = byte [this + 0x1eec]
 *   delta = SIGNED max(0, mapped - (flag & 0xf))       (cmovs clamp)
 *   delta == 0 -> early epilogue: NO store, NO host call
 *   size  = ((end - begin) & ~3) from [game+0x2a404..0x2a408]
 *   host call 0x930220(this+0x1508, &buf16, 1, 1) runs iff
 *     SIGNED size > 0x4e4 && slot = [begin+0x4e4] != 0
 *   new_flag = byte (((flag & 0xf0) + 0x10) | (flag & 0xf))  (8-bit
 *     add al,0x10 WRAPS: 0xf0+0x10 -> 0x00); STORED iff delta != 0.
 *   Store-site recapture: the transform input is the flag byte RELOADED
 *     at 0x7db136 AFTER the host call on the host path; the pre-call
 *     load on the skip path. Export takes whichever byte the PE uses.
 * ===================================================================== */
enum {
  ISAAC_PM_BF_VA_BODY = 0x007db0a0,
  ISAAC_PM_BF_VA_RET = 0x007db152,
  ISAAC_PM_BF_BODY_BYTES = 179,
  ISAAC_PM_BF_CALLSITE_COUNT = 3,
  ISAAC_PM_BF_COUNT_ID = 0x79,
  ISAAC_PM_BF_FLAG_OFF = 0x1eec,
  ISAAC_PM_BF_GAME_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_BF_VEC_BEGIN_OFF = 0x2a404,
  ISAAC_PM_BF_VEC_END_OFF = 0x2a408,
  ISAAC_PM_BF_SIZE_CMP = 0x4e4,
  ISAAC_PM_BF_SLOT_OFF = 0x4e4,
  ISAAC_PM_BF_RECEIVER_OFF = 0x1508,
  ISAAC_PM_BF_HOST_VA_COUNT = 0x007cb6e0,
  ISAAC_PM_BF_HOST_VA_EFFECT = 0x00930220,
  ISAAC_PM_BF_FLAG_INC = 0x10
};

/* NARROWED 0x7db0a0 decision laws: count map (0/1/2), SIGNED-clamped
 * delta, proceed gate (delta != 0), effect-call gates, byte flag
 * transform. All scalar params are int32_t/uint32_t — zero uint8_t. */
int32_t isaac_pm_7db0a0_map_count(int32_t count);
uint32_t isaac_pm_7db0a0_delta(int32_t count, uint32_t flag);
int32_t isaac_pm_7db0a0_proceed(int32_t count, uint32_t flag);
int32_t isaac_pm_7db0a0_size_gate(uint32_t begin, uint32_t end);
int32_t isaac_pm_7db0a0_host_needed(uint32_t begin, uint32_t end, uint32_t slot);
uint32_t isaac_pm_7db0a0_flag_next(uint32_t flag);

/* =====================================================================
 * v27 — BQ: VA 0x007db160 small-host decision island (NARROWED), the
 * body directly AFTER the v26 0x7db0a0 island in the 0x7db0xx queue
 * band (same flag byte [this+0x1eec], same count resolver 0x7cb6e0,
 * same size-gate law). thiscall, ret plain. 124 insns, 4 E8
 * (0x7cb6e0 count resolver HUD v19 host event, 0x9303f0 effect-add
 * sibling of typed host 0x930220 — NEW typed host, 0x75d850 x2 =
 * exact-ZHL Entity_Player::RemoveCostume — NEW typed host), 0 indirect,
 * 1 observable store (byte [this+0x1eec] at 0x7db2b4). Bounds
 * 0x007db160..0x007db2c0 (ret), 352 bytes; int3 pad 0x7db2c1..0x7db2cf.
 * 3 direct rel32 E8 callers (0x79023a, 0x7adba4, 0x7adbc1). Address-
 * stable (no exact-ZHL claim).
 * Machine law (disasm-007db160.txt):
 *   count  = countResolver(this, 0x79)                [HOST sample]
 *   mapped = count==0 ? 0 : count==1 ? 1 : 2           (sub/je chain)
 *   flag   = byte [this + 0x1eec] (PRE-LOOP load)
 *   delta  = SIGNED max(0, mapped - (flag & 0xf))       (cmovs clamp)
 *   high   = flag >> 4
 *   UNSIGNED high <= delta -> SKIP the loop entirely (store no-op:
 *     the epilogue then stores (high<<4)|(flag&0xf) == flag)
 *   else loopCount = high - delta iterations; per iteration:
 *     size = ((end - begin) & ~3) from [game+0x2a404..0x2a408]
 *     effectAdd 0x9303f0(this+0x1508, &buf16, 1) runs iff
 *       SIGNED size > 0x4e4 && slot = [begin+0x4e4] != 0
 *     walk [this+0x1519]!=0 or [this+0x150c]==[this+0x1510] ->
 *       RemoveCostume(this, size>0x4e4 ? [begin+0x4e4] : 0)
 *     walk: entry=[iter]; type=entry->[0] in {1,3,4} && entry->[4]==
 *       0x139 found; iter->[4] > 0 (SIGNED) -> SKIP RemoveCostume
 *     (walk outcome does NOT change the stored flag: both joins
 *      converge at 0x7db29a with identical ebx/esi bookkeeping)
 *   new_flag = (delta << 4) | (reloaded_flag & 0xf) with reloaded_flag
 *     = byte RELOADED at 0x7db2a6 AFTER all host calls (post-call
 *     recapture); the skip path stores the pre-loop flag unchanged.
 *   Store-site recapture: export takes whichever byte the PE uses
 *     (caller contract, same as v26 flag_next).
 * ===================================================================== */
enum {
  ISAAC_PM_BQ_VA_BODY = 0x007db160,
  ISAAC_PM_BQ_VA_RET = 0x007db2c0,
  ISAAC_PM_BQ_BODY_BYTES = 352,
  ISAAC_PM_BQ_CALLSITE_COUNT = 3,
  ISAAC_PM_BQ_COUNT_ID = 0x79,
  ISAAC_PM_BQ_FLAG_OFF = 0x1eec,
  ISAAC_PM_BQ_GAME_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_BQ_VEC_BEGIN_OFF = 0x2a404,
  ISAAC_PM_BQ_VEC_END_OFF = 0x2a408,
  ISAAC_PM_BQ_SIZE_CMP = 0x4e4,
  ISAAC_PM_BQ_SLOT_OFF = 0x4e4,
  ISAAC_PM_BQ_RECEIVER_OFF = 0x1508,
  ISAAC_PM_BQ_WALK_GATE_OFF = 0x1519,
  ISAAC_PM_BQ_WALK_BEGIN_OFF = 0x150c,
  ISAAC_PM_BQ_WALK_END_OFF = 0x1510,
  ISAAC_PM_BQ_WALK_STRIDE = 0x10,
  ISAAC_PM_BQ_WALK_ID_CMP = 0x139,
  ISAAC_PM_BQ_HOST_VA_COUNT = 0x007cb6e0,
  ISAAC_PM_BQ_HOST_VA_EFFECT = 0x009303f0,
  ISAAC_PM_BQ_HOST_VA_REMOVE_COSTUME = 0x0075d850
};

/* NARROWED 0x7db160 decision laws: count map (0/1/2), SIGNED-clamped
 * delta, UNSIGNED run-loop gate, loop iteration count, effect-call
 * gates (size gate drives BOTH the 0x9303f0 gate and the 0x75d850 arg
 * selection), recapture-aware byte flag transform. All scalar params
 * are int32_t/uint32_t — zero uint8_t. */
int32_t isaac_pm_7db160_map_count(int32_t count);
uint32_t isaac_pm_7db160_delta(int32_t count, uint32_t flag);
int32_t isaac_pm_7db160_run_loop(uint32_t flag, uint32_t delta);
uint32_t isaac_pm_7db160_loop_count(uint32_t flag, uint32_t delta);
int32_t isaac_pm_7db160_size_gate(uint32_t begin, uint32_t end);
int32_t isaac_pm_7db160_effect_host_needed(uint32_t begin, uint32_t end, uint32_t slot);
uint32_t isaac_pm_7db160_flag_store(int32_t count, uint32_t flag, uint32_t reloaded_flag);

/* =====================================================================
 * v28 — BR: VA 0x007db2d0 small-host advance island (NARROWED), the
 * function the v27 header records as "next function 0x007db2d0"
 * (0x7db200 is INSIDE the landed v27 body — stale note). thiscall,
 * ret plain. 41 insns, 1 E8 (0x7cb6e0 count resolver HUD v19 typed
 * host event — body stays host), 0 indirect, 1 observable store
 * (byte [this+0x1eec] at 0x7db31f). Bounds 0x007db2d0..0x007db32c
 * (last ret), 92 bytes; int3 pad 0x7db32d..0x7db32f; next function
 * 0x007db330. 1 direct rel32 E8 caller (0x774114 — a large PM
 * effect-receiver band 0x7740d0 that also calls 0x7db330, the
 * 0x930xxx effect family, and 0x7cb6e0). Address-stable (no exact-ZHL
 * claim).
 * Machine law (disasm-007db2d0.txt):
 *   count  = countResolver(this, 0x79)                [HOST sample]
 *   mapped = count==0 ? 0 : count==1 ? 1 : 2           (sub/je chain)
 *   flag   = byte [this + 0x1eec] (ONE load — no recapture: the only
 *     host call 0x7cb6e0 precedes the load and no host call runs
 *     between the load at 0x7db2f4 and the store at 0x7db31f)
 *   delta  = SIGNED max(0, mapped - (flag & 0xf))       (cmovs clamp)
 *   delta == 0 -> early epilogue: NO store, return 0
 *   else advance: high = (flag & 0xff) >> 4 ; low = flag & 0xff
 *     new_flag = (((high - 1) & 0xf) << 4) | ((low + 1) & 0xf)
 *     (8-bit wrap on BOTH nibbles: dec al from high 0 -> 0xf, shl 4
 *      -> 0xf0; inc dl from low 0xf -> 0x00, and dl,0xf -> 0);
 *     STORED at [this+0x1eec]; return 1.
 *   Effective byte after the call = proceed ? advance : flag.
 * ===================================================================== */
enum {
  ISAAC_PM_BR_VA_BODY = 0x007db2d0,
  ISAAC_PM_BR_VA_RET_ONE = 0x007db328,
  ISAAC_PM_BR_VA_RET_ZERO = 0x007db32c,
  ISAAC_PM_BR_BODY_BYTES = 92,
  ISAAC_PM_BR_CALLSITE_COUNT = 1,
  ISAAC_PM_BR_COUNT_ID = 0x79,
  ISAAC_PM_BR_FLAG_OFF = 0x1eec,
  ISAAC_PM_BR_HOST_VA_COUNT = 0x007cb6e0,
  ISAAC_PM_BR_CALLER_VA = 0x00774114
};

/* NARROWED 0x7db2d0 decision laws: count map (0/1/2), SIGNED-clamped
 * delta, proceed gate (delta != 0 — drives the return value AND the
 * store), byte flag advance transform (8-bit wrap on both nibbles,
 * no recapture), effective store composition. All scalar params are
 * int32_t/uint32_t — zero uint8_t. */
int32_t isaac_pm_7db2d0_map_count(int32_t count);
uint32_t isaac_pm_7db2d0_delta(int32_t count, uint32_t flag);
int32_t isaac_pm_7db2d0_proceed(int32_t count, uint32_t flag);
uint32_t isaac_pm_7db2d0_flag_advance(uint32_t flag);
uint32_t isaac_pm_7db2d0_flag_store(int32_t count, uint32_t flag);

/* =====================================================================
 * v29 — BS: VA 0x007db330 scale island (NARROWED), the function the
 * v28 header/notes record as "next function 0x007db330" (pushed right
 * after the v28 0x7db2d0 body in the same code region; first insn
 * `mov eax,[0xc71678]` matches the wave-19 handoff note). __stdcall
 * ret 4 (callee pops 1 dword arg). 19 insns, 0 E8, 0 indirect,
 * 0 observable mem-stores. Bounds 0x007db330..0x007db35b (last ret),
 * 43 bytes; int3 pad 0x7db35e..0x7db35f; next function 0x007db360.
 * 6 direct rel32 E8 callers (0x7741ac, 0x7741d4, 0x774277 in the
 * 0x7740d0 PM effect-receiver band — the SAME band that calls the
 * v28 0x7db2d0 body — plus 0x778656, 0x7787bd, 0x7787ed in the
 * 0x778xxx band). All six feed the PM slot-count field [edi+0x13bc]
 * (store / add / imul accumulation in the caller). Receiver = edi =
 * PM (band [edi+0x1508] matches ISAAC_PM_BF/BQ_RECEIVER_OFF).
 * Address-stable (no exact-ZHL claim).
 * Machine law (disasm-007db330.txt):
 *   g_Game = [0xc71678]                  (mov eax,[0xc71678])
 *   mode   = dword [Game + 0x26614]      (full-dword, family-wide
 *     timedTransitionCleanupMode field — host sample)
 *   mode < 2 (SIGNED jl) -> epilogue 0x7db358: return arg UNCHANGED
 *   else: eax = 1 ; ecx = arg >>> 3 (shr LOGICAL) ;
 *     arg >= 0x10 (SIGNED cmovge) -> eax = arg >>> 3
 *     -> return (int32)arg >= 0x10 ? (arg >>> 3) : 1
 *   NO byte loads anywhere in the body — both compares and the
 *   shift are FULL-DWORD (no uint8_t risk, no & 0xff narrow).
 * ===================================================================== */
enum {
  ISAAC_PM_BS_VA_BODY = 0x007db330,
  ISAAC_PM_BS_VA_RET_SCALED = 0x007db355,
  ISAAC_PM_BS_VA_RET_RAW = 0x007db35b,
  ISAAC_PM_BS_BODY_BYTES = 43,
  ISAAC_PM_BS_CALLSITE_COUNT = 6,
  ISAAC_PM_BS_CALLER0_VA = 0x007741ac,
  ISAAC_PM_BS_CALLER1_VA = 0x007741d4,
  ISAAC_PM_BS_CALLER2_VA = 0x00774277,
  ISAAC_PM_BS_CALLER3_VA = 0x00778656,
  ISAAC_PM_BS_CALLER4_VA = 0x007787bd,
  ISAAC_PM_BS_CALLER5_VA = 0x007787ed,
  ISAAC_PM_BS_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_BS_MODE_OFF = 0x26614,
  ISAAC_PM_BS_MODE_CMP = 2,
  ISAAC_PM_BS_SCALE_SHIFT = 3,
  ISAAC_PM_BS_MIN_ARG = 0x10
};

/* NARROWED 0x7db330 decision laws: SIGNED mode >= 2 gate (the
 * family-wide Game+0x26614 sense), arg scale select (SIGNED >= 0x10
 * keeps the LOGICAL arg >> 3, otherwise 1), whole-body composition
 * (gate ? scale : arg). All scalar params are uint32_t — zero
 * uint8_t, zero byte gates (no & 0xff in any body). */
int32_t isaac_pm_7db330_mode_ge2(uint32_t mode);
uint32_t isaac_pm_7db330_scale(uint32_t arg);
uint32_t isaac_pm_7db330_value(uint32_t arg, uint32_t mode);

/* =====================================================================
 * v30 — BT: VA 0x007db360 soul/fatal ratio-window island (NARROWED),
 * the function the v29 header/notes record as "next function
 * 0x007db360" (pushed right after the v29 0x7db330 body; prologue
 * `mov eax,[0xc71678]` matches the wave-20 handoff note). thiscall,
 * plain ret, ZERO stack args, bool result in al. 26 insns, 0 E8,
 * 0 indirect, 0 observable mem-stores. Bounds 0x007db360..0x007db3ac
 * (last ret), 76 bytes; int3 pad 0x7db3ad..0x7db3af; next function
 * 0x007db3b0. 2 direct rel32 E8 callers (0x797be5, 0x7a8afd — PM
 * effect bands whose host APIs 0x7706e0/0x9305f0/0x9302e0 + id 0x1ba
 * are already pinned family-wide by the URH island; both receivers
 * `mov ecx, edi` and consume al with test al,al). Receiver = edi =
 * Entity_Player ([edi+0x1340]/[edi+0x1344] match the family-wide
 * C0T/GHT/TPD fatal/soul field pins; [edi+0x1508] matches
 * ISAAC_PM_BF/BQ_RECEIVER_OFF). Address-stable (no exact-ZHL claim).
 * Machine law (cpu-dump/007db360.txt):
 *   g_Game = [0xc71678]                  (mov eax,[0xc71678])
 *   mode   = dword [Game + 0x26614]      (full-dword, family-wide
 *     timedTransitionCleanupMode field — host sample)
 *   soul   = dword [this + 0x1344]       (host sample, ONE load —
 *     mov edx before the mode cmp, reused by BOTH epilogues)
 *   fatal  = dword [this + 0x1340]       (host sample)
 *   mode < 2 (SIGNED jl 0x7db372) -> epilogue 0x7db3a6:
 *     cmp edx,2 ; sete al — return soul == 2 (full-dword equality)
 *   else: r = (float)(int32)soul / (float)(int32)fatal (cvtdq2ps
 *     SIGNED converts, divss round-to-nearest) ;
 *     comiss r,[0xbaa120=0.1f] ; jb -> 0 (LESS OR UNORDERED — NaN
 *     0/0 lands here) ; comiss [0xbaa1f8=0.3f],r ; jb -> 0 (0.3f < r,
 *     so +inf exits here) ; else al=1 -> ordered 0.1f <= r <= 0.3f
 *     INCLUSIVE both ends (same comiss pair + same constants as
 *     isaac_pm_urh_d_add_band, ratio operand order soul/fatal).
 *   NO byte loads anywhere in the body — the mode gate, both field
 *   reads, both float constants, and the EQ2 compare are FULL-DWORD
 *   (no uint8_t risk, no & 0xff narrow).
 * ===================================================================== */
enum {
  ISAAC_PM_BT_VA_BODY = 0x007db360,
  ISAAC_PM_BT_VA_RET_ONE = 0x007db3a2,
  ISAAC_PM_BT_VA_RET_ZERO = 0x007db3a5,
  ISAAC_PM_BT_VA_RET_EQ2 = 0x007db3ac,
  ISAAC_PM_BT_BODY_BYTES = 76,
  ISAAC_PM_BT_CALLSITE_COUNT = 2,
  ISAAC_PM_BT_CALLER0_VA = 0x00797be5,
  ISAAC_PM_BT_CALLER1_VA = 0x007a8afd,
  ISAAC_PM_BT_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_BT_MODE_OFF = 0x26614,
  ISAAC_PM_BT_MODE_CMP = 2,
  ISAAC_PM_BT_SOUL_OFF = 0x1344,
  ISAAC_PM_BT_FATAL_OFF = 0x1340,
  ISAAC_PM_BT_EQ2 = 2,
  ISAAC_PM_BT_F32_LO_BITS = 0x3dcccccd,
  ISAAC_PM_BT_F32_LO_VA = 0x00baa120,
  ISAAC_PM_BT_F32_HI_BITS = 0x3e99999a,
  ISAAC_PM_BT_F32_HI_VA = 0x00baa1f8
};

/* NARROWED 0x7db360 decision laws: SIGNED mode >= 2 gate (the
 * family-wide Game+0x26614 sense), SIGNED int32->f32 ratio bits
 * (cvtdq2ps + divss), ordered 0.1f..0.3f window (NaN/inf -> 0,
 * inclusive both ends — same comiss pair as the URH d_add_band law),
 * full-dword soul == 2 fallback, whole-body composition
 * (gate ? window : eq2). All scalar params are uint32_t — zero
 * uint8_t, zero byte gates (no & 0xff in any body). */
int32_t isaac_pm_7db360_mode_ge2(uint32_t mode);
uint32_t isaac_pm_7db360_ratio_bits(uint32_t soul, uint32_t fatal);
int32_t isaac_pm_7db360_window(uint32_t soul, uint32_t fatal);
int32_t isaac_pm_7db360_eq2(uint32_t soul);
int32_t isaac_pm_7db360_value(uint32_t soul, uint32_t fatal, uint32_t mode);

/* =====================================================================
 * v31 — BU: VA 0x007db3b0 revive-queue body (NARROWED), the function
 * the v30 header/notes record as "next function 0x007db3b0" (starts
 * `push ebp` — plain prologue, not a g_Game reader). thiscall, plain
 * ret, ZERO stack args, VOID return (no al contract). 245 insns, 1
 * ret @ 0x007db699; MSVC SEH frame (push -1 / 0xb00565 / fs:[0]
 * chain) + __security_cookie (xor ebp,[0xbf93b4]); unwind tail call
 * [0xb18894] @ 0x7db69a; int3 pad 0x7db6a0..0x7db6ad; next function
 * 0x007db6b0. 1
 * direct rel32 E8 caller (0x73f3c6 — a per-player loop in a room-
 * wide teardown/revive pass that pre-clears the same vector via
 * 0x7dad80 and later runs the Game+0x1da04 scan 0x9a8970 / the
 * Game+0x26614 mode gate 0x9bba30 / 0x993a70 / 0x8271e0 — PM-band
 * host, do-not-reopen). Receiver = edi = Entity_Player (byte flags
 * +0x172/+0x170, char +0x13c0, twins +0x1e68/+0x1e6c, dead +0x171,
 * id +0x1618, node anchor +0x20dc — all family/hud-family pins).
 * Address-stable (no exact-ZHL claim). Machine law
 * (cpu-dump/007db3b0.txt):
 *   byte [this+0x172] != 0 AND byte [this+0x170] != 0 — the entry
 *     gates (cmp byte ptr, both je the common void epilogue
 *     0x7db688; param bytes masked & 0xff in-module)
 *   g_Game = [0xc71678] ; container = [Game+0x18300] + 0x1218 ;
 *     fill of a local struct {byte flag @-0x38, begin @-0x34,
 *     count @-0x2c} via 0x41af60 (3,-1,-1,0,0)            — HOST
 *   walk over the fill array (UNSIGNED count bound): entry != 0 &&
 *     [entry+0x28] == 3 && [entry+0x410] == this (FULL-DWORD) ->
 *     virtual [entry+0x28] call (host); filter exported
 *   char = dword [this+0x13c0] (FULL-DWORD) dispatched by
 *     sub 0x26 / je -> STORE 0x1d ; sub 1 / jne -> unchanged ;
 *     else STORE 0x25 (no host call between the read and the
 *     store; the later vtable call re-reads the stored value)
 *   node = (twinA != 0 ? twinA : (twinB != 0 ? twinB : 0)) + 0x20dc
 *     (32-bit wrap; 0 when both null; twinA-first; the
 *     &[ebp-0x28] == node guards are DEAD compiler aliasing
 *     checks — a stack local can never equal twin+0x20dc)
 *   local0 = node[0]/own[0], local1 = node[1]/own[1] (the cut
 *     triples — multi-slot pure data movement, stays host);
 *     local0 != local1 (FULL-DWORD) -> the transfer loop + sized
 *     delete + node reviver 0x7daed0
 *   host leaves: 0x757ac0(this,1), vtable slot 1 (this, [0x28],
 *     [0x2c], char, [0x3ec]), SetControllerIndex 0x7a6450 x3
 *     (this/twinA/twinB, saved id [0x1618], 0), reviver 0x7daed0
 *     x2, sized delete 0xaef15c, alloc wrapper 0xa648b0 (mode
 *     cl=1) when byte [ebp-0x38] == 0, [this+0x171]=0 /
 *     [twinA+0x171]=0 clears, [this+0x16b4] store.
 *   BYTE-GATE discipline: engage() is the ONLY byte-gated law (cmp
 *   byte ptr in the PE -> & 0xff); the other four are FULL-DWORD
 *   (zero & 0xff anywhere; zero uint8_t params).
 * ===================================================================== */
enum {
  ISAAC_PM_BU_VA_BODY = 0x007db3b0,
  ISAAC_PM_BU_VA_RET = 0x007db699,
  ISAAC_PM_BU_BODY_BYTES = 745,
  ISAAC_PM_BU_CALLSITE_COUNT = 1,
  ISAAC_PM_BU_CALLER0_VA = 0x0073f3c6,
  ISAAC_PM_BU_E8_COUNT = 9,
  ISAAC_PM_BU_INDIRECT_COUNT = 3,
  ISAAC_PM_BU_STORE_COUNT = 50,
  ISAAC_PM_BU_GATE_172_OFF = 0x172,
  ISAAC_PM_BU_GATE_170_OFF = 0x170,
  ISAAC_PM_BU_TYPE_OFF = 0x28,
  ISAAC_PM_BU_TYPE_CMP = 3,
  ISAAC_PM_BU_OWNER_OFF = 0x410,
  ISAAC_PM_BU_CHAR_OFF = 0x13c0,
  ISAAC_PM_BU_CHAR_26 = 0x26,
  ISAAC_PM_BU_CHAR_27 = 0x27,
  ISAAC_PM_BU_CHAR_26_NEW = 0x1d,
  ISAAC_PM_BU_CHAR_27_NEW = 0x25,
  ISAAC_PM_BU_TWIN_A_OFF = 0x1e68,
  ISAAC_PM_BU_TWIN_B_OFF = 0x1e6c,
  ISAAC_PM_BU_NODE_OFF = 0x20dc
};

/* NARROWED 0x7db3b0 decision laws: the byte entry gates (0x172/0x170
 * both non-zero — & 0xff masks, the body's ONLY byte gates), the walk
 * entry filter (entry != 0 && [0x28] == 3 && [0x410] == this, full
 * dword), the char state machine (0x26 -> 0x1d, 0x27 -> 0x25, else
 * unchanged — full dword, stores exported as the stored value), the
 * twinA-first node pick (+ 0x20dc 32-bit wrap, 0 when both null), and
 * the transfer-loop gate (local0 != local1, full dword). All scalar
 * params are uint32_t — zero uint8_t; engage() masks & 0xff, the rest
 * never mask. */
int32_t isaac_pm_7db3b0_engage(uint32_t flag_172, uint32_t flag_170);
int32_t isaac_pm_7db3b0_entry_match(uint32_t entry, uint32_t type_28,
                                    uint32_t owner_410, uint32_t self);
uint32_t isaac_pm_7db3b0_char_next(uint32_t cur);
uint32_t isaac_pm_7db3b0_node_addr(uint32_t twin_a, uint32_t twin_b);
int32_t isaac_pm_7db3b0_loop_needed(uint32_t local0, uint32_t local1);

/* =====================================================================
 * v32 — BV: VA 0x007da770 char+collectible bool gate (NARROWED), the
 * FIRST caller-bearing unlanded body of the band net-audit
 * (0x7da000..0x7dc000; v31 handoff's "next function 0x007db6b0" sits
 * ABOVE this island at 0x7db6b0 — still open, see band table in
 * output/decomp/5129df723e64/section-notes/pm-v32-net/NOTES.md).
 * thiscall, plain ret, ZERO stack args, bool result in al (both
 * callers consume with `test al, al` only). 13 insns, 2 rets
 * (0x007da792 ONE, 0x007da795 ZERO), 1 E8 (0x7706e0
 * Entity_Player::HasCollectible — exact ZHL, pinned family-wide by
 * the v13/v14 GHL island; the call stays host), 0 indirect, 0
 * observable mem-stores. Bounds 0x007da770..0x007da795, 37 bytes;
 * int3 pad 0x7da796..0x7da79f; next function 0x007da7a0. 2 direct
 * rel32 E8 callers (0x77099b — PM effect-receiver band, char gate
 * consumed directly; 0x785681 — inverse-polarity gate after a
 * HasCollectible(0x3b) call). Address-stable (no exact-ZHL claim).
 * Machine law (disasm-007da770.txt):
 *   char = dword [this+0x13c0] (FULL-DWORD, ONE load, no host call
 *     before it) dispatched by cmp eax,3 / je host-path ; cmp eax,
 *     0xc / jne ZERO — exact 0x3 / 0xc, high bits never match
 *   host path: HasCollectible(this, 0x26b, false) — push 0 / push
 *     0x26b / call 0x7706e0 (typed host sample)
 *   test al, al / je ZERO ; mov al,1 / ret ONE — the host bool is
 *     tested BYTE-wise (the body's ONLY byte gate -> & 0xff)
 *   BYTE-GATE discipline: value() is the ONLY byte-gated law (test
 *   al,al -> & 0xff on the host bool); char_gate() is FULL-DWORD
 *   (zero & 0xff in that body; zero uint8_t params).
 * ===================================================================== */
enum {
  ISAAC_PM_BV_VA_BODY = 0x007da770,
  ISAAC_PM_BV_VA_RET_ONE = 0x007da792,
  ISAAC_PM_BV_VA_RET_ZERO = 0x007da795,
  ISAAC_PM_BV_BODY_BYTES = 37,
  ISAAC_PM_BV_CALLSITE_COUNT = 2,
  ISAAC_PM_BV_CALLER0_VA = 0x0077099b,
  ISAAC_PM_BV_CALLER1_VA = 0x00785681,
  ISAAC_PM_BV_E8_COUNT = 1,
  ISAAC_PM_BV_INDIRECT_COUNT = 0,
  ISAAC_PM_BV_STORE_COUNT = 0,
  ISAAC_PM_BV_HAS_COLLECTIBLE_VA = 0x007706e0,
  ISAAC_PM_BV_COLLECTIBLE_ID = 0x26b,
  ISAAC_PM_BV_CHAR_OFF = 0x13c0,
  ISAAC_PM_BV_CHAR_A = 3,
  ISAAC_PM_BV_CHAR_B = 0xc
};

/* NARROWED 0x7da770 decision laws: the char dispatch (FULL-DWORD
 * exact 0x3 / 0xc — 0x103/0x10c do NOT match) and the whole-body
 * composition (char_gate AND host bool != 0, the bool masked & 0xff
 * — the body's only byte gate). All scalar params are uint32_t —
 * zero uint8_t; char_gate() never masks. */
int32_t isaac_pm_7da770_char_gate(uint32_t char_13c0);
int32_t isaac_pm_7da770_value(uint32_t char_13c0, uint32_t has);

/* =====================================================================
 * v33 — BW: VA 0x007db6b0 Entity_Player::HasInstantDeathCurse (exact
 * ZHL, wave-20 C5: 14 pattern bytes, third_party/REPENTOGON/libzhl/
 * functions/EntityPlayer.zhl: `__thiscall bool
 * Entity_Player::HasInstantDeathCurse();`), the v31-declared frontier
 * (v32 handoff "B16 0x7db6b0 — fully pure, 14 callers"). thiscall,
 * plain ret, ZERO stack args, bool in al (sampled callers consume
 * `test al, al` only). FULLY PURE: 36 insns (fresh re-decode this
 * unit), 0 resyncs, 2 rets (0x007db6f0 ZERO / 0x007db6f1 ONE), E8 0,
 * indirect 0, mem-stores 0 — zero host leaves, zero g_Game/global
 * access (every sample is a read off `this`). Bounds
 * 0x007db6b0..0x007db6f4, 68 bytes; int3 pad 0x7db6f5..0x7db6ff;
 * next function 0x007db700 (B17 IsHologram, HOST). 14 direct rel32
 * E8 callers (0x6b6250, 0x6cd4c7, 0x6e8409, 0x6e863d, 0x7106dd,
 * 0x777ea1, 0x78ab38, 0x7c40ee, 0x7c4136, 0x81654d, 0x816621,
 * 0x844277, 0x983b8d, 0x9beb69 — all 14 byte-verified E8 rel32 this
 * unit). Machine law (disasm-007db6b0.txt):
 *   byte [this+0x1519] != 0 (cmp byte ptr, jne skip) — the list-scan
 *     skip gate (same field as v27 BQ WALK_GATE_OFF / TD LIST_SKIP);
 *     the body's ONLY byte gate
 *   begin/end = dword [this+0x150c] / [this+0x1510] (BQ/TD list pin,
 *     0x10 stride); empty -> skip scan
 *   walk (eax != edx, +0x10): entry = [eax]; obj = *entry;
 *     obj[0] == 0 (FULL-DWORD) && obj[4] == 0x70 (FULL-DWORD, the
 *     0x70 sentinel — TD's sibling scan uses 0x71) -> return ONE
 *   dword [this+0x13c0] == 0x27 (FULL-DWORD, post-merge 0x7db6e4 —
 *     runs in ALL cases: skip, empty, not-found) -> return ONE
 *   else return ZERO
 *   BYTE-GATE discipline: scan_skipped() is the ONLY byte-gated law
 *   (cmp byte ptr -> & 0xff on flag_1519); elem_match()/char_gate()/
 *   walk laws are FULL-DWORD (zero & 0xff in those bodies; zero
 *   uint8_t params; element arrays are const uint32_t*).
 * ===================================================================== */
enum {
  ISAAC_PM_BW_VA_BODY = 0x007db6b0,
  ISAAC_PM_BW_VA_RET_ZERO = 0x007db6f0,
  ISAAC_PM_BW_VA_RET_ONE = 0x007db6f1,
  ISAAC_PM_BW_BODY_BYTES = 68,
  ISAAC_PM_BW_CALLSITE_COUNT = 14,
  ISAAC_PM_BW_CALLER0_VA = 0x006b6250,
  ISAAC_PM_BW_CALLER1_VA = 0x006cd4c7,
  ISAAC_PM_BW_CALLER2_VA = 0x006e8409,
  ISAAC_PM_BW_CALLER3_VA = 0x006e863d,
  ISAAC_PM_BW_CALLER4_VA = 0x007106dd,
  ISAAC_PM_BW_CALLER5_VA = 0x00777ea1,
  ISAAC_PM_BW_CALLER6_VA = 0x0078ab38,
  ISAAC_PM_BW_CALLER7_VA = 0x007c40ee,
  ISAAC_PM_BW_CALLER8_VA = 0x007c4136,
  ISAAC_PM_BW_CALLER9_VA = 0x0081654d,
  ISAAC_PM_BW_CALLER10_VA = 0x00816621,
  ISAAC_PM_BW_CALLER11_VA = 0x00844277,
  ISAAC_PM_BW_CALLER12_VA = 0x00983b8d,
  ISAAC_PM_BW_CALLER13_VA = 0x009beb69,
  ISAAC_PM_BW_E8_COUNT = 0,
  ISAAC_PM_BW_INDIRECT_COUNT = 0,
  ISAAC_PM_BW_STORE_COUNT = 0,
  ISAAC_PM_BW_LIST_GATE_OFF = 0x1519,
  ISAAC_PM_BW_LIST_BEGIN_OFF = 0x150c,
  ISAAC_PM_BW_LIST_END_OFF = 0x1510,
  ISAAC_PM_BW_LIST_ELEM_STRIDE = 0x10,
  ISAAC_PM_BW_LIST_MATCH_TAG = 0,
  ISAAC_PM_BW_LIST_MATCH_ID = 0x70,
  ISAAC_PM_BW_CHAR_OFF = 0x13c0,
  ISAAC_PM_BW_CHAR_CMP = 0x27
};

/* LANDED 0x7db6b0 laws (FULLY PURE — the whole body is in-module, zero
 * host leaves): the list-scan skip gate (byte test -> & 0xff on
 * flag_1519, the body's only byte gate), the walk bounds (signed span
 * sanity + 0x10 stride, mirroring the TD list-walk laws on the SAME
 * list fields 0x150c/0x1510/0x1519), the per-element match (obj[0] == 0
 * && obj[4] == 0x70, FULL-DWORD — the 0x70 sentinel; TD's sibling scan
 * uses 0x71), the early-exit scan accumulation over the element arrays
 * (order-independent OR — the PE's `jne 0x7db6f1` fires on the first
 * match), the FULL-DWORD char gate (exact 0x27), and the whole-body
 * composition (scan runs only when the skip byte is 0; the char check
 * runs in ALL cases — post-merge, reached from skip/empty/not-found
 * alike). All scalar params are uint32_t — zero uint8_t; scan_skipped()
 * masks & 0xff, elem_match()/char_gate()/walk laws never mask. */
int32_t isaac_pm_7db6b0_scan_skipped(uint32_t flag_1519);
int32_t isaac_pm_7db6b0_elem_match(uint32_t elem_tag, uint32_t elem_id);
int32_t isaac_pm_7db6b0_walk_terminates(uint32_t list_begin,
                                        uint32_t list_end);
int32_t isaac_pm_7db6b0_walk_steps(uint32_t list_begin, uint32_t list_end);
int32_t isaac_pm_7db6b0_scan_found(const uint32_t* elem_tags,
                                   const uint32_t* elem_ids,
                                   int32_t count);
int32_t isaac_pm_7db6b0_char_gate(uint32_t char_13c0);
int32_t isaac_pm_7db6b0_value(uint32_t flag_1519, uint32_t char_13c0,
                              const uint32_t* elem_tags,
                              const uint32_t* elem_ids, int32_t count);

/* =====================================================================
 * v34 — B3: VA 0x007da7a0 collectible-drop bool gate (NARROWED — the
 * HUD host leaf 0x72fd10 call stays host, its result is a typed
 * sample). thiscall, ret 4 (ONE stack arg `arg`), bool in al (both
 * callers consume `test al, al` / jne only). 40 insns, 2 rets
 * (0x007da800 ZERO / 0x007da807 ONE); 1 E8 (0x72fd10 = exact ZHL
 * ItemConfig::GetCollectible — pinned family-wide by the v29 loop
 * laws as a HUD host leaf, do-not-reopen); 0 indirect; 0 obj stores.
 * int3 pad 0x7da80a..0x7da80f; next function 0x007da810 (B4
 * SpawnClot host). 2 direct rel32 E8 callers (0x6ebb9c — arg 0;
 * 0x6ebbd5 — arg 1; 0x6ebbxx room/player host band).
 * Machine law (disasm-007da7a0.txt):
 *   arg = dword [ebp+8]; cmp arg,3 ; ja ONE       — UNSIGNED bound,
 *     short-circuits BEFORE the slot array read (arg > 3 -> ONE);
 *   slot = dword [this + (arg+0xac)<<5] = dword [this + 0x1580 +
 *     arg*0x20] (32-byte slot array); test slot,slot ; je ONE —
 *     FULL-DWORD zero check;
 *   size = (dword [room+0x2a408] - dword [room+0x2a404]) >> 2 —
 *     SIGNED arithmetic container span (room global 0xc7169c);
 *     cmp slot,size ; jge ONE                    — SIGNED slot >= size;
 *   cmp slot,0xeb/0x2b/0x3d ; je ONE             — FULL-DWORD id skips;
 *   cfg = 0x72fd10(&room[0x2a404], slot) — host sample, test eax,eax
 *     ; je ONE                                  — FULL-DWORD cfg == 0;
 *   cmp slot,0x248/0x3b ; je ONE                — FULL-DWORD id skips;
 *   else ZERO.
 *   ZERO byte gates in the whole body (nothing tests a low byte);
 *   every compare FULL-DWORD. value() composes arg_gate FIRST,
 *   exactly like the PE (the slot sample is only meaningful for
 *   arg <= 3 — the body reads the array after the bound check).
 * ===================================================================== */
enum {
  ISAAC_PM_B3_VA_BODY = 0x007da7a0,
  ISAAC_PM_B3_VA_RET_ZERO = 0x007da800,
  ISAAC_PM_B3_VA_RET_ONE = 0x007da807,
  ISAAC_PM_B3_BODY_BYTES = 103,    /* 0x7da807 - 0x7da7a0, to the last ret */
  ISAAC_PM_B3_CALLSITE_COUNT = 2,
  ISAAC_PM_B3_CALLER0_VA = 0x006ebb9c,
  ISAAC_PM_B3_CALLER1_VA = 0x006ebbd5,
  ISAAC_PM_B3_E8_COUNT = 1,
  ISAAC_PM_B3_INDIRECT_COUNT = 0,
  ISAAC_PM_B3_STORE_COUNT = 0,
  ISAAC_PM_B3_GET_COLLECTIBLE_VA = 0x0072fd10,
  ISAAC_PM_B3_ARG_MAX = 3,
  ISAAC_PM_B3_SLOT_BASE_OFF = 0x1580,
  ISAAC_PM_B3_SLOT_STRIDE = 0x20,
  ISAAC_PM_B3_ROOM_GLOBAL = 0xc7169c,
  ISAAC_PM_B3_ROOM_CONTAINER_OFF = 0x2a404,
  ISAAC_PM_B3_ID_SKIP_A = 0xeb,
  ISAAC_PM_B3_ID_SKIP_B = 0x2b,
  ISAAC_PM_B3_ID_SKIP_C = 0x3d,
  ISAAC_PM_B3_ID_SKIP_D = 0x248,
  ISAAC_PM_B3_ID_SKIP_E = 0x3b
};

/* LANDED 0x7da7a0 laws: the UNSIGNED arg bound (arg > 3 -> ONE — the
 * body's first gate, before the slot array read) and the whole-body
 * composition (slot zero, SIGNED slot >= size, id skips pre-host, the
 * host cfg sample zero FULL-DWORD, id skips post-host). All scalar
 * params are uint32_t — zero uint8_t, zero byte gates (NOTHING is
 * masked: slot/size/cfg are FULL-DWORD compares end-to-end). */
int32_t isaac_pm_7da7a0_arg_gate(uint32_t arg);
int32_t isaac_pm_7da7a0_value(uint32_t arg, uint32_t slot, uint32_t size,
                              uint32_t cfg);

/* =====================================================================
 * v34 — B5: VA 0x007dac30 clot-crowd bool gate (FULLY PURE — E8 0 /
 * indirect 0 / stores 0, the whole body lands in-module, zero host
 * leaves). thiscall, plain ret, ZERO stack args, bool in al (the only
 * caller 0x77cc34 consumes `test al, al; je` — TRUE gates the clot
 * counter [this+0x1f7c] that releases the B4 0x7da810 SpawnClot host
 * at 60). 21 insns, 2 rets (0x007dac7a ZERO / 0x007dac7d ONE). int3
 * pad 0x7dac7e..0x7dac7f; next function 0x007dac80 (B6
 * TryForgottenThrow host). 1 direct rel32 E8 caller (0x77cc34).
 * Machine law (disasm-007dac30.txt):
 *   v194c = dword [this+0x194c]; cmp 0 ; jg ONE   — SIGNED > 0
 *   v1348 = dword [this+0x1348]; cmp 0 ; jg ONE   — SIGNED > 0
 *   v1344 = dword [this+0x1344]; test ; jle SKIP  — SIGNED <= 0
 *     skips the mid gate (edx keeps v1344);
 *   v1d88+v134c = dword [this+0x1d88] + dword [this+0x134c]
 *     (32-bit WRAP); test ; jg ONE                — SIGNED > 0
 *   v1344 - v1da4 = wrapped sub ; cmp 1 ; jg ONE  — SIGNED > 1
 *   v1d88+v134c (fresh loads, same samples) ;
 *     cmp 1 ; jg ONE                              — SIGNED > 1
 *   else ZERO.
 *   ZERO byte gates — every gate FULL-DWORD SIGNED; zero uint8_t.
 * ===================================================================== */
enum {
  ISAAC_PM_B5_VA_BODY = 0x007dac30,
  ISAAC_PM_B5_VA_RET_ZERO = 0x007dac7a,
  ISAAC_PM_B5_VA_RET_ONE = 0x007dac7d,
  ISAAC_PM_B5_BODY_BYTES = 77,     /* 0x7dac7d - 0x7dac30, to the last ret */
  ISAAC_PM_B5_CALLSITE_COUNT = 1,
  ISAAC_PM_B5_CALLER0_VA = 0x0077cc34,
  ISAAC_PM_B5_E8_COUNT = 0,
  ISAAC_PM_B5_INDIRECT_COUNT = 0,
  ISAAC_PM_B5_STORE_COUNT = 0,
  ISAAC_PM_B5_OFF_194C = 0x194c,
  ISAAC_PM_B5_OFF_1348 = 0x1348,
  ISAAC_PM_B5_OFF_1344 = 0x1344,
  ISAAC_PM_B5_OFF_1D88 = 0x1d88,
  ISAAC_PM_B5_OFF_134C = 0x134c,
  ISAAC_PM_B5_OFF_1DA4 = 0x1da4
};

/* LANDED 0x7dac30 law: the whole-body composition — every gate is a
 * SIGNED full-dword compare (jg/jle); the two sums wrap at 32 bits
 * exactly like the PE add/sub. All scalar params are uint32_t — zero
 * uint8_t, zero byte gates (nothing is masked). */
int32_t isaac_pm_7dac30_value(uint32_t v194c, uint32_t v1348,
                              uint32_t v1344, uint32_t v1d88,
                              uint32_t v134c, uint32_t v1da4);

/* =====================================================================
 * v35 — B9: VA 0x007daff0 flag/effect decision island (NARROWED — the
 * count resolver 0x7cb6e0 and the effect-add 0x930220 stay host; the
 * flag byte store [this+0x1eec] stays host). thiscall, ret plain, VOID
 * (the only caller 0x7a50d7 does NOT consume a return value — it zeroes
 * byte [this+0x1fc4], calls, then pushes args for its own 0x930550
 * effect calls). 67 insns, 2 rets (0x007db086 count>=1 epilogue /
 * 0x007db094 count==0 epilogue); 2 E8 (0x7cb6e0 count resolver HUD v19
 * host event + 0x930220 effect-add host event — BOTH already typed PM
 * host events, bodies stay host); 0 indirect; 2 observable stores
 * (byte [this+0x1eec] at 0x7db01f and 0x7db089 — the flag is OVERWRITTEN
 * unconditionally, unlike B10/B11/B12 which preserve the low nibble).
 * int3 pad 0x7db095..0x7db09f; next function 0x007db0a0 (B10, landed
 * v26 BF). 1 direct rel32 E8 caller (0x7a50d7, player update host
 * band 0x7a50xx). Address-stable (no exact-ZHL claim).
 * Machine law (disasm-007daff0.txt):
 *   count = countResolver(this, 0x79)                 [HOST sample]
 *   flag byte [this+0x1eec] = count==0 ? 0x00 :
 *     count==1 ? 0x10 : 0x20      (0x7db005/0x7db00a sub;je chain —
 *       FULL-DWORD equality: -1/0x100/0x1ff land in the >= 2 arm;
 *       the count>=1 store at 0x7db01f runs BEFORE the loop; the
 *       count==0 epilogue stores 0x00 at 0x7db089)
 *   esi loop iterations = count==0 ? 0 : count==1 ? 1 : 2
 *     (0x7db07b sub esi,1 / 0x7db07e jne loop head 0x7db025)
 *   per iteration: size = ((end - begin) & ~3) from
 *     [game+0x2a404..0x2a408] (game global 0xc7169c, re-read EVERY
 *     iteration); host 0x930220(this+0x1508, &buf16, 1, 1) runs iff
 *     SIGNED size > 0x4e4 && slot = [begin+0x4e4] != 0
 *     (buf16 = { slot, 0, [slot+0x78], 0 } — pair elements stay host
 *     call args)
 *   ZERO byte gates in the whole body (every compare FULL-DWORD; the
 *   only byte operations are the flag STORES); zero uint8_t.  The
 *   size compare is SIGNED (cmp/jle) — the wasm32 compare-flip class:
 *   cpp casts (int32_t) so the wasm build emits the i64 sign-extend
 *   compare (precedent: v26 BF size_gate, v34 B5).
 * ===================================================================== */
enum {
  ISAAC_PM_B9_VA_BODY = 0x007daff0,
  ISAAC_PM_B9_VA_RET_ONE = 0x007db086,
  ISAAC_PM_B9_VA_RET_ZERO = 0x007db094,
  ISAAC_PM_B9_BODY_BYTES = 164,    /* 0x7db094 - 0x7daff0, to the last ret */
  ISAAC_PM_B9_CALLSITE_COUNT = 1,
  ISAAC_PM_B9_CALLER0_VA = 0x007a50d7,
  ISAAC_PM_B9_E8_COUNT = 2,
  ISAAC_PM_B9_INDIRECT_COUNT = 0,
  ISAAC_PM_B9_STORE_COUNT = 2,     /* observable: byte [this+0x1eec] x2 */
  ISAAC_PM_B9_COUNT_ID = 0x79,
  ISAAC_PM_B9_FLAG_OFF = 0x1eec,
  ISAAC_PM_B9_GAME_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_B9_VEC_BEGIN_OFF = 0x2a404,
  ISAAC_PM_B9_VEC_END_OFF = 0x2a408,
  ISAAC_PM_B9_SIZE_CMP = 0x4e4,
  ISAAC_PM_B9_SLOT_OFF = 0x4e4,
  ISAAC_PM_B9_RECEIVER_OFF = 0x1508,
  ISAAC_PM_B9_HOST_VA_COUNT = 0x007cb6e0,
  ISAAC_PM_B9_HOST_VA_EFFECT = 0x00930220,
  ISAAC_PM_B9_FLAG_NONE = 0x00,
  ISAAC_PM_B9_FLAG_SINGLE = 0x10,
  ISAAC_PM_B9_FLAG_MULTI = 0x20,
  ISAAC_PM_B9_LOOP_SINGLE = 1,
  ISAAC_PM_B9_LOOP_MULTI = 2
};

/* LANDED 0x7daff0 laws: the flag byte dispatch (0/0x10/0x20), the esi
 * loop iteration count (0/1/2), and the per-iteration effect-call gate
 * (SIGNED size > 0x4e4 AND slot != 0 FULL-DWORD — the same gate family
 * as the v26 BF laws with (begin,end) room-container samples passed as
 * uint32_t). All scalar params are int32_t/uint32_t — zero uint8_t,
 * zero byte gates (nothing is masked). The effect-call total is
 * loop_iters(count) x host_needed(...) with per-iteration fresh
 * samples. */
int32_t isaac_pm_7daff0_flag_value(int32_t count);
int32_t isaac_pm_7daff0_loop_iters(int32_t count);
int32_t isaac_pm_7daff0_size_gate(uint32_t begin, uint32_t end);
int32_t isaac_pm_7daff0_host_needed(uint32_t begin, uint32_t end,
                                    uint32_t slot);

/* =====================================================================
 * v37 — FB: VA 0x009bf930 PlayerManager::FirstBirthrightOwner (EXACT
 * ZHL, 14 pattern bytes — third_party/REPENTOGON/libzhl/functions/
 * PlayerManager.zhl: `__thiscall Entity_Player*
 * PlayerManager::FirstBirthrightOwner(unsigned int type)`, wave-25 F16
 * PI-ledger finding, PM-owned frontier item; the PI family
 * do-not-reopen). NARROWED — the HasCollectible probe 0x7706e0 stays
 * host (HUD-family HasCollectible-shaped leaf, address-stable; the PM
 * family pins the same VA as Entity_Player::HasCollectible(this,
 * 0x26b, false) — typed host sample since v13/v14 GHL, do-not-reopen
 * per the v28/v30 laws), and the returned player POINTER stays host
 * data (every caller consumes only the NULL/found boolean). thiscall,
 * ret 4 (ONE stack arg = type), Entity_Player* in eax (NULL or first
 * winner). 40 insns, 2 rets (0x009bf978 ZERO / 0x009bf983 FOUND,
 * both ret 4); 1 E8 (0x7706e0); 0 indirect; 0 observable stores.
 * int3 pad 0x9bf986..0x9bf98f; next function 0x009bf990 (IsCoopPlay,
 * family-pinned TD-ghost pin — do-not-reopen). 8 direct rel32 E8
 * callers (0x65cfe6 0x6e0cec 0x7304cf 0x73bd82 0x7d65ce 0x7d6604
 * 0x7d8eb2 0x9a48e1 — receiver g_Game+0x1baa8 in 5/8, args 0x15/0xa/
 * 2/0x19; consumes: test eax,eax / setne al / neg-sbb-and-add
 * NULL->9 fold). Machine law (disasm-009bf930.txt):
 *   begin/end = dword [this+0] / [this+4] (player-list holder,
 *     g_Game+0x1baa8 — family pin); begin==end -> NULL (je ZERO)
 *   walk +4 stride while esi != end (end RE-READ every iteration):
 *     player = [esi]; slot gates (BOTH FULL-DWORD equality, zero
 *     masking): [player+0x2c] == 0 && [player+0x13c0] == type
 *     -> probe HasCollectible(player, 0x26b, false) [0x7706e0 HOST
 *        sample]; test al,al (BYTE gate — the body's ONLY byte
 *        gate) -> FOUND (FIRST match) else next slot
 *   else NULL.  ZERO stores, zero indirect. The ONLY sign-sensitive
 *   decision is the walk span sanity (TD/BW discipline: wrapped or
 *   misaligned spans never converge) — the wasm32 compare-flip
 *   class: cpp casts (int32_t) so the wasm build emits the i64
 *   sign-extend compare (precedent v26 BF / v34 B5 / v35 B9 / v33 BW
 *   walk_terminates); JS keeps the signed oracle (asI32).
 * ===================================================================== */
enum {
  ISAAC_PM_FB_VA_BODY = 0x009bf930,
  ISAAC_PM_FB_VA_RET_NULL = 0x009bf978,
  ISAAC_PM_FB_VA_RET_FOUND = 0x009bf983,
  ISAAC_PM_FB_BODY_BYTES = 83,     /* 0x9bf983 - 0x9bf930, to the last ret */
  ISAAC_PM_FB_CALLSITE_COUNT = 8,
  ISAAC_PM_FB_CALLER0_VA = 0x0065cfe6,
  ISAAC_PM_FB_CALLER1_VA = 0x006e0cec,
  ISAAC_PM_FB_CALLER2_VA = 0x007304cf,
  ISAAC_PM_FB_CALLER3_VA = 0x0073bd82,
  ISAAC_PM_FB_CALLER4_VA = 0x007d65ce,
  ISAAC_PM_FB_CALLER5_VA = 0x007d6604,
  ISAAC_PM_FB_CALLER6_VA = 0x007d8eb2,
  ISAAC_PM_FB_CALLER7_VA = 0x009a48e1,
  ISAAC_PM_FB_E8_COUNT = 1,
  ISAAC_PM_FB_INDIRECT_COUNT = 0,
  ISAAC_PM_FB_STORE_COUNT = 0,
  ISAAC_PM_FB_LIST_BEGIN_OFF = 0x00,
  ISAAC_PM_FB_LIST_END_OFF = 0x04,
  ISAAC_PM_FB_LIST_ELEM_STRIDE = 4,
  ISAAC_PM_FB_LIST_HOLDER_OFF = 0x1baa8, /* g_Game+0x1baa8, family pin */
  ISAAC_PM_FB_STATE_OFF = 0x2c,
  ISAAC_PM_FB_CHAR_OFF = 0x13c0,
  ISAAC_PM_FB_PROBE_VA = 0x007706e0,
  ISAAC_PM_FB_PROBE_ID = 0x26b
};

/* LANDED 0x9bf930 laws: the owner-walk decisions — walk bounds
 * (signed span sanity + 4-byte stride, TD/BW discipline), the
 * per-slot eligibility (state == 0 && char == type, FULL-DWORD
 * equality, zero masking), the FirstBirthright probe gate (the ONLY
 * byte gate — & 0xff on the 0x7706e0 host sample, v9 rule), the
 * first-match scan accumulation (order-independent OR with early
 * exit, BW scan_found discipline), and the whole-body owner_found
 * composition (the walked slot count comes from the bounds:
 * begin==end — steps 0 — skips the walk exactly like the PE je ZERO,
 * so no probe runs and the arrays are never consulted; a
 * non-terminating span — steps -1 — never converges; the scan covers
 * min(count, steps) sampled slots and the -1 sentinel behaves like an
 * empty scan). All scalar params are uint32_t/int32_t — zero
 * uint8_t; element arrays are const uint32_t*. */
int32_t isaac_pm_9bf930_walk_terminates(uint32_t list_begin,
                                        uint32_t list_end);
int32_t isaac_pm_9bf930_walk_steps(uint32_t list_begin, uint32_t list_end);
int32_t isaac_pm_9bf930_slot_eligible(uint32_t state_2c,
                                      int32_t char_13c0, int32_t type);
int32_t isaac_pm_9bf930_probe_match(uint32_t has_26b);
int32_t isaac_pm_9bf930_scan_found(const uint32_t* states,
                                   const uint32_t* chars,
                                   const uint32_t* has, int32_t type,
                                   int32_t count);
int32_t isaac_pm_9bf930_owner_found(uint32_t list_begin, uint32_t list_end,
                                    const uint32_t* states,
                                    const uint32_t* chars,
                                    const uint32_t* has, int32_t type,
                                    int32_t count);

/* =====================================================================
 * v38 — B18: VA 0x007db8d0 mode-dispatch resolver (NARROWED — the
 * mode-scan chain 0x7db860 -> 0x4288a0 stays host (HUD-v16 pin) and
 * the GetPlayer-style Game-Start-Seed fatal 0xa112c0 stays host;
 * g_Game [0xc71678] / count [Game+0x1bb88] stay host samples).
 * thiscall, ret plain, int32 value consumed FULL-DWORD (14 direct
 * rel32 callers — the v32 band census: 0x764dce 0x7655e3 0x7679eb
 * 0x7685ab 0x770a46 0x770f5b 0x7c2a34 0x7c2b11 0x9f5c34 0xa0a8de
 * 0xa0b63e 0xa0b65c 0xa0c99c 0xa0cfd6; scalar dispatch consumption,
 * e.g. sub eax,3 / cmp eax,-1). 152 insns, 13 E8 (1 real edge
 * 0x7db860 + 7 cookie checks 0xaef12b + 2 fatals 0xa112c0 + 3 in the
 * next function 0x7dba40/0x7dba54), 1 indirect (jmp table 0x7dba10),
 * 2 mem-stores BOTH stack-local (cookie [ebp-4], xmm0 spill
 * [ebp-0x10]) — ZERO observable stores. 8 rets (first 0x7db90b, last
 * 0x7dba0e); nop/int3 pad 0x7dba0f; jump-table DATA 0x7dba10..0x7dba2f
 * (8 .text dwords); next function 0x007dba30 (B19, OPEN). Address-
 * stable (no exact-ZHL claim).
 * Machine law (disasm-007db8d0.txt):
 *   mode = modeScan(this)         [HOST sample: 0x7db860 -> 0x4288a0
 *     read-only scan chain, HUD-v16-pinned]
 *   fast_gate = (mode <= 7u)       (0x7db8e9 cmp esi,7 / 0x7db8ec ja —
 *     UNSIGNED; the ONLY compare class in the body — no signed
 *     compare-flip arm here)
 *   fast_value = table[mode] = {-1,-1,0,1,2,3,4,5}   (0x7dba10 jump
 *     table — entries 0 AND 1 BOTH -> -1; 0x7db8f9 or eax,-1 /
 *     0x7db90c xor eax,eax / 0x7db91e..0x7db972 mov eax,1..5)
 *   slow (mode > 7u): count = [Game+0x1bb88] (g_Game [0xc71678],
 *     HOST sample); count == 0 -> fatal 0xa112c0 with arg
 *     0xb1c640 "Error: Game Start Seed was not set.\n" (HOST
 *     residual, v14 GetPlayer-style precedent; count RE-READ at
 *     0x7db9a3); then v = max_u32(1, count + mode) (0x7db9b4 add
 *     32-bit wrap / 0x7db9c1 cmp eax,1 / 0x7db9c8 cmova — UNSIGNED)
 *     and the xor-shift chain with the TRUE constants at
 *     [0xb1f57c..0xb1f584] = 2, 15, 17 (x86 masks shift counts to
 *     5 bits):
 *       t = (v >> 2) ^ v ; u = (t << 15) ^ t ; w = (u >> 17) ^ u ;
 *       result = (w & 3) + 2         (0x7db9df..0x7dba06 fold arm)
 *     NOTE: HUD v16's NOTES claim c1/c2/c3 = 0x3e2d6048/0x652f233e/
 *     0x4e31313e at these addresses; the actual .rdata bytes the body
 *     reads are 2/15/17 (HUD's values live at 0xb2037c) — the PM
 *     byte-level oracle (emulate-b18.py) pins the TRUE constants.
 *     The 0x7db9cb..0x7db9de arm (test esi,esi ; "RNG Seed is
 *     zero!\n" fatal ; int3) is DEAD — max(1,·) >= 1 — recorded,
 *     not wired.
 *   ZERO byte gates (every compare/test FULL-DWORD; the only byte-ish
 *   data is the mode sample, compared FULL-DWORD vs 7); zero uint8_t.
 *   wasm32 class: the fast gate is UNSIGNED (mode <= 7u — the
 *   unsigned i32 compare); no signed compare exists in the body.
 * ===================================================================== */
enum {
  ISAAC_PM_B18_VA_BODY = 0x007db8d0,
  ISAAC_PM_B18_VA_RET_FIRST = 0x007db90b,
  ISAAC_PM_B18_VA_RET_LAST = 0x007dba0e,
  ISAAC_PM_B18_BODY_BYTES = 318,    /* 0x7dba0e - 0x7db8d0, to the last ret */
  ISAAC_PM_B18_CALLSITE_COUNT = 14,
  ISAAC_PM_B18_CALLER0_VA = 0x00764dce,
  ISAAC_PM_B18_CALLER1_VA = 0x007655e3,
  ISAAC_PM_B18_CALLER2_VA = 0x007679eb,
  ISAAC_PM_B18_CALLER3_VA = 0x007685ab,
  ISAAC_PM_B18_CALLER4_VA = 0x00770a46,
  ISAAC_PM_B18_CALLER5_VA = 0x00770f5b,
  ISAAC_PM_B18_CALLER6_VA = 0x007c2a34,
  ISAAC_PM_B18_CALLER7_VA = 0x007c2b11,
  ISAAC_PM_B18_CALLER8_VA = 0x009f5c34,
  ISAAC_PM_B18_CALLER9_VA = 0x00a0a8de,
  ISAAC_PM_B18_CALLER10_VA = 0x00a0b63e,
  ISAAC_PM_B18_CALLER11_VA = 0x00a0b65c,
  ISAAC_PM_B18_CALLER12_VA = 0x00a0c99c,
  ISAAC_PM_B18_CALLER13_VA = 0x00a0cfd6,
  ISAAC_PM_B18_E8_COUNT = 13,
  ISAAC_PM_B18_INDIRECT_COUNT = 1,
  ISAAC_PM_B18_STORE_COUNT = 2,     /* stack locals only — 0 observable */
  ISAAC_PM_B18_FAST_MAX = 7,
  ISAAC_PM_B18_TABLE_0 = -1,
  ISAAC_PM_B18_TABLE_2 = 0,
  ISAAC_PM_B18_TABLE_3 = 1,
  ISAAC_PM_B18_TABLE_4 = 2,
  ISAAC_PM_B18_TABLE_5 = 3,
  ISAAC_PM_B18_TABLE_6 = 4,
  ISAAC_PM_B18_TABLE_7 = 5,
  ISAAC_PM_B18_JUMP_TABLE_VA = 0x007dba10,
  ISAAC_PM_B18_MODE_SCAN_VA = 0x007db860,
  ISAAC_PM_B18_FATAL_VA = 0x00a112c0,
  ISAAC_PM_B18_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_B18_COUNT_OFF = 0x1bb88,
  ISAAC_PM_B18_HASH_C1 = 2,         /* [0xb1f57c] */
  ISAAC_PM_B18_HASH_C2 = 15,        /* [0xb1f580] */
  ISAAC_PM_B18_HASH_C3 = 17,        /* [0xb1f584] */
  ISAAC_PM_B18_HASH_FOLD_ADD = 2,
  ISAAC_PM_B18_HASH_FOLD_MASK = 3
};

/* LANDED 0x7db8d0 laws: the fast/slow mode dispatch (UNSIGNED mode <=
 * 7 gate + the 8-entry jump table {-1,-1,0,1,2,3,4,5}), the
 * slow-path Game-Start-Seed fatal decision (count == 0 — the call
 * stays host), the full xor-shift hash (TRUE constants 2/15/17;
 * v = max(1, count+mode) unsigned cmova), the whole-body value
 * composition (fast path NEVER reads the count), and the composed
 * host_needed (slow && count == 0). All scalar params uint32_t —
 * zero uint8_t, ZERO byte gates. */
int32_t isaac_pm_7db8d0_fast_gate(uint32_t mode);
int32_t isaac_pm_7db8d0_fast_value(uint32_t mode);
int32_t isaac_pm_7db8d0_slow_fatal(uint32_t count);
int32_t isaac_pm_7db8d0_slow_hash(uint32_t count, uint32_t mode);
int32_t isaac_pm_7db8d0_value(uint32_t mode, uint32_t count);
int32_t isaac_pm_7db8d0_host_needed(uint32_t mode, uint32_t count);

/* =====================================================================
 * v40 — B20: VA 0x007dbba0 RNG-item-pick + EffectAdd (NARROWED — the
 * lazy-init "RNG Seed is zero!" log 0xa112c0, ItemConfig::GetCollectible
 * 0x72fd10, EffectAdd 0x930220 and the frame-cookie check 0xaef12b stay
 * host; g_Game [0xc71678]/[0xc7169c], mode [Game+0x26614], and the RNG
 * struct dwords at [*(this+0x177c) + 0x840 + {0,4,8,0xc}] stay host
 * samples — the +0x177c pointer is the family TD vec-record pin and the
 * RNG struct shape is the PMP/TD-record {seed,s1,s2,s3} 16-byte layout).
 * thiscall, ret plain, SIDE-EFFECT call (2 direct rel32 callers —
 * 0x7a848b 0x7ad962, both thiscall with zero stack args and the return
 * IGNORED: 0x7ad962 is the mode-dispatch case of the big 0x7ad880
 * PlayerManager tail, gated on [Game+0x26614] >= 2; 0x7a848b is the
 * per-player item band, gated on a 4/Count RNG-divisor draw).
 * 68 insns, 4 E8 (0xa112c0 log + 0x72fd10 GetCollectible + 0x930220
 * EffectAdd + 0xaef12b cookie check), 0 indirect, 9 mem-stores
 * (7 stack locals incl. cookie + 2 OBSERVABLE: dword [esi] = new RNG
 * state at 0x7dbc13 UNCONDITIONAL, dword [edi+0x2edc] = sampled id at
 * 0x7dbc60 iff mode >= 2). 1 plain ret 0x7dbc75; int3 pad
 * 0x7dbc76..0x7dbc7f; next function 0x007dbc80 (B21, W27-F7's unit).
 * Address-stable (no exact-ZHL claim).
 * Machine law (disasm-007dbba0.txt):
 *   p = [this+0x177c] + 0x840        (RNG struct, HOST samples)
 *   state = [p]; s1 = [p+4]; s2 = [p+8]; s3 = [p+0xc]
 *   needs_init = (state == 0u)       (0x7dbbd8 test edx,edx /
 *     0x7dbbda jne — FULL-DWORD; the "RNG Seed is zero!" log
 *     0xa112c0(0x10, 0xb6bf54) stays host, state RE-READ at 0x7dbbe8,
 *     still 0 -> int3 crash)
 *   new = state ^ (state >> (s1 & 31)) ^ ((... ^ (state >> (s1&31)))
 *     << (s2 & 31)) ^ (... >> (s3 & 31))   (0x7dbbf2..0x7dbc11 — the
 *     family three-step xorshift, SAME chain as the PMP global
 *     0x956830 / TD record 0x7a2100; x86 shr/shl mask cl to 5 bits,
 *     so (c & 31); stored at 0x7dbc13 [p] = new)
 *   idx = new & 7                      (0x7dbc15 and eax,7 — the
 *     BYTE-gate class, mask width 3 bits; v9 widened uint32_t param,
 *     mask in the body)
 *   v = table8[idx]                     (0x7dbc1e mov esi,
 *     [ebp+eax*4-0x24] — the 8 dwords of the two 16-byte .rdata
 *     constants [0xbab750] = {0xd,0xe,0xf0,0x46} and [0xbab8f0] =
 *     {0x8f,0x159,0x1ed,0x1f0} -> table8 = {0xd,0xe,0xf0,0x46,0x8f,
 *     0x159,0x1ed,0x1f0}, collectible-id candidates)
 *   host 0x72fd10(ecx = game+0x2a404, v) = GetCollectible(v) — exact
 *     ZHL, family pin PM_TD_RVB_VA_GET_COLLECTIBLE; result pair
 *     {result, 0, result->[0x78], 0} at [ebp-0x14]
 *   host 0x930220(this+0x1508, 1, 1, &pair) = EffectAdd — family pin
 *     PM_TD_RVB_VA_EFFECT_ADD_930220 (this+0x1508 = family pin
 *     PM_GHL_OFF_TEMP_EFFECTS_1508)
 *   mode = [Game + 0x26614]            (g_Game [0xc71678], HOST sample)
 *   store_gate = ((int32)mode >= 2)     (0x7dbc57 cmp [eax+0x26614],2 /
 *     0x7dbc5e jl — SIGNED class, the family-wide Game+0x26614 field;
 *     same gate sense as isaac_pm_7db330_mode_ge2 / ght_hard_gate)
 *   iff store_gate: [this+0x2edc] = v   (0x7dbc60 — the ONLY
 *     conditional store; esi = v is callee-saved through both host
 *     calls)
 *   ZERO uint8_t params; the two byte-ish gates are uint32_t params
 *   with explicit in-body masks (& 31 shift mask, & 7 index mask).
 *   wasm32 classes: rng_next is plain u32 arithmetic (shift counts
 *   pre-masked, no UB); store_gate is the SIGNED i32 compare.
 * ===================================================================== */
enum {
  ISAAC_PM_B20_VA_BODY = 0x007dbba0,
  ISAAC_PM_B20_VA_RET = 0x007dbc75,
  ISAAC_PM_B20_BODY_BYTES = 213,     /* 0x7dbc75 - 0x7dbba0 + 1, to the ret */
  ISAAC_PM_B20_CALLSITE_COUNT = 2,
  ISAAC_PM_B20_CALLER0_VA = 0x007a848b,
  ISAAC_PM_B20_CALLER1_VA = 0x007ad962,
  ISAAC_PM_B20_E8_COUNT = 4,
  ISAAC_PM_B20_INDIRECT_COUNT = 0,
  ISAAC_PM_B20_STORE_COUNT = 9,      /* 7 stack locals + 2 observable */
  ISAAC_PM_B20_RNG_PTR_OFF = 0x177c, /* family pin PM_TD_VEC_OFF_REC2_BEGIN_177C */
  ISAAC_PM_B20_RNG_OFF = 0x840,
  ISAAC_PM_B20_RNG_SEED_OFF = 0x0,
  ISAAC_PM_B20_RNG_S1_OFF = 0x4,
  ISAAC_PM_B20_RNG_S2_OFF = 0x8,
  ISAAC_PM_B20_RNG_S3_OFF = 0xc,
  ISAAC_PM_B20_STORE_OFF = 0x2edc,
  ISAAC_PM_B20_SHIFT_MASK = 31,      /* x86 shr/shl cl mask (5 bits) */
  ISAAC_PM_B20_IDX_MASK = 7,         /* and eax,7 — 3-bit gate */
  ISAAC_PM_B20_MODE_CMP = 2,         /* family-wide Game+0x26614 field */
  ISAAC_PM_B20_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_B20_CONFIG_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_B20_CONFIG_OFF = 0x2a404, /* family pin TD_RVB_HIGH0_CFG_VEC_BEGIN_OFF */
  ISAAC_PM_B20_MODE_OFF = 0x26614,   /* family pin TD_RVB_HEAL_OFF_26614 */
  ISAAC_PM_B20_PAIR_OFF = 0x1508,    /* family pin GHL_OFF_TEMP_EFFECTS_1508 */
  ISAAC_PM_B20_TABLE_VA = 0x00bab750,
  ISAAC_PM_B20_TABLE8_0 = 0xd,
  ISAAC_PM_B20_TABLE8_1 = 0xe,
  ISAAC_PM_B20_TABLE8_2 = 0xf0,
  ISAAC_PM_B20_TABLE8_3 = 0x46,
  ISAAC_PM_B20_TABLE8_4 = 0x8f,
  ISAAC_PM_B20_TABLE8_5 = 0x159,
  ISAAC_PM_B20_TABLE8_6 = 0x1ed,
  ISAAC_PM_B20_TABLE8_7 = 0x1f0,
  ISAAC_PM_B20_LOG_VA = 0x00a112c0,  /* "RNG Seed is zero!" fatal */
  ISAAC_PM_B20_LOG_STR_VA = 0x00b6bf54,
  ISAAC_PM_B20_LOG_LEVEL = 0x10,
  ISAAC_PM_B20_GET_COLLECTIBLE_VA = 0x0072fd10, /* exact ZHL; family pin */
  ISAAC_PM_B20_EFFECT_ADD_VA = 0x00930220,       /* family pin */
  ISAAC_PM_B20_COOKIE_VA = 0x00aef12b
};

/* LANDED 0x7dbba0 laws: the RNG lazy-init decision (state == 0 — the
 * "RNG Seed is zero!" log + int3 stay host, state re-read), the
 * family three-step xorshift (delegates to isaac_pm_pre_play_rng_next;
 * shift counts masked & 31 — the x86 cl hardware mask), the & 7
 * sample-index gate, the 8-dword table sample (TRUE .rdata constants
 * {0xd,0xe,0xf0,0x46,0x8f,0x159,0x1ed,0x1f0}), the SIGNED mode >= 2
 * store gate, and the whole-body composition (the sampled collectible
 * id v). All scalar params uint32_t — zero uint8_t; the two byte-ish
 * gates are in-body masks. */
int32_t isaac_pm_7dbba0_rng_needs_init(uint32_t state);
uint32_t isaac_pm_7dbba0_rng_next(uint32_t state, uint32_t c1, uint32_t c2, uint32_t c3);
int32_t isaac_pm_7dbba0_sample_index(uint32_t state);
uint32_t isaac_pm_7dbba0_sample_value(const uint32_t* table8, int32_t index);
int32_t isaac_pm_7dbba0_store_gate(uint32_t mode);
uint32_t isaac_pm_7dbba0_update(uint32_t state, uint32_t c1, uint32_t c2, uint32_t c3, const uint32_t* table8);

/* =====================================================================
 * v39 — B19 0x7dba30 + B21 0x7dbc80 + B22 0x7dbd70 (W27-F7, NARROWED —
 * every host leaf stays host; observable stores stay host, the store
 * VALUE/occurrence is decided by law). B20 0x7dbba0 belongs to the v40
 * unit (F16) — untouched here.
 *
 * B19 0x7dba30 (disasm-007dba30.txt): Entity_Player item-flag gate,
 * thiscall, `ret 0x28` (TEN stack dwords; the body reads only dwords
 * 0/1 — all sampled callers build a 40-byte struct on the stack). 5
 * direct rel32 callers (0x5ebb35, 0x5ebea5, 0x6ffd19, 0x71c8fa,
 * 0x772db4), bool in al. 58 insns, 2 E8 -> 0x7706e0
 * HasCollectible(this, 0x278, false) + 0x9305f0 HasCollectibleEffect(
 * this+0x1508, 0x278) (both family host leaves); 0 indirect; 2
 * observable byte stores to [this+0x26d4]; 2 rets (0x7dba92 ZERO /
 * 0x7dbadc ONE). Jump-table DATA 0x7dbae0 = {0x7dba78, 0x7dba7a};
 * byte-table DATA 0x7dbae8..0x7dbb9e (183 bytes, 0/1); nop 0x7dbadf;
 * int3 0x7dbb9f; next function 0x7dbba0 (B20). The pre-entry blob
 * 0x7dba10..0x7dba2f is B18's 8-dword jump table (the wave-26 C4 batch
 * called it 9-slot — 8 entries + the ja slow-path fallthrough); the
 * entry at 0x7dba30 is clean. Address-stable (no exact ZHL).
 *   has = (0x7706e0 sample & 0xff) || (0x9305f0 sample & 0xff) — the
 *   effect probe runs ONLY when the direct probe is false (jne skips)
 *   dispatch on struct dword0 (arg0), struct dword1 = arg1:
 *     arg0 == 0x21                 -> ONE immediately (no store, no
 *                                      state read)
 *     arg0 == 0                    -> bl = (arg1 == 0x2710)
 *     arg0 == 9                    -> bl = (arg1 == 2)
 *     (int32)arg0 > 0x21 (SIGNED jg; wasm32 compare-flip class) ->
 *       arg0 == 0x3e8 -> t = (arg1 - 0x16) u32; t <= 0xb6u ->
 *         bl = (BYTE_TABLE[t] == 0) (the movzx + {0x7dba78,0x7dba7a}
 *         jump dispatch: table 0 -> bl=1, 1 -> bl=0); else bl = 0
 *     else (incl. negative arg0)   -> bl = 0
 *   flag gate: [this+0x26d4] byte != 0 or bl != 0 -> STORE 1; if bl==0
 *   -> ZERO; (int32)[this+0x26d0] >= 0x1e (SIGNED jge) -> ZERO; ONE.
 *   Otherwise STORE 0 (bl==0) -> ZERO.
 */
enum {
  ISAAC_PM_B19_VA_BODY = 0x007dba30,
  ISAAC_PM_B19_VA_RET_ZERO = 0x007dba92,
  ISAAC_PM_B19_VA_RET_ONE = 0x007dbadc,
  ISAAC_PM_B19_VA_JUMP_TABLE = 0x007dbae0,
  ISAAC_PM_B19_VA_BYTE_TABLE = 0x007dbae8,
  ISAAC_PM_B19_BODY_BYTES = 0xac,
  ISAAC_PM_B19_CALLSITE_COUNT = 5,
  ISAAC_PM_B19_ITEM_COLLECTIBLE = 0x278,
  ISAAC_PM_B19_CASE_21 = 0x21,
  ISAAC_PM_B19_CASE_0_ID = 0x2710,
  ISAAC_PM_B19_CASE_9_ID = 2,
  ISAAC_PM_B19_CASE_3E8_ID_BASE = 0x16,
  ISAAC_PM_B19_TABLE_BOUND = 0xb6,
  ISAAC_PM_B19_TABLE_BYTES = 183,
  ISAAC_PM_B19_OFF_FLAG_26D4 = 0x26d4,
  ISAAC_PM_B19_OFF_COUNT_26D0 = 0x26d0,
  ISAAC_PM_B19_OFF_EFFECTS_1508 = 0x1508,
  ISAAC_PM_B19_VA_HAS_COLLECTIBLE = 0x007706e0,
  ISAAC_PM_B19_VA_HAS_EFFECT = 0x009305f0,
  ISAAC_PM_B19_COUNT_CMP = 0x1e
};

int32_t isaac_pm_7dba30_has_item(uint32_t has_278, uint32_t has_278_effect);
int32_t isaac_pm_7dba30_effect_probe_runs(uint32_t has_278);
int32_t isaac_pm_7dba30_special_case(uint32_t arg0);
int32_t isaac_pm_7dba30_table_index(uint32_t arg1);
int32_t isaac_pm_7dba30_bl(uint32_t arg0, uint32_t arg1);
int32_t isaac_pm_7dba30_flag_store(uint32_t has_278, uint32_t has_278_effect,
                                   uint32_t arg0, uint32_t arg1,
                                   uint32_t state_26d4);
int32_t isaac_pm_7dba30_result(uint32_t has_278, uint32_t has_278_effect,
                               uint32_t arg0, uint32_t arg1,
                               uint32_t state_26d4, int32_t state_26d0);

/* =====================================================================
 * v39 — B21 0x7dbc80 (disasm-007dbc80.txt): Entity_Player RNG 13-slot
 * pick + temp-effect apply, thiscall, plain ret, void (both callers
 * ignore eax; the call is a statement). 2 direct rel32 callers
 * (0x7a84cd, 0x7ad977). 72 insns; 4 E8 = 0xa112c0 fatal + 0x72fd10
 * GetCollectible + 0x930220 effectAdd + 0xaef12b cookie; 0 indirect;
 * 2 observable stores: [rng] = next state (rng = this+[this+0x177c]+
 * 0x990, deep) and [this+0x2ee0] = pick (SIGNED mode gate). SEH cookie
 * [0xbf93b4]^ebp. Address-stable.
 *   seed = dword [rng]; seed == 0 -> "RNG Seed is zero!" fatal
 *   0xa112c0 (host) + re-read + int3 if still zero (recorded, not
 *   wired — the law samples the reloaded seed)
 *   next = three-step xorshift128 (shifts dword [rng+4]/[rng+8]/
 *   [rng+0xc], masked & 31 — the x86 cl hardware mask; same kernel as
 *   the PMP/TD rng_next laws)
 *   pick = PICK_TABLE[next % 13u] — div 0xd remainder; table = 12
 *   .rdata dwords (0xbab6f0/0xbab810/0xbab900) + slot 12 = 0x2dc
 *   = {0x1d,0x1e,0x1f,0x37,0x6e,0x72,0xc7,0xc8,0xd9,0xe4,0x163,0x1fc,
 *   0x2dc}; GetCollectible(roomCfg+0x2a404, pick) + effectAdd(
 *   this+0x1508, &buf16, 1, 1) stay host
 *   [this+0x2ee0] = pick store iff (int32)game[0x26614] >= 2 (SIGNED
 *   jl — the family-wide mode gate).
 */
enum {
  ISAAC_PM_B21_VA_BODY = 0x007dbc80,
  ISAAC_PM_B21_VA_RET = 0x007dbd6d,
  ISAAC_PM_B21_BODY_BYTES = 0xed,
  ISAAC_PM_B21_CALLSITE_COUNT = 2,
  ISAAC_PM_B21_OFF_RNG_PTR_177C = 0x177c,
  ISAAC_PM_B21_RNG_OFF = 0x990,
  ISAAC_PM_B21_RNG_SEED_OFF = 0x0,
  ISAAC_PM_B21_RNG_S1_OFF = 0x4,
  ISAAC_PM_B21_RNG_S2_OFF = 0x8,
  ISAAC_PM_B21_RNG_S3_OFF = 0xc,
  ISAAC_PM_B21_SHIFT_MASK = 31,
  ISAAC_PM_B21_PICK_DIVISOR = 0xd,
  ISAAC_PM_B21_PICK_SLOTS = 13,
  ISAAC_PM_B21_SLOT_12_VALUE = 0x2dc,
  ISAAC_PM_B21_OFF_STORE_2EE0 = 0x2ee0,
  ISAAC_PM_B21_OFF_EFFECTS_1508 = 0x1508,
  ISAAC_PM_B21_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_B21_CONFIG_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_B21_MODE_OFF = 0x26614,
  ISAAC_PM_B21_MODE_CMP = 2,
  ISAAC_PM_B21_TABLE_VA = 0x00bab6f0,
  ISAAC_PM_B21_COOKIE_VA = 0x00aef12b,
  ISAAC_PM_B21_LOG_VA = 0x00a112c0,
  ISAAC_PM_B21_LOG_STR_VA = 0x00b6bf54,
  ISAAC_PM_B21_GET_COLLECTIBLE_VA = 0x0072fd10,
  ISAAC_PM_B21_EFFECT_ADD_VA = 0x00930220
};

int32_t isaac_pm_7dbc80_rng_seed_zero(uint32_t seed);
int32_t isaac_pm_7dbc80_rng_seed_still_zero(uint32_t seed_reloaded);
uint32_t isaac_pm_7dbc80_rng_next(uint32_t seed, uint32_t shift1,
                                  uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_7dbc80_pick_index(uint32_t state_next);
int32_t isaac_pm_7dbc80_pick_value(uint32_t index);
int32_t isaac_pm_7dbc80_store_gate(int32_t game_26614);
int32_t isaac_pm_7dbc80_pick(uint32_t seed, uint32_t shift1,
                             uint32_t shift2, uint32_t shift3);

/* =====================================================================
 * v39 — B22 0x7dbd70 (disasm-007dbd70.txt): Entity_Player RNG revive
 * tail, thiscall, `ret 4` (ONE stack arg = RNG object pointer; the
 * callers pass &local RNG or [this+0x177c]+0xa60). 2 direct rel32
 * callers (0x7a85e5, 0x7ad998). 79 insns; 6 E8 = 0x428590 vector
 * grow + 0xa112c0 fatal + 0x7ec0a0 RNG->value (NOT family-pinned —
 * result sampled) + 0x72fd10 GetCollectible + 0x75d1d0 AddCostume +
 * 0x9a8970 game +0x1da04 scan; 0 indirect; observable stores: vec
 * slot push at [0xc7169c]+0x2a508 holder (value = the CONSTANT
 * 0x7dbe70), [rng] = next, [this+0x1fb8] = value, [0xc7169c+0x2a50c]
 * -= 4, [this+0x1574] |= [cfg+0x54], [this+0x1518] = 1. NO cookie.
 * Address-stable.
 *   vec end == cap (cmp [h+4],[h+8] ; je) -> 0x428590 grow call,
 *   else inline slot push (FULL-DWORD; the pushed value is constant)
 *   seed = dword [rng-arg]; seed == 0 -> fatal + re-read + int3 arm
 *   (same discipline as B21; the law samples the reloaded seed)
 *   next = xorshift128 (shifts [rng+4]/[rng+8]/[rng+0xc])
 *   [this+0x1fb8] = 0x7ec0a0 result (host sample)
 *   cfg = 0x72fd10(...) result; cfg == 0 (FULL-DWORD test eax,eax)
 *   -> tail skipped; else:
 *     [this+0x1574] |= [cfg+0x54]  (or-store value = law)
 *     [this+0x1518] = 1
 *     byte [cfg+0xb2] != 0 (& 0xff — the body's ONLY byte gate) ->
 *       0x75d1d0 AddCostume call
 *     0x9a8970 call
 */
enum {
  ISAAC_PM_B22_VA_BODY = 0x007dbd70,
  ISAAC_PM_B22_VA_RET = 0x007dbe68,
  ISAAC_PM_B22_BODY_BYTES = 0xf8,
  ISAAC_PM_B22_CALLSITE_COUNT = 2,
  ISAAC_PM_B22_VEC_HOLDER_OFF = 0x2a508,
  ISAAC_PM_B22_VEC_COUNTER_OFF = 0x2a50c,
  ISAAC_PM_B22_VEC_SLOT_VALUE = 0x7dbe70,
  ISAAC_PM_B22_RNG_SEED_OFF = 0x0,
  ISAAC_PM_B22_RNG_S1_OFF = 0x4,
  ISAAC_PM_B22_RNG_S2_OFF = 0x8,
  ISAAC_PM_B22_RNG_S3_OFF = 0xc,
  ISAAC_PM_B22_SHIFT_MASK = 31,
  ISAAC_PM_B22_OFF_FLAG_1574 = 0x1574,
  ISAAC_PM_B22_OFF_BYTE_1518 = 0x1518,
  ISAAC_PM_B22_OFF_VALUE_1FB8 = 0x1fb8,
  ISAAC_PM_B22_CFG_OFF_54 = 0x54,
  ISAAC_PM_B22_CFG_OFF_B2 = 0xb2,
  ISAAC_PM_B22_GAME_GLOBAL_VA = 0x00c71678,
  ISAAC_PM_B22_CONFIG_GLOBAL_VA = 0x00c7169c,
  ISAAC_PM_B22_GAME_ROOM_OFF = 0x18300,
  ISAAC_PM_B22_LOG_VA = 0x00a112c0,
  ISAAC_PM_B22_LOG_STR_VA = 0x00b6bf54,
  ISAAC_PM_B22_GET_COLLECTIBLE_VA = 0x0072fd10,
  ISAAC_PM_B22_ADD_COSTUME_VA = 0x0075d1d0,
  ISAAC_PM_B22_GAME_SCAN_VA = 0x009a8970,
  ISAAC_PM_B22_GROW_VA = 0x00428590
};

int32_t isaac_pm_7dbd70_rng_seed_zero(uint32_t seed);
int32_t isaac_pm_7dbd70_rng_seed_still_zero(uint32_t seed_reloaded);
uint32_t isaac_pm_7dbd70_rng_next(uint32_t seed, uint32_t shift1,
                                  uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_7dbd70_push_grow(uint32_t vec_end, uint32_t vec_cap);
int32_t isaac_pm_7dbd70_cfg_gate(uint32_t cfg);
int32_t isaac_pm_7dbd70_costume_gate(uint32_t cfg_b2);
uint32_t isaac_pm_7dbd70_flag_1574(uint32_t flag_1574, uint32_t cfg_54);

/* =====================================================================
 * v41 — B23: VA 0x007dbe70 revive-queue predicate (FULLY PURE — the
 * ONLY remaining band body; landing it closes the whole
 * 0x7dba30..0x7dbe70 band: B19/B21/B22 at v39, B20 at v40, B23 at
 * v41). cdecl callback, ONE stack arg = object pointer at [ebp+8],
 * plain ret, bool in al. 0 direct rel32 callers (census-callers.py) —
 * invoked INDIRECTLY: B22 0x7dbd70 pushes the CONSTANT 0x7dbe70 as a
 * slot into the room-container vec {begin,end,cap} at
 * [0xc7169c+0x2a508..0x2a50c] (ISAAC_PM_B22_VEC_SLOT_VALUE); the vec
 * consumer at 0x730177 pops slots and calls slot(obj) (`mov
 * eax,[esi-4]; add esi,-4; push ebx; call eax; add esp,4` — cdecl,
 * one stack arg), consuming the bool with test al,al and aborting the
 * walk on FALSE. 23 insns, 2 rets (0x7dbe9f ZERO / 0x7dbea5 ONE),
 * 0 E8, 0 indirect, 0 mem-stores — the whole body lands in-module,
 * zero host leaves, zero globals (the FIRST fully-pure body since
 * v34 B5 / v33 BW). int3 pad 0x7dbea6..0x7dbeaf; next function
 * 0x007dbeb0 (SEH-framed, separate — do-not-reopen here). Gap bytes
 * 0x7dbe69..0x7dbe6f (int3 x7) sit between B22's ret 4 at 0x7dbe68
 * and this entry — CLEAN. Address-stable (no exact ZHL).
 * Machine law (disasm-007dbe70.txt):
 *   obj  = [ebp+8]                 (host pointer; obj->[0] and
 *                                    obj->[0xb8] are host samples)
 *   type = dword [obj+0]           (0x7dbe79)
 *   type in {1,3,4}?               (cmp 1/je, cmp 3/je, cmp 4/jne —
 *                                    FULL-DWORD exact equality, the
 *                                    ONLY dispatch)
 *     yes -> flags = dword [obj+0xb8] (0x7dbe8a — NOT read on other
 *            types); result = (flags & 0x1000000) != 0
 *            (0x7dbe90 and eax,0x1000000 ; 0x7dbe95 or eax,0 ; 0x7dbe98
 *            jne — FULL-DWORD bit-mask gate, bit 24)
 *     no  -> result = 1            (0x7dbe88 jne — immediate ONE)
 *   whole body: type_special ? flags_bit : 1
 *   Compare-class audit: the B19 `jg` signed/unsigned EQUIVALENCE
 *   finding was re-verified and does NOT apply — B23 has NO range
 *   compare (je/jne equality + one and/or/jne bit test only), so
 *   there is no signed/unsigned arm to flip. ZERO byte gates (both
 *   reads are FULL-DWORD; the & 0xff v9 rule has nothing to widen),
 *   zero uint8_t params.
 * ===================================================================== */
enum {
  ISAAC_PM_B23_VA_BODY = 0x007dbe70,
  ISAAC_PM_B23_VA_RET_ZERO = 0x007dbe9f,
  ISAAC_PM_B23_VA_RET_ONE = 0x007dbea5,
  ISAAC_PM_B23_BODY_BYTES = 0x36,  /* 0x7dbea5 - 0x7dbe70 + 1, to the ret */
  ISAAC_PM_B23_CALLSITE_COUNT = 0, /* caller-less: indirect vec slot */
  ISAAC_PM_B23_E8_COUNT = 0,
  ISAAC_PM_B23_INDIRECT_COUNT = 0,
  ISAAC_PM_B23_STORE_COUNT = 0,
  ISAAC_PM_B23_NEXT_FUNC = 0x007dbeb0,
  ISAAC_PM_B23_OBJ_TYPE_OFF = 0x0,
  ISAAC_PM_B23_OBJ_FLAGS_OFF = 0xb8,
  ISAAC_PM_B23_TYPE_CMP_1 = 1,
  ISAAC_PM_B23_TYPE_CMP_3 = 3,
  ISAAC_PM_B23_TYPE_CMP_4 = 4,
  ISAAC_PM_B23_FLAGS_BIT = 0x1000000, /* bit 24 mask gate */
  ISAAC_PM_B23_VEC_HOLDER_OFF = 0x2a508, /* room-container vec {begin,end} */
  ISAAC_PM_B23_VEC_END_OFF = 0x2a50c,
  ISAAC_PM_B23_VEC_CONSUMER = 0x00730177 /* the indirect call site */
};

/* LANDED 0x7dbe70 laws: the type dispatch ({1,3,4} FULL-DWORD
 * equality), the flags bit-24 mask gate (the body's ONLY gate), and
 * the whole-body composition (special types pass iff the bit is set,
 * all other types always pass). All scalar params uint32_t — zero
 * uint8_t, zero byte gates (nothing to mask). */
int32_t isaac_pm_7dbe70_type_special(uint32_t type);
int32_t isaac_pm_7dbe70_flags_bit(uint32_t flags);
int32_t isaac_pm_7dbe70_result(uint32_t type, uint32_t flags);

/* =====================================================================
 * v42 — VEC: outlined container-cursor leaves of the revive-container
 * band (the FIRST frontier cluster AFTER the closed 0x7dba30..0x7dbe70
 * band). Census verdicts (pm-v42-frontier/NOTES.md): 0x7dbeb0 is an
 * EXACT ZHL HistoryHUD::RecomputeAll(bool) — HUD-family claim,
 * do-not-land here; 0x7dc2d0 + 0x7dc620 + 0x7dc660 are pinned HOST;
 * 0x7dca60 (size()/16 getter) is referenced by lua-family tables.
 * BOTH remaining bodies are FULLY PURE thiscall leaves, plain ret:
 *   V42-A 0x007dc610..0x7dc615 (6 bytes): mov eax,[ecx] ;
 *     mov [ecx+4],eax ; ret — end cursor := begin (clear-without-free).
 *     1 direct rel32 caller 0x007b47ea (stack-local container).
 *   V42-B 0x007dc650..0x7dc654 (5 bytes): add dword ptr [ecx+4],-4 ;
 *     ret — pop one 4-byte element (u32 wrap). 2 direct rel32 callers
 *     0x0076efb9 / 0x0076f10b (stack-local containers).
 * The store SITE stays host ([this+4]); the retired VALUE is decided
 * by law. Zero branches => zero compare classes (the B19 jg
 * signed/unsigned equivalence CANNOT arise). ZERO byte gates — both
 * stores are FULL-DWORD, the & 0xff v9 rule has nothing to widen;
 * zero uint8_t params.
 */
enum {
  ISAAC_PM_V42A_VA_BODY = 0x007dc610,
  ISAAC_PM_V42A_VA_RET = 0x007dc615,
  ISAAC_PM_V42A_BODY_BYTES = 6,
  ISAAC_PM_V42A_CALLSITE_COUNT = 1,
  ISAAC_PM_V42A_CALLER0 = 0x007b47ea,
  ISAAC_PM_V42A_E8_COUNT = 0,
  ISAAC_PM_V42A_INDIRECT_COUNT = 0,
  ISAAC_PM_V42A_STORE_COUNT = 1,
  ISAAC_PM_V42A_READ_OFF = 0x0,
  ISAAC_PM_V42A_STORE_OFF = 0x4,
  ISAAC_PM_V42A_NEXT_FUNC = 0x007dc620,
  ISAAC_PM_V42B_VA_BODY = 0x007dc650,
  ISAAC_PM_V42B_VA_RET = 0x007dc654,
  ISAAC_PM_V42B_BODY_BYTES = 5,
  ISAAC_PM_V42B_CALLSITE_COUNT = 2,
  ISAAC_PM_V42B_CALLER0 = 0x0076efb9,
  ISAAC_PM_V42B_CALLER1 = 0x0076f10b,
  ISAAC_PM_V42B_E8_COUNT = 0,
  ISAAC_PM_V42B_INDIRECT_COUNT = 0,
  ISAAC_PM_V42B_STORE_COUNT = 1,
  ISAAC_PM_V42B_END_OFF = 0x4,
  ISAAC_PM_V42B_POP_DELTA_U32 = 0xfffffffcu,
  ISAAC_PM_V42B_NEXT_FUNC = 0x007dc660
};

/* LANDED 0x7dc610 / 0x7dc650 laws: the retired store VALUE for each
 * body plus the store-site/delta constants. All scalar params
 * uint32_t; PE bodies return void — laws export the decided values. */
uint32_t isaac_pm_7dc610_end_after_reset(uint32_t begin_now);
int32_t isaac_pm_7dc610_store_off(void);
uint32_t isaac_pm_7dc650_end_after_pop(uint32_t end_now);
int32_t isaac_pm_7dc650_pop_delta(void);

/* =====================================================================
 * v43 — SEL: next-window census (0x7dd010..0x7de010, the pm-v42
 * §next-window resume point) found TWO more verify-open fully-pure
 * leaves; everything else in the window is pinned HOST except
 * 0x7dd380 (family-landed v25 GF) and 0x7dd3b0 (generic shared
 * copy-ctor, 351 image-wide callers — do-not-land).
 *   V43-A 0x007dd3a0..0x7dd3a9 (10 bytes): __fastcall (ecx = a_ptr,
 *     edx = b_ptr), plain ret: mov al,[edx] ; cmp al,[ecx] ;
 *     cmovb ecx,edx ; mov eax,ecx ; ret — UNSIGNED byte-min pointer
 *     select. The compare is BYTE-WIDTH (mov al / cmp al), so the v9
 *     rule applies: uint32_t params with explicit & 0xff masks.
 *     2 direct rel32 callers 0x0076e44a / 0x0076e461 (palette-decode
 *     byte arithmetic in the 0x76exxx player band).
 *   V43-B 0x007dd490..0x7dd4a8 (25 bytes): __thiscall (ecx = this),
 *     edx = src1, [ebp+8] = src2; assembles {src1[0], src2[0],
 *     src2[1]} into this[0]/[4]/[8] (FULL-DWORD moves, returns this).
 *     The store SITES stay host; the retired VALUES are decided by
 *     the copy-plan law. 1 direct rel32 caller 0x0079b9f3 (record
 *     assembly feeding the 0x7dc740 ring push in the 0x79bxxx band).
 * Zero branches in A (cmov) — no compare class beyond the byte
 * unsigned-below; zero byte gates in B (FULL-DWORD); zero uint8_t.
 */
typedef struct IsaacPmV43CopyPlan {
  uint32_t field0; /* <- [src1+0] -> [this+0] */
  uint32_t field1; /* <- [src2+0] -> [this+4] */
  uint32_t field2; /* <- [src2+4] -> [this+8] */
} IsaacPmV43CopyPlan;

enum {
  ISAAC_PM_V43A_VA_BODY = 0x007dd3a0,
  ISAAC_PM_V43A_VA_RET = 0x007dd3a9,
  ISAAC_PM_V43A_BODY_BYTES = 10,
  ISAAC_PM_V43A_CALLSITE_COUNT = 2,
  ISAAC_PM_V43A_CALLER0 = 0x0076e44a,
  ISAAC_PM_V43A_CALLER1 = 0x0076e461,
  ISAAC_PM_V43A_E8_COUNT = 0,
  ISAAC_PM_V43A_INDIRECT_COUNT = 0,
  ISAAC_PM_V43A_STORE_COUNT = 0,
  ISAAC_PM_V43A_BYTE_MASK = 0xff,
  ISAAC_PM_V43A_NEXT_FUNC = 0x007dd3b0,
  ISAAC_PM_V43B_VA_BODY = 0x007dd490,
  ISAAC_PM_V43B_VA_RET = 0x007dd4a8,
  ISAAC_PM_V43B_BODY_BYTES = 25,
  ISAAC_PM_V43B_CALLSITE_COUNT = 1,
  ISAAC_PM_V43B_CALLER0 = 0x0079b9f3,
  ISAAC_PM_V43B_E8_COUNT = 0,
  ISAAC_PM_V43B_INDIRECT_COUNT = 0,
  ISAAC_PM_V43B_STORE_COUNT = 3,
  ISAAC_PM_V43B_OFF_FIELD0 = 0x0,
  ISAAC_PM_V43B_OFF_FIELD1 = 0x4,
  ISAAC_PM_V43B_OFF_FIELD2 = 0x8,
  ISAAC_PM_V43B_NEXT_FUNC = 0x007dd4b0
};

/* LANDED 0x7dd3a0 / 0x7dd490 laws: the byte-min VALUE + select
 * decision (A) and the 3-field copy plan (B). All scalar params
 * uint32_t; A masks & 0xff in-body (byte-width PE compare). */
uint32_t isaac_pm_7dd3a0_min_byte(uint32_t a_byte, uint32_t b_byte);
int32_t isaac_pm_7dd3a0_selects_b(uint32_t a_byte, uint32_t b_byte);
void isaac_pm_7dd490_copy_plan(uint32_t src1_0, uint32_t src2_0, uint32_t src2_1, IsaacPmV43CopyPlan* out);

/* =====================================================================
 * v44 — FILL: next-window census (0x7de010..0x7df010) found ONE more
 * verify-open fully-pure leaf; the two SSE move-ranges 0x7de3a0 /
 * 0x7de3e0 (stride-0x34) are DECLINED as generic-shared (2 direct
 * callers each across distant container instantiations: {0x7ddddb,
 * 0x9d8aaa} / {0x7dddf8, 0x7dde0a}), and 0x7de0e0 (copy ctor, E8
 * memcpy-shaped 0x407690) + 0x7de190 (E8 0x7ddf80 wrapper) are not
 * fully pure.
 *   V44 0x007de2f0..0x7de321 (50 bytes): push ebp / mov ebp,esp ;
 *     count = [ebp+0xc], p = [ebp+8] ; test count,count ; je skip ;
 *     do { xor edx,edx ; mov [p+0x00..0x18],edx x7 dwords ;
 *     p += 0x1c } while (--count) ; pop ebp ; ret 0xc — zero-fill of
 *     count elements at stride 28. FULLY PURE (0 E8, 0 indirect,
 *     0 globals, 0 SEH). The ret 0xc pops THREE stack slots but only
 *     two params are read ([ebp+8] p, [ebp+0xc] count) — a dead third
 *     slot from the value-fill specialization (value register was
 *     constant-zero propagated). Direct rel32 callers = 2, both in the
 *     immediate revive-container cluster: 0x007dc8b9 (stride-0x78
 *     insert helper) and 0x007deb8a (stride-0x1c resize; NOTE:
 *     census-callers.py's linear decode misses this site — verified by
 *     capstone dump + target arithmetic).
 * ZERO byte gates (all stores FULL-DWORD); the ONLY compare is
 * equality-to-zero on the count (test/je), so no signed/unsigned
 * class exists; zero uint8_t params.
 */
enum {
  ISAAC_PM_V44_VA_BODY = 0x007de2f0,
  ISAAC_PM_V44_VA_RET = 0x007de31f,
  ISAAC_PM_V44_BODY_BYTES = 50,
  ISAAC_PM_V44_CALLSITE_COUNT = 2,
  ISAAC_PM_V44_CALLER0 = 0x007dc8b9,
  ISAAC_PM_V44_CALLER1 = 0x007deb8a,
  ISAAC_PM_V44_E8_COUNT = 0,
  ISAAC_PM_V44_INDIRECT_COUNT = 0,
  ISAAC_PM_V44_STORE_COUNT = 7, /* observable zero-stores per element */
  ISAAC_PM_V44_STRIDE = 0x1c,
  ISAAC_PM_V44_DWORDS_PER_ELEM = 7,
  ISAAC_PM_V44_NEXT_FUNC = 0x007de330
};

/* LANDED 0x7de2f0 laws: the store-site geometry (stride + dwords per
 * element), the count==0 skip decision, and the total store count.
 * All scalar params uint32_t; PE returns void at ret 0xc. */
uint32_t isaac_pm_7de2f0_store_count(uint32_t count);
int32_t isaac_pm_7de2f0_skips_zero_count(uint32_t count);
int32_t isaac_pm_7de2f0_stride(void);
int32_t isaac_pm_7de2f0_dwords_per_elem(void);

/* =====================================================================
 * v45 — INIT: next-window census (0x7df010..0x7e0010) found ONE
 * verify-open fully-pure leaf worth landing; two declines recorded:
 *   - 0x7df270 (smaller constant initializer, FULLY PURE) — DECLINED
 *     unattributable: 0 direct rel32 callers and no indirect-invocation
 *     evidence (no callback-address push anywhere).
 *   - 0x7df0b0 (backward move-range stride-0x34, FULLY PURE shape) —
 *     DECLINED generic-shared: both direct callers {0x7def52,
 *     0x7def99} sit inside one body (the 0x7dee40 stride-0x34 insert)
 *     — private move-specialization of a single instantiation.
 * V45 0x007df200..0x7df269 (106 bytes): thiscall constant initializer,
 * plain ret. 15 observable stores through this (14 FULL-DWORDs + 1
 * exact WORD): nine zero dwords (@0x00/0x04/0x14/0x1c/0x2c/0x34/0x44/
 * 0x58/0x5c), THREE std::string capacity headers =0xf (@0x18/0x30/
 * 0x48), unity float bits @0x50, scale bits @0x54 (0x3ca3d70a =
 * 0.02f), WORD @0x4c = 0x100. ZERO E8 / indirect / globals / SEH /
 * compares => no signed-unsigned class exists; zero byte gates.
 * Direct rel32 callers = 2, both per-element default-init loops at
 * stride 0x60 in the adjacent band: 0x007e2f72 + 0x007e3008 (each
 * followed by a 0x7e2e00 destroy tail).
 */
enum {
  ISAAC_PM_V45_VA_BODY = 0x007df200,
  ISAAC_PM_V45_VA_RET = 0x007df269,
  ISAAC_PM_V45_BODY_BYTES = 106,
  ISAAC_PM_V45_CALLSITE_COUNT = 2,
  ISAAC_PM_V45_CALLER0 = 0x007e2f72,
  ISAAC_PM_V45_CALLER1 = 0x007e3008,
  ISAAC_PM_V45_E8_COUNT = 0,
  ISAAC_PM_V45_INDIRECT_COUNT = 0,
  ISAAC_PM_V45_STORE_COUNT = 15,
  ISAAC_PM_V45_DWORD_STORES = 14,
  ISAAC_PM_V45_WORD_STORES = 1,
  ISAAC_PM_V45_STRING_CAP = 0xf,
  ISAAC_PM_V45_CAP_SITE_COUNT = 3,
  ISAAC_PM_V45_UNITY_F32_BITS = 0x3f800000,
  ISAAC_PM_V45_SCALE_F32_BITS = 0x3ca3d70a,
  ISAAC_PM_V45_WORD_4C_INIT = 0x100,
  ISAAC_PM_V45_NEXT_FUNC = 0x007df270
};

/* LANDED 0x7df200 laws: whole-body store geometry + value pins.
 * Zero scalar params (thiscall receiver only); PE returns void. */
int32_t isaac_pm_7df200_store_count(void);
uint32_t isaac_pm_7df200_string_cap(void);
int32_t isaac_pm_7df200_cap_site_count(void);
uint32_t isaac_pm_7df200_scale_f32_bits(void);
uint32_t isaac_pm_7df200_word_4c_init(void);
uint32_t isaac_pm_7df200_unity_f32_bits(void);

/* prototypes from cpp */
int32_t isaac_pm_death_dual_zero_gate(int32_t gate1b83c, int32_t gate1ba78);
int32_t isaac_pm_death_anim_idle(int32_t anim_7c, uint32_t anim_8c);
int32_t isaac_pm_death_player_eligible(uint32_t dead_173, int32_t anim_7c, uint32_t anim_8c, uint32_t twin_null, int32_t twin_anim_7c, uint32_t twin_anim_8c);
int32_t isaac_pm_death_player_eligible_pack( const IsaacPlayerManagerDeathPlayer* player);
int32_t isaac_pm_death_eligible_count( const IsaacPlayerManagerDeathPlayer* players, int32_t count);
uint32_t isaac_pm_death_eligible_mask( const IsaacPlayerManagerDeathPlayer* players, int32_t count);
int32_t isaac_pm_death_walk_pure_complete(int32_t residual_kind);
void isaac_pm_death_plan_from_players( int32_t gate1b83c, int32_t gate1ba78, const IsaacPlayerManagerDeathPlayer* players, int32_t count, IsaacPlayerManagerDeathPlan* out);
void isaac_pm_death_wire_decide( int32_t gate1b83c, int32_t gate1ba78, int32_t player_count, int32_t blob_ready, const IsaacPlayerManagerDeathPlayer* players, int32_t pack_count, IsaacPlayerManagerDeathPlan* out);
uint32_t isaac_pm_death_trigger_va(void);
int32_t isaac_pm_death_trigger_arg(void);
int32_t isaac_pm_intensity_player_eligible(int32_t raw_1ea8, uint32_t flags_168, uint32_t dead_173);
float isaac_pm_intensity_clamp_raw(int32_t raw_1ea8);
float isaac_pm_intensity_player_contrib(int32_t raw_1ea8, uint32_t flags_168, uint32_t dead_173);
float isaac_pm_intensity_max_over_players( const IsaacPlayerManagerIntensityPlayer* players, int32_t count);
float isaac_pm_intensity_max_over_arrays(const int32_t* raw_1ea8, const uint32_t* flags_168, const uint8_t* dead_173, int32_t count);
void isaac_pm_intensity_plan_from_players( const IsaacPlayerManagerIntensityPlayer* players, int32_t count, IsaacPlayerManagerIntensityPlan* out);
void isaac_pm_intensity_plan_from_arrays( const int32_t* raw_1ea8, const uint32_t* flags_168, const uint8_t* dead_173, int32_t count, IsaacPlayerManagerIntensityPlan* out);
int32_t isaac_pm_intensity_sfx_start_needed(float max_vol);
int32_t isaac_pm_intensity_sfx_stop_candidate(float max_vol);
int32_t isaac_pm_intensity_sfx_residual_kind(float max_vol, int32_t is_playing);
int32_t isaac_pm_intensity_heartbeat_pure_complete( float max_vol, int32_t is_playing);
void isaac_pm_intensity_heartbeat_plan( float max_vol, int32_t is_playing, IsaacPlayerManagerHeartbeatPlan* out);
void isaac_pm_intensity_wire_decide( int32_t player_count, int32_t blob_ready, int32_t sfx_playing, const IsaacPlayerManagerIntensityPlayer* players, int32_t pack_count, IsaacPlayerManagerHeartbeatPlan* out);
uint32_t isaac_pm_intensity_sfx_id(void);
int32_t isaac_pm_intensity_play_frame_delay(void);
int32_t isaac_pm_intensity_play_loop(void);
float isaac_pm_intensity_play_pitch(void);
float isaac_pm_intensity_play_pan(void);
int32_t isaac_pm_player_count_from_span(int32_t span_bytes);
int32_t isaac_pm_player_index_select(uint32_t index, int32_t count);
int32_t isaac_pm_walk_enter(int32_t count);
int32_t isaac_pm_walk_needs_empty_fatal(int32_t count_now);
int32_t isaac_pm_walk_continue(uint32_t next_index, int32_t count_reloaded);
int32_t isaac_pm_sfx_entry_count_from_span(int32_t span_bytes);
int32_t isaac_pm_sfx_entry_byte_offset(int32_t id);
int32_t isaac_pm_sfx_entry_index_in_range(int32_t id, int32_t span_bytes);
int32_t isaac_pm_sfx_entry_gate(int32_t id, int32_t span_bytes, uint32_t voices_190, uint32_t enabled_198);
void isaac_pm_sfx_entry_gate_plan(int32_t id, int32_t span_bytes, uint32_t voices_190, uint32_t enabled_198, IsaacPlayerManagerSfxGate* out);
int32_t isaac_pm_sfx_is_playing_known(int32_t gate_kind);
int32_t isaac_pm_sfx_is_playing_pure_result(int32_t gate_kind);
int32_t isaac_pm_sfx_mutator_pure_complete(int32_t gate_kind);
uint32_t isaac_pm_sfx_manager_receiver(uint32_t global_c7169c);
uint32_t isaac_pm_pre_play_rng_next(uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_pre_play_rare_hit(uint32_t seed_out);
void isaac_pm_pre_play_plan(int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3, IsaacPlayerManagerPrePlayPlan* out);
int32_t isaac_pm_pre_play_sound_id(int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_intensity_play_id(int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_td_early_kind(int32_t state_2c, uint32_t check_only);
int32_t isaac_pm_td_early_pure_complete(int32_t early_kind);
int32_t isaac_pm_td_early_returns_false(int32_t early_kind);
int32_t isaac_pm_td_static_guard_slow(int32_t guard, int32_t tls_epoch);
int32_t isaac_pm_td_static_guard_runs_init( int32_t guard_after_header);
int32_t isaac_pm_td_static_guard_game_effect(void);
int32_t isaac_pm_td_twin_first(uint32_t twin_ptr, uint32_t self_ptr, int32_t twin_order_161c, int32_t self_order_161c);
void isaac_pm_td_order_plan( uint32_t twin_ptr, uint32_t self_ptr, int32_t twin_order_161c, int32_t self_order_161c, IsaacPlayerTriggerDeathOrderPlan* out);
int32_t isaac_pm_td_push_needs_grow(uint32_t vec_end, uint32_t vec_cap);
int32_t isaac_pm_td_pocket_slot_clamp(int32_t index);
int32_t isaac_pm_td_pocket_slot_offset(int32_t slot);
int32_t isaac_pm_td_pocket_match(int32_t id, int32_t type);
int32_t isaac_pm_td_pocket_find( const IsaacPlayerPocketSlot* slots);
int32_t isaac_pm_td_pocket_compact_dwords(int32_t found_index);
void isaac_pm_td_pocket_compact( IsaacPlayerPocketSlot* slots, IsaacPlayerTriggerDeathPocketPlan* out);
int32_t isaac_pm_td_list_scan_skipped(uint32_t skip_1519);
int32_t isaac_pm_td_list_elem_match(int32_t elem_tag, int32_t elem_id);
int32_t isaac_pm_td_list_walk_terminates(uint32_t list_begin, uint32_t list_end);
int32_t isaac_pm_td_list_walk_steps(uint32_t list_begin, uint32_t list_end);
int32_t isaac_pm_td_probe_a_player_match( uint32_t has_collectible);
int32_t isaac_pm_td_probe_a_scan(const uint8_t* has_flags, int32_t count);
int32_t isaac_pm_td_probe_b_path(int32_t pending_2ef8, int32_t id, uint32_t pending_flag_2ef0);
int32_t isaac_pm_td_probe_b_needs_count_probe(int32_t path);
int32_t isaac_pm_td_probe_b_player_match(int32_t path, int32_t count);
int32_t isaac_pm_td_probe_b_scan(const int32_t* pending_2ef8, const uint8_t* pending_flag_2ef0, const int32_t* counts, int32_t id, int32_t count);
int32_t isaac_pm_td_cascade_stage_count(void);
int32_t isaac_pm_td_cascade_stage_id(int32_t stage_index);
int32_t isaac_pm_td_cascade_probe_kind(int32_t stage_index);
int32_t isaac_pm_td_cascade_guard_kind(int32_t stage_index);
uint32_t isaac_pm_td_cascade_stage_va(int32_t stage_index);
int32_t isaac_pm_td_cascade_first_match(const uint8_t* matched, int32_t count);
int32_t isaac_pm_td_stage_d4_guard(uint32_t rng_first_byte);
int32_t isaac_pm_td_stage_1c_value(int32_t count1, int32_t count2);
int32_t isaac_pm_td_stage_1c_second_probe_needed(int32_t count1);
int32_t isaac_pm_td_stage17_path(uint32_t mgr_9e, int32_t mgr_8, uint32_t game_ptr, uint32_t game_26630, uint32_t game_26589);
int32_t isaac_pm_td_stage17_result(int32_t path, uint32_t check_only, int32_t game_18300_field8);
int32_t isaac_pm_td_cascade_check_only_returns_true( int32_t stage_index);
int32_t isaac_pm_td_rvh_revive_called(int32_t order_161c);
int32_t isaac_pm_td_rvh_chain_flag(uint32_t chain_ptr, int32_t chain_field8, int32_t chain_field0);
int32_t isaac_pm_td_rvh_region(int32_t id);
int32_t isaac_pm_td_rvh_table_index(int32_t id);
uint32_t isaac_pm_td_rvh_region_va(int32_t region);
int32_t isaac_pm_td_rvh_table_case(int32_t id);
uint32_t isaac_pm_td_rvh_dispatch_va(int32_t id);
int32_t isaac_pm_td_rvh_is_default(int32_t id);
int32_t isaac_pm_td_heart_gate(uint32_t check_only, uint32_t stop_probe, int32_t game_18300_field8);
int32_t isaac_pm_td_tail_hold(int32_t char_type_13c0, uint32_t has_26b);
int32_t isaac_pm_td_tail_check_only_result(int32_t char_type_13c0, uint32_t has_26b);
int32_t isaac_pm_td_tail_host_revive_needed(uint32_t check_only, int32_t char_type_13c0, uint32_t has_26b);
int32_t isaac_pm_td_check_only_termination(int32_t first_match, int32_t stage17_result, int32_t tail_hold);
int32_t isaac_pm_td_vec_span_aligned(int32_t span);
int32_t isaac_pm_td_vec_warn_needed(int32_t span_aligned, int32_t limit_bytes);
int32_t isaac_pm_td_vec_slot_index(int32_t span, int32_t limit_entries);
int32_t isaac_pm_td_vec_slot_offset(int32_t span, int32_t limit_entries);
uint32_t isaac_pm_td_rng_record_next(uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_td_rng_seed_zero(int32_t seed);
int32_t isaac_pm_td_rng_seed_still_zero(int32_t seed_reloaded);
int32_t isaac_pm_td_char_death_path(int32_t char_type_13c0);
int32_t isaac_pm_td_death_seq_kind(uint32_t dead_173, uint32_t fatal_null, int32_t state_2c, int32_t fatal_state_28, uint32_t has_effect_29b);
int32_t isaac_pm_td_ghost_morph_gate(uint32_t dead_173, uint32_t fatal_null, uint32_t is_coop, uint32_t coop_count, uint32_t flag_20a9);
int32_t isaac_pm_td_reset_revive_needed(int32_t order_161c);
int32_t isaac_pm_td_reset_health_branch(int32_t fatal_1340, int32_t health_type1, int32_t health_type2, int32_t char_type_13c0);
int32_t isaac_pm_td_reset_bone_hearts(int32_t branch);
int32_t isaac_pm_td_reset_probe_count(int32_t branch);
int32_t isaac_pm_td_rvb_body_from_id(int32_t id);
int32_t isaac_pm_td_rvb_has_flag_gate(int32_t body);
int32_t isaac_pm_td_rvb_flag_arm(uint32_t flag, uint32_t fatal_3bc, uint32_t chain_flag);
int32_t isaac_pm_td_rvb_notify_stage(int32_t id);
int32_t isaac_pm_td_rvb_notify_clamp(int32_t game_1831c);
int32_t isaac_pm_td_rvb_notify_mod4(int32_t game_1831c);
uint32_t isaac_pm_td_rvb_exit_route_va(int32_t arm);
int32_t isaac_pm_td_rvb_timer_floor(int32_t cur_13bc);
int32_t isaac_pm_td_rvb_heal_gate(int32_t game_26614, uint32_t dead_173, int32_t red_194c);
int32_t isaac_pm_td_rvb_heal_capacity(int32_t v1340, int32_t v1344, int32_t v134c, int32_t v1d88);
int32_t isaac_pm_td_rvb_heal_applies(int32_t red_194c, int32_t capacity);
int32_t isaac_pm_td_rvb_heal_excess(int32_t red_194c, int32_t capacity);
int32_t isaac_pm_td_rvb_case0_branch(int32_t health_type, int32_t fatal_1340, int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_case0_bone_arg(int32_t cfg_b0);
int32_t isaac_pm_td_rvb_case0_cfg_probes(int32_t branch);
int32_t isaac_pm_td_rvb_case1_branch(int32_t health_type);
int32_t isaac_pm_td_rvb_case1_soul2(int32_t branch);
int32_t isaac_pm_td_rvb_case1_recurse(uint32_t twin_1d98);
int32_t isaac_pm_td_rvb_case3_branch(int32_t fatal_1340, int32_t health_type1, int32_t health_type2, int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_high2_branch(int32_t fatal_1340, int32_t health_type1, int32_t health_type2, int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_case2_new_char(int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_eq137_new_char(int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_high0_new_char(int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_high2_char_path(int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_high2_first_sfx(int32_t path);
uint32_t isaac_pm_td_rvb_high2_first_sfx_vol_bits(int32_t path);
int32_t isaac_pm_td_rvb_high2_sfx_count(int32_t path);
int32_t isaac_pm_td_rvb_high0_costume_kind(int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_high0_cfg_in_bounds(uint32_t begin, uint32_t end);
int32_t isaac_pm_td_rvb_high0_item_gate(uint32_t begin, uint32_t end, uint32_t elem_c4);
int32_t isaac_pm_td_rvb_high0_fatal_update(int32_t v1340);
int32_t isaac_pm_td_rvb_high0_soul_update(int32_t v1340);
int32_t isaac_pm_td_rvb_high0_extra_lives_gate( uint32_t has_26b, int32_t char_type_13c0);
int32_t isaac_pm_td_rvb_twin_pos_adopt(uint32_t twin_1d9c);
int32_t isaac_pm_td_rvb_zero_mask(int32_t body);
int32_t isaac_pm_td_rvb_const_134c(int32_t body);
uint32_t isaac_pm_td_rvb_cfg_receiver(uint32_t manager_ptr);
int32_t isaac_pm_td_rvb_cfg_count(uint32_t begin, uint32_t end);
int32_t isaac_pm_td_rvb_cfg_in_range(int32_t id, uint32_t begin, uint32_t end);
uint32_t isaac_pm_td_rvb_cfg_entry(int32_t id, uint32_t begin, uint32_t end);
uint32_t isaac_pm_td_rvb_cfg_exit_va(int32_t id, uint32_t begin, uint32_t end);
int32_t isaac_pm_td_rvb_case0_cfg_field_off(int32_t branch, int32_t probe_index);
uint32_t isaac_pm_td_rvb_case0_cfg_field_va(int32_t branch, int32_t probe_index, int32_t char_type_13c0, uint32_t begin, uint32_t end);
int32_t isaac_pm_td_rvb_cfg_site_null_checked( uint32_t callsite_va);
int32_t isaac_pm_ep_get_health_type(int32_t char_type_13c0);
int32_t isaac_pm_ep_health_type_table_byte(int32_t index);
int32_t isaac_pm_c0t_getter_7cb060(int32_t char_type_13c0, int32_t v1340, int32_t v1d88);
int32_t isaac_pm_c0t_walk_engaged(uint32_t char_type_13c0);
int32_t isaac_pm_c0t_walk_continue(uint32_t char_type_13c0, uint32_t twin_1d98);
uint32_t isaac_pm_c0t_twin_walk(uint32_t player_addr, int32_t step_cap);
int32_t isaac_pm_c0t_new_1344(int32_t health_type, int32_t v1340, int32_t v1d88);
int32_t isaac_pm_c0t_recompute_uses_bone(int32_t health_type);
int32_t isaac_pm_c0t_scan_gate(int32_t new_1344, int32_t pre_1344);
uint32_t isaac_pm_c0t_scan_slot_va(uint32_t game_addr, int32_t slot_index);
int32_t isaac_pm_c0t_scan_find(uint32_t game_addr, uint32_t player_addr);
int32_t isaac_pm_c0t_scan_apply(uint32_t game_addr, uint32_t player_addr);
int32_t isaac_pm_c0t_heal_gate(int32_t game_26614, uint32_t dead_173, int32_t red_194c);
int32_t isaac_pm_c0t_heal_capacity(int32_t v1340, int32_t v1344, int32_t v134c, int32_t v1d88);
int32_t isaac_pm_c0t_heal_applies(int32_t red_194c, int32_t capacity);
int32_t isaac_pm_c0t_heal_excess(int32_t red_194c, int32_t capacity);
void isaac_pm_c0t_run_pre(uint32_t player_addr, uint32_t game_addr, int32_t walk_cap, IsaacPmC0tPrePlan* plan);
void isaac_pm_c0t_heal_plan(int32_t game_26614, uint32_t dead_173, int32_t red_194c, int32_t v1340, int32_t v1344, int32_t v134c, int32_t v1d88, IsaacPmC0tHealPlan* plan);
int32_t isaac_pm_ubh_gate(int32_t game_26614);
int32_t isaac_pm_ubh_new_bone(int32_t limit, int32_t v1340, int32_t v134c, int32_t v1d88);
int32_t isaac_pm_ubh_early_zero(int32_t new_bone);
int32_t isaac_pm_ubh_total_slots(int32_t v134c, int32_t new_bone);
uint32_t isaac_pm_ubh_mask_1d8c(int32_t total_slots);
int32_t isaac_pm_ubh_loop1_runs(int32_t total_slots);
int32_t isaac_pm_ubh_loop2_enters(int32_t total_slots);
uint32_t isaac_pm_ubh_loop1_bits(uint32_t bits, int32_t total_slots, int32_t budget);
int32_t isaac_pm_ubh_loop1_budget(uint32_t bits, int32_t total_slots, int32_t budget);
uint32_t isaac_pm_ubh_loop2_bits(uint32_t bits, int32_t total_slots, int32_t budget);
void isaac_pm_ubh_run(int32_t game_26614, int32_t limit, int32_t v1340, int32_t v134c, int32_t v1d88, uint32_t bits_1d8c, IsaacPmUbhPlan* plan);
void isaac_pm_ubh_apply(uint32_t player_addr, uint32_t game_addr, int32_t limit, IsaacPmUbhPlan* plan);
int32_t isaac_pm_ghl_gate_lt2(int32_t game_26614);
int32_t isaac_pm_ghl_base(int32_t v2c, int32_t char_2);
int32_t isaac_pm_ghl_keeper_family(int32_t char_3);
int32_t isaac_pm_ghl_keeper_skips(uint32_t keeper);
int32_t isaac_pm_ghl_keeper_sel(int32_t char_3);
int32_t isaac_pm_ghl_keeper_base(int32_t char_3, int32_t gullet);
int32_t isaac_pm_ghl_coin_bonus_q(int32_t coins_1368);
int32_t isaac_pm_ghl_clamp(int32_t base, int32_t v1da0);
void isaac_pm_ghl_plan(const IsaacPmGhlInputs* in, IsaacPmGhlPlan* plan);
void isaac_pm_ubh_full_apply(uint32_t player_addr, uint32_t game_addr, uint32_t null78, uint32_t null79, uint32_t has26b_char1, int32_t gullet, uint32_t has26b_charE, uint32_t has1f5, IsaacPmGhlPlan* ghl_plan, IsaacPmUbhPlan* ubh_plan);
int32_t isaac_pm_urh_fold_gate(int32_t game_26614);
int32_t isaac_pm_urh_fold_half(int32_t red);
int32_t isaac_pm_urh_fold_1da4(int32_t red, int32_t v1da4);
int32_t isaac_pm_urh_fold_red(int32_t red, int32_t v1da4);
int32_t isaac_pm_urh_fg_gate(uint32_t dead_1, int32_t char_1);
int32_t isaac_pm_urh_fg_sum(int32_t bone_1d88, int32_t red_194c, int32_t soul_134c, int32_t eternal_1348, int32_t red_b);
int32_t isaac_pm_urh_fg_sum_is_one(int32_t sum);
int32_t isaac_pm_urh_room_gate_fg(uint32_t room_byte, int32_t frame, int32_t room_11f0);
int32_t isaac_pm_urh_room_gate_c5(uint32_t room_byte, int32_t frame, int32_t room_11f0);
int32_t isaac_pm_urh_scan_entity_match(uint32_t ent_addr, int32_t type_28, uint32_t parent_410, uint32_t player_addr, int32_t variant_2c, int32_t subtype_30, uint32_t dead_173);
int32_t isaac_pm_urh_scan_count(uint32_t list_base, uint32_t ent_count, uint32_t player_addr);
int32_t isaac_pm_urh_itemvec_span(uint32_t begin, uint32_t end);
int32_t isaac_pm_urh_itemvec_gate(uint32_t begin, uint32_t end, uint32_t elem_1b8);
int32_t isaac_pm_urh_w_thr0(int32_t game_26614_2);
int32_t isaac_pm_urh_w_thr2(int32_t game_26614_2);
uint32_t isaac_pm_urh_ratio_bits(int32_t red, int32_t max);
int32_t isaac_pm_urh_c_high(int32_t red, int32_t max);
int32_t isaac_pm_urh_d_add_band(int32_t red, int32_t max);
int32_t isaac_pm_urh_probe_6dacd0(int32_t char_13c0, int32_t v1340, int32_t v1d88, int32_t v1344);
void isaac_pm_urh_plan(const IsaacPmUrhInputs* in, IsaacPmUrhPlan* plan);
void isaac_pm_urh_apply(uint32_t player_addr, uint32_t game_addr, uint32_t mgr_addr, const IsaacPmUrhProbes* probes, IsaacPmUrhPlan* plan);
int32_t isaac_pm_heal_applies(int32_t amount);
int32_t isaac_pm_heal_pre_id(int32_t initial_id, int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_pm_heal_inner_count(uint32_t rng);
uint32_t isaac_pm_heal_f0_bits(uint32_t rng);
uint32_t isaac_pm_heal_v2_bits(uint32_t rng);
int32_t isaac_pm_heal_tail_eligible(int32_t game_26614, uint32_t kind, int32_t is_player);
int32_t isaac_pm_heal_anm_set(uint32_t state_null, uint32_t name_eq, uint32_t state34, uint32_t a44);
void isaac_pm_heal_plan(const IsaacPmHealInputs* in, IsaacPmHealPlan* plan);
void isaac_pm_heal_emit_plan(int32_t game_26614, int32_t dead_173, int32_t red_194c, int32_t v1340, int32_t v1344, int32_t v134c, int32_t v1d88, int32_t emit_flag, int32_t ret_va, IsaacPmHealEmitPlan* plan);
int32_t isaac_pm_walk_count_reloaded(int32_t end_now, int32_t begin_now);
int32_t isaac_pm_walk_top_fatal(int32_t end_now, int32_t begin_now);
uint32_t isaac_pm_walk_elem_cursor(uint32_t begin_now, int32_t index, int32_t count_sel);
int32_t isaac_pm_walk_back_continues(int32_t end_back, int32_t begin_back, int32_t index);
void isaac_pm_walk_iter_plan(int32_t index, int32_t begin1, int32_t end1, int32_t end2, int32_t begin2, int32_t begin3, int32_t end3, int32_t triggered, IsaacPmWalkIterPlan* plan);
void isaac_pm_walk_tick_plan( int32_t index, int32_t begin1, int32_t end1, int32_t end2, int32_t begin2, int32_t begin3, int32_t end3, int32_t triggered, uint32_t dead_173, int32_t anim_7c, uint32_t anim_8c, uint32_t twin_null, int32_t twin_anim_7c, uint32_t twin_anim_8c, IsaacPmWalkTickPlan* plan);
int32_t isaac_pm_chain_playing(uint32_t is_playing);
int32_t isaac_pm_chain_receiver_reloaded(int32_t residual_kind);
uint32_t isaac_pm_chain_receiver(uint32_t global_pre, uint32_t global_now, int32_t residual_kind);
void isaac_pm_pre_play_chain_plan( float max_vol, uint32_t is_playing, uint32_t global_pre, uint32_t global_now, int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3, IsaacPmPrePlayChainPlan* plan);
int32_t isaac_pm_td_remove_mutations_vector(int32_t early_kind);
uint32_t isaac_player_manager_update_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
