#!/usr/bin/env python3
"""Build a private BoxedWine save overlay from a user-owned Isaac save."""

import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASE = ROOT / "web" / "emu" / "isaac-savedir.zip"
DEFAULT_OUTPUT = ROOT / "web" / "emu" / "isaac-savedir-seeded.zip"
SAVE_ROOTS = (
    "home/username/.wine/drive_c/users/username/Documents/My Games/Binding of Isaac Repentance+",
    "home/username/.wine/drive_c/users/username/My Documents/My Games/Binding of Isaac Repentance+",
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("seed_save", type=Path)
    parser.add_argument("--base", type=Path, default=DEFAULT_BASE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    save = args.seed_save.read_bytes()
    if not save.startswith(b"ISAACNGSAVE"):
        raise SystemExit("seed save does not have an ISAACNGSAVE header")
    if args.output.resolve() == args.base.resolve():
        raise SystemExit("refusing to overwrite the base overlay")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.base, "r") as source, ZipFile(
        args.output, "w", compression=ZIP_DEFLATED, compresslevel=9
    ) as target:
        for info in source.infolist():
            target.writestr(info, source.read(info.filename))
        for root in SAVE_ROOTS:
            for slot in range(1, 4):
                target.writestr(f"{root}/persistentgamedata{slot}.dat", save)

    print(f"wrote {args.output} ({args.output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
