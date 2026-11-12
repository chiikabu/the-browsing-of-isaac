// Round 107: packed mods. A mod too big to be seeded (Fiend Folio) ships as
// content-addressed packs and an index (modpack.py --packed); the page installs
// the index and the eager lane and reads the rest in place (mods.mjs
// createPackStore / createPackedMods, boot_web.mjs, host_shims_fs.c ranged
// entries). These run the real writer and the real reader against each other,
// through a host that, like jsDelivr, is asked for whole files only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPackStore, createPackedMods, packedIndex, packsOnlyOf, parseIndex, packBase, isPacked, namedRight,
         seedMods, PACK_CACHE, SEED_BUDGET } from '../scripts/recomp/web/mods.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tool = join(root, 'scripts', 'recomp', 'assets', 'modpack.py');
const python = ['python3', 'python'].find((p) => spawnSync(p, ['-c', 'import zlib'], { stdio: 'pipe' }).status === 0);
const src = (f) => readFileSync(join(root, 'scripts', 'recomp', 'web', f), 'utf8').replace(/\r\n/g, '\n');

// a WAV: RIFF, fmt, a LIST chunk before the data (the header then runs past 44 bytes), PCM
function wav(seed, frames) {
  const fmt = Buffer.alloc(24); fmt.write('fmt ', 0); fmt.writeUInt32LE(16, 4); fmt.writeUInt16LE(1, 8); fmt.writeUInt16LE(1, 10);
  fmt.writeUInt32LE(22050, 12); fmt.writeUInt32LE(44100, 16); fmt.writeUInt16LE(2, 20); fmt.writeUInt16LE(16, 22);
  const list = Buffer.concat([Buffer.from('LIST'), Buffer.from([10, 0, 0, 0]), Buffer.from('INFOabcdef')]);
  const pcm = Buffer.alloc(frames * 2);
  for (let i = 0; i < frames; i++) pcm.writeInt16LE(Math.round(8000 * Math.sin((i + seed) / 7)), i * 2);
  const data = Buffer.concat([Buffer.from('data'), Buffer.alloc(4), pcm]); data.writeUInt32LE(pcm.length, 4);
  const body = Buffer.concat([Buffer.from('WAVE'), fmt, list, data]);
  const riff = Buffer.alloc(8); riff.write('RIFF', 0); riff.writeUInt32LE(body.length, 4);
  return Buffer.concat([riff, body]);
}
const noise = (n, seed) => { const b = Buffer.alloc(n); let x = seed >>> 0; for (let i = 0; i < n; i++) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; b[i] = x >>> 24; } return b; };

