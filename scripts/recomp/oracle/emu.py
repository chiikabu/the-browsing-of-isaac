"""Unicorn-based x86-32 ground-truth oracle for isaac-ng.unpacked.exe.

Design notes that matter for HONESTY of the produced vectors
------------------------------------------------------------
* The image is mapped at its PREFERRED base (0x400000) and relocations are
  NEVER applied (the unpacked dump has a bogus HIGHLOW at RVA 0x00531148).
* Callees are executed for real by default -- "recursive emulation" is just
  letting Unicorn run them.  Nothing is faked unless it has to be.
* Imports cannot be executed (no DLLs).  Every IAT slot is rewritten to point
  at a unique 8-byte stub in a dedicated region.  Hitting one is RECORDED,
  with the exact `DLL!Symbol`, and the vector is marked impure.
* Scratch comes from a pre-mapped slot pool in which every small slot is
  followed by a permanently UNMAPPED guard page, and small blocks sit flush
  against the end of their slot.  An overrun past a declared input therefore
  faults with the exact VA -- it is never silently zero.  (The pool is
  pre-mapped because mem_map/mem_unmap flush Unicorn's translation cache,
  which cost ~200x more than the emulation itself.)
* Stack memory above the initial ESP (the caller frame we did not build) is
  poison-filled with an address-derived pattern; if poison reaches an output
  register or a written dword the vector is flagged `poison`.
* Imports with a faithful in-emulator implementation (crtmodels.py) are
  recorded in `models`, kept separate from dead `stubs`.
* A vector is `pure` (== x86-only ground truth) only when it returned to the
  sentinel, hit no stub, ran no model, took no fault and leaked no poison.
  `pure_modulo_models` relaxes only the model condition.
* There is NO wall-clock anywhere: runs are bounded by instruction count,
  never by a timeout, so a vector is reproducible from its seed alone.
"""

from __future__ import annotations

import os
import struct
from dataclasses import dataclass, field

import unicorn as uc_mod
from unicorn import Uc, UcError
from unicorn.unicorn_const import (
    UC_ARCH_X86, UC_HOOK_BLOCK, UC_HOOK_CODE, UC_HOOK_INSN_INVALID,
    UC_HOOK_MEM_FETCH_PROT,
    UC_HOOK_MEM_FETCH_UNMAPPED, UC_HOOK_MEM_READ_PROT, UC_HOOK_MEM_READ_UNMAPPED,
    UC_HOOK_MEM_WRITE, UC_HOOK_MEM_WRITE_PROT, UC_HOOK_MEM_WRITE_UNMAPPED,
    UC_MODE_32, UC_PROT_ALL, UC_PROT_EXEC, UC_PROT_READ, UC_PROT_WRITE,
)
from unicorn.x86_const import (
    UC_X86_REG_CS, UC_X86_REG_DS, UC_X86_REG_EAX, UC_X86_REG_EBP,
    UC_X86_REG_EBX, UC_X86_REG_ECX, UC_X86_REG_EDI, UC_X86_REG_EDX,
    UC_X86_REG_EFLAGS, UC_X86_REG_EIP, UC_X86_REG_ES, UC_X86_REG_ESI,
    UC_X86_REG_ESP, UC_X86_REG_FS, UC_X86_REG_GDTR, UC_X86_REG_GS,
    UC_X86_REG_SS,
)

import peimage

PAGE = 0x1000

STACK_BASE = 0x20000000
STACK_SIZE = 0x00100000          # 1 MiB
STACK_TOP_GAP = 0x2000           # caller-frame room above initial ESP

# Scratch deliberately starts ABOVE 0x20100000.  The lifted-module replay
# harness (scripts/recomp/lift/oracle_replay.c) hardcodes its guest stack at
# ORACLE_ESP = 0x20000ffc and writes a fake return address there, then stack
# arguments at 0x20001000+.  With scratch at 0x20000000 the first small
# allocation of every vector landed at 0x20000fe8..0x20000fff -- so the
# harness overwrote offset 0x14 of that object (the capacity field of an MSVC
# basic_string) with 0x00deadbe before calling the lifted function, on EVERY
# vector.  Keeping scratch out of that page removes the collision without
# touching the lifter's files.  Must stay below the harness's
# GUEST_HI = 0x1c000000 or addresses are rejected as out of range (round 66
# moved both down with the guest map).
HEAP_BASE = int(os.environ.get("ISAAC_ORACLE_HEAP_BASE", "0x21000000"), 0)
HEAP_SIZE = 0x02000000           # address-space window reserved for scratch

