#!/usr/bin/env python3
"""v71 exact body stats with byte-resync decode over true bounds.
Usage: python scripts/decomp/census-v71-stats.py
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


def resync_stats(buf: bytes, md, start: int, end: int) -> dict:
    """Deterministic linear decode: consume one insn at pos, else skip 1."""
    raw = va_to_raw(start)
    span = end - start
    insns = []
    e8 = []
    ind = 0
    fs = 0
    cookie = 0
    handlers = []
    rets = []
    resyncs = 0
    pos = 0
    while pos < span:
        got = None
        for insn in md.disasm(buf[raw + pos : raw + span + 16], start + pos):
            got = insn
            break
        if got is None:
            pos += 1
            resyncs += 1
            continue
        insns.append(got)
        m = got.mnemonic
        ops = got.operands
        if m == "call":
            if len(ops) == 1 and ops[0].type == X86_OP_IMM:
                e8.append(ops[0].imm)
            else:
                ind += 1
        if "fs:" in got.op_str:
            fs += 1
        if "[0xbf93b4]" in got.op_str:
            cookie += 1
        if m == "push" and got.op_str.startswith("0xb1"):
            handlers.append((got.address, int(got.op_str, 16)))
        if m == "ret":
            imm = 0
            if len(ops) == 1 and ops[0].type == X86_OP_IMM:
                imm = ops[0].imm
            rets.append((got.address, imm))
        pos += got.size
    uniq = sorted(set(e8))
    return {
        "insns": len(insns), "bytes": span, "resyncs": resyncs,
        "e8": len(e8), "uniq_e8": len(uniq), "ind": ind, "fs": fs,
        "cookie": cookie, "handlers": handlers, "rets": rets,
        "callees": uniq,
    }


def callers_of(buf: bytes, target: int):
    data = buf[TEXT_RAW : TEXT_RAW + TEXT_SIZE]
    out = {"e8": [], "e9": []}
    for tag, opb in (("e8", b"\xe8"), ("e9", b"\xe9")):
        i = 0
        while True:
            j = data.find(opb, i)
            if j < 0 or j + 5 > TEXT_SIZE:
                break
            rel = struct.unpack_from("<i", data, j + 1)[0]
            site = TEXT_VA + j
            if site + 5 + rel == target:
                out[tag].append(site)
            i = j + 1
    return out


def next_body(buf: bytes, start_va: int, limit=0x1000):
    raw = va_to_raw(start_va)
    w = buf[raw : raw + limit]
    for i in range(len(w) - 5):
        if w[i] == 0xCC and w[i + 1] == 0xCC and w[i + 2 : i + 5] == b"\x55\x8b\xec":
            return start_va + i + 2
    return 0


def main() -> int:
    buf = PE.read_bytes()
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True

    for name, s, e in (("A", 0x00A1C480, 0x00A1C7CA),
                       ("B", 0x00A1C7D0, 0x00A1CE6A)):
        st = resync_stats(buf, md, s, e)
        cl = callers_of(buf, s)
        print(f"=== {name}: {s:#010x}..{e:#010x} ===")
        print(f"insns={st['insns']} len={st['bytes']:#x} resyncs={st['resyncs']} "
              f"e8={st['e8']} uniq={st['uniq_e8']} ind={st['ind']} "
              f"fs={st['fs']} cookie={st['cookie']}")
        print("rets: " + ", ".join(f"{a:#x}(r{i:#x})" for a, i in st["rets"]))
        print("seh: " + ", ".join(f"{a:#x}->h:{h:#x}" for a, h in st["handlers"]))
        print("callees: " + ", ".join(f"{t:#x}" for t in st["callees"]))
        print(f"callers e8={len(cl['e8'])} e9_tails={len(cl['e9'])}")
        for c in cl["e8"]:
            print(f"    {c:#010x}")
        for c in cl["e9"]:
            print(f"    jmp {c:#010x}")

    nb = next_body(buf, 0x00A1CE6A)
    print(f"next cc-separated body after B-end: {nb:#010x}" if nb else
          "none within 0x1000")
    # context bytes after B end
    print("after-B hex:", buf[va_to_raw(0xA1CE6A) : va_to_raw(0xA1CE6A) + 64].hex())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
