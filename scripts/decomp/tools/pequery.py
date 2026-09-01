#!/usr/bin/env python3
"""Query the persistent PE index. THE census tool — use this instead of
writing a new decoder/census script.

Build once per binary hash: python scripts/decomp/tools/build-pe-index.py
DB: output/decomp/<hash12>/index/pe-index.sqlite

Commands (all addresses hex, 0x prefix optional):

  writers ADDR [END]      every instruction that WRITES [ADDR] (or the range
                          ADDR..END inclusive-exclusive). Includes scaled-index
                          forms (kind *_idx). This is a whole-.text census.
  readers ADDR [END]      every instruction that READS [ADDR] / the range.
  xrefs-to ADDR [END]     ALL xref kinds to the address/range: mem_r/mem_w/
                          mem_rw(+_idx), call, call_mem, call_slot, jmp, jcc,
                          jtab, addr (address escapes: imm/lea loads — the
                          evidence trail for register-held access).
  xrefs-from VA           xrefs emitted by the instruction at VA.
  callers VA              direct rel32 calls + call_slot resolutions + addr
                          escapes (candidate register-held/pushed uses) + jtab
                          entries targeting VA.
  callees VA              call/call_mem/call_slot xrefs emitted from inside the
                          function containing VA (with import names).
  func VA                 bounds/size of the function containing VA.
  disasm VA [N|END]       N instructions (default 24) or VA..END from the index.
  body VA                 full annotated disasm of the containing function:
                          call targets named (imports, call_slot), absolute mem
                          refs annotated with section + string preview.
  bytes VA N              hex dump (zero-at-load bytes flagged, never silent).
  u32 VA / cstr VA        typed reads with zero-at-load awareness.
  imports [SUBSTR]        IAT slots (call-site counts included).
  strings SUBSTR          search recovered .rdata/.data strings.
  strings-at VA           string containing VA, if any.
  sig HEXPATTERN          find byte pattern in .text; ?? = wildcard byte.
                          e.g. sig "55 8b ec 6a ff ?? 64 a1"
  addr ADDR               everything about one address: section, file offset,
                          zero-at-load status, containing func, insn, xref
                          summary, import/string hit.
  funcs-in VA END         function starts within a VA band.
  meta                    decode config + build stats.
  verify                  acceptance ground truths (measured in AGENTS.md).
  batch "Q ;; Q ;; ..."   run several queries in ONE process/tool call —
                          the token-lean form for an evidence pass, e.g.
                          batch "func 0x9a2690 ;; callers 0x9a1a30 ;; writers 0xc7163c"
                          Each result is prefixed with `== <query>`.

Notes:
 - mem_* xrefs cover ABSOLUTE displacements only. [reg+disp] with a small disp
   (object fields) is invisible here by nature; census object-field writers via
   `sig` on the displacement bytes or `body` on candidate functions.
 - jtab masking removes dword switch tables from the decode; byte-index tables
   may still shadow a few instructions near switch heads — confirm surprising
   results with `disasm` around the site.
"""
from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe import PEImage, ZeroAtLoad, index_db_path

_pe: PEImage | None = None
_db: sqlite3.Connection | None = None


def pe() -> PEImage:
    global _pe
    if _pe is None:
        _pe = PEImage()
    return _pe


def db() -> sqlite3.Connection:
    global _db
    if _db is None:
        path = index_db_path(pe())
        if not path.exists():
            sys.exit(
                f"index missing: {path}\nbuild it: python scripts/decomp/tools/build-pe-index.py"
            )
        _db = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    return _db


def h(s: str) -> int:
    return int(s, 16)


def insn_at(va: int):
    return db().execute("SELECT va,size,mn,ops FROM insn WHERE va=?", (va,)).fetchone()


def func_of(va: int):
    return db().execute(
        "SELECT start,end,ninsn FROM func WHERE start<=? AND end>? ", (va, va)
    ).fetchone()


def fmt_insn(row, annot: str = "") -> str:
    va, size, mn, ops = row
    return f"0x{va:08x}  {mn} {ops}".rstrip() + (f"    ; {annot}" if annot else "")


