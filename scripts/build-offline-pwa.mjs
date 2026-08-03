import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const emu = join(root, "web", "emu");
const outputArg = process.argv.find(arg => arg.startsWith("--output="));
const runtimeArg = process.argv.find(arg => arg.startsWith("--runtime="));
const output = resolve(root, outputArg ? outputArg.slice(9) : "output/isaac-offline-pwa");
const runtime = runtimeArg ? resolve(root, runtimeArg.slice(10)) : emu;

const payloadSources = [
  ["boxedwine-shell.js", join(emu, "boxedwine-shell.js"), "shell"],
  ["boxedwine.js", join(runtime, "boxedwine.js"), "shell"],
  ["boxedwine.wasm", join(runtime, "boxedwine.wasm"), "shell"],
  ["boxedwine.zip", join(emu, "boxedwine.zip"), "runtime"],
  ["debian10.zip", join(emu, "debian10.zip"), "runtime"],
  ["isaac-savedir.zip", join(emu, "isaac-savedir.zip"), "runtime"],
  ["isaac-phase6-full.zip", join(emu, "isaac-phase6-full.zip"), "runtime"],
  ["isaac-phase6-full-jit-modules.zip", join(emu, "isaac-phase6-full-jit-modules.zip"), "runtime"],
];
for (const [, source] of payloadSources) await access(source);
await mkdir(join(output, "icons"), { recursive: true });

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest();
}

async function sha256File(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest();
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  const result = Buffer.alloc(4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return result;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, name, data, crc32(Buffer.concat([name, data]))]);
}

function makeIcon(size) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    const row = y * stride;
    for (let x = 0; x < size; x++) {
      const offset = row + 1 + x * 4;
      const border = x < size / 16 || y < size / 16 || x >= size * 15 / 16 || y >= size * 15 / 16;
      const stem = x >= size * 7 / 16 && x < size * 9 / 16 && y >= size * 5 / 16 && y < size * 13 / 16;
      const cap = x >= size * 5 / 16 && x < size * 11 / 16 && (y >= size * 4 / 16 && y < size * 6 / 16 || y >= size * 12 / 16 && y < size * 14 / 16);
      const light = border || stem || cap;
      raw[offset] = light ? 236 : 24;
      raw[offset + 1] = light ? 226 : 19;
      raw[offset + 2] = light ? 204 : 18;
      raw[offset + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const sourcePage = await readFile(join(emu, "index.html"), "utf8");
const shellTag = '<script src="boxedwine-shell.js"></script>';
const runtimeTag = '<script src="boxedwine.js" async></script>';
if (!sourcePage.includes(shellTag) || !sourcePage.includes(runtimeTag) || !sourcePage.includes("storage=memory")) {
  throw new Error("index.html bootstrap contract changed; offline PWA transform is unsafe");
}
const manifestTags = [
  '  <meta name="theme-color" content="#181312">',
  '  <link rel="manifest" href="manifest.webmanifest">',
  '  <link rel="icon" href="icons/icon-192.png" sizes="192x192">',
].join("\n");
const page = sourcePage
  .replace("  <title>The Binding of Isaac: Repentance</title>",
    `  <title>The Binding of Isaac: Repentance</title>\n${manifestTags}`)
  .replace("storage=memory", "storage=indexeddb")
  .replace(shellTag, '<script src="offline-bootstrap.js" defer></script>')
  .replace(runtimeTag, "");

const payloadHashes = [];
for (const [path, source, group] of payloadSources) {
  const info = await stat(source);
  const digest = await sha256File(source);
  payloadHashes.push({ path: `./${path}`, source, group, bytes: info.size, digest });
}
const pageDigest = sha256(Buffer.from(page));
const bootstrapTemplate = await readFile(join(emu, "offline-bootstrap.js"), "utf8");
const serviceWorkerTemplate = await readFile(join(emu, "offline-sw.js"), "utf8");
const icon192 = makeIcon(192);
const icon512 = makeIcon(512);
const manifest = JSON.stringify({
  id: "./",
  name: "The Binding of Isaac: Repentance (Offline)",
  short_name: "Isaac Offline",
  description: "Private local BoxedWine/WebAssembly browser runtime.",
  start_url: "./index.html",
  scope: "./",
  display: "fullscreen",
  background_color: "#000000",
  theme_color: "#181312",
  prefer_related_applications: false,
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
}, null, 2) + "\n";
const releaseId = createHash("sha256")
  .update(pageDigest)
  .update(Buffer.concat(payloadHashes.map(asset => asset.digest)))
  .update(bootstrapTemplate)
  .update(serviceWorkerTemplate)
  .update(icon192)
  .update(icon512)
  .update(manifest)
  .digest("hex")
  .slice(0, 20);

const bootstrap = bootstrapTemplate.replaceAll("__ISAAC_RELEASE_ID__", releaseId);
const serviceWorker = serviceWorkerTemplate.replaceAll("__ISAAC_RELEASE_ID__", releaseId);

await writeFile(join(output, "index.html"), page);
await writeFile(join(output, "offline-bootstrap.js"), bootstrap);
await writeFile(join(output, "offline-sw.js"), serviceWorker);
await writeFile(join(output, "manifest.webmanifest"), manifest);
await writeFile(join(output, "icons", "icon-192.png"), icon192);
await writeFile(join(output, "icons", "icon-512.png"), icon512);
for (const asset of payloadHashes) await copyFile(asset.source, join(output, asset.path.slice(2)));

async function inventoryEntry(path, buffer, bytes = buffer.length) {
  const digest = sha256(buffer);
  return {
    path: `./${path}`,
    bytes,
    sha256: digest.toString("hex").toUpperCase(),
    integrity: `sha256-${digest.toString("base64")}`,
  };
}

const generatedShell = [
  ["index.html", Buffer.from(page)],
  ["offline-bootstrap.js", Buffer.from(bootstrap)],
  ["offline-sw.js", Buffer.from(serviceWorker)],
  ["manifest.webmanifest", Buffer.from(manifest)],
  ["icons/icon-192.png", icon192],
  ["icons/icon-512.png", icon512],
];
const shellAssets = [];
for (const [path, buffer] of generatedShell) shellAssets.push(await inventoryEntry(path, buffer));
for (const asset of payloadHashes.filter(asset => asset.group === "shell")) {
  shellAssets.push({
    path: asset.path,
    bytes: asset.bytes,
    sha256: asset.digest.toString("hex").toUpperCase(),
    integrity: `sha256-${asset.digest.toString("base64")}`,
  });
}
const runtimeAssets = payloadHashes.filter(asset => asset.group === "runtime").map(asset => ({
  path: asset.path,
  bytes: asset.bytes,
  sha256: asset.digest.toString("hex").toUpperCase(),
  integrity: `sha256-${asset.digest.toString("base64")}`,
}));
const inventory = {
  format: 1,
  releaseId,
  generatedAt: new Date().toISOString(),
  totalBytes: [...shellAssets, ...runtimeAssets].reduce((sum, asset) => sum + asset.bytes, 0),
  shellAssets,
  runtimeAssets,
};
await writeFile(join(output, "offline-assets.json"), JSON.stringify(inventory, null, 2) + "\n");

console.log(JSON.stringify({ output, releaseId, totalBytes: inventory.totalBytes, shellAssets: shellAssets.length, runtimeAssets: runtimeAssets.length }, null, 2));
