"""The .data/.rdata problem: can lifted code just boot from a PE snapshot?

Measures, for each initialized section:
  * raw (on-disk) vs virtual size -> the BSS-like tail that has no bytes
  * base relocation count and where the targets point
  * how many relocation targets are absolute pointers into each section
  * the C++ surface that makes a raw snapshot insufficient: the IAT, the CRT
    initialiser tables (.CRT$XC*), TLS, and vtable/RTTI pointers
"""

import json
import struct
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"

RELOC_TYPES = {0: "ABSOLUTE(pad)", 1: "HIGH", 2: "LOW", 3: "HIGHLOW", 4: "HIGHADJ", 10: "DIR64"}


def parse_relocs(pe):
    rva, size = pe.dirs.get("BASERELOC", (0, 0))
    off = pe.rva_to_off(rva)
    end = off + size
    entries = []
    blocks = 0
    while off < end:
        page_rva, block_size = struct.unpack_from("<II", pe.data, off)
        if block_size == 0:
            break
        blocks += 1
        n = (block_size - 8) // 2
        for k in range(n):
            w = struct.unpack_from("<H", pe.data, off + 8 + k * 2)[0]
            typ, o = w >> 12, w & 0xFFF
            entries.append((typ, page_rva + o))
        off += block_size
    return blocks, entries


