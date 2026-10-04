"""Which imports actually have a live implementation behind them?

The failure this exists to catch: a verdict is a CLASSIFICATION, not an
implementation. `QueryPerformanceCounter` was marked PROVIDED -- "musl and
emscripten give us this" -- and nothing wired it, so the first run to reach it
trapped exactly like an unimplemented import. The classification was right and
the handoff was missing.

That is a class, not an incident. The generated weak fallback in shim_weak.c
calls isaac_trap() for anything whose verdict is REAL or PROVIDED, so EVERY
PROVIDED symbol without a strong definition somewhere in src/ is a latent trap
wearing a green label.

This sweeps all 622 and reports, per verdict:
  implemented   a strong `void imp_...(CpuState *restrict ...)` exists in src/
  weak-only     nothing but the generated fallback -> traps (REAL/PROVIDED) or
                logs-and-returns-0 (STUB/NEVER_CALLED)

Writes output/recomp/host/coverage.json.

Run:  python scripts/recomp/host/coverage.py
"""

import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe import OUT_DIR  # noqa: E402

HOST = Path(__file__).resolve().parent
DEF_RE = re.compile(r"^void\s+(imp_\w+)\s*\(", re.M)

def _find_nm():
    home = Path.home() / "emsdk" / "upstream" / "bin" / "llvm-nm.exe"
    for c in (str(home), "llvm-nm"):
        if Path(c).exists():
            return c
    from shutil import which
    return which("llvm-nm")




def main():
    table = json.loads((OUT_DIR / "shim-table.json").read_text(encoding="utf-8"))
    rows = table["imports"]

    # Strong definitions read from the OBJECT FILES, not from source.
    #
    # Parsing `^void imp_...(` out of the .c files under-reports: several shims
    # are defined through macros (FWD_D_D(imp_..._floor, floor)) and a regex
    # cannot see them, which made `floor` look unwired when it was not. The
    # symbol table is authoritative and measures what actually matters --
    # llvm-nm reports `T` for a strong definition and `W` for the generated
    # weak fallback, so this measures override rather than intent.
    implemented = {}
    objdir = OUT_DIR / "selftest"
    nm = _find_nm()
    if nm and objdir.exists():
        for obj in sorted(objdir.glob("*.o")):
            if obj.stem in ("shim_weak", "shim_table"):
                continue                      # generated: weak by construction
            r = subprocess.run([nm, str(obj)], capture_output=True, text=True)
            for line in (r.stdout or "").splitlines():
                parts = line.split()
                if (len(parts) >= 3 and parts[1] == "T"
                        and parts[2].startswith("imp_")):
                    implemented.setdefault(parts[2], obj.stem + ".c")
    if not implemented:
        print("NOTE: no object files found; falling back to a source scan, "
              "which under-reports macro-defined shims. Run build_selftest.py "
              "for the authoritative answer.")
        for f in sorted((HOST / "src").glob("*.c")):
            txt = f.read_text(encoding="utf-8")
            for m in DEF_RE.finditer(txt):
                implemented.setdefault(m.group(1), f.name)

    by_verdict = defaultdict(lambda: {"implemented": [], "weakOnly": []})
    for r in rows:
        v = r["verdict"]
        key = "implemented" if r["cident"] in implemented else "weakOnly"
        by_verdict[v][key].append(r)

    # The dangerous class: classified as forwardable/real, but nothing wires it,
    # so the weak fallback traps. Ordered by call sites -- most likely first.
    latent = [r for r in rows
              if r["verdict"] in ("REAL", "PROVIDED")
              and r["cident"] not in implemented]
    latent.sort(key=lambda r: -r["callSites"])

    # Break the residual out by WHY it is still open -- "Lua needs its own wasm
    # build" and "nobody wrote this yet" are different problems with different
    # owners, and lumping them makes the number look worse than it is.
    def bucket(r):
        if r["dll"] == "lua5.3.3r.dll":
            return "lua (needs the upstream Lua 5.3.3 wasm build linked)"
        if r["dll"] == "msvcp140.dll":
            return "msvcp140 std:: (needs libc++ forwarding)"
        if r["dll"] == "openal32.dll":
            return "OpenAL (needs emscripten OpenAL wired)"
        if r["dll"] in ("eossdk-win32-shipping.dll", "steam_api.dll"):
            return "EOS/Steam residue"
        if r["dll"].startswith("api-ms-win-crt-") or r["dll"] == "vcruntime140.dll":
            return "CRT not yet forwarded"
        return "other (%s)" % r["dll"]

    resid = defaultdict(lambda: [0, 0])
    for r in latent:
        b = resid[bucket(r)]
        b[0] += 1
        b[1] += r["callSites"]

    summary = {
        "residualByCause": {k: {"symbols": v[0], "callSites": v[1]}
                            for k, v in sorted(resid.items(),
                                               key=lambda kv: -kv[1][1])},
        "totalImports": len(rows),
        "strongDefinitions": len(implemented),
        "byVerdict": {
            v: {"implemented": len(d["implemented"]),
                "weakOnly": len(d["weakOnly"]),
                "implementedSites": sum(x["callSites"] for x in d["implemented"]),
                "weakOnlySites": sum(x["callSites"] for x in d["weakOnly"])}
            for v, d in by_verdict.items()},
        "latentTraps": {
            "count": len(latent),
            "callSites": sum(r["callSites"] for r in latent),
            "note": "verdict says REAL/PROVIDED but no strong definition exists, "
                    "so the generated weak fallback calls isaac_trap()",
            "symbols": [{"symbol": r["symbol"], "dll": r["dll"],
                         "verdict": r["verdict"], "callSites": r["callSites"],
                         "cident": r["cident"]}
                        for r in latent],
        },
        "implementedBy": dict(Counter(implemented.values())),
    }
    (OUT_DIR / "coverage.json").write_text(json.dumps(summary, indent=1),
                                           encoding="utf-8")

    print("strong definitions (llvm-nm `T` in built objects): %d" % len(implemented))
    for f, n in sorted(Counter(implemented.values()).items()):
        print("   %-32s %d" % (f, n))
    print()
    print("%-14s %12s %12s %14s %14s" % (
        "verdict", "implemented", "weak-only", "impl sites", "weak sites"))
    for v in ("REAL", "PROVIDED", "STUB", "NEVER_CALLED"):
        if v not in by_verdict:
            continue
        s = summary["byVerdict"][v]
        print("%-14s %12d %12d %14d %14d" % (
            v, s["implemented"], s["weakOnly"],
            s["implementedSites"], s["weakOnlySites"]))
    print()
    print("LATENT TRAPS -- classified REAL/PROVIDED, nothing wired: %d symbols, "
          "%d call sites" % (len(latent), sum(r["callSites"] for r in latent)))
    print("  (each traps at runtime despite a green verdict)")
    for r in latent[:30]:
        print("   %6d  %-38s %-30s %s" % (
            r["callSites"], r["symbol"][:38], r["dll"][:30], r["verdict"]))
    if len(latent) > 30:
        print("   ... and %d more" % (len(latent) - 30))
    print()
    print("RESIDUAL BY CAUSE -- these are different problems, not one number:")
    for k, v in sorted(resid.items(), key=lambda kv: -kv[1][1]):
        print("   %-52s %4d symbols  %6d sites" % (k, v[0], v[1]))
    print()
    print("wrote %s" % (OUT_DIR / "coverage.json"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
