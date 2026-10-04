/**
 * Browser bridge: load the freestanding Game::Update Wasm slice and own the
 * simulation tick on the native-wasm path. Residual host events go to a
 * HostHandler that must never re-enter x86 PE emulation.
 *
 * Also loads multi-root pure helpers under /@decomp/pure/* so non-Update roots
 * select native-wasm when present: the primary roots (Render/ProcessInput/
 * Exit/LuaEngine) and the companion families (Room, frame-opaque, frame-effect,
 * HUD post-update, PlayerHUD, PlayerManager, room-transition-engine).
 *
 * Game::Render ROOT SLICE (distinct from the render-shell pure helpers): the
 * bridge loads output/decomp/game-render-slice/game-render-slice.wasm and
 * drives one render tick per frame on its OWN 0x3bb20 buffer.
 *
 * Game::Exit ROOT PLAN (distinct from the exit pure helpers' islands): the
 * family has NO root-slice ABI (header: "Not an Exit slice ABI"), so the
 * wired Exit root is the wasm-backed runExitRootPlan step driven once per
 * frame over the exit pure-helper module (multiRoot.helpers.exit). Its 12
 * guest-memory inputs are caller-supplied via setExitInputs; the all-zero
 * default closes the entry gate. A missing or stale-ABI exit module is
 * NON-FATAL: the Update tick keeps running and exitTick() returns null.
 *
 * That buffer is NOT the Game object. Both PE callers of the render shell do
 * `mov edi,[0xc71678]` (g_Game) then `mov ecx,[edi+0x18300]` before
 * `call 0x0080ea80` (VA 0x00831630 / 0x00831e37), so the render root is
 * *(Game+0x18300) — a distinct object that happens to be smaller than the
 * Game object. An earlier version of this bridge passed the Update session's
 * Game buffer here on the theory that "the smaller min-size means one buffer
 * serves both"; that read gridW/gridH/entityCount as zeros and was
 * byte-for-byte indistinguishable from an empty scene. Seed it from a captured
 * render-root snapshot (see scripts/decomp/game-state-snapshot.mjs).
 *
 * A missing or stale-ABI render module is NON-FATAL: the Update tick keeps
 * running and renderTick() returns null.
 *
 * Served modules resolve under /@decomp/scripts/* (see scripts/serve.mjs).
 */

import {
  ALL_PURE_HELPER_IDS,
  BROWSER_SLICE_WASM_URL,
  FRAME_PATH_MODE,
  createExitRootSession,
  createDefaultExitRootInputs,
  createResidualHostHandler,
  createNativeUpdateSession,
  createMultiRootFrameSession,
  exitRootPlanHostEvents,
  exitRootWasmPure,
  isX86EmulationFramePath,
  loadFramePathRoots,
  loadGameUpdateSliceWasm,
  runExitMapWalkContinuation,
  runExitRootPlan,
  runProcessInputPrepollRoot,
  processInputPrepollWasmPure,
  selectFramePath,
} from "/@decomp/scripts/frame-path.mjs";
import {
  BROWSER_RENDER_SLICE_WASM_URL,
  createDefaultRenderInputs,
  createNativeRenderSession,
  createRenderHostHandler,
  defaultRenderRecapture,
  loadGameRenderSliceWasm,
} from "/@decomp/scripts/frame-render-root.mjs";
import { GAME_RENDER_GAME_OBJECT_MIN_SIZE } from "/@decomp/scripts/game-render-model.mjs";
import {
  roomB1CornerIndices,
  roomB1CornerPick,
  roomB1CornerWorldXy,
  roomB16NeedsLavaBandGrid,
  roomB16NeedsType7Grid,
  roomB1RngXorshift,
  roomB1SpawnBaseCount,
} from "/@decomp/scripts/room-pure-model.mjs";
import {
  ENGINE_PLAYER_MAX,
  GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS,
  ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS,
  REWIND_705EE0_PAYLOAD_SRC_OFF,
  REWIND_705EE0_PAYLOAD_WORDS,
  REWIND_705EE0_SLOT0_OFF,
  REWIND_705EE0_SLOT_STRIDE,
  TAIL_PATH_MAX_NODES,
  flattenTailPathEntriesRuntime,
} from "/@decomp/scripts/game-update-model.mjs";

/**
 * Normalize a render host into a callable. Accepts either a bare function or a
 * handler object ({ handler }) as produced by createRenderHostHandler.
 * @returns {((detail: object) => any)|null}
 */
function renderHostCallable(host) {
  if (typeof host === "function") return host;
  if (typeof host?.handler === "function") return host.handler;
  return null;
}

/* =====================================================================
 * Native-update CAPTURE lanes (wave-22/23 §5 live-wiring contracts).
 *
 * The module side of every §5 seam is LIVE (record-10 interior @936,
 * record-4 store-plan @932, record-22 fold trio @944/948/952, record-12
 * rewind @912/916); each seam is gated on capture lanes the bridge must
 * deliver per tick. This section implements the bridge-side capture as
 * READ-ONLY sampling: the Game buffer (session.gameObject) is read through
 * a DataView, guest memory OUTSIDE the Game object (the SFX manager heap
 * block *[0xc7169c], the 0xc798e0-region BSS globals, the player list's
 * pointed-to player objects, the manager payload blob at
 * *[0xc7169c]+0x2d0) is read through a host-installed guestRead hook — a
 * stand-in for a live PE sparse bridge, exactly like the Render slice's
 * caller-supplied guest-memory model. NOTHING is written — the ONE
 * exception is the record-16 B8 group (captureUpdateB8, W30-S3): it fills
 * the module's exported k-blob scratch from the live Room grids before the
 * resume_room_update_prefix_b2 seam and the bridge copies the stepped
 * scratch back after the tick (guestWrite hook; otherwise the values
 * surface as result.b8GridApply). The record-0
 * walker group (ABI v97 @14276..14292) is guest-homed too: its rows are
 * the StatHUD double-block player ptrs inside the Game object (0x84cc96/
 * 0x84cc9d, this = Game+0x233a8) plus the [B+0x328] and [Game+0x18300]
 * reads (0x84ccc8/0x84d188) — the browser's seeded-buffer guestRead
 * resolves the Game-homed ones, so the walker probe events @956/960/964
 * fire when a real snapshot landed.
 *
 * ABI v104 (update-v104-record4-apply): the record-4 store-plan
 * APPLICATION consumer (readSfxManagerStoreApplyPlan +
 * applySfxManagerStorePlan + the sfxManagerBssSnapshot write surface +
 * the element=1 standing-host-path dispatch) lives in this section too —
 * the capture stays READ-ONLY; only the post-tick apply arm writes.
 *
 * Capture-absence discipline (the §5 fallback contract): with the capture
 * not installed (setUpdateCapture(null)) or a group's reads failing, the
 * group's ready gates stay 0 and NO lane of that group is emitted — the
 * module then falls back to the byte-for-byte residuals, identical to the
 * pre-capture frame path. Every ready gate is per-group, matching the §5
 * tables (record-10: TrueProbeReady; record-4: player_entry_ready; record-
 * 22: the Filename/Anim/Loadgraphics vouchers; record-12: the opaqueCall
 * 006fd7c0 ready lane + payload_blob_ready). The v72/v74/v75/v77 vouchers
 * (shell canopy, rewind guards, ANM2 latch/blob lanes) are deliberately
 * NOT captured here (the v74/v75/v96 pins: the bridge must not supply
 * those fields) — they stay host-supplied, so landing this capture is
 * incrementally inert until the host wires them.
 * ------------------------------------------------------------------- */

/** READ-ONLY Game-buffer offsets for the §5 capture groups (sources per
 *  update-v96-record10-r2 §6 / update-v98-record4-wire §5.1 / update-v98-
 *  record22-unitb §8 / W22-S3-record12wire §lane-requests). */
export const UPDATE_CAPTURE_GAME_OFFSETS = Object.freeze({
  /* record-4 engine receiver region (the "Game+0x1b83c path": the record's
     own dispatch dword lives at Game+0x1b83c; the pack's engine fields are
     the receiver-region lanes). */
  engineField28: 0x1b864, /* [Game+0x1b864] -> opaque8318a0EngineField28 */
  engineByte7c: 0x1b87c, /* byte [Game+0x1b87c] -> opaque8318a0EngineByte7c */
  playerListBegin: 0x1baa8, /* vector begin ptr (span = (end-begin)>>2, cap 8) */
  playerListEnd: 0x1baac, /* vector end ptr */
  /* record-22 ANM2::Load pre-lane host half (recv = Game+0x1b874). */
  filenamePtr: 0x1b874, /* H2 write surface ptr */
  filenameSize: 0x1b884, /* H2 write surface size */
  filenameCap: 0x1b888, /* H2 write surface cap */
  animFirstPre: 0x1b8a4, /* recv+0x30 — H6a pre-state (family v2 plan) */
  animSecondPre: 0x1b8c4, /* recv+0x50 — H6b pre-state (family v2 plan) */
  /* record-12 rewind seam (slot records live INSIDE the Game object:
     slot0 at Game+0x269ec, slot1 at Game+0x4704c, stride 0x20660, slot1
     ENDS at Game+0x676ac == the slot-index field). */
  rewindSlotIndex676ac: 0x676ac, /* entry slot index (edi), i32 */
  rewindGameTag0: 0x0, /* [Game] tag compare operand */
  rewindGameFrame264f8: 0x264f8, /* S7 source + delta compare */
  rewindGame18318: 0x18318, /* S1 store value source */
  /* record idx 23 clearPath flag gate (W29-S4): the Game+0 mode word read
     at PE 0x00804212 `mov eax,[edx]` (edx = Game; same word as the
     record-12 rewindGameTag0 lane — read UNSIGNED for the FULL-DWORD cmp
     eax,0xd / signed jl 1 / jg 6 law @0x00804214..0x00804221). */
  clearPathMode0: 0x0, /* [Game+0] -> clearPathGameMode0 @7888 */
  /* record-0 walker capture group (ABI v97 lanes @14276..14292; sources
     per update-v102-abi97-plan §lane-requests, re-verified against
     cpu-dump 0084cc40/009beef0/009bf3a0): the swap bodies pass the
     StatHUD double-block player ptrs as the walker args (arg1 push
     @0x9bef22/0x9bf3cc, arg2 push @0x9bef09/0x9bf3cb; partner exchange
     0x9bef03..0x9bef16/0x9bf3bb) and the walker compares arg A against
     its OWN row storage [this+i*0xcc+0x114] (0x84cc96/0x84cc9d, this =
     Game+0x233a8) — the rows ARE the in-buffer storage of the swapped
     players. The b_frame328 lane is the [B+0x328] deref (0x84ccc8, B =
     the arg2 player); probe1_arg is the [Game+0x18300] ROOM ptr word
     (0x84d188, seam twin 0x84cb47, PM swap twin 0x9bf31f). */
  walkerStatHudBase: 0x233a8, /* the 0x84cc40 walker receiver (this) */
  walkerRowPlayerOff: 0x114, /* [this + i*0xcc + 0x114] block player ptr */
  walkerRowStride: 0xcc, /* block stride over the double block */
  walkerBFrame328: 0x328, /* PE 0x84ccc8 [edx+0x328] (edx = B) */
  walkerRoom18300: 0x18300, /* PE 0x84d188 [Game+0x18300] ROOM ptr word */
});

/** Per-player-entry field offsets inside the pointed-to player objects
 *  (the record-4 span slots; machine offsets per update-v98-record4-wire
 *  §3a walk + the v99 fold law params). */
export const UPDATE_CAPTURE_PLAYER_ENTRY_OFFSETS = Object.freeze({
  b173: 0x173, /* byte */
  b1398: 0x1398, /* byte */
  b139a: 0x139a, /* byte */
  b171: 0x171, /* byte */
  w410: 0x410, /* word */
  w3fc: 0x3fc, /* FULL-DWORD compare (machine 0x831ae1 cmp) */
  ptr7c: 0x7c, /* dword pointer */
  b34: 0x34, /* byte */
  b88: 0x88, /* byte */
  w1600: 0x1600, /* word */
  w418: 0x418, /* word */
  w16c: 0x16c, /* word */
});

/** Re-exported model caps the capture honours (single source of truth). */
export const UPDATE_CAPTURE_CAPS = Object.freeze({
  playerEntries: ENGINE_PLAYER_MAX,
  payloadWords: REWIND_705EE0_PAYLOAD_WORDS,
  payloadSrcOff: REWIND_705EE0_PAYLOAD_SRC_OFF,
  anm2MaxLayers: ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS,
  slot0Off: REWIND_705EE0_SLOT0_OFF,
  slotStride: REWIND_705EE0_SLOT_STRIDE,
  volumeOneBits: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS,
});

/** Per-entry slot field offsets inside the rewind slot records (byte 0 is
 *  the valid flag; the room/tag/arg/frame lanes are the write-plan
 *  operands; PE sources in W22-S3-record12wire §lane-requests). */
export const UPDATE_CAPTURE_REWIND_SLOT_FIELD_OFFSETS = Object.freeze({
  validByte: 0x0,
  room19d20: 0x19d20,
  tagE8: 0xe8,
  arg1fe2c: 0x1fe2c,
  frame1fe30: 0x1fe30,
});

/** The record-10 true-probe SFX-manager blob sources (*[0xc7169c] + field;
 *  PE 0x421343..0x4213cd per update-v96-record10-r2 §1/§6). volumeBits =
 *  [se+0x10] = [mgr+0x2a324+0x10] = [mgr+0x2a334]. */
export const UPDATE_CAPTURE_MANAGER_OFFSETS = Object.freeze({
  pointerSlot: 0x00c7169c, /* [0xc7169c] -> Manager* (heap, outside layout) */
  f18: 0xf18, /* S1 inc dword */
  ebc: 0xebc, /* S3 inc dword */
  field14: 0x14, /* S2 = S4 byte (idempotent repeat) */
  field21618: 0x21618, /* S5 byte */
  field21620: 0x21620, /* S6 byte */
  field21624: 0x21624, /* S7 dword */
  field2161c: 0x2161c, /* S8 dword (PE constant 0x19) */
  field29fb8: 0x29fb8, /* S9 byte */
  volumeBits: 0x2a334, /* [se+0x10]; se = mgr+0x2a324 */
});

/** The record-4 sfx-manager BSS globals (the 0xc798e0 region; outside
 *  BINARY_LAYOUT per update-v96-record4-8318a0 §5). */
export const UPDATE_CAPTURE_SFX_GLOBAL_ADDRESSES = Object.freeze({
  global798e4: 0x00c798e4,
  global79948: 0x00c79948,
  global79790: 0x00c79790,
  global7978c: 0x00c7978c,
});

/* ABI v104 (update-v104-record4-apply): the store-plan APPLICATION arm —
   the bridge-owned absolute-addressed snapshot region standing in for the
   PE's sfx-manager BSS span of the captured Game snapshot (the element=0
   write surface of the 9-row apply plan; the machine uses the immediate
   0xc798e0 base, NOT [0xc7169c]). The span covers every element=0 target
   (0xc79900..0xc79910 = mgr+0x20..+0x30, 0xc79790 = mgr-0x150, 0xc7978c =
   mgr-0x154) AND the four captured globals (0xc798e4/0xc79948/0xc79790/
   0xc7978c). */
export const UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE = 0x00c7978c;
export const UPDATE_CAPTURE_SFX_MANAGER_BSS_END = 0x00c7994c; /* exclusive */
export const UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE =
  UPDATE_CAPTURE_SFX_MANAGER_BSS_END - UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE; /* 0x1c0 */
/** The machine's immediate manager base for the element=0 rows. */
export const UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE_MGR = 0x00c798e0;
export const UPDATE_CAPTURE_SFX_MANAGER_STORE_COUNT = 9;
/** The emitted apply-plan scratch layout (mask word + 9 x 16-B rows). */
export const UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS = 37;
export const UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_BYTES =
  UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS * 4; /* 148 */
/** Standing host-path kind for the element=1 (residual 0x684f30() node)
 *  row applications (ABI v104 apply consumer). */
export const UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND =
  "opaqueCall008318a0StoreApply";

/** Record idx 42 opaqueRoomUpdateTailPath (B19 0x008055a7..0x00806043 +
 *  B20 0x0080608e..0x008068a1): the trail-list container + per-entity
 *  pack sources. The container is the BSS global pair DAT_00c82674/78
 *  (PE 0x0080608e mov edx,[0xc82674] / 0x00806094 mov eax,[0xc82678]) —
 *  OUTSIDE the Game object, so both reads are guest-homed. Mode is
 *  Game+0x26614 (in-buffer; PE 0x0080636b cmp dword [ecx+0x26614],2,
 *  the chain-continue gate). Per-entity fields (entity ptr esi =
 *  [begin+i*4], pass2 reads 0x008061a9..0x00806808): type28 = [esi+0x28]
 *  (0x8061c8, pass1 filter + pass2 route), flags16c = [esi+0x16c]
 *  (0x8061ac, |0x4000 0x80613b / |0x80 0x8067f2 posts), field3c0 =
 *  [esi+0x3c0] (0x806259 multi-spawn enter cmp 0), child3bc = [esi+0x3bc]
 *  (0x80635b chain walk), childType28 = [child+0x28] (0x806374/0x80637a),
 *  posX/posY = f32 bits [esi+0x33c]/[esi+0x340] (0x8061b2/0x8061c0). */
export const UPDATE_CAPTURE_TAIL_PATH_LIST_ADDRESSES = Object.freeze({
  begin: 0x00c82674, /* DAT_00c82674 — container begin ptr */
  end: 0x00c82678, /* DAT_00c82678 — container end ptr */
});
export const UPDATE_CAPTURE_TAIL_PATH_GAME_MODE_OFF = 0x26614; /* [Game+0x26614] */
export const UPDATE_CAPTURE_TAIL_PATH_ENTRY_OFFSETS = Object.freeze({
  type28: 0x28,
  flags16c: 0x16c,
  field3c0: 0x3c0,
  child3bc: 0x3bc,
  childType28: 0x28, /* relative to the CHILD (= [ent+0x3bc]) */
  posX: 0x33c, /* f32 bits */
  posY: 0x340, /* f32 bits */
});

/* ---- record-15 B3B7 law-pack capture (W29-S2; update-v107-record15-
   capture NOTES §1). Seam PE 0x00803327..0x00803bfa; at the seam
   edi = Room = [Game+0x18300], Game = *[0xc71678], Mgr = *[0xc7169c].
   Every source below is a READ-ONLY pinned PE site; host-leaf results a
   browser cannot sample stay 0 (pre-capture default arms). ---- */
