// Round 116: installed mods follow the catalogue the page pins (mods.mjs
// createModUpdater, play.mjs, boot_web.mjs). A mod installed from the catalogue is
// compared with the catalogue's entry by content (never by its version string) and,
// when it differs, replaced in one transaction that keeps what the player chose.
// These run the real updater against a stand-in IndexedDB (transactions that
// commit whole or not at all), a stand-in CDN and a stand-in Cache API.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createModUpdater, planUpdate, entryIdentity, sameContent, installedIdentity, replaceMod, updateWords,
         pinnedBase, createPackStore, PACK_CACHE, stalePacks } from '../scripts/recomp/web/mods.mjs';
import { zipStore } from '../scripts/recomp/web/zip.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'scripts', 'recomp', 'web', f), 'utf8').replace(/\r\n/g, '\n');
const enc = (s) => new TextEncoder().encode(s);
const tick = () => new Promise((r) => setImmediate(r));
async function until(cond, what, n = 5000) { for (let i = 0; i < n; i++) { if (cond()) return; await tick(); } assert.fail(`never: ${what}`); }

// ---- an IndexedDB stand-in: what mods.mjs uses, with whole-or-nothing commits ----
if (typeof globalThis.IDBKeyRange === 'undefined') {
  globalThis.IDBKeyRange = { bound: (lower, upper) => ({ lower, upper, range: true }) };
}
const inRange = (q, k) => (q && q.range ? k >= q.lower && k <= q.upper : k === q);
function fakeDb(seed = {}) {
  const data = { files: new Map(seed.files || []), mods: new Map(seed.mods || []), state: new Map(seed.state || []) };
  const db = { data, commits: 0, refuse: null };
  db.transaction = (names, mode) => {
    // the transaction's own view: reads see its writes; nothing reaches `data` until it commits
    const work = Object.fromEntries(Object.keys(data).map((k) => [k, new Map(data[k])]));
    const touched = Object.fromEntries(Object.keys(data).map((k) => [k, new Set()]));
    const tx = { error: null, oncomplete: null, onerror: null, onabort: null };
    let pending = 0, ended = false, scheduled = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      if (mode === 'readwrite' && db.refuse && db.refuse(work)) {
        tx.error = new Error('QuotaExceededError'); if (tx.onabort) tx.onabort(); return;
      }
      for (const s of Object.keys(data)) for (const k of touched[s]) { if (work[s].has(k)) data[s].set(k, work[s].get(k)); else data[s].delete(k); }
      if (mode === 'readwrite') db.commits += 1;
      if (tx.oncomplete) tx.oncomplete();
    };
    const maybeEnd = () => { if (!pending && !scheduled) { scheduled = true; setImmediate(() => { scheduled = false; if (!pending) finish(); }); } };
    const request = (fn) => {
      const req = { result: undefined, onsuccess: null, onerror: null };
      pending += 1;
      queueMicrotask(() => { req.result = fn(); pending -= 1; if (req.onsuccess) req.onsuccess(); maybeEnd(); });
      return req;
    };
    tx.abort = () => { if (ended) return; ended = true; queueMicrotask(() => { if (tx.onabort) tx.onabort(); }); };
    tx.objectStore = (s) => ({
      get: (k) => request(() => work[s].get(k)),
      put: (v, k) => { assert.equal(mode, 'readwrite', 'a write in a readwrite transaction'); work[s].set(k, v); touched[s].add(k); return request(() => k); },
      delete: (q) => { for (const k of [...work[s].keys()]) if (inRange(q, k)) { work[s].delete(k); touched[s].add(k); } return request(() => undefined); },
      openCursor: (q) => {
        const keys = [...work[s].keys()].filter((k) => q == null || inRange(q, k)).sort();
        const req = { result: null, onsuccess: null, onerror: null };
        pending += 1;
        const step = () => queueMicrotask(() => {
          const k = keys.shift();
          if (k === undefined) { req.result = null; pending -= 1; if (req.onsuccess) req.onsuccess(); maybeEnd(); return; }
          req.result = { key: k, value: work[s].get(k), continue: step };
          if (req.onsuccess) req.onsuccess();
        });
        step();
        return req;
      },
    });
    maybeEnd();
    return tx;
  };
  db.filesOf = (id) => [...data.files.entries()].filter(([k]) => k.startsWith(`${id}/`)).map(([k, v]) => [k, Buffer.from(v.bytes).toString('hex')]).sort();
  return db;
}

