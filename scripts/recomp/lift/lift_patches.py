"""Source-level overrides applied to the GENERATED lifted C after every lift.

Why this exists: the canonical target `tools/isaac-ng.unpacked.exe` carries
19 runs / 172 bytes of this project's own emulator-era hand patches (diff it
against `tools/isaac-ng.unpacked.exe.pre-coinit`). One of them is fatal for
the recompiled boot: `0x009ab970` -- the KAGE function that mounts the
"resources/" VFS root -- had its prologue `push ebp; mov ebp, esp`
(55 8b ec) overwritten with `xor eax, eax; ret` (33 c0 c3). The lifter
faithfully lifted the stub, and Ghidra kept the orphaned body as
FUN_009ab973, so every relative asset path ("gfx/ui/ui_streak.anm2") missed
(boot round 10, recomp-architecture.md §19).

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
    0x009ab970: (
        "restore `push ebp; mov ebp, esp` (pristine 55 8b ec; project patch 33 c0 c3 = "
        "xor eax,eax; ret) so the resources/ mount root is created and scanned",
        """void sub_009ab970(CpuState *restrict s) {
  /* LIFT-PATCH 0x009ab970: the canonical exe carries an emulator-era hand patch
     that turned this function's prologue into `xor eax, eax; ret`; the pristine
     bytes (tools/isaac-ng.unpacked.exe.pre-coinit) are `push ebp; mov ebp, esp`
     and the rest of the body is lifted as sub_009ab973 (Ghidra's orphaned
     FUN_009ab973). Emulate the two lost instructions and fall into the body,
     which ends with the function's own `mov esp, ebp; pop ebp; ret`. */
  RECOMP_VA(0x9ab970u);
  {
    uint32_t ESP = s->ESP;
    ESP = (uint32_t)(ESP - ((uint32_t)0x4u));
    MEMW32(ESP, s->EBP);
    s->ESP = ESP;
    s->EBP = ESP;
  }
  sub_009ab973(s);
}
""",
    ),
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
    "imp_msvcp140____0__basic_iostream_DU__char_traits_D_std___std__QAE_PAV__basic_streambuf_DU__char_traits_D_std___1__Z": (8, 4),
    "imp_msvcp140____0__basic_ostream_DU__char_traits_D_std___std__QAE_PAV__basic_streambuf_DU__char_traits_D_std___1__N_Z": (12, 8),
    "imp_msvcp140____0_Lockit_std__QAE_H_Z": (36, 4),
    "imp_msvcp140___widen___basic_ios_DU__char_traits_D_std___std__QBEDD_Z": (12, 4),
}


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
