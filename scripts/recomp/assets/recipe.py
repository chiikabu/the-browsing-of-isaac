#!/usr/bin/env python3
"""Window recipes for version-0 KAGE archives: the writer half of
scripts/recomp/web/recipe.js (whose header defines the format).

A version-0 archive only XORs and byte-permutes its entries (archive.py raw_encode), so
a 1 MiB window of one can be shipped as the entries' PLAIN bytes -- text that gzip then
shrinks far better than the engine's per-1 KiB deflate, and 16-bit PCM coded here
losslessly (FLAC's fixed predictors and Rice codes, ~62% of what the deflated archive
ships for the game's sound effects) -- and rebuilt byte for byte by the page.

    python recipe.py check <archive.a> [--windows N]    encode + decode (Python) a sample
    python recipe.py size <archive.a>                    stored size of every window, gzipped

The page side is recipe.js; tests/recomp-recipe.test.js runs both on the same windows.
"""
import argparse, gzip, struct, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from archive import Archive, raw_decode, raw_keys, RAW_XOR_CONST, MASK32  # noqa: E402

WINDOW = 1 << 20
BLOCK = 4096
STEREO_MODES = [0, 0, 0]       # blocks coded left/right, left/side, right/side (fixture report)


# ---------------------------------------------------------------------------
# PCM code

def _residual(x, order):
    if order == 0: return x
    if order == 1: return x[1:] - x[:-1]
    if order == 2: return x[2:] - 2 * x[1:-1] + x[:-2]
    if order == 3: return x[3:] - 3 * x[2:-1] + 3 * x[1:-2] - x[:-3]
    return x[4:] - 4 * x[3:-1] + 6 * x[2:-2] - 4 * x[1:-3] + x[:-4]


def _parts(n):
    q, extra = divmod(n, 4)
    out, at = [], 0
    for i in range(4):
        c = q + (1 if i < extra else 0)
        out.append((at, at + c)); at += c
    return out


def _rice_k(u):
    """the cheapest Rice parameter for zigzagged residuals u (uint64) and its bit cost"""
    if len(u) == 0:
        return 0, 0
    m = float(u.mean())
    k0 = max(0, int(np.log2(m + 1)) - 1) if m > 0 else 0
    best = None
    for k in range(max(0, k0 - 1), min(31, k0 + 3) + 1):
        b = int(np.sum(u >> np.uint64(k))) + len(u) * (1 + k)
        if best is None or b < best[1]:
            best = (k, b)
    return best


def _plan_channel(x, width):
    """(cost bits, plan) for one channel of one block; plan = ('v',) or (order, [(k, u)...])"""
    best = (3 + width * len(x), ("v",))
    for order in range(5):
        if len(x) <= order:
            continue
        r = _residual(x, order)
        u = np.where(r >= 0, r * 2, -r * 2 - 1).astype(np.uint64)
        cost, parts = 3 + width * order, []
        for a, b in _parts(len(u)):
            k, bits = _rice_k(u[a:b])
            cost += 5 + bits
            parts.append((k, u[a:b]))
        if cost < best[0]:
            best = (cost, (order, parts))
    return best


class _Bits:
    """MSB-first bit writer over numpy arrays of bit values."""
    def __init__(self):
        self.chunks = []

    def put(self, value, width):
        if width:
            self.chunks.append(((int(value) >> np.arange(width - 1, -1, -1)) & 1).astype(np.uint8))

    def put_signed(self, values, width):
        v = np.asarray(values, dtype=np.int64) & ((1 << width) - 1)
        self.chunks.append(((v[:, None] >> np.arange(width - 1, -1, -1)) & 1).astype(np.uint8).ravel())

    def put_rice(self, u, k):
        if len(u) == 0:
            return
        q = (u >> np.uint64(k)).astype(np.int64)
        n = len(u)
        lens = q + 1 + k
        starts = np.concatenate(([0], np.cumsum(lens)[:-1]))
        bits = np.zeros(int(lens.sum()), dtype=np.uint8)
        # unary: q ones from each start (the terminating zero is already 0)
        if q.sum():
            idx = np.repeat(starts, q) + (np.arange(int(q.sum())) - np.repeat(np.cumsum(q) - q, q))
            bits[idx] = 1
        if k:
            low = (u & np.uint64((1 << k) - 1)).astype(np.int64)
            lb = (low[:, None] >> np.arange(k - 1, -1, -1)) & 1
            pos = (starts + q + 1)[:, None] + np.arange(k)
            bits[pos.ravel()] = lb.ravel().astype(np.uint8)
        self.chunks.append(bits)

    def bytes(self):
        if not self.chunks:
            return b""
        return np.packbits(np.concatenate(self.chunks)).tobytes()


