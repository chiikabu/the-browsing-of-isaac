"""Capture the live `Game` object (and the render shell's receiver) out of a
running isaac-ng process, for the browser native frame path.

Output is BINARY-DERIVED LOCAL EVIDENCE. It is written under the ignored
`output/` root and must never be committed.

    python scripts/decomp/capture-game-state.py --pid <pid> --label inrun

---------------------------------------------------------------------------
Evidence (tools/isaac-ng.unpacked.exe, SHA-256 5129DF72...)
---------------------------------------------------------------------------
g_Game is the global at VA 0x00c71678 (preferred image base 0x00400000):

  FUN_00753cf0 is exactly one accessor:
      mov  eax, dword ptr [0xc71678]
      add  eax, 0x23a74                 ; Game+0x23a74 == BINARY_LAYOUT.menuState23a74
      ret
  0x00952817 constructs it:
      push 0x68e88                      ; sizeof(Game); >= GAME_OBJECT_MIN_SIZE 0x68d70
      call operator new
      call 0x006f1020                   ; Game::Game(this)
      mov  dword ptr [0xc71678], eax    ; g_Game = new Game
  0x00959797 is the lazy variant (cmp [0xc71678],0 / jne skip / same body).

The render shell FUN_0080ea80 does NOT take the Game. Both real callers do:
      mov  edi, dword ptr [0xc71678]    ; edi = g_Game
      mov  ecx, dword ptr [edi+0x18300] ; ecx = *(Game+0x18300)
      call 0x0080ea80                   ; VA 0x00831630 and 0x00831e37
so the render slice's this-relative fields (gridW@0x0c, gridH@0x10,
GridEntity* dword array @ Room+0x24 for gridW*gridH cells,
entityArray@0x125c, entityCount@0x1264, ...) belong to *(Game+0x18300), which
is dumped separately at GAME_RENDER_GAME_OBJECT_MIN_SIZE (0x3bb20) bytes.
Pointed GridEntity objects are heap allocations and are RPM'd separately
(see dump_grid_entity_blobs; sizeof GridEntity 0x154 in ZHL, Door 0x2ec).

---------------------------------------------------------------------------
ASLR
---------------------------------------------------------------------------
The image is DYNAMIC_BASE (DllCharacteristics 0x8140) with a live .reloc, so
the module base is resolved at runtime and every VA is rebased:
    addr = moduleBase + (VA - 0x00400000)

NOTE: the Steamless-unpacked binary CRASHES when it is actually relocated.
.reloc carries a bogus HIGHLOW fixup at RVA 0x00531148, which lands on code
(`add esp,4 ; xor eax,eax`). Applying the ASLR delta rewrites the dword
0x90c03304 -> 0x90a03304, turning `xor eax,eax` at VA 0x0093114a into
`xor esp,[eax-0x9901770]` and raising a read AV. Clearing the DYNAMIC_BASE bit
(offset 70 of the optional header) on a scratch copy makes the loader map at
0x00400000 and skip relocation entirely; the runtime VAs are then literal.
"""
import argparse
import ctypes
import ctypes.wintypes as w
import hashlib
import json
import os
import struct
import time

PREFERRED_BASE = 0x00400000
GAME_GLOBAL_VA = 0x00c71678          # g_Game
MANAGER_GLOBAL_VA = 0x00c7169c       # manager global (recorded for context)
GAME_OBJECT_MIN_SIZE = 0x68d70       # scripts/decomp/game-update-model.mjs
GAME_ALLOC_SIZE = 0x68e88            # push 0x68e88 at the ctor site
RENDER_ROOT_PTR_OFF = 0x18300
RENDER_ROOT_MIN_SIZE = 0x3bb20       # scripts/decomp/game-render-model.mjs
BINARY_SHA256 = "5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200"

# ZHL Entity::_pos / _velocity (REPENTOGON Entity layout). Not Game+0x2650c.
ENTITY_POS_OFF = 0x33c
ENTITY_VEL_OFF = 0x360
ENTITY_BLOB_MIN = 0x368
PLAYER_VEC_BEGIN_OFF = 0x1baa8
PLAYER_VEC_END_OFF = 0x1baac
ROOM_ENTITY_ARRAY_OFF = 0x125c
ROOM_ENTITY_COUNT_OFF = 0x1264
ENTITY_DUMP_CAP = 64

