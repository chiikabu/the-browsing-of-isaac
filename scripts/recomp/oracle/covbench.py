"""Does coverage-guided mutation actually beat blind random generation?

Same budget, same seeds, same functions; the only difference is whether
inputs that discovered a new basic block are kept and mutated.  Anything
else would be marketing rather than measurement.
"""
from __future__ import annotations

import argparse
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


def run(o, va, c, a, n, seed, guided: bool):
    fb = frozenset(c.blocks)
    cov: set[int] = set()
    corpus: list[vecmod.InputProgram] = []
    pure = 0
    for i in range(n):
        rng = runmod.vec_rng(seed, i)
        if guided and corpus and rng.random() < 0.7:
            prog = vecmod.mutate(rng, corpus[rng.randrange(len(corpus))])
        else:
            prog = vecmod.generate(rng, n_stack=a.n_args,
                                   thiscall=a.cc in ("thiscall", "fastcall"))
        try:
            r, _, _ = vecmod.execute(o, va, prog, cc=a.cc, func_blocks=fb,
                                     max_insns=100_000)
        except Exception:
            o.reset_scratch()
            continue
        new = (set(r.blocks) & fb) - cov
        cov |= new
        if r.pure:
            pure += 1
        if guided and new:
            if len(corpus) < 32:
                corpus.append(prog)
            else:
                corpus[i % 32] = prog
        o.restore_dirty(r)
    return len(cov), pure


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=200)
    ap.add_argument("--n", type=int, default=200)
    ap.add_argument("--seed", type=int, default=5)
    a = ap.parse_args()

    pe = peimage.load()
    o = emumod.Oracle(pe)
    crtmodels.install(o)
    starts = cfgmod.build_function_starts(pe, os.path.join(OUT,
                                                           "func_starts.json"))
    rng = random.Random(a.seed)
    vas = sorted(rng.sample(sorted(starts), a.sample))

    tot_g = tot_u = tot_blocks = 0
    pure_g = pure_u = 0
    wins = losses = ties = 0
    t0 = time.time()
    considered = 0
    for va in vas:
        c = cfgmod.recover(pe, va, func_starts=set(starts))
        if c.block_count < 3 or c.block_count > 400:
            continue
        ab = abimod.infer(pe, c)
        considered += 1
        gu, pg = run(o, va, c, ab, a.n, a.seed, True)
        un, pu = run(o, va, c, ab, a.n, a.seed, False)
        tot_g += gu
        tot_u += un
        pure_g += pg
        pure_u += pu
        tot_blocks += c.block_count
        if gu > un:
            wins += 1
        elif gu < un:
            losses += 1
        else:
            ties += 1

    print(f"{considered} functions (3..400 static blocks), {a.n} vectors each, "
          f"{time.time()-t0:.0f}s")
    print(f"  static blocks total        {tot_blocks}")
    print(f"  blocks reached, guided     {tot_g}  "
          f"({100.0*tot_g/tot_blocks:.1f}% of static)")
    print(f"  blocks reached, unguided   {tot_u}  "
          f"({100.0*tot_u/tot_blocks:.1f}% of static)")
    print(f"  relative gain              "
          f"{100.0*(tot_g-tot_u)/max(tot_u,1):+.1f}%")
    print(f"  per-function guided better {wins}, worse {losses}, tie {ties}")
    print(f"  pure vectors  guided {pure_g}  unguided {pure_u}")
    with open(os.path.join(OUT, "covbench.json"), "w", encoding="utf-8") as fh:
        json.dump({"functions": considered, "n": a.n,
                   "static_blocks": tot_blocks, "guided": tot_g,
                   "unguided": tot_u, "wins": wins, "losses": losses,
                   "ties": ties, "pure_guided": pure_g,
                   "pure_unguided": pure_u}, fh, indent=1)


if __name__ == "__main__":
    main()
