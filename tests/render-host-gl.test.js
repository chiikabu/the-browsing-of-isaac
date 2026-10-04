import test from "node:test";
import assert from "node:assert/strict";
import * as R from "../scripts/decomp/game-render-model.mjs";
import {
  createRenderGlHost,
  readPngSize,
  RENDER_GAME_OFF,
  RENDER_HOST_INFO,
  RENDER_HOST_KIND,
  RENDER_SLICE_ABI_VERSION,
  RENDER_VTABLE_KINDS,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
} from "../web/js/render-host-gl.js";

/* Behavioural tests for the render-slice GL host bodies (web/js/render-host-gl.js).
 *
 * The event sequence below is the REAL kind/order sequence the driver emits;
 * it was captured by running `node dbg_render.mjs` at the repo root against
 * output/decomp/game-render-slice/game-render-slice.wasm (ABI v4):
 *
 *   event kinds+repeats: 24:rep1 25:rep1 1:rep1 2:rep1 3:rep1 27:rep1
 *                        5:rep6 28:rep1 8:rep1 21:rep1
 *
 * i.e. RT_REBIND, BIND_A1DFD0, BOOST_74EFD0, BOOST_827BC0, COLOR_9956E0,
 * TREE_ERASE_424540, GRID_80C810 (repeat 6 == the 3x2 grid's non-null slots),
 * RT_POP_A19180, RT_POP, EPILOG_825DE0. The same dbg_render.mjs Game buffer
 * is reproduced here (fill (i*31+7)&0xff, camera 12.5/-3.25, fade src
 * 0.25/0.5/0.75, entityCount 2, gridW 3, gridH 2, flag11f6 0).
 *
 * The module never imports the model (it is a zero-import browser module), so
 * the first test pins its ABI mirror against scripts/decomp/game-render-model.mjs.
 */

const K = RENDER_HOST_KIND;

/* --------------------------------------------------------------------------
 * Fixtures
 * ------------------------------------------------------------------------ */

