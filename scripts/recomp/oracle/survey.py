"""Scale survey: throughput + what fraction of functions is actually
emulatable without stubs.

    python survey.py --sample 2000 --n 100 --workers 14

Writes one JSON line per function to output/recomp/oracle/survey.jsonl and is
resumable: re-running skips VAs already present in that file.

Every number this prints comes from the run, not from an estimate.
"""

from __future__ import annotations

import argparse
import json
import multiprocessing as mp
import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import abi as abimod            # noqa: E402
import cfg as cfgmod            # noqa: E402
import crtmodels               # noqa: E402
import emu as emumod           # noqa: E402
import peimage                 # noqa: E402
import runner as runmod        # noqa: E402
import vectors as vecmod       # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
SURVEY = os.path.join(OUT, "survey.jsonl")


_W = {}


def _init(n_vectors: int, max_insns: int, seed: int):
    pe = peimage.load()
    o = emumod.Oracle(pe)
    crtmodels.install(o)
    _W["pe"] = pe
    _W["o"] = o
    _W["starts"] = set(cfgmod.build_function_starts(
        pe, os.path.join(OUT, "func_starts.json")))
    _W["n"] = n_vectors
    _W["max_insns"] = max_insns
    _W["seed"] = seed


def _survey_one(va: int) -> dict:
    o: emumod.Oracle = _W["o"]
    pe = _W["pe"]
    n = _W["n"]
    t0 = time.perf_counter()
    rec = {"va": va}
    try:
        c = cfgmod.recover(pe, va, func_starts=_W["starts"])
        a = abimod.infer(pe, c)
        rec.update({
            "blocks": c.block_count, "insns": len(c.insns),
            "cc": a.cc, "n_args": a.n_args, "conf": a.confidence,
            "direct_calls": sum(1 for x in c.calls if x.kind == "direct"),
            "iat_calls": sum(1 for x in c.calls if x.kind == "iat"),
            "indirect_calls": sum(1 for x in c.calls if x.kind == "indirect"),
            "unresolved_jumps": len(c.unresolved_jumps),
        })
        fb = frozenset(c.blocks)
        terms: dict[str, int] = {}
        stubs: dict[str, int] = {}
        models: dict[str, int] = {}
        cov: set[int] = set()
        corpus: list[vecmod.InputProgram] = []
        pure = pmm = 0
        for i in range(n):
            rng = runmod.vec_rng(_W["seed"], i)
            # blind random only -- guided mutation measured worse (covbench)
            prog = vecmod.generate(
                rng, n_stack=a.n_args,
                thiscall=a.cc in ("thiscall", "fastcall"))
            try:
                r, _v, _ad = vecmod.execute(
                    o, va, prog, cc=a.cc, func_blocks=fb, timeout_us=0,
                    max_insns=_W["max_insns"])
            except MemoryError:
                terms["scratch-exhausted"] = terms.get("scratch-exhausted", 0) + 1
                o.reset_scratch()
                continue
            except Exception as e:
                terms["harness-error"] = terms.get("harness-error", 0) + 1
                rec.setdefault("harness_error", f"{type(e).__name__}: {e}")
                o.reset_scratch()
                continue
            terms[r.term] = terms.get(r.term, 0) + 1
            for s in r.stubs:
                stubs[s] = stubs.get(s, 0) + 1
            for s in r.models:
                models[s] = models.get(s, 0) + 1
            if r.pure:
                pure += 1
            if r.pure_modulo_models:
                pmm += 1
            new = (set(r.blocks) & fb) - cov
            cov |= new
            if new:
                if len(corpus) < 32:
                    corpus.append(prog)
                else:
                    corpus[i % 32] = prog
            o.restore_dirty(r)
        rec.update({
            "n": n, "pure": pure, "pure_modulo_models": pmm,
            "terms": terms,
            "stubs": dict(sorted(stubs.items(), key=lambda kv: -kv[1])[:8]),
            "models": dict(sorted(models.items(), key=lambda kv: -kv[1])[:8]),
            "n_stub_kinds": len(stubs),
            "cov": len(cov),
            "cov_pct": round(100.0 * len(cov) / c.block_count, 1)
            if c.block_count else 0.0,
        })
    except Exception as e:
        import traceback
        rec["error"] = f"{type(e).__name__}: {e}"
        rec["tb"] = traceback.format_exc()[-600:]
    rec["secs"] = round(time.perf_counter() - t0, 4)
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=1000)
    ap.add_argument("--n", type=int, default=100)
    ap.add_argument("--workers", type=int, default=max(1, mp.cpu_count() - 2))
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--max-insns", type=int, default=200_000)
    ap.add_argument("--min-refs", type=int, default=1)
    ap.add_argument("--fresh", action="store_true")
    ap.add_argument("--vas-file", help="restrict sampling to these VAs")
    ap.add_argument("--out", default=SURVEY)
    a = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    pe = peimage.load()
    starts = cfgmod.build_function_starts(
        pe, os.path.join(OUT, "func_starts.json"), min_refs=a.min_refs)
    all_vas = sorted(starts)
    if a.vas_file:
        with open(a.vas_file, "r", encoding="utf-8") as fh:
            keep = {int(x, 0) for x in fh.read().split() if x.strip()}
        all_vas = [v for v in all_vas if v in keep]
    rng = random.Random(a.seed)
    sample = sorted(rng.sample(all_vas, min(a.sample, len(all_vas))))

    survey_path = a.out
    done: set[int] = set()
    if not a.fresh and os.path.exists(survey_path):
        with open(survey_path, "r", encoding="utf-8") as fh:
            for line in fh:
                try:
                    done.add(json.loads(line)["va"])
                except Exception:
                    pass
    todo = [v for v in sample if v not in done]
    print(f"{len(all_vas)} direct-call function entries in .text; "
          f"sample {len(sample)}, {len(done)} already done, {len(todo)} to run; "
          f"{a.n} vectors each; {a.workers} workers")
    if not todo:
        print("nothing to do")
        return

    t0 = time.time()
    n_done = 0
    with open(survey_path, "a" if done else "w", encoding="utf-8") as fh, \
            mp.Pool(a.workers, initializer=_init,
                    initargs=(a.n, a.max_insns, a.seed)) as pool:
        for rec in pool.imap_unordered(_survey_one, todo, chunksize=4):
            fh.write(json.dumps(rec, separators=(",", ":")) + "\n")
            n_done += 1
            if n_done % 100 == 0:
                fh.flush()
                el = time.time() - t0
                print(f"  {n_done}/{len(todo)}  {n_done/el:.1f} func/s  "
                      f"{n_done*a.n/el:.0f} vec/s aggregate  "
                      f"eta {(len(todo)-n_done)/(n_done/el):.0f}s")
    el = time.time() - t0
    print(f"\n{n_done} functions, {n_done*a.n} vectors, {el:.1f}s, "
          f"{n_done*a.n/el:.0f} vec/s aggregate over {a.workers} workers "
          f"({n_done*a.n/el/a.workers:.0f} vec/s/core)")


if __name__ == "__main__":
    main()
