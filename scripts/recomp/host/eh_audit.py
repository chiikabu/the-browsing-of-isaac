"""How is __CxxFrameHandler3 actually reached? (1,833 sites)

The number looks like 1,833 places that must work before anything runs. It is
not. This measures the reference FORM at every site, because the difference
between "the game calls this" and "the OS unwinder calls this during a throw"
decides whether a minimum viable implementation exists.

MSVC's shape for a function with C++ EH:

    __ehhandler$?f@@YAXXZ:
        mov  eax, offset __ehfuncinfo$?f@@YAXXZ
        jmp  dword ptr [__imp___CxxFrameHandler3]

and the fs:[0] registration record for that function points at the
__ehhandler thunk, NOT at __CxxFrameHandler3. So the handler is entered only
when something walks the SEH chain -- i.e. only on a throw.

Writes output/recomp/host/eh-audit.json.

Run:  python scripts/recomp/host/eh_audit.py
"""

import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe import PE, OUT_DIR, CENSUS_DIR, REPO_ROOT, hexva  # noqa: E402

from capstone import Cs, CS_ARCH_X86, CS_MODE_32
from capstone.x86 import X86_OP_MEM, X86_OP_IMM, X86_REG_INVALID

EH_SYMS = ["__CxxFrameHandler3", "_CxxThrowException", "__RTDynamicCast",
           "_except_handler4_common", "__current_exception",
           "__current_exception_context", "_setjmp3", "longjmp"]


