/**
 * WebGL2 host bodies for the Game::Render root slice (native/decomp/
 * game_render_slice.{h,cpp}, ABI v4; wasm at output/decomp/game-render-slice/
 * game-render-slice.wasm), plus the submitted-command renderer used by the
 * menu scene layer.
 *
 * The render driver (scripts/decomp/frame-render-root.mjs,
 * runNativeGameRenderTick / runHybridGameRenderTick / createNativeRenderSession)
 * walks the native continuation chain and delivers one typed, address-stable
 * host event per boundary to its `onHostEvent` callback. Until now no host
 * kind had a browser body: the canvas was painted by the stub in
 * native/isaac_host.cpp draw_frame() (phase-coloured clear + pulsing scissor
 * rect). This module turns those 31 host kinds into real GL draw commands.
 *
 * `createRenderGlHost(...).handler` is drop-in compatible with the driver's
 * onHostEvent contract: it is called with a single object
 *   { kind, hostKind, hostVa, hostReceiver, hostVtableSlot,
 *     hostArg0, hostArg1, hostRepeat, continuationKind }
 * plus, for the per-entity draw host, { entityIndex, entitySlotAddress }.
 * Its return value is ignored by the driver (we return a small result
 * descriptor, or null for an unknown kind). A second `ctx` argument is
 * optional: when a caller has the full render events struct or extra state it
 * may pass { events, gameObject, fadeT, rect } and the exact PE-computed
 * values are preferred over the values re-derived from the Game buffer.
 *
 * PER-FRAME CONTRACT (web/js/app.js):
 *     glHost.beginFrame();
 *     const r = nativeBridge.renderTick(time);
 *     const drawn = glHost.endFrame();      // NUMBER of draw calls issued
 *     painted = !!r && drawn > 0;           // else the host paint stub runs
 * `endFrame()` therefore returns a NUMBER: clears + batched quad draws +
 * submitted-command draws. Zero means nothing painted. The frame summary
 * object stays available on `host.lastFrame`.
 *
 * SHARED GL CONTEXT. The context is the one emscripten created for #canvas
 * (native/isaac_host.cpp init_webgl: alpha=false, depth=true, stencil=true,
 * antialias=false), shared with the C++ paint stub. Every piece of GL state
 * this module depends on is set explicitly at the start of each executed
 * frame and released at the end (program, VAO/VBO, attrib arrays, blend,
 * scissor + GL_SCISSOR_TEST, viewport, active texture). clearColor is set
 * immediately before every clear we issue, and SCISSOR_TEST is left DISABLED
 * on exit, so the stub's own state assumptions still hold.
 *
 * ZERO IMPORTS BY DESIGN. web/js modules are served from `/js/*` while
 * scripts/decomp is served from `/@decomp/scripts/*`; no single specifier
 * resolves in both the browser and Node. The ABI constants below are
 * therefore mirrored literally from scripts/decomp/game-render-model.mjs
 * (ABI v4) and tests/render-host-gl.test.js asserts the mirror against the
 * real model so drift fails the suite.
 *
 * ---------------------------------------------------------------------------
 * COORDINATE CONVENTION
 * ---------------------------------------------------------------------------
 * Every command's geometry (x, y, w, h) is in **Isaac internal pixels**:
 * 960 x 540 (web/platform/window.js DEFAULT_INTERNAL), origin TOP-LEFT,
 * +x right, +y down — the same handedness Isaac's screen-space math uses.
 *
 *   internal px -> clip space (vertex shader):
 *       p    = a_pos * u_transform.xy + u_transform.zw   (2D transform, px)
 *       ndc  = vec2((p.x / 960.0) * 2.0 - 1.0,
 *                   1.0 - (p.y / 540.0) * 2.0)
 *
 * The 2D transform is bound once per frame by HOST_BIND_A1DFD0 from the Game
 * object camera base (Game+0x1204 / +0x1208, f32): tx = -cameraX,
 * ty = -cameraY, so a world-space quad maps to screen = world - cameraBase.
 * Every render-slice quad inherits the transform that is currently bound.
 * SUBMITTED commands (submit()) are UI/screen space and are always drawn
 * under the identity transform, which endFrame() rebinds before draining the
 * submission queue.
 *
 * GL viewport/scissor use the GL convention (BOTTOM-left origin, device
 * pixels), so an internal rect is converted on execution:
 *       devX = round(x * canvasW / 960)
 *       devY = round((540 - (y + h)) * canvasH / 540)
 *       devW = round(w * canvasW / 960), devH = round(h * canvasH / 540)
 *
 * Blending is non-premultiplied source-over, matching the context attributes
 * (premultipliedAlpha:false) and the UNPACK_PREMULTIPLY_ALPHA_WEBGL=false /
 * createImageBitmap({premultiplyAlpha:'none'}) texture path:
 *       blendFuncSeparate(SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA)
 * Source textures that are already premultiplied can be drawn correctly by
 * registering them with `{ premultiplied: true }`, which switches that batch
 * to blendFuncSeparate(ONE, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA).
 *
 * ---------------------------------------------------------------------------
 * DOCUMENTED PLACEHOLDER QUADS  (host kinds that carry NO geometry at all)
 * ---------------------------------------------------------------------------
 * These six kinds are drawn as clearly-labelled deterministic placeholder
 * quads. Every placeholder command carries `placeholder: true` plus a
 * `reason` string. NO sprite, texture or atlas content is ever fabricated by
 * the host-event path — placeholders are flat-coloured rectangles whose
 * colour is a deterministic function of the host kind id and whose position
 * is a deterministic function of the PE iteration index.
 *
 *   4  HOST_ENTITY_806C20   one quad per event. Count, ORDER and IDENTITY are
 *                           real: the driver now expands the entity loop into
 *                           one host per Game::Render @0x00806c20 call and
 *                           supplies hostArg0 == entitySlotAddress (the
 *                           Entity* SLOT address pushed at VA 0x0080eebc,
 *                           re-read per iteration out of out_slots) plus
 *                           entityIndex. hostArg1 is still 0 — the &camera
 *                           push is not recorded by the slice.
 *                           POSITION: recovered Entity+_pos (0x33c) when
 *                           guestRead maps the slot; otherwise a lattice
 *                           placeholder. SPRITE: type@+0x28 / variant@+0x2c
 *                           maps through ENTITY_SPRITE_CONVENTION (ANM2
 *                           Spritesheet Path + first Layer frame). Uploaded
 *                           sheet → textured quad at _pos. Missing sheet →
 *                           coloured box. Anim/layer pick is a [BRIDGE
 *                           CONVENTION]; the RECT and SHEET are from the
 *                           ANM2 file. The lattice slot is driven by the
 *                           real entityIndex.
 *   6  HOST_ANIM_40A030     overlay animation layers. hostRepeat (call count),
 *                           the +0x6edc/+0x6ee0 overlay scale and the +0x6f49
 *                           draw flag / +0x6eb0 swap flag are REAL (read from
 *                           the Game buffer); POSITION is placeholder — the
 *                           computed overlay position lives in
 *                           events.overlayPosXBits/Y, not in the host event.
 *   7  HOST_BODY_817830     pre-v4 whole-body aux edge (superseded by the
 *                           TRUNK/TAIL split, kinds 30/31). No geometry.
 *   9  HOST_VT_408590_PAIR_A sprite vtable dispatch, slot +0x44. Receiver and
 *                           slot are recorded; the target is deliberately
 *                           unresolved, so there is no geometry.
 *  10  HOST_VT_408590_PAIR_B sprite vtable dispatch, slot +0x48. Same.
 *  26  HOST_STAGE39_83A1B0  stage-0x39 special renderer, receiver Game+0x776c.
 *                           No geometry in the event.
 *  33  HOST_A10690          typed GL leaf opaque_call_00a10690 (family-owned).
 *  34  HOST_A102E0          typed GL leaf opaque_call_00a102e0 (family-owned).
 *  35  HOST_A106E0          typed GL leaf opaque_call_00a106e0 (family-owned).
 *
 * The three GL leaves (33/34/35) and the data-only GETLROOM (32) are
 * intentional no-ops in the mirror: the slice records the callsite in
 * hostVa/hostArg0, but no geometry is carried by the event.
 *
 * Placeholders are laid out in a diagnostic band along the bottom of the
 * internal frame (see PLACEHOLDER_BAND) so they can never be mistaken for
 * recovered game art.
 *
 * Binary: tools/isaac-ng.unpacked.exe
 * SHA-256 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
 */

