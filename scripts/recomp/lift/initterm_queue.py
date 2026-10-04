"""Static work queue for the static-initialiser phase.

The survey build can only fake imports the host has NOT hand-written, so
once the blocker is a deliberate host implementation (GetModuleHandleW
returning NULL) the dynamic survey cannot advance and a different method
is needed.

This walks the direct-call graph from every _initterm entry (XI then XC)
and reports the imports reachable from it, ordered by call depth.  It is
STATIC: it over-approximates (a call site on a branch never taken is still
counted) and cannot see indirect calls.  It is a priority list, not a
prediction of execution order.
"""

import argparse
import json
import struct
import sys
import os
from collections import deque

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pe import PE32                                     # noqa: E402

XI = (0x00B18C10, 0x00B18C24)
XC = (0x00B18A2C, 0x00B18C04)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--exe", default="tools/isaac-ng.unpacked.exe")
    ap.add_argument("--inventory",
                    default="output/recomp/export/functions.jsonl")
    ap.add_argument("--imports", default="output/recomp/census/imports.json")
    ap.add_argument("--max-depth", type=int, default=6)
    ap.add_argument("--top", type=int, default=40)
    args = ap.parse_args()

    pe = PE32(args.exe)
    callees = {}
    lo_hi = {}
    for line in open(args.inventory, encoding="utf8"):
        d = json.loads(line)
        if not d.get("inText"):
            continue
        va = int(d["va"], 16)
        callees[va] = [int(c, 16) for c in (d.get("callees") or [])]
        lo_hi[va] = (int(d["minVa"], 16), int(d["endVa"], 16))

    imp = json.load(open(args.imports, encoding="utf8"))
    slot = {int(s["iatVa"], 16): (s["dll"], s["symbol"], s["callSites"])
            for s in imp["symbols"]}

    # every `call dword ptr [imm32]` in a function body -> IAT slot
    import capstone
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
    md.detail = True

    def imports_of(fva):
        out = []
        lo, hi = lo_hi.get(fva, (None, None))
        if lo is None:
            return out
        try:
            raw = pe.read(lo, hi - lo)
        except ValueError:
            return out
        for ins in md.disasm(raw, lo):
            if ins.mnemonic not in ("call", "jmp") or not ins.operands:
                continue
            op = ins.operands[0]
            if op.type != capstone.x86.X86_OP_MEM:
                continue
            m = op.mem
            if m.base or m.index:
                continue
            hit = slot.get(m.disp & 0xFFFFFFFF)
            if hit:
                out.append((ins.address, hit))
        return out

    roots = []
    for name, (a, b) in (("XI", XI), ("XC", XC)):
        for va in range(a, b, 4):
            t = struct.unpack("<I", pe.read(va, 4))[0]
            if t:
                roots.append((name, va, t))

    print("initterm entries: %d" % len(roots))
    seen = {}
    order = []
    q = deque((t, 0, name) for name, _s, t in roots)
    for t, _d, _n in list(q):
        seen[t] = 0
    while q:
        fva, depth, tag = q.popleft()
        if depth > args.max_depth:
            continue
        order.append((fva, depth, tag))
        for c in callees.get(fva, []):
            if c not in seen:
                seen[c] = depth + 1
                q.append((c, depth + 1, tag))

    first = {}
    for fva, depth, tag in order:
        for site, (dll, sym, sites) in imports_of(fva):
            key = (dll, sym)
            if key not in first or depth < first[key][0]:
                first[key] = (depth, site, sites, tag, fva)

    rows = sorted(first.items(), key=lambda kv: (kv[1][0], -kv[1][2]))
    print("functions reached (depth<=%d): %d" % (args.max_depth, len(order)))
    print("distinct imports statically reachable from _initterm: %d\n"
          % len(rows))
    print("%-4s %-42s %-10s %-9s %-8s %s"
          % ("d", "import", "table", "site", "sites", "in function"))
    for (dll, sym), (depth, site, sites, tag, fva) in rows[:args.top]:
        print("%-4d %-42s %-10s %#08x %-8d %#010x"
              % (depth, sym[:42], tag, site, sites, fva))
    if len(rows) > args.top:
        print("... (+%d more)" % (len(rows) - args.top))


if __name__ == "__main__":
    main()
