"""Does the oracle agree with work that is already known to be correct?

Three independent checks, deliberately chosen so a single common-mode bug
cannot pass all three:

  A. MT19937 core inside Isaac::genrand_int32 (0x006eef60) against the
     REFERENCE Mersenne Twister.  This is external ground truth -- the
     mt19937ar reference output for seed 5489 does not come from this repo,
     so it validates the emulator itself, not just self-consistency.

  B. std::string tidy/deallocate 0x0040d040 against the hand-verified model
     `frameOpaque40d040TidyPlan` (scripts/decomp/frame-opaque-pure-model.mjs).

  C. std::map<string,...>::lower_bound 0x00685bc0 against the hand-verified
     model `exitMapLowerBound` (scripts/decomp/exit-pure-model.mjs), on
     randomised red-black trees built in the shared low arena so the oracle
     and the JS DataView see byte-identical memory at identical addresses.

B and C shell out to node; the JS models are the SECOND independent
implementation the project already trusts, so agreement is a real cross-check
rather than the oracle grading its own homework.
"""

from __future__ import annotations

import json
import os
import random
import struct
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cfg as cfgmod            # noqa: E402
import crtmodels               # noqa: E402
import emu as emumod           # noqa: E402
import peimage                 # noqa: E402

OUT = os.path.join(peimage.REPO_ROOT, "output", "recomp", "oracle")
ARENA = emumod.ARENA_BASE

GENRAND_VA = 0x006EEF60
GENRAND_PURE_END = 0x006EF0B2      # after tempering, before the trace recorder
TIDY_VA = 0x0040D040
LOWER_BOUND_VA = 0x00685BC0


# ---------------------------------------------------------------------------
# A. MT19937 vs the reference implementation
# ---------------------------------------------------------------------------

class RefMT:
    """mt19937ar reference (Matsumoto/Nishimura), init_genrand + genrand_int32."""
    N, M = 624, 397
    MATRIX_A = 0x9908B0DF
    UPPER, LOWER = 0x80000000, 0x7FFFFFFF

    def __init__(self, seed: int):
        self.mt = [0] * self.N
        self.mt[0] = seed & 0xFFFFFFFF
        for i in range(1, self.N):
            self.mt[i] = (1812433253 * (self.mt[i - 1] ^ (self.mt[i - 1] >> 30))
                          + i) & 0xFFFFFFFF
        self.mti = self.N

    def next(self) -> int:
        if self.mti >= self.N:
            mag01 = [0, self.MATRIX_A]
            mt = self.mt
            for kk in range(self.N - self.M):
                y = (mt[kk] & self.UPPER) | (mt[kk + 1] & self.LOWER)
                mt[kk] = mt[kk + self.M] ^ (y >> 1) ^ mag01[y & 1]
            for kk in range(self.N - self.M, self.N - 1):
                y = (mt[kk] & self.UPPER) | (mt[kk + 1] & self.LOWER)
                mt[kk] = mt[kk + (self.M - self.N)] ^ (y >> 1) ^ mag01[y & 1]
            y = (mt[self.N - 1] & self.UPPER) | (mt[0] & self.LOWER)
            mt[self.N - 1] = mt[self.M - 1] ^ (y >> 1) ^ mag01[y & 1]
            self.mti = 0
        y = self.mt[self.mti]
        self.mti += 1
        y ^= (y >> 11)
        y ^= (y << 7) & 0x9D2C5680
        y ^= (y << 15) & 0xEFC60000
        y ^= (y >> 18)
        return y & 0xFFFFFFFF


