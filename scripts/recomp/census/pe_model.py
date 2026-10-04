"""Shared PE model for the host-boundary census.

Deliberately does its own header/section parsing so every number in the census
traces to bytes in the file rather than to a library's interpretation. pefile is
used only as an independent cross-check (see verify_with_pefile.py).

VA -> file offset ALWAYS goes through the real section table. A .text-only
formula is off by 0xE00 for .rdata in this image.
"""

import struct
import sys
from pathlib import Path

IMAGE_SCN_MEM_EXECUTE = 0x20000000
IMAGE_SCN_MEM_WRITE = 0x80000000
IMAGE_SCN_CNT_CODE = 0x00000020
IMAGE_SCN_CNT_INITIALIZED_DATA = 0x00000040
IMAGE_SCN_CNT_UNINITIALIZED_DATA = 0x00000080

DIR_NAMES = [
    "EXPORT", "IMPORT", "RESOURCE", "EXCEPTION", "SECURITY", "BASERELOC",
    "DEBUG", "ARCHITECTURE", "GLOBALPTR", "TLS", "LOAD_CONFIG", "BOUND_IMPORT",
    "IAT", "DELAY_IMPORT", "COM_DESCRIPTOR", "RESERVED",
]


class Section:
    __slots__ = ("name", "virtual_size", "rva", "raw_size", "raw_offset", "characteristics")

    def __init__(self, name, virtual_size, rva, raw_size, raw_offset, characteristics):
        self.name = name
        self.virtual_size = virtual_size
        self.rva = rva
        self.raw_size = raw_size
        self.raw_offset = raw_offset
        self.characteristics = characteristics

    @property
    def is_code(self):
        return bool(self.characteristics & IMAGE_SCN_MEM_EXECUTE)

    def contains_rva(self, rva):
        # Virtual footprint (may exceed raw footprint -> BSS-like tail).
        return self.rva <= rva < self.rva + max(self.virtual_size, self.raw_size)

    def to_dict(self):
        return {
            "name": self.name,
            "rva": self.rva,
            "va": None,
            "virtualSize": self.virtual_size,
            "rawSize": self.raw_size,
            "rawOffset": self.raw_offset,
            "characteristics": self.characteristics,
        }


