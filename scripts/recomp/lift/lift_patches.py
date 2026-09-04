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
    # Round 10 restored 0x009ab970's pristine prologue here so a "resources/"
    # mount root was created. Round 11 REVERTED that: the instance is a
    # ResourceExtractor dump with the archives' contents at the install
    # ROOT, and KAGE's resolver (0x00a16c60) tries the archive index before a
    # root's loose map, so a "resources/" root made the stale small archives
    # (config.a = Afterbirth+ players.xml) shadow the extracted Repentance+
    # files. With only the "" root, relative keys miss the archive index
    # (keyed "resources/...") and resolve through the root scan.
    #
    # Round 24e brings it BACK, because that same miss is why the port was
    # silent: the sound effects and the music exist only inside the archives
    # (the dump has no sfx/ or music/ tree), and the archive index is keyed
    # "resources/<path>" -- with no "resources/" root nothing ever hits it.
    # The shadowing that round 11 saw is gone with it: the instance now
    # mounts the whole archive set (afterbirth.a, afterbirthp.a,
    # repentance.a; boot_integration.mjs LAZY_ARCHIVES), and the mount loop
    # (0x00a179c0) overwrites an equal-hash entry, so the last-mounted
    # archive -- repentance.a -- wins, exactly as it does in the real game.
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

