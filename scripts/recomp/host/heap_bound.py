"""How much guest heap does the port actually need?

The guard between guest and host memory currently sits at 0x0ff00000, which
reserves ~242 MiB of guest heap that nobody measured. In a browser tab that is
a real product cost, so this derives a defensible bound instead of a round
number.

What can and cannot be measured without running the game:

  CAN   the exact decoded size of every texture, by reading PNG IHDR headers
        out of the asset archives -- width x height x 4 bytes of RGBA is not an
        estimate, it is arithmetic.
  CAN   which archives are streamed rather than resident (music, video), from
        the imports the engine uses to read them.
  CAN   the fixed-size allocations compiled into .text, from the immediates at
        malloc/calloc/VirtualAlloc call sites.
  CANNOT  the true simultaneous peak. That needs an instrumented allocator in a
        running port. Everything below is an UPPER BOUND and is labelled so.

Run:  python scripts/recomp/host/heap_bound.py
"""

import json
import struct
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe import PE, OUT_DIR, REPO_ROOT, CENSUS_DIR, hexva  # noqa: E402

from capstone import Cs, CS_ARCH_X86, CS_MODE_32
from capstone.x86 import X86_OP_IMM, X86_OP_MEM, X86_REG_INVALID

GAME = REPO_ROOT / ".scratch" / "game-instance"
PNG_SIG = b"\x89PNG\r\n\x1a\n"

# Archives the engine streams rather than loads whole. Music is Ogg Vorbis fed
# to OpenAL in chunks; video is Theora decoded frame by frame by theoraplayer
# (the one CreateThread in the binary). Neither is ever fully resident.
STREAMED = {"music.a", "videos.a"}


def scan_pngs(data, source):
    """Every PNG in `data`, with its exact decoded RGBA size."""
    out = []
    i = 0
    while True:
        i = data.find(PNG_SIG, i)
        if i < 0:
            break
        # IHDR follows the 8-byte signature: 4 len + 4 type + 13 data
        if data[i + 12:i + 16] != b"IHDR":
            i += 8
            continue
        w, h = struct.unpack_from(">II", data, i + 16)
        bitdepth = data[i + 24]
        colortype = data[i + 25]
        if not (0 < w <= 16384 and 0 < h <= 16384):
            i += 8
            continue
        out.append({"source": source, "w": w, "h": h,
                    "bitDepth": bitdepth, "colorType": colortype,
                    "rgbaBytes": w * h * 4})
        i += 8
    return out


def alloc_size_immediates(pe):
    """Constant sizes passed to malloc/calloc/VirtualAlloc at their call sites."""
    imports = json.loads((CENSUS_DIR / "imports.json").read_text(encoding="utf-8"))
    want = {"malloc": None, "calloc": None, "realloc": None,
            "VirtualAlloc": None, "_set_new_mode": None}
    slots, thunk_of = {}, {}
    for s in imports["symbols"]:
        if s["symbol"] in want:
            slots[int(s["iatVa"], 16)] = s["symbol"]
            for t in s.get("thunkVas", []):
                thunk_of[int(t, 16)] = s["symbol"]

    md = Cs(CS_ARCH_X86, CS_MODE_32)
    md.detail = True
    text = pe.section(".text")
    bo, bv = text.raw_offset, pe.image_base + text.rva
    fns = []
    with (REPO_ROOT / "output" / "recomp" / "export" / "functions.jsonl").open(
            "r", encoding="utf-8") as fh:
        for line in fh:
            r = json.loads(line)
            if r.get("recovered") or not r.get("inText"):
                continue
            fns.append((int(r["va"], 16), int(r["endVa"], 16)))
    fns.sort()
    ranges, cur, hi0 = [], bv, bv + text.raw_size
    for a, b in fns:
        a, b = max(a, bv), min(b, hi0)
        if b <= a:
            continue
        if a > cur:
            ranges.append((cur, a))
        ranges.append((a, b))
        cur = max(cur, b)
    if cur < hi0:
        ranges.append((cur, hi0))

    sizes = {k: Counter() for k in want}
    for lo, hi in ranges:
        off = bo + (lo - bv)
        pushes = []
        for ins in md.disasm(pe.data[off:off + (hi - lo)], lo):
            if ins.mnemonic == "push" and ins.operands and \
                    ins.operands[0].type == X86_OP_IMM:
                pushes.append(ins.operands[0].imm & 0xFFFFFFFF)
                if len(pushes) > 6:
                    pushes.pop(0)
                continue
            hit = None
            if ins.mnemonic in ("call", "jmp"):
                for op in ins.operands:
                    if (op.type == X86_OP_MEM and op.mem.base == X86_REG_INVALID
                            and op.mem.index == X86_REG_INVALID
                            and (op.mem.disp & 0xFFFFFFFF) in slots):
                        hit = slots[op.mem.disp & 0xFFFFFFFF]
                    elif op.type == X86_OP_IMM and (op.imm & 0xFFFFFFFF) in thunk_of:
                        hit = thunk_of[op.imm & 0xFFFFFFFF]
                    break
            if hit and pushes:
                # malloc(n): n is the last push. VirtualAlloc(addr,size,..): size
                # is the 3rd from last of 4.
                n = pushes[-1] if hit != "VirtualAlloc" else (
                    pushes[-3] if len(pushes) >= 3 else None)
                if n is not None and 0 < n < (1 << 31):
                    sizes[hit][n] += 1
            if ins.mnemonic in ("call", "jmp") or ins.mnemonic.startswith("j"):
                pushes = []
    return sizes


