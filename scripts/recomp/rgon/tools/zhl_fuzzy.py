#!/usr/bin/env python3
"""Relaxed, decoding matcher for REPENTOGON's ZHL signatures against THIS executable (v1.9.7.17).

  python scripts/recomp/rgon/tools/zhl_fuzzy.py [--out DIR] [--ghidra FUNCTIONS.jsonl] [--rebuild-cache]
  python scripts/recomp/rgon/tools/zhl_fuzzy.py --report-only      # rewrite report.md from the JSON

REPENTOGON finds each game function by a byte pattern taken from the START of the function in
v1.9.7.12. 669 of its 1,167 patterns match v1.9.7.17 exactly once (tools/zhl-resolve.mjs); the rest
match nothing or several places, because a struct offset, a global, a call target or a frame size
inside the pattern moved, or because the function itself was recompiled differently. This tool looks
for them again by DECODING instead of comparing bytes:

  1. Candidates are function entries only: the Ghidra export's function list united with the lift's
     entries.txt (minus the lift's continuation points inside a Ghidra body). All 669 exact matches
     are at such an entry (measured).
  2. Tier 1, shape: the signature's bytes and the candidate's bytes are each disassembled (capstone)
     and compared instruction by instruction. Same mnemonic and same operand shape (registers, memory
     base/index/scale/size, operand kinds) with differences confined to displacement / immediate /
     rel32 bytes (or disp8<->disp32, imm8<->imm32, short<->near forms) is a SOFT mismatch; anything
     else is HARD. A FULL match covers the whole signature with no hard mismatch. The signature ends
     at its first wildcarded opcode byte (the int3 padding after a short function).
  3. Tier 2, alignment: registers abstracted (esp/ebp kept), instructions may be inserted or removed;
     each matched instruction scores its rarity among all function prefixes (IDF of the abstract
     token, plus the IDF of the exact bytes when they compare exact). Candidates come from an IDF-
     weighted token prefilter (300 per signature) plus the tier-1 matches; a candidate must match 75%
     of the signature's instructions; one whose ret contradicts the declaration is dropped.
     The pick: the unique full shape match if it is also the alignment top; otherwise the alignment
     top when it leads the next candidate by 15% of its score.
  4. Independent checks, each recorded as evidence:
       ret      every `ret N` reached from the entry by direct branches against the bytes the declaration
                says the callee pops (ZHL rules: __cdecl / `cleanup` / __x86_64* pop nothing; otherwise
                stack args are popped; `<reg>` args are not on the stack; a by-value class return may add
                a hidden pointer; a by-value class of unknown size makes the check 'unknown');
       vtable   for a signature inside a `__vtable { }` block: its slot index (skip; lines counted)
                against the class's RTTI vtable (namespace IsaacRepentancePlus);
       reg      the game's own Lua registration (.scratch/rgon/bindings-17.json) names the same method;
       hook     the layer's hook table (tools/hook_table.py HOOKS, sources reg/asm) has the same name;
       near     the nearest function of the same .zhl file located by an exact match whose ret agrees
                (window chosen where random entries pass < 1%; the measured rates are in the report);
                it counts only when the runner-up candidate is not near an anchor as well;
       calls    located callers/callees, strings naming the method, size (informational).
  5. Grade: A = unique pick, >= 6 instructions, ret agrees, and one more check (vtable, reg, hook,
     near); B = unique pick and ret agrees; C = several candidates, or a pick that cannot be confirmed;
     X = nothing credible. A pick whose address an exact match, the hook table or the Lua registration
     already gives another function, or that two signatures share, is downgraded to C.

Validation (written to stats.json and the report): on the 669 exact-once signatures, how often the
relaxed top is the exact match and how often the shape alone is unique; on drifted signatures (n != 1)
whose function this build already names (hook table, Lua registration outside the Lua glue range, RTTI
vtable slot), the grade each gets with that source switched off and whether it is right. Exact matches
are audited with the same checks (exact-audit-17.json).

The mid-function patches (asm-survey.json, a source survey of REPENTOGON's ASMPatches) are located by
exact pattern search, then with every displacement / immediate / rel32 byte of the decoded pattern
wildcarded, then by aligning the decoded pattern inside the enclosing function when that is located;
each hit is checked to start on an instruction boundary and to be reached from the enclosing function.

Writes, under --out (default .scratch/rgon/fuzzy): zhl-fuzzy-17.json, exact-audit-17.json,
asm-patches-17.json, stats.json, fnmap.json, report.md (plus manual-17.json if present), and a decode
cache (entries.pickle, ~190 MB). Nothing from REPENTOGON's source is copied here: the tool reads its
.zhl files and the survey as data at run time.
"""
import argparse
import bisect
import collections
import json
import os
import pickle
import re
import struct
import sys
from pathlib import Path

import capstone
from capstone import x86 as cx86

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(ROOT / "scripts" / "decomp" / "tools"))
import pe as pemod  # noqa: E402

ZHL_DIR = ROOT / "third_party" / "REPENTOGON" / "libzhl" / "functions"
DEFAULT_GHIDRA = Path(r"C:/Users/PC/Desktop/New folder/the-browsing-of-isaac/output/recomp/export/functions.jsonl")
ENTRIES_TXT = ROOT / "output" / "recomp" / "lift" / "gu-r101" / "entries.txt"
SIG_RE = re.compile(r'"([0-9a-fA-F?]+)"\s*:\s*\r?\n\s*([^\r\n]+;)')
DECODE_BYTES = 320          # bytes decoded at each entry (the longest function signature is shorter)
MIN_INSNS = 6               # instructions compared before a unique match may be graded A

MD = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
MD.detail = True
MD.skipdata = False
MD_FAST = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)   # no detail: control-flow walks


# ----------------------------------------------------------------------------------------------
# decoding
def insn_record(i):
    """(size, shape, bytes, volatile positions, mnemonic, op_str, ret_pop or None, call/jmp target)"""
    ops = []
    target = None
    for o in i.operands:
        if o.type == cx86.X86_OP_REG:
            ops.append(("r", o.reg))
        elif o.type == cx86.X86_OP_IMM:
            ops.append(("i",))
            target = o.imm
        elif o.type == cx86.X86_OP_MEM:
            ops.append(("m", o.mem.segment, o.mem.base, o.mem.index, o.mem.scale, o.size))
    vol = set()
    if i.disp_size:
        vol.update(range(i.disp_offset, i.disp_offset + i.disp_size))
    if i.imm_size:
        vol.update(range(i.imm_offset, i.imm_offset + i.imm_size))
    ret = None
    if i.mnemonic in ("ret", "retn"):
        ret = target if target is not None else 0
    return (i.size, (i.mnemonic, tuple(ops)), bytes(i.bytes), frozenset(vol), i.mnemonic, i.op_str, ret,
            target if i.mnemonic in ("call", "jmp") or i.mnemonic.startswith("j") else None)


def decode(buf, va, max_insns=None):
    out = []
    for i in MD.disasm(buf, va):
        out.append(insn_record(i))
        if max_insns and len(out) >= max_insns:
            break
    return out


def decode_pattern(pattern):
    """Decode a ZHL pattern ('??' = wildcard). Returns list of dicts with the record, the wildcard mask
    for its bytes, whether it is cut by the pattern's end, and whether a wildcard sits outside its
    displacement/immediate fields (then only the mnemonic is compared)."""
    toks = [pattern[k:k + 2] for k in range(0, len(pattern), 2)]
    raw = bytes(0 if t == "??" else int(t, 16) for t in toks)
    wild = [t == "??" for t in toks]
    n = len(raw)
    out = []
    off = 0
    for i in MD.disasm(raw + b"\0" * 16, 0):
        if off >= n:
            break
        if wild[off]:
            # an opcode byte is a wildcard (typically the int3 padding after a short function):
            # nothing from here on can be decoded reliably, so the signature ends here
            break
        r = insn_record(i)
        size = r[0]
        w = wild[off:off + size] + [True] * max(0, off + size - n)
        trunc = off + size > n
        loose = any(w[p] and p not in r[3] for p in range(min(size, n - off)))
        out.append({"rec": r, "wild": w, "trunc": trunc, "loose": loose, "off": off})
        off += size
    covered = off >= n
    return out, covered


def compare(si, c):
    """Compare a decoded signature instruction with a candidate instruction record:
    'exact', 'soft' or 'hard'; and the count of non-wildcard bytes equal."""
    r = si["rec"]
    size, shape, sb, vol = r[0], r[1], r[2], r[3]
    csize, cshape, cb = c[0], c[1], c[2]
    w = si["wild"]
    if si["trunc"]:
        # only the bytes the pattern has; an operand field may be cut, so compare non-volatile bytes
        present = [p for p in range(len(w)) if p < size and not w[p] and p < csize]
        eq = sum(1 for p in present if sb[p] == cb[p])
        for p in present:
            if sb[p] != cb[p] and p not in vol:
                return "hard", eq
        return ("exact" if eq == len(present) else "soft"), eq
    if si["loose"]:
        if r[4] != c[4]:
            return "hard", 0
        if size != csize:
            return "soft", 0
        eq = sum(1 for p in range(size) if not w[p] and sb[p] == cb[p])
        return ("exact" if all(w[p] or sb[p] == cb[p] for p in range(size)) else "soft"), eq
    if shape != cshape:
        return "hard", 0
    if size != csize:
        return "soft", 0
    eq = 0
    soft = False
    for p in range(size):
        if w[p]:
            continue
        if sb[p] == cb[p]:
            eq += 1
        elif p in vol:
            soft = True
        else:
            return "hard", eq
    return ("soft" if soft else "exact"), eq