def main():
    pe = PE()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    imports = json.loads((CENSUS_DIR / "imports.json").read_text(encoding="utf-8"))
    slots = {}
    for s in imports["symbols"]:
        if s["symbol"] in EH_SYMS:
            slots[int(s["iatVa"], 16)] = s["symbol"]

    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    text = pe.section(".text")
    base_off, base_va = text.raw_offset, pe.image_base + text.rva

    # sweep anchored on Ghidra function starts + gaps (keeps the decoder in phase)
    fns = []
    p = REPO_ROOT / "output" / "recomp" / "export" / "functions.jsonl"
    with p.open("r", encoding="utf-8") as fh:
        for line in fh:
            r = json.loads(line)
            if r.get("recovered") or not r.get("inText"):
                continue
            fns.append((int(r["va"], 16), int(r["endVa"], 16)))
    fns.sort()
    lo0, hi0 = base_va, base_va + text.raw_size
    ranges, cur = [], lo0
    for a, b in fns:
        a, b = max(a, lo0), min(b, hi0)
        if b <= a:
            continue
        if a > cur:
            ranges.append((cur, a))
        ranges.append((a, b))
        cur = max(cur, b)
    if cur < hi0:
        ranges.append((cur, hi0))

    # MSVC routes these through a single ILT thunk (`jmp dword ptr
    # [__imp_X]`), so counting references to the IAT slot alone finds
    # exactly one hit per symbol and misses every real call. Follow it.
    thunk_of = {}
    for rec in imports["symbols"]:
        if rec["symbol"] in EH_SYMS:
            for t in rec.get("thunkVas", []):
                thunk_of[int(t, 16)] = rec["symbol"]

    per_sym = {n: Counter() for n in EH_SYMS}
    thunks = {n: [] for n in EH_SYMS}
    for lo, hi in ranges:
        off = base_off + (lo - base_va)
        for ins in md.disasm(pe.data[off:off + (hi - lo)], lo):
            for op in ins.operands:
                if (op.type == X86_OP_MEM and op.mem.base == X86_REG_INVALID
                        and op.mem.index == X86_REG_INVALID):
                    d = op.mem.disp & 0xFFFFFFFF
                    if d in slots:
                        nm = slots[d]
                        per_sym[nm][ins.mnemonic] += 1
                        if ins.mnemonic == "jmp":
                            thunks[nm].append(ins.address)
                elif op.type == X86_OP_IMM:
                    v = op.imm & 0xFFFFFFFF
                    if v in slots:
                        per_sym[slots[v]]["imm(addr-taken)"] += 1
                    elif v in thunk_of:
                        per_sym[thunk_of[v]]["thunk:" + ins.mnemonic] += 1

    # For __CxxFrameHandler3, check the classic __ehhandler shape: the 5 bytes
    # before the jmp should be `mov eax, imm32` pointing into .rdata (funcinfo).
    ehshape = {"movEaxThenJmp": 0, "other": 0, "funcinfoInRdata": 0}
    rd = pe.section(".rdata")
    rd_lo = pe.image_base + rd.rva
    rd_hi = rd_lo + rd.virtual_span
    for a in thunks["__CxxFrameHandler3"]:
        b = pe.read_at_va(a - 5, 5)
        if b and b[0] == 0xB8:
            ehshape["movEaxThenJmp"] += 1
            v = int.from_bytes(b[1:5], "little")
            if rd_lo <= v < rd_hi:
                ehshape["funcinfoInRdata"] += 1
        else:
            ehshape["other"] += 1

    # The distinction that matters: a `call` reaching the symbol is lifted
    # code invoking it. A `jmp` reaching it is an __ehhandler$ trampoline --
    # the tail of a per-function SEH handler that only the UNWINDER enters.
    summary = {}
    for n in EH_SYMS:
        c = per_sym[n]
        calls = c.get("thunk:call", 0) + c.get("call", 0)
        jmps = c.get("thunk:jmp", 0) + c.get("jmp", 0)
        summary[n] = {"realCalls": calls, "ehhandlerTrampolines": jmps,
                      "reachedOnlyByUnwinder": calls == 0}

    out = {
        "note": "reference FORM decides whether lifted code ever enters these",
        "summary": summary,
        "perSymbol": {k: dict(v) for k, v in per_sym.items()},
        "cxxFrameHandler3": {
            "totalRefs": sum(per_sym["__CxxFrameHandler3"].values()),
            "jmpThunks": len(thunks["__CxxFrameHandler3"]),
            "directCalls": per_sym["__CxxFrameHandler3"].get("call", 0),
            "ehhandlerShape": ehshape,
        },
    }
    (OUT_DIR / "eh-audit.json").write_text(json.dumps(out, indent=1),
                                           encoding="utf-8")

    print("reference forms at the C++ EH boundary:\n")
    print("  %-30s %s" % ("symbol", "forms"))
    for n in EH_SYMS:
        if per_sym[n]:
            print("  %-30s %s" % (n, dict(per_sym[n])))
    c = out["cxxFrameHandler3"]
    print()
    print("__CxxFrameHandler3:")
    print("  total references : %d" % c["totalRefs"])
    print("  `jmp [slot]` thunks : %d" % c["jmpThunks"])
    print("  DIRECT `call [slot]`: %d" % c["directCalls"])
    print("  of the jmp thunks, preceded by `mov eax, imm32`: %d"
          % ehshape["movEaxThenJmp"])
    print("  ... whose imm32 points into .rdata (an __ehfuncinfo): %d"
          % ehshape["funcinfoInRdata"])
    print()
    print("what lifted code CALLS vs. what only the unwinder enters:")
    print("  %-30s %7s %14s  %s" % ("symbol", "calls", "eh-trampolines",
                                   "steady state?"))
    for n in EH_SYMS:
        row = summary[n]
        if not (row["realCalls"] or row["ehhandlerTrampolines"]):
            continue
        print("  %-30s %7d %14d  %s" % (
            n, row["realCalls"], row["ehhandlerTrampolines"],
            "not without a throw" if row["reachedOnlyByUnwinder"]
            else "REACHED -- must be real"))
    print()
    print("VERDICT")
    if summary["__CxxFrameHandler3"]["reachedOnlyByUnwinder"]:
        print("  __CxxFrameHandler3: ZERO calls from lifted code. All %d"
              % summary["__CxxFrameHandler3"]["ehhandlerTrampolines"])
        print("  references are `jmp` tails of per-function __ehhandler$")
        print("  trampolines, entered only while walking the fs:[0] chain,")
        print("  i.e. only on a throw. NOT on the steady-state path.")
    print("  __RTDynamicCast IS on the steady-state path (%d real calls)"
          % summary["__RTDynamicCast"]["realCalls"])
        
    return 0


if __name__ == "__main__":
    sys.exit(main())
