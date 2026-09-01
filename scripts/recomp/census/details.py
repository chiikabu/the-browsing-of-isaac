"""Detail views that drive the browser verdict.

  * which user32/kernel32 symbols the GAME calls directly vs. which only the
    vendored GLFW copy calls (the former is extra shim work, the latter is
    covered by emscripten's GLFW port)
  * the full threads/sync, file-I/O and process symbol lists, since those are
    the buckets that are genuinely hard in a browser
  * the dynamic-loading surface: DLL name strings and GetProcAddress symbol
    strings, which are imports that never appear in the import directory
"""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"


def main():
    pe = PE(default_target())
    subs = json.loads((OUT / "subsystems.json").read_text(encoding="utf-8"))
    imports = json.loads((OUT / "imports.json").read_text(encoding="utf-8"))
    psc = subs["perSymbolComponent"]

    # ---- who calls what --------------------------------------------------
    interesting = ["win-window/input", "gdi", "k32-threads/sync", "k32-file-io",
                   "k32-memory/heap", "k32-module/loader", "k32-time",
                   "k32-env/process", "k32-error/debug", "win-timing",
                   "win-shell/com", "k32-locale/encoding", "k32-other",
                   "crt-stdio/fs", "audio-openal", "gl"]
    report = {}
    for s in subs["subsystems"]:
        if s["subsystem"] not in interesting:
            continue
        rows = []
        for sym in s["topSymbols"]:
            bc = sym["byComponent"]
            game = bc.get("(game/unattributed)", 0)
            glfw = bc.get("glfw", 0)
            other = sum(v for k, v in bc.items()
                        if k not in ("(game/unattributed)", "glfw"))
            rows.append({"symbol": sym["symbol"], "dll": sym["dll"],
                         "callSites": sym["callSites"], "game": game,
                         "glfw": glfw, "other": other})
        rows.sort(key=lambda r: -r["callSites"])
        report[s["subsystem"]] = rows

    # unused imports (0 call sites) - dead weight the shim never needs
    unused = [{"dll": r["dll"], "symbol": r["symbol"]}
              for r in imports["symbols"] if r["callSites"] == 0]

    # ---- dynamic loading surface -----------------------------------------
    pat = re.compile(rb"[\x20-\x7e]{3,}")
    strs = []
    for name in (".rdata", ".data"):
        sec = pe.section(name)
        blob = pe.data[sec.raw_offset:sec.raw_offset + sec.raw_size]
        for m in pat.finditer(blob):
            strs.append((pe.image_base + sec.rva + m.start(),
                         m.group().decode("ascii")))
    dll_names = sorted({t for _v, t in strs
                        if re.fullmatch(r"[A-Za-z0-9_\-.]+\.dll", t, re.I)})
    # symbol-looking strings that match known dynamic-resolution families
    dyn_families = {
        "wgl": sorted({t for _v, t in strs if re.fullmatch(r"wgl[A-Z]\w+", t)}),
        "gl": sorted({t for _v, t in strs if re.fullmatch(r"gl[A-Z]\w+", t)}),
        "xinput": sorted({t for _v, t in strs if re.fullmatch(r"XInput\w+", t)}),
        "dinput": sorted({t for _v, t in strs if re.fullmatch(r"(DirectInput\w+|IID_\w+)", t)}),
        "steam": sorted({t for _v, t in strs if re.fullmatch(r"SteamAPI_\w+", t)}),
        "curl": sorted({t for _v, t in strs if re.fullmatch(r"curl_\w+", t)}),
        "al": sorted({t for _v, t in strs if re.fullmatch(r"al[A-Z]\w+|alc[A-Z]\w+", t)}),
        "lua": sorted({t for _v, t in strs if re.fullmatch(r"lua[A-Z_]\w+|luaL_\w+", t)}),
        "eos": sorted({t for _v, t in strs if re.fullmatch(r"EOS_\w+", t)}),
        "ntdll/k32-dyn": sorted({t for _v, t in strs if re.fullmatch(
            r"(Rtl\w+|Nt\w+|Zw\w+|SetProcessDpiAware\w*|GetDpiForMonitor|"
            r"SetThreadDpiAwarenessContext|AdjustWindowRectExForDpi|"
            r"GetSystemMetricsForDpi|EnableNonClientDpiScaling|"
            r"SetProcessDPIAware|GetDpiForWindow|IsWindows\w+)", t)}),
    }

    result = {"bySubsystem": report, "unusedImports": unused,
              "dllNameStrings": dll_names, "dynamicSymbolStrings":
              {k: {"count": len(v), "sample": v[:40]} for k, v in dyn_families.items()}}
    (OUT / "details.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    for name in interesting:
        rows = report.get(name)
        if not rows:
            continue
        tot = sum(r["callSites"] for r in rows)
        gm = sum(r["game"] for r in rows)
        gl = sum(r["glfw"] for r in rows)
        print("\n=== %s === %d symbols, %d call sites (game=%d glfw=%d)" % (
            name, len(rows), tot, gm, gl))
        for r in rows:
            if r["callSites"] == 0:
                continue
            print("   %-34s %-16s calls=%-5d game=%-4d glfw=%-4d other=%d" % (
                r["symbol"], r["dll"].replace(".dll", ""), r["callSites"],
                r["game"], r["glfw"], r["other"]))

    print("\n=== imports with ZERO call sites: %d ===" % len(unused))
    byd = defaultdict(list)
    for u in unused:
        byd[u["dll"]].append(u["symbol"])
    for k, v in sorted(byd.items(), key=lambda kv: -len(kv[1])):
        print("   %-38s %d: %s" % (k, len(v), ", ".join(v[:8])))

    print("\n=== DLL name strings in image (%d) ===" % len(dll_names))
    print("   " + ", ".join(dll_names))
    print("\n=== dynamically-resolved symbol string families ===")
    for k, v in dyn_families.items():
        print("   %-14s %d" % (k, len(v)))
    print("   wgl sample:", ", ".join(dyn_families["wgl"][:12]))
    print("   ntdll/k32 dyn:", ", ".join(dyn_families["ntdll/k32-dyn"][:20]))
    print("\nwrote", OUT / "details.json")


if __name__ == "__main__":
    main()
