/** Independent JS oracle for PlayerHUD residual FUN_00842230 pure islands
 *  (VA 0x00842230), exact PlayerHUD::UpdateHearts pure body (VA 0x00841e20),
 *  slot-0 book-overlay selection (VA 0x0084240d), cached active-id /
 *  book-overlay compare+offset CF (VA 0x00842486), ItemConfig resolve +
 *  active LoadImage path kind/VA (VA 0x00842499), residual 0x0084250f
 *  FUN_0040c7f0 SP clear pure islands + LoadImage prep (skip/SSO/pair swap),
 *  residual 0x0084298b Manager::LoadImage pure call-site args + dirty,
 *  residual 0x00842a5b book-overlay LoadImage / SP-clear pure call plan,
 *  residual 0x00842c92 trinket-pair pure CF (mask / secondary / 0x4b
 *  remask / cache / resolve / LoadImage plan), and residual 0x00842f8a
 *  pocket/charge pure CF (clamp / pill table / cache / GetEntity+ANM2 plan).
 *  ABI v13: P6 pocket-upgrade residual (VA 0x0084327d..0x008435ed) — the
 *  non-negative branch of the 16-slot pocket loop after the v11 P5 peel —
 *  and the P7 second-list gates (VA 0x00843667..0x00843a5c).  Pure:
 *  slot/array geometry, ItemConfig resolve CF (signed bounds, ~id), entry
 *  gate, post-0x4288a0 take-result gate, branch kind (RESULT/NEG/CONFIG),
 *  insert value, CONFIG SSO path ptr, global-callback gate (low byte),
 *  packed frame plan (EBP slots / SEH levels / host VAs), P7 gates.
 *  ABI v14: tail residuals after the P6/P7 loops — P6 list clear
 *  (0x00843603..0x00843662) + P7 list clear (0x00843a62..0x00843aa9)
 *  shared template (head[0] != head gate, host SP-clear loop with
 *  0x414a80 advance, teardown plan), P5-walk clear (0x00843aab..0x00843adf,
 *  up-front cursor != end gate, stride walk, 0x84bba0 teardown), enable
 *  byte +0x6ac store (0x00843aea), tail gfx rebuild (0x00843af1..0x00843ba6:
 *  byte +0x6ad gate, GetCollectible call-site args, entry null gate,
 *  0x748490 probe test al,0x40 → FIXED rdata 0xb63a18 or CONFIG, pure
 *  0x40d0c0 string-data translation, LoadImage/swap/temp-teardown plan),
 *  and the 0x956110 call-site args (0xb, player+0x1618, player, ecx).
 *  Do not derive from the C++. */

export const PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION = 44;

/* UpdateHearts call-site plan (VA 0x008422c5 / 0x008422ee). */
export const PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS = 0x18;
export const PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS = 6;
export const PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF = 0x10;
export const PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF = 0x70; /* 6+0x6a */
export const PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER = 0;
export const PLAYERHUD_UPDATE_HEARTS_ARG_TWIN = 1;

export const PLAYERHUD_HEART_SLOT_COUNT = 24;
export const PLAYERHUD_HEART_STRIDE = 0x10;
export const PLAYERHUD_HEART_BYTE1_BASE = 0x11;
export const PLAYERHUD_ACTIVE_SLOT_COUNT = 4;
export const PLAYERHUD_ACTIVE_SLOT_STRIDE = 0x1c;
export const PLAYERHUD_ACTIVE_COUNTDOWN_BASE = 0x1a8;
export const PLAYERHUD_CACHED_ACTIVE_ID_BASE = 0x190;
export const PLAYERHUD_CACHED_BOOK_OVERLAY_BASE = 0x194;
export const PLAYERHUD_ACTIVE_IMAGE_SP_BASE = 0x198;
export const PLAYERHUD_BOOK_IMAGE_SP_BASE = 0x1a0;
export const PLAYERHUD_CRITICAL_BLINK_MOD = 0x2d;
export const PLAYERHUD_CRITICAL_BLINK_WINDOW = 10;
export const PLAYERHUD_F32_STEP_0_25_BITS = 0x3e800000;
export const PLAYERHUD_F32_ZERO_BITS = 0x00000000;
export const PLAYERHUD_F32_ONE_BITS = 0x3f800000;

/** Collectible / player-type constants for book-overlay pure CF. */
export const PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL = 0x22;
export const PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES = 0x248;
export const PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL = 0x3b;
export const PLAYERHUD_TYPE_JUDAS = 3;
export const PLAYERHUD_TYPE_DARK_JUDAS = 0xc;
export const PLAYERHUD_HOST_VA_HAS_COLLECTIBLE = 0x007706e0;
export const PLAYERHUD_HOST_VA_LOAD_IMAGE = 0x009588a0;
export const PLAYERHUD_HOST_VA_SMART_PTR_CLEAR = 0x0040c7f0;
export const PLAYERHUD_HOST_VA_ITEM_CONFIG_GET_COLLECTIBLE = 0x0072fd10;
export const PLAYERHUD_HOST_VA_SP_MATERIALIZE = 0x0040c550;
export const PLAYERHUD_HOST_VA_GET_ROOM_BY_IDX = 0x00740bc0;
export const PLAYERHUD_HOST_VA_SP_SWAP = 0x0040c3b0;
export const PLAYERHUD_HOST_VA_DIRTY_NOTIFY = 0x009a8970;
export const PLAYERHUD_HOST_VA_GET_ENTITY = 0x00694fb0;
export const PLAYERHUD_HOST_VA_ANM2_LOAD = 0x0040bd50;
export const PLAYERHUD_HOST_VA_ANM2_RESET = 0x00407f10;

/** ItemConfig_Item gfx std::string layout (CONFIG path copy). */
export const PLAYERHUD_ITEMCFG_GFX_STRING_OFF = 0x38;
export const PLAYERHUD_ITEMCFG_GFX_CAPACITY_OFF = 0x4c;
export const PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD = 0x10;

/** FUN_0040c7f0 machine constants (freestanding PlayerHUD copy). */
export const PLAYERHUD_SP_CLEAR_ALLOC_SIZE = 0x18;
export const PLAYERHUD_SP_CLEAR_VTABLE = 0x00b1a6e0;
export const PLAYERHUD_SP_CLEAR_ARG_OFF = 0x14;

/** Manager::LoadImage call-site frame slots (VA 0x0084297d..0x00842a31). */
export const PLAYERHUD_LOAD_IMAGE_PATH_BUF_EBP_OFF = -0x418;
export const PLAYERHUD_LOAD_IMAGE_RESULT_EBP_OFF = -0x14a8;
export const PLAYERHUD_MATERIALIZE_THIS_EBP_OFF = -0x14a0;
export const PLAYERHUD_ACTIVE_SP_SAVED_EBP_OFF = -0x1428;
export const PLAYERHUD_DIRTY_FLAG_EBP_OFF = -0x1419;
export const PLAYERHUD_LOAD_IMAGE_RESULT_OBJ_EBP_OFF = -0x14a4;
export const PLAYERHUD_MATERIALIZE_OBJ_EBP_OFF = -0x149c;
export const PLAYERHUD_MATERIALIZE_SEH_TRY_LEVEL = 0;
export const PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX = 1;

/** Book-overlay LoadImage stack slots (VA 0x00842a5b..0x00842c85). */
export const PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_VIRTUES = -0x14b8;
export const PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_VIRTUES = -0x14b0;
export const PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_VIRTUES = -0x14b4;
export const PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_VIRTUES = -0x14ac;
export const PLAYERHUD_BOOK_MATERIALIZE_SEH_VIRTUES = 3;
export const PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BELIAL = -0x14c8;
export const PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BELIAL = -0x14c0;
export const PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BELIAL = -0x14c4;
export const PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BELIAL = -0x14bc;
export const PLAYERHUD_BOOK_MATERIALIZE_SEH_BELIAL = 6;
export const PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BOTH = -0x14d8;
export const PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BOTH = -0x14d0;
export const PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BOTH = -0x14d4;
export const PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BOTH = -0x14cc;
export const PLAYERHUD_BOOK_MATERIALIZE_SEH_BOTH = 9;
export const PLAYERHUD_BOOK_SP_CLEAR_ARG = 0;
export const PLAYERHUD_BOOK_DIRTY_AFTER_GFX = 1;

/** Trinket-pair residual after dirty join 0x00842c92. */
export const PLAYERHUD_TRINKET_SLOT_COUNT = 2;
export const PLAYERHUD_TRINKET_SLOT_STRIDE = 0x18;
export const PLAYERHUD_CACHED_TRINKET_ID_BASE = 0x200;
export const PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE = 0x204;
export const PLAYERHUD_TRINKET_IMAGE_SP_BASE = 0x208;
export const PLAYERHUD_PLAYER_TRINKET_ID_BASE = 0x16c0;
export const PLAYERHUD_PLAYER_TRINKET_ID_STRIDE = 4;
export const PLAYERHUD_PLAYER_TRINKET_SECONDARY = 0x1fb8;
export const PLAYERHUD_TRINKET_ID_MASK = 0x7fff;
export const PLAYERHUD_TRINKET_TICK_CACHED_ID = 0xa6;
export const PLAYERHUD_TRINKET_SPECIAL_0x4b = 0x4b;
export const PLAYERHUD_TRINKET_0x4b_MOD = 0xbd;
export const PLAYERHUD_TRINKET_0x4b_MAGIC = 0x5ac056b1;
export const PLAYERHUD_MANAGER_TRINKET_VEC_BEGIN = 0x2a410;
export const PLAYERHUD_MANAGER_TRINKET_VEC_END = 0x2a414;
export const PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF = -0x1448;
export const PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF = -0x1444;
export const PLAYERHUD_TRINKET_SEH_TRY_LEVEL = 0xc;
export const PLAYERHUD_TRINKET_DIRTY_AFTER_GFX = 1;

/** Pocket/charge residual after trinket exit 0x00842f8a. */
export const PLAYERHUD_POCKET_SLOT_COUNT = 4;
export const PLAYERHUD_POCKET_SLOT_STRIDE = 0x11c;
export const PLAYERHUD_CACHED_POCKET_TYPE_BASE = 0x230;
export const PLAYERHUD_CACHED_POCKET_ID_BASE = 0x234;
export const PLAYERHUD_POCKET_ANM2_BASE = 0x238;
export const PLAYERHUD_PLAYER_POCKET_ID_BASE = 0x17a0;
export const PLAYERHUD_PLAYER_POCKET_TYPE_BASE = 0x17a4;
export const PLAYERHUD_PLAYER_POCKET_STRIDE = 8;
export const PLAYERHUD_POCKET_TYPE_CARD = 0;
export const PLAYERHUD_POCKET_TYPE_PILL = 1;
export const PLAYERHUD_MANAGER_PILL_VEC_BEGIN = 0x2a428;
export const PLAYERHUD_MANAGER_PILL_VEC_END = 0x2a42c;
export const PLAYERHUD_PILL_EFFECT_OFF = 0x54;
export const PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF = 0x2a670;
export const PLAYERHUD_GET_ENTITY_TYPE = 5;
export const PLAYERHUD_GET_ENTITY_VARIANT_CARD = 0x46;
export const PLAYERHUD_GET_ENTITY_VARIANT_PILL = 0x12c;
export const PLAYERHUD_ENTITY_ANM_PATH_OFF = 0x74;
export const PLAYERHUD_ANM2_LOAD_GRAPHICS = 1;

/** Pocket host path kind after pure cache-miss. */
export const PLAYERHUD_POCKET_PATH_KIND_RESET = 0;
export const PLAYERHUD_POCKET_PATH_KIND_CARD = 1;
export const PLAYERHUD_POCKET_PATH_KIND_PILL = 2;

/** Book-overlay LoadImage path kind after pure cache miss. */
export const PLAYERHUD_BOOK_PATH_KIND_CLEAR = 0;
export const PLAYERHUD_BOOK_PATH_KIND_VIRTUES = 1;
export const PLAYERHUD_BOOK_PATH_KIND_BELIAL = 2;
export const PLAYERHUD_BOOK_PATH_KIND_BOTH = 3;

/** ItemConfig resolve table kind (VA 0x00842499 / trinket 0x00842d65). */
export const PLAYERHUD_ITEMCFG_KIND_NULL = 0;
export const PLAYERHUD_ITEMCFG_KIND_MANAGER = 1;
export const PLAYERHUD_ITEMCFG_KIND_GAME_NEG = 2;
export const PLAYERHUD_ITEMCFG_KIND_MANAGER_TRINKET = 3;

/** Active-item LoadImage path kinds after ItemConfig non-null. */
export const PLAYERHUD_ACTIVE_PATH_KIND_CONFIG = 0;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x23 = 1;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x122 = 2;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x146 = 3;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x160 = 4;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x1a6 = 5;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x1b2 = 6;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x1da = 7;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x1df = 8;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x1e3 = 9;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x1e9 = 10;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x20b = 11;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x280 = 12;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL = 13;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x2ad = 14;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x2c6 = 15;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x2c7 = 16;
export const PLAYERHUD_ACTIVE_PATH_KIND_0x2d0 = 17;

/** PE .rdata book path string VAs. */
export const PLAYERHUD_PATH_BOOK_OF_VIRTUES = 0x00b6debc;
export const PLAYERHUD_PATH_BOOK_OF_BELIAL = 0x00b6dedc;
export const PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL = 0x00b6e020;

/** PE .rdata active-item special path string VAs. */
export const PLAYERHUD_PATH_ACTIVE_0x23 = 0x00b6df18;
export const PLAYERHUD_PATH_ACTIVE_0x122 = 0x00b6dd44;
export const PLAYERHUD_PATH_ACTIVE_0x146 = 0x00b6ddc0;
export const PLAYERHUD_PATH_ACTIVE_0x160 = 0x00b6de54;
export const PLAYERHUD_PATH_ACTIVE_0x1a6 = 0x00b6de34;
export const PLAYERHUD_PATH_ACTIVE_0x1b2 = 0x00b6dcd0;
export const PLAYERHUD_PATH_ACTIVE_0x1da = 0x00b6ddf8;
export const PLAYERHUD_PATH_ACTIVE_0x1df = 0x00b6dea4;
export const PLAYERHUD_PATH_ACTIVE_0x1e3 = 0x00b6de1c;
export const PLAYERHUD_PATH_ACTIVE_0x1e9 = 0x00b6de70;
export const PLAYERHUD_PATH_ACTIVE_0x20b = 0x00b6dd04;
export const PLAYERHUD_PATH_ACTIVE_0x280 = 0x00b6df94;
export const PLAYERHUD_PATH_ACTIVE_0x280_BELIAL = 0x00b6df70;
export const PLAYERHUD_PATH_ACTIVE_0x2ad = 0x00b6dddc;
export const PLAYERHUD_PATH_ACTIVE_0x2c6 = 0x00b6def8;
export const PLAYERHUD_PATH_ACTIVE_0x2c7 = 0x00b6df3c;
export const PLAYERHUD_PATH_ACTIVE_0x2d0 = 0x00b6df50;

/** PE .rdata heart path string VAs (image base 0x400000). */
export const PLAYERHUD_HEART_PATHS = Object.freeze({
  coinHeartHalf: 0x00b6dc24,
  redHeartHalf: 0x00b6dc04,
  coinEmpty: 0x00b6dcb8,
  coinHeartFull: 0x00b6dc44,
  redHeartFull: 0x00b6dc34,
  rottenHeartFull: 0x00b6dc14,
  emptyHeart: 0x00b6dcc4,
  boneHeartHalf: 0x00b6dca8,
  blueHeartHalf: 0x00b6ddb0,
  boneHeartFull: 0x00b6dc98,
  rottenBoneHeartFull: 0x00b6dc74,
  boneHeartEmpty: 0x00b6dc88,
  blackHeartHalf: 0x00b6dc64,
  blackHeartFull: 0x00b6dc54,
  blueHeartFull: 0x00b6dda0,
  whiteHeartOverlay: 0x00b6dd7c,
  brokenCoinHeart: 0x00b6dd90,
  brokenHeart: 0x00b6dd38,
});

/** GetHealthType index table for (type-4) in 0..0x24 (PE 0x007cb02c). */
const HEALTH_TYPE_INDEX = Uint8Array.from([
  0, 4, 4, 4, 4, 4, 1, 4, 0, 4, 2, 4, 3, 0, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4,
  4, 1, 4, 2, 4, 0, 0, 4, 4, 4, 1,
]);
const HEALTH_TYPE_RET = [1, 2, 3, 4, 0];

function f32FromBits(bits) {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
}

function i32(v) {
  return v | 0;
}

function u32(v) {
  return v >>> 0;
}

function i8(v) {
  return (v << 24) >> 24;
}

function satNonneg(v) {
  const x = i32(v);
  return x < 0 ? 0 : x;
}

/** PE signed ceil-half: inc; cdq; sub; sar. */
export function playerHudSignedCeilHalf(value) {
  let eax = i32(i32(value) + 1);
  const edx = eax < 0 ? -1 : 0;
  eax = i32(eax - edx);
  return i32(eax >> 1);
}

/** Toward-zero signed /2 (cdq; sub; sar, no prior inc). */
function signedDiv2Tz(n) {
  n = i32(n);
  const edx = n < 0 ? -1 : 0;
  return i32((n - edx) >> 1);
}

/** PE signed n%2 via and 0x80000001 + jns fixup. */
function signedMod2(x) {
  let a = i32(u32(x) & 0x80000001);
  if (a >= 0) {
    return a;
  }
  a = i32(a - 1);
  a = i32(u32(a) | 0xfffffffe);
  return i32(a + 1);
}

function rol32(x) {
  x = u32(x);
  return u32((x << 1) | (x >>> 31));
}

/**
 * Exact Entity_Player::GetHealthType (VA 0x007cafe0).
 * @param {number} playerType player+0x13c0
 */
export function playerHudGetHealthType(playerType) {
  const a = i32(i32(playerType) - 4);
  if (u32(a) > 0x24) {
    return 0;
  }
  return HEALTH_TYPE_RET[HEALTH_TYPE_INDEX[a]] | 0;
}

/** Zero 24 heart+1 flag bytes (sparse). */
export function playerHudEntryClearHeartByte1(flags) {
  const out = new Array(PLAYERHUD_HEART_SLOT_COUNT).fill(0);
  if (!flags) {
    return out;
  }
  for (let i = 0; i < PLAYERHUD_HEART_SLOT_COUNT; i += 1) {
    out[i] = 0;
  }
  return out;
}

/**
 * Twin UpdateHearts path when twin != 0 && type in {0x10,0x11} && field3bc == 0.
 * @returns {boolean}
 */
export function playerHudUpdateHeartsUsesTwin(twinPtr, playerType, field3bc) {
  if (((twinPtr >>> 0) || 0) === 0) {
    return false;
  }
  const t = playerType | 0;
  if (t !== 0x10 && t !== 0x11) {
    return false;
  }
  if ((field3bc | 0) !== 0) {
    return false;
  }
  return true;
}

/**
 * Pure UpdateHearts call-site plan (VA 0x008422b3..0x008422ee).
 * Twin path: UpdateHearts(this=hud, hud+0x10, 6, player) then
 * UpdateHearts(this=hud, hud+0x70, 6, twin); single path:
 * UpdateHearts(this=hud, hud+0x10, 0x18, player). Second call re-reads
 * [player+0x1d98] live (0x008422ca), so its arg is ARG_TWIN, not the
 * gate-time pointer value.
 *
 * @returns {{ isTwin: number, calls: Array<{heartSlotsOff: number,
 *   maxSlots: number, argSource: number}> }}
 */
export function playerHudUpdateHeartsCallPlan(twinPtr, playerType, field3bc) {
  const twin = playerHudUpdateHeartsUsesTwin(twinPtr, playerType, field3bc);
  if (twin) {
    return {
      isTwin: 1,
      calls: [
        {
          heartSlotsOff: PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF,
          maxSlots: PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS,
          argSource: PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER,
        },
        {
          heartSlotsOff: PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF,
          maxSlots: PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS,
          argSource: PLAYERHUD_UPDATE_HEARTS_ARG_TWIN,
        },
      ],
    };
  }
  return {
    isTwin: 0,
    calls: [
      {
        heartSlotsOff: PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF,
        maxSlots: PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS,
        argSource: PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER,
      },
    ],
  };
}

/* ABI v18: StatHUD progress-slot tween (VA 0x0084d6b0..0x0084d73c,
   ret 4; 17 direct callers — 11 in RecomputeStats 0x0084ca00, 6 in
   0x0084e9d0).  ecx = slot, xmm1 = target f32, [esp+4] = mode byte. */
export const PLAYERHUD_STAT_BAR_TWEEN_TIMER_SLOW = 0x1e;  /* cmp [ecx+0x10] */
export const PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW = 0x96;   /* mov [edx],0x96 */
export const PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR = 0x87; /* cmovge 0x87 */
export const PLAYERHUD_STAT_BAR_TWEEN_ABS_MASK = 0x7fffffff; /* andps */

function f32BitsOf(value) {
  const u = new Uint32Array(1);
  new Float32Array(u.buffer)[0] = Math.fround(value);
  return u[0] >>> 0;
}

/**
 * Pure StatHUD progress-slot tween (VA 0x0084d6b0).  Slot layout:
 * +0x0 current f32, +0x4 delta f32, +0x8 prev f32, +0xc threshold f32
 * (read-only), +0x10 timer s32.  mode low byte == 0 resets the slot
 * (prev=current, delta=0, timer=0, current=target).  mode != 0:
 * ucomiss/lahf/test ah,0x44/jnp — the jnp is taken ONLY when the
 * operands are EQUAL (ZF=1,PF=0 -> odd parity of ah&0x44; NaN is
 * unordered ZF=PF=CF=1 -> even parity -> falls INTO the tween).
 * timer <= 30: prev=current, delta=target-current (f32), timer=150 iff
 * fabs(delta) >= threshold — comiss jb skips the 0x96 write for
 * ordered-less AND unordered, so NaN keeps the timer — else unchanged.
 * timer > 30: delta=target-prev, timer=max(timer,135).  Every step path
 * stores current=target.
 *
 * @param {{currentBits: number, deltaBits: number, prevBits: number,
 *   thresholdBits: number, timer: number}} slot
 * @param {number} targetBits f32 bits of the tween target (xmm1)
 * @param {number} mode byte gate (only the low byte is tested)
 * @returns {{currentBits: number, deltaBits: number, prevBits: number,
 *   timer: number}}
 */
export function playerHudStatBarTween(slot, targetBits, mode) {
  const currentBits = u32(slot.currentBits);
  const deltaBitsIn = u32(slot.deltaBits);
  const prevBits = u32(slot.prevBits);
  const thresholdBits = u32(slot.thresholdBits);
  const timer = i32(slot.timer);
  const targetBitsU = u32(targetBits);
  const target = f32FromBits(targetBitsU);
  if ((mode & 0xff) === 0) {
    /* Reset: prev=current, delta=0, timer=0, current=target. */
    return {
      currentBits: targetBitsU,
      deltaBits: 0,
      prevBits: currentBits,
      timer: 0,
    };
  }
  const current = f32FromBits(currentBits);
  if (target === current) {
    /* Equal (jnp taken): current=target only. */
    return {
      currentBits: targetBitsU,
      deltaBits: deltaBitsIn,
      prevBits,
      timer,
    };
  }
  if (timer <= PLAYERHUD_STAT_BAR_TWEEN_TIMER_SLOW) {
    const delta = Math.fround(target - current);
    const deltaBits = f32BitsOf(delta);
    const absBits = deltaBits & PLAYERHUD_STAT_BAR_TWEEN_ABS_MASK;
    const absDelta = f32FromBits(absBits);
    let newTimer = timer;
    /* jb (CF=1) is taken for ordered-less AND unordered; >= is false for
       NaN, reproducing jb-taken (timer unchanged). */
    if (absDelta >= f32FromBits(thresholdBits)) {
      newTimer = PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW;
    }
    return {
      currentBits: targetBitsU,
      deltaBits,
      prevBits: currentBits,
      timer: newTimer,
    };
  }
  /* timer > 30: delta=target-prev, timer=max(timer,135). */
  const delta = Math.fround(target - f32FromBits(prevBits));
  const deltaBits = f32BitsOf(delta);
  const newTimer =
    timer >= PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR
      ? timer
      : PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR;
  return {
    currentBits: targetBitsU,
    deltaBits,
    prevBits,
    timer: newTimer,
  };
}

/* ABI v19: 6-slot StatHUD progress updater (VA 0x0084e9d0..0x0084ea85,
   ret 4).  this+0x48 = player ptr: full-dword null gate -> no-op, all
   6 slots untouched.  Six unconditional tween calls, receivers
   this+0x4c+i*0x14 (stride 0x14 = cur/delta/prev/thr/timer), each with
   the SAME mode (mov esi,[ebp+8] once, push esi before every call).
   Targets: k0 player+0x1568; k1 30.0f/(player+0x1460 + 1.0f)
   (addss then divss — plain f32, order pinned: x = p1460+1.0f,
   t = 30.0f/x); k2 player+0x1470; k3 player+0x1480/40.0f; k4
   player+0x1464; k5 player+0x156c. */
export const PLAYERHUD_84E9D0_SLOT_COUNT = 6;
export const PLAYERHUD_84E9D0_SLOT_STRIDE = 0x14;
export const PLAYERHUD_84E9D0_SLOTS_BASE = 0x4c;
export const PLAYERHUD_84E9D0_PLAYER_PTR_OFF = 0x48;
export const PLAYERHUD_84E9D0_PLAYER_1568 = 0x1568;
export const PLAYERHUD_84E9D0_PLAYER_1460 = 0x1460;
export const PLAYERHUD_84E9D0_PLAYER_1470 = 0x1470;
export const PLAYERHUD_84E9D0_PLAYER_1480 = 0x1480;
export const PLAYERHUD_84E9D0_PLAYER_1464 = 0x1464;
export const PLAYERHUD_84E9D0_PLAYER_156C = 0x156c;
/* PE .rdata recipe constants (this binary). */
export const PLAYERHUD_84E9D0_RDATA_30F = 0x00baa8d0;
export const PLAYERHUD_84E9D0_RDATA_1F = 0x00baa454;
export const PLAYERHUD_84E9D0_RDATA_40F = 0x00baa904;

/**
 * Pure 6-slot StatHUD progress updater (VA 0x0084e9d0).  Each slot is a
 * full StatHUD slot state: +0x0 current f32, +0x4 delta f32, +0x8 prev
 * f32, +0xc threshold f32 (read-only), +0x10 timer s32.  The updater
 * applies playerHudStatBarTween to every slot with the slot's own
 * current/prev/threshold/timer; only current/delta/prev/timer are
 * written back (threshold kept).
 *
 * @param {Array<{currentBits: number, deltaBits: number, prevBits: number,
 *   thresholdBits: number, timer: number}>} slots 6 slots, slot i at
 *   this+0x4c+i*0x14
 * @param {number} playerPtr [this+0x48]; 0 -> no-op (slots untouched)
 * @param {number} p1568 player+0x1568 f32 bits
 * @param {number} p1460 player+0x1460 f32 bits
 * @param {number} p1470 player+0x1470 f32 bits
 * @param {number} p1480 player+0x1480 f32 bits
 * @param {number} p1464 player+0x1464 f32 bits
 * @param {number} p156c player+0x156c f32 bits
 * @param {number} mode shared mode arg pushed before every tween call
 * @returns {Array<{currentBits: number, deltaBits: number, prevBits: number,
 *   timer: number}>}
 */
export function playerHud84e9d0Update(
  slots,
  playerPtr,
  p1568, p1460, p1470, p1480, p1464, p156c,
  mode,
) {
  if (u32(playerPtr) === 0) {
    /* Gate (0x0084e9d9 test eax,eax; je 0x84ea80): full-dword null
       test, nothing written. */
    return slots.map((s) => ({
      currentBits: u32(s.currentBits),
      deltaBits: u32(s.deltaBits),
      prevBits: u32(s.prevBits),
      thresholdBits: u32(s.thresholdBits),
      timer: i32(s.timer),
    }));
  }
  const t1460 = f32FromBits(u32(p1460));
  const t1480 = f32FromBits(u32(p1480));
  const targets = [
    u32(p1568),
    /* movss xmm1,[0xbaa8d0]; addss xmm0,[0xbaa454]; divss xmm1,xmm0 */
    f32BitsOf(Math.fround(30 / Math.fround(t1460 + 1))),
    u32(p1470),
    /* movss xmm1,[eax+0x1480]; divss xmm1,[0xbaa904] */
    f32BitsOf(Math.fround(t1480 / 40)),
    u32(p1464),
    u32(p156c),
  ];
  return slots.map((slot, i) =>
    playerHudStatBarTween(slot, targets[i], mode),
  );
}

/* ABI v20: action-id to rdata-string select (VA 0x0084d740..0x0084d824,
   ret 0).  cmp ecx,0x1f; ja 0x84d810 is UNSIGNED.  Taken arms:
   jmp [ecx*4+0x84d828] -> mov eax,<rdata imm>; ret.  Default:
   push 0xb6e230; push 0x10; call 0xa112c0; add esp,8;
   mov eax,0xb1a4ec; ret.  Logger tail stays host. */
export const PLAYERHUD_84D740_ACTION_COUNT = 0x20;
export const PLAYERHUD_84D740_ACTION_MAX = 0x1f;
export const PLAYERHUD_84D740_JUMP_TABLE_VA = 0x0084d828;
export const PLAYERHUD_84D740_DEFAULT_STRING_VA = 0x00b1a4ec;
export const PLAYERHUD_84D740_LOG_FMT_VA = 0x00b6e230;
export const PLAYERHUD_84D740_LOG_LEVEL = 0x10;
export const PLAYERHUD_HOST_VA_LOG = 0x00a112c0;

/* Jump-table rdata imms, ecx 0..0x1f, read from .text arms. */
export const PLAYERHUD_84D740_STRING_VAS = Object.freeze([
  0x00b1cdf0, /*  0 Left */
  0x00b1cde8, /*  1 Right */
  0x00b1cde4, /*  2 Up */
  0x00b1cddc, /*  3 Down */
  0x00b60d0c, /*  4 ShootLeft */
  0x00b60cf8, /*  5 ShootRight */
  0x00b60d04, /*  6 ShootUp */
  0x00b60cec, /*  7 ShootDown */
  0x00b1ce1c, /*  8 Bomb */
  0x00b67800, /*  9 Item */
  0x00b6d524, /* 10 PillCard */
  0x00b63f64, /* 11 Drop */
  0x00b6b02c, /* 12 Pause */
  0x00b6d530, /* 13 Map */
  0x00b6e170, /* 14 MenuConfirm */
  0x00b6e1bc, /* 15 MenuBack */
  0x00b6e1c8, /* 16 FullScreen */
  0x00b6e1ac, /* 17 Mute */
  0x00b6e1b4, /* 18 Restart */
  0x00b6e190, /* 19 JoinMultiplayer */
  0x00b6e1a0, /* 20 MenuLeft */
  0x00b6e17c, /* 21 MenuRight */
  0x00b6e188, /* 22 MenuUp */
  0x00b6e208, /* 23 MenuDown */
  0x00b6e214, /* 24 MenuLB */
  0x00b6e1f8, /* 25 MenuRB */
  0x00b6e200, /* 26 MenuLT */
  0x00b6e1e8, /* 27 MenuRT */
  0x00b6e1f0, /* 28 MenuTab */
  0x00b6e1d4, /* 29 MenuEx */
  0x00b6e1dc, /* 30 EmoteMenu */
  0x00b6e21c, /* 31 ToggleDescriptions */
]);

/**
 * Pure string VA for action id (VA 0x0084d740).  UNSIGNED ja past 0x1f
 * returns the empty-string rdata imm 0xb1a4ec.
 * @param {number} actionId ecx
 */
export function playerHud84d740StringVa(actionId) {
  const id = u32(actionId);
  if (id > PLAYERHUD_84D740_ACTION_MAX) {
    return PLAYERHUD_84D740_DEFAULT_STRING_VA >>> 0;
  }
  return PLAYERHUD_84D740_STRING_VAS[id] >>> 0;
}

/** 1 iff default arm (ecx > 0x1f UNSIGNED) takes the host log. */
export function playerHud84d740NeedsLog(actionId) {
  return u32(actionId) > PLAYERHUD_84D740_ACTION_MAX ? 1 : 0;
}

/**
 * Packed plan: string VA + host-log edge.  Logger body stays host.
 * @returns {{ stringVa: number, needsLog: number, logLevel: number,
 *   logFmtVa: number, hostVaLog: number }}
 */
