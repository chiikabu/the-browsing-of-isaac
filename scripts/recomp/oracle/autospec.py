"""Automatic spec generation by FAULT-DRIVEN LAYOUT DISCOVERY.

The Ghidra export turned out to carry almost no type information for this
binary (24,096 of 24,170 functions are `callingConvention: unknown` and only
50 have any recovered parameters), so a generator built on recovered
signatures would have nothing to stand on.  The oracle, however, already
reports the EXACT virtual address of every bad memory access.  That is enough
to recover object layout without any type recovery at all:

  1. Pass every argument as a pointer to a 4-byte object.
  2. Run.  The function faults reading, say, `obj0 + 0x14`.
  3. Grow obj0 to cover 0x14 and run again.
  4. Repeat.  Each fault reveals one more offset that is genuinely
     dereferenced -- observed behaviour, not inference.

Nested objects fall out of the same loop.  Every dword slot of every object
is pre-filled with a POISONED POINTER encoding its own location:

     value = PTR_TAG_BASE | (obj_index << 20) | (field_offset << 8)

That address is unmapped, so if the function ever loads the field and
dereferences it, the fault VA decodes straight back to "object i, field k is
a pointer, and its target is used at offset (VA & 0xFF)".  The field is then
promoted to a real child object and discovery recurses.

What this CANNOT discover is scalar VALUES: a field that must equal 3 to take
an interesting branch never causes a fault.  Layout comes from faults, values
come from fuzzing the discovered objects -- which is exactly the split that
makes the combination work.

Output: a JSON layout per function (output/recomp/oracle/autospec/<va>.json)
that `runner.py` can execute directly, no hand editing.
"""

from __future__ import annotations

import argparse
import json
import multiprocessing as mp
import os
import random
import struct
import sys
import time
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import abi as abimod        # noqa: E402
import cfg as cfgmod        # noqa: E402
import crtmodels           # noqa: E402
import emu as emumod       # noqa: E402
import peimage             # noqa: E402
import ssaderef            # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
AUTOSPEC_DIR = os.path.join(OUT, "autospec")

# Unmapped tag space.  obj<8 bits, field offset<12 bits, sub-offset<8 bits.
# The sub-offset is BIASED by 0x80 so that a NEGATIVE dereference off the
# pointer -- MSVC reads the allocation header at [payload-4] constantly --
# still decodes into the same (obj, field) cell instead of falling out of the
# tag region entirely.  Without the bias 0x0040d040 was unresolvable.
PTR_TAG_BASE = 0x78000000
PTR_TAG_SIZE = 0x10000000
SUB_BIAS = 0x80
MAX_OBJS = 96
MAX_OBJ_SIZE = 0x1000
GROW_SLACK = 0x10
MAX_ROUNDS = 48


def tag_for(obj: int, off: int) -> int:
    return (PTR_TAG_BASE | ((obj & 0xFF) << 20) | ((off & 0xFFF) << 8)
            | SUB_BIAS)


def decode_tag(va: int):
    """-> (obj, field_offset, SIGNED sub-offset) or None."""
    if not (PTR_TAG_BASE <= va < PTR_TAG_BASE + PTR_TAG_SIZE):
        return None
    d = va - PTR_TAG_BASE
    return ((d >> 20) & 0xFF, (d >> 8) & 0xFFF, (d & 0xFF) - SUB_BIAS)


@dataclass
class Obj:
    size: int = 4
    pad_before: int = 0
    ptr_fields: dict[int, int] = field(default_factory=dict)  # off -> obj idx
    field_consts: dict = field(default_factory=dict)   # off -> {constants}
    offsets: set = field(default_factory=set)          # accessed offsets
    shape: str | None = None                           # recognised MSVC shape

    def to_json(self):
        return {"size": self.size, "pad_before": self.pad_before,
                "ptr_fields": {str(k): v for k, v in self.ptr_fields.items()},
                "field_consts": {str(k): sorted(v)
                                 for k, v in self.field_consts.items()},
                "offsets": sorted(self.offsets), "shape": self.shape}

    @staticmethod
    def from_json(d):
        return Obj(d["size"], d.get("pad_before", 0),
                   {int(k): v for k, v in d.get("ptr_fields", {}).items()},
                   {int(k): set(v)
                    for k, v in (d.get("field_consts") or {}).items()},
                   set(d.get("offsets") or []), d.get("shape"))


