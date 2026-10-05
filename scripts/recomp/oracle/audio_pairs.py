#!/usr/bin/env python3
"""Execute the canonical PE pair loop against the actual native and Wasm patch.

Run: python scripts/recomp/oracle/audio_pairs.py

Requires the canonical private PE, its existing pequery index, Unicorn,
LLVM-MinGW clang, Emscripten, Node, and the generated recomp_state.h. Tool paths
and --state-dir may be overridden. Both targets and modes 0/1/2 run by default.
All generated fixtures, PE/index metadata, compiled patch includes, binaries,
and receipts stay under ignored output/recomp/oracle/audio-pairs/.

Accepted expectations come from executing 0x00aa27b0 until BEFORE 0x00aa27f6.
The existing real ADDSS witness calibrates NaN discrepancies after each original
instruction and before its consumer; finite result discrepancies are fatal.
The runner compiles host_fastpath.c and the verbatim BLOCK_PATCHES entry, not a
C/JS translation of the reference. It compares complete watched memory, helper
return/outparam, GPRs, all architectural EFLAGS bits, XMM0..7 and the remaining
CpuState bytes. Higher ZMM lanes are preservation checks, not AVX emulation.
The existing lifted SSE contract does not model MXCSR exception sticky bits;
original MXCSR is recorded, not claimed equivalent. Rejections never execute
unsafe PE inputs: their expected memory/outparam/state is unchanged by contract.
"""
from __future__ import annotations

import argparse
from collections import Counter
from dataclasses import dataclass, field
import hashlib
import itertools
import json
import os
from pathlib import Path
import struct
import subprocess
import sys

from quad_pack import FLOAT_BITS, find_tool, pattern, put_patches, u32, window_for

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
HOST = ROOT / "scripts/recomp/host"
LIFT = ROOT / "scripts/recomp/lift"
OUT = ROOT / "output/recomp/oracle/audio-pairs"
ENTRY, JOIN = 0x00AA27B0, 0x00AA27F6
FRAME, BOOK, TABLE = 0x01001080, 0x01011080, 0x01021080
LEFT, RIGHT = 0x01031080, 0x01041080
GUEST_LIMIT = 0x1BF00000
WINDOW_BASES = (0x01000000, 0x01010000, 0x01020000, 0x01030000, 0x01040000, 0x1BEF0000)
GPRS = ("eax", "ecx", "edx", "ebx", "esp", "ebp", "esi", "edi")
MAGIC = b"APAIRS1\0"
SEED = 0xA258027B
# Input bits only. Expected arithmetic is never computed in Python.
EXTRA_BITS = (0x3F7FFFFF, 0xBF7FFFFF, 0x3F800002, 0xBF800002,
              0x33000000, 0xB3000000, 0x7FFFFFFF, 0xFFFFFFFF)


def raw_pool():
    value, out = SEED, []
    for _ in range(128):
        value ^= (value << 13) & 0xFFFFFFFF
        value ^= value >> 17
        value ^= (value << 5) & 0xFFFFFFFF
        out.append(value)
    return tuple(out)


OPERANDS = FLOAT_BITS + EXTRA_BITS + raw_pool()


@dataclass
class Case:
    name: str
    category: str
    gpr: list[int]
    xmm: list[bytes]
    flags: int
    pairs: int
    left: int
    source: int
    last_before: int
    patches: list[tuple[int, bytes]] = field(default_factory=list)

    def word(self, address, value):
        self.patches.append((address, u32(value)))

    def set_left(self, address):
        self.left = address
        self.word(self.gpr[5] - 0x14, address - self.gpr[1])

    def set_right(self, address):
        self.gpr[1] = address
        self.word(self.gpr[5] - 0x14, self.left - address)