/* ---------------------------------------------------------------------------
 * ABI mirror — scripts/decomp/game-render-model.mjs (render slice ABI v23).
 * Asserted equal to the model by tests/render-host-gl.test.js.
 * ------------------------------------------------------------------------- */

export const RENDER_SLICE_ABI_VERSION = 73;

export const RENDER_HOST_KIND = Object.freeze({
  NONE: 0,
  BOOST_74EFD0: 1,
  BOOST_827BC0: 2,
  COLOR_9956E0: 3,
  ENTITY_806C20: 4,
  GRID_80C810: 5,
  ANIM_40A030: 6,
  BODY_817830: 7,
  RT_POP: 8,
  VT_408590_PAIR_A: 9,
  VT_408590_PAIR_B: 10,
  VT_40C550_ADDREF: 11,
  VT_40C550_RELEASE: 12,
  HOOK_C7163C: 13,
  GETROOMBYIDX: 14,
  ONCE_HEADER: 15,
  ONCE_CTOR: 16,
  ONCE_ATEXIT: 17,
  ONCE_FOOTER: 18,
  ALLOC: 19,
  ASSERT_A112C0: 20,
  EPILOG_825DE0: 21,
  EPILOG_826AE0: 22,
  EPILOG_820FD0: 23,
  RT_REBIND: 24,
  BIND_A1DFD0: 25,
  STAGE39_83A1B0: 26,
  TREE_ERASE_424540: 27,
  RT_POP_A19180: 28,
  GET_STAGE_ID_738470: 29,
  BODY_817830_TRUNK: 30,
  BODY_817830_TAIL: 31,
  GETLROOM_81F8B0: 32,
  A10690: 33,
  A102E0: 34,
  A106E0: 35,
});

export const RENDER_GAME_OFF = Object.freeze({
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
});

export const RENDER_VTABLE_KINDS = Object.freeze([
  RENDER_HOST_KIND.VT_408590_PAIR_A,
  RENDER_HOST_KIND.VT_408590_PAIR_B,
  RENDER_HOST_KIND.VT_40C550_ADDREF,
  RENDER_HOST_KIND.VT_40C550_RELEASE,
]);

export const INTERNAL_WIDTH = 960;
export const INTERNAL_HEIGHT = 540;

const GRID_MAX_QUADS = 512;
const ENTITY_COLS = 8;
const PLACEHOLDER_BAND = Object.freeze({
  x0: 8, y0: INTERNAL_HEIGHT - 96, stepX: 28, laneH: 20, w: 24, h: 16,
});
const FLOATS_PER_VERTEX = 8;
const VERTEX_STRIDE = FLOATS_PER_VERTEX * 4;
const FLOATS_PER_QUAD = FLOATS_PER_VERTEX * 6;

export const RENDER_HOST_INFO = Object.freeze({
  1: { name: "BOOST_74EFD0", va: 0x0074efd0, cls: "noop" },
  2: { name: "BOOST_827BC0", va: 0x00827bc0, cls: "noop" },
  3: { name: "COLOR_9956E0", va: 0x009956e0, cls: "state" },
  4: { name: "ENTITY_806C20", va: 0x00806c20, cls: "placeholder" },
  5: { name: "GRID_80C810", va: 0x0080c810, cls: "state" },
  6: { name: "ANIM_40A030", va: 0x0040a030, cls: "placeholder" },
  7: { name: "BODY_817830", va: 0x00817830, cls: "placeholder" },
  8: { name: "RT_POP", va: 0x00a18300, cls: "state" },
  9: { name: "VT_408590_PAIR_A", va: 0, cls: "placeholder" },
  10: { name: "VT_408590_PAIR_B", va: 0, cls: "placeholder" },
  11: { name: "VT_40C550_ADDREF", va: 0, cls: "noop" },
  12: { name: "VT_40C550_RELEASE", va: 0, cls: "noop" },
  13: { name: "HOOK_C7163C", va: 0x00c7163c, cls: "noop" },
  14: { name: "GETROOMBYIDX", va: 0x00740bc0, cls: "noop" },
  15: { name: "ONCE_HEADER", va: 0x00aef29d, cls: "noop" },
  16: { name: "ONCE_CTOR", va: 0x006ef590, cls: "noop" },
  17: { name: "ONCE_ATEXIT", va: 0x00aef5af, cls: "noop" },
  18: { name: "ONCE_FOOTER", va: 0x00aef253, cls: "noop" },
  19: { name: "ALLOC", va: 0x00a0f4c0, cls: "noop" },
  20: { name: "ASSERT_A112C0", va: 0x00a112c0, cls: "noop" },
  21: { name: "EPILOG_825DE0", va: 0x00825de0, cls: "state" },
  22: { name: "EPILOG_826AE0", va: 0x00826ae0, cls: "state" },
  23: { name: "EPILOG_820FD0", va: 0x00820fd0, cls: "state" },
  24: { name: "RT_REBIND", va: 0x00a18300, cls: "state" },
  25: { name: "BIND_A1DFD0", va: 0x00a1dfd0, cls: "state" },
  26: { name: "STAGE39_83A1B0", va: 0x0083a1b0, cls: "placeholder" },
  27: { name: "TREE_ERASE_424540", va: 0x00424540, cls: "state" },
  28: { name: "RT_POP_A19180", va: 0x00a19180, cls: "state" },
  29: { name: "GET_STAGE_ID_738470", va: 0x00738470, cls: "noop" },
  30: { name: "BODY_817830_TRUNK", va: 0x00817830, cls: "state" },
  31: { name: "BODY_817830_TAIL", va: 0x00817b53, cls: "state" },
  32: { name: "GETLROOM_81F8B0", va: 0x0081f8b0, cls: "noop" },
  33: { name: "A10690", va: 0x00a10690, cls: "noop" },
  34: { name: "A102E0", va: 0x00a102e0, cls: "noop" },
  35: { name: "A106E0", va: 0x00a106e0, cls: "noop" },
});

