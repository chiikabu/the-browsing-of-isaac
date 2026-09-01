#!/usr/bin/env python3
"""v71 bounded body stats: decode [START,END) exactly, count shape facts,
caller census, and locate the next cc-separated body after END.

Usage: python scripts/decomp/census-v71-bodies.py
"""
from __future__ import annotations

import struct
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM

ROOT = Path(__file__).resolve().parents[2]
PE = ROOT / "tools" / "isaac-ng.unpacked.exe"

TEXT_VA = 0x00401000
TEXT_RAW = 0x00000400
TEXT_SIZE = 0x00716134


def va_to_raw(va: int) -> int:
    return TEXT_RAW + (va - TEXT_VA)


def body_stats(buf: bytes, md, start: int, end: int) -> None:
    raw = va_to_raw(start)
    n_bytes = end - start
    insns = list(md.disasm(buf[raw : raw + n_bytes], start))
    covered = insns[-1].address + insns[-1].size - start if insns else 0
    e8 = []
    ind = 0
    fs = 0
    cookie = 0
    handler_push = []
    rets = []
    for insn in insns:
        m = insn.mnemonic
        if m == "call":
            ops = insn.operands
            if len(ops) == 1 and ops[0].type == X86_OP_IMM:
                e8.append(ops[0].imm)
            else:
                ind += 1
        if "fs:" in insn.op_str:
            fs += 1
        if "[0xbf93b4]" in insn.op_str:
            cookie += 1
        if m == "push" and insn.op_str.startswith("0xb1"):
            handler_push.append((insn.address, insn.op_str))
        if m == "ret":
            imm = 0
            if len(insn.operands) == 1 and insn.operands[0].type == X86_OP_IMM:
                imm = insn.operands[0].imm
            rets.append((insn.address, imm))
    uniq = sorted(set(e8))
    print(f"--- body {start:#010x} .. {end:#010x} (len {n_bytes}) ---")
    print(f"insns={len(insns)} decoded_cover={covered:#x} e8={len(e8)} "
          f"uniq_e8={len(uniq)} ind={ind} fs:[0]={fs} cookie_refs={cookie}")
    print("rets: " + ", ".join(f"{a:#x}(ret {i:#x})" for a, i in rets))
    if handler_push:
        print("SEH handlers: " + ", ".join(f"{a:#x}:{o}" for a, o in handler_push))
    print("callees: " + ", ".join(f"{t:#x}" for t in uniq[:30]))
    # callers
    data = buf[TEXT_RAW : TEXT_RAW + TEXT_SIZE]
    callers = []
    i = 0
    while True:
        j = data.find(b"\xe8", i)
        if j < 0 or j + 5 > TEXT_SIZE:
            break
        rel = struct.unpack_from("<i", data, j + 1)[0]
        site = TEXT_VA + j
        if site + 5 + rel == start:
            callers.append(site)
        i = j + 1
    jmps = []
    i = 0
    while True:
        j = data.find(b"\xe9", i)
        if j < 0 or j + 5 > TEXT_SIZE:
            break
        rel = struct.unpack_from("<i", data, j + 1)[0]
        site = TEXT_VA + j
        if site + 5 + rel == start:
            jmps.append(site)
        i = j + 1
    print(f"direct_e8_callers={len(callers)} "
          f"({min(callers):#010x}..{max(callers):#010x})" if callers else
          "direct_e8_callers=0")
    for c in callers:
        print(f"    {c:#010x}")
    if jmps:
        print("jmp_tails: " + ", ".join(f"{c:#x}" for c in jmps))


def next_body_after(buf: bytes, end: int, limit: int = 0x800) -> int:
    """First byte >= end that begins a `55 8b ec` prologue preceded by >=2 cc."""
    raw = va_to_raw(end)
    window = buf[raw : raw + limit]
    i = 0
    while i < len(window) - 3:
        if window[i] == 0xCC and window[i + 1] == 0xCC \
                and window[i + 2 : i + 5] == b"\x55\x8b\xec":
            return end + i + 2
        i += 1
    return 0


def main() -> int:
    buf = PE.read_bytes()
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True

    A_START, A_END = 0x00A1C480, 0x00A1C7CA   # final ret 0x10 @0xa1c7c8 (+2)
    body_stats(buf, md, A_START, A_END)
    nb = next_body_after(buf, A_END)
    print(f"next cc-separated body after A: {nb:#010x}" if nb else
          "no next body found after A")

    # body B: starts nb; find its final ret: scan rets until cc-pad/prologue
    if nb:
        raw = va_to_raw(nb)
        last_ret_end = None
        rets = []
        for insn in md.disasm(buf[raw : raw + 0x2000], nb):
            if insn.mnemonic == "ret":
                sz = insn.size
                imm = insn.operands[0].imm if (insn.operands and
                                               insn.operands[0].type == X86_OP_IMM) else 0
                rets.append((insn.address, sz, imm))
                nxt = buf[va_to_raw(insn.address + sz) : va_to_raw(insn.address + sz) + 8]
                if nxt[:2] == b"\xcc\xcc":
                    last_ret_end = (insn.address, sz, imm)
                    break
        print(f"B rets(cc-terminated): {[(hex(a), hex(i)) for a, s, i in rets]}")
        if last_ret_end:
            b_end = last_ret_end[0] + last_ret_end[1]
            body_stats(buf, md, nb, b_end)
            nc = next_body_after(buf, b_end)
            print(f"next cc-separated body after B: {nc:#010x}" if nc else
                  "no next body within window after B")
            # show what follows B end (tables?)
            tail = buf[va_to_raw(b_end) : va_to_raw(b_end) + 48]
            print(f"bytes after B end: {tail.hex()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
