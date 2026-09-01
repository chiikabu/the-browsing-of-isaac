"""How much of the binary is emulatable WITHOUT stubs, independent of how
good the input generator is?

The fuzz-derived yield (17.3% of functions produced a pure vector) conflates
two very different limits: "the emulator cannot run this" and "my random
inputs never got past the first branch".  This analysis answers only the
first, by walking the static direct-call graph and asking what each
function's transitive closure touches.

Tiers, per function:
  A  closure contains no import and no indirect call   -> stub-free for sure
  B  closure contains no import, but has indirect calls -> stub-free iff every
     indirect target stays inside the image (vtable dispatch usually does)
  C  closure reaches only imports that have faithful CRT models
     -> pure-modulo-models
  D  closure reaches an unmodelled import -> some path will hit a stub

Direct calls are recovered by linear E8 rel32 scan plus the per-function
recursive descent, so the graph is complete for direct edges.  Indirect edges
are, by construction, not statically known; that is exactly why tier B is
separate rather than folded into A.
"""
from __future__ import annotations

import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cfg as cfgmod        # noqa: E402
import crtmodels           # noqa: E402
import peimage             # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")

# Imports that only appear on abort / throw / diagnostic paths.  Reaching one
# means the program is already failing, so a correct execution of the function
# under test does not touch it.  The oracle still RECORDS a hit, which is what
# makes treating these as exempt safe: the assumption is checked per vector.
ABORT_ONLY = frozenset({
    "api-ms-win-crt-runtime-l1-1-0.dll!_invalid_parameter_noinfo_noreturn",
    "api-ms-win-crt-runtime-l1-1-0.dll!_invalid_parameter_noinfo",
    "api-ms-win-crt-runtime-l1-1-0.dll!abort",
    "api-ms-win-crt-runtime-l1-1-0.dll!terminate",
    "api-ms-win-crt-runtime-l1-1-0.dll!_errno",
    "MSVCP140.dll!?_Xlength_error@std@@YAXPBD@Z",
    "MSVCP140.dll!?_Xout_of_range@std@@YAXPBD@Z",
    "MSVCP140.dll!?_Xbad_alloc@std@@YAXXZ",
    "MSVCP140.dll!?_Xinvalid_argument@std@@YAXPBD@Z",
    "VCRUNTIME140.dll!_CxxThrowException",
    "VCRUNTIME140.dll!__std_terminate",
    "VCRUNTIME140.dll!__CxxFrameHandler3",
    # __report_gsfailure / __security_init_cookie cluster
    "KERNEL32.dll!GetCurrentProcess",
    "KERNEL32.dll!TerminateProcess",
    "KERNEL32.dll!SetUnhandledExceptionFilter",
    "KERNEL32.dll!UnhandledExceptionFilter",
    "KERNEL32.dll!IsProcessorFeaturePresent",
    "KERNEL32.dll!IsDebuggerPresent",
    "KERNEL32.dll!RaiseException",
    "KERNEL32.dll!GetSystemTimeAsFileTime",
    "KERNEL32.dll!GetCurrentThreadId",
    "KERNEL32.dll!QueryPerformanceCounter",
    "KERNEL32.dll!OutputDebugStringA",
    "KERNEL32.dll!DebugBreak",
})