export const UPDATE_CAPTURE_B3B7_GAME_OFFSETS = Object.freeze({
  roomPtr18300: 0x18300,    /* [Game+0x18300] Room ptr word */
  game26630: 0x26630,       /* PE 0x8036b0 cmp [ecx+0x26630],0 */
  gameByte26589: 0x26589,   /* PE 0x8036b9 cmp byte [ecx+0x26589],0 */
  game26584: 0x26584,       /* PE 0x8038a7 cmp [ecx+0x26584],0x28 */
  game26614: 0x26614,       /* PE 0x8038e6 cmp [eax+0x26614],2 */
});
export const UPDATE_CAPTURE_B3B7_ROOM_OFFSETS = Object.freeze({
  descPtr: 0x4,             /* Room+4   RoomDesc* (PE 0x8033b6) */
  gridW: 0xc,               /* Room+0xc width_c (PE 0x803b57/0x803bc7) */
  gridH: 0x10,              /* Room+0x10 height_10 (PE 0x803bb9) */
  fcoFlag: 0x7768,          /* Room+0x7768 u8 FCO setne flag (PE 0x803350) */
  teGate: 0x7321,           /* Room+0x7321 u8 TE/HCE gate byte (PE 0x803374) */
  teBegin: 0x7314,          /* Room+0x7314 u32 (PE 0x80337d) */
  teEnd: 0x7318,            /* Room+0x7318 u32 (PE 0x803383) */
  teStride: 0x10,           /* PE 0x80339d add eax,0x10 */
  treeHead: 0x7234,         /* Room+0x7234 u32 B6 node-list head (PE 0x803b37) */
  treeCount: 0x7238,        /* Room+0x7238 u32 (PE 0x803b2e) */
  entityList: 0x125c,       /* Room+0x125c u32 entity ptr array base (PE 0x8038d0) */
  entityCount: 0x1264,      /* Room+0x1264 u32 (PE 0x8038bc) */
  gridBase: 0x24,           /* Room+0x24 u32 slot array (PE 0x803bcb lea) */
});
export const UPDATE_CAPTURE_B3B7_MGR_OFFSETS = Object.freeze({
  mode8: 8,                 /* Mgr+8 (PE 0x803698 cmp [eax+8],2) */
  byte1b4: 0x1b4,           /* Mgr+0x1b4 (PE 0x80368f) */
  byte2bf: 0x2bf,           /* Mgr+0x2bf (PE 0x8036f0) */
  byte1ba: 0x1ba,           /* Mgr+0x1ba (PE 0x803736) */
});
export const UPDATE_CAPTURE_B3B7_GLOBAL_ADDRESSES = Object.freeze({
  gamePtr: 0x00c71678,      /* *0xc71678 = Game */
  mgrPtr: 0x00c7169c,       /* *0xc7169c = Manager */
  b5End: 0x00c82678,        /* DAT_00c82678 B5 candidate-vector end (PE 0x803954) */
  b5Cap: 0x00c8267c,        /* DAT_00c8267c (PE 0x803959) */
});
export const UPDATE_CAPTURE_B3B7_CAPS = Object.freeze({
  te: 8,                    /* B3B7_TE_MAX_ENTRIES (blob 32 B = 8 u32) */
  b5: 32,                   /* B3B7_B5_MAX_ENTITIES (blob 128 B = 32 u32) */
  b6: 32,                   /* B3B7_B6_MAX_NODES (blob 128 B = 32 u32) */
  b7: 64,                   /* B3B7_B7_MAX_SLOTS (blob 256 B = 64 u32) */
});

/* ---- record-16 B8 path-cost capture (W30-S3; update-v108-record16-b8-
   bridge). The ONLY capture group that WRITES: it fills the module's
   exported k-blob scratch (costs int32[448] / trails int16[448]) from the
   live Room grids BEFORE resume_room_update_prefix_b2, and the bridge
   copies the scratch back AFTER the resume (module steps it in place).
   Sources are the pinned PE sites: room ptr word [Game+0x18300], dims
   (u32)[Room+0xc] / (u32)[Room+0x10] (cells = 32-bit imul wrap; the PE
   re-derives the bound per iteration 0x803ccd..0x803cdd), cost grid
   Room+0x76c (dword, stride 4), trail grid Room+0xe6c (word, stride 2).
   Runtime lanes: roomGridCells @200 / roomB8BlobReady @204 (FULL-dword —
   WIDE 0x100 stays pure). Cap = the module's own export
   isaac_game_update_slice_b8_max_cells() (ISAAC_ROOM_B8_MAX_CELLS 448):
   a live count over the cap keeps the byte-for-byte host residual. ---- */
export const UPDATE_CAPTURE_B8_GAME_OFFSETS = Object.freeze({
  roomPtr18300: 0x18300,    /* [Game+0x18300] Room ptr word (PE 0x803c00..) */
});
export const UPDATE_CAPTURE_B8_ROOM_OFFSETS = Object.freeze({
  gridW: 0xc,               /* Room+0xc u32 width (PE 0x803c29 imul) */
  gridH: 0x10,              /* Room+0x10 u32 height */
  costsBase: 0x76c,         /* Room+0x76c int32 cost grid (PE 0x803c50..) */
  trailsBase: 0xe6c,        /* Room+0xe6c int16 trail grid */
});

/* ---- record idx 5/32 entity-surface pack (W30-S2; update-v108-entity-
   surface-impl NOTES §1). The walk seam (PE 0x98dca2 / 0x98dd1d)
   matches the [Game+0x1baa8] player ptr vector (stride 4, SAR2 count
   re-read per iteration) against the MP ptr vector
   [*0xc7169c + 0x4b3d8..0x4b3dc] by [player+0x1618] == [entry+0xc]
   FIRST-match; the matched entry e carries the accept surface subobject
   at e+0x370 (vptr one of exactly two .rdata vtables 0xb82d98
   DataUpdate_t / 0xb82e20 LobbyDataUpdate_t, slot[0x14] = 0xa5f260 /
   0xa23970). The 44-B capture blob = the 11 u32 fields the accept
   virtuals read (vtable_class_bits DECODED 0/1/2; impl fields relative
   to the impl object at [sub+4] = [e+0x374]; netman + the three globals
   absolute guest-homed reads). Machine order = per player, first
   matching MP entry. Cap 8 slots; > 8 matched entries -> group ABSENT. */
export const UPDATE_CAPTURE_ENTITY_SURFACE_OFFSETS = Object.freeze({
  playerListBegin: 0x1baa8, /* [Game+0x1baa8] player ptr vector begin (in-buffer) */
  playerListEnd: 0x1baac,   /* [Game+0x1baac] vector end (in-buffer) */
  playerId1618: 0x1618,     /* per-player id (PE 0x98dcxx walks [p+0x1618]) */
  mgrPointerSlot: 0x00c7169c, /* *0xc7169c = Manager (guest) */
  mpListBegin: 0x4b3d8,     /* [mgr+0x4b3d8] MP ptr vector begin (PE 0x95614e) */
  mpListEnd: 0x4b3dc,       /* [mgr+0x4b3dc] vector end */
  mpEntryMatchC: 0xc,       /* [e+0xc] match field (== player id) */
  surface370: 0x370,        /* surface subobject base (vptr at +0) */
  implPtr4: 0x4,            /* [sub+4] impl object ptr */
  implB0: 0x0,              /* byte [impl+0] frame-state flag (low byte) */
  impl8: 0x8,               /* [impl+8] id word A (data-law compare) */
  implC: 0xc,               /* [impl+0xc] id word B / 0xfefefefe gate */
  impl20: 0x20,             /* [impl+0x20] layer-data node ptr */
  impl2010: 0x10,           /* [[impl+0x20]+0x10] layer-data node tag */
  netmanGlobal: 0x00c7999c, /* netman object ptr (0xa5f090 lookup) */
  netman2b4: 0x2b4,         /* [[0xc7999c]+0x2b4] netman slot */
  globalC73680: 0x00c73680, /* netman init flag (0xa5f090 gate) */
  globalC73694: 0x00c73694, /* netman mode, 0x60001 (0xa5f090 gate) */
  globalC5ac00: 0x00c5ac00, /* layer-tag sentinel global */
});
export const UPDATE_CAPTURE_ENTITY_SURFACE_MAX_SLOTS = 8;
/** Sane bound on the MP span scan (corrupt span -> group ABSENT). */
export const UPDATE_CAPTURE_ENTITY_SURFACE_MAX_MP_SCAN = 0x400;
export const UPDATE_CAPTURE_ENTITY_SURFACE_VTABLE_DATA_UPDATE_T = 0x00b82d98;
export const UPDATE_CAPTURE_ENTITY_SURFACE_VTABLE_LOBBY_DATA_UPDATE_T = 0x00b82e20;
export const UPDATE_CAPTURE_ENTITY_SURFACE_CLASS_DATA_UPDATE_T = 0;
export const UPDATE_CAPTURE_ENTITY_SURFACE_CLASS_LOBBY_DATA_UPDATE_T = 1;
export const UPDATE_CAPTURE_ENTITY_SURFACE_CLASS_UNKNOWN = 2;
/** Flat lane stems per slot (EXACT RUNTIME_INPUTS_LAYOUT suffix order,
 *  cf. the model's frameOpaque98dba0EntitySurfaceCapture{i}{Field}). */
export const UPDATE_CAPTURE_ENTITY_SURFACE_SLOT_FIELDS = Object.freeze([
  "VtableClassBits", "ImplPtr", "ImplB0", "Impl8", "ImplC", "Impl20",
  "Impl2010", "Netman2b4", "GlobalC73680", "GlobalC73694", "GlobalC5ac00",
]);

/** Read one u32 from guest memory through the host reader. */
function readGuestU32(guestRead, address) {
  const bytes = guestRead(address >>> 0, 4);
  if (!bytes || bytes.length < 4) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(0, true);
}

/** Read one u16 from guest memory through the host reader. */
function readGuestU16(guestRead, address) {
  const bytes = guestRead(address >>> 0, 2);
  if (!bytes || bytes.length < 2) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(0, true);
}

/** Read one u8 from guest memory through the host reader. */
function readGuestU8(guestRead, address) {
  const bytes = guestRead(address >>> 0, 1);
  if (!bytes || bytes.length < 1) return null;
  return bytes[0];
}

/**
 * Read the record-4 store-plan APPLICATION scratch emitted by the module
 * into its linear memory (IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan,
 * 148 B / 37 words: store_mask u32 @0 + 9 rows of {mgr_off, size, value,
 * element} u32s @4 + 16*i). ABI v102 emission arm (update-v102-record4-apply
 * §2/§3): the scratch is zeroed every step and filled with mask 0x1ff + the
 * plan-law rows exactly when the mode-1 manager-block gate opens; every gate
 * miss leaves it all-zero.
 *
 * @param {object|null} slice The loaded Update slice ({ wasm, memory }).
 * @returns {{storeMask: number, rows: Array<{mgrOff:number,size:number,value:number,element:number}>}|null}
 *   The parsed plan, or null when the module lacks the exports (stale
 *   pre-v102 module) or the scratch is unreportable (address 0 / words < 37
 *   — layout drift) — in every null case NOTHING is applied (the §5.2
 *   capture-absence/stale-module identity arm).
 */
export function readSfxManagerStoreApplyPlan(slice) {
  const wasm = slice?.wasm ?? null;
  if (!wasm) return null;
  const address =
    wasm.isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address ??
    wasm._isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address;
  const words =
    wasm.isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words ??
    wasm._isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words;
  if (typeof address !== "function" || typeof words !== "function") return null;
  const addr = address() >>> 0;
  const count = words() >>> 0;
  if (addr === 0 || count < UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS) {
    return null;
  }
  const memory = slice?.memory ?? null;
  const buffer = memory?.buffer ?? null;
  if (
    !buffer ||
    addr + UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_BYTES > buffer.byteLength
  ) {
    return null;
  }
  const view = new DataView(buffer);
  const storeMask = view.getUint32(addr, true);
  const rows = new Array(UPDATE_CAPTURE_SFX_MANAGER_STORE_COUNT);
  for (let i = 0; i < UPDATE_CAPTURE_SFX_MANAGER_STORE_COUNT; i += 1) {
    const base = addr + 4 + i * 16;
    rows[i] = {
      mgrOff: view.getUint32(base, true),
      size: view.getUint32(base + 4, true),
      value: view.getUint32(base + 8, true),
      element: view.getUint32(base + 12, true),
    };
  }
  return { storeMask, rows };
}

/**
 * Apply one record-4 store-plan (ABI v102/v104 consumer, v102 §5.3): for
 * every set bit row r of storeMask, `[target + rows[r].mgrOff] = rows[r].value`
 * with width rows[r].size bytes:
 *   - element == 0 (BSS rows 2..8): target = 0xc798e0 (the machine's
 *     immediate sfx-manager base) — the write lands in the captured Game
 *     snapshot's BSS region at absolute address 0xc798e0 + mgrOff (view is
 *     a DataView over the bridge-owned region with absolute base `base`;
 *     row7/row8 offsets 0xfffffeb0/0xfffffeac target 0xc79790/0xc7978c,
 *     BELOW the region base).
 *   - element == 1 (queue-node rows 0/1): dispatched through the standing
 *     host path — the residual HostHandler kind
 *     UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND — so the host (owner
 *     of the residual body's 0x684f30() node) applies them to ITS node;
 *     row 0's PE guard @0x831e5d (apply iff node+4 != 0) is carried as
 *     host-apply semantics (row0Guard). The block's device calls stay
 *     residual. Mask 0 -> NOTHING (both for a gate-closed all-zero scratch
 *     and for the pre-emission module).
 *
 * @param {object} [options]
 * @param {{storeMask: number, rows: Array}|null} [options.plan]
 * @param {DataView|null} [options.view] DataView over the BSS snapshot
 *   region (absolute base `base`). null -> element=0 rows cannot land
 *   (skipped).
 * @param {number} [options.base] Absolute guest address of `view`'s byte 0.
 * @param {((event: object) => void)|null} [options.host] The standing
 *   residual HostHandler (element=1 dispatch).
 * @returns {{applied: number, nodeRows: Array}}
 */
export function applySfxManagerStorePlan({
  plan = null,
  view = null,
  base = 0,
  host = null,
} = {}) {
  if (!plan || (plan.storeMask >>> 0) === 0) {
    return { applied: 0, nodeRows: [] };
  }
  const mask = plan.storeMask >>> 0;
  const rows = plan.rows || [];
  let applied = 0;
  const nodeRows = [];
  for (let r = 0; r < UPDATE_CAPTURE_SFX_MANAGER_STORE_COUNT; r += 1) {
    if (((mask >>> r) & 1) === 0) continue;
    const row = rows[r];
    if (!row) continue;
    if ((row.element >>> 0) !== 0) {
      nodeRows.push({
        mgrOff: row.mgrOff >>> 0,
        size: row.size >>> 0,
        value: row.value >>> 0,
        element: 1,
      });
      continue;
    }
    if (!view) continue; /* no BSS region -> the element=0 rows cannot land */
    const target = (UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE_MGR + row.mgrOff) >>> 0;
    const off = (target - base) >>> 0;
    if (off + row.size > view.byteLength) continue; /* out-of-region guard */
    const value = row.value >>> 0;
    if (row.size === 1) view.setUint8(off, value & 0xff);
    else view.setUint32(off, value, true);
    applied += 1;
  }
  if (nodeRows.length > 0 && typeof host === "function") {
    host({
      kind: UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND,
      count: 1,
      detail: {
        storeMask: mask,
        rows: nodeRows,
        /* PE 0x831e5d: the row-0 byte store fires iff node+4 != 0 — a
           HOST-apply condition (the node is the residual 0x684f30() return;
           the module cannot decide it). */
        row0Guard: true,
      },
    });
  }
  return { applied, nodeRows };
}

/**
 * Record idx 42 opaqueRoomUpdateTailPath (B19+B20) bridge-side capture,
 * READ-ONLY. Samples the record-42 seam (PE 0x008055a7..0x008068a1):
 * the trail container words [0xc82674]/[0xc82678] (guest-homed BSS), the
 * chain-continue mode [Game+0x26614] (Game-buffer-homed) and the
 * pass1/pass2 entity packs (guest-homed: entity ptrs at [begin+i*4];
 * fields at the pinned PE reads 0x008061a9..0x00806808). Emits the flat
 * 896-B blob (32 x 28 B, u32 LE — field order shared with the module via
 * flattenTailPathEntriesRuntime) and raises tailPathReady. Cap 32:
 * a live span > 32 entries (or a negative SAR count) leaves the group
 * ABSENT — the module keeps the pre-v95 monolithic record (unit-3
 * fallback). ANY failed read / null entity also leaves it absent (the §5
 * capture-absence discipline: absent ready gate -> byte-for-byte
 * residuals). genrandDraws stays 0: it is HOST-counted (the real draw
 * stream exists only inside the residual bodies the host executes).
 *
 * @param {object} [options]
 * @param {DataView|null} [options.gameView] READ-ONLY Game buffer view
 *   ([Game+0x26614] mode lane).
 * @param {((address: number, size: number) => Uint8Array|null)|null}
 *   [options.guestRead] READ-ONLY guest-memory reader for the BSS
 *   container + every entity field. null -> no capture ({}).
 * @returns {object} Flat runtime-inputs patch (tailPathReady=1 plus the
 *   4 scalars and the 896-B entries blob) or {} when not capturable.
 */