// ---- a CDN stand-in: the catalogue and the parts, every request recorded ----
function cdn(files, opts = {}) {
  const asked = [], inits = [], holds = new Map();
  const fetch = async (url, init) => {
    asked.push(url); inits.push(init || null);
    if (opts.down && opts.down()) throw new TypeError('Failed to fetch');
    const name = url.replace(/^https?:\/\/[^/]+\/[^/]+\//, '');
    if (holds.has(name)) await holds.get(name);
    const s = opts.status && opts.status(name, asked.filter((u) => u === url).length);
    if (s) return new Response('no', { status: s });
    const b = files.get(name);
    if (!b) return new Response('nope', { status: 404 });
    return new Response(typeof b === 'string' ? b : b.slice(), { status: 200 });
  };
  const hold = (name) => { let release; holds.set(name, new Promise((r) => { release = r; })); return () => { holds.delete(name); release(); }; };
  return { fetch, asked, inits, hold };
}
const BASE = 'https://cdn.example/cat';

// a mod as the catalogue builds it: a zip of its files, and the entry that names it
async function catalogueMod(id, files, extra = {}) {
  const entries = Object.entries(files).map(([name, text]) => ({ name, bytes: enc(text) }));
  const zip = new Uint8Array(await zipStore(entries).arrayBuffer());
  const entry = Object.assign({ id, name: `${id} mod`, version: '1', bytes: zip.length,
    unpacked: entries.reduce((n, e) => n + e.bytes.length, 0), files: entries.length, parts: 1 }, extra);
  return { entry, zip, entries };
}
// what an install from the catalogue leaves in the store
async function installed(id, cm, extra = {}) {
  const sha = createHash('sha256').update(cm.zip).digest('hex');
  const rec = Object.assign({ id, name: cm.entry.name, files: cm.entries.length, bytes: cm.entry.unpacked, added: 111, enabled: true,
    source: 'catalogue', cat: entryIdentity(cm.entry, sha) }, extra);
  return { rec, files: cm.entries.map((e) => [`${id}/${e.name}`, { bytes: e.bytes }]) };
}
const meta = (id, n) => `<?xml version="1.0"?><metadata><name>${id} mod</name><directory>${id}</directory><version>1</version><n>${n}</n></metadata>`;
const updaterFor = (db, host, extra = {}) => {
  const lines = [];
  const u = createModUpdater(Object.assign({ catalogueBase: BASE, db: async () => db, fetch: host.fetch, log: (l) => lines.push(l),
    sleep: async () => {} }, extra));
  return { u, lines };
};

// release 22's and 23's catalogue entries for the layer, as they are (.scratch/r22, r23)
const R22 = { id: 'repentogon', name: 'REPENTOGON (browser)', version: '1', bytes: 133259, unpacked: 464569, files: 19, parts: 1, workshop: '3127536138' };
const R23 = { id: 'repentogon', name: 'REPENTOGON (browser)', version: '1', bytes: 142815, unpacked: 495880, files: 19, parts: 1, workshop: '3127536138' };
const FF = { id: 'fiendfolio-reloaded', version: '1.8', bytes: 428678807, files: 20814, parts: 0,
  packed: { base: 'pk', index: 'a75ee0b258e94d39ed57.idx', indexBytes: 606770, eagerBytes: 12818450, storedBytes: 428678807 } };

test('round 116: what is "different" is the content the entry names, never its version', () => {
  const layer22 = { id: 'repentogon', name: 'x', source: 'catalogue', cat: entryIdentity(R22) };
  assert.equal(planUpdate(layer22, [R23, FF]).action, 'refresh', 'release 22\'s layer under release 23\'s catalogue: a refresh, though both say version 1');
  assert.equal(planUpdate(layer22, [R22, FF]).action, 'same');
  // one size alone moving is a difference: a one-character edit keeps the unpacked size
  for (const k of ['bytes', 'unpacked', 'files', 'parts']) {
    assert.equal(planUpdate(layer22, [Object.assign({}, R22, { [k]: R22[k] + 1 })]).action, 'refresh', `${k} differs`);
  }
  // a sha256 on both sides decides alone
  const shaRec = { id: 'repentogon', source: 'catalogue', cat: entryIdentity(R22, 'AB'.repeat(32)) };
  assert.equal(shaRec.cat.sha256, 'ab'.repeat(32), 'kept in lower case');
  assert.equal(planUpdate(shaRec, [Object.assign({}, R22, { sha256: 'ab'.repeat(32) })]).action, 'same');
  assert.equal(planUpdate(shaRec, [Object.assign({}, R22, { sha256: 'cd'.repeat(32) })]).action, 'refresh', 'the same sizes, another sha256');
  assert.equal(planUpdate(shaRec, [R22]).action, 'same', 'a catalogue without sha256 is compared by its sizes');
  // a packed mod is its index's name, which is exact; one from before round 116 has it in its record already
  const ffOld = { id: FF.id, name: 'Fiend Folio', packed: { base: 'x', index: FF.packed.index } };
  assert.deepEqual(installedIdentity(ffOld), { id: FF.id, index: FF.packed.index });
  assert.equal(planUpdate(ffOld, [FF]).action, 'same');
  assert.equal(planUpdate(ffOld, [Object.assign({}, FF, { packed: Object.assign({}, FF.packed, { index: 'b'.repeat(20) + '.idx' }) })]).action, 'refresh');
  assert.equal(sameContent({ index: 'a.idx' }, { bytes: 1, unpacked: 1, files: 1, parts: 1 }), false, 'an index is never equal to sizes');
  // an unpacked mod from before round 116 has nothing exact: checked once
  assert.equal(planUpdate({ id: 'repentogon', name: 'x', files: 19, bytes: 464569 }, [R23]).action, 'verify');
  // a mod from the device is never touched, even with a catalogue id; one the catalogue lacks is kept
  assert.equal(planUpdate({ id: 'repentogon', source: 'device' }, [R23]).action, 'device');
  assert.equal(planUpdate({ id: 'gone', source: 'catalogue', cat: { id: 'gone', bytes: 1 } }, [R23]).action, 'absent');
  // installed under another folder name than the catalogue id: matched by the id it was installed from
  assert.equal(planUpdate({ id: 'repentogon-folder', source: 'catalogue', cat: entryIdentity(R22) }, [R23]).action, 'refresh');
  // zip here, packed there: not refreshed (said)
  assert.equal(planUpdate({ id: FF.id, source: 'catalogue', cat: { id: FF.id, bytes: 1, unpacked: 1, files: 1, parts: 1 } }, [FF]).action, 'kind');
  assert.equal(pinnedBase('https://cdn.jsdelivr.net/gh/a/boi-portable@2ae0ecfc56c743b8a421ff63fdd14f97a95666b3/mods'), true);
  assert.equal(pinnedBase('https://cdn.jsdelivr.net/gh/a/boi-portable@main/mods'), false);
});

test('round 116: the layer installed from release 22 becomes release 23\'s; what the player chose stays', async () => {
  const old = await catalogueMod('repentogon', { 'metadata.xml': meta('repentogon', 22), 'main.lua': 'print("layer 22")\n', 'gone.lua': 'x' });
  const neu = await catalogueMod('repentogon', { 'metadata.xml': meta('repentogon', 23), 'main.lua': 'print("layer 23, longer")\n', 'new/part.lua': 'y' });
  const dev = await catalogueMod('mine', { 'metadata.xml': meta('mine', 1), 'main.lua': 'mine' });
  const lay = await installed('repentogon', old, { enabled: false, added: 42 });
  // a mod from the device with a catalogue id, and one the catalogue lists that is the same
  const devRec = { id: 'mine', name: 'Mine', files: 2, bytes: 10, added: 7, enabled: true, source: 'device' };
  const db = fakeDb({
    mods: [['repentogon', lay.rec], ['mine', devRec]],
    files: [...lay.files, ...dev.entries.map((e) => [`mine/${e.name}`, { bytes: e.bytes }])],
    state: [['c:/isaac/mods/repentogon/state.txt', { bytes: enc('the mod wrote this') }]],
  });
  const devFiles = db.filesOf('mine'), state = [...db.data.state.entries()];
  const host = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [neu.entry, Object.assign({}, dev.entry, { name: 'Mine', bytes: 999 })] })],
    ['m/repentogon.0.bin', neu.zip], ['m/mine.0.bin', dev.zip]]));
  const { u, lines } = updaterFor(db, host);
  u.start();
  const w = await u.beforeSeed(5000);
  assert.equal(w.done, true, 'done before the game reads its mods');
  const rec = db.data.mods.get('repentogon');
  assert.deepEqual(db.filesOf('repentogon'), neu.entries.map((e) => [`repentogon/${e.name}`, Buffer.from(e.bytes).toString('hex')]).sort(),
    'its files are release 23\'s, every one, and the one release 23 dropped is gone');
  assert.equal(rec.enabled, false, 'off stays off');
  assert.equal(rec.added, 42, 'it keeps its place (when it was added)');
  assert.equal(rec.id, 'repentogon', 'and its folder');
  assert.deepEqual(rec.cat, entryIdentity(neu.entry, createHash('sha256').update(neu.zip).digest('hex')), 'what is installed now is remembered');
  assert.deepEqual([...db.data.state.entries()], state, 'what the game wrote for the mod is untouched');
  assert.deepEqual(db.filesOf('mine'), devFiles, 'a mod from the device is untouched');
  assert.deepEqual(db.data.mods.get('mine'), devRec);
  assert.ok(!host.asked.some((x) => x.endsWith('m/mine.0.bin')), 'and not even fetched');
  assert.deepEqual(u.note('repentogon'), updateWords({ state: 'now', from: lay.rec.bytes, to: rec.bytes }));
  assert.equal(u.note('repentogon').short, 'UPDATED');
  assert.ok(lines.some((l) => /^\[mods\] repentogon mod: updated from the catalogue, \d+ KB -> \d+ KB \(3 -> 3 files, zip \d+ KB\), \d+ ms; in this start$/.test(l)), lines.join('\n'));
  // the next start: the same, so one request (the catalogue) and nothing written
  const commits = db.commits;
  const again = updaterFor(db, host);
  again.u.start();
  await again.u.beforeSeed(5000);
  assert.equal(again.u.stats().same, 1);
  assert.equal(db.commits, commits, 'nothing written');
  assert.equal(again.u.stats().fetches, 1, 'one request: the catalogue');
});

