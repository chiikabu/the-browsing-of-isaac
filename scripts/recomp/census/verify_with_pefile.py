"""Independent cross-check of imports.py using pefile.

Confirms (a) the DLL/symbol set, (b) that every symbol maps to the same IAT
slot VA. A name<->slot off-by-N would silently ruin every call-site number, so
this check gates the whole census.
"""

import json
import sys
from pathlib import Path

import pefile

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import default_target  # noqa: E402

pe = pefile.PE(str(default_target()), fast_load=True)
pe.parse_data_directories(directories=[
    pefile.DIRECTORY_ENTRY["IMAGE_DIRECTORY_ENTRY_IMPORT"],
    pefile.DIRECTORY_ENTRY["IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT"],
    pefile.DIRECTORY_ENTRY["IMAGE_DIRECTORY_ENTRY_EXPORT"],
])

ref = {}
for entry in getattr(pe, "DIRECTORY_ENTRY_IMPORT", []):
    dll = entry.dll.decode().lower()
    for imp in entry.imports:
        name = imp.name.decode() if imp.name else "#%d" % imp.ordinal
        ref[imp.address] = (dll, name)

delay = {}
for entry in getattr(pe, "DIRECTORY_ENTRY_DELAY_IMPORT", []):
    dll = entry.dll.decode().lower()
    for imp in entry.imports:
        name = imp.name.decode() if imp.name else "#%d" % imp.ordinal
        delay[imp.address] = (dll, name)

mine = json.loads((OUT / "imports.json").read_text(encoding="utf-8"))
mine_map = {int(r["iatVa"], 16): (r["dll"], r["symbol"]) for r in mine["symbols"]}

print("pefile  : %d import symbols across %d dlls, %d delay symbols"
      % (len(ref), len(getattr(pe, "DIRECTORY_ENTRY_IMPORT", [])), len(delay)))
print("census  : %d import symbols across %d dlls, %d delay dlls"
      % (len(mine_map), mine["dllCount"], mine["delayDllCount"]))

only_ref = set(ref) - set(mine_map)
only_mine = set(mine_map) - set(ref)
mismatch = [(hex(k), ref[k], mine_map[k]) for k in (set(ref) & set(mine_map))
            if ref[k][1] != mine_map[k][1] or ref[k][0] != mine_map[k][0]]

print("slots only in pefile :", len(only_ref))
print("slots only in census :", len(only_mine))
print("name/dll mismatches  :", len(mismatch))
for m in mismatch[:20]:
    print("   ", m)

# spot-check a few high-traffic slots against raw bytes
print("\nspot-check high-traffic slots (pefile view):")
top = sorted(mine["symbols"], key=lambda r: -r["callSites"])[:8]
for r in top:
    va = int(r["iatVa"], 16)
    print("   %-10s census=%-24s pefile=%s" % (r["iatVa"], r["symbol"],
                                               ref.get(va, ("?", "?"))[1]))

exports = getattr(pe, "DIRECTORY_ENTRY_EXPORT", None)
if exports:
    names = [e.name.decode() for e in exports.symbols if e.name]
    print("\nexport table: %d entries, %d named" % (len(exports.symbols), len(names)))
    print("  sample:", names[:5])

ok = not only_ref and not only_mine and not mismatch
print("\nCROSS-CHECK:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