def score(sig, cand):
    """(full, matched_insns_untruncated, softs, exact_bytes, first_hard_index)"""
    matched = soft = eqb = 0
    for k, si in enumerate(sig):
        if k >= len(cand):
            return (False, matched, soft, eqb, k)
        res, eq = compare(si, cand[k])
        if res == "hard":
            return (False, matched, soft, eqb, k)
        eqb += eq
        if res == "soft":
            soft += 1
        if not si["trunc"]:
            matched += 1
    return (True, matched, soft, eqb, None)


# ----------------------------------------------------------------------------------------------
# second tier: alignment with register renaming, inserted/removed instructions
_TOK = {}


def _regclass(rid):
    nm = MD.reg_name(rid) or "?"
    if nm in ("esp", "ebp"):
        return nm
    if nm.startswith("xmm"):
        return "x"
    if nm in ("al", "bl", "cl", "dl", "ah", "bh", "ch", "dh"):
        return "r8"
    if nm in ("ax", "bx", "cx", "dx", "si", "di"):
        return "r16"
    return "r32" if nm.startswith("e") else nm


def token(rec):
    """An instruction with its registers abstracted (esp/ebp kept), displacements and immediates dropped."""
    mnem, ops = rec[1]
    parts = [mnem]
    for o in ops:
        if o[0] == "r":
            parts.append(_regclass(o[1]))
        elif o[0] == "i":
            parts.append("I")
        else:
            seg = MD.reg_name(o[1]) if o[1] else ""
            base = MD.reg_name(o[2]) if o[2] else "abs"
            base = base if base in ("esp", "ebp", "abs") else "r"
            parts.append("M%s%s%s%d" % (seg, base, "x" if o[3] else "", o[5]))
    t = " ".join(parts)
    return _TOK.setdefault(t, len(_TOK))


IDF_T = {}          # abstract token -> log(N / entries whose first 48 instructions contain it)
IDF_B = {}          # exact instruction bytes -> same, for the exact form
IDF_DEFAULT = 8.0


def align(sig, cand, width=16):
    """Semi-global alignment of the signature's instructions against the start of a candidate, weighted
    by how rare each instruction is among all function prefixes: a token match scores the token's IDF,
    plus the IDF of the exact bytes when the instruction compares exact; mismatch and gap cost the mean
    token weight. The candidate's tail is free. Returns (score, fraction of signature instructions
    matched by token)."""
    st = [si for si in sig if not si["trunc"]]
    n = len(st)
    if not n:
        return (0.0, 0.0)
    m = min(len(cand), n + width)
    ctok = [token(c) for c in cand[:m]]
    stok = [token(si["rec"]) if not si["loose"] else None for si in st]
    wt = [IDF_T.get(t, IDF_DEFAULT) if t is not None else 1.0 for t in stok]
    pen = sum(wt) / n
    prev = [(-pen * j, 0) for j in range(m + 1)]
    for i in range(1, n + 1):
        cur = [(-pen * i, 0)] + [None] * m
        si = st[i - 1]
        a = stok[i - 1]
        for j in range(1, m + 1):
            c = cand[j - 1]
            if (a is not None and a == ctok[j - 1]) or (a is None and si["rec"][4] == c[4]):
                res, _ = compare(si, c)
                sc = wt[i - 1] + (min(IDF_B.get(c[2], IDF_DEFAULT), IDF_DEFAULT) if res == "exact" else 0.0)
                best = (prev[j - 1][0] + sc, prev[j - 1][1] + 1)
            else:
                best = (prev[j - 1][0] - pen, prev[j - 1][1])
            up = (prev[j][0] - pen, prev[j][1])
            left = (cur[j - 1][0] - pen, cur[j - 1][1])
            if up[0] > best[0]:
                best = up
            if left[0] > best[0]:
                best = left
            cur[j] = best
        prev = cur
    sc, k = max(prev)
    return (sc, k / n)


# ----------------------------------------------------------------------------------------------
# the ZHL catalogue, with the context the declaration sits in
def strip_comments_keep_len(text):
    def blank(m):
        return re.sub(r"[^\n]", " ", m.group(0))
    t = re.sub(r"/\*.*?\*/", blank, text, flags=re.S)
    return re.sub(r"//[^\n]*", blank, t)


def comment_spans(text):
    return [(m.start(), m.end()) for m in re.finditer(r"/\*.*?\*/", text, flags=re.S)]


def vtable_blocks(text):
    """[(start, end, class, [(stmt_start, stmt_end, stmt_text), ...])]"""
    clean = strip_comments_keep_len(text)
    out = []
    for m in re.finditer(r"__vtable\s*\{", clean):
        depth, k = 1, m.end()
        while k < len(clean) and depth:
            if clean[k] == "{":
                depth += 1
            elif clean[k] == "}":
                depth -= 1
            k += 1
        structs = list(re.finditer(r"\bstruct\s+([A-Za-z_][A-Za-z0-9_]*)", clean[:m.start()]))
        cls = structs[-1].group(1) if structs else None
        body_start, body_end = m.end(), k - 1
        stmts = []
        pos = body_start
        for part in clean[body_start:body_end].split(";"):
            s = part.strip()
            if s:
                stmts.append((pos, pos + len(part), s))
            pos += len(part) + 1
        out.append((body_start, body_end, cls, stmts))
    return out


def read_catalogue():
    rows = []
    keys = {}
    for f in os.listdir(ZHL_DIR):
        if not f.endswith(".zhl"):
            continue
        text = (ZHL_DIR / f).read_text(encoding="utf8", errors="replace")
        comments = comment_spans(text)
        vts = vtable_blocks(text)
        for m in SIG_RE.finditer(text):
            pattern = m.group(1).lower()
            d = re.sub(r"\s+", " ", m.group(2)).strip()
            nm = re.search(r"([A-Za-z_~][A-Za-z0-9_:~]*)\s*\(", d)
            name = nm.group(1) if nm else d[:60]
            key = name if name not in keys else "%s#%s#%d" % (name, f, len(keys))
            keys[key] = True
            pos = m.start()
            ctx = {"commented": any(a <= pos < b for a, b in comments)}
            for (bs, be, cls, stmts) in vts:
                if bs <= pos < be:
                    for idx, (ss, se, st) in enumerate(stmts):
                        if ss <= pos < se:
                            ctx["vtable"] = {"class": cls, "slot": idx}
                            break
            if "::" in name:
                cls, meth = name.rsplit("::", 1)
            else:
                cls, meth = (ctx.get("vtable") or {}).get("class"), name
            rows.append({"key": key, "file": f, "pattern": pattern, "decl": d, "class": cls, "method": meth, **ctx})
    return rows


# ----------------------------------------------------------------------------------------------
# what the declaration says the callee pops
PRIM4 = {"int", "unsigned", "signed", "bool", "char", "short", "float", "long", "uint32_t", "int32_t", "uint8_t",
         "int8_t", "uint16_t", "int16_t", "size_t", "DWORD", "BYTE", "WORD", "unsigned int", "unsigned char",
         "unsigned short", "unsigned long", "wchar_t"}
PRIM8 = {"double", "long long", "unsigned long long", "uint64_t", "int64_t", "__int64"}
# by-value class sizes this build shows: Vector is the two-float pair; ColorMod is measured from
# Entity::AddSlowing (0x006ad750, also the game's Lua registration), whose `ret 0x3c` pops
# ref 4 + int 4 + float 4 + ColorMod + bool 4, so ColorMod is 0x2c bytes.
BYVAL = {"Vector": 8, "ColorMod": 0x2c}


def split_params(s):
    out, depth, cur = [], 0, ""
    for ch in s:
        if ch in "<([":
            depth += 1
        elif ch in ">)]":
            depth -= 1
        if ch == "," and depth == 0:
            out.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        out.append(cur)
    return [p.strip() for p in out if p.strip() and p.strip() != "void"]


def type_size(t):
    """(bytes, note) for a parameter type text (name removed)."""
    t = re.sub(r"\bconst\b|\bstruct\b|\benum\b", "", t).strip()
    if "*" in t or "&" in t:
        return 4, None
    t = re.sub(r"\s+", " ", t)
    if t in PRIM8:
        return 8, None
    if t in PRIM4:
        return 4, None
    if t in BYVAL:
        return BYVAL[t], None
    if re.match(r"^e[A-Z]|^[A-Z][A-Za-z]*(Type|Flags?|Variant|Id|ID|Mode|State|Slot|Kind|Category)$", t):
        return 4, None                                 # an enum-like name
    return None, "size of '%s' passed by value is not known" % t


