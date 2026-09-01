#!/usr/bin/env python3
"""W31-F1 installer census for the 14 v69 wrapper bodies.

Finds, for each wrapper body VA, the ret8 installer block that pushes it
(push imm32 next to `call [0xb183fc]` pushcclosure), then enumerates the
RegisterClasses callers of each installer block (E8 rel32), reading the
pushed name/real_fn pair at each caller with lea/mov-reg correction.

Usage: python scripts/decomp/census-v69-wrappers.py
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

WRAPPERS = [
    0x00897a10,  # RemoveModData
    0x00897b00,  # HasModData
    0x00897c00,  # LoadModData
    0x00897d50,  # SaveModData
    0x008981b0,  # ExecuteCommand
    0x008982a0,  # GetPlayerTypeByName
    0x008983e0,  # Get*ByName (x2 body)
    0x00898890,  # RenderText
    0x00898ae0,  # GridSpawn
    0x00898c00,  # Spawn
    0x00898cf0,  # DebugString
    0x00899440,  # GetTextWidth
    0x008b90e0,  # UpdateStrangeAttractor
]

REG_CLASSES_LO = 0x00866960
REG_CLASSES_HI = 0x0086e4c9


def va_to_raw(va: int) -> int:
    return TEXT_RAW + (va - TEXT_VA)


def main() -> int:
    buf = PE.read_bytes()
    data = buf[TEXT_RAW : TEXT_RAW + TEXT_SIZE]
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True

    # ---- ret8 installer-block starts: full prologue + interior form ----
    starts: set[int] = set()
    for pat in (b"\x55\x8b\xec\x53\x56\x8b\xd9", b"\x53\x56\x8b\xd9\x57\x6a\x04"):
        i = 0
        while True:
            j = data.find(pat, i)
            if j < 0:
                break
            starts.add(TEXT_VA + j)
            i = j + 1
    body_starts = sorted(starts)
    # extend by 0x60 stride while the next slot has the interior prologue
    extended = set(body_starts)
    for s in body_starts:
        k = s + 0x60
        while data[k - TEXT_VA : k - TEXT_VA + 3] == b"\x53\x56\x8b":
            extended.add(k)
            k += 0x60
    body_starts = sorted(extended)
    # dedupe interior duplicates within 7 bytes
    deduped: list[int] = []
    for s in body_starts:
        if deduped and s - deduped[-1] <= 7:
            continue
        deduped.append(s)
    body_starts = deduped

    # ---- push-imm32 sites of each wrapper VA ----
    sites: dict[int, list[int]] = {}
    for wrapper in WRAPPERS:
        needle = struct.pack("<I", wrapper)
        matches = []
        i = 0
        while True:
            j = data.find(needle, i)
            if j < 0:
                break
            if j >= 1 and data[j - 1] == 0x68:
                matches.append(TEXT_VA + j)
            i = j + 1
        sites[wrapper] = matches

    def helper_for(site: int) -> int | None:
        cands = [s for s in body_starts if s < site and site - s <= 0x100]
        return cands[-1] if cands else None

    # ---- E8 callers in RegisterClasses ----
    def direct_callers(helper: int) -> list[int]:
        out = []
        i = REG_CLASSES_LO
        while i < REG_CLASSES_HI - 5:
            if data[i - TEXT_VA] == 0xE8:
                rel = struct.unpack_from("<i", data, i - TEXT_VA + 1)[0]
                tgt = (i + 5 + rel) & 0xFFFFFFFF
                if tgt == helper:
                    out.append(i)
                i += 5
            else:
                i += 1
        return out

    def decode_window(va: int, nback: int, nfwd: int) -> list:
        start = max(TEXT_VA, va - nback)
        blob = data[start - TEXT_VA : va - TEXT_VA + nfwd]
        return list(md.disasm(blob, start))

    def pushed_values_before(insns: list, stop_va: int, limit: int = 8):
        """Collect (va, value) of direct pushes or mov/lea-reg-then-push."""
        pending: dict = {}  # reg -> (va, imm)
        out = []
        for ins in reversed(insns):
            if ins.address >= stop_va:
                continue
            if ins.mnemonic == "push":
                op = ins.operands[0]
                if op.type == X86_OP_IMM:
                    out.append((ins.address, op.imm))
                elif op.type == X86_OP_REG and op.reg in pending:
                    out.append((ins.address, pending[op.reg][1]))
                if len(out) >= limit:
                    break
                continue
            if ins.mnemonic in ("mov", "lea") and len(ins.operands) == 2:
                dst, src = ins.operands
                if dst.type == X86_OP_REG and src.type == X86_OP_MEM:
                    mem = src.mem
                    if mem.base == 0 and mem.index == 0 and mem.disp >= 0x00401000:
                        pending[dst.reg] = (ins.address, mem.disp)
                elif dst.type == X86_OP_REG and src.type == X86_OP_IMM:
                    pending[dst.reg] = (ins.address, src.imm)
        return out

    print("== push-site map ==")
    for wrapper in WRAPPERS:
        for site in sites[wrapper]:
            h = helper_for(site)
            print(f"  {wrapper:#010x}  site {site:#010x}  block {(h if h else -1):#010x}")
        if not sites[wrapper]:
            print(f"  {wrapper:#010x}  (no push site)")

    print("\n== callers ==")
    seen: set = set()
    for wrapper in WRAPPERS:
        for site in sites[wrapper]:
            h = helper_for(site)
            if h is None or (h, wrapper) in seen:
                continue
            seen.add((h, wrapper))
            callers = direct_callers(h)
            print(f"\n  block {h:#010x}  wrapper {wrapper:#010x}  lit {site:#010x}")
            print(f"  n_callers {len(callers)}: {['%#010x' % c for c in callers]}")
            for c in callers:
                insns = decode_window(c - 48, 52, 12)
                pushes = pushed_values_before(insns, c)
                pushes = [p for p in pushes if p[0] >= c - 52]
                print(f"    caller {c:#010x}: {['%s:%#x' % ('%#010x' % p[0], p[1]) for p in pushes]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())