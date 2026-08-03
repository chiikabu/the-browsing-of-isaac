"""Build a menu-navigation probe with a transparent one-frame intro.

The existing Phase-4 probe already contains the audited PE repair, the three
minimal local assets, and the structurally valid collapsed intro. This variant
aligns its duration with the retained one-frame tracks and hides those frames so
menus render unobscured.
Production archives remain untouched.
"""

from pathlib import Path
import re
from zipfile import ZIP_STORED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-nosfx-phase4-probe.zip"
OUTPUT = ROOT / "web" / "emu" / "isaac-nosfx-phase4-navprobe.zip"
TARGETS = {
    "gfx/cutscenes/intro.anm2",
    "resources/gfx/cutscenes/intro.anm2",
}
FRAME = re.compile(rb"<Frame\b[^>]*/>")


def hide_frames(data: bytes) -> bytes:
    data, animation_count = re.subn(
        rb'(<Animation\s+Name="Scene"\s+FrameNum=")2("\s+Loop="false">)',
        rb"\g<1>1\g<2>",
        data,
        count=1,
    )
    if animation_count != 1:
        raise RuntimeError("unexpected two-frame Scene animation header")

    def hide(match: re.Match[bytes]) -> bytes:
        frame = re.sub(rb'Visible="true"', b'Visible="false"', match.group())
        return re.sub(rb'AlphaTint="255"', b'AlphaTint="0"', frame)

    data, count = FRAME.subn(hide, data)
    if count < 2:
        raise RuntimeError(f"expected animation frames, found {count}")
    return data


def main() -> None:
    replaced = []
    with ZipFile(SOURCE, "r") as source, ZipFile(
        OUTPUT, "w", compression=ZIP_STORED, allowZip64=True
    ) as output:
        for info in source.infolist():
            data = source.read(info.filename)
            if info.filename.lower() in TARGETS:
                data = hide_frames(data)
                replaced.append(info.filename)
            output.writestr(info, data)
    if {name.lower() for name in replaced} != TARGETS:
        raise RuntimeError(f"missing intro copies: found {replaced}")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
