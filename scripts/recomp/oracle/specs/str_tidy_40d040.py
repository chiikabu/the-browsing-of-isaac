"""0x0040d040 -- MSVC std::string tidy/deallocate (__thiscall, ret 0).

    ecx = basic_string { +0 data-or-inline, +0x10 size, +0x14 capacity }

Four control-flow paths, all of which this spec reaches:
  capacity <  0x10               -> reset only (fully pure, no callee)
  capacity+1 <  0x1000           -> free(payload, capacity+1)
  capacity+1 >= 0x1000, delta ok -> free([payload-4], capacity+0x24)
  delta bad                      -> _invalid_parameter_noinfo_noreturn, int3
"""
from __future__ import annotations

import struct

VA = 0x0040D040
CC = "thiscall"
UNTIL = None

_CAPS = [0, 1, 0xE, 0xF, 0x10, 0x11, 0x1F, 0x20, 0xFFE, 0xFFF, 0x1000,
         0x1001, 0x2000, 0xFFFFFFFF]
_DELTAS = [0, 1, 3, 4, 5, 8, 0x10, 0x20, 0x23, 0x24, 0x30, 0x100]


def build(o, rng):
    cap = rng.choice(_CAPS) if rng.random() < 0.8 else rng.getrandbits(32)
    size = rng.randrange(0, 32)
    delta = rng.choice(_DELTAS)
    # 0x100 bytes of headroom below the payload so [payload-4] and the
    # header pointer are both inside mapped, recorded memory.
    buf = o.alloc(0x40, bytes(rng.getrandbits(8) for _ in range(0x40)),
                  pad_before=0x100)
    header = (buf - delta) & 0xFFFFFFFF
    o.write(buf - 4, struct.pack("<I", header))
    obj = o.alloc(0x18, struct.pack("<I", buf) + b"\0" * 0x0C +
                  struct.pack("<II", size, cap))
    return {"ecx": obj, "edx": 0, "args": [],
            "note": {"cap": cap, "size": size, "delta": delta,
                     "payload": buf, "header": header, "obj": obj}}
