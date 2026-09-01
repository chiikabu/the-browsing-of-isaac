"""0x00685bc0 -- std::map<std::string,...>::lower_bound (__thiscall, ret 8).

    ecx        = &map            ([map] = sentinel, [sentinel+4] = root)
    [esp+4]    = out triple      (walk / bound / best, 12 bytes)
    [esp+8]    = &key            (MSVC basic_string)

MSVC _Tree node: +0 left, +4 parent, +8 right, +0xc colour, +0xd isnil,
key basic_string at +0x10.  The tree is built in the LOW ARENA so a JS
reference model can mirror it byte-for-byte at identical addresses.
"""
from __future__ import annotations

import struct

VA = 0x00685BC0
CC = "thiscall"
UNTIL = None

NODE_SIZE = 0x30
ARENA = 0x00010000
ALPHABET = "abcx"


def _mk_string(mem, at_off, s, heap_off=None):
    if len(s) < 0x10 and heap_off is None:
        mem[at_off:at_off + 0x10] = s + b"\0" * (0x10 - len(s))
        struct.pack_into("<II", mem, at_off + 0x10, len(s), 0xF)
    else:
        need = heap_off + len(s) + 1
        if need > len(mem):
            mem.extend(b"\0" * (need - len(mem)))
        mem[heap_off:heap_off + len(s) + 1] = s + b"\0"
        struct.pack_into("<I", mem, at_off, ARENA + heap_off)
        struct.pack_into("<II", mem, at_off + 0x10, len(s), max(len(s), 0x1F))


def build(o, rng):
    nk = rng.randrange(0, 16)
    keys = sorted({("".join(rng.choice(ALPHABET)
                            for _ in range(rng.randrange(0, 22)))).encode()
                   for _ in range(nk)})
    mem = bytearray(0x8000)
    cur = 0x100
    sentinel = ARENA + cur
    cur += NODE_SIZE
    heap_cur = 0x4000
    nodes = []
    for k in keys:
        nodes.append((ARENA + cur, k))
        cur += NODE_SIZE

    def place(lo, hi):
        nonlocal heap_cur
        if lo > hi:
            return sentinel
        mid = (lo + hi) // 2
        addr, key = nodes[mid]
        off = addr - ARENA
        left = place(lo, mid - 1)
        right = place(mid + 1, hi)
        struct.pack_into("<III", mem, off, left, sentinel, right)
        mem[off + 0x0C] = rng.randrange(2)
        mem[off + 0x0D] = 0
        if len(key) >= 0x10:
            _mk_string(mem, off + 0x10, key, heap_cur)
            heap_cur += len(key) + 9
        else:
            _mk_string(mem, off + 0x10, key)
        return addr

    root = place(0, len(nodes) - 1)
    soff = sentinel - ARENA
    struct.pack_into("<III", mem, soff, sentinel, root, sentinel)
    mem[soff + 0x0C] = 1
    mem[soff + 0x0D] = 1
    _mk_string(mem, soff + 0x10, b"")

    struct.pack_into("<I", mem, 0x40, sentinel)          # map -> sentinel
    if keys and rng.random() < 0.5:
        sk = rng.choice(keys)
    else:
        sk = ("".join(rng.choice(ALPHABET)
                      for _ in range(rng.randrange(0, 24)))).encode()
    if len(sk) >= 0x10:
        _mk_string(mem, 0x80, sk, heap_cur + 0x40)
    else:
        _mk_string(mem, 0x80, sk)

    o.write(ARENA, bytes(mem))
    return {"ecx": ARENA + 0x40, "edx": 0,
            "args": [ARENA + 0x60, ARENA + 0x80],
            "note": {"n_keys": len(keys), "search": sk.decode(),
                     "root": root, "sentinel": sentinel}}
