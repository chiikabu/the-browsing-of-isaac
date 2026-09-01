"""Cross-cut the import census by owning component, and group into subsystems.

The port-relevant question is not "does the binary import CreateWindowExW" but
"who calls it". If every user32 call site sits inside the vendored GLFW copy,
the host shim is GLFW-shaped (one well-known API, already ported to the browser
by emscripten) rather than Win32-shaped. This pass answers that by mapping every
IAT call site to its containing function and then to that function's attributed
component.
"""

import bisect
import json
import re
import struct
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pe_model import PE, default_target  # noqa: E402
from scan import MOV_REG_ABS  # noqa: E402

OUT = Path(__file__).resolve().parents[3] / "output" / "recomp" / "census"

# Subsystem grouping. Order matters: first match wins.
SUBSYSTEMS = [
    ("lua-vm",            lambda d, s: d.startswith("lua")),
    ("cxx-runtime",       lambda d, s: d in ("vcruntime140.dll", "msvcp140.dll")),
    ("crt-runtime",       lambda d, s: d.startswith("api-ms-win-crt-runtime")),
    ("crt-math",          lambda d, s: d.startswith("api-ms-win-crt-math")),
    ("crt-heap",          lambda d, s: d.startswith("api-ms-win-crt-heap")),
    ("crt-string/convert", lambda d, s: d.startswith("api-ms-win-crt-string")
     or d.startswith("api-ms-win-crt-convert") or d.startswith("api-ms-win-crt-utility")),
    ("crt-stdio/fs",      lambda d, s: d.startswith("api-ms-win-crt-stdio")
     or d.startswith("api-ms-win-crt-filesystem")),
    ("crt-misc",          lambda d, s: d.startswith("api-ms-win-crt-")),
    ("steam",             lambda d, s: d == "steam_api.dll"),
    ("epic-eos",          lambda d, s: d.startswith("eossdk")),
    ("audio-openal",      lambda d, s: d == "openal32.dll"),
    ("net-curl",          lambda d, s: d == "libcurl.dll"),
    ("gl",                lambda d, s: d == "opengl32.dll"),
    ("gdi",               lambda d, s: d == "gdi32.dll"),
    ("win-window/input",  lambda d, s: d == "user32.dll"),
    ("win-timing",        lambda d, s: d == "winmm.dll"),
    ("win-shell/com",     lambda d, s: d in ("shell32.dll", "ole32.dll", "advapi32.dll",
                                             "bcrypt.dll", "dbghelp.dll")),
]

