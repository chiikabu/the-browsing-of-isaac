#!/usr/bin/env python3
"""Portable builds of the shipping dist: one page that carries the game.

Two shapes:

  chunks   a small page plus the payload in a handful of large files, so it can be
           served from any static host -- a GitHub repo through jsDelivr, an object
           store, a directory. The payload is split by how it is read, not by size:

             part A   the module, the memory image and the archives the boot seeds
                      whole. Always read entire, so each piece is stored gzipped and
                      fetched whole (the module alone is 49 MB raw, 7 MB gzipped).
             part B   the four archives the engine reads as 1 MiB windows. Stored
                      raw in a few large chunks and read with HTTP range requests,
                      so a window costs a window however big the chunk is.

           If a host ignores the range and sends the whole chunk the page notices
           (200 rather than 206), slices it itself and stops asking for ranges.

  offline  one .html with the whole payload inline as base64 and no network at all.
           The pieces are small there because the count costs nothing, and they are
           spread over several scripts: V8 will not compile a source longer than
           about 512 MB and says nothing when it declines.

Neither build changes the engine or the module: the page takes its bytes from
`window.isaacPortable` instead of a server (play.mjs, round 70).

usage:
  portable.py chunks  <dist> <out-dir> [--base URL] [--chunks 12] [--skip videos.a]
  portable.py offline <dist> <out.html>             [--piece-mib 8] [--skip videos.a]
"""
from __future__ import annotations

import argparse
import base64
import gzip
import json
import os
import shutil
import sys

MIB = 1 << 20
PAGE = "play.html"
TOP_FILES = ("boot.wasm", "isaac.segs.bin", "boot-trail.json")
MODULES = ("boot.mjs", "boot_web.mjs", "menu_overlay.mjs", "zip.mjs", "mods.mjs", "play.mjs")
# the archives the engine reads as 1 MiB windows (boot_web.mjs LAZY_ARCHIVES)
WINDOWED = ("resources/packed/music.a", "resources/packed/videos.a",
            "resources/packed/afterbirth.a", "resources/packed/afterbirthp.a")
SCRIPT_BYTES = 48 << 20        # one inline script's worth of base64
WINDOW = MIB                   # the engine's window, and the range granularity


def human(n: int) -> str:
    return "%.1f MB" % (n / 1048576.0) if n >= 1048576 else "%.1f KB" % (n / 1024.0)


def read(path: str) -> bytes:
    with open(path, "rb") as f:
        return f.read()


def plan(dist: str, skip: set[str]) -> list[dict]:
    """Every payload file the page can ask for, keyed by the engine's own name.

    play.mjs strips the `instance/` prefix off a pipeline URL before it asks, so the
    key is `resources/packed/x.a`; dist.json's own path is kept beside it.
    """
    out = []
    for rel in TOP_FILES:
        p = os.path.join(dist, rel)
        if os.path.isfile(p):
            out.append({"rel": rel, "path": p, "size": os.path.getsize(p), "dist": rel})
    index = json.loads(read(os.path.join(dist, "instance_index.json")).decode("utf-8"))
    for e in index:
        if os.path.basename(e["p"]) in skip:
            continue
        p = os.path.join(dist, "instance", e["p"].replace("/", os.sep))
        if os.path.isfile(p):
            out.append({"rel": e["p"], "path": p, "size": os.path.getsize(p),
                        "dist": "instance/" + e["p"], "instance": e["p"]})
    return out


def split_parts(files: list[dict]) -> tuple[list[dict], list[dict]]:
    """(read whole, read as windows)."""
    return ([f for f in files if f["rel"] not in WINDOWED],
            [f for f in files if f["rel"] in WINDOWED])


def lay_out(part: list[dict], table: dict, stream: int, align: int = 1) -> int:
    """Give every file its offset in `stream`'s byte run. Returns the run's length.

    A windowed file is aligned to the window, so a 1 MiB read at a 1 MiB offset is
    always inside one chunk and can be fetched as a plain range. The padding is under
    3 MB across the four archives.
    """
    at = 0
    for f in part:
        if align > 1 and at % align:
            at += align - (at % align)
        f["at"] = at
        table[f["rel"]] = {"size": f["size"], "s": stream, "at": at}
        at += f["size"]
    return at


def cut(part: list[dict], size: int, emit) -> int:
    """Walk the part's byte run and hand it out `size` bytes at a time."""
    buf, n = bytearray(), 0
    at = 0
    for f in part:
        if "at" in f and f["at"] > at:                 # the alignment gap, as zeroes
            buf += b"\0" * (f["at"] - at)
            at = f["at"]
        with open(f["path"], "rb") as fh:
            while True:
                b = fh.read(1 << 20)
                if not b:
                    break
                buf += b
                at += len(b)
                while len(buf) >= size:
                    emit(n, bytes(buf[:size])); n += 1
                    del buf[:size]
    if buf:
        emit(n, bytes(buf)); n += 1
    return n


