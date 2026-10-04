function roomNegssV44(v) {
  return peBitsToF32(peF32ToBits(v) ^ 0x80000000);
}

function peF32ToBits(v) {
  const f = new Float32Array(1);
  f[0] = Math.fround(v);
  return new Uint32Array(f.buffer)[0] >>> 0;
}

function peBitsToF32(bits) {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
}

function roomPeF32BitsV41(bits) {
  return peBitsToF32(bits);
}
function roomCvttss2siV41(value) {
  return room7230Cvttss2si(value);
}
function builtinSqrt(x) {
  return Math.sqrt(x);
}
function stepRoomB5EntityRng(seed3dc, shift3e0, shift3e4, shift3e8) {
  return roomB5EntityRngStep(seed3dc, shift3e0, shift3e4, shift3e8);
}

/** Independent JS oracle for Room pure helpers peeled from VA 0x00802980. */

export const ROOM_PURE_ABI_VERSION = 88;

/** v54 — FUN_00428b20 (B15 rain spawn relay) pure stdcall arg-relayout law.
    PE: 8 pushes (0, a7..a1 R->L) then call 0x006fe410; ret 0x1c = 7 args;
    ecx untouched. The callee's ordered stack frame is {a1..a7, 0}. */
export const ROOM_SPAWN_428B20_VA = 0x00428b20;
export const ROOM_SPAWN_428B20_RET_VA = 0x00428b45;
export const ROOM_SPAWN_428B20_END_VA = 0x00428b48;
export const ROOM_SPAWN_428B20_CALL_VA = 0x00428b3d;
export const ROOM_SPAWN_428B20_CALLEE_VA = 0x006fe410;
export const ROOM_SPAWN_428B20_ARITY = 7;
export const ROOM_SPAWN_428B20_FRAME_DEPTH = 8;
export const ROOM_SPAWN_428B20_LEADING_ZERO = 0;

/** Ordered callee frame slot selector (slot 0 = lowest address = a1; slot 7
    = the leading 0 pushed first at 0x00428b26). Args forwarded verbatim —
    never masked. Out-of-contract index (>= 8) reads nothing in PE -> 0. */
export function roomSpawn428b20FrameAt(index, a1, a2, a3, a4, a5, a6, a7) {
  switch (index >>> 0) {
    case 0: return a1 >>> 0;
    case 1: return a2 >>> 0;
    case 2: return a3 >>> 0;
    case 3: return a4 >>> 0;
    case 4: return a5 >>> 0;
    case 5: return a6 >>> 0;
    case 6: return a7 >>> 0;
    case 7: return ROOM_SPAWN_428B20_LEADING_ZERO >>> 0;
    default: return 0;
  }
}

/** Full relayout struct law (C++ IsaacRoomSpawn428b20, 64B pack 1). */
export function roomSpawn428b20Relayout(a1, a2, a3, a4, a5, a6, a7) {
  const frame = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 7; i++) frame[i] = arguments[i] >>> 0;
  frame[7] = ROOM_SPAWN_428B20_LEADING_ZERO >>> 0;
  return {
    frame,
    arity: ROOM_SPAWN_428B20_ARITY,
    frameDepth: ROOM_SPAWN_428B20_FRAME_DEPTH,
    hostCalleeVa: ROOM_SPAWN_428B20_CALLEE_VA,
    relaysEcx: 1,
    va: ROOM_SPAWN_428B20_VA,
    retVa: ROOM_SPAWN_428B20_RET_VA,
    callVa: ROOM_SPAWN_428B20_CALL_VA,
  };
}

/* ------------------------------------------------------------------ v55 - */
/* B15 rain shuffle/spawn loop CF (0x00802c20..0x00802e0d) + spawn-site arg
   provenance (0x00802daf..0x00802dc4), helpers ABI v55. PE listings
   cpu-dump/00802a80.txt + cpu-dump/00802c80.txt. Fisher-Yates over 0x78-byte
   buffer slots; the seed lives in esi and is carried across iterations
   (0x00802e02): seed_{i+1} = xorshift(xorshift(seed_i)). Two xorshift
   steps per iteration; spawn relay FUN_00428b20 (v54) fed from slot fields
   + the host 0x00813520 search result; FUN_007ef420 bind stays host. All
   inputs blob-gated: host supplies seed0 / spawn_count / slot fields. */

export const ROOM_B15_RAIN_LOOP_HEAD_VA = 0x00802c20;
export const ROOM_B15_RAIN_LOOP_EXIT_VA = 0x00802e0d;
export const ROOM_B15_RAIN_SPAWN_SITE_VA = 0x00802dc4;
export const ROOM_B15_RAIN_BIND_SITE_VA = 0x00802dd5;
export const ROOM_B15_RAIN_POSITION_SITE_VA = 0x00802da4;
export const ROOM_B15_RAIN_SEED_LOAD_VA = 0x00802bf0;
export const ROOM_B15_RAIN_STRIDE = 0x78;
export const ROOM_B15_RAIN_LOOP_MAX_STEPS = 8;
export const ROOM_B15_RAIN_POS_VEC_PTR = 0x00c7b640;
export const ROOM_B15_RAIN_GAME_GLOBAL = 0x00c71678;
export const ROOM_B15_RAIN_SLOT_FIELD_34_OFF = 0x34;
export const ROOM_B15_RAIN_ENTITY_MARK_FIELD = 0x32c;
export const ROOM_B15_RAIN_ENTITY_MARK_VALUE = 0xffffffff;
export const ROOM_B15_RAIN_HOST_VA_BIND = 0x007ef420;
export const ROOM_B15_RAIN_HOST_VA_POSITION = 0x00813520;
export const ROOM_B15_RAIN_SEED_FATAL_PRE_CORNER = 2;
export const ROOM_B15_RAIN_SEED_FATAL_PRE_SHUFFLE = 1;
export const ROOM_B15_RAIN_SEED_OK = 0;

/** One rain-tail loop iteration (0x00802c20..0x00802c81 + loop tail). */
export function roomB15RainLoopStep({ seedIn, index, spawnCount }) {
  const out = {};
  out.remaining = ((spawnCount | 0) - (index | 0)) | 0;  /* sub eax,ecx */
  out.seedIn = seedIn >>> 0;
  out.seedShuffle = 0;
  out.shuffleRem = 0;
  out.needsSwap = 0;
  out.swapIndex = index | 0;
  out.slotOffset = Math.imul(index | 0, ROOM_B15_RAIN_STRIDE) | 0;
  out.swapOffset = out.slotOffset;
  out.seedCorner = 0;
  out.seedOut = 0;
  out.nextIndex = ((index | 0) + 1) | 0;                  /* inc ecx */
  out.continueLoop = (out.nextIndex < (spawnCount | 0)) ? 1 : 0; /* jge */
  out.seedFatal = ROOM_B15_RAIN_SEED_OK;

  if (roomB1SeedNonzero(seedIn) == 0) {
    out.seedFatal = ROOM_B15_RAIN_SEED_FATAL_PRE_SHUFFLE;
    return out;
  }
  const seedShuffle = roomB1RngXorshift(seedIn);
  out.seedShuffle = seedShuffle;
  const rem = roomB1ShuffleRemainder(seedShuffle, out.remaining);
  out.shuffleRem = rem;
  out.needsSwap = roomB1ShuffleNeedsSwap(rem);
  out.swapIndex = roomB1ShuffleSwapIndex(index, rem);
  out.swapOffset = Math.imul(out.swapIndex, ROOM_B15_RAIN_STRIDE) | 0;
  if (roomB1SeedNonzero(seedShuffle) == 0) {
    out.seedFatal = ROOM_B15_RAIN_SEED_FATAL_PRE_CORNER;
    return out;
  }
  const seedCorner = roomB1RngXorshift(seedShuffle);
  out.seedCorner = seedCorner;
  out.seedOut = seedCorner;                                /* esi carry */
  return out;
}

/** Chained rain loop: seed carried across iterations, stride 0x78, exit
    index >= spawn_count. Returns the steps array. */
export function roomB15RainLoopWalk(
    seed0, spawnCount, capacity = 0x7fffffff) {
  const count = (spawnCount | 0) > 0 ? (spawnCount | 0) : 0;
  const n = Math.min(count, capacity >>> 0);
  const steps = [];
  let seed = seed0 >>> 0;
  for (let i = 0; i < n; i++) {
    const s = roomB15RainLoopStep({ seedIn: seed, index: i, spawnCount });
    steps.push(s);
    if (s.seedFatal !== ROOM_B15_RAIN_SEED_OK) break;
    seed = s.seedOut;
  }
  return steps;
}

/** Spawn-site arg provenance (0x00802daf..0x00802dc4). Blob-gated: host
    supplies the slot-field values + search_result (host 0x00813520). */
export function roomB15RainSpawnArgs(
    { slotF0, slotF4, slotF8, slotF34, searchResult }) {
  return {
    relayVa: ROOM_B15_RAIN_SPAWN_SITE_VA,
    a1: slotF0 >>> 0,
    a2: slotF4 >>> 0,
    a3: searchResult >>> 0,
    a4: ROOM_B15_RAIN_POS_VEC_PTR,
    a5: 0,
    a6: slotF8 >>> 0,
    a7: slotF34 >>> 0,
    relaysEcx: 1,
    bindVa: ROOM_B15_RAIN_HOST_VA_BIND,
    bindEntityFirst: 1,
    bindSlotSecond: 1,
    entityMarkField: ROOM_B15_RAIN_ENTITY_MARK_FIELD,
    entityMarkValue: ROOM_B15_RAIN_ENTITY_MARK_VALUE,
  };
}

/** PE create immediates for H5 FUN_00824a70 residual (host still owns calls). */
export const ROOM_AMBIENT_824A70_EFFECT_TYPE = 0x3e8;
export const ROOM_AMBIENT_824A70_EFFECT_VARIANT = 0x8a;
export const ROOM_AMBIENT_824A70_LAYER_INDEX = 0;
export const ROOM_AMBIENT_824A70_ANM_DATA_PTR = 0x00b1bc54;
/** PE push 1 before opaque_call_0040a5d0 (A1) @ 0x00824ce7. */
export const ROOM_AMBIENT_824A70_A1_ARG = 1;

/** LC ColorMod offsets after host ANM2::GetLayer (create residual ABI v33). */
export const ROOM_AMBIENT_824A70_LAYER_COLOR_OFF = 0x48;
export const ROOM_AMBIENT_824A70_LAYER_COLOR_ZERO16_OFF = 0x10;
export const ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_QWORD_OFF = 0x20;
export const ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_DWORD_OFF = 0x28;

/** Create residual deepen imms (helpers ABI 39 create-only; h5-create-deepen/). */
export const ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF = 0x48;
export const ROOM_AMBIENT_824A70_ANIM_COUNT_OFF = 0x30;
export const ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF = 0x34;
export const ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF = 0x44;
export const ROOM_AMBIENT_824A70_A2_THIS_OFF = 0x30;
export const ROOM_AMBIENT_824A70_VCALL_OFF = 0xc;
export const ROOM_AMBIENT_824A70_CREATE_ARG_ZERO = 0;
export const ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL = 0x00c71678;

/** Create residual host VAs (targets + call sites; create-only). */
export const ROOM_AMBIENT_824A70_HOST_VA_CREATE = 0x006fe410;
export const ROOM_AMBIENT_824A70_HOST_VA_CREATE_SITE = 0x00824cbd;
export const ROOM_AMBIENT_824A70_HOST_VA_CREATE_START = 0x00824c9c;
export const ROOM_AMBIENT_824A70_HOST_VA_A0 = 0x0040bcd0;
export const ROOM_AMBIENT_824A70_HOST_VA_A0_SITE = 0x00824cd0;
export const ROOM_AMBIENT_824A70_HOST_VA_A1 = 0x0040a5d0;
export const ROOM_AMBIENT_824A70_HOST_VA_A1_SITE = 0x00824cf0;
export const ROOM_AMBIENT_824A70_HOST_VA_A2 = 0x00408e00;
export const ROOM_AMBIENT_824A70_HOST_VA_A2_SITE = 0x00824d0a;
export const ROOM_AMBIENT_824A70_HOST_VA_GETLAYER = 0x0040b220;
export const ROOM_AMBIENT_824A70_HOST_VA_GETLAYER_SITE = 0x00824e8f;
export const ROOM_AMBIENT_824A70_HOST_VA_VCALL_SITE = 0x00824ec4;

/** PE genrand CALL sites in FUN_00824a70 body loop (helpers ABI v33). */
export const ROOM_AMBIENT_824A70_HOST_VA_R0 = 0x00824bb3;
export const ROOM_AMBIENT_824A70_HOST_VA_R1 = 0x00824bee;
export const ROOM_AMBIENT_824A70_HOST_VA_R2 = 0x00824c50;
export const ROOM_AMBIENT_824A70_HOST_VA_R3 = 0x00824c97;
export const ROOM_AMBIENT_824A70_HOST_VA_R4 = 0x00824cdc;
export const ROOM_AMBIENT_824A70_HOST_VA_R5 = 0x00824d1a;
export const ROOM_AMBIENT_824A70_HOST_VA_R6 = 0x00824d2b;
export const ROOM_AMBIENT_824A70_HOST_VA_R7 = 0x00824e50;
export const ROOM_AMBIENT_824A70_HOST_VA_GENRAND = 0x006eef60;
export const ROOM_AMBIENT_824A70_HOST_VA_LOOP = 0x00824ec7;
export const ROOM_AMBIENT_824A70_HOST_VA_EPILOG = 0x00824ed2;
/** Always-on genrand dwords per loop (R0,R1,R2,R3,R5,R6,R7). Cond R4 extra. */
export const ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP = 7;
export const ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP = 8;
export const ROOM_DOOR_SLOT_COUNT = 8;

/** PE float32 bit patterns from tools/isaac-ng.unpacked.exe (hash 5129DF72). */
const PE_WATER_STEP = (() => {
  const u = new Uint32Array([0x3dcccccd]);
  return new Float32Array(u.buffer)[0];
})();
const PE_WATER_CEILING = (() => {
  const u = new Uint32Array([0x3f800000]);
  return new Float32Array(u.buffer)[0];
})();
const PE_LAVA_DECAY = (() => {
  const u = new Uint32Array([0x3f6b851f]);
  return new Float32Array(u.buffer)[0];
})();
const PE_LAVA_ZERO = (() => {
  const u = new Uint32Array([0x3a83126f]);
  return new Float32Array(u.buffer)[0];
})();
const PE_WATER_BAND_LO = (() => {
  const u = new Uint32Array([0x3f63d70a]);
  return new Float32Array(u.buffer)[0];
})();
const PE_WATER_BAND_HI = (() => {
  const u = new Uint32Array([0x3f68f5c3]);
  return new Float32Array(u.buffer)[0];
})();

export function stepRoomCameraFxLerp(input) {
  const state = Object.assign({}, input || {});
    if (state.counter70d8 < state.limit70dc) {
      state.counter70d8 += 1;
      state.value70cc = Math.fround(Math.fround(state.value70cc) + Math.fround(state.step70d4));
    }
    if (state.counter70f4 < state.limit70f8) {
      state.value70e8 = Math.fround(Math.fround(state.value70e8) + Math.fround(state.step70f0));
      state.counter70f4 += 1;
    }
  return state;
}

export function stepRoomClearDelay(input) {
  const state = Object.assign({}, input || {});
    let alive = state.aliveA + state.aliveB;
    if (alive < 0) alive = 0;
    let enemies = (state.enemiesPresent != 0);
    if (enemies != 0 || state.greedWaveTimer != 0) {
      let delay = 10;
      if (state.roomType == 0x10 && state.roomSubtype == 3) {
        delay = 20;
      }
      state.roomClearDelay = delay;
    } else if (state.roomClearDelay > 0) {
      state.roomClearDelay -= 1;
    }
  return state;
}

/** B0: mov byte ptr [Room+0x7220], 0. Input is zero-extended byte. */
export function stepRoomEntryClear7220(byte7220) {
  return 0;
}

/** B6/B15/B17/B17-area 7230: if (counter > 0) counter -= 1 (signed int32). */
export function stepRoomCountdownDecIfPositive(counter) {
  counter = counter | 0;
    if (counter > 0) {
      counter -= 1;
    }
  return counter;
}

/** B2 collectible timer: if (counter >= 0) counter -= 1 (signed int32; 0 → -1). */
export function stepRoomCountdownDecIfNonnegative(counter) {
  counter = counter | 0;
    if (counter >= 0) {
      counter -= 1;
    }
  return counter;
}

/** Mid-tail Room+0x706c: if (counter > 0) { counter -= 1; if (counter < 1) counter = -1; }. */
export function stepRoomCountdownDecExpireNeg1(counter) {
  counter = counter | 0;
    if (counter > 0) {
      let next = counter - 1;
      counter = next < 1 ? -1 : next;
    }
  return counter;
}

/** B10: Room+0x7224 = max(0, count12c8 + count12cc) with signed int32 wrap on sum. */
export function stepRoomBossCountSnapshot(count12c8, count12cc) {
  let result = 0;
    let sum = (count12c8 + count12cc) | 0;
    result = sum > 0 ? sum : 0;
  return result;
}

/**
 * B16 pure float shell for Room+0x7240 / +0x7740 plus pure descriptor |0x100 band.
 * Host residual: FUN_009305f0(0x123) is challenge0x123 input; type-7 grid walks
 * after pure |0x100, lava band grid, FUN_00823540 stay residual.
 */
export function stepRoomWaterLavaFloat(input) {
  const state = Object.assign({}, input || {});
    let water_step = peF32Bits(0x3dcccccd);
    let water_ceiling = peF32Bits(0x3f800000);
    let lava_decay = peF32Bits(0x3f6b851f);
    let lava_zero = peF32Bits(0x3a83126f);
    let water_band_lo = peF32Bits(0x3f63d70a);
    let water_band_hi = peF32Bits(0x3f68f5c3);
    let zero = Math.fround(0.0);

    if (state.challenge0x123 != 0 && state.roomType8 != 0x10) {
      let water = Math.fround(Math.fround(state.waterAmount7240) + water_step);

      if (water_band_lo < water && water < water_band_hi) {
        state.roomDescFlags44 |= 0x100;
      }
      if (water_ceiling < water) {
        water = water_ceiling;
      }
      state.waterAmount7240 = water;
    }

    if (zero < state.waterAmount7240 && zero < state.lavaIntensity7740) {
      let lava = Math.fround(Math.fround(state.lavaIntensity7740) * lava_decay);
      if (lava < lava_zero) {
        lava = zero;
      }
      state.lavaIntensity7740 = lava;
    }
  return state;
}

/**
 * Room::TriggerClear (VA 0x008068f0) pure entry only:
 */
export function stepRoomTriggerClearEntry(input) {
  const state = Object.assign({}, input || {});
    state.roomDescFlags44 |= 1;

    /* Exact machine: inc word ptr [desc+0x4a] (unsigned 16-bit wrap, stored as int16). */
    state.roomDescClearCount4a =
        (((state.roomDescClearCount4a + 1) & 0xffff) << 16) >> 16;
  return state;
}

/**
 * Room::TriggerClear residual pure gates (after pure entry).
 * PE Game[0x9a72] at byte offset Game+0x269c8: 2=Greed, 3=Greedier.
 * Flags bit7 from post-entry roomDescFlags44 (entry only ORs bit0).
 */
export function roomTriggerClearIsGreedMode(difficulty269c8) {
    return (difficulty269c8 == 2 || difficulty269c8 == 3) ? 1 : 0;
}

export function roomTriggerClearNeedsNonGreedHost(difficulty269c8) {
  return roomTriggerClearIsGreedMode(difficulty269c8) === 0 ? 1 : 0;
}

export function roomTriggerClearNeedsAwardsBit7Walk(roomDescFlags44) {
  return (((roomDescFlags44 >>> 0) >> 7) & 1) === 0 ? 1 : 0;
}

/**
 * FUN_00710dd0 pure early-out prologue. Returns 1 if machine returns immediately.
 * Machine: (flags&0x10 && field8!=8) || (flags&0x20 && field8==4) || fieldC==2 || field8==7.
 */
export function stepDoorHelper710dd0EarlyOut(field3a0, field8, fieldC) {
    if ((field3a0 & 0x10) != 0 && field8 != 8) return 1;
    if ((field3a0 & 0x20) != 0 && field8 == 4) return 1;
    if (fieldC == 2) return 1;
    if (field8 == 7) return 1;
    return 0;
}

/**
 * FUN_0070ee40 pure early-out. Returns 1 if machine returns immediately.
 * Machine: door+0x149 byte == 0 → epilog (skip entry clear + ANM2/host body).
 * Freestanding only; nested inside 710dd0 OPEN_TAIL residual.
 */
export function stepDoorHelper70ee40EarlyOut(field149Byte) {
  return ((field149Byte ?? 0) & 0xff) === 0 ? 1 : 0;
}

/** Normalize 8 resolved Room+0x724 door slots from runtime inputs. */
export function normalizeDoorSlots(inputSlots) {
  const src = inputSlots || [];
  const out = [];
  for (let i = 0; i < ROOM_DOOR_SLOT_COUNT; i++) {
    const s = src[i] || {};
    out.push({
      present: (s.present ?? 0) | 0,
      field3a0: (s.field3a0 ?? 0) >>> 0,
      field8: (s.field8 ?? 0) | 0,
      fieldC: (s.fieldC ?? 0) | 0,
    });
  }
  return out;
}

/** Clear-path door loop: any present slot fails early-out → host residual. */
export function doorSlots710dd0AnyNeedsHost(inputSlots) {
    if (inputSlots == null) return 0;
    for (let i = 0; i < ROOM_DOOR_SLOT_COUNT; ++i) {
      const slot = inputSlots[i];
      if (slot == null || slot.present == 0) continue;
      if (stepDoorHelper710dd0EarlyOut(slot.field3a0, slot.field8,
                                             slot.fieldC) == 0) {
        return 1;
      }
    }
    return 0;
}

/** Type-5 door loop: any present field_c==5 failing early-out → host residual. */
export function doorSlots710dd0AnyType5NeedsHost(inputSlots) {
    if (inputSlots == null) return 0;
    for (let i = 0; i < ROOM_DOOR_SLOT_COUNT; ++i) {
      const slot = inputSlots[i];
      if (slot == null || slot.present == 0) continue;
      if (slot.fieldC != 5) continue;
      if (stepDoorHelper710dd0EarlyOut(slot.field3a0, slot.field8,
                                             slot.fieldC) == 0) {
        return 1;
      }
    }
    return 0;
}

const PE_LAVA_BAND = (() => {
  const u = new Uint32Array([0x3e4ccccd]);
  return new Float32Array(u.buffer)[0];
})();

/** Type-7 grid residual after pure |0x100 band block and (flags>>5)&1. */
export function roomB16NeedsType7Grid(challenge0x123, roomType8, waterPre, flagsPost) {
    if (challenge0x123 == 0 || roomType8 == 0x10) return 0;
    let water_step = peF32Bits(0x3dcccccd);
    let water_band_lo = peF32Bits(0x3f63d70a);
    let water_band_hi = peF32Bits(0x3f68f5c3);
    let water_post_add = waterPre + water_step;

    if (!(water_band_lo < water_post_add && water_post_add < water_band_hi)) return 0;
    return ((flagsPost >> 5) & 1) != 0 ? 1 : 0;
}

/** Lava band grid: new < DAT_00baa198 && DAT_00baa198 <= old. */
export function roomB16NeedsLavaBandGrid(lavaPre, lavaPostMul) {
    let lava_band = peF32Bits(0x3e4ccccd);
    let zero = Math.fround(0.0);
    if (!(zero < lavaPre)) return 0;
    return (lavaPostMul < lava_band && !(lavaPre < lava_band)) ? 1 : 0;
}

/** FUN_00823540 residual when post-step water > 0 and pre lava > 0. */
export function roomB16Needs823540(waterPostStep, lavaPre) {
  return 0 < Math.fround(waterPostStep) && 0 < Math.fround(lavaPre) ? 1 : 0;
}

/** Aggregate B16 grid host residual gate (type-7 OR lava block). */
export function roomB16NeedsGridHost(challenge0x123, roomType8, waterPre, lavaPre, flagsPost) {
    let water_step = peF32Bits(0x3dcccccd);
    let water_ceiling = peF32Bits(0x3f800000);
    let water_post = waterPre;
    if (challenge0x123 != 0 && roomType8 != 0x10) {
      water_post = waterPre + water_step;
      if (water_ceiling < water_post) water_post = water_ceiling;
    }
    if (roomB16NeedsType7Grid(challenge0x123, roomType8, waterPre,
                                        flagsPost) != 0) {
      return 1;
    }

    return roomB16Needs823540(water_post, lavaPre);
}

/**
 * FUN_0074efd0 room-callsite gate (VA 0x0074efd0..0x0074f02e, this=Game at the
 * 0x8233c7 grid site). Transcribed branch-by-branch from the instruction stream:
 * difficulty 2/3 -> 0; unsigned (stage-1) <= 5 && flags&0x10000 -> 0; stage_type
 * not 4/5 -> 0; stage==4 -> 1; stage!=3 -> 0; else bit1 of the typed-host
 * 0x748490 poll-combine byte decides.
 */
export function roomB16MineshaftGate(difficulty269c8, stage0, stageType4,
                                     flags2654c, pollCombineByte) {
  if (difficulty269c8 === 2 || difficulty269c8 === 3) return 0;
  if (((stage0 - 1) >>> 0) <= 5) {
    if ((flags2654c & 0x10000) !== 0) return 0;
  }
  if (stageType4 !== 4 && stageType4 !== 5) return 0;
  if (stage0 === 4) return 1;
  if (stage0 !== 3) return 0;
  return (pollCombineByte & 0x2) !== 0 ? 1 : 0;
}

/**
 * FUN_00823370 grid math (VA 0x00823370..0x00823536, this=Room). Pure over
 * captured fields; typed mineshaft gate + Game+0x1830c passed in. Every f32 op
 * Math.fround-rounded; the lava-band divss converts desc_54 (int32) and
 * (h-2)*(w-2) (int32 wrap) via cvtdq2ps. Returns the 6-float out array.
 */
export function roomB16GridStep(in6, roomType8, descFlags44, desc54, room1d18,
                                gridWc, gridH10, lava7740, mineshaftAl,
                                transition1830c) {
  const f = Math.fround;
  const out = [f(in6[0]), f(in6[1]), f(in6[2]), f(in6[3]), f(in6[4]), f(in6[5])];
  const lerpTarget = peF32Bits(0x3f800000); /* DAT_00baa454 = 1.0f */
  const lerpFactor = peF32Bits(0x3f400000); /* DAT_00baa380 = 0.75f */
  const zero = f(0.0);
  const gateOpen =
    roomType8 === 7 || roomType8 === 8 || roomType8 === 0x1d ||
    (mineshaftAl !== 0 && transition1830c === 1);
  if (gateOpen) {
    for (let i = 0; i < 4; ++i) {
      const d0 = f(lerpTarget - out[i]);
      const m0 = f(d0 * lerpFactor);
      out[i] = f(m0 + out[i]);
    }
    const d4 = f(zero - out[4]);
    const m4 = f(d4 * lerpFactor);
    out[4] = f(m4 + out[4]);
    const d5 = f(lerpTarget - out[5]);
    const m5 = f(d5 * lerpFactor);
    out[5] = f(m5 + out[5]);
  }
  if (((descFlags44 >>> 0) >> 9 & 1) !== 0) {
    out[4] = f(out[4] + peF32Bits(0x3cf5c28f)); /* DAT_00baa0a0 = 0.03f */
  }
  if ((room1d18 >>> 0) === 0x20 && (((descFlags44 >>> 0) >> 5) & 1) !== 0) {
    const prod = Math.imul(gridH10 - 2, gridWc - 2); /* int32 wrap */
    const t = f(f(desc54 | 0) / f(prod));            /* divss */
    const v = f(t * f(lava7740));                    /* mulss lava */
    out[0] = f(out[0] - v);
    const vc2 = f(v * peF32Bits(0x3ecccccd)); /* 0.4f */
    out[1] = f(out[1] + vc2);
    out[2] = f(out[2] + vc2);
    const vc3 = f(v * peF32Bits(0x3ee66666)); /* 0.45f */
    out[3] = f(out[3] - vc3);
    const vc4 = f(v * peF32Bits(0x3e4ccccd)); /* 0.2f */
    out[5] = f(out[5] + vc4);
  }
  return out;
}

/**
 * FUN_00823540 wrapper al gate: al = (byte[Game+0x183a0]==0 &&
 * byte[Game+0x269e9]==0). Low-byte tests (cmp byte).
 */
export function roomB16SprayGateAl(byte183a0, byte269e9) {
  return ((byte183a0 & 0xff) === 0 && (byte269e9 & 0xff) === 0) ? 1 : 0;
}

/**
 * FUN_007067c0 water-spray vector math (VA 0x007067c0..0x007068be, no callees).
 * Returns { gate, prev, vel }: inactive copies prev[0..3]=cur[0..3] (gate byte
 * untouched -> 0); active computes vel[i] = |cur[i]-prev[i]| * factor with the
 * andps 0x7fffffff abs (sign-bit cleared on the f32 bits).
 */
export function roomB16SprayStep(prev6, cur6, factor, active) {
  const f = Math.fround;
  const prev = prev6.map((x) => f(x));
  const cur = cur6.map((x) => f(x));
  if ((active & 0xff) === 0) {
    prev[0] = cur[0];
    prev[1] = cur[1];
    prev[2] = cur[2];
    prev[3] = cur[3];
    return { gate: 0, prev, vel: [0, 0, 0, 0, 0, 0] };
  }
  const vel = [];
  for (let i = 0; i < 6; ++i) {
    const d = f(cur[i] - prev[i]); /* subss */
    const absBits = peF32ToBits(d) & 0x7fffffff; /* andps abs */
    vel.push(f(peBitsToF32(absBits) * f(factor))); /* mulss xmm7 */
  }
  return { gate: 1, prev, vel };
}

/** Mid-tail Room+0x706c expire host FUN_008158a0 when pre>0 && (pre-1)<1. */
export function room706cNeedsExpireHost(preTimer706c) {
    if (!(preTimer706c > 0)) return 0;
    let next = preTimer706c - 1;
    return next < 1 ? 1 : 0;
}

/** Mid-tail Room+0x7230 spawn residual when pre>0 && pre%5==0 (signed). */
export function room7230NeedsSpawnHost(preTimer7230) {
    if (!(preTimer7230 > 0)) return 0;
    return (preTimer7230 % 5) == 0 ? 1 : 0;
}

/** B18 entity-list walk when pre-clear Room+0x7894 low byte nonzero. */
export function roomB18NeedsEntityWalkHost(roomFlag7894) {
  return ((roomFlag7894 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/* ---- B18 entity residual pure islands (helpers ABI v29 freestanding). ---- */

export const ROOM_B18_ENTITY_TYPE5 = 5;
export const ROOM_B18_ENTITY_TYPE1 = 1;
export const ROOM_B18_TYPE_RANGE_BASE = 10;
export const ROOM_B18_TYPE_RANGE_SPAN = 0x3de;
export const ROOM_B18_MODE_GATE = 2;
export const ROOM_B18_RTTI_SRC_PTR = 0x00c5d5dc;
export const ROOM_B18_RTTI_DST_PTR = 0x00c5d6ac;
export const ROOM_B18_ROOM_VEC_OFF = 0x125c;
export const ROOM_B18_ROOM_COUNT_OFF = 0x1264;
export const ROOM_B18_ENTITY_TYPE_OFF = 0x28;
export const ROOM_B18_ROOM_FLAG_OFF = 0x7894;
export const ROOM_B18_GAME_MODE_OFF = 0x26614;

export const ROOM_B18_HOST_VA_FLAG_TEST = 0x00805527;
export const ROOM_B18_HOST_VA_WALK_START = 0x00805540;
export const ROOM_B18_HOST_VA_TYPE5 = 0x006e17c0;
export const ROOM_B18_HOST_VA_RTTI = 0x00af08b1;
export const ROOM_B18_HOST_VA_PATH_B = 0x006da530;
export const ROOM_B18_HOST_VA_FLAG_CLEAR = 0x008055a0;
export const ROOM_B18_HOST_VA_NEXT = 0x008055a7;

export const ROOM_B18_ACTION_SKIP = 0;
export const ROOM_B18_ACTION_TYPE5 = 1;
export const ROOM_B18_ACTION_RTTI_CANDIDATE = 2;

export const ROOM_B18_RESIDUAL_NONE = 0;
export const ROOM_B18_RESIDUAL_PURE_COMPLETE = 1;
export const ROOM_B18_RESIDUAL_HOST_WALK = 2;
export const ROOM_B18_RESIDUAL_MONOLITHIC = 3;

/** Empty entity list (Room+0x1264 == 0) → pure-complete walk. */
export function roomB18ListEmpty(entityCount1264) {
  return (entityCount1264 >>> 0) === 0 ? 1 : 0;
}

/** Loop continue: index+1 < count (unsigned). */
export function roomB18ListContinue(index, entityCount1264) {
    let next = index + 1;
    return next < entityCount1264 ? 1 : 0;
}

export function roomB18EntityIsType5(entityType28) {
  return (entityType28 | 0) === ROOM_B18_ENTITY_TYPE5 ? 1 : 0;
}

/** Game+0x26614 signed >= 2 && type == 1. */
export function roomB18EntityType1ModeGate(timedTransitionCleanupMode, entityType28) {
    if (!(timedTransitionCleanupMode >= ROOM_B18_MODE_GATE)) return 0;
    return entityType28 == ROOM_B18_ENTITY_TYPE1 ? 1 : 0;
}

/** (type - 10) unsigned < 0x3de → type in [10, 999]. */
export function roomB18EntityTypeInRange(entityType28) {
    const delta =
        ((entityType28) - (ROOM_B18_TYPE_RANGE_BASE)) >>> 0;
    return delta < (ROOM_B18_TYPE_RANGE_SPAN >>> 0) ? 1 : 0;
}

export function roomB18EntityPathBCandidate(timedTransitionCleanupMode, entityType28) {
    if (roomB18EntityType1ModeGate(timedTransitionCleanupMode,
                                              entityType28) != 0) {
      return 1;
    }
    return roomB18EntityTypeInRange(entityType28);
}

/** Pure per-entity action: TYPE5 / RTTI_CANDIDATE / SKIP. */
export function roomB18EntityAction(timedTransitionCleanupMode, entityType28) {
    if (roomB18EntityIsType5(entityType28) != 0) {
      return ROOM_B18_ACTION_TYPE5;
    }
    if (roomB18EntityPathBCandidate(timedTransitionCleanupMode,
                                               entityType28) != 0) {
      return ROOM_B18_ACTION_RTTI_CANDIDATE;
    }
    return ROOM_B18_ACTION_SKIP;
}

/** After host RTTI: nonnull → FUN_006da530. */
export function roomB18PathBNeedsHost(rttiCastResult) {
  return (rttiCastResult >>> 0) !== 0 ? 1 : 0;
}

/**
 * Residual plan when outer flag + count are known.
 * @returns {{ needsHost: number, residualKind: number, pureComplete: number, hostNeeded: number, entityCount: number }}
 */
export function roomB18ResidualPlan(roomFlag7894, entityCount1264) {
  const out = {};
    let outer = roomB18NeedsEntityWalkHost(roomFlag7894);
    out.needsHost = outer;
    out.entityCount = (entityCount1264);
    if (outer == 0) {
      out.residualKind = ROOM_B18_RESIDUAL_NONE;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      out.entityCount = 0;
      return out;
    }
    if (roomB18ListEmpty(entityCount1264) != 0) {
      out.residualKind = ROOM_B18_RESIDUAL_PURE_COMPLETE;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      return out;
    }
    out.residualKind = ROOM_B18_RESIDUAL_HOST_WALK;
    out.pureComplete = 0;
    out.hostNeeded = 1;
  return out;
}

/**
 * Wire-decision matrix (freestanding; not Update-wired).
 */
export function roomB18WireDecide(flagReady, countReady, roomFlag7894, entityCount1264) {
  const out = {};
    if (flagReady == 0) {
      out.needsHost = 0;
      out.residualKind = ROOM_B18_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      out.entityCount = 0;
      return out;
    }
    let outer = roomB18NeedsEntityWalkHost(roomFlag7894);
    if (outer == 0) {
      out.needsHost = 0;
      out.residualKind = ROOM_B18_RESIDUAL_NONE;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      out.entityCount = 0;
      return out;
    }
    if (countReady == 0) {
      out.needsHost = 1;
      out.residualKind = ROOM_B18_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      out.entityCount = 0;
      return out;
    }
    return roomB18ResidualPlan(roomFlag7894, entityCount1264);
}

/* ---- B19 path-rebuild residual pure islands (helpers ABI v30 freestanding). ---- */

export const ROOM_B19_ENTITY_TYPE5 = 5;
export const ROOM_B19_ENTITY_VARIANT_100 = 0x64;
export const ROOM_B19_ENTITY_FLAG_BIT = 0x80000;
export const ROOM_B19_QUERY_IMM_8000 = 0x8000;
export const ROOM_B19_CELL_BUF_SIZE = 0x1c0;
export const ROOM_B19_TREE_NODE_SIZE = 0x18;
export const ROOM_B19_GRID_CELL_BITS = 0x42200000;
export const ROOM_B19_GRID_Y0_BITS = 0x42f00000;
export const ROOM_B19_GRID_HALF_BITS = 0x3f000000;
export const ROOM_B19_ROOM_W_OFF = 0xc;
export const ROOM_B19_ROOM_H_OFF = 0x10;
export const ROOM_B19_ROOM_VEC_OFF = 0x125c;
export const ROOM_B19_ROOM_COUNT_OFF = 0x1264;
export const ROOM_B19_ROOM_FLAG_OFF = 0x7769;
export const ROOM_B19_ENTITY_TYPE_OFF = 0x28;
export const ROOM_B19_ENTITY_VARIANT_OFF = 0x2c;
export const ROOM_B19_ENTITY_POS_X_OFF = 0x33c;
export const ROOM_B19_ENTITY_POS_Y_OFF = 0x340;
export const ROOM_B19_ENTITY_DEAD_OFF = 0x173;
export const ROOM_B19_ENTITY_FIELD_534_OFF = 0x534;
export const ROOM_B19_ENTITY_FLAGS_168_OFF = 0x168;
export const ROOM_B19_REFCOUNT_VA = 0x00c71674;

export const ROOM_B19_HOST_VA_FLAG_TEST = 0x008055a7;
export const ROOM_B19_HOST_VA_REBUILD_START = 0x008055b4;
export const ROOM_B19_HOST_VA_MEMSET = 0x00af05e5;
export const ROOM_B19_HOST_VA_GET_GRID_COLLISION = 0x007f0800;
export const ROOM_B19_HOST_VA_ENTITY_WALK = 0x00805640;
export const ROOM_B19_HOST_VA_QUERY_8000 = 0x0072fe80;
export const ROOM_B19_HOST_VA_TREE_ALLOC = 0x00a0f4c0;
export const ROOM_B19_HOST_VA_POS_FINISH = 0x00813520;
export const ROOM_B19_HOST_VA_SPAWN = 0x00428b20;
export const ROOM_B19_HOST_VA_GET_ALT_PEDESTAL = 0x006e1d70;
export const ROOM_B19_HOST_VA_SET_ALT_PEDESTAL = 0x006e1a80;
export const ROOM_B19_HOST_VA_FLAG_CLEAR = 0x00806043;
export const ROOM_B19_HOST_VA_NEXT = 0x0080608e;

export const ROOM_B19_RESIDUAL_NONE = 0;
export const ROOM_B19_RESIDUAL_HOST_REBUILD = 1;
export const ROOM_B19_RESIDUAL_MONOLITHIC = 2;

const PE_B19_GRID_CELL = (() => {
  const u = new Uint32Array([ROOM_B19_GRID_CELL_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_B19_GRID_Y0 = (() => {
  const u = new Uint32Array([ROOM_B19_GRID_Y0_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_B19_GRID_HALF = (() => {
  const u = new Uint32Array([ROOM_B19_GRID_HALF_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();

/** B19 path rebuild when pre-clear Room+0x7769 low byte nonzero. */
export function roomB19NeedsPathRebuildHost(roomFlag7769) {
  return ((roomFlag7769 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** Pure cell_count = width * height (signed int32 imul wrap). */
export function roomB19CellCount(widthC, height10) {
  return Math.imul(widthC | 0, height10 | 0) | 0;
}

/** Cell loop enter when cell_count > 0 (signed). */
export function roomB19CellLoopEnter(cellCount) {
  return (cellCount | 0) > 0 ? 1 : 0;
}

/** Cell loop continue: index+1 < cell_count (signed). */
export function roomB19CellLoopContinue(index, cellCount) {
    let next = index + 1;
    return next < cellCount ? 1 : 0;
}

export function roomB19ListEmpty(entityCount1264) {
  return (entityCount1264 >>> 0) === 0 ? 1 : 0;
}

export function roomB19ListContinue(index, entityCount1264) {
    let next = index + 1;
    return next < entityCount1264 ? 1 : 0;
}

/** type == 5 && variant == 0x64. */
export function roomB19EntityIsMarkCandidate(entityType28, entityVariant2c) {
    if (entityType28 != ROOM_B19_ENTITY_TYPE5) return 0;
    return entityVariant2c == ROOM_B19_ENTITY_VARIANT_100 ? 1 : 0;
}

/** Secondary host gate after mark. */
export function roomB19EntitySecondaryEligible(dead173Byte, field534, flags168) {
    if ((dead173Byte & 0xff) != 0) return 0;
    if (field534 != 0) return 0;
    return (flags168 & ROOM_B19_ENTITY_FLAG_BIT) != 0 ? 1 : 0;
}

/** PE post of GetGridCollision: nonzero → 0xFF else 0. */
export function roomB19CollisionByte(gridCollisionResult) {
  return (gridCollisionResult >>> 0) !== 0 ? 0xff : 0;
}

function b19WorldAxis(pos, base, cell, half) {
  const t0 = Math.fround(Math.fround(pos) - Math.fround(base));
  const t1 = Math.fround(t0 / Math.fround(cell));
  const t2 = Math.fround(t1 + Math.fround(half));
  return t2 | 0;
}

export function roomB19WorldToGridX(posX) {
  return b19WorldAxis(posX, PE_B19_GRID_CELL, PE_B19_GRID_CELL, PE_B19_GRID_HALF);
}

export function roomB19WorldToGridY(posY) {
  return b19WorldAxis(posY, PE_B19_GRID_Y0, PE_B19_GRID_CELL, PE_B19_GRID_HALF);
}

/** Combined index or -1 when OOB / negative. */
export function roomB19WorldToGridIndex(posX, posY, widthC, height10) {
    let gx = roomB19WorldToGridX(posX);
    let gy = roomB19WorldToGridY(posY);
    if (gx < 0) return -1;
    if (!(gx < widthC)) return -1;
    if (gy < 0) return -1;
    if (!(gy < height10)) return -1;
    let index = gy * widthC + gx;
    if (index < 0) return -1;
    return index;
}

export function roomB19GridIndexValid(gridIndex) {
  return (gridIndex | 0) >= 0 ? 1 : 0;
}

/**
 * Residual plan when outer flag known.
 * @returns {{ needsHost: number, residualKind: number, pureComplete: number, hostNeeded: number, cellCount: number }}
 */
export function roomB19ResidualPlan(roomFlag7769, widthC, height10) {
  const out = {};
    let outer = roomB19NeedsPathRebuildHost(roomFlag7769);
    out.needsHost = outer;
    out.cellCount = roomB19CellCount(widthC, height10);
    if (outer == 0) {
      out.residualKind = ROOM_B19_RESIDUAL_NONE;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      out.cellCount = 0;
      return out;
    }

    out.residualKind = ROOM_B19_RESIDUAL_HOST_REBUILD;
    out.pureComplete = 0;
    out.hostNeeded = 1;
  return out;
}

/**
 * Wire-decision matrix (freestanding; not Update-wired).
 */
export function roomB19WireDecide(flagReady, roomFlag7769, widthC, height10) {
  const out = {};
    if (flagReady == 0) {
      out.needsHost = 0;
      out.residualKind = ROOM_B19_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      out.cellCount = 0;
      return out;
    }
    return roomB19ResidualPlan(roomFlag7769, widthC, height10);
}

/* ---- B20 trail-list residual pure islands (helpers ABI v31 outer / v32 body). ---- */

export const ROOM_B20_PASS1_TYPE_A = 0x1c;
export const ROOM_B20_PASS1_TYPE_B = 0x13;
export const ROOM_B20_PASS1_TYPE_C = 0xef;
export const ROOM_B20_PASS1_TYPE_D = 0x59;
export const ROOM_B20_PAIR_X_TYPES = Object.freeze([
  0x4e, 0x24, 0x10a, 0x54, 0x106, 0x107, 0x65,
]);
export const ROOM_B20_PAIR_X_TYPE_A = 0x4e;
export const ROOM_B20_PAIR_X_TYPE_B = 0x24;
export const ROOM_B20_PAIR_X_TYPE_C = 0x10a;
export const ROOM_B20_PAIR_X_TYPE_D = 0x54;
export const ROOM_B20_PAIR_X_TYPE_E = 0x106;
export const ROOM_B20_PAIR_X_TYPE_F = 0x107;
export const ROOM_B20_PAIR_X_TYPE_G = 0x65;
export const ROOM_B20_PAIR_Y_TYPE = 0x66;
export const ROOM_B20_FLAG_BIT_4000 = 0x4000;
export const ROOM_B20_FLAG_CLEAR_MASK = 0xffffbfff;
export const ROOM_B20_SPAWN_FLAG_BIT_80 = 0x80;
export const ROOM_B20_COLLECT_FLAG_BITS = 0x4080;
export const ROOM_B20_PAIR_X_OFFSET_BITS = 0x42700000; /* 60.0f */
export const ROOM_B20_PAIR_Y_OFFSET_BITS = 0x41f00000; /* 30.0f */
export const ROOM_B20_GRID_CELL_BITS = 0x42200000; /* 40.0f */
export const ROOM_B20_RNG_SPAN_BITS = 0x4048f5c3; /* ≈π */
export const ROOM_B20_UNIT_SCALE_BITS = 0x2f800000;
export const ROOM_B20_RNG_RADIUS_BITS = 0x41a00000; /* 20.0f */
export const ROOM_B20_TYPE_RANGE_BASE = 10;
export const ROOM_B20_TYPE_RANGE_SPAN = 0x3de;
export const ROOM_B20_MODE_GATE = 2;
export const ROOM_B20_DEFAULT_FIELD184_GATE = 5;
export const ROOM_B20_ENTITY_TYPE_OFF = 0x28;
export const ROOM_B20_ENTITY_VARIANT_OFF = 0x2c;
export const ROOM_B20_ENTITY_SUBTYPE_OFF = 0x30;
export const ROOM_B20_ENTITY_POS_X_OFF = 0x33c;
export const ROOM_B20_ENTITY_POS_Y_OFF = 0x340;
export const ROOM_B20_ENTITY_FLAGS_168_OFF = 0x168;
export const ROOM_B20_ENTITY_FLAGS_16C_OFF = 0x16c;
export const ROOM_B20_ENTITY_FIELD_184_OFF = 0x184;
export const ROOM_B20_ENTITY_FIELD_32C_OFF = 0x32c;
export const ROOM_B20_ENTITY_FIELD_370_OFF = 0x370;
export const ROOM_B20_ENTITY_FIELD_3BC_OFF = 0x3bc;
export const ROOM_B20_ENTITY_FIELD_3C0_OFF = 0x3c0;
export const ROOM_B20_ENTITY_FIELD_3EC_OFF = 0x3ec;
export const ROOM_B20_LIST_BEGIN_VA = 0x00c82674;
export const ROOM_B20_LIST_END_VA = 0x00c82678;
export const ROOM_B20_LIST_CAP_VA = 0x00c8267c;
export const ROOM_B20_SPAWN_POS_VEC_PTR = 0x00c7b640;
export const ROOM_B20_GAME_MODE_OFF = 0x26614;

export const ROOM_B20_HOST_VA_LIST_TEST = 0x0080608e;
export const ROOM_B20_HOST_VA_PASS1 = 0x008060e3;
export const ROOM_B20_HOST_VA_PASS2 = 0x008061a0;
export const ROOM_B20_HOST_VA_FLAGGED_GENRAND = 0x00806206;
export const ROOM_B20_HOST_VA_MULTISPAWN = 0x00806281;
export const ROOM_B20_HOST_VA_COLLECT_OR_4080 = 0x008063f0;
export const ROOM_B20_HOST_VA_PAIR_Y = 0x008064fc;
export const ROOM_B20_HOST_VA_DEFAULT_FIELD184 = 0x008065a5;
export const ROOM_B20_HOST_VA_DEFAULT_RNG = 0x008065c2;
export const ROOM_B20_HOST_VA_PAIR_X = 0x00806717;
export const ROOM_B20_HOST_VA_VECTOR_PUSH = 0x0042c920;
export const ROOM_B20_HOST_VA_SPAWN = 0x00428b20;
export const ROOM_B20_HOST_VA_GENRAND = 0x006eef60;
export const ROOM_B20_HOST_VA_SIN = 0x0041d520;
export const ROOM_B20_HOST_VA_COS = 0x0041d540;
export const ROOM_B20_HOST_VA_POS_PACK = 0x00802740;
export const ROOM_B20_HOST_VA_DEALLOCATE = 0x0040c740;
export const ROOM_B20_HOST_VA_FLAG_CLEAR = 0x00806850;
export const ROOM_B20_HOST_VA_FREE = 0x0080686e;
export const ROOM_B20_HOST_VA_EPILOGUE = 0x00806884;

export const ROOM_B20_ACTION_FLAGGED = 0;
export const ROOM_B20_ACTION_PAIR_X = 1;
export const ROOM_B20_ACTION_PAIR_Y = 2;
export const ROOM_B20_ACTION_DEFAULT = 3;

export const ROOM_B20_RESIDUAL_NONE = 0;
export const ROOM_B20_RESIDUAL_HOST_TRAIL = 1;
export const ROOM_B20_RESIDUAL_MONOLITHIC = 2;

const peB20F32Bits = (bits) => {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
};
const PE_B20_PAIR_X_OFF = peB20F32Bits(ROOM_B20_PAIR_X_OFFSET_BITS);
const PE_B20_PAIR_Y_OFF = peB20F32Bits(ROOM_B20_PAIR_Y_OFFSET_BITS);
const PE_B20_GRID_CELL = peB20F32Bits(ROOM_B20_GRID_CELL_BITS);
const PE_B20_RNG_SPAN = peB20F32Bits(ROOM_B20_RNG_SPAN_BITS);
const PE_B20_UNIT_SCALE = peB20F32Bits(ROOM_B20_UNIT_SCALE_BITS);
const PE_B20_RNG_RADIUS = peB20F32Bits(ROOM_B20_RNG_RADIUS_BITS);

/** B20 trail list when DAT_00c82674 != DAT_00c82678. */
export function roomB20NeedsTrailHost(listBeginC82674, listEndC82678) {
  return (listBeginC82674 >>> 0) !== (listEndC82678 >>> 0) ? 1 : 0;
}

/** Pure count = (int32)(end - begin) >> 2 (PE sar). */
export function roomB20ListCount(listBegin, listEnd) {
    let delta =
        (listEnd) - (listBegin);
    return delta >> 2;
}

export function roomB20ListEmpty(listCount) {
  return (listCount | 0) === 0 ? 1 : 0;
}

/** Loop continue: index+1 < count (unsigned jb). */
export function roomB20ListContinue(index, listCount) {
    let next = index + 1;
    return next < (listCount) ? 1 : 0;
}

/** Pass1 type ∈ {0x1c, 0x13, 0xef, 0x59}. */
export function roomB20Pass1TypeMatch(entityType28) {
    if (entityType28 == ROOM_B20_PASS1_TYPE_A) return 1;
    if (entityType28 == ROOM_B20_PASS1_TYPE_B) return 1;
    if (entityType28 == ROOM_B20_PASS1_TYPE_C) return 1;
    if (entityType28 == ROOM_B20_PASS1_TYPE_D) return 1;
    return 0;
}

export function roomB20FlagOr4000(flags16c) {
  return ((flags16c >>> 0) | ROOM_B20_FLAG_BIT_4000) >>> 0;
}

export function roomB20FlagClear4000(flags16c) {
  return ((flags16c >>> 0) & ROOM_B20_FLAG_CLEAR_MASK) >>> 0;
}

export function roomB20EntityIsFlagged(flags16c) {
  return ((flags16c >>> 0) & ROOM_B20_FLAG_BIT_4000) !== 0 ? 1 : 0;
}

export function roomB20EntityIsPairX(entityType28) {
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_A) return 1;
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_B) return 1;
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_C) return 1;
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_D) return 1;
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_E) return 1;
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_F) return 1;
    if (entityType28 == ROOM_B20_PAIR_X_TYPE_G) return 1;
    return 0;
}

export function roomB20EntityIsPairY(entityType28) {
  return (entityType28 | 0) === ROOM_B20_PAIR_Y_TYPE ? 1 : 0;
}

/** Pass2 pure route: FLAGGED / PAIR_X / PAIR_Y / DEFAULT. */
export function roomB20Pass2Action(flags16c, entityType28) {
    if (roomB20EntityIsFlagged(flags16c) != 0) {
      return ROOM_B20_ACTION_FLAGGED;
    }
    if (roomB20EntityIsPairX(entityType28) != 0) {
      return ROOM_B20_ACTION_PAIR_X;
    }
    if (roomB20EntityIsPairY(entityType28) != 0) {
      return ROOM_B20_ACTION_PAIR_Y;
    }
    return ROOM_B20_ACTION_DEFAULT;
}

export function roomB20FlaggedMultispawnEnter(field3c0) {
  return (field3c0 >>> 0) === 0 ? 1 : 0;
}

/**
 * Chain continue after spawn child at +0x3bc.
 * child_ptr != 0 && ((mode>=2 && type==1) || (type-10u) < 0x3de).
 */
export function roomB20ChainContinue(childPtr3bc, mode, childType28) {
    if (childPtr3bc == 0) return 0;
    if (mode >= ROOM_B20_MODE_GATE &&
        childType28 == 1) {
      return 1;
    }
    let range =
        ((childType28 >>> 0) -
        (ROOM_B20_TYPE_RANGE_BASE >>> 0)) >>> 0;
    return range < ROOM_B20_TYPE_RANGE_SPAN ? 1 : 0;
}

export function roomB20SpawnFlagOr80(flags16c) {
  return ((flags16c >>> 0) | ROOM_B20_SPAWN_FLAG_BIT_80) >>> 0;
}

/** Pure OR after multi-spawn vcall: entity+0x16c |= 0x4080 (v32). */
export function roomB20CollectFlagOr4080(flags16c) {
  return ((flags16c >>> 0) | ROOM_B20_COLLECT_FLAG_BITS) >>> 0;
}

/** DEFAULT path PE cmp entity+0x184, 5 (v32). */
export function roomB20DefaultField184IsSpecial(field184) {
  return (field184 | 0) === ROOM_B20_DEFAULT_FIELD184_GATE ? 1 : 0;
}

/** Free local vector when begin ptr != 0 (v32). */
export function roomB20VectorNeedsFree(vectorBeginPtr) {
  return (vectorBeginPtr >>> 0) !== 0 ? 1 : 0;
}

/** Multi-spawn collected loop enter when count != 0 (v32). */
export function roomB20CollectLoopEnter(collectCount) {
  return (collectCount | 0) !== 0 ? 1 : 0;
}

/**
 * PE u32→unit float after genrand (DAT_00ba9ff4); B20-named (v32).
 */
export function roomB20UnitFloat(genrand) {
    const as_signed = genrand | 0;
    let d = as_signed;
    if ((genrand >>> 31) !== 0) {
      d += 4294967296.0;
    }
    const as_f32 = Math.fround(d);
    return Math.fround(as_f32 * peF32Bits(ROOM_B20_UNIT_SCALE_BITS));
}

/** angle = unit * π; angle = angle + angle → unit * 2π (v32). */
export function roomB20AngleFromUnit(unit) {
    let angle = Math.fround(Math.fround(unit) *
                            peF32Bits(ROOM_B20_RNG_SPAN_BITS));
    angle = Math.fround(angle + angle);
    return angle;
}

/** Composite: unit_float(genrand) then angle_from_unit (v32). */
export function roomB20AngleFromGenrand(genrand) {
  return roomB20AngleFromUnit(roomB20UnitFloat(genrand));
}

/** dir * 40.0 for flagged multi-spawn step (v32). */
export function roomB20DirScaleGrid(dir) {
  return Math.fround(Math.fround(dir) * PE_B20_GRID_CELL);
}

/** dir * 20.0 for default RNG offset (v32). */
export function roomB20DirScaleRadius(dir) {
  return Math.fround(Math.fround(dir) * PE_B20_RNG_RADIUS);
}

export function roomB20PairXLeft(posX, posY) {
  const out = {};
    let off = peF32Bits(ROOM_B20_PAIR_X_OFFSET_BITS);
    out.x = posX - off;
    out.y = posY - Math.fround(0.0);
  return out;
}

export function roomB20PairXRight(posX, posY) {
  const out = {};
    let off = peF32Bits(ROOM_B20_PAIR_X_OFFSET_BITS);
    out.x = posX + off;
    out.y = posY + Math.fround(0.0);
  return out;
}

export function roomB20PairYUp(posX, posY) {
  const out = {};
    let off = peF32Bits(ROOM_B20_PAIR_Y_OFFSET_BITS);
    out.x = posX + Math.fround(0.0);
    out.y = posY + off;
  return out;
}

export function roomB20PairYDown(posX, posY) {
  const out = {};
    let off = peF32Bits(ROOM_B20_PAIR_Y_OFFSET_BITS);
    out.x = posX - Math.fround(0.0);
    out.y = posY - off;
  return out;
}

/** Flagged multi first-step offset: (x+cos*40, y+sin*40) (v32). */
export function roomB20FlaggedSpawnOffset(posX, posY, sinA, cosA) {
  const out = {};
    out.x = posX + roomB20DirScaleGrid(cosA);
    out.y = posY + roomB20DirScaleGrid(sinA);
  return out;
}

/** Default RNG offset: (x+cos*20, y+sin*20) (v32). */
export function roomB20DefaultSpawnOffset(posX, posY, sinA, cosA) {
  const out = {};
    out.x = posX + roomB20DirScaleRadius(cosA);
    out.y = posY + roomB20DirScaleRadius(sinA);
  return out;
}

/**
 * Residual plan when begin/end known.
 * @returns {{ needsHost: number, residualKind: number, pureComplete: number, hostNeeded: number, listCount: number }}
 */
export function roomB20ResidualPlan(listBeginC82674, listEndC82678) {
  const out = {};
    let outer =
        roomB20NeedsTrailHost(listBeginC82674, listEndC82678);
    out.needsHost = outer;
    out.listCount =
        roomB20ListCount(listBeginC82674, listEndC82678);
    if (outer == 0) {
      out.residualKind = ROOM_B20_RESIDUAL_NONE;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      out.listCount = 0;
      return out;
    }

    out.residualKind = ROOM_B20_RESIDUAL_HOST_TRAIL;
    out.pureComplete = 0;
    out.hostNeeded = 1;
  return out;
}

/**
 * Wire-decision matrix (freestanding; not Update-wired).
 */
export function roomB20WireDecide(listReady, listBeginC82674, listEndC82678) {
  const out = {};
    if (listReady == 0) {
      out.needsHost = 0;
      out.residualKind = ROOM_B20_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      out.listCount = 0;
      return out;
    }
    return roomB20ResidualPlan(listBeginC82674, listEndC82678);
}

/** B8 path-cost: (frameCounter264f8 % 3)==0 && cellCount>0 (signed %). */
export function roomB8NeedsPathCostHost(frameCounter264f8, cellCount) {
    if (!(cellCount > 0)) return 0;
    return (frameCounter264f8 % 3) == 0 ? 1 : 0;
}

/**
 * Pure single-cell B8 step (Room+0x76c int cost, Room+0xe6c short trail).
 * @returns {{ cost: number, trail: number }}
 */
export function roomB8PathCostCellStep(costInt, trailShort) {
  let cost = costInt | 0;
  let trail = trailShort | 0;
  {
    let rem = cost % 1000;
    if (cost === 3999) {
      cost = 900;
    } else if (rem < 0x385) {
      if (100 < rem) {
        rem = 100;
      }
      cost = cost - rem;
    }
  }
  {
    if ((((trail - 1) & 0xffff) >>> 0) < 99) {
      const next = (trail | 0) - 1;
      trail = (0 < next) ? (next | 0) : 0;
    }
  }
  return { cost, trail };
}

/** Pure full-grid B8 apply (caller enforces frame%3 gate). */
export function roomB8PathCostGridStep(costs, trails, cellCount) {
  if (costs == null || trails == null || !(cellCount > 0)) {
    return;
  }
  for (let i = 0; i < cellCount; ++i) {
    const stepped = roomB8PathCostCellStep(costs[i], trails[i]);
    costs[i] = stepped.cost;
    trails[i] = stepped.trail;
  }
}

/* ---- B13 ambient pure peels (helpers ABI v15+) ---- */

const PE_AMBIENT_DECAY = (() => {
  const u = new Uint32Array([0x3ca3d70a]);
  return new Float32Array(u.buffer)[0];
})();
const PE_AMBIENT_THRESHOLD = (() => {
  const u = new Uint32Array([0x3c23d70a]);
  return new Float32Array(u.buffer)[0];
})();
const PE_ZERO_VEC_X = (() => {
  const u = new Uint32Array([0x3760371c]);
  return new Float32Array(u.buffer)[0];
})();
const PE_ZERO_VEC_Y = (() => {
  const u = new Uint32Array([0x37873770]);
  return new Float32Array(u.buffer)[0];
})();

/**
 * FUN_00824800 pure float shell (Room+0x7454 / +0x7458 / +0x745c).
 * @returns {{ count7454: number, intensity7458: number, flag745c: number }}
 */
export function stepRoomAmbient824800Float(input) {
  const state = Object.assign({}, input || {});
    if (!(state.count7454 > 0)) return state;
    state.intensity7458 = Math.fround(state.intensity7458);

    if (!(Math.fround(0.0) < state.intensity7458)) return state;

    let decay = peF32Bits(0x3ca3d70a);
    let threshold = peF32Bits(0x3c23d70a);
    let intensity = Math.fround(state.intensity7458);
    if ((state.flag745c & 0xff) != 0) {
      intensity = Math.fround(intensity - decay);
      if (intensity < Math.fround(0.0)) intensity = Math.fround(0.0);
      state.intensity7458 = intensity;
    }
    intensity = Math.fround(state.intensity7458);

    if (threshold > intensity) {
      state.intensity7458 = Math.fround(0.0);
    }
  return state;
}

/** Post-pure host spawn residual of FUN_00824800. */
export function roomAmbient824800NeedsSpawnHost(statePost) {
  const state = Object.assign({}, statePost || {});
    if (!(statePost.count7454 > 0)) return 0;
    let threshold = peF32Bits(0x3c23d70a);

    return !(threshold > statePost.intensity7458) ? 1 : 0;
  return state;
}

/** FUN_007f01c0 host body gate. */
export function roomAmbient7f01c0NeedsHost(
  gate1b83c,
  descPresent,
  descType8,
  descId0,
  playerCount,
) {
    if (gate1b83c != 0) return 0;
    if (descPresent != 0 && descType8 == 0x10 && descId0 == 0x23) return 0;
    if (playerCount == 0) return 0;
    return 1;
}

/** FUN_00824ee0 host when velocity != PE zero vector. */
export function roomAmbient24ee0NeedsHost(velX7460, velY7464) {
    let zx = peF32Bits(0x3760371c);
    let zy = peF32Bits(0x37873770);
    if (velX7460 == zx && velY7464 == zy) return 0;
    return 1;
}

/** FUN_008024f0 flags early-out (1 = skip body). */
export function roomAmbient8024f0FlagsEarlyOut(roomDescFlags44) {
  return (((roomDescFlags44 >>> 0) >> 1) & 1) !== 0 ? 1 : 0;
}

/** Special-room 0x10/id 0x23 ambient tail host. */
export function roomAmbientSpecial1023NeedsHost(descPresent, descType8, descId0) {
    if (descPresent == 0) return 0;
    if (descType8 != 0x10) return 0;
    if (descId0 != 0x23) return 0;
    return 1;
}

/** Greed stage remap for ambient entity spawn filters. */
export function roomAmbientGreedStageRemap(difficulty269c8, stage, stageType) {
  let s = stage | 0;
  let t = stageType | 0;
  if ((difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3) {
    if (s <= 4) {
      s = s * 2 - 1;
    } else {
      s = (s === 5) ? 10 : 0;
    }
    t = 0;
  }
  return { stage: s, stageType: t };
}

/** Stage/type may enter ambient entity RNG gates (pre-genrand). */
export function roomAmbientStageSpawnMayRng(stage, stageType) {
    let s = stage;
    let t = stageType;

    if ((s == 3 || s == 4) && t == 0) return 1;
    if ((s == 7 || s == 8) && t == 0) return 1;
    if ((s == 5 || s == 6) && t == 2) return 1;

    if ((s == 3 || s == 4) && t == 2) return 1;
    if ((s == 7 || s == 8) && t == 2) return 1;
    if ((s == 1 || s == 2) && (t == 2 || t == 4 || t == 5)) return 1;
    return 0;
}

/* ---- Always-host ambient residual pure islands (helpers ABI v16) ---- */

/** H3 pure-complete skip inverse: host unless mode!=0x2c && dim==2. */
export function roomAmbientModeSfxNeedsHost(mode26584, dim1830c) {
    if (mode26584 != 0x2c && dim1830c == 2) return 0;
    return 1;
}

/** PE signed % 4 (and 0x80000003 sequence). */
function peSignedMod4(value) {
  return (value | 0) % 4;
}

/** H3 post-stage play gate before RNG/SFX host. */
export function roomAmbientModeSfxMayPlay(stageId, frame264f8) {
    if (stageId != 0x1b) return 0;
    return peSignedMod4(frame264f8) == 0 ? 1 : 0;
}

/** H7 FUN_0074e9b0 pure-false early-out (1 = pure complete false). */
export function roomAmbient74e9b0PureFalse(difficulty269c8, stage0, flags2654c) {
    if (difficulty269c8 == 2 || difficulty269c8 == 3) return 1;

    let dec = (stage0) - 1;
    if (dec <= 5) {
      if ((flags2654c & 0x10000) != 0) return 1;
    }
    return 0;
}

/** FUN_004217a0 low-word challenge bit test. */
export function gameChallengeBitsetTestLow(word0, challengeId) {
    let eax = challengeId | 0;
    if (eax <= 0) eax = 0;
    let esi = 0x34;
    if (eax < esi) esi = eax;
    const bit = esi & 0x3f;
    const mask = 1n << BigInt(bit);
    const word = typeof word0 === "bigint" ? word0 : BigInt(word0 >>> 0);
    return (word & mask) !== 0n ? 1 : 0;
}

/**
 * Level::HasAbandonedMineshaft pure classify (exact ZHL 0x0074efd0).
 * @returns {0|1|-1} 0 pure false, 1 pure true, -1 needs host FUN_00748490
 */
export function levelHasAbandonedMineshaftPure(
  difficulty269c8,
  stage0,
  stageType4,
  flags2654c,
) {
    if (difficulty269c8 == 2 || difficulty269c8 == 3) return 0;
    let dec = (stage0) - 1;
    if (dec <= 5) {
      if ((flags2654c & 0x10000) != 0) return 0;
    }
    if (!(stageType4 == 4 || stageType4 == 5)) return 0;
    if (stage0 == 4) return 1;
    if (stage0 != 3) return 0;
    return -1;
}

/** H5 body cadence after force-entry. */
export function roomAmbient824a70CadenceMayBody(
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
) {
    if ((roomActiveByte0 & 0xff) != 0) {
      let age = frame264f8 - roomEntry11f0;
      if (age == 0) return 1;
    }

    return (frame264f8 % 0xd2) == 0 ? 1 : 0;
}

/**
 * Mid-tail restock residual outer pure gate (helpers ABI v18; freestanding).
 */
export function roomMidRestockNeedsHost(
  roomType8,
  collectibleOwner0x209Nonzero,
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
) {
    if (roomType8 != 2) return 0;
    if (collectibleOwner0x209Nonzero == 0) return 0;
    if ((roomActiveByte0 & 0xff) == 0) return 0;

    let age = frame264f8 - roomEntry11f0;
    if (!(1 < age)) return 0;
    return 1;
}

/** PE collectible imm / stack RNG shifts (DAT_00b1f528 / DAT_00b1f530). */
export const ROOM_MID_RESTOCK_COLLECTIBLE_ID = 0x209;
export const ROOM_MID_RESTOCK_RNG_SHIFT1 = 1;
export const ROOM_MID_RESTOCK_RNG_SHIFT2 = 0x1b;
export const ROOM_MID_RESTOCK_RNG_SHIFT3 = 0x1b;

/** Host residual VAs (hash-bound PE Room::Update mid-restock body). */
export const ROOM_MID_RESTOCK_HOST_VA_OUTER = 0x00805408;
export const ROOM_MID_RESTOCK_HOST_VA_OWNER = 0x009be080;
export const ROOM_MID_RESTOCK_HOST_VA_BODY = 0x0080544a;
export const ROOM_MID_RESTOCK_HOST_VA_RANDOM_INT = 0x007e9020;
export const ROOM_MID_RESTOCK_HOST_VA_WRITE = 0x0080549e;
export const ROOM_MID_RESTOCK_HOST_VA_NEXT = 0x008054ab;
/** Residual host VAs (helpers ABI v27 freestanding). */
export const ROOM_MID_RESTOCK_HOST_VA_SEED_FATAL = 0x00a112c0;
export const ROOM_MID_RESTOCK_HOST_VA_GET_COLLECTIBLE = 0x0072fd10; /* exact ZHL */
export const ROOM_MID_RESTOCK_HOST_VA_HAS_COLLECTIBLE = 0x007706e0; /* addr-stable */

/** FCO call-site PE imms / desc field offs (helpers ABI v27). */
export const ROOM_MID_RESTOCK_OWNER_LAZ_SHARED_TAG = 1;
export const ROOM_MID_RESTOCK_OWNER_RNG_GAME_OFF = 0x1baa8;
export const ROOM_MID_RESTOCK_DESC_OFF_AC = 0xac;
export const ROOM_MID_RESTOCK_DESC_OFF_AE = 0xae;
export const ROOM_MID_RESTOCK_DESC_OFF_SEED58 = 0x58;
export const ROOM_MID_RESTOCK_OWNER_CONFIG_TWIN_BIT = 0x80000000;
export const ROOM_MID_RESTOCK_OWNER_LIST_STRIDE = 4;

export const ROOM_MID_RESTOCK_RESIDUAL_NONE = 0;
export const ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE = 1;
export const ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL = 2;
export const ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC = 3;

/** Signed int16 from low 16 bits (PE movzx + 16-bit signed compare). */
function i16(v) {
  return ((v | 0) << 16) >> 16;
}

/**
 * Inner desc short gate @ 0x0080544a0x00805469.
 * 0 < ac_s16 && (ac_s16 <= ae_s16 || ae_s16 == -1)
 * @returns {0|1}
 */
export function roomMidRestockDescGate(descShortAc, descShortAe) {
  const ac = (descShortAc << 16) >> 16;
  const ae = (descShortAe << 16) >> 16;
  if (!(ac > 0)) return 0;
  if (ae >= ac) return 1;
  if (ae === -1) return 1;
  return 0;
}

/**
 * Pure RNG::Next xorshift embedded in RandomInt (0x007e90420x007e9060).
 * @param {{seed: number}} state mutable seed container
 * @returns {number} new seed
 */
export function roomMidRestockRngNext(state, shift1, shift2, shift3) {
  if (state == null) return 0;
  const seed = state.seed >>> 0;
  let eax = ((seed >>> (shift1 & 31)) ^ seed) >>> 0;
  const edx = ((eax << (shift2 & 31)) ^ eax) >>> 0;
  eax = ((edx >>> (shift3 & 31)) ^ edx) >>> 0;
  state.seed = eax;
  return eax;
}

/**
 * Pure RNG::RandomInt (exact ZHL 0x007e9020) without zero-seed fatal.
 * seed==0 leaves state unchanged and returns 0 (PE fatals).
 */
export function roomMidRestockRandomInt(state, shift1, shift2, shift3, max) {
  if (state == null) return 0;
  if ((state.seed >>> 0) === 0) return 0;
  const next = roomMidRestockRngNext(state, shift1, shift2, shift3);
  if ((max >>> 0) === 0) return 0;
  return next % (max >>> 0);
}

/**
 * Full body after outer gate open. Returns 0 skip / 1 applied / -1 seed0 fatal.
 * @returns {number}
 */
export function roomMidRestockBodyApply(descShortAc, descShortAe, descSeed58) {
  if (roomMidRestockDescGate(descShortAc, descShortAe) === 0) {
    return { result: 0, outAe: 0 };
  }
  if ((descSeed58 >>> 0) === 0) {
    return { result: -1, outAe: 0 };
  }
  const seedState = { seed: descSeed58 >>> 0 };
  const ac = (descShortAc << 16) >> 16;
  const max = ac >>> 0;
  const rolled = roomMidRestockRandomInt(
    seedState,
    ROOM_MID_RESTOCK_RNG_SHIFT1,
    ROOM_MID_RESTOCK_RNG_SHIFT2,
    ROOM_MID_RESTOCK_RNG_SHIFT3,
    max,
  );
  const outAe = (rolled << 16) >> 16;
  return { result: 1, outAe };
}

/**
 * Freestanding wire matrix (helpers ABI v23; not Update-wired).
 * @returns {{residualKind: number, outAe: number|null, applied: 0|1}}
 */
export function roomMidRestockWireDecide({
  outerReady,
  descReady,
  roomType8,
  collectibleOwner0x209Nonzero,
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
  descShortAc,
  descShortAe,
  descSeed58,
}) {
  const out = { applied: 0, outAe: 0, residualKind: 0 };
  if ((outerReady | 0) === 0) {
    out.residualKind = ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC;
    return out;
  }
  if (roomMidRestockNeedsHost(roomType8, collectibleOwner0x209Nonzero,
                              roomActiveByte0, frame264f8,
                              roomEntry11f0) === 0) {
    out.residualKind = ROOM_MID_RESTOCK_RESIDUAL_NONE;
    return out;
  }
  if ((descReady | 0) === 0) {
    out.residualKind = ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC;
    return out;
  }
  const rc = roomMidRestockBodyApply(descShortAc, descShortAe, descSeed58);
  out.outAe = rc.outAe;
  if (rc.result < 0) {
    out.residualKind = ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL;
    return out;
  }
  if (rc.result === 0) {
    out.residualKind = ROOM_MID_RESTOCK_RESIDUAL_NONE;
    return out;
  }
  out.applied = 1;
  out.residualKind = ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE;
  return out;
}

/**
 * Pure frame-in-room age (PE signed sub @ 0x0080543f). helpers ABI v27.
 * @returns {number}
 */
export function roomMidRestockFrameAge(frame264f8, roomEntry11f0) {
  return ((frame264f8 | 0) - (roomEntry11f0 | 0)) | 0;
}

/**
 * Outer body opens when signed age > 1 (PE cmp eax,1; jle skip).
 * @returns {0|1}
 */
export function roomMidRestockAgeOpensBody(age) {
  return 1 < (age | 0) ? 1 : 0;
}

/**
 * FCO twin-walk flag @ 0x009be0a70x009be0ce.
 * laz_shared != 0 && config != 0 && (config_b8 & 0x80000000) != 0
 * @returns {0|1}
 */
export function roomMidRestockOwnerTwinWalkFlag(
  lazSharedTag,
  configPtrNonzero,
  configFieldB8,
) {
    if ((lazSharedTag & 0xff) == 0) return 0;
    if (configPtrNonzero == 0) return 0;
    if ((configFieldB8 & ROOM_MID_RESTOCK_OWNER_CONFIG_TWIN_BIT) == 0) {
      return 0;
    }
    return 1;
}

/**
 * FCO player list empty: begin == end → return NULL.
 * @returns {0|1}
 */
export function roomMidRestockOwnerListEmpty(listBegin, listEnd) {
  return (listBegin >>> 0) === (listEnd >>> 0) ? 1 : 0;
}

/**
 * FCO player slot active when player+0x2c == 0.
 * @returns {0|1}
 */
export function roomMidRestockOwnerPlayerSlotActive(playerField2c) {
  return (playerField2c >>> 0) === 0 ? 1 : 0;
}

/**
 * FCO twin entity present when player+0x1e6c != 0.
 * @returns {0|1}
 */
export function roomMidRestockOwnerTwinPresent(twinPtr) {
  return (twinPtr >>> 0) !== 0 ? 1 : 0;
}

/**
 * After host HasCollectible-shaped call: nonzero al → hit.
 * @returns {0|1}
 */
export function roomMidRestockOwnerHasCollectibleHit(alByte) {
  return ((alByte >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/**
 * FCO list continue: (cur + 4) != end.
 * @returns {0|1}
 */
export function roomMidRestockOwnerListContinue(listCur, listEnd) {
    let next =
        (listCur + ROOM_MID_RESTOCK_OWNER_LIST_STRIDE) >>> 0;
    return next !== (listEnd >>> 0) ? 1 : 0;
}

/* ---- Room+0x7230 spawn residual pure islands (helpers ABI v28 freestanding).
   Type/variant imms + 813460 genrand consumer posts. 7230-only symbols. ---- */

/** PE push type=4 / variant=3 before opaque_call_00428b20 @ 0x00805506. */
export const ROOM_7230_SPAWN_TYPE = 4;
export const ROOM_7230_SPAWN_VARIANT = 3;
export const ROOM_7230_SPAWN_POS_VEC_PTR = 0x00c7b640;
export const ROOM_7230_SPAWN_ARG_PTR_A = 0x00c5d838;
export const ROOM_7230_SPAWN_ARG_PTR_B = 0x00c5d5dc;
export const ROOM_7230_SPAWN_GAME_ROOM_OFF = 0x18300;
export const ROOM_7230_SPAWN_HALF_BITS = 0x3f000000;
export const ROOM_7230_SPAWN_UNIT_SCALE_BITS = 0x2f800000;

export const ROOM_7230_HOST_VA_COUNTDOWN = 0x008054ab;
export const ROOM_7230_HOST_VA_SPAWN_BODY = 0x008054c3;
export const ROOM_7230_HOST_VA_POS = 0x00813460;
export const ROOM_7230_HOST_VA_POS_FINISH = 0x00813520;
export const ROOM_7230_HOST_VA_GENRAND = 0x006eef60;
export const ROOM_7230_HOST_VA_SPAWN = 0x00428b20;
export const ROOM_7230_HOST_VA_RTTI = 0x00af08b1;
export const ROOM_7230_HOST_VA_NEXT = 0x00805527;

/**
 * Pure room-float spans before nested genrand in 0x00813460.
 * span_y = f1c − f14; span_x = f20 − f18
 * (uses module peF32Bits hoisted below with H5 color constants)
 */
export function room7230SpawnSpans(roomF14, roomF18, roomF1c, roomF20) {
  const out = {};
    roomF14 = Math.fround(roomF14);
    roomF18 = Math.fround(roomF18);
    roomF1c = Math.fround(roomF1c);
    roomF20 = Math.fround(roomF20);
    out.spanX = Math.fround(roomF1c - roomF14);
    out.spanY = Math.fround(roomF20 - roomF18);
  return out;
}

/**
 * PE u32→unit float inside 813460 (same conversion as H5; 7230-named).
 */
export function room7230SpawnUnitFloat(genrand) {
    const as_signed = genrand | 0;
    let d = as_signed;
    if ((genrand >>> 31) !== 0) {
      d += 4294967296.0;
    }
    const as_f32 = Math.fround(d);
    const unit_scale =
        peBitsToF32(ROOM_7230_SPAWN_UNIT_SCALE_BITS);
    return Math.fround(as_f32 * unit_scale);
}

export function room7230SpawnCenterX(roomF14, spanX) {
    let half = peBitsToF32(ROOM_7230_SPAWN_HALF_BITS);
    return Math.fround(Math.fround(roomF14) + Math.fround(Math.fround(spanX) * half));
}

export function room7230SpawnCenterY(roomF18, spanY) {
    let half = peBitsToF32(ROOM_7230_SPAWN_HALF_BITS);
    return Math.fround(Math.fround(roomF18) + Math.fround(Math.fround(spanY) * half));
}

/** PE maxss: span_y unless span_x strictly greater. */
export function room7230SpawnMaxSpan(spanX, spanY) {
    return (spanX > spanY) ? spanX : spanY;
}

export function room7230SpawnRadiusArg(unit, maxSpan) {
  return Math.fround(Math.fround(unit) * Math.fround(maxSpan));
}

/**
 * Combined pos pure posts for one 7230 spawn (host supplies genrand dword).
 */
export function room7230SpawnPosPosts(
  genrand,
  roomF14,
  roomF18,
  roomF1c,
  roomF20,
) {
  const out = {};
    const spans = room7230SpawnSpans(roomF14, roomF18, roomF1c, roomF20);
    let unit = room7230SpawnUnitFloat(genrand);
    let max_span =
        room7230SpawnMaxSpan(spans.spanX, spans.spanY);
    out.spanX = spans.spanX;
    out.spanY = spans.spanY;
    out.unit = unit;

    out.centerX = room7230SpawnCenterX(roomF14, spans.spanX);
    out.centerY = room7230SpawnCenterY(roomF18, spans.spanY);
    out.maxSpan = max_span;
    out.radiusArg = room7230SpawnRadiusArg(unit, max_span);
  return out;
}

/**
 * H5 FUN_00824a70 pure host residual gate (helpers ABI v17 / Update ABI v39).
 * @returns {0|1}
 */
export function roomAmbient824a70NeedsHost({
  mode26584,
  dim1830c,
  stageIdResolved,
  roomType8,
  roomSubtype1bb0,
  game18304,
  difficulty269c8,
  stage0,
  stageType4,
  flags2654c,
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
}) {
    if (mode26584 == 0x2c) return 1;

    let sid = (dim1830c == 2) ? 0x23 : stageIdResolved;
    let force = 0;
    if (sid == 0x21 || sid == 0x1c) force = 1;
    if (roomType8 == 5 && roomSubtype1bb0 == 0x5b) force = 1;
    if (game18304 == -16) force = 1;

    if (force == 0) {
      let mh = levelHasAbandonedMineshaftPure(
          difficulty269c8, stage0, stageType4, flags2654c);
      if (mh < 0) return 1;
      if (mh == 1 && dim1830c == 1) force = 1;
      if (force == 0 && dim1830c == 0) return 0;
    }

    return roomAmbient824a70CadenceMayBody(roomActiveByte0, frame264f8,
                                                      roomEntry11f0);
}

/* ---- H5 body pure islands (helpers ABI v19; freestanding) ---- */

const PE_824A70_PAD = (() => {
  const u = new Uint32Array([0x42200000]);
  return new Float32Array(u.buffer)[0];
})();
const PE_824A70_Y_EXT = (() => {
  const u = new Uint32Array([0x43fa0000]);
  return new Float32Array(u.buffer)[0];
})();
const PE_824A70_Y_ADD = (() => {
  const u = new Uint32Array([0x44160000]);
  return new Float32Array(u.buffer)[0];
})();

function peF32Bits(bits) {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
}

/**
 * Pure body setup at VA 0x00824b4c0x00824bad (age, loop count, room bounds).
 */
export function roomAmbient824a70BodyBounds({
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
  roomF14,
  roomF18,
  roomF1c,
  roomF20,
}) {
  const out = {};
    let age;
    if ((roomActiveByte0 & 0xff) == 0) {
      age = -1;
    } else {
      age = frame264f8 - roomEntry11f0;
    }

    let loop_count = (age == 0) ? 5 : 1;

    let pad = peF32Bits(0x42200000);
    let y_ext = peF32Bits(0x43fa0000);

    let min_x = roomF18 - pad;
    let max_x = roomF20 + pad;
    let span_x = max_x - min_x;
    let base_y = roomF14;
    let span_y = (roomF1c + y_ext) - base_y;

    out.minX = min_x;
    out.spanX = span_x;
    out.baseY = base_y;
    out.spanY = span_y;
    out.roomY1c = roomF1c;
    out.age = age;
    out.loopCount = loop_count;
  return out;
}

/**
 * Pure color triple at VA 0x00824d500x00824e50.
 * PE-order branches; bits-exact immediates.
 */
export function roomAmbient824a70BodyColor(stageId, room1d18, dim1830c) {
  const out = {};
    let r, g, b;
    if (stageId == 0x1b) {
      r = peF32Bits(0x3f60e0e2);
      g = peF32Bits(0x3f75f5f7);
      b = peF32Bits(0x3f79f9fb);
    } else if (room1d18 == 0x2c || room1d18 == 0x2b) {
      r = peF32Bits(0x3f0c8c8d);
      g = peF32Bits(0x3e28a8a9);
      b = peF32Bits(0x3e28a8a9);
    } else if (room1d18 == 0xd) {
      r = peF32Bits(0x3f56d6d8);
      g = peF32Bits(0x3f6aeaec);
      b = peF32Bits(0x3f79f9fb);
    } else if (stageId == 0x1c) {
      r = peF32Bits(0x3e60e0e2);
      g = peF32Bits(0x3e8c8c8d);
      b = peF32Bits(0x3db0b0b1);
    } else if (stageId == 0x1d || stageId == 0x1e) {
      r = peF32Bits(0x3ec8c8ca);
      g = peF32Bits(0x3ea0a0a1);
      b = peF32Bits(0x3f028283);
    } else if (dim1830c == 2) {
      r = peF32Bits(0x3ef0f0f2);
      g = peF32Bits(0x3ef0f0f2);
      b = peF32Bits(0x3ef0f0f2);
    } else {
      r = peF32Bits(0x3ee0e0e2);
      g = peF32Bits(0x3f0c8c8d);
      b = peF32Bits(0x3e34b4b5);
    }
    out.r = r;
    out.g = g;
    out.b = b;
  return out;
}

/** Age!=0 → host y override applies. */
export function roomAmbient824a70BodyYOverrideApplies(age) {
  return (age | 0) !== 0 ? 1 : 0;
}

/** Forced y = room+0x1c + DAT_00baab98 (600.0). */
export function roomAmbient824a70BodyYOverride(roomY1c) {
  return Math.fround(Math.fround(roomY1c) + PE_824A70_Y_ADD);
}

/* ---- H5 body residual pure post-RNG unit-float posts (helpers ABI v21) ---- */

const PE_824A70_UNIT_SCALE = peF32Bits(0x2f800000); /* DAT_00ba9ff4 ≈ 1/2^32 */
const PE_824A70_Z_BASE = peF32Bits(0xbe800000); /* DAT_00baad10 = −0.25 */
const PE_824A70_Z_SPAN = peF32Bits(0x3f000000); /* DAT_00baa2d0 = 0.5 */
const PE_824A70_SCALE_MUL = peF32Bits(0x3e99999a); /* DAT_00baa1f8 = 0.3 */
const PE_824A70_SCALE_ADD = peF32Bits(0x3f333333); /* DAT_00baa354 = 0.7 */

/**
 * Pure post after every genrand→unit path in FUN_00824a70 residual loop.
 * MSVC u32→f32 via signed double + 2^32 bias, then * DAT_00ba9ff4.
 * Host still owns Isaac::genrand_int32; this consumes the dword only.
 */
export function roomAmbient824a70BodyUnitFloat(genrand) {
    const as_signed = genrand | 0;
    let d = as_signed;
    if ((genrand >>> 31) !== 0) {
      d += 4294967296.0;
    }
    const as_f32 = Math.fround(d);
    const unit_scale = peF32Bits(0x2f800000);
    return Math.fround(as_f32 * unit_scale);
}

/** R0/R1 pure post: base + unit * span (f32: mulss span,unit; addss base). */
export function roomAmbient824a70BodyPosAxis(base, unit, span) {
    return Math.fround(Math.fround(unit * span) + base);
}

/** R2 pure post: z = −0.25 − unit·0.5 (movss/mulss/subss, f32). */
export function roomAmbient824a70BodyZ(unit) {
    let z_base = peF32Bits(0xbe800000);
    let z_span = peF32Bits(0x3f000000);
    return Math.fround(z_base - Math.fround(unit * z_span));
}

/** R7 pure post: scale = unit·0.3 + 0.7. */
export function roomAmbient824a70BodyScale(unit) {
    let mul = peF32Bits(0x3e99999a);
    let add = peF32Bits(0x3f333333);
    return Math.fround(Math.fround(unit * mul) + add);
}

/* ---- H5 body residual pure posts beyond unit-float (helpers ABI v22) ---- */

/** R5/R6 pure post: genrand low bit (entity+0x148 / +0x149 store is host). */
export function roomAmbient824a70BodyFlagBit(genrand) {
  return (genrand >>> 0) & 1;
}

/** R4 pure gate: anim count nonzero → conditional genrand runs. */
export function roomAmbient824a70BodyAnimFrameGenrandNeeded(animCount) {
  return ((animCount >>> 0) !== 0) ? 1 : 0;
}

/**
 * R4 pure post: unsigned genrand % anim_count.
 * PE skips genrand when count==0 and keeps frame 0.
 */
export function roomAmbient824a70BodyAnimFrame(genrand, animCount) {
    if (animCount == 0) return 0;
    return genrand % animCount;
}

/** A2 pure prep: cvtdq2ps of signed frame index. */
export function roomAmbient824a70BodyAnimFrameF32(frameIndex) {
  return Math.fround(frameIndex | 0);
}

/* ---- H5 create residual pure CF (helpers ABI v25; shipped as part of v26) ---- */

/**
 * A2 dual gate PE 0x00824cf50x00824cfe: host 0x408e00 only when A1 al
 * nonzero AND dword [entity+0x48+0x34] nonzero. a1Ok is zero-extended al.
 */
export function roomAmbient824a70BodyAnimFrameApplyNeeded(a1Ok, field34) {
  return ((a1Ok >>> 0) !== 0 && (field34 >>> 0) !== 0) ? 1 : 0;
}

/**
 * A2 post-clear gate PE 0x00824d0f0x00824d16: after host 0x408e00, if
 * [esi+0x34] still nonzero then byte [esi+0x44]=0. Supply post-call field.
 */
export function roomAmbient824a70BodyAnimFrameClearNeeded(field34Post) {
  return ((field34Post >>> 0) !== 0) ? 1 : 0;
}

/**
 * Combined R4 pure posts for HostHandler sample path (one create loop).
 * Host still owns genrand when needed; this consumes dword + anim_count only.
 */
export function roomAmbient824a70BodyAnimFramePosts(genrand, animCount) {
  const out = {};
    let needed =
        roomAmbient824a70BodyAnimFrameGenrandNeeded(animCount);
    let frame =
        roomAmbient824a70BodyAnimFrame(genrand, animCount);
    out.genrandNeeded = needed;
    out.frame = frame;

    out.frameF32 = roomAmbient824a70BodyAnimFrameF32(
        (frame));
  return out;
}

/* ---- H5 create residual LC pure CF after R4/A2 (helpers ABI v33 create-only) ---- */

/**
 * LC pure gate PE 0x00824e940x00824e9d after host GetLayer:
 * dest = layer* + 0x48; write only when dest != stack_color_ptr (u32 wrap).
 */
export function roomAmbient824a70BodyLayerColorWriteNeeded(layerPtr, stackColorPtr) {
    /* PE 0x00824e94 lea ecx,[eax+0x48] — the add wraps u32 (layer
       0xffffffc0 -> dest 0x08). Double addition would miss the wrap
       (measured: the differential's wrap row). */
    let dest =
        (((layerPtr >>> 0) + ROOM_AMBIENT_824A70_LAYER_COLOR_OFF) >>> 0);
    return dest != ((stackColorPtr >>> 0)) ? 1 : 0;
}

/**
 * LC pad payload PE zeros at [esp+0x64/0x68/0x6c] (R6 residual writes) copied
 * into ColorMod +0x20/+0x28 when LC write runs.
 */
export function roomAmbient824a70BodyLayerColorPads() {
  const out = {};
    out.qwordLo = 0;
    out.qwordHi = 0;
    out.dword = 0;
  return out;
}

/**
 * Combined LC pure plan for HostHandler sample path (one create loop).
 * ColorMod.a is sample-supplied only (PE residual never writes [esp+0x50]).
 */
export function roomAmbient824a70BodyLayerColorPlan({
  layerPtr,
  stackColorPtr,
  r = 0,
  g = 0,
  b = 0,
  alphaDefined = 0,
  alpha = 0,
} = {}) {
  const out = {};
    out.writeNeeded = roomAmbient824a70BodyLayerColorWriteNeeded(
        layerPtr, stackColorPtr);
    out.r = r;
    out.g = g;
    out.b = b;
    out.alphaDefined = alphaDefined != 0 ? 1 : 0;
    out.alpha = alpha;
    out.padQwordLo = 0;
    out.padQwordHi = 0;
    out.padDword = 0;
    out.colorOff = ROOM_AMBIENT_824A70_LAYER_COLOR_OFF;
    out.zero16Off = ROOM_AMBIENT_824A70_LAYER_COLOR_ZERO16_OFF;
    out.padQwordOff =
        ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_QWORD_OFF;
    out.padDwordOff =
        ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_DWORD_OFF;
  return out;
}

/* ---- H5 create residual deepen C0/A0/A1/A2/GetLayer (helpers ABI 39 create-only) ---- */

export function roomAmbient824a70EffectType() {
  return ROOM_AMBIENT_824A70_EFFECT_TYPE >>> 0;
}
export function roomAmbient824a70EffectVariant() {
  return ROOM_AMBIENT_824A70_EFFECT_VARIANT >>> 0;
}
export function roomAmbient824a70LayerIndex() {
  return ROOM_AMBIENT_824A70_LAYER_INDEX >>> 0;
}
export function roomAmbient824a70AnmDataPtr() {
  return ROOM_AMBIENT_824A70_ANM_DATA_PTR >>> 0;
}
export function roomAmbient824a70A1Arg() {
  return ROOM_AMBIENT_824A70_A1_ARG >>> 0;
}
export function roomAmbient824a70EntityAnm2Off() {
  return ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF >>> 0;
}
export function roomAmbient824a70AnimCountOff() {
  return ROOM_AMBIENT_824A70_ANIM_COUNT_OFF >>> 0;
}
export function roomAmbient824a70Anm2Field34Off() {
  return ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF >>> 0;
}
export function roomAmbient824a70Anm2Field44Off() {
  return ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF >>> 0;
}
export function roomAmbient824a70A2ThisOff() {
  return ROOM_AMBIENT_824A70_A2_THIS_OFF >>> 0;
}
export function roomAmbient824a70VcallOff() {
  return ROOM_AMBIENT_824A70_VCALL_OFF >>> 0;
}
export function roomAmbient824a70CreateArgZero() {
  return ROOM_AMBIENT_824A70_CREATE_ARG_ZERO >>> 0;
}
export function roomAmbient824a70GamePtrGlobal() {
  return ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL >>> 0;
}

export function roomAmbient824a70HostVaCreate() {
  return ROOM_AMBIENT_824A70_HOST_VA_CREATE >>> 0;
}
export function roomAmbient824a70HostVaCreateSite() {
  return ROOM_AMBIENT_824A70_HOST_VA_CREATE_SITE >>> 0;
}
export function roomAmbient824a70HostVaCreateStart() {
  return ROOM_AMBIENT_824A70_HOST_VA_CREATE_START >>> 0;
}
export function roomAmbient824a70HostVaA0() {
  return ROOM_AMBIENT_824A70_HOST_VA_A0 >>> 0;
}
export function roomAmbient824a70HostVaA0Site() {
  return ROOM_AMBIENT_824A70_HOST_VA_A0_SITE >>> 0;
}
export function roomAmbient824a70HostVaA1() {
  return ROOM_AMBIENT_824A70_HOST_VA_A1 >>> 0;
}
export function roomAmbient824a70HostVaA1Site() {
  return ROOM_AMBIENT_824A70_HOST_VA_A1_SITE >>> 0;
}
export function roomAmbient824a70HostVaA2() {
  return ROOM_AMBIENT_824A70_HOST_VA_A2 >>> 0;
}
export function roomAmbient824a70HostVaA2Site() {
  return ROOM_AMBIENT_824A70_HOST_VA_A2_SITE >>> 0;
}
export function roomAmbient824a70HostVaGetLayer() {
  return ROOM_AMBIENT_824A70_HOST_VA_GETLAYER >>> 0;
}
export function roomAmbient824a70HostVaGetLayerSite() {
  return ROOM_AMBIENT_824A70_HOST_VA_GETLAYER_SITE >>> 0;
}
export function roomAmbient824a70HostVaVcallSite() {
  return ROOM_AMBIENT_824A70_HOST_VA_VCALL_SITE >>> 0;
}

/** PE 0x00824ccb: lea esi, [entity+0x48] (u32 wrap). */
export function roomAmbient824a70EntityAnm2Ptr(entityPtr) {
  return (((entityPtr >>> 0) + (ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF >>> 0)) >>> 0);
}

/** PE 0x00824d04: lea ecx, [anm2+0x30] for host 0x408e00 (u32 wrap). */
export function roomAmbient824a70A2ThisPtr(anm2Ptr) {
  return (((anm2Ptr >>> 0) + (ROOM_AMBIENT_824A70_A2_THIS_OFF >>> 0)) >>> 0);
}

/**
 * C0 pure arg pack PE 0x00824c9c0x00824cbd (imms + host R3 seed).
 * Host still owns Vector* leas + opaque_call_006fe410.
 */
export function roomAmbient824a70CreateArgsPlan(seed = 0) {
  const out = {};
    out.effectType = ROOM_AMBIENT_824A70_EFFECT_TYPE;
    out.effectVariant = ROOM_AMBIENT_824A70_EFFECT_VARIANT;
    out.arg4Zero = ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
    out.arg5Zero = ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
    out.seed = seed;
    out.arg7Zero = ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
    out.gamePtrGlobal = ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL;
  return out;
}

/**
 * Combined create residual host-gate pack (R4 + A2 PE-accurate clear + imms).
 * When applyNeeded==0, clear is never reached (clearNeeded=0).
 */
export function roomAmbient824a70CreateHostGates({
  animCount = 0,
  a1Ok = 0,
  field34 = 0,
  field34Post = 0,
} = {}) {
  const out = {};
    let r4 =
        roomAmbient824a70BodyAnimFrameGenrandNeeded(animCount);
    let apply =
        roomAmbient824a70BodyAnimFrameApplyNeeded(a1Ok, field34);

    let clear =
        apply == 0
            ? 0
            : roomAmbient824a70BodyAnimFrameClearNeeded(field34Post);
    out.r4GenrandNeeded = r4;
    out.a2ApplyNeeded = apply;
    out.a2ClearNeeded = clear;
    out.layerIndex = ROOM_AMBIENT_824A70_LAYER_INDEX;
    out.a1Arg = ROOM_AMBIENT_824A70_A1_ARG;
    out.anmDataPtr = ROOM_AMBIENT_824A70_ANM_DATA_PTR;
    out.entityAnm2Off = ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF;
    out.animCountOff = ROOM_AMBIENT_824A70_ANIM_COUNT_OFF;
    out.a2ThisOff = ROOM_AMBIENT_824A70_A2_THIS_OFF;
    out.field34Off = ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF;
    out.field44Off = ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF;
    out.vcallOff = ROOM_AMBIENT_824A70_VCALL_OFF;
    out.hostC0 = 1;
    out.hostA0 = 1;
    out.hostA1 = 1;
    out.hostA2 = apply;
    out.hostL0 = 1;
    out.hostV0 = 1;
  return out;
}

/* ---- H5 genrand residual pure CF + sample-stream consumers (helpers ABI v33) ---- */

export function roomAmbient824a70HostVaR0() {
  return ROOM_AMBIENT_824A70_HOST_VA_R0 >>> 0;
}
export function roomAmbient824a70HostVaR1() {
  return ROOM_AMBIENT_824A70_HOST_VA_R1 >>> 0;
}
export function roomAmbient824a70HostVaR2() {
  return ROOM_AMBIENT_824A70_HOST_VA_R2 >>> 0;
}
export function roomAmbient824a70HostVaR3() {
  return ROOM_AMBIENT_824A70_HOST_VA_R3 >>> 0;
}
export function roomAmbient824a70HostVaR4() {
  return ROOM_AMBIENT_824A70_HOST_VA_R4 >>> 0;
}
export function roomAmbient824a70HostVaR5() {
  return ROOM_AMBIENT_824A70_HOST_VA_R5 >>> 0;
}
export function roomAmbient824a70HostVaR6() {
  return ROOM_AMBIENT_824A70_HOST_VA_R6 >>> 0;
}
export function roomAmbient824a70HostVaR7() {
  return ROOM_AMBIENT_824A70_HOST_VA_R7 >>> 0;
}
export function roomAmbient824a70HostVaGenrand() {
  return ROOM_AMBIENT_824A70_HOST_VA_GENRAND >>> 0;
}
export function roomAmbient824a70HostVaLoop() {
  return ROOM_AMBIENT_824A70_HOST_VA_LOOP >>> 0;
}

/**
 * Y0 pure resolve VA 0x00824c3a0x00824c4a (between R1 and R2):
 * age!=0 → room_y_1c + 600; else keep rng_y.
 */
export function roomAmbient824a70BodyPosYFinal(rngY, age, roomY1c) {
    if (roomAmbient824a70BodyYOverrideApplies(age) == 0) {
      return rngY;
    }
    return roomAmbient824a70BodyYOverride(roomY1c);
}

/**
 * LP pure CF VA 0x00824ec70x00824ecc: sub loop_count,1; jne R0.
 * Input is pre-decrement loop_count from [esp+0x14].
 */
export function roomAmbient824a70BodyLoopStep(loopCount) {
  const out = {};
    let remaining = loopCount - 1;
    out.remaining = remaining;
    out.continueLoop = remaining != 0 ? 1 : 0;
  return out;
}

/**
 * Combined pure posts for one always-on genrand loop (R0–R3,R5–R7).
 */
export function roomAmbient824a70BodyGenrandLoopPosts(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    let u0 = roomAmbient824a70BodyUnitFloat(state.g0);
    let u1 = roomAmbient824a70BodyUnitFloat(state.g1);
    let u2 = roomAmbient824a70BodyUnitFloat(state.g2);
    let u7 = roomAmbient824a70BodyUnitFloat(state.g7);

    let x = roomAmbient824a70BodyPosAxis(state.minX, u0, state.spanX);
    let y_rng =
        roomAmbient824a70BodyPosAxis(state.baseY, u1, state.spanY);
    let y_applies =
        roomAmbient824a70BodyYOverrideApplies(state.age);
    let y =
        roomAmbient824a70BodyPosYFinal(y_rng, state.age, state.roomY1c);

    out.x = x;
    out.yRng = y_rng;
    out.y = y;
    out.z = roomAmbient824a70BodyZ(u2);
    out.velPad = Math.fround(0.0);
    out.seed = state.g3;
    out.flag148 = roomAmbient824a70BodyFlagBit(state.g5);
    out.flag149 = roomAmbient824a70BodyFlagBit(state.g6);
    out.scale = roomAmbient824a70BodyScale(u7);
    out.yOverrideApplies = y_applies;

    out.posXCopy = x;

    {
      const pads = roomAmbient824a70BodyLayerColorPads();
      out.padQwordLo = pads.qwordLo;
      out.padQwordHi = pads.qwordHi;
      out.padDword = pads.dword;
    }
  return out;
}

/**
 * Genrand residual sample-stream plan (freestanding; ships under helpers ABI 39).
 */
export function roomAmbient824a70GenrandStreamPlan(loopCount, sampleCount = 0) {
  const out = {};
    let lc = loopCount > 0 ? loopCount : 0;
    let sc = sampleCount > 0 ? sampleCount : 0;
    out.loopCount = lc;
    out.samplesPerLoop =
        (ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP);
    out.maxGenrandPerLoop =
        (ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP);
    out.samplesNeeded = lc * out.samplesPerLoop;
    out.sampleCount = sc;
    if (lc == 0) {

      out.samplesReady = 1;
      out.purePostsReady = 1;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      out.requiresSampleStream = 0;
      return out;
    }

    out.hostNeeded = 1;
    out.requiresSampleStream = 1;
    out.samplesReady = sc >= out.samplesNeeded ? 1 : 0;
    out.purePostsReady = out.samplesReady;
    out.pureComplete = 0;
  return out;
}

/* ---- H5 FUN_00824a70 residual plan / wire matrix (helpers ABI v24 freestanding) ---- */

/** Residual kinds: NONE (skip) / BODY (pure prep + genrand host) / MONOLITHIC. */
export const ROOM_AMBIENT_824A70_RESIDUAL_NONE = 0;
export const ROOM_AMBIENT_824A70_RESIDUAL_BODY = 1;
export const ROOM_AMBIENT_824A70_RESIDUAL_MONOLITHIC = 2;

/**
 * Cadence age + loop_count from body_bounds (no room floats).
 * age = inactive ? -1 : frame - entry; loop_count = age==0 ? 5 : 1.
 */
export function roomAmbient824a70CadenceAgeLoop(
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
) {
  const inactive = ((roomActiveByte0 >>> 0) & 0xff) === 0 ? 1 : 0;
  const age = inactive ? -1 : ((frame264f8 | 0) - (roomEntry11f0 | 0)) | 0;
  const loopCount = age === 0 ? 5 : 1;
  return { age, loopCount };
}

function roomAmbient824a70FillPlan(needs, residualKind, loopCount, age) {
  const out = {};
    out.needsHost = needs != 0 ? 1 : 0;
    out.residualKind = residualKind;
    out.pureComplete =
        residualKind == ROOM_AMBIENT_824A70_RESIDUAL_NONE ? 1 : 0;
    out.hostNeeded = out.pureComplete == 0 ? 1 : 0;
    out.loopCount = loopCount;
    out.age = age;
  return out;
}

/**
 * Full residual plan when all gate inputs are available (never MONOLITHIC).
 * needs_host false → NONE; true → BODY with loop_count/age from cadence.
 */
export function roomAmbient824a70ResidualPlan(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    let needs = roomAmbient824a70NeedsHost({
        mode26584: state.mode26584, dim1830c: state.dim1830c,
        stageIdResolved: state.stageIdResolved, roomType8: state.roomType8,
        roomSubtype1bb0: state.roomSubtype1bb0, game18304: state.game18304,
        difficulty269c8: state.difficulty269c8, stage0: state.stage0,
        stageType4: state.stageType4, flags2654c: state.flags2654c,
        roomActiveByte0: state.roomActiveByte0, frame264f8: state.frame264f8,
        roomEntry11f0: state.roomEntry11f0});
    if (needs == 0) {
      return roomAmbient824a70FillPlan(0, ROOM_AMBIENT_824A70_RESIDUAL_NONE, 0, 0);
    }
    const cadence = roomAmbient824a70CadenceAgeLoop(
        state.roomActiveByte0, state.frame264f8, state.roomEntry11f0);
    return roomAmbient824a70FillPlan(
        1, ROOM_AMBIENT_824A70_RESIDUAL_BODY, cadence.loopCount, cadence.age);
}

/**
 * Wire-decision matrix (freestanding).
 * !gate_ready → MONOLITHIC; needs false → NONE;
 * needs && !blob_ready → MONOLITHIC; needs && blob_ready → BODY.
 */
export function roomAmbient824a70WireDecide(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    if (state.gateReady == 0) {
      return roomAmbient824a70FillPlan(0, ROOM_AMBIENT_824A70_RESIDUAL_MONOLITHIC, 0, 0);
    }
    let needs = roomAmbient824a70NeedsHost({
        mode26584: state.mode26584, dim1830c: state.dim1830c,
        stageIdResolved: state.stageIdResolved, roomType8: state.roomType8,
        roomSubtype1bb0: state.roomSubtype1bb0, game18304: state.game18304,
        difficulty269c8: state.difficulty269c8, stage0: state.stage0,
        stageType4: state.stageType4, flags2654c: state.flags2654c,
        roomActiveByte0: state.roomActiveByte0, frame264f8: state.frame264f8,
        roomEntry11f0: state.roomEntry11f0});
    if (needs == 0) {
      return roomAmbient824a70FillPlan(0, ROOM_AMBIENT_824A70_RESIDUAL_NONE, 0, 0);
    }

    if (state.blobReady == 0) {
      return roomAmbient824a70FillPlan(1, ROOM_AMBIENT_824A70_RESIDUAL_MONOLITHIC, 0, 0);
    }
    const cadence = roomAmbient824a70CadenceAgeLoop(
        state.roomActiveByte0, state.frame264f8, state.roomEntry11f0);
    return roomAmbient824a70FillPlan(
        1, ROOM_AMBIENT_824A70_RESIDUAL_BODY, cadence.loopCount, cadence.age);
}

/* ---- B1 first-frame pure islands (helpers ABI v20 + v22 freestanding; not Update-wired) ---- */

/** PE-exact B1 SFX Play imms at VA 0x00802a490x00802a82. */
export const ROOM_B1_SFX_ID = 0xbe;
export const ROOM_B1_SFX_VOLUME = (() => {
  const u = new Uint32Array([0x3f800000]);
  return new Float32Array(u.buffer)[0];
})();
export const ROOM_B1_SFX_PLAY_FRAME_DELAY = 2;
export const ROOM_B1_SFX_PLAY_LOOP = 0;
export const ROOM_B1_SFX_PLAY_PITCH = ROOM_B1_SFX_VOLUME; /* 1.0f */
export const ROOM_B1_SFX_PLAY_PAN = 0;
export const ROOM_B1_SPAWN_RADIUS = (() => {
  const u = new Uint32Array([0x41c00000]);
  return new Float32Array(u.buffer)[0];
})();
export const ROOM_B1_BUFFER_ELEM_STRIDE = 0x78;
export const ROOM_B1_COLLECTIBLE_ID = 0x89;

export const ROOM_B1_HOST_VA_SFX = 0x00802a53;
export const ROOM_B1_HOST_VA_SFX_PRE = 0x00956780;
export const ROOM_B1_HOST_VA_SFX_PLAY = 0x0092dc30;
export const ROOM_B1_HOST_VA_SPAWN_SETUP = 0x00802b60;
export const ROOM_B1_HOST_VA_OWNER = 0x00802b7d;
export const ROOM_B1_HOST_VA_QUALITY = 0x00802b92;
export const ROOM_B1_HOST_VA_SHUFFLE_COPY = 0x004d3130;
export const ROOM_B1_HOST_VA_SHUFFLE_ASSIGN = 0x004d3230;
export const ROOM_B1_HOST_VA_SHUFFLE_DTOR = 0x004d6ee0; /* exact EntitySaveState::destructor */
export const ROOM_B1_HOST_VA_POSITION = 0x00802da4;
export const ROOM_B1_HOST_VA_SPAWN = 0x00802dc4;
export const ROOM_B1_HOST_VA_POST_BIND = 0x00802dd5;
export const ROOM_B1_HOST_VA_CLEANUP = 0x00802e1a;

export const ROOM_B1_RESIDUAL_NONE = 0;
export const ROOM_B1_RESIDUAL_SFX = 1;
export const ROOM_B1_RESIDUAL_SPAWN = 2;
export const ROOM_B1_RESIDUAL_SFX_SPAWN = 3;
export const ROOM_B1_RESIDUAL_MONOLITHIC = 4;

export const ROOM_B1_SEED_OK = 0;
export const ROOM_B1_SEED_FATAL_PRE_SHUFFLE = 1;
export const ROOM_B1_SEED_FATAL_PRE_CORNER = 2;

/** Outer gate: Room active byte nonzero and (frame - entry) == 1. */
export function roomB1FrameInRoomGate(roomActiveByte0, frame264f8, roomEntry11f0) {
    if ((roomActiveByte0 & 0xff) == 0) return 0;
    return ((frame264f8 - roomEntry11f0) == 1) ? 1 : 0;
}

/** Once-path when (Game+0x1839c & 0x80000) == 0. */
export function roomB1OnceFlagClear(flags60e7) {
  return (((flags60e7 >>> 0) & 0x80000) === 0) ? 1 : 0;
}

/** Pure once-flag apply: flags |= 0x80000. */
export function roomB1FlagOr80000(flags60e7) {
  return ((flags60e7 >>> 0) | 0x80000) >>> 0;
}

/**
 * Four interior-corner grid indices from Room+0xc (W) / +0x10 (H).
 * Matches PE local_1f8[4] after Game+0x1839c |= 0x80000.
 */
export function roomB1CornerIndices(widthC, height10) {
  const out = {};
    let w = widthC;
    let h = height10;

    if (w < 2 || h < 2) {
      out.c0 = -1;
    } else {
      out.c0 = w + 1;
    }

    let col_inner = w - 2;
    if (col_inner < 0 || w <= col_inner || h < 2) {
      out.c1 = -1;
      if (w > 1) {
        let row_inner = h - 2;
        if (row_inner < 0 || h <= row_inner) {
          out.c2 = -1;
        } else {
          out.c2 = row_inner * w + 1;
        }
      } else {
        out.c2 = -1;
      }
    } else {
      out.c1 = w + col_inner;
      {
        let row_inner = h - 2;
        if (row_inner < 0 || h <= row_inner) {
          out.c2 = -1;
        } else {
          out.c2 = row_inner * w + 1;
        }
      }
    }

    {
      let row_inner = h - 2;
      if (col_inner < 0 || w <= col_inner || row_inner < 0 || h <= row_inner) {
        out.c3 = -1;
      } else {
        out.c3 = row_inner * w + w - 2;
      }
    }
  return out;
}

/**
 * Nested SFX residual gate under outer frame-in-room (does not re-test outer).
 * difficulty/stage are int reinterprets of Game float-slot bits.
 */
export function roomB1SfxNeedsHost({
  roomType8,
  descField40,
  difficulty269c8,
  stage0,
  nestedField10,
  flags60e7,
  bossId1bb0,
}) {
    if (roomType8 != 5) return 0;
    if (descField40 != 1) return 0;
    if (bossId1bb0 == 0) return 0;

    let greed =
        (difficulty269c8 == 2 || difficulty269c8 == 3) ? 1 : 0;
    if (greed != 0 && stage0 == 7 && nestedField10 == 0 &&
        (flags60e7 & 0x1000) == 0) {
      return 0;
    }
    return 1;
}

/** Legacy float reinterp of Game slots 0x60e9/ea. Prefer bits helper. */
export function roomB1SpawnBufferNonempty(begin60e9, end60ea) {
  return Math.fround(begin60e9) !== Math.fround(end60ea) ? 1 : 0;
}

/** PE dword buffer gate Game+0x183a4 != Game+0x183a8. */
export function roomB1SpawnBufferNonemptyBits(begin183a4, end183a8) {
  return ((begin183a4 >>> 0) !== (end183a8 >>> 0)) ? 1 : 0;
}

/** Once-path spawn host residual: flag clear AND buffer nonempty. */
export function roomB1OncePathNeedsSpawnHost(flags60e7, begin183a4, end183a8) {
    if (roomB1OnceFlagClear(flags60e7) == 0) return 0;
    return roomB1SpawnBufferNonemptyBits(begin183a4, end183a8);
}

/** PE base spawn count from owner + quality of collectible 0x89. */
export function roomB1SpawnBaseCount(ownerNonzero, quality) {
    let base = 4;
    if (ownerNonzero == 0) return base;
    let q = quality - 2;
    if (q == 0) return 6;
    q = q - 1;
    if (q == 0) return 8;
    return base;
}

/** PE clamp: min_u32(base, signed(byte_len / 0x78)). */
export function roomB1SpawnCountClamp(baseCount, bufferByteLen) {
    let buffer_count = ((bufferByteLen >>> 0) / 0x78) | 0;
    let b = (baseCount | 0);
    let c = (buffer_count | 0);
    return (b < c ? b : c);
}

/** PE xorshift with shifts 1, 9, 29. */
export function roomB1RngXorshift(seed) {
    let x = seed >>> 0;
    x = ((x >>> 1) ^ x) >>> 0;
    x = (((x << 9) >>> 0) ^ x) >>> 0;
    x = ((x >>> 29) ^ x) >>> 0;
    return x;
}

/** local_1f8[rng & 3]. */
export function roomB1CornerPick(corners, rngState) {
    const table = [corners.c0, corners.c1, corners.c2, corners.c3];
    return table[rngState & 3];
}

const PE_B1_CELL = (() => {
  const u = new Uint32Array([0x42200000]);
  return new Float32Array(u.buffer)[0];
})();
const PE_B1_Y0 = (() => {
  const u = new Uint32Array([0x42f00000]);
  return new Float32Array(u.buffer)[0];
})();

/** Grid index → world xy (signed idiv width; PE DAT floats). */
export function roomB1CornerWorldXy(cornerIndex, widthC) {
  const out = {};
    let w = widthC | 0;
    let quot = ((cornerIndex | 0) / w) | 0;
    let rem = (cornerIndex | 0) % w;
    let cell = peF32Bits(0x42200000);
    let y0 = peF32Bits(0x42f00000);
    out.x = (rem) * cell + cell;
    out.y = (quot) * cell + y0;
  return out;
}

/** entity+0x32c = -1 after host spawn. */
export function roomB1EntityPostSpawnMark(_prev = 0) {
  return -1 | 0;
}

/** PE Fisher-Yates remainder: remaining==0 → 0 else rng % remaining (u32). */
export function roomB1ShuffleRemainder(rngState, remaining) {
    if ((remaining | 0) == 0) return 0;
    /* PE 0x00802c72 is UNSIGNED div (div ecx, not idiv): the modulo takes
       remaining as uint32 — negative int32 remainders wrap huge. */
    return (rngState >>> 0) % (remaining >>> 0);
}

/** Swap when remainder != 0. */
export function roomB1ShuffleNeedsSwap(remainder) {
  return ((remainder >>> 0) !== 0) ? 1 : 0;
}

export function roomB1BufferElemStride() {
  return ROOM_B1_BUFFER_ELEM_STRIDE | 0;
}

/** PE index * 0x78 (signed int32 multiply). */
export function roomB1BufferElemOffset(index) {
  return ((index | 0) * ROOM_B1_BUFFER_ELEM_STRIDE) | 0;
}

export function roomB1SpawnRadius() {
  return ROOM_B1_SPAWN_RADIUS;
}

export function roomB1SfxId() {
  return ROOM_B1_SFX_ID >>> 0;
}

export function roomB1SfxPlayVolume() {
  return ROOM_B1_SFX_VOLUME;
}

export function roomB1SfxPlayFrameDelay() {
  return ROOM_B1_SFX_PLAY_FRAME_DELAY | 0;
}

export function roomB1SfxPlayLoop() {
  return ROOM_B1_SFX_PLAY_LOOP | 0;
}

export function roomB1SfxPlayPitch() {
  return ROOM_B1_SFX_PLAY_PITCH;
}

export function roomB1SfxPlayPan() {
  return Math.fround(ROOM_B1_SFX_PLAY_PAN);
}

function roomB1KindFromSfxSpawn(sfx, spawn) {
    if (sfx != 0 && spawn != 0) return ROOM_B1_RESIDUAL_SFX_SPAWN;
    if (sfx != 0) return ROOM_B1_RESIDUAL_SFX;
    if (spawn != 0) return ROOM_B1_RESIDUAL_SPAWN;
    return ROOM_B1_RESIDUAL_NONE;
}

function roomB1FillSfxPlayImms(out) {
  out.sfxId = ROOM_B1_SFX_ID >>> 0;
  out.sfxVolume = ROOM_B1_SFX_VOLUME;
  out.sfxFrameDelay = ROOM_B1_SFX_PLAY_FRAME_DELAY | 0;
  out.sfxLoop = ROOM_B1_SFX_PLAY_LOOP | 0;
  out.sfxPitch = ROOM_B1_SFX_PLAY_PITCH;
  out.sfxPan = Math.fround(ROOM_B1_SFX_PLAY_PAN);
  return out;
}

function roomB1FillPlanFromKind(outer, sfx, once, spawn, kind) {
  const out = {};
    out.outerGate = outer != 0 ? 1 : 0;
    out.sfxNeedsHost = sfx != 0 ? 1 : 0;
    out.onceFlagClear = once != 0 ? 1 : 0;
    out.spawnNeedsHost = spawn != 0 ? 1 : 0;
    out.residualKind = kind;
    out.pureComplete =
        kind == ROOM_B1_RESIDUAL_NONE ? 1 : 0;
    out.hostNeeded = out.pureComplete == 0 ? 1 : 0;
    out.pureOnceFlagApply =
        (outer != 0 && once != 0) ? 1 : 0;
    roomB1FillSfxPlayImms(out);
  return out;
}

/**
 * Full residual plan when all sparse inputs are available (no MONOLITHIC).
 * Uses pre-OR flags for once/spawn gates.
 */
export function roomB1ResidualPlan(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    let outer = roomB1FrameInRoomGate(
        state.roomActiveByte0, state.frame264f8, state.roomEntry11f0);
    if (outer == 0) {
      return roomB1FillPlanFromKind(0, 0, 0, 0, ROOM_B1_RESIDUAL_NONE);
    }
    let sfx = roomB1SfxNeedsHost({
        roomType8: state.roomType8, descField40: state.descField40,
        difficulty269c8: state.difficulty269c8, stage0: state.stage0,
        nestedField10: state.nestedField10, flags60e7: state.flags60e7,
        bossId1bb0: state.bossId1bb0});
    let once = roomB1OnceFlagClear(state.flags60e7);
    let spawn = roomB1OncePathNeedsSpawnHost(
        state.flags60e7, state.begin183a4, state.end183a8);
    return roomB1FillPlanFromKind(1, sfx, once, spawn, roomB1KindFromSfxSpawn(sfx, spawn));
}

/**
 * Wire-decision matrix (freestanding). Missing inputs under an open outer
 * gate force MONOLITHIC. Outer closed → NONE without sfx/buffer packs.
 */
export function roomB1WireDecide(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    if (state.outerReady == 0) {
      return roomB1FillPlanFromKind(0, 0, 0, 0, ROOM_B1_RESIDUAL_MONOLITHIC);
    }
    let outer = roomB1FrameInRoomGate(
        state.roomActiveByte0, state.frame264f8, state.roomEntry11f0);
    if (outer == 0) {
      return roomB1FillPlanFromKind(0, 0, 0, 0, ROOM_B1_RESIDUAL_NONE);
    }

    let once = roomB1OnceFlagClear(state.flags60e7);
    if (state.sfxReady == 0 || (once != 0 && state.bufferReady == 0)) {
      const plan = roomB1FillPlanFromKind(1, 0, once, 0, ROOM_B1_RESIDUAL_MONOLITHIC);
      plan.pureOnceFlagApply = once != 0 ? 1 : 0;
      return plan;
    }
    let sfx = roomB1SfxNeedsHost({
        roomType8: state.roomType8, descField40: state.descField40,
        difficulty269c8: state.difficulty269c8, stage0: state.stage0,
        nestedField10: state.nestedField10, flags60e7: state.flags60e7,
        bossId1bb0: state.bossId1bb0});
    let spawn = 0;
    if (once != 0) {
      spawn = roomB1SpawnBufferNonemptyBits(state.begin183a4, state.end183a8);
    }
    return roomB1FillPlanFromKind(1, sfx, once, spawn, roomB1KindFromSfxSpawn(sfx, spawn));
}

/* ---- B1 spawn-loop pure CF (helpers ABI v26 freestanding; not Update-wired) ---- */

/** PE push imm 0x89 into owner/quality host calls. */
export function roomB1CollectibleId() {
  return ROOM_B1_COLLECTIBLE_ID >>> 0;
}

/** PE signed (end - begin) EntitySaveState buffer byte length. */
export function roomB1BufferByteLen(begin183a4, end183a8) {
  return ((end183a8 >>> 0) - (begin183a4 >>> 0)) | 0;
}

/** PE enter spawn loop when spawn_count > 0. */
export function roomB1SpawnLoopEnter(spawnCount) {
  return ((spawnCount | 0) > 0) ? 1 : 0;
}

/** PE remaining = spawn_count - i. */
export function roomB1LoopRemaining(spawnCount, index) {
  return ((spawnCount | 0) - (index | 0)) | 0;
}

/** PE seed != 0 (else fatal). */
export function roomB1SeedNonzero(seed) {
  return ((seed >>> 0) !== 0) ? 1 : 0;
}

/** PE swap target index = i + remainder. */
export function roomB1ShuffleSwapIndex(index, remainder) {
  return ((index | 0) + (remainder >>> 0)) | 0;
}

/** PE continue loop when next_i < spawn_count. */
export function roomB1LoopContinue(nextIndex, spawnCount) {
  return ((nextIndex | 0) < (spawnCount | 0)) ? 1 : 0;
}

/** Composite base_count + clamp(buffer_byte_len). */
export function roomB1SpawnCountResolved(ownerNonzero, quality, begin183a4, end183a8) {
    let base = roomB1SpawnBaseCount(ownerNonzero, quality);
    let len = roomB1BufferByteLen(begin183a4, end183a8);
    return roomB1SpawnCountClamp(base, len);
}

/** PE FUN_00813520 trailing zero pads (three push 0). */
export function roomB1PositionZeroPad() {
  return 0;
}

export function roomB1HostVaOwner() {
  return ROOM_B1_HOST_VA_OWNER >>> 0;
}
export function roomB1HostVaQuality() {
  return ROOM_B1_HOST_VA_QUALITY >>> 0;
}
export function roomB1HostVaPostBind() {
  return ROOM_B1_HOST_VA_POST_BIND >>> 0;
}
export function roomB1HostVaShuffleCopy() {
  return ROOM_B1_HOST_VA_SHUFFLE_COPY >>> 0;
}
export function roomB1HostVaShuffleAssign() {
  return ROOM_B1_HOST_VA_SHUFFLE_ASSIGN >>> 0;
}
export function roomB1HostVaShuffleDtor() {
  return ROOM_B1_HOST_VA_SHUFFLE_DTOR >>> 0;
}

/**
 * One spawn-loop iteration pure plan (seed→shuffle→corner→world).
 * Host still owns EntitySaveState shuffle / position / spawn / bind.
 */
export function roomB1SpawnIterPlan({
  seedIn,
  index,
  spawnCount,
  corners,
  widthC,
}) {
  const out = {};
    out.seedFatal = ROOM_B1_SEED_OK;
    out.remaining = roomB1LoopRemaining(spawnCount, index);
    out.seedShuffle = 0;
    out.shuffleRem = 0;
    out.needsSwap = 0;
    out.swapIndex = index;
    out.elemOffset = roomB1BufferElemOffset(index);
    out.swapOffset = out.elemOffset;
    out.seedCorner = 0;
    out.cornerIndex = -1;
    out.worldX = Math.fround(0.0);
    out.worldY = Math.fround(0.0);
    out.spawnRadius = roomB1SpawnRadius();
    out.nextI = index + 1;
    out.continueLoop =
        roomB1LoopContinue(out.nextI, spawnCount);

    if (roomB1SeedNonzero(seedIn) == 0) {
      out.seedFatal = ROOM_B1_SEED_FATAL_PRE_SHUFFLE;
      return out;
    }

    let seed_shuffle = roomB1RngXorshift(seedIn);
    out.seedShuffle = seed_shuffle;
    let rem =
        roomB1ShuffleRemainder(seed_shuffle, out.remaining);
    out.shuffleRem = rem;
    out.needsSwap = roomB1ShuffleNeedsSwap(rem);
    out.swapIndex = roomB1ShuffleSwapIndex(index, rem);
    out.swapOffset = roomB1BufferElemOffset(out.swapIndex);

    if (roomB1SeedNonzero(seed_shuffle) == 0) {
      out.seedFatal = ROOM_B1_SEED_FATAL_PRE_CORNER;
      return out;
    }

    let seed_corner = roomB1RngXorshift(seed_shuffle);
    out.seedCorner = seed_corner;
    out.cornerIndex = roomB1CornerPick(corners, seed_corner);
    if (widthC != 0) {
      const world = roomB1CornerWorldXy(out.cornerIndex, widthC);
      out.worldX = world.x;
      out.worldY = world.y;
    }
  return out;
}

/* ---- B9–B11 residual pure peels (helpers ABI v35 freestanding). ---- */

export const ROOM_B9B11_CHALLENGE_ID = 0x226;
export const ROOM_B9B11_CHALLENGE_ROOM_TYPE = 0x11;
export const ROOM_B9B11_CHALLENGE_FRAME_AGE = 4;
export const ROOM_B9B11_MODE_TYPE_B = 0xb;
export const ROOM_B9B11_MODE_TYPE_11 = 0x11;
export const ROOM_B9B11_FRAME_AGE1 = 1;
export const ROOM_B9B11_STAGE_ID_1A = 0x1a;
export const ROOM_B9B11_FREE_ENTITY_TYPE = 5;
export const ROOM_B9B11_FREE_ENTITY_VARIANT = 0x64;
export const ROOM_B9B11_TEMPFX_VARIANT = 0x1e1;
export const ROOM_B9B11_TEMPFX_STRIDE = 0x10;

export const ROOM_B9B11_HOST_VA_B9_START = 0x00803ce5;
export const ROOM_B9B11_HOST_VA_QUERY = 0x009be080;
export const ROOM_B9B11_HOST_VA_FREE_LOOKUP = 0x0041af60;
export const ROOM_B9B11_HOST_VA_FREE_HELPER = 0x00833420;
export const ROOM_B9B11_HOST_VA_MODE_HOOKS = 0x00834350;
export const ROOM_B9B11_HOST_VA_FLAG_11F4 = 0x007fe220;
export const ROOM_B9B11_HOST_VA_B10_START = 0x00803e0a;
export const ROOM_B9B11_HOST_VA_FATAL = 0x00a112c0;
export const ROOM_B9B11_HOST_VA_B11_START = 0x00803e70;
export const ROOM_B9B11_HOST_VA_MANAGER_A = 0x004186c0;
export const ROOM_B9B11_HOST_VA_MANAGER_B = 0x00993a70;
export const ROOM_B9B11_HOST_VA_409030 = 0x00409030;
export const ROOM_B9B11_HOST_VA_40A5D0 = 0x0040a5d0;
export const ROOM_B9B11_HOST_VA_REWIND = 0x0040a1b0;
export const ROOM_B9B11_HOST_VA_83A080 = 0x0083a080;
export const ROOM_B9B11_HOST_VA_7EB870 = 0x007eb870;
export const ROOM_B9B11_HOST_VA_GENRAND = 0x006eef60;
export const ROOM_B9B11_HOST_VA_CAMERA = 0x007df690;
export const ROOM_B9B11_HOST_VA_930820 = 0x00930820;
export const ROOM_B9B11_HOST_VA_8020D0 = 0x008020d0;
export const ROOM_B9B11_HOST_VA_B12_START = 0x00804113;

export const ROOM_B9B11_RESIDUAL_ALWAYS_HOST = 1;
export const ROOM_B9B11_RESIDUAL_MONOLITHIC = 2;

/** frame_age = (frame - entry) signed int32. */
export function roomB9B11FrameAge(frame264f8, roomEntry11f0) {
  return ((frame264f8 | 0) - (roomEntry11f0 | 0)) | 0;
}

/**
 * B9 challenge free-body gate after host FirstCollectibleOwner.
 * result!=0 && active && age==4 && type==0x11 && ((flags>>3)&1)==0.
 */
export function roomB9B11ChallengeBodyNeedsHost(
  challengeResultNonzero,
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
  roomType8,
  roomDescFlags44,
) {
    if (challengeResultNonzero == 0) return 0;
    if ((roomActiveByte0 & 0xff) == 0) return 0;
    if (roomB9B11FrameAge(frame264f8, roomEntry11f0) !=
        ROOM_B9B11_CHALLENGE_FRAME_AGE) {
      return 0;
    }
    if (roomType8 != ROOM_B9B11_CHALLENGE_ROOM_TYPE) return 0;
    if (((roomDescFlags44 >> 3) & 1) != 0) return 0;
    return 1;
}

/** B9 mode hooks: (type==0xb || type==0x11) && Game+0x997a != 0. */
export function roomB9B11ModeHooksNeedsHost(roomType8, game997aByte) {
    if (roomType8 != ROOM_B9B11_MODE_TYPE_B &&
        roomType8 != ROOM_B9B11_MODE_TYPE_11) {
      return 0;
    }
    if ((game997aByte & 0xff) == 0) return 0;
    return 1;
}

/** B9 Room+0x11f4 nonzero. */
export function roomB9B11Flag11f4NeedsHost(roomByte11f4) {
  return (((roomByte11f4 >>> 0) & 0xff) !== 0) ? 1 : 0;
}

/** B10 pure enemies = max(0, 12c8+12cc) signed wrap. */
export function roomB9B11B10Enemies(count12c8, count12cc) {
    let sum = (count12c8 + count12cc) | 0;
    return sum > 0 ? sum : 0;
}

/** B10 fatal: enemies < 1 && old_7224 > 0 (pre-snapshot). */
export function roomB9B11B10FatalNeedsHost(enemies, old7224) {
    if (!(enemies < 1)) return 0;
    if (!(old7224 > 0)) return 0;
    return 1;
}

/** B11 double 409030 when Room+0x1d0d != 0. */
export function roomB9B11Double409030NeedsHost(roomByte1d0d) {
  return (((roomByte1d0d >>> 0) & 0xff) !== 0) ? 1 : 0;
}

/** B11 stage-id outer Room+0x1d18 == 0x1a. */
export function roomB9B11Stage1aNeedsHost(room1d18) {
  return ((room1d18 | 0) === ROOM_B9B11_STAGE_ID_1A) ? 1 : 0;
}

/** B11 7eb870: active && age==1. */
export function roomB9B11FrameAge1NeedsHost(roomActiveByte0, frame264f8, roomEntry11f0) {
    if ((roomActiveByte0 & 0xff) == 0) return 0;
    return roomB9B11FrameAge(frame264f8, roomEntry11f0) ==
                   ROOM_B9B11_FRAME_AGE1
               ? 1
               : 0;
}

/** TempFX flag clear: Room+0x7321 == 0. */
export function roomB9B11TempfxFlagClear(roomByte7321) {
  return (((roomByte7321 >>> 0) & 0xff) === 0) ? 1 : 0;
}

export function roomB9B11TempfxListEmpty(listBegin7314, listEnd7318) {
  return ((listBegin7314 >>> 0) === (listEnd7318 >>> 0)) ? 1 : 0;
}

export function roomB9B11TempfxWalkNeedsHost(roomByte7321, listBegin7314, listEnd7318) {
    if (roomB9B11TempfxFlagClear(roomByte7321) == 0) return 0;
    if (roomB9B11TempfxListEmpty(listBegin7314, listEnd7318) != 0) {
      return 0;
    }
    return 1;
}

export function roomB9B11TempfxListContinue(cur, end) {
  return ((cur >>> 0) !== (end >>> 0)) ? 1 : 0;
}

/** type ∈ {1,3,4} && variant == 0x1e1. */
export function roomB9B11TempfxIsCandidate(effectType, effectVariant) {
    if (!(effectType == 1 || effectType == 3 || effectType == 4)) return 0;
    if (effectVariant != ROOM_B9B11_TEMPFX_VARIANT) return 0;
    return 1;
}

/**
 * Residual plan when all sparse inputs known (never MONOLITHIC).
 * Always ALWAYS_HOST; pure_complete always 0 (manager chain).
 */
export function roomB9B11ResidualPlan(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    let enemies = roomB9B11B10Enemies(state.count12c8, state.count12cc);
    out.challengeBodyNeedsHost = roomB9B11ChallengeBodyNeedsHost(
        state.challengeResultNonzero, state.roomActiveByte0, state.frame264f8, state.roomEntry11f0,
        state.roomType8, state.roomDescFlags44);
    out.modeHooksNeedsHost =
        roomB9B11ModeHooksNeedsHost(state.roomType8, state.game997aByte);
    out.flag11f4NeedsHost =
        roomB9B11Flag11f4NeedsHost(state.roomByte11f4);
    out.b10Enemies = enemies;
    out.b10FatalNeedsHost =
        roomB9B11B10FatalNeedsHost(enemies, state.old7224);
    out.double409030NeedsHost =
        roomB9B11Double409030NeedsHost(state.roomByte1d0d);
    out.stage1aNeedsHost = roomB9B11Stage1aNeedsHost(state.room1d18);
    out.frameAge1NeedsHost = roomB9B11FrameAge1NeedsHost(
        state.roomActiveByte0, state.frame264f8, state.roomEntry11f0);
    out.tempfxWalkNeedsHost = roomB9B11TempfxWalkNeedsHost(
        state.roomByte7321, state.listBegin7314, state.listEnd7318);

    out.residualKind = ROOM_B9B11_RESIDUAL_ALWAYS_HOST;
    out.pureComplete = 0;
    out.hostNeeded = 1;
  return out;
}

/** Wire matrix: !inputsReady → MONOLITHIC; else residual_plan. */
export function roomB9B11WireDecide(inputsReady, input) {
  const out = {};
    if (inputsReady == 0) {
      out.challengeBodyNeedsHost = 0;
      out.modeHooksNeedsHost = 0;
      out.flag11f4NeedsHost = 0;
      out.b10Enemies = 0;
      out.b10FatalNeedsHost = 0;
      out.double409030NeedsHost = 0;
      out.stage1aNeedsHost = 0;
      out.frameAge1NeedsHost = 0;
      out.tempfxWalkNeedsHost = 0;
      out.residualKind = ROOM_B9B11_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      return out;
    }
    return roomB9B11ResidualPlan(input);
}

/* ---- TailMid residual pure islands (helpers freestanding; package ABI v36). ---- */

export const ROOM_TAILMID_CURSE_FLAG_BIT = 0x4000;
export const ROOM_TAILMID_SPECIAL_FLAG_BIT = 0x1000;
export const ROOM_TAILMID_DESC_CLEAR_BIT40 = 0x40;
export const ROOM_TAILMID_WAVE_TIMER_GATE = 0x14;
export const ROOM_TAILMID_WAVE_TIMER_SET = 0x13;
export const ROOM_TAILMID_SPECIAL_STAGE = 7;
export const ROOM_TAILMID_SPECIAL_ROOM_TYPE = 5;
export const ROOM_TAILMID_CURSE_EFFECT_TYPE = 0x3e8;
export const ROOM_TAILMID_CURSE_EFFECT_VARIANT = 0x7f;
export const ROOM_TAILMID_SPECIAL_EFFECT_TYPE = 0x14;
export const ROOM_TAILMID_SPECIAL_EFFECT_VARIANT = 0;
export const ROOM_TAILMID_CURSE_POS_VEC_PTR = 0x00c7b640;
export const ROOM_TAILMID_CURSE_HALF_BITS = 0x3f000000;
export const ROOM_TAILMID_CURSE_VEL_SCALE_BITS = 0x43480000;
export const ROOM_TAILMID_SFX_ID = 0xbe;
export const ROOM_TAILMID_SFX_VOLUME_BITS = 0x3f800000;
export const ROOM_TAILMID_SFX_FRAME_DELAY = 2;
export const ROOM_TAILMID_SFX_LOOP = 0;
export const ROOM_TAILMID_SFX_PITCH_BITS = 0x3f800000;
export const ROOM_TAILMID_SFX_PAN_BITS = 0;
export const ROOM_TAILMID_MUSIC_ID = 9;

export const ROOM_TAILMID_HOST_VA_GATE = 0x00805378;
export const ROOM_TAILMID_HOST_VA_ISPAUSED = 0x006fd350;
export const ROOM_TAILMID_HOST_VA_CURSE = 0x00820910;
export const ROOM_TAILMID_HOST_VA_CURSE_GENRAND = 0x006eef60;
export const ROOM_TAILMID_HOST_VA_CURSE_GETPLAYER = 0x00417870;
export const ROOM_TAILMID_HOST_VA_CURSE_CREATE = 0x006fe410;
export const ROOM_TAILMID_HOST_VA_CURSE_SQRT = 0x00435a50;
export const ROOM_TAILMID_HOST_VA_801EE0 = 0x00801ee0;
export const ROOM_TAILMID_HOST_VA_SPAWN_WAVE = 0x00816910;
export const ROOM_TAILMID_HOST_VA_MUSIC = 0x007e1d50;
export const ROOM_TAILMID_HOST_VA_TRIGGER_OUTPUT = 0x00823080;
export const ROOM_TAILMID_HOST_VA_SFX_PRE = 0x00956780;
export const ROOM_TAILMID_HOST_VA_SFX_PLAY = 0x0092dc30;
export const ROOM_TAILMID_HOST_VA_800500 = 0x00800500;
export const ROOM_TAILMID_HOST_VA_NEXT = 0x008053e2;

/* FUN_00800500 body pure islands (package ABI v37 freestanding). */
export const ROOM_TAILMID_800500_ROOM_ENTITY_COUNT_OFF = 0x1264;
export const ROOM_TAILMID_800500_ROOM_ENTITY_LIST_OFF = 0x125c;
export const ROOM_TAILMID_800500_ROOM_TIMER_72FC_OFF = 0x72fc;
export const ROOM_TAILMID_800500_TYPE_BAND_BASE = 10;
export const ROOM_TAILMID_800500_TYPE_BAND_SPAN = 0x3dd;
export const ROOM_TAILMID_800500_TYPE_PLAYER = 1;
export const ROOM_TAILMID_800500_TYPE_TEAR = 7;
export const ROOM_TAILMID_800500_TYPE_EFFECT = 1000;
export const ROOM_TAILMID_800500_FLAG_168_MASK = 0x20;
export const ROOM_TAILMID_800500_FLAG_16C_MASK = 0x2000000;
export const ROOM_TAILMID_800500_ABS_MASK = 0x7fffffff;
export const ROOM_TAILMID_800500_DEFAULT_INTENSITY_BITS = 0x3f800000;
export const ROOM_TAILMID_800500_STEP_HALF_BITS = 0x3f000000;
export const ROOM_TAILMID_800500_STEP_SMALL_BITS = 0x3cf5c28f;
export const ROOM_TAILMID_800500_DIST_SCALE_BITS = 0x43e10000;
export const ROOM_TAILMID_800500_TIMER_SFX_GATE = 10;
export const ROOM_TAILMID_800500_TIMER_SFX_ID = 0x1cc;
export const ROOM_TAILMID_800500_TIMER_CLEAR = 0xffffffff;
export const ROOM_TAILMID_800500_CH_7084 = 0x10d;
export const ROOM_TAILMID_800500_CH_7088 = 4;
export const ROOM_TAILMID_800500_CH_708C = 0x117;
export const ROOM_TAILMID_800500_CH_70C0 = 0x264;

export const ROOM_TAILMID_HOST_VA_800500_PLAYER_POS = 0x009beba0;
export const ROOM_TAILMID_HOST_VA_800500_ISLOCAL = 0x0090b100;
export const ROOM_TAILMID_HOST_VA_800500_BODY = 0x00800754;
export const ROOM_TAILMID_HOST_VA_800500_EMPTY = 0x00801137;
export const ROOM_TAILMID_HOST_VA_800500_EPILOGUE = 0x00801544;
export const ROOM_TAILMID_HOST_VA_800500_INTENSITY = 0x0092e620;
export const ROOM_TAILMID_HOST_VA_800500_ISPLAYING = 0x0092e560;
export const ROOM_TAILMID_HOST_VA_800500_TIMER = 0x00801bf9;

export const ROOM_TAILMID_FRAG_NONE = 0;
export const ROOM_TAILMID_FRAG_HOST = 1;
export const ROOM_TAILMID_FRAG_MONOLITHIC = 2;
export const ROOM_TAILMID_RESIDUAL_NONE = 0;
export const ROOM_TAILMID_RESIDUAL_HOST = 1;
export const ROOM_TAILMID_RESIDUAL_MONOLITHIC = 2;

const PE_TAILMID_HALF = (() => {
  const u = new Uint32Array([ROOM_TAILMID_CURSE_HALF_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_TAILMID_VEL_SCALE = (() => {
  const u = new Uint32Array([ROOM_TAILMID_CURSE_VEL_SCALE_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_TAILMID_SFX_VOLUME = (() => {
  const u = new Uint32Array([ROOM_TAILMID_SFX_VOLUME_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_TAILMID_SFX_PITCH = (() => {
  const u = new Uint32Array([ROOM_TAILMID_SFX_PITCH_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_TAILMID_SFX_PAN = (() => {
  const u = new Uint32Array([ROOM_TAILMID_SFX_PAN_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();

export function roomTailmidGameHasCurseBit(gameFlags1839c) {
  return ((gameFlags1839c >>> 0) & ROOM_TAILMID_CURSE_FLAG_BIT) !== 0 ? 1 : 0;
}

export function roomTailmidDescLacksCurseBit(roomDescFlags44) {
  return ((roomDescFlags44 >>> 0) & ROOM_TAILMID_CURSE_FLAG_BIT) === 0 ? 1 : 0;
}

export function roomTailmidRoomIsActive(roomActiveByte0) {
  return ((roomActiveByte0 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function roomTailmidFrameAgeIsOne(frame264f8, roomEntry11f0) {
  return (((frame264f8 | 0) - (roomEntry11f0 | 0)) | 0) === 1 ? 1 : 0;
}

/**
 * Outer curse gate. isPaused is zero-extended Game::IsPaused al (host sample).
 */
export function roomTailmidNeedsCurseHost(
  gameFlags1839c,
  roomDescFlags44,
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
  isPaused,
) {
    if (roomTailmidGameHasCurseBit(gameFlags1839c) == 0) return 0;
    if (roomTailmidDescLacksCurseBit(roomDescFlags44) == 0) return 0;
    if (roomTailmidRoomIsActive(roomActiveByte0) == 0) return 0;
    if (roomTailmidFrameAgeIsOne(frame264f8, roomEntry11f0) == 0) {
      return 0;
    }

    if ((isPaused & 0xff) != 0) return 0;
    return 1;
}

export function roomTailmidCurseFlagOr4000(roomDescFlags44) {
  return ((roomDescFlags44 >>> 0) | ROOM_TAILMID_CURSE_FLAG_BIT) >>> 0;
}

export function roomTailmidCurseEffectType() {
  return ROOM_TAILMID_CURSE_EFFECT_TYPE >>> 0;
}
export function roomTailmidCurseEffectVariant() {
  return ROOM_TAILMID_CURSE_EFFECT_VARIANT >>> 0;
}
export function roomTailmidCursePosVecPtr() {
  return ROOM_TAILMID_CURSE_POS_VEC_PTR >>> 0;
}
export function roomTailmidCurseArgZero() {
  return 0;
}

export function roomTailmidCurseCenters(roomF14, roomF18, roomF1c, roomF20) {
  const out = {};
    let half = peBitsToF32(ROOM_TAILMID_CURSE_HALF_BITS);
    out.spanY = roomF1c - roomF14;
    out.spanX = roomF20 - roomF18;
    out.centerY = roomF14 + out.spanY * half;
    out.centerX = roomF18 + out.spanX * half;
  return out;
}

/** PE axis-cross: dx = player_x - center_y; dy = player_y - center_x. */
export function roomTailmidCurseDeltas(playerX, playerY, centerX, centerY) {
  const out = {};
    out.dx = playerX - centerY;
    out.dy = playerY - centerX;
  return out;
}

export function roomTailmidCursePosIsZeroVec(posX, posY, zeroX, zeroY) {
    return (posX == zeroX && posY == zeroY) ? 1 : 0;
}

export function roomTailmidCurseVelScale(dist) {
    if (!(dist > Math.fround(0.0))) return Math.fround(0.0);
    let scale200 =
        peBitsToF32(ROOM_TAILMID_CURSE_VEL_SCALE_BITS);
    return scale200 / dist;
}

export function roomTailmid801ee0IsGreedMode(difficulty269c8) {
    return (difficulty269c8 == 2 || difficulty269c8 == 3) ? 1 : 0;
}

export function roomTailmid801ee0BossCount(count12c0, count12c4) {
    let sum = count12c0 + count12c4;
    return sum > 0 ? sum : 0;
}

export function roomTailmid801ee0NeedsTimerResetHost(postTimer723c, bossCount) {
    if (bossCount > 0) return 0;
    return postTimer723c >= ROOM_TAILMID_WAVE_TIMER_GATE ? 1 : 0;
}

export function roomTailmid801ee0NeedsSpawnWaveHost(postTimer723c, preTimer723c) {
    if (!(preTimer723c > 0)) return 0;
    return postTimer723c == 0 ? 1 : 0;
}

export function roomTailmid801ee0NeedsSpecialHost(
  stage0,
  roomType8,
  gameFlags1839c,
  playerCount,
) {
    if (stage0 != ROOM_TAILMID_SPECIAL_STAGE) return 0;
    if (roomType8 != ROOM_TAILMID_SPECIAL_ROOM_TYPE) return 0;
    if ((gameFlags1839c & ROOM_TAILMID_SPECIAL_FLAG_BIT) != 0) return 0;
    return playerCount != 0 ? 1 : 0;
}

export function roomTailmid801ee0TimerSet13() {
  return ROOM_TAILMID_WAVE_TIMER_SET | 0;
}

export function roomTailmid801ee0DescClearBit40(roomDescFlags44) {
  return ((roomDescFlags44 >>> 0) & ~ROOM_TAILMID_DESC_CLEAR_BIT40) >>> 0;
}

export function roomTailmid801ee0GameFlagOr1000(gameFlags1839c) {
  return ((gameFlags1839c >>> 0) | ROOM_TAILMID_SPECIAL_FLAG_BIT) >>> 0;
}

export function roomTailmidSpecialEffectType() {
  return ROOM_TAILMID_SPECIAL_EFFECT_TYPE >>> 0;
}
export function roomTailmidSpecialEffectVariant() {
  return ROOM_TAILMID_SPECIAL_EFFECT_VARIANT >>> 0;
}
export function roomTailmidSfxId() {
  return ROOM_TAILMID_SFX_ID >>> 0;
}
export function roomTailmidSfxVolume() {
  return PE_TAILMID_SFX_VOLUME;
}
export function roomTailmidSfxFrameDelay() {
  return ROOM_TAILMID_SFX_FRAME_DELAY | 0;
}
export function roomTailmidSfxLoop() {
  return ROOM_TAILMID_SFX_LOOP | 0;
}
export function roomTailmidSfxPitch() {
  return PE_TAILMID_SFX_PITCH;
}
export function roomTailmidSfxPan() {
  return PE_TAILMID_SFX_PAN;
}
export function roomTailmidMusicId() {
  return ROOM_TAILMID_MUSIC_ID >>> 0;
}

export function roomTailmid800500EarlySkip(isPaused, gate1b83c) {
    if ((isPaused & 0xff) == 0) return 0;
    return gate1b83c == 0 ? 1 : 0;
}

const PE_800500_DEFAULT_INTENSITY = (() => {
  const u = new Uint32Array([ROOM_TAILMID_800500_DEFAULT_INTENSITY_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_800500_STEP_HALF = (() => {
  const u = new Uint32Array([ROOM_TAILMID_800500_STEP_HALF_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_800500_STEP_SMALL = (() => {
  const u = new Uint32Array([ROOM_TAILMID_800500_STEP_SMALL_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();
const PE_800500_DIST_SCALE = (() => {
  const u = new Uint32Array([ROOM_TAILMID_800500_DIST_SCALE_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();

export function roomTailmid800500EntityListEmpty(count1264) {
  return (count1264 >>> 0) === 0 ? 1 : 0;
}

export function roomTailmid800500DefaultIntensity() {
  return PE_800500_DEFAULT_INTENSITY;
}

export function roomTailmid800500AvgIntensity(sum, count) {
    if (count <= 0) {
      return roomTailmid800500DefaultIntensity();
    }

    return sum / (count);
}

export function roomTailmid800500TypeInThreatBand(type28) {
    return (((type28 - ROOM_TAILMID_800500_TYPE_BAND_BASE) >>> 0) <=
                   (ROOM_TAILMID_800500_TYPE_BAND_SPAN >>> 0))
               ? 1
               : 0;
}

export function roomTailmid800500OuterIncludeCandidate(gameDim26614, type28) {
    if (gameDim26614 >= 2 &&
        type28 == ROOM_TAILMID_800500_TYPE_PLAYER) {
      return 1;
    }
    return roomTailmid800500TypeInThreatBand(type28);
}

export function roomTailmid800500OuterIsTearType(type28) {
  return (type28 | 0) === ROOM_TAILMID_800500_TYPE_TEAR ? 1 : 0;
}

export function roomTailmid800500OuterIsEffectType(type28) {
  return (type28 | 0) === ROOM_TAILMID_800500_TYPE_EFFECT ? 1 : 0;
}

export function roomTailmid800500EntityInclude(
  entityNonzero,
  gameDim26614,
  type28,
  flagByte173,
  shortC74,
  float39c,
  int31c,
  flags168,
  flags16c,
) {
    if (entityNonzero == 0) return 0;
    if (roomTailmid800500OuterIncludeCandidate(gameDim26614,
                                                          type28) == 0) {
      return 0;
    }
    if ((flagByte173 & 0xff) != 0) return 0;
    if (shortC74 > 0) return 0;

    if (!(float39c > Math.fround(0.0))) return 0;
    if (int31c > 0) return 0;
    let masked =
        (flags168 & ROOM_TAILMID_800500_FLAG_168_MASK) |
        (flags16c & ROOM_TAILMID_800500_FLAG_16C_MASK);
    if (masked != 0) return 0;
    return 1;
}

export function roomTailmid800500AbsDiff(a, b) {
    let delta = a - b;
    let bits =
        peF32ToBits(delta) & ROOM_TAILMID_800500_ABS_MASK;
    return peBitsToF32(bits);
}

export function roomTailmid800500Approach(curr, target, step) {
    let absdiff = roomTailmid800500AbsDiff(curr, target);
    if (!(step < absdiff)) {
      return target;
    }
    if (target <= curr) {
      return curr - step;
    }
    return curr + step;
}

export function roomTailmid800500StepHalf() {
  return PE_800500_STEP_HALF;
}
export function roomTailmid800500StepSmall() {
  return PE_800500_STEP_SMALL;
}
export function roomTailmid800500DistScale() {
  return PE_800500_DIST_SCALE;
}

export function roomTailmid800500Timer72fcNeedsHost(timer72fc) {
  return (timer72fc | 0) >= 0 ? 1 : 0;
}
export function roomTailmid800500Timer72fcInc(timer72fc) {
  return ((timer72fc | 0) + 1) | 0;
}
export function roomTailmid800500Timer72fcNeedsSfxPlay(postInc) {
  return (postInc | 0) === ROOM_TAILMID_800500_TIMER_SFX_GATE ? 1 : 0;
}
export function roomTailmid800500Timer72fcNeedsIsplayingHost(postInc) {
  return (postInc | 0) > ROOM_TAILMID_800500_TIMER_SFX_GATE ? 1 : 0;
}
export function roomTailmid800500Timer72fcClearNeg1() {
  return ROOM_TAILMID_800500_TIMER_CLEAR | 0;
}

export function roomTailmid800500RoomEntityCountOff() {
  return ROOM_TAILMID_800500_ROOM_ENTITY_COUNT_OFF >>> 0;
}
export function roomTailmid800500RoomEntityListOff() {
  return ROOM_TAILMID_800500_ROOM_ENTITY_LIST_OFF >>> 0;
}
export function roomTailmid800500RoomTimer72fcOff() {
  return ROOM_TAILMID_800500_ROOM_TIMER_72FC_OFF >>> 0;
}
export function roomTailmid800500TimerSfxId() {
  return ROOM_TAILMID_800500_TIMER_SFX_ID >>> 0;
}
export function roomTailmid800500TimerSfxGate() {
  return ROOM_TAILMID_800500_TIMER_SFX_GATE >>> 0;
}
export function roomTailmid800500Ch7084() {
  return ROOM_TAILMID_800500_CH_7084 >>> 0;
}
export function roomTailmid800500Ch7088() {
  return ROOM_TAILMID_800500_CH_7088 >>> 0;
}
export function roomTailmid800500Ch708c() {
  return ROOM_TAILMID_800500_CH_708C >>> 0;
}
export function roomTailmid800500Ch70c0() {
  return ROOM_TAILMID_800500_CH_70C0 >>> 0;
}
export function roomTailmidHostVa800500PlayerPos() {
  return ROOM_TAILMID_HOST_VA_800500_PLAYER_POS >>> 0;
}
export function roomTailmidHostVa800500Islocal() {
  return ROOM_TAILMID_HOST_VA_800500_ISLOCAL >>> 0;
}
export function roomTailmidHostVa800500Body() {
  return ROOM_TAILMID_HOST_VA_800500_BODY >>> 0;
}
export function roomTailmidHostVa800500Empty() {
  return ROOM_TAILMID_HOST_VA_800500_EMPTY >>> 0;
}
export function roomTailmidHostVa800500Epilogue() {
  return ROOM_TAILMID_HOST_VA_800500_EPILOGUE >>> 0;
}
export function roomTailmidHostVa800500Intensity() {
  return ROOM_TAILMID_HOST_VA_800500_INTENSITY >>> 0;
}
export function roomTailmidHostVa800500Isplaying() {
  return ROOM_TAILMID_HOST_VA_800500_ISPLAYING >>> 0;
}
export function roomTailmidHostVa800500Timer() {
  return ROOM_TAILMID_HOST_VA_800500_TIMER >>> 0;
}

export function roomTailmid801ee0FragmentKind(difficulty269c8) {
    return roomTailmid801ee0IsGreedMode(difficulty269c8) != 0
               ? ROOM_TAILMID_FRAG_HOST
               : ROOM_TAILMID_FRAG_NONE;
}

export function roomTailmid800500FragmentKind(isPaused, gate1b83c) {
    return roomTailmid800500EarlySkip(isPaused, gate1b83c) != 0
               ? ROOM_TAILMID_FRAG_NONE
               : ROOM_TAILMID_FRAG_HOST;
}

export function roomTailmidCurseFragmentKind(
  gameFlags1839c,
  roomDescFlags44,
  roomActiveByte0,
  frame264f8,
  roomEntry11f0,
  isPaused,
) {
    return roomTailmidNeedsCurseHost(
               gameFlags1839c, roomDescFlags44, roomActiveByte0,
               frame264f8, roomEntry11f0, isPaused) != 0
               ? ROOM_TAILMID_FRAG_HOST
               : ROOM_TAILMID_FRAG_NONE;
}

/**
 * Suite residual plan when all fragment inputs known.
 */
export function roomTailmidResidualPlan(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    out.needsCurseHost = roomTailmidNeedsCurseHost(
        state.gameFlags1839c, state.roomDescFlags44, state.roomActiveByte0, state.frame264f8,
        state.roomEntry11f0, state.isPausedCurse);
    out.curseKind = out.needsCurseHost != 0 ? ROOM_TAILMID_FRAG_HOST
                                                 : ROOM_TAILMID_FRAG_NONE;
    out.kind801ee0 = roomTailmid801ee0FragmentKind(state.difficulty269c8);
    out.needs801ee0Host =
        out.kind801ee0 == ROOM_TAILMID_FRAG_HOST ? 1 : 0;
    out.kind800500 =
        roomTailmid800500FragmentKind(state.isPaused800500, state.gate1b83c);
    out.needs800500Host =
        out.kind800500 == ROOM_TAILMID_FRAG_HOST ? 1 : 0;
    if (out.needsCurseHost == 0 && out.needs801ee0Host == 0 &&
        out.needs800500Host == 0) {
      out.residualKind = ROOM_TAILMID_RESIDUAL_NONE;
      out.pureComplete = 1;
      out.hostNeeded = 0;
      return out;
    }
    out.residualKind = ROOM_TAILMID_RESIDUAL_HOST;
    out.pureComplete = 0;
    out.hostNeeded = 1;
  return out;
}

/** Wire matrix: !inputsReady → MONOLITHIC; else residual_plan. */
export function roomTailmidWireDecide(inputsReady, input) {
  const out = {};
    if (inputsReady == 0) {
      out.curseKind = ROOM_TAILMID_FRAG_MONOLITHIC;
      out.kind801ee0 = ROOM_TAILMID_FRAG_MONOLITHIC;
      out.kind800500 = ROOM_TAILMID_FRAG_MONOLITHIC;
      out.residualKind = ROOM_TAILMID_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      out.needsCurseHost = 0;
      out.needs801ee0Host = 0;
      out.needs800500Host = 0;
      return out;
    }
    return roomTailmidResidualPlan(input);
}

/* ---- B3–B7 residual pure islands (helpers ABI v36 freestanding). ---- */

export const ROOM_B3_COLLECTIBLE_ID = 0x28d;
export const ROOM_B3_CHALLENGE_ID = 0x2a5;
export const ROOM_B3_TE_TYPE = 0;
export const ROOM_B3_TE_VARIANT = 0x40;
export const ROOM_B3_TE_STRIDE = 0x10;
export const ROOM_B3_TE_PUSH_PTR = 0x00c5d108;
export const ROOM_B3_FLAG_OFF = 0x7768;
export const ROOM_B3_TE_GATE_OFF = 0x7321;
export const ROOM_B3_TE_BEGIN_OFF = 0x7314;
export const ROOM_B3_TE_END_OFF = 0x7318;
export const ROOM_B3_GAME_OWNER_OFF = 0x1baa8;

export const ROOM_B4_DESC_TYPE_GATE = -0x14;
export const ROOM_B4_XOR_SHIFT1 = 5;
export const ROOM_B4_XOR_SHIFT2 = 9;
export const ROOM_B4_XOR_SHIFT3 = 7;
export const ROOM_B4_MOD100_MAGIC = 0x51eb851f;
export const ROOM_B4_Y_OFFSET_BITS = 0x42000000;
export const ROOM_B4_PICKUP_DEFAULT = 0x32;
export const ROOM_B4_PICKUP_T0 = 0x35;
export const ROOM_B4_PICKUP_T1 = 0x34;
export const ROOM_B4_PICKUP_T2 = 0x33;
export const ROOM_B4_PICKUP_T3 = 0x168;
export const ROOM_B4_PICKUP_T4 = 0x3c;
export const ROOM_B4_BAND_NONE = 0;
export const ROOM_B4_BAND_A = 1;
export const ROOM_B4_BAND_B = 2;
export const ROOM_B4_BAND_C = 3;
export const ROOM_B4_BAND_D = 4;
export const ROOM_B4_BAND_A_REM = 0x19;
export const ROOM_B4_BAND_B_REM = 0x32;
export const ROOM_B4_BAND_C_REM = 0x3c;
export const ROOM_B4_BAND_D_REM = 0x3d;
export const ROOM_B4_SPAWN_TYPE_1000 = 0x3e8;
export const ROOM_B4_SPAWN_VARIANT_A1 = 0xa1;
export const ROOM_B4_ENTITY_TYPE5 = 5;
export const ROOM_B4_BAND_A_VARIANT = 0x12c;
export const ROOM_B4_BAND_A_SUB = 0x31;
export const ROOM_B4_BAND_B_VARIANT = 0x15e;
export const ROOM_B4_BAND_B_SUB = 0x7a;
export const ROOM_B4_BAND_C_VARIANT = 0x12c;
export const ROOM_B4_BAND_C_SUB = 0x5a;
export const ROOM_B4_BAND_D_VARIANT = 0x64;
export const ROOM_B4_BAND_D_SUB = 0x20b;
export const ROOM_B4_THIRD_VARIANT = 0x5a;
export const ROOM_B4_SPAWN_ARG_PTR = 0x00c7b640;
export const ROOM_B4_SEED_ADD = 0x3e8;
export const ROOM_B4_GAME_SEED_OFF = 0x18308;
export const ROOM_B4_ENTITY_SEED_OFF = 0x30;
export const ROOM_B4_DESC_SEED_OFF = 0x5c;
export const ROOM_B4_PICKUP_SUBTYPE = 1;
export const ROOM_B4_BAND_B_OPTION_OFF = 0x1b4;
export const ROOM_B4_BAND_C_OPTION_OFF = 0x2bf;
export const ROOM_B4_BAND_D_OPTION_OFF = 0x1ba;
export const ROOM_B4_POS_PAD_BITS = 0x42200000;
/* B4 host-deepen2 (ABI v39 freestanding): lookup / pos / cleanup imms. */
export const ROOM_B4_LOOKUP_SUBTYPE = -1;
export const ROOM_B4_LOOKUP_THIS_OFF = 0x1218;
export const ROOM_B4_LOOKUP_COUNT_OFF = 0xc;
export const ROOM_B4_LOOKUP_ENTITY_PTR_OFF = 4;
export const ROOM_B4_ROOM_POS_BASE_OFF = 0x14;
export const ROOM_B4_ROOM_POS_X_OFF = 0x1c;
export const ROOM_B4_ROOM_POS_Y_OFF = 0x20;
export const ROOM_B4_ROOM_ENTRY_OFF = 0x11f0;
export const ROOM_B4_ROOM_BYTE1_OFF = 1;
export const ROOM_B4_POS_FLAG0 = 0;
export const ROOM_B4_POS_FLAG1 = 0;
export const ROOM_B4_POS_FLAG2 = 1;
export const ROOM_B4_CLEANUP_CL = 1;
export const ROOM_B4_LOOKUP_PATH_NONE = 0;
export const ROOM_B4_LOOKUP_PATH_G0 = 1;
export const ROOM_B4_LOOKUP_PATH_ENTITY_SEED = 2;
export const ROOM_B4_HOST_VA_REWARD_BODY = 0x008033c2;
export const ROOM_B4_HOST_VA_G0 = 0x0080341f;
export const ROOM_B4_HOST_VA_FRAME_GATE = 0x00803472;
export const ROOM_B4_HOST_VA_G1 = 0x0080357d;
export const ROOM_B4_HOST_VA_G2A = 0x00803665;
export const ROOM_B4_HOST_VA_G2B = 0x008036c6;
export const ROOM_B4_HOST_VA_G2C = 0x0080371f;
export const ROOM_B4_HOST_VA_G2D = 0x00803761;
export const ROOM_B4_HOST_VA_G3 = 0x008037fd;
export const ROOM_B4_HOST_VA_CLEANUP_SITE = 0x00803822;
export const ROOM_B4_HOST_VA_NEXT = 0x00803854;
export const ROOM_B4_HOST_VA_POS_A_SITE = 0x0080340b;
export const ROOM_B4_HOST_VA_ENTITY_SEED = 0x00803457;
export const ROOM_B4_HOST_VA_SEED_CHECK = 0x008034da;
export const ROOM_B4_HOST_VA_SEED_FATAL = 0x00a112c0;
export const ROOM_B4_HOST_VA_REWARD_POS = 0x008035a6;
export const ROOM_B4_HOST_VA_THIRD_POS = 0x008037c6;

export const ROOM_B5_LIST_BEGIN_VA = 0x00c82674;
export const ROOM_B5_LIST_END_VA = 0x00c82678;
export const ROOM_B5_LIST_CAP_VA = 0x00c8267c;
export const ROOM_B5_PASS1_MODE = 0x28;
export const ROOM_B5_FLAG_BIT = 0x20000000;
export const ROOM_B5_TYPE_RANGE_BASE = 10;
export const ROOM_B5_TYPE_RANGE_SPAN = 0x3de;
export const ROOM_B5_MODE_GATE = 2;
export const ROOM_B5_TYPE_EXCLUDE_A = 0x2d;
export const ROOM_B5_TYPE_EXCLUDE_B = 0x54;
export const ROOM_B5_TYPE_EXCLUDE_C = 0x112;
export const ROOM_B5_TYPE_EXCLUDE_D = 0x113;
export const ROOM_B5_TYPE_EXCLUDE_E = 0x4e;
export const ROOM_B5_VARIANT_EXCLUDE_E = 0xa;
export const ROOM_B5_PASS2_COUNT_MIN = 3;
/* B5 deepen (ABI v39; concurrent package v38 was H5 stream). */
export const ROOM_B5_VCALL_OFF_48 = 0x48;
export const ROOM_B5_VCALL_OFF_4C = 0x4c;
export const ROOM_B5_LIST_PTR_STRIDE = 4;
export const ROOM_B5_ENTITY_RNG_SHIFT0_OFF = 0x3e0;
export const ROOM_B5_ENTITY_RNG_SHIFT1_OFF = 0x3e4;
export const ROOM_B5_ENTITY_RNG_SHIFT2_OFF = 0x3e8;

export const ROOM_B3_HOST_VA_START = 0x00803327;
export const ROOM_B3_HOST_VA_OWNER = 0x009be080;
export const ROOM_B3_HOST_VA_CHALLENGE = 0x009305f0;
export const ROOM_B3_HOST_VA_CHALLENGE_BODY = 0x007ea2d0;
export const ROOM_B3_HOST_VA_TE_CALL = 0x009960b0;
/* B3 host deepen (helpers ABI v39 freestanding — B3-only symbols). */
export const ROOM_B3_HOST_VA_GET_COLLECTIBLE = 0x0072fd10;
export const ROOM_B3_HOST_VA_HAS_COLLECTIBLE = 0x007706e0;
export const ROOM_B3_HOST_VA_GET_COLLECTIBLE_EFFECT = 0x00930980;
export const ROOM_B3_HOST_VA_COUNT = 0x00708250;
export const ROOM_B3_OWNER_LAZ_SHARED_TAG = 1;
export const ROOM_B3_OWNER_CONFIG_TWIN_BIT = 0x80000000;
export const ROOM_B3_OWNER_LIST_STRIDE = 4;
export const ROOM_B3_OWNER_PLAYER_OFF_2C = 0x2c;
export const ROOM_B3_OWNER_PLAYER_OFF_TWIN = 0x1e6c;
export const ROOM_B3_HCE_GATE_OFF = 0x11;
export const ROOM_B3_HCE_LIST_BEGIN_OFF = 4;
export const ROOM_B3_HCE_LIST_END_OFF = 8;
export const ROOM_B3_HCE_STRIDE = 0x10;
export const ROOM_B3_HCE_TYPE_A = 1;
export const ROOM_B3_HCE_TYPE_B = 3;
export const ROOM_B3_HCE_TYPE_C = 4;
export const ROOM_B3_HCE_COOLDOWN_OFF = 8;
export const ROOM_B3_CB_COL_E8 = 0xe8;
export const ROOM_B3_CB_COL_42 = 0x42;
export const ROOM_B3_CB_MODE_16 = 0x16;
export const ROOM_B3_CB_ROOM_FIELD_OFF = 0x1210;
export const ROOM_B3_CB_STORE_OFF = 0x2a2d4;
export const ROOM_B3_CB_TE_THIS_OFF = 0x7310;
export const ROOM_B3_CB_F_DEFAULT_BITS = 0x3f800000;
export const ROOM_B3_CB_F_DIV_BITS = 0x42b40000;
export const ROOM_B3_CB_F_MUL_BITS = 0x3f4ccccd;
export const ROOM_B3_CB_F_FLOOR_BITS = 0x3f000000;
export const ROOM_B3_CB_F_OWNER_BITS = 0x3f666666;
export const ROOM_B3_CB_F_MODE_BITS = 0x3fb70a3d;
export const ROOM_B3_CB_F_HCE_BITS = 0x3f333333;
export const ROOM_B3_CB_F_COUNT_SCALE_BITS = 0x3dcccccd;
export const ROOM_B3_CB_BASE_DEFAULT = 0;
export const ROOM_B3_CB_BASE_COOLDOWN = 1;
export const ROOM_B3_CB_BASE_HCE = 2;
export const ROOM_B3_CB_BASE_MODE = 3;
export const ROOM_B3_CB_BASE_OWNER = 4;
export const ROOM_B3_TE_CALL_THIS_OFF = 0x1618;
export const ROOM_B3_TE_CALL_COPY_DST_OFF = 0x84;
export const ROOM_B3_TE_CALL_COPY_SIZE = 0x2c;
export const ROOM_B3_TE_CALL_TIMER_OFF = 0x34;
export const ROOM_B3_TE_CALL_TIMER_MAX = 0x96;
export const ROOM_B3_TE_CALL_TIMER_INIT = 0xb4;
export const ROOM_B3_TE_CALL_BYTE71_OFF = 0x71;
export const ROOM_B3_TE_CALL_FIELD50 = 3;
export const ROOM_B3_TE_CALL_FIELD54_BITS = 0x3dcccccd;
export const ROOM_B3_TE_CALL_FIELD58_BITS = 0x3f800000;
export const ROOM_B3_TE_CALL_FIELD5C_BITS = 0xbf000000;
export const ROOM_B3_TE_CALL_FIELD60_BITS = 0x3f000000;
export const ROOM_B3_TE_CALL_F_180_BITS = 0x43340000;
export const ROOM_B3_TE_CALL_F_150_BITS = 0x43160000;
export const ROOM_B3_TE_CALL_F_30_BITS = 0x41f00000;
export const ROOM_B3_TE_CALL_IMAGE_FIELD_OFF = 0x3c;

const peB3CbBits = (bits) => {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
};
export const ROOM_B4_HOST_VA_GATE = 0x008033b6;
export const ROOM_B4_HOST_VA_LOOKUP = 0x0041af60;
export const ROOM_B4_HOST_VA_POS_A = 0x00812d00;
export const ROOM_B4_HOST_VA_POS_FINISH = 0x00813520;
export const ROOM_B4_HOST_VA_GENRAND = 0x006eef60;
export const ROOM_B4_HOST_VA_SPAWN = 0x00428b20;
export const ROOM_B4_HOST_VA_CLEANUP = 0x00a648b0;
export const ROOM_B5_HOST_VA_START = 0x00803854;
export const ROOM_B5_HOST_VA_PASS1 = 0x008038d0;
export const ROOM_B5_HOST_VA_COUNT = 0x00708250;
export const ROOM_B5_HOST_VA_PASS2 = 0x008039d0;
export const ROOM_B5_HOST_VA_VECTOR_PUSH = 0x0042c920;
export const ROOM_B5_HOST_VA_OUTER = 0x00803886;
export const ROOM_B5_HOST_VA_PASS1_VCALL48 = 0x0080391c;
export const ROOM_B5_HOST_VA_PASS1_APPEND = 0x00803954;
export const ROOM_B5_HOST_VA_PASS1_GROW = 0x00803979;
export const ROOM_B5_HOST_VA_PASS2_VCALL48 = 0x00803a24;
export const ROOM_B5_HOST_VA_PASS2_VCALL4C = 0x00803a42;
export const ROOM_B5_HOST_VA_PASS2_RNG = 0x00803a60;
export const ROOM_B5_HOST_VA_PASS2_GROW = 0x00803ad8;
export const ROOM_B5_HOST_VA_NEXT = 0x00803b1d;
export const ROOM_B6_HOST_VA_COUNTDOWN = 0x00803b1d;
export const ROOM_B6_HOST_VA_TREE = 0x00803b2e;
export const ROOM_B6_HOST_VA_TREE_INC = 0x00414a80;
export const ROOM_B6_HOST_VA_TREE_ERASE = 0x00424540;
export const ROOM_B7_HOST_VA_START = 0x00803bb4;
export const ROOM_B7_HOST_VA_LOOP = 0x00803bd0;
export const ROOM_B7_HOST_VA_VCALL = 0x00803bd8;
export const ROOM_B7_GRID_BASE_OFF = 0x24;
export const ROOM_B7_SLOT_STRIDE = 4;
export const ROOM_B7_VCALL_OFF = 8;
export const ROOM_B3B7_HOST_VA_NEXT = 0x00803bfb;

export const ROOM_B3B7_RESIDUAL_HOST = 1;
export const ROOM_B3B7_RESIDUAL_MONOLITHIC = 2;

const peB4YOffset = (() => {
  const u = new Uint32Array([ROOM_B4_Y_OFFSET_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();

export function roomB3FlagFromOwnerResult(ownerResult) {
  return (ownerResult >>> 0) !== 0 ? 1 : 0;
}

export function roomB3TempEffectsGate(byte7321) {
  return ((byte7321 >>> 0) & 0xff) === 0 ? 1 : 0;
}

export function roomB3TempEffectsListEmpty(begin7314, end7318) {
  return (begin7314 >>> 0) === (end7318 >>> 0) ? 1 : 0;
}

export function roomB3TempEffectsEntryMatch(type0, variant4) {
    return (type0 == ROOM_B3_TE_TYPE &&
            variant4 == ROOM_B3_TE_VARIANT)
               ? 1
               : 0;
}

export function roomB3TempEffectsListContinue(cur, end7318) {
    let next = cur + ROOM_B3_TE_STRIDE;
    return next != end7318 ? 1 : 0;
}

export function roomB3TempEffectsNeedsHost(byte7321, begin7314, end7318) {
    if (roomB3TempEffectsGate(byte7321) == 0) return 0;
    if (roomB3TempEffectsListEmpty(begin7314, end7318) != 0) return 0;
    return 1;
}

export function roomB4DescTypeGate(descType0) {
  return (descType0 | 0) === (ROOM_B4_DESC_TYPE_GATE | 0) ? 1 : 0;
}

export function roomB4FrameInRoomGate(roomByte1, entry11f0, frame264f8) {
    if ((roomByte1 & 0xff) == 0) return 0;
    return entry11f0 == frame264f8 ? 1 : 0;
}

export function roomB4Xorshift(seed, shift1, shift2, shift3) {
    let x = seed >>> 0;
    x = ((x >>> (shift1 & 31)) ^ x) >>> 0;
    x = (((x << (shift2 & 31)) >>> 0) ^ x) >>> 0;
    x = ((x >>> (shift3 & 31)) ^ x) >>> 0;
    return x;
}

export function roomB4XorshiftImm(seed) {
  return roomB4Xorshift(seed, ROOM_B4_XOR_SHIFT1, ROOM_B4_XOR_SHIFT2, ROOM_B4_XOR_SHIFT3);
}

export function roomB4Mod100(value) {
    const u = value >>> 0;
    const prod = BigInt(u) * BigInt(ROOM_B4_MOD100_MAGIC >>> 0);
    const q = Number(prod >> 32n) >>> 5;
    return (u - (q * 100)) >>> 0;
}

export function roomB4PickupVariantFromRem(rem100) {
    if (rem100 < 4) return ROOM_B4_PICKUP_T0;
    if (rem100 < 9) return ROOM_B4_PICKUP_T1;
    if (rem100 < 0x13) return ROOM_B4_PICKUP_T2;
    if (rem100 < 0x1d) return ROOM_B4_PICKUP_T3;
    if (rem100 < 0x36) return ROOM_B4_PICKUP_T4;
    return ROOM_B4_PICKUP_DEFAULT;
}

export function roomB4SecondBandKind(rem100) {
    if (rem100 < ROOM_B4_BAND_A_REM) return ROOM_B4_BAND_A;
    if (rem100 < ROOM_B4_BAND_B_REM) return ROOM_B4_BAND_B;
    if (rem100 < ROOM_B4_BAND_C_REM) return ROOM_B4_BAND_C;
    if (rem100 < ROOM_B4_BAND_D_REM) return ROOM_B4_BAND_D;
    return ROOM_B4_BAND_NONE;
}

export function roomB4OptionGate(optionByte, mgrField8, gameNonnull, gameDword26630, gameByte26589) {
    if ((optionByte & 0xff) != 0) return 1;
    if (mgrField8 != 2) return 0;
    if (gameNonnull == 0) return 0;
    if (gameDword26630 != 0) return 1;
    return (gameByte26589 & 0xff) != 0 ? 1 : 0;
}

export function roomB4SecondBandNeedsHost(
  rem100,
  optionByte,
  mgrField8,
  gameNonnull,
  gameDword26630,
  gameByte26589,
) {
    let kind = roomB4SecondBandKind(rem100);
    if (kind == ROOM_B4_BAND_NONE) return 0;
    if (kind == ROOM_B4_BAND_A) return 1;
    return roomB4OptionGate(optionByte, mgrField8, gameNonnull,
                                     gameDword26630, gameByte26589);
}

export function roomB4ThirdSpawnGate(xorshiftResult) {
  return ((xorshiftResult >>> 0) & 3) === 0 ? 1 : 0;
}

export function roomB4PosYOffset(roomY20) {
  return Math.fround(Math.fround(roomY20) + peB4YOffset);
}

const peB4PosPad = (() => {
  const u = new Uint32Array([ROOM_B4_POS_PAD_BITS >>> 0]);
  return new Float32Array(u.buffer)[0];
})();

/** PE: test RoomDesc+0x5c; nonzero continues reward RNG chain. */
export function roomB4SeedPresent(seedDesc5c) {
  return (seedDesc5c >>> 0) !== 0 ? 1 : 0;
}

/** PE: lookup count dword == 0 → G0 effect spawn path. */
export function roomB4LookupEmpty(lookupCount) {
  return (lookupCount >>> 0) === 0 ? 1 : 0;
}

/** PE cleanup gate: result byte == 0 → host a648b0. */
export function roomB4CleanupNeeded(lookupResultByte) {
  return ((lookupResultByte >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** PE: Game+0x18308 + 0x3e8. */
export function roomB4SeedOffset(game18308) {
  return ((game18308 >>> 0) + ROOM_B4_SEED_ADD) >>> 0;
}

export function roomB4PosPad() {
  return peB4PosPad;
}

/** PE reward pos: x = room+0x1c + 0; y = room+0x20 + 32. */
export function roomB4RewardPos(roomX1c, roomY20) {
  const out = {};
    out.x = roomX1c + Math.fround(0.0);
    out.y = roomB4PosYOffset(roomY20);
  return out;
}

/** Pure xorshift→mod100 seed step. */
export function roomB4SeedStep(seed) {
  const out = {};
    let next = roomB4XorshiftImm(seed);
    out.nextSeed = next;
    out.rem100 = roomB4Mod100(next);
  return out;
}

/** Pickup table from desc seed (pre-G1 pure). */
export function roomB4PickupFromSeed(seed) {
  const out = {};
    const step = roomB4SeedStep(seed);
    out.nextSeed = step.nextSeed;
    out.rem100 = step.rem100;
    out.variant = roomB4PickupVariantFromRem(step.rem100);
  return out;
}

/** Band variant/subtype imms for a resolved kind. */
export function roomB4BandImms(bandKind) {
  const out = {};
    out.kind = bandKind;
    out.valid = 0;
    out.variant = 0;
    out.subtype = 0;
    if (bandKind == ROOM_B4_BAND_A) {
      out.valid = 1;
      out.variant = ROOM_B4_BAND_A_VARIANT;
      out.subtype = ROOM_B4_BAND_A_SUB;
    } else if (bandKind == ROOM_B4_BAND_B) {
      out.valid = 1;
      out.variant = ROOM_B4_BAND_B_VARIANT;
      out.subtype = ROOM_B4_BAND_B_SUB;
    } else if (bandKind == ROOM_B4_BAND_C) {
      out.valid = 1;
      out.variant = ROOM_B4_BAND_C_VARIANT;
      out.subtype = ROOM_B4_BAND_C_SUB;
    } else if (bandKind == ROOM_B4_BAND_D) {
      out.valid = 1;
      out.variant = ROOM_B4_BAND_D_VARIANT;
      out.subtype = ROOM_B4_BAND_D_SUB;
    }
  return out;
}

/** mgr option offset for band B/C/D; 0 for A/none. */
export function roomB4BandOptionOff(bandKind) {
    if (bandKind == ROOM_B4_BAND_B) return ROOM_B4_BAND_B_OPTION_OFF;
    if (bandKind == ROOM_B4_BAND_C) return ROOM_B4_BAND_C_OPTION_OFF;
    if (bandKind == ROOM_B4_BAND_D) return ROOM_B4_BAND_D_OPTION_OFF;
    return 0;
}

/** G0 effect spawn posts after host genrand. */
export function roomB4EffectSpawnPosts(genrand, game18308) {
  const out = {};
    out.entityType = ROOM_B4_SPAWN_TYPE_1000;
    out.variant = ROOM_B4_SPAWN_VARIANT_A1;
    out.seed = genrand;
    out.seedOffset = roomB4SeedOffset(game18308);
    out.nullArg = 0;
    out.argPtr = ROOM_B4_SPAWN_ARG_PTR;
  return out;
}

/** G1 pickup spawn posts after host genrand. */
export function roomB4PickupSpawnPosts(genrand, rem100) {
  const out = {};
    out.entityType = ROOM_B4_ENTITY_TYPE5;
    out.variant = roomB4PickupVariantFromRem(rem100);
    out.subtype = ROOM_B4_PICKUP_SUBTYPE;
    out.seed = genrand;
    out.nullArg = 0;
    out.argPtr = ROOM_B4_SPAWN_ARG_PTR;
  return out;
}

/** G2 band spawn posts after host genrand. */
export function roomB4BandSpawnPosts(
  genrand,
  rem100,
  optionByte,
  mgrField8,
  gameNonnull,
  gameDword26630,
  gameByte26589,
) {
  const out = {};
    let kind = roomB4SecondBandKind(rem100);
    let needs = roomB4SecondBandNeedsHost(
        rem100, optionByte, mgrField8, gameNonnull, gameDword26630,
        gameByte26589);
    out.needsSpawn = needs;
    out.bandKind = kind;
    out.entityType = needs != 0 ? ROOM_B4_ENTITY_TYPE5 : 0;
    out.variant = 0;
    out.subtype = 0;
    out.seed = needs != 0 ? genrand : 0;
    out.nullArg = 0;
    out.argPtr = needs != 0 ? ROOM_B4_SPAWN_ARG_PTR : 0;
    if (needs != 0) {
      const imms = roomB4BandImms(kind);
      out.variant = imms.variant;
      out.subtype = imms.subtype;
    }
  return out;
}

/** G3 third spawn posts when (xorshift & 3)==0. */
export function roomB4ThirdSpawnPosts(genrand, xorshiftResult) {
  const out = {};
    let needs = roomB4ThirdSpawnGate(xorshiftResult);
    out.needsSpawn = needs;
    out.entityType = needs != 0 ? ROOM_B4_ENTITY_TYPE5 : 0;
    out.variant = needs != 0 ? ROOM_B4_THIRD_VARIANT : 0;
    out.subtype = 0;
    out.seed = needs != 0 ? genrand : 0;
    out.nullArg0 = 0;
    out.nullArg1 = 0;
    out.argPtr = needs != 0 ? ROOM_B4_SPAWN_ARG_PTR : 0;
  return out;
}

/** Full pure seed chain from RoomDesc+0x5c (three xorshift steps). */
export function roomB4RewardSeedChain(seedDesc5c) {
  const out = {};
    const s1 = roomB4SeedStep(seedDesc5c);
    out.seed1 = s1.nextSeed;
    out.rem1 = s1.rem100;
    out.pickupVariant = roomB4PickupVariantFromRem(s1.rem100);

    const s2 = roomB4SeedStep(s1.nextSeed);
    out.seed2 = s2.nextSeed;
    out.rem2 = s2.rem100;
    out.bandKind = roomB4SecondBandKind(s2.rem100);

    const s3 = roomB4SeedStep(s2.nextSeed);
    out.seed3 = s3.nextSeed;
    out.thirdGate = roomB4ThirdSpawnGate(s3.nextSeed);
  return out;
}

/* ---- B4 host-deepen2: spawn/pos/cleanup pure posts (ABI v39 freestanding). ---- */

/** PE push pack before host lookup 0x41af60. */
export function roomB4LookupArgs() {
  const out = {};
    out.entityType = ROOM_B4_SPAWN_TYPE_1000;
    out.variant = ROOM_B4_SPAWN_VARIANT_A1;
    out.subtype = ROOM_B4_LOOKUP_SUBTYPE;
    out.nullArg0 = 0;
    out.nullArg1 = 0;
    out.thisOff = ROOM_B4_LOOKUP_THIS_OFF;
  return out;
}

/** After host lookup count: G0 empty path vs entity seed write. */
export function roomB4LookupRoute(lookupCount) {
  const out = {};
    let empty = roomB4LookupEmpty(lookupCount);
    if (empty != 0) {
      out.path = ROOM_B4_LOOKUP_PATH_G0;
      out.needsG0Path = 1;
      out.needsEntitySeed = 0;
      out.needsPosAHost = 1;
      out.needsPosFinishHost = 1;
      out.needsGenrandHost = 1;
      out.needsSpawnHost = 1;
    } else {
      out.path = ROOM_B4_LOOKUP_PATH_ENTITY_SEED;
      out.needsG0Path = 0;
      out.needsEntitySeed = 1;
      out.needsPosAHost = 0;
      out.needsPosFinishHost = 0;
      out.needsGenrandHost = 0;
      out.needsSpawnHost = 0;
    }
  return out;
}

/** G0 empty-path pos prep (pad 40.0f + flags 0,0,1). */
export function roomB4G0PosPosts() {
  const out = {};
    out.pad = roomB4PosPad();
    out.flag0 = ROOM_B4_POS_FLAG0;
    out.flag1 = ROOM_B4_POS_FLAG1;
    out.flag2 = ROOM_B4_POS_FLAG2;
    out.needsPosAHost = 1;
    out.needsPosFinishHost = 1;
  return out;
}

/** Non-empty lookup: store Game+0x18308+0x3e8 at entity+0x30. */
export function roomB4EntitySeedWritePosts(game18308, lookupCount) {
  const out = {};
    let needs = roomB4LookupEmpty(lookupCount) == 0 ? 1 : 0;
    out.needsWrite = needs;
    out.seedValue = needs != 0 ? roomB4SeedOffset(game18308) : 0;
    out.destOff = needs != 0 ? ROOM_B4_ENTITY_SEED_OFF : 0;
  return out;
}

/** Frame-in-room path enter: seed present → RNG chain, else fatal. */
export function roomB4FramePathEnter(roomByte1, entry11f0, frame264f8, seedDesc5c) {
  const out = {};
    let frame =
        roomB4FrameInRoomGate(roomByte1, entry11f0, frame264f8);
    let seed = roomB4SeedPresent(seedDesc5c);
    out.frameGate = frame;
    out.seedPresent = seed;
    out.needsSeedFatal = (frame != 0 && seed == 0) ? 1 : 0;
    out.needsRngChain = (frame != 0 && seed != 0) ? 1 : 0;
    out.needsPosFinishHost = frame != 0 ? 1 : 0;
    out.posBaseOff = ROOM_B4_ROOM_POS_BASE_OFF;
  return out;
}

/** Third-spawn pos: x=room+0x14, y=room+0x20 (no +32). */
export function roomB4ThirdPos(roomX14, roomY20) {
  const out = {};
    out.x = roomX14 + Math.fround(0.0);
    out.y = roomY20 + Math.fround(0.0);
  return out;
}

/** After host 813520: copy float2 result. */
export function roomB4PosFinishCopy(hostX, hostY) {
  const out = {};
    out.x = hostX;
    out.y = hostY;
  return out;
}

/** Reward pos posts (post-G1): pure x/y + needs_pos_finish_host. */
export function roomB4RewardPosPosts(roomX1c, roomY20) {
  const out = {};
    const pos = roomB4RewardPos(roomX1c, roomY20);
    out.x = pos.x;
    out.y = pos.y;
    out.needsPosFinishHost = 1;
    out.flag0 = ROOM_B4_POS_FLAG0;
    out.flag1 = ROOM_B4_POS_FLAG1;
    out.flag2 = ROOM_B4_POS_FLAG2;
  return out;
}

/** Third path posts: gate + pos + host needs (genrand still host). */
export function roomB4ThirdPathPosts(xorshiftResult, roomX14, roomY20) {
  const out = {};
    let needs = roomB4ThirdSpawnGate(xorshiftResult);
    out.needsSpawn = needs;
    if (needs != 0) {
      const pos = roomB4ThirdPos(roomX14, roomY20);
      out.posX = pos.x;
      out.posY = pos.y;
      out.needsPosFinishHost = 1;
      out.needsGenrandHost = 1;
      out.needsSpawnHost = 1;
      out.entityType = ROOM_B4_ENTITY_TYPE5;
      out.variant = ROOM_B4_THIRD_VARIANT;
      out.subtype = 0;
      out.argPtr = ROOM_B4_SPAWN_ARG_PTR;
    } else {
      out.posX = Math.fround(0.0);
      out.posY = Math.fround(0.0);
      out.needsPosFinishHost = 0;
      out.needsGenrandHost = 0;
      out.needsSpawnHost = 0;
      out.entityType = 0;
      out.variant = 0;
      out.subtype = 0;
      out.argPtr = 0;
    }
  return out;
}

/** Cleanup posts: result byte==0 → host a648b0 with cl=1, push 0,0. */
export function roomB4CleanupPosts(lookupResultByte) {
  const out = {};
    let needs = roomB4CleanupNeeded(lookupResultByte);
    out.needsCleanup = needs;
    out.clImm = needs != 0 ? ROOM_B4_CLEANUP_CL : 0;
    out.nullArg0 = 0;
    out.nullArg1 = 0;
    out.hostVa = needs != 0 ? ROOM_B4_HOST_VA_CLEANUP : 0;
  return out;
}

/** Seed-null fatal needed (inverse of seed_present). */
export function roomB4SeedFatalNeeded(seedDesc5c) {
  return roomB4SeedPresent(seedDesc5c) === 0 ? 1 : 0;
}

export function roomB5ListResetEnd(begin, end) {
    return begin;
}

export function roomB5ListNeedsReset(begin, end) {
  return (begin >>> 0) !== (end >>> 0) ? 1 : 0;
}

export function roomB5OuterGate(roomActiveByte0, frame264f8, entry11f0) {
    if ((roomActiveByte0 & 0xff) == 0) return 0;
    return (frame264f8 - entry11f0) == 0 ? 1 : 0;
}

export function roomB5Pass1ModeGate(mode26584) {
  return (mode26584 | 0) === ROOM_B5_PASS1_MODE ? 1 : 0;
}

export function roomB5EntityTypeCandidate(mode26614, entityType28) {
    if (mode26614 >= ROOM_B5_MODE_GATE && entityType28 == 1) {
      return 1;
    }
    let delta =
        ((entityType28 >>> 0) - (ROOM_B5_TYPE_RANGE_BASE >>> 0)) >>> 0;
    return delta < (ROOM_B5_TYPE_RANGE_SPAN >>> 0) ? 1 : 0;
}

export function roomB5EntityFlagClear(flags168) {
  return ((flags168 >>> 0) & ROOM_B5_FLAG_BIT) === 0 ? 1 : 0;
}

export function roomB5EntityTypeExcluded(entityType28, entityVariant2c) {
    if (entityType28 == ROOM_B5_TYPE_EXCLUDE_A) return 1;
    if (entityType28 == ROOM_B5_TYPE_EXCLUDE_B) return 1;
    if (entityType28 == ROOM_B5_TYPE_EXCLUDE_C) return 1;
    if (entityType28 == ROOM_B5_TYPE_EXCLUDE_D) return 1;
    if (entityType28 == ROOM_B5_TYPE_EXCLUDE_E &&
        entityVariant2c == ROOM_B5_VARIANT_EXCLUDE_E) {
      return 1;
    }
    return 0;
}

export function roomB5Pass1EntityPreVcall({
  entityNonnull,
  mode26614,
  entityType28,
  flags168,
  field32c,
  entityVariant2c,
}) {
    if (entityNonnull == 0) return 0;
    if (roomB5EntityTypeCandidate(mode26614, entityType28) == 0) {
      return 0;
    }
    if (roomB5EntityFlagClear(flags168) == 0) return 0;
    if (field32c < 0) return 0;
    if (roomB5EntityTypeExcluded(entityType28, entityVariant2c) != 0) {
      return 0;
    }
    return 1;
}

export function roomB5Pass2CountGate(count708250) {
  return (count708250 | 0) > ROOM_B5_PASS2_COUNT_MIN ? 1 : 0;
}

export function roomB5ListEmpty(entityCount1264) {
  return (entityCount1264 >>> 0) === 0 ? 1 : 0;
}

export function roomB5ListContinue(index, entityCount1264) {
    let next = index + 1;
    return next < entityCount1264 ? 1 : 0;
}

export function roomB5EntityRngStep(seed3dc, shift3e0, shift3e4, shift3e8) {
  return roomB4Xorshift(seed3dc, shift3e0, shift3e4, shift3e8);
}

export function roomB5EntityRngAppendGate(rngResult) {
  return ((rngResult >>> 0) & 1) === 0 ? 1 : 0;
}

/* ---- B5/B7 deepen pure peels (helpers ABI v39 freestanding). ---- */

export function roomB5EntityField32cOk(field32c) {
  return (field32c | 0) >= 0 ? 1 : 0;
}

export function roomB5Pass1EntityPreVcall48({
  entityNonnull,
  mode26614,
  entityType28,
  flags168,
}) {
    if (entityNonnull == 0) return 0;
    if (roomB5EntityTypeCandidate(mode26614, entityType28) == 0) {
      return 0;
    }
    if (roomB5EntityFlagClear(flags168) == 0) return 0;
    return 1;
}

export function roomB5Pass1EntityPostVcall48({
  vcall48Nonnull,
  field32c,
  entityType28,
  entityVariant2c,
}) {
    if (vcall48Nonnull == 0) return 0;
    if (roomB5EntityField32cOk(field32c) == 0) return 0;
    if (roomB5EntityTypeExcluded(entityType28, entityVariant2c) != 0) {
      return 0;
    }
    return 1;
}

export function roomB5ListAtCapacity(end, cap) {
  return (end >>> 0) === (cap >>> 0) ? 1 : 0;
}

export function roomB5ListCanDirectStore(end, cap) {
  return (end >>> 0) !== (cap >>> 0) ? 1 : 0;
}

export function roomB5ListEndAfterStore(end) {
  return ((end >>> 0) + ROOM_B5_LIST_PTR_STRIDE) >>> 0;
}

export function roomB5ListNeedsGrowHost(end, cap) {
  return roomB5ListAtCapacity(end, cap);
}

export function roomB5ListAppendRoute(end, cap) {
  const out = {};
    out.canDirectStore =
        roomB5ListCanDirectStore(end, cap);
    out.needsGrowHost =
        roomB5ListNeedsGrowHost(end, cap);
    out.nextEnd = roomB5ListEndAfterStore(end);
  return out;
}

export function roomB5Pass1AppendPosts({
  vcall48Nonnull,
  field32c,
  entityType28,
  entityVariant2c,
  end,
  cap,
}) {
  const out = {};
    let needs =
        roomB5Pass1EntityPostVcall48(vcall48Nonnull, field32c,
                                                entityType28, entityVariant2c);
    out.needsAppend = needs;
    if (needs == 0) {
      out.canDirectStore = 0;
      out.needsGrowHost = 0;
      out.nextEnd = end;
      return out;
    }
    const route = roomB5ListAppendRoute(end, cap);
    out.canDirectStore = route.canDirectStore;
    out.needsGrowHost = route.needsGrowHost;
    out.nextEnd = route.nextEnd;
  return out;
}

export function roomB5Pass2EntityPreVcall48(input) {
  return roomB5Pass1EntityPreVcall48(input);
}

export function roomB5Pass2EntityMidVcall48(vcall48Nonnull, field32c) {
    if (vcall48Nonnull == 0) return 0;
    return roomB5EntityField32cOk(field32c);
}

export function roomB5Pass2EntityNeedsRng(vcall4cNonnull) {
  return (vcall4cNonnull >>> 0) === 0 ? 1 : 0;
}

export function roomB5Pass2AppendBudget(count708250) {
  return ((count708250 | 0) - ROOM_B5_PASS2_COUNT_MIN) | 0;
}

export function roomB5EntityRngSeedPresent(seed3dc) {
  return (seed3dc >>> 0) !== 0 ? 1 : 0;
}

export function roomB5Pass2BudgetDec(budget) {
  return ((budget | 0) - 1) | 0;
}

export function roomB5Pass2BudgetContinue(budget) {
  return (budget | 0) > 0 ? 1 : 0;
}

export function roomB5Pass2EntityPosts({
  entityNonnull,
  mode26614,
  entityType28,
  flags168,
  vcall48Nonnull,
  field32c,
  vcall4cNonnull,
  count708250,
}) {
  const out = {};
    out.needsVcall48Host = roomB5Pass2EntityPreVcall48({
        entityNonnull, mode26614, entityType28, flags168});
    if (out.needsVcall48Host == 0) {
      out.needsVcall4cHost = 0;
      out.needsRngLoop = 0;
      out.appendBudget = 0;
      return out;
    }
    out.needsVcall4cHost =
        roomB5Pass2EntityMidVcall48(vcall48Nonnull, field32c);
    if (out.needsVcall4cHost == 0) {
      out.needsRngLoop = 0;
      out.appendBudget = 0;
      return out;
    }
    out.needsRngLoop = roomB5Pass2EntityNeedsRng(vcall4cNonnull);
    out.appendBudget =
        out.needsRngLoop != 0 ? roomB5Pass2AppendBudget(count708250)
                                 : 0;
  return out;
}

export function roomB5Pass2RngTryPosts({
  seed3dc,
  shift3e0,
  shift3e4,
  shift3e8,
  end,
  cap,
  budget,
}) {
  const out = {};
    let next =
        stepRoomB5EntityRng(seed3dc, shift3e0, shift3e4, shift3e8);
    out.nextSeed = next;
    out.needsAppend = roomB5EntityRngAppendGate(next);
    if (out.needsAppend != 0) {
      const route = roomB5ListAppendRoute(end, cap);
      out.canDirectStore = route.canDirectStore;
      out.needsGrowHost = route.needsGrowHost;
      out.nextEnd = route.nextEnd;
    } else {
      out.canDirectStore = 0;
      out.needsGrowHost = 0;
      out.nextEnd = end;
    }
    out.nextBudget = roomB5Pass2BudgetDec(budget);
    out.budgetContinue = roomB5Pass2BudgetContinue(out.nextBudget);
  return out;
}

export function roomB6DestroyTreeGate(count7238) {
  return (count7238 >>> 0) !== 0 ? 1 : 0;
}

export function roomB6GridIndexValid(index, widthC, height10) {
    if (index < 0) return 0;
    let cells = widthC * height10;
    return index < cells ? 1 : 0;
}

export function roomB6SlotPresent(slotPtr) {
  return (slotPtr >>> 0) !== 0 ? 1 : 0;
}

export function roomB7SlotPresent(slotPtr) {
  return (slotPtr >>> 0) !== 0 ? 1 : 0;
}

export function roomB7CellCount(widthC, height10) {
  return ((widthC | 0) * (height10 | 0)) | 0;
}

export function roomB7CellLoopEnter(cellCount) {
  return (cellCount | 0) > 0 ? 1 : 0;
}

export function roomB7CellLoopContinue(index, cellCount) {
    let next = index + 1;
    return next < cellCount ? 1 : 0;
}

export function roomB7NeedsGridUpdateHost(widthC, height10) {
  return roomB7CellLoopEnter(roomB7CellCount(widthC, height10));
}

export function roomB7GridSlotOff(index) {
  return (ROOM_B7_GRID_BASE_OFF + ((index | 0) >>> 0) * ROOM_B7_SLOT_STRIDE) >>> 0;
}

export function roomB7CellNeedsVcall(slotPtr) {
  return roomB7SlotPresent(slotPtr);
}

export function roomB7CellStepPosts({ index, widthC, height10, slotPtr }) {
  const out = {};
    out.needsVcallHost = roomB7CellNeedsVcall(slotPtr);
    out.nextIndex = index + 1;
    out.cellCount = roomB7CellCount(widthC, height10);
    out.continueLoop =
        roomB7CellLoopContinue(index, out.cellCount);
  return out;
}

export function roomB3B7ResidualPlan({
  teByte7321,
  teBegin,
  teEnd,
  descType0,
  roomActiveByte0,
  frame264f8,
  entry11f0,
  treeCount7238,
  widthC,
  height10,
}) {
  const out = {};
    out.needsB3OwnerHost = 1;
    out.needsB3ChallengeHost = 1;
    out.needsB3TempEffectsHost =
        roomB3TempEffectsNeedsHost(teByte7321, teBegin, teEnd);
    out.needsB4RewardHost = roomB4DescTypeGate(descType0);
    out.needsB5CandidateHost =
        roomB5OuterGate(roomActiveByte0, frame264f8, entry11f0);
    out.needsB6DestroyHost = roomB6DestroyTreeGate(treeCount7238);
    out.needsB7GridUpdateHost =
        roomB7NeedsGridUpdateHost(widthC, height10);
    out.residualKind = ROOM_B3B7_RESIDUAL_HOST;
    out.pureComplete = 0;
    out.hostNeeded = 1;
  return out;
}

export function roomB3B7WireDecide(input) {
  const state = Object.assign({}, input || {});
  const out = {};
    if (state.sparseReady == 0) {
      out.needsB3OwnerHost = 0;
      out.needsB3ChallengeHost = 0;
      out.needsB3TempEffectsHost = 0;
      out.needsB4RewardHost = 0;
      out.needsB5CandidateHost = 0;
      out.needsB6DestroyHost = 0;
      out.needsB7GridUpdateHost = 0;
      out.residualKind = ROOM_B3B7_RESIDUAL_MONOLITHIC;
      out.pureComplete = 0;
      out.hostNeeded = 1;
      return out;
    }
    return roomB3B7ResidualPlan({
      teByte7321: state.teByte7321,
      teBegin: state.teBegin,
      teEnd: state.teEnd,
      descType0: state.descType0,
      roomActiveByte0: state.roomActiveByte0,
      frame264f8: state.frame264f8,
      entry11f0: state.entry11f0,
      treeCount7238: state.treeCount7238,
      widthC: state.widthC,
      height10: state.height10,
    });
}

/* ---- B3 host residual body pure CF (helpers ABI v39 freestanding).
   Opaque bodies stay host. B3-only symbols. ---- */

export function roomB3OwnerTwinWalkFlag(lazSharedTag, configPtrNonnull, configFieldB8) {
    if ((lazSharedTag & 0xff) == 0) return 0;
    if (configPtrNonnull == 0) return 0;
    if ((configFieldB8 & ROOM_B3_OWNER_CONFIG_TWIN_BIT) == 0) return 0;
    return 1;
}

export function roomB3OwnerListEmpty(listBegin, listEnd) {
  return (listBegin >>> 0) === (listEnd >>> 0) ? 1 : 0;
}

export function roomB3OwnerPlayerSlotActive(playerField2c) {
  return (playerField2c >>> 0) === 0 ? 1 : 0;
}

export function roomB3OwnerTwinPresent(twinPtr) {
  return (twinPtr >>> 0) !== 0 ? 1 : 0;
}

export function roomB3OwnerHasCollectibleHit(alByte) {
  return ((alByte >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function roomB3OwnerListContinue(listCur, listEnd) {
    let next = (listCur + ROOM_B3_OWNER_LIST_STRIDE) >>> 0;
    return next !== (listEnd >>> 0) ? 1 : 0;
}

export function roomB3HceGateOpen(byte11) {
  return ((byte11 >>> 0) & 0xff) === 0 ? 1 : 0;
}

export function roomB3HceListEmpty(begin, end) {
  return (begin >>> 0) === (end >>> 0) ? 1 : 0;
}

export function roomB3HceTypeEligible(itemType0) {
    if (itemType0 == ROOM_B3_HCE_TYPE_A) return 1;
    if (itemType0 == ROOM_B3_HCE_TYPE_B) return 1;
    if (itemType0 == ROOM_B3_HCE_TYPE_C) return 1;
    return 0;
}

export function roomB3HceEntryMatch(itemType0, itemId4, coltype) {
    if (roomB3HceTypeEligible(itemType0) == 0) return 0;
    return itemId4 == coltype ? 1 : 0;
}

export function roomB3HceListContinue(cur, end) {
    let next = (cur + ROOM_B3_HCE_STRIDE) >>> 0;
    return next !== (end >>> 0) ? 1 : 0;
}

export function roomB3HceBoolFromMatch(matched) {
  return (matched | 0) !== 0 ? 1 : 0;
}

export function roomB3ChallengeBodyNeedsHost(hceAl) {
  return ((hceAl >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function roomB3CbGceHit(gcePtr) {
  return (gcePtr >>> 0) !== 0 ? 1 : 0;
}

export function roomB3CbHceHit(alByte) {
  return ((alByte >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function roomB3CbModeIs16(mode26584) {
  return (mode26584 | 0) === ROOM_B3_CB_MODE_16 ? 1 : 0;
}

export function roomB3CbRoomIs1(room1210) {
  return (room1210 | 0) === 1 ? 1 : 0;
}

export function roomB3CbRoomIs2(room1210) {
  return (room1210 | 0) === 2 ? 1 : 0;
}

export function roomB3CbOwnerHit(ownerPtr) {
  return (ownerPtr >>> 0) !== 0 ? 1 : 0;
}

/**
 * PE cooldown scale after GetCollectibleEffect hit (TemporaryEffect+0x8).
 */
export function roomB3CbScaleFromCooldown(cooldown8) {
    let zero = Math.fround(0.0);
    let one = peBitsToF32(ROOM_B3_CB_F_DEFAULT_BITS);
    let div90 = peBitsToF32(ROOM_B3_CB_F_DIV_BITS);
    let mul08 = peBitsToF32(ROOM_B3_CB_F_MUL_BITS);
    let floor05 = peBitsToF32(ROOM_B3_CB_F_FLOOR_BITS);
    let xmm1 = Math.fround(cooldown8);
    xmm1 = Math.fround(xmm1 - zero);
    xmm1 = Math.fround(xmm1 / div90);
    if (xmm1 < zero) xmm1 = zero;
    if (xmm1 > one) xmm1 = one;
    xmm1 = Math.fround(xmm1 * mul08);
    let xmm0 = Math.fround(one - xmm1);
    if (xmm0 < floor05) xmm0 = floor05;
    return Math.fround(xmm0);
}

/**
 * Pure base float selection given host nested-call samples.
 */
export function roomB3CbSelectBase({
  gcePtr,
  cooldown8,
  hceE8Al,
  hce42Al,
  mode26584,
  room1210,
  ownerE8Ptr,
}) {
  const out = {};
    let def = peBitsToF32(ROOM_B3_CB_F_DEFAULT_BITS);
    let hce = peBitsToF32(ROOM_B3_CB_F_HCE_BITS);
    let mode = peBitsToF32(ROOM_B3_CB_F_MODE_BITS);
    let owner = peBitsToF32(ROOM_B3_CB_F_OWNER_BITS);

    if (roomB3CbGceHit(gcePtr) != 0) {
      out.kind = ROOM_B3_CB_BASE_COOLDOWN;
      out.base = roomB3CbScaleFromCooldown(cooldown8);
      return out;
    }
    if (roomB3CbHceHit(hceE8Al) != 0 ||
        roomB3CbHceHit(hce42Al) != 0) {
      out.kind = ROOM_B3_CB_BASE_HCE;
      out.base = hce;
      return out;
    }
    if (roomB3CbModeIs16(mode26584) != 0) {
      out.kind = ROOM_B3_CB_BASE_MODE;
      out.base = mode;
      return out;
    }
    if (roomB3CbRoomIs1(room1210) != 0) {
      out.kind = ROOM_B3_CB_BASE_HCE;
      out.base = hce;
      return out;
    }
    if (roomB3CbRoomIs2(room1210) != 0) {
      out.kind = ROOM_B3_CB_BASE_MODE;
      out.base = mode;
      return out;
    }
    if (roomB3CbOwnerHit(ownerE8Ptr) != 0) {
      out.kind = ROOM_B3_CB_BASE_OWNER;
      out.base = owner;
      return out;
    }
    out.kind = ROOM_B3_CB_BASE_DEFAULT;
    out.base = def;
  return out;
}

export function roomB3CbCountPost(countResult, base) {
    let dec = countResult - 1;
    let clamped = dec > 0 ? dec : 0;
    let scale =
        peBitsToF32(ROOM_B3_CB_F_COUNT_SCALE_BITS);
    let mul = Math.fround(Math.fround(clamped) * scale);
    return Math.fround(Math.fround(base) + mul);
}

export function roomB3TeCallTimerPositive(timer34) {
  return (timer34 | 0) > 0 ? 1 : 0;
}

export function roomB3TeCallTimerInScaleRange(timer34) {
    if (timer34 <= 0) return 0;
    if (timer34 >= (ROOM_B3_TE_CALL_TIMER_MAX)) return 0;
    return 1;
}

export function roomB3TeCallTimerAtOrAboveMax(timer34) {
  return (timer34 | 0) >= ROOM_B3_TE_CALL_TIMER_MAX ? 1 : 0;
}

export function roomB3TeCallNeedsInitPath(timer34) {
  return (timer34 | 0) <= 0 ? 1 : 0;
}

export function roomB3TeCallScaleTimer(timer34) {
    let f180 = peBitsToF32(ROOM_B3_TE_CALL_F_180_BITS);
    let f150 = peBitsToF32(ROOM_B3_TE_CALL_F_150_BITS);
    let f30 = peBitsToF32(ROOM_B3_TE_CALL_F_30_BITS);
    let zero = Math.fround(0.0);
    let xmm1 = (timer34) | 0;
    xmm1 = Math.fround(xmm1 - zero);
    xmm1 = Math.fround(xmm1 / f150);
    xmm1 = Math.fround(xmm1 * f30);
    let xmm0 = Math.fround(f180 - xmm1);
    return (xmm0 < 0 ? Math.ceil(xmm0) : Math.floor(xmm0)) | 0;
}

export function roomB3TeCallNeedsImageHost(field3c) {
  return (field3c >>> 0) === 0 ? 1 : 0;
}

export function roomB3TeCallImagePresent(field3c) {
  return (field3c >>> 0) !== 0 ? 1 : 0;
}

export function roomB3TeCallSeedPresent(seed) {
  return (seed >>> 0) !== 0 ? 1 : 0;
}

export function roomB3TeCallLoopEnter(field50) {
  return (field50 | 0) > 0 ? 1 : 0;
}

export function roomB3TeCallLoopContinue(index, field50) {
    let next = index + 1;
    return next < field50 ? 1 : 0;
}

export function roomB3TeCallInitPosts() {
  const out = {};
    out.timer = (ROOM_B3_TE_CALL_TIMER_INIT);
    out.byte71 = 0;
    out.field50 = (ROOM_B3_TE_CALL_FIELD50);
    out.field54Bits = ROOM_B3_TE_CALL_FIELD54_BITS;
    out.field58Bits = ROOM_B3_TE_CALL_FIELD58_BITS;
    out.field5cBits = ROOM_B3_TE_CALL_FIELD5C_BITS;
    out.field60Bits = ROOM_B3_TE_CALL_FIELD60_BITS;
  return out;
}

/* ---- B9 free-body residual pure CF after FCO(0x226) (helpers ABI v39
   freestanding; B9-only symbols). Host owns 0x41af60 / 0x833420 / free IAT. ---- */

export const ROOM_B9_FREE_ENTITY_TYPE = 5;
export const ROOM_B9_FREE_ENTITY_VARIANT = 0x64;
export const ROOM_B9_FREE_ENTITY_SUBTYPE = -1;
export const ROOM_B9_FREE_ARG_PAD0 = 0;
export const ROOM_B9_FREE_ARG_PAD1 = 0;
export const ROOM_B9_FREE_THIS_OFF = 0x1218;
export const ROOM_B9_FREE_RESULT_BYTE_OFF = 0;
export const ROOM_B9_FREE_RESULT_PTR_OFF = 4;
export const ROOM_B9_FREE_RESULT_COUNT_OFF = 0xc;
export const ROOM_B9_FREE_HELPER_THIS_OFF = 0x265c8;
export const ROOM_B9_FREE_SEH_IN = 5;
export const ROOM_B9_FREE_SEH_OUT = 0xffffffff;
export const ROOM_B9_FREE_HEAP_STATS_GLOBAL = 0x00c7de78;
export const ROOM_B9_FREE_HEAP_STATS_DELTA = 0x30;
export const ROOM_B9_FREE_HEAP_STATS_FALLBACK = 0x00c7f618;
export const ROOM_B9_FREE_IAT_VA = 0x00b187dc;
export const ROOM_B9_FREE_HOST_VA_BODY = 0x00803d4b;
export const ROOM_B9_FREE_HOST_VA_LOOKUP = 0x0041af60;
export const ROOM_B9_FREE_HOST_VA_HELPER = 0x00833420;
export const ROOM_B9_FREE_HOST_VA_FREE_SITE = 0x00803d98;
export const ROOM_B9_FREE_HOST_VA_NEXT = 0x00803dd3;

/** PE: lookup count(+0xc)==0 → host FUN_00833420. */
export function roomB9FreeHelperNeeded(lookupCount) {
  return (lookupCount >>> 0) === 0 ? 1 : 0;
}

/** PE: result byte(+0)==0 → free path. */
export function roomB9FreePathNeeded(resultByte) {
  return ((resultByte >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** PE: result ptr(+4)!=0 → free IAT candidate. */
export function roomB9FreePtrNeeded(bufPtr) {
  return (bufPtr >>> 0) !== 0 ? 1 : 0;
}

/** PE: global!=0 → global+0x30 else 0xc7f618. */
export function roomB9FreeHeapStatsBase(heapStatsGlobal) {
    if (heapStatsGlobal != 0) {
      return heapStatsGlobal + ROOM_B9_FREE_HEAP_STATS_DELTA;
    }
    return ROOM_B9_FREE_HEAP_STATS_FALLBACK;
}

/** PE: buf_ptr - 4 before free. */
export function roomB9FreeBlockPtr(bufPtr) {
  return ((bufPtr >>> 0) - 4) >>> 0;
}

/** free_path && free_ptr. */
export function roomB9FreeIatNeeded(resultByte, bufPtr) {
    if (roomB9FreePathNeeded(resultByte) == 0) return 0;
    return roomB9FreePtrNeeded(bufPtr);
}

/**
 * Pure 64-bit heap counter posts after size header load.
 * new_lo = old_lo - size; new_hi = old_hi - (old_lo < size).
 */
export function roomB9FreeHeapAccount(oldLo, oldHi, sizeHeader) {
  const out = {};
    let size = sizeHeader >>> 0;
    let lo = oldLo >>> 0;
    let borrow = lo < size ? 1 : 0;
    out.newLo = (lo - size) >>> 0;
    out.newHi = ((oldHi >>> 0) - borrow) >>> 0;
    out.borrow = borrow;
  return out;
}

/**
 * Post-lookup pure residual plan (lookup CALL still host).
 * free_block_ptr is 0 when IAT free is not taken.
 */
export function roomB9FreeBodyPlan(lookupCount, resultByte, bufPtr, heapStatsGlobal) {
  const out = {};
    let helper = roomB9FreeHelperNeeded(lookupCount);
    let free_path = roomB9FreePathNeeded(resultByte);
    let free_ptr = roomB9FreePtrNeeded(bufPtr);
    let free_iat =
        (free_path != 0 && free_ptr != 0) ? 1 : 0;
    out.helperNeeded = helper;
    out.freePathNeeded = free_path;
    out.freePtrNeeded = free_ptr;
    out.freeIatNeeded = free_iat;
    out.heapStatsBase =
        roomB9FreeHeapStatsBase(heapStatsGlobal);
    out.freeBlockPtr =
        free_iat != 0 ? roomB9FreeBlockPtr(bufPtr) : 0;
  return out;
}

/** Lookup arg pack posts (host still owns FUN_0041af60). */
export function roomB9FreeLookupArgs() {
  const out = {};
    out.entityType = ROOM_B9_FREE_ENTITY_TYPE;
    out.entityVariant = ROOM_B9_FREE_ENTITY_VARIANT;
    out.entitySubtype = ROOM_B9_FREE_ENTITY_SUBTYPE;
    out.argPad0 = ROOM_B9_FREE_ARG_PAD0;
    out.argPad1 = ROOM_B9_FREE_ARG_PAD1;
    out.thisOff = ROOM_B9_FREE_THIS_OFF;
    out.hostVa = ROOM_B9_FREE_HOST_VA_LOOKUP;
  return out;
}

/* ---- Isaac::genrand_int32 generator core (helpers ABI v40) ----------------
 *
 */

export const ROOM_GENRAND_N = 624;
export const ROOM_GENRAND_M = 397;
export const ROOM_GENRAND_LOOP1_END = 227;
export const ROOM_GENRAND_STATE_BYTES = 2496;
export const ROOM_GENRAND_INIT_INDEX = 624;
export const ROOM_GENRAND_UNSEEDED_INDEX = 625;
export const ROOM_GENRAND_UPPER_MASK = 0x80000000;
export const ROOM_GENRAND_LOWER_MASK = 0x7fffffff;
export const ROOM_GENRAND_MATRIX_A = 0x9908b0df;
export const ROOM_GENRAND_INIT_MULT = 0x6c078965;
export const ROOM_GENRAND_INIT_SHIFT = 30;
export const ROOM_GENRAND_DEFAULT_SEED = 5489;
export const ROOM_GENRAND_TEMPER_SHIFT_U = 11;
export const ROOM_GENRAND_TEMPER_SHIFT_S = 7;
export const ROOM_GENRAND_TEMPER_SHIFT_T = 15;
export const ROOM_GENRAND_TEMPER_SHIFT_L = 18;
export const ROOM_GENRAND_TEMPER_PRE_MASK_B = 0xff3a58ad;
export const ROOM_GENRAND_TEMPER_PRE_MASK_C = 0xffffdf8c;
export const ROOM_GENRAND_TEMPER_MASK_B = 0x9d2c5680;
export const ROOM_GENRAND_TEMPER_MASK_C = 0xefc60000;

export const ROOM_GENRAND_HOST_VA_CALL = 0x006eef60;
export const ROOM_GENRAND_HOST_VA_INIT = 0x006eef20;
export const ROOM_GENRAND_HOST_VA_RELOAD = 0x006eefcb;
export const ROOM_GENRAND_HOST_VA_EMIT = 0x006ef07f;
export const ROOM_GENRAND_HOST_VA_LOG_START = 0x006ef0b2;
export const ROOM_GENRAND_HOST_VA_RET = 0x006ef1e4;
export const ROOM_GENRAND_STATE_VA = 0x00c7ac70;
export const ROOM_GENRAND_INDEX_VA = 0x00c34f04;
export const ROOM_GENRAND_MODE_FLAG_VA = 0x00c7ac68;
export const ROOM_GENRAND_MAG01_VA = 0x00b67f8c;
export const ROOM_GENRAND_IAT_CRT_RAND = 0x00b18994;
export const ROOM_GENRAND_IAT_BACKTRACE = 0x00b182c8;
export const ROOM_GENRAND_IAT_XLENGTH = 0x00b184d4;
export const ROOM_GENRAND_LOG_LIST_VA = 0x00c79864;
export const ROOM_GENRAND_LOG_COUNT_VA = 0x00c79868;
export const ROOM_GENRAND_LOG_NODE_BYTES = 0x114;
export const ROOM_GENRAND_LOG_PAYLOAD_BYTES = 0x10c;
export const ROOM_GENRAND_LOG_FRAMES = 0x40;
export const ROOM_GENRAND_LOG_MAX_NODES = 0xed7303;

export const ROOM_GENRAND_ACTION_EMIT = 0;
export const ROOM_GENRAND_ACTION_RELOAD = 1;
export const ROOM_GENRAND_ACTION_SEED_RELOAD = 2;

/** Every recovered generator constant, mirroring isaac_room_genrand_constants. */
export function roomGenrandConstants() {
  const out = {};
    out.n = (ROOM_GENRAND_N);
    out.m = (ROOM_GENRAND_M);
    out.loop1End = (ROOM_GENRAND_LOOP1_END);
    out.stateBytes = (ROOM_GENRAND_STATE_BYTES);
    out.initIndex = (ROOM_GENRAND_INIT_INDEX);
    out.unseededIndex =
        (ROOM_GENRAND_UNSEEDED_INDEX);
    out.upperMask = (ROOM_GENRAND_UPPER_MASK);
    out.lowerMask = (ROOM_GENRAND_LOWER_MASK);
    out.matrixA = (ROOM_GENRAND_MATRIX_A);
    out.initMult = (ROOM_GENRAND_INIT_MULT);
    out.initShift = (ROOM_GENRAND_INIT_SHIFT);
    out.defaultSeed = (ROOM_GENRAND_DEFAULT_SEED);
    out.temperShiftU = (ROOM_GENRAND_TEMPER_SHIFT_U);
    out.temperShiftS = (ROOM_GENRAND_TEMPER_SHIFT_S);
    out.temperShiftT = (ROOM_GENRAND_TEMPER_SHIFT_T);
    out.temperShiftL = (ROOM_GENRAND_TEMPER_SHIFT_L);
    out.temperPreMaskB = (ROOM_GENRAND_TEMPER_PRE_MASK_B);
    out.temperPreMaskC = (ROOM_GENRAND_TEMPER_PRE_MASK_C);
    out.temperMaskB = (ROOM_GENRAND_TEMPER_MASK_B);
    out.temperMaskC = (ROOM_GENRAND_TEMPER_MASK_C);
    out.mag01Va = (ROOM_GENRAND_MAG01_VA);
    out.stateVa = (ROOM_GENRAND_STATE_VA);
    out.indexVa = (ROOM_GENRAND_INDEX_VA);
    out.modeFlagVa = (ROOM_GENRAND_MODE_FLAG_VA);
  return out;
}

/** Literal two-entry .rdata table at 0x00b67f8c. */
const ROOM_GENRAND_MAG01_TABLE = Object.freeze([0x00000000, ROOM_GENRAND_MATRIX_A]);

/** mag01[y & 1] — the PE only ever indexes with the low bit. */
export function roomGenrandMag01(index) {
  return ROOM_GENRAND_MAG01_TABLE[index & 1] >>> 0;
}

/**
 * Index dispatch at 0x006eefaa. `jl` is signed, `jne` is exact equality, so
 * 626 twists without seeding and a negative index falls straight through to
 * the emit block (an out-of-bounds read in the PE).
 */
export function roomGenrandIndexAction(index) {
    if (index < (ROOM_GENRAND_N)) {
      return ROOM_GENRAND_ACTION_EMIT;
    }

    if (index == (ROOM_GENRAND_UNSEEDED_INDEX)) {
      return ROOM_GENRAND_ACTION_SEED_RELOAD;
    }
    return ROOM_GENRAND_ACTION_RELOAD;
}

/** (cur & 0x80000000) | (next & 0x7fffffff), written as the PE writes it. */
export function roomGenrandMixBits(cur, next) {
    let y = next >>> 0;
    y ^= cur >>> 0;
    y &= (ROOM_GENRAND_LOWER_MASK >>> 0);
    y ^= cur >>> 0;
    return y >>> 0;
}

/** far ^ (y >>> 1) ^ mag01[y & 1]. */
export function roomGenrandTwistWord(cur, next, far) {
    const y = roomGenrandMixBits(cur, next) >>> 0;
    let out = y >>> 1;
    out ^= roomGenrandMag01(y & 1);
    out ^= far >>> 0;
    return out >>> 0;
}

/** Tempering with the PE's pre-shift masks (equivalent to <<7 & 0x9d2c5680). */
export function roomGenrandTemper(value) {
    let y = value >>> 0;
     y ^= y >>> ROOM_GENRAND_TEMPER_SHIFT_U;

    y ^= ((y & (ROOM_GENRAND_TEMPER_PRE_MASK_B))
                               << ROOM_GENRAND_TEMPER_SHIFT_S);

    y ^= ((y & (ROOM_GENRAND_TEMPER_PRE_MASK_C))
                               << ROOM_GENRAND_TEMPER_SHIFT_T);
     y ^= y >>> ROOM_GENRAND_TEMPER_SHIFT_L;
    return y >>> 0;
}

/** FUN_006eef20; returns a fresh 624-word state. Caller's index becomes 624. */
export function roomGenrandInit(seed) {
  const state = new Uint32Array(ROOM_GENRAND_N);
  state[0] = seed >>> 0;
  for (let i = 1; i < ROOM_GENRAND_N; ++i) {
    const prev = state[i - 1] >>> 0;
    const mixed = (prev ^ (prev >>> ROOM_GENRAND_INIT_SHIFT)) >>> 0;
    state[i] = (Math.imul(mixed, ROOM_GENRAND_INIT_MULT) + i) >>> 0;
  }
  return state;
}

/** In-place twist of all 624 words (three PE loops); index becomes 0. */
export function roomGenrandReload(state) {
  const n = ROOM_GENRAND_N | 0;
  const m = ROOM_GENRAND_M | 0;
  const loop1 = ROOM_GENRAND_LOOP1_END | 0;
  for (let kk = 0; kk < loop1; ++kk) {
    state[kk] = roomGenrandTwistWord(state[kk], state[kk + 1], state[kk + m]);
  }
  for (let kk = loop1; kk < n - 1; ++kk) {
    state[kk] = roomGenrandTwistWord(state[kk], state[kk + 1], state[kk + m - n]);
  }
  state[n - 1] = roomGenrandTwistWord(state[n - 1], state[0], state[m - 1]);
  return state;
}

/** One genrand value; `state` is mutated exactly as the PE mutates mt[]. */
export function roomGenrandNext(state, index) {
  const out = {};
    let action = roomGenrandIndexAction(index);
    out.indexIn = index;
    out.action = action;
    out.seeded = action == ROOM_GENRAND_ACTION_SEED_RELOAD ? 1 : 0;
    out.reloaded = action == ROOM_GENRAND_ACTION_EMIT ? 0 : 1;
    let slot = index;
    if (action != ROOM_GENRAND_ACTION_EMIT) {
      if (state != null) {
        if (action == ROOM_GENRAND_ACTION_SEED_RELOAD) {
          const seeded = roomGenrandInit(ROOM_GENRAND_DEFAULT_SEED);
          if (state && typeof state.set === "function") {
            state.set(seeded);
          } else if (state) {
            for (let i = 0; i < seeded.length; i += 1) state[i] = seeded[i];
          }
        }
        roomGenrandReload(state);
      }

      slot = 0;
    }

    let oob = slot < 0 ? 1 : 0;
    out.indexOob = oob;
    let raw =
        (oob != 0 || state == null) ? 0 : state[slot];
    out.raw = raw;
    out.value = roomGenrandTemper(raw);
    out.indexOut = slot + 1;
  return out;
}

/** `count` consecutive genrand dwords in PE call order. */
export function roomGenrandFill(state, index, count) {
  const values = [];
  let written = 0;
  let reloads = 0;
  let cursor = index;
  const want = count > 0 ? count : 0;
  for (let i = 0; i < want; ++i) {
    const step = roomGenrandNext(state, cursor);
    if (step.reloaded !== 0) ++reloads;
    values.push(step.value >>> 0);
    cursor = step.indexOut;
    ++written;
  }
  return {
    values,
    count: written,
    indexIn: index,
    indexOut: cursor,
    reloads,
  };
}

/** What is left of the CALL once the value stream is pure. */
export function roomGenrandCallResidual(modeFlag) {
  const out = {};
    let crt = (modeFlag & 0xff) != 0 ? 1 : 0;
    out.crtRandActive = crt;
    out.valuePure = crt != 0 ? 0 : 1;
    out.logRingHost = 1;
    out.stateBytes = (ROOM_GENRAND_STATE_BYTES);
    out.stateVa = (ROOM_GENRAND_STATE_VA);
    out.indexVa = (ROOM_GENRAND_INDEX_VA);
    out.modeFlagVa = (ROOM_GENRAND_MODE_FLAG_VA);
    out.hostVaCall = (ROOM_GENRAND_HOST_VA_CALL);
    out.hostVaCrtRand = (ROOM_GENRAND_IAT_CRT_RAND);
    out.hostVaLogStart = (ROOM_GENRAND_HOST_VA_LOG_START);
    out.hostVaRet = (ROOM_GENRAND_HOST_VA_RET);
  return out;
}

/**
 * H5 FUN_00824a70 genrand plan with the pure MT core available.
 */
export function roomAmbient824a70GenrandMtPlan(loopCount, mtStateReady, modeFlag = 0) {
  const out = {};
    let lc = loopCount > 0 ? loopCount : 0;
    let ready = mtStateReady != 0 ? 1 : 0;
    let crt = (modeFlag & 0xff) != 0 ? 1 : 0;
    let per_loop =
        (ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP);
    let pure = (ready != 0 && crt == 0) ? 1 : 0;
    out.loopCount = lc;
    out.samplesPerLoop = per_loop;
    out.maxGenrandPerLoop =
        (ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP);
    out.samplesNeeded = lc * per_loop;
    out.mtStateReady = ready;
    out.crtRandActive = crt;
    out.genrandPure = pure;
    if (lc == 0) {

      out.purePostsReady = 1;
      out.genrandHostNeeded = 0;
      out.bodyHostNeeded = 0;
      out.requiresMtState = 0;
      out.requiresSampleStream = 0;
      return out;
    }
    out.purePostsReady = pure;
    out.genrandHostNeeded = pure != 0 ? 0 : 1;

    out.bodyHostNeeded = 1;
    out.requiresMtState = (crt == 0 && ready == 0) ? 1 : 0;
    out.requiresSampleStream = crt;
  return out;
}

/** H5 loop sample stream (7 per loop, PE order) drawn from the pure core. */
export function roomAmbient824a70GenrandMtSamples(state, index, loopCount, modeFlag = 0) {
  const out = {};
    let lc = loopCount > 0 ? loopCount : 0;
    let crt = (modeFlag & 0xff) != 0 ? 1 : 0;
    let per_loop =
        (ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP);
    if (crt != 0) {

      if (out != null) {
        out.count = 0;
        out.indexIn = index;
        out.indexOut = index;
        out.reloads = 0;
      }
      return out;
    }
    return roomGenrandFill(state, index, lc * per_loop);
  return out;
}

/**
 * FUN_00813460 spawn pos with its nested genrand taken from the pure core.
 * The two span subtractions happen before the CALL at 0x0081348c, so they are
 * independent of the sample; only the unit float and radius consume it.
 */
export function room7230SpawnPosMt(state, index, modeFlag, roomF14, roomF18, roomF1c, roomF20) {
  const out = {};
    let crt = (modeFlag & 0xff) != 0 ? 1 : 0;
    if (crt != 0) {
      out.spanX = Math.fround(0.0);
      out.spanY = Math.fround(0.0);
      out.unit = Math.fround(0.0);
      out.centerX = Math.fround(0.0);
      out.centerY = Math.fround(0.0);
      out.maxSpan = Math.fround(0.0);
      out.radiusArg = Math.fround(0.0);
      out.genrand = 0;
      out.indexIn = index;
      out.indexOut = index;
      out.genrandPure = 0;
      return out;
    }

    const step = roomGenrandNext(state, index);
    const posts = room7230SpawnPosPosts(step.value, roomF14, roomF18, roomF1c,
                                    roomF20);
    out.spanX = posts.spanX;
    out.spanY = posts.spanY;
    out.unit = posts.unit;
    out.centerX = posts.centerX;
    out.centerY = posts.centerY;
    out.maxSpan = posts.maxSpan;
    out.radiusArg = posts.radiusArg;
    out.genrand = step.value;
    out.indexIn = index;
    out.indexOut = step.indexOut;
    out.genrandPure = 1;
  return out;
}

/* ---- v41: genrand debug ring, CRT-rand override, 7230 finish islands ------
 *
 */

export const ROOM_GENRAND_LOG_NEXT_OFF = 0x00;
export const ROOM_GENRAND_LOG_PREV_OFF = 0x04;
export const ROOM_GENRAND_LOG_VALUE_OFF = 0x08;
export const ROOM_GENRAND_LOG_FRAME_OFF = 0x0c;
export const ROOM_GENRAND_LOG_BACKTRACE_OFF = 0x10;
export const ROOM_GENRAND_LOG_DEPTH_OFF = 0x110;
export const ROOM_GENRAND_LOG_ZERO2_OFF = 0x0c;
export const ROOM_GENRAND_LOG_ZERO2_BYTES = 0x108;
export const ROOM_GENRAND_LOG_SENTINEL_CTOR_VA = 0x004019b0;
export const ROOM_GENRAND_LOG_DTOR_VA = 0x00b165f0;
export const ROOM_GENRAND_LOG_DRAIN_VA = 0x00905114;
export const ROOM_GENRAND_LOG_FRAME_SRC_OFF = 0x4b3e4;
export const ROOM_GENRAND_LOG_FACTOR_SRC_OFF = 0x4b3e8;
export const ROOM_GENRAND_HOST_VA_ALLOC = 0x00a0f4c0;
export const ROOM_GENRAND_HOST_VA_FREE = 0x00aef15c;
export const ROOM_GENRAND_HOST_VA_MEMSET = 0x00af05e5;
export const ROOM_GENRAND_HOST_VA_TRIM_LOOP = 0x006ef182;

export const ROOM_GENRAND_CRT_READ_VA = 0x006eef8a;
export const ROOM_GENRAND_CRT_SET_VA = 0x00916e51;
export const ROOM_GENRAND_CRT_CLEAR_VA = 0x00916e71;
export const ROOM_GENRAND_CRT_BRACKET_SITE_VA = 0x00916e5e;
export const ROOM_GENRAND_CRT_BRACKET_CALLEE_VA = 0x00948fc0;
export const ROOM_GENRAND_CRT_OWNER_VA = 0x00916770;
export const ROOM_GENRAND_CRT_OWNER_CALLER_VA = 0x0090b2ce;
export const ROOM_GENRAND_CRT_PROVEN_SITE_VA = 0x009eb892;

/** Node field map, mirroring isaac_room_genrand_log_layout. */
export function roomGenrandLogLayout() {
  const out = {};
    out.nodeBytes = (ROOM_GENRAND_LOG_NODE_BYTES);
    out.payloadBytes =
        (ROOM_GENRAND_LOG_PAYLOAD_BYTES);
    out.nextOff = (ROOM_GENRAND_LOG_NEXT_OFF);
    out.prevOff = (ROOM_GENRAND_LOG_PREV_OFF);
    out.valueOff = (ROOM_GENRAND_LOG_VALUE_OFF);
    out.frameOff = (ROOM_GENRAND_LOG_FRAME_OFF);
    out.backtraceOff =
        (ROOM_GENRAND_LOG_BACKTRACE_OFF);
    out.depthOff = (ROOM_GENRAND_LOG_DEPTH_OFF);
    out.backtraceFrames = (ROOM_GENRAND_LOG_FRAMES);
    out.zero2Off = (ROOM_GENRAND_LOG_ZERO2_OFF);
    out.zero2Bytes = (ROOM_GENRAND_LOG_ZERO2_BYTES);
    out.maxNodes = (ROOM_GENRAND_LOG_MAX_NODES);
  return out;
}

/** `cmp [0xc79868],0xed7303; jne` — equality, so only the exact size throws. */
export function roomGenrandLogOverflowThrow(size) {
  return (size >>> 0) === ROOM_GENRAND_LOG_MAX_NODES ? 1 : 0;
}

/** push_back link posts (four stores) + the already-executed size increment. */
export function roomGenrandLogLink(head, headPrev, node, size) {
  const out = {};
    out.nodeNext = head;
    out.nodePrev = headPrev;
    out.headPrev = node;
    out.oldPrevNext = node;
    out.sizeAfter =
        ((size) + 1) | 0;
  return out;
}

/** Record fields; depth is the USHORT return widened by `movzx eax,ax`. */
export function roomGenrandLogRecord(value, frame, backtraceRet) {
  const out = {};
    out.value = value;
    out.frame = frame;

    out.depth = (backtraceRet & 0xffff);
  return out;
}

/** frame - 2*factor - 2, wrapping at 32 bits. */
export function roomGenrandLogTrimCutoff(frame, factor) {
    return (frame - (factor + factor) - 2) >>> 0;
}

/** One trim iteration; the PE compare is `jae`, i.e. unsigned. */
export function roomGenrandLogTrimStep(size, front, frontNext, frontPrev, frontFrame, frame, factor) {
  const out = {};
    let cutoff = roomGenrandLogTrimCutoff(frame, factor);
    out.cutoff = cutoff;

    let nonzero = size != 0 ? 1 : 0;
    out.sizeNonzero = nonzero;

    let needed = (nonzero != 0 && frontFrame < cutoff) ? 1 : 0;
    out.trimNeeded = needed;
    if (needed == 0) {
      out.prevNext = 0;
      out.nextPrev = 0;
      out.freePtr = 0;
      out.sizeAfter = size;
      out.continueLoop = 0;
      return out;
    }
    out.prevNext = frontNext;
    out.nextPrev = frontPrev;
    out.freePtr = front;
    let after = (
        (size) - 1);
    out.sizeAfter = after;
    out.continueLoop = after != 0 ? 1 : 0;
  return out;
}

/** Full per-call picture after v41. call_pure stays 0 while any host remains. */
export function roomGenrandCallPlan(modeFlag, size) {
  const out = {};
    let crt = (modeFlag & 0xff) != 0 ? 1 : 0;
    out.crtRandActive = crt;
    out.valuePure = crt != 0 ? 0 : 1;

    out.ringReachable = 1;
    out.ringStructurePure = 1;
    out.overflowThrowNeeded = roomGenrandLogOverflowThrow(size);
    out.hostAllocCalls = 1;
    out.hostBacktraceCalls = 1;
    out.hostFreeCallsMin = 0;
    out.hostFreeUnbounded = 1;
    out.callPure = 0;
    out.hostVaAlloc = (ROOM_GENRAND_HOST_VA_ALLOC);
    out.hostVaFree = (ROOM_GENRAND_HOST_VA_FREE);
    out.hostVaBacktrace = (ROOM_GENRAND_IAT_BACKTRACE);
    out.hostVaThrow = (ROOM_GENRAND_IAT_XLENGTH);
    out.hostVaMemset = (ROOM_GENRAND_HOST_VA_MEMSET);
    out.hostVaRingStart = (ROOM_GENRAND_HOST_VA_LOG_START);
    out.hostVaRet = (ROOM_GENRAND_HOST_VA_RET);
  return out;
}

/** The CRT-rand override, with its one proven activation window. */
export function roomGenrandCrtOverride(modeFlag) {
  const out = {};
    out.active = (modeFlag & 0xff) != 0 ? 1 : 0;
    out.defaultValue = 0;
    out.writerCount = 2;
    out.readerCount = 1;
    out.reachableFromRoomUpdate = 0;
    out.flagVa = (ROOM_GENRAND_MODE_FLAG_VA);
    out.readerVa = (ROOM_GENRAND_CRT_READ_VA);
    out.writerSetVa = (ROOM_GENRAND_CRT_SET_VA);
    out.writerClearVa = (ROOM_GENRAND_CRT_CLEAR_VA);
    out.bracketSiteVa = (ROOM_GENRAND_CRT_BRACKET_SITE_VA);
    out.bracketCalleeVa = (ROOM_GENRAND_CRT_BRACKET_CALLEE_VA);
    out.ownerFnVa = (ROOM_GENRAND_CRT_OWNER_VA);
    out.ownerCallerVa = (ROOM_GENRAND_CRT_OWNER_CALLER_VA);
    out.provenSiteVa = (ROOM_GENRAND_CRT_PROVEN_SITE_VA);
    out.iatCrtRand = (ROOM_GENRAND_IAT_CRT_RAND);
  return out;
}

/* ---- 7230 spawn finish (FUN_00813520) pure islands ---------------------- */

export const ROOM_7230_FINISH_ITERATIONS = 0x7d;
export const ROOM_7230_FINISH_SEED = 0x441c1dfd;
export const ROOM_7230_FINISH_SHIFT_A = 1;
export const ROOM_7230_FINISH_SHIFT_B = 9;
export const ROOM_7230_FINISH_SHIFT_C = 29;
export const ROOM_7230_FINISH_SHIFT_TABLE_VA = 0x00b1f4ec;
export const ROOM_7230_FINISH_THRESH_BASE = 0x2bc;
export const ROOM_7230_FINISH_THRESH_GE60 = 0x258;
export const ROOM_7230_FINISH_THRESH_LT40 = 0x320;
export const ROOM_7230_FINISH_THRESH_LT20 = 0x384;
export const ROOM_7230_FINISH_THRESH_LT5 = 0x3e8;
export const ROOM_7230_FINISH_GRID_COST_OFF = 0x76c;
export const ROOM_7230_FINISH_WIDTH_OFF = 0x0c;
export const ROOM_7230_FINISH_HEIGHT_OFF = 0x10;
export const ROOM_7230_FINISH_RADIUS_BONUS = 0xbb8;
export const ROOM_7230_FINISH_HOST_VA_ENTRY = 0x00813520;
export const ROOM_7230_FINISH_HOST_VA_SITE = 0x00813506;
/** exact ZHL: __thiscall uint32_t Room::GetGridCollision(int index). */
export const ROOM_7230_FINISH_HOST_VA_QUERY = 0x007f0800;
export const ROOM_7230_FINISH_HOST_VA_CLAMP = 0x00812f50;
export const ROOM_7230_FINISH_HOST_VA_SQRT = 0x00435a50;
export const ROOM_7230_FINISH_HOST_VA_COS = 0x0041d540;
export const ROOM_7230_FINISH_HOST_VA_SIN = 0x0041d520;
export const ROOM_7230_FINISH_HOST_VA_FATAL = 0x00a112c0;
export const ROOM_7230_FINISH_HOST_VA_RECURSE = 0x00813a99;
export const ROOM_7230_FINISH_HOST_VA_RET = 0x00813b29;

export const ROOM_7230_FINISH_RANDF_BITS = 0x2f7ffffe;
export const ROOM_7230_FINISH_DEG_BITS = 0x43b40000;
export const ROOM_7230_FINISH_RAD_BITS = 0x3c8efa35;
export const ROOM_7230_FINISH_RADIUS_CAP_BITS = 0x43fa0000;
export const ROOM_7230_FINISH_RADIUS_ADD_BITS = 0x40a00000;
export const ROOM_7230_FINISH_GRID_BITS = 0x42200000;
export const ROOM_7230_FINISH_GRID_Y0_BITS = 0x42f00000;
export const ROOM_7230_FINISH_HALF_BITS = 0x3f000000;

/** Threshold cmov ladder; the compares are signed and applied in PE order. */
export function room7230FinishThreshold(counter) {
    let t = (ROOM_7230_FINISH_THRESH_BASE);
    if (counter >= 0x3c) t = (ROOM_7230_FINISH_THRESH_GE60);
    if (counter < 0x28) t = (ROOM_7230_FINISH_THRESH_LT40);
    if (counter < 0x14) t = (ROOM_7230_FINISH_THRESH_LT20);
    if (counter < 0x05) t = (ROOM_7230_FINISH_THRESH_LT5);
    return t;
}

/** `test eax,eax; jg 0x00813570` at the bottom of the search loop. */
export function room7230FinishLoopContinue(counter) {
  return (counter | 0) > 0 ? 1 : 0;
}

/** Fixed-seed xorshift with the (1, 9, 29) triple from 0x00b1f4ec. */
export function room7230FinishRngNext(seed) {
    let x = seed >>> 0;
    x = ((x >>> ROOM_7230_FINISH_SHIFT_A) ^ x) >>> 0;
    x = (((x << ROOM_7230_FINISH_SHIFT_B) >>> 0) ^ x) >>> 0;
    x = ((x >>> ROOM_7230_FINISH_SHIFT_C) ^ x) >>> 0;
    return x;
}

/** "RNG Seed is zero!" fatal predicate (0x00a112c0 then int3). */
export function room7230FinishSeedFatal(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}

/** float(u32) * 0x2f7ffffe * 360 * (pi/180). */
export function room7230FinishAngle(seedOut) {
    let wide = (seedOut | 0);
    if ((seedOut >>> 31) !== 0) wide += 4294967296.0;
    let f = Math.fround(wide);
    f = Math.fround(f * roomPeF32BitsV41(ROOM_7230_FINISH_RANDF_BITS));
    f = Math.fround(f * roomPeF32BitsV41(ROOM_7230_FINISH_DEG_BITS));
    f = Math.fround(f * roomPeF32BitsV41(ROOM_7230_FINISH_RAD_BITS));
    return f;
}

/** (r > 500 ? 0 : r) + 5; NaN keeps its value because `jbe` is taken. */
export function room7230FinishRadius(radiusIn) {
    let cap =
        roomPeF32BitsV41(ROOM_7230_FINISH_RADIUS_CAP_BITS);
    let add =
        roomPeF32BitsV41(ROOM_7230_FINISH_RADIUS_ADD_BITS);

    let r = radiusIn;
    if (r > cap) r = Math.fround(0.0);
    return r + add;
}

/** cvttss2si: truncate toward zero, 0x80000000 when not representable. */
function room7230Cvttss2si(value) {
  const x = Math.fround(value);
  if (!Number.isFinite(x) || x >= 2147483648 || x < -2147483648) {
    return 0x80000000 | 0;
  }
  return x | 0;
}

/** World→grid: trunc((x-40)/40 + 0.5), trunc((y-120)/40 + 0.5), then bounds. */
export function room7230FinishGridIndex(x, y, width, height) {
  const out = {};
    let grid =
        roomPeF32BitsV41(ROOM_7230_FINISH_GRID_BITS);
    let y0 =
        roomPeF32BitsV41(ROOM_7230_FINISH_GRID_Y0_BITS);
    let half =
        roomPeF32BitsV41(ROOM_7230_FINISH_HALF_BITS);
    let gx = roomCvttss2siV41(Math.fround(Math.fround(Math.fround(x - grid) / grid) + half));
    let gy = roomCvttss2siV41(Math.fround(Math.fround(Math.fround(y - y0) / grid) + half));
    let xv = (gx >= 0 && gx < width) ? 1 : 0;
    let yv = (gy >= 0 && gy < height) ? 1 : 0;
    out.gridX = gx;
    out.gridY = gy;
    out.xValid = xv;
    out.yValid = yv;
    out.valid = (xv != 0 && yv != 0) ? 1 : 0;

    out.index = out.valid != 0
                     ? (
                           (width) *
                               (gy) +
                           (gx))
                     : -1;
  return out;
}

/** Grid→world: x = (idx % w)*40 + 40, y = (idx / w)*40 + 120 (signed idiv). */
export function room7230FinishGridWorld(index, width) {
  const out = {};
    let grid =
        roomPeF32BitsV41(ROOM_7230_FINISH_GRID_BITS);
    let y0 =
        roomPeF32BitsV41(ROOM_7230_FINISH_GRID_Y0_BITS);

    let ok =
        (width == 0 || ((index | 0) == (0x80000000 | 0) && (width | 0) == -1))
            ? 0
            : 1;
    if (ok == 0) {
      out.x = Math.fround(0.0);
      out.y = Math.fround(0.0);
      out.quot = 0;
      out.rem = 0;
      out.divOk = 0;
      return out;
    }
    let quot = ((index | 0) / (width | 0)) | 0;
    let rem = ((index | 0) % (width | 0)) | 0;
    out.quot = quot;
    out.rem = rem;
    out.divOk = 1;

    out.x = Math.fround(Math.fround(Math.fround(rem) * grid) + grid);
    out.y = Math.fround(Math.fround(Math.fround(quot) * grid) + y0);
  return out;
}

/** One search iteration's pure pack. */
export function room7230FinishStep(seed, counter, radiusIn) {
  const out = {};
    out.counter = counter;
    out.continueLoop = room7230FinishLoopContinue(counter);
    out.threshold = room7230FinishThreshold(counter);
    out.seedIn = seed;
    out.seedFatal = room7230FinishSeedFatal(seed);

    let next =
        out.seedFatal != 0 ? 0 : room7230FinishRngNext(seed);
    out.seedOut = next;
    out.angle = out.seedFatal != 0 ? Math.fround(0.0)
                                      : room7230FinishAngle(next);
    out.radius = room7230FinishRadius(radiusIn);
  return out;
}

/* ---- v42: Room::GetGridCollision + the rest of the FUN_00813520 host set ---
 *
 */

export const ROOM_GRID_COLLISION_DESC_OFF = 0x04;
export const ROOM_GRID_COLLISION_DATA_OFF = 0x10;
export const ROOM_GRID_COLLISION_CFG_TYPE_OFF = 0x00;
export const ROOM_GRID_COLLISION_CFG_FIELD8_OFF = 0x08;
export const ROOM_GRID_COLLISION_CFG_TYPE_MATCH = 0x23;
export const ROOM_GRID_COLLISION_CFG_FIELD8_MATCH = 0x10;
export const ROOM_GRID_COLLISION_ENTITY_BASE = 0x24;
export const ROOM_GRID_COLLISION_COST_BASE = 0x76c;
export const ROOM_GRID_COLLISION_ENTITY_FIELD_OFF = 0x3c;
export const ROOM_GRID_COLLISION_COST_LO = 0x3e8;
export const ROOM_GRID_COLLISION_COST_MID = 0xbb8;
export const ROOM_GRID_COLLISION_COST_HI = 0xf9f;
/** exact ZHL: __thiscall uint32_t Room::GetGridCollision(int index). */
export const ROOM_GRID_COLLISION_HOST_VA = 0x007f0800;
export const ROOM_GRID_COLLISION_SITE_VA = 0x00813577;

export const ROOM_GRID_COLLISION_VALUE_ZERO = 0;
export const ROOM_GRID_COLLISION_VALUE_MID_BAND = 1;
export const ROOM_GRID_COLLISION_VALUE_HIGH = 3;
export const ROOM_GRID_COLLISION_VALUE_NEG_INDEX = 4;

export const ROOM_GRID_COLLISION_PATH_CONFIG = 0;
export const ROOM_GRID_COLLISION_PATH_NEG_INDEX = 1;
export const ROOM_GRID_COLLISION_PATH_ENTITY = 2;
export const ROOM_GRID_COLLISION_PATH_MID_BAND = 3;
export const ROOM_GRID_COLLISION_PATH_COST_LOW = 4;
export const ROOM_GRID_COLLISION_PATH_COST_HIGH = 5;

/** data && [data+8]==0x10 && [data]==0x23 — evaluated before the index. */
export function roomGridCollisionConfigZero(dataPresent, cfgType, cfgField8) {
    if (dataPresent == 0) return 0;
    if (cfgField8 !=
        (ROOM_GRID_COLLISION_CFG_FIELD8_MATCH)) {
      return 0;
    }
    return cfgType ==
                   (ROOM_GRID_COLLISION_CFG_TYPE_MATCH)
               ? 1
               : 0;
}

/** Signed three-way cost band. */
export function roomGridCollisionFromCost(cost) {
    if (cost < (ROOM_GRID_COLLISION_COST_MID)) {
      if (cost < (ROOM_GRID_COLLISION_COST_LO)) {
        return (ROOM_GRID_COLLISION_VALUE_ZERO);
      }
      return (ROOM_GRID_COLLISION_VALUE_HIGH);
    }
    if (cost > (ROOM_GRID_COLLISION_COST_HI)) {
      return (ROOM_GRID_COLLISION_VALUE_HIGH);
    }
    return (ROOM_GRID_COLLISION_VALUE_MID_BAND);
}

/** Complete exact-ZHL Room::GetGridCollision. */
export function roomGetGridCollision({
  dataPresent = 0,
  cfgType = 0,
  cfgField8 = 0,
  index = 0,
  gridEntityPresent = 0,
  gridEntityField3c = 0,
  gridCost = 0,
} = {}) {
  const out = {};
  out.indexUncheckedHigh = 1;
  const neg = (index | 0) < 0 ? 1 : 0;
  out.indexNegative = neg;

  if (roomGridCollisionConfigZero(dataPresent, cfgType, cfgField8) !== 0) {
    out.value = ROOM_GRID_COLLISION_VALUE_ZERO;
    out.path = ROOM_GRID_COLLISION_PATH_CONFIG;
    return out;
  }
  if (neg !== 0) {
    out.value = ROOM_GRID_COLLISION_VALUE_NEG_INDEX;
    out.path = ROOM_GRID_COLLISION_PATH_NEG_INDEX;
    return out;
  }
  if (gridEntityPresent !== 0) {
    out.value = gridEntityField3c >>> 0;
    out.path = ROOM_GRID_COLLISION_PATH_ENTITY;
    return out;
  }
  const cost = gridCost | 0;
  out.value = roomGridCollisionFromCost(cost);
  if (cost < ROOM_GRID_COLLISION_COST_MID) {
    out.path = cost < ROOM_GRID_COLLISION_COST_LO
      ? ROOM_GRID_COLLISION_PATH_COST_LOW
      : ROOM_GRID_COLLISION_PATH_COST_HIGH;
    return out;
  }
  out.path = cost > ROOM_GRID_COLLISION_COST_HI
    ? ROOM_GRID_COLLISION_PATH_COST_HIGH
    : ROOM_GRID_COLLISION_PATH_MID_BAND;
  return out;
}

export const ROOM_7230_FINISH_IAT_COS = 0x00b18820;
export const ROOM_7230_FINISH_IAT_SIN = 0x00b18834;
export const ROOM_7230_FINISH_IAT_SQRT = 0x00b1884c;

/** FUN_00435a50: inline sqrtsd unless 0.0 > x (so NaN and -0.0 stay inline). */
export function room7230FinishSqrt(x) {
  const out = {};
    let host = (x < Math.fround(0.0)) ? 1 : 0;
    out.crtHostNeeded = host;
    if (host != 0) {
      out.value = Math.fround(0.0);
      return out;
    }

    let wide = (x);
    out.value = Math.fround(builtinSqrt(wide));
  return out;
}

/** sin/cos are CRT libm and stay host; sqrt only leaves for negatives. */
export function room7230FinishMathResidual(sqrtArg) {
  const out = {};
    const s = room7230FinishSqrt(sqrtArg);
    out.cosHostNeeded = 1;
    out.sinHostNeeded = 1;
    out.sqrtHostNeeded = s.crtHostNeeded;
    out.sqrtPure = s.crtHostNeeded != 0 ? 0 : 1;
    out.hostVaCos = (ROOM_7230_FINISH_HOST_VA_COS);
    out.hostVaSin = (ROOM_7230_FINISH_HOST_VA_SIN);
    out.hostVaSqrt = (ROOM_7230_FINISH_HOST_VA_SQRT);
    out.iatCos = (ROOM_7230_FINISH_IAT_COS);
    out.iatSin = (ROOM_7230_FINISH_IAT_SIN);
    out.iatSqrt = (ROOM_7230_FINISH_IAT_SQRT);
  return out;
}

export const ROOM_7230_FINISH_RECURSE_BUDGET = 0x14;

/** `mov eax,ebx; dec ebx; test eax,eax; jle` — decrement always applies. */
export function room7230FinishRecurseStep(budget) {
  const out = {};
    out.budgetIn = budget;
    out.budgetOut = ((budget) - 1) | 0;
    out.enter = budget > 0 ? 1 : 0;
  return out;
}

export const ROOM_CLAMP_812F50_SHAPE_OFF = 0x48;
export const ROOM_CLAMP_812F50_SHAPE_LO = 9;
export const ROOM_CLAMP_812F50_SHAPE_SPAN = 3;
export const ROOM_CLAMP_812F50_NEG_MASK_VA = 0x00bacb70;
export const ROOM_CLAMP_812F50_HOST_VA = 0x00812f50;
/** exact ZHL: __thiscall LRoomAreaDesc* Room::GetLRoomAreaDesc(LRoomAreaDesc*). */
export const ROOM_CLAMP_812F50_HOST_VA_AREADESC = 0x0081f8b0;
export const ROOM_CLAMP_812F50_SITE_A = 0x0081370b;
export const ROOM_CLAMP_812F50_SITE_B = 0x008138f0;
export const ROOM_CLAMP_812F50_ROOM_X0_OFF = 0x14;
export const ROOM_CLAMP_812F50_ROOM_Y0_OFF = 0x18;
export const ROOM_CLAMP_812F50_ROOM_X1_OFF = 0x1c;
export const ROOM_CLAMP_812F50_ROOM_Y1_OFF = 0x20;

export const ROOM_CLAMP_812F50_PATH_PASSTHROUGH = 0;
export const ROOM_CLAMP_812F50_PATH_SIMPLE = 1;
export const ROOM_CLAMP_812F50_PATH_LROOM = 2;

/** `add eax,-9; cmp eax,3; ja simple` — wrapping subtract, unsigned compare. */
export function roomClamp812f50Path(descPresent, dataPresent, shape) {
    if (descPresent == 0 || dataPresent == 0) {
      return ROOM_CLAMP_812F50_PATH_PASSTHROUGH;
    }

    let rebased = ((shape | 0) - ROOM_CLAMP_812F50_SHAPE_LO) >>> 0;
    if (rebased > (ROOM_CLAMP_812F50_SHAPE_SPAN >>> 0)) {
      return ROOM_CLAMP_812F50_PATH_SIMPLE;
    }
    return ROOM_CLAMP_812F50_PATH_LROOM;
}

/* MAXSS dst,src -> (dst > src) ? dst : src; MINSS dst,src -> (dst < src) ?
   dst : src. Unordered compares therefore yield `src`, not the NaN. */
function maxss812f50(dst, src) {
  dst = Math.fround(dst);
  src = Math.fround(src);
  return dst > src ? dst : src;
}
function minss812f50(dst, src) {
  dst = Math.fround(dst);
  src = Math.fround(src);
  return dst < src ? dst : src;
}
function roomMaxssV42(dst, src) {
  return maxss812f50(dst, src);
}
function roomMinssV42(dst, src) {
  return minss812f50(dst, src);
}

/** The complete simple clamp at 0x008131680x008131b7. */
export function roomClamp812f50Simple(inX, inY, margin, f10, f14, f18, roomX0, roomY0, roomX1, roomY1) {
  const out = {};
    let lo_x = Math.fround(Math.fround(margin) + Math.fround(roomX0));
    let hi_x = Math.fround(Math.fround(roomX1) - Math.fround(f14));
    let lo_y = Math.fround(Math.fround(f10) + Math.fround(roomY0));
    let hi_y = Math.fround(Math.fround(roomY1) - Math.fround(f18));
    out.loX = lo_x;
    out.hiX = hi_x;
    out.loY = lo_y;
    out.hiY = hi_y;
    out.x = roomMinssV42(roomMaxssV42(inX, lo_x), hi_x);
    out.y = roomMinssV42(roomMaxssV42(inY, lo_y), hi_y);
  return out;
}

/* ---- v43 CORRECTNESS FIX: the 0x00956780 pre-Play sound-id rewrite -------
 *
 */

export const ROOM_PRE_PLAY_ID_GATED = 0x25;
export const ROOM_PRE_PLAY_ID_RARE = 0x12d;
export const ROOM_PRE_PLAY_RARE_MODULUS = 20;
export const ROOM_PRE_PLAY_MAP_KEY = 7;
export const ROOM_PRE_PLAY_NODE_LIMIT = 7;
export const ROOM_PRE_PLAY_HOST_VA = 0x00956780;
export const ROOM_PRE_PLAY_HOST_VA_LOOKUP = 0x004288a0;
export const ROOM_PRE_PLAY_HOST_VA_FATAL = 0x00a112c0;
/** exact ZHL SFXManager::Play. */
export const ROOM_PRE_PLAY_HOST_VA_PLAY = 0x0092dc30;
export const ROOM_PRE_PLAY_GAME_GLOBAL = 0x00c71678;
export const ROOM_PRE_PLAY_RNG_SEED_GLOBAL = 0x00c5d2b0;
export const ROOM_PRE_PLAY_B1_SEED_VA = 0x00802a49;
export const ROOM_PRE_PLAY_B1_REMAP_VA = 0x00802a53;
export const ROOM_PRE_PLAY_B1_PLAY_VA = 0x00802a82;
export const ROOM_PRE_PLAY_TAILMID_SEED_VA = 0x0080208d;
export const ROOM_PRE_PLAY_TAILMID_REMAP_VA = 0x00802095;
export const ROOM_PRE_PLAY_TAILMID_PLAY_VA = 0x008020c2;
export const ROOM_PRE_PLAY_800500_PLAY_VA = 0x00801c42;

/** Exact xorshift at 0x00956830; x86 takes the counts from CL, so mask to 5. */
export function roomPrePlayRngNext(seed, shift1, shift2, shift3) {
    let x = seed >>> 0;
    x = ((x >>> (shift1 & 31)) ^ x) >>> 0;
    x = (((x << (shift2 & 31)) >>> 0) ^ x) >>> 0;
    x = ((x >>> (shift3 & 31)) ^ x) >>> 0;
    return x;
}

/** Unsigned seed_out % 20 == 0 (the 0xcccccccd magic divide at 0x00956859). */
export function roomPrePlayRareHit(seedOut) {
  return (seedOut >>> 0) % ROOM_PRE_PLAY_RARE_MODULUS === 0 ? 1 : 0;
}

/**
 * What 0x00956780 leaves in the caller's local.
 * gameNull / entryFound summarise the host-side gate.
 */
export function roomPrePlayPlan(seedLiteral, gameNull, entryFound, seed, shift1, shift2, shift3) {
  const out = {};
    out.rngSeedOut = seed;
    out.rngAdvanced = 0;
    out.seedZeroFatal = 0;
    out.rareHit = 0;

    if (gameNull != 0) {
      out.hostLookupNeeded = 0;
      out.soundId = seedLiteral;
      out.idRewritten = 0;
      return out;
    }
    out.hostLookupNeeded = 1;
    if (entryFound == 0) {

      out.soundId = seedLiteral;
      out.idRewritten = 0;
      return out;
    }

    let id = (ROOM_PRE_PLAY_ID_GATED);
    out.seedZeroFatal = seed == 0 ? 1 : 0;
    let next =
        roomPrePlayRngNext(seed, shift1, shift2, shift3);

    out.rngSeedOut = next;
    out.rngAdvanced = 1;
    let rare = roomPrePlayRareHit(next);
    out.rareHit = rare;
    if (rare != 0) id = (ROOM_PRE_PLAY_ID_RARE);
    out.soundId = id;
    out.idRewritten = id != seedLiteral ? 1 : 0;
  return out;
}

export function roomPrePlaySoundId(seedLiteral, gameNull, entryFound, seed, shift1, shift2, shift3) {
  return roomPrePlayPlan(seedLiteral, gameNull, entryFound, seed, shift1, shift2, shift3).soundId;
}

/** The argument SFXManager::Play actually receives at 0x00802a82. */
export function roomB1SfxPlayId(gameNull, entryFound, seed, shift1, shift2, shift3) {
  return roomPrePlaySoundId(ROOM_B1_SFX_ID, gameNull, entryFound, seed, shift1, shift2, shift3);
}

/** The argument SFXManager::Play actually receives at 0x008020c2. */
export function roomTailmidSfxPlayId(gameNull, entryFound, seed, shift1, shift2, shift3) {
  return roomPrePlaySoundId(ROOM_TAILMID_SFX_ID, gameNull, entryFound, seed, shift1, shift2, shift3);
}

/** 1 when a 0x00956780 call stands between the seed store and the Play push. */
export function roomB1SfxIdIsRemapped() {
  return 1;
}
export function roomTailmidSfxIdIsRemapped() {
  return 1;
}
export function roomTailmid800500TimerSfxIdIsRemapped() {
  return 0;
}

/* ---- v44: FUN_00812f50 L-room clamp body, VA 0x00812f8a0x00813165 --------
 *
 */

export const ROOM_CLAMP_812F50_LROOM_BODY_VA = 0x00812f8a;
export const ROOM_CLAMP_812F50_LROOM_CALL_VA = 0x00812fa7;
export const ROOM_CLAMP_812F50_LROOM_SELECT_VA = 0x00813025;
export const ROOM_CLAMP_812F50_LROOM_SHAPE_REREAD_VA = 0x00813045;
export const ROOM_CLAMP_812F50_LROOM_ARM9_VA = 0x00813078;
export const ROOM_CLAMP_812F50_LROOM_ARMA_VA = 0x008130bc;
export const ROOM_CLAMP_812F50_LROOM_ARMB_VA = 0x008130fc;
export const ROOM_CLAMP_812F50_LROOM_ARMC_VA = 0x0081311a;
export const ROOM_CLAMP_812F50_LROOM_TAIL_VA = 0x00813155;
export const ROOM_CLAMP_812F50_LROOM_BUF_FLOATS = 7;
export const ROOM_CLAMP_812F50_LROOM_BUF_DEAD_INDEX = 1;

export const ROOM_CLAMP_812F50_LROOM_STORE_SIMPLE = 0;
export const ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y = 1;
export const ROOM_CLAMP_812F50_LROOM_STORE_LIMIT = 2;

/** buf is the seven-float LRoomAreaDesc capture; shapeAfter/room bounds are
 *  the post-call re-reads. Formulas written as plain f32 sums/differences —
 *  the PE's xorps-negate-then-add form is bit-identical for non-NaN inputs
 *  and canonicalized for NaN on both runtimes. */
export function roomClamp812f50Lroom(
  inX, inY, margin, f10, f14, f18, buf, shapeAfter,
  roomX0, roomY0, roomX1, roomY1,
) {
  const out = {};
    if (out == null || buf == null) return out;

    let lim9 = Math.fround(Math.fround(buf[0]) - roomNegssV44(margin));
    let lim10 = Math.fround(roomNegssV44(f14) + Math.fround(buf[2]));
    let lim11 = Math.fround(Math.fround(buf[4]) - roomNegssV44(margin));
    let lim12 = Math.fround(roomNegssV44(f14) + Math.fround(buf[6]));
    let sel_a = Math.fround(roomNegssV44(f18) + Math.fround(buf[3]));
    let sel_b = Math.fround(Math.fround(buf[5]) - roomNegssV44(f10));

    let took_b = (lim12 - lim11) > (lim10 - lim9) ? 1 : 0;
    let sel = took_b != 0 ? sel_b : sel_a;

    let x2 = roomMinssV42(
        roomMaxssV42(inX, margin + roomX0), roomX1 - f14);
    let y2 = roomMinssV42(
        roomMaxssV42(inY, f10 + roomY0), roomY1 - f18);
    out.xSimple = x2;
    out.ySimple = y2;
    out.sel = sel;
    out.selectTookB = took_b;
    let out_x = x2;
    let out_y = y2;
    let limit = Math.fround(0.0);
    let arm = 0;
    let store_path = ROOM_CLAMP_812F50_LROOM_STORE_SIMPLE;

    if (shapeAfter == 9) {
      arm = 9;
      limit = lim9;
      if (lim9 > x2 && sel > y2) {
        if (!((sel - y2) > (lim9 - x2))) {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
          out_y = sel;
        } else {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
          out_x = lim9;
        }
      }
    } else if (shapeAfter == 0xa) {
      arm = 0xa;
      limit = lim10;
      if (x2 > lim10 && sel > y2) {
        if (!((sel - y2) > (x2 - lim10))) {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
          out_y = sel;
        } else {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
          out_x = lim10;
        }
      }
    } else if (shapeAfter == 0xb) {
      arm = 0xb;
      limit = lim11;

      if (lim11 > x2 && y2 > sel) {
        if (!((y2 - sel) > (lim11 - x2))) {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
          out_y = sel;
        } else {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
          out_x = lim11;
        }
      }
    } else if (shapeAfter == 0xc) {
      arm = 0xc;
      limit = lim12;
      if (x2 > lim12 && y2 > sel) {
        if (!((y2 - sel) > (x2 - lim12))) {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
          out_y = sel;
        } else {
          store_path = ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
          out_x = lim12;
        }
      }
    }
    out.x = out_x;
    out.y = out_y;
    out.shapeArm = arm;
    out.storePath = store_path;
    out.limit = limit;
  return out;
}

/* ---- v45: FUN_00813520 clamp sites A/B post-clamp continuations -----------
 *
 * as divOk 0 with no store. */

export const ROOM_7230_SITE_A_CALL_VA = 0x0081370b;
export const ROOM_7230_SITE_A_IDENTITY_X_VA = 0x0081371a;
export const ROOM_7230_SITE_A_IDENTITY_Y_VA = 0x00813731;
export const ROOM_7230_SITE_A_INDEX_JS_VA = 0x008137a5;
export const ROOM_7230_SITE_A_COST_GATE_VA = 0x008137ab;
export const ROOM_7230_SITE_A_ENTITY_REJECT_VA = 0x0081387f;
export const ROOM_7230_EXIT_JG_VA = 0x008138bf;
export const ROOM_7230_SITE_B_CALL_VA = 0x008138f0;
export const ROOM_7230_SITE_B_IDIV_VA = 0x0081395b;
export const ROOM_7230_ENTITY_DIST_VA = 0x00baa87c;
export const ROOM_7230_ENTITY_DIST_BITS = 0x41a00000;
export const ROOM_7230_SITE_B_PAD_BITS = 0x41a00000;
export const ROOM_7230_DOOR_DIST2_VA = 0x00baac18;
export const ROOM_7230_DOOR_DIST2_BITS = 0x45992000;
export const ROOM_7230_ENTITY_COUNT_OFF = 0x1264;
export const ROOM_7230_ENTITY_VEC_OFF = 0x125c;

export const ROOM_7230_SITE_A_REJECT_IDENTITY = 0;
export const ROOM_7230_SITE_A_RANGE_FAIL = 1;
export const ROOM_7230_SITE_A_INDEX_NEGATIVE = 2;
export const ROOM_7230_SITE_A_NEED_COST = 3;

/** Ordered equality of both pairs; x first; NaN (unordered) rejects. */
export function room7230SiteAIdentityAccept(clampedX, candX, clampedY, candY) {
    if (!(clampedX == candX)) {
      return 0;
    }
    if (!(clampedY == candY)) {
      return 0;
    }
    return 1;
}

export function room7230SiteAProbe(clampedX, candX, clampedY, candY, width, height) {
  const out = {};
    let accept = room7230SiteAIdentityAccept(
        clampedX, candX, clampedY, candY);
    out.identityAccept = accept;
    out.gridX = 0;
    out.gridY = 0;
    out.index = 0;
    out.bestIndex = 0;
    if (accept == 0) {

      out.phase = ROOM_7230_SITE_A_REJECT_IDENTITY;
      return out;
    }
    const grid = room7230FinishGridIndex(clampedX, clampedY, width, height);
    out.gridX = grid.gridX;
    out.gridY = grid.gridY;
    out.index = grid.index;
    if (grid.valid == 0) {

      out.phase = ROOM_7230_SITE_A_RANGE_FAIL;
      out.bestIndex = -1;
      return out;
    }
    if (grid.index < 0) {

      out.phase = ROOM_7230_SITE_A_INDEX_NEGATIVE;
      out.bestIndex = grid.index;
      return out;
    }
    out.phase = ROOM_7230_SITE_A_NEED_COST;
    out.bestIndex = grid.index;
  return out;
}

/** cost gate is SIGNED `jge`; the new index is best on BOTH outcomes. */
export function room7230SiteACostApply(index, costAtIndex, threshold, width, entityCount) {
  const out = {};
    let pass = costAtIndex < threshold ? 1 : 0;
    out.pass = pass;
    out.bestIndex = index;
    out.snapped = 0;
    out.divOk = 1;
    out.snapX = Math.fround(0.0);
    out.snapY = Math.fround(0.0);
    out.entityWalkNeeded = 0;
    if (pass == 0) {

      return out;
    }
    const world = room7230FinishGridWorld(index, width);
    out.snapped = 1;
    out.divOk = world.divOk;
    out.snapX = world.x;
    out.snapY = world.y;

    out.entityWalkNeeded = entityCount != 0 ? 1 : 0;
  return out;
}

/** Accept paths exit with the stored counter; exhaustion decs 0 to -1. */
export function room7230ExitCounter(accepted, counterStored) {
  return (accepted | 0) !== 0 ? counterStored | 0 : -1;
}

/** `test eax,eax; jg skip` — signed; 0 and negatives take site B. */
export function room7230SiteBTaken(exitEax) {
  return (exitEax | 0) > 0 ? 0 : 1;
}

export function room7230SiteBSnap(clampedX, clampedY, width, height) {
  const out = {};
    const grid = room7230FinishGridIndex(clampedX, clampedY, width, height);
    out.gridX = grid.gridX;
    out.gridY = grid.gridY;
    out.xValid = grid.xValid;
    out.yValid = grid.yValid;
    out.valid = grid.valid;

    out.index = grid.index;
    const world = room7230FinishGridWorld(grid.index, width);
    out.divOk = world.divOk;
    out.quot = world.quot;
    out.rem = world.rem;
    out.x = world.x;
    out.y = world.y;
  return out;
}

/* ---------------------------------------------------------------------------
   v46 — FUN_00813520 spawn-search loop pure core (helpers ABI v46).
   ------------------------------------------------------------------------ */

export const ROOM_7230_SPAWN_LOOP_ITERS = 0x7d;         /* eax init @0x0081352e */
export const ROOM_7230_SPAWN_SEED_INIT = 0x441c1dfd;    /* [ebp-0x10] @0x0081355e */
export const ROOM_7230_SPAWN_BEST_ENTITY_BOUND = 0x1c0; /* cmp esi,0x1c0 @0x008135d6 */
export const ROOM_7230_SPAWN_COST_EXTRA = 0xbb8;        /* lea eax,[edi+0xbb8] */
export const ROOM_7230_SPAWN_REJECT_TYPE_11 = 0x11;
export const ROOM_7230_SPAWN_REJECT_TYPE_12 = 0x12;
export const ROOM_7230_SPAWN_REJECT_TYPE_14 = 0x14;
export const ROOM_7230_SPAWN_REJECT_TYPE_17 = 0x17;
export const ROOM_7230_SPAWN_GRID_COST_OFF = 0x76c;
export const ROOM_7230_SPAWN_GRID_ENTITY_OFF = 0x24;
export const ROOM_7230_SPAWN_DOOR_SLOT_OFF = 0x724;
export const ROOM_7230_SPAWN_DOOR_INDEX_OFF = 0x24;
export const ROOM_7230_SPAWN_DOOR_DIST2_BITS = 0x45992000; /* 4900.0f */
export const ROOM_7230_SPAWN_RECURSE_BUDGET = 0x14;
export const ROOM_7230_SPAWN_RECURSE_RADIUS_BITS = 0x42200000; /* 40.0f */
export const ROOM_7230_SPAWN_SITE_B_PAD_BITS = 0x41a00000;  /* 20.0f x3 + margin */
export const ROOM_7230_SPAWN_HOST_VA_LOOP_HEAD = 0x00813570;
export const ROOM_7230_SPAWN_HOST_VA_QUERY = 0x007f0800;   /* Room::GetGridCollision */
export const ROOM_7230_SPAWN_HOST_VA_SITE_A = 0x0081370b;
export const ROOM_7230_SPAWN_HOST_VA_SITE_B = 0x008138f0;
export const ROOM_7230_SPAWN_HOST_VA_SIN = 0x0041d520;     /* Y axis */
export const ROOM_7230_SPAWN_HOST_VA_COS = 0x0041d540;     /* X axis */
export const ROOM_7230_SPAWN_HOST_VA_DOOR_LOOP = 0x00813996;
export const ROOM_7230_SPAWN_HOST_VA_RECURSE = 0x00813a99;
export const ROOM_7230_SPAWN_HOST_VA_EXIT = 0x00813b29;
export const ROOM_7230_SPAWN_HOST_VA_ENTRY = 0x00813460;
export const ROOM_7230_SPAWN_HOST_VA_SITE_8054D7 = 0x008054d7;

/* Pre-accept verdict reasons (0x008135b2..0x00813612). */
export const ROOM_7230_SPAWN_PRE_NO_BEST = 0;        /* best < 0 → candidate */
export const ROOM_7230_SPAWN_PRE_COST_ARG5 = 1;      /* cost>=t && arg5==0 */
export const ROOM_7230_SPAWN_PRE_COST_GRID = 2;      /* cost>=t && gridcoll!=1 */
export const ROOM_7230_SPAWN_PRE_COST_EXTRA = 3;     /* cost>=t+0xbb8 */
export const ROOM_7230_SPAWN_PRE_ENTITY_ARG5 = 4;    /* gridcoll!=0 && arg5==0 */
export const ROOM_7230_SPAWN_PRE_ENTITY_GRID = 5;    /* gridcoll!=0 && !=1 */
export const ROOM_7230_SPAWN_PRE_TYPE_REJECT = 6;    /* type in {0x11,12,14,17} */
export const ROOM_7230_SPAWN_PRE_ACCEPT_NO_ENTITY = 7;
export const ROOM_7230_SPAWN_PRE_ACCEPT_TYPE_OK = 8;

function room7230SpawnPreEntity(best, gridcoll, entityPresent, entityType, arg5Byte) {
  return 0;
}

/** Top-of-loop verdict: 1 → exit with the stored counter; 0 → candidate.
    entityPresent is the host capture (only read when 0 <= best < 0x1c0). */
export function room7230SpawnPreAccept(bestIndex, costAtBest, gridcoll,
                                       entityPresent, entityType, arg5Byte,
                                       threshold) {
  const out = {};
    if (bestIndex < 0) {
      out.accept = 0;
      out.reason = ROOM_7230_SPAWN_PRE_NO_BEST;
      return out;
    }

    if (!(costAtBest < threshold)) {
    if (((arg5Byte) & 0xff) == 0) {
      out.accept = 0;
      out.reason = ROOM_7230_SPAWN_PRE_COST_ARG5;
      return out;
    }

    if (gridcoll != 1) {
      out.accept = 0;
      out.reason = ROOM_7230_SPAWN_PRE_COST_GRID;
      return out;
    }

    if (costAtBest >= threshold + ROOM_7230_SPAWN_COST_EXTRA) {
      out.accept = 0;
      out.reason = ROOM_7230_SPAWN_PRE_COST_EXTRA;
      return out;
    }
    }
    /* entity_check: */
    if (gridcoll != 0) {

      if (((arg5Byte) & 0xff) == 0) {
        out.accept = 0;
        out.reason = ROOM_7230_SPAWN_PRE_ENTITY_ARG5;
        return out;
      }

      if (gridcoll != 1) {
        out.accept = 0;
        out.reason = ROOM_7230_SPAWN_PRE_ENTITY_GRID;
        return out;
      }
    }

    let present =
        (bestIndex < ROOM_7230_SPAWN_BEST_ENTITY_BOUND &&
         entityPresent != 0)
            ? 1
            : 0;

    if (present == 0) {
      out.accept = 1;
      out.reason = ROOM_7230_SPAWN_PRE_ACCEPT_NO_ENTITY;
      return out;
    }

    let t = entityType;
    if (t == ROOM_7230_SPAWN_REJECT_TYPE_11 ||
        t == ROOM_7230_SPAWN_REJECT_TYPE_12 ||
        t == ROOM_7230_SPAWN_REJECT_TYPE_14 ||
        t == ROOM_7230_SPAWN_REJECT_TYPE_17) {
      out.accept = 0;
      out.reason = ROOM_7230_SPAWN_PRE_TYPE_REJECT;
      return out;
    }
    out.accept = 1;
    out.reason = ROOM_7230_SPAWN_PRE_ACCEPT_TYPE_OK;
  return out;
}

/** 0x00813618..0x00813701 candidate generation. cosValue is the 0x41d540
    result (X axis), sinValue the 0x41d520 result (Y axis) — the PE multiplies
    the X component by the first call's result and the Y by the second. */
export function room7230SpawnCandidate(seed, radiusIn, inX, inY, cosValue, sinValue) {
  const out = {};
    out.radius = room7230FinishRadius(radiusIn);

    out.seedFatal = room7230FinishSeedFatal(seed);
    let next =
        out.seedFatal != 0 ? 0 : room7230FinishRngNext(seed);
    out.seedOut = next;
    out.angle =
        out.seedFatal != 0 ? Math.fround(0.0) : room7230FinishAngle(next);

    out.candX = ((cosValue) *
                                     (out.radius)) +
                  (inX);
    out.candY = ((sinValue) *
                                     (out.radius)) +
                  (inY);
  return out;
}

/** SITE A 0x0081370b clamp wiring: in = candidate, margin 0, pads 0,0,0
    (xorps @0x008136d5, three zero stores @0x008136dd/ea/f5). */
export function room7230ClampSiteA(descPresent, dataPresent, inX, inY, buf,
                                   shapeAfter, roomX0, roomY0, roomX1, roomY1) {
  const out = {};
    let path =
        roomClamp812f50Path(descPresent, dataPresent, shapeAfter);
    out.lroomNeeded = (path == ROOM_CLAMP_812F50_PATH_LROOM) ? 1 : 0;
    if (path == ROOM_CLAMP_812F50_PATH_PASSTHROUGH) {

      out.clampedX = inX;
      out.clampedY = inY;
      return out;
    }

    const clamp = roomClamp812f50Lroom(inX, inY, Math.fround(0.0), Math.fround(0.0), Math.fround(0.0), Math.fround(0.0),
                                  buf, shapeAfter, roomX0, roomY0,
                                  roomX1, roomY1);
    out.clampedX = clamp.x;
    out.clampedY = clamp.y;
  return out;
}

/** SITE B 0x008138f0 clamp wiring: in = ORIGINAL centre arg, margin 20,
    pads 20,20,20 (xmm3=[0xbaa87c], three 0x41a00000 stores). */
export function room7230ClampSiteB(descPresent, dataPresent, inX, inY, buf,
                                   shapeAfter, roomX0, roomY0, roomX1, roomY1) {
  const out = {};
    let path =
        roomClamp812f50Path(descPresent, dataPresent, shapeAfter);
    out.lroomNeeded = (path == ROOM_CLAMP_812F50_PATH_LROOM) ? 1 : 0;
    if (path == ROOM_CLAMP_812F50_PATH_PASSTHROUGH) {
      out.clampedX = inX;
      out.clampedY = inY;
      return out;
    }

    let pad = roomPeF32BitsV41(ROOM_7230_SPAWN_SITE_B_PAD_BITS);
    const clamp = roomClamp812f50Lroom(inX, inY, pad, pad, pad, pad, buf,
                                  shapeAfter, roomX0, roomY0, roomX1, roomY1);
    out.clampedX = clamp.x;
    out.clampedY = clamp.y;
  return out;
}

/** Door-slot proximity gate 0x008139b4..0x00813a14 (pure per-slot). The
    idiv world pos feeds the diffs CROSSWISE: dx = world_y - out_y,
    dy = world_x - out_x (PE xmm0 holds the quot*40+120 term, xmm1 the
    rem*40+40 term). 4900.0 comiss+ja: only an ordered STRICT limit > dist2
    recurses; NaN and equality do not. */
export function room7230DoorProximityGate(outX, outY, doorIndex, width) {
  const out = {};
    const world = room7230FinishGridWorld(doorIndex, width);
    out.doorX = world.x;
    out.doorY = world.y;
    out.quot = world.quot;
    out.rem = world.rem;
    out.divOk = world.divOk;
    let dx = Math.fround(Math.fround(world.y) - Math.fround(outY));
    let dy = Math.fround(Math.fround(world.x) - Math.fround(outX));
    out.dist2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));

    let limit = roomPeF32BitsV41(ROOM_7230_SPAWN_DOOR_DIST2_BITS);
    out.recurseNeeded = out.dist2 < limit ? 1 : 0;
  return out;
}

/** One iteration of the 0x00813570 search loop — the pure core. Host
    captures between steps: gridcoll (GetGridCollision result for best),
    of the previous candidate/snap stay host. */
export function room7230SpawnStep(
  counter, bestIndex, costAtBest, gridcoll, entityPresent, entityType,
  arg5Byte, seed, radiusIn, inX, inY,
  descPresent, dataPresent, shapeAfter, buf,
  cosValue, sinValue, width, height,
  roomX0, roomY0, roomX1, roomY1, costAtIndex, entityCount,
) {
  const out = {};
    let threshold = room7230FinishThreshold(counter);
    let continue_loop = room7230FinishLoopContinue(counter);
    out.continueLoop = continue_loop;
    out.counterNext = (
        (counter) - 1) | 0;
    out.threshold = threshold;
    const pre = room7230SpawnPreAccept(bestIndex, costAtBest, gridcoll,
                                     entityPresent,
                                     entityType, arg5Byte, threshold);
    out.accept = pre.accept;
    out.preReason = pre.reason;
    out.probePhase = ROOM_7230_SITE_A_REJECT_IDENTITY;
    out.identityAccept = 0;
    out.bestIndex = bestIndex;
    out.costPass = 0;
    out.snapped = 0;
    out.divOk = 1;
    out.snapX = Math.fround(0.0);
    out.snapY = Math.fround(0.0);
    out.walkNeeded = 0;
    if (pre.accept != 0) {

      out.exitCounter = counter;
      out.siteBTaken = counter <= 0 ? 1 : 0;
      out.radius = Math.fround(0.0);
      out.seedOut = 0;
      out.angle = Math.fround(0.0);
      out.candX = Math.fround(0.0);
      out.candY = Math.fround(0.0);
      out.clampLroomNeeded = 0;
      out.clampedX = Math.fround(0.0);
      out.clampedY = Math.fround(0.0);
      return out;
    }

    const cand = room7230SpawnCandidate(seed, radiusIn, inX, inY, cosValue,
                                    sinValue);
    out.radius = cand.radius;
    out.seedOut = cand.seedOut;
    out.angle = cand.angle;
    out.candX = cand.candX;
    out.candY = cand.candY;
    const clamp = room7230ClampSiteA(descPresent, dataPresent, cand.candX,
                                 cand.candY, buf, shapeAfter, roomX0,
                                 roomY0, roomX1, roomY1);
    out.clampLroomNeeded = clamp.lroomNeeded;
    out.clampedX = clamp.clampedX;
    out.clampedY = clamp.clampedY;

    const probe = room7230SiteAProbe(clamp.clampedX, cand.candX, clamp.clampedY,
                                 cand.candY, width, height);
    out.identityAccept = probe.identityAccept;
    out.probePhase = probe.phase;
    if (probe.identityAccept != 0) {
      if (probe.phase == ROOM_7230_SITE_A_RANGE_FAIL) {

        out.bestIndex = -1;
      } else if (probe.phase == ROOM_7230_SITE_A_INDEX_NEGATIVE) {

        out.bestIndex = probe.bestIndex;
      } else {
        out.bestIndex = probe.bestIndex;
        const cost = room7230SiteACostApply(probe.index, costAtIndex, threshold,
                                          width, entityCount);
        out.costPass = cost.pass;
        out.snapped = cost.snapped;
        out.divOk = cost.divOk;
        out.snapX = cost.snapX;
        out.snapY = cost.snapY;
        out.walkNeeded = cost.entityWalkNeeded;
      }
    }

    if (continue_loop != 0) {
      out.exitCounter = 0;
      out.siteBTaken = 0;
    } else {
      out.exitCounter = -1;
      out.siteBTaken = 1;
    }
  return out;
}

/* ------------------------------------------------------------------ v47 - */
/* FUN_00813460 spawn-position: complete pure core + typed continuations.
   Mirrors the header's IsaacRoom7230SpawnPositionPlan / search continuation.
   The LRoomAreaDesc 0x0081f8b0 blob consumed by CLAMP_A is captured from the
   Render-shell family (isaac_render_shell_81f8b0_* helpers ABI 30) — never
   re-translated here. */

export const ROOM_7230_SPAWN_SEARCH_ITERS = 0x7d;
export const ROOM_7230_SPAWN_SEARCH_SEED = 0x441c1dfd;
export const ROOM_7230_SPAWN_FIRST_COUNTER = 0x7c;
export const ROOM_7230_SPAWN_BEST_INDEX_INIT = -1;
export const ROOM_7230_SPAWN_HANDOFF_ARG6 = 0;

export const ROOM_7230_SPAWN_SEARCH_DONE = 0;
export const ROOM_7230_SPAWN_SEARCH_GRID = 1;
export const ROOM_7230_SPAWN_SEARCH_BEST_COST = 2;
export const ROOM_7230_SPAWN_SEARCH_BEST_ENTITY = 3;
export const ROOM_7230_SPAWN_SEARCH_SIN_COS = 4;
export const ROOM_7230_SPAWN_SEARCH_CLAMP_A = 5;
export const ROOM_7230_SPAWN_SEARCH_PROBE_COST = 6;
export const ROOM_7230_SPAWN_SEARCH_WALK = 7;
export const ROOM_7230_SPAWN_SEARCH_LOOP = 8; /* pure continuation */
export const ROOM_7230_SPAWN_SEARCH_EXIT = 9; /* pure continuation */
export const ROOM_7230_SPAWN_SEARCH_SITE_B = 10;
export const ROOM_7230_SPAWN_SEARCH_DOOR = 11;
export const ROOM_7230_SPAWN_SEARCH_RECURSE = 12;

export const ROOM_7230_SPAWN_SEARCH_VA_GRID = 0x007f0800;
export const ROOM_7230_SPAWN_SEARCH_VA_HEAD = 0x00813520;
export const ROOM_7230_SPAWN_SEARCH_VA_PRE = 0x00813561;
export const ROOM_7230_SPAWN_SEARCH_VA_PRE_END = 0x008135f0;
export const ROOM_7230_SPAWN_SEARCH_VA_BEST_COST_SITE = 0x008135b6;
export const ROOM_7230_SPAWN_SEARCH_VA_BEST_ENTITY_SITE = 0x008135d6;
export const ROOM_7230_SPAWN_SEARCH_VA_COS = 0x0041d540;
export const ROOM_7230_SPAWN_SEARCH_VA_SIN = 0x0041d520;
export const ROOM_7230_SPAWN_SEARCH_VA_CLAMP_A = 0x0081370b;
export const ROOM_7230_SPAWN_SEARCH_VA_LROOM = 0x0081f8b0;
export const ROOM_7230_SPAWN_SEARCH_VA_PROBE_COST_SITE = 0x008137ab;
export const ROOM_7230_SPAWN_SEARCH_VA_WALK_SITE = 0x008137ec;
export const ROOM_7230_SPAWN_SEARCH_VA_SITE_B = 0x008138f0;
export const ROOM_7230_SPAWN_SEARCH_VA_DOOR = 0x00813996;
export const ROOM_7230_SPAWN_SEARCH_VA_RECURSE = 0x00813a99;

/**
 * One 0x00813460 call as a typed continuation: pure MT draw + the v44 pos
 */
export function room7230SpawnPositionPlan(
  mtState,
  index,
  modeFlag,
  roomF14,
  roomF18,
  roomF1c,
  roomF20,
  handoffArg4,
  handoffArg5,
) {
  const out = {};
    const mt = room7230SpawnPosMt(mtState, index, modeFlag, roomF14, roomF18,
                                 roomF1c, roomF20);
    out.drawPure = mt.genrandPure;

    out.crtOverride = (modeFlag & 0xff) != 0 ? 1 : 0;
    out.ringHostNeeded = 1;
    out.genrand = mt.genrand;
    out.indexIn = mt.indexIn;
    out.indexOut = mt.indexOut;
    out.spanX = mt.spanX;
    out.spanY = mt.spanY;
    out.unit = mt.unit;
    out.centerX = mt.centerX;
    out.centerY = mt.centerY;
    out.maxSpan = mt.maxSpan;
    out.radiusArg = mt.radiusArg;
    out.handoffRadius = mt.radiusArg;
    out.handoffArg4 = handoffArg4;
    out.handoffArg5 = handoffArg5;
    out.handoffArg6 = ROOM_7230_SPAWN_HANDOFF_ARG6;
    out.hostFinish = 1;
    out.iterations = ROOM_7230_SPAWN_SEARCH_ITERS;
    out.searchSeed = ROOM_7230_SPAWN_SEARCH_SEED;
    out.firstCounter = ROOM_7230_SPAWN_FIRST_COUNTER;
    out.firstThreshold = room7230FinishThreshold(
        ROOM_7230_SPAWN_FIRST_COUNTER);
  return out;
}

/** VA table of the search continuation (JS mirror of the C export). */
export function room7230SpawnSearchVas() {
  const out = {};
    out.grid = 0x007f0800;
    out.bestCostSite = 0x008135b6;
    out.bestEntitySite = 0x008135d6;
    out.cos = 0x0041d540;
    out.sin = 0x0041d520;
    out.clampSiteA = 0x0081370b;
    out.lroom = 0x0081f8b0;
    out.probeCostSite = 0x008137ab;
    out.walkSite = 0x008137ec;
    out.siteBSite = 0x008138f0;
    out.doorSite = 0x00813996;
    out.recurseSite = 0x00813a99;
  return out;
}

/**
 * Pure transition law of the 813520 search continuation (v47). Mirrors
 * isaac_room_7230_spawn_search_next. arg6 is a byte gate (masked here).
 */
export function room7230SpawnSearchNext(
  kind,
  bestIndex,
  accept,
  identityAccept,
  probePhase,
  costPass,
  entityCount,
  loopContinue,
  exitLe0,
  arg6Byte,
) {
    switch (kind) {
      case ROOM_7230_SPAWN_SEARCH_GRID:
        return bestIndex < 0 ? ROOM_7230_SPAWN_SEARCH_SIN_COS
                              : ROOM_7230_SPAWN_SEARCH_BEST_COST;
      case ROOM_7230_SPAWN_SEARCH_BEST_COST:
        return ROOM_7230_SPAWN_SEARCH_BEST_ENTITY;
      case ROOM_7230_SPAWN_SEARCH_BEST_ENTITY:
        return accept != 0 ? ROOM_7230_SPAWN_SEARCH_EXIT
                           : ROOM_7230_SPAWN_SEARCH_SIN_COS;
      case ROOM_7230_SPAWN_SEARCH_SIN_COS:
        return ROOM_7230_SPAWN_SEARCH_CLAMP_A;
      case ROOM_7230_SPAWN_SEARCH_CLAMP_A:
        if (identityAccept == 0) return ROOM_7230_SPAWN_SEARCH_LOOP;
        if (probePhase != ROOM_7230_SITE_A_NEED_COST) {
          return ROOM_7230_SPAWN_SEARCH_LOOP;
        }
        return ROOM_7230_SPAWN_SEARCH_PROBE_COST;
      case ROOM_7230_SPAWN_SEARCH_PROBE_COST:
        return (costPass != 0 && entityCount > 0)
                   ? ROOM_7230_SPAWN_SEARCH_WALK
                   : ROOM_7230_SPAWN_SEARCH_LOOP;
      case ROOM_7230_SPAWN_SEARCH_WALK:
        return ROOM_7230_SPAWN_SEARCH_LOOP;
      case ROOM_7230_SPAWN_SEARCH_LOOP:
        return loopContinue != 0 ? ROOM_7230_SPAWN_SEARCH_GRID
                                  : ROOM_7230_SPAWN_SEARCH_EXIT;
      case ROOM_7230_SPAWN_SEARCH_EXIT:
        return exitLe0 != 0 ? ROOM_7230_SPAWN_SEARCH_SITE_B
                             : ROOM_7230_SPAWN_SEARCH_DONE;
      case ROOM_7230_SPAWN_SEARCH_SITE_B:

        return (arg6Byte & 0xff) != 0 ? ROOM_7230_SPAWN_SEARCH_DOOR
                                         : ROOM_7230_SPAWN_SEARCH_DONE;
      case ROOM_7230_SPAWN_SEARCH_DOOR:
        return ROOM_7230_SPAWN_SEARCH_RECURSE;
      case ROOM_7230_SPAWN_SEARCH_RECURSE:
      case ROOM_7230_SPAWN_SEARCH_DONE:
      default:
        return ROOM_7230_SPAWN_SEARCH_DONE;
    }
}

/** One 0x00813570 loop-head (GRID) step of the 813520 search as a typed
    continuation (v48). The per-iteration pure law at the GetGridCollision
    (0x00813650 unreachable), so seedOut is the unchanged seed. */
export function room7230SpawnSearchIteration(
  counter, bestIndex, seed, gridcoll, costAtBest, entityPresent, entityType,
  arg5Byte) {
  const out = {};
    out.threshold = room7230FinishThreshold(counter);

    out.costReadNeeded = bestIndex >= 0 ? 1 : 0;

    out.entityReadNeeded =
        (bestIndex >= 0 && bestIndex < ROOM_7230_SPAWN_BEST_ENTITY_BOUND)
            ? 1
            : 0;

    let arg5_al = (arg5Byte & 0xff);
    const pre = room7230SpawnPreAccept(bestIndex, costAtBest, gridcoll,
                                     entityPresent,
                                     entityType, arg5_al,
                                     out.threshold);
    out.accept = pre.accept;
    out.reason = pre.reason;

    out.loopContinue = room7230FinishLoopContinue(counter);

    out.counterNext = ((counter) - 1) | 0;

    out.seedFatal = room7230FinishSeedFatal(seed);
    if (pre.accept != 0) {
      out.seedOut = seed;
    } else {
      out.seedOut = out.seedFatal != 0
                          ? 0
                          : room7230FinishRngNext(seed);
    }

    out.nextBest = bestIndex;
  return out;
}

/** FUN_00813520 function-head init 0x00813520..0x00813570. Wrapper
    FUN_00813460 always enters this state (call @0x00813506). */
export function room7230SpawnSearchHead() {
  const out = {};
  out.bestIndex = ROOM_7230_SPAWN_BEST_INDEX_INIT;
  out.seed = ROOM_7230_SPAWN_SEARCH_SEED >>> 0;
  out.iterations = ROOM_7230_SPAWN_SEARCH_ITERS;
  out.firstCounter = ROOM_7230_SPAWN_FIRST_COUNTER;
  out.firstThreshold = room7230FinishThreshold(out.firstCounter);
  out.shiftA = ROOM_7230_FINISH_SHIFT_A;
  out.shiftB = ROOM_7230_FINISH_SHIFT_B;
  out.shiftC = ROOM_7230_FINISH_SHIFT_C;
  out.shiftTableVa = ROOM_7230_FINISH_SHIFT_TABLE_VA;
  out.posVecPtr = ROOM_7230_SPAWN_POS_VEC_PTR;
  out.firstKind = ROOM_7230_SPAWN_SEARCH_GRID;
  out.afterGridKind = room7230SpawnSearchNext(
      ROOM_7230_SPAWN_SEARCH_GRID, out.bestIndex, 0, 0, 0, 0, 0, 1, 0, 0);
  out.costReadNeeded = out.bestIndex >= 0 ? 1 : 0;
  out.entityReadNeeded =
      (out.bestIndex >= 0 && out.bestIndex < ROOM_7230_SPAWN_BEST_ENTITY_BOUND)
          ? 1
          : 0;
  out.gridHostNeeded = 1;
  out.loopContinue = room7230FinishLoopContinue(out.firstCounter);
  return out;
}

/** 0x00813561..0x008135f0 at function entry: GRID + pre-accept with
    esi=-1. Host captures cannot accept; always PRE_NO_BEST. Not clamp. */
export function room7230SpawnSearchHeadPre(
    gridcoll, costAtBest, entityPresent, entityType, arg5Byte) {
  return room7230SpawnSearchIteration(
      ROOM_7230_SPAWN_FIRST_COUNTER,
      ROOM_7230_SPAWN_BEST_INDEX_INIT,
      ROOM_7230_SPAWN_SEARCH_SEED >>> 0,
      gridcoll, costAtBest, entityPresent, entityType, arg5Byte);
}

/* ------------------------------------------------------------------ v49 - */
/* FUN_00813520 entity-proximity walk (0x008137ec..0x00813888), pure
   per-entity decisions (helpers ABI v49). Mirrors isaac_room_7230_walk_*:
   snapped cell centre from the site-a idiv. */

/* Type ladder: {5,4,6} always; else arg4 low byte must be nonzero and
   (mode>=2 && type==1) || (uint32)(type-10) <= 0x3dd || type==1. */
export function room7230WalkTypeEligible(entityType, arg4Byte, mode26614) {
    if (entityType == 5 || entityType == 4 || entityType == 6) return 1;

    if ((arg4Byte & 0xff) == 0) return 0;

    if (mode26614 >= 2 && entityType == 1) return 1;

    if (((entityType - 10) >>> 0) <= 0x3dd) return 1;

    if (entityType == 1) return 1;
    return 0;
}

/* f32 chain: dx = ent.x - cell.x; dy = ent.y - cell.y; dist2 = dx*dx+dy*dy;
   dist = sqrt(dist2) (CRT law, f32); reject iff 20.0f > dist ordered
   strictly-above (NaN never rejects). */
export function room7230WalkProximity(cellX, cellY, entX, entY) {
  const out = {};
    let dx = Math.fround(entX - cellX);
    let dy = Math.fround(entY - cellY);
    let dist2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));
    out.dx = dx;
    out.dy = dy;
    out.dist2 = dist2;

    const s = room7230FinishSqrt(dist2);
    out.sqrtHostNeeded = s.crtHostNeeded;
    out.dist = s.crtHostNeeded != 0 ? Math.fround(0.0) : s.value;

    out.reject = (s.crtHostNeeded == 0 && Math.fround(20.0) > s.value) ? 1 : 0;
  return out;
}

export function room7230WalkEntityReject(
  entityType, arg4Byte, mode26614, cellX, cellY, entX, entY) {
    if (room7230WalkTypeEligible(entityType, arg4Byte,
                                           mode26614) == 0) {
      return 0;
    }
    const p = room7230WalkProximity(cellX, cellY, entX, entY);
    return p.reject;
}

export function room7230WalkRejectLatch(anyReject, entityReject) {
  return anyReject !== 0 || entityReject !== 0 ? 1 : 0;
}

export function room7230WalkBestIndex(bestIndex, anyReject) {
  return anyReject !== 0 ? -1 : bestIndex | 0;
}

/* ------------------------------------------------------------------ v50 - */
/* FUN_00813520 door-proximity block (0x00813996..0x00813b1b) + walk list CF
   (0x008137ec..0x00813888) as typed continuations. Mirrors
   door loop never runs (arg6 byte gate). */

export const ROOM_7230_DOOR_PLAN_NONE = 0;
export const ROOM_7230_DOOR_PLAN_RECURSE = 1;
export const ROOM_7230_DOOR_PLAN_MONOLITHIC = 2;
export const ROOM_7230_DOOR_SLOT_COUNT = 8;

/* Nested-call immediates @0x00813a81..0x00813a99. */
export const ROOM_7230_DOOR_RECURSE_ARG4 = 0;
export const ROOM_7230_DOOR_RECURSE_ARG5 = 0;
export const ROOM_7230_DOOR_RECURSE_ARG6 = 0;
export const ROOM_7230_DOOR_RECURSE_BUDGET = 0x14;            /* mov ebx,0x14 @0x00813a3c */
export const ROOM_7230_DOOR_RECURSE_CALL_VA = 0x00813a99;     /* nested FUN_00813520 */
export const ROOM_7230_DOOR_RECURSE_RESULT_COPY_VA = 0x00813ab5;
export const ROOM_7230_DOOR_RECURSE_RESULT_COPY_END_VA = 0x00813ac5;
export const ROOM_7230_DOOR_RECURSE_RADIUS_BITS = 0x42200000; /* 40.0f */
export const ROOM_7230_DOOR_DIST2_LIMIT_BITS = 0x45992000;    /* 4900.0f */

/** 0x008139b4 test eax,eax; je continue: 1 iff the slot pointer is non-null. */
export function room7230DoorSlotPresent(slotPtr) {
  return (slotPtr >>> 0) !== 0 ? 1 : 0;
}

/** 0x00813a16 inc edi — signed int32 wrap. */
export function room7230DoorLoopNext(index) {
  return ((index | 0) + 1) | 0;
}

/** 0x00813a17 cmp edi,8; 0x00813a1a jl — SIGNED: continue iff next < 8. */
export function room7230DoorLoopContinue(nextIndex) {
  return (nextIndex | 0) < 8 ? 1 : 0;
}

/** 0x00813a6d comiss xmm2,dist2; jbe exit: enter iff 4900.0 > dist2 ordered
    strict; NaN and equality do NOT enter the recursion body. */
export function room7230DoorRecurseEnter(enterDist2) {
    let limit =
        roomPeF32BitsV41(ROOM_7230_DOOR_DIST2_LIMIT_BITS);
    return enterDist2 < limit ? 1 : 0;
}

/** 0x00813b18 comiss xmm1,post_dist2; ja loop: retry iff 4900.0 > post_dist2
    ordered strict; NaN and equality end the recursion loop. */
export function room7230DoorRecurseRetry(postDist2) {
    let limit =
        roomPeF32BitsV41(ROOM_7230_DOOR_DIST2_LIMIT_BITS);
    return limit > postDist2 ? 1 : 0;
}

/** Whole-block plan (0x00813996..0x00813b1b): arg6 low byte 0 -> NONE; else
    scan slots 0..7 (signed jl), FIRST present slot decides: idiv fault
    (width 0 or INT_MIN/-1) -> MONOLITHIC; dist2 < 4900 (door proximity gate
    law) -> RECURSE with that index; no match -> NONE. slots is an array of
    {present, doorIndex}. */
export function room7230DoorBlockPlan(arg6Byte, outX, outY, width, slots) {
  const out = {};
    if (out == null || slots == null) return out;
    out.kind = ROOM_7230_DOOR_PLAN_NONE;
    out.slotIndex = -1;

    if ((arg6Byte & 0xff) == 0) return out;

    for (let i = 0; i < ROOM_7230_DOOR_SLOT_COUNT; ++i) {
      const slot = slots[i];
      if (slot == null || slot.present == 0) continue;
      const gate = room7230DoorProximityGate(outX, outY, slot.doorIndex,
                                          width);
      if (gate.divOk == 0) {

        out.kind = ROOM_7230_DOOR_PLAN_MONOLITHIC;
        out.slotIndex = i;
        return out;
      }
      if (gate.recurseNeeded != 0) {
        out.kind = ROOM_7230_DOOR_PLAN_RECURSE;
        out.slotIndex = i;
        return out;
      }
    }
  return out;
}

/** Walk list CF (0x008137ec..0x00813888): enter iff count != 0; step =
    count-1 (u32 wrap, sub ebx,1); continue iff next != 0 (jne). */
export function room7230WalkListEnter(entityCount1264) {
  return (entityCount1264 >>> 0) !== 0 ? 1 : 0;
}

export function room7230WalkListStep(remaining) {
  return ((remaining >>> 0) - 1) | 0;
}

export function room7230WalkListContinue(nextRemaining) {
  return (nextRemaining >>> 0) !== 0 ? 1 : 0;
}

/** Walk slot advance 0x00813882 add edi,4 (u32 wrap). The walk span
    0x008137ec..0x00813888 contains ZERO next-pointer loads — the list at
    Room+0x125c is a FLAT entity-pointer array (stride 4, count at
    Room+0x1264), not a linked list. */
export function room7230WalkNodeNext(nodeAddr) {
  return (((nodeAddr >>> 0) + 4) >>> 0) | 0;
}

/** Walk spin continuation 0x00813882..0x00813888: one body-iteration
    advance — node+4 (u32 wrap), remaining-1 (u32 wrap), continue iff the
    decremented count != 0 (jne). */
export function room7230WalkListNext(nodeAddr, remaining) {
  const out = {};
  out.nodeAddr = room7230WalkNodeNext(nodeAddr) >>> 0;
  out.remaining = ((remaining >>> 0) - 1) >>> 0;
  out.loopContinue = out.remaining !== 0 ? 1 : 0;
  return out;
}

/** Exit-store select law 0x008138b4/b8 + 0x0081397b/7f: the snapped cell
    centre is stored to out first; when site B runs (site_b_taken, v46) the
    site-B snap result overwrites it. */
export function room7230SpawnExitPosition(siteBTaken, cellX, cellY,
                                          siteBX, siteBY) {
  return {
    x: siteBTaken != 0 ? siteBX : cellX,
    y: siteBTaken != 0 ? siteBY : cellY,
  };
}

/* ------------------------------------------------------------------ v53 - */
/* FUN_00813520 recursion body (0x00813a27..0x00813b29): the door-proximity
   gate that selected the slot jumps here (ja @0x00813a14) and re-enters the
   WHOLE function at 0x00813a99 (host). Pure laws: slot js guard, entry dist2
   gate (door_recurse_enter), budget head (finish_recurse_step), nested-call
   arg pack, post-call result copy @0x00813ab5..0x00813ac5, retry gate
   (door_recurse_retry). */

/** 0x00813ab5..0x00813ac5: the nested call's result is copied into out
    unconditionally (both floats, no select). */
export function room7230DoorRecurseResult(resultX, resultY) {
  return { x: Math.fround(resultX), y: Math.fround(resultY) };
}

/** Recursion-body plan: takes the host-captured slot index, budget, door
    cell and the nested-call result; computes entry gate, budget step, arg
    pack pins, post-call copy, retry gate and loop continue. */
export function room7230DoorRecursePlan(
    slotIndex, budget, doorIndex, width, outX, outY, resultX, resultY) {
  const out = {};
  /* 0x00813a27 test edi,edi; js — signed slot guard. */
  const slotOk = (slotIndex | 0) >= 0 ? 1 : 0;
  /* 0x00813a41..0x00813a69 world pos + crosswise dist2; 0x00813a6d comiss+
     jbe — the v50 gate law. */
  const gate = room7230DoorProximityGate(
      Math.fround(outX), Math.fround(outY), doorIndex | 0, width | 0);
  out.divOk = gate.divOk;
  out.enterDist2 = gate.dist2;
  out.enter = (slotOk !== 0 && gate.divOk !== 0 &&
               gate.recurseNeeded !== 0) ? 1 : 0;
  /* 0x00813a76..0x00813a7b budget head (v42 law). */
  const step = room7230FinishRecurseStep(budget | 0);
  out.budgetIn = step.budgetIn;
  out.budgetOut = step.budgetOut;
  out.budgetEnter = step.enter;
  /* 0x00813a81..0x00813a96 nested-call pack; 0x00813a99 call = host. */
  out.nestedHostNeeded = 1;
  out.callVa = ROOM_7230_DOOR_RECURSE_CALL_VA;
  out.radiusBits = ROOM_7230_DOOR_RECURSE_RADIUS_BITS >>> 0;
  out.arg4 = ROOM_7230_DOOR_RECURSE_ARG4;
  out.arg5 = ROOM_7230_DOOR_RECURSE_ARG5;
  out.arg6 = ROOM_7230_DOOR_RECURSE_ARG6;
  /* 0x00813ab5..0x00813ac5 post-call copy. */
  const r = room7230DoorRecurseResult(resultX, resultY);
  out.copyX = r.x;
  out.copyY = r.y;
  /* 0x00813aca..0x00813b10 retry recompute (same gate vs the result);
     0x00813b18 comiss+ja — the v50 door_recurse_retry law. */
  const post = room7230DoorProximityGate(
      r.x, r.y, doorIndex | 0, width | 0);
  out.postDist2 = post.dist2;
  out.retry = (post.divOk !== 0 &&
               room7230DoorRecurseRetry(post.dist2) !== 0) ? 1 : 0;
  /* Retry jumps to the budget head re-testing the DECREMENTED budget. */
  out.loopContinue = (out.retry !== 0 && out.budgetOut > 0) ? 1 : 0;
  return out;
}

/* ===================== v56: 0x007ef420 B15 rain bind pure laws =============
   The rain per-entity attach/config-loader (site 0x00802dd5, the last host
   call inside the B15 rain tail). FULL body stays host (8 calls incl.
   position re-derive 0x81e9d0/0x813520, ANM2::Reset 0x407f10, attach
   0x4d74a0/0x6e2570/0x6e21f0/0x6e1a80/0x6e17c0, SetAlternatePedestal tail);
   these pure scalar laws cover the type-5 path decisions + stores.
   PE 0x007ef420..0x007ef697 (ret 8); constants verified via the section
   table (.data): scaleX/scaleY @ 0xc3793c/0xc37940 both 1.0f; the pos-vec
   0xc7b640/0xc7b644 is a runtime-writable .data-tail global. */
export const ROOM_B15_BIND_VA = 0x007ef420;
export const ROOM_B15_BIND_RET_VA = 0x007ef697;
export const ROOM_B15_BIND_TYPE5_HEAD = 0x007ef4e5;
export const ROOM_B15_BIND_POS_VEC_VA = 0x00c7b640;
export const ROOM_B15_BIND_SCALE_X_VA = 0x00c3793c;
export const ROOM_B15_BIND_SCALE_Y_VA = 0x00c37940;
export const ROOM_B15_BIND_SCALE_X_BITS = 0x3f800000;
export const ROOM_B15_BIND_SCALE_Y_BITS = 0x3f800000;
export const ROOM_B15_BIND_CLAMP_MIN = -2;
export const ROOM_B15_BIND_CLAMP_MAX = 7;
export const ROOM_B15_BIND_ENTRY_0x64_STRIDE = 4;
export const ROOM_B15_BIND_ENTRY_0x64_COUNT = 8;
export const ROOM_B15_BIND_SUB_COUNT_OFF = 0x5c0;
export const ROOM_B15_BIND_SUB_LIST_OFF = 0x5a0;
export const ROOM_B15_BIND_SUB_MAX = 8;
export const ROOM_B15_BIND_TAIL_FLAG_OFF = 0x168;
export const ROOM_B15_BIND_TAIL_FLAG_BIT = 0x40000;
/* v58: type-5 bind store-pack relayout (PE 0x7ef4a2..0x7ef5d5). Common
   stores (all types) + type-5 stores + gates + host call site VAs. */
export const ROOM_B15_BIND_STORE_PACK_VA = 0x007ef4a2;
export const ROOM_B15_BIND_STORE_TYPE5_HEAD_VA = 0x007ef4e5;
export const ROOM_B15_BIND_STORE_SUB_LIST_VA = 0x007ef5d5;
export const ROOM_B15_BIND_STORE_QWORD_CONST_VA = 0x00b1f630;
export const ROOM_B15_BIND_STORE_DWORD_CONST_VA = 0x00b1f638;
export const ROOM_B15_BIND_STORE_QWORD_LO = 0x4;
export const ROOM_B15_BIND_STORE_QWORD_HI = 0x3;
export const ROOM_B15_BIND_STORE_DWORD_CONST = 0x11;
export const ROOM_B15_BIND_STORE_HOST_A_VA = 0x006e2570;
export const ROOM_B15_BIND_STORE_HOST_B_VA = 0x006e21f0;
export const ROOM_B15_BIND_STORE_HOST_C_VA = 0x006e1a80;
export const ROOM_B15_BIND_STORE_TYPE5 = 5;
/* v59: type-6 dispatch tail (PE 0x7ef69a..0x7ef6c7, ret 8) + the 0x6c-stride
   ANM2 chain (PE 0x7ef611..0x7ef62f -> shared epilogue @0x7ef630; the
   epilogue's pure gate 0x7ef63c..0x7ef687 + 0x168/0x7764 values are the v56
   tail-gate law). Pure: chain stride add-ebx,0x6c (u32 wrap), the FULL-dword
   cmp [ebx],0 / je conditional-skip, and type-6's unconditional
   [edi+0x420]=[ebx+0xc] + the [edi+0x2c]==0xa gated [edi+0x424]=[ebx+0x10]
   (the cmp ZF survives the intervening mov/mov — NOT a shared gate). Host
   calls stay host: chain A 0x4d74a0 (this off 0x5c8, arg post-add ebx),
   chain B ANM2::Reset 0x407f10 (this off 0x5d0), type-6 D 0x665500 (arg
   [ebx+0x30], this edi). */
export const ROOM_B15_BIND_CHAIN_VA = 0x007ef611;
export const ROOM_B15_BIND_CHAIN_EPILOGUE_VA = 0x007ef630;
export const ROOM_B15_BIND_CHAIN_STRIDE = 0x6c;
export const ROOM_B15_BIND_CHAIN_THIS_A_OFF = 0x5c8;
export const ROOM_B15_BIND_CHAIN_THIS_B_OFF = 0x5d0;
export const ROOM_B15_BIND_CHAIN_HOST_A_VA = 0x004d74a0;
export const ROOM_B15_BIND_CHAIN_HOST_B_VA = 0x00407f10;
export const ROOM_B15_BIND_TYPE6_VA = 0x007ef69a;
export const ROOM_B15_BIND_TYPE6_RET_VA = 0x007ef6c7;
export const ROOM_B15_BIND_TYPE6 = 6;
export const ROOM_B15_BIND_TYPE6_FIELD_2C_GATE = 0xa;
export const ROOM_B15_BIND_TYPE6_HOST_D_VA = 0x00665500;
/* v60: type-1000 dispatch head (PE 0x7ef6ca..0x7ef817, INSIDE FUN_007ef420
   after the v59 type-6 tail). cmp esi,0x3e8 FULL-dword type gate; jne ->
   NEXT dispatch 0x7ef817 (types 0x21/0x124/4/0x11/0x38b, host). [edi+0x2c]
   mode gate: POS set {0x15,0x21,0x3f,0x40,0x41,0x45,0x9e} -> 0x7ef745
   position-model path (reads Game->[0x18300]+{0x14,0x18,0x1c,0x20} f32s,
   2 HOST genrand 0x6eef60, u32->f32 via the 0xbacb00 sign-add bias, mulss
   2^-32 scale @0xba9ff4 = 0x2f800000, lerp x=dst0x33c / y=dst0x340);
   mode 0x44 -> INDIRECT vtable call [eax+0xc] (1 indirect call, HOST);
   mode 0x74 -> shared store 0x7ef733 dst0x450=src.f0c; mode 0x78 -> dst
   0x420=src.f18 + dst0x424=src.f10 then FALLS INTO 0x7ef733 dst0x450=
   src.f0c; default -> jne 0x7efa3d, no stores. Game 0xc71678 + 0x18300
   are runtime pointers (blob-gated: host supplies the 4 f32 bits). */
export const ROOM_B15_BIND_TYPE1000_VA = 0x007ef6ca;
export const ROOM_B15_BIND_TYPE1000_NEXT_VA = 0x007ef817;
export const ROOM_B15_BIND_TYPE1000_DEFAULT_VA = 0x007efa3d;
export const ROOM_B15_BIND_TYPE1000_TYPE = 0x3e8;
export const ROOM_B15_BIND_TYPE1000_POS_VA = 0x007ef745;
export const ROOM_B15_BIND_TYPE1000_POS_SET = [
  0x15, 0x21, 0x3f, 0x40, 0x41, 0x45, 0x9e,
];
export const ROOM_B15_BIND_TYPE1000_MODE_44 = 0x44;
export const ROOM_B15_BIND_TYPE1000_MODE_74 = 0x74;
export const ROOM_B15_BIND_TYPE1000_MODE_78 = 0x78;
export const ROOM_B15_BIND_TYPE1000_VTABLE_SLOT = 0xc;
export const ROOM_B15_BIND_TYPE1000_GENRAND_VA = 0x006eef60;
export const ROOM_B15_BIND_TYPE1000_SCALE_VA = 0x00ba9ff4;
export const ROOM_B15_BIND_TYPE1000_SCALE_BITS = 0x2f800000;
export const ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA = 0x00bacb00;
export const ROOM_B15_BIND_TYPE1000_GAME_GLOBAL = 0x00c71678;
export const ROOM_B15_BIND_TYPE1000_GAME_18300_OFF = 0x18300;

const _f32View = new DataView(new ArrayBuffer(4));
function _f32Value(bits) {
  _f32View.setUint32(0, bits >>> 0, true);
  return _f32View.getFloat32(0, true);
}
function _f32Bits(x) {
  _f32View.setFloat32(0, x, true);
  return _f32View.getUint32(0, true) >>> 0;
}

export function roomB15BindPosUnordered(fieldX, vecX) {
  /* ucomiss xmm0,[0xc7b640] where xmm0=[edi+0x33c]; lahf/test ah,0x44 +
     jp 0x7ef49f: PF set iff UNORDERED (either operand NaN) -> skip the
     position re-derive. Operands are f32 bit patterns on entry. */
  const f = _f32Value(fieldX);
  const v = _f32Value(vecX);
  return (Number.isNaN(f) || Number.isNaN(v)) ? 1 : 0;
}
export function roomB15BindPosRederiveNeeded(fieldX, vecX, fieldY, vecY) {
  /* Both jp tests NOT taken (both pairs ordered) -> the 0x81e9d0 +
     0x813520 re-derive runs (host). */
  const fx = _f32Value(fieldX);
  const vx = _f32Value(vecX);
  const fy = _f32Value(fieldY);
  const vy = _f32Value(vecY);
  if (Number.isNaN(fx) || Number.isNaN(vx)) return 0;
  if (Number.isNaN(fy) || Number.isNaN(vy)) return 0;
  return 1;
}
export function roomB15BindClampVal(v) {
  /* cmp eax,-2 ; jle -> -2 ; cmp eax,7 ; jl -> val ; else 7. SIGNED. */
  const s = v | 0;
  if (s <= ROOM_B15_BIND_CLAMP_MIN) return ROOM_B15_BIND_CLAMP_MIN;
  if (s < ROOM_B15_BIND_CLAMP_MAX) return s;
  return ROOM_B15_BIND_CLAMP_MAX;
}
export function roomB15BindScalePair(vBits) {
  /* movss xmm1,[ebx+0x54]; movaps xmm0,xmm1; mulss xmm1,[0xc37940] ->
     [edi+0xe8] (Y); mulss xmm0,[0xc3793c] -> [edi+0xe4] (X). Both scale
     constants are 1.0f bits (0x3f800000) in this build, so the pair is
     f32(v)*1.0f each way — the PE spawns TWO float32 multiplies in order
     X then Y, both single-rounding. Input is the f32 BIT pattern of the
     source value (the PE loads [ebx+0x54] from memory). */
  const f = _f32Value(vBits);
  const one = 1.0;
  const x = Math.fround(Math.fround(f * one));
  const y = Math.fround(Math.fround(f * one));
  return { xBits: _f32Bits(x), yBits: _f32Bits(y) };
}
export function roomB15BindSubListCopy(subList, count5c0) {
  /* PE 0x7ef5d5..0x7ef60f: [ebx+0x64] array copy with [edi+0x5c0] cap.
     cmp [ebx+0x64],0 ; je 0x7ef611 -> subList===null (ptr==0 gate): count
     UNTOUCHED (no reset, no copy) -> countAfter = count5c0. Else
     count:=0 then 8-iteration stride-4 loop: entry==0 breaks (je); count<8
     (UNSIGNED jae cap: count>=8 skips the store, iteration continues)
     stores dst[count]=entry and count++. subList is the array of up to 8
     source dwords. Returns {countAfter, stored}. */
  if (subList === null) {
    return { countAfter: count5c0 >>> 0, stored: [] };
  }
  let count = 0;
  const stored = [];
  for (let i = 0; i < ROOM_B15_BIND_ENTRY_0x64_COUNT; i += 1) {
    const e = subList[i] >>> 0;
    if (e === 0) break;
    if (count < ROOM_B15_BIND_SUB_MAX) {
      stored.push(e);
      count += 1;
    }
  }
  return { countAfter: count, stored };
}
export function roomB15BindStorePack(src, type28, old52e, field2c, field30) {
  /* PE 0x7ef4a2..0x7ef5d5: pure register->field stores (arg-relayout
     law). src mirrors the slot dwords/bytes ([ebx+off]); type28 =
     [edi+0x28] entity type; old52e = OLD byte [edi+0x52e] captured at
     0x7ef54e pre-store; field2c = [edi+0x2c]; field30 = [edi+0x30].
     COMMON stores run for ALL types; the type-5 block (0x7ef4e5..) runs
     only when type28==5. Byte legs mask to the low byte (mov al / byte
     store). f20 is a SIGN-EXTENDED word (movsx). Clamp signed [-2,7].
     Scale pair = f32(src.f54)*1.0f both axes (mulss consts 1.0f). */
  const u = (v) => v >>> 0;
  const w = (v) => v & 0xffff;
  const type5 = (type28 | 0) === ROOM_B15_BIND_STORE_TYPE5 ? 1 : 0;
  const f24 = u(src.f24);
  const oldByte = old52e & 0xff;
  const newByte = src.f23 & 0xff;
  const scale = roomB15BindScalePair(src.f54); /* {xBits, yBits} */
  const out = {
    dst_3dc: u(src.f38),
    dst_3e0_lo: ROOM_B15_BIND_STORE_QWORD_LO,
    dst_3e0_hi: ROOM_B15_BIND_STORE_QWORD_HI,
    dst_3e8: ROOM_B15_BIND_STORE_DWORD_CONST,
    dst_32c: u((w(src.f20) << 16) >> 16),   /* movsx word -> sign-extend */
    dst_404: u(src.f58),
    type5,
    store_524: u(src.f8) !== 0 ? 1 : 0,
    dst_524: u(src.f10),
    dst_538: src.f60 & 0xff,
    dst_53c: u(roomB15BindClampVal(src.f18 | 0)),
    dst_52c: src.f22 & 0xff,
    dst_588: f24,
    reset_5c0: (f24 !== 0 && f24 !== 0xffffffff) ? 1 : 0,
    dst_528: u(src.f30),
    dst_34: u(src.f3c),
    dst_38: u(src.f40),
    dst_540: u(src.f1c),
    dst_e4_bits: u(scale.xBits),
    dst_e8_bits: u(scale.yBits),
    dst_52e: newByte,
    dst_59c: u(src.f5c),
    dst_530: u(src.f50),
    call_a_va: ROOM_B15_BIND_STORE_HOST_A_VA,
    call_a_arg: u(src.f14),
    call_b_va: ROOM_B15_BIND_STORE_HOST_B_VA,
    call_b_fire:
      type5 && (field2c | 0) === 0x64 && (field30 | 0) !== 0 &&
      oldByte !== newByte ? 1 : 0,
    call_b_arg: 0,
    call_c_va: ROOM_B15_BIND_STORE_HOST_C_VA,
    call_c_arg: u(src.f0c),
    qword_const_va: ROOM_B15_BIND_STORE_QWORD_CONST_VA,
    dword_const_va: ROOM_B15_BIND_STORE_DWORD_CONST_VA,
  };
  return out;
}
export function roomB15BindTailGate(game18304, byte269e9, field2c, field32c) {
  /* 0x7ef63c: [Game+0x18304]==-0xc && byte[Game+0x269e9]!=0 &&
     [edi+0x2c]==0x64 && SIGNED [edi+0x32c]>=0 -> pure stores
     [edi+0x168]|=0x40000 (or) + [recv+0x7764]=-1 (mov). */
  if ((game18304 | 0) !== -0xc) return 0;
  if ((byte269e9 & 0xff) === 0) return 0;
  if ((field2c | 0) !== 0x64) return 0;
  if ((field32c | 0) < 0) return 0;
  return 1;
}
export function roomB15BindChainStep(baseIn, itemDword) {
  /* PE 0x7ef611..0x7ef62f: add ebx,0x6c (u32 wrap); cmp dword ptr [ebx],0 ;
     je 0x7ef630 -> item_dword===0 skips BOTH host calls; else push ebx
     (POST-add arg); lea ecx,[edi+0x5c8]; call 0x4d74a0 (HOST); lea
     ecx,[edi+0x5d0]; call 0x407f10 ANM2::Reset (HOST); fall into the
     shared epilogue @0x7ef630. Returns the pure decisions + the host-side
     replay data. */
  const base = baseIn >>> 0;
  const item = itemDword >>> 0;
  const nextBase = (base + ROOM_B15_BIND_CHAIN_STRIDE) >>> 0; /* u32 wrap */
  const skip = item === 0 ? 1 : 0;  /* FULL-dword zero test (cmp [ebx],0) */
  const fire = skip === 0 ? 1 : 0;
  return {
    stride: ROOM_B15_BIND_CHAIN_STRIDE,
    next_base: nextBase,
    skip,
    fire_a: fire,
    call_a_va: ROOM_B15_BIND_CHAIN_HOST_A_VA,
    call_a_this_off: ROOM_B15_BIND_CHAIN_THIS_A_OFF,
    call_a_arg: nextBase,  /* push ebx AFTER the add */
    fire_b: fire,
    call_b_va: ROOM_B15_BIND_CHAIN_HOST_B_VA,
    call_b_this_off: ROOM_B15_BIND_CHAIN_THIS_B_OFF,
    chain_va: ROOM_B15_BIND_CHAIN_VA,
    epilogue_va: ROOM_B15_BIND_CHAIN_EPILOGUE_VA,
  };
}
export function roomB15BindType6(src, type28, field2c) {
  /* PE 0x7ef69a..0x7ef6c7 (ret 8): cmp esi,6 ; jne 0x7ef6ca (FULL dword:
     type!=6 -> next dispatch). Body: cmp [edi+0x2c],0xa ; mov
     eax,[ebx+0xc] ; mov [edi+0x420],eax ; jne 0x7ef6b7 ; mov
     eax,[ebx+0x10] ; mov [edi+0x424],eax ; push [ebx+0x30] ; mov ecx,edi ;
     call 0x665500 (HOST, unconditional within the body). The mov/mov
     between the cmp and the jne do NOT touch flags, so the 0x420 store is
     UNCONDITIONAL within the type-6 body; only 0x424 is gated on
     [edi+0x2c]==0xa. */
  const type6 = (type28 | 0) === ROOM_B15_BIND_TYPE6 ? 1 : 0;
  return {
    type6,
    dst_420: src.f0c >>> 0,
    store_424: (type6 && (field2c | 0) === ROOM_B15_BIND_TYPE6_FIELD_2C_GATE)
      ? 1 : 0,
    dst_424: src.f10 >>> 0,
    call_d_fire: type6,
    call_d_va: ROOM_B15_BIND_TYPE6_HOST_D_VA,
    call_d_arg: src.f30 >>> 0,
    head_va: ROOM_B15_BIND_TYPE6_VA,
    ret_va: ROOM_B15_BIND_TYPE6_RET_VA,
  };
}
export function roomB15BindType1000(src, type28, field2c) {
  /* PE 0x7ef6ca..0x7ef817 (INSIDE FUN_007ef420, ret 8 variants):
     cmp esi,0x3e8 FULL-dword TYPE gate (esi=[edi+0x28] @0x7ef4ca; jne ->
     NEXT dispatch 0x7ef817). mov eax,[edi+0x2c] mode -> branches:
     POS set {0x15,0x21,0x3f,0x40,0x41,0x45,0x9e} -> je 0x7ef745
     position-model path (2 HOST genrand, lerp stores — the pos export);
     mode 0x44 -> INDIRECT vtable call [eax+0xc] (eax=[edi], ecx=edi,
     HOST) then ret 8; mode 0x74 -> je 0x7ef733 shared store
     dst0x450=src.f0c; mode 0x78 -> dst0x420=src.f18 + dst0x424=src.f10
     then FALLS INTO 0x7ef733 dst0x450=src.f0c; default -> jne 0x7efa3d
     no stores. ALL mode compares FULL dword (cmp eax,imm8 sign-ext). */
  const type1000 = (type28 | 0) === ROOM_B15_BIND_TYPE1000_TYPE ? 1 : 0;
  const m = field2c | 0;
  const pos =
    ROOM_B15_BIND_TYPE1000_POS_SET.includes(m) ? 1 : 0;
  const m44 = m === ROOM_B15_BIND_TYPE1000_MODE_44 ? 1 : 0;
  const m74 = m === ROOM_B15_BIND_TYPE1000_MODE_74 ? 1 : 0;
  const m78 = m === ROOM_B15_BIND_TYPE1000_MODE_78 ? 1 : 0;
  const mdef = pos || m44 || m74 || m78 ? 0 : 1;
  return {
    type1000,
    mode_pos: pos,
    mode_44: m44,
    mode_74: m74,
    mode_78: m78,
    mode_default: mdef,
    store_420: m78,
    dst_420: src.f18 >>> 0,
    store_424: m78,
    dst_424: src.f10 >>> 0,
    store_450: m74 || m78 ? 1 : 0,
    dst_450: src.f0c >>> 0,
    indirect_fire: m44,
    indirect_slot: ROOM_B15_BIND_TYPE1000_VTABLE_SLOT,
    pos_fire: pos,
    pos_genrand_va: ROOM_B15_BIND_TYPE1000_GENRAND_VA,
    pos_scale_va: ROOM_B15_BIND_TYPE1000_SCALE_VA,
    pos_scale_bits: ROOM_B15_BIND_TYPE1000_SCALE_BITS,
    pos_sign_tbl_va: ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA,
    pos_game_global: ROOM_B15_BIND_TYPE1000_GAME_GLOBAL,
    pos_game_off: ROOM_B15_BIND_TYPE1000_GAME_18300_OFF,
    head_va: ROOM_B15_BIND_TYPE1000_VA,
    next_va: ROOM_B15_BIND_TYPE1000_NEXT_VA,
    default_va: ROOM_B15_BIND_TYPE1000_DEFAULT_VA,
  };
}
export function roomB15BindType1000Pos(src, genrand0, genrand1) {
  /* PE 0x7ef745..0x7ef806: a0=[G18300+0x14], a1=[G18300+0x18],
     a2=[G18300+0x1c], a3=[G18300+0x20] (host blob, f32 bit patterns).
     HOST genrand #1 (0x7ef77c) -> u32_1 -> Y; HOST genrand #2 (0x7ef7bd)
     -> u32_2 -> X. u32->f32: cvtdq2pd signed + 0xbacb00 bias (0.0 or
     2^32 f64) + cvtpd2ps, then mulss 0x2f800000 (2^-32) = unit.
     y = a1 + unit0*(a3-a1) -> [edi+0x340]; x = a0 + unit1*(a2-a0) ->
     [edi+0x33c]. subss/mulss/addss single-rounding f32 each. */
  const unit = (u) => {
    let d = (u | 0);
    if ((u >>> 31) !== 0) d += 4294967296;
    const asF32 = Math.fround(d);
    return Math.fround(asF32 * Math.fround(2 ** -32));
  };
  const a0 = _f32Value(src.v0_bits);
  const a1 = _f32Value(src.v1_bits);
  const a2 = _f32Value(src.v2_bits);
  const a3 = _f32Value(src.v3_bits);
  const unit0 = unit(genrand0 >>> 0);
  const unit1 = unit(genrand1 >>> 0);
  const y = Math.fround(a1 + Math.fround(unit0 * Math.fround(a3 - a1)));
  const x = Math.fround(a0 + Math.fround(unit1 * Math.fround(a2 - a0)));
  return {
    dst_33c_bits: _f32Bits(x),
    dst_340_bits: _f32Bits(y),
    genrand_va: ROOM_B15_BIND_TYPE1000_GENRAND_VA,
    scale_bits: ROOM_B15_BIND_TYPE1000_SCALE_BITS,
  };
}

/* v61: B15 bind dispatch tail (PE 0x7ef817..0x7efa43, INSIDE FUN_007ef420
   after the v60 type-1000 head, ret 8 variants). Type dispatch, FULL
   dword each: 0x21/0x124 -> 0x7efa1a (dst 0x380 = f32(u32 src.f0c),
   PURE, no host); 4 -> 0x7ef835 12-store pack (pure) then the HOST chain
   0x417870 -> 0x4cf210 (gated [this+0x3c8]!=0) -> [this+0x3c8]=host
   result -> 0x4cdcf0 (gated result!=0); other -> 0x7ef924 HOST gate
   0x6ac530 then 0x11/0x38b -> DEFAULT (no stores), else dst 0x380=
   src.f50 + f18 SIGNED gate -> HOST 0x6d03e0/0xa10600/0x812d00/0x813520/
   0x67f070 (vec ptr) + HOST genrand 0x6eef60 + PURE lerp (unit =
   f32(u32)*2^-32, X=base_x + unit*vec[0]*20.0f -> 0x33c, Y=base_y +
   unit*vec[1]*20.0f -> 0x340, 20.0f @0xbaa87c). chain count =
   (Game[0x1baac]-Game[0x1baa8])>>2 SAR; chain arg UNSIGNED
   (uint32)edx<(uint32)count ? edx : 0 (edx = sign-extended (int8)f60);
   chain byte gate SIGNED js. Game ptr 0xc71678 + chain base/vec blobs
   are host-supplied. */
export const ROOM_B15_BIND_TAIL_VA = 0x007ef817;
export const ROOM_B15_BIND_TAIL_PACK_VA = 0x007ef835;
export const ROOM_B15_BIND_TAIL_OTHER_VA = 0x007ef924;
export const ROOM_B15_BIND_TAIL_V21_VA = 0x007efa1a;
export const ROOM_B15_BIND_TAIL_DEFAULT_VA = 0x007efa3d;
export const ROOM_B15_BIND_TAIL_LERP_VA = 0x007ef9b4;
export const ROOM_B15_BIND_TAIL_RET_VA = 0x007efa17;
export const ROOM_B15_BIND_TAIL_TYPE4_RET_VA = 0x007ef921;
export const ROOM_B15_BIND_TAIL_TYPE_21 = 0x21;
export const ROOM_B15_BIND_TAIL_TYPE_124 = 0x124;
export const ROOM_B15_BIND_TAIL_TYPE_4 = 4;
export const ROOM_B15_BIND_TAIL_TYPE_11 = 0x11;
export const ROOM_B15_BIND_TAIL_TYPE_38B = 0x38b;
export const ROOM_B15_BIND_TAIL_CHAIN_HOST_VA = 0x00417870;
export const ROOM_B15_BIND_TAIL_SUBCALL_VA = 0x004cf210;
export const ROOM_B15_BIND_TAIL_SUBCALL_THIS_OFF = 0x3cc;
export const ROOM_B15_BIND_TAIL_CHAIN_THIS_OFF = 0x3c8;
export const ROOM_B15_BIND_TAIL_FINAL_VA = 0x004cdcf0;
export const ROOM_B15_BIND_TAIL_GATE_VA = 0x006ac530;
export const ROOM_B15_BIND_TAIL_6D03E0_VA = 0x006d03e0;
export const ROOM_B15_BIND_TAIL_A10600_VA = 0x00a10600;
export const ROOM_B15_BIND_TAIL_A10600_ARG = 0x00c7b640;
export const ROOM_B15_BIND_TAIL_812D00_VA = 0x00812d00;
export const ROOM_B15_BIND_TAIL_813520_VA = 0x00813520;
export const ROOM_B15_BIND_TAIL_67F070_VA = 0x0067f070;
export const ROOM_B15_BIND_TAIL_GENRAND_VA = 0x006eef60;
export const ROOM_B15_BIND_TAIL_SCALE20_VA = 0x00baa87c;
export const ROOM_B15_BIND_TAIL_SCALE20_BITS = 0x41a00000;
export const ROOM_B15_BIND_TAIL_GAME_GLOBAL = 0x00c71678;
export const ROOM_B15_BIND_TAIL_GAME_COUNT_LO_OFF = 0x1baa8;
export const ROOM_B15_BIND_TAIL_GAME_COUNT_HI_OFF = 0x1baac;
export const ROOM_B15_BIND_TAIL_F80_BITS = 0x42a00000;

export function roomB15BindTailDispatch(src, type28, thisF3c8, game1baa8, game1baac) {
  /* PE 0x7ef817..0x7efa43 (INSIDE FUN_007ef420, ret 8 variants): FULL-
     dword type gates -> path_a (0x21/0x124, dst 0x380 = f32(u32 f0c),
     pure), path_b (4, 12-store pack + chain decisions), path_c (other:
     host 0x6ac530 gate -> 0x11/0x38b default -> dst 0x380 = f50 ->
     host tail + genrand lerp). Chain: byte f60 SIGNED (js), count =
     (Game[0x1baac]-Game[0x1baa8])>>2 (u32 wrap + SAR), chain_arg =
     UNSIGNED edx<count ? edx : 0. Host calls stay host; the pure flags
     are classifications (caller ANDs host gates). */
  const t = type28 | 0;
  const type21 = t === ROOM_B15_BIND_TAIL_TYPE_21 ? 1 : 0;
  const type124 = t === ROOM_B15_BIND_TAIL_TYPE_124 ? 1 : 0;
  const type4 = t === ROOM_B15_BIND_TAIL_TYPE_4 ? 1 : 0;
  const type11 = t === ROOM_B15_BIND_TAIL_TYPE_11 ? 1 : 0;
  const type38b = t === ROOM_B15_BIND_TAIL_TYPE_38B ? 1 : 0;
  const pathA = type21 || type124 ? 1 : 0;
  const pathB = type4;
  const pathC = pathA || pathB ? 0 : 1;
  const u = (v) => v >>> 0;
  const scale = roomB15BindScalePair(src.f54 >>> 0); /* {xBits, yBits} */
  /* chain */
  const f60s = (src.f60 & 0xff) << 24 >> 24;       /* (int8) */
  const chainFire = f60s < 0 ? 0 : 1;
  const edx = f60s;                                  /* movsx */
  const diff = (game1baac >>> 0) - (game1baa8 >>> 0);
  const count = (diff | 0) >> 2;                     /* SAR */
  const chainArg = (edx >>> 0) < (count >>> 0) ? edx : 0;
  /* path A: f32(u32 f0c) via sign-add bias, NO 2^-32 scale. */
  let d = (src.f0c | 0);
  if ((src.f0c >>> 31) !== 0) d += 4294967296;
  const v21Bits = _f32Bits(Math.fround(d));
  const tailFire = pathC && !type11 && !type38b ? 1 : 0;
  return {
    type21: u(type21),
    type124: u(type124),
    type4: u(type4),
    type11: u(type11),
    type38b: u(type38b),
    path_a: u(pathA),
    path_b: u(pathB),
    path_c: u(pathC),
    store_438: u(pathB), dst_438: u(src.f10),
    store_43c: u(pathB), dst_43c: u(src.f14),
    store_440: u(pathB), dst_440: u(src.f18),
    store_444: u(pathB), dst_444: u(src.f1c),
    store_463: u(pathB), dst_463: 1,
    store_448: u(pathB), dst_448: src.f23 & 0xff,
    store_418: u(pathB), dst_418: u(src.f50),
    store_44c: u(pathB), dst_44c: u(src.f54),
    store_e4: u(pathB), dst_e4_bits: u(scale.xBits),
    store_e8: u(pathB), dst_e8_bits: u(scale.yBits),
    store_34: u(pathB), dst_34: u(src.f3c),
    store_434: u(pathB), dst_434: u(src.f0c),
    chain_fire: u(chainFire),
    chain_arg: u(chainArg & 0xffffffff),
    chain_count: u(count),
    chain_host_va: ROOM_B15_BIND_TAIL_CHAIN_HOST_VA,
    subcall_fire: thisF3c8 >>> 0 !== 0 ? 1 : 0,
    subcall_va: ROOM_B15_BIND_TAIL_SUBCALL_VA,
    subcall_this_off: ROOM_B15_BIND_TAIL_SUBCALL_THIS_OFF,
    chain_this_off: ROOM_B15_BIND_TAIL_CHAIN_THIS_OFF,
    chain_ret_va: ROOM_B15_BIND_TAIL_TYPE4_RET_VA,
    final_va: ROOM_B15_BIND_TAIL_FINAL_VA,
    store_380_v21: u(pathA),
    dst_380_v21_bits: u(v21Bits),
    store_380: u(tailFire),
    dst_380: u(src.f50),
    call_6d03e0_fire: (src.f18 | 0) >= 0 ? 1 : 0,
    call_6d03e0_va: ROOM_B15_BIND_TAIL_6D03E0_VA,
    call_6d03e0_arg: u(src.f18),
    call_6d03e0_arg2: u(src.f34),
    call_a10600_va: ROOM_B15_BIND_TAIL_A10600_VA,
    call_a10600_arg: ROOM_B15_BIND_TAIL_A10600_ARG,
    call_a10600_this_off: 0x28,
    call_812d00_va: ROOM_B15_BIND_TAIL_812D00_VA,
    call_813520_va: ROOM_B15_BIND_TAIL_813520_VA,
    call_67f070_va: ROOM_B15_BIND_TAIL_67F070_VA,
    gate_va: ROOM_B15_BIND_TAIL_GATE_VA,
    lerp_fire: u(tailFire),
    genrand_va: ROOM_B15_BIND_TAIL_GENRAND_VA,
    scale20_va: ROOM_B15_BIND_TAIL_SCALE20_VA,
    scale20_bits: ROOM_B15_BIND_TAIL_SCALE20_BITS,
    scale2_va: ROOM_B15_BIND_TYPE1000_SCALE_VA,
    scale2_bits: ROOM_B15_BIND_TYPE1000_SCALE_BITS,
    sign_tbl_va: ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA,
    game_global: ROOM_B15_BIND_TAIL_GAME_GLOBAL,
    game_count_lo_off: ROOM_B15_BIND_TAIL_GAME_COUNT_LO_OFF,
    game_count_hi_off: ROOM_B15_BIND_TAIL_GAME_COUNT_HI_OFF,
    f80_bits: ROOM_B15_BIND_TAIL_F80_BITS,
    head_va: ROOM_B15_BIND_TAIL_VA,
    default_va: ROOM_B15_BIND_TAIL_DEFAULT_VA,
  };
}

export function roomB15BindTailLerp(src, genrand) {
  /* PE 0x7ef9b4..0x7efa09: unit = f32(u32 genrand)*2^-32 (sign trick +
     mulss 0x2f800000). x = (unit*vec[0])*20.0f + base_x -> [edi+0x33c];
     y = (unit*vec[1])*20.0f + base_y -> [edi+0x340]. mulss/addss each
     single-rounding f32. vec[0]/vec[1] = [esi+0]/[esi+4] (host result
     blob), bases = [esp+0x20]/[esp+0x24] (frame locals, blob-gated). */
  const unit = (u) => {
    let d = (u | 0);
    if ((u >>> 31) !== 0) d += 4294967296;
    const asF32 = Math.fround(d);
    return Math.fround(asF32 * Math.fround(2 ** -32));
  };
  const unit0 = unit(genrand >>> 0);
  const v0 = _f32Value(src.vec0_bits);
  const v1 = _f32Value(src.vec1_bits);
  const bx = _f32Value(src.base_x_bits);
  const by = _f32Value(src.base_y_bits);
  const scale20 = 20.0;
  const x = Math.fround(Math.fround(Math.fround(unit0 * v0) * scale20) + bx);
  const y = Math.fround(Math.fround(Math.fround(unit0 * v1) * scale20) + by);
  return {
    dst_33c_bits: _f32Bits(x),
    dst_340_bits: _f32Bits(y),
    genrand_va: ROOM_B15_BIND_TAIL_GENRAND_VA,
    scale2_va: ROOM_B15_BIND_TYPE1000_SCALE_VA,
    scale2_bits: ROOM_B15_BIND_TYPE1000_SCALE_BITS,
    scale20_va: ROOM_B15_BIND_TAIL_SCALE20_VA,
    scale20_bits: ROOM_B15_BIND_TAIL_SCALE20_BITS,
    sign_tbl_va: ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA,
    host_vec_va: ROOM_B15_BIND_TAIL_67F070_VA,
    lerp_va: ROOM_B15_BIND_TAIL_LERP_VA,
  };
}

/* ==================================================================== */
/* v62 — FUN_007efa50 Room::Update-style body (0x7efa50..0x7eff48).      */
/* RESTOCK GATE (SIGNED jle) -> STAGE/SLOT gates (FULL-dword -3 / 0) ->  */
/* BOMB BLOCK (UNSIGNED ja (u32)(f11ec-1) > 7 skip; byte bit0 gate;      */
/* stores [room+0x11ec]=0, [this4+0x44]|=1 DWORD, word [this4+0x4a]++    */
/* 16-bit) + HOST args 0x9e5960 (this Game+0x266e4) -> HOST 0x6f8120     */
/* greed (fresh each) -> HOST 0x9bb840 (iff greed1==0 || this_f8!=1;     */
/* this Game+0x1baa8) -> HOST 0x7fb250 (this=room) -> PURE [Game+        */
/* 0x18368]=[Game+0x18334] (iff greed2!=0 && this_f8==1) -> HOST         */
/* 0x571170 (this4+0x74) -> GRID COPY (SIGNED imul total, re-derived,    */
/* jle/jl; src array stride 4 -> dst stride 0x20; default slot magic     */
/* 0x16a9de81 + garbage bits 8..31) -> ENTITY WALK (count UNSIGNED jbe;  */
/* path_a FULL-dword 0x3c5/0; loop UNSIGNED jb).                         */

export const ROOM_706C_HEAD_VA = 0x007efa50;
export const ROOM_706C_HEAD_RET_VA = 0x007eff48;
export const ROOM_706C_RESTOCK_HOST_VA = 0x008158a0;
export const ROOM_706C_9E5960_VA = 0x009e5960;
export const ROOM_706C_9E5960_THIS_OFF = 0x266e4;
export const ROOM_706C_GREED_VA = 0x006f8120;
export const ROOM_706C_9BB840_VA = 0x009bb840;
export const ROOM_706C_9BB840_THIS_OFF = 0x1baa8;
export const ROOM_706C_7FB250_VA = 0x007fb250;
export const ROOM_706C_571170_VA = 0x00571170;
export const ROOM_706C_571170_THIS_OFF = 0x74;
export const ROOM_706C_GAME_GLOBAL = 0x00c71678;
export const ROOM_706C_STAGE_EXPECT = -3;
export const ROOM_706C_WALK_TYPE_GATE = 0x3c5;
export const ROOM_706C_WALK_SUB_GATE = 0;
export const ROOM_706C_F706C_OFF = 0x706c;
export const ROOM_706C_F11EC_OFF = 0x11ec;
export const ROOM_706C_N44_OFF = 0x44;
export const ROOM_706C_N4A_OFF = 0x4a;
export const ROOM_706C_BOMB_TIMER_MAX = 7;
export const ROOM_706C_GRID_STRIDE = 0x20;
export const ROOM_706C_GRID_SRC_OFF = 0x24;
export const ROOM_706C_GRID_DST_OFF = 0x68;
export const ROOM_706C_GRID_MAGIC = 0x16a9de81;
export const ROOM_706C_GRID_SLOT_SIZE = 0x20;
export const ROOM_706C_GRID_COPY_SRC_OFF = 4;
export const ROOM_706C_GRID_HEAD_VA = 0x007efb66;
export const ROOM_706C_GRID_DONE_VA = 0x007efbfd;
export const ROOM_706C_WALK_MAGIC16_0 = 0;
export const ROOM_706C_WALK_MAGIC16_1 = 0;
export const ROOM_706C_WALK_MAGIC16_2 = 0xffffffff;
export const ROOM_706C_WALK_MAGIC16_3 = 0xffffffff;
export const ROOM_706C_WALK_POS_VEC_VA = 0x00c7b640;
export const ROOM_706C_WALK_F60_BITS = 0x42700000;
export const ROOM_706C_WALK_F1_BITS = 0x3f800000;
export const ROOM_706C_WALK_HOST_7EEEB0_VA = 0x007eeeb0;
export const ROOM_706C_WALK_VEC_CTOR_VA = 0x004d3130;
export const ROOM_706C_WALK_VEC_GROW_VA = 0x004d7530;
export const ROOM_706C_WALK_VEC_STRIDE = 0x78;
export const ROOM_706C_WALK_VEC_LIST_OFF = 0x78;
export const ROOM_706C_WALK_VEC_END_OFF = 0x7c;
export const ROOM_706C_WALK_VEC_HEAD_OFF = 0x74;
export const ROOM_706C_WALK_VTABLE_SLOT = 0xc;
export const ROOM_706C_WALK_GLOBAL_A = 0x00c7e84c;
export const ROOM_706C_WALK_GLOBAL_B = 0x00c7e850;
export const ROOM_706C_WALK_TYPE_OFF = 0x28;
export const ROOM_706C_WALK_SUB_OFF = 0x2c;
export const ROOM_706C_WALK_F3C0_OFF = 0x3c0;
export const ROOM_706C_WALK_LIST_BASE_OFF = 0x125c;
export const ROOM_706C_WALK_COUNT_OFF = 0x1264;
export const ROOM_706C_WALK_STRIDE = 4;

const u62 = (v) => v >>> 0;

/** v62 head gates oracle. src fields all 32-bit; matches the C++ export. */
export function room706cHeadGates(src) {
  const f706c = src.f706c | 0;
  const restockFire = f706c > 0 ? 1 : 0;
  const stageEarly = (src.game_18304 | 0) === ROOM_706C_STAGE_EXPECT ? 1 : 0;
  const slotEarly = (src.this4_40 >>> 0) === 0 ? 1 : 0;
  let bombFire = 0;
  let store11ec = 0, store44 = 0, store4a = 0;
  let argBit10 = 0, argWord4a = 0, arg1048 = 0, argF8 = 0;
  let call9e5960Fire = 0, fire9bb840 = 0, fire7fb250 = 0;
  let store18368Fire = 0, dst18368 = 0;
  if (stageEarly === 0 && slotEarly === 0) {
    const timerMinus1 = (src.f11ec - 1) >>> 0;
    bombFire =
      (timerMinus1 <= ROOM_706C_BOMB_TIMER_MAX && (src.this4_44 & 1) === 0)
        ? 1 : 0;
    if (bombFire === 1) {
      store11ec = 1;      /* fires: [esi+0x11ec] = 0 (value 0, flag 1) */
      const post44 = (src.this4_44 | 1) >>> 0;
      store44 = post44;
      store4a = (src.this4_4a + 1) & 0xffff;
      argBit10 = (post44 >>> 0xa) & 1;
      argWord4a = (src.this4_4a + 1) & 0xffff;
      arg1048 = src.this4_10_48 >>> 0;
      argF8 = src.this_f8 >>> 0;
      call9e5960Fire = 1;
      fire9bb840 =
        (src.greed1 >>> 0) === 0 || (src.this_f8 >>> 0) !== 1 ? 1 : 0;
      fire7fb250 = 1;
      store18368Fire =
        (src.greed2 >>> 0) !== 0 && (src.this_f8 >>> 0) === 1 ? 1 : 0;
      dst18368 = src.game_18334 >>> 0;
    }
  }
  const call571170Fire = stageEarly === 0 && slotEarly === 0 ? 1 : 0;
  return {
    restock_fire: restockFire,
    restock_store_706c: restockFire === 1 ? 0xffffffff : 0,
    restock_host_va: ROOM_706C_RESTOCK_HOST_VA,
    stage_early: stageEarly,
    slot_early: slotEarly,
    bomb_fire: bombFire,
    store_11ec: store11ec,
    store_44: store44,
    store_4a: store4a,
    arg_bit10: argBit10,
    arg_word4a: argWord4a,
    arg_10_48: arg1048,
    arg_f8: argF8,
    call_9e5960_fire: call9e5960Fire,
    call_9e5960_va: ROOM_706C_9E5960_VA,
    call_9e5960_this_off: ROOM_706C_9E5960_THIS_OFF,
    greed_va: ROOM_706C_GREED_VA,
    fire_9bb840: fire9bb840,
    call_9bb840_va: ROOM_706C_9BB840_VA,
    call_9bb840_this_off: ROOM_706C_9BB840_THIS_OFF,
    fire_7fb250: fire7fb250,
    call_7fb250_va: ROOM_706C_7FB250_VA,
    store_18368_fire: store18368Fire,
    dst_18368: dst18368,
    store_18368_src_off: 0x18334,
    store_18368_dst_off: 0x18368,
    call_571170_fire: call571170Fire,
    call_571170_va: ROOM_706C_571170_VA,
    call_571170_this_off: ROOM_706C_571170_THIS_OFF,
    game_global: ROOM_706C_GAME_GLOBAL,
    game_18304_expect: u62(ROOM_706C_STAGE_EXPECT),
    f706c_off: ROOM_706C_F706C_OFF,
    f11ec_off: ROOM_706C_F11EC_OFF,
    n44_off: ROOM_706C_N44_OFF,
    n4a_off: ROOM_706C_N4A_OFF,
    bomb_timer_max: ROOM_706C_BOMB_TIMER_MAX,
    head_va: ROOM_706C_HEAD_VA,
    ret_va: ROOM_706C_HEAD_RET_VA,
  };
}

/** v62 grid copy oracle. Param srcs: hmm — memory-to-memory; the JS oracle
    cannot deref wasm memory. Model the decision laws + slot LAYOUT: given
    f0c/f10/garbage and an array of "srcflags" (1 = pointer nonzero, 0 =
    null), return per-index writes. The dst bytes are built as a Uint8Array
    the C++ export writes into wasm memory; tests compare. */
export function room706cGridCopy(f0c, f10, garbage, srcFlags) {
  const total =
    (Math.imul(f0c | 0, f10 | 0)) | 0;   /* SIGNED imul, 32-bit wrap */
  const out = {
    total,
    iterations: 0,
    copies: 0,
    defaults: 0,
    stride: ROOM_706C_GRID_STRIDE,
    src_off: ROOM_706C_GRID_SRC_OFF,
    dst_off: ROOM_706C_GRID_DST_OFF,
    magic: ROOM_706C_GRID_MAGIC,
    slot_size: ROOM_706C_GRID_SLOT_SIZE,
    copy_src_off: ROOM_706C_GRID_COPY_SRC_OFF,
    head_va: ROOM_706C_HEAD_VA,
    ret_va: ROOM_706C_HEAD_RET_VA,
    grid_head_va: ROOM_706C_GRID_HEAD_VA,
    grid_done_va: ROOM_706C_GRID_DONE_VA,
    dst: new Uint8Array(0),
  };
  if (total <= 0) return out;
  const dst = new Uint8Array(total * ROOM_706C_GRID_SLOT_SIZE);
  let iterations = 0, copies = 0, defaults = 0;
  for (let i = 0; i < total; i++) {
    const flag = srcFlags[i] ? 1 : 0;
    const base = i * ROOM_706C_GRID_SLOT_SIZE;
    if (flag === 1) {
      copies++;
    } else {
      /* default slot: [0..16)=0 ; [16..20)=magic ; [20..24)=0 ;
         byte[24]=0 ; bytes[25..27]=garbage bits 8..31 ; [28..32)=magic */
      for (let k = 0; k < 16; k++) dst[base + k] = 0;
      dst[base + 16] = 0x81; dst[base + 17] = 0xde;
      dst[base + 18] = 0xa9; dst[base + 19] = 0x16;
      for (let k = 0; k < 4; k++) dst[base + 20 + k] = 0;
      dst[base + 24] = 0;
      dst[base + 25] = (garbage >>> 8) & 0xff;
      dst[base + 26] = (garbage >>> 16) & 0xff;
      dst[base + 27] = (garbage >>> 24) & 0xff;
      dst[base + 28] = 0x81; dst[base + 29] = 0xde;
      dst[base + 30] = 0xa9; dst[base + 31] = 0x16;
      defaults++;
    }
    iterations++;
  }
  out.iterations = iterations;
  out.copies = copies;
  out.defaults = defaults;
  out.dst = dst;
  return out;
}

/** v62 entity walk step oracle. count index type_28 subtype_2c all
    32-bit; FULL-dword classification; UNSIGNED loop gates. */
export function room706cWalkStep(count, index, type28, subtype2c) {
  const c = count >>> 0;
  const i = index >>> 0;
  const t = type28 | 0;
  const s = subtype2c | 0;
  const next = (i + 1) >>> 0;
  return {
    path_a: (t === ROOM_706C_WALK_TYPE_GATE && s === ROOM_706C_WALK_SUB_GATE)
      ? 1 : 0,
    loop_fire: c !== 0 ? 1 : 0,
    continue_loop: next < c ? 1 : 0,
    next_index: next,
    type_gate: u62(ROOM_706C_WALK_TYPE_GATE),
    subtype_gate: u62(ROOM_706C_WALK_SUB_GATE),
    list_off: ROOM_706C_WALK_LIST_BASE_OFF,
    count_off: ROOM_706C_WALK_COUNT_OFF,
    stride: ROOM_706C_WALK_STRIDE,
    magic16_0: ROOM_706C_WALK_MAGIC16_0,
    magic16_1: ROOM_706C_WALK_MAGIC16_1,
    magic16_2: ROOM_706C_WALK_MAGIC16_2,
    magic16_3: ROOM_706C_WALK_MAGIC16_3,
    pos_vec_va: ROOM_706C_WALK_POS_VEC_VA,
    f60_bits: ROOM_706C_WALK_F60_BITS,
    f1_bits: ROOM_706C_WALK_F1_BITS,
    byte1: 1,
    host_7eeeb0_va: ROOM_706C_WALK_HOST_7EEEB0_VA,
    vec_ctor_va: ROOM_706C_WALK_VEC_CTOR_VA,
    vec_grow_va: ROOM_706C_WALK_VEC_GROW_VA,
    vec_stride: ROOM_706C_WALK_VEC_STRIDE,
    vec_list_off: ROOM_706C_WALK_VEC_LIST_OFF,
    vec_end_off: ROOM_706C_WALK_VEC_END_OFF,
    vec_head_off: ROOM_706C_WALK_VEC_HEAD_OFF,
    vtable_slot: ROOM_706C_WALK_VTABLE_SLOT,
    global_a: ROOM_706C_WALK_GLOBAL_A,
    global_b: ROOM_706C_WALK_GLOBAL_B,
    entity_type_off: ROOM_706C_WALK_TYPE_OFF,
    entity_sub_off: ROOM_706C_WALK_SUB_OFF,
    entity_f3c0_off: ROOM_706C_WALK_F3C0_OFF,
    head_va: ROOM_706C_HEAD_VA,
    ret_va: ROOM_706C_HEAD_RET_VA,
  };
}

/* ==================================================================== */
/* v63 — FUN_007eff50 Room::RestoreState (0x7eff50..0x7f01b8, 2 rets,   */
/* 9 E8 + 1 indirect). COUNTER GUARD (entry c+1, both exits c) -> LIST1 */
/* WALK (stride 0x78, pointer EQUALITY continue; path_a FULL-dword      */
/* 0x3c5/0; PATH_A 8 create args from the ADVANCED element + bind +     */
/* float localA = f32(f50)*deg2rad (0x3c8efa35 @0xbaa088 — NOT 22.5f,   */
/* PE bytes verified), quot/rem = (int16)w20 / room_f0c SIGNED idiv,    */
/* localD = f32(rem)*40+40, localE = f32(quot)*40+120; GiveMinecart     */
/* (this=create result, pos=&localD, vel=&cosR)) -> LIST2 CLEAR (dtor   */
/* 0x4d6ee0, end:=begin) -> GATES (f4.f0==-10 FULL dword && Game.f0==8  */
/* && byte [f4+0x44]&1; early ret 0x7f01b8) -> GRID FIX (SIGNED         */
/* (rows-1)>1/(cols-1)>1, signed bounds, index=cols*i+j signed wrap+js, */
/* src!=0/type 0xf, (u32)target<=0x1bf UNSIGNED ja, dst!=0/type!=1;     */
/* stores [grid+target*4+0x76c]=0x384 + [grid+target*4]=0; INDIRECT     */
/* vtable[0](dst,1)) -> LOOP8 (8x HOST 0x8167e0, UNSIGNED jb).          */

export const ROOM_RESTORE_VA = 0x007eff50;
export const ROOM_RESTORE_RET_VA = 0x007f01aa;
export const ROOM_RESTORE_RET_EARLY_VA = 0x007f01b8;
export const ROOM_RESTORE_NEXT_VA = 0x007f01c0;
export const ROOM_RESTORE_COUNTER_GLOBAL_VA = 0x00c71674;
export const ROOM_RESTORE_GAME_GLOBAL = 0x00c71678;
export const ROOM_RESTORE_CREATE_HOST_VA = 0x006fe410;
export const ROOM_RESTORE_BIND_HOST_VA = 0x007ef420;
export const ROOM_RESTORE_COS_HOST_VA = 0x0041d540;
export const ROOM_RESTORE_SIN_HOST_VA = 0x0041d520;
export const ROOM_RESTORE_MINECART_HOST_VA = 0x006b7be0;
export const ROOM_RESTORE_DTOR_HOST_VA = 0x004d6ee0;
export const ROOM_RESTORE_LOOP8_HOST_VA = 0x008167e0;
export const ROOM_RESTORE_POS_VEC_VA = 0x00c7b640;
export const ROOM_RESTORE_DEG2RAD_BITS = 0x3c8efa35;
export const ROOM_RESTORE_DEG2RAD_VA = 0x00baa088;
export const ROOM_RESTORE_F40_BITS = 0x42200000;
export const ROOM_RESTORE_F40_VA = 0x00baa904;
export const ROOM_RESTORE_F120_BITS = 0x42f00000;
export const ROOM_RESTORE_F120_VA = 0x00baaa00;
export const ROOM_RESTORE_LIST_STRIDE = 0x78;
export const ROOM_RESTORE_LIST_BEGIN_OFF = 0x74;
export const ROOM_RESTORE_LIST_END_OFF = 0x78;
export const ROOM_RESTORE_WALK_TYPE_GATE = 0x3c5;
export const ROOM_RESTORE_WALK_SUB_GATE = 0;
export const ROOM_RESTORE_CREATE_ARITY = 8;
export const ROOM_RESTORE_VEL_BASE_OFF = 0x18;
export const ROOM_RESTORE_POS_BASE_OFF = 0x20;
export const ROOM_RESTORE_F4_0_EXPECT = -10;
export const ROOM_RESTORE_GAME_0_EXPECT = 8;
export const ROOM_RESTORE_F4_44_OFF = 0x44;
export const ROOM_RESTORE_F4_44_BIT = 1;
export const ROOM_RESTORE_GRID_HEAD_VA = 0x007f0106;
export const ROOM_RESTORE_GRID_DONE_VA = 0x007f018d;
export const ROOM_RESTORE_GRID_BASE_OFF = 0x24;
export const ROOM_RESTORE_GRID_CELL_STRIDE = 4;
export const ROOM_RESTORE_GRID_TYPE_EXPECT = 0xf;
export const ROOM_RESTORE_GRID_TARGET_MAX = 0x1bf;
export const ROOM_RESTORE_GRID_F76C_OFF = 0x76c;
export const ROOM_RESTORE_GRID_F76C_VALUE = 0x384;
export const ROOM_RESTORE_GRID_VTABLE_SLOT = 0;
export const ROOM_RESTORE_LOOP8_COUNT = 8;

/* v64 — FUN_007f01c0 ambient body pure islands (0x7f01c0..0x7f072e).
   Constants verified from .rdata via the section table (see NOTES.md). */
export const ROOM_AMBIENT_7F01C0_VA = 0x007f01c0;
export const ROOM_AMBIENT_7F01C0_RET_VA = 0x007f072e;
export const ROOM_AMBIENT_7F01C0_EPILOGUE_VA = 0x007f0711;
export const ROOM_AMBIENT_7F01C0_GAME_GLOBAL = 0x00c71678;
export const ROOM_AMBIENT_7F01C0_SQRT_VA = 0x00435a50;
export const ROOM_AMBIENT_7F01C0_BIND_HOST_VA = 0x00710480;
export const ROOM_AMBIENT_7F01C0_RANGE_TAIL_VA = 0x007f0544;
export const ROOM_AMBIENT_7F01C0_BIND_SITE_VA = 0x007f0478;
export const ROOM_AMBIENT_7F01C0_CONTINUE_VA = 0x007f051b;
export const ROOM_AMBIENT_7F01C0_TAIL_CONTINUE_VA = 0x007f0485;
export const ROOM_AMBIENT_7F01C0_DEST_6F4_VA = 0x007f06f4;
export const ROOM_AMBIENT_7F01C0_DEST_6AC_VA = 0x007f06ac;
export const ROOM_AMBIENT_7F01C0_DEST_692_VA = 0x007f0692;
export const ROOM_AMBIENT_7F01C0_DEST_678_VA = 0x007f0678;
export const ROOM_AMBIENT_7F01C0_F40_BITS = 0x42200000;
export const ROOM_AMBIENT_7F01C0_F40_VA = 0x00baa904;
export const ROOM_AMBIENT_7F01C0_F120_BITS = 0x42f00000;
export const ROOM_AMBIENT_7F01C0_F120_VA = 0x00baaa00;
export const ROOM_AMBIENT_7F01C0_GATE4_BITS = 0x40800000;
export const ROOM_AMBIENT_7F01C0_GATE4_VA = 0x00baa75c;
export const ROOM_AMBIENT_7F01C0_RANGE_BITS = 0x41c80000;
export const ROOM_AMBIENT_7F01C0_RANGE_VA = 0x00baa8a0;
export const ROOM_AMBIENT_7F01C0_BIND60_BITS = 0x42700000;
export const ROOM_AMBIENT_7F01C0_BIND60_VA = 0x00baa950;
export const ROOM_AMBIENT_7F01C0_B110_BITS = 0x42dc0000;
export const ROOM_AMBIENT_7F01C0_B110_VA = 0x00baa9ec;
export const ROOM_AMBIENT_7F01C0_B100_BITS = 0x42c80000;
export const ROOM_AMBIENT_7F01C0_B100_VA = 0x00baa9d0;
export const ROOM_AMBIENT_7F01C0_B140_BITS = 0x430c0000;
export const ROOM_AMBIENT_7F01C0_B140_VA = 0x00baaa30;
export const ROOM_AMBIENT_7F01C0_B20_BITS = 0x41a00000;
export const ROOM_AMBIENT_7F01C0_B20_VA = 0x00baa87c;
export const ROOM_AMBIENT_7F01C0_LANE_QUOT_VA = 0x00bacbf0;
export const ROOM_AMBIENT_7F01C0_LANE_REM_VA = 0x00bacab0;
/* .rdata tables {-18,0,0,-18}/{18,0,0,18}; PE displacement indexing
   unpacks to laneA (quot path) = {0,-18,0,18}, laneB (rem path) =
   {-18,0,18,0}. */
export const ROOM_AMBIENT_7F01C0_LANE_OFF_QUOT = Object.freeze(
  [0x00000000, 0xc1900000, 0x00000000, 0x41900000]);
export const ROOM_AMBIENT_7F01C0_LANE_OFF_REM = Object.freeze(
  [0xc1900000, 0x00000000, 0x41900000, 0x00000000]);
export const ROOM_AMBIENT_7F01C0_SPECIAL_TYPE = 0x23;
export const ROOM_AMBIENT_7F01C0_THIS_TYPE_GATE = 0x10;
export const ROOM_AMBIENT_7F01C0_SLOT_F3A0_BIT = 0x10;
export const ROOM_AMBIENT_7F01C0_F4_44_BIT = 1;
export const ROOM_AMBIENT_7F01C0_BIND_ARG0 = 0;

const f32 = Math.fround;
/* f32 bit-pattern reinterpret (cvtdq2ps/movss semantics: the PE reads
   f32 bits from memory; the raw u32 must be re-read as float). */
const f32FromBits = (b) => {
  const u = new Uint32Array(1);
  u[0] = b >>> 0;
  return new Float32Array(u.buffer)[0];
};
const f32ToBits = (v) => {
  const f = new Float32Array(1);
  f[0] = v;
  return new Uint32Array(f.buffer)[0] >>> 0;
};

/** v63 counter guard oracle. PE 0x7eff5c..0x7eff6c entry store c+1;
    both exits (0x7f019e memory dec / 0x7f01ab register dec of the
    entry-inc value) net-restore c. */
export function roomRestoreCounters(counterIn) {
  const c = counterIn >>> 0;
  return {
    entry_store: (c + 1) >>> 0,
    exit_store: c,
    exit_early_store: c,
    global_va: ROOM_RESTORE_COUNTER_GLOBAL_VA,
    head_va: ROOM_RESTORE_VA,
    ret_va: ROOM_RESTORE_RET_VA,
    ret_early_va: ROOM_RESTORE_RET_EARLY_VA,
  };
}

/** v63 list1 walk step oracle. Branch-by-branch from PE 0x7eff76..
    0x7f00b4. continue = (cur_ptr + 0x78) != end_ptr (EQUALITY jne);
    path_a = FULL-dword cur.f0==0x3c5 && cur.f4==0; PATH_A create args
    from the ADVANCED element; float legs f32(f50)*deg2rad and
    (int16)w20 / room_f0c SIGNED idiv; GiveMinecart relay. */
export function roomRestoreList1Step(s) {
  const curPtr = s.cur_ptr >>> 0;
  const nextPtr = (curPtr + ROOM_RESTORE_LIST_STRIDE) >>> 0;
  const savedPtr = (curPtr + 0x28) >>> 0;
  const pathA = ((s.cur_f0 | 0) === ROOM_RESTORE_WALK_TYPE_GATE &&
                 (s.cur_f4 | 0) === ROOM_RESTORE_WALK_SUB_GATE) ? 1 : 0;
  const o = {
    path_a: pathA,
    continue_loop: nextPtr !== (s.end_ptr >>> 0) ? 1 : 0,
    next_ptr: nextPtr,
    saved_ptr: savedPtr,
    create_host_va: ROOM_RESTORE_CREATE_HOST_VA,
    create_this_va: ROOM_RESTORE_GAME_GLOBAL,
    bind_host_va: ROOM_RESTORE_BIND_HOST_VA,
    bind_arg1_fire: 1,
    minecart_va: ROOM_RESTORE_MINECART_HOST_VA,
    minecart_this_passthru: 1,
    pos_ptr_off: ROOM_RESTORE_POS_BASE_OFF,
    vel_ptr_off: ROOM_RESTORE_VEL_BASE_OFF,
    cos_va: ROOM_RESTORE_COS_HOST_VA,
    sin_va: ROOM_RESTORE_SIN_HOST_VA,
    stride: ROOM_RESTORE_LIST_STRIDE,
    type_gate: u62(ROOM_RESTORE_WALK_TYPE_GATE),
    sub_gate: u62(ROOM_RESTORE_WALK_SUB_GATE),
    deg2rad_bits: ROOM_RESTORE_DEG2RAD_BITS,
    f40_bits: ROOM_RESTORE_F40_BITS,
    f120_bits: ROOM_RESTORE_F120_BITS,
    head_va: ROOM_RESTORE_VA,
    ret_va: ROOM_RESTORE_RET_VA,
    cos_r_bits: s.cos_r_bits >>> 0,
    sin_r_bits: s.sin_r_bits >>> 0,
  };
  if (pathA === 1) {
    o.create_a1 = s.next_f0 >>> 0;
    o.create_a2 = s.next_f4 >>> 0;
    o.create_a3 = (nextPtr + 0x28) >>> 0;
    o.create_a4 = ROOM_RESTORE_POS_VEC_VA;
    o.create_a5 = 0;
    o.create_a6 = s.cur_f80 >>> 0;
    o.create_a7 = s.cur_fac >>> 0;
    o.create_a8 = 0;
    o.bind_arg2 = nextPtr;
    /* mulss [0xbaa088] = 0x3c8efa35 deg2rad (PE-verified). */
    const localA = f32(f32FromBits(s.cur_f50_bits) *
                       f32FromBits(ROOM_RESTORE_DEG2RAD_BITS));
    o.local_a_bits = f32ToBits(localA);
    /* movsx int16; cdq; idiv room_f0c — SIGNED toward zero. */
    const w20 = (s.cur_w20 << 16) >> 16;
    const divisor = s.room_f0c | 0;
    let quot = 0, rem = 0;
    if (divisor !== 0) {
      quot = Math.trunc(w20 / divisor);
      rem = w20 % divisor;
    }
    o.quot = quot | 0;
    o.rem = rem | 0;
    /* cvtdq2ps rem -> mulss 40.0f -> addss 40.0f. */
    const localD = f32(f32(f32(rem) * 40) + 40);
    o.local_d_bits = f32ToBits(localD);
    /* cvtdq2ps quot -> mulss 40.0f -> addss 120.0f (pos.y). */
    const localE = f32(f32(f32(quot) * 40) + 120);
    o.local_e_bits = f32ToBits(localE);
  } else {
    o.create_a1 = s.cur_f0 >>> 0;
    o.create_a2 = s.cur_f4 >>> 0;
    o.create_a3 = savedPtr;
    o.create_a4 = ROOM_RESTORE_POS_VEC_VA;
    o.create_a5 = 0;
    o.create_a6 = s.cur_f8 >>> 0;
    o.create_a7 = s.cur_f34 >>> 0;
    o.create_a8 = 0;
    o.bind_arg2 = curPtr;
    o.local_a_bits = 0;
    o.quot = 0;
    o.rem = 0;
    o.local_d_bits = 0;
    o.local_e_bits = 0;
  }
  return o;
}

/** v63 list2 clear oracle (PE 0x7f00ba..0x7f00df). dtor_count =
    (end-begin)/0x78 when begin!=end else 0; store [f4+0x78] = begin. */
export function roomRestoreList2Clear(beginPtr, endPtr) {
  const b = beginPtr >>> 0;
  const e = endPtr >>> 0;
  const count = b !== e ? Math.floor((e - b) / ROOM_RESTORE_LIST_STRIDE) : 0;
  return {
    dtor_count: count >>> 0,
    store_end: b,
    dtor_host_va: ROOM_RESTORE_DTOR_HOST_VA,
    stride: ROOM_RESTORE_LIST_STRIDE,
    head_va: ROOM_RESTORE_VA,
  };
}

/** v63 gates oracle (PE 0x7f00e2..0x7f0100). FULL-dword f4_0==-10 &&
    Game.f0==8 && byte bit0 [f4+0x44]. */
export function roomRestoreGates(f4F0, gameF0, f4_44Byte) {
  const fire =
    ((f4F0 | 0) === ROOM_RESTORE_F4_0_EXPECT &&
     (gameF0 | 0) === ROOM_RESTORE_GAME_0_EXPECT &&
     ((f4_44Byte >>> 0) & ROOM_RESTORE_F4_44_BIT) !== 0) ? 1 : 0;
  return {
    fire,
    f4_0_expect: u62(ROOM_RESTORE_F4_0_EXPECT),
    game_0_expect: u62(ROOM_RESTORE_GAME_0_EXPECT),
    f4_44_off: ROOM_RESTORE_F4_44_OFF,
    byte_bit: ROOM_RESTORE_F4_44_BIT,
    early_ret_va: ROOM_RESTORE_RET_EARLY_VA,
    head_va: ROOM_RESTORE_VA,
    ret_va: ROOM_RESTORE_RET_VA,
    grid_head_va: ROOM_RESTORE_GRID_HEAD_VA,
    grid_done_va: ROOM_RESTORE_GRID_DONE_VA,
  };
}

/** v63 grid fix step oracle (PE 0x7f0106..0x7f018d). */
export function roomRestoreGridStep(s) {
  const cols = s.cols | 0, rows = s.rows | 0;
  const i = s.i | 0, j = s.j | 0;
  /* dec eax wraps u32; the cmp/jle/jl are SIGNED on the wrapped value. */
  const rowsM1 = (rows - 1) | 0, colsM1 = (cols - 1) | 0;
  const outerFire = rowsM1 > 1 ? 1 : 0;
  const innerFire = colsM1 > 1 ? 1 : 0;
  const iOk = (i >= 0 && i < rows) ? 1 : 0;
  const jOk = (j >= 0 && j < cols) ? 1 : 0;
  /* imul cols,i SIGNED 32-bit wrap; add j; js guard on the wrapped sum. */
  const index = (Math.imul(cols, i) + j) | 0;
  const indexOk = index >= 0 ? 1 : 0;
  const srcOk = (s.src_ptr >>> 0) !== 0 ? 1 : 0;
  const srcTypeOk = (s.src_f4 >>> 0) === ROOM_RESTORE_GRID_TYPE_EXPECT ? 1 : 0;
  const target = s.src_f24 >>> 0;
  const targetOk = target <= ROOM_RESTORE_GRID_TARGET_MAX ? 1 : 0;
  const dstOk = (s.dst_ptr >>> 0) !== 0 ? 1 : 0;
  const dstTypeOk = (s.dst_f4 >>> 0) !== 1 ? 1 : 0;
  const fire = (outerFire && innerFire && iOk && jOk && indexOk &&
                srcOk && srcTypeOk && targetOk && dstOk && dstTypeOk)
    ? 1 : 0;
  return {
    outer_fire: outerFire,
    inner_fire: innerFire,
    index,
    index_ok: indexOk,
    i_ok: iOk,
    j_ok: jOk,
    src_ok: srcOk,
    src_type_ok: srcTypeOk,
    target,
    target_ok: targetOk,
    dst_ok: dstOk,
    dst_type_ok: dstTypeOk,
    fire,
    store_76c_value: fire === 1 ? ROOM_RESTORE_GRID_F76C_VALUE : 0,
    indirect_fire: fire,
    indirect_arg: fire === 1 ? 1 : 0,
    vtable_slot: ROOM_RESTORE_GRID_VTABLE_SLOT,
    continue_j: ((j + 1) | 0) < colsM1 ? 1 : 0,
    continue_i: ((i + 1) | 0) < rowsM1 ? 1 : 0,
    grid_base_off: ROOM_RESTORE_GRID_BASE_OFF,
    cell_stride: ROOM_RESTORE_GRID_CELL_STRIDE,
    type_gate: ROOM_RESTORE_GRID_TYPE_EXPECT,
    target_max: ROOM_RESTORE_GRID_TARGET_MAX,
    f76c_off: ROOM_RESTORE_GRID_F76C_OFF,
    head_va: ROOM_RESTORE_VA,
    ret_va: ROOM_RESTORE_RET_VA,
  };
}

/** v63 loop8 step oracle (PE 0x7f018d..0x7f019e). continue =
    (u32)(k+1) < 8 (UNSIGNED jb); host 0x8167e0 this=room arg=k. */
export function roomRestoreLoop8Step(k) {
  const kk = k >>> 0;
  const next = (kk + 1) >>> 0;
  return {
    continue_loop: next < ROOM_RESTORE_LOOP8_COUNT ? 1 : 0,
    host_va: ROOM_RESTORE_LOOP8_HOST_VA,
    arg: kk,
    count: ROOM_RESTORE_LOOP8_COUNT,
  };
}

/* ---- v64: FUN_007f01c0 ambient body pure islands ----
   Independent JS oracles transcribed branch-by-branch from
   cpu-dump/007f01c0.txt + cpu-dump/007f04b0.txt (PE 0x7f01c0..0x7f072e,
   SEH-framed thiscall). Float gates: ja/jbe on comiss pairs — ja =
   strictly ordered greater (NaN NOT taken), jbe = (a<=b) OR unordered
   (NaN taken). sqrt = CRT primitive 0x435a50 (cvtss2sd/sqrtsd/cvtsd2ss;
   law boundary is INSIDE the primitive, matching 7230 finish_sqrt). */

function ambient7f01c0LaneOffQuot(lane) {
  return peBitsToF32(ROOM_AMBIENT_7F01C0_LANE_OFF_QUOT[lane & 3]);
}
function ambient7f01c0LaneOffRem(lane) {
  return peBitsToF32(ROOM_AMBIENT_7F01C0_LANE_OFF_REM[lane & 3]);
}
function ambient7f01c0Sqrt(x) {
  /* CRT sqrt: only ORDERED x<0 takes the error path (0xaf090b); NaN
     and -0.0 stay inline. dist2 (sum of f32 squares) is never <0. */
  if (x < 0) return NaN;
  return Math.fround(Math.sqrt(x));
}

/** v64 position step oracle (PE 0x7f02b8..0x7f0305). SIGNED idiv of
    (s32)[slot+0x24] by (s32)room_f0c (cdq; INT_MIN/-1 and divisor 0
    fault -> div_ok 0); slot_x = f32(f32(f32(quot)*40)+120)+laneA[lane];
    slot_y = f32(f32(f32(rem)*40)+40)+laneB[lane]; lane = edi&3. */
export function roomAmbient7f01c0PosStep(s) {
  const dividend = s.slot_f24 | 0;
  const divisor = s.room_f0c | 0;
  const divOk = (divisor !== 0 &&
    !(dividend === -0x80000000 && divisor === -1)) ? 1 : 0;
  let quot = 0, rem = 0;
  if (divOk === 1) {
    quot = Math.trunc(dividend / divisor);
    rem = dividend % divisor;
  }
  const lane = (s.lane >>> 0) & 3;
  const f40 = peBitsToF32(ROOM_AMBIENT_7F01C0_F40_BITS);
  const f120 = peBitsToF32(ROOM_AMBIENT_7F01C0_F120_BITS);
  const slotX = Math.fround(Math.fround(Math.fround(Math.fround(quot) * f40)
    + f120) + ambient7f01c0LaneOffQuot(lane));
  const slotY = Math.fround(Math.fround(Math.fround(Math.fround(rem) * f40)
    + f40) + ambient7f01c0LaneOffRem(lane));
  return {
    quot: quot | 0,
    rem: rem | 0,
    div_ok: divOk,
    lane,
    slot_x_bits: peF32ToBits(slotX),
    slot_y_bits: peF32ToBits(slotY),
    f40_bits: ROOM_AMBIENT_7F01C0_F40_BITS,
    f120_bits: ROOM_AMBIENT_7F01C0_F120_BITS,
    lane_quot_va: ROOM_AMBIENT_7F01C0_LANE_QUOT_VA,
    lane_rem_va: ROOM_AMBIENT_7F01C0_LANE_REM_VA,
  };
}

/** v64 main distance oracle (PE 0x7f030a..0x7f0323). CROSSED axes:
    d0 = f32(slot_x - p340), d1 = f32(slot_y - p33c); dist2 =
    f32(f32(d0*d0)+f32(d1*d1)); dist = CRT sqrt(dist2) (0x435a50). */
export function roomAmbient7f01c0Dist(s) {
  const sx = peBitsToF32(s.slot_x_bits);
  const sy = peBitsToF32(s.slot_y_bits);
  const p0 = peBitsToF32(s.p33c_bits);
  const p1 = peBitsToF32(s.p340_bits);
  const d0 = Math.fround(sx - p1);
  const d1 = Math.fround(sy - p0);
  const dist2 = Math.fround(Math.fround(d0 * d0) + Math.fround(d1 * d1));
  return {
    d0_bits: peF32ToBits(d0),
    d1_bits: peF32ToBits(d1),
    dist2_bits: peF32ToBits(dist2),
    dist_bits: peF32ToBits(ambient7f01c0Sqrt(dist2)),
    sqrt_va: ROOM_AMBIENT_7F01C0_SQRT_VA,
    sqrt_primitive: 1,
  };
}

/** v64 special step oracle (PE 0x7f032e..0x7f03a9). s13c0==0x23 full
    dword; len2 = f32(f32(a*a)+f32(b*b)); len2 > 4.0f ORDERED (jbe
    skip); dir law: |a|>|b| ORDERED ? (0>a ORDERED ? 0 : 2) :
    (setbe(0,b) [0<=b OR NaN] ? 3 : 1). NaN(a/b) -> second arm; NaN(b)
    -> dir 3; NaN(a) with b ordered -> dir 3 (setbe arm). */
export function roomAmbient7f01c0SpecialStep(s) {
  const a = peBitsToF32(s.a_bits);
  const b = peBitsToF32(s.b_bits);
  const specialActive = (s.s13c0 >>> 0) === ROOM_AMBIENT_7F01C0_SPECIAL_TYPE
    ? 1 : 0;
  const len2 = Math.fround(Math.fround(a * a) + Math.fround(b * b));
  const len2Gt4 = len2 > peBitsToF32(ROOM_AMBIENT_7F01C0_GATE4_BITS) ? 1 : 0;
  const ax = Math.abs(a);
  const by = Math.abs(b);
  let dir;
  if (ax > by) {
    dir = (0 > a) ? 0 : 2;
  } else {
    const cl = (0 > b) ? 0 : 1; /* setbe: 0<=b OR NaN(b) */
    dir = cl * 2 + 1;
  }
  return {
    special_active: specialActive,
    len2_bits: peF32ToBits(len2),
    len2_gt_4: len2Gt4,
    dir,
    dir_ok: (specialActive === 1 && len2Gt4 === 1) ? 1 : 0,
    gate4_bits: ROOM_AMBIENT_7F01C0_GATE4_BITS,
    gate4_va: ROOM_AMBIENT_7F01C0_GATE4_VA,
    sqrt_va: ROOM_AMBIENT_7F01C0_SQRT_VA,
    head_va: ROOM_AMBIENT_7F01C0_VA,
    epilogue_va: ROOM_AMBIENT_7F01C0_EPILOGUE_VA,
  };
}

/** v64 adjusted distance oracle (PE 0x7f03c9..0x7f0401). CROSSED:
    ny = f32(p33c + f32(a+a)); nx = f32(p340 + f32(b+b)); d0 =
    f32(slot_x - nx); d1 = f32(slot_y - ny); dist2 = f32(f32(d0*d0)+
    f32(d1*d1)); dist = CRT sqrt. */
export function roomAmbient7f01c0AdjDist(s) {
  const sx = peBitsToF32(s.slot_x_bits);
  const sy = peBitsToF32(s.slot_y_bits);
  const p0 = peBitsToF32(s.p33c_bits);
  const p1 = peBitsToF32(s.p340_bits);
  const a = peBitsToF32(s.a_bits);
  const b = peBitsToF32(s.b_bits);
  const a2 = Math.fround(a + a);
  const b2 = Math.fround(b + b);
  const ny = Math.fround(p0 + a2);
  const nx = Math.fround(p1 + b2);
  const d1 = Math.fround(sy - ny);
  const d0 = Math.fround(sx - nx);
  const dist2 = Math.fround(Math.fround(d0 * d0) + Math.fround(d1 * d1));
  return {
    d0_bits: peF32ToBits(d0),
    d1_bits: peF32ToBits(d1),
    dist2_bits: peF32ToBits(dist2),
    dist_bits: peF32ToBits(ambient7f01c0Sqrt(dist2)),
    sqrt_va: ROOM_AMBIENT_7F01C0_SQRT_VA,
  };
}

/** v64 tail decision oracle (PE 0x7f040f..0x7f0476). enable = byte
    [slot+0x3a0]&0x10 ? (f0c != 2) : (f0c == 2); range_dest = 25.0f >
    dist ORDERED (-> 0x7f0544); type_ok = f8 full-dword in {1,2,3,4,5}
    (RE-READ); this_gate_ok = byte [this.f4+0x44]&1; dist60_ok = 60.0f
    > dist ORDERED; ecx gate = dir (when special&&gt) else
    player_f1624 (0x7f0335 loads f1624 on ALL paths; dir overwrites ecx
    only on the special&&gt path); dir_eq_lane = ecx_gate == lane;
    bind_fire = enable && !range_dest && type_ok && this_gate_ok &&
    dist60_ok && dir_eq_lane (host 0x710480). */
export function roomAmbient7f01c0TailDecision(s) {
  const flagSet = ((s.slot_f3a0_byte >>> 0) & ROOM_AMBIENT_7F01C0_SLOT_F3A0_BIT)
    !== 0 ? 1 : 0;
  const compareEnable = flagSet === 1
    ? ((s.slot_f0c | 0) !== 2 ? 1 : 0)
    : ((s.slot_f0c | 0) === 2 ? 1 : 0);
  const dist = peBitsToF32(s.dist_bits);
  const rangeDest = (peBitsToF32(ROOM_AMBIENT_7F01C0_RANGE_BITS) > dist)
    ? 1 : 0;
  const t = s.slot_type8 | 0;
  const typeOk = (t === 1 || t === 4 || t === 3 || t === 2 || t === 5)
    ? 1 : 0;
  const thisGateOk = ((s.this_f4_44_byte >>> 0) & ROOM_AMBIENT_7F01C0_F4_44_BIT)
    !== 0 ? 1 : 0;
  const dist60Ok = (peBitsToF32(ROOM_AMBIENT_7F01C0_BIND60_BITS) > dist)
    ? 1 : 0;
  const ecxIsDir = (s.special_active !== 0 && s.len2_gt_4 !== 0) ? 1 : 0;
  const ecxGate = ecxIsDir === 1 ? s.dir >>> 0 : s.player_f1624 >>> 0;
  const dirEqLane = ecxGate === (s.lane >>> 0) ? 1 : 0;
  const bindFire = (compareEnable === 1 && rangeDest === 0 && typeOk === 1 &&
    thisGateOk === 1 && dist60Ok === 1 && dirEqLane === 1) ? 1 : 0;
  return {
    ecx_gate: ecxGate,
    ecx_is_dir: ecxIsDir,
    compare_enable: compareEnable,
    flag_bit_set: flagSet,
    range_dest: rangeDest,
    type_ok: typeOk,
    this_gate_ok: thisGateOk,
    dist60_ok: dist60Ok,
    dir_eq_lane: dirEqLane,
    bind_fire: bindFire,
    bind_host_va: ROOM_AMBIENT_7F01C0_BIND_HOST_VA,
    bind_arg0: ROOM_AMBIENT_7F01C0_BIND_ARG0,
    range_gate_bits: ROOM_AMBIENT_7F01C0_RANGE_BITS,
    bind_gate_bits: ROOM_AMBIENT_7F01C0_BIND60_BITS,
    dest_544_va: ROOM_AMBIENT_7F01C0_RANGE_TAIL_VA,
    dest_485_va: ROOM_AMBIENT_7F01C0_TAIL_CONTINUE_VA,
    head_va: ROOM_AMBIENT_7F01C0_VA,
    epilogue_va: ROOM_AMBIENT_7F01C0_EPILOGUE_VA,
  };
}

/** v64 bounds chain oracle (PE 0x7f04a2..0x7f0515). chain_active =
    this.f8 == 0x10 (full dword); gates (all ORDERED comiss):
    A 120>p1 -> 6f4 ; B 110>p1 ; C p0>100 ; D 140>p0 -> 6f4 ; E
    p0>fround(f1c+20) -> 6ac ; F 0>p0 (excludes -0.0) -> 692 ; G
    p1>fround(f20+20) -> 678 ; else continue 0x7f051b. Precedence A,
    then (B&&C&&D), then E, F, G (matches ja/jbe fall-through). */
export function roomAmbient7f01c0Bounds(s) {
  const chainActive = (s.this_f8 >>> 0) === ROOM_AMBIENT_7F01C0_THIS_TYPE_GATE
    ? 1 : 0;
  const p0 = peBitsToF32(s.p33c_bits);
  const p1 = peBitsToF32(s.p340_bits);
  const f120 = peBitsToF32(ROOM_AMBIENT_7F01C0_F120_BITS);
  const f110 = peBitsToF32(ROOM_AMBIENT_7F01C0_B110_BITS);
  const f100 = peBitsToF32(ROOM_AMBIENT_7F01C0_B100_BITS);
  const f140 = peBitsToF32(ROOM_AMBIENT_7F01C0_B140_BITS);
  const f20 = peBitsToF32(ROOM_AMBIENT_7F01C0_B20_BITS);
  const boundE = Math.fround(peBitsToF32(s.room_f1c_bits) + f20);
  const boundG = Math.fround(peBitsToF32(s.room_f20_bits) + f20);
  const gateA = f120 > p1 ? 1 : 0;
  const gateB = f110 > p1 ? 1 : 0;
  const gateC = p0 > f100 ? 1 : 0;
  const gateD = f140 > p0 ? 1 : 0;
  const gateE = p0 > boundE ? 1 : 0;
  const gateF = 0 > p0 ? 1 : 0;
  const gateG = p1 > boundG ? 1 : 0;
  let dest = 0, destVa = ROOM_AMBIENT_7F01C0_CONTINUE_VA;
  if (chainActive === 1) {
    if (gateA === 1) {
      dest = 1; destVa = ROOM_AMBIENT_7F01C0_DEST_6F4_VA;
    } else if (gateB === 1 && gateC === 1 && gateD === 1) {
      dest = 1; destVa = ROOM_AMBIENT_7F01C0_DEST_6F4_VA;
    } else if (gateE === 1) {
      dest = 2; destVa = ROOM_AMBIENT_7F01C0_DEST_6AC_VA;
    } else if (gateF === 1) {
      dest = 3; destVa = ROOM_AMBIENT_7F01C0_DEST_692_VA;
    } else if (gateG === 1) {
      dest = 4; destVa = ROOM_AMBIENT_7F01C0_DEST_678_VA;
    }
  }
  return {
    chain_active: chainActive,
    gate_a: gateA,
    gate_b: gateB,
    gate_c: gateC,
    gate_d: gateD,
    gate_e: gateE,
    gate_f: gateF,
    gate_g: gateG,
    dest,
    dest_va: destVa,
    cont_va: ROOM_AMBIENT_7F01C0_CONTINUE_VA,
    f120_bits: ROOM_AMBIENT_7F01C0_F120_BITS,
    f120_va: ROOM_AMBIENT_7F01C0_F120_VA,
    f110_bits: ROOM_AMBIENT_7F01C0_B110_BITS,
    f110_va: ROOM_AMBIENT_7F01C0_B110_VA,
    f100_bits: ROOM_AMBIENT_7F01C0_B100_BITS,
    f100_va: ROOM_AMBIENT_7F01C0_B100_VA,
    f140_bits: ROOM_AMBIENT_7F01C0_B140_BITS,
    f140_va: ROOM_AMBIENT_7F01C0_B140_VA,
    f20_bits: ROOM_AMBIENT_7F01C0_B20_BITS,
    f20_va: ROOM_AMBIENT_7F01C0_B20_VA,
    sqrt_va: ROOM_AMBIENT_7F01C0_SQRT_VA,
  };
}

/* v25r — FUN_007f01c0 OUTER-LOOP count/continue law (PE 0x7f022f..
   0x7f0245 player count/entry; 0x7f051b..0x7f053f continue tail).
   count = SAR((s32)([Game+0x1baac]-[Game+0x1baa8]),2); entry gate is
   ZERO-ONLY (test/jz: negative count ENTERS); the tail RE-READS the
   Game player list on EVERY iteration (0x7f0528/0x7f052e) then
   cmp/jb UNSIGNED (u32)idx_next < (u32)count_fresh. Game::GetPlayer
   0x417870 stays HOST; the player gate observes [player+0x2c]
   post-call (cmp/jne full dword). ABI UNCHANGED (64). */
export const ROOM_AMBIENT_7F01C0_OUTER_COUNT_END_OFF = 0x1baac;
export const ROOM_AMBIENT_7F01C0_OUTER_COUNT_START_OFF = 0x1baa8;
export const ROOM_AMBIENT_7F01C0_GETPLAYER_VA = 0x00417870;
export const ROOM_AMBIENT_7F01C0_LOOP_HEAD_VA = 0x007f0250;
export const ROOM_AMBIENT_7F01C0_PLAYER_2C_OFF = 0x2c;

export function roomAmbient7f01c0OuterCount(g1baac, g1baa8) {
  const diff = ((g1baac >>> 0) - (g1baa8 >>> 0)) | 0; /* s32 wrap sub */
  const count = diff >> 2;                             /* SAR */
  return {
    count_s32: count,
    count_u32: count >>> 0,
    entry: count !== 0 ? 1 : 0, /* test/jz ZERO-ONLY (negative ENTERS) */
  };
}

export function roomAmbient7f01c0OuterContinue(idx, g1baac, g1baa8) {
  const idxNext = ((idx >>> 0) + 1) >>> 0; /* inc edx u32 wrap */
  const diff = ((g1baac >>> 0) - (g1baa8 >>> 0)) | 0; /* s32 wrap */
  const count = diff >> 2;                             /* SAR */
  const countU32 = count >>> 0;
  return {
    count_fresh_s32: count,
    count_fresh_u32: countU32,
    idx_next: idxNext,
    continue_loop: idxNext < countU32 ? 1 : 0, /* cmp/jb UNSIGNED */
  };
}

export function roomAmbient7f01c0OuterPlayerGate(playerF2c) {
  return { skip_inner: (playerF2c | 0) !== 0 ? 1 : 0 }; /* cmp/jne dword */
}

/* v25s — FUN_007f01c0 PAYLOAD-SHAPE TAIL arg-prep oracle (PE
   0x7f0673..0x7f072e; peer v25q owns the f394 pair at 0x7f0662). The
   four bounds-dest shapes 0x7f0678/0x7f0692/0x7f06ac/0x7f06f4 assemble
   the 5-arg stdcall frame for host 0x6fd7c0 (ret 0x14, thiscall
   ecx=Game) at call site 0x7f070c. dest = v64 bounds enum (0 none,
   1=6f4, 2=6ac, 3=692, 4=678). edx_in echoed as arg4. dest-2 tail
   arg1: f4 tag == -14 (0xfffffff2 full dword) -> -0xf; else bit2 of
   f4_10_38 (shr 2; test al,1 low byte) -> -6 set / -2 clear.
   [Game+0x18318] stores: dest4 3, dest3 0, dest2 2, dest1 NONE. ABI
   UNCHANGED (64). */
export const ROOM_AMBIENT_7F01C0_PAYLOAD_CALL_VA = 0x007f070c;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_HOST_VA = 0x006fd7c0;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_HOST_RET = 0x14;
export const ROOM_AMBIENT_7F01C0_GAME_18318_OFF = 0x18318;
export const ROOM_AMBIENT_7F01C0_GAME_1831C_OFF = 0x1831c;
export const ROOM_AMBIENT_7F01C0_GAME_18328_OFF = 0x18328;
export const ROOM_AMBIENT_7F01C0_F4_F0_NEG14 = -14;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_678_STORE = 3;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_692_STORE = 0;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_STORE = 2;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_678_ARG1 = -2;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_692_ARG1 = -2;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_EQ = -0xf;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_BIT = -6;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_NOBIT = -2;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG2 = 2;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_6F4_ARG3 = 2;
export const ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5 = -1;

export function roomAmbient7f01c0PayloadBounds(s) {
  const dest = s.dest >>> 0;
  const edx = s.edx_in >>> 0;
  const fired = dest !== 0 ? 1 : 0;
  let a1 = 0, a2 = 0, a3 = 0, a4 = 0, a5 = 0;
  let storeVal = 0, storeOff = 0;
  switch (dest) {
    case 4: /* 0x7f0678 gate G: push -1,edx,0,3,-2 ; store 3 */
      a1 = ROOM_AMBIENT_7F01C0_PAYLOAD_678_ARG1;
      a2 = ROOM_AMBIENT_7F01C0_PAYLOAD_678_STORE;
      a3 = 0;
      a4 = edx;
      a5 = ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5;
      storeVal = ROOM_AMBIENT_7F01C0_PAYLOAD_678_STORE;
      storeOff = ROOM_AMBIENT_7F01C0_GAME_18318_OFF;
      break;
    case 3: /* 0x7f0692 gate F: push -1,edx,0,0,-2 ; store 0 */
      a1 = ROOM_AMBIENT_7F01C0_PAYLOAD_692_ARG1;
      a2 = ROOM_AMBIENT_7F01C0_PAYLOAD_692_STORE;
      a3 = 0;
      a4 = edx;
      a5 = ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5;
      storeVal = ROOM_AMBIENT_7F01C0_PAYLOAD_692_STORE;
      storeOff = ROOM_AMBIENT_7F01C0_GAME_18318_OFF;
      break;
    case 2: { /* 0x7f06ac gate E: f4 tag gate + bit2 sub-branch */
      let tailArg;
      if ((s.f4_f0 | 0) === ROOM_AMBIENT_7F01C0_F4_F0_NEG14) {
        tailArg = ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_EQ; /* -0xf */
      } else {
        const bit = (s.f4_10_38 >>> 2) & 1; /* shr 2 ; test al,1 */
        tailArg = bit !== 0
          ? ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_BIT   /* -6 */
          : ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_NOBIT; /* -2 */
      }
      a1 = tailArg;
      a2 = ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG2;
      a3 = 0;
      a4 = edx;
      a5 = ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5;
      storeVal = ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_STORE;
      storeOff = ROOM_AMBIENT_7F01C0_GAME_18318_OFF;
      break;
    }
    case 1: /* 0x7f06f4 gates A/D: push -1,edx,2,[G+1831c],[G+18328];
               NO 18318 store */
      a1 = s.game_18328 >>> 0;
      a2 = s.game_1831c >>> 0;
      a3 = ROOM_AMBIENT_7F01C0_PAYLOAD_6F4_ARG3;
      a4 = edx;
      a5 = ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5;
      storeVal = 0;
      storeOff = 0;
      break;
    default: /* dest 0: continue 0x7f051b, no payload call */
      break;
  }
  return {
    fired,
    shape: dest,
    arg1: a1 >>> 0,
    arg2: a2 >>> 0,
    arg3: a3 >>> 0,
    arg4: a4 >>> 0,
    arg5: a5 >>> 0,
    store_val: storeVal >>> 0,
    store_off: storeOff >>> 0,
    call_va: ROOM_AMBIENT_7F01C0_PAYLOAD_CALL_VA,
    host_va: ROOM_AMBIENT_7F01C0_PAYLOAD_HOST_VA,
    cont_va: ROOM_AMBIENT_7F01C0_CONTINUE_VA,
    epilogue_va: ROOM_AMBIENT_7F01C0_EPILOGUE_VA,
    ret_va: ROOM_AMBIENT_7F01C0_RET_VA,
  };
}

/* ---- v65r: Game::GetPlayer 0x00417870 BODY ----
   PE cpu-dump/00417870.txt. thiscall; index = STACK arg (ret 4).
   count = SAR((u32)(end-begin),2); empty (count==0) -> HOST fatal
   0xa112c0 (arg0 0x10 / arg1 0xb7e6bc) THEN RE-READ begin/end from
   [Game+0x1baa8]/[Game+0x1baac] (defect-class-1: post-call recapture);
   count2 re-derived from the recaptured pair; (u32)index < (u32)count2
   ? [begin_used + index*4] : [begin_used] (0x4178b4 jae UNSIGNED). */
export const ROOM_GET_PLAYER_417870_VA = 0x00417870;
export const ROOM_GET_PLAYER_417870_RET_VA = 0x004178bd;
export const ROOM_GET_PLAYER_417870_CLAMP_RET_VA = 0x004178c6;
export const ROOM_GET_PLAYER_417870_GAME_BEGIN_OFF = 0x1baa8;
export const ROOM_GET_PLAYER_417870_GAME_END_OFF = 0x1baac;
export const ROOM_GET_PLAYER_417870_FATAL_VA = 0x00a112c0;
export const ROOM_GET_PLAYER_417870_FATAL_ARG0 = 0x10;
export const ROOM_GET_PLAYER_417870_FATAL_ARG1_VA = 0x00b7e6bc;

/** v65r count oracle (PE 0x417886 sub eax,esi ; 0x417888 sar eax,2):
    (end-begin) as u32 wrap, then arithmetic shift right 2. */
export function roomGetPlayer417870Count(begin, end) {
  const diff = (end >>> 0) - (begin >>> 0); /* u32 wrap: JS ToInt32 on >> */
  return diff >> 2;
}

/** v65r empty oracle (PE 0x41788b test eax,eax ; jne skip): fatal iff
    count == 0. */
export function roomGetPlayer417870Empty(count) {
  return ((count | 0) === 0) ? 1 : 0;
}

/** v65r in-bounds oracle (PE 0x4178b2 cmp eax,edx ; 0x4178b4 jae clamp):
    UNSIGNED index < (u32)count. */
export function roomGetPlayer417870InBounds(index, count) {
  return (index >>> 0) < ((count | 0) >>> 0) ? 1 : 0;
}

/** v65r slot-address oracle: in-bounds -> begin + index*4 (0x4178b6
    [esi+eax*4]); clamp -> begin (0x4178c0 [esi], slot 0). */
export function roomGetPlayer417870SlotAddr(begin, index, count) {
  if (roomGetPlayer417870InBounds(index, count) === 1) {
    return ((begin >>> 0) + (((index >>> 0) * 4) >>> 0)) >>> 0;
  }
  return begin >>> 0;
}

/** v65r body plan oracle (1:1 replay of PE 0x417870..0x4178c6). The
    caller supplies the two memory samples ([begin_used] and
    [begin_used+index*4] values); result selects between them by the
    unsigned in-bounds gate. */
export function roomGetPlayer417870Plan({
  begin, end, index, re_read_begin, re_read_end,
  slot0_sample = 0, slot_idx_sample = 0,
}) {
  const countPre = roomGetPlayer417870Count(begin, end);
  const empty = roomGetPlayer417870Empty(countPre);
  const beginUsed = (empty === 1) ? re_read_begin >>> 0 : begin >>> 0;
  const endUsed = (empty === 1) ? re_read_end >>> 0 : end >>> 0;
  const countUsed = roomGetPlayer417870Count(beginUsed, endUsed);
  const inBounds = roomGetPlayer417870InBounds(index, countUsed);
  const slotAddr = roomGetPlayer417870SlotAddr(beginUsed, index, countUsed);
  const result = (inBounds === 1) ? slot_idx_sample >>> 0 : slot0_sample >>> 0;
  return {
    count_pre: countPre,
    empty,
    host_fatal: empty,
    begin_used: beginUsed,
    end_used: endUsed,
    count_used: countUsed,
    in_bounds: inBounds,
    slot_addr: slotAddr,
    result,
    result_known: 1,
    ret_va: (inBounds === 1) ? ROOM_GET_PLAYER_417870_RET_VA
                             : ROOM_GET_PLAYER_417870_CLAMP_RET_VA,
    head_va: ROOM_GET_PLAYER_417870_VA,
    clamp_ret_va: ROOM_GET_PLAYER_417870_CLAMP_RET_VA,
    fatal_va: ROOM_GET_PLAYER_417870_FATAL_VA,
  };
}

/* ---- v25q: 0x7f0544 range-hit tail (PE 0x7f0544..0x7f0673, INSIDE
   FUN_007f01c0; peer v25s owns 0x7f0673..0x7f072e). JS oracle mirror of
   isaac_room_range_hit_7f0544_eval. ABI UNCHANGED (64). ---- */
export const ROOM_RANGE_HIT_7F0544_VA = 0x7f0544;
export const ROOM_RANGE_HIT_7F0544_END_VA = 0x7f0673;
export const ROOM_RANGE_HIT_7F0544_EPILOGUE_VA = 0x7f0711;
export const ROOM_RANGE_HIT_7F0544_FAIL_VA = 0x7f072f;
export const ROOM_RANGE_HIT_7F0544_GAME_GLOBAL = 0xc71678;
export const ROOM_RANGE_HIT_7F0544_TLS_GLOBAL_VA = 0xc8108c;
export const ROOM_RANGE_HIT_7F0544_SEL_A_VA = 0xc810a0;
export const ROOM_RANGE_HIT_7F0544_CLAMP_MIN = -1;
export const ROOM_RANGE_HIT_7F0544_CLAMP_MAX = 7;
export const ROOM_RANGE_HIT_7F0544_SPLIT = -100;
export const ROOM_RANGE_HIT_7F0544_CMOV_TRUE = 0x12;
export const ROOM_RANGE_HIT_7F0544_F160_GATE = 0xf;
export const ROOM_RANGE_HIT_7F0544_SEL_GE = 3;
export const ROOM_RANGE_HIT_7F0544_OR_MASK_1 = 1;
export const ROOM_RANGE_HIT_7F0544_OR_MASK_20 = 0x20;
export const ROOM_RANGE_HIT_7F0544_HOST_705EE0_VA = 0x705ee0;
export const ROOM_RANGE_HIT_7F0544_HOST_7499A0_VA = 0x7499a0;
export const ROOM_RANGE_HIT_7F0544_HOST_740BC0_VA = 0x740bc0;
export const ROOM_RANGE_HIT_7F0544_HOST_6FD7C0_VA = 0x6fd7c0;
export const ROOM_RANGE_HIT_7F0544_HOST_AEF29D_VA = 0xaef29d;
export const ROOM_RANGE_HIT_7F0544_PAYLOAD_ARITY = 5;
export const ROOM_RANGE_HIT_7F0544_GETROOM_RET = 8;

export function roomRangeHit7f0544Eval(s) {
  const lane = s.lane >>> 0;
  const laneS = lane | 0; /* s32 view for the clamp compares */
  /* cmp edi,-1 ; jle SIGNED ; cmp edi,7 ; jl SIGNED. */
  let clampValue;
  if (laneS <= ROOM_RANGE_HIT_7F0544_CLAMP_MIN) {
    clampValue = ROOM_RANGE_HIT_7F0544_CLAMP_MIN;
  } else if (laneS < ROOM_RANGE_HIT_7F0544_CLAMP_MAX) {
    clampValue = laneS;
  } else {
    clampValue = ROOM_RANGE_HIT_7F0544_CLAMP_MAX;
  }
  /* cmp [slot+0x394],-1 ; jne — FULL dword. */
  const gateMinus1 = (s.f394_gate | 0) === -1 ? 1 : 0;
  /* cmp [0xc8108c],[peb+0xc] ; jg SIGNED. */
  const tlsFail = (s.tls_global | 0) > (s.tls_peb | 0) ? 1 : 0;
  /* cmp [G+0x1830c],3 ; jae UNSIGNED >= 3 -> 0xc810a0 else 16c8c. */
  const selLow = (s.game_1830c >>> 0) >= ROOM_RANGE_HIT_7F0544_SEL_GE
    ? 1 : 0;
  const chosen = selLow === 1 ? s.sel_a : s.sel_b;
  const selZero = (chosen >>> 0) === 0 ? 1 : 0;
  const devilFire = (gateMinus1 === 1 && tlsFail === 0 && selZero === 1)
    ? 1 : 0;
  const f160Eq = (s.slot_f160 >>> 0) === ROOM_RANGE_HIT_7F0544_F160_GATE
    ? 1 : 0;
  const forceAngel = f160Eq;
  const forceDevil = f160Eq === 0 ? 1 : 0;
  const st26548Mask = devilFire === 1
    ? (f160Eq === 1 ? ROOM_RANGE_HIT_7F0544_OR_MASK_1
                    : ROOM_RANGE_HIT_7F0544_OR_MASK_20)
    : 0;
  /* cmp eax,-0x64 ; jg SIGNED: > -100 -> direct (shape B). */
  const splitDirect = (s.f394_split | 0) > ROOM_RANGE_HIT_7F0544_SPLIT
    ? 1 : 0;
  const shapeA = splitDirect === 0 ? 1 : 0;
  /* POST-call re-read cmov (defect-class-1: f394_post, not split). */
  const cmovArg3 = (s.f394_post | 0) === ROOM_RANGE_HIT_7F0544_SPLIT
    ? ROOM_RANGE_HIT_7F0544_CMOV_TRUE : 0;
  const lane3 = lane & 3;
  let payloadA1, payloadA3, payloadA5;
  if (shapeA === 1) {
    payloadA1 = s.room_f00 >>> 0;
    payloadA3 = cmovArg3;
    payloadA5 = s.room_f0c >>> 0;
  } else {
    payloadA1 = (s.f394_split | 0) >>> 0; /* s32 bits as u32 */
    payloadA3 = 0;
    payloadA5 = 0xffffffff; /* -1 dangling hoisted push */
  }
  return {
    clamp_value: clampValue,
    gate_minus1: gateMinus1,
    tls_fail: tlsFail,
    fail_va: ROOM_RANGE_HIT_7F0544_FAIL_VA,
    sel_low: selLow,
    sel_zero: selZero,
    devil_fire: devilFire,
    force_angel: forceAngel,
    force_devil: forceDevil,
    devil_va: ROOM_RANGE_HIT_7F0544_HOST_7499A0_VA,
    st2654c_flag: devilFire,
    st26548_mask: st26548Mask,
    split_direct: splitDirect,
    shape_a: shapeA,
    getroom_va: ROOM_RANGE_HIT_7F0544_HOST_740BC0_VA,
    getroom_arg1: (s.f394_split | 0) >>> 0,
    getroom_arg2: 0xffffffff,
    cmov_arg3: cmovArg3,
    payload_va: ROOM_RANGE_HIT_7F0544_HOST_6FD7C0_VA,
    payload_a1: payloadA1,
    payload_a2: lane3,
    payload_a3: payloadA3,
    payload_a4: s.player >>> 0,
    payload_a5: payloadA5,
    payload_count: ROOM_RANGE_HIT_7F0544_PAYLOAD_ARITY,
    st68d70_flag: (gateMinus1 === 1 && tlsFail === 1) ? 0 : 1,
    head_va: ROOM_RANGE_HIT_7F0544_HOST_705EE0_VA,
    head_arg: lane,
    end_va: ROOM_RANGE_HIT_7F0544_END_VA,
    epilogue_va: ROOM_RANGE_HIT_7F0544_EPILOGUE_VA,
  };
}

/* ---- v25t: FUN_007f01c0 TLS-fail RE-ENTRY oracle (PE 0x7f072f..
   0x7f077b; entered from the v25q TLS check `jg 0x7f072f` @0x7f0598).
   JS mirror of isaac_room_ambient_7f01c0_fail_reentry. The four host
   thunks (0xaef29d claim, 0x6ef590 RoomDescriptor::constructor ecx=
   0xc81090, 0xaef5af validate 0xb15b30, 0xaef253 release) stay host;
   this law lands the claim/re-check decisions and the two SEH funclet
   state stores (0 / 0xffffffff) reported for the typed-host transport.
   ABI 66. ---- */
export const ROOM_AMBIENT_7F01C0_FAIL_REENTRY_VA = 0x7f072f;
export const ROOM_AMBIENT_7F01C0_FAIL_RECHECK_VA = 0x7f073c;
export const ROOM_AMBIENT_7F01C0_FAIL_END_VA = 0x7f077b;
export const ROOM_AMBIENT_7F01C0_FAIL_TLS_GLOBAL_VA = 0xc8108c;
export const ROOM_AMBIENT_7F01C0_FAIL_CLAIM_VA = 0xaef29d;
export const ROOM_AMBIENT_7F01C0_FAIL_CTOR_VA = 0x6ef590;
export const ROOM_AMBIENT_7F01C0_FAIL_CTOR_ECX = 0xc81090;
export const ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_VA = 0xaef5af;
export const ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_ARG_VA = 0xb15b30;
export const ROOM_AMBIENT_7F01C0_FAIL_RELEASE_VA = 0xaef253;
export const ROOM_AMBIENT_7F01C0_FAIL_CONT_VA = 0x7f05a0;
export const ROOM_AMBIENT_7F01C0_FAIL_REJOIN_GAME_VA = 0xc71678;

export function roomAmbient7f01c0FailReentry(s) {
  const tlsPre = s.tls_pre | 0;   /* s32 [0xc8108c] pre-claim-call */
  const tlsPost = s.tls_post | 0; /* s32 POST-call snapshot (0x7f073c) */
  /* 0xaef29d contract: cmp [esi],0 ; jne — *arg == 0 -> -1 claim. */
  const claim = tlsPre === 0 ? 1 : 0;
  /* 0x7f073c cmp [0xc8108c],-1 ; jne 0x7f05a0 — FULL dword. */
  const failTail = tlsPost === -1 ? 1 : 0;
  return {
    claim,
    fail_tail: failTail,
    /* 0x7f074e [ebp-4] = 0 ; 0x7f0767 [ebp-4] = 0xffffffff (SEH
       funclet state; fires iff the tail runs). */
    state_enter: 0,
    state_exit: failTail === 1 ? 0xffffffff : 0,
    fail_va: ROOM_AMBIENT_7F01C0_FAIL_REENTRY_VA,
    recheck_va: ROOM_AMBIENT_7F01C0_FAIL_RECHECK_VA,
    claim_va: ROOM_AMBIENT_7F01C0_FAIL_CLAIM_VA,
    claim_arg: ROOM_AMBIENT_7F01C0_FAIL_TLS_GLOBAL_VA,
    ctor_va: ROOM_AMBIENT_7F01C0_FAIL_CTOR_VA,
    ctor_ecx: ROOM_AMBIENT_7F01C0_FAIL_CTOR_ECX,
    validate_va: ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_VA,
    validate_arg: ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_ARG_VA,
    release_va: ROOM_AMBIENT_7F01C0_FAIL_RELEASE_VA,
    cont_va: ROOM_AMBIENT_7F01C0_FAIL_CONT_VA,
    rejoin_edx_game_va: ROOM_AMBIENT_7F01C0_FAIL_REJOIN_GAME_VA,
    end_va: ROOM_AMBIENT_7F01C0_FAIL_END_VA,
  };
}

/* ---- v67a: FUN_007f7a40 (record 26 roomTriggerClearAudioNonGreed; PE
   0x7f7a40..0x7f8189, ret 8, thiscall, 2 byte-gated stack args).
   JS mirrors of isaac_room_trigger_clear_audio_7f7a40_gates / _fail.
   All sound calls stay HOST; these laws land the pure DECISION
   SURFACE (early aborts, play flag, stage-5/6 al, success/PLAY gate,
   fail-path gate chain incl. the 0x740bc0 POST-call snapshot, the PURE
   slot-hash search, PLAY2 + door-branch decisions, a1 tail gate).
   ABI 67. ---- */
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_VA = 0x7f7a40;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_RET_VA = 0x7f7bd5;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_FAIL_VA = 0x7f7bd8;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_END_VA = 0x7f8189;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_TAIL_VA = 0x7f7e3e;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_GLOBAL = 0xc71678;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_OBJ_GLOBAL = 0xc7169c;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_QWORD_VA = 0xb1f570;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_DWORD_VA = 0xb1f578;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_SHIFT_LO = 2;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_SHIFT_MID = 9;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_SHIFT_HI = 15;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_MASK = 7;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_ARR_OFF = 0x724;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_F394_OFF = 0x394;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_F10_OFF = 0x10;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_SEED_OFF = 0x5c;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_BM2_OFF = 0x18;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_BM1_OFF = 0x38;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_18304_OFF = 0x18304;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_182D0_OFF = 0x182d0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_18314_OFF = 0x18314;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26584_OFF = 0x26584;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_2654C_OFF = 0x2654c;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26550_OFF = 0x26550;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26589_OFF = 0x26589;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26630_OFF = 0x26630;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_OBJ_2C7_OFF = 0x2c7;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_OBJ_1E3_OFF = 0x1e3;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_TYPE5_GATE = 5;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SUBTYPE59_GATE = 0x59;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_STAGE_BIT_MASK = 0x10000;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_394_VALUE = 0xfffffff6;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74EA50_VA = 0x74ea50;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_706940_VA = 0x706940;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_6F9400_VA = 0x6f9400;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_6F95A0_VA = 0x6f95a0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_7EEA90_VA = 0x7eea90;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74BBA0_VA = 0x74bba0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710FA0_VA = 0x710fa0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_740BC0_VA = 0x740bc0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74BAE0_VA = 0x74bae0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74E9B0_VA = 0x74e9b0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_70D360_VA = 0x70d360;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_417870_VA = 0x417870;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710480_VA = 0x710480;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710DD0_VA = 0x710dd0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_70FB60_VA = 0x70fb60;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_67F1D0_VA = 0x67f1d0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_COS_VA = 0x41d540;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_SIN_VA = 0x41d520;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_GENRAND_VA = 0x6eef60;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_SPAWN_428B20_VA = 0x428b20;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_FATAL_VA = 0xa112c0;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_FATAL_ARG0 = 0xb6bf54;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_7EEA90_ARG = 1;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_74BBA0_ARG = 3;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY2_ARG1 = 1;
export const ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GETPLAYER_ARG = 0;

export function roomTriggerClearAudio7f7a40Va() {
  return ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_VA;
}

export function roomTriggerClearAudio7f7a40Gates(s) {
  const a2 = (s.a2 | 0) & 0xff;
  const skipEarly = a2 !== 0 ? 1 : 0;
  const abort2c = a2 === 0 && (s.game_26584 >>> 0) === 0x2c ? 1 : 0;
  const type5_59 =
    a2 === 0 && (s.room_type_8 >>> 0) === 5 &&
    (s.desc_f10_f10 >>> 0) === 0x59 ? 1 : 0;
  const fire74ea50 = type5_59;
  const abort74ea50 = type5_59 === 1 && (s.h_74ea50 | 0) !== 0 ? 1 : 0;
  const stageSigned = (s.game_stage_0 | 0);
  const stageGate = a2 === 0 && stageSigned >= 1 && stageSigned <= 6
    ? 1 : 0;
  const abortStageBit =
    stageGate === 1 && ((s.game_2654c >>> 0) & 0x10000) !== 0 ? 1 : 0;
  const objAtB03 =
    ((s.obj_2c7 >>> 0) & 0xff) !== 0 ||
    ((s.obj_8 >>> 0) === 2 && (s.game_present >>> 0) !== 0 &&
      ((s.game_26630 >>> 0) > 0 || ((s.game_26589 >>> 0) & 0xff) !== 0))
      ? 1 : 0;
  const play =
    (s.h_706940_80 >>> 0) === 3 ||
    (objAtB03 === 1 && (s.game_26584 >>> 0) === 0 &&
      (s.game_26630 >>> 0) <= 0)
      ? 1 : 0;
  let al = 0;
  if ((s.game_stage_0 | 0) === 6) {
    al = 1;
  } else if ((s.game_stage_0 | 0) === 5) {
    const x = (~(s.h_6f95a0 | 0)) &
      ((s.h_6f9400 | 0) | (s.game_26550 | 0) | (s.game_c | 0));
    al = (x & 2) !== 0 ? 1 : 0;
  }
  const gateMain =
    play === 1 && al === 1 && (s.game_18304 | 0) === (s.game_182d0 | 0) &&
    (s.game_4 | 0) !== 4 && (s.game_4 | 0) !== 5 ? 1 : 0;
  const success = gateMain === 1 && (s.room_728 >>> 0) === 0 ? 1 : 0;
  const abort728 = gateMain === 1 && (s.room_728 >>> 0) !== 0 ? 1 : 0;
  const failPath =
    play === 0 || al === 0 || (s.game_18304 | 0) !== (s.game_182d0 | 0) ||
    (s.game_4 | 0) === 4 || (s.game_4 | 0) === 5 ? 1 : 0;
  const playFire = success;
  const anyAbort = abort2c === 1 || abort74ea50 === 1 ||
    abortStageBit === 1 || abort728 === 1;
  const exitKind = anyAbort ? 0 : (playFire === 1 ? 1 : 2);
  return {
    skip_early: skipEarly,
    abort_2c: abort2c,
    type5_59,
    fire_74ea50: fire74ea50,
    abort_74ea50: abort74ea50,
    stage_gate: stageGate,
    abort_stage_bit: abortStageBit,
    play,
    al,
    success,
    abort_728: abort728,
    fail_path: failPath,
    play_fire: playFire,
    exit_kind: exitKind,
    call_7eea90_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_7EEA90_VA,
    call_7eea90_arg: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_7EEA90_ARG,
    call_74bba0_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74BBA0_VA,
    call_74bba0_arg: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_74BBA0_ARG,
    store_394_value: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_394_VALUE,
    call_710fa0_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710FA0_VA,
    call_710fa0_arg1: s.room_f10_f8 >>> 0,
    call_710fa0_arg2: s.r74bba0_f10_f8 >>> 0,
    ret_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_RET_VA,
    fail_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_FAIL_VA,
    end_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_END_VA,
  };
}

export function roomTriggerClearAudio7f7a40Fail(s) {
  const a2 = (s.a2 | 0) & 0xff;
  const a1 = (s.a1 | 0) & 0xff;
  const fire740bc0 = a2 === 0 ? 1 : 0;
  const abort740bc0 =
    fire740bc0 === 1 && (s.h_740bc0_ret_8 | 0) !== (s.game_18314 | 0) ? 1 : 0;
  const gate706940b =
    a2 === 0 && ((s.game_26584 >>> 0) !== 0 || (s.game_26630 >>> 0) > 0)
      ? 1 : 0;
  const abort706940b =
    gate706940b === 1 && (s.h_706940b_80 | 0) !== 2 ? 1 : 0;
  const gateObj = a2 === 0 && ((s.obj_1e3 >>> 0) & 0xff) === 0 ? 1 : 0;
  const abortObj =
    gateObj === 1 &&
    ((s.obj_8 >>> 0) !== 2 ||
      ((s.game_26630 >>> 0) <= 0 && ((s.game_26589 >>> 0) & 0xff) === 0))
      ? 1 : 0;
  const abort74bae0Zero = (s.h_74bae0 | 0) === 0 ? 1 : 0;
  const gate74e9b0 = a2 === 0 && (s.h_74bae0 | 0) === 4 ? 1 : 0;
  const abort74e9b0 = gate74e9b0 === 1 && (s.h_74e9b0 | 0) !== 0 ? 1 : 0;
  const seedFatal = (s.slot_seed >>> 0) === 0 ? 1 : 0;
  const seed = s.slot_seed >>> 0;
  const t0 = seed ^ (seed >>> 2);
  const u0 = (t0 ^ (t0 << 9)) >>> 0;
  const hash = (u0 ^ (u0 >>> 15)) >>> 0;
  let slot = hash & 7;
  let found = 0;
  let loopCount = 0;
  for (let i = 0; i < 8 && found === 0; i++) {
    const mask = 1 << (slot & 31);
    const bm1Bit = ((s.bm1 >>> 0) & mask) !== 0 ? 1 : 0;
    const slotOcc = (s[`slot_occ${slot & 7}`] >>> 0);
    const bm2Bit = ((s.bm2 >>> 0) & mask) !== 0 ? 1 : 0;
    if (bm1Bit === 1 && slotOcc === 0 && bm2Bit === 0) {
      found = 1;
      break;
    }
    slot = ((slot + 1) | 0) & 7;
    loopCount++;
  }
  const slotNegative = slot >= 0x80000000 ? 1 : 0;
  const failAlive =
    abort740bc0 === 0 && abort706940b === 0 && abortObj === 0 &&
    abort74bae0Zero === 0 && abort74e9b0 === 0 && seedFatal === 0 &&
    found === 1 ? 1 : 0;
  const fire74bba0b = failAlive;
  const slotOccFinal = s[`slot_occ${slot & 7}`] >>> 0;
  const fire7eea90b = failAlive === 1 && slotOccFinal === 0 ? 1 : 0;
  const gate80 = (s.h_706940b_80 | 0) === 2 ? 1 : 0;
  const slot8Gate = gate80 === 1 && (s.slot_8 | 0) !== 8 ? 1 : 0;
  const fire70d360 = slot8Gate;
  const gate70d360_4 = slot8Gate === 1 && (s.h_70d360 | 0) !== 4 ? 1 : 0;
  const pathB =
    gate70d360_4 === 1 &&
    ((s.slot_8 | 0) === 1 || (s.slot_8 | 0) === 4 || (s.slot_8 | 0) === 2)
      ? 1 : 0;
  const a1Gate = a1 === 0 ? 1 : 0;
  const anyAbort = abort740bc0 | abort706940b | abortObj | abort74bae0Zero |
    abort74e9b0 | seedFatal | slotNegative | (1 - found);
  return {
    fire_740bc0: fire740bc0,
    call_740bc0_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_740BC0_VA,
    abort_740bc0: abort740bc0,
    gate_706940b: gate706940b,
    abort_706940b: abort706940b,
    gate_obj: gateObj,
    abort_obj: abortObj,
    abort_74bae0_zero: abort74bae0Zero,
    gate_74e9b0: gate74e9b0,
    abort_74e9b0: abort74e9b0,
    seed_fatal: seedFatal,
    fatal_va: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_FATAL_VA,
    slot_hash: hash,
    slot,
    found,
    loop_count: loopCount,
    slot_negative: slotNegative,
    fire_74bba0b: fire74bba0b,
    call_74bba0b_arg: s.h_74bae0 >>> 0,
    fire_7eea90b: fire7eea90b,
    call_7eea90b_arg: slot,
    store_394_value: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_394_VALUE,
    fire_710fa0b: fire74bba0b,
    call_710fa0b_arg1: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY2_ARG1,
    call_710fa0b_arg2: s.r74bba0b_f10_f8 >>> 0,
    gate_80: gate80,
    slot8_gate: slot8Gate,
    fire_70d360: fire70d360,
    gate_70d360_4: gate70d360_4,
    path_b: pathB,
    fire_417870: gate70d360_4,
    call_417870_arg: ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GETPLAYER_ARG,
    fire_710480: gate70d360_4,
    fire_710dd0: gate70d360_4 === 1 && pathB === 0 ? 1 : 0,
    fire_70fb60: gate70d360_4 === 1 && pathB === 0 ? 1 : 0,
    a1_gate: a1Gate,
    tail_fire: a1 !== 0 ? 1 : 0,
    tail_loop_count: ((s.genrand_tail >>> 0) & 3) + 5,
    ret: anyAbort !== 0 ? 0 : 1,
  };
}

/* ==================================================================== */
/* v68 — FUN_007f8190 (PE 0x7f8190..0x7f83a3, ret 4, thiscall, ONE stack */
/* arg byte-gated, SEH 0xb012c7; LIVE callers 0x73ee03/0x761da6; next    */
/* 0x7f83b0 record-27 audio stays host). HEAD GATE (LOW-BYTE arg; FULL-  */
/* dword this8; owner HOST blob) -> SLOT LAW (all SIGNED) -> SPAWN/SLOT  */
/* PATH (SIGNED) -> SIGNED idiv + tile pos f32 + 8-arg create frame;     */
/* bounds/range/collision gates + alloc/ctor/vtable/store laws. Tile    */
/* f32 constants 40.0f @0xbaa904 / 120.0f @0xbaaa00 (same as v63).       */

export const ROOM_8190_VA = 0x007f8190;
export const ROOM_8190_RET_VA = 0x007f83a3;
export const ROOM_8190_NEXT_VA = 0x007f83b0;
export const ROOM_8190_SEH_HANDLER_VA = 0x00b012c7;
export const ROOM_8190_GAME_GLOBAL = 0x00c71678;
export const ROOM_8190_OBJ_GLOBAL = 0x00c7169c;
export const ROOM_8190_OWNER_HOST_VA = 0x009be080;
export const ROOM_8190_OWNER_COLLECTIBLE = 0x25a;
export const ROOM_8190_OWNER_RNG_OFF = 0x1baa8;
export const ROOM_8190_GENRAND_VA = 0x006eef60;
export const ROOM_8190_CREATE_HOST_VA = 0x006fe410;
export const ROOM_8190_CREATE_TYPE = 0x3e8;
export const ROOM_8190_CREATE_VARIANT = 0x9c;
export const ROOM_8190_CREATE_POS_VEC_VA = 0x00c7b640;
export const ROOM_8190_CREATE_ARITY = 8;
export const ROOM_8190_SFX_ID = 0x394;
export const ROOM_8190_SFX_PRE_VA = 0x00956780;
export const ROOM_8190_SFX_PLAY_VA = 0x0092dc30;
export const ROOM_8190_SFX_PLAY_THIS_OFF = 0x2a324;
export const ROOM_8190_FATAL_VA = 0x00a112c0;
export const ROOM_8190_FATAL_ARG0 = 0x00b6c138;
export const ROOM_8190_SLOT_FATAL_MAX = 0x1c0;
export const ROOM_8190_SLOT_SKIP_MAX = 0x1bf;
export const ROOM_8190_GRID_HOST_VA = 0x007f0800;
export const ROOM_8190_ALLOC_HOST_VA = 0x00a0f4c0;
export const ROOM_8190_ALLOC_ARG = 0x154;
export const ROOM_8190_CTOR_HOST_VA = 0x00709c40;
export const ROOM_8190_INIT_HOST_VA = 0x00709db0;
export const ROOM_8190_VTABLE = 0x00b7da10;
export const ROOM_8190_SUBTYPE = 0x12;
export const ROOM_8190_SLOT_ARR_OFF = 0x24;
export const ROOM_8190_SLOT_STRIDE = 4;
export const ROOM_8190_OBJ_F8_VAL = 2;
export const ROOM_8190_OBJ_F18_VAL = 0;
export const ROOM_8190_POS_X_VA = 0x00baa904;
export const ROOM_8190_POS_X_BITS = 0x42200000;
export const ROOM_8190_POS_Y_VA = 0x00baaa00;
export const ROOM_8190_POS_Y_BITS = 0x42f00000;

/** Head ret0 law (0x7f81ba..0x7f81fe): LOW-BYTE arg gate. */
export function room8190HeadRet0(arg, this8, owner25a, this4_0) {
  const argByte = (arg >>> 0) & 0xff;
  if (argByte !== 0) return 0;                 /* byte != 0 -> proceed */
  if ((this8 >>> 0) !== 2) return 1;
  if ((owner25a >>> 0) !== 0) return 0;
  return (this4_0 | 0) >= 0 ? 1 : 0;
}

/** Slot law (0x7f8201..0x7f823b), all SIGNED. */
export function room8190SlotLaw(c, f10, raw48) {
  const cs = c | 0, f10s = f10 | 0;
  let slot = (cs > 0xa && f10s > 1) ? ((cs + 0xa) | 0) : -1;
  if ((raw48 >>> 0) === 6) {
    if (cs > 0x14 && f10s > 2) {
      slot = ((cs + 0xa) * 2) | 0;
    } else {
      slot = -1;
    }
  }
  return slot;
}

/** Path gate (0x7f823b): SPAWN iff (int32)[*this4] < 0. */
export function room8190SpawnPath(this4_0) {
  return (this4_0 | 0) < 0 ? 1 : 0;
}

/** SIGNED idiv slot / width (0x7f824f cdq/idiv; width != 0). */
export function room8190TileDivmod(slot, width) {
  const s = slot | 0, w = width | 0;
  return {
    quot: Math.trunc(s / w) | 0,
    rem: (s - Math.trunc(s / w) * w) | 0,
  };
}

/** Tile pos x: f32((float)rem * 40.0f) + 40.0f. */
export function room8190TilePosX(rem) {
  const scale = _f32Value(ROOM_8190_POS_X_BITS);
  return Math.fround(Math.fround(Math.fround(rem) * scale) + scale);
}

/** Tile pos y: f32((float)quot * 40.0f) + 120.0f. */
export function room8190TilePosY(quot) {
  const scale = _f32Value(ROOM_8190_POS_X_BITS);
  const base = _f32Value(ROOM_8190_POS_Y_BITS);
  return Math.fround(Math.fround(Math.fround(quot) * scale) + base);
}

/** 8-arg create frame (0x7f8255..0x7f828b): constants + a6=rng. */
export function room8190CreateFrame(index, rng) {
  const frame = [
    ROOM_8190_CREATE_TYPE,
    ROOM_8190_CREATE_VARIANT,
    0,                              /* a2 pos_ptr: runtime frame local */
    ROOM_8190_CREATE_POS_VEC_VA,
    0,
    0,
    rng >>> 0,
    0,
  ];
  return {
    a0_type: frame[0],
    a1_variant: frame[1],
    a2_pos_ptr: frame[2],
    a3_posvec: frame[3],
    a4_zero: frame[4],
    a5_zero: frame[5],
    a6_rng: frame[6],
    a7_zero: frame[7],
    arity: ROOM_8190_CREATE_ARITY,
    host_va: ROOM_8190_CREATE_HOST_VA,
    slot: (index >>> 0) < 8 ? frame[index] : 0,
  };
}

/** Slot-path gates (0x7f82f4..0x7f833e): bounds/range/collision. */
export function room8190SlotGates(slot, gridcoll) {
  const s = slot | 0;
  const uSlot = s >>> 0;
  const fatalBounds =
    (s < 0 || uSlot >= ROOM_8190_SLOT_FATAL_MAX) ? 1 : 0;
  const skipRange = uSlot > ROOM_8190_SLOT_SKIP_MAX ? 1 : 0;
  const skipCollision = (gridcoll | 0) > 0 ? 1 : 0;
  return {
    fatal_bounds: fatalBounds,
    skip_range: skipRange,
    skip_collision: skipCollision,
    alloc_needed: skipRange === 0 && skipCollision === 0 ? 1 : 0,
    grid_host_va: ROOM_8190_GRID_HOST_VA,
    alloc_host_va: ROOM_8190_ALLOC_HOST_VA,
    alloc_arg: ROOM_8190_ALLOC_ARG,
    ctor_host_va: ROOM_8190_CTOR_HOST_VA,
    init_host_va: ROOM_8190_INIT_HOST_VA,
    vtable: ROOM_8190_VTABLE,
    subtype: ROOM_8190_SUBTYPE,
    slot_off: ROOM_8190_SLOT_ARR_OFF,
    slot_stride: ROOM_8190_SLOT_STRIDE,
    obj_f8_val: ROOM_8190_OBJ_F8_VAL,
    obj_f18_val: ROOM_8190_OBJ_F18_VAL,
  };
}

/* ------------------------------------------------------------------ v69 ---
   FUN_007f83b0 record-27 trigger-clear audio "always" body (PE
   0x7f83b0..0x7f92ab). Family-side mirror of the wave-18 slice law
   gameUpdateSliceRoomTriggerClearAudioMusic. Section-table verified
   constants; f32 math bit-exact via _f32Value/Math.fround. */

export const ROOM_TCA83B0_VA = 0x007f83b0;
export const ROOM_TCA83B0_RET_VA = 0x007f8506;
export const ROOM_TCA83B0_EPILOGUE_VA = 0x007f84e9;
export const ROOM_TCA83B0_END_VA = 0x007f92b0;
export const ROOM_TCA83B0_SEH_HANDLER_VA = 0x00b01315;
export const ROOM_TCA83B0_GAME_GLOBAL = 0x00c71678;
export const ROOM_TCA83B0_OBJ_GLOBAL = 0x00c7169c;
export const ROOM_TCA83B0_GAME_SEED_OFF = 0x182e4;
export const ROOM_TCA83B0_GAME_FLAG_OFF = 9;
export const ROOM_TCA83B0_GAME_18304_OFF = 0x18304;
export const ROOM_TCA83B0_GAME_18314_OFF = 0x18314;
export const ROOM_TCA83B0_GAME_CHAPTER_OFF = 4;
export const ROOM_TCA83B0_GAME_26554_OFF = 0x26554;
export const ROOM_TCA83B0_SHIFT_QWORD_VA = 0x00b1f594;
export const ROOM_TCA83B0_SHIFT_LO = 2;
export const ROOM_TCA83B0_SHIFT_MID = 0x15;
export const ROOM_TCA83B0_SHIFT_HI = 9;
export const ROOM_TCA83B0_SCALE_VA = 0x00ba9ff0;
export const ROOM_TCA83B0_SCALE_BITS = 0x2f7ffffe;
export const ROOM_TCA83B0_SCALE_POW2M32_VA = 0x00ba9ff4;
export const ROOM_TCA83B0_SCALE_POW2M32_BITS = 0x2f800000;
export const ROOM_TCA83B0_ONE_VA = 0x00baa454;
export const ROOM_TCA83B0_ONE_BITS = 0x3f800000;
export const ROOM_TCA83B0_VOL_MUL_VA = 0x00baa784;
export const ROOM_TCA83B0_VOL_MUL_BITS = 0x40a00000;
export const ROOM_TCA83B0_PITCH_MUL_VA = 0x00baa704;
export const ROOM_TCA83B0_PITCH_MUL_BITS = 0x4048f5c3;
export const ROOM_TCA83B0_SPEED_MUL_VA = 0x00baa87c;
export const ROOM_TCA83B0_SPEED_MUL_BITS = 0x41a00000;
export const ROOM_TCA83B0_FLOAT10_VA = 0x00baa81c;
export const ROOM_TCA83B0_FLOAT10_BITS = 0x41200000;
export const ROOM_TCA83B0_FLOAT2_VA = 0x00baa630;
export const ROOM_TCA83B0_FLOAT2_BITS = 0x40000000;
export const ROOM_TCA83B0_NEG1_VA = 0x00baad50;
export const ROOM_TCA83B0_NEG1_BITS = 0xbf800000;
export const ROOM_TCA83B0_SIGN_TABLE_VA = 0x00bacb00;
export const ROOM_TCA83B0_SIGN_TABLE_HI_BITS = 0x41f0000000000000;
export const ROOM_TCA83B0_SIGN_MASK_VA = 0x00bacb70;
export const ROOM_TCA83B0_SIGN_MASK_BITS = 0x80000000;
export const ROOM_TCA83B0_FATAL_VA = 0x00a112c0;
export const ROOM_TCA83B0_FATAL_ARG0 = 0x00b6bf54;
export const ROOM_TCA83B0_FATAL_ARG1 = 0x10;
export const ROOM_TCA83B0_GATE_749830_VA = 0x00749830;
export const ROOM_TCA83B0_ROOMIDX_HOST_VA = 0x00740bc0;
export const ROOM_TCA83B0_VALUE_LEAF_VA = 0x007f92b0;
export const ROOM_TCA83B0_OWNER_HOST_VA = 0x009be080;
export const ROOM_TCA83B0_OWNER_COLLECTIBLE = 0x1f2;
export const ROOM_TCA83B0_OWNER_RNG_OFF = 0x1baa8;
export const ROOM_TCA83B0_RANDOMINT_HOST_VA = 0x007e9020;
export const ROOM_TCA83B0_RANDOMINT_BOUND = 8;
export const ROOM_TCA83B0_RANDOMINT_QWORD_VA = 0x00b1f540;
export const ROOM_TCA83B0_RANDOMINT_DWORD_VA = 0x00b1f548;
export const ROOM_TCA83B0_SORT_HOST_VA = 0x005cc070;
export const ROOM_TCA83B0_VEC_INIT_VA = 0x0042c880;
export const ROOM_TCA83B0_VEC_PUSH_VA = 0x0042c920;
export const ROOM_TCA83B0_DOOR_CREATE_VA = 0x007eea90;
export const ROOM_TCA83B0_DOOR_OP_A_VA = 0x00710fa0;
export const ROOM_TCA83B0_DOOR_OP_B_VA = 0x00710dd0;
export const ROOM_TCA83B0_DOOR_MARK_OFF = 0x394;
export const ROOM_TCA83B0_DOOR_MARK_BITS = 0xffffffff;
export const ROOM_TCA83B0_GENRAND_VA = 0x006eef60;
export const ROOM_TCA83B0_COS_VA = 0x0041d540;
export const ROOM_TCA83B0_SIN_VA = 0x0041d520;
export const ROOM_TCA83B0_SPAWN_428B20_VA = 0x00428b20;
export const ROOM_TCA83B0_ITEM_FACTORY_VA = 0x00af08b1;
export const ROOM_TCA83B0_MUSIC_GATE_44BFB0_VA = 0x0044bfb0;
export const ROOM_TCA83B0_MUSIC_TAIL_7499A0_VA = 0x007499a0;
export const ROOM_TCA83B0_SFX_PRE_VA = 0x00956780;
export const ROOM_TCA83B0_SFX_PLAY_VA = 0x0092dc30;
export const ROOM_TCA83B0_SFX_PLAY_THIS_OFF = 0x2a324;
export const ROOM_TCA83B0_SFX_ID_A = 0x140;
export const ROOM_TCA83B0_SFX_ID_B = 0x17;
export const ROOM_TCA83B0_SFX_VOL_BITS = 0x3f800000;
export const ROOM_TCA83B0_SFX_DELAY = 2;
export const ROOM_TCA83B0_SFX_LOOP = 0;
export const ROOM_TCA83B0_SFX_PITCH_BITS = 0x3f800000;
export const ROOM_TCA83B0_SFX_PAN = 0;
export const ROOM_TCA83B0_TILE_40_VA = 0x00baa904;
export const ROOM_TCA83B0_TILE_40_BITS = 0x42200000;
export const ROOM_TCA83B0_TILE_120_VA = 0x00baaa00;
export const ROOM_TCA83B0_TILE_120_BITS = 0x42f00000;
export const ROOM_TCA83B0_ITEM_F474_OFF = 0x474;
export const ROOM_TCA83B0_ITEM_F45C_OFF = 0x45c;
export const ROOM_TCA83B0_ITEM_F460_OFF = 0x460;
export const ROOM_TCA83B0_ITEM_ID_BASE = 0x1e;
export const ROOM_TCA83B0_ITEM_ID_DIV = 0xa;
export const ROOM_TCA83B0_ITEM_COUNT_ADD = 5;
export const ROOM_TCA83B0_ITEM_COUNT_MASK = 3;
export const ROOM_TCA83B0_SPAWN_TYPE = 0x3e8;
export const ROOM_TCA83B0_SPAWN_VARIANT = 0x3b;
export const ROOM_TCA83B0_CHAPTER_4 = 4;
export const ROOM_TCA83B0_CHAPTER_5 = 5;
export const ROOM_TCA83B0_CHAPTER_CAP = 0xd;
export const ROOM_TCA83B0_DOOR_MIN = 2;

/** u32 -> f32 (cvtdq2pd SIGNED + addsd [edx*8+0xbacb00] 2^32 fix +
    cvtpd2ps). Exact mirror of the PE helper. */
function _tca83b0U32ToF32(bits) {
  let wide = (bits >>> 0) | 0;
  if ((bits >>> 31) !== 0) wide += 4294967296;
  return Math.fround(wide);
}

/** L2 rnd f32 (0x7f8495..0x7f84cd): xorshift32 {2,0x15,9} + sign-fix +
    mulss 0x2f7ffffe. Returns the float rnd (not bits). */
export function roomTca83b0RndF32(seed) {
  let t = (seed >>> 0);
  t ^= t >>> ROOM_TCA83B0_SHIFT_LO;
  t = (t ^ (t << ROOM_TCA83B0_SHIFT_MID)) >>> 0;
  t = (t ^ (t >>> ROOM_TCA83B0_SHIFT_HI)) >>> 0;
  const unit = _tca83b0U32ToF32(t);
  return Math.fround(unit * _f32Value(ROOM_TCA83B0_SCALE_BITS));
}

/** L1 music (0x7f8453..0x7f84e1): arg2 force || value > rnd ||
    value >= 1.0f. NaN -> comiss CF -> NOT taken -> 0. */
export function roomTca83b0Music(arg2, valueBits, seed) {
  if ((arg2 >>> 0) & 0xff) return 1; /* jne 0x7f8509 (LOW byte) */
  const value = _f32Value(valueBits >>> 0);
  const rnd = roomTca83b0RndF32(seed);
  if (value > rnd) return 1;   /* comiss/ja ordered */
  if (value >= _f32Value(ROOM_TCA83B0_ONE_BITS)) return 1; /* jae */
  return 0;
}

/** L3 flag store (0x7f84e3): !music && arg2==0 -> [game+9]=1. */
export function roomTca83b0FlagStore(arg2, valueBits, seed) {
  if ((arg2 >>> 0) & 0xff) return 0;
  return roomTca83b0Music(0, valueBits, seed) === 0 ? 1 : 0;
}

/** L4 skip gate (0x7f8407/0x7f8439): arg2==0 && (gate==0 || match==0)
    -> pure skip (ret 0, NO stores). */
export function roomTca83b0Skip(arg2, gate749830, roomMatch) {
  if ((arg2 >>> 0) & 0xff) return 0;
  if ((gate749830 >>> 0) === 0) return 1;
  if ((roomMatch >>> 0) === 0) return 1;
  return 0;
}

/** L5 seed fatal (0x7f8478): seed==0 -> HOST logger leaf. */
export function roomTca83b0SeedFatal(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}

/** L6 item vol (0x7f8768..0x7f8795): u32ToF32 * 2^-32 * 5.0f. */
export function roomTca83b0ItemVol(rndBits) {
  const unit = _tca83b0U32ToF32(rndBits >>> 0);
  const scale = _f32Value(ROOM_TCA83B0_SCALE_POW2M32_BITS);
  const five = _f32Value(ROOM_TCA83B0_VOL_MUL_BITS);
  return Math.fround(Math.fround(unit * scale) * five);
}

/** L7 item pitch (0x7f881c..0x7f884d): u32ToF32 * 2^-32 * pi, doubled
    by addss (x + x). */
export function roomTca83b0ItemPitch(rndBits) {
  const unit = _tca83b0U32ToF32(rndBits >>> 0);
  const scale = _f32Value(ROOM_TCA83B0_SCALE_POW2M32_BITS);
  const pi = _f32Value(ROOM_TCA83B0_PITCH_MUL_BITS);
  const p = Math.fround(Math.fround(unit * scale) * pi);
  return Math.fround(p + p);
}

/** L8 item speed (0x7f8852..0x7f887f): u32ToF32 * 2^-32 * 20.0f. */
export function roomTca83b0ItemSpeed(rndBits) {
  const unit = _tca83b0U32ToF32(rndBits >>> 0);
  const scale = _f32Value(ROOM_TCA83B0_SCALE_POW2M32_BITS);
  const twenty = _f32Value(ROOM_TCA83B0_SPEED_MUL_BITS);
  return Math.fround(Math.fround(unit * scale) * twenty);
}

/** L9 noise direction (0x7f8922..0x7f89ac): comiss 0.0f,vel / jbe.
    (vel < 0.0f) ? -1.0f : 1.0f; NaN/-0.0 -> keep +1.0f. */
export function roomTca83b0NoiseDir(velBits) {
  const vel = _f32Value(velBits >>> 0);
  const one = _f32Value(ROOM_TCA83B0_ONE_BITS);
  const negOne = _f32Value(ROOM_TCA83B0_NEG1_BITS);
  return vel < 0.0 ? negOne : one;
}

/** L10 signed mod (0x7f85c5..0x7f85d1 mod 8 / 0x7f86fc..0x7f8708 mod 4):
    and 0x80000000|(mod-1); jns; dec; or ~(mod-1); inc. == int32 % mod
    for power-of-two mod. */
export function roomTca83b0SignedMod(value, modPow2) {
  const mask = (0x80000000 | (modPow2 - 1)) >>> 0;
  let t = (value >>> 0) & mask;
  if (t & 0x80000000) {
    t = (((t - 1) >>> 0) | ((~(modPow2 - 1)) >>> 0)) >>> 0;
    t = (t + 1) >>> 0;
  }
  return t | 0;
}

/** L11 chapter cap (0x7f8ac4..0x7f8aef): base + (chapter 4/5 ? 1 : 0)
    clamped to [0, 13] via signed cmovle/cmovl. */
export function roomTca83b0ChapterCap(chapter, base) {
  let v = base | 0;
  const ch = chapter | 0;
  if (ch === ROOM_TCA83B0_CHAPTER_4 || ch === ROOM_TCA83B0_CHAPTER_5) {
    v = (v + 1) | 0;
  }
  if (v <= 0) v = 0;
  if (v >= ROOM_TCA83B0_CHAPTER_CAP) v = ROOM_TCA83B0_CHAPTER_CAP;
  return v >>> 0;
}

/* ---- v70: FUN_007f92b0 value leaf (PE 0x7f92b0..0x7f96e6) + the v69
   ALT-tail laws (door magic 0xe/0xf flag stores 0x7f8d94..0x7f8dc6,
   tail-RNG advance 0x7f91dd..0x7f9201). JS mirrors of
   isaac_room_value_92b0 / _stage_scale /
   isaac_room_trigger_clear_audio_83b0_door_flag_store / _tail_rng_fatal /
   _tail_rng_next. f32 math bit-exact via _f32Value/Math.fround. */

export const ROOM_VALUE_92B0_VA = 0x007f92b0;
export const ROOM_VALUE_92B0_RET_VA = 0x007f96e6;
export const ROOM_VALUE_92B0_END_VA = 0x007f96f0;
export const ROOM_VALUE_92B0_GAME_GLOBAL = 0x00c71678;
export const ROOM_VALUE_92B0_OWNER_HOST_VA = 0x009be080;
export const ROOM_VALUE_92B0_COUNT_HOST_VA = 0x009be750;
export const ROOM_VALUE_92B0_TRINKET_COUNT_VA = 0x009be6b0;
export const ROOM_VALUE_92B0_TRINKET_LOOKUP_VA = 0x007cb6e0;
export const ROOM_VALUE_92B0_ROOMIDX_HOST_VA = 0x00740bc0;
export const ROOM_VALUE_92B0_LIST_COUNT_VA = 0x0041b770;
export const ROOM_VALUE_92B0_LIST_HAS_VA = 0x009305f0;
export const ROOM_VALUE_92B0_OWNER_33 = 0x33;
export const ROOM_VALUE_92B0_OWNER_104 = 0x104;
export const ROOM_VALUE_92B0_OWNER_22 = 0x22;
export const ROOM_VALUE_92B0_OWNER_3B = 0x3b;
export const ROOM_VALUE_92B0_OWNER_4E = 0x4e;
export const ROOM_VALUE_92B0_OWNER_259 = 0x259;
export const ROOM_VALUE_92B0_OWNER_29D = 0x29d;
export const ROOM_VALUE_92B0_OWNER_D7 = 0xd7;
export const ROOM_VALUE_92B0_OWNER_1F3 = 0x1f3;
export const ROOM_VALUE_92B0_TRINKET_AE = 0xae;
export const ROOM_VALUE_92B0_TRINKET_7 = 7;
export const ROOM_VALUE_92B0_LIST_TYPE_124 = 0x124;
export const ROOM_VALUE_92B0_PLAYERS_OFF = 0x1baa8;
export const ROOM_VALUE_92B0_GAME_18300_OFF = 0x18300;
export const ROOM_VALUE_92B0_GAME_18304_OFF = 0x18304;
export const ROOM_VALUE_92B0_GAME_18314_OFF = 0x18314;
export const ROOM_VALUE_92B0_GAME_1839C_OFF = 0x1839c;
export const ROOM_VALUE_92B0_GAME_18334_OFF = 0x18334;
export const ROOM_VALUE_92B0_GAME_26548_OFF = 0x26548;
export const ROOM_VALUE_92B0_GAME_26554_OFF = 0x26554;
export const ROOM_VALUE_92B0_GAME_2663C_OFF = 0x2663c;
export const ROOM_VALUE_92B0_GAME_269C8_OFF = 0x269c8;
export const ROOM_VALUE_92B0_GAME_CHAPTER_OFF = 4;
export const ROOM_VALUE_92B0_GAME_MUSIC_FLAG_OFF = 9;
export const ROOM_VALUE_92B0_ROOM_120C_OFF = 0x120c;
export const ROOM_VALUE_92B0_ROOM_7310_OFF = 0x7310;
export const ROOM_VALUE_92B0_ROOM_1218_OFF = 0x1218;
export const ROOM_VALUE_92B0_FLAGS_BIT_1 = 1;
export const ROOM_VALUE_92B0_FLAGS_BIT_4 = 4;
export const ROOM_VALUE_92B0_FLAGS_BIT_40 = 0x40;
export const ROOM_VALUE_92B0_FLAGS26548_BIT = 0x20000000;
export const ROOM_VALUE_92B0_MODE_2663C = 0x11;
export const ROOM_VALUE_92B0_MODE_2 = 2;
export const ROOM_VALUE_92B0_MODE_3 = 3;
export const ROOM_VALUE_92B0_MODE_3_E = 0xc;
export const ROOM_VALUE_92B0_MODE_2_E = 0xb;
export const ROOM_VALUE_92B0_INIT_VA = 0x00baa06c;
export const ROOM_VALUE_92B0_INIT_BITS = 0x3c23d70a; /* 0.01f */
export const ROOM_VALUE_92B0_A1_VA = 0x00baa12c;
export const ROOM_VALUE_92B0_A1_BITS = 0x3de147ae; /* 0.11f */
export const ROOM_VALUE_92B0_A2_VA = 0x00baa154;
export const ROOM_VALUE_92B0_A2_BITS = 0x3e19999a; /* 0.15f */
export const ROOM_VALUE_92B0_A3_VA = 0x00baa0d0;
export const ROOM_VALUE_92B0_A3_BITS = 0x3d4ccccd; /* 0.05f */
export const ROOM_VALUE_92B0_A4_VA = 0x00baa13c;
export const ROOM_VALUE_92B0_A4_BITS = 0x3e000000; /* 0.125f */
export const ROOM_VALUE_92B0_A5_VA = 0x00baa178;
export const ROOM_VALUE_92B0_A5_BITS = 0x3e333333; /* 0.175f */
export const ROOM_VALUE_92B0_A6_VA = 0x00baa244;
export const ROOM_VALUE_92B0_A6_BITS = 0x3eb33333; /* 0.35f */
export const ROOM_VALUE_92B0_A7_VA = 0x00baa244;
export const ROOM_VALUE_92B0_A7_BITS = 0x3eb33333; /* 0.35f */
export const ROOM_VALUE_92B0_A7B_VA = 0x00baa154;
export const ROOM_VALUE_92B0_A7B_BITS = 0x3e19999a; /* 0.15f */
export const ROOM_VALUE_92B0_A8_VA = 0x00baa44c;
export const ROOM_VALUE_92B0_A8_BITS = 0x3f7d70a4; /* 0.99f */
export const ROOM_VALUE_92B0_A8B_VA = 0x00baa280;
export const ROOM_VALUE_92B0_A8B_BITS = 0x3ecccccd; /* 0.4f */
export const ROOM_VALUE_92B0_A9_VA = 0x00baa120;
export const ROOM_VALUE_92B0_A9_BITS = 0x3dcccccd; /* 0.1f */
export const ROOM_VALUE_92B0_A10_1_BITS = 0x3dcccccd; /* 0.1f */
export const ROOM_VALUE_92B0_A10_2_BITS = 0x3e19999a; /* 0.15f */
export const ROOM_VALUE_92B0_A10_3_BITS = 0x3e4ccccd; /* 0.2f */
export const ROOM_VALUE_92B0_A11_2_BITS = 0x3d4ccccd; /* 0.05f */
export const ROOM_VALUE_92B0_A11_3_BITS = 0x3dcccccd; /* 0.1f */
export const ROOM_VALUE_92B0_A12_VA = 0x00baa0f0;
export const ROOM_VALUE_92B0_A12_BITS = 0x3d8d4fdf; /* 0.069f */
export const ROOM_VALUE_92B0_A13_VA = 0x00baa120;
export const ROOM_VALUE_92B0_A13_BITS = 0x3dcccccd; /* 0.1f */
export const ROOM_VALUE_92B0_SCALE_Q_VA = 0x00baa1d4;
export const ROOM_VALUE_92B0_SCALE_Q_BITS = 0x3e800000; /* 0.25f */
export const ROOM_VALUE_92B0_SCALE_H_VA = 0x00baa2d0;
export const ROOM_VALUE_92B0_SCALE_H_BITS = 0x3f000000; /* 0.5f */
export const ROOM_VALUE_92B0_ONE_VA = 0x00baa454;
export const ROOM_VALUE_92B0_ONE_BITS = 0x3f800000; /* 1.0f */
export const ROOM_VALUE_92B0_A15_BITS = 0x42853333; /* 66.4f */
export const ROOM_VALUE_92B0_SIGN_TABLE_VA = 0x00bacb00;
export const ROOM_VALUE_92B0_SIGN_TABLE_HI_BITS = 0x41f0000000000000;
export const ROOM_VALUE_92B0_CHAPTER_4 = 4;
export const ROOM_VALUE_92B0_CHAPTER_5 = 5;
export const ROOM_VALUE_92B0_DOOR_MAGIC_E = 0xe;
export const ROOM_VALUE_92B0_DOOR_MAGIC_F = 0xf;
export const ROOM_VALUE_92B0_DOOR_FLAG_20 = 0x20;
export const ROOM_VALUE_92B0_DOOR_FLAG_1 = 1;
export const ROOM_VALUE_92B0_GAME_2654C_OFF = 0x2654c;
export const ROOM_VALUE_92B0_TAIL_SEED_OFF = 0x182e4;
export const ROOM_VALUE_92B0_TAIL_S1_OFF = 0x182e8;
export const ROOM_VALUE_92B0_TAIL_S2_OFF = 0x182ec;
export const ROOM_VALUE_92B0_TAIL_S3_OFF = 0x182f0;
export const ROOM_VALUE_92B0_TAIL_FATAL_VA = 0x00a112c0;
export const ROOM_VALUE_92B0_TAIL_FATAL_ARG0 = 0x00b6bf54;
export const ROOM_VALUE_92B0_TAIL_FATAL_ARG1 = 0x10;

/** u32 -> f32 (cvtdq2pd SIGNED + addsd [edx*8+0xbacb00] 2^32 fix +
    cvtpd2ps). Exact mirror of the PE helper (v69 shared form). */
function _roomValue92b0U32ToF32(bits) {
  let wide = (bits >>> 0) | 0;
  if ((bits >>> 31) !== 0) wide += 4294967296;
  return Math.fround(wide);
}

/** V2 stage scale (0x7f95dc..0x7f9617): stage==0 -> 0; d =
    chapter_adj - stage (u32 wrap); d==0||1 -> 1 (0.25f); d==2 -> 2
    (0.5f); else 0. chapter_adj = chapter + 1 iff chapter4 in {4,5}. */
export function roomValue92b0StageScale(stage, chapter4, chapter) {
  if ((stage >>> 0) === 0) return 0;
  let adj = chapter >>> 0;
  const ch4 = chapter4 >>> 0;
  if (ch4 === ROOM_VALUE_92B0_CHAPTER_4 || ch4 === ROOM_VALUE_92B0_CHAPTER_5) {
    adj = (adj + 1) >>> 0;
  }
  const d = (adj - stage) >>> 0;
  if (d === 0 || d === 1) return 1;
  if (d === 2) return 2;
  return 0;
}

/** V1 value leaf (0x7f92b0..0x7f96e6): PE-order f32 accumulation with
    per-step fround; A1 REPLACE; A13 f = u32ToF32(count124)*0.1f with
    the stage scale applied to (acc_old + f); byte gates for room120c /
    music_flag9 / room_has_d7; FULL-dword gates for every FCO owner,
    room_match, mode2663c/269c8; SIGNED count33 > 1; UNSIGNED
    count18334 < e. Returns the float acc (ST0). */
export function roomValue92b0(
  owner33, owner104, count33, owner22, owner3b, owner4e,
  flags1839c, roomMatch, room120c, owner259, owner259b,
  trinketAeCount, trinketAeT, trinket7Count, trinket7T, owner29d,
  count124, stage, chapter4, chapter, musicFlag9, ownerD7, roomHasD7,
  mode2663c, flags26548, owner1f3, mode269c8, count18334) {
  let acc = _f32Value(ROOM_VALUE_92B0_INIT_BITS); /* 0.01f */
  if (owner33 >>> 0) acc = _f32Value(ROOM_VALUE_92B0_A1_BITS); /* REPLACE */
  if (owner104 >>> 0) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A2_BITS));
  if ((count33 | 0) > 1) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A3_BITS)); /* SIGNED */
  if ((owner22 >>> 0) || (owner3b >>> 0)) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A4_BITS));
  if (owner4e >>> 0) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A5_BITS));
  if ((flags1839c >>> 0) & ROOM_VALUE_92B0_FLAGS_BIT_1) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A6_BITS));
  if ((roomMatch >>> 0) === 0 || ((room120c >>> 0) & 0xff) === 0) {
    acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A7_BITS));
  } else if (owner259 >>> 0) {
    acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A7B_BITS));
  }
  if (!((flags1839c >>> 0) & ROOM_VALUE_92B0_FLAGS_BIT_4)) {
    acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A8_BITS));
  } else if (owner259b >>> 0) {
    acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A8B_BITS));
  }
  if ((flags1839c >>> 0) & ROOM_VALUE_92B0_FLAGS_BIT_40) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A9_BITS));
  if (trinketAeCount >>> 0) {
    if (trinketAeT === 1) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A10_1_BITS));
    else if (trinketAeT === 2) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A10_2_BITS));
    else if (trinketAeT === 3) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A10_3_BITS));
  }
  if (trinket7Count >>> 0) {
    if (trinket7T === 2) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A11_2_BITS));
    else if (trinket7T === 3) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A11_3_BITS));
  }
  if (owner29d >>> 0) acc = Math.fround(acc + _f32Value(ROOM_VALUE_92B0_A12_BITS));
  /* A13: addss xmm1,[esp+0xc] clobbers xmm1 BEFORE the stage block, so
     the scale applies to (acc_old + f), not f alone. */
  {
    const f = Math.fround(
      _roomValue92b0U32ToF32(count124 >>> 0) * _f32Value(ROOM_VALUE_92B0_A13_BITS));
    const summed = Math.fround(acc + f);
    const sel = roomValue92b0StageScale(stage, chapter4, chapter);
    if (sel === 1) acc = Math.fround(summed * _f32Value(ROOM_VALUE_92B0_SCALE_Q_BITS));
    else if (sel === 2) acc = Math.fround(summed * _f32Value(ROOM_VALUE_92B0_SCALE_H_BITS));
    else acc = summed;
  }
  if ((musicFlag9 >>> 0) & 0xff) acc = 0.0;
  if ((ownerD7 >>> 0) || ((roomHasD7 >>> 0) & 0xff)) {
    acc = _f32Value(ROOM_VALUE_92B0_A15_BITS); /* 66.4f */
  }
  if ((mode2663c >>> 0) === ROOM_VALUE_92B0_MODE_2663C &&
      !((flags26548 >>> 0) & ROOM_VALUE_92B0_FLAGS26548_BIT)) {
    acc = _f32Value(ROOM_VALUE_92B0_ONE_BITS);
  }
  if (owner1f3 >>> 0) acc = _f32Value(ROOM_VALUE_92B0_ONE_BITS);
  if ((mode269c8 >>> 0) === ROOM_VALUE_92B0_MODE_2 ||
      (mode269c8 >>> 0) === ROOM_VALUE_92B0_MODE_3) {
    acc = _f32Value(ROOM_VALUE_92B0_ONE_BITS);
    const e = (mode269c8 >>> 0) === ROOM_VALUE_92B0_MODE_3
      ? ROOM_VALUE_92B0_MODE_3_E : ROOM_VALUE_92B0_MODE_2_E;
    if ((count18334 >>> 0) < e) acc = 0.0; /* UNSIGNED jae */
  }
  return acc;
}

/** V3 door magic flag store (0x7f8d94..0x7f8dc6): FULL-dword compares
    on [slot+8]; 0xe -> flags |= 0x20; 0xf -> flags |= 1. The
    [game+0x2654c] self-store is a no-op identity. */
export function roomTca83b0DoorFlagStore(flags, doorMagic) {
  let out = flags >>> 0;
  const magic = doorMagic >>> 0;
  if (magic === ROOM_VALUE_92B0_DOOR_MAGIC_E) out = (out | ROOM_VALUE_92B0_DOOR_FLAG_20) >>> 0;
  else if (magic === ROOM_VALUE_92B0_DOOR_MAGIC_F) out = (out | ROOM_VALUE_92B0_DOOR_FLAG_1) >>> 0;
  return out >>> 0;
}

/** V4 tail-RNG fatal (0x7f91bf..0x7f91dc): seed==0 -> HOST fatal
    0xa112c0(0x10,0xb6bf54) + int3; body resumes with the 0 seed. */
export function roomTca83b0TailRngFatal(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}

/** V5 tail-RNG advance (0x7f91dd..0x7f9201): dynamic-register xorshift
    with STORE-BACK [game+0x182e4] = out. Shift registers are DWORD
    reads, but only CL feeds shr/shl: effective count = (sN & 0xff) & 31
    (byte gate + CPU mod-32 mask; JS shifts mask mod 32 natively). */
export function roomTca83b0TailRngNext(seed, s1, s2, s3) {
  let t1 = (seed >>> 0) ^ ((seed >>> 0) >>> ((s1 >>> 0) & 0xff));
  let t2 = (t1 ^ (t1 << ((s2 >>> 0) & 0xff))) >>> 0;
  const out = (t2 ^ (t2 >>> ((s3 >>> 0) & 0xff))) >>> 0;
  return out >>> 0;
}

/* ===================== ABI v71 (room suite 100/100 -> 71) ================
   0x7f96f0 StatHUD luck/chance leaf (plain `ret` ST0 float, NO args/
   receiver, everything from the Game global; 6 E8 all 0x9be080; callers
   0x749a2d/0x84cb86/0x84d1c7) + FUN_007f83b0 ALT-tail door-walk
   selection 0x7f8c0f..0x7f8d81 (fixed-idx path + manual xorshift
   {2,5,0x15} + and 7 + mode 2/3 -> 4 + two-pass smod8 walk over the
   64-bit door bitmaps + [room+idx*4+0x724] slot tests) + the StatHUD
   clamp/gate recipe 0x84cb4d..0x84cb86 / 0x84d18e..0x84d1c7 (maxss
   0.0 / minss 1.0 / gate749830 -> 0.0). Mirrors transcribed branch-by-
   branch from cpu-dump/007f96f0.txt + 007f8c0f.txt + 0084cb20.txt +
   0084d170.txt (PE-truth; not derived from the C++). SSE MAXSS/MINSS
   via (a >= b) ? a : b / (a <= b) ? a : b (-0.0 kept, NaN -> second). */

export const ROOM_LUCK_96F0_VA = 0x007f96f0;
export const ROOM_LUCK_96F0_RET_VA = 0x007f9955;
export const ROOM_LUCK_96F0_END_VA = 0x007f9960;
export const ROOM_LUCK_96F0_GAME_GLOBAL = 0x00c71678;
export const ROOM_LUCK_96F0_OWNER_HOST_VA = 0x009be080;
export const ROOM_LUCK_96F0_OWNER_EE = 0xee;
export const ROOM_LUCK_96F0_OWNER_EF = 0xef;
export const ROOM_LUCK_96F0_OWNER_248 = 0x248;
export const ROOM_LUCK_96F0_OWNER_259 = 0x259;
export const ROOM_LUCK_96F0_OWNER_1F3 = 0x1f3;
export const ROOM_LUCK_96F0_GAME_26548_OFF = 0x26548;
export const ROOM_LUCK_96F0_GAME_2654C_OFF = 0x2654c; /* dead store @0x7f9712 */
export const ROOM_LUCK_96F0_GAME_26570_OFF = 0x26570;
export const ROOM_LUCK_96F0_GAME_1839C_OFF = 0x1839c;
export const ROOM_LUCK_96F0_GAME_182F4_OFF = 0x182f4;
export const ROOM_LUCK_96F0_GAME_26568_OFF = 0x26568;
export const ROOM_LUCK_96F0_FLAGS_BIT_1 = 1;
export const ROOM_LUCK_96F0_FLAGS_BIT_20 = 0x20;
export const ROOM_LUCK_96F0_FLAGS_BIT_40 = 0x40;
export const ROOM_LUCK_96F0_1839C_BIT_2 = 2;
export const ROOM_LUCK_96F0_1839C_BIT_3 = 3;
export const ROOM_LUCK_96F0_1839C_BIT_4 = 4;
export const ROOM_LUCK_96F0_1839C_BIT_8 = 8;
export const ROOM_LUCK_96F0_1839C_BIT_10 = 0x10;
export const ROOM_LUCK_96F0_INIT_VA = 0x00baa2d0;
export const ROOM_LUCK_96F0_INIT_BITS = 0x3f000000; /* 0.5f */
export const ROOM_LUCK_96F0_Q_VA = 0x00baa1d4;
export const ROOM_LUCK_96F0_Q_BITS = 0x3e800000; /* 0.25f */
export const ROOM_LUCK_96F0_H_VA = 0x00baa2d0;
export const ROOM_LUCK_96F0_H_BITS = 0x3f000000; /* 0.5f */
export const ROOM_LUCK_96F0_TENTH_VA = 0x00baa120;
export const ROOM_LUCK_96F0_TENTH_BITS = 0x3dcccccd; /* 0.1f */
export const ROOM_LUCK_96F0_ONE_VA = 0x00baa454;
export const ROOM_LUCK_96F0_ONE_BITS = 0x3f800000; /* 1.0f */
export const ROOM_LUCK_96F0_ZERO_VA = 0x00ba9fe4;
export const ROOM_LUCK_96F0_ZERO_BITS = 0x00000000; /* 0.0f */
export const ROOM_LUCK_96F0_1F3_RESULT_VA = 0x00baa994;
export const ROOM_LUCK_96F0_1F3_RESULT_BITS = 0x429a0000; /* 77.0f */
export const ROOM_LUCK_96F0_CALLER_749A2D = 0x00749a2d;
export const ROOM_LUCK_96F0_CALLER_84CB86 = 0x0084cb86;
export const ROOM_LUCK_96F0_CALLER_84D1C7 = 0x0084d1c7;

export const ROOM_TCA83B0_DOOR_WALK_VA = 0x007f8c0f;
export const ROOM_TCA83B0_DOOR_WALK_END_VA = 0x007f8d89;
export const ROOM_TCA83B0_DOOR_WALK_GAME_GLOBAL = 0x00c71678;
export const ROOM_TCA83B0_DOOR_WALK_FATAL_VA = 0x00a112c0;
export const ROOM_TCA83B0_DOOR_WALK_FATAL_ARG0 = 0x00b6bf54;
export const ROOM_TCA83B0_DOOR_WALK_FATAL_ARG1 = 0x10;
export const ROOM_TCA83B0_DOOR_WALK_ROOM4_OFF = 4;
export const ROOM_TCA83B0_DOOR_WALK_SEED_OFF = 0x58;
export const ROOM_TCA83B0_DOOR_WALK_BM1_BASE_OFF = 0x10;
export const ROOM_TCA83B0_DOOR_WALK_BM1_DW_38 = 0x38;
export const ROOM_TCA83B0_DOOR_WALK_BM1_DW_3C = 0x3c;
export const ROOM_TCA83B0_DOOR_WALK_BM2_DW_34 = 0x34;
export const ROOM_TCA83B0_DOOR_WALK_BM2_DW_38 = 0x38;
export const ROOM_TCA83B0_DOOR_WALK_SLOT_OFF = 0x724;
export const ROOM_TCA83B0_DOOR_WALK_GAME_18308_OFF = 0x18308;
export const ROOM_TCA83B0_DOOR_WALK_GAME_1831C_OFF = 0x1831c;
export const ROOM_TCA83B0_DOOR_WALK_GAME_1830C_OFF = 0x1830c;
export const ROOM_TCA83B0_DOOR_WALK_GAME_269C8_OFF = 0x269c8;
export const ROOM_TCA83B0_DOOR_WALK_GAME_16C8C_OFF = 0x16c8c;
export const ROOM_TCA83B0_DOOR_WALK_BM2_GLOBAL = 0x00c810a0;
export const ROOM_TCA83B0_DOOR_WALK_SHIFT_TABLE_VA = 0x00b1f540;
export const ROOM_TCA83B0_DOOR_WALK_SHIFT_HI_VA = 0x00b1f548;
export const ROOM_TCA83B0_DOOR_WALK_SHIFT_LO = 2;
export const ROOM_TCA83B0_DOOR_WALK_SHIFT_MID = 5;
export const ROOM_TCA83B0_DOOR_WALK_SHIFT_HI = 0x15;
export const ROOM_TCA83B0_DOOR_WALK_SEL_GREED = 4;
export const ROOM_TCA83B0_DOOR_WALK_MODE_2 = 2;
export const ROOM_TCA83B0_DOOR_WALK_MODE_3 = 3;
export const ROOM_TCA83B0_DOOR_WALK_MOD_8 = 8;
export const ROOM_TCA83B0_DOOR_WALK_MOD_4 = 4;
export const ROOM_TCA83B0_DOOR_WALK_FAIL = 0xffffffff; /* -1 */

export const ROOM_VALUE_92B0_HUD_CLAMP_VA_1 = 0x0084cb4d;
export const ROOM_VALUE_92B0_HUD_CLAMP_END_1 = 0x0084cb86;
export const ROOM_VALUE_92B0_HUD_CLAMP_VA_2 = 0x0084d18e;
export const ROOM_VALUE_92B0_HUD_CLAMP_END_2 = 0x0084d1c7;
export const ROOM_VALUE_92B0_HUD_GATE_VA = 0x00749830;
export const ROOM_VALUE_92B0_HUD_VALUE_VA = 0x007f92b0;
export const ROOM_VALUE_92B0_HUD_LUCK_VA = 0x007f96f0;
export const ROOM_VALUE_92B0_HUD_ROOM_OFF = 0x18300;
export const ROOM_VALUE_92B0_HUD_GAME_GLOBAL = 0x00c71678;
export const ROOM_VALUE_92B0_HUD_MAX_VA = 0x00ba9fe4;
export const ROOM_VALUE_92B0_HUD_MAX_BITS = 0x00000000; /* 0.0f */
export const ROOM_VALUE_92B0_HUD_MIN_VA = 0x00baa454;
export const ROOM_VALUE_92B0_HUD_MIN_BITS = 0x3f800000; /* 1.0f */

function _roomLuckSseMaxss(a, b) {
  return (a >= b) ? a : b; /* MAXSS: equal (-0.0) keeps a; NaN -> b */
}
function _roomLuckSseMinss(a, b) {
  return (a <= b) ? a : b; /* MINSS */
}

/** V6 luck leaf (0x7f96f0..0x7f9955). acc init 0.5f; G0 flags26548
    bits 0x40/1 both clear -> 1.0f; G1..G3 owner lerps 0.25f; G4
    (int32)count26570 > 9 SIGNED -> 0.5f; G5 flags1839c bit 2 ->
    0.25f; G6 XOR(bit3,bit4) -> +0.1f (bit 8) / -0.1f SUBSS (bit 0x10);
    G7 f=[game+0x182f4] comiss/ja: lerp iff f>0 (NaN -> block) ||
    (owner259 && flags&0x20) || owner248b; else acc = 0 unless
    (flags&0x20 && game26568==0) keeps acc; G8 owner_1f3 -> 77.0f
    else acc; maxss 0.0 / minss 1.0. Returns the float acc (ST0). */
export function roomLuck96f0(
  flags26548, ownerEe, ownerEf, owner248, count26570, flags1839c,
  f182f4Bits, owner259, owner248b, game26568, owner1f3) {
  let acc = _f32Value(ROOM_LUCK_96F0_INIT_BITS); /* 0.5f */
  if (!((flags26548 >>> 0) & ROOM_LUCK_96F0_FLAGS_BIT_40) &&
      !((flags26548 >>> 0) & ROOM_LUCK_96F0_FLAGS_BIT_1)) {
    acc = _f32Value(ROOM_LUCK_96F0_ONE_BITS);
  }
  const q = _f32Value(ROOM_LUCK_96F0_Q_BITS); /* 0.25f */
  if (ownerEe >>> 0) acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * q));
  if (ownerEf >>> 0) acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * q));
  if (owner248 >>> 0) acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * q));
  if ((count26570 | 0) > 9) { /* SIGNED jle */
    acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * _f32Value(ROOM_LUCK_96F0_H_BITS)));
  }
  if ((flags1839c >>> 0) & ROOM_LUCK_96F0_1839C_BIT_2) {
    acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * q));
  }
  const bit3 = ((flags1839c >>> 0) >> 3) & 1;
  const bit4 = ((flags1839c >>> 0) >> 4) & 1;
  if (bit3 !== bit4) {
    const tenth = _f32Value(ROOM_LUCK_96F0_TENTH_BITS); /* 0.1f */
    if ((flags1839c >>> 0) & ROOM_LUCK_96F0_1839C_BIT_8) {
      acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * tenth));
    }
    if ((flags1839c >>> 0) & ROOM_LUCK_96F0_1839C_BIT_10) {
      acc = Math.fround(acc - Math.fround(Math.fround(1.0 - acc) * tenth)); /* SUBSS */
    }
  }
  const f = _f32Value(f182f4Bits >>> 0);
  if (f > 0.0) { /* comiss/ja ordered */
    acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * f));
  } else if (((owner259 >>> 0) && ((flags26548 >>> 0) & ROOM_LUCK_96F0_FLAGS_BIT_20)) ||
             (owner248b >>> 0)) {
    acc = Math.fround(acc + Math.fround(Math.fround(1.0 - acc) * f));
  } else {
    if (!((flags26548 >>> 0) & ROOM_LUCK_96F0_FLAGS_BIT_20) || (game26568 >>> 0) !== 0) {
      acc = 0.0;
    }
  }
  let result = (owner1f3 >>> 0) ? _f32Value(ROOM_LUCK_96F0_1F3_RESULT_BITS) : acc;
  result = _roomLuckSseMaxss(result, _f32Value(ROOM_LUCK_96F0_ZERO_BITS));
  result = _roomLuckSseMinss(result, _f32Value(ROOM_LUCK_96F0_ONE_BITS));
  return result;
}

/** V8 door-walk seed fatal (0x7f8c4e..0x7f8c61): seed==0 -> HOST fatal
    leaf; body resumes (sel = 0 & 7). */
export function roomTca83b0DoorWalkSeedFatal(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}

/** Bitmap bit test (machine: [base + (idx>>5)*4 + 0x38], arithmetic
    >>5). p0 = word for esi==0 (offset +0x38); p1 = word for esi odd
    (bm1: +0x3c idx>=32; bm2: +0x34 idx2<0). */
function _doorWalkBit(p0, p1, idx) {
  const esi = (idx | 0) >> 5;
  const word = (esi & 1) ? (p1 >>> 0) : (p0 >>> 0);
  return ((word >>> (idx & 0x1f)) & 1) !== 0 ? 1 : 0;
}

/** V7 door-walk select (0x7f8c0f..0x7f8d81). FIXED iff game18308 == -1
    && (int32)game1831c >= 0: bm1 bit + fixed_slot_free -> idx. RANDOM:
    xorshift {2,5,0x15} & 7; mode 2/3 -> 4; PASS1 bm1+bm2(smod4(idx+2))
    +slot -> idx (>=0) else PASS2 bm1+slot -> idx else -1. slot_free
    mask bits 0..7 for the walk; the FIXED idx slot captured separately
    (fixed_slot_free). Returns int32 idx or -1. */
export function roomTca83b0DoorWalkSelect(
  game18308, game1831c, fixedSlotFree, bm1_38, bm1_3c, bm2_38, bm2_34,
  seed, mode269c8, slotFreeMask) {
  if ((game18308 >>> 0) === 0xffffffff && (game1831c | 0) >= 0) {
    if (_doorWalkBit(bm1_38, bm1_3c, game1831c | 0) && (fixedSlotFree >>> 0) !== 0) {
      return game1831c | 0;
    }
  }
  let t = seed >>> 0;
  t ^= t >>> ROOM_TCA83B0_DOOR_WALK_SHIFT_LO;
  t = (t ^ (t << ROOM_TCA83B0_DOOR_WALK_SHIFT_MID)) >>> 0;
  t ^= t >>> ROOM_TCA83B0_DOOR_WALK_SHIFT_HI;
  let sel = (t >>> 0) & 7;
  if ((mode269c8 >>> 0) === ROOM_TCA83B0_DOOR_WALK_MODE_2 ||
      (mode269c8 >>> 0) === ROOM_TCA83B0_DOOR_WALK_MODE_3) {
    sel = ROOM_TCA83B0_DOOR_WALK_SEL_GREED;
  }
  const mask = slotFreeMask >>> 0;
  for (let i = 0; i < ROOM_TCA83B0_DOOR_WALK_MOD_8; i += 1) {
    const idx = roomTca83b0SignedMod((sel + i) >>> 0, ROOM_TCA83B0_DOOR_WALK_MOD_8);
    if (_doorWalkBit(bm1_38, bm1_3c, idx)) {
      const idx2 = roomTca83b0SignedMod((idx + 2) >>> 0, ROOM_TCA83B0_DOOR_WALK_MOD_4);
      if (_doorWalkBit(bm2_38, bm2_34, idx2)) {
        if (((mask >>> (idx & 7)) & 1) !== 0) {
          if (idx >= 0) return idx;
          break;
        }
      }
    }
  }
  for (let i = 0; i < ROOM_TCA83B0_DOOR_WALK_MOD_8; i += 1) {
    const idx = roomTca83b0SignedMod((sel + i) >>> 0, ROOM_TCA83B0_DOOR_WALK_MOD_8);
    if (_doorWalkBit(bm1_38, bm1_3c, idx)) {
      if (((mask >>> (idx & 7)) & 1) !== 0) {
        if (idx >= 0) return idx;
        return -1;
      }
    }
  }
  return -1;
}

/** V9 StatHUD clamp/gate (0x84cb4d..0x84cb86 + 0x84d18e..0x84d1c7):
    maxss 0.0 / minss 1.0; gate749830==0 -> 0.0. SSE semantics (-0.0
    kept by the equality, NaN -> 0.0 via the maxss). Returns float. */
export function roomValue92b0HudClampGate(valueBits, gate749830) {
  let v = _f32Value(valueBits >>> 0);
  v = _roomLuckSseMaxss(v, _f32Value(ROOM_VALUE_92B0_HUD_MAX_BITS));
  v = _roomLuckSseMinss(v, _f32Value(ROOM_VALUE_92B0_HUD_MIN_BITS));
  if ((gate749830 >>> 0) === 0) v = 0.0;
  return v;
}

/* ===================== ABI v72 (music-path door collect walk) ===========
   FUN_007f83b0 MUSIC-path collect walk 0x7f85c0..0x7f8634 + count gate
   0x7f8640..0x7f8643 (inside the v69 body; packed entry 0x7f8509).
   rnd = HOST RandomInt 0x7e9020 result (rng blob {seed=[room4+0x58],
   qword 0xb1f540, dword 0xb1f548}, bound 8) captured at the seam —
   the RNG chain STAYS HOST. Per i in 0..7 (SIGNED jl): idx =
   smod8(rnd+i) (v69 L10 signed-mod); bm1 bit idx + slot
   [room+idx*4+0x724]==0 (FULL dword) -> count++. count =
   SAR(end-begin,2) == number of qualifying residues (vec push host
   0x42c880/0x42c920 bookkeeping; 8 consecutive ints -> 8 distinct
   residues). Gate 0x7f8640 cmp eax,2 / jb 0x7f8b2f UNSIGNED: body
   continues iff (u32)count >= 2 (0xffffffff CONTINUES); skip exit
   0x7f8b2f [ebp-4]=-1 + vec dtor; ALT door-walk census label
   0x7f8b80 (mid-instruction region label, 2 bytes into mov
   esi,[0xc71678] @0x7f8b7e). No bm2 test, no mode override, no seed
   read. Mirrors transcribed branch-by-branch from
   cpu-dump/007f8590.txt + fresh 007f85c0.txt/007f8b20.txt/
   007f84f0.txt (PE-truth; not derived from the C++). */

export const ROOM_TCA83B0_DOOR_WALK_MUSIC_VA = 0x007f85c0;
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_END_VA = 0x007f8649; /* first post-gate insn (push edi) */
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_LOOP_TAIL_VA = 0x007f8634; /* jl 0x7f85c0 */
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_COUNT_VA = 0x007f8636; /* SAR (end-begin)>>2 */
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_GATE_VA = 0x007f8640; /* cmp eax,2 */
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_SKIP_VA = 0x007f8b2f; /* [ebp-4]=-1 + vec dtor */
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_ENTRY_VA = 0x007f8509; /* packed entry (owner 0x1f2 gate) */
export const ROOM_TCA83B0_DOOR_WALK_LABEL_VA = 0x007f8b80; /* ALT door-walk census label, mid-insn */
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_ITER = 8;
export const ROOM_TCA83B0_DOOR_WALK_MUSIC_MIN_COUNT = 2; /* UNSIGNED jb gate bound */

/** W6a collect-walk count (0x7f85c0..0x7f8634). idx = smod8(rnd+i);
    bm1 bit idx (word idx>>5 ARITHMETIC; idx 0..7 -> bm1_38) AND slot
    free (mask bit idx&7) -> count++. Returns 0..8. */
export function roomTca83b0DoorWalkMusicCount(rnd, bm1_38, bm1_3c, slotFreeMask) {
  let count = 0;
  const mask = slotFreeMask >>> 0;
  for (let i = 0; i < ROOM_TCA83B0_DOOR_WALK_MUSIC_ITER; i += 1) {
    const idx = roomTca83b0SignedMod(
      ((rnd >>> 0) + i) >>> 0, ROOM_TCA83B0_DOOR_WALK_MOD_8);
    if (_doorWalkBit(bm1_38, bm1_3c, idx)) {
      if (((mask >>> (idx & 7)) & 1) !== 0) count += 1;
    }
  }
  return count; /* SAR (end-begin)>>2 @0x7f863d */
}

/** W6b count gate (0x7f8640 cmp eax,2 / 0x7f8643 jb 0x7f8b2f).
    UNSIGNED: continues iff (u32)count >= 2 (0xffffffff CONTINUES).
    Returns 1 when the body proceeds to the host sort 0x5cc070. */
export function roomTca83b0DoorWalkMusicContinue(count) {
  return (count >>> 0) >= ROOM_TCA83B0_DOOR_WALK_MUSIC_MIN_COUNT ? 1 : 0;
}

/* ===================== ABI v73 (devil/angel room selection tail) ========
   0x7f9960..0x7f9de6 SEH body (ret 8, 2 byte args ForceAngel/ForceDevil
   [ebp+8]/[ebp+0xc]; ebx=ecx=room; returns bool; 19 E8 + 1 indirect
   vtable @0x7f9d56; 5 direct callers 0x806a4a (Room::TriggerClear
   0x8068f0 awards suite (0,0)), 0x73ed55 + 0x73f552 (enclosing
   0x73e040), 0x5fbdb8 (1,0), 0x7a7660 (1,1) — census
   section-notes/room-v73-devilangel/NOTES.md §4). Phases: A init
   gates (!ForceDevil only); B state inc (test al,2 byte gate);
   C slot -5 marks; D FCO 0x226 combine + jle SIGNED proceed;
   E select (fixed: 18308==-5 && (s32)1831c>=0 && slot free, WIDE
   idx — no bm1; random: xorshift32 {1,0xb,0x10} & 7, ONE pass
   smod8(sel+i) bm1_38 + slot, NO match -> smod8(sel+7) LAST TRIED,
   never fails, no -1); F TLS host-only + create host + angel vec
   loop (UNSIGNED jb, per-member proximity gate 2500.0f > dist2
   ORDERED comiss/jbe, f32 per-op). All int32 semantics via (x | 0)
   (the wasm32 i64 sign-extend compare form); byte gates & 0xff.
   Mirrors transcribed branch-by-branch from cpu-dump/007f9960.txt +
   fresh 007f9d60.txt/caller windows (PE-truth; not derived from the
   C++). */

export const ROOM_DEVIL_ANGEL_9960_VA = 0x007f9960;
export const ROOM_DEVIL_ANGEL_9960_RET_FAIL_VA = 0x007f9b27; /* first ret 8 (al=0) */
export const ROOM_DEVIL_ANGEL_9960_RET_OK_VA = 0x007f9d93; /* final ret 8 (al=1) */
export const ROOM_DEVIL_ANGEL_9960_END_VA = 0x007f9de7; /* int3 pad */
export const ROOM_DEVIL_ANGEL_9960_NEXT_VA = 0x007f9df0;
export const ROOM_DEVIL_ANGEL_9960_GAME_GLOBAL = 0x00c71678;
export const ROOM_DEVIL_ANGEL_9960_INIT_GATES_VA = 0x007f998a;
export const ROOM_DEVIL_ANGEL_9960_STATE_INC_VA = 0x007f9a2e;
export const ROOM_DEVIL_ANGEL_9960_SLOT_MARK_VA = 0x007f9a6a;
export const ROOM_DEVIL_ANGEL_9960_PROCEED_VA = 0x007f9ae2;
export const ROOM_DEVIL_ANGEL_9960_PROCEED_JLE_VA = 0x007f9af7; /* jle SIGNED */
export const ROOM_DEVIL_ANGEL_9960_SELECT_VA = 0x007f9b3e; /* fixed gate */
export const ROOM_DEVIL_ANGEL_9960_RANDOM_VA = 0x007f9b5f;
export const ROOM_DEVIL_ANGEL_9960_WALK_VA = 0x007f9bc0;
export const ROOM_DEVIL_ANGEL_9960_SEED_FATAL_VA = 0x007f9b7e;
export const ROOM_DEVIL_ANGEL_9960_TLS_VA = 0x007f9c04; /* host-only (outcome-neutral) */
export const ROOM_DEVIL_ANGEL_9960_CREATE_VA = 0x007f9c1d; /* host */
export const ROOM_DEVIL_ANGEL_9960_ANGEL_VA = 0x007f9ce0;
export const ROOM_DEVIL_ANGEL_9960_ANGEL_CALL_VA = 0x007f9d56; /* vtable [vt+0x28] */
export const ROOM_DEVIL_ANGEL_9960_GAME_26584_OFF = 0x26584;
export const ROOM_DEVIL_ANGEL_9960_GAME_26584_GATE = 0x2c;
export const ROOM_DEVIL_ANGEL_9960_ROOM_TYPE_GATE = 5;
export const ROOM_DEVIL_ANGEL_9960_BM1BASE_10_GATE = 0x59;
export const ROOM_DEVIL_ANGEL_9960_STATE_MIN = 1;
export const ROOM_DEVIL_ANGEL_9960_STATE_MAX = 6; /* SIGNED jl/jg range */
export const ROOM_DEVIL_ANGEL_9960_GAME_2654C_OFF = 0x2654c;
export const ROOM_DEVIL_ANGEL_9960_2654C_BIT_10000 = 0x10000;
export const ROOM_DEVIL_ANGEL_9960_2654C_OR_40 = 0x40;
export const ROOM_DEVIL_ANGEL_9960_GAME_1830C_OFF = 0x1830c;
export const ROOM_DEVIL_ANGEL_9960_GAME_18304_OFF = 0x18304;
export const ROOM_DEVIL_ANGEL_9960_GAME_18314_OFF = 0x18314;
export const ROOM_DEVIL_ANGEL_9960_GAME_18308_OFF = 0x18308;
export const ROOM_DEVIL_ANGEL_9960_GAME_1831C_OFF = 0x1831c;
export const ROOM_DEVIL_ANGEL_9960_GAME_264FC_OFF = 0x264fc;
export const ROOM_DEVIL_ANGEL_9960_GAME_26500_OFF = 0x26500;
export const ROOM_DEVIL_ANGEL_9960_GAME_18300_OFF = 0x18300;
export const ROOM_DEVIL_ANGEL_9960_GAME_26548_OFF = 0x26548;
export const ROOM_DEVIL_ANGEL_9960_GAME_26550_OFF = 0x26550;
export const ROOM_DEVIL_ANGEL_9960_GAME_C_OFF = 0xc;
export const ROOM_DEVIL_ANGEL_9960_ROOM4_OFF = 4;
export const ROOM_DEVIL_ANGEL_9960_SEED_OFF = 0x58;
export const ROOM_DEVIL_ANGEL_9960_BM1_BASE_OFF = 0x10;
export const ROOM_DEVIL_ANGEL_9960_BM1_DW_38 = 0x38;
export const ROOM_DEVIL_ANGEL_9960_SLOT_OFF = 0x724;
export const ROOM_DEVIL_ANGEL_9960_SLOT_F394_OFF = 0x394;
export const ROOM_DEVIL_ANGEL_9960_MARK_NEG5 = 0xfffffffb; /* -5 create mark */
export const ROOM_DEVIL_ANGEL_9960_ANGEL_VEC_HEAD_OFF = 0x125c;
export const ROOM_DEVIL_ANGEL_9960_ANGEL_VEC_CAP_OFF = 0x1260;
export const ROOM_DEVIL_ANGEL_9960_ANGEL_VEC_END_OFF = 0x1264;
export const ROOM_DEVIL_ANGEL_9960_ANGEL_ATTR = 0x2d;
export const ROOM_DEVIL_ANGEL_9960_ANGEL_ATTR2_OFF = 0x2c;
export const ROOM_DEVIL_ANGEL_9960_DOOR_POS_OFF = 0x24;
export const ROOM_DEVIL_ANGEL_9960_GRID_DIV_OFF = 0xc;
export const ROOM_DEVIL_ANGEL_9960_K40_VA = 0x00baa904;
export const ROOM_DEVIL_ANGEL_9960_K40_BITS = 0x42200000; /* 40.0f */
export const ROOM_DEVIL_ANGEL_9960_ADD120_VA = 0x00baaa00;
export const ROOM_DEVIL_ANGEL_9960_ADD120_BITS = 0x42f00000; /* 120.0f */
export const ROOM_DEVIL_ANGEL_9960_THRESH_VA = 0x00baabf0;
export const ROOM_DEVIL_ANGEL_9960_THRESH_BITS = 0x451c4000; /* 2500.0f */
export const ROOM_DEVIL_ANGEL_9960_SHIFT_TABLE_VA = 0x00b1f504; /* qword {1, 0xb} */
export const ROOM_DEVIL_ANGEL_9960_SHIFT_HI_VA = 0x00b1f50c; /* 0x10 */
export const ROOM_DEVIL_ANGEL_9960_SHIFT_LO = 1;
export const ROOM_DEVIL_ANGEL_9960_SHIFT_MID = 0xb;
export const ROOM_DEVIL_ANGEL_9960_SHIFT_HI = 0x10;
export const ROOM_DEVIL_ANGEL_9960_SEL_MASK = 7;
export const ROOM_DEVIL_ANGEL_9960_ITER = 8;
export const ROOM_DEVIL_ANGEL_9960_FATAL_VA = 0x00a112c0;
export const ROOM_DEVIL_ANGEL_9960_FATAL_MSG_1 = 0x00b6c620;
export const ROOM_DEVIL_ANGEL_9960_FATAL_MSG_2 = 0x00b6c610;
export const ROOM_DEVIL_ANGEL_9960_FATAL_MSG_3 = 0x00b6c634;
export const ROOM_DEVIL_ANGEL_9960_FATAL_MSG_4 = 0x00b6c66c;
export const ROOM_DEVIL_ANGEL_9960_FATAL_SEED_MSG = 0x00b6bf54;
export const ROOM_DEVIL_ANGEL_9960_FATAL_SEED_ARG = 0x10;
export const ROOM_DEVIL_ANGEL_9960_HOST_74EA50_VA = 0x0074ea50;
export const ROOM_DEVIL_ANGEL_9960_HOST_GETROOM_740BC0_VA = 0x00740bc0;
export const ROOM_DEVIL_ANGEL_9960_HOST_74E9B0_VA = 0x0074e9b0;
export const ROOM_DEVIL_ANGEL_9960_HOST_6F9400_VA = 0x006f9400;
export const ROOM_DEVIL_ANGEL_9960_HOST_6F95A0_VA = 0x006f95a0;
export const ROOM_DEVIL_ANGEL_9960_OWNER_HOST_VA = 0x009be080;
export const ROOM_DEVIL_ANGEL_9960_OWNER_226 = 0x226;
export const ROOM_DEVIL_ANGEL_9960_DOOR_CREATE_HOST_VA = 0x007eea90;
export const ROOM_DEVIL_ANGEL_9960_DOOR_OPS_710FA0_VA = 0x00710fa0;
export const ROOM_DEVIL_ANGEL_9960_DOOR_OPS_710DD0_VA = 0x00710dd0;
export const ROOM_DEVIL_ANGEL_9960_DOOR_OPS_70F810_VA = 0x0070f810;
export const ROOM_DEVIL_ANGEL_9960_DOOR_OP_11 = 0x11;
export const ROOM_DEVIL_ANGEL_9960_TLS_REPORT_VA = 0x00aef29d;
export const ROOM_DEVIL_ANGEL_9960_TLS_6EF590_VA = 0x006ef590;
export const ROOM_DEVIL_ANGEL_9960_TLS_REPORT2_VA = 0x00aef5af;
export const ROOM_DEVIL_ANGEL_9960_TLS_RELEASE_VA = 0x00aef253;
export const ROOM_DEVIL_ANGEL_9960_TLS_GLOBAL = 0x00c8108c;
export const ROOM_DEVIL_ANGEL_9960_TLS_BLOB = 0x00c81090;
export const ROOM_DEVIL_ANGEL_9960_TLS_B15B30 = 0x00b15b30;
export const ROOM_DEVIL_ANGEL_9960_CALLER_806A4A = 0x00806a4a;
export const ROOM_DEVIL_ANGEL_9960_CALLER_73ED55 = 0x0073ed55;
export const ROOM_DEVIL_ANGEL_9960_CALLER_73F552 = 0x0073f552;
export const ROOM_DEVIL_ANGEL_9960_CALLER_5FBDB8 = 0x005fbdb8;
export const ROOM_DEVIL_ANGEL_9960_CALLER_7A7660 = 0x007a7660;

/** L1 init gates (0x7f998a..0x7f9a28; skipped when forceDevil!=0).
    A1 26584==0x2c; A2 room_type==5 && bm1base_10==0x59 && host74ea50
    al; A3 (s32)state in [1,6] (jl/jg) && 2654c bit 0x10000; A4
    1830c!=0; A5 host room8 != 18314; A6 host74e9b0 al. Returns 1 =
    gates pass (body continues). */
export function roomDevilAngel9960InitGates(
  forceDevil, game26584, roomType, bm1base10, host74ea50, gameState,
  game2654c, game1830c, hostRoom8_740bc0, game18314, host74e9b0) {
  if (((forceDevil >>> 0) & 0xff) !== 0) return 1;
  if ((game26584 >>> 0) === ROOM_DEVIL_ANGEL_9960_GAME_26584_GATE) return 0;
  if ((roomType >>> 0) === ROOM_DEVIL_ANGEL_9960_ROOM_TYPE_GATE &&
      (bm1base10 >>> 0) === ROOM_DEVIL_ANGEL_9960_BM1BASE_10_GATE &&
      ((host74ea50 >>> 0) & 0xff) !== 0) return 0;
  const state = gameState | 0; /* SIGNED jl/jg */
  if (state >= ROOM_DEVIL_ANGEL_9960_STATE_MIN &&
      state <= ROOM_DEVIL_ANGEL_9960_STATE_MAX) {
    if (((game2654c >>> 0) & ROOM_DEVIL_ANGEL_9960_2654C_BIT_10000) !== 0) {
      return 0;
    }
  }
  if ((game1830c >>> 0) !== 0) return 0;
  if ((hostRoom8_740bc0 >>> 0) !== (game18314 >>> 0)) return 0;
  if (((host74e9b0 >>> 0) & 0xff) !== 0) return 0;
  return 1;
}

/** L2 state inc (0x7f9a2e..0x7f9a64): t = (~h2) & (h1|26550|c);
    test al,2 -> state+1 (u32 wrap); ok iff ForceDevil byte or
    state' == 6. */
export function roomDevilAngel9960StateInc(
  forceDevil, gameState, host6f9400, host6f95a0, game26550, gameC) {
  const t = (~(host6f95a0 >>> 0)) & ((host6f9400 >>> 0) | (game26550 >>> 0) | (gameC >>> 0));
  const state2 = ((gameState >>> 0) + (((t & 2) !== 0) ? 1 : 0)) >>> 0;
  if (((forceDevil >>> 0) & 0xff) !== 0) return 1;
  return state2 === 6 ? 1 : 0;
}

/** L3 slot -5 marks (0x7f9a6a..0x7f9a8c): 8-slot capture mask (bit i
    = slot_i != 0 && (s32)[slot_i+0x394] == -5); any set -> abort. */
export function roomDevilAngel9960SlotMarkPass(slotF394Neg5Mask) {
  return (((slotF394Neg5Mask >>> 0) & 0xff) === 0) ? 1 : 0;
}

/** L4 ForceAngel' combine (0x7f9aa1..0x7f9ab4 cmovne): owner226 != 0
    ? 1 : (forceAngel & 0xff). */
export function roomDevilAngel9960ForceAngelCombine(forceAngel, owner226) {
  return ((owner226 >>> 0) !== 0 || ((forceAngel >>> 0) & 0xff) !== 0) ? 1 : 0;
}

/** L5 proceed gate (0x7f9aeb..0x7f9b03): (s32)264fc <= (s32)26500
    (jle SIGNED) || forceAngel byte || forceDevil byte -> 1. */
export function roomDevilAngel9960Proceed(
  forceAngel, forceDevil, game264fc, game26500) {
  if ((game264fc | 0) <= (game26500 | 0)) return 1; /* SIGNED jle */
  if (((forceAngel >>> 0) & 0xff) !== 0 || ((forceDevil >>> 0) & 0xff) !== 0) {
    return 1;
  }
  return 0;
}

/** L6 seed fatal (0x7f9b7a..0x7f9b8d): seed == 0 -> HOST fatal
    0xa112c0(0x10, 0xb6bf54) + int3; body resumes (sel 0). */
export function roomDevilAngel9960SeedFatal(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}

/** L7 select (0x7f9b3e..0x7f9bfc). FIXED iff 18308 == -5 &&
    (s32)1831c >= 0 && fixedSlotFree (idx UNBOUNDED, no bm1, no
    smod8). RANDOM: xorshift32 {1,0xb,0x10} & 7; ONE pass i 0..7:
    idx = smod8(sel+i); bm1_38 bit (word 0 only) AND slot free
    (mask bit idx&7) -> idx; NO match -> smod8(sel+7) LAST TRIED
    (never fails; no -1 path in the body; js @0x7f9bfc dead). */
export function roomDevilAngel9960Select(
  game18308, game1831c, fixedSlotFree, bm1_38, slotFreeMask, seed) {
  if ((game18308 >>> 0) === ROOM_DEVIL_ANGEL_9960_MARK_NEG5 &&
      (game1831c | 0) >= 0 && (fixedSlotFree >>> 0) !== 0) {
    return game1831c | 0; /* wide idx, e.g. 32 */
  }
  let t = seed >>> 0;
  t ^= t >>> ROOM_DEVIL_ANGEL_9960_SHIFT_LO;
  t = (t ^ (t << ROOM_DEVIL_ANGEL_9960_SHIFT_MID)) >>> 0;
  t ^= t >>> ROOM_DEVIL_ANGEL_9960_SHIFT_HI;
  const sel = (t >>> 0) & ROOM_DEVIL_ANGEL_9960_SEL_MASK;
  const mask = slotFreeMask >>> 0;
  for (let i = 0; i < ROOM_DEVIL_ANGEL_9960_ITER; i += 1) {
    const idx = roomTca83b0SignedMod(
      ((sel + i) >>> 0), ROOM_TCA83B0_DOOR_WALK_MOD_8);
    if (_doorWalkBit(bm1_38 >>> 0, 0, idx)) {
      if (((mask >>> (idx & 7)) & 1) !== 0) return idx;
    }
  }
  return roomTca83b0SignedMod(
    ((sel + (ROOM_DEVIL_ANGEL_9960_ITER - 1)) >>> 0),
    ROOM_TCA83B0_DOOR_WALK_MOD_8);
}

/** L8 angel proximity (0x7f9cf3..0x7f9d50; per member of the
    [room+0x125c] vec, UNSIGNED jb loop host-side): roomv_28 == 0x2d
    && roomv_2c == 0 && 2500.0f > dist2 ORDERED (comiss/jbe; NaN ->
    skip) -> HOST vtable call [vt+0x28] (result ignored). q/r = IDIV
    SIGNED (s32)slot_24 / (s32)room_c (contract: nonzero divisor,
    not INT_MIN/-1 — the PE #DEs); dy = f32(f32(f32(r)*40+40)-rv33c),
    dx = f32(f32(f32(q)*40+120)-rv340), dist2 = f32(f32(dx*dx)+
    f32(dy*dy)). Per-op f32 via Math.fround. */
export function roomDevilAngel9960AngelProximity(
  slot24, roomC, roomv28, roomv2c, roomv33c, roomv340) {
  if ((roomv28 >>> 0) !== ROOM_DEVIL_ANGEL_9960_ANGEL_ATTR ||
      (roomv2c >>> 0) !== 0) return 0;
  const a = slot24 | 0;
  const d = roomC | 0;
  const q = (a / d) | 0;
  const r = (a % d) | 0;
  const k = _f32Value(ROOM_DEVIL_ANGEL_9960_K40_BITS);
  let dy = Math.fround(Math.fround(Math.fround(r) * k) + k);
  dy = Math.fround(dy - _f32Value(roomv33c >>> 0));
  let dx = Math.fround(Math.fround(Math.fround(q) * k) +
    _f32Value(ROOM_DEVIL_ANGEL_9960_ADD120_BITS));
  dx = Math.fround(dx - _f32Value(roomv340 >>> 0));
  const d2 = Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy));
  const thresh = _f32Value(ROOM_DEVIL_ANGEL_9960_THRESH_BITS);
  return (thresh > d2) ? 1 : 0; /* comiss / jbe NOT taken (NaN -> 0) */
}

/* ===================== ABI v74 (door-create byte-gate body) =============
   0x7f9df0..0x7f9ed4 door-create body (plain prologue, ret 4, ONE byte
   arg [ebp+8]; thiscall receiver = ROOM; bool out (1 @0x7f9eb6/ret
   0x7f9ebc, 0 @0x7f9ecf/ret 0x7f9ed4); 5 E8 + 0 indirect; 1 direct
   caller 0x7f3f32 (arg 0, enclosing 0x7f2800 SEH, result ignored) +
   INDIRECT callback registration 0x86c708 (slot 0xb73bbc, host
   0x890f30). W1 init gates run ONLY when (arg & 0xff) == 0: G1
   [G+0x18304]==[G+0x182d0]; G2 state == 0xb; G3 [G+0x1830c]==0;
   G4 byte obj.e7 != 0 || obj.8 == 2; G5 (u32)[G+0x26630] > 0
   (ja UNSIGNED @0x7f9e55 — compare-flip class) || byte g26589 != 0;
   G6 (host6dae20 & 0xff) == 0 || (host706940.ret[0x74] & 0xff) != 0.
   W2 [room+0x728] == 0 (FULL dword). Creation side host: fatal
   0xa112c0 x2 (0xb6c5ac pass log @0x7f9e6f / 0xb6c584 busy), door
   create 0x7eea90 (idx 1), [slot+0x394] = -7 mark @0x7f9e98, door
   op 0x710fa0 ([room4->0x10+8], 5). All u32 params (byte gates &
   0xff; no uint8_t); the unsigned ja via (x >>> 0) > 0. */

export const ROOM_DOOR_CREATE_9DF0_VA = 0x007f9df0;
export const ROOM_DOOR_CREATE_9DF0_RET_OK_VA = 0x007f9ebc; /* ret 4 (al=1) */
export const ROOM_DOOR_CREATE_9DF0_RET_FAIL_VA = 0x007f9ed4; /* ret 4 (al=0) */
export const ROOM_DOOR_CREATE_9DF0_END_VA = 0x007f9ed7; /* int3 pad */
export const ROOM_DOOR_CREATE_9DF0_NEXT_VA = 0x007f9ee0;
export const ROOM_DOOR_CREATE_9DF0_GAME_GLOBAL = 0x00c71678;
export const ROOM_DOOR_CREATE_9DF0_OBJ_GLOBAL = 0x00c7169c;
export const ROOM_DOOR_CREATE_9DF0_INIT_GATES_VA = 0x007f9e05;
export const ROOM_DOOR_CREATE_9DF0_G1_VA = 0x007f9e0e;
export const ROOM_DOOR_CREATE_9DF0_STATE_GATE_VA = 0x007f9e20;
export const ROOM_DOOR_CREATE_9DF0_G3_VA = 0x007f9e29;
export const ROOM_DOOR_CREATE_9DF0_G4_VA = 0x007f9e36;
export const ROOM_DOOR_CREATE_9DF0_G5_JA_VA = 0x007f9e55;
export const ROOM_DOOR_CREATE_9DF0_G6_VA = 0x007f9e60;
export const ROOM_DOOR_CREATE_9DF0_PASS_LOG_VA = 0x007f9e6f;
export const ROOM_DOOR_CREATE_9DF0_SLOT_GATE_VA = 0x007f9e7e;
export const ROOM_DOOR_CREATE_9DF0_CREATE_VA = 0x007f9e87;
export const ROOM_DOOR_CREATE_9DF0_MARK_VA = 0x007f9e98;
export const ROOM_DOOR_CREATE_9DF0_DOOR_OP_VA = 0x007f9eb1;
export const ROOM_DOOR_CREATE_9DF0_FAIL_LOG_VA = 0x007f9ebf;
export const ROOM_DOOR_CREATE_9DF0_GAME_18304_OFF = 0x18304;
export const ROOM_DOOR_CREATE_9DF0_GAME_182D0_OFF = 0x182d0;
export const ROOM_DOOR_CREATE_9DF0_GAME_1830C_OFF = 0x1830c;
export const ROOM_DOOR_CREATE_9DF0_GAME_26630_OFF = 0x26630;
export const ROOM_DOOR_CREATE_9DF0_GAME_26589_OFF = 0x26589;
export const ROOM_DOOR_CREATE_9DF0_STATE_GATE = 0xb;
export const ROOM_DOOR_CREATE_9DF0_OBJ_E7_OFF = 0xe7;
export const ROOM_DOOR_CREATE_9DF0_OBJ_8_OFF = 8;
export const ROOM_DOOR_CREATE_9DF0_OBJ_8_GATE = 2;
export const ROOM_DOOR_CREATE_9DF0_SLOT_728_OFF = 0x728;
export const ROOM_DOOR_CREATE_9DF0_SLOT_F394_OFF = 0x394;
export const ROOM_DOOR_CREATE_9DF0_MARK_NEG7 = 0xfffffff9; /* -7 clock mark */
export const ROOM_DOOR_CREATE_9DF0_SLOT_IDX = 1;
export const ROOM_DOOR_CREATE_9DF0_DOOR_OP_ARG_2 = 5;
export const ROOM_DOOR_CREATE_9DF0_ROOM4_10_8_OFF = 8;
export const ROOM_DOOR_CREATE_9DF0_HOST_706940_VA = 0x00706940;
export const ROOM_DOOR_CREATE_9DF0_HOST_6DAE20_VA = 0x006dae20;
export const ROOM_DOOR_CREATE_9DF0_FATAL_VA = 0x00a112c0;
export const ROOM_DOOR_CREATE_9DF0_FATAL_MSG_PASS = 0x00b6c5ac;
export const ROOM_DOOR_CREATE_9DF0_FATAL_MSG_BUSY = 0x00b6c584;
export const ROOM_DOOR_CREATE_9DF0_DOOR_CREATE_HOST_VA = 0x007eea90;
export const ROOM_DOOR_CREATE_9DF0_DOOR_OPS_710FA0_VA = 0x00710fa0;
export const ROOM_DOOR_CREATE_9DF0_CALLER_7F3F32 = 0x007f3f32;
export const ROOM_DOOR_CREATE_9DF0_CALLER_HOST_28180_HEAD = 0x007f2800;
export const ROOM_DOOR_CREATE_9DF0_REGISTER_VA = 0x0086c708;
export const ROOM_DOOR_CREATE_9DF0_REGISTER_HOST_890F30_VA = 0x00890f30;
export const ROOM_DOOR_CREATE_9DF0_REGISTER_SLOT = 0x00b73bbc;

/** W1 init gates (0x7f9e05..0x7f9e6d; whole chain skipped when
    (arg & 0xff) != 0 -> trivially 1). G1 [G+0x18304]==[G+0x182d0];
    G2 state == 0xb; G3 [G+0x1830c]==0; G4 byte obj.e7 != 0 ||
    obj.8 == 2; G5 (u32)[G+0x26630] > 0 (ja UNSIGNED @0x7f9e55) ||
    byte g26589 != 0; G6 (host6dae20 & 0xff) == 0 || (ret74 & 0xff)
    != 0. Returns 1 = reached the pass log 0x7f9e6f. */
export function roomDoorCreate9df0InitGates(
  arg, host706940_74, game18304, game182d0, gameState, game1830c,
  objE7, obj8, game26630, game26589, host6dae20) {
  if (((arg >>> 0) & 0xff) !== 0) return 1;
  if ((game18304 >>> 0) !== (game182d0 >>> 0)) return 0; /* G1 */
  if ((gameState >>> 0) !== ROOM_DOOR_CREATE_9DF0_STATE_GATE) return 0; /* G2 */
  if ((game1830c >>> 0) !== 0) return 0; /* G3 */
  if (((objE7 >>> 0) & 0xff) === 0) {
    if ((obj8 >>> 0) !== ROOM_DOOR_CREATE_9DF0_OBJ_8_GATE) return 0; /* G4b */
  }
  if ((game26630 >>> 0) > 0) {
    /* G5a UNSIGNED ja @0x7f9e55 (compare-flip class) */
  } else if (((game26589 >>> 0) & 0xff) === 0) {
    return 0; /* G5b */
  }
  if (((host6dae20 >>> 0) & 0xff) !== 0) {
    if (((host706940_74 >>> 0) & 0xff) === 0) {
      return 0; /* G6b (dl byte) */
    }
  }
  return 1;
}

/** W2 slot gate (0x7f9e7e cmp dword [edi+0x728],0 / jne fail):
    slot-1 cell free (FULL dword) -> create proceeds (host
    0x7eea90 idx 1, [slot+0x394]=-7, 0x710fa0) + ret 1. */
export function roomDoorCreate9df0SlotGate(slot728) {
  return (slot728 >>> 0) === 0 ? 1 : 0;
}

/* ===================== ABI v75 (grid bodies 0x7f9ee0 + 0x7fa0e0) =========
   0x7f9ee0..0x7fa0d9 pos->cell ops + snap (thiscall, ONE arg =
   &{f32 x, f32 y}, in/out on the collision path; ret 4 @0x7fa0d9);
   0x7fa0e0..0x7fa296 index->cell ops + snap-back (ONE arg = &int32
   index; rets 0x7fa288/0x7fa296; int3 pad 0x7fa299+). Census:
   9ee0 = 22 direct callers 0x7fbea4..0x7fe013, a0e0 = 0x7fce17,
   NO push-immediate/registration. Shared pure core: pos->idx
   conversion (cvttss2si trunc-toward-zero chain; CELL 40.0f
   @0xbaa904, HALF 0.5f @0xbaa2d0, ORIGIN_Y 120.0f @0xbaaa00;
   SIGNED bounds; (u32)(w*row+col) imul wrap) + the FIVE unsigned
   idx<=0x1bf ja gates (wasm32 compare-flip class — i64 sign-extend
   form; cpp `<= 0x1bfu` = i32.le_u; signed mutant flips for bit-31
   idx). NO byte gates in either body; NO uint8_t scalars. Host
   leaves typed: 0x81e6e0 (type 7), INDIRECT [vtable+0x14], 0x4e45c0,
   0x7f0800 GetGridCollision, 0x813520 snap; seam captures: three
   grid[idx] reads, edi/edi_type register state at 0x7fa004,
   collision, idx2 = *arg re-read (a0e0). NOTES: room-v75-grid. */

export const ROOM_GRID_9EE0_VA = 0x007f9ee0;
export const ROOM_GRID_9EE0_RET_VA = 0x007fa0d9; /* ret 4 */
export const ROOM_GRID_9EE0_END_VA = 0x007fa0dc; /* int3 pad */
export const ROOM_GRID_9EE0_NEXT_VA = 0x007fa0e0;
export const ROOM_GRID_A0E0_VA = 0x007fa0e0;
export const ROOM_GRID_A0E0_RET_OK_VA = 0x007fa288; /* *arg = idx */
export const ROOM_GRID_A0E0_RET_COLLIDE_VA = 0x007fa296; /* *arg untouched */
export const ROOM_GRID_A0E0_END_VA = 0x007fa299; /* int3 pad */
export const ROOM_GRID_CELL_SIZE_BITS = 0x42200000; /* 40.0f @0xbaa904 */
export const ROOM_GRID_HALF_BITS = 0x3f000000; /* 0.5f @0xbaa2d0 */
export const ROOM_GRID_ORIGIN_Y_BITS = 0x42f00000; /* 120.0f @0xbaaa00 */
export const ROOM_GRID_STRUCT_F_LO_BITS = 0x3760371c; /* @0xc7b640 */
export const ROOM_GRID_STRUCT_F_HI_BITS = 0x37783770; /* @0xc7b644 */
export const ROOM_GRID_INDEX_MAX = 0x1bf;
export const ROOM_GRID_BASE_OFF = 0x24;
export const ROOM_GRID_CELL_STRIDE = 4;
export const ROOM_GRID_COST_OFF = 0x76c;
export const ROOM_GRID_COST_VALUE = 0x384;
export const ROOM_GRID_TYPE_7 = 7;
export const ROOM_GRID_TYPE_5 = 5;
export const ROOM_GRID_TYPE_MARK = 2;
export const ROOM_GRID_TYPE_E = 0xe;
export const ROOM_GRID_TYPE_SKIP = 1;
export const ROOM_GRID_VTABLE_SLOT = 0x14;
export const ROOM_GRID_VTABLE_ARG = 1;
export const ROOM_GRID_ROOM_W_OFF = 0xc;
export const ROOM_GRID_ROOM_H_OFF = 0x10;
export const ROOM_GRID_OOB = 0xffffffff;
export const ROOM_GRID_9EE0_COL_HEAD_VA = 0x007f9efc;
export const ROOM_GRID_9EE0_COL_TRUNC_VA = 0x007f9f11;
export const ROOM_GRID_9EE0_ROW_TRUNC_VA = 0x007f9f35;
export const ROOM_GRID_9EE0_IDX_IMUL_VA = 0x007f9f42;
export const ROOM_GRID_9EE0_GATE1_VA = 0x007f9f4f; /* ja UNSIGNED */
export const ROOM_GRID_9EE0_GATE2_VA = 0x007f9fdd;
export const ROOM_GRID_9EE0_GATE3_VA = 0x007fa00e;
export const ROOM_GRID_9EE0_E1_VA = 0x007f9f68; /* HOST 0x81e6e0 */
export const ROOM_GRID_9EE0_E2_VA = 0x007f9fdf;
export const ROOM_GRID_9EE0_MARK_VA = 0x007f9fed; /* [cell_b+4] = 2 */
export const ROOM_GRID_9EE0_VCALL_VA = 0x007f9ffd;
export const ROOM_GRID_9EE0_E3_GATE_VA = 0x007fa004; /* edi type 0xe */
export const ROOM_GRID_9EE0_COST_STORE_VA = 0x007fa028; /* 0x384 */
export const ROOM_GRID_9EE0_COLLIDE_VA = 0x007fa0aa; /* host 0x7f0800 */
export const ROOM_GRID_9EE0_SNAP_VA = 0x007fa0c4; /* host 0x813520 */
export const ROOM_GRID_9EE0_SNAP_STORE_VA = 0x007fa0cb;
export const ROOM_GRID_A0E0_GATE1_VA = 0x007fa14b;
export const ROOM_GRID_A0E0_GATE2_VA = 0x007fa178;
export const ROOM_GRID_A0E0_MARK_VA = 0x007fa161;
export const ROOM_GRID_A0E0_VCALL_VA = 0x007fa171;
export const ROOM_GRID_A0E0_COST_STORE_VA = 0x007fa19b;
export const ROOM_GRID_A0E0_COLLIDE_VA = 0x007fa1c5;
export const ROOM_GRID_A0E0_IDIV_VA = 0x007fa1d8; /* cdq/idiv SIGNED */
export const ROOM_GRID_A0E0_SNAP_VA = 0x007fa223;
export const ROOM_GRID_A0E0_BACKCONVERT_VA = 0x007fa23a;
export const ROOM_GRID_A0E0_STORE_IDX_VA = 0x007fa280;
export const ROOM_GRID_A0E0_STORE_NEG1_VA = 0x007fa28e;
export const ROOM_GRID_HOST_81E6E0_VA = 0x0081e6e0;
export const ROOM_GRID_HOST_4E45C0_VA = 0x004e45c0;
export const ROOM_GRID_HOST_GET_COLLISION_7F0800_VA = 0x007f0800;
export const ROOM_GRID_HOST_SNAP_813520_VA = 0x00813520;
export const ROOM_GRID_9EE0_CALLER_COUNT = 22;
export const ROOM_GRID_9EE0_CALLER_FIRST = 0x007fbea4;
export const ROOM_GRID_9EE0_CALLER_LAST = 0x007fe013;
export const ROOM_GRID_A0E0_CALLER = 0x007fce17;

/* PE f32 -> i32 cvttss2si: trunc toward zero; NaN/out-of-range ->
   0x80000000 indefinite (wasm i32.trunc_f32_s traps instead — this
   mirror keeps PE parity; pins/draws stay in-range). */
function roomGridCvttss2si(v) {
  if (Number.isNaN(v)) return 0x80000000;
  const t = Math.trunc(v);
  if (t >= 2147483648 || t < -2147483648) return 0x80000000;
  return t | 0;
}

/** L1 pos->idx (9ee0 passes + a0e0 back-conversion): f32-exact
    chain, SIGNED bounds, (u32)(w*row+col) wrap. Returns 0xFFFFFFFF
    out of bounds. */
export function roomGridPosIndex(x, y, roomW, roomH) {
  const f = Math.fround;
  const cell = f(40.0);
  const half = f(0.5);
  const originY = f(120.0);
  /* subss / divss / addss — each op rounds to f32 separately. */
  const colSub = f(f(x) - cell);
  const colDiv = f(colSub / cell);
  const col = roomGridCvttss2si(f(colDiv + half));
  const rowSub = f(f(y) - originY);
  const rowDiv = f(rowSub / cell);
  const row = roomGridCvttss2si(f(rowDiv + half));
  if (col < 0 || col >= (roomW | 0) || row < 0 || row >= (roomH | 0)) {
    return ROOM_GRID_OOB >>> 0;
  }
  return (Math.imul(roomW >>> 0, row >>> 0) + (col >>> 0)) >>> 0;
}

/** L2 grid-body gate (five ja sites): (u32)idx <= 0x1bf. Compare-
    flip class: unsigned is REQUIRED (bit-31 idx skips). */
export function roomGridIndexGate(idx) {
  return (idx >>> 0) <= ROOM_GRID_INDEX_MAX ? 1 : 0;
}

/** L3 9ee0 observable-effect bitmask (bit0 E1 host 0x81e6e0, bit1
    E2a vtable[0x14] call, bit2 E2b mark [cell_b+4]=2, bit3 E3
    0x384 store + 0x4e45c0, bit4 E4 snap via collision). */
export function roomGrid9ee0Effects(idx, cellA, cellAType, edi, ediType,
                                    cellB, cellBType, cellC, cellCType,
                                    collision) {
  const g = (idx >>> 0) <= ROOM_GRID_INDEX_MAX ? 1 : 0;
  let bits = 0;
  if (g && (cellA >>> 0) !== 0 && (cellAType >>> 0) === ROOM_GRID_TYPE_7) {
    bits |= 1;
  }
  if (g && (cellB >>> 0) !== 0) {
    bits |= 2;
    if ((cellBType >>> 0) === ROOM_GRID_TYPE_5) bits |= 4;
  }
  if (g && (edi >>> 0) !== 0 && (ediType >>> 0) === ROOM_GRID_TYPE_E &&
      (cellC >>> 0) !== 0 && (cellCType >>> 0) !== ROOM_GRID_TYPE_SKIP) {
    bits |= 8;
  }
  if ((collision >>> 0) !== 0) bits |= 0x10;
  return bits;
}

/** L4 a0e0 observable-effect bitmask (bit0 vtable[0x14] call, bit1
    mark [cell_b+4]=2, bit2 0x384 store + 0x4e45c0, bit3 snap flow;
    idx2 = *arg re-read after the cell_b block's host calls). */
export function roomGridA0e0Effects(idx, cellB, cellBType, idx2, cellC,
                                    cellCType, collision) {
  const g1 = (idx >>> 0) <= ROOM_GRID_INDEX_MAX ? 1 : 0;
  const g2 = (idx2 >>> 0) <= ROOM_GRID_INDEX_MAX ? 1 : 0;
  let bits = 0;
  if (g1 && (cellB >>> 0) !== 0) {
    bits |= 1;
    if ((cellBType >>> 0) === ROOM_GRID_TYPE_5) bits |= 2;
  }
  if (g2 && (cellC >>> 0) !== 0 && (cellCType >>> 0) === ROOM_GRID_TYPE_E &&
      (cellCType >>> 0) !== ROOM_GRID_TYPE_SKIP) {
    bits |= 4;
  }
  if ((collision >>> 0) !== 0) bits |= 8;
  return bits;
}

/* ===================== ABI v76 (grid pos-snap body 0x7fa2a0) ============
   0x7fa2a0..0x7fa35b pos-snap body after the v75 grid block (plain
   prologue; thiscall receiver = ROOM; ONE arg = &{f32 x, f32 y}
   in/out; ret 4 @0x7fa35b; no SEH; 1 E8 + 0 indirect). Flow: L1
   pos->idx (the v75 shared law roomGridPosIndex — IDENTICAL chain
   0x7fa2c0..0x7fa306) -> push &idx; call HOST 0x7fa360 (SEH cell-op,
   arg IN/OUT) -> re-read idx @0x7fa31b -> L2a idx->pos (this unit):
   cdq/idiv SIGNED by w @0x7fa31f/0x7fa320 (q, r trunc toward zero),
   x = f32(r)*40 + 40, y = f32(q)*40 + 120, movss @0x7fa34d/0x7fa351.
   Tail runs even for idx == -1 (oob / host-kept -1): w > 1 -> q 0,
   r -1 -> (0.0, 120.0); w == 1 -> q -1, r 0 -> (40.0, 80.0).
   Contracts (x86 idiv #DE, excluded): w != 0, !(idx == INT32_MIN &&
   w == -1). Census: 4 direct callers 0x7fd351..0x7fd6ad; NO
   push-immediate/dword registration. HOST 0x7fa360..0x7fa7c1 (SEH,
   ret 4, &idx in/out): 8 direct callers 0x7fa316 + 0x7fbf8c..0x7fd002.
   Compare-flip class: SIGNED division REQUIRED (unsigned mutant
   flips for negative idx). No byte gates; no uint8_t. NOTES:
   room-v76-a2a0. */

export const ROOM_GRID_A2A0_VA = 0x007fa2a0;
export const ROOM_GRID_A2A0_POS_HEAD_VA = 0x007fa2c0; /* movss xmm0,[edi] */
export const ROOM_GRID_A2A0_IDX_IMUL_VA = 0x007fa301; /* imul/add wrap */
export const ROOM_GRID_A2A0_OOB_VA = 0x007fa308; /* or eax,-1 */
export const ROOM_GRID_A2A0_HOST_CALL_VA = 0x007fa316; /* call 0x7fa360 */
export const ROOM_GRID_A2A0_ARG_REREAD_VA = 0x007fa31b; /* mov eax,[esp+0xc] */
export const ROOM_GRID_A2A0_IDIV_VA = 0x007fa31f; /* cdq/idiv SIGNED by w */
export const ROOM_GRID_A2A0_BACKCONVERT_VA = 0x007fa323; /* cvtdq2ps/mulss/addss */
export const ROOM_GRID_A2A0_STORE_X_VA = 0x007fa34d; /* movss [edi],xmm1 */
export const ROOM_GRID_A2A0_STORE_Y_VA = 0x007fa351; /* movss [edi+4],xmm0 */
export const ROOM_GRID_A2A0_RET_VA = 0x007fa35b; /* ret 4 */
export const ROOM_GRID_A2A0_END_VA = 0x007fa35e; /* int3 pad */
export const ROOM_GRID_A2A0_NEXT_VA = 0x007fa360; /* SEH cell-op (host) */
export const ROOM_GRID_HOST_CELLOP_A2A0_VA = 0x007fa360;
export const ROOM_GRID_A2A0_CALLER_COUNT = 4;
export const ROOM_GRID_A2A0_CALLER_FIRST = 0x007fd351;
export const ROOM_GRID_A2A0_CALLER_LAST = 0x007fd6ad;
export const ROOM_GRID_CELLOP_CALLER_COUNT = 8;
export const ROOM_GRID_CELLOP_CALLER_FIRST = 0x007fa316;
export const ROOM_GRID_CELLOP_CALLER_LAST = 0x007fd002;

/** L2a idx->pos (post-host back-conversion 0x7fa31b..0x7fa351):
    SIGNED idiv by w (q = trunc(idx/w), r = remainder, dividend-sign
    — x86 idiv parity), x = f32(r)*40.0f + 40.0f, y = f32(q)*40.0f +
    120.0f (cvtdq2ps/mulss/addss f32-exact chain). Returns
    {x, y} as f32 numbers. */
export function roomGridA2a0IdxToPos(idx, roomW) {
  const f = Math.fround;
  const i = idx | 0;
  const w = roomW | 0;
  const q = Math.trunc(i / w); /* idiv quotient (trunc toward zero) */
  const r = i % w;             /* idiv remainder (sign of dividend) */
  const scale = f(40.0);
  const base = f(120.0);
  const x = f(f(f(r) * scale) + scale);
  const y = f(f(f(q) * scale) + base);
  return { x, y };
}

/* ===================== ABI v77 (grid-half body 0x7fa7d0) ==============
   0x7fa7d0..0x7fa91f grid-half body after the v76 SEH cell-op
   0x7fa360..0x7fa7c1 (record-only host; int3 pad 0x7fa7c4..0x7fa7cf;
   plain prologue; thiscall receiver = ROOM; ZERO args; ret 0
   @0x7fa91f; no SEH; 4 E8 + 0 indirect). Flow (PE bytes verified):
   w<0 -> END (SIGNED js @0x7fa818); scale pair f32(w)*0.5f /
   f32(h)*0.5f (cvtdq2ps/mulss, HALF 0.5f @0xbaa2d0 = 0x3f000000,
   stores @0x7fa7fb/0x7fa810); row loop [0..=w] + col loop [0..=h]
   (SIGNED jle INCLUSIVE @0x7fa903/0x7fa913; h<0 -> row loop only
   @0x7fa824); inner gates SIGNED row>=0 && row<w && col>=0 &&
   col<h (@0x7fa832..0x7fa84d); idx = (u32)(w*col + row) 32-bit
   wrap (imul @0x7fa853 + lea @0x7fa856) — COL-major, TRANSPOSED
   vs the v75/v76 L1 (w*row+col); gate (u32)idx <= 0x1bf UNSIGNED
   (cmp/ja @0x7fa85d, reuses v75 isaac_room_grid_index_gate);
   per-cell: cell = grid[idx] ([+0x24+idx*4]) -> HOST 0xaf08b1
   (5-arg cdecl lookup, ret ptr) -> HOST Room::GetGridCollision
   0x7f0800 (thiscall, arg idx) -> PURE dist2 = (scale_x -
   f32(row))^2 + (scale_y - f32(col))^2 (subss/mulss/addss
   f32-exact @0x7fa897..0x7fa8c3) -> R2 = 2 * u32trunc(dist2)
   (0xaefca0 helper: [0xc7162c] quality >= 6 -> vcvttss2usi else
   manual fallback; + add eax,eax @0x7fa8cf) -> PURE store
   (ent->[0xc]==0 FULL-dword gate; R2 != 0 -> [0x18]=R2, [0xc]=1;
   R2 == 0 -> [0xc]=2 + HOST 0x714610 thiscall). Census: 1 direct
   rel32 caller 0x7fbd16 (`mov ecx,esi; call` — the room-type
   dispatch band 0x7fbcf0..0x7fd759); NO push-immediate/dword
   registration. Next 0x7fa920 = /GS RNG-pick body (v78 census,
   host-only).
   u32trunc quality paths agree for EVERY nonnegative x (the
   vcvttss2usi u32 saturation at 2^32 mirrors the fallback's
   jae-0x9f000000 0xFFFFFFFF tail); divergence ONLY for x < -1.0f
   (fallback 0xFFFFFFFF vs 0) and NaN (0xFFFFFFFF vs 0) —
   unreachable from a sum of squares but pinned in the law tests.
   NOTES: room-v77-7fa7d0. */

export const ROOM_GRID_HALF_VA = 0x007fa7d0;
export const ROOM_GRID_HALF_SCALE_X_VA = 0x007fa7f3; /* mulss [0xbaa2d0] */
export const ROOM_GRID_HALF_SCALE_X_STORE_VA = 0x007fa7fb;
export const ROOM_GRID_HALF_SCALE_Y_VA = 0x007fa808;
export const ROOM_GRID_HALF_SCALE_Y_STORE_VA = 0x007fa810;
export const ROOM_GRID_HALF_W_NEG_GATE_VA = 0x007fa818;
export const ROOM_GRID_HALF_H_NEG_GATE_VA = 0x007fa824;
export const ROOM_GRID_HALF_ROW_GE_W_VA = 0x007fa83d;
export const ROOM_GRID_HALF_COL_GE_H_VA = 0x007fa84d;
export const ROOM_GRID_HALF_IDX_IMUL_VA = 0x007fa853;
export const ROOM_GRID_HALF_IDX_LEA_VA = 0x007fa856;
export const ROOM_GRID_HALF_IDX_GATE_VA = 0x007fa85d;
export const ROOM_GRID_HALF_LOOKUP_VA = 0x007fa87b;
export const ROOM_GRID_HALF_COLLIDE_VA = 0x007fa88e;
export const ROOM_GRID_HALF_DIST2_HEAD_VA = 0x007fa897;
export const ROOM_GRID_HALF_DIST2_SUB_X_VA = 0x007fa8b3;
export const ROOM_GRID_HALF_DIST2_SUB_Y_VA = 0x007fa8b7;
export const ROOM_GRID_HALF_DIST2_ADD_VA = 0x007fa8c3;
export const ROOM_GRID_HALF_CONV_VA = 0x007fa8ca;
export const ROOM_GRID_HALF_DOUBLE_VA = 0x007fa8cf;
export const ROOM_GRID_HALF_STORE_GATE_VA = 0x007fa8d1;
export const ROOM_GRID_HALF_STORE_R2_VA = 0x007fa8db;
export const ROOM_GRID_HALF_STORE_C1_VA = 0x007fa8de;
export const ROOM_GRID_HALF_STORE_C2_VA = 0x007fa8e9;
export const ROOM_GRID_HALF_HOST_714610_VA = 0x007fa8f0;
export const ROOM_GRID_HALF_RET_VA = 0x007fa91f;
export const ROOM_GRID_HALF_END_VA = 0x007fa920;
export const ROOM_GRID_HALF_NEXT_VA = 0x007fa920;
export const ROOM_GRID_HALF_CALLER_COUNT = 1;
export const ROOM_GRID_HALF_CALLER = 0x007fbd16;
export const ROOM_GRID_HALF_CONV_VA_HELPER = 0x00aefca0;
export const ROOM_GRID_HALF_QUALITY_GLOBAL = 0x00c7162c;
export const ROOM_GRID_HALF_QUALITY_SSE41 = 6;
export const ROOM_GRID_HALF_LOOKUP_VA_HOST = 0x00af08b1;
export const ROOM_GRID_HALF_COLLIDE_VA_HOST = 0x007f0800;
export const ROOM_GRID_HALF_714610_HOST_VA = 0x00714610;
export const ROOM_GRID_HALF_LOOKUP_ARG0 = 0x00c5d7a4;
export const ROOM_GRID_HALF_LOOKUP_ARG1 = 0x00c5e8b8;
export const ROOM_GRID_HALF_LOOKUP_TABLE_VA = 0x00b1a424;
export const ROOM_GRID_HALF_HALF_BITS = 0x3f000000; /* 0.5f @0xbaa2d0 */
export const ROOM_GRID_HALF_IDX_MAX = 0x1bf;

/** L-A scale pair (0x7fa7e9..0x7fa810): mvdd/cvtdq2ps of the SIGNED
    int32 bits then mulss [0xbaa2d0] = 0.5f. Returns {x, y} f32. */
export function roomGridHalfScale(w, h) {
  const f = Math.fround;
  const half = peBitsToF32(0x3f000000);
  return {
    x: f(f(w | 0) * half),
    y: f(f(h | 0) * half),
  };
}

/** L-B col-major idx (0x7fa853..0x7fa856): idx = (u32)(w*col + row)
    32-bit wrap (imul + lea). The (u32)idx <= 0x1bf gate reuses the
    v75 isaac_room_grid_index_gate (same cmp/ja constant). */
export function roomGridHalfIdx(w, col, row) {
  return (Math.imul(w | 0, col | 0) + (row | 0)) >>> 0;
}

/** u32trunc law (0x00aefca0): quality >= 6 -> vcvttss2usi (trunc
    toward zero, saturating: <=0/NaN -> 0, >= 2^32 -> 0xFFFFFFFF);
    else manual fallback 0xaefcb0..0xaefce5 (bit-exact). The
    paths agree for every nonnegative x; divergence only for
    x < -1.0f or NaN (fallback 0xFFFFFFFF) — kept faithful. */
export function roomF32ToU32Trunc(value, quality) {
  const f = Math.fround;
  const x = f(value);
  if ((quality | 0) >= 6) {
    /* vcvttss2usi path */
    if (!(x > 0)) return 0;             /* NaN and negatives -> 0 */
    if (x >= 4294967296) return 0xffffffff; /* saturate */
    return Math.trunc(x) >>> 0;         /* x < 2^32: exact */
  }
  /* manual fallback (bit-exact) */
  const bits = peF32ToBits(x);
  const t = Math.imul(bits, 2) >>> 0;   /* shl eax,1 */
  const sign = (bits >>> 31) & 1;
  if (sign !== 0) {
    if (t < 0x7f000000) {
      /* |x| < 1.0f: cvttss2si trunc toward zero = 0 for the
         domain; keep the faithful signed-trunc bit pattern: */
      return Math.trunc(x) >>> 0;
    }
    return 0xffffffff;
  }
  if (t < 0x9e000000) {
    return Math.trunc(x) >>> 0;         /* 0 <= x < 2^31: cvttss2si */
  }
  if (t < 0x9f000000) {
    return ((t << 7) | 0x80000000) >>> 0;
  }
  return 0xffffffff;
}

/** L-C dist2 (0x7fa897..0x7fa8cf): d2 = f32 chain (scale_x -
    f32(row))^2 + (scale_y - f32(col))^2 then R2 = 2 *
    u32trunc(d2) (u32 wrap). scale_x_bits/scale_y_bits are the
    f32 bit patterns (the machine holds them in memory as f32). */
export function roomGridHalfDist2(scaleXBits, scaleYBits, col, row, quality) {
  const f = Math.fround;
  const sx = peBitsToF32(scaleXBits);
  const sy = peBitsToF32(scaleYBits);
  const r = f(row | 0);
  const c = f(col | 0);
  const dx = f(sx - r); /* subss xmm3, xmm0 (row) */
  const dy = f(sy - c); /* subss xmm2, xmm1 (col) */
  const d2 = f(f(dx * dx) + f(dy * dy)); /* mulss/mulss/addss */
  return (Math.imul(roomF32ToU32Trunc(d2, quality), 2)) >>> 0;
}

/** L-D store law (0x7fa8d1..0x7fa8e9): returns action 0 (no
    store), 1 ([0x18]=r2, [0xc]=1), 2 ([0xc]=2 + HOST 0x714610);
    field_c == 0 FULL-dword gate. */
export function roomGridHalfCellStore(entFieldC, entField18, r2) {
  const c = entFieldC >>> 0;
  const r18 = entField18 >>> 0;
  const v = r2 >>> 0;
  if (c !== 0) return { action: 0, c, r18 };
  if (v !== 0) return { action: 1, c: 1, r18: v };
  return { action: 2, c: 2, r18 };
}

/** Host gate: 0x714610 fires iff the store law takes action 2. */
export function roomGridHalfCellAction(entFieldC, r2) {
  return (entFieldC >>> 0) === 0 && (r2 >>> 0) === 0 ? 1 : 0;
}

/* ===================== ABI v78: CENSUS rows (NO laws, ABI stays 77)
   v77 handoff's next body 0x7fa920 (/GS-cookie — NOT SEH; the
   "/GS SEH fn" label corrected: no fs:[0] frame) = xorshift-
   parameterized RNG picker 0x7fa920..0x7fb218. NOT thiscall: arg0 =
   [ebp+8] ptr to 16-byte xorshift state {x,a,b,c}; arg1 = [ebp+0xc]
   byte flag; ret 8 @0x7fb15b/0x7fb208 + tail epilogue @0x7fb20b..
   0x7fb218. 32 E8 all HOST (seed pulls 0x9be080 x5 / 0x9be6b0 /
   0x9bea80 / 0x44bfb0 x5 boolean gates / 0x7e9020 x2 / 0x7cb6e0 /
   0x771550 x2 / assert-alloc 0xa112c0 x13 / cookie 0xaef12b x2);
   inline xorshift32 step repeats 10x but is NEVER a standalone
   callee — zero pure islands. Callers: 2 direct rel32 = 0x7fb4a6
   (dispatch master; push 0 + &[ebp-0xac], result->edi) + 0x827720
   (inside 0x8276e0; push 1 + &[ebp-0x30], retry loop cmp 0xa);
   lea-corrected: both lea'd LOCAL buffers, no convention correction.
   ZERO dword refs. Next band body 0x7fb254 = REAL SEH thiscall
   room-type dispatch master 0x7fb254..0x7fe0b3 (handler 0xb013bd,
   /GS; single ret @0x7fe0b3 via shared epilogue 0x7fe084; jump
   tables @0x7fe0b4/0x7fe0f8 hold v77 caller 0x7fbd16); 346 E8 +
   2 indirect ([eax+0x3c] @0x7fdfc8 / [eax+0xc] @0x7fdfcf) all HOST
   except the family laws it consumes (0x428b20 v54 x25, 0x7fa2a0 v76
   x4, 0x7fa7d0 v77 x1, 0x7fa360 host-record x7, 0x7fa920 v78 census
   x1); 0 rel32 + 0 dword refs — pointer-only entry. Next frontier
   0x7fe220 = another SEH body (not opened). NOTES:
   room-v78-7fa920. */
export const ROOM_RNG_PICK_7FA920_VA = 0x007fa920;
export const ROOM_RNG_PICK_7FA920_RET_VA = 0x007fb15b;
export const ROOM_RNG_PICK_7FA920_RET2_VA = 0x007fb208;
export const ROOM_RNG_PICK_7FA920_END_VA = 0x007fb218;
export const ROOM_RNG_PICK_7FA920_SWITCH_BYTE_TBL_VA = 0x007fb238;
export const ROOM_RNG_PICK_7FA920_SWITCH_DWORD_TBL_VA = 0x007fb220;
export const ROOM_RNG_PICK_7FA920_GS_BLOB_VA = 0x00bf93b4;
export const ROOM_RNG_PICK_7FA920_COOKIE_CHECK_VA = 0x00aef12b;
export const ROOM_RNG_PICK_7FA920_ASSERT_VA = 0x00a112c0;
export const ROOM_RNG_PICK_7FA920_F32_SCALE_VA = 0x00ba9ff0;
export const ROOM_RNG_PICK_7FA920_CALLER_COUNT = 2;
export const ROOM_RNG_PICK_7FA920_CALLER_A = 0x007fb4a6;
export const ROOM_RNG_PICK_7FA920_CALLER_B = 0x00827720;
export const ROOM_RNG_PICK_7FA920_CALLER_B_FN = 0x008276e0;
export const ROOM_DISPATCH_7FB254_VA = 0x007fb254;
export const ROOM_DISPATCH_7FB254_RET_VA = 0x007fe0b3;
export const ROOM_DISPATCH_7FB254_EPILOGUE_VA = 0x007fe084;
export const ROOM_DISPATCH_7FB254_TABLE_A_VA = 0x007fe0b4;
export const ROOM_DISPATCH_7FB254_TABLE_B_VA = 0x007fe0f8;
export const ROOM_DISPATCH_7FB254_NEXT_VA = 0x007fe220;

/* ============= ABI v79 census (NO laws, ABI stays 77) =============
   0x7fe220..0x7febf7 SEH thiscall grid-spawn picker (handler
   0xb01417, fs:[0] @0x7fe242/@0x7febe9, /GS cookie popped without
   check — check in handler; single ret 0 @0x7febf7). 29 E8 + 4
   indirect, ONE family callee 0x428b20 (v54) @0x7fe476; all pure
   islands sit AFTER the handler install -> SEH band rule -> HOST
   census row. Caller 0x00803e05 (inside FrameOpaque_802980) gated
   on byte [Room+0x11f4]==0 (already modeled by the B9B11 law). Next
   frontier 0x7fec00 = /GS-only thiscall. NOTES: room-v79-7fe220. */
export const ROOM_GRID_SPAWN_7FE220_VA = 0x007fe220;
export const ROOM_GRID_SPAWN_7FE220_RET_VA = 0x007febf7;
export const ROOM_GRID_SPAWN_7FE220_END_VA = 0x007febf8;
export const ROOM_GRID_SPAWN_7FE220_FAIL_STUB_VA = 0x007febf8;
export const ROOM_GRID_SPAWN_7FE220_NEXT_VA = 0x007fec00;
export const ROOM_GRID_SPAWN_7FE220_HANDLER_VA = 0x00b01417;
export const ROOM_GRID_SPAWN_7FE220_INSTALL_VA = 0x007fe242;
export const ROOM_GRID_SPAWN_7FE220_RESTORE_VA = 0x007febe9;
export const ROOM_GRID_SPAWN_7FE220_COOKIE_BLOB_VA = 0x00bf93b4;
export const ROOM_GRID_SPAWN_7FE220_COOKIE_CHECK_VA = 0x00aef12b;
export const ROOM_GRID_SPAWN_7FE220_CXXF_HANDLER_VA = 0x00bc1fe0;
export const ROOM_GRID_SPAWN_7FE220_FAIL_HOST_VA = 0x00415bc0;
export const ROOM_GRID_SPAWN_7FE220_FAIL_STRING_VA = 0x00b1b634;
export const ROOM_GRID_SPAWN_7FE220_GAME_GLOBAL = 0x00c71678;
export const ROOM_GRID_SPAWN_7FE220_OBJ_GLOBAL = 0x00c7169c;
export const ROOM_GRID_SPAWN_7FE220_GRID_OFF = 0x18300;
export const ROOM_GRID_SPAWN_7FE220_POS_VEC_VA = 0x00c7b640;
export const ROOM_GRID_SPAWN_7FE220_CELL_VTABLE_VA = 0x00b68648;
export const ROOM_GRID_SPAWN_7FE220_ALLOC_A = 0x14;
export const ROOM_GRID_SPAWN_7FE220_ALLOC_B = 0x19c;
export const ROOM_GRID_SPAWN_7FE220_VEC_WORD_FLAGS = 0x101;
export const ROOM_GRID_SPAWN_7FE220_GRID_COST_OFF = 0x76c;
export const ROOM_GRID_SPAWN_7FE220_GRID_COST_VALUE = 0x384;
export const ROOM_GRID_SPAWN_7FE220_SLOT_LIST_BASE_OFF = 0x1794;
export const ROOM_GRID_SPAWN_7FE220_SLOT_LIST_END_OFF = 0x1798;
export const ROOM_GRID_SPAWN_7FE220_SLOT_STRIDE = 0x10;
export const ROOM_GRID_SPAWN_7FE220_SLOT_CAP = 0x2d;
export const ROOM_GRID_SPAWN_7FE220_CELL_TYPE = 0xe;
export const ROOM_GRID_SPAWN_7FE220_CELL_FLAGS_16C = 0xf;
export const ROOM_GRID_SPAWN_7FE220_CALLER_COUNT = 1;
export const ROOM_GRID_SPAWN_7FE220_CALLER_A = 0x00803e05;
export const ROOM_GRID_SPAWN_7FE220_CALLER_A_FN = 0x00802980;
export const ROOM_GRID_SPAWN_7FE220_CALLER_A_GATE_OFF = 0x11f4;
export const ROOM_GRID_SPAWN_7FE220_GENRAND_VA = 0x006eef60;
export const ROOM_GRID_SPAWN_7FE220_RELAY_428B20_VA = 0x00428b20;
export const ROOM_GRID_SPAWN_7FE220_SITE_428B20 = 0x007fe476;
export const ROOM_GRID_SPAWN_7FE220_MAGIC_4B18967F = 0x4b18967f;
export const ROOM_GRID_SPAWN_7FE220_MAGIC_SITE = 0x007fe438;

/* ===================== ABI v80 (Room::Update(Entity*) 0x7fec00 prefix) ====
   /GS-ONLY thiscall body 0x7fec00..0x80044f (ret 4 @0x80044f, cookie
   [0xbf93b4]^ebp, epilogue 0x80043f; 10 direct rel32 callers
   0x44056b..0x707aa9 — all `push <entity>; mov ecx,[Game+0x18300]`,
   no lea args). identify-zhl: no match. Pure prefix 0x7fec00..0x7fecbd
   (first host call = assert 0xa112c0 @0x7fecc2). Landed laws A (entity
   skip gate 0x7fec21..0x7fec9b) + B (diet flag 0x7fec42..0x7fec64),
   ABI 77 -> 78. NOTES: room-v81-7fec00. */

export const ROOM_UPDATE_7FEC00_VA = 0x007fec00;
export const ROOM_UPDATE_7FEC00_RET_VA = 0x0080044f;
export const ROOM_UPDATE_7FEC00_END_VA = 0x00800452;
export const ROOM_UPDATE_7FEC00_NEXT_VA = 0x00800460; /* frontier band */
export const ROOM_UPDATE_7FEC00_SKIP_GATE_VA = 0x007fec21;
export const ROOM_UPDATE_7FEC00_DIET_HEAD_VA = 0x007fec42;
export const ROOM_UPDATE_7FEC00_FLAG_GATE_VA = 0x007fec65;
export const ROOM_UPDATE_7FEC00_FLAG_STORE_VA = 0x007fec8d;
export const ROOM_UPDATE_7FEC00_FLAG_B_TEST_VA = 0x007fec93;
export const ROOM_UPDATE_7FEC00_EPILOGUE_VA = 0x0080043f;
export const ROOM_UPDATE_7FEC00_COOKIE_BLOB_VA = 0x00bf93b4;
export const ROOM_UPDATE_7FEC00_COOKIE_CHECK_VA = 0x00aef12b;
export const ROOM_UPDATE_7FEC00_ASSERT_VA = 0x00a112c0;
export const ROOM_UPDATE_7FEC00_GAME_GLOBAL = 0x00c71678;
export const ROOM_UPDATE_7FEC00_GAME_269C8_OFF = 0x269c8;
export const ROOM_UPDATE_7FEC00_GAME_269C8_GREED = 2;
export const ROOM_UPDATE_7FEC00_GAME_269C8_GREEDIER = 3;
export const ROOM_UPDATE_7FEC00_ENT_TYPE_OFF = 0x28;
export const ROOM_UPDATE_7FEC00_ENT_SUB_OFF = 0x2c;
export const ROOM_UPDATE_7FEC00_ROOM_TYPE_OFF = 8;
export const ROOM_UPDATE_7FEC00_ENT_FLAGS_OFF = 0x168;
export const ROOM_UPDATE_7FEC00_ENT_FLAGS2_OFF = 0x16c;
export const ROOM_UPDATE_7FEC00_DIET_LOCAL_OFF = 0x1d;
export const ROOM_UPDATE_7FEC00_SKIP_TYPE = 0x19b;
export const ROOM_UPDATE_7FEC00_SKIP_SUB_A = 1;
export const ROOM_UPDATE_7FEC00_SKIP_SUB_B = 2;
export const ROOM_UPDATE_7FEC00_FLAG_SKIP_A = 0x80100000;
export const ROOM_UPDATE_7FEC00_FLAG_SKIP_B = 0x20000000;
export const ROOM_UPDATE_7FEC00_FLAG_SET = 0x100000;
export const ROOM_UPDATE_7FEC00_DIET_ROOM_TYPE = 1;
export const ROOM_UPDATE_7FEC00_CALLER_COUNT = 10;
export const ROOM_UPDATE_7FEC00_CALLER_FIRST = 0x0044056b;
export const ROOM_UPDATE_7FEC00_CALLER_LAST = 0x00707aa9;

/** A — entity skip gate (PE 0x7fec21..0x7fec9b). Machine order:
    cmp [ent+0x28],0x19b FULL dword; jne past; sub 1/2 -> exit (skip
    WITHOUT store); [ent+0x168] & 0x80100000 -> exit (no store);
    or 0x100000 + STORE; then & 0x20000000 -> exit (skip AFTER store).
    Returns {skip, stored, flagsOut}; skip 1 = prefix exits. */
export function roomUpdateEntitySkipGate(type28, subtype2c, flags168) {
  const t = type28 >>> 0;
  const s = subtype2c >>> 0;
  const f = flags168 >>> 0;
  if (t === ROOM_UPDATE_7FEC00_SKIP_TYPE &&
      (s === ROOM_UPDATE_7FEC00_SKIP_SUB_A ||
       s === ROOM_UPDATE_7FEC00_SKIP_SUB_B)) {
    return { skip: 1, stored: 0, flagsOut: f };
  }
  if ((f & ROOM_UPDATE_7FEC00_FLAG_SKIP_A) !== 0) {
    return { skip: 1, stored: 0, flagsOut: f };
  }
  const flagsOut = (f | ROOM_UPDATE_7FEC00_FLAG_SET) >>> 0;
  return {
    skip: (f & ROOM_UPDATE_7FEC00_FLAG_SKIP_B) !== 0 ? 1 : 0,
    stored: 1,
    flagsOut,
  };
}

/** B — diet flag (PE 0x7fec42..0x7fec64): byte local [ebp-0x1d] =
    (Game[0x269c8] in {2,3}) && Room[8] == 1; FULL dword cmps both;
    result modeled uint32_t 0/1. */
export function roomUpdateDietFlag(game269c8, roomType8) {
  const g = game269c8 >>> 0;
  const r = roomType8 >>> 0;
  if (g !== ROOM_UPDATE_7FEC00_GAME_269C8_GREED &&
      g !== ROOM_UPDATE_7FEC00_GAME_269C8_GREEDIER) {
    return 0;
  }
  return r === ROOM_UPDATE_7FEC00_DIET_ROOM_TYPE ? 1 : 0;
}

/* ===================== ABI v81 (7f7a40 a1 tail + greed probes) ============
   UNIT A — FUN_007f7a40 a1 TAIL (PE 0x7f7e34..0x7f817c). Mirrors of
   isaac_room_trigger_clear_audio_7f7a40_tail_rot / _base / _item_plan.
   Transcribed from the instruction stream (cpu-dump/007f7a40.txt), NOT
   from the C++: every f32 op rounds via fround exactly where the PE has
   mulss/subss/addss; the u32->f32 path is cvtdq2pd(SIGNED) + sign-fix
   addsd {0.0,2^32} + cvtpd2ps. */

export const ROOM_TCA40_TAIL_VA = 0x007f7e34;
export const ROOM_TCA40_TAIL_LOOP_HEAD_VA = 0x007f7f30;
export const ROOM_TCA40_ANGLE_BITS_VA = 0x00baa54c;
export const ROOM_TCA40_SIGN_MASK_BITS = 0x80000000;
export const ROOM_TCA40_ANGLE_F32_BITS = 0x3fc90fdb;
export const ROOM_TCA40_SCALE_POW2M32_VA = 0x00ba9ff4;
export const ROOM_TCA40_SCALE_POW2M32_BITS = 0x2f800000;
export const ROOM_TCA40_ONE_VA = 0x00baa454;
export const ROOM_TCA40_ONE_BITS = 0x3f800000;
export const ROOM_TCA40_TWO_VA = 0x00baa630;
export const ROOM_TCA40_TWO_BITS = 0x40000000;
export const ROOM_TCA40_VOL_MUL_VA = 0x00baa784;
export const ROOM_TCA40_VOL_MUL_BITS = 0x40a00000;
export const ROOM_TCA40_PITCH_MUL_VA = 0x00baa704;
export const ROOM_TCA40_PITCH_MUL_BITS = 0x4048f5c3;
export const ROOM_TCA40_THR_MUL_VA = 0x00baa81c;
export const ROOM_TCA40_THR_MUL_BITS = 0x41200000;
export const ROOM_TCA40_SPEED_MUL_VA = 0x00baa87c;
export const ROOM_TCA40_SPEED_MUL_BITS = 0x41a00000;
export const ROOM_TCA40_TILE_VA = 0x00baa904;
export const ROOM_TCA40_TILE_BITS = 0x42200000;
export const ROOM_TCA40_TILE_ADD_VA = 0x00baaa00;
export const ROOM_TCA40_TILE_ADD_BITS = 0x42f00000;
export const ROOM_TCA40_NEG1_VA = 0x00baad50;
export const ROOM_TCA40_NEG1_BITS = 0xbf800000;
export const ROOM_TCA40_HOST_GENRAND_VA = 0x006eef60;
export const ROOM_TCA40_HOST_SPAWN_428B20_VA = 0x00428b20;
export const ROOM_TCA40_CREATE_TYPE = 0x3e8;
export const ROOM_TCA40_CREATE_VARIANT = 0x3b;
export const ROOM_TCA40_TIMER_BASE = 0x1e;
export const ROOM_TCA40_TIMER_DIV = 10;
export const ROOM_TCA40_GENRAND_PER_ITER = 7;

const _f32bits = (v) => new Uint32Array(new Float32Array([v]).buffer)[0];
const _bitsf32 = (b) => new Float32Array(new Uint32Array([b >>> 0]).buffer)[0];
const _fr = Math.fround;

/** u32ToF32: cvtdq2pd treats the dword SIGNED; shr 31 picks the sign bit
 *  and addsd [sign*8 + 0xbacb00] adds 2^32 back for negatives; cvtpd2ps. */
export function roomTca40U32ToF32(bits) {
  const s = bits | 0;
  let d = s;
  if (s < 0) d += 4294967296.0;
  return _fr(d);
}

/** ROT (0x7f7e55..0x7f7ec8): negate the 0x67f1d0 vec pair by SIGN-BIT
 *  flip (xorps 0xbacb70 mask — not an arithmetic negate), then the fixed
 *  pi/2 rotation with host cos/sin fed back:
 *  r0 = f32(f32(a*c) - f32(b*s)); r1 = f32(f32(a*s) + f32(b*c)). */
export function roomTriggerClearAudio7f7a40TailRot(
    vec0Bits, vec4Bits, cosAngle, sinAngle) {
  const a = _bitsf32((vec0Bits ^ ROOM_TCA40_SIGN_MASK_BITS) >>> 0);
  const b = _bitsf32((vec4Bits ^ ROOM_TCA40_SIGN_MASK_BITS) >>> 0);
  const c = _fr(cosAngle);
  const s = _fr(sinAngle);
  return {
    r0Bits: _f32bits(_fr(_fr(a * c) - _fr(b * s))),
    r1Bits: _f32bits(_fr(_fr(a * s) + _fr(b * c))),
  };
}

/** BASE (0x7f7eec..0x7f7f21): SIGNED idiv([door+0x24], [[Game]+0xc]);
 *  y = rem*40 + 40 ; x = q*40 + 120. game_c == 0 faults in the PE ->
 *  div_ok 0, no invented values. */
export function roomTriggerClearAudio7f7a40TailBase(doorF24, gameC) {
  if (gameC === 0) {
    return { divOk: 0, xBits: 0, yBits: 0, quotient: 0, remainder: 0 };
  }
  const tile = _bitsf32(ROOM_TCA40_TILE_BITS);
  const tileAdd = _bitsf32(ROOM_TCA40_TILE_ADD_BITS);
  const q = Math.trunc(doorF24 / gameC) | 0;
  const r = (doorF24 - Math.imul(q, gameC)) | 0;
  return {
    divOk: 1,
    /* cvtdq2ps rounds the INT to f32 FIRST, then mulss/addss round
       the f32 product - skipping the intermediate fround would
       double-round for |q| beyond 2^24. BOTH components scale
       by 40 ([0xbaa904], xmm0); only the ADD differs:
       rem -> +40, quotient -> +120 ([0xbaaa00]). */
    yBits: _f32bits(_fr(_fr(_fr(r) * tile) + tile)),
    xBits: _f32bits(_fr(_fr(_fr(q) * tile) + tileAdd)),
    quotient: q,
    remainder: r,
  };
}

/** ITEM PLAN (0x7f7f30..0x7f816c, one loop iteration):
 *  f1 = u32ToF32(rb)*2^-32 ; m = f32(u32ToF32(rc)*2^-32 * 2) - 1
 *      (addss xmm2,xmm2 doubles BEFORE the subss 1.0)
 *  velX = f1*5*a + r0*m ; velY = f1*5*b + r1*m   (mulss K first)
 *  hpre = u32ToF32(rd)*2^-32*3.14 ; h = hpre+hpre (host cos/sin on h)
 *  speed = u32ToF32(re)*2^-32
 *  posY = baseY + cosH*speed*20 ; posX = baseX + sinH*speed*20
 *  d2 = (px-baseY)*a + (py-baseX)*b   (CROSSED bases — px vs BASE_Y)
 *  thr = u32ToF32(rf)*2^-32*10 + 2
 *  sel = comiss(0,d2) strictly-above -> d2 < 0 AND ordered
 *  f474: ONLY exact +-0 -> +1.0f; NaN and ordered-nonzero -> -1.0f
 *        (lahf/test ah,0x44/jnp: equal parity-odd jumps to 0xbaa454)
 *  timer = (rg % 10 UNSIGNED div) + 0x1e -> [ent+0x45c] AND [ent+0x460]. */
export function roomTriggerClearAudio7f7a40TailItemPlan(s) {
  const scale = _bitsf32(ROOM_TCA40_SCALE_POW2M32_BITS);
  const volMul = _bitsf32(ROOM_TCA40_VOL_MUL_BITS);
  const pitchMul = _bitsf32(ROOM_TCA40_PITCH_MUL_BITS);
  const thrMul = _bitsf32(ROOM_TCA40_THR_MUL_BITS);
  const speedMul = _bitsf32(ROOM_TCA40_SPEED_MUL_BITS);
  const one = _bitsf32(ROOM_TCA40_ONE_BITS);
  const neg1 = _bitsf32(ROOM_TCA40_NEG1_BITS);

  const a = _bitsf32(s.aBits);
  const b = _bitsf32(s.bBits);
  const r0 = _bitsf32(s.r0Bits);
  const r1 = _bitsf32(s.r1Bits);
  const baseX = _bitsf32(s.baseXBits);
  const baseY = _bitsf32(s.baseYBits);
  const cosH = _bitsf32(s.cosHBits);
  const sinH = _bitsf32(s.sinHBits);
  const px = _bitsf32(s.entPxBits);
  const py = _bitsf32(s.entPyBits);

  const f1 = _fr(roomTca40U32ToF32(s.rB) * scale);
  const m = _fr(_fr(roomTca40U32ToF32(s.rC) * scale) * 2 - one);
  const velX = _fr(_fr(_fr(f1 * volMul) * a) + _fr(r0 * m));
  const velY = _fr(_fr(_fr(f1 * volMul) * b) + _fr(r1 * m));
  const heightPre = _fr(_fr(roomTca40U32ToF32(s.rD) * scale) * pitchMul);
  const height = _fr(heightPre + heightPre); /* consumed by HOST cos/sin */
  const speed = _fr(roomTca40U32ToF32(s.rE) * scale);
  const posY = _fr(baseY + _fr(_fr(cosH * speed) * speedMul));
  const posX = _fr(baseX + _fr(_fr(sinH * speed) * speedMul));
  const d2 = _fr(_fr(_fr(px - baseY) * a) + _fr(_fr(py - baseX) * b));
  const thr = _fr(_fr(_fr(roomTca40U32ToF32(s.rF) * scale) * thrMul) +
                  _bitsf32(ROOM_TCA40_TWO_BITS));
  /* comiss xmm3(0.0), xmm2(d2); seta: CF=0 && ZF=0. NaN -> CF=1 -> sel 0. */
  const sel = (!Number.isNaN(d2) && 0 > d2) ? 1 : 0;
  const thrSel = _fr(thr * sel);
  const f474Bits = (thrSel === 0 || Object.is(thrSel, -0))
      ? ROOM_TCA40_ONE_BITS : ROOM_TCA40_NEG1_BITS;
  const timerValue = ((s.rG >>> 0) % ROOM_TCA40_TIMER_DIV) + ROOM_TCA40_TIMER_BASE;

  void one; void height; void neg1;
  return {
    f1Bits: _f32bits(f1),
    mBits: _f32bits(m),
    heightPreBits: _f32bits(heightPre),
    speedBits: _f32bits(speed),
    velXBits: _f32bits(velX),
    velYBits: _f32bits(velY),
    posXBits: _f32bits(posX),
    posYBits: _f32bits(posY),
    d2Bits: _f32bits(d2),
    thrBits: _f32bits(thr),
    sel,
    f474Bits,
    timerValue,
    createType: ROOM_TCA40_CREATE_TYPE,
    createVariant: ROOM_TCA40_CREATE_VARIANT,
    call428b20Va: ROOM_TCA40_HOST_SPAWN_428B20_VA,
    spawnArg7: s.rA >>> 0,
    vcallOff: 0xc,
    timerOffA: 0x45c,
    timerOffB: 0x460,
    itemPxOff: 0x33c,
    itemPyOff: 0x340,
  };
}

/* ===================== ABI v81 UNIT B: greed-probe band ===================
   0x009bf990 / 0x009bfa00 / 0x009bfa70 / fire plan 0x009bfae0 (record-30
   blockers). Receiver {begin,end} at Game+0x1baa8; count = sar 2. The
   three bodies share the qualifying predicate; the parent-frame compare
   is SIGNED jl (pframe >= sframe counts; pframe == -1 counts). */

export const ROOM_GREED_PROBE_9BF990_VA = 0x009bf990;
export const ROOM_GREED_PROBE_9BFA00_VA = 0x009bfa00;
export const ROOM_GREED_PROBE_9BFA70_VA = 0x009bfa70;
export const ROOM_GREED_FIRE_9BFAE0_VA = 0x009bfae0;
export const ROOM_GREED_FIRE_CALL_7D93B0_VA = 0x007d93b0;
export const ROOM_GREED_PROBE_FRAME_NONE = -1;

/** qual(e): [e+2c]==0 && [e+3bc]==0 && !(parent alive with frame != -1,
 *  frame < self-frame (SIGNED) and parent !== e). */
export function roomGreedProbeQual(e) {
  if ((e.f2c >>> 0) !== 0 || (e.f3bc >>> 0) !== 0) return 0;
  if ((e.hasParent >>> 0) === 0) return 1;
  const pf = e.parent161c | 0;
  if (pf === ROOM_GREED_PROBE_FRAME_NONE) return 1;
  const sf = e.self161c | 0;
  if (!(pf < sf)) return 1;
  return (e.parentIsSelf >>> 0) !== 0 ? 1 : 0;
}

/** 0x009bf990: `cmp ebx,1 / ja` gate is UNSIGNED — count 0 or 1 returns
 *  al=0 at once; otherwise seta(count_qual > 1). */
export function roomGreedProbe9bf990(elems, count) {
  if (((count >>> 0) <= 1)) return 0;
  let n = 0;
  for (let i = 0; i < count; ++i) n += roomGreedProbeQual(elems[i]);
  return n > 1 ? 1 : 0;
}

/** 0x009bfa00: COUNT of qual(e) && low byte [e+0x20a9] == 0 (no gate). */
export function roomGreedProbe9bfa00(elems, count) {
  let n = 0;
  for (let i = 0; i < count; ++i) {
    const e = elems[i];
    if (roomGreedProbeQual(e) === 1 && (e.f20a9 & 0xff) === 0) ++n;
  }
  return n;
}

/** 0x009bfa70: mirror counting byte[e+0x20a9] != 0. */
export function roomGreedProbe9bfa70(elems, count) {
  let n = 0;
  for (let i = 0; i < count; ++i) {
    const e = elems[i];
    if (roomGreedProbeQual(e) === 1 && (e.f20a9 & 0xff) !== 0) ++n;
  }
  return n;
}

/** 0x009bfae0 fire plan: fires typed-host 0x7d93b0(this=e) iff the low
 *  byte differs from zero; the loop bound is re-derived EVERY iteration
 *  (PE reloads begin/end at 0x9bfb07..12) — modeled as bound_rederived=1. */
export function roomGreedFire9bfae0Plan(elems, count) {
  let fireCount = 0;
  let fireMask = 0;
  for (let i = 0; i < count; ++i) {
    if ((elems[i].f20a9 & 0xff) !== 0) {
      ++fireCount;
      if (i < 32) fireMask |= (1 << i) >>> 0;
    }
  }
  return {
    elemCount: count >>> 0,
    fireCount,
    fireMask: fireMask >>> 0,
    call7d93b0Va: ROOM_GREED_FIRE_CALL_7D93B0_VA,
    boundRederived: 1,
  };
}

/* ===================== ABI v82 (83b0 main spawn-tail plan) ================
   FUN_007f83b0 MAIN-path per-iteration item plan (PE 0x7f8760..0x7f8a24).
   Transcribed from cpu-dump/007f8509.txt + fresh 007f8922.txt, NOT from
   the C++. Key differences vs the v81 7f7a40 tail:
   - f1 is PRE-multiplied by 5.0 (mulss VOL_MUL right after 2^-32);
   - velocity mixes A/B/C where C = +vec0 (double negation cancels):
       velX = f32(m*B) + f32(A*f1) ; velY = f32(m*C) + f32(B*f1)
     with A=-vec0, B=-vec1;
   - BOTH base components multiply by 40; only the ADD differs
     (rem -> +40, quot -> +120);
   - dir keeps +1 on NaN (comiss unordered -> CF=1 -> jbe TAKEN);
   - [item+0x474] stores thr*dir DIRECTLY -- no ==0 select. */

export function roomTriggerClearAudio83B0TailItemPlan(s) {
  const scale = _bitsf32(ROOM_TCA40_SCALE_POW2M32_BITS);
  const volMul = _bitsf32(ROOM_TCA40_VOL_MUL_BITS);
  const pitchMul = _bitsf32(ROOM_TCA40_PITCH_MUL_BITS);
  const speedMul = _bitsf32(ROOM_TCA40_SPEED_MUL_BITS);
  const ten = _bitsf32(ROOM_TCA40_THR_MUL_BITS);      /* 10.0 */
  const two = _bitsf32(ROOM_TCA40_TWO_BITS);          /* 2.0 */
  const one = _bitsf32(ROOM_TCA40_ONE_BITS);
  const neg1Bits = ROOM_TCA40_NEG1_BITS;

  /* xorps sign work: A = -vec0, B = -vec1, C = +vec0 (bit flips). */
  const a = _bitsf32((s.vec0Bits ^ ROOM_TCA40_SIGN_MASK_BITS) >>> 0);
  const b = _bitsf32((s.vec1Bits ^ ROOM_TCA40_SIGN_MASK_BITS) >>> 0);
  const c = _bitsf32(s.vec0Bits);

  const f1 = _fr(_fr(roomTca40U32ToF32(s.rB) * scale) * volMul);
  const fsC = _fr(roomTca40U32ToF32(s.rC) * scale);
  const m = _fr(_fr(fsC + fsC) - one);

  const velX = _fr(_fr(m * b) + _fr(a * f1));
  const velY = _fr(_fr(m * c) + _fr(b * f1));

  const hpre = _fr(_fr(roomTca40U32ToF32(s.rD) * scale) * pitchMul);
  const height = _fr(hpre + hpre); /* consumed by HOST cos/sin */
  const speed = _fr(_fr(roomTca40U32ToF32(s.rE) * scale) * speedMul);

  if (s.gameC === 0) {
    return { divOk: 0 };
  }
  const q = Math.trunc(s.doorF24 / s.gameC) | 0;
  const r = (s.doorF24 - Math.imul(q, s.gameC)) | 0;
  const fq = _fr(q), fr_ = _fr(r);
  const tile = _bitsf32(ROOM_TCA40_TILE_BITS);
  const tileAdd = _bitsf32(ROOM_TCA40_TILE_ADD_BITS);
  const baseX = _fr(_fr(fq * tile) + tileAdd); /* quot*40 + 120 */
  const baseY = _fr(_fr(fr_ * tile) + tile);   /* rem*40 + 40 */

  const cosH = _bitsf32(s.cosHBits);
  const sinH = _bitsf32(s.sinHBits);
  const posY = _fr(_fr(cosH * speed) + baseY);
  const posX = _fr(_fr(sinH * speed) + baseX);

  /* idiv RE-DERIVED after the spawn (PE reloads and divides again). */
  const q2 = Math.trunc(s.doorF24 / s.gameC) | 0;
  const r2 = (s.doorF24 - Math.imul(q2, s.gameC)) | 0;
  void q2;
  const px = _bitsf32(s.itemPxBits);
  const py = _bitsf32(s.itemPyBits);
  const d2 = _fr(_fr(_fr(py - baseX) * c) + _fr(_fr(px - baseY) * b));

  /* comiss 0,d2 ; jbe keep: -1 only when ORDERED 0 > d2; NaN keeps +1. */
  const dirBits = (!Number.isNaN(d2) && 0 > d2) ? neg1Bits : ROOM_TCA40_ONE_BITS;
  const dir = _bitsf32(dirBits);

  const thr = _fr(_fr(_fr(roomTca40U32ToF32(s.rF) * scale) * ten) + two);
  const f474 = _fr(thr * dir); /* NO ==0 select in this body */

  const timerValue = ((s.rG >>> 0) % ROOM_TCA40_TIMER_DIV) + ROOM_TCA40_TIMER_BASE;

  return {
    divOk: 1,
    f1Bits: _f32bits(f1),
    mBits: _f32bits(m),
    heightBits: _f32bits(height),
    speedBits: _f32bits(speed),
    velXBits: _f32bits(velX),
    velYBits: _f32bits(velY),
    quotient: q,
    remainder: r,
    baseXBits: _f32bits(baseX),
    baseYBits: _f32bits(baseY),
    posXBits: _f32bits(posX),
    posYBits: _f32bits(posY),
    d2Bits: _f32bits(d2),
    dirBits,
    thrBits: _f32bits(thr),
    f474Bits: _f32bits(f474),
    timerValue,
    createType: ROOM_TCA40_CREATE_TYPE,
    createVariant: ROOM_TCA40_CREATE_VARIANT,
    call428b20Va: ROOM_TCA40_HOST_SPAWN_428B20_VA,
    spawnArg7: s.rA >>> 0,
    firstIterEcho: s.firstIter >>> 0,
    vcallOff: 0xc,
    timerOffA: 0x45c,
    timerOffB: 0x460,
    itemPxOff: 0x33c,
    itemPyOff: 0x340,
  };
}

/* ===================== ABI v83 (7fb250 head plan) =========================
   FUN_007fb250 record-29 award-spawner HEAD decision plan (PE
   0x7fb250..0x7fb7a3). Independent mirror of
   isaac_room_award_spawn_7fb250_head_plan, transcribed from
   cpu-dump/007fb250.txt. Exit table + count law documented in the C++
   header; key signed/unsigned pins: count<=0 loop gate is SIGNED jle,
   the rnd64 sbb-and zeroes count when rnd >= 64 UNSIGNED, and the
   fco max() is UNSIGNED cmova after cmp eax,1. */

export function roomAwardSpawn7fb250HeadPlan(s) {
  const out = { exitKind: 4, sfxArm: 0, byte6d: 0, variantLocal: -1,
                count: 1, idFinal: s.pickedId >>> 0, flag66: 0,
                plannedSpawns: 0 };
  if ((s.luaGate >>> 0) !== 0) { out.exitKind = 0; return out; }

  const bit17 = ((s.flags1839c >>> 0) & 0x20000) !== 0 ? 1 : 0;
  if ((s.h9be630 >>> 0) === 0 && bit17 !== 0 &&
      (s.roomType8 >>> 0) === 5) {
    out.variantLocal = -2;
  }
  out.byte6d = ((s.h9be630 >>> 0) !== 0 ||
                (bit17 !== 0 && (s.roomType8 >>> 0) === 5)) ? 1 : 0;

  if ((s.mode269c8 >>> 0) === 2 || (s.mode269c8 >>> 0) === 3) {
    out.exitKind = 3; return out;
  }
  if ((s.descF10Present >>> 0) !== 0 &&
      (s.descType8 >>> 0) === 0x10 &&
      (s.descType00 >>> 0) === 0x23) {
    out.sfxArm = 1; out.exitKind = 1; return out;
  }
  if ((s.roomType8 >>> 0) === 5 || (s.roomType8 >>> 0) === 0x11) {
    out.exitKind = 6; return out;
  }
  if ((s.roomType8 >>> 0) === 0x10) { out.exitKind = 2; return out; }
  if ((s.h74efd0 >>> 0) !== 0 && (s.game1830c >>> 0) === 1) {
    out.exitKind = 5; return out;
  }

  let count = 1;
  let id = s.pickedId >>> 0;
  if ((s.gateF1 >>> 0) !== 0 && id !== 0x15e) {
    const c2 = ((s.h9be750 >>> 0) + 1) >>> 0;
    /* comiss/cmova: ORDERED above zeroes the count; NaN keeps c2. */
    const lhs = Math.fround(_bitsf32(s.h4e4690Bits) * 0.5);
    const rndF = _bitsf32(s.h7e9080Bits);
    count = (!Number.isNaN(lhs) && !Number.isNaN(rndF) && lhs > rndF)
        ? 0 : c2;
  }
  if ((s.mode269c8 >>> 0) === 1 && id === 0xa) {
    if ((s.hRnd64 >>> 0) >= 0x42) count = 0;
  }
  if ((s.h6ee340 >>> 0) === 0 && (s.h9be140 >>> 0) !== 0) {
    id = s.xformId >>> 0;
  }
  if ((s.descF0 | 0) === -0x10 && (s.h9be6b0 >>> 0) !== 0) {
    count = Math.imul(count, s.h7cb6e0 >>> 0) >>> 0;
  }
  if ((s.gate202 >>> 0) !== 0 && (s.hRnd4 >>> 0) === 0 &&
      (count | 0) >= 1 &&
      (id === 0x14 || id === 0xa || id === 0x1e || id === 0x45 ||
       id === 0x28)) {
    out.flag66 = 1;
  }
  if ((id === 0x14 || id === 0) && (s.h9be0801a0 >>> 0) !== 0) {
    const sum = (count + (s.hRnd3 >>> 0)) >>> 0;
    count = sum > 1 ? sum : 1;
    id = 0x14;
  }

  out.count = count >>> 0;
  out.idFinal = id;
  if ((count | 0) <= 0) { out.exitKind = 7; }
  else if (id === 0) { out.exitKind = 8; }
  else { out.exitKind = 4; out.plannedSpawns = count >>> 0; }
  return out;
}

/* ===================== ABI v84 (83b0 ALT-tail item plan) ==================
   FUN_007f83b0 ALT path per-iteration plan (PE 0x7f8ec7..0x7f9209).
   Independent mirror of isaac_room_trigger_clear_audio_83b0_tail_alt_
   item_plan, transcribed from cpu-dump/007f8ec7.txt (recursive-descent
   anchor at the true entry — see room-v84-alt-tail/NOTES.md).
   Differences vs the main-tail (v82) carrier:
   - C = -vecA is re-flipped EVERY iteration @0x7f8edb..f0;
   - vecB ([ebp-0x34]) is used UNflipped as a velocity/dir multiplier;
   - velX = f32(f1*A) + f32(m*B) ; velY = f32(C*m) + f32(f1*B)
     (main had velX = m*B + A*f1 with pre-negated A/B);
   - the spawn flag slot carries doorMagic==0xe (constant across
     iterations), not (i==0); the echo draw is r_b. */

export function roomTriggerClearAudio83B0TailAltItemPlan(s) {
  const scale = _bitsf32(ROOM_TCA40_SCALE_POW2M32_BITS);
  const volMul = _bitsf32(ROOM_TCA40_VOL_MUL_BITS);
  const pitchMul = _bitsf32(ROOM_TCA40_PITCH_MUL_BITS);
  const speedMul = _bitsf32(ROOM_TCA40_SPEED_MUL_BITS);
  const ten = _bitsf32(ROOM_TCA40_THR_MUL_BITS);   /* 10.0 */
  const two = _bitsf32(ROOM_TCA40_TWO_BITS);       /* 2.0 */
  const one = _bitsf32(ROOM_TCA40_ONE_BITS);

  /* in-loop xorps flip: C = -vecA. */
  const cVal = _bitsf32((s.vecABits ^ ROOM_TCA40_SIGN_MASK_BITS) >>> 0);
  const a = _bitsf32(s.vecABits);
  const b = _bitsf32(s.vecBBits);
  const flagE = (s.magicEqE >>> 0) !== 0 ? 1 : 0;

  const f1 = _fr(_fr(roomTca40U32ToF32(s.rC) * scale) * volMul);
  const fsD = _fr(roomTca40U32ToF32(s.rD) * scale);
  const m = _fr(_fr(fsD + fsD) - one);

  const velX = _fr(_fr(a * f1) + _fr(m * b));
  const velY = _fr(_fr(cVal * m) + _fr(b * f1));

  if (s.gameC === 0) {
    return { divOk: 0 };
  }
  const q = Math.trunc(s.doorF24 / s.gameC) | 0;
  const r = (s.doorF24 - Math.imul(q, s.gameC)) | 0;
  const fq = _fr(q), fr_ = _fr(r);
  const tile = _bitsf32(ROOM_TCA40_TILE_BITS);
  const tileAdd = _bitsf32(ROOM_TCA40_TILE_ADD_BITS);
  const baseY = _fr(_fr(fr_ * tile) + tile);   /* rem*40 + 40 */
  const baseX = _fr(_fr(fq * tile) + tileAdd); /* quo*40 + 120 */

  const hpre = _fr(_fr(roomTca40U32ToF32(s.rE) * scale) * pitchMul);
  void hpre; /* height consumed by HOST cos/sin */
  const speed = _fr(_fr(roomTca40U32ToF32(s.rF) * scale) * speedMul);

  const cosH = _bitsf32(s.cosHBits);
  const sinH = _bitsf32(s.sinHBits);
  const posY = _fr(_fr(cosH * speed) + baseY);
  const posX = _fr(_fr(sinH * speed) + baseX);

  /* idiv RE-DERIVED after the spawn (PE reloads both pointers). */
  const px = _bitsf32(s.itemPxBits);
  const py = _bitsf32(s.itemPyBits);
  const d2 = _fr(_fr(_fr(px - baseY) * b) + _fr(_fr(py - baseX) * cVal));

  /* comiss 0,d2 ; jbe keep: -1 only when ORDERED 0 > d2; NaN keeps +1. */
  const dirBits = (!Number.isNaN(d2) && 0 > d2)
      ? ROOM_TCA40_NEG1_BITS : ROOM_TCA40_ONE_BITS;
  const dir = _bitsf32(dirBits);

  const thr = _fr(_fr(_fr(roomTca40U32ToF32(s.rG) * scale) * ten) + two);
  const f474 = _fr(thr * dir); /* NO ==0 select */

  const timerValue = ((s.rH >>> 0) % ROOM_TCA40_TIMER_DIV) +
                     ROOM_TCA40_TIMER_BASE;

  return {
    divOk: 1,
    cBits: _f32bits(cVal),
    flagE,
    f1Bits: _f32bits(f1),
    mBits: _f32bits(m),
    velXBits: _f32bits(velX),
    velYBits: _f32bits(velY),
    quotient: q,
    remainder: r,
    baseYBits: _f32bits(baseY),
    baseXBits: _f32bits(baseX),
    posXBits: _f32bits(posX),
    posYBits: _f32bits(posY),
    d2Bits: _f32bits(d2),
    dirBits,
    thrBits: _f32bits(thr),
    f474Bits: _f32bits(f474),
    timerValue,
    createType: ROOM_TCA40_CREATE_TYPE,
    createVariant: ROOM_TCA40_CREATE_VARIANT,
    call428b20Va: ROOM_TCA40_HOST_SPAWN_428B20_VA,
    spawnArgRb: s.rB >>> 0,
    spawnFlag: flagE,
    vcallOff: 0xc,
    timerOffA: 0x45c,
    timerOffB: 0x460,
    itemPxOff: 0x33c,
    itemPyOff: 0x340,
  };
}

/* ===================== ABI v85 (7fb250 SPAWN-LOOP continuation) ============
   PE 0x007fb7be..0x007fe087. Fresh recursive-descent dumps
   cpu-dump/007fb7be.txt + chunk chain 007fbabc..007fdda0. Pure laws:
   the 0x7e90f0 xorshift step, the 0x6ee340 re-dispatch membership, the
   per-iteration body 0x7fb7be..0x7fb8d1, and the B1 luck gate
   0x7fb8d1..0x7fb95b. Host leaves stay typed (see header v85 block). */

export const ROOM_AWARD_SPAWN_CONT_VA = 0x007fb7be;
export const ROOM_AWARD_SPAWN_CONT_END_VA = 0x007fe087;
export const ROOM_AWARD_SPAWN_RNG_STEP_VA = 0x007e90f0;
export const ROOM_AWARD_SPAWN_REDISPATCH_VA = 0x006ee340;
export const ROOM_AWARD_SPAWN_GRID_IDX_VA = 0x00812c90;
export const ROOM_AWARD_SPAWN_HOST_POS_WALK_VA = 0x00813520;
export const ROOM_AWARD_SPAWN_HOST_CREATE_VA = 0x00428b20;
export const ROOM_AWARD_SPAWN_HOST_DOOR_GATE_VA = 0x00822820;
export const ROOM_AWARD_SPAWN_HOST_DOOR_SPAWN_VA = 0x006e30a0;
export const ROOM_AWARD_SPAWN_DOOR_ARM_TYPE = 5;
export const ROOM_AWARD_SPAWN_DOOR_ARM_A = 0x34;
export const ROOM_AWARD_SPAWN_DOOR_ARM_B = 0x36;
export const ROOM_AWARD_SPAWN_B1_MUL03_BITS = 0x3cf5c28f; /* [0xbaa0a0] */
export const ROOM_AWARD_SPAWN_B1_ADD02_BITS = 0x3e4ccccd; /* [0xbaa198] */
export const ROOM_AWARD_SPAWN_B1_CAP33_BITS = 0x3ea8f5c3; /* [0xbaa220] */
export const ROOM_AWARD_SPAWN_B1_SITE_VARIANT = 0x5a;

/** 0x007e90f0: t=x^(x>>>a); r=t^(t<<b); nx=r^(r>>>c); store; return.
    JS shifts mask &31 like x86 hardware. Mutates st.x in place. */
export function roomRng7e90f0Step(st) {
  let t = (st.x ^ (st.x >>> st.shrA)) >>> 0;
  t = (t ^ ((t << st.shlB) >>> 0)) >>> 0;
  const nx = (t ^ (t >>> st.shrC)) >>> 0;
  st.x = nx;
  return nx;
}

const _AWARD_6EE340_SET = new Set([
  0x32, 0x3c, 0x168, 0x33, 0x35, 0x34, 0x36, 0x186, 0x37, 0x38, 0x39, 0x3a,
]);

/** 0x006ee340 ordered cmp chain -> al. */
export function roomAwardSpawn6ee340Gate(variant) {
  return _AWARD_6EE340_SET.has(variant >>> 0) ? 1 : 0;
}

/** Per-iteration body 0x007fb7be..0x007fb8d1 with host leaves as
    inputs. Grid idx mirrors roomGridPosIndex (v75 L1 law). */
export function roomAwardSpawn7fb250IterPlan(s) {
  const gate = roomAwardSpawn6ee340Gate(s.entityVariant2c);
  let variantNext = gate === 0 ? s.entityField30 >>> 0 : s.variantCur >>> 0;
  const doorArm =
    (s.entityType28 >>> 0) === ROOM_AWARD_SPAWN_DOOR_ARM_TYPE &&
    ((s.entityVariant2c >>> 0) === ROOM_AWARD_SPAWN_DOOR_ARM_A ||
     (s.entityVariant2c >>> 0) === ROOM_AWARD_SPAWN_DOOR_ARM_B)
      ? 1 : 0;
  const gridIdx = roomGridPosIndex(
    _bitsf32(s.posXBits), _bitsf32(s.posYBits),
    s.roomW >>> 0, s.roomH >>> 0);
  const fired = doorArm !== 0 && (s.hDoorGate >>> 0) === 0 ? 1 : 0;
  if (fired !== 0) variantNext = 1;
  const counterNext = (s.counter | 0) + 1;
  return {
    redispatchGate: gate,
    variantNext,
    doorArm,
    gridIdx: gridIdx >>> 0,
    doorSpawnFired: fired,
    flagRmw: (s.flag66 >>> 0) !== 0 && (s.counter | 0) === 0 ? 1 : 0,
    sfxChase: (s.hSfxOwner >>> 0) !== 0 ? 1 : 0,
    counterNext,
    continueLoop: counterNext < (s.countLimit | 0) ? 1 : 0,
    createRelayVa: ROOM_AWARD_SPAWN_HOST_CREATE_VA,
    spawnType: ROOM_AWARD_SPAWN_DOOR_ARM_TYPE,
    spawnArgA6: s.variantCur >>> 0,
  };
}

/** B1 luck gate 0x007fb8d1..0x007fb95b. minss semantics: NaN val ->
    cap33 wins (second operand); pass only when ORDERED m > rnd. */
export function roomAwardSpawn7fb250B1LuckGate(s) {
  const mul03 = _bitsf32(ROOM_AWARD_SPAWN_B1_MUL03_BITS);
  const add02 = _bitsf32(ROOM_AWARD_SPAWN_B1_ADD02_BITS);
  const cap33 = _bitsf32(ROOM_AWARD_SPAWN_B1_CAP33_BITS);
  const qf = _bitsf32(s.hQualityFBits);
  const qi = Math.fround(s.hQualityInt | 0);
  const val = Math.fround(Math.fround(Math.fround(qf * mul03) + add02) * qi);
  /* minss(val, cap): smaller operand wins; NaN val -> cap (src2). */
  const m = !Number.isNaN(val) && val < cap33 ? val : cap33;
  const rnd = _bitsf32(s.hRndFBits);
  const pass = !Number.isNaN(m) && !Number.isNaN(rnd) && m > rnd ? 1 : 0;
  return {
    valBits: _f32bits(val),
    minBits: _f32bits(m),
    pass,
    spawnVariant: ROOM_AWARD_SPAWN_B1_SITE_VARIANT,
  };
}

/* ===================== ABI v86 (idx29 SPAWN-LOOP probes) ==================
   The three probe callees named by update-slice record idx29's residual
   blocker (0xb-block 0x7fb9cc..0x7fbb04): 0x009b92c0 vector-at,
   0x007cb6e0 count resolver, 0x007c3980 six-counter roll. Fresh PE dumps
   cpu-dump/009b92c0.txt + 007cb6e0.txt + 007cb809.txt + 007c3980.txt.
   Host leaves stay typed. Caller glue: q>1 -> roll, q>2 -> roll again
   (SIGNED jle 0x7fbab2/0x7fbacc). */

export const ROOM_IDX29_AT_VA = 0x009b92c0;
export const ROOM_IDX29_AT_END_VA = 0x009b9305;
export const ROOM_IDX29_AT_FATAL_HOST_VA = 0x00a112c0;
export const ROOM_IDX29_AT_OOB_RET_VA = 0x009b9300;

/** Probe A 0x009b92c0. elems: JS array mirroring wasm memory at begin.
    count = sar((end-begin),2); empty -> fatal; UNSIGNED jae ->
    DEFECT return *begin; else begin[index]. */
export function roomIdx29At9b92c0(elems, begin, end, index) {
  const count = (end - begin | 0) >> 2;
  const fatal = count === 0 ? 1 : 0;
  const oob = (index >>> 0) >= (count >>> 0) ? 1 : 0;
  if (oob !== 0) {
    return { value: elems[0] >>> 0, oobDefect: 1, fatalHost: fatal };
  }
  return { value: elems[index] >>> 0, oobDefect: 0, fatalHost: fatal };
}

export const ROOM_COUNT_VA = 0x007cb6e0;
export const ROOM_COUNT_RET_VA = 0x007cba1f;
export const ROOM_COUNT_SAMPLING_VA = 0x007cb8d8;
export const ROOM_COUNT_RECURSE_15_VA = 0x007cb7b2;
export const ROOM_COUNT_RECURSE_40_VA = 0x007cb801;
export const ROOM_COUNT_RECURSE_4B_VA = 0x007cb845;
export const ROOM_COUNT_HOST_WALK_VA = 0x00417870;
export const ROOM_COUNT_HOST_740BC0_VA = 0x00740bc0;
export const ROOM_COUNT_HOST_RNG_VA = 0x007e9020;
export const ROOM_COUNT_HOST_930AA0_VA = 0x00930aa0;
export const ROOM_COUNT_HOST_7706E0_VA = 0x007706e0;
export const ROOM_COUNT_GAME_GLOBAL = 0x00c71678;
export const ROOM_COUNT_TABLE_VA = 0x00b6bad0;
export const ROOM_COUNT_TABLE = [0x9, 0xb, 0x41, 0x1b, 0xa, 0xc, 0x1a, 0x42, 0x60, 0x90];
export const ROOM_COUNT_MASK = 0x7fff;
export const ROOM_COUNT_MODE_GATE = 0x1c;
export const ROOM_COUNT_MODE_7A_GATE = 0x29;
export const ROOM_COUNT_SEED_DIV_MAGIC = 0xb60b60b7;
export const ROOM_COUNT_SEED_DIV_SHIFT = 6;
export const ROOM_COUNT_MOD4_MASK = 0x80000003;

const _u32 = (v) => v >>> 0;
const _i32 = (v) => v | 0;

/** Head walk step 0x7cb6fb..0x7cb733. */
export function roomCount7cb6e0HeadStep(s) {
  let out = { playerNext: 0, hostEdge: 0, cont: 0, exitStored: 0 };
  if (_u32(s.field2c) !== 1) { out.exitStored = 1; return out; }
  if (_u32(s.parentPtr) !== 0 && _u32(s.parentField28) === 1) {
    out.playerNext = _u32(s.parentPtr);
    out.cont = _u32(s.candField2c) === 1 ? 1 : 0;
    out.exitStored = out.cont !== 0 ? 0 : 1;
    return out;
  }
  if (_u32(s.field2c) !== 1) { out.exitStored = 1; return out; }
  out.hostEdge = s.hostKnown !== 0 ? 1 : 0;
  if (_u32(s.hostResult) === 0) { out.exitStored = 1; return out; }
  out.playerNext = _u32(s.hostResult);
  out.cont = _u32(s.candField2c) === 1 ? 1 : 0;
  out.exitStored = out.cont !== 0 ? 0 : 1;
  return out;
}

/** 0x7cb735 boost: id==0x56 && [edi+0x13c0]==4 (FULL dwords). */
export function roomCount7cb6e0Boost(f13c0, id) {
  return (_u32(id) === 0x56 && _u32(f13c0) === 4) ? 1 : 0;
}
/** 0x7cb749 byte gate. */
export function roomCount7cb6e0Gate202c(flag) {
  return (_u32(flag) & 0xff) !== 0 ? 1 : 0;
}
/** 0x7cb756 byte gate. */
export function roomCount7cb6e0Gate20a9(flag) {
  return (_u32(flag) & 0xff) !== 0 ? 1 : 0;
}
/** 0x7cb768 and ebx,0x7fff. */
export function roomCount7cb6e0IdMask(id) {
  return _u32(id) & ROOM_COUNT_MASK;
}
export function roomCount7cb6e0TableValue(index) {
  return _u32(index) < ROOM_COUNT_TABLE.length ? ROOM_COUNT_TABLE[_u32(index)] : 0;
}
/** 0x7cb76e..0x7cb792 mode==0x1c then 10-entry UNSIGNED scan. */
export function roomCount7cb6e0TableHit(mode2663c, idMasked) {
  if (_u32(mode2663c) !== ROOM_COUNT_MODE_GATE) return 0;
  return ROOM_COUNT_TABLE.includes(_u32(idMasked)) ? 1 : 0;
}
/** 0x7cb793..0x7cb7a8 special ids jump to sampling. */
export function roomCount7cb6e0SpecialId(idMasked) {
  const i = _u32(idMasked);
  return (i === 0x15 || i === 0x40 || i === 0x4b) ? 1 : 0;
}
/** 0x7cb7c7 and 0x80000003/dec/or -4/inc — C signed % 4. */
export function roomCount7cb6e0SeedMod4(seed) {
  let ecx = _i32(_u32(seed) & ROOM_COUNT_MOD4_MASK);
  if (ecx >= 0) return ecx;
  ecx = _i32(ecx - 1);
  ecx |= -4;
  return _i32(ecx + 1);
}
/** 0x7cb80d..0x7cb833 magic div-by-90, UNSIGNED mod 10. */
export function roomCount7cb6e0SeedIndex(seed) {
  const prod = BigInt(_i32(seed)) * BigInt(ROOM_COUNT_SEED_DIV_MAGIC | 0);
  let edx = Number((prod >> 32n) & 0xffffffffn) >>> 0;
  edx = (edx + _u32(seed)) >>> 0;
  const sar = (edx | 0) >> ROOM_COUNT_SEED_DIV_SHIFT;
  return (((sar >> 31) + sar) >>> 0) % 10;
}
/** 0x7cb7d4..0x7cb7e6 id-0x30 early-return gate. */
export function roomCount7cb6e0Id30Gate(idMasked, count15, mod4) {
  if (_u32(idMasked) !== 0x30) return 0;
  if (_i32(count15) <= 0) return 0;
  if (_i32(mod4) === 2) return 1;
  if (_i32(count15) <= 1) return 0;
  return _i32(mod4) === 3 ? 1 : 0;
}
/** 0x7cb809..0x7cb83e count40>0 && TABLE[seed_index]==id. */
export function roomCount7cb6e0Seed40Gate(idMasked, count40, seed) {
  if (_i32(count40) <= 0) return 0;
  return ROOM_COUNT_TABLE[roomCount7cb6e0SeedIndex(seed)] === _u32(idMasked)
    ? 1
    : 0;
}
/** 0x7cb857..0x7cb863 id==0x7a && [Game+0x26584]==0x29. */
export function roomCount7cb6e07a29Skip(idMasked, mode26584) {
  return (_u32(idMasked) === 0x7a && _u32(mode26584) === ROOM_COUNT_MODE_7A_GATE)
    ? 1
    : 0;
}
/** 0x7cb89e inc eax; cmp ebx,eax — id == rng+1 with u32 wrap. */
export function roomCount7cb6e0BdCompare(rngRaw, idMasked) {
  return _u32(idMasked) === ((_u32(rngRaw) + 1) >>> 0) ? 1 : 0;
}
/** 0x7cb8e8..0x7cb90a scan width from the two HOST bytes. */
export function roomCount7cb6e0ScanWidth(has8b, has1ca) {
  if ((_u32(has8b) & 0xff) !== 0) return 2;
  if ((_u32(has1ca) & 0xff) !== 0) return 2;
  return 1;
}
/** 0x7cb913..0x7cb92a NESTED increments: bit-15 second inc ONLY under
    an id match (jne 0x7cb91e skips both). */
export function roomCount7cb6e0SlotMatch(slotDword, idMasked) {
  if ((_u32(slotDword) & ROOM_COUNT_MASK) !== _u32(idMasked)) return 0;
  return (_u32(slotDword) & 0x8000) !== 0 ? 2 : 1;
}
/** 0x7cb932..0x7cb957 block match chain. */
export function roomCount7cb6e0Block17c4(b) {
  if (_u32(b.blockNonNull) === 0) return 0;
  if (_u32(b.block0) !== 2) return 0;
  if (_u32(b.block4) !== _u32(b.idMasked)) return 0;
  if (_u32(b.f2ef8) !== 0 && _u32(b.f2ef8) !== _u32(b.idMasked)) return 0;
  return 1;
}
/** 0x7cb958 INDEPENDENT byte[edi+0x17cc]&2 extra. */
export function roomCount7cb6e0Flag17cc(flagByte) {
  return (_u32(flagByte) & 0x02) !== 0 ? 1 : 0;
}
/** 0x7cb962..0x7cb982 span sar 2 UNSIGNED bound; adds w0 + 2*w1. */
export function roomCount7cb6e0ItemAdd(idMasked, itemBegin, itemEnd, w0, w1) {
  const span = _i32(_u32(itemEnd) - _u32(itemBegin)) >> 2;
  if (!(_u32(idMasked) < _u32(span))) return 0; /* jae */
  return _i32(_i32(w0) + _i32(w1) * 2);
}
/** 0x7cb985..0x7cb99b raw dword span SIGNED bound; +1 iff nonzero. */
export function roomCount7cb6e0ByteAdd(idMasked, byteBegin, byteEnd, byteVal) {
  const span = _i32(_u32(byteEnd) - _u32(byteBegin));
  if (_i32(idMasked) >= span) return 0;
  return (_u32(byteVal) & 0xff) !== 0 ? 1 : 0;
}
/** 0x7cb99f..0x7cb9f5 [edi+0x2ef8] adjust. */
export function roomCount7cb6e0Adjust2ef8(esi, f2ef8, byte2ef0, idMasked) {
  if (_u32(f2ef8) === 0) return _i32(esi);
  if ((_u32(f2ef8) & ROOM_COUNT_MASK) !== _u32(idMasked)) return _i32(esi);
  if ((_u32(byte2ef0) & 0xff) !== 0) {
    const t = (_u32(f2ef8) & 0x8000) !== 0 ? 1 : 0; /* neg/sbb/neg/inc */
    return _i32(_i32(esi) + t + 1);
  }
  let s = _i32(_i32(esi) - 1);
  if (s <= 0) s = 0; /* cmovg max(0, .) SIGNED */
  if ((_u32(f2ef8) & 0x8000) !== 0) {
    s = _i32(s - 1);
    if (s <= 0) s = 0;
  }
  return s;
}
/** 0x7cb9f6..0x7cba0c SIGNED jle final gate. */
export function roomCount7cb6e0FinalGate(esi, has1b7) {
  const e = _i32(esi);
  if (e <= 0) return e;
  return (_u32(has1b7) & 0xff) !== 0 ? e + 1 : e;
}
/** 0x7cb8a6..0x7cb8d7 ids 0x18/0x13 SIGNED field>0 (0x17 is HOST). */
export function roomCount7cb6e0FieldGate(id, value) {
  if (_u32(id) !== 0x18 && _u32(id) !== 0x13) return 0;
  return _i32(value) > 0 ? 1 : 0;
}

/** Composed body AFTER the head walk. Faithful PE order; host leaves
    arrive as inputs and their fire conditions are reported back. */
export function roomCount7cb6e0Plan(src) {
  const out = {
    result: 0,
    earlyGate: 0,
    earlyRet30: 0,
    samplingReached: 0,
    recurse15Fired: 0,
    recurse40Fired: 0,
    recurse4bFired: 0,
    host740bc0Fired: 0,
    hostRngFired: 0,
    host17Fired: 0,
    host8bFired: 0,
    host1caFired: 0,
    host1b7Fired: 0,
  };
  let esi = roomCount7cb6e0Boost(src.f13c0, src.id); /* 0x7cb735 */
  if (roomCount7cb6e0Gate202c(src.gate202c) !== 0 ||
      roomCount7cb6e0Gate20a9(src.gate20a9) !== 0) {
    out.earlyGate = 1;
    out.result = esi;
    return out;
  }
  const idm = roomCount7cb6e0IdMask(src.id);
  esi += roomCount7cb6e0TableHit(src.mode2663c, idm);
  if (roomCount7cb6e0SpecialId(idm) !== 0) {
    /* straight to sampling */
  } else {
    out.recurse15Fired = 1;
    const count15 = src.hCount15 | 0;
    if (count15 > 0) {
      const mod4 = roomCount7cb6e0SeedMod4(src.mgrSeed264f8);
      if (roomCount7cb6e0Id30Gate(idm, count15, mod4) !== 0) {
        out.earlyRet30 = 1;
        out.result = count15 + esi;
        return out;
      }
    }
    out.recurse40Fired = 1;
    const count40 = src.hCount40 | 0;
    if (roomCount7cb6e0Seed40Gate(idm, count40, src.mgrSeed264f8) !== 0) {
      esi += count40;
    }
    out.recurse4bFired = 1;
    const count4b = src.hCount4b | 0;
    const skip7a29 = count4b > 0
      ? roomCount7cb6e07a29Skip(idm, src.mode26584)
      : 0;
    if (count4b > 0 && skip7a29 !== 0) {
      /* je sampling: skips the 0xbd arm AND ids 0x17/0x18/0x13 */
    } else {
      if (count4b > 0) {
        out.host740bc0Fired = 1;
        if (_u32(src.hBdR) !== 0) {
          out.hostRngFired = 1;
          if (roomCount7cb6e0BdCompare(src.hRngRaw, idm) !== 0) {
            esi += count4b;
          }
        }
      }
      if (_u32(idm) === 0x17) {
        out.host17Fired = 1;
        esi += _i32(src.hAdder17);
      } else {
        esi += roomCount7cb6e0FieldGate(
          idm, _u32(idm) === 0x18 ? src.f18dc : src.f18e0);
      }
    }
  }
  out.samplingReached = 1;
  out.host8bFired = 1;
  if ((_u32(src.has8b) & 0xff) === 0) out.host1caFired = 1;
  const width = roomCount7cb6e0ScanWidth(src.has8b, src.has1ca);
  for (let i = 0; _u32(i) < _u32(width); i += 1) {
    esi += roomCount7cb6e0SlotMatch(i === 0 ? src.slot0 : src.slot1, idm);
  }
  esi += roomCount7cb6e0Block17c4({
    blockNonNull: src.blockNonNull, block0: src.block0, block4: src.block4,
    f2ef8: src.f2ef8, idMasked: idm,
  });
  esi += roomCount7cb6e0Flag17cc(src.flag17cc);
  esi += roomCount7cb6e0ItemAdd(
    idm, src.itemBegin, src.itemEnd, src.itemW0, src.itemW1);
  esi += roomCount7cb6e0ByteAdd(
    idm, src.byteBegin, src.byteEnd, src.byteVal);
  esi = roomCount7cb6e0Adjust2ef8(esi, src.f2ef8, src.byte2ef0, idm);
  out.result = roomCount7cb6e0FinalGate(esi, src.has1b7);
  if (out.result > 0) out.host1b7Fired = 1;
  return out;
}

/* ---- Probe C 0x007c3980 ---- */

export const ROOM_ROLL_VA = 0x007c3980;
export const ROOM_ROLL_RET_VA = 0x007c3a4e;
export const ROOM_ROLL_FATAL_HOST_VA = 0x00a112c0;
export const ROOM_ROLL_COUNTER_BASE_OFF = 0x1520;
export const ROOM_ROLL_FLAGS_OFF = 0x1574;
export const ROOM_ROLL_FLAGS_MASK = 0x41f;
export const ROOM_ROLL_DIVISOR = 6;
export const ROOM_ROLL_HOST_A_VA = 0x00763570;
export const ROOM_ROLL_HOST_B_VA = 0x007abd30;

/** Core xorshift: t=s0^(s0>>>s1); u=(t<<s2)^t; w=(u>>>s3)^u; div 6.
    JS >>>/<< mask shift counts &31 like x86 hardware (pin s=32 -> 0). */
export function roomRoll7c3980Core(s0, s1, s2, s3) {
  const t = (s0 ^ (s0 >>> s1)) >>> 0;
  const u = ((t << s2) ^ t) >>> 0;
  const w = (u ^ (u >>> s3)) >>> 0;
  return { newS0: w >>> 0, index: w % ROOM_ROLL_DIVISOR, fatal: s0 === 0 ? 1 : 0 };
}
/** 0x7c3a17 or [esi+0x1574],0x41f. */
export function roomRoll7c3980FlagsOr(oldFlags) {
  return (_u32(oldFlags) | ROOM_ROLL_FLAGS_MASK) >>> 0;
}
/** 0x7c3a26..0x7c3a3a fire HOST 0x7abd30 iff both gates zero. */
export function roomRoll7c3980FollowupGate(f3fc, byte173) {
  return (_u32(f3fc) === 0 && (_u32(byte173) & 0xff) === 0) ? 1 : 0;
}

/** idx29 caller glue 0x7fbab2..0x7fbadb (SIGNED jle skips). */
export function roomIdx29RollPlan(q) {
  return {
    rollFirst: (q | 0) > 1 ? 1 : 0,
    rollSecond: (q | 0) > 2 ? 1 : 0,
  };
}

/* ===================== ABI v87 (B3B7 small Update leaves) ==================
   The four SMALL concrete GridEntity Update bodies behind D5 slot-2
   (call [ecx] @0x00803bd8, base vtbl 0xb686e8): Wall 0x0040c200 (folded
   ret 0), Statue 0x00838520, PressurePlate 0x00983330, TNT head
   0x0071f090 + switch table 0x71f238. Fresh PE dumps cpu-dump/{0040c200,
   00838520,00983330,0071f090}.txt. Host leaves stay typed with exact VAs. */

export const ROOM_WALL_UPDATE_VA = 0x0040c200;
export const ROOM_WALL_UPDATE_END_VA = 0x0040c203;
export const ROOM_WALL_RET = 0;

/** Wall Update: effect-free folded body; guest eax undefined, pinned as 0. */
export function roomWallUpdate40c200() {
  return ROOM_WALL_RET;
}

export const ROOM_STATUE_UPDATE_VA = 0x00838520;
export const ROOM_STATUE_HOST_TEARDOWN_VA = 0x00409030;

/** Statue 0x00838520: byte gate fires the typed teardown pair; the dword
    state [esi+0xc] EXACT-matches drive the only store [esi+0x3c]. */
export function roomStatue838520Plan(flag149, stateC) {
  const hostCalls = (_u32(flag149) & 0xff) !== 0 ? 2 : 0;
  if ((stateC | 0) === 1) {
    return { hostCalls, storeFired: 1, storeValue: 3 };
  }
  if ((stateC | 0) === 2) {
    return { hostCalls, storeFired: 1, storeValue: 0 };
  }
  return { hostCalls, storeFired: 0, storeValue: 0 };
}

export const ROOM_PLATE_UPDATE_VA = 0x00983330;
export const ROOM_PLATE_HOST_DISPATCH1_VA = 0x009833c0;
export const ROOM_PLATE_HOST_DISPATCH2_VA = 0x009839f0;
export const ROOM_PLATE_GAME_GLOBAL = 0x00c71678;
export const ROOM_PLATE_IDX_BOUND = 0x1bf;
export const ROOM_PLATE_TIMER_SET = 0x12c;

/** SIGNED jge law 0x98338e: 1 iff timer OPEN (elem < 0x12c signed). */
export function roomPlate983330TimerGate(elemCur) {
  return (elemCur | 0) < ROOM_PLATE_TIMER_SET ? 1 : 0;
}

/** PressurePlate 0x00983330 plan. */
export function roomPlate983330Plan(flag149, type8, stateC, idx24, elemCur) {
  const hostCalls = (_u32(flag149) & 0xff) !== 0 ? 2 : 0;
  const dispatchVa = (_u32(type8) === 2)
    ? ROOM_PLATE_HOST_DISPATCH2_VA
    : ROOM_PLATE_HOST_DISPATCH1_VA;
  const idxInRange = _u32(idx24) <= ROOM_PLATE_IDX_BOUND ? 1 : 0;
  const timerOpen = roomPlate983330TimerGate(elemCur);
  let storeFired = 0;
  if (idxInRange !== 0 && timerOpen === 0) {
    storeFired = 0; /* jge skip */
  } else if ((stateC | 0) !== 0) {
    storeFired = 0; /* state gate */
  } else if (idxInRange === 0) {
    storeFired = 0; /* second unsigned bound */
  } else {
    storeFired = 1;
  }
  return {
    hostCalls,
    dispatchVa,
    storeFired,
    elemNew: storeFired !== 0 ? ROOM_PLATE_TIMER_SET : elemCur | 0,
  };
}

export const ROOM_TNT_UPDATE_VA = 0x0071f090;
export const ROOM_TNT_DEFAULT_RET_VA = 0x0071f231;
export const ROOM_TNT_TABLE_VA = 0x0071f238;
export const ROOM_TNT_TABLE = [
  0x0071f0bd, 0x0071f0bd, 0x0071f0d2, 0x0071f222, 0x0071f0e7,
];

export function roomTntTableValue(index) {
  return _u32(index) < ROOM_TNT_TABLE.length ? ROOM_TNT_TABLE[_u32(index)] : 0;
}

/** TNT head 0x71f090..0x71f237: SIGNED cmovge select into [edi+0x3c],
    then UNSIGNED ja default vs the pinned jump table. */
export function roomTnt71f090Head(stateC) {
  const s = _u32(stateC);
  const stored3c = (s | 0) >= 4 ? 0 : 2;
  if (s > 4) {
    return { stored3c, dispatchVa: ROOM_TNT_DEFAULT_RET_VA, defaultTaken: 1 };
  }
  return { stored3c, dispatchVa: roomTntTableValue(s), defaultTaken: 0 };
}

/* ===================== ABI v88 (MEDIUM Update bodies) ======================
   Gravity 0x0099b980 + Lock 0x00711950 GridEntity Update laws. Fresh PE
   dumps cpu-dump/{0099b980,00711950,0040add0,00711af0}.txt; evidence pack
   grid-bodies-large/. Host leaves stay typed with exact VAs. */

export const ROOM_GRAVITY_UPDATE_VA = 0x0099b980;
export const ROOM_GRAVITY_UPDATE_END_VA = 0x0099bac5;
export const ROOM_GRAVITY_SCALE_BITS = 0x42200000; /* 40.0f @0xbaa904 */
export const ROOM_GRAVITY_ADDY_BITS = 0x42f00000; /* 120.0f @0xbaaa00 */
export const ROOM_GRAVITY_HALF_BITS = 0x3f000000; /* 0.5f @0xbaa2d0 */
export const ROOM_GRAVITY_FLAG_OR = 0x8000;

/* cvttss2si: trunc toward zero; NaN / |v| >= 2^31 -> integer indefinite. */
function v88Cvttss(value) {
  const x = Math.fround(value);
  if (!Number.isFinite(x) || x >= 2147483648 || x < -2147483648) {
    return 0x80000000 | 0;
  }
  return x | 0;
}

/** Gravity per-entity law 0x99ba46..0x99ba7c. */
export function roomGravity99b980IterPlan(posXBits, posYBits, thisIdx,
  mgrW, mgrH) {
  const scale = peBitsToF32(ROOM_GRAVITY_SCALE_BITS);
  const addy = peBitsToF32(ROOM_GRAVITY_ADDY_BITS);
  const half = peBitsToF32(ROOM_GRAVITY_HALF_BITS);
  const px = Math.fround(peBitsToF32(posXBits >>> 0));
  const py = Math.fround(peBitsToF32(posYBits >>> 0));
  const cx = v88Cvttss(Math.fround(
    Math.fround(Math.fround(px - scale) / scale) + half));
  const cy = v88Cvttss(Math.fround(
    Math.fround(Math.fround(py - addy) / scale) + half));
  const cxs = cx | 0;
  const cys = cy | 0;
  const w = mgrW | 0;
  const h = mgrH | 0;
  let cellIdx = -1;
  if (cxs >= 0 && cxs < w && cys >= 0 && cys < h) {
    cellIdx = (Math.imul(_u32(mgrW), _u32(cys)) + _u32(cxs)) | 0;
  }
  const match = cellIdx === (thisIdx | 0) ? 1 : 0;
  return {
    cellXBits: cx >>> 0,
    cellYBits: cy >>> 0,
    cellIdx,
    match,
    flagOr: match !== 0 ? ROOM_GRAVITY_FLAG_OR : 0,
  };
}

/** Gravity tail teardown gate 0x99baa2: LOW-8-bit byte test only. */
export function roomGravity99b980TailTeardown(flag149) {
  return (_u32(flag149) & 0xff) !== 0 ? 2 : 0;
}

export const ROOM_LOCK_UPDATE_VA = 0x00711950;
export const ROOM_LOCK_UPDATE_END_VA = 0x00711ae7;
export const ROOM_LOCK_IS_TYPE_HOST_VA = 0x0040add0;
export const ROOM_LOCK_IS_TYPE_ID = 0xb6287c;
export const ROOM_LOCK_SCALE_BITS = 0x42200000;
export const ROOM_LOCK_ADDY_BITS = 0x42f00000;
export const ROOM_LOCK_R2_VA = 0x00baabbc;
export const ROOM_LOCK_R2_BITS = 0x44704000; /* 960.0f */
export const ROOM_LOCK_HOST_OPEN_VA = 0x00711af0;

/** Lock head 0x71195c..0x7119ac: dual gate -> var clear + bounded elem
    store; both paths converge on the loop gate [this+0xc]==0. */
export const ROOM_LOCK_IDX_BOUND = 0x1bf;
export function roomLock711950Head(flag74, hIsType, idx24, elemCur) {
  const armed = _u32(flag74) !== 0 && _u32(hIsType) !== 0 ? 1 : 0;
  const elemStoreFired =
    armed !== 0 && _u32(idx24) <= ROOM_LOCK_IDX_BOUND ? 1 : 0;
  return {
    var3cCleared: armed,
    elemStoreFired,
    elemNew: elemStoreFired !== 0 ? 0 : elemCur | 0,
  };
}

/** Lock per-entity distance law 0x711a22..0x711a94. */
export function roomLock711950IterPlan(posXBits, posYBits, entGate2c,
  thisIdx, mgrW) {
  const gateSkip = _u32(entGate2c) !== 0 ? 1 : 0;
  let idivTrap = 0;
  let quot = 0;
  let rem = 0;
  let dx = 0;
  let dy = 0;
  let dist2 = 0;
  let hostFired = 0;
  if (gateSkip === 0) {
    const dividend = thisIdx | 0;
    const divisor = mgrW | 0;
    if (divisor === 0 || (dividend === -2147483648 && divisor === -1)) {
      idivTrap = 1; /* PE #DE fault arm pinned */
    } else {
      quot = Math.trunc(dividend / divisor) | 0;
      rem = (dividend - quot * divisor) | 0;
    }
    const scale = Math.fround(peBitsToF32(ROOM_LOCK_SCALE_BITS));
    const addy = Math.fround(peBitsToF32(ROOM_LOCK_ADDY_BITS));
    const r2 = Math.fround(peBitsToF32(ROOM_LOCK_R2_BITS));
    const px = Math.fround(peBitsToF32(posXBits >>> 0));
    const py = Math.fround(peBitsToF32(posYBits >>> 0));
    dx = Math.fround(px - Math.fround(
      Math.fround(Math.fround(rem) * scale) + scale));
    dy = Math.fround(py - Math.fround(
      Math.fround(Math.fround(quot) * scale) + addy));
    dist2 = Math.fround(Math.fround(dy * dy) + Math.fround(dx * dx));
    /* comiss r2,dist2 / jbe skip: fire iff ORDERED r2 > dist2. */
    hostFired = idivTrap === 0 && r2 > dist2 ? 1 : 0;
  }
  /* Diagnostic intermediates pinned CANONICAL +NaN (0x7fc00000) when
     NaN — matches the cpp pin; comiss consumes orderedness only. */
  const canonBits = (f) => (Number.isNaN(f) ? 0x7fc00000 : peF32ToBits(f));
  return {
    gate2cSkip: gateSkip,
    idivTrap,
    quot,
    rem,
    dxBits: canonBits(dx) >>> 0,
    dyBits: canonBits(dy) >>> 0,
    dist2Bits: canonBits(dist2) >>> 0,
    hostFired,
  };
}

/** Lock tail teardown gate 0x711ac0: same LOW-8-bit test as Gravity. */
export function roomLock711950TailTeardown(flag149) {
  return (_u32(flag149) & 0xff) !== 0 ? 2 : 0;
}

/* ===================== ABI v89 (Web + Decoration Update bodies) ============
   Web 0x00721780 (vtbl 0xb69558 slot 2) and Decoration 0x0099a8e0
   (vtbl 0xb686c0 slot 2), evidence pack grid-bodies-large. Host leaves
   stay typed with exact VAs; floats travel as u32 bit patterns and the
   JS oracle mirrors every mulss/addss/divss step with Math.fround. */

export const ROOM_WEB_UPDATE_VA = 0x00721780;
export const ROOM_WEB_UPDATE_END_VA = 0x00721a0e;
export const ROOM_WEB_KIND_DISPATCH = 0xa;
export const ROOM_WEB_QUERY_ID = 0x278;
export const ROOM_WEB_HOST_QUERY_DIRECT_VA = 0x007706e0;
export const ROOM_WEB_HOST_QUERY_ALT_VA = 0x009305f0;
export const ROOM_WEB_HOST_SPAWN_VA = 0x006ad750;
export const ROOM_WEB_FATAL_HOST_VA = 0x00a112c0;
export const ROOM_WEB_SCALE_VA = 0x00baa904;
export const ROOM_WEB_SCALE_BITS = 0x42200000; /* 40.0f */
export const ROOM_WEB_ADDY_VA = 0x00baaa00;
export const ROOM_WEB_ADDY_BITS = 0x42f00000; /* 120.0f */
export const ROOM_WEB_THRESH_VA = 0x00baa880;
export const ROOM_WEB_THRESH_BITS = 0x41a80000; /* 21.0f */
export const ROOM_WEB_SPAWN_TEMPLATE = [
  0x3f800000, 0x3f800000, 0x3fa66666, 0x3f800000,
  0, 0, 0, 0,
  0x3e20a0a1, 0x3e20a0a1, 0x3e20a0a1,
];

/** SIGNED %4 idiom 0x72179f..0x7217b3: and 0x80000003 + sign fixup. */
export function roomWeb721780FrameMod4(frame) {
  let r = (frame | 0) & 3;
  if (r !== 0 && (frame | 0) < 0) r -= 4;
  return r >>> 0;
}

/** Type gate 0x72180c..0x721829: four EXACT arms == UNSIGNED <4. */
export function roomWeb721780TypeGate(type184) {
  return _u32(type184) < 4 ? 1 : 0;
}

/** Web body head gates + tail teardown classification. */
export function roomWeb721780Body(stateC, frame264f8, gridCount, flag149) {
  const frameMod4 = roomWeb721780FrameMod4(frame264f8);
  const early =
    (stateC | 0) !== 0 || frameMod4 !== 0 || (gridCount | 0) === 0 ? 1 : 0;
  return {
    frameMod4,
    loopEntered: early !== 0 ? 0 : 1,
    teardownPairs: (_u32(flag149) & 0xff) !== 0 ? 2 : 0,
  };
}

/** comiss/cmovbe MAX selection: unordered picks adx (CF|ZF -> cmovbe). */
function web89SelMax(ady, adx) {
  const unordered = Number.isNaN(ady) || Number.isNaN(adx);
  return unordered || ady <= adx ? adx : ady;
}

/** Web per-entity law 0x7217d4..0x721900. */
export function roomWeb721780IterPlan(type184, hQueryDirect, hQueryAlt,
  kind4, latch26d4, idx24, mgrW, posXBits, posYBits) {
  const typeSkip = roomWeb721780TypeGate(type184);
  if (typeSkip !== 0) {
    return {
      typeSkip, queryHosts: 0, toggleFired: 0, latchNew: 0, proxChecked: 0,
      idivTrap: 0, quot: 0, rem: 0, dxBits: 0, dyBits: 0, distMaxBits: 0,
      spawnFired: 0,
    };
  }
  const direct = _u32(hQueryDirect) !== 0 ? 1 : 0;
  const alt = _u32(hQueryAlt) !== 0 ? 1 : 0;
  const hit = direct !== 0 || alt !== 0 ? 1 : 0;
  const queryHosts = direct !== 0 ? 1 : 2;
  if (hit !== 0 && _u32(kind4) === ROOM_WEB_KIND_DISPATCH) {
    return {
      typeSkip, queryHosts, toggleFired: 0, latchNew: 0, proxChecked: 0,
      idivTrap: 0, quot: 0, rem: 0, dxBits: 0, dyBits: 0, distMaxBits: 0,
      spawnFired: 0,
    };
  }
  let toggleFired = 0;
  let latchNew = 0;
  if (hit !== 0) {
    toggleFired = 1;
    latchNew = _u32(latch26d4) !== 0 ? 1 : 0;
  }
  const canonBits = (f) => (Number.isNaN(f) ? 0x7fc00000 : peF32ToBits(f));
  const dividend = idx24 | 0;
  const divisor = mgrW | 0;
  if (divisor === 0 || (dividend === -2147483648 && divisor === -1)) {
    return {
      typeSkip, queryHosts, toggleFired, latchNew, proxChecked: 1,
      idivTrap: 1, quot: 0, rem: 0, dxBits: 0, dyBits: 0, distMaxBits: 0,
      spawnFired: 0,
    };
  }
  const quot = Math.trunc(dividend / divisor) | 0;
  const rem = (dividend - quot * divisor) | 0;
  const scale = Math.fround(peBitsToF32(ROOM_WEB_SCALE_BITS));
  const addy = Math.fround(peBitsToF32(ROOM_WEB_ADDY_BITS));
  const thresh = Math.fround(peBitsToF32(ROOM_WEB_THRESH_BITS));
  const px = Math.fround(peBitsToF32(posXBits >>> 0));
  const py = Math.fround(peBitsToF32(posYBits >>> 0));
  const dx = Math.fround(px - Math.fround(
    Math.fround(Math.fround(rem) * scale) + scale));
  const dy = Math.fround(py - Math.fround(
    Math.fround(Math.fround(quot) * scale) + addy));
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const sel = web89SelMax(ady, adx);
  return {
    typeSkip, queryHosts, toggleFired, latchNew, proxChecked: 1,
    idivTrap: 0, quot, rem,
    dxBits: canonBits(dx) >>> 0,
    dyBits: canonBits(dy) >>> 0,
    distMaxBits: canonBits(sel) >>> 0,
    spawnFired: thresh > sel ? 1 : 0,
  };
}

/** Spawn-template dword read (pinned block B+0x00..0x28). */
export function roomWebSpawnTemplate(index) {
  return _u32(index) < ROOM_WEB_SPAWN_TEMPLATE.length
    ? ROOM_WEB_SPAWN_TEMPLATE[_u32(index)] >>> 0 : 0;
}

export const ROOM_DECO_UPDATE_VA = 0x0099a8e0;
export const ROOM_DECO_UPDATE_END_VA = 0x0099abf7;
export const ROOM_DECO_TYPE_PUDDLE_SKIP = 0x3e8;
export const ROOM_DECO_SSO_INLINE_CAP = 0x10;
export const ROOM_DECO_ENT_TYPE_PIT = 5;
export const ROOM_DECO_RENDER_A_OFF = 0x1848;
export const ROOM_DECO_RENDER_B_OFF = 0x1874;
export const ROOM_DECO_HOST_NAME_FETCH_VA = 0x00452bf0;
export const ROOM_DECO_HOST_FIND_VA = 0x00557bd0;
export const ROOM_DECO_PUDDLE_STR_VA = 0x00b7d918;
export const ROOM_DECO_HOST_GRID_AT_VA = 0x00417870;
export const ROOM_DECO_HOST_POS_GET_VA = 0x00709e50;
export const ROOM_DECO_HOST_WOBBLE_ADD_VA = 0x0040b590;
export const ROOM_DECO_SETTER_HOST_VA = 0x007b9940;
export const ROOM_DECO_SIN_THUNK_VA = 0x00af0917;
export const ROOM_DECO_FREE_HOST_VA = 0x00aef15c;
export const ROOM_DECO_IAT_GUARD_VA = 0x00b18894;
export const ROOM_DECO_X_BASE_BITS = 0x42700000; /* 60.0f @0xbaa950 */
export const ROOM_DECO_Y_BASE_BITS = 0x430c0000; /* 140.0f @0xbaaa30 */
export const ROOM_DECO_POS_SCALE_BITS = 0x3f266666; /* 0.65f @0xbaa324 */
export const ROOM_DECO_X_SPAN_BITS = 0x43a90000; /* 338.0f @0xbaab20 */
export const ROOM_DECO_Y_SPAN_BITS = 0x43360000; /* 182.0f @0xbaaa7c */
export const ROOM_DECO_HALF_BITS = 0x3f000000; /* 0.5f @0xbaa2d0 */
export const ROOM_DECO_SCALE1_BITS = 0x3f800000; /* 1.0f @0xbf941c */
export const ROOM_DECO_SCALE2_BITS = 0x40000000; /* 2.0f @0xbf93e8 */
export const ROOM_DECO_PHASE_STEP_BITS = 0x3c23d70a; /* 0.01f imm */
export const ROOM_DECO_PHASE_X_VA = 0x00c78dc4; /* BSS host input */
export const ROOM_DECO_PHASE_Y_VA = 0x00c78edc; /* BSS host input */

/** Decoration body gates 0x99a923..0x99a9bf. */
export function roomDeco99a8e0Body(type8, flag149, hFindHit, gate74) {
  const earlyRet =
    _u32(type8) === ROOM_DECO_TYPE_PUDDLE_SKIP ||
    (_u32(flag149) & 0xff) === 0 ? 1 : 0;
  if (earlyRet !== 0) {
    return { earlyRet, teardownPairs: 0, clearedByteFired: 0, loopEntered: 0 };
  }
  if (_u32(hFindHit) === 0) {
    return { earlyRet, teardownPairs: 2, clearedByteFired: 0, loopEntered: 0 };
  }
  return {
    earlyRet,
    teardownPairs: 2,
    clearedByteFired: _u32(gate74) !== 0 ? 1 : 0,
    loopEntered: 1,
  };
}

/** SSO cmovae law 0x99a963..0x99a970: heap ptr iff field >= 0x10 u32. */
export function roomDecoSsoHeapSelected(ssoField) {
  return _u32(ssoField) >= ROOM_DECO_SSO_INLINE_CAP ? 1 : 0;
}

/** Axis wobble core 0x99a9e1..0x99aad9 (X/Y share the chain). */
export function roomDecoAxisWobble(posBits, baseBits, posScaleBits,
  spanOffBits, phaseBssBits, scaleBits, sinHostBits) {
  const f = (b) => Math.fround(peBitsToF32(b >>> 0));
  const pos = f(posBits);
  const base = f(baseBits);
  const pscale = f(posScaleBits);
  const spanOff = f(spanOffBits);
  const phase = f(phaseBssBits);
  const scale = f(scaleBits);
  const half = Math.fround(peBitsToF32(ROOM_DECO_HALF_BITS));
  const sinr = f(sinHostBits);
  const tPos = Math.fround(Math.fround(pos - base) * pscale);
  const tPhase = Math.fround(Math.fround(phase - spanOff) * half);
  let pre = Math.fround(Math.fround(tPhase + tPos) * scale);
  pre = Math.fround(pre + half);
  const post = Math.fround(sinr / scale);
  const canon = (v) => (Number.isNaN(v) ? 0x7fc00000 : peF32ToBits(v));
  return { preSinBits: canon(pre) >>> 0, postDivBits: canon(post) >>> 0 };
}

/** Setter/render phase 0x99ab0c..0x99ab7b. */
export function roomDecoRenderTarget(outProbeBits, visByte, setterAl) {
  const probe = Math.fround(peBitsToF32(outProbeBits >>> 0));
  if (!(probe > 0)) {
    return { setterCalls: 0, renderPass: 0, targetBase: 0 };
  }
  if ((_u32(visByte) & 0xff) !== 0) {
    return { setterCalls: 1, renderPass: 0, targetBase: 0 };
  }
  return {
    setterCalls: 2,
    renderPass: 1,
    targetBase: _u32(setterAl) !== 0 ? ROOM_DECO_RENDER_B_OFF
                                     : ROOM_DECO_RENDER_A_OFF,
  };
}

/* ===================== ABI v88 (Spikes Update 0x0071e9b0) ==================
   Exact-ZHL `GridEntity_Spikes::Update()` (14 B). Fresh dump
   cpu-dump/0071e9b0.txt (110 insns, ret @0x71eb24, 0 IND, 7 E8). Host
   leaves stay typed: GridEntity::hurt_surroundings 0x70b170, predicate
   0x71e920 (GetRoomByIdx 0x740bc0), 0x71eb30, ANM2::Play 0x40a380,
   teardown 0x409030 x2. 0x71df80 is PURE (eax-only, edx preserved). */

export const ROOM_SPIKES_UPDATE_VA = 0x0071e9b0;
export const ROOM_SPIKES_UPDATE_RET_VA = 0x0071eb24;
export const ROOM_SPIKES_UPDATE_END_VA = 0x0071eb25;
export const ROOM_SPIKES_NEXT_VA = 0x00838c30; /* Teleporter Update */
export const ROOM_SPIKES_HOST_HURT_VA = 0x0070b170;
export const ROOM_SPIKES_HOST_PRED_VA = 0x0071e920;
export const ROOM_SPIKES_HOST_EB30_VA = 0x0071eb30;
export const ROOM_SPIKES_HOST_PLAY_VA = 0x0040a380;
export const ROOM_SPIKES_HOST_TEARDOWN_VA = 0x00409030;
export const ROOM_SPIKES_STAGE_GATE_VA = 0x0071df80;
export const ROOM_SPIKES_IDX_BOUND = 0x1bf;
export const ROOM_SPIKES_COST_DOWN = 0x3e7;
export const ROOM_SPIKES_COST_UP = 0x1f4;
export const ROOM_SPIKES_MASK_NARROW = 0x80;
export const ROOM_SPIKES_MASK_WIDE = 0x10000080;
export const ROOM_SPIKES_ROOM_TYPE_D = 0xd;
export const ROOM_SPIKES_TYPE_SPIKES = 8;
export const ROOM_SPIKES_TYPE_COOL = 0x1c;
export const ROOM_SPIKES_TYPE_TIMER = 9;
export const ROOM_SPIKES_VARIANT_WIDE = 0x64;
export const ROOM_SPIKES_TIMER_RELOAD = 0x3c;
export const ROOM_SPIKES_HURT_DIST_BITS = 0x41300000; /* 11.0f @0xbaa82c */
export const ROOM_SPIKES_HURT_DMG_BITS = 0x41000000; /* 8.0f @0xbaa7e8 */
export const ROOM_SPIKES_HURT_PLAYER_DAMAGE = 2;
export const ROOM_SPIKES_ANIM_UNSUMMON_WOMB = 0x00b638d0;
export const ROOM_SPIKES_ANIM_SUMMON_WOMB = 0x00b6320c;
export const ROOM_SPIKES_ANIM_UNSUMMON = 0x00b6922c;
export const ROOM_SPIKES_ANIM_SUMMON = 0x00b1d420;
export const ROOM_SPIKES_STAGE_MATCH = Object.freeze([
  0xa, 0xb, 0xc, 0xd, 0x22, 0x2b, 0x2c, 0x30,
]);

/** 0x71df80: Room+0x1d18 EXACT-match set -> AL=1. eax-only; edx live. */
export function roomSpikes71df80StageMatch(room1d18) {
  const v = room1d18 | 0;
  for (const id of ROOM_SPIKES_STAGE_MATCH) {
    if (v === id) return 1;
  }
  return 0;
}

/** Mask / IgnoreGridCollisionClass for hurt_surroundings (stateC==0 path).
    Mask wide iff roomType==0xd OR variant UNSIGNED>=0x64 OR type==0x1c.
    Ignore (AL) iff roomType==0xd OR (type==8 && variant>=0x64) OR type==0x1c. */
export function roomSpikes71e9b0HurtFire(roomType, type4, variant8) {
  const rt = roomType | 0;
  const ty = type4 | 0;
  const vr = _u32(variant8);
  const wide = rt === ROOM_SPIKES_ROOM_TYPE_D
    || vr >= ROOM_SPIKES_VARIANT_WIDE
    || ty === ROOM_SPIKES_TYPE_COOL;
  const ignore = rt === ROOM_SPIKES_ROOM_TYPE_D
    || (ty === ROOM_SPIKES_TYPE_SPIKES && vr >= ROOM_SPIKES_VARIANT_WIDE)
    || ty === ROOM_SPIKES_TYPE_COOL ? 1 : 0;
  return {
    mask: wide ? ROOM_SPIKES_MASK_WIDE : ROOM_SPIKES_MASK_NARROW,
    ignore,
  };
}

/** Cost store [mgr+idx*4+0x76c]. UNSIGNED ja skip vs 0x1bf. */
export function roomSpikes71e9b0Cost(stateC, idx24) {
  if (_u32(idx24) > ROOM_SPIKES_IDX_BOUND) {
    return { fired: 0, value: 0 };
  }
  return {
    fired: 1,
    value: (stateC | 0) === 0 ? ROOM_SPIKES_COST_DOWN : ROOM_SPIKES_COST_UP,
  };
}

/** Anim string for ANM2::Play: cmovne on PRE-call [this+0xc] (edx live). */
export function roomSpikes71e9b0AnimVa(stageMatch, stateC) {
  if (_u32(stageMatch) !== 0) {
    return (stateC | 0) !== 0
      ? ROOM_SPIKES_ANIM_SUMMON_WOMB
      : ROOM_SPIKES_ANIM_UNSUMMON_WOMB;
  }
  return (stateC | 0) !== 0
    ? ROOM_SPIKES_ANIM_SUMMON
    : ROOM_SPIKES_ANIM_UNSUMMON;
}

/** Composed Spikes Update plan. predAl is the 0x71e920 captured AL. */
export function roomSpikes71e9b0Plan({
  stateC, type4, variant8, roomType, idx24, predAl, field74, flag84,
  timer154, room1d18, flag149,
} = {}) {
  const state = stateC | 0;
  const hurt = roomSpikes71e9b0HurtFire(roomType, type4, variant8);
  const hurtFired = state === 0 ? 1 : 0;
  const cost = roomSpikes71e9b0Cost(state, idx24);
  const pred = _u32(predAl) !== 0 ? 1 : 0;
  let eb30 = 0;
  let timerDec = 0;
  let timerNew = timer154 | 0;
  let stateNew = state;
  let animPlay = 0;
  let animVa = 0;
  const stageMatch = roomSpikes71df80StageMatch(room1d18);
  if (pred !== 0) {
    const flag84On = (_u32(flag84) & 0xff) !== 0;
    if (state === 0 || (_u32(field74) !== 0 && flag84On)) eb30 = 1;
  } else if ((type4 | 0) === ROOM_SPIKES_TYPE_TIMER) {
    const t = timer154 | 0;
    if (t > 0) {
      timerDec = 1;
      const next = (t - 1) | 0;
      if (next > 0) {
        timerNew = next;
        if (next === 5) {
          animPlay = 1;
          animVa = roomSpikes71e9b0AnimVa(stageMatch, state);
        }
      } else {
        timerNew = ROOM_SPIKES_TIMER_RELOAD;
        stateNew = state === 0 ? 1 : 0;
      }
    }
  }
  return {
    hurtFired,
    hurtMask: hurtFired !== 0 ? hurt.mask : 0,
    hurtIgnore: hurtFired !== 0 ? hurt.ignore : 0,
    costFired: cost.fired,
    costValue: cost.value,
    eb30Fired: eb30,
    timerDec,
    timerNew,
    stateCNew: stateNew,
    animPlay,
    animVa: animVa >>> 0,
    teardownPairs: (_u32(flag149) & 0xff) !== 0 ? 2 : 0,
    stageMatch,
  };
}
