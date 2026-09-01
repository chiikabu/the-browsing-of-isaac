"""Static-initializer and pointer-table census in .rdata/.data.

Bears directly on whether snapshotting the PE's initialized sections is enough
to boot lifted code. It is not, if the image relies on C++ dynamic
initialisation: the on-disk bytes are the *pre-main* state, and every global
constructor in the CRT initialiser table still has to execute.

Finds contiguous runs of relocation-confirmed .text pointers. The MSVC C++
initialiser array (.CRT$XCU merged into .rdata) shows up as one such run whose
entries are all argument-less thunks; vtables show up as many shorter runs.
"""

import json
import struct
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"


def parse_reloc_set(pe):
    rva, size = pe.dirs.get("BASERELOC", (0, 0))
    off = pe.rva_to_off(rva)
    end = off + size
    s = set()
    while off < end:
        page_rva, block_size = struct.unpack_from("<II", pe.data, off)
        if block_size == 0:
            break
        for k in range((block_size - 8) // 2):
            w = struct.unpack_from("<H", pe.data, off + 8 + k * 2)[0]
            if (w >> 12) == 3:
                s.add(page_rva + (w & 0xFFF))
        off += block_size
    return s


def main():
    pe = PE(default_target())
    relocs = parse_reloc_set(pe)
    t = pe.section(".text")
    tlo = pe.image_base + t.rva
    thi = tlo + t.virtual_size

    runs_by_sec = {}
    all_runs = []
    for name in (".rdata", ".data"):
        s = pe.section(name)
        lo, hi = s.raw_offset, s.raw_offset + s.raw_size
        runs = []
        cur = None
        for i in range(lo, hi - 4, 4):
            rva_here = s.rva + (i - s.raw_offset)
            v = struct.unpack_from("<I", pe.data, i)[0]
            is_fp = (rva_here in relocs) and (tlo <= v < thi)
            if is_fp:
                if cur is None:
                    cur = [rva_here, 1]
                else:
                    cur[1] += 1
            else:
                if cur is not None:
                    runs.append(tuple(cur))
                    cur = None
        if cur is not None:
            runs.append(tuple(cur))
        runs_by_sec[name] = runs
        for r in runs:
            all_runs.append((name, r[0], r[1]))

    all_runs.sort(key=lambda x: -x[2])
    lenhist = Counter(c for _n, _s, c in all_runs)

    # A CRT initialiser entry is a thunk that takes no args and is called once.
    # Inspect the largest runs and report what their targets look like.
    def peek(va, n=8):
        off = pe.va_to_off(va)
        if off is None:
            return None
        return pe.data[off:off + n].hex()

    top = []
    for name, start_rva, count in all_runs[:15]:
        entries = []
        off = pe.rva_to_off(start_rva)
        for k in range(min(count, 6)):
            v = struct.unpack_from("<I", pe.data, off + k * 4)[0]
            entries.append({"target": "0x%08x" % v, "firstBytes": peek(v)})
        top.append({"section": name, "startVa": "0x%08x" % (pe.image_base + start_rva),
                    "entries": count, "bytes": count * 4, "sample": entries})

    result = {
        "textPointerRuns": {
            "rdataRuns": len(runs_by_sec[".rdata"]),
            "dataRuns": len(runs_by_sec[".data"]),
            "rdataPointers": sum(c for _s, c in runs_by_sec[".rdata"]),
            "dataPointers": sum(c for _s, c in runs_by_sec[".data"]),
            "runLengthHistogram": dict(sorted(lenhist.items())[:25]),
            "largestRuns": top,
        },
    }
    (OUT / "initializers.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    r = result["textPointerRuns"]
    print("relocation-confirmed .text pointers")
    print("  .rdata : %d pointers in %d contiguous runs" % (r["rdataPointers"], r["rdataRuns"]))
    print("  .data  : %d pointers in %d contiguous runs" % (r["dataPointers"], r["dataRuns"]))
    print("\nrun-length histogram (entries -> how many runs):")
    for k, v in sorted(lenhist.items())[:20]:
        print("   %4d entries : %5d runs" % (k, v))
    print("\nlargest contiguous function-pointer runs:")
    for e in top:
        print("   %-7s %s  %5d entries (%d bytes)" % (
            e["section"], e["startVa"], e["entries"], e["bytes"]))
        for s in e["sample"][:3]:
            print("        -> %s  %s" % (s["target"], s["firstBytes"]))
    print("\nwrote", OUT / "initializers.json")


if __name__ == "__main__":
    main()
