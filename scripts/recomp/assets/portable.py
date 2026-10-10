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
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.parse
import urllib.request

MIB = 1 << 20
PAGE = "play.html"
TOP_FILES = ("boot.wasm", "isaac.segs.bin", "boot-trail.json")
MODULES = ("boot.mjs", "boot_web.mjs", "gamepad.mjs", "menu_overlay.mjs", "zip.mjs", "mod_browser.mjs", "mods.mjs", "touch_input.mjs", "touch_game.mjs", "touch_controls.mjs", "play.mjs")
# the archives the engine reads as 1 MiB windows (boot_web.mjs LAZY_ARCHIVES)
WINDOWED = ("resources/packed/music.a", "resources/packed/videos.a",
            "resources/packed/afterbirth.a", "resources/packed/afterbirthp.a")
SCRIPT_BYTES = 48 << 20        # one inline script's worth of base64
WINDOW = MIB                   # the engine's window, and the range granularity
# Window recipes (recipe.py): a window of a version-0 archive shipped as its entries' plain
# bytes, PCM coded losslessly, rebuilt by isaacRecipeDecode. The page defines the function
# globally ahead of the provider, which hands its source text to the reader Worker too.
RECIPE_JS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web", "recipe.js"),
                 encoding="utf-8").read()
LOADER_GIF_NAME = "loader-isaac.gif"
LOADER_GIF_CACHE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..",
                                             ".scratch", "loader-assets"))


def keystream_key(seed: bytes) -> bytes:
    """A 256-byte table from a build seed. Not a cipher: a way to stop a chunk on
    a CDN from announcing what it is."""
    import hashlib
    out = bytearray()
    h = seed
    while len(out) < 256:
        h = hashlib.sha256(h).digest()
        out += h
    return bytes(out[:256])


def catalogue_script(args) -> str:
    """Round 81: where the mod browser looks.

    `createModsMenu` offers the MOD BROWSER row only when it has a catalogue base,
    which it takes from `?catalogue=` or from `window.isaacModCatalogue`. A built
    page had neither, so the row was never there -- the browser worked and was
    unreachable. `--catalogue` writes the second one in.
    """
    url = getattr(args, "catalogue", None)
    if not url:
        return ""
    return "<script>window.isaacModCatalogue = %s;</script>\n" % json.dumps(url.rstrip("/"))


def scramble(data: bytes, pos: int, key: bytes) -> bytes:
    """XOR `data`, which starts at `pos` in its stream. Reversible from any
    offset, which a range read needs."""
    if not key:
        return data
    out = bytearray(data)
    for i in range(len(out)):
        at = pos + i
        out[i] ^= key[at & 0xFF] ^ ((at >> 8) & 0xFF)
    return bytes(out)


def minify_js(src: str) -> str:
    """Comments and the whitespace between tokens, gone. Nothing renamed.

    A mode stack rather than a regex or a counter: `//` inside a string is not a
    comment, a `/` after a value is division and after an operator is a regular
    expression, and a template substitution may contain an object literal, a
    string with a brace in it, or another template. Counting braces gets that
    wrong; a stack does not.
    """
    ID = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$")
    VALUE_END = ID | set(")]}\"'`")          # after one of these, `/` is division
    out = []
    stack = []                                # 'tpl' = inside a template, 'sub' = inside its ${}
    i, n = 0, len(src)
    prev = ""

    def emit(text, last=None):
        out.append(text)
        return last if last is not None else (text[-1] if text else prev)

    while i < n:
        c = src[i]
        # inside a template literal, everything is verbatim until ` or ${
        if stack and stack[-1] == "tpl":
            if c == "\\":
                prev = emit(src[i:i + 2], "`"); i += 2; continue
            if c == "`":
                stack.pop(); prev = emit(c, "`"); i += 1; continue
            if c == "$" and src[i + 1:i + 2] == "{":
                stack.append("sub"); prev = emit("${", "{"); i += 2; continue
            prev = emit(c, "`"); i += 1; continue
        two = src[i:i + 2]
        if two == "//":
            while i < n and src[i] != "\n":
                i += 1
            continue
        if two == "/*":
            j = src.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in "\"'":
            j = i + 1
            while j < n:
                if src[j] == "\\":
                    j += 2; continue
                if src[j] == c:
                    break
                j += 1
            prev = emit(src[i:j + 1], c); i = j + 1; continue
        if c == "`":
            stack.append("tpl"); prev = emit(c, "`"); i += 1; continue
        if c == "}" and stack and stack[-1] == "sub":
            stack.pop(); prev = emit("}", "}"); i += 1; continue
        if c == "/":
            if prev in VALUE_END:
                prev = emit(c); i += 1; continue
            j, cls = i + 1, False
            while j < n:
                if src[j] == "\\":
                    j += 2; continue
                if src[j] == "[":
                    cls = True
                elif src[j] == "]":
                    cls = False
                elif src[j] == "/" and not cls:
                    break
                elif src[j] == "\n":
                    break
                j += 1
            while j + 1 < n and src[j + 1] in "gimsuyd":
                j += 1
            prev = emit(src[i:j + 1], "/"); i = j + 1; continue
        if c in " \t\r\n":
            j = i
            while j < n and src[j] in " \t\r\n":
                j += 1
            nxt = src[j] if j < n else ""
            if prev in ID and nxt in ID:
                out.append(" ")
            elif "\n" in src[i:j] and prev and nxt and prev not in "{(,;=+-*/%&|!?:<>~^[" and nxt not in "})],;.=+*/%&|?:<>":
                out.append("\n")
            i = j
            continue
        prev = emit(c); i += 1
    return "".join(out)


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
    # The menus' own art. ship.py keeps page-assets out of the index on purpose,
    # because the pipeline must not seed the page's files into the guest file
    # system -- but the page still asks for them by name through readAsset, and a
    # build without them has menus that open onto nothing.
    assets = os.path.join(dist, "instance", "page-assets")
    have = {f["rel"] for f in out}
    if os.path.isdir(assets):
        for name in sorted(os.listdir(assets)):
            q = os.path.join(assets, name)
            rel = "page-assets/" + name
            if os.path.isfile(q) and rel not in have:
                out.append({"rel": rel, "path": q, "size": os.path.getsize(q),
                            "dist": "instance/" + rel, "instance": rel})
    return out


