"""PE image loader for the recomp oracle.

Loads tools/isaac-ng.unpacked.exe as a flat image at its PREFERRED base
(0x400000) with per-section permissions.  Relocations are deliberately NOT
applied: the unpacked dump carries a bogus HIGHLOW entry at RVA 0x00531148
which corrupts code if relocated.  See docs note in the oracle README.

No unicorn dependency here so this module can be used for static analysis
alone (capstone-only paths).
"""

from __future__ import annotations

import hashlib
import os
import struct
from dataclasses import dataclass, field

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEFAULT_EXE = os.path.join(REPO_ROOT, "tools", "isaac-ng.unpacked.exe")

IMAGE_SCN_MEM_EXECUTE = 0x20000000
IMAGE_SCN_MEM_READ = 0x40000000
IMAGE_SCN_MEM_WRITE = 0x80000000


@dataclass
class Section:
    name: str
    va: int
    vsize: int
    raw_ptr: int
    raw_size: int
    characteristics: int

    @property
    def readable(self) -> bool:
        return bool(self.characteristics & IMAGE_SCN_MEM_READ)

    @property
    def writable(self) -> bool:
        return bool(self.characteristics & IMAGE_SCN_MEM_WRITE)

    @property
    def executable(self) -> bool:
        return bool(self.characteristics & IMAGE_SCN_MEM_EXECUTE)

    @property
    def end(self) -> int:
        return self.va + self.vsize


@dataclass
class ImportEntry:
    dll: str
    name: str
    ordinal: int | None
    iat_va: int

    @property
    def label(self) -> str:
        if self.name:
            return f"{self.dll}!{self.name}"
        return f"{self.dll}!#{self.ordinal}"


@dataclass
class PeImage:
    path: str
    sha256: str
    image_base: int
    size_of_image: int
    entry_point: int
    sections: list[Section]
    image: bytearray
    imports: list[ImportEntry] = field(default_factory=list)

    # ---- lookups -------------------------------------------------------
    def section_for_va(self, va: int) -> Section | None:
        for s in self.sections:
            if s.va <= va < s.end:
                return s
        return None

    def is_exec_va(self, va: int) -> bool:
        s = self.section_for_va(va)
        return bool(s and s.executable)

    def read(self, va: int, size: int) -> bytes:
        off = va - self.image_base
        if off < 0 or off + size > len(self.image):
            raise ValueError(f"read out of image: {va:#010x}+{size}")
        return bytes(self.image[off:off + size])

    def u32(self, va: int) -> int:
        return struct.unpack_from("<I", self.image, va - self.image_base)[0]

    @property
    def text(self) -> Section:
        for s in self.sections:
            if s.name == ".text":
                return s
        raise KeyError(".text not found")