/** The exact dbg_render.mjs Game-object fixture. */
function makeGameBuffer(overrides = {}) {
  const buf = new Uint8Array(R.GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  for (let i = 0; i < buf.length; i += 1) buf[i] = (i * 31 + 7) & 0xff;
  const w = new DataView(buf.buffer);
  w.setFloat32(R.GAME_RENDER_OFF.cameraBaseX, overrides.cameraX ?? 12.5, true);
  w.setFloat32(R.GAME_RENDER_OFF.cameraBaseY, overrides.cameraY ?? -3.25, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcR, overrides.srcR ?? 0.25, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcG, overrides.srcG ?? 0.5, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcB, overrides.srcB ?? 0.75, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcA, 1, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeDstR, overrides.dstR ?? 0, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeDstG, overrides.dstG ?? 0, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeDstB, overrides.dstB ?? 0, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeDstA, overrides.dstA ?? 1, true);
  w.setUint32(R.GAME_RENDER_OFF.entityCount, overrides.entityCount ?? 2, true);
  w.setUint32(R.GAME_RENDER_OFF.gridW, overrides.gridW ?? 3, true);
  w.setUint32(R.GAME_RENDER_OFF.gridH, overrides.gridH ?? 2, true);
  w.setUint8(R.GAME_RENDER_OFF.flag11f6, 0);
  w.setFloat32(R.GAME_RENDER_OFF.overlayScaleX, overrides.overlayScaleX ?? 2, true);
  w.setFloat32(R.GAME_RENDER_OFF.overlayScaleY, overrides.overlayScaleY ?? 3, true);
  w.setUint8(R.GAME_RENDER_OFF.overlayDrawFlag, 1);
  w.setUint8(R.GAME_RENDER_OFF.overlaySwapFlag, 0);
  return buf;
}

/** Driver-shaped host event (exactly what frame-render-root.mjs passes). */
function ev(kind, extra = {}) {
  return {
    kind,
    hostKind: kind,
    hostVa: extra.hostVa ?? (RENDER_HOST_INFO[kind]?.va ?? 0),
    hostReceiver: extra.hostReceiver ?? 0,
    hostVtableSlot: extra.hostVtableSlot ?? 0,
    hostArg0: extra.hostArg0 ?? 0,
    hostArg1: extra.hostArg1 ?? 0,
    hostRepeat: extra.hostRepeat ?? 1,
    continuationKind: extra.continuationKind ?? 0,
  };
}

/** The captured dbg_render.mjs sequence, in order. */
function dbgSequence() {
  return [
    ev(K.RT_REBIND, { hostVa: R.GAME_RENDER_VA_RT_A18300, continuationKind: 2 }),
    ev(K.BIND_A1DFD0, { hostVa: R.GAME_RENDER_VA_BIND_A1DFD0, continuationKind: 3 }),
    ev(K.BOOST_74EFD0, { hostVa: R.GAME_RENDER_VA_BOOST_74EFD0, hostReceiver: 0, continuationKind: 6 }),
    ev(K.BOOST_827BC0, { hostVa: R.GAME_RENDER_VA_BOOST_827BC0, continuationKind: 7 }),
    ev(K.COLOR_9956E0, { hostVa: R.GAME_RENDER_VA_COLOR_BIND, hostReceiver: R.GAME_RENDER_RECV_COLOR_BIND, continuationKind: 9 }),
    ev(K.TREE_ERASE_424540, { hostVa: R.GAME_RENDER_VA_TREE_ERASE_424540, hostReceiver: R.GAME_RENDER_RECV_TREE, hostArg0: R.GAME_RENDER_RECV_TREE, hostArg1: 0x1234, continuationKind: 11 }),
    ev(K.GRID_80C810, { hostVa: R.GAME_RENDER_VA_GRID_DRAW, hostRepeat: 6, hostArg0: 0x2000, continuationKind: 14 }),
    ev(K.RT_POP_A19180, { hostVa: R.GAME_RENDER_VA_RT_A19180, hostReceiver: R.GAME_RENDER_VA_RT_MANAGER_C798E0, hostArg0: 1, continuationKind: 20 }),
    ev(K.RT_POP, { hostVa: R.GAME_RENDER_VA_RT_A18300, continuationKind: 21 }),
    ev(K.EPILOG_825DE0, { hostVa: R.GAME_RENDER_VA_EPILOG_825DE0, continuationKind: 1 }),
  ];
}

function runSequence(host, events) {
  const results = [];
  for (const e of events) results.push(host.handler(e));
  return results;
}

function quads(host, tag = null) {
  return host.commands.filter((c) => c.op === "quad" && (tag === null || c.tag === tag));
}

/** 8-byte PNG magic + IHDR with the given size (header only; never decoded). */
function fakePngBytes(w, h) {
  const b = new Uint8Array(24);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  const dv = new DataView(b.buffer);
  dv.setUint32(8, 13, false);
  b[12] = 0x49; b[13] = 0x48; b[14] = 0x44; b[15] = 0x52; // "IHDR"
  dv.setUint32(16, w, false);
  dv.setUint32(20, h, false);
  return b;
}

/* --------------------------------------------------------------------------
 * ABI mirror (the module is zero-import by design; this pins the mirror)
 * ------------------------------------------------------------------------ */

test("ABI mirror matches scripts/decomp/game-render-model.mjs", () => {
  assert.equal(RENDER_SLICE_ABI_VERSION, R.GAME_RENDER_SLICE_ABI_VERSION);
  assert.deepEqual(RENDER_GAME_OFF, R.GAME_RENDER_OFF);

  const expected = {
    BOOST_74EFD0: R.GAME_RENDER_HOST_BOOST_74EFD0,
    BOOST_827BC0: R.GAME_RENDER_HOST_BOOST_827BC0,
    COLOR_9956E0: R.GAME_RENDER_HOST_COLOR_9956E0,
    ENTITY_806C20: R.GAME_RENDER_HOST_ENTITY_806C20,
    GRID_80C810: R.GAME_RENDER_HOST_GRID_80C810,
    ANIM_40A030: R.GAME_RENDER_HOST_ANIM_40A030,
    BODY_817830: R.GAME_RENDER_HOST_BODY_817830,
    RT_POP: R.GAME_RENDER_HOST_RT_POP,
    VT_408590_PAIR_A: R.GAME_RENDER_HOST_VT_408590_PAIR_A,
    VT_408590_PAIR_B: R.GAME_RENDER_HOST_VT_408590_PAIR_B,
    VT_40C550_ADDREF: R.GAME_RENDER_HOST_VT_40C550_ADDREF,
    VT_40C550_RELEASE: R.GAME_RENDER_HOST_VT_40C550_RELEASE,
    HOOK_C7163C: R.GAME_RENDER_HOST_HOOK_C7163C,
    GETROOMBYIDX: R.GAME_RENDER_HOST_GETROOMBYIDX,
    ONCE_HEADER: R.GAME_RENDER_HOST_ONCE_HEADER,
    ONCE_CTOR: R.GAME_RENDER_HOST_ONCE_CTOR,
    ONCE_ATEXIT: R.GAME_RENDER_HOST_ONCE_ATEXIT,
    ONCE_FOOTER: R.GAME_RENDER_HOST_ONCE_FOOTER,
    ALLOC: R.GAME_RENDER_HOST_ALLOC,
    ASSERT_A112C0: R.GAME_RENDER_HOST_ASSERT_A112C0,
    EPILOG_825DE0: R.GAME_RENDER_HOST_EPILOG_825DE0,
    EPILOG_826AE0: R.GAME_RENDER_HOST_EPILOG_826AE0,
    EPILOG_820FD0: R.GAME_RENDER_HOST_EPILOG_820FD0,
    RT_REBIND: R.GAME_RENDER_HOST_RT_REBIND,
    BIND_A1DFD0: R.GAME_RENDER_HOST_BIND_A1DFD0,
    STAGE39_83A1B0: R.GAME_RENDER_HOST_STAGE39_83A1B0,
    TREE_ERASE_424540: R.GAME_RENDER_HOST_TREE_ERASE_424540,
    RT_POP_A19180: R.GAME_RENDER_HOST_RT_POP_A19180,
    GET_STAGE_ID_738470: R.GAME_RENDER_HOST_GET_STAGE_ID_738470,
    BODY_817830_TRUNK: R.GAME_RENDER_HOST_BODY_817830_TRUNK,
    BODY_817830_TAIL: R.GAME_RENDER_HOST_BODY_817830_TAIL,
    GETLROOM_81F8B0: R.GAME_RENDER_HOST_GETLROOM_81F8B0,
    A10690: R.GAME_RENDER_HOST_A10690,
    A102E0: R.GAME_RENDER_HOST_A102E0,
    A106E0: R.GAME_RENDER_HOST_A106E0,
  };
  for (const [name, value] of Object.entries(expected)) {
    assert.equal(K[name], value, `kind ${name}`);
  }
  /* all 35 kinds covered, none extra */
  const ids = Object.keys(RENDER_HOST_INFO).map(Number).sort((a, b) => a - b);
  assert.deepEqual(ids, Array.from({ length: 35 }, (_, i) => i + 1));
  /* the four vtable kinds agree with the model's predicate */
  for (let k = 1; k <= 35; k += 1) {
    assert.equal(
      RENDER_VTABLE_KINDS.includes(k),
      !!R.gameRenderHostIsVtable(k),
      `vtable predicate for kind ${k}`,
    );
  }
});

/* --------------------------------------------------------------------------
 * The real driver sequence
 * ------------------------------------------------------------------------ */

test("dbg_render sequence: every kind is handled, none throws, none unknown", () => {
  const gameObject = makeGameBuffer();
  const host = createRenderGlHost({ gl: null, width: 1920, height: 1080, gameObject });
  host.beginFrame();
  const results = runSequence(host, dbgSequence());
  host.endFrame();

  assert.equal(host.stats.events, 10);
  assert.equal(host.stats.handled, 10);
  assert.equal(host.stats.unknown, 0);
  for (const r of results) assert.ok(r && typeof r === "object", "handler returned a result");
  assert.deepEqual(
    results.map((r) => r.kind),
    [24, 25, 1, 2, 3, 27, 5, 28, 8, 21],
  );
  /* per-kind counters mirror the dbg_render totals */
  for (const k of [24, 25, 1, 2, 3, 27, 5, 28, 8, 21]) {
    assert.equal(host.stats.byKind[k], 1, `byKind[${k}]`);
  }
});

test("HOST_COLOR_9956E0 clear colour equals the fade colour computed from the buffer", () => {
  const gameObject = makeGameBuffer({
    srcR: 0.25, srcG: 0.5, srcB: 0.75,
    dstR: 0.125, dstG: 0.25, dstB: 0.5, dstA: 0.75,
  });
  /* t is deliberately NOT 0.5: at t == 0.5 the lerp is symmetric in src/dst
     and an inverted (d - s) * t + s would produce the same numbers. */
  const host = createRenderGlHost({ gl: null, width: 960, height: 540, gameObject, fadeT: 0.25 });
  host.beginFrame();
  runSequence(host, dbgSequence());
  host.endFrame();

  const clears = host.commands.filter((c) => c.op === "clear");
  assert.equal(clears.length, 1, "exactly one clear, from the colour bind");
  const c = clears[0];
  assert.equal(c.kind, K.COLOR_9956E0);
  assert.equal(c.source, "buffer");

  /* PE lerp: (src - dst) * t + dst per channel; alpha is the raw dst alpha. */
  const t = 0.25;
  const lerp = (s, d) => (s - d) * t + d;
  assert.ok(Math.abs(c.r - lerp(0.25, 0.125)) < 1e-6, `r ${c.r}`);
  assert.ok(Math.abs(c.g - lerp(0.5, 0.25)) < 1e-6, `g ${c.g}`);
  assert.ok(Math.abs(c.b - lerp(0.75, 0.5)) < 1e-6, `b ${c.b}`);
  assert.ok(Math.abs(c.a - 0.75) < 1e-6, `a ${c.a}`);
  assert.deepEqual(host.stats.lastFadeColor, { r: c.r, g: c.g, b: c.b, a: c.a });
});

test("HOST_COLOR_9956E0 prefers the exact slice-computed fade bits when ctx carries the events struct", () => {
  const gameObject = makeGameBuffer();
  const host = createRenderGlHost({ gl: null, gameObject });
  const bits = (f) => {
    const dv = new DataView(new ArrayBuffer(4));
    dv.setFloat32(0, f, true);
    return dv.getUint32(0, true);
  };
  host.beginFrame();
  host.handler(ev(K.COLOR_9956E0), {
    events: {
      fadeColorBitsR: bits(0.1), fadeColorBitsG: bits(0.2),
      fadeColorBitsB: bits(0.3), fadeColorBitsA: bits(0.4),
    },
  });
  host.endFrame();
  const c = host.commands.find((x) => x.op === "clear");
  assert.equal(c.source, "events");
  assert.ok(Math.abs(c.r - 0.1) < 1e-6);
  assert.ok(Math.abs(c.g - 0.2) < 1e-6);
  assert.ok(Math.abs(c.b - 0.3) < 1e-6);
  assert.ok(Math.abs(c.a - 0.4) < 1e-6);
});

test("HOST_GRID_80C810 emits gridW*gridH quads and marks hostRepeat of them drawn", () => {
  const gameObject = makeGameBuffer({ gridW: 3, gridH: 2 });
  const host = createRenderGlHost({ gl: null, gameObject });
  host.beginFrame();
  runSequence(host, dbgSequence());
  host.endFrame();

  const g = quads(host, "grid");
  assert.equal(g.length, 3 * 2, "one quad per grid cell");
  assert.equal(host.stats.gridCells, 6);
  assert.equal(g.filter((q) => q.drawn).length, 6, "hostRepeat 6 cells drawn");
  /* lattice tiles the internal frame exactly */
  assert.deepEqual(
    g.map((q) => [q.cellX, q.cellY]),
    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  );
  assert.ok(Math.abs(g[0].w - INTERNAL_WIDTH / 3) < 1e-9);
  assert.ok(Math.abs(g[0].h - INTERNAL_HEIGHT / 2) < 1e-9);
  assert.ok(Math.abs(g[5].x - 2 * (INTERNAL_WIDTH / 3)) < 1e-9);
  assert.ok(Math.abs(g[5].y - 1 * (INTERNAL_HEIGHT / 2)) < 1e-9);
  assert.equal(g[0].firstSlot, 0x2000, "hostArg0 first non-null slot recorded");

  /* a different grid size changes the quad count in lockstep */
  const host2 = createRenderGlHost({ gl: null, gameObject: makeGameBuffer({ gridW: 7, gridH: 5 }) });
  host2.beginFrame();
  host2.handler(ev(K.GRID_80C810, { hostRepeat: 4 }));
  host2.endFrame();
  assert.equal(quads(host2, "grid").length, 35);
  assert.equal(quads(host2, "grid").filter((q) => q.drawn).length, 4);
});

test("HOST_ENTITY_806C20 emits exactly one quad per entity host event", () => {
  const gameObject = makeGameBuffer({ entityCount: 5 });
  const host = createRenderGlHost({ gl: null, gameObject });
  host.beginFrame();
  const seq = dbgSequence();
  /* the entity host fires between the tree erase and the grid draw */
  const withEntities = [
    ...seq.slice(0, 6),
    /* frame-render-root.mjs expands the loop: hostArg0 == the Entity* SLOT
       address re-read out of out_slots per iteration, plus entityIndex. */
    { ...ev(K.ENTITY_806C20, { hostVa: R.GAME_RENDER_VA_ENTITY_RENDER, hostArg0: 0x1000, continuationKind: 12 }), entityIndex: 0, entitySlotAddress: 0x1000 },
    { ...ev(K.ENTITY_806C20, { hostVa: R.GAME_RENDER_VA_ENTITY_RENDER, hostArg0: 0x1004, continuationKind: 12 }), entityIndex: 1, entitySlotAddress: 0x1004 },
    { ...ev(K.ENTITY_806C20, { hostVa: R.GAME_RENDER_VA_ENTITY_RENDER, hostArg0: 0x1008, continuationKind: 12 }), entityIndex: 2, entitySlotAddress: 0x1008 },
    ...seq.slice(6),
  ];
  runSequence(host, withEntities);
  host.endFrame();

  const e = quads(host, "entity");
  assert.equal(e.length, 3, "one quad per HOST_ENTITY_806C20 event");
  assert.equal(host.stats.entityDraws, 3);
  assert.deepEqual(e.map((q) => q.index), [0, 1, 2]);
  for (const q of e) {
    assert.equal(q.placeholder, true, "entity position is a documented placeholder");
    assert.equal(q.entityCount, 5, "Game+0x1264 entity count is real state");
  }
  /* the driver now supplies the real per-iteration slot ADDRESS + index
     (frame-render-root.mjs expands the entity loop out of out_slots) */
  assert.deepEqual(e.map((q) => q.slotAddress), [0x1000, 0x1004, 0x1008]);
  assert.deepEqual(e.map((q) => q.indexSource), ["driver", "driver", "driver"]);
  /* the index resets each frame */
  host.beginFrame();
  host.handler(ev(K.ENTITY_806C20));
  host.endFrame();
  assert.deepEqual(quads(host, "entity").map((q) => q.index), [0]);
});

test("entity events WITHOUT a driver entityIndex fall back to a per-frame counter that still advances by one", () => {
  /* Any caller that is not the current frame-render-root driver (an older
     driver, or a direct handler user) sends the bare 9-field event. The
     fallback counter must still produce one quad per event at consecutive
     indices — this is the only assertion covering that branch. */
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer({ entityCount: 3 }) });
  host.beginFrame();
  host.handler(ev(K.ENTITY_806C20, { hostArg0: 0x2000 }));
  host.handler(ev(K.ENTITY_806C20, { hostArg0: 0x2004 }));
  host.handler(ev(K.ENTITY_806C20, { hostArg0: 0x2008 }));
  host.endFrame();

  const e = quads(host, "entity");
  assert.equal(e.length, 3, "one quad per event on the fallback path too");
  assert.deepEqual(e.map((q) => q.index), [0, 1, 2], "counter advances by exactly one");
  assert.deepEqual(e.map((q) => q.indexSource), ["host-counter", "host-counter", "host-counter"]);
  /* hostArg0 is still the slot address even without entitySlotAddress */
  assert.deepEqual(e.map((q) => q.slotAddress), [0x2000, 0x2004, 0x2008]);
  /* distinct lattice slots (a stuck or doubled counter collapses/skips these) */
  assert.deepEqual(e.map((q) => q.x), [40, 150, 260]);
  assert.equal(host.stats.entityDraws, 3);
});

