#!/usr/bin/env python3
"""Compare the original quad-pack PE block with the actual native/Wasm helper.

Run from any directory:
    python scripts/recomp/oracle/quad_pack.py

Dependencies: Python with unicorn, the canonical private PE and its existing
pequery index, LLVM-MinGW clang, Emscripten, and Node. --clang, --emcc, and --node
can override tool discovery. Both targets run by default; --target selects one.
All generated PE-derived fixtures, receipts, binaries, and logs stay under the
ignored output/recomp/oracle/quad-pack directory. Nothing is disassembled here.

Only accepted layouts execute the PE. Every instruction must belong to the
indexed block, no call may execute, and execution must stop before 0xa67af5.
Expected bytes come from that execution, never from the helper. A separately
compiled inline-assembly witness checks NaN ADDSS/SUBSS results at the original
PCs: observed Unicorn payload defects are corrected after that instruction,
before its consumers. Receipts disclose every correction and hardware identity;
this is not advertised as pure Unicorn proof. Ordinary finite arithmetic is
unmodified. Independent rejection fixtures enforce no-write preflight.
Complete watched windows include input, frame, depth, hole, and guard bytes.
Helper results are flags: 0 rejects, 1 handles a layout without format 5, and
3 handles a layout containing format 5. The extra bit concerns dead XMM1 only.
"""
from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import sys
from dataclasses import dataclass, field

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OUT = ROOT / "output/recomp/oracle/quad-pack"
HOST = ROOT / "scripts/recomp/host"
ENTRY, JOIN = 0xA678D1, 0xA67AF5
TABLE, DEPTH, DECREMENT = 0xA67BB0, 0xC798FC, 0xBAA06C
ARENA, ARENA_SIZE = 0x01000000, 0x100000
FRAME, SELF, DESC, ATTR = ARENA + 0x1080, ARENA + 0x3020, ARENA + 0x5020, ARENA + 0x7020
QUAD, UV, DST = ARENA + 0x10000, ARENA + 0x30000, ARENA + 0x50000
WIDTH = (0, 4, 8, 12, 16, 12, 16, 8, 4)
MAGIC = b"QPACK01\0"
# Inputs, not expected arithmetic results. Include both signs and NaN classes.
FLOAT_BITS = (
    0, 0x80000000, 1, 0x80000001, 0x007FFFFF, 0x807FFFFF,
    0x00800000, 0x80800000, 0x33800000, 0xB3800000,
    0x3F000000, 0x3F800000, 0x3F800001, 0xBF800000,
    0x4B800000, 0xCB800000, 0x7F7FFFFF, 0xFF7FFFFF,
    0x7F800000, 0xFF800000, 0x7FC12345, 0xFFC54321,
    0x7F812345, 0xFF854321,
)
RAW_BITS = (0x7FC0CAFE, 0xFFC12345, 0x7F800123, 0xFF800321,
            0x80000000, 1, 0x7FFFFFFF, 0xFFFFFFFF)


def u32(value):
    return struct.pack("<I", value & 0xFFFFFFFF)


def f32bits(value):
    return struct.unpack("<I", struct.pack("<f", value))[0]