def imp_name(vaddr: int) -> str | None:
    r = db().execute("SELECT name FROM imp WHERE va=?", (vaddr,)).fetchone()
    return r[0] if r else None


def str_preview(vaddr: int) -> str | None:
    r = db().execute("SELECT s FROM str WHERE va=?", (vaddr,)).fetchone()
    if r:
        s = r[0]
        return f'"{s[:48]}"' + ("..." if len(s) > 48 else "")
    return None


def annotate_target(dst: int) -> str:
    parts = []
    name = imp_name(dst)
    if name:
        parts.append(name)
    sp = str_preview(dst)
    if sp:
        parts.append(sp)
    sec = pe().section_of(dst)
    if sec and not parts:
        parts.append(sec.name)
    return " ".join(parts)


def emit_xrefs(rows, show_insn=True):
    for src, dst, kind in rows:
        annot = f"{kind} -> 0x{dst:08x}"
        row = insn_at(src) if show_insn else None
        f = func_of(src)
        floc = f" (in func 0x{f[0]:08x})" if f else ""
        if row:
            print(f"  {fmt_insn(row)}    ; {kind}{floc}")
        else:
            print(f"  0x{src:08x}  {annot}{floc}")


def cmd_writers(args, kinds=("mem_w", "mem_rw", "mem_w_idx", "mem_rw_idx")):
    lo = h(args[0])
    hi = h(args[1]) if len(args) > 1 else lo + 1
    q = ",".join("?" * len(kinds))
    rows = db().execute(
        f"SELECT src,dst,kind FROM xref WHERE dst>=? AND dst<? AND kind IN ({q}) ORDER BY src",
        (lo, hi, *kinds),
    ).fetchall()
    print(f"{len(rows)} writer site(s) for [0x{lo:08x}..0x{hi:08x})")
    emit_xrefs(rows)


def cmd_readers(args):
    cmd_writers(args, kinds=("mem_r", "mem_rw", "mem_r_idx", "mem_rw_idx"))


def cmd_xrefs_to(args):
    lo = h(args[0])
    hi = h(args[1]) if len(args) > 1 else lo + 1
    rows = db().execute(
        "SELECT src,dst,kind FROM xref WHERE dst>=? AND dst<? ORDER BY kind,src",
        (lo, hi),
    ).fetchall()
    print(f"{len(rows)} xref(s) to [0x{lo:08x}..0x{hi:08x})")
    emit_xrefs(rows)


def cmd_xrefs_from(args):
    va = h(args[0])
    rows = db().execute(
        "SELECT src,dst,kind FROM xref WHERE src=? ORDER BY kind", (va,)
    ).fetchall()
    for src, dst, kind in rows:
        print(f"  {kind:9s} -> 0x{dst:08x}  {annotate_target(dst)}")


def cmd_callers(args):
    va = h(args[0])
    direct = db().execute(
        "SELECT src FROM xref WHERE dst=? AND kind='call' ORDER BY src", (va,)
    ).fetchall()
    slot = db().execute(
        "SELECT src FROM xref WHERE dst=? AND kind='call_slot' ORDER BY src", (va,)
    ).fetchall()
    esc = db().execute(
        "SELECT src,kind FROM xref WHERE dst=? AND kind IN ('addr','jtab','jmp','jcc') ORDER BY src",
        (va,),
    ).fetchall()
    print(f"direct rel32 callers: {len(direct)}")
    for (s,) in direct:
        f = func_of(s)
        print(f"  0x{s:08x}" + (f"  (in 0x{f[0]:08x})" if f else ""))
    if slot:
        print(f"call-through-slot sites: {len(slot)}")
        for (s,) in slot:
            print(f"  0x{s:08x}")
    if esc:
        print(f"address escapes / branch refs (candidate indirect uses): {len(esc)}")
        for s, k in esc:
            row = insn_at(s)
            print(f"  {fmt_insn(row) if row else f'0x{s:08x}'}    ; {k}")