test("RT push/pop leaves the scissor stack balanced (base level only)", () => {
  const gameObject = makeGameBuffer();
  const host = createRenderGlHost({ gl: null, gameObject });
  host.beginFrame();
  runSequence(host, dbgSequence());
  const drawn = host.endFrame();

  assert.ok(drawn > 0);
  assert.equal(host.stats.rtPushes, 1, "RT_REBIND pushed once");
  assert.equal(host.stats.rtPops, 1, "RT_POP_A19180 popped once");
  assert.equal(host.stats.rtUnderflows, 0);
  assert.equal(host.stats.rtDepth, 0, "back to the base level");
  assert.equal(host.rtStack.length, 1, "only the base render target remains");
  assert.equal(host.lastFrame.balanced, true);

  const pushes = host.commands.filter((c) => c.op === "scissor-push");
  const pops = host.commands.filter((c) => c.op === "scissor-pop");
  const applies = host.commands.filter((c) => c.op === "scissor-apply");
  assert.equal(pushes.length, 1);
  assert.equal(pops.length, 1);
  assert.equal(applies.length, 1, "HOST_RT_POP re-applies the restored target");
  assert.equal(pops[0].underflow, false);
});

test("nested 817830 TRUNK/TAIL nests one extra RT level and unwinds it", () => {
  const gameObject = makeGameBuffer();
  const host = createRenderGlHost({ gl: null, gameObject });
  host.beginFrame();
  host.handler(ev(K.RT_REBIND));
  host.handler(ev(K.BODY_817830_TRUNK, { hostVa: R.GAME_RENDER_VA_BODY_817830, hostArg0: 1, continuationKind: 26 }));
  assert.equal(host.stats.rtDepth, 2, "aux body nests on top of the frame target");
  assert.equal(host.stats.rtMaxDepth, 2);
  host.handler(ev(K.BODY_817830_TAIL, { hostVa: R.GAME_RENDER_VA_BODY_817830_LROOM, continuationKind: 28 }));
  host.handler(ev(K.RT_POP_A19180));
  host.handler(ev(K.RT_POP));
  host.endFrame();

  assert.equal(host.stats.rtDepth, 0);
  assert.equal(host.stats.rtPushes, 2);
  assert.equal(host.stats.rtPops, 2);
  assert.equal(host.stats.rtUnderflows, 0);
  assert.equal(host.rtStack.length, 1);
  const tailPop = host.commands.find((c) => c.op === "scissor-pop" && c.kind === K.BODY_817830_TAIL);
  assert.equal(tailPop.va, R.GAME_RENDER_VA_BODY_817830_LROOM, "tail resume VA recorded");
});