# --- block-level overrides ---------------------------------------------
# A PATCHES entry replaces a whole lifted function. Some of the project's
# hand patches (recomp-architecture.md §19.5) sit in the MIDDLE of a function
# whose body is far too big to re-express by hand; these rewrite one block.
# Each entry: (marker, old text, new text). `marker` names the entry for the
# log and the idempotence check (the new text must contain "LIFT-PATCH
# <marker>"); the old text is matched with either line ending.
#
# Round 24e: 0x00a2b5c2, the "branch forced" patch in the sound manager's
# create-source function (0x00a2b1e0, mixer vtable slot +0x24). Pristine bytes
# 80 7d 14 00 74 19 = `cmp byte [ebp+0x14], 0; je 0xa2b5e1`; the patch wrote
# e9 17 01 00 00 = `jmp 0xa2b6de` over the first five and left the je's rel8
# (0x19) as an orphan byte. The skipped code is the open of every sound
# source right after its construction (vt+0x20 preload probe, then
# vt+0x1c Open(path), "Failed to open %s \"%s\"" on failure) -- the reason
# the WAV loader and the ogg opener were never called in rounds 16-24.
# Ghidra saw the orphaned tail as its own function starting at the orphan
# byte (FUN_00a2b5c7: `sbb` swallowing `mov ecx, [ebp+0x10]; test ecx, ecx`),
# so the fix is three edits: the branch becomes a tail jump into that
# function, its first block is re-decoded from 0xa2b5c8, and both targets
# get a case in its re-entry switch.
BLOCK_PATCHES: list[tuple[str, str, str]] = [
    ("0x00a2b5c2",
     """  RECOMP_VA(0xa2b5c2u);
L_00a2b5c2: ;
  goto L_00a2b6de;
""",
     """  RECOMP_VA(0xa2b5c2u);
L_00a2b5c2: ;
  /* LIFT-PATCH 0x00a2b5c2: pristine `cmp byte [ebp+0x14], 0; je 0xa2b5e1`
     (80 7d 14 00 74 19). The project's emulator-era patch forced `jmp 0xa2b6de`
     here, skipping the open of every sound source after its construction.
     Both successors live in sub_00a2b5c7 (Ghidra split the tail off as its own
     function), so this is a tail jump through that function's re-entry switch. */
  u24d00_4 = (uint32_t)MEMR8((uint32_t)(EBP + ((uint32_t)0x14u)));
  ZF = (uint8_t)(u24d00_4 == ((uint32_t)0x0u));
  CF = ((uint8_t)0x0u);
  OF = ((uint8_t)0x0u);
  SF = ((uint8_t)0x0u);
  PF = (uint8_t)(ZF ? 0x1u : 0x0u);
  s->EBP = EBP;
  s->ESP = ESP;
  s->FS_OFFSET = FS_OFFSET;
  s->EAX = EAX;
  s->EBX = EBX;
  s->ESI = ESI;
  s->EDI = EDI;
  s->ECX = ECX;
  s->CF = CF;
  s->OF = OF;
  s->SF = SF;
  s->ZF = ZF;
  s->PF = PF;
  recomp_jmp_target = ZF ? 0xa2b5e1u : 0xa2b5c8u; recomp_jmp_pending = 1u; return;
"""),
    ("0x00a2b5c8",
     """  RECOMP_VA(0xa2b5c7u);
  u3400_4 = (uint32_t)(EBX + ((uint32_t)0xc985104du));
  u24700_4 = (uint32_t)CF;
  u5280_4 = MEMR32(u3400_4);
  CF = (uint8_t)(u5280_4 < ECX);
  u5280_4 = MEMR32(u3400_4);
  OF = (uint8_t)recomp_sborrow32(u5280_4, ECX);
  u5280_4 = MEMR32(u3400_4);
  u24900_4 = (uint32_t)(u5280_4 - ECX);
  u24980_1 = (uint8_t)(u24900_4 < u24700_4);
  CF = (uint8_t)((CF) | (u24980_1));
  u24a80_1 = (uint8_t)recomp_sborrow32(u24900_4, u24700_4);
  OF = (uint8_t)((OF) ^ (u24a80_1));
  u5280_4 = (uint32_t)(u24900_4 - u24700_4);
  MEMW32(u3400_4, u5280_4);
  u5280_4 = MEMR32(u3400_4);
  SF = (uint8_t)(((int32_t)u5280_4) < ((int32_t)((uint32_t)0x0u)));
  u5280_4 = MEMR32(u3400_4);
  ZF = (uint8_t)(u5280_4 == ((uint32_t)0x0u));
  u5280_4 = MEMR32(u3400_4);
  u24d00_4 = (uint32_t)(u5280_4 & ((uint32_t)0xffu));
  u24d80_1 = (uint8_t)recomp_popcount32(u24d00_4);
  u24e00_1 = (uint8_t)(u24d80_1 & ((uint8_t)0x1u));
  PF = (uint8_t)(u24e00_1 == ((uint8_t)0x0u));
  RECOMP_VA(0xa2b5cdu);
""",
     """  RECOMP_VA(0xa2b5c7u);
  /* LIFT-PATCH 0x00a2b5c8: Ghidra started this orphaned tail one byte early
     (0x19 is the rel8 of the pristine `je` at 0xa2b5c6) and decoded an `sbb`
     that swallowed `mov ecx, [ebp+0x10]; test ecx, ecx`. Re-decoded from
     0xa2b5c8, which sub_00a2b1e0's restored branch enters. */
L_00a2b5c8: ;
  RECOMP_VA(0xa2b5c8u);
  u3300_4 = (uint32_t)(EBP + ((uint32_t)0x10u));
  ECX = MEMR32(u3300_4);
  RECOMP_VA(0xa2b5cbu);
  CF = ((uint8_t)0x0u);
  OF = ((uint8_t)0x0u);
  u57480_4 = (uint32_t)(ECX & ECX);
  SF = (uint8_t)(((int32_t)u57480_4) < ((int32_t)((uint32_t)0x0u)));
  ZF = (uint8_t)(u57480_4 == ((uint32_t)0x0u));
  u24d00_4 = (uint32_t)(u57480_4 & ((uint32_t)0xffu));
  u24d80_1 = (uint8_t)recomp_popcount32(u24d00_4);
  u24e00_1 = (uint8_t)(u24d80_1 & ((uint8_t)0x1u));
  PF = (uint8_t)(u24e00_1 == ((uint8_t)0x0u));
  RECOMP_VA(0xa2b5cdu);
"""),
    ("0x00a2b5c7-reentry",
     """    switch (_rva) {
    case 0x00a2b5ddu: goto L_00a2b5dd;
""",
     """    switch (_rva) {
    case 0x00a2b5c8u: goto L_00a2b5c8;   /* LIFT-PATCH 0x00a2b5c7-reentry */
    case 0x00a2b5e1u: goto L_00a2b5e1;
    case 0x00a2b5ddu: goto L_00a2b5dd;
"""),
    # The dispatcher's index holds function entries and CALL continuations
    # only (mkdispatch.py, call_cont.txt); a block another function jumps
    # INTO must be declared, or the tail jump above dies as "resolves to
    # neither a host shim nor a lifted function" (round 24e, first run).
    # mkdispatch.py treats a RECOMP_VA line carrying this marker as a
    # re-entry block. These two apply on top of the block above, so a fresh
    # lift and an already-patched tree end up identical.
    ("REENTRY 0x00a2b5c8",
     """  RECOMP_VA(0xa2b5c8u);
""",
     """  RECOMP_VA(0xa2b5c8u); /* LIFT-PATCH REENTRY 0x00a2b5c8 */
"""),
    ("REENTRY 0x00a2b5e1",
     """  RECOMP_VA(0xa2b5e1u);
""",
     """  RECOMP_VA(0xa2b5e1u); /* LIFT-PATCH REENTRY 0x00a2b5e1 */
"""),
]


