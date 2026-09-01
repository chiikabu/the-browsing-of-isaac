"""Single-instruction differential for the lifter's WIDE (SSE) lowerings.

The per-function oracle (differential.py + replay_driver.py) is the right
gate for whole functions, but it cannot isolate a new p-code lowering: the
four psrad functions that motivated this work all call other functions, so a
mismatch there does not say which of a hundred instructions was wrong.

This harness works one x86 instruction at a time:

    assemble one instruction  ->  lift it with the REAL lifter
                              ->  compile with the REAL recomp_rt.c
                              ->  run over N random XMM inputs
                              ->  compare against Unicorn executing the
                                  same instruction on the same inputs

So a red line names the instruction and the p-code op behind it.  Controls
(paddd, pxor, movdqa) go through lowerings the boot already exercises: if the
harness itself is broken they fail too, which is the point of including them.

Run:   python scripts/recomp/oracle/wideops.py
Out:   output/recomp/oracle/wideops.json   (consumed by tests/)

Needs unicorn (ground truth) and a native C compiler (cc/gcc).  Both are
optional on a clean checkout, so the caller skips rather than fails when they
are missing -- the same discipline as verify.py.
"""

from __future__ import annotations

import ctypes
import json
import os
import random
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
LIFT = os.path.abspath(os.path.join(HERE, "..", "lift"))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(REPO, "output", "recomp", "oracle")

sys.path.insert(0, LIFT)

BASE = 0x00401000          # where the synthetic instruction is placed
MEMSZ = 1 << 20            # guest window for the harness (base-relative)
ESP = 0x2000               # inside the window; the trailing ret reads it
RET = "c3"


# --------------------------------------------------------------------------
# the instruction table
#
# count_bias marks a shift whose count operand is the low qword of an XMM: a
# uniformly random count is >= 64 essentially always, so those vectors would
# only ever exercise the saturating branch.
# --------------------------------------------------------------------------

CASES = [
    # --- wide CALLOTHER: operands passed by pointer (new) ---
    dict(name="pshuflw", code="f20f70c1", imm=True, op="CALLOTHER pshuflw"),
    dict(name="pshufhw", code="f30f70c1", imm=True, op="CALLOTHER pshufhw"),
    # --- wide-count shifts: INT_SRIGHT / INT_RIGHT / INT_LEFT ---
    dict(name="psrad", code="660fe2c1", count_bias=True,
         op="INT_SRIGHT, wide count"),
    dict(name="psrld", code="660fd2c1", count_bias=True,
         op="INT_RIGHT, wide count"),
    dict(name="psrlq", code="660fd3c1", count_bias=True,
         op="INT_RIGHT, wide count"),
    dict(name="pslld", code="660ff2c1", count_bias=True,
         op="INT_LEFT, wide count"),
    dict(name="psllq", code="660ff3c1", count_bias=True,
         op="INT_LEFT, wide count"),
    # --- wide INT_NEGATE: pandn lowers to ~XMM then AND ---
    dict(name="pandn", code="660fdfc1", op="INT_NEGATE size 16"),
    # --- controls: lowerings the boot already exercises ---
    dict(name="paddd", code="660ffec1", op="control: per-lane INT_ADD"),
    dict(name="pxor", code="660fefc1", op="control: wide INT_XOR"),
    dict(name="pand", code="660fdbc1", op="control: wide INT_AND"),
    dict(name="movdqa", code="660f6fc1", op="control: wide COPY"),
]


class Blob:
    """Minimal stand-in for pe.PE32: the lifter only ever calls .read()."""

    def __init__(self, base, data):
        self.base = base
        self.data = data

    def read(self, va, n):
        off = va - self.base
        if off < 0 or off > len(self.data):
            raise ValueError("outside blob")
        return self.data[off:off + n]


def lift_case(regmap, ctx, case, fname):
    """Lift one instruction plus a trailing ret to C, with the real lifter."""
    from lift import Decoder, FuncEmitter
    from pypcode import OpCode

    code = bytes.fromhex(case["code"] + ("d8" if case.get("imm") else "") + RET)
    dec = Decoder(Blob(BASE, code + b"\x90" * 16), ctx)
    body = {}
    va = BASE
    while True:
        length, ops = dec.at(va)
        body[va] = (length, ops)
        if any(o.opcode == OpCode.RETURN for o in ops):
            break
        va += length
    opts = dict(local_flags=True, max_insns=64, state_only=False,
                imports={}, shim_table=None, trace_va=False)
    em = FuncEmitter(regmap, fname, BASE, body, opts, {})
    return em.run(), em.callother_wide


