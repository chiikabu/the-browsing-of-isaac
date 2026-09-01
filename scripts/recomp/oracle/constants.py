"""Branch-constant mining, and valid instances of the shapes this binary uses.

Layout is solved (SSA recovers it at 84.2% pointer accuracy) but coverage
barely moved: SSA gained +2.7 points over blind.  The reason is that reaching
a branch needs a field to EQUAL something, and no layout engine supplies
values.  Two sources of values, used together:

  1. `cmp` / `test` / `sub` / `and` immediates straight out of the
     instruction stream.  Cheap, complete, but unattributed -- it tells you
     0xfff matters somewhere in the function, not which field it tests.
  2. P-Code comparison operands whose other side traces back to a specific
     (root, offset).  Strictly better where it works, because it says
     "capacity at +0x14 is compared against 0xf and 0xfff".  Implemented in
     ssaderef.extract() as `field_consts`.

Neither can produce a valid red-black tree or a string whose length and
capacity agree, so `instantiate_shape` below recognises the two MSVC layouts
that dominate this binary from their access-offset signature and writes a
VALID instance instead of leaving the fuzzer to hit the invariant by luck.
"""

from __future__ import annotations

import os
import struct
import sys

from capstone import CS_ARCH_X86, CS_MODE_32, CS_OP_IMM, Cs

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

_MD = Cs(CS_ARCH_X86, CS_MODE_32)
_MD.detail = True

MINE_MNEMONICS = {"cmp", "test", "sub", "add", "and", "or", "xor", "mov",
                  "movzx", "movsx", "lea"}
COMPARE_ONLY = {"cmp", "test"}


def mine_instructions(pe: peimage.PeImage, cfg, *, compare_only: bool = False,
                      limit: int = 4000) -> list[int]:
    """Immediates the function's own code tests against."""
    out: set[int] = set()
    mn = COMPARE_ONLY if compare_only else MINE_MNEMONICS
    for a in cfg.insns[:limit]:
        try:
            ins = next(_MD.disasm(pe.read(a, 16), a, count=1), None)
        except ValueError:
            continue
        if ins is None or ins.mnemonic not in mn:
            continue
        for op in ins.operands:
            if op.type == CS_OP_IMM:
                v = op.imm & 0xFFFFFFFF
                # addresses inside the image are pointers, not branch values
                if pe.image_base <= v < pe.image_base + pe.size_of_image:
                    continue
                out.add(v)
    return sorted(out)


# ---------------------------------------------------------------------------
# valid instances of the shapes the miner cannot express
# ---------------------------------------------------------------------------

STRING_OFFS = {0x0, 0x10, 0x14}
NODE_OFFS = {0x0, 0x8, 0xD}

SSO_CAP = 0xF
SSO_LIMIT = 0x10


def recognise(offsets: set[int], size: int) -> str | None:
    """Guess an MSVC shape from which offsets the code touches."""
    if {0x10, 0x14} <= offsets and size >= 0x18:
        return "basic_string"
    if 0xD in offsets and ({0x0, 0x8} & offsets):
        return "tree_node"
    return None


def instantiate_shape(o, addr: int, shape: str, rng, *, consts=None,
                      size_hint: int = 0) -> bool:
    """Write a VALID instance of `shape` at `addr`.  Returns True if written.

    This is the part constant mining cannot do: a string whose size and
    capacity agree and whose data pointer is real, or a tree node whose isnil
    flag matches its links.  The SSO boundary at 0xf/0x10 is chosen
    deliberately on both sides rather than stumbled into.
    """
    if shape == "basic_string":
        # Straddle the SSO boundary, but take the CAPACITY from the constants
        # this function actually compares against.  Writing only "valid"
        # capacities cost 0x0040d040 its 0xfff aligned-free path -- a valid
        # instance that never reaches the interesting branch is worthless.
        caps = sorted(set(consts or ()) | {SSO_CAP, 0x1F})
        cap = rng.choice(caps) if rng.random() < 0.5 else rng.choice(
            [SSO_CAP, 0x10, 0x1F, 0x20, 0xFFF, 0x1000])
        cap &= 0xFFFFFFFF
        if cap < SSO_LIMIT:
            n = rng.randrange(0, cap + 1) if cap else 0
            body = bytes(rng.choice(b"abcxyz") for _ in range(n))
            o.write(addr, body + b"\0" * (SSO_LIMIT - n))
            o.write(addr + 0x10, struct.pack("<II", n, cap))
        else:
            alloc = min(cap + 1, 0x400)
            n = min(rng.randrange(0, alloc), alloc - 1)
            body = bytes(rng.choice(b"abcxyz") for _ in range(n))
            heap = o.alloc(alloc, body + b"\0" * (alloc - n), pad_before=0x40)
            # MSVC's aligned free reads the header pointer at [payload-4]
            o.write(heap - 4, struct.pack("<I", (heap - rng.choice(
                [4, 8, 0x10, 0x20, 0x23, 0x24])) & 0xFFFFFFFF))
            o.write(addr, struct.pack("<I", heap))
            o.write(addr + 0x10, struct.pack("<II", n, cap))
        return True

    if shape == "buffer":
        # Byte-granular access: a C string / char array whose real extent is
        # a runtime value.  Give it real content and a NUL somewhere.
        # Never write past the allocation: the guard page is real, and
        # overrunning it turned every buffer vector into a fault.
        cap = max(1, min(size_hint or 0x80, 0x80))
        n = min(rng.choice([1, 2, 4, 8, 16, 32, 64]), cap)
        body = bytearray(rng.choice(b"abcxyz") for _ in range(n))
        if rng.random() < 0.7:
            body[rng.randrange(n)] = 0
        else:
            body[-1] = 0
        try:
            o.write(addr, bytes(body))
        except Exception:
            return False
        return True

    if shape == "tree_node":
        # A self-referential nil node: every link points at itself and isnil
        # is set, which is the terminating state every _Tree walk tests for.
        # Half the time emit a live node instead so both sides of the
        # `isnil` branch are exercised.
        if rng.random() < 0.5:
            o.write(addr, struct.pack("<III", addr, addr, addr))
            o.write(addr + 0xC, bytes([1, 1]))
        else:
            o.write(addr, struct.pack("<III", addr, addr, addr))
            o.write(addr + 0xC, bytes([rng.randrange(2), 0]))
        return True

    return False


def annotate_shapes(lay) -> int:
    """Count shapes.  Recognition itself happens in ssaderef where the access
    WIDTHS are still available; this only fills gaps for layouts that came
    from fault-driven discovery instead."""
    n = 0
    for ob in lay.objs:
        if ob.shape is None:
            offs = set(ob.offsets) | set(ob.field_consts) | set(ob.ptr_fields)
            ob.shape = recognise(offs, ob.size)
        if ob.shape:
            n += 1
    return n
