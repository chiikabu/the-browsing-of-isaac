#!/usr/bin/env python3
"""Data-pointer reachability scan: does any .rdata/.data/.text-aligned dword
hold a VA inside 0x85e330..0x85e390 (the getter cluster)?  Function-pointer
tables (luaL_Reg / vtable / closure registries) reference bodies by VA
without any call instruction textually naming them.

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
        "va": int.from_bytes(buf[o + 12 : o + 16], "little") + image_base,
        "raw_size": int.from_bytes(buf[o + 16 : o + 20], "little"),
        "raw": int.from_bytes(buf[o + 20 : o + 24], "little"),
    })

LO, HI = 0x85e330, 0x85e390
print("=== dword pointers into 0x85e330..0x85e390 across non-.text sections ===")
hits = []
for s in sections:
    if s["name"] == ".text" or s["raw_size"] == 0:
        continue
    span = max(s["vsize"], s["raw_size"])
    raw = buf[s["raw"] : s["raw"] + span]
    for i in range(0, len(raw) - 3, 4):
        v = int.from_bytes(raw[i : i + 4], "little")
        if LO <= v < HI:
            hits.append((s["name"], s["va"] + i, v))
for name, src, v in hits:
    print(f"0x{src:08x} (.{name}): dword 0x{v:08x} -> cluster")
print(f"total pointer entries into cluster: {len(hits)}")