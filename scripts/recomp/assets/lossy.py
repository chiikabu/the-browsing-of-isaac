#!/usr/bin/env python3
"""Near-lossless sound effects for window recipes.

A KAGE version-0 archive's 16-bit PCM WAV entries are rewritten in place with the low
bits that lie under each sound's own noise floor rounded away, block by block (1024
frames from the sound's first frame: recipe.py's PCM_BLOCK, the coder's grid). recipe.py codes a block
whose low bits are all zero shifted (predictor 5, wasted bits), so those bits are never
downloaded; the page rebuilds this archive exactly, and the game reads it like any other.

The rule is lossyWAV's: per channel and block, the quietest part of the sound's spectrum
-- the minimum, over short (64-sample) and long (1024-sample) Hann-windowed spectra
across the block, of the band 20 Hz .. min(16 kHz, 0.95 Nyquist), the long one averaged
over 5 bins -- sets the largest power-of-two step whose rounding noise (white, step^2/12
per sample) stays MARGIN dB below it in every bin. The noise added is therefore below
the softest spectral line of that moment of the sound; a block with digital silence
anywhere in its band, or too quiet, keeps every bit.

Everything else in the archive -- other entries, the WAV headers, every payload's padding,
the layout and the offsets -- is left byte for byte; each rewritten entry's table record
gets its new mount checksum.

    python lossy.py trim <in.a> <out.a> [--margin 6] [--max-bits 8]
"""
from __future__ import annotations

import argparse, struct, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from archive import (Archive, TABLE_RECORD, _permute, _xor_keystream, mount_checksum,  # noqa: E402
                     raw_decode, raw_keys)

from recipe import PCM_BLOCK as BLOCK  # noqa: E402  -- the coder's block, so a trimmed block is a coded one
ANALYSES = ((64, 1), (1024, 5))      # (FFT size, bins averaged)


def wav_info(b: bytes):
    """(data offset, whole-frame byte count, channels, rate) of 16-bit PCM WAV bytes, or None"""
    if b[:4] != b"RIFF" or b[8:12] != b"WAVE":
        return None
    i, fmt = 12, None
    while i + 8 <= len(b):
        cid, sz = b[i:i + 4], struct.unpack_from("<I", b, i + 4)[0]
        if cid == b"fmt " and sz >= 16:
            tag, ch, rate, _br, _ba, bits = struct.unpack_from("<HHIIHH", b, i + 8)
            fmt = (tag, ch, rate, bits)
        elif cid == b"data":
            if not fmt or fmt[0] != 1 or fmt[3] != 16 or fmt[1] not in (1, 2) or not fmt[2]:
                return None
            n = min(sz, len(b) - i - 8)
            return i + 8, n // (2 * fmt[1]) * (2 * fmt[1]), fmt[1], fmt[2]
        i += 8 + sz + (sz & 1)
    return None


def _floor_power(x: np.ndarray, a: int, b: int, rate: int, n: int, avg: int):
    """the minimum (smoothed) in-band spectral power over Hann frames of size n, hop n/2,
    covering samples [a, b) of x (zero outside it), and that window's sum of squares"""
    hop = n // 2
    starts = np.arange(a - hop, b - hop + 1, hop)
    if len(starts) == 0:
        starts = np.array([a - hop])
    idx = starts[:, None] + np.arange(n)[None, :]
    seg = np.where((idx >= 0) & (idx < len(x)), x[np.clip(idx, 0, len(x) - 1)], 0.0)
    w = np.hanning(n + 2)[1:-1]
    p = np.abs(np.fft.rfft(seg * w, axis=1)) ** 2
    f = np.fft.rfftfreq(n, 1.0 / rate)
    band = (f >= 20.0) & (f <= min(16000.0, 0.95 * rate / 2))
    if avg > 1:
        k = np.ones(avg) / avg
        p = np.apply_along_axis(lambda r: np.convolve(r, k, mode="same"), 1, p)
    if not band.any():
        return 0.0, float((w * w).sum())
    return float(p[:, band].min()), float((w * w).sum())


def trim_channel(x: np.ndarray, rate: int, margin_db: float, max_bits: int):
    """x (int16 values as int64) with each block's removable low bits rounded away; and the
    bits removed per block"""
    xf = x.astype(np.float64)
    out = x.copy()
    shifts = []
    for a in range(0, len(x), BLOCK):
        b = min(len(x), a + BLOCK)
        k = max_bits
        for n, avg in ANALYSES:
            if n > 4 * (b - a):
                continue
            pmin, s2 = _floor_power(xf, a, b, rate, n, avg)
            if pmin <= 0.0:
                k = 0
                break
            # step^2 / 12 * s2 <= pmin * 10^(-margin/10)
            step2 = 12.0 * pmin * 10.0 ** (-margin_db / 10.0) / s2
            k = min(k, int(np.floor(0.5 * np.log2(step2))) if step2 >= 1.0 else 0)
        k = max(0, min(k, max_bits))
        if k:
            q = 1 << k
            v = np.round(xf[a:b] / q) * q
            out[a:b] = np.clip(v, -32768, 32768 - q).astype(np.int64)
        shifts.append(k)
    return out, shifts