export function captureUpdateTailPath({
  gameView = null,
  guestRead = null,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  const ta = UPDATE_CAPTURE_TAIL_PATH_LIST_ADDRESSES;
  const begin = readGuestU32(guestRead, ta.begin);
  const end = readGuestU32(guestRead, ta.end);
  if (begin == null || end == null) return {};
  /* PE 0x008060c7 sub eax,edx / 0x008060d2 sar eax,2 — SIGNED arithmetic
     shift over the u32 delta; a negative span or an over-cap count keeps
     the pre-v95 monolith. */
  const count = ((end - begin) | 0) >> 2;
  if (count < 0 || count > TAIL_PATH_MAX_NODES) return {};
  const ent = UPDATE_CAPTURE_TAIL_PATH_ENTRY_OFFSETS;
  const packs = [];
  for (let i = 0; i < count; i += 1) {
    const entPtr = readGuestU32(guestRead, (begin + i * 4) >>> 0);
    if (entPtr == null || entPtr === 0) return {};
    const type28 = readGuestU32(guestRead, (entPtr + ent.type28) >>> 0);
    const flags16c = readGuestU32(guestRead, (entPtr + ent.flags16c) >>> 0);
    const field3c0 = readGuestU32(guestRead, (entPtr + ent.field3c0) >>> 0);
    const child3bc = readGuestU32(guestRead, (entPtr + ent.child3bc) >>> 0);
    const posX = readGuestU32(guestRead, (entPtr + ent.posX) >>> 0);
    const posY = readGuestU32(guestRead, (entPtr + ent.posY) >>> 0);
    if (type28 == null || flags16c == null || field3c0 == null ||
        child3bc == null || posX == null || posY == null) return {};
    let childType28 = 0;
    if (child3bc !== 0) {
      childType28 = readGuestU32(guestRead, (child3bc + ent.childType28) >>> 0);
      if (childType28 == null) return {};
    }
    packs.push({ type28, flags16c, field3c0, child3bc, childType28, posX, posY });
  }
  const out = {};
  out.tailPathReady = 1;
  out.tailPathListBeginC82674 = begin;
  out.tailPathListEndC82678 = end;
  out.tailPathMode26614 = gameView.getUint32(UPDATE_CAPTURE_TAIL_PATH_GAME_MODE_OFF, true);
  out.tailPathGenrandDraws = 0; /* host-counted (no draw stream here) */
  out.tailPathEntries = flattenTailPathEntriesRuntime(packs, TAIL_PATH_MAX_NODES);
  return out;
}

/**
 * Record idx 15 B3B7 law-pack bridge-side capture (W29-S2; update-v107-
 * record15-capture NOTES §1). At the record-15 seam (PE 0x00803327..
 * 0x00803bfa) reads the LIVE game state at the pinned PE sites — the
 * sparse cells (teByte7321/teBegin/teEnd/descType0/treeCount7238/
 * widthC/height10, all room-homed) plus the 38-row law pack
 * (FcoResult..TeEntriesCount/B6NodeCount/B7NonnullSlotCount + the blob
 * rows TeEntryType..B7NonnullSlots @8008..9956) — and raises
 * b3b7SparseReady BEFORE resume. Host-leaf results a browser cannot
 * sample (lookupCount / lookupResultByte / count708250 / the per-entity
 * vt48/vt4c AL rows) are emitted as explicit 0 — the pre-capture
 * default arms. ANY unresolved read leaves the WHOLE group ABSENT
 * (ready gate stays 0 -> the room-pure wire_decide keeps the pre-v48
 * MONOLITHIC residual, byte-for-byte). READ-ONLY — same discipline as
 * the §5 groups.
 * @returns {object} Flat runtime-inputs patch with EXACT
 *   RUNTIME_INPUTS_LAYOUT key names + b3b7SparseReady=1, or {} when
 *   not capturable.
 */
export function captureUpdateB3b7({
  gameView = null,
  guestRead = null,
  gamePointerValue = 0,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  const G = UPDATE_CAPTURE_B3B7_GAME_OFFSETS;
  const R = UPDATE_CAPTURE_B3B7_ROOM_OFFSETS;
  const M = UPDATE_CAPTURE_B3B7_MGR_OFFSETS;
  const GB = UPDATE_CAPTURE_B3B7_GLOBAL_ADDRESSES;
  const CAP = UPDATE_CAPTURE_B3B7_CAPS;
  const fail = () => ({}); /* any unresolved read -> ready 0 -> monolith */
  /* The layout rows are u32 arrays in the module ABI but "bytes" in the
     layout writer (1 byte/element) — stage them here as flat u32-LE byte
     blobs (the tailPathEntries precedent; the model oracle decodes them). */
  const flatRow = (cap) => new Uint8Array(cap * 4);
  const flatSet = (row, i, v) => {
    const o = i * 4;
    const u = v >>> 0;
    row[o] = u & 0xff;
    row[o + 1] = (u >>> 8) & 0xff;
    row[o + 2] = (u >>> 16) & 0xff;
    row[o + 3] = (u >>> 24) & 0xff;
  };

  const gamePtr = readGuestU32(guestRead, GB.gamePtr);
  if (gamePtr == null || gamePtr === 0) return fail();
  const roomPtr = gameView.getUint32(G.roomPtr18300, true) >>> 0;
  if (roomPtr === 0) return fail();
  const roomU8 = (off) => readGuestU8(guestRead, (roomPtr + off) >>> 0);
  const roomU32 = (off) => readGuestU32(guestRead, (roomPtr + off) >>> 0);
  const mgrPtr = readGuestU32(guestRead, GB.mgrPtr);
  if (mgrPtr == null) return fail();
  const mgrU8 = (off) => readGuestU8(guestRead, (mgrPtr + off) >>> 0);
  const mgrU32 = (off) => readGuestU32(guestRead, (mgrPtr + off) >>> 0);

  /* Sparse cells (room-homed). */
  const teByte7321 = roomU8(R.teGate);        /* PE 0x803374 */
  const teBegin = roomU32(R.teBegin);         /* PE 0x80337d */
  const teEnd = roomU32(R.teEnd);             /* PE 0x803383 */
  const treeCount7238 = roomU32(R.treeCount); /* PE 0x803b2e */
  const widthC = roomU32(R.gridW);            /* PE 0x803b57 */
  const height10 = roomU32(R.gridH);          /* PE 0x803bb9 */
  const descPtr = roomU32(R.descPtr);         /* PE 0x8033b6 */
  if (teByte7321 == null || teBegin == null || teEnd == null ||
      treeCount7238 == null || widthC == null || height10 == null ||
      descPtr == null || descPtr === 0) return fail();
  const descType0 = readGuestU32(guestRead, descPtr);        /* [desc+0] */
  const descSeed5c = readGuestU32(guestRead, (descPtr + 0x5c) >>> 0);
  if (descType0 == null || descSeed5c == null) return fail();

  /* TE entries: the Room+0x7314..0x7318 list; elements are 0x10-stride
     POINTERS to {type@0, id@4} nodes (PE 0x803390 / 0x9305f0). Captured
     count capped at 8 (the TE-match law's own cap). */
  const teCount = teEnd >= teBegin
    ? Math.min(Math.floor((teEnd - teBegin) / R.teStride), CAP.te) : 0;
  const teType = flatRow(CAP.te);
  const teId = flatRow(CAP.te);
  for (let i = 0; i < teCount; i += 1) {
    const entryPtr = readGuestU32(guestRead, (teBegin + i * R.teStride) >>> 0);
    if (entryPtr == null || entryPtr === 0) return fail();
    const t = readGuestU32(guestRead, entryPtr);
    const id = readGuestU32(guestRead, (entryPtr + 4) >>> 0);
    if (t == null || id == null) return fail();
    flatSet(teType, i, t);
    flatSet(teId, i, id);
  }
  /* HCE(0x2a5) hit — the 0x9305f0 walk over the SAME list: gate byte
     clear && type ∈ {1,3,4} && id == 0x2a5. Computed from the captured
     rows (cap 8 — the same cap the TE-match law applies). */
  let hce2a5Hit = 0;
  if ((teByte7321 & 0xff) === 0) {
    for (let i = 0; i < teCount; i += 1) {
      const t = new DataView(teType.buffer, teType.byteOffset, teType.byteLength)
        .getUint32(i * 4, true);
      const id = new DataView(teId.buffer, teId.byteOffset, teId.byteLength)
        .getUint32(i * 4, true);
      if (t === 1 || t === 3 || t === 4) {
        if (id === 0x2a5) { hce2a5Hit = 1; break; }
      }
    }
  }

  /* B5 entity rows (entity ptr array @ Room+0x125c, count @0x1264;
     passes at PE 0x8038d0 / 0x8039d0). NULL slots capture an all-zero
     row (the machine skips them at 0x8038db — zero rows are inert in
     the law). */
  const entityBase = roomU32(R.entityList);
  const entityCount = roomU32(R.entityCount);
  if (entityBase == null || entityCount == null) return fail();
  const b5N = Math.min(entityCount, CAP.b5);
  const b5Type = flatRow(CAP.b5);
  const b5Variant = flatRow(CAP.b5);
  const b5Flags168 = flatRow(CAP.b5);
  const b5Vt48Al = flatRow(CAP.b5);    /* [vt+0x48]() host leaf -> 0 */
  const b5Field32c = flatRow(CAP.b5);
  const b5Vt4cAl = flatRow(CAP.b5);    /* [vt+0x4c]() host leaf -> 0 */
  const b5Seed3dc = flatRow(CAP.b5);
  const b5Shift3e0 = flatRow(CAP.b5);
  const b5Shift3e4 = flatRow(CAP.b5);
  const b5Shift3e8 = flatRow(CAP.b5);
  for (let i = 0; i < b5N; i += 1) {
    const ent = readGuestU32(guestRead, (entityBase + i * 4) >>> 0);
    if (ent == null) return fail();
    if (ent === 0) continue;
    const type = readGuestU32(guestRead, (ent + 0x28) >>> 0);
    const variant = readGuestU32(guestRead, (ent + 0x2c) >>> 0);
    const flags168 = readGuestU32(guestRead, (ent + 0x168) >>> 0);
    const field32c = readGuestU32(guestRead, (ent + 0x32c) >>> 0);
    const seed3dc = readGuestU32(guestRead, (ent + 0x3dc) >>> 0);
    const shift3e0 = readGuestU32(guestRead, (ent + 0x3e0) >>> 0);
    const shift3e4 = readGuestU32(guestRead, (ent + 0x3e4) >>> 0);
    const shift3e8 = readGuestU32(guestRead, (ent + 0x3e8) >>> 0);
    if (type == null || variant == null || flags168 == null ||
        field32c == null || seed3dc == null || shift3e0 == null ||
        shift3e4 == null || shift3e8 == null) return fail();
    flatSet(b5Type, i, type);
    flatSet(b5Variant, i, variant);
    flatSet(b5Flags168, i, flags168);
    flatSet(b5Field32c, i, field32c);
    flatSet(b5Seed3dc, i, seed3dc);
    flatSet(b5Shift3e0, i, shift3e0);
    flatSet(b5Shift3e4, i, shift3e4);
    flatSet(b5Shift3e8, i, shift3e8);
  }

  /* B6 destroy-tree walk (PE 0x803b37..0x803b97: std::list head at
     Room+0x7234, first node = [head], node idx @+0x10, next @+8 per the
     0x414a80 advance). Slot presence is captured PRE-clear. */
  const b6NodeIdx = flatRow(CAP.b6);
  const b6NodeSlotNonnull = flatRow(CAP.b6);
  let b6NodeCount = 0;
  if (treeCount7238 !== 0) {
    const head = roomU32(R.treeHead);
    if (head == null) return fail();
    let node = head === 0 ? 0 : readGuestU32(guestRead, head);
    if (node == null) return fail();
    const cellsSigned = ((widthC * height10) | 0) >>> 0; /* imul signed wrap */
    while (node !== 0 && node !== head && b6NodeCount < CAP.b6) {
      const idxRaw = readGuestU32(guestRead, (node + 0x10) >>> 0);
      if (idxRaw == null) return fail();
      const idx = idxRaw | 0;
      flatSet(b6NodeIdx, b6NodeCount, idxRaw);
      if (idx >= 0 && (idx >>> 0) < cellsSigned) {
        const slotRaw = readGuestU32(
          guestRead, (roomPtr + R.gridBase + (idx >>> 0) * 4) >>> 0);
        if (slotRaw == null) return fail();
        flatSet(b6NodeSlotNonnull, b6NodeCount, slotRaw !== 0 ? 1 : 0);
      }
      b6NodeCount += 1;
      const next = readGuestU32(guestRead, (node + 8) >>> 0);
      if (next == null) return fail();
      node = next;
    }
  }

  /* B7 grid slots (cells = w*h 32-bit wrap; PE 0x803bd0..0x803bf6).
     The scan is bounded (min(cells, 1<<20)) so a corrupt dim pair can
     never stall the tick; the law caps the host vcalls at 64 anyway. */
  const b7Slots = flatRow(CAP.b7);
  let b7Count = 0;
  const cells = (widthC * height10) >>> 0;
  const cellsScan = Math.min(cells, 1 << 20);
  for (let idx = 0; idx < cellsScan && b7Count < CAP.b7; idx += 1) {
    const slot = readGuestU32(guestRead, (roomPtr + R.gridBase + idx * 4) >>> 0);
    if (slot == null) return fail();
    if (slot !== 0) flatSet(b7Slots, b7Count++, idx);
  }

  const b5End = readGuestU32(guestRead, GB.b5End);
  const b5Cap = readGuestU32(guestRead, GB.b5Cap);
  if (b5End == null || b5Cap == null) return fail();
  const mgrMode8 = mgrU32(M.mode8);
  const mgrByte1b4 = mgrU8(M.byte1b4);
  const mgrByte2bf = mgrU8(M.byte2bf);
  const mgrByte1ba = mgrU8(M.byte1ba);
  const roomByte0 = roomU8(0);               /* PE 0x803886 */
  const roomByte1 = roomU8(1);               /* PE 0x803472 */
  const fcoFlag = roomU8(R.fcoFlag);         /* PE 0x803350 store */
  if (mgrMode8 == null || mgrByte1b4 == null || mgrByte2bf == null ||
      mgrByte1ba == null || roomByte0 == null || roomByte1 == null ||
      fcoFlag == null) return fail();

  const out = {};
  /* Sparse pack (offsets 872..896). */
  out.b3b7SparseReady = 1; /* raise BEFORE resume */
  out.b3b7TeByte7321 = teByte7321 >>> 0;
  out.b3b7TeBegin = teBegin >>> 0;
  out.b3b7TeEnd = teEnd >>> 0;
  out.b3b7DescType0 = descType0;
  out.b3b7TreeCount7238 = treeCount7238;
  out.b3b7WidthC = widthC;
  out.b3b7Height10 = height10;
  /* 38-row law pack (offsets 8008..9956). */
  out.b3b7FcoResult = fcoFlag >>> 0;
  out.b3b7Hce2a5Hit = hce2a5Hit;
  out.b3b7RoomByte1 = roomByte1 >>> 0;
  out.b3b7DescSeed5c = descSeed5c;
  out.b3b7LookupCount = 0;          /* host leaf 0x41af60 (+0xc struct) */
  out.b3b7LookupResultByte = 0;     /* host leaf 0x41af60 (+0 struct) */
  out.b3b7MgrByte1b4 = mgrByte1b4 >>> 0;
  out.b3b7MgrByte2bf = mgrByte2bf >>> 0;
  out.b3b7MgrByte1ba = mgrByte1ba >>> 0;
  out.b3b7MgrMode8 = mgrMode8 >>> 0;
  out.b3b7GameNonnull = gamePtr !== 0 ? 1 : 0;
  out.b3b7Game26630 = gameView.getUint32(G.game26630, true);
  out.b3b7GameByte26589 = gameView.getUint8(G.gameByte26589) >>> 0;
  out.b3b7RoomByte0 = roomByte0 >>> 0;
  out.b3b7Game26584 = gameView.getUint32(G.game26584, true);
  out.b3b7Game26614 = gameView.getUint32(G.game26614, true);
  out.b3b7EntityCount = entityCount >>> 0;
  out.b3b7ListEnd = b5End;
  out.b3b7ListCap = b5Cap;
  out.b3b7Count708250 = 0;          /* host leaf 0x708250 */
  out.b3b7TeEntriesCount = teCount;
  out.b3b7TeEntryType = teType;
  out.b3b7TeEntryId = teId;
  out.b3b7B5Type = b5Type;
  out.b3b7B5Variant = b5Variant;
  out.b3b7B5Flags168 = b5Flags168;
  out.b3b7B5Vt48Al = b5Vt48Al;
  out.b3b7B5Field32c = b5Field32c;
  out.b3b7B5Vt4cAl = b5Vt4cAl;
  out.b3b7B5Seed3dc = b5Seed3dc;
  out.b3b7B5Shift3e0 = b5Shift3e0;
  out.b3b7B5Shift3e4 = b5Shift3e4;
  out.b3b7B5Shift3e8 = b5Shift3e8;
  out.b3b7B6NodeCount = b6NodeCount;
  out.b3b7B6NodeIdx = b6NodeIdx;
  out.b3b7B6NodeSlotNonnull = b6NodeSlotNonnull;
  out.b3b7B7NonnullSlotCount = b7Count;
  out.b3b7B7NonnullSlots = b7Slots;
  return out;
}

/**
 * Record idx 16 opaqueRoomUpdatePrefixB8 (B8 path-cost) bridge-side
 * CAPTURE (W30-S3; update-v108-record16-b8-bridge NOTES §2). Reads the
 * LIVE Room grids at the pinned PE sites and carries them for the
 * resume_room_update_prefix_b2 seam, raising the roomGridCells /
 * roomB8BlobReady runtime lanes:
 *   - room ptr word = [Game+0x18300] (gameView);
 *   - w = (u32)[Room+0xc], h = (u32)[Room+0x10], cells = 32-bit imul
 *     wrap (Math.imul >>> 0 — the PE `imul` at 0x803c29; the loop bound
 *     is re-read per iteration at 0x803ccd..0x803cdd);
 *   - cells x int32 from Room+0x76c (stride 4) + cells x int16 from
 *     Room+0xe6c (stride 2), both via guestRead.
 * The module steps the exported k-blob scratch (costs int32[448] LE @
 * isaac_game_update_slice_b8_costs_address(), trails int16[448] LE @
 * isaac_game_update_slice_b8_trails_address()) IN PLACE when its gate
 * opens ((int)Game+0x264f8 % 3 == 0 && cells > 0, SIGNED) and emits ZERO
 * host residual (event 148 stays 0); the bridge fills the scratch at the
 * resume seam (fillUpdateB8Scratch — the per-tick isaac_game_update_slice_
 * reset_scratch zeroes it at tick start) and copies it back after the
 * tick (copyBackUpdateB8).
 *
 * THE ONLY capture group with a WRITE side (the k-blob scratch fill at
 * the seam + the post-tick copy-back) — deliberately NOT merged into
 * captureUpdateLanes (READ-ONLY contract); tick() calls it alongside,
 * under extraRuntime.
 *
 * Capture-absence discipline: ANY unresolved read (no exports / no
 * gameView / no guestRead / room ptr null / dim read fail / any grid read
 * fail / cells over the module cap) returns null — the ready gate stays 0
 * and the module falls back to the byte-for-byte host residual over the
 * live grids. cells == 0 IS captured (ready=1, cells=0): the module gate
 * needs cells > 0 so nothing fires and nothing steps — byte-for-byte with
 * the PE (live dims -> 0 cells -> gate closed), and more exact than the
 * pre-wire default 15-cell residual.
 *
 * @param {object} [options]
 * @param {object|null} [options.slice] The loaded Update slice
 *   ({ wasm, memory }). null -> no capture (the module cap export
 *   lives on the wasm).
 * @param {DataView|null} [options.gameView] DataView over the session's
 *   Game buffer ([Game+0x18300] room ptr word).
 * @param {((address: number, size: number) => Uint8Array|null)|null}
 *   [options.guestRead] READ-ONLY guest-memory reader for the Room object
 *   (dims + the two grids). null -> no capture.
 * @returns {{patch: object, roomPtr: number, cells: number,
 *   costs: Int32Array, trails: Int16Array}|null}
 *   The capture site + grid arrays (for fillUpdateB8Scratch at the seam
 *   and the post-tick copy-back), or null when not capturable.
 */
export function captureUpdateB8({
  slice = null,
  gameView = null,
  guestRead = null,
} = {}) {
  const wasm = slice?.wasm ?? null;
  if (!wasm) return null;
  if (!gameView || typeof gameView.getUint32 !== "function") return null;
  if (typeof guestRead !== "function") return null;
  const maxCells = wasm.isaac_game_update_slice_b8_max_cells ??
    wasm._isaac_game_update_slice_b8_max_cells;
  if (typeof maxCells !== "function") {
    return null; /* stale pre-v95 module — ready stays 0 -> residual */
  }
  const cap = maxCells() >>> 0;
  if (cap === 0) return null;
  const G = UPDATE_CAPTURE_B8_GAME_OFFSETS;
  const R = UPDATE_CAPTURE_B8_ROOM_OFFSETS;
  const roomPtr = gameView.getUint32(G.roomPtr18300, true) >>> 0;
  if (roomPtr === 0) return null;
  const w = readGuestU32(guestRead, (roomPtr + R.gridW) >>> 0);
  const h = readGuestU32(guestRead, (roomPtr + R.gridH) >>> 0);
  if (w == null || h == null) return null;
  /* PE 0x803c29 `imul` over the two u32 dims — 32-bit wrap (signed mul,
     bits taken unsigned for the count). */
  const cells = Math.imul(w, h) >>> 0;
  if (cells > cap) return null; /* capture cannot fit — over-cap fallback */
  const costs = new Int32Array(cells);
  const trails = new Int16Array(cells);
  for (let i = 0; i < cells; i += 1) {
    const cost = guestRead((roomPtr + R.costsBase + i * 4) >>> 0, 4);
    const trail = guestRead((roomPtr + R.trailsBase + i * 2) >>> 0, 2);
    if (!cost || cost.length < 4 || !trail || trail.length < 2) return null;
    const cv = new DataView(cost.buffer, cost.byteOffset, cost.byteLength);
    const tv = new DataView(trail.buffer, trail.byteOffset, trail.byteLength);
    costs[i] = cv.getInt32(0, true);
    trails[i] = tv.getInt16(0, true);
  }
  return {
    patch: { roomGridCells: cells >>> 0, roomB8BlobReady: 1 },
    roomPtr,
    cells,
    costs,
    trails,
  };
}

/**
 * Record idx 16 B8 scratch FILL (W30-S3; NOTES §3). Writes a captureUpdateB8
 * result's grid arrays into the module's exported k-blob scratch — costs
 * int32[448] LE @ isaac_game_update_slice_b8_costs_address(), trails
 * int16[448] LE @ isaac_game_update_slice_b8_trails_address(). Called at
 * the resume_room_update_prefix_b2 seam — AFTER isaac_game_update_slice_
 * reset_scratch zeroed the scratch at tick start and immediately BEFORE
 * the resume that runs the B8 block — so the module steps the LIVE grid
 * capture in place. Returns the number of cells written (0 when the
 * exports/capture are unusable).
 *
 * @param {object} [options]
 * @param {object|null} [options.slice] The loaded Update slice
 *   ({ wasm, memory }). null -> no fill.
 * @param {object|null} [options.capture] A captureUpdateB8 result.
 * @returns {number} Cells filled (0 when skipped).
 */
export function fillUpdateB8Scratch({
  slice = null,
  capture = null,
} = {}) {
  if (!capture || !slice) return 0;
  const wasm = slice?.wasm ?? null;
  const memory = slice?.memory ?? null;
  if (!wasm || !memory) return 0;
  const costsAddr = wasm.isaac_game_update_slice_b8_costs_address ??
    wasm._isaac_game_update_slice_b8_costs_address;
  const trailsAddr = wasm.isaac_game_update_slice_b8_trails_address ??
    wasm._isaac_game_update_slice_b8_trails_address;
  if (typeof costsAddr !== "function" || typeof trailsAddr !== "function") return 0;
  const cells = capture.cells | 0;
  if (!(cells > 0)) return 0;
  const costs = capture.costs;
  const trails = capture.trails;
  if (!costs || !trails) return 0;
  /* The capture's own arrays bound the write: a cells count beyond the
     captured grids must never write (out-of-bounds captures -> absent). */
  if (cells > costs.length || cells > trails.length) return 0;
  const buffer = memory.buffer;
  const costsOff = costsAddr() >>> 0;
  const trailsOff = trailsAddr() >>> 0;
  if (costsOff === 0 || trailsOff === 0) return 0;
  if (costsOff + cells * 4 > buffer.byteLength ||
      trailsOff + cells * 2 > buffer.byteLength) {
    return 0; /* scratch out of linear-memory bounds — absent */
  }
  const view = new DataView(buffer);
  for (let i = 0; i < cells; i += 1) {
    view.setInt32(costsOff + i * 4, costs[i] | 0, true);
    view.setInt16(trailsOff + i * 2, trails[i] | 0, true);
  }
  return cells;
}

/**
 * Record idx 16 B8 copy-back (W30-S3; NOTES §3). Reads the module's
 * exported scratch back AFTER the tick (the module stepped it IN PLACE
 * when the B8 gate opened; it still holds the captured values on a gate
 * miss) and writes every cell to the LIVE Room grids — costs Room+0x76c
 * (int32 LE, stride 4), trails Room+0xe6c (int16 LE, stride 2) — through
 * the host-installed guestWrite(address, bytes) hook.
 *
 * Unconditional-on-armed: a gate miss leaves the scratch byte-identical
 * to the capture, so the copy-back is an idempotent no-op there; a gate
 * open leaves the stepped values, and the copy-back IS the required
 * "host copies scratch back AFTER". When the hook is absent the copy is
 * skipped — the post-step scratch still surfaces on the tick result as
 * b8GridApply so callers can apply it themselves.
 *
 * @param {object} [options]
 * @param {object|null} [options.slice] The loaded Update slice
 *   ({ wasm, memory }). null -> no copy-back.
 * @param {number} [options.roomPtr] The captured Room pointer.
 * @param {number} [options.cells] The captured cell count (> 0).
 * @param {((address: number, bytes: Uint8Array) => void)|null}
 *   [options.guestWrite] WRITE-side twin of guestRead: applies `bytes` to
 *   the live guest memory at `address`. null -> no copy-back.
 * @returns {number} Number of cells written back (0 when skipped).
 */
export function copyBackUpdateB8({
  slice = null,
  roomPtr = 0,
  cells = 0,
  guestWrite = null,
} = {}) {
  if (typeof guestWrite !== "function") return 0;
  const wasm = slice?.wasm ?? null;
  const memory = slice?.memory ?? null;
  if (!wasm || !memory || cells <= 0 || roomPtr === 0) return 0;
  const costsAddr = wasm.isaac_game_update_slice_b8_costs_address ??
    wasm._isaac_game_update_slice_b8_costs_address;
  const trailsAddr = wasm.isaac_game_update_slice_b8_trails_address ??
    wasm._isaac_game_update_slice_b8_trails_address;
  if (typeof costsAddr !== "function" || typeof trailsAddr !== "function") return 0;
  const buffer = memory.buffer;
  const costsOff = costsAddr() >>> 0;
  const trailsOff = trailsAddr() >>> 0;
  if (costsOff === 0 || trailsOff === 0) return 0;
  if (costsOff + cells * 4 > buffer.byteLength ||
      trailsOff + cells * 2 > buffer.byteLength) {
    return 0;
  }
  const R = UPDATE_CAPTURE_B8_ROOM_OFFSETS;
  const view = new DataView(buffer);
  let written = 0;
  for (let i = 0; i < cells; i += 1) {
    const costBits = view.getInt32(costsOff + i * 4, true);
    const trailBits = view.getInt16(trailsOff + i * 2, true);
    const costBytes = new Uint8Array(4);
    new DataView(costBytes.buffer).setInt32(0, costBits, true);
    const trailBytes = new Uint8Array(2);
    new DataView(trailBytes.buffer).setInt16(0, trailBits, true);
    guestWrite((roomPtr + R.costsBase + i * 4) >>> 0, costBytes);
    guestWrite((roomPtr + R.trailsBase + i * 2) >>> 0, trailBytes);
    written += 1;
  }
  return written;
}

/**
 * Record idx 5/32 entity-surface capture (W30-S2; update-v108-entity-
 * surface-impl NOTES §1). At the FUN_0098dba0 walk seam (PE 0x98dca2 /
 * 0x98dd1d) samples the LIVE surfaces the accept virtuals 0xa5f260 /
 * 0xa23970 read: for each player of the [Game+0x1baa8] ptr vector (SAR2
 * count, machine order) the FIRST MP entry of [*0xc7169c+0x4b3d8] with
 * [e+0xc] == [p+0x1618]; the 44-B blob fields (vtable class DECODE of
 * [e+0x370], impl_ptr [e+0x374], impl_b0 byte[impl+0], impl_8 [impl+8],
 * impl_c [impl+0xc], impl_20 [impl+0x20], impl_20_10 [[impl+0x20]+0x10]
 * (deref iff impl_20 != 0 — the machine je's to the byte law), netman_2b4
 * [[0xc7999c]+0x2b4] (netman ptr 0 -> 0: the 0xa5f090 lookup only reads
 * it when the c73680/c73694 gate opens), and the three absolute globals.
 * Emits the flat per-field lanes (@14332..14684) + ready @14328. ANY
 * unresolved read, > 8 matched entries, or ZERO matched entries leaves
 * the group ABSENT (ready 0 -> the pre-pack v95 walk surface, byte-for-
 * byte; the zero-slot case must NOT publish a "pure" accept=0 proof for
 * a dispatch that never ran — a zeroed slot decodes as class 0
 * DATA_UPDATE_T). READ-ONLY — same discipline as the §5 groups.
 *
 * @param {object} [options]
 * @param {DataView|null} [options.gameView] READ-ONLY Game buffer view
 *   ([Game+0x1baa8/0x1baac] player span).
 * @param {((address: number, size: number) => Uint8Array|null)|null}
 *   [options.guestRead] READ-ONLY guest-memory reader for the manager
 *   heap, the player objects, the MP entries and the absolute globals.
 *   null -> no capture ({}).
 * @returns {object} Flat runtime-inputs patch
 *   (frameOpaque98dba0EntitySurfaceReady=1 + the 8 x 11 slot lanes) or
 *   {} when not capturable.
 */
export function captureUpdateEntitySurface({
  gameView = null,
  guestRead = null,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  const O = UPDATE_CAPTURE_ENTITY_SURFACE_OFFSETS;
  const fail = () => ({}); /* any unresolved read -> ready 0 */

  /* Player ptr vector (in-buffer). PE 0x98dbe1/0x98dc11 count gates:
     count = (end-begin) SAR2 — SIGNED; a negative span can never be a
     live player list. */
  const pBegin = gameView.getUint32(O.playerListBegin, true);
  const pEnd = gameView.getUint32(O.playerListEnd, true);
  const playerCount = ((pEnd - pBegin) | 0) >> 2;
  if (playerCount < 0 || playerCount > ENGINE_PLAYER_MAX) return fail();

  /* MP ptr vector (guest manager heap). */
  const mgr = readGuestU32(guestRead, O.mgrPointerSlot);
  if (mgr == null || mgr === 0) return fail();
  const mBegin = readGuestU32(guestRead, (mgr + O.mpListBegin) >>> 0);
  const mEnd = readGuestU32(guestRead, (mgr + O.mpListEnd) >>> 0);
  if (mBegin == null || mEnd == null) return fail();
  const mpCount = ((mEnd - mBegin) | 0) >> 2;
  if (mpCount < 0 || mpCount > UPDATE_CAPTURE_ENTITY_SURFACE_MAX_MP_SCAN) {
    return fail();
  }

  /* Absolute globals (guest-homed; the data-law lookup + layer gate). */
  const globalC73680 = readGuestU32(guestRead, O.globalC73680);
  const globalC73694 = readGuestU32(guestRead, O.globalC73694);
  const globalC5ac00 = readGuestU32(guestRead, O.globalC5ac00);
  if (globalC73680 == null || globalC73694 == null || globalC5ac00 == null) {
    return fail();
  }
  const netmanPtr = readGuestU32(guestRead, O.netmanGlobal);
  if (netmanPtr == null) return fail();
  let netman2b4 = 0;
  if (netmanPtr !== 0) {
    const slot = readGuestU32(guestRead, (netmanPtr + O.netman2b4) >>> 0);
    if (slot == null) return fail();
    netman2b4 = slot;
  }

  /* Machine order: each player x the MP vector, FIRST match. Cap 8 — a
     live span with more matched entries keeps the pre-pack surface. */
  const slots = [];
  for (let i = 0; i < playerCount; i += 1) {
    const p = readGuestU32(guestRead, (pBegin + i * 4) >>> 0);
    if (p == null || p === 0) return fail();
    const id = readGuestU32(guestRead, (p + O.playerId1618) >>> 0);
    if (id == null) return fail();
    for (let j = 0; j < mpCount; j += 1) {
      const e = readGuestU32(guestRead, (mBegin + j * 4) >>> 0);
      if (e == null || e === 0) return fail();
      const matchC = readGuestU32(guestRead, (e + O.mpEntryMatchC) >>> 0);
      if (matchC == null) return fail();
      if ((matchC >>> 0) !== id) continue;
      if (slots.length === UPDATE_CAPTURE_ENTITY_SURFACE_MAX_SLOTS) {
        return fail(); /* 9th match -> over cap -> group absent */
      }
      const sub = (e + O.surface370) >>> 0;
      const vptr = readGuestU32(guestRead, sub);
      if (vptr == null) return fail();
      const implPtr = readGuestU32(guestRead, (sub + O.implPtr4) >>> 0);
      if (implPtr == null) return fail();
      let implB0 = 0;
      let impl8 = 0;
      let implC = 0;
      let impl20 = 0;
      let impl2010 = 0;
      if (implPtr !== 0) {
        const b0 = readGuestU8(guestRead, (implPtr + O.implB0) >>> 0);
        const i8 = readGuestU32(guestRead, (implPtr + O.impl8) >>> 0);
        const iC = readGuestU32(guestRead, (implPtr + O.implC) >>> 0);
        const i20 = readGuestU32(guestRead, (implPtr + O.impl20) >>> 0);
        if (b0 == null || i8 == null || iC == null || i20 == null) return fail();
        implB0 = b0;
        impl8 = i8;
        implC = iC;
        impl20 = i20;
        if (i20 !== 0) {
          const tag = readGuestU32(guestRead, (i20 + O.impl2010) >>> 0);
          if (tag == null) return fail();
          impl2010 = tag;
        }
      }
      let vtableClassBits = UPDATE_CAPTURE_ENTITY_SURFACE_CLASS_UNKNOWN;
      if (vptr === UPDATE_CAPTURE_ENTITY_SURFACE_VTABLE_DATA_UPDATE_T) {
        vtableClassBits = UPDATE_CAPTURE_ENTITY_SURFACE_CLASS_DATA_UPDATE_T;
      } else if (vptr === UPDATE_CAPTURE_ENTITY_SURFACE_VTABLE_LOBBY_DATA_UPDATE_T) {
        vtableClassBits = UPDATE_CAPTURE_ENTITY_SURFACE_CLASS_LOBBY_DATA_UPDATE_T;
      }
      slots.push({
        vtableClassBits,
        implPtr,
        implB0,
        impl8,
        implC,
        impl20,
        impl2010,
        netman2b4,
        globalC73680,
        globalC73694,
        globalC5ac00,
      });
      break; /* FIRST match per player (the machine's find) */
    }
  }
  /* Zero matched entries -> ABSENT (never publish an accept=0 "pure"
     proof for a dispatch that did not run). */
  if (slots.length === 0) return fail();

  const out = {};
  out.frameOpaque98dba0EntitySurfaceReady = 1;
  const fields = UPDATE_CAPTURE_ENTITY_SURFACE_SLOT_FIELDS;
  for (let i = 0; i < UPDATE_CAPTURE_ENTITY_SURFACE_MAX_SLOTS; i += 1) {
    const s = slots[i];
    if (!s) continue; /* unfilled slot stays absent (=> 0 after normalize) */
    const base = `frameOpaque98dba0EntitySurfaceCapture${i}`;
    const values = [
      s.vtableClassBits, s.implPtr, s.implB0, s.impl8, s.implC, s.impl20,
      s.impl2010, s.netman2b4, s.globalC73680, s.globalC73694, s.globalC5ac00,
    ];
    for (let f = 0; f < fields.length; f += 1) {
      out[`${base}${fields[f]}`] = values[f];
    }
  }
  return out;
}

/**
 * Per-tick bridge-side capture of the four §5 lane groups, READ-ONLY.
 *
 * @param {object} [options]
 * @param {DataView|null} [options.gameView] DataView over the session's
 *   Game buffer (READ-ONLY). null -> nothing is capturable ({}).
 * @param {((address: number, size: number) => Uint8Array|null)|null}
 *   [options.guestRead] Read-only guest-memory reader for everything
 *   outside the Game object (manager heap, BSS globals, player objects,
 *   manager payload blob). null -> every guest-homed group stays ready 0.
 * @param {number} [options.gamePointerValue] The runtime *[0xc71678]
 *   value (the captured Game object's own address; sidecar
 *   gamePointerValue). 0 when unknown — the laws only ADD it, so a 0 base
 *   keeps the decision algebra exact and only the host-consumer address
 *   prep would need the real value.
 * @param {number} [options.blueRoomDirection] The record-12 sink's arg1 —
 *   the 0x74d4a0 direction arg (pushed @0x6fdb6c). The Update sites pass
 *   -1 (SHELL_SITE_DIRECTION, v72/v73 pin), so the machine AL at the
 *   live sites is EXACTLY 0; the bridge keeps that edge by default and
 *   the browser-seam drives override for the state-decidable prefix.
 * @param {(() => Uint8Array|null)|null} [options.anm2LayerFlags] Host
 *   hook for the ANM2 load's per-layer [layer+0x30] load results (v8-wire
 *   capture; up to ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS low-bytes). null ->
 *   engineAnm2LoadgraphicsFlagReady stays 0.
 * @param {number|(() => number|null)|null} [options.midRestockOwner] Host-
 *   resolved record idx 39 outer-gate owner: the PE 0x00805412
 *   FirstCollectibleOwner(0x209, Game+0x1baa8, true) result truthiness
 *   (0/1; module law only tests != 0). The walk's HasCollectible leaf
 *   (0x007706e0) is a host call (deep 0x417870 branch may carry effects),
 *   so the seam must resolve it — the bridge NEVER derives it from
 *   memory. null/undefined or a hook returning null/undefined -> the
 *   whole mid-restock pack is ABSENT (desc_ready=0 -> MONOLITHIC host
 *   re-run byte-for-byte — ABI v108 capture-absence gate miss).
 * @returns {object} Flat runtime-inputs patch (EXACT RUNTIME_INPUTS_LAYOUT
 *   key names). Only the groups whose captures succeeded are emitted (each
 *   carries its ready gate 1); anything not captured is ABSENT (the
 *   normalize path turns absence into 0 — the byte-for-byte fallback).
 *   The record-0 walker group (hudStatWalkerPlayerA/B @14276/@14280,
 *   hudStatWalkerBFrame328 @14284, hudStatWalkProbe1Arg @14288) is
 *   emitted only when both double-block rows are readable through
 *   guestRead; b_frame328 additionally needs [B+0x328] in the guest map
 *   (skipped when B == 0 — the machine bails at 0x84ccb5).
 */
/* Greed-probe player-vector walk offsets (PE reads at the record seam):
   manager vector [mgr+0x1baa8]/[mgr+0x1baac] (4-byte element = player ptr),
   per-player fields +0x2c / +0x3bc / +0x161c (frame word) / +0x1e68
   (parent ptr) / +0x20a9 (low byte). */
const UPDATE_CAPTURE_GREED_PROBE_OFFSETS = Object.freeze({
  vecBegin: 0x1baa8,
  vecEnd: 0x1baac,
  f2c: 0x2c,
  f3bc: 0x3bc,
  frame161c: 0x161c,
  parent1e68: 0x1e68,
  byte20a9: 0x20a9,
});
const GREED_PROBE_MAX_PLAYERS = 8;

/**
 * Greed-probe capture pack — the raw player-vector walk rows for the
 * record's probe truth. READ-ONLY over guest memory; the vector lives at
 * [gamePointerValue+0x1baa8]/[+0x1baac] and every row field is a pinned PE
 * read. `parent_161c` is read ONLY when the parent pointer is nonzero (the
 * machine derefs it only on that arm); `parent_is_self` mirrors the exact
 * pointer-equality test. Negative span, over-cap (> 8), a null slot, or ANY
 * unresolved read leaves the WHOLE group ABSENT (ready gate 0 after
 * normalize -> the byte-for-byte monolith), per the §5 capture-absence
 * discipline.
 * @returns {object} Flat runtime-inputs patch (greedProbePackReady=1 +
 *   count + dense per-row lanes) or {} when not capturable.
 */
export function captureUpdateGreedProbe({
  gameView = null,
  guestRead = null,
  gamePointerValue = 0,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  const gp = gamePointerValue >>> 0;
  if (gp === 0) return {};
  const O = UPDATE_CAPTURE_GREED_PROBE_OFFSETS;
  const begin = readGuestU32(guestRead, (gp + O.vecBegin) >>> 0);
  const end = readGuestU32(guestRead, (gp + O.vecEnd) >>> 0);
  if (begin == null || end == null) return {};
  const count = ((end - begin) | 0) >> 2;
  if (count < 0 || count > GREED_PROBE_MAX_PLAYERS) return {};
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const e = readGuestU32(guestRead, (begin + i * 4) >>> 0);
    if (e == null || e === 0) return {};
    const f2c = readGuestU32(guestRead, (e + O.f2c) >>> 0);
    const f3bc = readGuestU32(guestRead, (e + O.f3bc) >>> 0);
    const self161c = readGuestU32(guestRead, (e + O.frame161c) >>> 0);
    const parentPtr = readGuestU32(guestRead, (e + O.parent1e68) >>> 0);
    const byte20a9 = readGuestU8(guestRead, (e + O.byte20a9) >>> 0);
    if (f2c == null || f3bc == null || self161c == null ||
        parentPtr == null || byte20a9 == null) return {};
    let parent161c = 0;
    if (parentPtr !== 0) {
      const p = readGuestU32(guestRead, (parentPtr + O.frame161c) >>> 0);
      if (p == null) return {};
      parent161c = p;
    }
    rows.push({
      f2c, f3bc, self161c, byte20a9,
      hasParent: parentPtr !== 0 ? 1 : 0,
      parent161c,
      parentIsSelf: parentPtr === e ? 1 : 0,
    });
  }
  const out = { greedProbePackReady: 1, greedProbeElemCount: count };
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    out[`greedProbeF2c${i}`] = r.f2c;
    out[`greedProbeF3bc${i}`] = r.f3bc;
    out[`greedProbeHasParent${i}`] = r.hasParent;
    out[`greedProbeParent161c${i}`] = r.parent161c;
    out[`greedProbeSelf161c${i}`] = r.self161c;
    out[`greedProbeParentIsSelf${i}`] = r.parentIsSelf;
    out[`greedProbeF20a9${i}`] = r.byte20a9;
  }
  return out;
}

/* B16 water-wire BLOB pack world layout: the MSVC std::map<int,..> action
   head slot [Game+0x1bbd8] (node _Left+0/_Parent+4/_Right+8/_Isnil+0xd/
   key+0x10 — PE 0x6f941d..0x6f947b), the Room source vector dwords
   +0x1b10..+0x1b1c then +0x1b24/+0x1b28 (the machine SKIPS +0x1b20), the
   Room desc lanes [Room+4]+0x44/+0x54, and the reused echo lanes. */
const UPDATE_CAPTURE_B16_BLOB_OFFSETS = Object.freeze({
  actionHeadSlot: 0x1bbd8,
  game183a0: 0x183a0,
  game269e9: 0x269e9,
  gameMode26584: 0x26584,
  gameDiff269c8: 0x269c8,
  gameAccC: 0xc,
  gameAcc26550: 0x26550,
  roomPtr18300: 0x18300,
  srcVec: Object.freeze([0x1b10, 0x1b14, 0x1b18, 0x1b1c, 0x1b24, 0x1b28]),
  desc4: 0x4,
  descFlags44: 0x44,
  descCell54: 0x54,
  ambient1d18: 0x1d18,
  widthC: 0xc,
  height10: 0x10,
  nodeLeft: 0x0,
  nodeParent: 0x4,
  nodeRight: 0x8,
  nodeIsnil: 0xd,
  nodeKey: 0x10,
});

/** MSVC map presence walk (lower-bound then key-equality), torn-read aware.
 *  @returns {0|1|null} null on ANY unresolved read. */
function guestActionMapHasKey(guestRead, headAddr, key) {
  const O = UPDATE_CAPTURE_B16_BLOB_OFFSETS;
  let node = readGuestU32(guestRead, (headAddr + O.nodeParent) >>> 0);
  if (node == null) return null;
  let resKey = null;
  for (let hops = 0; hops < 64 && node !== 0; hops += 1) {
    const isnil = readGuestU8(guestRead, (node + O.nodeIsnil) >>> 0);
    if (isnil == null) return null;
    if ((isnil & 0xff) !== 0) break;
    const k = readGuestU32(guestRead, (node + O.nodeKey) >>> 0);
    if (k == null) return null;
    if ((k | 0) < (key | 0)) {
      node = readGuestU32(guestRead, (node + O.nodeRight) >>> 0);
    } else {
      resKey = k;
      node = readGuestU32(guestRead, (node + O.nodeLeft) >>> 0);
    }
    if (node == null) return null;
    if (node === headAddr) break;
  }
  return resKey != null && (resKey | 0) === (key | 0) ? 1 : 0;
}

/**
 * §W31 record idx 36 B16 water-wire BLOB pack — walks the LIVE action map
 * for keys {0x38, 0x39, 0x40, 0x46}, applies the gate39 law (mode !=
 * 0x2c, SIGNED-odd stage < 8, difficulty 0), and samples the Room source
 * vector + desc lanes + reused echoes as ONE all-or-nothing group. A null
 * map head, null room, or ANY torn read leaves the group ABSENT (voucher
 * 0 after normalize -> the pre-v132 monolith).
 * @returns {object} Flat runtime-inputs patch or {}.
 */
export function captureUpdateB16Blob({
  gameView = null,
  guestRead = null,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  const O = UPDATE_CAPTURE_B16_BLOB_OFFSETS;
  const room = gameView.getUint32(O.roomPtr18300, true);
  if (room === 0) return {};
  const head = gameView.getUint32(O.actionHeadSlot, true);
  if (head === 0) return {};
  const has38 = guestActionMapHasKey(guestRead, head, 0x38);
  const has39 = guestActionMapHasKey(guestRead, head, 0x39);
  const has40 = guestActionMapHasKey(guestRead, head, 0x40);
  const has46 = guestActionMapHasKey(guestRead, head, 0x46);
  if (has38 == null || has39 == null || has40 == null || has46 == null) return {};
  /* gate39: mode word != 0x2c, stage word SIGNED-odd and < 8, diff 0. */
  const stage = gameView.getInt32(0x0, true);
  const mode = gameView.getUint32(O.gameMode26584, true);
  const diff = gameView.getUint32(O.gameDiff269c8, true);
  const gate39 = mode !== 0x2c && stage % 2 === 1 && stage < 8 && diff === 0;
  const maskA = (has38 ? 1 : 0) | (has39 && gate39 ? 2 : 0);
  /* Key 0x46 present REPLACES maskB with 0x7f (cmovne 0x6f96ec). */
  const maskB = has46 ? 0x7f : (has40 ? 2 : 0);
  const acc = (maskA | gameView.getUint32(O.gameAccC, true) |
    gameView.getUint32(O.gameAcc26550, true)) >>> 0;
  /* Guest Room lanes: the 6-dword source vector (machine skips +0x1b20). */
  const src = [];
  for (const off of O.srcVec) {
    const v = readGuestU32(guestRead, (room + off) >>> 0);
    if (v == null) return {};
    src.push(v);
  }
  const desc = readGuestU32(guestRead, (room + O.desc4) >>> 0);
  if (desc == null || desc === 0) return {};
  const gridFlags44 = readGuestU32(guestRead, (desc + O.descFlags44) >>> 0);
  const cellDword54 = readGuestU32(guestRead, (desc + O.descCell54) >>> 0);
  const ambient1d18 = readGuestU32(guestRead, (room + O.ambient1d18) >>> 0);
  const widthC = readGuestU32(guestRead, (room + O.widthC) >>> 0);
  const height10 = readGuestU32(guestRead, (room + O.height10) >>> 0);
  if (gridFlags44 == null || cellDword54 == null || ambient1d18 == null ||
      widthC == null || height10 == null) return {};
  return {
    waterB16BlobReady: 1,
    waterB16UnlockAcc: acc,
    waterB16UnlockClear: maskB,
    waterB16GameByte183a0: gameView.getUint32(O.game183a0, true),
    waterB16GameByte269e9: gameView.getUint32(O.game269e9, true),
    waterB16GameType0: gameView.getUint32(0, true),
    waterB16GameSubtype4: gameView.getUint32(4, true),
    waterB16Src1b10_0: src[0],
    waterB16Src1b10_1: src[1],
    waterB16Src1b10_2: src[2],
    waterB16Src1b10_3: src[3],
    waterB16Src1b10_4: src[4],
    waterB16Src1b10_5: src[5],
    waterB16GridFlags44: gridFlags44,
    waterB16CellDword54: cellDword54,
    /* Reused-capture echoes ride the same all-or-nothing group. */
    ambientRoom1d18: ambient1d18,
    b3b7WidthC: widthC,
    b3b7Height10: height10,
  };
}

/* B16 spawn-row pack Room offsets — exported: the tests build worlds from
   these exact values. */
export const UPDATE_CAPTURE_B16_SPAWN_ROOM_OFFSETS = Object.freeze({
  gridW: 0xc,
  gridH: 0x10,
  gridBase: 0x24,
  cellType4: 0x4,
});
const B16_SPAWN_HIT_CAP = 64;
const LAVA_DECAY_BITS = 0x3f6b851f; /* DAT_00baa3f4 */

/**
 * §W31 B16 spawn-row pack — the interior type-7 grid enumeration, gated on
 * the MODULE-TRUTH arms (roomB16NeedsType7Grid / roomB16NeedsLavaBandGrid
 * over the caller-supplied arm state). Both arms closed -> zero pack
 * WITHOUT a grid scan; an open arm walks the interior in PE order (outer x
 * ascending, inner y ascending) and records type-7 cell indices. Over-cap
 * (> 64 per arm) or any torn grid read leaves the group ABSENT.
 * @returns {object} Flat runtime-inputs patch or {}.
 */
export function captureUpdateB16SpawnRows({
  gameView = null,
  guestRead = null,
  armState = null,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  if (!armState || typeof armState !== "object") return {};
  const R = UPDATE_CAPTURE_B16_SPAWN_ROOM_OFFSETS;
  const room = gameView.getUint32(UPDATE_CAPTURE_B16_BLOB_OFFSETS.roomPtr18300, true);
  if (room === 0) return {};
  const w = readGuestU32(guestRead, (room + R.gridW) >>> 0);
  const h = readGuestU32(guestRead, (room + R.gridH) >>> 0);
  if (w == null || h == null) return {};
  const lavaPre = Math.fround(armState.lavaPre ?? 0);
  const lavaDecay = new Float32Array(new Uint32Array([LAVA_DECAY_BITS]).buffer)[0];
  const lavaPost = Math.fround(lavaPre * lavaDecay);
  const waterArm = roomB16NeedsType7Grid(
    armState.challenge0x123 | 0, armState.roomType8 | 0,
    Math.fround(armState.waterPre ?? 0), armState.descFlags44 >>> 0) === 1;
  const lavaArm = roomB16NeedsLavaBandGrid(lavaPre, lavaPost) === 1;
  let hits = [];
  if (waterArm || lavaArm) {
    for (let x = 1; x < (w | 0) - 1; x += 1) {
      for (let y = 1; y < (h | 0) - 1; y += 1) {
        const idx = y * (w | 0) + x;
        const slot = readGuestU32(guestRead, (room + R.gridBase + idx * 4) >>> 0);
        if (slot == null) return {};
        if (slot === 0) continue;
        const type = readGuestU32(guestRead, (slot + R.cellType4) >>> 0);
        if (type == null) return {};
        if (type === 7) {
          hits.push(idx);
          if (hits.length > B16_SPAWN_HIT_CAP) return {};
        }
      }
    }
  }
  const waterHits = waterArm ? hits : [];
  const lavaHits = lavaArm ? hits : [];
  const out = {
    waterB16SpawnRowsReady: 1,
    waterB16WaterHitCount: waterHits.length,
    waterB16LavaHitCount: lavaHits.length,
    waterB16GridWEcho: w,
    waterB16GridHEcho: h,
  };
  for (let k = 0; k < waterHits.length; k += 1) {
    out[`waterB16WaterHitCellIdx${k}`] = waterHits[k];
  }
  for (let k = 0; k < lavaHits.length; k += 1) {
    out[`waterB16LavaHitCellIdx${k}`] = lavaHits[k];
  }
  return out;
}

/* B1 rain shared-half row pack world offsets: decor vector bounds live in
   the GAME buffer ([Game+0x183a4]/[Game+0x183a8], 0x78-byte elements); the
   shuffle seed is the descriptor's [desc+0x58]; width/height are the
   Room's +0xc/+0x10 dwords. */
const UPDATE_CAPTURE_B1_RAIN_OFFSETS = Object.freeze({
  roomPtr18300: 0x18300,
  decorBegin183a4: 0x183a4,
  decorEnd183a8: 0x183a8,
  decorStride: 0x78,
  desc4: 0x4,
  descSeed58: 0x58,
  widthC: 0xc,
  height10: 0x10,
});
const B1_RAIN_ROW_CAP = 64;

/**
 * ABI v139 records idx13/idx35 B1 rain ROW pack — recomputes the spawn
 * rows from the LIVE sources: descriptor seed chain (both xorshift steps
 * per row), corner pick + world xy via the landed pure laws, spawn count
 * = UNSIGNED min(seam base (4/6/8 law), decor-vector count). Host-domain
 * outcome fields (search/create/bind) stay 0 — no bridge-side producer
 * (the B16 entity_ptr precedent). Missing seam state, a null room, zero
 * seed (xorshift fatal), over-cap, or ANY torn read leaves the WHOLE
 * group absent and EMPTY.
 * @returns {object} Flat runtime-inputs patch or {}.
 */
export function captureUpdateB1RainRows({
  gameView = null,
  guestRead = null,
  ownerState = null,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  if (typeof guestRead !== "function") return {};
  if (!ownerState || typeof ownerState !== "object") return {};
  const O = UPDATE_CAPTURE_B1_RAIN_OFFSETS;
  const room = gameView.getUint32(O.roomPtr18300, true);
  if (room === 0) return {};
  const begin = gameView.getUint32(O.decorBegin183a4, true);
  const end = gameView.getUint32(O.decorEnd183a8, true);
  const spanBytes = (end - begin) | 0;
  if (spanBytes < 0) return {};
  const decorCount = (spanBytes / O.decorStride) | 0;
  const desc = readGuestU32(guestRead, (room + O.desc4) >>> 0);
  if (desc == null || desc === 0) return {};
  const seed0 = readGuestU32(guestRead, (room ? (desc + O.descSeed58) : 0) >>> 0);
  if (seed0 == null || seed0 === 0) return {};
  const widthC = readGuestU32(guestRead, (room + O.widthC) >>> 0);
  const height10 = readGuestU32(guestRead, (room + O.height10) >>> 0);
  if (widthC == null || height10 == null) return {};
  const ownerNonzero = ownerState.ownerNonzero | 0;
  const base = roomB1SpawnBaseCount(ownerNonzero, ownerState.quality | 0) >>> 0;
  const count = Math.min(base, decorCount >>> 0);
  if (count > B1_RAIN_ROW_CAP) return {};
  const corners = roomB1CornerIndices(widthC | 0, height10 | 0);
  const out = {
    b1RainRowsReady: 1,
    b1RainSpawnCount: count,
    b1RainQualityEcho: base,
    b1RainOwnerNonzeroEcho: ownerNonzero !== 0 ? 1 : 0,
    b1RainDecorCountEcho: decorCount >>> 0,
    b1RainSeed0Echo: seed0 >>> 0,
  };
  let seed = seed0 >>> 0;
  for (let k = 0; k < count; k += 1) {
    const seedIn = seed;
    const shuffled = roomB1RngXorshift(seedIn) >>> 0;
    const seedOut = roomB1RngXorshift(shuffled) >>> 0;
    const pick = roomB1CornerPick(corners, seedOut);
    const xy = roomB1CornerWorldXy(pick, widthC | 0);
    const f32Bits = (v) =>
      new Uint32Array(new Float32Array([Math.fround(v)]).buffer)[0] >>> 0;
    out[`b1RainRow${k}IterIndex`] = k;
    out[`b1RainRow${k}ShuffleSeedIn`] = seedIn;
    out[`b1RainRow${k}ShuffleSeedOut`] = seedOut;
    out[`b1RainRow${k}CornerPick`] = seedOut & 3;
    out[`b1RainRow${k}WorldX`] = f32Bits(xy.x);
    out[`b1RainRow${k}WorldY`] = f32Bits(xy.y);
    /* Host-domain outcome lanes: no bridge-side producer -> zeros. */
    out[`b1RainRow${k}SearchOk`] = 0;
    out[`b1RainRow${k}SearchDraws`] = 0;
    out[`b1RainRow${k}CreateEntityPtr`] = 0;
    out[`b1RainRow${k}BindRepositioned`] = 0;
    out[`b1RainRow${k}BindReposDraws`] = 0;
    out[`b1RainRow${k}ReposX`] = 0;
    out[`b1RainRow${k}ReposY`] = 0;
    out[`b1RainRow${k}BindStore7764`] = 0;
    seed = seedOut;
  }
  return out;
}

export function captureUpdateLanes({
  gameView = null,
  guestRead = null,
  gamePointerValue = 0,
  blueRoomDirection = -1,
  anm2LayerFlags = null,
  midRestockOwner = null,
  b16ArmState = null,
  b1RainOwnerState = null,
} = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") return {};
  const out = {};

  /* ---- record-12 rewind seam (Game-buffer-homed scalars + slots) ---- */
  const slotIndex = gameView.getInt32(
    UPDATE_CAPTURE_GAME_OFFSETS.rewindSlotIndex676ac, true);
  out.rewind705ee0SlotIndex676ac = slotIndex;
  out.rewind705ee0GameTag0 = gameView.getInt32(
    UPDATE_CAPTURE_GAME_OFFSETS.rewindGameTag0, true);
  out.rewind705ee0GameFrame264f8 = gameView.getUint32(
    UPDATE_CAPTURE_GAME_OFFSETS.rewindGameFrame264f8, true);
  out.rewind705ee0Game18318 = gameView.getUint32(
    UPDATE_CAPTURE_GAME_OFFSETS.rewindGame18318, true);
  out.rewind705ee0GameBase = gamePointerValue >>> 0;
  /* The writer-domain closure: [Game+0x676ac] entries are {-1,0,1}; the
     machine derefs [newslot] only for the 0/1 slot records (slot0 at
     Game+0x269ec, slot1 at Game+0x4704c — both INSIDE the Game object, so
     the reads are in-buffer READ-ONLY). Any other index has no slot to
     read: the value lanes stay 0 (the -1 arm's reached law ignores them). */
  if (slotIndex === 0 || slotIndex === 1) {
    const slotBase = REWIND_705EE0_SLOT0_OFF + slotIndex * REWIND_705EE0_SLOT_STRIDE;
    out.rewind705ee0SlotValidByte =
      gameView.getUint8(slotBase + UPDATE_CAPTURE_REWIND_SLOT_FIELD_OFFSETS.validByte);
    out.rewind705ee0SlotRoom19d20 = gameView.getInt32(
      slotBase + UPDATE_CAPTURE_REWIND_SLOT_FIELD_OFFSETS.room19d20, true);
    out.rewind705ee0SlotTagE8 = gameView.getInt32(
      slotBase + UPDATE_CAPTURE_REWIND_SLOT_FIELD_OFFSETS.tagE8, true);
    out.rewind705ee0SlotArg1fe2c = gameView.getInt32(
      slotBase + UPDATE_CAPTURE_REWIND_SLOT_FIELD_OFFSETS.arg1fe2c, true);
    out.rewind705ee0SlotFrame1fe30 = gameView.getUint32(
      slotBase + UPDATE_CAPTURE_REWIND_SLOT_FIELD_OFFSETS.frame1fe30, true);
  } else {
    out.rewind705ee0SlotValidByte = 0;
    out.rewind705ee0SlotRoom19d20 = 0;
    out.rewind705ee0SlotTagE8 = 0;
    out.rewind705ee0SlotArg1fe2c = 0;
    out.rewind705ee0SlotFrame1fe30 = 0;
  }
  /* The record-12 ready lane names the 11 decision scalars (the rewind
     scalars + slots above). The payload blob has its OWN ready lane below:
     it is the S8 copy source for the host consumer, not a seam gate. The
     seam STILL needs the v72/v74 shell canopy vouchers — host-supplied
     (the bridge must not supply them; v74/v96 pins). */
  out.opaqueCall006fd7c0Ready = 1;

  /* ---- record-12 transition pack (ABI v99, update-v106: the wave-28
     bridge gap fix — C10 FAIL item 1). The K-block (emitFrameEffect6fd7c0-
     HostResiduals) arms packLive = opaqueCall006fd7c0Ready AND
     transition6fd7c0Ready @14324; without the 9 lanes the browser never
     feeds the pack and the 3 typed events @968/972/976 can never fire.
     ABI v107 (update-v107-record12-live): the five probe AL lanes are
     DRIVEN from the probes' PE source reads (update-v107-record12-live
     NOTES §1, objdump re-verified): alt_path 0x74bac0 = DWORD[Game+4]
     in {4,5} (FULL-DWORD cmp @0x74bac3/0x74bac8; call @0x6fd884);
     route 0x6f8120 = DWORD[Game+0x269c8] in {2,3} (FULL-DWORD cmp
     @0x6f8126/0x6f812b; call @0x6fd8ad, ecx=[0xc71678]); player_loop
     0x8279a0 = entity [[[Game+0x18300]+4]+0x10] with [ent]==0x23 &&
     [ent+8]==0x10 (call @0x6fd91d; GUEST chain — absent reads keep the
     lane 0, byte-for-byte); blue_room 0x74d4a0 = direction!=−1 (site
     arg1, pinned −1 = SHELL_SITE_DIRECTION) && currentIdx=[Game+0x18304]
     >=0 (signed @0x74d4e5) && [roomObj+0x44]&0x40000 (@0x74d4f9) where
     roomObj = 0x740bc0(−1, room) resolves to the FIXED in-buffer slot
     Game+0x16c7c (@0x740cee..0x740cfc) — the 0x82c7d0 creation tail is a
     host leaf beyond the state-decidable prefix (call @0x6fdb78);
     engine_pred 0x6f0070 = [Game+0x1b83c]!=0 && [Game+0x1b83c+0x238]!=0
     (call @0x6fdba6; this=Game+0x1b83c). The room-object reads
     ([[Game+0x18300]+8] type / [[[Game+0x18300]+4]+0x44] subroom flag)
     resolve through guestRead; absent reads keep 0. */
  /* game0 = [Game+0] (the Game mode word, cmp [Game+0],1 @0x6fd87f —
     the C arm needs mode == 1). */
  out.transition6fd7c0Game0 = gameView.getUint32(0, true);
  const altPathWord = gameView.getUint32(4, true);
  out.transition6fd7c0AltPathProbe =
    (altPathWord === 4 || altPathWord === 5) ? 1 : 0;
  const routeWord = gameView.getUint32(0x269c8, true);
  out.transition6fd7c0RouteProbe =
    (routeWord === 2 || routeWord === 3) ? 1 : 0;
  /* blueRoomDirection: the sink's arg1 (0x74d4a0 direction arg; pushed
     @0x6fdb6c). The Update sites pass −1 (SHELL_SITE_DIRECTION pin) so
     the machine AL is EXACTLY 0 at the live sites; the option exists for
     the browser-seam drives (default keeps the byte-exact edge). */
  const blueDirection = blueRoomDirection | 0;
  const blueCurrent = gameView.getInt32(0x18304, true);
  const blueRoomFlag = gameView.getUint32(0x16c7c + 0x44, true);
  out.transition6fd7c0BlueRoomProbe =
    (blueDirection === -1 || blueCurrent < 0 || (blueRoomFlag & 0x40000) === 0) ? 0 : 1;
  out.transition6fd7c0PlayerLoopProbe = 0;
  if (typeof guestRead === "function") {
    const roomPtr = gameView.getUint32(
      UPDATE_CAPTURE_GAME_OFFSETS.walkerRoom18300, true) >>> 0;
    if (roomPtr !== 0) {
      const typeBytes = guestRead((roomPtr + 8) >>> 0, 4);
      if (typeBytes && typeBytes.length >= 4) {
        out.transition6fd7c0RoomType8 =
          new DataView(typeBytes.buffer, typeBytes.byteOffset, 4).getUint32(0, true);
      }
      const descBytes = guestRead((roomPtr + 4) >>> 0, 4);
      if (descBytes && descBytes.length >= 4) {
        const descPtr = new DataView(descBytes.buffer, descBytes.byteOffset, 4)
          .getUint32(0, true);
        const flagBytes = guestRead((descPtr + 0x44) >>> 0, 4);
        if (flagBytes && flagBytes.length >= 4) {
          out.transition6fd7c0RoomSubroomFlag44 =
            new DataView(flagBytes.buffer, flagBytes.byteOffset, 4).getUint32(0, true);
        }
      }
      /* player-loop 0x8279a0: eax=[room+4]; eax=[eax+0x10]; AL = eax &&
         [eax]==0x23 && [eax+8]==0x10 (FULL-DWORD @0x8279a6..0x8279b3). */
      const entDesc = readGuestU32(guestRead, (roomPtr + 4) >>> 0);
      if (entDesc != null) {
        const entity = readGuestU32(guestRead, (entDesc + 0x10) >>> 0);
        if (entity != null && entity !== 0) {
          const entWord = readGuestU32(guestRead, entity >>> 0);
          const entType = readGuestU32(guestRead, (entity + 8) >>> 0);
          if (entWord != null && entType != null) {
            out.transition6fd7c0PlayerLoopProbe =
              (entWord === 0x23 && entType === 0x10) ? 1 : 0;
          }
        }
      }
    }
  }
  const engineHead = gameView.getUint32(0x1b83c, true);
  const engineTail = gameView.getUint32(0x1b83c + 0x238, true);
  out.transition6fd7c0EnginePredProbe =
    (engineHead !== 0 && engineTail !== 0) ? 1 : 0;
  out.transition6fd7c0Ready = 1;

  /* ---- record idx 23 clearPath flag-gate lane (W29-S4 feed; lane
     clearPathGameMode0 @7888, PE capture site 0x00804212 `mov
     eax,[edx]`). FULL-DWORD Game+0 mode word, read UNSIGNED; the module
     law applies the signed 1..6 range + bit16 of Game+0x2654c (state).
     Game-buffer-homed -> ALWAYS capturable, no voucher: an absent lane
     normalizes to 0, which IS the machine's default (mode 0 < 1 signed
     -> the CLEAR arm) — feed and residual are byte-for-byte the same. ---- */
  out.clearPathGameMode0 = gameView.getUint32(
    UPDATE_CAPTURE_GAME_OFFSETS.clearPathMode0, true);

  /* ---- record-12 payload blob (guest: *[0xc7169c]+0x2d0, 0x20b u32s) ---- */
  if (typeof guestRead === "function") {
    const managerBase = readGuestU32(guestRead, UPDATE_CAPTURE_MANAGER_OFFSETS.pointerSlot);
    if (managerBase != null) {
      const src = REWIND_705EE0_PAYLOAD_SRC_OFF;
      const bytes = guestRead((managerBase + src) >>> 0, REWIND_705EE0_PAYLOAD_WORDS * 4);
      if (bytes && bytes.length >= REWIND_705EE0_PAYLOAD_WORDS * 4) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const words = new Array(REWIND_705EE0_PAYLOAD_WORDS);
        for (let i = 0; i < REWIND_705EE0_PAYLOAD_WORDS; i += 1) {
          words[i] = view.getUint32(i * 4, true);
        }
        out.rewind705ee0PayloadBlobReady = 1;
        out.rewind705ee0PayloadBlobAddr = (managerBase + src) >>> 0;
        out.rewind705ee0PayloadBlob = words;
      }
    }
  }

  /* ---- record-10 true-probe SFX-manager blob (guest, 12 words) ---- */
  if (typeof guestRead === "function") {
    const managerBase = readGuestU32(guestRead, UPDATE_CAPTURE_MANAGER_OFFSETS.pointerSlot);
    if (managerBase != null) {
      const f18 = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.f18);
      const ebc = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.ebc);
      const field14 = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.field14);
      const field21618 = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.field21618);
      const field21620 = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.field21620);
      const field21624 = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.field21624);
      const field2161c = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.field2161c);
      const field29fb8 = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.field29fb8);
      const volumeBits = readGuestU32(guestRead, managerBase + UPDATE_CAPTURE_MANAGER_OFFSETS.volumeBits);
      if (
        f18 != null && ebc != null && field14 != null && field21618 != null &&
        field21620 != null && field21624 != null && field2161c != null &&
        field29fb8 != null && volumeBits != null
      ) {
        out.frameOpaque4212c0TrueProbeReady = 1;
        out.frameOpaque4212c0TrueProbeMgrBase = managerBase;
        out.frameOpaque4212c0TrueProbeMgrF18 = f18;
        out.frameOpaque4212c0TrueProbeMgrEbc = ebc;
        out.frameOpaque4212c0TrueProbeMgr14 = field14;
        out.frameOpaque4212c0TrueProbeMgr21618 = field21618;
        out.frameOpaque4212c0TrueProbeMgr21620 = field21620;
        out.frameOpaque4212c0TrueProbeMgr21624 = field21624;
        out.frameOpaque4212c0TrueProbeMgr2161c = field2161c;
        out.frameOpaque4212c0TrueProbeMgr29fb8 = field29fb8;
        out.frameOpaque4212c0TrueProbeVolumeBits = volumeBits;
        /* The ucomiss 0xbaa454 gate is a BIT-EXACT 1.0f compare (record-10
           R2 §1.1: NaN and -0.0 can never equal 0x3f800000). */
        out.frameOpaque4212c0TrueProbeVolumeEqOne =
          volumeBits === GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS ? 1 : 0;
      }
    }
  }

  /* ---- record-0 walker capture group (ABI v97 lanes @14276..14292,
     guest-homed reads). The 0x84cc40 walker's swap args (A/B) ARE the
     StatHUD double-block player ptrs: the swap bodies push [ebx+8]/
     [ebx+0xc] (0x9bef22/0x9bef09, twins 0x9bf3cc/0x9bf3cb) and the
     walker compares arg A against its own rows [this+i*0xcc+0x114]
     (0x84cc9d; this = Game+0x233a8) — the rows are the in-buffer
     storage of the very players the swap walks. The row reads +
     [Game+0x18300] resolve inside the seeded Game buffer via
     gamePointerValue; the [B+0x328] deref (0x84ccc8) needs B's player
     object in the host's guest map and is SKIPPED when B == 0 (the
     machine bails at 0x84ccb5 `test edx,edx / je`). The module's walker
     probe events @956/960/964 fire only when player_a|player_b != 0
     (capture live); any failed read leaves the lane ABSENT (= 0 after
     normalize — the byte-for-byte fallback). */
  if (typeof guestRead === "function") {
    const o = UPDATE_CAPTURE_GAME_OFFSETS;
    const row0 = (gamePointerValue + o.walkerStatHudBase + o.walkerRowPlayerOff) >>> 0;
    const row1 = (row0 + o.walkerRowStride) >>> 0;
    const walkerA = readGuestU32(guestRead, row0);
    const walkerB = readGuestU32(guestRead, row1);
    if (walkerA != null && walkerB != null) {
      out.hudStatWalkerPlayerA = walkerA;
      out.hudStatWalkerPlayerB = walkerB;
      if (walkerB !== 0) {
        const bFrame328 = readGuestU32(guestRead, (walkerB + o.walkerBFrame328) >>> 0);
        if (bFrame328 != null) out.hudStatWalkerBFrame328 = bFrame328;
      }
      const probe1Arg = readGuestU32(guestRead, (gamePointerValue + o.walkerRoom18300) >>> 0);
      if (probe1Arg != null) out.hudStatWalkProbe1Arg = probe1Arg;
    }
  }

  /* ---- record-4 SFX-manager store-plan pack (guest globals + Game
     fields + player-entry rows). The v87 gate lanes (ready/mode @6708/
     @6712) and the gate1b83c state remain HOST-owned — the pack safe-
     guards the seam by itself (pack_ready + mode from the host). ---- */
  const engineField28 = gameView.getUint32(
    UPDATE_CAPTURE_GAME_OFFSETS.engineField28, true);
  const engineByte7c = gameView.getUint8(UPDATE_CAPTURE_GAME_OFFSETS.engineByte7c);
  const listBegin = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.playerListBegin, true);
  const listEnd = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.playerListEnd, true);
  const count = (listEnd - listBegin) / 4;
  let packReady = 0;
  if (typeof guestRead === "function" && count >= 0 && count <= ENGINE_PLAYER_MAX &&
      Number.isInteger(count)) {
    const g798e4 = readGuestU32(guestRead, UPDATE_CAPTURE_SFX_GLOBAL_ADDRESSES.global798e4);
    const g79948 = readGuestU32(guestRead, UPDATE_CAPTURE_SFX_GLOBAL_ADDRESSES.global79948);
    const g79790 = readGuestU32(guestRead, UPDATE_CAPTURE_SFX_GLOBAL_ADDRESSES.global79790);
    const g7978c = readGuestU32(guestRead, UPDATE_CAPTURE_SFX_GLOBAL_ADDRESSES.global7978c);
    /* Row stems MUST match RUNTIME_INPUTS_LAYOUT casing exactly
       (B173/B1398/B139a/B171/W410/W3fc/Ptr7c/B34/B88/W1600/W418/W16c) —
       a lowercase stem silently never reaches the module (silent-zero
       class: unknown runtime keys are dropped by the layout write). */
    const rows = {
      B173: new Array(ENGINE_PLAYER_MAX).fill(0),
      B1398: new Array(ENGINE_PLAYER_MAX).fill(0),
      B139a: new Array(ENGINE_PLAYER_MAX).fill(0),
      B171: new Array(ENGINE_PLAYER_MAX).fill(0),
      W410: new Array(ENGINE_PLAYER_MAX).fill(0),
      W3fc: new Array(ENGINE_PLAYER_MAX).fill(0),
      Ptr7c: new Array(ENGINE_PLAYER_MAX).fill(0),
      B34: new Array(ENGINE_PLAYER_MAX).fill(0),
      B88: new Array(ENGINE_PLAYER_MAX).fill(0),
      W1600: new Array(ENGINE_PLAYER_MAX).fill(0),
      W418: new Array(ENGINE_PLAYER_MAX).fill(0),
      W16c: new Array(ENGINE_PLAYER_MAX).fill(0),
    };
    let rowsOk = g798e4 != null && g79948 != null && g79790 != null && g7978c != null;
    for (let i = 0; i < count && rowsOk; i += 1) {
      const entryPtr = readGuestU32(guestRead, (listBegin + i * 4) >>> 0);
      if (entryPtr == null) {
        rowsOk = false;
        break;
      }
      if (entryPtr === 0) continue; /* NULL slot -> all-zero row (§3a) */
      const o = UPDATE_CAPTURE_PLAYER_ENTRY_OFFSETS;
      rows.B173[i] = readGuestU8(guestRead, entryPtr + o.b173);
      rows.B1398[i] = readGuestU8(guestRead, entryPtr + o.b1398);
      rows.B139a[i] = readGuestU8(guestRead, entryPtr + o.b139a);
      rows.B171[i] = readGuestU8(guestRead, entryPtr + o.b171);
      rows.W410[i] = readGuestU16(guestRead, entryPtr + o.w410);
      rows.W3fc[i] = readGuestU32(guestRead, entryPtr + o.w3fc);
      rows.Ptr7c[i] = readGuestU32(guestRead, entryPtr + o.ptr7c);
      rows.B34[i] = readGuestU8(guestRead, entryPtr + o.b34);
      rows.B88[i] = readGuestU8(guestRead, entryPtr + o.b88);
      rows.W1600[i] = readGuestU16(guestRead, entryPtr + o.w1600);
      rows.W418[i] = readGuestU16(guestRead, entryPtr + o.w418);
      rows.W16c[i] = readGuestU16(guestRead, entryPtr + o.w16c);
      if (Object.values(rows).some((arr) => arr[i] == null)) rowsOk = false;
    }
    if (rowsOk) {
      packReady = 1;
      out.opaque8318a0SfxGlobal798e4 = g798e4;
      out.opaque8318a0SfxGlobal79948 = g79948;
      out.opaque8318a0SfxGlobal79790 = g79790;
      out.opaque8318a0SfxGlobal7978c = g7978c;
      out.opaque8318a0EngineField28 = engineField28;
      out.opaque8318a0EngineByte7c = engineByte7c;
      out.opaque8318a0PlayerEntryReady = 1;
      out.opaque8318a0PlayerEntryCount = count;
      for (const [stem, arr] of Object.entries(rows)) {
        out[`opaque8318a0PlayerEntry${stem}`] = arr;
      }
    }
  }

  /* ---- record-22 ANM2::Load pre-lane host half (Game buffer + the ANM2
     load's per-layer flags). The v77 vouchers (blob/latch/layer names)
     stay host-owned (v75/v77 pins). ---- */
  out.engineAnm2FilenameReady = 1;
  out.engineAnm2FilenamePtr = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.filenamePtr, true);
  out.engineAnm2FilenameSize = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.filenameSize, true);
  out.engineAnm2FilenameCap = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.filenameCap, true);
  out.engineAnm2AnimReady = 1;
  out.engineAnm2AnimFirstPre = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.animFirstPre, true);
  out.engineAnm2AnimSecondPre = gameView.getUint32(UPDATE_CAPTURE_GAME_OFFSETS.animSecondPre, true);
  if (typeof anm2LayerFlags === "function") {
    const flags = anm2LayerFlags();
    if (flags && flags.length > 0) {
      const n = Math.min(flags.length, ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS);
      const row = new Array(ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS).fill(0);
      for (let i = 0; i < n; i += 1) row[i] = flags[i] & 0xff;
      out.engineAnm2LoadgraphicsFlagReady = 1;
      out.engineAnm2LoadgraphicsFlags = row;
    }
  }

  /* ---- record idx 15 B3B7 law pack (W29-S2; update-v107-record15-
     capture): the sparse cells (872..896) + the 38-row pack (8008..9956)
     raised via b3b7SparseReady BEFORE resume. Any unresolved read leaves
     the group ABSENT -> ready 0 -> the pre-v48 monolith (byte-for-byte).
     ---- */
  Object.assign(out, captureUpdateB3b7({ gameView, guestRead, gamePointerValue }));

  /* ---- record idx 39 mid-restock desc pack (update-v108-record39-removal;
     PE 0x00805408..0x008054a4, Room::Update mid-tail). Runtime rows:
     midRestockOwner0x209 @692 (row 173), midRestockDescReady/Ac/Ae/Seed58
     @828..840 (rows 207..210). Room word source = [Game+0x18300] (the
     clearPath/record-0 precedent; PE 0x84d188 twin). desc = [Room+4]
     (RoomDescriptor), fields desc+0xac int16 (signed), desc+0xae int16
     (signed; the ONLY game-visible store, PE 0x008054a4), desc+0x58
     FULL-DWORD seed (PE 0x0080546b; seed==0 -> RNG::RandomInt fatal
     0x007e9033/0xa112c0 -> typed drop @984, WIDE != 0 not fatal).
     The owner lane is the PE 0x00805412 FirstCollectibleOwner(0x209,
     Game+0x1baa8, true) result truthiness — a live player walk whose
     HasCollectible leaf (0x007706e0) is HOST (address-stable; deep
     0x417870 branch may carry effects), so the seam supplies it through
     the midRestockOwner option (number or () => 0|1|null); the bridge
     NEVER derives it from memory. ALL-OR-NOTHING contract: the owner
     hook must resolve AND roomPtr != 0 AND every desc read must succeed,
     else NO lane is emitted (normalize -> 0 -> desc_ready=0 ->
     MONOLITHIC host re-run, byte-for-byte — the removal theorem's
     capture-absence gate miss). With the pack present the module law is
     EXACT: outer gate closed -> NONE; inner short gate closed -> NONE;
     seed==0 -> typed drop (no coarse); else PURE_COMPLETE (no coarse) —
     coarse opaqueRoomUpdateTailMidRestock @220 can NEVER fire under
     full capture. ---- */
  if (typeof guestRead === "function") {
    const ownerValue =
      typeof midRestockOwner === "function" ? midRestockOwner() : midRestockOwner;
    if (ownerValue != null) {
      const roomPtr = gameView.getUint32(
        UPDATE_CAPTURE_GAME_OFFSETS.walkerRoom18300, true) >>> 0;
      if (roomPtr !== 0) {
        const descPtr = readGuestU32(guestRead, (roomPtr + 4) >>> 0);
        if (descPtr != null && descPtr !== 0) {
          const descAc = readGuestU16(guestRead, (descPtr + 0xac) >>> 0);
          const descAe = readGuestU16(guestRead, (descPtr + 0xae) >>> 0);
          const descSeed = readGuestU32(guestRead, (descPtr + 0x58) >>> 0);
          if (descAc != null && descAe != null && descSeed != null) {
            out.midRestockOwner0x209 = (ownerValue >>> 0) !== 0 ? 1 : 0;
            out.midRestockDescReady = 1;
            out.midRestockDescAc = descAc;
            out.midRestockDescAe = descAe;
            out.midRestockDescSeed58 = descSeed;
          }
        }
      }
    }
  }

  /* ---- record idx 42 tail-path capture (B19 0x008055a7..0x00806043 +
     B20 0x0080608e..0x008068a1; ABI v95 wire): the container begin/end
     pair (guest BSS), the [Game+0x26614] mode and the pass1/pass2 entity
     packs. Absent reads / over-cap span keep the group ABSENT (= 0 after
     normalize -> the pre-v95 monolith byte-for-byte). ---- */
  Object.assign(out, captureUpdateTailPath({ gameView, guestRead }));

  /* ---- record idx 5/32 entity-surface pack (W30-S2; update-v108-entity-
     surface-impl NOTES §1): the 98dba0 walk's matched-MP-entry surfaces
     (ready latch @14328 + 8 x 44 B blobs @14332..14684 — ABI v99 merge).
     Player span in-buffer, MP span + surfaces guest-homed; ANY unresolved
     read / > 8 matches / zero matches -> the group stays ABSENT (ready 0
     -> the pre-pack walk surface byte-for-byte). ---- */
  Object.assign(out, captureUpdateEntitySurface({ gameView, guestRead }));

  /* ---- §W31 greed-probe walk + B16 blob/spawn packs + B1 rain rows.
     Each pack is its own all-or-nothing group: a torn read in one leaves
     ONLY that pack absent. The spawn/rain packs additionally require
     their caller-supplied seam state (module-truth arm state / owner
     seam) — absent state keeps that voucher quiet, byte-for-byte. ---- */
  if (typeof guestRead === "function") {
    Object.assign(out, captureUpdateGreedProbe({ gameView, guestRead, gamePointerValue }));
    Object.assign(out, captureUpdateB16Blob({ gameView, guestRead }));
    if (b16ArmState) {
      Object.assign(out, captureUpdateB16SpawnRows({ gameView, guestRead, armState: b16ArmState }));
    }
    if (b1RainOwnerState) {
      Object.assign(out, captureUpdateB1RainRows({ gameView, guestRead, ownerState: b1RainOwnerState }));
    }
  }

  return out;
}

