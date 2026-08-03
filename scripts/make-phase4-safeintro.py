"""Build a local playable Phase-4 runtime with a valid two-frame intro.

The production archive remains untouched. This evidence/runtime variant changes
only the two intro ANM2 entries: every declaration and track remains present,
and each track retains its first real frame with a one-frame delay. This is the
same structurally valid collapse already proven by the fast-intro v2 A/B probe.
"""

from pathlib import Path
import re
from zipfile import ZIP_STORED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-nosfx-phase4.zip"
OUTPUT = ROOT / "web" / "emu" / "isaac-nosfx-phase4-safeintro.zip"
TARGETS = {
    "gfx/cutscenes/intro.anm2",
    "resources/gfx/cutscenes/intro.anm2",
}
TRACK = re.compile(
    rb"(<(?:Root|Layer|Null)Animation\b[^>]*>)(.*?)(</(?:Root|Layer|Null)Animation>)",
    re.DOTALL,
)
FRAME = re.compile(rb"<Frame\b[^>]*/>")


def collapse_intro(data: bytes) -> bytes:
    data, animation_count = re.subn(
        rb'(<Animation\s+Name="Scene"\s+FrameNum=")4522("\s+Loop="false">)',
        rb"\g<1>2\g<2>",
        data,
        count=1,
    )
    if animation_count != 1:
        raise RuntimeError("unexpected Scene animation header")

    track_count = 0

    def collapse_track(match: re.Match[bytes]) -> bytes:
        nonlocal track_count
        first = FRAME.search(match.group(2))
        if first is None:
            raise RuntimeError("animation track has no frame")
        frame = re.sub(rb'Delay="\d+"', b'Delay="1"', first.group(), count=1)
        track_count += 1
        return match.group(1) + b"\r\n\t\t\t\t" + frame + b"\r\n\t\t\t" + match.group(3)

    data = TRACK.sub(collapse_track, data)
    if track_count < 2:
        raise RuntimeError(f"only collapsed {track_count} animation tracks")
    return data


def main() -> None:
    replaced = set()
    with ZipFile(SOURCE, "r") as source, ZipFile(
        OUTPUT, "w", compression=ZIP_STORED, allowZip64=True
    ) as output:
        for info in source.infolist():
            data = source.read(info.filename)
            name = info.filename.lower()
            if name in TARGETS:
                data = collapse_intro(data)
                replaced.add(name)
            output.writestr(info, data)
    if replaced != TARGETS:
        raise RuntimeError(f"missing intro copies: {TARGETS - replaced}")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
