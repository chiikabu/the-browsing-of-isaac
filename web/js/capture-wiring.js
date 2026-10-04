/**
 * app.js capture wiring (W32-S3; update-v110-appjs NOTES §2).
 *
 * The bridge (web/js/native-update-bridge.js) computes the §5 capture lanes
 * from a READ-ONLY guestRead (absolute guest addresses -> bytes) plus a
 * WRITE-side guestWrite (B8 copy-back) plus the record-39 midRestockOwner
 * hook. This module builds those three from the browser host's LIVE guest
 * data:
 *
 *   - createLiveGuestMemory  — a heap-capable absolute-address region model.
 *     The shipped app registers the seeded Game object (at sidecar
 *     gamePointerValue) and the render-root ROOM object (at sidecar
 *     renderRootPointerValue); tests/pokes may addRegion() more. Reads
 *     outside every region return null (capture-absence discipline: an
 *     unresolved read keeps the group's ready gate 0 -> byte-for-byte
 *     residual). Writes land in the owning region (B8 copy-back keeps the
 *     stepped grids live), and report success/failure so callers can count
 *     applied writes.
 *
 *   - createFirstCollectibleOwnerHook — the record-39 owner hook
 *     (FirstCollectibleOwner(0x209, Game+0x1baa8, true) result truthiness).
 *     The bridge NEVER derives it from memory; the app resolves it with the
 *     exact FCO walk law (game-update-model.mjs fcoWalkOwner /
 *     FCO9BE080_*): list begin/end from Game+0x1baa8/+0x1baac, per-player
 *     probe words [ptr, f2c, hasPrimary, twinPtr, hasTwin]. Any unresolved
 *     read returns null — the pack stays ABSENT (removal theorem's
 *     capture-absence gate miss, byte-for-byte). The twin shared gate stays
 *     closed: its item-config pointer resolves through the PE item manager,
 *     unreachable from the browser host; with shared=0 the twin branch is
 *     inert exactly like the byte-law 0x9be0ed/0x9be0f9 gate closed.
 */

/** Game+0x1baa8 = global player list (begin/end words, in-buffer). */
const FCO_LIST_BEGIN_OFS = 0x1baa8;
const FCO_LIST_END_OFS = 0x1baac;
/** FirstCollectibleOwner(0x209, ..., true) — the record-39 needle. */
const FCO_COLLECTIBLE_ID = 0x209;
const FCO_LIST_STRIDE = 4;                 /* add esi,4 @0x9be10d */

/* Per-player probe words (FCO9BE080_PROBE_WORDS = 5: ptr,f2c,has1,twin,has2). */
const FCO_PLAYER_F2C_OFS = 0x2c;           /* [player+0x2c] slot gate == 0 */
const FCO_PLAYER_TWIN_OFS = 0x1e6c;        /* twin ptr ([player+0x1e6c]) */
/** HasCollectible-shaped scan pins (HUD-family 0x7706e0 surface). */
const FCO_PLAYER_HELD_OFS = 0x2ef4;        /* held item id (STRICT path) */
const FCO_PLAYER_PENDING_OFS = 0x2ef8;     /* pending item id */
const FCO_PLAYER_COLLECT_VEC_OFS = 0x16c0; /* slot vector, stride 4 */
const FCO_COLLECT_SLOT_MASK = 0x7fff;      /* (slot & 0x7fff) == id */
export const FCO_PLAYER_MAX = 4;           /* coop player cap (walk guard) */
export const FCO_COLLECT_SCAN_MAX = 64;    /* sane bounded slot scan */

/** Mutate a region byte array in place or null when not owned. */
function regionIndexOf(regions, address) {
  const a = address >>> 0;
  for (let i = 0; i < regions.length; i += 1) {
    const r = regions[i];
    const off = a - r.base;
    if (off >= 0 && off < r.bytes.length) return i;
  }
  return -1;
}