def apply_block_patches(lift_dir: Path, check_only: bool = False) -> list[Path]:
    """Apply BLOCK_PATCHES (idempotent: the marker in the new text). Returns the
    TUs modified. A missing old text with no marker present is fatal -- a
    re-lift that changed the block must be re-read, not silently skipped."""
    touched: list[Path] = []
    tus = sorted(lift_dir.glob("lifted_*.c"))
    for marker, old, new in BLOCK_PATCHES:
        tag = "LIFT-PATCH %s" % marker
        if tag not in new:
            raise SystemExit("block patch %s: new text lacks its marker" % marker)
        hit = None
        for tu in tus:
            text = tu.read_text(encoding="utf-8")
            if tag in text:
                hit = (tu, None)
                break
            crlf = "\r\n" in text
            old_t = old.replace("\n", "\r\n") if crlf else old
            if old_t in text:
                hit = (tu, (text, old_t, new.replace("\n", "\r\n") if crlf else new))
                break
        if hit is None:
            raise SystemExit("block patch %s: old text not found in any TU of %s" % (marker, lift_dir))
        tu, todo = hit
        if todo is None:
            print("block-patch %s: already applied in %s" % (marker, tu.name))
            continue
        text, old_t, new_t = todo
        if text.count(old_t) != 1:
            raise SystemExit("block patch %s: old text occurs %d times in %s" % (marker, text.count(old_t), tu.name))
        if check_only:
            touched.append(tu)
            continue
        tu.write_text(text.replace(old_t, new_t, 1), encoding="utf-8", newline="")
        print("block-patch %s: applied in %s" % (marker, tu.name))
        touched.append(tu)
    return touched
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
    # the engine's path hash: thiscall, string in ecx, hash in eax. The hot
    # leaf of resource lookup (round 18).
    0x00a159d0: """void sub_00a159d0(CpuState *restrict s) {
  /* LIFT-PATCH wrap 0x00a159d0: host path hash (host_fastpath.c) */
  RECOMP_VA(0xa159d0u);
  uint32_t str = s->ECX;
  int mode = isaac_fastpath_mode();
  if (mode == 0) { sub_00a159d0__lifted(s); return; }
  uint32_t r = isaac_fast_pathhash(str);
  if (mode == 2) {
    sub_00a159d0__lifted(s);
    if (s->EAX != r) isaac_fastpath_mismatch("pathhash", s->EAX, r);
    return;
  }
  s->EAX = r;
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4u;
}
""",
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