test("an unmatched RT pop is counted as an underflow, never thrown, and the base level survives", () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  host.beginFrame();
  assert.doesNotThrow(() => host.handler(ev(K.RT_POP_A19180)));
  assert.doesNotThrow(() => host.handler(ev(K.RT_POP_A19180)));
  host.endFrame();
  assert.equal(host.stats.rtUnderflows, 2);
  assert.equal(host.stats.rtPops, 0);
  assert.equal(host.rtStack.length, 1);
});

test("unknown host kinds are counted and no-op, never thrown", () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  host.beginFrame();
  const before = host.commands.length;
  let r;
  assert.doesNotThrow(() => { r = host.handler(ev(99)); });
  assert.equal(r, null, "unknown kind returns null");
  assert.doesNotThrow(() => host.handler(ev(0)));
  assert.doesNotThrow(() => host.handler({}));
  assert.doesNotThrow(() => host.handler(null));
  assert.doesNotThrow(() => host.handler(ev(32)));
  assert.equal(host.commands.length, before, "no command emitted for unknown kinds");
  host.endFrame();

  assert.equal(host.stats.unknown, 4, "kind 99, 0, {}, null unknown; 32 GETLROOM known");
  assert.equal(host.stats.unknownKinds[99], 1);
  assert.equal(host.stats.unknownKinds[0], 3);
  assert.equal(host.stats.handled, 1);
});

test("BIND_A1DFD0 binds the camera-base transform read from the Game buffer", () => {
  const gameObject = makeGameBuffer({ cameraX: 12.5, cameraY: -3.25 });
  const host = createRenderGlHost({ gl: null, gameObject });
  host.beginFrame();
  runSequence(host, dbgSequence());
  host.endFrame();
  const t = host.commands.filter((c) => c.op === "transform" && c.kind === K.BIND_A1DFD0);
  assert.equal(t.length, 1);
  assert.equal(t[0].tx, -12.5, "screen = world - cameraBase");
  assert.equal(t[0].ty, 3.25);
  assert.equal(t[0].space, "world");
  assert.deepEqual(host.stats.lastCamera, { x: 12.5, y: -3.25 });
});

