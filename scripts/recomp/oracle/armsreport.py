"""Paired comparison of layout sources on identical functions/budget/seeds.

Arms:
  blind   no layout at all -- typed-guess fuzzing
  fault   fault-driven discovery (autospec)
  ssa     static SSA P-Code dereference walk, zero emulation
  hybrid  SSA layout, then fault-driven refinement on top

The question that matters: SSA fixes pointer/scalar accuracy (84.2% vs 71.1%
against the ZHL declarations), but does that convert into BLOCK COVERAGE?
Fault-driven layout did not -- it moved ground-truth yield a lot and coverage
almost none.  If SSA repeats that pattern, layout is solved and value
selection is the whole remaining problem.
"""
from __future__ import annotations

import json
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
ARMS = ["blind", "fault", "ssaraw", "ssa", "constonly", "const",
        "hybrid"]


def main():
    path = os.path.join(OUT, sys.argv[1] if len(sys.argv) > 1
                        else "autospec_arms.jsonl")
    recs = [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]
    ok = [r for r in recs if "arms" in r and "blind_cov_pct" in r]
    n = len(ok)
    print(f"paired arms comparison over {n} functions "
          f"({len(recs)-n} excluded: harness error)")
    if not n:
        return
    nv = ok[0]["fuzz_n"]
    print(f"{nv} vectors per function per arm, identical seeds\n")

    def series(arm, field):
        if arm == "blind":
            return [r["blind_cov_pct"] if field == "cov_pct" else
                    (r["blind_pure"] if field == "pure" else r["blind_ret"])
                    for r in ok]
        return [r["arms"][arm][field] for r in ok if arm in r["arms"]]

    have = [a for a in ARMS
            if a == "blind" or all(a in r["arms"] for r in ok)]
    total_v = n * nv

    hdr = (f"{'arm':<8} {'mean cov':>9} {'median':>8} {'>=50%':>7} "
           f"{'>=99%':>7} {'pure':>8} {'pure%':>7} {'ret%':>7} "
           f"{'funcs w/pure':>13}")
    print(hdr)
    print("-" * len(hdr))
    stats = {}
    for arm in have:
        cov = series(arm, "cov_pct")
        pure = series(arm, "pure")
        rets = series(arm, "ret")
        fp = sum(1 for p in pure if p > 0)
        stats[arm] = {
            "cov_mean": statistics.mean(cov),
            "cov_median": statistics.median(cov),
            "ge50": 100.0 * sum(1 for c in cov if c >= 50) / n,
            "ge99": 100.0 * sum(1 for c in cov if c >= 99) / n,
            "pure": sum(pure),
            "pure_pct": 100.0 * sum(pure) / total_v,
            "ret_pct": 100.0 * sum(rets) / total_v,
            "funcs_pure_pct": 100.0 * fp / n,
        }
        s = stats[arm]
        print(f"{arm:<8} {s['cov_mean']:>8.1f}% {s['cov_median']:>7.1f}% "
              f"{s['ge50']:>6.1f}% {s['ge99']:>6.1f}% {s['pure']:>8} "
              f"{s['pure_pct']:>6.1f}% {s['ret_pct']:>6.1f}% "
              f"{s['funcs_pure_pct']:>12.1f}%")

    print("\ndeltas vs blind (percentage points)")
    b = stats["blind"]
    for arm in have:
        if arm == "blind":
            continue
        s = stats[arm]
        print(f"  {arm:<8} coverage {s['cov_mean']-b['cov_mean']:+6.1f}   "
              f"pure vectors {s['pure_pct']-b['pure_pct']:+6.1f}   "
              f"funcs with pure {s['funcs_pure_pct']-b['funcs_pure_pct']:+6.1f}")

    # head-to-head on coverage
    print("\nper-function coverage, head to head")
    for arm in have:
        if arm == "blind":
            continue
        bc = series("blind", "cov_pct")
        ac = series(arm, "cov_pct")
        win = sum(1 for x, y in zip(ac, bc) if x > y)
        lose = sum(1 for x, y in zip(ac, bc) if x < y)
        print(f"  {arm:<8} vs blind: better {win}, worse {lose}, "
              f"tie {n-win-lose}")
    for a1, a2 in (("ssa", "fault"), ("ssa", "ssaraw"),
                   ("const", "ssa"), ("const", "constonly")):
        if a1 in have and a2 in have:
            sc, fc = series(a1, "cov_pct"), series(a2, "cov_pct")
            win = sum(1 for x, y in zip(sc, fc) if x > y)
            lose = sum(1 for x, y in zip(sc, fc) if x < y)
            print(f"  {a1} vs {a2}: better {win}, worse {lose}, "
                  f"tie {n-win-lose}")

    # layout cost
    print("\nlayout construction cost (ms/function, mean)")
    for arm in have:
        if arm == "blind":
            continue
        ms = [r["arms"][arm]["layout_ms"] for r in ok if arm in r["arms"]]
        print(f"  {arm:<8} {statistics.mean(ms):8.1f} ms   "
              f"median {statistics.median(ms):6.1f} ms")

    # ceiling: how many functions reach high coverage with zero hand editing
    best = have[-1] if have else "blind"
    cov = series(best, "cov_pct")
    print(f"\nCEILING with zero hand editing (arm '{best}')")
    for thr in (25, 50, 75, 90, 99):
        k = sum(1 for c in cov if c >= thr)
        print(f"  >={thr:>2}% block coverage : {k:>5}/{n}  {100.0*k/n:5.1f}%")

    with open(os.path.join(OUT, "armsreport.json"), "w",
              encoding="utf-8") as fh:
        json.dump({"n": n, "vectors_per_arm": nv, "stats": stats}, fh, indent=1)
    print(f"\nwrote {os.path.join(OUT, 'armsreport.json')}")


if __name__ == "__main__":
    main()