export function playerHud84d740Plan(actionId) {
  const id = u32(actionId);
  if (id > PLAYERHUD_84D740_ACTION_MAX) {
    return {
      stringVa: PLAYERHUD_84D740_DEFAULT_STRING_VA >>> 0,
      needsLog: 1,
      logLevel: PLAYERHUD_84D740_LOG_LEVEL >>> 0,
      logFmtVa: PLAYERHUD_84D740_LOG_FMT_VA >>> 0,
      hostVaLog: PLAYERHUD_HOST_VA_LOG >>> 0,
    };
  }
  return {
    stringVa: PLAYERHUD_84D740_STRING_VAS[id] >>> 0,
    needsLog: 0,
    logLevel: 0,
    logFmtVa: 0,
    hostVaLog: PLAYERHUD_HOST_VA_LOG >>> 0,
  };
}

/* ABI v21: 2-segment SSE intersect (VA 0x0084d8b0..0x0084da1f, ret 0).
   xmm0/1/2/3 = Ax/Ay/Bx/By; [ebp+8/+c/+10/+14] = Cx/Cy/Dx/Dy;
   ecx/edx = optional out x/y (test reg,reg). 0 E8/FF calls.
   Independent of the C++: DataView f64 eps gate + fround steps
   transcribed from the instruction stream, not a bit_cast port. */
export const PLAYERHUD_84D8B0_RDATA_EPS = 0x00baa2a8;
export const PLAYERHUD_84D8B0_RDATA_ABS = 0x00bacb50;
export const PLAYERHUD_84D8B0_RDATA_NEG = 0x00bacb70;
export const PLAYERHUD_84D8B0_RDATA_ONE = 0x00baa454;
export const PLAYERHUD_84D8B0_EPS_F64_LO = 0x80000000;
export const PLAYERHUD_84D8B0_EPS_F64_HI = 0x3ee4f8b5;
export const PLAYERHUD_84D8B0_ONE_BITS = 0x3f800000;

function playerHud84d8b0Eps() {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setUint32(0, PLAYERHUD_84D8B0_EPS_F64_LO, true);
  dv.setUint32(4, PLAYERHUD_84D8B0_EPS_F64_HI, true);
  return dv.getFloat64(0, true);
}

function playerHud84d8b0AbsF64(f32bits) {
  const dv = new DataView(new ArrayBuffer(8));
  /* cvtps2pd of the low f32, then andps 0x7fffffffffffffff. */
  dv.setFloat64(0, f32FromBits(f32bits), true);
  dv.setUint32(4, dv.getUint32(4, true) & 0x7fffffff, true);
  return dv.getFloat64(0, true);
}

/**
 * Pure 2-segment intersect (VA 0x0084d8b0).
 * denom = (Cy-Dy)*(Ax-Bx) - (Cx-Dx)*(Ay-By).
 * comisd jae fail when eps >= |cvtps2pd(denom)| (equal fails;
 * NaN denom does not — unordered CF=1).
 * t (CD param, xmm2) = xorps-neg((Ay-Cy)*(Ax-Bx)-(Ax-Cx)*(Ay-By))/denom
 * u (AB param, xmm5) = ((Ax-Cx)*(Cy-Dy)-(Ay-Cy)*(Cx-Dx))/denom
 * comiss jb rejects t/u outside [0,1] and NaN.
 * u>t ordered → A+(B-A)*u; else (u<=t or NaN) → C+(D-C)*t.
 * @returns {{hit: number, xBits: number, yBits: number,
 *   writeX: number, writeY: number}}
 */
export function playerHud84d8b0Intersect(
  axBits, ayBits, bxBits, byBits,
  cxBits, cyBits, dxBits, dyBits,
  outXPtr, outYPtr,
  seed,
) {
  const ax = f32FromBits(u32(axBits));
  const ay = f32FromBits(u32(ayBits));
  const bx = f32FromBits(u32(bxBits));
  const by = f32FromBits(u32(byBits));
  const cx = f32FromBits(u32(cxBits));
  const cy = f32FromBits(u32(cyBits));
  const dx = f32FromBits(u32(dxBits));
  const dy = f32FromBits(u32(dyBits));
  const xIn = seed ? u32(seed.xBits) : 0;
  const yIn = seed ? u32(seed.yBits) : 0;

  const axb = Math.fround(ax - bx);
  const ayb = Math.fround(ay - by);
  const cyd = Math.fround(cy - dy);
  const cxd = Math.fround(cx - dx);
  /* mulss (Cy-Dy)*(Ax-Bx); mulss (Cx-Dx)*(Ay-By); subss. */
  const denom = Math.fround(
    Math.fround(cyd * axb) - Math.fround(cxd * ayb),
  );
  const absDenom = playerHud84d8b0AbsF64(f32BitsOf(denom));
  /* comisd jae: CF=0 only when eps >= abs (ordered). */
  if (playerHud84d8b0Eps() >= absDenom) {
    return { hit: 0, xBits: xIn, yBits: yIn, writeX: 0, writeY: 0 };
  }

  const ayc = Math.fround(ay - cy);
  const axc = Math.fround(ax - cx);
  const tUnneg = Math.fround(
    Math.fround(ayc * axb) - Math.fround(axc * ayb),
  );
  const tNum = f32FromBits(f32BitsOf(tUnneg) ^ 0x80000000);
  const uNum = Math.fround(
    Math.fround(axc * cyd) - Math.fround(ayc * cxd),
  );
  const t = Math.fround(tNum / denom);
  const u = Math.fround(uNum / denom);
  /* comiss jb = < or unordered. 1.0f from 0xbaa454. */
  if (!(t >= 0) || !(1 >= t) || !(u >= 0) || !(1 >= u)) {
    return { hit: 0, xBits: xIn, yBits: yIn, writeX: 0, writeY: 0 };
  }

  let px;
  let py;
  if (u > t) {
    px = Math.fround(Math.fround(Math.fround(bx - ax) * u) + ax);
    py = Math.fround(Math.fround(Math.fround(by - ay) * u) + ay);
  } else {
    px = Math.fround(Math.fround(Math.fround(dx - cx) * t) + cx);
    py = Math.fround(Math.fround(Math.fround(dy - cy) * t) + cy);
  }
  const writeX = u32(outXPtr) !== 0 ? 1 : 0;
  const writeY = u32(outYPtr) !== 0 ? 1 : 0;
  return {
    hit: 1,
    xBits: writeX ? f32BitsOf(px) : xIn,
    yBits: writeY ? f32BitsOf(py) : yIn,
    writeX,
    writeY,
  };
}

/* ABI v22: thiscall MSVC SSO-string + zero-tail init
   (VA 0x0084da20..0x0084dac2, ret 0). ecx=this; eax=this.
   0 E8/FF. Independent of the C++: store set transcribed
   from the instruction stream. Does not wrap 0x0084d8b0. */
export const PLAYERHUD_84DA20_OBJECT_SIZE = 0x68;
export const PLAYERHUD_84DA20_SSO_SIZE_OFF = 0x10;
export const PLAYERHUD_84DA20_SSO_CAP_OFF = 0x14;
export const PLAYERHUD_84DA20_SSO_CAPACITY = 0xf;
export const PLAYERHUD_84DA20_TAIL_BEGIN = 0x18;
export const PLAYERHUD_84DA20_TAIL_LAST = 0x64;
export const PLAYERHUD_84DA20_RET_VA = 0x0084dac2;
export const PLAYERHUD_84DA20_NEXT_VA = 0x0084dad0;

/**
 * Pure 0x0084da20 init. Returns a 26-dword copy of seed with
 * the PE store set applied. +4/+8/+c keep the seed.
 * @param {ArrayLike<number>|undefined} seed
 */
export function playerHud84da20Init(seed) {
  const n = (PLAYERHUD_84DA20_OBJECT_SIZE / 4) | 0;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = seed && seed[i] !== undefined ? u32(seed[i]) : 0;
  }
  out[0] = 0;
  out[(PLAYERHUD_84DA20_SSO_SIZE_OFF / 4) | 0] = 0;
  out[(PLAYERHUD_84DA20_SSO_CAP_OFF / 4) | 0] =
    PLAYERHUD_84DA20_SSO_CAPACITY >>> 0;
  for (let off = PLAYERHUD_84DA20_TAIL_BEGIN;
    off <= PLAYERHUD_84DA20_TAIL_LAST; off += 4) {
    out[(off / 4) | 0] = 0;
  }
  return out;
}

/** 1 iff PE stores a dword at this byte offset. */
export function playerHud84da20WritesDword(byteOff) {
  const off = u32(byteOff);
  if ((off & 3) !== 0) return 0;
  if (off === 0 || off === PLAYERHUD_84DA20_SSO_SIZE_OFF ||
      off === PLAYERHUD_84DA20_SSO_CAP_OFF) {
    return 1;
  }
  if (off >= PLAYERHUD_84DA20_TAIL_BEGIN &&
      off <= PLAYERHUD_84DA20_TAIL_LAST) {
    return 1;
  }
  return 0;
}

export function playerHud84da20NextVa() {
  return PLAYERHUD_84DA20_NEXT_VA;
}

/* ABI v23: thiscall SEH ctor prefix stores
   (VA 0x0084dad0..0x0084db86, ret 0). ecx=this; eax=this.
   1 E8 (0x006efa40 at this+0x48) stays host. Independent
   of the C++: store set transcribed from the instruction
   stream. Not the v22 0x68 object — SSO cap 0xf consumed
   by reference. Does not wrap 0x0084da20 / 0x84db90. */
export const PLAYERHUD_84DAD0_OBJECT_SIZE = 0x48;
export const PLAYERHUD_84DAD0_SSO_OFF = 0x8;
export const PLAYERHUD_84DAD0_SSO_SIZE_OFF = 0x18;
export const PLAYERHUD_84DAD0_SSO_CAP_OFF = 0x1c;
export const PLAYERHUD_84DAD0_SSO_CAPACITY = PLAYERHUD_84DA20_SSO_CAPACITY;
export const PLAYERHUD_84DAD0_TAIL_BEGIN = 0x20;
export const PLAYERHUD_84DAD0_TAIL_LAST = 0x40;
export const PLAYERHUD_84DAD0_FLAG_BYTE_OFF = 0x44;
export const PLAYERHUD_84DAD0_HOST_THIS_OFF = 0x48;
export const PLAYERHUD_84DAD0_HOST_VA = 0x006efa40;
export const PLAYERHUD_84DAD0_RET_VA = 0x0084db86;
export const PLAYERHUD_84DAD0_NEXT_VA = 0x0084db90;

/* ABI v24: thiscall 4-subobject dtor host plan
   (VA 0x0084db90..0x0084dbaf, e9 tail). ecx=this.
   3x E8 0x8562b0 then E9 0x40d040. Independent of
   the C++: call order + this-offs transcribed from
   the instruction stream. 84dad0 SSO +8 / tail
   0x20..0x40 consumed by reference. Does not wrap
   0x84dad0 / 0x84da20 / 0x84dbc0. */
export const PLAYERHUD_84DB90_VA = 0x0084db90;
export const PLAYERHUD_84DB90_TAIL_VA = 0x0084dbaf;
export const PLAYERHUD_84DB90_CALL_COUNT = 4;
export const PLAYERHUD_84DB90_SUB_COUNT = 3;
export const PLAYERHUD_84DB90_SUB_STRIDE = 0xc;
export const PLAYERHUD_84DB90_THIS_OFFS = Object.freeze([
  0x38, 0x2c, 0x20, PLAYERHUD_84DAD0_SSO_OFF,
]);
export const PLAYERHUD_84DB90_HOST_VA_SUB = 0x008562b0;
export const PLAYERHUD_84DB90_HOST_VA_STRING = 0x0040d040;
export const PLAYERHUD_84DB90_NEXT_VA = 0x0084dbc0;

/**
 * Packed host plan (VA 0x0084db90). 0x8562b0 / 0x40d040
 * stay host. Last slot is the e9 tail.
 * @returns {{ callCount: number, hostVa0: number,
 *   thisOff0: number, hostVa1: number, thisOff1: number,
 *   hostVa2: number, thisOff2: number, hostVa3: number,
 *   thisOff3: number, tailJmp: number, nextVa: number }}
 */
export function playerHud84db90Plan() {
  return {
    callCount: PLAYERHUD_84DB90_CALL_COUNT,
    hostVa0: PLAYERHUD_84DB90_HOST_VA_SUB >>> 0,
    thisOff0: PLAYERHUD_84DB90_THIS_OFFS[0],
    hostVa1: PLAYERHUD_84DB90_HOST_VA_SUB >>> 0,
    thisOff1: PLAYERHUD_84DB90_THIS_OFFS[1],
    hostVa2: PLAYERHUD_84DB90_HOST_VA_SUB >>> 0,
    thisOff2: PLAYERHUD_84DB90_THIS_OFFS[2],
    hostVa3: PLAYERHUD_84DB90_HOST_VA_STRING >>> 0,
    thisOff3: PLAYERHUD_84DB90_THIS_OFFS[3],
    tailJmp: 1,
    nextVa: PLAYERHUD_84DB90_NEXT_VA >>> 0,
  };
}

export function playerHud84db90CallCount() {
  return PLAYERHUD_84DB90_CALL_COUNT;
}

/** this-off at call index; 0 when index >= 4. */
export function playerHud84db90ThisOffAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_84DB90_CALL_COUNT) return 0;
  return PLAYERHUD_84DB90_THIS_OFFS[i] >>> 0;
}

/** host VA at call index; 0 when index >= 4. */
export function playerHud84db90HostVaAt(index) {
  const i = u32(index);
  if (i <= 2) return PLAYERHUD_84DB90_HOST_VA_SUB >>> 0;
  if (i === 3) return PLAYERHUD_84DB90_HOST_VA_STRING >>> 0;
  return 0;
}

/** 1 iff index is the e9 tail (slot 3). */
export function playerHud84db90IsTailJmp(index) {
  return u32(index) === 3 ? 1 : 0;
}

export function playerHud84db90NextVa() {
  return PLAYERHUD_84DB90_NEXT_VA;
}

/* ABI v25: thiscall 7-subobject dtor host plan
   (VA 0x0084dbc0..0x0084dbf6, e9 tail). ecx=this.
   6x E8 0x4149d0 then E9 0x40d040. Independent of
   the C++: call order + this-offs transcribed from
   the instruction stream. Does not wrap 0x84db90 /
   0x84dad0 / 0x84da20 / 0x84dc00. */
export const PLAYERHUD_84DBC0_VA = 0x0084dbc0;
export const PLAYERHUD_84DBC0_TAIL_VA = 0x0084dbf6;
export const PLAYERHUD_84DBC0_CALL_COUNT = 7;
export const PLAYERHUD_84DBC0_SUB_COUNT = 6;
export const PLAYERHUD_84DBC0_SUB_STRIDE = 0xc;
export const PLAYERHUD_84DBC0_THIS_OFFS = Object.freeze([
  0x54, 0x48, 0x3c, 0x30, 0x24, 0x18, 0,
]);
export const PLAYERHUD_84DBC0_HOST_VA_SUB = 0x004149d0;
export const PLAYERHUD_84DBC0_HOST_VA_STRING = 0x0040d040;
export const PLAYERHUD_84DBC0_NEXT_VA = 0x0084dc00;

/**
 * Packed host plan (VA 0x0084dbc0). 0x4149d0 / 0x40d040
 * stay host. Last slot is the e9 tail.
 * @returns {{ callCount: number, hostVa0: number,
 *   thisOff0: number, hostVa1: number, thisOff1: number,
 *   hostVa2: number, thisOff2: number, hostVa3: number,
 *   thisOff3: number, hostVa4: number, thisOff4: number,
 *   hostVa5: number, thisOff5: number, hostVa6: number,
 *   thisOff6: number, tailJmp: number, nextVa: number }}
 */
export function playerHud84dbc0Plan() {
  return {
    callCount: PLAYERHUD_84DBC0_CALL_COUNT,
    hostVa0: PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0,
    thisOff0: PLAYERHUD_84DBC0_THIS_OFFS[0],
    hostVa1: PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0,
    thisOff1: PLAYERHUD_84DBC0_THIS_OFFS[1],
    hostVa2: PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0,
    thisOff2: PLAYERHUD_84DBC0_THIS_OFFS[2],
    hostVa3: PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0,
    thisOff3: PLAYERHUD_84DBC0_THIS_OFFS[3],
    hostVa4: PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0,
    thisOff4: PLAYERHUD_84DBC0_THIS_OFFS[4],
    hostVa5: PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0,
    thisOff5: PLAYERHUD_84DBC0_THIS_OFFS[5],
    hostVa6: PLAYERHUD_84DBC0_HOST_VA_STRING >>> 0,
    thisOff6: PLAYERHUD_84DBC0_THIS_OFFS[6],
    tailJmp: 1,
    nextVa: PLAYERHUD_84DBC0_NEXT_VA >>> 0,
  };
}

export function playerHud84dbc0CallCount() {
  return PLAYERHUD_84DBC0_CALL_COUNT;
}

/** this-off at call index; 0 when index >= 7. */
export function playerHud84dbc0ThisOffAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_84DBC0_CALL_COUNT) return 0;
  return PLAYERHUD_84DBC0_THIS_OFFS[i] >>> 0;
}

/** host VA at call index; 0 when index >= 7. */
export function playerHud84dbc0HostVaAt(index) {
  const i = u32(index);
  if (i <= 5) return PLAYERHUD_84DBC0_HOST_VA_SUB >>> 0;
  if (i === 6) return PLAYERHUD_84DBC0_HOST_VA_STRING >>> 0;
  return 0;
}

/** 1 iff index is the e9 tail (slot 6). */
export function playerHud84dbc0IsTailJmp(index) {
  return u32(index) === 6 ? 1 : 0;
}

export function playerHud84dbc0NextVa() {
  return PLAYERHUD_84DBC0_NEXT_VA;
}

/* ABI v26: range wipe host plan
   (VA 0x00856840..0x00856893, ret). ecx=begin, edx=end.
   Empty range (begin==end, full dword) is a no-op.
   Else walk stride 0x68 (v22 OBJECT_SIZE by reference).
   Per-object call order is v25 0x84dbc0 THIS_OFFS /
   HOST_VA_SUB / HOST_VA_STRING by reference. Does not
   wrap 0x84dbc0 / 0x84dc00 / 0x8568a0. */
export const PLAYERHUD_856840_VA = 0x00856840;
export const PLAYERHUD_856840_RET_VA = 0x00856893;
export const PLAYERHUD_856840_CALL_COUNT = PLAYERHUD_84DBC0_CALL_COUNT;
export const PLAYERHUD_856840_STRIDE = PLAYERHUD_84DA20_OBJECT_SIZE;
export const PLAYERHUD_856840_THIS_OFFS = PLAYERHUD_84DBC0_THIS_OFFS;
export const PLAYERHUD_856840_HOST_VA_SUB = PLAYERHUD_84DBC0_HOST_VA_SUB;
export const PLAYERHUD_856840_HOST_VA_STRING = PLAYERHUD_84DBC0_HOST_VA_STRING;
export const PLAYERHUD_856840_NEXT_VA = 0x008568a0;

/**
 * 1 iff the range wipe runs (VA 0x00856843 cmp ecx,edi; je).
 * Full-dword compare. Wide equal pairs (0, 0x100) stay no-ops.
 * @param {number} begin ecx
 * @param {number} end edx
 */
export function playerHud856840Needed(begin, end) {
  return u32(begin) !== u32(end) ? 1 : 0;
}

/**
 * Unsigned (end-begin)/0x68 when end>=begin and delta%0x68==0;
 * else 0 (invalid range — PE would not terminate cleanly).
 * @param {number} begin ecx
 * @param {number} end edx
 */
export function playerHud856840Count(begin, end) {
  const b = u32(begin);
  const e = u32(end);
  if (e < b) return 0;
  const span = (e - b) >>> 0;
  if ((span % PLAYERHUD_856840_STRIDE) !== 0) return 0;
  return (span / PLAYERHUD_856840_STRIDE) >>> 0;
}

/**
 * Packed per-object host plan (VA 0x00856840). 0x4149d0 /
 * 0x40d040 stay host. Call order is v25 by reference.
 * @returns {{ callCount: number, hostVa0: number,
 *   thisOff0: number, hostVa1: number, thisOff1: number,
 *   hostVa2: number, thisOff2: number, hostVa3: number,
 *   thisOff3: number, hostVa4: number, thisOff4: number,
 *   hostVa5: number, thisOff5: number, hostVa6: number,
 *   thisOff6: number, stride: number, nextVa: number }}
 */
export function playerHud856840Plan() {
  return {
    callCount: PLAYERHUD_856840_CALL_COUNT,
    hostVa0: PLAYERHUD_856840_HOST_VA_SUB >>> 0,
    thisOff0: PLAYERHUD_856840_THIS_OFFS[0],
    hostVa1: PLAYERHUD_856840_HOST_VA_SUB >>> 0,
    thisOff1: PLAYERHUD_856840_THIS_OFFS[1],
    hostVa2: PLAYERHUD_856840_HOST_VA_SUB >>> 0,
    thisOff2: PLAYERHUD_856840_THIS_OFFS[2],
    hostVa3: PLAYERHUD_856840_HOST_VA_SUB >>> 0,
    thisOff3: PLAYERHUD_856840_THIS_OFFS[3],
    hostVa4: PLAYERHUD_856840_HOST_VA_SUB >>> 0,
    thisOff4: PLAYERHUD_856840_THIS_OFFS[4],
    hostVa5: PLAYERHUD_856840_HOST_VA_SUB >>> 0,
    thisOff5: PLAYERHUD_856840_THIS_OFFS[5],
    hostVa6: PLAYERHUD_856840_HOST_VA_STRING >>> 0,
    thisOff6: PLAYERHUD_856840_THIS_OFFS[6],
    stride: PLAYERHUD_856840_STRIDE >>> 0,
    nextVa: PLAYERHUD_856840_NEXT_VA >>> 0,
  };
}

export function playerHud856840CallCount() {
  return PLAYERHUD_856840_CALL_COUNT;
}

/** this-off at call index; 0 when index >= 7. v25 by ref. */
export function playerHud856840ThisOffAt(index) {
  return playerHud84dbc0ThisOffAt(index);
}

/** host VA at call index; 0 when index >= 7. v25 by ref. */
export function playerHud856840HostVaAt(index) {
  return playerHud84dbc0HostVaAt(index);
}

export function playerHud856840Stride() {
  return PLAYERHUD_856840_STRIDE;
}

export function playerHud856840NextVa() {
  return PLAYERHUD_856840_NEXT_VA;
}

/* ABI v27: FUN_0084dea0 / FUN_0084e200 GATE/PLAN.
   Gate [this+4]==0 skip (full dword). Six host 0x84dc00
   calls. xmm1 offs are v19 slot base+4 by reference.
   Sibling 0x84e200 xorps-neg with v21 RDATA_NEG.
   Does not wrap 0x84dc00 / 0x84ea90 / 0x84eb10. */
export const PLAYERHUD_84DEA0_VA = 0x0084dea0;
export const PLAYERHUD_84DEA0_RET_VA = 0x0084e1fd;
export const PLAYERHUD_84DEA0_CALL_COUNT = PLAYERHUD_84E9D0_SLOT_COUNT;
export const PLAYERHUD_84DEA0_GATE_OFF = 4;
export const PLAYERHUD_84DEA0_HOST_VA = 0x0084dc00;
export const PLAYERHUD_84DEA0_PLAYER_PTR_OFF = PLAYERHUD_84E9D0_PLAYER_PTR_OFF;
export const PLAYERHUD_84DEA0_SLOT_COUNT = PLAYERHUD_84E9D0_SLOT_COUNT;
export const PLAYERHUD_84DEA0_SLOT_STRIDE = PLAYERHUD_84E9D0_SLOT_STRIDE;
export const PLAYERHUD_84DEA0_NEXT_VA = 0x0084e200;
export const PLAYERHUD_84DEA0_XMM1_OFFS = Object.freeze([
  (PLAYERHUD_84E9D0_SLOTS_BASE + 4) >>> 0,
  (PLAYERHUD_84E9D0_SLOTS_BASE + PLAYERHUD_84E9D0_SLOT_STRIDE + 4) >>> 0,
  (PLAYERHUD_84E9D0_SLOTS_BASE + 2 * PLAYERHUD_84E9D0_SLOT_STRIDE + 4) >>> 0,
  (PLAYERHUD_84E9D0_SLOTS_BASE + 3 * PLAYERHUD_84E9D0_SLOT_STRIDE + 4) >>> 0,
  (PLAYERHUD_84E9D0_SLOTS_BASE + 4 * PLAYERHUD_84E9D0_SLOT_STRIDE + 4) >>> 0,
  (PLAYERHUD_84E9D0_SLOTS_BASE + 5 * PLAYERHUD_84E9D0_SLOT_STRIDE + 4) >>> 0,
]);
export const PLAYERHUD_84DEA0_LABEL_VAS = Object.freeze([
  0x00b6e274, 0x00b6e2e4, 0x00b6e2ec, 0x00b6e2d0, 0x00b6e2d8, 0x00b6e2b8,
]);
export const PLAYERHUD_84DEA0_LABEL_SIZES = Object.freeze([
  6, 6, 7, 6, 0xb, 5,
]);
export const PLAYERHUD_84E200_VA = 0x0084e200;
export const PLAYERHUD_84E200_RET_VA = 0x0084e59e;
export const PLAYERHUD_84E200_NEXT_VA = 0x0084e5b0;
export const PLAYERHUD_84E200_RDATA_NEG = PLAYERHUD_84D8B0_RDATA_NEG;
export const PLAYERHUD_84E200_XORPS = 1;

/** 1 iff [this+4] != 0 (VA 0x0084decb / 0x0084e23f). Full dword. */
export function playerHud84dea0Needed(thisPlus4) {
  return u32(thisPlus4) !== 0 ? 1 : 0;
}

export function playerHud84dea0Plan() {
  return {
    callCount: PLAYERHUD_84DEA0_CALL_COUNT,
    hostVa: PLAYERHUD_84DEA0_HOST_VA >>> 0,
    gateOff: PLAYERHUD_84DEA0_GATE_OFF,
    playerPtrOff: PLAYERHUD_84DEA0_PLAYER_PTR_OFF >>> 0,
    slotCount: PLAYERHUD_84DEA0_SLOT_COUNT,
    slotStride: PLAYERHUD_84DEA0_SLOT_STRIDE >>> 0,
    xmm1Off0: PLAYERHUD_84DEA0_XMM1_OFFS[0],
    labelVa0: PLAYERHUD_84DEA0_LABEL_VAS[0] >>> 0,
    labelSize0: PLAYERHUD_84DEA0_LABEL_SIZES[0],
    xmm1Off1: PLAYERHUD_84DEA0_XMM1_OFFS[1],
    labelVa1: PLAYERHUD_84DEA0_LABEL_VAS[1] >>> 0,
    labelSize1: PLAYERHUD_84DEA0_LABEL_SIZES[1],
    xmm1Off2: PLAYERHUD_84DEA0_XMM1_OFFS[2],
    labelVa2: PLAYERHUD_84DEA0_LABEL_VAS[2] >>> 0,
    labelSize2: PLAYERHUD_84DEA0_LABEL_SIZES[2],
    xmm1Off3: PLAYERHUD_84DEA0_XMM1_OFFS[3],
    labelVa3: PLAYERHUD_84DEA0_LABEL_VAS[3] >>> 0,
    labelSize3: PLAYERHUD_84DEA0_LABEL_SIZES[3],
    xmm1Off4: PLAYERHUD_84DEA0_XMM1_OFFS[4],
    labelVa4: PLAYERHUD_84DEA0_LABEL_VAS[4] >>> 0,
    labelSize4: PLAYERHUD_84DEA0_LABEL_SIZES[4],
    xmm1Off5: PLAYERHUD_84DEA0_XMM1_OFFS[5],
    labelVa5: PLAYERHUD_84DEA0_LABEL_VAS[5] >>> 0,
    labelSize5: PLAYERHUD_84DEA0_LABEL_SIZES[5],
    xorpsRdata: PLAYERHUD_84E200_RDATA_NEG >>> 0,
    xorpsSibling: PLAYERHUD_84E200_XORPS,
    nextVa: PLAYERHUD_84DEA0_NEXT_VA >>> 0,
    siblingNextVa: PLAYERHUD_84E200_NEXT_VA >>> 0,
  };
}

export function playerHud84dea0CallCount() {
  return PLAYERHUD_84DEA0_CALL_COUNT;
}

export function playerHud84dea0Xmm1OffAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_84DEA0_SLOT_COUNT) return 0;
  return PLAYERHUD_84DEA0_XMM1_OFFS[i] >>> 0;
}

export function playerHud84dea0LabelVaAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_84DEA0_SLOT_COUNT) return 0;
  return PLAYERHUD_84DEA0_LABEL_VAS[i] >>> 0;
}

export function playerHud84dea0LabelSizeAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_84DEA0_SLOT_COUNT) return 0;
  return PLAYERHUD_84DEA0_LABEL_SIZES[i] >>> 0;
}

export function playerHud84dea0HostVa() {
  return PLAYERHUD_84DEA0_HOST_VA >>> 0;
}

export function playerHud84dea0NextVa() {
  return PLAYERHUD_84DEA0_NEXT_VA;
}

export function playerHud84e200XorpsNeeded() {
  return PLAYERHUD_84E200_XORPS;
}

export function playerHud84e200NextVa() {
  return PLAYERHUD_84E200_NEXT_VA;
}

/* ABI v28: FUN_0084e5b0 predicate GATE/PLAN + pure islands.
   VA 0x0084e5b0..0x0084e81a ret 0xc. thiscall + 3 stdcall args
   (index, player*, flags). identify-zhl: no exact match.
   Parent vector this+0x2c/+0x30 of 0x68 objects (v22
   OBJECT_SIZE / v26 STRIDE by reference). Gate off 4 is v27
   84DEA0_GATE_OFF by reference, inverted polarity ([this+4]==0
   is early-true AFTER unsigned in-range). Sub-vector offs are
   v25 84DBC0_THIS_OFFS low-to-high. Player type 0x13c0 is P5
   PLAYERHUD_P5_OFF_CHAR_TYPE_13C0 by reference. Host 0x7706e0
   is PLAYERHUD_HOST_VA_HAS_COLLECTIBLE by reference. 0x771550
   stays address-stable. +0x60 globals stay host. */

export const PLAYERHUD_84E5B0_VA = 0x0084e5b0;
export const PLAYERHUD_84E5B0_RET_VA = 0x0084e81a;
export const PLAYERHUD_84E5B0_STRIDE = PLAYERHUD_84DA20_OBJECT_SIZE;
export const PLAYERHUD_84E5B0_VEC_BEGIN_OFF = 0x2c;
export const PLAYERHUD_84E5B0_VEC_END_OFF = 0x30;
export const PLAYERHUD_84E5B0_GATE_OFF = PLAYERHUD_84DEA0_GATE_OFF;
export const PLAYERHUD_84E5B0_PLAYER_TYPE_OFF = 0x13c0; /* P5 CHAR_TYPE by ref */
export const PLAYERHUD_84E5B0_VEC_OFFS = Object.freeze([
  PLAYERHUD_84DBC0_THIS_OFFS[5],
  PLAYERHUD_84DBC0_THIS_OFFS[4],
  PLAYERHUD_84DBC0_THIS_OFFS[3],
  PLAYERHUD_84DBC0_THIS_OFFS[2],
  PLAYERHUD_84DBC0_THIS_OFFS[1],
  PLAYERHUD_84DBC0_THIS_OFFS[0],
]);
export const PLAYERHUD_84E5B0_VEC_COUNT = PLAYERHUD_84E5B0_VEC_OFFS.length;
export const PLAYERHUD_84E5B0_COMPLETION_OFF = 0x60;
export const PLAYERHUD_84E5B0_MODE_OFF = 0x64;
export const PLAYERHUD_84E5B0_HOST_VA_COL = PLAYERHUD_HOST_VA_HAS_COLLECTIBLE;
export const PLAYERHUD_84E5B0_HOST_VA_TRK = 0x00771550;
export const PLAYERHUD_84E5B0_FLAG_SHR_MODE1 = 0xf;
export const PLAYERHUD_84E5B0_FLAG_SHR_MODE2 = 0xb;
export const PLAYERHUD_84E5B0_COMPLETION_MAX = 0x282;
export const PLAYERHUD_84E5B0_COMPLETION_NEG2 = 0xfffffffe;
export const PLAYERHUD_84E5B0_PREFIX_FAIL = 0;
export const PLAYERHUD_84E5B0_PREFIX_EARLY = 1;
export const PLAYERHUD_84E5B0_PREFIX_CONT = 2;
export const PLAYERHUD_84E5B0_NEXT_VA = 0x0084e820;

/** Signed toward-zero (end-begin)/0x68. PE magic 0x4ec4ec4f. */
export function playerHud84e5b0Count(begin, end) {
  const span = i32(u32(end) - u32(begin));
  return (Math.trunc(span / PLAYERHUD_84E5B0_STRIDE) | 0) >>> 0;
}

