#!/usr/bin/env python3
"""Build a mod catalogue a page can browse, and the parts it downloads.

A folder of mods in, a directory a static host can serve out:

    catalogue.json      what the browser lists and searches
    m/<id>.<n>.bin      one mod, zipped, cut into parts

The parts exist because jsDelivr refuses a file over 20 MB, so nothing here is
allowed past 19. The page joins them back, unzips the result and stores the mod
in the browser (mods.mjs fetchMod/install). None of it is in the build: the page
fetches the catalogue when the browser is opened and a mod only when it is asked
for.

A mod bigger than the page's seed budget is listed but cannot be installed, so by
default one is left out entirely rather than served for nothing; --max-mb 0 keeps
everything.

Round 95: dependencies. Every entry records its Steam Workshop id ("workshop", from
its metadata <id>, else the folder's _<id> suffix). --requires names a JSON file
{workshop id: [required workshop ids]} (a Workshop page's Required items); each entry
then carries "requires", the catalogue ids of those mods, which the page installs
first. A mod that needs one the catalogue cannot list -- not in the folder, left out,
too big -- is left out itself, and so is anything that needs it in turn. --select
names a file of folder names (one a line) to pack instead of the whole folder.
--keep <dir> carries every entry (and its parts) of an earlier catalogue that this
build does not make itself, so a catalogue can grow without its source mods.

Round 107: --packed <folder> ships a mod too big to seed (Fiend Folio) as
content-addressed packs and an index under pk/ (see pack_mod below): the page
installs its index and eager lane and reads the rest in place as the game asks.
Its entry has "parts": 0 and "packed": {base, index, indexBytes, eagerBytes,
storedBytes}; "bytes" is the stored total, so a page from before round 107 lists it
as too big and leaves it alone. The output is checked file for file before the
catalogue is written. Name a folder <dir>_<workshop id> (for example
repentogon_3127536138) to give a mod without a metadata <id> its Workshop id.

usage:
  modpack.py <mods-dir> <out-dir> [--max-mb 96] [--part-mb 19] [--base URL]
             [--requires FILE] [--select FILE] [--keep DIR]
             [--packed FOLDER ...] [--boot-list FILE] [--pack-mib 4]
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import os
import re
import shutil
import sys
import zipfile
import zlib

MIB = 1 << 20
SKIP_NAMES = {"disable.it", ".ds_store", "thumbs.db", "desktop.ini"}


def human(n: int) -> str:
    return "%.2f MB" % (n / float(MIB)) if n >= MIB else "%d KB" % max(1, n // 1024)


def read_metadata(path: str) -> dict:
    """name, directory, description and version out of a mod's metadata.xml.

    Read with a regex rather than a parser on purpose: mods ship malformed XML --
    a bare ampersand, a BOM, a tag left open -- and a mod with a broken metadata
    file should lose its description, not its place in the catalogue.
    """
    out = {"name": None, "directory": None, "description": None, "version": None}
    try:
        with io.open(path, encoding="utf-8", errors="replace") as f:
            text = f.read()
    except OSError:
        return out
    for tag in out:
        m = re.search(r"<%s\s*>([\s\S]*?)</%s\s*>" % (tag, tag), text, re.I)
        if not m:
            continue
        v = re.sub(r"<!\[CDATA\[([\s\S]*?)\]\]>", r"\1", m.group(1)).strip()
        v = re.sub(r"\s+", " ", v)
        if v:
            # a description is shown whole (the browser scrolls it); the rest are labels
            out[tag] = v[:8000] if tag == "description" else v[:400]
    return out


def mod_id(name: str) -> str:
    s = re.sub(r"[^a-z0-9._-]+", "-", (name or "").lower()).strip("-.")
    return s[:64]


def zip_mod(folder: str) -> tuple[bytes, int, int]:
    """The mod's own tree, zipped, entries relative to the mod folder."""
    blob, files, skipped, _unpacked = zip_mod_sized(folder)
    return blob, files, skipped