def cmd_callees(args):
    va = h(args[0])
    f = func_of(va)
    if not f:
        sys.exit(f"no function contains 0x{va:08x}")
    rows = db().execute(
        "SELECT src,dst,kind FROM xref WHERE src>=? AND src<? AND kind IN ('call','call_mem','call_slot','call_reg') ORDER BY src",
        (f[0], f[1]),
    ).fetchall()
    print(f"func 0x{f[0]:08x}..0x{f[1]:08x}: {len(rows)} call site(s)")
    for src, dst, kind in rows:
        tgt = "<register>" if kind == "call_reg" else f"0x{dst:08x} {annotate_target(dst)}"
        print(f"  0x{src:08x}  {kind:9s} {tgt}".rstrip())


def cmd_func(args):
    va = h(args[0])
    f = func_of(va)
    if not f:
        sys.exit(f"no function contains 0x{va:08x}")
    print(f"start 0x{f[0]:08x}  end 0x{f[1]:08x}  bytes 0x{f[1]-f[0]:x}  insns {f[2]}")


def cmd_disasm(args):
    va = h(args[0])
    rows = None
    if len(args) > 1:
        second = h(args[1])
        if second > va:  # END form
            rows = db().execute(
                "SELECT va,size,mn,ops FROM insn WHERE va>=? AND va<? ORDER BY va",
                (va, second),
            ).fetchall()
    if rows is None:
        n = int(args[1]) if len(args) > 1 else 24
        rows = db().execute(
            "SELECT va,size,mn,ops FROM insn WHERE va>=? ORDER BY va LIMIT ?", (va, n)
        ).fetchall()
    for r in rows:
        print(fmt_insn(r))


def cmd_body(args):
    va = h(args[0])
    f = func_of(va)
    if not f:
        sys.exit(f"no function contains 0x{va:08x}")
    rows = db().execute(
        "SELECT va,size,mn,ops FROM insn WHERE va>=? AND va<? ORDER BY va", (f[0], f[1])
    ).fetchall()
    xr = {}
    for src, dst, kind in db().execute(
        "SELECT src,dst,kind FROM xref WHERE src>=? AND src<?", (f[0], f[1])
    ):
        xr.setdefault(src, []).append((dst, kind))
    print(f"; func 0x{f[0]:08x}..0x{f[1]:08x} ({f[2]} insns)")
    for r in rows:
        annots = []
        for dst, kind in xr.get(r[0], []):
            if kind in ("jmp", "jcc"):
                continue  # target visible in op_str
            a = annotate_target(dst)
            annots.append(f"{kind}:0x{dst:08x}" + (f" {a}" if a else ""))
        print(fmt_insn(r, " | ".join(annots)))


def cmd_bytes(args):
    va, n = h(args[0]), int(args[1], 0) if len(args) > 1 else 64
    data, synth = pe().read_va(va, n)
    for i in range(0, len(data), 16):
        chunk = data[i : i + 16]
        hexs = " ".join(f"{b:02x}" for b in chunk)
        print(f"0x{va+i:08x}  {hexs}")
    if synth:
        print(f"! last {synth} byte(s) are ZERO-AT-LOAD (past raw section end), not file content")


def cmd_u32(args):
    va = h(args[0])
    try:
        off = pe().va_to_off(va)
        print(f"0x{pe().u32(va):08x}  (file offset 0x{off:x})")
    except ZeroAtLoad as e:
        print(f"0x00000000  ! {e}")


def cmd_cstr(args):
    va = h(args[0])
    print(pe().cstr(va).decode("ascii", "replace"))


def cmd_imports(args):
    sub = args[0].lower() if args else ""
    counts = dict(
        db().execute(
            "SELECT dst, COUNT(*) FROM xref WHERE kind='call_mem' GROUP BY dst"
        ).fetchall()
    )
    for va, name in db().execute("SELECT va,name FROM imp ORDER BY name"):
        if sub in name.lower():
            print(f"0x{va:08x}  {name}  ({counts.get(va, 0)} call sites)")