test('round 116: a failed refresh leaves the old files whole and is tried again at the next start', async () => {
  const old = await catalogueMod('lay', { 'metadata.xml': meta('lay', 1), 'main.lua': 'one' });
  const neu = await catalogueMod('lay', { 'metadata.xml': meta('lay', 2), 'main.lua': 'two two', 'b.lua': 'b' });
  // two parts: the first answers, the second does not
  const half = Math.ceil(neu.zip.length / 2);
  const entry = Object.assign({}, neu.entry, { parts: 2 });
  const lay = await installed('lay', old);
  const db = fakeDb({ mods: [['lay', lay.rec]], files: lay.files });
  const before = { files: db.filesOf('lay'), rec: JSON.stringify(db.data.mods.get('lay')) };
  const files = new Map([['catalogue.json', JSON.stringify({ mods: [entry] })], ['m/lay.0.bin', neu.zip.slice(0, half)]]);
  const host = cdn(files);
  const a = updaterFor(db, host);
  a.u.start();
  await a.u.beforeSeed(5000);
  a.u.afterSeed();
  await a.u.done();
  assert.deepEqual(db.filesOf('lay'), before.files, 'every old file is there');
  assert.equal(JSON.stringify(db.data.mods.get('lay')), before.rec, 'and the record is as it was');
  assert.equal(a.u.stats().failed, 1);
  assert.match(a.u.note('lay').long, /COULD NOT BE FETCHED/);
  assert.ok(a.lines.some((l) => /lay mod: the catalogue has another version but it could not be fetched \(part 2 of 2 answered 404\); the installed files stay/.test(l)), a.lines.join('\n'));
  // a store that refuses the write (out of space): the same
  files.set('m/lay.1.bin', neu.zip.slice(half));
  db.refuse = () => true;
  const b = updaterFor(db, host);
  b.u.start(); await b.u.beforeSeed(5000); b.u.afterSeed(); await b.u.done();
  assert.deepEqual(db.filesOf('lay'), before.files, 'a refused transaction writes nothing');
  assert.equal(b.u.stats().failed, 1);
  // the catalogue down: nothing changes and nothing breaks
  db.refuse = null;
  const downHost = cdn(files, { down: () => true });
  const d = updaterFor(db, downHost);
  d.u.start(); const dw = await d.u.beforeSeed(5000);
  assert.equal(dw.done, true, 'the boot is not held by a catalogue that does not answer');
  assert.equal(d.u.stats().state, 'offline');
  assert.deepEqual(db.filesOf('lay'), before.files);
  // a browser that says it is offline: not even asked
  const offHost = cdn(files);
  const off = updaterFor(db, offHost, { navigator: { onLine: false } });
  off.u.start(); await off.u.beforeSeed(5000);
  assert.equal(off.u.stats().state, 'offline');
  assert.deepEqual(offHost.asked, [], 'no request while the browser says it is offline');
  // a later start, with everything there
  const c = updaterFor(db, host, { navigator: { onLine: true } });
  c.u.start(); await c.u.beforeSeed(5000);
  assert.deepEqual(db.filesOf('lay'), neu.entries.map((e) => [`lay/${e.name}`, Buffer.from(e.bytes).toString('hex')]).sort(), 'updated at the next start');
  assert.equal(c.u.note('lay').short, 'UPDATED');
});

