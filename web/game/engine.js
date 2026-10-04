// ABI tables (const ABI below) extracted from scripts/decomp/game-update-model.mjs
// at ABI v100 — the sparse capture/apply contract of the Game::Update wasm slice.
const ABI = {"abiVersion":100,"gameObjectMinSize":429424,"updateContinuation":{"RETURN_AFTER_GAME_UPDATE":0,"RETURN_AFTER_GATE_1D520":1,"RETURN_AFTER_GATE_1D654":2,"RETURN_AFTER_STATE_24ECC_UPDATE":3,"RETURN_AFTER_GENERIC_PROMPT_TRANSITION":4,"RETURN_AFTER_ITEM_OVERLAY_MENU":5,"RETURN_AFTER_HUD_DELAY":6,"RETURN_AFTER_GATE_1BA78":7,"RETURN_AFTER_GATE_1B83C":8,"RETURN_AFTER_MENU_GATE_EXIT":9,"RETURN_AFTER_TIMED_TRANSITION_HUD":10,"CONTINUE_NEXT_GATE":11,"CONTINUE_AT_TIMED_TRANSITION":12,"CONTINUE_AFTER_TIMED_TRANSITION":13,"CONTINUE_AT_COMMON_TAIL":14,"RESUME_AFTER_GENERIC_PROMPT_UPDATE":15,"RESUME_AFTER_ITEM_OVERLAY_UPDATE":16,"RESUME_AFTER_MENU_OPEN":17,"RESUME_AFTER_MENU_UPDATE":18,"RESUME_AFTER_GATE_1B83C_UPDATES":19,"RESUME_AFTER_92F1C0":20,"RESUME_AFTER_98DBA0_PLAYER_WALK":21,"RESUME_AFTER_FRAME_AUX_UPDATES":22,"RESUME_AFTER_STAGE_TRANSITION_EFFECT":23,"RESUME_AFTER_ENGINE_PREFIX":24,"RESUME_AFTER_ROOM_TRANSITION_EFFECT":25,"RESUME_AFTER_ROOM_UPDATE_PREFIX_B1":26,"RESUME_AFTER_ROOM_UPDATE_PREFIX_B2":27,"RESUME_AFTER_ROOM_UPDATE_PREFIX":28,"RESUME_AFTER_ROOM_CLEAR_NESTED":29,"RESUME_AFTER_ROOM_UPDATE_CLEAR":30,"RESUME_AFTER_ROOM_UPDATE_HEAD":31,"RESUME_AFTER_4257B0_PASS_A":32,"RESUME_AFTER_FRAME_MANAGER_UPDATES":33},"stateLayout":{"shortTimer":{"offset":0,"type":"i32"},"positionResetTimer":{"offset":4,"type":"i32"},"positionXBits":{"offset":8,"type":"u32"},"positionYBits":{"offset":12,"type":"u32"},"secondaryTimer":{"offset":16,"type":"i32"},"decayValue":{"offset":20,"type":"f32"},"transitionProgress":{"offset":24,"type":"f32"},"transitionRate":{"offset":28,"type":"f32"},"transitionMode":{"offset":32,"type":"i32"},"postUpdateDelay":{"offset":36,"type":"i32"},"gate1d520":{"offset":40,"type":"i32"},"oneShot1d63c":{"offset":44,"type":"i32"},"state24ecc":{"offset":48,"type":"i32"},"value24ed0":{"offset":52,"type":"i32"},"mode24ed8":{"offset":56,"type":"i32"},"gate1d654":{"offset":60,"type":"i32"},"gate1ba78":{"offset":64,"type":"i32"},"gate1b83c":{"offset":68,"type":"i32"},"predicate1ba74":{"offset":72,"type":"i32"},"counter265c0":{"offset":76,"type":"i32"},"itemOverlayState":{"offset":80,"type":"i32"},"menuState23a74":{"offset":84,"type":"i32"},"genericPromptActiveObject":{"offset":88,"type":"i32"},"genericPromptActiveFlag":{"offset":92,"type":"i32"},"genericPromptSubmittedSelection":{"offset":96,"type":"i32"},"genericPromptPostUpdateFlag":{"offset":100,"type":"i32"},"skipTimedTransitionFlag":{"offset":104,"type":"i32"},"transitionColorRBits":{"offset":108,"type":"u32"},"transitionColorGBits":{"offset":112,"type":"u32"},"transitionColorBBits":{"offset":116,"type":"u32"},"transitionAuxBits":{"offset":120,"type":"u32"},"timedTransitionProgress":{"offset":124,"type":"f32"},"timedTransitionForceFinish":{"offset":128,"type":"i32"},"status22ed4":{"offset":132,"type":"i32"},"status22edc":{"offset":136,"type":"i32"},"timedTransitionCleanupMode":{"offset":140,"type":"i32"},"effectCounter67788":{"offset":144,"type":"i32"},"effectCounter68d6c":{"offset":148,"type":"i32"},"roomTransitionMode1830c":{"offset":152,"type":"i32"},"roomTransitionMarker18318":{"offset":156,"type":"i32"},"roomTransitionIndex18900":{"offset":160,"type":"i32"},"roomTransitionDimension18904":{"offset":164,"type":"i32"},"frameCounter264fc":{"offset":168,"type":"i32"},"frameCounter264f8":{"offset":172,"type":"i32"},"fadeCounter26514":{"offset":176,"type":"i32"},"fadeProgress26518":{"offset":180,"type":"f32"},"shakeCurrent67738":{"offset":184,"type":"f32"},"shakeTarget6773c":{"offset":188,"type":"f32"},"shakeStep67740":{"offset":192,"type":"f32"},"timer269e0":{"offset":196,"type":"i32"},"listCount67730":{"offset":200,"type":"i32"},"roomFxCounter70d8":{"offset":204,"type":"i32"},"roomFxValue70cc":{"offset":208,"type":"i32"},"roomFxStep70d4":{"offset":212,"type":"i32"},"roomFxLimit70dc":{"offset":216,"type":"i32"},"roomFxValue70e8":{"offset":220,"type":"i32"},"roomFxCounter70f4":{"offset":224,"type":"i32"},"roomFxLimit70f8":{"offset":228,"type":"i32"},"roomFxStep70f0":{"offset":232,"type":"i32"},"roomClearDelay11ec":{"offset":236,"type":"i32"},"roomAlive12c0":{"offset":240,"type":"i32"},"roomAlive12c4":{"offset":244,"type":"i32"},"roomGreedWave723c":{"offset":248,"type":"i32"},"roomType8":{"offset":252,"type":"i32"},"roomDescSubtype":{"offset":256,"type":"i32"},"roomByte7220":{"offset":260,"type":"i32"},"roomWaterLerpCountdown7298":{"offset":264,"type":"i32"},"roomBossCount12c8":{"offset":268,"type":"i32"},"roomBossCount12cc":{"offset":272,"type":"i32"},"roomBossSnapshot7224":{"offset":276,"type":"i32"},"roomTimer722c":{"offset":280,"type":"i32"},"roomCollectibleTimer7764":{"offset":284,"type":"i32"},"roomTimer7214":{"offset":288,"type":"i32"},"roomTimer706c":{"offset":292,"type":"i32"},"roomTimer7230":{"offset":296,"type":"i32"},"roomWaterAmount7240":{"offset":300,"type":"f32"},"roomLavaIntensity7740":{"offset":304,"type":"f32"},"frameOpaque4212c0Mode":{"offset":308,"type":"i32"},"frameOpaque4212c0Secondary":{"offset":312,"type":"i32"},"frameOpaque4212c0Field3c":{"offset":316,"type":"i32"},"frameOpaque4212c0Flag4c":{"offset":320,"type":"u32"},"frameOpaque4212c0Flag111":{"offset":324,"type":"u32"},"roomDescFlags44":{"offset":328,"type":"i32"},"roomDescClearCount4a":{"offset":332,"type":"i32"},"byte67744":{"offset":336,"type":"u32"},"roomFlag7894":{"offset":340,"type":"i32"},"roomFlag7769":{"offset":344,"type":"i32"},"engineField8":{"offset":348,"type":"i32"},"engineFieldC":{"offset":352,"type":"i32"},"engineFloat22c":{"offset":356,"type":"f32"},"engineFloat230":{"offset":360,"type":"f32"},"engineField4":{"offset":364,"type":"i32"},"engineField10":{"offset":368,"type":"i32"},"engineField14":{"offset":372,"type":"i32"},"engineField18":{"offset":376,"type":"i32"},"engineField1c":{"offset":380,"type":"i32"},"engineField20":{"offset":384,"type":"i32"},"engineField24":{"offset":388,"type":"i32"},"frameOpaque98dba0Mode":{"offset":392,"type":"i32"},"frameOpaque98dba0Flag":{"offset":396,"type":"u32"},"frameOpaque98dba0Counter":{"offset":400,"type":"i32"},"frameOpaque98dba0Float170":{"offset":404,"type":"f32"},"frameOpaque98dba0Float2d0":{"offset":408,"type":"f32"},"difficulty269c8":{"offset":412,"type":"i32"},"enginePlayer1bb74":{"offset":416,"type":"i32"},"roomAmbientCount7454":{"offset":420,"type":"i32"},"roomAmbientIntensity7458":{"offset":424,"type":"f32"},"roomAmbientFlag745c":{"offset":428,"type":"i32"},"mode26584":{"offset":432,"type":"i32"},"flags2654c":{"offset":436,"type":"u32"},"gameFlags1839c":{"offset":440,"type":"u32"},"roomDescShortAe":{"offset":444,"type":"i32"},"hudMessageFlag8":{"offset":448,"type":"u32"},"hudMessagePlayed64":{"offset":452,"type":"u32"},"rankDisplaySwitchAfter":{"offset":456,"type":"i32"},"rankDisplayStateAfter":{"offset":460,"type":"i32"},"rankDisplayClear3b0Out":{"offset":464,"type":"u32"},"rankDisplayTailOut":{"offset":468,"type":"u32"},"itemOverlayCounter11d1d0":{"offset":472,"type":"i32"},"transitionTailByte29fb8":{"offset":476,"type":"u32"},"fxLerpGate676b4":{"offset":480,"type":"u32"},"fxCur676b8":{"offset":484,"type":"f32"},"fxCur676bc":{"offset":488,"type":"f32"},"fxCur676c0":{"offset":492,"type":"f32"},"fxCur676c4":{"offset":496,"type":"f32"},"fxCur676c8":{"offset":500,"type":"f32"},"fxCur676cc":{"offset":504,"type":"f32"},"engineAnm2Loaded":{"offset":508,"type":"u32"},"engineAnm2Slot10c":{"offset":512,"type":"u32"},"engineAnm2Bitflags110":{"offset":516,"type":"u32"},"globalTree4aba0Result":{"offset":520,"type":"u8"},"hudHistoryLatch5c7c":{"offset":521,"type":"u8"}},"constantsLayout":{"decayFactor":{"offset":0,"type":"f32"},"decayThreshold":{"offset":4,"type":"f32"},"fadeComplete":{"offset":8,"type":"f32"},"fadeInStep":{"offset":12,"type":"f32"},"fadeOutStep":{"offset":16,"type":"f32"},"resetPositionXBits":{"offset":20,"type":"u32"},"resetPositionYBits":{"offset":24,"type":"u32"},"transitionComplete":{"offset":28,"type":"f32"}},"runtimeInputsLayout":{"monotonicCounterLow":{"offset":0,"type":"u32"},"monotonicCounterHigh":{"offset":4,"type":"u32"},"monotonicBaselineLow":{"offset":8,"type":"u32"},"monotonicBaselineHigh":{"offset":12,"type":"u32"},"globalClearSkip997a":{"offset":16,"type":"u32"},"globalMenuEnable2a3a5":{"offset":20,"type":"u32"},"globalMenuGuard4b3ca":{"offset":24,"type":"u32"},"globalRangeByteLength":{"offset":28,"type":"u32"},"challenge0x123":{"offset":32,"type":"u32"},"doorSlot0Present":{"offset":40,"type":"u32"},"doorSlot0Field3a0":{"offset":44,"type":"u32"},"doorSlot0Field8":{"offset":48,"type":"u32"},"doorSlot0FieldC":{"offset":52,"type":"u32"},"doorSlot1Present":{"offset":56,"type":"u32"},"doorSlot1Field3a0":{"offset":60,"type":"u32"},"doorSlot1Field8":{"offset":64,"type":"u32"},"doorSlot1FieldC":{"offset":68,"type":"u32"},"doorSlot2Present":{"offset":72,"type":"u32"},"doorSlot2Field3a0":{"offset":76,"type":"u32"},"doorSlot2Field8":{"offset":80,"type":"u32"},"doorSlot2FieldC":{"offset":84,"type":"u32"},"doorSlot3Present":{"offset":88,"type":"u32"},"doorSlot3Field3a0":{"offset":92,"type":"u32"},"doorSlot3Field8":{"offset":96,"type":"u32"},"doorSlot3FieldC":{"offset":100,"type":"u32"},"doorSlot4Present":{"offset":104,"type":"u32"},"doorSlot4Field3a0":{"offset":108,"type":"u32"},"doorSlot4Field8":{"offset":112,"type":"u32"},"doorSlot4FieldC":{"offset":116,"type":"u32"},"doorSlot5Present":{"offset":120,"type":"u32"},"doorSlot5Field3a0":{"offset":124,"type":"u32"},"doorSlot5Field8":{"offset":128,"type":"u32"},"doorSlot5FieldC":{"offset":132,"type":"u32"},"doorSlot6Present":{"offset":136,"type":"u32"},"doorSlot6Field3a0":{"offset":140,"type":"u32"},"doorSlot6Field8":{"offset":144,"type":"u32"},"doorSlot6FieldC":{"offset":148,"type":"u32"},"doorSlot7Present":{"offset":152,"type":"u32"},"doorSlot7Field3a0":{"offset":156,"type":"u32"},"doorSlot7Field8":{"offset":160,"type":"u32"},"doorSlot7FieldC":{"offset":164,"type":"u32"},"engineCallRoom":{"offset":168,"type":"u32"},"engineCallDim":{"offset":172,"type":"u32"},"engineGame18304":{"offset":176,"type":"u32"},"frameOpaque98dba0Bvar2":{"offset":180,"type":"u32"},"frameOpaque98dba0Manager2a35c":{"offset":184,"type":"f32"},"frameOpaque98dba0Game216e9":{"offset":188,"type":"u32"},"frameOpaque4257b0IdCount":{"offset":192,"type":"u32"},"frameOpaque4257b0ListCount":{"offset":196,"type":"u32"},"roomGridCells":{"offset":200,"type":"u32"},"roomB8BlobReady":{"offset":204,"type":"u32"},"enginePlayerCount":{"offset":208,"type":"u32"},"enginePlayerBlobReady":{"offset":212,"type":"u32"},"playerHudOccupiedMask":{"offset":216,"type":"u32"},"managerHistoryCount":{"offset":220,"type":"u32"},"managerStatFlag":{"offset":224,"type":"u32"},"ambientDescPresent":{"offset":228,"type":"u32"},"ambientDescId":{"offset":232,"type":"u32"},"ambientPlayerCount":{"offset":236,"type":"u32"},"ambientVelX7460":{"offset":240,"type":"u32"},"ambientVelY7464":{"offset":244,"type":"u32"},"ambientStage":{"offset":248,"type":"u32"},"ambientStageType":{"offset":252,"type":"u32"},"ambientStageId":{"offset":256,"type":"u32"},"ambientRoomSubtype1bb0":{"offset":260,"type":"u32"},"ambientRoomActive":{"offset":264,"type":"u32"},"ambientRoomEntry11f0":{"offset":268,"type":"u32"},"frameOpaque4257b0PostPassAListCount":{"offset":1952,"type":"u32"}},"binaryLayout":{"shortTimer":{"offset":156968,"type":"u32"},"positionResetTimer":{"offset":156936,"type":"u32"},"positionXBits":{"offset":156940,"type":"u32"},"positionYBits":{"offset":156944,"type":"u32"},"secondaryTimer":{"offset":156984,"type":"u32"},"decayValue":{"offset":423732,"type":"f32"},"transitionProgress":{"offset":157104,"type":"f32"},"transitionRate":{"offset":157112,"type":"f32"},"transitionMode":{"offset":157116,"type":"u32"},"postUpdateDelay":{"offset":156916,"type":"u32"},"gate1d520":{"offset":120096,"type":"u32"},"oneShot1d63c":{"offset":120380,"type":"u32"},"state24ecc":{"offset":151244,"type":"u32"},"value24ed0":{"offset":151248,"type":"u32"},"mode24ed8":{"offset":151256,"type":"u32"},"gate1d654":{"offset":120404,"type":"u32"},"gate1ba78":{"offset":113272,"type":"u32"},"gate1b83c":{"offset":112700,"type":"u32"},"predicate1ba74":{"offset":113268,"type":"u32"},"engineField4":{"offset":112704,"type":"u32"},"engineField8":{"offset":112708,"type":"u32"},"engineFieldC":{"offset":112712,"type":"u32"},"engineField10":{"offset":112716,"type":"u32"},"engineField14":{"offset":112720,"type":"u32"},"engineField18":{"offset":112724,"type":"u32"},"engineField1c":{"offset":112728,"type":"u32"},"engineField20":{"offset":112732,"type":"u32"},"engineField24":{"offset":112736,"type":"u32"},"engineFloat22c":{"offset":113256,"type":"f32"},"engineFloat230":{"offset":113260,"type":"f32"},"enginePlayer1bb74":{"offset":113524,"type":"u32"},"counter265c0":{"offset":157120,"type":"u32"},"itemOverlayState":{"offset":114740,"type":"u32"},"itemOverlayCounter11d1d0":{"offset":119248,"type":"u32"},"menuState23a74":{"offset":146036,"type":"u32"},"genericPromptActiveObject":{"offset":157612,"type":"u32"},"genericPromptActiveFlag":{"offset":157628,"type":"u32"},"genericPromptSubmittedSelection":{"offset":157860,"type":"u32"},"genericPromptPostUpdateFlag":{"offset":157864,"type":"u32"},"skipTimedTransitionFlag":{"offset":153940,"type":"u32"},"transitionColorRBits":{"offset":157092,"type":"u32"},"transitionColorGBits":{"offset":157096,"type":"u32"},"transitionColorBBits":{"offset":157100,"type":"u32"},"transitionAuxBits":{"offset":157108,"type":"u32"},"timedTransitionProgress":{"offset":157080,"type":"f32"},"timedTransitionForceFinish":{"offset":158184,"type":"u32"},"status22ed4":{"offset":143060,"type":"u32"},"status22edc":{"offset":143068,"type":"u32"},"timedTransitionCleanupMode":{"offset":157204,"type":"u32"},"effectCounter67788":{"offset":423816,"type":"u32"},"effectCounter68d6c":{"offset":429420,"type":"u32"},"roomTransitionMode1830c":{"offset":99084,"type":"u32"},"roomTransitionMarker18318":{"offset":99096,"type":"u32"},"roomTransitionIndex18900":{"offset":100608,"type":"u32"},"roomTransitionDimension18904":{"offset":100612,"type":"u32"},"frameCounter264fc":{"offset":156924,"type":"u32"},"frameCounter264f8":{"offset":156920,"type":"u32"},"fadeCounter26514":{"offset":156948,"type":"u32"},"fadeProgress26518":{"offset":156952,"type":"f32"},"shakeCurrent67738":{"offset":423736,"type":"f32"},"shakeTarget6773c":{"offset":423740,"type":"f32"},"shakeStep67740":{"offset":423744,"type":"f32"},"timer269e0":{"offset":158176,"type":"u32"},"listCount67730":{"offset":423728,"type":"u32"},"frameOpaque4212c0Mode":{"offset":119532,"type":"u32"},"frameOpaque4212c0Secondary":{"offset":119536,"type":"u32"},"frameOpaque4212c0Field3c":{"offset":119592,"type":"u32"},"frameOpaque4212c0Flag4c":{"offset":119608,"type":"u32"},"frameOpaque4212c0Flag111":{"offset":119805,"type":"u32"},"frameOpaque98dba0Mode":{"offset":155340,"type":"u32"},"frameOpaque98dba0Flag":{"offset":155344,"type":"u32"},"frameOpaque98dba0Counter":{"offset":155348,"type":"u32"},"frameOpaque98dba0Float170":{"offset":155708,"type":"f32"},"frameOpaque98dba0Float2d0":{"offset":156060,"type":"f32"},"difficulty269c8":{"offset":158152,"type":"u32"},"byte67744":{"offset":423748,"type":"u32"},"mode26584":{"offset":157060,"type":"u32"},"flags2654c":{"offset":157004,"type":"u32"},"gameFlags1839c":{"offset":99228,"type":"u32"},"hudMessageFlag8":{"offset":136936,"type":"u32"},"hudMessagePlayed64":{"offset":137028,"type":"u32"},"rankDisplaySwitchAfter":{"offset":120400,"type":"u32"},"rankDisplayStateAfter":{"offset":120404,"type":"u32"},"rankDisplayByte3b0":{"offset":121344,"type":"u32"},"transitionTailByte29fb8":{"offset":171960,"type":"u32"},"fxLerpGate676b4":{"offset":423604,"type":"u32"},"fxCur676b8":{"offset":423608,"type":"f32"},"fxCur676bc":{"offset":423612,"type":"f32"},"fxCur676c0":{"offset":423616,"type":"f32"},"fxCur676c4":{"offset":423620,"type":"f32"},"fxCur676c8":{"offset":423624,"type":"f32"},"fxCur676cc":{"offset":423628,"type":"f32"},"engineAnm2Loaded":{"offset":113021,"type":"u32"},"engineAnm2Slot10c":{"offset":113024,"type":"u32"},"engineAnm2Bitflags110":{"offset":113028,"type":"u32"},"globalTree4aba0Result":{"offset":306080,"type":"u8"},"hudHistoryLatch5c7c":{"offset":145024,"type":"u32"},"hudHistorySlotFlag0":{"offset":144988,"type":"u8"},"hudHistorySlotFlag1":{"offset":145008,"type":"u8"}},"eventsLayout":{"continuationKind":{"offset":36,"type":"i32"},"opaqueCall0098dba0PlayerWalk":{"offset":64,"type":"u32"},"hudPostUpdateCalls":{"offset":8,"type":"u32"}}};

