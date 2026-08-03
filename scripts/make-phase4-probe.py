"""Combine fast-intro v2, the repaired PE, and minimal local floor assets.

The lean production archive intentionally omits the large Afterbirth/Repentance
packs. This diagnostic archive adds only the first proven-missing Gaper ANM2 and
its two referenced PNGs from the user's local extraction.
"""

from pathlib import Path
from zipfile import ZIP_STORED, ZipFile

from phase4_assets import add_floor_assets


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-nosfx-fastintro-v2.zip"
PE = ROOT / "tools" / "isaac-ng.unpacked.phase4.exe"
OUTPUT = ROOT / "web" / "emu" / "isaac-nosfx-phase4-probe.zip"


def main() -> None:
    replacement = PE.read_bytes()
    replaced = 0
    with ZipFile(SOURCE, "r") as source, ZipFile(
        OUTPUT, "w", compression=ZIP_STORED, allowZip64=True
    ) as output:
        for info in source.infolist():
            data = source.read(info.filename)
            if info.filename.lower() == "isaac-ng.exe":
                data = replacement
                replaced += 1
            output.writestr(info, data)
        add_floor_assets(output)
    if replaced != 1:
        raise RuntimeError(f"expected one isaac-ng.exe, replaced {replaced}")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes); added 3 floor assets")


if __name__ == "__main__":
    main()
