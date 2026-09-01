#!/usr/bin/env python3
"""Parse the PE32 import directory; print DLL -> IAT slot -> function name
for every slot, plus the section table (boundary documentation for the
playerhud-v39 ledger close).

Writes no files.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXE = ROOT / "tools" / "isaac-ng.unpacked.exe"
buf = EXE.read_bytes()
pe = int.from_bytes(buf[0x3C:0x40], "little")
nsec = int.from_bytes(buf[pe + 6 : pe + 8], "little")
opt = pe + 24
magic = int.from_bytes(buf[opt : opt + 2], "little")
image_base = int.from_bytes(buf[opt + 28 : opt + 32], "little")
opt_size = int.from_bytes(buf[pe + 20 : pe + 22], "little")
sec0 = opt + opt_size
sections = []
for i in range(nsec):
    o = sec0 + i * 40
    name = buf[o : o + 8].split(b"\0", 1)[0].decode("ascii", "replace")
    sections.append({
        "name": name,
        "vsize": int.from_bytes(buf[o + 8 : o + 12], "little"),
        "rva": int.from_bytes(buf[o + 12 : o + 16], "little"),
        "raw_size": int.from_bytes(buf[o + 16 : o + 20], "little"),
        "raw": int.from_bytes(buf[o + 20 : o + 24], "little"),
    })

def rva_to_off(rva):
    for s in sections:
        span = max(s["vsize"], s["raw_size"])
        if s["rva"] <= rva < s["rva"] + span:
            return s["raw"] + (rva - s["rva"]), s
    return None, None

print("=== sections ===")
for s in sections:
    print(f"  {s['name']:<8} rva 0x{s['rva']:08x} vsize 0x{s['vsize']:08x} raw 0x{s['raw']:08x} rawsize 0x{s['raw_size']:08x}  va 0x{image_base+s['rva']:08x}")

# data directory: index 1 = import table, 12 = IAT
imp_rva = int.from_bytes(buf[opt + 104 : opt + 108], "little")
imp_size = int.from_bytes(buf[opt + 108 : opt + 112], "little")
print(f"\nimport dir rva 0x{imp_rva:08x} size 0x{imp_size:08x}")

def read_cstr(off, limit=512):
    end = buf.index(b"\0", off, off + limit)
    return buf[off:end].decode("ascii", "replace")

entries = []
off, _ = rva_to_off(imp_rva)
for _ in range(64):
    e = buf[off : off + 20]
    if len(e) < 20:
        break
    ilt = int.from_bytes(e[0:4], "little")
    ts = int.from_bytes(e[4:8], "little")
    fc = int.from_bytes(e[8:12], "little")
    name_rva = int.from_bytes(e[12:16], "little")
    iat = int.from_bytes(e[16:20], "little")
    if ilt == 0 and ts == 0 and name_rva == 0 and iat == 0:
        break
    noff, _ = rva_to_off(name_rva)
    dll = read_cstr(noff) if noff is not None else f"(name rva 0x{name_rva:x} unresolvable)"
    entries.append({"dll": dll, "ilt": ilt, "iat": iat, "ts": ts})
    off += 20

print(f"\n=== {len(entries)} imported DLLs ===")
slot_map = {}
for e in entries:
    thunk_rva = e["ilt"] if e["ilt"] else e["iat"]
    thunk_off, _ = rva_to_off(thunk_rva)
    iat_off, _ = rva_to_off(e["iat"])
    funcs = []
    if thunk_off is None or iat_off is None:
        print(f"  {e['dll']}: (thunk rva 0x{thunk_rva:x}/iat rva 0x{e['iat']:x} unresolvable)")
        continue
    for i in range(4096):
        val = int.from_bytes(buf[thunk_off + i * 4 : thunk_off + i * 4 + 4], "little")
        if val == 0:
            break
        slot_va = image_base + e["iat"] + i * 4
        if val & 0x80000000:
            fname = f"(ordinal {val & 0xffff})"
        else:
            ho, _ = rva_to_off(val & 0x7fffffff)
            if ho is None:
                fname = f"(unresolvable 0x{val & 0x7fffffff:x})"
            else:
                fname = read_cstr(ho + 2)
        funcs.append((slot_va, fname))
    slot_map[e["dll"]] = funcs
    print(f"  {e['dll']}: {len(funcs)} imports, IAT base 0x{image_base+e['iat']:08x}")

print("\n=== slot table (IAT VA -> dll.func) ===")
for dll, funcs in slot_map.items():
    for slot_va, fname in funcs:
        print(f"  0x{slot_va:08x}  {dll}.{fname}")

# grid-referenced absolute slots
import re
grid_slots = set()
census = ROOT / "output/decomp/5129df723e64/section-notes/playerhud-v38-85e000/census-85e000-89e610.json"
import json
c = json.loads(census.read_text())
rows = c if isinstance(c, list) else c.get("rows", [])
for r in rows:
    if not (0x872000 <= r["va"] < 0x89e610):
        continue
    for op in r.get("indlist", []):
        m = re.search(r"\[(0x[0-9a-f]+)\]", op)
        if m:
            v = int(m.group(1), 16)
            if 0xb18000 <= v <= 0xb19000:
                grid_slots.add(v)
print(f"\ngrid absolute slots referenced: {len(grid_slots)}")
KNOWN = {}
for dll, funcs in slot_map.items():
    for slot_va, fname in funcs:
        KNOWN[slot_va] = f"{dll}.{fname}"
unknown = []
for v in sorted(grid_slots):
    if v in KNOWN:
        print(f"  0x{v:08x}  -> {KNOWN[v]}")
    else:
        unknown.append(v)
if unknown:
    print("  NOT in import table:", " ".join(hex(v) for v in unknown))