def cmd_strings(args):
    sub = args[0]
    for va, s in db().execute(
        "SELECT va,s FROM str WHERE s LIKE ? ORDER BY va", (f"%{sub}%",)
    ):
        print(f'0x{va:08x}  "{s}"')


def cmd_strings_at(args):
    va = h(args[0])
    r = db().execute(
        "SELECT va,s FROM str WHERE va<=? ORDER BY va DESC LIMIT 1", (va,)
    ).fetchone()
    if r and r[0] + len(r[1]) >= va:
        print(f'0x{r[0]:08x}  "{r[1]}"  (+0x{va-r[0]:x})')
    else:
        print("no string covers this VA")


def cmd_sig(args):
    pat = "".join(args).replace(" ", "").lower()
    if len(pat) % 2:
        sys.exit("odd-length pattern")
    toks = [pat[i : i + 2] for i in range(0, len(pat), 2)]
    needle = bytes(int(t, 16) if t != "??" else 0 for t in toks)
    mask = bytes(0xFF if t != "??" else 0 for t in toks)
    text = pe().text
    raw = pe().buf[text.raw_ptr : text.raw_ptr + text.raw_size]
    hits = []
    first = needle[0] if mask[0] == 0xFF else None
    i = 0
    n = len(raw) - len(needle)
    while i <= n:
        if first is not None:
            i = raw.find(first, i, n + 1)
            if i < 0:
                break
        if all(raw[i + k] & mask[k] == needle[k] for k in range(len(needle))):
            hits.append(text.va + i)
            if len(hits) >= 200:
                print("(stopping at 200 hits)")
                break
        i += 1
    for vaddr in hits:
        f = func_of(vaddr)
        print(f"0x{vaddr:08x}" + (f"  (in func 0x{f[0]:08x})" if f else ""))
    print(f"{len(hits)} hit(s)")


def cmd_addr(args):
    va = h(args[0])
    p = pe()
    sec = p.section_of(va)
    if sec is None:
        print(f"0x{va:08x}: not in any section")
        return
    print(f"0x{va:08x}: section {sec.name} (va 0x{sec.va:08x}+0x{va-sec.va:x})")
    try:
        off = p.va_to_off(va)
        print(f"  file offset 0x{off:x}")
    except ZeroAtLoad:
        print("  ZERO-AT-LOAD: past raw section end, value is 0 unless some code writes it")
    f = func_of(va)
    if f:
        print(f"  containing func 0x{f[0]:08x}..0x{f[1]:08x} ({f[2]} insns)")
    row = insn_at(va)
    if row:
        print(f"  insn: {fmt_insn(row)}")
    name = imp_name(va)
    if name:
        print(f"  import slot: {name}")
    sp = str_preview(va)
    if sp:
        print(f"  string: {sp}")
    kinds = db().execute(
        "SELECT kind, COUNT(*) FROM xref WHERE dst=? GROUP BY kind", (va,)
    ).fetchall()
    if kinds:
        print("  xrefs to: " + ", ".join(f"{k}={c}" for k, c in kinds))
    else:
        print("  xrefs to: none (check a range: xrefs-to ADDR END)")


def cmd_funcs_in(args):
    lo, hi = h(args[0]), h(args[1])
    for s, e, n in db().execute(
        "SELECT start,end,ninsn FROM func WHERE start>=? AND start<? ORDER BY start",
        (lo, hi),
    ):
        print(f"0x{s:08x}..0x{e:08x}  insns {n}")


def cmd_meta(args):
    for k, v in db().execute("SELECT key,value FROM meta ORDER BY key"):
        print(f"{k}: {v}")


