"""A/B: does the 87.7% fault rate come from the emulator or from handing
`this` pointers that are too small to be plausible objects?

Same functions, same seeds, same budget; only the pointer-target block sizes
differ.  Blocks are fully recorded in the vector either way, so enlarging
them does not smuggle in "silently zero" memory -- the bytes are part of the
declared input.  What DOES change is that a read of [ecx+0x180] lands inside
a recorded block instead of on a guard page.
"""
from __future__ import annotations

import json
import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import abi as abimod        # noqa: E402
import cfg as cfgmod        # noqa: E402
import crtmodels           # noqa: E402
import emu as emumod       # noqa: E402
import peimage             # noqa: E402
import runner as runmod    # noqa: E402
import vectors as vecmod   # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")

SMALL = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128, 256]
LARGE = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096]


def trial(o, vas, sizes, n, seed):
    vecmod.BUF_SIZES = sizes
    pure = pmm = rets = faults = total = 0
    cov_reached = cov_static = 0
    fpure = 0
    t0 = time.perf_counter()
    for va in vas:
        c = cfgmod.recover(o.pe, va)
        a = abimod.infer(o.pe, c)
        fb = frozenset(c.blocks)
        cov = set()
        corpus = []
        got_pure = False
        for i in range(n):
            rng = runmod.vec_rng(seed, i)
            if corpus and rng.random() < 0.7:
                prog = vecmod.mutate(rng, corpus[rng.randrange(len(corpus))])
            else:
                prog = vecmod.generate(
                    rng, n_stack=a.n_args,
                    thiscall=a.cc in ("thiscall", "fastcall"))
            try:
                r, _, _ = vecmod.execute(o, va, prog, cc=a.cc, func_blocks=fb,
                                         max_insns=100_000)
            except Exception:
                o.reset_scratch()
                continue
            total += 1
            if r.term == "ret":
                rets += 1
            elif r.term == "fault":
                faults += 1
            if r.pure:
                pure += 1
                got_pure = True
            if r.pure_modulo_models:
                pmm += 1
            new = (set(r.blocks) & fb) - cov
            cov |= new
            if new:
                if len(corpus) < 32:
                    corpus.append(prog)
                else:
                    corpus[i % 32] = prog
            o.restore_dirty(r)
        cov_reached += len(cov)
        cov_static += c.block_count
        fpure += 1 if got_pure else 0
    return {
        "vectors": total, "pure": pure, "pure_modulo_models": pmm,
        "ret": rets, "fault": faults, "funcs_with_pure": fpure,
        "cov_reached": cov_reached, "cov_static": cov_static,
        "secs": round(time.perf_counter() - t0, 1),
    }


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    nf = int(sys.argv[2]) if len(sys.argv) > 2 else 400
    pe = peimage.load()
    o = emumod.Oracle(pe)
    crtmodels.install(o)
    starts = cfgmod.build_function_starts(pe, os.path.join(OUT,
                                                           "func_starts.json"))
    rng = random.Random(17)
    vas = sorted(rng.sample(sorted(starts), nf))

    out = {}
    for label, sizes in (("small (4..256B)", SMALL), ("large (16..4096B)", LARGE)):
        r = trial(o, vas, sizes, n, seed=3)
        out[label] = r
        pv = 100.0 * r["pure"] / max(r["vectors"], 1)
        rv = 100.0 * r["ret"] / max(r["vectors"], 1)
        cv = 100.0 * r["cov_reached"] / max(r["cov_static"], 1)
        print(f"{label:<20} pure {r['pure']:>6} ({pv:5.1f}%)  "
              f"ret {rv:5.1f}%  funcs-with-pure {r['funcs_with_pure']:>4}/{nf}  "
              f"blockcov {cv:5.1f}%  {r['secs']}s")
    with open(os.path.join(OUT, "ab_bufsize.json"), "w", encoding="utf-8") as fh:
        json.dump({"n_vectors": n, "n_funcs": nf, "results": out}, fh, indent=1)


if __name__ == "__main__":
    main()
