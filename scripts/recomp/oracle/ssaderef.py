"""Static object-layout recovery from Ghidra's SSA high P-Code.

WHY THIS EXISTS
---------------
Fault-driven discovery (autospec.py) only observes offsets on the paths it
happens to execute.  When 0x00685bc0 returned early on an empty tree it never
dereferenced the key, so the key argument was demoted to a scalar and the
layout was wrong.  A static SSA walk sees every load and store regardless of
path, needs no emulation rounds, and covers the whole binary in one pass.

METHOD
------
`output/recomp/export/pcode/<shard>/<VA>.pcode.json.gz` (schema
`isaac-pcode/1`) is SSA high P-Code: every varnode carries an `id`, and `def`
names the op that produced it.  Roots are the incoming varnodes:

  * stack parameters -- space "stack", offset 0x4/0x8/...,  input: true
  * ECX             -- space "register", register "ECX",    input: true

ECX matters disproportionately: Ghidra classifies almost nothing in this
binary as `__thiscall`, so the prototype usually has no `this` parameter --
but the raw ECX varnode is still there as an input, which is how this
recovers the receiver that the recovered signature drops.

From each LOAD/STORE we resolve the address operand backwards through
COPY / CAST / INDIRECT / INT_ADD / INT_SUB / PTRADD / PTRSUB / MULTIEQUAL
until it bottoms out at a root, yielding (root, constant displacement).  The
access width gives the field size.

A field is a POINTER when the value loaded from it is itself later used as an
address -- the loaded varnode becomes a new root, and anything resolving to
it describes the pointee.  That is the static answer to pointer-vs-scalar,
with no emulation.

Limits, stated plainly:
  * MULTIEQUAL (phi) merges are resolved only when every incoming edge agrees
    on the root; loop-carried pointers otherwise resolve to nothing.
  * A displacement computed from a runtime value (array indexing by a
    variable) is not a constant and is skipped -- the field is still recorded
    at the base offset, so the object is sized but the element stride is not
    recovered.
"""

from __future__ import annotations

import gzip
import json
import os
import sys
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

EXPORT_ROOT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "export")
PCODE_ROOT = os.path.join(EXPORT_ROOT, "pcode")

PASSTHROUGH = {"COPY", "CAST", "INDIRECT", "INT_ZEXT", "INT_SEXT",
               "SUBPIECE_LOW"}
MAX_DEPTH = 64

# Comparisons whose constant operand is a branch boundary worth fuzzing.
COMPARE_OPS = {"INT_EQUAL", "INT_NOTEQUAL", "INT_LESS", "INT_SLESS",
               "INT_LESSEQUAL", "INT_SLESSEQUAL", "INT_CARRY", "INT_SCARRY",
               "INT_SBORROW", "FLOAT_EQUAL", "FLOAT_LESS", "FLOAT_LESSEQUAL"}
# Arithmetic against a constant that usually precedes a comparison.
ARITH_OPS = {"INT_AND", "INT_OR", "INT_XOR", "INT_SUB", "INT_ADD",
             "INT_MULT", "INT_RIGHT", "INT_LEFT", "INT_SRIGHT"}


def pcode_path(va: int) -> str:
    shard = f"{(va >> 16) & 0xFFFF:04x}"
    return os.path.join(PCODE_ROOT, shard, f"{va:08x}.pcode.json.gz")


