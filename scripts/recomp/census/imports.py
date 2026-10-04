"""Full import census: every DLL, every symbol, IAT slot VA, and how many
call sites in .text actually reference each slot.

Two independent counting methods are run and compared:

  A) exact-encoding byte scan of .text for the x86 forms that can reference an
     absolute IAT slot:
        FF 15 imm32   call dword ptr [imm32]
        FF 25 imm32   jmp  dword ptr [imm32]      (MSVC ILT thunk)
        FF 35 imm32   push dword ptr [imm32]
        8B /r imm32   mov  reg, dword ptr [imm32] (function pointer load)
        A1 imm32      mov  eax, dword ptr [imm32]
     A hit only counts when imm32 is exactly a known IAT slot VA, which makes
     false positives statistically negligible (see report).

  B) capstone linear sweep of .text, collecting every instruction whose operand
     text contains an absolute [0x...] matching an IAT slot VA.

MSVC routes most calls through an ILT thunk (`jmp dword ptr [__imp_X]`), so the
*effective* call-site count for an import is:
     direct call [IAT]  +  calls/jumps that target one of its thunks
Both are resolved here; "callSites" is the effective total.
"""

import json
import re
import struct
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"


# ---------------------------------------------------------------- imports ---
def parse_imports(pe):
    """Classic IMAGE_IMPORT_DESCRIPTOR walk."""
    rva, size = pe.dirs.get("IMPORT", (0, 0))
    dlls = []
    if not rva:
        return dlls
    off = pe.rva_to_off(rva)
    i = 0
    while True:
        base = off + i * 20
        oft_rva, ts, fwd, name_rva, iat_rva = struct.unpack_from("<IIIII", pe.data, base)
        if not (oft_rva or name_rva or iat_rva):
            break
        name = pe.cstr_at_rva(name_rva) or "?"
        syms = []
        # Prefer the OriginalFirstThunk (names survive binding); fall back to IAT.
        lookup = oft_rva or iat_rva
        j = 0
        while True:
            ent = pe.u32_at_rva(lookup + j * 4)
            if ent is None or ent == 0:
                break
            slot_rva = iat_rva + j * 4
            if ent & 0x80000000:
                syms.append({
                    "name": None,
                    "ordinal": ent & 0xFFFF,
                    "hint": None,
                    "byOrdinal": True,
                    "iatRva": slot_rva,
                    "iatVa": pe.image_base + slot_rva,
                })
            else:
                hint = struct.unpack_from("<H", pe.data, pe.rva_to_off(ent))[0]
                syms.append({
                    "name": pe.cstr_at_rva(ent + 2),
                    "ordinal": None,
                    "hint": hint,
                    "byOrdinal": False,
                    "iatRva": slot_rva,
                    "iatVa": pe.image_base + slot_rva,
                })
            j += 1
        dlls.append({
            "dll": name,
            "descriptorOffset": base,
            "originalFirstThunkRva": oft_rva,
            "firstThunkRva": iat_rva,
            "timeDateStamp": ts,
            "forwarderChain": fwd,
            "bound": ts not in (0, 0xFFFFFFFF),
            "symbols": syms,
        })
        i += 1
    return dlls


def parse_delay_imports(pe):
    rva, size = pe.dirs.get("DELAY_IMPORT", (0, 0))
    if not rva:
        return []
    off = pe.rva_to_off(rva)
    out = []
    i = 0
    while True:
        base = off + i * 32
        (attrs, name_rva, hmod_rva, iat_rva, oft_rva, bound_rva, unload_rva,
         tstamp) = struct.unpack_from("<IIIIIIII", pe.data, base)
        if not (name_rva or iat_rva):
            break
        # attrs bit0 set => RVAs; otherwise VAs (old linkers)
        def fix(v):
            return v if (attrs & 1) else (v - pe.image_base if v else 0)
        name_rva, iat_rva, oft_rva = fix(name_rva), fix(iat_rva), fix(oft_rva)
        syms = []
        lookup = oft_rva or iat_rva
        j = 0
        while True:
            ent = pe.u32_at_rva(lookup + j * 4)
            if ent is None or ent == 0:
                break
            slot_rva = iat_rva + j * 4
            if ent & 0x80000000:
                syms.append({"name": None, "ordinal": ent & 0xFFFF, "byOrdinal": True,
                             "iatRva": slot_rva, "iatVa": pe.image_base + slot_rva, "hint": None})
            else:
                syms.append({"name": pe.cstr_at_rva(ent + 2), "ordinal": None, "byOrdinal": False,
                             "iatRva": slot_rva, "iatVa": pe.image_base + slot_rva,
                             "hint": struct.unpack_from("<H", pe.data, pe.rva_to_off(ent))[0]})
            j += 1
        out.append({"dll": pe.cstr_at_rva(name_rva), "delayLoad": True,
                    "firstThunkRva": iat_rva, "symbols": syms})
        i += 1
    return out