import { initInput } from "./input.js";
import { Renderer } from "./render.js";

/* =====================================================================
 * Memory layout shared with the wasm slice (proto-Room contract).
 * ===================================================================== */
const ROOM_BASE = 0x100000;
const ROOM_MAGIC = 0x49534143; // 'ISAC'
const CELLS_OFF = 0x40;
const GRID_W = 15;
const GRID_H = 9;
const ENT_BASE = ROOM_BASE + 0x400;
const ENT_STRIDE = 32;
const GAME_ROOM_PTR_OFF = 0x18300; // [Game+0x18300] = Room*
const F4_LIST_RECEIVER_OFF = 0x1bbe0;

const CELL_FLOOR = 0;
const CELL_PIT = 1;
const CELL_ROCK = 7;

/* =====================================================================
 * Struct layout helpers (sparse capture/apply over the ABI tables).
 * ===================================================================== */
function readField(view, base, field) {
  const off = base + field.offset;
  switch (field.type) {
    case "f32": return view.getFloat32(off, true);
    case "i32": return view.getInt32(off, true);
    case "u8": return view.getUint8(off);
    case "u16": return view.getUint16(off, true);
    default: return view.getUint32(off, true);
  }
}

function writeField(view, base, field, value) {
  const off = base + field.offset;
  if (value == null) value = 0;
  if (field.type === "f32") view.setFloat32(off, value, true);
  else if (field.type === "i32") view.setInt32(off, value | 0, true);
  else if (field.type === "u8") view.setUint8(off, value & 0xff);
  else if (field.type === "u16") view.setUint16(off, value & 0xffff, true);
  else view.setUint32(off, value >>> 0, true);
}

