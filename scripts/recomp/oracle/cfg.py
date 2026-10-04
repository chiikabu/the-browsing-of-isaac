"""Static recursive-descent CFG recovery for one function.

Used by the oracle for three things:
  1. the function's own address extent / block set, so the emulator can tell
     "still inside the function under test" from "left it",
  2. the exact set of call-site addresses (so UC_HOOK_CODE is registered only
     where it is needed instead of on every instruction),
  3. a static basic-block count to act as the denominator for coverage.

Indirect jumps (jump tables) that cannot be resolved statically are recorded
in `unresolved_jumps`; blocks reached only through them still show up at
runtime via the emulator's block hook, so dynamic coverage can exceed the
static block count.  That is reported, never hidden.
"""

from __future__ import annotations

import json
import os
import struct
from dataclasses import dataclass, field

from capstone import CS_ARCH_X86, CS_MODE_32, CS_OP_IMM, Cs
from capstone.x86 import X86_GRP_CALL, X86_GRP_JUMP, X86_GRP_RET, X86_OP_MEM

import peimage

_MD = Cs(CS_ARCH_X86, CS_MODE_32)
_MD.detail = True

TERMINATORS = {"ret", "retf", "iret", "iretd", "hlt", "ud2", "int3"}


@dataclass
class CallSite:
    addr: int
    target: int | None      # None for indirect
    kind: str               # "direct" | "indirect" | "iat"
    mnemonic: str
    op_str: str


@dataclass
class FuncCfg:
    entry: int
    blocks: dict[int, int] = field(default_factory=dict)   # start -> end (exclusive)
    insns: list[int] = field(default_factory=list)
    calls: list[CallSite] = field(default_factory=list)
    tail_jumps: list[CallSite] = field(default_factory=list)
    unresolved_jumps: list[int] = field(default_factory=list)
    ret_sites: list[int] = field(default_factory=list)
    ret_imm: int | None = None      # stack bytes popped by `ret N` (stdcall/thiscall)
    lo: int = 0
    hi: int = 0
    truncated: bool = False
    error: str | None = None

    @property
    def block_count(self) -> int:
        return len(self.blocks)

    def contains(self, va: int) -> bool:
        for s, e in self.blocks.items():
            if s <= va < e:
                return True
        return False

    def to_json(self) -> dict:
        return {
            "entry": self.entry,
            "lo": self.lo,
            "hi": self.hi,
            "block_count": len(self.blocks),
            "insn_count": len(self.insns),
            "blocks": sorted(self.blocks.items()),
            "calls": [
                {"addr": c.addr, "target": c.target, "kind": c.kind,
                 "text": f"{c.mnemonic} {c.op_str}".strip()}
                for c in self.calls
            ],
            "tail_jumps": [
                {"addr": c.addr, "target": c.target, "kind": c.kind}
                for c in self.tail_jumps
            ],
            "unresolved_jumps": self.unresolved_jumps,
            "ret_sites": self.ret_sites,
            "ret_imm": self.ret_imm,
            "truncated": self.truncated,
            "error": self.error,
        }


def _iat_range(pe: peimage.PeImage) -> tuple[int, int]:
    if not pe.imports:
        return (0, 0)
    vas = [e.iat_va for e in pe.imports]
    return (min(vas), max(vas) + 4)