# kernel32 splits by function family, which is where the browser difficulty lives.
K32_GROUPS = [
    ("k32-threads/sync", re.compile(
        r"^(CreateThread|ExitThread|ResumeThread|SuspendThread|TerminateThread|"
        r"GetCurrentThread|SetThreadPriority|GetThreadPriority|"
        r"Sleep|SleepEx|SwitchToThread|WaitFor|"
        r"InitializeCriticalSection|EnterCriticalSection|LeaveCriticalSection|"
        r"DeleteCriticalSection|TryEnterCriticalSection|"
        r"InitializeSListHead|InterlockedFlushSList|InterlockedPushEntrySList|"
        r"InterlockedPopEntrySList|"
        r"CreateEvent|SetEvent|ResetEvent|CreateMutex|ReleaseMutex|"
        r"CreateSemaphore|ReleaseSemaphore|"
        r"Tls(Alloc|Free|GetValue|SetValue)|FlsAlloc|FlsFree|FlsGetValue|FlsSetValue|"
        r"InitOnce|WakeAllConditionVariable|SleepConditionVariable|"
        r"AcquireSRW|ReleaseSRW|InitializeSRW|"
        r"RegisterWaitForSingleObject|UnregisterWait|QueueUserWorkItem|"
        r"SetThreadStackGuarantee|GetCurrentThreadId)")),
    ("k32-file-io", re.compile(
        r"^(CreateFile|ReadFile|WriteFile|CloseHandle|DeleteFile|MoveFile|CopyFile|"
        r"SetFilePointer|GetFileSize|GetFileAttributes|SetFileAttributes|"
        r"FindFirstFile|FindNextFile|FindClose|CreateDirectory|RemoveDirectory|"
        r"GetCurrentDirectory|SetCurrentDirectory|GetFullPathName|GetTempPath|"
        r"GetTempFileName|FlushFileBuffers|SetEndOfFile|GetFileType|"
        r"GetFileInformation|ReadDirectoryChanges|GetLongPathName|GetShortPathName|"
        r"AreFileApisANSI|SetStdHandle|GetStdHandle|WriteConsole|GetDriveType|"
        r"GetLogicalDrives|GetDiskFreeSpace|GetFileTime|SetFileTime)")),
    ("k32-memory/heap", re.compile(
        r"^(VirtualAlloc|VirtualFree|VirtualProtect|VirtualQuery|"
        r"HeapAlloc|HeapFree|HeapCreate|HeapDestroy|HeapReAlloc|HeapSize|"
        r"GetProcessHeap|HeapSetInformation|HeapValidate|"
        r"GlobalAlloc|GlobalFree|GlobalLock|GlobalUnlock|LocalAlloc|LocalFree|"
        r"CreateFileMapping|MapViewOfFile|UnmapViewOfFile|"
        r"GetSystemInfo|GlobalMemoryStatus)")),
    ("k32-module/loader", re.compile(
        r"^(LoadLibrary|FreeLibrary|GetProcAddress|GetModuleHandle|GetModuleFileName|"
        r"DisableThreadLibraryCalls|GetModuleHandleEx)")),
    ("k32-time", re.compile(
        r"^(QueryPerformanceCounter|QueryPerformanceFrequency|GetTickCount|"
        r"GetSystemTime|GetLocalTime|SystemTimeToFileTime|FileTimeToSystemTime|"
        r"GetSystemTimeAsFileTime|SetTimer|timeGetTime|GetDateFormat|GetTimeFormat|"
        r"TzSpecificLocalTimeToSystemTime|SystemTimeToTzSpecificLocalTime|"
        r"GetTimeZoneInformation|GetDynamicTimeZoneInformation|FileTimeToLocalFileTime|"
        r"LocalFileTimeToFileTime|GetSystemTimePreciseAsFileTime)")),
    ("k32-error/debug", re.compile(
        r"^(GetLastError|SetLastError|OutputDebugString|IsDebuggerPresent|"
        r"DebugBreak|RaiseException|SetUnhandledExceptionFilter|"
        r"UnhandledExceptionFilter|RtlUnwind|RtlCaptureContext|RtlLookupFunctionEntry|"
        r"RtlVirtualUnwind|TerminateProcess|ExitProcess|GetCurrentProcess|"
        r"GetCurrentProcessId|SetErrorMode|FatalAppExit|"
        r"AddVectoredExceptionHandler|RtlPcToFileHeader|"
        r"GetExitCodeProcess|GetProcessAffinityMask|SetProcessAffinityMask)")),
    ("k32-locale/encoding", re.compile(
        r"^(MultiByteToWideChar|WideCharToMultiByte|GetACP|GetOEMCP|GetCPInfo|"
        r"IsValidCodePage|GetUserDefaultLCID|GetLocaleInfo|LCMapString|"
        r"CompareString|GetUserDefaultUILanguage|EnumSystemLocales|"
        r"IsValidLocale|GetStringType)")),
    ("k32-env/process", re.compile(
        r"^(GetEnvironmentStrings|FreeEnvironmentStrings|GetEnvironmentVariable|"
        r"SetEnvironmentVariable|GetCommandLine|CreateProcess|"
        r"GetStartupInfo|ExpandEnvironmentStrings|GetComputerName|GetUserName|"
        r"GetVersion|VerifyVersionInfo|VerSetConditionMask|"
        r"IsProcessorFeaturePresent|GetNativeSystemInfo|"
        r"GetSystemDirectory|GetWindowsDirectory|SetDllDirectory|"
        r"SetSearchPathMode|SetDefaultDllDirectories|GetProcessTimes|"
        r"EncodePointer|DecodePointer|GetUserDefaultLangID)")),
]


def k32_group(sym):
    for name, rx in K32_GROUPS:
        if rx.search(sym):
            return name
    return "k32-other"


def subsystem_for(dll, sym):
    if dll == "kernel32.dll":
        return k32_group(sym)
    for name, pred in SUBSYSTEMS:
        if pred(dll, sym):
            return name
    return "other:" + dll