def neighbourhood(consts) -> list[int]:
    """A branch on `< 0x10` needs 0xF, 0x10 AND 0x11 in the pool -- the
    literal alone only ever exercises one side of the comparison."""
    out: set[int] = set()
    for c in consts:
        c &= 0xFFFFFFFF
        for d in (-1, 0, 1):
            out.add((c + d) & 0xFFFFFFFF)
    out.update((0, 1, 0xFFFFFFFF, 0x7FFFFFFF, 0x80000000))
    return sorted(out)


@dataclass
class Layout:
    va: int
    cc: str
    n_args: int
    objs: list[Obj]
    slots: list  # per slot: ("ptr", idx) | ("imm", value); slot 0 = ecx
    rounds: int = 0
    status: str = "?"
    term: str = "?"
    fault: str | None = None
    blocks: int = 0
    static_blocks: int = 0
    const_pool: list = field(default_factory=list)
    shapes_used: int = 0

    def to_json(self):
        return {"va": self.va, "cc": self.cc, "n_args": self.n_args,
                "objs": [o.to_json() for o in self.objs],
                "slots": self.slots, "rounds": self.rounds,
                "status": self.status, "term": self.term, "fault": self.fault,
                "blocks": self.blocks, "static_blocks": self.static_blocks,
                "const_pool": self.const_pool[:64],
                "shapes_used": self.shapes_used}

    @staticmethod
    def from_json(d):
        return Layout(d["va"], d["cc"], d["n_args"],
                      [Obj.from_json(x) for x in d["objs"]],
                      [tuple(s) for s in d["slots"]], d.get("rounds", 0),
                      d.get("status", "?"), d.get("term", "?"),
                      d.get("fault"), d.get("blocks", 0),
                      d.get("static_blocks", 0))


def materialise(o: emumod.Oracle, lay: Layout, rng: random.Random | None = None,
                fuzz: bool = False) -> list[int]:
    """Allocate every object, fill scalars, then patch in child pointers."""
    addrs: list[int] = []
    for ob in lay.objs:
        size = min(max(ob.size, 4), MAX_OBJ_SIZE)
        if fuzz:
            # Discovery is over.  Poisoned pointers exist to PROVOKE faults;
            # keeping them during fuzzing would guarantee one on every slot
            # discovery never got round to testing.  NULL is the safer
            # default and is what a real caller most often passes.
            body = bytearray(size)
        else:
            body = bytearray()
            for off in range(0, (size + 3) & ~3, 4):
                body += struct.pack("<I", tag_for(len(addrs), off))
            body = body[:size]
        if fuzz and rng is not None:
            pool = getattr(lay, "const_pool", None)
            for off in range(0, size - 3, 4):
                if off in ob.ptr_fields:
                    continue
                # Constants the code actually compares this field against beat
                # generic magic numbers: 0x0040d040 branches on capacity
                # 0xf/0xfff, and no generic list reliably contains 0xfff.
                fc = ob.field_consts.get(off)
                r = rng.random()
                if fc and r < 0.60:
                    v = rng.choice(neighbourhood(fc))
                elif pool and r < 0.75:
                    v = rng.choice(pool)
                elif r < 0.88:
                    v = rng.choice([0, 1, 2, 3, 4, 8, 0xF, 0x10, 0x1F, 0x20,
                                    0x7F, 0xFF, 0x100, 0x1000, 0x7FFFFFFF,
                                    0xFFFFFFFF])
                elif r < 0.95:
                    v = rng.getrandbits(32)
                else:
                    continue
                struct.pack_into("<I", body, off, v & 0xFFFFFFFF)
        addrs.append(o.alloc(size, bytes(body), pad_before=ob.pad_before,
                             page_start=size > 0x800))
    if fuzz and rng is not None:
        # A valid instance beats a fuzzed one for the shapes whose invariants
        # the fuzzer cannot stumble into: a string whose size and capacity
        # agree, a tree node whose isnil matches its links.
        import constants as constmod
        for i, ob in enumerate(lay.objs):
            if not ob.shape:
                continue
            cs = set()
            for v in ob.field_consts.values():
                cs.update(v)
            try:
                constmod.instantiate_shape(o, addrs[i], ob.shape, rng,
                                           consts=cs, size_hint=ob.size)
            except Exception:
                pass
    for i, ob in enumerate(lay.objs):
        for off, child in ob.ptr_fields.items():
            if 0 <= child < len(addrs) and off + 4 <= ob.size:
                o.write(addrs[i] + off, struct.pack("<I", addrs[child]))
    return addrs


