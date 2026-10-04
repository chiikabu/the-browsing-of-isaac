"""Run the lifted-module replay in timeout-bounded chunks.

The replay harness executes lifted code with no instruction budget, so a
function whose loop condition the emitter got wrong runs forever and JS
cannot interrupt a wasm call in progress.  A single such function otherwise
hangs an entire 2,000-function run (measured: one chunk burned 1,002 CPU
seconds before being killed).

So: split the vector file by function, run chunks in separate node processes
under a wall-clock timeout, and bisect a timing-out chunk down to the
individual function.  A function that never returns is recorded as `hang`,
which is a real and interesting failure mode -- not an excuse to drop it.
"""

from __future__ import annotations

import argparse
import json
import os
import struct
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

ROOT = peimage.REPO_ROOT
OUT = os.path.join(ROOT, "output", "recomp", "oracle")
REPLAY = os.path.join(OUT, "replay")
RUNNER = os.path.join(ROOT, "scripts", "recomp", "oracle", "replay_run.mjs")
IMAGE = os.path.join(ROOT, "output", "recomp", "lift", "image.bin")
MAGIC = 0x4C43524F


def parse(path):
    """-> (header_nfn, ordered list of (va, record_bytes))"""
    with open(path, "rb") as fh:
        buf = fh.read()
    magic, nfn, nvec = struct.unpack_from("<III", buf, 0)
    assert magic == MAGIC, f"bad magic {magic:#x}"
    recs = []
    p = 12
    end = len(buf)
    while p + 8 <= end:
        rl, va = struct.unpack_from("<II", buf, p)
        if rl < 8 or p + rl > end:
            break
        recs.append((va, buf[p:p + rl]))
        p += rl
    return nfn, recs


def write_subset(path, recs):
    vas = {va for va, _ in recs}
    with open(path, "wb") as fh:
        fh.write(struct.pack("<III", MAGIC, len(vas), len(recs)))
        for _, r in recs:
            fh.write(r)


def run_chunk(mod_url, vec_path, out_path, timeout, strict):
    cmd = ["node", RUNNER, mod_url, vec_path, IMAGE, out_path, str(strict)]
    try:
        p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
                           timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, "timeout"
    if p.returncode != 0 or not os.path.exists(out_path):
        return None, (p.stderr or p.stdout or "")[-400:].strip()
    with open(out_path, encoding="utf-8") as fh:
        return json.load(fh), None


def solve(mod_url, groups, timeout, strict, tmpdir, depth=0):
    """Run these function-groups, bisecting on timeout. -> (results, hangs)"""
    recs = [r for g in groups for r in g]
    if not recs:
        return [], []
    vec = os.path.join(tmpdir, f"chunk_{depth}_{len(groups)}_{id(groups)}.bin")
    res = vec + ".json"
    write_subset(vec, recs)
    data, err = run_chunk(mod_url, vec, res, timeout, strict)
    try:
        os.remove(vec)
    except OSError:
        pass
    if data is not None:
        try:
            os.remove(res)
        except OSError:
            pass
        return data["functions"], []
    if len(groups) == 1:
        va = groups[0][0][0]
        return [], [{"va": va, "va_hex": f"{va:#010x}",
                     "n": len(groups[0]), "reason": err or "timeout"}]
    mid = len(groups) // 2
    a, ha = solve(mod_url, groups[:mid], timeout, strict, tmpdir, depth + 1)
    b, hb = solve(mod_url, groups[mid:], timeout, strict, tmpdir, depth + 1)
    return a + b, ha + hb


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vectors", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--chunk", type=int, default=40)
    ap.add_argument("--timeout", type=float, default=90.0)
    ap.add_argument("--strict", type=int, default=1)
    ap.add_argument("--module", default=os.path.join(REPLAY, "orc.mjs"))
    a = ap.parse_args()

    mod_url = "file:///" + os.path.abspath(a.module).replace("\\", "/")
    tmpdir = os.path.join(OUT, "_chunks")
    os.makedirs(tmpdir, exist_ok=True)

    _nfn, recs = parse(a.vectors)
    by_va = {}
    for va, r in recs:
        by_va.setdefault(va, []).append((va, r))
    groups = [by_va[v] for v in sorted(by_va)]
    print(f"{len(groups)} functions, {len(recs)} vectors, "
          f"chunk={a.chunk}, timeout={a.timeout}s, strict={a.strict}")

    all_fns, all_hangs = [], []
    t0 = time.time()
    for i in range(0, len(groups), a.chunk):
        part = groups[i:i + a.chunk]
        fns, hangs = solve(mod_url, part, a.timeout, a.strict, tmpdir)
        all_fns += fns
        all_hangs += hangs
        done = min(i + a.chunk, len(groups))
        el = time.time() - t0
        print(f"  {done}/{len(groups)} functions  {el:.0f}s  "
              f"hangs={len(all_hangs)}", flush=True)

    npass = sum(1 for f in all_fns if f["ok"])
    vp = sum(f["pass"] for f in all_fns)
    vt = sum(f["n"] for f in all_fns)
    out = {
        "vectors_file": a.vectors, "strict": a.strict,
        "functions_run": len(all_fns), "functions_pass": npass,
        "functions_hang": len(all_hangs),
        "vectors_run": vt, "vectors_pass": vp,
        "seconds": round(time.time() - t0, 1),
        "functions": all_fns, "hangs": all_hangs,
    }
    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh)
    print(f"\nfunctions {npass}/{len(all_fns)} pass, {len(all_hangs)} hang; "
          f"vectors {vp}/{vt} pass; {time.time()-t0:.0f}s -> {a.out}")


if __name__ == "__main__":
    main()
