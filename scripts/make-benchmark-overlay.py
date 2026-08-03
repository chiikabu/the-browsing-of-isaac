#!/usr/bin/env python3
"""Build a deterministic, private Isaac save + benchmark-marker overlay."""

import argparse
import hashlib
import json
import os
import sys
import tempfile
import zlib
from pathlib import Path, PurePosixPath
from zipfile import ZIP_STORED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASE = ROOT / "web" / "emu" / "isaac-savedir.zip"
DEFAULT_OUTPUT = ROOT / "output" / "benchmark" / "isaac-benchmark-overlay.zip"
SAVE_LIMIT = 16 * 1024 * 1024
SAVE_ROOTS = (
    "home/username/.wine/drive_c/users/username/Documents/My Games/Binding of Isaac Repentance+",
    "home/username/.wine/drive_c/users/username/My Documents/My Games/Binding of Isaac Repentance+",
)
BASE_MEMBERS = frozenset(
    {
        f"{SAVE_ROOTS[0]}/",
        f"{SAVE_ROOTS[0]}/mods/",
        f"{SAVE_ROOTS[0]}/options.ini",
        f"{SAVE_ROOTS[0]}/savedatapath.txt",
        f"{SAVE_ROOTS[1]}/",
        f"{SAVE_ROOTS[1]}/mods/",
        f"{SAVE_ROOTS[1]}/options.ini",
    }
)
SEED_TEXT = "3W3E GJ7M"
SEED_NUMERIC = 3277667550
MARKER = (
    "[ISAAC_BENCH] floor_ready seed=3W3E GJ7M numeric=3277667550 "
    "player=0 room=start guest_frames=30"
)
METADATA = """<metadata>
  <name>Isaac deterministic benchmark marker</name>
  <directory>isaac-bench</directory>
  <id>isaac-bench</id>
  <description>Private one-shot floor-ready benchmark marker.</description>
  <version>1.0</version>
</metadata>
""".encode("utf-8")
MAIN_LUA = f"""local Bench = RegisterMod("IsaacBenchMarker", 1)
local SEED = "{SEED_TEXT}"
local NUMERIC = {SEED_NUMERIC}
local armed = false
local seenStart = false
local fired = false
local onStarted
local onNewRoom
local onUpdate

local function expectedStart()
  local game = Game()
  local seeds = game:GetSeeds()
  if seeds:GetStartSeedString() ~= SEED or seeds:GetStartSeed() ~= NUMERIC then
    return false
  end
  if Isaac.GetPlayer(0) == nil then
    return false
  end
  local level = game:GetLevel()
  return level:GetCurrentRoomIndex() == level:GetStartingRoomIndex()
end

onStarted = function(_, continued)
  armed = false
  seenStart = false
  fired = continued and true or false
end

onNewRoom = function()
  if not fired and not seenStart and expectedStart() then
    seenStart = true
    armed = true
  end
end

onUpdate = function()
  if fired or not armed then return end
  if not expectedStart() then
    armed = false
    return
  end
  if Game():GetRoom():GetFrameCount() < 30 then return end
  fired = true
  armed = false
  Isaac.DebugString("{MARKER}")
  Bench:RemoveCallback(ModCallbacks.MC_POST_GAME_STARTED, onStarted)
  Bench:RemoveCallback(ModCallbacks.MC_POST_NEW_ROOM, onNewRoom)
  Bench:RemoveCallback(ModCallbacks.MC_POST_UPDATE, onUpdate)
end

Bench:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, onStarted)
Bench:AddCallback(ModCallbacks.MC_POST_NEW_ROOM, onNewRoom)
Bench:AddCallback(ModCallbacks.MC_POST_UPDATE, onUpdate)
""".encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def validate_member_name(name: str) -> None:
    path = PurePosixPath(name)
    if not name or name.startswith("/") or "\\" in name or ".." in path.parts:
        raise SystemExit(f"unsafe ZIP member: {name!r}")


def read_base(path: Path) -> dict[str, bytes]:
    result: dict[str, bytes] = {}
    with ZipFile(path, "r") as archive:
        for info in archive.infolist():
            validate_member_name(info.filename)
            if info.flag_bits & 0x1:
                raise SystemExit(f"encrypted base member: {info.filename}")
            if info.filename in result:
                raise SystemExit(f"duplicate base member: {info.filename}")
            result[info.filename] = archive.read(info)
    if frozenset(result) != BASE_MEMBERS:
        extra = sorted(set(result) - BASE_MEMBERS)
        missing = sorted(BASE_MEMBERS - set(result))
        raise SystemExit(f"unexpected base overlay members; extra={extra}, missing={missing}")
    return result