test('round 116: what is not done when the boot reads its mods is written after, for the next start', async () => {
  const old = await catalogueMod('lay', { 'metadata.xml': meta('lay', 1), 'main.lua': 'one' });
  const neu = await catalogueMod('lay', { 'metadata.xml': meta('lay', 2), 'main.lua': 'two two' });
  const lay = await installed('lay', old);
  const db = fakeDb({ mods: [['lay', lay.rec]], files: lay.files });
  const before = db.filesOf('lay');
  const host = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [neu.entry] })], ['m/lay.0.bin', neu.zip]]));
  const release = host.hold('m/lay.0.bin');
  const { u } = updaterFor(db, host);
  u.start();
  const w = await u.beforeSeed(20);
  assert.equal(w.done, false, 'the boot waited its cap and went on');
  assert.ok(w.waitedMs < 1000);
  release();
  await until(() => u.stats().state === 'updating' && host.asked.length === 2, 'the part arrived');
  for (let i = 0; i < 50; i++) await tick();
  assert.deepEqual(db.filesOf('lay'), before, 'nothing is written while the game reads its mods');
  u.afterSeed();
  await u.done();
  assert.notDeepEqual(db.filesOf('lay'), before, 'written once it has read them');
  assert.equal(u.note('lay').short, 'NEW ON RELOAD');
  assert.match(u.note('lay').long, /LOADS AT THE NEXT START$/);
});

