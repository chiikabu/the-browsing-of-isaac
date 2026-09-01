/** Independent JS oracle for the GameState family pure laws (ABI v5).
 *  Landed surface: GameState::Delete 0x009c8350 (ABI v1) + GameState::
 *  DeleteRerun 0x009c8410 (ABI v2) decision laws; GameState::write
 *  0x009c9340 typed-host lease (ABI v2/v5: constants, then the peeled
 *  lane-free loop/decision laws W1..W22 at ABI v5); serializer tree
 *  leaf laws R1..R18 (ABI v3); GameStateIO host A/B laws S1..S6 +
 *  read_rerun lease (ABI v4); 0x9c8d20 element bounds U1 + 0x683930
 *  name gate N1 (ABI v5).
 *
 *  Do NOT derive from the C++ implementation mechanically — this module is
 *  the oracle the C++/Wasm is tested against (PE evidence:
 *  output/decomp/5129df723e64/section-notes/cpu-dump/009c8350.txt,
 *  cpu-dump/009c8410.txt, cpu-dump/009c9340.txt).
 *
 *  Band ownership (family foundation): 0x009c7000..0x009ca000, plus the
 *  write span crossing to 0x009cad3b. See
 *  output/decomp/5129df723e64/section-notes/game-state-v1/NOTES.md §1 for
 *  the 15-body classification table, game-state-v2/NOTES.md for the
 *  DeleteRerun decode + write serializer-tree evidence, and
 *  game-state-v4-cloud/NOTES.md for the v5 law census. */

export const GAME_STATE_PURE_ABI_VERSION = 20;

const asU32 = (v) => (v | 0) >>> 0;

/* u32 LE load at byte offset; accepts Buffer (readUInt32LE) or DataView. */
function loadU32(mem, addr) {
  if (mem.readUInt32LE) return asU32(mem.readUInt32LE(addr));
  if (mem.getUint32) return asU32(mem.getUint32(addr, true));
  throw new TypeError("mem must be a Buffer or DataView");
}

/* --- ABI v1: GameState::Delete 0x009c8350 (exact ZHL) --- */

export const GS9C8350_VA = 0x009c8350;
export const GS9C8350_END_VA = 0x009c840a; /* first non-body byte (tail jmp @0x9c8405; int3 pad @0x9c840a) */
export const GS9C8350_BODY_BYTES = 0xba;
export const GS9C8350_NEXT_VA = 0x009c8410; /* GameState::DeleteRerun */
export const GS9C8350_TAIL_VA = 0x009c79a0; /* shared GameState reset body */
export const GS9C8350_STEAM_IAT = 0x00b18a1c; /* SteamInternal_ContextInit */
export const GS9C8350_STEAM_ARG = 0x00c5c3a4;
export const GS9C8350_REMOVE_IAT = 0x00b187cc; /* CRT remove(filename) */
export const GS9C8350_LOGGER_VA = 0x00a112c0;
export const GS9C8350_LOG_STR_VA = 0x00b7f1ac;
export const GS9C8350_MGR_GLOBAL_DAT = 0x00c7169c; /* g_Manager */
export const GS9C8350_CLOUD_OFF = 0x2a3a4;
export const GS9C8350_FILENAME_SIZE_OFF = 0x1fdbc;
export const GS9C8350_FILENAME_BUF_OFF = 0x1fdac;
export const GS9C8350_STATNAME_SIZE_OFF = 0x1fe08;
export const GS9C8350_STATNAME_BUF_OFF = 0x1fdf4;
export const GS9C8350_SSO_THRESHOLD = 0x10;
export const GS9C8350_VTBL34_SLOT = 0x34;
export const GS9C8350_VTBL18_SLOT = 0x18;
export const GS9C8350_CALLER_COUNT = 5;
export const GS9C8350_CALLER_VAS = [
  0x0095915d, 0x0095a243, 0x009cc254, 0x009ce68f, 0x009d9df7,
];
export const GS9C8350_STEAM_GATE_VA = 0x009c836b;
export const GS9C8350_CLOUD_GATE_VA = 0x009c8370;
export const GS9C8350_STATNAME_SIZE_CMP_VA = 0x009c8379;
export const GS9C8350_VTBL34_RESULT_GATE_VA = 0x009c83ad;
export const GS9C8350_FILENAME_EMPTY_GATE_VA = 0x009c83cd;

/**
 * P1 — steam context presence (PE 0x009c836b / repeat 0x009c8394):
 * `cmp dword ptr [eax],0 ; je fallback` — FULL 32-bit test of the raw
 * first dword of SteamInternal_ContextInit()'s result. 0x100 IS present.
 */
export function gs9c8350SteamPresent(steamCtxWord) {
  return asU32(steamCtxWord) !== 0 ? 1 : 0;
}

/**
 * P2 — Manager+0x2a3a4 cloud byte (PE 0x009c8370):
 * `cmp byte ptr [edi+0x2a3a4],0 ; je fallback` — LOW-BYTE. The param is
 * the recaptured byte as a u32; the mask is applied INSIDE (0x100 -> byte
 * 0x00 -> gate closed).
 */
export function gs9c8350CloudGateOk(mgrByte2a3a4) {
  return (asU32(mgrByte2a3a4) & 0xff) !== 0 ? 1 : 0;
}

/**
 * P3 — steam-arm combine (je CF across 0x009c836e/0x009c8377): the steam
 * arm runs iff BOTH gates pass; otherwise the fallback filename/remove arm.
 */
export function gs9c8350UseSteamArm(steamPresent, cloudGateOk) {
  return steamPresent !== 0 && cloudGateOk !== 0 ? 1 : 0;
}

/**
 * P4 — stat-name SSO heap select (PE 0x009c8379):
 * `cmp dword ptr [esi+0x1fe08],0x10 ; jb inline` — FULL-dword UNSIGNED.
 * size >= 0x10 loads the heap pointer; size < 0x10 keeps the inline buffer.
 * WIDE: 0x100 -> heap (a byte-narrowed read would flip to inline).
 */
export function gs9c8350StatnameHeapUsed(size1fe08) {
  return asU32(size1fe08) >= GS9C8350_SSO_THRESHOLD ? 1 : 0;
}

/**
 * P5 — stat-name string pointer (mem law): returns the effective pointer
 * the machine hands to the steam vtbl calls. u32 wraparound on the offset
 * add; heap arm loads u32 LE at mem + (thisOff + 0x1fdf4).
 */
export function gs9c8350StatnamePtr(mem, thisOff, size1fe08) {
  const bufAddr = (asU32(thisOff) + GS9C8350_STATNAME_BUF_OFF) >>> 0;
  if (asU32(size1fe08) < GS9C8350_SSO_THRESHOLD) return bufAddr;
  if (mem === null || mem === undefined) return 0;
  return loadU32(mem, bufAddr);
}

/**
 * P6 — steam vtbl+0x34 result gate (PE 0x009c83ad): `test al,al ; je tail`
 * — LOW-BYTE (AL of the host call). Nonzero continues to the vtbl+0x18
 * call; zero -> common tail.
 */
export function gs9c8350SteamArmContinue(vtbl34Al) {
  return (asU32(vtbl34Al) & 0xff) !== 0 ? 1 : 0;
}

/**
 * P7 — filename EMPTY gate (PE 0x009c83cd):
 * `cmp dword ptr [esi+0x1fdbc],0 ; jne skip-log` — FULL-dword: nonzero
 * filename skips the no-filename logger (host 0xa112c0, 1, 0xb7f1ac).
 * Same GameState+0x1fdbc size field as exit v46
 * isaac_exit_958ed0_local_filename_present (field shared; law GameState).
 */
export function gs9c8350FilenamePresent(size1fdbc) {
  return asU32(size1fdbc) !== 0 ? 1 : 0;
}

/**
 * P8 — filename string pointer (mem law): effective pointer handed to
 * CRT remove(). u32 wrap on the offset add; heap arm loads u32 LE at
 * mem + (thisOff + 0x1fdac).
 */
export function gs9c8350FilenamePtr(mem, thisOff, size1fdc0) {
  const bufAddr = (asU32(thisOff) + GS9C8350_FILENAME_BUF_OFF) >>> 0;
  if (asU32(size1fdc0) < GS9C8350_SSO_THRESHOLD) return bufAddr;
  if (mem === null || mem === undefined) return 0;
  return loadU32(mem, bufAddr);
}

/* --- accessors --- */
export const gs9c8350Va = () => GS9C8350_VA;
export const gs9c8350EndVa = () => GS9C8350_END_VA;
export const gs9c8350BodyBytes = () => GS9C8350_BODY_BYTES;
export const gs9c8350NextVa = () => GS9C8350_NEXT_VA;
export const gs9c8350TailVa = () => GS9C8350_TAIL_VA;
export const gs9c8350SteamIat = () => GS9C8350_STEAM_IAT;
export const gs9c8350SteamArg = () => GS9C8350_STEAM_ARG;
export const gs9c8350RemoveIat = () => GS9C8350_REMOVE_IAT;
export const gs9c8350LoggerVa = () => GS9C8350_LOGGER_VA;
export const gs9c8350LogStrVa = () => GS9C8350_LOG_STR_VA;
export const gs9c8350MgrGlobalDat = () => GS9C8350_MGR_GLOBAL_DAT;
export const gs9c8350CloudOff = () => GS9C8350_CLOUD_OFF;
export const gs9c8350FilenameSizeOff = () => GS9C8350_FILENAME_SIZE_OFF;
export const gs9c8350FilenameBufOff = () => GS9C8350_FILENAME_BUF_OFF;
export const gs9c8350StatnameSizeOff = () => GS9C8350_STATNAME_SIZE_OFF;
export const gs9c8350StatnameBufOff = () => GS9C8350_STATNAME_BUF_OFF;
export const gs9c8350SsoThreshold = () => GS9C8350_SSO_THRESHOLD;
export const gs9c8350Vtbl34Slot = () => GS9C8350_VTBL34_SLOT;
export const gs9c8350Vtbl18Slot = () => GS9C8350_VTBL18_SLOT;
export const gs9c8350CallerCount = () => GS9C8350_CALLER_COUNT;
export const gs9c8350CallerVaAt = (index) =>
  GS9C8350_CALLER_VAS[index >>> 0] ?? 0;

/* --- ABI v2: GameState::DeleteRerun 0x009c8410 (exact ZHL) --- */

export const GS9C8410_VA = 0x009c8410;
export const GS9C8410_END_VA = 0x009c84bb; /* first non-body byte (terminal ret @0x9c84ba; int3 pad @0x9c84bb) */
export const GS9C8410_BODY_BYTES = 0xab;
export const GS9C8410_NEXT_VA = 0x009c84c0; /* HOST serializer row (v1-classified) */
export const GS9C8410_STEAM_RET_VA = 0x009c8483; /* steam arm RET — NO 0x9c79a0 reset tail (unlike Delete) */
export const GS9C8410_TAIL_RET_VA = 0x009c84ba; /* common tail ret (both arms) */
export const GS9C8410_STEAM_IAT = 0x00b18a1c; /* SteamInternal_ContextInit */
export const GS9C8410_STEAM_ARG = 0x00c5c3a4;
export const GS9C8410_REMOVE_IAT = 0x00b187cc; /* CRT remove(filename) */
export const GS9C8410_LOGGER_VA = 0x00a112c0;
export const GS9C8410_LOG_STR_VA = 0x00b7f1e0; /* "[warn] GameState::DeleteRerun: no filename specified.\n" */
export const GS9C8410_MGR_GLOBAL_DAT = 0x00c7169c; /* g_Manager */
export const GS9C8410_CLOUD_OFF = 0x2a3a4;
export const GS9C8410_FILENAME_EMPTY_SIZE_OFF = 0x1fdbc; /* shared empty-gate field (Delete / exit v46) */
export const GS9C8410_FILENAME_SIZE_OFF = 0x1fdd8; /* fallback filename SSO size */
export const GS9C8410_FILENAME_BUF_OFF = 0x1fdc4;
export const GS9C8410_STATNAME_SIZE_OFF = 0x1fe20; /* stat-name SSO size */
export const GS9C8410_STATNAME_BUF_OFF = 0x1fe0c;
export const GS9C8410_SSO_THRESHOLD = 0x10;
export const GS9C8410_VTBL34_SLOT = 0x34;
export const GS9C8410_VTBL18_SLOT = 0x18;
export const GS9C8410_CALLER_COUNT = 5;
export const GS9C8410_CALLER_VAS = [
  0x00958fca, 0x0095a414, 0x009cad4d, 0x009caf8f, 0x009d7dc6,
];
export const GS9C8410_STEAM_GATE_VA = 0x009c842b;
export const GS9C8410_CLOUD_GATE_VA = 0x009c8430;
export const GS9C8410_STATNAME_SIZE_CMP_VA = 0x009c843f;
export const GS9C8410_VTBL34_RESULT_GATE_VA = 0x009c846a;
export const GS9C8410_FILENAME_EMPTY_GATE_VA = 0x009c8484;

/**
 * Q1 — steam context presence (PE 0x009c842b / repeat 0x009c8451):
 * `cmp dword ptr [eax],0 ; je fallback` — FULL 32-bit test. 0x100 IS
 * present. Same shape as Delete's P1.
 */
export function gs9c8410SteamPresent(steamCtxWord) {
  return asU32(steamCtxWord) !== 0 ? 1 : 0;
}

/**
 * Q2 — Manager+0x2a3a4 cloud byte (PE 0x009c8430): LOW-BYTE; the param is
 * the recaptured byte as a u32; mask applied INSIDE (0x100 -> byte 0x00
 * -> gate closed). Same field as Delete's P2.
 */
export function gs9c8410CloudGateOk(mgrByte2a3a4) {
  return (asU32(mgrByte2a3a4) & 0xff) !== 0 ? 1 : 0;
}

/**
 * Q3 — steam-arm combine (je CF across 0x009c842e/0x009c8437): AND of
 * both gates; steam arm iff both nonzero, else fallback.
 */
export function gs9c8410UseSteamArm(steamPresent, cloudGateOk) {
  return steamPresent !== 0 && cloudGateOk !== 0 ? 1 : 0;
}

/**
 * Q4 — stat-name SSO heap select (PE 0x009c843f):
 * `cmp dword ptr [esi+0x14],0x10 ; jb inline` (esi = this+0x1fe0c, size
 * field GameState+0x1fe20) — FULL-dword UNSIGNED. size >= 0x10 loads the
 * heap pointer; WIDE 0x100 -> heap.
 */
export function gs9c8410StatnameHeapUsed(size1fe20) {
  return asU32(size1fe20) >= GS9C8410_SSO_THRESHOLD ? 1 : 0;
}

/**
 * Q5 — stat-name string pointer (mem law): effective pointer handed to
 * the steam vtbl calls. u32 wraparound on the offset add; heap arm loads
 * u32 LE at mem + (thisOff + 0x1fe0c).
 */
export function gs9c8410StatnamePtr(mem, thisOff, size1fe20) {
  const bufAddr = (asU32(thisOff) + GS9C8410_STATNAME_BUF_OFF) >>> 0;
  if (asU32(size1fe20) < GS9C8410_SSO_THRESHOLD) return bufAddr;
  if (mem === null || mem === undefined) return 0;
  return loadU32(mem, bufAddr);
}

/**
 * Q6 — steam vtbl+0x34 result gate (PE 0x009c846a): `test al,al ; je tail`
 * — LOW-BYTE (AL of the host call). Nonzero continues to the vtbl+0x18
 * call; zero -> common tail.
 */
export function gs9c8410SteamArmContinue(vtbl34Al) {
  return (asU32(vtbl34Al) & 0xff) !== 0 ? 1 : 0;
}

/**
 * Q7 — filename EMPTY gate (PE 0x009c8484):
 * `cmp dword ptr [esi+0x1fdbc],0 ; jne skip-log` — FULL-dword: nonzero
 * filename skips the no-filename logger (host 0xa112c0, 1, 0xb7f1e0).
 * Same GameState+0x1fdbc size field as Delete P7 / exit v46
 * isaac_exit_958ed0_local_filename_present.
 */
export function gs9c8410FilenamePresent(size1fdbc) {
  return asU32(size1fdbc) !== 0 ? 1 : 0;
}

/**
 * Q8 — fallback filename string pointer (mem law): effective pointer
 * handed to CRT remove(). u32 wrap on the offset add; heap arm loads
 * u32 LE at mem + (thisOff + 0x1fdc4).
 */
export function gs9c8410FilenamePtr(mem, thisOff, size1fdd8) {
  const bufAddr = (asU32(thisOff) + GS9C8410_FILENAME_BUF_OFF) >>> 0;
  if (asU32(size1fdd8) < GS9C8410_SSO_THRESHOLD) return bufAddr;
  if (mem === null || mem === undefined) return 0;
  return loadU32(mem, bufAddr);
}

/* --- ABI v2 accessors: DeleteRerun 0x009c8410 --- */
export const gs9c8410Va = () => GS9C8410_VA;
export const gs9c8410EndVa = () => GS9C8410_END_VA;
export const gs9c8410BodyBytes = () => GS9C8410_BODY_BYTES;
export const gs9c8410NextVa = () => GS9C8410_NEXT_VA;
export const gs9c8410SteamRetVa = () => GS9C8410_STEAM_RET_VA;
export const gs9c8410TailRetVa = () => GS9C8410_TAIL_RET_VA;
export const gs9c8410SteamIat = () => GS9C8410_STEAM_IAT;
export const gs9c8410SteamArg = () => GS9C8410_STEAM_ARG;
export const gs9c8410RemoveIat = () => GS9C8410_REMOVE_IAT;
export const gs9c8410LoggerVa = () => GS9C8410_LOGGER_VA;
export const gs9c8410LogStrVa = () => GS9C8410_LOG_STR_VA;
export const gs9c8410MgrGlobalDat = () => GS9C8410_MGR_GLOBAL_DAT;
export const gs9c8410CloudOff = () => GS9C8410_CLOUD_OFF;
export const gs9c8410FilenameEmptySizeOff = () => GS9C8410_FILENAME_EMPTY_SIZE_OFF;
export const gs9c8410FilenameSizeOff = () => GS9C8410_FILENAME_SIZE_OFF;
export const gs9c8410FilenameBufOff = () => GS9C8410_FILENAME_BUF_OFF;
export const gs9c8410StatnameSizeOff = () => GS9C8410_STATNAME_SIZE_OFF;
export const gs9c8410StatnameBufOff = () => GS9C8410_STATNAME_BUF_OFF;
export const gs9c8410SsoThreshold = () => GS9C8410_SSO_THRESHOLD;
export const gs9c8410Vtbl34Slot = () => GS9C8410_VTBL34_SLOT;
export const gs9c8410Vtbl18Slot = () => GS9C8410_VTBL18_SLOT;
export const gs9c8410CallerCount = () => GS9C8410_CALLER_COUNT;
export const gs9c8410CallerVaAt = (index) =>
  GS9C8410_CALLER_VAS[index >>> 0] ?? 0;

/* --- ABI v2 typed-host lease: GameState::write 0x009c9340 (exact ZHL
 *     23-byte `bool GameState::write(GameStateIO** gameStateIO)`) — NO
 *     laws (IRREDUCIBLE save serializer; census + serializer-tree
 *     evidence in game-state-v2/NOTES.md §3). --- */

export const GS9C9340_VA = 0x009c9340;
export const GS9C9340_END_VA = 0x009cad3b; /* first non-body byte (ret 4 @0x9cad38; int3 pad @0x9cad3b) */
export const GS9C9340_BODY_BYTES = 0x19fb;
export const GS9C9340_NEXT_VA = 0x009cad40; /* GameStateIO save orchestrator region */
export const GS9C9340_STREAM_VTBL_SLOT = 0x1c; /* GameStateIO stream write slot (106 sites) */
export const GS9C9340_ROW_WRITER_VA = 0x00683410; /* field row-writer (103 sites) */
export const GS9C9340_STREAM_INIT_VA = 0x00420a80;
export const GS9C9340_GSR_FORMAT_STR_VA = 0x00b7f218; /* "ISAACNG_GSR%04u" */
export const GS9C9340_SEEDED_LOG_STR_VA = 0x00b1c640; /* "Error: Game Start Seed was not set.\n" */
export const GS9C9340_LOGGER_VA = 0x00a112c0;
export const GS9C9340_SE_HANDLER_DAT = 0x00b0f2d0;
export const GS9C9340_GS_COOKIE_DAT = 0x00bf93b4;
export const GS9C9340_COOKIE_TAIL_VA = 0x00aef12b; /* __security_check_cookie */
export const GS9C9340_INVALID_PARAM_IAT = 0x00b18894;
export const GS9C9340_FREE_VA = 0x00aef15c;
export const GS9C9340_GAME_STATE_IO_OFF = 0x1fe24; /* GameStateIO* field (shared with exit v46) */
export const GS9C9340_SERIALIZER_8D20_VA = 0x009c8d20;
export const GS9C9340_SERIALIZER_87E0_VA = 0x009c87e0;
export const GS9C9340_SERIALIZER_85D0_VA = 0x009c85d0;
export const GS9C9340_LEAF_9D77E0_VA = 0x009d77e0;
export const GS9C9340_LEAF_9D45C0_VA = 0x009d45c0;
export const GS9C9340_LEAF_9CEC80_VA = 0x009cec80;
export const GS9C9340_LEAF_9D84D0_VA = 0x009d84d0;
export const GS9C9340_LEAF_9EB5B0_VA = 0x009eb5b0;
export const GS9C9340_LEAF_4288A0_VA = 0x004288a0;
export const GS9C9340_LEAF_708AE0_VA = 0x00708ae0;
export const GS9C9340_LEAF_AF05E5_VA = 0x00af05e5;
export const GS9C9340_CALLER_COUNT = 3;
export const GS9C9340_CALLER_VAS = [
  0x00917577, 0x00959076, 0x009cae15,
];

/* --- ABI v2 accessors: write 0x009c9340 typed-host lease --- */
export const gs9c9340Va = () => GS9C9340_VA;
export const gs9c9340EndVa = () => GS9C9340_END_VA;
export const gs9c9340BodyBytes = () => GS9C9340_BODY_BYTES;
export const gs9c9340NextVa = () => GS9C9340_NEXT_VA;
export const gs9c9340StreamVtblSlot = () => GS9C9340_STREAM_VTBL_SLOT;
export const gs9c9340RowWriterVa = () => GS9C9340_ROW_WRITER_VA;
export const gs9c9340StreamInitVa = () => GS9C9340_STREAM_INIT_VA;
export const gs9c9340GsrFormatStrVa = () => GS9C9340_GSR_FORMAT_STR_VA;
export const gs9c9340SeededLogStrVa = () => GS9C9340_SEEDED_LOG_STR_VA;
export const gs9c9340LoggerVa = () => GS9C9340_LOGGER_VA;
export const gs9c9340SeHandlerDat = () => GS9C9340_SE_HANDLER_DAT;
export const gs9c9340GsCookieDat = () => GS9C9340_GS_COOKIE_DAT;
export const gs9c9340CookieTailVa = () => GS9C9340_COOKIE_TAIL_VA;
export const gs9c9340InvalidParamIat = () => GS9C9340_INVALID_PARAM_IAT;
export const gs9c9340FreeVa = () => GS9C9340_FREE_VA;
export const gs9c9340GameStateIoOff = () => GS9C9340_GAME_STATE_IO_OFF;
export const gs9c9340Serializer8d20Va = () => GS9C9340_SERIALIZER_8D20_VA;
export const gs9c9340Serializer87e0Va = () => GS9C9340_SERIALIZER_87E0_VA;
export const gs9c9340Serializer85d0Va = () => GS9C9340_SERIALIZER_85D0_VA;
export const gs9c9340Leaf9d77e0Va = () => GS9C9340_LEAF_9D77E0_VA;
export const gs9c9340Leaf9d45c0Va = () => GS9C9340_LEAF_9D45C0_VA;
export const gs9c9340Leaf9cec80Va = () => GS9C9340_LEAF_9CEC80_VA;
export const gs9c9340Leaf9d84d0Va = () => GS9C9340_LEAF_9D84D0_VA;
export const gs9c9340Leaf9eb5b0Va = () => GS9C9340_LEAF_9EB5B0_VA;
export const gs9c9340Leaf4288a0Va = () => GS9C9340_LEAF_4288A0_VA;
export const gs9c9340Leaf708ae0Va = () => GS9C9340_LEAF_708AE0_VA;
export const gs9c9340LeafAf05e5Va = () => GS9C9340_LEAF_AF05E5_VA;
export const gs9c9340CallerCount = () => GS9C9340_CALLER_COUNT;
export const gs9c9340CallerVaAt = (index) =>
  GS9C9340_CALLER_VAS[index >>> 0] ?? 0;

/* --- ABI v3: serializer tree 0x9c84c0..0x9c8d20 leaf laws (PURE-OPEN;
 *     bodies stay typed-host — exit-v41/pgd-v26 peel style). --- */

export const GS9C84C0_VA = 0x009c84c0;
export const GS9C84C0_END_VA = 0x009c85d0; /* ret @0x9c85cf; next body 0x9c85d0 (no pad) */
export const GS9C84C0_BODY_BYTES = 0x110;
export const GS9C84C0_NEXT_VA = 0x009c85d0;
export const GS9C84C0_ROW_WRITER_VA = 0x00683410;
export const GS9C84C0_BITMAP_GROW_VA = 0x00423090;
export const GS9C84C0_STREAM_VTBL_SLOT = 0x14;
export const GS9C84C0_LANE_BITS = 8;
export const GS9C84C0_CALLER_COUNT = 3;
export const GS9C84C0_CALLER_VAS = [0x009cdefe, 0x009d3036, 0x009d3048];
export const GS9C84C0_LANE_COUNT_GATE_VA = 0x009c850e;
export const GS9C84C0_CLEAR_GATE_VA = 0x009c851e;
export const GS9C84C0_FLUSH_GATE_VA = 0x009c8550;
export const GS9C84C0_BIT_SELECT_GATE_VA = 0x009c85ad;

export const GS9C85D0_VA = 0x009c85d0;
export const GS9C85D0_END_VA = 0x009c86d3; /* int3 pad @0x9c86d3 */
export const GS9C85D0_BODY_BYTES = 0x103;
export const GS9C85D0_NEXT_VA = 0x009c86e0;
export const GS9C85D0_ROW_WRITER_VA = 0x00683410;
export const GS9C85D0_STREAM_VTBL_SLOT = 0x1c;
export const GS9C85D0_LANE_BITS = 8;
export const GS9C85D0_CALLER_COUNT = 1;
export const GS9C85D0_CALLER_VAS = [0x009ca78a];
export const GS9C85D0_FLUSH8_GATE_VA = 0x009c8661;
export const GS9C85D0_REMAINDER_GATE_VA = 0x009c86a0;
export const GS9C85D0_BIT_TEST_GATE_VA = 0x009c864a;

export const GS9C86E0_VA = 0x009c86e0;
export const GS9C86E0_END_VA = 0x009c87d3; /* arm A ret 4 @0x9c878c; arm B ret 4 @0x9c87d0 */
export const GS9C86E0_BODY_BYTES = 0xf3;
export const GS9C86E0_NEXT_VA = 0x009c87e0;
export const GS9C86E0_STREAM_VTBL_SLOT = 0x14;
export const GS9C86E0_CALLER_COUNT = 2;
export const GS9C86E0_CALLER_VAS = [0x009cb66c, 0x009cce11];
export const GS9C86E0_SENTINEL_GATE_VA = 0x009c870b;

export const GS9C87E0_VA = 0x009c87e0;
export const GS9C87E0_END_VA = 0x009c88d3; /* arm A ret 4 @0x9c888c; arm B ret 4 @0x9c88d0 */
export const GS9C87E0_BODY_BYTES = 0xf3;
export const GS9C87E0_NEXT_VA = 0x009c88e0;
export const GS9C87E0_STREAM_VTBL_SLOT = 0x1c;
export const GS9C87E0_CALLER_COUNT = 2;
export const GS9C87E0_CALLER_VAS = [0x009c8d30, 0x009c9cd2];
export const GS9C87E0_SENTINEL_GATE_VA = 0x009c880b;

export const GS_TRIPLE_SENTINEL = 0x80000000; /* arm A layout value */

export const GS9C88E0_VA = 0x009c88e0;
export const GS9C88E0_END_VA = 0x009c8d18; /* ret @0x9c8d17; int3 @0x9c8d18 */
export const GS9C88E0_BODY_BYTES = 0x438;
export const GS9C88E0_NEXT_VA = 0x009c8d20;
export const GS9C88E0_ROW_WRITER_VA = 0x00683410;
export const GS9C88E0_STREAM_VTBL_SLOT = 0x1c;
export const GS9C88E0_CALLER_COUNT = 4;
export const GS9C88E0_CALLER_VAS = [
  0x009c8d0a, 0x009c9148, 0x009c923a, 0x009d555e,
];
export const GS9C88E0_FLAGS_BIT0_GATE_VA = 0x009c8ca3;
export const GS9C88E0_FLAGS_BIT1_GATE_VA = 0x009c8cb0;
export const GS9C88E0_BLOB_GATE_VA = 0x009c8ce6;
export const GS9C88E0_CHILD_GATE_VA = 0x009c8d04;
export const GS9C88E0_RET_TRUE_VA = 0x009c8d11;
export const GS9C88E0_FLAG_BIT0 = 0x1;
export const GS9C88E0_FLAG_BIT1 = 0x2;
export const GS9C88E0_BLOB_SIZE = 0x20;

export const GS9C8D20_VA = 0x009c8d20;
export const GS9C8D20_END_VA = 0x009c9333; /* ret 0xc @0x9c9330; int3 @0x9c9333 */
export const GS9C8D20_BODY_BYTES = 0x613;
export const GS9C8D20_NEXT_VA = 0x009c9340; /* GameState::write (lease) */
export const GS9C8D20_ROW_WRITER_VA = 0x00683410;
export const GS9C8D20_STREAM_VTBL_SLOT = 0x1c;
export const GS9C8D20_LIST_NEXT_VA = 0x00414a80; /* freestanding list-next (exit-law'd) */
export const GS9C8D20_CALLER_COUNT = 4;
export const GS9C8D20_CALLER_VAS = [
  0x009c9d3b, 0x009c9d87, 0x009cab5d, 0x009cabdd,
];
export const GS9C8D20_SLOT_GATE_VA = 0x009c8ff8;
export const GS9C8D20_TABLE_BOUND_GATE_VA = 0x009c90e5;
export const GS9C8D20_TABLE_BYTES = 0x3800; /* 448 slots x 0x20 */
export const GS9C8D20_TABLE_SLOT_STRIDE = 0x20;
export const GS9C8D20_ELEMENT_STRIDE = 0x78;
export const GS9C8D20_ELEMENT_COUNT_VA = 0x009c90f1; /* twin @0x9c91d7 */
export const GS9C8D20_COUNT_ZERO_GATE_VA = 0x009c9132;
export const GS9C8D20_COUNT_ZERO_GATE_VA_2 = 0x009c921b;
export const GS9C8D20_WALK_EMPTY_GATE_VA = 0x009c9195;
export const GS9C8D20_WALK_TAIL_GATE_VA = 0x009c91d5;

/* R1 — lane count (PE 0x009c850e cmp eax,ecx ; cmovb): UNSIGNED max. */
export function gs9c84c0LaneCount(cap, readCount) {
  const c = asU32(cap);
  const r = asU32(readCount);
  return c >= r ? c : r;
}

/* R2 — clear gate (PE 0x009c851e cmp [ebx+0xc],0 ; jbe): FULL-dword != 0. */
export function gs9c84c0ClearNeeded(count) {
  return asU32(count) !== 0 ? 1 : 0;
}

/* R3 — lane flush (PE 0x009c8550 test bx,bx ; jne): lane 0 of the group. */
export function gs9c84c0LaneFlush(lane) {
  return (asU32(lane) & 0x7) === 0 ? 1 : 0;
}

/* R4 — lane bit select (PE 0x009c85ad test byte,dl ; je btr / bts). */
export function gs9c84c0LaneBitSet(byteVal, lane) {
  return (asU32(byteVal) >> (asU32(lane) & 0x7)) & 1;
}

/* R5 — flush every 8 (PE 0x009c8661 cmp di,8 ; jne). */
export function gs9c85d0FlushEvery8(idx) {
  return asU32(idx) === 8 ? 1 : 0;
}

/* R6 — remainder flush (PE 0x009c86a0 test di,di ; je). */
export function gs9c85d0FlushRemainder(idx) {
  return asU32(idx) !== 0 ? 1 : 0;
}

/* R7 — source bit (PE 0x009c864a test [..],edx ; je / bts). */
export function gs9c85d0SourceBit(word, idx) {
  return (asU32(word) >> (asU32(idx) & 0x1f)) & 1;
}

/* R8/R9 — sentinel layout (PE 0x009c870b / 0x009c880b cmp,0x80000000 ; jne
 * arm B): FULL-dword equality with the triple sentinel. */
export function gs9c86e0SentinelLayout(firstDword) {
  return asU32(firstDword) === GS_TRIPLE_SENTINEL ? 1 : 0;
}
export function gs9c87e0SentinelLayout(firstDword) {
  return asU32(firstDword) === GS_TRIPLE_SENTINEL ? 1 : 0;
}

/* R10 — flags byte (PE 0x009c8ca3 + 0x009c8cb0): bit0 = p64 != 0,
 * bit1 = p6c != 0. */
export function gs9c88e0Flags(p64, p6c) {
  let f = 0;
  if (asU32(p64) !== 0) f |= GS9C88E0_FLAG_BIT0;
  if (asU32(p6c) !== 0) f |= GS9C88E0_FLAG_BIT1;
  return f;
}

/* R11 — blob gate (PE 0x009c8ce6 test esi,esi ; je): ptr != 0. */
export function gs9c88e0BlobPresent(ptr64) {
  return asU32(ptr64) !== 0 ? 1 : 0;
}

/* R12 — child gate (PE 0x009c8d04 test ecx,ecx ; je): ptr != 0. */
export function gs9c88e0ChildPresent(ptr6c) {
  return asU32(ptr6c) !== 0 ? 1 : 0;
}

/* R13 — result law (PE 0x009c8d11 mov al,1): constant 1. */
export function gs9c88e0ReturnsTrue() {
  return 1;
}

/* R14 — slot presence (PE 0x009c8ff8 test edi,edi ; je): WORD gate. */
export function gs9c8d20SlotPresent(slotWord) {
  return (asU32(slotWord) & 0xffff) !== 0 ? 1 : 0;
}

/* R15 — table bound (PE 0x009c90e5 cmp ecx,0x3800 ; jb): UNSIGNED. */
export function gs9c8d20TableMore(offset) {
  return asU32(offset) < GS9C8D20_TABLE_BYTES ? 1 : 0;
}

/* R16 — element count (PE 0x009c90f1 / 0x009c91d7): signed floor div-0x78
 * of the u32 diff (machine: magic 0x88888889 + sar 6 + sign correction).
 * JS mirror of the C++ trunc-then-adjust. */
export function gs9c8d20ElementCount(beginPtr, endPtr) {
  const d = (asU32(endPtr) - asU32(beginPtr)) | 0; /* int32 diff */
  let q = (d / GS9C8D20_ELEMENT_STRIDE) | 0; /* C++ truncation */
  if (d % GS9C8D20_ELEMENT_STRIDE !== 0 && d < 0) q -= 1; /* floor */
  return q >>> 0;
}

/* R17 — zero-count skip (PE 0x009c9132 / 0x009c921b cmp,0 ; jbe). */
export function gs9c8d20CountNonzero(count) {
  return asU32(count) !== 0 ? 1 : 0;
}

/* R18 — list walk (PE 0x009c9195 je empty ; 0x009c91d5 jne tail). */
export function gs9c8d20WalkContinue(node, head) {
  return asU32(node) !== asU32(head) ? 1 : 0;
}