function readStruct(view, base, layout) {
  const out = {};
  for (const [name, field] of Object.entries(layout)) out[name] = readField(view, base, field);
  return out;
}

function writeStruct(view, base, layout, value) {
  for (const [name, field] of Object.entries(layout)) writeField(view, base, field, value[name]);
}

const f32Scratch = new Float32Array(1);
const u32Scratch = new Uint32Array(f32Scratch.buffer);
function f32Bits(v) { f32Scratch[0] = v; return u32Scratch[0] >>> 0; }
function bitsF32(b) { u32Scratch[0] = b >>> 0; return f32Scratch[0]; }

/* Host-owned Room-state fields (STATE keys with no Game-buffer home):
   the wasm capture pins them to 0, the session overlays the session's
   values back before each tick (ABI v67 Room capture contract). */
const HOST_OWNED_OUT_ZERO = new Set(["rankDisplayTailOut", "roomDescShortAe"]);
const HOST_OWNED_FIELDS = Object.keys(ABI.stateLayout)
  .filter((name) => !(name in ABI.binaryLayout));

function overlayHostOwnedState(captured, hostState) {
  for (const name of HOST_OWNED_FIELDS) {
    captured[name] = HOST_OWNED_OUT_ZERO.has(name)
      ? 0
      : (hostState[name] != null ? hostState[name] : 0);
  }
  return captured;
}

