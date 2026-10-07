"""MSVC x86 jump-table recovery + computed-jump classification.

A computed jump is only a *computed goto* problem when its targets are
basic blocks inside the owning function.  A `jmp [__imp_x]` or `jmp eax`
that lands on a function entry is an indirect tail call and needs nothing
more than the ordinary call_indirect path.  This module separates the two
and recovers the MSVC switch tables so the dangerous class shrinks.

Recognised MSVC x86 forms
-------------------------
  A  jmp dword ptr [reg*4 + TBL]                 one-level table
  B  movzx r2, byte ptr [r1 + IDX]               two-level (byte index)
     jmp dword ptr [r2*4 + TBL]
  C  jmp dword ptr [IMM]                         IAT / global slot -> tail call
  D  jmp reg                                     dynamic tail call / vtable

The prebuilt, hash-matched PE index supplies complete tables and bounded
function ownership independently of Ghidra's recovered fragments. Tables
outside that index (for example in .rdata) use the dominating range guard
or a walk bounded by the owning function.
"""

import bisect
from contextlib import closing
from pathlib import Path
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from scripts.decomp.tools.pe import index_db_path
from codeptrs import code_pointers
import capstone

MAX_TABLE = 4096


class FunctionOwnership:
    """A bounded indexed owner, with real entry points kept as tail exits."""

    def __init__(self, index, start, end, entry):
        self.index = index
        self.start = entry
        self.extent = (start, end)

    def is_local(self, target):
        lo, hi = self.extent
        return (lo <= target < hi
                and (target == self.start or target not in self.index.entries)
                and not self.index.is_data(target))

    def is_static_exit(self, target):
        return ((target in self.index.entries or target in self.index.instructions)
                and not self.is_local(target)
                and not self.index.is_data(target))


