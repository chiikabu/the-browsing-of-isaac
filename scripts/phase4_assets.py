"""Local-only loose assets required by the current Phase-4 floor probe."""

from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
EXTRACTED_GFX = (
    ROOT / "extracted_work" / "extracted_resources" / "resources" / "gfx"
)
ASSETS = {
    "010.000_Frowning Gaper.anm2": "010.000_frowning gaper.anm2",
    "Monsters/Classic/Monster_000_Bodies01.png": (
        "monsters/classic/monster_000_bodies01.png"
    ),
    "Monsters/Classic/Monster_024_FrowningGaper.png": (
        "monsters/classic/monster_024_frowninggaper.png"
    ),
}


def add_floor_assets(output: ZipFile) -> None:
    for archive_relative, extracted_relative in ASSETS.items():
        source = EXTRACTED_GFX / extracted_relative
        output.write(source, f"resources/gfx/{archive_relative}")
        output.write(source, f"gfx/{archive_relative}")