def validate_save(data: bytes) -> bytes:
    if len(data) > SAVE_LIMIT:
        raise SystemExit(f"seed save exceeds {SAVE_LIMIT} bytes")
    if not data.startswith(b"ISAACNGSAVE"):
        raise SystemExit("seed save does not have an ISAACNGSAVE header")
    return data


def read_save_overlay(path: Path) -> bytes:
    expected = {
        f"{root}/persistentgamedata{slot}.dat"
        for root in SAVE_ROOTS
        for slot in range(1, 4)
    }
    with ZipFile(path, "r") as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if len(names) != len(set(names)):
            raise SystemExit("seed overlay contains duplicate members")
        for info in infos:
            validate_member_name(info.filename)
            if info.flag_bits & 0x1:
                raise SystemExit(f"encrypted seed-overlay member: {info.filename}")
        allowed = BASE_MEMBERS | expected
        if set(names) != allowed:
            extra = sorted(set(names) - allowed)
            missing = sorted(allowed - set(names))
            raise SystemExit(f"unexpected seed-overlay members; extra={extra}, missing={missing}")
        info_by_name = {info.filename: info for info in infos}
        for name in expected:
            if info_by_name[name].file_size > SAVE_LIMIT:
                raise SystemExit(f"seed-overlay member exceeds {SAVE_LIMIT} bytes: {name}")
        saves = [archive.read(name) for name in sorted(expected)]
    if any(data != saves[0] for data in saves[1:]):
        raise SystemExit("seed overlay persistent save members differ")
    return validate_save(saves[0])


def zip_info(name: str) -> ZipInfo:
    info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
    info.create_system = 3
    info.compress_type = ZIP_STORED
    mode = 0o40755 if name.endswith("/") else 0o100644
    info.external_attr = mode << 16
    return info


def main() -> None:
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--seed-save", type=Path)
    source.add_argument("--seed-overlay", type=Path)
    parser.add_argument("--base", type=Path, default=DEFAULT_BASE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    base = args.base.resolve()
    output = args.output.resolve()
    seed_source = (args.seed_save or args.seed_overlay).resolve()
    if output in {base, seed_source}:
        raise SystemExit("refusing to overwrite an input archive")

    if args.seed_save:
        if args.seed_save.stat().st_size > SAVE_LIMIT:
            raise SystemExit(f"seed save exceeds {SAVE_LIMIT} bytes")
        save = validate_save(args.seed_save.read_bytes())
    else:
        save = read_save_overlay(args.seed_overlay)
    members = read_base(base)
    for root in SAVE_ROOTS:
        options_name = f"{root}/options.ini"
        options = members[options_name]
        if options.count(b"EnableMods=0") != 1 or b"EnableMods=1" in options:
            raise SystemExit(f"expected exactly one disabled-mod setting in {options_name}")
        members[options_name] = options.replace(b"EnableMods=0", b"EnableMods=1")
        for slot in range(1, 4):
            members[f"{root}/persistentgamedata{slot}.dat"] = save
        members[f"{root}/mods/isaac-bench/metadata.xml"] = METADATA
        members[f"{root}/mods/isaac-bench/main.lua"] = MAIN_LUA

    output.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(prefix=output.name + ".", suffix=".tmp", dir=output.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        with ZipFile(temporary, "w", compression=ZIP_STORED, allowZip64=True) as archive:
            archive.comment = b""
            for name in sorted(members):
                validate_member_name(name)
                archive.writestr(zip_info(name), members[name])
        os.replace(temporary, output)
    finally:
        temporary.unlink(missing_ok=True)

    report = {
        "format": 1,
        "python": sys.version.split()[0],
        "zlib": zlib.ZLIB_VERSION,
        "baseSha256": sha256_file(base),
        "seedSha256": sha256_bytes(save),
        "output": str(output),
        "outputBytes": output.stat().st_size,
        "outputSha256": sha256_file(output),
        "members": [
            {"name": name, "bytes": len(members[name]), "sha256": sha256_bytes(members[name])}
            for name in sorted(members)
        ],
        "marker": MARKER,
    }
    print(json.dumps(report, separators=(",", ":"), sort_keys=True))


if __name__ == "__main__":
    main()
