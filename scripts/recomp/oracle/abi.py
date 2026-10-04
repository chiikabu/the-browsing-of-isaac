"""Calling-convention / arity inference from the instruction stream.

Everything here is a *hypothesis*, and it is recorded as such in the vector
file (`abi_confidence`).  A wrong arity does not corrupt ground truth: the
oracle still records exactly what the real code did with the bytes it was
given.  It only wastes vectors on nonsense inputs, which coverage-guided
search then reports as low block coverage.
"""

from __future__ import annotations

from dataclasses import dataclass

from capstone import CS_ARCH_X86, CS_MODE_32, CS_OP_IMM, Cs
from capstone.x86 import (X86_OP_MEM, X86_REG_EBP, X86_REG_ECX, X86_REG_EDX,
                          X86_REG_ESP)

import cfg as cfgmod
import peimage

_MD = Cs(CS_ARCH_X86, CS_MODE_32)
_MD.detail = True

_ECX_ALIASES = {X86_REG_ECX}
_EDX_ALIASES = {X86_REG_EDX}


@dataclass
class AbiGuess:
    cc: str                 # cdecl | stdcall | thiscall | fastcall
    n_args: int             # stack argument dwords
    ret_bytes: int
    confidence: str         # "pinned" | "likely" | "guess"
    reason: str


def _regs_of(ins):
    try:
        return ins.regs_access()
    except Exception:
        return ((), ())


def infer(pe: peimage.PeImage, c: cfgmod.FuncCfg) -> AbiGuess:
    if c.error or not c.insns:
        return AbiGuess("cdecl", 0, 0, "guess", c.error or "empty")

    ret_bytes = c.ret_imm or 0

    # --- ECX / EDX liveness on entry -----------------------------------
    ecx_in = _reg_live_in(pe, c, X86_REG_ECX)
    edx_in = _reg_live_in(pe, c, X86_REG_EDX)

    # --- stack argument extent -----------------------------------------
    max_disp = _max_arg_disp(pe, c)

    if ret_bytes:
        n_args = ret_bytes // 4
        conf = "pinned"
        reason = f"ret {ret_bytes}"
        if ecx_in and edx_in:
            cc = "fastcall"
            n_args = ret_bytes // 4
        elif ecx_in:
            cc = "thiscall"
        else:
            cc = "stdcall"
    else:
        cc = "thiscall" if ecx_in else "cdecl"
        if ecx_in and edx_in:
            cc = "fastcall"
        if max_disp is not None:
            n_args = max(0, (max_disp - 4) // 4 + 1)
            conf = "likely"
            reason = f"max [ebp+{max_disp:#x}]"
        else:
            n_args = 0
            conf = "guess"
            reason = "no ebp-relative arg access seen"
    n_args = min(n_args, 16)
    return AbiGuess(cc, n_args, ret_bytes, conf, reason)


def _reg_live_in(pe: peimage.PeImage, c: cfgmod.FuncCfg, reg: int,
                 limit: int = 24) -> bool:
    """True if `reg` is read before being written on the entry path."""
    addr = c.entry
    for _ in range(limit):
        try:
            code = pe.read(addr, 16)
        except ValueError:
            return False
        ins = next(_MD.disasm(code, addr, count=1), None)
        if ins is None:
            return False
        read, written = _regs_of(ins)
        if reg in read:
            return True
        if reg in written:
            return False
        if ins.mnemonic in cfgmod.TERMINATORS:
            return False
        if ins.mnemonic == "call":
            # A call clobbers ecx/edx under every MSVC convention here.
            return False
        # Deliberately DO NOT stop at a jump.  Measured against the 641 ZHL
        # declarations: bailing at the first branch scored 548/641 (85.5%)
        # because MSVC often stashes ECX after an early guard test; falling
        # through scores 560/641 (87.4%).  Window size past 24 instructions
        # makes no further difference (48/96/160 all score 559).
        addr += ins.size
    return False


def _max_arg_disp(pe: peimage.PeImage, c: cfgmod.FuncCfg) -> int | None:
    """Largest positive [ebp+disp] used, assuming a standard frame."""
    has_frame = False
    try:
        code = pe.read(c.entry, 8)
        i0 = next(_MD.disasm(code, c.entry, count=1), None)
        if i0 is not None and i0.mnemonic == "push" and i0.op_str == "ebp":
            i1 = next(_MD.disasm(pe.read(c.entry + i0.size, 8),
                                 c.entry + i0.size, count=1), None)
            has_frame = bool(i1 and i1.mnemonic == "mov" and i1.op_str == "ebp, esp")
    except ValueError:
        pass
    if not has_frame:
        return _max_esp_disp(pe, c)
    best = None
    for a in c.insns:
        try:
            ins = next(_MD.disasm(pe.read(a, 16), a, count=1), None)
        except ValueError:
            continue
        if ins is None:
            continue
        for op in ins.operands:
            if op.type == X86_OP_MEM and op.mem.base == X86_REG_EBP and \
                    op.mem.index == 0 and op.mem.disp >= 8:
                best = op.mem.disp if best is None else max(best, op.mem.disp)
    return best


def _max_esp_disp(pe: peimage.PeImage, c: cfgmod.FuncCfg) -> int | None:
    """Frameless: [esp+disp] reads in the entry block, before any push."""
    addr = c.entry
    depth = 0
    best = None
    for _ in range(40):
        try:
            ins = next(_MD.disasm(pe.read(addr, 16), addr, count=1), None)
        except ValueError:
            break
        if ins is None:
            break
        if ins.mnemonic == "push":
            depth += 4
        elif ins.mnemonic == "sub" and ins.op_str.startswith("esp,") and \
                ins.operands[1].type == CS_OP_IMM:
            depth += ins.operands[1].imm
        for op in ins.operands:
            if op.type == X86_OP_MEM and op.mem.base == X86_REG_ESP and \
                    op.mem.index == 0:
                d = op.mem.disp - depth
                if d >= 4:
                    best = d if best is None else max(best, d)
        if ins.mnemonic in cfgmod.TERMINATORS or ins.mnemonic.startswith("j") \
                or ins.mnemonic == "call":
            break
        addr += ins.size
    return best