def expected_pops(row):
    """({accepted pop counts}, notes) or (None, notes) when it cannot be said."""
    d = row["decl"].rstrip(";").strip()
    notes = []
    lp = d.find("(")
    rp = d.rfind(")")
    if lp < 0 or rp < 0:
        return None, ["no parameter list"]
    head, params = d[:lp], d[lp + 1:rp]
    words = head.replace("*", " * ").split()
    static = "static" in words
    cleanup = "cleanup" in words
    conv = next((w for w in words if w.startswith("__")), None)
    member = ("vtable" in row) or (conv == "__thiscall") or (not static and "::" in head and conv is None)
    plist = split_params(params)
    if any(p == "..." or p.endswith("...") for p in plist):
        return {0}, ["varargs: caller pops"]
    if cleanup or conv == "__cdecl" or (conv and conv.startswith("__x")):
        return {0}, ["%s: caller pops" % ("cleanup" if cleanup else conv)]
    stack = 0
    reg_used = 0
    for k, p in enumerate(plist):
        p = re.sub(r"=.*$", "", p).strip()
        if re.search(r"<\s*[a-z0-9]+\s*>\s*$", p):
            continue                                   # passed in a register
        m = re.match(r"^(.*?)([A-Za-z_][A-Za-z0-9_]*)?(\s*\[\s*\d*\s*\])?$", p)
        t = p
        if m and m.group(2) and m.group(1).strip():
            t = m.group(1)
        if m and m.group(3):
            t = t + "*"
        size, note = type_size(t)
        if size is None:
            return None, [note]
        if conv == "__fastcall" and reg_used < 2 and size == 4 and "float" not in t:
            reg_used += 1
            continue
        if note:
            notes.append(note)
        stack += size
    # return type: a class returned by value comes back through a hidden pointer the callee pops
    rtype = " ".join(w for w in words[:-1] if w not in ("static", "cleanup", "virtual", "override", "inline", "debug")
                     and not w.startswith("__"))
    rtype = re.sub(r"\bconst\b|\bstruct\b|\bunsigned\b", "", rtype).strip()
    accepted = {stack}
    if rtype and "*" not in rtype and "&" not in rtype and rtype not in PRIM4 | PRIM8 | {"void"}:
        accepted.add(stack + 4)
        notes.append("returns '%s' by value: hidden pointer may add 4" % rtype)
    if not member and conv is None and not static:
        notes.append("no convention given")
    return accepted, notes


# ----------------------------------------------------------------------------------------------
# the executable
class Exe:
    def __init__(self, ghidra_path, cache_path, rebuild):
        self.img = pemod.PEImage()
        self.text = self.img.text
        self.tbuf = self.img.buf[self.text.raw_ptr:self.text.raw_ptr + self.text.raw_size]
        self.g = {}
        if Path(ghidra_path).is_file():
            for line in open(ghidra_path, encoding="utf8"):
                d = json.loads(line)
                va = int(d["va"], 16)
                self.g[va] = {"min": int(d["minVa"], 16), "end": int(d["endVa"], 16), "ranges": d["bodyRanges"],
                              "bytes": d["bodyBytes"], "callees": [int(c, 16) if isinstance(c, str) else c
                                                                   for c in (d.get("callees") or [])
                                                                   if isinstance(c, (str, int))]}
        lift = set(int(l, 16) for l in open(ENTRIES_TXT)) if ENTRIES_TXT.is_file() else set()
        # the lift's entry list also has continuation points inside functions (jump targets it split
        # at); one that lies strictly inside a single-range Ghidra function body is not an entry
        gstarts = sorted(self.g)
        inside = 0
        keep = set(self.g)
        for e in lift:
            k = bisect.bisect_right(gstarts, e) - 1
            if k >= 0 and gstarts[k] != e:
                gi = self.g[gstarts[k]]
                if gi["ranges"] == 1 and gstarts[k] < e < gi["end"]:
                    inside += 1
                    continue
            keep.add(e)
        self.entries = sorted(e for e in keep if self.text.contains(e))
        self.entry_set = set(self.entries)
        self.n_lift, self.n_ghidra, self.n_lift_inside = len(lift), len(self.g), inside
        if cache_path.is_file() and not rebuild:
            self.dec = pickle.load(open(cache_path, "rb"))
        else:
            self.dec = {}
            for e in self.entries:
                self.dec[e] = decode(self.bytes_at(e, DECODE_BYTES), e)
            pickle.dump(self.dec, open(cache_path, "wb"))
        self.by_first = collections.defaultdict(list)
        self.by_mnem = collections.defaultdict(list)
        for e, d in self.dec.items():
            if d and e in self.entry_set:
                self.by_first[d[0][1]].append(e)
                self.by_mnem[d[0][4]].append(e)
        self._rets = {}
        self.callers = collections.defaultdict(set)
        for va, gi in self.g.items():
            for c in gi["callees"]:
                self.callers[c].add(va)

    def bytes_at(self, va, n):
        off = va - self.text.va
        return self.tbuf[off:off + n]

    def file_off(self, va):
        return self.img.va_to_off(va)

    def extent(self, va):
        k = bisect.bisect_right(self.entries, va)
        nxt = self.entries[k] if k < len(self.entries) else self.text.va_end
        gi = self.g.get(va)
        if gi and gi["ranges"] == 1:
            return va, min(gi["end"], max(nxt, va + 1)) if gi["end"] > va else nxt
        return va, nxt

    def rets(self, va):
        if va in self._rets:
            return self._rets[va]
        # recursive descent from the entry over direct branches; a jump to another known entry is a
        # tail call and is not followed; jump tables are not followed (their bytes are never decoded)
        lo, hi = va, va + 0x40000
        rs = set()
        seen = set()
        work = [va]
        while work and len(seen) < 40000:
            p = work.pop()
            while lo <= p < hi and p not in seen:
                if p != va and p in self.entry_set:
                    break
                seen.add(p)
                ins = next(MD_FAST.disasm_lite(self.bytes_at(p, 16), p, 1), None)
                if ins is None:
                    break
                _, size, m, ops = ins
                if m in ("ret", "retn"):
                    rs.add(int(ops, 0) if ops else 0)
                    break
                if m == "int3" or m == "hlt":
                    break
                if m.startswith("j") or m.startswith("loop"):
                    t = int(ops, 0) if re.fullmatch(r"0x[0-9a-f]+", ops or "") else None
                    if t is not None:
                        work.append(t)
                    if m == "jmp":
                        break
                p += size
        self._rets[va] = (rs, len(seen))
        return self._rets[va]

    def enclosing(self, va):
        k = bisect.bisect_right(self.entries, va) - 1
        return self.entries[k] if k >= 0 else None

    def reaches(self, fn, target, limit=0x30000):
        """Is `target` reached from `fn`'s entry by following direct branches (Ghidra splits some large
        functions into pieces, so containment by its ranges is not enough)? A jump to the start of a
        function with a frame prologue is a tail call and is not followed."""
        seen = set()
        work = [fn]
        while work and len(seen) < 60000:
            p = work.pop()
            while fn <= p < fn + limit and p not in seen:
                seen.add(p)
                if p == target:
                    return True
                ins = next(MD_FAST.disasm_lite(self.bytes_at(p, 16), p, 1), None)
                if ins is None:
                    break
                _, size, m, ops = ins
                if m in ("ret", "retn", "int3", "hlt"):
                    break
                if m.startswith("j") or m.startswith("loop"):
                    t = int(ops, 0) if re.fullmatch(r"0x[0-9a-f]+", ops or "") else None
                    if t is not None and not (m == "jmp" and t != fn and t in self.g and
                                              self.bytes_at(t, 3) in (b"\x55\x8b\xec", b"\x53\x8b\xdc")):
                        work.append(t)
                    if m == "jmp":
                        break
                p += size
        return False

    def ghidra_function_of(self, va):
        """The Ghidra function whose body range contains va (single-range bodies), or None."""
        if not hasattr(self, "_gs"):
            self._gs = sorted(self.g)
        k = bisect.bisect_right(self._gs, va) - 1
        while k >= 0 and va - self._gs[k] < 0x40000:
            gi = self.g[self._gs[k]]
            if gi["min"] <= va < gi["end"]:
                return self._gs[k]
            k -= 1
        return None

    def on_boundary(self, va):
        """Is va the start of an instruction when the enclosing function is decoded linearly from its entry?"""
        e = self.enclosing(va)
        if e is None:
            return None, False
        for i in MD.disasm(self.bytes_at(e, va - e + 16), e):
            if i.address == va:
                return e, True
            if i.address > va:
                return e, False
        return e, False

    def strings_in(self, va):
        a, b = self.extent(va)
        out = []
        for i in MD.disasm(self.bytes_at(a, min(b, a + 0x8000) - a), a):
            for o in i.operands:
                v = o.imm if o.type == cx86.X86_OP_IMM else (o.mem.disp if o.type == cx86.X86_OP_MEM and o.mem.base == 0 else None)
                if v and 0xb18000 <= v < 0xbf8000:
                    try:
                        s = self.img.cstr(v, 120)
                    except Exception:
                        continue
                    if len(s) >= 4 and all(32 <= c < 127 for c in s):
                        out.append(s.decode())
        return out