/**
 * Heap-capable live guest memory: absolute guest address -> byte region.
 *
 * @param {Array<{base: number, bytes: Uint8Array}>} [regions] initial regions.
 * @returns {{
 *   addRegion: (base: number, bytes: Uint8Array) => void,
 *   read: (address: number, size: number) => Uint8Array|null,
 *   write: (address: number, bytes: Uint8Array) => number,
 *   regions: () => Array<{base: number, bytes: Uint8Array}>,
 * }}
 */
export function createLiveGuestMemory(regions = []) {
  const list = regions.map((r) => ({
    base: r.base >>> 0,
    bytes: r.bytes,
  }));
  return {
    addRegion(base, bytes) {
      list.push({ base: base >>> 0, bytes });
    },
    /** READ-ONLY twin of the bridge guestRead contract. */
    read(address, size) {
      const i = regionIndexOf(list, address);
      if (i < 0) return null;
      const r = list[i];
      const off = (address >>> 0) - r.base;
      if (size <= 0 || size > r.bytes.length - off) return null;
      return r.bytes.subarray(off, off + size);
    },
    /**
     * WRITE-side twin: copies bytes into the owning region. Returns the
     * number of bytes written (0 when the address is unmapped or the copy
     * would overflow).
     */
    write(address, bytes) {
      const i = regionIndexOf(list, address);
      if (i < 0) return 0;
      const r = list[i];
      const off = (address >>> 0) - r.base;
      if (bytes.length > r.bytes.length - off) return 0;
      r.bytes.set(bytes, off);
      return bytes.length;
    },
    regions() {
      return list.map((r) => ({ base: r.base, bytes: r.bytes }));
    },
  };
}

/**
 * Host HasCollectible-shaped probe for one player object: nonzero iff the
 * player holds `id` (held/pending slots or the collectible slot vector scan,
 * HUD-family 0x7706e0 surface). Any unresolved read -> null (the caller then
 * treats the whole walk as unresolved).
 *
 * @param {(address: number, size: number) => Uint8Array|null} guestRead
 * @param {number} player absolute player object address
 * @param {number} id collectible id
 * @returns {number|null} 0/1 or null on an unresolved read
 */
export function probePlayerHasCollectible(guestRead, player, id) {
  const held = guestRead((player + FCO_PLAYER_HELD_OFS) >>> 0, 4);
  if (!held || held.length < 4) return null;
  const heldId = new DataView(held.buffer, held.byteOffset, 4).getUint32(0, true);
  if (heldId === (id >>> 0)) return 1;
  const pending = guestRead((player + FCO_PLAYER_PENDING_OFS) >>> 0, 4);
  if (!pending || pending.length < 4) return null;
  const pendingId = new DataView(pending.buffer, pending.byteOffset, 4).getUint32(0, true);
  if (pendingId === (id >>> 0)) return 1;
  for (let i = 0; i < FCO_COLLECT_SCAN_MAX; i += 1) {
    const slot = guestRead((player + FCO_PLAYER_COLLECT_VEC_OFS + i * 4) >>> 0, 4);
    if (!slot || slot.length < 4) return null;
    const slotWord = new DataView(slot.buffer, slot.byteOffset, 4).getUint32(0, true);
    if ((slotWord & FCO_COLLECT_SLOT_MASK) === (id >>> 0)) return 1;
  }
  return 0;
}

/**
 * Record-39 midRestockOwner hook: FirstCollectibleOwner(0x209,
 * Game+0x1baa8, true) result truthiness, resolved from the live guest
 * buffer through the exact fcoWalkOwner law. Returns 1 (an owner exists),
 * 0 (no owner), or null (unresolved — the pack stays ABSENT).
 *
 * @param {object} opts
 * @param {DataView} opts.gameView DataView over the session Game buffer
 *   (list begin/end words are in-buffer).
 * @param {(address: number, size: number) => Uint8Array|null} opts.guestRead
 *   heap-capable reader (createLiveGuestMemory().read or a test reader).
 * @returns {() => number|null}
 */
