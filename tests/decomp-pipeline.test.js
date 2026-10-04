import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  findCatalogEntry,
  findSignatureMatches,
  parsePe,
  parseSignature,
  rankSignatureCandidates,
  rawOffsetToRva,
  readZhlSignatures,
} from "../scripts/decomp/pe-signatures.mjs";
import { loadVerifiedRoots } from "../scripts/decomp/run-ghidra.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("wildcard signature matching returns every match", () => {
  const bytes = Buffer.from([0x55, 0x8b, 0x01, 0x83, 0xaa, 0x55, 0x8b, 0xfe, 0x83]);
  assert.deepEqual(findSignatureMatches(bytes, parseSignature("558b??83")), [0, 5]);
});

test("signature drift ranking is deterministic and never promotes a candidate", () => {
  const bytes = Buffer.from([
    0x55, 0x8b, 0xec, 0x83, 0xe4, 0xf8,
    0x00,
    0x55, 0x8b, 0xec, 0x83, 0xe4, 0xff,
  ]);
  const ranked = rankSignatureCandidates(bytes, parseSignature("558bec83e4f8"));
  assert.deepEqual(ranked.map(({ rawOffset, matchedFixedBytes }) => ({ rawOffset, matchedFixedBytes })), [
    { rawOffset: 0, matchedFixedBytes: 6 },
    { rawOffset: 7, matchedFixedBytes: 5 },
  ]);
});

test("PE parser maps executable raw offsets back to RVAs", () => {
  const fixture = Buffer.alloc(0x400);
  fixture.write("MZ", 0, "ascii");
  fixture.writeUInt32LE(0x80, 0x3c);
  fixture.write("PE\0\0", 0x80, "ascii");
  fixture.writeUInt16LE(0x14c, 0x84);
  fixture.writeUInt16LE(1, 0x86);
  fixture.writeUInt16LE(0xe0, 0x94);
  fixture.writeUInt16LE(0x10b, 0x98);
  fixture.writeUInt32LE(0x1010, 0x98 + 16);
  fixture.writeUInt32LE(0x400000, 0x98 + 28);
  const section = 0x98 + 0xe0;
  fixture.write(".text", section, "ascii");
  fixture.writeUInt32LE(0x200, section + 8);
  fixture.writeUInt32LE(0x1000, section + 12);
  fixture.writeUInt32LE(0x200, section + 16);
  fixture.writeUInt32LE(0x200, section + 20);
  fixture.writeUInt32LE(0x60000020, section + 36);

  const pe = parsePe(fixture);
  assert.equal(pe.entryRva, 0x1010);
  assert.equal(rawOffsetToRva(pe, 0x22a), 0x102a);
});

test("configured port roots have exactly one REPENTOGON signature declaration", () => {
  const config = JSON.parse(readFileSync(join(root, "decomp", "port-roots.json"), "utf8"));
  const cache = new Map();
  for (const portRoot of config.roots) {
    const path = join(root, config.catalogRoot, portRoot.catalog);
    if (!cache.has(path)) cache.set(path, readZhlSignatures(path));
    const entry = findCatalogEntry(cache.get(path), portRoot.symbol);
    assert.ok(parseSignature(entry.pattern).length >= 8, portRoot.symbol);
  }
});

test("Ghidra exporter keeps generated decompiler material under ignored output", () => {
  const runner = readFileSync(join(root, "scripts", "decomp", "run-ghidra.mjs"), "utf8");
  const ignore = readFileSync(join(root, ".gitignore"), "utf8");
  assert.match(runner, /join\(repoRoot, "output", "decomp"/);
  assert.match(runner, /join\(repoRoot, "re", "ghidra_project"\)/);
  assert.match(ignore, /^\/output\/$/m);
  assert.match(ignore, /^\/re\/ghidra_project\/$/m);
});

test("local verified roots are hash-bound and executable-section constrained", () => {
  const directory = mkdtempSync(join(tmpdir(), "isaac-decomp-test-"));
  const path = join(directory, "verified-roots.json");
  const inventory = {
    input: { sha256: "abc123" },
    pe: {
      sections: [{ rva: 0x1000, virtualSize: 0x200, rawSize: 0x200, characteristics: 0x60000020 }],
    },
    roots: [{ symbol: "Game::Update" }],
  };
  try {
    writeFileSync(path, JSON.stringify({
      schemaVersion: 1,
      inputSha256: "abc123",
      roots: [{ symbol: "Game::Update", rva: "0x1010", evidence: ["call-context match"] }],
    }));
    assert.deepEqual(loadVerifiedRoots(path, inventory), [{
      symbol: "Game::Update",
      rva: 0x1010,
      confidence: "locally-verified",
      reason: "call-context match",
    }]);

    writeFileSync(path, JSON.stringify({
      schemaVersion: 1,
      inputSha256: "wrong",
      roots: [],
    }));
    assert.throws(() => loadVerifiedRoots(path, inventory), /different executable hash/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