# Room (render-root) grid: dword GridEntity* table at +0x24 (gridW@0x0c * gridH@0x10).
# Confirmed on live render-root-live.bin (114688 B): 15x9=135 cells, heap ptrs, no 1..255.
ROOM_GRID_W_OFF = 0x0c
ROOM_GRID_H_OFF = 0x10
ROOM_GRID_PTRS_OFF = 0x24
# ZHL: GridEntity : 0x154; largest subclass GridEntity_Door : 0x2ec.
GRID_ENTITY_SIZE = 0x154
GRID_ENTITY_BLOB = 0x2ec
# native/decomp/room_pure_helpers.h — ISAAC_ROOM_PLATE_* (type is NOT +0x24).
GRID_ENTITY_TYPE_OFF = 0x8          # ISAAC_ROOM_PLATE_TYPE_OFF
GRID_ENTITY_STATE_OFF = 0xc         # ISAAC_ROOM_PLATE_STATE_OFF
GRID_ENTITY_INDEX_OFF = 0x24        # ISAAC_ROOM_PLATE_IDX_OFF (cell index)
GRID_ENTITY_FLAG_OFF = 0x149        # ISAAC_ROOM_PLATE_FLAG_OFF
# ZHL GridEntityDesc at +0x4 (type@desc+0, variant@desc+4 == +0x8).
GRID_ENTITY_DESC_TYPE_OFF = 0x4
GRID_ENTITY_COLLISION_OFF = 0x3c
GRID_ENTITY_SPAWN_FRAME_OFF = 0x28
GRID_CELL_CAP = 0x1c0               # ISAAC_ROOM_PLATE_IDX_BOUND + 1

PROCESS_QUERY_INFORMATION = 0x0400
PROCESS_VM_READ = 0x0010
TH32CS_SNAPMODULE = 0x00000008
TH32CS_SNAPMODULE32 = 0x00000010

k32 = ctypes.WinDLL("kernel32", use_last_error=True)
# 64-bit handles must not be truncated through the default c_int restype.
k32.CreateToolhelp32Snapshot.restype = w.HANDLE
k32.CreateToolhelp32Snapshot.argtypes = [w.DWORD, w.DWORD]
k32.OpenProcess.restype = w.HANDLE
k32.OpenProcess.argtypes = [w.DWORD, w.BOOL, w.DWORD]
k32.CloseHandle.argtypes = [w.HANDLE]
k32.ReadProcessMemory.restype = w.BOOL
k32.ReadProcessMemory.argtypes = [w.HANDLE, w.LPCVOID, w.LPVOID, ctypes.c_size_t,
                                  ctypes.POINTER(ctypes.c_size_t)]


class MODULEENTRY32(ctypes.Structure):
    _fields_ = [
        ("dwSize", w.DWORD), ("th32ModuleID", w.DWORD), ("th32ProcessID", w.DWORD),
        ("GlblcntUsage", w.DWORD), ("ProccntUsage", w.DWORD),
        ("modBaseAddr", ctypes.POINTER(ctypes.c_byte)), ("modBaseSize", w.DWORD),
        ("hModule", w.HMODULE), ("szModule", ctypes.c_char * 256),
        ("szExePath", ctypes.c_char * 260),
    ]


def module_base(pid, want):
    """Resolve a module's runtime base. Never assume 0x400000."""
    snap = None
    for _ in range(40):
        snap = k32.CreateToolhelp32Snapshot(TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, pid)
        if snap and snap != ctypes.c_void_p(-1).value:
            break
        err = ctypes.get_last_error()
        if err != 299:  # ERROR_PARTIAL_COPY while the target is still loading
            raise OSError("CreateToolhelp32Snapshot(%d) failed %d" % (pid, err))
        time.sleep(0.1)
    me = MODULEENTRY32()
    me.dwSize = ctypes.sizeof(me)
    mods = []
    ok = k32.Module32First(snap, ctypes.byref(me))
    while ok:
        mods.append((me.szModule.decode("mbcs"),
                     ctypes.cast(me.modBaseAddr, ctypes.c_void_p).value,
                     me.modBaseSize, me.szExePath.decode("mbcs")))
        ok = k32.Module32Next(snap, ctypes.byref(me))
    k32.CloseHandle(snap)
    for name, base, size, path in mods:
        if name.lower() == want.lower():
            return base, size, path
    raise LookupError("module %s not found; saw %s" % (want, [m[0] for m in mods[:10]]))


