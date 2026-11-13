// Round 107: packed mods. A mod too big to be seeded (Fiend Folio) ships as
// content-addressed packs and an index (modpack.py --packed); the page installs
// the index and the eager lane and reads the rest in place (mods.mjs
// createPackStore / createPackedMods, boot_web.mjs, host_shims_fs.c ranged
// entries). These run the real writer and the real reader against each other,
// through a host that, like jsDelivr, is asked for whole files only.
import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPackStore, createPackedMods, packedIndex, packsOnlyOf, parseIndex, packBase, isPacked, namedRight,
         seedMods, smallDevice, NEEDS_COMPUTER, PACK_CACHE, SEED_BUDGET,
         createPackDownloader, packedWords } from '../scripts/recomp/web/mods.mjs';
import { deflateRawSync } from 'node:zlib';

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
        keys: async () => [...m.keys()].map((url) => ({ url })),
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

test('a packed mod is not offered to a phone: it would run the game out of memory', () => {
  const env = (coarse, mem) => ({ matchMedia: (q) => ({ matches: q === '(pointer: coarse)' && coarse }), navigator: { deviceMemory: mem } });
  assert.equal(smallDevice(env(true, 4)), true, 'a touch-first device with 4 GB');
  assert.equal(smallDevice(env(true, undefined)), true, 'a touch-first device that does not say (Safari, Firefox)');
  assert.equal(smallDevice(env(true, 8)), false, 'a touch-first device with 8 GB may try');
  assert.equal(smallDevice(env(false, 2)), false, 'a mouse: a computer, whatever it reports');
  assert.equal(smallDevice({ navigator: {} }), false, 'no matchMedia (node, a worker): not a phone');
  const m = src('mods.mjs'), b = src('mod_browser.mjs');
  assert.ok(m.includes("if (smallDevice()) throw new Error(`${entry.name} needs more memory than a phone's browser gives the game`);"), 'installPacked refuses');
  // found in a real page: Enter on the paper list's row installed the two mods it needs, then refused
  const chainAt = m.indexOf('const { order, missing } = requiredChain('), heavyAt = m.indexOf('const heavy = smallDevice() && order.find((e) => isPacked(e));');
  const fetchAt = m.indexOf('const zip = await fetchMod(o.catalogueBase, e, onProgress);');
  assert.ok(chainAt > 0 && heavyAt > chainAt && fetchAt > heavyAt, 'the chain is checked for a packed mod before any part is fetched');
  assert.ok(m.slice(heavyAt, fetchAt).includes('if (heavy) throw new Error('), 'and a phone is refused there');
  assert.ok(m.includes('needsComputer: isPacked(m) && smallDevice(),'), 'the browser is told');
  assert.ok(m.includes(': isPacked(m) && smallDevice() ? NEEDS_COMPUTER') && NEEDS_COMPUTER === 'NEEDS A COMPUTER', 'the paper list says it');
  assert.ok(b.includes("text(F10, 'NEEDS A COMPUTER', d.x0, actionY + 4);") && b.indexOf('} else if (it.needsComputer) {') < b.indexOf('} else if (it.big) {'), 'the browser says it in place of INSTALL');
  assert.ok(b.includes('if (it.big || it.needsComputer) return;'), 'and its action does nothing');
});

// ---- round 108: the background download of every pack (createPackDownloader) ----

