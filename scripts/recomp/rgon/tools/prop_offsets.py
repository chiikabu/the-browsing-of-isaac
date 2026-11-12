#!/usr/bin/env python3
"""Field offsets in this executable, read off the game's own property accessors.

  python scripts/recomp/rgon/tools/prop_offsets.py <bindings.json> <out.json>

The game registers its Lua properties with a getter and a setter each
(tools/parse_register.py lists them with their addresses). A plain getter is
`mov eax, [ecx+disp]; ret` (or movss/movzx/lea for a float, a byte, an
embedded object), so its displacement is the field's offset in v1.9.7.17 --
measured, not carried over from another version of the game. Getters that do
anything else are listed as "complex" and give no offset.

Output: { "Class": { "Property": { "offset": n, "kind": "u32|f32|u8|i8|u16|addr", "get": va, "set": va } } }
plus the registration's own data members (offsets the game pushes directly).
"""
import json
import struct
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(ROOT / "scripts" / "decomp" / "tools"))
import pe as pemod  # noqa: E402
import capstone  # noqa: E402


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    b = json.load(open(sys.argv[1]))
    img = pemod.PEImage()
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
    md.detail = True
    out, n_ok, n_complex = {}, 0, 0
    for cls, c in b.items():
        o = {}
        for name, d in c.get("data", {}).items():
            o[name] = {"offset": int(d["offset"], 16), "kind": "data"}
        for name, p in c.get("properties", {}).items():
            get = p.get("get")
            if not get:
                continue
            va = int(get, 16)
            try:
                code, _ = img.read_va(va, 24)
            except Exception:
                continue
            ins = list(md.disasm(code, va))[:3]
            entry = {"get": va, "set": int(p["set"], 16) if p.get("set") else None}
            ok = False
            if len(ins) >= 2 and ins[1].mnemonic == "ret" and len(ins[0].operands) == 2:
                src = ins[0].operands[1]
                if src.type == capstone.x86.X86_OP_MEM and ins[0].reg_name(src.mem.base) == "ecx" and src.mem.index == 0:
                    kind = {"mov": {4: "u32", 1: "u8", 2: "u16"}.get(src.size), "movss": "f32", "movzx": {1: "u8", 2: "u16"}.get(src.size),
                            "movsx": {1: "i8", 2: "i16"}.get(src.size), "lea": "addr", "fld": "f32" if src.size == 4 else "f64"}.get(ins[0].mnemonic)
                    if kind:
                        entry.update(offset=src.mem.disp, kind=kind)
                        ok = True
            elif len(ins) >= 2 and ins[0].mnemonic == "fld" and ins[1].mnemonic == "ret":
                src = ins[0].operands[0]
                if src.type == capstone.x86.X86_OP_MEM and ins[0].reg_name(src.mem.base) == "ecx":
                    entry.update(offset=src.mem.disp, kind="f32" if src.size == 4 else "f64")
                    ok = True
            if ok:
                n_ok += 1
            else:
                entry["complex"] = "; ".join("%s %s" % (i.mnemonic, i.op_str) for i in ins)
                n_complex += 1
            o[name] = entry
        if o:
            out[cls] = o
    json.dump(out, open(sys.argv[2], "w"), indent=1)
    print("%d plain getters with an offset, %d complex, %d classes" % (n_ok, n_complex, len(out)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