/**
 * @param {object} [options]
 * @param {(msg: string, cls?: string) => void} [options.log]
 * @param {string} [options.wasmUrl]
 * @param {boolean} [options.loadPureRoots=true] Load every freestanding pure
 *   helper family (multi-root PE-ban path). Missing pure Wasm is non-fatal;
 *   Update still runs native.
 * @param {boolean} [options.loadRenderRoot=true] Load the Game::Render root
 *   slice and drive it per frame. Missing/stale-ABI module is non-fatal.
 * @param {string} [options.renderSliceUrl] Render root-slice Wasm URL/path.
 * @param {object|Function} [options.renderHost] Render host handler installed
 *   before the first render tick (same contract as setRenderHost). Defaults to
 *   the counting residual handler from createRenderHostHandler().
 * @param {boolean} [options.loadExitRoot=true] Drive the Game::Exit ROOT PLAN
 *   step per frame (wasm-backed runExitRootPlan over the exit pure-helper
 *   module). No Exit root slice exists (family header: "Not an Exit slice
 *   ABI"), so this is a plan-step wiring. Missing module is non-fatal.
 * @returns {Promise<{
 *   mode: string,
 *   usesX86Emulation: boolean,
 *   session: object|null,
 *   host: object|null,
 *   slice: object|null,
 *   multiRoot: object|null,
 *   gameObject: Uint8Array|null,
 *   renderSession: object|null,
 *   renderSlice: object|null,
 *   renderMode: string,
 *   renderHost: object|Function|null,
 *   exitSession: object|null,
 *   exitMode: string,
 *   exitErrors: number,
 *   tick: (time?: number, extraRuntime?: object|null, statePatch?: object|null) => object|null,
 *   setUpdateCapture: (options: object|null) => object|null,
 *   updateCapture: object|null,
 *   renderTick: (time?: number) => object|null,
 *   exitTick: (time?: number) => object|null,
 *   setRenderHost: (handler: object|Function|null) => object|Function|null,
 *   setRenderInputs: (providerOrObject: object|Function|null) => object|Function|null,
 *   setRenderRecapture: (fn: Function|null) => Function,
 *   setExitInputs: (providerOrObject: object|Function|null) => object|Function|null,
 *   renderStats: object,
 *   exitStats: object,
 * }>}
 */
