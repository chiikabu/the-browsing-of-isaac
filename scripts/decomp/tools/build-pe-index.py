#!/usr/bin/env python3
"""Build the persistent PE instruction/xref index (one-time per binary hash).

Output: output/decomp/<hash12>/index/pe-index.sqlite

Why this exists: every prior session re-implemented linear decode + census and
re-hit the same measured traps (decode halting at the first bad byte, back-scan
phantom sites, jump-table bytes misdecoded as code, register-held call sites
invisible to static-disp censuses). This builder does the decode ONCE, with the
traps engineered out, and every census afterwards is a sub-second SQL query via
pequery.py.

Decode config (record with any number you cite): linear+skipdata+jtab-mask v1
 - full .text linear decode, capstone skipdata resync (never halts)
 - jump tables (`jmp [reg*4+disp32]` with an in-.text table) detected by byte
   scan, validated (>=2 consecutive in-.text targets), masked out of the decode,
   and their entries recorded as `jtab` xrefs
 - every memory operand with an in-image absolute displacement recorded as a
   read/write/rw xref (capstone operand access bits, not a hand mnemonic table),
   including scaled-index forms like [eax*4+0xc79100]
 - every non-branch immediate that lands in the image recorded as an `addr`
   xref (address-escape evidence: function-pointer loads, pushed addresses)
 - `call [slot]` where the slot is file-backed and holds a .text VA is resolved
   at build time to a `call_slot` xref to the real target
 - every register-relative memory operand (`[reg+disp]`, `[reg+idx*s+disp]`,
   base != esp/ebp) recorded in the `fld` table as (va, disp, r/w/rw/addr,
   base register, operand size) — the OBJECT-FIELD census (`pequery.py
   fieldrefs 0x2654c [FUNC]`) that absolute-displacement xrefs cannot answer
   ("does anything in this function write [Game+0x1ba84]?"). Locals and
   arguments (esp/ebp-relative) are deliberately excluded as noise.
Known limitation: byte-index tables that follow some dword jump tables are not
masked; a handful of misdecoded instructions can remain near switch heads.
Always confirm a surprising census result with `pequery.py disasm` around it.
"""
from __future__ import annotations

import sqlite3
import struct
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe import PEImage, ZeroAtLoad, index_db_path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM, X86_OP_MEM, X86_OP_REG
from capstone import CS_AC_READ, CS_AC_WRITE

BATCH = 50_000

SCHEMA = """
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE insn (va INTEGER PRIMARY KEY, size INTEGER, mn TEXT, ops TEXT);
CREATE TABLE xref (src INTEGER, dst INTEGER, kind TEXT);
CREATE TABLE func (start INTEGER PRIMARY KEY, end INTEGER, ninsn INTEGER);
CREATE TABLE imp (va INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE str (va INTEGER PRIMARY KEY, s TEXT);
CREATE TABLE seg (start INTEGER, end INTEGER, kind TEXT);
CREATE TABLE fld (va INTEGER, disp INTEGER, kind TEXT, base TEXT, size INTEGER);
"""


def find_jump_tables(pe: PEImage) -> tuple[dict[int, list[int]], list[tuple[int, int]]]:
    """Byte-scan .text for `jmp dword ptr [reg*4+disp32]` (FF 24 SIB disp32).
    Returns ({table_base_va: [targets...]}, [(mask_start, mask_end)...]).
    A table is only accepted with >=2 consecutive valid in-.text targets."""
    text = pe.text
    raw = pe.buf[text.raw_ptr : text.raw_ptr + text.raw_size]
    sibs = {0x85, 0x8D, 0x95, 0x9D, 0xAD, 0xB5, 0xBD}  # scale=4, base=disp32, real index
    tables: dict[int, list[int]] = {}
    i = 0
    n = len(raw)
    while i < n - 7:
        if raw[i] == 0xFF and raw[i + 1] == 0x24 and raw[i + 2] in sibs:
            disp = struct.unpack_from("<I", raw, i + 3)[0]
            if text.contains(disp):
                targets = []
                off = disp - text.va
                while off + 4 <= text.raw_size and len(targets) < 4096:
                    t = struct.unpack_from("<I", raw, off)[0]
                    if not text.contains(t):
                        break
                    targets.append(t)
                    off += 4
                if len(targets) >= 2:
                    tables.setdefault(disp, targets)
            i += 7
            continue
        i += 1
    masks = sorted((base, base + 4 * len(tgts)) for base, tgts in tables.items())
    # merge overlaps
    merged: list[tuple[int, int]] = []
    for s, e in masks:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return tables, merged


