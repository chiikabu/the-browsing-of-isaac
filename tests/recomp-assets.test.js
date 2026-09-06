// scripts/recomp/assets/archive.py: the KAGE packed-archive ("ARCH000") library.
//
// The engine mounts every archive at boot (0x00a179c0): header, table, then
// (unless the round-26 lift patch skips it) a per-entry pass that decodes the
// whole payload through the entry stream and folds a checksum against the
// table's fifth field. The library re-implements the key hashes, that fold,
// and the three payload codecs the shipped archives use (raw XOR, LZW, MiniZ).
// These pins hold the pure parts: the hashes against a real table entry, the
// checksum fold (including its stale-tail quirk) against an independent JS
// implementation, and the pack -> verify -> extract -> repack round trip on a
// fixture, which must reproduce the packed bytes exactly.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tool = join(root, 'scripts', 'recomp', 'assets', 'archive.py');

const PYTHONS = [
  join(process.env.LOCALAPPDATA ?? '', 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3',
  'python',
];

function findPython() {
  for (const p of PYTHONS) {
    if (!p) continue;
    const r = spawnSync(p, ['-c', 'import zlib, struct, mmap'], { stdio: 'pipe' });
    if (r.status === 0) return p;
  }
  return null;
}

const python = findPython();

function run(args, opts = {}) {
  const r = spawnSync(python, [tool, ...args], { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 120000, ...opts });
  assert.equal(r.status, 0, `${args.join(' ')} failed:\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}

// --- JS reference implementations of the pure parts ---------------------
function fold(c) {
  if (c >= 65 && c <= 90) c += 32;
  if (c === 92) c = 47;
  return c;
}
function djb2(s) {
  let h = 0x1505;
  for (const c of Buffer.from(s, 'utf8')) h = (Math.imul(h, 33) + fold(c)) >>> 0;
  return h;
}
function fnv1a(s) {
  let h = 0x5bb2220e;
  for (const c of Buffer.from(s, 'utf8')) h = Math.imul(h ^ fold(c), 0x1000193) >>> 0;
  return h;
}
// The mount fold: h = rotr1(h) + u32 over the decoded bytes, read in 0x200-byte
// chunks into ONE buffer zeroed once per entry, summing ceil(got/4) dwords; the
// tail bytes of a final partial dword are whatever the previous chunk left there.
function mountChecksum(bytes) {
  let h = 0xababeb98;
  const buf = Buffer.alloc(0x200);
  let pos = 0, remaining = bytes.length;
  for (;;) {
    const want = Math.min(remaining, 0x200);
    const got = Math.max(Math.min(want, bytes.length - pos), 0);
    if (got) bytes.copy(buf, 0, pos, pos + got);
    const ndw = (got + 3) >> 2;
    for (let i = 0; i < ndw; i++) {
      h = ((((h >>> 1) | ((h & 1) << 31)) >>> 0) + buf.readUInt32LE(i * 4)) >>> 0;
    }
    remaining -= want; pos += want;
    if (!(remaining > 0 && got === want)) break;
  }
  return h;
}
function naiveChecksum(bytes) { // zero-padded fold, to show the quirk is exercised
  let h = 0xababeb98;
  const padded = Buffer.concat([bytes, Buffer.alloc((4 - (bytes.length % 4)) % 4)]);
  for (let i = 0; i < padded.length; i += 4) h = ((((h >>> 1) | ((h & 1) << 31)) >>> 0) + padded.readUInt32LE(i)) >>> 0;
  return h;
}

function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return (s >>> 16) & 0xff; }; }
function randomBytes(n, seed) { const g = lcg(seed); const b = Buffer.alloc(n); for (let i = 0; i < n; i++) b[i] = g(); return b; }

test('archive keys: djb2 + FNV-1a over the folded "resources/<path>", pinned to a real table entry', (t) => {
  // resources/music/Repentance/Genesis Retake Light Loop.ogg is entry 8885 of afterbirthp.a
  // (djb2 f46a43da, fnv 1240ef03), matched against the table by the assets notes.
  const p = 'resources/music/Repentance/Genesis Retake Light Loop.ogg';
  assert.equal(djb2(p), 0xf46a43da);
  assert.equal(fnv1a(p), 0x1240ef03);
  assert.equal(djb2('RESOURCES\\Music\\REPENTANCE\\Genesis Retake Light Loop.OGG'), 0xf46a43da, 'case and slashes fold');
  assert.equal(fnv1a('RESOURCES\\Music\\REPENTANCE\\Genesis Retake Light Loop.OGG'), 0x1240ef03);
  assert.notEqual(djb2('music/Repentance/Genesis Retake Light Loop.ogg'), 0xf46a43da, 'the prefix is part of the key');
  if (!python) { t.skip('no python 3 on PATH'); return; }
  const out = run(['hash', 'music/Repentance/Genesis Retake Light Loop.ogg']);
  assert.match(out, /^f46a43da 1240ef03 resources\/music\/Repentance\/Genesis Retake Light Loop\.ogg/m, 'the tool adds the prefix and agrees');
  const raw = run(['hash', '--raw', 'RESOURCES\\Music\\REPENTANCE\\Genesis Retake Light Loop.OGG']);
  assert.match(raw, /^f46a43da 1240ef03 /m);
});

test('mount checksum: python and the JS reference agree, and the stale-tail quirk is real', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'isaac-assets-'));
  try {
    const cases = [0, 1, 3, 4, 0x1ff, 0x200, 0x201, 0x203, 0x3ff, 0x401, 0x600 + 2, 5000, 8191].map((n, i) => randomBytes(n, 0x1234 + i));
    const files = cases.map((b, i) => { const f = join(dir, `c${i}.bin`); writeFileSync(f, b); return f; });
    const out = run(['checksum', ...files]).trim().split(/\r?\n/);
    assert.equal(out.length, cases.length);
    cases.forEach((b, i) => {
      assert.equal(out[i].slice(0, 8), mountChecksum(b).toString(16).padStart(8, '0'), `size ${b.length}`);
    });
    assert.equal(mountChecksum(Buffer.alloc(0)), 0xababeb98, 'an empty entry folds nothing');
    // 0x203 bytes: the last dword's tail byte is byte 3 of the first chunk, not zero
    const q = cases[7];
    assert.equal(q.length, 0x203);
    assert.notEqual(q[3], 0, 'fixture: the stale byte is non-zero');
    assert.notEqual(mountChecksum(q), naiveChecksum(q), 'a zero-padded fold would disagree with the engine');
    // entries shorter than one chunk see zeros in the tail: both folds agree there
    assert.equal(mountChecksum(cases[1]), naiveChecksum(cases[1]));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('round 64: repack --order lays the named entries out first, and changes nothing else', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'isaac-layout-'));
  try {
    const src = join(dir, 'src');
    const files = {
      'gfx/ui/a.png': randomBytes(600, 7),
      'sfx/one.wav': randomBytes(0x401, 8),
      'sfx/two.wav': randomBytes(0x801, 9),
      'music/loop.ogg': Buffer.from('OggS'.repeat(900)),
      'xml/z.xml': Buffer.from('<z/>'),
    };
    for (const [rel, data] of Object.entries(files)) {
      mkdirSync(dirname(join(src, rel)), { recursive: true });
      writeFileSync(join(src, rel), data);
    }
    for (const version of [0, 2]) {
      const a = join(dir, `t${version}.a`);
      run(['pack', src, a, '--version', String(version)]);
      const want = ['sfx/two.wav', 'music/loop.ogg', 'sfx/one.wav'];
      const order = join(dir, `order${version}.txt`);
      writeFileSync(order, '# the boot order\n' + want.join('\n') + '\nnot/in/the/archive.bin\n');
      const b = join(dir, `t${version}-laid.a`);
      run(['repack', a, b, '--order', order]);
      // the entry set, the sizes and the checksums are untouched: only the offsets moved
      const before = run(['list', a]).split(/\r?\n/).filter((l) => l.includes('size='));
      const after = run(['list', b]).split(/\r?\n/).filter((l) => l.includes('size='));
      assert.equal(after.length, before.length);
      const strip = (l) => l.replace(/^\s*\d+ /, '').replace(/off=\s*\d+/, 'off=');   // the row index and the offset are what a layout moves
      assert.deepEqual(new Set(after.map(strip)), new Set(before.map(strip)), 'same keys, sizes and checksums');
      assert.match(run(['verify', b]), new RegExp(`${Object.keys(files).length}/\\s*${Object.keys(files).length} matched`));
      // and the payloads sit in the requested order, ahead of everything else
      const ex = join(dir, `ex${version}`);
      const names = join(dir, 'names.txt');
      writeFileSync(names, Object.keys(files).join('\n') + '\n');
      run(['extract', b, ex, '--names', names]);
      for (const [rel, data] of Object.entries(files)) assert.ok(readFileSync(join(ex, rel)).equals(data), rel);
      const offOf = (rel) => {
        const h1 = djb2('resources/' + rel).toString(16).padStart(8, '0');
        const h2 = fnv1a('resources/' + rel).toString(16).padStart(8, '0');
        const line = run(['list', b]).split(/\r?\n/).find((l) => l.includes(`${h1} ${h2}`));
        return Number(/off=\s*(\d+)/.exec(line)[1]);
      };
      const offs = want.map(offOf);
      assert.deepEqual(offs, [...offs].sort((x, y) => x - y), 'the listed paths are laid out in the listed order');
      assert.ok(offs[0] === 14, 'the first listed path is the first payload in the file');
      for (const rel of ['gfx/ui/a.png', 'xml/z.xml']) assert.ok(offOf(rel) > offs[2], `${rel} follows the listed ones`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('pack -> verify -> extract -> repack reproduces the archive byte for byte (versions 0 and 2)', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'isaac-assets-'));
  try {
    const src = join(dir, 'src');
    const files = {
      'gfx/ui/tiny.png': randomBytes(5, 1),
      'sfx/Feedback/noise.wav': randomBytes(0x401, 2),        // > 0x400 of noise: the v2 packer stores it
      'music/loop.ogg': Buffer.from('OggS'.repeat(1500)),        // compressible: deflate pieces
      'scripts/main.lua': Buffer.from('-- lua\n'.repeat(700)),   // 4900 bytes, several pieces
      'xml/empty.xml': Buffer.alloc(0),
      'xml/one.xml': Buffer.from('x'),
    };
    for (const [rel, data] of Object.entries(files)) {
      mkdirSync(dirname(join(src, rel)), { recursive: true });
      writeFileSync(join(src, rel), data);
    }
    for (const version of [0, 2]) {
      const a = join(dir, `t${version}.a`);
      run(['pack', src, a, '--version', String(version)]);
      const packed = readFileSync(a);
      assert.equal(packed.subarray(0, 7).toString('latin1'), 'ARCH000');
      assert.equal(packed[7], version);
      assert.equal(packed.readUInt16LE(12), Object.keys(files).length);
      const tableOff = packed.readUInt32LE(8);
      assert.equal(packed.length, tableOff + 20 * Object.keys(files).length, 'the table is the tail of the file');
      // determinism: packing again gives the same bytes
      const a2 = join(dir, `t${version}-again.a`);
      run(['pack', src, a2, '--version', String(version)]);
      assert.ok(readFileSync(a2).equals(packed), 'pack is deterministic');
      // every table x is the fold of the decoded entry, and the tool agrees
      const v = run(['verify', a]);
      assert.match(v, new RegExp(`v${version}\\s+${Object.keys(files).length}/\\s*${Object.keys(files).length} matched`));
      const listing = run(['list', a]);
      for (const [rel, data] of Object.entries(files)) {
        const h1 = djb2('resources/' + rel).toString(16).padStart(8, '0');
        const h2 = fnv1a('resources/' + rel).toString(16).padStart(8, '0');
        const line = listing.split(/\r?\n/).find((l) => l.includes(`${h1} ${h2}`));
        assert.ok(line, `${rel} is in the table`);
        assert.match(line, new RegExp(`size=\\s*${data.length} x=${mountChecksum(data).toString(16).padStart(8, '0')}`), rel);
      }
      // extract gives the bytes back
      const ex = join(dir, `ex${version}`);
      const names = join(dir, 'names.txt');
      writeFileSync(names, Object.keys(files).join('\n') + '\n');
      run(['extract', a, ex, '--names', names]);
      for (const [rel, data] of Object.entries(files)) {
        assert.ok(readFileSync(join(ex, rel)).equals(data), `${rel} round-trips through version ${version}`);
      }
      const manifest = JSON.parse(readFileSync(join(ex, 'manifest.json'), 'utf8'));
      assert.equal(manifest.entries.length, Object.keys(files).length);
      // repack unchanged is byte-identical
      const b = join(dir, `t${version}-repack.a`);
      run(['repack', a, b]);
      assert.ok(readFileSync(b).equals(packed), `version ${version}: unchanged repack is byte-identical`);
      // repack with one replaced entry: still 100% verified, the new bytes come back out
      const rep = join(dir, `rep${version}`);
      mkdirSync(join(rep, 'music'), { recursive: true });
      const replaced = randomBytes(3001, 99);
      writeFileSync(join(rep, 'music', 'loop.ogg'), replaced);
      const c = join(dir, `t${version}-replaced.a`);
      run(['repack', a, c, '--replace', rep]);
      assert.match(run(['verify', c]), /\s6\/\s*6 matched/);
      const ex2 = join(dir, `ex${version}-replaced`);
      run(['extract', c, ex2, '--names', names]);
      assert.ok(readFileSync(join(ex2, 'music', 'loop.ogg')).equals(replaced));
      assert.ok(readFileSync(join(ex2, 'scripts', 'main.lua')).equals(files['scripts/main.lua']), 'untouched entries pass through');
    }
    // a version-0 archive re-encoded as version 2 (and back) keeps every entry
    const v2 = join(dir, 'cross.a');
    run(['repack', join(dir, 't0.a'), v2, '--version', '2']);
    assert.match(run(['verify', v2]), /v2\s+6\/\s*6 matched/);
    const back = join(dir, 'cross-back.a');
    run(['repack', v2, back, '--version', '0']);
    assert.ok(readFileSync(back).equals(readFileSync(join(dir, 't0.a'))), 'v0 -> v2 -> v0 is the identity');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