def pattern(size, salt=0):
    block = bytes((i * 73 + salt * 19 + 37) & 255 for i in range(256))
    return (block * ((size + 255) // 256))[:size]


@dataclass
class Case:
    name: str
    formats: tuple[int, ...]
    count: int
    args: list[int]
    patches: list[tuple[int, bytes]] = field(default_factory=list)
    accepted: int = 1

    @property
    def result_flags(self):
        return (1 | (2 if 5 in self.formats else 0)) if self.accepted else 0

    def word(self, address, value):
        self.patches.append((address, u32(value)))

    def argument(self, index, value, *frame_offsets):
        self.args[index] = value
        for offset in frame_offsets:
            self.word(self.args[0] + offset, value)


def fixture(name, formats=(5, 6, 7), count=1, shift=0,
            ox=0x3F000000, oy=0xBF800000, positions=None, depth=0x3F800000):
    formats = tuple(formats)
    f, q, uv, dst = FRAME + shift, QUAD + shift, UV + 3 * shift, DST + 5 * shift
    self_va, desc, attrs = SELF + shift, DESC + shift, ATTR + shift
    stride = sum(WIDTH[k] for k in formats)
    c = Case(name, formats, count, [f, q, uv, dst, stride, ox, oy])
    c.patches.extend([(f - 0x80, pattern(0xC0, 1)),
                      (self_va, pattern(0x40, 2)), (desc, pattern(0x30, 3))])
    for offset, value in {
        -0x14: q, -0x1C: self_va, -0x28: stride, -0x2C: count, -0x30: q,
        -0x34: uv, -0x38: stride * 3, -0x3C: dst, -0x40: ox, -0x44: oy,
        -0x48: dst,
    }.items():
        c.word(f + offset, value)
    c.word(f - 0x100, 0x5F000000)  # Oracle.call's preinstalled return sentinel.
    c.word(self_va + 0x24, desc)
    c.word(desc + 0x0C, attrs)
    c.word(desc + 0x10, len(formats))
    c.patches.append((attrs, b"".join(u32(0xABCD0000 + i) + u32(k)
                                    for i, k in enumerate(formats))))
    quads, uvs = bytearray(pattern(112 * count, 4)), bytearray(pattern(36 * count, 5))
    for n in range(count):
        for corner in range(4):
            xy = positions or (f32bits(n * 0.25 + corner * 1.5),
                               f32bits(-n * 0.5 + corner * 2.25))
            struct.pack_into("<II", quads, n * 112 + corner * 8, *xy)
            for component in range(4):
                struct.pack_into("<I", quads, n * 112 + 0x20 + corner * 20 + component * 4,
                                 RAW_BITS[(n + corner + component) % len(RAW_BITS)])
            struct.pack_into("<II", uvs, n * 36 + corner * 8,
                             RAW_BITS[(n + corner) % len(RAW_BITS)],
                             RAW_BITS[(n + corner + 3) % len(RAW_BITS)])
    c.patches.extend([(q, bytes(quads)), (uv, bytes(uvs)),
                      (dst, pattern(4 * stride * count, 6)), (DEPTH, u32(depth))])
    return c


def corpus(pe):
    cases = [fixture(f"format-{k}-{n}-quads", (k,), n, shift=n % 3)
             for k in range(1, 9) for n in (1, 4)]
    for order in itertools.permutations((5, 6, 7)):
        cases.append(fixture("order-" + "".join(map(str, order)), order, 3, shift=1))
    cases += [fixture("all-formats-unaligned", range(1, 9), 5, shift=1),
              fixture("duplicates-and-holes", (5, 1, 6, 7, 5, 8, 7, 6, 4), 7, shift=3),
              fixture("holes-only", (8, 3, 1, 4, 2, 3, 8), 17),
              fixture("many-attributes", tuple(range(1, 9)) * 17, 3, shift=2),
              fixture("depth-recurrence-257", (5, 7, 6), 257, shift=1)]
    cases += [fixture(f"zero-attributes-{n}", (), n, shift=1) for n in (1, 17, 257)]
    empty = fixture("zero-stride-null-unused-pointers", (), 17)
    empty.argument(3, 0, -0x3C, -0x48)
    empty.word(DESC + 0x0C, 0)
    cases.append(empty)
    for left, right in itertools.product(FLOAT_BITS, repeat=2):
        cases.append(fixture(f"float-{left:08x}-{right:08x}", (1, 5, 6, 7, 8, 5),
                             shift=1, ox=left, oy=right, positions=(right, left)))
    cases += [fixture(f"depth-{bits:08x}", (5, 5, 7), 5, depth=bits)
              for bits in FLOAT_BITS]
    for decrement in FLOAT_BITS:
        c = fixture(f"decrement-{decrement:08x}", count=9, depth=0x3F800001)
        c.word(DECREMENT, decrement)
        cases.append(c)
    for depth, decrement in itertools.product(FLOAT_BITS[-4:], repeat=2):
        c = fixture(f"depth-nans-{depth:08x}-{decrement:08x}", count=3, shift=1, depth=depth)
        c.word(DECREMENT, decrement)
        cases.append(c)

    def reject(name, formats=(5, 6, 7)):
        c = fixture("reject-" + name, formats=formats, count=3, shift=0)
        c.accepted = 0
        cases.append(c)
        return c

    for value in (0, 9, 0xFFFFFFFF):
        for index in range(3):
            c = reject(f"unknown-{value:08x}-at-{index}")
            c.word(ATTR + index * 8 + 4, value)
    c = reject("stride-width-mismatch")
    c.argument(4, c.args[4] + 4, -0x28)
    c.word(FRAME - 0x38, c.args[4] * 3)
    reject("saved-triple-stride").word(FRAME - 0x38, 1)
    reject("zero-quads").word(FRAME - 0x2C, 0)
    reject("attribute-span-overflow").word(DESC + 0x10, 0x20000000)
    reject("quad-span-overflow").word(FRAME - 0x2C, 0x40000000)
    for index, offsets, label in ((1, (-0x14, -0x30), "quad"),
                                  (2, (-0x34,), "uv"), (3, (-0x3C, -0x48), "dst")):
        for address, kind in ((0, "null"), (0xFFFFFFF0, "wrap"),
                              (0x1BEFFFF0, "guest-limit")):
            reject(f"{label}-{kind}").argument(index, address, *offsets)
    reject("frame-underflow").args[0] = 0x20
    reject("self-wrap").word(FRAME - 0x1C, 0xFFFFFFF0)
    reject("descriptor-wrap").word(SELF + 0x24, 0xFFFFFFF8)
    reject("attributes-wrap").word(DESC + 0x0C, 0xFFFFFFFC)
    reject("attributes-null").word(DESC + 0x0C, 0)
    for name, address in (("quad", QUAD), ("quad-partial", QUAD - 4), ("uv", UV),
                          ("frame", FRAME - 0x50), ("self", SELF + 0x24),
                          ("descriptor", DESC + 0x0C), ("attributes", ATTR),
                          ("depth", DEPTH), ("decrement", DECREMENT), ("table", TABLE)):
        reject("dst-overlaps-" + name).argument(3, address, -0x3C, -0x48)
    for index, offsets, label in ((1, (-0x14, -0x30), "quad"), (2, (-0x34,), "uv")):
        for name, address in (("frame", FRAME - 0x50), ("depth", DEPTH - 4)):
            reject(label + "-overlaps-" + name).argument(index, address, *offsets)
    for name, address in (("depth", DEPTH - 4), ("frame-scratch", FRAME - 0x60)):
        c = reject("attributes-overlap-" + name)
        attributes = next(data for va, data in c.patches if va == ATTR)
        c.word(DESC + 0x0C, address)
        c.patches.append((address, attributes))
    c = reject("attributes-overlap-frame-counter", formats=(5,))
    c.word(DESC + 0x0C, FRAME - 0x1C)
    c.word(FRAME - 0x18, 5)  # First dword remains the valid self pointer.
    for index in range(8):
        reject(f"mutated-table-{index}").word(TABLE + index * 4, pe.u32(TABLE + index * 4) ^ 4)
    return cases


def window_for(windows, address, size):
    for i, (base, data) in enumerate(windows):
        if base <= address and address + size <= base + len(data):
            return i, address - base
    raise RuntimeError(f"fixture escapes watched guest windows: {address:#x}+{size:#x}")


def merge_ranges(ranges):
    out = []
    for lo, hi in sorted(ranges):
        if out and lo <= out[-1][1]:
            out[-1] = (out[-1][0], max(hi, out[-1][1]))
        else:
            out.append((lo, hi))
    return out


def allowed_writes(c):
    # This describes the write footprint only; never computes expected values.
    f, _, _, dst, stride, _, _ = c.args
    spans = [(f + off, f + off + 4) for off in (-0x14, -0x18, -0x2C, -0x3C)]
    spans.append((DEPTH, DEPTH + 4))
    if 5 in c.formats:
        spans.append((f - 0x50, f - 0x48))
    for n in range(c.count):
        prefix = 0
        for kind in c.formats:
            if kind in (5, 6, 7):
                for corner in range(4):
                    start = dst + (n * 4 + corner) * stride + prefix
                    spans.append((start, start + WIDTH[kind]))
            prefix += WIDTH[kind]
    return merge_ranges(spans)


def capture(c, oracle, windows, code_state, emu, x86):
    before = [bytearray(data) for _, data in windows]
    for address, data in c.patches:
        i, off = window_for(windows, address, len(data))
        before[i][off:off + len(data)] = data
    note = {"case": c.name, "accepted": bool(c.accepted), "formats": c.formats,
            "expected_result_flags": c.result_flags,
            "quads": c.count, "args": [f"0x{v:08x}" for v in c.args]}
    if not c.accepted:
        return [], note
    for (base, _), data in zip(windows, before):
        oracle.write(base, bytes(data))
    f, q, uv, dst, stride, ox, oy = c.args
    oracle.initial_esp = f - 0x100 + 4
    xmm = {"xmm0": 0x112233445566778899AABBCCDDEEFF00,
           "xmm1": 0xF0E0D0C0B0A090807060504030201000,
           "xmm2": (0x102030405060708090A0B0C0 << 32) | ox,
           "xmm3": (0xD0E0F0011223344556677889 << 32) | oy}
    for name, value in xmm.items():
        oracle.uc.reg_write(getattr(x86, "UC_X86_REG_" + name.upper()), value)
    oracle.uc.reg_write(x86.UC_X86_REG_MXCSR, 0x1F80)
    if oracle.uc.reg_read(x86.UC_X86_REG_MXCSR) != 0x1F80:
        raise RuntimeError("could not select default x86 MXCSR")
    code_state.clear()
    code_state.update(executed=0, violations=[], pending=None, sse_checked=0, corrections=[])
    r = oracle.call(ENTRY, until=JOIN, reset=False,
                    regs={"eax": q, "ebx": 0x12345678, "ecx": dst, "edx": stride,
                          "esi": dst, "edi": uv, "ebp": f, "esp": f - 0x100},
                    max_insns=max(100000, c.count * (len(c.formats) + 1) * 512))
    stop = oracle.uc.reg_read(x86.UC_X86_REG_EIP)
    if not r.pure or r.calls or r.stubs or r.models or code_state["violations"] or stop != JOIN:
        raise RuntimeError(f"{c.name}: impure PE execution: stop={stop:#x} term={r.term} "
                           f"calls={len(r.calls)} stubs={r.stubs} models={r.models} "
                           f"fault={r.fault_va} code={code_state} error={r.error}")
    if code_state["pending"] is not None:
        raise RuntimeError(f"{c.name}: hardware comparison did not reach the next original instruction")
    footprint = allowed_writes(c)
    for address, data in r.writes:
        if not any(lo <= address and address + len(data) <= hi for lo, hi in footprint):
            raise RuntimeError(f"{c.name}: original PE wrote input/hole/guard at {address:#x}")
    writes = [(lo, oracle.read(lo, hi - lo)) for lo, hi in emu.merge_writes(r.writes)]
    after = [bytearray(data) for data in before]
    for address, data in writes:
        i, off = window_for(windows, address, len(data))
        after[i][off:off + len(data)] = data
    for (base, _), data in zip(windows, after):
        if oracle.read(base, len(data)) != data:
            raise RuntimeError(f"{c.name}: unrecorded PE write in window {base:#x}")
    for reg, expected in {"eax": q + 112 * c.count, "edi": uv + 36 * c.count,
                          "esi": dst + 4 * stride * c.count, "edx": stride,
                          "ecx": dst + 4 * stride * (c.count - 1), "ebx": 0x12345678,
                          "ebp": f, "esp": f - 0x100}.items():
        if r.regs[reg] != expected:
            raise RuntimeError(f"{c.name}: PE join {reg}={r.regs[reg]:#x}, expected {expected:#x}")
    out_xmm = {name: oracle.uc.reg_read(getattr(x86, "UC_X86_REG_" + name.upper()))
               for name in xmm}
    if any(out_xmm[name] != xmm[name] for name in ("xmm2", "xmm3")) or r.eflags != 0x44:
        raise RuntimeError(f"{c.name}: PE join offset registers/flags changed unexpectedly")
    note.update(entry_va=f"0x{ENTRY:08x}", stop_va=f"0x{stop:08x}", opaque_calls=0,
                stubs=0, models=0, instructions=code_state["executed"], eflags=f"0x{r.eflags:03x}",
                mxcsr_before="0x00001f80", mxcsr_after=f"0x{oracle.uc.reg_read(x86.UC_X86_REG_MXCSR):08x}",
                regs_out={k: f"0x{v:08x}" for k, v in r.regs.items() if k != "esp_delta"},
                xmm_out={k: f"0x{v:032x}" for k, v in out_xmm.items()},
                write_ranges=[[f"0x{a:08x}", len(d)] for a, d in writes], guards_unchanged=True)
    note.update(unicorn_pure=not code_state["corrections"],
                hardware_sse_checked=code_state["sse_checked"],
                hardware_sse_corrections=code_state["corrections"])
    for name, address, size in (("quad", q, 112 * c.count), ("uv", uv, 36 * c.count),
                                 ("frame", f - 0x50, 0x68), ("destination", dst, 4 * stride * c.count),
                                 ("depth", DEPTH, 4)):
        if not size:
            note[name] = {"bytes": 0}
            continue
        i, off = window_for(windows, address, size)
        old, new = before[i][off:off + size], after[i][off:off + size]
        note[name] = {"bytes": size, "before_sha256": hashlib.sha256(old).hexdigest(),
                      "after_sha256": hashlib.sha256(new).hexdigest()}
        if name == "depth":
            note[name].update(before_bits="0x%08x" % struct.unpack("<I", old)[0],
                              after_bits="0x%08x" % struct.unpack("<I", new)[0])
        if name in ("quad", "uv") and old != new:
            raise RuntimeError(f"{c.name}: original PE changed {name} input")
    return writes, note


def put_patches(stream, patches):
    patches = [(a, d) for a, d in patches if d]
    stream.write(u32(len(patches)))
    for address, data in patches:
        stream.write(u32(address) + u32(len(data)) + data)


def generate(args):
    # Set before importing emu; its default pool is outside the guest map.
    os.environ["ISAAC_ORACLE_HEAP_BASE"] = "0x08000000"
    sys.path.insert(0, str(ROOT / "scripts/decomp/tools"))
    import pequery
    import peimage
    import emu
    import unicorn
    from unicorn import x86_const as x86
    from pe import index_db_path

    canonical = pequery.pe()
    pe = peimage.load(str(canonical.path))
    if pe.sha256.upper() != canonical.sha256:
        raise RuntimeError("indexed image and emulator image hashes disagree")
    if not index_db_path(canonical).is_file():
        raise RuntimeError("PE index missing; run python scripts/decomp/tools/build-pe-index.py")
    index_metadata = dict(pequery.db().execute("SELECT key,value FROM meta ORDER BY key"))
    rows = pequery.db().execute("SELECT va,size,mn FROM insn WHERE va>=? AND va<=? ORDER BY va",
                                (ENTRY, JOIN)).fetchall()
    indexed = {va: (size, mn) for va, size, mn in rows}
    if ENTRY not in indexed or JOIN not in indexed:
        raise RuntimeError("existing PE index does not contain both exact block boundaries")
    calls = {va for va, _, mn in rows if mn.startswith("call")}
    hardware, witness_receipt = sse_witness(args, pe.u32(DECREMENT))
    windows = [(base, pe.read(base, 0x10000)) for base in (0xA60000, 0xBA0000, 0xC70000)]
    windows.append((ARENA, pattern(ARENA_SIZE, 17)))
    oracle = emu.Oracle(pe)
    oracle.uc.mem_map(ARENA, ARENA_SIZE, unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
    code_state = {}
    # Canonical indexed operand locations. Let the instruction execute first;
    # only a witnessed NaN discrepancy is corrected at the following PC.
    sse_sites = {
        0xA67979: ("addss", x86.UC_X86_REG_XMM0, 4),
        0xA6797E: ("addss", x86.UC_X86_REG_XMM1, 0),
        0xA679AD: ("addss", x86.UC_X86_REG_XMM0, 12),
        0xA679B2: ("addss", x86.UC_X86_REG_XMM1, 8),
        0xA679E5: ("addss", x86.UC_X86_REG_XMM0, 20),
        0xA679EA: ("addss", x86.UC_X86_REG_XMM1, 16),
        0xA67A20: ("addss", x86.UC_X86_REG_XMM0, 28),
        0xA67A25: ("addss", x86.UC_X86_REG_XMM1, 24),
        0xA67AD6: ("subss", x86.UC_X86_REG_XMM0, DECREMENT),
    }
    for pc, (opcode, _, _) in sse_sites.items():
        if pc not in indexed or indexed[pc][1] != opcode:
            raise RuntimeError(f"indexed SSE instruction mismatch at {pc:#x}")

    def audit_instruction(uc, address, size, _):
        pending = code_state["pending"]
        if pending is not None:
            pc, reg, left, right, expected, expected_mxcsr = pending
            full = uc.reg_read(reg)
            actual, actual_mxcsr = full & 0xFFFFFFFF, uc.reg_read(x86.UC_X86_REG_MXCSR)
            if (actual, actual_mxcsr) != (expected, expected_mxcsr):
                code_state["corrections"].append({
                    "pc": f"0x{pc:08x}", "left": f"0x{left:08x}", "right": f"0x{right:08x}",
                    "unicorn": f"0x{actual:08x}", "hardware": f"0x{expected:08x}",
                    "unicorn_mxcsr": f"0x{actual_mxcsr:08x}", "hardware_mxcsr": f"0x{expected_mxcsr:08x}",
                })
                uc.reg_write(reg, (full & ~0xFFFFFFFF) | expected)
                uc.reg_write(x86.UC_X86_REG_MXCSR, expected_mxcsr)
            code_state["pending"] = None
        if address in calls or address not in indexed or address == JOIN or indexed[address][0] != size:
            code_state["violations"].append({"va": f"0x{address:08x}", "call": address in calls})
            uc.emu_stop()
        else:
            code_state["executed"] += 1
            site = sse_sites.get(address)
            if site is not None:
                opcode, reg, offset = site
                left = uc.reg_read(reg) & 0xFFFFFFFF
                source = offset if opcode == "subss" else uc.reg_read(x86.UC_X86_REG_EAX) + offset
                right = struct.unpack("<I", oracle.read(source, 4))[0]
                if any((v & 0x7FFFFFFF) > 0x7F800000 for v in (left, right)):
                    witnessed = hardware.get((opcode, left, right))
                    if witnessed is None:
                        raise RuntimeError(f"no native witness for {opcode} at {address:#x}: {left:#x}, {right:#x}")
                    result, mxcsr = witnessed
                    before_mxcsr = uc.reg_read(x86.UC_X86_REG_MXCSR)
                    code_state["pending"] = (address, reg, left, right, result, before_mxcsr | (mxcsr & 0x3F))
                    code_state["sse_checked"] += 1

    hook = oracle.uc.hook_add(unicorn.UC_HOOK_CODE, audit_instruction)
    cases = corpus(pe)
    notes = []
    with (OUT / "corpus.bin").open("wb") as stream:
        stream.write(MAGIC + u32(len(windows)))
        for address, data in windows:
            stream.write(u32(address) + u32(len(data)) + data)
        stream.write(u32(len(cases)))
        for c in cases:
            writes, note = capture(c, oracle, windows, code_state, emu, x86)
            name = c.name.encode("ascii")
            stream.write(u32(len(name)) + name + u32(c.result_flags) + struct.pack("<7I", *c.args))
            put_patches(stream, c.patches)
            put_patches(stream, writes)
            notes.append(note)
    oracle.uc.hook_del(hook)
    (OUT / "cases.json").write_text(json.dumps(notes, indent=2) + "\n", encoding="utf-8")
    corrections = [row for note in notes for row in note.get("hardware_sse_corrections", [])]
    by_pc = {}
    for row in corrections:
        by_pc[row["pc"]] = by_pc.get(row["pc"], 0) + 1
    witness_receipt.update(
        checked_operations=sum(note.get("hardware_sse_checked", 0) for note in notes),
        corrected_operations=len(corrections), corrections_by_pc=by_pc,
        corrected_cases=sum(bool(note.get("hardware_sse_corrections")) for note in notes),
        scope="NaN operands only; result/MXCSR correction after original ADDSS/SUBSS, before its consumer",
        defect="Unicorn NaN payload propagation differs from observed native SSE",
    )
    return {"canonical_sha256": canonical.sha256, "entry_va": f"0x{ENTRY:08x}",
            "stop_va": f"0x{JOIN:08x}", "accepted": sum(c.accepted for c in cases),
            "rejected_guards": sum(not c.accepted for c in cases), "opaque_calls": 0,
            "stubs": 0, "models": 0, "mxcsr": "0x00001f80",
            "accepted_expected_source": "original-pe+native-sse-witness",
            "rejected_expected_source": "preflight-contract", "sse_witness": witness_receipt,
            "unicorn_version": unicorn.__version__,
            "indexed_instructions": len(rows), "indexed_call_sites_not_executed": sorted(calls),
            "index_metadata": index_metadata,
            "corpus_sha256": hashlib.sha256((OUT / "corpus.bin").read_bytes()).hexdigest(),
            "watched_bytes_per_case": sum(len(data) for _, data in windows)}


def find_tool(override, env_name, candidates):
    for candidate in (override, os.environ.get(env_name), *map(str, candidates)):
        if candidate:
            resolved = shutil.which(candidate)
            if resolved:
                return resolved
            if Path(candidate).is_file():
                return str(Path(candidate).resolve())
    raise RuntimeError(f"missing {env_name}: use --{env_name.lower()} or set {env_name}")


def command(label, args):
    result = subprocess.run(list(map(str, args)), cwd=ROOT, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
    (OUT / (label + ".log")).write_text(result.stdout + result.stderr, encoding="utf-8")
    (OUT / (label + ".command.json")).write_text(json.dumps(list(map(str, args)), indent=2) + "\n",
                                               encoding="utf-8")
    return result


def sse_witness(args, decrement):
    # Include both NaN signs with identical payloads as well as every operand
    # the focused corpus can present to a NaN-producing scalar instruction.
    values = sorted(set(FLOAT_BITS + (decrement, 0xFFC12345, 0x7FC54321, 0xFF812345, 0x7F854321)))
    inputs = OUT / "sse-inputs.bin"
    inputs.write_bytes(u32(len(values)) + b"".join(map(u32, values)))
    source, exe = HERE / "quad_pack_sse_witness.c", OUT / "sse_witness.exe"
    cc = find_tool(args.clang, "CLANG", [Path.home() / "Tools/llvm-mingw/bin/clang.exe"])
    built = command("sse-witness-build", [
        cc, "--target=x86_64-w64-windows-gnu", "-O2", "-std=gnu11",
        "-fno-fast-math", "-ffp-contract=off", source, "-o", exe])
    if built.returncode:
        raise RuntimeError("native SSE witness compile failed\n" + built.stderr[-6000:])
    ran = command("sse-witness-run", [exe, inputs])
    if ran.returncode:
        raise RuntimeError("native SSE witness failed\n" + ran.stderr[-2000:])
    (OUT / "sse-witness.jsonl").write_text(ran.stdout, encoding="utf-8")
    rows = [json.loads(line) for line in ran.stdout.splitlines()]
    metadata = rows[0]
    if metadata["mxcsr"] != "0x00001f80":
        raise RuntimeError("native SSE witness did not use default MXCSR")
    hardware = {}
    for row in rows[1:]:
        left, right = int(row["left"], 16), int(row["right"], 16)
        for opcode, flags in (("addss", "add_mxcsr"), ("subss", "sub_mxcsr")):
            hardware[opcode, left, right] = (int(row[opcode], 16), int(row[flags], 16))
    if len(hardware) != 2 * len(values) ** 2:
        raise RuntimeError("incomplete native SSE witness matrix")
    receipt = {**metadata, "compiler": cc, "input_values": len(values),
               "instruction_results": len(hardware),
               "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
               "executable_sha256": hashlib.sha256(exe.read_bytes()).hexdigest(),
               "results_sha256": hashlib.sha256(ran.stdout.encode("utf-8")).hexdigest()}
    return hardware, receipt


def compare_target(target, args):
    common = ["-O2", "-std=gnu11", "-fno-fast-math", "-ffp-contract=off",
              "-ffunction-sections", "-fdata-sections", "-I", str(HOST / "include"),
              str(HERE / "quad_pack_runner.c"), str(HOST / "src/host_fastpath.c"),
              "-Wl,--gc-sections"]
    if target == "native":
        cc = find_tool(args.clang, "CLANG", [Path.home() / "Tools/llvm-mingw/bin/clang.exe"])
        exe = OUT / "quad_pack_native.exe"
        build = [cc, "--target=x86_64-w64-windows-gnu", *common,
                 "-Wl,--image-base,0x140000000", "-o", exe]
        run = [exe, OUT / "corpus.bin"]
    else:
        cc = find_tool(args.emcc, "EMCC", [Path.home() / "emsdk/upstream/emscripten/emcc.exe", "emcc"])
        node = find_tool(args.node, "NODE", ["node"])
        exe = OUT / "quad_pack_wasm.js"
        (OUT / "package.json").write_text('{"type":"commonjs"}\n', encoding="utf-8")
        build = [cc, *common, "-msimd128", "-sINITIAL_MEMORY=536870912",
                 "-sALLOW_MEMORY_GROWTH=1", "-sMAXIMUM_MEMORY=4294967296",
                 "-sGLOBAL_BASE=469762048", "-sSTACK_SIZE=1048576", "-sENVIRONMENT=node",
                 "-sNODERAWFS=1", "-sEXIT_RUNTIME=1", "-sASSERTIONS=1",
                 '-sEXPORTED_FUNCTIONS=["_main","_isaac_fast_entity_quad_pack"]', "-o", exe]
        run = [node, exe, OUT / "corpus.bin"]
    compiled = command(target + "-build", build)
    if compiled.returncode:
        raise RuntimeError(f"{target} compile failed; {OUT / (target + '-build.log')}\n"
                           + compiled.stderr[-6000:])
    executed = command(target + "-run", run)
    summary = next((json.loads(line) for line in reversed(executed.stdout.splitlines())
                    if line.startswith('{"accepted":')), None)
    if executed.returncode or summary is None:
        details = [line for line in executed.stdout.splitlines() if line.startswith("MISMATCH")]
        raise RuntimeError(f"{target} mismatch/crash (exit {executed.returncode}); "
                           f"{OUT / (target + '-run.log')}\n"
                           + "\n".join(details[:20] or executed.stdout.splitlines()[-8:])
                           + "\n" + executed.stderr[-2000:])
    return {"compiler": cc, "exit": executed.returncode, **summary}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--target", choices=("both", "native", "wasm"), default="both")
    parser.add_argument("--clang")
    parser.add_argument("--emcc")
    parser.add_argument("--node")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    receipt = {"ok": False, "targets": {}, "errors": []}
    try:
        receipt.update(generate(args))
        for target in (("native", "wasm") if args.target == "both" else (args.target,)):
            try:
                result = compare_target(target, args)
                if (result["accepted"], result["rejected"]) != (receipt["accepted"], receipt["rejected_guards"]):
                    raise RuntimeError(f"{target}: runner did not execute the complete corpus")
                receipt["targets"][target] = result
            except (OSError, RuntimeError) as error:
                receipt["errors"].append(str(error))
    except (OSError, RuntimeError, ImportError) as error:
        receipt["errors"].append(str(error))
    receipt["ok"] = not receipt["errors"]
    (OUT / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    return 0 if receipt["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
