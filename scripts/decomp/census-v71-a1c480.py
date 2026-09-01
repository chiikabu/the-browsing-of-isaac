#!/usr/bin/env python3
"""v71 census: decode 0x00a1c480 (first cc-separated body past the
0xa1a730 SEH giant). Linear decode with Capstone; halt != empty.
Reports insns/E8/IND/fs:[0]/cookie/exits + caller census.

Usage: python scripts/decomp/census-v71-a1c480.py
"""
from __future__ import annotations

import struct
import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_MEM, X86_OP_IMM, X86_OP_REG

ROOT = Path(__file__).resolve().parents[2]
PE = ROOT / "tools" / "isaac-ng.unpacked.exe"

TEXT_VA = 0x00401000
TEXT_RAW = 0x00000400
TEXT_SIZE = 0x00716134

TARGET = int(sys.argv[1], 16) if len(sys.argv) > 1 else 0x00A1C480


def va_to_raw(va: int) -> int:
    return TEXT_RAW + (va - TEXT_VA)


def main() -> int:
    buf = PE.read_bytes()
    data = buf[TEXT_RAW : TEXT_RAW + TEXT_SIZE]
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True

    off = va_to_raw(TARGET)
    # ---- linear decode from TARGET through real ret ----
    insns = []
    e8_calls = []          # direct call targets
    ind_calls = 0          # call reg / call [mem]
    fs_sites = 0
    cookie_refs = 0        # __security_cookie global refs
    mem_ops = []
    rets = []              # (site_va, size, imm16)
    for insn in md.disasm(buf[off : off + 0x20000], TARGET):
        insns.append(insn)
        m = insn.mnemonic
        if m == "call":
            if len(insn.operands) == 1 and insn.operands[0].type == X86_OP_IMM:
                e8_calls.append(insn.operands[0].imm)
            else:
                ind_calls += 1
        if "fs:" in insn.op_str:
            fs_sites += 1
        for op in insn.operands:
            if op.type == X86_OP_MEM and op.mem.base == 0 and op.mem.index == 0:
                disp = op.mem.disp
                if 0x00A00000 <= disp < 0x00C00000:
                    if disp >= 0x00B00000:
                        cookie_refs += 1
                    mem_ops.append((insn.address, insn.mnemonic + " " + insn.op_str))
        if m == "ret":
            imm = 0
            if len(insn.operands) == 1 and insn.operands[0].type == X86_OP_IMM:
                imm = insn.operands[0].imm
            rets.append((insn.address, insn.size, imm))

    if not rets:
        print(f"NO RET within window from {TARGET:#x}")
        return 1

    print(f"=== body {TARGET:#x}: {len(insns)} insns decoded ===")
    print(f"e8={len(e8_calls)} indirect={ind_calls} fs:[0]={fs_sites} globrefs={cookie_refs}")
    print("ret sites:")
    for rva, rsz, rimm in rets:
        nxt = buf[rva - 0x400C00 + rsz : rva - 0x400C00 + rsz + 16]
        print(f"  {rva:#010x} ret {rimm:#x} | next bytes: {nxt[:16].hex()}")
    uniq = sorted(set(e8_calls))
    print(f"unique callees ({len(uniq)}): " + ", ".join(f"{t:#x}" for t in uniq[:40]))

    # ---- caller census over full .text ----
    callers = []
    i = 0
    pack = struct.pack("<I", TARGET)
    while True:
        j = data.find(b"\xe8", i)
        if j < 0 or j + 5 > TEXT_SIZE:
            break
        rel = struct.unpack_from("<i", data, j + 1)[0]
        site_va = TEXT_VA + j
        if site_va + 5 + rel == TARGET:
            callers.append(site_va)
        i = j + 1
    print(f"direct E8 callers ({len(callers)}):")
    for c in callers:
        print(f"  {c:#010x}")

    # jmp tails (e9 rel32)
    jmps = []
    i = 0
    while True:
        j = data.find(b"\xe9", i)
        if j < 0 or j + 5 > TEXT_SIZE:
            break
        rel = struct.unpack_from("<i", data, j + 1)[0]
        site_va = TEXT_VA + j
        if site_va + 5 + rel == TARGET:
            jmps.append(site_va)
        i = j + 1
    if jmps:
        print(f"jmp tails ({len(jmps)}): " + ", ".join(f"{c:#x}" for c in jmps))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
