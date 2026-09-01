"""Statically-linked third-party code census.

Two independent angles:

 1) libepoxy is measurable exactly. Each exported `epoxy_glX` is a function
    pointer in .data whose *initial value on disk* is the address of that entry
    point's resolver stub in .text. Reading those 3221 initial values yields the
    exact set of epoxy stub addresses, and with function boundaries the exact
    byte footprint.

 2) Everything else is identified from version/banner strings in .rdata, then
    localised by finding which .text functions reference those strings and
    growing outward over the call graph.
"""

import json
import re
import struct
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"

# Banner / version strings that positively identify a vendored library.
FINGERPRINTS = [
    ("zlib",        [rb"inflate 1\.\d", rb"deflate 1\.\d", rb"1\.2\.\d+", rb"invalid distance too far back",
                     rb"incorrect header check", rb"need dictionary"]),
    ("libpng",      [rb"libpng version", rb"png_", rb"Application built with libpng"]),
    ("libjpeg",     [rb"JFIF", rb"Unsupported JPEG", rb"jpeg_"]),
    ("freetype",    [rb"FreeType", rb"\.notdef", rb"ftsystem", rb"FT_New_Face"]),
    ("libepoxy",    [rb"epoxy", rb"Couldn't find current GLX or EGL context"]),
    ("box2d",       [rb"[Bb]ox2[Dd]", rb"b2Body", rb"b2World", rb"b2Fixture"]),
    ("bullet",      [rb"btCollision", rb"btRigidBody"]),
    ("lua",         [rb"Lua 5\.\d", rb"\$LuaVersion", rb"luaL_", rb"attempt to index"]),
    ("sdl",         [rb"SDL_", rb"Simple DirectMedia"]),
    ("boost",       [rb"boost::", rb"boost/"]),
    ("tinyxml",     [rb"TiXml", rb"tinyxml", rb"XML declaration", rb"Error parsing Element"]),
    ("rapidxml",    [rb"rapidxml"]),
    ("pugixml",     [rb"pugixml"]),
    ("jsoncpp",     [rb"jsoncpp", rb"Json::", rb"in Json::Value::"]),
    ("rapidjson",   [rb"rapidjson"]),
    ("ogg/vorbis",  [rb"[Vv]orbis", rb"OggS", rb"libogg"]),
    ("theora",      [rb"[Tt]heora"]),
    ("openal",      [rb"OpenAL", rb"AL_", rb"ALC_"]),
    ("curl",        [rb"libcurl", rb"curl_easy"]),
    ("openssl",     [rb"OpenSSL", rb"SSL_"]),
    ("steam",       [rb"SteamAPI", rb"Steam[A-Z]"]),
    ("eos",         [rb"EOS_", rb"Epic Online"]),
    ("protobuf",    [rb"google::protobuf", rb"protobuf"]),
    ("glew",        [rb"GLEW", rb"glewInit"]),
    ("glfw",        [rb"GLFW", rb"glfwInit"]),
    ("imgui",       [rb"ImGui", rb"imgui"]),
    ("stb",         [rb"stbi_", rb"stb_image"]),
    ("physfs",      [rb"PhysicsFS", rb"PHYSFS_"]),
    ("minizip",     [rb"unzip", rb"minizip", rb"Zip64"]),
    ("bink/ffmpeg", [rb"ffmpeg", rb"libav", rb"Bink"]),
]


def find_strings(pe, section_names=(".rdata", ".data", ".text"), minlen=4):
    """Return list of (va, text) for printable ASCII runs."""
    out = []
    pat = re.compile(rb"[\x20-\x7e]{%d,}" % minlen)
    for name in section_names:
        s = pe.section(name)
        if not s:
            continue
        blob = pe.data[s.raw_offset:s.raw_offset + s.raw_size]
        for m in pat.finditer(blob):
            out.append((pe.image_base + s.rva + m.start(), m.group().decode("ascii"), name))
    return out


def epoxy_stub_addresses(pe, exports_json):
    """Initial on-disk value of each epoxy .data pointer slot = its resolver stub."""
    data = json.loads(Path(exports_json).read_text(encoding="utf-8"))
    stubs = {}
    text = pe.section(".text")
    tlo = pe.image_base + text.rva
    thi = tlo + text.virtual_size
    for e in data["allExports"]:
        if e["section"] != ".data":
            continue
        off = pe.rva_to_off(e["rva"])
        if off is None:
            continue
        init = struct.unpack_from("<I", pe.data, off)[0]
        if tlo <= init < thi:
            stubs[e["name"]] = init
    return stubs


