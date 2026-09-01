#!/usr/bin/env python3
"""Band census: enumerate every body in a VA band, classify, find callers.

Linear-decode the band with resync; split bodies at ret boundaries
(stop-at-ret + skip int3/pad); for each body report E8 targets, indirect
calls, mem-store count. Then scan the whole .text for direct rel32 caller
sites of each body start.
"""
from __future__ import annotations

import argparse
import struct
import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM, X86_OP_MEM

ROOT = Path(__file__).resolve().parents[2]
PE = ROOT / "tools" / "isaac-ng.unpacked.exe"

# .text raw 0x400, vaddr 0x401000 vsize 0x716134; .rdata raw 0x716600
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


def decode_from(buf: bytes, va: int, limit: int = 512) -> list:
    """Linear decode from va; the FIRST byte must decode (no resync before
    the first insn — kills mid-body false starts).  Stop AT the first ret."""
    off = va_to_off(va)
    if off is None:
        return []
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    insns = []
    i = 0
    while i < limit:
        got = list(md.disasm(buf[off + i : off + i + 16], va + i, count=1))
        if not got:
            if not insns:
                return []  # first byte undecodable -> not a body start
            i += 1
            continue
        insn = got[0]
        insns.append(insn)
        i += insn.size
        if insn.mnemonic in ("ret", "retn"):
            break
    return insns


def classify(insns: list) -> dict:
    e8 = []
    ind = []
    stores = []
    rets = []
    # Memory destination op0 = a STORE for every mnemonic except the
    # read-only forms (cmp/test compare, push pushes a loaded value, lea
    # never writes memory). add/sub/inc/dec/or/and/xor/etc with a MEM
    # first operand are read-modify-WRITE stores just like mov.
    NO_WRITE = {"cmp", "test", "push", "lea"}
    for insn in insns:
        if insn.mnemonic == "call":
            if insn.operands and insn.operands[0].type == X86_OP_IMM:
                e8.append((insn.address, insn.operands[0].imm))
            else:
                ind.append((insn.address, insn.op_str))
        if insn.mnemonic in ("ret", "retn"):
            rets.append(insn.address)
        if insn.operands and insn.operands[0].type == X86_OP_MEM:
            if insn.mnemonic not in NO_WRITE:
                stores.append((insn.address, insn.op_str))
    return {
        "start": insns[0].address if insns else None,
        "end": insns[-1].address + insns[-1].size if insns else None,
        "insns": len(insns),
        "e8": e8,
        "indirect": ind,
        "stores": stores,
        "rets": rets,
    }


def find_bodies(buf: bytes, band_va: int, band_len: int) -> list:
    """Walk the band; body starts = band start + any address right after
    an int3 run + any address right after a decoded ret.  Dedupe; decode
    each candidate to its first ret."""
    off = va_to_off(band_va)
    starts = {band_va}
    # scan for cc (int3) padding followed by code; also find rets via a
    # full linear decode of the band (resync per byte)
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    j = 0
    n = band_len
    while j < n:
        b = buf[off + j]
        if b == 0xCC:
            k = j
            while k < n and buf[off + k] == 0xCC:
                k += 1
            while k < n and buf[off + k] == 0x90:  # align nops
                k += 1
            if k < n:
                starts.add(band_va + k)
            j = k
            continue
        # try decode one instruction
        got = list(md.disasm(buf[off + j : off + j + 16], band_va + j, count=1))
        if got:
            insn = got[0]
            if insn.mnemonic in ("ret", "retn"):
                nxt = band_va + j + insn.size
                if nxt < band_va + n:
                    starts.add(nxt)
            j += insn.size
        else:
            j += 1
    # decode each candidate body, stop at first ret
    bodies = []
    for s in sorted(starts):
        insns = decode_from(buf, s, limit=4096)
        if not insns:
            continue
        c = classify(insns)
        bodies.append(c)
    return bodies


def all_callers(buf: bytes) -> dict:
    """One linear pass over .text: target VA -> list of direct E8 sites."""
    text_va, text_vs, text_raw, text_rs = SECTIONS[0]
    text = buf[text_raw : text_raw + text_rs]
    out: dict[int, list] = {}
    i = 0
    n = len(text)
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    while i < n - 5:
        b = text[i]
        if b == 0xE8:
            rel = struct.unpack_from("<i", text, i + 1)[0]
            tgt = text_va + i + 5 + rel
            out.setdefault(tgt, []).append(text_va + i)
            i += 5
            continue
        got = list(md.disasm(text[i : i + 16], text_va + i, count=1))
        if got:
            i += got[0].size
        else:
            i += 1
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("band_va", type=lambda s: int(s, 16))
    ap.add_argument("--len", dest="band_len", type=lambda s: int(s, 16), default=0x3b00)
    args = ap.parse_args()
    buf = PE.read_bytes()
    callers = all_callers(buf)
    bodies = find_bodies(buf, args.band_va, args.band_len)
    prev_end = args.band_va
    for b in bodies:
        if b["start"] < prev_end:
            continue
        prev_end = b["end"]
        cls = callers.get(b["start"], [])
        print(
            f"0x{b['start']:08x} end 0x{b['end']:08x} insns {b['insns']} "
            f"E8 {len(b['e8'])} ind {len(b['indirect'])} stores {len(b['stores'])} "
            f"rets {len(b['rets'])} callers {len(cls)}"
        )
        for site, tgt in b["e8"]:
            print(f"    E8 0x{site:08x} -> 0x{tgt:08x}")
        for site, op in b["indirect"]:
            print(f"    IND 0x{site:08x} {op}")
        if b["stores"]:
            print(f"    stores: " + "; ".join(f"0x{s:08x} {o}" for s, o in b["stores"][:12]))
        if cls:
            print("    callers: " + " ".join(f"0x{c:08x}" for c in cls))
    return 0


if __name__ == "__main__":
    sys.exit(main())