/** Unsigned jae (PE 0x0084e5db). */
export function playerHud84e5b0InRange(index, begin, end) {
  return u32(index) < playerHud84e5b0Count(begin, end) ? 1 : 0;
}

/** 1 iff [this+4]==0 (full dword). */
export function playerHud84e5b0EarlyTrue(thisPlus4) {
  return u32(thisPlus4) === 0 ? 1 : 0;
}

/** 0 fail / 1 early-true / 2 continue. Bounds before gate. */
export function playerHud84e5b0Prefix(index, begin, end, thisPlus4) {
  if (playerHud84e5b0InRange(index, begin, end) === 0) {
    return PLAYERHUD_84E5B0_PREFIX_FAIL;
  }
  if (playerHud84e5b0EarlyTrue(thisPlus4) !== 0) {
    return PLAYERHUD_84E5B0_PREFIX_EARLY;
  }
  return PLAYERHUD_84E5B0_PREFIX_CONT;
}

/** index * 0x68, 32-bit wrap. */
export function playerHud84e5b0ObjectOff(index) {
  return Math.imul(u32(index), PLAYERHUD_84E5B0_STRIDE) >>> 0;
}

/** Signed sar 2 of (end-begin). */
export function playerHud84e5b0DwordCount(begin, end) {
  return (i32(u32(end) - u32(begin)) >> 2) >>> 0;
}

/** Empty (count==0) or has!=0. */
export function playerHud84e5b0WhitelistOk(count, has) {
  if (u32(count) === 0) return 1;
  return u32(has) !== 0 ? 1 : 0;
}

/** No match (has==0). */
export function playerHud84e5b0BlacklistOk(has) {
  return u32(has) === 0 ? 1 : 0;
}

/**
 * 0 fail / 1 skip / 2 host.
 * Order: 0 skip, -2 fail, js skip, jae 0x282 fail.
 */
export function playerHud84e5b0CompletionPrefix(id) {
  const v = u32(id);
  if (v === 0) return 1;
  if (v === PLAYERHUD_84E5B0_COMPLETION_NEG2) return 0;
  if (i32(v) < 0) return 1;
  if (v >= PLAYERHUD_84E5B0_COMPLETION_MAX) return 0;
  return 2;
}

/** +0x64 vs [this] vs flags. game_269c8 recaptured. */
export function playerHud84e5b0ModeOk(thisMode, obj64, flags, game269c8) {
  const mode = u32(thisMode);
  const slot = u32(obj64);
  const fl = u32(flags);
  if (slot === 0) return 1;
  if (mode === 0) return 1;
  if (mode === 1) {
    if (slot === 1) {
      return (fl >>> PLAYERHUD_84E5B0_FLAG_SHR_MODE1) & 1;
    }
    if (slot === 2) {
      return (~(fl >>> PLAYERHUD_84E5B0_FLAG_SHR_MODE1)) & 1;
    }
    return 1;
  }
  if (mode === 2) {
    const shifted = fl >>> PLAYERHUD_84E5B0_FLAG_SHR_MODE2;
    if (slot === 1) return shifted & 1;
    if (slot === 2) return (~shifted) & 1;
    return 1;
  }
  if (mode !== 3) return 1;
  if (slot !== 1) return 1;
  const g = u32(game269c8);
  if (g === 2 || g === 3) return 1;
  return 0;
}

export function playerHud84e5b0Decide(
  index, begin, end, thisPlus4,
  wlCount, wlHas, blHas, reqColOk,
  forbColHit, reqTrkOk, forbTrkHit,
  completionOk, thisMode, obj64, flags, game269c8,
) {
  const prefix = playerHud84e5b0Prefix(index, begin, end, thisPlus4);
  if (prefix === PLAYERHUD_84E5B0_PREFIX_FAIL) return 0;
  if (prefix === PLAYERHUD_84E5B0_PREFIX_EARLY) return 1;
  if (playerHud84e5b0WhitelistOk(wlCount, wlHas) === 0) return 0;
  if (playerHud84e5b0BlacklistOk(blHas) === 0) return 0;
  if (u32(reqColOk) === 0) return 0;
  if (u32(forbColHit) !== 0) return 0;
  if (u32(reqTrkOk) === 0) return 0;
  if (u32(forbTrkHit) !== 0) return 0;
  if (u32(completionOk) === 0) return 0;
  return playerHud84e5b0ModeOk(thisMode, obj64, flags, game269c8);
}

export function playerHud84e5b0Plan() {
  return {
    stride: PLAYERHUD_84E5B0_STRIDE >>> 0,
    vecBeginOff: PLAYERHUD_84E5B0_VEC_BEGIN_OFF,
    vecEndOff: PLAYERHUD_84E5B0_VEC_END_OFF,
    gateOff: PLAYERHUD_84E5B0_GATE_OFF,
    playerTypeOff: PLAYERHUD_84E5B0_PLAYER_TYPE_OFF >>> 0,
    vecOff0: PLAYERHUD_84E5B0_VEC_OFFS[0],
    vecOff1: PLAYERHUD_84E5B0_VEC_OFFS[1],
    vecOff2: PLAYERHUD_84E5B0_VEC_OFFS[2],
    vecOff3: PLAYERHUD_84E5B0_VEC_OFFS[3],
    vecOff4: PLAYERHUD_84E5B0_VEC_OFFS[4],
    vecOff5: PLAYERHUD_84E5B0_VEC_OFFS[5],
    completionOff: PLAYERHUD_84E5B0_COMPLETION_OFF,
    modeOff: PLAYERHUD_84E5B0_MODE_OFF,
    hostVaCol: PLAYERHUD_84E5B0_HOST_VA_COL >>> 0,
    hostVaTrk: PLAYERHUD_84E5B0_HOST_VA_TRK >>> 0,
    flagShrMode1: PLAYERHUD_84E5B0_FLAG_SHR_MODE1,
    flagShrMode2: PLAYERHUD_84E5B0_FLAG_SHR_MODE2,
    completionMax: PLAYERHUD_84E5B0_COMPLETION_MAX,
    nextVa: PLAYERHUD_84E5B0_NEXT_VA >>> 0,
  };
}

export function playerHud84e5b0VecOffAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_84E5B0_VEC_COUNT) return 0;
  return PLAYERHUD_84E5B0_VEC_OFFS[i] >>> 0;
}

export function playerHud84e5b0HostVaAt(index) {
  const i = u32(index);
  if (i === 2 || i === 3) return PLAYERHUD_84E5B0_HOST_VA_COL >>> 0;
  if (i === 4 || i === 5) return PLAYERHUD_84E5B0_HOST_VA_TRK >>> 0;
  return 0;
}

export function playerHud84e5b0FailIfAlAt(index) {
  const i = u32(index);
  return i === 3 || i === 5 ? 1 : 0;
}

export function playerHud84e5b0Stride() {
  return PLAYERHUD_84E5B0_STRIDE;
}

export function playerHud84e5b0NextVa() {
  return PLAYERHUD_84E5B0_NEXT_VA;
}

/* ABI v29: FUN_0084e820 counter GATE/PLAN + pure islands.
   VA 0x0084e820..0x0084e97d ret 8. thiscall + 2 stdcall args.
   identify-zhl: no exact match (0x84e820 / 0x72fe80 / 0x72fec0).
   [this+4]==0 early-return signed /0x68 of this+0x2c/+0x30
   (v28 count by ref). Game+0x2a448/+0x2a44c dword list.
   Empty range kind==0xf char ids; else host 0x72fe80/0x72fec0
   recapture al. Extra this+0x20/+0x24 (v26 by ref). Pred loop
   recaptures v28 0x84e5b0 al. Next VA 0x0084e9d0 (v19). */

export const PLAYERHUD_84E820_VA = 0x0084e820;
export const PLAYERHUD_84E820_RET_VA = 0x0084e97d;
export const PLAYERHUD_84E820_STRIDE = PLAYERHUD_84E5B0_STRIDE;
export const PLAYERHUD_84E820_GATE_OFF = PLAYERHUD_84DEA0_GATE_OFF;
export const PLAYERHUD_84E820_VEC_BEGIN_OFF = PLAYERHUD_84E5B0_VEC_BEGIN_OFF;
export const PLAYERHUD_84E820_VEC_END_OFF = PLAYERHUD_84E5B0_VEC_END_OFF;
export const PLAYERHUD_84E820_EXTRA_BEGIN_OFF = 0x20;
export const PLAYERHUD_84E820_EXTRA_END_OFF = 0x24;
export const PLAYERHUD_84E820_GAME_BEGIN_OFF = 0x2a448;
export const PLAYERHUD_84E820_GAME_END_OFF = 0x2a44c;
export const PLAYERHUD_84E820_RANGE_LO_OFF = 8;
export const PLAYERHUD_84E820_RANGE_HI_OFF = 0xc;
export const PLAYERHUD_84E820_SPECIAL_KIND = 0xf;
export const PLAYERHUD_84E820_CHAR_MODE0_A = 0x23;
export const PLAYERHUD_84E820_CHAR_MODE0_B = 0x106;
export const PLAYERHUD_84E820_CHAR_MODE1 = 0x30;
export const PLAYERHUD_84E820_HOST_VA_MODE0 = 0x0072fe80;
export const PLAYERHUD_84E820_HOST_VA_MODE1 = 0x0072fec0;
export const PLAYERHUD_84E820_HOST_VA_PRED = PLAYERHUD_84E5B0_VA;
export const PLAYERHUD_84E820_NEXT_VA = 0x0084e9d0;

/** 1 iff [this+4]==0 (full dword). Early-return the /0x68 count. */
export function playerHud84e820GateZero(thisPlus4) {
  return u32(thisPlus4) === 0 ? 1 : 0;
}

/** Signed toward-zero (end-begin)/0x68. v28 count by ref. */
export function playerHud84e820Count(begin, end) {
  return playerHud84e5b0Count(begin, end);
}

/** Signed sar 2 of (end-begin). Game dword vector. */
export function playerHud84e820PtrCount(begin, end) {
  return playerHud84e5b0DwordCount(begin, end);
}

/** Signed body gate: test esi,esi js / cmp jge. */
export function playerHud84e820InRange(index, count) {
  const i = i32(index);
  const c = i32(count);
  return i >= 0 && i < c ? 1 : 0;
}

/** Unsigned jb loop continue. */
export function playerHud84e820LoopCont(index, count) {
  return u32(index) < u32(count) ? 1 : 0;
}

/** (lo|hi)==0. */
export function playerHud84e820RangeEmpty(lo, hi) {
  return (u32(lo) | u32(hi)) === 0 ? 1 : 0;
}

/** kind==0xf and mode/char-id match. Full-dword cmps. */
export function playerHud84e820SpecialOk(kind, mode, thisPlus4) {
  if (u32(kind) !== PLAYERHUD_84E820_SPECIAL_KIND) return 0;
  const id = u32(thisPlus4);
  const m = u32(mode);
  if (m === 0) {
    return id === PLAYERHUD_84E820_CHAR_MODE0_A ||
      id === PLAYERHUD_84E820_CHAR_MODE0_B
      ? 1
      : 0;
  }
  if (m === 1) {
    return id === PLAYERHUD_84E820_CHAR_MODE1 ? 1 : 0;
  }
  return 0;
}

/** test al, al. */
export function playerHud84e820AlHit(hostAl) {
  return (u32(hostAl) & 0xff) !== 0 ? 1 : 0;
}

export function playerHud84e820EntryInc(
  ptr, lo, hi, kind, mode, thisPlus4, hostAl,
) {
  if (u32(ptr) === 0) return 0;
  if (playerHud84e820RangeEmpty(lo, hi) !== 0) {
    return playerHud84e820SpecialOk(kind, mode, thisPlus4);
  }
  const m = u32(mode);
  if (m !== 0 && m !== 1) return 0;
  return playerHud84e820AlHit(hostAl);
}

/** extra==0 ? acc : extra+acc (PE cmove). */
export function playerHud84e820ExtraSum(extraCount, acc) {
  const extra = u32(extraCount);
  const a = u32(acc);
  if (extra === 0) return a;
  return (extra + a) >>> 0;
}

export function playerHud84e820Decide(
  index, ptrCount, ptr, lo, hi, kind, mode, thisPlus4, hostAl,
) {
  if (playerHud84e820InRange(index, ptrCount) === 0) return 0;
  return playerHud84e820EntryInc(ptr, lo, hi, kind, mode, thisPlus4, hostAl);
}

export function playerHud84e820Plan() {
  return {
    stride: PLAYERHUD_84E820_STRIDE >>> 0,
    gateOff: PLAYERHUD_84E820_GATE_OFF,
    vecBeginOff: PLAYERHUD_84E820_VEC_BEGIN_OFF,
    vecEndOff: PLAYERHUD_84E820_VEC_END_OFF,
    extraBeginOff: PLAYERHUD_84E820_EXTRA_BEGIN_OFF,
    extraEndOff: PLAYERHUD_84E820_EXTRA_END_OFF,
    gameBeginOff: PLAYERHUD_84E820_GAME_BEGIN_OFF,
    gameEndOff: PLAYERHUD_84E820_GAME_END_OFF,
    rangeLoOff: PLAYERHUD_84E820_RANGE_LO_OFF,
    rangeHiOff: PLAYERHUD_84E820_RANGE_HI_OFF,
    specialKind: PLAYERHUD_84E820_SPECIAL_KIND,
    charMode0A: PLAYERHUD_84E820_CHAR_MODE0_A,
    charMode0B: PLAYERHUD_84E820_CHAR_MODE0_B,
    charMode1: PLAYERHUD_84E820_CHAR_MODE1,
    hostVaMode0: PLAYERHUD_84E820_HOST_VA_MODE0 >>> 0,
    hostVaMode1: PLAYERHUD_84E820_HOST_VA_MODE1 >>> 0,
    hostVaPred: PLAYERHUD_84E820_HOST_VA_PRED >>> 0,
    nextVa: PLAYERHUD_84E820_NEXT_VA >>> 0,
  };
}

export function playerHud84e820HostVaAt(mode) {
  const m = u32(mode);
  if (m === 0) return PLAYERHUD_84E820_HOST_VA_MODE0 >>> 0;
  if (m === 1) return PLAYERHUD_84E820_HOST_VA_MODE1 >>> 0;
  return 0;
}

export function playerHud84e820Stride() {
  return PLAYERHUD_84E820_STRIDE;
}

export function playerHud84e820NextVa() {
  return PLAYERHUD_84E820_NEXT_VA;
}

/* ABI v30: FUN_008568a0 0x68-object copy-ctor typed host plan.
   thiscall dest=ecx + stdcall src [ebp+8]; ret 4; eax=dest.
   Seven calls: 1x 0x40cf50 SSO-string copy-ctor (this=dest,
   arg=src; +0 member) then 6x 0x43eca0 0xc-vector copy-ctor
   (this=dest+off, arg=src+off) at +0x18..+0x54 low-to-high
   (v28 vec offs by reference). Pure tail: dword copies
   +0x60/+0x64 (v28 completion/mode by reference). Hosts
   0x40cf50 / 0x43eca0 stay host. Does not wrap the wipe. */
export const PLAYERHUD_8568A0_VA = 0x008568a0;
export const PLAYERHUD_8568A0_RET_VA = 0x00856954;
export const PLAYERHUD_8568A0_CALL_COUNT = 7;
export const PLAYERHUD_8568A0_HOST_VA_STRING = 0x0040cf50;
export const PLAYERHUD_8568A0_HOST_VA_SUB = 0x0043eca0;
export const PLAYERHUD_8568A0_THIS_OFFS = Object.freeze([0, 0x18, 0x24, 0x30, 0x3c, 0x48, 0x54]);
export const PLAYERHUD_8568A0_TAIL_BEGIN_OFF = 0x60;
export const PLAYERHUD_8568A0_TAIL_DWORD_COUNT = 2;
export const PLAYERHUD_8568A0_OBJECT_SIZE = PLAYERHUD_84DA20_OBJECT_SIZE;
export const PLAYERHUD_8568A0_NEXT_VA = 0x00856960;

/**
 * Packed 0x68-object copy-ctor host plan (VA 0x008568a0).
 * @returns {{ callCount: number, hostVa0: number, thisOff0: number,
 *   argOff0: number, hostVa1: number, thisOff1: number, argOff1: number,
 *   hostVa2: number, thisOff2: number, argOff2: number, hostVa3: number,
 *   thisOff3: number, argOff3: number, hostVa4: number, thisOff4: number,
 *   argOff4: number, hostVa5: number, thisOff5: number, argOff5: number,
 *   hostVa6: number, thisOff6: number, argOff6: number, tailBeginOff: number,
 *   tailDwordCount: number, objectSize: number, nextVa: number }}
 */
export function playerHud8568a0Plan() {
  return {
    callCount: PLAYERHUD_8568A0_CALL_COUNT,
    hostVa0: PLAYERHUD_8568A0_HOST_VA_STRING >>> 0,
    thisOff0: PLAYERHUD_8568A0_THIS_OFFS[0],
    argOff0: PLAYERHUD_8568A0_THIS_OFFS[0],
    hostVa1: PLAYERHUD_8568A0_HOST_VA_SUB >>> 0,
    thisOff1: PLAYERHUD_8568A0_THIS_OFFS[1],
    argOff1: PLAYERHUD_8568A0_THIS_OFFS[1],
    hostVa2: PLAYERHUD_8568A0_HOST_VA_SUB >>> 0,
    thisOff2: PLAYERHUD_8568A0_THIS_OFFS[2],
    argOff2: PLAYERHUD_8568A0_THIS_OFFS[2],
    hostVa3: PLAYERHUD_8568A0_HOST_VA_SUB >>> 0,
    thisOff3: PLAYERHUD_8568A0_THIS_OFFS[3],
    argOff3: PLAYERHUD_8568A0_THIS_OFFS[3],
    hostVa4: PLAYERHUD_8568A0_HOST_VA_SUB >>> 0,
    thisOff4: PLAYERHUD_8568A0_THIS_OFFS[4],
    argOff4: PLAYERHUD_8568A0_THIS_OFFS[4],
    hostVa5: PLAYERHUD_8568A0_HOST_VA_SUB >>> 0,
    thisOff5: PLAYERHUD_8568A0_THIS_OFFS[5],
    argOff5: PLAYERHUD_8568A0_THIS_OFFS[5],
    hostVa6: PLAYERHUD_8568A0_HOST_VA_SUB >>> 0,
    thisOff6: PLAYERHUD_8568A0_THIS_OFFS[6],
    argOff6: PLAYERHUD_8568A0_THIS_OFFS[6],
    tailBeginOff: PLAYERHUD_8568A0_TAIL_BEGIN_OFF,
    tailDwordCount: PLAYERHUD_8568A0_TAIL_DWORD_COUNT,
    objectSize: PLAYERHUD_8568A0_OBJECT_SIZE >>> 0,
    nextVa: PLAYERHUD_8568A0_NEXT_VA >>> 0,
  };
}

export function playerHud8568a0CallCount() {
  return PLAYERHUD_8568A0_CALL_COUNT;
}

/** this/dest offset at call index; 0 when index >= 7. */
export function playerHud8568a0ThisOffAt(index) {
  const i = u32(index);
  if (i >= PLAYERHUD_8568A0_CALL_COUNT) return 0;
  return PLAYERHUD_8568A0_THIS_OFFS[i];
}

/** src offset at call index (mirror of this off in the PE). */
export function playerHud8568a0ArgOffAt(index) {
  return playerHud8568a0ThisOffAt(index);
}

/** host VA at call index; 0 when index >= 7. */
export function playerHud8568a0HostVaAt(index) {
  const i = u32(index);
  if (i === 0) return PLAYERHUD_8568A0_HOST_VA_STRING >>> 0;
  if (i <= 6) return PLAYERHUD_8568A0_HOST_VA_SUB >>> 0;
  return 0;
}

export function playerHud8568a0TailBeginOff() {
  return PLAYERHUD_8568A0_TAIL_BEGIN_OFF;
}

export function playerHud8568a0TailDwordCount() {
  return PLAYERHUD_8568A0_TAIL_DWORD_COUNT;
}

export function playerHud8568a0ObjectSize() {
  return PLAYERHUD_8568A0_OBJECT_SIZE;
}

export function playerHud8568a0NextVa() {
  return PLAYERHUD_8568A0_NEXT_VA;
}

/**
 * PE 0x00856936..0x0085693f pure tail: copies tailDwordCount dwords
 * from src[base..] to dest[base..] where base = tailBeginOff/4.
 * Returns 1 when a copy was made (both pointers non-null).
 * @param {number} destPtr
 * @param {number} srcPtr
 */
export function playerHud8568a0TailCopy(destPtr, srcPtr) {
  if (u32(destPtr) === 0 || u32(srcPtr) === 0) return 0;
  return 1;
}

/* ABI v31: FUN_00856960 stdcall range move-ctor + pure leaf
   FUN_00856e10 move-ctor (v30's next; the 0x68-object vector
   reallocation chain 856650 -> 8568a0 / 0x856e10 / 0x856960 /
   0x856840). 856960 args [ebp+8]=src_begin, [ebp+0xc]=src_end,
   [ebp+0x10]=dest; ret 0xc; eax=dest_end (dest + count*0x68).
   Full-dword gate src_begin != src_end; stride 0x68 (v22 by ref);
   per-element thiscall move-ctor 0x856e10 (ret 4, eax=dest).
   Trailing 0x856840(dest_end, dest_end) is invariant-empty (always
   a no-op) — documented, not reproduced. 856e10 pure: dest[0..0x68)
   = src[0..0x68); src reset to empty (byte +0 = 0, +0x10 = 0,
   +0x14 = 0xf SSO cap, six 0xc triples +0x18..+0x5c zeroed; v28 vec
   offs by reference); tail +0x60/+0x64 copied, src keeps them.
   Both Not Update-wired. Next VA 0x008569a0. */
export const PLAYERHUD_856960_VA = 0x00856960;
export const PLAYERHUD_856960_RET_VA = 0x00856998;
export const PLAYERHUD_856960_STRIDE = PLAYERHUD_84DA20_OBJECT_SIZE;
export const PLAYERHUD_856960_MOVE_CTOR_VA = 0x00856e10;
export const PLAYERHUD_856960_WIPE_VA = 0x00856840;
export const PLAYERHUD_856960_NEXT_VA = 0x008569a0;
export const PLAYERHUD_856E10_VA = 0x00856e10;
export const PLAYERHUD_856E10_RET_VA = 0x00856f4a;
export const PLAYERHUD_856E10_NEXT_VA = 0x00856f50;
export const PLAYERHUD_856E10_OBJECT_SIZE = PLAYERHUD_84DA20_OBJECT_SIZE;
export const PLAYERHUD_856E10_SSO_CAPACITY = 0xf;
export const PLAYERHUD_856E10_SSO_SIZE_OFF = 0x10;
export const PLAYERHUD_856E10_SSO_CAP_OFF = 0x14;
export const PLAYERHUD_856E10_VEC_TRIPLE_COUNT = 6;
export const PLAYERHUD_856E10_VEC_TRIPLE_STRIDE = 0xc;
export const PLAYERHUD_856E10_VEC_BEGIN_OFF = 0x18;
export const PLAYERHUD_856E10_VEC_END_OFF = 0x5c;
export const PLAYERHUD_856E10_TAIL_BEGIN_OFF = 0x60;
export const PLAYERHUD_856E10_TAIL_DWORD_COUNT = 2;

/** 1 iff the range move runs (PE 0x0085696f cmp esi,ebx; je). */
export function playerHud856960Needed(srcBegin, srcEnd) {
  return u32(srcBegin) !== u32(srcEnd) ? 1 : 0;
}

/** Defensive trip count: 0 when negative/non-multiple span. */
export function playerHud856960Count(srcBegin, srcEnd) {
  const b = u32(srcBegin);
  const e = u32(srcEnd);
  if (e < b) return 0;
  const span = (e - b) >>> 0;
  if ((span % PLAYERHUD_856960_STRIDE) !== 0) return 0;
  return (span / PLAYERHUD_856960_STRIDE) >>> 0;
}

export function playerHud856960Stride() {
  return PLAYERHUD_856960_STRIDE;
}

export function playerHud856960MoveCtorVa() {
  return PLAYERHUD_856960_MOVE_CTOR_VA;
}

export function playerHud856960WipeVa() {
  return PLAYERHUD_856960_WIPE_VA;
}

export function playerHud856960NextVa() {
  return PLAYERHUD_856960_NEXT_VA;
}

/**
 * Pure range move-ctor oracle (VA 0x00856960): returns dest_end =
 * dest + count*0x68 (PE eax=edi after the loop; the invariant-empty
 * trailing 0x856840 call is omitted). Null-free empty range returns
 * dest (== dest_end). @param {number} destPtr @param {number} srcBegin
 * @param {number} srcEnd
 */
export function playerHud856960MoveRange(destPtr, srcBegin, srcEnd) {
  if (u32(destPtr) === 0 || u32(srcBegin) === 0 || u32(srcEnd) === 0) {
    return 0;
  }
  const n = playerHud856960Count(srcBegin, srcEnd);
  if (n === 0) return u32(destPtr);
  return (u32(destPtr) + n * PLAYERHUD_856960_STRIDE) >>> 0;
}

/** Pure move-ctor oracle (VA 0x00856e10): 0 on null, else dest. */
export function playerHud856e10MoveCtor(destPtr, srcPtr) {
  if (u32(destPtr) === 0 || u32(srcPtr) === 0) return 0;
  return u32(destPtr);
}

export function playerHud856e10ObjectSize() {
  return PLAYERHUD_856E10_OBJECT_SIZE;
}

export function playerHud856e10NextVa() {
  return PLAYERHUD_856E10_NEXT_VA;
}

/* ABI v34: pure leaf gate FUN_00856f50 (VA 0x00856f50..0x00856f61,
 * the v31 recorded next after FUN_00856e10 ret 4 @ 0x00856f4a).
 * thiscall, no args, two early-exit rets (0x856f5e xor al,al /
 * 0x856f61 mov al,1).  PE 0x00856f50: mov eax,[ecx+8]; cmp eax,2;
 * je 1; test eax,eax; je 1; xor al,al; ret — returns 1 iff
 * [this+8] == 2 || [this+8] == 0.  FULL-DWORD compares (cmp dword
 * + test dword; no byte gate).  0 E8, 0 stores, 0 indirect.  Sole
 * direct rel32 caller 0x0085a554 (mov ecx,esi; call; test al,al;
 * je).  Next VA 0x00856f70 (SEH ctor host, 5 E8 — blocked). */
export const PLAYERHUD_856F50_VA = 0x00856f50;
export const PLAYERHUD_856F50_RET_VA = 0x00856f61;
export const PLAYERHUD_856F50_NEXT_VA = 0x00856f70; /* SEH ctor host */
export const PLAYERHUD_856F50_FIELD_OFF = 8;

/** 1 iff field8 == 2 || field8 == 0 (both full-dword tests). */
export function playerHud856f50Gate(field8) {
  const v = field8 >>> 0;
  return (v === 2 || v === 0) ? 1 : 0;
}

export function playerHud856f50FieldOff() {
  return PLAYERHUD_856F50_FIELD_OFF;
}

export function playerHud856f50Va() {
  return PLAYERHUD_856F50_VA;
}

export function playerHud856f50RetVa() {
  return PLAYERHUD_856F50_RET_VA;
}

export function playerHud856f50NextVa() {
  return PLAYERHUD_856F50_NEXT_VA;
}

/* ABI v35: pure time-pack leaf FUN_0085af30 (VA 0x0085af30..0x0085afaf,
 * ret).  ecx = out struct ptr, edx = value (u32), eax = out.  0 E8,
 * 0 indirect, 13 stores.  PE 0x0085af30:
 *   mov edi,edx; mov eax,0xd1b71759; mul edi; mov esi,edx; shr esi,0xd
 *     -> q10000 = floor(value/10000)   (0xd1b71759 = ceil(2^45/10000))
 *   imul eax,esi,0xffffd8f0; add edi,eax
 *     -> r10000 = value - q10000*10000 (value % 10000)
 *   mov eax,0x51eb851f; mul edi; shr edx,5
 *     -> q100 = floor(r10000/100)      (0x51eb851f = ceil(2^37/100))
 *   imul eax,edx,0x64; sub edi,eax      -> rem100 = r10000 % 100
 *   Store set: byte +0 = 2 (0 then or 2); dwords +8/+c/+10/+14/+18/
 *   +28/+2c/+30 = 0; +1c = rem100; +20 = q100 - 1; +24 = q10000 - 1900.
 *   +4 is NOT stored (keeps the caller seed).  Call-site footprint 0x38.
 *   Next VA 0x0085afb0 is frame-effect-owned (already landed). */
export const PLAYERHUD_85AF30_VA = 0x0085af30;
export const PLAYERHUD_85AF30_RET_VA = 0x0085afaf;
export const PLAYERHUD_85AF30_NEXT_VA = 0x0085afb0; /* frame-effect landed */
export const PLAYERHUD_85AF30_OBJECT_SIZE = 0x38;
export const PLAYERHUD_85AF30_PACK_DWORD_COUNT = 13;
export const PLAYERHUD_85AF30_FLAG_BYTE = 2;
export const PLAYERHUD_85AF30_REM100_OFF = 0x1c;
export const PLAYERHUD_85AF30_Q100_MINUS1_OFF = 0x20;
export const PLAYERHUD_85AF30_Q10000_MINUS1900_OFF = 0x24;
export const PLAYERHUD_85AF30_DIV10000_MAGIC = 0xd1b71759;
export const PLAYERHUD_85AF30_DIV10000_SHIFT = 45;
export const PLAYERHUD_85AF30_DIV100_MAGIC = 0x51eb851f;
export const PLAYERHUD_85AF30_DIV100_SHIFT = 37;
export const PLAYERHUD_85AF30_YEAR_BASE = 0x76c;

/* ABI v36: pure ordinal-suffix leaf FUN_00858870 (VA 0x00858870..
 * 0x008588e5, ret 4).  stdcall, 1 int32 arg; eax = .rdata suffix
 * string VA.  0 E8, 0 stores, 0 indirect.  PE 0x00858870:
 *   imul 0x51eb851f; sar edx,5; + (edx>>31)     -> q100 = value/100
 *     (SIGNED magic, truncation toward zero — C `%` semantics)
 *   r100 = value - q100*100; r100 in {11,12,13} -> TH
 *   imul 0x66666667; sar edx,2; + (edx>>31)     -> q10 = value/10
 *   r10 = value - q10*10; 1 -> ST, 2 -> ND, 3 -> RD, else TH
 * Suffix strings (4-byte): 0xb6e4cc "st", 0xb6e4c0 "nd",
 * 0xb6e4c4 "rd", 0xb6e4c8 "th".  Full-dword compares, no byte gate.
 * SIGNED: negatives always TH (-11 != 11).  Callers 0x858f20 /
 * 0x85902e (inside the 0x8588f0 SEH giant) sprintf rank "%d%s". */
export const PLAYERHUD_858870_VA = 0x00858870;
export const PLAYERHUD_858870_RET_VA = 0x008588e5;
export const PLAYERHUD_858870_NEXT_VA = 0x008588f0; /* SEH giant host */
export const PLAYERHUD_858870_ST_VA = 0x00b6e4cc;
export const PLAYERHUD_858870_ND_VA = 0x00b6e4c0;
export const PLAYERHUD_858870_RD_VA = 0x00b6e4c4;
export const PLAYERHUD_858870_TH_VA = 0x00b6e4c8;
export const PLAYERHUD_858870_DIV100_MAGIC = 0x51eb851f;
export const PLAYERHUD_858870_DIV100_SHIFT = 5;
export const PLAYERHUD_858870_DIV10_MAGIC = 0x66666667;
export const PLAYERHUD_858870_DIV10_SHIFT = 2;
export const PLAYERHUD_858870_CALLER1_VA = 0x00858f20;
export const PLAYERHUD_858870_CALLER2_VA = 0x0085902e;

/** r100 = value - trunc(value/100)*100 (signed int32 result). */
export function playerHud858870Rem100(value) {
  const v = value | 0;
  const q100 = Math.trunc(v / 100) | 0;
  return (v - Math.imul(q100, 100)) | 0;
}

/** r10 = value - trunc(value/10)*10 (signed int32 result). */
export function playerHud858870Rem10(value) {
  const v = value | 0;
  const q10 = Math.trunc(v / 10) | 0;
  return (v - Math.imul(q10, 10)) | 0;
}

/** Ordinal-suffix string VA (VA 0x00858870). */
export function playerHud858870OrdinalSuffixVa(value) {
  const r100 = playerHud858870Rem100(value);
  if (r100 === 11 || r100 === 12 || r100 === 13) {
    return PLAYERHUD_858870_TH_VA;
  }
  const r10 = playerHud858870Rem10(value);
  if (r10 === 1) {
    return PLAYERHUD_858870_ST_VA;
  }
  if (r10 === 2) {
    return PLAYERHUD_858870_ND_VA;
  }
  if (r10 === 3) {
    return PLAYERHUD_858870_RD_VA;
  }
  return PLAYERHUD_858870_TH_VA;
}

