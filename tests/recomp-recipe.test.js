// Window recipes: recipe.py writes them, recipe.js (the page and its reader Worker)
// rebuilds the version-0 archive bytes. A synthetic archive (no game data) is cut into
// awkward pieces -- mid-dword, mid-frame, mid-entry -- and every piece must come back
// byte for byte through the page's own decoder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tool = join(root, 'scripts', 'recomp', 'assets', 'recipe.py');
const decode = new Function(readFileSync(join(root, 'scripts', 'recomp', 'web', 'recipe.js'), 'utf8') + '\nreturn isaacRecipeDecode;')();

const PYTHONS = [
  join(process.env.LOCALAPPDATA ?? '', 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3',
  'python',
];
function findPython() {
  for (const p of PYTHONS) {
    if (!p) continue;
    const r = spawnSync(p, ['-c', 'import numpy, json'], { stdio: 'pipe' });
    if (r.status === 0) return p;
  }
  return null;
}
const python = findPython();

let fixture = null;
function getFixture() {
  if (fixture) return fixture;
  const dir = mkdtempSync(join(tmpdir(), 'recipe-'));
  const r = spawnSync(python, [tool, 'fixture', dir], { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 300000 });
  assert.equal(r.status, 0, `recipe.py fixture failed:\n${r.stdout}\n${r.stderr}`);
  const meta = JSON.parse(readFileSync(join(dir, 'pieces.json'), 'utf8'));
  fixture = { dir, archive: new Uint8Array(readFileSync(join(dir, meta.archive))), pieces: meta.pieces, modes: meta.stereoModes };
  return fixture;
}
process.on('exit', () => { if (fixture) rmSync(fixture.dir, { recursive: true, force: true }); });

// segments and parts of one recipe, read the way recipe.js reads them
function inspect(r) {
  const dv = new DataView(r.buffer, r.byteOffset, r.byteLength);
  let p = 3 + 4;
  const nseg = dv.getUint16(p, true); p += 2;
  const seen = { raw: 0, v0: 0, lit: 0, pcm: 0, channels: new Set() };
  for (let s = 0; s < nseg; s++) {
    const kind = r[p++];
    if (kind === 0) { seen.raw++; p += 4 + dv.getUint32(p, true); continue; }
    seen.v0++;
    p += 4 + 4 + 1;
    const nparts = dv.getUint16(p, true); p += 2;
    for (let i = 0; i < nparts; i++) {
      const pk = r[p++];
      if (pk === 0) { seen.lit++; p += 4 + dv.getUint32(p, true); continue; }
      seen.pcm++; seen.channels.add(r[p]);
      p += 1 + 4 + 4 + 4;
      p += 4 + dv.getUint32(p, true);
    }
  }
  return seen;
}

test('every piece of a version-0 archive comes back exactly through the page decoder', { skip: !python && 'needs python with numpy' }, () => {
  const { dir, archive, pieces } = getFixture();
  assert.ok(pieces.length > 20, `${pieces.length} pieces`);
  for (const pc of pieces) {
    const r = new Uint8Array(readFileSync(join(dir, pc.file)));
    const out = decode(r);
    const want = new Uint8Array(pc.hi - pc.lo + pc.tail);
    want.set(archive.subarray(pc.lo, pc.hi));
    assert.equal(out.length, want.length, `${pc.file} length`);
    assert.ok(out.every((v, i) => v === want[i]), `${pc.file} [${pc.lo}, ${pc.hi}) differs`);
  }
});

test('the fixture really codes PCM, mono and stereo, beside plain bytes', { skip: !python && 'needs python with numpy' }, () => {
  const { dir, pieces } = getFixture();
  const all = { raw: 0, v0: 0, lit: 0, pcm: 0, channels: new Set() };
  for (const pc of pieces) {
    const s = inspect(new Uint8Array(readFileSync(join(dir, pc.file))));
    for (const k of ['raw', 'v0', 'lit', 'pcm']) all[k] += s[k];
    s.channels.forEach((c) => all.channels.add(c));
  }
  assert.ok(all.pcm >= 6, `${all.pcm} coded PCM parts`);
  assert.ok(all.channels.has(1) && all.channels.has(2), 'both mono and stereo PCM are coded');
  assert.ok(all.lit > 0 && all.v0 > 0 && all.raw > 0, JSON.stringify({ ...all, channels: [...all.channels] }));
  const { modes } = getFixture();
  assert.ok(modes.every((n) => n > 0), `every stereo mode is coded at least once (left/right, left/side, right/side): ${modes}`);
});

test('a damaged recipe never rebuilds the archive bytes silently', { skip: !python && 'needs python with numpy' }, () => {
  const { dir, archive, pieces } = getFixture();
  let checked = 0;
  for (const pc of pieces) {
    const r = new Uint8Array(readFileSync(join(dir, pc.file)));
    if (inspect(r).pcm === 0) continue;
    const bad = r.slice();
    bad[bad.length - 7] ^= 0x5a;                 // inside the last coded PCM bytes
    let out = null;
    try { out = decode(bad); } catch { out = null; }
    const want = archive.subarray(pc.lo, pc.hi);
    const same = out && out.length >= want.length && want.every((v, i) => v === out[i]);
    assert.ok(!same, `${pc.file}: a flipped coded byte still gave the original bytes`);
    checked++;
  }
  assert.ok(checked >= 3, `${checked} PCM pieces damaged`);
});

test('the page and its reader Worker both decode recipe windows (flag 2)', () => {
  const portable = readFileSync(join(root, 'scripts', 'recomp', 'assets', 'portable.py'), 'utf8');
  assert.equal((portable.match(/'<script>' \+ RECIPE_JS \+ PROVIDER_JS \+ '<\/script>'/g) || []).length, 2, 'both page builders define the decoder ahead of the provider');
  assert.ok(portable.includes("if (z === '2') return isaacRecipeDecode(await inflate(stored));"), 'the main-thread window path rebuilds a recipe');
  assert.ok(portable.includes("+ '!' + (+S[p.s].wz.charAt(w.k) || 0) + '*'"), 'the Worker URL carries the flag as 0, 1 or 2');
  const boot = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(boot.includes('if (winPacked === 2) win = isaacRecipeDecode(win);'), 'the Worker rebuilds a recipe window after inflating it');
  assert.ok(boot.includes("String(window.isaacRecipeDecode)") && boot.includes('new Blob([READER_WORKER + recipeSrc]'), 'the decoder source goes to the Worker');
});

// The packer's rule for a recipe is gzip's: at least 1.6% off the window, or the window
// ships as it is (a window of Ogg or PNG entries gains nothing and would only cost a decode).
const PACKER = [
  'import gzip, json, os, random, sys, tempfile',
  'sys.path.insert(0, os.path.join(sys.argv[1], "scripts", "recomp", "assets"))',
  'import portable',
  'random.seed(7)',
  'noise = bytes(random.getrandbits(8) for _ in range(65536))',
  'recipes = {0: bytes(65536), 1: noise, 2: None}',
  'with tempfile.TemporaryDirectory() as d:',
  '    p = portable.WindowPacker(3, b"", d, "b", lambda b: gzip.compress(b, 9, mtime=0), recipe_for=recipes.get)',
  '    for i, w in enumerate([noise, noise, bytes(65536)]):',
  '        p.add(i, w)',
  '    p.flush()',
  '    print(json.dumps({"flags": p.flags, "lens": p.lens}))',
].join('\n');
test('a recipe ships only where it shrinks the window, else the window as it is', { skip: !python && 'needs python with numpy' }, () => {
  const r = spawnSync(python, ['-c', PACKER, root], { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  const { flags, lens } = JSON.parse(r.stdout.trim());
  assert.deepEqual(flags, ['2', '0', '1'], 'shrinking recipe -> 2; incompressible recipe of noise -> the raw window; no recipe -> gzip');
  assert.equal(lens[1], 65536);
  assert.ok(lens[0] < 1000 && lens[2] < 1000);
});