def pcm_encode(pcm: bytes, channels: int) -> bytes:
    """16-bit little-endian interleaved PCM (whole frames) -> the code recipe.js reads."""
    s = np.frombuffer(pcm, dtype="<i2").astype(np.int64)
    w = _Bits()
    if channels == 1:
        for f0 in range(0, len(s), BLOCK):
            x = s[f0:f0 + BLOCK]
            _cost, plan = _plan_channel(x, 16)
            _emit_channel(w, x, plan, 16)
        return w.bytes()
    L, R = s[0::2], s[1::2]
    for f0 in range(0, len(L), BLOCK):
        l, r = L[f0:f0 + BLOCK], R[f0:f0 + BLOCK]
        side = r - l
        cl, pl = _plan_channel(l, 16)
        cr, pr = _plan_channel(r, 16)
        cs, ps = _plan_channel(side, 17)
        modes = [(cl + cr, 0, (l, pl, 16), (r, pr, 16)),
                 (cl + cs, 1, (l, pl, 16), (side, ps, 17)),
                 (cr + cs, 2, (r, pr, 16), (side, ps, 17))]
        _c, mode, c0, c1 = min(modes, key=lambda m: m[0])
        STEREO_MODES[mode] += 1
        w.put(mode, 2)
        _emit_channel(w, c0[0], c0[1], c0[2])
        _emit_channel(w, c1[0], c1[1], c1[2])
    return w.bytes()


def _emit_channel(w, x, plan, width):
    if plan[0] == "v":
        w.put(7, 3)
        w.put_signed(x, width)
        return
    order, parts = plan
    w.put(order, 3)
    if order:
        w.put_signed(x[:order], width)
    for k, u in parts:
        w.put(k, 5)
        w.put_rice(u, k)


def pcm_decode(code: bytes, channels: int, frames: int) -> bytes:
    """Reference decoder (slow, for checks); recipe.js is the one the page runs."""
    bits = np.unpackbits(np.frombuffer(code, dtype=np.uint8))
    pos = [0]

    def get(k):
        v = 0
        for _ in range(k):
            v = (v << 1) | int(bits[pos[0]]); pos[0] += 1
        return v

    def signed(k):
        v = get(k)
        return v - (1 << k) if v >= 1 << (k - 1) else v

    def unary():
        q = 0
        while bits[pos[0]]:
            q += 1; pos[0] += 1
        pos[0] += 1
        return q

    def channel(n, width):
        t = get(3)
        if t == 7:
            return [signed(width) for _ in range(n)]
        x = [signed(width) for _ in range(t)]
        for a, b in _parts(n - t):
            k = get(5)
            for _ in range(b - a):
                u = (unary() << k) | get(k)
                e = -((u + 1) >> 1) if u & 1 else u >> 1
                if t == 0: v = e
                elif t == 1: v = e + x[-1]
                elif t == 2: v = e + 2 * x[-1] - x[-2]
                elif t == 3: v = e + 3 * x[-1] - 3 * x[-2] + x[-3]
                else: v = e + 4 * x[-1] - 6 * x[-2] + 4 * x[-3] - x[-4]
                x.append(v)
        return x

    out = []
    for f0 in range(0, frames, BLOCK):
        n = min(BLOCK, frames - f0)
        if channels == 1:
            out.extend(channel(n, 16)); continue
        mode = get(2)
        a = channel(n, 16)
        b = channel(n, 16 if mode == 0 else 17)
        for i in range(n):
            if mode == 0: L, R = a[i], b[i]
            elif mode == 1: L, R = a[i], a[i] + b[i]
            else: R, L = a[i], a[i] - b[i]
            out.extend((L, R))
    return np.asarray(out, dtype="<i2").tobytes()


# ---------------------------------------------------------------------------
# WAV layout