// one packed mod, built by modpack.py, with every shape the format has
function build() {
  const tmp = mkdtempSync(join(tmpdir(), 'modpacks-'));
  const mods = join(tmp, 'mods'), big = join(mods, 'bigmod_900001'), out = join(tmp, 'out');
  const put = (rel, bytes) => { mkdirSync(dirname(join(big, rel)), { recursive: true }); writeFileSync(join(big, rel), bytes); };
  const files = {
    'metadata.xml': Buffer.from('<?xml version="1.0"?><metadata><name>Big Mod</name><directory>bigmod</directory><id>900001</id><version>3</version></metadata>'),
    'main.lua': Buffer.from('-- big mod\n'.repeat(400)),
    'scripts/more.lua': Buffer.from('return 1\n'),
    'content-repentogon/entities2.xml': Buffer.from('<entities>' + '<entity/>'.repeat(500) + '</entities>'),
    'content-repentogon/players.xml': Buffer.from('<players/>'),
    'content/players.xml': Buffer.from('<players own="1"/>'),
    'resources/sfx/a.wav': wav(1, 40000),
    'resources/sfx/b.wav': wav(2, 3000),
    'resources/gfx/noise.png': noise(150000, 7),
    'resources/gfx/one.anm2': Buffer.from('<AnimatedActor>' + 'x'.repeat(5000) + '</AnimatedActor>'),
    'resources/gfx/same1.anm2': Buffer.from('<same/>'.repeat(300)),
    'resources/gfx/copy/same2.anm2': Buffer.from('<same/>'.repeat(300)),
    'basementrenovator/editor.xml': Buffer.from('<never/>'),
  };
  for (const [rel, b] of Object.entries(files)) put(rel, b);
  const r = spawnSync(python, [tool, mods, out, '--packed', 'bigmod_900001', '--pack-mib', '0.05'], { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
  assert.equal(r.status, 0, `modpack:\n${r.stdout}\n${r.stderr}`);
  const cat = JSON.parse(readFileSync(join(out, 'catalogue.json'), 'utf8'));
  return { tmp, out, files, cat, said: r.stdout };
}

// a host of whole files (no Range), counting what it is asked; and a Cache API stand-in
function host(dir, opts = {}) {
  const asked = [];
  const fetch = async (url, init) => {
    assert.ok(!(init && init.headers && (init.headers.Range || init.headers.range)), 'no byte range is ever asked for');
    asked.push(url);
    if (opts.offline) throw new TypeError('Failed to fetch');
    const name = url.split('/').pop();
    if (opts.missing && opts.missing.has(name)) return new Response('nope', { status: 404 });
    const p = join(dir, 'pk', name);
    if (!existsSync(p)) return new Response('nope', { status: 404 });
    let b = new Uint8Array(readFileSync(p));
    if (opts.corrupt && opts.corrupt(name, asked.filter((u) => u.endsWith(name)).length)) { b = b.slice(); b[b.length - 1] ^= 0xff; }
    return new Response(b, { status: 200 });
  };
  return { fetch, asked };
}
function cacheApi() {
  const stores = new Map();
  return {
    stores,
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const m = stores.get(name);
      return {
        match: async (k) => (m.has(k) ? new Response(m.get(k)) : undefined),
        put: async (k, r) => { m.set(k, new Uint8Array(await r.arrayBuffer())); },
        delete: async (k) => m.delete(k),
      };
    },
  };
}
const quick = { retries: 2, backoffMs: [1], sleep: async () => {} };
const settle = async (x) => (x && typeof x.then === 'function' ? await x : x);

test('round 107: modpack --packed writes content-addressed packs and an index the reader takes', { skip: !python && 'no python' }, async () => {
  const b = build();
  try {
    const e = b.cat.mods.find((m) => m.id === 'bigmod');
    assert.ok(e && isPacked(e) && e.parts === 0, 'a packed entry: parts 0 and a packed field');
    assert.equal(e.workshop, '900001');
    const pk = readdirSync(join(b.out, 'pk'));
    for (const name of pk) {
      const bytes = readFileSync(join(b.out, 'pk', name));
      assert.ok(bytes.length < 20000000, `${name} is under 20,000,000 bytes`);
      assert.ok(await namedRight(name, new Uint8Array(bytes)), `${name} is named after its own sha256`);
    }
    assert.ok(pk.includes(e.packed.index) && e.packed.indexBytes === readFileSync(join(b.out, 'pk', e.packed.index)).length);
    const ix = parseIndex(readFileSync(join(b.out, 'pk', e.packed.index)).length && new TextDecoder().decode(
      new Uint8Array(await new Response(new Blob([readFileSync(join(b.out, 'pk', e.packed.index))]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())));
    const paths = ix.f.map((r) => r[0]);
    assert.ok(!paths.some((p) => p.startsWith('basementrenovator/')), 'editor data is left out');
    assert.deepEqual(ix.alias.map((a) => a[0]), ['content/entities2.xml'], 'content-repentogon is listed as content/ unless content/ has the file');
    const row = (p) => ix.f.find((r) => r[0] === p);
    assert.deepEqual(row('resources/gfx/same1.anm2').slice(2, 5), row('resources/gfx/copy/same2.anm2').slice(2, 5), 'identical files are stored once');
    assert.equal(row('resources/gfx/noise.png')[5], 0, 'what deflate cannot shrink is stored raw');
    assert.equal(row('main.lua')[5], 1, 'what it can is stored deflated');
    assert.equal(ix.packs[row('main.lua')[2]][2], 'eager', 'Lua is in the eager lane');
    assert.equal(ix.packs[row('resources/sfx/a.wav')[2]][2], 'wav', 'a WAV body has a lane of its own');
    assert.ok(row('resources/sfx/a.wav')[7] > 44, 'a WAV header runs to its data chunk header (past a LIST chunk)');
    assert.ok(ix.packs.length > 3, 'a small pack target makes several packs');
    // the same input again: byte-identical output
    const again = spawnSync(python, [tool, join(b.tmp, 'mods'), join(b.tmp, 'out2'), '--packed', 'bigmod_900001', '--pack-mib', '0.05'], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    assert.equal(again.status, 0);
    const hash = (d) => Object.fromEntries(readdirSync(d).map((n) => [n, createHash('sha256').update(readFileSync(join(d, n))).digest('hex')]));
    assert.deepEqual(hash(join(b.tmp, 'out2', 'pk')), hash(join(b.out, 'pk')), 'packs and index are byte-identical across builds');
    assert.match(b.said, /round-tripped/, 'the build checked its own output file for file');
  } finally { rmSync(b.tmp, { recursive: true, force: true }); }
});

test('round 107: every file reads back byte for byte; WAV headers at once, bodies once their pack is in', { skip: !python && 'no python' }, async () => {
  const b = build();
  try {
    const e = b.cat.mods.find((m) => m.id === 'bigmod');
    const h = host(b.out), caches = cacheApi();
    const store = createPackStore({ fetch: h.fetch, caches, ...quick });
    const base = packBase('https://cdn.example/mods', e);
    assert.equal(base, 'https://cdn.example/mods/pk');
    const mod = { id: 'bigmod', packed: { base, index: e.packed.index, indexBytes: e.packed.indexBytes } };
    const ix = await packedIndex(store, mod);
    const pm = createPackedMods({ store, holdBytes: 0, fileBytes: 0 });
    await pm.add('bigmod', base, ix);
    const eagerAsked = h.asked.length;
    assert.ok(h.asked.every((u) => u.startsWith(base + '/')), 'only the pack host is asked');
    const owned = [...pm.paths('bigmod')].map(([p]) => p).sort();
    assert.ok(owned.includes('mods/bigmod/content/entities2.xml') && owned.includes('mods/bigmod/content-repentogon/entities2.xml'), 'an alias is a path of its own');
    assert.ok(!owned.some((p) => p.includes('basementrenovator')));
    // the WAV header pass: 12, 8, 16 ... bytes up to the data header, every one answered at once, no fetch
    const a = b.files['resources/sfx/a.wav'], hl = ix.f.find((r) => r[0] === 'resources/sfx/a.wav')[7];
    for (let off = 0; off < hl;) {
      const n = Math.min(off === 0 ? 12 : 8, hl - off);
      const got = pm.pread('mods/bigmod/resources/sfx/a.wav', off, n);
      assert.ok(got instanceof Uint8Array, `the header read at ${off} is answered at once`);
      assert.deepEqual(Buffer.from(got), a.subarray(off, off + n));
      off += n;
    }
    assert.equal(h.asked.length, eagerAsked, 'and fetched nothing');
    // the body: a promise the first time (its pack is fetched), the right bytes
    const body = pm.pread('mods/bigmod/resources/sfx/a.wav', hl, a.length - hl);
    assert.ok(body && typeof body.then === 'function', 'a body read waits for its pack');
    assert.deepEqual(Buffer.from(await body), a.subarray(hl));
    // every file, whole and in pieces, alias included
    for (const [p, size] of pm.paths('bigmod')) {
      const rel = p.slice('mods/bigmod/'.length);
      const want = b.files[rel] || b.files[rel.replace(/^content\//, 'content-repentogon/')];
      assert.equal(size, want.length, `${rel}: its registered size`);
      assert.deepEqual(Buffer.from(await settle(pm.pread(p, 0, size))), want, `${rel}: whole`);
      if (size > 10) assert.deepEqual(Buffer.from(await settle(pm.pread(p, 3, 7))), want.subarray(3, 10), `${rel}: a piece`);
      assert.equal((await settle(pm.pread(p, size, 16))).length, 0, `${rel}: past its end, nothing`);
    }
    assert.equal(pm.pread('mods/other/x.lua', 0, 4), null, 'a path that is not a packed mod\'s is not answered');
    // the Lua for MEMFS
    const lua = Object.fromEntries((await pm.lua('bigmod')).map(([r, bb]) => [r, Buffer.from(bb)]));
    assert.deepEqual(Object.keys(lua).sort(), ['main.lua', 'scripts/more.lua']);
    assert.deepEqual(lua['main.lua'], b.files['main.lua']);
    // and nothing asked for a range (host() asserts it on every fetch); each pack fetched once at most
    const once = new Set(h.asked);
    assert.equal(once.size, h.asked.length, 'no pack or index was fetched twice');
    assert.ok(caches.stores.has(PACK_CACHE), 'the packs went into the pack cache');
  } finally { rmSync(b.tmp, { recursive: true, force: true }); }
});

test('round 107: a corrupt pack is refused and fetched again; a missing one fails after its retries', { skip: !python && 'no python' }, async () => {
  const b = build();
  try {
    const e = b.cat.mods.find((m) => m.id === 'bigmod');
    const base = 'https://cdn.example/mods/pk';
    const mod = { id: 'bigmod', packed: { base, index: e.packed.index } };
    // corrupt on the first answer only: the second is taken
    const h1 = host(b.out, { corrupt: (name, n) => name.endsWith('.bin') && n === 1 });
    const s1 = createPackStore({ fetch: h1.fetch, caches: cacheApi(), ...quick });
    const pm1 = createPackedMods({ store: s1 });
    await pm1.add('bigmod', base, await packedIndex(s1, mod));
    assert.ok(s1.stats.rejected >= 1 && s1.stats.retried >= 1, 'a pack whose bytes do not match its name is refused and asked for again');
    assert.deepEqual(Buffer.from(await settle(pm1.pread('mods/bigmod/resources/gfx/noise.png', 0, 150000))), b.files['resources/gfx/noise.png']);
    // corrupt every time: the read fails, nothing wrong is handed over or kept
    const ix = await packedIndex(s1, mod);
    const wavPack = ix.packs[ix.f.find((r) => r[0] === 'resources/sfx/a.wav')[2]][0];
    const h2 = host(b.out, { corrupt: (name) => name === wavPack });
    const c2 = cacheApi();
    const s2 = createPackStore({ fetch: h2.fetch, caches: c2, ...quick });
    const pm2 = createPackedMods({ store: s2 });
    await pm2.add('bigmod', base, ix);
    await assert.rejects(settle(pm2.pread('mods/bigmod/resources/sfx/a.wav', 200, 100)), /could not be fetched/);
    assert.equal(h2.asked.filter((u) => u.endsWith(wavPack)).length, 3, 'tried once and retried twice');
    assert.ok(!(await s2.has(wavPack)), 'a refused pack is not kept');
    assert.equal(pm2.stats.failed, 1);
    // missing (404): the same
    const h3 = host(b.out, { missing: new Set([wavPack]) });
    const s3 = createPackStore({ fetch: h3.fetch, caches: cacheApi(), ...quick });
    const pm3 = createPackedMods({ store: s3 });
    await pm3.add('bigmod', base, ix);
    await assert.rejects(settle(pm3.pread('mods/bigmod/resources/sfx/a.wav', 200, 100)), /HTTP 404/);
    // ... while its header is still answered from the eager lane
    assert.ok(pm3.pread('mods/bigmod/resources/sfx/a.wav', 0, 12) instanceof Uint8Array);
  } finally { rmSync(b.tmp, { recursive: true, force: true }); }
});

test('round 107: once installed, a packed mod boots and plays offline from the cache', { skip: !python && 'no python' }, async () => {
  const b = build();
  try {
    const e = b.cat.mods.find((m) => m.id === 'bigmod');
    const base = 'https://cdn.example/mods/pk', caches = cacheApi();
    const mod = { id: 'bigmod', packed: { base, index: e.packed.index } };
    const online = createPackStore({ fetch: host(b.out).fetch, caches, ...quick });
    const pm = createPackedMods({ store: online });
    await pm.add('bigmod', base, await packedIndex(online, mod));
    for (const [p, size] of pm.paths('bigmod')) await settle(pm.pread(p, 0, size));    // played once: every pack fetched
    const off = host(b.out, { offline: true });
    const store = createPackStore({ fetch: off.fetch, caches, ...quick });
    const pm2 = createPackedMods({ store });
    await pm2.add('bigmod', base, await packedIndex(store, mod));
    for (const [p, size] of pm2.paths('bigmod')) {
      const rel = p.slice('mods/bigmod/'.length);
      const want = b.files[rel] || b.files[rel.replace(/^content\//, 'content-repentogon/')];
      assert.deepEqual(Buffer.from(await settle(pm2.pread(p, 0, size))), want, `${rel} offline`);
    }
    assert.equal(off.asked.length, 0, 'the network was never asked');
    assert.ok(store.stats.cacheHits > 0);
  } finally { rmSync(b.tmp, { recursive: true, force: true }); }
});

test('round 107: removing a packed mod frees its packs but not one another mod still names', async () => {
  const gz = async (o) => new Uint8Array(await new Response(new Blob([JSON.stringify(o)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
  const caches = cacheApi(), cache = await caches.open(PACK_CACHE);
  const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 20);
  const shared = new Uint8Array([0x49, 0x4d, 0x50, 0x4b, 1, 0, 0, 0, 1]), only = new Uint8Array([0x49, 0x4d, 0x50, 0x4b, 1, 0, 0, 0, 2]);
  const sn = `${sha(shared)}.bin`, on = `${sha(only)}.bin`;
  const ixA = await gz({ v: 1, packs: [[sn, 9, 'lazy'], [on, 9, 'lazy']], f: [], alias: [] });
  const ixB = await gz({ v: 1, packs: [[sn, 9, 'lazy']], f: [], alias: [] });
  const an = `${sha(ixA)}.idx`, bn = `${sha(ixB)}.idx`;
  for (const [n, v] of [[sn, shared], [on, only], [an, ixA], [bn, ixB]]) await cache.put(`https://modpacks.isaac.invalid/${n}`, new Response(v));
  const store = createPackStore({ fetch: async () => { throw new Error('offline'); }, caches, ...quick });
  const A = { id: 'a', packed: { base: 'x', index: an } }, B = { id: 'b', packed: { base: 'x', index: bn } }, Z = { id: 'z', name: 'zip mod' };
  const freed = await packsOnlyOf(store, A, [A, B, Z]);
  assert.deepEqual(freed.sort(), [an, on].sort(), 'its index and the pack only it names');
  assert.equal(await store.drop(freed), 2);
  assert.ok(await store.has(sn) && await store.has(bn) && !(await store.has(on)));
});

test('round 107: the seed budget counts the mods that are seeded, and a packed one is not', async () => {
  const store = {
    mods: [{ key: 'big', value: { id: 'big', name: 'Big', files: 20814, bytes: 667364395, added: 1, packed: { index: 'a'.repeat(20) + '.idx', base: 'x' } } },
           { key: 'small', value: { id: 'small', name: 'Small', files: 1, bytes: 2, added: 2 } }],
    files: [{ key: 'small/main.lua', value: { bytes: new Uint8Array([1, 2]) } }],
    state: [],
  };
  const fake = { transaction: (name) => ({ objectStore: () => ({ openCursor: () => {
    const rows = store[name].slice(), req = {};
    queueMicrotask(function step() {
      if (!rows.length) { req.result = null; req.onsuccess(); return; }
      const r = rows.shift(); req.result = { key: r.key, value: r.value, continue: () => queueMicrotask(step) }; req.onsuccess();
    });
    return req;
  } }) }) };
  const seen = [];
  const r = await seedMods(fake, (p, b) => { seen.push(p); return true; }, null, { sentinel: false });
  assert.equal(r.mods, 1, 'the zip mod is seeded');
  assert.ok(!seen.some((p) => p.includes('/big/')), 'nothing of the packed mod is seeded: boot_web registers it');
  assert.ok(r.bytes <= SEED_BUDGET);
  const m = src('mods.mjs');
  assert.ok(m.includes('big: !isPacked(m) && (m.bytes || 0) > SEED_BUDGET'), 'the browser does not call a packed mod too big');
  assert.ok(m.includes("mods.filter((x) => !isPacked(x)).reduce((n, x) => n + x.bytes, 0) > SEED_BUDGET"), 'nor counts it in the budget');
  assert.ok(m.includes('if (isPacked(e)) { await installPacked(e, onProgress); fresh.add(e.id); continue; }'), 'a packed entry installs its own way');
  assert.ok(m.includes('const zip = await fetchMod(o.catalogueBase, e, onProgress);'), 'and every other one as before');
});

test('round 107: the page routes a packed mod\'s reads, and only those, to the pack reader', () => {
  const b = src('boot_web.mjs');
  assert.ok(b.includes("cfg.isaacLazyRanged = (src) => packedMods.owns(src);"), 'the engine is told which files are read in place');
  assert.ok(b.includes('if (packedMods && packedMods.owns(src)) {'), 'reads of them go to the pack reader');
  assert.ok(/stageOk\('register packed mods'/.test(b) && b.indexOf("stageOk('register packed mods'") > b.indexOf("stageOk('seed mods'"), 'registered after the seeded mods');
  assert.ok(b.includes('if (n === READER_CLEAR_FRAME && packedMods) packedMods.release();'), 'the eager lane is let go once the boot is over');
  // a failed read says it the way the error panel listens for (play.mjs)
  assert.ok(b.includes('(e) => failRead(src, off, len, e.message)'));
  assert.ok(/lazy \(read\|pread\) FAILED/.test(src('play.mjs')));
});
