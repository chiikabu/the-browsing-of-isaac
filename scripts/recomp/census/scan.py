"""Reusable .text reference scanners.

All scanners key on an exact 32-bit immediate matching a known target VA, which
is what keeps the false-positive rate negligible: for a target set of size N,
the expected number of random 4-byte immediates in a 7.43 MB .text that happen
to equal a member of the set is 7.43e6 * N / 2^32 (e.g. N=3226 -> ~0.006).
"""

import struct
from collections import defaultdict

MOV_REG_ABS = {0x05: "eax", 0x0D: "ecx", 0x15: "edx", 0x1D: "ebx",
               0x25: "esp", 0x2D: "ebp", 0x35: "esi", 0x3D: "edi"}


def text_bounds(pe):
    t = pe.section(".text")
    return t.raw_offset, t.raw_offset + t.raw_size, pe.image_base + t.rva


def scan_all(pe, target_vas):
    """One pass over .text collecting every reference form against target_vas.

    Returns dict: va -> {callIndirect, jmpIndirect, pushIndirect, movIndirect,
                         callRel32, jmpRel32, pushImm, movImm}
    plus a map of indirect-jmp thunk sites (FF 25) for thunk chasing.
    """
    lo, hi, base_va = text_bounds(pe)
    d = pe.data
    out = defaultdict(lambda: defaultdict(int))
    thunks = {}
    i = lo
    while i < hi - 6:
        b = d[i]
        if b == 0xFF:
            b1 = d[i + 1]
            if b1 in (0x15, 0x25, 0x35):
                imm = struct.unpack_from("<I", d, i + 2)[0]
                if imm in target_vas:
                    site = base_va + (i - lo)
                    key = {0x15: "callIndirect", 0x25: "jmpIndirect", 0x35: "pushIndirect"}[b1]
                    out[imm][key] += 1
                    if b1 == 0x25:
                        thunks[site] = imm
                    i += 6
                    continue
        elif b == 0x8B:
            if d[i + 1] in MOV_REG_ABS:
                imm = struct.unpack_from("<I", d, i + 2)[0]
                if imm in target_vas:
                    out[imm]["movIndirect"] += 1
                    i += 6
                    continue
        elif b == 0xA1:
            imm = struct.unpack_from("<I", d, i + 1)[0]
            if imm in target_vas:
                out[imm]["movIndirect"] += 1
                i += 5
                continue
        elif b in (0xE8, 0xE9):
            rel = struct.unpack_from("<i", d, i + 1)[0]
            site = base_va + (i - lo)
            tgt = (site + 5 + rel) & 0xFFFFFFFF
            if tgt in target_vas:
                out[tgt]["callRel32" if b == 0xE8 else "jmpRel32"] += 1
        elif b == 0x68:
            imm = struct.unpack_from("<I", d, i + 1)[0]
            if imm in target_vas:
                out[imm]["pushImm"] += 1
        elif b in (0xB8, 0xB9, 0xBA, 0xBB, 0xBD, 0xBE, 0xBF):
            imm = struct.unpack_from("<I", d, i + 1)[0]
            if imm in target_vas:
                out[imm]["movImm"] += 1
        i += 1
    return out, thunks


def scan_data_pointers(pe, target_vas, sections=(".rdata", ".data")):
    """Aligned dword pointers into target_vas (vtables, dispatch tables)."""
    hits = defaultdict(int)
    where = defaultdict(list)
    for name in sections:
        s = pe.section(name)
        if not s:
            continue
        lo, hi = s.raw_offset, s.raw_offset + s.raw_size
        for i in range(lo, hi - 4, 4):
            v = struct.unpack_from("<I", pe.data, i)[0]
            if v in target_vas:
                hits[v] += 1
                if len(where[v]) < 8:
                    where[v].append(pe.image_base + pe.off_to_rva(i))
    return hits, where