def wav_pcm(b: bytes):
    """(data offset, whole-frame byte count, channels) of 16-bit PCM WAV bytes, or None"""
    if b[:4] != b"RIFF" or b[8:12] != b"WAVE":
        return None
    i, fmt, data = 12, None, None
    while i + 8 <= len(b):
        cid, sz = b[i:i + 4], struct.unpack_from("<I", b, i + 4)[0]
        if cid == b"fmt " and sz >= 16:
            tag, ch, _rate, _br, _ba, bits = struct.unpack_from("<HHIIHH", b, i + 8)
            fmt = (tag, ch, bits)
        elif cid == b"data":
            data = (i + 8, min(sz, len(b) - i - 8))
            break
        i += 8 + sz + (sz & 1)
    if not fmt or not data or fmt[0] != 1 or fmt[2] != 16 or fmt[1] not in (1, 2):
        return None
    frame = 2 * fmt[1]
    return data[0], data[1] // frame * frame, fmt[1]


# ---------------------------------------------------------------------------
# recipes

class V0Archive:
    """A version-0 archive's layout for recipes: per entry its payload extent in the
    file, h2, plain (padded) bytes on demand and, for a 16-bit PCM WAV, where the
    samples are. The bytes it rebuilds are exactly the archive file's."""
    def __init__(self, path: str):
        self.a = Archive(path)
        if self.a.version != 0:
            raise SystemExit("%s is version %d, not 0 (archive.py repack --version 0)" % (path, self.a.version))
        self.size = len(self.a.buf)
        self.ext = []
        for e in self.a.entries:
            off, ln = self.a.raw_extent(e)
            self.ext.append((off, ln, e))
        self.ext.sort(key=lambda t: t[0])
        self._plain = {}

    def plain(self, e):
        p = self._plain.get(e.index)
        if p is None:
            # the padded payload decoded whole: its last dword's padding bytes are the
            # archive's own -- zero from archive.py, whatever the game's packer left in
            # its sfx.a (78 entries there), and the byte permutation can move them inside
            # the entry's last dword
            off, ln = self.a.raw_extent(e)
            full = raw_decode(bytes(self.a.buf[off:off + ln]), e.h2, ln)
            p = (full, wav_pcm(full[:e.size]))
            if len(self._plain) > 64:
                self._plain.clear()
            self._plain[e.index] = p
        return p


def _key_at(h2: int, dword: int) -> int:
    k = ((h2 ^ RAW_XOR_CONST) | 1) & MASK32
    for _ in range(dword):
        k ^= (k << 8) & MASK32
        k ^= k >> 9
        k ^= (k << 23) & MASK32
    return k


class _KeyCache:
    """xorshift state per entry, stepped forward from where the last window left it"""
    def __init__(self):
        self.at = {}

    def key(self, e, dword):
        got = self.at.get(e.index)
        if got is None or got[0] > dword:
            got = (0, ((e.h2 ^ RAW_XOR_CONST) | 1) & MASK32)
        d, k = got
        while d < dword:
            k ^= (k << 8) & MASK32
            k ^= k >> 9
            k ^= (k << 23) & MASK32
            d += 1
        self.at[e.index] = (d, k)
        return k