def fmt(n):
    return "{:,}".format(n)


def mib(n):
    return "%.1f MiB" % (n / 1048576.0)


def main():
    pe = PE()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ---- 1. archives -----------------------------------------------------
    packed = GAME / "resources" / "packed"
    archives = []
    all_pngs = []
    for f in sorted(packed.glob("*.a")) if packed.exists() else []:
        streamed = f.name in STREAMED
        rec = {"name": f.name, "bytes": f.stat().st_size, "streamed": streamed}
        if not streamed:
            pngs = scan_pngs(f.read_bytes(), f.name)
            rec["pngCount"] = len(pngs)
            rec["decodedRgbaBytes"] = sum(p["rgbaBytes"] for p in pngs)
            all_pngs += pngs
        archives.append(rec)

    # loose assets outside the archives
    loose_dirs = []
    for sub in ("gfx", "font"):
        d = GAME / "resources" / sub
        if not d.exists():
            continue
        pngs = []
        total = 0
        for f in d.rglob("*.png"):
            total += f.stat().st_size
            pngs += scan_pngs(f.read_bytes(), "%s/%s" % (sub, f.name))
        all_pngs += pngs
        loose_dirs.append({"dir": sub, "files": len(pngs), "onDiskBytes": total,
                           "decodedRgbaBytes": sum(p["rgbaBytes"] for p in pngs)})

    total_decoded = sum(p["rgbaBytes"] for p in all_pngs)
    largest = max(all_pngs, key=lambda p: p["rgbaBytes"]) if all_pngs else None
    all_pngs.sort(key=lambda p: -p["rgbaBytes"])

    # ---- 2. static image contribution ------------------------------------
    data_sec = pe.section(".data")
    static_bytes = pe.size_of_image

    # ---- 3. compiled-in allocation sizes ---------------------------------
    sizes = alloc_size_immediates(pe)
    biggest_const = {}
    for k, c in sizes.items():
        if c:
            biggest_const[k] = sorted(c.items(), key=lambda kv: -kv[0])[:6]

    # ---- 4. the bound ----------------------------------------------------
    # No invented budgets. Two numbers are measured; the gap between them is
    # stated as unmeasured rather than filled with a guess.
    #
    # FLOOR   the largest single texture decode. It must be one contiguous
    #         allocation, so the heap can never be smaller than this. Measured.
    # CEILING every PNG decoded and simultaneously resident as a client-side
    #         RGBA copy. Certainly never reached -- a texture uploaded with
    #         glTexImage2D lives in GPU memory, which in WebGL2 is OUTSIDE wasm
    #         linear memory -- but it is a true upper bound. Measured.
    #
    # Where the real peak sits between them depends on whether the engine keeps
    # client copies after upload, which is not decidable from the static image.
    floor_bytes = largest["rgbaBytes"] if largest else 0
    ceiling_bytes = total_decoded
    current = 0x30d00000 - 0x00d00000     # ISAAC_HEAP_VA..+ISAAC_HEAP_SIZE (768 MiB since round 24f)

    out = {
        "method": "static upper bound; NOT a measured runtime peak",
        "archives": archives,
        "looseAssetDirs": loose_dirs,
        "textures": {
            "count": len(all_pngs),
            "decodedRgbaBytesTotal": total_decoded,
            "largest": largest,
            "top10": all_pngs[:10],
        },
        "imageBytes": static_bytes,
        "allocationSizeConstants": {k: [[int(a), int(b)] for a, b in v]
                                    for k, v in biggest_const.items()},
        "bound": {
            "floorBytes": floor_bytes,
            "floorReason": "largest single texture decode, must be contiguous",
            "ceilingBytes": ceiling_bytes,
            "ceilingReason": "every PNG resident as a client RGBA copy; never "
                             "reached because GL owns the resident copy",
            "currentReservationBytes": current,
            "currentInsideBand": floor_bytes <= current <= ceiling_bytes,
            "unmeasured": "where the true peak sits in the band; needs an "
                          "instrumented allocator in a running port",
            "instrumentation": "isaac_heap_report() in src/host_shims_heap.c "
                               "records the high-water mark and prints it, so "
                               "the first integration run yields the number",
        },
        "caveats": [
            "graphics.a (17.6 MB) is a custom container: a raw PNG-signature "
            "scan finds 0 images in it, so the packed texture corpus is NOT "
            "included. The loose resources/gfx and resources/font trees are "
            "measured instead and are the extracted equivalent.",
            "music.a (182.7 MB) and videos.a (93.0 MB) are streamed and never "
            "resident, so they do not enter the bound.",
        ],
    }
    (OUT_DIR / "heap-bound.json").write_text(json.dumps(out, indent=1),
                                             encoding="utf-8")

    print("ASSET ARCHIVES")
    for a in archives:
        tag = "STREAMED (never resident)" if a["streamed"] else \
              "%d PNGs -> %s decoded RGBA" % (a.get("pngCount", 0),
                                              mib(a.get("decodedRgbaBytes", 0)))
        print("  %-16s %12s  %s" % (a["name"], fmt(a["bytes"]), tag))
    for d in loose_dirs:
        print("  %-16s %12s  %d PNGs -> %s decoded" % (
            "resources/" + d["dir"], fmt(d["onDiskBytes"]), d["files"],
            mib(d["decodedRgbaBytes"])))
    print()
    print("TEXTURES (exact, from PNG IHDR: width x height x 4)")
    print("  total PNGs                     : %s" % fmt(len(all_pngs)))
    print("  all decoded, simultaneously    : %s  <- absolute ceiling" % mib(total_decoded))
    if largest:
        print("  largest single texture         : %dx%d = %s  (%s)" % (
            largest["w"], largest["h"], mib(largest["rgbaBytes"]),
            largest["source"]))
    print("  top 5:")
    for p in all_pngs[:5]:
        print("     %5dx%-5d %10s  %s" % (p["w"], p["h"], mib(p["rgbaBytes"]),
                                          p["source"]))
    print()
    print("COMPILED-IN ALLOCATION SIZES (largest constants at each call site)")
    for k, v in biggest_const.items():
        print("  %-14s %s" % (k, ", ".join("%s x%d" % (fmt(a), b) for a, b in v)))
    print()
    print("BOUND (measured floor and ceiling; the gap is honestly unmeasured)")
    print("  FLOOR   %s   largest single texture decode, must be contiguous"
          % mib(floor_bytes))
    print("  CEILING %s  every PNG resident as a client RGBA copy" % mib(ceiling_bytes))
    print("  current %s  guest heap reservation (0x00d00000..0x30d00000)"
          % mib(current))
    print()
    if floor_bytes <= current <= ceiling_bytes:
        print("  The current reservation sits INSIDE the measured band, so it")
        print("  cannot be called oversized on the evidence available. It also")
        print("  provably cannot shrink below %s." % mib(floor_bytes))
    print("  What is NOT measured: where the true peak lies in the band. That")
    print("  needs an instrumented allocator in a running port -- which is now")
    print("  wired: isaac_heap_report() tracks the high-water mark, so the")
    print("  first integration run produces the number for free.")
    print()
    print("wrote %s" % (OUT_DIR / "heap-bound.json"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
