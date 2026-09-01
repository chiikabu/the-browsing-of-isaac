"""STABLE INTERFACE: "give me N ground-truth vectors for VA X".

This is the contract the lifter consumes.  Everything else in this directory
is implementation detail and may change; the shapes below will not.

Python
------
    import sys; sys.path.insert(0, "scripts/recomp/oracle")
    from api import OracleSession

    with OracleSession() as s:
        res = s.vectors(0x00685bc0, n=1000)
        for v in res.vectors:
            ...

Command line (JSON on stdout, one object)
-----------------------------------------
    python scripts/recomp/oracle/api.py --va 0x00685bc0 --n 1000
    python scripts/recomp/oracle/api.py --va 0x00685bc0 --n 1000 --pure-only
    python scripts/recomp/oracle/api.py --batch vas.txt --n 200 --out-dir DIR

Vector schema (stable)
----------------------
    {
      "i":        int          vector index; reproducible from (seed, i)
      "cc":       str          "cdecl"|"stdcall"|"thiscall"|"fastcall"
      "in": {
        "ecx":  uint32,  "edx": uint32,
        "stack":[uint32],                 pushed left-to-right
        "regs": {eax,ebx,ecx,edx,esi,edi,ebp,esp}  FULL entry state
        "eflags": uint32                  entry flags (mask 0x8d5)
        "mem":  [{"a":uint32,"d":hex}]    every byte the harness placed
      },
      "out": {
        "eax":  uint32, "edx": uint32, "ecx": uint32, "ebx": uint32,
        "esi":  uint32, "edi": uint32, "ebp": uint32,
        "esp_delta": uint32,             ESP after - ESP at entry
        "eflags": uint32                 CF PF AF ZF SF OF only (mask 0x8d5)
      },
      "writes":  [{"a":uint32,"d":hex,"r":region}]   final bytes, stack excluded
      "calls":   [{"s":site,"t":target,"d":depth,"a":[args],"x":stub_or_null}]
      "term":    "ret"|"fault"|"cpu-exception"|"invalid-insn"|"insn-limit"|...
      "fault":   null | {"va":uint32,"kind":str}
      "stubs":   [str]   imports that returned 0 and did nothing
      "models":  [str]   imports run by a faithful in-emulator model
      "blocks":  [uint32]  basic blocks entered
      "pure":            bool   <-- x86-only ground truth
      "pure_modulo_models": bool
    }

CALLEE-SAVED REGISTERS
----------------------
`in.regs` is the complete entry state, so the expected output of a
callee-saved register (EBX, ESI, EDI, EBP) is simply
`in.regs[name]`.  Do NOT start them at zero: a register-preserving
function then mismatches on every vector, and anything dereferencing
[EBP-N] traps.  The harness currently enters with EAX=EBX=ESI=EDI=0
and EBP=ESP, but READ the published values rather than relying on
that -- they are per-vector precisely so this can change without
breaking a consumer.

TRUST RULE -- the only one that matters
---------------------------------------
Compare a lifted function against `pure` vectors only.  A vector that is not
`pure` had something outside the original machine code influence it, and the
reason is always recorded (`stubs`, `models`, `fault`, `term`).  Use
`pure_modulo_models` if you accept malloc/memset/memcpy behaving as
documented; that is a real but much weaker assumption.  Never filter on
`term == "ret"` alone.

`writes` is the semantic memory delta; stack frame churn is deliberately
excluded.  `esp_delta` is how you check the callee popped what the calling
convention says it should.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import abi as abimod        # noqa: E402
import autospec            # noqa: E402
import cfg as cfgmod        # noqa: E402
import crtmodels           # noqa: E402
import emu as emumod       # noqa: E402
import peimage             # noqa: E402
import runner as runmod    # noqa: E402
import specs as specsmod   # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")

SOURCE_HAND = "hand-spec"
SOURCE_AUTO = "autospec"        # SSA layout, fault-driven fallback
SOURCE_SSA = "ssa"              # force the static P-Code layout
SOURCE_FAULT = "fault"          # force fault-driven discovery
SOURCE_BLIND = "blind"


@dataclass
class VectorSet:
    va: int
    cc: str
    n_args: int
    source: str                 # hand-spec | autospec | blind
    sha256: str
    seed: int
    vectors: list = field(default_factory=list)
    static_blocks: int = 0
    covered_blocks: int = 0
    pure: int = 0
    pure_modulo_models: int = 0
    terms: dict = field(default_factory=dict)
    note: str = ""

    @property
    def coverage_pct(self) -> float:
        return (100.0 * self.covered_blocks / self.static_blocks
                if self.static_blocks else 0.0)

    def to_json(self, include_vectors: bool = True) -> dict:
        d = {
            "va": self.va, "va_hex": f"{self.va:#010x}", "cc": self.cc,
            "n_args": self.n_args, "source": self.source,
            "binary_sha256": self.sha256, "seed": self.seed,
            "n_vectors": len(self.vectors),
            "static_blocks": self.static_blocks,
            "covered_blocks": self.covered_blocks,
            "coverage_pct": round(self.coverage_pct, 1),
            "pure": self.pure, "pure_modulo_models": self.pure_modulo_models,
            "terms": self.terms, "note": self.note,
        }
        if include_vectors:
            d["vectors"] = self.vectors
        return d


class OracleSession:
    """One Unicorn machine, reused across many `vectors()` calls.

    Construction costs about a second (mapping a 9 MiB image and rewriting
    622 IAT slots); calls after that are cheap, so hold the session open.
    """

    def __init__(self, exe: str | None = None, seed: int = 1):
        self.pe = peimage.load(exe) if exe else peimage.load()
        self.o = emumod.Oracle(self.pe)
        crtmodels.install(self.o)
        self.seed = seed
        self.starts = set(cfgmod.build_function_starts(
            self.pe, os.path.join(OUT, "func_starts.json")))
        self._auto: dict[int, autospec.Layout] = {}

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    # -- introspection ---------------------------------------------------
    def describe(self, va: int) -> dict:
        c = cfgmod.recover(self.pe, va, func_starts=self.starts)
        a = abimod.infer(self.pe, c)
        return {
            "va": va, "cc": a.cc, "n_args": a.n_args,
            "abi_confidence": a.confidence, "abi_reason": a.reason,
            "ret_bytes": a.ret_bytes,
            "static_blocks": c.block_count, "instructions": len(c.insns),
            "lo": c.lo, "hi": c.hi,
            "direct_calls": sum(1 for x in c.calls if x.kind == "direct"),
            "iat_calls": sum(1 for x in c.calls if x.kind == "iat"),
            "indirect_calls": sum(1 for x in c.calls if x.kind == "indirect"),
            "has_hand_spec": specsmod.for_va(va) is not None,
        }

    # -- the one call that matters --------------------------------------
    def vectors(self, va: int, n: int = 200, *, pure_only: bool = False,
                source: str | None = None, seed: int | None = None,
                max_insns: int = 200_000) -> VectorSet:
        """N ground-truth vectors for `va`.

        Input construction is picked automatically, best first:
          1. a hand-written spec in specs/            (source="hand-spec")
          2. static SSA P-Code layout, fault fallback (source="autospec")
          3. blind typed-guess fuzzing                (source="blind")
        Pass `source=` to force one; "ssa" and "fault" force a single
        layout engine with no fallback.
        """
        seed = self.seed if seed is None else seed
        c = cfgmod.recover(self.pe, va, func_starts=self.starts)
        a = abimod.infer(self.pe, c)
        fb = frozenset(c.blocks)
        spec = specsmod.for_va(va)
        if source is None:
            source = SOURCE_HAND if spec else SOURCE_AUTO
        vs = VectorSet(va=va, cc=(spec.CC if spec and source == SOURCE_HAND
                                  else a.cc),
                       n_args=a.n_args, source=source, sha256=self.pe.sha256,
                       seed=seed, static_blocks=c.block_count)

        if source == SOURCE_HAND and spec:
            fr = runmod.FunctionRunner(self.o, va, seed=seed,
                                       starts=self.starts)
            for i in range(n):
                vs.vectors.append(self._norm(fr.one(i), vs.cc))
            vs.covered_blocks = len(fr.coverage)
        elif source in (SOURCE_AUTO, SOURCE_SSA, SOURCE_FAULT):
            key = (va, source)
            lay = self._auto.get(key)
            if lay is None:
                # SSA first: measured better on every axis and 4.4x cheaper to
                # build (15.0 ms vs 65.9 ms mean).  Fault-driven discovery is
                # the fallback for the ~0.03% with no usable P-Code.
                if source in (SOURCE_AUTO, SOURCE_SSA):
                    lay = autospec.ssa_layout(va, c, a, c.block_count)
                    if not lay.status.startswith("ssa") or \
                            lay.status.startswith("ssa-failed"):
                        lay = (autospec.discover(self.o, va, c, a)
                               if source == SOURCE_AUTO else lay)
                else:
                    lay = autospec.discover(self.o, va, c, a)
                self._auto[key] = lay
            vs.cc = lay.cc
            vs.note = f"autospec status={lay.status} objs={len(lay.objs)}"
            cov: set[int] = set()
            for i in range(n):
                rng = runmod.vec_rng(seed, i)
                try:
                    r, addrs = autospec.run_layout(self.o, lay, fb, rng,
                                                   fuzz=True,
                                                   max_insns=max_insns)
                except Exception as e:
                    self.o.reset_scratch()
                    vs.terms["harness-error"] = \
                        vs.terms.get("harness-error", 0) + 1
                    vs.note += f" harness:{type(e).__name__}"
                    continue
                cov |= set(r.blocks) & fb
                vs.vectors.append(self._from_result(i, r, lay, addrs, vs.cc))
                self.o.restore_dirty(r)
            vs.covered_blocks = len(cov)
        else:
            fr = runmod.FunctionRunner(self.o, va, seed=seed,
                                       starts=self.starts, no_spec=True)
            for i in range(n):
                vs.vectors.append(self._norm(fr.one(i), vs.cc))
            vs.covered_blocks = len(fr.coverage)

        for v in vs.vectors:
            vs.terms[v["term"]] = vs.terms.get(v["term"], 0) + 1
            vs.pure += bool(v["pure"])
            vs.pure_modulo_models += bool(v.get("pure_modulo_models"))
        if pure_only:
            vs.vectors = [v for v in vs.vectors if v["pure"]]
        return vs

    # -- normalisation ---------------------------------------------------
    @staticmethod
    def _norm(v: dict, cc: str) -> dict:
        return {
            "i": v["i"], "cc": cc,
            "in": {"ecx": v["regs_in"]["ecx"], "edx": v["regs_in"]["edx"],
                   "stack": v["stack_in"],
                   "regs": v.get("regs_entry", {}),
                   "eflags": v.get("eflags_entry", 0),
                   "mem": v.get("in_mem", [])},
            "out": {**v["out"], "eflags": v["eflags"]},
            "writes": v["writes"], "calls": v["calls"], "term": v["term"],
            "fault": v["fault"], "stubs": v["stubs"],
            "models": v.get("models", []), "blocks": v["blocks"],
            "pure": v["pure"],
            "pure_modulo_models": v.get("pure_modulo_models", v["pure"]),
        }

    def _from_result(self, i: int, r, lay, addrs, cc: str) -> dict:
        import vectors as vecmod
        writes, _counts = vecmod.snapshot_writes(self.o, r)
        mem = []
        for oi, ob in enumerate(lay.objs):
            if oi >= len(addrs):
                break
            lo = addrs[oi] - ob.pad_before
            try:
                mem.append({"a": lo,
                            "d": self.o.read(lo, ob.pad_before + ob.size).hex()})
            except Exception:
                pass

        def slotval(s):
            k, v = s
            return addrs[v] if k == "ptr" and 0 <= v < len(addrs) else v
        return {
            "i": i, "cc": cc,
            "in": {"ecx": slotval(lay.slots[0]) if lay.slots else 0, "edx": 0,
                   "stack": [slotval(s) for s in lay.slots[1:]],
                   "regs": dict(r.entry_regs), "eflags": r.entry_eflags,
                   "mem": mem},
            "out": {k: r.regs.get(k, 0) for k in
                    ("eax", "edx", "ecx", "ebx", "esi", "edi", "ebp",
                     "esp_delta")} | {"eflags": r.eflags},
            "writes": writes,
            "calls": [{"s": x.site, "t": x.target, "d": x.depth,
                       "a": x.args[:3], "x": x.stub} for x in r.calls[:64]],
            "term": r.term,
            "fault": (None if r.fault_va is None
                      else {"va": r.fault_va, "kind": r.fault_kind}),
            "stubs": r.stubs, "models": r.models,
            "blocks": sorted(set(r.blocks)),
            "pure": r.pure, "pure_modulo_models": r.pure_modulo_models,
        }


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--va", action="append", default=[])
    ap.add_argument("--batch")
    ap.add_argument("--n", type=int, default=200)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--pure-only", action="store_true")
    ap.add_argument("--source", choices=[SOURCE_HAND, SOURCE_AUTO,
                                         SOURCE_SSA, SOURCE_FAULT,
                                         SOURCE_BLIND])
    ap.add_argument("--describe", action="store_true")
    ap.add_argument("--out-dir")
    ap.add_argument("--summary-only", action="store_true")
    a = ap.parse_args()

    vas = [int(v, 0) for v in a.va]
    if a.batch:
        with open(a.batch, "r", encoding="utf-8") as fh:
            vas += [int(x, 0) for x in fh.read().split() if x.strip()]
    if not vas:
        ap.error("need --va or --batch")

    with OracleSession(seed=a.seed) as s:
        if a.describe:
            print(json.dumps([s.describe(v) for v in vas], indent=1))
            return
        out = []
        for va in vas:
            vs = s.vectors(va, a.n, pure_only=a.pure_only, source=a.source,
                           seed=a.seed)
            if a.out_dir:
                os.makedirs(a.out_dir, exist_ok=True)
                p = os.path.join(a.out_dir, f"{va:08x}.json")
                with open(p, "w", encoding="utf-8") as fh:
                    json.dump(vs.to_json(True), fh, separators=(",", ":"))
                out.append(vs.to_json(False) | {"path": p})
            else:
                out.append(vs.to_json(not a.summary_only))
        print(json.dumps(out if len(out) > 1 else out[0], indent=1))


if __name__ == "__main__":
    main()
