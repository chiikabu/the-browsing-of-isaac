"""Ticks of a V8 --prof --preprocess JSON restricted to a time window:
top frames, and for ticks whose top frame is a shared library, the first
JS/wasm frames underneath (the call path into the syscall)."""
import json, sys, collections, codecs

path = sys.argv[1]
t_lo = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0     # seconds from the first tick
t_hi = float(sys.argv[3]) if len(sys.argv) > 3 else 1e18
raw = open(path, "rb").read()
if raw.startswith(codecs.BOM_UTF16_LE) or raw.startswith(codecs.BOM_UTF16_BE):
    text = raw.decode("utf-16")
else:
    text = raw.decode("utf8")
p = json.loads(text)
codes = p["code"]
ticks = p["ticks"]
t0 = min(t["tm"] for t in ticks)
def name(ci):
    if 0 <= ci < len(codes):
        c = codes[ci]
        return (c.get("name") or "?")[:80]
    return "?%d" % ci
def is_lib(ci):
    return 0 <= ci < len(codes) and codes[ci].get("type") == "SHARED_LIB"
sel = [t for t in ticks if t_lo <= (t["tm"] - t0) / 1e6 < t_hi]
print("ticks in window: %d of %d (window %.0f..%.0f s; run %.0f s)" % (
    len(sel), len(ticks), t_lo, t_hi, (max(t["tm"] for t in ticks) - t0) / 1e6))
top = collections.Counter()
under = collections.Counter()
under2 = collections.Counter()
for t in sel:
    s = t.get("s") or []
    if len(s) < 2:
        top["(no stack)"] += 1
        continue
    frames = [s[i] for i in range(0, len(s), 2)]
    top[name(frames[0])] += 1
    if is_lib(frames[0]):
        rest = [f for f in frames[1:] if not is_lib(f)]
        under[name(rest[0]) if rest else "(none)"] += 1
        under2[" <- ".join(name(f) for f in rest[:4]) if rest else "(none)"] += 1
print("---- top frames:")
for n, c in top.most_common(20):
    print("  %6d  %5.1f%%  %s" % (c, 100.0 * c / max(1, len(sel)), n))
print("---- first non-library frame under shared-library ticks:")
for n, c in under.most_common(15):
    print("  %6d  %s" % (c, n))
print("---- call paths (4 frames) under shared-library ticks:")
for n, c in under2.most_common(12):
    print("  %6d  %s" % (c, n))
