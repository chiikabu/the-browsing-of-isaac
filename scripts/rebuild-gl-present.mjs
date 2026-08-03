/**
 * Rebuild selected GL objects in Build/Release and relink its wasm.
 * The served runtime is unchanged unless --deploy is passed explicitly.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync } from "node:fs";
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
const deploy = process.argv.includes("--deploy");
if (deploy && process.argv.includes("--no-deploy")) {
  throw new Error("choose either --deploy or --no-deploy, not both");
}

const flags = [
  "-O2",
  "-mtail-call",
  "-fwasm-exceptions",
  "-sSUPPORT_LONGJMP=0",
  "-sUSE_SDL=2",
  "-sUSE_ZLIB=1",
  "-DBOXEDWINE_ZLIB",
  "-DBOXEDWINE_DISABLE_UI",
  "-DSIMDE_SSE2_NO_NATIVE",
  "-DBOXEDWINE_OPENGL_SDL",
  "-DSDL2=1",
  "-DGLH=<SDL_opengl.h>",
  "-std=c++20",
  `-I${join(proj, "lib/asmjit")}`,
  `-I${join(proj, "include")}`,
  `-I${join(proj, "lib/simde")}`,
  "-Wno-deprecated-pragma",
  "-Wno-format-security",
  "-Wno-unused-private-field",
  "-Wno-invalid-offsetof",
  "-Wno-delete-incomplete",
  "-Wno-unused-result",
  "-Wno-unknown-pragmas",
  "-Wno-unused-local-typedefs",
  "-Wno-unused-variable",
  "-Wno-unused-function",
  "-Wno-unused-but-set-variable",
];

function run(cmd, args) {
  console.log(cmd, args.slice(0, 8).join(" "), "...");
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status || 1);
}

const units = [
  ["source/opengl/glcommon.cpp", "src/source/opengl/glcommon.cpp.o"],
  ["source/opengl/glfunctions_ext2.cpp", "src/source/opengl/glfunctions_ext2.cpp.o"],
  [
    "platform/sdl/knativescreenSDL.cpp",
    "src/platform/sdl/knativescreenSDL.cpp.o",
  ],
];

for (const [src, objRel] of units) {
  const srcPath = join(proj, src);
  const objPath = join(build, objRel);
  run(empp, [...flags, "-c", srcPath, "-o", objPath]);
}

const ldflags = [
  "-O2",
  "-mtail-call",
  "-sFORCE_FILESYSTEM",
  "-lidbfs.js",
  "-sUSE_SDL=2",
  "-sUSE_ZLIB=1",
  "-sFULL_ES3=1",
  "-sMIN_WEBGL_VERSION=2",
  "-sMAX_WEBGL_VERSION=2",
  "-fwasm-exceptions",
  "-sSUPPORT_LONGJMP=0",
  "-sINITIAL_MEMORY=536870912",
  "-sALLOW_MEMORY_GROWTH=1",
  "-sMAXIMUM_MEMORY=3221225472",
  "--shell-file",
  join(proj, "project/emscripten/shell.html"),
  `-sEXPORTED_RUNTIME_METHODS=["addRunDependency","removeRunDependency","ERRNO_CODES","ccall","FS"]`,
];
run(emcc, [
  `@${join(build, "link.rsp")}`,
  "-o",
  join(build, "boxedwine.html"),
  ...ldflags,
]);

const emu = join(root, "web", "emu");
if (deploy) {
  copyFileSync(join(build, "boxedwine.wasm"), join(emu, "boxedwine.wasm"));
  copyFileSync(join(build, "boxedwine.js"), join(emu, "boxedwine.js"));
  console.log("Deployed present-path Release rebuild to web/emu/");
} else {
  console.log(`Built present-path Release without deployment: ${build}`);
}