/* F4 list count: PE-exact signed magic division of the end-begin delta. */
function f4ListCountFromBounds(beginPtr, endPtr) {
  const delta = ((endPtr >>> 0) - (beginPtr >>> 0)) >>> 0;
  const prod = BigInt(delta | 0) * BigInt(0x4ec4ec4f | 0);
  let high = Number((prod >> 32n) & 0xffffffffn) | 0;
  high >>= 5;
  return (high + ((high >>> 0) >>> 31)) >>> 0;
}

/* =====================================================================
 * The minimal capture-apply bridge (inline; lanes this game drives).
 * ===================================================================== */
const RESUME_EXPORTS = {
  [ABI.updateContinuation.RESUME_AFTER_GENERIC_PROMPT_UPDATE]:
    "resumeGenericPrompt",
  [ABI.updateContinuation.RESUME_AFTER_ITEM_OVERLAY_UPDATE]: "resumeItemOverlay",
  [ABI.updateContinuation.RESUME_AFTER_MENU_OPEN]: "resumeMenuOpen",
  [ABI.updateContinuation.RESUME_AFTER_MENU_UPDATE]: "resumeMenuUpdate",
  [ABI.updateContinuation.RESUME_AFTER_GATE_1B83C_UPDATES]: "resumeGate1b83c",
  [ABI.updateContinuation.RESUME_AFTER_92F1C0]: "resume92f1c0",
  [ABI.updateContinuation.RESUME_AFTER_98DBA0_PLAYER_WALK]: "resume98dba0PlayerWalk",
  [ABI.updateContinuation.RESUME_AFTER_FRAME_AUX_UPDATES]: "resumeFrameAuxUpdates",
  [ABI.updateContinuation.RESUME_AFTER_STAGE_TRANSITION_EFFECT]: "resumeStageTransitionEffect",
  [ABI.updateContinuation.RESUME_AFTER_ENGINE_PREFIX]: "resumeEnginePrefix",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_TRANSITION_EFFECT]: "resumeRoomTransitionEffect",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1]: "resumeRoomUpdatePrefixB1",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2]: "resumeRoomUpdatePrefixB2",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_UPDATE_PREFIX]: "resumeRoomUpdatePrefix",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_CLEAR_NESTED]: "resumeRoomClearNested",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_UPDATE_CLEAR]: "resumeRoomUpdateClear",
  [ABI.updateContinuation.RESUME_AFTER_ROOM_UPDATE_HEAD]: "resumeRoomUpdateHead",
  [ABI.updateContinuation.RESUME_AFTER_4257B0_PASS_A]: "resume4257b0PassA",
  [ABI.updateContinuation.CONTINUE_AT_TIMED_TRANSITION]: "continueTimedTransition",
  [ABI.updateContinuation.CONTINUE_AFTER_TIMED_TRANSITION]: "continueMenuGates",
};

