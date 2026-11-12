#!/usr/bin/env python3
"""Where this executable's structures agree with REPENTOGON's, and where they have moved.

  python scripts/recomp/rgon/tools/struct_deltas.py <offsets.json> [Class ...]

REPENTOGON's .zhl files describe the game's structures for the version it
targets (v1.9.7.12). The port runs v1.9.7.17, and some structures grew in
between. tools/prop_offsets.py measures this build's offsets for the fields
the game itself exposes to Lua; this tool lines those up with REPENTOGON's
fields of the same name and prints the difference at each one, in offset
order. A REPENTOGON field between two anchors that agree on a difference is
taken to have moved by that much; a field between anchors that disagree
cannot be placed this way and needs its own evidence.

Names are matched ignoring case and underscores (Lua "MaxFireDelay" and
"_maxFireDelay"); what does not match by name is not an anchor.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
ZHL = ROOT / "third_party" / "REPENTOGON" / "libzhl" / "functions"
LUA_TO_ZHL = {"Entity": "Entity", "EntityPlayer": "Entity_Player", "EntityPickup": "Entity_Pickup", "EntityTear": "Entity_Tear",
              "EntityBomb": "Entity_Bomb", "EntityProjectile": "Entity_Projectile", "EntityLaser": "Entity_Laser",
              "EntityFamiliar": "Entity_Familiar", "EntityNPC": "Entity_NPC", "EntityEffect": "Entity_Effect",
              "EntityKnife": "Entity_Knife", "Level": "Level", "Game": "Game", "Sprite": "ANM2", "Color": "ColorMod",
              "GridEntity": "GridEntity", "HUD": "HUD", "Room": "Room"}


def zhl_fields(struct):
    for f in ZHL.glob("*.zhl"):
        t = f.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"^struct\s+" + re.escape(struct) + r"\b[^{;]*\{", t, re.M)
        if not m:
            continue
        # the struct body runs to the matching "} : 0xSIZE;"
        end = re.search(r"^\}\s*:\s*0x[0-9a-fA-F]+\s*;", t[m.end():], re.M)
        body = t[m.end(): m.end() + (end.start() if end else len(t))]
        size = int(re.search(r"0x[0-9a-fA-F]+", end.group(0)).group(0), 16) if end else None
        fields = {}
        for mm in re.finditer(r"([A-Za-z_][A-Za-z0-9_]*)\s*(?:\[[^\]]*\])?\s*:\s*(0x[0-9a-fA-F]+)", body):
            fields.setdefault(mm.group(1), int(mm.group(2), 16))
        return fields, size
    return {}, None


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    measured = json.load(open(sys.argv[1]))
    classes = sys.argv[2:] or list(LUA_TO_ZHL)
    for cls in classes:
        z, size = zhl_fields(LUA_TO_ZHL.get(cls, cls))
        m = measured.get(cls, {})
        if not z:
            print("%s: no REPENTOGON struct" % cls)
            continue
        byname = {norm(k): (k, v) for k, v in z.items()}
        rows = []
        for name, e in m.items():
            if "offset" not in e:
                continue
            hit = byname.get(norm(name))
            if hit:
                rows.append((e["offset"], name, hit[0], hit[1]))
        rows.sort()
        print("%s (REPENTOGON %s, %d fields%s): %d anchor(s)" % (cls, LUA_TO_ZHL.get(cls, cls), len(z), ", size 0x%x" % size if size else "", len(rows)))
        last = None
        for off, name, zname, zoff in rows:
            d = off - zoff
            mark = "" if d == last or last is None else "   <-- changes here"
            print("   0x%05x %-26s was 0x%05x %-26s %+d%s" % (off, name, zoff, zname, d, mark))
            last = d
    return 0


if __name__ == "__main__":
    sys.exit(main())
