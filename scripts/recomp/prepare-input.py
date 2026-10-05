#!/usr/bin/env python3
"""Prepare the exact version-bound PE used by the local browser build.

Supply a pristine Steamless unpacked executable from your own game installation.
This offline tool applies only the 21 measured historical patch spans (170 bytes)
that distinguish that executable from the project's canonical PE. It is not an
unpacker and does not accept other game versions or download any game data.

Run: python scripts/recomp/prepare-input.py --input PATH_TO_UNPACKED_EXE
"""
from __future__ import annotations

import argparse
import hashlib
import os
import struct
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = REPO_ROOT / "tools" / "isaac-ng.unpacked.exe"
PRISTINE_SHA256 = "b4743967f3d31050f7b4222e42ac6beae6a0b7850b1f1adaac07ef7b94d01ec8"
CANONICAL_SHA256 = "5129df723e645daaea59514394195f3ea1dce1671bb0433d724648a845017200"
EXPECTED_FILE_SIZE = 9176064

# File offsets, expected pristine bytes, canonical replacement bytes. These are
# exact contiguous difference runs, not whole instructions or copied segments.
# Measured against both SHA-256-identified files; unlisted bytes stay pristine,
# including the final byte of every section. The last span is a data patch.
HISTORICAL_PATCHES = (
    (0x002F4598, "837e38007506837e3c007419", "85f67421837e3800741b9090"),  # VA 0x006F5198
    (0x003E9BCE, "837e38007506837e3c007419", "85f67421837e3800741b9090"),  # VA 0x007EA7CE
    (0x003E9FFE, "837e38007506837e3c007419", "85f67421837e3800741b9090"),  # VA 0x007EABFE
    (0x003EA091, "837e38007506837e3c007419", "85f67421837e3800741b9090"),  # VA 0x007EAC91
    (0x003EA22A, "837e38007506837e3c00741f", "85f67421837e3800741b9090"),  # VA 0x007EAE2A
    (0x003EA255, "837e30017506837e34017419", "85f67421837e3001741b9090"),  # VA 0x007EAE55
    (0x003EA2DB, "837e30017506837e34017419", "85f67421837e3001741b9090"),  # VA 0x007EAEDB
    (0x003F6912, "837e30017506837e34017419", "85f67421837e3001741b9090"),  # VA 0x007F7512
    (0x00530546, "ff15f489b100", "83c40433c090"),  # VA 0x00931146
    (0x00550BFC, "837e38007506837e3c007419", "85f67421837e3800741b9090"),  # VA 0x009517FC
    (0x005AAD70, "558bec", "33c0c3"),  # VA 0x009AB970
    (0x00618740, "558bec83ec08", "b8c0030000c3"),  # VA 0x00A19340
    (0x006187C0, "558bec83ec08", "b81c020000c3"),  # VA 0x00A193C0
    (0x0062A9C2, "807d14", "e91701"),  # VA 0x00A2B5C2
    (0x0062A9C6, "74", "00"),  # VA 0x00A2B5C6
    (0x0067FA2D, "68fc3cba", "a3b45ac7"),  # VA 0x00A8062D
    (0x0067FA32, "a3b45ac700ffd3", "33c09090909090"),  # VA 0x00A80632
    (0x00680130, "558bec81ec68010000a1b493bf00", "33c0c30000ff15d882b10033c0c3"),  # VA 0x00A80D30
    (0x00680790, "20", "00"),  # VA 0x00A81390
    (0x0068B9A7, "8338007436", "eb39909090"),  # VA 0x00A8C5A7
    (0x007A23A6, "000057696e33", "30305c783030"),  # VA 0x00BA3DA6
)

# Name, virtual size, RVA, raw size, raw offset, characteristics.
EXPECTED_SECTIONS = (
    (b".text", 0x716134, 0x1000, 0x716200, 0x400, 0x60000020),
    (b".rdata", 0xDF948, 0x718000, 0xDFA00, 0x716600, 0x40000040),
    (b".data", 0xA4AA4, 0x7F8000, 0x69E00, 0x7F6000, 0xC0000040),
    (b".rsrc", 0x3B20, 0x89D000, 0x3C00, 0x85FE00, 0x40000040),
    (b".reloc", 0x5C93C, 0x8A1000, 0x5CA00, 0x863A00, 0x42000040),
)