def check_mt19937(o: emumod.Oracle, n: int = 64) -> dict:
    c = cfgmod.recover(o.pe, GENRAND_VA)
    fb = frozenset(c.blocks)
    o.reset_image()
    got, pure = [], 0
    for _ in range(n):
        r = o.call(GENRAND_VA, cc="cdecl", func_blocks=fb,
                   until=GENRAND_PURE_END)
        if r.term != "ret":
            return {"name": "mt19937", "ok": False,
                    "detail": f"draw {len(got)} term={r.term} "
                              f"fault={r.fault_va} {r.fault_kind}"}
        got.append(r.regs["ecx"])            # tempered value lives in ECX
        if r.pure:
            pure += 1
    ref = RefMT(5489)                        # PE seeds 5489 when mti == N+1
    want = [ref.next() for _ in range(n)]
    ok = got == want
    first_bad = next((i for i in range(n) if got[i] != want[i]), None)
    return {
        "name": "mt19937 core @0x006eef60 vs reference mt19937ar(seed=5489)",
        "ok": ok,
        "n": n,
        "pure_vectors": pure,
        "first_8_oracle": [f"{v:#010x}" for v in got[:8]],
        "first_8_reference": [f"{v:#010x}" for v in want[:8]],
        "first_mismatch": first_bad,
    }


# ---------------------------------------------------------------------------
# B. 0x0040d040 std::string tidy
# ---------------------------------------------------------------------------