// a pack: the IMPK magic, then bytes; named after its sha256 like modpack.py's
const sha20 = (b) => createHash('sha256').update(b).digest('hex').slice(0, 20);
function makePack(seed, n, body) {
  const b = new Uint8Array(8 + (body ? body.length : n));
  b.set([0x49, 0x4d, 0x50, 0x4b, 1, 0, 0, 0]);
  b.set(body || noise(n, seed), 8);
  return { name: `${sha20(b)}.bin`, bytes: b };
}
// a CDN of packs: every request recorded with the fake time it came at; `hold`
// keeps an answer back until released; `status(name, nth)` answers an error
function packHost(byName, opts = {}) {
  const asked = [], at = [], holds = new Map(), aborted = [];
  const fetch = async (url, init) => {
    const name = url.split('/').pop(), signal = init && init.signal;
    asked.push(name); at.push([name, opts.clock ? opts.clock.t : 0]);
    if (opts.offline && opts.offline()) throw new TypeError('Failed to fetch');
    const callOff = () => { aborted.push(name); return new DOMException('The operation was aborted.', 'AbortError'); };
    if (holds.has(name)) {
      await Promise.race([holds.get(name).promise,
        new Promise((_, no) => { if (signal) signal.addEventListener('abort', () => no(callOff())); })]);
    }
    if (signal && signal.aborted) throw callOff();
    const s = opts.status && opts.status(name, asked.filter((x) => x === name).length);
    if (s) return new Response('no', { status: s });
    const b = byName.get(name);
    if (!b) return new Response('nope', { status: 404 });
    const out = b.slice();
    if (opts.corrupt && opts.corrupt(name)) out[out.length - 1] ^= 0xff;
    return new Response(out, { status: 200 });
  };
  const hold = (name) => { let release; const promise = new Promise((r) => { release = r; }); holds.set(name, { promise }); return () => { holds.delete(name); release(); }; };
  return { fetch, asked, at, hold, aborted };
}
// a clock that moves only when the code under test sleeps
function fakeClock() {
  const c = { t: 0 };
  c.now = () => c.t;
  c.sleep = (ms) => { const until = c.t + ms; return new Promise((r) => setImmediate(() => { if (c.t < until) c.t = until; r(); })); };
  return c;
}
const tick = () => new Promise((r) => setImmediate(r));
async function until(cond, what, n = 5000) { for (let i = 0; i < n; i++) { if (cond()) return; await tick(); } assert.fail(`never: ${what}`); }
// one mod of four packs: index order wav, lazy, lazy, eager
function fourPacks() {
  const W1 = makePack(1, 300), L1 = makePack(2, 200), L2 = makePack(3, 100), E1 = makePack(4, 50);
  const packs = [[W1.name, W1.bytes.length, 'wav'], [L1.name, L1.bytes.length, 'lazy'], [L2.name, L2.bytes.length, 'lazy'], [E1.name, E1.bytes.length, 'eager']];
  const byName = new Map([W1, L1, L2, E1].map((p) => [p.name, p.bytes]));
  const mod = { id: 'big', name: 'Big', packed: { base: 'https://cdn.example/pk', index: 'x.idx', indexBytes: 0 } };
  return { W1, L1, L2, E1, packs, byName, mod };
}
// every downloader a test makes is stopped after it, passed or not (a queue left
// running on the fake clock would keep the process alive)
const live = new Set();
const downloader = (o) => { const d = createPackDownloader(o); live.add(d); return d; };
afterEach(() => { for (const d of live) d.stop(); live.clear(); });
const keepIn = async (caches, p) => (await caches.open(PACK_CACHE)).put(`https://modpacks.isaac.invalid/${p.name}`, new Response(p.bytes));
const roomy = { persist: async () => true, estimate: async () => ({ quota: 8 << 30, usage: 0 }) };

test('round 108: the background queue takes the lazy lane first, and a read the game waits on jumps it', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);                                         // the eager lane came with the install
  const h = packHost(f.byName, { clock });
  const store = createPackStore({ fetch: h.fetch, caches, ...quick });
  const dl = downloader({ store, mods: async () => [f.mod], packsOf: async () => f.packs, concurrency: 1,
    now: clock.now, sleep: clock.sleep, storage: roomy, events: null, online: () => true, smallDevice: () => false });
  const freeL1 = h.hold(f.L1.name), freeW1 = h.hold(f.W1.name);
  assert.equal(await dl.start(), 'running');
  assert.deepEqual(dl.queue(), [f.L1.name, f.L2.name, f.W1.name], 'what is not kept, lazy before wav, the kept eager pack not at all');
  await until(() => h.asked.length === 1, 'the first pack asked for');
  assert.deepEqual(h.asked, [f.L1.name], 'one at a time, the lazy lane first');
  // the game wants L1 (being fetched) and W1 (last in the queue)
  const joined = store.getFrom(f.mod.packed.base, f.L1.name, f.L1.bytes.length);
  const jumped = store.getFrom(f.mod.packed.base, f.W1.name, f.W1.bytes.length);
  await until(() => h.asked.length === 2, 'the game\'s own read asked for');
  assert.deepEqual(h.asked, [f.L1.name, f.W1.name], 'W1 is asked for at once, ahead of L2; L1 is not asked for twice');
  freeL1();
  assert.deepEqual(Buffer.from((await joined).bytes), Buffer.from(f.L1.bytes), 'the read of L1 had the background\'s download');
  for (let i = 0; i < 50; i++) await tick();
  assert.deepEqual(h.asked, [f.L1.name, f.W1.name], 'nothing new starts while the game waits on the network');
  freeW1();
  assert.equal((await jumped).from, 'net');
  await until(() => dl.stats().state === 'complete', 'complete');
  assert.deepEqual(h.asked, [f.L1.name, f.W1.name, f.L2.name], 'W1, kept by the game\'s read, is not fetched again');
  const s = dl.stats();
  assert.equal(s.fetched, 2, 'L1 and L2 by the background');
  assert.equal(s.fromGame, 1, 'W1 by the game');
  assert.equal(s.packsHave, 4);
  assert.equal(s.bytesHave, s.bytes);
  assert.deepEqual(dl.progress('big').state, 'complete');
});