/* --- ABI v3 accessors --- */
export const gs9c84c0Va = () => GS9C84C0_VA;
export const gs9c84c0EndVa = () => GS9C84C0_END_VA;
export const gs9c84c0BodyBytes = () => GS9C84C0_BODY_BYTES;
export const gs9c84c0NextVa = () => GS9C84C0_NEXT_VA;
export const gs9c84c0LaneCountGateVa = () => GS9C84C0_LANE_COUNT_GATE_VA;
export const gs9c84c0ClearGateVa = () => GS9C84C0_CLEAR_GATE_VA;
export const gs9c84c0FlushGateVa = () => GS9C84C0_FLUSH_GATE_VA;
export const gs9c84c0BitSelectGateVa = () => GS9C84C0_BIT_SELECT_GATE_VA;
export const gs9c84c0CallerCount = () => GS9C84C0_CALLER_COUNT;
export const gs9c84c0CallerVaAt = (index) => GS9C84C0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9c85d0Va = () => GS9C85D0_VA;
export const gs9c85d0EndVa = () => GS9C85D0_END_VA;
export const gs9c85d0BodyBytes = () => GS9C85D0_BODY_BYTES;
export const gs9c85d0NextVa = () => GS9C85D0_NEXT_VA;
export const gs9c85d0Flush8GateVa = () => GS9C85D0_FLUSH8_GATE_VA;
export const gs9c85d0RemainderGateVa = () => GS9C85D0_REMAINDER_GATE_VA;
export const gs9c85d0BitTestGateVa = () => GS9C85D0_BIT_TEST_GATE_VA;
export const gs9c85d0CallerCount = () => GS9C85D0_CALLER_COUNT;
export const gs9c85d0CallerVaAt = (index) => GS9C85D0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9c86e0Va = () => GS9C86E0_VA;
export const gs9c86e0EndVa = () => GS9C86E0_END_VA;
export const gs9c86e0BodyBytes = () => GS9C86E0_BODY_BYTES;
export const gs9c86e0NextVa = () => GS9C86E0_NEXT_VA;
export const gs9c86e0SentinelGateVa = () => GS9C86E0_SENTINEL_GATE_VA;
export const gs9c86e0CallerCount = () => GS9C86E0_CALLER_COUNT;
export const gs9c86e0CallerVaAt = (index) => GS9C86E0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9c87e0Va = () => GS9C87E0_VA;
export const gs9c87e0EndVa = () => GS9C87E0_END_VA;
export const gs9c87e0BodyBytes = () => GS9C87E0_BODY_BYTES;
export const gs9c87e0NextVa = () => GS9C87E0_NEXT_VA;
export const gs9c87e0SentinelGateVa = () => GS9C87E0_SENTINEL_GATE_VA;
export const gs9c87e0CallerCount = () => GS9C87E0_CALLER_COUNT;
export const gs9c87e0CallerVaAt = (index) => GS9C87E0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9c88e0Va = () => GS9C88E0_VA;
export const gs9c88e0EndVa = () => GS9C88E0_END_VA;
export const gs9c88e0BodyBytes = () => GS9C88E0_BODY_BYTES;
export const gs9c88e0NextVa = () => GS9C88E0_NEXT_VA;
export const gs9c88e0FlagsBit0GateVa = () => GS9C88E0_FLAGS_BIT0_GATE_VA;
export const gs9c88e0FlagsBit1GateVa = () => GS9C88E0_FLAGS_BIT1_GATE_VA;
export const gs9c88e0BlobGateVa = () => GS9C88E0_BLOB_GATE_VA;
export const gs9c88e0ChildGateVa = () => GS9C88E0_CHILD_GATE_VA;
export const gs9c88e0RetTrueVa = () => GS9C88E0_RET_TRUE_VA;
export const gs9c88e0CallerCount = () => GS9C88E0_CALLER_COUNT;
export const gs9c88e0CallerVaAt = (index) => GS9C88E0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9c8d20Va = () => GS9C8D20_VA;
export const gs9c8d20EndVa = () => GS9C8D20_END_VA;
export const gs9c8d20BodyBytes = () => GS9C8D20_BODY_BYTES;
export const gs9c8d20NextVa = () => GS9C8D20_NEXT_VA;
export const gs9c8d20SlotGateVa = () => GS9C8D20_SLOT_GATE_VA;
export const gs9c8d20TableBoundGateVa = () => GS9C8D20_TABLE_BOUND_GATE_VA;
export const gs9c8d20ElementCountVa = () => GS9C8D20_ELEMENT_COUNT_VA;
export const gs9c8d20CountZeroGateVa = () => GS9C8D20_COUNT_ZERO_GATE_VA;
export const gs9c8d20CountZeroGateVa2 = () => GS9C8D20_COUNT_ZERO_GATE_VA_2;
export const gs9c8d20WalkEmptyGateVa = () => GS9C8D20_WALK_EMPTY_GATE_VA;
export const gs9c8d20WalkTailGateVa = () => GS9C8D20_WALK_TAIL_GATE_VA;
export const gs9c8d20CallerCount = () => GS9C8D20_CALLER_COUNT;
export const gs9c8d20CallerVaAt = (index) => GS9C8D20_CALLER_VAS[index >>> 0] ?? 0;

/* --- ABI v4: GameStateIO save-orchestrator hosts 0x9cad40/0x9caea0
 *     decision laws S1..S6 + read_rerun 0x9d7d50 typed-host lease.
 *     Census + evidence: section-notes/game-state-v4-io/NOTES.md. --- */

export const GS9CAD40_VA = 0x009cad40; /* host A — cloud-write orchestrator */
export const GS9CAD40_END_VA = 0x009caea0; /* host B prologue (no pad) */
export const GS9CAD40_BODY_BYTES = 0x160;
export const GS9CAD40_NEXT_VA = 0x009caea0;
export const GS9CAD40_CALLER_COUNT = 1;
export const GS9CAD40_CALLER_VAS = [0x00958fa1]; /* exit 0x958ed0 steam+cloud arm */
export const GS9CAD40_IO_DTOR_GATE_VA = 0x009cad58;
export const GS9CAD40_POOL_SELECT_VA = 0x009cad68;
export const GS9CAD40_NAME_GATE_VA = 0x009cadb6;
export const GS9CAD40_OPEN_GATE_VA = 0x009cadcb;
export const GS9CAD40_WRITE_CALL_VA = 0x009cae15;
export const GS9CAD40_STATNAME_SSO_GATE_VA = 0x009cada1;
export const GS9CAD40_CLOSE_CALL_VA = 0x009cae22;
export const GS9CAD40_FAIL_LOG_CALL_VA = 0x009cae87;
export const GS9CAD40_FAIL_CLOSE_CALL_VA = 0x009cae97;
export const GS9CAD40_LOG_STR_VA = 0x00b7f000;

export const GS9CAEA0_VA = 0x009caea0; /* host B — rerun orchestrator */
export const GS9CAEA0_END_VA = 0x009cb01a; /* int3 pad @0x9cb01a */
export const GS9CAEA0_BODY_BYTES = 0x17a;
export const GS9CAEA0_NEXT_VA = 0x009cb020; /* reader row (next band) */
export const GS9CAEA0_CALLER_COUNT = 1;
export const GS9CAEA0_CALLER_VAS = [0x0095a0eb]; /* exit 0x95a0xx +0x26589 arm */
export const GS9CAEA0_IO_DTOR_GATE_VA = 0x009caebd;
export const GS9CAEA0_POOL_SELECT_VA = 0x009caecd;
export const GS9CAEA0_RERUN_GATE_VA = 0x009caf18;
export const GS9CAEA0_OPEN_GATE_VA = 0x009caf2d;
export const GS9CAEA0_RERUN_CALL_VA = 0x009caf77;
export const GS9CAEA0_SUCCESS_GATE_VA = 0x009caf89;
export const GS9CAEA0_SUCCESS_STORE_VA = 0x009cafe9;
export const GS9CAEA0_DELETE_RERUN_CALL_VA = 0x009caf8f;
export const GS9CAEA0_RERUN_FLAG_WORD_OFF = 0x1fdec;
export const GS9CAEA0_RERUN_SUCCESS_BYTE_OFF = 0x1fded;
export const GS9CAEA0_RERUN_STATNAME_BUF_OFF = 0x1fe0c;
export const GS9CAEA0_RERUN_STATNAME_SIZE_OFF = 0x1fe20;
export const GS9CAEA0_STATNAME_SSO_GATE_VA = 0x009caf06;
export const GS9CAEA0_LOG_STR_VA = 0x00b7f048;

export const GS_IO_VTABLE = 0x00b65724;
export const GS_IO_CTOR_VERSION = 2;
export const GS_IO_ALLOC_SIZE = 0x28;
export const GS_IO_ALLOC_IAT = 0x00b187e0;
export const GS_IO_FAIL_ALLOC_VA = 0x00a23200;
export const GS_IO_CHECKSUM_VA = 0x00683930;
export const GS_IO_CHECKSUM_SIZE = 0x100000;
export const GS_IO_POOL_GLOBAL_DAT = 0x00c7de78;
export const GS_IO_POOL_FALLBACK = 0x00c7f618;
export const GS_IO_POOL_STEP = 0x30;
export const GS_IO_VTBL_OPEN_SLOT = 0x30;
export const GS_IO_VTBL_CLOSE_SLOT = 0x34;
export const GS_IO_VTBL_RERUN_SLOT = 0x24;
export const GS_IO_VTBL_DTOR_SLOT = 0x0;
export const GS_WRITE_RECORD_SEED = 0xfedcba76;
export const GS_WRITE_RECORD_FLAGS = 1;
export const GS_READER_ROW_NEXT_VA = 0x009cb020;

export const GS9D7D50_VA = 0x009d7d50; /* GameState::read_rerun (exact ZHL; typed-host lease) */
export const GS9D7D50_END_VA = 0x009d8183;
export const GS9D7D50_BODY_BYTES = 0x433;
export const GS9D7D50_NEXT_VA = 0x009d8190;
export const GS9D7D50_CALLER_COUNT = 2;
export const GS9D7D50_CALLER_VAS = [0x0095a3c8, 0x009caf77];
export const GS9D7D50_CHECKSUM_XOR = 0x96696996;
export const GS9D7D50_CHECKSUM_OFF = 0x1fda8;
export const GS9D7D50_VERSION_OFF = 0x1fdf0;
export const GS9D7D50_RERUN_SUCCESS_BYTE_OFF = 0x1fded;
export const GS9D7D50_GS_COOKIE_DAT = 0x00bf93b4;
export const GS9D7D50_COOKIE_TAIL_VA = 0x00aef12b;

export const GS9D45C0_END_VA = 0x009d71a1; /* writer giant (v11 split; ret 4 @0x9d719e) */
export const GS9D45C0_BODY_BYTES = 0x2be1;
export const GS9D45C0_NEXT_VA = 0x009d71b0;
export const GS9D77E0_END_VA = 0x009d7d49; /* sub-object serializer */
export const GS9D77E0_BODY_BYTES = 0x569;
export const GS9D77E0_NEXT_VA = 0x009d7d50;
export const GS9CEC80_END_VA = 0x009ceff1; /* u32-array serializer (v11 span fix; ret 4 @0x9cefee) */
export const GS9CEC80_BODY_BYTES = 0x171;
export const GS9CEC80_NEXT_VA = 0x009cf000;
export const GS9D84D0_END_VA = 0x009d8549; /* u32-array count serializer (twin of 0x9cec80 header) */
export const GS9D84D0_BODY_BYTES = 0x79;
export const GS9D84D0_NEXT_VA = 0x009d8550;
export const GS9D84A0_END_VA = 0x009d84cf; /* u32 row-writer leaf */
export const GS9D84A0_BODY_BYTES = 0x2f;
export const GS9D84A0_NEXT_VA = 0x009d84d0;
export const GS9D8550_END_VA = 0x009d857f; /* u8 row-writer leaf */
export const GS9D8550_BODY_BYTES = 0x2f;
export const GS9D8550_NEXT_VA = 0x009d8580;

/**
 * S1 — allocation-pool select (PE 0x009cad68, twin 0x009caecd):
 * `test esi,esi ; je / add esi,0x30 / mov esi,0xc7f618` — FULL-dword
 * presence of [0xc7de78]; nonzero selects pool + 0x30 (u32 wrap), zero
 * selects the fallback pool. Returns the selected pool ADDRESS.
 */
export function gs9cad40PoolSelect(poolGlobal) {
  const p = asU32(poolGlobal);
  return p !== 0 ? (p + GS_IO_POOL_STEP) >>> 0 : GS_IO_POOL_FALLBACK;
}

/**
 * S2 — stat-name checksum gate (PE 0x009cadb6 `test al,al ; je fail`):
 * LOW-BYTE AL of 0x683930(name, 0x100000); mask & 0xff INSIDE (0x100 ->
 * byte 0x00 -> fail path).
 */
export function gs9cad40NameGateOk(checksumAl) {
  return (asU32(checksumAl) & 0xff) !== 0 ? 1 : 0;
}

/**
 * S3 — stream-open gate (PE 0x009cadcb, twin 0x009caf2d `test al,al ;
 * je fail`): LOW-BYTE AL of the vtbl+0x30 stream-open call.
 */
export function gs9cad40OpenGateOk(openAl) {
  return (asU32(openAl) & 0xff) !== 0 ? 1 : 0;
}

/**
 * S4 — rerun stat-name-arm gate (PE 0x009caf18 `test al,al ; je fail`):
 * LOW-BYTE AL of the vtbl+0x24 call (host B).
 */
export function gs9caea0RerunGateOk(rerunAl) {
  return (asU32(rerunAl) & 0xff) !== 0 ? 1 : 0;
}

/**
 * S5 — rerun-success byte store law (PE 0x009caf89 `test bl,bl ; jne
 * 0x9cafe9` + 0x009cafe9 `mov byte [edi+0x1fded],1 ; mov al,1`): LOW-BYTE
 * of GameState::read_rerun's bool AL; nonzero -> the byte stored at
 * [GameState+0x1fded] is 1 (and the function returns 1); zero ->
 * DeleteRerun fallback + 0.
 */
export function gs9caea0RerunSuccess(readRerunAl) {
  return (asU32(readRerunAl) & 0xff) !== 0 ? 1 : 0;
}

/**
 * S6 — release-old-IO gate (PE 0x009cad58, twin 0x009caebd `test ecx,ecx
 * ; je`): FULL-dword presence of the existing GameStateIO* at
 * [GameState+0x1fe24] -> vtbl+0 dtor release. Same field+shape as exit
 * v46 isaac_exit_958ed0_io_dtor_needed (GameState-owned twin).
 */
export function gs9cad40IoDtorNeeded(ioPtr1fe24) {
  return asU32(ioPtr1fe24) !== 0 ? 1 : 0;
}

/* --- ABI v4 accessors --- */
export const gs9cad40Va = () => GS9CAD40_VA;
export const gs9cad40EndVa = () => GS9CAD40_END_VA;
export const gs9cad40BodyBytes = () => GS9CAD40_BODY_BYTES;
export const gs9cad40NextVa = () => GS9CAD40_NEXT_VA;
export const gs9cad40IoDtorGateVa = () => GS9CAD40_IO_DTOR_GATE_VA;
export const gs9cad40PoolSelectVa = () => GS9CAD40_POOL_SELECT_VA;
export const gs9cad40NameGateVa = () => GS9CAD40_NAME_GATE_VA;
export const gs9cad40OpenGateVa = () => GS9CAD40_OPEN_GATE_VA;
export const gs9cad40WriteCallVa = () => GS9CAD40_WRITE_CALL_VA;
export const gs9cad40StatnameSsoGateVa = () => GS9CAD40_STATNAME_SSO_GATE_VA;
export const gs9cad40CloseCallVa = () => GS9CAD40_CLOSE_CALL_VA;
export const gs9cad40FailLogCallVa = () => GS9CAD40_FAIL_LOG_CALL_VA;
export const gs9cad40FailCloseCallVa = () => GS9CAD40_FAIL_CLOSE_CALL_VA;
export const gs9cad40LogStrVa = () => GS9CAD40_LOG_STR_VA;
export const gs9cad40CallerCount = () => GS9CAD40_CALLER_COUNT;
export const gs9cad40CallerVaAt = (index) => GS9CAD40_CALLER_VAS[index >>> 0] ?? 0;
export const gs9caea0Va = () => GS9CAEA0_VA;
export const gs9caea0EndVa = () => GS9CAEA0_END_VA;
export const gs9caea0BodyBytes = () => GS9CAEA0_BODY_BYTES;
export const gs9caea0NextVa = () => GS9CAEA0_NEXT_VA;
export const gs9caea0IoDtorGateVa = () => GS9CAEA0_IO_DTOR_GATE_VA;
export const gs9caea0PoolSelectVa = () => GS9CAEA0_POOL_SELECT_VA;
export const gs9caea0RerunGateVa = () => GS9CAEA0_RERUN_GATE_VA;
export const gs9caea0OpenGateVa = () => GS9CAEA0_OPEN_GATE_VA;
export const gs9caea0RerunCallVa = () => GS9CAEA0_RERUN_CALL_VA;
export const gs9caea0SuccessGateVa = () => GS9CAEA0_SUCCESS_GATE_VA;
export const gs9caea0SuccessStoreVa = () => GS9CAEA0_SUCCESS_STORE_VA;
export const gs9caea0DeleteRerunCallVa = () => GS9CAEA0_DELETE_RERUN_CALL_VA;
export const gs9caea0RerunFlagWordOff = () => GS9CAEA0_RERUN_FLAG_WORD_OFF;
export const gs9caea0RerunSuccessByteOff = () => GS9CAEA0_RERUN_SUCCESS_BYTE_OFF;
export const gs9caea0RerunStatnameBufOff = () => GS9CAEA0_RERUN_STATNAME_BUF_OFF;
export const gs9caea0RerunStatnameSizeOff = () => GS9CAEA0_RERUN_STATNAME_SIZE_OFF;
export const gs9caea0StatnameSsoGateVa = () => GS9CAEA0_STATNAME_SSO_GATE_VA;
export const gs9caea0LogStrVa = () => GS9CAEA0_LOG_STR_VA;
export const gs9caea0CallerCount = () => GS9CAEA0_CALLER_COUNT;
export const gs9caea0CallerVaAt = (index) => GS9CAEA0_CALLER_VAS[index >>> 0] ?? 0;
export const gsIoVtable = () => GS_IO_VTABLE;
export const gsIoCtorVersion = () => GS_IO_CTOR_VERSION;
export const gsIoAllocSize = () => GS_IO_ALLOC_SIZE;
export const gsIoAllocIat = () => GS_IO_ALLOC_IAT;
export const gsIoFailAllocVa = () => GS_IO_FAIL_ALLOC_VA;
export const gsIoChecksumVa = () => GS_IO_CHECKSUM_VA;
export const gsIoChecksumSize = () => GS_IO_CHECKSUM_SIZE;
export const gsIoPoolGlobalDat = () => GS_IO_POOL_GLOBAL_DAT;
export const gsIoPoolFallback = () => GS_IO_POOL_FALLBACK;
export const gsIoPoolStep = () => GS_IO_POOL_STEP;
export const gsIoVtblOpenSlot = () => GS_IO_VTBL_OPEN_SLOT;
export const gsIoVtblCloseSlot = () => GS_IO_VTBL_CLOSE_SLOT;
export const gsIoVtblRerunSlot = () => GS_IO_VTBL_RERUN_SLOT;
export const gsIoVtblDtorSlot = () => GS_IO_VTBL_DTOR_SLOT;
export const gsWriteRecordSeed = () => GS_WRITE_RECORD_SEED;
export const gsWriteRecordFlags = () => GS_WRITE_RECORD_FLAGS;
export const gs9d7d50Va = () => GS9D7D50_VA;
export const gs9d7d50EndVa = () => GS9D7D50_END_VA;
export const gs9d7d50BodyBytes = () => GS9D7D50_BODY_BYTES;
export const gs9d7d50NextVa = () => GS9D7D50_NEXT_VA;
export const gs9d7d50CallerCount = () => GS9D7D50_CALLER_COUNT;
export const gs9d7d50CallerVaAt = (index) => GS9D7D50_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d7d50ChecksumXor = () => GS9D7D50_CHECKSUM_XOR;
export const gs9d7d50ChecksumOff = () => GS9D7D50_CHECKSUM_OFF;
export const gs9d7d50VersionOff = () => GS9D7D50_VERSION_OFF;
export const gs9d7d50RerunSuccessByteOff = () => GS9D7D50_RERUN_SUCCESS_BYTE_OFF;
export const gs9d7d50GsCookieDat = () => GS9D7D50_GS_COOKIE_DAT;
export const gs9d7d50CookieTailVa = () => GS9D7D50_COOKIE_TAIL_VA;
export const gs9d45c0EndVa = () => GS9D45C0_END_VA;
export const gs9d45c0BodyBytes = () => GS9D45C0_BODY_BYTES;
export const gs9d45c0NextVa = () => GS9D45C0_NEXT_VA;
export const gs9d77e0EndVa = () => GS9D77E0_END_VA;
export const gs9d77e0BodyBytes = () => GS9D77E0_BODY_BYTES;
export const gs9d77e0NextVa = () => GS9D77E0_NEXT_VA;
export const gs9cec80EndVa = () => GS9CEC80_END_VA;
export const gs9cec80BodyBytes = () => GS9CEC80_BODY_BYTES;
export const gs9cec80NextVa = () => GS9CEC80_NEXT_VA;
export const gs9d84d0EndVa = () => GS9D84D0_END_VA;
export const gs9d84d0BodyBytes = () => GS9D84D0_BODY_BYTES;
export const gs9d84d0NextVa = () => GS9D84D0_NEXT_VA;
export const gs9d84a0EndVa = () => GS9D84A0_END_VA;
export const gs9d84a0BodyBytes = () => GS9D84A0_BODY_BYTES;
export const gs9d84a0NextVa = () => GS9D84A0_NEXT_VA;
export const gs9d8550EndVa = () => GS9D8550_END_VA;
export const gs9d8550BodyBytes = () => GS9D8550_BODY_BYTES;
export const gs9d8550NextVa = () => GS9D8550_NEXT_VA;
export const gs9cb020Va = () => GS_READER_ROW_NEXT_VA;
export const gs9cb020CallerCount = () => 4;
export const gs9cb020CallerVaAt = (index) =>
  [0x009cb5ee, 0x009cbe40, 0x009cbf83, 0x009d1df0][index >>> 0] ?? 0;

/* --- ABI v5: write-span loop/decision laws W1..W22 (0x9c9340 peel) +
 *     0x9c8d20 element-loop bounds U1 + 0x683930 name-gate law N1.
 *     Census + evidence: section-notes/game-state-v4-cloud/NOTES.md. --- */

/* --- 0x9c8d20 tail: element-loop bounds (U1) --- */
export const GS9C8D20_ELEMENT_LOOP_MORE_VA = 0x009c9157; /* twin @0x9c9249 */
export const GS9C8D20_ELEMENT_LOOP_MORE_VA_2 = 0x009c9249;

/* --- write-span loop/decision gate VAs + offsets (0x9c9340 body) --- */
export const GS9C9340_HASH_COUNT_GATE_VA = 0x009c9ca0;
export const GS9C9340_HASH_PROBE_VA = 0x009c9cc0;
export const GS9C9340_HASH_BOUND_GATE_VA = 0x009c9cd8;
export const GS9C9340_VALUE_COUNT_GATE_VA = 0x009c9d17;
export const GS9C9340_VALUE_BOUND_GATE_VA = 0x009c9d5c;
export const GS9C9340_REORDER_NEG_GATE_VA = 0x009c9dc5;
export const GS9C9340_REORDER_FLUSH_GATE_VA = 0x009c9dcf;
export const GS9C9340_REORDER_RUN_WORD_VA = 0x009c9dd5;
export const GS9C9340_REORDER_FINAL_FLUSH_VA = 0x009c9e07;
export const GS9C9340_DIV0XC_COUNT_VA = 0x009ca858; /* twin in-loop @0x9ca9c6 */
export const GS9C9340_DIV0XC_RESIZE_GATE_VA = 0x009ca868;
export const GS9C9340_DIV0XC_COUNT_BYTE_VA = 0x009ca8ad;
export const GS9C9340_DIV0XC_NEEDED_GATE_VA = 0x009ca8fd;
export const GS9C9340_DIV0XC_BOUND_GATE_VA = 0x009ca9e1;
export const GS9C9340_LANE7_COUNT_VA = 0x009caa9c;
export const GS9C9340_LANE7_MORE_VA = 0x009cac22;
export const GS9C9340_BYTE_COUNT_NEEDED_VA = 0x009cab2a; /* twin @0x9cabb9 */
export const GS9C9340_BYTE_COUNT_NEEDED_VA_2 = 0x009cabb9;
export const GS9C9340_BYTE_COUNT_MORE_VA = 0x009cab70; /* twin @0x9cabf0 */
export const GS9C9340_BYTE_COUNT_MORE_VA_2 = 0x009cabf0;
export const GS9C9340_FINALIZE_MODE_GATE_VA = 0x009cacb2;
export const GS9C9340_FINALIZE_PARTIAL_GATE_VA = 0x009cacbb;
export const GS9C9340_FINALIZE_PAD_VA = 0x009cacbf;
export const GS9C9340_FINALIZE_FOLD_VA = 0x009cacdc;
export const GS9C9340_CHECKSUM_STORE_XOR_VA = 0x009cad00;
export const GS9C9340_HASH_TABLE_OFF = 0x19520;
export const GS9C9340_HASH_CAP_OFF = 0x19524;
export const GS9C9340_HASH_STATE_OFF = 0x19528;
export const GS9C9340_HASH_COUNT_OFF = 0x1952c;
export const GS9C9340_VALUE_COUNT_OFF = 0x19c;
export const GS9C9340_VALUE_BASE_OFF = 0x1a0;
export const GS9C9340_HOLDER_BASE_OFF = 0x17c68;
export const GS9C9340_VALUE_STRIDE = 0xb8;
export const GS9C9340_HOLDER_STRIDE = 0xc;
export const GS9C9340_REORDER_TABLE_OFF = 0x19530;
export const GS9C9340_REORDER_ENTRIES = 0x1fb;
export const GS9C9340_REORDER_RUN_MARKER = 0x8000;
export const GS9C9340_DIV0XC_BEGIN_OFF = 0x1e790;
export const GS9C9340_DIV0XC_MAGIC = 0x2aaaaaab;
export const GS9C9340_DIV0XC_DIVISOR = 0xc;
export const GS9C9340_DIV0XC_CAP = 0xff;
export const GS9C9340_LANE7_BASE_OFF = 0x1ead0;
export const GS9C9340_LANE7_STRIDE = 0x320;
export const GS9C9340_LANE7_COUNT = 0x7;
export const GS9C9340_CHECKSUM_OFF = 0x1fda4;
export const GS9C9340_CHECKSUM_XOR = 0x96696996;
export const GS9C9340_STATE_MODE_OFF = 0xc;
export const GS9C9340_STATE_PARTIAL_OFF = 0x4;
export const GS9C9340_STATE_ACC_OFF = 0x8;
export const GS9C9340_STATE_LANE_OFF = 0x0;

/* --- 0x683930 name-gate helper (N1) --- */
export const GS683930_VA = 0x00683930;
export const GS683930_END_VA = 0x006839a0;
export const GS683930_BODY_BYTES = 0x70;
export const GS683930_NEXT_VA = 0x006839b0;
export const GS683930_STEAM_IAT = 0x00b18a1c;
export const GS683930_STEAM_ARG = 0x00c5c3a4;
export const GS683930_STEAM_GATE_VA = 0x0068394a;
export const GS683930_CALLER_COUNT = 3;
export const GS683930_CALLER_VAS = [0x00928f7b, 0x009592ef, 0x009cadb1];

/* --- ABI v6: reader row 0x9cb020 format gates R1..R14 (typed-host
 *     lease) + fixed-count serializer loop laws T1..T4 (0x9c9c30 0xe /
 *     0x9c9d66 0x14).  Census + evidence:
 *     section-notes/game-state-v6-reader/NOTES.md. --- */

/* --- reader row 0x9cb020 identifiers --- */
export const GS9CB020_VA = 0x009cb020; /* fastcall-style bool GameState::read(GameStateIO*) (ecx=this, edx=io) */
export const GS9CB020_END_VA = 0x009cb619; /* int3 pad 0x9cb619..0x9cb61f */
export const GS9CB020_BODY_BYTES = 0x5f9;
export const GS9CB020_NEXT_VA = 0x009cb620; /* SEH/GS reader body (F15's 6->7 lane) */
export const GS9CB020_FORMAT_OFF = 0x8; /* io+8 format counter (read_rerun @0x9d7e8f) */
export const GS9CB020_VTBL14_SLOT = 0x14; /* stream read slot */
export const GS9CB020_ROW_WRITER_VA = 0x00683410;
export const GS9CB020_RECURSE_CALL_VA = 0x009cb5ee; /* self-recursion */
export const GS9CB020_SUB64_CTOR_VA = 0x00827f70;
export const GS9CB020_SUB6C_CTOR_VA = 0x006eee10;
export const GS9CB020_FLAGS_OFF = 0x60;
export const GS9CB020_SUB64_OFF = 0x64;
export const GS9CB020_SUB6C_OFF = 0x6c;
export const GS9CB020_SUB64_ALLOC = 0x24;
export const GS9CB020_SUB6C_ALLOC = 0x7c;
export const GS9CB020_SUB64_BYTES = 0x20;
export const GS9CB020_OLD_COMPAT_TYPE = 0x4;
export const GS9CB020_ALLOC_IAT = 0x00b187e0;
export const GS9CB020_FAIL_ALLOC_VA = 0x00a23200;
export const GS9CB020_GATE_0X3B_VA = 0x009cb122;
export const GS9CB020_GATE_0X46_VA = 0x009cb466;
export const GS9CB020_GATE_0X47_VA = 0x009cb179;
export const GS9CB020_GATE_0X5B_VA = 0x009cb254;
export const GS9CB020_GATE_0X67_VA = 0x009cb500;
export const GS9CB020_GATE_0X6C_VA = 0x009cb4d0;
export const GS9CB020_GATE_0X88_VA = 0x009cb1cb;
export const GS9CB020_GATE_0X96_VA = 0x009cb3ae;
export const GS9CB020_GATE_0X9E_VA = 0x009cb49a;
export const GS9CB020_OLD_U64_GATE_VA = 0x009cb302;
export const GS9CB020_BIT0_GATE_VA = 0x009cb53b;
export const GS9CB020_BIT1_GATE_VA = 0x009cb5ad;
export const GS9CB020_BYTE_TO_BOOL_VA = 0x009cb2aa;
export const GS9CB020_TYPE4_GATE_VA = 0x009cb33b;
export const GS9CB020_CALLER_COUNT = 4;
export const GS9CB020_CALLER_VAS = [0x009cb5ee, 0x009cbe40, 0x009cbf83, 0x009d1df0];

/* --- fixed-count serializer loops (write-span peel; bodies typed-host) --- */
export const GS9C9C30_FIXED_COUNT = 0xe;
export const GS9C9C30_COUNT_STORE_VA = 0x009c9c24;
export const GS9C9C30_LOOP_HEAD_VA = 0x009c9c30;
export const GS9C9C30_MORE_VA = 0x009c9c57;
export const GS9C9C30_BASE_OFF = 0x164;
export const GS9C9C30_STRIDE = 0x4;
export const GS9C9D66_FIXED_COUNT = 0x14;
export const GS9C9D66_COUNT_STORE_VA = 0x009c9d6c;
export const GS9C9D66_LOOP_HEAD_VA = 0x009c9d84;
export const GS9C9D66_MORE_VA = 0x009c9d95;
export const GS9C9D66_VALUE_BASE_OFF = 0x16e08;
export const GS9C9D66_HOLDER_BASE_OFF = 0x1942c;
export const GS9C9D66_VALUE_STRIDE = 0xb8;
export const GS9C9D66_HOLDER_STRIDE = 0xc;

/* --- ABI v7: reorder-table loop bound + value word, 7-lane per-lane
 *     geometry (census game-state-v6-loops/NOTES.md) --- */
export const GS9C9340_REORDER_LOOP_MORE_VA = 0x009c9dfe;
export const GS9C9340_REORDER_LOOP_MORE_JNE_VA = 0x009c9e05;
export const GS9C9340_REORDER_VALUE_WORD_VA = 0x009c9dc2;
export const GS9C9340_REORDER_VALUE_STORE_VA = 0x009c9df0;
export const GS9C9340_LANE7_LANE_BASE_VA = 0x009caa97;
export const GS9C9340_LANE7_STRIDE_ADD_VA = 0x009cac1c;
export const GS9C9340_LANE7_ELEM1_VALUE_VA = 0x009cab43;
export const GS9C9340_LANE7_ELEM1_HOLDER_VA = 0x009cab53;
export const GS9C9340_LANE7_ELEM2_VALUE_VA = 0x009cabc4;
export const GS9C9340_LANE7_ELEM2_HOLDER_VA = 0x009cabca;
export const GS9C9340_LANE7_ELEM1_VALUE_OFF = 0xfffffce4; /* -0x31c */
export const GS9C9340_LANE7_ELEM1_HOLDER_OFF = 0xfffffe54; /* -0x1ac */
export const GS9C9340_LANE7_ELEM2_VALUE_OFF = 0xfffffe6c; /* -0x194 */
export const GS9C9340_LANE7_ELEM2_HOLDER_OFF = 0xffffffdc; /* -0x24 */
export const GS9C9340_LANE7_BYTE_OFF_1 = 0xfffffffc; /* -4 (recipe rail) */
export const GS9C9340_LANE7_BYTE_OFF_2 = 0xfffffff4; /* -0xc (count1 byte) */
export const GS9C9340_LANE7_BYTE_OFF_3 = 0xfffffff8; /* -8 (count2 byte) */
export const GS9C9340_LANE7_BYTE_OFF_4 = 0x0;

/* --- ABI v8: pill reader 0x9cb620..0x9cc18d (typed-host lease; laws
 *     V1..V20; census game-state-v8-body/NOTES.md) --- */

export const GS9CB620_VA = 0x009cb620; /* thiscall bool read_pill(holders, values, io) (ZHL EMPTY) */
export const GS9CB620_END_VA = 0x009cc18e; /* first non-body byte (int3 pad) */
export const GS9CB620_BODY_BYTES = 0xa6e;
export const GS9CB620_NEXT_VA = 0x009cc1a0; /* giant read entry (SEH 0xb0f33b) */
export const GS9CB620_SEH_HANDLER_DAT = 0x00b0f300;
export const GS9CB620_IO_FORMAT_OFF = 0x8; /* io+8 counter (shared: reader row R1..R10) */
export const GS9CB620_GS_FORMAT_OFF = 0x1fdf0; /* GameState format counter (stored into io+8 by the 0x9cc1a0 reader) */
export const GS9CB620_IO_VTBL10_SLOT = 0x10; /* io-ready call slot */
export const GS9CB620_VTBL14_SLOT = 0x14;
export const GS9CB620_ROW_WRITER_VA = 0x00683410;
export const GS9CB620_SERIALIZER_ROW_CALL_VA = 0x009cb66c; /* -> 0x9c86e0 */
export const GS9CB620_READER_ROW_CALL_74_VA = 0x009cbe40; /* -> 0x9cb020 (+0x74 array) */
export const GS9CB620_READER_ROW_CALL_88_VA = 0x009cbf83; /* -> 0x9cb020 (+0x88 array) */
export const GS9CB620_VECTOR_CTOR_VA = 0x007dc9b0;
export const GS9CB620_VECTOR_INIT_VA = 0x00424540;
export const GS9CB620_LIST_INSERT_VA = 0x004e45c0;
export const GS9CB620_STRING_COPY_VA = 0x007e90f0;
export const GS9CB620_STRING_EMPTY_DAT = 0x00b1f7e0;
export const GS9CB620_FLAGS_OFF = 0x44; /* the bit-OR flags dword */
export const GS9CB620_FLAG_BIT_0 = 0x1;
export const GS9CB620_FLAG_BIT_1 = 0x2;
export const GS9CB620_FLAG_BIT_2 = 0x4;
export const GS9CB620_FLAG_BIT_3 = 0x8;
export const GS9CB620_FLAG_BIT_4 = 0x10;
export const GS9CB620_FLAG_BIT_5 = 0x20;
export const GS9CB620_TABLE_OFF = 0x68; /* 0x3800-byte slot table (448 x 0x20) */
export const GS9CB620_TABLE_BYTES = 0x3800;
export const GS9CB620_TABLE_STRIDE = 0x20;
export const GS9CB620_TABLE_SLOTS = 0x1c0;
export const GS9CB620_ARRAY74_OFF = 0x74; /* 0x78-stride element arrays */
export const GS9CB620_ARRAY88_OFF = 0x88;
export const GS9CB620_ARRAY_STRIDE = 0x78;
export const GS9CB620_FIXED8_COUNT = 0x8;
export const GS9CB620_FIXED8_COUNT_STORE_VA = 0x009cc11b;
export const GS9CB620_FIXED8_MORE_VA = 0x009cc145;
export const GS9CB620_IO_READY_GATE_VA = 0x009cb65d;
export const GS9CB620_IO_READY_GATE_VA_2 = 0x009cbe30;
export const GS9CB620_IO_READY_GATE_VA_3 = 0x009cbec0;
export const GS9CB620_IO_READY_GATE_VA_4 = 0x009cbf70;
export const GS9CB620_IO_GATE_0X3D_VA = 0x009cba1b;
export const GS9CB620_IO_GATE_0X4B_VA = 0x009cbb0a;
export const GS9CB620_IO_GATE_0X7B_VA = 0x009cbb77;
export const GS9CB620_IO_GATE_0X7B_JNE_VA = 0x009cbb85;
export const GS9CB620_IO_GATE_0X7D_VA = 0x009cb671;
export const GS9CB620_IO_GATE_0X7D_JNE_VA = 0x009cb67e;
export const GS9CB620_GS_GATE_0X21_VA = 0x009cbd86;
export const GS9CB620_GS_GATE_0X3F_VA = 0x009cb835;
export const GS9CB620_GS_GATE_0X3F_JNE_VA = 0x009cb83f;
export const GS9CB620_GS_GATE_0X49_VA = 0x009cbfad;
export const GS9CB620_GS_GATE_0X49_JNE_VA = 0x009cbfb4;
export const GS9CB620_GS_GATE_0X82_VA = 0x009cb875;
export const GS9CB620_SLOT_COUNT_GATE_VA = 0x009cbbb1;
export const GS9CB620_STRING_COPY_GATE_VA = 0x009cbb3a;
export const GS9CB620_SLOT_POSITIVE_VA = 0x009cbc57;
export const GS9CB620_SLOT_MORE_VA = 0x009cbdc0;
export const GS9CB620_ARRAY74_NEEDED_VA = 0x009cbe08;
export const GS9CB620_ARRAY74_MORE_VA = 0x009cbe50;
export const GS9CB620_ARRAY88_NEEDED_VA = 0x009cbf43;
export const GS9CB620_ARRAY88_MORE_VA = 0x009cbf93;
export const GS9CB620_FLAG_GATE_VA = 0x009cb93b;
export const GS9CB620_FLAG_BIT1_OR_VA = 0x009cb994;
export const GS9CB620_FLAG_BIT2_OR_VA = 0x009cb9c0;
export const GS9CB620_FLAG_BIT3_OR_VA = 0x009cb9ec;
export const GS9CB620_FLAG_BIT4_OR_VA = 0x009cba18;
export const GS9CB620_FLAG_BIT5_OR_VA = 0x009cba72;
export const GS9CB620_CALLER_COUNT = 4;
export const GS9CB620_CALLER_VAS = [
  0x009ccf75, 0x009ccfe8, 0x009ce33f, 0x009ce3ce,
];

/**
 * U1 — 0x9c8d20 element-loop bound (PE 0x009c9157, twin 0x009c9249
 * `cmp eax,count ; jb`): UNSIGNED idx < count — the two div-0x78
 * element serialization loops (count = R16 law output). 0x100 present.
 */
export function gs9c8d20ElementLoopMore(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}

/**
 * W1 — hash-table loop entry (PE 0x009c9ca0 `cmp [esi+0x1952c],0 ;
 * jbe`): UNSIGNED count != 0.
 */
