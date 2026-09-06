"""Smoke test: bring the oracle up and call a couple of known functions."""
from __future__ import annotations

import os
import struct
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

import cfg as cfgmod            # noqa: E402
import emu as emumod            # noqa: E402
import peimage                  # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")


def show(tag, r: emumod.RunResult):
    print(f"  {tag}: term={r.term} eax={r.regs['eax']:#010x} "
          f"esp_delta={r.regs['esp_delta']:#x} eflags={r.eflags:#05x} "
          f"pure={r.pure} stubs={r.stubs} fault="
          f"{None if r.fault_va is None else hex(r.fault_va)}/{r.fault_kind} "
          f"blocks={len(set(r.blocks))} writes={len(r.writes)} err={r.error}")


def main():
    t0 = time.time()
    pe = peimage.load()
    starts = set(cfgmod.build_function_starts(
        pe, os.path.join(OUT, "func_starts.json")))
    print(f"loaded pe + {len(starts)} direct-call function starts "
          f"in {time.time()-t0:.2f}s")

    o = emumod.Oracle(pe)
    print(f"oracle up in {time.time()-t0:.2f}s")

    # ---- 0x0040d040 : MSVC std::string tidy/deallocate (__thiscall) ----
    c = cfgmod.recover(pe, 0x0040D040, func_starts=starts)
    fb = frozenset(c.blocks)
    print(f"\n0x0040d040 blocks={c.block_count} calls={len(c.calls)}")

    # SSO string: capacity 15 -> no free at all, fully pure
    s = o.alloc(0x18, b"hi\0" + b"\0" * 0x0D + struct.pack("<II", 2, 15))
    r = o.call(0x0040D040, cc="thiscall", ecx=s, func_blocks=fb)
    show("sso(cap=15,size=2)", r)
    print(f"    obj after = {o.read(s, 0x18).hex()}")

    # heap string: capacity 0x20 -> takes the free path
    buf = o.alloc(0x40, b"A" * 0x21)
    s2 = o.alloc(0x18, struct.pack("<I", buf) + b"\0" * 0x0C +
                 struct.pack("<II", 0x20, 0x20))
    r = o.call(0x0040D040, cc="thiscall", ecx=s2, func_blocks=fb)
    show("heap(cap=0x20)", r)
    print(f"    obj after = {o.read(s2, 0x18).hex()}")
    for cr in r.calls[:8]:
        print(f"    call d{cr.depth} {cr.site:#010x} -> {cr.target:#010x} "
              f"stub={cr.stub} args={[hex(a) for a in cr.args[:3]]}")

    # ---- uninit / unmapped detection ----
    r = o.call(0x0040D040, cc="thiscall", ecx=0x21000000 + 0x777, func_blocks=fb)
    show("unmapped this", r)

    print(f"\ntotal {time.time()-t0:.2f}s")


if __name__ == "__main__":
    main()