def fixture(name, *, category="layout", index=1, limit=6, offset=0, shift=0,
            frame=None, book=None, table=None, left=None, right=None, samples=None, salt=0):
    frame = FRAME + shift if frame is None else frame
    book = BOOK + 7 * shift if book is None else book
    table = TABLE + 5 * shift if table is None else table
    left = LEFT + shift if left is None else left
    right = RIGHT + 3 * shift if right is None else right
    pairs = (limit - index + 1) // 2
    if not 0 < pairs <= 257:
        raise RuntimeError("fixture constructors must have a small positive original loop")
    source = table + offset
    xmm = [pattern(16, salt + i + 31) for i in range(8)]
    xmm[1] = u32(0) + xmm[1][4:]
    flags = 0x202 | (0x8D5 if salt & 1 else 0) | (0x400 if salt & 2 else 0)
    gpr = [0xD00DA258 ^ salt, right, offset, index, frame - 0x100, frame,
           (0xFFFFFFFD + salt * 17) & 0xFFFFFFFF, (0xFFFFFFFE + salt * 29) & 0xFFFFFFFF]
    c = Case(name, category, gpr, xmm, flags, pairs, left, source,
             (0x13579BDF ^ salt * 0x10203) & 0xFFFFFFFF)
    values = samples or tuple(OPERANDS[(salt * 13 + i * 7) % len(OPERANDS)] for i in range(pairs * 4))
    if len(values) != pairs * 4:
        raise RuntimeError("fixture sample count does not match its span")
    src, lhs, rhs = bytearray(), bytearray(), bytearray()
    for n in range(pairs):
        a, b, l, r = values[n * 4:n * 4 + 4]
        src += u32(a) + u32(b)
        lhs += u32(l)
        rhs += u32(r)
    c.patches.extend(((source, bytes(src)), (left, bytes(lhs)), (right, bytes(rhs))))
    c.word(frame - 4, book)
    c.word(frame - 8, limit)
    c.word(frame - 0x14, left - right)
    c.word(book + 0x1C, table)
    c.word(frame - 0x100, 0x5F000000)  # emu.Oracle.call's return sentinel, never consumed.
    return c


def corpus():
    cases = []
    # All valid small indices, both terminal parities, and aligned/unaligned
    # source offsets. Rotating shifts cover each alignment for every object.
    for limit in range(1, 18):
        for index in range(limit):
            for offset in (0, 1, 4, 7):
                salt = len(cases)
                cases.append(fixture(f"layout-i{index}-n{limit}-o{offset}", index=index, limit=limit,
                                     offset=offset, shift=salt % 4, salt=salt))
    for a, b in itertools.product(FLOAT_BITS + EXTRA_BITS, repeat=2):
        cases.append(fixture(f"float-{a:08x}-{b:08x}", category="float-matrix", index=1, limit=2,
                             shift=1, samples=(a, b, b, a), salt=len(cases)))
    for n in range(256):
        pairs = (1, 2, 3, 8, 17, 257)[n % 6]
        cases.append(fixture(f"raw-{n:03d}-pairs{pairs}", category="raw-random", index=n % 3,
                             limit=n % 3 + pairs * 2 - (n & 1), offset=(n * 13) % 64,
                             shift=n % 4, salt=len(cases)))
    for index, limit in ((0x7FFFFFFD, 0x7FFFFFFF), (0x7FFFFFFC, 0x7FFFFFFE),
                         (0x7FFFFFFD, 0x7FFFFFFE)):
        cases.append(fixture(f"signed-end-{index:08x}-{limit:08x}", category="boundary",
                             index=index, limit=limit, salt=len(cases)))
    adjacent = (
        ("outputs-touch-source", dict(table=TABLE, left=TABLE + 24, right=TABLE + 36)),
        ("outputs-touch-reversed", dict(left=RIGHT + 12, right=RIGHT)),
        ("positive-left-delta", dict(left=RIGHT, right=LEFT)),
        ("left-before-frame", dict(left=FRAME - 0x20 - 12)),
        ("left-after-frame", dict(left=FRAME + 0x1C)),
        ("right-before-frame", dict(right=FRAME - 0x20 - 12)),
        ("right-after-frame", dict(right=FRAME + 0x1C)),
        ("left-before-book", dict(left=BOOK - 12)),
        ("left-after-book", dict(left=BOOK + 0x20)),
        ("right-before-book", dict(right=BOOK - 12)),
        ("right-after-book", dict(right=BOOK + 0x20)),
        ("source-inside-frame", dict(table=FRAME)),
        ("source-inside-book", dict(table=BOOK)),
        ("source-span-at-guest-end", dict(table=GUEST_LIMIT - 24)),
        ("left-span-at-guest-end", dict(left=GUEST_LIMIT - 12)),
        ("right-span-at-guest-end", dict(right=GUEST_LIMIT - 12)),
        ("frame-at-guest-end", dict(frame=GUEST_LIMIT - 0x1C)),
        ("book-at-guest-end", dict(book=GUEST_LIMIT - 0x20)),
        ("large-source-offset", dict(table=TABLE, offset=GUEST_LIMIT - 24 - TABLE)),
    )
    for name, kwargs in adjacent:
        cases.append(fixture(name, category="boundary", salt=len(cases), **kwargs))

    def reject(name):
        c = fixture("reject-" + name, category="guard", salt=len(cases))
        c.pairs = 0
        cases.append(c)
        return c

    for value in (0x80000000, 1, 0x3F800000, 0x7F800000, 0x7FC12345, 0x7F812345):
        c = reject(f"nonzero-xmm1-{value:08x}")
        c.xmm[1] = u32(value) + c.xmm[1][4:]
    for value in (0, 1, 0x1F, 0x20, 0xFFFFFFF0, GUEST_LIMIT - 0x1B, GUEST_LIMIT):
        reject(f"frame-{value:08x}").gpr[5] = value
    for value in (6, 7, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF):
        reject(f"index-{value:08x}").gpr[3] = value
    for value in (0, 1, 0x80000000, 0xFFFFFFFF):
        reject(f"limit-{value:08x}").word(FRAME - 8, value)
    c = reject("terminal-signed-wrap")
    c.gpr[3] = 0x7FFFFFFE
    c.word(FRAME - 8, 0x7FFFFFFF)
    for value in (0x40000000, 0x40000001, 0x3FFFFFFE):
        c = reject(f"pair-or-span-overflow-{value:08x}")
        c.gpr[3] = 0
        c.word(FRAME - 8, value)
    for value in (0, GUEST_LIMIT - 0x1F, GUEST_LIMIT, 0xFFFFFFF0):
        reject(f"book-{value:08x}").word(FRAME - 4, value)
    for value in (0, GUEST_LIMIT - 23, GUEST_LIMIT, 0xFFFFFFF0):
        reject(f"table-{value:08x}").word(BOOK + 0x1C, value)
    for value in (0xFFFFFFFF - TABLE + 1, 0xFFFFFFFF, GUEST_LIMIT - TABLE - 23):
        reject(f"source-offset-{value:08x}").gpr[2] = value
    for side in ("left", "right"):
        for value in (0, GUEST_LIMIT - 11, GUEST_LIMIT, 0xFFFFFFF8):
            getattr(reject(f"{side}-{value:08x}"), "set_" + side)(value)
        other = RIGHT if side == "left" else LEFT
        for label, address, size in (("other-output", other, 12), ("source", TABLE, 24)):
            for delta in (0, 1, -11, size - 1):
                getattr(reject(f"{side}-overlap-{label}-{delta}"), "set_" + side)(address + delta)
        # Every byte of the full protected frame/book windows, not merely
        # fields read by this block. Include a one-byte leading overlap too.
        for label, address, size in (("frame", FRAME - 0x20, 0x3C), ("book", BOOK, 0x20)):
            for delta in (-11, *range(size)):
                getattr(reject(f"{side}-overlap-{label}-{delta}"), "set_" + side)(address + delta)
    if len({c.name for c in cases}) != len(cases):
        raise RuntimeError("duplicate corpus names")
    return cases