def run_layout(o: emumod.Oracle, lay: Layout, fb: frozenset,
               rng: random.Random | None = None, fuzz: bool = False,
               max_insns: int = 200_000):
    o.reset_scratch()
    addrs = materialise(o, lay, rng, fuzz)

    SCALARS = [0, 1, 2, 3, 4, 8, 0xF, 0x10, 0x1F, 0x20, 0x40, 0x7F, 0xFF,
               0x100, 0x400, 0x1000, 0xFFFF, 0x7FFFFFFF, 0x80000000,
               0xFFFFFFFF]

    def val(slot):
        kind, v = slot
        if kind == "ptr":
            return addrs[v] if 0 <= v < len(addrs) else 0
        if kind == "scalar" and rng is not None:
            return (rng.choice(SCALARS) if rng.random() < 0.75
                    else rng.getrandbits(32))
        return v

    ecx = val(lay.slots[0]) if lay.slots else 0
    args = [val(s) for s in lay.slots[1:]]
    r = o.call(lay.va, cc=lay.cc, args=args, ecx=ecx, func_blocks=fb,
               max_insns=max_insns)
    return r, addrs


def discover(o: emumod.Oracle, va: int, c: cfgmod.FuncCfg, a: abimod.AbiGuess,
             *, purge_args: int | None = None,
             seed_layout: Layout | None = None) -> Layout:
    """Iteratively grow an object graph until the call stops faulting.

    `seed_layout` starts from an already-known layout (e.g. one recovered
    statically from SSA P-Code) and only refines what the static pass could
    not resolve -- phi-merged loop pointers, mostly.
    """
    n_args = purge_args if purge_args is not None else a.n_args
    n_args = max(0, min(n_args, 12))
    thiscall = a.cc in ("thiscall", "fastcall")
    fb = frozenset(c.blocks)

    if seed_layout is not None:
        lay = seed_layout
        lay.static_blocks = c.block_count
        objs, slots = lay.objs, lay.slots
        if not objs:
            objs.append(Obj())
            slots[:] = [("ptr", 0) if thiscall else ("imm", 0)]
    else:
        objs = [Obj()]
        slots = [("ptr", 0) if thiscall else ("imm", 0)]
        for i in range(n_args):
            objs.append(Obj())
            slots.append(("ptr", len(objs) - 1))
        lay = Layout(va, a.cc, n_args, objs, slots,
                     static_blocks=c.block_count)

    best_blocks = 0
    seen_states: set = set()
    for rnd in range(MAX_ROUNDS):
        lay.rounds = rnd + 1
        try:
            r, addrs = run_layout(o, lay, fb)
        except MemoryError:
            lay.status = "scratch-exhausted"
            break
        except Exception as e:
            lay.status = f"harness:{type(e).__name__}"
            break
        best_blocks = max(best_blocks, len(set(r.blocks) & fb))
        lay.term, lay.blocks = r.term, best_blocks
        if r.term == "ret":
            lay.status = "ok"
            lay.fault = None
            break
        if r.fault_va is None:
            lay.status = f"noprogress:{r.term}"
            break
        v = r.fault_va
        lay.fault = f"{v:#010x}/{r.fault_kind}"

        # (a) fault inside a live object -> grow it
        grew = False
        for i, base in enumerate(addrs):
            ob = objs[i]
            lo = base - ob.pad_before
            if lo - 0x40 <= v < base + MAX_OBJ_SIZE:
                if v < base:                      # negative offset (headers)
                    need = base - v + 4
                    if need > ob.pad_before and need <= 0x80:
                        ob.pad_before = (need + 15) & ~15
                        grew = True
                else:
                    off = v - base
                    need = min(off + GROW_SLACK, MAX_OBJ_SIZE)
                    if need > ob.size:
                        ob.size = (need + 15) & ~15
                        grew = True
                break
        if grew:
            state = (tuple((x.size, x.pad_before) for x in objs),
                     tuple(sorted((i, k, c2) for i, x in enumerate(objs)
                                  for k, c2 in x.ptr_fields.items())))
            if state in seen_states:
                lay.status = "cycle"
                break
            seen_states.add(state)
            continue

        # (b) fault on a poisoned pointer -> promote that field to an object
        dec = decode_tag(v)
        if dec is not None:
            oi, off, sub = dec
            if oi < len(objs) and off not in objs[oi].ptr_fields:
                if len(objs) >= MAX_OBJS:
                    lay.status = "obj-limit"
                    break
                child = Obj()
                if sub < 0:                 # e.g. MSVC's [payload-4] header
                    child.pad_before = ((-sub) + 15) & ~15
                else:
                    child.size = max(4, (sub + GROW_SLACK + 15) & ~15)
                objs.append(child)
                objs[oi].ptr_fields[off] = len(objs) - 1
                if off + 4 > objs[oi].size:
                    objs[oi].size = (off + 4 + 15) & ~15
                continue
            lay.status = "tag-repeat"
            break

        # (c) something we cannot synthesise (null field, global, ...)
        lay.status = f"unresolved:{r.fault_kind}"
        break
    else:
        lay.status = "round-limit"
    _demote_untouched_scalars(lay)
    return lay


