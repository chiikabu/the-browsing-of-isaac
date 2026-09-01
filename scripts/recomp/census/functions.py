"""Function inventory, call graph, and data-reference map for .text.

One capstone linear sweep produces everything downstream needs, cached to
output/recomp/census/text-index.json so later passes are cheap:

  * every decoded instruction address/size (coverage measurement)
  * every rel32 call/jmp target inside .text          -> function entry points
  * every absolute immediate that lands in .rdata/.data -> data references
  * every `call/jmp dword ptr [abs]`                  -> indirect dispatch

Function entry points are the union of: rel32 call targets, the PE entry point,
exported code addresses, libepoxy resolver stubs, code addresses appearing in
.rdata/.data (vtables, dispatch tables, SEH), and post-padding prologues.
Function size is the distance to the next entry point, clamped at the first
trailing int3/nop padding run.
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
ABS_MEM = re.compile(r"\[0x([0-9a-f]+)\]")
IMM = re.compile(r"(?:^|[ ,])0x([0-9a-f]{5,8})(?:$|[ ,])")


def sweep(pe):
    from capstone import Cs, CS_ARCH_X86, CS_MODE_32
    text = pe.section(".text")
    code = pe.data[text.raw_offset:text.raw_offset + text.raw_size]
    base = pe.image_base + text.rva
    tlo, thi = base, base + text.virtual_size
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = False

    insn_at = bytearray(len(code))      # 1 where an instruction starts
    insn_size = {}
    call_targets = defaultdict(int)     # target -> count (E8 only)
    jmp_targets = defaultdict(int)      # target -> count (E9/Jcc into .text)
    call_sites = defaultdict(list)      # target -> [site]
    indirect_abs = defaultdict(int)     # [abs] -> count
    data_refs = defaultdict(list)       # imm -> [site]
    decoded = 0
    total = 0

    pos = 0
    n = len(code)
    while pos < n:
        progressed = False
        for addr, size, mnem, ops in md.disasm_lite(code[pos:], base + pos):
            progressed = True
            total += 1
            off = addr - base
            insn_at[off] = 1
            insn_size[addr] = size
            decoded += size
            if "0x" in ops:
                m = ABS_MEM.search(ops)
                if m:
                    v = int(m.group(1), 16)
                    if mnem in ("call", "jmp"):
                        indirect_abs[v] += 1
                    elif tlo > v or v >= thi:
                        data_refs[v].append(addr)
                else:
                    if mnem == "call":
                        try:
                            t = int(ops, 16)
                        except ValueError:
                            t = None
                        if t is not None and tlo <= t < thi:
                            call_targets[t] += 1
                            call_sites[t].append(addr)
                    elif mnem.startswith("j"):
                        try:
                            t = int(ops, 16)
                        except ValueError:
                            t = None
                        if t is not None and tlo <= t < thi:
                            jmp_targets[t] += 1
                    else:
                        for mm in IMM.finditer(ops):
                            v = int(mm.group(1), 16)
                            if not (tlo <= v < thi):
                                data_refs[v].append(addr)
            pos = off + size
        if not progressed:
            pos += 1
    return dict(insnAt=insn_at, insnSize=insn_size, callTargets=call_targets,
                jmpTargets=jmp_targets, callSites=call_sites,
                indirectAbs=indirect_abs, dataRefs=data_refs,
                decoded=decoded, total=total, base=base, code=code,
                tlo=tlo, thi=thi)


def code_pointers_in_data(pe, tlo, thi):
    """Aligned dwords in .rdata/.data pointing into .text (vtables, tables)."""
    hits = defaultdict(int)
    for name in (".rdata", ".data"):
        s = pe.section(name)
        if not s:
            continue
        lo, hi = s.raw_offset, s.raw_offset + s.raw_size
        for i in range(lo, hi - 4, 4):
            v = struct.unpack_from("<I", pe.data, i)[0]
            if tlo <= v < thi:
                hits[v] += 1
    return hits


def main():
    pe = PE(default_target())
    text = pe.section(".text")
    sw = sweep(pe)
    base, code = sw["base"], sw["code"]
    tlo, thi = sw["tlo"], sw["thi"]

    dataptrs = code_pointers_in_data(pe, tlo, thi)

    entries = set(sw["callTargets"])
    entries.add(pe.image_base + pe.entry_rva)
    entries |= set(dataptrs)
    # epoxy resolver stubs
    stub_file = OUT / "epoxy-stubs.json"
    epoxy_stubs = {}
    if stub_file.exists():
        epoxy_stubs = {k: int(v, 16) for k, v in
                       json.loads(stub_file.read_text(encoding="utf-8")).items()}
        entries |= set(epoxy_stubs.values())
    # exported code
    exp_file = OUT / "exports.json"
    if exp_file.exists():
        for e in json.loads(exp_file.read_text(encoding="utf-8"))["allExports"]:
            if e["section"] == ".text":
                entries.add(e["va"])

    # prologue after int3 padding: 0xCC+ then 55 8B EC / 55 89 E5 / 8B FF 55 8B EC
    pro = re.compile(rb"(?:\xcc{1,}|\x90{2,})((?:\x8b\xff)?\x55(?:\x8b\xec|\x89\xe5))")
    for m in pro.finditer(code):
        entries.add(base + m.start(1))

    entries = sorted(v for v in entries if tlo <= v < tlo + text.raw_size)

    # sizes: distance to next entry, trimmed of trailing padding
    funcs = []
    for i, va in enumerate(entries):
        end = entries[i + 1] if i + 1 < len(entries) else tlo + text.raw_size
        off = va - base
        eoff = end - base
        j = eoff
        while j > off and code[j - 1] in (0xCC, 0x90):
            j -= 1
        funcs.append({"va": va, "size": j - off, "gapSize": eoff - off})

    total_span = sum(f["gapSize"] for f in funcs)
    total_body = sum(f["size"] for f in funcs)

    index = {
        "textVaLo": "0x%08x" % tlo,
        "textVaHi": "0x%08x" % (tlo + text.raw_size),
        "textRawSize": text.raw_size,
        "textVirtualSize": text.virtual_size,
        "instructions": sw["total"],
        "decodedBytes": sw["decoded"],
        "coveragePct": round(100.0 * sw["decoded"] / text.raw_size, 4),
        "functionCount": len(funcs),
        "functionBodyBytes": total_body,
        "functionSpanBytes": total_span,
        "paddingBytes": total_span - total_body,
        "codePointersFromData": len(dataptrs),
        "distinctCallTargets": len(sw["callTargets"]),
        "indirectAbsSites": sum(sw["indirectAbs"].values()),
        "distinctIndirectAbsSlots": len(sw["indirectAbs"]),
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "functions.json").write_text(json.dumps({
        "index": index,
        "functions": [{"va": "0x%08x" % f["va"], "size": f["size"],
                       "callers": sw["callTargets"].get(f["va"], 0),
                       "dataPointers": dataptrs.get(f["va"], 0)} for f in funcs],
    }, indent=1), encoding="utf-8")

    # compact machine-readable index for later passes
    (OUT / "text-index.json").write_text(json.dumps({
        "base": base,
        "functions": [[f["va"], f["size"]] for f in funcs],
        "callTargets": {str(k): v for k, v in sw["callTargets"].items()},
        "callSites": {str(k): v for k, v in sw["callSites"].items()},
        "dataRefs": {str(k): v for k, v in sw["dataRefs"].items()},
        "indirectAbs": {str(k): v for k, v in sw["indirectAbs"].items()},
    }), encoding="utf-8")

    for k, v in index.items():
        print("%-26s %s" % (k, v))
    sizes = sorted(f["size"] for f in funcs)
    print("\nfunction size: min=%d median=%d p90=%d max=%d" % (
        sizes[0], sizes[len(sizes) // 2], sizes[int(len(sizes) * 0.9)], sizes[-1]))
    print("wrote", OUT / "functions.json", "and text-index.json")


if __name__ == "__main__":
    main()
