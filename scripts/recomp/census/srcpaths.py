"""Extract embedded __FILE__ source paths.

MSVC bakes __FILE__ into assert()/_wassert and several logging macros, so the
.rdata string pool contains a partial map of the original source tree. Grouping
those paths separates engine code (KAGE) from vendored third-party trees, and
the assert call sites give concrete .text anchors for each component.
"""

import collections
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"
SEP = chr(92)  # backslash


def all_strings(pe, minlen=5, sections=(".rdata", ".data", ".text")):
    pat = re.compile(rb"[\x20-\x7e]{%d,}" % minlen)
    out = []
    for name in sections:
        s = pe.section(name)
        if not s:
            continue
        blob = pe.data[s.raw_offset:s.raw_offset + s.raw_size]
        for m in pat.finditer(blob):
            out.append((pe.image_base + s.rva + m.start(),
                        m.group().decode("ascii"), name))
    return out


def wide_strings(pe, minlen=6, sections=(".rdata", ".data")):
    """UTF-16LE strings (MSVC _wassert uses wide __FILE__)."""
    pat = re.compile((rb"(?:[\x20-\x7e]\x00){%d,}" % minlen))
    out = []
    for name in sections:
        s = pe.section(name)
        if not s:
            continue
        blob = pe.data[s.raw_offset:s.raw_offset + s.raw_size]
        for m in pat.finditer(blob):
            out.append((pe.image_base + s.rva + m.start(),
                        m.group().decode("utf-16-le"), name))
    return out


def main():
    pe = PE(default_target())
    narrow = all_strings(pe)
    wide = wide_strings(pe)
    combined = [(v, t, sec, "ascii") for v, t, sec in narrow] + \
               [(v, t, sec, "utf16") for v, t, sec in wide]

    src_rx = re.compile(r"[A-Za-z]:" + re.escape(SEP) + r"[^ \t]*[.](?:c|cc|cpp|cxx|h|hpp|inl)$",
                        re.IGNORECASE)
    paths = [(v, t, sec, enc) for v, t, sec, enc in combined if src_rx.search(t)]

    def norm(t):
        return t.replace("/", SEP)

    roots = collections.Counter(SEP.join(norm(t).split(SEP)[:5]) for _v, t, _s, _e in paths)
    groups = collections.Counter(SEP.join(norm(t).split(SEP)[:7]) for _v, t, _s, _e in paths)

    result = {
        "narrowStrings": len(narrow),
        "wideStrings": len(wide),
        "sourcePaths": len(paths),
        "roots": roots.most_common(),
        "groups": groups.most_common(),
        "paths": [{"va": "0x%08x" % v, "section": s, "enc": e, "path": t}
                  for v, t, s, e in sorted(paths)],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "srcpaths.json").write_text(json.dumps(result, indent=1), encoding="utf-8")

    print("narrow strings : %d" % len(narrow))
    print("wide strings   : %d" % len(wide))
    print("source paths   : %d" % len(paths))
    print("\n--- roots (first 5 components) ---")
    for k, c in roots.most_common(40):
        print("  %4d  %s" % (c, k))
    print("\n--- groups (first 7 components) ---")
    for k, c in groups.most_common(60):
        print("  %4d  %s" % (c, k))
    print("\n--- sample ---")
    for v, t, s, e in sorted(paths)[:25]:
        print("  0x%08x %-6s %-5s %s" % (v, s, e, t))
    print("\nwrote", OUT / "srcpaths.json")


if __name__ == "__main__":
    main()
