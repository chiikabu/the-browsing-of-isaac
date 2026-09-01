"""CRT bootstrap census: what has to RUN before lifted code sees correct globals.

Follows the PE entry point into __scrt_common_main_seh and recovers the two
_initterm bounds pairs it passes. Those tables are the reason a raw snapshot of
.data/.rdata is not sufficient on its own: the on-disk bytes are the pre-main
state, and every entry in the C++ initialiser table still has to execute to
construct global objects.
"""

import json
import re
import struct
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"


def disasm(pe, va, count):
    from capstone import Cs, CS_ARCH_X86, CS_MODE_32
    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = False
    off = pe.va_to_off(va)
    out = []
    for a, s, m, o in md.disasm_lite(pe.data[off:off + count * 8], va):
        out.append((a, m, o))
        if len(out) >= count:
            break
    return out


def main():
    pe = PE(default_target())
    entry = pe.image_base + pe.entry_rva
    ins = disasm(pe, entry, 3)
    # mainCRTStartup is `call __security_init_cookie; jmp __scrt_common_main_seh`
    seh = None
    for a, m, o in ins:
        if m == "jmp":
            seh = int(o, 16)
    body = disasm(pe, seh, 120) if seh else []

    # collect `push imm32` immediates preceding each `call` -> _initterm bounds
    pushes = []
    pairs = []
    for a, m, o in body:
        if m == "push" and o.startswith("0x"):
            try:
                pushes.append(int(o, 16))
            except ValueError:
                pass
        elif m == "call":
            if len(pushes) >= 2:
                hi, lo = pushes[-2], pushes[-1]
                s_lo = pe.section_for_rva(lo - pe.image_base)
                s_hi = pe.section_for_rva(hi - pe.image_base)
                if (s_lo and s_hi and s_lo.name == ".rdata" and s_hi.name == ".rdata"
                        and 0 < hi - lo < 0x10000):
                    pairs.append((lo, hi, int(o, 16)))
            pushes = []

    tables = []
    t = pe.section(".text")
    tlo = pe.image_base + t.rva
    thi = tlo + t.virtual_size
    for lo, hi, callee in pairs:
        n = (hi - lo) // 4
        off = pe.va_to_off(lo)
        vals = [struct.unpack_from("<I", pe.data, off + 4 * k)[0] for k in range(n)]
        nz = [v for v in vals if v]
        tables.append({
            "startVa": "0x%08x" % lo, "endVa": "0x%08x" % hi,
            "inittermVa": "0x%08x" % callee,
            "slots": n, "nonNull": len(nz),
            "allTargetsInText": all(tlo <= v < thi for v in nz),
            "firstTargets": ["0x%08x" % v for v in nz[:8]],
        })

    # main() = the call right after the argc/argv/envp pushes
    main_va = None
    for i, (a, m, o) in enumerate(body):
        if m == "call" and o.startswith("0x"):
            tgt = int(o, 16)
            if tlo <= tgt < thi and tgt < 0xA00000:
                main_va = tgt
                break

    tls_rva, _ = pe.dirs.get("TLS", (0, 0))
    tls_cbs = []
    if tls_rva:
        o = pe.rva_to_off(tls_rva)
        _s, _e, _i, callbacks, _z, _c = struct.unpack_from("<IIIIII", pe.data, o)
        if callbacks:
            co = pe.rva_to_off(callbacks - pe.image_base)
            k = 0
            while True:
                v = struct.unpack_from("<I", pe.data, co + k * 4)[0]
                if not v:
                    break
                tls_cbs.append("0x%08x" % v)
                k += 1

    result = {
        "entryVa": "0x%08x" % entry,
        "scrtCommonMainSehVa": "0x%08x" % seh if seh else None,
        "mainVa": "0x%08x" % main_va if main_va else None,
        "initTermTables": tables,
        "tlsCallbacks": tls_cbs,
        "note": "on-disk .data/.rdata is the pre-main state; the C++ initialiser "
                "table must execute before lifted code observes correct globals",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "bootstate.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    print("entry point            : 0x%08x" % entry)
    print("__scrt_common_main_seh : %s" % result["scrtCommonMainSehVa"])
    print("main()                 : %s" % result["mainVa"])
    for t_ in tables:
        print("initterm table %s..%s -> %d slots, %d non-null, all in .text=%s" % (
            t_["startVa"], t_["endVa"], t_["slots"], t_["nonNull"],
            t_["allTargetsInText"]))
    print("TLS callbacks          : %s" % ", ".join(tls_cbs))
    print("\nwrote", OUT / "bootstate.json")


if __name__ == "__main__":
    main()