def rtti_vtables(exe):
    """{class: [(vtable va, this offset, [slots])]} for every class with a complete-object locator."""
    img = exe.img
    secs = {s.name: s for s in img.sections}
    rd, dt = secs[".rdata"], secs[".data"]
    rbuf = img.buf[rd.raw_ptr:rd.raw_ptr + rd.raw_size]
    out = collections.defaultdict(list)
    col_refs = collections.defaultdict(list)
    for k in range(0, len(rbuf) - 4, 4):
        col_refs[struct.unpack_from("<I", rbuf, k)[0]].append(rd.va + k)
    for k in range(0, len(rbuf) - 20, 4):
        sig, off, cd, td = struct.unpack_from("<IIII", rbuf, k)
        if sig != 0 or not dt.contains(td):
            continue
        try:
            name = img.cstr(td + 8, 200)
        except Exception:
            continue
        if not name.startswith(b".?AV") and not name.startswith(b".?AU"):
            continue
        col = rd.va + k
        cls = name[4:].decode(errors="replace")
        cls = cls[:-2] if cls.endswith("@@") else cls
        cls = cls.replace("@IsaacRepentancePlus", "")
        for ref in col_refs.get(col, []):
            vt = ref + 4
            slots = []
            for s in range(200):
                if not rd.contains(vt + 4 * s + 3):
                    break
                fn = img.u32(vt + 4 * s)
                if not exe.text.contains(fn):
                    break
                slots.append(fn)
            if slots:
                out[cls].append((vt, off, slots))
    for cls in out:
        out[cls].sort(key=lambda v: (v[1], v[0]))
    return out


# ----------------------------------------------------------------------------------------------
def load_anchors():
    """Known addresses by name from sources other than signatures: Lua registration, hook table."""
    reg = {}
    p = ROOT / ".scratch" / "rgon" / "bindings-17.json"
    if p.is_file():
        for cls, c in json.load(open(p)).items():
            for name, f in c.get("functions", {}).items():
                if f.get("fn"):
                    reg.setdefault((cls.lower(), name.lower()), set()).add(int(f["fn"], 16))
    hooks = {}
    try:
        sys.path.insert(0, str(HERE))
        import hook_table  # noqa: E402
        for slot, name, va, src, pops, note in hook_table.HOOKS:
            if va and src in ("reg", "asm"):
                hooks[name] = (va, src)
    except Exception as ex:  # noqa: BLE001
        print("hook table not read: %s" % ex)
    return reg, hooks


def reg_lookup(reg, cls, meth):
    if not cls:
        return None
    c = cls.replace("_", "").lower()
    alias = {"musicmanager": ["music", "musicmanager"], "manager": ["isaac"], "entityplayer": ["entityplayer"]}
    for cc in alias.get(c, [c]):
        v = reg.get((cc, meth.lower()))
        if v:
            return v
    return None


