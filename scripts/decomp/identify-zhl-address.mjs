import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePe, parseSignature, readZhlSignatures } from "./pe-signatures.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseAddress(text) {
  if (!/^0x[0-9a-f]+$/i.test(text)) throw new Error(`Address must be hexadecimal: ${text}`);
  const value = Number.parseInt(text.slice(2), 16);
  if (!Number.isSafeInteger(value)) throw new Error(`Address is outside the safe integer range: ${text}`);
  return value;
}

function rvaToRawOffset(pe, rva) {
  for (const section of pe.sections) {
    const size = Math.max(section.virtualSize, section.rawSize);
    if (rva >= section.rva && rva < section.rva + size) {
      const delta = rva - section.rva;
      return delta < section.rawSize ? section.rawOffset + delta : null;
    }
  }
  return null;
}

function signatureMatchesAt(buffer, signature, offset) {
  if (offset === null || offset < 0 || offset + signature.length > buffer.length) return false;
  return signature.every((byte, index) => byte === null || buffer[offset + index] === byte);
}

function zhlFiles(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".zhl"))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name))
    .sort();
}

function usage() {
  return "Usage: node scripts/decomp/identify-zhl-address.mjs <VA-or-RVA> [<VA-or-RVA> ...]";
}

function main(argv) {
  if (!argv.length) throw new Error(usage());
  const input = resolve(process.env.ISAAC_EXE || join(repoRoot, "tools", "isaac-ng.unpacked.exe"));
  const catalogRoot = join(repoRoot, "third_party", "REPENTOGON", "libzhl", "functions");
  const buffer = readFileSync(input);
  const pe = parsePe(buffer);
  const catalogs = zhlFiles(catalogRoot).map((path) => ({
    path,
    entries: readZhlSignatures(path),
  }));

  const results = argv.map((text) => {
    const address = parseAddress(text);
    const rva = address >= pe.imageBase ? address - pe.imageBase : address;
    const rawOffset = rvaToRawOffset(pe, rva);
    const matches = [];
    for (const catalog of catalogs) {
      for (const entry of catalog.entries) {
        const signature = parseSignature(entry.pattern);
        if (signatureMatchesAt(buffer, signature, rawOffset)) {
          matches.push({
            catalog: relative(repoRoot, catalog.path).replaceAll("\\", "/"),
            declaration: entry.declaration,
            patternBytes: signature.length,
          });
        }
      }
    }
    return {
      input: text,
      va: `0x${(pe.imageBase + rva).toString(16)}`,
      rva: `0x${rva.toString(16)}`,
      rawOffset: rawOffset === null ? null : `0x${rawOffset.toString(16)}`,
      exactMatches: matches,
    };
  });

  console.log(JSON.stringify({
    schemaVersion: 1,
    executable: basename(input),
    imageBase: `0x${pe.imageBase.toString(16)}`,
    results,
  }, null, 2));
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}