test("the 13 intentional no-op kinds draw nothing but are counted; the 4 vtable kinds record receiver+slot", () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  host.beginFrame();
  const noops = [1, 2, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 29];
  for (const k of noops) {
    host.handler(ev(k, { hostReceiver: 0xdead0000 + k, hostVtableSlot: k }));
  }
  host.endFrame();
  assert.equal(host.stats.handled, noops.length);
  assert.equal(host.stats.quads, 0, "no-op kinds emit no geometry");
  assert.equal(host.stats.clears, 0);
  for (const k of noops) assert.equal(RENDER_HOST_INFO[k].cls, "noop");

  /* the four vtable kinds (2 of them placeholders, 2 no-ops) record both */
  const host2 = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  host2.beginFrame();
  for (const k of RENDER_VTABLE_KINDS) {
    host2.handler(ev(k, { hostReceiver: 0x1000 + k, hostVtableSlot: 0x40 + k }));
  }
  host2.endFrame();
  assert.equal(host2.stats.vtableDispatches, 4);
  assert.deepEqual(
    host2.stats.vtable.map((v) => [v.kind, v.receiver, v.slot]),
    RENDER_VTABLE_KINDS.map((k) => [k, 0x1000 + k, 0x40 + k]),
  );
});

test("the six geometry-free kinds emit labelled placeholder quads", () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  host.beginFrame();
  host.handler(ev(K.ENTITY_806C20));
  host.handler(ev(K.ANIM_40A030, { hostRepeat: 2, hostReceiver: R.GAME_RENDER_RECV_ANIM_A }));
  host.handler(ev(K.BODY_817830));
  host.handler(ev(K.VT_408590_PAIR_A, { hostReceiver: 0x5000, hostVtableSlot: R.GAME_RENDER_VT_SLOT.sprite408590PairA }));
  host.handler(ev(K.VT_408590_PAIR_B, { hostReceiver: 0x5000, hostVtableSlot: R.GAME_RENDER_VT_SLOT.sprite408590PairB }));
  host.handler(ev(K.STAGE39_83A1B0, { hostReceiver: R.GAME_RENDER_RECV_STAGE39 }));
  host.endFrame();

  const ph = quads(host).filter((q) => q.placeholder);
  const kindsSeen = new Set(ph.map((q) => q.kind));
  assert.deepEqual([...kindsSeen].sort((a, b) => a - b), [4, 6, 7, 9, 10, 26]);
  for (const q of ph) assert.ok(typeof q.reason === "string" && q.reason.length > 0, "placeholder carries a reason");
  /* the overlay draws hostRepeat quads sized by the real +0x6edc/+0x6ee0 scale */
  const ov = quads(host, "overlay");
  assert.equal(ov.length, 2);
  assert.equal(ov[0].w, 64 * 2);
  assert.equal(ov[0].h, 64 * 3);
  assert.equal(ov[0].scaleFallback, false);
  assert.equal(ov[0].drawFlag, 1);
  /* no textures are ever fabricated by the host-event path */
  for (const q of quads(host)) assert.equal(q.tex, null);
});

/* --------------------------------------------------------------------------
 * endFrame() return value + app.js contract
 * ------------------------------------------------------------------------ */

test("endFrame returns the number of draw calls issued (0 when nothing painted)", () => {
  const gameObject = makeGameBuffer();
  const host = createRenderGlHost({ gl: null, width: 1920, height: 1080, gameObject });

  host.beginFrame();
  const empty = host.endFrame();
  assert.equal(typeof empty, "number");
  assert.equal(empty, 0, "no host events -> nothing painted -> stub fallback");

  host.beginFrame();
  runSequence(host, dbgSequence());
  const drawn = host.endFrame();
  assert.equal(typeof drawn, "number");
  assert.ok(drawn > 0, "the dbg sequence paints");
  assert.equal(host.stats.lastDrawCalls, drawn);
  assert.equal(host.lastFrame.drawCalls, drawn);

  /* G0-closed chain: only the two epilog hosts fire, nothing rasterises */
  host.beginFrame();
  host.handler(ev(K.EPILOG_825DE0));
  host.handler(ev(K.EPILOG_820FD0));
  assert.equal(host.endFrame(), 0, "closed option gate paints nothing");
});