def window_recipe(arch: V0Archive, file_bytes, lo: int, hi: int, keys: _KeyCache, tail: int = 0) -> bytes:
    """The recipe for archive bytes [lo, hi) of one file (a window's share of it), then
    `tail` zero bytes (the padding that window-aligns the next file in the stream)."""
    segs = []
    pos = lo

    def raw(a, b):
        if b > a:
            segs.append(b"\0" + struct.pack("<I", b - a) + bytes(file_bytes[a:b]))

    for off, ln, e in arch.ext:
        if off + ln <= pos:
            continue
        if off >= hi:
            break
        raw(pos, min(off, hi))
        a, b = max(off, lo), min(off + ln, hi)
        ra, rb = a - off, b - off                       # entry-relative
        d0, d1 = ra // 4 * 4, (rb + 3) // 4 * 4
        plain, pcm = arch.plain(e)
        parts = []

        def lit(x, y):
            if y > x:
                parts.append(b"\0" + struct.pack("<I", y - x) + plain[x:y])

        if pcm:
            p0, nbytes, ch = pcm
            p1 = p0 + nbytes
            frame = 2 * ch
            lit(d0, min(d1, p0))
            s, t = max(d0, p0), min(d1, p1)
            if t > s:
                f0, f1 = (s - p0) // frame, (t - p0 + frame - 1) // frame
                code = pcm_encode(plain[p0 + f0 * frame:p0 + f1 * frame], ch)
                parts.append(b"\1" + struct.pack("<BIIII", ch, f1 - f0, (s - p0) - f0 * frame, t - s, len(code)) + code)
            lit(max(d0, p1), d1)
        else:
            lit(d0, d1)
        segs.append(b"\1" + struct.pack("<IIBH", b - a, keys.key(e, d0 // 4), ra - d0, len(parts)) + b"".join(parts))
        pos = b
    raw(pos, hi)
    if tail:
        segs.append(b"\0" + struct.pack("<I", tail) + bytes(tail))
    return b"RW\1" + struct.pack("<IH", hi - lo + tail, len(segs)) + b"".join(segs)


def decode_recipe(r: bytes) -> bytes:
    """Reference recipe decoder (Python), the same format recipe.js reads."""
    assert r[:3] == b"RW\1", r[:3]
    out_len, nseg = struct.unpack_from("<IH", r, 3)
    p, out = 9, bytearray()
    for _ in range(nseg):
        kind = r[p]; p += 1
        if kind == 0:
            (n,) = struct.unpack_from("<I", r, p); p += 4
            out += r[p:p + n]; p += n
            continue
        seg_len, key, skip, nparts = struct.unpack_from("<IIBH", r, p); p += 11
        plain = bytearray()
        for _ in range(nparts):
            pk = r[p]; p += 1
            if pk == 0:
                (n,) = struct.unpack_from("<I", r, p); p += 4
                plain += r[p:p + n]; p += n
            else:
                ch, fr, sk, tk, cl = struct.unpack_from("<BIIII", r, p); p += 17
                pcm = pcm_decode(r[p:p + cl], ch, fr); p += cl
                plain += pcm[sk:sk + tk]
        ndw = len(plain) // 4
        keys = []
        k = key
        for _ in range(ndw):
            keys.append(k)
            k ^= (k << 8) & MASK32; k ^= k >> 9; k ^= (k << 23) & MASK32
        from archive import _permute, _xor_keystream
        _permute(plain, keys)
        enc = _xor_keystream(bytes(plain), keys)
        out += enc[skip:skip + seg_len]
    assert len(out) == out_len, (len(out), out_len)
    return bytes(out)


def cmd_size(args) -> int:
    arch = V0Archive(args.archive)
    data = arch.a.buf
    keys = _KeyCache()
    stored = 0
    n = (arch.size + WINDOW - 1) // WINDOW
    for w in range(n):
        lo, hi = w * WINDOW, min(arch.size, (w + 1) * WINDOW)
        stored += len(gzip.compress(window_recipe(arch, data, lo, hi, keys), 6, mtime=0))
        if w % 50 == 0:
            print("  window %d/%d: %.1f MB stored so far" % (w, n, stored / 1e6), flush=True)
    print("%s: %d windows, %.1f MB archive -> %.1f MB of gzipped recipes" % (args.archive, n, arch.size / 1e6, stored / 1e6))
    return 0


def cmd_check(args) -> int:
    arch = V0Archive(args.archive)
    data = arch.a.buf
    keys = _KeyCache()
    n = (arch.size + WINDOW - 1) // WINDOW
    step = max(1, n // args.windows)
    for w in range(0, n, step):
        lo, hi = w * WINDOW, min(arch.size, (w + 1) * WINDOW)
        r = window_recipe(arch, data, lo, hi, keys)
        assert decode_recipe(r) == bytes(data[lo:hi]), "window %d differs" % w
        print("  window %d: %d recipe bytes -> %d archive bytes, identical" % (w, len(r), hi - lo), flush=True)
    return 0


def _wav(pcm: bytes, rate: int, ch: int, bits: int = 16, extra: bytes = b"", odd: bytes = b"") -> bytes:
    fmt = struct.pack("<HHIIHH", 1, ch, rate, rate * ch * bits // 8, ch * bits // 8, bits)
    body = b"WAVE" + b"fmt " + struct.pack("<I", 16) + fmt + extra + b"data" + struct.pack("<I", len(pcm) + len(odd)) + pcm + odd
    return b"RIFF" + struct.pack("<I", len(body)) + body


def cmd_fixture(args) -> int:
    """A synthetic version-0 archive (no game data) and recipes for awkward pieces of it,
    for tests/recomp-recipe.test.js: the page's decoder must rebuild every piece exactly."""
    from archive import write_archive
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(1234)

    def walk(n, step=900):
        return np.clip(np.cumsum(rng.integers(-step, step + 1, n)), -32768, 32767).astype("<i2")

    mono = walk(10000)
    left, right = walk(7000), walk(7000)
    right[100:400] = 32767; left[100:400] = -32768          # side = +65535, the 17-bit edge
    right[500:700] = -32768; left[500:700] = 32767          # side = -65535
    stereo = np.empty(14000, dtype="<i2"); stereo[0::2], stereo[1::2] = left, right
    noise = rng.integers(-32768, 32768, 9000).astype("<i2")  # verbatim beats prediction here

    def pair(smooth_first):
        """a smooth channel and its copy plus a little noise: side coding wins, and the
        smooth channel decides whether left/side or right/side does"""
        smooth = (np.sin(np.arange(9000) / 40.0) * 12000).astype(np.int64)
        other = np.clip(smooth + rng.integers(-3, 4, 9000), -32768, 32767)
        L, R = (smooth, other) if smooth_first else (other, smooth)
        s = np.empty(18000, dtype="<i2"); s[0::2], s[1::2] = L, R
        return s.tobytes()

    items = [
        ("sfx/lside.wav", _wav(pair(True), 44100, 2)),
        ("sfx/rside.wav", _wav(pair(False), 44100, 2)),
        ("sfx/mono.wav", _wav(mono.tobytes(), 22050, 1)),
        ("sfx/stereo.wav", _wav(stereo.tobytes(), 44100, 2, extra=b"LIST" + struct.pack("<I", 6) + b"abcdef")),
        ("sfx/odd.wav", _wav(walk(5001).tobytes(), 24000, 1, odd=b"\x7f")),
        ("sfx/noise.wav", _wav(noise.tobytes(), 48000, 1)),
        ("sfx/eight.wav", _wav(bytes(range(256)) * 20, 11025, 1, bits=8)),
        ("gfx/a.anm2", (b"<AnimatedActor>" + b"<Frame XPosition=\"1\"/>" * 400 + b"</AnimatedActor>")),
        ("gfx/b.bin", rng.integers(0, 256, 30001).astype(np.uint8).tobytes()),
        ("gfx/empty.txt", b""),
    ]
    from archive import key_of, resource_key
    recs = []
    for name, data in items:
        h1, h2 = key_of(resource_key(name))
        recs.append({"h1": h1, "h2": h2, "data": data})
    path = out / "fixture.a"
    write_archive(str(path), 0, recs)
    # The game's own packer leaves bytes other than zero in a payload's padding (its
    # sfx.a), and the decoder never looks at them: give every padded entry here some.
    from archive import _permute, _xor_keystream
    junked = 0
    buf = bytearray(path.read_bytes())
    with Archive(str(path)) as tmp:
        for e in tmp.entries:
            off, ln = tmp.raw_extent(e)
            if ln == e.size:
                continue
            plain = bytearray(tmp.decode(e) + bytes(rng.integers(1, 256, ln - e.size).astype(np.uint8)))
            keys = raw_keys(e.h2, ln // 4)
            _permute(plain, keys)
            buf[off:off + ln] = _xor_keystream(bytes(plain), keys)
            junked += 1
    path.write_bytes(bytes(buf))
    assert junked >= 3, junked
    arch = V0Archive(str(path))
    by_h2 = {r["h2"]: r["data"] for r in recs}
    assert all(arch.a.decode(e) == by_h2[e.h2] for e in arch.a.entries), "junk padding is never decoded"
    data = bytes(arch.a.buf)
    keys = _KeyCache()
    pieces = []
    lo = 0
    while lo < len(data):
        hi = min(len(data), lo + args.piece)
        tail = 5 if hi == len(data) else 0
        r = window_recipe(arch, data, lo, hi, keys, tail)
        name = "p%d.recipe" % len(pieces)
        (out / name).write_bytes(r)
        assert decode_recipe(r) == data[lo:hi] + bytes(tail), "piece %d" % len(pieces)
        pieces.append({"file": name, "lo": lo, "hi": hi, "tail": tail})
        lo = hi
    import json
    (out / "pieces.json").write_text(json.dumps({"archive": "fixture.a", "pieces": pieces,
                                                 "stereoModes": STEREO_MODES}, indent=1))
    print("fixture: %d bytes, %d entries, %d pieces" % (len(data), len(items), len(pieces)))
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("fixture"); p.add_argument("out"); p.add_argument("--piece", type=int, default=4093)
    p.set_defaults(fn=cmd_fixture)
    p = sub.add_parser("check"); p.add_argument("archive"); p.add_argument("--windows", type=int, default=4)
    p.set_defaults(fn=cmd_check)
    p = sub.add_parser("size"); p.add_argument("archive"); p.set_defaults(fn=cmd_size)
    args = ap.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