# Scratch is served from a PRE-MAPPED slot pool.  mem_map/mem_unmap flush
# Unicorn's translation cache, so mapping per vector costs more than the
# emulation itself; the pool is mapped once and only poison-refilled.
# Small blocks sit flush with the end of their page and every small slot is
# followed by a permanently UNMAPPED guard page, so an overrun still faults
# with an exact VA.
SLOT_COUNT = 96
BIG_BASE = HEAP_BASE + SLOT_COUNT * 2 * PAGE + PAGE
BIG_PAGES = 64
MODEL_HEAP_BASE = BIG_BASE + (BIG_PAGES + 1) * PAGE
MODEL_HEAP_PAGES = 256

# Low arena: addresses small enough that a JS reference model can use one flat
# ArrayBuffer with the SAME absolute addresses, so oracle memory and model
# memory are byte-identical including the pointer values stored inside it.
# The NULL page stays unmapped so null dereferences still fault.
ARENA_BASE = 0x00010000
ARENA_SIZE = 0x00030000

STUB_BASE = 0x50000000
STUB_SLOT = 0x10
STUB_SIZE = 0x00100000

MAGIC_RET = 0x5F000000
GDT_BASE = 0x60000000
TEB_BASE = 0x60010000

POISON_TAG = 0x5A5A0000
POISON_MASK = 0xFFFF0000

GPR = {
    "eax": UC_X86_REG_EAX, "ebx": UC_X86_REG_EBX, "ecx": UC_X86_REG_ECX,
    "edx": UC_X86_REG_EDX, "esi": UC_X86_REG_ESI, "edi": UC_X86_REG_EDI,
    "ebp": UC_X86_REG_EBP, "esp": UC_X86_REG_ESP,
}
# Flags that MSVC codegen actually depends on; the rest (AF etc.) are noise.
FLAG_MASK = 0x8D5          # CF PF AF ZF SF OF


def poison_dword(addr: int) -> int:
    return (POISON_TAG | ((addr >> 2) & 0xFFFF)) & 0xFFFFFFFF


def is_poison(v: int) -> bool:
    return (v & POISON_MASK) == POISON_TAG


def _poison_bytes(base: int, size: int) -> bytes:
    out = bytearray(size)
    for off in range(0, size, 4):
        struct.pack_into("<I", out, off, poison_dword(base + off))
    return bytes(out)


@dataclass
class CallRec:
    site: int
    target: int
    depth: int
    ecx: int
    edx: int
    args: list[int]
    stub: str | None = None


@dataclass
class RunResult:
    term: str = "?"                 # ret | fault | timeout | insn-limit | error
    error: str | None = None
    fault_va: int | None = None
    fault_kind: str | None = None
    regs: dict[str, int] = field(default_factory=dict)
    eflags: int = 0
    entry_regs: dict[str, int] = field(default_factory=dict)
    entry_eflags: int = 0
    icount: int = 0
    blocks: list[int] = field(default_factory=list)
    writes: list[tuple[int, bytes]] = field(default_factory=list)
    calls: list[CallRec] = field(default_factory=list)
    stubs: list[str] = field(default_factory=list)
    models: list[str] = field(default_factory=list)
    poison: bool = False
    max_depth: int = 0
    steps: int = 0

    @property
    def pure(self) -> bool:
        """x86-only ground truth: nothing outside the binary influenced it."""
        return (self.term == "ret" and not self.stubs and not self.models
                and not self.poison and self.fault_va is None)

    @property
    def pure_modulo_models(self) -> bool:
        """Ground truth conditional on the modelled CRT calls being right."""
        return (self.term == "ret" and not self.stubs and not self.poison
                and self.fault_va is None)


