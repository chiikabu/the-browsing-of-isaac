"""Typed input specs.

The survey shows the emulator is not the bottleneck -- input construction is.
Generic fuzzing hands a `this` pointer at a 32-byte random block, so a
function that reads [ecx+0x40] faults before it does anything interesting:
87.7% of blind vectors fault and only 17.3% of functions ever produce a
single pure vector.

A spec is a tiny Python module that knows the shape of one function's inputs.
With one, the same three functions go to 100% pure / 100% block coverage.
Writing a spec is exactly the kind of narrow, mechanical task an LLM can do
from a disassembly listing, and it is the multiplier for the whole pipeline.

Contract -- a spec module exports:

    CC      : "cdecl" | "stdcall" | "thiscall" | "fastcall"
    VA      : int
    UNTIL   : int | None      # optional early stop (pure prefix of a function)
    def build(o, rng) -> dict with keys {"ecx", "edx", "args", "note"}

`build` may allocate through `o.alloc(...)` / `o.write(...)`; the harness has
already called `o.reset_scratch()` and `o.reset_arena()`.
"""

from __future__ import annotations

import importlib
import os
import pkgutil

_DIR = os.path.dirname(__file__)


def available() -> dict[int, str]:
    out: dict[int, str] = {}
    for m in pkgutil.iter_modules([_DIR]):
        if m.name.startswith("_"):
            continue
        mod = importlib.import_module(f"specs.{m.name}")
        va = getattr(mod, "VA", None)
        if va is not None:
            out[va] = m.name
    return out


def load(name: str):
    return importlib.import_module(f"specs.{name}")


def for_va(va: int):
    name = available().get(va)
    return load(name) if name else None
