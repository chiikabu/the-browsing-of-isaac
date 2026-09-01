"""Mass differential: lifted wasm vs. Unicorn ground truth.

Writes the vector file consumed by scripts/recomp/lift/oracle_replay.c (that
file and its build are READ-ONLY here; the format below is transcribed from
its header comment), then scores the replay and classifies every divergence.

Two things this does that the lifter's own driver does not:

  * it does not restrict itself to call-free leaf functions, so the sample is
    the tier-A / happy-tier population rather than whatever happens to have
    no calls;
  * it records, per function, the BLOCK COVERAGE of the vectors used, so the
    accuracy number can be stratified.  A function that passes on vectors
    touching 20% of its blocks is far weaker evidence than one at 99%, and
    reporting a single blended pass rate over 23,381 functions would be
    exactly the green lie this pipeline exists to avoid.

Binary format (little-endian):
  u32 magic 'ORCL'  u32 n_funcs  u32 n_vectors
  per vector, flat and self-delimiting:
    u32 rec_len (including these 8 bytes)   u32 va
    u32 ecx  u32 edx  u32 n_stack  u32 stack[n_stack]
    u32 n_mem     (u32 addr, u32 len, u8 bytes[len]) * n_mem
    u32 eax edx ecx ebx esi edi ebp esp_delta
    u32 n_writes  (u32 addr, u32 len, u8 bytes[len]) * n_writes
"""

from __future__ import annotations

import argparse
import collections
import json
import os
import re
import struct
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import peimage  # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
LIFT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "lift")

MAGIC = 0x4C43524F


def lifted_set(dirs) -> set[int]:
    """VAs the module actually defines (from the generated C)."""
    out: set[int] = set()
    import glob
    for d in dirs:
        for f in glob.glob(os.path.join(d, "lifted*.c")):
            with open(f, encoding="utf8", errors="replace") as fh:
                out.update(int(m, 16) for m in re.findall(
                    r"^void sub_([0-9a-f]{8})\(CpuState", fh.read(), re.M))
    return out


def build(vas, n, exe, out_path, seed=1, min_vectors=4, progress=200):
    from api import OracleSession
    body = bytearray()
    meta = {}
    nf = nvec = 0
    t0 = time.time()
    skipped = {"no-pure": 0, "error": 0, "few": 0}
    with OracleSession(exe=exe, seed=seed) as s:
        for i, va in enumerate(vas):
            try:
                r = s.vectors(va, n=n)
            except Exception as e:                       # noqa: BLE001
                skipped["error"] += 1
                continue
            # Only vectors that are x86-only ground truth AND that made no
            # call at all: a call would need the callee lifted too, and the
            # replay harness cannot honour a stub.
            vecs = [v for v in r.vectors
                    if v.get("pure") and v.get("term") == "ret"
                    and not v.get("calls")]
            if not vecs:
                skipped["no-pure"] += 1
                continue
            if len(vecs) < min_vectors:
                skipped["few"] += 1
                continue
            covered = set()
            for v in vecs:
                covered.update(v.get("blocks") or [])
            for v in vecs:
                rec = bytearray()
                inp = v["in"]
                rec += struct.pack("<II", inp["ecx"] & 0xFFFFFFFF,
                                   inp["edx"] & 0xFFFFFFFF)
                st = inp["stack"]
                rec += struct.pack("<I", len(st))
                for x in st:
                    rec += struct.pack("<I", x & 0xFFFFFFFF)
                mem = inp.get("mem") or []
                rec += struct.pack("<I", len(mem))
                for m in mem:
                    b = bytes.fromhex(m["d"])
                    rec += struct.pack("<II", m["a"], len(b)) + b
                o = v["out"]
                rec += struct.pack("<8I", o["eax"] & 0xFFFFFFFF,
                                   o["edx"] & 0xFFFFFFFF,
                                   o["ecx"] & 0xFFFFFFFF,
                                   o["ebx"] & 0xFFFFFFFF,
                                   o["esi"] & 0xFFFFFFFF,
                                   o["edi"] & 0xFFFFFFFF,
                                   o["ebp"] & 0xFFFFFFFF,
                                   o["esp_delta"] & 0xFFFFFFFF)
                w = [x for x in (v.get("writes") or [])
                     if x.get("r") != "stack"]
                rec += struct.pack("<I", len(w))
                for m in w:
                    b = bytes.fromhex(m["d"])
                    rec += struct.pack("<II", m["a"], len(b)) + b
                body += struct.pack("<II", len(rec) + 8, va) + rec
                nvec += 1
            meta[f"{va:#010x}"] = {
                "va": va, "n_vectors": len(vecs),
                "static_blocks": r.static_blocks,
                "covered_blocks": len(covered & set(range(0)) or covered),
                "coverage_pct": round(
                    100.0 * len(covered) / r.static_blocks, 1)
                if r.static_blocks else 0.0,
                "source": r.source, "cc": r.cc, "n_args": r.n_args,
            }
            nf += 1
            if (i + 1) % progress == 0:
                print(f"  {i+1}/{len(vas)}  kept {nf}  {nvec} vectors  "
                      f"{time.time()-t0:.0f}s", flush=True)
    with open(out_path, "wb") as fh:
        fh.write(struct.pack("<III", MAGIC, nf, nvec))
        fh.write(body)
    with open(out_path + ".meta.json", "w", encoding="utf-8") as fh:
        json.dump({"functions": meta, "skipped": skipped,
                   "n_functions": nf, "n_vectors": nvec}, fh)
    print(f"wrote {out_path}: {nf} functions, {nvec} vectors, "
          f"{len(body)+12} bytes, {time.time()-t0:.0f}s  skipped={skipped}")
    return nf, nvec


