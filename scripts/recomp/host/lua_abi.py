"""Lua ABI verdict, by disassembly.

Lua is 62.2% of all IAT traffic (14,011 of 22,513 call sites), and the game
imports from `Lua5.3.3r.dll` -- a name that is not upstream's. A silent ABI
mismatch here (a `LUA_32BITS` build, a patched allocator, a different TValue
layout) corrupts every value crossing the boundary, so the configuration is
read out of the DLL's own code rather than assumed from the version number.

The decisive reads:
  lua_pushinteger  how many dwords the integer argument occupies -> LUA_INT_TYPE
  lua_pushnumber   movsd (8 bytes) vs movss (4)                  -> LUA_FLOAT_TYPE
  lua_gettop       the shift used to divide by sizeof(TValue)    -> TValue size

Writes output/recomp/host/lua-abi.json.

Run:  python scripts/recomp/host/lua_abi.py
"""

import hashlib
import json
import struct
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe import PE, OUT_DIR, REPO_ROOT, CENSUS_DIR, hexva  # noqa: E402

from capstone import Cs, CS_ARCH_X86, CS_MODE_32

GAME = REPO_ROOT / ".scratch" / "game-instance"
DLLS = ["Lua5.3.3r.dll", "Lua5.3.3f.dll", "lua51.dll"]


def read_exports(pe):
    rva, _size = pe.dirs["EXPORT"]
    if not rva:
        return {}
    o = pe.rva_to_off(rva)
    (_f, _t, _mj, _mn, _nrva, _ob, _nf, nn, fr, npr, orv) = struct.unpack_from(
        "<IIHHIIIIIII", pe.data, o)
    fo, no, oo = pe.rva_to_off(fr), pe.rva_to_off(npr), pe.rva_to_off(orv)
    out = {}
    for i in range(nn):
        nrva = struct.unpack_from("<I", pe.data, no + i * 4)[0]
        idx = struct.unpack_from("<H", pe.data, oo + i * 2)[0]
        erva = struct.unpack_from("<I", pe.data, fo + idx * 4)[0]
        out[pe.cstr_at_rva(nrva)] = erva
    return out


def dll_imports(pe):
    rva, _ = pe.dirs["IMPORT"]
    names, i = [], 0
    while True:
        o = pe.rva_to_off(rva + i * 20)
        oft, _ts, _fc, nrva, ft = struct.unpack_from("<IIIII", pe.data, o)
        if oft == 0 and nrva == 0 and ft == 0:
            break
        names.append(pe.cstr_at_rva(nrva))
        i += 1
    return names