def _demote_untouched_scalars(lay: Layout):
    """An argument whose object was never grown and never had a pointer field
    discovered was never dereferenced -- so it is an integer, not a pointer.
    Passing an address where the callee wants a count is a common way to make
    a function return early and score 2 blocks out of 18, so this matters.
    Evidence-based: only objects discovery never touched are demoted."""
    referenced = {c for ob in lay.objs for c in ob.ptr_fields.values()}
    for si, (kind, v) in enumerate(lay.slots):
        if kind != "ptr" or not (0 <= v < len(lay.objs)):
            continue
        ob = lay.objs[v]
        if ob.size <= 4 and not ob.ptr_fields and ob.pad_before == 0 \
                and v not in referenced:
            lay.slots[si] = ("scalar", 0)


# ---------------------------------------------------------------------------

_W = {}


def ssa_layout(va: int, c, a, static_blocks: int) -> Layout:
    """Layout straight out of the static SSA walk -- zero emulation."""
    sl = ssaderef.extract(va)
    if not sl.ok:
        return Layout(va, a.cc, a.n_args, [Obj()],
                      [("ptr", 0) if a.cc in ("thiscall", "fastcall")
                       else ("imm", 0)],
                      status="ssa-failed:%s" % sl.error,
                      static_blocks=static_blocks)
    # Convention and arity stay with abi.infer: measured against the 641 ZHL
    # declarations, SSA is WORSE at both (cc 78.8% vs 87.4%, arity 65.9% vs
    # 87.7%).  SSA is used only for what it is better at -- which fields are
    # dereferenced, at what offsets, and which are pointers (84.2% vs 71.1%).
    lay = ssaderef.to_autospec_layout(sl, a.cc, a.n_args, static_blocks)
    lay.status = "ssa"
    return lay


def add_values(lay: Layout, pe, c, *, shapes: bool = True) -> Layout:
    """Attach mined branch constants and recognise MSVC shapes.

    Layout alone moved block coverage +2.7 points; this is the part that is
    supposed to move it further, and it is measured separately so the claim
    can be checked."""
    import constants as constmod
    pool = set(lay.const_pool)
    pool.update(constmod.mine_instructions(pe, c, compare_only=True))
    for ob in lay.objs:
        for cs in ob.field_consts.values():
            pool.update(cs)
    lay.const_pool = neighbourhood(pool)[:512]
    if shapes:
        lay.shapes_used = constmod.annotate_shapes(lay)
    return lay


def _init(fuzz_n: int, seed: int, baseline: bool = True,
          arms: tuple = ("fault",)):
    pe = peimage.load()
    o = emumod.Oracle(pe)
    crtmodels.install(o)
    _W.update(pe=pe, o=o, fuzz_n=fuzz_n, seed=seed, baseline=baseline,
              arms=arms,
              starts=set(cfgmod.build_function_starts(
                  pe, os.path.join(OUT, "func_starts.json"))),
              purge=_load_purge())


def _load_purge() -> dict[int, int]:
    """Ghidra's validated stackPurge -> stack-argument count (45.2% of funcs)."""
    p = os.path.join(peimage.REPO_ROOT, "output", "recomp", "export",
                     "functions.jsonl")
    out: dict[int, int] = {}
    if not os.path.exists(p):
        return out
    with open(p, "r", encoding="utf-8") as fh:
        for line in fh:
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get("stackPurgeValid") and isinstance(d.get("stackPurge"), int):
                out[int(d["va"], 16)] = d["stackPurge"] // 4
    return out


