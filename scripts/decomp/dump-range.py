#!/usr/bin/env python3
"""Dump detail disasm of a VA range from the PE."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM

ROOT = Path(__file__).resolve().parents[2]
PE = ROOT / "tools" / "isaac-ng.unpacked.exe"

SECTIONS = [
    (0x00401000, 0x00716134, 0x00000400, 0x00716200),  # .text
    (0x00b18000, 0x000df948, 0x00716600, 0x000dfa00),  # .rdata
    (0x00bf8000, 0x000a4aa4, 0x007f6000, 0x00069e00),  # .data
]


def va_to_off(va: int) -> int | None:
    for v, vs, raw, rs in SECTIONS:
        if v <= va < v + vs:
            delta = va - v
            if delta >= rs:
                return None
            return raw + delta
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("start", type=lambda s: int(s, 16))
    ap.add_argument("--len", dest="ln", type=lambda s: int(s, 16), default=0x800)
    args = ap.parse_args()
    buf = PE.read_bytes()
    off = va_to_off(args.start)
    if off is None:
        print("VA not mapped", file=sys.stderr)
        return 1
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    for insn in md.disasm(buf[off : off + args.ln], args.start):
        extra = ""
        if insn.mnemonic == "call" and insn.operands and insn.operands[0].type == X86_OP_IMM:
            extra = f"  ; -> 0x{insn.operands[0].imm:08x}"
        print(f"0x{insn.address:08x}  {insn.mnemonic:8s} {insn.op_str}{extra}")
    return 0


if __name__ == "__main__":
    sys.exit(main())