def parse_bound_imports(pe):
    rva, size = pe.dirs.get("BOUND_IMPORT", (0, 0))
    if not rva or not size:
        return []
    # BOUND_IMPORT lives in the headers, addressed as a plain file offset region
    off = pe.rva_to_off(rva)
    if off is None:
        off = rva
    out = []
    i = 0
    while True:
        base = off + i * 8
        ts, name_off, nforw = struct.unpack_from("<IHH", pe.data, base)
        if not (ts or name_off or nforw):
            break
        end = pe.data.find(b"\0", off + name_off)
        out.append({"dll": pe.data[off + name_off:end].decode("ascii", "replace"),
                    "timeDateStamp": ts, "forwarders": nforw})
        i += 1 + nforw
    return out


# ------------------------------------------------- method A: byte scanning ---
MOV_REG_ABS = {0x05: "eax", 0x0D: "ecx", 0x15: "edx", 0x1D: "ebx",
               0x25: "esp", 0x2D: "ebp", 0x35: "esi", 0x3D: "edi"}


def scan_iat_refs(pe, slot_by_va):
    """Exact-encoding scan of .text for absolute references to IAT slots."""
    text = pe.section(".text")
    lo = text.raw_offset
    hi = text.raw_offset + text.raw_size
    d = pe.data
    base_va = pe.image_base + text.rva
    refs = []  # (kind, siteVa, slotVa)
    thunks = {}  # thunkVa -> slotVa   (FF 25 => jmp [IAT])

    i = lo
    while i < hi - 5:
        b = d[i]
        if b == 0xFF:
            b1 = d[i + 1]
            if b1 in (0x15, 0x25, 0x35):
                imm = struct.unpack_from("<I", d, i + 2)[0]
                if imm in slot_by_va:
                    site_va = base_va + (i - lo)
                    kind = {0x15: "call_indirect", 0x25: "jmp_thunk", 0x35: "push_ptr"}[b1]
                    refs.append((kind, site_va, imm))
                    if b1 == 0x25:
                        thunks[site_va] = imm
                    i += 6
                    continue
        elif b == 0x8B:
            b1 = d[i + 1]
            if b1 in MOV_REG_ABS:
                imm = struct.unpack_from("<I", d, i + 2)[0]
                if imm in slot_by_va:
                    refs.append(("mov_ptr", base_va + (i - lo), imm))
                    i += 6
                    continue
        elif b == 0xA1:
            imm = struct.unpack_from("<I", d, i + 1)[0]
            if imm in slot_by_va:
                refs.append(("mov_ptr", base_va + (i - lo), imm))
                i += 5
                continue
        i += 1
    return refs, thunks


def scan_calls_to(pe, target_vas):
    """Find E8/E9 rel32 sites whose computed target is exactly in target_vas."""
    text = pe.section(".text")
    lo, hi = text.raw_offset, text.raw_offset + text.raw_size
    d = pe.data
    base_va = pe.image_base + text.rva
    hits = defaultdict(list)  # targetVa -> [(kind, siteVa)]
    i = lo
    while i < hi - 5:
        b = d[i]
        if b == 0xE8 or b == 0xE9:
            rel = struct.unpack_from("<i", d, i + 1)[0]
            site_va = base_va + (i - lo)
            tgt = (site_va + 5 + rel) & 0xFFFFFFFF
            if tgt in target_vas:
                hits[tgt].append(("call_rel32" if b == 0xE8 else "jmp_rel32", site_va))
        i += 1
    return hits


# --------------------------------------------- method B: capstone linear -----
ABS_MEM = re.compile(r"\[0x([0-9a-f]+)\]")