test('round 116: a 403 while the game boots does not hold it; the part is asked for again past the CDN\'s minute', async () => {
  const old = await catalogueMod('lay', { 'metadata.xml': meta('lay', 1), 'main.lua': 'one' });
  const neu = await catalogueMod('lay', { 'metadata.xml': meta('lay', 2), 'main.lua': 'two two' });
  const lay = await installed('lay', old);
  const db = fakeDb({ mods: [['lay', lay.rec]], files: lay.files });
  const host = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [neu.entry] })], ['m/lay.0.bin', neu.zip]]),
    { status: (name, nth) => (name === 'm/lay.0.bin' && nth === 1 ? 403 : 0) });
  const slept = [], clock = { t: 1000 };
  const { u } = updaterFor(db, host, { sleep: async (ms) => { slept.push([ms, host.asked.length]); clock.t += ms; }, wait403: 65000, now: () => clock.t });
  u.start();
  const w = await u.beforeSeed(60000);
  assert.equal(w.done, true, 'the boot went on at once');
  assert.deepEqual(slept, [], 'nothing slept before the boot read its mods');
  clock.t += 5000;                                   // the boot took five seconds
  u.afterSeed();
  await u.done();
  assert.deepEqual(slept, [[60000, 2]], 'asked again a minute after the 403, not before');
  assert.deepEqual(host.asked.map((x) => x.split('/').pop()), ['catalogue.json', 'lay.0.bin', 'lay.0.bin']);
  assert.equal(u.note('lay').short, 'NEW ON RELOAD', 'for the next start');
  assert.equal(u.stats().refreshed, 1);
});

test('round 116: nothing from the catalogue installed, nothing fetched; a pinned catalogue comes from the browser cache', async () => {
  const dev = { id: 'mine', name: 'Mine', files: 1, bytes: 1, added: 1, enabled: true, source: 'device' };
  const host = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [] })]]));
  const a = updaterFor(fakeDb({ mods: [['mine', dev]] }), host);
  a.u.start(); await a.u.beforeSeed(5000);
  assert.equal(a.u.stats().state, 'nothing');
  assert.deepEqual(host.asked, [], 'no request at all');
  const b = updaterFor(fakeDb(), host);
  b.u.start(); await b.u.beforeSeed(5000);
  assert.deepEqual(host.asked, [], 'nor with nothing installed');
  // one from the catalogue: one request, cacheable when the base is pinned to a commit
  const one = await catalogueMod('lay', { 'main.lua': 'one' });
  const lay = await installed('lay', one);
  const pinned = 'https://cdn.jsdelivr.net/gh/a/boi-portable@2ae0ecfc56c743b8a421ff63fdd14f97a95666b3/mods';
  const h2 = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [one.entry] })]]));
  const c = updaterFor(fakeDb({ mods: [['lay', lay.rec]], files: lay.files }), h2, { catalogueBase: pinned });
  c.u.start(); await c.u.beforeSeed(5000);
  assert.deepEqual(h2.asked, [`${pinned}/catalogue.json`]);
  assert.equal(h2.inits[0].cache, 'default', 'a pinned catalogue cannot change: the browser\'s cache may answer');
  const d = updaterFor(fakeDb({ mods: [['lay', lay.rec]], files: lay.files }), h2, { catalogueBase: 'https://cdn.jsdelivr.net/gh/a/boi-portable@main/mods' });
  d.u.start(); await d.u.beforeSeed(5000);
  assert.equal(h2.inits[1].cache, 'no-cache', 'a branch can: asked again');
});

