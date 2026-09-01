#!/usr/bin/env python3
"""NET AUDIT for the Lua family (ABI 57 -> 58 target).

Linear-scan the Lua-declared bands 0x85..0x8c (whole .text, but report
only bodies whose start VA is in 0x850000..0x8cffff), split bodies at
ret boundaries (stop-at-ret decode, resync across int3/nop padding),
and for each body report:

  - landed?   (start VA present in the header/model/tests landed set)
  - caller-bearing? (image-wide 32-bit LE literal reference in .text
    = pushcclosure/install-site edge, OR image-wide E8 rel32 caller)
  - E8 targets / indirect calls / mem stores
  - first-3-insn prologue signature (wrapper-shaped?)

Output: TSV of caller-bearing UNLANDED bodies (the landing candidates)
sorted by VA, then full body list. Pure CPU work, no LLM claims.

Usage:
  py scripts/decomp/lua-net-audit.py            # full audit, TSV
  py scripts/decomp/lua-net-audit.py --bodies   # every body in band
  py scripts/decomp/lua-net-audit.py --va 0x8b96d0  # decode one span
"""
from __future__ import annotations

import argparse
import re
import struct
import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM, X86_OP_MEM

ROOT = Path(__file__).resolve().parents[2]
PE = ROOT / "tools" / "isaac-ng.unpacked.exe"

SECTIONS = [
    (0x00401000, 0x00716134, 0x00000400, 0x00716200),  # .text
    (0x00b18000, 0x000df948, 0x00716600, 0x000dfa00),  # .rdata
    (0x00bf8000, 0x000a4aa4, 0x007f6000, 0x00069e00),  # .data
]

BAND_LO = 0x850000
BAND_HI = 0x8cffff


def va_to_off(va: int) -> int | None:
    for v, vs, raw, rs in SECTIONS:
        if v <= va < v + vs:
            delta = va - v
            if delta >= rs:
                return None
            return raw + delta
    return None


def decode_to_ret(buf: bytes, va: int, limit: int = 8192) -> list | None:
    off = va_to_off(va)
    if off is None:
        return None
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    insns = []
    i = 0
    first = True
    while i < limit:
        got = list(md.disasm(buf[off + i : off + i + 16], va + i, count=1))
        if not got:
            if first:
                return None  # first byte undecodable -> not a body start
            i += 1
            continue
        insn = got[0]
        insns.append(insn)
        first = False
        i += insn.size
        if insn.mnemonic in ("ret", "retn"):
            break
    return insns


def classify(insns: list) -> dict:
    e8, ind, stores, rets = [], [], [], []
    for insn in insns:
        if insn.mnemonic == "call":
            if insn.operands and insn.operands[0].type == X86_OP_IMM:
                e8.append((insn.address, insn.operands[0].imm))
            else:
                ind.append((insn.address, insn.op_str))
        if insn.mnemonic in ("ret", "retn"):
            rets.append(insn.address)
        if insn.mnemonic.startswith("mov") and insn.operands:
            if insn.operands[0].type == X86_OP_MEM:
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


def image_literal_refs(buf: bytes, text_va: int, text_off: int, text_len: int,
                       target: int) -> list:
    """Every 32-bit LE literal == target inside .text (install sites)."""
    pat = struct.pack("<I", target)
    hits = []
    j = text_off
    end = text_off + text_len
    while True:
        k = buf.find(pat, j, end)
        if k < 0:
            break
        hits.append(text_va + (k - text_off))
        j = k + 1
    return hits


def all_e8_callers(buf: bytes) -> dict:
    text_va, text_vs, text_raw, text_rs = SECTIONS[0]
    text = buf[text_raw : text_raw + text_rs]
    out: dict[int, list] = {}
    i = 0
    n = len(text)
    while i < n - 5:
        if text[i] == 0xE8:
            rel = struct.unpack_from("<i", text, i + 1)[0]
            tgt = text_va + i + 5 + rel
            out.setdefault(tgt, []).append(text_va + i)
            i += 5
            continue
        i += 1
    return out


def load_landed() -> set:
    """Merge header/model/tests 0x00xxxxxx literals -> landed VA set."""
    landed = set()
    for rel in [
        "native/decomp/lua_engine_pure_helpers.h",
        "native/decomp/lua_engine_pure_helpers.cpp",
        "scripts/decomp/lua-engine-pure-model.mjs",
        "tests/decomp-lua-engine-pure-helpers.test.js",
    ]:
        txt = (ROOT / rel).read_text(errors="replace")
        for m in re.finditer(r"0x00([0-9a-fA-F]{6})", txt):
            v = int(m.group(1), 16)
            if 0x400000 <= v < 0xc00000:
                landed.add(v)
        for m in re.finditer(r"0x00([0-9a-fA-F]{6})u", txt):
            landed.add(int(m.group(1), 16))
    return landed