async function loadSlice(url) {
  /* Relative first (self-contained deploys), dev-server /@decomp/wasm/ mount
     as fallback — no binary wasm copy may live in the tracked web/ tree. */
  const candidates = [url, "/@decomp/wasm/game-update-slice.wasm"];
  let res = null;
  for (const candidate of candidates) {
    try {
      res = await fetch(candidate);
      if (res.ok) break;
    } catch (_) { res = null; }
  }
  if (!res || !res.ok) throw new Error(`wasm fetch failed: HTTP ${res?.status}`);
  const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {});
  const w = instance.exports;
  if (!(w.memory instanceof WebAssembly.Memory)) {
    throw new Error("slice must export memory");
  }
  const abiVersion = w.isaac_game_update_slice_abi_version();
  if (abiVersion !== ABI.abiVersion) {
    throw new Error(`unexpected slice ABI ${abiVersion}; expected ${ABI.abiVersion}`);
  }
  return {
    w,
    memory: w.memory,
    view: new DataView(w.memory.buffer),
    paths: {
      step: w.isaac_game_update_slice_step_scratch,
      reset: w.isaac_game_update_slice_reset_scratch,
      stateAddress: w.isaac_game_update_slice_state_address,
      constantsAddress: w.isaac_game_update_slice_constants_address,
      runtimeInputsAddress: w.isaac_game_update_slice_runtime_inputs_address,
      eventsAddress: w.isaac_game_update_slice_events_address,
      gameObjectAddress: w.isaac_game_update_slice_game_object_address,
      gameObjectSize: w.isaac_game_update_slice_game_object_size,
      captureScratch: w.isaac_game_update_slice_capture_scratch,
      applyScratch: w.isaac_game_update_slice_apply_scratch,
      resumeGenericPrompt: w.isaac_game_update_slice_resume_generic_prompt_scratch,
      resumeItemOverlay: w.isaac_game_update_slice_resume_item_overlay_scratch,
      resumeMenuOpen: w.isaac_game_update_slice_resume_menu_open_scratch,
      resumeMenuUpdate: w.isaac_game_update_slice_resume_menu_update_scratch,
      resumeGate1b83c: w.isaac_game_update_slice_resume_gate_1b83c_scratch,
      resume92f1c0: w.isaac_game_update_slice_resume_92f1c0_scratch,
      resume98dba0PlayerWalk: w.isaac_game_update_slice_resume_98dba0_player_walk_scratch,
      resumeFrameAuxUpdates: w.isaac_game_update_slice_resume_frame_aux_updates_scratch,
      resumeStageTransitionEffect: w.isaac_game_update_slice_resume_stage_transition_effect_scratch,
      resumeEnginePrefix: w.isaac_game_update_slice_resume_engine_prefix_scratch,
      resumeRoomTransitionEffect: w.isaac_game_update_slice_resume_room_transition_effect_scratch,
      resumeRoomUpdatePrefixB1: w.isaac_game_update_slice_resume_room_update_prefix_b1_scratch,
      resumeRoomUpdatePrefixB2: w.isaac_game_update_slice_resume_room_update_prefix_b2_scratch,
      resumeRoomUpdatePrefix: w.isaac_game_update_slice_resume_room_update_prefix_scratch,
      resumeRoomClearNested: w.isaac_game_update_slice_resume_room_clear_nested_scratch,
      resumeRoomUpdateClear: w.isaac_game_update_slice_resume_room_update_clear_scratch,
      resumeRoomUpdateHead: w.isaac_game_update_slice_resume_room_update_head_scratch,
      resume4257b0PassA: w.isaac_game_update_slice_resume_4257b0_pass_a_scratch,
      continueTimedTransition: w.isaac_game_update_slice_continue_timed_transition_scratch,
      continueMenuGates: w.isaac_game_update_slice_continue_menu_gates_scratch,
    },
  };
}