test('round 116: a mod installed before this round is checked once; the same files only get remembered', async () => {
  const cm = await catalogueMod('lay', { 'metadata.xml': meta('lay', 1), 'main.lua': 'one' });
  const legacy = { id: 'lay', name: 'lay mod', files: 2, bytes: cm.entry.unpacked, added: 5, enabled: true };
  const db = fakeDb({ mods: [['lay', legacy]], files: cm.entries.map((e) => [`lay/${e.name}`, { bytes: e.bytes }]) });
  const files = db.filesOf('lay');
  const host = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [cm.entry] })], ['m/lay.0.bin', cm.zip]]));
  const { u, lines } = updaterFor(db, host);
  u.start(); await u.beforeSeed(5000);
  const rec = db.data.mods.get('lay');
  assert.equal(rec.source, 'catalogue');
  assert.deepEqual(rec.cat, entryIdentity(cm.entry, createHash('sha256').update(cm.zip).digest('hex')), 'its identity, written once');
  assert.equal(rec.updated, undefined, 'and nothing else: it was not updated');
  assert.deepEqual(db.filesOf('lay'), files);
  assert.equal(u.note('lay'), null, 'nothing to say on its row');
  assert.equal(u.stats().verified, 1);
  assert.ok(lines.some((l) => /lay mod: the same as the catalogue's/.test(l)));
  // and one whose files are not the catalogue's. For the mods named as following the
  // catalogue anyway (the layer, by default): replaced
  const neu = await catalogueMod('lay', { 'metadata.xml': meta('lay', 2), 'main.lua': 'one' });
  const db2 = fakeDb({ mods: [['lay', legacy]], files: cm.entries.map((e) => [`lay/${e.name}`, { bytes: e.bytes }]) });
  const h2 = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [neu.entry] })], ['m/lay.0.bin', neu.zip]]));
  const two = updaterFor(db2, h2, { legacyFollow: ['lay'] });
  two.u.start(); await two.u.beforeSeed(5000);
  assert.equal(db2.data.mods.get('lay').source, 'catalogue');
  assert.equal(two.u.note('lay').short, 'UPDATED');
  assert.ok(db2.filesOf('lay').some(([k, v]) => k === 'lay/metadata.xml' && Buffer.from(v, 'hex').toString().includes('<n>2</n>')));
  // for any other mod it is the player's own zip under an id the catalogue also lists
  // (only the layer's entry ever changed between catalogues): left as it is, and not
  // looked at again
  const db3 = fakeDb({ mods: [['lay', legacy]], files: cm.entries.map((e) => [`lay/${e.name}`, { bytes: e.bytes }]) });
  const before3 = db3.filesOf('lay');
  const h3 = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [neu.entry] })], ['m/lay.0.bin', neu.zip]]));
  const three = updaterFor(db3, h3);
  three.u.start(); await three.u.beforeSeed(5000);
  const rec3 = db3.data.mods.get('lay');
  assert.equal(rec3.source, 'device', 'remembered as the player\'s own');
  assert.equal(rec3.cat, undefined);
  assert.equal(rec3.updated, undefined);
  assert.deepEqual(db3.filesOf('lay'), before3, 'its files are untouched');
  assert.equal(three.u.note('lay'), null);
  assert.equal(three.u.stats().own, 1);
  assert.equal(three.u.stats().refreshed, 0);
  assert.ok(three.lines.some((l) => /lay mod: not the catalogue's copy/.test(l)));
  const again = updaterFor(db3, h3);
  again.u.start(); await again.u.beforeSeed(5000);
  assert.equal(again.u.stats().fetches, 0, 'the next start asks for nothing: no catalogue mod is installed any more');
  assert.deepEqual(db3.filesOf('lay'), before3);
  // the layer itself follows the catalogue with no option given
  const l1 = await catalogueMod('repentogon', { 'metadata.xml': meta('repentogon', 1), 'main.lua': 'one' });
  const l2 = await catalogueMod('repentogon', { 'metadata.xml': meta('repentogon', 2), 'main.lua': 'one' });
  const oldLayer = { id: 'repentogon', name: 'repentogon mod', files: 2, bytes: l1.entry.unpacked, added: 5, enabled: true };
  const db4 = fakeDb({ mods: [['repentogon', oldLayer]], files: l1.entries.map((e) => [`repentogon/${e.name}`, { bytes: e.bytes }]) });
  const h4 = cdn(new Map([['catalogue.json', JSON.stringify({ mods: [l2.entry] })], ['m/repentogon.0.bin', l2.zip]]));
  const four = updaterFor(db4, h4);
  four.u.start(); await four.u.beforeSeed(5000);
  assert.equal(db4.data.mods.get('repentogon').source, 'catalogue');
  assert.equal(four.u.stats().refreshed, 1);
  assert.ok(db4.filesOf('repentogon').some(([k, v]) => k === 'repentogon/metadata.xml' && Buffer.from(v, 'hex').toString().includes('<n>2</n>')));
});