def ghidra_entries() -> list[int]:
    """Ghidra's trustworthy inventory: `recovered:false` == 14,025 functions.

    The other ~10,145 records in functions.jsonl are gap-recovery entries and
    9,959 of those are mid-function fragments, so including them would inflate
    every denominator.  Falls back to an empty list when the export is absent.
    """
    p = os.path.join(peimage.REPO_ROOT, "output", "recomp", "export",
                     "functions.jsonl")
    if not os.path.exists(p):
        return []
    out = []
    with open(p, "r", encoding="utf-8") as fh:
        for line in fh:
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get("recovered") is False and d.get("inText"):
                out.append(int(d["va"], 16))
    return sorted(set(out))


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--universe", choices=["callscan", "ghidra"],
                    default="ghidra",
                    help="function inventory to tier over")
    args = ap.parse_args()

    t0 = time.time()
    pe = peimage.load()
    starts = cfgmod.build_function_starts(pe, os.path.join(OUT,
                                                           "func_starts.json"))
    if args.universe == "ghidra":
        g = ghidra_entries()
        if g:
            vas = g
            print(f"universe: Ghidra recovered:false inText -> {len(vas)}")
        else:
            vas = sorted(starts)
            print("universe: Ghidra export missing, falling back to callscan")
    else:
        vas = sorted(starts)
        print(f"universe: direct-call scan -> {len(vas)}")
    # tail-call detection still uses the union of both inventories
    vaset = set(vas) | set(starts)
    iat_label = {e.iat_va: e.label for e in pe.imports}
    modelled = set(crtmodels.MODELS)

    print(f"building call graph over {len(vas)} function entries...")
    callees: dict[int, set[int]] = {}
    imports_of: dict[int, set[str]] = {}
    indirect: dict[int, int] = {}
    blocks_of: dict[int, int] = {}
    bad = 0
    for i, va in enumerate(vas):
        try:
            c = cfgmod.recover(pe, va, func_starts=vaset, max_insns=60000)
        except Exception:
            bad += 1
            callees[va] = set()
            imports_of[va] = set()
            indirect[va] = 1
            blocks_of[va] = 0
            continue
        d, im = set(), set()
        ind = 0
        for cs in c.calls + c.tail_jumps:
            if cs.kind == "direct" and cs.target is not None:
                d.add(cs.target)
            elif cs.kind == "iat" and cs.target is not None:
                im.add(iat_label.get(cs.target, f"iat@{cs.target:#x}"))
            else:
                ind += 1
        callees[va] = d
        imports_of[va] = im
        indirect[va] = ind
        blocks_of[va] = c.block_count
        if (i + 1) % 2000 == 0:
            print(f"  {i+1}/{len(vas)}  {time.time()-t0:.0f}s")

    print(f"graph built in {time.time()-t0:.0f}s ({bad} functions failed "
          f"recursive descent)")

    # transitive closure via memoised DFS (iterative, cycle-tolerant)
    clo_imports: dict[int, frozenset] = {}
    clo_indirect: dict[int, int] = {}
    clo_size: dict[int, int] = {}

    def compute(root: int):
        stack = [root]
        seen = set()
        imps: set[str] = set()
        ind = 0
        while stack:
            f = stack.pop()
            if f in seen:
                continue
            seen.add(f)
            if f in clo_imports:                 # reuse a finished sub-answer
                imps |= clo_imports[f]
                ind += clo_indirect[f]
                continue
            imps |= imports_of.get(f, set())
            ind += indirect.get(f, 0)
            for g in callees.get(f, ()):
                if g not in seen:
                    stack.append(g)
        clo_imports[root] = frozenset(imps)
        clo_indirect[root] = ind
        clo_size[root] = len(seen)

    order = sorted(vas, key=lambda v: len(callees.get(v, ())))
    for va in order:
        compute(va)

    def classify(exempt: frozenset):
        t = {"A": [], "B": [], "C": [], "D": []}
        for va in vas:
            imps = clo_imports[va] - exempt
            ind = clo_indirect[va]
            if not imps:
                t["A" if ind == 0 else "B"].append(va)
            elif imps <= modelled:
                t["C"].append(va)
            else:
                t["D"].append(va)
        return t

    tiers = classify(frozenset())

    n = len(vas)
    print()
    print(f"FULL BINARY: {n} function entries "
          f"({'Ghidra recovered:false' if args.universe == 'ghidra' else 'direct-call scan'})")
    labels = {
        "A": "stub-free, no indirect calls anywhere in closure",
        "B": "stub-free closure, but contains indirect calls",
        "C": "closure reaches only MODELLED CRT imports",
        "D": "closure reaches an unmodelled import",
    }
    for k in "ABCD":
        v = tiers[k]
        print(f"  tier {k}  {len(v):>6}  {100.0*len(v)/n:5.1f}%   {labels[k]}")
    ab = len(tiers["A"]) + len(tiers["B"])
    abc = ab + len(tiers["C"])
    print()
    print(f"  emulatable with NO stub at all (A+B)      {ab:>6}  "
          f"{100.0*ab/n:5.1f}%")
    print(f"  + only modelled CRT calls   (A+B+C)       {abc:>6}  "
          f"{100.0*abc/n:5.1f}%")

    # ---- the same thing, ignoring imports that only sit on abort paths ----
    # These are reached only when the program is already failing (throw,
    # range check, /GS cookie failure, terminate).  A correct execution never
    # touches them -- and if one IS touched, the oracle records the stub hit
    # and the vector is excluded, so this is a CHECKED assumption per vector,
    # not a blind one.
    tiers2 = classify(ABORT_ONLY)
    ab2 = len(tiers2["A"]) + len(tiers2["B"])
    abc2 = ab2 + len(tiers2["C"])
    print()
    print("  IGNORING ABORT/THROW-ONLY IMPORTS (verified per vector by the")
    print("  stub tag, so the assumption is checked and not assumed):")
    for k in "ABCD":
        print(f"    tier {k}  {len(tiers2[k]):>6}  "
              f"{100.0*len(tiers2[k])/n:5.1f}%")
    print(f"    no stub at all (A+B)                    {ab2:>6}  "
          f"{100.0*ab2/n:5.1f}%")
    print(f"    + only modelled CRT calls (A+B+C)       {abc2:>6}  "
          f"{100.0*abc2/n:5.1f}%")

    sizes = sorted(clo_size[v] for v in vas)
    print(f"\n  closure size: median {sizes[len(sizes)//2]} functions, "
          f"p90 {sizes[9*len(sizes)//10]}, max {sizes[-1]}")

    # which unmodelled imports are the biggest blockers, weighted by how many
    # functions they poison
    blockers: dict[str, int] = {}
    for va in tiers["D"]:
        for s in clo_imports[va] - modelled:
            blockers[s] = blockers.get(s, 0) + 1
    print("\n  TOP BLOCKING IMPORTS (functions whose closure reaches them)")
    for s, k in sorted(blockers.items(), key=lambda kv: -kv[1])[:25]:
        print(f"    {k:>6}  {100.0*k/n:5.1f}%  {s}")

    res = {
        "n_functions": n,
        "tiers": {k: len(v) for k, v in tiers.items()},
        "tier_pct": {k: round(100.0 * len(v) / n, 2) for k, v in tiers.items()},
        "no_stub_at_all_pct": round(100.0 * ab / n, 2),
        "with_models_pct": round(100.0 * abc / n, 2),
        "closure_median": sizes[len(sizes) // 2],
        "top_blockers": sorted(blockers.items(), key=lambda kv: -kv[1])[:60],
        "tier_A_sample": [f"{v:#010x}" for v in tiers["A"][:40]],
        "tiers_abort_exempt": {k: len(v) for k, v in tiers2.items()},
        "no_stub_abort_exempt_pct": round(100.0 * ab2 / n, 2),
        "with_models_abort_exempt_pct": round(100.0 * abc2 / n, 2),
        "secs": round(time.time() - t0, 1),
    }
    with open(os.path.join(OUT, "closure.json"), "w", encoding="utf-8") as fh:
        json.dump(res, fh, indent=1)
    with open(os.path.join(OUT, "tierA.txt"), "w", encoding="utf-8") as fh:
        for v in tiers["A"]:
            fh.write(f"{v:#010x}\n")
    with open(os.path.join(OUT, "tierAB.txt"), "w", encoding="utf-8") as fh:
        for v in sorted(tiers["A"] + tiers["B"]):
            fh.write(f"{v:#010x}\n")
    # The practical work queue: everything emulatable once abort/throw-only
    # imports are excused and the CRT models are allowed.  Any vector that
    # actually reaches an excused import is still tagged and filterable.
    with open(os.path.join(OUT, "tierAB_happy.txt"), "w",
              encoding="utf-8") as fh:
        for v in sorted(tiers2["A"] + tiers2["B"] + tiers2["C"]):
            fh.write(f"{v:#010x}\n")
    print(f"\nwrote {OUT}\\closure.json, tierA.txt, tierAB.txt "
          f"({time.time()-t0:.0f}s)")


if __name__ == "__main__":
    main()