test("a frame whose only GL work is the fade clear reports painted (endFrame >= 1, zero quads)", () => {
  /* This is EXACTLY what the live browser runs. On the JS-owned Game buffer
     entityCount and gridW/gridH are 0, so no entity or grid quads exist and
     the whole frame's GL work is the one HOST_COLOR_9956E0 full-screen fade
     clear. app.js gates the paint stub on `endFrame() > 0`; returning 0 here
     makes Module._isaac_tick clear OVER the fade the native path just drew.
     A frame that cleared the screen is a painted frame. */
  const zeroed = new Uint8Array(R.GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  const host = createRenderGlHost({ gl: null, width: 1920, height: 1080, gameObject: zeroed });
  host.beginFrame({ gameObject: zeroed });
  for (const k of [24, 25, 1, 2, 3, 27, 28, 8, 21]) host.handler(ev(k));
  const drawn = host.endFrame();

  assert.equal(typeof drawn, "number");
  assert.ok(drawn >= 1, `a fade-clear-only frame must report painted, got ${drawn}`);
  assert.equal(host.stats.quads, 0, "no entity/grid quads on a zeroed buffer");
  assert.equal(host.stats.clears, 1, "the fade clear is the frame's only GL work");
  assert.equal(host.stats.lastDrawCalls, drawn);
  assert.equal(host.stats.drawCalls, drawn);
  assert.equal(host.stats.unknown, 0);
  assert.equal(host.stats.frameErrors, 0);
});

test("a frame with nothing on screen returns 0 so the paint stub still runs", () => {
  const zeroed = new Uint8Array(R.GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  const host = createRenderGlHost({ gl: null, width: 1920, height: 1080, gameObject: zeroed });

  /* no events at all */
  host.beginFrame({ gameObject: zeroed });
  assert.equal(host.endFrame(), 0, "empty frame must not claim to have painted");

  /* only intentional no-op kinds: counted, but nothing rasterised */
  host.beginFrame({ gameObject: zeroed });
  for (const k of [1, 2, 29, 19]) host.handler(ev(k));
  assert.equal(host.endFrame(), 0, "no-op kinds alone must not claim to have painted");
  assert.equal(host.stats.clears, 0);
  assert.equal(host.stats.quads, 0);

  /* and the G0-CLOSED chain (option gate shut): the two epilog hosts only */
  host.beginFrame({ gameObject: zeroed });
  host.handler(ev(K.EPILOG_825DE0));
  host.handler(ev(K.EPILOG_820FD0));
  assert.equal(host.endFrame(), 0, "closed option gate paints nothing");

  /* one clear flips it the other way — both directions pinned */
  host.beginFrame({ gameObject: zeroed });
  host.handler(ev(K.COLOR_9956E0));
  assert.ok(host.endFrame() > 0, "a single clear is enough to count as painted");
});

test("endFrame never throws: a GL context that fails mid-replay still reports the clears it issued", () => {
  const gl = makeFakeGl();
  const zeroed = new Uint8Array(R.GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  const host = createRenderGlHost({ gl, width: 960, height: 540, gameObject: zeroed });
  host.beginFrame({ gameObject: zeroed });
  for (const k of [24, 25, 3, 28, 8, 21]) host.handler(ev(k));
  /* context lost after the clear was issued (mirrors a real GL context loss) */
  gl.viewport = () => { throw new Error("context lost"); };

  let drawn;
  assert.doesNotThrow(() => { drawn = host.endFrame(); }, "endFrame must not propagate");
  assert.equal(host.stats.frameErrors, 1);
  assert.match(host.stats.lastError, /context lost/);
  assert.ok(drawn >= 1, "the clear that already reached the framebuffer is still reported");
});

test("resize and dispose are safe; a disposed host counts and never throws", () => {
  const host = createRenderGlHost({ gl: null, width: 800, height: 450, gameObject: makeGameBuffer() });
  assert.deepEqual(host.resize(1280, 720), { width: 1280, height: 720 });
  host.beginFrame();
  host.handler(ev(K.COLOR_9956E0));
  host.endFrame();
  host.dispose();
  assert.doesNotThrow(() => host.handler(ev(K.COLOR_9956E0)));
  assert.equal(host.endFrame(), 0);
  assert.ok(host.stats.afterDispose >= 1);
  assert.doesNotThrow(() => host.dispose());
});

/* --------------------------------------------------------------------------
 * Submitted commands (menu scene layer)
 * ------------------------------------------------------------------------ */

test("submitted sprite with a registered texture renders with correct UVs", async () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  await host.uploadTexture("titlemenu", fakePngBytes(256, 128));
  assert.equal(host.hasTexture("titlemenu"), true);
  assert.deepEqual(host.textureKeys, ["titlemenu"]);

  host.beginFrame();
  host.handler(ev(K.COLOR_9956E0));
  host.submit([
    { type: "sprite", tex: "titlemenu", src: [0, 0, 128, 64], dst: [10, 20, 320, 160], color: [1, 1, 1, 1] },
    { type: "quad", dst: [0, 0, 960, 40], color: [0, 0, 0, 0.5] },
  ]);
  const drawn = host.endFrame();

  const sprites = quads(host, "submitted-sprite");
  assert.equal(sprites.length, 1);
  assert.deepEqual(
    [sprites[0].x, sprites[0].y, sprites[0].w, sprites[0].h],
    [10, 20, 320, 160],
  );
  assert.deepEqual(
    [sprites[0].u0, sprites[0].v0, sprites[0].u1, sprites[0].v1],
    [0, 0, 128 / 256, 64 / 128],
  );
  assert.equal(sprites[0].tex, "titlemenu");
  assert.equal(quads(host, "submitted-quad").length, 1);
  assert.equal(host.stats.submittedSprites, 1);
  assert.equal(host.stats.submittedQuads, 1);
  assert.equal(host.stats.missingTexture, 0);
  /* submitted content renders in screen space after the slice draws */
  const screenT = host.commands.filter((c) => c.op === "transform" && c.space === "screen");
  assert.equal(screenT.length, 1);
  assert.ok(host.commands.indexOf(screenT[0]) < host.commands.indexOf(sprites[0]));
  assert.ok(drawn > 0);
});

test("sprite with a missing texture is counted and skipped, never thrown", async () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  await host.uploadTexture("present", fakePngBytes(64, 64));
  host.beginFrame();
  host.submit([
    { type: "sprite", tex: "absent", src: [0, 0, 8, 8], dst: [0, 0, 8, 8], color: [1, 1, 1, 1] },
    { type: "sprite", tex: "present", src: [0, 0, 8, 8], dst: [0, 0, 8, 8], color: [1, 1, 1, 1] },
  ]);
  assert.doesNotThrow(() => host.endFrame());
  assert.equal(host.stats.missingTexture, 1);
  assert.equal(host.stats.submittedSkipped, 1);
  assert.equal(quads(host, "submitted-sprite").length, 1, "only the registered texture drew");
  const skip = host.commands.find((c) => c.op === "skip" && c.reason === "missing-texture");
  assert.equal(skip.tex, "absent");
});

test("unknown submitted command types are counted and skipped, never thrown", () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  host.beginFrame();
  host.submit([
    { type: "mesh", dst: [0, 0, 4, 4] },
    { type: "shader", program: "x" },
    { type: "mesh", dst: [0, 0, 4, 4] },
    { type: "quad", dst: [0, 0, 4, 4], color: [1, 0, 0, 1] },
  ]);
  assert.doesNotThrow(() => host.endFrame());
  assert.equal(host.stats.unknownCommands, 3);
  assert.equal(host.stats.unknownCommandTypes.mesh, 2);
  assert.equal(host.stats.unknownCommandTypes.shader, 1);
  assert.equal(quads(host, "submitted-quad").length, 1);
  /* text that was not pre-expanded into sprites is also counted, not guessed */
  host.beginFrame();
  host.submit([{ type: "text", font: "terminus8", text: "NEW RUN", at: [10, 10], color: [1, 1, 1, 1] }]);
  assert.doesNotThrow(() => host.endFrame());
  assert.equal(host.stats.submittedText, 1);
  assert.equal(host.stats.unsupportedText, 1);
});