export function playerHud858870Va() {
  return PLAYERHUD_858870_VA;
}

export function playerHud858870RetVa() {
  return PLAYERHUD_858870_RET_VA;
}

export function playerHud858870NextVa() {
  return PLAYERHUD_858870_NEXT_VA;
}

/* ABI v37: pure leaderboard type->entry getter FUN_00857400 (VA
 * 0x00857400..0x0085743c, ret 0).  thiscall ecx = Leaderboard object,
 * eax = entry pointer.  0 E8 in the 0..3 arms, 0 stores, 1 indirect
 * dispatch.  PE 0x00857400:
 *   mov eax,[ecx+8]                 ; kind, FULL-DWORD load
 *   cmp eax,3; ja 0x85742b          ; UNSIGNED gate — NO byte mask
 *   jmp [eax*4+0x857440]            ; jump table 0x857440:
 *     0 -> 0x85740f [ecx+0x238]  1 -> 0x857416 [ecx+0x23c]
 *     2 -> 0x85741d [ecx+0x240]  3 -> 0x857424 [ecx+0x244]
 *   default 0x85742b: push 0xb6e4f0 ("Invalid leaderboard type \n");
 *     push 8; call 0xa112c0 (host log); add esp,8; xor eax,eax; ret
 * Kind > 3 (u32) is the ONLY host edge: eax = 0 + log.  9 callers
 * 0x857a54/0x857a70/0x857a98/0x857ab4/0x857ff3/0x858018/0x8586ce/
 * 0x858778/0x858816 all `test eax,eax; je` (0 feeds the null path).
 * Next VA 0x00857450 (game-update v56 rank display, LANDED). */
export const PLAYERHUD_857400_VA = 0x00857400;
export const PLAYERHUD_857400_RET_VA = 0x0085743c;
export const PLAYERHUD_857400_NEXT_VA = 0x00857450; /* game-update v56 */
export const PLAYERHUD_857400_KIND_MAX = 3;
export const PLAYERHUD_857400_ENTRY_COUNT = 4;
export const PLAYERHUD_857400_SLOT_BASE = 0x238;
export const PLAYERHUD_857400_SLOT_STRIDE = 4;
export const PLAYERHUD_857400_JUMP_TABLE_VA = 0x00857440;
export const PLAYERHUD_857400_JUMP_TABLE_TARGETS = Object.freeze([
  0x0085740f, 0x00857416, 0x0085741d, 0x00857424,
]);
export const PLAYERHUD_857400_LOG_FMT_VA = 0x00b6e4f0;
export const PLAYERHUD_857400_LOG_LEVEL = 8;
export const PLAYERHUD_857400_CALLER1_VA = 0x00857a54;
export const PLAYERHUD_857400_CALLER2_VA = 0x00857a70;
export const PLAYERHUD_857400_CALLER3_VA = 0x00857a98;
export const PLAYERHUD_857400_CALLER4_VA = 0x00857ab4;
export const PLAYERHUD_857400_CALLER5_VA = 0x00857ff3;
export const PLAYERHUD_857400_CALLER6_VA = 0x00858018;
export const PLAYERHUD_857400_CALLER7_VA = 0x008586ce;
export const PLAYERHUD_857400_CALLER8_VA = 0x00858778;
export const PLAYERHUD_857400_CALLER9_VA = 0x00858816;

/** Byte offset of the entry slot: [this+0x238+4*kind], 32-bit wrap. */
export function playerHud857400SlotByteOffset(kind) {
  return ((PLAYERHUD_857400_SLOT_BASE >>> 0)
    + Math.imul(kind >>> 0, PLAYERHUD_857400_SLOT_STRIDE)) >>> 0;
}

/** Selected entry ptr (VA 0x00857400).  UNSIGNED full-dword gate:
 *  kind > 3 -> 0 (host log edge, callers' null path).  No & 0xff —
 *  kind=0x101 is NOT slot 1 (byte-gate mutant M81). */
export function playerHud857400Entry(kind, slot0, slot1, slot2, slot3) {
  const k = kind >>> 0;
  if (k > PLAYERHUD_857400_KIND_MAX) {
    return 0;
  }
  return [slot0 >>> 0, slot1 >>> 0, slot2 >>> 0, slot3 >>> 0][k] >>> 0;
}

/** 1 iff the default arm (kind > 3 UNSIGNED) takes the host log. */
export function playerHud857400NeedsLog(kind) {
  return (kind >>> 0) > PLAYERHUD_857400_KIND_MAX ? 1 : 0;
}

/**
 * Packed plan: entry ptr + host-log edge.  Logger body stays host.
 * @returns {{ entryVa: number, needsLog: number, logLevel: number,
 *   logFmtVa: number, hostVaLog: number }}
 */
export function playerHud857400Plan(kind, slot0, slot1, slot2, slot3) {
  const needsLog = playerHud857400NeedsLog(kind);
  return {
    entryVa: playerHud857400Entry(kind, slot0, slot1, slot2, slot3) >>> 0,
    needsLog,
    logLevel: needsLog ? PLAYERHUD_857400_LOG_LEVEL : 0,
    logFmtVa: needsLog ? PLAYERHUD_857400_LOG_FMT_VA : 0,
    hostVaLog: PLAYERHUD_HOST_VA_LOG >>> 0,
  };
}

export function playerHud857400Va() {
  return PLAYERHUD_857400_VA;
}

export function playerHud857400RetVa() {
  return PLAYERHUD_857400_RET_VA;
}

export function playerHud857400NextVa() {
  return PLAYERHUD_857400_NEXT_VA;
}

/* ABI v38: pure float getter FUN_0085e360 (VA 0x0085e360..0x0085e366,
 * ret 0) — first caller-bearing PURE body of the 0x85e000+ band
 * census (0x85e000..0x89e610 E8-target walk: the ONLY E8-free AND
 * indirect-free AND caller-bearing body in the band).  thiscall
 * ecx = object, st0 = *(float*)(this+0x41c).  PE 0x0085e360:
 *   fld dword ptr [ecx + 0x41c]     ; bit-preserving f32 load
 *   ret
 * 0 E8, 0 stores, 0 indirect.  The law is a raw reinterpret: the
 * f32 view of the field's 4 bytes — no arithmetic, no NaN
 * canonicalization (x87 fld never touches the value).  Twin setters
 * (0 direct callers, host): 0x85e340 movss [ecx+0x41c],xmm0 (ret 4);
 * 0x85e330 movss [ecx+0x420],xmm0 (ret 4).  6 direct callers
 * 0x668193/0x66f608/0x78639e/0x79d9eb/0x79dbf2/0x79df21 all
 * `mov ecx,<this>; call; fstp` — st0 consumed (0x78639e passes the
 * float to host 0xa10350 via fstp [esp]).  Next VA 0x0085e370
 * (mov eax,[ecx+0x269d8]; sub eax,[ecx+0x269d4]; sar eax,3; ret —
 * pointer-delta getter, 0 direct callers). */
export const PLAYERHUD_85E360_VA = 0x0085e360;
export const PLAYERHUD_85E360_RET_VA = 0x0085e366;
export const PLAYERHUD_85E360_NEXT_VA = 0x0085e370;
export const PLAYERHUD_85E360_FIELD_OFF = 0x41c;
export const PLAYERHUD_85E360_CALLER1_VA = 0x00668193;
export const PLAYERHUD_85E360_CALLER2_VA = 0x0066f608;
export const PLAYERHUD_85E360_CALLER3_VA = 0x0078639e;
export const PLAYERHUD_85E360_CALLER4_VA = 0x0079d9eb;
export const PLAYERHUD_85E360_CALLER5_VA = 0x0079dbf2;
export const PLAYERHUD_85E360_CALLER6_VA = 0x0079df21;

/** Law (VA 0x0085e360): f32 view of the dword at [this+0x41c] —
 *  bit-preserving reinterpret (PE x87 `fld`, no canonicalization).
 *  Deterministic per bits: -0.0 / denormals / inf / NaN payloads
 *  all round-trip exactly. */
export function playerHud85e360Float(fieldBits) {
  return f32FromBits(u32(fieldBits));
}

export function playerHud85e360FieldOff() {
  return PLAYERHUD_85E360_FIELD_OFF;
}

export function playerHud85e360Va() {
  return PLAYERHUD_85E360_VA;
}

export function playerHud85e360RetVa() {
  return PLAYERHUD_85E360_RET_VA;
}

export function playerHud85e360NextVa() {
  return PLAYERHUD_85E360_NEXT_VA;
}

/** mulhi32(a,b) — the PE `mul` high dword. */
function mulhi32(a, b) {
  const prod = BigInt(u32(a)) * BigInt(u32(b));
  return Number((prod >> 32n) & 0xffffffffn);
}

/** q10000 = floor(value/10000) via the PE magic (mulhi >> 45). */
export function playerHud85af30Div10000(value) {
  return (mulhi32(value, PLAYERHUD_85AF30_DIV10000_MAGIC) >>> 13) >>> 0;
}

/** rem100 = value % 100 via the full PE magic chain (u32 result). */
export function playerHud85af30Rem100(value) {
  const q10000 = playerHud85af30Div10000(value);
  const r10000 = (u32(value) - Math.imul(q10000, 10000)) >>> 0;
  const q100 =
    (mulhi32(r10000, PLAYERHUD_85AF30_DIV100_MAGIC) >>> 5) >>> 0;
  return (r10000 - Math.imul(q100, 100)) >>> 0;
}

/** +0x20 field: Int32(q100 - 1); q100 = floor((value%10000)/100). */
export function playerHud85af30Q100Minus1(value) {
  const q10000 = playerHud85af30Div10000(value);
  const r10000 = (u32(value) - Math.imul(q10000, 10000)) >>> 0;
  const q100 =
    (mulhi32(r10000, PLAYERHUD_85AF30_DIV100_MAGIC) >>> 5) >>> 0;
  return (q100 - 1) | 0;
}

/** +0x24 field: Int32(floor(value/10000) - 1900). */
export function playerHud85af30Q10000Minus1900(value) {
  const q10000 = playerHud85af30Div10000(value);
  return (q10000 - PLAYERHUD_85AF30_YEAR_BASE) | 0;
}

/**
 * Pure pack oracle (VA 0x0085af30).  Returns a PACK_DWORD_COUNT dword
 * copy of seed with the PE store set applied.  Dword +1 (+0x04) keeps
 * the seed; byte +0 is a byte store (low byte = 2, high bytes kept).
 * @param {ArrayLike<number>|undefined} seed
 * @param {number} value
 */
export function playerHud85af30Pack(seed, value) {
  const n = PLAYERHUD_85AF30_PACK_DWORD_COUNT;
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = seed && seed[i] !== undefined ? u32(seed[i]) : 0;
  }
  out[0] = ((out[0] & 0xffffff00) | PLAYERHUD_85AF30_FLAG_BYTE) >>> 0;
  for (let off = 0x8; off <= 0x18; off += 4) {
    out[off / 4] = 0;
  }
  for (let off = 0x28; off <= 0x30; off += 4) {
    out[off / 4] = 0;
  }
  out[PLAYERHUD_85AF30_REM100_OFF / 4] = playerHud85af30Rem100(value);
  out[PLAYERHUD_85AF30_Q100_MINUS1_OFF / 4] =
    u32(playerHud85af30Q100Minus1(value));
  out[PLAYERHUD_85AF30_Q10000_MINUS1900_OFF / 4] =
    u32(playerHud85af30Q10000Minus1900(value));
  return out;
}

export function playerHud85af30Va() {
  return PLAYERHUD_85AF30_VA;
}

export function playerHud85af30RetVa() {
  return PLAYERHUD_85AF30_RET_VA;
}

export function playerHud85af30NextVa() {
  return PLAYERHUD_85AF30_NEXT_VA;
}

export function playerHud85af30ObjectSize() {
  return PLAYERHUD_85AF30_OBJECT_SIZE;
}



/**
 * Pure 0x0084dad0 prefix. Returns an 18-dword copy of seed
 * with the PE store set applied. +0xc/+0x10/+0x14 keep the
 * seed. +0x44 is a byte store (low byte only).
 * @param {ArrayLike<number>|undefined} seed
 */
export function playerHud84dad0Init(seed) {
  const n = (PLAYERHUD_84DAD0_OBJECT_SIZE / 4) | 0;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = seed && seed[i] !== undefined ? u32(seed[i]) : 0;
  }
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[(PLAYERHUD_84DAD0_SSO_SIZE_OFF / 4) | 0] = 0;
  out[(PLAYERHUD_84DAD0_SSO_CAP_OFF / 4) | 0] =
    PLAYERHUD_84DAD0_SSO_CAPACITY >>> 0;
  out[2] = (out[2] & 0xffffff00) >>> 0;
  for (let off = PLAYERHUD_84DAD0_TAIL_BEGIN;
    off <= PLAYERHUD_84DAD0_TAIL_LAST; off += 4) {
    out[(off / 4) | 0] = 0;
  }
  const fi = (PLAYERHUD_84DAD0_FLAG_BYTE_OFF / 4) | 0;
  out[fi] = (out[fi] & 0xffffff00) >>> 0;
  return out;
}

/** 1 iff PE stores a dword at this byte offset. */
export function playerHud84dad0WritesDword(byteOff) {
  const off = u32(byteOff);
  if ((off & 3) !== 0) return 0;
  if (off === 0 || off === 4 || off === PLAYERHUD_84DAD0_SSO_OFF ||
      off === PLAYERHUD_84DAD0_SSO_SIZE_OFF ||
      off === PLAYERHUD_84DAD0_SSO_CAP_OFF) {
    return 1;
  }
  if (off >= PLAYERHUD_84DAD0_TAIL_BEGIN &&
      off <= PLAYERHUD_84DAD0_TAIL_LAST) {
    return 1;
  }
  return 0;
}

/** 1 iff PE stores a byte at this offset. */
export function playerHud84dad0WritesByte(byteOff) {
  const off = u32(byteOff);
  if (off === PLAYERHUD_84DAD0_SSO_OFF ||
      off === PLAYERHUD_84DAD0_FLAG_BYTE_OFF) {
    return 1;
  }
  return 0;
}

export function playerHud84dad0HostVa() {
  return PLAYERHUD_84DAD0_HOST_VA;
}

export function playerHud84dad0HostThisOff() {
  return PLAYERHUD_84DAD0_HOST_THIS_OFF;
}

export function playerHud84dad0NextVa() {
  return PLAYERHUD_84DAD0_NEXT_VA;
}

/**
 * Tramp walk suppress: type in {1,3,4} && variant==0x139 && count!=0.
 * First matching type/variant with count==0 stops without suppress.
 */
export function playerHudTrampSuppressesCriticalBlink(entries) {
  const list = entries ?? [];
  for (const e of list) {
    const t = e.type | 0;
    if ((t === 1 || t === 3 || t === 4) && (e.variant | 0) === 0x139) {
      if ((e.count | 0) !== 0) {
        return true;
      }
      return false;
    }
  }
  return false;
}

/**
 * Critical heart blink int16 for PlayerHUD+0xa.
 * PE magic signed /9 on (9-rem)*255 when rem = frame%45 < 10.
 */
export function playerHudCriticalHeartBlink(input) {
  const heartsSum = input.heartsSum | 0;
  const flag1519 = (input.playerFlag1519 | 0) & 0xff;
  const trampSuppress = input.trampSuppress | 0;
  const frame = input.frameCounter264f8 | 0;
  if (heartsSum !== 1) {
    return 0;
  }
  if (flag1519 === 0 && trampSuppress !== 0) {
    return 0;
  }
  let rem = frame % PLAYERHUD_CRITICAL_BLINK_MOD;
  rem = i32(rem);
  if (rem >= PLAYERHUD_CRITICAL_BLINK_WINDOW) {
    return 0;
  }
  const scaled = (9 - rem) * 0xff;
  /* PE: imul 0x38e38e39 → edx:eax; sar edx,1; add edx, edx>>31 */
  const prod = BigInt(i32(scaled)) * BigInt(0x38e38e39);
  let edx = Number((prod >> 32n) & 0xffffffffn);
  if (edx >= 0x80000000) {
    edx -= 0x100000000;
  }
  edx = edx >> 1;
  const sign = (edx >>> 0) >>> 31;
  const word = (edx + sign) | 0;
  return (word << 16) >> 16;
}

/**
 * Active slot nonnegative countdown tick. Returns { slots, dirty }.
 */
export function playerHudActiveSlotCountdownTick(slots) {
  const out = [];
  let dirty = false;
  for (let i = 0; i < PLAYERHUD_ACTIVE_SLOT_COUNT; i += 1) {
    let v = (slots?.[i] ?? 0) | 0;
    if (v >= 0) {
      v = (v - 1) | 0;
      dirty = true;
    }
    out.push(v);
  }
  return { slots: out, dirty };
}

/**
 * Pure active-item book-overlay id (VA 0x008423e8..0x00842486).
 * Host supplies hasCollectible0x248 / hasCollectible0x26b from FUN_007706e0.
 * Nonzero slot_index always returns 0 (PE skips probes).
 *
 * @returns {number} 0 | 0x248 | 0x22 | 0x3b
 */
export function playerHudActiveBookOverlayId(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  if (slot !== 0) {
    return 0;
  }
  const activeId = (input?.activeItemId ?? 0) | 0;
  const playerType = (input?.playerType ?? 0) | 0;
  const has248 = !!input?.hasCollectible0x248;
  const has26b = !!input?.hasCollectible0x26b;

  let overrideId = 0;
  if (has248 && activeId !== PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES) {
    overrideId = PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES;
  }
  if (
    (playerType === PLAYERHUD_TYPE_JUDAS ||
      playerType === PLAYERHUD_TYPE_DARK_JUDAS) &&
    has26b &&
    activeId !== PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL
  ) {
    if (overrideId === PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES) {
      overrideId = PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL;
    } else {
      overrideId = PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL;
    }
  }
  return overrideId | 0;
}

/** PE edx = slot*7 (lea [ecx*8]; sub edx,ecx). */
export function playerHudActiveSlotDwordIndex(slotIndex) {
  return ((slotIndex | 0) * 7) | 0;
}

/** Byte offset of cached active id @ PlayerHUD+0x190 + slot*0x1c. */
export function playerHudCachedActiveIdByteOffset(slotIndex) {
  return (
    (PLAYERHUD_CACHED_ACTIVE_ID_BASE +
      (slotIndex | 0) * PLAYERHUD_ACTIVE_SLOT_STRIDE) |
    0
  );
}

/** Byte offset of cached book overlay @ PlayerHUD+0x194 + slot*0x1c. */
export function playerHudCachedBookOverlayByteOffset(slotIndex) {
  return (
    (PLAYERHUD_CACHED_BOOK_OVERLAY_BASE +
      (slotIndex | 0) * PLAYERHUD_ACTIVE_SLOT_STRIDE) |
    0
  );
}

/** Pure compare: active_id != cached → host active gfx (VA 0x0084248c). */
export function playerHudActiveIdCacheChanged(activeItemId, cachedActiveId) {
  return ((activeItemId | 0) !== (cachedActiveId | 0));
}

/** Pure compare: overlay != cached → host book LoadImage (VA 0x00842a3e). */
export function playerHudBookOverlayCacheChanged(
  bookOverlayId,
  cachedBookOverlayId,
) {
  return ((bookOverlayId | 0) !== (cachedBookOverlayId | 0));
}

/**
 * Pure book-overlay host path kind after cache miss.
 * @returns {number} CLEAR | VIRTUES | BELIAL | BOTH
 */
export function playerHudBookOverlayPathKind(bookOverlayId) {
  const id = bookOverlayId | 0;
  if (id === PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES) {
    return PLAYERHUD_BOOK_PATH_KIND_VIRTUES;
  }
  if (id === PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL) {
    return PLAYERHUD_BOOK_PATH_KIND_BELIAL;
  }
  if (id === PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL) {
    return PLAYERHUD_BOOK_PATH_KIND_BOTH;
  }
  return PLAYERHUD_BOOK_PATH_KIND_CLEAR;
}

/** PE .rdata path VA for LoadImage, or 0 when CLEAR. */
export function playerHudBookOverlayPathVa(bookOverlayId) {
  switch (playerHudBookOverlayPathKind(bookOverlayId)) {
    case PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return PLAYERHUD_PATH_BOOK_OF_VIRTUES >>> 0;
    case PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return PLAYERHUD_PATH_BOOK_OF_BELIAL >>> 0;
    case PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL >>> 0;
    default:
      return 0;
  }
}

/**
 * Pure plan for residual 0x00842486 (compares + offsets + path kind).
 * Host still owns LoadImage / ANM2 / smart-ptr swap.
 */
export function playerHudActiveGfxCachePlan(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const activeId = (input?.activeItemId ?? 0) | 0;
  const cachedActive = (input?.cachedActiveId ?? 0) | 0;
  const overlay = (input?.bookOverlayId ?? 0) | 0;
  const cachedOverlay = (input?.cachedBookOverlayId ?? 0) | 0;
  return {
    needsActiveGfx: playerHudActiveIdCacheChanged(activeId, cachedActive),
    needsBookGfx: playerHudBookOverlayCacheChanged(overlay, cachedOverlay),
    bookPathKind: playerHudBookOverlayPathKind(overlay),
    bookPathVa: playerHudBookOverlayPathVa(overlay),
    slotDwordIndex: playerHudActiveSlotDwordIndex(slot),
    cachedActiveByteOff: playerHudCachedActiveIdByteOffset(slot),
    cachedBookByteOff: playerHudCachedBookOverlayByteOffset(slot),
  };
}

/**
 * Pure cache apply into a dword view of PlayerHUD (stores only).
 * @param {Int32Array|number[]} hudI32
 * @returns {{ dirty: number, hud: number[] }} dirty bit0=active bit1=book
 */
export function playerHudActiveGfxCacheApplyAt(
  hudI32,
  slotIndex,
  activeItemId,
  bookOverlayId,
) {
  const slot = slotIndex | 0;
  const base = slot * 7;
  const activeIdx = (PLAYERHUD_CACHED_ACTIVE_ID_BASE / 4) + base;
  const bookIdx = (PLAYERHUD_CACHED_BOOK_OVERLAY_BASE / 4) + base;
  const out = Array.from(hudI32 ?? [], (v) => v | 0);
  /* Ensure room for slot 0..3 caches (max index: 0x194/4 + 3*7 = 0x65 + 21). */
  const need = bookIdx + 1;
  while (out.length < need) {
    out.push(0);
  }
  let dirty = 0;
  const active = activeItemId | 0;
  const book = bookOverlayId | 0;
  if ((out[activeIdx] | 0) !== active) {
    out[activeIdx] = active;
    dirty |= 1;
  }
  if ((out[bookIdx] | 0) !== book) {
    out[bookIdx] = book;
    dirty |= 2;
  }
  return { dirty, hud: out };
}

/** Byte offset of active image smart-ptr @ PlayerHUD+0x198 + slot*0x1c. */
export function playerHudActiveImageSpByteOffset(slotIndex) {
  return (
    (PLAYERHUD_ACTIVE_IMAGE_SP_BASE +
      (slotIndex | 0) * PLAYERHUD_ACTIVE_SLOT_STRIDE) |
    0
  );
}

/**
 * Pure ItemConfig resolve CF (VA 0x00842499..0x008424f5).
 * Host supplies gamePresent / table sizes; does not load table bodies.
 *
 * @returns {{ tableKind: number, lookupIndex: number, activeImageSpByteOff: number }}
 */
export function playerHudItemConfigResolve(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const id = (input?.activeItemId ?? 0) | 0;
  const gamePresent = (input?.gamePresent ?? 0) | 0;
  const gameNegSize = (input?.gameNegTableSize ?? 0) | 0;
  const managerSize = (input?.managerTableSize ?? 0) | 0;
  const spOff = playerHudActiveImageSpByteOffset(slot);

  if (gamePresent === 0) {
    if (id < 0) {
      return {
        tableKind: PLAYERHUD_ITEMCFG_KIND_NULL,
        lookupIndex: 0,
        activeImageSpByteOff: spOff,
      };
    }
    if (id >= managerSize) {
      return {
        tableKind: PLAYERHUD_ITEMCFG_KIND_NULL,
        lookupIndex: 0,
        activeImageSpByteOff: spOff,
      };
    }
    return {
      tableKind: PLAYERHUD_ITEMCFG_KIND_MANAGER,
      lookupIndex: id,
      activeImageSpByteOff: spOff,
    };
  }

  if (id < 0) {
    const idx = (~id) | 0;
    if (idx < 0 || idx >= gameNegSize) {
      return {
        tableKind: PLAYERHUD_ITEMCFG_KIND_NULL,
        lookupIndex: 0,
        activeImageSpByteOff: spOff,
      };
    }
    return {
      tableKind: PLAYERHUD_ITEMCFG_KIND_GAME_NEG,
      lookupIndex: idx,
      activeImageSpByteOff: spOff,
    };
  }

  if (id >= managerSize) {
    return {
      tableKind: PLAYERHUD_ITEMCFG_KIND_NULL,
      lookupIndex: 0,
      activeImageSpByteOff: spOff,
    };
  }
  return {
    tableKind: PLAYERHUD_ITEMCFG_KIND_MANAGER,
    lookupIndex: id,
    activeImageSpByteOff: spOff,
  };
}

/**
 * Pure active-item LoadImage path kind after ItemConfig non-null
 * (VA 0x0084251c..). Host supplies 0x23 gates and 0x280 collectible probe.
 * @returns {number} path kind enum
 */
