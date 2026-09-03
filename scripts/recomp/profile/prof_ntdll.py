"""Symbolize the shared-library ticks of a raw V8 --prof log against the
DLL's export table (no debugger, no PDB): which ntdll entry points the main
thread was sitting in.

    python scripts/recomp/profile/prof_ntdll.py .scratch/game-instance/v8-stuck.log [t_lo_s] [t_hi_s]

The tick log's `shared-library,<path>,<start>,<end>` lines give the module
range; `tick,<pc>,<time_us>,...` lines give the sampled PC. A PC is mapped
to the nearest export at or below it (RVA), which for ntdll's Nt*/Rtl*
stubs is the syscall or wait routine itself.
"""
import struct, sys, collections, os


def exports(path):
    d = open(path, "rb").read()
    pe = struct.unpack_from("<I", d, 0x3C)[0]
    assert d[pe:pe + 4] == b"PE\0\0"
    nsec = struct.unpack_from("<H", d, pe + 6)[0]
    opt = pe + 24
    magic = struct.unpack_from("<H", d, opt)[0]
    dd = opt + (0x70 if magic == 0x20B else 0x60)
    exp_rva, exp_size = struct.unpack_from("<II", d, dd)
    optsz = struct.unpack_from("<H", d, pe + 20)[0]
    secs = []
    for i in range(nsec):
        s = opt + optsz + i * 40
        vsz, va, rawsz, raw = struct.unpack_from("<IIII", d, s + 8)   # VirtualSize, VirtualAddress, SizeOfRawData, PointerToRawData
        secs.append((va, vsz, raw, rawsz))

    def r2o(rva):
        for va, vsz, raw, rawsz in secs:
            if va <= rva < va + max(vsz, rawsz):
                return raw + (rva - va)
        raise ValueError("rva %#x outside sections" % rva)

    e = r2o(exp_rva)
    nfunc, nname, afunc, aname, aord = struct.unpack_from("<IIIII", d, e + 20)
    out = []
    for i in range(nname):
        nrva = struct.unpack_from("<I", d, r2o(aname) + 4 * i)[0]
        o = r2o(nrva)
        name = d[o:d.index(b"\0", o)].decode("ascii", "replace")
        ordn = struct.unpack_from("<H", d, r2o(aord) + 2 * i)[0]
        frva = struct.unpack_from("<I", d, r2o(afunc) + 4 * ordn)[0]
        if exp_rva <= frva < exp_rva + exp_size:
            continue                      # forwarder
        out.append((frva, name))
    out.sort()
    return out


def main():
    log = sys.argv[1]
    t_lo = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
    t_hi = float(sys.argv[3]) if len(sys.argv) > 3 else 1e18
    libs = []
    ticks = []
    t0 = None
    with open(log, "r", encoding="utf8", errors="replace") as fh:
        for line in fh:
            if line.startswith("shared-library,"):
                p = line.rstrip("\n").split(",")
                libs.append((p[1].replace("\\\\", "\\"), int(p[2], 16), int(p[3], 16)))
            elif line.startswith("tick,"):
                p = line.split(",")
                pc = int(p[1], 16)
                tm = int(p[2])
                if t0 is None:
                    t0 = tm
                if t_lo <= (tm - t0) / 1e6 < t_hi:
                    ticks.append(pc)
    print("libs %d, ticks in window %d" % (len(libs), len(ticks)))
    per_lib = collections.Counter()
    hits = collections.defaultdict(collections.Counter)
    exp_cache = {}
    for pc in ticks:
        for path, lo, hi in libs:
            if lo <= pc < hi:
                per_lib[path] += 1
                if os.path.exists(path):
                    if path not in exp_cache:
                        try:
                            exp_cache[path] = exports(path)
                        except Exception as ex:      # noqa: BLE001
                            exp_cache[path] = []
                            print("  (no exports for %s: %s)" % (path, ex))
                    ex = exp_cache[path]
                    rva = pc - lo
                    # nearest export at or below
                    import bisect
                    i = bisect.bisect_right([r for r, _n in ex], rva) - 1
                    name = ex[i][1] if i >= 0 else "?"
                    hits[path][name] += 1
                break
        else:
            per_lib["(not in a shared library)"] += 1
    for path, n in per_lib.most_common():
        print("%6d  %s" % (n, path))
        for name, k in hits[path].most_common(12):
            print("          %6d  %s" % (k, name))


if __name__ == "__main__":
    main()