class Reader:
    def __init__(self, pid):
        self.h = k32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
        if not self.h:
            raise OSError("OpenProcess(%d) failed %d" % (pid, ctypes.get_last_error()))

    def read(self, addr, n):
        buf = ctypes.create_string_buffer(n)
        got = ctypes.c_size_t(0)
        if k32.ReadProcessMemory(self.h, ctypes.c_void_p(addr), buf,
                                 ctypes.c_size_t(n), ctypes.byref(got)):
            return buf.raw[:got.value]
        err = ctypes.get_last_error()
        if err == 299 and got.value:
            return buf.raw[:got.value]
        out = bytearray()
        page = 0x1000
        cur = addr
        end_addr = addr + n
        while cur < end_addr:
            chunk = min(page, end_addr - cur)
            piece = ctypes.create_string_buffer(chunk)
            got2 = ctypes.c_size_t(0)
            ok = k32.ReadProcessMemory(self.h, ctypes.c_void_p(cur), piece,
                                       ctypes.c_size_t(chunk), ctypes.byref(got2))
            if not ok or got2.value == 0:
                break
            out.extend(piece.raw[:got2.value])
            cur += got2.value
            if got2.value < chunk:
                break
        if out:
            return bytes(out)
        raise OSError("ReadProcessMemory(0x%x, %d) failed %d" % (addr, n, err))
    def u32(self, addr):
        return struct.unpack("<I", self.read(addr, 4))[0]

    def close(self):
        k32.CloseHandle(self.h)


def _probe_set(game, render):
    def i32(b, o):
        return struct.unpack_from("<i", b, o)[0]

    def u32v(b, o):
        return struct.unpack_from("<I", b, o)[0]

    def f32(b, o):
        return struct.unpack_from("<f", b, o)[0]

    out = {
        "game.renderRootPtr@0x18300": "0x%08x" % u32v(game, 0x18300),
        "game.menuState23a74@0x23a74": i32(game, 0x23a74),
        "game.state24ecc@0x24ecc": i32(game, 0x24ecc),
        "game.itemOverlayState@0x1c034": i32(game, 0x1c034),
        "game.timedTransitionCleanupMode@0x26614": i32(game, 0x26614),
        "game.frameCounter@0x264f8": i32(game, 0x264f8),
        "game.playerVectorBegin@0x1baa8": "0x%08x" % u32v(game, 0x1baa8),
        "game.playerVectorEnd@0x1baac": "0x%08x" % u32v(game, 0x1baac),
        "game.nonzeroBytes": sum(1 for b in game if b),
    }
    if render:
        out.update({
            "render.vtable@0x00": "0x%08x" % u32v(render, 0x00),
            "render.gameMode@0x08": i32(render, 0x08),
            "render.gridW@0x0c": i32(render, 0x0c),
            "render.gridH@0x10": i32(render, 0x10),
            "render.flag11f6@0x11f6": render[0x11f6],
            "render.cameraBaseX@0x1204": f32(render, 0x1204),
            "render.cameraBaseY@0x1208": f32(render, 0x1208),
            "render.entityArray@0x125c": "0x%08x" % u32v(render, 0x125c),
            "render.entityCount@0x1264": u32v(render, 0x1264),
            "render.stage1d18@0x1d18": i32(render, 0x1d18),
            "render.nonzeroBytes": sum(1 for b in render if b),
        })
    return out


def _try_u32(rd, addr):
    try:
        return rd.u32(addr)
    except OSError:
        return 0


def _try_read(rd, addr, n):
    try:
        return rd.read(addr, n)
    except OSError:
        return b""


