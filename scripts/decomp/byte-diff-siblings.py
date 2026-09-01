#!/usr/bin/env python3
"""Byte-diff sibling functions. CPU work for template hunts.

Usage:
  python scripts/decomp/byte-diff-siblings.py --bytes 0x5c 0x008c32d0 0x008c3330
  python scripts/decomp/byte-diff-siblings.py --stride 0x60 --count 10 0x008c32d0

VA via section table (never .text-only).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

EXE = Path(r"tools/isaac-ng.unpacked.exe")


def parse_pe(buf: bytes) -> dict:
    if buf[:2] != b"MZ":
        raise SystemExit("not MZ")
    pe = int.from_bytes(buf[0x3C:0x40], "little")
    if buf[pe : pe + 4] != b"PE\0\0":
        raise SystemExit("not PE")
    nsec = int.from_bytes(buf[pe + 6 : pe + 8], "little")
    opt = pe + 24
    if int.from_bytes(buf[opt : opt + 2], "little") != 0x10B:
        raise SystemExit("expected PE32")
    image_base = int.from_bytes(buf[opt + 28 : opt + 32], "little")
    opt_size = int.from_bytes(buf[pe + 20 : pe + 22], "little")
    sec0 = opt + opt_size
    sections = []
    for i in range(nsec):
        o = sec0 + i * 40
        sections.append(
            {
                "va": int.from_bytes(buf[o + 12 : o + 16], "little") + image_base,
                "vsize": int.from_bytes(buf[o + 8 : o + 12], "little"),
                "raw_size": int.from_bytes(buf[o + 16 : o + 20], "little"),
                "raw": int.from_bytes(buf[o + 20 : o + 24], "little"),
            }
        )
    return {"sections": sections}


def va_to_off(pe: dict, va: int) -> int:
    for s in pe["sections"]:
        span = max(s["vsize"], s["raw_size"])
        if s["va"] <= va < s["va"] + span:
            delta = va - s["va"]
            if delta >= s["raw_size"]:
                raise SystemExit(f"VA {va:#x} past raw end (BSS)")
            return s["raw"] + delta
    raise SystemExit(f"VA {va:#x} not in any section")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("vas", nargs="*", help="explicit VAs")
    ap.add_argument("--bytes", default="0x80")
    ap.add_argument("--stride", default=None)
    ap.add_argument("--count", type=int, default=0)
    ap.add_argument("--exe", default=str(EXE))
    args = ap.parse_args()
    n = int(args.bytes, 0)
    vas = [int(v, 0) for v in args.vas]
    if args.stride:
        if not vas:
            raise SystemExit("need a start VA for --stride")
        start = vas[0]
        stride = int(args.stride, 0)
        count = args.count or 2
        vas = [start + i * stride for i in range(count)]
    if len(vas) < 2:
        raise SystemExit("need >=2 VAs")
    buf = Path(args.exe).read_bytes()
    pe = parse_pe(buf)
    blobs = []
    for va in vas:
        off = va_to_off(pe, va)
        blobs.append(buf[off : off + n])
    diffs = []
    for i in range(n):
        vals = set()
        row = []
        for blob in blobs:
            b = blob[i] if i < len(blob) else None
            vals.add(b)
            row.append(f"{b:02x}" if b is not None else "??")
        if len(vals) > 1:
            diffs.append({"off": i, "bytes": row})
    identical = n - len(diffs)
    print(
        json.dumps(
            {
                "sha256": hashlib.sha256(buf).hexdigest(),
                "span": n,
                "sites": [f"0x{v:08x}" for v in vas],
                "identical": identical,
                "differing": len(diffs),
                "template_plausible": len(diffs) <= max(8, n // 10),
                "diff_offs": [d["off"] for d in diffs[:40]],
                "diffs_head": diffs[:16],
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
