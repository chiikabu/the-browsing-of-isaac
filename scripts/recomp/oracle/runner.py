"""Vector generation driver: deterministic, resumable.

    python runner.py --va 0x0040d040 --n 1000
    python runner.py --all-specs --n 2000

Output: output/recomp/oracle/vectors/<VA>.jsonl  (one vector per line)
        output/recomp/oracle/vectors/<VA>.meta.json (abi, cfg, coverage, state)

Input construction, best first: a hand spec in specs/, else blind generation.
For the autospec path and the stable consumer contract use api.py.

Coverage-guided mutation is present but OFF (`guided=True` to enable).  It
lost a head-to-head against blind random -- see the note on `one()`.

Resumability: the meta file records how many vectors are already on disk plus
the coverage set, and re-running appends from there.  Every vector's RNG is
`Random(seed*2654435761 ^ index)` -- position independent, so a crash at
vector 5,000 costs nothing and nothing depends on wall-clock.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import random  # noqa: E402

import abi as abimod            # noqa: E402
import cfg as cfgmod            # noqa: E402
import emu as emumod            # noqa: E402
import peimage                  # noqa: E402
import specs as specsmod        # noqa: E402
import vectors as vecmod        # noqa: E402

OUT_ROOT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
VEC_DIR = os.path.join(OUT_ROOT, "vectors")
STARTS_CACHE = os.path.join(OUT_ROOT, "func_starts.json")

GOLDEN = 2654435761


def vec_rng(seed: int, index: int) -> random.Random:
    return random.Random((seed * GOLDEN) ^ (index * 0x9E3779B1) ^ (index << 17))


class FunctionRunner:
    def __init__(self, o: emumod.Oracle, va: int, *, seed: int = 1,
                 cc: str | None = None, n_args: int | None = None,
                 starts: set[int] | None = None, timeout_us: int = 0,
                 max_insns: int = 500_000, no_spec: bool = False,
                 guided: bool = False):
        self.o = o
        self.va = va
        self.seed = seed
        self.timeout_us = timeout_us
        self.max_insns = max_insns
        self.cfg = cfgmod.recover(o.pe, va, func_starts=starts or set())
        self.abi = abimod.infer(o.pe, self.cfg)
        self.spec = None if no_spec else specsmod.for_va(va)
        self.guided = guided
        self.cc = cc or (self.spec.CC if self.spec else self.abi.cc)
        self.n_args = self.abi.n_args if n_args is None else n_args
        self.func_blocks = frozenset(self.cfg.blocks)
        self.coverage: set[int] = set()
        self.corpus: list[vecmod.InputProgram] = []
        self.counts = {"ret": 0, "fault": 0, "timeout": 0, "insn-limit": 0,
                       "error": 0, "invalid-insn": 0, "pure": 0, "stubbed": 0}
        self.stub_hist: dict[str, int] = {}

    # -- one vector ------------------------------------------------------
    def one(self, index: int) -> dict:
        rng = vec_rng(self.seed, index)
        if self.spec is not None:
            return self._one_spec(index, rng)
        # Coverage-guided mutation is OFF by default and should stay off.
        # Measured head to head (covbench.py, 122 functions x 150 vectors,
        # same seeds): guided reached 367 blocks, blind random 383 -- guided
        # was better on 12 functions and worse on 22.  When almost every
        # input faults in the same first block the corpus fills with
        # near-identical seeds and mutation re-walks one shallow path.
        # Typed specs and autospec layout discovery are the real lever.
        if self.guided and self.corpus and rng.random() < 0.7:
            prog = vecmod.mutate(rng, self.corpus[rng.randrange(len(self.corpus))])
        else:
            prog = vecmod.generate(rng, n_stack=self.n_args,
                                   thiscall=self.cc in ("thiscall", "fastcall"))
        r, vals, addrs = vecmod.execute(
            self.o, self.va, prog, cc=self.cc, func_blocks=self.func_blocks,
            timeout_us=self.timeout_us, max_insns=self.max_insns)
        blocks = set(r.blocks) & self.func_blocks
        new = blocks - self.coverage
        self.coverage |= new
        if self.guided and new:
            if len(self.corpus) < 64:
                self.corpus.append(prog)
            elif self.corpus:
                self.corpus[index % len(self.corpus)] = prog
        writes, wcounts = vecmod.snapshot_writes(self.o, r)
        self.counts[r.term] = self.counts.get(r.term, 0) + 1
        if r.pure:
            self.counts["pure"] += 1
        if r.stubs:
            self.counts["stubbed"] += 1
        for s in r.stubs:
            self.stub_hist[s] = self.stub_hist.get(s, 0) + 1
        self.o.restore_dirty(r)
        return vecmod.vector_json(index, prog, vals, addrs, r, writes,
                                  wcounts, len(new))

    def _one_spec(self, index: int, rng) -> dict:
        """Typed-spec vector: the spec builds the memory graph itself."""
        o = self.o
        o.reset_scratch()
        if not getattr(self.spec, "CARRY_STATE", False):
            o.reset_arena()
        built = self.spec.build(o, rng)
        r = o.call(self.va, cc=self.cc, args=built.get("args", []),
                   ecx=built.get("ecx", 0), edx=built.get("edx", 0),
                   func_blocks=self.func_blocks, timeout_us=self.timeout_us,
                   max_insns=self.max_insns,
                   until=getattr(self.spec, "UNTIL", None))
        blocks = set(r.blocks) & self.func_blocks
        new = blocks - self.coverage
        self.coverage |= new
        writes, wcounts = vecmod.snapshot_writes(o, r)
        self.counts[r.term] = self.counts.get(r.term, 0) + 1
        if r.pure:
            self.counts["pure"] += 1
        if r.stubs:
            self.counts["stubbed"] += 1
        for s in r.stubs:
            self.stub_hist[s] = self.stub_hist.get(s, 0) + 1
        if not getattr(self.spec, "CARRY_STATE", False):
            o.restore_dirty(r)
        v = vecmod.vector_json(index, vecmod.InputProgram(),
                               {"ecx": built.get("ecx", 0),
                                "edx": built.get("edx", 0),
                                "stack": built.get("args", [])},
                               [], r, writes, wcounts, len(new))
        v["spec"] = self.spec.__name__.split(".")[-1]
        v["note"] = built.get("note", {})
        v["models"] = r.models
        v["pure_modulo_models"] = r.pure_modulo_models
        return v

    def meta(self, n_done: int, elapsed: float) -> dict:
        return {
            "va": self.va,
            "spec": (self.spec.__name__.split(".")[-1]
                     if self.spec else None),
            "sha256": self.o.pe.sha256,
            "seed": self.seed,
            "cc": self.cc,
            "n_args": self.n_args,
            "abi": {"cc": self.abi.cc, "n_args": self.abi.n_args,
                    "ret_bytes": self.abi.ret_bytes,
                    "confidence": self.abi.confidence,
                    "reason": self.abi.reason},
            "cfg": {"blocks": self.cfg.block_count,
                    "insns": len(self.cfg.insns),
                    "lo": self.cfg.lo, "hi": self.cfg.hi,
                    "calls": len(self.cfg.calls),
                    "direct_calls": sum(1 for c in self.cfg.calls
                                        if c.kind == "direct"),
                    "iat_calls": sum(1 for c in self.cfg.calls
                                     if c.kind == "iat"),
                    "indirect_calls": sum(1 for c in self.cfg.calls
                                          if c.kind == "indirect"),
                    "unresolved_jumps": len(self.cfg.unresolved_jumps),
                    "truncated": self.cfg.truncated},
            "n_vectors": n_done,
            "coverage": {"reached": len(self.coverage),
                         "static": self.cfg.block_count,
                         "pct": (100.0 * len(self.coverage) / self.cfg.block_count
                                 if self.cfg.block_count else 0.0)},
            "terms": self.counts,
            "stub_hist": dict(sorted(self.stub_hist.items(),
                                     key=lambda kv: -kv[1])[:32]),
            "corpus": [p.to_json() for p in self.corpus],
            "covered_blocks": sorted(self.coverage),
            "elapsed_s": round(elapsed, 4),
            "vectors_per_s": round(n_done / elapsed, 2) if elapsed > 0 else 0,
        }


def run_one(o: emumod.Oracle, va: int, n: int, *, seed: int = 1,
            starts: set[int] | None = None, resume: bool = True,
            cc: str | None = None, n_args: int | None = None,
            quiet: bool = False, out_dir: str = VEC_DIR,
            no_spec: bool = False) -> dict:
    os.makedirs(out_dir, exist_ok=True)
    tag = f"{va:08x}"
    jsonl = os.path.join(out_dir, f"{tag}.jsonl")
    metap = os.path.join(out_dir, f"{tag}.meta.json")

    fr = FunctionRunner(o, va, seed=seed, cc=cc, n_args=n_args,
                        starts=starts, no_spec=no_spec)
    start_idx = 0
    prev_elapsed = 0.0
    if resume and os.path.exists(metap) and os.path.exists(jsonl):
        try:
            with open(metap, "r", encoding="utf-8") as fh:
                m = json.load(fh)
            if m.get("sha256") == o.pe.sha256 and m.get("seed") == seed:
                start_idx = m.get("n_vectors", 0)
                prev_elapsed = m.get("elapsed_s", 0.0)
                fr.coverage = set(m.get("covered_blocks", []))
                fr.corpus = [vecmod.InputProgram.from_json(p)
                             for p in m.get("corpus", [])]
                fr.counts.update(m.get("terms", {}))
                fr.stub_hist.update(m.get("stub_hist", {}))
        except Exception:
            start_idx = 0
    if start_idx >= n:
        with open(metap, "r", encoding="utf-8") as fh:
            return json.load(fh)

    t0 = time.time()
    mode = "a" if start_idx else "w"
    with open(jsonl, mode, encoding="utf-8") as fh:
        for i in range(start_idx, n):
            v = fr.one(i)
            fh.write(json.dumps(v, separators=(",", ":")) + "\n")
            if not quiet and (i + 1) % 500 == 0:
                fh.flush()
                el = time.time() - t0
                print(f"  {tag} {i+1}/{n}  {(i+1-start_idx)/el:.0f} vec/s  "
                      f"cov {len(fr.coverage)}/{fr.cfg.block_count}")
    elapsed = prev_elapsed + (time.time() - t0)
    m = fr.meta(n, elapsed)
    with open(metap, "w", encoding="utf-8") as fh:
        json.dump(m, fh, indent=1)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--va", action="append", default=[])
    ap.add_argument("--batch", help="file with one VA per line")
    ap.add_argument("--n", type=int, default=200)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--cc")
    ap.add_argument("--n-args", type=int)
    ap.add_argument("--no-resume", action="store_true")
    ap.add_argument("--out", default=VEC_DIR)
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--no-spec", action="store_true")
    ap.add_argument("--all-specs", action="store_true")
    a = ap.parse_args()

    vas = [int(v, 0) for v in a.va]
    if a.batch:
        with open(a.batch, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.split("#")[0].strip()
                if line:
                    vas.append(int(line, 0))
    if a.all_specs:
        vas.extend(sorted(specsmod.available()))
    if not vas:
        ap.error("need --va, --batch or --all-specs")

    pe = peimage.load()
    starts = set(cfgmod.build_function_starts(pe, STARTS_CACHE))
    o = emumod.Oracle(pe)
    t0 = time.time()
    total = 0
    for va in vas:
        m = run_one(o, va, a.n, seed=a.seed, starts=starts,
                    resume=not a.no_resume, cc=a.cc, n_args=a.n_args,
                    quiet=a.quiet, out_dir=a.out, no_spec=a.no_spec)
        total += m["n_vectors"]
        print(f"{va:#010x} cc={m['cc']}/{m['n_args']}({m['abi']['confidence']}) "
              f"cov {m['coverage']['reached']}/{m['coverage']['static']} "
              f"({m['coverage']['pct']:.0f}%) "
              f"spec={m.get('spec')} "
              f"pure={m['terms'].get('pure',0)}/{m['n_vectors']} "
              f"terms={ {k: v for k, v in m['terms'].items() if v} } "
              f"{m['vectors_per_s']} vec/s")
    el = time.time() - t0
    print(f"\n{len(vas)} functions, {total} vectors, {el:.2f}s wall, "
          f"{total/el:.1f} vec/s aggregate (1 core)")


if __name__ == "__main__":
    main()
