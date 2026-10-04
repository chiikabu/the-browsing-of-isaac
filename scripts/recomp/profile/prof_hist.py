"""Histogram a V8 --prof --preprocess JSON: self ticks per code entry, and the
hot offsets inside the entries named on the command line.

    python scripts/recomp/profile/prof_hist.py output/recomp/profile/v8-stuck.json isaac_lifted_dispatch
"""
import json, sys, collections, codecs

path = sys.argv[1]
want = sys.argv[2:] or ["isaac_lifted_dispatch"]
raw = open(path, "rb").read()
if raw.startswith(codecs.BOM_UTF16_LE) or raw.startswith(codecs.BOM_UTF16_BE):
    text = raw.decode("utf-16")          # PowerShell's > redirection writes UTF-16
else:
    text = raw.decode("utf8")
p = json.loads(text)
codes = p["code"]
ticks = p["ticks"]
print("codes %d, ticks %d, keys %s" % (len(codes), len(ticks), sorted(p.keys())))
# a tick: {"tm":..., "vm":..., "s":[code_idx, offset, code_idx, offset, ...]} (top frame first)
self_ticks = collections.Counter()
incl_ticks = collections.Counter()
hot_off = {w: collections.Counter() for w in want}
n_stack = 0
for t in ticks:
    s = t.get("s") or []
    if len(s) < 2:
        continue
    n_stack += 1
    top = s[0]
    self_ticks[top] += 1
    seen = set()
    for i in range(0, len(s), 2):
        ci = s[i]
        if ci in seen:
            continue
        seen.add(ci)
        incl_ticks[ci] += 1
    name = codes[top]["name"] if 0 <= top < len(codes) else "?"
    for w in want:
        if name == w or name.endswith(":" + w) or name.startswith(w):
            hot_off[w][s[1]] += 1
print("ticks with a stack: %d" % n_stack)


def cname(ci):
    if 0 <= ci < len(codes):
        c = codes[ci]
        return "%s [%s%s]" % (c.get("name", "?")[:70], c.get("type", ""), ("/" + c["kind"]) if c.get("kind") else "")
    return "?%d" % ci


print("---- self ticks (top 25):")
for ci, n in self_ticks.most_common(25):
    print("  %6d  %5.1f%%  %s" % (n, 100.0 * n / n_stack, cname(ci)))
print("---- inclusive ticks (top 15):")
for ci, n in incl_ticks.most_common(15):
    print("  %6d  %5.1f%%  %s" % (n, 100.0 * n / n_stack, cname(ci)))
for w in want:
    tot = sum(hot_off[w].values())
    print("---- hot offsets inside %s (%d self ticks):" % (w, tot))
    for off, n in hot_off[w].most_common(20):
        print("  +0x%-6x %6d  %5.1f%%" % (off, n, 100.0 * n / max(1, tot)))
for ci, c in enumerate(codes):
    nm = c.get("name", "")
    if any(nm == w or nm.endswith(":" + w) for w in want):
        print("code entry %d: %s" % (ci, {k: v for k, v in c.items() if k != "source"}))