def recover(pe: peimage.PeImage, entry: int, *, max_insns: int = 200000,
            func_starts: set[int] | None = None) -> FuncCfg:
    """Recursive descent from `entry`, staying inside .text."""
    cfg = FuncCfg(entry=entry)
    text = pe.text
    iat_lo, iat_hi = _iat_range(pe)
    if not (text.va <= entry < text.end):
        cfg.error = f"entry {entry:#010x} outside .text"
        return cfg

    worklist = [entry]
    seen_blocks: set[int] = set()
    lo, hi = entry, entry
    total = 0

    while worklist:
        start = worklist.pop()
        if start in seen_blocks:
            continue
        if not (text.va <= start < text.end):
            continue
        seen_blocks.add(start)
        addr = start
        while True:
            if total >= max_insns:
                cfg.truncated = True
                break
            try:
                code = pe.read(addr, min(16, text.end - addr))
            except ValueError:
                break
            gen = _MD.disasm(code, addr, count=1)
            ins = next(gen, None)
            if ins is None:
                break
            total += 1
            cfg.insns.append(ins.address)
            lo = min(lo, ins.address)
            hi = max(hi, ins.address + ins.size)
            nxt = ins.address + ins.size
            groups = set(ins.groups)
            mn = ins.mnemonic

            if X86_GRP_CALL in groups:
                tgt = None
                kind = "indirect"
                if ins.operands and ins.operands[0].type == CS_OP_IMM:
                    tgt = ins.operands[0].imm & 0xFFFFFFFF
                    kind = "direct"
                elif ins.operands and ins.operands[0].type == X86_OP_MEM:
                    m = ins.operands[0].mem
                    if m.base == 0 and m.index == 0:
                        slot = m.disp & 0xFFFFFFFF
                        if iat_lo <= slot < iat_hi:
                            kind = "iat"
                            tgt = slot          # target == IAT slot VA for iat kind
                cfg.calls.append(CallSite(ins.address, tgt, kind, mn, ins.op_str))
                addr = nxt
                continue

            if mn in TERMINATORS or X86_GRP_RET in groups:
                cfg.ret_sites.append(ins.address)
                if mn == "ret" and ins.operands and ins.operands[0].type == CS_OP_IMM:
                    imm = ins.operands[0].imm
                    if cfg.ret_imm is None:
                        cfg.ret_imm = imm
                elif mn == "ret" and cfg.ret_imm is None:
                    cfg.ret_imm = 0
                cfg.blocks[start] = nxt
                break

            if X86_GRP_JUMP in groups:
                cfg.blocks[start] = nxt
                if ins.operands and ins.operands[0].type == CS_OP_IMM:
                    tgt = ins.operands[0].imm & 0xFFFFFFFF
                    is_tail = bool(func_starts and tgt in func_starts and tgt != entry)
                    if is_tail:
                        cfg.tail_jumps.append(
                            CallSite(ins.address, tgt, "direct", mn, ins.op_str))
                    elif text.va <= tgt < text.end:
                        worklist.append(tgt)
                    if mn != "jmp":                 # conditional: fallthrough too
                        worklist.append(nxt)
                else:
                    if mn == "jmp":
                        m = ins.operands[0].mem if ins.operands and \
                            ins.operands[0].type == X86_OP_MEM else None
                        if m is not None and m.base == 0 and m.index == 0 and \
                                iat_lo <= (m.disp & 0xFFFFFFFF) < iat_hi:
                            cfg.tail_jumps.append(
                                CallSite(ins.address, m.disp & 0xFFFFFFFF, "iat",
                                         mn, ins.op_str))
                        else:
                            cfg.unresolved_jumps.append(ins.address)
                            for t in _jump_table_targets(pe, ins):
                                if text.va <= t < text.end:
                                    worklist.append(t)
                    else:
                        cfg.unresolved_jumps.append(ins.address)
                        worklist.append(nxt)
                break

            if nxt in seen_blocks:
                cfg.blocks[start] = nxt
                break
            addr = nxt

        else:
            pass
        if start not in cfg.blocks:
            cfg.blocks[start] = addr if addr > start else start + 1

    cfg.lo, cfg.hi = lo, hi
    return cfg


def _jump_table_targets(pe: peimage.PeImage, ins, max_entries: int = 512) -> list[int]:
    """Best-effort MSVC switch-table recovery: `jmp dword ptr [idx*4 + TABLE]`."""
    if not ins.operands or ins.operands[0].type != X86_OP_MEM:
        return []
    m = ins.operands[0].mem
    if m.scale != 4 or m.index == 0:
        return []
    table = m.disp & 0xFFFFFFFF
    sec = pe.section_for_va(table)
    if sec is None:
        return []
    out: list[int] = []
    text = pe.text
    for i in range(max_entries):
        va = table + 4 * i
        if not (sec.va <= va + 4 <= sec.end):
            break
        try:
            t = pe.u32(va)
        except Exception:
            break
        if not (text.va <= t < text.end):
            break
        out.append(t)
    return out


# ---------------------------------------------------------------------------
# Global function-entry inventory (all direct `call rel32` targets in .text).
# ---------------------------------------------------------------------------

def build_function_starts(pe: peimage.PeImage, cache: str | None = None,
                          min_refs: int = 1) -> dict[int, int]:
    """Return {entry_va: direct_call_ref_count} by linear scan for E8 rel32."""
    if cache and os.path.exists(cache):
        with open(cache, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        if data.get("sha256") == pe.sha256:
            return {int(k): v for k, v in data["starts"].items()}

    text = pe.text
    off = text.va - pe.image_base
    n = text.vsize
    buf = pe.image
    counts: dict[int, int] = {}
    i = 0
    end = n - 5
    while i < end:
        j = buf.find(b"\xe8", off + i, off + n - 5)
        if j < 0:
            break
        i = j - off
        rel = struct.unpack_from("<i", buf, j + 1)[0]
        tgt = (text.va + i + 5 + rel) & 0xFFFFFFFF
        if text.va <= tgt < text.end:
            counts[tgt] = counts.get(tgt, 0) + 1
        i += 1
    counts = {k: v for k, v in counts.items() if v >= min_refs}
    if cache:
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        with open(cache, "w", encoding="utf-8") as fh:
            json.dump({"sha256": pe.sha256,
                       "starts": {str(k): v for k, v in counts.items()}}, fh)
    return counts


def disasm_text(pe: peimage.PeImage, lo: int, hi: int) -> list[str]:
    out = []
    code = pe.read(lo, hi - lo)
    for ins in _MD.disasm(code, lo):
        out.append(f"{ins.address:08x}  {ins.bytes.hex():<20} {ins.mnemonic} {ins.op_str}")
    return out


if __name__ == "__main__":
    import sys
    pe = peimage.load()
    for a in sys.argv[1:]:
        va = int(a, 0)
        starts = build_function_starts(
            pe, os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle",
                             "func_starts.json"))
        c = recover(pe, va, func_starts=set(starts))
        print(f"== {va:#010x} blocks={c.block_count} insns={len(c.insns)} "
              f"span={c.lo:#x}..{c.hi:#x} ret_imm={c.ret_imm} "
              f"calls={len(c.calls)} unresolved={len(c.unresolved_jumps)}")
        for line in disasm_text(pe, c.lo, c.hi):
            print("   ", line)
