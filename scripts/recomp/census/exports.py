"""Export census + call-site counts for exported code.

The image exports 3226 named symbols from an .exe. Almost all are libepoxy GL
dispatch entry points, i.e. a statically-linked GL loader. The number that
matters is not "how many GL entry points exist" but "how many does the game
actually call", so every export address is counted the same way IAT slots were:
direct rel32 calls/jumps plus absolute references.
"""

import json
import re
import struct
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402
from scan import scan_all, scan_data_pointers  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"


def parse_exports(pe):
    rva, size = pe.dirs.get("EXPORT", (0, 0))
    if not rva:
        return {}, []
    off = pe.rva_to_off(rva)
    (_flags, _ts, _mj, _mn, name_rva, ordinal_base, n_funcs, n_names,
     funcs_rva, names_rva, ords_rva) = struct.unpack_from("<IIHHIIIIIII", pe.data, off)
    dll_name = pe.cstr_at_rva(name_rva)
    funcs_off = pe.rva_to_off(funcs_rva)
    names_off = pe.rva_to_off(names_rva)
    ords_off = pe.rva_to_off(ords_rva)

    by_ordinal = {}
    for i in range(n_funcs):
        f = struct.unpack_from("<I", pe.data, funcs_off + i * 4)[0]
        if f:
            by_ordinal[i] = f

    entries = []
    for i in range(n_names):
        nrva = struct.unpack_from("<I", pe.data, names_off + i * 4)[0]
        idx = struct.unpack_from("<H", pe.data, ords_off + i * 2)[0]
        frva = by_ordinal.get(idx)
        if frva is None:
            continue
        # forwarder if the RVA points back inside the export directory
        forwarded = rva <= frva < rva + size
        entries.append({
            "name": pe.cstr_at_rva(nrva),
            "ordinal": idx + ordinal_base,
            "rva": frva,
            "va": pe.image_base + frva,
            "forwarder": pe.cstr_at_rva(frva) if forwarded else None,
            "section": (pe.section_for_rva(frva).name if pe.section_for_rva(frva) else "?"),
        })
    meta = {"dllName": dll_name, "ordinalBase": ordinal_base,
            "functionCount": n_funcs, "nameCount": n_names,
            "directoryRva": rva, "directorySize": size}
    return meta, entries


