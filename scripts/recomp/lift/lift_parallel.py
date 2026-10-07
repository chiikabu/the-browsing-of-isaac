#!/usr/bin/env python3
"""lift_parallel.py -- run emit.py on address buckets in parallel and merge.

The stable split (`--split-va N`, round 14g) makes every TU a function of the
function ADDRESS alone, so buckets can be lifted by independent processes.
Two phases separate global dispatch delivery from byte coverage:

  phase 1  every worker gets its requested bucket subset and the complete
           start set. With --no-rescue --defer-closure it emits only those
           requests and records actual entries, static exits, direct callees
           and covered bytes;
  phase 2  one emit.py --rescue-only run imports all workers' entry/edge
           inventories and coverage. It recursively delivers every missing
           static exit, regardless of coverage or --follow, follows genuine
           callees when requested, and rescues uncovered inventory fragments.
           No worker independently emits a shared continuation.

The merge re-splits unique definitions by address into `lifted_<bucket>.c`,
regenerates sorted declarations and edge inventories, unions byte coverage,
and recomputes summary ratios. Per-function stats are sorted by entry VA.
Generated code and delivery artifacts match a serial emit.py run.

Usage: the emit.py argv with one addition --
    python scripts/recomp/lift/lift_parallel.py --jobs 12 <emit.py args ...>
`--va-file`, `--split-va` and `--out` are required; `--stats` is set per part
and merged. patch_reentry.py runs on the merged directory afterwards, as it
does after a sequential lift (round 14i).
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pe import PE32  # noqa: E402

RE_FN = re.compile(r"^void sub_([0-9a-f]{8})\(CpuState \*restrict s\) \{$", re.M)
TU_HEADER = '#include "lifted_decls.h"\n\n'


def parse_driver_args(argv):
    """Split the driver's own options from emit.py's."""
    jobs = os.cpu_count() or 4
    rest = []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--jobs":
            jobs = int(argv[i + 1]); i += 2; continue
        if a.startswith("--jobs="):
            jobs = int(a.split("=", 1)[1]); i += 1; continue
        rest.append(a); i += 1
    return jobs, rest


def get_opt(args, name, default=None):
    for i, a in enumerate(args):
        if a == name and i + 1 < len(args):
            return args[i + 1]
        if a.startswith(name + "="):
            return a.split("=", 1)[1]
    return default


def drop_opt(args, name):
    out = []
    i = 0
    while i < len(args):
        if args[i] == name:
            i += 2; continue
        if args[i].startswith(name + "="):
            i += 1; continue
        out.append(args[i]); i += 1
    return out


def read_vas(path):
    if not path:
        return []
    with open(path, encoding="utf8") as fh:
        return [int(value, 0) for line in fh
                if (value := line.split("#")[0].strip())]


def read_call_depths(path):
    with open(path, encoding="utf8") as fh:
        return {int(va, 0): level for va, level in json.load(fh).items()}


def merge_call_depths(into, values):
    for va, level in values.items():
        into[va] = min(into.get(va, level), level)


def read_ranges(path):
    out = []
    with open(path, encoding="utf8") as fh:
        for line in fh:
            p = line.split("#")[0].split()
            if len(p) == 2:
                out.append((int(p[0], 0), int(p[1], 0)))
    return out


def merge_ranges(ranges):
    merged = []
    for a, b in sorted(ranges):
        if merged and a <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], b))
        else:
            merged.append((a, b))
    return merged


def split_tu(text):
    """{va: chunk} for one emit.py TU; chunk = lifted[va] + the '\\n\\n' after it."""
    if not text.startswith(TU_HEADER):
        raise ValueError("not an emit.py translation unit")
    ms = list(RE_FN.finditer(text))
    out = {}
    for i, m in enumerate(ms):
        end = ms[i + 1].start() if i + 1 < len(ms) else len(text)
        out[int(m.group(1), 16)] = text[m.start():end]
    return out


def start_emit(cmd, log_path):
    log = open(log_path, "w")
    return subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT), log


def wait_all(procs, out):
    failed = 0
    for tag, p, log in procs:
        rc = p.wait()
        log.close()
        if rc != 0:
            failed += 1
            print("  %s FAILED (rc %d): see %s" % (tag, rc, log.name))
    return failed


def main():
    t0 = time.time()
    jobs, emit_args = parse_driver_args(sys.argv[1:])
    exe = get_opt(emit_args, "--exe", "tools/isaac-ng.unpacked.exe")
    va_file = get_opt(emit_args, "--va-file")
    split_va = get_opt(emit_args, "--split-va")
    out = get_opt(emit_args, "--out")
    module = get_opt(emit_args, "--module", "lifted")
    if not (va_file and split_va and out):
        print("lift_parallel: --va-file, --split-va and --out are required", file=sys.stderr)
        return 2
    split_va = int(split_va, 0)
    text_lo = PE32(exe).text().vaddr

    starts = []
    for i, arg in enumerate(emit_args):
        if arg == "--va":
            starts.append(int(emit_args[i + 1], 0))
        elif arg.startswith("--va="):
            starts.append(int(arg.split("=", 1)[1], 0))
    starts.extend(read_vas(va_file))
    starts = list(dict.fromkeys(starts))
    buckets: dict[int, list[int]] = {}
    for va in starts:
        buckets.setdefault((va - text_lo) // split_va, []).append(va)
    # balance by function count: largest buckets first, greedy onto the lightest job
    order = sorted(buckets, key=lambda b: -len(buckets[b]))
    jobs = max(1, min(jobs, len(order)))
    parts: list[list[int]] = [[] for _ in range(jobs)]
    load = [0] * jobs
    for b in order:
        j = load.index(min(load))
        parts[j].append(b)
        load[j] += len(buckets[b])

    os.makedirs(out, exist_ok=True)
    requests_path = os.path.join(out, ".requests.txt")
    starts_path = os.path.join(out, ".starts.txt")
    with open(requests_path, "w") as fh:
        for va in starts:
            fh.write("%#010x\n" % va)
    boundaries = set(starts) | set(read_vas(get_opt(emit_args, "--starts-file")))
    with open(starts_path, "w") as fh:
        for va in sorted(boundaries):
            fh.write("%#010x\n" % va)
    base_args = emit_args
    for option in ("--va-file", "--va", "--starts-file", "--out", "--stats"):
        base_args = drop_opt(base_args, option)
    emit = [sys.executable, os.path.join(HERE, "emit.py"), *base_args]

    # ---- phase 1: requested definitions only; global edges are deferred -----
    procs = []
    part_dirs = []
    for j, blist in enumerate(parts):
        if not blist:
            continue
        pdir = os.path.join(out, ".part%02d" % j)
        shutil.rmtree(pdir, ignore_errors=True)
        os.makedirs(pdir)
        vf = os.path.join(pdir, "starts.txt")
        with open(vf, "w") as fh:
            for b in sorted(blist):
                for va in buckets[b]:
                    fh.write("0x%08x\n" % va)
        cmd = [*emit,
               "--starts-file", starts_path,
               "--no-rescue", "--defer-closure",
               "--va-file", vf, "--out", pdir, "--stats", os.path.join(pdir, "stats.json")]
        p, log = start_emit(cmd, os.path.join(pdir, "emit.log"))
        procs.append(("worker %d" % j, p, log))
        part_dirs.append(pdir)
    print("lift_parallel: %d starts in %d buckets over %d workers" % (len(starts), len(buckets), len(procs)))
    if wait_all(procs, out):
        return 1
    t_phase1 = time.time() - t0

    # ---- phase 2: one recursive delivery/rescue against global inventory ----
    covered = merge_ranges(r for pdir in part_dirs for r in read_ranges(os.path.join(pdir, "covered.txt")))
    entries = {va for pdir in part_dirs
               for va in read_vas(os.path.join(pdir, "entries.txt"))}
    static_exits = {va for pdir in part_dirs
                    for va in read_vas(os.path.join(pdir, "static_exits.txt"))}
    call_depths = {}
    for pdir in part_dirs:
        merge_call_depths(call_depths, read_call_depths(os.path.join(pdir, "direct_calls.json")))
    cov_path = os.path.join(out, ".covered.txt")
    entries_path = os.path.join(out, ".entries.txt")
    exits_path = os.path.join(out, ".static-exits.txt")
    calls_path = os.path.join(out, ".direct-calls.json")
    with open(cov_path, "w") as fh:
        for a, b in covered:
            fh.write("%#010x %#010x\n" % (a, b))
    for path, values in ((entries_path, entries), (exits_path, static_exits)):
        with open(path, "w") as fh:
            for va in sorted(values):
                fh.write("%#010x\n" % va)
    with open(calls_path, "w") as fh:
        json.dump({"%#010x" % va: call_depths[va] for va in sorted(call_depths)}, fh)
    rdir = os.path.join(out, ".rescue")
    shutil.rmtree(rdir, ignore_errors=True)
    os.makedirs(rdir)
    cmd = [*emit, "--rescue-only", "--covered-file", cov_path,
           "--entries-file", entries_path, "--static-exits-file", exits_path,
           "--direct-calls-file", calls_path, "--starts-file", starts_path,
           "--va-file", requests_path, "--out", rdir, "--stats", os.path.join(rdir, "stats.json")]
    p, log = start_emit(cmd, os.path.join(rdir, "emit.log"))
    if wait_all([("rescue", p, log)], out):
        return 1
    t_phase2 = time.time() - t0 - t_phase1
    covered = merge_ranges(covered + read_ranges(os.path.join(rdir, "covered.txt")))
    static_exits.update(read_vas(os.path.join(rdir, "static_exits.txt")))
    merge_call_depths(call_depths, read_call_depths(os.path.join(rdir, "direct_calls.json")))

    # ---- merge: re-split by address ---------------------------------------
    funcs: dict[int, str] = {}
    for pdir in part_dirs + [rdir]:
        for f in sorted(os.listdir(pdir)):
            if f.startswith(module + "_") and f.endswith(".c"):
                with open(os.path.join(pdir, f), encoding="utf8") as fh:
                    chunks = split_tu(fh.read())
                dup = set(chunks) & set(funcs)
                if dup:
                    raise SystemExit("lift_parallel: %s lifted twice (e.g. %#010x)" % (len(dup), min(dup)))
                funcs.update(chunks)
    for f in os.listdir(out):
        if f.startswith(module + "_") and f.endswith(".c"):
            os.remove(os.path.join(out, f))
    by_bucket: dict[int, list[int]] = {}
    for va in sorted(funcs):
        by_bucket.setdefault((va - text_lo) // split_va, []).append(va)
    files = []
    c_bytes = 0
    for b in sorted(by_bucket):
        name = "%s_%03d.c" % (module, b)
        path = os.path.join(out, name)
        with open(path, "w", encoding="utf8") as fh:
            fh.write(TU_HEADER)
            for va in by_bucket[b]:
                fh.write(funcs[va])
        files.append(name)
        c_bytes += os.path.getsize(path)

    # declarations: the union, in emit.py's order (sorted; arity = the maximum seen)
    subs = set()
    others: dict[str, int] = {}
    others_wide: dict[str, int] = {}
    imports = set()
    missing = set()
    data_stops: dict[int, str] = {}
    failures: list[str] = []
    summaries = []
    stats: list = []
    for pdir in part_dirs + [rdir]:
        with open(os.path.join(pdir, "lifted_decls.h"), encoding="utf8") as fh:
            for line in fh:
                line = line.rstrip("\n")
                m = re.match(r"void sub_([0-9a-f]{8})\(CpuState", line)
                if m:
                    subs.add(int(m.group(1), 16))
                elif line.startswith("uint32_t recomp_other_"):
                    name = line[len("uint32_t recomp_other_"):].split("(", 1)[0]
                    others[name] = max(others.get(name, 0), line.count("uint32_t") - 1)
                elif line.startswith("void recomp_otherw_"):
                    name = line[len("void recomp_otherw_"):].split("(", 1)[0]
                    others_wide[name] = max(others_wide.get(name, 0), line.count("const uint8_t"))
                elif line.startswith("void "):
                    imports.add(line[len("void "):].split("(", 1)[0])
        with open(os.path.join(pdir, "missing.txt"), encoding="utf8") as fh:
            missing.update(int(l, 0) for l in fh if l.strip())
        with open(os.path.join(pdir, "data_stops.txt"), encoding="utf8") as fh:
            for l in fh:
                if l.strip():
                    va, _sep, msg = l.rstrip("\n").partition(" ")
                    data_stops.setdefault(int(va, 0), msg)
        with open(os.path.join(pdir, "failures.txt"), encoding="utf8") as fh:
            failures.extend(l for l in fh if l.strip())
        with open(os.path.join(pdir, "summary.json"), encoding="utf8") as fh:
            summaries.append(json.load(fh))
        with open(os.path.join(pdir, "stats.json"), encoding="utf8") as fh:
            st = json.load(fh)
        stats.extend(st)
    missing -= set(funcs)
    decls = ["/* generated */", '#include "recomp_state.h"', '#include "recomp_rt.h"', ""]
    for va in sorted(subs | missing):
        decls.append("void sub_%08x(CpuState *restrict s);" % va)
    for o in sorted(others):
        params = ", ".join(["CpuState *restrict s"] + ["uint32_t"] * others[o])
        decls.append("uint32_t recomp_other_%s(%s);" % (o, params))
    for o in sorted(others_wide):
        params = ", ".join(["CpuState *restrict s", "uint8_t *out", "unsigned outsz"] +
                           ["const uint8_t *a%d, unsigned a%dsz" % (i, i) for i in range(others_wide[o])])
        decls.append("void recomp_otherw_%s(%s);" % (o, params))
    for n in sorted(imports):
        decls.append("void %s(CpuState *restrict s);" % n)
    decls.append("")
    with open(os.path.join(out, "lifted_decls.h"), "w") as fh:
        fh.write("\n".join(decls) + "\n")
    with open(os.path.join(out, "missing.txt"), "w") as fh:
        for va in sorted(missing):
            fh.write("%#010x\n" % va)
    with open(os.path.join(out, "failures.txt"), "w") as fh:
        fh.write("".join(failures))
    with open(os.path.join(out, "data_stops.txt"), "w") as fh:
        for va in sorted(data_stops):
            fh.write("%#010x %s\n" % (va, data_stops[va]))
    with open(os.path.join(out, "covered.txt"), "w") as fh:
        for a, b in covered:
            fh.write("%#010x %#010x\n" % (a, b))
    for name, values in (("entries.txt", funcs),
                         ("static_exits.txt", static_exits)):
        with open(os.path.join(out, name), "w") as fh:
            for va in sorted(values):
                fh.write("%#010x\n" % va)
    with open(os.path.join(out, "direct_calls.json"), "w") as fh:
        json.dump({"%#010x" % va: call_depths[va] for va in sorted(call_depths)},
                  fh, indent=2)
    shutil.copyfile(os.path.join((part_dirs + [rdir])[0], "recomp_state.h"),
                    os.path.join(out, "recomp_state.h"))

    # summary: sums where a sum is the sequential meaning, recomputed elsewhere
    first = summaries[0]
    rescue = summaries[-1]
    phase1 = summaries[:-1]
    text_vsize = first["text_vsize"]
    covered_bytes = sum(b - a for a, b in covered)

    def total(key):
        return sum(s.get(key, 0) for s in summaries)

    summary = dict(
        argv=[sys.argv[0]] + sys.argv[1:],
        exe=first["exe"],
        func_starts_scanned=first["func_starts_scanned"],
        requested=sum(s["requested"] for s in phase1),
        lifted=len(funcs),
        failed=total("failed"),
        missing_callees=len(missing),
        hand_written=first["hand_written"],
        callother_kinds=sorted(others),
        callother_wide_kinds=sorted(others_wide),
        x86_bytes=total("x86_bytes"),
        x86_insns=total("x86_insns"),
        pcode_ops=total("pcode_ops"),
        c_bytes=c_bytes,
        c_lines=total("c_lines"),
        files=files,
        scan_s=max(s["scan_s"] for s in summaries),
        lift_s=round(t_phase1 + t_phase2, 2),
        big_regs=first["big_regs"],
        text_bytes_covered=covered_bytes,
        text_vsize=text_vsize,
        text_coverage_pct=round(100.0 * covered_bytes / text_vsize, 2),
        import_shims_used=len(imports),
        fragments_excluded=first["fragments_excluded"],
        data_stops=len(data_stops),
        fragments_rescued=rescue["fragments_rescued"],
        jt_tables=total("jt_tables"),
        jt_entries=total("jt_entries"),
        jt_tailcalls=total("jt_tailcalls"),
        jt_unresolved=total("jt_unresolved"),
        dispatch_loop_funcs=total("dispatch_loop_funcs"),
        callind_remaining=total("callind_remaining"),
        callind_const_unresolved=total("callind_const_unresolved"),
        parts=len(part_dirs),
        phase1_s=round(t_phase1, 2),
        phase2_s=round(t_phase2, 2),
    )
    if summary["x86_bytes"]:
        summary["c_bytes_per_x86_byte"] = round(c_bytes / summary["x86_bytes"], 2)
    if summary["x86_insns"]:
        summary["c_lines_per_x86_insn"] = round(summary["c_lines"] / summary["x86_insns"], 2)
    peak = [s["peak_rss_mb"] for s in summaries if "peak_rss_mb" in s]
    if peak:
        summary["peak_rss_mb"] = max(peak)
    summary["parallel_wall_s"] = round(time.time() - t0, 2)
    with open(os.path.join(out, "summary.json"), "w") as fh:
        json.dump(summary, fh, indent=2)
    with open(os.path.join(out, "stats.json"), "w") as fh:
        json.dump(sorted(stats, key=lambda row: row["va"]), fh, indent=1)
    for pdir in part_dirs + [rdir]:
        shutil.rmtree(pdir, ignore_errors=True)
    for path in (cov_path, entries_path, exits_path, calls_path,
                 requests_path, starts_path):
        os.remove(path)
    print("lift_parallel: %d TUs, lifted %d (rescued %d), failed %d, %.1f s wall (phase 1 %.1f s, phase 2 %.1f s)"
          % (len(files), len(funcs), summary["fragments_rescued"], summary["failed"],
             time.time() - t0, t_phase1, t_phase2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