test('round 108: pace(1) runs the queue one at a time (the boot), pace(0) back to its concurrency', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);
  const h = packHost(f.byName, { clock });
  const frees = [f.L1, f.L2, f.W1].map((p) => h.hold(p.name));
  const dl = downloader({ store: createPackStore({ fetch: h.fetch, caches, ...quick }), mods: async () => [f.mod], packsOf: async () => f.packs,
    concurrency: 2, now: clock.now, sleep: clock.sleep, storage: roomy, events: null, online: () => true, smallDevice: () => false });
  dl.pace(1);
  await dl.start();
  for (let i = 0; i < 50; i++) await tick();
  assert.deepEqual(h.asked, [f.L1.name], 'one at a time while paced');
  dl.pace(0);
  await until(() => h.asked.length === 2, 'a second once unpaced');
  assert.deepEqual(h.asked, [f.L1.name, f.L2.name]);
  for (const free of frees) free();
  await until(() => dl.stats().state === 'complete', 'complete');
});

test('round 108: a later visit carries on where the last stopped, and fetches nothing kept', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);
  const opts = (store) => ({ store, mods: async () => [f.mod], packsOf: async () => f.packs, concurrency: 1,
    now: clock.now, sleep: clock.sleep, storage: roomy, events: null, online: () => true, smallDevice: () => false });
  // the first visit: L1 and L2 kept, then the page goes while W1 is on its way
  const h1 = packHost(f.byName, { clock });
  h1.hold(f.W1.name);
  const dl1 = downloader(opts(createPackStore({ fetch: h1.fetch, caches, ...quick })));
  await dl1.start();
  await until(() => h1.asked.includes(f.W1.name), 'the first visit reaches W1');
  dl1.stop();
  assert.equal(dl1.stats().packsHave, 3, 'three of four kept');
  assert.equal(dl1.progress('big').have, f.E1.bytes.length + f.L1.bytes.length + f.L2.bytes.length);
  // the next visit: only W1
  const h2 = packHost(f.byName, { clock });
  const dl2 = downloader(opts(createPackStore({ fetch: h2.fetch, caches, ...quick })));
  await dl2.start();
  assert.deepEqual(dl2.queue(), [f.W1.name], 'the plan names only what is not kept');
  await until(() => dl2.stats().state === 'complete', 'the second visit completes');
  assert.deepEqual(h2.asked, [f.W1.name], 'and asks for nothing else');
  assert.equal(dl2.stats().fetched, 1);
  // and the one after: complete at once, nothing asked
  const h3 = packHost(f.byName, { clock });
  const dl3 = downloader(opts(createPackStore({ fetch: h3.fetch, caches, ...quick })));
  assert.equal(await dl3.start(), 'complete');
  assert.equal(h3.asked.length, 0, 'a complete mod fetches nothing');
  assert.equal(dl3.progress('big').have, dl3.progress('big').total);
});