def main():
    pe = PE(sys.argv[1] if len(sys.argv) > 1 else default_target())
    meta, entries = parse_exports(pe)
    va_set = {e["va"] for e in entries if not e["forwarder"]}

    # libepoxy exports GL entry points as *function pointer variables* living in
    # .data, not as code. A game call therefore looks like
    #     call dword ptr [epoxy_glDrawArrays]
    # so the meaningful count is the indirect-through-slot count, not rel32.
    refs, _thunks = scan_all(pe, va_set)
    dptr, _where = scan_data_pointers(pe, va_set)

    for e in entries:
        v = e["va"]
        r = refs.get(v, {})
        e["callIndirect"] = r.get("callIndirect", 0)
        e["jmpIndirect"] = r.get("jmpIndirect", 0)
        e["callRel32"] = r.get("callRel32", 0)
        e["jmpRel32"] = r.get("jmpRel32", 0)
        e["addressTaken"] = (r.get("pushImm", 0) + r.get("movImm", 0)
                             + r.get("pushIndirect", 0) + r.get("movIndirect", 0))
        e["callSites"] = (e["callIndirect"] + e["jmpIndirect"]
                          + e["callRel32"] + e["jmpRel32"])
        e["dataPointers"] = dptr.get(v, 0)
        e["vaHex"] = "0x%08x" % v
        e["rvaHex"] = "0x%x" % e["rva"]

    entries.sort(key=lambda e: (-e["callSites"], e["name"]))

    epoxy = [e for e in entries if e["name"].startswith("epoxy_")]
    other = [e for e in entries if not e["name"].startswith("epoxy_")]
    used_epoxy = [e for e in epoxy if e["callSites"] > 0]
    used_other = [e for e in other if e["callSites"] > 0]

    by_section = defaultdict(int)
    for e in entries:
        by_section[e["section"]] += 1

    # .text-resident epoxy resolver stubs: contiguous run of export code.
    text_rvas = sorted(e["rva"] for e in epoxy if e["section"] == ".text")
    data_rvas = sorted(e["rva"] for e in epoxy if e["section"] == ".data")
    tspan = (text_rvas[0], text_rvas[-1]) if text_rvas else (0, 0)
    dspan = (data_rvas[0], data_rvas[-1]) if data_rvas else (0, 0)

    # GL entry points grouped by API family for the shim estimate
    fam = defaultdict(lambda: {"exports": 0, "called": 0, "callSites": 0})
    for e in epoxy:
        n = e["name"][len("epoxy_"):]
        if n.startswith("glX"):
            k = "glX"
        elif n.startswith("wgl"):
            k = "wgl"
        elif n.startswith("egl"):
            k = "egl"
        elif n.startswith("gl"):
            k = "gl"
        else:
            k = "epoxy-internal"
        fam[k]["exports"] += 1
        if e["callSites"]:
            fam[k]["called"] += 1
            fam[k]["callSites"] += e["callSites"]

    result = {
        "meta": meta,
        "totalExports": len(entries),
        "exportsBySection": dict(by_section),
        "epoxyExports": len(epoxy),
        "epoxyCalled": len(used_epoxy),
        "epoxyCallSites": sum(e["callSites"] for e in epoxy),
        "epoxyTextStubSpan": {"lo": "0x%x" % tspan[0], "hi": "0x%x" % tspan[1],
                              "bytes": tspan[1] - tspan[0],
                              "count": len(text_rvas)},
        "epoxyDataSlotSpan": {"lo": "0x%x" % dspan[0], "hi": "0x%x" % dspan[1],
                              "bytes": dspan[1] - dspan[0] + 4,
                              "count": len(data_rvas)},
        "families": {k: v for k, v in sorted(fam.items())},
        "otherExports": len(other),
        "otherCalled": len(used_other),
        "calledEpoxy": [{"name": e["name"], "callSites": e["callSites"],
                         "callIndirect": e["callIndirect"], "va": e["vaHex"],
                         "section": e["section"], "dataPointers": e["dataPointers"],
                         "addressTaken": e["addressTaken"]}
                        for e in used_epoxy],
        "nonEpoxyExports": [{"name": e["name"], "callSites": e["callSites"],
                             "va": e["vaHex"], "section": e["section"],
                             "forwarder": e["forwarder"]} for e in other],
        "allExports": entries,
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "exports.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    print("export dll name  :", meta["dllName"])
    print("total exports    : %d (named %d, funcs %d)" % (
        len(entries), meta["nameCount"], meta["functionCount"]))
    print("exports by section:", dict(by_section))
    print("epoxy_* exports  : %d" % len(epoxy))
    print("  actually called: %d  (call sites %d)" % (len(used_epoxy), result["epoxyCallSites"]))
    print("  .text stubs    : %d in 0x%x..0x%x (%d bytes)" % (
        len(text_rvas), tspan[0], tspan[1], tspan[1] - tspan[0]))
    print("  .data ptr slots: %d in 0x%x..0x%x (%d bytes)" % (
        len(data_rvas), dspan[0], dspan[1], dspan[1] - dspan[0] + 4))
    print("families:")
    for k, v in sorted(fam.items()):
        print("   %-16s exports=%-6d called=%-5d callSites=%d" % (
            k, v["exports"], v["called"], v["callSites"]))
    print("non-epoxy exports: %d (called %d)" % (len(other), len(used_other)))
    print("\ntop 60 called GL entry points:")
    for e in used_epoxy[:60]:
        print("   %-6d %-46s %s %s" % (e["callSites"], e["name"], e["vaHex"], e["section"]))
    print("\nwrote", OUT / "exports.json")


if __name__ == "__main__":
    main()