def capstone_sweep(pe, slot_by_va, thunk_vas):
    try:
        from capstone import Cs, CS_ARCH_X86, CS_MODE_32
    except ImportError:
        return None
    text = pe.section(".text")
    code = pe.data[text.raw_offset:text.raw_offset + text.raw_size]
    base_va = pe.image_base + text.rva
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = False
    per_slot = defaultdict(lambda: defaultdict(int))
    thunk_call_hits = defaultdict(int)
    total_insns = 0
    decoded_bytes = 0
    pos = 0
    n = len(code)
    while pos < n:
        got = False
        for addr, size, mnem, ops in md.disasm_lite(code[pos:], base_va + pos):
            got = True
            total_insns += 1
            decoded_bytes += size
            if "0x" in ops:
                if mnem in ("call", "jmp", "push", "mov", "lea"):
                    m = ABS_MEM.search(ops)
                    if m:
                        v = int(m.group(1), 16)
                        if v in slot_by_va:
                            per_slot[v][mnem] += 1
                    elif mnem in ("call", "jmp"):
                        # direct rel32 target
                        try:
                            v = int(ops, 16)
                        except ValueError:
                            v = None
                        if v is not None and v in thunk_vas:
                            thunk_call_hits[v] += 1
            pos = (addr - base_va) + size
        if not got:
            pos += 1
    return {
        "instructions": total_insns,
        "decodedBytes": decoded_bytes,
        "perSlot": {hex(k): dict(v) for k, v in per_slot.items()},
        "perSlotTotals": {k: sum(v.values()) for k, v in per_slot.items()},
        "thunkCallHits": dict(thunk_call_hits),
    }


