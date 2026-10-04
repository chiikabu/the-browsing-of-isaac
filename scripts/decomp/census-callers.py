#!/usr/bin/env python3
"""Linear-decode call census for the record-0 0x84c170 tail callees.

Enumerates ALL direct rel32 call sites image-wide that target any of the
given VAs, using the linear decode with resync (the AGENTS-mandated channel:
direct calls, plus a register-held report via load-tracking is out of scope
here; we only claim the DIRECT channel and state it).

Usage:
  python scripts/decomp/census-callers.py 0x84ca00 0x9be080 0x84bf30 0x84d6b0
"""
from __future__ import annotations

import argparse
import struct
import sys
from pathlib import Path

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
            off = raw + (va - v)
            if off < raw + rs:
                return off
            return None  # zero-at-load (past raw end)
    return None


def is_prefix(data: bytes, i: int, prefix: bytes) -> bool:
    return data[i : i + len(prefix)] == prefix


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("targets", nargs="+", type=lambda s: int(s, 16))
    args = ap.parse_args()
    data = PE.read_bytes()
    text_va, text_vs, text_raw, text_rs = SECTIONS[0]
    text = data[text_raw : text_raw + text_rs]

    counts = {t: [] for t in args.targets}
    i = 0
    n = len(text)
    # Linear decode with resync: on undecodable byte, skip 1 and continue.
    while i < n - 5:
        b = text[i]
        if b == 0xE8:  # call rel32
            rel = struct.unpack_from("<i", text, i + 1)[0]
            target = (text_va + i + 5 + rel) & 0xFFFFFFFF
            if target in counts:
                counts[target].append(text_va + i)
            i += 5
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x85:  # jne rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x84:  # je rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x8F:  # jg rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x8E:  # jle rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x8C:  # jl rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x8D:  # jge rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x83:  # jae rel32
            i += 6
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x82:  # jb rel32
            i += 6
            continue
        # 2-byte jcc short (80/75/74/7c/7f/7e/7d/73/72) — 2 bytes
        if b in (0x74, 0x75, 0x7C, 0x7F, 0x7E, 0x7D, 0x73, 0x72, 0x77, 0x76):
            i += 2
            continue
        if b == 0xC3 or b == 0xC2:  # ret / ret imm
            i += 3 if b == 0xC2 else 1
            continue
        if b == 0xE9:  # jmp rel32
            i += 5
            continue
        if b == 0xEB:  # jmp short
            i += 2
            continue
        if b in (0xCC, 0x90):  # int3 / nop
            i += 1
            continue
        if b in (0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57):  # push r
            i += 1
            continue
        if b in (0x58, 0x59, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F):  # pop r
            i += 1
            continue
        if b == 0x8B or b == 0x89:  # mov r,r/m — mod=11 -> 2 bytes else 3+
            modrm = text[i + 1] if i + 1 < n else 0
            i += 2 if (modrm >> 6) == 3 else 3
            continue
        if b == 0x68:  # push imm32
            i += 5
            continue
        if b == 0x6A:  # push imm8
            i += 2
            continue
        if b == 0x83:  # op r/m,imm8 (cmp/add/sub/and/or/xor) — 3 bytes
            i += 3
            continue
        if b == 0x81:  # op r/m,imm32 — 6 bytes
            i += 6
            continue
        if b == 0x3B or b == 0x39:  # cmp r,r/m — mod=11 -> 2 else 3
            modrm = text[i + 1] if i + 1 < n else 0
            i += 2 if (modrm >> 6) == 3 else 3
            continue
        if b == 0x8D:  # lea — 3-7 bytes
            i += 4
            continue
        if b == 0x85:  # test r,r — 2 bytes
            i += 2
            continue
        if b == 0x84:  # test r8,r8 — 2 bytes
            i += 2
            continue
        if b == 0x05:  # add eax,imm32 — 5
            i += 5
            continue
        if b == 0x2D:  # sub eax,imm32 — 5
            i += 5
            continue
        if b == 0x0F and i + 3 < n:  # other 0F-prefixed — take 4
            i += 4
            continue
        if b == 0xF3 or b == 0xF2 or b == 0x66:  # prefixes — 1
            i += 1
            continue
        # unknown: resync (skip 1)
        i += 1

    total_text = n
    for tgt in args.targets:
        sites = counts[tgt]
        print(f"0x{tgt:08x}: {len(sites)} direct rel32 callers")
        for s in sorted(sites):
            print(f"    caller 0x{s:08x}")
    print(f"(linear decode of {total_text} .text bytes with resync; direct rel32 channel only)")
    return 0


if __name__ == "__main__":
    sys.exit(main())