test("pre-expanded text glyphs[] (the shape web/js/menu-scene.js emits) render through the sprite path", async () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  await host.uploadTexture("terminus8_0", fakePngBytes(256, 256));
  host.beginFrame();
  /* menu-scene.js text() shape: every glyph is a ready sprite command. */
  host.submit([{
    type: "text", font: "terminus8", text: "NEW RUN", at: [40, 100],
    color: [1, 1, 1, 1], scale: 1, width: 56, height: 8, tag: "menu:item",
    glyphs: [
      { type: "sprite", tex: "terminus8_0", src: [0, 0, 8, 8], dst: [40, 100, 8, 8], color: [1, 1, 1, 1], tag: "menu:item:glyph", code: 78 },
      { type: "sprite", tex: "terminus8_0", src: [8, 0, 8, 8], dst: [48, 100, 8, 8], color: [1, 1, 1, 1], tag: "menu:item:glyph", code: 69 },
      { type: "sprite", tex: "terminus8_0", src: [16, 0, 8, 8], dst: [56, 100, 8, 8], color: [1, 1, 1, 1], tag: "menu:item:glyph", code: 87 },
    ],
  }]);
  const drawn = host.endFrame();

  assert.equal(host.stats.submittedText, 1);
  assert.equal(host.stats.unsupportedText, 0, "glyphs[] counts as pre-expanded");
  assert.equal(host.stats.submittedSprites, 3, "one sprite per glyph");
  const g = quads(host, "submitted-sprite");
  assert.equal(g.length, 3);
  assert.deepEqual(g.map((q) => q.x), [40, 48, 56]);
  assert.deepEqual(g[0] && [g[0].u0, g[0].v0, g[0].u1, g[0].v1], [0, 0, 8 / 256, 8 / 256]);
  assert.equal(host.commands.some((c) => c.op === "skip"), false, "nothing skipped");
  assert.ok(drawn > 0);
});

test("glyphs[] and sprites[] are equivalent; a text command with neither is counted as unsupported", async () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  await host.uploadTexture("f", fakePngBytes(64, 64));
  const glyph = { type: "sprite", tex: "f", src: [0, 0, 8, 8], dst: [0, 0, 8, 8], color: [1, 1, 1, 1] };

  host.beginFrame();
  host.submit([{ type: "text", font: "f", text: "A", glyphs: [glyph, glyph] }]);
  host.endFrame();
  const viaGlyphs = quads(host, "submitted-sprite").length;

  host.beginFrame();
  host.submit([{ type: "text", font: "f", text: "A", sprites: [glyph, glyph] }]);
  host.endFrame();
  const viaSprites = quads(host, "submitted-sprite").length;

  assert.equal(viaGlyphs, 2);
  assert.equal(viaSprites, viaGlyphs, "glyphs[] and sprites[] draw identically");
  assert.equal(host.stats.unsupportedText, 0);

  /* neither present -> counted, skipped, never guessed */
  host.beginFrame();
  host.submit([{ type: "text", font: "f", text: "A" }]);
  assert.doesNotThrow(() => host.endFrame());
  assert.equal(host.stats.unsupportedText, 1);
  assert.equal(quads(host, "submitted-sprite").length, 0);
  /* an EMPTY glyphs array is also "not pre-expanded" */
  host.beginFrame();
  host.submit([{ type: "text", font: "f", text: "A", glyphs: [] }]);
  host.endFrame();
  assert.equal(host.stats.unsupportedText, 2);
});

test("pre-expanded text sprites render through the sprite path", async () => {
  const host = createRenderGlHost({ gl: null, gameObject: makeGameBuffer() });
  await host.uploadTexture("font0", fakePngBytes(128, 128));
  host.beginFrame();
  host.submit([{
    type: "text", font: "terminus8", text: "AB", at: [4, 4], color: [1, 1, 1, 1],
    sprites: [
      { type: "sprite", tex: "font0", src: [0, 0, 8, 8], dst: [4, 4, 8, 8], color: [1, 1, 1, 1] },
      { type: "sprite", tex: "font0", src: [8, 0, 8, 8], dst: [12, 4, 8, 8], color: [1, 1, 1, 1] },
    ],
  }]);
  host.endFrame();
  assert.equal(host.stats.submittedText, 1);
  assert.equal(host.stats.unsupportedText, 0);
  assert.equal(quads(host, "submitted-sprite").length, 2);
});

test("endFrame's draw-call count includes submitted commands", async () => {
  const gameObject = makeGameBuffer();
  const base = createRenderGlHost({ gl: null, gameObject });
  base.beginFrame();
  runSequence(base, dbgSequence());
  const withoutSubmissions = base.endFrame();

  const host = createRenderGlHost({ gl: null, gameObject });
  await host.uploadTexture("t", fakePngBytes(32, 32));
  host.beginFrame();
  runSequence(host, dbgSequence());
  host.submit([
    { type: "quad", dst: [0, 0, 100, 100], color: [1, 1, 1, 1] },
    { type: "sprite", tex: "t", src: [0, 0, 32, 32], dst: [0, 0, 32, 32], color: [1, 1, 1, 1] },
  ]);
  const withSubmissions = host.endFrame();

  assert.ok(withSubmissions > withoutSubmissions,
    `submitted draws add draw calls (${withSubmissions} > ${withoutSubmissions})`);
  assert.equal(host.stats.submittedDrawn, 2);

  /* submissions alone must also make the frame paint (drawn > 0) */
  const only = createRenderGlHost({ gl: null, gameObject });
  only.beginFrame();
  only.submit([{ type: "quad", dst: [0, 0, 10, 10], color: [1, 0, 0, 1] }]);
  assert.ok(only.endFrame() > 0);
});

test("readPngSize reads the IHDR without decoding, and rejects non-PNG bytes", () => {
  assert.deepEqual(readPngSize(fakePngBytes(320, 240)), { width: 320, height: 240 });
  assert.equal(readPngSize(new Uint8Array(24)), null);
  assert.equal(readPngSize(new Uint8Array(4)), null);
});

/* --------------------------------------------------------------------------
 * Fake GL: the module drives a stub context without a real canvas
 * ------------------------------------------------------------------------ */

