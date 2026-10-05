"""Post-process lifted_*.c to support mid-function re-entry.

Guest setjmp/longjmp (imp_vcruntime140___setjmp3/longjmp) and the
return-address unwind after a longjmp resume at *mid-function* VAs, but the
generated dispatch table only maps function ENTRY VAs.  This pass:

  1. computes the exact set of guest return addresses = (call instruction
     address + size) from the canonical PE's masked linear instruction index
     at output/decomp/<hash12>/index/pe-index.sqlite, normally written by this
     script into call_cont.txt;
  2. for every lifted function, adds a label `L_%08x: ;` at each block that
     is a call continuation;
  3. inserts a prologue guard that, when the dispatcher sets g_reentry_eip
     to one of this function's continuation VAs, reloads the register
     locals from CpuState and `goto`s the matching label.

The dispatcher (mkdispatch.py) publishes the same VA set as a second
direct-mapped table (g_bva/g_bfn/g_bindex) so the longjmp replay loop can
re-enter any continuation.

Usage:
    python patch_reentry.py --dir output/recomp/lift/gu \
        --exe tools/isaac-ng.unpacked.exe
    # or pass --cont <file> to reuse an existing continuation list
"""

import argparse
import glob
import os
import re
import sqlite3
import sys
from pathlib import Path

RE_FN = re.compile(rb"^void (?:sub_)([0-9a-f]{8})\(")
RE_DECL = re.compile(rb"^  (uint32_t|uint8_t) [A-Za-z0-9_]+ = .*;$")
RE_PRO = re.compile(rb"^  (uint32_t|uint8_t) ([A-Za-z0-9_]+) = s->([A-Za-z0-9_]+);$")
RE_RV = re.compile(rb"RECOMP_VA\(0x([0-9a-fA-F]{1,8})u\)")
RE_LBL = re.compile(rb"^L_([0-9a-f]{8}): ;$")


def census_continuations(exe_path):
    sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
    from scripts.decomp.tools.pe import PEImage, index_db_path

    pe = PEImage(Path(exe_path))
    path = index_db_path(pe)
    build = "python scripts/decomp/tools/build-pe-index.py"
    if not path.is_file():
        raise FileNotFoundError(f"index missing: {path}\nbuild it: {build}")
    db = sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)
    try:
        meta = dict(db.execute("SELECT key, value FROM meta"))
        if meta.get("sha256", "").upper() != pe.sha256:
            raise RuntimeError(f"index PE hash mismatch: {path}\nrebuild it: {build}")
        if meta.get("decode_config", "").split()[:2] != [
                "linear+skipdata+jtab-mask", "v2"]:
            raise RuntimeError(
                f"index requires masked linear decode config v2: {path}\n"
                f"rebuild it: {build}")
        return {va for (va,) in db.execute("SELECT va + size FROM insn WHERE mn = 'call'")}
    finally:
        db.close()


def patch_file(path, cont):
    data = open(path, "rb").read()
    lines = data.split(b"\n")  # keeps \r at end of each line; last elem may be ''
    out = []
    i = 0
    nf = 0
    n_guard = 0
    n_lbl = 0
    while i < len(lines):
        m = RE_FN.match(lines[i])
        if not m:
            out.append(lines[i])
            i += 1
            continue
        fn_va = int(m.group(1), 16)
        # find the function span
        j = i + 1
        while j < len(lines) and not RE_FN.match(lines[j]):
            j += 1
        span = lines[i + 1:j]
        # decl region: consecutive decl/blank lines after '{'
        k = 0
        while k < len(span):
            l = span[k].rstrip(b"\r")
            if l.strip() == b"" or RE_DECL.match(l):
                k += 1
            else:
                break
        decl = span[:k]
        body = span[k:]
        locals_ = [mm.group(2).decode() for l in decl
                   for mm in [RE_PRO.match(l.rstrip(b"\r"))] if mm]
        rv_vars = []
        for l in body:
            mm = RE_RV.search(l)
            if mm:
                rv_vars.append(int(mm.group(1), 16))
        existing = set(int(mm.group(1), 16) for l in body
                       for mm in [RE_LBL.match(l.rstrip(b"\r"))] if mm)
        conts = sorted(set(v for v in rv_vars if v in cont and v != fn_va))
        nf += 1
        out.append(lines[i])
        out.extend(decl)
        already = any(b"if (g_reentry_eip != 0u) {" in l for l in body[:60])
        if conts and already:
            # idempotent re-run: keep labels only
            want_lbl = set(conts) - existing
            for l in body:
                mm = RE_RV.search(l)
                if mm and int(mm.group(1), 16) in want_lbl:
                    out.append(b"L_%08x: ;\r" % int(mm.group(1), 16))
                out.append(l)
            i = j
            continue
        if conts:
            guard = [b"  if (g_reentry_eip != 0u) {",
                     b"    uint32_t _rva = g_reentry_eip;",
                     b"    g_reentry_eip = 0u;"]
            for name in locals_:
                guard.append(b"    %s = s->%s;" % (name.encode(), name.encode()))
            guard.append(b"    switch (_rva) {")
            for v in conts:
                guard.append(b"    case 0x%08xu: goto L_%08x;" % (v, v))
            guard.append(b"    default: break;")
            guard.append(b"    }")
            guard.append(b"  }")
            out.extend(g + b"\r" for g in guard)
            n_guard += 1
        # body with labels inserted before continuation RECOMP_VA lines
        want_lbl = set(conts) - existing
        for l in body:
            mm = RE_RV.search(l)
            if mm and int(mm.group(1), 16) in want_lbl:
                out.append(b"L_%08x: ;\r" % int(mm.group(1), 16))
                n_lbl += 1
            out.append(l)
        i = j
    new = b"\n".join(out)
    if new != data:
        open(path, "wb").write(new)
    return nf, n_guard, n_lbl

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--exe", default="tools/isaac-ng.unpacked.exe")
    ap.add_argument("--cont", default=None,
                    help="precomputed continuation list (one hex VA per line)")
    args = ap.parse_args()
    d = args.dir
    if args.cont:
        cont = set(int(l.strip(), 16) for l in open(args.cont) if l.strip())
    else:
        cont = census_continuations(args.exe)
        outp = os.path.join(d, "call_cont.txt")
        with open(outp, "w") as fh:
            for v in sorted(cont):
                fh.write("%08x\n" % v)
        print("continuations: %d -> %s" % (len(cont), outp))
    tot = [0, 0, 0]
    for f in sorted(glob.glob(os.path.join(d, "lifted_*.c"))):
        nf, ng, nl = patch_file(f, cont)
        tot[0] += nf; tot[1] += ng; tot[2] += nl
        print("%-16s funcs=%4d guards=%4d labels=%5d"
              % (os.path.basename(f), nf, ng, nl))
    print("TOTAL funcs=%d guards=%d labels=%d" % tuple(tot))


if __name__ == "__main__":
    main()