test('round 108: a read the game waits on calls off the other background downloads; they start again after it', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);
  const h = packHost(f.byName, { clock });
  const store = createPackStore({ fetch: h.fetch, caches, ...quick });
  const dl = downloader({ store, mods: async () => [f.mod], packsOf: async () => f.packs, concurrency: 2,
    now: clock.now, sleep: clock.sleep, storage: roomy, events: null, online: () => true, smallDevice: () => false });
  const freeL1 = h.hold(f.L1.name), freeL2 = h.hold(f.L2.name);
  await dl.start();
  await until(() => h.asked.length === 2, 'two under way');
  assert.deepEqual(h.asked, [f.L1.name, f.L2.name]);
  const r = await store.getFrom(f.mod.packed.base, f.W1.name, f.W1.bytes.length);
  assert.deepEqual(Buffer.from(r.bytes), Buffer.from(f.W1.bytes));
  assert.deepEqual(h.aborted.sort(), [f.L1.name, f.L2.name].sort(), 'both background downloads were called off for it');
  freeL1(); freeL2();
  await until(() => dl.stats().state === 'complete', 'complete');
  assert.equal(h.asked.filter((n) => n === f.L1.name).length, 2, 'L1 started again');
  assert.equal(h.asked.filter((n) => n === f.W1.name).length, 1, 'W1 once, by the game');
  const s = dl.stats();
  assert.equal(s.calledOff, 2);
  assert.equal(s.failures, 0, 'a download called off is not a failure');
  assert.equal(s.packsHave, 4);
});

test('round 108: the packs either side of one the game wanted move to the front of the queue', async () => {
  const P = Array.from({ length: 8 }, (_, i) => makePack(20 + i, 64));
  const packs = P.map((p) => [p.name, p.bytes.length, 'lazy']);
  const byName = new Map(P.map((p) => [p.name, p.bytes]));
  const mod = { id: 'big', name: 'Big', packed: { base: 'https://cdn.example/pk', index: 'x.idx', indexBytes: 0 } };
  const caches = cacheApi(), clock = fakeClock(), h = packHost(byName, { clock });
  const store = createPackStore({ fetch: h.fetch, caches, ...quick });
  const dl = downloader({ store, mods: async () => [mod], packsOf: async () => packs, concurrency: 1,
    now: clock.now, sleep: clock.sleep, storage: roomy, events: null, online: () => true, smallDevice: () => false });
  const free0 = h.hold(P[0].name);
  await dl.start();
  await until(() => h.asked.length === 1, 'P0 under way');
  await store.getFrom(mod.packed.base, P[5].name, P[5].bytes.length);      // the game wants P5
  assert.deepEqual(dl.queue(), [4, 6, 3, 7, 0, 1, 2].map((i) => P[i].name), 'P4 and P6, then P3 and P7, then the rest in order');
  free0();
  await until(() => dl.stats().state === 'complete', 'complete');
  assert.deepEqual(h.asked.slice(2, 6), [4, 6, 3, 7].map((i) => P[i].name), 'and they are the next fetched');
});

test('round 108: a 403 (jsDelivr, for a file it has not served) is tried again after a minute, not given up on', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);
  const first = new Map();
  // a 403 for every pack for 60 s after it was first asked for
  const h = packHost(f.byName, { clock, status: (name) => { if (!first.has(name)) first.set(name, clock.t); return clock.t - first.get(name) < 60000 ? 403 : 0; } });
  const store = createPackStore({ fetch: h.fetch, caches, ...quick });
  const lines = [];
  const dl = downloader({ store, mods: async () => [f.mod], packsOf: async () => f.packs, now: clock.now, sleep: clock.sleep,
    storage: roomy, events: null, online: () => true, smallDevice: () => false, log: (l) => lines.push(l) });
  await dl.start();
  await until(() => ['complete', 'incomplete'].includes(dl.stats().state), 'the queue settles', 100000);
  const s = dl.stats();
  assert.equal(s.state, 'complete', 'every pack kept in the end');
  assert.equal(s.refused403, 3, 'each of the three asked once into the 403');
  assert.equal(s.pauses, 0, 'a 403 is not taken for the network being down');
  for (const p of [f.L1, f.L2, f.W1]) {
    const times = h.at.filter(([n]) => n === p.name).map(([, t]) => t);
    assert.equal(times.length, 2, `${p.name}: asked twice`);
    assert.ok(times[1] - times[0] >= 60000, `${p.name}: the second time after the 403 ran out (${times[1] - times[0]} ms)`);
  }
});