def cmd_verify(args):
    """Ground truths measured independently in this repo (AGENTS.md)."""
    checks = [
        # (description, sql-ish check function, expected)
        ("0x00c7169c writers (expect 2: 0x009aaab0-ish, 0x009ab8cc-ish sites)",
         lambda: [f"0x{s:08x}" for (s,) in db().execute(
             "SELECT src FROM xref WHERE dst=0xc7169c AND kind IN ('mem_w','mem_rw','mem_w_idx','mem_rw_idx') ORDER BY src")]),
        ("0x00c7169c readers count (measured 4421)",
         lambda: db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0xc7169c AND kind IN ('mem_r','mem_rw','mem_r_idx','mem_rw_idx')").fetchone()[0]),
        ("0x00c79100 writers (measured 0)",
         lambda: db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0xc79100 AND kind IN ('mem_w','mem_rw','mem_w_idx','mem_rw_idx')").fetchone()[0]),
        ("0x00c79110/14 writers (measured: written, sites 0x004012ce & 0x0095426a)",
         lambda: [f"0x{s:08x}" for (s,) in db().execute(
             "SELECT src FROM xref WHERE dst IN (0xc79110,0xc79114) AND kind LIKE 'mem_w%' OR dst IN (0xc79110,0xc79114) AND kind LIKE 'mem_rw%' ORDER BY src")]),
        ("0x00c7b640 writers (measured 0 — zero-at-load constant +0.0f)",
         lambda: db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0xc7b640 AND (kind LIKE 'mem_w%' OR kind LIKE 'mem_rw%')").fetchone()[0]),
        ("0x0040c7f0 direct rel32 callers (measured 73)",
         lambda: db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0x40c7f0 AND kind='call'").fetchone()[0]),
        ("0x008068f0 Room::TriggerClear: [direct callers (byte-scan-confirmed 1), body insns (measured 225)]",
         lambda: [db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0x8068f0 AND kind='call'").fetchone()[0],
             db().execute(
             "SELECT ninsn FROM func WHERE start=0x8068f0").fetchone()[0]]),
        ("0x0074d4a0 direct callers (measured 1) + zero other image refs",
         lambda: [db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0x74d4a0 AND kind='call'").fetchone()[0],
             db().execute(
             "SELECT COUNT(*) FROM xref WHERE dst=0x74d4a0 AND kind!='call'").fetchone()[0]]),
        ("insn total (~2.09M; exact value depends on decode config)",
         lambda: db().execute("SELECT value FROM meta WHERE key='insn_total'").fetchone()[0]),
    ]
    for desc, fn in checks:
        try:
            print(f"- {desc}\n    -> {fn()}")
        except Exception as e:  # noqa: BLE001
            print(f"- {desc}\n    -> ERROR {e}")


def cmd_batch(args):
    script = " ".join(args)
    for query in script.split(";;"):
        parts = query.split()
        if not parts:
            continue
        fn = COMMANDS.get(parts[0])
        print(f"== {query.strip()}")
        if fn is None or fn is cmd_batch:
            print(f"  unknown command {parts[0]!r}")
            continue
        try:
            fn(parts[1:])
        except SystemExit as e:  # sub-command sys.exit must not kill the batch
            print(f"  error: {e}")
        except Exception as e:  # noqa: BLE001
            print(f"  error: {e}")


COMMANDS = {
    "batch": cmd_batch,
    "writers": cmd_writers,
    "readers": cmd_readers,
    "xrefs-to": cmd_xrefs_to,
    "xrefs-from": cmd_xrefs_from,
    "callers": cmd_callers,
    "callees": cmd_callees,
    "func": cmd_func,
    "disasm": cmd_disasm,
    "body": cmd_body,
    "bytes": cmd_bytes,
    "u32": cmd_u32,
    "cstr": cmd_cstr,
    "imports": cmd_imports,
    "strings": cmd_strings,
    "strings-at": cmd_strings_at,
    "sig": cmd_sig,
    "addr": cmd_addr,
    "funcs-in": cmd_funcs_in,
    "meta": cmd_meta,
    "verify": cmd_verify,
}


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help", "help"):
        print(__doc__)
        return 0
    cmd = sys.argv[1]
    fn = COMMANDS.get(cmd)
    if fn is None:
        sys.exit(f"unknown command {cmd!r}; run with --help")
    fn(sys.argv[2:])
    return 0


if __name__ == "__main__":
    sys.exit(main())