test('round 116: one write, the record as it is then: a toggle meanwhile is kept, a removal is not undone', async () => {
  const db = fakeDb({ mods: [['a', { id: 'a', name: 'A', enabled: true, added: 1, files: 1, bytes: 1 }]], files: [['a/x', { bytes: enc('x') }]] });
  // the player turns it off between the plan and the write
  await new Promise((resolve, reject) => {
    const tx = db.transaction('mods', 'readwrite'); const s = tx.objectStore('mods');
    const r = s.get('a'); r.onsuccess = () => { s.put(Object.assign({}, r.result, { enabled: false }), 'a'); };
    tx.oncomplete = resolve; tx.onabort = reject;
  });
  const out = await replaceMod(db, 'a', (cur) => Object.assign({}, cur, { enabled: true, added: 9, bytes: 2 }), [{ name: 'y', bytes: enc('yy') }]);
  assert.equal(out.enabled, false, 'its flag as the store has it at the write');
  assert.equal(db.data.mods.get('a').added, 1, 'and its place');
  assert.deepEqual(db.filesOf('a'), [['a/y', Buffer.from('yy').toString('hex')]]);
  db.data.mods.delete('a');
  assert.equal(await replaceMod(db, 'a', (cur) => cur, [{ name: 'z', bytes: enc('z') }]), null, 'gone meanwhile: nothing written');
  assert.deepEqual(db.filesOf('a'), [['a/y', Buffer.from('yy').toString('hex')]]);
});

