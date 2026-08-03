import { createReadStream, createWriteStream } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const emu = join(root, "web", "emu");
const outputArg = process.argv.find((arg) => arg.startsWith("--output="));
const runtimeArg = process.argv.find((arg) => arg.startsWith("--runtime="));
const output = resolve(root, outputArg ? outputArg.slice(9) : "output/isaac-repentance-standalone.html");
const runtime = runtimeArg ? resolve(root, runtimeArg.slice(10)) : emu;

const pagePath = join(emu, "index.html");
const shellPath = join(emu, "boxedwine-shell.js");
const runtimeJsPath = join(runtime, "boxedwine.js");
const runtimeWasmPath = join(runtime, "boxedwine.wasm");
const embedded = [
  ["boxedwine.wasm", runtimeWasmPath],
  ["boxedwine.zip", join(emu, "boxedwine.zip")],
  ["debian10.zip", join(emu, "debian10.zip")],
  ["isaac-savedir.zip", join(emu, "isaac-savedir.zip")],
  ["isaac-phase6-full.zip", join(emu, "isaac-phase6-full.zip")],
  ["isaac-phase6-full-jit-modules.zip", join(emu, "isaac-phase6-full-jit-modules.zip")],
];

for (const path of [pagePath, shellPath, runtimeJsPath, ...embedded.map(([, path]) => path)]) {
  await access(path);
}

const escapeScript = (source) => source.replace(/<\/script/gi, "<\\/script");
const page = await readFile(pagePath, "utf8");
const shell = escapeScript(await readFile(shellPath, "utf8"));
const runtimeSource = await readFile(runtimeJsPath, "utf8");
const runtimePreamble = 'var Module=typeof Module!="undefined"?Module:{};';
const wasmBinaryDeclaration = "var wasmBinary;";
const getWasmBinaryDeclaration = "async function getWasmBinary(binaryFile){";
if (!runtimeSource.startsWith(runtimePreamble) ||
    !runtimeSource.includes(wasmBinaryDeclaration) ||
    !runtimeSource.includes(getWasmBinaryDeclaration)) {
  throw new Error("boxedwine.js Module preamble changed; standalone handoff is unsafe");
}
const runtimeJs = escapeScript(
  runtimeSource
    .replace(runtimePreamble, "var Module=globalThis.Module||{};globalThis.Module=Module;")
    .replace(wasmBinaryDeclaration, 'var wasmBinary=Module["wasmBinary"];')
    .replace(getWasmBinaryDeclaration,
      "async function getWasmBinary(binaryFile){if(wasmBinary)return wasmBinary;")
);
const shellTag = '<script src="boxedwine-shell.js"></script>';
const runtimeTag = '<script src="boxedwine.js" async></script>';
if (!page.includes(shellTag) || !page.includes(runtimeTag)) {
  throw new Error("index.html runtime script tags changed; standalone substitution is unsafe");
}

const [beforeShell, afterShellTag] = page.split(shellTag);
const [betweenScripts, afterRuntime] = afterShellTag.split(runtimeTag);
const stream = createWriteStream(output, { encoding: "utf8" });
async function write(value) {
  if (!stream.write(value)) await once(stream, "drain");
}

await write(beforeShell);
let rawBytes = 0;
for (const [name, path] of embedded) {
  const size = (await stat(path)).size;
  rawBytes += size;
}
await write(`<script>
globalThis.BOXEDWINE_EMBEDDED_FILES=Object.create(null);
globalThis.BOXEDWINE_EMBEDDED_LOADED=0;
globalThis.boxedwineEmbeddedParseProgress=function(bytes,name){
  globalThis.BOXEDWINE_EMBEDDED_LOADED+=bytes;
  var loaded=globalThis.BOXEDWINE_EMBEDDED_LOADED;
  var total=${rawBytes};
  var percent=total?Math.min(100,Math.floor(loaded*100/total)):0;
  var status=document.getElementById('status');
  var progress=document.getElementById('progress');
  if(status)status.textContent='Loading package: '+percent+'% ('+name+')';
  if(progress){progress.hidden=false;progress.max=total;progress.value=loaded;}
};
document.currentScript.remove();
</script>\n`);

for (const [name, path] of embedded) {
  const key = JSON.stringify(name);
  await write(`<script>globalThis.BOXEDWINE_EMBEDDED_FILES[${key}]=[];document.currentScript.remove();</script>\n`);
  let batch = [];
  let batchBytes = 0;
  // 786432 is divisible by three, so only the final base64 chunk has padding.
  for await (const chunk of createReadStream(path, { highWaterMark: 786432 })) {
    batch.push(JSON.stringify(chunk.toString("base64")));
    batchBytes += chunk.length;
    // Keep every classic-script source comfortably below browser parser limits.
    if (batch.length === 16) {
      await write(`<script>globalThis.BOXEDWINE_EMBEDDED_FILES[${key}].push(${batch.join(",")});globalThis.boxedwineEmbeddedParseProgress(${batchBytes},${key});document.currentScript.remove();</script>\n`);
      batch = [];
      batchBytes = 0;
    }
  }
  if (batch.length) {
    await write(`<script>globalThis.BOXEDWINE_EMBEDDED_FILES[${key}].push(${batch.join(",")});globalThis.boxedwineEmbeddedParseProgress(${batchBytes},${key});document.currentScript.remove();</script>\n`);
  }
}

await write(`<script>\n`);
await write(String.raw`globalThis.boxedwineTakeEmbeddedFile = function(name) {
  const registry = globalThis.BOXEDWINE_EMBEDDED_FILES;
  if (!registry || !Object.prototype.hasOwnProperty.call(registry, name)) return null;
  const chunks = registry[name];
  delete registry[name];
  let byteLength = 0;
  for (const chunk of chunks) {
    const padding = chunk.endsWith("==") ? 2 : chunk.endsWith("=") ? 1 : 0;
    byteLength += (chunk.length >>> 2) * 3 - padding;
  }
  const output = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    const decoded = atob(chunk);
    for (let i = 0; i < decoded.length; i++) output[offset++] = decoded.charCodeAt(i);
  }
  return output;
};
`);
await write(`</script>\n<script>\n${shell}\n</script>`);
await write(betweenScripts);
await write(`<script>\n${runtimeJs}\n</script>`);
await write(afterRuntime);
stream.end();
await once(stream, "finish");

const outputBytes = (await stat(output)).size;
console.log(JSON.stringify({ output, rawBytes, outputBytes, runtime }, null, 2));