def find_body_starts(buf: bytes, band_lo: int, band_hi: int) -> list:
    """Linear resync scan: body start = band start, or right after a
    decoded ret, or right after an int3/nop padding run. Dedupe."""
    off = va_to_off(band_lo)
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    n = band_hi - band_lo
    starts = {band_lo}
    j = 0
    while j < n:
        b = buf[off + j]
        if b == 0xCC:
            k = j
            while k < n and buf[off + k] == 0xCC:
                k += 1
            while k < n and buf[off + k] == 0x90:
                k += 1
            if k < n:
                starts.add(band_lo + k)
            j = k
            continue
        got = list(md.disasm(buf[off + j : off + j + 16], band_lo + j, count=1))
        if got:
            insn = got[0]
            if insn.mnemonic in ("ret", "retn"):
                nxt = band_lo + j + insn.size
                if nxt < band_lo + n:
                    starts.add(nxt)
            j += insn.size
        else:
            j += 1
    return sorted(starts)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bodies", action="store_true")
    ap.add_argument("--va", type=lambda s: int(s, 16))
    args = ap.parse_args()

    buf = PE.read_bytes()
    text_va, text_vs, text_raw, text_rs = SECTIONS[0]
    landed = load_landed()
    callers = all_e8_callers(buf)

    if args.va is not None:
        insns = decode_to_ret(buf, args.va, limit=16384)
        if insns is None:
            print(f"0x{args.va:08x}: undecodable first byte")
            return 0
        c = classify(insns)
        lit = image_literal_refs(buf, text_va, text_raw, text_rs, args.va)
        cls = callers.get(args.va, [])
        print(f"0x{c['start']:08x} end 0x{c['end']:08x} insns {c['insns']} "
              f"landed={args.va in landed} literals={len(lit)} callers={len(cls)}")
        for s, t in c["e8"]:
            print(f"    E8 0x{s:08x} -> 0x{t:08x}")
        for s, op in c["indirect"]:
            print(f"    IND 0x{s:08x} {op}")
        if c["stores"]:
            print("    stores: " + "; ".join(f"0x{s:08x} {o}" for s, o in c["stores"][:16]))
        if lit:
            print("    literals: " + " ".join(f"0{x:08x}" for x in lit))
        if cls:
            print("    callers: " + " ".join(f"0{x:08x}" for x in cls))
        return 0

    starts = find_body_starts(buf, BAND_LO, BAND_HI)
    bodies = []
    for s in starts:
        insns = decode_to_ret(buf, s, limit=16384)
        if insns is None:
            continue
        c = classify(insns)
        c["literally"] = image_literal_refs(buf, text_va, text_raw, text_rs, s)
        c["callers"] = callers.get(s, [])
        c["landed"] = s in landed
        c["sig"] = " ".join(f"{i.mnemonic} {i.op_str}" for i in insns[:3])[:90]
        bodies.append(c)

    if args.bodies:
        print(f"# bodies {len(bodies)} in band 0x{BAND_LO:06x}..0x{BAND_HI:06x}")
        for b in bodies:
            print(f"0x{b['start']:08x} end 0x{b['end']:08x} insns {b['insns']:5d} "
                  f"landed={1 if b['landed'] else 0} lit={len(b['literally'])} "
                  f"E8cls={len(b['callers'])} | {b['sig']}")
        return 0

    # Candidate filter: caller-bearing (literal or E8) + UNLANDED.
    cands = [b for b in bodies
             if not b["landed"] and (b["literally"] or b["callers"])]
    cands.sort(key=lambda b: b["start"])
    print(f"# caller-bearing UNLANDED candidates: {len(cands)}")
    for b in cands:
        lit = " ".join(f"0x{x:08x}" for x in b["literally"][:6])
        cls = " ".join(f"0x{x:08x}" for x in b["callers"][:6])
        print(f"0x{b['start']:08x} end 0x{b['end']:08x} insns {b['insns']:5d} "
              f"lit[{len(b['literally'])}]={lit} E8cls[{len(b['callers'])}]={cls} "
              f"ind {len(b['indirect'])} stores {len(b['stores'])} | {b['sig']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())