def index_for(dist: str, files: list[dict]) -> list[dict]:
    have = {f["instance"] for f in files if "instance" in f}
    index = json.loads(read(os.path.join(dist, "instance_index.json")).decode("utf-8"))
    return [e for e in index if e["p"] in have]


def manifest_for(dist: str, files: list[dict]) -> dict:
    try:
        m = json.loads(read(os.path.join(dist, "dist.json")).decode("utf-8"))
    except Exception:
        m = {}
    keep = {f["dist"] for f in files}
    m["files"] = [f for f in (m.get("files") or []) if f.get("path") in keep]
    return m


def page_source(dist: str) -> str:
    return read(os.path.join(dist, PAGE)).decode("utf-8")


PROVIDER_JS = r"""
(function () {
  var P = window.__isaacPortableData;
  var S = P.streams;                                  // one per byte run: {tag,size,gz}
  var cache = new Map(), inline = P.blobs || null, ranges = true;
  function decode(b) {
    return (typeof Uint8Array.fromBase64 === 'function')
      ? Uint8Array.fromBase64(b)
      : (function () { var s = atob(b), a = new Uint8Array(s.length); for (var k = 0; k < s.length; k++) a[k] = s.charCodeAt(k); return a; })();
  }
  // the pieces a read of [a,b) in stream s touches
  function span(s, a, b) {
    var st = S[s], parts = [], o = 0;
    for (var pos = a; pos < b;) {
      var i = Math.floor(pos / st.size), within = pos % st.size;
      var take = Math.min(st.size - within, b - pos);
      parts.push({ s: s, i: i, within: within, take: take, at: o });
      o += take; pos += take;
    }
    return parts;
  }
  function name(s, i) { return P.base + '/' + S[s].tag + i + '.bin'; }
  async function piece(s, i) {
    var key = s + ':' + i, hit = cache.get(key);
    if (hit) return hit;
    var r = await fetch(name(s, i));
    if (!r.ok) throw new Error('piece ' + key + ': HTTP ' + r.status);
    var u = S[s].gz
      ? new Uint8Array(await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())
      : new Uint8Array(await r.arrayBuffer());
    cache.set(key, u);
    if (cache.size > 6) cache.delete(cache.keys().next().value);
    return u;
  }
  async function ranged(p) {
    // a window is a byte range inside a large chunk, so the chunk's size costs
    // nothing; a host that ignores Range answers 200 and we slice it ourselves
    if (!ranges) return (await piece(p.s, p.i)).subarray(p.within, p.within + p.take);
    var r = await fetch(name(p.s, p.i), { headers: { Range: 'bytes=' + p.within + '-' + (p.within + p.take - 1) } });
    if (!r.ok) throw new Error('range ' + p.s + ':' + p.i + ': HTTP ' + r.status);
    var u = new Uint8Array(await r.arrayBuffer());
    if (r.status !== 206 || u.length !== p.take) {
      ranges = false;                                  // this host does not do ranges
      cache.set(p.s + ':' + p.i, u);
      return u.subarray(p.within, p.within + p.take);
    }
    return u;
  }
  async function gather(parts) {
    var total = parts.reduce(function (n, p) { return n + p.take; }, 0);
    var out = new Uint8Array(total), next = 0;
    async function worker() {
      for (;;) {
        var k = next++;
        if (k >= parts.length) return;
        var p = parts[k];
        var bytes = S[p.s].gz ? (await piece(p.s, p.i)).subarray(p.within, p.within + p.take) : await ranged(p);
        out.set(bytes, p.at);
      }
    }
    var crew = [];
    for (var w = 0; w < Math.min(6, parts.length); w++) crew.push(worker());
    await Promise.all(crew);
    return out;
  }
  function locate(rel, off, len) {
    var f = P.files[rel];
    if (!f) return null;
    var end = len ? Math.min(off + len, f.size) : f.size;
    return span(f.s, f.at + off, f.at + end);
  }
  // one question, before any window is handed out as a range: a host that ignores
  // Range would answer every 1 MiB read with a whole chunk
  async function probeRanges() {
    if (!P.base) return false;
    var b = S.findIndex(function (st) { return !st.gz; });
    if (b < 0) return false;
    try {
      var r = await fetch(name(b, 0), { headers: { Range: 'bytes=0-1' } });
      ranges = r.status === 206 && (await r.arrayBuffer()).byteLength === 2;
    } catch (e) { ranges = false; }
    return ranges;
  }
  window.isaacPortable = {
    manifest: P.manifest,
    index: P.index,
    trail: P.trail || null,
    status: P.status,
    ready: probeRanges(),
    ranges: function () { return ranges; },
    // a window inside one raw chunk is a URL with the range in its fragment; the
    // reader Worker strips it and sends a Range header (boot_web.mjs)
    urlFor: P.base ? function (rel, off, len) {
      if (!len || !ranges) return null;
      var parts = locate(rel, off, len);
      if (!parts || parts.length !== 1 || S[parts[0].s].gz) return null;
      var p = parts[0];
      return name(p.s, p.i) + '#r=' + p.within + '-' + (p.within + p.take - 1);
    } : null,
    bytesFor: P.base
      ? function (rel, off, len) { var p = locate(rel, off, len); return p ? gather(p) : null; }
      : function (rel, off, len) {
          var parts = locate(rel, off, len);
          if (!parts) return null;
          var total = parts.reduce(function (n, q) { return n + q.take; }, 0);
          var out = new Uint8Array(total);
          for (var k = 0; k < parts.length; k++) {
            var q = parts[k], key = q.s + ':' + q.i, u = cache.get(key);
            if (!u) { u = decode(inline[S[q.s].first + q.i]); cache.set(key, u); if (cache.size > 24) cache.delete(cache.keys().next().value); }
            out.set(u.subarray(q.within, q.within + q.take), q.at);
          }
          return out;
        },
  };
})();
"""