class PEIndex:
    """Read the existing PE census; never infer an owner from .text's end.

    Census compartments bound discovery, but their starts do not prove an
    independent ABI entry. Decoded calls, escaped code pointers, relocations
    and handwritten definitions supply the entry barriers. Every emitted
    continuation uses the same bounded ownership as an initial request.
    """

    def __init__(self, pe, path=None):
        path = Path(path) if path is not None else index_db_path(pe)
        if not path.is_file():
            raise ValueError("PE index missing: %s; build it with "
                             "python scripts/decomp/tools/build-pe-index.py" % path)
        with closing(sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)) as db:
            meta = dict(db.execute("SELECT key,value FROM meta"))
            if str(meta.get("sha256", "")).upper() != pe.sha256:
                raise ValueError("PE index hash does not match the executable: %s; "
                                 "run decomp:index" % path)
            if str(meta.get("decode_config", "")).split()[:2] != [
                    "linear+skipdata+jtab-mask", "v2"]:
                raise ValueError("PE index requires masked linear decode v2: %s; "
                                 "run decomp:index" % path)
            self.extents = dict(db.execute("SELECT start,end FROM func ORDER BY start"))
            if any(not isinstance(start, int) or not isinstance(end, int)
                   for start, end in self.extents.items()):
                raise ValueError("invalid indexed function bounds: %s; run decomp:index" % path)
            self.starts = sorted(self.extents)
            text = pe.text()
            text_hi = text.vaddr + text.vsize
            # The index segments the complete file-backed .text, including
            # trailing alignment beyond VirtualSize. Discovery still uses
            # the executable virtual range supplied by its caller.
            index_hi = text.vaddr + max(text.vsize, text.raw_size)
            previous_end = text.vaddr
            for start in self.starts:
                end = self.extents[start]
                if start != previous_end or not start < end <= index_hi:
                    raise ValueError("invalid indexed function bounds: %s; "
                                     "run decomp:index" % path)
                previous_end = end
            if not self.starts:
                raise ValueError("PE index has no function bounds: %s; run decomp:index" % path)
            if previous_end != index_hi:
                raise ValueError("PE index function coverage is incomplete: %s; "
                                 "run decomp:index" % path)
            self.instructions = {va for (va,) in db.execute("SELECT va FROM insn")}
            self.entries = set()
            self.entries.update(dst for (dst,) in db.execute(
                "SELECT DISTINCT x.dst FROM xref x JOIN insn i ON i.va=x.dst "
                "WHERE x.kind IN ('call','call_slot','addr')"))
            self.ranges = list(db.execute(
                "SELECT start,end FROM seg WHERE kind='jtab' ORDER BY start"))
            self.range_starts = [lo for lo, _hi in self.ranges]
            previous_end = text.vaddr
            for lo, hi in self.ranges:
                if (not isinstance(lo, int) or not isinstance(hi, int)
                        or not previous_end <= lo < hi <= text_hi
                        or (hi - lo) % 4 or (hi - lo) // 4 < 2):
                    raise ValueError("invalid indexed jump table: %s; run decomp:index" % path)
                previous_end = hi
            slots = dict(db.execute(
                "SELECT DISTINCT src,dst FROM xref WHERE kind='jtab' ORDER BY src"))
            masked_bytes = sum(hi - lo for lo, hi in self.ranges)
            if int(str(meta.get("jtab_masked_bytes", "-1"))) != masked_bytes:
                raise ValueError("PE index jump-table mask census is incomplete: %s; "
                                 "run decomp:index" % path)
            if masked_bytes != 4 * len(slots):
                raise ValueError("PE index jump-table masks do not cover every indexed slot: %s; "
                                 "run decomp:index" % path)
            # seg rows merge adjacent tables for masking. Actual indexed JMP
            # operands define logical table starts, and the JMP's owner (not
            # the storage slot's owner) defines local control-flow ownership.
            md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
            md.detail = True
            self.jump_tables = {}
            self.table_owners = set()
            for (site,) in db.execute(
                    "SELECT va FROM insn WHERE mn='jmp' AND ops LIKE '%*4%'"):
                ins = next(md.disasm(pe.read(site, 16), site), None)
                if ins is None or ins.mnemonic != "jmp" or not ins.operands:
                    raise ValueError("invalid indexed jump at %#x; run decomp:index" % site)
                operand = ins.operands[0]
                if operand.type != capstone.x86.X86_OP_MEM:
                    continue
                memory = operand.mem
                table = memory.disp & 0xFFFFFFFF
                if memory.base or not memory.index or memory.scale != 4 or not self.is_data(table):
                    continue
                self.jump_tables[site] = table
                owner = self.containing(site)
                if owner is not None:
                    self.table_owners.add(owner)
            bases = sorted(set(self.jump_tables.values()))
            if int(str(meta.get("jtab_tables", "-1"))) != len(bases):
                raise ValueError("PE index jump-table census is incomplete: %s; "
                                 "run decomp:index" % path)
            self.tables = {}
            for lo, hi in self.ranges:
                targets = []
                for slot in range(lo, hi, 4):
                    target = slots.get(slot)
                    if (not isinstance(target, int) or not text.vaddr <= target < text_hi
                            or target != int.from_bytes(pe.read(slot, 4), "little")
                            or db.execute("SELECT 1 FROM insn WHERE va=?",
                                          (target,)).fetchone() is None):
                        raise ValueError("invalid indexed jump-table entry at %#x; "
                                         "run decomp:index" % slot)
                    targets.append(target)
                first = bisect.bisect_left(bases, lo)
                last = bisect.bisect_left(bases, hi)
                starts = bases[first:last]
                for table, end in zip(starts, starts[1:] + [hi]):
                    if (table - lo) % 4 or (end - table) % 4:
                        raise ValueError("unaligned indexed jump table at %#x; "
                                         "run decomp:index" % table)
                    self.tables[table] = tuple(targets[(table - lo) // 4:(end - lo) // 4])
                    if len(self.tables[table]) > MAX_TABLE:
                        raise ValueError("indexed jump table exceeds %d entries at %#x; "
                                         "run decomp:index" % (MAX_TABLE, table))
        self.entries.update(target for pointers in code_pointers(pe).values()
                            for _slot, target in pointers)

    def containing(self, va):
        i = bisect.bisect_right(self.starts, va) - 1
        if i >= 0 and va < self.extents[self.starts[i]]:
            return self.starts[i]
        return None

    def owner(self, entry):
        start = self.containing(entry)
        if start is not None:
            return FunctionOwnership(self, start, self.extents[start], entry)
        return None

    def fragments(self, starts):
        out = set()
        for va in starts:
            start = self.containing(va)
            if start in starts and start in self.table_owners:
                owner = self.owner(start)
                if va != start and owner.is_local(va):
                    out.add(va)
        return out

    def is_data(self, va):
        i = bisect.bisect_right(self.range_starts, va) - 1
        return i >= 0 and va < self.ranges[i][1]

    def targets(self, site, table):
        if self.jump_tables.get(site) == table:
            return self.tables.get(table)
        return None


class JumpTables:
    def __init__(self, pe, index=None):
        self.index = index
        self.pe = pe
        text = pe.text()
        self.text_lo = text.vaddr
        self.text_hi = text.vaddr + text.vsize
        self.md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
        self.md.detail = True
        self.cache = {}

    def _readable(self, va, n=4):
        try:
            self.pe.read(va, n)
            return True
        except ValueError:
            return False

    def _in_text(self, va):
        return self.text_lo <= va < self.text_hi

    def classify(self, va, body_addrs, lo, hi):
        """Classify the computed jump at `va`.

        Returns (kind, targets) where kind is one of:
          'table'     targets recovered from a switch table
          'iat'       jmp through a constant slot  -> indirect tail call
          'dynamic'   jmp through a register       -> indirect tail call
          'unknown'   could not classify
        """
        # Only indexed tables are independent of the discovered entry path.
        # Fallback guards read body_addrs, which can differ for two entries
        # in the same census compartment (or between parallel workers).
        if self.index is None or va not in self.index.jump_tables:
            return self._classify(va, body_addrs, lo, hi)
        key = (va, lo, hi)
        got = self.cache.get(key)
        if got is not None:
            return got
        res = self._classify(va, body_addrs, lo, hi)
        self.cache[key] = res
        return res

    def _classify(self, va, body_addrs, lo, hi):
        try:
            raw = self.pe.read(va, 16)
        except ValueError:
            return ("unknown", [])
        try:
            ins = next(self.md.disasm(raw, va))
        except StopIteration:
            return ("unknown", [])
        if ins.mnemonic != "jmp" or not ins.operands:
            return ("unknown", [])
        op = ins.operands[0]
        if op.type == capstone.x86.X86_OP_REG:
            return ("dynamic", [])
        if op.type != capstone.x86.X86_OP_MEM:
            return ("unknown", [])
        m = op.mem
        base_reg = m.base
        idx_reg = m.index
        disp = m.disp & 0xFFFFFFFF

        # form C: jmp dword ptr [IMM]  (no base, no index)
        if base_reg == 0 and idx_reg == 0:
            return ("iat", [disp])

        # forms A/B: jmp dword ptr [idx*4 + TBL]
        if idx_reg != 0 and m.scale == 4 and base_reg == 0:
            tbl = disp
            if self.index is not None:
                targets = self.index.targets(va, tbl)
                if targets is not None:
                    return ("table", list(targets))
            # 1. a real range guard on the index register, then on any
            #    register (two-level tables compare the pre-transformed index)
            n = self._bound_before(va, body_addrs, idx_reg)
            if n is None:
                n = self._bound_before(va, body_addrs, 0)
            if n is not None:
                targets = self._read_table(tbl, n, lo, hi)
                if targets:
                    return ("table", targets)
            # 2. no guard: walk the table inside the function, and also take
            #    the legacy nearest-cmp read; the longer of the two wins. The
            #    walk alone misses tables whose first entry is outside the
            #    recorded function range; the legacy read alone truncates
            #    tables whose nearest cmp is ordinary control flow.
            walked = self._read_table(tbl, None, lo, hi)
            legacy_n = self._nearest_cmp_bound(va, body_addrs)
            legacy = self._read_table(tbl, legacy_n, lo, hi) if legacy_n else []
            best = walked if len(walked) >= len(legacy) else legacy
            if best:
                return ("table", best)
            return ("unknown", [])

        # jmp dword ptr [base + idx*4] with a register base: table address
        # is computed (PIC-ish); not seen in this binary but keep it honest.
        return ("unknown", [])

    GUARD_JCC = ("ja", "jae", "jb", "jbe", "jnb", "jnbe", "jnc", "jc")

    def _bound_before(self, va, body_addrs, idx_reg=0):
        """Find the range check that guards the table jump at `va`: a
        `cmp REG, N` on the table's index register, followed by an
        UNSIGNED conditional jump (MSVC's `cmp eax, N; ja default`).

        A bare `cmp` is not a bound. Boot round 14 met a switch whose last
        instructions before the jump were `cmp esi, 2 / je ...` -- ordinary
        control flow on the same register -- and the old rule took N=2 as
        the table size, dropping the fourth case; the game ran off the
        lifted table into an unlifted address during level generation
        (0x009b0d7b, table 0x009b1210, 4 entries). Without a guard the
        table is walked until an entry leaves the function (_read_table)."""
        cands = [a for a in body_addrs if a < va]
        cands.sort()
        window = cands[-12:]
        decoded = []
        for a in window:
            try:
                decoded.append(next(self.md.disasm(self.pe.read(a, 16), a)))
            except (StopIteration, ValueError):
                decoded.append(None)
        for i in range(len(decoded) - 1, -1, -1):
            ins = decoded[i]
            if ins is None or ins.mnemonic != "cmp" or len(ins.operands) != 2:
                continue
            if ins.operands[1].type != capstone.x86.X86_OP_IMM:
                continue
            if ins.operands[0].type != capstone.x86.X86_OP_REG:
                continue
            if idx_reg and ins.operands[0].reg != idx_reg:
                continue
            # the very next decoded instruction must be the unsigned guard
            nxt = decoded[i + 1] if i + 1 < len(decoded) else None
            if nxt is None or nxt.mnemonic not in self.GUARD_JCC:
                continue
            n = ins.operands[1].imm
            if 0 <= n < MAX_TABLE:
                return n + 1
        return None

    def _nearest_cmp_bound(self, va, body_addrs):
        """The pre-round-14 rule, kept only as the fallback's second opinion:
        the nearest `cmp x, N` in the 12 instructions before the jump."""
        cands = [a for a in body_addrs if a < va]
        cands.sort()
        for a in reversed(cands[-12:]):
            try:
                ins = next(self.md.disasm(self.pe.read(a, 16), a))
            except (StopIteration, ValueError):
                continue
            if ins.mnemonic == "cmp" and len(ins.operands) == 2 and \
                    ins.operands[1].type == capstone.x86.X86_OP_IMM:
                n = ins.operands[1].imm
                if 0 <= n < MAX_TABLE:
                    return n + 1
        return None

    def _read_table(self, tbl, n, lo, hi):
        """Read up to n entries; stop at the first implausible target."""
        out = []
        limit = n if n else MAX_TABLE
        for i in range(limit):
            va = tbl + 4 * i
            if not self._readable(va, 4):
                break
            t = int.from_bytes(self.pe.read(va, 4), "little")
            if not self._in_text(t):
                break
            # entries of a real switch table land inside the owning function
            if n is None and not (lo <= t < hi):
                break
            out.append(t)
        if n is not None and len(out) != n:
            # partial read: trust only a full table
            return out if len(out) >= 2 else []
        return out
