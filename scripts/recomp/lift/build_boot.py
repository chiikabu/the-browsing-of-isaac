"""Link the host layer + lifted objects into the boot ES module.

This is the union of scripts/recomp/host/build_selftest.py (host sources,
Lua, identity-address memory flags) and scripts/recomp/lift/build_wasm.py
(parallel lifted-TU compile). The Aug-10 boot.wasm was produced by an
ad-hoc bash recipe (output/recomp/lift/boot/link_prof.sh) that was never
checked in; this script is that recipe, plus _isaac_fs_seed.

Default lift tree is output/recomp/lift/gu (23,381 functions, the 271 MB
module that reached main). output/recomp/lift/full is the earlier 7,963-
function slice and cannot reach the HUD path. Override with --dir.

Run:  python scripts/recomp/lift/build_boot.py
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
HOST = HERE.parent / "host"
REPO_ROOT = HERE.parents[2]
OUT_LIFT = REPO_ROOT / "output" / "recomp" / "lift"
OUT_HOST = REPO_ROOT / "output" / "recomp" / "host"
BOOT_OUT = OUT_LIFT / "boot"
LUA_SRC = REPO_ROOT / "tools" / "lua-5.3.3" / "src"
LUA_LIB = OUT_HOST / "lua" / "liblua.a"

# Prior boot export set (link_prof.sh) plus the 2026-08-31 RAM-FS seed hook.
# boot_integration.mjs is the only JS caller; grep m._isaac_* there before
# adding more names.
EXPORTED_FUNCTIONS = [
    "_malloc",
    "_free",
    "_isaac_place_image",
    "_isaac_layout_check",
    "_isaac_guard_arm",
    "_isaac_guard_check",
    "_isaac_run_boot",
    "_isaac_run_main",
    "_isaac_fs_seed",
    "_isaac_fs_seed_lazy",
    "_isaac_stub_report",
    "_isaac_heap_report",
    "_isaac_module_report",
]


def ensure_emsdk_env():
    """emcc is not on PATH in this environment; export EMSDK every process."""
    home = Path.home()
    emsdk = Path(os.environ.get("EMSDK", home / "emsdk"))
    if emsdk.is_dir():
        os.environ["EMSDK"] = str(emsdk)
        prepend = [
            str(emsdk),
            str(emsdk / "upstream" / "emscripten"),
            str(emsdk / "upstream" / "bin"),
        ]
        os.environ["PATH"] = os.pathsep.join(
            prepend + [os.environ.get("PATH", "")])


def find_emcc():
    """Locate emcc without relying on PATH. Mirrors host/build_selftest.py."""
    cand = os.environ.get("EMCC")
    roots = [cand] if cand else []
    roots += [r"C:\Users\Luca\emsdk\upstream\emscripten\emcc",
              str(Path.home() / "emsdk" / "upstream" / "emscripten" / "emcc"),
              "emcc"]
    for r in roots:
        for ext in (".exe", ".bat", ".cmd", ""):
            p = Path(r + ext)
            if p.exists() and p.is_file():
                return str(p)
    from shutil import which
    return which("emcc")


def default_lift_dir():
    """Prefer the lift that actually booted (gu), then the 96% slice, then full."""
    for name in ("gu", "gabs", "full"):
        d = OUT_LIFT / name
        if any(d.glob("lifted_*.c")):
            return d
    return OUT_LIFT / "full"


HOST_CFLAGS = [
    "-O1", "-std=gnu11", "-Wall", "-Wextra", "-Wno-unused-parameter",
]
# Lifted TUs were built -O2 -DRECOMP_MEM_CHECK=1; reuse those objects when
# present so a relink does not wait on 492 MB of C. Recompile with the same
# flags if --recompile-lifted or an object is missing.
LIFT_CFLAGS = ["-O2", "-w", "-DRECOMP_MEM_CHECK=1"]

LDFLAGS = [
    "-O2", "-w", "--no-entry", "--profiling-funcs",
    "-sINITIAL_MEMORY=402653184",
    "-sALLOW_MEMORY_GROWTH=1",
    "-sGLOBAL_BASE=268435456",
    "-sSTACK_SIZE=1048576",
    "-sASSERTIONS=1",
    "-sENVIRONMENT=node",
    "-sNODERAWFS=1",
    "-sMODULARIZE=1",
    "-sEXPORT_ES6=1",
    "-sEXPORTED_RUNTIME_METHODS=HEAPU8",
]


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def compile_one(emcc, src, obj, flags):
    obj.parent.mkdir(parents=True, exist_ok=True)
    cmd = [emcc, "-c", *flags, str(src), "-o", str(obj)]
    r = run(cmd)
    msg = (r.stderr or "") + (r.stdout or "")
    return {
        "src": str(src),
        "obj": str(obj),
        "rc": r.returncode,
        "errors": msg.count("error:"),
        "warnings": msg.count("warning:"),
        "tail": "\n".join(msg.splitlines()[-30:]),
    }


def py_cmd(*args):
    return [sys.executable, *args]


def main():
    ensure_emsdk_env()
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", type=Path, default=default_lift_dir(),
                    help="lifted TU directory (default: gu, then gabs, then full)")
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 4)
    ap.add_argument("--recompile-lifted", action="store_true",
                    help="rebuild lifted_*.o even if objects already exist")
    ap.add_argument("--skip-dispatch-gen", action="store_true",
                    help="reuse existing dispatch_tbl.c / stubs.c")
    ap.add_argument("--fast-link", dest="fast_link", action="store_true", default=True,
                    help="(default) link at -O0: no wasm-opt pass over the 272 MB module. The "
                         "lifted objects are already -O2, so only the JS glue and dead-code "
                         "elimination differ. Measured 2026-09-01: link 474 s -> 8.0 s, whole "
                         "host-only relink 520 s -> 133 s; module 272 -> 284 MB.")
    ap.add_argument("--opt-link", dest="fast_link", action="store_false",
                    help="link at -O2 (wasm-opt over the whole module, ~8 min) for a shipping build")
    ap.add_argument("--no-lift-patches", action="store_true",
                    help="do not apply scripts/recomp/lift/lift_patches.py to the lifted TUs")
    ap.add_argument("--fast", action="store_true",
                    help="speed profile: lifted TUs with -DRECOMP_MEM_CHECK=0 (no bounds checks, VA "
                         "ring, memory watch or stall tick), objects as lifted_NNN.fast.o, output in "
                         "boot-fast/, wasm-opt link. Faults become raw wasm traps; measure with it, "
                         "debug with the default profile.")
    args = ap.parse_args()
    global BOOT_OUT, LIFT_CFLAGS
    lift_obj_suffix = ".o"
    if args.fast:
        BOOT_OUT = OUT_LIFT / "boot-fast"
        LIFT_CFLAGS = ["-O2", "-w", "-DRECOMP_MEM_CHECK=0"]
        lift_obj_suffix = ".fast.o"
        args.fast_link = False

    emcc = find_emcc()
    if not emcc:
        print("emcc not found; set EMCC=<path to emcc.exe> and EMSDK=$HOME/emsdk")
        return 2

    lift_dir = args.dir.resolve()
    if not any(lift_dir.glob("lifted_*.c")):
        print("no lifted_*.c in %s" % lift_dir)
        return 2
    if not LUA_LIB.exists():
        print("liblua.a missing at %s -- run scripts/recomp/host/lua_build.py" % LUA_LIB)
        return 2

    # ---- source-level overrides of the generated C (idempotent) ----------
    # The canonical exe carries the project's own emulator-era hand patches;
    # the ones that break the recompiled boot are undone HERE, after the lift
    # and BEFORE dispatch generation (the patched bodies keep their RECOMP_VA
    # markers), and the touched TU's object is dropped so it recompiles.
    if not args.no_lift_patches:
        sys.path.insert(0, str(HERE))
        from lift_patches import apply_lift_patches, apply_purge_patches, apply_wrap_patches  # noqa: E402
        patched = (set(apply_lift_patches(lift_dir)) | set(apply_purge_patches(lift_dir))
                   | set(apply_wrap_patches(lift_dir)))
        print("lift-patches: %d TU(s) rewritten" % len(patched))

    BOOT_OUT.mkdir(parents=True, exist_ok=True)
    obj_dir = BOOT_OUT / "obj"
    obj_dir.mkdir(parents=True, exist_ok=True)

    inc_host = [
        "-I", str(HOST / "include"),
        "-I", str(HOST / "generated"),
        "-I", str(HERE),
        "-I", str(lift_dir),
    ]
    if (LUA_SRC / "lua.h").exists():
        inc_host += ["-I", str(LUA_SRC)]
    inc_lift = ["-I", str(HERE), "-I", str(lift_dir),
                "-I", str(HOST / "include")]

    result = {
        "emcc": emcc,
        "liftDir": str(lift_dir),
        "jobs": args.jobs,
        "recompileLifted": args.recompile_lifted,
    }
    v = run([emcc, "--version"])
    result["emccVersion"] = v.stdout.splitlines()[0] if v.stdout else None
    print("emcc : %s" % result["emccVersion"])
    print("lift : %s" % lift_dir)

    # ---- generate dispatch + loud stubs (no imp_* : host owns those) ----
    t_gen = time.time()
    if not args.skip_dispatch_gen:
        r = run(py_cmd(str(HERE / "mkstubs.py"), "--dir", str(lift_dir),
                       "--no-import-stubs"))
        print((r.stdout or "").strip() or "mkstubs.py")
        if r.returncode:
            print("mkstubs.py failed\n%s" % ((r.stderr or "") + (r.stdout or "")))
            return 1
        r = run(py_cmd(str(HERE / "mkdispatch.py"), "--dir", str(lift_dir)))
        print((r.stdout or "").strip() or "mkdispatch.py")
        if r.returncode:
            print("mkdispatch.py failed\n%s" % ((r.stderr or "") + (r.stdout or "")))
            return 1
    result["generate_s"] = round(time.time() - t_gen, 1)

    # ---- compile host src + generated + boot entry + runtime + dispatch ----
    host_srcs = sorted(HOST.glob("src/*.c")) + sorted(HOST.glob("generated/*.c"))
    extra_srcs = [
        HERE / "boot_integration.c",
        HERE / "recomp_rt.c",
        lift_dir / "stubs.c",
        lift_dir / "dispatch_tbl.c",
    ]
    for s in extra_srcs:
        if not s.exists():
            print("missing source %s" % s)
            return 1

    t0 = time.time()
    host_objs = []
    host_fail = []
    for src in host_srcs + extra_srcs:
        obj = obj_dir / (src.stem + ".o")
        flags = HOST_CFLAGS + inc_host
        if src in extra_srcs:
            # boot_integration.c / recomp_rt.c / dispatch / stubs need the
            # lifter headers; keep host warning flags off generated stubs.
            flags = (HOST_CFLAGS if src.name in (
                "boot_integration.c", "recomp_rt.c") else LIFT_CFLAGS) + inc_lift
            if src.name == "recomp_rt.c":
                flags = LIFT_CFLAGS + inc_lift
        info = compile_one(emcc, src, obj, flags)
        if info["rc"] != 0:
            host_fail.append(info)
            print("FAIL %s\n%s" % (src.name, info["tail"]))
        else:
            host_objs.append(obj)
            if info["warnings"]:
                print("%s: %d warnings" % (src.name, info["warnings"]))
    result["hostCompile_s"] = round(time.time() - t0, 1)
    result["hostTUs"] = len(host_srcs) + len(extra_srcs)
    if host_fail:
        result["ok"] = False
        (BOOT_OUT / "build_boot.json").write_text(
            json.dumps(result, indent=2), encoding="utf-8")
        return 1
    print("host : %d TUs in %.1fs" % (len(host_objs), result["hostCompile_s"]))

    # ---- lifted objects: reuse Aug-10 .o unless asked to rebuild ----
    lifted_cs = sorted(lift_dir.glob("lifted_*.c"))
    lifted_objs = []
    need_compile = []
    for src in lifted_cs:
        obj = lift_dir / (src.stem + lift_obj_suffix)
        if args.recompile_lifted or not obj.exists():
            need_compile.append((src, obj))
        else:
            lifted_objs.append(obj)
    t1 = time.time()
    lift_fail = []
    if need_compile:
        print("lift : compiling %d / %d TUs (%d jobs)" % (
            len(need_compile), len(lifted_cs), args.jobs))

        def one(pair):
            src, obj = pair
            return compile_one(emcc, src, obj, LIFT_CFLAGS + inc_lift)

        with cf.ThreadPoolExecutor(max_workers=args.jobs) as ex:
            for info in ex.map(one, need_compile):
                if info["rc"] != 0:
                    lift_fail.append(info)
                    print("FAIL %s\n%s" % (Path(info["src"]).name, info["tail"]))
                else:
                    lifted_objs.append(Path(info["obj"]))
    result["liftCompile_s"] = round(time.time() - t1, 1)
    result["liftedTUs"] = len(lifted_cs)
    result["liftedRecompiled"] = len(need_compile)
    if lift_fail:
        result["ok"] = False
        (BOOT_OUT / "build_boot.json").write_text(
            json.dumps(result, indent=2), encoding="utf-8")
        return 1
    print("lift : %d objects (%d rebuilt) in %.1fs" % (
        len(lifted_objs), len(need_compile), result["liftCompile_s"]))

    # ---- link via response file (Windows argv limit; 40+ large .o) ----
    expo = BOOT_OUT / "exported_functions.json"
    expo.write_text(json.dumps(EXPORTED_FUNCTIONS), encoding="utf-8")
    out_mjs = BOOT_OUT / "boot.mjs"
    link_objs = [str(p) for p in lifted_objs + host_objs] + [str(LUA_LIB)]
    rsp = BOOT_OUT / "link.rsp"
    lines = []
    ldflags = list(LDFLAGS)
    if args.fast_link:
        # -O2 at link runs wasm-opt over the whole 272 MB module and dominates
        # the 8-minute link; the objects are already -O2. Measured per build.
        ldflags = ["-O0" if f == "-O2" else f for f in ldflags]
    result["fastLink"] = bool(args.fast_link)
    lines.extend(ldflags)
    lines += ["-sEXPORTED_FUNCTIONS=@" + str(expo).replace("\\", "/")]
    lines += ["-o", str(out_mjs).replace("\\", "/")]
    lines += [p.replace("\\", "/") for p in link_objs]
    rsp.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("link : %d inputs -> %s" % (len(link_objs), out_mjs))
    t2 = time.time()
    r = run([emcc, "@" + str(rsp)])
    linkmsg = (r.stderr or "") + (r.stdout or "")
    result["link_s"] = round(time.time() - t2, 1)
    result["link_rc"] = r.returncode
    result["duplicateSymbolErrors"] = linkmsg.count("duplicate symbol")
    result["undefinedSymbolErrors"] = linkmsg.count("undefined symbol")
    result["linkDiagnostics"] = [
        l for l in linkmsg.splitlines()
        if "error" in l.lower() or "undefined" in l.lower()
        or "duplicate" in l.lower()][:40]
    wasm = BOOT_OUT / "boot.wasm"
    result["wasmBytes"] = wasm.stat().st_size if wasm.exists() else None
    result["mjsBytes"] = out_mjs.stat().st_size if out_mjs.exists() else None

    if r.returncode != 0:
        result["ok"] = False
        (BOOT_OUT / "build_boot.json").write_text(
            json.dumps(result, indent=2), encoding="utf-8")
        print("LINK FAILED (%.1fs)" % result["link_s"])
        for d in result["linkDiagnostics"]:
            print("   ", d)
        tail = "\n".join(linkmsg.splitlines()[-60:])
        if tail:
            print(tail)
        return 1

    # Driver lives next to the module (import Module from './boot.mjs').
    driver_src = HERE / "boot_integration.mjs"
    driver_dst = BOOT_OUT / "boot_integration.mjs"
    shutil.copy2(driver_src, driver_dst)

    result["ok"] = True
    result["out"] = str(out_mjs)
    (BOOT_OUT / "build_boot.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8")
    print("link : exit 0 in %.1fs" % result["link_s"])
    print("wasm : %s bytes" % result["wasmBytes"])
    print("mjs  : %s bytes" % result["mjsBytes"])
    print("driver copied to %s" % driver_dst)
    print("wrote %s" % (BOOT_OUT / "build_boot.json"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