function makeFakeGl() {
  const calls = [];
  const rec = (name) => (...args) => { calls.push({ name, args }); return undefined; };
  const gl = {
    calls,
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
    ARRAY_BUFFER: 5, DYNAMIC_DRAW: 6, FLOAT: 7, TRIANGLES: 8,
    COLOR_BUFFER_BIT: 16, SCISSOR_TEST: 17, BLEND: 18, DEPTH_TEST: 19,
    SRC_ALPHA: 20, ONE_MINUS_SRC_ALPHA: 21, ONE: 22,
    TEXTURE_2D: 23, TEXTURE0: 24, RGBA: 25, UNSIGNED_BYTE: 26,
    TEXTURE_MIN_FILTER: 27, TEXTURE_MAG_FILTER: 28, NEAREST: 29,
    TEXTURE_WRAP_S: 30, TEXTURE_WRAP_T: 31, CLAMP_TO_EDGE: 32,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: 33, UNPACK_FLIP_Y_WEBGL: 34,
    createShader: () => ({}),
    shaderSource: rec("shaderSource"),
    compileShader: rec("compileShader"),
    getShaderParameter: () => true,
    createProgram: () => ({}),
    attachShader: rec("attachShader"),
    linkProgram: rec("linkProgram"),
    getProgramParameter: () => true,
    deleteShader: rec("deleteShader"),
    getUniformLocation: (_p, n) => ({ name: n }),
    getAttribLocation: (_p, n) => ({ a_pos: 0, a_uv: 1, a_color: 2 }[n] ?? -1),
    createBuffer: () => ({}),
    createVertexArray: () => ({}),
    bindVertexArray: rec("bindVertexArray"),
    bindBuffer: rec("bindBuffer"),
    bufferData: rec("bufferData"),
    bufferSubData: rec("bufferSubData"),
    enableVertexAttribArray: rec("enableVertexAttribArray"),
    vertexAttribPointer: rec("vertexAttribPointer"),
    useProgram: rec("useProgram"),
    uniform2f: rec("uniform2f"),
    uniform4f: rec("uniform4f"),
    uniform1f: rec("uniform1f"),
    uniform1i: rec("uniform1i"),
    drawArrays: rec("drawArrays"),
    clearColor: rec("clearColor"),
    clear: rec("clear"),
    viewport: rec("viewport"),
    scissor: rec("scissor"),
    enable: rec("enable"),
    disable: rec("disable"),
    blendFuncSeparate: rec("blendFuncSeparate"),
    blendFunc: rec("blendFunc"),
    createTexture: () => ({}),
    bindTexture: rec("bindTexture"),
    texImage2D: rec("texImage2D"),
    texParameteri: rec("texParameteri"),
    pixelStorei: rec("pixelStorei"),
    activeTexture: rec("activeTexture"),
    deleteBuffer: rec("deleteBuffer"),
    deleteProgram: rec("deleteProgram"),
    deleteVertexArray: rec("deleteVertexArray"),
    deleteTexture: rec("deleteTexture"),
  };
  return gl;
}

test("a fake WebGL2 context receives a real batched draw and is left clean", () => {
  const gl = makeFakeGl();
  const host = createRenderGlHost({ gl, width: 1920, height: 1080, gameObject: makeGameBuffer() });
  host.beginFrame();
  const drawn = runSequence(host, dbgSequence()) && host.endFrame();

  assert.equal(host.stats.glReady, true, host.stats.glError ?? "");
  assert.ok(drawn > 0);
  const names = gl.calls.map((c) => c.name);
  assert.ok(names.includes("drawArrays"), "the grid batch was drawn");
  assert.ok(names.includes("clear"), "the fade colour was cleared");
  assert.ok(names.includes("blendFuncSeparate"), "blending configured");
  assert.ok(names.includes("scissor"), "scissor set from the RT stack");

  /* one program, one dynamic VBO: created exactly once, batched draws */
  const draws = gl.calls.filter((c) => c.name === "drawArrays");
  assert.ok(draws.length >= 1);
  for (const d of draws) assert.equal(d.args[0], gl.TRIANGLES);

  /* the shared context is released: scissor off, program/buffer unbound */
  const tail = gl.calls.slice(-8).map((c) => `${c.name}:${c.args[0] === gl.SCISSOR_TEST ? "SCISSOR" : ""}`);
  assert.ok(tail.some((t) => t.startsWith("disable")), "scissor disabled on exit");
  const lastUseProgram = [...gl.calls].reverse().find((c) => c.name === "useProgram");
  assert.equal(lastUseProgram.args[0], null, "program unbound on exit");
  const lastBindBuffer = [...gl.calls].reverse().find((c) => c.name === "bindBuffer");
  assert.equal(lastBindBuffer.args[1], null, "array buffer unbound on exit");

  /* device conversion: internal top-left -> GL bottom-left, DPR-scaled */
  const scissors = gl.calls.filter((c) => c.name === "scissor");
  assert.deepEqual(scissors[0].args, [0, 0, 1920, 1080]);
});

test("clear colour reaches a fake gl exactly as computed from the Game buffer", () => {
  const gl = makeFakeGl();
  const gameObject = makeGameBuffer({ srcR: 0.25, srcG: 0.5, srcB: 0.75, dstA: 1 });
  const host = createRenderGlHost({ gl, width: 960, height: 540, gameObject, fadeT: 1 });
  host.beginFrame();
  runSequence(host, dbgSequence());
  host.endFrame();
  const clearColor = gl.calls.find((c) => c.name === "clearColor");
  /* t == 1 -> (src - dst)*1 + dst == src; alpha is the raw dst alpha */
  assert.ok(Math.abs(clearColor.args[0] - 0.25) < 1e-6);
  assert.ok(Math.abs(clearColor.args[1] - 0.5) < 1e-6);
  assert.ok(Math.abs(clearColor.args[2] - 0.75) < 1e-6);
  assert.ok(Math.abs(clearColor.args[3] - 1) < 1e-6);
});

test("an incomplete gl object degrades to record-only without throwing", () => {
  const host = createRenderGlHost({ gl: { createProgram: () => ({}) }, gameObject: makeGameBuffer() });
  host.beginFrame();
  assert.doesNotThrow(() => runSequence(host, dbgSequence()));
  const drawn = host.endFrame();
  assert.equal(host.stats.glReady, false);
  assert.match(host.stats.glError, /record-only/);
  assert.ok(drawn > 0, "the command list is still produced and counted");
  assert.equal(quads(host, "grid").length, 6);
});