def load_pcode(va: int):
    p = pcode_path(va)
    if not os.path.exists(p):
        return None
    try:
        with gzip.open(p, "rt", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return None


@dataclass
class Access:
    off: int
    size: int
    is_store: bool


@dataclass
class Node:
    """One object in the recovered graph."""
    key: tuple
    accesses: list = field(default_factory=list)
    ptr_fields: dict = field(default_factory=dict)   # off -> child key

    @property
    def size(self) -> int:
        return max((a.off + a.size for a in self.accesses), default=0)

    @property
    def min_off(self) -> int:
        return min((a.off for a in self.accesses), default=0)


@dataclass
class SsaLayout:
    va: int
    ok: bool = False
    error: str | None = None
    cc_model: str | None = None
    n_stack_params: int = 0
    ecx_used: bool = False
    ecx_deref: bool = False
    edx_deref: bool = False
    stack_offsets: list = field(default_factory=list)
    param_deref: list = field(default_factory=list)   # per stack param: bool
    deref_by_off: dict = field(default_factory=dict)  # stack offset -> bool
    nodes: dict = field(default_factory=dict)         # key -> Node
    roots: dict = field(default_factory=dict)         # slot -> key
    phi_merges: int = 0
    unresolved: int = 0
    resolved: int = 0
    field_consts: dict = field(default_factory=dict)  # (root,off) -> {consts}
    all_consts: set = field(default_factory=set)


def _const(v) -> int | None:
    """Constant operand, SIGN-EXTENDED to its varnode width.

    P-Code emits `[payload-4]` as INT_ADD(base, 0xfffffffc); reading that as
    unsigned made 0x0040d040's allocation header land at offset 4294967292 and
    sized the object at 4 GiB.
    """
    if v is None or v.get("space") != "const":
        return None
    raw = int(v["offset"], 16) if isinstance(v["offset"], str) else v["offset"]
    bits = (v.get("size") or 4) * 8
    if bits < 64 and raw >= (1 << (bits - 1)):
        raw -= (1 << bits)
    return raw


def _sig(v) -> tuple | None:
    """Stable identity for an INPUT varnode (a root candidate)."""
    if not v.get("input"):
        return None
    sp = v.get("space")
    if sp == "stack":
        off = int(v["offset"], 16) if isinstance(v["offset"], str) \
            else v["offset"]
        return ("stack", off)
    if sp == "register":
        return ("register", v.get("register") or v.get("offset"))
    return None


def extract(va: int, data=None) -> SsaLayout:
    lay = SsaLayout(va=va)
    d = data if data is not None else load_pcode(va)
    if d is None:
        lay.error = "no pcode"
        return lay
    proto = d.get("prototype") or {}
    lay.cc_model = proto.get("model")
    params = proto.get("params") or []

    blocks = (d.get("high") or {}).get("blocks") or []
    if not blocks:
        lay.error = "no high pcode"
        return lay
    ops = [o for b in blocks for o in (b.get("ops") or [])]
    by_seq = {o["seq"]: o for o in ops}

    # ---- root varnodes -------------------------------------------------
    # Roots come from the SSA inputs themselves, NOT from the prototype:
    # 13,959 of 14,025 functions have no recovered convention and 42 have any
    # parameters, so trusting `prototype.params` would find almost nothing.
    # Every `input: true` varnode in stack space at a positive offset is an
    # incoming argument; ECX/EDX are the register-passed ones.
    root_of_sig: dict[tuple, tuple] = {("register", "ECX"): ("ecx",),
                                       ("register", "EDX"): ("edx",)}
    stack_offs: set[int] = set()
    for o in ops:
        vs = list(o.get("inputs") or [])
        if o.get("output"):
            vs.append(o["output"])
        for v in vs:
            s = _sig(v)
            if s and s[0] == "stack" and s[1] > 0:
                stack_offs.add(s[1])
    for off in sorted(stack_offs):
        root_of_sig[("stack", off)] = ("stackarg", off)
    lay.stack_offsets = sorted(stack_offs)
    lay.n_stack_params = len(params)
    ecx_key = ("ecx",)

    nodes: dict[tuple, Node] = {}

    def node(key) -> Node:
        n = nodes.get(key)
        if n is None:
            n = Node(key)
            nodes[key] = n
        return n

    # ---- backwards resolution -----------------------------------------
    memo: dict[int, tuple | None] = {}
    load_result: dict[int, tuple] = {}    # load output id -> (root_key, off)

    def resolve(v, depth=0):
        """-> (root_key, constant_offset) or None."""
        if v is None or depth > MAX_DEPTH:
            return None
        sig = _sig(v)
        if sig is not None:
            k = root_of_sig.get(sig)
            if k is not None:
                if sig[0] == "register":
                    lay.ecx_used = True
                return (k, 0)
            return None
        vid = v.get("id")
        if vid is None:
            return None
        if vid in memo:
            return memo[vid]
        memo[vid] = None                     # cycle guard for phi loops
        dseq = v.get("def")
        if dseq is None:
            memo[vid] = None
            return None
        op = by_seq.get(dseq)
        if op is None:
            memo[vid] = None
            return None
        name = op["op"]
        ins = op.get("inputs") or []
        out = None
        if name in PASSTHROUGH and ins:
            out = resolve(ins[0], depth + 1)
        elif name == "LOAD":
            # the loaded VALUE is a new root; anything derived from it
            # describes the pointee
            out = (("load", vid), 0)
        elif name in ("INT_ADD", "PTRSUB") and len(ins) >= 2:
            c1, c0 = _const(ins[1]), _const(ins[0])
            if c1 is not None:
                b = resolve(ins[0], depth + 1)
                out = (b[0], b[1] + c1) if b else None
            elif c0 is not None:
                b = resolve(ins[1], depth + 1)
                out = (b[0], b[1] + c0) if b else None
        elif name == "INT_SUB" and len(ins) >= 2:
            c1 = _const(ins[1])
            if c1 is not None:
                b = resolve(ins[0], depth + 1)
                out = (b[0], b[1] - c1) if b else None
        elif name == "PTRADD" and len(ins) >= 3:
            idx, elem = _const(ins[1]), _const(ins[2])
            b = resolve(ins[0], depth + 1)
            if b and idx is not None and elem is not None:
                out = (b[0], b[1] + idx * elem)
            elif b:
                out = (b[0], b[1])           # variable index: base offset only
        elif name == "MULTIEQUAL":
            parts = [resolve(x, depth + 1) for x in ins]
            good = [p for p in parts if p is not None]
            if good and all(p[0] == good[0][0] for p in good):
                lay.phi_merges += 1
                out = (good[0][0], min(p[1] for p in good))
        memo[vid] = out
        return out

    # ---- walk every memory access --------------------------------------
    for op in ops:
        name = op["op"]
        ins = op.get("inputs") or []
        if name == "LOAD" and len(ins) >= 2:
            r = resolve(ins[1])
            if r is None:
                lay.unresolved += 1
                continue
            lay.resolved += 1
            key, off = r
            size = (op.get("output") or {}).get("size") or 4
            node(key).accesses.append(Access(off, size, False))
            oid = (op.get("output") or {}).get("id")
            if oid is not None:
                load_result[oid] = (key, off)
        elif name == "STORE" and len(ins) >= 3:
            r = resolve(ins[1])
            if r is None:
                lay.unresolved += 1
                continue
            lay.resolved += 1
            key, off = r
            size = ins[2].get("size") or 4
            node(key).accesses.append(Access(off, size, True))

    # ---- mine branch constants, attributed to the field they test ------
    # A second pass, because `load_result` must be complete first: a compare
    # can sit in a later block than the LOAD whose value it tests.
    def value_field(v, depth=0):
        """-> (root_key, offset) if this value was loaded from that field."""
        if v is None or depth > MAX_DEPTH:
            return None
        vid = v.get("id")
        if vid is None:
            return None
        hit = load_result.get(vid)
        if hit is not None:
            return hit
        dseq = v.get("def")
        if dseq is None:
            return None
        op = by_seq.get(dseq)
        if op is None:
            return None
        ins2 = op.get("inputs") or []
        if op["op"] in PASSTHROUGH and ins2:
            return value_field(ins2[0], depth + 1)
        if op["op"] in ARITH_OPS and len(ins2) >= 2:
            # `(field & 0xff) == 3` still tells us about `field`
            if _const(ins2[1]) is not None:
                return value_field(ins2[0], depth + 1)
            if _const(ins2[0]) is not None:
                return value_field(ins2[1], depth + 1)
        if op["op"] == "MULTIEQUAL":
            for x in ins2:
                r = value_field(x, depth + 1)
                if r is not None:
                    return r
        return None

    for op in ops:
        name = op["op"]
        ins = op.get("inputs") or []
        if name in COMPARE_OPS and len(ins) >= 2:
            for i, j in ((0, 1), (1, 0)):
                cst = _const(ins[j])
                if cst is None:
                    continue
                lay.all_consts.add(cst & 0xFFFFFFFF)
                fld = value_field(ins[i])
                if fld is not None:
                    lay.field_consts.setdefault(fld, set()).add(
                        cst & 0xFFFFFFFF)
        elif name == "STORE" and len(ins) >= 3:
            # a constant written into a field is a plausible valid value
            cst = _const(ins[2])
            if cst is not None:
                lay.all_consts.add(cst & 0xFFFFFFFF)
                r = resolve(ins[1])
                if r is not None:
                    lay.field_consts.setdefault(r, set()).add(cst & 0xFFFFFFFF)

    # ---- link loaded-pointer roots back to their parent field ----------
    for key in list(nodes):
        if key[0] == "load":
            parent = load_result.get(key[1])
            if parent is not None:
                pkey, poff = parent
                node(pkey).ptr_fields[poff] = key

    # ---- summarise ------------------------------------------------------
    lay.nodes = nodes
    lay.roots = {"ecx": ecx_key}
    lay.ecx_deref = bool(nodes.get(ecx_key) and nodes[ecx_key].accesses)
    lay.edx_deref = bool(nodes.get(("edx",)) and nodes[("edx",)].accesses)
    lay.deref_by_off = {
        off: bool(nodes.get(("stackarg", off))
                  and nodes[("stackarg", off)].accesses)
        for off in lay.stack_offsets}
    # canonical view: argument i lives at Stack[0x4 + 4i]
    lay.param_deref = [lay.deref_by_off.get(4 + 4 * i, False)
                       for i in range(len(lay.stack_offsets))]
    lay.ok = True
    return lay


# ---------------------------------------------------------------------------
# conversion to the executable layout the oracle already knows how to run
# ---------------------------------------------------------------------------

def to_autospec_layout(lay: SsaLayout, cc: str, n_args: int, static_blocks=0):
    """Build an autospec.Layout from the static graph (no emulation)."""
    import autospec

    objs: list = []
    index: dict[tuple, int] = {}
    order: list[tuple] = []

    def ensure(key) -> int:
        if key in index:
            return index[key]
        i = len(objs)
        index[key] = i
        order.append(key)
        objs.append(autospec.Obj())
        return i

    thiscall = cc in ("thiscall", "fastcall")
    slots: list = []
    ecx_key = ("ecx",)
    ecx_deref = bool(lay.nodes.get(ecx_key) and lay.nodes[ecx_key].accesses)
    if ecx_deref:
        # Point ECX at a real object whenever the SSA proves it is
        # dereferenced, EVEN IF the convention was inferred as cdecl/stdcall.
        # ECX is caller-saved scratch under every convention here, so a true
        # cdecl callee simply ignores it -- there is no downside, and it
        # rescues the ~12.6% of functions whose convention we get wrong.
        # 0x00423480 is exactly this case: really (ECX=data, EDX=len, ...)
        # but inferred cdecl, so its receiver was never supplied at all.
        slots.append(("ptr", ensure(ecx_key)))
    else:
        slots.append(("imm", 0) if not thiscall else ("scalar", 0))

    for i in range(n_args):
        key = ("stackarg", 4 + 4 * i)
        n = lay.nodes.get(key)
        if n is not None and n.accesses:
            slots.append(("ptr", ensure(key)))
        else:
            slots.append(("scalar", 0))

    # size every reachable object and wire its pointer fields
    seen = set()
    while True:
        pending = [k for k in order if k not in seen]
        if not pending:
            break
        for key in pending:
            seen.add(key)
            n = lay.nodes.get(key)
            i = index[key]
            if n is None:
                continue
            lo = min(0, n.min_off)
            objs[i].pad_before = ((-lo) + 15) & ~15 if lo < 0 else 0
            size = max(4, n.size)
            objs[i].size = min((size + 15) & ~15, autospec.MAX_OBJ_SIZE)
            objs[i].offsets = {a.off for a in n.accesses}
            # Shape recognition belongs here, where the access WIDTHS are
            # still available.  An object touched only one byte at a time at
            # small offsets is a character buffer whose real length is a
            # runtime value -- the static size (4) badly underestimates it,
            # which is why string compares scored worse than blind fuzzing.
            widths = {a.size for a in n.accesses}
            offs = objs[i].offsets
            if {0x10, 0x14} <= offs and objs[i].size >= 0x18:
                objs[i].shape = "basic_string"
            elif 0xD in offs and ({0x0, 0x8} & offs):
                objs[i].shape = "tree_node"
            elif 1 in widths and max(offs, default=0) < 0x10 and                     not objs[i].ptr_fields:
                # Byte-granular access at small offsets == character buffer.
                # `widths == {1}` was too strict: MSVC's string compare has a
                # dword fast path, so the widths are {4, 1} and 0x00423480
                # was left as a bare 4-byte object with no content to compare.
                objs[i].shape = "buffer"
                objs[i].size = 0x80
            for (rk, roff), cs in lay.field_consts.items():
                if rk == key and 0 <= roff < objs[i].size:
                    objs[i].field_consts.setdefault(roff, set()).update(cs)
            for off, child in n.ptr_fields.items():
                if off < 0 or off + 4 > objs[i].size:
                    continue
                cn = lay.nodes.get(child)
                if cn is None or not cn.accesses:
                    continue
                if len(objs) >= autospec.MAX_OBJS:
                    break
                objs[i].ptr_fields[off] = ensure(child)

    out = autospec.Layout(lay.va, cc, n_args, objs, slots, rounds=0,
                          status="ssa" if lay.ok else "ssa-failed",
                          static_blocks=static_blocks)
    out.all_consts = sorted(lay.all_consts)
    return out


if __name__ == "__main__":
    import time
    for arg in sys.argv[1:]:
        va = int(arg, 0)
        t0 = time.perf_counter()
        lay = extract(va)
        ms = (time.perf_counter() - t0) * 1000
        print(f"{va:#010x} ok={lay.ok} err={lay.error} model={lay.cc_model} "
              f"stack_params={lay.n_stack_params} ecx_used={lay.ecx_used} "
              f"ecx_deref={lay.ecx_deref} param_deref={lay.param_deref} "
              f"resolved={lay.resolved} unresolved={lay.unresolved} "
              f"phi={lay.phi_merges}  {ms:.1f} ms")
        for key, nd in lay.nodes.items():
            if not nd.accesses:
                continue
            offs = sorted({a.off for a in nd.accesses})
            print(f"    {str(key):<18} size={nd.size:#x} offs={[hex(o) for o in offs]}"
                  f" ptrs={ {hex(k): str(v) for k, v in nd.ptr_fields.items()} }")