function defaultConstants() {
  const v = new DataView(new ArrayBuffer(4));
  const f32 = (bits) => { v.setUint32(0, bits >>> 0, true); return v.getFloat32(0, true); };
  return {
    resetPositionXBits: 0xc0500000,
    resetPositionYBits: 0x40f00000,
    decayThreshold: 0.015625,
    decayFactor: 0.875,
    transitionComplete: 1,
    fadeOutStep: f32(0x3d088889),
    fadeInStep: f32(0x3d430c31),
    fadeComplete: 1,
  };
}

function defaultState() {
  const state = {};
  for (const name of Object.keys(ABI.stateLayout)) state[name] = 0;
  return Object.assign(state, {
    positionXBits: 1,
    positionYBits: 2,
    transitionRate: 0.1,
    fadeProgress26518: 0.2,
    shakeCurrent67738: 1,
    shakeStep67740: 0.5,
    timer269e0: 1,
    roomFxLimit70dc: 2,
    roomFxValue70cc: 1,
    roomFxStep70d4: 0.5,
    roomType8: 2,
  });
}

function defaultRuntimeInputs() {
  return {
    globalRangeByteLength: 8,
    globalMenuGuard4b3ca: 1,
    frameOpaque4257b0IdCount: 1,
    frameOpaque4257b0ListCount: 1,
    roomGridCells: 15,
    ambientRoomActive: 1,
    ambientRoomEntry11f0: 0,
  };
}

/** Flatten the sparse runtime object onto the full ABI lane set. */
function normalizeRuntimeInputs(inputs) {
  const packed = {};
  for (const key of Object.keys(ABI.runtimeInputsLayout)) packed[key] = 0;
  const doors = {};
  const slots = Array.isArray(inputs.doorSlots) ? inputs.doorSlots : [];
  for (let i = 0; i < 8; i++) {
    const s = slots[i] || {};
    doors[`doorSlot${i}Present`] = s.present ?? 0;
    doors[`doorSlot${i}Field3a0`] = s.field3a0 ?? 0;
    doors[`doorSlot${i}Field8`] = s.field8 ?? 0;
    doors[`doorSlot${i}FieldC`] = s.fieldC ?? 0;
  }
  return { ...packed, ...doors, ...inputs };
}

class UpdateSession {
  constructor(slice) {
    this.slice = slice;
    this.view = slice.view;
    this.paths = slice.paths;
    const size = this.paths.gameObjectSize();
    if (size !== ABI.gameObjectMinSize) {
      throw new Error(`unexpected game-object size ${size}`);
    }
    this.gameObject = new Uint8Array(size);
    this.gameView = new DataView(this.gameObject.buffer);
    this.state = defaultState();
    this.constants = defaultConstants();
    this.runtimeExtra = null;
    this.ticks = 0;
  }

  /** Sparse fields ride the Game-object buffer into the scratch. */
  commitSparseFields() {
    writeStruct(this.gameView, 0, ABI.binaryLayout, this.state);
  }

  readF4Count() {
    const view = this.view;
    const base = this.paths.gameObjectAddress() + F4_LIST_RECEIVER_OFF;
    const begin = view.getUint32(base, true);
    const end = view.getUint32(base + 4, true);
    return f4ListCountFromBounds(begin, end);
  }

  /**
   * One hybrid Game::Update tick: buffer -> capture -> native step ->
   * continuation resumes -> apply -> buffer.
   * @param {object|null} statePatch sparse-state deltas for this tick
   * @param {object|null} runtimePatch extra runtime-input lanes
   * @param {(event: object) => void} [onHostEvent]
   */
  tick(statePatch, runtimePatch, onHostEvent) {
    if (statePatch) Object.assign(this.state, statePatch);
    const runtime = normalizeRuntimeInputs({
      ...defaultRuntimeInputs(),
      ...(this.runtimeExtra || {}),
      ...(runtimePatch || {}),
    });

    this.commitSparseFields();
    const size = this.gameObject.byteLength;
    new Uint8Array(this.slice.memory.buffer,
      this.paths.gameObjectAddress(), size).set(this.gameObject);

    if (this.paths.captureScratch() !== 1) throw new Error("capture_scratch failed");
    let st = readStruct(this.view, this.paths.stateAddress(), ABI.stateLayout);
    overlayHostOwnedState(st, this.state);

    writeStruct(this.view, this.paths.constantsAddress(), ABI.constantsLayout, this.constants);
    runtime.frameOpaque4257b0ListCount = this.readF4Count();
    writeStruct(this.view, this.paths.runtimeInputsAddress(),
      ABI.runtimeInputsLayout, runtime);

    this.paths.step();

    /* Continuation chain: the wasm reports each pending seam; rewrite the
       live state struct and drive the matching resume until Update returns. */
    for (let guard = 0; guard < 48; guard++) {
      const kind = this.readEvents().continuationKind | 0;
      const resume = RESUME_EXPORTS[kind];
      if (!resume) break;
      if (kind === ABI.updateContinuation.RESUME_AFTER_4257B0_PASS_A) {
        runtime.frameOpaque4257b0PostPassAListCount = this.readF4Count();
        writeStruct(this.view, this.paths.runtimeInputsAddress(),
          ABI.runtimeInputsLayout, runtime);
      }
      st = readStruct(this.view, this.paths.stateAddress(), ABI.stateLayout);
      writeStruct(this.view, this.paths.stateAddress(), ABI.stateLayout, st);
      if (this.paths[resume]() !== 1) throw new Error(`resume rejected: ${resume}`);
    }

    const finalState = readStruct(this.view, this.paths.stateAddress(), ABI.stateLayout);
    const finalEvents = readStruct(this.view, this.paths.eventsAddress(), ABI.eventsLayout);
    writeStruct(this.view, this.paths.stateAddress(), ABI.stateLayout, finalState);
    if (this.paths.applyScratch() !== 1) throw new Error("apply_scratch failed");
    new Uint8Array(this.gameObject).set(new Uint8Array(
      this.slice.memory.buffer, this.paths.gameObjectAddress(), size));

    this.state = finalState;
    this.ticks += 1;
    if (onHostEvent && finalEvents.opaqueCall0098dba0PlayerWalk) {
      onHostEvent({ kind: "opaqueCall0098dba0PlayerWalk",
        count: finalEvents.opaqueCall0098dba0PlayerWalk });
    }
    return finalEvents;
  }

  readEvents() {
    return readStruct(this.view, this.paths.eventsAddress(), ABI.eventsLayout);
  }
}

/* =====================================================================
 * Proto-Room: grid + entity array in wasm linear memory.
 * ===================================================================== */