test('a read the game waits on outlasts jsDelivr\'s minute of 403, and other failures keep their short count', async () => {
  const f = fourPacks();
  // (a) 403 for 60 s after the first request, as jsDelivr does: the read waits it out and gets the pack
  {
    const clock = fakeClock(), first = new Map();
    const h = packHost(f.byName, { clock, status: (name) => { if (!first.has(name)) first.set(name, clock.t); return clock.t - first.get(name) < 60000 ? 403 : 0; } });
    const store = createPackStore({ fetch: h.fetch, caches: cacheApi(), retries: 3, sleep: clock.sleep });
    const got = await store.getFrom(f.mod.packed.base, f.L1.name, f.L1.bytes.length);
    assert.deepEqual([...got.bytes], [...f.L1.bytes], 'the pack, once the 403 ran out');
    const times = h.at.filter(([n]) => n === f.L1.name).map(([, t]) => t);
    assert.equal(times.length, 4, 'asked once and three more times');
    assert.ok(times[3] - times[0] >= 60000, `the last try is past the minute (${times[3] - times[0]} ms)`);
  }
  // (b) a 403 that never ends is given up on after those tries, and says it was a 403
  {
    const clock = fakeClock();
    const h = packHost(f.byName, { clock, status: () => 403 });
    const store = createPackStore({ fetch: h.fetch, caches: cacheApi(), retries: 3, sleep: clock.sleep });
    await assert.rejects(store.getFrom(f.mod.packed.base, f.L1.name, f.L1.bytes.length), (e) => e.status === 403);
    assert.equal(h.asked.length, 4, 'four requests, not an endless wait');
  }
  // (c) a 500 keeps the ordinary schedule: 1, 3 and 9 s, four requests, 13 s in all
  {
    const clock = fakeClock();
    const h = packHost(f.byName, { clock, status: () => 500 });
    const store = createPackStore({ fetch: h.fetch, caches: cacheApi(), retries: 3, sleep: clock.sleep });
    await assert.rejects(store.getFrom(f.mod.packed.base, f.L1.name, f.L1.bytes.length), (e) => e.status === 500);
    assert.deepEqual(h.at.map(([, t]) => t), [0, 1000, 4000, 13000]);
  }
  // (d) a caller with no retries of its own (the background download) gets none for a 403 either
  {
    const clock = fakeClock();
    const h = packHost(f.byName, { clock, status: () => 403 });
    const store = createPackStore({ fetch: h.fetch, caches: cacheApi(), retries: 3, sleep: clock.sleep });
    await assert.rejects(store.getFrom(f.mod.packed.base, f.L1.name, f.L1.bytes.length, { background: true, retries: 0 }), (e) => e.status === 403);
    assert.equal(h.asked.length, 1);
  }
});

test('round 108: offline, the queue pauses and fetches nothing until the browser is online again', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);
  let up = false;
  const events = new EventTarget();
  const h = packHost(f.byName, { clock, offline: () => !up });
  const store = createPackStore({ fetch: h.fetch, caches, ...quick });
  const dl = downloader({ store, mods: async () => [f.mod], packsOf: async () => f.packs, now: clock.now, sleep: clock.sleep,
    storage: roomy, events, online: () => up, smallDevice: () => false });
  await dl.start();
  await until(() => dl.stats().state === 'paused', 'paused');
  for (let i = 0; i < 50; i++) await tick();
  assert.equal(h.asked.length, 0, 'nothing asked while offline');
  up = true; events.dispatchEvent(new Event('online'));
  await until(() => dl.stats().state === 'complete', 'complete once online');
  assert.equal(h.asked.length, 3);
  // a host that fails every request (the browser thinks it is online): three in a row pause the queue
  const g = fourPacks(), caches2 = cacheApi(), clock2 = fakeClock();
  const h2 = packHost(g.byName, { clock: clock2, offline: () => true });
  const dl2 = downloader({ store: createPackStore({ fetch: h2.fetch, caches: caches2, ...quick }), mods: async () => [g.mod], packsOf: async () => g.packs,
    now: clock2.now, sleep: clock2.sleep, storage: roomy, events: null, online: () => true, smallDevice: () => false, concurrency: 1 });
  await dl2.start();
  await until(() => dl2.stats().pauses >= 1, 'a pause');
  assert.equal(h2.asked.length, 3, 'three failures, then the pause: not a request per pack in a burst');
  dl2.stop();
});

