import { readFileSync } from "node:fs";

const IMAGE_SCN_MEM_EXECUTE = 0x20000000;

function checkedRange(buffer, offset, length, label) {
  if (!Number.isInteger(offset) || offset < 0 || offset + length > buffer.length) {
    throw new Error(`${label} lies outside the input file`);
  }
}

export function parsePe(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 0x100) throw new Error("Input is too small to be a PE image");
  if (buffer.toString("ascii", 0, 2) !== "MZ") throw new Error("Missing DOS MZ signature");

  const peOffset = buffer.readUInt32LE(0x3c);
  checkedRange(buffer, peOffset, 24, "PE header");
  if (buffer.toString("ascii", peOffset, peOffset + 4) !== "PE\0\0") {
    throw new Error("Missing PE signature");
  }

  const machine = buffer.readUInt16LE(peOffset + 4);
  const sectionCount = buffer.readUInt16LE(peOffset + 6);
  const optionalSize = buffer.readUInt16LE(peOffset + 20);
  const optionalOffset = peOffset + 24;
  checkedRange(buffer, optionalOffset, optionalSize, "PE optional header");

  const magic = buffer.readUInt16LE(optionalOffset);
  if (magic !== 0x10b) throw new Error(`Expected PE32 optional header, got 0x${magic.toString(16)}`);
  const entryRva = buffer.readUInt32LE(optionalOffset + 16);
  const imageBase = buffer.readUInt32LE(optionalOffset + 28);
  const sectionOffset = optionalOffset + optionalSize;
  checkedRange(buffer, sectionOffset, sectionCount * 40, "PE section table");

  const sections = [];
  for (let i = 0; i < sectionCount; i += 1) {
    const offset = sectionOffset + i * 40;
    const nul = buffer.indexOf(0, offset);
    const nameEnd = nul >= offset && nul < offset + 8 ? nul : offset + 8;
    sections.push({
      name: buffer.toString("ascii", offset, nameEnd),
      virtualSize: buffer.readUInt32LE(offset + 8),
      rva: buffer.readUInt32LE(offset + 12),
      rawSize: buffer.readUInt32LE(offset + 16),
      rawOffset: buffer.readUInt32LE(offset + 20),
      characteristics: buffer.readUInt32LE(offset + 36),
    });
  }

  return { machine, magic, entryRva, imageBase, sections };
}

export function rawOffsetToRva(pe, rawOffset) {
  for (const section of pe.sections) {
    if (rawOffset >= section.rawOffset && rawOffset < section.rawOffset + section.rawSize) {
      return section.rva + rawOffset - section.rawOffset;
    }
  }
  return null;
}

export function parseSignature(text) {
  const compact = text.replace(/\s+/g, "");
  if (!compact.length || compact.length % 2 !== 0) throw new Error(`Invalid signature length: ${text}`);
  const bytes = [];
  for (let i = 0; i < compact.length; i += 2) {
    const token = compact.slice(i, i + 2);
    if (token === "??") {
      bytes.push(null);
      continue;
    }
    if (!/^[0-9a-f]{2}$/i.test(token)) throw new Error(`Invalid signature byte: ${token}`);
    bytes.push(Number.parseInt(token, 16));
  }
  return bytes;
}

function bestAnchor(signature) {
  let best = { start: 0, bytes: Buffer.alloc(0) };
  let start = 0;
  while (start < signature.length) {
    while (start < signature.length && signature[start] === null) start += 1;
    let end = start;
    while (end < signature.length && signature[end] !== null) end += 1;
    if (end - start > best.bytes.length) {
      best = { start, bytes: Buffer.from(signature.slice(start, end)) };
    }
    start = end + 1;
  }
  if (!best.bytes.length) throw new Error("Signature cannot consist entirely of wildcards");
  return best;
}

export function findSignatureMatches(buffer, signature, ranges = [{ start: 0, end: buffer.length }]) {
  const anchor = bestAnchor(signature);
  const matches = [];
  for (const range of ranges) {
    const start = Math.max(0, range.start);
    const end = Math.min(buffer.length, range.end);
    let cursor = start + anchor.start;
    while (cursor < end) {
      const anchorHit = buffer.indexOf(anchor.bytes, cursor);
      if (anchorHit < 0 || anchorHit + anchor.bytes.length > end) break;
      const candidate = anchorHit - anchor.start;
      if (candidate >= start && candidate + signature.length <= end) {
        let matchesPattern = true;
        for (let i = 0; i < signature.length; i += 1) {
          if (signature[i] !== null && buffer[candidate + i] !== signature[i]) {
            matchesPattern = false;
            break;
          }
        }
        if (matchesPattern) matches.push(candidate);
      }
      cursor = anchorHit + 1;
    }
  }
  return matches;
}

export function rankSignatureCandidates(
  buffer,
  signature,
  ranges = [{ start: 0, end: buffer.length }],
  limit = 8,
) {
  let anchor = null;
  for (let start = 0; start + 3 <= signature.length; start += 1) {
    if (signature.slice(start, start + 3).every((byte) => byte !== null)) {
      anchor = { start, bytes: Buffer.from(signature.slice(start, start + 3)) };
      break;
    }
  }
  if (anchor === null) anchor = bestAnchor(signature);
  const fixedCount = signature.reduce((count, byte) => count + (byte === null ? 0 : 1), 0);
  const candidates = [];
  const seen = new Set();
  for (const range of ranges) {
    const start = Math.max(0, range.start);
    const end = Math.min(buffer.length, range.end);
    let cursor = start + anchor.start;
    while (cursor < end) {
      const anchorHit = buffer.indexOf(anchor.bytes, cursor);
      if (anchorHit < 0 || anchorHit + anchor.bytes.length > end) break;
      const candidate = anchorHit - anchor.start;
      if (!seen.has(candidate) && candidate >= start && candidate + signature.length <= end) {
        seen.add(candidate);
        let matchedFixedBytes = 0;
        for (let i = 0; i < signature.length; i += 1) {
          if (signature[i] !== null && buffer[candidate + i] === signature[i]) matchedFixedBytes += 1;
        }
        candidates.push({
          rawOffset: candidate,
          matchedFixedBytes,
          fixedCount,
          score: matchedFixedBytes / fixedCount,
        });
      }
      cursor = anchorHit + 1;
    }
  }
  return candidates
    .sort((left, right) => right.matchedFixedBytes - left.matchedFixedBytes || left.rawOffset - right.rawOffset)
    .slice(0, limit);
}

export function executableRanges(pe, fileSize) {
  return pe.sections
    .filter((section) => (section.characteristics & IMAGE_SCN_MEM_EXECUTE) !== 0)
    .map((section) => ({
      name: section.name,
      start: section.rawOffset,
      end: Math.min(fileSize, section.rawOffset + section.rawSize),
    }))
    .filter((range) => range.start < range.end);
}

export function readZhlSignatures(path) {
  const text = readFileSync(path, "utf8");
  const entries = [];
  const expression = /"([0-9a-f?]+)"\s*:\s*\r?\n\s*([^\r\n]+;)/gi;
  for (const match of text.matchAll(expression)) {
    entries.push({ pattern: match[1], declaration: match[2].trim() });
  }
  return entries;
}

export function findCatalogEntry(entries, symbol) {
  const prefix = `${symbol}(`;
  const hits = entries.filter((entry) => entry.declaration.replace(/\s+/g, " ").includes(prefix));
  if (hits.length !== 1) throw new Error(`Expected one ZHL declaration for ${symbol}, found ${hits.length}`);
  return hits[0];
}