def long_path(path: str) -> str:
    """On Windows, the extended-length form of a path: a workshop folder nests past
    MAX_PATH (260) -- "animated items" ships a 270-character sprite path -- and the
    plain form makes os.stat fail."""
    if os.name != "nt":
        return path
    path = os.path.abspath(path)
    return path if path.startswith("\\\\?\\") else "\\\\?\\" + path


def zip_mod_sized(folder: str) -> tuple[bytes, int, int, int]:
    """zip_mod, and the bytes it unpacks to."""
    folder = long_path(folder)
    buf = io.BytesIO()
    files = skipped = unpacked = 0
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for dp, dn, fn in os.walk(folder):
            dn[:] = sorted(d for d in dn if not d.startswith("."))
            for f in sorted(fn):
                if f.lower() in SKIP_NAMES:
                    skipped += 1
                    continue
                full = os.path.join(dp, f)
                rel = os.path.relpath(full, folder).replace("\\", "/")
                z.write(full, rel)
                files += 1
                unpacked += os.path.getsize(full)
    return buf.getvalue(), files, skipped, unpacked


def workshop_id(folder_name: str, metadata_path: str) -> str | None:
    """The mod's Steam Workshop id: its metadata's <id>, else the folder's _<id>."""
    try:
        with io.open(metadata_path, encoding="utf-8", errors="replace") as f:
            m = re.search(r"<id>\s*(\d+)\s*</id>", f.read())
        if m:
            return m.group(1)
    except OSError:
        pass
    m = re.search(r"_(\d{6,})$", folder_name)
    return m.group(1) if m else None


def resolve_requires(entries: list[dict], needs: dict[str, list[str]]) -> tuple[list[dict], list[tuple[str, str]]]:
    """Each entry's required workshop ids as catalogue ids, and the entries that
    cannot have theirs. A requirement nothing in `entries` carries leaves the mod
    out; leaving it out can strand another, so this runs until nothing changes.
    Returns (kept, [(name, why)])."""
    kept = list(entries)
    dropped: list[tuple[str, str]] = []
    while True:
        by_ws = {e["workshop"]: e["id"] for e in kept if e.get("workshop")}
        still, changed = [], False
        for e in kept:
            req = [w for w in needs.get(e.get("workshop") or "", []) if w != e.get("workshop")]
            lost = [w for w in req if w not in by_ws]
            if lost:
                dropped.append((e["name"], "needs workshop item(s) %s, not in this catalogue" % ", ".join(lost)))
                changed = True
                continue
            ids = sorted({by_ws[w] for w in req})
            if ids:
                e["requires"] = ids
            else:
                e.pop("requires", None)
            still.append(e)
        kept = still
        if not changed:
            return kept, dropped