def _one(va: int) -> dict:
    o, pe = _W["o"], _W["pe"]
    t0 = time.perf_counter()
    try:
        c = cfgmod.recover(pe, va, func_starts=_W["starts"])
        a = abimod.infer(pe, c)
        purge = _W["purge"].get(va)
        # Ghidra's purge is authoritative for arity when it is valid AND the
        # function is not cdecl; abi.infer's ret-imm agrees by construction,
        # so this only helps the frameless / guessed cases.
        fb = frozenset(c.blocks)
        n = _W["fuzz_n"]
        arms = _W["arms"]
        pa = purge if (a.ret_bytes == 0 and purge) else None
        results = {}
        t_lay = {}
        lay = None
        if "fault" in arms:
            t = time.perf_counter()
            lf = discover(o, va, c, a, purge_args=pa)
            t_lay["fault"] = time.perf_counter() - t
            results["fault"] = (lf, _fuzz(o, lf, fb, n))
            lay = lf
        if "ssa" in arms:
            t = time.perf_counter()
            ls = ssa_layout(va, c, a, c.block_count)
            t_lay["ssa"] = time.perf_counter() - t
            results["ssa"] = (ls, _fuzz(o, ls, fb, n))
            lay = lay or ls
        if "ssaraw" in arms:
            # SSA layout with shape instantiation DISABLED, so the effect of
            # valid shapes can be isolated.  Without this arm every SSA arm
            # carries shapes (recognition happens in the layout builder) and
            # "shapes on/off" ties on every function by construction.
            t = time.perf_counter()
            lr = ssa_layout(va, c, a, c.block_count)
            for ob in lr.objs:
                ob.shape = None
            t_lay["ssaraw"] = time.perf_counter() - t
            results["ssaraw"] = (lr, _fuzz(o, lr, fb, n))
            lay = lay or lr
        if "const" in arms:
            t = time.perf_counter()
            lc = ssa_layout(va, c, a, c.block_count)
            lc = add_values(lc, pe, c, shapes=True)
            t_lay["const"] = time.perf_counter() - t
            results["const"] = (lc, _fuzz(o, lc, fb, n))
            lay = lay or lc
        if "constonly" in arms:
            t = time.perf_counter()
            lc2 = ssa_layout(va, c, a, c.block_count)
            lc2 = add_values(lc2, pe, c, shapes=False)
            t_lay["constonly"] = time.perf_counter() - t
            results["constonly"] = (lc2, _fuzz(o, lc2, fb, n))
            lay = lay or lc2
        if "hybrid" in arms:
            t = time.perf_counter()
            lh = ssa_layout(va, c, a, c.block_count)
            if lh.status == "ssa":
                lh = discover(o, va, c, a, purge_args=pa, seed_layout=lh)
                lh.status = "hybrid:" + lh.status
            t_lay["hybrid"] = time.perf_counter() - t
            results["hybrid"] = (lh, _fuzz(o, lh, fb, n))
            lay = lay or lh
        if lay is None:
            lay = discover(o, va, c, a, purge_args=pa)
            results["fault"] = (lay, _fuzz(o, lay, fb, n))
        # ALWAYS fuzz, whatever the discovery status.  A partially discovered
        # layout is still worth far more than none: 0x0040d040 ends
        # `unresolved` and still reaches 6 of 7 blocks.  Gating this on
        # status=="ok" scored every other function 0% by construction and
        # made the comparison against blind fuzzing meaningless.
        cov, pure, pmm, rets = results[list(results)[0]][1]

        # Paired baseline: same VA, same budget, same seed, no layout
        # discovery.  Comparing against a different population is not a
        # comparison.
        bcov = bpure = brets = 0
        if _W["baseline"]:
            bcov, bpure, brets = _blind(o, va, c, a, fb, n)

        d = lay.to_json()
        nb = c.block_count or 1
        d.update(fuzz_n=n, fuzz_ret=rets, fuzz_pure=pure,
                 fuzz_pure_modulo_models=pmm, fuzz_cov=cov,
                 fuzz_cov_pct=round(100.0 * cov / nb, 1),
                 blind_cov=bcov, blind_pure=bpure, blind_ret=brets,
                 blind_cov_pct=round(100.0 * bcov / nb, 1),
                 abi_cc=a.cc, abi_args=a.n_args, abi_conf=a.confidence,
                 ghidra_purge_args=purge,
                 secs=round(time.perf_counter() - t0, 3))
        nbb = c.block_count or 1
        d["arms"] = {
            k: {"status": v[0].status, "objs": len(v[0].objs),
                "cov": v[1][0], "cov_pct": round(100.0 * v[1][0] / nbb, 1),
                "pure": v[1][1], "pmm": v[1][2], "ret": v[1][3],
                "layout_ms": round(t_lay.get(k, 0.0) * 1000, 2)}
            for k, v in results.items()}
        return d
    except Exception as e:
        return {"va": va, "status": f"error:{type(e).__name__}: {e}",
                "secs": round(time.perf_counter() - t0, 3)}


