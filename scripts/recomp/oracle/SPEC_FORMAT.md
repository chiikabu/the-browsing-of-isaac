# Writing an oracle spec

A **spec** teaches the oracle how to build valid inputs for one function. You
need one only when the automatic path (`autospec`) does not already reach the
coverage you want. You do **not** need to read the emulator source to write
one.

Measured on 353 happy-tier functions, 60 vectors each, identical seeds, each
technique isolated (`autospec.py --arms ssaraw,ssa,const`, `armsreport.py`):

| input construction | mean block coverage | pure vectors | functions with ≥1 pure |
|---|---|---|---|
| blind (no layout) | 71.7% | 18.1% | 43.3% |
| + SSA layout | 74.7% (**+3.0**) | 42.5% | 56.1% |
| + valid shape instances | 74.6% (**−0.1**) | 42.8% | 55.8% |
| + mined branch constants | 75.0% (**+0.4**) | 42.4% | 56.1% |

**Read the two columns separately, because they say opposite things.**
Automated input construction more than doubles ground-truth *yield*
(18.1% → 42.4% pure vectors) — that part works. It moves block *coverage* by
about three points in total, and neither valid shapes nor mined constants
adds anything beyond noise. Replicated on a second, larger sample (828
functions: constants +0.2 points).

I predicted before measuring that value selection was the remaining lever.
**That prediction is wrong.** Mining the constants a function compares
against — `0x0040d040`'s capacity really is compared against `0xf` and
`0xfff`, and the miner really does find them — changes almost nothing,
because the functions that stay at low coverage are not blocked on a scalar.
They are blocked on **structure**: a `std::map` with several nodes in sorted
order, a populated vector, a specific object graph. `0x00685bc0` sits at 5/12
under every automatic technique and reaches 12/12 only when a spec builds a
real 16-node ordered tree.

So write a spec when the function needs a **populated container**. Do not
write one hoping to hit a magic constant — the miner already tried.

---

## 1. Contract

Drop a module in `scripts/recomp/oracle/specs/`. It must export:

```python
VA   = 0x00685bc0        # required — how the spec is found
CC   = "thiscall"        # "cdecl" | "stdcall" | "thiscall" | "fastcall"
UNTIL = None             # optional: stop at this VA instead of on return
CARRY_STATE = False      # optional: do NOT roll back .data between vectors

def build(o, rng) -> dict:
    return {"ecx": 0, "edx": 0, "args": [], "note": {}}
```

* `o` — the oracle. Use it only through `Arena` (below) unless you need
  something exotic.
* `rng` — a seeded `random.Random`. **Use only this for randomness.** Vectors
  must be reproducible from `(seed, index)`; anything else breaks replay.
* `args` — stack arguments, left to right. `ecx` is `this` for `__thiscall`.
* `note` — free-form JSON recorded in every vector. Put the interesting inputs
  here (which branch you were aiming at, key sizes, etc.).

Scratch is reset before `build` is called, so allocate freshly every time.

## 2. Use the shape library

```python
from shapes import Arena

def build(o, rng):
    a = Arena(o)
    key  = a.msvc_string(b"boss")
    tree = a.msvc_map([b"attic", b"boss", b"chest"])
    out  = a.blob(12)
    return {"ecx": tree, "args": [out, key], "note": {"key": "boss"}}
```

Available on `Arena`:

| call | builds |
|---|---|
| `blob(size, data=None, pad_before=0, page_start=False)` | raw bytes |
| `msvc_string(b"...", force_heap=False)` | `basic_string`, picks SSO vs heap |
| `fill_msvc_string(at, b"...")` | same, into an existing object |
| `msvc_map(keys, value_size=0)` | balanced `std::map<string,…>`; returns the map object |
| `rb_sentinel()` | a lone `_Tree` nil node |
| `vector([b"..", b".."])` | `std::vector` `{first,last,end}` triple |
| `object_with_vtable(size, slots)` | object whose `+0` is a vtable pointer |

`Arena(o, low=True)` allocates in the low arena at `0x00010000` instead, and
you must call `a.commit()` at the end. Use it only when a JS or C++ reference
model has to mirror the same bytes at the same absolute addresses.

## 3. Layouts pinned from this binary

Read off the disassembly, not from a header — MSVC versions differ.

```
basic_string   +0x00  union { char buf[16]; char *ptr; }
               +0x10  size
               +0x14  capacity          capacity <  0x10 -> data inline at +0
                                        capacity >= 0x10 -> data at *(char**)+0
_Tree node     +0x00  left   +0x04 parent   +0x08 right
               +0x0c  colour (0 red, 1 black)
               +0x0d  isnil  (1 = sentinel)
               +0x10  key (basic_string)
std::map       the object IS one dword pointing at the sentinel;
               the root is sentinel+0x04
std::vector    +0x00 first  +0x04 last  +0x08 end
```

