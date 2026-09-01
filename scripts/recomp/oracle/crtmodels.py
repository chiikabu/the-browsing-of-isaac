"""Faithful in-emulator models for a handful of imported CRT/Win32 functions.

WHY THIS IS A SEPARATE CATEGORY FROM A STUB
-------------------------------------------
A *stub* returns 0 and does nothing; any vector whose result depended on one
is worthless as ground truth (see genrand: a stubbed malloc returns NULL and
the caller promptly dereferences it).  A *model* actually performs the
documented operation inside emulator memory, so the surrounding x86 keeps
running on real data.

A model is still not the original machine code.  Vectors record `stubs` and
`models` in two separate lists:

    pure         = term==ret, no stubs, no models, no fault, no poison
    pure_modulo_models = same but modelled CRT calls allowed

Only `pure` is x86-only ground truth.  `pure_modulo_models` is ground truth
conditional on malloc/memset/... behaving as documented -- a much weaker
assumption than "the callee did nothing", but it IS an assumption and it is
recorded per vector so a consumer can filter either way.

Every model is deterministic: the heap is a bump allocator reset per vector,
and clock-like functions return a fixed counter.  No wall-clock anywhere.
"""

from __future__ import annotations

import struct

# Each entry: label -> (handler, stdcall_pop_bytes)
#   handler(oracle, args) -> eax
# args are the first 8 dwords at [esp+4].


def _m_malloc(o, a):
    return o.model_alloc(a[0])


def _m_calloc(o, a):
    n = (a[0] * a[1]) & 0xFFFFFFFF
    p = o.model_alloc(n)
    if p:
        o.write(p, b"\0" * n)
    return p


def _m_realloc(o, a):
    old, n = a[0], a[1]
    p = o.model_alloc(n)
    if p and old:
        prev = o._model_blocks.get(old, 0)
        k = min(prev, n)
        if k:
            try:
                o.write(p, o.read(old, k))
            except Exception:
                pass
    return p


def _m_free(o, a):
    return 0


def _m_msize(o, a):
    return o._model_blocks.get(a[0], 0)


def _m_memset(o, a):
    d, c, n = a[0], a[1] & 0xFF, a[2]
    if n:
        o.write(d, bytes([c]) * n)
    return d


def _m_memcpy(o, a):
    d, s, n = a[0], a[1], a[2]
    if n:
        o.write(d, o.read(s, n))
    return d


def _m_memmove(o, a):
    d, s, n = a[0], a[1], a[2]
    if n:
        buf = o.read(s, n)
        o.write(d, buf)
    return d


def _m_memcmp(o, a):
    x, y, n = a[0], a[1], a[2]
    if not n:
        return 0
    bx, by = o.read(x, n), o.read(y, n)
    for i in range(n):
        if bx[i] != by[i]:
            return 1 if bx[i] > by[i] else 0xFFFFFFFF
    return 0


def _cstr(o, p, limit=0x10000):
    out = bytearray()
    while len(out) < limit:
        chunk = o.read(p + len(out), 64)
        z = chunk.find(b"\0")
        if z >= 0:
            out += chunk[:z]
            break
        out += chunk
    return bytes(out)


def _m_strlen(o, a):
    return len(_cstr(o, a[0]))


def _m_strcmp(o, a):
    x, y = _cstr(o, a[0]), _cstr(o, a[1])
    return 0 if x == y else (1 if x > y else 0xFFFFFFFF)


def _m_strcpy(o, a):
    s = _cstr(o, a[1])
    o.write(a[0], s + b"\0")
    return a[0]


def _m_ticks(o, a):
    o._model_tick = (getattr(o, "_model_tick", 0) + 1) & 0xFFFFFFFF
    return o._model_tick


def _m_qpc(o, a):
    o._model_tick = (getattr(o, "_model_tick", 0) + 1) & 0xFFFFFFFF
    o.write(a[0], struct.pack("<Q", o._model_tick))
    return 1


def _m_zero(o, a):
    return 0


def _m_one(o, a):
    return 1


MODELS: dict[str, tuple] = {}


def _reg(labels, fn, pop=0):
    for l in labels:
        MODELS[l] = (fn, pop)


_CRT_HEAP = "api-ms-win-crt-heap-l1-1-0.dll"
_CRT_STR = "api-ms-win-crt-string-l1-1-0.dll"
_CRT_RT = "api-ms-win-crt-runtime-l1-1-0.dll"
_VCR = "VCRUNTIME140.dll"

_reg([f"{_CRT_HEAP}!malloc"], _m_malloc)
_reg([f"{_CRT_HEAP}!calloc", f"{_CRT_HEAP}!_calloc_base"], _m_calloc)
_reg([f"{_CRT_HEAP}!realloc"], _m_realloc)
_reg([f"{_CRT_HEAP}!free"], _m_free)
_reg([f"{_CRT_HEAP}!_msize"], _m_msize)
_reg([f"{_VCR}!memset", f"{_CRT_STR}!memset"], _m_memset)
_reg([f"{_VCR}!memcpy", f"{_VCR}!memcpy_s", f"{_CRT_STR}!memcpy"], _m_memcpy)
_reg([f"{_VCR}!memmove", f"{_CRT_STR}!memmove"], _m_memmove)
_reg([f"{_VCR}!memcmp", f"{_CRT_STR}!memcmp"], _m_memcmp)
_reg([f"{_CRT_STR}!strlen", f"{_VCR}!strlen"], _m_strlen)
_reg([f"{_CRT_STR}!strcmp"], _m_strcmp)
_reg([f"{_CRT_STR}!strcpy", f"{_CRT_STR}!strcpy_s"], _m_strcpy)
_reg(["KERNEL32.dll!GetTickCount"], _m_ticks, pop=0)
_reg(["KERNEL32.dll!QueryPerformanceCounter"], _m_qpc, pop=4)


def install(oracle) -> int:
    """Bind every model whose import actually exists in this binary."""
    n = 0
    for label, (fn, pop) in MODELS.items():
        if oracle.bind_model(label, fn, pop):
            n += 1
    return n
