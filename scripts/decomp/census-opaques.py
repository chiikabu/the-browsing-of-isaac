#!/usr/bin/env python3
"""Rank remaining Update opaque VAs by first-ret size / E8 count.

Reads unique targetVa from decomp/game-update-slice.json, dumps each
via dump-pe-span (section table, resync, skip-existing), prints JSON
sorted cheapest-first. CPU work — not LLM decode.

Usage:
  python scripts/decomp/census-opaques.py
  python scripts/decomp/census-opaques.py --bytes 0x200
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = ROOT / "decomp" / "game-update-slice.json"
DUMP = ROOT / "scripts" / "decomp" / "dump-pe-span.py"


def unique_vas(spec: dict) -> list[int]:
    seen: set[int] = set()
    out: list[int] = []
    for rec in spec.get("opaqueBoundaries", []):
        raw = rec.get("targetVa")
        if not raw:
            continue
        va = int(raw, 0)
        if va in seen:
            continue
        seen.add(va)
        out.append(va)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bytes", default="0x180")
    ap.add_argument("--no-stop-at-ret", action="store_true")
    args = ap.parse_args()
    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    vas = unique_vas(spec)
    cmd = [
        sys.executable,
        str(DUMP),
        "--bytes",
        args.bytes,
        "--skip-existing",
    ]
    if args.no_stop_at_ret:
        cmd.append("--no-stop-at-ret")
    cmd.extend(f"0x{va:08x}" for va in vas)
    proc = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        return proc.returncode
    payload = json.loads(proc.stdout)
    rows = []
    for span in payload.get("spans", []):
        if span.get("skipped"):
            rows.append(
                {
                    "va": span["va"],
                    "skipped": True,
                    "dump": span.get("dump"),
                }
            )
            continue
        first = span.get("first_ret")
        start = int(span["va"], 16)
        size = (int(first, 16) - start) if first else None
        rows.append(
            {
                "va": span["va"],
                "insns": span.get("insns"),
                "first_ret": first,
                "bytes_to_ret": size,
                "e8": span.get("e8_count"),
                "indirect": span.get("indirect"),
                "stores": span.get("stores"),
                "cheap": bool(
                    first
                    and size is not None
                    and size <= 0x80
                    and (span.get("e8_count") or 0) <= 4
                ),
                "dump": span.get("dump"),
            }
        )
    rows.sort(
        key=lambda r: (
            0 if r.get("cheap") else 1,
            r.get("bytes_to_ret") if r.get("bytes_to_ret") is not None else 1 << 30,
            r.get("e8") if r.get("e8") is not None else 1 << 30,
        )
    )
    print(
        json.dumps(
            {
                "abiVersion": spec.get("abiVersion"),
                "uniqueVas": len(vas),
                "cheap": sum(1 for r in rows if r.get("cheap")),
                "rows": rows,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