export const ENTITY_POS_OFF = 0x33c;
export const ENTITY_TYPE_OFF = 0x28;
export const ENTITY_VARIANT_OFF = 0x2c;
export const ENTITY_SUBTYPE_OFF = 0x30;
const ENTITY_QUAD = 24;

/**
 * Recovered type/variant → uploaded tex key + ANM2 frame.
 * ANM2 object is a heap std::string at Entity+0x48, not in the 872-byte
 * blob. Sheet Path= and XCrop/YCrop/Width/Height come from the mounted
 * .anm2; the animation name is a [BRIDGE CONVENTION] default
 * (WalkDown / DefaultAnimation / first Layer with frames).
 * Keys: "type:variant" first, then bare type.
 */
export const ENTITY_SPRITE_CONVENTION = Object.freeze({
  1: Object.freeze({
    tex: "entity:player", src: Object.freeze([0, 32, 32, 32]), w: 32, h: 32,
    anim: "WalkDown", sheetRel: "gfx/characters/costumes/Character_001_Isaac.png",
    via: "[BRIDGE CONVENTION] 001.000_Player.anm2 WalkDown body",
  }),
  2: Object.freeze({
    tex: "entity:tear", src: Object.freeze([160, 0, 32, 32]), w: 32, h: 32,
    anim: "RegularTear6", sheetRel: "gfx/BulletAtlas.png",
    via: "[BRIDGE CONVENTION] 002.000_Tear.anm2 RegularTear6 body",
  }),
  33: Object.freeze({
    tex: "entity:fireplace", src: Object.freeze([0, 0, 32, 32]), w: 32, h: 32,
    anim: "Idle", sheetRel: "gfx/grid/grid_fireplace.png",
    via: "[BRIDGE CONVENTION] 033.000_Fireplace.anm2 Idle layer0",
  }),
  "3:35": Object.freeze({
    tex: "entity:dagger", src: Object.freeze([0, 0, 32, 32]), w: 32, h: 32,
    anim: "Idle", sheetRel: "gfx/familiar/familiar_orbitals_06_sacrificialdagger.png",
    via: "[BRIDGE CONVENTION] 003.035_Sacrificial Dagger.anm2 Idle body",
  }),
  "3:104": Object.freeze({
    tex: "entity:chubby", src: Object.freeze([0, 0, 32, 32]), w: 32, h: 32,
    anim: "Idle", sheetRel: "gfx/familiar/Familiar_104_BigChubby.png",
    via: "[BRIDGE CONVENTION] 003.104_BigChubby.anm2 Idle body",
  }),
  "7:10": Object.freeze({
    tex: "entity:laser", src: Object.freeze([0, 0, 32, 64]), w: 32, h: 64,
    anim: "Laser", sheetRel: "gfx/effects/Effect_018_ElectricLaser.png",
    via: "[BRIDGE CONVENTION] 007.010_Electric Laser.anm2 Laser body",
  }),
  24: Object.freeze({
    tex: "entity:globin", src: Object.freeze([0, 0, 32, 32]), w: 32, h: 32,
    anim: "WalkVert", sheetRel: "gfx/Monsters/Classic/Monster_161_Globin_Body.png",
    via: "[BRIDGE CONVENTION] 024.000_Globin.anm2 WalkVert body",
  }),
  "1000:12": Object.freeze({
    tex: "entity:tear", src: Object.freeze([256, 256, 64, 64]), w: 64, h: 64,
    anim: "Poof", sheetRel: "gfx/BulletAtlas.png",
    via: "[BRIDGE CONVENTION] 1000.012_Tear PoofA.anm2 Poof body",
  }),
  "1000:44": Object.freeze({
    tex: "entity:creep", src: Object.freeze([0, 0, 32, 32]), w: 32, h: 32,
    anim: "Blood01", sheetRel: "gfx/Effects/Effect_016_BloodPool.png",
    via: "[BRIDGE CONVENTION] 1000.025_Creep (White).anm2 Blood01 body",
  }),
});

function u32(n) { return (n >>> 0); }

function makeGameView(gameObject) {
  if (!gameObject) return null;
  const buf = gameObject.buffer || gameObject;
  if (buf instanceof ArrayBuffer) return new DataView(buf);
  if (ArrayBuffer.isView(gameObject)) {
    return new DataView(gameObject.buffer, gameObject.byteOffset, gameObject.byteLength);
  }
  return null;
}

function readI32(view, off, fallback = 0) {
  if (!view || off + 4 > view.byteLength) return fallback;
  return view.getInt32(off, true);
}

function readF32(view, off, fallback = 0) {
  if (!view || off + 4 > view.byteLength) return fallback;
  const n = view.getFloat32(off, true);
  return Number.isFinite(n) ? n : fallback;
}

function readU8(view, off, fallback = 0) {
  if (!view || off >= view.byteLength) return fallback;
  return view.getUint8(off);
}

function kindColor(kind) {
  const k = u32(kind);
  return [
    ((k * 67 + 40) % 180 + 40) / 255,
    ((k * 97 + 70) % 180 + 40) / 255,
    ((k * 37 + 110) % 180 + 40) / 255,
  ];
}

export function readPngSize(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (b.length < 24) return null;
  if (b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4e || b[3] !== 0x47) return null;
  if (b[12] !== 0x49 || b[13] !== 0x48 || b[14] !== 0x44 || b[15] !== 0x52) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { width: dv.getUint32(16, false), height: dv.getUint32(20, false) };
}

