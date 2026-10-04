#!/usr/bin/env python3
"""Linear-decode PE spans via the section table. CPU work, not LLM work.

Usage:
  python scripts/decomp/dump-pe-span.py 0x00817c3d 0x00959720
  python scripts/decomp/dump-pe-span.py --bytes 0x400 0x00817c3d

Writes output/decomp/<hash12>/section-notes/cpu-dump/<va>.txt and prints JSON.
Resyncs on undecodable bytes (Capstone halt trap). Never uses a .text-only
VA formula — .rdata/.data go through the section table.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

from capstone import CS_ARCH_X86, CS_MODE_32, Cs
from capstone.x86 import X86_OP_IMM, X86_OP_MEM

ROOT = Path(__file__).resolve().parents[2]
EXE = Path(r"tools/isaac-ng.unpacked.exe")
IMAGE_BASE_FALLBACK = 0x400000


def parse_pe(buf: bytes) -> dict:
    if buf[:2] != b"MZ":
        raise SystemExit("not MZ")
    pe = int.from_bytes(buf[0x3C:0x40], "little")
    if buf[pe : pe + 4] != b"PE\0\0":
        raise SystemExit("not PE")
    nsec = int.from_bytes(buf[pe + 6 : pe + 8], "little")
    opt = pe + 24
    magic = int.from_bytes(buf[opt : opt + 2], "little")
    if magic != 0x10B:
        raise SystemExit(f"expected PE32, got {magic:#x}")
    image_base = int.from_bytes(buf[opt + 28 : opt + 32], "little")
    opt_size = int.from_bytes(buf[pe + 20 : pe + 22], "little")
    sec0 = opt + opt_size
    sections = []
    for i in range(nsec):
        o = sec0 + i * 40
        name = buf[o : o + 8].split(b"\0", 1)[0].decode("ascii", "replace")
        sections.append(
            {
                "name": name,
                "vsize": int.from_bytes(buf[o + 8 : o + 12], "little"),
                "va": int.from_bytes(buf[o + 12 : o + 16], "little") + image_base,
                "rva": int.from_bytes(buf[o + 12 : o + 16], "little"),
                "raw_size": int.from_bytes(buf[o + 16 : o + 20], "little"),
                "raw": int.from_bytes(buf[o + 20 : o + 24], "little"),
            }
        )
    return {"image_base": image_base, "sections": sections}


def va_to_off(pe: dict, va: int) -> tuple[int, dict]:
    for s in pe["sections"]:
        span = max(s["vsize"], s["raw_size"])
        if s["va"] <= va < s["va"] + span:
            delta = va - s["va"]
            if delta >= s["raw_size"]:
                raise SystemExit(
                    f"VA {va:#x} is past {s['name']} raw end "
                    f"(zero-at-load BSS; not file-backed)"
                )
            return s["raw"] + delta, s
    raise SystemExit(f"VA {va:#x} not in any section")


def decode_span(buf: bytes, pe: dict, va: int, nbytes: int, stop_at_ret: bool = False) -> dict:
    off, sec = va_to_off(pe, va)
    blob = buf[off : off + nbytes]
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    insns = []
    calls_e8 = []
    calls_ind = []
    stores = []
    rets = []
    resyncs = 0
    i = 0
    while i < len(blob):
        got = list(md.disasm(blob[i : i + 16], va + i, count=1))
        if not got:
            resyncs += 1
            i += 1
            continue
        insn = got[0]
        rec = {
            "va": insn.address,
            "bytes": blob[i : i + insn.size].hex(),
            "mnem": insn.mnemonic,
            "op": insn.op_str,
            "size": insn.size,
        }
        insns.append(rec)
        if insn.mnemonic == "call":
            if insn.operands and insn.operands[0].type == X86_OP_IMM:
                calls_e8.append({"site": insn.address, "target": insn.operands[0].imm})
            else:
                calls_ind.append({"site": insn.address, "op": insn.op_str})
        if insn.mnemonic in ("ret", "retn"):
            rets.append({"va": insn.address, "imm": insn.op_str})
        if insn.mnemonic.startswith("mov") and insn.operands:
            dst = insn.operands[0]
            if dst.type == X86_OP_MEM:
                stores.append({"va": insn.address, "op": insn.op_str})
        i += insn.size
        if stop_at_ret and rets and (va + i) - rets[0]["va"] >= 16:
            break
    first_ret = rets[0]["va"] if rets else None
    return {
        "va": va,
        "section": sec["name"],
        "file_off": off,
        "bytes_read": len(blob),
        "insns": len(insns),
        "resyncs": resyncs,
        "first_ret": first_ret,
        "ret_count": len(rets),
        "e8": calls_e8,
        "indirect_calls": calls_ind,
        "stores": stores,
        "listing": insns,
    }


def write_dump(out_dir: Path, rec: dict) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{rec['va']:08x}.txt"
    lines = [
        f"VA 0x{rec['va']:08x}  section {rec['section']}  file+0x{rec['file_off']:x}",
        f"insns {rec['insns']}  resyncs {rec['resyncs']}  first_ret "
        f"{('0x%08x' % rec['first_ret']) if rec['first_ret'] else 'NONE'}  "
        f"rets {rec['ret_count']}",
        f"E8 {len(rec['e8'])}  indirect {len(rec['indirect_calls'])}  "
        f"mem-stores {len(rec['stores'])}",
        "",
        "=== listing ===",
    ]
    for insn in rec["listing"]:
        lines.append(
            f"0x{insn['va']:08x}: {insn['bytes']:<20s} {insn['mnem']:8s} {insn['op']}"
        )
    lines.append("")
    lines.append("=== E8 ===")
    for c in rec["e8"]:
        lines.append(f"0x{c['site']:08x} -> 0x{c['target']:08x}")
    lines.append("")
    lines.append("=== indirect call ===")
    for c in rec["indirect_calls"]:
        lines.append(f"0x{c['site']:08x} {c['op']}")
    lines.append("")
    lines.append("=== mem stores ===")
    for s in rec["stores"]:
        lines.append(f"0x{s['va']:08x} {s['op']}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("vas", nargs="+", help="VAs like 0x00817c3d")
    ap.add_argument("--bytes", default="0x300", help="bytes to decode per VA")
    ap.add_argument(
        "--stop-at-ret",
        action="store_true",
        default=True,
        help="stop ~16 bytes after the first ret (default)",
    )
    ap.add_argument(
        "--no-stop-at-ret",
        action="store_false",
        dest="stop_at_ret",
        help="decode the full --bytes window even past ret",
    )
    ap.add_argument(
        "--skip-existing",
        action="store_true",
        help="reuse cpu-dump/<va>.txt when it already exists",
    )
    ap.add_argument("--exe", default=str(EXE))
    args = ap.parse_args()
    nbytes = int(args.bytes, 0)
    exe = Path(args.exe)
    buf = exe.read_bytes()
    digest = hashlib.sha256(buf).hexdigest()
    pe = parse_pe(buf)
    out_dir = ROOT / "output" / "decomp" / digest[:12] / "section-notes" / "cpu-dump"
    summaries = []
    for text in args.vas:
        va = int(text, 0)
        existing = out_dir / f"{va:08x}.txt"
        if args.skip_existing and existing.is_file():
            summaries.append(
                {
                    "va": f"0x{va:08x}",
                    "skipped": True,
                    "dump": str(existing.relative_to(ROOT)).replace("\\", "/"),
                }
            )
            continue
        rec = decode_span(buf, pe, va, nbytes, stop_at_ret=args.stop_at_ret)
        path = write_dump(out_dir, rec)
        summaries.append(
            {
                "va": f"0x{va:08x}",
                "section": rec["section"],
                "insns": rec["insns"],
                "resyncs": rec["resyncs"],
                "first_ret": None if rec["first_ret"] is None else f"0x{rec['first_ret']:08x}",
                "e8": [f"0x{c['target']:08x}" for c in rec["e8"]],
                "e8_count": len(rec["e8"]),
                "indirect": len(rec["indirect_calls"]),
                "stores": len(rec["stores"]),
                "dump": str(path.relative_to(ROOT)).replace("\\", "/"),
            }
        )
    print(
        json.dumps(
            {
                "sha256": digest,
                "exe": str(exe),
                "spans": summaries,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
