#!/usr/bin/env python3
"""Mods as files of a dist's instance tree, for development of the REPENTOGON layer.

  python scripts/recomp/rgon/tools/dev_dist.py <dist> [--layer] [--mod <folder> ...] [--copy]

A mod installed through the page lives in IndexedDB and is seeded whole into the
engine's memory at boot, which is right for a 2 MB mod and not for Fiend Folio
(22,858 files, 640 MB). A dist's own instance tree is registered lazily instead:
the engine learns each file's name and size, and reads one over HTTP when the
game opens it (boot_web.mjs "register instance tree lazily"). So for working on
a big mod, its files go under <dist>/instance/mods/<directory>/ and into
instance_index.json, and nothing is imported.

  --layer          the layer itself (scripts/recomp/rgon + REPENTOGON's enums_ex.lua)
                   as mods/repentogon/, so an edit to rgon.lua is one re-run away
  --mod <folder>   a mod folder (its metadata.xml names the directory it gets;
                   <folder>=<directory> gives it another)

REPENTOGON reads a mod's `content-repentogon` folder in place of `content` (XML
the plain game would not take). With the layer in the dist, a mod's
content-repentogon files are listed under content/ as well, unless it has a
file of that name there already.

Files are hard-linked where the volume allows it (--copy copies). Re-running
replaces what an earlier run put under instance/mods/.
"""
import argparse
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
RGON = os.path.join(ROOT, "scripts", "recomp", "rgon")
ENUMS = os.path.join(ROOT, "third_party", "REPENTOGON", "repentogon", "resources", "scripts", "enums_ex.lua")
SKIP_TOP = {"basementrenovator", ".git", ".github"}          # editor data a game never reads


def directory_of(folder):
    meta = os.path.join(folder, "metadata.xml")
    try:
        text = open(meta, encoding="utf-8", errors="replace").read()
    except OSError:
        return re.sub(r"_\d+$", "", os.path.basename(folder.rstrip("/\\")))
    m = re.search(r"<directory>\s*([^<]+?)\s*</directory>", text)
    return m.group(1) if m else re.sub(r"_\d+$", "", os.path.basename(folder.rstrip("/\\")))


def put(src, dst, copy):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):
        os.remove(dst)
    if not copy:
        try:
            os.link(src, dst)
            return
        except OSError:
            pass
    shutil.copyfile(src, dst)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("dist")
    ap.add_argument("--layer", action="store_true")
    ap.add_argument("--mod", action="append", default=[])
    ap.add_argument("--copy", action="store_true")
    args = ap.parse_args()
    dist = os.path.abspath(args.dist)
    index_path = os.path.join(dist, "instance_index.json")
    index = [e for e in json.load(open(index_path, encoding="utf-8")) if not e["p"].startswith("mods/")]
    mods_root = os.path.join(dist, "instance", "mods")
    if os.path.isdir(mods_root):
        shutil.rmtree(mods_root)
    added = []

    def add(rel, src):
        dst = os.path.join(mods_root, *rel.split("/"))
        put(src, dst, args.copy)
        added.append({"p": "mods/" + rel, "s": os.path.getsize(dst)})

    if args.layer:
        for name in ("metadata.xml", "main.lua", "rgon.lua"):
            add("repentogon/" + name, os.path.join(RGON, name))
        for name in sorted(os.listdir(RGON)):
            if (name.startswith(("api_", "lab_")) or name == "hook_slots.lua") and name.endswith(".lua"):
                add("repentogon/" + name, os.path.join(RGON, name))
        add("repentogon/enums_ex.lua", ENUMS)
    for folder in args.mod:
        # <folder>=<directory> installs it under another name. The engine runs mods'
        # scripts in directory order, and has no second pass as a PC with Steam does,
        # so a mod another one needs at load time has to sort before it.
        folder, _, as_dir = folder.partition("=") if "=" in os.path.basename(folder) else (folder, "", "")
        folder = os.path.abspath(folder)
        d = as_dir or directory_of(folder)
        n0 = len(added)
        have = set()
        files = []
        for base, dirs, names in os.walk(folder):
            relbase = os.path.relpath(base, folder).replace("\\", "/")
            if relbase == ".":
                dirs[:] = [x for x in dirs if x.lower() not in SKIP_TOP]
                relbase = ""
            for name in names:
                rel = (relbase + "/" if relbase else "") + name
                files.append((rel, os.path.join(base, name)))
                have.add(rel.lower())
        for rel, src in files:
            add(d + "/" + rel, src)
            if args.layer and rel.lower().startswith("content-repentogon/"):
                as_content = "content/" + rel[len("content-repentogon/"):]
                if as_content.lower() not in have:
                    add(d + "/" + as_content, src)
        print("  %-28s %6d files  %8.1f MB  -> mods/%s/" % (os.path.basename(folder)[:28], len(added) - n0,
              sum(e["s"] for e in added[n0:]) / 1048576.0, d))
    index += added
    json.dump(index, open(index_path, "w", encoding="utf-8"), separators=(",", ":"))
    print("%s: %d instance files, %d of them under mods/ (%.1f MB)" % (
        index_path, len(index), len(added), sum(e["s"] for e in added) / 1048576.0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