def _entity_row(addr, blob, role, index):
    def f32(o):
        if len(blob) < o + 4:
            return None
        return struct.unpack_from("<f", blob, o)[0]

    return {
        "role": role,
        "index": index,
        "address": "0x%08x" % addr,
        "bytes": len(blob),
        "posX": f32(ENTITY_POS_OFF),
        "posY": f32(ENTITY_POS_OFF + 4),
        "velX": f32(ENTITY_VEL_OFF),
        "velY": f32(ENTITY_VEL_OFF + 4),
    }


def _dump_pointer_list(rd, begin, end, cap, role):
    if not begin or end < begin:
        return []
    count = (end - begin) // 4
    if count <= 0:
        return []
    if count > cap:
        count = cap
    raw = _try_read(rd, begin, count * 4)
    if len(raw) < 4:
        return []
    n = len(raw) // 4
    ptrs = struct.unpack("<%dI" % n, raw[: n * 4])
    rows = []
    for i, ptr in enumerate(ptrs):
        if not ptr:
            continue
        blob = _try_read(rd, ptr, ENTITY_BLOB_MIN)
        if len(blob) < ENTITY_VEL_OFF + 8:
            continue
        rows.append((ptr, blob, _entity_row(ptr, blob, role, i)))
    return rows


def dump_entity_blobs(rd, game, render, outdir, label):
    """Follow player-vector and Room entity-array pointers. Local evidence only."""
    begin = struct.unpack_from("<I", game, PLAYER_VEC_BEGIN_OFF)[0]
    end = struct.unpack_from("<I", game, PLAYER_VEC_END_OFF)[0]
    players = _dump_pointer_list(rd, begin, end, 8, "player")

    room_rows = []
    if render and len(render) >= ROOM_ENTITY_COUNT_OFF + 4:
        arr = struct.unpack_from("<I", render, ROOM_ENTITY_ARRAY_OFF)[0]
        count = struct.unpack_from("<I", render, ROOM_ENTITY_COUNT_OFF)[0]
        if count > ENTITY_DUMP_CAP:
            count = ENTITY_DUMP_CAP
        if arr and count:
            room_rows = _dump_pointer_list(rd, arr, arr + count * 4, count, "room")

    seen = set()
    written = []
    for ptr, blob, row in players + room_rows:
        if ptr in seen:
            continue
        seen.add(ptr)
        name = "entity-%s-%s-%d.bin" % (label, row["role"], row["index"])
        path = os.path.join(outdir, name)
        with open(path, "wb") as f:
            f.write(blob)
        row["file"] = name
        row["sha256"] = hashlib.sha256(blob).hexdigest()
        written.append(row)

    sidecar = {
        "posOffset": "0x%x" % ENTITY_POS_OFF,
        "velOffset": "0x%x" % ENTITY_VEL_OFF,
        "playerVectorBegin": "0x%08x" % begin,
        "playerVectorEnd": "0x%08x" % end,
        "entities": written,
    }
    with open(os.path.join(outdir, "entities-%s.json" % label), "w", encoding="utf-8") as f:
        json.dump(sidecar, f, indent=2)
    return sidecar


def _i32_at(blob, off):
    if len(blob) < off + 4:
        return None
    return struct.unpack_from("<i", blob, off)[0]


def _u32_at(blob, off):
    if len(blob) < off + 4:
        return None
    return struct.unpack_from("<I", blob, off)[0]


def _u8_at(blob, off):
    if len(blob) <= off:
        return None
    return blob[off]


def _scratch_game_instance_dir():
    return os.path.normpath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "..",
        ".scratch", "game-instance"))