// ---- packed: only the packs that changed are fetched; the old version's go later ----
const sha20 = (b) => createHash('sha256').update(b).digest('hex').slice(0, 20);
function pack(seed) { const b = new Uint8Array(40); b.set([0x49, 0x4d, 0x50, 0x4b, 1, 0, 0, 0]); for (let i = 8; i < 40; i++) b[i] = (seed * 31 + i) & 0xff; return { name: `${sha20(b)}.bin`, bytes: b }; }
const gz = async (o) => new Uint8Array(await new Response(new Blob([JSON.stringify(o)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
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
const KEY = 'https://modpacks.isaac.invalid/';

test('round 116: a packed mod that changed fetches its new index and only the eager packs it lacks, after the boot; its old packs go at the next start', async () => {
  const E1 = pack(1), E2 = pack(2), L1 = pack(3), L2 = pack(4), L3 = pack(5), O1 = pack(6);
  const ixA = await gz({ v: 1, name: 'Big', files: 3, bytes: 300, packs: [[E1.name, 40, 'eager'], [L1.name, 40, 'lazy'], [L2.name, 40, 'lazy']], f: [], alias: [] });
  const ixB = await gz({ v: 1, name: 'Big', files: 4, bytes: 400, packs: [[E1.name, 40, 'eager'], [E2.name, 40, 'eager'], [L1.name, 40, 'lazy'], [L3.name, 40, 'lazy']], f: [], alias: [] });
  const ixO = await gz({ v: 1, name: 'Other', files: 1, bytes: 1, packs: [[O1.name, 40, 'lazy'], [L2.name, 40, 'lazy']], f: [], alias: [] });
  const an = `${sha20(ixA)}.idx`, bn = `${sha20(ixB)}.idx`, on = `${sha20(ixO)}.idx`;
  const caches = cacheApi(), cache = await caches.open(PACK_CACHE);
  for (const [n, v] of [[an, ixA], [E1.name, E1.bytes], [L1.name, L1.bytes], [L2.name, L2.bytes], [on, ixO], [O1.name, O1.bytes]]) await cache.put(KEY + n, new Response(v));
  const byName = new Map([[an, ixA], [bn, ixB], [on, ixO], ...[E1, E2, L1, L2, L3, O1].map((p) => [p.name, p.bytes])]);
  const pkBase = `${BASE}/pk`;
  const entry = { id: 'big', name: 'Big', version: '2', bytes: 160, files: 4, parts: 0, packed: { base: 'pk', index: bn, indexBytes: ixB.length, eagerBytes: 80, storedBytes: 160 } };
  const other = { id: 'other', name: 'Other', bytes: 80, files: 1, parts: 0, packed: { base: 'pk', index: on, indexBytes: ixO.length, eagerBytes: 0, storedBytes: 80 } };
  // installed before round 116 (no source, no cat): its index says what it is
  const rec = { id: 'big', name: 'Big', files: 3, bytes: 300, added: 3, enabled: false, version: '1', packed: { base: pkBase, index: an, indexBytes: ixA.length, eagerBytes: 40, storedBytes: 120 } };
  const recO = { id: 'other', name: 'Other', files: 1, bytes: 1, added: 4, enabled: true, source: 'catalogue', cat: { id: 'other', index: on }, packed: { base: pkBase, index: on, indexBytes: ixO.length, eagerBytes: 0, storedBytes: 80 } };
  const db = fakeDb({ mods: [['big', rec], ['other', recO]] });
  const asked = [];
  const fetch = async (url) => {
    asked.push(url.split('/').pop());
    if (url.endsWith('/catalogue.json')) return new Response(JSON.stringify({ mods: [entry, other] }));
    const b = byName.get(url.split('/').pop());
    return b ? new Response(b.slice()) : new Response('nope', { status: 404 });
  };
  const store = createPackStore({ fetch, caches, retries: 0, sleep: async () => {} });
  const { u, lines } = updaterFor(db, { fetch }, { store });
  u.start();
  const w = await u.beforeSeed(5000);
  assert.equal(w.done, true, 'the boot does not wait for a packed mod');
  assert.deepEqual(asked, ['catalogue.json'], 'nothing of it is fetched before the game has read its mods');
  assert.equal(db.data.mods.get('big').packed.index, an, 'and the game reads the version it had');
  u.afterSeed();
  await u.done();
  assert.deepEqual(asked, ['catalogue.json', bn, E2.name], 'the new index and the one eager pack not kept: E1 is reused, the lazy L3 is for the background download');
  const now = db.data.mods.get('big');
  assert.equal(now.packed.index, bn);
  assert.equal(now.packed.base, pkBase);
  assert.equal(now.packed.prev, an, 'the old index is remembered for its packs');
  assert.equal(now.enabled, false, 'off stays off');
  assert.equal(now.added, 3);
  assert.deepEqual(now.cat, { id: 'big', index: bn });
  assert.equal(now.files, 4);
  assert.equal(u.note('big').short, 'NEW ON RELOAD');
  assert.ok(lines.some((l) => l.includes(`index ${an} -> ${bn}; 2 of 4 packs are new`)), lines.join('\n'));
  assert.ok(await store.has(an) && await store.has(L2.name), 'the old packs stay through this visit: the game may read them');
  // the next start, before the game reads: the packs only the old index named go
  const asked2 = asked.length;
  const next = updaterFor(db, { fetch }, { store });
  next.u.start(); await next.u.beforeSeed(5000);
  assert.equal(await store.has(an), false, 'the old index');
  assert.equal(await store.has(L2.name), true, 'a pack the other mod still names stays');
  assert.equal(await store.has(E1.name) && await store.has(L1.name) && await store.has(E2.name), true, 'every pack the new index names stays');
  assert.equal(db.data.mods.get('big').packed.prev, undefined, 'done once');
  assert.equal(next.u.stats().droppedPacks, 1);
  assert.deepEqual(asked.slice(asked2), ['catalogue.json'], 'and nothing was fetched for it');
  assert.equal(next.u.stats().same, 2);
  // stalePacks with no other mod naming L2: it goes too
  assert.deepEqual((await stalePacks(store, on, pkBase, [now])).sort(), [on, O1.name, L2.name].sort());
});

test('round 116: the page checks before the mods are read, says it, and ?modupdate=0 turns it off', () => {
  const p = src('play.mjs'), b = src('boot_web.mjs'), m = src('mods.mjs');
  assert.ok(p.includes("const modUpdates = params.get('modupdate') === '0' || params.get('mods') === '0' || !modCatalogue ? null"), '?modupdate=0 (and ?mods=0, and no catalogue) leave it off');
  assert.ok(p.includes('modUpdates.start();') && p.indexOf('modUpdates.start();') < p.indexOf("import('./boot_web.mjs')"), 'started before the boot');
  assert.ok(p.includes('updates: modUpdates,'), 'the menus are told');
  const seedAt = b.indexOf("await stageOk('seed mods'"), waitAt = b.indexOf('await hooks.modUpdates.beforeSeed('), seedCall = b.indexOf('const r = await seedMods(modDb, seed, log');
  assert.ok(seedAt > 0 && waitAt > seedAt && seedCall > waitAt, 'the boot waits for it just before it seeds the mods');
  const regAt = b.indexOf("await stageOk('register packed mods'"), afterAt = b.indexOf('if (hooks.modUpdates) hooks.modUpdates.afterSeed();');
  assert.ok(afterAt > regAt, 'and lets the rest write once the packed mods are registered too');
  // the install path remembers where a mod came from
  assert.ok(m.includes("const from = origin || { source: 'device' };"), 'an import from the device says so');
  assert.ok(m.includes("origin = { source: 'catalogue', cat };") && m.indexOf("origin = { source: 'catalogue', cat };") < m.indexOf('await install(entries, e.name);'), 'one from the catalogue says what it is');
  assert.ok(m.includes("source: 'catalogue', cat: entryIdentity(entry),"), 'and so does a packed one');
  assert.ok(m.includes('rowNote: have.has(m.id) ? installedNote(m) : null,'), 'the browser\'s row shows an update');
});
