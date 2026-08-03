"""Build the complete local game archive from the proven Phase 5 image.

The output is intentionally ignored by git.  It adds the user's locally
owned, already-packed music, SFX, and video archives without changing the
immutable Phase 4/5 evidence archives. Keeping the original packs avoids the
space and load-time cost of thousands of expanded loose files.
"""

from __future__ import annotations

from hashlib import sha256
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-phase5-playable.zip"
PACKED = ROOT / ".scratch" / "isaac-app-stage" / "resources" / "packed"
OUTPUT = ROOT / "web" / "emu" / "isaac-phase6-full.zip"
PACK_NAMES = ("music.a", "sfx.a", "videos.a")


def digest(path: Path) -> str:
    value = sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest().upper()


for required in (SOURCE, *(PACKED / name for name in PACK_NAMES)):
    if not required.is_file():
        raise SystemExit(f"missing local input: {required}")

if OUTPUT.exists():
    OUTPUT.unlink()

names: set[str] = set()
added = 0
added_bytes = 0
with ZipFile(SOURCE, "r") as source, ZipFile(
    OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=6, allowZip64=True
) as output:
    for entry in source.infolist():
        if entry.is_dir():
            continue
        data = source.read(entry)
        clone = ZipInfo(entry.filename, entry.date_time)
        clone.external_attr = entry.external_attr
        clone.create_system = entry.create_system
        output.writestr(clone, data, compress_type=ZIP_DEFLATED, compresslevel=6)
        names.add(entry.filename.replace("\\", "/"))

    for pack_name in PACK_NAMES:
        pack_path = PACKED / pack_name
        archive_name = f"resources/packed/{pack_name}"
        if archive_name not in names:
            output.write(pack_path, archive_name, compress_type=ZIP_DEFLATED, compresslevel=6)
            names.add(archive_name)
            added += 1
            added_bytes += pack_path.stat().st_size

print(
    {
        "output": str(OUTPUT),
        "entries": len(names),
        "added_entries": added,
        "added_bytes": added_bytes,
        "output_bytes": OUTPUT.stat().st_size,
        "sha256": digest(OUTPUT),
    }
)
