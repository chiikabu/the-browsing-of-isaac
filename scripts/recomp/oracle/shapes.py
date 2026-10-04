"""Composable builders for the data shapes this binary actually uses.

A spec should be a few lines of composition, not raw struct.pack_into.  All
builders take an `Arena` and return the VA of the thing they built, so they
nest naturally:

    a = Arena(o)
    key   = a.msvc_string(b"boss")
    tree  = a.msvc_map([b"attic", b"boss", b"chest"])
    out   = a.blob(12)
    return {"ecx": tree, "args": [out, key], ...}

Two backing stores:
  * `Arena(o)`            -> the pre-mapped scratch pool.  Small blocks sit
                             flush against a guard page, so an overrun faults.
  * `Arena(o, low=True)`  -> the low arena at 0x00010000.  Use this when a JS
                             or C++ reference model has to mirror the same
                             bytes at the same absolute addresses.

MSVC layouts pinned from the disassembly of this binary (not from a header):
  basic_string  +0x00 union { char buf[16]; char* ptr; }
                +0x10 size            +0x14 capacity
                capacity <  0x10 -> data is inline at +0
                capacity >= 0x10 -> data is at *(char**)+0
  _Tree node    +0x00 left  +0x04 parent  +0x08 right
                +0x0c colour(0=red,1=black)  +0x0d isnil  +0x10 key
  vector        +0x00 first +0x04 last +0x08 end
"""

from __future__ import annotations

import struct

import emu as emumod

SSO_CAP = 0xF
SSO_LIMIT = 0x10
STRING_SIZE = 0x18
NODE_KEY_OFF = 0x10
NODE_SIZE = 0x30
TREE_LEFT, TREE_PARENT, TREE_RIGHT = 0x00, 0x04, 0x08
TREE_COLOUR, TREE_ISNIL = 0x0C, 0x0D


class Arena:
    """Allocation + struct helpers on top of Oracle scratch."""

    def __init__(self, o: emumod.Oracle, low: bool = False, low_base: int = 0):
        self.o = o
        self.low = low
        self._cur = (low_base or emumod.ARENA_BASE) + 0x100
        self._mem = bytearray(emumod.ARENA_SIZE) if low else None
        self._base = low_base or emumod.ARENA_BASE

    # -- raw ------------------------------------------------------------
    def blob(self, size: int, data: bytes | None = None, *, align: int = 4,
             pad_before: int = 0, page_start: bool = False) -> int:
        if self.low:
            addr = (self._cur + align - 1) & ~(align - 1)
            self._cur = addr + max(size, 1)
            if data:
                self._put(addr, data[:size])
            return addr
        return self.o.alloc(size, data, align=align, pad_before=pad_before,
                            page_start=page_start)

    def _put(self, va: int, data: bytes):
        off = va - self._base
        need = off + len(data)
        if need > len(self._mem):
            self._mem.extend(b"\0" * (need - len(self._mem)))
        self._mem[off:off + len(data)] = data

    def write(self, va: int, data: bytes):
        if self.low:
            self._put(va, data)
        else:
            self.o.write(va, data)

    def u32(self, va: int, value: int):
        self.write(va, struct.pack("<I", value & 0xFFFFFFFF))

    def u8(self, va: int, value: int):
        self.write(va, bytes([value & 0xFF]))

    def commit(self):
        """Low-arena only: push the staged bytes into emulator memory."""
        if self.low:
            self.o.write(self._base, bytes(self._mem))

    # -- MSVC shapes ----------------------------------------------------
    def msvc_string(self, s: bytes, *, force_heap: bool = False) -> int:
        """basic_string<char>.  Picks SSO or heap exactly like the binary."""
        at = self.blob(STRING_SIZE)
        self.fill_msvc_string(at, s, force_heap=force_heap)
        return at

    def fill_msvc_string(self, at: int, s: bytes, *, force_heap: bool = False):
        if len(s) < SSO_LIMIT and not force_heap:
            self.write(at, s + b"\0" * (SSO_LIMIT - len(s)))
            self.write(at + 0x10, struct.pack("<II", len(s), SSO_CAP))
        else:
            heap = self.blob(len(s) + 1, s + b"\0")
            self.u32(at, heap)
            self.write(at + 0x10,
                       struct.pack("<II", len(s), max(len(s), 0x1F)))

    def vector(self, elems: list[bytes]) -> int:
        """std::vector triple {first,last,end} over a packed element block."""
        blob = b"".join(elems)
        data = self.blob(max(len(blob), 4), blob) if blob else 0
        at = self.blob(12)
        self.write(at, struct.pack("<III", data, data + len(blob),
                                   data + len(blob)))
        return at

    def rb_sentinel(self) -> int:
        node = self.blob(NODE_SIZE)
        self.write(node, struct.pack("<III", node, node, node))
        self.u8(node + TREE_COLOUR, 1)
        self.u8(node + TREE_ISNIL, 1)
        self.fill_msvc_string(node + NODE_KEY_OFF, b"")
        return node

    def msvc_map(self, keys: list[bytes], *, value_size: int = 0,
                 colour=lambda i: i & 1) -> int:
        """A balanced std::map<string,...>.  Returns the map object address
        (one dword pointing at the sentinel), which is what `this` is."""
        keys = sorted(set(keys))
        sentinel = self.rb_sentinel()
        nodes = [self.blob(NODE_SIZE + value_size) for _ in keys]

        def place(lo, hi):
            if lo > hi:
                return sentinel
            mid = (lo + hi) // 2
            node = nodes[mid]
            left = place(lo, mid - 1)
            right = place(mid + 1, hi)
            self.write(node, struct.pack("<III", left, sentinel, right))
            self.u8(node + TREE_COLOUR, colour(mid))
            self.u8(node + TREE_ISNIL, 0)
            self.fill_msvc_string(node + NODE_KEY_OFF, keys[mid])
            return node

        root = place(0, len(nodes) - 1)
        self.u32(sentinel + TREE_PARENT, root)     # sentinel.parent == root
        at = self.blob(4)
        self.u32(at, sentinel)
        return at

    def object_with_vtable(self, size: int, slots: list[int],
                           fill: bytes | None = None) -> int:
        """Object whose +0 is a vtable pointer.  Unfilled slots point at a
        `ret`-only thunk so a virtual call returns instead of faulting."""
        vt = self.blob(max(4 * len(slots), 4),
                       b"".join(struct.pack("<I", s) for s in slots))
        obj = self.blob(size, fill)
        self.u32(obj, vt)
        return obj
