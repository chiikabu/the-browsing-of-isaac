"""Summarise an autospec run: does layout discovery make specs a compute
problem or is it still a writing problem?"""
from __future__ import annotations

import collections
import json
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")


def pct(a, b):
    return f"{100.0*a/b:5.1f}%" if b else "  n/a"


def report(path: str, label: str, baseline: dict | None = None) -> dict:
    recs = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    ok = [r for r in recs if "fuzz_n" in r]
    n = len(ok)
    print(f"\n=== {label} : {len(recs)} functions ({len(recs)-n} hard errors) ===")
    if not n:
        return {}

    st = collections.Counter(r["status"] for r in ok)
    print("discovery status")
    for k, v in st.most_common(12):
        print(f"  {k:<28} {v:>6}  {pct(v, n)}")

    nv = sum(r["fuzz_n"] for r in ok)
    pure = sum(r["fuzz_pure"] for r in ok)
    pmm = sum(r["fuzz_pure_modulo_models"] for r in ok)
    rets = sum(r["fuzz_ret"] for r in ok)
    fpure = sum(1 for r in ok if r["fuzz_pure"] > 0)
    print("\nvectors from the ZERO-HAND-EDIT layout")
    print(f"  vectors                    {nv:>8}")
    print(f"  pure                       {pure:>8}  {pct(pure, nv)}")
    print(f"  pure modulo models         {pmm:>8}  {pct(pmm, nv)}")
    print(f"  returned                   {rets:>8}  {pct(rets, nv)}")
    print(f"  functions with >=1 pure    {fpure:>8}  {pct(fpure, n)}")

    covs = sorted(r["fuzz_cov_pct"] for r in ok)
    multi = sorted(r["fuzz_cov_pct"] for r in ok if r.get("static_blocks", 0) > 1)
    print(f"\nblock coverage (all {len(covs)} functions)")
    print(f"  mean {statistics.mean(covs):.1f}%   median "
          f"{statistics.median(covs):.1f}%")
    bands = [(0, 1), (1, 25), (25, 50), (50, 75), (75, 99), (99, 101)]
    for lo, hi in bands:
        k = sum(1 for c in covs if lo <= c < hi)
        print(f"  {lo:>3}-{hi:<3}% : {k:>6}  {pct(k, len(covs))}")
    hi50 = sum(1 for c in covs if c >= 50)
    hi75 = sum(1 for c in covs if c >= 75)
    print(f"  >=50% coverage             {hi50:>6}  {pct(hi50, len(covs))}")
    print(f"  >=75% coverage             {hi75:>6}  {pct(hi75, len(covs))}")
    if multi:
        print(f"  (multi-block only, n={len(multi)}: mean "
              f"{statistics.mean(multi):.1f}%, median "
              f"{statistics.median(multi):.1f}%)")

    rounds = [r["rounds"] for r in ok]
    objs = [len(r["objs"]) for r in ok]
    secs = sum(r["secs"] for r in ok)
    print(f"\ndiscovery cost: {secs:.1f} cpu-s for {n} functions "
          f"({secs/n*1000:.0f} ms each), median {statistics.median(rounds):.0f} "
          f"rounds, median {statistics.median(objs):.0f} objects")

    res = {"label": label, "functions": n, "vectors": nv, "pure": pure,
           "pure_pct": round(100.0 * pure / nv, 2) if nv else 0,
           "funcs_with_pure_pct": round(100.0 * fpure / n, 2),
           "cov_mean": round(statistics.mean(covs), 2),
           "cov_median": round(statistics.median(covs), 2),
           "cov_ge50_pct": round(100.0 * hi50 / len(covs), 2),
           "cov_ge75_pct": round(100.0 * hi75 / len(covs), 2),
           "status": dict(st.most_common()),
           "discovery_ms_each": round(secs / n * 1000, 1)}
    # ---- PAIRED baseline: identical VAs, budget and seed ----------------
    paired = [r for r in ok if "blind_cov_pct" in r]
    if paired:
        bn = len(paired)
        bcov = [r["blind_cov_pct"] for r in paired]
        acov = [r["fuzz_cov_pct"] for r in paired]
        bpure = sum(r["blind_pure"] for r in paired)
        apure = sum(r["fuzz_pure"] for r in paired)
        bnv = sum(r["fuzz_n"] for r in paired)
        bfp = sum(1 for r in paired if r["blind_pure"] > 0)
        afp = sum(1 for r in paired if r["fuzz_pure"] > 0)
        win = sum(1 for r in paired if r["fuzz_cov_pct"] > r["blind_cov_pct"])
        lose = sum(1 for r in paired if r["fuzz_cov_pct"] < r["blind_cov_pct"])
        tie = bn - win - lose
        print(f"\nPAIRED vs BLIND  (same {bn} functions, same budget, same seed)")
        print(f"  mean block coverage     blind {statistics.mean(bcov):6.1f}%"
              f"   autospec {statistics.mean(acov):6.1f}%"
              f"   {statistics.mean(acov)-statistics.mean(bcov):+.1f} pts")
        print(f"  median block coverage   blind {statistics.median(bcov):6.1f}%"
              f"   autospec {statistics.median(acov):6.1f}%")
        print(f"  pure vectors            blind {100.0*bpure/bnv:6.1f}%"
              f"   autospec {100.0*apure/bnv:6.1f}%"
              f"   {100.0*(apure-bpure)/bnv:+.1f} pts")
        print(f"  functions with >=1 pure blind {100.0*bfp/bn:6.1f}%"
              f"   autospec {100.0*afp/bn:6.1f}%"
              f"   {100.0*(afp-bfp)/bn:+.1f} pts")
        print(f"  per-function: autospec better {win}, worse {lose}, tie {tie}")
        for thr in (50, 75, 99):
            b2 = sum(1 for c in bcov if c >= thr)
            a3 = sum(1 for c in acov if c >= thr)
            print(f"  >={thr}% coverage         blind {100.0*b2/bn:6.1f}%"
                  f"   autospec {100.0*a3/bn:6.1f}%")
        res["paired"] = {
            "n": bn, "blind_cov_mean": round(statistics.mean(bcov), 2),
            "autospec_cov_mean": round(statistics.mean(acov), 2),
            "blind_pure_pct": round(100.0 * bpure / bnv, 2),
            "autospec_pure_pct": round(100.0 * apure / bnv, 2),
            "blind_funcs_pure_pct": round(100.0 * bfp / bn, 2),
            "autospec_funcs_pure_pct": round(100.0 * afp / bn, 2),
            "better": win, "worse": lose, "tie": tie,
        }
    return res


def main():
    base = None
    sp = os.path.join(OUT, "survey.jsonl")
    if os.path.exists(sp):
        recs = [json.loads(l) for l in open(sp, encoding="utf-8") if l.strip()]
        ok = [r for r in recs if "n" in r and "error" not in r]
        nv = sum(r["n"] for r in ok)
        base = {
            "pure_pct": 100.0 * sum(r["pure"] for r in ok) / nv,
            "funcs_with_pure_pct": 100.0 * sum(1 for r in ok if r["pure"] > 0)
            / len(ok),
            "cov_mean": statistics.mean([r["cov_pct"] for r in ok]),
        }
    out = []
    for name, label in (("autospec_happy.jsonl", "autospec / happy-path tier"),
                        ("autospec_random.jsonl", "autospec / random sample")):
        p = os.path.join(OUT, name)
        if os.path.exists(p):
            out.append(report(p, label, base))
    with open(os.path.join(OUT, "autoreport.json"), "w", encoding="utf-8") as fh:
        json.dump({"baseline_blind": base, "runs": out}, fh, indent=1)


if __name__ == "__main__":
    main()
