"""Build the local playable-floor archive without redistributing game data.

The Phase 4 safe-intro archive remains immutable. This derived archive keeps
its patched PE/stubs and adds the user's locally extracted non-audio resources
at the archive root expected by Isaac's resource loader. Music and SFX stay excluded because
the browser runtime intentionally starts with sound disabled.
"""

from __future__ import annotations

from hashlib import sha256
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "web" / "emu" / "isaac-nosfx-phase4-safeintro.zip"
EXTRACTED = ROOT / "extracted_work" / "extracted_resources" / "resources"
OUTPUT = ROOT / "web" / "emu" / "isaac-phase5-playable.zip"
SKIP_DIRECTORIES = {"music", "sfx"}


def digest(path: Path) -> str:
    value = sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest().upper()


if not SOURCE.is_file():
    raise SystemExit(f"missing Phase 4 archive: {SOURCE}")
if not EXTRACTED.is_dir():
    raise SystemExit(f"missing locally extracted resources: {EXTRACTED}")

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

    for path in sorted(EXTRACTED.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(EXTRACTED)
        if relative.parts and relative.parts[0].lower() in SKIP_DIRECTORIES:
            continue
        archive_name = relative.as_posix()
        if archive_name in names:
            continue
        output.write(path, archive_name, compress_type=ZIP_DEFLATED, compresslevel=6)
        names.add(archive_name)
        added += 1
        added_bytes += path.stat().st_size

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
