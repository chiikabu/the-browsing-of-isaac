"""Code pointers stored in data, recovered from the PE relocation table.

Every absolute address the loader has to fix up is listed in `.reloc`.
A HIGHLOW fixup that lives in `.rdata`/`.data` and whose stored value
lands in `.text` is a code pointer in data: a vtable slot, a jump-table
entry, a function-pointer global, or a static initialiser entry.

These are exactly the targets a dynamic `call_indirect` can reach, so
they are also the set that decides whether the dispatch table is complete.
"""

import struct
from collections import defaultdict

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pe import PE32                                    # noqa: E402


def relocations(pe: PE32):
    """Yield (fixup_va, type) for every base relocation."""
    rva, size = pe.dirs[5] if len(pe.dirs) > 5 else (0, 0)
    if not rva or not size:
        return
    base = pe.image_base
    off = rva
    end = rva + size
    while off < end - 8:
        page_rva, block_size = struct.unpack_from(
            "<II", pe.image, off)
        if block_size < 8 or off + block_size > end:
            break
        n = (block_size - 8) // 2
        for i in range(n):
            e = struct.unpack_from("<H", pe.image, off + 8 + i * 2)[0]
            typ = e >> 12
            if typ == 0:
                continue
            yield base + page_rva + (e & 0xFFF), typ
        off += block_size


def code_pointers(pe: PE32):
    """Return {section_name: [(slot_va, target_va)]} for code pointers."""
    text = pe.text()
    tlo, thi = text.vaddr, text.vaddr + text.vsize
    out = defaultdict(list)
    for va, typ in relocations(pe):
        if typ != 3:                      # IMAGE_REL_BASED_HIGHLOW
            continue
        sec = pe.section_at(va)
        if sec is None or sec.name == ".text":
            continue
        try:
            val = struct.unpack_from("<I", pe.image, va - pe.image_base)[0]
        except struct.error:
            continue
        if tlo <= val < thi:
            out[sec.name].append((va, val))
    return out


def vtable_candidates(ptrs, min_len=3):
    """Group consecutive 4-byte-strided code pointers -> vtable runs."""
    runs = []
    cur = []
    for slot, target in ptrs:
        if cur and slot == cur[-1][0] + 4:
            cur.append((slot, target))
        else:
            if len(cur) >= min_len:
                runs.append(cur)
            cur = [(slot, target)]
    if len(cur) >= min_len:
        runs.append(cur)
    return runs


if __name__ == "__main__":
    import json
    pe = PE32(sys.argv[1] if len(sys.argv) > 1
              else "tools/isaac-ng.unpacked.exe")
    cp = code_pointers(pe)
    total = sum(len(v) for v in cp.values())
    print("code pointers in data: %d" % total)
    for k, v in sorted(cp.items()):
        print("  %-8s %d" % (k, len(v)))
    allp = sorted(x for v in cp.values() for x in v)
    runs = vtable_candidates(allp)
    print("consecutive runs of >=3 (vtable candidates): %d covering %d slots"
          % (len(runs), sum(len(r) for r in runs)))
    if len(sys.argv) > 2:
        with open(sys.argv[2], "w") as fh:
            json.dump({"pointers": [[s, t] for s, t in allp],
                       "runs": [[[s, t] for s, t in r] for r in runs]}, fh)
        print("wrote", sys.argv[2])
