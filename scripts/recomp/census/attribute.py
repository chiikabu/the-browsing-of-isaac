"""Attribute .text bytes to statically-linked components.

Method, in order of confidence:

 1) EXACT   - libepoxy: the 3221 resolver stubs are known addresses, so their
              function bodies sum to an exact byte count.
 2) ANCHORED- a function that references a string only that library could own
              (its own __FILE__ assert path, its own error-message table) is
              seeded to that library.
 3) CLOSURE - a function every one of whose callers is already attributed to L,
              and which is not itself anchored elsewhere, joins L. Iterated to
              a fixpoint. This is conservative: shared helpers with any caller
              outside L stay unattributed.

Everything left over is reported as unattributed, not silently folded into
"game logic" - the difference matters for the arithmetic.
"""

import bisect
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"
SEP = chr(92)

# Strings that only the named component would emit. Kept deliberately tight -
# asset paths and generic words are excluded so seeds stay trustworthy.
ANCHORS = [
    ("glfw", [
        r"GLFW_3\.4",
        r"The GLFW library is not initialized",
        r"^GLFW Error",
        # GLFW's own _glfwInputError prefixes; no game string uses these.
        r"^Win32: ", r"^WGL: ", r"^EGL: ", r"^GLX: ", r"^OSMesa: ",
    ]),
    ("miniz", [
        r"miniz\.cpp", r"^incorrect header check$", r"^need dictionary$",
        r"^invalid distance too far back$", r"^invalid stored block lengths$",
        r"^too many length or distance symbols$", r"^invalid code lengths set$",
        r"^invalid bit length repeat$", r"^invalid literal/length code$",
        r"^invalid distance code$", r"^invalid window size$",
        r"^unknown compression method$", r"^incorrect data check$",
        r"^incorrect length check$", r"^header crc mismatch$",
        r"^buffer error$", r"^stream error$", r"^file error$",
        r"^data error$", r"^insufficient memory$", r"^stream end$",
        r"zlib (?:version|memory) error", r"Unknown zlib error",
    ]),
    ("theoraplayer", [
        r"theoraplayer", r"Theoraplayer", r"TheoraplayerException",
        r"VideoClip", r"libtheora version", r"libvorbis version",
        r"Theora Audio Interface", r"theora stream", r"vorbis stream",
    ]),
    ("stb_vorbis", [r"stb_vorbis", r"STB_VORBIS"]),
    ("ogg", [r"ogg\.cpp", r"^OggS$", r"Could not decode OGG"]),
    ("clownresampler", [r"clownresampler"]),
    ("libpng", [r"^libpng (?:warning|error)", r"^png_", r"Incompatible libpng"]),
    ("libjpeg", [
        r"^Bogus ", r"JPEG", r"Huffman (?:code|table)", r"^Quantization table",
        r"^Copyright \(C\) \d+, Thomas G\. Lane",
    ]),
    ("openal-client", [r"^OpenAL", r"^ALC_", r"Failed to open OpenAL"]),
    ("steam-client", [r"^SteamAPI", r"SteamCloudFile"]),
    ("eos-client", [r"^EOS_", r"Epic Online"]),
    ("curl-client", [r"^curl_easy", r"^libcurl"]),
    ("crt-startup", [
        r"Microsoft Visual C\+\+ Runtime Library",
        r"R6\d{3}", r"^- CRT not initialized",
        r"^- floating point support not loaded",
        r"Runtime Error!", r"^\.\.\.$",
        r"program name unknown",
    ]),
]


def all_strings(pe):
    out = []
    pat = re.compile(rb"[\x20-\x7e]{4,}")
    wpat = re.compile(rb"(?:[\x20-\x7e]\x00){4,}")
    for name in (".rdata", ".data"):
        s = pe.section(name)
        if not s:
            continue
        blob = pe.data[s.raw_offset:s.raw_offset + s.raw_size]
        base = pe.image_base + s.rva
        for m in pat.finditer(blob):
            out.append((base + m.start(), len(m.group()),
                        m.group().decode("ascii")))
        for m in wpat.finditer(blob):
            out.append((base + m.start(), len(m.group()),
                        m.group().decode("utf-16-le")))
    out.sort()
    return out