## 4. Getting the calling convention right

This is the most common way a spec silently produces garbage. **Do not trust
the inferred convention — check it.**

```
python scripts/recomp/oracle/api.py --va 0x00685bc0 --describe
```

gives `cc`, `n_args`, `abi_confidence` and the reason. `confidence: "pinned"`
means it came from a `ret N`. `"guess"` means nobody knows.

Measured against the 641 REPENTOGON ZHL declarations in the Ghidra export —
the only known-correct signatures available (`zhlcheck.py`):

| | accuracy |
|---|---|
| calling convention | **87.4%** (560/641) |
| stack-argument count | **87.7%** (542/618 unambiguous) |
| autospec pointer-vs-scalar per slot | **71.1%** (160/225) |

So roughly **1 spec in 8 starts from a wrong convention**, and confidence
does not save you: `pinned` scores 88.3%, `guess` 88.1%. The dominant error is
a real `__thiscall` reported as `__stdcall` (30 cases) — a member function
that stashes `ECX` later than the entry scan looks. `__thiscall` is the
default in this binary; `ECX` read before it is written is the tell.

If `--describe` says `stdcall` but the function is a method, try `thiscall`
and see whether coverage jumps.

## 5. Aim at branches

Layout gets the function to run. **Values** get it to explore. Enumerate the
constants the code compares against and cycle through them plus their
neighbours:

```python
_CAPS = [0, 1, 0xE, 0xF, 0x10, 0x11, 0xFFF, 0x1000, 0x1001, 0xFFFFFFFF]
cap = rng.choice(_CAPS) if rng.random() < 0.8 else rng.getrandbits(32)
```

Boundaries matter more than volume: `0xF/0x10` splits SSO from heap,
`0xFFF/0x1000` splits the small free from the aligned free.

## 6. Check it

```
python scripts/recomp/oracle/runner.py --va 0x00685bc0 --n 2000 --no-resume
```

Read the line it prints:

* `cov 12/12 (100%)` — every static block reached. That is the goal.
* `pure=2000/2000` — every vector is usable ground truth.
* `terms={'ret': 2000}` — nothing faulted.

If `pure` is low, look at `terms`: `fault` means your memory graph is
incomplete, `stubbed` means the function reached an import (often fine and
correct — check *which* import), `cpu-exception` means the code deliberately
trapped (`int3` after `_invalid_parameter`), which is a real path and may be
exactly what you wanted.

**A spec that produces 100% `ret` is not automatically good.** If it never
reaches the error paths it is only testing half the function.

## 7. What "pure" means — the only rule that matters

A vector is `pure` when it returned normally, hit **no** stub, ran **no**
model, took **no** fault, and leaked no poison. Only `pure` vectors are
x86-only ground truth. `pure_modulo_models` additionally allows
malloc/free/memset/memcpy/memmove/strlen run by faithful in-emulator models —
a real but much weaker assumption, and always recorded per vector.

Never filter on `term == "ret"` alone: a function that returned after a
stubbed `lua_newuserdata` gave you a value the real program would never
produce.

## 8. When autospec is enough

Try it before writing anything:

```
python scripts/recomp/oracle/api.py --va 0xVA --n 200 --source autospec --summary-only
```

The default engine is a **static walk of Ghidra's SSA high P-Code**
(`ssaderef.py`): it resolves the address operand of every LOAD and STORE
backwards through `INT_ADD`/`PTRADD`/`PTRSUB`/copies to an incoming parameter
or `ECX`, recording the constant displacement. A field is a **pointer** when
the value loaded from it is itself later used as an address. For
`0x00685bc0` it recovers `[map] → sentinel`, `[sentinel+4] → root`, and the
node's `0x0 / 0x8 / 0xd` (left / right / isnil) with no execution at all.

Against the 641 ZHL declarations it gets pointer-vs-scalar right **84.2%** of
the time, versus 71.1% for the older fault-driven engine, and costs 15.0 ms
per function instead of 65.9 ms. It sees every path, so it does not repeat
fault-driven discovery's failure of mistaking `0x00685bc0`'s key for a scalar
just because an early return skipped the dereference.

What it still cannot give you:

* **values** — a field that must equal 3 to enter a branch;
* **recursive structure** — a valid ordered tree, a linked list with real
  links (`MULTIEQUAL` phi merges on loop-carried pointers do not resolve);
* 34.7% of memory accesses resolve to no root at all (globals, locals,
  computed addresses) and are simply absent from the layout.

Those three are exactly what a hand spec is for.