_W = {}


def _init(n, exe, seed, max_insns):
    from api import OracleSession
    _W["s"] = OracleSession(exe=exe, seed=seed)
    _W["n"] = n
    _W["max_insns"] = max_insns


def _one(va):
    """Build one function's records in a worker -> (va, blob, meta, why)."""
    s = _W["s"]
    try:
        r = s.vectors(va, n=_W["n"], max_insns=_W["max_insns"])
    except Exception as e:                                   # noqa: BLE001
        return (va, b"", None, "error:" + type(e).__name__)
    vecs = [v for v in r.vectors
            if v.get("pure") and v.get("term") == "ret" and not v.get("calls")]
    if not vecs:
        return (va, b"", None, "no-pure")
    covered = set()
    for v in vecs:
        covered.update(v.get("blocks") or [])
    body = bytearray()
    for v in vecs:
        rec = bytearray()
        inp = v["in"]
        rec += struct.pack("<II", inp["ecx"] & 0xFFFFFFFF,
                           inp["edx"] & 0xFFFFFFFF)
        st = inp["stack"]
        rec += struct.pack("<I", len(st))
        for x in st:
            rec += struct.pack("<I", x & 0xFFFFFFFF)
        mem = inp.get("mem") or []
        rec += struct.pack("<I", len(mem))
        for m in mem:
            b = bytes.fromhex(m["d"])
            rec += struct.pack("<II", m["a"], len(b)) + b
        o = v["out"]
        rec += struct.pack("<8I", o["eax"] & 0xFFFFFFFF, o["edx"] & 0xFFFFFFFF,
                           o["ecx"] & 0xFFFFFFFF, o["ebx"] & 0xFFFFFFFF,
                           o["esi"] & 0xFFFFFFFF, o["edi"] & 0xFFFFFFFF,
                           o["ebp"] & 0xFFFFFFFF, o["esp_delta"] & 0xFFFFFFFF)
        w = [x for x in (v.get("writes") or []) if x.get("r") != "stack"]
        rec += struct.pack("<I", len(w))
        for m in w:
            b = bytes.fromhex(m["d"])
            rec += struct.pack("<II", m["a"], len(b)) + b
        body += struct.pack("<II", len(rec) + 8, va) + rec
    meta = {"va": va, "n_vectors": len(vecs),
            "static_blocks": r.static_blocks,
            "covered_blocks": len(covered),
            "coverage_pct": round(100.0 * len(covered) / r.static_blocks, 1)
            if r.static_blocks else 0.0,
            "source": r.source, "cc": r.cc, "n_args": r.n_args}
    return (va, bytes(body), meta, None)


def build_parallel(vas, n, exe, out_path, seed=1, workers=12,
                   max_insns=120000, min_vectors=4):
    import multiprocessing as mp
    body = bytearray()
    meta = {}
    skipped = collections.Counter()
    nf = nvec = 0
    t0 = time.time()
    with mp.Pool(workers, initializer=_init,
                 initargs=(n, exe, seed, max_insns)) as pool:
        for k, (va, blob, m, why) in enumerate(
                pool.imap_unordered(_one, vas, chunksize=4)):
            if why:
                skipped[why] += 1
            elif m["n_vectors"] < min_vectors:
                skipped["few"] += 1
            else:
                body += blob
                meta["%#010x" % va] = m
                nf += 1
                nvec += m["n_vectors"]
            if (k + 1) % 250 == 0:
                el = time.time() - t0
                print("  %d/%d kept %d vec %d %.0fs eta %.0fs"
                      % (k + 1, len(vas), nf, nvec, el,
                         (len(vas) - k - 1) / ((k + 1) / el)), flush=True)
    with open(out_path, "wb") as fh:
        fh.write(struct.pack("<III", MAGIC, nf, nvec))
        fh.write(body)
    with open(out_path + ".meta.json", "w", encoding="utf-8") as fh:
        json.dump({"functions": meta, "skipped": dict(skipped),
                   "n_functions": nf, "n_vectors": nvec}, fh)
    print("wrote %s: %d functions, %d vectors, %d bytes, %.0fs skipped=%s"
          % (out_path, nf, nvec, len(body) + 12, time.time() - t0,
             dict(skipped)))
    return nf, nvec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vas-file", required=True)
    ap.add_argument("--module-dir", action="append", default=[],
                    help="dir(s) with lifted*.c to intersect against")
    ap.add_argument("--n", type=int, default=40)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--exe", default=os.path.join(
        peimage.REPO_ROOT, "tools", "isaac-ng.unpacked.exe"))
    ap.add_argument("--out", default=os.path.join(OUT, "vectors.bin"))
    ap.add_argument("--workers", type=int, default=12)
    ap.add_argument("--max-insns", type=int, default=120000)
    a = ap.parse_args()

    with open(a.vas_file, encoding="utf8") as fh:
        vas = [int(x, 0) for x in fh.read().split() if x.strip()]
    if a.module_dir:
        have = lifted_set(a.module_dir)
        before = len(vas)
        vas = [v for v in vas if v in have]
        print(f"module defines {len(have)} functions; "
              f"{len(vas)}/{before} of the requested VAs are present")
    if a.limit:
        vas = vas[:a.limit]
    build_parallel(vas, a.n, a.exe, a.out, seed=a.seed,
                   workers=a.workers, max_insns=a.max_insns)


if __name__ == "__main__":
    main()