function writeRoomToMemory(view, room) {
  view.setUint32(ROOM_BASE + 0x00, ROOM_MAGIC, true);
  view.setUint32(ROOM_BASE + 0x04, CELLS_OFF, true);
  view.setUint32(ROOM_BASE + 0x0c, GRID_W, true);
  view.setUint32(ROOM_BASE + 0x10, GRID_H, true);
  for (let i = 0; i < room.cells.length; i++) {
    view.setUint32(ROOM_BASE + CELLS_OFF + i * 4, room.cells[i], true);
  }
}

function writeEntitiesToMemory(view, entities) {
  view.setUint32(ENT_BASE, entities.length, true);
  entities.forEach((e, i) => {
    const b = ENT_BASE + 4 + i * ENT_STRIDE;
    view.setUint32(b + 0, e.id >>> 0, true);
    view.setUint32(b + 4, e.type >>> 0, true);
    view.setUint32(b + 8, e.variant >>> 0, true);
    view.setFloat32(b + 12, e.x, true);
    view.setFloat32(b + 16, e.y, true);
    view.setUint32(b + 20, e.player ? 0x1 : 0x0, true);
  });
}

/* =====================================================================
 * Rooms
 * ===================================================================== */
function blankCells() {
  const cells = new Uint32Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (x === 0 || y === 0 || x === GRID_W - 1 || y === GRID_H - 1) {
        cells[y * GRID_W + x] = CELL_ROCK;
      }
    }
  }
  return cells;
}

function makeRoom({ rocks = [], pits = [], doors = [], spawns = [] }) {
  const cells = blankCells();
  for (const [x, y] of rocks) cells[y * GRID_W + x] = CELL_ROCK;
  for (const [x, y] of pits) cells[y * GRID_W + x] = CELL_PIT;
  for (const d of doors) cells[d.y * GRID_W + d.x] = CELL_FLOOR; // gap
  return { cells, doors, spawns };
}

const DOOR_MID_Y = Math.floor(GRID_H / 2); // 4

function buildRooms() {
  const rooms = [];
  rooms.push(makeRoom({
    rocks: [[4, 2], [4, 3], [10, 2], [10, 3], [7, 6]],
    pits: [[6, 4]],
    doors: [{ x: GRID_W - 1, y: DOOR_MID_Y, side: "right", to: 1 }],
    spawns: [
      { kind: "gaper", x: 3.5, y: 6.5 },
      { kind: "statue", x: 11.5, y: 6.5 },
    ],
  }));
  rooms.push(makeRoom({
    rocks: [[3, 2], [4, 2], [10, 5], [11, 5], [7, 3]],
    pits: [[7, 5], [8, 5]],
    doors: [{ x: 0, y: DOOR_MID_Y, side: "left", to: 0 }],
    spawns: [
      { kind: "statue", x: 7.5, y: 2.5 },
      { kind: "gaper", x: 11.5, y: 2.5 },
      { kind: "gaper", x: 3.5, y: 6.5 },
    ],
  }));
  return rooms;
}

/* =====================================================================
 * Game simulation (host side of the hybrid tick)
 * ===================================================================== */
const PLAYER_MAX_SPEED = 4.6;     // cells per second
const PLAYER_ACCEL = 34;          // cells/s^2
const PLAYER_FRICTION = 26;
const PLAYER_RADIUS = 0.36;
const IFRAME_TICKS = 66;
const BOMB_FUSE_TICKS = 84;
const EXPLOSION_LIFE = 18;
const EXPLOSION_RADIUS = 1.65;
const MAX_HP_HALVES = 6;

class Game {
  constructor(session) {
    this.session = session;
    this.rooms = buildRooms();
    this.roomIndex = 0;
    this.input = initInput();
    this.pendingMove = { x: 0, y: 0 };
    this.bombs = [];
    this.explosions = [];
    this.enterRoom(this.roomIndex, 7.0, 4.5);
  }

  get room() { return this.rooms[this.roomIndex]; }

  enterRoom(index, px, py) {
    this.roomIndex = index;
    this.enemies = this.room.spawns.map((s, i) => ({
      id: i + 1,
      kind: s.kind,
      type: s.kind === "statue" ? 12 : 10,
      variant: 2,
      x: s.x,
      y: s.y,
      seed: i * 1.7,
      hitFlash: 0,
    }));
    this.nextEntityId = this.enemies.length + 1;
    this.player = {
      id: 0, type: 1, variant: 0, player: true,
      x: px, y: py,
      vx: 0, vy: 0,
      faceX: 0, faceY: 1,
      iframes: 0,
    };
    this.hp = MAX_HP_HALVES;
    this.bombs.length = 0;
    this.explosions.length = 0;
    this.publishMemory();
  }

  cellAt(x, y) {
    const cx = Math.floor(x), cy = Math.floor(y);
    if (cx < 0 || cy < 0 || cx >= GRID_W || cy >= GRID_H) return CELL_ROCK;
    return this.room.cells[cy * GRID_W + cx];
  }

  blocked(x, y) {
    const t = this.cellAt(x, y);
    return t !== CELL_FLOOR;
  }

  /** Circle-vs-cell movement with axis separation. */
  tryMove(dx, dy) {
    const p = this.player;
    const r = PLAYER_RADIUS;
    if (dx !== 0) {
      const nx = p.x + dx;
      const sx = dx > 0 ? nx + r : nx - r;
      const top = Math.floor(p.y - r + 0.02), bot = Math.floor(p.y + r - 0.02);
      let hit = false;
      for (let cy = top; cy <= bot; cy++) {
        if (this.blocked(sx, cy + 0.5) || this.cellAt(Math.floor(sx), cy) !== CELL_FLOOR) hit = true;
      }
      if (!hit) p.x = nx;
    }
    if (dy !== 0) {
      const ny = p.y + dy;
      const sy = dy > 0 ? ny + r : ny - r;
      const left = Math.floor(p.x - r + 0.02), right = Math.floor(p.x + r - 0.02);
      let hit = false;
      for (let cx = left; cx <= right; cx++) {
        if (this.blocked(cx + 0.5, sy) || this.cellAt(cx, Math.floor(sy)) !== CELL_FLOOR) hit = true;
      }
      if (!hit) p.y = ny;
    }
  }