def _recipe_windows(windowed: list[dict], b_len: int, rels: list[str]):
    """window index -> recipe bytes for the windows of the named version-0 archives (None
    for every other window). Files are window-aligned (lay_out), so a window belongs to one
    file; its tail past the file's end is the zero padding before the next one."""
    if not rels:
        return None
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import recipe as R
    want = set(rels)
    missing = want - {f["rel"] for f in windowed}
    if missing:
        raise SystemExit("--recipe names no windowed file: %s" % ", ".join(sorted(missing)))
    spans = []
    for f in windowed:
        if f["rel"] in want:
            arch = R.V0Archive(f["path"])
            if arch.size != f["size"]:
                raise SystemExit("%s: archive is %d bytes, the layout says %d" % (f["rel"], arch.size, f["size"]))
            spans.append((f["at"], f["size"], arch, R._KeyCache()))

    def recipe_for(i: int):
        start = i * WINDOW
        for at, size, arch, keys in spans:
            if at <= start < at + size:
                lo = start - at
                hi = min(size, lo + WINDOW)
                tail = min(WINDOW, b_len - start) - (hi - lo)
                return R.window_recipe(arch, arch.a.buf, lo, hi, keys, tail)
        return None
    return recipe_for


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


class WindowPacker:
    """Round 89: a chunk whose windows are each compressed on their own.

    The ranged half shipped raw because a window is a byte range inside a large
    chunk and a range cannot be taken out of a deflate stream. Compressing each
    1 MiB window SEPARATELY keeps both properties: the chunk still holds a whole
    number of windows and still rebuilds to exactly the bytes it used to hold,
    and a single window is still one contiguous range -- just a shorter one.

    What the page needs is the length of each compressed window, in order; every
    offset follows from that. `z` says which of them are really compressed: a
    window of Theora or Vorbis gives back 100.0% of what it is handed, so it is
    stored as it is rather than paying an inflate on every read for nothing.
    """

    def __init__(self, per_chunk: int, key: bytes, out_dir: str, tag: str, gzfn, recipe_for=None):
        self.per_chunk = per_chunk
        self.key = key
        self.out_dir = out_dir
        self.tag = tag
        self.gzfn = gzfn
        # window index -> recipe bytes (recipe.py) for a window of a version-0 archive, or None
        self.recipe_for = recipe_for
        self.lens: list[int] = []          # compressed length of every window, in order
        self.flags: list[str] = []         # '1' where that window really is compressed
        self.chunks = 0
        self._buf = bytearray()
        self._in_chunk = 0
        self._phys = 0                     # where this chunk starts in the stored stream
        self.written = 0

    def add(self, i: int, window: bytes) -> None:
        recipe = self.recipe_for(i) if self.recipe_for else None
        cut = len(window) - (len(window) >> 6)                       # at least 1.6% off
        # a version-0 archive's bytes are XOR noise; its recipe is plain bytes and coded
        # PCM (flag '2', inflated then rebuilt). A window of entries that were already
        # compressed (Ogg, PNG) gains nothing from one and ships as it is, unread.
        packed = self.gzfn(recipe) if recipe is not None else None
        if packed is not None and len(packed) <= cut:
            body, flag = packed, "2"
        else:
            packed = self.gzfn(window)
            body, flag = (packed, "1") if len(packed) <= cut else (window, "0")
        self.lens.append(len(body))
        self.flags.append(flag)
        self._buf += body
        self._in_chunk += 1
        if self._in_chunk == self.per_chunk:
            self.flush()

    def flush(self) -> None:
        if not self._buf:
            return
        body = scramble(bytes(self._buf), self._phys, self.key)
        with open(os.path.join(self.out_dir, "%s%d.bin" % (self.tag, self.chunks)), "wb") as f:
            f.write(body)
        self.written += len(body)
        self._phys += len(self._buf)
        self._buf = bytearray()
        self._in_chunk = 0
        self.chunks += 1


def index_for(dist: str, files: list[dict]) -> list[dict]:
    have = {f["instance"] for f in files if "instance" in f}
    index = json.loads(read(os.path.join(dist, "instance_index.json")).decode("utf-8"))
    return [e for e in index if e["p"] in have]


def _strip_local(node):
    """Anything that names where this was built, gone.

    dist.json records the directories it was assembled from -- the bundle, the
    module, the segs, the web sources -- as absolute paths. Those are useful in
    a build log and have no business in a page served to the public: they carry
    the account name of whoever ran the build. This drops the `sources` block
    and any remaining absolute path, wherever it sits.
    """
    if isinstance(node, dict):
        return {k: _strip_local(v) for k, v in node.items()
                if k not in ("sources", "dir", "root", "cwd", "out")}
    if isinstance(node, list):
        return [_strip_local(v) for v in node]
    if isinstance(node, str) and re.match(r"^(?:[A-Za-z]:[\\/]|[\\/]{1,2}[^\\/])", node):
        return os.path.basename(node.replace("\\", "/").rstrip("/")) or "(path)"
    return node


def manifest_for(dist: str, files: list[dict]) -> dict:
    try:
        m = json.loads(read(os.path.join(dist, "dist.json")).decode("utf-8"))
    except Exception:
        m = {}
    keep = {f["dist"] for f in files}
    m["files"] = [f for f in (m.get("files") or []) if f.get("path") in keep]
    return _strip_local(m)


def loader_gif_source(html: str):
    """Find only the loader picture's GIF srcset, leaving its static poster alone."""
    picture = re.search(r'<picture\b(?=[^>]*\sid\s*=\s*["\']loader-isaac-picture["\'])'
                        r'[^>]*>.*?</picture\s*>', html, re.I | re.S)
    if picture is None:
        return None
    for source in re.finditer(r'<source\b[^>]*>', html[picture.start():picture.end()], re.I):
        start, end = picture.start() + source.start(), picture.start() + source.end()
        if re.search(r'\stype\s*=\s*(["\'])image/gif\1', html[start:end], re.I):
            return re.compile(r'\ssrcset\s*=\s*(["\'])(.*?)\1', re.I | re.S).search(html, start, end)
    return None