class PE:
    def __init__(self, path):
        self.path = Path(path)
        self.data = self.path.read_bytes()
        d = self.data
        if d[:2] != b"MZ":
            raise ValueError("not an MZ image")
        self.pe_off = struct.unpack_from("<I", d, 0x3C)[0]
        if d[self.pe_off:self.pe_off + 4] != b"PE\0\0":
            raise ValueError("not a PE image")
        coff = self.pe_off + 4
        (self.machine, self.n_sections, self.timestamp, _symtab, _nsyms,
         self.opt_size, self.characteristics) = struct.unpack_from("<HHIIIHH", d, coff)
        opt = coff + 20
        self.opt_off = opt
        self.magic = struct.unpack_from("<H", d, opt)[0]
        if self.magic != 0x10B:
            raise ValueError("expected PE32 (0x10b), got 0x%x" % self.magic)
        self.size_of_code = struct.unpack_from("<I", d, opt + 4)[0]
        self.size_of_init_data = struct.unpack_from("<I", d, opt + 8)[0]
        self.size_of_uninit_data = struct.unpack_from("<I", d, opt + 12)[0]
        self.entry_rva = struct.unpack_from("<I", d, opt + 16)[0]
        self.base_of_code = struct.unpack_from("<I", d, opt + 20)[0]
        self.base_of_data = struct.unpack_from("<I", d, opt + 24)[0]
        self.image_base = struct.unpack_from("<I", d, opt + 28)[0]
        self.section_align = struct.unpack_from("<I", d, opt + 32)[0]
        self.file_align = struct.unpack_from("<I", d, opt + 36)[0]
        self.size_of_image = struct.unpack_from("<I", d, opt + 56)[0]
        self.size_of_headers = struct.unpack_from("<I", d, opt + 60)[0]
        self.subsystem = struct.unpack_from("<H", d, opt + 68)[0]
        self.dll_characteristics = struct.unpack_from("<H", d, opt + 70)[0]
        self.n_dirs = struct.unpack_from("<I", d, opt + 92)[0]
        self.dirs = {}
        for i in range(min(self.n_dirs, 16)):
            rva, size = struct.unpack_from("<II", d, opt + 96 + i * 8)
            self.dirs[DIR_NAMES[i]] = (rva, size)

        sec_off = opt + self.opt_size
        self.sections = []
        for i in range(self.n_sections):
            o = sec_off + i * 40
            raw_name = d[o:o + 8]
            name = raw_name.split(b"\0")[0].decode("ascii", "replace")
            vs, rva, rs, ro = struct.unpack_from("<IIII", d, o + 8)
            ch = struct.unpack_from("<I", d, o + 36)[0]
            self.sections.append(Section(name, vs, rva, rs, ro, ch))

    # --- address translation, always via the section table -----------------
    def section_for_rva(self, rva):
        for s in self.sections:
            if s.contains_rva(rva):
                return s
        return None

    def rva_to_off(self, rva):
        s = self.section_for_rva(rva)
        if s is None:
            return None
        delta = rva - s.rva
        if delta >= s.raw_size:
            return None  # inside the BSS-like tail; no bytes on disk
        return s.raw_offset + delta

    def va_to_off(self, va):
        return self.rva_to_off(va - self.image_base)

    def off_to_rva(self, off):
        for s in self.sections:
            if s.raw_size and s.raw_offset <= off < s.raw_offset + s.raw_size:
                return s.rva + (off - s.raw_offset)
        return None

    def read_at_rva(self, rva, n):
        off = self.rva_to_off(rva)
        if off is None:
            return None
        return self.data[off:off + n]

    def u32_at_rva(self, rva):
        b = self.read_at_rva(rva, 4)
        if not b or len(b) < 4:
            return None
        return struct.unpack("<I", b)[0]

    def cstr_at_rva(self, rva, limit=512):
        off = self.rva_to_off(rva)
        if off is None:
            return None
        end = self.data.find(b"\0", off, off + limit)
        if end < 0:
            end = off + limit
        return self.data[off:end].decode("ascii", "replace")

    def section(self, name):
        for s in self.sections:
            if s.name == name:
                return s
        return None


def default_target(repo_root=None):
    root = Path(repo_root) if repo_root else Path(__file__).resolve().parents[3]
    return root / "tools" / "isaac-ng.unpacked.exe"


if __name__ == "__main__":
    pe = PE(sys.argv[1] if len(sys.argv) > 1 else default_target())
    print("file            :", pe.path, len(pe.data), "bytes")
    print("machine         : 0x%04x" % pe.machine)
    print("image base      : 0x%08x" % pe.image_base)
    print("entry           : rva 0x%x  va 0x%08x" % (pe.entry_rva, pe.image_base + pe.entry_rva))
    print("subsystem       :", pe.subsystem, " dllchar 0x%04x" % pe.dll_characteristics)
    print("sizeOfImage     : 0x%x" % pe.size_of_image)
    print("sizeOfCode      : 0x%x  initData 0x%x  uninitData 0x%x" % (
        pe.size_of_code, pe.size_of_init_data, pe.size_of_uninit_data))
    print("\nsections:")
    print("  %-9s %-10s %-10s %-10s %-10s %s" % ("name", "rva", "vsize", "rawsz", "rawoff", "char"))
    for s in pe.sections:
        print("  %-9s 0x%08x 0x%08x 0x%08x 0x%08x 0x%08x" % (
            s.name, s.rva, s.virtual_size, s.raw_size, s.raw_offset, s.characteristics))
    print("\ndata directories (non-empty):")
    for k, (rva, size) in pe.dirs.items():
        if rva or size:
            sec = pe.section_for_rva(rva)
            print("  %-15s rva 0x%08x size 0x%-8x  -> %s  off=%s" % (
                k, rva, size, sec.name if sec else "??",
                hex(pe.rva_to_off(rva)) if pe.rva_to_off(rva) is not None else "None"))