def write_report(out):
    """report.md from the JSON outputs (run after the main pass; --report-only redoes just this)."""
    out = Path(out)
    res = json.load(open(out / "zhl-fuzzy-17.json"))
    audit = json.load(open(out / "exact-audit-17.json"))
    stats = json.load(open(out / "stats.json"))
    patches = json.load(open(out / "asm-patches-17.json")) if (out / "asm-patches-17.json").is_file() else {}
    fnmap = json.load(open(out / "fnmap.json")) if (out / "fnmap.json").is_file() else {}
    ff = json.load(open(ROOT / ".scratch" / "rgon" / "ff_callbacks.json"))
    cat = read_catalogue()
    by_cm = collections.defaultdict(list)
    for r in cat:
        by_cm[("%s::%s" % (r["class"], r["method"])) if r["class"] else r["key"]].append(r["key"])
    L = []
    w = L.append
    v1 = stats["validation_exact"]
    w("# Relaxed ZHL signature matching against v1.9.7.17\n")
    w("Generated by `scripts/recomp/rgon/tools/zhl_fuzzy.py`. Every number below is measured by that run.\n")
    w("Inputs: %d function entries (lift entries.txt %d, Ghidra export %d, lift continuation points inside a Ghidra body dropped); "
      "%d ZHL signatures (all %d keyed as in `.scratch/rgon/zhl-17.json`).\n" % (
          stats["entries"], stats["entries_lift"], stats["entries_ghidra"], stats["catalogue"], stats["keyed_as_zhl17"]))
    w("## 1. Precision of the method\n")
    w("### 1a. On the %d signatures that match exactly once\n" % v1["n"])
    w("- Relaxed top candidate (shape match, then fewest soft mismatches, then most equal bytes) = the exact match: **%d / %d**." % (v1["top_is_exact"], v1["n"]))
    w("- With every displacement/immediate/rel32 value ignored (the situation of a drifted signature): the exact match is the ONLY "
      "full shape match for **%d**; it ties with other entries for **%d**; another single entry wins for %d; the exact match is not a "
      "full shape match for %d (pattern decodes differently with wildcards, e.g. a wildcarded opcode or ModRM byte)." % (
          v1["full_unique_is_exact"], v1["full_ties"], v1["full_unique_other"], v1["exact_not_full"]))
    w("  So a shape match alone is unique only about half the time: the ret check and the independent checks carry the rest.")
    w("- Wrong tops: " + "; ".join("%s exact %s, top %s (%d insns)" % tuple(x) for x in v1["wrong"]) + "\n")
    w("- `ret` audit of the exact matches against their declarations: %s. The disagreements are listed in section 4.\n" % v1["ret"])
    v2 = stats["validation_drift"]
    w("### 1b. On drifted signatures whose function this build names another way\n")
    w("Signatures with n != 1 whose function is known from the hook table (reg/asm), the game's Lua registration, or the class's "
      "RTTI vtable slot. Each was graded with that source switched off. Correct = the graded (or, for C, top-listed) address is the known one.\n")
    w("| grade | correct / graded |\n|---|---|")
    for g in "ABCX":
        if g in v2["by_grade"]:
            w("| %s | %d / %d |" % (g, v2["by_grade"][g]["correct"], v2["by_grade"][g]["n"]))
    w("")
    wrong = [c for c in v2["cases"] if c["grade"] in "AB" and not c["correct"]]
    if wrong:
        w("Wrong A/B in this set: " + "; ".join("%s graded %s %s, truth %s (%s)" % (c["key"], c["grade"], c["picked"], c["truth"], c["src"]) for c in wrong) + "\n")
    listed = sum(1 for c in v2["cases"] if c.get("truth_listed"))
    w("The known address is among the listed candidates for %d of %d.\n" % (listed, len(v2["cases"])))
    w("### 1c. The 'near' check\n")
    w("Distance from a function to the nearest other function of the same .zhl file located by an exact match whose ret agrees "
      "(%d true pairs), against the same distance for random entries (%d draws):\n" % (stats["true_pairs"], stats["random_pairs"]))
    w("| window | true functions within | random entries within |\n|---|---|---|")
    for c in stats["near_calibration"]:
        w("| %s | %.1f%% | %.2f%% |" % (c["window"], 100 * c["true_rate"], 100 * c["random_rate"]))
    w("\nCounted as an independent check within %s.\n" % stats["near_window"])
    w("## 2. Grades\n")
    gc = collections.Counter(v["grade"] for v in res.values())
    zero = collections.Counter(v["grade"] for v in res.values() if v["n_exact"] == 0)
    many = collections.Counter(v["grade"] for v in res.values() if v["n_exact"] > 1)
    aud = collections.Counter(v["grade"] for v in res.values() if v["n_exact"] == 1)
    w("| | A | B | C | X | total |\n|---|---|---|---|---|---|")
    for lab, c in (("all graded", gc), ("no exact match (n=0)", zero), ("ambiguous (n>1)", many), ("exact once but failed the audit", aud)):
        w("| %s | %d | %d | %d | %d | %d |" % (lab, c["A"], c["B"], c["C"], c["X"], sum(c.values())))
    w("\nA = unique candidate, >= 6 instructions, ret agrees, plus vtable / Lua registration / hook table / near. "
      "B = unique and ret agrees only. C = several candidates or unconfirmed. X = nothing credible.\n")
    # ---- Fiend Folio subset
    w("## 3. Fiend Folio's callbacks that were not located\n")
    w("Ordered by uses in the mod. 'located before' = `ff_callbacks.json` already had an address. For a whole-function hook the "
      "grade is this tool's; for a mid-function patch see asm-patches-17.json.\n")
    w("| callback | uses | function / patch | grade | VA | evidence |\n|---|---|---|---|---|---|")
    ffg = collections.Counter()
    seen_fn = {}
    for cb in sorted(ff, key=lambda c: -c["n"]):
        for h in cb["hooks"]:
            fn = h["fn"]
            if fn.startswith("("):
                pname = fn.strip("()")
                p = patches.get(pname)
                if not p:
                    w("| %s | %d | %s | - | - | not in the survey |" % (cb["name"], cb["n"], fn))
                    continue
                parts = []
                for s in p["sites"]:
                    parts.append("%s: %s%s" % (s["sig_name"], s["status"][:90], (" spot %s in fn %s" % (s.get("spot_va"), s.get("fn_va"))) if s.get("spot_va") else ""))
                for hm in p.get("hook_methods") or []:
                    parts.append("hook %s (%s): %s" % (hm["fn"], hm["when"], ("%s, %s" % (hm["va_17"], hm["source"])) if hm["va_17"] else "not located"))
                ok = all(s.get("spot_va") for s in p["sites"]) and all(hm["va_17"] for hm in (p.get("hook_methods") or []))
                g = "located" if ok else ("partly" if any(s.get("spot_va") for s in p["sites"]) or any(hm["va_17"] for hm in (p.get("hook_methods") or [])) else "open")
                ffg["patch " + g] += 1
                w("| %s | %d | %s (%s) | %s | - | %s |" % (cb["name"], cb["n"], fn, p["kind"], g, " / ".join(parts)[:900].replace("|", "/")))
                continue
            if h.get("va"):
                note = ""
                keys = by_cm.get(fn, [])
                a = next((audit[k] for k in keys if k in audit), None)
                if a and (a["ret"] == "disagree" or (a["reg"] and "DIFFERS" in a["reg"])):
                    note = "**exact match FAILS the audit**: %s %s" % (a["why"], a["reg"] or "")
                    ffg["located before, fails audit"] += 1
                else:
                    ffg["located before"] += 1
                    continue
                w("| %s | %d | %s | audit | %s | %s |" % (cb["name"], cb["n"], fn, h["va"], note))
                continue
            keys = by_cm.get(fn, [])
            rr = [res[k] for k in keys if k in res]
            known = fnmap.get(fn)
            ksrc = fnmap.get("src|%d" % int(known, 16), "") if known else ""
            if not known and "::" in fn:
                c, m = fn.rsplit("::", 1)
                kr = fnmap.get("reg|%s|%s" % (c.replace("_", "").lower(), m.lower()))
                if kr and not (0x00860000 <= int(kr, 16) < 0x008a0000):
                    known, ksrc = kr, "the game's Lua registration"
            if known and ksrc.startswith("fuzzy"):
                known = None
            if known:
                ffg["already known"] += 1
                w("| %s | %d | %s | known | %s | already resolved in this build by: %s |" % (cb["name"], cb["n"], fn, known, ksrc or "?"))
                continue
            if not rr:
                ffg["no signature"] += 1
                w("| %s | %d | %s | - | - | no ZHL signature for it |" % (cb["name"], cb["n"], fn))
                continue
            x = rr[0]
            ffg[x["grade"]] += 1
            ev = "; ".join(x["evidence"][:4]) if x["va"] else "; ".join(x["why"][:2]) + ("; top: " + ", ".join(
                "%s (%s, ret %s)" % (c["va"], c["how"], c["ret"]) for c in x["candidates"][:3]) if x["candidates"] else "")
            w("| %s | %d | %s | %s | %s | %s |" % (cb["name"], cb["n"], fn, x["grade"], x["va"] or "-", ev[:600].replace("|", "/")))
    w("\nFiend Folio subset counts: %s\n" % dict(ffg))
    # ---- audit failures
    w("## 4. Exact matches that fail the audit (need a human decision)\n")
    w("| signature | VA | ret | Lua registration / hook table |\n|---|---|---|---|")
    for k, a in sorted(audit.items()):
        if a["ret"] == "disagree" or (a["reg"] and "DIFFERS" in a["reg"]):
            w("| %s | %s | %s | %s |" % (k, a["va"], a["why"][:120], a["reg"] or ""))
    man = out / "manual-17.json"
    if man.is_file():
        w("\n## 5. Findings made by hand (not by the matcher)\n")
        for k, v in json.load(open(man)).items():
            w("### %s\n" % k)
            for line in v:
                w("- " + line)
            w("")
    (out / "report.md").write_text("\n".join(L) + "\n", encoding="utf8")
    print("wrote", out / "report.md")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", default=str(ROOT / ".scratch" / "rgon" / "fuzzy"))
    ap.add_argument("--ghidra", default=str(DEFAULT_GHIDRA))
    ap.add_argument("--rebuild-cache", action="store_true")
    ap.add_argument("--report-only", action="store_true", help="only rewrite report.md from the JSON outputs")
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if args.report_only:
        write_report(out)
        return 0

    exe = Exe(args.ghidra, out / "entries.pickle", args.rebuild_cache)
    print("entries: %d (lift %d, ghidra %d)" % (len(exe.entries), exe.n_lift, exe.n_ghidra))
    # inverted index of abstract tokens over each entry's first 48 instructions (tier-2 prefilter)
    import numpy as np
    eidx = {e: k for k, e in enumerate(exe.entries)}
    inv = collections.defaultdict(list)
    for e in exe.entries:
        for t in set(token(c) for c in exe.dec.get(e, [])[:48]):
            inv[t].append(eidx[e])
    inv = {t: np.array(v, dtype=np.int32) for t, v in inv.items()}
    import math
    N = len(exe.entries)
    for t, v in inv.items():
        IDF_T[t] = math.log(N / (1.0 + len(v)))
    bdf = collections.Counter()
    for e in exe.entries:
        for b in set(c[2] for c in exe.dec.get(e, [])[:48]):
            bdf[b] += 1
    for b, c in bdf.items():
        IDF_B[b] = math.log(N / (1.0 + c))
    idf_arr = {t: IDF_T[t] for t in inv}

    vts = rtti_vtables(exe)
    fn_slots = collections.defaultdict(list)
    for cls, lst in vts.items():
        for (vt, off, slots) in lst:
            for s, fn in enumerate(slots):
                fn_slots[fn].append((cls, off, s))
    reg, hooks = load_anchors()
    cat = read_catalogue()
    z17 = json.load(open(ROOT / ".scratch" / "rgon" / "zhl-17.json"))
    agree = sum(1 for r in cat if r["key"] in z17 and z17[r["key"]]["file"] == r["file"] and z17[r["key"]]["decl"] == r["decl"])
    print("catalogue: %d signatures, %d keyed as in zhl-17.json" % (len(cat), agree))

    def exact_hits(pattern):
        rx = re.compile(b"".join(b"." if pattern[k:k + 2] == "??" else re.escape(bytes([int(pattern[k:k + 2], 16)]))
                                 for k in range(0, len(pattern), 2)), re.S)
        return [exe.text.va + m.start() for m in rx.finditer(exe.tbuf)]

    for r in cat:
        r["exact"] = exact_hits(r["pattern"])
        r["sig"], r["covered"] = decode_pattern(r["pattern"])
        r["n_insn"] = sum(1 for s in r["sig"] if not s["trunc"])

    def tier1(r):
        sig = r["sig"]
        if not sig:
            return []
        first = sig[0]
        pool = exe.by_mnem.get(first["rec"][4], []) if (first["loose"] or first["trunc"]) else exe.by_first.get(first["rec"][1], [])
        res = [(score(sig, exe.dec[e]), e) for e in pool]
        res.sort(key=lambda t: (not t[0][0], -t[0][1], t[0][2], -t[0][3]))
        return res

    def tier2(r, extra=()):
        sig = [si for si in r["sig"] if not si["trunc"]]
        if not sig:
            return []
        acc = np.zeros(len(exe.entries), dtype=np.float64)
        for t in set(token(si["rec"]) for si in sig if not si["loose"]):
            if t in inv:
                acc[inv[t]] += idf_arr[t]
        top = set(int(k) for k in np.argsort(-acc, kind="stable")[:300])
        pool = set(exe.entries[k] for k in top) | set(extra)
        res = []
        for e in pool:
            if exe.dec.get(e):
                sc, cov = align(r["sig"], exe.dec[e])
                if cov >= 0.75:
                    res.append((sc, e))
        res.sort(key=lambda t: -t[0])
        return res

    def ret_check(r, va):
        acc, notes = expected_pops(r)
        rs, span = exe.rets(va)
        if acc is None:
            return "unknown", "declaration: " + "; ".join(notes), None
        if not rs:
            return "unknown", "no ret reached from the entry (%d instructions walked)" % span, acc
        exp = "/".join("0x%x" % a for a in sorted(acc)) + ((" (" + "; ".join(notes) + ")") if notes else "")
        if len(rs) == 1:
            got = next(iter(rs))
            return ("agree" if got in acc else "disagree"), "ret 0x%x, declaration pops %s" % (got, exp), acc
        if rs & acc:
            return "mixed", "rets %s (body range may include a neighbour), declaration pops %s" % (sorted(rs), exp), acc
        return "disagree", "rets %s, declaration pops %s" % (sorted(rs), exp), acc

    # ---- validation 1 on the exact-once set, and the audit of those matches
    val = {"n": 0, "top_is_exact": 0, "full_unique_is_exact": 0, "full_unique_other": 0, "full_ties": 0,
           "exact_not_full": 0, "tier2_top_is_exact": 0, "ret": collections.Counter(), "wrong": []}
    audit = {}
    located = {}
    by_file_anchor = collections.defaultdict(list)
    for r in cat:
        if len(r["exact"]) != 1:
            continue
        va = r["exact"][0]
        val["n"] += 1
        cs = tier1(r)
        full = [e for s, e in cs if s[0]]
        if cs and cs[0][1] == va:
            val["top_is_exact"] += 1
        else:
            val["wrong"].append((r["key"], "0x%08x" % va, "0x%08x" % cs[0][1] if cs else None, r["n_insn"]))
        if full == [va]:
            val["full_unique_is_exact"] += 1
        elif len(full) == 1:
            val["full_unique_other"] += 1
        elif va in full:
            val["full_ties"] += 1
        else:
            val["exact_not_full"] += 1
        st, why, acc = ret_check(r, va)
        val["ret"][st] += 1
        rv = reg_lookup(reg, r["class"], r["method"])
        hn = "%s::%s" % (r["class"], r["method"])
        regnote = None
        if hn in hooks:
            regnote = "hook table %s 0x%08x %s" % (hooks[hn][1], hooks[hn][0], "agrees" if hooks[hn][0] == va else "DIFFERS")
        elif rv:
            regnote = "Lua registration %s %s" % (",".join("0x%08x" % x for x in sorted(rv)), "agrees" if va in rv else "differs")
        audit[r["key"]] = {"va": "0x%08x" % va, "ret": st, "why": why, "decl": r["decl"], "relaxed_full_candidates": len(full),
                           "reg": regnote}
        if st == "agree" and not (regnote and ("DIFFERS" in regnote)):
            located[va] = r["key"]
            by_file_anchor[r["file"]].append(va)
    for name, (va, src) in hooks.items():
        located.setdefault(va, name + " (" + src + ")")
    for f in by_file_anchor:
        by_file_anchor[f].sort()

    def nearest(f, va, exclude=None):
        best = None
        for a in by_file_anchor.get(f, []):
            if a == exclude:
                continue
            d = abs(a - va)
            if best is None or d < best[0]:
                best = (d, a)
        return best

    # ---- calibrate 'near'
    true_d = [nb[0] for f, lst in by_file_anchor.items() for va in lst for nb in [nearest(f, va, exclude=va)] if nb]
    import random
    rnd = random.Random(1997017)
    rand_d = []
    files = [f for f in by_file_anchor if len(by_file_anchor[f]) >= 2]
    for _ in range(20000):
        f = rnd.choice(files)
        e = exe.entries[rnd.randrange(len(exe.entries))]
        nb = nearest(f, e)
        if nb and e not in by_file_anchor[f]:
            rand_d.append(nb[0])
    near_cal = []
    for w in [0x200, 0x400, 0x800, 0x1000, 0x2000, 0x4000, 0x10000]:
        near_cal.append((w, sum(1 for d in true_d if d <= w) / max(1, len(true_d)), sum(1 for d in rand_d if d <= w) / max(1, len(rand_d))))
    NEAR_W = max([c for c in near_cal if c[2] <= 0.01] or [near_cal[0]], key=lambda c: c[1])[0]

    def evidence_for(r, va, use=("vtable", "reg", "hook", "near")):
        ev = []
        strong = 0
        st, why, acc = ret_check(r, va)
        ev.append("ret %s: %s" % (st, why))
        vt = r.get("vtable")
        if vt and "vtable" in use:
            prim = [v for v in (vts.get(vt["class"]) or []) if v[1] == 0]
            if prim and vt["slot"] < len(prim[0][2]):
                slotfn = prim[0][2][vt["slot"]]
                if slotfn == va:
                    ev.append("vtable: %s vtable 0x%08x slot %d holds it" % (vt["class"], prim[0][0], vt["slot"]))
                    strong += 1
                else:
                    ev.append("vtable MISMATCH: %s slot %d holds 0x%08x" % (vt["class"], vt["slot"], slotfn))
                    strong -= 10
            else:
                ev.append("vtable: no RTTI vtable for %s" % vt["class"])
        elif fn_slots.get(va):
            ev.append("in vtable(s): " + ", ".join("%s+%d slot %d" % s for s in fn_slots[va][:4]))
        rv = reg_lookup(reg, r["class"], r["method"])
        if rv and "reg" in use:
            if va in rv:
                ev.append("reg: the game's Lua registration binds %s.%s to it" % (r["class"], r["method"]))
                strong += 1
            else:
                ev.append("reg differs: Lua binds %s.%s to %s" % (r["class"], r["method"], ",".join("0x%08x" % x for x in sorted(rv))))
        hname = "%s::%s" % (r["class"], r["method"])
        if hname in hooks and "hook" in use:
            if hooks[hname][0] == va:
                ev.append("hook table (%s) has it" % hooks[hname][1])
                strong += 1
            else:
                ev.append("hook table (%s) has %s at 0x%08x instead" % (hooks[hname][1], hname, hooks[hname][0]))
                strong -= 10
        nb = nearest(r["file"], va, exclude=va)
        if nb:
            ok = nb[0] <= NEAR_W and "near" in use
            ev.append("near: %s 0x%08x (%s) at %d bytes" % ("same-file anchor within 0x%x:" % NEAR_W if ok else "nearest same-file anchor",
                                                           nb[1], located.get(nb[1], "?"), nb[0]))
            if ok:
                strong += 1
        cl = sorted(set(located.get(c) for c in exe.callers.get(va, ()) if c in located))
        ce = sorted(set(located.get(c) for c in (exe.g.get(va, {}).get("callees") or []) if c in located))
        if cl or ce:
            ev.append("calls: called by %s; calls %s" % (cl[:4] or "-", ce[:4] or "-"))
        toks = [t for t in re.split(r"[^A-Za-z]+", r["method"] or "") if len(t) >= 5]
        named = [s for s in exe.strings_in(va) if any(t.lower() in s.lower() for t in toks)][:3]
        if named:
            ev.append("strings: " + " | ".join(named))
        a, b = exe.extent(va)
        ev.append("size: %d bytes" % (b - a))
        return ev, st, strong

    T2_SCORE, T2_MARGIN = None, 0.15             # pick the alignment top when it leads the next by 15% of its score

    def locate(r, use=("vtable", "reg", "hook", "near")):
        cs = tier1(r)
        full = [(s, e) for s, e in cs if s[0]]
        why = []
        if r.get("commented"):
            why.append("signature is inside a /* */ comment in REPENTOGON")
        weak_sig = r["n_insn"] < MIN_INSNS
        pick, method = None, None
        cand_rows = []
        if len(full) == 1:
            pick, method = full[0][1], "shape"
        t2 = tier2(r, extra=[e for _, e in full[:20]])
        # a candidate whose ret contradicts the declaration is dropped from tier 2 (counted)
        t2_ok, t2_dropped = [], 0
        for sc, e in t2[:40]:
            st = ret_check(r, e)[0]
            if st == "disagree":
                t2_dropped += 1
                continue
            t2_ok.append((sc, e))
        # a unique shape match stands only if the alignment (which also sees drifted, non-shape
        # candidates) agrees that it is the best; measured: picking the one shape match whose ret
        # agrees among several was right 3 times in 8 on the drift set, so that rule is not used
        if pick is not None and t2_ok and t2_ok[0][1] != pick:
            sc_pick = next((sc for sc, e in t2_ok if e == pick), 0.0)
            if t2_ok[0][0] - sc_pick > 0.02 * max(t2_ok[0][0], 1e-9):
                why.append("unique shape match 0x%08x is not the alignment top (0x%08x %.1f vs %.1f)" % (pick, t2_ok[0][1], t2_ok[0][0], sc_pick))
                pick, method = None, None
        if pick is None and t2_ok:
            top = t2_ok[0][0]
            second = t2_ok[1][0] if len(t2_ok) > 1 else 0.0
            if top > 0 and (top - second) >= T2_MARGIN * top:
                pick, method = t2_ok[0][1], "align %.1f, next %.1f" % (top, second)
        if full:
            rows_src = [(e, "shape", s) for s, e in full[:8]]
        else:
            rows_src = []
        for sc, e in t2_ok[:5]:
            if e not in [x[0] for x in rows_src]:
                rows_src.append((e, "align %.1f" % sc, None))
        if pick is not None and pick not in [x[0] for x in rows_src]:
            rows_src.insert(0, (pick, method, None))
        for e, how, s in rows_src[:10]:
            ev, st, strong = evidence_for(r, e, use)
            row = {"va": "0x%08x" % e, "how": how, "ret": st, "strong": strong, "evidence": ev}
            if s:
                row.update(matched=s[1], of=r["n_insn"], soft=s[2], exact_bytes=s[3])
            cand_rows.append(row)
        grade, va = "X", None
        # 'near' only discriminates when the runner-up is not near as well
        if pick is not None:
            others = [c for c in cand_rows if c["va"] != "0x%08x" % pick]
            prow0 = next((c for c in cand_rows if c["va"] == "0x%08x" % pick), None)
            if (prow0 and others and any("same-file anchor within" in e for e in prow0["evidence"])
                    and any("same-file anchor within" in e for e in others[0]["evidence"])):
                prow0["strong"] -= 1
                prow0["evidence"].append("near does not discriminate: the runner-up %s is near an anchor too" % others[0]["va"])
        if pick is not None:
            prow = next((c for c in cand_rows if c["va"] == "0x%08x" % pick), None)
            if prow is None:
                ev, st, strong = evidence_for(r, pick, use)
                prow = {"va": "0x%08x" % pick, "how": method, "ret": st, "strong": strong, "evidence": ev}
                cand_rows.insert(0, prow)
            if prow["ret"] == "disagree" or prow["strong"] < 0:
                grade = "X" if len(full) <= 1 and not t2_ok else "C"
                why.append("the picked candidate (%s) fails a check" % method)
            elif weak_sig:
                grade = "C"
                why.append("signature too short (%d instructions) to call a unique match" % r["n_insn"])
            elif prow["ret"] == "agree" and prow["strong"] >= 1:
                grade, va = "A", prow["va"]
            elif prow["ret"] == "agree":
                grade, va = "B", prow["va"]
            else:
                grade = "C"
                why.append("picked by %s but ret is %s" % (method, prow["ret"]))
            why.append("picked by %s" % method)
        elif cand_rows:
            grade = "C"
            why.append("%d shape matches; alignment top %s" % (len(full), ", ".join("%s %s" % (c["va"], c["how"]) for c in cand_rows[:3])))
        else:
            why.append("no candidate")
        if t2_dropped:
            why.append("%d alignment candidates dropped because their ret contradicts the declaration" % t2_dropped)
        return {"va": va, "grade": grade, "decl": r["decl"], "file": r["file"], "n_exact": len(r["exact"]),
                "n_shape": len(full), "sig_insns": r["n_insn"], "why": why,
                "evidence": next((c["evidence"] for c in cand_rows if c["va"] == va), []) if va else [],
                "candidates": cand_rows, **({"vtable_slot": r["vtable"]} if r.get("vtable") else {})}

    # ---- validation 2: signatures that no longer match, whose function this build names some other way
    drift = []
    for r in cat:
        if len(r["exact"]) == 1:
            continue
        truth, src = None, None
        hn = "%s::%s" % (r["class"], r["method"])
        rv = reg_lookup(reg, r["class"], r["method"])
        if hn in hooks:
            truth, src = hooks[hn][0], "hook"
        elif rv and len(rv) == 1 and not (0x00860000 <= next(iter(rv)) < 0x008a0000):
            truth, src = next(iter(rv)), "reg"          # (an address in the Lua glue range is a wrapper, not used)
        elif r.get("vtable"):
            prim = [v for v in (vts.get(r["vtable"]["class"]) or []) if v[1] == 0]
            if prim and r["vtable"]["slot"] < len(prim[0][2]):
                truth, src = prim[0][2][r["vtable"]["slot"]], "vtable"
        if truth is None:
            continue
        res = locate(r, use=tuple(u for u in ("vtable", "reg", "hook", "near") if u not in ({"hook", "reg"} if src != "vtable" else {"vtable"})))
        drift.append({"key": r["key"], "truth": "0x%08x" % truth, "src": src, "grade": res["grade"],
                      "picked": res["va"] or (res["candidates"][0]["va"] if res["candidates"] else None),
                      "listed": [c["va"] for c in res["candidates"]], "why": res["why"]})
    dstat = collections.defaultdict(lambda: [0, 0])
    for d in drift:
        ok = d["picked"] == d["truth"]
        dstat[d["grade"]][0] += ok
        dstat[d["grade"]][1] += 1
        d["correct"] = ok
        d["truth_listed"] = d["truth"] in d["listed"]

    # ---- grade every signature that is not an exact unique match (and exact matches failing the audit)
    results = {}
    for r in cat:
        a = audit.get(r["key"])
        is_audit_fail = len(r["exact"]) == 1 and a and (a["ret"] == "disagree" or (a["reg"] and "DIFFERS" in a["reg"]))
        if len(r["exact"]) == 1 and not is_audit_fail:
            continue
        res = locate(r)
        if is_audit_fail:
            res["exact_but_failed_audit"] = a
        results[r["key"]] = res

    # ---- conflicts: an address already named by an exact match, the hook table or the Lua registration,
    # or picked for two different functions, is not a unique answer for either
    claimed = {}
    for va, name in located.items():
        claimed[va] = name.split(" (")[0]
    for (cls, meth), vas in reg.items():
        for va in vas:
            if not (0x00860000 <= va < 0x008a0000):
                claimed.setdefault(va, "Lua %s.%s" % (cls, meth))
    picked = collections.defaultdict(set)
    for key, res in results.items():
        if res["va"]:
            r = next(x for x in cat if x["key"] == key)
            picked[res["va"]].add("%s::%s" % (r["class"], r["method"]))
    n_conf = 0
    for key, res in results.items():
        if not res["va"]:
            continue
        r = next(x for x in cat if x["key"] == key)
        me = "%s::%s" % (r["class"], r["method"])
        va = int(res["va"], 16)
        owner = claimed.get(va)
        why = None
        same_method = owner and re.split(r"::|\.", owner.split("#")[0])[-1].lower() == (r["method"] or "").lower()
        if owner and owner.split("#")[0] != me and not same_method:
            why = "address already belongs to %s" % owner
        elif len(picked[res["va"]]) > 1:
            why = "address also picked for %s" % ", ".join(sorted(picked[res["va"]] - {me}))
        if why:
            n_conf += 1
            res["why"].append("downgraded from %s: %s" % (res["grade"], why))
            res["grade"], res["va"] = "C", None
    print("conflicts downgraded: %d" % n_conf)
    (out / "zhl-fuzzy-17.json").write_text(json.dumps(results, indent=1))
    (out / "exact-audit-17.json").write_text(json.dumps(audit, indent=1))
    stats = {"validation_exact": {k: (dict(v) if isinstance(v, collections.Counter) else v) for k, v in val.items()},
             "validation_drift": {"cases": drift, "by_grade": {g: {"correct": c, "n": n} for g, (c, n) in dstat.items()}},
             "tier2": {"score": T2_SCORE, "margin": T2_MARGIN},
             "near_calibration": [{"window": "0x%x" % w, "true_rate": round(tp, 4), "random_rate": round(fp, 4)} for w, tp, fp in near_cal],
             "near_window": "0x%x" % NEAR_W, "true_pairs": len(true_d), "random_pairs": len(rand_d),
             "grades": dict(collections.Counter(v["grade"] for v in results.values())),
             "entries": len(exe.entries), "entries_lift": exe.n_lift, "entries_ghidra": exe.n_ghidra,
             "catalogue": len(cat), "keyed_as_zhl17": agree}
    (out / "stats.json").write_text(json.dumps(stats, indent=1))
    v = val
    print("validation exact: n=%d top=exact %d; shape-unique=exact %d, shape-unique other %d, ties %d, exact not shape-full %d; ret %s" % (
        v["n"], v["top_is_exact"], v["full_unique_is_exact"], v["full_unique_other"], v["full_ties"], v["exact_not_full"], dict(v["ret"])))
    print("validation drift: %d cases; by grade %s" % (len(drift), {g: "%d/%d" % (c, n) for g, (c, n) in dstat.items()}))
    print("grades:", stats["grades"], "near window 0x%x" % NEAR_W)

    # names this build can resolve, for the patches' enclosing functions and hooked methods
    fnmap = {}

    def put(name, va, src):
        if name and va and name not in fnmap:
            fnmap[name] = va
            fnmap.setdefault(va, name)
            fnmap.setdefault(("src", va), src)
    for name, (va, src) in hooks.items():
        put(name, va, src)
    for cls in ("Entity", "Entity_Player", "Entity_NPC", "Entity_Pickup", "Entity_Tear", "Entity_Familiar", "Entity_Effect",
                "Entity_Bomb", "Entity_Laser", "Entity_Knife", "Entity_Projectile", "Entity_Slot"):
        prim = [v for v in (vts.get(cls) or []) if v[1] == 0]
        if prim:
            for fn, slot in (("Init", 1), ("Update", 3), ("Render", 5), ("TakeDamage", 8)):
                if slot < len(prim[0][2]):
                    put("%s::%s" % (cls, fn), prim[0][2][slot], "vtable 0x%08x slot %d" % (prim[0][0], slot))
    for r in cat:
        k = "%s::%s" % (r["class"], r["method"]) if r["class"] else r["key"]
        a = audit.get(r["key"])
        if a and a["ret"] == "agree" and not (a["reg"] and "DIFFERS" in a["reg"]):
            put(k, int(a["va"], 16), "sig (exact, ret agrees)")
    for key, res in results.items():
        r = next(x for x in cat if x["key"] == key)
        if res["grade"] in ("A", "B") and res["va"]:
            put("%s::%s" % (r["class"], r["method"]) if r["class"] else key, int(res["va"], 16), "fuzzy grade " + res["grade"])
    for (cls, meth), vas in reg.items():
        if len(vas) == 1:
            fnmap.setdefault(("reg", cls, meth), next(iter(vas)))
    json.dump({k if isinstance(k, str) else ("0x%08x" % k if isinstance(k, int) else "|".join(map(str, k))):
               ("0x%08x" % v if isinstance(v, int) else v) for k, v in fnmap.items()}, open(out / "fnmap.json", "w"), indent=0)
    survey_p = out / "asm-survey.json"
    if survey_p.is_file():
        locate_patches(exe, json.load(open(survey_p)), out, exact_hits, fnmap)
    write_report(out)
    return 0