function readGuestBytes(guestRead, addr, n) {
  if (typeof guestRead !== "function") return null;
  try {
    const b = guestRead(addr >>> 0, n);
    return b && b.length >= n ? b : null;
  } catch {
    return null;
  }
}

function readGuestU32(guestRead, addr) {
  const b = readGuestBytes(guestRead, addr, 4);
  if (!b) return null;
  return new DataView(b.buffer, b.byteOffset, 4).getUint32(0, true);
}

export function readGuestEntityPos(guestRead, slotAddress) {
  if (typeof guestRead !== "function" || !slotAddress) return null;
  const slot = slotAddress >>> 0;
  const direct = readGuestBytes(guestRead, (slot + ENTITY_POS_OFF) >>> 0, 8);
  if (direct) {
    const v = new DataView(direct.buffer, direct.byteOffset, direct.byteLength);
    const x = v.getFloat32(0, true);
    const y = v.getFloat32(4, true);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y, entityAddress: slot, via: "entity" };
    }
  }
  return null;
}

function readGuestEntityIdent(guestRead, baseAddr) {
  if (typeof guestRead !== "function" || !baseAddr) return null;
  const base = baseAddr >>> 0;
  const type = readGuestU32(guestRead, (base + ENTITY_TYPE_OFF) >>> 0);
  if (type == null) return null;
  const variant = readGuestU32(guestRead, (base + ENTITY_VARIANT_OFF) >>> 0);
  const subtype = readGuestU32(guestRead, (base + ENTITY_SUBTYPE_OFF) >>> 0);
  return {
    type: type >>> 0,
    variant: variant == null ? 0 : variant >>> 0,
    subtype: subtype == null ? 0 : subtype >>> 0,
    entityAddress: base,
  };
}

const VS_SRC = `#version 300 es
layout(location=0) in vec2 a_pos;
layout(location=1) in vec2 a_uv;
layout(location=2) in vec4 a_color;
uniform vec4 u_transform;
uniform vec2 u_internal;
out vec2 v_uv;
out vec4 v_color;
void main() {
  vec2 p = a_pos * u_transform.xy + u_transform.zw;
  gl_Position = vec4((p.x / u_internal.x) * 2.0 - 1.0,
                     1.0 - (p.y / u_internal.y) * 2.0, 0.0, 1.0);
  v_uv = a_uv;
  v_color = a_color;
}`;

const FS_SRC = `#version 300 es
precision mediump float;
in vec2 v_uv;
in vec4 v_color;
uniform sampler2D u_tex;
uniform float u_useTex;
out vec4 o;
void main() {
  vec4 t = u_useTex > 0.5 ? texture(u_tex, v_uv) : vec4(1.0);
  o = t * v_color;
}`;

function compileProgram(gl) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, VS_SRC);
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, FS_SRC);
  gl.compileShader(fs);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (gl.getShaderParameter && !gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    throw new Error("vs compile");
  }
  if (gl.getProgramParameter && !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("link");
  }
  try { gl.deleteShader(vs); gl.deleteShader(fs); } catch { /* optional */ }
  return prog;
}