# ---- packed mods (round 107) -------------------------------------------------
# A mod too big for the page's seed budget (Fiend Folio: 20,814 files, 667 MB) is
# not zipped: --packed writes it as content-addressed packs and an index under
# <out>/pk/, which the page installs a lane at a time and the engine reads in place
# (mods.mjs createPackedMods, host_shims_fs.c ranged entries).
#
#   pk/<sha256[:20]>.idx   gzip'd JSON index (mtime 0)
#   pk/<sha256[:20]>.bin   b"IMPK" 01 00 00 00, then whole stored files back to back
#
# A file is stored raw (codec 0) or as raw deflate level 9 (codec 1) when that saves
# 5 % or more. Identical files are stored once. A file never straddles packs; one
# whose stored bytes pass PACK_MAX is cut into packs of its own. Lanes say when the
# page fetches a pack:
#
#   eager  at install: every .lua (the host Lua reads MEMFS before main), metadata.xml,
#          content/ and content-repentogon/ but their .stb, the files --boot-list names
#          (a measured boot), and one blob of every WAV's header -- the lazy samples'
#          header pass reads each WAV only up to its `data` chunk header (round 98)
#   wav    WAV bodies, apart, so a sound played drags no graphics in
#   lazy   the rest, in path order, so a folder's files share packs
#
# Packs are cut where content says (a file whose path hashes to 0 mod 8, once a pack
# holds half the target; never past twice the target), so an update re-uploads the
# packs of the files it changed and not every pack after them. The same folder gives
# byte-identical packs and index. A mod with content-repentogon/ has those files listed
# again as content/ (aliases), as REPENTOGON reads them and dev_dist.py does.
#
# Index: {"v":1, id, name, version, workshop, directory, bytes, files, target,
#         packs: [[name, stored, lane]], f: [[path, size, pack, offset, stored, codec,
#         sha256[:16], head]], alias: [[path, f index]], heads: [pack, offset, length] | null}
# (a split file has lists for pack and stored, and its parts start at offset 8)
PACK_MAGIC = b"IMPK\x01\x00\x00\x00"
PACK_MAX = 19 * MIB              # 19,922,944 < 20,000,000: jsDelivr refuses a GitHub file over 20 MB
STORED_LIMIT = 20_000_000
PACK_SKIP_TOP = {"basementrenovator", ".git", ".github"}     # editor data a game never reads


def wav_header_end(d: bytes) -> int:
    """Bytes of a WAV up to and including its `data` chunk header, as the game's parser
    (0x00a9f630) walks the chunks; 0 for anything that is not RIFF/WAVE."""
    if len(d) < 12 or d[:4] != b"RIFF" or d[8:12] != b"WAVE":
        return 0
    p = 12
    while p + 8 <= len(d):
        cid, size = d[p:p + 4], int.from_bytes(d[p + 4:p + 8], "little")
        if cid == b"data":
            return p + 8
        p += 8 + size + (size & 1)
    return 0


def _deflate_raw(b: bytes) -> bytes:
    c = zlib.compressobj(9, zlib.DEFLATED, -15, 9)
    return c.compress(b) + c.flush()


def _inflate_raw(b: bytes) -> bytes:
    d = zlib.decompressobj(-15)
    return d.decompress(b) + d.flush()


def _packed_files(folder: str) -> list[tuple[str, str]]:
    folder = long_path(folder)
    out = []
    for dp, dn, fn in os.walk(folder):
        rel = os.path.relpath(dp, folder).replace("\\", "/")
        if rel == ".":
            dn[:] = [d for d in dn if d.lower() not in PACK_SKIP_TOP]
            rel = ""
        dn[:] = sorted(d for d in dn if not d.startswith("."))
        for f in sorted(fn):
            if f.lower() in SKIP_NAMES:
                continue
            out.append(((rel + "/" if rel else "") + f, os.path.join(dp, f)))
    return out


def _lane(rel: str, boot: set) -> str:
    low = rel.lower()
    if low.endswith(".lua") or low == "metadata.xml" or low in boot:
        return "eager"
    if (low.startswith("content/") or low.startswith("content-repentogon/")) and not low.endswith(".stb"):
        return "eager"
    return "wav" if low.endswith(".wav") else "lazy"


