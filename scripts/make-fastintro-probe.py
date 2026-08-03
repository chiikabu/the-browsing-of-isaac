"""Create a diagnostic app ZIP with only the startup intro duration shortened.

The production isaac-nosfx.zip is never modified. This variant exists solely to
reach the already-observed post-Menu-Save crash quickly enough for fault capture.
"""

from pathlib import Path
from zipfile import ZIP_STORED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-nosfx.zip"
OUTPUT = ROOT / "web" / "emu" / "isaac-nosfx-fastintro.zip"
TARGETS = {
    "gfx/cutscenes/intro.anm2",
    "resources/gfx/cutscenes/intro.anm2",
}
OLD = b'<Animation Name="Scene" FrameNum="4522" Loop="false">'
NEW = b'<Animation Name="Scene" FrameNum="60" Loop="false">'


def main() -> None:
    replaced = []
    with ZipFile(SOURCE, "r") as source, ZipFile(
        OUTPUT, "w", compression=ZIP_STORED, allowZip64=True
    ) as output:
        for info in source.infolist():
            data = source.read(info.filename)
            if info.filename.lower() in TARGETS:
                if data.count(OLD) != 1:
                    raise RuntimeError(f"unexpected intro animation in {info.filename}")
                data = data.replace(OLD, NEW)
                replaced.append(info.filename)
            output.writestr(info, data)

    if {name.lower() for name in replaced} != TARGETS:
        raise RuntimeError(f"missing intro copies: found {replaced}")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes); replaced {replaced}")


if __name__ == "__main__":
    main()
