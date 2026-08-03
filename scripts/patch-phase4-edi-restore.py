"""Build the reversible Phase-4 GameMenu EDI-preservation repair PE.

At the final pre-GameMenu call, 0x9ef5c0 returns with EDI changed from the live
menu-manager pointer to manager+0x1dc.  The caller immediately uses EDI as its
manager base, producing the invalid AnmCache receiver.  Redirect only that call
through a tiny ABI wrapper that saves and restores EDI.
"""

from hashlib import sha256
from pathlib import Path
import struct


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools" / "isaac-ng.unpacked.exe"
OUTPUT = ROOT / "tools" / "isaac-ng.unpacked.phase4.exe"
IMAGE_BASE = 0x00400000
CALL_VA = 0x00987C09
CALLEE_VA = 0x009EF5C0
CAVE_VA = 0x009AFD89
EXPECTED_CALL = bytes.fromhex("e8 b2 79 06 00")
CAVE_SIZE = 39


def va_to_file(data: bytes, va: int) -> int:
    pe = struct.unpack_from("<I", data, 0x3C)[0]
    section_count = struct.unpack_from("<H", data, pe + 6)[0]
    optional_size = struct.unpack_from("<H", data, pe + 20)[0]
    optional = pe + 24
    image_base = struct.unpack_from("<I", data, optional + 28)[0]
    if image_base != IMAGE_BASE:
        raise RuntimeError(f"unexpected image base 0x{image_base:08x}")
    sections = optional + optional_size
    rva = va - image_base
    for index in range(section_count):
        offset = sections + index * 40
        virtual_size, virtual_rva, raw_size, raw_offset = struct.unpack_from(
            "<IIII", data, offset + 8
        )
        if virtual_rva <= rva < virtual_rva + max(virtual_size, raw_size):
            return raw_offset + rva - virtual_rva
    raise RuntimeError(f"VA 0x{va:08x} is outside the image")


def rel32(source_va: int, target_va: int) -> bytes:
    return struct.pack("<i", target_va - (source_va + 5))


def main() -> None:
    data = bytearray(SOURCE.read_bytes())
    call_offset = va_to_file(data, CALL_VA)
    cave_offset = va_to_file(data, CAVE_VA)
    if data[call_offset : call_offset + 5] != EXPECTED_CALL:
        raise RuntimeError("pre-GameMenu call does not match the audited PE")
    if data[cave_offset : cave_offset + CAVE_SIZE] != b"\xCC" * CAVE_SIZE:
        raise RuntimeError("selected executable padding is no longer empty")

    # push edi; call 0x9ef5c0; pop edi; ret
    wrapper = b"\x57\xE8" + rel32(CAVE_VA + 1, CALLEE_VA) + b"\x5F\xC3"
    if len(wrapper) != 8:
        raise AssertionError(len(wrapper))
    data[call_offset : call_offset + 5] = b"\xE8" + rel32(CALL_VA, CAVE_VA)
    data[cave_offset : cave_offset + len(wrapper)] = wrapper

    OUTPUT.write_bytes(data)
    print(f"wrote {OUTPUT}")
    print(f"sha256 {sha256(data).hexdigest().upper()}")


if __name__ == "__main__":
    main()
