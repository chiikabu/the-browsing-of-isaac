"""Micro-benchmark: where does per-vector time actually go?"""
from __future__ import annotations

import os
import struct
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cfg as cfgmod        # noqa: E402
import emu as emumod        # noqa: E402
import peimage              # noqa: E402

N = 400


def timeit(label, fn, n=N):
    t0 = time.perf_counter()
    for i in range(n):
        fn(i)
    dt = time.perf_counter() - t0
    print(f"  {label:<42} {dt*1e6/n:8.1f} us/iter   {n/dt:9.1f}/s")
    return dt


def main():
    pe = peimage.load()
    starts = set(cfgmod.build_function_starts(
        pe, os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle",
                         "func_starts.json")))
    o = emumod.Oracle(pe)
    c = cfgmod.recover(pe, 0x0040D040, func_starts=starts)
    fb = frozenset(c.blocks)
    obj = struct.pack("<I", 0) + b"\0" * 0x0C + struct.pack("<II", 2, 15)

    print("component costs (0x0040d040, SSO path, 2 blocks):")
    timeit("reset_stack (1 MiB poison memwrite)", lambda i: o.reset_stack())
    timeit("reset_scratch (unmap all heap pages)", lambda i: o.reset_scratch())
    s = o.alloc(0x18, obj)
    timeit("alloc only", lambda i: o.alloc(0x18, obj))
    o.reset_scratch()
    s = o.alloc(0x18, obj)
    timeit("call (reset=False)",
           lambda i: o.call(0x0040D040, cc="thiscall", ecx=s, func_blocks=fb,
                            reset=False))
    timeit("call (reset=True)",
           lambda i: o.call(0x0040D040, cc="thiscall", ecx=s, func_blocks=fb))

    def full(i):
        o.reset_scratch()
        a = o.alloc(0x18, obj)
        r = o.call(0x0040D040, cc="thiscall", ecx=a, func_blocks=fb)
        o.restore_dirty(r)
    timeit("full vector (scratch+alloc+call+restore)", full)

    o2 = emumod.Oracle(pe, trace_calls=False, trace_writes=False,
                       trace_blocks=False)
    s2 = o2.alloc(0x18, obj)
    timeit("call, NO hooks at all",
           lambda i: o2.call(0x0040D040, cc="thiscall", ecx=s2, func_blocks=fb,
                             reset=False))
    o3 = emumod.Oracle(pe, trace_calls=False, trace_writes=True,
                       trace_blocks=True)
    s3 = o3.alloc(0x18, obj)
    timeit("call, writes+blocks hooks only",
           lambda i: o3.call(0x0040D040, cc="thiscall", ecx=s3, func_blocks=fb,
                             reset=False))


if __name__ == "__main__":
    main()