def body(pe, va, limit=40):
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    off = pe.va_to_off(va)
    out = []
    for ins in md.disasm(pe.data[off:off + 240], va):
        out.append((ins.address, ins.mnemonic, ins.op_str))
        if ins.mnemonic == "ret" or len(out) >= limit:
            break
    return out


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if not (GAME / DLLS[0]).exists():
        print("Lua DLLs not present under %s" % GAME)
        return 1

    files = {}
    for name in DLLS:
        p = GAME / name
        if not p.exists():
            continue
        pe = PE(p)
        ex = read_exports(pe)
        files[name] = {
            "bytes": len(pe.data),
            "sha256": hashlib.sha256(pe.data).hexdigest(),
            "machine": "0x%04x" % pe.machine,
            "imageBase": hexva(pe.image_base),
            "exportCount": len(ex),
        }

    per = PE(GAME / "Lua5.3.3r.dll")
    rex = read_exports(per)
    fex = read_exports(PE(GAME / "Lua5.3.3f.dll")) if (GAME / "Lua5.3.3f.dll").exists() else {}

    identical = (files.get("Lua5.3.3r.dll", {}).get("sha256")
                 == files.get("Lua5.3.3f.dll", {}).get("sha256"))

    # every symbol the game imports must exist
    imp = json.loads((CENSUS_DIR / "imports.json").read_text(encoding="utf-8"))
    wanted = [s["symbol"] for s in imp["symbols"] if s["dll"] == "lua5.3.3r.dll"]
    missing = [s for s in wanted if s not in rex]

    non_stock = sorted(n for n in rex if not (
        n.startswith("lua_") or n.startswith("luaL_") or n.startswith("luaopen_")))

    # --- numeric configuration -------------------------------------------
    ev = {}
    verdict = {}

    dis = body(per, per.image_base + rex["lua_pushinteger"])
    ev["lua_pushinteger"] = ["%s %s %s" % (hexva(a), m, o) for a, m, o in dis]
    # A 64-bit argument is read as two dwords at [ebp+0xC] and [ebp+0x10].
    reads = [o for _a, m, o in dis if m == "mov" and "ebp + 0x10" in o]
    verdict["LUA_INT_TYPE"] = "LUA_INT_LONGLONG (64-bit)" if reads else \
                              "LUA_INT_INT (32-bit) -- NON-DEFAULT"
    # TValue size from the `add [reg], N` that advances L->top
    tv = [o for _a, m, o in dis if m == "add" and "0x10" in o]
    verdict["sizeof(TValue)"] = 16 if tv else "unknown"

    dis = body(per, per.image_base + rex["lua_pushnumber"])
    ev["lua_pushnumber"] = ["%s %s %s" % (hexva(a), m, o) for a, m, o in dis]
    has_sd = any(m == "movsd" for _a, m, _o in dis)
    has_ss = any(m == "movss" for _a, m, _o in dis)
    verdict["LUA_FLOAT_TYPE"] = ("LUA_FLOAT_DOUBLE (double)" if has_sd else
                                 "LUA_FLOAT_FLOAT (float) -- NON-DEFAULT" if has_ss
                                 else "unknown")

    dis = body(per, per.image_base + rex["lua_gettop"])
    ev["lua_gettop"] = ["%s %s %s" % (hexva(a), m, o) for a, m, o in dis]
    sar = [o for _a, m, o in dis if m == "sar"]
    verdict["gettopShift"] = sar[0] if sar else None

    # calling convention: cdecl callees end in a plain `ret`
    conv = {}
    for fn in ("lua_gettop", "lua_absindex", "lua_type", "lua_touserdata",
               "lua_pushstring", "lua_rotate", "lua_newuserdata",
               "lua_pushcclosure"):
        if fn not in rex:
            continue
        d = body(per, per.image_base + rex[fn], limit=60)
        rets = [o for _a, m, o in d if m == "ret"]
        conv[fn] = "cdecl (plain ret)" if rets and not rets[-1] else \
                   "stdcall (ret %s)" % rets[-1] if rets else "no ret found"

    stock = (not missing and not non_stock and identical
             and verdict["LUA_INT_TYPE"].startswith("LUA_INT_LONGLONG")
             and verdict["LUA_FLOAT_TYPE"].startswith("LUA_FLOAT_DOUBLE")
             and verdict["sizeof(TValue)"] == 16)

    result = {
        "files": files,
        "rAndFAreByteIdentical": identical,
        "exportSetsIdentical": set(rex) == set(fex) if fex else None,
        "importedSymbols": len(wanted),
        "missingFromDll": missing,
        "nonStockExports": non_stock,
        "dllImports": dll_imports(per),
        "numericConfig": verdict,
        "callingConvention": conv,
        "evidence": ev,
        "verdict": ("stock upstream Lua 5.3.3, default numeric config -- an "
                    "upstream 5.3.3 wasm build is a safe drop-in"
                    if stock else "NOT stock: see fields above"),
        "isStock": stock,
        "buildWarning": "do NOT set LUA_32BITS: it switches lua_Integer to int "
                        "and lua_Number to float, silently halving both",
    }
    (OUT_DIR / "lua-abi.json").write_text(json.dumps(result, indent=1),
                                          encoding="utf-8")

    for n, f in files.items():
        print("%-16s %8d bytes  %s  exports=%d  sha256=%s" % (
            n, f["bytes"], f["machine"], f["exportCount"], f["sha256"][:16]))
    print()
    print("r and f byte-identical      : %s" % identical)
    print("imported symbols present    : %d/%d (missing %s)" % (
        len(wanted) - len(missing), len(wanted), missing or "none"))
    print("non-stock exports           : %d %s" % (len(non_stock), non_stock[:10]))
    print("DLL links against           : %s" % ", ".join(dll_imports(per)[:4]) + " ...")
    print()
    for k, v in verdict.items():
        print("  %-18s %s" % (k, v))
    print()
    for k, v in conv.items():
        print("  %-18s %s" % (k, v))
    print()
    print("VERDICT: %s" % result["verdict"])
    print("WARNING: %s" % result["buildWarning"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