export async function bootNativeUpdateBridge({
  log = () => {},
  wasmUrl = BROWSER_SLICE_WASM_URL,
  preferNative = true,
  loadPureRoots = true,
  loadRenderRoot = true,
  renderSliceUrl = BROWSER_RENDER_SLICE_WASM_URL,
  renderHost: initialRenderHost = null,
  loadExitRoot = true,
} = {}) {
  let slice = null;
  let wasmAvailable = false;
  try {
    slice = await loadGameUpdateSliceWasm(wasmUrl);
    wasmAvailable = true;
    log(`native Update slice loaded abi=${slice.abiVersion} source=${slice.source}`);
  } catch (error) {
    log(`native Update slice unavailable: ${error.message}`, "err");
  }

  const mode = selectFramePath({ preferNative, wasmAvailable });
  if (isX86EmulationFramePath(mode)) {
    log("frame path: emulator-x86 (native slice not selected)");
    return {
      mode,
      usesX86Emulation: true,
      session: null,
      host: null,
      slice: null,
      multiRoot: null,
      gameObject: null,
      renderSession: null,
      renderSlice: null,
      renderMode: FRAME_PATH_MODE.EMULATOR_X86,
      renderHost: null,
      exitSession: null,
      exitMode: FRAME_PATH_MODE.EMULATOR_X86,
      exitErrors: 0,
      tick: () => null,
      renderTick: () => null,
      exitTick: () => null,
      setRenderHost: () => null,
      setRenderInputs: () => null,
      setRenderRecapture: () => null,
      setExitInputs: () => null,
      renderInputDefaults: () => createDefaultRenderInputs(),
      exitInputDefaults: () => createDefaultExitRootInputs(),
      renderStats: {
        available: false,
        mode: FRAME_PATH_MODE.EMULATOR_X86,
        ticks: 0,
        errors: 0,
        continuationKind: null,
        steps: 0,
        hostKinds: null,
        hostTotals: null,
        inputsSupplied: false,
      },
      exitStats: {
        available: false,
        mode: FRAME_PATH_MODE.EMULATOR_X86,
        ticks: 0,
        errors: 0,
        wired: false,
        entryActive: false,
        eventCount: 0,
        hostKinds: null,
        hostTotals: null,
        inputsSupplied: false,
      },
    };
  }

  // Residual HostHandler executes native residual bodies (no PE). Platform/IO
  // kinds no-op after count; game-logic residuals are recorded for peels.
  const host = createResidualHostHandler({
    onEvent: (event, result) => {
      if (event.count > 0 && result?.platformIo) {
        // Lua unref / presentation — platform/IO OK long residual.
      }
    },
  });
  // Session owns a GAME_OBJECT_MIN_SIZE buffer: capture → native Update →
  // residual bodies → apply sparse fields each rAF tick.
  /* Record-16 B8 capture-feed state (W30-S3; update-v108-record16-b8-
     bridge NOTES §3): b8Stash carries the per-tick capture (grid arrays +
     site) from tick() to the resume seam; b8Filled says the seam hook
     actually wrote the scratch (the per-tick isaac_game_update_slice_
     reset_scratch zeroes it at tick start, so the fill must happen right
     before the resume_room_update_prefix_b2 continuation). */
  let b8Stash = null;
  let b8Filled = false;
  const b8RecaptureAfter = (kind) => {
    if (kind !== "roomUpdatePrefixB2" || !b8Stash) return {};
    b8Filled = fillUpdateB8Scratch({ slice, capture: b8Stash }) > 0;
    return {};
  };
  /* Live loop runs the wasm-only fast driver: the JS-oracle lockstep is
     verification machinery (measured ~16 ms/tick in-browser vs ~1 µs for the
     wasm step) and its coverage lives in decomp:verify-slice. `?lockstep=1`
     re-enables the per-tick oracle for debugging a live divergence. */
  const lockstep =
    typeof location !== "undefined" &&
    /[?&]lockstep=1\b/.test(location.search || "");
  const session = createNativeUpdateSession(slice, {
    onHostEvent: host,
    recaptureAfter: b8RecaptureAfter,
    lockstep,
  });
  /* §5 live-wiring: per-tick READ-ONLY capture lanes (record-10 manager
     blob, record-4 pack, record-22 pre-lane half, record-12 payload) —
     installed via setUpdateCapture; null = capture off (ready gates 0). */
  let updateCapture = null;

  /* ABI v104 (update-v104-record4-apply): the bridge-owned absolute-
     addressed snapshot region of the captured Game snapshot's sfx-manager
     BSS span (0xc7978c..0xc7994c) — the WRITE surface of the record-4
     store-plan application arm (element=0 rows land here at their absolute
     BSS addresses; element=1 rows go to the residual node via the standing
     host path). Zeroed until a fired plan writes it. */
  const sfxManagerBssSnapshot = new Uint8Array(UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE);
  const sfxManagerBssView = new DataView(
    sfxManagerBssSnapshot.buffer,
    sfxManagerBssSnapshot.byteOffset,
    sfxManagerBssSnapshot.byteLength,
  );

  // Multi-root pure helpers: freestanding zero-import Wasm for non-Update roots.
  // Selection never routes through PE when a pure module is available. These are
  // pure islands (not full root slices); residual game-logic still peels.
  let multiRoot = null;
  if (loadPureRoots) {
    try {
      const roots = await loadFramePathRoots({
        preferNative,
        updateAvailable: true,
        // Primary roots plus every companion pure family. A missing or
        // stale-ABI companion is non-fatal and never gates the Update tick.
        modules: [...ALL_PURE_HELPER_IDS],
      });
      multiRoot = createMultiRootFrameSession({ updateSession: session, roots });
      const nativeRoots = Object.entries(multiRoot.modes || {})
        .filter(([key, m]) => /^[a-z]/.test(key) && m === FRAME_PATH_MODE.NATIVE_WASM)
        .map(([id]) => id);
      const emuRoots = Object.entries(multiRoot.modes || {})
        .filter(([key, m]) => /^[a-z]/.test(key) && m === FRAME_PATH_MODE.EMULATOR_X86)
        .map(([id]) => id);
      log(
        `multi-root modes: native=[${nativeRoots.join(",") || "none"}]` +
          (emuRoots.length ? ` pending=[${emuRoots.join(",")}]` : ""),
      );
    } catch (error) {
      log(`multi-root pure helpers unavailable: ${error.message}`, "err");
    }
  }

  /* ---------------------------------------------------------------------
   * Game::Render root slice on its OWN *(Game+0x18300) buffer.
   *
   * The host handler is swappable at runtime (setRenderHost) so a real GL
   * host can be installed after boot without rebuilding the session: the
   * session is given a stable trampoline that always dispatches to the
   * CURRENT handler. Default is the counting residual handler (records
   * host-event totals; draws nothing, never enters PE).
   * ------------------------------------------------------------------- */
  let renderHost = initialRenderHost ?? createRenderHostHandler();
  const renderHostTrampoline = (detail) => {
    const callable = renderHostCallable(renderHost);
    return callable ? callable(detail) : undefined;
  };

  /* ---------------------------------------------------------------------
   * Render runtime inputs — HOST-SIDE GUEST-MEMORY MODEL, NOT RECOVERED PE
   * BEHAVIOUR.
   *
   * The render slice reads absolute guest addresses (manager option bytes at
   * [*0xc7169c+0x2a3c3], manager words at [*0xc71678], DAT globals, RT stack
   * depth, the Manager+0x1bbd8 presence map, Room* derefs). In the PE those
   * come from live guest RAM; this bridge has no live PE sparse bridge, so a
   * caller must supply them. They are a stand-in for that bridge and carry no
   * recovered-behaviour authority.
   *
   * The DEFAULT IS ALL ZEROS (createDefaultRenderInputs). With zeroed inputs
   * the G0 gate is closed and the chain walks only the epilog hosts — nothing
   * is drawn. No gameplay value is hardcoded here on purpose: opening the gate
   * is the caller's job via setRenderInputs().
   * ------------------------------------------------------------------- */
  let renderInputsProvider = null;
  let renderRecapture = defaultRenderRecapture;
  const renderRecaptureTrampoline = (kind, ctx) => renderRecapture(kind, ctx) || {};

  /** Resolve this frame's render input overrides (merged over the zero defaults). */
  function resolveRenderInputs(frameInfo) {
    if (renderInputsProvider == null) return null;
    const overrides =
      typeof renderInputsProvider === "function"
        ? renderInputsProvider(frameInfo)
        : renderInputsProvider;
    return overrides && typeof overrides === "object" ? overrides : null;
  }

  let renderSlice = null;
  let renderSession = null;
  let renderMode = FRAME_PATH_MODE.EMULATOR_X86;
  /* The render root object *(Game+0x18300), owned here and seedable by the
     caller from a captured render-root snapshot. Zeroed = empty scene. */
  const renderGameObject = new Uint8Array(GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  if (loadRenderRoot) {
    try {
      renderSlice = await loadGameRenderSliceWasm(renderSliceUrl);
      renderSession = createNativeRenderSession(renderSlice, {
        /* SEPARATE buffer — the render root is NOT the Game object.
           Both PE callers of the render shell do:
               mov edi,[0xc71678]      ; g_Game
               mov ecx,[edi+0x18300]   ; <- the render receiver
               call 0x0080ea80
           (VA 0x00831630 and 0x00831e37), so gridW@0x0c, gridH@0x10,
           camera@0x1204, entityArray@0x125c and entityCount@0x1264 belong to
           *(Game+0x18300), a distinct 0x3bb20 object. Passing the Game buffer
           here reads those as zeros and is byte-for-byte indistinguishable
           from an empty scene — which is exactly what it used to do. */
        gameObject: renderGameObject,
        onHostEvent: renderHostTrampoline,
        // Stable trampolines so the host / recapture / inputs can be swapped
        // at runtime without rebuilding the session.
        recapture: renderRecaptureTrampoline,
      });
      renderMode = FRAME_PATH_MODE.NATIVE_WASM;
      log(
        `native Render root slice loaded abi=${renderSlice.abiVersion} ` +
          `source=${renderSlice.source} (own render-root buffer *(Game+0x18300))`,
      );
    } catch (error) {
      renderSlice = null;
      renderSession = null;
      renderMode = FRAME_PATH_MODE.EMULATOR_X86;
      // Non-fatal by contract: the Update tick keeps running PE-free.
      log(`native Render root slice unavailable: ${error.message}`, "err");
    }
  }

  /* ---------------------------------------------------------------------
   * Game::Exit ROOT PLAN step (wasm-backed runExitRootPlan).
   *
   * The family header is explicit: "Not an Exit slice ABI" — Game::Exit is
   * not a capture/step/resume slice, so there is no ROOT_SLICE_MODULES.exit
   * and no JS-owned exit buffer. The wired step runs the root plan once per
   * frame over the exit pure-helper module (multiRoot.helpers.exit), the SAME
   * exports the family tests differential-verify (exitRootWasmPure). The
   * plan's 12 inputs are live PE guest-memory fields (Game + Manager); this
   * bridge has no live sparse bridge for them, so they are caller-supplied
   * via setExitInputs and the all-zero default closes the entry gate (no exit
   * in progress) — mirroring the Render root's zero-input default. Missing
   * module is NON-FATAL and never opens x86 PE emulation.
   * ------------------------------------------------------------------- */
  let exitSession = null;
  let exitMode = FRAME_PATH_MODE.EMULATOR_X86;
  let exitInputsProvider = null;
  let exitErrors = 0;
  if (loadExitRoot) {
    try {
      const exitModule = multiRoot?.helpers?.exit ?? null;
      if (!exitModule) {
        // Non-fatal by contract: the Update tick keeps running PE-free.
        log(
          "native Exit root plan unavailable (exit pure module not loaded); Update tick unaffected",
          "err",
        );
      } else {
        exitSession = createExitRootSession({
          pure: exitRootWasmPure(exitModule.wasm),
          onHostEvent: host,
        });
        exitMode = FRAME_PATH_MODE.NATIVE_WASM;
        log(
          `native Exit root plan wired abi=${exitModule.abiVersion} ` +
            `(per-frame plan step, no x86 PE)`,
        );
      }
    } catch (error) {
      exitSession = null;
      exitMode = FRAME_PATH_MODE.EMULATOR_X86;
      // Non-fatal by contract: the Update tick keeps running PE-free.
      log(`native Exit root plan unavailable: ${error.message}`, "err");
    }
  }

  /** Resolve this frame's Exit plan input overrides (merged over the zero
   *  defaults). null closes the entry gate (no exit in progress). */
  function resolveExitInputs(frameInfo) {
    if (exitInputsProvider == null) return null;
    const overrides =
      typeof exitInputsProvider === "function"
        ? exitInputsProvider(frameInfo)
        : exitInputsProvider;
    return overrides && typeof overrides === "object" ? overrides : null;
  }

  /* One render tick per frame, at most once per (updateTicks, time) pair.
     tick() drives it so app.js gets per-frame rendering for free; an explicit
     renderTick(time) from the same frame returns the cached result instead of
     driving the chain twice. A non-finite `time` always drives. */
  let lastRenderKey = null;
  let lastRenderResult = null;
  let renderErrors = 0;

  function driveRenderFrame(time) {
    if (!renderSession) return null;
    const key = Number.isFinite(time) ? `${session.ticks}:${time}` : null;
    if (key !== null && key === lastRenderKey) return lastRenderResult;
    try {
      const overrides = resolveRenderInputs({
        time,
        updateTicks: session.ticks,
        renderTicks: renderSession.ticks,
        /* The buffer the render slice actually reads: *(Game+0x18300), NOT the
           Game object. A provider deriving inputs from the Game buffer would
           read gridW/gridH/entityCount as zeros. */
        gameObject: renderGameObject,
        updateGameObject: session.gameObject,
      });
      // Overrides merge over createDefaultRenderInputs() inside the session.
      const result = renderSession.tick(overrides);
      // Surface host-event totals even when a custom handler owns dispatch
      // (the driver leaves result.hostTotals null in that case).
      lastRenderResult =
        result && result.hostTotals == null
          ? { ...result, hostTotals: renderHost?.totals ?? null }
          : result;
    } catch (error) {
      renderErrors += 1;
      if (renderErrors === 1) {
        log(`native Render tick error (Update tick unaffected): ${error.message}`, "err");
      }
      lastRenderResult = null;
    }
    lastRenderKey = key;
    return lastRenderResult;
  }

  /* One Exit root step per frame, at most once per (updateTicks, time) pair —
     driven from tick() alongside driveRenderFrame. A missing exit session is
     non-fatal and yields null, never PE. */
  let lastExitKey = null;
  let lastExitResult = null;

  function driveExitFrame(time) {
    if (!exitSession) return null;
    const key = Number.isFinite(time) ? `${session.ticks}:${time}` : null;
    if (key !== null && key === lastExitKey) return lastExitResult;
    try {
      const overrides = resolveExitInputs({
        time,
        updateTicks: session.ticks,
        exitTicks: exitSession.ticks,
        gameObject: session.gameObject,
      });
      lastExitResult = exitSession.tick(overrides);
    } catch (error) {
      exitErrors += 1;
      if (exitErrors === 1) {
        log(`native Exit step error (Update tick unaffected): ${error.message}`, "err");
      }
      lastExitResult = null;
    }
    lastExitKey = key;
    return lastExitResult;
  }

  log(`frame path: ${FRAME_PATH_MODE.NATIVE_WASM} hybrid capture/apply (no x86 PE on Update tick)`);
  if (renderSession) {
    log(`frame path: Game::Render root slice driven per frame (no x86 PE on Render tick)`);
  }
  if (exitSession) {
    log(`frame path: Game::Exit root plan driven per frame (no x86 PE on Exit step)`);
  }

  return {
    mode: FRAME_PATH_MODE.NATIVE_WASM,
    // Update tick is PE-free regardless of whether pure helper roots or the
    // Render root slice are present. No render path re-enters PE emulation.
    usesX86Emulation: false,
    session,
    host,
    slice,
    multiRoot,
    /** Shared JS-owned Game buffer (Update + Render capture/apply). */
    get gameObject() {
      return session.gameObject;
    },
    /** The captured Game snapshot's sfx-manager BSS region (absolute guest
     *  addresses 0xc7978c..0xc7994c): the WRITE surface of the record-4
     *  store-plan application arm (element=0 rows; element=1 rows go to
     *  the residual node via the standing host path — kind
     *  UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND). Zeroed until a
     *  fired plan writes it. */
    get sfxManagerBssSnapshot() {
      return sfxManagerBssSnapshot;
    },
    renderSession,
    renderGameObject,
    renderSlice,
    renderMode,
    exitSession,
    exitMode,
    get exitErrors() {
      return exitErrors;
    },
    /** Current render host handler (function or { handler, totals, events }). */
    get renderHost() {
      return renderHost;
    },
    get renderErrors() {
      return renderErrors;
    },
    /**
     * Install a render host handler. Works whether or not the render slice
     * loaded; null restores the default counting residual handler.
     * @param {object|Function|null} handler
     */
    setRenderHost(handler) {
      if (handler == null) {
        renderHost = createRenderHostHandler();
        return renderHost;
      }
      if (!renderHostCallable(handler)) {
        throw new TypeError("setRenderHost requires a function or an object with .handler");
      }
      renderHost = handler;
      return renderHost;
    },
    /**
     * Supply the render slice's runtime inputs — a HOST-SIDE GUEST-MEMORY
     * MODEL standing in for a live PE sparse bridge, NOT recovered PE
     * behaviour. Accepts a plain object (merged over createDefaultRenderInputs())
     * or a function (frameInfo) => overrides called once per render tick.
     * null restores the all-zero defaults (G0 gate closed; epilog chain only).
     * @param {object|((frameInfo: object) => object|null)|null} providerOrObject
     */
    setRenderInputs(providerOrObject) {
      if (providerOrObject == null) {
        renderInputsProvider = null;
        return null;
      }
      if (typeof providerOrObject !== "function" && typeof providerOrObject !== "object") {
        throw new TypeError("setRenderInputs requires an object, a function, or null");
      }
      renderInputsProvider = providerOrObject;
      return renderInputsProvider;
    },
    /** Current render input provider (null = all-zero defaults). */
    get renderInputs() {
      return renderInputsProvider;
    },
    /** Zero-valued render input template (every field the slice reads). */
    renderInputDefaults: () => createDefaultRenderInputs(),
    /**
     * Per-continuation recapture hook: (kind, ctx) => patch. Needed by the
     * entity / grid / tree continuations where the PE dereferences a pointer
     * or consumes a host result. null restores defaultRenderRecapture.
     * @param {((kind: number, ctx: object) => object|null)|null} fn
     */
    setRenderRecapture(fn) {
      if (fn == null) {
        renderRecapture = defaultRenderRecapture;
        return renderRecapture;
      }
      if (typeof fn !== "function") {
        throw new TypeError("setRenderRecapture requires a function or null");
      }
      renderRecapture = fn;
      return renderRecapture;
    },
    get renderRecapture() {
      return renderRecapture;
    },
    /**
     * Supply the Game::Exit root plan's 12 guest-memory inputs (Game + Manager
     * fields; see createDefaultExitRootInputs in scripts/decomp/frame-path.mjs
     * for the offsets). Accepts a plain object (merged over the all-zero
     * defaults) or a function (frameInfo) => overrides called once per exit
     * step. null restores the all-zero defaults (entry gate closed — no exit
     * in progress). Requires the exit module to be loaded (exitMode
     * native-wasm); throws otherwise.
     * @param {object|((frameInfo: object) => object|null)|null} providerOrObject
     */
    setExitInputs(providerOrObject) {
      if (!exitSession) {
        throw new Error("setExitInputs requires a wired Exit root plan (exit module not loaded)");
      }
      if (providerOrObject == null) {
        exitInputsProvider = null;
        return null;
      }
      if (typeof providerOrObject !== "function" && typeof providerOrObject !== "object") {
        throw new TypeError("setExitInputs requires an object, a function, or null");
      }
      exitInputsProvider = providerOrObject;
      return exitInputsProvider;
    },
    /** Current Exit input provider (null = all-zero defaults, gate closed). */
    get exitInputs() {
      return exitInputsProvider;
    },
    /** Zero-valued Exit root plan input template (every field the plan reads). */
    exitInputDefaults: () => createDefaultExitRootInputs(),
    /* -------- Wave-2 frame-path roots (module-backed when loaded) -------- */

    /**
     * ProcessInput pre-poll state machine (FUN_00954cd0 @ 0x00954d4d,
     * family ABI 25). Drives the Wasm gate exports when the processInput
     * root loaded; returns the pre-wave monolithic residual otherwise.
     * `inputs` are RAW Manager field values (never pre-masked).
     * @param {object} inputs
     */
    processInputPrepoll(inputs = {}) {
      const module = multiRoot?.helpers?.processInput ?? null;
      const pure = module ? processInputPrepollWasmPure(module.wasm) : null;
      return runProcessInputPrepollRoot(inputs, pure);
    },

    /**
     * Game::Exit root plan (ABI 35). Module-backed when the exit root
     * loaded; pre-wave un-wired shape otherwise.
     * @param {object} inputs
     */
    exitRootPlan(inputs = {}) {
      const module = multiRoot?.helpers?.exit ?? null;
      const pure = module ? exitRootWasmPure(module.wasm) : null;
      return runExitRootPlan(inputs, pure);
    },

    /**
     * Game::Exit map-walk continuation over a linear-memory _Tree (sentinel
     * at mapAddr). The walkable region is copied into the Wasm module's
     * memory at the same addresses, run, and the applied flag clears are
     * copied back. Requires a DataView over the caller's buffer.
     * @param {DataView} view
     * @param {number} mapAddr
     * @param {number} [outSlot]
     */
    exitMapWalk(view, mapAddr, outSlot = 0) {
      const module = multiRoot?.helpers?.exit ?? null;
      const pure = module ? exitRootWasmPure(module.wasm) : null;
      return runExitMapWalkContinuation(view, mapAddr >>> 0, outSlot >>> 0, pure);
    },

    /**
     * playerhud v17 UpdateHearts call plan for one occupied slot (twin path
     * = two calls with the ARG_TWIN live re-read at 0x008422ca; single path
     * = one call). Module-backed when the playerHud companion loaded.
     * @param {object} pack
     */
    playerHudUpdateHeartsPlan(pack = {}) {
      const module = multiRoot?.helpers?.playerHud ?? null;
      const pure = module ? playerHudUpdateHeartsWasmPure(module.wasm) : null;
      return playerHudUpdateHeartsPlan(pack, pure);
    },

    /**
     * Residual log edge through the log v5 level-gate: `dropped` means the
     * PE itself never reaches I/O (guard/gate/init) — the host edge is then
     * omitted. The console/file tail stays a platform host.
     * @param {object} scenario
     */
    residualLogEdge(scenario = {}) {
      return residualLogEdge(scenario);
    },

    /**
     * What the last render tick actually did: the continuation the chain ended
     * on, how many steps it took, and the host-event totals. `drew` is false
     * while only epilog hosts fire (the zero-input G0-closed chain).
     */
    get renderStats() {
      const result = lastRenderResult;
      return {
        available: !!renderSession,
        mode: renderMode,
        ticks: renderSession?.ticks ?? 0,
        errors: renderErrors,
        continuationKind: result?.continuationKind ?? null,
        steps: result?.steps ?? 0,
        hostKinds: result?.hostKinds ?? null,
        hostTotals: result?.hostTotals ?? renderHost?.totals ?? null,
        inputsSupplied: renderInputsProvider != null,
      };
    },
    /**
     * What the last exit step actually did: whether the wired plan is live,
     * how many steps it drove, the entry-gate state, and the host-event
     * totals shared with the Update HostHandler. `available` is false when
     * the exit module is missing (non-fatal, never PE).
     */
    get exitStats() {
      const result = lastExitResult;
      return {
        available: !!exitSession,
        mode: exitMode,
        ticks: exitSession?.ticks ?? 0,
        errors: exitErrors,
        wired: result?.wired ?? false,
        entryActive: result?.plan?.entryActive ?? false,
        eventCount: result?.plan?.eventCount ?? 0,
        hostKinds: result?.plan
          ? [...new Set(exitRootPlanHostEvents(result.plan).map((e) => e.kind))]
          : null,
        hostTotals: result?.plan ? { ...(host.totals || {}) } : null,
        inputsSupplied: exitInputsProvider != null,
      };
    },
    /**
     * Install (or clear) the native-update CAPTURE hooks (§5 live-wiring
     * contracts). When installed, every tick() first samples the §5 lane
     * groups READ-ONLY — the Game buffer via a DataView, guest memory
     * (the SFX manager heap *[0xc7169c], the 0xc798e0-region globals, the
     * player list's pointed-to player objects, the manager payload blob at
*   through `guestRead` — and forwards the captured
     *   lanes through session.tick(runtime, statePatch) (the dispatch hook
     *   the wave-22 C12 identified), with caller-supplied extraRuntime
     *   winning on any key overlap. null restores the pre-capture path:
     *   NO capture lanes are delivered, every §5 ready gate stays 0 and the
     *   module falls back to the byte-for-byte residuals.
     *
     *   The record-16 B8 capture (captureUpdateB8) ALSO fills the module's
     *   exported k-blob scratch from the live Room grids and raises
     *   roomGridCells/roomB8BlobReady; the post-tick copy-back of the
     *   module-stepped scratch to the live grids goes through
     *   `guestWrite` (the write-side twin of guestRead). Without it the
     *   stepped values only surface as result.b8GridApply.
     * @param {object|null} options
     * @param {((address: number, size: number) => Uint8Array|null)|null}
     *   [options.guestRead] READ-ONLY guest-memory reader (live PE sparse
     *   bridge stand-in; null -> guest-homed groups stay ready 0).
     * @param {((address: number, bytes: Uint8Array) => void)|null}
     *   [options.guestWrite] WRITE-side guest-memory hook (B8 copy-back
     *   target; null -> the copy-back is skipped).
     * @param {number} [options.gamePointerValue] The runtime *[0xc71678]
     *   value of the captured Game object (sidecar gamePointerValue).
     * @param {(() => Uint8Array|null)|null} [options.anm2LayerFlags] Host
     *   hook for the ANM2 load's per-layer [layer+0x30] load results.
     */
    setUpdateCapture(options) {
      if (options == null) {
        updateCapture = null;
        return null;
      }
      if (typeof options !== "object") {
        throw new TypeError("setUpdateCapture requires an object or null");
      }
      if (options.guestRead != null && typeof options.guestRead !== "function") {
        throw new TypeError("setUpdateCapture options.guestRead must be a function or null");
      }
      if (options.guestWrite != null && typeof options.guestWrite !== "function") {
        throw new TypeError("setUpdateCapture options.guestWrite must be a function or null");
      }
      if (options.anm2LayerFlags != null && typeof options.anm2LayerFlags !== "function") {
        throw new TypeError("setUpdateCapture options.anm2LayerFlags must be a function or null");
      }
      if (
        options.midRestockOwner != null &&
        typeof options.midRestockOwner !== "number" &&
        typeof options.midRestockOwner !== "function"
      ) {
        throw new TypeError("setUpdateCapture options.midRestockOwner must be a number, function or null");
      }
      if (
        options.blueRoomDirection != null &&
        (!Number.isInteger(options.blueRoomDirection) || options.blueRoomDirection < -1)
      ) {
        throw new TypeError("setUpdateCapture options.blueRoomDirection must be an integer >= -1 or null");
      }
      updateCapture = {
        guestRead: options.guestRead ?? null,
        guestWrite: options.guestWrite ?? null,
        gamePointerValue: (options.gamePointerValue ?? 0) >>> 0,
        blueRoomDirection: (options.blueRoomDirection ?? -1) | 0,
        anm2LayerFlags: options.anm2LayerFlags ?? null,
        midRestockOwner: options.midRestockOwner ?? null,
      };
      return updateCapture;
    },
    /** Current capture options (null = capture off; §5 ready gates all 0). */
    get updateCapture() {
      return updateCapture;
    },
    /**
     * Update hybrid tick; also drives one Render tick and one Exit root
     * step for this frame.
     * `extraRuntime` / `statePatch` forward straight to the Update session
     * (see createNativeUpdateSession in scripts/decomp/frame-path.mjs).
     * When the §5 capture is installed, the captured lanes are merged
     * UNDER extraRuntime before the session tick (host extras win).
     */
    tick: (time = undefined, extraRuntime = null, statePatch = null) => {
      /* Record-16 B8 capture state for this tick: null when the capture
         did not arm (ready gate stays 0 -> byte-for-byte residual). The
         grid arrays are captured HERE, before session.tick; the k-blob
         scratch itself is filled at the resume_room_update_prefix_b2 seam
         (b8RecaptureAfter) because the per-tick isaac_game_update_slice_
         reset_scratch zeroes the whole scratch at tick start. */
      let b8Capture = null;
      b8Stash = null;
      b8Filled = false;
      let runtime = extraRuntime;
      if (updateCapture) {
        const gameObject = session.gameObject;
        const gameView = new DataView(
          gameObject.buffer, gameObject.byteOffset, gameObject.byteLength);
        const captured = captureUpdateLanes({
          gameView,
          guestRead: updateCapture.guestRead,
          gamePointerValue: updateCapture.gamePointerValue,
          blueRoomDirection: updateCapture.blueRoomDirection,
          anm2LayerFlags: updateCapture.anm2LayerFlags,
          midRestockOwner: updateCapture.midRestockOwner,
        });
        b8Capture = captureUpdateB8({
          slice,
          gameView,
          guestRead: updateCapture.guestRead,
        });
        const merged = b8Capture
          ? { ...captured, ...b8Capture.patch }
          : captured;
        runtime = merged && extraRuntime
          ? { ...merged, ...extraRuntime }
          : (merged || extraRuntime);
        /* Arm the seam fill only when the EFFECTIVE lanes still match the
           capture: a caller override that changes cells or clears ready
           must not drive a module step over a mismatched scratch. */
        if (b8Capture) {
          const effCells = (runtime.roomGridCells ?? -1) | 0;
          const effReady = (runtime.roomB8BlobReady ?? 0) | 0;
          if (effCells === b8Capture.cells && effReady !== 0) {
            b8Stash = b8Capture;
          }
        }
      }
      const result = session.tick(runtime, statePatch);
      /* Record-16 B8 copy-back: AFTER the resume_room_update_prefix_b2
         seam ran. The module stepped the scratch in place whenever its
         gate opened (zero host residual); a gate miss left it byte-
         identical to the capture, so the copy-back is an idempotent no-op
         there. Only a FILLED scratch is copied (a chain that never
         reaches the B2 resume leaves b8Filled false — no write over live
         grids). The write goes through the host guestWrite hook; without
         it the post-step values still surface as b8GridApply for the
         caller. */
      if (b8Capture && result) {
        const copiedBack = b8Stash && b8Filled
          ? copyBackUpdateB8({
              slice,
              roomPtr: b8Stash.roomPtr,
              cells: b8Stash.cells,
              guestWrite: updateCapture ? updateCapture.guestWrite : null,
            })
          : 0;
        result.b8GridApply = {
          cells: b8Capture.cells,
          ready: b8Stash ? 1 : 0,
          copiedBack,
        };
      }
      b8Stash = null;
      b8Filled = false;
      /* ABI v104 (update-v104-record4-apply): the record-4 store-plan
         APPLICATION consumer — after a tick where the @932 event fired,
         read the module's emitted apply-plan scratch (148 B / 37 words;
         exports _address/_words) and apply the per-row stores:
         element=0 -> the captured BSS snapshot region (absolute 0xc798e0 +
         mgr_off); element=1 -> the residual 0x684f30() node via the
         standing host path (row-0 guard host-evaluated). Mask 0 / exports
         missing / capture absent -> NOTHING applied (residual
         byte-for-byte). */
      if (result?.events?.opaque008318a0SfxManagerStores > 0) {
        const plan = readSfxManagerStoreApplyPlan(slice);
        if (plan && (plan.storeMask >>> 0) !== 0) {
          applySfxManagerStorePlan({
            plan,
            view: sfxManagerBssView,
            base: UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
            host,
          });
          result.sfxManagerStoreApply = {
            storeMask: plan.storeMask >>> 0,
            rows: plan.rows,
          };
        }
      }
      driveRenderFrame(time);
      driveExitFrame(time);
      return result;
    },
    /** Render root-slice tick; null when the render slice is unavailable. */
    renderTick: (time = undefined) => driveRenderFrame(time),
    /** Exit root-plan step; null when the exit module is unavailable. */
    exitTick: (time = undefined) => driveExitFrame(time),
  };
}
