/**
 * Incremental Boxedwine rebuild after local edits.
 * Builds are isolated by default; pass --deploy to replace web/emu runtime files.
 */
import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const proj = join(root, "third_party", "Boxedwine");
const build = join(proj, "project", "emscripten", "Build", "Release");
const emsdk = process.env.EMSDK;
if (!emsdk) {
  throw new Error("EMSDK must point to an installed Emscripten SDK");
}
const empp = join(emsdk, "upstream/emscripten/em++.exe");
const emcc = join(emsdk, "upstream/emscripten/emcc.exe");
const targetArgIndex = process.argv.indexOf("--target");
const requestedTarget = targetArgIndex >= 0
  ? process.argv[targetArgIndex + 1]
  : "release";
const forceRebuild = process.argv.includes("--force");
const deploy = process.argv.includes("--deploy");
if (deploy && process.argv.includes("--no-deploy")) {
  throw new Error("choose either --deploy or --no-deploy, not both");
}
const targetBuildDirs = {
  release: "Release",
  jit: "Jit",
  jitProfile: "JitProfile",
  multiThreadedJit: "MultiThreadedJit",
};
if (!targetBuildDirs[requestedTarget]) {
  throw new Error(`unsupported Boxedwine target: ${requestedTarget}`);
}

const flags = [
  "-O2", "-mtail-call", "-fwasm-exceptions", "-sSUPPORT_LONGJMP=0",
  "-sUSE_SDL=2", "-sUSE_ZLIB=1",
  "-DBOXEDWINE_ZLIB", "-DBOXEDWINE_DISABLE_UI", "-DSIMDE_SSE2_NO_NATIVE",
  "-DBOXEDWINE_OPENGL_SDL", "-DSDL2=1", "-DGLH=<SDL_opengl.h>",
  "-std=c++20",
  `-I${join(proj, "lib/asmjit")}`,
  `-I${join(proj, "include")}`,
  `-I${join(proj, "lib/simde")}`,
  "-Wno-deprecated-pragma", "-Wno-format-security",
  "-Wno-unused-private-field", "-Wno-invalid-offsetof",
  "-Wno-delete-incomplete", "-Wno-unused-result", "-Wno-unknown-pragmas",
  "-Wno-unused-local-typedefs", "-Wno-unused-variable",
  "-Wno-unused-function", "-Wno-unused-but-set-variable",
];

function run(cmd, args, options = {}) {
  console.log(cmd, args.slice(0, 6).join(" "), "...");
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.once("error", rejectRun);
    child.once("exit", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${cmd} exited with ${code}`));
    });
  });
}

if (requestedTarget !== "release") {
  const emscriptenBin = join(emsdk, "upstream/emscripten");
  const gitUsrBin = process.env.GIT_USR_BIN || "C:/Program Files/Git/usr/bin";
  const gitShell = process.env.GIT_SHELL || "C:/Program Files/Git/bin/sh.exe";
  const makeEnv = {
    ...process.env,
    EMSDK: emsdk,
    SHELL: gitShell,
    PATH: `${emscriptenBin};${gitUsrBin};${process.env.PATH || ""}`,
  };
  await run("make", forceRebuild ? ["-B", requestedTarget] : [requestedTarget], {
    cwd: join(proj, "project", "emscripten"),
    env: makeEnv,
  });
  const targetBuild = join(
    proj,
    "project",
    "emscripten",
    "Build",
    targetBuildDirs[requestedTarget]
  );
  const emu = join(root, "web", "emu");
  if (deploy) {
    copyFileSync(join(targetBuild, "boxedwine.wasm"), join(emu, "boxedwine.wasm"));
    copyFileSync(join(targetBuild, "boxedwine.js"), join(emu, "boxedwine.js"));
    console.log(`Deployed ${requestedTarget} to web/emu/`);
  } else {
    console.log(`Built ${requestedTarget} without deployment: ${targetBuild}`);
  }
  process.exit(0);
}

const decObj = join(build, "src/source/emulation/cpu/decoder.cpp.o");
const cpuObj = join(build, "src/source/emulation/cpu/normal/normalCPU.cpp.o");
const fsObj = join(build, "src/source/io/fs.cpp.o");
const inputObj = join(build, "src/platform/sdl/knativeinputSDL.cpp.o");
const xserverObj = join(build, "src/source/x11/xserver.cpp.o");
const devInputObj = join(build, "src/source/kernel/devs/devinput.cpp.o");
const unixSocketObj = join(build, "src/source/kernel/kunixsocket.cpp.o");
const glcommonObj = join(build, "src/source/opengl/glcommon.cpp.o");
const glExt1Obj = join(build, "src/source/opengl/glfunctions_ext1.cpp.o");
const mainloopObj = join(build, "src/source/sdl/emscripten/mainloop.cpp.o");
await Promise.all([
  run(empp, [...flags, "-c", join(proj, "source/emulation/cpu/decoder.cpp"), "-o", decObj]),
  run(empp, [...flags, "-c", join(proj, "source/emulation/cpu/normal/normalCPU.cpp"), "-o", cpuObj]),
  run(empp, [...flags, "-c", join(proj, "source/io/fs.cpp"), "-o", fsObj]),
  run(empp, [...flags, "-c", join(proj, "platform/sdl/knativeinputSDL.cpp"), "-o", inputObj]),
  run(empp, [...flags, "-c", join(proj, "source/x11/xserver.cpp"), "-o", xserverObj]),
  run(empp, [...flags, "-c", join(proj, "source/kernel/devs/devinput.cpp"), "-o", devInputObj]),
  run(empp, [...flags, "-c", join(proj, "source/kernel/kunixsocket.cpp"), "-o", unixSocketObj]),
  run(empp, [...flags, "-c", join(proj, "source/opengl/glcommon.cpp"), "-o", glcommonObj]),
  run(empp, [...flags, "-c", join(proj, "source/opengl/glfunctions_ext1.cpp"), "-o", glExt1Obj]),
  run(empp, [...flags, "-c", join(proj, "source/sdl/emscripten/mainloop.cpp"), "-o", mainloopObj]),
]);

const ldflags = [
  "-O2", "-mtail-call",
  "-sFORCE_FILESYSTEM", "-lidbfs.js",
  "-sUSE_SDL=2", "-sUSE_ZLIB=1", "-sFULL_ES3=1",
  "-sMIN_WEBGL_VERSION=2", "-sMAX_WEBGL_VERSION=2",
  "-fwasm-exceptions", "-sSUPPORT_LONGJMP=0",
  "-sINITIAL_MEMORY=536870912", "-sALLOW_MEMORY_GROWTH=1",
  "-sMAXIMUM_MEMORY=3221225472",
  "--shell-file", join(proj, "project/emscripten/shell.html"),
  `-sEXPORTED_RUNTIME_METHODS=["addRunDependency","removeRunDependency","ERRNO_CODES","ccall","FS"]`,
];
await run(emcc, [`@${join(build, "link.rsp")}`, "-o", join(build, "boxedwine.html"), ...ldflags]);

const emu = join(root, "web", "emu");
if (deploy) {
  copyFileSync(join(build, "boxedwine.wasm"), join(emu, "boxedwine.wasm"));
  copyFileSync(join(build, "boxedwine.js"), join(emu, "boxedwine.js"));
  console.log("Deployed release to web/emu/");
} else {
  console.log(`Built release without deployment: ${build}`);
}