export function gs9c9340HashCountNonzero(count1952c) {
  return asU32(count1952c) !== 0 ? 1 : 0;
}

/**
 * W2 — hash probe slot (PE 0x009c9cc0): (idx + hash) & (cap - 1),
 * u32 wrap — the probe index law.
 */
export function gs9c9340HashProbeSlot(idx, hash19528, cap19524) {
  return ((asU32(idx) + asU32(hash19528)) & (asU32(cap19524) - 1)) >>> 0;
}

/**
 * W3 — hash loop bound (PE 0x009c9cd8): UNSIGNED idx < count.
 */
export function gs9c9340HashLoopMore(idx, count1952c) {
  return asU32(idx) < asU32(count1952c) ? 1 : 0;
}

/**
 * W4 — value-array loop entry (PE 0x009c9d17): UNSIGNED count != 0.
 */
export function gs9c9340ValueCountNonzero(count19c) {
  return asU32(count19c) !== 0 ? 1 : 0;
}

/**
 * W5 — value loop bound (PE 0x009c9d5c): UNSIGNED idx < count.
 */
export function gs9c9340ValueLoopMore(idx, count19c) {
  return asU32(idx) < asU32(count19c) ? 1 : 0;
}

/**
 * W6 — reorder entry sign (PE 0x009c9dc5 `test eax,eax ; jns`): SIGNED
 * (int64)(int32)entry < 0 — wasm32 compare-flip class; 0xffffffff /
 * 0x80000000 ARE negative.
 */
export function gs9c9340ReorderEntryNegative(entry) {
  const e = asU32(entry) | 0;
  return e < 0 ? 1 : 0;
}

/**
 * W7 — reorder pending-run flush (PE 0x009c9dcf `test cx,cx ; je`):
 * WORD gate (pending & 0xffff) != 0.
 */
export function gs9c9340ReorderPendingFlush(pending) {
  return (asU32(pending) & 0xffff) !== 0 ? 1 : 0;
}

/**
 * W8 — reorder run word (PE 0x009c9dd5 `dec ecx ; or ecx,0x8000 ; mov
 * word`): (((pending - 1) | 0x8000) & 0xffff).
 */
export function gs9c9340ReorderRunWord(pending) {
  return (((asU32(pending) - 1) | GS9C9340_REORDER_RUN_MARKER) & 0xffff) >>> 0;
}

/**
 * W9 — reorder post-loop tail flush (PE 0x009c9e07): WORD gate.
 */
export function gs9c9340ReorderFinalFlush(pending) {
  return (asU32(pending) & 0xffff) !== 0 ? 1 : 0;
}

/**
 * W10 — div-0xc element count (PE 0x009ca858, twin in-loop 0x009ca9c6):
 * NO-ADD magic form — q = (hi >> 1) + ((uint32)(hi >> 1) >> 31) with
 * hi = high dword of (int64)(int32)(end - begin) * 0x2aaaaaab.
 * TRUNCATION toward zero (NOT floor: -13 -> 0xffffffff, INT32_MIN ->
 * 0xf5555556).
 */
export function gs9c9340Div0xcCount(beginOff, endOff) {
  const diff = (asU32(endOff) - asU32(beginOff)) | 0; /* int32 diff */
  const prod = BigInt(diff) * BigInt(GS9C9340_DIV0XC_MAGIC);
  const hi = Number(prod >> 32n) | 0; /* imul edx */
  const sar = hi >> 1; /* sar edx,1 */
  const sign = (sar >>> 31) & 1; /* shr eax,0x1f */
  return (sar + sign) >>> 0; /* add eax,edx */
}

/**
 * W11 — div-0xc resize trigger (PE 0x009ca868 `cmp eax,0xff ; jbe`):
 * UNSIGNED count > 0xff.
 */
export function gs9c9340Div0xcResizeNeeded(count) {
  return asU32(count) > GS9C9340_DIV0XC_CAP ? 1 : 0;
}

/**
 * W12 — div-0xc count byte (PE 0x009ca8ad): count & 0xff (0x100 -> 0).
 */
export function gs9c9340Div0xcCountByte(count) {
  return asU32(count) & 0xff;
}

/**
 * W13 — div-0xc loop entry (PE 0x009ca8fd `je 0x9ca9ef`): count != 0.
 */
export function gs9c9340Div0xcLoopNeeded(count) {
  return asU32(count) !== 0 ? 1 : 0;
}

/**
 * W14 — div-0xc loop bound (PE 0x009ca9e1): UNSIGNED idx < count.
 */
export function gs9c9340Div0xcLoopMore(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}

/**
 * W15 — 7-lane count (PE 0x009caa9c): constant 7.
 */
export function gs9c9340Lane7Count() {
  return GS9C9340_LANE7_COUNT;
}

/**
 * W16 — 7-lane loop bound (PE 0x009cac22 `sub [ebp-0x44c],1 ; jne`):
 * (remaining - 1) != 0 u32 — the countdown 7..1.
 */
export function gs9c9340Lane7LoopMore(remaining) {
  return (asU32(remaining) - 1) !== 0 ? 1 : 0;
}

/**
 * W17 — signed byte-count loop entry (PE 0x009cab2a, twin 0x009cabb9
 * `cmp byte,0 ; jle skip`): SIGNED byte (int8)(count & 0xff) > 0
 * (0x80..0xff negative -> skip; wasm32 compare-flip class).
 */
export function gs9c9340ByteCountNeeded(countByte) {
  const b = asU32(countByte) & 0xff;
  const s = b >= 0x80 ? b - 0x100 : b; /* sign-extend int8 */
  return s > 0 ? 1 : 0;
}

/**
 * W18 — signed byte-count loop bound (PE 0x009cab70, twin 0x009cabf0
 * `cmp al,byte ; jl`): (int8)(i & 0xff) < (int8)(count & 0xff).
 */
export function gs9c9340ByteCountMore(iByte, countByte) {
  const i = asU32(iByte) & 0xff;
  const c = asU32(countByte) & 0xff;
  const si = i >= 0x80 ? i - 0x100 : i;
  const sc = c >= 0x80 ? c - 0x100 : c;
  return si < sc ? 1 : 0;
}

/**
 * W19 — checksum mode-0 finalize gate (PE 0x009cacb2 + 0x009cacbb):
 * (mode == 0) FULL-dword && ((partial & 0xff) != 0) LOW-BYTE.
 */
export function gs9c9340FinalizeNeeded(mode, partial) {
  return asU32(mode) === 0 && (asU32(partial) & 0xff) !== 0 ? 1 : 0;
}

/**
 * W20 — finalize pad bytes (PE 0x009cacbf): ((partial & 0xff) < 4) ?
 * (4 - (partial & 0xff)) : 0.
 */
export function gs9c9340FinalizePadBytes(partial) {
  const p = asU32(partial) & 0xff;
  return p < 4 ? 4 - p : 0;
}

/**
 * W21 — finalize fold (PE 0x009cacdc): (ror32(acc,1) + lane) u32 wrap.
 */
export function gs9c9340FinalizeRorAdd(acc, lane) {
  const a = asU32(acc);
  return (((a >>> 1) | (a << 31)) + asU32(lane)) >>> 0;
}

/**
 * W22 — checksum stream word (PE 0x009cad00): acc ^ 0x96696996.
 */
export function gs9c9340ChecksumStreamWord(acc) {
  return (asU32(acc) ^ GS9C9340_CHECKSUM_XOR) >>> 0;
}

/**
 * N1 — 0x683930 name-open gate (PE 0x0068394a `cmp dword [eax],0 ;
 * jne`): FULL-dword presence of the SteamInternal_ContextInit() first
 * dword.  Nonzero opens the stat-name checksum state (al=1); zero ->
 * al=0 (ret 8).  0x100 IS present.
 */
export function gs683930NameGateOk(steamCtxWord) {
  return asU32(steamCtxWord) !== 0 ? 1 : 0;
}

/**
 * R1 — reader format gate 0x3b (PE 0x009cb122 `cmp [edi+8],0x3b ; jb`):
 * FULL-dword UNSIGNED format >= 0x3b gates the +0x60 flags-byte read.
 */
export function gs9cb020Gate0x3b(format) {
  return asU32(format) >= 0x3b ? 1 : 0;
}

/**
 * R2 — reader format gate 0x46 (PE 0x009cb466): format >= 0x46 gates
 * the +0x20 u16 read.
 */
export function gs9cb020Gate0x46(format) {
  return asU32(format) >= 0x46 ? 1 : 0;
}

/**
 * R3 — reader format gate 0x47 (PE 0x009cb179): format >= 0x47 gates
 * the +0x1c u32 read.
 */
export function gs9cb020Gate0x47(format) {
  return asU32(format) >= 0x47 ? 1 : 0;
}

/**
 * R4 — reader format gate 0x5b (PE 0x009cb254): format >= 0x5b selects
 * the u32-direct arm for +0x30 (else R13 byte->bool).
 */
export function gs9cb020Gate0x5b(format) {
  return asU32(format) >= 0x5b ? 1 : 0;
}

/**
 * R5 — reader format gate 0x67 (PE 0x009cb500): format >= 0x67 gates
 * the +0x60 flags PROCESSING (bit0/bit1 sub-object reads).
 */
export function gs9cb020Gate0x67(format) {
  return asU32(format) >= 0x67 ? 1 : 0;
}

/**
 * R6 — reader format gate 0x6c (PE 0x009cb4d0): format >= 0x6c gates
 * the +0x5c u32 read.
 */
export function gs9cb020Gate0x6c(format) {
  return asU32(format) >= 0x6c ? 1 : 0;
}

/**
 * R7 — reader format gate 0x88 (PE 0x009cb1cb): format >= 0x88 gates
 * the +0x24 u32 read (the v4-io "presence gate").
 */
export function gs9cb020Gate0x88(format) {
  return asU32(format) >= 0x88 ? 1 : 0;
}

/**
 * R8 — reader format gate 0x96 (PE 0x009cb3ae): format >= 0x96 gates
 * the +0x48 u64 read.
 */
export function gs9cb020Gate0x96(format) {
  return asU32(format) >= 0x96 ? 1 : 0;
}

/**
 * R9 — reader format gate 0x9e (PE 0x009cb49a): format >= 0x9e gates
 * the +0x58 float read.
 */
export function gs9cb020Gate0x9e(format) {
  return asU32(format) >= 0x9e ? 1 : 0;
}

/**
 * R10 — reader OLD-format u64 gate (PE 0x009cb302 `cmp [edi+8],0x47 ;
 * jae skip`): FULL-dword UNSIGNED format < 0x47 opens the old 8-B
 * compat read.
 */
export function gs9cb020OldU64Gate(format) {
  return asU32(format) < 0x47 ? 1 : 0;
}

/**
 * R11 — reader flags bit0 (PE 0x009cb53b `test al,1 ; je`): byte-gate
 * (flags & 0x1) != 0 opens the +0x64 sub-object.
 */
export function gs9cb020Sub0x64Present(flagsByte) {
  return (asU32(flagsByte) & 0x1) !== 0 ? 1 : 0;
}

/**
 * R12 — reader flags bit1 (PE 0x009cb5ad `test al,2 ; je`): byte-gate
 * (flags & 0x2) != 0 opens the +0x6c sub-object (recursive read).
 */
export function gs9cb020Sub0x6cPresent(flagsByte) {
  return (asU32(flagsByte) & 0x2) !== 0 ? 1 : 0;
}

/**
 * R13 — reader old byte->bool (PE 0x009cb2aa xor/setne): ((byte & 0xff)
 * != 0) ? 1 : 0 — the format<0x5b +0x30 conversion.
 */
export function gs9cb020OldByteToBool(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}

/**
 * R14 — reader old-u64 type-4 store gate (PE 0x009cb33b `cmp [esi],4 ;
 * jne`): FULL-dword equality (field0 == 4).
 */
export function gs9cb020OldU64Type4(field0) {
  return asU32(field0) === GS9CB020_OLD_COMPAT_TYPE ? 1 : 0;
}

/**
 * T1 — fixed-count loop 0x9c9c30 count (PE 0x009c9c24): constant 0xe —
 * the 0xe-iteration u32 array loop at GameState+0x164 (stride 4).
 */
export function gs9c9c30FixedCount() {
  return GS9C9C30_FIXED_COUNT;
}

/**
 * T2 — fixed-count loop 0x9c9c30 bound (PE 0x009c9c57 `sub,1 ; jne`):
 * (remaining - 1) != 0 u32 — countdown 0xe..1.
 */
export function gs9c9c30LoopMore(remaining) {
  return (asU32(remaining) - 1) !== 0 ? 1 : 0;
}

/**
 * T3 — fixed-count loop 0x9c9d66 count (PE 0x009c9d6c): constant 0x14 —
 * the 0x14-iteration 0x9c8d20 element loop (values +0x16e08 stride
 * 0xb8, holders +0x1942c stride 0xc).
 */
export function gs9c9d66FixedCount() {
  return GS9C9D66_FIXED_COUNT;
}

/**
 * T4 — fixed-count loop 0x9c9d66 bound (PE 0x009c9d95 `sub,1 ; jne`):
 * (remaining - 1) != 0 u32 — countdown 0x14..1.
 */
export function gs9c9d66LoopMore(remaining) {
  return (asU32(remaining) - 1) !== 0 ? 1 : 0;
}

/**
 * X1 — reorder-table loop bound (PE 0x009c9dfe `sub [ebp-0x458],1` +
 * 0x009c9e05 `jne 0x9c9dc0`): (remaining - 1) != 0 u32 — the 0x1fb-entry
 * countdown (init 0x9c9db4; runs 0x1fb times). W16 shape; 0x100 IS
 * wide-present (a byte-narrow decay would exit at 0x100).
 */
export function gs9c9340ReorderLoopMore(remaining) {
  return (asU32(remaining) - 1) !== 0 ? 1 : 0;
}

/**
 * X2 — reorder value word (PE 0x009c9dc2 `movzx edi,ax`; store
 * 0x009c9df0): entry & 0xffff — the u16 value word (0x10000 -> 0).
 */
export function gs9c9340ReorderValueWord(entry) {
  return asU32(entry) & 0xffff;
}

/**
 * Y1 — 7-lane lane base offset (PE 0x009caa97 `add eax,0x1ead0` /
 * 0x009cac1c `add esi,0x320`): 0x1ead0 + lane*0x320 u32 wrap.
 */
export function gs9c9340Lane7LaneBase(lane) {
  return (GS9C9340_LANE7_BASE_OFF + asU32(lane) * GS9C9340_LANE7_STRIDE) >>> 0;
}

/* i8 sign-extend of the byte loop counter (movsx ecx,al @0x9cab40 /
   0x9cabc1): equals i on the reachable domain 0..count-1 (count <=
   0x7f, W17/W18); kept exact for i >= 0x80. */
function gsSi8(v) {
  const b = asU32(v) & 0xff;
  return b >= 0x80 ? b - 0x100 : b;
}

/**
 * Y2 — loop-1 value ptr (PE 0x009cab43 `lea edx,[esi-0x31c]` /
 * 0x009cab49 `imul eax,ecx,0xb8` / 0x009cab50 `add eax,edx`):
 * lane_base + (int8)i*0xb8 - 0x31c u32 wrap.
 */
export function gs9c9340Lane7Value1Ptr(laneBase, i) {
  return (asU32(laneBase) + gsSi8(i) * GS9C9340_VALUE_STRIDE - 0x31c) >>> 0;
}

/**
 * Y3 — loop-1 holder ptr (PE 0x009cab53/0x009cab56/0x009cab59 lea
 * chain): lane_base + (int8)i*0xc - 0x1ac u32 wrap ((3i+0x5c)*4 +
 * lane - 0x31c == lane + 12i - 0x1ac).
 */
export function gs9c9340Lane7Holder1Ptr(laneBase, i) {
  return (asU32(laneBase) + gsSi8(i) * GS9C9340_HOLDER_STRIDE - 0x1ac) >>> 0;
}

/**
 * Y4 — loop-2 value ptr (PE 0x009cabc4 `imul eax,ecx,0xb8` /
 * 0x009cabce `add eax,0xfffffe6c` / 0x009cabd3 `add eax,esi`):
 * lane_base + (int8)i*0xb8 - 0x194 u32 wrap.
 */
export function gs9c9340Lane7Value2Ptr(laneBase, i) {
  return (asU32(laneBase) + gsSi8(i) * GS9C9340_VALUE_STRIDE - 0x194) >>> 0;
}

/**
 * Y5 — loop-2 holder ptr (PE 0x009cabca `add ecx,-3` / 0x009cabd6 /
 * 0x009cabd9 lea chain): lane_base + (int8)i*0xc - 0x24 u32 wrap
 * (12*(i-3) + lane == lane + 12i - 0x24).
 */
export function gs9c9340Lane7Holder2Ptr(laneBase, i) {
  return (asU32(laneBase) + gsSi8(i) * GS9C9340_HOLDER_STRIDE - 0x24) >>> 0;
}

/* --- ABI v5 accessors --- */
export const gs9c8d20ElementLoopMoreVa = () => GS9C8D20_ELEMENT_LOOP_MORE_VA;
export const gs9c8d20ElementLoopMoreVa2 = () => GS9C8D20_ELEMENT_LOOP_MORE_VA_2;
export const gs9c9340HashCountGateVa = () => GS9C9340_HASH_COUNT_GATE_VA;
export const gs9c9340HashProbeVa = () => GS9C9340_HASH_PROBE_VA;
export const gs9c9340HashBoundGateVa = () => GS9C9340_HASH_BOUND_GATE_VA;
export const gs9c9340ValueCountGateVa = () => GS9C9340_VALUE_COUNT_GATE_VA;
export const gs9c9340ValueBoundGateVa = () => GS9C9340_VALUE_BOUND_GATE_VA;
export const gs9c9340ReorderNegGateVa = () => GS9C9340_REORDER_NEG_GATE_VA;
export const gs9c9340ReorderFlushGateVa = () => GS9C9340_REORDER_FLUSH_GATE_VA;
export const gs9c9340ReorderRunWordVa = () => GS9C9340_REORDER_RUN_WORD_VA;
export const gs9c9340ReorderFinalFlushVa = () => GS9C9340_REORDER_FINAL_FLUSH_VA;
export const gs9c9340Div0xcCountVa = () => GS9C9340_DIV0XC_COUNT_VA;
export const gs9c9340Div0xcResizeGateVa = () => GS9C9340_DIV0XC_RESIZE_GATE_VA;
export const gs9c9340Div0xcCountByteVa = () => GS9C9340_DIV0XC_COUNT_BYTE_VA;
export const gs9c9340Div0xcNeededGateVa = () => GS9C9340_DIV0XC_NEEDED_GATE_VA;
export const gs9c9340Div0xcBoundGateVa = () => GS9C9340_DIV0XC_BOUND_GATE_VA;
export const gs9c9340Lane7CountVa = () => GS9C9340_LANE7_COUNT_VA;
export const gs9c9340Lane7MoreVa = () => GS9C9340_LANE7_MORE_VA;
export const gs9c9340ByteCountNeededVa = () => GS9C9340_BYTE_COUNT_NEEDED_VA;
export const gs9c9340ByteCountNeededVa2 = () => GS9C9340_BYTE_COUNT_NEEDED_VA_2;
export const gs9c9340ByteCountMoreVa = () => GS9C9340_BYTE_COUNT_MORE_VA;
export const gs9c9340ByteCountMoreVa2 = () => GS9C9340_BYTE_COUNT_MORE_VA_2;
export const gs9c9340FinalizeModeGateVa = () => GS9C9340_FINALIZE_MODE_GATE_VA;
export const gs9c9340FinalizePartialGateVa = () => GS9C9340_FINALIZE_PARTIAL_GATE_VA;
export const gs9c9340FinalizePadVa = () => GS9C9340_FINALIZE_PAD_VA;
export const gs9c9340FinalizeFoldVa = () => GS9C9340_FINALIZE_FOLD_VA;
export const gs9c9340ChecksumStoreXorVa = () => GS9C9340_CHECKSUM_STORE_XOR_VA;
export const gs9c9340HashTableOff = () => GS9C9340_HASH_TABLE_OFF;
export const gs9c9340HashCapOff = () => GS9C9340_HASH_CAP_OFF;
export const gs9c9340HashStateOff = () => GS9C9340_HASH_STATE_OFF;
export const gs9c9340HashCountOff = () => GS9C9340_HASH_COUNT_OFF;
export const gs9c9340ValueCountOff = () => GS9C9340_VALUE_COUNT_OFF;
export const gs9c9340ValueBaseOff = () => GS9C9340_VALUE_BASE_OFF;
export const gs9c9340HolderBaseOff = () => GS9C9340_HOLDER_BASE_OFF;
export const gs9c9340ValueStride = () => GS9C9340_VALUE_STRIDE;
export const gs9c9340HolderStride = () => GS9C9340_HOLDER_STRIDE;
export const gs9c9340ReorderTableOff = () => GS9C9340_REORDER_TABLE_OFF;
export const gs9c9340ReorderEntries = () => GS9C9340_REORDER_ENTRIES;
export const gs9c9340ReorderRunMarker = () => GS9C9340_REORDER_RUN_MARKER;
export const gs9c9340Div0xcBeginOff = () => GS9C9340_DIV0XC_BEGIN_OFF;
export const gs9c9340Div0xcMagic = () => GS9C9340_DIV0XC_MAGIC;
export const gs9c9340Div0xcDivisor = () => GS9C9340_DIV0XC_DIVISOR;
export const gs9c9340Div0xcCap = () => GS9C9340_DIV0XC_CAP;
export const gs9c9340Lane7BaseOff = () => GS9C9340_LANE7_BASE_OFF;
export const gs9c9340Lane7Stride = () => GS9C9340_LANE7_STRIDE;
export const gs9c9340ChecksumOff = () => GS9C9340_CHECKSUM_OFF;
export const gs9c9340ChecksumXor = () => GS9C9340_CHECKSUM_XOR;
export const gs9c9340StateModeOff = () => GS9C9340_STATE_MODE_OFF;
export const gs9c9340StatePartialOff = () => GS9C9340_STATE_PARTIAL_OFF;
export const gs9c9340StateAccOff = () => GS9C9340_STATE_ACC_OFF;
export const gs9c9340StateLaneOff = () => GS9C9340_STATE_LANE_OFF;
export const gs683930Va = () => GS683930_VA;
export const gs683930EndVa = () => GS683930_END_VA;
export const gs683930BodyBytes = () => GS683930_BODY_BYTES;
export const gs683930NextVa = () => GS683930_NEXT_VA;
export const gs683930SteamIat = () => GS683930_STEAM_IAT;
export const gs683930SteamArg = () => GS683930_STEAM_ARG;
export const gs683930SteamGateVa = () => GS683930_STEAM_GATE_VA;
export const gs683930CallerCount = () => GS683930_CALLER_COUNT;
export const gs683930CallerVaAt = (index) =>
  GS683930_CALLER_VAS[index >>> 0] ?? 0;

/* --- ABI v6 accessors: reader row 0x9cb020 + fixed-count loops --- */
export const gs9cb020EndVa = () => GS9CB020_END_VA;
export const gs9cb020BodyBytes = () => GS9CB020_BODY_BYTES;
export const gs9cb020NextVa = () => GS9CB020_NEXT_VA;
export const gs9cb020FormatOff = () => GS9CB020_FORMAT_OFF;
export const gs9cb020Vtbl14Slot = () => GS9CB020_VTBL14_SLOT;
export const gs9cb020RowWriterVa = () => GS9CB020_ROW_WRITER_VA;
export const gs9cb020RecurseCallVa = () => GS9CB020_RECURSE_CALL_VA;
export const gs9cb020Sub64CtorVa = () => GS9CB020_SUB64_CTOR_VA;
export const gs9cb020Sub6cCtorVa = () => GS9CB020_SUB6C_CTOR_VA;
export const gs9cb020FlagsOff = () => GS9CB020_FLAGS_OFF;
export const gs9cb020Sub64Off = () => GS9CB020_SUB64_OFF;
export const gs9cb020Sub6cOff = () => GS9CB020_SUB6C_OFF;
export const gs9cb020Sub64Alloc = () => GS9CB020_SUB64_ALLOC;
export const gs9cb020Sub6cAlloc = () => GS9CB020_SUB6C_ALLOC;
export const gs9cb020Sub64Bytes = () => GS9CB020_SUB64_BYTES;
export const gs9cb020OldCompatType = () => GS9CB020_OLD_COMPAT_TYPE;
export const gs9cb020AllocIat = () => GS9CB020_ALLOC_IAT;
export const gs9cb020FailAllocVa = () => GS9CB020_FAIL_ALLOC_VA;
export const gs9cb020Gate0x3bVa = () => GS9CB020_GATE_0X3B_VA;
export const gs9cb020Gate0x46Va = () => GS9CB020_GATE_0X46_VA;
export const gs9cb020Gate0x47Va = () => GS9CB020_GATE_0X47_VA;
export const gs9cb020Gate0x5bVa = () => GS9CB020_GATE_0X5B_VA;
export const gs9cb020Gate0x67Va = () => GS9CB020_GATE_0X67_VA;
export const gs9cb020Gate0x6cVa = () => GS9CB020_GATE_0X6C_VA;
export const gs9cb020Gate0x88Va = () => GS9CB020_GATE_0X88_VA;
export const gs9cb020Gate0x96Va = () => GS9CB020_GATE_0X96_VA;
export const gs9cb020Gate0x9eVa = () => GS9CB020_GATE_0X9E_VA;
export const gs9cb020OldU64GateVa = () => GS9CB020_OLD_U64_GATE_VA;
export const gs9cb020Bit0GateVa = () => GS9CB020_BIT0_GATE_VA;
export const gs9cb020Bit1GateVa = () => GS9CB020_BIT1_GATE_VA;
export const gs9cb020ByteToBoolVa = () => GS9CB020_BYTE_TO_BOOL_VA;
export const gs9cb020Type4GateVa = () => GS9CB020_TYPE4_GATE_VA;
export const gs9c9c30FixedCountVa = () => GS9C9C30_COUNT_STORE_VA;
export const gs9c9c30LoopHeadVa = () => GS9C9C30_LOOP_HEAD_VA;
export const gs9c9c30MoreVa = () => GS9C9C30_MORE_VA;
export const gs9c9c30BaseOff = () => GS9C9C30_BASE_OFF;
export const gs9c9c30Stride = () => GS9C9C30_STRIDE;
export const gs9c9d66FixedCountVa = () => GS9C9D66_COUNT_STORE_VA;
export const gs9c9d66LoopHeadVa = () => GS9C9D66_LOOP_HEAD_VA;
export const gs9c9d66MoreVa = () => GS9C9D66_MORE_VA;
export const gs9c9d66ValueBaseOff = () => GS9C9D66_VALUE_BASE_OFF;
export const gs9c9d66HolderBaseOff = () => GS9C9D66_HOLDER_BASE_OFF;
export const gs9c9d66ValueStride = () => GS9C9D66_VALUE_STRIDE;
export const gs9c9d66HolderStride = () => GS9C9D66_HOLDER_STRIDE;

/* --- ABI v7 accessors: reorder-table + 7-lane per-lane laws --- */
export const gs9c9340ReorderLoopMoreVa = () => GS9C9340_REORDER_LOOP_MORE_VA;
export const gs9c9340ReorderLoopMoreVa2 = () => GS9C9340_REORDER_LOOP_MORE_JNE_VA;
export const gs9c9340ReorderValueWordVa = () => GS9C9340_REORDER_VALUE_WORD_VA;
export const gs9c9340ReorderValueWordVa2 = () => GS9C9340_REORDER_VALUE_STORE_VA;
export const gs9c9340Lane7LaneBaseVa = () => GS9C9340_LANE7_LANE_BASE_VA;
export const gs9c9340Lane7LaneBaseVa2 = () => GS9C9340_LANE7_STRIDE_ADD_VA;
export const gs9c9340Lane7Elem1ValueVa = () => GS9C9340_LANE7_ELEM1_VALUE_VA;
export const gs9c9340Lane7Elem1HolderVa = () => GS9C9340_LANE7_ELEM1_HOLDER_VA;
export const gs9c9340Lane7Elem2ValueVa = () => GS9C9340_LANE7_ELEM2_VALUE_VA;
export const gs9c9340Lane7Elem2HolderVa = () => GS9C9340_LANE7_ELEM2_HOLDER_VA;
export const gs9c9340Lane7Elem1ValueOff = () => GS9C9340_LANE7_ELEM1_VALUE_OFF;
export const gs9c9340Lane7Elem1HolderOff = () => GS9C9340_LANE7_ELEM1_HOLDER_OFF;
export const gs9c9340Lane7Elem2ValueOff = () => GS9C9340_LANE7_ELEM2_VALUE_OFF;
export const gs9c9340Lane7Elem2HolderOff = () => GS9C9340_LANE7_ELEM2_HOLDER_OFF;
export const gs9c9340Lane7ByteOff1 = () => GS9C9340_LANE7_BYTE_OFF_1;
export const gs9c9340Lane7ByteOff2 = () => GS9C9340_LANE7_BYTE_OFF_2;
export const gs9c9340Lane7ByteOff3 = () => GS9C9340_LANE7_BYTE_OFF_3;
export const gs9c9340Lane7ByteOff4 = () => GS9C9340_LANE7_BYTE_OFF_4;

/* --- ABI v8: pill reader 0x9cb620 laws V1..V20 (JS oracle) --- */

/**
 * V1 — io-ready gate (PE 0x009cb65d test al,al ; jne FAIL; twins
 * 0x009cbe30/0x009cbec0/0x009cbf70): LOW-BYTE (open_al & 0xff) == 0 —
 * the io vtbl+0x10 result; nonzero AL jumps the FAIL epilogue.
 * 0x100 -> byte 0 -> continues.
 */
export function gs9cb620IoReady(openAl) {
  return (asU32(openAl) & 0xff) === 0 ? 1 : 0;
}

/**
 * V2..V5 — io+8 format gates (PE 0x009cba1b/0x009cbb0a/0x009cbb77/
 * 0x009cb671 `cmp [esi+8],N ; jb`): FULL-dword UNSIGNED format >= N —
 * the same io+8 counter as the reader row R1..R10. 0x100 IS >= every
 * threshold.
 */
export function gs9cb620IoGate0x3d(format) {
  return asU32(format) >= 0x3d ? 1 : 0;
}
export function gs9cb620IoGate0x4b(format) {
  return asU32(format) >= 0x4b ? 1 : 0;
}
export function gs9cb620IoGate0x7b(format) {
  return asU32(format) >= 0x7b ? 1 : 0;
}
export function gs9cb620IoGate0x7d(format) {
  return asU32(format) >= 0x7d ? 1 : 0;
}

/**
 * V6..V9 — GameState+0x1fdf0 format gates (PE 0x009cbd86/0x009cb835/
 * 0x009cbfad/0x009cb875 `cmp [eax+0x1fdf0],N ; jb`): FULL-dword
 * UNSIGNED format >= N on the gs counter.
 */
export function gs9cb620GsGate0x21(format) {
  return asU32(format) >= 0x21 ? 1 : 0;
}
export function gs9cb620GsGate0x3f(format) {
  return asU32(format) >= 0x3f ? 1 : 0;
}
export function gs9cb620GsGate0x49(format) {
  return asU32(format) >= 0x49 ? 1 : 0;
}
export function gs9cb620GsGate0x82(format) {
  return asU32(format) >= 0x82 ? 1 : 0;
}

/**
 * V10 — slot count gate (PE 0x009cbbb1 test eax,eax ; je rel32):
 * FULL-dword count != 0 (the per-slot element count, u16 movzx or
 * u32 arm).
 */
export function gs9cb620SlotCountNeeded(count) {
  return asU32(count) !== 0 ? 1 : 0;
}

/**
 * V11 — string-copy ptr gate (PE 0x009cbb3a test eax,eax ; je +0x22):
 * FULL-dword ptr != 0 — the format<0x4b +0x64 string arm.
 */
export function gs9cb620StringCopyNeeded(ptr60) {
  return asU32(ptr60) !== 0 ? 1 : 0;
}

/**
 * V12 — slot bool store (PE 0x009cbc57 cmp [ecx+0xc],0 ; 0x009cbc5f
 * setg al): SIGNED (int64)(int32)count > 0 — 0x80000000..0xffffffff
 * are NEGATIVE -> 0 (setg is the SIGNED greater gate).
 */
export function gs9cb620SlotPositive(count) {
  return BigInt(count | 0) > 0n ? 1 : 0;
}

/**
 * V13 — slot-table loop bound (PE 0x009cbdc0 cmp ecx,0x3800 ; jb):
 * UNSIGNED byte_off < 0x3800 — the 448-slot x 0x20 table loop.
 */
export function gs9cb620SlotMore(byteOff) {
  return asU32(byteOff) < GS9CB620_TABLE_BYTES ? 1 : 0;
}

/**
 * V14..V17 — the +0x74/+0x88 0x78-stride sub-array gates (PE 0x009cbe08/
 * 0x009cbf43 cmp,0 ; jbe): FULL-dword count != 0 entry; (PE 0x009cbe50/
 * 0x009cbf93 cmp,1 ; jb): UNSIGNED idx < count bound.
 */