def trim_archive(src: str, dst: str, margin_db: float = 6.0, max_bits: int = 8) -> dict:
    arch = Archive(src)
    if arch.version != 0:
        raise SystemExit("%s is version %d, not 0" % (src, arch.version))
    buf = bytearray(arch.buf)
    stats = {"entries": 0, "wav": 0, "samples": 0, "bitsRemoved": 0, "blocks": 0, "blocksTrimmed": 0,
             "noise": 0.0, "signal": 0.0, "hist": [0] * (max_bits + 1)}
    for e in arch.entries:
        stats["entries"] += 1
        off, ln = arch.raw_extent(e)
        full = raw_decode(bytes(buf[off:off + ln]), e.h2, ln)        # with the archive's own padding
        info = wav_info(full[:e.size])
        if not info:
            continue
        p0, nbytes, ch, rate = info
        if nbytes < 2 * ch:
            continue
        s = np.frombuffer(full[p0:p0 + nbytes], dtype="<i2").astype(np.int64)
        new = s.copy()
        for c in range(ch):
            y, shifts = trim_channel(s[c::ch], rate, margin_db, max_bits)
            new[c::ch] = y
            for i, k in enumerate(shifts):
                n = min(BLOCK, len(y) - i * BLOCK)
                stats["bitsRemoved"] += k * n
                stats["hist"][k] += 1
                stats["blocks"] += 1
                stats["blocksTrimmed"] += 1 if k else 0
        stats["wav"] += 1
        stats["samples"] += len(s)
        d = (new - s).astype(np.float64)
        stats["noise"] += float((d * d).sum())
        stats["signal"] += float((s.astype(np.float64) ** 2).sum())
        if not d.any():
            continue
        plain = bytearray(full)
        plain[p0:p0 + nbytes] = new.astype("<i2").tobytes()
        keys = raw_keys(e.h2, ln // 4)
        data = bytes(plain[:e.size])
        _permute(plain, keys)
        buf[off:off + ln] = _xor_keystream(bytes(plain), keys)
        TABLE_RECORD.pack_into(buf, arch.table_offset + TABLE_RECORD.size * e.index,
                               e.h1, e.h2, e.offset, e.size, mount_checksum(data))
    arch.close()
    Path(dst).write_bytes(bytes(buf))
    check = Archive(dst)
    assert len(check.buf) == len(buf) and check.count == arch.count
    for e, f in zip(arch.entries, check.entries):
        assert (e.h1, e.h2, e.offset, e.size) == (f.h1, f.h2, f.offset, f.size)
        ok, _x = check.verify(f)
        assert ok, "entry %d: mount checksum" % f.index
    check.close()
    stats["snrDb"] = round(10 * np.log10(stats["signal"] / stats["noise"]), 1) if stats["noise"] else None
    stats["bitsPerSample"] = round(stats["bitsRemoved"] / max(1, stats["samples"]), 3)
    del stats["noise"], stats["signal"]
    return stats


def selftest() -> dict:
    """A synthetic version-0 archive (no game data) through trim_archive: what changed, and
    what must not have, for tests/recomp-recipe.test.js."""
    import tempfile
    from archive import key_of, resource_key, write_archive
    rng = np.random.default_rng(5)
    t = np.arange(44100)
    tone = np.clip(np.round(np.sin(2 * np.pi * 440 * t / 44100) * 12000 + rng.normal(0, 40, len(t))),
                   -32768, 32767).astype("<i2")
    gap = np.concatenate([tone[:20480], np.zeros(6144, "<i2"), tone[:20480]])
    stereo = np.empty(60000, "<i2"); stereo[0::2] = tone[:30000]; stereo[1::2] = tone[:30000] // 2

    def wav(pcm, rate, ch):
        fmt = struct.pack("<HHIIHH", 1, ch, rate, rate * 2 * ch, 2 * ch, 16)
        data = pcm.tobytes()
        return b"RIFF" + struct.pack("<I", 4 + 8 + 16 + 8 + len(data)) + b"WAVE" + b"fmt " + struct.pack("<I", 16) \
            + fmt + b"data" + struct.pack("<I", len(data)) + data
    names = ["sfx/tone.wav", "sfx/gap.wav", "sfx/stereo.wav", "gfx/blob.bin"]
    datas = [wav(tone, 44100, 1), wav(gap, 44100, 1), wav(stereo, 44100, 2),
             rng.integers(0, 256, 10001).astype(np.uint8).tobytes()]
    recs = [dict(zip(("h1", "h2"), key_of(resource_key(n))), data=d) for n, d in zip(names, datas)]
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as d:
        src, dst = str(Path(d) / "in.a"), str(Path(d) / "out.a")
        write_archive(src, 0, recs)
        stats = trim_archive(src, dst)
        a, b = Archive(src), Archive(dst)
        by = {e.h2: e for e in b.entries}
        out = {"stats": stats, "checksums": all(b.verify(e)[0] for e in b.entries)}
        for n, e in zip(names, a.entries):
            f = by[e.h2]
            old, new = a.decode(e), b.decode(f)
            info = wav_info(old)
            if not info:
                out["otherUnchanged"] = a.raw(e) == b.raw(f)
                continue
            p0, nb, _ch, _r = info
            x = np.frombuffer(old[p0:p0 + nb], "<i2").astype(np.float64)
            y = np.frombuffer(new[p0:p0 + nb], "<i2").astype(np.float64)
            out[n] = {"headerSame": old[:p0] == new[:p0], "changed": int((x != y).sum()),
                      "snrDb": round(10 * np.log10((x * x).sum() / max(1e-9, ((x - y) ** 2).sum())), 1)}
            if n == "sfx/gap.wav":
                out[n]["silenceUntouched"] = bool((y[20480:20480 + 6144] == 0).all())
        a.close(); b.close()
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("trim")
    t.add_argument("src"); t.add_argument("dst")
    t.add_argument("--margin", type=float, default=6.0, help="dB the added noise stays under the floor")
    t.add_argument("--max-bits", type=int, default=8)
    sub.add_parser("selftest")
    args = ap.parse_args()
    import json
    if args.cmd == "selftest":
        print(json.dumps(selftest()))
        return 0
    print(json.dumps(trim_archive(args.src, args.dst, args.margin, args.max_bits)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