def load(path: str = DEFAULT_EXE) -> PeImage:
    with open(path, "rb") as fh:
        raw = fh.read()
    sha = hashlib.sha256(raw).hexdigest()

    if raw[:2] != b"MZ":
        raise ValueError("not an MZ file")
    e_lfanew = struct.unpack_from("<I", raw, 0x3C)[0]
    if raw[e_lfanew:e_lfanew + 4] != b"PE\0\0":
        raise ValueError("bad PE signature")
    coff = e_lfanew + 4
    machine, num_sections = struct.unpack_from("<HH", raw, coff)
    if machine != 0x14C:
        raise ValueError(f"expected i386 (0x14c), got {machine:#x}")
    size_opt = struct.unpack_from("<H", raw, coff + 16)[0]
    opt = coff + 20
    magic = struct.unpack_from("<H", raw, opt)[0]
    if magic != 0x10B:
        raise ValueError(f"expected PE32 optional header (0x10b), got {magic:#x}")
    entry_rva = struct.unpack_from("<I", raw, opt + 16)[0]
    image_base = struct.unpack_from("<I", raw, opt + 28)[0]
    size_of_image = struct.unpack_from("<I", raw, opt + 56)[0]
    num_dirs = struct.unpack_from("<I", raw, opt + 92)[0]
    dirs = []
    for i in range(num_dirs):
        rva, sz = struct.unpack_from("<II", raw, opt + 96 + 8 * i)
        dirs.append((rva, sz))

    sec_tab = opt + size_opt
    sections: list[Section] = []
    for i in range(num_sections):
        off = sec_tab + 40 * i
        name = raw[off:off + 8].rstrip(b"\0").decode("latin1")
        vsize, vaddr, rsize, rptr = struct.unpack_from("<IIII", raw, off + 8)
        chars = struct.unpack_from("<I", raw, off + 36)[0]
        sections.append(Section(name, image_base + vaddr, vsize, rptr, rsize, chars))

    image = bytearray(size_of_image)
    # headers
    hdr_len = min(len(raw), sections[0].raw_ptr if sections else 0x400)
    image[0:hdr_len] = raw[0:hdr_len]
    for s in sections:
        n = min(s.raw_size, s.vsize)
        off = s.va - image_base
        image[off:off + n] = raw[s.raw_ptr:s.raw_ptr + n]

    pe = PeImage(
        path=os.path.abspath(path),
        sha256=sha,
        image_base=image_base,
        size_of_image=size_of_image,
        entry_point=image_base + entry_rva,
        sections=sections,
        image=image,
    )
    pe.imports = _parse_imports(pe, dirs)
    return pe


def _parse_imports(pe: PeImage, dirs) -> list[ImportEntry]:
    out: list[ImportEntry] = []
    if len(dirs) < 2:
        return out
    imp_rva, imp_size = dirs[1]
    if not imp_rva or not imp_size:
        return out
    base = pe.image_base
    p = imp_rva
    try:
        while True:
            desc = pe.read(base + p, 20)
            orig_first, _t, _f, name_rva, first_thunk = struct.unpack("<IIIII", desc)
            if not (orig_first or name_rva or first_thunk):
                break
            dll = _cstr(pe, base + name_rva) if name_rva else "?"
            lookup = orig_first or first_thunk
            i = 0
            while True:
                ent = pe.u32(base + lookup + 4 * i)
                if ent == 0:
                    break
                iat_va = base + first_thunk + 4 * i
                if ent & 0x80000000:
                    out.append(ImportEntry(dll, "", ent & 0xFFFF, iat_va))
                else:
                    nm = _cstr(pe, base + ent + 2)
                    out.append(ImportEntry(dll, nm, None, iat_va))
                i += 1
            p += 20
    except ValueError:
        pass
    return out


def _cstr(pe: PeImage, va: int, limit: int = 512) -> str:
    off = va - pe.image_base
    end = pe.image.find(b"\0", off, off + limit)
    if end < 0:
        end = off + limit
    return pe.image[off:end].decode("latin1")


if __name__ == "__main__":
    p = load()
    print(f"path      {p.path}")
    print(f"sha256    {p.sha256}")
    print(f"base      {p.image_base:#010x}  size_of_image {p.size_of_image:#x}")
    print(f"entry     {p.entry_point:#010x}")
    for s in p.sections:
        perm = "".join(c for c, f in
                       (("r", s.readable), ("w", s.writable), ("x", s.executable)) if f)
        print(f"  {s.name:<8} va {s.va:#010x} vsize {s.vsize:#08x} "
              f"raw {s.raw_ptr:#08x}/{s.raw_size:#08x} {perm}")
    print(f"imports   {len(p.imports)}")
    dlls = {}
    for e in p.imports:
        dlls.setdefault(e.dll, 0)
        dlls[e.dll] += 1
    for d, n in sorted(dlls.items()):
        print(f"  {d:<24} {n}")
    if p.imports:
        e = p.imports[0]
        print(f"  first: {e.label} iat {e.iat_va:#010x} slot={p.u32(e.iat_va):#010x}")