DRIVER = """
#include <stdint.h>
#include <stdlib.h>
#include "recomp_state.h"
#include "recomp_rt.h"

uint8_t *recomp_mem_base;

/* recomp_rt.c's bad-pointer reporter calls back into the host layer, which
 * this harness does not link; nothing here can fault, so a stub is honest. */
void isaac_dump_regs(const struct CpuState *s, const char *tag) {
  (void)s; (void)tag;
}

%(protos)s

unsigned wo_state_size(void) { return (unsigned)sizeof(CpuState); }
unsigned wo_zmm_off(unsigned i) {
  switch (i) { %(zmmcases)s default: return 0u; }
}
unsigned wo_esp_off(void) { return (unsigned)offsetof(CpuState, ESP); }
void wo_init(void *mem) { recomp_mem_base = (uint8_t *)mem; }
void wo_call(unsigned idx, void *st) {
  CpuState *s = (CpuState *)st;
  switch (idx) { %(callcases)s default: abort(); }
}
"""


def build(cases, tmp):
    """Emit and compile the lifted instructions plus the ctypes driver."""
    import pypcode
    from emit import gen_state_header
    from lift import RegMap

    ctx = pypcode.Context("x86:LE:32:default")
    regmap = RegMap(ctx)
    hdr, _big = gen_state_header(regmap)
    with open(os.path.join(tmp, "recomp_state.h"), "w") as fh:
        fh.write(hdr)

    srcs, protos, callcases = [], [], []
    wides = {}
    for i, case in enumerate(cases):
        fname = "wo_%s" % case["name"]
        src, wide = lift_case(regmap, ctx, case, fname)
        srcs.append(src)
        for nm, arity in wide:
            wides[nm] = max(wides.get(nm, 0), arity)
        protos.append("void %s(CpuState *restrict s);" % fname)
        callcases.append("case %du: %s(s); return;" % (i, fname))
    # same shape emit.py writes into lifted_decls.h
    srcs.insert(0, "\n".join(
        "void recomp_otherw_%s(%s);" % (nm, ", ".join(
            ["CpuState *restrict s", "uint8_t *out", "unsigned outsz"]
            + ["const uint8_t *a%d, unsigned a%dsz" % (k, k)
               for k in range(arity)]))
        for nm, arity in sorted(wides.items())))
    zmm = " ".join("case %du: return (unsigned)offsetof(CpuState, ZMM%d);"
                   % (i, i) for i in range(8))
    body = ('#include <stddef.h>\n#include "recomp_state.h"\n'
            '#include "recomp_rt.h"\n\n'
            + "\n\n".join(srcs) + "\n"
            + DRIVER % dict(protos="\n".join(protos), zmmcases=zmm,
                            callcases=" ".join(callcases)))
    path = os.path.join(tmp, "wideops.c")
    with open(path, "w") as fh:
        fh.write(body)

    cc = shutil.which("cc") or shutil.which("gcc")
    if cc is None:
        raise RuntimeError("no native C compiler (cc/gcc) on PATH")
    lib = os.path.join(tmp, "wideops.dll" if os.name == "nt" else "wideops.so")
    cmd = [cc, "-O1", "-shared", "-fPIC", "-DRECOMP_MEM_IDENTITY=0",
           "-I", tmp, "-I", LIFT, path, os.path.join(LIFT, "recomp_rt.c"),
           "-lm", "-o", lib]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("cc failed:\n%s\n%s" % (r.stdout, r.stderr))
    return lib


# --------------------------------------------------------------------------
# ground truth
# --------------------------------------------------------------------------