export function playerHudActiveItemPathKind(input) {
  const id = (input?.activeItemId ?? 0) | 0;
  const slot = (input?.slotIndex ?? 0) | 0;

  if (id < 0x123) {
    if (id === 0x122) {
      return PLAYERHUD_ACTIVE_PATH_KIND_0x122;
    }
    if (id === 0x23) {
      const b202c = (input?.playerByte202c ?? 0) | 0;
      const b20a9 = (input?.playerByte20a9 ?? 0) | 0;
      const d1818 = (input?.playerDword1818 ?? 0) | 0;
      const charge = (input?.playerActiveCharge ?? 0) | 0;
      if (b202c !== 0 || b20a9 !== 0 || d1818 < 3 || charge !== 1) {
        return PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      return PLAYERHUD_ACTIVE_PATH_KIND_0x23;
    }
    return PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  }

  if (id < 0x1db) {
    if (id === 0x1da) {
      return PLAYERHUD_ACTIVE_PATH_KIND_0x1da;
    }
    switch (id) {
      case 0x146:
        return PLAYERHUD_ACTIVE_PATH_KIND_0x146;
      case 0x160:
        return PLAYERHUD_ACTIVE_PATH_KIND_0x160;
      case 0x1a6:
        return PLAYERHUD_ACTIVE_PATH_KIND_0x1a6;
      case 0x1b2:
        return PLAYERHUD_ACTIVE_PATH_KIND_0x1b2;
      default:
        return PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
    }
  }

  switch (id) {
    case 0x1df:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x1df;
    case 0x1e3:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x1e3;
    case 0x1e9:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x1e9;
    case 0x20b:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x20b;
    case 0x280: {
      const playerType = (input?.playerType ?? 0) | 0;
      const has26b = !!input?.hasCollectible0x26b;
      if (
        (playerType === PLAYERHUD_TYPE_JUDAS ||
          playerType === PLAYERHUD_TYPE_DARK_JUDAS) &&
        has26b
      ) {
        return PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL;
      }
      return PLAYERHUD_ACTIVE_PATH_KIND_0x280;
    }
    case 0x2ad:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x2ad;
    case 0x2c6:
      if (slot === 2) {
        return PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
      }
      return PLAYERHUD_ACTIVE_PATH_KIND_0x2c6;
    case 0x2c7:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x2c7;
    case 0x2d0:
      return PLAYERHUD_ACTIVE_PATH_KIND_0x2d0;
    default:
      return PLAYERHUD_ACTIVE_PATH_KIND_CONFIG;
  }
}

/** PE .rdata path VA for non-CONFIG path kind, or 0 for CONFIG. */
export function playerHudActiveItemPathVa(pathKind) {
  switch (pathKind | 0) {
    case PLAYERHUD_ACTIVE_PATH_KIND_0x23:
      return PLAYERHUD_PATH_ACTIVE_0x23 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x122:
      return PLAYERHUD_PATH_ACTIVE_0x122 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x146:
      return PLAYERHUD_PATH_ACTIVE_0x146 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x160:
      return PLAYERHUD_PATH_ACTIVE_0x160 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x1a6:
      return PLAYERHUD_PATH_ACTIVE_0x1a6 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x1b2:
      return PLAYERHUD_PATH_ACTIVE_0x1b2 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x1da:
      return PLAYERHUD_PATH_ACTIVE_0x1da >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x1df:
      return PLAYERHUD_PATH_ACTIVE_0x1df >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x1e3:
      return PLAYERHUD_PATH_ACTIVE_0x1e3 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x1e9:
      return PLAYERHUD_PATH_ACTIVE_0x1e9 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x20b:
      return PLAYERHUD_PATH_ACTIVE_0x20b >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x280:
      return PLAYERHUD_PATH_ACTIVE_0x280 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL:
      return PLAYERHUD_PATH_ACTIVE_0x280_BELIAL >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x2ad:
      return PLAYERHUD_PATH_ACTIVE_0x2ad >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x2c6:
      return PLAYERHUD_PATH_ACTIVE_0x2c6 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x2c7:
      return PLAYERHUD_PATH_ACTIVE_0x2c7 >>> 0;
    case PLAYERHUD_ACTIVE_PATH_KIND_0x2d0:
      return PLAYERHUD_PATH_ACTIVE_0x2d0 >>> 0;
    default:
      return 0;
  }
}

/**
 * Pure active-item path plan (kind + va + usesConfigGfx).
 * LoadImage remains host.
 */
export function playerHudActiveItemPathPlan(input) {
  const pathKind = playerHudActiveItemPathKind(input);
  return {
    pathKind,
    pathVa: playerHudActiveItemPathVa(pathKind),
    usesConfigGfx: pathKind === PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
  };
}

/** PE push 0 before call 0x40c7f0 @ 0x00842502. */
export function playerHudActiveSpClearArg() {
  return 0;
}

export function playerHudSpClearAllocSize() {
  return PLAYERHUD_SP_CLEAR_ALLOC_SIZE;
}

export function playerHudSpClearAllocOk(allocPtr) {
  return (allocPtr >>> 0) !== 0;
}

export function playerHudSpClearOldObjectPresent(oldObjPtr) {
  return (oldObjPtr >>> 0) !== 0;
}

export function playerHudSpClearCallbackNeeded(virtualAl, globalFn) {
  if ((virtualAl & 0xff) === 0) {
    return false;
  }
  return (globalFn >>> 0) !== 0;
}

/**
 * Post-ctor pure stores on new SP object: vtable + arg@+0x14.
 * @param {Uint8Array|number[]} obj
 * @param {number} arg
 */
export function playerHudSpClearObjectFinishApply(obj, arg) {
  if (!obj || obj.length < PLAYERHUD_SP_CLEAR_ARG_OFF + 4) {
    return obj;
  }
  const out = obj instanceof Uint8Array ? new Uint8Array(obj) : Uint8Array.from(obj);
  const v = PLAYERHUD_SP_CLEAR_VTABLE >>> 0;
  const a = arg >>> 0;
  out[0] = v & 0xff;
  out[1] = (v >>> 8) & 0xff;
  out[2] = (v >>> 16) & 0xff;
  out[3] = (v >>> 24) & 0xff;
  const o = PLAYERHUD_SP_CLEAR_ARG_OFF;
  out[o] = a & 0xff;
  out[o + 1] = (a >>> 8) & 0xff;
  out[o + 2] = (a >>> 16) & 0xff;
  out[o + 3] = (a >>> 24) & 0xff;
  return out;
}

/**
 * Pure pair tail of 40c7f0: *this = arg; this+4 = newObj.
 * @param {Uint8Array|number[]} pair 8-byte pair
 */
export function playerHudSpClearPairApplyBase(pair, arg, newObj) {
  if (!pair || pair.length < 8) {
    return pair;
  }
  const out = pair instanceof Uint8Array ? new Uint8Array(pair) : Uint8Array.from(pair);
  const a = arg >>> 0;
  const n = newObj >>> 0;
  out[0] = a & 0xff;
  out[1] = (a >>> 8) & 0xff;
  out[2] = (a >>> 16) & 0xff;
  out[3] = (a >>> 24) & 0xff;
  out[4] = n & 0xff;
  out[5] = (n >>> 8) & 0xff;
  out[6] = (n >>> 16) & 0xff;
  out[7] = (n >>> 24) & 0xff;
  return out;
}

export function playerHudSpClearVtable() {
  return PLAYERHUD_SP_CLEAR_VTABLE >>> 0;
}

/** After SP clear: entry == 0 → skip LoadImage (VA 0x00842514). */
export function playerHudSkipsActiveLoadImage(itemEntryPtr) {
  return (itemEntryPtr >>> 0) === 0;
}

export function playerHudItemConfigGfxStringByteOffset() {
  return PLAYERHUD_ITEMCFG_GFX_STRING_OFF;
}

export function playerHudItemConfigGfxCapacityByteOffset() {
  return PLAYERHUD_ITEMCFG_GFX_CAPACITY_OFF;
}

/** PE SSO: capacity < 0x10 → data at item+0x38. */
export function playerHudConfigGfxStringIsSso(capacity) {
  return (capacity >>> 0) < PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD;
}

export function playerHudHostVaSpMaterialize() {
  return PLAYERHUD_HOST_VA_SP_MATERIALIZE >>> 0;
}

/**
 * Pure 8-byte SP pair swap (two dwords each).
 * @returns {{ a: number[], b: number[] }}
 */
export function playerHudSpPairSwap(aPair, bPair) {
  const a = [((aPair?.[0] ?? 0) | 0) >>> 0, ((aPair?.[1] ?? 0) | 0) >>> 0];
  const b = [((bPair?.[0] ?? 0) | 0) >>> 0, ((bPair?.[1] ?? 0) | 0) >>> 0];
  return {
    a: [b[0], b[1]],
    b: [a[0], a[1]],
  };
}

/**
 * Combined pure LoadImage prep at residual 0x0084250f.
 * Host supplies itemEntryPtr after table load and configCapacity when CONFIG.
 *
 * @param {{
 *   slotIndex?: number,
 *   itemEntryPtr?: number,
 *   pathInput?: object,
 *   configCapacity?: number,
 * }} input
 */
export function playerHudActiveLoadImagePrep(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const entry = (input?.itemEntryPtr ?? 0) >>> 0;
  const cap = (input?.configCapacity ?? 0) >>> 0;
  const skips = playerHudSkipsActiveLoadImage(entry);
  const base = {
    activeImageSpByteOff: playerHudActiveImageSpByteOffset(slot),
    spClearArg: playerHudActiveSpClearArg(),
    skipsLoadImage: skips,
    pathKind: PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
    pathVa: 0,
    usesConfigGfx: false,
    configStringSso: false,
    hostVaSpClear: PLAYERHUD_HOST_VA_SMART_PTR_CLEAR >>> 0,
    hostVaLoadImage: PLAYERHUD_HOST_VA_LOAD_IMAGE >>> 0,
    hostVaSpMaterialize: PLAYERHUD_HOST_VA_SP_MATERIALIZE >>> 0,
  };
  if (skips) {
    return base;
  }
  const path = playerHudActiveItemPathPlan(input?.pathInput ?? {});
  return {
    ...base,
    pathKind: path.pathKind,
    pathVa: path.pathVa >>> 0,
    usesConfigGfx: !!path.usesConfigGfx,
    configStringSso: path.usesConfigGfx
      ? playerHudConfigGfxStringIsSso(cap)
      : false,
  };
}

/** PE lea path buffer at ebp-0x418 (VA 0x0084297d). */
export function playerHudLoadImagePathBufferEbpOff() {
  return PLAYERHUD_LOAD_IMAGE_PATH_BUF_EBP_OFF | 0;
}

/** PE lea LoadImage result SP at ebp-0x14a8 (VA 0x00842984). */
export function playerHudLoadImageResultEbpOff() {
  return PLAYERHUD_LOAD_IMAGE_RESULT_EBP_OFF | 0;
}

/** PE lea materialize this at ebp-0x14a0 (VA 0x00842991). */
export function playerHudMaterializeThisEbpOff() {
  return PLAYERHUD_MATERIALIZE_THIS_EBP_OFF | 0;
}

/** PE saved active SP address slot ebp-0x1428 (VA 0x008429a3). */
export function playerHudActiveSpSavedEbpOff() {
  return PLAYERHUD_ACTIVE_SP_SAVED_EBP_OFF | 0;
}

/** PE dirty flag byte at ebp-0x1419 (VA 0x00842a31). */
export function playerHudDirtyFlagEbpOff() {
  return PLAYERHUD_DIRTY_FLAG_EBP_OFF | 0;
}

/** PE LoadImage result SP obj at ebp-0x14a4 (result+4). */
export function playerHudLoadImageResultObjEbpOff() {
  return PLAYERHUD_LOAD_IMAGE_RESULT_OBJ_EBP_OFF | 0;
}

/** PE materialize SP obj at ebp-0x149c (materialize this+4). */
export function playerHudMaterializeObjEbpOff() {
  return PLAYERHUD_MATERIALIZE_OBJ_EBP_OFF | 0;
}

/** mov [ebp-4], 0 before FUN_0040c550. */
export function playerHudMaterializeSehTryLevel() {
  return PLAYERHUD_MATERIALIZE_SEH_TRY_LEVEL | 0;
}

/** Dirty byte value after active gfx path (incl. entry-null skip). */
export function playerHudActiveDirtyAfterGfx() {
  return PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX | 0;
}

/**
 * Pure dirty store at VA 0x00842a31: *dirtyFlag = 1.
 * @param {Uint8Array|number[]|null} dirtyFlag
 */
export function playerHudActiveDirtySet(dirtyFlag) {
  if (!dirtyFlag || dirtyFlag.length < 1) {
    return dirtyFlag;
  }
  const out =
    dirtyFlag instanceof Uint8Array
      ? new Uint8Array(dirtyFlag)
      : Uint8Array.from(dirtyFlag);
  out[0] = PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX & 0xff;
  return out;
}

/**
 * Pure Manager::LoadImage call plan at residual 0x0084298b.
 * Host still owns path-buffer bytes, LoadImage body, materialize body,
 * and temp SP virtual teardown.
 *
 * @param {{
 *   slotIndex?: number,
 *   itemEntryPtr?: number,
 *   pathInput?: object,
 *   configCapacity?: number,
 * }} input
 */
export function playerHudActiveLoadImageCall(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const entry = (input?.itemEntryPtr ?? 0) >>> 0;
  const cap = (input?.configCapacity ?? 0) >>> 0;
  const runs = !playerHudSkipsActiveLoadImage(entry);
  const base = {
    runsLoadImage: runs,
    pathKind: PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
    pathVa: 0,
    usesConfigGfx: false,
    configStringSso: false,
    pathBufferEbpOff: playerHudLoadImagePathBufferEbpOff(),
    resultSpEbpOff: playerHudLoadImageResultEbpOff(),
    materializeThisEbpOff: playerHudMaterializeThisEbpOff(),
    activeSpSavedEbpOff: playerHudActiveSpSavedEbpOff(),
    dirtyFlagEbpOff: playerHudDirtyFlagEbpOff(),
    materializeSehTryLevel: playerHudMaterializeSehTryLevel(),
    dirtyAfter: playerHudActiveDirtyAfterGfx(),
    activeImageSpByteOff: playerHudActiveImageSpByteOffset(slot),
    hostVaLoadImage: PLAYERHUD_HOST_VA_LOAD_IMAGE >>> 0,
    hostVaSpMaterialize: PLAYERHUD_HOST_VA_SP_MATERIALIZE >>> 0,
  };
  if (!runs) {
    return base;
  }
  const path = playerHudActiveItemPathPlan(input?.pathInput ?? {});
  return {
    ...base,
    pathKind: path.pathKind,
    pathVa: path.pathVa >>> 0,
    usesConfigGfx: !!path.usesConfigGfx,
    configStringSso: path.usesConfigGfx
      ? playerHudConfigGfxStringIsSso(cap)
      : false,
  };
}

/** Byte offset of book image smart-ptr @ PlayerHUD+0x1a0 + slot*0x1c. */
export function playerHudBookImageSpByteOffset(slotIndex) {
  return (
    (PLAYERHUD_BOOK_IMAGE_SP_BASE +
      (slotIndex | 0) * PLAYERHUD_ACTIVE_SLOT_STRIDE) |
    0
  );
}

/** Kind-dependent PE lea result SP for book LoadImage (0 when CLEAR). */
export function playerHudBookLoadImageResultEbpOff(bookPathKind) {
  switch (bookPathKind | 0) {
    case PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_VIRTUES | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BELIAL | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BOTH | 0;
    default:
      return 0;
  }
}

export function playerHudBookMaterializeThisEbpOff(bookPathKind) {
  switch (bookPathKind | 0) {
    case PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_VIRTUES | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BELIAL | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BOTH | 0;
    default:
      return 0;
  }
}

export function playerHudBookLoadImageResultObjEbpOff(bookPathKind) {
  switch (bookPathKind | 0) {
    case PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_VIRTUES | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BELIAL | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BOTH | 0;
    default:
      return 0;
  }
}

export function playerHudBookMaterializeObjEbpOff(bookPathKind) {
  switch (bookPathKind | 0) {
    case PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_VIRTUES | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BELIAL | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BOTH | 0;
    default:
      return 0;
  }
}

/** mov [ebp-4], 3/6/9 before materialize; 0 when CLEAR. */
export function playerHudBookMaterializeSehTryLevel(bookPathKind) {
  switch (bookPathKind | 0) {
    case PLAYERHUD_BOOK_PATH_KIND_VIRTUES:
      return PLAYERHUD_BOOK_MATERIALIZE_SEH_VIRTUES | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BELIAL:
      return PLAYERHUD_BOOK_MATERIALIZE_SEH_BELIAL | 0;
    case PLAYERHUD_BOOK_PATH_KIND_BOTH:
      return PLAYERHUD_BOOK_MATERIALIZE_SEH_BOTH | 0;
    default:
      return 0;
  }
}

/** PE push 0 before call 0x40c7f0 on CLEAR (VA 0x00842c7c). */
export function playerHudBookSpClearArg() {
  return PLAYERHUD_BOOK_SP_CLEAR_ARG >>> 0;
}

/** Dirty byte after book cache-miss path (VA 0x00842c8b). */
export function playerHudBookDirtyAfterGfx() {
  return PLAYERHUD_BOOK_DIRTY_AFTER_GFX | 0;
}

/**
 * Pure book-overlay LoadImage / SP-clear call plan at residual 0x00842a5b.
 * Host still owns LoadImage body, materialize body, FUN_0040c7f0 CLEAR body,
 * and temp SP virtual teardown. Path is a PE .rdata imm (not stack buffer).
 *
 * @param {{ slotIndex?: number, bookOverlayId?: number }} input
 */
export function playerHudBookLoadImageCall(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const overlay = (input?.bookOverlayId ?? 0) | 0;
  const kind = playerHudBookOverlayPathKind(overlay);
  const isClear = kind === PLAYERHUD_BOOK_PATH_KIND_CLEAR;
  return {
    bookPathKind: kind,
    pathVa: playerHudBookOverlayPathVa(overlay) >>> 0,
    runsLoadImage: !isClear,
    runsSpClear: isClear,
    bookImageSpByteOff: playerHudBookImageSpByteOffset(slot),
    resultSpEbpOff: playerHudBookLoadImageResultEbpOff(kind),
    materializeThisEbpOff: playerHudBookMaterializeThisEbpOff(kind),
    resultObjEbpOff: playerHudBookLoadImageResultObjEbpOff(kind),
    materializeObjEbpOff: playerHudBookMaterializeObjEbpOff(kind),
    materializeSehTryLevel: playerHudBookMaterializeSehTryLevel(kind),
    dirtyFlagEbpOff: playerHudDirtyFlagEbpOff(),
    dirtyAfter: playerHudBookDirtyAfterGfx(),
    hostVaLoadImage: PLAYERHUD_HOST_VA_LOAD_IMAGE >>> 0,
    hostVaSpMaterialize: PLAYERHUD_HOST_VA_SP_MATERIALIZE >>> 0,
    hostVaSpClear: PLAYERHUD_HOST_VA_SMART_PTR_CLEAR >>> 0,
    spClearArg: playerHudBookSpClearArg(),
  };
}

/* --- ABI v9: residual 0x00842c92 trinket-pair pure CF --- */

export function playerHudTrinketSlotCount() {
  return PLAYERHUD_TRINKET_SLOT_COUNT | 0;
}

export function playerHudCachedTrinketIdByteOffset(slotIndex) {
  return (
    (PLAYERHUD_CACHED_TRINKET_ID_BASE +
      (slotIndex | 0) * PLAYERHUD_TRINKET_SLOT_STRIDE) |
    0
  );
}

export function playerHudCachedTrinketSecondaryByteOffset(slotIndex) {
  return (
    (PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE +
      (slotIndex | 0) * PLAYERHUD_TRINKET_SLOT_STRIDE) |
    0
  );
}

export function playerHudTrinketImageSpByteOffset(slotIndex) {
  return (
    (PLAYERHUD_TRINKET_IMAGE_SP_BASE +
      (slotIndex | 0) * PLAYERHUD_TRINKET_SLOT_STRIDE) |
    0
  );
}

export function playerHudPlayerTrinketIdByteOffset(slotIndex) {
  return (
    (PLAYERHUD_PLAYER_TRINKET_ID_BASE +
      (slotIndex | 0) * PLAYERHUD_PLAYER_TRINKET_ID_STRIDE) |
    0
  );
}

export function playerHudPlayerTrinketSecondaryByteOffset() {
  return PLAYERHUD_PLAYER_TRINKET_SECONDARY | 0;
}

/** PE and esi, 0x7fff at VA 0x00842cd2. */
export function playerHudTrinketMaskId(rawTrinketId) {
  return (rawTrinketId >>> 0) & PLAYERHUD_TRINKET_ID_MASK;
}

/** Secondary from *cached* id == 0xa6 (VA 0x00842cd8), not the new mask. */
export function playerHudTrinketSecondaryId(
  cachedTrinketId,
  playerSecondary1fb8,
) {
  if ((cachedTrinketId | 0) === PLAYERHUD_TRINKET_TICK_CACHED_ID) {
    return playerSecondary1fb8 | 0;
  }
  return 0;
}

export function playerHudTrinketNeedsRoomSeedProbe(rawTrinketId) {
  return playerHudTrinketMaskId(rawTrinketId) === PLAYERHUD_TRINKET_SPECIAL_0x4b
    ? 1
    : 0;
}

/**
 * Liberty Cap remask (VA 0x00842d0d..0x00842d40). PE magic /0xbd remainder.
 * When maskedId != 0x4b or roomSeed == 0, returns maskedId unchanged.
 */
export function playerHudTrinketApply0x4bRemask(maskedId, roomSeed) {
  const id = maskedId | 0;
  if (id !== PLAYERHUD_TRINKET_SPECIAL_0x4b) {
    return id;
  }
  const seed = roomSeed >>> 0;
  if (seed === 0) {
    return PLAYERHUD_TRINKET_SPECIAL_0x4b | 0;
  }
  let x = seed;
  x = ((x >>> 2) ^ x) >>> 0;
  x = (((x << 7) >>> 0) ^ x) >>> 0;
  x = ((x >>> 0x19) ^ x) >>> 0;
  /* PE mul high of 0x5ac056b1 for unsigned / 0xbd. */
  const prod = BigInt(PLAYERHUD_TRINKET_0x4b_MAGIC) * BigInt(x);
  const hi = Number((prod >> 32n) & 0xffffffffn) >>> 0;
  let q = (x - hi) >>> 0;
  q = q >>> 1;
  q = (q + hi) >>> 0;
  q = q >>> 7;
  const rem = (x - Math.imul(q, PLAYERHUD_TRINKET_0x4b_MOD)) >>> 0;
  return (rem + 1) | 0;
}

export function playerHudTrinketCacheChanged(
  maskedId,
  secondaryId,
  cachedId,
  cachedSecondary,
) {
  return (
    (maskedId | 0) !== (cachedId | 0) ||
    (secondaryId | 0) !== (cachedSecondary | 0)
  );
}

/**
 * Pure cache store into a dword view of PlayerHUD (id @ +0x200, sec @ +0x204).
 * @returns {{ hud: number[] }}
 */
export function playerHudTrinketCacheApplyAt(
  hudDwords,
  slotIndex,
  maskedId,
  secondaryId,
) {
  const out = hudDwords ? Uint32Array.from(hudDwords) : new Uint32Array(0x100);
  const idOff = playerHudCachedTrinketIdByteOffset(slotIndex) >>> 2;
  const secOff = playerHudCachedTrinketSecondaryByteOffset(slotIndex) >>> 2;
  if (idOff < out.length) {
    out[idOff] = maskedId | 0;
  }
  if (secOff < out.length) {
    out[secOff] = secondaryId | 0;
  }
  return { hud: Array.from(out) };
}

export function playerHudTrinketLoadImageResultEbpOff() {
  return PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF | 0;
}

export function playerHudTrinketLoadImageResultObjEbpOff() {
  return PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF | 0;
}

export function playerHudTrinketSehTryLevel() {
  return PLAYERHUD_TRINKET_SEH_TRY_LEVEL | 0;
}

export function playerHudTrinketDirtyAfterGfx() {
  return PLAYERHUD_TRINKET_DIRTY_AFTER_GFX | 0;
}

/**
 * Packed pure trinket-pair gfx plan at residual 0x00842cd0.
 * Host still owns GetRoomByIdx, table loads, LoadImage, SP::swap, bounds,
 * and FUN_009a8970. roomSeed is host RoomDescriptor+0x5c (0 when skipped).
 *
 * @param {object} input
 */
export function playerHudTrinketGfxPlan(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const raw = (input?.rawTrinketId ?? 0) >>> 0;
  const cachedId = (input?.cachedId ?? 0) | 0;
  const cachedSecondary = (input?.cachedSecondary ?? 0) | 0;
  const playerSecondary = (input?.playerSecondary1fb8 ?? 0) | 0;
  const roomSeed = (input?.roomSeed ?? 0) >>> 0;
  const gamePresent = (input?.gamePresent ?? 1) | 0;
  const gameNegSize = (input?.gameNegTableSize ?? 0) | 0;
  const managerColSize = (input?.managerCollectibleTableSize ?? 0) | 0;
  const managerTrinketSize = (input?.managerTrinketTableSize ?? 0) | 0;

  const maskedRaw = playerHudTrinketMaskId(raw);
  const needsProbe = playerHudTrinketNeedsRoomSeedProbe(raw);
  const secondary = playerHudTrinketSecondaryId(cachedId, playerSecondary);
  const masked = playerHudTrinketApply0x4bRemask(maskedRaw, roomSeed);
  const needs = playerHudTrinketCacheChanged(
    masked,
    secondary,
    cachedId,
    cachedSecondary,
  )
    ? 1
    : 0;

  let tableKind = PLAYERHUD_ITEMCFG_KIND_NULL;
  let lookupIndex = 0;

  if (needs) {
    if (secondary === 0) {
      const tid = playerHudTrinketMaskId(masked >>> 0) | 0;
      if (tid < managerTrinketSize) {
        tableKind = PLAYERHUD_ITEMCFG_KIND_MANAGER_TRINKET;
        lookupIndex = tid;
      }
    } else if (gamePresent === 0) {
      if (secondary >= 0 && secondary < managerColSize) {
        tableKind = PLAYERHUD_ITEMCFG_KIND_MANAGER;
        lookupIndex = secondary;
      }
    } else if (secondary < 0) {
      const idx = (~(secondary >>> 0)) | 0;
      if (idx >= 0 && idx < gameNegSize) {
        tableKind = PLAYERHUD_ITEMCFG_KIND_GAME_NEG;
        lookupIndex = idx;
      }
    } else if (secondary < managerColSize) {
      tableKind = PLAYERHUD_ITEMCFG_KIND_MANAGER;
      lookupIndex = secondary;
    }
  }

  return {
    needsTrinketGfx: needs,
    needsRoomSeedProbe: needsProbe,
    maskedId: masked | 0,
    secondaryId: secondary | 0,
    tableKind,
    lookupIndex: lookupIndex | 0,
    cachedIdByteOff: playerHudCachedTrinketIdByteOffset(slot),
    cachedSecondaryByteOff: playerHudCachedTrinketSecondaryByteOffset(slot),
    trinketImageSpByteOff: playerHudTrinketImageSpByteOffset(slot),
    resultSpEbpOff: playerHudTrinketLoadImageResultEbpOff(),
    resultObjEbpOff: playerHudTrinketLoadImageResultObjEbpOff(),
    sehTryLevel: playerHudTrinketSehTryLevel(),
    dirtyFlagEbpOff: playerHudDirtyFlagEbpOff(),
    dirtyAfter: needs ? playerHudTrinketDirtyAfterGfx() : 0,
    hostVaGetRoomByIdx: PLAYERHUD_HOST_VA_GET_ROOM_BY_IDX >>> 0,
    hostVaLoadImage: PLAYERHUD_HOST_VA_LOAD_IMAGE >>> 0,
    hostVaSpSwap: PLAYERHUD_HOST_VA_SP_SWAP >>> 0,
    hostVaDirtyNotify: PLAYERHUD_HOST_VA_DIRTY_NOTIFY >>> 0,
  };
}

/* --- ABI v10: residual 0x00842f8a pocket/charge pure CF --- */

export function playerHudPocketSlotCount() {
  return PLAYERHUD_POCKET_SLOT_COUNT | 0;
}

export function playerHudPocketSlotStride() {
  return PLAYERHUD_POCKET_SLOT_STRIDE | 0;
}

/** PE type/id clamp: signed <=0 → 0; else min(slot, 3). */
export function playerHudPocketClampSlot(slotIndex) {
  const s = slotIndex | 0;
  if (s <= 0) {
    return 0;
  }
  if (s < 3) {
    return s;
  }
  return 3;
}

export function playerHudCachedPocketTypeByteOffset(slotIndex) {
  return (
    (PLAYERHUD_CACHED_POCKET_TYPE_BASE +
      (slotIndex | 0) * PLAYERHUD_POCKET_SLOT_STRIDE) |
    0
  );
}

export function playerHudCachedPocketIdByteOffset(slotIndex) {
  return (
    (PLAYERHUD_CACHED_POCKET_ID_BASE +
      (slotIndex | 0) * PLAYERHUD_POCKET_SLOT_STRIDE) |
    0
  );
}

export function playerHudPocketAnm2ByteOffset(slotIndex) {
  return (
    (PLAYERHUD_POCKET_ANM2_BASE +
      (slotIndex | 0) * PLAYERHUD_POCKET_SLOT_STRIDE) |
    0
  );
}

export function playerHudPlayerPocketIdByteOffset(slotIndex) {
  const idx = playerHudPocketClampSlot(slotIndex);
  return (
    (PLAYERHUD_PLAYER_POCKET_ID_BASE + idx * PLAYERHUD_PLAYER_POCKET_STRIDE) |
    0
  );
}

export function playerHudPlayerPocketTypeByteOffset(slotIndex) {
  const idx = playerHudPocketClampSlot(slotIndex);
  return (
    (PLAYERHUD_PLAYER_POCKET_TYPE_BASE + idx * PLAYERHUD_PLAYER_POCKET_STRIDE) |
    0
  );
}

/**
 * Pure resolved pocket id (VA 0x00842feb..0x0084306f).
 * Host supplies pill_entry_ptr and pill_effect_id for type==PILL.
 */
export function playerHudPocketResolvedId(
  pocketType,
  pocketId,
  pillTableSize,
  pillEntryPtr,
  pillEffectId,
) {
  const type = pocketType | 0;
  const id = pocketId | 0;
  if (type === PLAYERHUD_POCKET_TYPE_PILL) {
    if (id < 0) {
      return 0;
    }
    if (id >= (pillTableSize | 0)) {
      return 0;
    }
    if ((pillEntryPtr >>> 0) === 0) {
      return 0;
    }
    return pillEffectId | 0;
  }
  if (type === PLAYERHUD_POCKET_TYPE_CARD) {
    return id;
  }
  return 0;
}

export function playerHudPocketCacheChanged(
  pocketType,
  resolvedId,
  cachedType,
  cachedId,
) {
  return (
    (pocketType | 0) !== (cachedType | 0) ||
    (resolvedId | 0) !== (cachedId | 0)
  );
}

/**
 * Pure cache store into a dword view of PlayerHUD.
 * @returns {{ hud: number[] }}
 */
export function playerHudPocketCacheApplyAt(
  hudDwords,
  slotIndex,
  pocketType,
  resolvedId,
) {
  const out = hudDwords ? Uint32Array.from(hudDwords) : new Uint32Array(0x200);
  const typeOff = playerHudCachedPocketTypeByteOffset(slotIndex) >>> 2;
  const idOff = playerHudCachedPocketIdByteOffset(slotIndex) >>> 2;
  if (typeOff < out.length) {
    out[typeOff] = pocketType | 0;
  }
  if (idOff < out.length) {
    out[idOff] = resolvedId | 0;
  }
  return { hud: Array.from(out) };
}

export function playerHudPocketPathKind(pocketType, resolvedId) {
  const type = pocketType | 0;
  const id = resolvedId | 0;
  if (type === PLAYERHUD_POCKET_TYPE_PILL && id !== 0) {
    return PLAYERHUD_POCKET_PATH_KIND_PILL;
  }
  if (type === PLAYERHUD_POCKET_TYPE_CARD && id !== 0) {
    return PLAYERHUD_POCKET_PATH_KIND_CARD;
  }
  return PLAYERHUD_POCKET_PATH_KIND_RESET;
}

/**
 * Packed pure pocket/charge gfx plan at residual 0x00842f8a.
 * Host still owns pill table body, EntityConfig::GetEntity, ANM2::Load,
 * ANM2::Reset.
 *
 * @param {object} input
 */
export function playerHudPocketGfxPlan(input) {
  const slot = (input?.slotIndex ?? 0) | 0;
  const pocketType = (input?.pocketType ?? 0) | 0;
  const pocketId = (input?.pocketId ?? 0) | 0;
  const cachedType = (input?.cachedType ?? 0) | 0;
  const cachedId = (input?.cachedId ?? 0) | 0;
  const pillTableSize = (input?.pillTableSize ?? 0) | 0;
  const pillEntryPtr = (input?.pillEntryPtr ?? 0) >>> 0;
  const pillEffectId = (input?.pillEffectId ?? 0) | 0;

  const playerSlot = playerHudPocketClampSlot(slot);
  const resolved = playerHudPocketResolvedId(
    pocketType,
    pocketId,
    pillTableSize,
    pillEntryPtr,
    pillEffectId,
  );
  const needs = playerHudPocketCacheChanged(
    pocketType,
    resolved,
    cachedType,
    cachedId,
  )
    ? 1
    : 0;
  const path = needs
    ? playerHudPocketPathKind(pocketType, resolved)
    : PLAYERHUD_POCKET_PATH_KIND_RESET;

  let getEntityType = 0;
  let getEntityVariant = 0;
  let getEntitySubtype = 0;
  if (needs) {
    if (path === PLAYERHUD_POCKET_PATH_KIND_CARD) {
      getEntityType = PLAYERHUD_GET_ENTITY_TYPE;
      getEntityVariant = PLAYERHUD_GET_ENTITY_VARIANT_CARD;
      getEntitySubtype = resolved;
    } else if (path === PLAYERHUD_POCKET_PATH_KIND_PILL) {
      getEntityType = PLAYERHUD_GET_ENTITY_TYPE;
      getEntityVariant = PLAYERHUD_GET_ENTITY_VARIANT_PILL;
      getEntitySubtype = resolved;
    }
  }

  return {
    needsPocketGfx: needs,
    pocketType,
    resolvedId: resolved | 0,
    playerSlotIndex: playerSlot,
    cachedTypeByteOff: playerHudCachedPocketTypeByteOffset(slot),
    cachedIdByteOff: playerHudCachedPocketIdByteOffset(slot),
    anm2ByteOff: playerHudPocketAnm2ByteOffset(slot),
    hostPathKind: path,
    getEntityType: getEntityType | 0,
    getEntityVariant: getEntityVariant | 0,
    getEntitySubtype: getEntitySubtype | 0,
    managerEntityConfigOff: PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF | 0,
    entityAnmPathOff: PLAYERHUD_ENTITY_ANM_PATH_OFF | 0,
    anm2LoadGraphics: PLAYERHUD_ANM2_LOAD_GRAPHICS | 0,
    needsPillTableProbe: pocketType === PLAYERHUD_POCKET_TYPE_PILL ? 1 : 0,
    pillTableLookupIndex:
      pocketType === PLAYERHUD_POCKET_TYPE_PILL ? pocketId : 0,
    hostVaGetEntity: PLAYERHUD_HOST_VA_GET_ENTITY >>> 0,
    hostVaAnm2Load: PLAYERHUD_HOST_VA_ANM2_LOAD >>> 0,
    hostVaAnm2Reset: PLAYERHUD_HOST_VA_ANM2_RESET >>> 0,
  };
}

/** Tail float at +0x6b8 given host predicate result. */
export function playerHudTailFloatStep(value, predicateTrue) {
  const step = f32FromBits(PLAYERHUD_F32_STEP_0_25_BITS);
  const zero = f32FromBits(PLAYERHUD_F32_ZERO_BITS);
  const one = f32FromBits(PLAYERHUD_F32_ONE_BITS);
  let f = Math.fround(value);
  if (predicateTrue) {
    /* SSE minss dest,1.0: a NaN first operand (or both-0.0s) returns the
       SECOND operand — a NaN result clamps to 1.0 (v15 exact semantics;
       mutation-pinned). */
    f = Math.fround(f + step);
    return Number.isNaN(f) || f > one ? one : f;
  }
  /* maxss dest,0.0: NaN -> 0.0; -0.0 vs +0.0 -> +0.0 (second). */
  f = Math.fround(f - step);
  return Number.isNaN(f) || f < zero ? zero : f;
}

/** Tail dirty-notify gate (PE 0x00843c11): byte [ebp-0x1419] != 0 with
 *  the shared dirty flag; widened parameter, low-byte mask (v12 rule). */
export function playerhudTailDirtyNotifyNeeded(dirtyByte) {
  return ((dirtyByte | 0) & 0xff) !== 0;
}

/** Dirty-notify call args (PE 0x00843c11..0x00843c1f): ECX = *(hud+0x4)
 *  (parent HUD*), arg = 1, target 0x009a6110. */
export function playerhudTailDirtyNotifyCallArgs() {
  return {
    dirtyFlagEbpOff: PLAYERHUD_DIRTY_FLAG_EBP_OFF,
    hudThisDwordOff: PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF,
    notifyArg: PLAYERHUD_TAIL_DIRTY_ARG,
    hostVaNotify: PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY,
  };
}

/** Tail char positive countdown at +0xc/+0xd/+0xe. */
export function playerHudTailCharCountdown(state) {
  const step = (c) => {
    const v = (c << 24) >> 24;
    return v > 0 ? (((v - 1) << 24) >> 24) : v;
  };
  return {
    c0: step(state?.c0 ?? 0),
    c1: step(state?.c1 ?? 0),
    c2: step(state?.c2 ?? 0),
  };
}

function setPath(buf, idx, path) {
  const o = idx * PLAYERHUD_HEART_STRIDE + 8;
  path = u32(path);
  buf[o] = path & 0xff;
  buf[o + 1] = (path >>> 8) & 0xff;
  buf[o + 2] = (path >>> 16) & 0xff;
  buf[o + 3] = (path >>> 24) & 0xff;
}

function setU32(buf, idx, off, path) {
  const o = idx * PLAYERHUD_HEART_STRIDE + off;
  path = u32(path);
  buf[o] = path & 0xff;
  buf[o + 1] = (path >>> 8) & 0xff;
  buf[o + 2] = (path >>> 16) & 0xff;
  buf[o + 3] = (path >>> 24) & 0xff;
}

/**
 * Pure PlayerHUD::UpdateHearts body (VA 0x00841e20).
 * Host supplies hasCollectible0x26b from FUN_007706e0(0x26b,0).
 *
 * @param {number} maxSlots
 * @param {object} input field pack (see IsaacPlayerHudUpdateHeartsInput)
 * @returns {{ applied: boolean, hearts: Uint8Array }}
 */
export function playerHudUpdateHeartsPure(maxSlots, input) {
  const n = maxSlots | 0;
  const hearts = new Uint8Array(Math.max(0, n) * PLAYERHUD_HEART_STRIDE);
  const ht = playerHudGetHealthType(input?.playerType ?? 0);
  if (ht === 2) {
    return { applied: false, hearts };
  }
  if (n <= 0) {
    return { applied: false, hearts };
  }

  const P = PLAYERHUD_HEART_PATHS;
  let containers = playerHudSignedCeilHalf(input.maxHearts ?? 0);
  let rotten = i32(input.rottenHearts ?? 0);
  const broken = i32(input.brokenHearts ?? 0);
  let redRem = i32(i32(input.redHearts ?? 0) - rotten * 2);
  let filled = 0;
  let i = 0;
  const playerType = i32(input.playerType ?? 0);
  const special =
    playerType === 0x16 && i32(input.field1ef4 ?? 0) > 0 ? 1 : 0;
  const animBase = input.hasCollectible0x26b ? 6 : 4;
  const hudC = i8(input.hudCharC ?? 0);
  const hudD = i8(input.hudCharD ?? 0);

  const at = (idx, off) => idx * PLAYERHUD_HEART_STRIDE + off;

  if (containers > 0) {
    while (i < containers) {
      if (i >= n) {
        break;
      }
      hearts[at(i, 0)] = 1;
      if (special) {
        const thr = animBase >> 1;
        hearts[at(i, 3)] = i >= thr ? 1 : 0;
      } else {
        hearts[at(i, 3)] = 0;
      }

      if (redRem > 0) {
        filled += 1;
        hearts[at(i, 2)] = 1;
        if (ht === 3) {
          setPath(
            hearts,
            i,
            redRem <= 1 ? P.coinHeartHalf : P.coinHeartFull,
          );
          /* setle; dec; and 4 */
          let anim = hudC <= 0 ? 1 : 0;
          anim = (anim - 1) & 0xff;
          anim &= 4;
          hearts[at(i, 4)] = anim;
        } else {
          setPath(
            hearts,
            i,
            redRem <= 1 ? P.redHeartHalf : P.redHeartFull,
          );
          hearts[at(i, 4)] = hudC > 0 ? 1 : 0;
        }
        redRem = satNonneg(redRem - 2);
      } else if (rotten > 0) {
        filled += 1;
        hearts[at(i, 2)] = 1;
        setPath(hearts, i, P.rottenHeartFull);
        let anim = hudC <= 0 ? 1 : 0;
        anim = (anim - 1) & 0xff;
        anim &= 5;
        hearts[at(i, 4)] = anim;
        rotten -= 1;
      } else {
        setPath(hearts, i, ht === 3 ? P.coinEmpty : P.emptyHeart);
        hearts[at(i, 2)] = 0;
        hearts[at(i, 3)] = 0;
        hearts[at(i, 4)] = 0;
      }
      i += 1;
    }
  }

  let last = satNonneg(i - 1);
  let soulRem = i32(input.soulHearts ?? 0);
  const soulHearts = i32(input.soulHearts ?? 0);
  const boneCount = i32(input.boneCount ?? 0);
  const soulTotal = i32(playerHudSignedCeilHalf(soulHearts) + boneCount);
  let soulIdx = 1;
  let boneBit = 1;
  let j = 0;
  const boneMask = u32(input.boneMask ?? 0);
  const blackMask = u32(input.blackHeartsMask ?? 0);

  if (soulTotal > 0) {
    while (j < soulTotal) {
      if (i >= n) {
        break;
      }
      filled += 1;
      hearts[at(i, 3)] = special;
      hearts[at(i, 0)] = 1;
      hearts[at(i, 2)] = 1;

      if (boneCount > 0 && (boneMask & boneBit) !== 0) {
        if (redRem > 0) {
          setPath(
            hearts,
            i,
            redRem <= 1 ? P.boneHeartHalf : P.boneHeartFull,
          );
          hearts[at(i, 4)] = hudC > 0 ? 1 : 0;
        } else if (rotten > 0) {
          rotten -= 1;
          setPath(hearts, i, P.rottenBoneHeartFull);
          let anim = hudC <= 0 ? 1 : 0;
          anim = (anim - 1) & 0xff;
          anim &= 5;
          hearts[at(i, 4)] = anim;
        } else {
          setPath(hearts, i, P.boneHeartEmpty);
          hearts[at(i, 4)] = 0;
        }
        if (redRem > 0) {
          last = i;
        }
        redRem = satNonneg(redRem - 2);
      } else {
        let drewBlack = false;
        if (soulIdx <= soulHearts && soulIdx >= 1) {
          if (signedMod2(soulIdx) === 1) {
            const half = signedDiv2Tz(soulIdx - 1);
            const bit = u32(1 << (half & 31));
            if ((blackMask & bit) !== 0) {
              setPath(
                hearts,
                i,
                soulRem <= 1 ? P.blackHeartHalf : P.blackHeartFull,
              );
              let anim = hudD <= 0 ? 1 : 0;
              anim = (anim - 1) & 0xff;
              anim &= 3;
              hearts[at(i, 4)] = anim;
              drewBlack = true;
            }
          }
        }
        if (!drewBlack) {
          setPath(
            hearts,
            i,
            soulRem <= 1 ? P.blueHeartHalf : P.blueHeartFull,
          );
          let anim = hudD <= 0 ? 1 : 0;
          anim = (anim - 1) & 0xff;
          anim &= 2;
          hearts[at(i, 4)] = anim;
        }
        soulRem = satNonneg(soulRem - 2);
        soulIdx = i32(soulIdx + 2);
      }

      i += 1;
      boneBit = rol32(boneBit);
      j += 1;
    }
  }

  if (i32(input.eternalHearts ?? 0) > 0) {
    setU32(hearts, last, 0xc, P.whiteHeartOverlay);
    hearts[at(last, 1)] = 1;
    hearts[at(last, 4)] = 0;
  }

  let k = 0;
  while (k < broken) {
    if (i >= n) {
      break;
    }
    hearts[at(i, 0)] = 1;
    hearts[at(i, 2)] = 0;
    setPath(hearts, i, ht === 3 ? P.brokenCoinHeart : P.brokenHeart);
    hearts[at(i, 4)] = 0;
    i += 1;
    k += 1;
  }

  while (i < n) {
    hearts[at(i, 0)] = 0;
    i += 1;
  }

  /* PE: edi = filled - player+0x194c; clear +2 that many present/full hearts. */
  let excess = i32(filled - i32(input.heartIconCount ?? 0));
  if (n > 0 && excess > 0) {
    for (let idx = 0; idx < n; idx += 1) {
      if (excess <= 0) {
        break;
      }
      if (hearts[at(idx, 0)] !== 0 && hearts[at(idx, 2)] !== 0) {
        hearts[at(idx, 2)] = 0;
        excess -= 1;
      }
    }
  }

  return { applied: true, hearts };
}

/** Read path dword at heart slot +8. */
export function playerHudHeartPathAt(hearts, index) {
  const o = (index | 0) * PLAYERHUD_HEART_STRIDE + 8;
  return (
    (hearts[o] |
      (hearts[o + 1] << 8) |
      (hearts[o + 2] << 16) |
      (hearts[o + 3] << 24)) >>>
    0
  );
}

/* ---- P5: residual after the pocket loop (VA 0x00843116), v11 ----
 *
 * Restated from the instruction stream, not from the C++ translation.
 */

export const PLAYERHUD_P5_OFF_ENABLE_6AC = 0x6ac;
export const PLAYERHUD_P5_OFF_LIST_HEAD_6A0 = 0x6a0;
export const PLAYERHUD_P5_OFF_LIST_END_6A4 = 0x6a4;
export const PLAYERHUD_P5_OFF_CHAR_TYPE_13C0 = 0x13c0;
export const PLAYERHUD_P5_CHAR_TYPE_MATCH = 0x15;
export const PLAYERHUD_P5_WALK_STRIDE = 0xc;
export const PLAYERHUD_P5_OFF_SLOT_BASE_1E00 = 0x1e00;
export const PLAYERHUD_P5_SLOT_STRIDE = 4;
export const PLAYERHUD_P5_NODE_ALLOC_SIZE = 0x1c;
export const PLAYERHUD_P5_NODE_FLAG_OFF = 0xc;
export const PLAYERHUD_P5_NODE_FLAG_WORD = 0x0101;
export const PLAYERHUD_P5_ELEM_STRIDE = 0xc;

export const PLAYERHUD_P5_HOST_VA_ALLOC = 0x00a0f4c0;
export const PLAYERHUD_P5_HOST_VA_WALK_BODY = 0x0083c320;
export const PLAYERHUD_P5_HOST_VA_LIST_CLEAR = 0x00709380;
export const PLAYERHUD_P5_HOST_VA_ELEM_INIT = 0x0040c4a0;
export const PLAYERHUD_P5_HOST_VA_ELEM_COPY = 0x0040c550;
export const PLAYERHUD_P5_HOST_VA_PUSH_GROW = 0x0084bc30;
export const PLAYERHUD_P5_SKIP_VA_DISABLED = 0x00843af1;
export const PLAYERHUD_P5_SKIP_VA_WRONG_CHAR = 0x00843667;

/**
 * The block is guarded by an enable byte and by the player's character id
 * matching one specific value; either check failing jumps clear of the whole
 * allocation-and-list sequence.
 */
export function playerhudP5BlockNeeded(enable6ac, charType13c0) {
  if (((enable6ac | 0) & 0xff) === 0) return false;
  return (charType13c0 | 0) === PLAYERHUD_P5_CHAR_TYPE_MATCH;
}

/** Where a closed gate lands. The enable byte is evaluated first. */
export function playerhudP5SkipVa(enable6ac, charType13c0) {
  if (((enable6ac | 0) & 0xff) === 0) return PLAYERHUD_P5_SKIP_VA_DISABLED;
  if ((charType13c0 | 0) !== PLAYERHUD_P5_CHAR_TYPE_MATCH) {
    return PLAYERHUD_P5_SKIP_VA_WRONG_CHAR;
  }
  return 0;
}

/** Sentinel word written once at node+0xc as a single 16-bit store. */
export function playerhudP5NodeFlagWord() {
  return PLAYERHUD_P5_NODE_FLAG_WORD;
}

/** Each of the node's three link slots is seeded with the node's own address. */
export function playerhudP5NodeSelfPtr(nodeBase, slotOffset) {
  const off = slotOffset | 0;
  if (off !== 0 && off !== 4 && off !== 8) return 0;
  return nodeBase >>> 0;
}

/**
 * The cursor advances by a fixed stride and stops on equality, so a span
 * that is not a whole number of strides never terminates.
 */
export function playerhudP5WalkTerminates(cursor, end) {
  const span = ((end >>> 0) - (cursor >>> 0)) | 0;
  if (span < 0) return false;
  return span % PLAYERHUD_P5_WALK_STRIDE === 0;
}

/** Trip count for a terminating walk, else -1. */
export function playerhudP5WalkSteps(cursor, end) {
  if (!playerhudP5WalkTerminates(cursor, end)) return -1;
  const span = ((end >>> 0) - (cursor >>> 0)) | 0;
  return (span / PLAYERHUD_P5_WALK_STRIDE) | 0;
}

/** The slot value is branched on its sign bit; only negatives are inserted. */
export function playerhudP5SlotNeedsInsert(slotValue) {
  return (slotValue | 0) < 0;
}

/** Scaled index addressing off the slot table base. */
export function playerhudP5SlotByteOffset(index) {
  return (PLAYERHUD_P5_OFF_SLOT_BASE_1E00 +
    Math.imul(index | 0, PLAYERHUD_P5_SLOT_STRIDE)) | 0;
}

/** An append diverts to the growth helper exactly at capacity. */
export function playerhudP5PushNeedsGrow(listEnd, listCap) {
  return (listEnd >>> 0) === (listCap >>> 0);
}

/** Fast-path cursor bump, wrapping at 32 bits. */
export function playerhudP5PushAdvance(listEnd) {
  return (((listEnd >>> 0) + PLAYERHUD_P5_ELEM_STRIDE) >>> 0);
}

/* ---- P6: pocket-upgrade residual (VA 0x0084327d..0x008435ed), v13 ----
 *
 * The 16-slot pocket loop (head 0x008431e0) reads player[0x1e00 + i*4]
 * and branches on its sign: negative slots take the v11 P5E insert path;
 * non-negative slots take THIS upgrade path (0x0084327d). The upgrade
 * path resolves an ItemConfig entry, calls the host builder 0x4288a0,
 * and then chooses RESULT / NEG / CONFIG. All bodies stay host; this
 * oracle covers the surrounding pure control flow and the packed frame
 * plan. Machine restated from the instruction stream (not from the C++).
 */

export const PLAYERHUD_P6_SLOT_COUNT = 0x10;
export const PLAYERHUD_P6_SLOT_BASE = 0x1e00;
export const PLAYERHUD_P6_SLOT_STRIDE = 4;
export const PLAYERHUD_P6_ARRAY_PTR_OFF = 0x1dec;
export const PLAYERHUD_P6_ARRAY_STRIDE_DWORDS = 7;
export const PLAYERHUD_P6_ARRAY_ID_ELEM = 2;
export const PLAYERHUD_P6_ENTRY_TYPE_BLOCK = 3;
export const PLAYERHUD_P6_RESULT_BYTE_D_OFF = 0xd;
export const PLAYERHUD_P6_RESULT_WORD_4_OFF = 0x10;
export const PLAYERHUD_P6_RESULT_COPY_OFF = 0x14;
export const PLAYERHUD_P6_CONFIG_STRING_OFF = 0x38;
export const PLAYERHUD_P6_CONFIG_CAPACITY_OFF = 0x4c;
export const PLAYERHUD_P6_CONFIG_SSO_THRESHOLD = 0x10;

export const PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP = 0;
export const PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT = 1;
export const PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG = 2;
export const PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG = 3;

export const PLAYERHUD_POCKET_UPGRADE_KIND_SKIP = 0;
export const PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG = 1;
export const PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER = 2;

export const PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF = -0x1498;
export const PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF = -0x1490;
export const PLAYERHUD_P6_LIST_HEAD_EBP_OFF = -0x1450;
export const PLAYERHUD_P6_RESULT_VALUE_EBP_OFF = -0x145c;
export const PLAYERHUD_P6_RESULT_ELEM_EBP_OFF = -0x1458;
export const PLAYERHUD_P6_RESULT_VIRTUAL_EBP_OFF = -0x1454;
export const PLAYERHUD_P6_NEG_VALUE_EBP_OFF = -0x1468;
export const PLAYERHUD_P6_NEG_ELEM_EBP_OFF = -0x1464;
export const PLAYERHUD_P6_NEG_VIRTUAL_EBP_OFF = -0x1460;
export const PLAYERHUD_P6_CONFIG_VALUE_EBP_OFF = -0x1474;
export const PLAYERHUD_P6_CONFIG_ELEM_EBP_OFF = -0x1470;
export const PLAYERHUD_P6_CONFIG_VIRTUAL_EBP_OFF = -0x146c;
export const PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF = -0x1488;
export const PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF = -0x148c;
export const PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF = -0x1484;
export const PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF = -0x1448;
export const PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF = -0x1444;
export const PLAYERHUD_P6_SEH_RESULT_FIRST = 0x11;
export const PLAYERHUD_P6_SEH_NEG_FIRST = 0x14;
export const PLAYERHUD_P6_SEH_CONFIG_FIRST = 0x16;

export const PLAYERHUD_P6_HOST_VA_BUILD_NODE = 0x004288a0;
export const PLAYERHUD_P6_HOST_VA_NODE_REMOVE = 0x00415d20;
export const PLAYERHUD_P6_HOST_VA_FREE = 0x00aef15c;
export const PLAYERHUD_P6_GLOBAL_CALLBACK = 0x00c7163c;

export const PLAYERHUD_P7_GAME_GATE_OFF = 0x26584;
export const PLAYERHUD_P7_GAME_GATE_VALUE = 0x2b;
export const PLAYERHUD_P7_VEC_BEGIN_OFF = 0x1fa4;
export const PLAYERHUD_P7_VEC_END_OFF = 0x1fa8;
export const PLAYERHUD_P7_VEC_STRIDE = 4;
/* ---- ABI v14: tail residuals after the P6/P7 loops ----
 * Layout constants (PE 0x00843603..0x00843bb7). */
export const PLAYERHUD_POCKET_LIST_CLEAR_KIND_P6 = 0;
export const PLAYERHUD_POCKET_LIST_CLEAR_KIND_P7 = 1;
export const PLAYERHUD_P7_LIST_HEAD_EBP_OFF = -0x143c;
export const PLAYERHUD_LIST_CLEAR_CURSOR_EBP_OFF = -0x1428;
export const PLAYERHUD_LIST_CLEAR_NODE_SP_OFF = 0x14;
export const PLAYERHUD_LIST_CLEAR_SP_ARG = 0;
export const PLAYERHUD_LIST_CLEAR_SEH_LEVEL = 0xffffffff; /* -1 as signed */
export const PLAYERHUD_LIST_CLEAR_FREE_SIZE = 0x1c;
export const PLAYERHUD_WALK_CLEAR_NODE_SP_OFF = 4;
export const PLAYERHUD_WALK_CLEAR_CURSOR_SAVE_EBP_OFF = -0x1428;
export const PLAYERHUD_WALK_CLEAR_HUD_EBP_OFF = -0x1430;
export const PLAYERHUD_TAIL_ENABLE_BYTE_OFF = 0x6ac;
export const PLAYERHUD_TAIL_REBUILD_BYTE_OFF = 0x6ad;
export const PLAYERHUD_TAIL_ANM2_SP_OFF = 0x6b0;
export const PLAYERHUD_TAIL_COLLECTIBLE_ID_OFF = 0x1f4c;
export const PLAYERHUD_TAIL_GET_COLLECTIBLE_THIS_OFF = 0x2a404;
export const PLAYERHUD_TAIL_PROBE_MASK = 0x40;
export const PLAYERHUD_TAIL_PATH_FIXED = 0;
export const PLAYERHUD_TAIL_PATH_CONFIG = 1;
export const PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF = -0x1448;
export const PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF = -0x142c;
export const PLAYERHUD_TAIL_SEH_FIXED = 0x26;
export const PLAYERHUD_TAIL_SEH_CONFIG = 0x27;
export const PLAYERHUD_TAIL_TEMP_TEARDOWN_SEH = 0xffffffff;
export const PLAYERHUD_TAIL_PREDICATE_TYPE = 0xb;
export const PLAYERHUD_TAIL_PREDICATE_ARG1_OFF = 0x1618;
export const PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF = 0x4;
export const PLAYERHUD_TAIL_DIRTY_ARG = 1;
export const PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY = 0x009a6110;
export const PLAYERHUD_TAIL_HOST_VA_ADVANCE = 0x00414a80;
export const PLAYERHUD_TAIL_HOST_VA_TREE_TEARDOWN = 0x00415800;
export const PLAYERHUD_TAIL_HOST_VA_P7_LIST_CLEAR = 0x0083b830;
export const PLAYERHUD_TAIL_HOST_VA_WALK_CLEAR = 0x0084bba0;
export const PLAYERHUD_TAIL_HOST_VA_PROBE = 0x00748490;
export const PLAYERHUD_TAIL_HOST_VA_TEMP_TEARDOWN = 0x0040c440;
export const PLAYERHUD_TAIL_HOST_VA_PREDICATE = 0x00956110;
export const PLAYERHUD_TAIL_FIXED_PATH_VA = 0x00b63a18;


/** 16-slot loop bound (PE 0x008435fa cmp eax,0x10 ; jb). */
export function playerhudPocketUpgradeSlotCount() {
  return PLAYERHUD_P6_SLOT_COUNT;
}

/** Slot byte offset: 0x1e00 + i*4 (PE 0x008431e6), 32-bit wrap. */
export function playerhudPocketUpgradeSlotByteOffset(slotIndex) {
  return (
    (PLAYERHUD_P6_SLOT_BASE +
      Math.imul(slotIndex | 0, PLAYERHUD_P6_SLOT_STRIDE)) |
    0
  );
}

/** Slot sign test (PE 0x008431ed test eax,eax ; jns upgrade). */
export function playerhudPocketUpgradeSlotIsUpgrade(slotValue) {
  return (slotValue | 0) >= 0;
}

/** Collectible array pointer offset (PE 0x00843286 mov eax,[edx+0x1dec]). */
export function playerhudPocketUpgradeArrayPtrByteOffset() {
  return PLAYERHUD_P6_ARRAY_PTR_OFF;
}

/** PE lea/sub form: slot*7 + 2 (element dword index of the id). */
export function playerhudPocketUpgradeArrayElementDwordIndex(slotIndex) {
  return (
    (Math.imul(slotIndex | 0, PLAYERHUD_P6_ARRAY_STRIDE_DWORDS) +
      PLAYERHUD_P6_ARRAY_ID_ELEM) |
    0
  );
}

/** Byte offset of the id element inside the array: (slot*7+2)*4. */
export function playerhudPocketUpgradeArrayIdByteOffset(slotIndex) {
  return Math.imul(playerhudPocketUpgradeArrayElementDwordIndex(slotIndex), 4) | 0;
}

/** P6A resolve kind (PE 0x008432a2..0x008432fb). Signed bounds on both
 *  tables (jge/jl), ~id for the Game neg table (GAME_NEG is a double
 *  deref), raw id for Manager (single deref). */
export function playerhudPocketUpgradeResolveKind(
  gamePresent,
  id,
  gameNegTableSize,
  managerTableSize,
) {
  const s = id | 0;
  if (s >= 0) {
    return s < (managerTableSize | 0)
      ? PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER
      : PLAYERHUD_POCKET_UPGRADE_KIND_SKIP;
  }
  if ((gamePresent | 0) === 0) {
    return PLAYERHUD_POCKET_UPGRADE_KIND_SKIP;
  }
  const nid = ~s | 0;
  if (nid < 0 || nid >= (gameNegTableSize | 0)) {
    return PLAYERHUD_POCKET_UPGRADE_KIND_SKIP;
  }
  return PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG;
}

/** P6A lookup index: ~id (GAME_NEG) or id (MANAGER), 0 when skipped. */
export function playerhudPocketUpgradeResolveIndex(
  gamePresent,
  id,
  gameNegTableSize,
  managerTableSize,
) {
  const s = id | 0;
  if (s >= 0) {
    return s < (managerTableSize | 0) ? s : 0;
  }
  if ((gamePresent | 0) === 0) {
    return 0;
  }
  const nid = ~s | 0;
  if (nid < 0 || nid >= (gameNegTableSize | 0)) {
    return 0;
  }
  return nid;
}

/** Entry gate (PE 0x00843301..0x0084330c): non-null and *entry != 3. */
export function playerhudPocketUpgradeEntryUsable(entryPtr, entryType) {
  if ((entryPtr >>> 0) === 0) {
    return false;
  }
  return (entryType | 0) !== PLAYERHUD_P6_ENTRY_TYPE_BLOCK;
}

/** Post-0x4288a0 gate (PE 0x00843337..0x00843352): byte [result+0xd] == 0
 *  (LOW-BYTE test), result[4] <= id (SIGNED jl), result != list head. */
export function playerhudPocketUpgradeTakeResultValue(
  resultByteD,
  resultWord4,
  id,
  resultPtr,
  listHead,
) {
  if (((resultByteD | 0) & 0xff) !== 0) {
    return false;
  }
  if ((id | 0) < (resultWord4 | 0)) {
    return false;
  }
  if ((resultPtr >>> 0) === (listHead >>> 0)) {
    return false;
  }
  return true;
}

/** Branch select (PE 0x00843422..0x008434ae). */
export function playerhudPocketUpgradeBranchKind(takeResult, id) {
  if (takeResult) {
    return PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT;
  }
  return (id | 0) < 0
    ? PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG
    : PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG;
}

/** Scalar stored into the list node: result[4] / id / config re-read id. */
export function playerhudPocketUpgradeInsertValue(
  branchKind,
  id,
  resultWord4,
  configReinsertId,
) {
  switch (branchKind) {
    case PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:
      return resultWord4 | 0;
    case PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG:
      return id | 0;
    case PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG:
      return configReinsertId | 0;
    default:
      return 0;
  }
}

/** CONFIG path ptr (PE 0x008434ae..0x008434c7): SSO → entry+0x38 else the
 *  heap ptr at entry+0x38 (capacity gate is a FULL dword cmp at +0x4c). */
export function playerhudPocketUpgradeConfigPathPtr(entryPtr, isSso, configHeapPtr) {
  if (isSso) {
    return ((entryPtr >>> 0) + PLAYERHUD_P6_CONFIG_STRING_OFF) >>> 0;
  }
  return configHeapPtr >>> 0;
}

/** Global callback gate (PE 0x0084325d pattern): virtual return `test
 *  al,al` (LOW byte) AND DAT_00c7163c non-null. */
export function playerhudPocketUpgradeGlobalCallbackNeeded(virtualAl, globalFn) {
  if (((virtualAl | 0) & 0xff) === 0) {
    return false;
  }
  return (globalFn >>> 0) !== 0;
}

/** RESULT followup gate: 0x415d20 node+0x18 non-null (else only the free
 *  runs). */
export function playerhudPocketUpgradeResultFollowupNeeded(nodeWord18) {
  return (nodeWord18 | 0) !== 0;
}

/** RESULT materialize source offset (result+0x14). */
export function playerhudPocketUpgradeResultCopyByteOffset() {
  return PLAYERHUD_P6_RESULT_COPY_OFF;
}

export function playerhudPocketUpgradeBuildNodeResultEbpOff() {
  return PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF;
}
export function playerhudPocketUpgradeBuildNodeObjEbpOff() {
  return PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF;
}
export function playerhudPocketUpgradeListHeadEbpOff() {
  return PLAYERHUD_P6_LIST_HEAD_EBP_OFF;
}

const P6_VALUE_EBP = {
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT]: PLAYERHUD_P6_RESULT_VALUE_EBP_OFF,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG]: PLAYERHUD_P6_NEG_VALUE_EBP_OFF,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG]: PLAYERHUD_P6_CONFIG_VALUE_EBP_OFF,
};
const P6_ELEM_EBP = {
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT]: PLAYERHUD_P6_RESULT_ELEM_EBP_OFF,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG]: PLAYERHUD_P6_NEG_ELEM_EBP_OFF,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG]: PLAYERHUD_P6_CONFIG_ELEM_EBP_OFF,
};
const P6_VIRTUAL_EBP = {
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT]: PLAYERHUD_P6_RESULT_VIRTUAL_EBP_OFF,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG]: PLAYERHUD_P6_NEG_VIRTUAL_EBP_OFF,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG]: PLAYERHUD_P6_CONFIG_VIRTUAL_EBP_OFF,
};
const P6_SEH_FIRST = {
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT]: PLAYERHUD_P6_SEH_RESULT_FIRST,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG]: PLAYERHUD_P6_SEH_NEG_FIRST,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG]: PLAYERHUD_P6_SEH_CONFIG_FIRST,
};
const P6_SEH_COUNT = {
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT]: 3,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG]: 2,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG]: 6,
};
const P6_CALLBACK_COUNT = {
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT]: 2,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG]: 1,
  [PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG]: 3,
};