def relaxed_regex(pattern):
    """Regex over .text bytes: the pattern with every displacement / immediate / rel32 byte of its decoded
    instructions made a wildcard (same instruction lengths)."""
    sig, covered = decode_pattern(pattern)
    toks = [pattern[k:k + 2] for k in range(0, len(pattern), 2)]
    parts = []
    nvol = 0
    for si in sig:
        r = si["rec"]
        for p in range(r[0]):
            q = si["off"] + p
            if q >= len(toks):
                break
            if toks[q] == "??" or p in r[3] or si["loose"]:
                parts.append(b".")
                nvol += toks[q] != "??"
            else:
                parts.append(re.escape(bytes([int(toks[q], 16)])))
    return re.compile(b"".join(parts), re.S), nvol


def align_in_body(exe, pattern, fn):
    """Slide the decoded pattern along the decoded body of a known function; return [(score, va)] best first."""
    sig, _ = decode_pattern(pattern)
    st = [si for si in sig if not si["trunc"]]
    if not st:
        return []
    gi = exe.g.get(fn)
    end = gi["end"] if gi and gi["ranges"] == 1 else fn + 0x8000
    body = decode(exe.bytes_at(fn, min(end - fn, 0x20000)), fn)
    firsts = set(token(si["rec"]) for si in st[:3] if not si["loose"])
    addr = []
    a = fn
    for r in body:
        addr.append(a)
        a += r[0]
    out = []
    for k in range(len(body)):
        if token(body[k]) not in firsts:
            continue
        sc, cov = align(sig, body[k:k + len(st) + 12], width=8)
        if cov >= 0.75:
            out.append((sc, addr[k]))
    out.sort(key=lambda t: -t[0])
    # keep one entry per address
    seen, res = set(), []
    for sc, va in out:
        if va not in seen:
            seen.add(va)
            res.append((sc, va))
    return res