def pack_mod(folder: str, pk_dir: str, mid: str, meta: dict, boot=(), target_mib: float = 4.0) -> dict:
    """Write one mod's packs and index into pk_dir; returns the catalogue's `packed`
    fields plus the index's name and the names of every file written."""
    boot = {b.lower() for b in boot}
    target = int(target_mib * MIB)
    files = _packed_files(folder)
    bodies, entries, heads = {}, [], bytearray()
    for rel, full in files:
        with open(full, "rb") as f:
            b = f.read()
        h = hashlib.sha256(b).hexdigest()
        hl = wav_header_end(b) if rel.lower().endswith(".wav") else 0
        if hl:
            heads += b[:hl]
        lane = _lane(rel, boot)
        entries.append({"rel": rel, "size": len(b), "h": h, "head": hl})
        body = bodies.get(h)
        if body is None:
            z = _deflate_raw(b) if len(b) >= 64 else b
            codec = 1 if len(z) <= 0.95 * len(b) else 0
            bodies[h] = {"stored": z if codec else b, "codec": codec, "lane": lane, "first": rel}
        elif lane == "eager":
            body["lane"] = "eager"                  # a body any eager path needs is eager
    packs, place = [], {}

    def new_pack(lane):
        packs.append([bytearray(PACK_MAGIC), lane])
        return len(packs) - 1

    room = PACK_MAX - len(PACK_MAGIC)
    for lane in ("eager", "wav", "lazy"):
        cur = None
        for h, body in sorted(((h, b) for h, b in bodies.items() if b["lane"] == lane), key=lambda kv: (kv[1]["first"].lower(), kv[1]["first"])):
            s = body["stored"]
            if len(s) > room:                       # a file of its own packs
                parts = []
                for k in range(0, len(s), room):
                    i = new_pack(lane)
                    parts.append((i, len(PACK_MAGIC), len(s[k:k + room])))
                    packs[i][0] += s[k:k + room]
                place[h] = parts
                cur = None
                continue
            if cur is None or (len(packs[cur][0]) + len(s) > 2 * target and len(packs[cur][0]) > len(PACK_MAGIC)):
                cur = new_pack(lane)
            place[h] = [(cur, len(packs[cur][0]), len(s))]
            packs[cur][0] += s
            if len(packs[cur][0]) >= target // 2 and int(hashlib.sha1(body["first"].lower().encode("utf-8")).hexdigest()[:8], 16) % 8 == 0:
                cur = None
    heads_at = None
    if heads:
        i = new_pack("eager")
        heads_at = [i, len(packs[i][0]), len(heads)]
        packs[i][0] += heads
    names, written = [], []
    for buf, lane in packs:
        if len(buf) >= STORED_LIMIT:
            raise SystemExit("a pack of %s is %d bytes, not under %d" % (mid, len(buf), STORED_LIMIT))
        n = hashlib.sha256(buf).hexdigest()[:20] + ".bin"
        with open(os.path.join(pk_dir, n), "wb") as f:
            f.write(buf)
        names.append([n, len(buf), lane])
        written.append(n)
    rows = []
    for e in entries:
        pl, body = place[e["h"]], bodies[e["h"]]
        if len(pl) == 1:
            rows.append([e["rel"], e["size"], pl[0][0], pl[0][1], pl[0][2], body["codec"], e["h"][:16], e["head"]])
        else:
            rows.append([e["rel"], e["size"], [x[0] for x in pl], len(PACK_MAGIC), [x[2] for x in pl], body["codec"], e["h"][:16], e["head"]])
    have = {e["rel"].lower() for e in entries}
    alias = []
    for i, e in enumerate(entries):
        if e["rel"].lower().startswith("content-repentogon/"):
            as_content = "content/" + e["rel"][len("content-repentogon/"):]
            if as_content.lower() not in have:
                alias.append([as_content, i])
    index = {"v": 1, "id": mid, "name": meta.get("name"), "version": meta.get("version"),
             "workshop": meta.get("workshop"), "directory": meta.get("directory"),
             "bytes": sum(e["size"] for e in entries), "files": len(entries), "target": target,
             "packs": names, "f": rows, "alias": alias, "heads": heads_at}
    gz = gzip.compress(json.dumps(index, separators=(",", ":"), ensure_ascii=False).encode("utf-8"), 9, mtime=0)
    iname = hashlib.sha256(gz).hexdigest()[:20] + ".idx"
    with open(os.path.join(pk_dir, iname), "wb") as f:
        f.write(gz)
    written.append(iname)
    eager = sum(n[1] for n in names if n[2] == "eager")
    return {"index": iname, "indexBytes": len(gz), "eagerBytes": eager, "storedBytes": sum(n[1] for n in names),
            "packs": len(names), "unpacked": index["bytes"], "files": len(entries), "aliases": len(alias),
            "uniqueBodies": len(bodies), "largest": max(n[1] for n in names), "written": written}