def command(label, args, environment=None):
    argv = list(map(str, args))
    result = subprocess.run(argv, cwd=ROOT, env=environment, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
    (OUT / (label + ".log")).write_text(result.stdout + result.stderr, encoding="utf-8")
    (OUT / (label + ".command.json")).write_text(json.dumps({
        "argv": argv, "environment_overrides": None if environment is None else {
            name: environment.get(name) for name in ("ISAAC_FASTPATH", "ISAAC_FASTPATH_VERIFY")}},
        indent=2) + "\n", encoding="utf-8")
    return result


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def sse_witness(args):
    values = set(OPERANDS)
    # Extra inputs cover the first ADDSS's quieting, without predicting results.
    values.update(v | 0x400000 for v in OPERANDS if (v & 0x7FFFFFFF) > 0x7F800000)
    values = sorted(values)
    inputs, source, exe = OUT / "sse-inputs.bin", HERE / "quad_pack_sse_witness.c", OUT / "sse_witness.exe"
    inputs.write_bytes(u32(len(values)) + b"".join(map(u32, values)))
    cc = find_tool(args.clang, "CLANG", [Path.home() / "Tools/llvm-mingw/bin/clang.exe"])
    built = command("sse-witness-build", [cc, "--target=x86_64-w64-windows-gnu", "-O2", "-std=gnu11",
                                         "-fno-fast-math", "-ffp-contract=off", source, "-o", exe])
    if built.returncode:
        raise RuntimeError("native SSE witness compile failed\n" + built.stderr[-6000:])
    ran = command("sse-witness-run", [exe, inputs])
    if ran.returncode:
        raise RuntimeError("native SSE witness failed\n" + ran.stderr[-2000:])
    (OUT / "sse-witness.jsonl").write_text(ran.stdout, encoding="utf-8")
    lines = iter(ran.stdout.splitlines())
    metadata = json.loads(next(lines))
    if metadata["mxcsr"] != "0x00001f80":
        raise RuntimeError("native SSE witness did not use default MXCSR")
    hardware = {}
    for line in lines:
        row = json.loads(line)
        key = int(row["left"], 16), int(row["right"], 16)
        if key in hardware:
            raise RuntimeError("duplicate SSE witness result")
        hardware[key] = int(row["addss"], 16), int(row["add_mxcsr"], 16)
    if set(hardware) != set(itertools.product(values, repeat=2)):
        raise RuntimeError("incomplete native SSE witness matrix")
    return hardware, {**metadata, "compiler": cc, "input_values": len(values),
                      "addss_results": len(hardware), "source_sha256": sha(source),
                      "inputs_sha256": sha(inputs), "executable_sha256": sha(exe),
                      "results_sha256": sha(OUT / "sse-witness.jsonl")}


def integration_source(args):
    sys.path.insert(0, str(LIFT))
    import lift_patches
    entries = [p for p in lift_patches.BLOCK_PATCHES if p[0] == "0x00aa27b0"]
    joins = [p for p in lift_patches.BLOCK_PATCHES if p[0] == "0x00aa27f6"]
    if len(entries) != 1 or len(joins) != 1:
        raise RuntimeError("actual pair-loop BLOCK_PATCHES entry/join is missing or duplicated")
    _, old, patch = entries[0]
    _, join_old, join_patch = joins[0]
    if not patch.endswith("L_00aa27b0: ;\n") or "goto L_00aa27f6;" not in patch:
        raise RuntimeError("pair patch no longer has the audited entry/exit boundary")
    if not join_patch.endswith(join_old):
        raise RuntimeError("join patch no longer retains its original instruction suffix")
    join_prefix = join_patch[:-len(join_old)]
    if "L_00aa27f6: ;" not in join_prefix:
        raise RuntimeError("actual join prefix has no landing label")
    (OUT / "audio_pairs_patch.inc").write_text(patch, encoding="utf-8")
    (OUT / "audio_pairs_join.inc").write_text(join_prefix, encoding="utf-8")
    state = args.state_dir / "recomp_state.h"
    if not state.is_file():
        raise RuntimeError(f"actual generated CPU state missing: {state}; use --state-dir")
    return {"patch_source": "scripts/recomp/lift/lift_patches.py", "patch_source_sha256": sha(LIFT / "lift_patches.py"),
            "entry_marker": entries[0][0], "join_marker": joins[0][0],
            "compiled_entry_sha256": sha(OUT / "audio_pairs_patch.inc"),
            "compiled_join_prefix_sha256": sha(OUT / "audio_pairs_join.inc"),
            "state_header": str(state), "state_header_sha256": sha(state),
            "host_source_sha256": sha(HOST / "src/host_fastpath.c"),
            "host_header_sha256": sha(HOST / "include/isaac_host.h"),
            "runtime_header_sha256": sha(LIFT / "recomp_rt.h"),
            "runner_sha256": sha(HERE / "audio_pairs_runner.c"),
            "boundary": "verbatim entry replacement; actual join prefix before its first original instruction",
            "unrelated_native_link_dependencies": "exact-signature aborting isaac_log/isaac_threads_note_cs tripwires"}


def pack_registers(gpr, flags, xmm):
    return struct.pack("<9I", *gpr, flags) + b"".join(xmm)


def generate(args):
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
        raise RuntimeError("indexed and emulator PE hashes disagree")
    db_path = index_db_path(canonical)
    if not db_path.is_file():
        raise RuntimeError("PE index missing; run python scripts/decomp/tools/build-pe-index.py")
    db = pequery.db()
    metadata = dict(db.execute("SELECT key,value FROM meta ORDER BY key"))
    if metadata.get("sha256", "").upper() != canonical.sha256:
        raise RuntimeError("PE index belongs to a different image")
    rows = db.execute("SELECT va,size,mn,ops FROM insn WHERE va>=? AND va<=? ORDER BY va", (ENTRY, JOIN)).fetchall()
    indexed = {va: (size, mnemonic, operands) for va, size, mnemonic, operands in rows}
    if ENTRY not in indexed or JOIN not in indexed:
        raise RuntimeError("indexed entry/join boundary missing")
    cursor = ENTRY
    for va, size, mnemonic, _ in rows:
        if va != cursor or mnemonic.startswith("call"):
            raise RuntimeError("indexed block has a gap or a call")
        cursor = va + size
    if len(rows) != 21 or indexed[0xAA27F4][1:] != ("jl", "0xaa27b0"):
        raise RuntimeError("canonical pair-loop instruction shape changed")
    instructions_per_pair = len(rows) - 1
    sse_sites = {0xAA27C5: "xmm1", 0xAA27C9: "eax+ecx", 0xAA27E2: "xmm1", 0xAA27E6: "ecx"}
    for pc in sse_sites:
        if indexed[pc][1] != "addss":
            raise RuntimeError(f"indexed ADDSS missing at {pc:#x}")
    (OUT / "original-block.json").write_text(json.dumps({
        "canonical_sha256": canonical.sha256, "entry": ENTRY, "stop_before": JOIN,
        "bytes_hex": pe.read(ENTRY, JOIN - ENTRY).hex(),
        "instructions": [{"va": va, "size": size, "mnemonic": mn, "operands": ops} for va, size, mn, ops in rows],
        "sections": [vars(section) for section in pe.sections], "index_metadata": metadata}, indent=2) + "\n", encoding="utf-8")
    hardware, witness_receipt = sse_witness(args)
    windows = [(base, pattern(0x10000, n + 19)) for n, base in enumerate(WINDOW_BASES)]
    oracle = emu.Oracle(pe)
    for base, data in windows:
        oracle.uc.mem_map(base, len(data), unicorn.UC_PROT_READ | unicorn.UC_PROT_WRITE)
    state = {}

    def audit_instruction(uc, address, size, _):
        pending = state["pending"]
        if pending is not None:
            pc, left, right, want, want_mxcsr, nan = pending
            full = uc.reg_read(x86.UC_X86_REG_XMM0)
            got, got_mxcsr = full & 0xFFFFFFFF, uc.reg_read(x86.UC_X86_REG_MXCSR)
            if got != want and not nan:
                raise RuntimeError(f"finite SSE result disagrees with hardware at {pc:#x}: {left:#x}+{right:#x}, {got:#x}!={want:#x}")
            if nan and (got, got_mxcsr) != (want, want_mxcsr):
                state["corrections"].append({"pc": f"0x{pc:08x}", "left": f"0x{left:08x}", "right": f"0x{right:08x}",
                                             "unicorn": f"0x{got:08x}", "hardware": f"0x{want:08x}",
                                             "unicorn_mxcsr": f"0x{got_mxcsr:08x}", "hardware_mxcsr": f"0x{want_mxcsr:08x}"})
                uc.reg_write(x86.UC_X86_REG_XMM0, (full & ~0xFFFFFFFF) | want)
                uc.reg_write(x86.UC_X86_REG_MXCSR, want_mxcsr)
            state["pending"] = None
        if address not in indexed or address == JOIN or indexed[address][0] != size:
            state["violations"].append(address)
            uc.emu_stop()
            return
        if state["instructions"] == 0:
            # Oracle.call supplies a conventional CALL entry. This block has no
            # CALL/RET, so seed the explicit fixture flags before its first op.
            uc.reg_write(x86.UC_X86_REG_EFLAGS, state["entry_flags"])
        state["instructions"] += 1
        state["pairs"] += address == ENTRY
        if address in sse_sites:
            left = uc.reg_read(x86.UC_X86_REG_XMM0) & 0xFFFFFFFF
            operand = sse_sites[address]
            if operand == "xmm1":
                right = uc.reg_read(x86.UC_X86_REG_XMM1) & 0xFFFFFFFF
            else:
                location = uc.reg_read(x86.UC_X86_REG_ECX)
                if operand == "eax+ecx":
                    location = (location + uc.reg_read(x86.UC_X86_REG_EAX)) & 0xFFFFFFFF
                right = struct.unpack("<I", oracle.read(location, 4))[0]
            if (left, right) not in hardware:
                raise RuntimeError(f"missing real SSE witness at {address:#x}: {left:#x}, {right:#x}")
            want, mxcsr = hardware[left, right]
            nan = any((value & 0x7FFFFFFF) > 0x7F800000 for value in (left, right))
            state["pending"] = (address, left, right, want,
                                  uc.reg_read(x86.UC_X86_REG_MXCSR) | (mxcsr & 0x3F), nan)
            state["sse_checked"] += 1
            state["nan_checked"] += nan

    def audit_read(uc, access, address, size, value, user_data):
        # All fixture bytes are initialized. A value-based poison heuristic is
        # invalid for raw floats, which may legitimately contain its tag.
        window_for(windows, address, size)

    hook = oracle.uc.hook_add(unicorn.UC_HOOK_CODE, audit_instruction)
    read_hook = oracle.uc.hook_add(unicorn.UC_HOOK_MEM_READ, audit_read)
    cases, notes = corpus(), []
    with (OUT / "corpus.bin").open("wb") as stream:
        stream.write(MAGIC + u32(len(windows)))
        for base, data in windows:
            stream.write(u32(base) + u32(len(data)) + data)
        stream.write(u32(len(cases)))
        for c in cases:
            before = [bytearray(data) for _, data in windows]
            for address, data in c.patches:
                i, offset = window_for(windows, address, len(data))
                before[i][offset:offset + len(data)] = data
            note = {"case": c.name, "category": c.category, "accepted": bool(c.pairs),
                    "entry_gpr": {name: f"0x{value:08x}" for name, value in zip(GPRS, c.gpr)},
                    "entry_flags": f"0x{c.flags:08x}", "entry_xmm": [v.hex() for v in c.xmm]}
            writes, output_gpr, output_flags, output_xmm = [], c.gpr, c.flags, c.xmm
            actual_pairs = 0
            if c.pairs:
                for (base, _), data in zip(windows, before):
                    oracle.write(base, bytes(data))
                for n, value in enumerate(c.xmm):
                    oracle.uc.reg_write(getattr(x86, f"UC_X86_REG_XMM{n}"), int.from_bytes(value, "little"))
                oracle.uc.reg_write(x86.UC_X86_REG_MXCSR, 0x1F80)
                if oracle.uc.reg_read(x86.UC_X86_REG_MXCSR) != 0x1F80:
                    raise RuntimeError("could not set original MXCSR to 0x1f80")
                oracle.initial_esp = c.gpr[4] + 4
                state.clear()
                state.update(pending=None, corrections=[], violations=[], instructions=0, pairs=0,
                             sse_checked=0, nan_checked=0, entry_flags=c.flags)
                result = oracle.call(ENTRY, until=JOIN, reset=False, regs=dict(zip(GPRS, c.gpr)),
                                     max_insns=c.pairs * instructions_per_pair + 1)
                stop = oracle.uc.reg_read(x86.UC_X86_REG_EIP)
                if (result.term != "ret" or result.fault_va is not None or result.error
                        or result.calls or result.stubs or result.models or state["violations"] or stop != JOIN):
                    raise RuntimeError(f"{c.name}: impure original execution: stop={stop:#x}, term={result.term}, "
                                       f"fault={result.fault_va}, error={result.error}, code={state}")
                if (state["pending"] is not None or state["pairs"] != c.pairs
                        or state["instructions"] != instructions_per_pair * c.pairs):
                    raise RuntimeError(f"{c.name}: original did not execute the complete expected loop")
                footprint = ((c.left, c.left + 4 * c.pairs), (c.gpr[1], c.gpr[1] + 4 * c.pairs))
                if len(result.writes) != 2 * c.pairs:
                    raise RuntimeError(f"{c.name}: unexpected original store count")
                for address, data in result.writes:
                    if len(data) != 4 or not any(lo <= address and address + 4 <= hi for lo, hi in footprint):
                        raise RuntimeError(f"{c.name}: original wrote outside its output spans at {address:#x}")
                writes = [(lo, oracle.read(lo, hi - lo)) for lo, hi in emu.merge_writes(result.writes)]
                after = [bytearray(data) for data in before]
                for address, data in writes:
                    i, offset = window_for(windows, address, len(data))
                    after[i][offset:offset + len(data)] = data
                for (base, _), data in zip(windows, after):
                    if oracle.read(base, len(data)) != data:
                        raise RuntimeError(f"{c.name}: unrecorded original write at window {base:#x}")
                output_gpr = [result.regs[name] for name in GPRS]
                output_flags = oracle.uc.reg_read(x86.UC_X86_REG_EFLAGS)
                output_xmm = [oracle.uc.reg_read(getattr(x86, f"UC_X86_REG_XMM{n}")).to_bytes(16, "little") for n in range(8)]
                actual_pairs = state["pairs"]
                note.update(pairs=actual_pairs, instructions=state["instructions"], stop_before=f"0x{stop:08x}",
                            opaque_calls=0, stubs=0, models=0, writes=[[f"0x{a:08x}", len(d)] for a, d in writes],
                            exit_gpr={name: f"0x{value:08x}" for name, value in zip(GPRS, output_gpr)},
                            exit_flags=f"0x{output_flags:08x}", exit_xmm=[v.hex() for v in output_xmm],
                            mxcsr_original=f"0x{oracle.uc.reg_read(x86.UC_X86_REG_MXCSR):08x}",
                            hardware_sse_checked=state["sse_checked"], hardware_nan_checked=state["nan_checked"],
                            hardware_sse_corrections=state["corrections"],
                            before_sha256=hashlib.sha256(b"".join(before)).hexdigest(),
                            after_sha256=hashlib.sha256(b"".join(after)).hexdigest())
            name = c.name.encode("ascii")
            stream.write(u32(len(name)) + name + u32(actual_pairs) + u32(c.last_before))
            stream.write(pack_registers(c.gpr, c.flags, c.xmm))
            stream.write(pack_registers(output_gpr, output_flags, output_xmm))
            put_patches(stream, c.patches)
            put_patches(stream, writes)
            notes.append(note)
    oracle.uc.hook_del(hook)
    oracle.uc.hook_del(read_hook)
    (OUT / "cases.json").write_text(json.dumps(notes, indent=2) + "\n", encoding="utf-8")
    corrections = [row for note in notes for row in note.get("hardware_sse_corrections", [])]
    witness_receipt.update(checked_operations=sum(n.get("hardware_sse_checked", 0) for n in notes),
                           nan_operations=sum(n.get("hardware_nan_checked", 0) for n in notes),
                           corrected_operations=len(corrections),
                           corrected_cases=sum(bool(n.get("hardware_sse_corrections")) for n in notes),
                           corrections_by_pc=dict(Counter(row["pc"] for row in corrections)),
                           scope="NaN operands only: result/MXCSR corrections after original ADDSS, before its consumer; finite result differences fail",
                           defect="Unicorn NaN payload/exception propagation differs from the observed native SSE instruction")
    return {"canonical_sha256": canonical.sha256, "index_path": str(db_path), "index_metadata": metadata,
            "original_block_sha256": hashlib.sha256(pe.read(ENTRY, JOIN - ENTRY)).hexdigest(),
            "entry_va": f"0x{ENTRY:08x}", "stop_before_va": f"0x{JOIN:08x}", "indexed_block_instructions": len(rows) - 1,
            "accepted": sum(bool(c.pairs) for c in cases), "rejected_guards": sum(not c.pairs for c in cases),
            "categories": dict(Counter(c.category for c in cases)), "seed": f"0x{SEED:08x}",
            "corpus_sha256": sha(OUT / "corpus.bin"), "cases_sha256": sha(OUT / "cases.json"),
            "sse_witness": witness_receipt, "unicorn_version": unicorn.__version__, "opaque_calls": 0, "stubs": 0, "models": 0,
            "watched_windows": [[f"0x{base:08x}", len(data)] for base, data in windows],
            "watched_bytes_per_case": sum(len(data) for _, data in windows),
            "accepted_expected_source": "original-pe+independent-native-sse-witness",
            "rejected_expected_source": "no-write/no-outparam/no-state-change preflight contract"}


def compare_target(target, args, receipt):
    common = ["-O2", "-std=gnu11", "-fno-fast-math", "-ffp-contract=off", "-ffunction-sections", "-fdata-sections",
              "-I", str(args.state_dir), "-I", str(HOST / "include"), "-I", str(LIFT), "-I", str(OUT),
              str(HERE / "audio_pairs_runner.c"), str(HOST / "src/host_fastpath.c"), "-Wl,--gc-sections"]
    if target == "native":
        cc = find_tool(args.clang, "CLANG", [Path.home() / "Tools/llvm-mingw/bin/clang.exe"])
        exe = OUT / "audio_pairs_native.exe"
        build = [cc, "--target=x86_64-w64-windows-gnu", *common, "-Wl,--image-base,0x140000000", "-o", exe]
        run = [exe, OUT / "corpus.bin"]
    else:
        cc = find_tool(args.emcc, "EMCC", [Path.home() / "emsdk/upstream/emscripten/emcc.exe", "emcc"])
        node = find_tool(args.node, "NODE", ["node"])
        exe = OUT / "audio_pairs_wasm.js"
        (OUT / "package.json").write_text('{"type":"commonjs"}\n', encoding="utf-8")
        build = [cc, *common, "-msimd128", "-sINITIAL_MEMORY=536870912", "-sALLOW_MEMORY_GROWTH=1",
                 "-sMAXIMUM_MEMORY=4294967296", "-sGLOBAL_BASE=469762048", "-sSTACK_SIZE=1048576", "-sENVIRONMENT=node",
                 "-sNODERAWFS=1", "-sEXIT_RUNTIME=1", "-sASSERTIONS=1",
                 '-sEXPORTED_FUNCTIONS=["_main","_isaac_fast_aa2580_pairs"]', "-o", exe]
        run = [node, exe, OUT / "corpus.bin"]
    compiled = command(target + "-build", build)
    if compiled.returncode:
        raise RuntimeError(f"{target} compile failed; {OUT / (target + '-build.log')}\n" + compiled.stderr[-6000:])
    results = {}
    for mode in (1, 0, 2):
        environment = dict(os.environ)
        environment["ISAAC_FASTPATH"] = "0" if mode == 0 else "1"
        environment["ISAAC_FASTPATH_VERIFY"] = "1" if mode == 2 else "0"
        executed = command(f"{target}-mode{mode}-run", [*run, str(mode)], environment)
        summary = next((json.loads(line) for line in reversed(executed.stdout.splitlines()) if line.startswith('{"accepted":')), None)
        if executed.returncode or summary is None:
            detail = [line for line in executed.stdout.splitlines() if line.startswith("MISMATCH")]
            raise RuntimeError(f"{target} mode{mode} mismatch/crash (exit {executed.returncode}); "
                               f"{OUT / f'{target}-mode{mode}-run.log'}\n" + "\n".join(detail[:20] or executed.stdout.splitlines()[-8:])
                               + "\n" + executed.stderr[-2000:])
        count = receipt["accepted"] + receipt["rejected_guards"]
        if (summary["accepted"], summary["rejected"], summary["failures"], summary["mode"],
            summary["helper_cases"], summary["integration_cases"]) != (
                receipt["accepted"], receipt["rejected_guards"], 0, mode, count if mode == 1 else 0, count):
            raise RuntimeError(f"{target} mode{mode}: incomplete corpus execution: {summary}")
        results[str(mode)] = summary
    binaries = {exe.name: sha(exe)}
    if target == "wasm":
        binaries[exe.with_suffix(".wasm").name] = sha(exe.with_suffix(".wasm"))
    return {"compiler": cc, "binaries_sha256": binaries, "modes": results}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--target", choices=("both", "native", "wasm"), default="both")
    parser.add_argument("--clang")
    parser.add_argument("--emcc")
    parser.add_argument("--node")
    parser.add_argument("--state-dir", type=Path, default=ROOT / "output/recomp/lift/gu")
    args = parser.parse_args()
    args.state_dir = args.state_dir.resolve()
    OUT.mkdir(parents=True, exist_ok=True)
    receipt = {"ok": False, "targets": {}, "errors": [], "command": "python scripts/recomp/oracle/audio_pairs.py",
               "oracle_source_sha256": sha(__file__),
               "invocation": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
               "shared_primitives_sha256": sha(HERE / "quad_pack.py"),
               "emulator_source_sha256": sha(HERE / "emu.py"),
               "pe_loader_sha256": sha(HERE / "peimage.py"),
               "residual_limits": ["Default round-nearest-even MXCSR only; no FTZ/DAZ or alternate rounding modes.",
                                   "MXCSR exception sticky bits are not modeled by the existing lifted SSE runtime or compared to native C/Wasm.",
                                   "XMM0..7 are executed in x86-32; upper ZMM and other CpuState fields are preservation checks.",
                                   "The actual BLOCK_PATCHES fragment is compiled at its integration boundary, not the entire decoder or frame.",
                                   "Rejected unsafe layouts are tested for fallback without executing the original PE on invalid memory."]}
    try:
        receipt["integration"] = integration_source(args)
        receipt.update(generate(args))
        for target in (("native", "wasm") if args.target == "both" else (args.target,)):
            try:
                receipt["targets"][target] = compare_target(target, args, receipt)
            except (OSError, RuntimeError, ValueError) as error:
                receipt["errors"].append(str(error))
    except (OSError, RuntimeError, ImportError, ValueError, StopIteration) as error:
        receipt["errors"].append(str(error))
    receipt["ok"] = not receipt["errors"]
    (OUT / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    return 0 if receipt["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
