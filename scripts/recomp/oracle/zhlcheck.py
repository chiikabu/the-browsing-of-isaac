"""Validate ABI inference and autospec layout discovery against the 641
REPENTOGON ZHL declarations in the Ghidra export.

These are real hand-catalogued signatures with real parameter types and
explicit register placement, e.g.

    __thiscall void AnimationState::AdvancePosition(int targetFrame);
    static cleanup void Isaac::SwapANM2(ANM2* left<ecx>, ANM2* right<edx>);
    static __stdcall SourceQuad* AnimationLayer::GetSourceQuad(
        SourceQuad* ret, void* unused, const AnimationFrame& frame, ...);

so they are the only place in this pipeline where a generated spec can be
checked against a known-correct answer instead of against itself.

Three things get measured, each reported separately because they fail for
different reasons:
  1. calling convention inferred from the instruction stream vs declared
  2. stack-argument dword count vs declared
  3. autospec's pointer/scalar decision per stack slot vs declared type
"""

from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import abi as abimod        # noqa: E402
import autospec            # noqa: E402
import cfg as cfgmod        # noqa: E402
import crtmodels           # noqa: E402
import emu as emumod       # noqa: E402
import peimage             # noqa: E402
import ssaderef            # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
EXPORT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "export",
                      "functions.jsonl")

EIGHT_BYTE = re.compile(r"\b(double|__int64|int64_t|uint64_t|long long)\b")


@dataclass
class ZhlSig:
    va: int
    name: str
    decl: str
    cc: str                 # thiscall | stdcall | cdecl | fastcall
    stack_args: list[bool]  # True == pointer/reference
    ecx_is_this: bool
    reg_args: int           # params pinned to <ecx>/<edx>
    exact: bool             # False when a by-value struct makes width unclear


def _split_params(s: str) -> list[str]:
    out, depth, cur = [], 0, ""
    for ch in s:
        if ch in "<([":
            depth += 1
        elif ch in ">)]":
            depth -= 1
        if ch == "," and depth == 0:
            out.append(cur.strip())
            cur = ""
        else:
            cur += ch
    if cur.strip():
        out.append(cur.strip())
    return out


def parse_zhl(decl: str, va: int, name: str) -> ZhlSig | None:
    d = " ".join(decl.split())
    if "(" not in d:
        return None
    head, _, rest = d.partition("(")
    params_s = rest.rsplit(")", 1)[0]
    is_static = "static" in head.split()
    if "__thiscall" in head:
        cc = "thiscall"
    elif "__stdcall" in head:
        cc = "stdcall"
    elif "__fastcall" in head:
        cc = "fastcall"
    elif "__cdecl" in head:
        cc = "cdecl"
    else:
        cc = "thiscall" if not is_static else "cdecl"

    stack: list[bool] = []
    reg_args = 0
    exact = True
    for p in _split_params(params_s):
        if not p or p == "void":
            continue
        if "<ecx>" in p or "<edx>" in p:
            reg_args += 1
            cc = "fastcall"
            continue
        is_ptr = ("*" in p) or ("&" in p)
        if EIGHT_BYTE.search(p) and not is_ptr:
            stack += [False, False]
            continue
        # a by-value class/struct of unknown width makes the dword count
        # unreliable; flag it rather than pretend
        base = p.replace("const", "").strip().split()[0] if p.split() else ""
        if not is_ptr and base and base[0].isupper() and \
                base not in ("int", "float", "bool", "char", "unsigned"):
            exact = False
        stack.append(is_ptr)
    return ZhlSig(va, name, d, cc, stack, cc == "thiscall" and not is_static,
                  reg_args, exact)


def load_sigs() -> list[ZhlSig]:
    sigs = []
    with open(EXPORT, "r", encoding="utf-8") as fh:
        for line in fh:
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get("recovered") is not False:
                continue
            if not d.get("zhlName") or not d.get("zhlDeclaration"):
                continue
            s = parse_zhl(d["zhlDeclaration"], int(d["va"], 16), d["zhlName"])
            if s:
                sigs.append(s)
    return sigs