def check_tidy(o: emumod.Oracle, n: int = 400, seed: int = 7) -> dict:
    """PE 0x0040d040 (see disassembly):

        ecx = cap;            if ecx <  0x10   -> reset only          (SSO)
        eax = payload; ecx++; if ecx <  0x1000 -> free(payload, ecx)  (small)
        edx = [payload-4];    ecx += 0x23                             (aligned)
        if (uint)(payload-edx-4) > 0x1f -> _invalid_parameter_noinfo_noreturn
        free(edx, ecx); then reset size=0, cap=0xf, buf[0]=0

    So [payload-4] holds the ALLOCATION HEADER POINTER, and the guard is on
    `payload - header - 4`.  The harness therefore has to plant a real header
    pointer, and must expect the invalid branch to abort before the resets.
    """
    c = cfgmod.recover(o.pe, TIDY_VA)
    fb = frozenset(c.blocks)
    rng = random.Random(seed)
    # cover: SSO / small-free / aligned-valid / aligned-invalid
    caps = [0, 1, 0xE, 0xF, 0x10, 0x11, 0x1F, 0x20, 0xFFE, 0xFFF, 0x1000,
            0x1001, 0x2000, 0xFFFFFFFF]
    deltas_valid = [4, 5, 8, 0x10, 0x20, 0x23]
    deltas_bad = [0, 1, 3, 0x24, 0x30, 0x100]
    cases, obs = [], []
    for i in range(n):
        cap = (caps[i % len(caps)] if i < len(caps) * 3
               else rng.choice(caps + [rng.getrandbits(16),
                                       rng.getrandbits(32)]))
        size = rng.randrange(0, 32)
        delta = rng.choice(deltas_valid + deltas_bad)
        # payload only needs [payload-0x100 .. payload+0x40) mapped; the
        # function never touches the payload bytes themselves.
        buf = o.alloc(0x40, b"Z" * 0x40, pad_before=0x100)
        header = (buf - delta) & 0xFFFFFFFF
        o.write(buf - 4, struct.pack("<I", header))
        obj = o.alloc(0x18, struct.pack("<I", buf) + b"\0" * 0x0C +
                      struct.pack("<II", size, cap))
        r = o.call(TIDY_VA, cc="thiscall", ecx=obj, func_blocks=fb)
        after = o.read(obj, 0x18)
        # The model describes what 0x0040d040 hands to the raw release
        # 0x00aef15c -- NOT what eventually reaches the CRT `free`, which is
        # 4 bytes lower because the CRT's own header adjustment runs in
        # between.  Compare at the boundary the model actually models.
        free_args = next((cr.args for cr in r.calls
                          if cr.target == 0x00AEF15C), None)
        obs.append({
            "cap": cap, "payload": buf, "header": header, "delta": delta,
            "term": r.term,
            "reset_size": struct.unpack_from("<I", after, 0x10)[0],
            "reset_cap": struct.unpack_from("<I", after, 0x14)[0],
            "buf0": after[0],
            "host_free": bool(free_args),
            "free_ptr": free_args[0] if free_args else 0,
            "free_bytes": free_args[1] if free_args else 0,
            "hit_invalid": any("_invalid_parameter" in s for s in r.stubs),
            "pure": r.pure,
        })
        cases.append({"capacity": cap, "payload": buf, "header": header})
        o.restore_dirty(r)
        o.reset_scratch()

    # the JS model takes `header` as the *sampled dword at payload-4*
    js = _node_eval("frame-opaque-pure-model.mjs", """
      const out = [];
      for (const c of CASES) {
        const p = M.frameOpaque40d040TidyPlan(c.capacity, c.payload, c.header);
        out.push({heapUsed:p.heapUsed, hostFree:p.hostFree, freePtr:p.freePtr>>>0,
                  freeBytes:p.freeBytes>>>0, resetSize:p.resetSize,
                  resetCapacity:p.resetCapacity, pureComplete:p.pureComplete,
                  invalid:p.invalid, aligned:p.aligned});
      }
      console.log(JSON.stringify(out));
    """, cases)

    diffs = []
    buckets = {"sso": 0, "small-free": 0, "aligned-free": 0, "invalid": 0}
    for i, (a, b) in enumerate(zip(obs, js)):
        d = {}
        if b["invalid"]:
            buckets["invalid"] += 1
            # PE calls _invalid_parameter_noinfo_noreturn then int3: it must
            # NOT free and must NOT perform the reset stores.
            if not a["hit_invalid"]:
                d["expected_invalid_abort"] = (a["term"], a["stubs"]
                                               if "stubs" in a else None)
            if a["host_free"]:
                d["freed_on_invalid"] = hex(a["free_ptr"])
            if a["reset_cap"] == 0xF and a["reset_size"] == 0:
                d["reset_ran_on_invalid"] = True
        else:
            buckets["sso" if not b["heapUsed"] else
                    ("aligned-free" if b["aligned"] else "small-free")] += 1
            if a["reset_size"] != b["resetSize"]:
                d["reset_size"] = (a["reset_size"], b["resetSize"])
            if a["reset_cap"] != b["resetCapacity"]:
                d["reset_cap"] = (a["reset_cap"], b["resetCapacity"])
            if a["buf0"] != 0:
                d["buf0"] = (a["buf0"], 0)
            if a["host_free"] != b["hostFree"]:
                d["host_free"] = (a["host_free"], b["hostFree"])
            if b["hostFree"] and a["host_free"]:
                if a["free_ptr"] != b["freePtr"]:
                    d["free_ptr"] = (hex(a["free_ptr"]), hex(b["freePtr"]))
                if a["free_bytes"] != b["freeBytes"]:
                    d["free_bytes"] = (hex(a["free_bytes"]),
                                       hex(b["freeBytes"]))
        if d:
            diffs.append({"i": i, "cap": hex(a["cap"]),
                          "delta": a["delta"], **d})
    return {
        "name": "0x0040d040 string tidy vs frameOpaque40d040TidyPlan (JS model)",
        "ok": not diffs, "n": n, "mismatches": len(diffs),
        "path_coverage": buckets,
        "examples": diffs[:5],
        "pure_vectors": sum(1 for a in obs if a["pure"]),
    }


# ---------------------------------------------------------------------------
# C. 0x00685bc0 map lower_bound
# ---------------------------------------------------------------------------

NODE = 0x18 + 0x18      # left/parent/right/colour/isnil header (0x10) + string
# MSVC _Tree node: +0 left, +4 parent, +8 right, +0xc colour, +0xd isnil,
# key (basic_string, 0x18 bytes) at +0x10.
NODE_SIZE = 0x30