export function createFirstCollectibleOwnerHook({ gameView, guestRead } = {}) {
  if (!gameView || typeof gameView.getUint32 !== "function") {
    return () => null;
  }
  if (typeof guestRead !== "function") return () => null;
  return () => {
    const listBegin = gameView.getUint32(FCO_LIST_BEGIN_OFS, true) >>> 0;
    const listEnd = gameView.getUint32(FCO_LIST_END_OFS, true) >>> 0;
    /* fcoListEmpty (0x9be0ce FULL dword): empty list -> not-found. */
    if (listBegin === listEnd) return 0;
    const count = ((listEnd - listBegin) | 0) >> 2; /* SAR2 machine order */
    if (count < 0 || count > FCO_PLAYER_MAX) return null; /* corrupt span */
    for (let i = 0; i < count; i += 1) {
      const slot = guestRead((listBegin + i * FCO_LIST_STRIDE) >>> 0, 4);
      if (!slot || slot.length < 4) return null; /* vector array unreachable */
      const player = new DataView(slot.buffer, slot.byteOffset, 4).getUint32(0, true);
      const f2cBytes = guestRead((player + FCO_PLAYER_F2C_OFS) >>> 0, 4);
      if (!f2cBytes || f2cBytes.length < 4) return null;
      const f2c = new DataView(f2cBytes.buffer, f2cBytes.byteOffset, 4).getUint32(0, true);
      if (f2c !== 0) continue; /* slot gate (0x9be0d9): skip checkable 0 only */
      const hasPrimary = probePlayerHasCollectible(guestRead, player, FCO_COLLECTIBLE_ID);
      if (hasPrimary == null) return null;
      if (hasPrimary !== 0) return 1;
      /* Twin branch: shared gate = arg3(1) && itemPtr && itemFlagsB8 — the
         item-config pointer resolves through the PE item manager, which the
         browser host cannot reach, so shared stays 0 (byte-law 0x9be0ed/
         0x9be0f9 gate closed) and the twin is inert. We still advance the
         walk per the machine order. */
      const twinBytes = guestRead((player + FCO_PLAYER_TWIN_OFS) >>> 0, 4);
      if (!twinBytes || twinBytes.length < 4) return null;
      const twinPtr = new DataView(twinBytes.buffer, twinBytes.byteOffset, 4).getUint32(0, true);
      if (twinPtr !== 0) {
        const hasTwin = probePlayerHasCollectible(guestRead, twinPtr, FCO_COLLECTIBLE_ID);
        if (hasTwin == null) return null;
        /* shared is 0 -> twin hit cannot select; keep walking. */
      }
    }
    return 0;
  };
}

/**
 * Install the app's capture wiring on the bridge: every §5 arm the browser
 * host can feed (gamePointerValue, heap-capable guestRead, live guestWrite,
 * the record-39 owner hook). The bridge's tick() then calls
 * captureUpdateLanes + captureUpdateB8 + fillUpdateB8Scratch +
 * copyBackUpdateB8 with this data.
 *
 * @param {object} bridge bootNativeUpdateBridge result
 * @param {object} opts
 * @param {number} opts.gamePointerValue sidecar gamePointerValue
 * @param {object} opts.liveGuest createLiveGuestMemory result
 * @param {DataView} opts.gameView DataView over the session Game buffer
 * @returns {object|null} the setUpdateCapture result or null when the bridge
 *   exposes no setUpdateCapture.
 */
export function installUpdateCapture(bridge, { gamePointerValue, liveGuest, gameView } = {}) {
  if (!bridge || typeof bridge.setUpdateCapture !== "function") return null;
  const guestRead = (typeof liveGuest?.read === "function" ? liveGuest.read : null);
  const guestWrite = (typeof liveGuest?.write === "function" ? liveGuest.write : null);
  const midRestockOwner = createFirstCollectibleOwnerHook({
    gameView,
    guestRead,
  });
  return bridge.setUpdateCapture({
    gamePointerValue: (gamePointerValue ?? 0) >>> 0,
    guestRead,
    guestWrite,
    midRestockOwner,
  });
}