  update(dt) {
    const input = this.input.getMove();
    const len = Math.hypot(input.x, input.y);
    const dirX = len > 0 ? input.x / len : 0;
    const dirY = len > 0 ? input.y / len : 0;

    const p = this.player;
    // accelerate toward input, friction when idle
    if (len > 0) {
      p.vx += dirX * PLAYER_ACCEL * dt;
      p.vy += dirY * PLAYER_ACCEL * dt;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > PLAYER_MAX_SPEED) { p.vx *= PLAYER_MAX_SPEED / sp; p.vy *= PLAYER_MAX_SPEED / sp; }
      if (Math.abs(dirX) > Math.abs(dirY)) { p.faceX = Math.sign(dirX); p.faceY = 0; }
      else if (len > 0) { p.faceX = 0; p.faceY = Math.sign(dirY); }
    } else {
      const drop = PLAYER_FRICTION * dt;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp <= drop) { p.vx = 0; p.vy = 0; }
      else { p.vx -= (p.vx / sp) * drop; p.vy -= (p.vy / sp) * drop; }
    }

    const dx = p.vx * dt, dy = p.vy * dt;
    this.pendingMove = { dx, dy };

    if (this.input.consumeBomb()) this.placeBomb();

    this.simulateActors(dt);
    this.checkDoor();
  }

  placeBomb() {
    if (this.bombs.length >= 3) return;
    this.bombs.push({
      id: this.nextEntityId++,
      x: Math.round(this.player.x - 0.5) + 0.5,
      y: Math.round(this.player.y - 0.5) + 0.5,
      fuse: BOMB_FUSE_TICKS,
    });
  }

  simulateActors(dt) {
    for (const b of this.bombs) b.fuse -= 1;
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      if (this.bombs[i].fuse <= 0) {
        this.explode(this.bombs[i]);
        this.bombs.splice(i, 1);
      }
    }
    for (const ex of this.explosions) ex.age += dt * 60;
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      if (this.explosions[i].age >= EXPLOSION_LIFE) this.explosions.splice(i, 1);
    }

    const p = this.player;
    if (p.iframes > 0) p.iframes -= 1;
    for (const e of this.enemies) {
      if (e.hitFlash > 0) e.hitFlash -= 1;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < 0.62 && p.iframes <= 0) this.damagePlayer(e.x, e.y);
    }
    if (this.hp <= 0) this.respawn();
  }

  explode(bomb) {
    this.explosions.push({ x: bomb.x, y: bomb.y, age: 0 });
    const R = EXPLOSION_RADIUS;
    // destroy interior rocks
    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < GRID_W - 1; x++) {
        if (this.room.cells[y * GRID_W + x] === CELL_ROCK &&
            Math.hypot(x + 0.5 - bomb.x, y + 0.5 - bomb.y) < R + 0.35) {
          this.room.cells[y * GRID_W + x] = CELL_FLOOR;
        }
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (Math.hypot(e.x - bomb.x, e.y - bomb.y) < R) this.enemies.splice(i, 1);
    }
    const p = this.player;
    if (p.iframes <= 0 && Math.hypot(p.x - bomb.x, p.y - bomb.y) < R) {
      this.damagePlayer(bomb.x, bomb.y);
    }
  }

  damagePlayer(fromX, fromY) {
    const p = this.player;
    this.hp -= 2; // half-heart units: one full heart per hit
    p.iframes = IFRAME_TICKS;
    const kb = 0.45 / (Math.hypot(p.x - fromX, p.y - fromY) || 1);
    p.vx += (p.x - fromX) * kb * 30;
    p.vy += (p.y - fromY) * kb * 30;
  }

  respawn() {
    const p = this.player;
    this.hp = MAX_HP_HALVES;
    p.iframes = IFRAME_TICKS * 2;
    p.x = 7.0; p.y = 4.5;
    p.vx = 0; p.vy = 0;
  }

  checkDoor() {
    const p = this.player;
    for (const d of this.room.doors) {
      const inCell = Math.floor(p.x) === d.x && Math.floor(p.y) === d.y;
      if (!inCell) continue;
      const past =
        (d.side === "right" && p.x > GRID_W - 1.25) ||
        (d.side === "left" && p.x < 1.25);
      if (!past) continue;
      if (d.side === "right") this.enterRoom(d.to, 1.45, p.y);
      else this.enterRoom(d.to, GRID_W - 1.45, p.y);
      return;
    }
  }

  /** Publish the room grid + entity array into wasm linear memory. */
  publishMemory() {
    writeRoomToMemory(this.session.view, this.room);
    const ents = [this.player, ...this.enemies];
    writeEntitiesToMemory(this.session.view, ents);
    this.session.gameView.setUint32(GAME_ROOM_PTR_OFF, ROOM_BASE >>> 0, true);
  }

  snapshot() {
    return {
      gridW: GRID_W,
      gridH: GRID_H,
      cells: this.room.cells,
      doors: this.room.doors,
      player: this.player,
      enemies: this.enemies,
      bombs: this.bombs,
      explosions: this.explosions,
      hp: Math.max(0, this.hp),
      maxHp: MAX_HP_HALVES,
    };
  }
}

/* =====================================================================
 * Boot + main loop
 * ===================================================================== */
async function boot() {
  const slice = await loadSlice("./game-update-slice.wasm");
  const session = new UpdateSession(slice);
  const game = new Game(session);
  const canvas = document.getElementById("game");
  const renderer = new Renderer(canvas);

  const TICK_MS = 1000 / 60;
  let acc = 0;
  let prev = performance.now();

  function frame(now) {
    acc += Math.min(now - prev, 250); // clamp tab-switch spikes
    prev = now;

    while (acc >= TICK_MS) {
      acc -= TICK_MS;
      game.update(TICK_MS / 1000);

      /* Hybrid tick: the wasm decides the frame path; the walk residual
         body below performs the observable side effect (player motion). */
      const p = game.player;
      const moved = game.pendingMove.dx !== 0 || game.pendingMove.dy !== 0;
      session.runtimeExtra = moved
        ? { frameOpaque98dba0Bvar2: 1, enginePlayerCount: 1 }
        : { frameOpaque98dba0Bvar2: 0, enginePlayerCount: 1 };
      session.tick(
        { positionXBits: f32Bits(p.x), positionYBits: f32Bits(p.y) },
        null,
        (event) => {
          // Player::Walk residual: publish the integrated motion + entities.
          game.tryMove(game.pendingMove.dx, game.pendingMove.dy);
          game.publishMemory();
          void event;
        },
      );
      // Guarantee smoothness even on ticks where the walk seam stays shut.
      game.tryMove(game.pendingMove.dx, game.pendingMove.dy);
      game.publishMemory();
    }

    renderer.draw(game.snapshot());
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Headless-test handle (not used by the page itself).
  window.__isaacGame = game;
}

boot().catch((err) => {
  console.error(err);
});