test('round 108: without room for the rest, nothing is fetched and it is said once; with room it starts', async () => {
  const f = fourPacks(), clock = fakeClock();
  const h = packHost(f.byName, { clock });
  let persisted = 0;
  const tight = { persist: async () => { persisted += 1; return true; }, estimate: async () => ({ quota: 100 << 20, usage: 90 << 20 }) };
  const lines = [];
  const dl = downloader({ store: createPackStore({ fetch: h.fetch, caches: cacheApi(), ...quick }), mods: async () => [f.mod], packsOf: async () => f.packs,
    now: clock.now, sleep: clock.sleep, storage: tight, events: null, online: () => true, smallDevice: () => false, log: (l) => lines.push(l) });
  assert.equal(await dl.start(), 'noroom');
  assert.equal(await dl.start(), 'noroom', 'asked again (the next install), still no room');
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(h.asked.length, 0, 'nothing fetched');
  assert.ok(persisted >= 1, 'persistent storage was asked for');
  assert.equal(lines.filter((l) => /not enough room/.test(l)).length, 1, 'said once');
  assert.equal(dl.stats().free, 10 << 20);
  assert.match(packedWords(dl.progress('big').have, dl.progress('big').total, 'noroom').long, /NO ROOM/);
  // the same with room: it runs
  const h2 = packHost(f.byName, { clock });
  const dl2 = downloader({ store: createPackStore({ fetch: h2.fetch, caches: cacheApi(), ...quick }), mods: async () => [f.mod], packsOf: async () => f.packs,
    now: clock.now, sleep: clock.sleep, storage: { persist: async () => true, estimate: async () => ({ quota: 1 << 30, usage: 90 << 20 }) },
    events: null, online: () => true, smallDevice: () => false });
  assert.equal(await dl2.start(), 'running');
  await until(() => dl2.stats().state === 'complete', 'complete');
  assert.equal(h2.asked.length, 4);
  // and a phone never starts
  const dl3 = downloader({ store: createPackStore({ fetch: h2.fetch, caches: cacheApi(), ...quick }), mods: async () => [f.mod], packsOf: async () => f.packs,
    storage: roomy, events: null, smallDevice: () => true });
  assert.equal(await dl3.start(), 'phone');
});

test('round 108: a pack whose bytes are not its name\'s is refused, retried, then left to the game', async () => {
  const f = fourPacks(), caches = cacheApi(), clock = fakeClock();
  await keepIn(caches, f.E1);
  const h = packHost(f.byName, { clock, corrupt: (name) => name === f.W1.name });
  const store = createPackStore({ fetch: h.fetch, caches, ...quick });
  const dl = downloader({ store, mods: async () => [f.mod], packsOf: async () => f.packs, now: clock.now, sleep: clock.sleep,
    storage: roomy, events: null, online: () => true, smallDevice: () => false, giveUpAfter: 3 });
  await dl.start();
  await until(() => ['complete', 'incomplete'].includes(dl.stats().state), 'settled', 100000);
  assert.equal(dl.stats().state, 'incomplete');
  assert.equal(dl.stats().gaveUp, 1);
  assert.equal(h.asked.filter((n) => n === f.W1.name).length, 3, 'tried three times');
  assert.ok(!(await store.has(f.W1.name)), 'never kept');
  assert.ok(await store.has(f.L1.name) && await store.has(f.L2.name), 'the others are');
  assert.ok(store.stats.rejected >= 3);
});

