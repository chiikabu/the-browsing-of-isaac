#!/usr/bin/env python3
"""
Minimal PE32 steam_api.dll offline stub for Wine/Boxedwine.

Implements the modern Steamworks surface isaac-ng imports:
  SteamInternal_SteamAPI_Init  -> ESteamAPIInitResult_OK (0)
  SteamAPI_IsSteamRunning      -> 1
  SteamInternal_ContextInit    -> proper ContextInitData protocol
  SteamInternal_FindOrCreateUserInterface / CreateInterface -> COM iface
  + callback registration no-ops

Also imports OutputDebugStringA and emits a unique marker on Init so we can
prove the stub ran under WINEDEBUG=+debugstr.
"""
from __future__ import annotations

import struct
from pathlib import Path

IMAGE_BASE = 0x10000000
FILE_ALIGN = 0x200
SECT_ALIGN = 0x1000
HEADERS = 0x400


def align(n: int, a: int) -> int:
    return (n + a - 1) & ~(a - 1)


def u32(x: int) -> bytes:
    return struct.pack("<I", x & 0xFFFFFFFF)


def u16(x: int) -> bytes:
    return struct.pack("<H", x & 0xFFFF)


def build() -> bytes:
    # ------------------------------------------------------------------
    # Code generation (i386)
    # All stdcall exports use cdecl-style here: isaac's steam_api uses
    # __cdecl on the exported C API (Valve SteamAPI_CALL is __cdecl on x86).
    # COM interface methods are thiscall (this in ecx) — ret without stack
    # cleanup for 0-arg methods is fine; for args the caller cleans with
    # thiscall... actually MSVC thiscall: callee does NOT pop this, only
    # stack args. We use bare `ret` for safety on 0-stack-arg methods and
    # `ret imm16` for stack-arg methods when used as stdcall fallbacks.
    # ------------------------------------------------------------------
    text = bytearray()
    labels: dict[str, int] = {}

    def here() -> int:
        return len(text)

    def emit(*chunks: bytes) -> int:
        off = here()
        for c in chunks:
            text.extend(c)
        return off

    def label(name: str) -> int:
        labels[name] = here()
        return labels[name]

    # --- shared helpers ---
    # noop thiscall/stdcall mixed: xor eax,eax; ret
    label("noop0")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))  # return true

    # ret 4 / 8 / 12 for stdcall with stack args (safe over-clean for thiscall extra args)
    label("noop1")
    emit(bytes([0x31, 0xC0, 0xC2, 0x04, 0x00]))
    label("noop2")
    emit(bytes([0x31, 0xC0, 0xC2, 0x08, 0x00]))
    label("noop3")
    emit(bytes([0x31, 0xC0, 0xC2, 0x0C, 0x00]))
    label("noop64")
    emit(bytes([0x31, 0xC0, 0x31, 0xD2, 0xC3]))  # edx:eax = 0

    # void ret
    label("ret_void")
    emit(bytes([0xC3]))
    label("ret_void1")
    emit(bytes([0xC2, 0x04, 0x00]))
    label("ret_void2")
    emit(bytes([0xC2, 0x08, 0x00]))

    # ret1 / ret0
    label("ret1")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))
    label("ret1_arg1")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC2, 0x04, 0x00]))
    label("ret0")
    emit(bytes([0x31, 0xC0, 0xC3]))

    # Placeholder RVAs patched after layout known (absolute VAs for mov eax,imm32)
    # We emit mov eax, IMM32; ret  and fix IMM32 later.
    def emit_mov_eax_imm_ret(fix_name: str) -> int:
        off = emit(bytes([0xB8, 0, 0, 0, 0, 0xC3]))
        labels[fix_name] = off  # store code offset for patch
        return off

    # OutputDebugStringA wrapper: push msg; call [iat]; ret
    # Needs IAT slot and message RVA — patched later.
    # dbg_init / dbg_reg share IAT call site pattern (separate push imm).
    label("dbg_init")
    dbg_push_off = emit(bytes([0x68, 0, 0, 0, 0]))  # patch msg VA
    dbg_call_off = emit(bytes([0xFF, 0x15, 0, 0, 0, 0]))  # patch IAT VA
    emit(bytes([0xC3]))

    label("dbg_reg")
    dbg_reg_push_off = emit(bytes([0x68, 0, 0, 0, 0]))  # patch reg msg VA
    dbg_reg_call_off = emit(bytes([0xFF, 0x15, 0, 0, 0, 0]))  # patch IAT VA
    emit(bytes([0xC3]))

    # SteamInternal_SteamAPI_Init:
    #   call dbg_init
    #   xor eax,eax  ; OK=0
    #   ret
    label("SteamInternal_SteamAPI_Init")
    call_pos = here()
    emit(bytes([0xE8, 0, 0, 0, 0]))  # patch rel to dbg_init
    emit(bytes([0x31, 0xC0, 0xC3]))  # xor eax,eax; ret

    label("SteamAPI_Init")
    # log then return TRUE
    call_init_pos = here()
    emit(bytes([0xE8, 0, 0, 0, 0]))  # patch rel to dbg_init
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))
    label("SteamAPI_InitSafe")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))
    label("SteamAPI_IsSteamRunning")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))
    # SteamAPI_* C exports are __cdecl on x86 (Valve STEAM_CALLBACK / SteamAPI_CALL).
    # Must use plain `ret` — never `ret imm16`. Using stdcall ret N double-cleans the
    # stack when the game does its own `add esp, N` after the call, which corrupts the
    # CRT _initterm frame and returns to address 0 (the null-execute crash at OEP).
    label("SteamAPI_Shutdown")
    emit(bytes([0xC3]))
    label("SteamAPI_RunCallbacks")
    emit(bytes([0xC3]))
    label("SteamAPI_RegisterCallback")
    # log once-ish then ret (cdecl)
    call_reg_pos = here()
    emit(bytes([0xE8, 0, 0, 0, 0]))  # patch rel to dbg_reg
    emit(bytes([0xC3]))  # cdecl: (CCallbackBase*, int) — caller cleans 8
    label("SteamAPI_UnregisterCallback")
    emit(bytes([0xC3]))  # cdecl: (CCallbackBase*) — caller cleans 4
    label("SteamAPI_RegisterCallResult")
    emit(bytes([0xC3]))  # cdecl: (CCallbackBase*, SteamAPICall_t) — caller cleans 12
    label("SteamAPI_UnregisterCallResult")
    emit(bytes([0xC3]))  # cdecl: same
    label("SteamAPI_GetHSteamUser")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))
    label("SteamAPI_GetHSteamPipe")
    emit(bytes([0xB8, 0x01, 0x00, 0x00, 0x00, 0xC3]))
    label("SteamAPI_ReleaseCurrentThreadMemory")
    emit(bytes([0xC3]))

    # Select a dedicated ISteamApps object when the requested interface string
    # starts with STEAMAPPS. All other interfaces use the generic object.
    def emit_iface_selector(name: str, version_arg_offset: int) -> tuple[int, int]:
        label(name)
        emit(bytes([0x8B, 0x44, 0x24, version_arg_offset]))  # mov eax,[esp+arg]
        emit(bytes([0x85, 0xC0, 0x74, 0x0F]))  # test eax,eax; jz generic
        emit(bytes([0x81, 0x78, 0x04]), b"MAPP")  # cmp [eax+4],'MAPP'
        emit(bytes([0x75, 0x06]))  # jne generic
        apps_mov = emit(bytes([0xB8, 0, 0, 0, 0, 0xC3]))
        generic_mov = emit(bytes([0xB8, 0, 0, 0, 0, 0xC3]))
        return apps_mov, generic_mov

    apps_mov_find, iface_mov_find = emit_iface_selector(
        "SteamInternal_FindOrCreateUserInterface", 8
    )
    apps_mov_create, iface_mov_create = emit_iface_selector(
        "SteamInternal_CreateInterface", 4
    )

    label("apps_language")
    apps_language_mov = emit_mov_eax_imm_ret("apps_language_fix")
    label("apps_languages")
    apps_languages_mov = emit_mov_eax_imm_ret("apps_languages_fix")

    # SteamInternal_ContextInit(void *pData):
    # Layout of ContextInitData (x86):
    #   +0: void (*pFn)(void *pCtx)   ; 4
    #   +4: uint32 counter            ; 4
    #   +8: CSteamAPIContext ctx      ; array of interface pointers
    # If counter != g_counter, call pFn(&ctx) then set counter = g_counter.
    # Return &ctx (pData+8).
    #
    # asm:
    #   mov eax, [esp+4]        ; pData
    #   mov ecx, [eax+4]        ; counter
    #   cmp ecx, [g_counter]
    #   je .done
    #   push eax                ; save pData
    #   lea ecx, [eax+8]        ; &ctx
    #   push ecx
    #   mov edx, [eax]          ; pFn
    #   call edx
    #   add esp, 4
    #   pop eax
    #   mov ecx, [g_counter]
    #   mov [eax+4], ecx
    # .done:
    #   lea eax, [eax+8]
    #   ret
    label("SteamInternal_ContextInit")
    emit(bytes([0x8B, 0x44, 0x24, 0x04]))  # mov eax,[esp+4]
    emit(bytes([0x8B, 0x48, 0x04]))  # mov ecx,[eax+4]
    # cmp ecx, [imm32] absolute
    ctx_cmp_off = emit(bytes([0x3B, 0x0D, 0, 0, 0, 0]))  # patch g_counter VA
    # skip body if counter already matches: body is 22 (0x16) bytes
    emit(bytes([0x74, 0x16]))  # je +0x16 -> done
    emit(bytes([0x50]))  # push eax
    emit(bytes([0x8D, 0x48, 0x08]))  # lea ecx,[eax+8]
    emit(bytes([0x51]))  # push ecx
    emit(bytes([0x8B, 0x10]))  # mov edx,[eax]
    emit(bytes([0xFF, 0xD2]))  # call edx
    emit(bytes([0x83, 0xC4, 0x04]))  # add esp,4  (cdecl pFn)
    emit(bytes([0x58]))  # pop eax
    # mov ecx, [g_counter]; mov [eax+4], ecx
    ctx_load_off = emit(bytes([0x8B, 0x0D, 0, 0, 0, 0]))  # patch
    emit(bytes([0x89, 0x48, 0x04]))  # mov [eax+4],ecx
    # done:
    emit(bytes([0x8D, 0x40, 0x08]))  # lea eax,[eax+8]
    emit(bytes([0xC3]))

    # pad text
    while len(text) % 16:
        text.append(0x90)

    text_raw = bytes(text)

    # ------------------------------------------------------------------
    # rdata: strings, vtable, export, import
    # ------------------------------------------------------------------
    rdata = bytearray()
    # unique debug messages
    msg = b"[ISAAC_STUB] SteamInternal_SteamAPI_Init OK (offline)\n\x00"
    msg_off = len(rdata)
    rdata += msg
    while len(rdata) % 4:
        rdata += b"\x00"
    msg_reg = b"[ISAAC_STUB] RegisterCallback (cdecl)\n\x00"
    msg_reg_off = len(rdata)
    rdata += msg_reg
    while len(rdata) % 4:
        rdata += b"\x00"

    language_off = len(rdata)
    rdata += b"english\x00"
    languages_off = len(rdata)
    rdata += b"english\x00"
    while len(rdata) % 4:
        rdata += b"\x00"

    # vtable: 256 pointers to noop functions (filled with VAs after layout)
    vtable_off = len(rdata)
    rdata += b"\x00" * (256 * 4)
    apps_vtable_off = len(rdata)
    rdata += b"\x00" * (64 * 4)

    # import: KERNEL32.dll -> OutputDebugStringA
    # We need: ILT, IAT, hint/name, DLL name, import descriptors
    dll_name_off = len(rdata)
    rdata += b"KERNEL32.dll\x00"
    while len(rdata) % 2:
        rdata += b"\x00"
    hintname_off = len(rdata)
    rdata += u16(0)  # hint
    rdata += b"OutputDebugStringA\x00"
    while len(rdata) % 4:
        rdata += b"\x00"

    # ILT (one entry + null) and IAT (same)
    # We'll place them and fill with rdata_rva+hintname_off
    ilt_off = len(rdata)
    rdata += u32(0)  # patch: RVA of hint/name
    rdata += u32(0)  # null
    iat_off = len(rdata)
    rdata += u32(0)  # patch: same
    rdata += u32(0)

    # Import descriptor (1 + null)
    import_desc_off = len(rdata)
    # OriginalFirstThunk, TimeDateStamp, ForwarderChain, Name, FirstThunk
    rdata += u32(0)  # OFT - patch ILT rva
    rdata += u32(0)
    rdata += u32(0)
    rdata += u32(0)  # Name - patch dll name rva
    rdata += u32(0)  # FT - patch IAT rva
    rdata += b"\x00" * 20  # null descriptor

    # Export names
    export_names = [
        "SteamAPI_GetHSteamPipe",
        "SteamAPI_GetHSteamUser",
        "SteamAPI_Init",
        "SteamAPI_InitSafe",
        "SteamAPI_IsSteamRunning",
        "SteamAPI_RegisterCallResult",
        "SteamAPI_RegisterCallback",
        "SteamAPI_ReleaseCurrentThreadMemory",
        "SteamAPI_RunCallbacks",
        "SteamAPI_Shutdown",
        "SteamAPI_UnregisterCallResult",
        "SteamAPI_UnregisterCallback",
        "SteamInternal_ContextInit",
        "SteamInternal_CreateInterface",
        "SteamInternal_FindOrCreateUserInterface",
        "SteamInternal_SteamAPI_Init",
    ]
    # map export name -> code label
    export_code = {
        "SteamAPI_GetHSteamPipe": "SteamAPI_GetHSteamPipe",
        "SteamAPI_GetHSteamUser": "SteamAPI_GetHSteamUser",
        "SteamAPI_Init": "SteamAPI_Init",
        "SteamAPI_InitSafe": "SteamAPI_InitSafe",
        "SteamAPI_IsSteamRunning": "SteamAPI_IsSteamRunning",
        "SteamAPI_RegisterCallResult": "SteamAPI_RegisterCallResult",
        "SteamAPI_RegisterCallback": "SteamAPI_RegisterCallback",
        "SteamAPI_ReleaseCurrentThreadMemory": "SteamAPI_ReleaseCurrentThreadMemory",
        "SteamAPI_RunCallbacks": "SteamAPI_RunCallbacks",
        "SteamAPI_Shutdown": "SteamAPI_Shutdown",
        "SteamAPI_UnregisterCallResult": "SteamAPI_UnregisterCallResult",
        "SteamAPI_UnregisterCallback": "SteamAPI_UnregisterCallback",
        "SteamInternal_ContextInit": "SteamInternal_ContextInit",
        "SteamInternal_CreateInterface": "SteamInternal_CreateInterface",
        "SteamInternal_FindOrCreateUserInterface": "SteamInternal_FindOrCreateUserInterface",
        "SteamInternal_SteamAPI_Init": "SteamInternal_SteamAPI_Init",
    }

    exp_dll_name_off = len(rdata)
    rdata += b"steam_api.dll\x00"
    name_offs = {}
    for n in export_names:
        name_offs[n] = len(rdata)
        rdata += n.encode("ascii") + b"\x00"
    while len(rdata) % 4:
        rdata += b"\x00"

    eat_off = len(rdata)
    rdata += b"\x00" * (4 * len(export_names))  # filled later with func RVAs
    enpt_off = len(rdata)
    rdata += b"\x00" * (4 * len(export_names))  # name RVAs
    eot_off = len(rdata)
    for i in range(len(export_names)):
        rdata += u16(i)
    while len(rdata) % 4:
        rdata += b"\x00"

    export_dir_off = len(rdata)
    rdata += b"\x00" * 40

    rdata_vsize = len(rdata)

    # ------------------------------------------------------------------
    # data: g_counter, g_iface_obj (ptr to vtable)
    # ------------------------------------------------------------------
    data = bytearray()
    g_counter_off = len(data)
    data += u32(1)  # g_counter starts at 1
    g_iface_off = len(data)
    data += u32(0)  # ptr to vtable — patched
    apps_iface_off = len(data)
    data += u32(0)  # ptr to ISteamApps vtable — patched
    # space for a simple CSteamAPIContext (32 interface slots) that
    # ContextInit's pFn may write into — zeroed is fine; pFn will fill.
    data_vsize = len(data)

    # ------------------------------------------------------------------
    # Layout RVAs
    # ------------------------------------------------------------------
    text_rva = SECT_ALIGN
    text_raw_size = align(len(text_raw), FILE_ALIGN)
    text_vsize = len(text_raw)

    rdata_rva = text_rva + align(text_vsize, SECT_ALIGN)
    rdata_raw_size = align(rdata_vsize, FILE_ALIGN)

    data_rva = rdata_rva + align(rdata_vsize, SECT_ALIGN)
    data_raw_size = align(max(data_vsize, 4), FILE_ALIGN)

    size_of_image = align(data_rva + align(data_vsize, SECT_ALIGN), SECT_ALIGN)

    # ------------------------------------------------------------------
    # Patch rdata tables with RVAs
    # ------------------------------------------------------------------
    # ILT / IAT point to hint/name
    struct.pack_into("<I", rdata, ilt_off, rdata_rva + hintname_off)
    struct.pack_into("<I", rdata, iat_off, rdata_rva + hintname_off)
    # import descriptor
    struct.pack_into("<I", rdata, import_desc_off + 0, rdata_rva + ilt_off)
    struct.pack_into("<I", rdata, import_desc_off + 12, rdata_rva + dll_name_off)
    struct.pack_into("<I", rdata, import_desc_off + 16, rdata_rva + iat_off)

    # EAT function RVAs
    for i, n in enumerate(export_names):
        code_off = labels[export_code[n]]
        struct.pack_into("<I", rdata, eat_off + i * 4, text_rva + code_off)
    # name pointers
    for i, n in enumerate(export_names):
        struct.pack_into("<I", rdata, enpt_off + i * 4, rdata_rva + name_offs[n])

    # export directory
    ed = bytearray(40)
    struct.pack_into("<I", ed, 12, rdata_rva + exp_dll_name_off)
    struct.pack_into("<I", ed, 16, 1)  # Base
    struct.pack_into("<I", ed, 20, len(export_names))
    struct.pack_into("<I", ed, 24, len(export_names))
    struct.pack_into("<I", ed, 28, rdata_rva + eat_off)
    struct.pack_into("<I", ed, 32, rdata_rva + enpt_off)
    struct.pack_into("<I", ed, 36, rdata_rva + eot_off)
    rdata[export_dir_off : export_dir_off + 40] = ed

    # vtable entries -> text_rva+noop offsets (as VAs for runtime)
    noop_cycle = [
        labels["noop0"],
        labels["noop1"],
        labels["noop2"],
        labels["noop3"],
        labels["noop64"],
    ]
    for i in range(256):
        off = noop_cycle[i % 5]
        va = IMAGE_BASE + text_rva + off
        struct.pack_into("<I", rdata, vtable_off + i * 4, va)

    for i in range(64):
        off = noop_cycle[i % 5]
        struct.pack_into(
            "<I", rdata, apps_vtable_off + i * 4, IMAGE_BASE + text_rva + off
        )
    apps_methods = {
        0: labels["ret1"],
        1: labels["ret0"],
        2: labels["ret0"],
        3: labels["ret0"],
        4: labels["apps_language"],
        5: labels["apps_languages"],
        6: labels["ret1_arg1"],  # BIsSubscribedApp(AppId_t)
        7: labels["ret1_arg1"],  # BIsDlcInstalled(AppId_t)
        8: labels["noop1"],
        9: labels["ret0"],
        10: labels["ret0"],
    }
    for index, off in apps_methods.items():
        struct.pack_into(
            "<I", rdata, apps_vtable_off + index * 4, IMAGE_BASE + text_rva + off
        )

    # data: interface objects point to their vtables
    struct.pack_into("<I", data, g_iface_off, IMAGE_BASE + rdata_rva + vtable_off)
    struct.pack_into(
        "<I", data, apps_iface_off, IMAGE_BASE + rdata_rva + apps_vtable_off
    )

    # ------------------------------------------------------------------
    # Patch code immediates (absolute VAs)
    # ------------------------------------------------------------------
    text = bytearray(text_raw)

    def patch_u32(off: int, val: int) -> None:
        struct.pack_into("<I", text, off, val & 0xFFFFFFFF)

    # dbg_init / dbg_reg: push msg VA; call [iat VA]
    patch_u32(dbg_push_off + 1, IMAGE_BASE + rdata_rva + msg_off)
    patch_u32(dbg_call_off + 2, IMAGE_BASE + rdata_rva + iat_off)
    patch_u32(dbg_reg_push_off + 1, IMAGE_BASE + rdata_rva + msg_reg_off)
    patch_u32(dbg_reg_call_off + 2, IMAGE_BASE + rdata_rva + iat_off)

    # call dbg_init from SteamInternal_SteamAPI_Init
    init_call = labels["SteamInternal_SteamAPI_Init"]
    assert text[init_call] == 0xE8
    rel = labels["dbg_init"] - (init_call + 5)
    patch_u32(init_call + 1, rel)

    # call dbg_init from SteamAPI_Init
    api_init = labels["SteamAPI_Init"]
    assert text[api_init] == 0xE8
    rel = labels["dbg_init"] - (api_init + 5)
    patch_u32(api_init + 1, rel)

    # call dbg_reg from SteamAPI_RegisterCallback
    reg_call = labels["SteamAPI_RegisterCallback"]
    assert text[reg_call] == 0xE8
    rel = labels["dbg_reg"] - (reg_call + 5)
    patch_u32(reg_call + 1, rel)

    # iface returns
    iface_va = IMAGE_BASE + data_rva + g_iface_off
    apps_iface_va = IMAGE_BASE + data_rva + apps_iface_off
    patch_u32(iface_mov_find + 1, iface_va)
    patch_u32(iface_mov_create + 1, iface_va)
    patch_u32(apps_mov_find + 1, apps_iface_va)
    patch_u32(apps_mov_create + 1, apps_iface_va)
    patch_u32(apps_language_mov + 1, IMAGE_BASE + rdata_rva + language_off)
    patch_u32(apps_languages_mov + 1, IMAGE_BASE + rdata_rva + languages_off)

    # ContextInit g_counter absolute addresses
    g_counter_va = IMAGE_BASE + data_rva + g_counter_off
    # ctx_cmp_off is offset of 3B 0D xx xx xx xx
    patch_u32(ctx_cmp_off + 2, g_counter_va)
    patch_u32(ctx_load_off + 2, g_counter_va)

    text_raw = bytes(text)

    # ------------------------------------------------------------------
    # PE headers
    # ------------------------------------------------------------------
    num_sections = 3
    # DOS
    dos = bytearray(0x80)
    dos[0:2] = b"MZ"
    struct.pack_into("<I", dos, 0x3C, 0x80)

    pe_sig = b"PE\0\0"
    coff = struct.pack(
        "<HHIIIHH",
        0x14C,
        num_sections,
        0,
        0,
        0,
        0xE0,
        0x2102,  # EXECUTABLE | 32BIT | DLL
    )

    opt = bytearray(0xE0)
    struct.pack_into("<H", opt, 0, 0x10B)
    opt[2] = 14
    opt[3] = 0
    struct.pack_into("<I", opt, 4, text_raw_size)
    struct.pack_into("<I", opt, 8, rdata_raw_size + data_raw_size)
    struct.pack_into("<I", opt, 12, 0)
    struct.pack_into("<I", opt, 16, 0)  # no entry (DllMain optional)
    struct.pack_into("<I", opt, 20, text_rva)
    struct.pack_into("<I", opt, 24, rdata_rva)
    struct.pack_into("<I", opt, 28, IMAGE_BASE)
    struct.pack_into("<I", opt, 32, SECT_ALIGN)
    struct.pack_into("<I", opt, 36, FILE_ALIGN)
    struct.pack_into("<H", opt, 40, 6)
    struct.pack_into("<H", opt, 42, 0)
    struct.pack_into("<H", opt, 48, 6)
    struct.pack_into("<I", opt, 56, size_of_image)
    struct.pack_into("<I", opt, 60, HEADERS)
    struct.pack_into("<H", opt, 68, 2)  # GUI
    struct.pack_into("<H", opt, 70, 0x100)  # NX_COMPAT only (no ASLR for simpler load)
    struct.pack_into("<I", opt, 72, 0x100000)
    struct.pack_into("<I", opt, 76, 0x1000)
    struct.pack_into("<I", opt, 80, 0x100000)
    struct.pack_into("<I", opt, 84, 0x1000)
    struct.pack_into("<I", opt, 92, 16)
    # export dir
    struct.pack_into("<I", opt, 96, rdata_rva + export_dir_off)
    struct.pack_into("<I", opt, 100, 40)
    # import dir
    struct.pack_into("<I", opt, 104, rdata_rva + import_desc_off)
    struct.pack_into("<I", opt, 108, 40)
    # IAT dir (helps some loaders)
    struct.pack_into("<I", opt, 96 + 12 * 8, rdata_rva + iat_off)
    struct.pack_into("<I", opt, 96 + 12 * 8 + 4, 8)

    def section(name: str, vsize: int, va: int, raw_size: int, raw_ptr: int, chars: int) -> bytes:
        b = bytearray(40)
        nb = name.encode("ascii")[:8]
        b[0 : len(nb)] = nb
        struct.pack_into("<I", b, 8, vsize)
        struct.pack_into("<I", b, 12, va)
        struct.pack_into("<I", b, 16, raw_size)
        struct.pack_into("<I", b, 20, raw_ptr)
        struct.pack_into("<I", b, 36, chars)
        return bytes(b)

    raw_ptr = HEADERS
    sec_text = section(".text", text_vsize, text_rva, text_raw_size, raw_ptr, 0x60000020)
    raw_ptr += text_raw_size
    sec_rdata = section(".rdata", rdata_vsize, rdata_rva, rdata_raw_size, raw_ptr, 0x40000040)
    raw_ptr += rdata_raw_size
    sec_data = section(".data", max(data_vsize, 4), data_rva, data_raw_size, raw_ptr, 0xC0000040)

    headers = bytearray()
    headers += dos
    headers += pe_sig
    headers += coff
    headers += opt
    headers += sec_text
    headers += sec_rdata
    headers += sec_data
    assert len(headers) <= HEADERS
    headers += b"\x00" * (HEADERS - len(headers))

    pe = (
        bytes(headers)
        + text_raw
        + b"\x00" * (text_raw_size - len(text_raw))
        + bytes(rdata)
        + b"\x00" * (rdata_raw_size - len(rdata))
        + bytes(data)
        + b"\x00" * (data_raw_size - len(data))
    )
    return pe


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "native" / "steam_stub" / "steam_api.dll"
    pe = build()
    out.write_bytes(pe)
    print("wrote", out, "size", len(pe))
    assert pe[:2] == b"MZ"
    assert b"[ISAAC_STUB]" in pe
    assert b"OutputDebugStringA" in pe
    assert b"SteamInternal_ContextInit" in pe


if __name__ == "__main__":
    main()
