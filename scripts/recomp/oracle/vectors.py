"""Deterministic input generation + vector capture for the oracle.

An input is described by a small, fully serialisable "input program" so any
recorded vector can be replayed bit-for-bit:

    {"allocs": [{"size": 32, "data": "<hex>", "page_start": false}, ...],
     "ecx": {"k": "alloc", "i": 0},          # or {"k":"imm","v":123}
     "edx": {"k": "imm", "v": 0},
     "stack": [{"k":"alloc","i":1}, {"k":"imm","v":7}]}

Randomness comes only from `random.Random(seed ^ index)`; there is no
wall-clock or OS entropy anywhere, so vector N is reproducible in isolation
and generation is trivially resumable and parallelisable.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass, field

import emu as emumod

# Values that show up disproportionately often in real x86 code paths.
INTERESTING = [
    0, 1, 2, 3, 4, 7, 8, 0x0F, 0x10, 0x1F, 0x20, 0x3F, 0x40, 0x7F, 0x80, 0xFF,
    0x100, 0x1FF, 0x200, 0x3FF, 0x400, 0x7FF, 0x800, 0xFFF, 0x1000, 0x7FFF,
    0x8000, 0xFFFF, 0x10000, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF, 0xFFFFFFFE,
    0xCCCCCCCC, 0xDEADBEEF,
]
BUF_SIZES = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128, 256]


@dataclass
class Slot:
    k: str            # "imm" | "alloc" | "null"
    v: int = 0
    i: int = -1

    def to_json(self):
        if self.k == "imm":
            return {"k": "imm", "v": self.v}
        if self.k == "alloc":
            return {"k": "alloc", "i": self.i}
        return {"k": "null"}

    @staticmethod
    def from_json(d):
        return Slot(d["k"], d.get("v", 0), d.get("i", -1))


@dataclass
class AllocDesc:
    size: int
    data: bytes
    page_start: bool = False
    pad_before: int = 0

    def to_json(self):
        return {"size": self.size, "data": self.data.hex(),
                "page_start": self.page_start, "pad_before": self.pad_before}

    @staticmethod
    def from_json(d):
        return AllocDesc(d["size"], bytes.fromhex(d["data"]),
                         d.get("page_start", False), d.get("pad_before", 0))


@dataclass
class InputProgram:
    allocs: list[AllocDesc] = field(default_factory=list)
    ecx: Slot = field(default_factory=lambda: Slot("imm", 0))
    edx: Slot = field(default_factory=lambda: Slot("imm", 0))
    stack: list[Slot] = field(default_factory=list)

    def to_json(self):
        return {"allocs": [a.to_json() for a in self.allocs],
                "ecx": self.ecx.to_json(), "edx": self.edx.to_json(),
                "stack": [s.to_json() for s in self.stack]}

    @staticmethod
    def from_json(d):
        return InputProgram(
            [AllocDesc.from_json(a) for a in d["allocs"]],
            Slot.from_json(d["ecx"]), Slot.from_json(d["edx"]),
            [Slot.from_json(s) for s in d["stack"]])


# ---------------------------------------------------------------------------
# generation
# ---------------------------------------------------------------------------

def _rand_bytes(rng: random.Random, n: int, mode: str) -> bytes:
    if mode == "zero":
        return b"\0" * n
    if mode == "small":
        out = bytearray(n)
        for i in range(0, n, 4):
            out[i:i + 4] = rng.choice(
                [0, 1, 2, 3, 8, 0x10, 0xF, 0x7F]).to_bytes(4, "little")
        return bytes(out[:n])
    if mode == "ascii":
        return bytes(rng.choice(b"abcdefghijklmnopqrstuvwxyz") for _ in range(n))
    return bytes(rng.getrandbits(8) for _ in range(n))


def generate(rng: random.Random, *, n_stack: int, thiscall: bool,
             ptr_prob: float = 0.65) -> InputProgram:
    prog = InputProgram()

    def mk_slot(prefer_ptr: bool) -> Slot:
        if prefer_ptr and rng.random() < ptr_prob:
            size = rng.choice(BUF_SIZES)
            mode = rng.choice(["zero", "small", "rand", "ascii", "small"])
            prog.allocs.append(AllocDesc(size, _rand_bytes(rng, size, mode)))
            return Slot("alloc", i=len(prog.allocs) - 1)
        if rng.random() < 0.05:
            return Slot("null")
        if rng.random() < 0.6:
            return Slot("imm", v=rng.choice(INTERESTING))
        return Slot("imm", v=rng.getrandbits(32))

    if thiscall:
        prog.ecx = mk_slot(True)
    prog.stack = [mk_slot(True) for _ in range(n_stack)]
    return prog


def mutate(rng: random.Random, base: InputProgram) -> InputProgram:
    prog = InputProgram.from_json(json.loads(json.dumps(base.to_json())))
    ops = rng.randint(1, 3)
    for _ in range(ops):
        choice = rng.random()
        if prog.allocs and choice < 0.55:
            a = prog.allocs[rng.randrange(len(prog.allocs))]
            d = bytearray(a.data)
            if not d:
                continue
            kind = rng.random()
            if kind < 0.4:                       # flip a byte
                d[rng.randrange(len(d))] = rng.getrandbits(8)
            elif kind < 0.7:                     # splat an interesting dword
                off = rng.randrange(max(1, len(d) - 3)) & ~3
                if off + 4 <= len(d):
                    d[off:off + 4] = rng.choice(INTERESTING).to_bytes(
                        4, "little", signed=False)
            elif kind < 0.85:                    # zero a run
                off = rng.randrange(len(d))
                d[off:off + rng.randint(1, 8)] = b"\0" * min(
                    rng.randint(1, 8), len(d) - off)
            else:
                for i in range(len(d)):
                    d[i] = rng.getrandbits(8)
            a.data = bytes(d)
        elif choice < 0.8:
            slots = ([prog.ecx] if prog.ecx.k != "null" else []) + prog.stack
            if not slots:
                continue
            s = slots[rng.randrange(len(slots))]
            if s.k == "imm":
                s.v = (rng.choice(INTERESTING) if rng.random() < 0.6
                       else (s.v + rng.choice([-2, -1, 1, 2, 16, -16])) & 0xFFFFFFFF)
            elif s.k == "alloc" and rng.random() < 0.25:
                s.k, s.v, s.i = "imm", rng.choice(INTERESTING), -1
        else:
            if prog.allocs:
                a = prog.allocs[rng.randrange(len(prog.allocs))]
                a.size = rng.choice(BUF_SIZES)
                a.data = (a.data + _rand_bytes(rng, a.size, "rand"))[:a.size]
    return prog


# ---------------------------------------------------------------------------
# execution
# ---------------------------------------------------------------------------

def materialise(o: emumod.Oracle, prog: InputProgram) -> tuple[list[int], dict]:
    addrs = []
    for a in prog.allocs:
        addrs.append(o.alloc(a.size, a.data, page_start=a.page_start,
                             pad_before=a.pad_before))

    def val(s: Slot) -> int:
        if s.k == "alloc":
            return addrs[s.i] if 0 <= s.i < len(addrs) else 0
        if s.k == "null":
            return 0
        return s.v

    return addrs, {"ecx": val(prog.ecx), "edx": val(prog.edx),
                   "stack": [val(s) for s in prog.stack]}


def execute(o: emumod.Oracle, va: int, prog: InputProgram, *, cc: str,
            func_blocks: frozenset[int], timeout_us: int = 1_000_000,
            max_insns: int = 500_000) -> tuple[emumod.RunResult, dict, list[int]]:
    o.reset_scratch()
    addrs, vals = materialise(o, prog)
    r = o.call(va, cc=cc, args=vals["stack"], ecx=vals["ecx"], edx=vals["edx"],
               func_blocks=func_blocks, timeout_us=timeout_us,
               max_insns=max_insns)
    return r, vals, addrs


def snapshot_writes(o: emumod.Oracle, r: emumod.RunResult, *,
                    max_bytes: int = 4096) -> tuple[list[dict], dict]:
    """Read back the final contents of every written range, bucketed by region."""
    merged = emumod.merge_writes(r.writes)
    pe = o.pe
    img_lo, img_hi = pe.image_base, pe.image_base + pe.size_of_image
    stack_lo = emumod.STACK_BASE
    stack_hi = emumod.STACK_BASE + emumod.STACK_SIZE
    out: list[dict] = []
    counts = {"data": 0, "heap": 0, "arena": 0, "stack": 0, "other": 0,
              "rdata": 0, "text": 0}
    total = 0
    for lo, hi in merged:
        if img_lo <= lo < img_hi:
            sec = pe.section_for_va(lo)
            region = {".data": "data", ".rdata": "rdata",
                      ".text": "text"}.get(sec.name if sec else "", "other")
        elif emumod.HEAP_BASE <= lo < emumod.HEAP_BASE + emumod.HEAP_SIZE:
            region = "heap"
        elif emumod.ARENA_BASE <= lo < emumod.ARENA_BASE + emumod.ARENA_SIZE:
            region = "arena"
        elif stack_lo <= lo < stack_hi:
            region = "stack"
        else:
            region = "other"
        counts[region] = counts.get(region, 0) + (hi - lo)
        if region == "stack":
            continue                     # frame churn, not a semantic delta
        if total >= max_bytes:
            continue
        n = min(hi - lo, max_bytes - total)
        try:
            data = o.read(lo, n)
        except Exception:
            continue
        total += n
        out.append({"a": lo, "d": data.hex(), "n": hi - lo, "r": region})
    return out, counts


def vector_json(idx: int, prog: InputProgram, vals: dict, addrs: list[int],
                r: emumod.RunResult, writes: list[dict], counts: dict,
                new_blocks: int) -> dict:
    return {
        "i": idx,
        "in": prog.to_json(),
        "addrs": addrs,
        "regs_in": {"ecx": vals["ecx"], "edx": vals["edx"]},
        "regs_entry": dict(r.entry_regs),
        "eflags_entry": r.entry_eflags,
        "stack_in": vals["stack"],
        "out": {k: r.regs.get(k, 0) for k in
                ("eax", "edx", "ecx", "ebx", "esi", "edi", "ebp", "esp_delta")},
        "eflags": r.eflags,
        "term": r.term,
        "fault": (None if r.fault_va is None
                  else {"va": r.fault_va, "kind": r.fault_kind}),
        "error": r.error,
        "stubs": r.stubs,
        "calls": [{"s": c.site, "t": c.target, "d": c.depth, "a": c.args[:3],
                   "x": c.stub} for c in r.calls[:64]],
        "ncalls": len(r.calls),
        "writes": writes,
        "wbytes": counts,
        "blocks": sorted(set(r.blocks)),
        "nblocks": len(set(r.blocks)),
        "new_blocks": new_blocks,
        "maxdepth": r.max_depth,
        "poison": r.poison,
        "pure": r.pure,
    }
