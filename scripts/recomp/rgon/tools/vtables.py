#!/usr/bin/env python3
"""A class's virtual function table in the executable, found through its RTTI.

  python scripts/recomp/rgon/tools/vtables.py <ClassName> [<ClassName> ...] [--slots N] [--json out.json]

MSVC keeps, for every polymorphic class, a type descriptor (".?AVEntity_Player@@"
in .data), complete-object locators that point at it (.rdata), and in front of
each vtable a pointer to its locator. So a class name gives its vtables, and a
slot index its function in this build -- which is how the layer finds the
virtual functions (Update, Render, TakeDamage, the collision handlers) that no
signature and no Lua registration names.

A class with several bases has several vtables; the one whose locator has
offset 0 is the primary and is listed first. Slots are read until a word that
is not the start of code.
"""
import argparse
import json
import struct
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(ROOT / "scripts" / "decomp" / "tools"))
import pe as pemod  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("classes", nargs="+")
    ap.add_argument("--slots", type=int, default=80)
    ap.add_argument("--json")
    args = ap.parse_args()
    img = pemod.PEImage()
    data = Path(pemod.PE_PATH).read_bytes()
    secs = {s.name: s for s in img.sections}
    text = img.text

    def sec_bytes(name):
        s = secs[name]
        return data[s.raw_ptr:s.raw_ptr + s.raw_size], s.va

    rdata, rdata_va = sec_bytes(".rdata")
    dat, dat_va = sec_bytes(".data")
    out = {}
    for cls in args.classes:
        found = []
        # the game's classes are in a namespace; a nested class is given as Inner@Outer
        c = cls.encode()
        for mangled in (b".?AV" + c + b"@IsaacRepentancePlus@@\0", b".?AU" + c + b"@IsaacRepentancePlus@@\0",
                        b".?AV" + c + b"@@\0", b".?AU" + c + b"@@\0"):
            at = dat.find(mangled)
            while at >= 0:
                td = dat_va + at - 8                      # the descriptor starts 8 bytes before its name
                needle = struct.pack("<I", td)
                pos = rdata.find(needle)
                while pos >= 0:
                    col = rdata_va + pos - 12             # locator: signature, offset, cdOffset, pTypeDescriptor
                    if pos >= 12 and struct.unpack_from("<I", rdata, pos - 12)[0] == 0:
                        offset = struct.unpack_from("<I", rdata, pos - 8)[0]
                        ref = rdata.find(struct.pack("<I", col))
                        while ref >= 0:
                            vt = rdata_va + ref + 4
                            slots = []
                            for i in range(args.slots):
                                o = ref + 4 + 4 * i
                                if o + 4 > len(rdata):
                                    break
                                fn = struct.unpack_from("<I", rdata, o)[0]
                                if not (text.va <= fn < text.va + text.vsize):
                                    break
                                slots.append(fn)
                            if slots:
                                found.append({"vtable": vt, "offset": offset, "slots": slots})
                            ref = rdata.find(struct.pack("<I", col), ref + 4)
                    pos = rdata.find(needle, pos + 4)
                at = dat.find(mangled, at + 1)
        found.sort(key=lambda v: (v["offset"], v["vtable"]))
        out[cls] = found
        if not found:
            print("%s: no vtable found" % cls)
        for v in found:
            print("%s: vtable 0x%08x (this offset %d), %d slot(s)" % (cls, v["vtable"], v["offset"], len(v["slots"])))
            if not args.json:
                print("  " + " ".join("%d:%08x" % (i, f) for i, f in enumerate(v["slots"])))
    if args.json:
        json.dump(out, open(args.json, "w"), indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