def loader_gif_path(srcset: str, base_dir: str) -> str:
    """Resolve a local GIF or cache its public download outside tracked sources."""
    url = urllib.parse.urlsplit(srcset)
    if url.scheme in ("http", "https"):
        cache = os.path.join(LOADER_GIF_CACHE, hashlib.sha256(srcset.encode("utf-8")).hexdigest() + ".gif")
        if os.path.isfile(cache):
            return cache
        request = urllib.request.Request(srcset, headers={"User-Agent": "Mozilla/5.0",
                                                         "Accept": "image/gif"})
        temporary = None
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = response.read()
            if data[:6] not in (b"GIF87a", b"GIF89a"):
                raise ValueError("response is not a GIF")
            os.makedirs(LOADER_GIF_CACHE, exist_ok=True)
            with tempfile.NamedTemporaryFile(dir=LOADER_GIF_CACHE, suffix=".tmp", delete=False) as f:
                temporary = f.name
                f.write(data)
            os.replace(temporary, cache)
        except (OSError, ValueError) as e:
            raise SystemExit("loader GIF: cannot fetch %s: %s" % (srcset, e)) from e
        finally:
            if temporary and os.path.isfile(temporary):
                os.unlink(temporary)
        return cache
    if url.scheme or url.netloc:
        raise SystemExit("loader GIF: unsupported source %s" % srcset)
    path = os.path.join(base_dir, urllib.parse.unquote(url.path).lstrip("/"))
    if not os.path.isfile(path):
        raise SystemExit("loader GIF: missing local asset %s" % path)
    return path


def page_source(dist: str) -> str:
    html = read(os.path.join(dist, PAGE)).decode("utf-8")
    source = loader_gif_source(html)
    if source is not None and not source.group(2).startswith("data:"):
        data = read(loader_gif_path(source.group(2), dist))
        embedded = "data:image/gif;base64," + base64.b64encode(data).decode("ascii")
        html = html[:source.start(2)] + embedded + html[source.end(2):]
    return html


