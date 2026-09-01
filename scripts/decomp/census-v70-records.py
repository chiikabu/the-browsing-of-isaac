#!/usr/bin/env python3
"""W32-F1 v70 census: every 17-byte installer record in RegisterClasses
(0x00866960..0x0086e4c9) mapped to its wrapper literal, cross-referenced
against the full landed wrapper set (v10..v69). Output = unlanded
17-byte-record wrappers (the "39-band" cross-check) + per-record detail.

Usage: python scripts/decomp/census-v70-records.py
"""
from __future__ import annotations

import struct
import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM, X86_OP_MEM, X86_OP_REG

ROOT = Path(__file__).resolve().parents[2]
PE = ROOT / "tools" / "isaac-ng.unpacked.exe"

TEXT_VA = 0x00401000
TEXT_RAW = 0x00000400
TEXT_SIZE = 0x00716134

REG_CLASSES_LO = 0x00866960
REG_CLASSES_HI = 0x0086e4c9

LUA_PUSHCclosure_IAT = 0x00b183fc


def va_to_raw(va: int) -> int:
    return TEXT_RAW + (va - TEXT_VA)


def main() -> int:
    buf = PE.read_bytes()
    data = buf[TEXT_RAW : TEXT_RAW + TEXT_SIZE]
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True

    # ---- helper-body wrapper literals: `push imm32 <wrapper>` then
    # `call [0xb183fc]` (lua_pushcclosure) within 0x30 bytes ----
    wrapper_at: dict[int, int] = {}  # helper VA -> wrapper VA
    i = 0
    while i < TEXT_SIZE - 5:
        if data[i] == 0x68:
            imm = struct.unpack_from("<I", data, i + 1)[0]
            if TEXT_VA <= imm < TEXT_VA + TEXT_SIZE:
                win = data[i : i + 0x40]
                if win.find(struct.pack("<I", LUA_PUSHCclosure_IAT)) >= 0:
                    wrapper_at.setdefault(TEXT_VA + i, imm)
                    i += 5
                    continue
        i += 1

    # ---- ret8 installer-block starts (v69 census patterns) ----
    starts: set[int] = set()
    for pat in (b"\x55\x8b\xec\x53\x56\x8b\xd9", b"\x53\x56\x8b\xd9\x57\x6a\x04"):
        j = 0
        while True:
            k = data.find(pat, j)
            if k < 0:
                break
            starts.add(TEXT_VA + k)
            j = k + 1
    body_starts = sorted(starts)
    extended = set(body_starts)
    for s in body_starts:
        k = s + 0x60
        while data[k - TEXT_VA : k - TEXT_VA + 3] == b"\x53\x56\x8b":
            extended.add(k)
            k += 0x60
    body_starts = sorted(extended)
    deduped: list[int] = []
    for s in body_starts:
        if deduped and s - deduped[-1] <= 7:
            continue
        deduped.append(s)
    body_starts = deduped

    def helper_for(va: int) -> int | None:
        cands = [s for s in body_starts if s <= va and va - s <= 0x100]
        return cands[-1] if cands else None

    # wrapper pushed by a helper = `push imm32` inside THIS block's span
    # (start[k] .. start[k+1]) that precedes a pushcclosure IAT call
    def wrapper_of(helper: int) -> int | None:
        idx = body_starts.index(helper)
        hi = body_starts[idx + 1] if idx + 1 < len(body_starts) else helper + 0x100
        best = None
        for site in sorted(wrapper_at):
            if helper <= site < hi:
                best = site  # last one in span wins (pushes are body-tail)
        return wrapper_at[best] if best is not None else None

    # ---- enumerate E8 records in RegisterClasses whose target is a
    # ret8 installer block; record the 17-byte window before each call ----
    # Record shape (v68/v69): `push <real_fn>; push <name>; mov ecx,<ref>;
    # call` = 5+5+2+5; name is arg1 ([ebp+8]), real_fn arg2 ([ebp+0xc]),
    # so fn push sits at caller-12, name push at caller-7, mov ecx at -2.
    records: list[tuple[int, int, int, int]] = []  # (caller, helper, fn, name)
    i = REG_CLASSES_LO
    while i < REG_CLASSES_HI - 5:
        if data[i - TEXT_VA] == 0xE8:
            rel = struct.unpack_from("<i", data, i - TEXT_VA + 1)[0]
            tgt = (i + 5 + rel) & 0xFFFFFFFF
            if tgt in body_starts:
                fn = name = 0
                a = i - 12
                if data[a - TEXT_VA] == 0x68:
                    fn = struct.unpack_from("<I", data, a - TEXT_VA + 1)[0]
                b = i - 7
                if data[b - TEXT_VA] == 0x68:
                    name = struct.unpack_from("<I", data, b - TEXT_VA + 1)[0]
                records.append((i, tgt, fn, name))
                i += 5
                continue
        i += 1

    # ---- landed wrapper set (v10..v69, header-pinned) ----
    landed = set()
    for va in (
        # v10
        0x008a80d0,
        # v45
        0x008a8180, 0x008a81d0, 0x008a8270,
        # v48 (install helpers 3..11)
        0x008a8310, 0x008a8430, 0x008a8510, 0x008a8580, 0x008a8610,
        0x008a8680, 0x008a8740, 0x008a8810, 0x008a88f0,
        # v49
        0x008a89e0, 0x008a8a40,
        # v51 band
        0x008a8970, 0x008a8ab0, 0x008a8b10, 0x008a8b80, 0x008a8c10,
        0x008a8c80, 0x008a8ce0, 0x008a8d80, 0x008a8dd0, 0x008a8e40,
        0x008a8ec0, 0x008a8f60, 0x008a8fc0, 0x008a9180,
        # v56/v57/v58/v59/v60/v61/v62/v64/v65/v66/v67 MusicManager band
        0x008b91d0, 0x008b9270, 0x008b9380, 0x008b9490, 0x008b95a0,
        0x008b96d0, 0x008b9760, 0x008b97d0, 0x008b9820, 0x008b98b0,
        0x008b9950, 0x008b99f0, 0x008b9a80,
        0x008b9b20, 0x008b9bd0, 0x008b9c40, 0x008b9cc0, 0x008b9d30,
        0x008b9da0, 0x008b9e10, 0x008b9e80,
        # v63 PlayerHUD band
        0x0085e370, 0x0085e380,
        # v68 eight
        0x00897870, 0x008978d0, 0x0089e300, 0x00898d90, 0x00898e00,
        0x00898e70, 0x00898ee0, 0x00898490,
        # v69 thirteen
        0x008983e0, 0x00899440, 0x00898cf0, 0x008981b0, 0x008982a0,
        0x00898c00, 0x00898ae0, 0x00898890, 0x008b90e0, 0x00897a10,
        0x00897b00, 0x00897c00, 0x00897d50,
        # v31-v41 fourth-region bodies
        0x008976a0, 0x008976f0, 0x00897730, 0x00897770, 0x008977a0,
        0x00897930, 0x00897f00, 0x008984e0, 0x00898f50, 0x008991a0,
        0x008991d0,
    ):
        landed.add(va)

    # ---- report ----
    print(f"helper bodies with wrapper literal: {len(wrapper_at)}")
    print(f"installer blocks: {len(body_starts)}")
    print(f"E8 records to installer blocks: {len(records)}")

    by_wrapper: dict[int, list] = {}
    for caller, helper, fn, name in records:
        w = wrapper_of(helper)
        by_wrapper.setdefault(w if w else 0, []).append((caller, helper, fn, name))

    print("\n== wrapper -> records (wrapper unlanded => CANDIDATE) ==")
    for w in sorted(by_wrapper):
        rows = by_wrapper[w]
        status = "LANDED" if w in landed else "UNLANDED"
        print(f"\n  wrapper {w:#010x}  status {status}  records {len(rows)}")
        for caller, helper, fn, name in rows[:4]:
            print(
                f"    caller {caller:#010x}  helper {helper:#010x}  "
                f"fn {fn:#010x}  name {name:#010x}"
            )
        if len(rows) > 4:
            print(f"    ... +{len(rows) - 4} more")
    return 0


if __name__ == "__main__":
    sys.exit(main())