def locate_patches(exe, survey, out, exact_hits, fnmap):
    rows = {}
    for name, ent in survey.items():
        if name.startswith("_"):
            continue
        sites = []
        for s in ent.get("sites") or []:
            pat = (s.get("pattern") or "").replace(" ", "").lower()
            rec = {"sig_name": s.get("sig_name"), "pattern": pat, "offset": s.get("offset"),
                   "enclosing_fn_12": s.get("enclosing_fn"), "summary": s.get("summary"), "reads": s.get("reads"),
                   "can_skip": s.get("can_skip"), "installer": s.get("installer"), "where": s.get("where")}
            if not pat or not re.fullmatch(r"[0-9a-f?]+", pat) or len(pat) % 2:
                rec.update(status="no usable pattern")
                sites.append(rec)
                continue
            hits = exact_hits(pat)
            how = "exact"
            if len(hits) != 1:
                rx, nvol = relaxed_regex(pat)
                rh = [exe.text.va + m.start() for m in rx.finditer(exe.tbuf)]
                if len(hits) == 0:
                    hits, how = rh, "relaxed (disp/imm/rel32 bytes wildcarded: %d more)" % nvol
                else:
                    how = "exact, %d hits" % len(hits)
            info = []
            for h in hits[:8]:
                _, ok = exe.on_boundary(h)
                gf = exe.ghidra_function_of(h)
                spot = h + (s.get("offset") or 0)
                info.append({"match": "0x%08x" % h, "spot": "0x%08x" % spot, "fn": "0x%08x" % gf if gf else None,
                             "fn_name": fnmap.get(gf) if gf else None, "insn_boundary": ok,
                             "disasm": "; ".join("%s %s" % (i.mnemonic, i.op_str) for i in list(MD.disasm(exe.bytes_at(spot, 24), spot))[:3])})
            good = [i for i in info if i["insn_boundary"]]
            want = s.get("enclosing_fn")
            want_va = resolve_name(fnmap, want)
            in_want = [i for i in good if want_va and i["fn"] == "0x%08x" % want_va]
            if len(hits) == 1 and good:
                status = "located (%s)" % how
                pickh = good[0]
            elif len(in_want) == 1:
                status = "located (%s; the one hit inside %s 0x%08x)" % (how, want, want_va)
                pickh = in_want[0]
            elif len(good) == 1 and len(hits) <= 8:
                status = "located (%s; only one of %d hits is on an instruction boundary)" % (how, len(hits))
                pickh = good[0]
            else:
                pickh = None
                status = ("ambiguous: %d hits (%s)" % (len(hits), how)) if hits else "not found by bytes"
            if pickh is None and want_va:
                al = align_in_body(exe, pat, want_va)
                if al:
                    top = al[0][0]
                    sec = al[1][0] if len(al) > 1 else 0.0
                    rec["aligned_in_fn"] = [{"va": "0x%08x" % va, "score": round(sc, 2)} for sc, va in al[:4]]
                    if top > 0 and top - sec >= 0.15 * top:
                        pickh = {"spot": "0x%08x" % (al[0][1] + (s.get("offset") or 0)), "fn": "0x%08x" % want_va,
                                 "match": "0x%08x" % al[0][1], "fn_name": fnmap.get(want_va)}
                        status = "located (aligned inside %s 0x%08x: score %.1f, next %.1f; bytes differ, re-derive the patch)" % (
                            want, want_va, top, sec)
                    else:
                        status += "; best alignment inside %s 0x%08x %.1f (next %.1f): not conclusive" % (want, want_va, top, sec)
            elif pickh is None and want:
                status += "; enclosing function %s not located in this build" % want
            rec.update(status=status, hits=info, n_hits=len(hits))
            if pickh:
                rec.update(spot_va=pickh["spot"], fn_va=pickh["fn"], fn_name=pickh.get("fn_name"))
                if want_va and pickh["fn"] and pickh["fn"] != "0x%08x" % want_va:
                    if exe.reaches(want_va, int(pickh["match"], 16)):
                        rec["fn_check"] = ("spot is reached from %s 0x%08x by direct branches (Ghidra cut that function "
                                           "at %s)" % (want, want_va, pickh["fn"]))
                        rec["fn_va"] = "0x%08x" % want_va
                    else:
                        rec["fn_check"] = ("spot is NOT reached from %s as located (0x%08x) by direct branches "
                                           "(jump tables are not followed, so this is not proof)" % (want, want_va))
                elif want_va:
                    rec["fn_check"] = "spot is inside %s as located (0x%08x)" % (want, want_va)
                elif pickh.get("fn"):
                    owner = fnmap.get(int(pickh["fn"], 16))
                    rec["fn_check"] = "%s not located; the spot's Ghidra function 0x%s is %s" % (
                        want or "enclosing function", pickh["fn"][2:], owner or "unnamed in this build")
            sites.append(rec)
        hm = []
        for h in ent.get("hook_methods") or []:
            va = resolve_name(fnmap, h.get("fn"))
            hm.append({**h, "va_17": "0x%08x" % va if va else None, "source": fnmap.get(("src", va)) if va else None})
        rows[name] = {"kind": ent.get("kind"), "callbacks": ent.get("callbacks"), "hook_methods": hm,
                      "sites": sites, "notes": ent.get("notes")}
    (out / "asm-patches-17.json").write_text(json.dumps(rows, indent=1))
    c = collections.Counter(s["status"].split(" (")[0].split(":")[0].split(";")[0] for r in rows.values() for s in r["sites"])
    print("patch sites:", dict(c))


def resolve_name(fnmap, name):
    if not name:
        return None
    if name in fnmap:
        return fnmap[name]
    if "::" in name:
        c, m = name.rsplit("::", 1)
        v = fnmap.get(("reg", c.replace("_", "").lower(), m.lower()))
        if v and not (0x00860000 <= v < 0x008a0000):
            fnmap.setdefault(("src", v), "Lua registration")
            return v
    if "::" not in name:
        hits = [v for k, v in fnmap.items() if isinstance(k, str) and k.endswith("::" + name)]
        if len(set(hits)) == 1:
            return hits[0]
    return None


if __name__ == "__main__":
    sys.exit(main())
