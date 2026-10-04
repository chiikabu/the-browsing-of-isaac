"""Summarise survey.jsonl: throughput, purity, coverage, stub pressure."""
from __future__ import annotations

import collections
import json
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
SURVEY = os.path.join(OUT, "survey.jsonl")


def pct(a, b):
    return f"{100.0*a/b:.1f}%" if b else "n/a"


def main():
    recs = []
    with open(SURVEY, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                recs.append(json.loads(line))
    ok = [r for r in recs if "error" not in r and "n" in r]
    print(f"functions surveyed      {len(recs)}  (harness errors: "
          f"{len(recs)-len(ok)})")
    if not ok:
        return

    n_vec = sum(r["n"] for r in ok)
    secs = sum(r["secs"] for r in ok)
    print(f"vectors executed        {n_vec}")
    print(f"cpu-seconds in workers  {secs:.1f}")
    print(f"throughput              {n_vec/secs:.0f} vectors/s/core (measured)")

    # -- purity ---------------------------------------------------------
    pure_v = sum(r["pure"] for r in ok)
    pmm_v = sum(r["pure_modulo_models"] for r in ok)
    print()
    print("PER-VECTOR")
    print(f"  pure (x86 only, no stub/model/fault) {pure_v:>8}  {pct(pure_v, n_vec)}")
    print(f"  pure modulo modelled CRT calls       {pmm_v:>8}  {pct(pmm_v, n_vec)}")
    terms = collections.Counter()
    for r in ok:
        terms.update(r["terms"])
    for k, v in terms.most_common():
        print(f"  term {k:<20} {v:>8}  {pct(v, n_vec)}")

    # -- per function ---------------------------------------------------
    f_any_pure = sum(1 for r in ok if r["pure"] > 0)
    f_any_pmm = sum(1 for r in ok if r["pure_modulo_models"] > 0)
    f_all_pure = sum(1 for r in ok if r["pure"] == r["n"])
    f_no_stub_static = sum(1 for r in ok
                           if r["iat_calls"] == 0 and r["indirect_calls"] == 0)
    f_leaf = sum(1 for r in ok if r["direct_calls"] == 0 and
                 r["iat_calls"] == 0 and r["indirect_calls"] == 0)
    f_stub_hit = sum(1 for r in ok if r["n_stub_kinds"] > 0)
    n = len(ok)
    print()
    print("PER FUNCTION")
    print(f"  reached >=1 PURE vector              {f_any_pure:>8}  {pct(f_any_pure, n)}")
    print(f"  reached >=1 pure-modulo-model vector {f_any_pmm:>8}  {pct(f_any_pmm, n)}")
    print(f"  ALL vectors pure                     {f_all_pure:>8}  {pct(f_all_pure, n)}")
    print(f"  hit >=1 stub in some vector          {f_stub_hit:>8}  {pct(f_stub_hit, n)}")
    print(f"  statically leaf (no calls at all)    {f_leaf:>8}  {pct(f_leaf, n)}")
    print(f"  no IAT and no indirect call (static) {f_no_stub_static:>8}  "
          f"{pct(f_no_stub_static, n)}")

    # -- coverage -------------------------------------------------------
    covs = [r["cov_pct"] for r in ok if r["blocks"] > 1]
    if covs:
        covs.sort()
        print()
        print(f"BLOCK COVERAGE over {len(covs)} multi-block functions")
        print(f"  mean {statistics.mean(covs):.1f}%   median "
              f"{statistics.median(covs):.1f}%   "
              f"p10 {covs[len(covs)//10]:.1f}%   p90 {covs[9*len(covs)//10]:.1f}%")
        for lo, hi in ((0, 1), (1, 25), (25, 50), (50, 75), (75, 99), (99, 101)):
            k = sum(1 for c in covs if lo <= c < hi)
            print(f"  {lo:>3}-{hi:<3}% coverage : {k:>6}  {pct(k, len(covs))}")

    # -- what blocks purity ---------------------------------------------
    stubs = collections.Counter()
    for r in ok:
        stubs.update(r["stubs"])
    print()
    print("TOP STUBS HIT (these are what stop a vector being ground truth)")
    for k, v in stubs.most_common(20):
        print(f"  {v:>8}  {k}")
    models = collections.Counter()
    for r in ok:
        models.update(r["models"])
    print()
    print("TOP MODELLED CRT CALLS (vector still usable, tagged)")
    for k, v in models.most_common(10):
        print(f"  {v:>8}  {k}")

    # -- size distribution ----------------------------------------------
    blocks = sorted(r["blocks"] for r in ok)
    print()
    print(f"FUNCTION SIZE  median {blocks[len(blocks)//2]} blocks, "
          f"p90 {blocks[9*len(blocks)//10]}, max {blocks[-1]}")
    ccs = collections.Counter(r["cc"] for r in ok)
    print(f"CC INFERENCE   {dict(ccs)}")
    confs = collections.Counter(r["conf"] for r in ok)
    print(f"ABI CONFIDENCE {dict(confs)}")

    # -- projection -------------------------------------------------------
    rate = n_vec / secs
    print()
    print("PROJECTION (measured rate, no estimate)")
    for cores in (1, 14, 16):
        s = 10000 * 1000 / (rate * cores)
        print(f"  1000 vectors x 10,000 functions on {cores:>2} cores: "
              f"{s/3600:.2f} h  ({s:.0f} s)")


if __name__ == "__main__":
    main()
