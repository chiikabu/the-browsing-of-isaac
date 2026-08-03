"""Build the production-timeline Phase-4 runtime archive locally.

This keeps the proven lean archive immutable while replacing its PE with the
audited EDI-preservation build, installing the local offline Steam stub, and
adding only the three proven-missing local Gaper files. No proprietary input
leaves the machine.
"""

from pathlib import Path
from zipfile import ZIP_STORED, ZipFile

from phase4_assets import add_floor_assets


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-nosfx.zip"
PE = ROOT / "tools" / "isaac-ng.unpacked.phase4.exe"
STEAM = ROOT / "native" / "steam_stub" / "steam_api.dll"
OUTPUT = ROOT / "web" / "emu" / "isaac-nosfx-phase4.zip"


def main() -> None:
    replacements = {
        "isaac-ng.exe": PE.read_bytes(),
        "steam_api.dll": STEAM.read_bytes(),
    }
    replaced = set()
    with ZipFile(SOURCE, "r") as source, ZipFile(
        OUTPUT, "w", compression=ZIP_STORED, allowZip64=True
    ) as output:
        for info in source.infolist():
            data = source.read(info.filename)
            name = info.filename.lower()
            if name in replacements:
                data = replacements[name]
                replaced.add(name)
            output.writestr(info, data)
        add_floor_assets(output)
    if replaced != replacements.keys():
        raise RuntimeError(f"missing replacements: {replacements.keys() - replaced}")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes); added 3 floor assets")


if __name__ == "__main__":
    main()
