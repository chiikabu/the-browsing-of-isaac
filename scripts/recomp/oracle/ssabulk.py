"""Run the SSA dereference walk over the whole binary and report cost + yield.

    python ssabulk.py --workers 12

Answers "what does it cost to do this once for every function" with a
measurement rather than an extrapolation from three samples.
"""
from __future__ import annotations

import argparse
import collections
import json
import multiprocessing as mp
import os
import statistics
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import closure             # noqa: E402
import peimage             # noqa: E402
import ssaderef            # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")


def _one(va: int) -> dict:
    t0 = time.perf_counter()
    lay = ssaderef.extract(va)
    ms = (time.perf_counter() - t0) * 1000
    if not lay.ok:
        return {"va": va, "ok": False, "error": lay.error, "ms": round(ms, 3)}
    ptr_fields = sum(len(n.ptr_fields) for n in lay.nodes.values())
    objs = sum(1 for n in lay.nodes.values() if n.accesses)
    offs = sum(len({a.off for a in n.accesses}) for n in lay.nodes.values())
    return {
        "va": va, "ok": True, "ms": round(ms, 3),
        "objs": objs, "ptr_fields": ptr_fields, "offsets": offs,
        "ecx_deref": lay.ecx_deref, "edx_deref": lay.edx_deref,
        "n_stack": len(lay.stack_offsets),
        "stack_deref": sum(1 for v in lay.deref_by_off.values() if v),
        "resolved": lay.resolved, "unresolved": lay.unresolved,
        "phi": lay.phi_merges,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=max(1, mp.cpu_count() - 2))
    ap.add_argument("--limit", type=int, default=0)
    a = ap.parse_args()

    vas = closure.ghidra_entries()
    if not vas:
        print("no Ghidra export")
        return
    if a.limit:
        vas = vas[:a.limit]
    print(f"SSA dereference walk over {len(vas)} functions, "
          f"{a.workers} workers")

    t0 = time.time()
    recs = []
    with mp.Pool(a.workers) as pool:
        for r in pool.imap_unordered(_one, vas, chunksize=32):
            recs.append(r)
    wall = time.time() - t0

    ok = [r for r in recs if r["ok"]]
    bad = collections.Counter(r.get("error") for r in recs if not r["ok"])
    cpu_ms = sum(r["ms"] for r in recs)
    print(f"\ncost: {wall:.1f}s wall on {a.workers} workers, "
          f"{cpu_ms/1000:.1f} cpu-s total")
    print(f"      {cpu_ms/len(recs):.2f} ms/function (cpu), "
          f"{wall/len(recs)*1000:.2f} ms/function (wall)")
    print(f"      whole binary in one pass: {wall:.0f}s")
    print(f"\nextracted ok           {len(ok)}/{len(recs)}  "
          f"{100.0*len(ok)/len(recs):.1f}%")
    for k, v in bad.most_common(6):
        print(f"   failed: {k!r}  {v}")

    if ok:
        objs = [r["objs"] for r in ok]
        pf = [r["ptr_fields"] for r in ok]
        res = sum(r["resolved"] for r in ok)
        unres = sum(r["unresolved"] for r in ok)
        print(f"\nmemory accesses resolved to a root  {res}/{res+unres}  "
              f"{100.0*res/max(res+unres,1):.1f}%")
        print(f"objects recovered   median {statistics.median(objs):.0f}, "
              f"mean {statistics.mean(objs):.1f}, max {max(objs)}")
        print(f"pointer fields      total {sum(pf)}, "
              f"median {statistics.median(pf):.0f}, max {max(pf)}")
        ecx = sum(1 for r in ok if r["ecx_deref"])
        print(f"ECX dereferenced (receiver evidence) {ecx}/{len(ok)}  "
              f"{100.0*ecx/len(ok):.1f}%")
        withptr = sum(1 for r in ok if r["ptr_fields"] > 0)
        print(f"functions with >=1 pointer field     {withptr}/{len(ok)}  "
              f"{100.0*withptr/len(ok):.1f}%")

    summary = {
        "functions": len(recs), "ok": len(ok), "wall_s": round(wall, 2),
        "cpu_s": round(cpu_ms / 1000, 2),
        "ms_per_function_cpu": round(cpu_ms / len(recs), 3),
        "workers": a.workers,
        "errors": dict(bad.most_common()),
    }
    with open(os.path.join(OUT, "ssabulk.json"), "w", encoding="utf-8") as fh:
        json.dump({"summary": summary}, fh, indent=1)
    with open(os.path.join(OUT, "ssaderef.jsonl"), "w", encoding="utf-8") as fh:
        for r in recs:
            fh.write(json.dumps(r, separators=(",", ":")) + "\n")
    print(f"\nwrote {OUT}\\ssabulk.json and ssaderef.jsonl")


if __name__ == "__main__":
    main()