# ------------------------------------------------------------------- main ---
def main():
    pe = PE(sys.argv[1] if len(sys.argv) > 1 else default_target())
    dlls = parse_imports(pe)
    delay = parse_delay_imports(pe)
    bound = parse_bound_imports(pe)

    slot_by_va = {}
    for group in list(dlls) + list(delay):
        for s in group["symbols"]:
            slot_by_va[s["iatVa"]] = (group["dll"], s)

    refs, thunks = scan_iat_refs(pe, slot_by_va)
    thunk_hits = scan_calls_to(pe, set(thunks.keys()))

    # aggregate per slot
    agg = defaultdict(lambda: {"call_indirect": 0, "jmp_thunk": 0, "push_ptr": 0,
                               "mov_ptr": 0, "thunkCallRel32": 0, "thunkJmpRel32": 0,
                               "thunks": []})
    for kind, site, slot in refs:
        agg[slot][kind] += 1
        if kind == "jmp_thunk":
            agg[slot]["thunks"].append(site)
    for tva, slot in thunks.items():
        for kind, _site in thunk_hits.get(tva, []):
            if kind == "call_rel32":
                agg[slot]["thunkCallRel32"] += 1
            else:
                agg[slot]["thunkJmpRel32"] += 1

    cap = capstone_sweep(pe, slot_by_va, set(thunks.keys()))

    rows = []
    for va, (dll, sym) in sorted(slot_by_va.items()):
        a = agg.get(va, None)
        a = a if a else {"call_indirect": 0, "jmp_thunk": 0, "push_ptr": 0, "mov_ptr": 0,
                         "thunkCallRel32": 0, "thunkJmpRel32": 0, "thunks": []}
        effective = a["call_indirect"] + a["thunkCallRel32"] + a["thunkJmpRel32"]
        rows.append({
            "dll": dll.lower(),
            "symbol": sym["name"] or ("#%d" % sym["ordinal"]),
            "byOrdinal": sym["byOrdinal"],
            "ordinal": sym["ordinal"],
            "iatVa": "0x%08x" % va,
            "iatRva": "0x%x" % sym["iatRva"],
            "callSites": effective,
            "directCallIndirect": a["call_indirect"],
            "thunkCount": len(a["thunks"]),
            "thunkVas": ["0x%08x" % t for t in a["thunks"]],
            "callsToThunk": a["thunkCallRel32"],
            "jmpsToThunk": a["thunkJmpRel32"],
            "pushPtr": a["push_ptr"],
            "movPtr": a["mov_ptr"],
            "addressTaken": a["push_ptr"] + a["mov_ptr"],
            "capstoneAbsRefs": (cap["perSlotTotals"].get(va, 0) if cap else None),
        })

    rows.sort(key=lambda r: (-r["callSites"], r["dll"], r["symbol"]))

    result = {
        "target": str(pe.path),
        "fileSize": len(pe.data),
        "imageBase": "0x%08x" % pe.image_base,
        "entryVa": "0x%08x" % (pe.image_base + pe.entry_rva),
        "importDirectory": {"rva": "0x%x" % pe.dirs["IMPORT"][0], "size": pe.dirs["IMPORT"][1]},
        "iatDirectory": {"rva": "0x%x" % pe.dirs["IAT"][0], "size": pe.dirs["IAT"][1]},
        "delayImportDirectory": {"rva": "0x%x" % pe.dirs.get("DELAY_IMPORT", (0, 0))[0],
                                 "size": pe.dirs.get("DELAY_IMPORT", (0, 0))[1]},
        "boundImportDirectory": {"rva": "0x%x" % pe.dirs.get("BOUND_IMPORT", (0, 0))[0],
                                 "size": pe.dirs.get("BOUND_IMPORT", (0, 0))[1]},
        "dllCount": len(dlls),
        "delayDllCount": len(delay),
        "boundImports": bound,
        "symbolCount": len(slot_by_va),
        "ordinalOnlyCount": sum(1 for r in rows if r["byOrdinal"]),
        "totalIatCallSites": sum(r["callSites"] for r in rows),
        "totalThunks": len(thunks),
        "perDll": [],
        "symbols": rows,
        "capstone": ({"instructions": cap["instructions"], "decodedBytes": cap["decodedBytes"],
                      "textRawSize": pe.section(".text").raw_size} if cap else None),
    }

    by_dll = defaultdict(lambda: {"symbols": 0, "callSites": 0, "used": 0, "unused": 0,
                                  "ordinalOnly": 0, "addressTaken": 0})
    for r in rows:
        e = by_dll[r["dll"]]
        e["symbols"] += 1
        e["callSites"] += r["callSites"]
        e["addressTaken"] += r["addressTaken"]
        if r["byOrdinal"]:
            e["ordinalOnly"] += 1
        if r["callSites"] > 0:
            e["used"] += 1
        else:
            e["unused"] += 1
    result["perDll"] = sorted(
        [{"dll": k, **v} for k, v in by_dll.items()],
        key=lambda x: -x["callSites"])

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "imports.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    # cross-check report
    disagree = [r for r in rows
                if r["capstoneAbsRefs"] is not None
                and r["capstoneAbsRefs"] != (r["directCallIndirect"] + r["thunkCount"]
                                             + r["pushPtr"] + r["movPtr"])]
    print("dlls=%d symbols=%d ordinalOnly=%d thunks=%d totalCallSites=%d" % (
        len(dlls), len(slot_by_va), result["ordinalOnlyCount"], len(thunks),
        result["totalIatCallSites"]))
    if cap:
        print("capstone: %d insns, %d/%d text bytes decoded (%.2f%%)" % (
            cap["instructions"], cap["decodedBytes"], pe.section(".text").raw_size,
            100.0 * cap["decodedBytes"] / pe.section(".text").raw_size))
        print("slots where byte-scan and capstone abs-ref counts disagree: %d / %d"
              % (len(disagree), len(rows)))
        for r in disagree[:15]:
            print("   %-14s %-34s bytescan(abs)=%d capstone=%d" % (
                r["dll"], r["symbol"],
                r["directCallIndirect"] + r["thunkCount"] + r["pushPtr"] + r["movPtr"],
                r["capstoneAbsRefs"]))
    print("\nper-DLL by effective call sites:")
    for e in result["perDll"]:
        print("  %-16s syms=%-4d used=%-4d unused=%-4d callSites=%-6d addrTaken=%d" % (
            e["dll"], e["symbols"], e["used"], e["unused"], e["callSites"], e["addressTaken"]))
    print("\ntop 40 symbols by call sites:")
    for r in rows[:40]:
        print("  %-6d %-16s %-40s %s thunks=%d" % (
            r["callSites"], r["dll"], r["symbol"], r["iatVa"], r["thunkCount"]))
    print("\nwrote", OUT / "imports.json")


if __name__ == "__main__":
    main()