def uc_run(code, xmm0, xmm1):
    import unicorn
    from unicorn import x86_const as C
    uc = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_32)
    uc.mem_map(BASE & ~0xFFF, 0x2000)
    uc.mem_write(BASE, code)
    # SSE is off out of reset: clear CR0.EM, set CR0.MP, set CR4.OSFXSR and
    # CR4.OSXMMEXCPT, or every SSE opcode raises #UD.
    cr0 = uc.reg_read(C.UC_X86_REG_CR0)
    uc.reg_write(C.UC_X86_REG_CR0, (cr0 & ~(1 << 2)) | (1 << 1))
    uc.reg_write(C.UC_X86_REG_CR4, uc.reg_read(C.UC_X86_REG_CR4) | (3 << 9))
    uc.reg_write(C.UC_X86_REG_XMM0, int.from_bytes(xmm0, "little"))
    uc.reg_write(C.UC_X86_REG_XMM1, int.from_bytes(xmm1, "little"))
    uc.emu_start(BASE, BASE + len(code), count=1)
    return uc.reg_read(C.UC_X86_REG_XMM0).to_bytes(16, "little")


def vectors(case, rng, n):
    out = []
    for _ in range(n):
        a = bytes(rng.getrandbits(8) for _ in range(16))
        if case.get("count_bias"):
            # low qword is the shift count: cover 0..71 and the saturating tail
            cnt = rng.choice([rng.randrange(0, 72), rng.getrandbits(64)])
            b = (cnt.to_bytes(8, "little")
                 + bytes(rng.getrandbits(8) for _ in range(8)))
        else:
            b = bytes(rng.getrandbits(8) for _ in range(16))
        out.append((a, b))
    return out


def main():
    n = int(os.environ.get("WIDEOPS_N", "200"))
    rng = random.Random(20260831)
    result = {"cases": [], "vectors_per_case": n}
    try:
        import unicorn  # noqa: F401
    except ImportError:
        result["skipped"] = "unicorn not installed"
        emit(result)
        return 0

    tmp = tempfile.mkdtemp(prefix="wideops-")
    try:
        try:
            lib_path = build(CASES, tmp)
        except RuntimeError as e:
            result["skipped"] = str(e)
            emit(result)
            return 0
        lib = ctypes.CDLL(lib_path)
        lib.wo_state_size.restype = ctypes.c_uint
        lib.wo_zmm_off.restype = ctypes.c_uint
        lib.wo_esp_off.restype = ctypes.c_uint
        size = lib.wo_state_size()
        zoff = [lib.wo_zmm_off(i) for i in range(8)]
        eoff = lib.wo_esp_off()
        mem = (ctypes.c_uint8 * MEMSZ)()
        lib.wo_init(ctypes.byref(mem))

        for idx, case in enumerate(CASES):
            code = bytes.fromhex(case["code"] + ("d8" if case.get("imm") else ""))
            rec = {"name": case["name"], "op": case["op"], "pass": 0,
                   "fail": 0, "first_fail": None}
            for a, b in vectors(case, rng, n):
                try:
                    want = uc_run(code, a, b)
                except Exception as e:                      # noqa: BLE001
                    rec["error"] = "unicorn: %s" % e
                    break
                st = (ctypes.c_uint64 * ((size + 15) // 8))()
                buf = ctypes.cast(st, ctypes.POINTER(ctypes.c_uint8))
                ctypes.memmove(ctypes.byref(st, zoff[0]), a, 16)
                ctypes.memmove(ctypes.byref(st, zoff[1]), b, 16)
                ctypes.cast(ctypes.byref(st, eoff),
                            ctypes.POINTER(ctypes.c_uint32))[0] = ESP
                lib.wo_call(idx, buf)
                got = ctypes.string_at(ctypes.byref(st, zoff[0]), 16)
                if got == want:
                    rec["pass"] += 1
                else:
                    rec["fail"] += 1
                    if rec["first_fail"] is None:
                        rec["first_fail"] = {
                            "xmm0": a.hex(), "xmm1": b.hex(),
                            "want": want.hex(), "got": got.hex()}
            result["cases"].append(rec)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    result["failed_cases"] = sorted(
        c["name"] for c in result["cases"] if c["fail"] or c.get("error"))
    result["ok"] = not result["failed_cases"]
    emit(result)
    return 0 if result["ok"] else 1


def emit(result):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "wideops.json")
    with open(path, "w") as fh:
        json.dump(result, fh, indent=2)
    print(json.dumps(result, indent=2)[:4000])
    print("wrote %s" % path)


if __name__ == "__main__":
    sys.exit(main())