def validate_geometry(data: bytes) -> None:
    """Check the measured PE32 headers and section table before patching."""
    if data[:2] != b"MZ":
        raise ValueError("input is not an MZ executable")
    pe_offset = struct.unpack_from("<I", data, 0x3C)[0]
    if pe_offset != 0x140 or data[pe_offset:pe_offset + 4] != b"PE\0\0":
        raise ValueError("input PE signature/header offset does not match this version")
    coff = pe_offset + 4
    machine, section_count, timestamp, _, _, optional_size, _ = struct.unpack_from(
        "<HHIIIHH", data, coff)
    if (machine, section_count, timestamp, optional_size) != (0x14C, 5, 0x69E6E3A7, 0xE0):
        raise ValueError("input i386 PE32 COFF/version geometry does not match")
    optional = coff + 20
    magic = struct.unpack_from("<H", data, optional)[0]
    entry_rva = struct.unpack_from("<I", data, optional + 16)[0]
    image_base, section_align, file_align = struct.unpack_from("<III", data, optional + 28)
    image_size, header_size = struct.unpack_from("<II", data, optional + 56)
    if (magic, entry_rva, image_base, section_align, file_align, image_size, header_size) != (
        0x10B, 0x6EFC46, 0x400000, 0x1000, 0x200, 0x8FE000, 0x400
    ):
        raise ValueError("input PE32/base/entry/alignment geometry does not match")
    section_table = optional + optional_size
    for index, expected in enumerate(EXPECTED_SECTIONS):
        offset = section_table + 40 * index
        name = data[offset:offset + 8].rstrip(b"\0")
        virtual_size, rva, raw_size, raw_offset = struct.unpack_from("<IIII", data, offset + 8)
        characteristics = struct.unpack_from("<I", data, offset + 36)[0]
        if (name, virtual_size, rva, raw_size, raw_offset, characteristics) != expected:
            raise ValueError(f"input section {index} geometry does not match {expected[0]!r}")


def prepare(data: bytes) -> tuple[bytearray, str, int]:
    input_hash = hashlib.sha256(data).hexdigest()
    if len(data) != EXPECTED_FILE_SIZE or input_hash != PRISTINE_SHA256:
        raise ValueError(
            f"unsupported input: {len(data)} bytes, SHA-256 {input_hash}; expected "
            f"pristine Steamless output ({EXPECTED_FILE_SIZE} bytes, SHA-256 {PRISTINE_SHA256}). "
            "Other versions, packed Steam executables and already patched inputs are not accepted."
        )
    validate_geometry(data)
    # Validate every original span before allocating or mutating the result.
    patches = []
    for offset, original_hex, replacement_hex in HISTORICAL_PATCHES:
        original = bytes.fromhex(original_hex)
        replacement = bytes.fromhex(replacement_hex)
        if len(original) != len(replacement) or data[offset:offset + len(original)] != original:
            raise ValueError(f"historical patch original-byte mismatch at file offset 0x{offset:08x}")
        patches.append((offset, replacement))
    result = bytearray(data)
    for offset, replacement in patches:
        result[offset:offset + len(replacement)] = replacement
    output_hash = hashlib.sha256(result).hexdigest()
    if output_hash != CANONICAL_SHA256:
        raise ValueError(f"prepared SHA-256 {output_hash} does not match canonical {CANONICAL_SHA256}")
    return result, input_hash, sum(len(replacement) for _, replacement in patches)


def existing_output(output: Path, result: bytearray) -> bool:
    """Leave an existing canonical file intact; refuse all other existing bytes."""
    try:
        current = output.read_bytes()
    except FileNotFoundError:
        return False
    if current != result:
        raise ValueError(
            f"refusing to overwrite noncanonical output {output} "
            f"(SHA-256 {hashlib.sha256(current).hexdigest()})"
        )
    return True


def write_output(output: Path, result: bytearray) -> str:
    if existing_output(output, result):
        return "already canonical; unchanged"
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=output.parent, prefix=f".{output.name}.", suffix=".tmp", delete=False
        ) as stream:
            temporary = Path(stream.name)
            stream.write(result)
            stream.flush()
            os.fsync(stream.fileno())
        # Publish the complete file atomically without replacing any destination.
        # Hard links work on NTFS and normal local Unix filesystems. An unsupported
        # filesystem fails honestly, rather than falling back to a partial write.
        try:
            os.link(temporary, output)
        except FileExistsError:
            if existing_output(output, result):
                return "already canonical; unchanged"
            raise
        return "written atomically"
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", required=True, type=Path,
                        help="pristine Steamless unpacked PE from your own installation (read-only)")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT,
                        help="destination (default: repository tools/isaac-ng.unpacked.exe)")
    args = parser.parse_args(argv)
    try:
        input_path = args.input.resolve(strict=True)
        output_path = args.output.resolve()
        if input_path == output_path or (
            output_path.exists() and input_path.samefile(output_path)
        ):
            raise ValueError("output must not be the input file (including links to the same file)")
        result, input_hash, changed_bytes = prepare(input_path.read_bytes())
        status = write_output(output_path, result)
    except (OSError, ValueError, struct.error) as error:
        print(f"prepare-input: {error}", file=sys.stderr)
        return 1
    print(f"input:  {input_path}\nSHA-256 {input_hash}")
    print(f"output: {output_path}\nSHA-256 {CANONICAL_SHA256}")
    print(f"historical patches: {changed_bytes} changed bytes in {len(HISTORICAL_PATCHES)} runs; {status}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