export function playerhudPocketUpgradeValueEbpOff(branchKind) {
  return P6_VALUE_EBP[branchKind] ?? 0;
}
export function playerhudPocketUpgradeElemEbpOff(branchKind) {
  return P6_ELEM_EBP[branchKind] ?? 0;
}
export function playerhudPocketUpgradeVirtualEbpOff(branchKind) {
  return P6_VIRTUAL_EBP[branchKind] ?? 0;
}
export function playerhudPocketUpgradeGlobalArgEbpOff(branchKind) {
  return playerhudPocketUpgradeElemEbpOff(branchKind);
}
export function playerhudPocketUpgradeSehFirst(branchKind) {
  return P6_SEH_FIRST[branchKind] ?? 0;
}
export function playerhudPocketUpgradeSehCount(branchKind) {
  return P6_SEH_COUNT[branchKind] ?? 0;
}
export function playerhudPocketUpgradeCallbackCount(branchKind) {
  return P6_CALLBACK_COUNT[branchKind] ?? 0;
}

export function playerhudPocketUpgradeConfigLoadImageResultEbpOff() {
  return PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF;
}
export function playerhudPocketUpgradeConfigElem2EbpOff() {
  return PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF;
}
export function playerhudPocketUpgradeConfigValue2EbpOff() {
  return PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF;
}
export function playerhudPocketUpgradeConfigVirtual2EbpOff() {
  return PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF;
}
export function playerhudPocketUpgradeConfigVirtual3EbpOff() {
  return PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF;
}
export function playerhudPocketUpgradeConfigCapacityByteOffset() {
  return PLAYERHUD_P6_CONFIG_CAPACITY_OFF;
}

export function playerhudHostVaPocketUpgradeBuildNode() {
  return PLAYERHUD_P6_HOST_VA_BUILD_NODE;
}
export function playerhudHostVaPocketUpgradeNodeRemove() {
  return PLAYERHUD_P6_HOST_VA_NODE_REMOVE;
}
export function playerhudHostVaFree() {
  return PLAYERHUD_P6_HOST_VA_FREE;
}

/** Packed pure plan for one pocket-upgrade slot. Host supplies the
 *  resolved entry, the 0x4288a0 result fields, the list head, and (CONFIG
 *  only) the gfx string capacity / heap ptr / re-read id. Branch SKIP when
 *  the resolve skipped or the entry is unusable. */
export function playerhudPocketUpgradePlan(input) {
  const {
    slotIndex,
    gamePresent,
    id,
    gameNegTableSize,
    managerTableSize,
    entryPtr,
    entryType,
    resultPtr,
    resultByteD,
    resultWord4,
    listHead,
    configCapacity,
    configHeapPtr,
    configReinsertId,
  } = input;

  const resolveTableKind = playerhudPocketUpgradeResolveKind(
    gamePresent,
    id,
    gameNegTableSize,
    managerTableSize,
  );
  const resolveLookupIndex = playerhudPocketUpgradeResolveIndex(
    gamePresent,
    id,
    gameNegTableSize,
    managerTableSize,
  );
  const usable = playerhudPocketUpgradeEntryUsable(entryPtr, entryType);
  const takeResult = playerhudPocketUpgradeTakeResultValue(
    resultByteD,
    resultWord4,
    id,
    resultPtr,
    listHead,
  );
  const branchKind =
    resolveTableKind === PLAYERHUD_POCKET_UPGRADE_KIND_SKIP || !usable
      ? PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP
      : playerhudPocketUpgradeBranchKind(takeResult, id);
  const insertValue = playerhudPocketUpgradeInsertValue(
    branchKind,
    id,
    resultWord4,
    configReinsertId,
  );
  const isConfig = branchKind === PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG;
  const isSso =
    isConfig &&
    ((configCapacity | 0) >>> 0) < PLAYERHUD_P6_CONFIG_SSO_THRESHOLD;
  const resultCopyOff =
    branchKind === PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT
      ? PLAYERHUD_P6_RESULT_COPY_OFF
      : 0;

  return {
    branchKind,
    resolveTableKind,
    resolveLookupIndex,
    insertValue,
    slotByteOff: playerhudPocketUpgradeSlotByteOffset(slotIndex),
    arrayElementDwordIndex: playerhudPocketUpgradeArrayElementDwordIndex(
      slotIndex,
    ),
    buildNodeResultEbpOff: PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF,
    buildNodeObjEbpOff: PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF,
    listHeadEbpOff: PLAYERHUD_P6_LIST_HEAD_EBP_OFF,
    valueEbpOff: playerhudPocketUpgradeValueEbpOff(branchKind),
    elemEbpOff: playerhudPocketUpgradeElemEbpOff(branchKind),
    virtualEbpOff: playerhudPocketUpgradeVirtualEbpOff(branchKind),
    globalArgEbpOff: playerhudPocketUpgradeGlobalArgEbpOff(branchKind),
    sehFirst: playerhudPocketUpgradeSehFirst(branchKind),
    sehCount: playerhudPocketUpgradeSehCount(branchKind),
    callbackCount: playerhudPocketUpgradeCallbackCount(branchKind),
    resultCopyOff,
    configIsSso: isSso ? 1 : 0,
    configPathPtr: isConfig
      ? playerhudPocketUpgradeConfigPathPtr(entryPtr, isSso, configHeapPtr)
      : 0,
    configLoadImageResultEbpOff: isConfig
      ? PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF
      : 0,
    configElem2EbpOff: isConfig ? PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF : 0,
    configValue2EbpOff: isConfig ? PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF : 0,
    configVirtual2EbpOff: isConfig ? PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF : 0,
    configVirtual3EbpOff: isConfig ? PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF : 0,
    hostVaBuildNode: PLAYERHUD_P6_HOST_VA_BUILD_NODE,
    hostVaNodeRemove: PLAYERHUD_P6_HOST_VA_NODE_REMOVE,
    hostVaMaterialize: playerHudHostVaSpMaterialize(),
    hostVaElemInit: PLAYERHUD_P5_HOST_VA_ELEM_INIT,
    hostVaPushGrow: PLAYERHUD_P5_HOST_VA_PUSH_GROW,
    hostVaLoadImage: PLAYERHUD_HOST_VA_LOAD_IMAGE,
    hostVaFree: PLAYERHUD_P6_HOST_VA_FREE,
  };
}

/* ---- P7: second-list gates (VA 0x00843667..0x00843a5c), v13 ----
 *
 * Runs when the P5A char-type gate fails. Requires Game+0x26584 == 0x2b
 * and a non-empty vector at player+0x1fa4..0x1fa8. The per-iteration
 * bound is RE-DERIVED from the player fields every trip
 * (mov/sub/sar/cmp/jae — the decompiler folds it; the machine does not).
 */

