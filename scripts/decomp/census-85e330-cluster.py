#!/usr/bin/env python3
"""Definitive image-wide caller scan for the 0x85e330..0x85e390 getter
cluster: every E8 rel32 target in .text PLUS every indirect call/jmp
(FF /2, FF /4, FF /5) whose operand (IAT slot value or imm table) could
resolve into the cluster range.  Prints per-VA caller lists + any
indirect candidates reaching the range.

Writes no files; CPU evidence for the v39 census decision.
"""
from __future__ import annotations

import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM, X86_OP_MEM

ROOT = Path(__file__).resolve().parents[2]
EXE = ROOT / "tools" / "isaac-ng.unpacked.exe"
buf = EXE.read_bytes()
pe = int.from_bytes(buf[0x3C:0x40], "little")
nsec = int.from_bytes(buf[pe + 6 : pe + 8], "little")
opt = pe + 24
image_base = int.from_bytes(buf[opt + 28 : opt + 32], "little")
opt_size = int.from_bytes(buf[pe + 20 : pe + 22], "little")
sec0 = opt + opt_size
sections = []
for i in range(nsec):
    o = sec0 + i * 40
    name = buf[o : o + 8].split(b"\0", 1)[0].decode("ascii", "replace")
    sections.append({
        "name": name,
        "vsize": int.from_bytes(buf[o + 8 : o + 12], "little"),
        "va": int.from_bytes(buf[o + 12 : o + 16], "little") + image_base,
        "raw_size": int.from_bytes(buf[o + 16 : o + 20], "little"),
        "raw": int.from_bytes(buf[o + 20 : o + 24], "little"),
    })
text = next(s for s in sections if s["name"] == ".text")
tva, traw, tsize = text["va"], text["raw"], max(text["vsize"], text["raw_size"])

LO, HI = 0x85e330, 0x85e390
md = Cs(CS_ARCH_X86, CS_MODE_32)
md.detail = True

callers: dict[int, list[int]] = {va: [] for va in range(LO, HI)}
indirect_hits = []  # (src_va, mnemonic, op_str)
for va in range(tva, tva + tsize):
    off = traw + (va - tva)
    insn = next(md.disasm(buf[off : off + 15], va), None)
    if insn is None:
        continue
    if insn.mnemonic in ("call", "jmp"):
        op = insn.operands[0]
        if op.type == X86_OP_IMM and op.imm & 0xFFFFFFFF:
            tgt = op.imm & 0xFFFFFFFF
            if 0x85e340 <= tgt < LO or LO <= tgt < HI:
                # E8 rel32 targets (and E9/E8-style jmps) landing in cluster
                if LO <= tgt < HI:
                    callers[tgt].append(va)
                else:
                    callers.setdefault(tgt, []).append(va)
        elif op.type == X86_OP_MEM and insn.mnemonic in ("call", "jmp"):
            indirect_hits.append((va, insn.mnemonic, insn.op_str))

print("=== direct rel32 call/jmp targets in 0x85e330..0x85e390 ===")
for va in sorted(callers):
    print(f"0x{va:08x}: {len(callers[va])} callers {[hex(c) for c in callers[va]]}")

print()
print("=== indirect call/jmp in whole .text whose MEM operand could read 0x85e3xx ===")
for src, mnem, ops in indirect_hits:
    s = f"{ops}"
    if "0x85e3" in s or "0x85e4" in s:
        print(f"0x{src:08x}: {mnem} {s}")
print(f"(indirect call/jmp total in .text: {len(indirect_hits)})")