class Oracle:
    """One reusable Unicorn machine.  `snapshot()` / `restore()` make a run
    cheap: the image is mapped once and only dirty pages are rolled back."""

    def __init__(self, pe: peimage.PeImage, *, trace_calls: bool = True,
                 trace_writes: bool = True, trace_blocks: bool = True):
        self.pe = pe
        self.trace_calls = trace_calls
        self.trace_writes = trace_writes
        self.trace_blocks = trace_blocks
        self.uc = Uc(UC_ARCH_X86, UC_MODE_32)
        self._stub_by_addr: dict[int, str] = {}
        self._explicit_stubs: dict[int, str] = {}
        self._models: dict[int, tuple] = {}      # stub addr -> (fn, pop)
        self._addr_by_label: dict[str, int] = {}
        self._text_lo = pe.text.va
        self._text_hi = pe.text.end
        self._cur: RunResult | None = None
        self._func_blocks: frozenset[int] = frozenset()
        self._prev_esp = 0
        self._depth = 0
        self._map_image()
        self._map_scratch()
        self._map_pool()
        self._install_import_stubs()
        self._setup_gdt()
        self._install_hooks()

    # -- setup ----------------------------------------------------------
    def _map_image(self):
        pe = self.pe
        size = (pe.size_of_image + PAGE - 1) & ~(PAGE - 1)
        self.uc.mem_map(pe.image_base, size, UC_PROT_ALL)
        self.uc.mem_write(pe.image_base, bytes(pe.image))
        # exact per-section permissions, headers page read-only
        self.uc.mem_protect(pe.image_base, PAGE, UC_PROT_READ)
        for s in pe.sections:
            lo = s.va & ~(PAGE - 1)
            hi = (s.end + PAGE - 1) & ~(PAGE - 1)
            prot = 0
            if s.readable:
                prot |= UC_PROT_READ
            if s.writable:
                prot |= UC_PROT_WRITE
            if s.executable:
                prot |= UC_PROT_EXEC
            if prot:
                self.uc.mem_protect(lo, hi - lo, prot)

    def _map_scratch(self):
        u = self.uc
        u.mem_map(ARENA_BASE, ARENA_SIZE, UC_PROT_READ | UC_PROT_WRITE)
        self._arena_baseline = _poison_bytes(ARENA_BASE, ARENA_SIZE)
        u.mem_write(ARENA_BASE, self._arena_baseline)
        u.mem_map(STACK_BASE, STACK_SIZE, UC_PROT_READ | UC_PROT_WRITE)
        u.mem_write(STACK_BASE, _poison_bytes(STACK_BASE, STACK_SIZE))
        self._stack_baseline = _poison_bytes(STACK_BASE, STACK_SIZE)
        u.mem_map(STUB_BASE, STUB_SIZE, UC_PROT_READ | UC_PROT_EXEC)
        u.mem_map(MAGIC_RET & ~(PAGE - 1), PAGE, UC_PROT_READ | UC_PROT_EXEC)
        u.mem_write(MAGIC_RET, b"\xf4" * 16)          # hlt, never reached
        u.mem_map(GDT_BASE, PAGE, UC_PROT_READ | UC_PROT_WRITE)
        u.mem_map(TEB_BASE, PAGE * 4, UC_PROT_READ | UC_PROT_WRITE)
        u.mem_write(TEB_BASE, struct.pack("<I", 0xFFFFFFFF))       # fs:[0] SEH end
        u.mem_write(TEB_BASE + 0x04, struct.pack("<I", STACK_BASE + STACK_SIZE))
        u.mem_write(TEB_BASE + 0x08, struct.pack("<I", STACK_BASE))
        u.mem_write(TEB_BASE + 0x18, struct.pack("<I", TEB_BASE))  # self
        u.mem_write(TEB_BASE + 0x2C, struct.pack("<I", TEB_BASE + 0x800))
        self.initial_esp = STACK_BASE + STACK_SIZE - STACK_TOP_GAP

    def _setup_gdt(self):
        """32-bit Unicorn has no FS_BASE MSR; build a real GDT instead.

        Every segment register must be re-pointed at a valid descriptor: the
        moment GDTR is loaded the stale defaults become invalid and the CPU
        silently drops to 16-bit address size (symptom: ESP truncated to
        0x0000dff8 instead of 0x200fdff8).
        """
        def entry(base, limit, access, flags):
            if limit > 0xFFFFF:
                limit >>= 12
                flags |= 0x8
            e = limit & 0xFFFF
            e |= (base & 0xFFFFFF) << 16
            e |= (access & 0xFF) << 40
            e |= ((limit >> 16) & 0xF) << 48
            e |= (flags & 0xF) << 52
            e |= ((base >> 24) & 0xFF) << 56
            return struct.pack("<Q", e)

        gdt = bytearray(PAGE)
        gdt[1 * 8:2 * 8] = entry(0, 0xFFFFFFFF, 0x9A, 0xC)   # code  sel 0x08
        gdt[2 * 8:3 * 8] = entry(0, 0xFFFFFFFF, 0x92, 0xC)   # data  sel 0x10
        gdt[6 * 8:7 * 8] = entry(TEB_BASE, 0xFFFFFFFF, 0x92, 0xC)   # fs sel 0x30
        self.uc.mem_write(GDT_BASE, bytes(gdt))
        self.uc.reg_write(UC_X86_REG_GDTR, (0, GDT_BASE, PAGE - 1, 0x0))
        self.uc.reg_write(UC_X86_REG_CS, 0x08)
        for reg in (UC_X86_REG_DS, UC_X86_REG_ES, UC_X86_REG_SS,
                    UC_X86_REG_GS):
            self.uc.reg_write(reg, 0x10)
        self.uc.reg_write(UC_X86_REG_FS, 0x30)

    def _install_import_stubs(self):
        """Rewrite every IAT slot to a unique executable stub.

        The unpacked dump's IAT still holds unbound name-table RVAs which land
        *inside* .rdata -- executing one would run garbage instead of failing
        loudly.  Each stub is `mov eax, imm32 ; ret` so the callee returns
        cleanly; the block hook records which import was hit.
        """
        u = self.uc
        blob = bytearray(STUB_SIZE)
        for i, imp in enumerate(self.pe.imports):
            addr = STUB_BASE + i * STUB_SLOT
            off = addr - STUB_BASE
            # mov eax, 0  ; ret     (cdecl-clean; callers of stdcall imports
            # will be left with an unbalanced stack -- recorded, not hidden)
            blob[off:off + 6] = b"\xb8\x00\x00\x00\x00\xc3"
            u.mem_write(imp.iat_va, struct.pack("<I", addr))
            self.pe.image[imp.iat_va - self.pe.image_base:
                          imp.iat_va - self.pe.image_base + 4] = \
                struct.pack("<I", addr)
            self._stub_by_addr[addr] = imp.label
            self._addr_by_label[imp.label] = addr
        u.mem_write(STUB_BASE, bytes(blob))
        self._stub_next = len(self.pe.imports)

    def bind_model(self, label: str, fn, pop_bytes: int = 0) -> bool:
        """Attach a faithful in-emulator implementation to an import."""
        addr = self._addr_by_label.get(label)
        if addr is None:
            return False
        self._models[addr] = (fn, pop_bytes)
        return True

    def add_function_stub(self, va: int, label: str, ret_value: int = 0,
                          pop_bytes: int = 0):
        """Force a named callee to be stubbed instead of emulated."""
        addr = STUB_BASE + self._stub_next * STUB_SLOT
        self._stub_next += 1
        code = b"\xb8" + struct.pack("<I", ret_value & 0xFFFFFFFF) + (
            (b"\xc2" + struct.pack("<H", pop_bytes)) if pop_bytes else b"\xc3")
        self.uc.mem_write(addr, code)
        self._stub_by_addr[addr] = label
        # patch the real entry with `jmp addr`
        rel = (addr - (va + 5)) & 0xFFFFFFFF
        self._patch_image(va, b"\xe9" + struct.pack("<I", rel))
        self._explicit_stubs[va] = label

    def _patch_image(self, va: int, data: bytes):
        self.uc.mem_protect(va & ~(PAGE - 1),
                            ((va + len(data) + PAGE - 1) & ~(PAGE - 1)) - (va & ~(PAGE - 1)),
                            UC_PROT_ALL)
        self.uc.mem_write(va, data)
        off = va - self.pe.image_base
        self.pe.image[off:off + len(data)] = data
        self.uc.mem_protect(va & ~(PAGE - 1),
                            ((va + len(data) + PAGE - 1) & ~(PAGE - 1)) - (va & ~(PAGE - 1)),
                            UC_PROT_READ | UC_PROT_EXEC)

    # -- hooks ----------------------------------------------------------
    def _install_hooks(self):
        u = self.uc
        u.hook_add(UC_HOOK_MEM_READ_UNMAPPED | UC_HOOK_MEM_WRITE_UNMAPPED |
                   UC_HOOK_MEM_FETCH_UNMAPPED | UC_HOOK_MEM_READ_PROT |
                   UC_HOOK_MEM_WRITE_PROT | UC_HOOK_MEM_FETCH_PROT,
                   self._hook_mem_invalid)
        u.hook_add(UC_HOOK_INSN_INVALID, self._hook_insn_invalid)
        if self.trace_writes:
            u.hook_add(UC_HOOK_MEM_WRITE, self._hook_write)
        if self.trace_blocks:
            u.hook_add(UC_HOOK_BLOCK, self._hook_block)
        # Model dispatch.  Restricted to the stub region: Unicorn only emits
        # the per-instruction callout for blocks that overlap the range, so
        # this costs nothing while executing .text.
        u.hook_add(UC_HOOK_CODE, self._hook_stub_code,
                   begin=STUB_BASE, end=STUB_BASE + STUB_SIZE - 1)

    def _hook_stub_code(self, u, address, size, ud):
        m = self._models.get(address)
        if m is None:
            return
        fn, pop = m
        esp = u.reg_read(UC_X86_REG_ESP)
        ret = self._safe_u32(esp)
        if ret is None:
            return
        args = self._read_args(esp + 4, 8)
        try:
            eax = fn(self, args) or 0
        except UcError as e:
            r = self._cur
            if r is not None and r.fault_va is None:
                r.term = "fault"
                r.fault_kind = f"model:{self._stub_by_addr.get(address)}:{e}"
                r.fault_va = address
            u.emu_stop()
            return
        u.reg_write(UC_X86_REG_EAX, eax & 0xFFFFFFFF)
        u.reg_write(UC_X86_REG_ESP, esp + 4 + pop)
        u.reg_write(UC_X86_REG_EIP, ret)

    _MEM_KIND = {
        uc_mod.UC_MEM_READ_UNMAPPED: "read-unmapped",
        uc_mod.UC_MEM_WRITE_UNMAPPED: "write-unmapped",
        uc_mod.UC_MEM_FETCH_UNMAPPED: "fetch-unmapped",
        uc_mod.UC_MEM_READ_PROT: "read-prot",
        uc_mod.UC_MEM_WRITE_PROT: "write-prot",
        uc_mod.UC_MEM_FETCH_PROT: "fetch-prot",
    }

    def _hook_mem_invalid(self, u, access, address, size, value, ud):
        r = self._cur
        if r is not None and r.fault_va is None:
            r.fault_va = address & 0xFFFFFFFF
            r.fault_kind = self._MEM_KIND.get(access, str(access))
            r.term = "fault"
            try:
                r.regs["eip_at_fault"] = u.reg_read(UC_X86_REG_EIP)
            except UcError:
                pass
        return False        # stop; never silently satisfy the access

    def _hook_insn_invalid(self, u, ud):
        r = self._cur
        if r is not None:
            r.term = "invalid-insn"
            r.fault_va = u.reg_read(UC_X86_REG_EIP)
            r.fault_kind = "invalid-insn"
        return False

    def _hook_write(self, u, access, address, size, value, ud):
        r = self._cur
        if r is None:
            return True
        r.writes.append((address & 0xFFFFFFFF,
                         (value & ((1 << (size * 8)) - 1)).to_bytes(size, "little")))
        if size == 4 and is_poison(value & 0xFFFFFFFF):
            r.poison = True
        return True

    def _is_call_return_addr(self, ra: int, target: int) -> bool:
        """Is `ra` the address right after a call instruction that goes to
        `target`?  For E8 the rel32 is decoded and matched exactly, so direct
        calls are identified with no false positives; indirect forms
        (FF /2) are accepted on the ModRM shape alone.

        The earlier `esp == prev_esp - 4` heuristic was wrong: any call with
        pushed arguments moves ESP by more than 4 between the block start and
        the call, which silently dropped every non-trivial call from the
        recorded sequence.
        """
        if not (self._text_lo <= ra < self._text_hi):
            return False
        try:
            b = self.pe.read(ra - 8, 8)
        except ValueError:
            return False
        if b[3] == 0xE8:                              # call rel32
            rel = struct.unpack_from("<i", b, 4)[0]
            if (ra + rel) & 0xFFFFFFFF == target:
                return True
        for k in (2, 3, 5, 6, 7):                     # call r/m32 forms
            if b[8 - k] == 0xFF and (b[9 - k] & 0x38) == 0x10:
                return True
        return False

    def _hook_block(self, u, address, size, ud):
        r = self._cur
        if r is None:
            return
        r.blocks.append(address)
        stub = self._stub_by_addr.get(address)
        esp = u.reg_read(UC_X86_REG_ESP)
        if stub is not None:
            if address in self._models:
                if stub not in r.models:
                    r.models.append(stub)
            elif stub not in r.stubs:
                r.stubs.append(stub)
            if self.trace_calls:
                r.calls.append(CallRec(
                    site=self._safe_u32(esp) or 0, target=address,
                    depth=self._depth, ecx=u.reg_read(UC_X86_REG_ECX),
                    edx=u.reg_read(UC_X86_REG_EDX),
                    args=self._read_args(esp + 4, 4), stub=stub))
            self._prev_esp = esp
            return
        if self.trace_calls and address not in self._func_blocks:
            if esp < self._prev_esp:
                ra = self._safe_u32(esp)
                if ra is not None and self._is_call_return_addr(ra, address):
                    self._depth += 1
                    r.max_depth = max(r.max_depth, self._depth)
                    r.calls.append(CallRec(
                        site=ra, target=address, depth=self._depth,
                        ecx=u.reg_read(UC_X86_REG_ECX),
                        edx=u.reg_read(UC_X86_REG_EDX),
                        args=self._read_args(esp + 4, 4)))
            elif esp > self._prev_esp and self._depth > 0:
                self._depth -= 1
        self._prev_esp = esp

    def _safe_u32(self, addr: int) -> int | None:
        try:
            return struct.unpack("<I", self.uc.mem_read(addr, 4))[0]
        except UcError:
            return None

    def _read_args(self, addr: int, n: int) -> list[int]:
        try:
            raw = self.uc.mem_read(addr, 4 * n)
        except UcError:
            return []
        return list(struct.unpack("<" + "I" * n, raw))

    # -- memory helpers --------------------------------------------------
    def _map_pool(self):
        u = self.uc
        rw = UC_PROT_READ | UC_PROT_WRITE
        for i in range(SLOT_COUNT):
            p = HEAP_BASE + i * 2 * PAGE          # odd pages stay unmapped
            u.mem_map(p, PAGE, rw)
        u.mem_map(BIG_BASE, BIG_PAGES * PAGE, rw)
        u.mem_map(MODEL_HEAP_BASE, MODEL_HEAP_PAGES * PAGE, rw)
        self._slot_poison = [_poison_bytes(HEAP_BASE + i * 2 * PAGE, PAGE)
                             for i in range(SLOT_COUNT)]
        for i in range(SLOT_COUNT):
            u.mem_write(HEAP_BASE + i * 2 * PAGE, self._slot_poison[i])
        self._big_poison = _poison_bytes(BIG_BASE, BIG_PAGES * PAGE)
        u.mem_write(BIG_BASE, self._big_poison)
        self._model_poison = _poison_bytes(MODEL_HEAP_BASE,
                                           MODEL_HEAP_PAGES * PAGE)
        u.mem_write(MODEL_HEAP_BASE, self._model_poison)
        self._slot_next = 0
        self._slots_used = 0
        self._big_next = BIG_BASE
        self._model_next = MODEL_HEAP_BASE
        self._model_blocks: dict[int, int] = {}

    def alloc(self, size: int, data: bytes | None = None, *, align: int = 4,
              pad_before: int = 0, page_start: bool = False) -> int:
        """Allocate scratch from the pre-mapped pool.

        Small blocks end flush with a page boundary that is followed by an
        unmapped guard page, so a one-byte overrun faults with an exact VA.
        """
        size = max(size, 1)
        total = pad_before + size
        if total > PAGE or page_start:
            npages = (total + PAGE - 1) // PAGE
            if self._big_next + npages * PAGE > BIG_BASE + BIG_PAGES * PAGE:
                raise MemoryError("oracle big-scratch exhausted")
            addr = self._big_next + pad_before
            self._big_next += npages * PAGE
        else:
            if self._slot_next >= SLOT_COUNT:
                raise MemoryError("oracle scratch slots exhausted")
            base = HEAP_BASE + self._slot_next * 2 * PAGE
            self._slot_next += 1
            self._slots_used = self._slot_next
            addr = ((base + PAGE - total) & ~(align - 1)) + pad_before
        if pad_before:
            self.uc.mem_write(addr - pad_before, b"\x00" * pad_before)
        if data is not None:
            self.uc.mem_write(addr, data[:size])
            if len(data) < size:
                self.uc.mem_write(addr + len(data), b"\x00" * (size - len(data)))
        else:
            self.uc.mem_write(addr, b"\x00" * size)
        return addr

    def model_alloc(self, size: int) -> int:
        """Bump allocator backing the modelled CRT malloc/new."""
        size = (max(size, 1) + 15) & ~15
        if self._model_next + size > MODEL_HEAP_BASE + MODEL_HEAP_PAGES * PAGE:
            return 0
        addr = self._model_next
        self._model_next += size
        self._model_blocks[addr] = size
        return addr

    def read(self, addr: int, size: int) -> bytes:
        return bytes(self.uc.mem_read(addr, size))

    def write(self, addr: int, data: bytes):
        self.uc.mem_write(addr, data)

    def reset_scratch(self):
        u = self.uc
        for i in range(self._slots_used):
            u.mem_write(HEAP_BASE + i * 2 * PAGE, self._slot_poison[i])
        if self._big_next > BIG_BASE:
            n = self._big_next - BIG_BASE
            u.mem_write(BIG_BASE, self._big_poison[:n])
        if self._model_next > MODEL_HEAP_BASE:
            n = self._model_next - MODEL_HEAP_BASE
            u.mem_write(MODEL_HEAP_BASE, self._model_poison[:n])
        self._slot_next = 0
        self._slots_used = 0
        self._big_next = BIG_BASE
        self._model_next = MODEL_HEAP_BASE
        self._model_blocks.clear()

    def reset_stack(self):
        self.uc.mem_write(STACK_BASE, self._stack_baseline)

    def reset_arena(self):
        self.uc.mem_write(ARENA_BASE, self._arena_baseline)

    def reset_image(self):
        self.uc.mem_write(self.pe.image_base, bytes(self.pe.image))

    def restore_dirty(self, result: "RunResult"):
        """Roll back only the image/arena pages a run actually wrote.

        Restoring the whole 9 MiB image per vector costs milliseconds; a run
        typically dirties one or two pages.  Rollback is what makes
        .data-touching functions (MT19937 et al) deterministic per vector.
        """
        base = self.pe.image_base
        top = base + self.pe.size_of_image
        pages: set[int] = set()
        for a, d in result.writes:
            lo = a & ~(PAGE - 1)
            hi = (a + len(d) + PAGE - 1) & ~(PAGE - 1)
            p = lo
            while p < hi:
                pages.add(p)
                p += PAGE
        img = self.pe.image
        for p in pages:
            if base <= p < top:
                off = p - base
                self.uc.mem_write(p, bytes(img[off:off + PAGE]))
            elif ARENA_BASE <= p < ARENA_BASE + ARENA_SIZE:
                off = p - ARENA_BASE
                self.uc.mem_write(p, self._arena_baseline[off:off + PAGE])
        return len(pages)

    # -- the call ---------------------------------------------------------
    def call(self, va: int, *, cc: str = "cdecl", args: list[int] | None = None,
             ecx: int = 0, edx: int = 0, regs: dict[str, int] | None = None,
             func_blocks: frozenset[int] = frozenset(),
             timeout_us: int = 0, max_insns: int = 2_000_000,
             reset: bool = True, until: int | None = None) -> RunResult:
        u = self.uc
        args = list(args or [])
        if reset:
            self.reset_stack()
        r = RunResult()
        self._cur = r
        self._func_blocks = func_blocks
        self._depth = 0

        stack_args = list(args)
        if cc == "thiscall":
            pass                       # ecx supplied separately
        elif cc == "fastcall":
            if len(stack_args) >= 1:
                ecx = stack_args.pop(0)
            if len(stack_args) >= 1:
                edx = stack_args.pop(0)

        esp = self.initial_esp
        for v in reversed(stack_args):
            esp -= 4
            u.mem_write(esp, struct.pack("<I", v & 0xFFFFFFFF))
        esp -= 4
        u.mem_write(esp, struct.pack("<I", MAGIC_RET))

        defaults = {"eax": 0, "ebx": 0, "esi": 0, "edi": 0}
        for k, v in defaults.items():
            u.reg_write(GPR[k], v)
        u.reg_write(UC_X86_REG_ECX, ecx & 0xFFFFFFFF)
        u.reg_write(UC_X86_REG_EDX, edx & 0xFFFFFFFF)
        u.reg_write(UC_X86_REG_EBP, esp)
        u.reg_write(UC_X86_REG_ESP, esp)
        u.reg_write(UC_X86_REG_EFLAGS, 0x202)
        if regs:
            for k, v in regs.items():
                u.reg_write(GPR[k], v & 0xFFFFFFFF)
        self._prev_esp = esp
        self._entry_esp = esp
        # Publish the FULL entry state.  A callee-saved register's expected
        # output is its entry value, so a consumer that cannot see the entry
        # value cannot check ebx/esi/edi/ebp at all -- and starting them at
        # zero makes every register-preserving function look like a mismatch
        # and traps any function that dereferences [ebp-N].
        r.entry_regs = {k: u.reg_read(reg) for k, reg in GPR.items()}
        r.entry_eflags = u.reg_read(UC_X86_REG_EFLAGS) & FLAG_MASK

        stop_at = MAGIC_RET if until is None else until
        try:
            u.emu_start(va, stop_at, timeout=timeout_us, count=max_insns)
            eip = u.reg_read(UC_X86_REG_EIP)
            if r.term == "?":
                if eip == stop_at:
                    r.term = "ret"
                else:
                    timed_out = False
                    try:
                        timed_out = bool(u.query(uc_mod.UC_QUERY_TIMEOUT))
                    except Exception:
                        pass
                    r.term = "timeout" if timed_out else "insn-limit"
        except UcError as e:
            errno = getattr(e, "errno", None)
            if r.term in ("?", ""):
                # UC_ERR_EXCEPTION is a real CPU trap taken by the guest code
                # (int3 after __report_rangecheckfailure, div by zero, ud2...).
                # It is a genuine result for that input, not a harness failure,
                # so it gets its own term instead of a generic "error".
                r.term = {
                    uc_mod.UC_ERR_EXCEPTION: "cpu-exception",
                    uc_mod.UC_ERR_INSN_INVALID: "invalid-insn",
                }.get(errno, "error")
            r.error = f"{e} ({errno})"
            if r.fault_va is None:
                try:
                    r.fault_va = u.reg_read(UC_X86_REG_EIP)
                except UcError:
                    pass

        for k, reg in GPR.items():
            r.regs[k] = u.reg_read(reg)
        r.eflags = u.reg_read(UC_X86_REG_EFLAGS) & FLAG_MASK
        r.regs["esp_delta"] = (r.regs["esp"] - self._entry_esp) & 0xFFFFFFFF
        if is_poison(r.regs["eax"]):
            r.poison = True
        self._cur = None
        return r


def merge_writes(writes: list[tuple[int, bytes]]) -> list[tuple[int, int]]:
    """Coalesce (addr, bytes) records into sorted [lo, hi) intervals."""
    if not writes:
        return []
    iv = sorted((a, a + len(d)) for a, d in writes)
    out = [list(iv[0])]
    for lo, hi in iv[1:]:
        if lo <= out[-1][1]:
            out[-1][1] = max(out[-1][1], hi)
        else:
            out.append([lo, hi])
    return [(a, b) for a, b in out]