def main():
    pe = PE(default_target())
    imports = json.loads((OUT / "imports.json").read_text(encoding="utf-8"))
    idx = json.loads((OUT / "text-index.json").read_text(encoding="utf-8"))
    attribution = json.loads((OUT / "attribution.json").read_text(encoding="utf-8"))

    funcs = idx["functions"]
    fvas = [f[0] for f in funcs]

    def owner(addr):
        i = bisect.bisect_right(fvas, addr) - 1
        return fvas[i] if i >= 0 else None

    # rebuild the per-function component map (attribute.py stores only rollups)
    # by re-running the same assignment is expensive; instead reuse the exported
    # per-function assignment if present, else fall back to "unknown".
    assign = {}
    pf = OUT / "func-components.json"
    if pf.exists():
        assign = {int(k, 16): v for k, v in
                  json.loads(pf.read_text(encoding="utf-8")).items()}

    # ---- locate every IAT call site and its owning function ---------------
    slot_info = {int(r["iatVa"], 16): r for r in imports["symbols"]}
    text = pe.section(".text")
    lo, hi = text.raw_offset, text.raw_offset + text.raw_size
    base_va = pe.image_base + text.rva
    d = pe.data

    # Only call/jmp forms count as call sites, matching imports.json's
    # "callSites" metric exactly; mov/push (address-taken) is tracked apart.
    sites_by_slot = defaultdict(list)
    addr_taken_by_slot = defaultdict(list)
    thunk_of = {}
    i = lo
    while i < hi - 6:
        b = d[i]
        if b == 0xFF and d[i + 1] in (0x15, 0x25, 0x35):
            imm = struct.unpack_from("<I", d, i + 2)[0]
            if imm in slot_info:
                site = base_va + (i - lo)
                if d[i + 1] == 0x25:
                    thunk_of[site] = imm
                elif d[i + 1] == 0x15:
                    sites_by_slot[imm].append(site)
                else:
                    addr_taken_by_slot[imm].append(site)
                i += 6
                continue
        elif b == 0x8B and d[i + 1] in MOV_REG_ABS:
            imm = struct.unpack_from("<I", d, i + 2)[0]
            if imm in slot_info:
                addr_taken_by_slot[imm].append(base_va + (i - lo))
                i += 6
                continue
        i += 1

    # calls that land on a thunk count against the thunk's slot
    i = lo
    while i < hi - 5:
        b = d[i]
        if b in (0xE8, 0xE9):
            rel = struct.unpack_from("<i", d, i + 1)[0]
            site = base_va + (i - lo)
            tgt = (site + 5 + rel) & 0xFFFFFFFF
            if tgt in thunk_of:
                sites_by_slot[thunk_of[tgt]].append(site)
        i += 1

    # ---- roll up by subsystem and by calling component --------------------
    sub = defaultdict(lambda: {"symbols": 0, "used": 0, "callSites": 0,
                               "addressTaken": 0, "dlls": set(),
                               "byComponent": defaultdict(int), "topSymbols": []})
    per_symbol_component = {}
    for va, r in slot_info.items():
        name = subsystem_for(r["dll"], r["symbol"])
        e = sub[name]
        e["symbols"] += 1
        e["dlls"].add(r["dll"])
        if r["callSites"] > 0:
            e["used"] += 1
        e["callSites"] += r["callSites"]
        e["addressTaken"] += len(addr_taken_by_slot.get(va, []))
        comps = defaultdict(int)
        for site in sites_by_slot.get(va, []):
            f = owner(site)
            comp = assign.get(f, "(game/unattributed)") if f is not None else "?"
            e["byComponent"][comp] += 1
            comps[comp] += 1
        per_symbol_component[r["symbol"] + "@" + r["dll"]] = {
            "callSites": r["callSites"], "byComponent": dict(comps)}
        e["topSymbols"].append((r["symbol"], r["callSites"], r["dll"],
                                dict(comps)))

    out = []
    for name, e in sorted(sub.items(), key=lambda kv: -kv[1]["callSites"]):
        e["topSymbols"].sort(key=lambda t: -t[1])
        out.append({
            "subsystem": name,
            "dlls": sorted(e["dlls"]),
            "symbols": e["symbols"],
            "usedSymbols": e["used"],
            "unusedSymbols": e["symbols"] - e["used"],
            "callSites": e["callSites"],
            "addressTaken": e["addressTaken"],
            "callSitesByComponent": dict(sorted(e["byComponent"].items(),
                                                key=lambda kv: -kv[1])),
            "topSymbols": [{"symbol": s, "callSites": c, "dll": dl,
                            "byComponent": bc}
                           for s, c, dl, bc in e["topSymbols"][:40]],
        })

    (OUT / "subsystems.json").write_text(json.dumps(
        {"subsystems": out, "perSymbolComponent": per_symbol_component},
        indent=1), encoding="utf-8")

    print("%-22s %6s %6s %8s  %s" % ("subsystem", "syms", "used", "calls", "top callers"))
    for s in out:
        comps = ", ".join("%s=%d" % (k, v) for k, v in
                          list(s["callSitesByComponent"].items())[:3])
        print("%-22s %6d %6d %8d  %s" % (
            s["subsystem"], s["symbols"], s["usedSymbols"], s["callSites"], comps))
    print("\nwrote", OUT / "subsystems.json")


if __name__ == "__main__":
    main()