def _mk_string(mem: bytearray, at_off: int, s: bytes,
               heap_off: int | None = None):
    """MSVC basic_string: 16-byte union, size at +0x10, capacity at +0x14.

    Both arguments are ARENA OFFSETS.  The pointer written into the object is
    the corresponding VA (ARENA + offset) -- mixing the two silently produced
    wild pointers and 29 spurious faults in the first run of this check.
    """
    if len(s) < 0x10 and heap_off is None:
        mem[at_off:at_off + 0x10] = s + b"\0" * (0x10 - len(s))
        struct.pack_into("<II", mem, at_off + 0x10, len(s), 0xF)
    else:
        assert heap_off is not None
        need = heap_off + len(s) + 1
        if need > len(mem):
            mem.extend(b"\0" * (need - len(mem)))
        mem[heap_off:heap_off + len(s) + 1] = s + b"\0"
        struct.pack_into("<I", mem, at_off, ARENA + heap_off)
        struct.pack_into("<II", mem, at_off + 0x10, len(s), max(len(s), 0x1F))


def _build_tree(rng: random.Random, keys: list[bytes]) -> tuple[bytearray, dict]:
    """Lay out a real ordered BST in a flat arena, MSVC _Tree shape."""
    size = 0x8000
    mem = bytearray(size)
    cur = 0x100
    sentinel = ARENA + cur
    cur += NODE_SIZE
    heap_cur = 0x4000

    keys = sorted(set(keys))
    nodes = []
    for k in keys:
        a = ARENA + cur
        cur += NODE_SIZE
        nodes.append((a, k))

    def place(lo, hi):
        if lo > hi:
            return sentinel
        mid = (lo + hi) // 2
        addr, key = nodes[mid]
        off = addr - ARENA
        left = place(lo, mid - 1)
        right = place(mid + 1, hi)
        struct.pack_into("<III", mem, off, left, sentinel, right)
        mem[off + 0x0C] = rng.randrange(2)      # colour, unread by lower_bound
        mem[off + 0x0D] = 0                     # isnil
        nonlocal heap_cur
        if len(key) >= 0x10:
            _mk_string(mem, off + 0x10, key, heap_cur)
            heap_cur += len(key) + 1 + 8
        else:
            _mk_string(mem, off + 0x10, key)
        return addr

    root = place(0, len(nodes) - 1)
    soff = sentinel - ARENA
    struct.pack_into("<III", mem, soff, sentinel, sentinel, sentinel)
    mem[soff + 0x0C] = 1
    mem[soff + 0x0D] = 1                        # isnil
    _mk_string(mem, soff + 0x10, b"")
    struct.pack_into("<I", mem, soff + 4, root)  # sentinel.parent == root

    map_addr = ARENA + 0x40
    struct.pack_into("<I", mem, 0x40, sentinel)
    out_addr = ARENA + 0x60
    return mem, {"map": map_addr, "out": out_addr, "sentinel": sentinel,
                 "root": root, "heap_cur": heap_cur,
                 "keys": [k.decode() for k in keys]}