def _fuzz(o, lay, fb, n):
    cov: set[int] = set()
    pure = pmm = rets = 0
    for i in range(n):
        rng = random.Random((_W["seed"] * 2654435761) ^ (i * 0x9E3779B1))
        try:
            r, _ = run_layout(o, lay, fb, rng, fuzz=True)
        except Exception:
            o.reset_scratch()
            continue
        cov |= set(r.blocks) & fb
        rets += r.term == "ret"
        pure += r.pure
        pmm += r.pure_modulo_models
        o.restore_dirty(r)
    return len(cov), pure, pmm, rets


def _blind(o, va, c, a, fb, n):
    import runner as runmod
    import vectors as vecmod
    cov: set[int] = set()
    pure = rets = 0
    for i in range(n):
        rng = runmod.vec_rng(_W["seed"], i)
        prog = vecmod.generate(rng, n_stack=a.n_args,
                               thiscall=a.cc in ("thiscall", "fastcall"))
        try:
            r, _v, _ad = vecmod.execute(o, va, prog, cc=a.cc, func_blocks=fb,
                                        max_insns=200_000)
        except Exception:
            o.reset_scratch()
            continue
        cov |= set(r.blocks) & fb
        rets += r.term == "ret"
        pure += r.pure
        o.restore_dirty(r)
    return len(cov), pure, rets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vas-file")
    ap.add_argument("--va", action="append", default=[])
    ap.add_argument("--sample", type=int, default=600)
    ap.add_argument("--fuzz", type=int, default=60)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--workers", type=int, default=max(1, mp.cpu_count() - 2))
    ap.add_argument("--out", default=os.path.join(OUT, "autospec.jsonl"))
    ap.add_argument("--fresh", action="store_true")
    ap.add_argument("--no-baseline", action="store_true")
    ap.add_argument("--arms", default="fault",
                    help="comma list of fault,ssa,hybrid")
    a = ap.parse_args()

    os.makedirs(AUTOSPEC_DIR, exist_ok=True)
    pe = peimage.load()
    starts = cfgmod.build_function_starts(pe, os.path.join(OUT,
                                                           "func_starts.json"))
    vas = [int(v, 0) for v in a.va]
    if a.vas_file:
        with open(a.vas_file, "r", encoding="utf-8") as fh:
            vas += [int(x, 0) for x in fh.read().split() if x.strip()]
    if not vas:
        vas = sorted(starts)
    rng = random.Random(a.seed)
    if a.sample and len(vas) > a.sample:
        vas = sorted(rng.sample(vas, a.sample))

    done: set[int] = set()
    if not a.fresh and os.path.exists(a.out):
        with open(a.out, "r", encoding="utf-8") as fh:
            for line in fh:
                try:
                    done.add(json.loads(line)["va"])
                except Exception:
                    pass
    todo = [v for v in vas if v not in done]
    print(f"autospec: {len(vas)} functions ({len(done)} done), "
          f"{a.fuzz} fuzz vectors each, {a.workers} workers")
    if not todo:
        print("nothing to do")
        return
    t0 = time.time()
    k = 0
    with open(a.out, "a" if done else "w", encoding="utf-8") as fh, \
            mp.Pool(a.workers, initializer=_init,
                    initargs=(a.fuzz, a.seed, not a.no_baseline,
                              tuple(x.strip() for x in a.arms.split(",")
                                    if x.strip()))) as pool:
        for rec in pool.imap_unordered(_one, todo, chunksize=2):
            fh.write(json.dumps(rec, separators=(",", ":")) + "\n")
            k += 1
            if k % 100 == 0:
                fh.flush()
                el = time.time() - t0
                print(f"  {k}/{len(todo)}  {k/el:.1f} func/s  "
                      f"eta {(len(todo)-k)/(k/el):.0f}s")
    print(f"\n{k} functions in {time.time()-t0:.1f}s -> {a.out}")


if __name__ == "__main__":
    main()