def verify_packed(folder: str, pk_dir: str, iname: str) -> tuple[int, int, int]:
    """Every file of the folder out of the packs, byte for byte, against the source;
    every pack's and the index's name against its bytes. (files checked, mismatches,
    largest stored file)"""
    with open(os.path.join(pk_dir, iname), "rb") as f:
        gz = f.read()
    bad = 0
    if hashlib.sha256(gz).hexdigest()[:20] + ".idx" != iname:
        bad += 1
    index = json.loads(gzip.decompress(gz))
    packs, largest = [], len(gz)
    for n, size, _lane in index["packs"]:
        with open(os.path.join(pk_dir, n), "rb") as f:
            b = f.read()
        if len(b) != size or hashlib.sha256(b).hexdigest()[:20] + ".bin" != n or b[:8] != PACK_MAGIC:
            bad += 1
        largest = max(largest, len(b))
        packs.append(b)
    if largest >= STORED_LIMIT:
        bad += 1

    def body_of(row):
        p, off, ln, codec = row[2], row[3], row[4], row[5]
        if isinstance(p, list):
            s = b"".join(packs[pi][len(PACK_MAGIC):len(PACK_MAGIC) + li] for pi, li in zip(p, ln))
        else:
            s = packs[p][off:off + ln]
        return _inflate_raw(s) if codec == 1 else s

    src = dict(_packed_files(folder))
    if set(src) != {r[0] for r in index["f"]}:
        bad += 1
    hp = index["heads"]
    blob = packs[hp[0]][hp[1]:hp[1] + hp[2]] if hp else b""
    at = 0
    for row in index["f"]:
        with open(src[row[0]], "rb") as f:
            want = f.read()
        if body_of(row) != want or len(want) != row[1] or hashlib.sha256(want).hexdigest()[:16] != row[6]:
            bad += 1
        if row[7]:
            if blob[at:at + row[7]] != want[:row[7]]:
                bad += 1
            at += row[7]
    for path, i in index["alias"]:
        if not path.lower().startswith("content/") or not index["f"][i][0].lower().startswith("content-repentogon/"):
            bad += 1
    return len(index["f"]), bad, largest


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mods")
    ap.add_argument("out")
    ap.add_argument("--part-mb", type=int, default=19, help="largest part (default 19; jsDelivr refuses 20)")
    ap.add_argument("--max-mb", type=int, default=96,
                    help="leave out a mod bigger than this, which the page could not seed anyway (0 keeps every mod)")
    ap.add_argument("--base", help="where the catalogue will be served from, recorded in it for reference")
    ap.add_argument("--requires", help="JSON {workshop id: [required workshop ids]} (round 95)")
    ap.add_argument("--select", help="a file of folder names, one a line, to pack instead of every folder")
    ap.add_argument("--keep", help="an earlier catalogue dir whose entries this build does not make are carried over")
    ap.add_argument("--packed", action="append", default=[],
                    help="round 107: a folder (by name) to ship as packs + index under pk/ instead of a zip; "
                         "no size cap applies. Repeatable")
    ap.add_argument("--boot-list", help="JSON list (or lines) of a packed mod's files a measured boot opens: "
                                        "they go in its eager lane (paths relative to the mod, or mods/<dir>/...)")
    ap.add_argument("--pack-mib", type=float, default=4.0, help="a packed mod's pack target, MiB (default 4)")
    args = ap.parse_args(argv)
    packed_names = set(args.packed)
    boot = []
    if args.boot_list:
        with io.open(args.boot_list, encoding="utf-8") as f:
            text = f.read()
        try:
            boot = json.loads(text)
        except ValueError:
            boot = [line.strip() for line in text.splitlines() if line.strip()]
        boot = [re.sub(r"^mods/[^/]+/", "", b) for b in boot]
    needs = {}
    if args.requires:
        with io.open(args.requires, encoding="utf-8") as f:
            needs = {str(k): [str(x) for x in v] for k, v in json.load(f).items()}
    select = None
    if args.select:
        with io.open(args.select, encoding="utf-8") as f:
            select = {line.strip() for line in f if line.strip()}

    part = args.part_mb * MIB
    cap = args.max_mb * MIB
    if not os.path.isdir(args.mods):
        print("no such folder: %s" % args.mods)
        return 2
    os.makedirs(os.path.join(args.out, "m"), exist_ok=True)
    for f in os.listdir(os.path.join(args.out, "m")):
        os.remove(os.path.join(args.out, "m", f))
    pk_dir = os.path.join(args.out, "pk")
    if os.path.isdir(pk_dir):
        for f in os.listdir(pk_dir):
            os.remove(os.path.join(pk_dir, f))
    packed_src = {}

    entries, seen, left_out, total, blobs = [], {}, [], 0, {}
    for name in sorted(os.listdir(args.mods)):
        folder = os.path.join(args.mods, name)
        if not os.path.isdir(folder) or (select is not None and name not in select):
            continue
        meta = read_metadata(os.path.join(folder, "metadata.xml"))
        # the folder name carries the workshop id after an underscore; the mod's
        # own <directory> is what the game would call it, so that wins
        base = meta["directory"] or re.sub(r"_\d{6,}$", "", name)
        mid = mod_id(base) or mod_id(name)
        if not mid or mid in seen:
            mid = mod_id("%s-%d" % (mid or "mod", len(entries)))
        if name in packed_names:
            # round 107: packed when it is written out (below), once its requirements stand
            seen[mid] = True
            packed_src[mid] = (folder, meta)
            entry = {"id": mid, "name": meta["name"] or base, "description": meta["description"] or "",
                     "version": meta["version"] or "", "bytes": 0, "unpacked": 0, "files": 0, "parts": 0,
                     "packed": {"base": "pk"}}
            ws = workshop_id(name, os.path.join(folder, "metadata.xml"))
            if ws:
                entry["workshop"] = ws
            entries.append(entry)
            continue
        blob, files, skipped, unpacked = zip_mod_sized(folder)
        if cap and len(blob) > cap:
            left_out.append((meta["name"] or name, "%s (over the %d MB the page can seed)" % (human(len(blob)), args.max_mb)))
            continue
        seen[mid] = True
        blobs[mid] = (blob, skipped)
        entry = {
            "id": mid,
            "name": meta["name"] or base,
            "description": meta["description"] or "",
            "version": meta["version"] or "",
            "bytes": len(blob),
            "unpacked": unpacked,
            "files": files,
            "parts": max(1, (len(blob) + part - 1) // part),
        }
        ws = workshop_id(name, os.path.join(folder, "metadata.xml"))
        if ws:
            entry["workshop"] = ws
        entries.append(entry)

    # round 95: an earlier catalogue's entries this build does not make
    kept_from = []
    if args.keep:
        with io.open(os.path.join(args.keep, "catalogue.json"), encoding="utf-8") as f:
            old = json.load(f)
        have = {e["id"] for e in entries}
        have_ws = {e.get("workshop") for e in entries if e.get("workshop")}
        for e in old.get("mods", []):
            if e["id"] in have or (e.get("workshop") and e["workshop"] in have_ws):
                continue
            kept_from.append(dict(e))
        entries.extend(kept_from)

    entries, stranded = resolve_requires(entries, needs)
    left_out.extend(stranded)
    pk_biggest = 0
    for e in sorted(entries, key=lambda e: e["id"]):
        mid, n = e["id"], e["parts"]
        if mid in packed_src:
            folder, meta = packed_src[mid]
            os.makedirs(pk_dir, exist_ok=True)
            info = pack_mod(folder, pk_dir, mid, dict(meta, workshop=e.get("workshop")), boot=boot, target_mib=args.pack_mib)
            checked, bad, largest = verify_packed(folder, pk_dir, info["index"])
            if bad:
                print("  %s: the round trip out of the packs FAILED (%d mismatch(es))" % (e["name"], bad))
                return 1
            e.update({"bytes": info["storedBytes"], "unpacked": info["unpacked"], "files": info["files"],
                      "packed": {"base": "pk", "index": info["index"], "indexBytes": info["indexBytes"],
                                 "eagerBytes": info["eagerBytes"], "storedBytes": info["storedBytes"]}})
            pk_biggest = max(pk_biggest, largest)
            total += e["bytes"]
            print("  %-46s %-10s packed: %d pack(s), %s now, largest %d bytes, %d file(s) (%d aliases) round-tripped%s"
                  % (e["name"][:46], human(e["bytes"]), info["packs"], human(info["eagerBytes"] + info["indexBytes"]),
                     largest, checked, info["aliases"], " requires %s" % ",".join(e["requires"]) if e.get("requires") else ""))
            continue
        if e.get("packed") and args.keep:
            # an earlier catalogue's packed entry: its index and every pack it names
            os.makedirs(pk_dir, exist_ok=True)
            src_pk = os.path.join(args.keep, "pk")
            with open(os.path.join(src_pk, e["packed"]["index"]), "rb") as f:
                ix = json.loads(gzip.decompress(f.read()))
            for fname in [e["packed"]["index"]] + [p[0] for p in ix["packs"]]:
                shutil.copyfile(os.path.join(src_pk, fname), os.path.join(pk_dir, fname))
                pk_biggest = max(pk_biggest, os.path.getsize(os.path.join(pk_dir, fname)))
            total += e["bytes"]
            print("  %-46s %-10s packed, kept from %s" % (e["name"][:46], human(e["bytes"]), args.keep))
            continue
        if mid in blobs:
            blob, skipped = blobs[mid]
            for i in range(n):
                with open(os.path.join(args.out, "m", "%s.%d.bin" % (mid, i)), "wb") as f:
                    f.write(blob[i * part:(i + 1) * part])
            note = ", %d skipped" % skipped if skipped else ""
        else:
            for i in range(n):
                shutil.copyfile(os.path.join(args.keep, "m", "%s.%d.bin" % (mid, i)),
                                os.path.join(args.out, "m", "%s.%d.bin" % (mid, i)))
            note = ", kept from %s" % args.keep
        total += e["bytes"]
        print("  %-46s %-10s %2d part(s), %d file(s)%s%s"
              % (e["name"][:46], human(e["bytes"]), n, e.get("files", 0),
                 " requires %s" % ",".join(e["requires"]) if e.get("requires") else "", note))
    entries.sort(key=lambda e: e["id"])

    catalogue = {"version": 1, "base": args.base or None, "mods": entries}
    with io.open(os.path.join(args.out, "catalogue.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(catalogue, f, indent=1, ensure_ascii=False)
        f.write("\n")
    biggest = max((os.path.getsize(os.path.join(args.out, "m", f))
                   for f in os.listdir(os.path.join(args.out, "m"))), default=0)
    print("catalogue: %d mod(s), %s in %d part(s), largest part %s"
          % (len(entries), human(total), sum(e["parts"] for e in entries), human(biggest)))
    if biggest > 20 * MIB:
        print("  WARNING: a part is over 20 MB and jsDelivr will refuse it")
        return 1
    if pk_biggest:
        print("packed: largest stored file %d bytes (limit %d)" % (pk_biggest, STORED_LIMIT))
        if pk_biggest >= STORED_LIMIT:
            return 1
    for name, why in left_out:
        print("  left out: %-40s %s" % (name[:40], why))
    return 0


if __name__ == "__main__":
    sys.exit(main())