/** Game+0x26584 == 0x2b gate (PE 0x0084366c, full dword cmp). */
export function playerhudPocketSecondListGate(gameWord26584) {
  return (gameWord26584 | 0) === PLAYERHUD_P7_GAME_GATE_VALUE;
}

/** PE vector count: (end - begin) >> 2 with 32-bit wrap, ARITHMETIC shift
 *  (PE 0x0084367f sub eax,edx ; sar eax,2). */
export function playerhudPocketSecondListCount(begin1fa4, end1fa8) {
  return ((((end1fa8 >>> 0) - (begin1fa4 >>> 0)) | 0) >> 2) | 0;
}

/** Per-iteration bound (PE 0x00843750): re-derived each trip, UNSIGNED
 *  compare (jae). A negative sar result behaves as a huge unsigned count. */
export function playerhudPocketSecondListIterationNeeded(
  index,
  begin1fa4,
  end1fa8,
) {
  const count = playerhudPocketSecondListCount(begin1fa4, end1fa8);
  return ((index | 0) >>> 0) < (count >>> 0);
}

/** Per-element null gate (PE 0x00843766 test edx,edx ; je continue). */
export function playerhudPocketSecondListEntryUsable(entryPtr) {
  return (entryPtr >>> 0) !== 0;
}

export function playerhudPocketSecondListVecBeginByteOffset() {
  return PLAYERHUD_P7_VEC_BEGIN_OFF;
}
export function playerhudPocketSecondListVecEndByteOffset() {
  return PLAYERHUD_P7_VEC_END_OFF;
}


/* ---- ABI v14: tail residuals after the P6/P7 loops ----
 *
 * P6 list clear 0x00843603..0x00843662; P7 list clear
 * 0x00843a62..0x00843aa9; P5-walk clear 0x00843aab..0x00843adf; enable
 * store 0x00843aea; tail gfx rebuild 0x00843af1..0x00843ba6; 0x956110
 * call args 0x00843ba6..0x00843bb7.
 */

/** P6/P7 list-clear entry gate (PE 0x00843611 / 0x00843a70):
 *  `cmp eax,ecx ; je skip` — the SP-clear walk runs only when
 *  head[0] != head. The loop itself is host-driven (the 0x414a80
 *  advance mutates the cursor, and the exit depends on it). */
export function playerhudPocketListClearNeeded(headWord0, headPtr) {
  return (headWord0 >>> 0) !== (headPtr >>> 0);
}

/** Shared P6/P7 list-clear plan. kind: 0 = P6 (head [ebp-0x1450],
 *  teardown inline 0x415800 + free), 1 = P7 (head [ebp-0x143c],
 *  teardown 0x83b830 whose body is exactly 0x415800 + free(0x1c) —
 *  verified from the PE). */
export function playerhudPocketListClearPlan(kind, headWord0, headPtr) {
  const isP7 = (kind | 0) === PLAYERHUD_POCKET_LIST_CLEAR_KIND_P7;
  return {
    needsClear: playerhudPocketListClearNeeded(headWord0, headPtr),
    headEbpOff: isP7 ? PLAYERHUD_P7_LIST_HEAD_EBP_OFF
                     : PLAYERHUD_P6_LIST_HEAD_EBP_OFF,
    cursorEbpOff: PLAYERHUD_LIST_CLEAR_CURSOR_EBP_OFF,
    nodeSpClearOff: PLAYERHUD_LIST_CLEAR_NODE_SP_OFF,
    spClearArg: PLAYERHUD_LIST_CLEAR_SP_ARG,
    sehLevel: PLAYERHUD_LIST_CLEAR_SEH_LEVEL,
    hostVaAdvance: PLAYERHUD_TAIL_HOST_VA_ADVANCE,
    hostVaTeardown: isP7 ? PLAYERHUD_TAIL_HOST_VA_P7_LIST_CLEAR
                         : PLAYERHUD_TAIL_HOST_VA_TREE_TEARDOWN,
    teardownRunsFree: isP7 ? 0 : 1,
    hostVaFree: PLAYERHUD_P6_HOST_VA_FREE,
    freeSize: PLAYERHUD_LIST_CLEAR_FREE_SIZE,
  };
}

/** P5-walk clear up-front gate (PE 0x00843ab9): the equality skip goes
 *  PAST the teardown (unlike P5C, which tears down unconditionally). */
export function playerhudP5WalkClearNeeded(cursor6a0, end6a4) {
  return (cursor6a0 >>> 0) !== (end6a4 >>> 0);
}

/** Walk-clear plan (PE 0x00843aab..0x00843adf). walkSteps reuses the P5C
 *  stride law: -1 when the span is not a whole number of 0xc strides
 *  (the PE loop would never terminate). */
export function playerhudP5WalkClearPlan(cursor6a0, end6a4) {
  return {
    needed: playerhudP5WalkClearNeeded(cursor6a0, end6a4),
    walkSteps: playerhudP5WalkSteps(cursor6a0, end6a4),
    cursorByteOff: PLAYERHUD_P5_OFF_LIST_HEAD_6A0,
    endByteOff: PLAYERHUD_P5_OFF_LIST_END_6A4,
    stride: PLAYERHUD_P5_WALK_STRIDE,
    nodeSpClearOff: PLAYERHUD_WALK_CLEAR_NODE_SP_OFF,
    spClearArg: PLAYERHUD_LIST_CLEAR_SP_ARG,
    cursorSaveEbpOff: PLAYERHUD_WALK_CLEAR_CURSOR_SAVE_EBP_OFF,
    hudEbpOff: PLAYERHUD_WALK_CLEAR_HUD_EBP_OFF,
    hostVaSpClear: PLAYERHUD_HOST_VA_SMART_PTR_CLEAR,
    hostVaTeardown: PLAYERHUD_TAIL_HOST_VA_WALK_CLEAR,
  };
}

/** Enable-byte store (PE 0x00843aea): writes 0 at hud+0x6ac. Returns the
 *  byte value written (0) so the Wasm store is differentially checked. */
export function playerhudTailEnableStoreClearValue() {
  return 0;
}

/** Tail rebuild gate (PE 0x00843af1): byte +0x6ad != 0 — low-byte test,
 *  widened parameter (v12 rule). */
export function playerhudTailRebuildGate(byte6ad) {
  return ((byte6ad | 0) & 0xff) !== 0;
}

/** Path kind after the 0x748490 probe (PE 0x00843b37 test al,0x40):
 *  0 = FIXED rdata questionmark.png, 1 = CONFIG string. */
export function playerhudTailRebuildPathKind(probeAl) {
  return (probeAl & PLAYERHUD_TAIL_PROBE_MASK) !== 0
    ? PLAYERHUD_TAIL_PATH_FIXED
    : PLAYERHUD_TAIL_PATH_CONFIG;
}

/** FUN_0040d0c0 translated (std::string data pointer): capacity < 0x10 →
 *  entry+0x38 (SSO base), else the host-supplied heap data ptr. */
export function playerhudTailConfigStringData(
  entryPtr,
  capacity,
  heapDataPtr,
) {
  if ((capacity >>> 0) < PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD) {
    return (entryPtr + PLAYERHUD_ITEMCFG_GFX_STRING_OFF) >>> 0;
  }
  return heapDataPtr >>> 0;
}

/** Packed tail-rebuild plan (PE 0x00843af1..0x00843ba6). */
export function playerhudTailRebuildPlan(
  byte6ad,
  entryPtr,
  probeAl,
  configCapacity,
  configHeapPtr,
) {
  const runs = playerhudTailRebuildGate(byte6ad);
  const entryPresent = (entryPtr >>> 0) !== 0;
  const runsImage = runs && entryPresent;
  const pathKind = runsImage
    ? playerhudTailRebuildPathKind(probeAl)
    : 0; /* kind only meaningful when the LoadImage runs (FIXED==0) */
  const isFixed = pathKind === PLAYERHUD_TAIL_PATH_FIXED;
  return {
    runs: runs ? 1 : 0,
    entryPresent: entryPresent ? 1 : 0,
    pathKind,
    fixedPathVa: runsImage && isFixed ? PLAYERHUD_TAIL_FIXED_PATH_VA : 0,
    resultEbpOff: !runsImage
      ? 0
      : isFixed
        ? PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF
        : PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF,
    swapSehTryLevel: !runsImage
      ? 0
      : isFixed
        ? PLAYERHUD_TAIL_SEH_FIXED
        : PLAYERHUD_TAIL_SEH_CONFIG,
    teardownEcxEbpOff: !runsImage
      ? 0
      : isFixed
        ? PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF
        : PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF,
    tempTeardownSeh: !runsImage ? 0 : PLAYERHUD_TAIL_TEMP_TEARDOWN_SEH,
    anm2SpByteOff: PLAYERHUD_TAIL_ANM2_SP_OFF,
    spClearArg: PLAYERHUD_LIST_CLEAR_SP_ARG,
    clearsAfter: runs ? 1 : 0,
    configPathSso:
      pathKind === PLAYERHUD_TAIL_PATH_CONFIG &&
      (configCapacity >>> 0) < PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD
        ? 1
        : 0,
    configPathPtr:
      pathKind === PLAYERHUD_TAIL_PATH_CONFIG
        ? playerhudTailConfigStringData(
            entryPtr,
            configCapacity,
            configHeapPtr,
          )
        : 0,
    getCollectibleThisOff: PLAYERHUD_TAIL_GET_COLLECTIBLE_THIS_OFF,
    getCollectibleArgOff: PLAYERHUD_TAIL_COLLECTIBLE_ID_OFF,
    probeMask: PLAYERHUD_TAIL_PROBE_MASK,
    hostVaGetCollectible: PLAYERHUD_HOST_VA_ITEM_CONFIG_GET_COLLECTIBLE,
    hostVaSpClear: PLAYERHUD_HOST_VA_SMART_PTR_CLEAR,
    hostVaLoadImage: PLAYERHUD_HOST_VA_LOAD_IMAGE,
    hostVaSwap: PLAYERHUD_HOST_VA_SP_SWAP,
    hostVaTempTeardown: PLAYERHUD_TAIL_HOST_VA_TEMP_TEARDOWN,
    hostVaProbe: PLAYERHUD_TAIL_HOST_VA_PROBE,
  };
}

/** 0x956110 call-site args (PE 0x00843ba6..0x00843bb7): cdecl pushes
 *  right-to-left — arg0 = 0xb, arg1 = player+0x1618, arg2 = player,
 *  arg3 = caller-saved ecx leftover from the 0x40c440 call. */
export function playerhudTailPredicateCallArgs() {
  return {
    typeArg: PLAYERHUD_TAIL_PREDICATE_TYPE,
    arg1PlayerOff: PLAYERHUD_TAIL_PREDICATE_ARG1_OFF,
    arg2IsPlayer: 1,
    arg3IsLeftoverEcx: 1,
    hostVaPredicate: PLAYERHUD_TAIL_HOST_VA_PREDICATE,
  };
}

/* ---- ABI v32: RecomputeStats 0x84ca00 mask-dispatch pure laws ----
 *
 * Body 0x0084ca00..0x0084cc38 (ret 0xc): StatHUD::RecomputeStats-style
 * per-player recompute.  Signature (verified from 3 call sites):
 * void __thiscall (StatHUD *this, int player_index, uint mask,
 *                  int dead, never read).
 * Every game-state write goes through the pure tween 0x84d6b0 (v18
 * playerHudStatBarTween); the ONLY host residue is 3 opaque stat probes
 * (0x7f92b0 float, 0x749830 bool, 0x7f96f0 float) resolved by a host
 * blob.  This block lands the pure laws: the setg flag, the mask->slot
 * tween selection (low bits tested on bl, high bits on ebx, slots 6/7
 * coupled by the single test bl,0xc0), and the per-slot target f32
 * arithmetic (6 plain entry-field recipes + the c0 probe-scalar block).
 *
 * Independent of the C++: transcribed from
 * section-notes/playerhud-v18/disasm-84ca00-recomputestats-callsites.txt.
 */

export const PLAYERHUD_84CA00_VA = 0x0084ca00;
export const PLAYERHUD_84CA00_RET_VA = 0x0084cc38;
export const PLAYERHUD_84CA00_SLOT_COUNT = 10;
export const PLAYERHUD_84CA00_SLOT_STRIDE = 0x14;
export const PLAYERHUD_84CA00_SLOT_BASE_118 = 0x118; /* slot0 (mask 0x1) */
export const PLAYERHUD_84CA00_PLAYER_STRIDE = 0xcc;
export const PLAYERHUD_84CA00_ENTRY_PTR_OFF = 0x114; /* this+idx*0xcc+0x114 */
export const PLAYERHUD_84CA00_ENTRY_FRAME_OFF = 0x328;
export const PLAYERHUD_84CA00_GAME_FRAME_OFF = 0x264f8; /* Game+0x264f8 */
export const PLAYERHUD_84CA00_MODE_BYTE_OFF = 0x2ac; /* this+0x2ac */
export const PLAYERHUD_84CA00_GAME_1ADB4_OFF = 0x1adb4; /* Game+0x1adb4 */
export const PLAYERHUD_84CA00_ENTRY_1568 = 0x1568;
export const PLAYERHUD_84CA00_ENTRY_1460 = 0x1460;
export const PLAYERHUD_84CA00_ENTRY_1470 = 0x1470;
export const PLAYERHUD_84CA00_ENTRY_1480 = 0x1480;
export const PLAYERHUD_84CA00_ENTRY_1464 = 0x1464;
export const PLAYERHUD_84CA00_ENTRY_156C = 0x156c;
/* PE .rdata recipe constants (this binary, verified). */
export const PLAYERHUD_84CA00_RDATA_30F = 0x00baa8d0; /* 30.0  */
export const PLAYERHUD_84CA00_RDATA_1F = 0x00baa454;  /* 1.0   */
export const PLAYERHUD_84CA00_RDATA_40F = 0x00baa904; /* 40.0  */
export const PLAYERHUD_84CA00_RDATA_100F = 0x00baa9d0; /* 100.0 */
export const PLAYERHUD_84CA00_RDATA_ZERO = 0x00ba9fe4; /* 0.0   */
export const PLAYERHUD_84CA00_HOST_VA_PROBE1 = 0x007f92b0;
export const PLAYERHUD_84CA00_HOST_VA_PROBE2 = 0x00749830;
export const PLAYERHUD_84CA00_HOST_VA_PROBE3 = 0x007f96f0;
export const PLAYERHUD_84CA00_PURE_VA_TWEEN = 0x0084d6b0;

/**
 * Flag law (PE 0x0084ca28..0x0084ca42): mov eax,[Game+0x264f8];
 * sub eax,[entry+0x328]; cmp eax,1; setg al.  The subtraction wraps
 * mod 2^32 (32-bit reg), then setg is a SIGNED greater-than against 1.
 * Result is 0/1 and is pushed as the mode arg of every tween call.
 * @param {number} gameFrame Game+0x264f8 (uint32)
 * @param {number} entryFrame entry+0x328 (uint32)
 * @returns {number} 1 iff (gameFrame - entryFrame) > 1 signed
 */
export function playerHud84ca00Flag(gameFrame, entryFrame) {
  const diff = ((gameFrame >>> 0) - (entryFrame >>> 0)) | 0;
  return diff > 1 ? 1 : 0;
}

/**
 * Probe clamp law (PE 0x0084cb5b..0x0084cb81): probe1 is captured
 * post-fstp (x87 64->32 rounding already applied by the host blob),
 * then maxss xmm0,[0.0] ; minss xmm0,[1.0]; when the 0x749830 bool
 * (al, LOW byte) is 0, xorps zeroes the result.  maxss/minss: an
 * unordered (NaN) dest operand returns the src operand, so a NaN
 * probe1 clamps to 0.0; +-0.0 equal-sign returns src (+0.0).
 * @param {number} probe1Bits f32 bits of the 0x7f92b0 result
 * @param {number} probe2 0x749830 bool (only the low byte is tested)
 * @returns {number} clamped f32 bits
 */
export function playerHud84ca00Clamp(probe1Bits, probe2) {
  const p1 = f32FromBits(u32(probe1Bits));
  let c = p1;
  /* maxss(c, 0.0): unordered dest -> src(0.0); else a>b ? a : b. */
  if (c !== c) {
    c = 0.0;
  } else {
    c = c > 0.0 ? c : 0.0;
  }
  /* minss(c, 1.0): same rule with 1.0 as src. */
  if (c !== c) {
    c = 1.0;
  } else {
    c = c < 1.0 ? c : 1.0;
  }
  if ((probe2 >>> 0) & 0xff) {
    return f32BitsOf(c);
  }
  return PLAYERHUD_F32_ZERO_BITS; /* xorps -> +0.0 */
}

/**
 * Per-mask tween selection law (PE 0x0084ca45..0x0084cc34).  Mask bits
 * 0x1..0x20 gate slots 0..5 via `test bl,<bit>`; slots 6 (this+0x190)
 * and 7 (this+0x1a4) are BOTH gated by the single `test bl,0xc0`
 * (either bit 0x40 or 0x80 enables both tween calls); slot 8 (0x1b8)
 * by `test ebx,0x100`; slot 9 (0x1cc) by `test ebx,0x200`.  Slots
 * outside 0..9 are never selected.
 * @param {number} mask arg2 (uint32; low bits tested on bl)
 * @param {number} slotIndex 0..9
 * @returns {number} 1 iff the tween for that slot runs
 */
export function playerHud84ca00SlotActive(mask, slotIndex) {
  const m = mask >>> 0;
  switch (slotIndex) {
    case 0: return (m & 0x01) ? 1 : 0;
    case 1: return (m & 0x02) ? 1 : 0;
    case 2: return (m & 0x04) ? 1 : 0;
    case 3: return (m & 0x08) ? 1 : 0;
    case 4: return (m & 0x10) ? 1 : 0;
    case 5: return (m & 0x20) ? 1 : 0;
    case 6: return (m & 0xc0) ? 1 : 0; /* 0x190 */
    case 7: return (m & 0xc0) ? 1 : 0; /* 0x1a4 — coupled */
    case 8: return (m & 0x100) ? 1 : 0; /* 0x1b8 */
    case 9: return (m & 0x200) ? 1 : 0; /* 0x1cc */
    default: return 0;
  }
}

/**
 * Per-slot tween target law (PE 0x0084ca45..0x0084cc2f).  Returns the
 * f32 bits fed to xmm1 at the 0x84d6b0 call for the given slot:
 *   k0 e1568            k1 30.0/(e1460+1.0)  k2 e1470
 *   k3 e1480/40.0       k4 e1464             k5 e156c
 *   k6 (0x190) mode byte != 0: clamped*100.0
 *             mode byte == 0: (1.0-probe3)*clamped*100.0
 *   k7 (0x1a4) probe3*clamped*100.0
 *   k8 (0x1b8) 0.0 (xorps)     k9 Game+0x1adb4 * 100.0
 * where clamped = playerHud84ca00Clamp(probe1, probe2).  The c0 probe
 * arithmetic is pure SSE: subss/mulss/mulss in the k6 mode-0 arm,
 * mulss/mulss for k7, each op f32-rounded (Math.fround).
 * @returns {number} target f32 bits for the slot
 */
export function playerHud84ca00SlotTarget(
  slotIndex,
  e1568, e1460, e1470, e1480, e1464, e156c,
  probe1, probe2, probe3, modeByte, game1adb4,
) {
  const s = u32(slotIndex);
  if (s === 0) return u32(e1568);
  if (s === 1) {
    const f1460 = f32FromBits(u32(e1460));
    /* movss xmm1,[0xbaa8d0]; movss xmm0,[eax+0x1460];
       addss xmm0,[0xbaa454]; divss xmm1,xmm0 */
    return f32BitsOf(Math.fround(30 / Math.fround(f1460 + 1)));
  }
  if (s === 2) return u32(e1470);
  if (s === 3) {
    const f1480 = f32FromBits(u32(e1480));
    /* movss xmm1,[eax+0x1480]; divss xmm1,[0xbaa904] */
    return f32BitsOf(Math.fround(f1480 / 40));
  }
  if (s === 4) return u32(e1464);
  if (s === 5) return u32(e156c);
  if (s === 6) {
    const clamped = f32FromBits(playerHud84ca00Clamp(probe1, probe2));
    const hundred = f32FromBits(0x42c80000); /* 100.0f (0xbaa9d0) */
    const fprobe3 = f32FromBits(u32(probe3));
    if ((modeByte >>> 0) & 0xff) {
      /* 0x84cbaa: movss xmm1,[ebp+0xc]; mulss xmm1,xmm4 */
      return f32BitsOf(Math.fround(clamped * hundred));
    }
    /* 0x84cbba: movss xmm1,[0xbaa454]; subss xmm1,xmm5;
       mulss xmm1,[ebp+0xc]; mulss xmm1,xmm4 */
    const sub = Math.fround(1.0 - fprobe3);
    const m1 = Math.fround(sub * clamped);
    return f32BitsOf(Math.fround(m1 * hundred));
  }
  if (s === 7) {
    const clamped = f32FromBits(playerHud84ca00Clamp(probe1, probe2));
    const hundred = f32FromBits(0x42c80000); /* 100.0f (0xbaa9d0) */
    const fprobe3 = f32FromBits(u32(probe3));
    /* 0x84cbd4: mulss xmm5,[ebp+0xc]; mulss xmm5,xmm4 */
    const m1 = Math.fround(fprobe3 * clamped);
    return f32BitsOf(Math.fround(m1 * hundred));
  }
  if (s === 8) return PLAYERHUD_F32_ZERO_BITS; /* xorps xmm1,xmm1 */
  if (s === 9) {
    const f1adb4 = f32FromBits(u32(game1adb4));
    /* 0x84cc23: movss xmm1,[eax+0x1adb4]; mulss xmm1,xmm4 */
    return f32BitsOf(Math.fround(f1adb4 * 100));
  }
  return 0;
}

/* ---- ABI v33: per-player StatHUD stats-pack updater FUN_0084cc40
 *  (GATE/PLAN + pure laws).  Body VA 0x0084cc40..0x0084d6ad (ret 8).
 *  thiscall + 2 stdcall args [esp+4]=player_a, [esp+8]=player_b;
 *  encoder trick: `push ebx; mov ebx,esp` frame reads args via
 *  [ebx+8]/[ebx+0xc].  Two player blocks from `this`, stride 0xcc
 *  (v32 PLAYER_STRIDE by reference); block player ptr at +0x114.
 *  A-hit (block==A): store player_b into +0x114; when player_b != 0
 *  re-run the 10-slot stats pack (v18 tween law inlined per slot with
 *  v32 slot-target recipes; mode byte this+0x2ac).  B-hit (block==B):
 *  store player_a back and call RecomputeStats 0x84ca00 (v32 pure
 *  laws by reference) with (player_index=loop i, mask=-1, dead=i,
 *  ret 0xc).  The 3 opaque probes 0x7f92b0/0x749830/0x7f96f0 are host
 *  blob scalars (same as v32).  Disasm: cpu-dump/0084cc40.txt +
 *  0084ce00/0084d0f0/0084d200/0084d500.
 *  Independent of the C++: transcribed from the instruction stream. */

export const PLAYERHUD_84CC40_VA = 0x0084cc40;
export const PLAYERHUD_84CC40_RET_VA = 0x0084d6ad;
export const PLAYERHUD_84CC40_NEXT_VA = 0x0084d6b0; /* v18 tween (landed) */
export const PLAYERHUD_84CC40_BLOCK_COUNT = 2;
export const PLAYERHUD_84CC40_BLOCK_STRIDE = 0xcc;
export const PLAYERHUD_84CC40_BLOCK_PLAYER_OFF = 0x114;
export const PLAYERHUD_84CC40_SLOT_BASE_OFF = 0x118;
export const PLAYERHUD_84CC40_SLOT_COUNT = 10;
export const PLAYERHUD_84CC40_SLOT_STRIDE = 0x14;
export const PLAYERHUD_84CC40_MODE_BYTE_OFF = 0x2ac;
export const PLAYERHUD_84CC40_RECOMPUTE_HOST_VA = 0x0084ca00;
export const PLAYERHUD_84CC40_RECOMPUTE_MASK = 0xffffffff;
export const PLAYERHUD_84CC40_RECOMPUTE_DEAD_IS_INDEX = 1;

/* Block-gate kind law (PE 0x0084cc9d..0x0084cca0 cmp/jne A,
 * 0x0084d659..0x0084d65b cmp/jne B).  Order matters: A tested first.
 *   0 NONE            block != A && block != B
 *   1 SWAP_UPDATE     block == A (store B; update pack iff B != 0)
 *   2 SWAP_RECOMPUTE  block == B (store A; call RecomputeStats)
 * @returns {number} 0/1/2
 */
export function playerHud84cc40BlockKind(blockPlayer, playerA, playerB) {
  const block = blockPlayer >>> 0;
  const a = playerA >>> 0;
  const b = playerB >>> 0;
  if (block === a) return 1;
  if (block === b) return 2;
  return 0;
}

/* B-null gate (PE 0x0084ccb5 test edx,edx; je 0x84d698): the pack
 * update runs only when the swapped-in player_b is non-null. */
export function playerHud84cc40UpdateNeeded(playerB) {
  return (playerB >>> 0) !== 0 ? 1 : 0;
}

/* Reset-vs-tween path law (PE 0x0084ccc2..0x0084ccd1): identical
 * setg to the v32 84ca00 flag — (game+0x264f8 - entry+0x328) signed
 * > 1 -> TWEEN (mode 1), else RESET (mode 0).  The tween mode byte
 * driven from the slot state stays 1; the flag selects which of the
 * two packs the updater writes. */
export function playerHud84cc40PathFlag(gameFrame, entryFrame) {
  const diff = ((gameFrame >>> 0) - (entryFrame >>> 0)) | 0;
  return diff > 1 ? 1 : 0;
}

/* RecomputeStats call plan (PE 0x0084d65d..0x0084d66d): push ecx
 * (dead=i), push -1 (mask), push ecx (player_index=i); ecx=this;
 * call 0x84ca00 (ret 0xc).  player_index == dead == loop index i. */
export function playerHud84cc40RecomputePlan(playerIndex) {
  const i = playerIndex >>> 0;
  return {
    hostVa: PLAYERHUD_84CC40_RECOMPUTE_HOST_VA,
    playerIndex: i,
    mask: PLAYERHUD_84CC40_RECOMPUTE_MASK,
    dead: i,
  };
}

/* ---- ABI v39: 7-leaf StatHUD conversion cluster (VA 0x009bfc00..
 * 0x009bfd38).  HUD lane (PI process-input-v50-9bfc00 ownership
 * handoff, re-verified this unit).  All leaves: xmm0 in / xmm0 out,
 * ret 0, 1 direct rel32 caller each.  4 pure (0 E8) + 3 pow-composed
 * (blob-gated: host resolves the 0x4e4690 powf probe — 0x4e4690 =
 * cvtss2sd x2; call 0xaf08ff; cvtsd2ss, and 0xaf08ff = jmp
 * [IAT 0xb18830] = _libm_sse2_pow_precise; the PI "atan2f" mis-ID is
 * CORRECTED here).  Each SSE op is ONE f32 rounding (per-op
 * Math.fround).  Independent of the C++: transcribed from the
 * instruction stream. */

export const PLAYERHUD_9BFC00_VA = 0x009bfc00;
export const PLAYERHUD_9BFC00_RET_VA = 0x009bfc10;
export const PLAYERHUD_9BFC00_NEXT_VA = 0x009bfc20;
export const PLAYERHUD_9BFC00_CALLER1_VA = 0x0077007b;
export const PLAYERHUD_9BFC20_VA = 0x009bfc20;
export const PLAYERHUD_9BFC20_RET_VA = 0x009bfc30;
export const PLAYERHUD_9BFC20_NEXT_VA = 0x009bfc40;
export const PLAYERHUD_9BFC20_CALLER1_VA = 0x007700c3;
export const PLAYERHUD_9BFC40_VA = 0x009bfc40;
export const PLAYERHUD_9BFC40_RET_VA = 0x009bfc76;
export const PLAYERHUD_9BFC40_NEXT_VA = 0x009bfc80;
export const PLAYERHUD_9BFC40_CALLER1_VA = 0x007619d3;
export const PLAYERHUD_9BFC80_VA = 0x009bfc80;
export const PLAYERHUD_9BFC80_RET_VA = 0x009bfcc6;
export const PLAYERHUD_9BFC80_NEXT_VA = 0x009bfcd0;
export const PLAYERHUD_9BFC80_CALLER1_VA = 0x007700d8;
export const PLAYERHUD_9BFCD0_VA = 0x009bfcd0;
export const PLAYERHUD_9BFCD0_RET_VA = 0x009bfcf9;
export const PLAYERHUD_9BFCD0_NEXT_VA = 0x009bfd00;
export const PLAYERHUD_9BFCD0_CALLER1_VA = 0x007700ed;
export const PLAYERHUD_9BFD00_VA = 0x009bfd00;
export const PLAYERHUD_9BFD00_RET_VA = 0x009bfd18;
export const PLAYERHUD_9BFD00_NEXT_VA = 0x009bfd20;
export const PLAYERHUD_9BFD00_CALLER1_VA = 0x00770090;
export const PLAYERHUD_9BFD20_VA = 0x009bfd20;
export const PLAYERHUD_9BFD20_RET_VA = 0x009bfd38;
export const PLAYERHUD_9BFD20_NEXT_VA = 0x009bfd40; /* SEH host */
export const PLAYERHUD_9BFD20_CALLER1_VA = 0x00770102;
/* powf wrapper (host blob probe; 0xaf08ff = jmp [IAT 0xb18830] =
 * _libm_sse2_pow_precise). */
export const PLAYERHUD_9BFC40_HOST_VA_POWF = 0x004e4690;
/* PE .rdata float constants (bits of the f32 at the VA). */
export const PLAYERHUD_9BFC_45F_BITS = 0x40900000; /* 4.5f   */
export const PLAYERHUD_9BFC_2F_BITS = 0x40000000; /* 2.0f   */
export const PLAYERHUD_9BFC_1F_BITS = 0x3f800000; /* 1.0f   */
export const PLAYERHUD_9BFC_30F_BITS = 0x41f00000; /* 30.0f  */
export const PLAYERHUD_9BFC_075F_BITS = 0x3f400000; /* 0.75f  */
export const PLAYERHUD_9BFC_2120F_BITS = 0x4007b47c; /* 2.12039089f */
export const PLAYERHUD_9BFC_13333F_BITS = 0x3faaaaab; /* 1.33333337f */
export const PLAYERHUD_9BFC_04716F_BITS = 0x3ef17704; /* 0.471611142f */
export const PLAYERHUD_9BFC_17857F_BITS = 0x3fe49249; /* 1.78571427f */
export const PLAYERHUD_9BFC_04482F_BITS = 0x3ee5799f; /* 0.44819352f */
export const PLAYERHUD_9BFC_NEG2F_BITS = 0xc0000000; /* -2.0f */
export const PLAYERHUD_9BFC_10000F_BITS = 0x461c4000; /* 10000.0f */
export const PLAYERHUD_9BFC_230F_BITS = 0x43660000; /* 230.0f */
export const PLAYERHUD_9BFC_60F_BITS = 0x42700000; /* 60.0f  */

/* f32-exact constants: JS double literals do NOT equal the PE f32
 * values (e.g. 0.44819352 !== f32(0x3ee5799f)); load them bit-exact. */
const K_9BFC_2120F = f32FromBits(PLAYERHUD_9BFC_2120F_BITS);
const K_9BFC_13333F = f32FromBits(PLAYERHUD_9BFC_13333F_BITS);
const K_9BFC_04716F = f32FromBits(PLAYERHUD_9BFC_04716F_BITS);
const K_9BFC_17857F = f32FromBits(PLAYERHUD_9BFC_17857F_BITS);
const K_9BFC_04482F = f32FromBits(PLAYERHUD_9BFC_04482F_BITS);

/** Law (VA 0x009bfc00): x*4.5f - 2.0f (mulss then subss — two f32
 *  roundings). */
export function playerHud9bfc00Law(xBits) {
  return f32BitsOf(Math.fround(Math.fround(f32FromBits(u32(xBits)) * 4.5) - 2.0));
}

/** Law (VA 0x009bfc20): (x + 2.0f) / 4.5f (addss then divss). */
export function playerHud9bfc20Law(xBits) {
  return f32BitsOf(Math.fround(Math.fround(f32FromBits(u32(xBits)) + 2.0) / 4.5));
}

/** pow base (VA 0x009bfc40): 30.0f / (x + 1.0f) (addss then divss). */
export function playerHud9bfc40PowBase(xBits) {
  return f32BitsOf(Math.fround(30.0 / Math.fround(f32FromBits(u32(xBits)) + 1.0)));
}

/** exp bits for 0x9bfc40: 0.75f. */
export function playerHud9bfc40PowExpBits() {
  return PLAYERHUD_9BFC_075F_BITS;
}

