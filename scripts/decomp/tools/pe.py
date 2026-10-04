#!/usr/bin/env python3
"""Shared PE analysis primitives for the decomp toolkit.

Every VA<->offset conversion in the toolkit goes through the section table
parsed FROM THE PE HEADER of the exact local binary. Never hardcode section
geometry (a fixed .text-only formula is wrong by 0xE00 for .rdata and returns
plausible garbage instead of failing — measured, see AGENTS.md).

Zero-at-load awareness: bytes past a section's raw size are zero at load and
NOT file-backed. `va_to_off` raises on them by default; `read_va` can return
synthesized zeros with an explicit flag instead.
"""
from __future__ import annotations

import hashlib
import struct
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
PE_PATH = REPO_ROOT / "tools" / "isaac-ng.unpacked.exe"
EXPECTED_SHA256 = "5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200"


@dataclass(frozen=True)
class Section:
    name: str
    va: int          # absolute VA (image base applied)
    vsize: int
    raw_ptr: int
    raw_size: int

    @property
    def va_end(self) -> int:
        return self.va + self.vsize

    def contains(self, va: int) -> bool:
        return self.va <= va < self.va_end


class ZeroAtLoad(Exception):
    """VA is inside a section's virtual range but past its raw data: the byte
    is zero at load and not file-backed."""


class PEImage:
    def __init__(self, path: Path = PE_PATH, verify_hash: bool = True):
        self.path = path
        self.buf = path.read_bytes()
        self.sha256 = hashlib.sha256(self.buf).hexdigest().upper()
        if verify_hash and self.sha256 != EXPECTED_SHA256:
            raise RuntimeError(
                f"PE hash mismatch: {self.sha256} != expected {EXPECTED_SHA256}. "
                "All recorded VAs are version-bound; re-inventory before analysis."
            )
        self._parse_headers()

    # -- header parsing -----------------------------------------------------
    def _parse_headers(self) -> None:
        buf = self.buf
        if buf[:2] != b"MZ":
            raise ValueError("not an MZ executable")
        e_lfanew = struct.unpack_from("<I", buf, 0x3C)[0]
        if buf[e_lfanew : e_lfanew + 4] != b"PE\0\0":
            raise ValueError("PE signature missing")
        coff = e_lfanew + 4
        machine, nsec, _, _, _, opt_size, _ = struct.unpack_from("<HHIIIHH", buf, coff)
        if machine != 0x14C:
            raise ValueError(f"expected i386 PE32, machine=0x{machine:x}")
        opt = coff + 20
        magic = struct.unpack_from("<H", buf, opt)[0]
        if magic != 0x10B:
            raise ValueError(f"expected PE32 optional header, magic=0x{magic:x}")
        self.entry_rva = struct.unpack_from("<I", buf, opt + 16)[0]
        self.image_base = struct.unpack_from("<I", buf, opt + 28)[0]
        num_dirs = struct.unpack_from("<I", buf, opt + 92)[0]
        self.data_dirs = [
            struct.unpack_from("<II", buf, opt + 96 + 8 * i) for i in range(num_dirs)
        ]
        sec_off = opt + opt_size
        self.sections: list[Section] = []
        for i in range(nsec):
            o = sec_off + 40 * i
            name = buf[o : o + 8].rstrip(b"\0").decode("ascii", "replace")
            vsize, rva, rsize, rptr = struct.unpack_from("<IIII", buf, o + 8)
            self.sections.append(
                Section(name, self.image_base + rva, vsize, rptr, rsize)
            )
        self.image_end = max(s.va_end for s in self.sections)

    # -- address mapping ----------------------------------------------------
    def section_of(self, va: int) -> Section | None:
        for s in self.sections:
            if s.contains(va):
                return s
        return None

    def va_to_off(self, va: int) -> int:
        """File offset for VA. Raises KeyError if unmapped, ZeroAtLoad if the
        VA is virtual-only (zero at load)."""
        s = self.section_of(va)
        if s is None:
            raise KeyError(f"VA 0x{va:08x} not in any section")
        delta = va - s.va
        if delta >= s.raw_size:
            raise ZeroAtLoad(
                f"VA 0x{va:08x} is 0x{delta - s.raw_size:x} bytes past {s.name} "
                f"raw end: zero at load, not file-backed"
            )
        return s.raw_ptr + delta

    def in_image(self, va: int) -> bool:
        return self.section_of(va) is not None

    def read_va(self, va: int, n: int) -> tuple[bytes, int]:
        """Read n bytes at VA. Returns (bytes, synthesized_zero_count).
        Bytes past raw section end come back as zeros with the count > 0 so a
        caller can never mistake zero-at-load for file content silently."""
        s = self.section_of(va)
        if s is None:
            raise KeyError(f"VA 0x{va:08x} not in any section")
        delta = va - s.va
        avail = max(0, min(n, s.raw_size - delta))
        out = self.buf[s.raw_ptr + delta : s.raw_ptr + delta + avail]
        synth = n - avail
        if synth:
            out = out + b"\0" * synth
        return out, synth

    def u32(self, va: int) -> int:
        data, _ = self.read_va(va, 4)
        return struct.unpack("<I", data)[0]

    def cstr(self, va: int, limit: int = 512) -> bytes:
        data, _ = self.read_va(va, limit)
        end = data.find(b"\0")
        return data[: end if end >= 0 else limit]

    @property
    def text(self) -> Section:
        for s in self.sections:
            if s.name == ".text":
                return s
        raise KeyError(".text section missing")

    # -- imports ------------------------------------------------------------
    def imports(self) -> dict[int, str]:
        """Map IAT slot VA -> 'dll!symbol' (or 'dll!#ordinal')."""
        out: dict[int, str] = {}
        if len(self.data_dirs) <= 1 or self.data_dirs[1][0] == 0:
            return out
        desc_va = self.image_base + self.data_dirs[1][0]
        while True:
            try:
                off = self.va_to_off(desc_va)
            except (KeyError, ZeroAtLoad):
                break
            olt, _, _, name_rva, iat_rva = struct.unpack_from("<IIIII", self.buf, off)
            if olt == 0 and name_rva == 0 and iat_rva == 0:
                break
            dll = self.cstr(self.image_base + name_rva).decode("ascii", "replace")
            lookup_rva = olt or iat_rva
            i = 0
            while True:
                entry = self.u32(self.image_base + lookup_rva + 4 * i)
                if entry == 0:
                    break
                slot_va = self.image_base + iat_rva + 4 * i
                if entry & 0x80000000:
                    out[slot_va] = f"{dll}!#{entry & 0xFFFF}"
                else:
                    sym = self.cstr(self.image_base + entry + 2).decode("ascii", "replace")
                    out[slot_va] = f"{dll}!{sym}"
                i += 1
            desc_va += 20
        return out


def hash12(pe: PEImage) -> str:
    return pe.sha256[:12].lower()


def index_dir(pe: PEImage) -> Path:
    return REPO_ROOT / "output" / "decomp" / hash12(pe) / "index"


def index_db_path(pe: PEImage) -> Path:
    return index_dir(pe) / "pe-index.sqlite"
