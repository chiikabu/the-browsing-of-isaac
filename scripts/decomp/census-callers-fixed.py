#!/usr/bin/env python3
"""Corrected direct rel32 call census.

Fixes the census-callers.py `lea` skip (always 4 bytes) with proper modrm
sizing (3-byte lea r,[r+disp8] before thiscall calls was leaping over E8s;
undercount ~25%, cf. update-v96-anm2-gapscan-detail NOTES.md §5). Keeps the
same linear-decode-with-resync channel otherwise.

Usage:
  python scripts/decomp/census-callers-fixed.py 0x407ae0 0x407e90
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


def lea_size(b: bytes, i: int) -> int:
    """Size of `lea r, [r/m]`: mod==11 -> 2; mod==00 -> 2-6 (SIB/disp32);
    mod==01 -> 3-4 (disp8, SIB); mod==10 -> 6-7 (disp32, SIB)."""
    modrm = b[i + 1]
    mod = modrm >> 6
    rm = modrm & 7
    if mod == 3:
        return 2
    base = 2
    if rm == 4:  # SIB byte follows
        base += 1
    if mod == 0:
        return base + (4 if rm == 5 else 0)
    if mod == 1:
        return base + 1
    return base + 4


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
    while i < n - 5:
        b = text[i]
        if b == 0xE8:  # call rel32
            rel = struct.unpack_from("<i", text, i + 1)[0]
            target = (text_va + i + 5 + rel) & 0xFFFFFFFF
            if target in counts:
                counts[target].append(text_va + i)
            i += 5
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] in (0x85, 0x84, 0x8F, 0x8E, 0x8C, 0x8D, 0x83, 0x82, 0x87, 0x86, 0x81, 0x80, 0x8B, 0x8A, 0x88, 0x89, 0x8E, 0x8F):
            i += 6  # jcc rel32
            continue
        if b == 0x0F and i + 6 < n and text[i + 1] == 0x1F:  # nop r/m32
            modrm = text[i + 2] if i + 2 < n else 0
            i += 5 if ((modrm >> 6) == 3) else 6
            continue
        if b in (0x74, 0x75, 0x7C, 0x7F, 0x7E, 0x7D, 0x73, 0x72, 0x77, 0x76):
            i += 2  # jcc short
            continue
        if b == 0xC3:
            i += 1
            continue
        if b == 0xC2:  # ret imm16
            i += 3
            continue
        if b == 0xE9:  # jmp rel32
            i += 5
            continue
        if b == 0xEB:
            i += 2  # jmp short
            continue
        if b in (0xCC, 0x90):
            i += 1
            continue
        if b in (0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57):
            i += 1  # push r
            continue
        if b in (0x58, 0x59, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F):
            i += 1  # pop r
            continue
        if b in (0x8B, 0x89, 0x3B, 0x39):
            modrm = text[i + 1] if i + 1 < n else 0
            i += 2 if (modrm >> 6) == 3 else 3
            continue
        if b == 0x8D:  # lea — CORRECTED sizing
            i += lea_size(text, i)
            continue
        if b == 0x68:  # push imm32
            i += 5
            continue
        if b == 0x6A:
            i += 2
            continue
        if b == 0x83:  # op r/m, imm8
            i += 3
            continue
        if b == 0x81:  # op r/m, imm32
            i += 6
            continue
        if b in (0x85, 0x84):  # test r,r
            i += 2
            continue
        if b in (0x05, 0x2D):  # add/sub eax, imm32
            i += 5
            continue
        if b == 0x0F and i + 3 < n:
            i += 4  # other 0F-prefixed (approximate)
            continue
        if b in (0xF3, 0xF2, 0x66):
            i += 1
            continue
        # unknown: resync (skip 1)
        i += 1

    total_text = n
    for tgt in args.targets:
        sites = counts[tgt]
        print(f"0x{tgt:08x}: {len(sites)} direct rel32 callers")
        for s in sites:
            print(f"    caller 0x{s:08x}")
    print(f"(linear decode of {total_text} .text bytes with resync; direct rel32 channel only; lea-corrected)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