export function createRenderGlHost({
  gl = null,
  width = INTERNAL_WIDTH,
  height = INTERNAL_HEIGHT,
  gameObject = null,
  fadeT = 1,
  internalWidth = INTERNAL_WIDTH,
  internalHeight = INTERNAL_HEIGHT,
  guestRead = null,
} = {}) {
  const commands = [];
  const submissions = [];
  const textures = new Map();
  const stats = {
    frames: 0, events: 0, handled: 0, unknown: 0, afterDispose: 0,
    byKind: Object.create(null), unknownKinds: Object.create(null),
    quads: 0, placeholders: 0, clears: 0, flushes: 0, drawCalls: 0, lastDrawCalls: 0,
    entityDraws: 0, entitySprites: 0,
    gridCells: 0, gridDrawn: 0, gridClamped: 0,
    overlayDraws: 0, treeErases: 0, epilogs: 0,
    rtDepth: 0, rtMaxDepth: 0, rtPushes: 0, rtPops: 0, rtUnderflows: 0, rtAsserts: 0,
    vtableDispatches: 0, vtable: [],
    submitted: 0, submittedDrawn: 0, submittedQuads: 0, submittedSprites: 0,
    submittedText: 0, submittedSkipped: 0, submittedBadPayload: 0,
    missingTexture: 0, pendingTexture: 0, unsupportedText: 0,
    unknownCommands: 0, unknownCommandTypes: Object.create(null),
    textureUploads: 0, textureFailures: 0,
    lastFadeColor: null, lastCamera: { x: 0, y: 0 },
    glReady: false, glError: null, frameErrors: 0, lastError: null,
  };

  let liveGame = gameObject;
  let gameView = makeGameView(gameObject);
  let liveGuestRead = typeof guestRead === "function" ? guestRead : null;
  let entitySpriteAtlas = null;
  let defaultFadeT = Number.isFinite(fadeT) ? fadeT : 1;
  let canvasW = width;
  let canvasH = height;
  const iw = internalWidth;
  const ih = internalHeight;
  let disposed = false;
  let frameOpen = false;
  let frameIndex = 0;
  let entityIndex = 0;
  let quadsThisFrame = 0;
  let lastFrame = { drawCalls: 0, balanced: true };
  const rtStack = [];
  let glRes = null;

  try {
    if (gl && typeof gl.createProgram === "function" && typeof gl.createShader === "function"
      && typeof gl.shaderSource === "function" && typeof gl.compileShader === "function"
      && typeof gl.drawArrays === "function" && typeof gl.clear === "function") {
      const prog = compileProgram(gl);
      const vbo = gl.createBuffer();
      const vao = typeof gl.createVertexArray === "function" ? gl.createVertexArray() : null;
      glRes = {
        prog,
        vbo,
        vao,
        uTransform: gl.getUniformLocation(prog, "u_transform"),
        uInternal: gl.getUniformLocation(prog, "u_internal"),
        uTex: gl.getUniformLocation(prog, "u_tex"),
        uUseTex: gl.getUniformLocation(prog, "u_useTex"),
      };
      stats.glReady = true;
    } else if (gl) {
      stats.glReady = false;
      stats.glError = "record-only: incomplete gl object";
    } else {
      stats.glReady = false;
      stats.glError = "record-only";
    }
  } catch (err) {
    stats.glReady = false;
    stats.glError = `record-only: ${err && err.message ? err.message : err}`;
    glRes = null;
  }

  function push(cmd) { commands.push(cmd); return cmd; }

  function topRect() {
    return rtStack.length ? rtStack[rtStack.length - 1] : { x: 0, y: 0, w: iw, h: ih };
  }

  function cameraBase() {
    return {
      x: readF32(gameView, RENDER_GAME_OFF.cameraBaseX, 0),
      y: readF32(gameView, RENDER_GAME_OFF.cameraBaseY, 0),
    };
  }

  function fadeColor(ctx, _event) {
    const evs = ctx && ctx.events;
    if (evs && evs.fadeColorBitsR != null) {
      const bits = (n) => {
        const dv = new DataView(new ArrayBuffer(4));
        dv.setUint32(0, n >>> 0, true);
        return dv.getFloat32(0, true);
      };
      return {
        r: bits(evs.fadeColorBitsR), g: bits(evs.fadeColorBitsG),
        b: bits(evs.fadeColorBitsB), a: bits(evs.fadeColorBitsA),
        source: "events", t: ctx.fadeT ?? defaultFadeT,
      };
    }
    const t = Number.isFinite(ctx?.fadeT) ? ctx.fadeT : defaultFadeT;
    const srcR = readF32(gameView, RENDER_GAME_OFF.fadeSrcR, 0);
    const srcG = readF32(gameView, RENDER_GAME_OFF.fadeSrcG, 0);
    const srcB = readF32(gameView, RENDER_GAME_OFF.fadeSrcB, 0);
    const dstR = readF32(gameView, RENDER_GAME_OFF.fadeDstR, 0);
    const dstG = readF32(gameView, RENDER_GAME_OFF.fadeDstG, 0);
    const dstB = readF32(gameView, RENDER_GAME_OFF.fadeDstB, 0);
    const dstA = readF32(gameView, RENDER_GAME_OFF.fadeDstA, 1);
    return {
      r: (srcR - dstR) * t + dstR,
      g: (srcG - dstG) * t + dstG,
      b: (srcB - dstB) * t + dstB,
      a: dstA,
      source: "buffer", t,
    };
  }

  function emitQuad(q) {
    const cmd = {
      op: "quad",
      x: q.x, y: q.y, w: q.w, h: q.h,
      r: q.r ?? 1, g: q.g ?? 1, b: q.b ?? 1, a: q.a ?? 1,
      u0: q.u0 ?? 0, v0: q.v0 ?? 0, u1: q.u1 ?? 1, v1: q.v1 ?? 1,
      tex: q.tex ?? null,
      premultiplied: !!q.premultiplied,
      tag: q.tag ?? null,
      kind: q.kind ?? 0, va: q.va ?? 0,
      placeholder: !!q.placeholder,
      reason: q.reason ?? "",
    };
    for (const k of Object.keys(q)) {
      if (!(k in cmd)) cmd[k] = q[k];
    }
    stats.quads += 1;
    quadsThisFrame += 1;
    if (cmd.placeholder) stats.placeholders += 1;
    return push(cmd);
  }

  function lookupEntitySprite(ident) {
    if (!ident) return null;
    const typeKey = `${ident.type}:${ident.variant}`;
    const atlas = entitySpriteAtlas;
    let spec = null;
    if (atlas && typeof atlas === "object") {
      spec = atlas[typeKey] || atlas[ident.type] || atlas[String(ident.type)] || null;
    }
    if (!spec) {
      spec = ENTITY_SPRITE_CONVENTION[typeKey]
        || ENTITY_SPRITE_CONVENTION[ident.type]
        || ENTITY_SPRITE_CONVENTION[String(ident.type)]
        || null;
    }
    if (!spec || !spec.tex) return null;
    const entry = textures.get(spec.tex);
    if (!entry || !entry.ready) return null;
    const src = spec.src ? [...spec.src] : [0, 0, entry.width, entry.height];
    const w = spec.w || src[2];
    const h = spec.h || src[3];
    return { tex: spec.tex, src, w, h, via: spec.via || "anm2", entry };
  }

  function placeholderQuad(kind, va, extra = {}) {
    const [r, g, b] = kindColor(kind);
    const lane = (kind % 4);
    emitQuad({
      x: PLACEHOLDER_BAND.x0 + (kind * PLACEHOLDER_BAND.stepX) % 400,
      y: PLACEHOLDER_BAND.y0 + lane * PLACEHOLDER_BAND.laneH,
      w: PLACEHOLDER_BAND.w, h: PLACEHOLDER_BAND.h,
      r, g, b, a: 0.85,
      tag: extra.tag || "placeholder", kind, va,
      placeholder: true,
      reason: extra.reason || `${RENDER_HOST_INFO[kind]?.name || kind} has no recovered geometry`,
      tex: null,
      ...extra,
    });
  }

  function beginFrame(opts = null) {
    if (disposed) return { frame: frameIndex, camera: { x: 0, y: 0 } };
    if (opts && opts.gameObject !== undefined) {
      liveGame = opts.gameObject;
      gameView = makeGameView(liveGame);
    }
    commands.length = 0;
    submissions.length = 0;
    entityIndex = 0;
    quadsThisFrame = 0;
    stats.quads = 0;
    stats.placeholders = 0;
    stats.clears = 0;
    stats.entityDraws = 0;
    stats.entitySprites = 0;
    stats.gridCells = 0;
    stats.gridDrawn = 0;
    stats.overlayDraws = 0;
    stats.submitted = 0;
    stats.submittedDrawn = 0;
    stats.submittedQuads = 0;
    stats.submittedSprites = 0;
    stats.submittedText = 0;
    stats.submittedSkipped = 0;
    stats.missingTexture = 0;
    rtStack.length = 0;
    stats.rtDepth = 0;
    frameOpen = true;
    frameIndex += 1;
    stats.frames = frameIndex;
    push({ op: "frame-begin", frame: frameIndex, width: canvasW, height: canvasH, internalWidth: iw, internalHeight: ih });
    rtStack.push({ x: 0, y: 0, w: iw, h: ih });
    push({ op: "viewport", x: 0, y: 0, w: iw, h: ih, kind: 0, va: 0 });
    push({ op: "blend", enabled: true, premultiplied: false, kind: 0, va: 0 });
    const cam = cameraBase();
    stats.lastCamera = cam;
    push({ op: "transform", sx: 1, sy: 1, tx: -cam.x, ty: -cam.y, space: "world", kind: 0, va: 0 });
    return { frame: frameIndex, camera: cam };
  }

  function handler(event, ctx = null) {
    if (disposed) { stats.afterDispose += 1; return null; }
    if (!event || typeof event !== "object") {
      stats.unknown += 1;
      stats.unknownKinds[0] = (stats.unknownKinds[0] ?? 0) + 1;
      return null;
    }
    const kind = event.kind ?? event.hostKind ?? 0;
    const info = RENDER_HOST_INFO[kind];
    stats.events += 1;
    if (!info) {
      stats.unknown += 1;
      stats.unknownKinds[kind] = (stats.unknownKinds[kind] ?? 0) + 1;
      return null;
    }
    stats.handled += 1;
    stats.byKind[kind] = (stats.byKind[kind] ?? 0) + 1;
    const va = u32(event.hostVa ?? info.va ?? 0);
    const receiver = u32(event.hostReceiver);
    const slot = u32(event.hostVtableSlot);
    const arg0 = u32(event.hostArg0);
    const arg1 = u32(event.hostArg1);
    const repeat = u32(event.hostRepeat || 1);
    const result = { kind, va, handled: true };

    if (RENDER_VTABLE_KINDS.includes(kind)) {
      stats.vtableDispatches += 1;
      stats.vtable.push({ kind, receiver, slot, arg0, arg1 });
    }

    switch (kind) {
      case RENDER_HOST_KIND.COLOR_9956E0: {
        const col = fadeColor(ctx, event);
        stats.lastFadeColor = { r: col.r, g: col.g, b: col.b, a: col.a };
        stats.clears += 1;
        push({ op: "clear", kind, va, r: col.r, g: col.g, b: col.b, a: col.a, source: col.source, t: col.t });
        break;
      }
      case RENDER_HOST_KIND.BIND_A1DFD0: {
        const cam = cameraBase();
        stats.lastCamera = cam;
        push({ op: "transform", sx: 1, sy: 1, tx: -cam.x, ty: -cam.y, space: "world", kind, va });
        break;
      }
      case RENDER_HOST_KIND.RT_REBIND:
      case RENDER_HOST_KIND.BODY_817830_TRUNK: {
        const rect = ctx?.rect ?? event?.rect ?? { ...topRect() };
        rtStack.push({ x: rect.x, y: rect.y, w: rect.w, h: rect.h });
        stats.rtPushes += 1;
        stats.rtDepth = rtStack.length - 1;
        if (stats.rtDepth > stats.rtMaxDepth) stats.rtMaxDepth = stats.rtDepth;
        push({ op: "flush", kind, va, quads: quadsThisFrame, reason: "rt-push" });
        stats.flushes += 1;
        push({ op: "scissor-push", depth: stats.rtDepth, x: rect.x, y: rect.y, w: rect.w, h: rect.h, kind, va });
        push({ op: "viewport", x: rect.x, y: rect.y, w: rect.w, h: rect.h, kind, va });
        break;
      }
      case RENDER_HOST_KIND.RT_POP_A19180:
      case RENDER_HOST_KIND.BODY_817830_TAIL: {
        let underflow = false;
        if (rtStack.length > 1) {
          rtStack.pop();
          stats.rtPops += 1;
        } else {
          underflow = true;
          stats.rtUnderflows += 1;
        }
        stats.rtDepth = Math.max(0, rtStack.length - 1);
        const r = topRect();
        push({ op: "scissor-pop", depth: stats.rtDepth, x: r.x, y: r.y, w: r.w, h: r.h, kind, va, underflow });
        break;
      }
      case RENDER_HOST_KIND.RT_POP: {
        if (arg0 !== 0) stats.rtAsserts += 1;
        const r = topRect();
        push({ op: "flush", kind, va, quads: quadsThisFrame, reason: "rt-restore" });
        stats.flushes += 1;
        push({ op: "scissor-apply", depth: rtStack.length - 1, x: r.x, y: r.y, w: r.w, h: r.h, kind, va, assert: arg0 !== 0, assertMsgVa: arg0, assertArg: arg1 });
        push({ op: "viewport", x: r.x, y: r.y, w: r.w, h: r.h, kind, va });
        break;
      }
      case RENDER_HOST_KIND.ENTITY_806C20: {
        const total = readI32(gameView, RENDER_GAME_OFF.entityCount, 0);
        const driverIndex = Number.isInteger(event?.entityIndex) ? event.entityIndex : null;
        const i = driverIndex !== null ? driverIndex : entityIndex;
        entityIndex = i + 1;
        stats.entityDraws += 1;
        const slotAddress = u32(event?.entitySlotAddress ?? arg0);
        const recovered = readGuestEntityPos(liveGuestRead, slotAddress);
        const ident = readGuestEntityIdent(liveGuestRead, recovered?.entityAddress || slotAddress);
        const sprite = recovered ? lookupEntitySprite(ident) : null;
        const col = i % ENTITY_COLS;
        const row = (i / ENTITY_COLS) | 0;
        if (sprite) {
          const [sx, sy, sw, sh] = sprite.src;
          const tw = sprite.entry.width || 1;
          const th = sprite.entry.height || 1;
          stats.entitySprites += 1;
          emitQuad({
            x: recovered.x - sprite.w / 2,
            y: recovered.y - sprite.h / 2,
            w: sprite.w, h: sprite.h,
            r: 1, g: 1, b: 1, a: 1,
            u0: sx / tw, v0: sy / th,
            u1: (sx + sw) / tw, v1: (sy + sh) / th,
            tex: sprite.tex,
            premultiplied: !!sprite.entry.premultiplied,
            tag: "entity", kind, va, index: i,
            slotAddress,
            entityAddress: recovered.entityAddress,
            entityType: ident?.type ?? 0,
            entityVariant: ident?.variant ?? 0,
            posSource: recovered.via,
            spriteSource: sprite.via,
            indexSource: driverIndex !== null ? "driver" : "host-counter",
            entityCount: total,
            entityArray: u32(readI32(gameView, RENDER_GAME_OFF.entityArray, 0)),
            placeholder: false,
            reason: "entity sprite at Entity+_pos (0x33c); ANM2 sheet/crop from type@+0x28 variant@+0x2c",
          });
        } else {
          const [r, g, b] = kindColor(kind);
          emitQuad({
            x: recovered ? recovered.x - ENTITY_QUAD / 2 : 40 + col * 110,
            y: recovered ? recovered.y - ENTITY_QUAD / 2 : 60 + row * 58,
            w: recovered ? ENTITY_QUAD : 40,
            h: recovered ? ENTITY_QUAD : 40,
            r, g, b, a: 0.9,
            tag: "entity", kind, va, index: i,
            slotAddress,
            entityAddress: recovered?.entityAddress ?? 0,
            entityType: ident?.type ?? 0,
            entityVariant: ident?.variant ?? 0,
            posSource: recovered ? recovered.via : "lattice",
            indexSource: driverIndex !== null ? "driver" : "host-counter",
            entityCount: total,
            entityArray: u32(readI32(gameView, RENDER_GAME_OFF.entityArray, 0)),
            placeholder: !recovered,
            tex: null,
            reason: recovered
              ? "entity x/y from captured Entity+_pos (0x33c) via slot address; no uploaded sheet for type"
              : "entity slot ADDRESS (hostArg0) and iteration index are real; the entity's x/y is not in the sparse Game capture, so the lattice position is a placeholder",
          });
        }
        break;
      }
      case RENDER_HOST_KIND.GRID_80C810: {
        const gw = readI32(gameView, RENDER_GAME_OFF.gridW, 0);
        const gh = readI32(gameView, RENDER_GAME_OFF.gridH, 0);
        const cells = gw > 0 && gh > 0 ? gw * gh : 0;
        stats.gridCells += cells;
        stats.gridDrawn += Math.min(repeat, cells);
        let n = cells;
        if (n > GRID_MAX_QUADS) { n = GRID_MAX_QUADS; stats.gridClamped += 1; }
        const cw = iw / (gw || 1);
        const ch = ih / (gh || 1);
        for (let i = 0; i < n; i += 1) {
          const cx = i % gw;
          const cy = (i / gw) | 0;
          const drawn = i < repeat;
          emitQuad({
            x: cx * cw, y: cy * ch, w: cw, h: ch,
            r: drawn ? 0.20 : 0.06,
            g: drawn ? 0.26 : 0.08,
            b: drawn ? 0.34 : 0.10,
            a: drawn ? 0.85 : 0.35,
            tag: "grid", kind, va, index: i,
            cellX: cx, cellY: cy, drawn,
            firstSlot: arg0, placeholder: false, tex: null,
          });
        }
        break;
      }
      case RENDER_HOST_KIND.ANIM_40A030: {
        const drawFlag = readU8(gameView, RENDER_GAME_OFF.overlayDrawFlag, 0);
        const swapFlag = readU8(gameView, RENDER_GAME_OFF.overlaySwapFlag, 0);
        let sx = readF32(gameView, RENDER_GAME_OFF.overlayScaleX, 1);
        let sy = readF32(gameView, RENDER_GAME_OFF.overlayScaleY, 1);
        const fallback = !(sx > 0) || !(sy > 0);
        if (fallback) { sx = 1; sy = 1; }
        const n = Math.max(1, Math.min(repeat || 1, 8));
        const [r, g, b] = kindColor(kind);
        for (let i = 0; i < n; i += 1) {
          stats.overlayDraws += 1;
          emitQuad({
            x: 80 + i * 72, y: PLACEHOLDER_BAND.y0 - 8,
            w: 64 * sx, h: 64 * sy,
            r, g, b, a: 0.7,
            tag: "overlay", kind, va, index: i,
            placeholder: true, tex: null,
            scaleFallback: fallback, drawFlag, swapFlag,
            reason: "overlay scale/flags recovered; overlay x/y is a placeholder",
          });
        }
        break;
      }
      case RENDER_HOST_KIND.BODY_817830:
      case RENDER_HOST_KIND.VT_408590_PAIR_A:
      case RENDER_HOST_KIND.VT_408590_PAIR_B:
      case RENDER_HOST_KIND.STAGE39_83A1B0: {
        placeholderQuad(kind, va, { receiver, slot });
        break;
      }
      case RENDER_HOST_KIND.TREE_ERASE_424540: {
        stats.treeErases += 1;
        break;
      }
      case RENDER_HOST_KIND.EPILOG_825DE0:
      case RENDER_HOST_KIND.EPILOG_826AE0:
      case RENDER_HOST_KIND.EPILOG_820FD0: {
        stats.epilogs += 1;
        break;
      }
      default:
        break;
    }
    return result;
  }

  function submitSprite(cmd) {
    const tex = cmd.tex;
    const entry = textures.get(tex);
    if (!entry || !entry.ready) {
      stats.missingTexture += 1;
      stats.submittedSkipped += 1;
      push({ op: "skip", reason: "missing-texture", tex });
      return;
    }
    const src = cmd.src || [0, 0, entry.width, entry.height];
    const dst = cmd.dst || [0, 0, src[2], src[3]];
    const color = cmd.color || [1, 1, 1, 1];
    stats.submittedSprites += 1;
    stats.submittedDrawn += 1;
    emitQuad({
      x: dst[0], y: dst[1], w: dst[2], h: dst[3],
      r: color[0], g: color[1], b: color[2], a: color[3],
      u0: src[0] / entry.width, v0: src[1] / entry.height,
      u1: (src[0] + src[2]) / entry.width, v1: (src[1] + src[3]) / entry.height,
      tex, tag: "submitted-sprite", placeholder: false,
    });
  }

  function drainSubmissions() {
    push({ op: "transform", sx: 1, sy: 1, tx: 0, ty: 0, space: "screen", kind: 0, va: 0 });
    for (const cmd of submissions) {
      stats.submitted += 1;
      if (!cmd || typeof cmd !== "object") {
        stats.submittedBadPayload += 1;
        continue;
      }
      if (cmd.type === "quad") {
        const dst = cmd.dst || [0, 0, 0, 0];
        const color = cmd.color || [1, 1, 1, 1];
        stats.submittedQuads += 1;
        stats.submittedDrawn += 1;
        emitQuad({
          x: dst[0], y: dst[1], w: dst[2], h: dst[3],
          r: color[0], g: color[1], b: color[2], a: color[3],
          tag: "submitted-quad", placeholder: false, tex: null,
        });
      } else if (cmd.type === "sprite") {
        submitSprite(cmd);
      } else if (cmd.type === "text") {
        stats.submittedText += 1;
        const glyphs = Array.isArray(cmd.glyphs) ? cmd.glyphs
          : Array.isArray(cmd.sprites) ? cmd.sprites : null;
        if (!glyphs || glyphs.length === 0) {
          stats.unsupportedText += 1;
        } else {
          for (const g of glyphs) submitSprite(g);
        }
      } else {
        stats.unknownCommands += 1;
        const t = cmd.type || "unknown";
        stats.unknownCommandTypes[t] = (stats.unknownCommandTypes[t] ?? 0) + 1;
      }
    }
    submissions.length = 0;
  }

  function toDevice(rect) {
    return {
      x: Math.round(rect.x * canvasW / iw),
      y: Math.round((ih - (rect.y + rect.h)) * canvasH / ih),
      w: Math.round(rect.w * canvasW / iw),
      h: Math.round(rect.h * canvasH / ih),
    };
  }

  function replayGl() {
    if (!stats.glReady || !gl || !glRes) return 0;
    let draws = 0;
    const batch = [];
    const flushBatch = () => {
      if (!batch.length) return;
      const floats = new Float32Array(batch.length * FLOATS_PER_QUAD);
      let o = 0;
      for (const q of batch) {
        const x0 = q.x, y0 = q.y, x1 = q.x + q.w, y1 = q.y + q.h;
        const verts = [
          x0, y0, q.u0, q.v0, q.r, q.g, q.b, q.a,
          x1, y0, q.u1, q.v0, q.r, q.g, q.b, q.a,
          x0, y1, q.u0, q.v1, q.r, q.g, q.b, q.a,
          x0, y1, q.u0, q.v1, q.r, q.g, q.b, q.a,
          x1, y0, q.u1, q.v0, q.r, q.g, q.b, q.a,
          x1, y1, q.u1, q.v1, q.r, q.g, q.b, q.a,
        ];
        floats.set(verts, o);
        o += FLOATS_PER_QUAD;
      }
      if (glRes.vao) gl.bindVertexArray(glRes.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, glRes.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, floats, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, VERTEX_STRIDE, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, VERTEX_STRIDE, 8);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 4, gl.FLOAT, false, VERTEX_STRIDE, 16);
      gl.drawArrays(gl.TRIANGLES, 0, batch.length * 6);
      draws += 1;
      batch.length = 0;
    };

    gl.useProgram(glRes.prog);
    gl.viewport(0, 0, canvasW, canvasH);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    if (glRes.uInternal) gl.uniform2f(glRes.uInternal, iw, ih);
    if (glRes.uTransform) gl.uniform4f(glRes.uTransform, 1, 1, 0, 0);
    if (glRes.uUseTex) gl.uniform1f(glRes.uUseTex, 0);
    if (glRes.uTex) gl.uniform1i(glRes.uTex, 0);

    for (const c of commands) {
      if (c.op === "clear") {
        flushBatch();
        gl.clearColor(c.r, c.g, c.b, c.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
        draws += 1;
      } else if (c.op === "scissor-push" || c.op === "scissor-apply") {
        flushBatch();
        const d = toDevice(c);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(d.x, d.y, d.w, d.h);
      } else if (c.op === "scissor-pop") {
        flushBatch();
        const d = toDevice(c);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(d.x, d.y, d.w, d.h);
      } else if (c.op === "viewport") {
        flushBatch();
        const d = toDevice(c);
        gl.viewport(d.x, d.y, d.w, d.h);
      } else if (c.op === "transform") {
        flushBatch();
        if (glRes.uTransform) gl.uniform4f(glRes.uTransform, c.sx ?? 1, c.sy ?? 1, c.tx ?? 0, c.ty ?? 0);
      } else if (c.op === "quad") {
        batch.push(c);
      } else if (c.op === "flush") {
        flushBatch();
      }
    }
    flushBatch();
    gl.disable(gl.SCISSOR_TEST);
    gl.useProgram(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    if (glRes.vao) gl.bindVertexArray(null);
    return draws;
  }

  function countRecordDraws() {
    let draws = 0;
    let pending = 0;
    const flush = () => { if (pending) { draws += 1; pending = 0; } };
    for (const c of commands) {
      if (c.op === "clear") { flush(); draws += 1; }
      else if (c.op === "quad") pending += 1;
      else if (c.op === "flush" || c.op === "transform" || c.op === "scissor-push"
        || c.op === "scissor-apply" || c.op === "scissor-pop" || c.op === "viewport") flush();
    }
    flush();
    return draws;
  }

  function endFrame() {
    if (disposed) return 0;
    if (!frameOpen) return 0;
    drainSubmissions();
    let drawn = 0;
    try {
      if (stats.glReady && glRes) drawn = replayGl();
      else drawn = countRecordDraws();
    } catch (err) {
      stats.frameErrors += 1;
      stats.lastError = err && err.message ? err.message : String(err);
      drawn = Math.max(drawn, stats.clears);
    }
    stats.lastDrawCalls = drawn;
    stats.drawCalls = drawn;
    lastFrame = { drawCalls: drawn, balanced: rtStack.length === 1, frame: frameIndex };
    frameOpen = false;
    return drawn;
  }

  async function uploadTexture(key, bytes, opts = {}) {
    const size = readPngSize(bytes) || { width: opts.width || 1, height: opts.height || 1 };
    const entry = {
      ready: true,
      width: size.width,
      height: size.height,
      premultiplied: !!opts.premultiplied,
      bytes,
    };
    textures.set(String(key), entry);
    stats.textureUploads += 1;
    return entry;
  }

  function submit(list) {
    if (!Array.isArray(list)) return;
    for (const item of list) submissions.push(item);
  }

  function resize(nextW, nextH) {
    canvasW = nextW;
    canvasH = nextH;
    return { width: canvasW, height: canvasH };
  }

  function dispose() {
    disposed = true;
    try {
      if (gl && glRes) {
        if (glRes.vbo && gl.deleteBuffer) gl.deleteBuffer(glRes.vbo);
        if (glRes.prog && gl.deleteProgram) gl.deleteProgram(glRes.prog);
        if (glRes.vao && gl.deleteVertexArray) gl.deleteVertexArray(glRes.vao);
      }
    } catch { /* ignore */ }
    glRes = null;
  }

  function hasTexture(key) { return textures.has(String(key)); }

  return {
    handler,
    beginFrame,
    endFrame,
    submit,
    uploadTexture,
    hasTexture,
    setEntitySpriteAtlas(next) { entitySpriteAtlas = next && typeof next === "object" ? next : null; },
    stats,
    commands,
    resize,
    dispose,
    get lastFrame() { return lastFrame; },
    get rtStack() { return rtStack.slice(); },
    get gameObject() { return liveGame; },
    get textureKeys() { return Array.from(textures.keys()); },
    get entitySpriteAtlas() { return entitySpriteAtlas; },
    setGameObject(next) { liveGame = next; gameView = makeGameView(next); },
    setGuestRead(next) { liveGuestRead = typeof next === "function" ? next : null; },
    info: RENDER_HOST_INFO,
    internal: { width: iw, height: ih },
  };
}

export default {
  createRenderGlHost,
  RENDER_HOST_KIND,
  RENDER_GAME_OFF,
  RENDER_HOST_INFO,
  RENDER_VTABLE_KINDS,
  RENDER_SLICE_ABI_VERSION,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
  ENTITY_POS_OFF,
  ENTITY_TYPE_OFF,
  ENTITY_VARIANT_OFF,
  ENTITY_SPRITE_CONVENTION,
  readPngSize,
  readGuestEntityPos,
};