MODULE_LOADER_JS = r"""
(function () {
  // The page's modules import each other by relative path. Inline, each one is a
  // blob URL, and a blob's imports do not resolve relative to the page -- so the
  // sources are rewritten to import from the map before they are turned into blobs.
  var src = window.__isaacModules, url = {};
  var order = ['boot.mjs', 'menu_overlay.mjs', 'zip.mjs', 'mods.mjs', 'boot_web.mjs', 'play.mjs'];
  for (var i = 0; i < order.length; i++) {
    var name = order[i];
    var text = src[name].replace(/(["'])\.\/([A-Za-z0-9_.-]+\.mjs)\1/g, function (_m, _q, dep) {
      return JSON.stringify(url[dep] || './' + dep);
    });
    url[name] = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
  }
  var s = document.createElement('script');
  s.type = 'module';
  s.src = url['play.mjs'];
  document.body.appendChild(s);
})();
"""


def inject(html: str, head: str) -> str:
    i = html.index('<script type="module"')
    return html[:i] + head + "\n" + html[i:]


def inject_at_end(html: str, tail: str) -> str:
    i = html.rindex("</body>")
    return html[:i] + tail + "\n" + html[i:]


def cmd_chunks(args) -> int:
    files = plan(args.dist, set(args.skip or []))
    whole, windowed = split_parts(files)
    table = {}
    a_len = lay_out(whole, table, 0)
    b_len = lay_out(windowed, table, 1, WINDOW)
    out_dir = os.path.abspath(args.out)
    data_dir = os.path.join(out_dir, "c")
    os.makedirs(data_dir, exist_ok=True)
    for old in os.listdir(data_dir):
        os.remove(os.path.join(data_dir, old))

    # part A is fetched whole, so its pieces may be gzipped; part B is read by
    # range, so its chunks stay raw. The counts land on `--chunks` between them.
    a_pieces = max(1, min(max(1, args.chunks // 4), 4))
    b_pieces = max(1, args.chunks - a_pieces)
    a_size = ((a_len + a_pieces - 1) // a_pieces + MIB - 1) // MIB * MIB
    b_size = ((b_len + b_pieces - 1) // b_pieces + WINDOW - 1) // WINDOW * WINDOW
    written = [0]

    def emit_for(tag, gz):
        def emit(i, b):
            body = gzip.compress(b, 9, mtime=0) if gz else b
            with open(os.path.join(data_dir, "%s%d.bin" % (tag, i)), "wb") as f:
                f.write(body)
            written[0] += len(body)
        return emit

    n_a = cut(whole, a_size, emit_for("a", True))
    n_b = cut(windowed, b_size, emit_for("b", False))
    streams = [{"tag": "a", "size": a_size, "gz": True, "n": n_a},
               {"tag": "b", "size": b_size, "gz": False, "n": n_b}]
    data = {"streams": streams, "files": table, "base": args.base or "./c",
            "index": index_for(args.dist, files), "manifest": manifest_for(args.dist, files),
            "status": "loading…"}
    # the boot trail is small and boot_web.mjs asks for it by name: inline it so the
    # page needs nothing beside itself
    trail = os.path.join(args.dist, "boot-trail.json")
    if os.path.isfile(trail):
        data["trail"] = json.loads(read(trail).decode("utf-8"))
    head = ('<script>window.__isaacPortableData = ' + json.dumps(data, separators=(",", ":")) + ';</script>\n'
            '<script>' + PROVIDER_JS + '</script>')
    mods = {rel: read(os.path.join(args.dist, rel)).decode("utf-8") for rel in MODULES}
    tail = ('\n<script>window.__isaacModules = ' + json.dumps(mods) + ';</script>\n'
            '<script>' + MODULE_LOADER_JS + '</script>')
    html = page_source(args.dist).replace('<script type="module" src="./play.mjs"></script>', "")
    html = inject_at_end(inject_at_end(html, head), tail)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    raw = a_len + b_len
    print("chunks: %d files in %s (%s on disk, %s raw)" % (n_a + n_b, data_dir, human(written[0]), human(raw)))
    print("  read whole, gzipped : %d x %s  (%s)" % (n_a, human(a_size), human(a_len)))
    print("  read by range, raw  : %d x %s  (%s)" % (n_b, human(b_size), human(b_len)))
    print("  page %s (%s) -- the modules and the boot trail are in it, nothing else is needed"
          % (os.path.join(out_dir, "index.html"), human(len(html.encode("utf-8")))))
    print("  base URL: %s" % data["base"])
    if max(a_size, b_size) > 20 * MIB:
        print("  note: jsDelivr refuses a file over 20 MB; --chunks %d keeps every piece under it"
              % ((raw + 20 * MIB - 1) // (20 * MIB) + 2))
    return 0


def cmd_offline(args) -> int:
    files = plan(args.dist, set(args.skip or []))
    whole, windowed = split_parts(files)
    table = {}
    a_len = lay_out(whole, table, 0)
    b_len = lay_out(windowed, table, 1, WINDOW)
    piece = args.piece_mib * MIB
    blobs = []

    def emit(_i, b):
        blobs.append(base64.b64encode(b).decode("ascii"))

    n_a = cut(whole, piece, emit)
    n_b = cut(windowed, piece, emit)
    streams = [{"tag": "a", "size": piece, "gz": False, "n": n_a, "first": 0},
               {"tag": "b", "size": piece, "gz": False, "n": n_b, "first": n_a}]
    data = {"streams": streams, "files": table, "base": None,
            "index": index_for(args.dist, files), "manifest": manifest_for(args.dist, files),
            "status": "loading… (this page carries the game)"}
    parts = ['<script>window.__isaacPortableData = ' + json.dumps(data, separators=(",", ":")) + ';',
             'window.__isaacPortableData.blobs = [];</script>\n']
    state = {"budget": 0, "group": [], "groups": 0}

    def flush():
        if not state["group"]:
            return
        parts.append('<script>window.__isaacPortableData.blobs.push('
                     + ",".join('"%s"' % x for x in state["group"]) + ');</script>\n')
        state["groups"] += 1
        state["budget"], state["group"] = 0, []

    for b in blobs:
        state["group"].append(b)
        state["budget"] += len(b) + 3
        if state["budget"] >= SCRIPT_BYTES:
            flush()
    flush()
    parts.append('<script>' + PROVIDER_JS + '</script>')
    mods = {rel: read(os.path.join(args.dist, rel)).decode("utf-8") for rel in MODULES}
    parts.append('\n<script>window.__isaacModules = ' + json.dumps(mods) + ';</script>\n'
                 '<script>' + MODULE_LOADER_JS + '</script>')
    html = page_source(args.dist).replace('<script type="module" src="./play.mjs"></script>', "")
    html = inject_at_end(html, "".join(parts))
    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    print("offline: %s (%s), %s of payload in %d pieces across %d scripts"
          % (out, human(os.path.getsize(out)), human(a_len + b_len), n_a + n_b, state["groups"]))
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("chunks")
    p.add_argument("dist"); p.add_argument("out")
    p.add_argument("--chunks", type=int, default=12, help="how many files the payload becomes (default 12)")
    p.add_argument("--base", help="where the chunks will be served from (default ./c)")
    p.add_argument("--skip", nargs="*", help="archive file names to leave out")
    p.set_defaults(fn=cmd_chunks)
    p = sub.add_parser("offline")
    p.add_argument("dist"); p.add_argument("out")
    p.add_argument("--piece-mib", type=int, default=8, help="inline piece size (the count costs nothing here)")
    p.add_argument("--skip", nargs="*", help="archive file names to leave out")
    p.set_defaults(fn=cmd_offline)
    args = ap.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