PROVIDER_JS = r"""
(function () {
  var P = window.__isaacPortableData, S = P.streams;
  var WIN = 1048576, CACHE_MAX = 256 * WIN, AHEAD = 8, STREAM_WIDTH = 6;
  // Whole-read chunks are unwrapped once. Windowed chunks keep their stored,
  // scrambled bytes: only a demanded window is copied, unscrambled and inflated.
  var cache = new Map(), cacheBytes = 0, flight = new Map();
  var inline = P.blobs || null, ranges = true;
  var readOnce = Object.create(null), headLeft = Object.create(null), evicted = [];
  var unread = new Map(), waiting = [];
  function wake() {
    var w = waiting; waiting = [];
    for (var j = 0; j < w.length; j++) w[j]();
  }
  function markRead(k) { if (unread.delete(k)) wake(); }
  function forget(k) {
    var old = cache.get(k);
    if (old) { cacheBytes -= old.length; cache.delete(k); }
    delete readOnce[k];
    markRead(k);
  }
  function evict(k) {
    if (evicted.length < 64) {
      evicted.push(k + (readOnce[k] ? ' read' : headLeft[k] ? ' trail' : ' other')
        + ' @' + (window.isaacFrame || 0));
    }
    forget(k);
  }
  function trim() {
    while (cacheBytes > CACHE_MAX && cache.size > 1) {
      var victim = null;
      for (var k of cache.keys()) if (readOnce[k]) { victim = k; break; }
      // Do not sacrifice the unconsumed engine to archive lookahead.
      if (victim === null) {
        for (var k of cache.keys()) if (!S[Number(k.split(':')[0])].gz) { victim = k; break; }
      }
      if (victim === null) victim = cache.keys().next().value;
      evict(victim);
    }
  }
  function remember(key, u) {
    var old = cache.get(key);
    if (old) { cache.delete(key); cacheBytes -= old.length; }
    cache.set(key, u); cacheBytes += u.length;
    trim();
    return u;
  }
  function touch(key) {
    var v = cache.get(key);
    if (v !== undefined) { cache.delete(key); cache.set(key, v); }
    return v;
  }
  function wasRead(k) {
    if (cache.has(k)) readOnce[k] = 1;
    delete headLeft[k];
    markRead(k);
  }
  var KEY = P.key ? (function () {
    var b = atob(P.key), a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return a;
  })() : null;
  function unscramble(bytes, pos) {
    if (!KEY) return bytes;
    for (var i = 0; i < bytes.length; i++) {
      var at = pos + i;
      bytes[i] ^= KEY[at & 255] ^ ((at >> 8) & 255);
    }
    return bytes;
  }
  function count(s) { return S[s].stored.length; }
  function chunkLen(s, i) { return S[s].stored[i]; }
  function name(s, i, windowRange) {
    var v = S[s].v && S[s].v[i];
    var url = (S[s].base || P.base) + '/' + S[s].tag + i + '.bin' + (v ? '?v=' + v : '');
    // Keep immutable range identities separate in Chromium's HTTP cache.
    return windowRange ? url + (v ? '&' : '?') + 'w=' + windowRange.from + '-' + windowRange.to : url;
  }
  function canonical(url) {
    var u = new URL(url, location.href);
    u.hash = ''; u.searchParams.delete('w');
    return u.href;
  }
  var downloads = [], byURL = new Map(), received = 0, total = 0, chunks = 0;
  var bootReceived = 0, bootTotal = 0;
  var loaded = Object.create(null), loadedN = 0;
  for (var s = 0; s < S.length; s++) {
    downloads[s] = [];
    for (var i = 0; i < count(s); i++) {
      var d = { s: s, i: i, size: chunkLen(s, i), received: 0, spans: [] };
      downloads[s][i] = d;
      total += d.size; chunks++;
      if (S[s].gz) bootTotal += d.size;
      if (P.base) byURL.set(canonical(name(s, i)), d);
      else { d.received = d.size; loaded[s + ':' + i] = 1; loadedN++; }
    }
  }
  if (!P.base) received = total;
  function progress(scope) {
    if (!P.base && scope === 'boot') return { received: 0, total: 0 };
    return scope === 'boot'
      ? { received: bootReceived, total: bootTotal }
      : { received: received, total: total };
  }
  function note(d) {
    var k = d.s + ':' + d.i;
    if (loaded[k] || d.received !== d.size) return;
    loaded[k] = 1; loadedN++;
    if (P.onChunk) { try { P.onChunk(loadedN, chunks); } catch (e) { /* decoration */ } }
  }
  // Union stored-byte intervals, including failed attempts' received prefixes.
  // A retry or a worker's overlapping range cannot count the same bytes twice.
  function record(d, from, to, complete) {
    if (!d || !Number.isSafeInteger(from) || !Number.isSafeInteger(to)
        || from < 0 || to <= from || to > d.size) return;
    var spans = d.spans, a = 0, b, added = to - from;
    while (a < spans.length && spans[a][1] < from) a++;
    b = a;
    while (b < spans.length && spans[b][0] <= to) {
      added -= Math.max(0, Math.min(to, spans[b][1]) - Math.max(from, spans[b][0]));
      from = Math.min(from, spans[b][0]); to = Math.max(to, spans[b][1]);
      b++;
    }
    spans.splice(a, b - a, [from, to]);
    if (added) {
      d.received += added; received += added;
      if (S[d.s].gz) bootReceived += added;
      if (P.onProgress) { try { P.onProgress(progress()); } catch (e) { /* decoration */ } }
    }
    if (complete) note(d);
  }
  function recordDownload(url, from, to) {
    var d;
    try { d = byURL.get(canonical(url)); } catch (e) { return; }
    record(d, from, to, true);
  }
  function lengthHeader(r, size) {
    var h = r.headers.get('content-length');
    return h === null || (/^\d+$/.test(h) && Number(h) === size);
  }
  function wholeHeader(r, size) {
    // Fetch exposes decoded bytes, but encoded responses retain their wire length.
    var encoding = (r.headers.get('content-encoding') || 'identity').trim().toLowerCase();
    return r.status === 200 && !r.headers.get('content-range')
      && (encoding !== 'identity' || lengthHeader(r, size));
  }
  function rangeHeader(r, from, to, size) {
    var m = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(r.headers.get('content-range') || '');
    return r.status === 206 && m && Number(m[1]) === from && Number(m[2]) === to - 1
      && Number(m[3]) === size && lengthHeader(r, to - from);
  }
  async function discard(r) {
    if (!r.body) return;
    try { await r.body.cancel(); } catch (e) { /* retain the original response error */ }
  }
  async function body(r, s, i, from, size) {
    var d = downloads[s][i], u, n = 0;
    if (r.body && r.body.getReader) {
      var reader = r.body.getReader();
      u = new Uint8Array(size);
      try {
        for (;;) {
          var part = await reader.read();
          if (part.done) break;
          if (n + part.value.length > size) throw new Error('piece ' + s + ':' + i + ': wrong body length');
          u.set(part.value, n); n += part.value.length;
          // Do not claim the entire response until EOF validates its length.
          if (n < size) record(d, from, from + n, false);
        }
      } catch (e) {
        try { await reader.cancel(); } catch (ignored) { /* the failed stream is already closed */ }
        throw e;
      } finally { reader.releaseLock(); }
    } else {
      u = new Uint8Array(await r.arrayBuffer()); n = u.length;
    }
    if (n !== size) throw new Error('piece ' + s + ':' + i + ': wrong body length');
    record(d, from, from + size, true);
    return u;
  }
  function decode(b) {
    return (typeof Uint8Array.fromBase64 === 'function')
      ? Uint8Array.fromBase64(b)
      : (function () { var s = atob(b), a = new Uint8Array(s.length); for (var k = 0; k < s.length; k++) a[k] = s.charCodeAt(k); return a; })();
  }
  function span(s, a, b) {
    var st = S[s], parts = [], o = 0;
    for (var pos = a; pos < b;) {
      var i = Math.floor(pos / st.size), within = pos % st.size;
      var take = Math.min(st.size - within, b - pos);
      if (st.wl) take = Math.min(take, st.win - within % st.win);
      parts.push({ s: s, i: i, within: within, take: take, at: o });
      o += take; pos += take;
    }
    return parts;
  }
  function packed(s, i) {
    if (!S[s].gz) return false;
    return S[s].z ? S[s].z.charAt(i) === '1' : true;
  }
  var WOFF = [];
  function woff(s) {
    if (WOFF[s]) return WOFF[s];
    var wl = S[s].wl, a = new Array(wl.length + 1);
    a[0] = 0;
    for (var k = 0; k < wl.length; k++) a[k + 1] = a[k] + wl[k];
    WOFF[s] = a;
    return a;
  }
  function perChunk(s) { return S[s].size / S[s].win; }
  async function inflate(bytes) {
    return new Uint8Array(await new Response(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  }
  async function window1(s, k, stored) {
    var z = S[s].wz.charAt(k);
    // '2': a recipe (recipe.js) -- inflated, then rebuilt into the archive's own bytes
    if (z === '2') return isaacRecipeDecode(await inflate(stored));
    return z === '1' ? await inflate(stored) : stored;
  }
  async function unpackWhole(s, i, raw) {
    if (S[s].wl) return raw;
    unscramble(raw, i * S[s].size);
    return packed(s, i) ? await inflate(raw) : raw;
  }
  function piece(s, i, pre) {
    var key = s + ':' + i, hit = touch(key);
    if (hit) { if (!pre) wasRead(key); return Promise.resolve(hit); }
    var pr = flight.get(key);
    if (!pr) {
      pr = piece1(s, i).then(function (u) { flight.delete(key); return u; },
                             function (e) { flight.delete(key); throw e; });
      flight.set(key, pr);
    }
    return pre ? pr : pr.then(function (u) { wasRead(key); return u; });
  }
  async function piece1(s, i) {
    var r = await fetch(name(s, i)), size = chunkLen(s, i);
    if (!r.ok) {
      await discard(r);
      throw new Error('piece ' + s + ':' + i + ': HTTP ' + r.status);
    }
    if (!wholeHeader(r, size)) {
      await discard(r);
      throw new Error('piece ' + s + ':' + i + ': invalid whole response');
    }
    return remember(s + ':' + i, await unpackWhole(s, i, await body(r, s, i, 0, size)));
  }
  function inWindow(p) {
    var st = S[p.s];
    if (!st.wl) return null;
    var k = p.i * perChunk(p.s) + Math.floor(p.within / st.win);
    var at = p.within % st.win;
    if (at + p.take > st.win) return null;
    var off = woff(p.s), base = off[p.i * perChunk(p.s)];
    return { k: k, at: at, from: off[k] - base, to: off[k + 1] - base - 1, abs: off[k] };
  }
  async function slicePiece(p, u) {
    var w = inWindow(p);
    if (!w) return u.subarray(p.within, p.within + p.take);
    var stored = u.subarray(w.from, w.to + 1);
    // Unscrambling a shared subarray would corrupt every subsequent read.
    if (KEY) stored = unscramble(stored.slice(), w.abs);
    var win = await window1(p.s, w.k, stored);
    return win.subarray(w.at, w.at + p.take);
  }
  async function ranged(p) {
    var key = p.s + ':' + p.i;
    if (!ranges || cache.has(key) || flight.has(key)) return slicePiece(p, await piece(p.s, p.i));
    var w = inWindow(p), cut = w || { from: p.within, to: p.within + p.take - 1 };
    var r = await fetch(name(p.s, p.i, cut), { headers: { Range: 'bytes=' + cut.from + '-' + cut.to } });
    if (!r.ok) {
      await discard(r);
      throw new Error('range ' + key + ': HTTP ' + r.status);
    }
    var u, whole = false;
    try {
      if (rangeHeader(r, cut.from, cut.to + 1, chunkLen(p.s, p.i))) {
        u = await body(r, p.s, p.i, cut.from, cut.to - cut.from + 1);
      } else if (wholeHeader(r, chunkLen(p.s, p.i))) {
        u = await body(r, p.s, p.i, 0, chunkLen(p.s, p.i)); whole = true;
      } else await discard(r);
    } catch (e) { /* a short or failed range must not poison the whole-chunk cache */ }
    if (!u || whole) {
      ranges = false;
      if (whole) {
        u = remember(key, await unpackWhole(p.s, p.i, u));
        wasRead(key);
        return slicePiece(p, u);
      }
      return slicePiece(p, await piece(p.s, p.i));
    }
    unscramble(u, w ? w.abs : p.i * S[p.s].size + p.within);
    if (!w) return u;
    var win = await window1(p.s, w.k, u);
    return win.subarray(w.at, w.at + p.take);
  }
  async function gather(parts) {
    var total = parts.reduce(function (n, p) { return n + p.take; }, 0);
    var out = new Uint8Array(total), next = 0;
    async function worker() {
      for (;;) {
        var k = next++;
        if (k >= parts.length) return;
        var p = parts[k];
        var bytes = S[p.s].gz ? await slicePiece(p, await piece(p.s, p.i)) : await ranged(p);
        if (bytes.length !== p.take) throw new Error('piece ' + p.s + ':' + p.i + ': short decoded read');
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
  // This CDN has returned inconsistent, four-byte-short ranges even after a
  // successful probe. Whole immutable chunks are reliable there.
  var NO_RANGES = /(^|\.)jsdelivr\.net$/i;
  function hostOf(u) {
    try { return new URL(u, location.href).hostname; } catch (e) { return ''; }
  }
  async function probeRanges() {
    if (new URLSearchParams(location.search).get('noranges') === '1') {
      ranges = false; P.rangesWhy = 'ranges turned off by ?noranges=1'; return false;
    }
    var b = S.findIndex(function (st) { return !st.gz && st.stored.length; });
    if (b < 0) return ranges;
    if (NO_RANGES.test(hostOf(S[b].base || P.base))) {
      ranges = false;
      P.rangesWhy = 'this CDN answers ranges four bytes short, and not every time (rounds 84, 89d)';
      return false;
    }
    var n = count(b), picks = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1]
      .filter(function (v, i, a) { return v >= 0 && v < n && a.indexOf(v) === i; });
    var failures = new Array(picks.length);
    var checked = await Promise.all(picks.map(async function (i, k) {
      try {
        var size = chunkLen(b, i), r = await fetch(name(b, i), { headers: { Range: 'bytes=0-1023' } });
        if (!rangeHeader(r, 0, 1024, size)) {
          await discard(r);
          throw new Error('invalid first range response');
        }
        var head = await body(r, b, i, 0, 1024);
        var r2 = await fetch(name(b, i), { headers: { Range: 'bytes=512-1535' } });
        if (!rangeHeader(r2, 512, 1536, size)) {
          await discard(r2);
          throw new Error('invalid overlapping range response');
        }
        var mid = await body(r2, b, i, 512, 1024);
        for (var q = 0; q < 512; q++) {
          if (mid[q] !== head[512 + q]) throw new Error('two ranges over the same bytes disagree at ' + (512 + q));
        }
        return true;
      } catch (e) { failures[k] = 'chunk ' + i + ': ' + (e.message || String(e)); return false; }
    }));
    ranges = checked.every(function (ok) { return ok; });
    if (!ranges) P.rangesWhy = failures.find(function (why) { return why; });
    return ranges;
  }
  async function room(key) {
    while (unread.size >= AHEAD) {
      await new Promise(function (res) {
        var done = false, timer;
        var go = function () {
          if (done) return;
          done = true; clearTimeout(timer);
          var at = waiting.indexOf(go);
          if (at >= 0) waiting.splice(at, 1);
          res();
        };
        waiting.push(go);
        timer = setTimeout(function () {
          // An old trail can name chunks this run never reads. Reclaim one
          // completed speculative chunk, never a pending demand, to keep going.
          for (var entry of unread) if (entry[1]) { evict(entry[0]); break; }
          go();
        }, 1000);
      });
    }
    if (!loaded[key]) unread.set(key, false);
  }
  async function fetchList(jobs, width, paced) {
    var next = 0;
    async function worker() {
      for (;;) {
        var k = next++;
        if (k >= jobs.length) return;
        var s = jobs[k][0], i = jobs[k][1], key = s + ':' + i;
        if (loaded[key]) continue;
        if (paced) await room(key);
        if (loaded[key]) { markRead(key); continue; }
        try {
          await piece(s, i, true);
          if (unread.has(key)) { unread.set(key, true); wake(); }
        } catch (e) { markRead(key); /* a later demand retries the cleared flight */ }
      }
    }
    var crew = [];
    for (var w = 0; w < Math.min(width, jobs.length); w++) crew.push(worker());
    await Promise.all(crew);
  }
  function prefetchAll() {
    var jobs = [], seen = Object.create(null), trail = P.trail || [], trailN = 0;
    function add(s, i, fromTrail) {
      var key = s + ':' + i;
      if (seen[key] || S[s].gz || S[s].size <= WIN || i >= count(s)) return;
      seen[key] = 1; jobs.push([s, i]);
      if (fromTrail) { headLeft[key] = 1; trailN++; }
    }
    for (var j = 0; j < trail.length; j++) {
      var f = P.files[trail[j][0]];
      if (!f) continue;
      var a = f.at + trail[j][1], b = a + trail[j][2] - 1;
      for (var i = Math.floor(a / S[f.s].size); i <= Math.floor(b / S[f.s].size); i++) add(f.s, i, true);
    }
    for (var s = 0; s < S.length; s++) for (var i = 0; i < count(s); i++) add(s, i, false);
    P.prefetch = { head: trailN, rest: jobs.length - trailN, of: jobs.length };
    // Observed inside fetchList; failed prefetches remain retryable by demands.
    fetchList(jobs, STREAM_WIDTH, true);
  }
  window.isaacPortable = {
    manifest: P.manifest,
    index: P.index,
    trail: P.trail || null,
    status: P.status,
    ready: (async function () {
      if (!P.base) return ranges;
      var required = [];
      for (var s = 0; s < S.length; s++) {
        if (!S[s].gz) continue;
        for (var i = 0; i < count(s); i++) required.push([s, i]);
      }
      fetchList(required, 4);
      await probeRanges();
      if (!ranges) prefetchAll();
      return ranges;
    })(),
    ranges: function () { return ranges; },
    prefetch: function () { return P.prefetch || null; },
    key: KEY,
    chunks: chunks,
    rangesWhy: function () { return P.rangesWhy || null; },
    loaded: function () { return loadedN; },
    progress: progress,
    recordDownload: recordDownload,
    cache: function () {
      return { mb: Math.round(cacheBytes / WIN), n: cache.size, maxMB: Math.round(CACHE_MAX / WIN),
               trailUnread: Object.keys(headLeft).length, evicted: evicted.slice() };
    },
    urlFor: P.base ? function (rel, off, len) {
      if (!len || !ranges) return null;
      var parts = locate(rel, off, len);
      if (!parts || parts.length !== 1) return null;
      var p = parts[0];
      if (S[p.s].gz) return null;
      if (S[p.s].wl) {
        var w = P.workerWindows ? inWindow(p) : null;
        if (!w) return null;
        return name(p.s, p.i, w) + '#w=' + w.from + '-' + w.to + '@' + w.abs
          + '!' + (+S[p.s].wz.charAt(w.k) || 0) + '*' + w.at + '-' + p.take;
      }
      var rawRange = { from: p.within, to: p.within + p.take - 1 };
      return name(p.s, p.i, rawRange) + '#r=' + rawRange.from + '-' + rawRange.to
        + '@' + (p.i * S[p.s].size + p.within) + '!' + chunkLen(p.s, p.i);
    } : null,
    bytesFor: P.base
      ? function (rel, off, len) { var p = locate(rel, off, len); return p ? gather(p) : null; }
      : function (rel, off, len) {
          var parts = locate(rel, off, len);
          if (!parts) return null;
          var total = parts.reduce(function (n, q) { return n + q.take; }, 0);
          var out = new Uint8Array(total);
          for (var k = 0; k < parts.length; k++) {
            var q = parts[k], key = q.s + ':' + q.i, u = touch(key);
            if (!u) u = remember(key, decode(inline[S[q.s].first + q.i]));
            wasRead(key);
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
  var order = ['boot.mjs', 'gamepad.mjs', 'menu_overlay.mjs', 'zip.mjs', 'mod_browser.mjs', 'mods.mjs', 'touch_input.mjs', 'touch_game.mjs', 'touch_controls.mjs', 'boot_web.mjs', 'play.mjs'];
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
    # The trail orders bounded background archive prefetch ahead of likely reads.
    has_trail = os.path.isfile(os.path.join(args.dist, "boot-trail.json"))
    if not has_trail and not args.no_trail:
        raise SystemExit("%s has no boot-trail.json: rebuild it with ship.py (which ships "
                         "scripts/recomp/assets/boot-trail.json by default), or pass --no-trail "
                         "to build a page without trail-directed prefetch" % args.dist)
    files = plan(args.dist, set(args.skip or []))
    whole, windowed = split_parts(files)
    table = {}
    a_len = lay_out(whole, table, 0)
    b_len = lay_out(windowed, table, 1, WINDOW)
    out_dir = os.path.abspath(args.out)
    data_dir = os.path.join(out_dir, "c")
    os.makedirs(data_dir, exist_ok=True)
    if not args.html_only:
        for old in os.listdir(data_dir):
            os.remove(os.path.join(data_dir, old))

    # part A is fetched whole, so its pieces may be gzipped; part B is read by
    # range, so its chunks stay raw. The counts land on `--chunks` between them.
    a_pieces = max(1, min(max(1, args.chunks // 4), 4))
    b_pieces = max(1, args.chunks - a_pieces)
    a_size = ((a_len + a_pieces - 1) // a_pieces + MIB - 1) // MIB * MIB
    b_size = ((b_len + b_pieces - 1) // b_pieces + WINDOW - 1) // WINDOW * WINDOW
    if args.part_mib:
        # Round 78: cut part B to a fixed size instead of to a file count. At 1 the
        # chunk IS the window, so nothing is ever fetched by range and a host whose
        # ranges cannot be trusted -- jsDelivr answers them with the wrong bytes --
        # costs nothing extra. The price is a lot of files.
        b_size = max(WINDOW, args.part_mib * MIB // WINDOW * WINDOW)
    # Round 89: a chunk that IS one window can be compressed, because the reader
    # takes it whole and never asks for a range inside it. That is worth 19.3 MB
    # over the ranged half -- the archives are deflate inside, but the windows
    # still hold 5% they never had a chance to remove, and the engine's own
    # inflate is not involved: this layer is unwrapped before the engine sees a
    # byte. It is only offered when the chunk is exactly a window, because a
    # bigger compressed chunk could not be entered at an offset.
    # The chunk keeps its size and its logical contents; only the way it is
    # stored changes, so the file count does not move.
    b_wingz = bool(args.window_gz)
    if getattr(args, "recipe", None) and not b_wingz:
        raise SystemExit("--recipe ships windows of their own, so it needs --window-gz (--part-mib 1)")
    b_gz = False
    written = [0]

    # Round 80: the seed is the two stream lengths, so a build that adds one file
    # to part A re-scrambles part B as well -- half a gigabyte of chunks that
    # differ only in their keystream. --key-b64 takes the key off an earlier
    # build's page instead: part B is then byte for byte what is already
    # uploaded, and only the chunks whose contents really moved need sending
    # again. `chunks --key-of <index.html>` reads it out of one.
    if args.plain:
        key = b""
    elif args.key_b64:
        key = base64.b64decode(args.key_b64)
        if len(key) != 256:
            raise SystemExit("--key-b64: expected 256 bytes, got %d" % len(key))
    else:
        key = keystream_key(
            ("isaac-portable/%d/%d/%d" % (a_len, b_len, args.chunks)).encode("ascii"))

    # Round 88: zopfli emits a gzip stream any decoder reads -- the page still
    # calls DecompressionStream('gzip') and nothing about the runtime changes --
    # it just spends much longer choosing the encoding. Measured on the module,
    # the largest thing in part A: 10.98 -> 10.55 MB, 3.9%, for 282 s. Across
    # part A that is ~0.55 MB for about six minutes of build, which is why it is
    # a flag and not the default.
    def _gzip(b):
        if not args.zopfli:
            return gzip.compress(b, 9, mtime=0)
        try:
            import zopfli.gzip
        except ImportError:
            raise SystemExit("--zopfli needs the zopfli package (pip install zopfli)")
        return zopfli.gzip.compress(b)

    # Round 89: which chunks of a compressed stream actually ARE compressed. A
    # window of Theora or Vorbis gives back 100.0% of what it is handed, so
    # compressing it buys nothing and costs an inflate on every read of it --
    # about 150 MB of the payload is exactly that. Such a window is stored raw
    # and marked here, rather than sniffed at read time: a raw window can begin
    # with the gzip magic by chance, and 522 windows make that a 1-in-125 bet.
    zflag = {}

    def emit_for(tag, gz, size):
        def emit(i, b):
            body = b
            if gz:
                packed = _gzip(b)
                if len(packed) <= len(b) - (len(b) >> 6):      # at least 1.6% off
                    body = packed
                zflag.setdefault(tag, []).append(1 if body is not b else 0)
            body = scramble(body, i * size, key)
            with open(os.path.join(data_dir, "%s%d.bin" % (tag, i)), "wb") as f:
                f.write(body)
            written[0] += len(body)
        return emit

    if args.html_only:
        n_a = (a_len + a_size - 1) // a_size
        n_b = (b_len + b_size - 1) // b_size
        written[0] = sum(os.path.getsize(os.path.join(data_dir, n))
                         for n in os.listdir(data_dir) if n.endswith(".bin"))
    else:
        n_a = cut(whole, a_size, emit_for("a", True, a_size))
        if b_wingz:
            packer = WindowPacker(b_size // WINDOW, key, data_dir, "b", _gzip,
                                  recipe_for=_recipe_windows(windowed, b_len, args.recipe or []))
            cut(windowed, WINDOW, packer.add)
            packer.flush()
            n_b = packer.chunks
            written[0] += packer.written
        else:
            n_b = cut(windowed, b_size, emit_for("b", b_gz, b_size))
    # Round 86d: a token per chunk, from that chunk's own bytes, which rides in
    # its URL. jsDelivr answers these with `max-age=604800`, so a returning
    # visitor keeps chunks for a week -- and a rebuild that changes only part A
    # leaves that visitor splicing new chunks onto cached old ones. The module
    # spans four of them, and a spliced module is not a module:
    #   WebAssembly.instantiate(): size 8760567 > maximum function size 7654321
    # A per-chunk token (not one per build) is what makes this cheap: a chunk
    # whose bytes did not change keeps its URL and stays cached, so a module-only
    # rebuild re-fetches the four part-A chunks and none of the other 29.
    def chunk_tokens(tag, count):
        out = []
        for i in range(count):
            p = os.path.join(data_dir, "%s%d.bin" % (tag, i))
            h = hashlib.sha256()
            with open(p, "rb") as f:
                for block in iter(lambda: f.read(1 << 20), b""):
                    h.update(block)
            out.append(h.hexdigest()[:8])
        return out

    streams = [{"tag": "a", "size": a_size, "gz": True, "n": n_a, "bytes": a_len,
                "v": chunk_tokens("a", n_a)},
               {"tag": "b", "size": b_size, "gz": b_gz, "n": n_b, "bytes": b_len,
                "v": chunk_tokens("b", n_b)}]
    # a compressed stream carries which of its chunks really are compressed
    for st in streams:
        st["stored"] = [os.path.getsize(os.path.join(data_dir, "%s%d.bin" % (st["tag"], i)))
                        for i in range(st["n"])]
        if st["gz"] and zflag.get(st["tag"]):
            st["z"] = "".join(str(x) for x in zflag[st["tag"]])
    # a window-compressed stream carries the length of every window instead: the
    # chunk still holds `size / WINDOW` of them and still rebuilds to the same
    # bytes, so nothing else about the layout moves
    if b_wingz and not args.html_only:
        streams[1]["wl"] = packer.lens
        streams[1]["wz"] = "".join(packer.flags)
        streams[1]["win"] = WINDOW
    data = {"streams": streams, "files": table, "base": args.base or "./c",
            "index": index_for(args.dist, files), "manifest": manifest_for(args.dist, files),
            "chunks": n_a + n_b, "status": "loading", "workerWindows": True}
    if key:
        data["key"] = base64.b64encode(key).decode("ascii")
    if getattr(args, "base_b", None) and len(streams) > 1:
        streams[1]["base"] = args.base_b.rstrip("/")
    # the boot trail is small and boot_web.mjs asks for it by name: inline it so the
    # page needs nothing beside itself
    trail = os.path.join(args.dist, "boot-trail.json")
    if os.path.isfile(trail):
        data["trail"] = json.loads(read(trail).decode("utf-8"))
    head = ('<script>window.__isaacPortableData = ' + json.dumps(data, separators=(",", ":")) + ';</script>\n'
            + catalogue_script(args) +
            '<script>' + RECIPE_JS + PROVIDER_JS + '</script>')
    mods = {rel: read(os.path.join(args.dist, rel)).decode("utf-8") for rel in MODULES}
    if not args.plain:
        before = sum(len(v) for v in mods.values())
        mods = {k: minify_js(v) for k, v in mods.items()}
        after = sum(len(v) for v in mods.values())
        print("  modules minified: %s -> %s" % (human(before), human(after)))
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
    print("  page %s (%s) -- %s"
          % (os.path.join(out_dir, "index.html"), human(len(html.encode("utf-8"))),
             "the modules and the boot trail (%d reads) are in it, nothing else is needed" % len(data["trail"])
             if "trail" in data else "the modules are in it and NO boot trail: archive prefetch uses file order"))
    print("  base URL: %s" % data["base"])
    if n_a + n_b > 64:
        print("  %d files: no range is needed at this size, which suits a host whose ranges cannot be trusted"
              % (n_a + n_b))
    print("  %s" % ("plain: the chunks are the payload as it is"
                    if args.plain else "the chunks are scrambled and the page is minified"))
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
    blobs, stored = [], []

    def emit(_i, b):
        blobs.append(base64.b64encode(b).decode("ascii"))
        stored.append(len(b))

    n_a = cut(whole, piece, emit)
    n_b = cut(windowed, piece, emit)
    streams = [{"tag": "a", "size": piece, "gz": False, "n": n_a, "first": 0,
                "bytes": a_len, "stored": stored[:n_a]},
               {"tag": "b", "size": piece, "gz": False, "n": n_b, "first": n_a,
                "bytes": b_len, "stored": stored[n_a:]}]
    data = {"streams": streams, "files": table, "base": None,
            "index": index_for(args.dist, files), "manifest": manifest_for(args.dist, files),
            "status": "loading"}
    parts = ['<script>window.__isaacPortableData = ' + json.dumps(data, separators=(",", ":")) + ';',
             'window.__isaacPortableData.blobs = [];</script>\n', catalogue_script(args)]
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
    parts.append('<script>' + RECIPE_JS + PROVIDER_JS + '</script>')
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
    p.add_argument("--base-b", help="where part B (the windowed archives) is served from, if not --base: pin it "
                                    "to the commit that last changed part B, and a deploy that only touches part A "
                                    "leaves a returning visitor's cached part B valid (round 90f)")
    p.add_argument("--skip", nargs="*", help="archive file names to leave out")
    p.add_argument("--part-mib", type=int, default=0,
                   help="size of each windowed chunk in MiB instead of a file count; 1 makes a chunk "
                        "one window, so no byte range is ever needed (for hosts whose ranges lie)")
    p.add_argument("--plain", action="store_true",
                   help="leave the chunks as they are and the page readable (the default scrambles both)")
    p.add_argument("--html-only", action="store_true",
                   help="rewrite the page without touching the chunk files (the probe, not the payload)")
    p.add_argument("--window-gz", action="store_true",
                   help="compress the ranged half too, one chunk per window (needs --part-mib 1). "
                        "The reader takes such a chunk whole, so it can be gzipped like part A: "
                        "-19.3 MB, and no byte range is ever asked for (round 89)")
    p.add_argument("--recipe", nargs="*",
                   help="windowed archives (version 0, archive.py repack --version 0) to ship as "
                        "window recipes: plain entry bytes plus losslessly coded 16-bit PCM, "
                        "rebuilt by the page (recipe.py, recipe.js); needs --window-gz")
    p.add_argument("--zopfli", action="store_true",
                   help="compress the whole-read chunks with zopfli instead of gzip -9 -- the same "
                        "gzip format the page already decodes, ~0.55 MB smaller, ~6 minutes slower "
                        "to build (round 88)")
    p.add_argument("--key-b64", help="scramble with this key instead of one derived from the sizes, so "
                                     "chunks that did not change keep the bytes already uploaded")
    p.add_argument("--key-of", help="take --key-b64 out of an earlier build's index.html")
    p.add_argument("--catalogue", help="where modpack.py's catalogue is served from; without one the "
                                       "page offers no MOD BROWSER row")
    p.add_argument("--no-trail", action="store_true",
                   help="build without boot-trail.json; bounded background archive prefetch then uses file order")
    p.set_defaults(fn=cmd_chunks)
    p = sub.add_parser("offline")
    p.add_argument("dist"); p.add_argument("out")
    p.add_argument("--piece-mib", type=int, default=8, help="inline piece size (the count costs nothing here)")
    p.add_argument("--skip", nargs="*", help="archive file names to leave out")
    p.add_argument("--catalogue", help="where modpack.py's catalogue is served from; without one the "
                                       "page offers no MOD BROWSER row")
    p.set_defaults(fn=cmd_offline)
    args = ap.parse_args(argv)
    if getattr(args, "key_of", None) and not args.key_b64:
        page = read(args.key_of).decode("utf-8", "replace")
        m = re.search(r'window\.__isaacPortableData\s*=\s*(\{.*?\});', page, re.S)
        if not m:
            raise SystemExit("--key-of: %s carries no portable data" % args.key_of)
        args.key_b64 = json.loads(m.group(1)).get("key")
        if not args.key_b64:
            raise SystemExit("--key-of: %s was built --plain, it has no key" % args.key_of)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