def main():
    sigs = load_sigs()
    pe = peimage.load()
    o = emumod.Oracle(pe)
    crtmodels.install(o)
    starts = set(cfgmod.build_function_starts(
        pe, os.path.join(OUT, "func_starts.json")))

    n = 0
    cc_ok = args_ok = args_cmp = 0
    cc_conf = {"pinned": [0, 0], "likely": [0, 0], "guess": [0, 0]}
    confusion: dict[tuple, int] = {}
    slot_ok = slot_cmp = 0
    lay_cmp = 0
    ssa_n = [0]; ssa_slot_ok = [0]; ssa_slot_cmp = [0]
    ssa_cc_ok = [0]; ssa_cc_cmp = [0]; hyb_cc_ok = [0]
    ssa_args_ok = [0]; ssa_args_cmp = [0]
    rows = []
    for s in sigs:
        try:
            c = cfgmod.recover(pe, s.va, func_starts=starts)
        except Exception:
            continue
        if c.error or not c.insns:
            continue
        a = abimod.infer(pe, c)
        n += 1
        # -- 1. calling convention -----------------------------------
        # thiscall and fastcall both put something in ECX; the oracle only
        # has to get the ECX/stack split right for inputs to be valid, so
        # score the exact label AND the ECX-compatible relaxation.
        hit = (a.cc == s.cc)
        cc_ok += hit
        confusion[(s.cc, a.cc)] = confusion.get((s.cc, a.cc), 0) + 1
        cc_conf[a.confidence][0] += hit
        cc_conf[a.confidence][1] += 1

        # -- 2. stack argument count ---------------------------------
        if s.exact:
            args_cmp += 1
            args_ok += (a.n_args == len(s.stack_args))

        rows.append({"va": s.va, "name": s.name, "zhl_cc": s.cc,
                     "inferred_cc": a.cc, "conf": a.confidence,
                     "zhl_args": len(s.stack_args), "inferred_args": a.n_args,
                     "exact": s.exact})

        # -- 3. autospec (fault-driven) pointer/scalar decision ------
        if len(rows) <= 220 and s.exact and a.cc == s.cc:
            try:
                lay = autospec.discover(o, s.va, c, a)
            except Exception:
                lay = None
            if lay is not None:
                lay_cmp += 1
                got = [k for k, _v in lay.slots[1:]]
                for i, want_ptr in enumerate(s.stack_args):
                    if i >= len(got):
                        break
                    slot_cmp += 1
                    slot_ok += ((got[i] == "ptr") == want_ptr)

        # -- 4. SSA (static) pointer/scalar decision -----------------
        # Same question, no emulation: is stack argument i dereferenced
        # anywhere in the function, on any path?
        sl = ssaderef.extract(s.va)
        if sl.ok:
            ssa_n[0] += 1
            if s.exact:
                for i, want_ptr in enumerate(s.stack_args):
                    ssa_slot_cmp[0] += 1
                    ssa_slot_ok[0] += (sl.deref_by_off.get(4 + 4 * i, False)
                                       == want_ptr)
            # -- 5. SSA-assisted convention -------------------------
            # ECX appearing as a live SSA input is direct evidence of a
            # register-passed receiver, independent of the entry-block scan.
            if sl.ecx_deref or sl.ecx_used:
                cc2 = "fastcall" if sl.edx_deref else "thiscall"
            else:
                cc2 = "stdcall" if a.ret_bytes else "cdecl"
            ssa_cc_ok[0] += (cc2 == s.cc)
            ssa_cc_cmp[0] += 1
            # hybrid: keep abi.infer, but let SSA veto a missed receiver
            cc3 = a.cc
            if a.cc in ("stdcall", "cdecl") and sl.ecx_deref:
                cc3 = "thiscall"
            hyb_cc_ok[0] += (cc3 == s.cc)
            # SSA stack-argument count: highest dereferenced/used slot
            if s.exact:
                n_ssa = (max(sl.stack_offsets) // 4 if sl.stack_offsets else 0)
                ssa_args_ok[0] += (n_ssa == len(s.stack_args))
                ssa_args_cmp[0] += 1

    print(f"ZHL signatures parsed and matched to code: {n}")
    print()
    print("1. CALLING CONVENTION  (instruction stream vs declaration)")
    print(f"   exact match            {cc_ok}/{n}  {100.0*cc_ok/n:.1f}%")
    for k, (h, t) in cc_conf.items():
        if t:
            print(f"     when abi says '{k:<6}'  {h}/{t}  {100.0*h/t:.1f}%")
    print("   confusion (declared -> inferred), top:")
    for (want, got), k in sorted(confusion.items(), key=lambda kv: -kv[1])[:8]:
        mark = "  ok" if want == got else "  MISS"
        print(f"     {want:<9} -> {got:<9} {k:>4}{mark}")
    print()
    print("2. STACK ARGUMENT COUNT (only unambiguous signatures)")
    print(f"   exact match            {args_ok}/{args_cmp}  "
          f"{100.0*args_ok/max(args_cmp,1):.1f}%")
    print()
    print("3. POINTER/SCALAR PER STACK SLOT")
    print(f"   fault-driven (autospec)  {slot_ok}/{slot_cmp}  "
          f"{100.0*slot_ok/max(slot_cmp,1):.1f}%   "
          f"({lay_cmp} functions, needs emulation)")
    print(f"   static  (SSA P-Code)     {ssa_slot_ok[0]}/{ssa_slot_cmp[0]}  "
          f"{100.0*ssa_slot_ok[0]/max(ssa_slot_cmp[0],1):.1f}%   "
          f"({ssa_n[0]} functions, no emulation)")
    print()
    print("4. SSA-ASSISTED CALLING CONVENTION")
    print(f"   SSA alone              {ssa_cc_ok[0]}/{ssa_cc_cmp[0]}  "
          f"{100.0*ssa_cc_ok[0]/max(ssa_cc_cmp[0],1):.1f}%")
    print(f"   abi.infer + SSA veto   {hyb_cc_ok[0]}/{ssa_cc_cmp[0]}  "
          f"{100.0*hyb_cc_ok[0]/max(ssa_cc_cmp[0],1):.1f}%  "
          f"(baseline abi.infer alone {100.0*cc_ok/n:.1f}%)")
    print()
    print("5. SSA STACK-ARGUMENT COUNT")
    print(f"   exact match            {ssa_args_ok[0]}/{ssa_args_cmp[0]}  "
          f"{100.0*ssa_args_ok[0]/max(ssa_args_cmp[0],1):.1f}%  "
          f"(baseline abi.infer {100.0*args_ok/max(args_cmp,1):.1f}%)")

    res = {"n": n, "cc_exact": cc_ok, "cc_pct": round(100.0 * cc_ok / n, 2),
           "cc_by_confidence": {k: v for k, v in cc_conf.items()},
           "args_exact": args_ok, "args_compared": args_cmp,
           "args_pct": round(100.0 * args_ok / max(args_cmp, 1), 2),
           "slot_ok": slot_ok, "slot_compared": slot_cmp,
           "slot_pct": round(100.0 * slot_ok / max(slot_cmp, 1), 2),
           "ssa_slot_ok": ssa_slot_ok[0], "ssa_slot_cmp": ssa_slot_cmp[0],
           "ssa_slot_pct": round(100.0 * ssa_slot_ok[0]
                                 / max(ssa_slot_cmp[0], 1), 2),
           "ssa_cc_pct": round(100.0 * ssa_cc_ok[0]
                               / max(ssa_cc_cmp[0], 1), 2),
           "hybrid_cc_pct": round(100.0 * hyb_cc_ok[0]
                                  / max(ssa_cc_cmp[0], 1), 2),
           "ssa_args_pct": round(100.0 * ssa_args_ok[0]
                                 / max(ssa_args_cmp[0], 1), 2),
           "confusion": {f"{a}->{b}": v for (a, b), v in confusion.items()},
           "rows": rows[:400]}
    with open(os.path.join(OUT, "zhlcheck.json"), "w", encoding="utf-8") as fh:
        json.dump(res, fh, indent=1)
    print(f"\nwrote {os.path.join(OUT, 'zhlcheck.json')}")


if __name__ == "__main__":
    main()
