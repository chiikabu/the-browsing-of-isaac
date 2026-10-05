#!/usr/bin/env python3
"""Prepare the complete Ghidra/data-code-pointer union for the engine lift.

Keep every selected inventory entry, including recovery fragments: emit.py's
--fragments-tsv handles fragment absorption, not this source union.
The adjacent JSON sidecar records source hashes and measured counts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from scripts.decomp.tools.pe import EXPECTED_SHA256, PE_PATH
from codeptrs import code_pointers
from pe import PE32


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--exe", type=Path, default=PE_PATH,
                        help="canonical unpacked PE32 executable")
    parser.add_argument("--functions", type=Path,
                        default=ROOT / "output/recomp/export/functions.jsonl",
                        help="full Ghidra inventory JSONL (raw inventory also accepted)")
    parser.add_argument("--out", type=Path,
                        default=ROOT / "output/recomp/lift/starts_union.txt",
                        help="sorted starts list; provenance is written beside it as .json")
    args = parser.parse_args()
    exe = args.exe.resolve()
    functions = args.functions.resolve()
    out = args.out.resolve()
    sidecar = out.with_suffix(".json")
    if out == sidecar:
        parser.error("--out must not use the .json sidecar suffix")
    for destination in (out, sidecar):
        for source in (exe, functions):
            if destination == source or (
                destination.exists() and source.exists()
                and destination.samefile(source)
            ):
                parser.error(f"refusing to overwrite input {source}")

    try:
        pe = PE32(str(exe))
        pe_sha256 = hashlib.sha256(pe.data).hexdigest().upper()
        if pe_sha256 != EXPECTED_SHA256:
            raise ValueError(
                f"PE hash mismatch: {pe_sha256} != expected {EXPECTED_SHA256}. "
                "All recorded VAs are version-bound; re-inventory before analysis."
            )
        text = pe.text()
        text_lo, text_hi = text.vaddr, text.vaddr + text.vsize
        inventory_hash = hashlib.sha256()
        ghidra_starts = set()
        inventory_rows = selected_rows = 0
        with functions.open("rb") as inventory:
            for line_number, line in enumerate(inventory, 1):
                inventory_hash.update(line)
                if not line.strip():
                    continue
                inventory_rows += 1
                try:
                    record = json.loads(line)
                    if not isinstance(record, dict):
                        raise ValueError("expected a JSON object")
                    if not record.get("inText") or record.get("external"):
                        continue
                    va = int(record["va"], 16)
                    if not text_lo <= va < text_hi:
                        raise ValueError(
                            f"inText VA 0x{va:08x} outside PE .text "
                            f"[0x{text_lo:08x}, 0x{text_hi:08x})"
                        )
                except (KeyError, TypeError, ValueError) as error:
                    raise ValueError(f"{functions}:{line_number}: {error}") from error
                selected_rows += 1
                ghidra_starts.add(va)

        pointers = code_pointers(pe)
        pointer_targets = {target for slots in pointers.values() for _, target in slots}
        starts = ghidra_starts | pointer_targets
        starts_bytes = "".join(f"0x{va:08x}\n" for va in sorted(starts)).encode("ascii")
        counts = {
            "inventory_rows": inventory_rows,
            "ghidra_selected_rows": selected_rows,
            "ghidra_unique_starts": len(ghidra_starts),
            "data_code_pointer_slots": sum(len(slots) for slots in pointers.values()),
            "data_code_pointer_slots_by_section": {
                name: len(slots) for name, slots in sorted(pointers.items())
            },
            "data_code_pointer_unique_targets": len(pointer_targets),
            "overlap_unique_starts": len(ghidra_starts & pointer_targets),
            "data_code_pointer_added_starts": len(pointer_targets - ghidra_starts),
            "union_unique_starts": len(starts),
        }
        provenance = {
            "exe": str(exe),
            "pe_sha256": pe_sha256,
            "functions": str(functions),
            "inventory_sha256": inventory_hash.hexdigest().upper(),
            "text_start": f"0x{text_lo:08x}",
            "text_end_exclusive": f"0x{text_hi:08x}",
            "out": str(out),
            "starts_sha256": hashlib.sha256(starts_bytes).hexdigest().upper(),
            "counts": counts,
        }
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(starts_bytes)
        sidecar.write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    except (OSError, ValueError) as error:
        parser.error(str(error))

    print(json.dumps(counts, indent=2))
    print(f"wrote {out}")
    print(f"provenance {sidecar}")


if __name__ == "__main__":
    main()
