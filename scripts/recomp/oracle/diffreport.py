"""Join replay results with per-function block coverage and rank failures.

Two rules this enforces:

  * A pass rate without coverage attached is not evidence.  A function whose
    vectors touched 20% of its blocks proves almost nothing; one at 99%
    proves a lot.  Everything below is stratified.
  * Failure MODES matter more than a percentage.  A ranked list of distinct
    divergences with example VAs is actionable; "72.9% pass" is not.
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
BANDS = [(0, 25), (25, 50), (50, 75), (75, 99), (99, 101)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--result", required=True)
    ap.add_argument("--meta", required=True)
    ap.add_argument("--out", default=os.path.join(OUT, "diffreport.json"))
    ap.add_argument("--top", type=int, default=14)
    a = ap.parse_args()

    with open(a.result, encoding="utf-8") as fh:
        res = json.load(fh)
    with open(a.meta, encoding="utf-8") as fh:
        meta = json.load(fh)["functions"]
    by_va = {int(v["va"]): v for v in meta.values()}

    fns = res["functions"]
    hangs = res.get("hangs", [])
    for h in hangs:
        fns.append({"va": h["va"], "va_hex": h["va_hex"], "pass": 0,
                    "fail": h.get("n", 0), "n": h.get("n", 0), "ok": False,
                    "dominant": "hang (no instruction budget)",
                    "codes": {"hang": h.get("n", 0)}, "first_fail_vector": -1})

    n = len(fns)
    npass = sum(1 for f in fns if f["ok"])
    vt = sum(f["n"] for f in fns)
    vp = sum(f["pass"] for f in fns)
    print(f"REPLAY: {n} functions, {vt} vectors   strict={res.get('strict')}")
    print(f"  functions all-vectors-pass : {npass}/{n}  {100.0*npass/n:.1f}%")
    print(f"  vectors pass               : {vp}/{vt}  {100.0*vp/vt:.1f}%")

    # ---- stratified by coverage ---------------------------------------
    print("\nACCURACY STRATIFIED BY BLOCK COVERAGE OF THE VECTORS USED")
    print(f"  {'coverage band':<16}{'funcs':>7}{'pass':>7}{'pass%':>8}"
          f"{'vectors':>9}{'vec pass%':>11}")
    strat = {}
    for lo, hi in BANDS:
        sel = [f for f in fns
               if lo <= by_va.get(f["va"], {}).get("coverage_pct", 0) < hi]
        if not sel:
            continue
        p = sum(1 for f in sel if f["ok"])
        svt = sum(f["n"] for f in sel)
        svp = sum(f["pass"] for f in sel)
        strat[f"{lo}-{hi}"] = {
            "functions": len(sel), "pass": p,
            "pass_pct": round(100.0 * p / len(sel), 1),
            "vectors": svt,
            "vec_pass_pct": round(100.0 * svp / svt, 1) if svt else 0.0}
        print(f"  {str(lo)+'-'+str(hi)+'%':<16}{len(sel):>7}{p:>7}"
              f"{100.0*p/len(sel):>7.1f}%{svt:>9}"
              f"{(100.0*svp/svt if svt else 0):>10.1f}%")
    covs = [by_va.get(f["va"], {}).get("coverage_pct", 0) for f in fns]
    if covs:
        print(f"  coverage of the sample: mean {statistics.mean(covs):.1f}%, "
              f"median {statistics.median(covs):.1f}%")

    # ---- failure modes -------------------------------------------------
    modes = collections.Counter()
    mode_fns = collections.defaultdict(list)
    for f in fns:
        if f["ok"]:
            continue
        d = f.get("dominant") or "?"
        modes[d] += 1
        mode_fns[d].append(f)
    print(f"\nFAILURE MODES  ({n-npass} functions diverge)")
    print(f"  {'mode':<34}{'funcs':>7}{'share':>8}   examples")
    ranked = []
    for mode, k in modes.most_common(a.top):
        ex = sorted(mode_fns[mode], key=lambda f: (f["n"], f["va"]))[:3]
        exs = " ".join(
            f"{e['va_hex']}({e['pass']}/{e['n']}"
            f"@{by_va.get(e['va'],{}).get('coverage_pct',0):.0f}%)"
            for e in ex)
        print(f"  {mode:<34}{k:>7}{100.0*k/(n-npass):>7.1f}%   {exs}")
        ranked.append({
            "mode": mode, "functions": k,
            "share_pct": round(100.0 * k / (n - npass), 1),
            "examples": [{
                "va": e["va_hex"], "pass": e["pass"], "n": e["n"],
                "coverage_pct": by_va.get(e["va"], {}).get("coverage_pct", 0),
                "first_fail_vector": e.get("first_fail_vector", -1),
                "codes": e.get("codes", {}),
            } for e in ex]})

    # functions that fail every single vector are the strongest signal
    total_fail = [f for f in fns if f["pass"] == 0 and f["n"]]
    partial = [f for f in fns if f["pass"] and f["fail"]]
    print(f"\n  fail EVERY vector : {len(total_fail)}  "
          f"(systematic emitter bug)")
    print(f"  fail SOME vectors : {len(partial)}  "
          f"(input-dependent: flags, edge values, rounding)")

    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump({
            "functions": n, "functions_pass": npass,
            "pass_pct": round(100.0 * npass / n, 2),
            "vectors": vt, "vectors_pass": vp,
            "vec_pass_pct": round(100.0 * vp / vt, 2) if vt else 0,
            "strict": res.get("strict"),
            "stratified": strat, "modes": ranked,
            "fail_all": [f["va_hex"] for f in total_fail][:400],
            "fail_some": [f["va_hex"] for f in partial][:400],
        }, fh, indent=1)
    print(f"\nwrote {a.out}")


if __name__ == "__main__":
    main()
