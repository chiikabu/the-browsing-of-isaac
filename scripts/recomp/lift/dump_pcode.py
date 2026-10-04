"""Dump disassembly + SLEIGH p-code for a VA range (inspection tool).

    python scripts/recomp/lift/dump_pcode.py tools/isaac-ng.unpacked.exe \
        0x0040d040 0x0040d085
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import capstone                      # noqa: E402
import pypcode                       # noqa: E402
from pe import PE32                  # noqa: E402
from lift import LANG                # noqa: E402


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 2
    pe = PE32(sys.argv[1])
    start = int(sys.argv[2], 0)
    end = int(sys.argv[3], 0)
    ctx = pypcode.Context(LANG)
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)

    va = start
    while va < end:
        code = pe.read(va, 16)
        tx = ctx.translate(code, base_address=va, max_bytes=16,
                           max_instructions=1)
        ops = list(tx.ops)
        if not ops or ops[0].opcode != pypcode.OpCode.IMARK:
            print("%#010x  <undecodable>" % va)
            va += 1
            continue
        length = ops[0].inputs[0].size
        raw = pe.read(va, length)
        try:
            ins = next(md.disasm(raw, va))
            text = "%s %s" % (ins.mnemonic, ins.op_str)
        except StopIteration:
            text = "?"
        print("--- %#010x %-16s %s" % (va, raw.hex(), text))
        for op in ops[1:]:
            if op.opcode == pypcode.OpCode.IMARK:
                continue
            print("      " + pypcode.PcodePrettyPrinter.fmt_op(op))
        va += length
    return 0


if __name__ == "__main__":
    sys.exit(main())