def load_grid_type_gfx_map(search_dir=None):
    """Map GridEntity type id -> gfx/grid png name from local XML only.

    Does not invent names. entities2.xml is Entity (enemies/effects) ids, not
    GridEntityType / StbGridType, so it is used only when an entry is clearly
    a grid-type record (gridType attribute, or a dedicated *grid*.xml).
    """
    import xml.etree.ElementTree as ET

    root = search_dir or _scratch_game_instance_dir()
    mapping = {}
    sources = []
    if not os.path.isdir(root):
        return mapping, sources

    xml_paths = []
    for dirpath, _dirs, files in os.walk(root):
        for name in files:
            low = name.lower()
            if not low.endswith(".xml"):
                continue
            if "grid" in low or low in ("entities2.xml",):
                xml_paths.append(os.path.join(dirpath, name))

    def _png_name(anm2_or_gfx):
        if not anm2_or_gfx:
            return None
        norm = anm2_or_gfx.replace("\\", "/")
        low = norm.lower()
        if not (low.startswith("gfx/grid/") or low.startswith("grid/") or "/grid/" in low):
            return None
        base = os.path.basename(norm)
        stem, ext = os.path.splitext(base)
        if ext.lower() == ".anm2":
            return stem + ".png"
        if ext.lower() == ".png":
            return base
        return None

    for path in xml_paths:
        try:
            tree = ET.parse(path)
        except ET.ParseError:
            continue
        used = False
        xml_name = os.path.basename(path).lower()
        dedicated_grid_xml = "grid" in xml_name and xml_name != "entities2.xml"
        for elem in tree.iter():
            attrs = elem.attrib
            type_s = attrs.get("gridType") or attrs.get("gridtype")
            if type_s is None and dedicated_grid_xml:
                type_s = attrs.get("type") or attrs.get("id")
            if type_s is None:
                continue
            try:
                type_id = int(type_s, 0)
            except ValueError:
                continue
            gfx = (attrs.get("png") or attrs.get("gfx") or
                   attrs.get("anm2path") or attrs.get("anm2"))
            png = _png_name(gfx)
            if png is None:
                continue
            mapping.setdefault(type_id, png)
            used = True
        if used:
            sources.append(os.path.relpath(path, root).replace("\\", "/"))
    return mapping, sources


def _grid_entity_row(cell_index, ptr, blob):
    vt = _u32_at(blob, 0)
    return {
        "index": cell_index,
        "ptr": "0x%08x" % ptr,
        "type": _i32_at(blob, GRID_ENTITY_TYPE_OFF),
        "state": _i32_at(blob, GRID_ENTITY_STATE_OFF),
        "cellIndex": _i32_at(blob, GRID_ENTITY_INDEX_OFF),
        "flag149": _u8_at(blob, GRID_ENTITY_FLAG_OFF),
        "descType": _i32_at(blob, GRID_ENTITY_DESC_TYPE_OFF),
        "collisionClass": _i32_at(blob, GRID_ENTITY_COLLISION_OFF),
        "spawnFrame": _u32_at(blob, GRID_ENTITY_SPAWN_FRAME_OFF),
        "vtable": ("0x%08x" % vt) if vt is not None else None,
        "bytes": len(blob),
    }