test('round 108: a read the game waits on is timed, and told apart by what it waited for', async () => {
  // P1 holds a raw file and a deflated one, P2 a raw file; P2 is kept already
  const A = noise(5000, 11), B = Buffer.from('<anm2/>'.repeat(400)), C = noise(3000, 12);
  const Bz = deflateRawSync(B);
  const P1 = makePack(0, 0, Buffer.concat([A, Bz])), P2 = makePack(0, 0, C);
  const ix = { v: 1, packs: [[P1.name, P1.bytes.length, 'lazy'], [P2.name, P2.bytes.length, 'lazy']],
    f: [['a.png', A.length, 0, 8, A.length, 0, '', 0], ['b.anm2', B.length, 0, 8 + A.length, Bz.length, 1, '', 0], ['c.png', C.length, 1, 8, C.length, 0, '', 0]] };
  const caches = cacheApi();
  await keepIn(caches, P2);
  let t = 0;
  const h = packHost(new Map([[P1.name, P1.bytes]]));
  const slow = async (url) => { t += 120; return h.fetch(url); };       // the network takes 120 ms
  const store = createPackStore({ fetch: slow, caches, ...quick });
  const pm = createPackedMods({ store, now: () => t });
  await pm.add('m', 'https://cdn.example/pk', parseIndex(JSON.stringify(ix)));
  const a = pm.pread('mods/m/a.png', 0, A.length);
  assert.ok(a && typeof a.then === 'function');
  assert.deepEqual(Buffer.from(await a), A);
  const b = pm.pread('mods/m/b.anm2', 0, B.length);                       // P1 is held: only the decoding
  assert.ok(b && typeof b.then === 'function', 'a deflated file waits for its decoding');
  assert.deepEqual(Buffer.from(await b), B);
  assert.deepEqual(Buffer.from(await settle(pm.pread('mods/m/c.png', 0, C.length))), C);
  const s = pm.stats;
  assert.equal(s.waited, 3);
  assert.deepEqual([s.waitBy.net.n, s.waitBy.cache.n, s.waitBy.decode.n], [1, 1, 1], 'one each: network, cache, decoding');
  assert.equal(s.waitMs, 120);
  assert.equal(s.waitMax, 120);
  assert.equal(s.waitBy.net.max, 120);
  assert.equal(s.waitOver50, 1, 'the network read was over 50 ms, the others not');
  // a raw file in a held pack is answered at once and does not count
  assert.ok(pm.pread('mods/m/a.png', 10, 10) instanceof Uint8Array);
  assert.equal(pm.stats.waited, 3);
});

test('round 108: the page shares one pack store and starts the background download, and the menus show it', () => {
  const b = src('boot_web.mjs'), p = src('play.mjs'), m = src('mods.mjs'), mb = src('mod_browser.mjs');
  assert.ok(b.includes('packStore = hooks.packStore || createPackStore({ log });'), 'the game reads with the page\'s store');
  assert.ok(b.includes("if (n && packDownloader) { packDownloader.pace(1); packDownloader.start()"), 'every boot with a packed mod starts it, one at a time while it boots');
  assert.ok(b.includes('if (n === READER_CLEAR_FRAME && packedMods && packDownloader) packDownloader.pace(0);'), 'and two at a time once the boot is over');
  assert.ok(b.includes('background: background() ? background().stats() : null'), 'isaacLazyStats() says how far it is');
  assert.ok(p.includes('hooks.packStore = packStore;') && p.includes('hooks.packDownloader = packDownloader;') && p.includes('packs: packDownloader,'), 'play.mjs hands both to the boot and the menu');
  assert.ok(m.includes('if (packs) packs.start().catch('), 'an install starts it at once');
  assert.ok(m.includes('if (packs) packs.forget(mod.id);'), 'a removal stops fetching for the mod');
  assert.ok(mb.includes("(it.rowNote && it.rowNote !== 'INSTALLED' ? it.rowNote : '')"), 'the browser\'s row says how far');
  const w = packedWords(210 << 20, 435 << 20, 'running');
  assert.deepEqual([w.short, w.note, w.long], ['48%', '210 OF 435 MB', '210 OF 435 MB DOWNLOADED']);
  assert.equal(packedWords(435 << 20, 435 << 20, 'complete').long, 'ALL 435 MB DOWNLOADED');
  assert.equal(packedWords(435 << 20, 435 << 20, 'complete').short, 'INSTALLED');
  assert.match(packedWords(1, 2, 'paused').long, /PAUSED$/);
});