# Observe-only wrappers. Contract, pinned by tests/recomp-fastpath.test.js:
# each calls its lifted body exactly once and touches neither EIP nor ESP, so
# the guest cannot tell a probed function from an unprobed one. Logging is off
# unless ISAAC_PROBE=1.
#
# These two answer the standing audio question. The dispatch watch says the WAV
# loader is never dispatched, but its callers reach it directly, so "never
# dispatched" and "never called" are not the same claim -- and the same is true
# of the sounds.xml catalogue reader above it.
PROBE_PATCHES: dict[int, str] = {
    # SFX catalogue: reads sounds.xml and builds the sound records
    0x00952df0: """void sub_00952df0(CpuState *restrict s) {
  RECOMP_VA(0x952df0u);
  if (isaac_probe_on()) isaac_probe_hit(0x952df0u, s->ECX, s->EDX, MEMR32(s->ESP + 4u));
  sub_00952df0__lifted(s);
}
""",
    # the sound class's slot +0x1c: load a WAV by path and attach the sample
    0x00a7b6a0: """void sub_00a7b6a0(CpuState *restrict s) {
  RECOMP_VA(0xa7b6a0u);
  if (isaac_probe_on()) isaac_probe_hit(0xa7b6a0u, s->ECX, MEMR32(s->ESP + 4u), 0u);
  sub_00a7b6a0__lifted(s);
}
""",
    # Round 24d: the ogg stream's slot +0x0c, Queue(path, flag) -- the one
    # call the sound path makes after creating a stream. It resolves the path,
    # opens it in the archive (disk fallback), probes it with stb_vorbis and
    # pushes the decoder on the stream's ring; the watch says the probe is
    # never reached, so one of the two lookups hands back nothing.
    0x00a7c760: """void sub_00a7c760(CpuState *restrict s) {
  RECOMP_VA(0xa7c760u);
  if (isaac_probe_on()) {
    isaac_probe_hit(0xa7c760u, s->ECX, MEMR32(s->ESP + 4u), MEMR32(s->ESP + 8u));
    isaac_probe_str(0xa7c760u, "queue path", MEMR32(s->ESP + 4u));
  }
  sub_00a7c760__lifted(s);
  if (isaac_probe_on()) isaac_probe_hit(0xa7c761u, s->EAX & 0xffu, 0u, 0u);   /* its bool result */
}
""",
    # the path resolver the stream asks first (this = the global at 0xc379e0)
    0x00a17180: """void sub_00a17180(CpuState *restrict s) {
  RECOMP_VA(0xa17180u);
  int on = isaac_probe_on();
  if (on) isaac_probe_str(0xa17180u, "resolve in", MEMR32(s->ESP + 4u));
  sub_00a17180__lifted(s);
  if (on) isaac_probe_str(0xa17181u, "resolve out", s->EAX);
}
""",
    # the archive open (this = the global at 0xc37a10): out-pointer gets the stream
    0x00a17f40: """void sub_00a17f40(CpuState *restrict s) {
  RECOMP_VA(0xa17f40u);
  int on = isaac_probe_on();
  uint32_t out = MEMR32(s->ESP + 8u);
  if (on) isaac_probe_str(0xa17f40u, "archive open", MEMR32(s->ESP + 4u));
  sub_00a17f40__lifted(s);
  if (on) isaac_probe_hit(0xa17f41u, s->EAX, out, out ? MEMR32(out) : 0xffffffffu);
}
""",
}


def apply_wrap_patches(lift_dir: Path, check_only: bool = False) -> list[Path]:
    """Install the fastpath wrappers: rename `void sub_X(` to `void sub_X__lifted(`
    (definition only; call sites keep calling sub_X = the wrapper) and append
    the wrapper after the lifted body. Idempotent via the __lifted name."""
    touched: list[Path] = []
    tus = sorted(lift_dir.glob("lifted_*.c"))
    for va, body in list(WRAP_PATCHES.items()) + list(PROBE_PATCHES.items()):
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
