#!/usr/bin/env python3
"""Size work on the packed archives, on top of archive.py.

  census   what each archive holds, by sniffed content type and catalogue membership
  png      lossless PNG recompression (oxipng, every reduction OFF, all chunks kept, IHDR and
           decoded pixels verified identical with Pillow) -> a new archive, same table order
  music    re-encode the catalogued music OGGs (music.xml) at a lower Vorbis quality with
           ffmpeg, comments preserved (-map_metadata 0), verified with ffprobe -> a new archive;
           --source <pristine.a> takes the bytes to encode from there (no generational loss when
           re-encoding an archive that already carries an earlier pass)
  sfx      measure the catalogued WAV samples (sounds.xml): PCM totals, what a sample-rate /
           bit-depth reduction or an OGG re-encode would save (report only)

Nothing binary-derived is embedded here.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import struct
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import archive as ar  # noqa: E402

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


# ---------------------------------------------------------------------------
# sniffing + catalogues
# ---------------------------------------------------------------------------

def sniff(data: bytes) -> str:
    if data[:8] == PNG_MAGIC:
        return "png"
    if data[:4] == b"OggS":
        head = data[:128]
        if b"vorbis" in head:
            return "ogg-vorbis"
        if b"theora" in head:
            return "ogv-theora"
        return "ogg"
    if data[:4] == b"RIFF" and data[8:12] == b"WAVE":
        return "wav"
    if data[:3] == b"\xef\xbb\xbf":
        data = data[3:]
    s = data[:64].lstrip()
    if s.startswith(b"<"):
        return "anm2" if b"AnimatedActor" in data[:512] else "xml"
    if data[:3] == b"BMF":
        return "fnt"
    if data[:4] == b"ANM2" or data[:4] == b"ANIM":
        return "anm-bin"
    try:
        data[:256].decode("utf-8")
        return "text"
    except UnicodeDecodeError:
        return "other"


def wav_info(data: bytes) -> dict | None:
    """channels, rate, bits, data bytes of a RIFF/WAVE."""
    if data[:4] != b"RIFF" or data[8:12] != b"WAVE":
        return None
    pos = 12
    info = {}
    while pos + 8 <= len(data):
        cid = data[pos:pos + 4]
        ln, = struct.unpack_from("<I", data, pos + 4)
        if cid == b"fmt " and ln >= 16:
            fmt, ch, rate, _br, _ba, bits = struct.unpack_from("<HHIIHH", data, pos + 8)
            info.update(format=fmt, channels=ch, rate=rate, bits=bits)
        elif cid == b"data":
            info["data"] = min(ln, len(data) - pos - 8)
        pos += 8 + ln + (ln & 1)
    return info if "data" in info and "rate" in info else None


def catalogue_keys(xml_path: str, attrs: tuple[str, ...], prefix: str) -> dict[tuple[int, int], str]:
    txt = open(xml_path, encoding="utf-8", errors="replace").read()
    out = {}
    for attr in attrs:
        for p in re.findall(r'\b%s="([^"]+)"' % attr, txt):
            out[ar.key_of(ar.resource_key(prefix + p))] = prefix + p
    return out


def sfx_catalogue(sounds_xml: str) -> dict[tuple[int, int], str]:
    return catalogue_keys(sounds_xml, ("path",), "sfx/")


def music_catalogue(music_xml: str) -> dict[tuple[int, int], str]:
    return catalogue_keys(music_xml, ("path", "intro", "layer", "layerintro"), "music/")


def human(n: float) -> str:
    return "%.1f MB" % (n / 1048576) if abs(n) >= 1048576 else "%d B" % n


# ---------------------------------------------------------------------------
# census
# ---------------------------------------------------------------------------

def cmd_census(args) -> int:
    sfx = sfx_catalogue(args.sounds) if args.sounds else {}
    music = music_catalogue(args.music) if args.music else {}
    report = []
    for path in args.archive:
        with ar.Archive(path) as a:
            kinds: dict[str, list[int]] = {}
            cat = {"sfx": [0, 0], "music": [0, 0]}
            for e in a.entries:
                data = a.decode(e)
                k = sniff(data)
                off, ln = a.raw_extent(e)
                row = kinds.setdefault(k, [0, 0, 0])
                row[0] += 1
                row[1] += len(data)
                row[2] += ln
                if e.key in sfx:
                    cat["sfx"][0] += 1
                    cat["sfx"][1] += len(data)
                if e.key in music:
                    cat["music"][0] += 1
                    cat["music"][1] += len(data)
            print("%s: version %d, %d entries, file %s" % (os.path.basename(path), a.version, a.count, human(len(a.buf))))
            for k, (n, dec, packed) in sorted(kinds.items(), key=lambda kv: -kv[1][2]):
                print("   %-12s %6d entries  decoded %10s  packed %10s" % (k, n, human(dec), human(packed)))
            print("   catalogued: %d sfx samples (%s), %d music tracks (%s)" % (
                cat["sfx"][0], human(cat["sfx"][1]), cat["music"][0], human(cat["music"][1])))
            report.append({"archive": os.path.basename(path), "version": a.version, "entries": a.count,
                           "file_bytes": len(a.buf), "kinds": kinds, "catalogued": cat})
    if args.json:
        json.dump(report, open(args.json, "w"), indent=1)
    return 0


# ---------------------------------------------------------------------------
# png
# ---------------------------------------------------------------------------

def _png_check(orig: bytes, new: bytes) -> str:
    """IHDR byte-identical (width, height, bit depth, colour type, interlace) and the decoded
    samples identical; palette + tRNS identical for indexed images; RGBA identical as well."""
    from PIL import Image
    if orig[8:33] != new[8:33]:
        return "IHDR differs"
    i1 = Image.open(io.BytesIO(orig))
    i2 = Image.open(io.BytesIO(new))
    i1.load()
    i2.load()
    if i1.mode != i2.mode or i1.size != i2.size:
        return "mode/size differ"
    if i1.tobytes() != i2.tobytes():
        return "samples differ"
    if i1.mode == "P" and (i1.getpalette() != i2.getpalette() or i1.info.get("transparency") != i2.info.get("transparency")):
        return "palette differs"
    if i1.info.get("gamma") != i2.info.get("gamma"):
        return "gamma differs"
    if i1.convert("RGBA").tobytes() != i2.convert("RGBA").tobytes():
        return "rgba differs"
    return "ok"


_PNG_LEVEL = 4


def _png_worker(task):
    idx, data = task
    import oxipng
    try:
        out = oxipng.optimize_from_memory(
            data, level=_PNG_LEVEL, deflate=oxipng.Deflaters.libdeflater(12), strip=oxipng.StripChunks.none(),
            bit_depth_reduction=False, color_type_reduction=False, palette_reduction=False,
            grayscale_reduction=False, interlace=None, optimize_alpha=False, fix_errors=False)
    except Exception as ex:
        return idx, None, "oxipng error: %s" % ex
    status = _png_check(data, out)
    if status != "ok":
        return idx, None, status
    if len(out) >= len(data):
        return idx, None, "not smaller"
    return idx, out, "ok"


def cmd_png(args) -> int:
    global _PNG_LEVEL
    _PNG_LEVEL = args.level
    t0 = time.time()
    with ar.Archive(args.archive) as a:
        tasks = []
        for e in a.entries:
            if e.size < 8:
                continue
            off, _ln = a.raw_extent(e)
            data = a.decode(e)
            if data[:8] == PNG_MAGIC:
                tasks.append((e.index, data))
        png_before = sum(len(d) for _i, d in tasks)
        replaced: dict[int, bytes] = {}
        statuses: dict[str, int] = {}
        failures = []
        if tasks:
            with ProcessPoolExecutor(max_workers=args.jobs) as ex:
                for idx, out, status in ex.map(_png_worker, tasks, chunksize=4):
                    statuses[status] = statuses.get(status, 0) + 1
                    if out is not None:
                        replaced[idx] = out
                    elif status not in ("ok", "not smaller"):
                        failures.append((idx, status))
        png_after = png_before - sum(len(d) for i, d in tasks if i in replaced) + sum(len(v) for v in replaced.values())
        items = []
        for e in a.entries:
            if e.index in replaced:
                items.append({"h1": e.h1, "h2": e.h2, "data": replaced[e.index]})
            else:
                items.append({"h1": e.h1, "h2": e.h2, "src": a, "entry": e})
        r = ar.write_archive(args.out, a.version, items, mode="auto")
        rep = {"archive": os.path.basename(args.archive), "out": args.out, "version": a.version, "entries": a.count,
               "png_entries": len(tasks), "png_replaced": len(replaced), "png_bytes_before": png_before,
               "png_bytes_after": png_after, "file_before": len(a.buf), "file_after": r["size"],
               "statuses": statuses, "failures": failures, "level": args.level, "seconds": round(time.time() - t0, 1)}
    print("%s: %d PNG entries, %d replaced; PNG bytes %s -> %s (%.1f%%); file %s -> %s (%.1f%%); statuses %s; %d identity failures; %.0f s" % (
        rep["archive"], rep["png_entries"], rep["png_replaced"], human(png_before), human(png_after),
        100.0 * png_after / png_before if png_before else 0, human(rep["file_before"]), human(rep["file_after"]),
        100.0 * rep["file_after"] / rep["file_before"], statuses, len(failures), rep["seconds"]))
    if args.json:
        json.dump(rep, open(args.json, "w"), indent=1)
    return 1 if failures else 0


# ---------------------------------------------------------------------------
# music
# ---------------------------------------------------------------------------

def ffprobe(path: str) -> dict:
    r = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path],
                       capture_output=True, text=True)
    return json.loads(r.stdout or "{}")


def _music_worker(task):
    idx, data, quality = task
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "in.ogg")
        dst = os.path.join(td, "out.ogg")
        with open(src, "wb") as f:
            f.write(data)
        p1 = ffprobe(src)
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-map_metadata", "0", "-map_metadata:s:a", "0:s:a",
                            "-c:a", "libvorbis", "-q:a", str(quality), dst], capture_output=True, text=True)
        if r.returncode != 0:
            return idx, None, "ffmpeg: %s" % r.stderr.strip()[:200], {}
        out = open(dst, "rb").read()
        p2 = ffprobe(dst)
        s1 = (p1.get("streams") or [{}])[0]
        s2 = (p2.get("streams") or [{}])[0]
        tags1 = {k.lower(): v for k, v in ((p1.get("format") or {}).get("tags") or {}).items()}
        tags1.update({k.lower(): v for k, v in (s1.get("tags") or {}).items()})
        tags2 = {k.lower(): v for k, v in ((p2.get("format") or {}).get("tags") or {}).items()}
        tags2.update({k.lower(): v for k, v in (s2.get("tags") or {}).items()})
        info = {"codec": s1.get("codec_name"), "rate": s1.get("sample_rate"), "channels": s1.get("channels"),
                "duration": float((p1.get("format") or {}).get("duration") or 0),
                "duration_after": float((p2.get("format") or {}).get("duration") or 0),
                "bit_rate": int((p1.get("format") or {}).get("bit_rate") or 0),
                "bit_rate_after": int((p2.get("format") or {}).get("bit_rate") or 0),
                "tags": tags1, "tags_after": tags2}
        if s1.get("codec_name") != "vorbis":
            return idx, None, "not vorbis: %s" % s1.get("codec_name"), info
        if s2.get("sample_rate") != s1.get("sample_rate") or s2.get("channels") != s1.get("channels"):
            return idx, None, "rate/channels changed", info
        lost = {k: v for k, v in tags1.items() if k not in ("encoder",) and tags2.get(k) != v}
        if lost:
            return idx, None, "comments lost: %s" % lost, info
        if abs(info["duration"] - info["duration_after"]) > 0.05:
            return idx, None, "duration drift %.3f s" % (info["duration_after"] - info["duration"]), info
        if len(out) >= len(data):
            return idx, None, "not smaller", info
        return idx, out, "ok", info


def cmd_music(args) -> int:
    t0 = time.time()
    music = music_catalogue(args.music)
    # --source <archive>: the bytes to encode come from this archive (the pristine
    # one, by key) while everything else passes through from `archive`. That is
    # how an already-optimised archive (PNG pass applied, music at one quality)
    # is re-encoded at another quality with no generational loss (round 28).
    src_arc = ar.Archive(args.source) if getattr(args, "source", None) else None
    from_source = 0
    with ar.Archive(args.archive) as a:
        tasks = []
        names = {}
        skipped_ogg = 0
        for e in a.entries:
            if e.key not in music:
                continue
            se = src_arc.by_key.get(e.key) if src_arc is not None else None
            if se is not None:
                data = src_arc.decode(se)
                from_source += 1
            else:
                data = a.decode(e)
            if sniff(data) != "ogg-vorbis":
                skipped_ogg += 1
                continue
            tasks.append((e.index, data, args.quality))
            names[e.index] = music[e.key]
        before = sum(len(d) for _i, d, _q in tasks)
        replaced = {}
        statuses = {}
        failures = []
        infos = {}
        with ThreadPoolExecutor(max_workers=args.jobs) as ex:
            for idx, out, status, info in ex.map(_music_worker, tasks):
                statuses[status] = statuses.get(status, 0) + 1
                infos[idx] = info
                if out is not None:
                    replaced[idx] = out
                elif status != "not smaller":
                    failures.append((idx, names.get(idx), status))
        after = before - sum(len(d) for i, d, _q in tasks if i in replaced) + sum(len(v) for v in replaced.values())
        items = []
        for e in a.entries:
            if e.index in replaced:
                items.append({"h1": e.h1, "h2": e.h2, "data": replaced[e.index]})
            else:
                items.append({"h1": e.h1, "h2": e.h2, "src": a, "entry": e})
        r = ar.write_archive(args.out, a.version, items, mode="auto")
        tagkeys = {}
        for info in infos.values():
            for k in info.get("tags", {}):
                tagkeys[k] = tagkeys.get(k, 0) + 1
        rates = {}
        for info in infos.values():
            key = "%s Hz x%s" % (info.get("rate"), info.get("channels"))
            rates[key] = rates.get(key, 0) + 1
        rep = {"archive": os.path.basename(args.archive), "out": args.out, "quality": args.quality,
               "source": args.source if src_arc is not None else None, "from_source": from_source,
               "music_entries": len(tasks), "replaced": len(replaced), "bytes_before": before, "bytes_after": after,
               "file_before": len(a.buf), "file_after": r["size"], "statuses": statuses, "failures": failures,
               "comment_keys": tagkeys, "formats": rates, "seconds": round(time.time() - t0, 1),
               "tracks": [{"index": i, "name": names.get(i), "before": len(d), "after": len(replaced.get(i, d)),
                           "bit_rate": infos[i].get("bit_rate"), "bit_rate_after": infos[i].get("bit_rate_after"),
                           "duration": infos[i].get("duration")} for i, d, _q in tasks]}
    if src_arc is not None:
        src_arc.close()
    print("%s: %d catalogued music OGGs (%d catalogued non-vorbis skipped%s), %d replaced at q%s; bytes %s -> %s (%.1f%%); file %s -> %s; statuses %s; comment keys %s; formats %s; %d failures; %.0f s" % (
        rep["archive"], len(tasks), skipped_ogg,
        ", %d taken from %s" % (from_source, os.path.basename(args.source)) if src_arc is not None else "",
        len(replaced), args.quality, human(before), human(after),
        100.0 * after / before if before else 0, human(rep["file_before"]), human(rep["file_after"]), statuses,
        tagkeys, rates, len(failures), rep["seconds"]))
    if args.json:
        json.dump(rep, open(args.json, "w"), indent=1)
    return 1 if failures else 0


# ---------------------------------------------------------------------------
# sfx measurement
# ---------------------------------------------------------------------------

def _ogg_size_worker(task):
    idx, data, quality = task
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "in.wav")
        dst = os.path.join(td, "out.ogg")
        with open(src, "wb") as f:
            f.write(data)
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-c:a", "libvorbis", "-q:a", str(quality), dst],
                           capture_output=True, text=True)
        if r.returncode != 0:
            return idx, -1
        return idx, os.path.getsize(dst)


def cmd_sfx(args) -> int:
    sfx = sfx_catalogue(args.sounds)
    serving: dict[tuple[int, int], tuple[str, ar.Entry, ar.Archive]] = {}
    arcs = []
    for path in args.archive:  # mount order: the last archive holding a key serves it
        a = ar.Archive(path)
        arcs.append(a)
        for e in a.entries:
            if e.key in sfx:
                serving[e.key] = (os.path.basename(path), e, a)
    print("catalogued samples: %d, found: %d, missing: %d" % (len(sfx), len(serving), len(sfx) - len(serving)))
    per_arc: dict[str, list[int]] = {}
    fmts: dict[str, list[int]] = {}
    total_pcm = 0
    total_file = 0
    tasks = []
    infos = {}
    for key, (name, e, a) in serving.items():
        data = a.decode(e)
        w = wav_info(data)
        row = per_arc.setdefault(name, [0, 0, 0])
        row[0] += 1
        row[1] += len(data)
        row[2] += a.raw_extent(e)[1]
        total_file += len(data)
        if not w:
            fmts.setdefault("not-wav:%s" % sniff(data), [0, 0])[0] += 1
            continue
        f = "%d Hz %d-bit x%d" % (w["rate"], w["bits"], w["channels"])
        fr = fmts.setdefault(f, [0, 0])
        fr[0] += 1
        fr[1] += w["data"]
        total_pcm += w["data"]
        infos[e.index, name] = w
        tasks.append((len(tasks), data, args.quality))
    print("serving archives (mount order): %s" % {k: {"samples": v[0], "decoded": human(v[1]), "packed": human(v[2])} for k, v in per_arc.items()})
    print("WAV formats: %s" % {k: {"samples": v[0], "pcm": human(v[1])} for k, v in fmts.items()})
    print("total WAV bytes %s, PCM payload %s (this is what the engine preloads)" % (human(total_file), human(total_pcm)))
    # (iii) analytic reductions
    def reduced(rate_max, bits, mono):
        tot = 0
        for w in infos.values():
            frames = w["data"] // max(1, (w["bits"] // 8) * w["channels"])
            r = min(w["rate"], rate_max)
            frames = frames * r // w["rate"]
            tot += frames * (bits // 8) * (1 if mono else w["channels"])
        return tot
    for label, r, b, m in [("<= 22050 Hz, same bits/channels", 22050, 16, False), ("16-bit -> 8-bit", 10 ** 9, 8, False),
                           ("mono", 10 ** 9, 16, True), ("<= 22050 Hz + mono", 22050, 16, True)]:
        print("  (iii) %-34s PCM %s (%.1f%%)" % (label, human(reduced(r, b, m)), 100.0 * reduced(r, b, m) / max(1, total_pcm)))
    if args.sample:
        tasks = tasks[:args.sample]
    if tasks:
        t0 = time.time()
        sizes = {}
        with ThreadPoolExecutor(max_workers=args.jobs) as ex:
            for idx, sz in ex.map(_ogg_size_worker, tasks):
                sizes[idx] = sz
        ok = [s for s in sizes.values() if s >= 0]
        src_bytes = sum(len(d) for i, d, _q in tasks if sizes.get(i, -1) >= 0)
        print("  (ii)  OGG Vorbis q%s for %d samples: WAV %s -> OGG %s (%.1f%%) in %.0f s%s" % (
            args.quality, len(ok), human(src_bytes), human(sum(ok)), 100.0 * sum(ok) / max(1, src_bytes), time.time() - t0,
            "" if len(tasks) == len(infos) else " (sample of %d; scale by %d/%d)" % (len(tasks), len(infos), len(tasks))))
    for a in arcs:
        a.close()
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("census"); p.add_argument("archive", nargs="+"); p.add_argument("--sounds"); p.add_argument("--music"); p.add_argument("--json")
    p.set_defaults(fn=cmd_census)
    p = sub.add_parser("png"); p.add_argument("archive"); p.add_argument("out"); p.add_argument("--jobs", type=int, default=8)
    p.add_argument("--level", type=int, default=4); p.add_argument("--json")
    p.set_defaults(fn=cmd_png)
    p = sub.add_parser("music"); p.add_argument("archive"); p.add_argument("out"); p.add_argument("--music", required=True)
    p.add_argument("--quality", default="3"); p.add_argument("--jobs", type=int, default=6); p.add_argument("--json")
    p.add_argument("--source", help="archive to take the pristine music bytes from (by key); the rest passes through from `archive`")
    p.set_defaults(fn=cmd_music)
    p = sub.add_parser("sfx"); p.add_argument("archive", nargs="+"); p.add_argument("--sounds", required=True)
    p.add_argument("--quality", default="3"); p.add_argument("--jobs", type=int, default=8); p.add_argument("--sample", type=int, default=0)
    p.set_defaults(fn=cmd_sfx)
    args = ap.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
