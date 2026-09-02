"""Source-level overrides applied to the GENERATED lifted C after every lift.

Why this exists: the canonical target `tools/isaac-ng.unpacked.exe` carries
19 runs / 172 bytes of this project's own emulator-era hand patches (diff it
against `tools/isaac-ng.unpacked.exe.pre-coinit`). Round 10 believed one of
them fatal for the recompiled boot -- `0x009ab970`, the KAGE function that
mounts the "resources/" VFS root, has its prologue `push ebp; mov ebp, esp`
(55 8b ec) overwritten with `xor eax, eax; ret` (33 c0 c3); the lifter
faithfully lifts the stub and Ghidra keeps the orphaned body as
FUN_009ab973 -- and restored the prologue from here. Round 11 showed the
patch is load-bearing for THIS instance (a ResourceExtractor dump; see the
PATCHES comment) and removed the override again; the mechanism stays for
the other patches (recomp-architecture.md §19.5, §21).

Re-lifting from a re-patched binary would change the canonical hash that
every decomp tool pins, so the fix is applied HERE: build_boot.py rewrites
the affected function body in the lifted TU (idempotent; a marker comment
prevents double application) and drops that TU's object so it recompiles.
Each entry documents the pristine bytes it restores.

Usage (build_boot.py calls apply_lift_patches automatically):
    python scripts/recomp/lift/lift_patches.py --dir output/recomp/lift/gu [--check]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

MARKER = "/* LIFT-PATCH"

# va -> (reason, replacement function body text). The replacement MUST keep a
# RECOMP_VA(<va>u) marker: mkdispatch.py / patch_reentry.py scan the lifted C
# for those markers to build the dispatch table.
PATCHES: dict[int, tuple[str, str]] = {
    # (empty since boot round 11)
    #
    # Round 10 restored 0x009ab970's pristine prologue here so a "resources/"
    # mount root was created. Round 11 REVERTED that (the entry is gone and
    # the lifted body is the canonical `xor eax, eax; ret` again): the
    # instance is a ResourceExtractor dump with the archives' contents at the
    # install ROOT, and KAGE's resolver (0x00a16c60) tries the archive index
    # before a root's loose map, so a "resources/" root made the stale small
    # archives (config.a = Afterbirth+ players.xml) shadow the extracted
    # Repentance+ files. With only the "" root, relative keys miss the
    # archive index (keyed "resources/...") and resolve through the root
    # scan -- the behaviour the emulator-era instance was built for. The
    # boot harness now seeds that whole tree (boot_integration.mjs). Keep the
    # mechanism: the other 18 hand patches (recomp-architecture.md §19.5)
    # remain candidates.
}
# --- baked host-import stack purges to correct ---------------------------
# The lifter bakes each direct host-import call's stack purge INTO THE CALLER
# at lift time, read from the shim table: `imp_X(s); s->EIP = MEMR32(s->ESP);
# s->ESP += 4u + <purge>u;`. When a purge is corrected in gen_shims.py after
# the lift (the push-count sweep miscounts __thiscall ctors whose args are set
# inline at the caller), the baked value is stale and the caller over- or
# under-pops -- corrupting the guest stack for the NEXT call. Re-lifting the
# whole image to change a 4-byte constant per call site is wasteful, so
# build_boot.py rewrites the baked constant in place, per call site, and drops
# the touched TU's object.
#
# Each entry: imp_ C identifier -> (wrong baked purge, correct purge). Verify a
# value with `pequery.py`/the decorated name (bytes popped by the callee's ret;
# 0 for a @@XZ no-arg thiscall; 4 per pointer/int/bool arg). Measured wrong
# values come from output/recomp/host/shim-table.json BEFORE the gen_shims fix.
PURGE_PATCHES: dict[str, tuple[int, int]] = {
    # __thiscall msvcp140 ctors: the sweep counted the caller's inlined arg
    # setup as pushes (boot round 10, recomp-architecture.md).
    "imp_msvcp140____0__basic_ios_DU__char_traits_D_std___std__IAE_XZ": (32, 0),
    # Round 10b mis-curated these two as the decorated-name sum and patched the
    # (correct) measured 8 / 12 down to 4 / 8; constructors of classes with a
    # virtual base pop a hidden trailing `most_derived` int as well. These
    # entries undo that on a tree lifted before the correction (a fresh lift
    # bakes 8 / 12 from gen_shims.py and matches nothing here).
    "imp_msvcp140____0__basic_iostream_DU__char_traits_D_std___std__QAE_PAV__basic_streambuf_DU__char_traits_D_std___1__Z": (4, 8),
    "imp_msvcp140____0__basic_ostream_DU__char_traits_D_std___std__QAE_PAV__basic_streambuf_DU__char_traits_D_std___1__N_Z": (8, 12),
    "imp_msvcp140____0_Lockit_std__QAE_H_Z": (36, 4),
    "imp_msvcp140___widen___basic_ios_DU__char_traits_D_std___std__QBEDD_Z": (12, 4),
}


# --- host fastpath wrappers ---------------------------------------------
# The boot profile (recomp-architecture.md §21.12) is dominated by three
# deterministic leaf functions: libpng's row unfilter (37%), zlib's adler32
# (8.7%) and the engine's texture premultiply (8%). host_fastpath.c
# re-implements them exactly on guest memory. Rather than replace the lifted
# bodies, each is RENAMED to sub_X__lifted and a wrapper sub_X takes its
# place: it runs the host version (default), the lifted one (ISAAC_FASTPATH=0)
# or both with a byte compare of the touched range (ISAAC_FASTPATH_VERIFY=1),
# so the equivalence is measured on the game's own data, not assumed.
# Each entry: va -> wrapper body text; the wrapper owns the callee's ret.
WRAP_PATCHES: dict[int, str] = {
    # png_read_filter_row (SSE2 build): edx = png_row_info*, stack = (row,
    # prev_row, filter); caller cleans (plain ret). Touches rowbytes bytes at
    # row.
    0x00ab2d80: """void sub_00ab2d80(CpuState *restrict s) {
  /* LIFT-PATCH wrap 0x00ab2d80: host PNG unfilter (host_fastpath.c) */
  RECOMP_VA(0xab2d80u);
  uint32_t info = s->EDX, row = MEMR32(s->ESP + 4u), prev = MEMR32(s->ESP + 8u),
           filter = MEMR32(s->ESP + 12u);
  int mode = isaac_fastpath_mode();
  if (mode == 0 || filter > 4u) { sub_00ab2d80__lifted(s); return; }
  if (mode == 2) {
    uint32_t rb = MEMR32(info + 4u);
    uint8_t *snap = (uint8_t *)malloc(rb ? rb : 1u);
    if (snap && rb) memcpy(snap, RECOMP_PTR(row), rb);
    isaac_fast_unfilter(info, row, prev, filter);
    uint8_t *host = (uint8_t *)malloc(rb ? rb : 1u);
    if (host && rb) memcpy(host, RECOMP_PTR(row), rb);
    if (snap && rb) memcpy(RECOMP_PTR(row), snap, rb);
    sub_00ab2d80__lifted(s);
    if (host && rb && !isaac_fast_verify_equal(host, row, rb))
      isaac_fastpath_mismatch("unfilter", filter, rb);
    free(snap); free(host);
    return;
  }
  isaac_fast_unfilter(info, row, prev, filter);
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4u;
}
""",
    # zlib adler32(adler, buf, len): cdecl, result in eax.
    0x00aaddd0: """void sub_00aaddd0(CpuState *restrict s) {
  /* LIFT-PATCH wrap 0x00aaddd0: host adler32 (host_fastpath.c) */
  RECOMP_VA(0xaaddd0u);
  uint32_t adler = MEMR32(s->ESP + 4u), buf = MEMR32(s->ESP + 8u), len = MEMR32(s->ESP + 12u);
  int mode = isaac_fastpath_mode();
  if (mode == 0) { sub_00aaddd0__lifted(s); return; }
  uint32_t r = isaac_fast_adler32(adler, buf, len);
  if (mode == 2) {
    sub_00aaddd0__lifted(s);
    if (s->EAX != r) isaac_fastpath_mismatch("adler32", s->EAX, r);
    return;
  }
  s->EAX = r;
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4u;
}
""",
    # texture premultiply: ecx = pixels, edx = rows, stack = (width); count =
    # rows * width; caller cleans; table chosen by [0x00c798e4] & 8.
    0x00a663c0: """void sub_00a663c0(CpuState *restrict s) {
  /* LIFT-PATCH wrap 0x00a663c0: host premultiply (host_fastpath.c) */
  RECOMP_VA(0xa663c0u);
  uint32_t pixels = s->ECX, count = s->EDX * MEMR32(s->ESP + 4u);
  uint32_t table = (MEMR8(0x00c798e4u) & 8u) ? 0x00c13640u : 0x00c23640u;
  int mode = isaac_fastpath_mode();
  if (mode == 0) { sub_00a663c0__lifted(s); return; }
  if (mode == 2) {
    uint32_t n = count * 4u;
    uint8_t *snap = (uint8_t *)malloc(n ? n : 1u);
    if (snap && n) memcpy(snap, RECOMP_PTR(pixels), n);
    isaac_fast_premultiply(pixels, count, table);
    uint8_t *host = (uint8_t *)malloc(n ? n : 1u);
    if (host && n) memcpy(host, RECOMP_PTR(pixels), n);
    if (snap && n) memcpy(RECOMP_PTR(pixels), snap, n);
    sub_00a663c0__lifted(s);
    if (host && n && !isaac_fast_verify_equal(host, pixels, n))
      isaac_fastpath_mismatch("premultiply", count, table);
    free(snap); free(host);
    return;
  }
  isaac_fast_premultiply(pixels, count, table);
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4u;
}
""",
}


def apply_wrap_patches(lift_dir: Path, check_only: bool = False) -> list[Path]:
    """Install the fastpath wrappers: rename `void sub_X(` to `void sub_X__lifted(`
    (definition only; call sites keep calling sub_X = the wrapper) and append
    the wrapper after the lifted body. Idempotent via the __lifted name."""
    touched: list[Path] = []
    tus = sorted(lift_dir.glob("lifted_*.c"))
    for va, body in WRAP_PATCHES.items():
        name = "sub_%08x" % va
        for tu in tus:
            text = tu.read_text(encoding="utf-8")
            if ("void %s__lifted(CpuState *restrict s) {" % name) in text:
                break                                   # already wrapped
            span = find_function(text, name)
            if span is None:
                continue
            if check_only:
                touched.append(tu)
                break
            start, end = span
            lifted = text[start:end].replace("void %s(CpuState *restrict s) {" % name,
                                             "void %s__lifted(CpuState *restrict s) {" % name, 1)
            decl = "void %s__lifted(CpuState *restrict s);\n" % name
            text = text[:start] + decl + lifted + "\n" + body + text[end:]
            tu.write_text(text, encoding="utf-8")
            obj = tu.with_suffix(".o")
            if obj.exists():
                obj.unlink()
            for fast in tu.parent.glob(tu.stem + ".fast.o"):
                fast.unlink()
            touched.append(tu)
            print("wrap-patch %s: lifted body kept as %s__lifted, host wrapper installed in %s"
                  % (name, name, tu.name))
            break
    return touched


def apply_purge_patches(lift_dir: Path, check_only: bool = False) -> list[Path]:
    """Correct stale baked import purges in the generated C. Returns the TUs
    modified (their objects must be recompiled)."""
    touched: set[Path] = set()
    tus = sorted(lift_dir.glob("lifted_*.c"))
    for name, (wrong, right) in PURGE_PATCHES.items():
        old = "%s(s);\n  s->EIP = MEMR32(s->ESP);\n  s->ESP += 4u + %du;" % (name, wrong)
        new = "%s(s);\n  s->EIP = MEMR32(s->ESP);\n  s->ESP += 4u + %du;" % (name, right)
        total = 0
        for tu in tus:
            text = tu.read_text(encoding="utf-8")
            n = text.count(old)
            if not n:
                continue
            total += n
            if check_only:
                touched.add(tu)
                continue
            tu.write_text(text.replace(old, new), encoding="utf-8")
            obj = tu.with_suffix(".o")
            if obj.exists():
                obj.unlink()
            touched.add(tu)
        if total:
            print("purge-patch %s: %d call site(s) %d->%d%s" % (name, total, wrong, right,
                  " (would fix)" if check_only else " corrected"))
    return sorted(touched)


def find_function(text: str, name: str) -> tuple[int, int] | None:
    """Return (start, end) of `void <name>(CpuState *restrict s) { ... }` at
    column 0, matching the closing brace at column 0 (the lifter's layout)."""
    m = re.search(r"^void %s\(CpuState \*restrict s\) \{\n" % re.escape(name), text, re.M)
    if not m:
        return None
    end = text.find("\n}\n", m.start())
    if end < 0:
        return None
    return m.start(), end + 3


def apply_lift_patches(lift_dir: Path, check_only: bool = False) -> list[Path]:
    """Apply every patch whose function lives in lift_dir. Returns the TUs
    that were modified (their objects must be recompiled)."""
    touched: list[Path] = []
    tus = sorted(lift_dir.glob("lifted_*.c"))
    for va, (reason, body) in PATCHES.items():
        name = "sub_%08x" % va
        if ("RECOMP_VA(0x%xu);" % va) not in body:
            raise SystemExit("lift patch %s lacks its RECOMP_VA marker" % name)
        hit = None
        for tu in tus:
            text = tu.read_text(encoding="utf-8")
            span = find_function(text, name)
            if span:
                hit = (tu, text, span)
                break
        if not hit:
            print("lift-patch %s: function not found in %s (nothing to do)" % (name, lift_dir))
            continue
        tu, text, (a, b) = hit
        current = text[a:b]
        if current.startswith(body.split("\n", 1)[0]) and MARKER in current:
            print("lift-patch %s: already applied in %s" % (name, tu.name))
            continue
        if check_only:
            print("lift-patch %s: NOT applied in %s (%s)" % (name, tu.name, reason))
            touched.append(tu)
            continue
        new_text = text[:a] + body + text[b:]
        tu.write_text(new_text, encoding="utf-8")
        obj = tu.with_suffix(".o")
        if obj.exists():
            obj.unlink()
        touched.append(tu)
        print("lift-patch %s: applied in %s (%s); %s dropped for recompile" % (
            name, tu.name, reason, obj.name))
    return touched


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--dir", type=Path, required=True, help="lift output dir (lifted_*.c)")
    ap.add_argument("--check", action="store_true", help="report only; exit 1 if any patch is missing")
    args = ap.parse_args()
    touched = apply_lift_patches(args.dir, check_only=args.check)
    touched += apply_purge_patches(args.dir, check_only=args.check)
    if args.check:
        return 1 if touched else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