def scan_strings(pe: PEImage) -> list[tuple[int, str]]:
    """ASCII runs >=5 chars ending in NUL. Tab/LF/CR count as in-run bytes so
    newline-terminated log strings ("...was not set.\\n") are captured whole."""
    out = []
    printable = set(range(0x20, 0x7F)) | {0x09, 0x0A, 0x0D}
    for sec in pe.sections:
        if sec.name not in (".rdata", ".data"):
            continue
        raw = pe.buf[sec.raw_ptr : sec.raw_ptr + sec.raw_size]
        i, n = 0, len(raw)
        while i < n:
            j = i
            while j < n and raw[j] in printable:
                j += 1
            if j - i >= 5 and j < n and raw[j] == 0:
                out.append((sec.va + i, raw[i:j].decode("ascii")))
            i = j + 1
    return out


def main() -> int:
    t0 = time.time()
    pe = PEImage()
    db_path = index_db_path(pe)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()
    db = sqlite3.connect(db_path)
    db.executescript(SCHEMA)
    db.execute("PRAGMA journal_mode=OFF")
    db.execute("PRAGMA synchronous=OFF")

    text = pe.text
    image_base, image_end = pe.image_base, pe.image_end

    print(f"[1/5] jump tables ...", flush=True)
    tables, masks = find_jump_tables(pe)
    jtab_rows = []
    for base, tgts in tables.items():
        for k, t in enumerate(tgts):
            jtab_rows.append((base + 4 * k, t, "jtab"))
    db.executemany("INSERT INTO xref VALUES (?,?,?)", jtab_rows)
    db.executemany(
        "INSERT INTO seg VALUES (?,?,?)", [(s, e, "jtab") for s, e in masks]
    )
    print(f"      {len(tables)} tables, {sum(len(t) for t in tables.values())} entries, "
          f"{sum(e - s for s, e in masks)} bytes masked", flush=True)

    print(f"[2/5] linear decode of .text ...", flush=True)
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    md.skipdata = True

    # decode the gaps between masked table regions
    gaps = []
    cur = text.va
    text_raw_end_va = text.va + text.raw_size
    for s, e in masks:
        if s > cur:
            gaps.append((cur, s))
        cur = max(cur, e)
    if cur < text_raw_end_va:
        gaps.append((cur, text_raw_end_va))

    insn_rows: list[tuple] = []
    xref_rows: list[tuple] = []
    fld_rows: list[tuple] = []
    # capstone register ids for the frame/stack pointers (excluded from fld)
    import capstone.x86 as _x86
    stack_regs = {_x86.X86_REG_ESP, _x86.X86_REG_EBP, _x86.X86_REG_SP, _x86.X86_REG_BP}
    call_targets: set[int] = set()
    int3_starts: list[int] = []   # VA right after an int3/pad run
    total, resync = 0, 0

    def flush():
        nonlocal insn_rows, xref_rows, fld_rows
        db.executemany("INSERT OR REPLACE INTO insn VALUES (?,?,?,?)", insn_rows)
        db.executemany("INSERT INTO xref VALUES (?,?,?)", xref_rows)
        db.executemany("INSERT INTO fld VALUES (?,?,?,?,?)", fld_rows)
        insn_rows, xref_rows, fld_rows = [], [], []

    branch_mn_call = {"call", "lcall"}
    first_gap = True
    for gs, ge in gaps:
        goff = pe.va_to_off(gs)
        buf = pe.buf[goff : goff + (ge - gs)]
        # Only the very first gap begins at a true boundary (.text start).
        # Later gaps resume mid-function after a masked jump table.
        prev_was_pad = first_gap
        first_gap = False
        for insn in md.disasm(buf, gs):
            mn = insn.mnemonic
            if mn == ".byte":
                resync += insn.size
                prev_was_pad = False
                continue
            total += 1
            if mn == "int3" or (mn == "nop" and prev_was_pad):
                prev_was_pad = True
            else:
                if prev_was_pad:
                    int3_starts.append(insn.address)
                prev_was_pad = False
            insn_rows.append((insn.address, insn.size, mn, insn.op_str))
            grp_call = mn in branch_mn_call
            grp_jmp = mn == "jmp" or mn == "ljmp"
            grp_jcc = mn.startswith("j") and not grp_jmp
            for op in insn.operands:
                if op.type == X86_OP_IMM:
                    imm = op.imm & 0xFFFFFFFF
                    if grp_call:
                        xref_rows.append((insn.address, imm, "call"))
                        call_targets.add(imm)
                    elif grp_jmp:
                        xref_rows.append((insn.address, imm, "jmp"))
                    elif grp_jcc:
                        xref_rows.append((insn.address, imm, "jcc"))
                    elif image_base <= imm < image_end:
                        xref_rows.append((insn.address, imm, "addr"))
                elif op.type == X86_OP_MEM:
                    m = op.mem
                    disp = m.disp & 0xFFFFFFFF
                    absolute = m.base == 0 and m.index == 0
                    if m.base != 0 and m.base not in stack_regs and m.segment == 0:
                        # object-field census row: signed displacement off a
                        # register base; kind from the access bits (lea = addr)
                        if mn == "lea":
                            fkind = "addr"
                        else:
                            fr = bool(op.access & CS_AC_READ)
                            fw = bool(op.access & CS_AC_WRITE)
                            fkind = "rw" if (fr and fw) else ("w" if fw else "r")
                        fld_rows.append((insn.address, m.disp, fkind, insn.reg_name(m.base), op.size))
                    in_img = image_base <= disp < image_end
                    if grp_call:
                        if absolute and in_img:
                            xref_rows.append((insn.address, disp, "call_mem"))
                        else:
                            xref_rows.append((insn.address, 0, "call_reg"))
                    elif grp_jmp:
                        if absolute and in_img:
                            xref_rows.append((insn.address, disp, "jmp_mem"))
                    elif in_img:
                        if mn == "lea":
                            xref_rows.append((insn.address, disp, "addr"))
                        else:
                            r = bool(op.access & CS_AC_READ)
                            w = bool(op.access & CS_AC_WRITE)
                            kind = "mem_rw" if (r and w) else ("mem_w" if w else "mem_r")
                            if not absolute:
                                kind += "_idx"
                            xref_rows.append((insn.address, disp, kind))
                elif op.type == X86_OP_REG:
                    if grp_call:
                        xref_rows.append((insn.address, 0, "call_reg"))
            if len(insn_rows) >= BATCH:
                flush()
                print(f"      ... {total} insns @ 0x{insn.address:08x}", flush=True)
    flush()
    print(f"      {total} instructions, {resync} resync bytes", flush=True)

    print(f"[3/5] resolving call_mem slots + imports ...", flush=True)
    imports = pe.imports()
    db.executemany("INSERT OR REPLACE INTO imp VALUES (?,?)", list(imports.items()))
    slot_rows = []
    for (src, dst) in db.execute(
        "SELECT src, dst FROM xref WHERE kind='call_mem'"
    ).fetchall():
        if dst in imports:
            continue
        try:
            tgt = pe.u32(dst)
        except (KeyError, ZeroAtLoad):
            continue
        if text.contains(tgt):
            slot_rows.append((src, tgt, "call_slot"))
            call_targets.add(tgt)
    db.executemany("INSERT INTO xref VALUES (?,?,?)", slot_rows)
    print(f"      {len(imports)} imports, {len(slot_rows)} call_slot resolutions", flush=True)

    print(f"[4/5] function segmentation ...", flush=True)
    starts = sorted(
        {s for s in call_targets if text.contains(s)} | set(int3_starts)
    )
    func_rows = []
    for i, s in enumerate(starts):
        e = starts[i + 1] if i + 1 < len(starts) else text_raw_end_va
        func_rows.append((s, e))
    db.executemany("INSERT INTO func (start, end, ninsn) VALUES (?,?,0)", func_rows)
    db.execute(
        "UPDATE func SET ninsn = (SELECT COUNT(*) FROM insn WHERE va >= func.start AND va < func.end)"
    )
    print(f"      {len(func_rows)} function starts", flush=True)

    print(f"[5/5] strings + indexes ...", flush=True)
    db.executemany("INSERT OR REPLACE INTO str VALUES (?,?)", scan_strings(pe))
    db.execute("CREATE INDEX ix_xref_dst ON xref(dst, kind)")
    db.execute("CREATE INDEX ix_xref_src ON xref(src)")
    db.execute("CREATE INDEX ix_func_end ON func(end)")
    db.execute("CREATE INDEX ix_fld_disp ON fld(disp)")
    db.execute("CREATE INDEX ix_fld_va ON fld(va)")

    meta = {
        "sha256": pe.sha256,
        "decode_config": "linear+skipdata+jtab-mask v2 (+fld object-field census)",
        "capstone": __import__("capstone").__version__,
        "insn_total": str(total),
        "resync_bytes": str(resync),
        "jtab_tables": str(len(tables)),
        "jtab_masked_bytes": str(sum(e - s for s, e in masks)),
        "built_unix": str(int(time.time())),
        "elapsed_s": f"{time.time() - t0:.1f}",
        "sections": ";".join(
            f"{s.name}:va=0x{s.va:x},vsize=0x{s.vsize:x},raw=0x{s.raw_ptr:x},rawsz=0x{s.raw_size:x}"
            for s in pe.sections
        ),
    }
    db.executemany("INSERT INTO meta VALUES (?,?)", list(meta.items()))
    db.commit()
    db.close()
    print(f"done in {time.time() - t0:.1f}s -> {db_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