/** Law (VA 0x009bfc40): pow * 2.12039089f - 2.0f (mulss then subss).
 *  powBits = host-resolved f32 bits of powf(base, 0.75f). */
export function playerHud9bfc40Law(xBits, powBits) {
  return f32BitsOf(Math.fround(Math.fround(f32FromBits(u32(powBits)) * K_9BFC_2120F) - 2.0));
}

/** Gate (VA 0x009bfc80/0x009bfcd0): comiss x,-2.0f; jbe — taken when
 *  x <= -2.0f OR unordered (NaN): !(x > -2.0f).  1 = constant branch. */
export function playerHud9bfc80Gate(xBits) {
  const x = f32FromBits(u32(xBits));
  return !(x > -2.0) ? 1 : 0;
}

/** pow base (VA 0x009bfc80): (x + 2.0f) * 0.471611142f. */
export function playerHud9bfc80PowBase(xBits) {
  return f32BitsOf(Math.fround(Math.fround(f32FromBits(u32(xBits)) + 2.0) * K_9BFC_04716F));
}

/** exp bits for 0x9bfc80: 1.33333337f. */
export function playerHud9bfc80PowExpBits() {
  return PLAYERHUD_9BFC_13333F_BITS;
}

/** Law (VA 0x009bfc80): gate ? 10000.0f : 30.0f/pow - 1.0f
 *  (divss then subss). */
export function playerHud9bfc80Law(xBits, powBits) {
  if (playerHud9bfc80Gate(xBits) !== 0) return PLAYERHUD_9BFC_10000F_BITS;
  return f32BitsOf(Math.fround(Math.fround(30.0 / f32FromBits(u32(powBits))) - 1.0));
}

/** Gate (VA 0x009bfcd0): same comiss/jbe as 0x9bfc80. */
export function playerHud9bfcd0Gate(xBits) {
  return playerHud9bfc80Gate(xBits);
}

/** pow base (VA 0x009bfcd0): (x + 2.0f) * 0.44819352f. */
export function playerHud9bfcd0PowBase(xBits) {
  return f32BitsOf(Math.fround(Math.fround(f32FromBits(u32(xBits)) + 2.0) * K_9BFC_04482F));
}

/** exp bits for 0x9bfcd0: 1.78571427f. */
export function playerHud9bfcd0PowExpBits() {
  return PLAYERHUD_9BFC_17857F_BITS;
}

/** Law (VA 0x009bfcd0): gate ? 0.0f : powBits (tail jmp = identity). */
export function playerHud9bfcd0Law(xBits, powBits) {
  if (playerHud9bfcd0Gate(xBits) !== 0) return 0;
  return u32(powBits);
}

/** Law (VA 0x009bfd00): (x - 230.0f)/60.0f + 2.0f (three roundings). */
export function playerHud9bfd00Law(xBits) {
  return f32BitsOf(Math.fround(Math.fround(Math.fround(f32FromBits(u32(xBits)) - 230.0) / 60.0) + 2.0));
}

/** Law (VA 0x009bfd20): (x - 2.0f)*60.0f + 230.0f (three roundings). */
export function playerHud9bfd20Law(xBits) {
  return f32BitsOf(Math.fround(Math.fround(Math.fround(f32FromBits(u32(xBits)) - 2.0) * 60.0) + 230.0));
}

export function playerHud9bfc00Va() { return PLAYERHUD_9BFC00_VA; }
export function playerHud9bfc00RetVa() { return PLAYERHUD_9BFC00_RET_VA; }
export function playerHud9bfc00NextVa() { return PLAYERHUD_9BFC00_NEXT_VA; }
export function playerHud9bfc00Caller1Va() { return PLAYERHUD_9BFC00_CALLER1_VA; }
export function playerHud9bfc20Va() { return PLAYERHUD_9BFC20_VA; }
export function playerHud9bfc20RetVa() { return PLAYERHUD_9BFC20_RET_VA; }
export function playerHud9bfc20NextVa() { return PLAYERHUD_9BFC20_NEXT_VA; }
export function playerHud9bfc20Caller1Va() { return PLAYERHUD_9BFC20_CALLER1_VA; }
export function playerHud9bfc40Va() { return PLAYERHUD_9BFC40_VA; }
export function playerHud9bfc40RetVa() { return PLAYERHUD_9BFC40_RET_VA; }
export function playerHud9bfc40NextVa() { return PLAYERHUD_9BFC40_NEXT_VA; }
export function playerHud9bfc40Caller1Va() { return PLAYERHUD_9BFC40_CALLER1_VA; }
export function playerHud9bfc80Va() { return PLAYERHUD_9BFC80_VA; }
export function playerHud9bfc80RetVa() { return PLAYERHUD_9BFC80_RET_VA; }
export function playerHud9bfc80NextVa() { return PLAYERHUD_9BFC80_NEXT_VA; }
export function playerHud9bfc80Caller1Va() { return PLAYERHUD_9BFC80_CALLER1_VA; }
export function playerHud9bfcd0Va() { return PLAYERHUD_9BFCD0_VA; }
export function playerHud9bfcd0RetVa() { return PLAYERHUD_9BFCD0_RET_VA; }
export function playerHud9bfcd0NextVa() { return PLAYERHUD_9BFCD0_NEXT_VA; }
export function playerHud9bfcd0Caller1Va() { return PLAYERHUD_9BFCD0_CALLER1_VA; }
export function playerHud9bfd00Va() { return PLAYERHUD_9BFD00_VA; }
export function playerHud9bfd00RetVa() { return PLAYERHUD_9BFD00_RET_VA; }
export function playerHud9bfd00NextVa() { return PLAYERHUD_9BFD00_NEXT_VA; }
export function playerHud9bfd00Caller1Va() { return PLAYERHUD_9BFD00_CALLER1_VA; }
export function playerHud9bfd20Va() { return PLAYERHUD_9BFD20_VA; }
export function playerHud9bfd20RetVa() { return PLAYERHUD_9BFD20_RET_VA; }
export function playerHud9bfd20NextVa() { return PLAYERHUD_9BFD20_NEXT_VA; }
export function playerHud9bfd20Caller1Va() { return PLAYERHUD_9BFD20_CALLER1_VA; }
export function playerHud9bfcHostVaPowf() { return PLAYERHUD_9BFC40_HOST_VA_POWF; }

/* ---------- ABI v40: 0x009c0120 / 0x009c0170 lerp visitors ----------
   Virtual methods (address-taken only via .rdata vtables 0xb7ed28 /
   0xb7ed40; ZERO E8 callers / static dword refs).  The always-path
   vtbl[4] probe stays HOST — its st0 f32 VALUE is the recapture
   f_bits (the v39 pow-probe precedent).  Per-op f32 rounding. */

export const PLAYERHUD_9C0120_VA = 0x009c0120;
export const PLAYERHUD_9C0120_RET_VA = 0x009c0165;
export const PLAYERHUD_9C0120_NEXT_VA = 0x009c0170;
export const PLAYERHUD_9C0120_VTABLE_REF_RDATA = 0x00b7ed28;
export const PLAYERHUD_9C0120_PROBE_SLOT = 4;
export const PLAYERHUD_9C0120_PROBE_VTBL_OFF = 0x10;
export const PLAYERHUD_9C0120_A_OFF = 8;
export const PLAYERHUD_9C0120_B_OFF = 0xc;
export const PLAYERHUD_CLAMP_LO_RDATA = 0x00ba9fe4;   /* 0.0f */
export const PLAYERHUD_CLAMP_HI_RDATA = 0x00baa454;   /* 1.0f */
export const PLAYERHUD_CLAMP_ZERO_BITS = 0x00000000;
export const PLAYERHUD_CLAMP_ONE_BITS = 0x3f800000;
export const PLAYERHUD_9C0170_VA = 0x009c0170;
export const PLAYERHUD_9C0170_RET_VA = 0x009c01cc;
export const PLAYERHUD_9C0170_NEXT_VA = 0x009c01d0;
export const PLAYERHUD_9C0170_VTABLE_REF_RDATA = 0x00b7ed40;
export const PLAYERHUD_9C0170_RET_IMM = 4;
export const PLAYERHUD_9C0170_A_OFF = 8;
export const PLAYERHUD_9C0170_B_OFF = 0xc;
export const PLAYERHUD_9C0170_C_OFF = 0x10;
export const PLAYERHUD_9C0170_D_OFF = 0x14;

const _f32 = new Float32Array(1);
const _u32 = new Uint32Array(_f32.buffer);

/** f32 bits -> JS number (exact). */
export function playerHudBitsToF32(bits) {
  _u32[0] = bits >>> 0;
  return _f32[0];
}

/** JS number -> f32 bits (fround). */
export function playerHudF32ToBits(value) {
  _f32[0] = Math.fround(value);
  return _u32[0];
}

/** The PE maxss/minss clamp pair: NaN -> +0.0f, -0.0f -> +0.0f,
    f < 0 -> +0.0f, f > 1 -> 1.0f, else f. */
export function playerHud9c0120Clamp01(fBits) {
  const f = playerHudBitsToF32(fBits >>> 0);
  let t = f > 0 ? f : 0;   /* maxss xmm,[0xba9fe4]: src2 wins NaN/-0 */
  t = t < 1 ? t : 1;       /* minss xmm,[0xbaa454] */
  return playerHudF32ToBits(t);
}

/** 0x9c0120 law: a + (b - a) * clamp01(f), per-op f32. */
export function playerHud9c0120Value(aBits, bBits, fBits) {
  const a = playerHudBitsToF32(aBits >>> 0);
  const b = playerHudBitsToF32(bBits >>> 0);
  const d = Math.fround(b - a);                       /* subss */
  const tb = playerHud9c0120Clamp01(fBits);
  const m = Math.fround(d * playerHudBitsToF32(tb));  /* mulss */
  const r = Math.fround(a + m);                       /* addss */
  return playerHudF32ToBits(r);
}

/** 0x9c0170 law: the shared clamp01 ONCE, then the two component
    lerps (out[0]/out[1]) + the clamped t. */
export function playerHud9c0170Pair(aBits, bBits, cBits, dBits, fBits) {
  const a = playerHudBitsToF32(aBits >>> 0);
  const b = playerHudBitsToF32(bBits >>> 0);
  const c = playerHudBitsToF32(cBits >>> 0);
  const d = playerHudBitsToF32(dBits >>> 0);
  const tb = playerHud9c0120Clamp01(fBits);
  const t = playerHudBitsToF32(tb);
  const out0 = Math.fround(a + Math.fround(Math.fround(c - a) * t));
  const out1 = Math.fround(b + Math.fround(Math.fround(d - b) * t));
  return {
    out0Bits: playerHudF32ToBits(out0),
    out1Bits: playerHudF32ToBits(out1),
    tBits: tb,
  };
}

/* v40 census pins. */
export function playerHud9c0120Va() { return PLAYERHUD_9C0120_VA; }
export function playerHud9c0120RetVa() { return PLAYERHUD_9C0120_RET_VA; }
export function playerHud9c0120NextVa() { return PLAYERHUD_9C0120_NEXT_VA; }
export function playerHud9c0120VtableRefRdata() { return PLAYERHUD_9C0120_VTABLE_REF_RDATA; }
export function playerHud9c0120ProbeSlot() { return PLAYERHUD_9C0120_PROBE_SLOT; }
export function playerHud9c0120ProbeVtblOff() { return PLAYERHUD_9C0120_PROBE_VTBL_OFF; }
export function playerHud9c0120AOff() { return PLAYERHUD_9C0120_A_OFF; }
export function playerHud9c0120BOff() { return PLAYERHUD_9C0120_B_OFF; }
export function playerHudClampLoRdata() { return PLAYERHUD_CLAMP_LO_RDATA; }
export function playerHudClampHiRdata() { return PLAYERHUD_CLAMP_HI_RDATA; }
export function playerHudClampZeroBits() { return PLAYERHUD_CLAMP_ZERO_BITS; }
export function playerHudClampOneBits() { return PLAYERHUD_CLAMP_ONE_BITS; }
export function playerHud9c0170Va() { return PLAYERHUD_9C0170_VA; }
export function playerHud9c0170RetVa() { return PLAYERHUD_9C0170_RET_VA; }
export function playerHud9c0170NextVa() { return PLAYERHUD_9C0170_NEXT_VA; }
export function playerHud9c0170VtableRefRdata() { return PLAYERHUD_9C0170_VTABLE_REF_RDATA; }
export function playerHud9c0170RetImm() { return PLAYERHUD_9C0170_RET_IMM; }
export function playerHud9c0170AOff() { return PLAYERHUD_9C0170_A_OFF; }
export function playerHud9c0170BOff() { return PLAYERHUD_9C0170_B_OFF; }
export function playerHud9c0170COff() { return PLAYERHUD_9C0170_C_OFF; }
export function playerHud9c0170DOff() { return PLAYERHUD_9C0170_D_OFF; }

/* ---------------- ABI v41: 0x009c06a0 probe-sum vec2 law ------------
   VA 0x009c06a0..0x009c075a ret 4 @0x9c0757. thiscall + out ptr
   [ebp+8], returns eax = out. Two ALWAYS-PATH indirect probes
   [vtbl+8] on embedded objects this+0xc8 / this+0xf0 stay HOST; the
   consumed values are the post-probe f32 fields [obj1+0]/[obj1+4]
   (v40 recapture precedent; identify-zhl exactMatches []). Direct
   rel32 callers 0x420800 / 0x8403c0. BSS globals 0xc7997c/0xc79980
   host-resolved inputs; K1 [0xbaa2d0]=0.5f and K2 [0xbaa804]=9.0f
   file-backed rdata. Each SSE op ONE f32 rounding (Math.fround).
   Census verdicts: 0x9c075a/0x9c07e4/0x9c0870(+split tails) HOST. */

export const PLAYERHUD_9C06A0_VA = 0x009c06a0;
export const PLAYERHUD_9C06A0_RET_VA = 0x009c0757;
export const PLAYERHUD_9C06A0_NEXT_VA = 0x009c075a;
export const PLAYERHUD_9C06A0_RET_IMM = 4;
export const PLAYERHUD_9C06A0_CALLER1_VA = 0x00420800;
export const PLAYERHUD_9C06A0_CALLER2_VA = 0x008403c0;
export const PLAYERHUD_9C06A0_OBJ1_OFF = 0xc8;
export const PLAYERHUD_9C06A0_PROBE_SLOT = 2;
export const PLAYERHUD_9C06A0_PROBE_VTBL_OFF = 8;
export const PLAYERHUD_9C06A0_OBJ1_X_OFF = 0;
export const PLAYERHUD_9C06A0_OBJ1_Y_OFF = 4;
export const PLAYERHUD_9C06A0_THIS_B_OFF = 0x48;
export const PLAYERHUD_9C06A0_THIS_D_OFF = 0x4c;
export const PLAYERHUD_9C06A0_OBJ2_OFF = 0xf0;
export const PLAYERHUD_GLOBAL1_BSS = 0x00c7997c;
export const PLAYERHUD_GLOBAL2_BSS = 0x00c79980;
export const PLAYERHUD_K1_RDATA = 0x00baa2d0;
export const PLAYERHUD_K1_BITS = 0x3f000000; /* 0.5f */
export const PLAYERHUD_K2_RDATA = 0x00baa804;
export const PLAYERHUD_K2_BITS = 0x41100000; /* 9.0f */

/** 0x9c06a0 law: out0 = (a + b) + g1*K1; out1 = ((c + d) + g2*K1) - K2,
    per-op f32. a/c are the post-probe obj1 fields, b/d the this fields,
    g1/g2 the BSS global bits (host-resolved inputs). */
export function playerHud9c06a0Law(aBits, bBits, cBits, dBits, g1Bits, g2Bits) {
  const k1 = playerHudBitsToF32(PLAYERHUD_K1_BITS);
  const t0 = Math.fround(playerHudBitsToF32(aBits >>> 0) +
    playerHudBitsToF32(bBits >>> 0));                   /* addss xmm3,B  */
  const u0 = Math.fround(playerHudBitsToF32(g1Bits >>> 0) * k1); /* mulss */
  const out0 = Math.fround(t0 + u0);                    /* addss xmm3,x0 */
  const t1 = Math.fround(playerHudBitsToF32(cBits >>> 0) +
    playerHudBitsToF32(dBits >>> 0));                   /* addss xmm2,D  */
  const u1 = Math.fround(playerHudBitsToF32(g2Bits >>> 0) * k1); /* mulss */
  const r1 = Math.fround(Math.fround(t1 + u1) -
    playerHudBitsToF32(PLAYERHUD_K2_BITS));             /* subss K2      */
  return {
    out0Bits: playerHudF32ToBits(out0),
    out1Bits: playerHudF32ToBits(r1),
  };
}

/* v41 census pins. */
export function playerHud9c06a0Va() { return PLAYERHUD_9C06A0_VA; }
export function playerHud9c06a0RetVa() { return PLAYERHUD_9C06A0_RET_VA; }
export function playerHud9c06a0NextVa() { return PLAYERHUD_9C06A0_NEXT_VA; }
export function playerHud9c06a0Caller1Va() { return PLAYERHUD_9C06A0_CALLER1_VA; }
export function playerHud9c06a0Caller2Va() { return PLAYERHUD_9C06A0_CALLER2_VA; }
export function playerHud9c06a0Obj1Off() { return PLAYERHUD_9C06A0_OBJ1_OFF; }
export function playerHud9c06a0ProbeSlot() { return PLAYERHUD_9C06A0_PROBE_SLOT; }
export function playerHud9c06a0ProbeVtblOff() { return PLAYERHUD_9C06A0_PROBE_VTBL_OFF; }
export function playerHud9c06a0Obj1XOff() { return PLAYERHUD_9C06A0_OBJ1_X_OFF; }
export function playerHud9c06a0Obj1YOff() { return PLAYERHUD_9C06A0_OBJ1_Y_OFF; }
export function playerHud9c06a0ThisBOff() { return PLAYERHUD_9C06A0_THIS_B_OFF; }
export function playerHud9c06a0ThisDOff() { return PLAYERHUD_9C06A0_THIS_D_OFF; }
export function playerHud9c06a0Obj2Off() { return PLAYERHUD_9C06A0_OBJ2_OFF; }
export function playerHudGlobal1Bss() { return PLAYERHUD_GLOBAL1_BSS; }
export function playerHudGlobal2Bss() { return PLAYERHUD_GLOBAL2_BSS; }
export function playerHudK1Rdata() { return PLAYERHUD_K1_RDATA; }
export function playerHudK1Bits() { return PLAYERHUD_K1_BITS; }
export function playerHudK2Rdata() { return PLAYERHUD_K2_RDATA; }
export function playerHudK2Bits() { return PLAYERHUD_K2_BITS; }
export function playerHud9c06a0RetImm() { return PLAYERHUD_9C06A0_RET_IMM; }

/* ---------------- ABI v42: 0x9c2210 slot-index advance machine ------
   VA 0x009c2210..0x009c22a4 ret 4 @0x9c22a4. thiscall + i32 arg,
   PURE-COMPLETE (0 E8 / 0 IND / no SEH / no globals; identify-zhl
   exactMatches []). Advances the this+0xc slot index by arg with
   signed wrap over the 0x30-stride vector count ((end-begin)/0x30,
   magic 0x2aaaaaab sar 3), probing ONLY [elem+8] == -1; landing back
   on orig stops before any probe; fail paths store -1. Four direct
   rel32 callers: 0x009c066b / 0x009c092c / 0x009c0b67 / 0x009c0b9b. */

export const PLAYERHUD_9C2210_VA = 0x009c2210;
export const PLAYERHUD_9C2210_RET_VA = 0x009c22a4;
export const PLAYERHUD_9C2210_NEXT_VA = 0x009c22b0;
export const PLAYERHUD_9C2210_RET_IMM = 4;
export const PLAYERHUD_9C2210_INDEX_OFF = 0xc;
export const PLAYERHUD_9C2210_VEC_BEGIN_OFF = 0x84;
export const PLAYERHUD_9C2210_VEC_END_OFF = 0x88;
export const PLAYERHUD_9C2210_STRIDE = 0x30;
export const PLAYERHUD_9C2210_DIV_MAGIC = 0x2aaaaaab;
export const PLAYERHUD_9C2210_DIV_SHIFT = 3;
export const PLAYERHUD_9C2210_EMPTY_FLAG_OFF = 8;
export const PLAYERHUD_9C2210_EMPTY_FLAG_BITS = 0xffffffff;
export const PLAYERHUD_9C2210_FAIL_INDEX = 0xffffffff;
export const PLAYERHUD_9C2210_CALLER1_VA = 0x009c066b;
export const PLAYERHUD_9C2210_CALLER2_VA = 0x009c092c;
export const PLAYERHUD_9C2210_CALLER3_VA = 0x009c0b67;
export const PLAYERHUD_9C2210_CALLER4_VA = 0x009c0b9b;

/** Truncated-toward-zero element count (PE magic-div equivalence). */
export function playerHud9c2210Count(byteLen) {
  return Math.trunc(byteLen / PLAYERHUD_9C2210_STRIDE);
}

/**
 * Faithful JS transcription of the 0x9c2210 machine. cur/arg i32;
 * flagAt(i) returns the dword at [begin + i*0x30 + 8]. Returns
 * { runaway, probes, minProbe, maxProbe, final, failed } where final
 * is the stored index as u32; probes lists every probed index (row
 * vetting: tests reject rows whose probes leave [0, count) or that
 * exceed the guard — the PE's adversarial-arg nontermination domain).
 */
export function playerHud9c2210Advance(cur, arg, byteLen, flagAt) {
  const count = Math.trunc(byteLen / PLAYERHUD_9C2210_STRIDE);
  let esi = cur | 0;
  const orig = cur | 0;
  let cell = orig;
  let failed = false;
  const probes = [];
  let minProbe = Infinity;
  let maxProbe = -Infinity;
  for (let guard = 0; ; guard++) {
    if (guard > 4096) {
      return { runaway: true, probes, minProbe, maxProbe,
        final: cell >>> 0, failed };
    }
    const next = (arg + esi) | 0;
    esi = next;
    cell = next;
    if (next < 0) {
      if (orig < 0) { failed = true; break; }
      esi = (next + count) | 0;
      cell = esi;
    }
    if (esi >= count) {
      if (orig < 0) { failed = true; break; }
      esi = (esi - count) | 0;
      cell = esi;
    }
    if (esi === orig) break;
    probes.push(esi);
    if (esi < minProbe) minProbe = esi;
    if (esi > maxProbe) maxProbe = esi;
    if (flagAt(esi) !== -1) break;
  }
  return {
    runaway: false,
    probes,
    minProbe,
    maxProbe,
    final: (failed ? -1 : cell) >>> 0,
    failed,
  };
}

/* v42 census pins. */
export function playerHud9c2210Va() { return PLAYERHUD_9C2210_VA; }
export function playerHud9c2210RetVa() { return PLAYERHUD_9C2210_RET_VA; }
export function playerHud9c2210NextVa() { return PLAYERHUD_9C2210_NEXT_VA; }
export function playerHud9c2210RetImm() { return PLAYERHUD_9C2210_RET_IMM; }
export function playerHud9c2210IndexOff() { return PLAYERHUD_9C2210_INDEX_OFF; }
export function playerHud9c2210VecBeginOff() { return PLAYERHUD_9C2210_VEC_BEGIN_OFF; }
export function playerHud9c2210VecEndOff() { return PLAYERHUD_9C2210_VEC_END_OFF; }
export function playerHud9c2210Stride() { return PLAYERHUD_9C2210_STRIDE; }
export function playerHud9c2210DivMagic() { return PLAYERHUD_9C2210_DIV_MAGIC; }
export function playerHud9c2210DivShift() { return PLAYERHUD_9C2210_DIV_SHIFT; }
export function playerHud9c2210EmptyFlagOff() { return PLAYERHUD_9C2210_EMPTY_FLAG_OFF; }
export function playerHud9c2210EmptyFlagBits() { return PLAYERHUD_9C2210_EMPTY_FLAG_BITS; }
export function playerHud9c2210Caller1Va() { return PLAYERHUD_9C2210_CALLER1_VA; }
export function playerHud9c2210Caller2Va() { return PLAYERHUD_9C2210_CALLER2_VA; }
export function playerHud9c2210Caller3Va() { return PLAYERHUD_9C2210_CALLER3_VA; }
export function playerHud9c2210Caller4Va() { return PLAYERHUD_9C2210_CALLER4_VA; }

/* ---------------- ABI v43: 0x009c0870 merged slot-search/clear ------
   VA 0x009c0870..0x009c0958 ret 8 (exhaust @0x9c08d3 / cleared
   @0x9c0943 / shared @0x9c0958). thiscall + i32 which + byte lane.
   PURE-COMPLETE: sole E8 composes the landed v42 advance. Scan finds
   the `which`-th NON-empty slot (both -1 skips), swaps out one lane,
   then re-seats [this+0xc] via advance(-1) with land-back -> -1 and
   cur==-1&lane!=0 pickup. Callers 0x00420670/0x00420692/0x00420783/
   0x0042078e. */

export const PLAYERHUD_9C0870_VA = 0x009c0870;
export const PLAYERHUD_9C0870_RET_VA = 0x009c0958;
export const PLAYERHUD_9C0870_RET_EXHAUST_VA = 0x009c08d3;
export const PLAYERHUD_9C0870_RET_CLEARED_VA = 0x009c0943;
export const PLAYERHUD_9C0870_NEXT_VA = 0x009c0960;
export const PLAYERHUD_9C0870_RET_IMM = 8;
export const PLAYERHUD_9C0870_INDEX_OFF = 0xc;
export const PLAYERHUD_9C0870_VEC_BEGIN_OFF = 0x84;
export const PLAYERHUD_9C0870_VEC_END_OFF = 0x88;
export const PLAYERHUD_9C0870_STRIDE = 0x30;
export const PLAYERHUD_9C0870_DIV_MAGIC = 0x2aaaaaab;
export const PLAYERHUD_9C0870_DIV_SHIFT = 3;
export const PLAYERHUD_9C0870_FLAG_A_OFF = 8;
export const PLAYERHUD_9C0870_FLAG_B_OFF = 0xc;
export const PLAYERHUD_9C0870_EMPTY_BITS = 0xffffffff;
export const PLAYERHUD_9C0870_CALLER1_VA = 0x00420670;
export const PLAYERHUD_9C0870_CALLER2_VA = 0x00420692;
export const PLAYERHUD_9C0870_CALLER3_VA = 0x00420783;
export const PLAYERHUD_9C0870_CALLER4_VA = 0x0042078e;

/**
 * Faithful JS transcription of the 0x9c0870 machine over an elems
 * array of {a, b} (+8/+0xc dword flags). cell is [this+0xc] as i32.
 * Composes playerHud9c2210Advance(-1) for the re-seat edge (probing
 * the POST-CLEAR a-lane exactly like the PE memory). Returns
 * { cell, elems } — new state, input untouched.
 */
export function playerHud9c0870SearchClear(cell, which, lane, elems) {
  const es = elems.map((e) => ({ a: e.a | 0, b: e.b | 0 }));
  let found = -1;
  let ordinal = 0;
  for (let i = 0; i < es.length; i++) {
    if (es[i].a === -1 && es[i].b === -1) continue;
    const old = ordinal++;
    if (old === which) {
      found = i;
      break;
    }
  }
  let outCell = cell | 0;
  if (found >= 0) {
    const e = es[found];
    if ((lane | 0) !== 0) {
      if (e.a !== -1) return { cell: outCell, elems: es };
      e.a = e.b;
      e.b = -1;
    } else {
      if (e.b !== -1) return { cell: outCell, elems: es };
      e.b = e.a;
      e.a = -1;
    }
    if (outCell === found) {
      /* Re-seat via the landed v42 advance(-1), probing the POST-CLEAR
         a-lane exactly like the PE memory. */
      outCell = playerHud9c2210Advance(outCell, -1,
        es.length * PLAYERHUD_9C0870_STRIDE,
        (i) => es[i].a).final | 0;
      if (outCell === found) outCell = -1;
    } else if (outCell === -1 && (lane | 0) !== 0) {
      outCell = found;
    }
  }
  return { cell: outCell, elems: es };
}

/* v43 census pins. */
export function playerHud9c0870Va() { return PLAYERHUD_9C0870_VA; }
export function playerHud9c0870RetVa() { return PLAYERHUD_9C0870_RET_VA; }
export function playerHud9c0870RetExhaustVa() { return PLAYERHUD_9C0870_RET_EXHAUST_VA; }
export function playerHud9c0870RetClearedVa() { return PLAYERHUD_9C0870_RET_CLEARED_VA; }
export function playerHud9c0870NextVa() { return PLAYERHUD_9C0870_NEXT_VA; }
export function playerHud9c0870RetImm() { return PLAYERHUD_9C0870_RET_IMM; }
export function playerHud9c0870IndexOff() { return PLAYERHUD_9C0870_INDEX_OFF; }
export function playerHud9c0870VecBeginOff() { return PLAYERHUD_9C0870_VEC_BEGIN_OFF; }
export function playerHud9c0870VecEndOff() { return PLAYERHUD_9C0870_VEC_END_OFF; }
export function playerHud9c0870Stride() { return PLAYERHUD_9C0870_STRIDE; }
export function playerHud9c0870DivMagic() { return PLAYERHUD_9C0870_DIV_MAGIC; }
export function playerHud9c0870DivShift() { return PLAYERHUD_9C0870_DIV_SHIFT; }
export function playerHud9c0870FlagAOff() { return PLAYERHUD_9C0870_FLAG_A_OFF; }
export function playerHud9c0870FlagBOff() { return PLAYERHUD_9C0870_FLAG_B_OFF; }
export function playerHud9c0870EmptyBits() { return PLAYERHUD_9C0870_EMPTY_BITS; }
export function playerHud9c0870Caller1Va() { return PLAYERHUD_9C0870_CALLER1_VA; }
export function playerHud9c0870Caller2Va() { return PLAYERHUD_9C0870_CALLER2_VA; }
export function playerHud9c0870Caller3Va() { return PLAYERHUD_9C0870_CALLER3_VA; }
export function playerHud9c0870Caller4Va() { return PLAYERHUD_9C0870_CALLER4_VA; }


/* ---------------- ABI v44: 0x009c2370 probe-threshold gate ----------
   VA 0x009c2370..0x009c2391 ret @0x9c2390. thiscall, no stack args.
   ALWAYS-PATH indirect probe [[ecx]+0x10] (vtbl slot 4), float in st0
   (recapture f_bits — v39/v40 precedent); comiss vs [0xbaa454]=1.0f +
   setae: 1 iff ORDERED f >= 1.0f (NaN -> 0). ZERO E8 callers;
   address-taken only via .rdata vtables 0xb7ed2c/0xb7ed44 (adjacent to
   the v40 visitors' slots). Band census: #2 0x9c23a0 HOST (QPC stamp). */

export const PLAYERHUD_9C2370_VA = 0x009c2370;
export const PLAYERHUD_9C2370_RET_VA = 0x009c2390;
export const PLAYERHUD_9C2370_NEXT_VA = 0x009c23a0;
export const PLAYERHUD_9C2370_PROBE_SLOT = 4;
export const PLAYERHUD_9C2370_PROBE_VTBL_OFF = 0x10;
export const PLAYERHUD_9C2370_VTABLE_REF_RDATA_A = 0x00b7ed2c;
export const PLAYERHUD_9C2370_VTABLE_REF_RDATA_B = 0x00b7ed44;
export const PLAYERHUD_9C2370_GATE_RDATA = 0x00baa454;
export const PLAYERHUD_9C2370_GATE_BITS = 0x3f800000; /* 1.0f */

/** 1 iff ordered f32(f_bits) >= 1.0f (comiss/setae; NaN -> 0). */
export function playerHud9c2370Gate(fBits) {
  const f = playerHudBitsToF32(fBits >>> 0);
  return f >= 1 ? 1 : 0;
}

/* v44 census pins. */
export function playerHud9c2370Va() { return PLAYERHUD_9C2370_VA; }
export function playerHud9c2370RetVa() { return PLAYERHUD_9C2370_RET_VA; }
export function playerHud9c2370NextVa() { return PLAYERHUD_9C2370_NEXT_VA; }
export function playerHud9c2370ProbeSlot() { return PLAYERHUD_9C2370_PROBE_SLOT; }
export function playerHud9c2370ProbeVtblOff() { return PLAYERHUD_9C2370_PROBE_VTBL_OFF; }
export function playerHud9c2370VtableRefRdataA() { return PLAYERHUD_9C2370_VTABLE_REF_RDATA_A; }
export function playerHud9c2370VtableRefRdataB() { return PLAYERHUD_9C2370_VTABLE_REF_RDATA_B; }
export function playerHud9c2370GateRdata() { return PLAYERHUD_9C2370_GATE_RDATA; }
export function playerHud9c2370GateBits() { return PLAYERHUD_9C2370_GATE_BITS; }