export function gs9cb620Array74Needed(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
export function gs9cb620Array74More(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}
export function gs9cb620Array88Needed(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
export function gs9cb620Array88More(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}

/**
 * V18 — fixed-8 u16 stream loop count (PE 0x009cc11b mov [ebp+0x10],8):
 * constant 8.
 */
export function gs9cb620Fixed8Count() {
  return GS9CB620_FIXED8_COUNT;
}

/**
 * V19 — fixed-8 loop bound (PE 0x009cc145 sub,1 ; jne 0x009cc122):
 * ((remaining - 1) != 0) u32 — the countdown 8..1 (W16 lane7 class).
 */
export function gs9cb620Fixed8More(remaining) {
  return (asU32(remaining) - 1) !== 0 ? 1 : 0;
}

/**
 * V20 — flag-byte gate (PE 0x009cb93b cmp byte,0 ; je ; or bit; 5 or-
 * bit twins): LOW-BYTE ((byte & 0xff) != 0) — gates each of the 6
 * flag-bit ORs into the +0x44 flags dword (0x100 -> byte 0 -> clear).
 */
export function gs9cb620FlagByteSet(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}

/* --- ABI v8 accessors: pill reader 0x9cb620 --- */
export const gs9cb620Va = () => GS9CB620_VA;
export const gs9cb620EndVa = () => GS9CB620_END_VA;
export const gs9cb620BodyBytes = () => GS9CB620_BODY_BYTES;
export const gs9cb620NextVa = () => GS9CB620_NEXT_VA;
export const gs9cb620SehHandlerDat = () => GS9CB620_SEH_HANDLER_DAT;
export const gs9cb620IoFormatOff = () => GS9CB620_IO_FORMAT_OFF;
export const gs9cb620GsFormatOff = () => GS9CB620_GS_FORMAT_OFF;
export const gs9cb620IoVtbl10Slot = () => GS9CB620_IO_VTBL10_SLOT;
export const gs9cb620Vtbl14Slot = () => GS9CB620_VTBL14_SLOT;
export const gs9cb620RowWriterVa = () => GS9CB620_ROW_WRITER_VA;
export const gs9cb620SerializerRowCallVa = () => GS9CB620_SERIALIZER_ROW_CALL_VA;
export const gs9cb620ReaderRowCall74Va = () => GS9CB620_READER_ROW_CALL_74_VA;
export const gs9cb620ReaderRowCall88Va = () => GS9CB620_READER_ROW_CALL_88_VA;
export const gs9cb620VectorCtorVa = () => GS9CB620_VECTOR_CTOR_VA;
export const gs9cb620VectorInitVa = () => GS9CB620_VECTOR_INIT_VA;
export const gs9cb620ListInsertVa = () => GS9CB620_LIST_INSERT_VA;
export const gs9cb620StringCopyVa = () => GS9CB620_STRING_COPY_VA;
export const gs9cb620StringEmptyDat = () => GS9CB620_STRING_EMPTY_DAT;
export const gs9cb620FlagsOff = () => GS9CB620_FLAGS_OFF;
export const gs9cb620FlagBit0 = () => GS9CB620_FLAG_BIT_0;
export const gs9cb620FlagBit1 = () => GS9CB620_FLAG_BIT_1;
export const gs9cb620FlagBit2 = () => GS9CB620_FLAG_BIT_2;
export const gs9cb620FlagBit3 = () => GS9CB620_FLAG_BIT_3;
export const gs9cb620FlagBit4 = () => GS9CB620_FLAG_BIT_4;
export const gs9cb620FlagBit5 = () => GS9CB620_FLAG_BIT_5;
export const gs9cb620TableOff = () => GS9CB620_TABLE_OFF;
export const gs9cb620TableBytes = () => GS9CB620_TABLE_BYTES;
export const gs9cb620TableStride = () => GS9CB620_TABLE_STRIDE;
export const gs9cb620TableSlots = () => GS9CB620_TABLE_SLOTS;
export const gs9cb620Array74Off = () => GS9CB620_ARRAY74_OFF;
export const gs9cb620Array88Off = () => GS9CB620_ARRAY88_OFF;
export const gs9cb620ArrayStride = () => GS9CB620_ARRAY_STRIDE;
export const gs9cb620Fixed8CountVa = () => GS9CB620_FIXED8_COUNT_STORE_VA;
export const gs9cb620Fixed8MoreVa = () => GS9CB620_FIXED8_MORE_VA;
export const gs9cb620IoReadyGateVa = () => GS9CB620_IO_READY_GATE_VA;
export const gs9cb620IoReadyGateVa2 = () => GS9CB620_IO_READY_GATE_VA_2;
export const gs9cb620IoReadyGateVa3 = () => GS9CB620_IO_READY_GATE_VA_3;
export const gs9cb620IoReadyGateVa4 = () => GS9CB620_IO_READY_GATE_VA_4;
export const gs9cb620IoGate0x3dVa = () => GS9CB620_IO_GATE_0X3D_VA;
export const gs9cb620IoGate0x4bVa = () => GS9CB620_IO_GATE_0X4B_VA;
export const gs9cb620IoGate0x7bVa = () => GS9CB620_IO_GATE_0X7B_VA;
export const gs9cb620IoGate0x7bJneVa = () => GS9CB620_IO_GATE_0X7B_JNE_VA;
export const gs9cb620IoGate0x7dVa = () => GS9CB620_IO_GATE_0X7D_VA;
export const gs9cb620IoGate0x7dJneVa = () => GS9CB620_IO_GATE_0X7D_JNE_VA;
export const gs9cb620GsGate0x21Va = () => GS9CB620_GS_GATE_0X21_VA;
export const gs9cb620GsGate0x3fVa = () => GS9CB620_GS_GATE_0X3F_VA;
export const gs9cb620GsGate0x3fJneVa = () => GS9CB620_GS_GATE_0X3F_JNE_VA;
export const gs9cb620GsGate0x49Va = () => GS9CB620_GS_GATE_0X49_VA;
export const gs9cb620GsGate0x49JneVa = () => GS9CB620_GS_GATE_0X49_JNE_VA;
export const gs9cb620GsGate0x82Va = () => GS9CB620_GS_GATE_0X82_VA;
export const gs9cb620SlotCountGateVa = () => GS9CB620_SLOT_COUNT_GATE_VA;
export const gs9cb620StringCopyGateVa = () => GS9CB620_STRING_COPY_GATE_VA;
export const gs9cb620SlotPositiveVa = () => GS9CB620_SLOT_POSITIVE_VA;
export const gs9cb620SlotMoreVa = () => GS9CB620_SLOT_MORE_VA;
export const gs9cb620Array74NeededVa = () => GS9CB620_ARRAY74_NEEDED_VA;
export const gs9cb620Array74MoreVa = () => GS9CB620_ARRAY74_MORE_VA;
export const gs9cb620Array88NeededVa = () => GS9CB620_ARRAY88_NEEDED_VA;
export const gs9cb620Array88MoreVa = () => GS9CB620_ARRAY88_MORE_VA;
export const gs9cb620FlagGateVa = () => GS9CB620_FLAG_GATE_VA;
export const gs9cb620FlagBit1OrVa = () => GS9CB620_FLAG_BIT1_OR_VA;
export const gs9cb620FlagBit2OrVa = () => GS9CB620_FLAG_BIT2_OR_VA;
export const gs9cb620FlagBit3OrVa = () => GS9CB620_FLAG_BIT3_OR_VA;
export const gs9cb620FlagBit4OrVa = () => GS9CB620_FLAG_BIT4_OR_VA;
export const gs9cb620FlagBit5OrVa = () => GS9CB620_FLAG_BIT5_OR_VA;
export const gs9cb620CallerCount = () => GS9CB620_CALLER_COUNT;
export const gs9cb620CallerVaAt = (index) =>
  GS9CB620_CALLER_VAS[index >>> 0] ?? 0;
/* --- ABI v9: giant read entry 0x9cc1a0..0x9ce596 (JS oracle) --- */

export const GS9CC1A0_VA = 0x009cc1a0; /* thiscall bool read(GameStateIO* io, bool check) (ZHL EMPTY) */
export const GS9CC1A0_END_VA = 0x009ce597; /* first non-body byte (int3 pad 0x9ce597..0x9ce59f) */
export const GS9CC1A0_BODY_BYTES = 0x23f7;
export const GS9CC1A0_NEXT_VA = 0x009ce5a0; /* re-load orchestrator host (body B) */
export const GS9CC1A0_SEH_HANDLER_DAT = 0x00b0f33b;
export const GS9CC1A0_GS_COOKIE_DAT = 0x00bf93b4;
export const GS9CC1A0_IO_FORMAT_OFF = 0x8; /* io+8 counter (shared) */
export const GS9CC1A0_GS_FORMAT_OFF = 0x1fdf0; /* GameState format counter (stored into io+8 @0x9cc352) */
export const GS9CC1A0_IO_FORMAT_STORE_VA = 0x009cc352;
export const GS9CC1A0_DELETE_CALL_VA = 0x009cc254;
export const GS9CC1A0_READ_PILL_CALL_VA_0 = 0x009ccf75;
export const GS9CC1A0_READ_PILL_CALL_VA_1 = 0x009ccfe8;
export const GS9CC1A0_READ_PILL_CALL_VA_2 = 0x009ce33f;
export const GS9CC1A0_READ_PILL_CALL_VA_3 = 0x009ce3ce;
export const GS9CC1A0_BODY_C_CALL_VA = 0x009cda14; /* -> 0x9ce720 */
export const GS9CC1A0_CF000_CALL_VA = 0x009cdfbe; /* -> 0x9cf000 (gs<0x42 arm) */
export const GS9CC1A0_SERIALIZER_CTOR_CALL_VA = 0x009cdefe; /* -> 0x9c84c0 (gs>=0x42 arm) */
export const GS9CC1A0_CHECKSUM_MAGIC = 0x96696996;
export const GS9CC1A0_MGR_GLOBAL_DAT = 0x00c7169c;
export const GS9CC1A0_MGR_F98_OFF = 0xf98;
export const GS9CC1A0_LANE19C_OFF = 0x19c;
export const GS9CC1A0_LANE19C_BOUND = 0x1fb;
export const GS9CC1A0_HOLDERS1_OFF = 0x17c68;
export const GS9CC1A0_VALUES1_OFF = 0x1a0;
export const GS9CC1A0_HOLDERS2_OFF = 0x1942c;
export const GS9CC1A0_VALUES2_OFF = 0x16e08;
export const GS9CC1A0_TABLE19530_OFF = 0x19530;
export const GS9CC1A0_TABLE19D1C_END = 0x19d1c;
export const GS9CC1A0_SLOT13_BASE_OFF = 0x164;
export const GS9CC1A0_BYTE80_BOUND = 0x50;
export const GS9CC1A0_BYTE4D_BOUND = 0x4d;
export const GS9CC1A0_WORD25_BOUND = 0x25;
export const GS9CC1A0_CLAMP35_CONST = 0x35;
export const GS9CC1A0_CLAMP1A_CONST = 0x1a;
export const GS9CC1A0_STRIDE_B8 = 0xb8;
export const GS9CC1A0_STRIDE_C = 0xc;
export const GS9CC1A0_GS_GATE_0X2B_VA = 0x009cc761;
export const GS9CC1A0_GS_GATE_0X2E_VA = 0x009cc7a0;
export const GS9CC1A0_GS_GATE_0X2F_VA = 0x009cdd29;
export const GS9CC1A0_GS_GATE_0X30_VA = 0x009cde80;
export const GS9CC1A0_GS_GATE_0X33_VA = 0x009cc35a;
export const GS9CC1A0_GS_GATE_0X34_VA = 0x009cc4fa;
export const GS9CC1A0_GS_GATE_0X40_VA = 0x009cc479;
export const GS9CC1A0_GS_GATE_0X42_VA = 0x009cdedb;
export const GS9CC1A0_GS_GATE_0X43_VA = 0x009cc510;
export const GS9CC1A0_GS_GATE_0X44_VA = 0x009cd6ff;
export const GS9CC1A0_GS_GATE_0X47_VA = 0x009cd4a3;
export const GS9CC1A0_GS_GATE_0X48_VA = 0x009cd5fb;
export const GS9CC1A0_GS_GATE_0X50_VA = 0x009cdfc9;
export const GS9CC1A0_GS_GATE_0X53_VA = 0x009ce18c;
export const GS9CC1A0_GS_GATE_0X54_VA = 0x009cdae3;
export const GS9CC1A0_GS_GATE_0X57_VA = 0x009cc444;
export const GS9CC1A0_GS_GATE_0X59_VA = 0x009ce00e;
export const GS9CC1A0_GS_GATE_0X85_VA = 0x009ce437;
export const GS9CC1A0_GS_GATE_0X86_VA = 0x009cd355;
export const GS9CC1A0_GS_GATE_0X87_VA = 0x009cd582;
export const GS9CC1A0_GS_GATE_0X89_VA = 0x009ce2b6;
export const GS9CC1A0_GS_GATE_0X8A_VA = 0x009ce47f;
export const GS9CC1A0_GS_GATE_0X8D_VA = 0x009cd71c;
export const GS9CC1A0_GS_GATE_0X93_VA = 0x009cc4a9;
export const GS9CC1A0_GS_GATE_0X95_VA = 0x009ce4e1;
export const GS9CC1A0_GS_GATE_0X98_VA = 0x009ce49a;
export const GS9CC1A0_GS_GATE_0X9B_VA = 0x009cc4c1;
export const GS9CC1A0_IO_GATE_0X56_VA = 0x009cccb7;
export const GS9CC1A0_IO_GATE_0X7C_VA = 0x009cd1d9;
export const GS9CC1A0_IO_GATE_0XA5_VA = 0x009cd246;
export const GS9CC1A0_GS_GATE_0X21_VA = 0x009cc9be;
export const GS9CC1A0_IO_GATE_0X7B_VA = 0x009cd027;
export const GS9CC1A0_IO_GATE_0X7B_VA_2 = 0x009cd19d;
export const GS9CC1A0_DISPATCH0_VA = 0x009cce5d;
export const GS9CC1A0_DISPATCH1_VA = 0x009cce9c;
export const GS9CC1A0_DISPATCH2_VA = 0x009ccead;
export const GS9CC1A0_DISPATCH3_VA = 0x009ccebe;
export const GS9CC1A0_DISPATCH4_VA = 0x009ccecf;
export const GS9CC1A0_DISPATCH5_VA = 0x009ccee0;
export const GS9CC1A0_DISPATCH6_VA = 0x009ccef3;
export const GS9CC1A0_DISPATCH7_VA = 0x009ccf06;
export const GS9CC1A0_DISPATCH_SECOND_PASS_VA = 0x009ccfc3;
export const GS9CC1A0_T164_COUNT_VA = 0x009ccc64;
export const GS9CC1A0_COUNT_1FB_GATE_VA = 0x009ccf1e;
export const GS9CC1A0_TABLE_19D1C_MORE_VA = 0x009cd158;
export const GS9CC1A0_BYTE_0X50_MORE_VA = 0x009cdbe0;
export const GS9CC1A0_BYTE_0X4D_MORE_VA = 0x009cdb63;
export const GS9CC1A0_WORD_0X25_MORE_VA = 0x009cdf86;
export const GS9CC1A0_WORD_MORE_VA = 0x009cdf42;
export const GS9CC1A0_COUNT8_MORE_VA = 0x009cdc62;
export const GS9CC1A0_SIGNED_BYTE_POS_VA = 0x009cd772;
export const GS9CC1A0_SIGNED_IDX_MOVSX8_VA = 0x009cd86e;
export const GS9CC1A0_SIGNED_IDX_COUNT_VA = 0x009cdec9;
export const GS9CC1A0_SIGNED_BYTE_LT_VA = 0x009ce358;
export const GS9CC1A0_BYTE_ZERO_GATE_VA = 0x009cc301;
export const GS9CC1A0_TAIL_READY_GATE_VA = 0x009ce55f;
export const GS9CC1A0_CHECKSUM_PASS_VA = 0x009cc313;
export const GS9CC1A0_CHECKSUM_MATCH_VA = 0x009ce545;
export const GS9CC1A0_CLAMP35_VA = 0x009cc3e7;
export const GS9CC1A0_CLAMP1A_VA = 0x009ccb13;
export const GS9CC1A0_CALLER_COUNT = 3;
export const GS9CC1A0_CALLER_VAS = [0x00918366, 0x0095a1f7, 0x009ce677];

/**
 * F — gs format gate >= 0x2b (PE 0x009cc761): FULL-dword
 * UNSIGNED format >= 0x2b on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x2b(format) {
  return asU32(format) >= 0x2b ? 1 : 0;
}

/**
 * F — gs format gate >= 0x2e (PE 0x009cc7a0): FULL-dword
 * UNSIGNED format >= 0x2e on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x2e(format) {
  return asU32(format) >= 0x2e ? 1 : 0;
}

/**
 * F — gs format gate >= 0x2f (PE 0x009cdd29): FULL-dword
 * UNSIGNED format >= 0x2f on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x2f(format) {
  return asU32(format) >= 0x2f ? 1 : 0;
}

/**
 * F — gs format gate >= 0x30 (PE 0x009cde80): FULL-dword
 * UNSIGNED format >= 0x30 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x30(format) {
  return asU32(format) >= 0x30 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x33 (PE 0x009cc35a): FULL-dword
 * UNSIGNED format >= 0x33 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x33(format) {
  return asU32(format) >= 0x33 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x34 (PE 0x009cc4fa): FULL-dword
 * UNSIGNED format >= 0x34 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x34(format) {
  return asU32(format) >= 0x34 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x40 (PE 0x009cc479): FULL-dword
 * UNSIGNED format >= 0x40 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x40(format) {
  return asU32(format) >= 0x40 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x42 (PE 0x009cdedb): FULL-dword
 * UNSIGNED format >= 0x42 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x42(format) {
  return asU32(format) >= 0x42 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x43 (PE 0x009cc510): FULL-dword
 * UNSIGNED format >= 0x43 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x43(format) {
  return asU32(format) >= 0x43 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x44 (PE 0x009cd6ff): FULL-dword
 * UNSIGNED format >= 0x44 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x44(format) {
  return asU32(format) >= 0x44 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x47 (PE 0x009cd4a3): FULL-dword
 * UNSIGNED format >= 0x47 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x47(format) {
  return asU32(format) >= 0x47 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x48 (PE 0x009cd5fb): FULL-dword
 * UNSIGNED format >= 0x48 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x48(format) {
  return asU32(format) >= 0x48 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x50 (PE 0x009cdfc9): FULL-dword
 * UNSIGNED format >= 0x50 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x50(format) {
  return asU32(format) >= 0x50 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x53 (PE 0x009ce18c): FULL-dword
 * UNSIGNED format >= 0x53 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x53(format) {
  return asU32(format) >= 0x53 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x54 (PE 0x009cdae3): FULL-dword
 * UNSIGNED format >= 0x54 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x54(format) {
  return asU32(format) >= 0x54 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x57 (PE 0x009cc444): FULL-dword
 * UNSIGNED format >= 0x57 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x57(format) {
  return asU32(format) >= 0x57 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x59 (PE 0x009ce00e): FULL-dword
 * UNSIGNED format >= 0x59 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x59(format) {
  return asU32(format) >= 0x59 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x85 (PE 0x009ce437): FULL-dword
 * UNSIGNED format >= 0x85 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x85(format) {
  return asU32(format) >= 0x85 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x86 (PE 0x009cd355): FULL-dword
 * UNSIGNED format >= 0x86 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x86(format) {
  return asU32(format) >= 0x86 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x87 (PE 0x009cd582): FULL-dword
 * UNSIGNED format >= 0x87 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x87(format) {
  return asU32(format) >= 0x87 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x89 (PE 0x009ce2b6): FULL-dword
 * UNSIGNED format >= 0x89 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x89(format) {
  return asU32(format) >= 0x89 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x8a (PE 0x009ce47f): FULL-dword
 * UNSIGNED format >= 0x8a on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x8a(format) {
  return asU32(format) >= 0x8a ? 1 : 0;
}

/**
 * F — gs format gate >= 0x8d (PE 0x009cd71c): FULL-dword
 * UNSIGNED format >= 0x8d on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x8d(format) {
  return asU32(format) >= 0x8d ? 1 : 0;
}

/**
 * F — gs format gate >= 0x93 (PE 0x009cc4a9): FULL-dword
 * UNSIGNED format >= 0x93 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x93(format) {
  return asU32(format) >= 0x93 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x95 (PE 0x009ce4e1): FULL-dword
 * UNSIGNED format >= 0x95 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x95(format) {
  return asU32(format) >= 0x95 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x98 (PE 0x009ce49a): FULL-dword
 * UNSIGNED format >= 0x98 on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x98(format) {
  return asU32(format) >= 0x98 ? 1 : 0;
}

/**
 * F — gs format gate >= 0x9b (PE 0x009cc4c1): FULL-dword
 * UNSIGNED format >= 0x9b on GameState+0x1fdf0.
 */
export function gs9cc1a0GsGate0x9b(format) {
  return asU32(format) >= 0x9b ? 1 : 0;
}

/**
 * I — io+8 format gate >= 0x56 (PE 0x009cccb7): FULL-dword
 * UNSIGNED format >= 0x56.
 */
export function gs9cc1a0IoGate0x56(format) {
  return asU32(format) >= 0x56 ? 1 : 0;
}

/**
 * I — io+8 format gate >= 0x7c (PE 0x009cd1d9): FULL-dword
 * UNSIGNED format >= 0x7c.
 */
export function gs9cc1a0IoGate0x7c(format) {
  return asU32(format) >= 0x7c ? 1 : 0;
}

/**
 * I — io+8 format gate >= 0xa5 (PE 0x009cd246): FULL-dword
 * UNSIGNED format >= 0xa5.
 */
export function gs9cc1a0IoGate0xa5(format) {
  return asU32(format) >= 0xa5 ? 1 : 0;
}

/**
 * D1 — io+8 -> variant-count dispatch (PE 0x9cce5d..0x9ccf06): the
 * UNSIGNED band map (9 bands 0x89..0x20f).
 */
export function gs9cc1a0DispatchCount(io8) {
  const f = asU32(io8);
  if (f < 0x56) return 0x89;
  if (f < 0x6b) return 0x8f;
  if (f < 0x6d) return 0x90;
  if (f < 0x76) return 0x91;
  if (f < 0x7b) return 0x92;
  if (f < 0x84) return 0x164;
  if (f < 0x94) return 0x20d;
  if (f < 0x9a) return 0x20e;
  return 0x20f;
}

/**
 * D2 — second read-pill pass gate (PE 0x9ccfc3): disp_count > 0x1fb.
 */
export function gs9cc1a0DispatchSecondPassNeeded(dispCount) {
  return asU32(dispCount) > 0x1fb ? 1 : 0;
}

/**
 * C1 — +0x164 lane-block u32 count (PE 0x9ccc64 sbb/neg/add): io8 > 0x50
 * ? 14 : 13.
 */
export function gs9cc1a0T164Count(io8) {
  return asU32(io8) > 0x50 ? 14 : 13;
}

/**
 * B1 — +0x19c size gate (PE 0x9ccf1e): UNSIGNED count < 0x1fb.
 */
export function gs9cc1a0Count1fbBelow(count) {
  return asU32(count) < 0x1fb ? 1 : 0;
}

/**
 * B2 — word-decode table bound (PE 0x9cd158): UNSIGNED off < 0x19d1c.
 */
export function gs9cc1a0Table19d1cMore(off) {
  return asU32(off) < 0x19d1c ? 1 : 0;
}

/**
 * B3 — +0x1e778 byte-array bound (PE 0x9cdbe0/0x9cdc31): UNSIGNED
 * idx < 0x50.
 */
export function gs9cc1a0Byte0x50More(idx) {
  return asU32(idx) < 0x50 ? 1 : 0;
}

/**
 * B4 — gs<0x54 0x4d-byte arm bound (PE 0x9cdb63): UNSIGNED idx < 0x4d.
 */
export function gs9cc1a0Byte0x4dMore(idx) {
  return asU32(idx) < 0x4d ? 1 : 0;
}

/**
 * B5 — word-store cutoff (PE 0x9cdf86): WORD (idx & 0xffff) < 0x25.
 */
export function gs9cc1a0Word0x25More(idx) {
  return (asU32(idx) & 0xffff) < 0x25 ? 1 : 0;
}

/**
 * B6 — u16-count loop bound (PE 0x9cdf42/0x9cdfab): WORD
 * (idx & 0xffff) < (count & 0xffff).
 */
export function gs9cc1a0WordMore(idx, count) {
  return (asU32(idx) & 0xffff) < (asU32(count) & 0xffff) ? 1 : 0;
}

/**
 * B7 — 8-bit mask loop bound (PE 0x9cdc62 cmp ecx,8 ; jl): SIGNED
 * (int32)idx < 8.
 */
export function gs9cc1a0Count8More(idx) {
  return BigInt(idx | 0) < 8n ? 1 : 0;
}

/**
 * S1 — movsx byte count gate (PE 0x9cd772 + 3 twins, test ; jle):
 * (int8)(count & 0xff) > 0 — 0x80..0xff negative -> skip.
 */
export function gs9cc1a0SignedByteCountPositive(count) {
  return BigInt(gsSi8(count)) > 0n ? 1 : 0;
}

/**
 * S2 — SIGNED loop bound vs movsx8 count (PE 0x9cd86e/0x9cda01, jl):
 * (int32)idx < (int8)(count & 0xff).
 */
export function gs9cc1a0SignedIdxLtMovsx8(idx, count) {
  return BigInt(idx | 0) < BigInt(gsSi8(count)) ? 1 : 0;
}

/**
 * S3 — SIGNED loop bound vs u32 count (PE 0x9cdec9/0x9ce170, jl):
 * (int32)idx < (int32)count.
 */
export function gs9cc1a0SignedIdxLtCount(idx, count) {
  return BigInt(idx | 0) < BigInt(count | 0) ? 1 : 0;
}

/**
 * S4 — 7-lane byte loop bound (PE 0x9ce358/0x9ce3e7, jl):
 * (int8)(idx & 0xff) < (int8)(count & 0xff).
 */
export function gs9cc1a0SignedByteLt(idx, count) {
  return BigInt(gsSi8(idx)) < BigInt(gsSi8(count)) ? 1 : 0;
}

/**
 * L1 — byte == 0 gate (PE 0x9cc301/0x9ce54d): LOW-BYTE
 * (byte & 0xff) === 0 (0x100 -> byte 0 -> ok).
 */
export function gs9cc1a0ByteZeroOk(byte) {
  return (asU32(byte) & 0xff) === 0 ? 1 : 0;
}

/**
 * L2 — tail io-ready gate (PE 0x9ce55f): LOW-BYTE (al & 0xff) !== 0.
 */
export function gs9cc1a0TailReadyOk(al) {
  return (asU32(al) & 0xff) !== 0 ? 1 : 0;
}

/**
 * K1 — streamed-checksum pass (PE 0x9cc313/0x9cc31c): FULL-dword
 * (streamed === expected) || (expected === mgrF98).
 */
export function gs9cc1a0ChecksumPass(streamed, expected, mgrF98) {
  const s = asU32(streamed);
  const e = asU32(expected);
  return (s === e || e === asU32(mgrF98)) ? 1 : 0;
}

/**
 * K2 — final checksum match (PE 0x9ce545): streamed === expected.
 */
export function gs9cc1a0ChecksumMatches(streamed, expected) {
  return asU32(streamed) === asU32(expected) ? 1 : 0;
}

/**
 * M1 — u16 clamp >= 0x35 (PE 0x9cc3e7/0x9cc3f6): (count & 0xffff) >= 0x35
 * ? (count & 0xffff) : 0x35.
 */
export function gs9cc1a0Clamp0x35(count) {
  const w = asU32(count) & 0xffff;
  return w >= 0x35 ? w : 0x35;
}

/**
 * M2 — u16 clamp >= 0x1a (PE 0x9ccb13/0x9ccb1c): (count & 0xffff) >= 0x1a
 * ? (count & 0xffff) : 0x1a.
 */
export function gs9cc1a0Clamp0x1a(count) {
  const w = asU32(count) & 0xffff;
  return w >= 0x1a ? w : 0x1a;
}

export const gs9cc1a0va = () => GS9CC1A0_VA;
export const gs9cc1a0endVa = () => GS9CC1A0_END_VA;
export const gs9cc1a0bodyBytes = () => GS9CC1A0_BODY_BYTES;
export const gs9cc1a0nextVa = () => GS9CC1A0_NEXT_VA;
export const gs9cc1a0sehHandlerDat = () => GS9CC1A0_SEH_HANDLER_DAT;
export const gs9cc1a0gsCookieDat = () => GS9CC1A0_GS_COOKIE_DAT;
export const gs9cc1a0ioFormatOff = () => GS9CC1A0_IO_FORMAT_OFF;
export const gs9cc1a0gsFormatOff = () => GS9CC1A0_GS_FORMAT_OFF;
export const gs9cc1a0ioFormatStoreVa = () => GS9CC1A0_IO_FORMAT_STORE_VA;
export const gs9cc1a0deleteCallVa = () => GS9CC1A0_DELETE_CALL_VA;
export const gs9cc1a0readPillCallVa0 = () => GS9CC1A0_READ_PILL_CALL_VA_0;
export const gs9cc1a0readPillCallVa1 = () => GS9CC1A0_READ_PILL_CALL_VA_1;
export const gs9cc1a0readPillCallVa2 = () => GS9CC1A0_READ_PILL_CALL_VA_2;
export const gs9cc1a0readPillCallVa3 = () => GS9CC1A0_READ_PILL_CALL_VA_3;
export const gs9cc1a0bodyCCallVa = () => GS9CC1A0_BODY_C_CALL_VA;
export const gs9cc1a0cf000CallVa = () => GS9CC1A0_CF000_CALL_VA;
export const gs9cc1a0serializerCtorCallVa = () => GS9CC1A0_SERIALIZER_CTOR_CALL_VA;
export const gs9cc1a0checksumMagic = () => GS9CC1A0_CHECKSUM_MAGIC;
export const gs9cc1a0mgrGlobalDat = () => GS9CC1A0_MGR_GLOBAL_DAT;
export const gs9cc1a0mgrF98Off = () => GS9CC1A0_MGR_F98_OFF;
export const gs9cc1a0lane19cOff = () => GS9CC1A0_LANE19C_OFF;
export const gs9cc1a0lane19cBound = () => GS9CC1A0_LANE19C_BOUND;
export const gs9cc1a0holders1Off = () => GS9CC1A0_HOLDERS1_OFF;
export const gs9cc1a0values1Off = () => GS9CC1A0_VALUES1_OFF;
export const gs9cc1a0holders2Off = () => GS9CC1A0_HOLDERS2_OFF;
export const gs9cc1a0values2Off = () => GS9CC1A0_VALUES2_OFF;
export const gs9cc1a0table19530Off = () => GS9CC1A0_TABLE19530_OFF;
export const gs9cc1a0table19d1cEnd = () => GS9CC1A0_TABLE19D1C_END;
export const gs9cc1a0slot13BaseOff = () => GS9CC1A0_SLOT13_BASE_OFF;
export const gs9cc1a0byte80Bound = () => GS9CC1A0_BYTE80_BOUND;
export const gs9cc1a0byte4dBound = () => GS9CC1A0_BYTE4D_BOUND;
export const gs9cc1a0word25Bound = () => GS9CC1A0_WORD25_BOUND;
export const gs9cc1a0clamp35Const = () => GS9CC1A0_CLAMP35_CONST;
export const gs9cc1a0clamp1aConst = () => GS9CC1A0_CLAMP1A_CONST;
export const gs9cc1a0strideB8 = () => GS9CC1A0_STRIDE_B8;
export const gs9cc1a0strideC = () => GS9CC1A0_STRIDE_C;
export const gs9cc1a0gsGate0x2bVa = () => GS9CC1A0_GS_GATE_0X2B_VA;
export const gs9cc1a0gsGate0x2eVa = () => GS9CC1A0_GS_GATE_0X2E_VA;
export const gs9cc1a0gsGate0x2fVa = () => GS9CC1A0_GS_GATE_0X2F_VA;
export const gs9cc1a0gsGate0x30Va = () => GS9CC1A0_GS_GATE_0X30_VA;
export const gs9cc1a0gsGate0x33Va = () => GS9CC1A0_GS_GATE_0X33_VA;
export const gs9cc1a0gsGate0x34Va = () => GS9CC1A0_GS_GATE_0X34_VA;
export const gs9cc1a0gsGate0x40Va = () => GS9CC1A0_GS_GATE_0X40_VA;
export const gs9cc1a0gsGate0x42Va = () => GS9CC1A0_GS_GATE_0X42_VA;
export const gs9cc1a0gsGate0x43Va = () => GS9CC1A0_GS_GATE_0X43_VA;
export const gs9cc1a0gsGate0x44Va = () => GS9CC1A0_GS_GATE_0X44_VA;
export const gs9cc1a0gsGate0x47Va = () => GS9CC1A0_GS_GATE_0X47_VA;
export const gs9cc1a0gsGate0x48Va = () => GS9CC1A0_GS_GATE_0X48_VA;
export const gs9cc1a0gsGate0x50Va = () => GS9CC1A0_GS_GATE_0X50_VA;
export const gs9cc1a0gsGate0x53Va = () => GS9CC1A0_GS_GATE_0X53_VA;
export const gs9cc1a0gsGate0x54Va = () => GS9CC1A0_GS_GATE_0X54_VA;
export const gs9cc1a0gsGate0x57Va = () => GS9CC1A0_GS_GATE_0X57_VA;
export const gs9cc1a0gsGate0x59Va = () => GS9CC1A0_GS_GATE_0X59_VA;
export const gs9cc1a0gsGate0x85Va = () => GS9CC1A0_GS_GATE_0X85_VA;
export const gs9cc1a0gsGate0x86Va = () => GS9CC1A0_GS_GATE_0X86_VA;
export const gs9cc1a0gsGate0x87Va = () => GS9CC1A0_GS_GATE_0X87_VA;
export const gs9cc1a0gsGate0x89Va = () => GS9CC1A0_GS_GATE_0X89_VA;
export const gs9cc1a0gsGate0x8aVa = () => GS9CC1A0_GS_GATE_0X8A_VA;
export const gs9cc1a0gsGate0x8dVa = () => GS9CC1A0_GS_GATE_0X8D_VA;
export const gs9cc1a0gsGate0x93Va = () => GS9CC1A0_GS_GATE_0X93_VA;
export const gs9cc1a0gsGate0x95Va = () => GS9CC1A0_GS_GATE_0X95_VA;
export const gs9cc1a0gsGate0x98Va = () => GS9CC1A0_GS_GATE_0X98_VA;
export const gs9cc1a0gsGate0x9bVa = () => GS9CC1A0_GS_GATE_0X9B_VA;
export const gs9cc1a0ioGate0x56Va = () => GS9CC1A0_IO_GATE_0X56_VA;
export const gs9cc1a0ioGate0x7cVa = () => GS9CC1A0_IO_GATE_0X7C_VA;
export const gs9cc1a0ioGate0xa5Va = () => GS9CC1A0_IO_GATE_0XA5_VA;
export const gs9cc1a0gsGate0x21Va = () => GS9CC1A0_GS_GATE_0X21_VA;
export const gs9cc1a0ioGate0x7bVa = () => GS9CC1A0_IO_GATE_0X7B_VA;
export const gs9cc1a0ioGate0x7bVa2 = () => GS9CC1A0_IO_GATE_0X7B_VA_2;
export const gs9cc1a0dispatch0Va = () => GS9CC1A0_DISPATCH0_VA;
export const gs9cc1a0dispatch1Va = () => GS9CC1A0_DISPATCH1_VA;
export const gs9cc1a0dispatch2Va = () => GS9CC1A0_DISPATCH2_VA;
export const gs9cc1a0dispatch3Va = () => GS9CC1A0_DISPATCH3_VA;
export const gs9cc1a0dispatch4Va = () => GS9CC1A0_DISPATCH4_VA;
export const gs9cc1a0dispatch5Va = () => GS9CC1A0_DISPATCH5_VA;
export const gs9cc1a0dispatch6Va = () => GS9CC1A0_DISPATCH6_VA;
export const gs9cc1a0dispatch7Va = () => GS9CC1A0_DISPATCH7_VA;
export const gs9cc1a0dispatchSecondPassVa = () => GS9CC1A0_DISPATCH_SECOND_PASS_VA;
export const gs9cc1a0t164CountVa = () => GS9CC1A0_T164_COUNT_VA;
export const gs9cc1a0count1fbGateVa = () => GS9CC1A0_COUNT_1FB_GATE_VA;
export const gs9cc1a0table19d1cMoreVa = () => GS9CC1A0_TABLE_19D1C_MORE_VA;
export const gs9cc1a0byte0x50MoreVa = () => GS9CC1A0_BYTE_0X50_MORE_VA;
export const gs9cc1a0byte0x4dMoreVa = () => GS9CC1A0_BYTE_0X4D_MORE_VA;
export const gs9cc1a0word0x25MoreVa = () => GS9CC1A0_WORD_0X25_MORE_VA;
export const gs9cc1a0wordMoreVa = () => GS9CC1A0_WORD_MORE_VA;
export const gs9cc1a0count8MoreVa = () => GS9CC1A0_COUNT8_MORE_VA;
export const gs9cc1a0signedBytePosVa = () => GS9CC1A0_SIGNED_BYTE_POS_VA;
export const gs9cc1a0signedIdxMovsx8Va = () => GS9CC1A0_SIGNED_IDX_MOVSX8_VA;
export const gs9cc1a0signedIdxCountVa = () => GS9CC1A0_SIGNED_IDX_COUNT_VA;
export const gs9cc1a0signedByteLtVa = () => GS9CC1A0_SIGNED_BYTE_LT_VA;
export const gs9cc1a0byteZeroGateVa = () => GS9CC1A0_BYTE_ZERO_GATE_VA;
export const gs9cc1a0tailReadyGateVa = () => GS9CC1A0_TAIL_READY_GATE_VA;
export const gs9cc1a0checksumPassVa = () => GS9CC1A0_CHECKSUM_PASS_VA;
export const gs9cc1a0checksumMatchVa = () => GS9CC1A0_CHECKSUM_MATCH_VA;
export const gs9cc1a0clamp35Va = () => GS9CC1A0_CLAMP35_VA;
export const gs9cc1a0clamp1aVa = () => GS9CC1A0_CLAMP1A_VA;
export const gs9cc1a0CallerCount = () => GS9CC1A0_CALLER_COUNT;
export const gs9cc1a0CallerVaAt = (index) =>
  GS9CC1A0_CALLER_VAS[index >>> 0] ?? 0;
export const GS9CE720_VA = 0x9ce720; /* v10 */
export const GS9CE720_END_VA = 0x9cec74; /* v10 */
export const GS9CE720_BODY_BYTES = 0x154; /* v10 */
export const GS9CE720_NEXT_VA = 0x9cec80; /* v10 */
export const GS9CE720_IO_FORMAT_OFF = 0x8; /* v10 */
export const GS9CE720_MGR_GLOBAL_DAT = 0xc7169c; /* v10 */
export const GS9CE720_MGR_VEC_A_START_OFF = 0x2a404; /* v10 */
export const GS9CE720_MGR_VEC_A_END_OFF = 0x2a408; /* v10 */
export const GS9CE720_MGR_VEC_B_START_OFF = 0x2a410; /* v10 */
export const GS9CE720_MGR_VEC_B_END_OFF = 0x2a414; /* v10 */
export const GS9D05D0_VA = 0x9d05d0; /* v10 */
export const GS9D05D0_END_VA = 0x9d45b7; /* v10 */
export const GS9D05D0_BODY_BYTES = 0x3fe7; /* v10 */
export const GS9D05D0_NEXT_VA = 0x9d45c0; /* v10 */
export const GS9D05D0_SEH_HANDLER_DAT = 0xb0f39e; /* v10 */
export const GS9D05D0_GS_COOKIE_DAT = 0xbf93b4; /* v10 */
export const GS9D05D0_IO_FORMAT_OFF = 0x8; /* v10 */
export const GS9D05D0_READER_ROW_CALL_VA = 0x9d1df0; /* v10 */
export const GS9D05D0_MGR_GLOBAL_DAT = 0xc7169c; /* v10 */
export const GS9D05D0_MGR_VEC_2A404 = 0x2a404; /* v10 */
export const GS9D05D0_MGR_VEC_2A408 = 0x2a408; /* v10 */
export const GS9D05D0_MGR_VEC_2A410 = 0x2a410; /* v10 */
export const GS9D05D0_MGR_VEC_2A414 = 0x2a414; /* v10 */
export const GS9D05D0_COUNT_CAP = 0x2222222; /* v10 */
export const GS9D05D0_CLAMP0X14_CONST = 0x14; /* v10 */
export const GS9D05D0_CLAMP0XA_CONST = 0xa; /* v10 */
export const GS9D05D0_RANGE_LO = 0x2f; /* v10 */
export const GS9D05D0_RANGE_HI = 0x61; /* v10 */
export const GS9D05D0_STRIDE_148 = 0x148; /* v10 */
export const GS9D05D0_MASK_7FFF = 0x7fff; /* v10 */
export const GS9CE720_CALLER_COUNT = 1;
export const GS9CE720_CALLER_VA_0 = 0x009cda14;
export const GS9D05D0_CALLER_COUNT = 7;
export const GS9D05D0_CALLER_VA_0 = 0x0090c933;
export const GS9D05D0_CALLER_VA_1 = 0x009cd70f;
export const GS9D05D0_CALLER_VA_2 = 0x009cd7d8;
export const GS9D05D0_CALLER_VA_3 = 0x009cd847;
export const GS9D05D0_CALLER_VA_4 = 0x009cd8aa;
export const GS9D05D0_CALLER_VA_5 = 0x009d806b;
export const GS9D05D0_CALLER_VA_6 = 0x009d80f3;
export const GS9CE720_CALLER_VAS = [GS9CE720_CALLER_VA_0];
export const GS9D05D0_CALLER_VAS = [
  GS9D05D0_CALLER_VA_0, GS9D05D0_CALLER_VA_1, GS9D05D0_CALLER_VA_2,
  GS9D05D0_CALLER_VA_3, GS9D05D0_CALLER_VA_4, GS9D05D0_CALLER_VA_5,
  GS9D05D0_CALLER_VA_6,
];
export const GS9D05D0_IO_GATE_0X1E_VA = 0x009d1ade; /* v10 */
export const GS9D05D0_IO_GATE_0X1F_VA = 0x009d1a4f; /* v10 */
export const GS9D05D0_IO_GATE_0X20_VA = 0x009d222f; /* v10 */
export const GS9D05D0_IO_GATE_0X23_VA = 0x009d21f8; /* v10 */
export const GS9D05D0_IO_GATE_0X27_VA = 0x009d12ab; /* v10 */
export const GS9D05D0_IO_GATE_0X28_VA = 0x009d0c24; /* v10 */
export const GS9D05D0_IO_GATE_0X29_VA = 0x009d1020; /* v10 */
export const GS9D05D0_IO_GATE_0X2D_VA = 0x009d0a7c; /* v10 */
export const GS9D05D0_IO_GATE_0X2F_VA = 0x009d120d; /* v10 */
export const GS9D05D0_IO_GATE_0X30_VA = 0x009d17b3; /* v10 */
export const GS9D05D0_IO_GATE_0X38_VA = 0x009d0dbd; /* v10 */
export const GS9D05D0_IO_GATE_0X39_VA = 0x009d1c8a; /* v10 */
export const GS9D05D0_IO_GATE_0X3A_VA = 0x009d09e7; /* v10 */
export const GS9D05D0_IO_GATE_0X3B_VA = 0x009d0afa; /* v10 */
export const GS9D05D0_IO_GATE_0X3E_VA = 0x009d0aab; /* v10 */
export const GS9D05D0_IO_GATE_0X40_VA = 0x009d258c; /* v10 */
export const GS9D05D0_IO_GATE_0X41_VA = 0x009d2702; /* v10 */
export const GS9D05D0_IO_GATE_0X43_VA = 0x009d4066; /* v10 */
export const GS9D05D0_IO_GATE_0X45_VA = 0x009d0c2d; /* v10 */
export const GS9D05D0_IO_GATE_0X4C_VA = 0x009d11aa; /* v10 */
export const GS9D05D0_IO_GATE_0X4D_VA = 0x009d093b; /* v10 */
export const GS9D05D0_IO_GATE_0X4F_VA = 0x009d27db; /* v10 */
export const GS9D05D0_IO_GATE_0X50_VA = 0x009d280f; /* v10 */
export const GS9D05D0_IO_GATE_0X51_VA = 0x009d4323; /* v10 */
export const GS9D05D0_IO_GATE_0X52_VA = 0x009d2869; /* v10 */
export const GS9D05D0_IO_GATE_0X55_VA = 0x009d240a; /* v10 */
export const GS9D05D0_IO_GATE_0X58_VA = 0x009d2737; /* v10 */
export const GS9D05D0_IO_GATE_0X5A_VA = 0x009d2470; /* v10 */
export const GS9D05D0_IO_GATE_0X5B_VA = 0x009d1ec5; /* v10 */
export const GS9D05D0_IO_GATE_0X5C_VA = 0x009d2988; /* v10 */
export const GS9D05D0_IO_GATE_0X5D_VA = 0x009d291c; /* v10 */
export const GS9D05D0_IO_GATE_0X5E_VA = 0x009d1f1d; /* v10 */
export const GS9D05D0_IO_GATE_0X5F_VA = 0x009d2a01; /* v10 */
export const GS9D05D0_IO_GATE_0X60_VA = 0x009d2b1d; /* v10 */
export const GS9D05D0_IO_GATE_0X61_VA = 0x009d2c61; /* v10 */
export const GS9D05D0_IO_GATE_0X62_VA = 0x009d2dc8; /* v10 */
export const GS9D05D0_IO_GATE_0X63_VA = 0x009d29c9; /* v10 */
export const GS9D05D0_IO_GATE_0X64_VA = 0x009d0ef5; /* v10 */
export const GS9D05D0_IO_GATE_0X65_VA = 0x009d42ad; /* v10 */
export const GS9D05D0_IO_GATE_0X67_VA = 0x009d1de2; /* v10 */
export const GS9D05D0_IO_GATE_0X6A_VA = 0x009d2e36; /* v10 */
export const GS9D05D0_IO_GATE_0X6C_VA = 0x009d0f28; /* v10 */
export const GS9D05D0_IO_GATE_0X6E_VA = 0x009d3df9; /* v10 */
export const GS9D05D0_IO_GATE_0X6F_VA = 0x009d3eb7; /* v10 */
export const GS9D05D0_IO_GATE_0X72_VA = 0x009d2769; /* v10 */
export const GS9D05D0_IO_GATE_0X73_VA = 0x009d3f17; /* v10 */
export const GS9D05D0_IO_GATE_0X74_VA = 0x009d1c35; /* v10 */
export const GS9D05D0_IO_GATE_0X75_VA = 0x009d354a; /* v10 */
export const GS9D05D0_IO_GATE_0X76_VA = 0x009d357d; /* v10 */
export const GS9D05D0_IO_GATE_0X78_VA = 0x009d35ad; /* v10 */
export const GS9D05D0_IO_GATE_0X79_VA = 0x009d08cf; /* v10 */
export const GS9D05D0_IO_GATE_0X7E_VA = 0x009d35e4; /* v10 */
export const GS9D05D0_IO_GATE_0X7F_VA = 0x009d3f4a; /* v10 */
export const GS9D05D0_IO_GATE_0X80_VA = 0x009d399b; /* v10 */
export const GS9D05D0_IO_GATE_0X81_VA = 0x009d3c9c; /* v10 */
export const GS9D05D0_IO_GATE_0X82_VA = 0x009d0849; /* v10 */
export const GS9D05D0_IO_GATE_0X83_VA = 0x009d3d6f; /* v10 */
export const GS9D05D0_IO_GATE_0X8A_VA = 0x009d4403; /* v10 */
export const GS9D05D0_IO_GATE_0X8B_VA = 0x009d1314; /* v10 */
export const GS9D05D0_IO_GATE_0X8C_VA = 0x009d2197; /* v10 */
export const GS9D05D0_IO_GATE_0X8F_VA = 0x009d24ad; /* v10 */
export const GS9D05D0_IO_GATE_0X90_VA = 0x009d2f1a; /* v10 */
export const GS9D05D0_IO_GATE_0X97_VA = 0x009d131f; /* v10 */
export const GS9D05D0_IO_GATE_0X99_VA = 0x009d0e7b; /* v10 */
export const GS9D05D0_IO_GATE_0X9C_VA = 0x009d24ec; /* v10 */
export const GS9D05D0_IO_GATE_0X9D_VA = 0x009d44d3; /* v10 */
export const GS9D05D0_IO_GATE_0XA0_VA = 0x009d252f; /* v10 */
export const GS9D05D0_IO_GATE_0XA4_VA = 0x009d35f8; /* v10 */
export const GS9D05D0_IO_GATE_0XA5_VA = 0x009d0a4b; /* v10 */
export const GS9D05D0_IO_GATE_0XA6_VA = 0x009d0c58; /* v10 */
export const GS9D05D0_IO_GATE_0XA8_VA = 0x009d3d05; /* v10 */
export const GS9D05D0_IO_GATE_0XA9_VA = 0x009d3d37; /* v10 */
export const GS9D05D0_IO_GATE_0X23_ABOVE_VA = 0x009d09b4; /* v10 */
export const GS9D05D0_IO_GATE_0X24_ABOVE_VA = 0x009d0a1a; /* v10 */
export const GS9CE720_DISPATCH_COUNT_VA = 0x009ce73d; /* v10 */
export const GS9CE720_COUNT_FITS_VA = 0x009ce9c0; /* v10 */
export const GS9CE720_IO_GATE_0X4A_VA = 0x009ce938; /* v10 */
export const GS9CE720_IO_GATE_0X37_VA = 0x009ce96b; /* v10 */
export const GS9CE720_DEFAULT_COUNT_0X1FF_0X2DD_VA = 0x009ce997; /* v10 */
export const GS9CE720_DEFAULT_COUNT_0X78_0XBE_VA = 0x009ceac4; /* v10 */
export const GS9CE720_COUNT_0XE_0XF_VA = 0x009cebea; /* v10 */
export const GS9CE720_IO_GATE_0X4E_VA = 0x009cec35; /* v10 */
export const GS9D05D0_LANE_COUNT_1_4_VA = 0x009d0df7; /* v10 */
export const GS9D05D0_LANE_COUNT_2_4_VA = 0x009d1085; /* v10 */
export const GS9D05D0_COUNT_0XF_0X10_VA = 0x009d1171; /* v10 */
export const GS9D05D0_FORMAT_IN_RANGE_VA = 0x009d15ef; /* v10 */
export const GS9D05D0_COUNT_CAP_OK_VA = 0x009d1ce2; /* v10 */
export const GS9D05D0_IDX_LE_VECSIZE_VA = 0x009d2b9a; /* v10 */
export const GS9D05D0_SLOT_CAP_LT_3_VA = 0x009d3061; /* v10 */
export const GS9D05D0_CLAMP_0X14_VA = 0x009d340e; /* v10 */
export const GS9D05D0_CLAMP_SIGNED_0XA_VA = 0x009d1b13; /* v10 */
export const GS9D05D0_HEAD_NONNEG_VA = 0x009d0644; /* v10 */
export const GS9D05D0_HEAD_LT_VECSIZE_VA = 0x009d0670; /* v10 */
export const GS9D05D0_SIGNED_POSITIVE_VA = 0x009d0e58; /* v10 */
export const GS9D05D0_SIGNED_IDX_LT_VECSIZE_VA = 0x009d2fc0; /* v10 */
export const GS9D05D0_IDX_MASKED_7FFF_LT_VECSIZE_VA = 0x009d41d2; /* v10 */
export const GS9D05D0_VALUE_NEG_OVERRIDE_VA = 0x009d4250; /* v10 */
export const GS9D05D0_BYTE_NONZERO_VA = 0x009d251d; /* v10 */
export const GS9D05D0_BYTE_EQ_1_VA = 0x009d1118; /* v10 */
export const GS9D05D0_BYTE_FF_OK_VA = 0x009d3f7f; /* v10 */
export const GS9D05D0_U32_COUNT_NEEDED_VA = 0x009d16f4; /* v10 */
export const GS9D05D0_READY_OK_VA = 0x009d170b; /* v10 */
export const GS9D05D0_V2FD10_RESULT_OK_VA = 0x009d0e70; /* v10 */
export const GS9D05D0_C7350_RESULT_OK_VA = 0x009d178f; /* v10 */
export const GS9D05D0_CFF40_RESULT_OK_VA = 0x009d268d; /* v10 */
export const GS9D05D0_BYTE_IDX_LT_BYTE_VA = 0x009d2699; /* v10 */
export const GS9D05D0_IDX_LT_2_VA = 0x009d3aed; /* v10 */
export const GS9D05D0_IDX_LT_6_VA = 0x009d33e3; /* v10 */
export const GS9D05D0_IDX_LT_8_VA = 0x009d333d; /* v10 */
export const GS9D05D0_WORD_IDX_LT_COUNT_VA = 0x009d2c55; /* v10 */
export const GS9D05D0_UINT_IDX_LT_COUNT_VA = 0x009d17a1; /* v10 */
/** gs9ce720DispatchCount — PE pins: 0x9ce73d 0x9ce74d 0x9ce753 0x9ce763 */
export function gs9ce720DispatchCount(io8) {
  const f = asU32(io8);
    if (f < 0x57) return 0x1a;
    if (f < 0x69) return 0x1b;
    if (f < 0x70) return 0x1c;
    if (f < 0x7a) return 0x1d;
    return 0x1f;
}
/** gs9ce720CountFits — PE pins: 0x9ce9c0 0x9ceaea */
export function gs9ce720CountFits(count, vecsize) {
  return asU32(count) <= asU32(vecsize) ? 1 : 0;
}
/** gs9ce720IoGate0x4a — PE pins: 0x9ce938 */
export function gs9ce720IoGate0x4a(io8) {
  return asU32(io8) >= 0x4a ? 1 : 0;
}
/** gs9ce720IoGate0x37 — PE pins: 0x9ce96b 0x9cea98 */
export function gs9ce720IoGate0x37(io8) {
  return asU32(io8) >= 0x37 ? 1 : 0;
}
/** gs9ce720DefaultCount0x1ff0x2dd — PE pins: 0x9ce997 */
export function gs9ce720DefaultCount0x1ff0x2dd(io8) {
  return asU32(io8) < 0x35 ? 0x1ff : 0x2dd;
}
/** gs9ce720DefaultCount0x78_0xbe — PE pins: 0x9ceac4 */
export function gs9ce720DefaultCount0x78_0xbe(io8) {
  return asU32(io8) < 0x35 ? 0x78 : 0xbe;
}
/** gs9ce720Count0xe_0xf — PE pins: 0x9cebea */
export function gs9ce720Count0xe_0xf(io8) {
  return asU32(io8) < 0x77 ? 0xe : 0xf;
}
/** gs9ce720IoGate0x4e — PE pins: 0x9cec35 */
export function gs9ce720IoGate0x4e(io8) {
  return asU32(io8) >= 0x4e ? 1 : 0;
}
/** gs9d05d0IoGate0x1E — PE pins: 0x9d1ade */
export function gs9d05d0IoGate0x1E(io8) {
  return asU32(io8) >= 0x1e ? 1 : 0;
}
/** gs9d05d0IoGate0x1F — PE pins: 0x9d1a4f */
export function gs9d05d0IoGate0x1F(io8) {
  return asU32(io8) >= 0x1f ? 1 : 0;
}
/** gs9d05d0IoGate0x20 — PE pins: 0x9d222f */
export function gs9d05d0IoGate0x20(io8) {
  return asU32(io8) >= 0x20 ? 1 : 0;
}
/** gs9d05d0IoGate0x23 — PE pins: 0x9d21f8 */
export function gs9d05d0IoGate0x23(io8) {
  return asU32(io8) >= 0x23 ? 1 : 0;
}
/** gs9d05d0IoGate0x27 — PE pins: 0x9d12ab */
export function gs9d05d0IoGate0x27(io8) {
  return asU32(io8) >= 0x27 ? 1 : 0;
}
/** gs9d05d0IoGate0x28 — PE pins: 0x9d0c24 */
export function gs9d05d0IoGate0x28(io8) {
  return asU32(io8) >= 0x28 ? 1 : 0;
}
/** gs9d05d0IoGate0x29 — PE pins: 0x9d1020 */
export function gs9d05d0IoGate0x29(io8) {
  return asU32(io8) >= 0x29 ? 1 : 0;
}
/** gs9d05d0IoGate0x2D — PE pins: 0x9d0a7c */
export function gs9d05d0IoGate0x2D(io8) {
  return asU32(io8) >= 0x2d ? 1 : 0;
}
/** gs9d05d0IoGate0x2F — PE pins: 0x9d120d 0x9d17f3 */
export function gs9d05d0IoGate0x2F(io8) {
  return asU32(io8) >= 0x2f ? 1 : 0;
}
/** gs9d05d0IoGate0x30 — PE pins: 0x9d17b3 */
export function gs9d05d0IoGate0x30(io8) {
  return asU32(io8) >= 0x30 ? 1 : 0;
}
/** gs9d05d0IoGate0x38 — PE pins: 0x9d0dbd */
export function gs9d05d0IoGate0x38(io8) {
  return asU32(io8) >= 0x38 ? 1 : 0;
}
/** gs9d05d0IoGate0x39 — PE pins: 0x9d1c8a */
export function gs9d05d0IoGate0x39(io8) {
  return asU32(io8) >= 0x39 ? 1 : 0;
}
/** gs9d05d0IoGate0x3A — PE pins: 0x9d09e7 */
export function gs9d05d0IoGate0x3A(io8) {
  return asU32(io8) >= 0x3a ? 1 : 0;
}
/** gs9d05d0IoGate0x3B — PE pins: 0x9d0afa */
export function gs9d05d0IoGate0x3B(io8) {
  return asU32(io8) >= 0x3b ? 1 : 0;
}
/** gs9d05d0IoGate0x3E — PE pins: 0x9d0aab */
export function gs9d05d0IoGate0x3E(io8) {
  return asU32(io8) >= 0x3e ? 1 : 0;
}
/** gs9d05d0IoGate0x40 — PE pins: 0x9d258c */
export function gs9d05d0IoGate0x40(io8) {
  return asU32(io8) >= 0x40 ? 1 : 0;
}
/** gs9d05d0IoGate0x41 — PE pins: 0x9d2702 */
export function gs9d05d0IoGate0x41(io8) {
  return asU32(io8) >= 0x41 ? 1 : 0;
}
/** gs9d05d0IoGate0x43 — PE pins: 0x9d4066 */
export function gs9d05d0IoGate0x43(io8) {
  return asU32(io8) >= 0x43 ? 1 : 0;
}
/** gs9d05d0IoGate0x45 — PE pins: 0x9d0c2d */
export function gs9d05d0IoGate0x45(io8) {
  return asU32(io8) >= 0x45 ? 1 : 0;
}
/** gs9d05d0IoGate0x4C — PE pins: 0x9d11aa */
export function gs9d05d0IoGate0x4C(io8) {
  return asU32(io8) >= 0x4c ? 1 : 0;
}
/** gs9d05d0IoGate0x4D — PE pins: 0x9d093b 0x9d1252 0x9d190c */
export function gs9d05d0IoGate0x4D(io8) {
  return asU32(io8) >= 0x4d ? 1 : 0;
}
/** gs9d05d0IoGate0x4F — PE pins: 0x9d27db */
export function gs9d05d0IoGate0x4F(io8) {
  return asU32(io8) >= 0x4f ? 1 : 0;
}
/** gs9d05d0IoGate0x50 — PE pins: 0x9d280f */
export function gs9d05d0IoGate0x50(io8) {
  return asU32(io8) >= 0x50 ? 1 : 0;
}
/** gs9d05d0IoGate0x51 — PE pins: 0x9d4323 */
export function gs9d05d0IoGate0x51(io8) {
  return asU32(io8) >= 0x51 ? 1 : 0;
}
/** gs9d05d0IoGate0x52 — PE pins: 0x9d2869 */
export function gs9d05d0IoGate0x52(io8) {
  return asU32(io8) >= 0x52 ? 1 : 0;
}
/** gs9d05d0IoGate0x55 — PE pins: 0x9d240a */
export function gs9d05d0IoGate0x55(io8) {
  return asU32(io8) >= 0x55 ? 1 : 0;
}
/** gs9d05d0IoGate0x58 — PE pins: 0x9d2737 */
export function gs9d05d0IoGate0x58(io8) {
  return asU32(io8) >= 0x58 ? 1 : 0;
}
/** gs9d05d0IoGate0x5A — PE pins: 0x9d2470 */
export function gs9d05d0IoGate0x5A(io8) {
  return asU32(io8) >= 0x5a ? 1 : 0;
}
/** gs9d05d0IoGate0x5B — PE pins: 0x9d1ec5 0x9d289b */
export function gs9d05d0IoGate0x5B(io8) {
  return asU32(io8) >= 0x5b ? 1 : 0;
}
/** gs9d05d0IoGate0x5C — PE pins: 0x9d2988 */
export function gs9d05d0IoGate0x5C(io8) {
  return asU32(io8) >= 0x5c ? 1 : 0;
}
/** gs9d05d0IoGate0x5D — PE pins: 0x9d291c */
export function gs9d05d0IoGate0x5D(io8) {
  return asU32(io8) >= 0x5d ? 1 : 0;
}
/** gs9d05d0IoGate0x5E — PE pins: 0x9d1f1d */
export function gs9d05d0IoGate0x5E(io8) {
  return asU32(io8) >= 0x5e ? 1 : 0;
}
/** gs9d05d0IoGate0x5F — PE pins: 0x9d2a01 */
export function gs9d05d0IoGate0x5F(io8) {
  return asU32(io8) >= 0x5f ? 1 : 0;
}
/** gs9d05d0IoGate0x60 — PE pins: 0x9d2b1d */
export function gs9d05d0IoGate0x60(io8) {
  return asU32(io8) >= 0x60 ? 1 : 0;
}
/** gs9d05d0IoGate0x61 — PE pins: 0x9d2c61 */
export function gs9d05d0IoGate0x61(io8) {
  return asU32(io8) >= 0x61 ? 1 : 0;
}
/** gs9d05d0IoGate0x62 — PE pins: 0x9d2dc8 */
export function gs9d05d0IoGate0x62(io8) {
  return asU32(io8) >= 0x62 ? 1 : 0;
}
/** gs9d05d0IoGate0x63 — PE pins: 0x9d29c9 */
export function gs9d05d0IoGate0x63(io8) {
  return asU32(io8) >= 0x63 ? 1 : 0;
}
/** gs9d05d0IoGate0x64 — PE pins: 0x9d0ef5 0x9d2dfa */
export function gs9d05d0IoGate0x64(io8) {
  return asU32(io8) >= 0x64 ? 1 : 0;
}
/** gs9d05d0IoGate0x65 — PE pins: 0x9d42ad */
export function gs9d05d0IoGate0x65(io8) {
  return asU32(io8) >= 0x65 ? 1 : 0;
}
/** gs9d05d0IoGate0x67 — PE pins: 0x9d1de2 */
export function gs9d05d0IoGate0x67(io8) {
  return asU32(io8) >= 0x67 ? 1 : 0;
}
/** gs9d05d0IoGate0x6A — PE pins: 0x9d2e36 */
export function gs9d05d0IoGate0x6A(io8) {
  return asU32(io8) >= 0x6a ? 1 : 0;
}
/** gs9d05d0IoGate0x6C — PE pins: 0x9d0f28 0x9d2eea */
export function gs9d05d0IoGate0x6C(io8) {
  return asU32(io8) >= 0x6c ? 1 : 0;
}
/** gs9d05d0IoGate0x6E — PE pins: 0x9d3df9 */
export function gs9d05d0IoGate0x6E(io8) {
  return asU32(io8) >= 0x6e ? 1 : 0;
}
/** gs9d05d0IoGate0x6F — PE pins: 0x9d3eb7 */
export function gs9d05d0IoGate0x6F(io8) {
  return asU32(io8) >= 0x6f ? 1 : 0;
}
/** gs9d05d0IoGate0x72 — PE pins: 0x9d2769 */
export function gs9d05d0IoGate0x72(io8) {
  return asU32(io8) >= 0x72 ? 1 : 0;
}
/** gs9d05d0IoGate0x73 — PE pins: 0x9d3f17 */
export function gs9d05d0IoGate0x73(io8) {
  return asU32(io8) >= 0x73 ? 1 : 0;
}
/** gs9d05d0IoGate0x74 — PE pins: 0x9d1c35 */
export function gs9d05d0IoGate0x74(io8) {
  return asU32(io8) >= 0x74 ? 1 : 0;
}
/** gs9d05d0IoGate0x75 — PE pins: 0x9d354a */
export function gs9d05d0IoGate0x75(io8) {
  return asU32(io8) >= 0x75 ? 1 : 0;
}
/** gs9d05d0IoGate0x76 — PE pins: 0x9d357d */
export function gs9d05d0IoGate0x76(io8) {
  return asU32(io8) >= 0x76 ? 1 : 0;
}
/** gs9d05d0IoGate0x78 — PE pins: 0x9d35ad */
export function gs9d05d0IoGate0x78(io8) {
  return asU32(io8) >= 0x78 ? 1 : 0;
}
/** gs9d05d0IoGate0x79 — PE pins: 0x9d08cf */
export function gs9d05d0IoGate0x79(io8) {
  return asU32(io8) >= 0x79 ? 1 : 0;
}
/** gs9d05d0IoGate0x7E — PE pins: 0x9d35e4 */
export function gs9d05d0IoGate0x7E(io8) {
  return asU32(io8) >= 0x7e ? 1 : 0;
}
/** gs9d05d0IoGate0x7F — PE pins: 0x9d3f4a */
export function gs9d05d0IoGate0x7F(io8) {
  return asU32(io8) >= 0x7f ? 1 : 0;
}
/** gs9d05d0IoGate0x80 — PE pins: 0x9d399b */
export function gs9d05d0IoGate0x80(io8) {
  return asU32(io8) >= 0x80 ? 1 : 0;
}
/** gs9d05d0IoGate0x81 — PE pins: 0x9d3c9c */
export function gs9d05d0IoGate0x81(io8) {
  return asU32(io8) >= 0x81 ? 1 : 0;
}
/** gs9d05d0IoGate0x82 — PE pins: 0x9d0849 0x9d3af5 0x9d3ccb */
export function gs9d05d0IoGate0x82(io8) {
  return asU32(io8) >= 0x82 ? 1 : 0;
}
/** gs9d05d0IoGate0x83 — PE pins: 0x9d3d6f */
export function gs9d05d0IoGate0x83(io8) {
  return asU32(io8) >= 0x83 ? 1 : 0;
}
/** gs9d05d0IoGate0x8A — PE pins: 0x9d4403 */
export function gs9d05d0IoGate0x8A(io8) {
  return asU32(io8) >= 0x8a ? 1 : 0;
}
/** gs9d05d0IoGate0x8B — PE pins: 0x9d1314 */
export function gs9d05d0IoGate0x8B(io8) {
  return asU32(io8) >= 0x8b ? 1 : 0;
}
/** gs9d05d0IoGate0x8C — PE pins: 0x9d2197 */
export function gs9d05d0IoGate0x8C(io8) {
  return asU32(io8) >= 0x8c ? 1 : 0;
}
/** gs9d05d0IoGate0x8F — PE pins: 0x9d24ad */
export function gs9d05d0IoGate0x8F(io8) {
  return asU32(io8) >= 0x8f ? 1 : 0;
}
/** gs9d05d0IoGate0x90 — PE pins: 0x9d2f1a */
export function gs9d05d0IoGate0x90(io8) {
  return asU32(io8) >= 0x90 ? 1 : 0;
}
/** gs9d05d0IoGate0x97 — PE pins: 0x9d131f */
export function gs9d05d0IoGate0x97(io8) {
  return asU32(io8) >= 0x97 ? 1 : 0;
}
/** gs9d05d0IoGate0x99 — PE pins: 0x9d0e7b 0x9d336a */
export function gs9d05d0IoGate0x99(io8) {
  return asU32(io8) >= 0x99 ? 1 : 0;
}
/** gs9d05d0IoGate0x9C — PE pins: 0x9d24ec */
export function gs9d05d0IoGate0x9C(io8) {
  return asU32(io8) >= 0x9c ? 1 : 0;
}
/** gs9d05d0IoGate0x9D — PE pins: 0x9d44d3 */
export function gs9d05d0IoGate0x9D(io8) {
  return asU32(io8) >= 0x9d ? 1 : 0;
}
/** gs9d05d0IoGate0xA0 — PE pins: 0x9d252f */
export function gs9d05d0IoGate0xA0(io8) {
  return asU32(io8) >= 0xa0 ? 1 : 0;
}
/** gs9d05d0IoGate0xA4 — PE pins: 0x9d35f8 */
export function gs9d05d0IoGate0xA4(io8) {
  return asU32(io8) >= 0xa4 ? 1 : 0;
}
/** gs9d05d0IoGate0xA5 — PE pins: 0x9d0a4b */
export function gs9d05d0IoGate0xA5(io8) {
  return asU32(io8) >= 0xa5 ? 1 : 0;
}
/** gs9d05d0IoGate0xA6 — PE pins: 0x9d0c58 */
export function gs9d05d0IoGate0xA6(io8) {
  return asU32(io8) >= 0xa6 ? 1 : 0;
}
/** gs9d05d0IoGate0xA8 — PE pins: 0x9d3d05 */
export function gs9d05d0IoGate0xA8(io8) {
  return asU32(io8) >= 0xa8 ? 1 : 0;
}
/** gs9d05d0IoGate0xA9 — PE pins: 0x9d3d37 */
export function gs9d05d0IoGate0xA9(io8) {
  return asU32(io8) >= 0xa9 ? 1 : 0;
}
/** gs9d05d0IoGate0x23Above — PE pins: 0x9d09b4 */
export function gs9d05d0IoGate0x23Above(io8) {
  return asU32(io8) > 0x23 ? 1 : 0;
}
/** gs9d05d0IoGate0x24Above — PE pins: 0x9d0a1a */
export function gs9d05d0IoGate0x24Above(io8) {
  return asU32(io8) > 0x24 ? 1 : 0;
}
/** gs9d05d0LaneCount1_4 — PE pins: 0x9d0df7 0x9d0e05 0x9d0e13 */
export function gs9d05d0LaneCount1_4(io8) {
  const f = asU32(io8);
    if (f < 0x3c) return 1;
    if (f < 0x66) return 2;
    if (f < 0x71) return 3;
    return 4;
}
/** gs9d05d0LaneCount2_4 — PE pins: 0x9d1085 0x9d10a0 */
export function gs9d05d0LaneCount2_4(io8) {
  const f = asU32(io8);
    if (f < 0x66) return 2;
    if (f < 0x71) return 3;
    return 4;
}
/** gs9d05d0Count0xf0x10 — PE pins: 0x9d1171 */
export function gs9d05d0Count0xf0x10(io8) {
  return asU32(io8) < 0xa7 ? 0xf : 0x10;
}
/** gs9d05d0FormatInRange — PE pins: 0x9d15ef */
export function gs9d05d0FormatInRange(io8) {
  return ((asU32(io8) - 0x2f) >>> 0) <= 0x61 ? 1 : 0;
}
/** gs9d05d0CountCapOk — PE pins: 0x9d1ce2 */
export function gs9d05d0CountCapOk(count) {
  return asU32(count) <= 0x2222222 ? 1 : 0;
}
/** gs9d05d0IdxLeVecsize — PE pins: 0x9d2b9a */
export function gs9d05d0IdxLeVecsize(idx, size) {
  return asU32(idx) <= asU32(size) ? 1 : 0;
}
/** gs9d05d0SlotCapLt3 — PE pins: 0x9d3061 0x9d31d0 */
export function gs9d05d0SlotCapLt3(count) {
  return asU32(count) < 3 ? 1 : 0;
}
/** gs9d05d0Clamp0x14 — PE pins: 0x9d340e */
export function gs9d05d0Clamp0x14(count) {
  return Math.min(asU32(count), 0x14);
}
/** gs9d05d0ClampSigned0xa — PE pins: 0x9d1b13 */
export function gs9d05d0ClampSigned0xa(count) {
  const c = asU32(count);
    return BigInt(c | 0) <= 10n ? c : 0xa;
}
/** gs9d05d0HeadNonneg — PE pins: 0x9d0644 */
export function gs9d05d0HeadNonneg(v) {
  return BigInt(v | 0) >= 0n ? 1 : 0;
}
/** gs9d05d0HeadLtVecsize — PE pins: 0x9d0670 */
export function gs9d05d0HeadLtVecsize(count, vecsize) {
  return BigInt(count | 0) < BigInt(vecsize | 0) ? 1 : 0;
}
/** gs9d05d0SignedPositive — PE pins: 0x9d0e58 0x9d364f 0x9d3ee4 0x9d43d6 */
export function gs9d05d0SignedPositive(count) {
  return BigInt(count | 0) > 0n ? 1 : 0;
}
/** gs9d05d0SignedIdxLtVecsize — PE pins: 0x9d2fc0 0x9d1837 0x9d4044 0x9d41f1 */
export function gs9d05d0SignedIdxLtVecsize(idx, vecsize) {
  return BigInt(idx | 0) < BigInt(vecsize | 0) ? 1 : 0;
}
/** gs9d05d0IdxMasked7fffLtVecsize — PE pins: 0x9d41d2 0x9d159e 0x9d3aaa 0x9d3c4e */
export function gs9d05d0IdxMasked7fffLtVecsize(idx, vecsize) {
  return BigInt((idx & 0x7fff) | 0) < BigInt(vecsize | 0) ? 1 : 0;
}
/** gs9d05d0ValueNegOverride — PE pins: 0x9d4250 */
export function gs9d05d0ValueNegOverride(v) {
  return BigInt(v | 0) < 0n ? 1 : 0;
}
/** gs9d05d0ByteNonzero — PE pins: 0x9d251d 0x9d2563 0x9d38ba 0x9d38f3 0x9d265e 0x9d2f51 0x9d3438 0x9d3e3f 0x9d42da 0x9d4368 */
export function gs9d05d0ByteNonzero(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d05d0ByteEq1 — PE pins: 0x9d1118 0x9d2f9b 0x9d3a0d */
export function gs9d05d0ByteEq1(byte) {
  return (asU32(byte) & 0xff) === 1 ? 1 : 0;
}
/** gs9d05d0ByteFfOk — PE pins: 0x9d3f7f */
export function gs9d05d0ByteFfOk(byte) {
  return (asU32(byte) & 0xff) !== 0xff ? 1 : 0;
}
/** gs9d05d0U32CountNeeded — PE pins: 0x9d16f4 0x9d2289 0x9d409e 0x9d4433 0x9d450c */
export function gs9d05d0U32CountNeeded(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
/** gs9d05d0ReadyOk — PE pins: 0x9d170b 0x9d22b0 0x9d2669 0x9d3670 0x9d40ad */
export function gs9d05d0ReadyOk(al) {
  return (asU32(al) & 0xff) === 0 ? 1 : 0;
}
/** gs9d05d0V2fd10ResultOk — PE pins: 0x9d0e70 0x9d3e99 0x9d3efa 0x9d400b 0x9d4220 0x9d43ea */
export function gs9d05d0V2fd10ResultOk(result) {
  return asU32(result) !== 0 ? 1 : 0;
}
/** gs9d05d0C7350ResultOk — PE pins: 0x9d178f 0x9d2d93 */
export function gs9d05d0C7350ResultOk(al) {
  return (asU32(al) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d05d0Cff40ResultOk — PE pins: 0x9d268d 0x9d26d7 */
export function gs9d05d0Cff40ResultOk(al) {
  return (asU32(al) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d05d0ByteIdxLtByte — PE pins: 0x9d2699 0x9d2fdb 0x9d3471 0x9d3eac 0x9d431e 0x9d43fd */
export function gs9d05d0ByteIdxLtByte(idx, count) {
  return (asU32(idx) & 0xff) < (asU32(count) & 0xff) ? 1 : 0;
}
/** gs9d05d0IdxLt2 — PE pins: 0x9d3aed 0x9d3c94 */
export function gs9d05d0IdxLt2(idx) {
  return asU32(idx) < 2 ? 1 : 0;
}
/** gs9d05d0IdxLt6 — PE pins: 0x9d33e3 */
export function gs9d05d0IdxLt6(idx) {
  return asU32(idx) < 6 ? 1 : 0;
}
/** gs9d05d0IdxLt8 — PE pins: 0x9d333d */
export function gs9d05d0IdxLt8(idx) {
  return asU32(idx) < 8 ? 1 : 0;
}
/** gs9d05d0WordIdxLtCount — PE pins: 0x9d2c55 0x9d2d9e */
export function gs9d05d0WordIdxLtCount(idx, count) {
  return (asU32(idx) & 0xffff) < (asU32(count) & 0xffff) ? 1 : 0;
}
/** gs9d05d0UintIdxLtCount — PE pins: 0x9d17a1 0x9d1168 0x9d2019 0x9d2583 0x9d42a7 0x9d4577 */
export function gs9d05d0UintIdxLtCount(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}
export const gs9ce720DispatchCountVa = () => GS9CE720_DISPATCH_COUNT_VA;
export const gs9ce720CountFitsVa = () => GS9CE720_COUNT_FITS_VA;
export const gs9ce720IoGate0x4aVa = () => GS9CE720_IO_GATE_0X4A_VA;
export const gs9ce720IoGate0x37Va = () => GS9CE720_IO_GATE_0X37_VA;
export const gs9ce720DefaultCount0x1ff0x2ddVa = () => GS9CE720_DEFAULT_COUNT_0X1FF_0X2DD_VA;
export const gs9ce720DefaultCount0x78_0xbeVa = () => GS9CE720_DEFAULT_COUNT_0X78_0XBE_VA;
export const gs9ce720Count0xe_0xfVa = () => GS9CE720_COUNT_0XE_0XF_VA;
export const gs9ce720IoGate0x4eVa = () => GS9CE720_IO_GATE_0X4E_VA;
export const gs9d05d0IoGate0x1EVa = () => GS9D05D0_IO_GATE_0X1E_VA;
export const gs9d05d0IoGate0x1FVa = () => GS9D05D0_IO_GATE_0X1F_VA;
export const gs9d05d0IoGate0x20Va = () => GS9D05D0_IO_GATE_0X20_VA;
export const gs9d05d0IoGate0x23Va = () => GS9D05D0_IO_GATE_0X23_VA;
export const gs9d05d0IoGate0x27Va = () => GS9D05D0_IO_GATE_0X27_VA;
export const gs9d05d0IoGate0x28Va = () => GS9D05D0_IO_GATE_0X28_VA;
export const gs9d05d0IoGate0x29Va = () => GS9D05D0_IO_GATE_0X29_VA;
export const gs9d05d0IoGate0x2DVa = () => GS9D05D0_IO_GATE_0X2D_VA;
export const gs9d05d0IoGate0x2FVa = () => GS9D05D0_IO_GATE_0X2F_VA;
export const gs9d05d0IoGate0x30Va = () => GS9D05D0_IO_GATE_0X30_VA;
export const gs9d05d0IoGate0x38Va = () => GS9D05D0_IO_GATE_0X38_VA;
export const gs9d05d0IoGate0x39Va = () => GS9D05D0_IO_GATE_0X39_VA;
export const gs9d05d0IoGate0x3AVa = () => GS9D05D0_IO_GATE_0X3A_VA;
export const gs9d05d0IoGate0x3BVa = () => GS9D05D0_IO_GATE_0X3B_VA;
export const gs9d05d0IoGate0x3EVa = () => GS9D05D0_IO_GATE_0X3E_VA;
export const gs9d05d0IoGate0x40Va = () => GS9D05D0_IO_GATE_0X40_VA;
export const gs9d05d0IoGate0x41Va = () => GS9D05D0_IO_GATE_0X41_VA;
export const gs9d05d0IoGate0x43Va = () => GS9D05D0_IO_GATE_0X43_VA;
export const gs9d05d0IoGate0x45Va = () => GS9D05D0_IO_GATE_0X45_VA;
export const gs9d05d0IoGate0x4CVa = () => GS9D05D0_IO_GATE_0X4C_VA;
export const gs9d05d0IoGate0x4DVa = () => GS9D05D0_IO_GATE_0X4D_VA;
export const gs9d05d0IoGate0x4FVa = () => GS9D05D0_IO_GATE_0X4F_VA;
export const gs9d05d0IoGate0x50Va = () => GS9D05D0_IO_GATE_0X50_VA;
export const gs9d05d0IoGate0x51Va = () => GS9D05D0_IO_GATE_0X51_VA;
export const gs9d05d0IoGate0x52Va = () => GS9D05D0_IO_GATE_0X52_VA;
export const gs9d05d0IoGate0x55Va = () => GS9D05D0_IO_GATE_0X55_VA;
export const gs9d05d0IoGate0x58Va = () => GS9D05D0_IO_GATE_0X58_VA;
export const gs9d05d0IoGate0x5AVa = () => GS9D05D0_IO_GATE_0X5A_VA;
export const gs9d05d0IoGate0x5BVa = () => GS9D05D0_IO_GATE_0X5B_VA;
export const gs9d05d0IoGate0x5CVa = () => GS9D05D0_IO_GATE_0X5C_VA;
export const gs9d05d0IoGate0x5DVa = () => GS9D05D0_IO_GATE_0X5D_VA;
export const gs9d05d0IoGate0x5EVa = () => GS9D05D0_IO_GATE_0X5E_VA;
export const gs9d05d0IoGate0x5FVa = () => GS9D05D0_IO_GATE_0X5F_VA;
export const gs9d05d0IoGate0x60Va = () => GS9D05D0_IO_GATE_0X60_VA;
export const gs9d05d0IoGate0x61Va = () => GS9D05D0_IO_GATE_0X61_VA;
export const gs9d05d0IoGate0x62Va = () => GS9D05D0_IO_GATE_0X62_VA;
export const gs9d05d0IoGate0x63Va = () => GS9D05D0_IO_GATE_0X63_VA;
export const gs9d05d0IoGate0x64Va = () => GS9D05D0_IO_GATE_0X64_VA;
export const gs9d05d0IoGate0x65Va = () => GS9D05D0_IO_GATE_0X65_VA;
export const gs9d05d0IoGate0x67Va = () => GS9D05D0_IO_GATE_0X67_VA;
export const gs9d05d0IoGate0x6AVa = () => GS9D05D0_IO_GATE_0X6A_VA;
export const gs9d05d0IoGate0x6CVa = () => GS9D05D0_IO_GATE_0X6C_VA;
export const gs9d05d0IoGate0x6EVa = () => GS9D05D0_IO_GATE_0X6E_VA;
export const gs9d05d0IoGate0x6FVa = () => GS9D05D0_IO_GATE_0X6F_VA;
export const gs9d05d0IoGate0x72Va = () => GS9D05D0_IO_GATE_0X72_VA;
export const gs9d05d0IoGate0x73Va = () => GS9D05D0_IO_GATE_0X73_VA;
export const gs9d05d0IoGate0x74Va = () => GS9D05D0_IO_GATE_0X74_VA;
export const gs9d05d0IoGate0x75Va = () => GS9D05D0_IO_GATE_0X75_VA;
export const gs9d05d0IoGate0x76Va = () => GS9D05D0_IO_GATE_0X76_VA;
export const gs9d05d0IoGate0x78Va = () => GS9D05D0_IO_GATE_0X78_VA;
export const gs9d05d0IoGate0x79Va = () => GS9D05D0_IO_GATE_0X79_VA;
export const gs9d05d0IoGate0x7EVa = () => GS9D05D0_IO_GATE_0X7E_VA;
export const gs9d05d0IoGate0x7FVa = () => GS9D05D0_IO_GATE_0X7F_VA;
export const gs9d05d0IoGate0x80Va = () => GS9D05D0_IO_GATE_0X80_VA;
export const gs9d05d0IoGate0x81Va = () => GS9D05D0_IO_GATE_0X81_VA;
export const gs9d05d0IoGate0x82Va = () => GS9D05D0_IO_GATE_0X82_VA;
export const gs9d05d0IoGate0x83Va = () => GS9D05D0_IO_GATE_0X83_VA;
export const gs9d05d0IoGate0x8AVa = () => GS9D05D0_IO_GATE_0X8A_VA;
export const gs9d05d0IoGate0x8BVa = () => GS9D05D0_IO_GATE_0X8B_VA;
export const gs9d05d0IoGate0x8CVa = () => GS9D05D0_IO_GATE_0X8C_VA;
export const gs9d05d0IoGate0x8FVa = () => GS9D05D0_IO_GATE_0X8F_VA;
export const gs9d05d0IoGate0x90Va = () => GS9D05D0_IO_GATE_0X90_VA;
export const gs9d05d0IoGate0x97Va = () => GS9D05D0_IO_GATE_0X97_VA;
export const gs9d05d0IoGate0x99Va = () => GS9D05D0_IO_GATE_0X99_VA;
export const gs9d05d0IoGate0x9CVa = () => GS9D05D0_IO_GATE_0X9C_VA;
export const gs9d05d0IoGate0x9DVa = () => GS9D05D0_IO_GATE_0X9D_VA;
export const gs9d05d0IoGate0xA0Va = () => GS9D05D0_IO_GATE_0XA0_VA;
export const gs9d05d0IoGate0xA4Va = () => GS9D05D0_IO_GATE_0XA4_VA;
export const gs9d05d0IoGate0xA5Va = () => GS9D05D0_IO_GATE_0XA5_VA;
export const gs9d05d0IoGate0xA6Va = () => GS9D05D0_IO_GATE_0XA6_VA;
export const gs9d05d0IoGate0xA8Va = () => GS9D05D0_IO_GATE_0XA8_VA;
export const gs9d05d0IoGate0xA9Va = () => GS9D05D0_IO_GATE_0XA9_VA;
export const gs9d05d0IoGate0x23AboveVa = () => GS9D05D0_IO_GATE_0X23_ABOVE_VA;
export const gs9d05d0IoGate0x24AboveVa = () => GS9D05D0_IO_GATE_0X24_ABOVE_VA;
export const gs9d05d0LaneCount1_4Va = () => GS9D05D0_LANE_COUNT_1_4_VA;
export const gs9d05d0LaneCount2_4Va = () => GS9D05D0_LANE_COUNT_2_4_VA;
export const gs9d05d0Count0xf0x10Va = () => GS9D05D0_COUNT_0XF_0X10_VA;
export const gs9d05d0FormatInRangeVa = () => GS9D05D0_FORMAT_IN_RANGE_VA;
export const gs9d05d0CountCapOkVa = () => GS9D05D0_COUNT_CAP_OK_VA;
export const gs9d05d0IdxLeVecsizeVa = () => GS9D05D0_IDX_LE_VECSIZE_VA;
export const gs9d05d0SlotCapLt3Va = () => GS9D05D0_SLOT_CAP_LT_3_VA;
export const gs9d05d0Clamp0x14Va = () => GS9D05D0_CLAMP_0X14_VA;
export const gs9d05d0ClampSigned0xaVa = () => GS9D05D0_CLAMP_SIGNED_0XA_VA;
export const gs9d05d0HeadNonnegVa = () => GS9D05D0_HEAD_NONNEG_VA;
export const gs9d05d0HeadLtVecsizeVa = () => GS9D05D0_HEAD_LT_VECSIZE_VA;
export const gs9d05d0SignedPositiveVa = () => GS9D05D0_SIGNED_POSITIVE_VA;
export const gs9d05d0SignedIdxLtVecsizeVa = () => GS9D05D0_SIGNED_IDX_LT_VECSIZE_VA;
export const gs9d05d0IdxMasked7fffLtVecsizeVa = () => GS9D05D0_IDX_MASKED_7FFF_LT_VECSIZE_VA;
export const gs9d05d0ValueNegOverrideVa = () => GS9D05D0_VALUE_NEG_OVERRIDE_VA;
export const gs9d05d0ByteNonzeroVa = () => GS9D05D0_BYTE_NONZERO_VA;
export const gs9d05d0ByteEq1Va = () => GS9D05D0_BYTE_EQ_1_VA;
export const gs9d05d0ByteFfOkVa = () => GS9D05D0_BYTE_FF_OK_VA;
export const gs9d05d0U32CountNeededVa = () => GS9D05D0_U32_COUNT_NEEDED_VA;
export const gs9d05d0ReadyOkVa = () => GS9D05D0_READY_OK_VA;
export const gs9d05d0V2fd10ResultOkVa = () => GS9D05D0_V2FD10_RESULT_OK_VA;
export const gs9d05d0C7350ResultOkVa = () => GS9D05D0_C7350_RESULT_OK_VA;
export const gs9d05d0Cff40ResultOkVa = () => GS9D05D0_CFF40_RESULT_OK_VA;
export const gs9d05d0ByteIdxLtByteVa = () => GS9D05D0_BYTE_IDX_LT_BYTE_VA;
export const gs9d05d0IdxLt2Va = () => GS9D05D0_IDX_LT_2_VA;
export const gs9d05d0IdxLt6Va = () => GS9D05D0_IDX_LT_6_VA;
export const gs9d05d0IdxLt8Va = () => GS9D05D0_IDX_LT_8_VA;
export const gs9d05d0WordIdxLtCountVa = () => GS9D05D0_WORD_IDX_LT_COUNT_VA;
export const gs9d05d0UintIdxLtCountVa = () => GS9D05D0_UINT_IDX_LT_COUNT_VA;
export const gs9ce720Va = () => GS9CE720_VA;
export const gs9ce720EndVa = () => GS9CE720_END_VA;
export const gs9ce720BodyBytes = () => GS9CE720_BODY_BYTES;
export const gs9ce720NextVa = () => GS9CE720_NEXT_VA;
export const gs9ce720IoFormatOff = () => GS9CE720_IO_FORMAT_OFF;
export const gs9ce720MgrGlobalDat = () => GS9CE720_MGR_GLOBAL_DAT;
export const gs9ce720MgrVecAStartOff = () => GS9CE720_MGR_VEC_A_START_OFF;
export const gs9ce720MgrVecAEndOff = () => GS9CE720_MGR_VEC_A_END_OFF;
export const gs9ce720MgrVecBStartOff = () => GS9CE720_MGR_VEC_B_START_OFF;
export const gs9ce720MgrVecBEndOff = () => GS9CE720_MGR_VEC_B_END_OFF;
export const gs9d05d0Va = () => GS9D05D0_VA;
export const gs9d05d0EndVa = () => GS9D05D0_END_VA;
export const gs9d05d0BodyBytes = () => GS9D05D0_BODY_BYTES;
export const gs9d05d0NextVa = () => GS9D05D0_NEXT_VA;
export const gs9d05d0SehHandlerDat = () => GS9D05D0_SEH_HANDLER_DAT;
export const gs9d05d0GsCookieDat = () => GS9D05D0_GS_COOKIE_DAT;
export const gs9d05d0IoFormatOff = () => GS9D05D0_IO_FORMAT_OFF;
export const gs9d05d0ReaderRowCallVa = () => GS9D05D0_READER_ROW_CALL_VA;
export const gs9d05d0MgrGlobalDat = () => GS9D05D0_MGR_GLOBAL_DAT;
export const gs9d05d0MgrVec2A404 = () => GS9D05D0_MGR_VEC_2A404;
export const gs9d05d0MgrVec2A408 = () => GS9D05D0_MGR_VEC_2A408;
export const gs9d05d0MgrVec2A410 = () => GS9D05D0_MGR_VEC_2A410;
export const gs9d05d0MgrVec2A414 = () => GS9D05D0_MGR_VEC_2A414;
export const gs9d05d0CountCap = () => GS9D05D0_COUNT_CAP;
export const gs9d05d0Clamp0X14Const = () => GS9D05D0_CLAMP0X14_CONST;
export const gs9d05d0Clamp0XaConst = () => GS9D05D0_CLAMP0XA_CONST;
export const gs9d05d0RangeLo = () => GS9D05D0_RANGE_LO;
export const gs9d05d0RangeHi = () => GS9D05D0_RANGE_HI;
export const gs9d05d0Stride148 = () => GS9D05D0_STRIDE_148;
export const gs9d05d0Mask7Fff = () => GS9D05D0_MASK_7FFF;
export const gs9ce720CallerCount = () => GS9CE720_CALLER_COUNT;
export const gs9ce720CallerVaAt = (index) =>
  GS9CE720_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d05d0CallerCount = () => GS9D05D0_CALLER_COUNT;
export const gs9d05d0CallerVaAt = (index) =>
  GS9D05D0_CALLER_VAS[index >>> 0] ?? 0;

/* ============ ABI v11: small bodies + writer-giant split (§4
 * section-notes/game-state-v11-small-bodies/NOTES.md) ============ */

export const GS9CF000_VA = 0x009cf000; /* bitmap clear 0x68 bits @[this+0x94] */
export const GS9CF000_END_VA = 0x009cf042;
export const GS9CF000_BODY_BYTES = 0x42;
export const GS9CF000_NEXT_VA = 0x009cf050;
export const GS9CF000_CLEAR_MORE_VA = 0x009cf037; /* cmp eax,0x68 ; jb 0x9cf020 */
export const GS9CF000_CALLER_VAS = [0x009c7ee4, 0x009cdfbe];
export const GS9CF050_VA = 0x009cf050; /* GameState ctor (host) */
export const GS9CF050_END_VA = 0x009cff2f;
export const GS9CF050_BODY_BYTES = 0xadf;
export const GS9CF050_NEXT_VA = 0x009cff40;
export const GS9CF050_CALLER_VAS = [0x009061bb, 0x0090c917, 0x009bcc22, 0x009beffd, 0x009c7da2, 0x009c7dc5];
export const GS9CFF40_VA = 0x009cff40; /* writer leaf; io8>=0x92 extra pair */
export const GS9CFF40_END_VA = 0x009d00fc;
export const GS9CFF40_BODY_BYTES = 0x1ba;
export const GS9CFF40_NEXT_VA = 0x009d0100;
export const GS9CFF40_IO8_GATE_0X92_VA = 0x009d00a4; /* cmp [edi+8],0x92 ; jb */
export const GS9CFF40_CALLER_VAS = [0x009d2688, 0x009d26d2];
export const GS9D0100_VA = 0x009d0100; /* writer leaf, unconditional (no gates) */
export const GS9D0100_END_VA = 0x009d02b1;
export const GS9D0100_BODY_BYTES = 0x1af;
export const GS9D0100_NEXT_VA = 0x009d02c0;
export const GS9D0100_CALLER_VAS = [0x009d5b07, 0x009d5b52];
export const GS9D02C0_VA = 0x009d02c0; /* reader leaf, fixed shape (no gates) */
export const GS9D02C0_END_VA = 0x009d0438;
export const GS9D02C0_BODY_BYTES = 0x176;
export const GS9D02C0_NEXT_VA = 0x009d0440;
export const GS9D02C0_CALLER_VAS = [0x009d35f0];
export const GS9D0440_VA = 0x009d0440; /* writer leaf (twin of reader 0x9d02c0) */
export const GS9D0440_END_VA = 0x009d05c2;
export const GS9D0440_BODY_BYTES = 0x180;
export const GS9D0440_NEXT_VA = 0x009d05d0;
export const GS9D0440_BYTE_C_GATE_VA = 0x009d04d4; /* cmp byte [esi+0xc],al ; je */
export const GS9D0440_BYTE_D_GATE_VA = 0x009d04df; /* cmp byte [esi+0xd],0 ; je */
export const GS9D0440_CALLER_VAS = [0x009d65a6];
export const GS9D71B0_VA = 0x009d71b0; /* reader tail (GS 0xbf93b4; io8 gates) */
export const GS9D71B0_END_VA = 0x009d77da;
export const GS9D71B0_BODY_BYTES = 0x62a;
export const GS9D71B0_NEXT_VA = 0x009d77e0;
export const GS9D71B0_GS_COOKIE_DAT = 0x00bf93b4;
export const GS9D71B0_CALLER_VAS = [0x009cc84d];
export const GS9D8190_VA = 0x009d8190; /* save-piece writer (SEH 0xb0f3cd + GS) */
export const GS9D8190_END_VA = 0x009d83e5;
export const GS9D8190_BODY_BYTES = 0x255;
export const GS9D8190_NEXT_VA = 0x009d83f0;
export const GS9D8190_CALLER_VAS = [0x00959353, 0x009594b4];
export const GS9D83F0_VA = 0x009d83f0; /* 0x34-stride vector reserve */
export const GS9D83F0_END_VA = 0x009d846d;
export const GS9D83F0_BODY_BYTES = 0x7d;
export const GS9D83F0_NEXT_VA = 0x009d8470;
export const GS9D83F0_CALLER_VAS = [0x009d227d, 0x009d3643];
export const GS9D8470_VA = 0x009d8470; /* u16 row-writer leaf */
export const GS9D8470_END_VA = 0x009d84a0;
export const GS9D8470_BODY_BYTES = 0x30;
export const GS9D8470_NEXT_VA = 0x009d84a0;
export const GS9D8470_CALLER_VAS = [0x009cc3d3];
export const GS9D45C0_FLAGS_PACK_VA = 0x009d4825;
export const GS9D45C0_COUNT_SAR3_VA = 0x009d4f7b;
export const GS9D45C0_COUNT_NONZERO_VA = 0x009d4fa8;
export const GS9D45C0_IDX_LT_COUNT_VA = 0x009d502a;
export const GS9D45C0_COUNT_22C_POSITIVE_VA = 0x009d5390;
export const GS9D45C0_IDX_LT_COUNT_22C_VA = 0x009d54d6;
export const GS9D45C0_ELEMENT_COUNT_78_VA = 0x009d54e8;
export const GS9D45C0_BYTE_COUNT_36_VA = 0x009d5aa2;
export const GS9D45C0_BYTE_IDX_LT_BYTE_COUNT_VA = 0x009d5aeb;
export const GS9D45C0_BYTE_COUNT_NONZERO_VA = 0x009d5aef;
export const GS9D45C0_BYTE_398_NONZERO_VA = 0x009d5b42;
export const GS9D45C0_WORD_IDX_LT_COUNT_VA = 0x009d5fb1;
export const GS9D45C0_IDX_LT_8_VA = 0x009d6339;
export const GS9D45C0_IDX_LT_6_VA = 0x009d63c9;
export const GS9D45C0_IDX_LT_BYTE_COUNT_U32_VA = 0x009d63ff;
export const GS9D45C0_ELEMENT_COUNT_34_VA = 0x009d68fe;
export const GS9D45C0_BYTE_NE_FF_VA = 0x009d6c9a;
export const GS9D45C0_WALK_CONTINUE_3C0_VA = 0x009d6d4a;
export const GS9D45C0_ELEMENT_BYTE_NONZERO_VA = 0x009d6d56;
export const GS9D45C0_VALUE_NONNEG_VA = 0x009d6d5f;
export const GS9D45C0_SCAN_VALUE_NONNEG_VA = 0x009d6eb0;
export const GS9D45C0_SCAN_REMAINING_NONNEG_VA = 0x009d6ebb;
export const GS9D45C0_WALK_CONTINUE_5D4_VA = 0x009d7015;
export const GS9D71B0_IO8_GE_0XA2_VA = 0x009d72af;
export const GS9D71B0_IO8_GE_0X9F_VA = 0x009d75bf;
export const GS9D71B0_IO8_GE_0XA3_VA = 0x009d76c7;
export const GS9D71B0_COUNT_POS_SIGNED_VA = 0x009d72ef;
export const GS9D71B0_IDX_LT_COUNT_SIGNED_VA = 0x009d73aa;
export const GS9D71B0_BYTE_NONZERO_SETNE_VA = 0x009d734f;
export const GS9D71B0_VEC_SLOT_FULL_VA = 0x009d737c;
export const GS9D71B0_COUNT_NONZERO_VA = 0x009d75ef;
export const GS9D71B0_IDX_LT_COUNT_VA = 0x009d76b8;

/** gs9cf000ClearMore — PE pin 0x9cf037 (cmp eax,0x68 ; jb) UNSIGNED. */
export function gs9cf000ClearMore(idx) {
  return asU32(idx) < 0x68 ? 1 : 0;
}
/** gs9cff40Io8Ge0x92 — PE pin 0x9d00a4 (cmp [edi+8],0x92 ; jb) UNSIGNED. */
export function gs9cff40Io8Ge0x92(io8) {
  return asU32(io8) >= 0x92 ? 1 : 0;
}
/** gs9d0440ByteCNonzero / ByteDNonzero — PE pins 0x9d04d4/0x9d04df. */
export function gs9d0440ByteCNonzero(byteC) {
  return (asU32(byteC) & 0xff) !== 0 ? 1 : 0;
}
export function gs9d0440ByteDNonzero(byteD) {
  return (asU32(byteD) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d0440FlagByte — bit0 = c!=0, bit1 = d!=0 (or al,2 @0x9d04e5). */
export function gs9d0440FlagByte(byteC, byteD) {
  let f = 0;
  if ((asU32(byteC) & 0xff) !== 0) f |= 1;
  if ((asU32(byteD) & 0xff) !== 0) f |= 2;
  return f;
}
/** gs9d45c0FlagsPack — PE pins 0x9d4825/0x9d4831/0x9d4840. */
export function gs9d45c0FlagsPack(b32, b534, b535) {
  let f = 0;
  if ((asU32(b32) & 0xff) !== 0) f |= 1;
  if ((asU32(b534) & 0xff) !== 0) f |= 2;
  if ((asU32(b535) & 0xff) !== 0) f |= 4;
  return f;
}
/** gs9d45c0CountSar3 — PE pin 0x9d4f7b (sar eax,3): floor((int32)(end-begin)/8). */
export function gs9d45c0CountSar3(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 8);
  if (d % 8 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d45c0CountNonzero — PE pins 0x9d4fa8 0x9d5084 0x9d5550 0x9d579a 0x9d6f8b 0x9d70c9. */
export function gs9d45c0CountNonzero(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
/** gs9d45c0IdxLtCount — PE pins 0x9d502a 0x9d5103 0x9d558d 0x9d5a90 0x9d6924 0x9d6fd5 0x9d718c. */
export function gs9d45c0IdxLtCount(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}
/** gs9d45c0Count22cPositive — PE pin 0x9d5390 (jle) SIGNED. */
export function gs9d45c0Count22cPositive(count) {
  return BigInt(asU32(count) | 0) > 0n ? 1 : 0;
}
/** gs9d45c0IdxLtCount22c — PE pin 0x9d54d6 (jl) SIGNED. */
export function gs9d45c0IdxLtCount22c(idx, count) {
  return BigInt(asU32(idx) | 0) < BigInt(asU32(count) | 0) ? 1 : 0;
}
/** gs9d45c0ElementCount78 — PE pins 0x9d54e8 0x9d5536 0x9d5569 0x9d557b; floor div 0x78. */
export function gs9d45c0ElementCount78(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0x78);
  if (d % 0x78 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d45c0ByteCount36 — PE pins 0x9d5aa2 0x9d5aad; floor div 0x24. */
export function gs9d45c0ByteCount36(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0x24);
  if (d % 0x24 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d45c0ByteIdxLtByteCount — PE pins 0x9d5aeb 0x9d5b16 0x9d6231 0x9d62f0 0x9d6bd3 0x9d6c1a 0x9d6ef1 0x9d6f37. */
export function gs9d45c0ByteIdxLtByteCount(idx, count) {
  return (asU32(idx) & 0xff) < (asU32(count) & 0xff) ? 1 : 0;
}
/** gs9d45c0ByteCountNonzero — PE pins 0x9d5aef 0x9d6235 0x9d6bd7 0x9d6ef5. */
export function gs9d45c0ByteCountNonzero(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d45c0Byte398Nonzero — PE pin 0x9d5b42. */
export function gs9d45c0Byte398Nonzero(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d45c0WordIdxLtCount — PE pins 0x9d5fb1 0x9d608e. */
export function gs9d45c0WordIdxLtCount(idx, count) {
  return (asU32(idx) & 0xffff) < (asU32(count) & 0xffff) ? 1 : 0;
}
/** gs9d45c0IdxLt8 — PE pin 0x9d6339. */
export function gs9d45c0IdxLt8(idx) {
  return asU32(idx) < 8 ? 1 : 0;
}
/** gs9d45c0IdxLt6 — PE pin 0x9d63c9. */
export function gs9d45c0IdxLt6(idx) {
  return asU32(idx) < 6 ? 1 : 0;
}
/** gs9d45c0IdxLtByteCountU32 — PE pins 0x9d63ff 0x9d643f. */
export function gs9d45c0IdxLtByteCountU32(idx, count) {
  return asU32(idx) < (asU32(count) & 0xff) ? 1 : 0;
}
/** gs9d45c0ElementCount34 — PE pins 0x9d68fe 0x9d6909 0x9d6918; floor div 0x34. */
export function gs9d45c0ElementCount34(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0x34);
  if (d % 0x34 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d45c0ByteNeFf — PE pin 0x9d6c9a. */
export function gs9d45c0ByteNeFf(byte) {
  return (asU32(byte) & 0xff) !== 0xff ? 1 : 0;
}
/** gs9d45c0WalkContinue3c0 — PE pins 0x9d6d4a 0x9d6e8f. */
export function gs9d45c0WalkContinue3c0(node, end) {
  return asU32(node) !== asU32(end) ? 1 : 0;
}
/** gs9d45c0ElementByteNonzero — PE pins 0x9d6d56 0x9d6d5d. */
export function gs9d45c0ElementByteNonzero(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d45c0ValueNonneg — PE pins 0x9d6d5f 0x9d6d73 (jns) SIGNED. */
export function gs9d45c0ValueNonneg(value) {
  return BigInt(asU32(value) | 0) >= 0n ? 1 : 0;
}
/** gs9d45c0ScanValueNonneg — PE pin 0x9d6eb0 (jge) SIGNED. */
export function gs9d45c0ScanValueNonneg(value) {
  return BigInt(asU32(value) | 0) >= 0n ? 1 : 0;
}
/** gs9d45c0ScanRemainingNonneg — PE pin 0x9d6ebb (jns) SIGNED. */
export function gs9d45c0ScanRemainingNonneg(rem) {
  return BigInt(asU32(rem) | 0) >= 0n ? 1 : 0;
}
/** gs9d45c0WalkContinue5d4 — PE pins 0x9d7015 0x9d708b. */
export function gs9d45c0WalkContinue5d4(node, head) {
  return asU32(node) !== asU32(head) ? 1 : 0;
}
/** gs9d71b0Io8Ge0xa2 — PE pins 0x9d72a0 0x9d72af; 0x94 lead cmp is a dead sbb. */
export function gs9d71b0Io8Ge0xa2(io8) {
  return asU32(io8) >= 0xa2 ? 1 : 0;
}
/** gs9d71b0Io8Ge0x9f — PE pin 0x9d75bf. */
export function gs9d71b0Io8Ge0x9f(io8) {
  return asU32(io8) >= 0x9f ? 1 : 0;
}
/** gs9d71b0Io8Ge0xa3 — PE pin 0x9d76c7. */
export function gs9d71b0Io8Ge0xa3(io8) {
  return asU32(io8) >= 0xa3 ? 1 : 0;
}
/** gs9d71b0CountPosSigned — PE pins 0x9d72ef 0x9d73e3 (jle) SIGNED. */
export function gs9d71b0CountPosSigned(count) {
  return BigInt(asU32(count) | 0) > 0n ? 1 : 0;
}
/** gs9d71b0IdxLtCountSigned — PE pins 0x9d73aa 0x9d749e (jl) SIGNED. */
export function gs9d71b0IdxLtCountSigned(idx, count) {
  return BigInt(asU32(idx) | 0) < BigInt(asU32(count) | 0) ? 1 : 0;
}
/** gs9d71b0ByteNonzeroSetne — PE pins 0x9d734f 0x9d7443 0x9d767f 0x9d7787. */
export function gs9d71b0ByteNonzeroSetne(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d71b0VecSlotFull — PE pins 0x9d737c 0x9d7470 0x9d74eb 0x9d7535 0x9d768a 0x9d7792. */
export function gs9d71b0VecSlotFull(ptr, end) {
  return asU32(ptr) === asU32(end) ? 1 : 0;
}
/** gs9d71b0CountNonzero — PE pins 0x9d75ef 0x9d76f7. */
export function gs9d71b0CountNonzero(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
/** gs9d71b0IdxLtCount — PE pins 0x9d76b8 0x9d77c0. */
export function gs9d71b0IdxLtCount(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}

export const gs9cf000Va = () => GS9CF000_VA;
export const gs9cf000EndVa = () => GS9CF000_END_VA;
export const gs9cf000BodyBytes = () => GS9CF000_BODY_BYTES;
export const gs9cf000NextVa = () => GS9CF000_NEXT_VA;
export const gs9cf000ClearMoreVa = () => GS9CF000_CLEAR_MORE_VA;
export const gs9cf000CallerCount = () => GS9CF000_CALLER_VAS.length;
export const gs9cf000CallerVaAt = (index) => GS9CF000_CALLER_VAS[index >>> 0] ?? 0;
export const gs9cf050Va = () => GS9CF050_VA;
export const gs9cf050EndVa = () => GS9CF050_END_VA;
export const gs9cf050BodyBytes = () => GS9CF050_BODY_BYTES;
export const gs9cf050NextVa = () => GS9CF050_NEXT_VA;
export const gs9cf050CallerCount = () => GS9CF050_CALLER_VAS.length;
export const gs9cf050CallerVaAt = (index) => GS9CF050_CALLER_VAS[index >>> 0] ?? 0;
export const gs9cff40Va = () => GS9CFF40_VA;
export const gs9cff40EndVa = () => GS9CFF40_END_VA;
export const gs9cff40BodyBytes = () => GS9CFF40_BODY_BYTES;
export const gs9cff40NextVa = () => GS9CFF40_NEXT_VA;
export const gs9cff40Io8Gate0x92Va = () => GS9CFF40_IO8_GATE_0X92_VA;
export const gs9cff40CallerCount = () => GS9CFF40_CALLER_VAS.length;
export const gs9cff40CallerVaAt = (index) => GS9CFF40_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d0100Va = () => GS9D0100_VA;
export const gs9d0100EndVa = () => GS9D0100_END_VA;
export const gs9d0100BodyBytes = () => GS9D0100_BODY_BYTES;
export const gs9d0100NextVa = () => GS9D0100_NEXT_VA;
export const gs9d0100CallerCount = () => GS9D0100_CALLER_VAS.length;
export const gs9d0100CallerVaAt = (index) => GS9D0100_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d02c0Va = () => GS9D02C0_VA;
export const gs9d02c0EndVa = () => GS9D02C0_END_VA;
export const gs9d02c0BodyBytes = () => GS9D02C0_BODY_BYTES;
export const gs9d02c0NextVa = () => GS9D02C0_NEXT_VA;
export const gs9d02c0CallerCount = () => GS9D02C0_CALLER_VAS.length;
export const gs9d02c0CallerVaAt = (index) => GS9D02C0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d0440Va = () => GS9D0440_VA;
export const gs9d0440EndVa = () => GS9D0440_END_VA;
export const gs9d0440BodyBytes = () => GS9D0440_BODY_BYTES;
export const gs9d0440NextVa = () => GS9D0440_NEXT_VA;
export const gs9d0440ByteCGateVa = () => GS9D0440_BYTE_C_GATE_VA;
export const gs9d0440ByteDGateVa = () => GS9D0440_BYTE_D_GATE_VA;
export const gs9d0440CallerCount = () => GS9D0440_CALLER_VAS.length;
export const gs9d0440CallerVaAt = (index) => GS9D0440_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d71b0Va = () => GS9D71B0_VA;
export const gs9d71b0EndVa = () => GS9D71B0_END_VA;
export const gs9d71b0BodyBytes = () => GS9D71B0_BODY_BYTES;
export const gs9d71b0NextVa = () => GS9D71B0_NEXT_VA;
export const gs9d71b0GsCookieDat = () => GS9D71B0_GS_COOKIE_DAT;
export const gs9d71b0CallerCount = () => GS9D71B0_CALLER_VAS.length;
export const gs9d71b0CallerVaAt = (index) => GS9D71B0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8190Va = () => GS9D8190_VA;
export const gs9d8190EndVa = () => GS9D8190_END_VA;
export const gs9d8190BodyBytes = () => GS9D8190_BODY_BYTES;
export const gs9d8190NextVa = () => GS9D8190_NEXT_VA;
export const gs9d8190CallerCount = () => GS9D8190_CALLER_VAS.length;
export const gs9d8190CallerVaAt = (index) => GS9D8190_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d83f0Va = () => GS9D83F0_VA;
export const gs9d83f0EndVa = () => GS9D83F0_END_VA;
export const gs9d83f0BodyBytes = () => GS9D83F0_BODY_BYTES;
export const gs9d83f0NextVa = () => GS9D83F0_NEXT_VA;
export const gs9d83f0CallerCount = () => GS9D83F0_CALLER_VAS.length;
export const gs9d83f0CallerVaAt = (index) => GS9D83F0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8470Va = () => GS9D8470_VA;
export const gs9d8470EndVa = () => GS9D8470_END_VA;
export const gs9d8470BodyBytes = () => GS9D8470_BODY_BYTES;
export const gs9d8470NextVa = () => GS9D8470_NEXT_VA;
export const gs9d8470CallerCount = () => GS9D8470_CALLER_VAS.length;
export const gs9d8470CallerVaAt = (index) => GS9D8470_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d45c0FlagsPackVa = () => GS9D45C0_FLAGS_PACK_VA;
export const gs9d45c0CountSar3Va = () => GS9D45C0_COUNT_SAR3_VA;
export const gs9d45c0CountNonzeroVa = () => GS9D45C0_COUNT_NONZERO_VA;
export const gs9d45c0IdxLtCountVa = () => GS9D45C0_IDX_LT_COUNT_VA;
export const gs9d45c0Count22cPositiveVa = () => GS9D45C0_COUNT_22C_POSITIVE_VA;
export const gs9d45c0IdxLtCount22cVa = () => GS9D45C0_IDX_LT_COUNT_22C_VA;
export const gs9d45c0ElementCount78Va = () => GS9D45C0_ELEMENT_COUNT_78_VA;
export const gs9d45c0ByteCount36Va = () => GS9D45C0_BYTE_COUNT_36_VA;
export const gs9d45c0ByteIdxLtByteCountVa = () => GS9D45C0_BYTE_IDX_LT_BYTE_COUNT_VA;
export const gs9d45c0ByteCountNonzeroVa = () => GS9D45C0_BYTE_COUNT_NONZERO_VA;
export const gs9d45c0Byte398NonzeroVa = () => GS9D45C0_BYTE_398_NONZERO_VA;
export const gs9d45c0WordIdxLtCountVa = () => GS9D45C0_WORD_IDX_LT_COUNT_VA;
export const gs9d45c0IdxLt8Va = () => GS9D45C0_IDX_LT_8_VA;
export const gs9d45c0IdxLt6Va = () => GS9D45C0_IDX_LT_6_VA;
export const gs9d45c0IdxLtByteCountU32Va = () => GS9D45C0_IDX_LT_BYTE_COUNT_U32_VA;
export const gs9d45c0ElementCount34Va = () => GS9D45C0_ELEMENT_COUNT_34_VA;
export const gs9d45c0ByteNeFfVa = () => GS9D45C0_BYTE_NE_FF_VA;
export const gs9d45c0WalkContinue3c0Va = () => GS9D45C0_WALK_CONTINUE_3C0_VA;
export const gs9d45c0ElementByteNonzeroVa = () => GS9D45C0_ELEMENT_BYTE_NONZERO_VA;
export const gs9d45c0ValueNonnegVa = () => GS9D45C0_VALUE_NONNEG_VA;
export const gs9d45c0ScanValueNonnegVa = () => GS9D45C0_SCAN_VALUE_NONNEG_VA;
export const gs9d45c0ScanRemainingNonnegVa = () => GS9D45C0_SCAN_REMAINING_NONNEG_VA;
export const gs9d45c0WalkContinue5d4Va = () => GS9D45C0_WALK_CONTINUE_5D4_VA;
export const gs9d71b0Io8Ge0xa2Va = () => GS9D71B0_IO8_GE_0XA2_VA;
export const gs9d71b0Io8Ge0x9fVa = () => GS9D71B0_IO8_GE_0X9F_VA;
export const gs9d71b0Io8Ge0xa3Va = () => GS9D71B0_IO8_GE_0XA3_VA;
export const gs9d71b0CountPosSignedVa = () => GS9D71B0_COUNT_POS_SIGNED_VA;
export const gs9d71b0IdxLtCountSignedVa = () => GS9D71B0_IDX_LT_COUNT_SIGNED_VA;
export const gs9d71b0ByteNonzeroSetneVa = () => GS9D71B0_BYTE_NONZERO_SETNE_VA;
export const gs9d71b0VecSlotFullVa = () => GS9D71B0_VEC_SLOT_FULL_VA;
export const gs9d71b0CountNonzeroVa = () => GS9D71B0_COUNT_NONZERO_VA;
export const gs9d71b0IdxLtCountVa = () => GS9D71B0_IDX_LT_COUNT_VA;

/* ============ ABI v12: save-piece cluster (§5
 * section-notes/game-state-v12-savepiece/NOTES.md) ============ */

export const GS9D77E0_VA = 0x009d77e0; /* sub-object serializer (this+0x8c); v11 span constants above */
export const GS9D77E0_STRIDE = 0xc;
export const GS9D77E0_LOOP_A_BASE_OFF = 0x24;
export const GS9D77E0_LOOP_A_END_OFF = 0x28;
export const GS9D77E0_LOOP_B_BASE_OFF = 0x18;
export const GS9D77E0_LOOP_B_END_OFF = 0x1c;
export const GS9D77E0_LOOP_C_BASE_OFF = 0x44;
export const GS9D77E0_LOOP_C_END_OFF = 0x48;
export const GS9D77E0_LOOP_D_BASE_OFF = 0x38;
export const GS9D77E0_LOOP_D_END_OFF = 0x3c;
export const GS9D77E0_ELEM_BYTE4_OFF = 0x4;
export const GS9D77E0_ELEM_BYTE8_OFF = 0x8;
export const GS9D77E0_COUNT_0XC_MAGIC = 0x2aaaaaab;
export const GS9D77E0_COUNT_VA = 0x009d78c4;
export const GS9D77E0_COUNT_ZERO_GATE_VA = 0x009d790f;
export const GS9D77E0_LOOP_MORE_VA = 0x009d79c9;
export const GS9D77E0_BYTE4_GATE_VA = 0x009d7959;
export const GS9D77E0_BYTE8_GATE_VA = 0x009d7bec;
export const GS9D77E0_CALLER_VAS = [0x009c988c]; /* IN GameState::write 0x9c9340 */

export const GS9D8190_PIECE_COUNT_OFF = 0x19d78;
export const GS9D8190_PIECE_BASE_OFF = 0x19d7c;
export const GS9D8190_PIECE_STRIDE = 0x5dc;
export const GS9D8190_SEED_PTR_OFF = 0x1e728;
export const GS9D8190_SSO_THRESHOLD = 0x10;
export const GS9D8190_PIECE_COUNT_POS_VA = 0x009d828f;
export const GS9D8190_PIECE_IDX_LT_VA = 0x009d82b1;
export const GS9D8190_45C0_CALL_VA = 0x009d82a5;
export const GS9D8190_SEED_GATE_VA = 0x009d82bf;
export const GS9D8190_SSO_HEAP_GATE_VA = 0x009d82f2;
export const GS9D8190_SSO_FREE_GATE_VA = 0x009d831d;
export const GS9D8190_CHECKSUM_STORE_VA = 0x009d83ad;
export const GS9D8190_CHECKSUM_XOR_VA = 0x009d83b3;
export const GS9D8190_SEED_LOG_STR_VA = 0x00b1c640;
export const GS9D8190_CHECKSUM_XOR = 0x96696996;
export const GS9D8190_CHECKSUM_OFF = 0x1fda4;

export const GS9D8660_VA = 0x009d8660; /* 0xc-stride vector push-back w/ growth */
export const GS9D8660_END_VA = 0x009d8813;
export const GS9D8660_BODY_BYTES = 0x1b3;
export const GS9D8660_NEXT_VA = 0x009d8820;
export const GS9D8660_STRIDE = 0xc;
export const GS9D8660_MAX_COUNT = 0x15555555;
export const GS9D8660_COUNT_0XC_VA = 0x009d868c;
export const GS9D8660_COUNT_MAX_GATE_VA = 0x009d8697;
export const GS9D8660_GROW_MAX_CMOV_VA = 0x009d8734;
export const GS9D8660_GROW_TARGET_OK_VA = 0x009d873d;
export const GS9D8660_COPY_MORE_VA = 0x009d8726;
export const GS9D8660_CALLER_VAS = [0x006fde3e, 0x009d76ac, 0x009d77b4, 0x009e5656, 0x009e56d6, 0x009e589f, 0x009e591c, 0x009e5aa3];

export const GS9D8820_VA = 0x009d8820; /* 0x34-stride zero-fill */
export const GS9D8820_END_VA = 0x009d8896;
export const GS9D8820_BODY_BYTES = 0x76;
export const GS9D8820_NEXT_VA = 0x009d88a0;
export const GS9D8820_STRIDE = 0x34;
export const GS9D8820_SLOT_DWORDS = 13;
export const GS9D8820_COUNT_GATE_VA = 0x009d8829;
export const GS9D8820_LOOP_MORE_VA = 0x009d888d;
export const GS9D8820_CALLER_VAS = [0x009d845e, 0x009d8a9c];

export const GS9D8A20_VA = 0x009d8a20; /* 0x34-stride reserve (cap 0x4ec4ec4) */
export const GS9D8A20_END_VA = 0x009d8ae0;
export const GS9D8A20_BODY_BYTES = 0xc0;
export const GS9D8A20_NEXT_VA = 0x009d8af0;
export const GS9D8A20_STRIDE = 0x34;
export const GS9D8A20_MAX_COUNT = 0x4ec4ec4;
export const GS9D8A20_COUNT_0X34_VA = 0x009d8a43;
export const GS9D8A20_COUNT_LE_CAP_VA = 0x009d8a35;
export const GS9D8A20_GROW_TARGET_OK_VA = 0x009d8ad4;
export const GS9D8A20_CALLER_VAS = [0x009d8449];

export const GS9D45C0_CALLER_VAS = [0x009061f3, 0x009ca373, 0x009ca44c, 0x009d82a5];

/** gs9d77e0ElementCount0xc — PE pin 0x9d78c4 (twins 0x9d79da/0x9d7b31/
 * 0x9d7c3c): floor((int32)(end-begin)/0xc) SIGNED. */
export function gs9d77e0ElementCount0xc(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0xc);
  if (d % 0xc !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d77e0LoopCountNonzero — PE pin 0x9d790f (twins 0x9d7a27/0x9d7b7c/
 * 0x9d7c89): FULL-dword count != 0. */
export function gs9d77e0LoopCountNonzero(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
/** gs9d77e0IdxLtCount — PE pin 0x9d79c9 (twins 0x9d7ada/0x9d7c2b/
 * 0x9d7d3a): UNSIGNED idx < count. */
export function gs9d77e0IdxLtCount(idx, count) {
  return asU32(idx) < asU32(count) ? 1 : 0;
}
/** gs9d77e0ElemByte4Nonzero — PE pin 0x9d7959 (twin 0x9d7a6b) LOW-BYTE. */
export function gs9d77e0ElemByte4Nonzero(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d77e0ElemByte8Nonzero — PE pin 0x9d7bec (twin 0x9d7cf7) LOW-BYTE. */
export function gs9d77e0ElemByte8Nonzero(byte) {
  return (asU32(byte) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d8190PieceCountPositive — PE pin 0x9d828f (jle) SIGNED (int32) > 0. */
export function gs9d8190PieceCountPositive(count) {
  return BigInt(asU32(count) | 0) > 0n ? 1 : 0;
}
/** gs9d8190PieceIdxLtCount — PE pin 0x9d82b1 (jl) SIGNED. */
export function gs9d8190PieceIdxLtCount(idx, count) {
  return BigInt(asU32(idx) | 0) < BigInt(asU32(count) | 0) ? 1 : 0;
}
/** gs9d8190SeedObjPresent — PE pin 0x9d82bf (test/jne) FULL-dword. */
export function gs9d8190SeedObjPresent(ptr1e728) {
  return asU32(ptr1e728) !== 0 ? 1 : 0;
}
/** gs9d8190MsgSsoHeapUsed — PE pin 0x9d82f2 (cmovae) FULL-dword UNSIGNED
 * size >= 0x10. */
export function gs9d8190MsgSsoHeapUsed(size) {
  return asU32(size) >= GS9D8190_SSO_THRESHOLD ? 1 : 0;
}
/** gs9d8190MsgSsoPtr — mem-law (P5/Q5 shape). */
export function gs9d8190MsgSsoPtr(mem, ssoOff, size) {
  const off = asU32(ssoOff);
  if (asU32(size) < GS9D8190_SSO_THRESHOLD) return off;
  if (mem === null || mem === undefined) return 0;
  return loadU32(mem, off);
}
/** gs9d8190ChecksumStreamWord — PE pin 0x9d83b3 (xor 0x96696996). */
export function gs9d8190ChecksumStreamWord(acc) {
  return asU32(acc ^ 0x96696996);
}
/** gs9d8660ElementCount0xc — PE pin 0x9d868c (index twin 0x9d867c):
 * floor((int32)(end-begin)/0xc) SIGNED. */
export function gs9d8660ElementCount0xc(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0xc);
  if (d % 0xc !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d8660CountNotMaxed — PE pin 0x9d8697 (je -> throw): FULL-dword
 * count != 0x15555555. */
export function gs9d8660CountNotMaxed(count) {
  return asU32(count) !== GS9D8660_MAX_COUNT ? 1 : 0;
}
/** gs9d8660GrowTargetCount — PE pin 0x9d8734 (cmovae): max(new_count,
 * cap_count + (cap_count>>1)). */
export function gs9d8660GrowTargetCount(newCount, capCount) {
  const nc = asU32(newCount);
  const cc = asU32(capCount);
  const t = (cc + (cc >>> 1)) >>> 0;
  return t < nc ? nc : t;
}
/** gs9d8660GrowTargetOk — PE pin 0x9d873d (ja -> throw) UNSIGNED
 * target <= 0x15555555. */
export function gs9d8660GrowTargetOk(target) {
  return asU32(target) <= GS9D8660_MAX_COUNT ? 1 : 0;
}
/** gs9d8660CopyMore — PE pin 0x9d8726 (twins 0x9d8765/0x9d8795)
 * FULL-dword cur != end. */
export function gs9d8660CopyMore(cur, end) {
  return asU32(cur) !== asU32(end) ? 1 : 0;
}
/** gs9d8820CountNonzero — PE pin 0x9d8829 (test/je) FULL-dword. */
export function gs9d8820CountNonzero(count) {
  return asU32(count) !== 0 ? 1 : 0;
}
/** gs9d8820LoopMore — PE pin 0x9d888d (sub,1 ; jne): (remaining-1) != 0. */
export function gs9d8820LoopMore(remaining) {
  return (asU32(remaining) - 1) >>> 0 !== 0 ? 1 : 0;
}
/** gs9d8a20ElementCount0x34 — PE pin 0x9d8a43 (sar edx,4):
 * floor((int32)(end-begin)/0x34) SIGNED (R16/9d45c0 twin). */
export function gs9d8a20ElementCount0x34(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0x34);
  if (d % 0x34 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d8a20CountLeCap — PE pin 0x9d8a35 (ja -> throw) UNSIGNED
 * count <= 0x4ec4ec4. */
export function gs9d8a20CountLeCap(count) {
  return asU32(count) <= GS9D8A20_MAX_COUNT ? 1 : 0;
}
/** gs9d8a20GrowTargetOk — PE pin 0x9d8ad4 (jbe alloc; ja -> throw)
 * UNSIGNED target <= 0x4ec4ec4. */
export function gs9d8a20GrowTargetOk(target) {
  return asU32(target) <= GS9D8A20_MAX_COUNT ? 1 : 0;
}

export const gs9d77e0Va = () => GS9D77E0_VA;
export const gs9d77e0Stride = () => GS9D77E0_STRIDE;
export const gs9d77e0LoopABaseOff = () => GS9D77E0_LOOP_A_BASE_OFF;
export const gs9d77e0LoopAEndOff = () => GS9D77E0_LOOP_A_END_OFF;
export const gs9d77e0LoopBBaseOff = () => GS9D77E0_LOOP_B_BASE_OFF;
export const gs9d77e0LoopBEndOff = () => GS9D77E0_LOOP_B_END_OFF;
export const gs9d77e0LoopCBaseOff = () => GS9D77E0_LOOP_C_BASE_OFF;
export const gs9d77e0LoopCEndOff = () => GS9D77E0_LOOP_C_END_OFF;
export const gs9d77e0LoopDBaseOff = () => GS9D77E0_LOOP_D_BASE_OFF;
export const gs9d77e0LoopDEndOff = () => GS9D77E0_LOOP_D_END_OFF;
export const gs9d77e0ElemByte4Off = () => GS9D77E0_ELEM_BYTE4_OFF;
export const gs9d77e0ElemByte8Off = () => GS9D77E0_ELEM_BYTE8_OFF;
export const gs9d77e0CountMagic = () => GS9D77E0_COUNT_0XC_MAGIC;
export const gs9d77e0CountVa = () => GS9D77E0_COUNT_VA;
export const gs9d77e0CountZeroGateVa = () => GS9D77E0_COUNT_ZERO_GATE_VA;
export const gs9d77e0LoopMoreVa = () => GS9D77E0_LOOP_MORE_VA;
export const gs9d77e0Byte4GateVa = () => GS9D77E0_BYTE4_GATE_VA;
export const gs9d77e0Byte8GateVa = () => GS9D77E0_BYTE8_GATE_VA;
export const gs9d77e0CallerCount = () => GS9D77E0_CALLER_VAS.length;
export const gs9d77e0CallerVaAt = (index) => GS9D77E0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8190PieceCountOff = () => GS9D8190_PIECE_COUNT_OFF;
export const gs9d8190PieceBaseOff = () => GS9D8190_PIECE_BASE_OFF;
export const gs9d8190PieceStride = () => GS9D8190_PIECE_STRIDE;
export const gs9d8190SeedPtrOff = () => GS9D8190_SEED_PTR_OFF;
export const gs9d8190PieceCountPosVa = () => GS9D8190_PIECE_COUNT_POS_VA;
export const gs9d8190PieceIdxLtVa = () => GS9D8190_PIECE_IDX_LT_VA;
export const gs9d819045c0CallVa = () => GS9D8190_45C0_CALL_VA;
export const gs9d8190SeedGateVa = () => GS9D8190_SEED_GATE_VA;
export const gs9d8190SsoHeapGateVa = () => GS9D8190_SSO_HEAP_GATE_VA;
export const gs9d8190SsoFreeGateVa = () => GS9D8190_SSO_FREE_GATE_VA;
export const gs9d8190ChecksumStoreVa = () => GS9D8190_CHECKSUM_STORE_VA;
export const gs9d8190ChecksumXorVa = () => GS9D8190_CHECKSUM_XOR_VA;
export const gs9d8190SeedLogStrVa = () => GS9D8190_SEED_LOG_STR_VA;
export const gs9d8190ChecksumXor = () => GS9D8190_CHECKSUM_XOR;
export const gs9d8190ChecksumOff = () => GS9D8190_CHECKSUM_OFF;
export const gs9d8660Va = () => GS9D8660_VA;
export const gs9d8660EndVa = () => GS9D8660_END_VA;
export const gs9d8660BodyBytes = () => GS9D8660_BODY_BYTES;
export const gs9d8660NextVa = () => GS9D8660_NEXT_VA;
export const gs9d8660Stride = () => GS9D8660_STRIDE;
export const gs9d8660MaxCount = () => GS9D8660_MAX_COUNT;
export const gs9d8660Count0xcVa = () => GS9D8660_COUNT_0XC_VA;
export const gs9d8660CountMaxGateVa = () => GS9D8660_COUNT_MAX_GATE_VA;
export const gs9d8660GrowMaxCmovVa = () => GS9D8660_GROW_MAX_CMOV_VA;
export const gs9d8660GrowTargetOkVa = () => GS9D8660_GROW_TARGET_OK_VA;
export const gs9d8660CopyMoreVa = () => GS9D8660_COPY_MORE_VA;
export const gs9d8660CallerCount = () => GS9D8660_CALLER_VAS.length;
export const gs9d8660CallerVaAt = (index) => GS9D8660_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8820Va = () => GS9D8820_VA;
export const gs9d8820EndVa = () => GS9D8820_END_VA;
export const gs9d8820BodyBytes = () => GS9D8820_BODY_BYTES;
export const gs9d8820NextVa = () => GS9D8820_NEXT_VA;
export const gs9d8820Stride = () => GS9D8820_STRIDE;
export const gs9d8820SlotDwords = () => GS9D8820_SLOT_DWORDS;
export const gs9d8820CountGateVa = () => GS9D8820_COUNT_GATE_VA;
export const gs9d8820LoopMoreVa = () => GS9D8820_LOOP_MORE_VA;
export const gs9d8820CallerCount = () => GS9D8820_CALLER_VAS.length;
export const gs9d8820CallerVaAt = (index) => GS9D8820_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8a20Va = () => GS9D8A20_VA;
export const gs9d8a20EndVa = () => GS9D8A20_END_VA;
export const gs9d8a20BodyBytes = () => GS9D8A20_BODY_BYTES;
export const gs9d8a20NextVa = () => GS9D8A20_NEXT_VA;
export const gs9d8a20Stride = () => GS9D8A20_STRIDE;
export const gs9d8a20MaxCount = () => GS9D8A20_MAX_COUNT;
export const gs9d8a20Count0x34Va = () => GS9D8A20_COUNT_0X34_VA;
export const gs9d8a20CountLeCapVa = () => GS9D8A20_COUNT_LE_CAP_VA;
export const gs9d8a20GrowTargetOkVa = () => GS9D8A20_GROW_TARGET_OK_VA;
export const gs9d8a20CallerCount = () => GS9D8A20_CALLER_VAS.length;
export const gs9d8a20CallerVaAt = (index) => GS9D8A20_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d45c0CallerCount = () => GS9D45C0_CALLER_VAS.length;
export const gs9d45c0CallerVaAt = (index) => GS9D45C0_CALLER_VAS[index >>> 0] ?? 0;

/* ============ ABI v13: reserve leaves 0x9d88a0/0x9d8960/0x9d8af0 (§4
 * section-notes/game-state-v13-reserve-leaves/NOTES.md) ============ */

export const GS9D88A0_VA = 0x009d88a0; /* 8-stride reserve (cap 0x1fffffff) */
export const GS9D88A0_END_VA = 0x009d8953;
export const GS9D88A0_BODY_BYTES = 0xb3;
export const GS9D88A0_NEXT_VA = 0x009d8960;
export const GS9D88A0_STRIDE = 0x8;
export const GS9D88A0_MAX_COUNT = 0x1fffffff;
export const GS9D88A0_COUNT_LE_CAP_VA = 0x009d88b2;
export const GS9D88A0_COUNT_VA = 0x009d88c2;
export const GS9D88A0_GROWTH_OK_VA = 0x009d88d8;
export const GS9D88A0_GROW_TARGET_COUNT_VA = 0x009d893b;
export const GS9D88A0_GROW_TARGET_OK_VA = 0x009d8947;
export const GS9D88A0_TAIL_FILL_NEEDED_VA = 0x009d88f8;
export const GS9D88A0_CALLER_VAS = [0x009cddc0]; /* IN read entry 0x9cc1a0 */

export const GS9D8960_VA = 0x009d8960; /* 0x10-stride reserve (cap 0xfffffff) */
export const GS9D8960_END_VA = 0x009d8a12;
export const GS9D8960_BODY_BYTES = 0xb2;
export const GS9D8960_NEXT_VA = 0x009d8a20;
export const GS9D8960_STRIDE = 0x10;
export const GS9D8960_MAX_COUNT = 0xfffffff;
export const GS9D8960_COUNT_LE_CAP_VA = 0x009d8972;
export const GS9D8960_COUNT_VA = 0x009d8982;
export const GS9D8960_GROWTH_OK_VA = 0x009d8998;
export const GS9D8960_GROW_TARGET_COUNT_VA = 0x009d89fa;
export const GS9D8960_GROW_TARGET_OK_VA = 0x009d8a06;
export const GS9D8960_TAIL_FILL_NEEDED_VA = 0x009d89bb;
export const GS9D8960_CALLER_VAS = [0x009d2bca]; /* IN reader giant 0x9d05d0 */

export const GS9D8AF0_VA = 0x009d8af0; /* 8-stride reserve twin (cap 0x1fffffff; INLINE init/copy) */
export const GS9D8AF0_END_VA = 0x009d8bd8;
export const GS9D8AF0_BODY_BYTES = 0xe8;
export const GS9D8AF0_NEXT_VA = 0x009d8be0; /* v14 LANDED g_Manager can-save mode */
export const GS9D8AF0_STRIDE = 0x8;
export const GS9D8AF0_MAX_COUNT = 0x1fffffff;
export const GS9D8AF0_COUNT_LE_CAP_VA = 0x009d8b07;
export const GS9D8AF0_COUNT_VA = 0x009d8b17;
export const GS9D8AF0_GROWTH_OK_VA = 0x009d8b2d;
export const GS9D8AF0_GROW_TARGET_COUNT_VA = 0x009d8bb9;
export const GS9D8AF0_GROW_TARGET_OK_VA = 0x009d8bc8;
export const GS9D8AF0_TAIL_INIT_NEEDED_VA = 0x009d8b53;
export const GS9D8AF0_TAIL_INIT_MORE_VA = 0x009d8b73;
export const GS9D8AF0_COPY_NEEDED_VA = 0x009d8b82;
export const GS9D8AF0_COPY_MORE_VA = 0x009d8b99;
export const GS9D8AF0_CALLER_VAS = [0x009d1379]; /* IN reader giant 0x9d05d0 */

/** gs9d88a0CountLeCap — PE pin 0x9d88ac cmp / 0x9d88b2 ja -> throw:
 * UNSIGNED count <= 0x1fffffff. */
export function gs9d88a0CountLeCap(count) {
  return asU32(count) <= GS9D88A0_MAX_COUNT ? 1 : 0;
}
/** gs9d88a0ElementCount8 — PE pin 0x9d88c2 (sar ecx,3):
 * floor((int32)(end-begin)/8) SIGNED (9d45c0 count_sar3 twin). */
export function gs9d88a0ElementCount8(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 8);
  if (d % 8 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d88a0GrowthOk — PE pin 0x9d88d6 cmp / 0x9d88d8 jbe: UNSIGNED
 * cap <= 0x1fffffff - (cap>>>1) — normal 1.5x target path. */
export function gs9d88a0GrowthOk(cap) {
  const c = asU32(cap);
  const lim = (GS9D88A0_MAX_COUNT - (c >>> 1)) >>> 0;
  return c <= lim ? 1 : 0;
}
/** gs9d88a0GrowTargetCount — PE pin 0x9d8939 cmp / 0x9d893b jae:
 * max(newCount, cap + (cap>>>1)) u32 (9d8660 twin). */
export function gs9d88a0GrowTargetCount(newCount, cap) {
  const nc = asU32(newCount);
  const cc = asU32(cap);
  const t = (cc + (cc >>> 1)) >>> 0;
  return t >= nc ? t : nc;
}
/** gs9d88a0GrowTargetOk — PE pin 0x9d8941 cmp / 0x9d8947 jbe:
 * UNSIGNED target <= 0x1fffffff. */
export function gs9d88a0GrowTargetOk(target) {
  return asU32(target) <= GS9D88A0_MAX_COUNT ? 1 : 0;
}
/** gs9d88a0TailFillNeeded — PE pin 0x9d88f8 (je skip-memset): the u32
 * subtraction (newCount - oldCount) != 0 (mod 2^32). */
export function gs9d88a0TailFillNeeded(newCount, oldCount) {
  return (asU32(newCount) - asU32(oldCount)) >>> 0 !== 0 ? 1 : 0;
}
/** gs9d8960CountLeCap — PE pin 0x9d896c cmp / 0x9d8972 ja:
 * UNSIGNED count <= 0xfffffff. */
export function gs9d8960CountLeCap(count) {
  return asU32(count) <= GS9D8960_MAX_COUNT ? 1 : 0;
}
/** gs9d8960ElementCount16 — PE pin 0x9d8982 (sar ecx,4):
 * floor((int32)(end-begin)/0x10) SIGNED. */
export function gs9d8960ElementCount16(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 0x10);
  if (d % 0x10 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d8960GrowthOk — PE pin 0x9d8996 cmp / 0x9d8998 jbe: UNSIGNED
 * cap <= 0xfffffff - (cap>>>1). */
export function gs9d8960GrowthOk(cap) {
  const c = asU32(cap);
  const lim = (GS9D8960_MAX_COUNT - (c >>> 1)) >>> 0;
  return c <= lim ? 1 : 0;
}
/** gs9d8960GrowTargetCount — PE pin 0x9d89f8 cmp / 0x9d89fa jae:
 * max(newCount, cap + (cap>>>1)) u32. */
export function gs9d8960GrowTargetCount(newCount, cap) {
  const nc = asU32(newCount);
  const cc = asU32(cap);
  const t = (cc + (cc >>> 1)) >>> 0;
  return t >= nc ? t : nc;
}
/** gs9d8960GrowTargetOk — PE pin 0x9d8a00 cmp / 0x9d8a06 jbe:
 * UNSIGNED target <= 0xfffffff. */
export function gs9d8960GrowTargetOk(target) {
  return asU32(target) <= GS9D8960_MAX_COUNT ? 1 : 0;
}
/** gs9d8960TailFillNeeded — PE pin 0x9d89bb (je skip-memset): u32
 * (newCount - oldCount) != 0. */
export function gs9d8960TailFillNeeded(newCount, oldCount) {
  return (asU32(newCount) - asU32(oldCount)) >>> 0 !== 0 ? 1 : 0;
}
/** gs9d8af0CountLeCap — PE pin 0x9d8b01 cmp / 0x9d8b07 ja:
 * UNSIGNED count <= 0x1fffffff. */
export function gs9d8af0CountLeCap(count) {
  return asU32(count) <= GS9D8AF0_MAX_COUNT ? 1 : 0;
}
/** gs9d8af0ElementCount8 — PE pin 0x9d8b17 (sar ecx,3):
 * floor((int32)(end-begin)/8) SIGNED (9d88a0 twin). */
export function gs9d8af0ElementCount8(begin, end) {
  const d = (asU32(end) - asU32(begin)) | 0;
  let q = Math.trunc(d / 8);
  if (d % 8 !== 0 && d < 0) q -= 1;
  return asU32(q);
}
/** gs9d8af0GrowthOk — PE pin 0x9d8b2b cmp / 0x9d8b2d jbe: UNSIGNED
 * cap <= 0x1fffffff - (cap>>>1). */
export function gs9d8af0GrowthOk(cap) {
  const c = asU32(cap);
  const lim = (GS9D8AF0_MAX_COUNT - (c >>> 1)) >>> 0;
  return c <= lim ? 1 : 0;
}
/** gs9d8af0GrowTargetCount — PE pin 0x9d8bb7 cmp / 0x9d8bb9 jae:
 * max(newCount, cap + (cap>>>1)) u32. */
export function gs9d8af0GrowTargetCount(newCount, cap) {
  const nc = asU32(newCount);
  const cc = asU32(cap);
  const t = (cc + (cc >>> 1)) >>> 0;
  return t >= nc ? t : nc;
}
/** gs9d8af0GrowTargetOk — PE pin 0x9d8bc2 cmp / 0x9d8bc8 jbe:
 * UNSIGNED target <= 0x1fffffff. */
export function gs9d8af0GrowTargetOk(target) {
  return asU32(target) <= GS9D8AF0_MAX_COUNT ? 1 : 0;
}
/** gs9d8af0TailInitNeeded — PE pin 0x9d8b51 sub / 0x9d8b53 je: u32
 * (newCount - oldCount) != 0 -> INLINE {0,0xffffffff} slot init. */
export function gs9d8af0TailInitNeeded(newCount, oldCount) {
  return (asU32(newCount) - asU32(oldCount)) >>> 0 !== 0 ? 1 : 0;
}
/** gs9d8af0TailInitMore — PE pin 0x9d8b70 sub,1 / 0x9d8b73 jne:
 * ((remaining - 1) != 0) u32 countdown (W16 lane7 / T2 class). */
export function gs9d8af0TailInitMore(remaining) {
  return (asU32(remaining) - 1) >>> 0 !== 0 ? 1 : 0;
}
/** gs9d8af0CopyNeeded — PE pin 0x9d8b80 cmp / 0x9d8b82 je:
 * FULL-dword begin != end (old range non-empty). */
export function gs9d8af0CopyNeeded(begin, end) {
  return asU32(begin) !== asU32(end) ? 1 : 0;
}
/** gs9d8af0CopyMore — PE pin 0x9d8b97 cmp / 0x9d8b99 jne:
 * FULL-dword cur != end walk bound (9d8660_copy_more shape). */
export function gs9d8af0CopyMore(cur, end) {
  return asU32(cur) !== asU32(end) ? 1 : 0;
}
export const gs9d88a0Va = () => GS9D88A0_VA;
export const gs9d88a0EndVa = () => GS9D88A0_END_VA;
export const gs9d88a0BodyBytes = () => GS9D88A0_BODY_BYTES;
export const gs9d88a0NextVa = () => GS9D88A0_NEXT_VA;
export const gs9d88a0Stride = () => GS9D88A0_STRIDE;
export const gs9d88a0MaxCount = () => GS9D88A0_MAX_COUNT;
export const gs9d88a0CountLeCapVa = () => GS9D88A0_COUNT_LE_CAP_VA;
export const gs9d88a0CountVa = () => GS9D88A0_COUNT_VA;
export const gs9d88a0GrowthOkVa = () => GS9D88A0_GROWTH_OK_VA;
export const gs9d88a0GrowTargetCountVa = () => GS9D88A0_GROW_TARGET_COUNT_VA;
export const gs9d88a0GrowTargetOkVa = () => GS9D88A0_GROW_TARGET_OK_VA;
export const gs9d88a0TailFillNeededVa = () => GS9D88A0_TAIL_FILL_NEEDED_VA;
export const gs9d88a0CallerCount = () => GS9D88A0_CALLER_VAS.length;
export const gs9d88a0CallerVaAt = (index) => GS9D88A0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8960Va = () => GS9D8960_VA;
export const gs9d8960EndVa = () => GS9D8960_END_VA;
export const gs9d8960BodyBytes = () => GS9D8960_BODY_BYTES;
export const gs9d8960NextVa = () => GS9D8960_NEXT_VA;
export const gs9d8960Stride = () => GS9D8960_STRIDE;
export const gs9d8960MaxCount = () => GS9D8960_MAX_COUNT;
export const gs9d8960CountLeCapVa = () => GS9D8960_COUNT_LE_CAP_VA;
export const gs9d8960CountVa = () => GS9D8960_COUNT_VA;
export const gs9d8960GrowthOkVa = () => GS9D8960_GROWTH_OK_VA;
export const gs9d8960GrowTargetCountVa = () => GS9D8960_GROW_TARGET_COUNT_VA;
export const gs9d8960GrowTargetOkVa = () => GS9D8960_GROW_TARGET_OK_VA;
export const gs9d8960TailFillNeededVa = () => GS9D8960_TAIL_FILL_NEEDED_VA;
export const gs9d8960CallerCount = () => GS9D8960_CALLER_VAS.length;
export const gs9d8960CallerVaAt = (index) => GS9D8960_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8af0Va = () => GS9D8AF0_VA;
export const gs9d8af0EndVa = () => GS9D8AF0_END_VA;
export const gs9d8af0BodyBytes = () => GS9D8AF0_BODY_BYTES;
export const gs9d8af0NextVa = () => GS9D8AF0_NEXT_VA;
export const gs9d8af0Stride = () => GS9D8AF0_STRIDE;
export const gs9d8af0MaxCount = () => GS9D8AF0_MAX_COUNT;
export const gs9d8af0CountLeCapVa = () => GS9D8AF0_COUNT_LE_CAP_VA;
export const gs9d8af0CountVa = () => GS9D8AF0_COUNT_VA;
export const gs9d8af0GrowthOkVa = () => GS9D8AF0_GROWTH_OK_VA;
export const gs9d8af0GrowTargetCountVa = () => GS9D8AF0_GROW_TARGET_COUNT_VA;
export const gs9d8af0GrowTargetOkVa = () => GS9D8AF0_GROW_TARGET_OK_VA;
export const gs9d8af0TailInitNeededVa = () => GS9D8AF0_TAIL_INIT_NEEDED_VA;
export const gs9d8af0TailInitMoreVa = () => GS9D8AF0_TAIL_INIT_MORE_VA;
export const gs9d8af0CopyNeededVa = () => GS9D8AF0_COPY_NEEDED_VA;
export const gs9d8af0CopyMoreVa = () => GS9D8AF0_COPY_MORE_VA;
export const gs9d8af0CallerCount = () => GS9D8AF0_CALLER_VAS.length;
export const gs9d8af0CallerVaAt = (index) => GS9D8AF0_CALLER_VAS[index >>> 0] ?? 0;

/* ============ ABI v14: 0x9d8be0 g_Manager can-save mode
 * Transcribed from the PE CFG (NOT derived from the cpp).
 * Byte gates mask & 0xff; +0xf18 is SIGNED jg; Manager+8 == 2 is FULL-dword.
 * ======================================================================== */

export const GS9D8BE0_VA = 0x009d8be0;
export const GS9D8BE0_END_VA = 0x009d8c98;
export const GS9D8BE0_BODY_BYTES = 0xb8;
export const GS9D8BE0_NEXT_VA = 0x009d8ca0;
export const GS9D8BE0_INSN_COUNT = 51;
export const GS9D8BE0_MGR_GLOBAL = 0x00c7169c;
export const GS9D8BE0_GAME_GLOBAL = 0x00c71678;
export const GS9D8BE0_OFF_2C9 = 0x2c9;
export const GS9D8BE0_OFF_F18 = 0xf18;
export const GS9D8BE0_BYTE_2C9_VA = 0x009d8be6;
export const GS9D8BE0_DWORD_F18_VA = 0x009d8c65;
export const GS9D8BE0_CALLER_VAS = [0x0098ace7, 0x009d9e91, 0x009db1e8];

/** gs9d8be0Byte2c9Nz — PE 0x9d8be6 cmp byte,0 ; jne ret2. LOW-BYTE. */
export function gs9d8be0Byte2c9Nz(mgr2c9) {
  return (asU32(mgr2c9) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d8be0ModeEq2 — PE 0x9d8bfb cmp edx,2 ; jne. FULL-dword. */
export function gs9d8be0ModeEq2(mgr8) {
  return asU32(mgr8) === 2 ? 1 : 0;
}
/** gs9d8be0GameNonzero — PE 0x9d8c00 test eax,eax ; je. FULL-dword. */
export function gs9d8be0GameNonzero(game) {
  return asU32(game) !== 0 ? 1 : 0;
}
/** gs9d8be0Dword26630Busy — PE 0x9d8c04 cmp dword,0 ; ja. UNSIGNED != 0. */
export function gs9d8be0Dword26630Busy(game26630) {
  return asU32(game26630) !== 0 ? 1 : 0;
}
/** gs9d8be0Byte26589Nz — PE 0x9d8c11 cmp byte,0 ; jne. LOW-BYTE. */
export function gs9d8be0Byte26589Nz(game26589) {
  return (asU32(game26589) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d8be0Byte19fNz — PE 0x9d8c1a cmp byte,0 ; jne. LOW-BYTE. */
export function gs9d8be0Byte19fNz(mgr19f) {
  return (asU32(mgr19f) & 0xff) !== 0 ? 1 : 0;
}
/** gs9d8be0DwordA80Busy — PE 0x9d8c5c cmp dword,0 ; ja. UNSIGNED != 0. */
export function gs9d8be0DwordA80Busy(mgrA80) {
  return asU32(mgrA80) !== 0 ? 1 : 0;
}
/** gs9d8be0DwordF18Positive — PE 0x9d8c65 cmp dword,0 ; jg. SIGNED > 0. */
export function gs9d8be0DwordF18Positive(mgrF18) {
  return (asU32(mgrF18) | 0) > 0 ? 1 : 0;
}
/** gs9d8be0Byte2c7Nz — PE 0x9d8c6e cmp byte,0 ; jne. LOW-BYTE. */
export function gs9d8be0Byte2c7Nz(mgr2c7) {
  return (asU32(mgr2c7) & 0xff) !== 0 ? 1 : 0;
}

/** gs9d8be0CanSaveMode — PE CFG 0x9d8be0..0x9d8c97. AL in {0,1,2}. */
export function gs9d8be0CanSaveMode(
  mgr2c9, mgr8, game, game26630, game26589, mgr19f, mgrA80, mgrF18, mgr2c7,
) {
  const b2c9 = asU32(mgr2c9) & 0xff;
  const b26589 = asU32(game26589) & 0xff;
  const b19f = asU32(mgr19f) & 0xff;
  const b2c7 = asU32(mgr2c7) & 0xff;
  const edx = asU32(mgr8);
  const eax = asU32(game);
  const d26630 = asU32(game26630);
  if (b2c9 !== 0) return 2;
  if (edx === 2) {
    if (eax !== 0) {
      if (d26630 !== 0) return 2;
      if (b26589 !== 0) return 2;
    }
  }
  let atC46 = 0;
  if (b19f === 0) {
    if (edx !== 2) return 0;
    if (eax === 0) return 0;
    if (d26630 !== 0 || b26589 !== 0) atC46 = 1;
    else return 0;
  } else if (edx === 2) {
    atC46 = 1;
  }
  if (atC46 !== 0) {
    if (eax !== 0) {
      if (d26630 !== 0) return 0;
      if (b26589 !== 0) return 0;
    }
  }
  if (asU32(mgrA80) !== 0) return 0;
  if ((asU32(mgrF18) | 0) > 0) return 0;
  if (b2c7 !== 0) return 0;
  if (edx !== 2) return 1;
  if (eax === 0) return 1;
  if (d26630 !== 0) return 0;
  if (b26589 !== 0) return 0;
  return 1;
}

export const gs9d8be0Va = () => GS9D8BE0_VA;
export const gs9d8be0EndVa = () => GS9D8BE0_END_VA;
export const gs9d8be0BodyBytes = () => GS9D8BE0_BODY_BYTES;
export const gs9d8be0NextVa = () => GS9D8BE0_NEXT_VA;
export const gs9d8be0InsnCount = () => GS9D8BE0_INSN_COUNT;
export const gs9d8be0CallerCount = () => GS9D8BE0_CALLER_VAS.length;
export const gs9d8be0CallerVaAt = (index) => GS9D8BE0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8be0MgrGlobal = () => GS9D8BE0_MGR_GLOBAL;
export const gs9d8be0GameGlobal = () => GS9D8BE0_GAME_GLOBAL;
export const gs9d8be0Off2c9 = () => GS9D8BE0_OFF_2C9;
export const gs9d8be0OffF18 = () => GS9D8BE0_OFF_F18;
export const gs9d8be0Byte2c9Va = () => GS9D8BE0_BYTE_2C9_VA;
export const gs9d8be0DwordF18Va = () => GS9D8BE0_DWORD_F18_VA;

/* ============ ABI v15: 0x9d8ca0 Manager+0x2d0 &0xc flag scan
 * Transcribed from the PE CFG (NOT derived from the cpp).
 * Cookie 0xaef12b is HOST epilogue, omitted. Table from rdata xmm copies
 * 0xbab270 / 0xbab410 / 0xbab500. edx>=end is SIGNED jge.
 * ======================================================================== */

export const GS9D8CA0_VA = 0x009d8ca0;
export const GS9D8CA0_END_VA = 0x009d8d41;
export const GS9D8CA0_BODY_BYTES = 0xa1;
export const GS9D8CA0_NEXT_VA = 0x009d8d50;
export const GS9D8CA0_INSN_COUNT = 55;
export const GS9D8CA0_ROW_END = 0x00c375e0;
export const GS9D8CA0_ROW_STRIDE = 0x90;
export const GS9D8CA0_OUTER_COUNT = 0x14;
export const GS9D8CA0_INNER_COUNT = 0xc;
export const GS9D8CA0_FLAG_MASK = 0xc;
export const GS9D8CA0_BYTE_OFF = 0x2d0;
export const GS9D8CA0_TABLE = [0, 1, 2, 4, 5, 3, 6, 9, 0xc, 7, 0xd, 0xe];
export const GS9D8CA0_CALLER_VAS = [0x0098acf3, 0x009d9e99, 0x009db1f0];

export function gs9d8ca0OuterDone(edi) {
  return asU32(edi) === GS9D8CA0_OUTER_COUNT ? 1 : 0;
}
export function gs9d8ca0EdxGeEnd(edx) {
  return (asU32(edx) | 0) >= (GS9D8CA0_ROW_END | 0) ? 1 : 0;
}
export function gs9d8ca0EdxIsNull(edx) {
  return asU32(edx) === 0 ? 1 : 0;
}
export function gs9d8ca0SkipCellLoad(edx) {
  return gs9d8ca0EdxGeEnd(edx) || gs9d8ca0EdxIsNull(edx) ? 1 : 0;
}
export function gs9d8ca0InnerMore(eax) {
  return asU32(eax) < GS9D8CA0_INNER_COUNT ? 1 : 0;
}
export function gs9d8ca0TableIndex(eax) {
  const i = asU32(eax);
  if (i >= 12) return 0;
  return GS9D8CA0_TABLE[i];
}
export function gs9d8ca0FlagOk(byte) {
  const b = asU32(byte) & 0xff;
  return (b & GS9D8CA0_FLAG_MASK) !== 0 ? 1 : 0;
}
export function gs9d8ca0RowNext(edx) {
  return (asU32(edx) + GS9D8CA0_ROW_STRIDE) >>> 0;
}
export function gs9d8ca0CellEcx(edx, loaded) {
  return gs9d8ca0SkipCellLoad(edx) ? 0 : asU32(loaded);
}
export function gs9d8ca0ByteOff(ecx) {
  return (asU32(ecx) * 4 + GS9D8CA0_BYTE_OFF) >>> 0;
}
export function gs9d8ca0AfterRow(edi, edx) {
  const edx2 = (asU32(edx) + GS9D8CA0_ROW_STRIDE) >>> 0;
  const edi2 = (asU32(edi) + 1) >>> 0;
  if ((edx2 | 0) < (GS9D8CA0_ROW_END | 0)) {
    return edi2 === GS9D8CA0_OUTER_COUNT ? 1 : 0;
  }
  return 1;
}

export const gs9d8ca0Va = () => GS9D8CA0_VA;
export const gs9d8ca0EndVa = () => GS9D8CA0_END_VA;
export const gs9d8ca0BodyBytes = () => GS9D8CA0_BODY_BYTES;
export const gs9d8ca0NextVa = () => GS9D8CA0_NEXT_VA;
export const gs9d8ca0InsnCount = () => GS9D8CA0_INSN_COUNT;
export const gs9d8ca0CallerCount = () => GS9D8CA0_CALLER_VAS.length;
export const gs9d8ca0CallerVaAt = (index) => GS9D8CA0_CALLER_VAS[index >>> 0] ?? 0;
export const gs9d8ca0RowEnd = () => GS9D8CA0_ROW_END;
export const gs9d8ca0FlagMask = () => GS9D8CA0_FLAG_MASK;

/* ============ ABI v16: 0x9dc6e0 zero-init ctor
 * Transcribed from the PE (NOT derived from the cpp). Census:
 * section-notes/gamestate-scan-9d9550/NOTES.md UNIT 5 §U5-3.
 * NO prologue: opens with mov dword [ecx],0; zero SEH/GS/calls/
 * branches. 14 FULL-dword constant stores (13 zeros + magic
 * 0x12345678 @+0x08), mov eax,ecx / bare ret — returns receiver.
 * u32 LE stores, offset add wraps u32. mem-law: callers pass a
 * writable view (DataView.setUint32 or Buffer.writeUInt32LE).
 * ======================================================================== */

export const GS9DC6E0_VA = 0x009dc6e0;
export const GS9DC6E0_END_VA = 0x009dc744; /* first int3 after ret @0x9dc743 */
export const GS9DC6E0_BODY_BYTES = 0x64;
export const GS9DC6E0_NEXT_VA = 0x009dc750;
export const GS9DC6E0_INSN_COUNT = 16;
export const GS9DC6E0_RET_EAX_VA = 0x009dc6e6; /* mov eax,ecx */
export const GS9DC6E0_RET_VA = 0x009dc743; /* bare ret */
export const GS9DC6E0_MAGIC_STAMP_VA = 0x009dc6ef;
export const GS9DC6E0_NEW_VA = 0x00a0f4c0; /* operator new at both callers */
export const GS9DC6E0_OBJ_SIZE = 0x38;
export const GS9DC6E0_MAGIC = 0x12345678;
export const GS9DC6E0_MAGIC_OFF = 0x08;
export const GS9DC6E0_STORE_COUNT = 14;
export const GS9DC6E0_ZERO_COUNT = 13;
export const GS9DC6E0_ZERO_OFFS = [
  0x00, 0x04, 0x0c, 0x10, 0x14, 0x18, 0x1c,
  0x20, 0x24, 0x28, 0x2c, 0x30, 0x34,
];
export const GS9DC6E0_CALLER_VAS = [0x009dce5a, 0x009dfcd6];

/* u32 LE store at byte offset; accepts Buffer (writeUInt32LE) or DataView. */
function storeU32(mem, addr, v) {
  if (mem.writeUInt32LE) {
    mem.writeUInt32LE(asU32(v), addr);
    return;
  }
  if (mem.setUint32) {
    mem.setUint32(addr, asU32(v), true);
    return;
  }
  throw new TypeError("mem must be a Buffer or DataView");
}

/** gs9dc6e0ZeroDwords — K1: 13 FULL-dword u32 LE zeros at this+OFFS. */
export function gs9dc6e0ZeroDwords(mem, thisOff) {
  const base = asU32(thisOff);
  for (const off of GS9DC6E0_ZERO_OFFS) {
    storeU32(mem, (base + off) >>> 0, 0);
  }
}

/** gs9dc6e0MagicStamp — K2 PE 0x9dc6ef: u32 LE 0x12345678 at this+0x08. */
export function gs9dc6e0MagicStamp(mem, thisOff) {
  storeU32(mem, (asU32(thisOff) + GS9DC6E0_MAGIC_OFF) >>> 0, GS9DC6E0_MAGIC);
}

/** gs9dc6e0ReturnThis — K3 PE 0x9dc6e6 mov eax,ecx : returns receiver. */
export function gs9dc6e0ReturnThis(thisOff) {
  return asU32(thisOff);
}

export const gs9dc6e0Va = () => GS9DC6E0_VA;
export const gs9dc6e0EndVa = () => GS9DC6E0_END_VA;
export const gs9dc6e0BodyBytes = () => GS9DC6E0_BODY_BYTES;
export const gs9dc6e0NextVa = () => GS9DC6E0_NEXT_VA;
export const gs9dc6e0InsnCount = () => GS9DC6E0_INSN_COUNT;
export const gs9dc6e0NewVa = () => GS9DC6E0_NEW_VA;
export const gs9dc6e0ObjSize = () => GS9DC6E0_OBJ_SIZE;
export const gs9dc6e0Magic = () => GS9DC6E0_MAGIC;
export const gs9dc6e0MagicOff = () => GS9DC6E0_MAGIC_OFF;
export const gs9dc6e0StoreCount = () => GS9DC6E0_STORE_COUNT;
export const gs9dc6e0ZeroCount = () => GS9DC6E0_ZERO_COUNT;
export const gs9dc6e0CallerCount = () => GS9DC6E0_CALLER_VAS.length;
export const gs9dc6e0CallerVaAt = (index) =>
  GS9DC6E0_CALLER_VAS[index >>> 0] ?? 0;

/* ============ ABI v17: 0x9e0150 complement-index vector fetch
 * Transcribed from the PE (NOT derived from the cpp). Census:
 * section-notes/gamestate-scan-9d9550/NOTES.md UNIT 7 §U7-3.
 * Minimal frame; NO SEH/GS/calls/globals. edx = ~v (FULL-dword NOT);
 * SIGNED edx < 0 -> 0 (js); begin/end = u32 LE at vec_off/+4; count =
 * SIGNED(end-begin)>>2 (sar, ARITHMETIC shift on the int32 view);
 * SIGNED edx >= count -> 0 (jge); result = u32 LE at (u32 LE at
 * (begin + edx*4)); ret 4 ptr-or-0. u32 LE loads, u32-wrapping
 * address adds.
 * ======================================================================== */

export const GS9E0150_VA = 0x009e0150;
export const GS9E0150_END_VA = 0x009e017c; /* first int3 after the null-path ret */
export const GS9E0150_BODY_BYTES = 0x2c;
export const GS9E0150_NEXT_VA = 0x009e0180;
export const GS9E0150_INSN_COUNT = 22;
export const GS9E0150_NOT_VA = 0x009e0156; /* not edx */
export const GS9E0150_JS_GATE_VA = 0x009e015b; /* js -> null */
export const GS9E0150_SUB_VA = 0x009e0162; /* sub eax,esi */
export const GS9E0150_SAR_VA = 0x009e0164; /* sar eax,2 */
export const GS9E0150_CMP_VA = 0x009e0167; /* cmp edx,eax */
export const GS9E0150_JGE_GATE_VA = 0x009e0169; /* jge -> null */
export const GS9E0150_INNER_LOAD_VA = 0x009e016b; /* mov eax,[esi+edx*4] */
export const GS9E0150_OUTER_LOAD_VA = 0x009e016f; /* mov eax,[eax] */
export const GS9E0150_RET_OK_VA = 0x009e0172; /* ret 4 hit path */
export const GS9E0150_RET_NULL_VA = 0x009e0179; /* ret 4 null path */
export const GS9E0150_CALLER_VAS = [0x005c02f1];

/** gs9e0150NotNonneg — O1 PE 0x9e0156/0x9e0159/0x9e015b: SIGNED (~v) >= 0. */
export function gs9e0150NotNonneg(v) {
  const idx = (~asU32(v)) >>> 0;
  return (idx | 0) >= 0 ? 1 : 0;
}

/**
 * gs9e0150IdxLtCount — O2 PE 0x9e0162/0x9e0164/0x9e0167/0x9e0169:
 * SIGNED(~v) < SIGNED((end - begin) >> 2). The span subtract wraps
 * u32; `>>` on the int32 view IS the sar (arithmetic shift).
 */
export function gs9e0150IdxLtCount(v, begin, end) {
  const idx = (~asU32(v)) >>> 0;
  const span = (asU32(end) - asU32(begin)) >>> 0;
  const count = (span | 0) >> 2;
  return ((idx | 0) < count) ? 1 : 0;
}

/**
 * gs9e0150Fetch — O3 composite: begin/end = u32 LE at vecOff/+4;
 * when O1 && O2 pass, u32 LE at (u32 LE at (begin + (~v)*4)) with
 * u32-wrapping address adds; else 0.
 */
export function gs9e0150Fetch(mem, vecOff, v) {
  const idx = (~asU32(v)) >>> 0;
  if ((idx | 0) < 0) return 0; /* js @0x9e015b */
  const base = asU32(vecOff);
  const begin = loadU32(mem, base);
  const end = loadU32(mem, (base + 4) >>> 0);
  const span = (end - begin) >>> 0;
  const count = (span | 0) >> 2;
  if ((idx | 0) >= count) return 0; /* jge @0x9e0169 */
  const elemAddr = (begin + ((idx << 2) >>> 0)) >>> 0;
  const elem = loadU32(mem, elemAddr);
  return loadU32(mem, elem); /* outer @0x9e016f */
}

export const gs9e0150Va = () => GS9E0150_VA;
export const gs9e0150EndVa = () => GS9E0150_END_VA;
export const gs9e0150BodyBytes = () => GS9E0150_BODY_BYTES;
export const gs9e0150NextVa = () => GS9E0150_NEXT_VA;
export const gs9e0150InsnCount = () => GS9E0150_INSN_COUNT;
export const gs9e0150NotVa = () => GS9E0150_NOT_VA;
export const gs9e0150JsGateVa = () => GS9E0150_JS_GATE_VA;
export const gs9e0150SubVa = () => GS9E0150_SUB_VA;
export const gs9e0150SarVa = () => GS9E0150_SAR_VA;
export const gs9e0150CmpVa = () => GS9E0150_CMP_VA;
export const gs9e0150JgeGateVa = () => GS9E0150_JGE_GATE_VA;
export const gs9e0150InnerLoadVa = () => GS9E0150_INNER_LOAD_VA;
export const gs9e0150OuterLoadVa = () => GS9E0150_OUTER_LOAD_VA;
export const gs9e0150RetOkVa = () => GS9E0150_RET_OK_VA;
export const gs9e0150RetNullVa = () => GS9E0150_RET_NULL_VA;
export const gs9e0150CallerCount = () => GS9E0150_CALLER_VAS.length;
export const gs9e0150CallerVaAt = (index) =>
  GS9E0150_CALLER_VAS[index >>> 0] ?? 0;

/* ============ ABI v18: 0x9e0180 complement-index ELEMENT fetch
 * Transcribed from the PE (NOT derived from the cpp). Census:
 * section-notes/gamestate-scan-9d9550/NOTES.md UNIT 8 §U8-2.
 * Law-TWIN of 0x9e0150 (O) minus the second deref: P returns the
 * ELEMENT dword where O returns *elem. Minimal frame; NO SEH/GS/
 * calls/globals. Differential seed 0x9e0180.
 * ======================================================================== */

export const GS9E0180_VA = 0x009e0180;
export const GS9E0180_END_VA = 0x009e01a7; /* first int3 after the null-path ret */
export const GS9E0180_BODY_BYTES = 0x27;
export const GS9E0180_NEXT_VA = 0x009e01b0;
export const GS9E0180_INSN_COUNT = 15;
export const GS9E0180_NOT_VA = 0x009e0186; /* not eax */
export const GS9E0180_JS_GATE_VA = 0x009e018a; /* js -> null */
export const GS9E0180_SUB_VA = 0x009e0191; /* sub ecx,edx */
export const GS9E0180_SAR_VA = 0x009e0193; /* sar ecx,2 */
export const GS9E0180_CMP_VA = 0x009e0196; /* cmp eax,ecx */
export const GS9E0180_JGE_GATE_VA = 0x009e0198; /* jge -> null */
export const GS9E0180_ELEM_LOAD_VA = 0x009e019a; /* mov eax,[edx+eax*4] — SINGLE deref */
export const GS9E0180_RET_OK_VA = 0x009e019e; /* ret 4 hit path */
export const GS9E0180_RET_NULL_VA = 0x009e01a4; /* ret 4 null path */
export const GS9E0180_CALLER_VAS = [0x006e7ff5, 0x006e818a];
export const GS9E0180_GAME_VEC_OFF = 0x67758;

/** gs9e0180NotNonneg — P1 PE 0x9e0186/0x9e0188/0x9e018a: SIGNED (~v) >= 0. */
export function gs9e0180NotNonneg(v) {
  const idx = (~asU32(v)) >>> 0;
  return (idx | 0) >= 0 ? 1 : 0;
}

/**
 * gs9e0180IdxLtCount — P2 PE 0x9e0191/0x9e0193/0x9e0196/0x9e0198:
 * SIGNED(~v) < SIGNED((end - begin) >> 2). The span subtract wraps
 * u32; `>>` on the int32 view IS the sar (arithmetic shift).
 */
export function gs9e0180IdxLtCount(v, begin, end) {
  const idx = (~asU32(v)) >>> 0;
  const span = (asU32(end) - asU32(begin)) >>> 0;
  const count = (span | 0) >> 2;
  return ((idx | 0) < count) ? 1 : 0;
}

/**
 * gs9e0180ElemFetch — P3 composite: begin/end = u32 LE at vecOff/+4;
 * when P1 && P2 pass, u32 LE at (begin + (~v)*4) — the ELEMENT dword,
 * SINGLE deref — with u32-wrapping address adds; else 0.
 */
export function gs9e0180ElemFetch(mem, vecOff, v) {
  const idx = (~asU32(v)) >>> 0;
  if ((idx | 0) < 0) return 0; /* js @0x9e018a */
  const base = asU32(vecOff);
  const begin = loadU32(mem, base);
  const end = loadU32(mem, (base + 4) >>> 0);
  const span = (end - begin) >>> 0;
  const count = (span | 0) >> 2;
  if ((idx | 0) >= count) return 0; /* jge @0x9e0198 */
  const elemAddr = (begin + ((idx << 2) >>> 0)) >>> 0;
  return loadU32(mem, elemAddr); /* elem @0x9e019a */
}

export const gs9e0180Va = () => GS9E0180_VA;
export const gs9e0180EndVa = () => GS9E0180_END_VA;
export const gs9e0180BodyBytes = () => GS9E0180_BODY_BYTES;
export const gs9e0180NextVa = () => GS9E0180_NEXT_VA;
export const gs9e0180InsnCount = () => GS9E0180_INSN_COUNT;
export const gs9e0180NotVa = () => GS9E0180_NOT_VA;
export const gs9e0180JsGateVa = () => GS9E0180_JS_GATE_VA;
export const gs9e0180SubVa = () => GS9E0180_SUB_VA;
export const gs9e0180SarVa = () => GS9E0180_SAR_VA;
export const gs9e0180CmpVa = () => GS9E0180_CMP_VA;
export const gs9e0180JgeGateVa = () => GS9E0180_JGE_GATE_VA;
export const gs9e0180ElemLoadVa = () => GS9E0180_ELEM_LOAD_VA;
export const gs9e0180RetOkVa = () => GS9E0180_RET_OK_VA;
export const gs9e0180RetNullVa = () => GS9E0180_RET_NULL_VA;
export const gs9e0180CallerCount = () => GS9E0180_CALLER_VAS.length;
export const gs9e0180CallerVaAt = (index) =>
  GS9E0180_CALLER_VAS[index >>> 0] ?? 0;
export const gs9e0180GameVecOff = () => GS9E0180_GAME_VEC_OFF;

/* ============ ABI v19: 0x9e0650 forward-index BYTE getter
 * Transcribed from the PE (NOT derived from the cpp). Census:
 * section-notes/gamestate-scan-9dc750/NOTES.md UNIT 12 §U12-2.
 * Minimal frame; NO SEH/GS/calls/globals/stores. edx = idx;
 * SIGNED js @0x9e0659 (idx < 0 -> zero); n = [ecx+0x10] -
 * [ecx+0xc] in BYTE units (NO shift); SIGNED jge @0x9e0665
 * (idx >= n -> zero); movzx byte load @0x9e0667; dual ret 4
 * @0x9e066d / @0x9e0674. Sole caller 0x770bb6 = HUD 770ba1's
 * pinned host-leaf site (HUD keeps its pin; both facts recorded). */

export const GS9E0650_VA = 0x009e0650;
export const GS9E0650_END_VA = 0x009e0677; /* first int3 after the zero-path ret */
export const GS9E0650_BODY_BYTES = 0x27;
export const GS9E0650_NEXT_VA = 0x009e0680; /* next body Y: frame-effect-pinned host */
export const GS9E0650_INSN_COUNT = 19;
export const GS9E0650_JS_GATE_VA = 0x009e0659; /* js -> zero */
export const GS9E0650_END_LOAD_VA = 0x009e065b; /* mov eax,[ecx+0x10] */
export const GS9E0650_BEGIN_LOAD_VA = 0x009e065e; /* mov esi,[ecx+0xc] */
export const GS9E0650_SUB_VA = 0x009e0661; /* sub eax,esi — NO shift */
export const GS9E0650_CMP_VA = 0x009e0663; /* cmp edx,eax */
export const GS9E0650_JGE_GATE_VA = 0x009e0665; /* jge -> zero */
export const GS9E0650_BYTE_LOAD_VA = 0x009e0667; /* movzx eax,byte ptr [esi+edx] */
export const GS9E0650_RET_OK_VA = 0x009e066d; /* ret 4 hit path */
export const GS9E0650_ZERO_PATH_VA = 0x009e0670; /* xor eax,eax */
export const GS9E0650_RET_ZERO_VA = 0x009e0674; /* ret 4 zero path */
export const GS9E0650_BEGIN_OFF = 0xc;
export const GS9E0650_END_OFF = 0x10;
export const GS9E0650_CALLER_VAS = [0x00770bb6];

/* u8 ZERO-EXTENDING load at a u32-wrapping address; accepts Buffer
 * (readUInt8) or DataView. The PE movzx reads ONE byte. */
function loadU8(mem, addr) {
  if (mem.readUInt8) return mem.readUInt8(addr) & 0xff;
  if (mem.getUint8) return mem.getUint8(addr) & 0xff;
  throw new TypeError("mem must be a Buffer or DataView");
}

/** gs9e0650ForwardIndexGuard — X1 PE 0x9e0657/0x9e0659: SIGNED idx >= 0. */
export function gs9e0650ForwardIndexGuard(idx) {
  return ((idx | 0) >= 0) ? 1 : 0;
}

/**
 * gs9e0650ByteSpanSize — X2 PE 0x9e065b/0x9e065e/0x9e0661:
 * n = end - begin over the u32-wrapped dword pair, BYTE units,
 * NO shift (v17's vector twin sars by 2; this body does not).
 */
export function gs9e0650ByteSpanSize(begin, end) {
  return (asU32(end) - asU32(begin)) >>> 0;
}

/**
 * gs9e0650BoundsCheck — X3 PE 0x9e0663/0x9e0665:
 * SIGNED(idx) < SIGNED((end - begin)). The span subtract wraps
 * u32; the compare is signed on BOTH sides (jge -> zero).
 */
export function gs9e0650BoundsCheck(idx, begin, end) {
  const span = (asU32(end) - asU32(begin)) >>> 0;
  return ((idx | 0) < (span | 0)) ? 1 : 0;
}

/** gs9e0650ZeroReturn — X5 PE 0x9e0670/0x9e0674: xor eax,eax ; ret 4. */
export function gs9e0650ZeroReturn() {
  return 0;
}

/**
 * gs9e0650ByteGetter — X4/X5 composite: begin/end = u32 LE at
 * thisOff+0xc/+0x10; when X1 && X3 pass, returns the ZERO-EXTENDED
 * byte at (begin + idx) with u32-wrapping address adds; else the
 * ZERO-PATH value 0.
 */
export function gs9e0650ByteGetter(mem, thisOff, idx) {
  const i = idx | 0;
  if (i < 0) return gs9e0650ZeroReturn(); /* js @0x9e0659 */
  const base = asU32(thisOff);
  const begin = loadU32(mem, (base + GS9E0650_BEGIN_OFF) >>> 0);
  const end = loadU32(mem, (base + GS9E0650_END_OFF) >>> 0);
  const span = (end - begin) >>> 0;
  if (i >= (span | 0)) return gs9e0650ZeroReturn(); /* jge @0x9e0665 */
  return loadU8(mem, (asU32(begin) + i) >>> 0); /* movzx @0x9e0667 */
}

export const gs9e0650Va = () => GS9E0650_VA;
export const gs9e0650EndVa = () => GS9E0650_END_VA;
export const gs9e0650BodyBytes = () => GS9E0650_BODY_BYTES;
export const gs9e0650NextVa = () => GS9E0650_NEXT_VA;
export const gs9e0650InsnCount = () => GS9E0650_INSN_COUNT;
export const gs9e0650JsGateVa = () => GS9E0650_JS_GATE_VA;
export const gs9e0650EndLoadVa = () => GS9E0650_END_LOAD_VA;
export const gs9e0650BeginLoadVa = () => GS9E0650_BEGIN_LOAD_VA;
export const gs9e0650SubVa = () => GS9E0650_SUB_VA;
export const gs9e0650CmpVa = () => GS9E0650_CMP_VA;
export const gs9e0650JgeGateVa = () => GS9E0650_JGE_GATE_VA;
export const gs9e0650ByteLoadVa = () => GS9E0650_BYTE_LOAD_VA;
export const gs9e0650RetOkVa = () => GS9E0650_RET_OK_VA;
export const gs9e0650ZeroPathVa = () => GS9E0650_ZERO_PATH_VA;
export const gs9e0650RetZeroVa = () => GS9E0650_RET_ZERO_VA;
export const gs9e0650CallerCount = () => GS9E0650_CALLER_VAS.length;
export const gs9e0650CallerVaAt = (index) =>
  GS9E0650_CALLER_VAS[index >>> 0] ?? 0;
/* ============ ABI v20: 0x9e3450 grid-adjacency door-direction checker
 * Transcribed from the PE CFG (NOT derived from the cpp). Census:
 * gamestate-scan-9dc750 NOTES UNIT 17 §U17-3 — AI4 deref CORRECTED
 * against the authoritative dump: cell byte is [this+4+idxA] SINGLE
 * deref ([ebp-4] holds raw this saved @0x9e3456 BEFORE the width
 * deref); only the width read w=[[this]+0xc] is double-deref. Door
 * table 0xc37610 is a HOST-RESOLVED INPUT (writer-scan negative across
 * the image; frame-effect v41 g1/g2 read-only-BSS precedent). Floats
 * -13/+13 stay pinned (.rdata). Semantics locked by scratch rehearsal:
 * dRow = REMAINDER delta, dCol = QUOTIENT delta; abs is the cdq/xor/
 * sub idiom (FULL sign mask — NOT the sign bit; INT_MIN wraps);
 * manhattan == 1 FULL-dword; count gate jle SIGNED <= 0; scan loop jl
 * SIGNED; signum vs ±13 floats is exact equality, NaN unordered -> 0;
 * hit iff signum(x)==dRow && signum(y)==dCol (x<->ROW, y<->COL).
 * ======================================================================== */

export const GS9E3450_VA = 0x009e3450;
export const GS9E3450_END_VA = 0x009e3553; /* first int3 after the hit-path ret @0x9e3550..52 */
export const GS9E3450_BODY_BYTES = 0x103;
export const GS9E3450_NEXT_VA = 0x009e3560; /* AJ grid-query builder (SEH HOST) */
export const GS9E3450_INSN_COUNT = 101;
export const GS9E3450_WIDTH_LOAD_VA = 0x009e3461; /* mov esi,[eax+0xc] */
export const GS9E3450_MANHATTAN_JNE_VA = 0x009e3492; /* cmp ecx,1 ; jne fail */
export const GS9E3450_BOUND_CMP_VA = 0x009e3498; /* cmp ebx,0x1bf */
export const GS9E3450_BOUND_JA_VA = 0x009e349e; /* ja fail — UNSIGNED above */
export const GS9E3450_CELL_READ_VA = 0x009e34a7; /* mov al,[ebx+eax+4] — SINGLE deref */
export const GS9E3450_SENTINEL_JE_VA = 0x009e34ab; /* cmp al,0xff ; je fail (@0x9e34ad) */
export const GS9E3450_TYPE_MASK_VA = 0x009e34b8; /* and eax,0xf */
export const GS9E3450_COUNT_LOAD_VA = 0x009e34c2; /* mov ebx,[ecx*4+0xc37610] */
export const GS9E3450_COUNT_JLE_VA = 0x009e34cb; /* test/jle — SIGNED <= 0 */
export const GS9E3450_ENTRY_LEA_VA = 0x009e34d5; /* lea esi,[ecx*4+0xc37614] */
export const GS9E3450_CMP_DROW_VA = 0x009e352b; /* cmp edx,[ebp+8]: signum(x) vs dRow */
export const GS9E3450_CMP_DCOL_VA = 0x009e3530; /* cmp ecx,[ebp+0xc]: signum(y) vs dCol */
export const GS9E3450_RET_FAIL_VA = 0x009e3545; /* xor al,al arm ret 8 */
export const GS9E3450_RET_HIT_VA = 0x009e3550; /* mov al,1 arm ret 8 */
export const GS9E3450_GRID_BOUND = 0x1bf; /* 448 cells - 1 */
export const GS9E3450_WIDTH_INNER_OFF = 0xc; /* [this]->width */
export const GS9E3450_CELL_TABLE_OFF = 4; /* u8[this+4+idx] */
export const GS9E3450_SENTINEL = 0xff;
export const GS9E3450_TYPE_MASK = 0xf;
export const GS9E3450_DOOR_TABLE_VA = 0x00c37610; /* HOST-resolved input */
export const GS9E3450_TYPE_ROW_STRIDE = 68; /* shl 4 + add => t*17 dwords */
export const GS9E3450_ENTRY_STRIDE = 8; /* {f32 x, f32 y} */
export const GS9E3450_FLT_NEG_VA = 0x00baadd0; /* -13.0f (.rdata) */
export const GS9E3450_FLT_POS_VA = 0x00baa83c; /* +13.0f (.rdata) */
export const GS9E3450_CALLER_VAS = [
  0x004b7178, 0x004b72f2, 0x004b748d, 0x004b75ed, 0x004bbd2a, 0x009e3774,
];

/* module-local loaders (Buffer or DataView), u32-wrap addresses */
function gs9e3450LoadU8(mem, addr) {
  if (mem.readUInt8) return mem.readUInt8(addr);
  return mem.getUint8(addr >>> 0, true);
}
function gs9e3450LoadF32(mem, addr) {
  if (mem.readFloatLE) return mem.readFloatLE(addr);
  return mem.getFloat32(addr >>> 0, true);
}

/** gs9e3450IdivQ — PE 0x9e3467/0x9e3471 idiv quotient: truncate toward
 * zero; INT_MIN/-1 wraps like the hardware; #DE (w==0) unmodeled HOST. */
function gs9e3450IdivQ(a, b) {
  if (b === 0) throw new Error("idiv #DE (host crash, unmodeled)");
  if (a === -0x80000000 && b === -1) return a;
  return Math.trunc(a / b) | 0;
}

/** gs9e3450GridSplit — AI1 PE 0x9e345d..0x9e347f: w=[[this]+0xc];
 * SIGNED idiv split of both indices; returns {dCol=qB-qA, dRow=rB-rA}. */
export function gs9e3450GridSplit(mem, thisOff, idxA, idxB) {
  const inner = loadU32(mem, asU32(thisOff));
  const w =
    loadU32(mem, (asU32(inner) + GS9E3450_WIDTH_INNER_OFF) >>> 0) | 0;
  const qa = gs9e3450IdivQ(asInt(idxA), w);
  const ra = idivTruncRem(asInt(idxA), w);
  const qb = gs9e3450IdivQ(asInt(idxB), w);
  const rb = idivTruncRem(asInt(idxB), w);
  return { dCol: (qb - qa) | 0, dRow: (rb - ra) | 0 };
}

function idivTruncRem(a, b) {
  return a % b; /* JS % IS truncated remainder == idiv r (INT_MIN%-1 -> 0) */
}
const asInt = (v) => v | 0;

/** gs9e3450ManhattanOne — AI2 PE 0x9e3482..0x9e3492: xor-sub abs with
 * FULL cdq sign mask (NOT the sign bit); sum wraps u32; == 1 exactly. */
export function gs9e3450ManhattanOne(dCol, dRow) {
  const abs = (v) => {
    const u = asU32(v);
    const s = 0 - (u >>> 31); /* cdq: FULL sign mask */
    return ((u ^ s) - s) >>> 0;
  };
  return ((abs(dCol) + abs(dRow)) >>> 0) === 1 ? 1 : 0;
}

/** gs9e3450IndexBound — AI3 PE 0x9e3498/0x9e349e: idxA <=u 0x1bf. */
export function gs9e3450IndexBound(idxA) {
  return asU32(idxA) <= GS9E3450_GRID_BOUND ? 1 : 0;
}

/** gs9e3450CellTableRead — AI4 PE 0x9e34a4/0x9e34a7: u8[this+4+idxA],
 * SINGLE deref (raw this reloaded from [ebp-4], saved pre-width-deref). */
export function gs9e3450CellTableRead(mem, thisOff, idxA) {
  return gs9e3450LoadU8(
    mem,
    (asU32(thisOff) + GS9E3450_CELL_TABLE_OFF + asU32(idxA)) >>> 0,
  );
}

/** gs9e3450TypeSelect — AI5 PE 0x9e34b3/0x9e34b8: t = b & 0xf. */
export function gs9e3450TypeSelect(b) {
  return asU32(b) & GS9E3450_TYPE_MASK;
}

/** gs9e3450DoorDirScan — AI6 PE 0x9e34c2..0x9e353b: cnt = s32[row];
 * jle SIGNED <= 0 fails; entries at row+4 stride 8 {f32 x,f32 y};
 * hit iff exists k<cnt (SIGNED jl): signum(x)==dRow && signum(y)==dCol. */
export function gs9e3450DoorDirScan(mem, tablePtr, t, dCol, dRow) {
  const row = (asU32(tablePtr) + asU32(t) * GS9E3450_TYPE_ROW_STRIDE) >>> 0;
  const cnt = loadU32(mem, row) | 0;
  if (cnt <= 0) return 0; /* jle @0x9e34cb — SIGNED */
  const base = (row + 4) >>> 0; /* lea @0x9e34d5 (+4 into the row) */
  for (let k = 0; k < cnt; k++) {
    const ea = (base + k * GS9E3450_ENTRY_STRIDE) >>> 0;
    const sx = gs9e3450Signum13(gs9e3450LoadF32(mem, ea));
    const sy = gs9e3450Signum13(gs9e3450LoadF32(mem, (ea + 4) >>> 0));
    if (sx === (dRow | 0) && sy === (dCol | 0)) return 1;
  }
  return 0;
}

/** gs9e3450Signum13 — ucomiss/lahf/test ah,0x44/cmov idiom: ==-13 -> -1,
 * ==+13 -> +1, else 0. NaN is unordered in BOTH ucomiss arms -> 0.
 * Exact f32 equality: both consts are exactly representable. */
export function gs9e3450Signum13(v) {
  if (v === -13) return -1;
  if (v === 13) return 1;
  return 0;
}

/** gs9e3450BoolReturn — AI7 PE 0x9e353f/0x9e354a: AL = hit ? 1 : 0
 * (upper EAX garbage in the PE; the bool contract is AL only). */
export function gs9e3450BoolReturn(hit) {
  return hit !== 0 ? 1 : 0;
}

/** gs9e3450DoorDir — full PE CFG 0x9e3450..0x9e3551 composite over a
 * HOST-resolved door table (caller supplies the 0xc37610 bytes). */
export function gs9e3450DoorDir(mem, thisPtr, idxA, idxB, tablePtr) {
  const { dCol, dRow } = gs9e3450GridSplit(mem, thisPtr, idxA, idxB);
  if (gs9e3450ManhattanOne(dCol, dRow) === 0) return 0; /* jne @0x9e3492 */
  if (gs9e3450IndexBound(idxA) === 0) return 0; /* ja @0x9e349e */
  const b = gs9e3450CellTableRead(mem, thisPtr, idxA);
  if (b === GS9E3450_SENTINEL) return 0; /* je @0x9e34ad */
  const t = gs9e3450TypeSelect(b);
  return gs9e3450BoolReturn(
    gs9e3450DoorDirScan(mem, tablePtr, t, dCol, dRow),
  );
}

export const gs9e3450Va = () => GS9E3450_VA;
export const gs9e3450EndVa = () => GS9E3450_END_VA;
export const gs9e3450BodyBytes = () => GS9E3450_BODY_BYTES;
export const gs9e3450NextVa = () => GS9E3450_NEXT_VA;
export const gs9e3450InsnCount = () => GS9E3450_INSN_COUNT;
export const gs9e3450WidthLoadVa = () => GS9E3450_WIDTH_LOAD_VA;
export const gs9e3450ManhattanJneVa = () => GS9E3450_MANHATTAN_JNE_VA;
export const gs9e3450BoundCmpVa = () => GS9E3450_BOUND_CMP_VA;
export const gs9e3450BoundJaVa = () => GS9E3450_BOUND_JA_VA;
export const gs9e3450CellReadVa = () => GS9E3450_CELL_READ_VA;
export const gs9e3450SentinelJeVa = () => GS9E3450_SENTINEL_JE_VA;
export const gs9e3450TypeMaskVa = () => GS9E3450_TYPE_MASK_VA;
export const gs9e3450CountLoadVa = () => GS9E3450_COUNT_LOAD_VA;
export const gs9e3450CountJleVa = () => GS9E3450_COUNT_JLE_VA;
export const gs9e3450EntryLeaVa = () => GS9E3450_ENTRY_LEA_VA;
export const gs9e3450CmpDrowVa = () => GS9E3450_CMP_DROW_VA;
export const gs9e3450CmpDcolVa = () => GS9E3450_CMP_DCOL_VA;
export const gs9e3450RetFailVa = () => GS9E3450_RET_FAIL_VA;
export const gs9e3450RetHitVa = () => GS9E3450_RET_HIT_VA;
export const gs9e3450GridBound = () => GS9E3450_GRID_BOUND;
export const gs9e3450WidthInnerOff = () => GS9E3450_WIDTH_INNER_OFF;
export const gs9e3450CellTableOff = () => GS9E3450_CELL_TABLE_OFF;
export const gs9e3450Sentinel = () => GS9E3450_SENTINEL;
export const gs9e3450TypeMask = () => GS9E3450_TYPE_MASK;
export const gs9e3450DoorTableVa = () => GS9E3450_DOOR_TABLE_VA;
export const gs9e3450TypeRowStride = () => GS9E3450_TYPE_ROW_STRIDE;
export const gs9e3450EntryStride = () => GS9E3450_ENTRY_STRIDE;
export const gs9e3450FltNegVa = () => GS9E3450_FLT_NEG_VA;
export const gs9e3450FltPosVa = () => GS9E3450_FLT_POS_VA;
export const gs9e3450CallerCount = () => GS9E3450_CALLER_VAS.length;
export const gs9e3450CallerVaAt = (index) =>
  GS9E3450_CALLER_VAS[index >>> 0] ?? 0;