def main():
    pe = PE(default_target())
    blocks, relocs = parse_relocs(pe)

    type_counts = Counter(RELOC_TYPES.get(t, "T%d" % t) for t, _ in relocs)
    highlow = [r for t, r in relocs if t == 3]

    def sec_of(rva):
        s = pe.section_for_rva(rva)
        return s.name if s else "?"

    # where the fixups LIVE
    live_in = Counter(sec_of(r) for r in highlow)
    # where the fixups POINT (read the stored dword)
    points_to = Counter()
    unresolvable = 0
    targets_by_sec = defaultdict(int)
    for r in highlow:
        off = pe.rva_to_off(r)
        if off is None or off + 4 > len(pe.data):
            unresolvable += 1
            continue
        v = struct.unpack_from("<I", pe.data, off)[0]
        trva = v - pe.image_base
        points_to[sec_of(trva)] += 1
        targets_by_sec[sec_of(trva)] += 1

    secs = []
    for s in pe.sections:
        bss = max(0, s.virtual_size - s.raw_size)
        secs.append({
            "name": s.name,
            "rva": "0x%x" % s.rva,
            "va": "0x%08x" % (pe.image_base + s.rva),
            "virtualSize": s.virtual_size,
            "rawSize": s.raw_size,
            "rawOffset": "0x%x" % s.raw_offset,
            "bssTailBytes": bss,
            "writable": bool(s.characteristics & 0x80000000),
            "executable": bool(s.characteristics & 0x20000000),
            "relocsLivingHere": live_in.get(s.name, 0),
            "relocTargetsHere": targets_by_sec.get(s.name, 0),
        })

    # zero-run analysis of .data raw bytes: how much of the on-disk .data is
    # actually zero (i.e. could be treated as BSS even though it has bytes)
    dsec = pe.section(".data")
    dblob = pe.data[dsec.raw_offset:dsec.raw_offset + dsec.raw_size]
    dzero = dblob.count(0)
    rsec = pe.section(".rdata")
    rblob = pe.data[rsec.raw_offset:rsec.raw_offset + rsec.raw_size]
    rzero = rblob.count(0)

    # trailing zero tail of .data raw
    tail = 0
    while tail < len(dblob) and dblob[len(dblob) - 1 - tail] == 0:
        tail += 1

    # CRT initialiser tables + TLS: pointers that must run, not just be copied
    tls_rva, tls_size = pe.dirs.get("TLS", (0, 0))
    tls = None
    if tls_rva:
        o = pe.rva_to_off(tls_rva)
        start, endva, index, callbacks, zerofill, chars = struct.unpack_from("<IIIIII", pe.data, o)
        cbs = []
        if callbacks:
            co = pe.rva_to_off(callbacks - pe.image_base)
            if co:
                k = 0
                while True:
                    v = struct.unpack_from("<I", pe.data, co + k * 4)[0]
                    if not v:
                        break
                    cbs.append("0x%08x" % v)
                    k += 1
        tls = {"rawDataStart": "0x%08x" % start, "rawDataEnd": "0x%08x" % endva,
               "indexAddr": "0x%08x" % index, "callbacksAddr": "0x%08x" % callbacks,
               "zeroFill": zerofill, "callbacks": cbs}

    iat_rva, iat_size = pe.dirs["IAT"]
    iat_slots = iat_size // 4

    # Pointers from .data/.rdata into .text. A dword only counts as a real
    # pointer if a HIGHLOW fixup exists at that address -- otherwise RVA tables
    # (notably the 3226-entry export address table, whose RVAs fall inside the
    # .text VA range) inflate the count. Both figures are reported so the
    # difference is visible.
    tlo = pe.image_base + pe.section(".text").rva
    thi = tlo + pe.section(".text").virtual_size
    reloc_set = set(highlow)
    vt = defaultdict(int)
    vt_naive = defaultdict(int)
    selfptr = defaultdict(int)
    for name in (".rdata", ".data"):
        s = pe.section(name)
        lo, hi = s.raw_offset, s.raw_offset + s.raw_size
        for i in range(lo, hi - 4, 4):
            v = struct.unpack_from("<I", pe.data, i)[0]
            rva_here = s.rva + (i - s.raw_offset)
            relocated = rva_here in reloc_set
            if tlo <= v < thi:
                vt_naive[name] += 1
                if relocated:
                    vt[name] += 1
            elif relocated and pe.image_base <= v < pe.image_base + pe.size_of_image:
                selfptr[name] += 1

    result = {
        "imageBase": "0x%08x" % pe.image_base,
        "sizeOfImage": pe.size_of_image,
        "sections": secs,
        "relocations": {
            "blocks": blocks,
            "entries": len(relocs),
            "byType": dict(type_counts),
            "highlow": len(highlow),
            "livingIn": dict(live_in),
            "pointingTo": dict(points_to),
            "unresolvable": unresolvable,
        },
        "dataSection": {
            "rawSize": dsec.raw_size,
            "virtualSize": dsec.virtual_size,
            "bssTailBytes": dsec.virtual_size - dsec.raw_size,
            "zeroBytesInRaw": dzero,
            "nonZeroBytesInRaw": dsec.raw_size - dzero,
            "trailingZeroRun": tail,
        },
        "rdataSection": {
            "rawSize": rsec.raw_size,
            "virtualSize": rsec.virtual_size,
            "bssTailBytes": rsec.virtual_size - rsec.raw_size,
            "zeroBytesInRaw": rzero,
            "nonZeroBytesInRaw": rsec.raw_size - rzero,
        },
        "iat": {"rva": "0x%x" % iat_rva, "bytes": iat_size, "slots": iat_slots,
                "note": "lives inside .rdata; every slot is a host-supplied "
                        "pointer that a raw snapshot cannot provide"},
        "tls": tls,
        "codePointersInData": dict(vt),
        "codePointersInDataNaive": dict(vt_naive),
        "intraImagePointersInData": dict(selfptr),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "dataimage.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    print("sections:")
    print("  %-9s %10s %10s %10s %8s %8s" % ("name", "vsize", "rawsize", "bss-tail",
                                             "relocsIn", "tgtsHere"))
    for s in secs:
        print("  %-9s %10d %10d %10d %8d %8d" % (
            s["name"], s["virtualSize"], s["rawSize"], s["bssTailBytes"],
            s["relocsLivingHere"], s["relocTargetsHere"]))
    print("\nrelocations: %d entries in %d blocks; types=%s" % (
        len(relocs), blocks, dict(type_counts)))
    print("  fixups live in :", dict(live_in))
    print("  fixups point to:", dict(points_to))
    print("\n.data raw %d bytes: %d zero / %d non-zero (trailing zero run %d)" % (
        dsec.raw_size, dzero, dsec.raw_size - dzero, tail))
    print(".data BSS-like tail beyond raw: %d bytes" % (dsec.virtual_size - dsec.raw_size))
    print(".rdata raw %d bytes: %d zero / %d non-zero" % (rsec.raw_size, rzero,
                                                          rsec.raw_size - rzero))
    print("\nIAT: %d slots (%d bytes) at rva 0x%x" % (iat_slots, iat_size, iat_rva))
    print("TLS:", json.dumps(tls))
    print("code pointers in data (reloc-confirmed):", dict(vt))
    print("code pointers in data (naive dword scan):", dict(vt_naive),
          "<- difference is RVA tables, not pointers")
    print("intra-image non-code pointers (reloc-confirmed):", dict(selfptr))
    print("\nwrote", OUT / "dataimage.json")


if __name__ == "__main__":
    main()