def main():
    pe = PE(default_target())
    idx = json.loads((OUT / "text-index.json").read_text(encoding="utf-8"))
    funcs = idx["functions"]                       # [[va,size],...] sorted
    fvas = [f[0] for f in funcs]
    fsize = {f[0]: f[1] for f in funcs}

    def owner(addr):
        i = bisect.bisect_right(fvas, addr) - 1
        if i < 0:
            return None
        return fvas[i]

    # ---- call graph -----------------------------------------------------
    callers = defaultdict(set)   # callee -> {caller funcs}
    callees = defaultdict(set)
    for tgt_s, sites in idx["callSites"].items():
        tgt = int(tgt_s)
        for site in sites:
            src = owner(site)
            if src is None or src == tgt:
                continue
            callers[tgt].add(src)
            callees[src].add(tgt)

    # ---- string references ----------------------------------------------
    strings = all_strings(pe)
    svas = [s[0] for s in strings]

    def string_at(addr):
        i = bisect.bisect_right(svas, addr) - 1
        if i < 0:
            return None
        va, ln, txt = strings[i]
        return txt if va <= addr < va + ln else None

    # Some libraries (libjpeg, GLFW error tables) never reference their message
    # strings by immediate; they index a table of pointers. So a reference to a
    # .rdata address that looks like an array of string pointers counts as a
    # reference to every string in that array.
    import struct as _struct

    def pointer_table_strings(addr, max_entries=256):
        out = []
        off = pe.rva_to_off(addr - pe.image_base)
        if off is None or addr & 3:
            return out
        for k in range(max_entries):
            if off + 4 * k + 4 > len(pe.data):
                break
            p = _struct.unpack_from("<I", pe.data, off + 4 * k)[0]
            if p == 0:
                continue
            t = string_at(p)
            if t is None:
                if k >= 3:
                    break
                if k < 3:
                    break
            else:
                out.append(t)
        return out if len(out) >= 3 else []

    func_strings = defaultdict(list)
    for imm_s, sites in idx["dataRefs"].items():
        imm = int(imm_s)
        txt = string_at(imm)
        extra = [] if txt is not None else pointer_table_strings(imm)
        if txt is None and not extra:
            continue
        for site in sites:
            f = owner(site)
            if f is None:
                continue
            if txt is not None:
                func_strings[f].append(txt)
            else:
                func_strings[f].extend(extra)

    # ---- seeds ------------------------------------------------------------
    compiled = [(lib, [re.compile(p) for p in pats]) for lib, pats in ANCHORS]
    assign = {}
    seed_evidence = defaultdict(list)
    for f, txts in func_strings.items():
        for lib, rxs in compiled:
            hit = None
            for t in txts:
                if any(rx.search(t) for rx in rxs):
                    hit = t
                    break
            if hit is not None:
                if f not in assign:
                    assign[f] = lib
                    if len(seed_evidence[lib]) < 8:
                        seed_evidence[lib].append({"func": "0x%08x" % f,
                                                   "string": hit[:100]})
                break

    seeded_counts = defaultdict(int)
    for f, lib in assign.items():
        seeded_counts[lib] += 1

    # ---- exact: libepoxy stubs -------------------------------------------
    stubs = {}
    sf = OUT / "epoxy-stubs.json"
    if sf.exists():
        stubs = {k: int(v, 16) for k, v in
                 json.loads(sf.read_text(encoding="utf-8")).items()}
    epoxy_funcs = set()
    for va in set(stubs.values()):
        f = owner(va)
        if f is not None:
            epoxy_funcs.add(f)
            assign[f] = "libepoxy"

    anchored = dict(assign)   # snapshot before closure widens anything

    # ---- purity constraint -------------------------------------------------
    # A vendored library never calls certain APIs. GLFW has no reason to touch
    # the Lua VM, Steam, EOS, OpenAL or curl; an image codec touches none of
    # those plus no windowing. Blocking those functions from joining a component
    # stops one mis-seeded game function from dragging its whole subtree in.
    imports_json = json.loads((OUT / "imports.json").read_text(encoding="utf-8"))
    slot_family = {}
    for r in imports_json["symbols"]:
        dll = r["dll"]
        if dll.startswith("lua"):
            fam = "lua"
        elif dll == "steam_api.dll":
            fam = "steam"
        elif dll.startswith("eossdk"):
            fam = "eos"
        elif dll == "openal32.dll":
            fam = "openal"
        elif dll == "libcurl.dll":
            fam = "curl"
        elif dll in ("user32.dll", "gdi32.dll"):
            fam = "window"
        else:
            fam = None
        if fam:
            slot_family[int(r["iatVa"], 16)] = fam

    calls_family = defaultdict(set)
    for imm_s, sites in idx["indirectAbs"].items():
        fam = slot_family.get(int(imm_s))
        if not fam:
            continue
        for _n in range(1):
            pass
    # indirectAbs is slot -> count, so re-derive sites from a direct scan
    import struct as _st
    _t = pe.section(".text")
    _lo, _hi = _t.raw_offset, _t.raw_offset + _t.raw_size
    _bv = pe.image_base + _t.rva
    _d = pe.data
    _i = _lo
    while _i < _hi - 6:
        if _d[_i] == 0xFF and _d[_i + 1] in (0x15, 0x25):
            imm = _st.unpack_from("<I", _d, _i + 2)[0]
            fam = slot_family.get(imm)
            if fam:
                f = owner(_bv + (_i - _lo))
                if f is not None:
                    calls_family[f].add(fam)
            _i += 6
            continue
        _i += 1

    FORBIDDEN = {
        "glfw": {"lua", "steam", "eos", "openal", "curl"},
        "libepoxy": {"lua", "steam", "eos", "openal", "curl", "window"},
        "libpng": {"lua", "steam", "eos", "openal", "curl", "window"},
        "libjpeg": {"lua", "steam", "eos", "openal", "curl", "window"},
        "miniz": {"lua", "steam", "eos", "openal", "curl", "window"},
        "ogg": {"lua", "steam", "eos", "curl", "window"},
        "stb_vorbis": {"lua", "steam", "eos", "curl", "window"},
        "clownresampler": {"lua", "steam", "eos", "curl", "window"},
        "theoraplayer": {"lua", "steam", "eos", "curl", "window"},
    }

    def allowed(f, lib):
        bad = FORBIDDEN.get(lib)
        if not bad:
            return True
        return not (calls_family.get(f, set()) & bad)

    blocked = 0
    # drop anchors that violate their own purity rule (mis-seeded game code)
    for f in list(assign.keys()):
        if not allowed(f, assign[f]):
            del assign[f]
            anchored.pop(f, None)
            blocked += 1

    # ---- closure ----------------------------------------------------------
    changed = True
    rounds = 0
    while changed and rounds < 50:
        changed = False
        rounds += 1
        for f, _sz in funcs:
            if f in assign:
                continue
            cs = callers.get(f)
            if not cs:
                continue
            libs = {assign.get(c) for c in cs}
            if len(libs) == 1:
                lib = libs.pop()
                if lib is not None and allowed(f, lib):
                    assign[f] = lib
                    changed = True

    # ---- roll up ----------------------------------------------------------
    tally = defaultdict(lambda: {"functions": 0, "bytes": 0, "seeded": 0,
                                 "anchoredBytes": 0, "anchoredFunctions": 0})
    for f, sz in funcs:
        lib = assign.get(f)
        key = lib if lib else "(unattributed)"
        tally[key]["functions"] += 1
        tally[key]["bytes"] += sz
        if anchored.get(f) == lib and lib is not None:
            tally[key]["anchoredBytes"] += sz
            tally[key]["anchoredFunctions"] += 1
    for lib, n in seeded_counts.items():
        tally[lib]["seeded"] = n
    tally["libepoxy"]["seeded"] = len(epoxy_funcs)

    text = pe.section(".text")
    total_body = sum(sz for _v, sz in funcs)
    rows = sorted(tally.items(), key=lambda kv: -kv[1]["bytes"])

    result = {
        "textRawSize": text.raw_size,
        "functionBodyBytes": total_body,
        "closureRounds": rounds,
        "method": {
            "anchoredBytes": "functions that directly reference a string only "
                             "that component could own (plus libepoxy's exact "
                             "resolver-stub set)",
            "bytes": "anchored plus call-graph closure: functions all of whose "
                     "callers are already in the component",
        },
        "components": [
            {"component": k, "functions": v["functions"], "bytes": v["bytes"],
             "anchoredFunctions": v["anchoredFunctions"],
             "anchoredBytes": v["anchoredBytes"],
             "seededFunctions": v["seeded"],
             "pctOfText": round(100.0 * v["bytes"] / text.raw_size, 3)}
            for k, v in rows],
        "seedEvidence": {k: v for k, v in seed_evidence.items()},
        "epoxyExactFunctions": len(epoxy_funcs),
    }
    (OUT / "attribution.json").write_text(json.dumps(result, indent=1), encoding="utf-8")
    (OUT / "func-components.json").write_text(json.dumps(
        {"0x%08x" % f: lib for f, lib in sorted(assign.items())}), encoding="utf-8")

    print("%-18s %7s %11s %8s | %7s %11s" % (
        "component", "funcs", "bytes", "%text", "anchF", "anchBytes"))
    for k, v in rows:
        print("%-18s %7d %11d %7.3f%% | %7d %11d" % (
            k, v["functions"], v["bytes"],
            100.0 * v["bytes"] / text.raw_size,
            v["anchoredFunctions"], v["anchoredBytes"]))
    print("-" * 72)
    print("%-18s %7d %11d %7.3f%%" % ("TOTAL bodies", len(funcs), total_body,
                                      100.0 * total_body / text.raw_size))
    tp = sum(v["bytes"] for k, v in rows if k != "(unattributed)")
    tpa = sum(v["anchoredBytes"] for k, v in rows if k != "(unattributed)")
    print("third-party total : %d bytes (%.2f%% of .text)  anchored-only: %d (%.2f%%)"
          % (tp, 100.0 * tp / text.raw_size, tpa, 100.0 * tpa / text.raw_size))
    print("closure rounds: %d   purity-blocked anchors removed: %d" % (rounds, blocked))
    print("\nseed evidence:")
    for lib, ev in seed_evidence.items():
        print(" ", lib)
        for e in ev[:3]:
            print("     %s  %r" % (e["func"], e["string"]))
    print("\nwrote", OUT / "attribution.json")


if __name__ == "__main__":
    main()