def check_lower_bound(o: emumod.Oracle, n: int = 150, seed: int = 11) -> dict:
    c = cfgmod.recover(o.pe, LOWER_BOUND_VA)
    fb = frozenset(c.blocks)
    rng = random.Random(seed)
    alphabet = "abcx"
    cases, obs = [], []
    cov: set[int] = set()
    for _ in range(n):
        nk = rng.randrange(0, 14)
        keys = [("".join(rng.choice(alphabet)
                         for _ in range(rng.randrange(0, 20)))).encode()
                for _ in range(nk)]
        mem, info = _build_tree(rng, keys)
        # search key: sometimes an existing key, sometimes not, sometimes long
        if keys and rng.random() < 0.5:
            sk = rng.choice(keys)
        else:
            sk = ("".join(rng.choice(alphabet)
                          for _ in range(rng.randrange(0, 22)))).encode()
        key_at = 0x80
        if len(sk) >= 0x10:
            _mk_string(mem, key_at, sk, info["heap_cur"] + 0x40)
        else:
            _mk_string(mem, key_at, sk)

        o.reset_arena()
        o.write(ARENA, bytes(mem))
        r = o.call(LOWER_BOUND_VA, cc="thiscall", ecx=info["map"],
                   args=[info["out"], ARENA + key_at], func_blocks=fb)
        cov |= set(r.blocks) & fb
        after = o.read(ARENA + 0x60, 12)
        obs.append({"term": r.term, "eax": r.regs["eax"], "pure": r.pure,
                    "triple": list(struct.unpack("<III", after)),
                    "keys": info["keys"], "sk": sk.decode()})
        cases.append({"mem": bytes(mem).hex(), "base": ARENA,
                      "map": info["map"], "out": info["out"],
                      "key": ARENA + key_at})

    js = _node_eval("exit-pure-model.mjs", """
      const out = [];
      for (const c of CASES) {
        const raw = Buffer.from(c.mem, 'hex');
        const buf = new ArrayBuffer(c.base + raw.length);
        new Uint8Array(buf).set(raw, c.base);
        const view = new DataView(buf);
        const eax = M.exitMapLowerBound(view, c.map, c.out, c.key);
        out.push({eax: eax>>>0,
                  triple: [view.getUint32(c.out,true),
                           view.getUint32(c.out+4,true),
                           view.getUint32(c.out+8,true)]});
      }
      console.log(JSON.stringify(out));
    """, cases)

    diffs = []
    for i, (a, b) in enumerate(zip(obs, js)):
        if a["term"] != "ret":
            diffs.append({"i": i, "term": a["term"]})
        elif a["eax"] != b["eax"] or a["triple"] != b["triple"]:
            diffs.append({"i": i,
                          "oracle": {"eax": hex(a["eax"]),
                                     "triple": [hex(x) for x in a["triple"]]},
                          "model": {"eax": hex(b["eax"]),
                                    "triple": [hex(x) for x in b["triple"]]},
                          "keys": a["keys"], "search": a["sk"]})
    return {
        "name": "0x00685bc0 map lower_bound vs exitMapLowerBound (JS model)",
        "ok": not diffs, "n": n, "mismatches": len(diffs),
        "examples": diffs[:5],
        "pure_vectors": sum(1 for a in obs if a["pure"]),
        "block_coverage": f"{len(cov)}/{c.block_count}",
    }


# ---------------------------------------------------------------------------

def _node_eval(model_file: str, body: str, cases: list) -> list:
    model = os.path.join(peimage.REPO_ROOT, "scripts", "decomp",
                         model_file).replace("\\", "/")
    payload = os.path.join(OUT, "_verify_cases.json")
    os.makedirs(OUT, exist_ok=True)
    with open(payload, "w", encoding="utf-8") as fh:
        json.dump(cases, fh)
    script = os.path.join(OUT, "_verify_run.mjs")
    with open(script, "w", encoding="utf-8") as fh:
        fh.write(f"import * as M from 'file:///{model}';\n")
        fh.write("import {readFileSync} from 'node:fs';\n")
        fh.write(f"const CASES = JSON.parse(readFileSync("
                 f"{json.dumps(payload)}, 'utf8'));\n")
        fh.write(body)
    p = subprocess.run(["node", script], capture_output=True, text=True,
                       cwd=peimage.REPO_ROOT)
    if p.returncode != 0:
        raise RuntimeError(f"node failed:\n{p.stderr[-4000:]}")
    return json.loads(p.stdout.strip().splitlines()[-1])


def main():
    pe = peimage.load()
    o = emumod.Oracle(pe)
    crtmodels.install(o)
    results = []
    for fn in (check_mt19937, check_tidy, check_lower_bound):
        try:
            results.append(fn(o))
        except Exception as e:
            import traceback
            results.append({"name": fn.__name__, "ok": False,
                            "error": f"{type(e).__name__}: {e}",
                            "tb": traceback.format_exc()[-2000:]})
        o.reset_image()
        o.reset_scratch()
        o.reset_arena()
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "verify.json"), "w", encoding="utf-8") as fh:
        json.dump(results, fh, indent=1)
    ok = True
    for r in results:
        ok &= bool(r.get("ok"))
        print(f"[{'PASS' if r.get('ok') else 'FAIL'}] {r.get('name')}")
        for k, v in r.items():
            if k in ("name", "ok"):
                continue
            print(f"        {k}: {v}")
    print("\nALL PASS" if ok else "\nDISAGREEMENT PRESENT")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
