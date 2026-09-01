"""Final arithmetic.

Splits the 622 imported symbols three ways:
  * DISAPPEARS - every call site sits inside a vendored library that gets
    replaced by a clean upstream wasm build, so the symbol is never called by
    lifted code at all
  * PROVIDED   - reached by game code, but emscripten/musl/libc++/WebGL already
    implements the semantics
  * SHIM       - reached by game code and needs a real hand-written host shim

and splits .text three ways: liftable game logic / replaceable third-party /
library code emscripten already provides.

The DISAPPEARS and byte splits are measured. The PROVIDED-vs-SHIM verdict is
engineering judgment applied to measured call-site data; it is labelled as such.
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"

# Components that get swapped for an upstream build rather than lifted.
REPLACEABLE = {"libepoxy", "glfw", "libpng", "libjpeg", "miniz", "ogg",
               "stb_vorbis", "theoraplayer", "clownresampler"}

# Verdict per subsystem. "provided" = emscripten/musl/libc++/WebGL/SDL already
# implements it; "shim" = must be hand-written; "stub" = can be a no-op or a
# constant-returning stub without changing observable gameplay.
VERDICT = {
    "lua-vm":             ("provided", "link upstream Lua 5.3.3 built to wasm; zero hand-written lines"),
    "cxx-runtime":        ("shim", "MSVC-specific EH/RTTI ABI: __CxxFrameHandler3, __RTDynamicCast, _CxxThrowException"),
    "crt-runtime":        ("shim", "mostly musl-provided, but MSVC error/assert entry points need mapping"),
    "crt-math":           ("provided", "musl libm; _libm_sse2_* map to standard names"),
    "crt-heap":           ("provided", "musl malloc"),
    "crt-string/convert": ("provided", "musl string/stdlib"),
    "crt-stdio/fs":       ("provided", "musl stdio over emscripten FS"),
    "crt-misc":           ("provided", "musl"),
    "win-window/input":   ("provided", "emscripten GLFW3 port + canvas; game-direct calls degrade to no-ops"),
    "gdi":                ("stub", "pixel-format/DC plumbing has no browser analogue"),
    "gl":                 ("provided", "single wglGetProcAddress call, inside GLFW"),
    "win-timing":         ("stub", "timeBeginPeriod/timeEndPeriod are no-ops"),
    "k32-threads/sync":   ("shim", "critical sections become no-ops single-threaded; 1 CreateThread site"),
    "k32-file-io":        ("provided", "emscripten FS; needs a persistence choice for saves"),
    "k32-memory/heap":    ("shim", "VirtualAlloc/VirtualQuery over a wasm arena"),
    "k32-module/loader":  ("shim", "LoadLibrary/GetProcAddress table for dynamically probed DLLs"),
    "k32-time":           ("provided", "performance.now / Date"),
    "k32-error/debug":    ("stub", "GetLastError bookkeeping plus no-op debug hooks"),
    "k32-locale/encoding": ("provided", "MultiByteToWideChar/WideCharToMultiByte, GLFW-only"),
    "k32-env/process":    ("stub", "constant returns"),
    "k32-other":          ("shim", "residual kernel32 surface"),
    "win-shell/com":      ("stub", "shell/COM/dbghelp: no browser analogue, stub out"),
    "audio-openal":       ("provided", "emscripten OpenAL over WebAudio"),
    "steam":              ("stub", "offline stub; achievements/cloud become local"),
    "epic-eos":           ("stub", "offline stub; online identity not required to play"),
    "net-curl":           ("stub", "fetch-backed or stubbed; not required to play"),
}


def main():
    imports = json.loads((OUT / "imports.json").read_text(encoding="utf-8"))
    subs = json.loads((OUT / "subsystems.json").read_text(encoding="utf-8"))
    attribution = json.loads((OUT / "attribution.json").read_text(encoding="utf-8"))
    exports = json.loads((OUT / "exports.json").read_text(encoding="utf-8"))
    dataimg = json.loads((OUT / "dataimage.json").read_text(encoding="utf-8"))
    funcs = json.loads((OUT / "functions.json").read_text(encoding="utf-8"))

    psc = subs["perSymbolComponent"]
    # subsystems.json caps topSymbols per subsystem, so classify every symbol
    # straight from the import list using the same rule the grouping used.
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from subsystems import subsystem_for  # noqa: E402
    full_sub = {r["symbol"] + "@" + r["dll"]: subsystem_for(r["dll"], r["symbol"])
                for r in imports["symbols"]}

    # classify every symbol
    disappears, unused, reached = [], [], []
    for key, info in psc.items():
        cs = info["callSites"]
        bc = info["byComponent"]
        if cs == 0:
            unused.append(key)
            continue
        callers = set(bc.keys())
        if callers and callers <= REPLACEABLE:
            disappears.append({"symbol": key, "callSites": cs,
                               "callers": sorted(callers)})
        else:
            reached.append({"symbol": key, "callSites": cs,
                            "gameCallSites": bc.get("(game/unattributed)", 0),
                            "byComponent": bc})

    # verdict rollup over symbols reached by non-replaceable code
    by_verdict = defaultdict(lambda: {"symbols": 0, "callSites": 0, "subsystems": set()})
    for r in reached:
        sname = full_sub.get(r["symbol"])
        if sname is None:
            sname = "k32-other"
        v = VERDICT.get(sname, ("shim", "unclassified"))[0]
        e = by_verdict[v]
        e["symbols"] += 1
        e["callSites"] += r["callSites"]
        e["subsystems"].add(sname)

    # ---- .text budget ----------------------------------------------------
    comp = {c["component"]: c for c in attribution["components"]}
    text_raw = attribution["textRawSize"]
    body = attribution["functionBodyBytes"]
    repl_bytes = sum(comp[c]["bytes"] for c in REPLACEABLE if c in comp)
    repl_anchored = sum(comp[c]["anchoredBytes"] for c in REPLACEABLE if c in comp)
    glue_bytes = sum(comp[c]["bytes"] for c in comp
                     if c not in REPLACEABLE and c != "(unattributed)")
    unattr = comp["(unattributed)"]["bytes"]

    result = {
        "imports": {
            "totalSymbols": imports["symbolCount"],
            "totalDlls": imports["dllCount"],
            "delayLoadDlls": imports["delayDllCount"],
            "ordinalOnly": imports["ordinalOnlyCount"],
            "totalCallSites": imports["totalIatCallSites"],
            "unusedSymbols": len(unused),
            "disappearsWithUpstreamLibs": {
                "symbols": len(disappears),
                "callSites": sum(d["callSites"] for d in disappears),
                "list": sorted(disappears, key=lambda d: -d["callSites"]),
            },
            "reachedByLiftedCode": {
                "symbols": len(reached),
                "callSites": sum(r["callSites"] for r in reached),
            },
            "byVerdict": {k: {"symbols": v["symbols"], "callSites": v["callSites"],
                              "subsystems": sorted(v["subsystems"])}
                          for k, v in sorted(by_verdict.items())},
        },
        "gl": {
            "entryPointsAvailable": exports["epoxyExports"],
            "entryPointsActuallyCalled": exports["epoxyCalled"],
            "callSites": exports["epoxyCallSites"],
            "families": exports["families"],
        },
        "textBudget": {
            "textRawSize": text_raw,
            "functionBodyBytes": body,
            "paddingBytes": funcs["index"]["paddingBytes"],
            "functionCount": funcs["index"]["functionCount"],
            "replaceableThirdParty": {
                "bytes": repl_bytes, "pct": round(100.0 * repl_bytes / text_raw, 2),
                "anchoredFloorBytes": repl_anchored,
                "anchoredFloorPct": round(100.0 * repl_anchored / text_raw, 2),
                "components": {c: comp[c]["bytes"] for c in REPLACEABLE if c in comp},
            },
            "vendorClientGlue": {"bytes": glue_bytes,
                                 "pct": round(100.0 * glue_bytes / text_raw, 2)},
            "liftableGameLogic": {"bytes": unattr,
                                  "pct": round(100.0 * unattr / text_raw, 2)},
        },
        "dataImage": {
            "rdataRaw": dataimg["rdataSection"]["rawSize"],
            "rdataBssTail": dataimg["rdataSection"]["bssTailBytes"],
            "dataRaw": dataimg["dataSection"]["rawSize"],
            "dataBssTail": dataimg["dataSection"]["bssTailBytes"],
            "dataNonZeroInRaw": dataimg["dataSection"]["nonZeroBytesInRaw"],
            "relocations": dataimg["relocations"],
            "iatSlots": dataimg["iat"]["slots"],
            "codePointersInData": dataimg["codePointersInData"],
            "tlsCallbacks": len(dataimg["tls"]["callbacks"]) if dataimg["tls"] else 0,
        },
    }
    (OUT / "rollup.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    i = result["imports"]
    print("IMPORTS")
    print("  total symbols            : %d across %d DLLs (%d delay-load, %d ordinal-only)"
          % (i["totalSymbols"], i["totalDlls"], i["delayLoadDlls"], i["ordinalOnly"]))
    print("  total IAT call sites     : %d" % i["totalCallSites"])
    print("  never called             : %d" % i["unusedSymbols"])
    print("  vanish w/ upstream libs  : %d symbols, %d call sites"
          % (i["disappearsWithUpstreamLibs"]["symbols"],
             i["disappearsWithUpstreamLibs"]["callSites"]))
    print("  reached by lifted code   : %d symbols, %d call sites"
          % (i["reachedByLiftedCode"]["symbols"], i["reachedByLiftedCode"]["callSites"]))
    print("  by verdict:")
    for k, v in i["byVerdict"].items():
        print("     %-9s %3d symbols  %6d call sites" % (k, v["symbols"], v["callSites"]))
    print("\nTOP symbols that vanish with upstream libs:")
    for d in i["disappearsWithUpstreamLibs"]["list"][:20]:
        print("   %-46s %4d  (%s)" % (d["symbol"], d["callSites"], ",".join(d["callers"])))

    t = result["textBudget"]
    print("\n.TEXT BUDGET (raw %d bytes)" % t["textRawSize"])
    print("  function bodies          : %d (%d functions, %d bytes padding)"
          % (t["functionBodyBytes"], t["functionCount"], t["paddingBytes"]))
    print("  replaceable third-party  : %d (%.2f%%)   anchored floor %d (%.2f%%)"
          % (t["replaceableThirdParty"]["bytes"], t["replaceableThirdParty"]["pct"],
             t["replaceableThirdParty"]["anchoredFloorBytes"],
             t["replaceableThirdParty"]["anchoredFloorPct"]))
    for c, b in sorted(t["replaceableThirdParty"]["components"].items(),
                       key=lambda kv: -kv[1]):
        print("       %-16s %8d" % (c, b))
    print("  vendor client glue       : %d (%.2f%%)" % (t["vendorClientGlue"]["bytes"],
                                                        t["vendorClientGlue"]["pct"]))
    print("  liftable game logic      : %d (%.2f%%)" % (t["liftableGameLogic"]["bytes"],
                                                        t["liftableGameLogic"]["pct"]))
    g = result["gl"]
    print("\nGL: %d entry points available, %d actually called, %d call sites"
          % (g["entryPointsAvailable"], g["entryPointsActuallyCalled"], g["callSites"]))
    print("\nwrote", OUT / "rollup.json")


if __name__ == "__main__":
    main()