def main():
    pe = PE(default_target())
    OUT.mkdir(parents=True, exist_ok=True)

    # ---- 1. libepoxy exact footprint -----------------------------------
    stubs = epoxy_stub_addresses(pe, OUT / "exports.json")
    stub_vas = sorted(set(stubs.values()))
    text = pe.section(".text")
    tbase = pe.image_base + text.rva

    # stub sizes = gap to next stub (they are emitted contiguously by epoxy's
    # generator); take the median to sanity check, sum gaps for the footprint.
    gaps = [stub_vas[i + 1] - stub_vas[i] for i in range(len(stub_vas) - 1)]
    gap_hist = defaultdict(int)
    for g in gaps:
        gap_hist[g] += 1
    # contiguous run detection
    runs = []
    if stub_vas:
        start = prev = stub_vas[0]
        for v in stub_vas[1:]:
            if v - prev <= 64:
                prev = v
                continue
            runs.append((start, prev))
            start = prev = v
        runs.append((start, prev))
    run_bytes = sum(hi - lo for lo, hi in runs)

    epoxy = {
        "pointerSlots": len(stubs),
        "distinctStubs": len(stub_vas),
        "stubVaLo": "0x%08x" % stub_vas[0] if stub_vas else None,
        "stubVaHi": "0x%08x" % stub_vas[-1] if stub_vas else None,
        "contiguousRuns": len(runs),
        "runBytes": run_bytes,
        "commonGaps": sorted(gap_hist.items(), key=lambda kv: -kv[1])[:8],
        "dataSlotBytes": len(stubs) * 4,
        "runs": [{"lo": "0x%08x" % lo, "hi": "0x%08x" % hi, "bytes": hi - lo}
                 for lo, hi in runs[:40]],
    }

    # ---- 2. fingerprint scan -------------------------------------------
    strings = find_strings(pe)
    by_lib = {}
    for lib, pats in FINGERPRINTS:
        hits = []
        for pat in pats:
            rx = re.compile(pat.decode("latin1"))
            n = 0
            sample = []
            for va, txt, sec in strings:
                if rx.search(txt):
                    n += 1
                    if len(sample) < 6:
                        sample.append({"va": "0x%08x" % va, "section": sec,
                                       "text": txt[:120]})
            hits.append({"pattern": pat.decode("latin1"), "matches": n, "sample": sample})
        total = sum(h["matches"] for h in hits)
        by_lib[lib] = {"totalStringMatches": total, "patterns": hits}

    result = {"epoxy": epoxy, "fingerprints": by_lib,
              "stringCount": len(strings)}
    (OUT / "thirdparty-raw.json").write_text(json.dumps(result, indent=1), encoding="utf-8")
    (OUT / "epoxy-stubs.json").write_text(
        json.dumps({k: "0x%08x" % v for k, v in sorted(stubs.items())}, indent=1),
        encoding="utf-8")

    print("=== libepoxy ===")
    print(" pointer slots in .data : %d (%d bytes)" % (len(stubs), len(stubs) * 4))
    print(" distinct .text stubs   : %d" % len(stub_vas))
    print(" stub VA range          : %s .. %s" % (epoxy["stubVaLo"], epoxy["stubVaHi"]))
    print(" contiguous runs        : %d covering %d bytes" % (len(runs), run_bytes))
    print(" most common stub gaps  :", epoxy["commonGaps"])
    print("\n=== third-party string fingerprints (sorted) ===")
    for lib, v in sorted(by_lib.items(), key=lambda kv: -kv[1]["totalStringMatches"]):
        if not v["totalStringMatches"]:
            continue
        print(" %-14s %d string matches" % (lib, v["totalStringMatches"]))
        for h in v["patterns"]:
            if h["matches"]:
                ex = h["sample"][0]["text"][:70] if h["sample"] else ""
                print("      %-45s %-6d  e.g. %r" % (h["pattern"], h["matches"], ex))
    print("\nlibs with ZERO evidence:",
          ", ".join(k for k, v in by_lib.items() if not v["totalStringMatches"]))
    print("\nwrote", OUT / "thirdparty-raw.json")


if __name__ == "__main__":
    main()