def dump_grid_entity_blobs(rd, render, outdir, label):
    """RPM each non-null [Room+0x24 + i*4] GridEntity*. Additive files only."""
    empty = {
        "roomGridPtrsOffset": "0x%x" % ROOM_GRID_PTRS_OFF,
        "typeOffset": "0x%x" % GRID_ENTITY_TYPE_OFF,
        "indexOffset": "0x%x" % GRID_ENTITY_INDEX_OFF,
        "stateOffset": "0x%x" % GRID_ENTITY_STATE_OFF,
        "zhlGridEntitySize": "0x%x" % GRID_ENTITY_SIZE,
        "blobSize": "0x%x" % GRID_ENTITY_BLOB,
        "gridW": None,
        "gridH": None,
        "cells": [],
        "typeHistogram": {},
        "gfxMap": {},
        "gfxMapSources": [],
    }
    if not render or len(render) < ROOM_GRID_PTRS_OFF + 4:
        return empty

    grid_w = struct.unpack_from("<i", render, ROOM_GRID_W_OFF)[0]
    grid_h = struct.unpack_from("<i", render, ROOM_GRID_H_OFF)[0]
    cells_n = grid_w * grid_h
    if grid_w <= 0 or grid_h <= 0 or cells_n <= 0 or cells_n > GRID_CELL_CAP:
        empty["gridW"] = grid_w
        empty["gridH"] = grid_h
        empty["error"] = "implausible gridW/gridH"
        return empty

    need = ROOM_GRID_PTRS_OFF + cells_n * 4
    if len(render) < need:
        empty["gridW"] = grid_w
        empty["gridH"] = grid_h
        empty["error"] = "render-root too short for %d cells" % cells_n
        return empty

    raw = render[ROOM_GRID_PTRS_OFF:need]
    ptrs = struct.unpack("<%dI" % cells_n, raw)
    gfx_map, gfx_sources = load_grid_type_gfx_map()

    seen_files = {}
    rows = []
    hist = {}
    unique_nonzero = set()
    values_1_255 = 0
    for i, ptr in enumerate(ptrs):
        if 1 <= ptr <= 255:
            values_1_255 += 1
        if not ptr:
            rows.append({
                "index": i,
                "ptr": "0x00000000",
                "type": None,
                "cellIndex": None,
                "file": None,
            })
            continue
        unique_nonzero.add(ptr)
        if ptr in seen_files:
            blob = seen_files[ptr][0]
            name = seen_files[ptr][1]
        else:
            blob = _try_read(rd, ptr, GRID_ENTITY_BLOB)
            if len(blob) < GRID_ENTITY_INDEX_OFF + 4:
                rows.append({
                    "index": i,
                    "ptr": "0x%08x" % ptr,
                    "type": None,
                    "error": "short RPM (%d bytes)" % len(blob),
                    "file": None,
                })
                continue
            name = "grid-entity-%s-%d.bin" % (label, i)
            path = os.path.join(outdir, name)
            with open(path, "wb") as f:
                f.write(blob)
            seen_files[ptr] = (blob, name)
        row = _grid_entity_row(i, ptr, blob)
        row["file"] = name
        row["sha256"] = hashlib.sha256(blob).hexdigest()
        typ = row["type"]
        if typ is not None:
            key = str(typ)
            hist[key] = hist.get(key, 0) + 1
            png = gfx_map.get(typ)
            if png:
                row["gfxPng"] = png
        rows.append(row)

    sidecar = {
        "roomGridPtrsOffset": "0x%x" % ROOM_GRID_PTRS_OFF,
        "typeOffset": "0x%x" % GRID_ENTITY_TYPE_OFF,
        "typeOffsetName": "ISAAC_ROOM_PLATE_TYPE_OFF",
        "indexOffset": "0x%x" % GRID_ENTITY_INDEX_OFF,
        "indexOffsetName": "ISAAC_ROOM_PLATE_IDX_OFF",
        "stateOffset": "0x%x" % GRID_ENTITY_STATE_OFF,
        "zhlGridEntitySize": "0x%x" % GRID_ENTITY_SIZE,
        "zhlGridEntityDoorSize": "0x2ec",
        "blobSize": "0x%x" % GRID_ENTITY_BLOB,
        "gridW": grid_w,
        "gridH": grid_h,
        "cellCount": cells_n,
        "nonzeroCount": sum(1 for p in ptrs if p),
        "uniqueHeapPtrs": len(unique_nonzero),
        "valuesIn1to255": values_1_255,
        "typeHistogram": {k: hist[k] for k in sorted(hist, key=lambda s: int(s))},
        "gfxMap": {str(k): gfx_map[k] for k in sorted(gfx_map)},
        "gfxMapSources": gfx_sources,
        "cells": rows,
    }
    json_name = "grid-entities-%s.json" % label
    with open(os.path.join(outdir, json_name), "w", encoding="utf-8") as f:
        json.dump(sidecar, f, indent=2)
    hist_name = "grid-entity-type-histogram-%s.json" % label
    with open(os.path.join(outdir, hist_name), "w", encoding="utf-8") as f:
        json.dump(sidecar["typeHistogram"], f, indent=2)
    sidecar["file"] = json_name
    sidecar["histogramFile"] = hist_name
    return sidecar


def capture(pid, label, outdir, module_name, context="", grid_only=False):
    base, size, path = module_base(pid, module_name)
    slide = base - PREFERRED_BASE
    rd = Reader(pid)
    game_ptr_addr = GAME_GLOBAL_VA + slide
    game_va = rd.u32(game_ptr_addr)
    info = {
        "binarySha256": BINARY_SHA256,
        "modulePath": path,
        "moduleName": module_name,
        "preferredImageBase": "0x%08x" % PREFERRED_BASE,
        "moduleBase": "0x%08x" % base,
        "moduleSize": "0x%x" % size,
        "aslrSlide": "0x%x" % (slide & 0xffffffff),
        "aslrRelocated": base != PREFERRED_BASE,
        "gameGlobalVaPreferred": "0x%08x" % GAME_GLOBAL_VA,
        "gameGlobalAddrRuntime": "0x%08x" % game_ptr_addr,
        "gamePointerValue": "0x%08x" % game_va,
        "managerGlobalVaPreferred": "0x%08x" % MANAGER_GLOBAL_VA,
        "managerPointerValue": "0x%08x" % rd.u32(MANAGER_GLOBAL_VA + slide),
        "gameObjectSize": "0x%x" % GAME_OBJECT_MIN_SIZE,
        "gameObjectAllocSize": "0x%x" % GAME_ALLOC_SIZE,
        "renderRootPtrOffset": "0x%x" % RENDER_ROOT_PTR_OFF,
        "renderRootSize": "0x%x" % RENDER_ROOT_MIN_SIZE,
        "label": label,
        "onScreenContext": context,
        "pid": pid,
        "capturedAtUtc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "gridOnly": grid_only,
    }
    if game_va == 0:
        rd.close()
        raise RuntimeError("g_Game is NULL at 0x%08x — the Game object is not "
                           "constructed yet (let the game reach its menu first)"
                           % game_ptr_addr)

    game = rd.read(game_va, GAME_OBJECT_MIN_SIZE)
    render_ptr = struct.unpack_from("<I", game, RENDER_ROOT_PTR_OFF)[0]
    info["renderRootPointerValue"] = "0x%08x" % render_ptr
    render = None
    if render_ptr:
        try:
            render = rd.read(render_ptr, RENDER_ROOT_MIN_SIZE)
        except OSError as exc:
            info["renderRootError"] = str(exc)
    os.makedirs(outdir, exist_ok=True)
    if not grid_only:
        try:
            info["entities"] = dump_entity_blobs(rd, game, render, outdir, label)
        except Exception as exc:
            info["entitiesError"] = str(exc)
            info["entities"] = {"entities": []}
    try:
        info["gridEntities"] = dump_grid_entity_blobs(rd, render, outdir, label)
    except Exception as exc:
        info["gridEntitiesError"] = str(exc)
        info["gridEntities"] = {"cells": [], "typeHistogram": {}}
    rd.close()

    if grid_only:
        with open(os.path.join(outdir, "grid-entities-%s.capture.json" % label),
                  "w", encoding="utf-8") as f:
            json.dump(info, f, indent=2)
        return info

    info["probes"] = _probe_set(game, render)
    gpath = os.path.join(outdir, "game-object-%s.bin" % label)
    with open(gpath, "wb") as f:
        f.write(game)
    info["gameObjectFile"] = os.path.basename(gpath)
    info["gameObjectBytes"] = len(game)
    info["gameObjectSha256"] = hashlib.sha256(game).hexdigest()
    if render:
        rpath = os.path.join(outdir, "render-root-%s.bin" % label)
        with open(rpath, "wb") as f:
            f.write(render)
        info["renderRootFile"] = os.path.basename(rpath)
        info["renderRootBytes"] = len(render)
        info["renderRootSha256"] = hashlib.sha256(render).hexdigest()
    with open(os.path.join(outdir, "game-object-%s.json" % label), "w", encoding="utf-8") as f:
        json.dump(info, f, indent=2)
    return info


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pid", type=int, required=True, help="running isaac-ng process id")
    ap.add_argument("--label", default="inrun", help="capture label (menu / inrun / ...)")
    ap.add_argument("--module", default="isaac-ng.noaslr.exe",
                    help="module name as it appears in the process module list")
    ap.add_argument("--context", default="", help="what was on screen at capture time")
    ap.add_argument("--outdir", default=None,
                    help="default: output/decomp/gamestate/<first-12-of-sha256>")
    ap.add_argument("--grid-only", action="store_true",
                    help="RPM GridEntity blobs only; do not overwrite game/entity dumps")
    a = ap.parse_args()
    outdir = a.outdir or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "..",
        "output", "decomp", "gamestate", BINARY_SHA256[:12].lower())
    info = capture(a.pid, a.label, os.path.normpath(outdir), a.module, a.context,
                   grid_only=a.grid_only)
    print(json.dumps(info, indent=2))


if __name__ == "__main__":
    main()
