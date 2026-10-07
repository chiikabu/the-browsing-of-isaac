// recomp-portable.test.js -- the two portable shapes (round 70).
//
// The shipping page reads its bytes from a server. A portable build gives it a
// provider instead: `window.isaacPortable`, set before the module runs, which
// answers a window either with a URL (the chunked build, so the reader Worker
// keeps fetching in parallel) or with bytes (the single-file build, which has
// them inline). These pin the seam and the chunk arithmetic -- the parts that
// are quiet when they break, because the page falls back to a fetch that a
// static host answers with 404 and the engine walks off the end.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const play = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
const bootWeb = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
const portable = readFileSync(join(root, 'scripts', 'recomp', 'assets', 'portable.py'), 'utf8');

// Run the emitted provider unchanged. The override also exercises a repacked
// page's extracted loader without making the suite depend on scratch files.
const providerSource = process.env.ISAAC_PORTABLE_LOADER
  ? readFileSync(process.env.ISAAC_PORTABLE_LOADER, 'utf8')
  : /PROVIDER_JS = r"""\r?\n([\s\S]*?)\r?\n"""/.exec(portable)[1];
const WIN = 1048576, PIECE = 2 * WIN;
const turn = () => new Promise(setImmediate);

function deferredFetch() {
  const requests = [];
  return {
    requests,
    fetch(url, init) {
      return new Promise((resolve, reject) => {
        const range = init?.headers?.Range || null;
        requests.push({
          url, range, settled: false,
          reply(bytes, { status = range ? 206 : 200, total } = {}) {
            assert.equal(this.settled, false, `already answered ${url} ${range}`);
            this.settled = true;
            resolve({
              ok: status >= 200 && status < 300, status,
              headers: new Headers(total === undefined ? {} : {
                'content-range': `bytes ${range?.slice(6) || '0-0'}/${total}`,
              }),
              arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
            });
          },
          fail(error) { this.settled = true; reject(error); },
        });
      });
    },
  };
}

function deferredPortable(data, search = '') {
  const network = deferredFetch();
  const window = { __isaacPortableData: data };
  new Function('window', 'fetch', 'location', 'setTimeout', providerSource)(
    window, network.fetch, { href: 'https://game.test/index.html' + search, search }, () => 0,
  );
  return { ...network, provider: window.isaacPortable };
}

function deferredReaderWorker() {
  // Cook the actual template, as the page and recomp-web.test.js do.
  const source = new Function('return `' + /const READER_WORKER = `([\s\S]*?)\r?\n`;/.exec(bootWeb)[1] + '`')();
  const network = deferredFetch(), replies = new Map();
  let nextWant = 1;
  const worker = {
    fetch: network.fetch, Blob, Response, DecompressionStream, Uint8Array, ArrayBuffer, setTimeout,
    postMessage(message) { replies.get(message.want)(message); },
  };
  new Script(source).runInNewContext(worker);
  return {
    ...network,
    read(url, len) {
      const want = nextWant++;
      return new Promise((resolve) => {
        replies.set(want, resolve);
        worker.onmessage({ data: { want, key: 'window' + want, url, len } });
      });
    },
  };
}

function chunkData(engineCount = 4, archiveCount = 4) {
  const files = {
    'boot.wasm': { s: 0, at: 0, size: Math.min(3, engineCount) * PIECE },
    'isaac.segs.bin': { s: 0, at: 3 * PIECE, size: PIECE },
    'resources/packed/archive.a': { s: 1, at: 0, size: archiveCount * PIECE },
  };
  for (let i = 0; i < engineCount; i++) files['engine' + i] = { s: 0, at: i * PIECE, size: PIECE };
  return {
    base: 'https://assets.test/release/c', workerWindows: true, files,
    streams: [
      { tag: 'a', size: PIECE, gz: true, n: engineCount, bytes: engineCount * PIECE,
        v: Array.from({ length: engineCount }, (_, i) => 'engine-' + i) },
      { tag: 'b', size: PIECE, gz: false, n: archiveCount, bytes: archiveCount * PIECE,
        v: Array.from({ length: archiveCount }, (_, i) => 'archive-' + i) },
    ],
  };
}

function fileName(request) {
  return new URL(request.url, 'https://game.test/').pathname.split('/').pop();
}

function pending(network, file, range) {
  const request = network.requests.find((r) => !r.settled && fileName(r) === file && r.range === range);
  assert.ok(request, `${file} ${range} is pending`);
  return request;
}

function answerRange(request, bytes) {
  const [from, to] = request.range.slice(6).split('-').map(Number);
  request.reply(bytes.subarray(from, to + 1), { total: bytes.length });
}

async function answerProbes(network, archives) {
  for (const range of ['bytes=0-1023', 'bytes=512-1535']) {
    for (const request of network.requests.filter((r) => !r.settled && r.range === range)) {
      answerRange(request, archives[Number(fileName(request).slice(1, -4))]);
    }
    await turn();
  }
}

test('portable startup overlaps required chunks and four probe pairs without waiting for the image', { timeout: 5000 }, async () => {
  const h = deferredPortable(chunkData());
  const engine = Array.from({ length: 4 }, (_, i) => Buffer.alloc(PIECE, i + 1));
  const archives = Array.from({ length: 4 }, (_, i) => Buffer.alloc(PIECE, i + 20));
  assert.deepEqual(h.requests.filter((r) => !r.range).map(fileName), ['a0.bin', 'a1.bin', 'a2.bin', 'a3.bin']);
  assert.deepEqual(h.requests.filter((r) => r.range).map(fileName), ['b0.bin', 'b1.bin', 'b2.bin', 'b3.bin']);
  assert.ok(h.requests.filter((r) => r.range).every((r) => r.range === 'bytes=0-1023'));
  const wasm = h.provider.bytesFor('boot.wasm', 0, 0);
  assert.equal(h.requests.filter((r) => !r.range).length, 4, 'consumer shares the four engine requests');
  assert.equal(h.provider.urlFor('boot.wasm', 0, 100), null, 'whole compressed chunks stay on the bytes path');

  // Only this pair may advance; the other three first responses are pending.
  answerRange(pending(h, 'b2.bin', 'bytes=0-1023'), archives[2]);
  await turn();
  assert.deepEqual(h.requests.filter((r) => r.range === 'bytes=512-1535').map(fileName), ['b2.bin']);
  assert.equal(h.requests.filter((r) => !r.settled && r.range).length, 4);
  let ready = false;
  h.provider.ready.then(() => { ready = true; });
  await answerProbes(h, archives);
  assert.equal(ready, true, 'range readiness does not await the engine preload');
  assert.equal(await h.provider.ready, true);
  assert.equal(h.requests.filter((r) => !r.settled && !r.range).length, 4);

  for (let i = 0; i < 3; i++) pending(h, `a${i}.bin`, null).reply(gzipSync(engine[i]));
  assert.deepEqual(Buffer.from(await wasm), Buffer.concat(engine.slice(0, 3)));
  const image = h.provider.bytesFor('isaac.segs.bin', 0, 0);
  pending(h, 'a3.bin', null).reply(gzipSync(engine[3]));
  assert.deepEqual(Buffer.from(await image), engine[3]);
  assert.deepEqual(h.requests.filter((r) => !r.range).map(fileName), ['a0.bin', 'a1.bin', 'a2.bin', 'a3.bin'],
    'no duplicate engine fetches or speculative whole archives');
});

test('portable preload stays at four and failed shared requests can be retried', { timeout: 5000 }, async () => {
  const data = chunkData(6, 1);
  data.streams[0].z = '000000';
  const h = deferredPortable(data);
  const whole = () => h.requests.filter((r) => !r.range && !r.settled);
  assert.deepEqual(whole().map(fileName), ['a0.bin', 'a1.bin', 'a2.bin', 'a3.bin']);
  const failedRead = assert.rejects(h.provider.bytesFor('engine0', 31, 97), /HTTP 503/);
  pending(h, 'a0.bin', null).reply(Buffer.alloc(0), { status: 503 });
  await failedRead;
  await turn();
  assert.deepEqual(whole().map(fileName), ['a1.bin', 'a2.bin', 'a3.bin', 'a4.bin']);
  pending(h, 'a1.bin', null).reply(Buffer.alloc(PIECE, 2));
  await turn();
  assert.deepEqual(whole().map(fileName), ['a2.bin', 'a3.bin', 'a4.bin', 'a5.bin']);
  const lastRead = h.provider.bytesFor('engine5', 31, 97);
  for (let i = 2; i < 6; i++) pending(h, `a${i}.bin`, null).reply(Buffer.alloc(PIECE, i + 1));
  assert.deepEqual(Buffer.from(await lastRead), Buffer.alloc(97, 6));
  await answerProbes(h, [Buffer.alloc(PIECE, 20)]);
  await h.provider.ready;

  const retry = h.provider.bytesFor('engine0', 31, 97);
  pending(h, 'a0.bin', null).reply(Buffer.alloc(PIECE, 1));
  assert.deepEqual(Buffer.from(await retry), Buffer.alloc(97, 1));
  assert.deepEqual(Buffer.from(await h.provider.bytesFor('engine0', 401, 37)), Buffer.alloc(37, 1));
  assert.equal(h.requests.filter((r) => fileName(r) === 'a0.bin').length, 2, 'retry then cache, not a poisoned flight');
  assert.equal(h.requests.filter((r) => fileName(r).startsWith('b') && !r.range).length, 0);
});

test('portable parallel probes keep every failure and report the first chunk deterministically', { timeout: 5000 }, async () => {
  const h = deferredPortable(chunkData(0, 4));
  const archives = Array.from({ length: 4 }, (_, i) => Buffer.alloc(PIECE, i + 20));
  // Chunk 2 fails first in time; chunk 0 fails later in its overlap.
  pending(h, 'b2.bin', 'bytes=0-1023').reply(Buffer.alloc(1020), { total: PIECE });
  for (const i of [0, 1, 3]) answerRange(pending(h, `b${i}.bin`, 'bytes=0-1023'), archives[i]);
  await turn();
  assert.equal(h.requests.filter((r) => fileName(r) === 'b2.bin').length, 1, 'a failed first response has no second probe');
  assert.equal(h.requests.filter((r) => !r.range).length, 0, 'no whole archive before the range decision');
  pending(h, 'b0.bin', 'bytes=512-1535').reply(Buffer.alloc(1024, 99), { total: PIECE });
  for (const i of [1, 3]) answerRange(pending(h, `b${i}.bin`, 'bytes=512-1535'), archives[i]);
  await turn();
  assert.equal(h.provider.ranges(), false, 'later successful pairs cannot re-enable ranges');
  assert.match(h.provider.rangesWhy(), /^chunk 0:/, 'failure selection follows chunk order, not completion order');
  assert.equal(h.provider.urlFor('resources/packed/archive.a', 41, 17), null);
  const read = h.provider.bytesFor('resources/packed/archive.a', PIECE - 7, 19);
  for (let i = 0; i < 4; i++) pending(h, `b${i}.bin`, null).reply(archives[i]);
  assert.equal(await h.provider.ready, false);
  assert.deepEqual(Buffer.from(await read), Buffer.concat([archives[0].subarray(PIECE - 7), archives[1].subarray(0, 12)]));
  assert.deepEqual(Buffer.from(await h.provider.bytesFor('resources/packed/archive.a', 2 * PIECE + 123, 31)), archives[2].subarray(123, 154));
  assert.deepEqual(h.requests.filter((r) => !r.range).map(fileName), ['b0.bin', 'b1.bin', 'b2.bin', 'b3.bin']);
});

test('portable range guards preserve whole-chunk delivery', { timeout: 5000 }, async (t) => {
  for (const mode of ['total', 'overlap-length', 'network', 'cdn', 'noranges']) {
    await t.test(mode, async () => {
      const data = chunkData(0, 1);
      if (mode === 'cdn') data.base = 'https://cdn.jsdelivr.net/package/c';
      const h = deferredPortable(data, mode === 'noranges' ? '?noranges=1' : '');
      const bytes = Buffer.alloc(PIECE, 23);
      if (mode === 'total') {
        pending(h, 'b0.bin', 'bytes=0-1023').reply(bytes.subarray(0, 1024), { total: PIECE + 37 });
      } else if (mode === 'overlap-length') {
        answerRange(pending(h, 'b0.bin', 'bytes=0-1023'), bytes);
        await turn();
        pending(h, 'b0.bin', 'bytes=512-1535').reply(bytes.subarray(512, 1531), { total: PIECE });
      } else if (mode === 'network') {
        pending(h, 'b0.bin', 'bytes=0-1023').fail(new Error('probe disconnected'));
      } else {
        assert.equal(h.requests.filter((r) => r.range).length, 0, 'known untrusted and opted-out origins are not probed');
      }
      await turn();
      pending(h, 'b0.bin', null).reply(bytes);
      assert.equal(await h.provider.ready, false);
      assert.equal(h.provider.urlFor('resources/packed/archive.a', 13, 71), null);
      assert.deepEqual(Buffer.from(await h.provider.bytesFor('resources/packed/archive.a', 13, 71)), bytes.subarray(13, 84));
      assert.equal(h.requests.filter((r) => !r.range).length, 1);
    });
  }
});

test('portable runtime range rejection never caches a partial response as a whole chunk', { timeout: 5000 }, async (t) => {
  for (const status of [200, 206]) {
    await t.test(String(status), async () => {
      const h = deferredPortable(chunkData(0, 1));
      const bytes = Buffer.alloc(PIECE, 29);
      bytes.fill(43, 200, 400);
      await answerProbes(h, [bytes]);
      assert.equal(await h.provider.ready, true);
      const first = h.provider.bytesFor('resources/packed/archive.a', 213, 71);
      pending(h, 'b0.bin', 'bytes=213-283').reply(
        status === 200 ? bytes : Buffer.alloc(71, 99), { status, total: PIECE + 37 },
      );
      await turn();
      if (status === 206) pending(h, 'b0.bin', null).reply(bytes);
      assert.deepEqual(Buffer.from(await first), bytes.subarray(213, 284));
      assert.equal(h.provider.ranges(), false);
      assert.deepEqual(Buffer.from(await h.provider.bytesFor('resources/packed/archive.a', 397, 19)), bytes.subarray(397, 416));
      assert.equal(h.requests.filter((r) => !r.range).length, status === 200 ? 0 : 1);
    });
  }
});

test('portable raw ranges isolate concurrent cache entries and deliver matching direct and worker bytes', { timeout: 5000 }, async () => {
  const data = chunkData(0, 1);
  // Unversioned hosts still need separate immutable byte-range identities.
  delete data.streams[1].v;
  const bytes = Buffer.allocUnsafe(PIECE);
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 37 + (i >>> 8)) & 255;
  const h = deferredPortable(data);
  await answerProbes(h, [bytes]);
  assert.equal(await h.provider.ready, true);
  const rel = 'resources/packed/archive.a';
  const cuts = [{ off: 73, len: 257 }, { off: 173, len: 257 }];
  const urls = cuts.map(({ off, len }) => h.provider.urlFor(rel, off, len));
  const expected = cuts.map(({ off, len }) => bytes.subarray(off, off + len));
  const direct = cuts.map(({ off, len }) => h.provider.bytesFor(rel, off, len));
  const directRequests = h.requests.filter((r) => !r.settled);
  assert.notEqual(directRequests[0].url, directRequests[1].url,
    'overlapping raw ranges cannot share one HTTP cache entry');
  assert.deepEqual(directRequests.map((r) => r.url), urls.map((url) => url.split('#')[0]));
  assert.deepEqual(urls.map((url) => new URL(url).searchParams.get('w')), ['73-329', '173-429']);
  const network = deferredReaderWorker();
  const messages = urls.map((url, i) => network.read(url, cuts[i].len));
  assert.deepEqual(network.requests.map((r) => r.url), directRequests.map((r) => r.url));
  assert.deepEqual(network.requests.map((r) => r.range), directRequests.map((r) => r.range));
  // Finish out of order to expose accidental reuse of either range's bytes.
  for (const requests of [directRequests, network.requests]) {
    for (const request of [...requests].reverse()) answerRange(request, bytes);
  }
  const delivered = await Promise.all(direct);
  const workerMessages = await Promise.all(messages);
  for (let i = 0; i < cuts.length; i++) {
    assert.deepEqual(Buffer.from(delivered[i]), expected[i]);
    assert.ok(workerMessages[i].buf instanceof ArrayBuffer);
    assert.deepEqual(Buffer.from(workerMessages[i].buf), expected[i]);
  }
  assert.equal(h.requests.filter((r) => !r.range).length, 0);
});

test('portable compressed windows share stable direct and worker cache identities and exact bytes', { timeout: 5000 }, async () => {
  const data = chunkData(0, 1);
  const raw = Buffer.allocUnsafe(WIN);
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 37 + (i >>> 8)) & 255;
  const packed = Buffer.alloc(WIN, 61), zipped = gzipSync(packed);
  const stored = Buffer.concat([zipped, raw]);
  Object.assign(data.streams[1], {
    base: 'https://archives.test/stable/c', win: WIN, wl: [zipped.length, raw.length], wz: '10',
  });
  const h = deferredPortable(data);
  await answerProbes(h, [stored]);
  assert.equal(await h.provider.ready, true);
  const rel = 'resources/packed/archive.a';
  const cuts = [{ off: 97, len: 2048 }, { off: WIN + 173, len: 3072 }];
  const urls = cuts.map(({ off, len }) => h.provider.urlFor(rel, off, len));
  const expected = [packed.subarray(97, 97 + 2048), raw.subarray(173, 173 + 3072)];
  assert.equal(new URL(urls[0]).origin, 'https://archives.test', 'per-stream base stays pinned');
  assert.equal(new URL(urls[0]).searchParams.get('v'), 'archive-0');
  assert.notEqual(new URL(urls[0]).searchParams.get('w'), new URL(urls[1]).searchParams.get('w'),
    'simultaneous stored windows cannot collide in the HTTP cache');
  assert.equal(h.provider.urlFor(rel, 98, 1024).split('#')[0], urls[0].split('#')[0],
    'overlapping slices of one immutable window reuse its cache identity');
  assert.equal(h.provider.urlFor(rel, WIN - 1, 2), null, 'a cross-window read needs the bytes path');
  const direct = cuts.map(({ off, len }) => h.provider.bytesFor(rel, off, len));
  const directRequests = h.requests.filter((r) => !r.settled);
  assert.deepEqual(directRequests.map((r) => r.url), urls.map((url) => url.split('#')[0]));
  for (const request of directRequests) answerRange(request, stored);
  const directBytes = await Promise.all(direct);
  for (let i = 0; i < cuts.length; i++) assert.deepEqual(Buffer.from(directBytes[i]), expected[i]);

  // The actual worker must return transferable buffers for raw windows too.
  const network = deferredReaderWorker();
  const messages = urls.map((url, i) => network.read(url, cuts[i].len));
  assert.deepEqual(network.requests.map((r) => r.url), directRequests.map((r) => r.url));
  assert.deepEqual(network.requests.map((r) => r.range), directRequests.map((r) => r.range));
  for (const request of network.requests) answerRange(request, stored);
  for (const [i, message] of (await Promise.all(messages)).entries()) {
    assert.ok(message.buf instanceof ArrayBuffer, 'the worker sends the consumer a transferable buffer');
    assert.deepEqual(Buffer.from(message.buf), expected[i]);
  }
  assert.equal(h.requests.filter((r) => !r.range).length, 0, 'window reads never preload whole archives');
});

test('portable offline reads span inline chunks without network activity', async () => {
  const h = deferredPortable({
    base: null,
    streams: [{ tag: 'a', first: 0, size: 4, gz: false, n: 2 }],
    blobs: [Buffer.from([10, 11, 12, 13]).toString('base64'), Buffer.from([14, 15, 16, 17]).toString('base64')],
    files: { asset: { s: 0, at: 0, size: 8 } },
  });
  await h.provider.ready;
  assert.equal(h.provider.urlFor, null);
  assert.deepEqual(Buffer.from(await h.provider.bytesFor('asset', 3, 5)), Buffer.from([13, 14, 15, 16, 17]));
  assert.equal(h.requests.length, 0);
});

test('the page takes a provider, and falls back to the server without one', () => {
  assert.match(play, /const portable = \(typeof window !== 'undefined' && window\.isaacPortable\) \|\| null;/);
  // every path that reads bytes asks the provider first
  assert.match(play, /if \(portable\) manifest = portable\.manifest \|\| null;\s*\n\s*else try \{/,
    'the manifest comes from the provider, or from dist.json as before');
  assert.match(play, /if \(portable\) \{\s*\n\s*index = portable\.index \|\| \[\];/, 'so does the instance index');
  assert.match(play, /if \(len\) return \(portable\.urlFor && portable\.urlFor\(rel, off, len\)\) \|\| null;/,
    'a window may be answered with a URL, and a provider that cannot serve it says so');
  assert.match(play, /const bytes = await portable\.bytesFor\(q\.rel, q\.off, q\.len\);/, 'or with bytes');
  assert.match(play, /const bytes = await portable\.bytesFor\('boot\.wasm', 0, 0\);/, 'the module too');
  // and with no provider nothing about the served dist changes
  assert.ok(play.includes("await fetch(rewrite('/boot.wasm'))"), 'the served path still streams the module');
  assert.ok(play.includes('WebAssembly.instantiateStreaming(res, info)'), "round 40's code cache is still used when there is a server");
});

test('a build with no URLs does not start the reader Worker', () => {
  // the Worker overlaps the network with the engine's work; inline, there is no
  // network, and every URL it was given would fail to resolve
  assert.match(play, /hooks\.noReader = !!\(portable && !portable\.urlFor\);/);
  assert.match(bootWeb, /function startReader\(\) \{[\s\S]{0,400}?if \(hooks\.noReader\) return;/);
});


test('round 83: one failed fetch does not end the run', () => {
  // `lazy pread FAILED ... the reader had no bytes` on a window the host answered
  // correctly the moment it was asked again: a blip, and the Worker's answer to
  // any failure was to hand the engine nothing, which returns -1 and traps.
  assert.match(bootWeb, /for \(let a = 0; a < 3; a\+\+\) \{/, 'three tries');
  assert.match(bootWeb, /await new Promise\(\(res\) => setTimeout\(res, 120 \* a \* a\)\);/, 'with a backoff');
  assert.match(bootWeb, /const r = await fetch\(url\);\s*\n\s*if \(!r\.ok\) throw new Error\('whole chunk: HTTP ' \+ r\.status\);/,
    'and then the whole chunk, which needs no Range');
  // async since round 89: a whole-chunk window is gunzipped here before the
  // slice is cut, and DecompressionStream is a stream
  assert.match(bootWeb, /tries\(\)\.then\(async \(buf\) => \{/);
});

test('round 78: a host whose ranges lie does not start the reader Worker', () => {
  // the Worker is what sends Range; once the probe has said no, every window
  // is a whole GET through preadBytes
  assert.match(play, /if \(portable\.ranges && !portable\.ranges\(\)\) \{\s*\n\s*hooks\.noReader = true;/);
});


test('the provider is keyed by the engine\'s own name for a file', () => {
  // play.mjs strips `instance/` off a pipeline URL before it asks; a plan that
  // kept the prefix missed every lookup and fell through to a 404
  assert.match(play, /rel: inInstance \? rel\.slice\('instance\/'\.length\) : rel,/);
  assert.match(portable, /out\.append\(\{"rel": e\["p"\], "path": p, "size": os\.path\.getsize\(p\),/);
  assert.match(portable, /"dist": "instance\/" \+ e\["p"\], "instance": e\["p"\]\}\)/);
});

test('the single-file build inlines the payload in pieces, not one string', () => {
  // a JavaScript string tops out near 512 MB and the payload is larger, so the
  // chunks are separate literals and decoded on demand
  assert.match(portable, /window\.__isaacPortableData\.blobs = \[\];<\/script>/);
  assert.match(portable, /SCRIPT_BYTES = 48 << 20/, 'one script holds 48 MB of base64: V8 stops compiling near 512 MB, silently');
  assert.match(portable, /if state\["budget"\] >= SCRIPT_BYTES:/, 'the pieces are grouped into scripts by that budget');
  assert.match(portable, /typeof Uint8Array\.fromBase64 === 'function'/, 'the native decoder when the browser has it');
  assert.match(portable, /if \(cache\.size > 24\) cache\.delete\(cache\.keys\(\)\.next\(\)\.value\);/, 'decoded chunks are dropped again');
  // the page's modules import each other by relative path: inline they are blobs,
  // whose imports do not resolve against the page
  assert.ok(portable.includes(String.raw`var text = src[name].replace(/(["'])\.\/([A-Za-z0-9_.-]+\.mjs)\1/g,`),
    'a blob URL resolves no relative import, so each module\'s imports are rewritten to the map first');
});

test('the inline loader builds each module after everything it imports', () => {
  // a blob URL resolves no relative import, so each source is rewritten to import
  // from the map of blobs built so far. A module built before one it imports gets
  // './dep.mjs' left in it, which resolves against nothing and fails at load.
  const web = join(root, 'scripts', 'recomp', 'web');
  const order = /var order = \[([^\]]+)\];/.exec(portable)[1].split(',').map((s) => s.trim().replace(/'/g, ''));
  const at = new Map(order.map((n, i) => [n, i]));
  for (const name of order) {
    if (name === 'boot.mjs') continue;                    // the build output, not in this tree
    const src = readFileSync(join(web, name), 'utf8');
    for (const m of src.matchAll(/from '\.\/([A-Za-z0-9_.-]+\.mjs)'/g)) {
      const dep = m[1];
      assert.ok(at.has(dep), `${name} imports ${dep}, which the loader never builds`);
      assert.ok(at.get(dep) < at.get(name), `${name} is built before ${dep}, which it imports`);
    }
  }
  // and the list the payload carries is the list the loader builds
  const modules = /MODULES = \(([^)]+)\)/.exec(portable)[1].split(',').map((s) => s.trim().replace(/"/g, ''));
  assert.deepEqual(new Set(modules), new Set(order), 'every inlined module is built, and nothing else is');
});

// ---- round 77: the payload stops announcing what it is -----------------------
const python = ['python3', 'python'].find((p) => {
  try { return spawnSync(p, ['-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8' }).stdout.trim() === '3'; }
  catch { return false; }
});
const runPy = (code) => {
  const r = spawnSync(python, ['-c', code], { encoding: 'utf8', cwd: root });
  if (r.status !== 0) throw new Error(r.stderr || 'python failed');
  return r.stdout.trim();
};

test('round 77: the keystream is reversible from any offset', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  // a window is fetched as a byte range and put back where it lands, so the
  // stream has to be seekable: unscrambling bytes [k, k+n) needs only k
  const out = runPy([
    'import sys; sys.path.insert(0, "scripts/recomp/assets"); import portable as P',
    'key = P.keystream_key(b"pin")',
    'data = bytes((i * 37 + 11) & 0xff for i in range(5000))',
    'whole = P.scramble(data, 0, key)',
    'print(whole != data)',
    // any slice unscrambles on its own, from its own offset
    'print(all(P.scramble(whole[a:b], a, key) == data[a:b] for a, b in ((0, 100), (256, 300), (999, 4096), (4096, 5000))))',
    // and the key changes the bytes
    'print(P.scramble(data, 0, P.keystream_key(b"other")) != whole)',
    // no key, no change
    'print(P.scramble(data, 0, b"") == data)',
  ].join('\n'));
  assert.deepEqual(out.split(/\r?\n/), ['True', 'True', 'True', 'True']);
});

test('round 77: the minifier walks the source rather than pattern-matching it', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  // the three things a regex-based stripper gets wrong: `//` inside a string, a
  // regular expression that looks like division, and a template literal that may
  // contain any of it
  const out = runPy([
    'import sys, json; sys.path.insert(0, "scripts/recomp/assets"); import portable as P',
    'src = open("scripts/recomp/web/zip.mjs", encoding="utf-8").read()',
    'm = P.minify_js(src)',
    'print(len(m) < len(src))',
    'print("//" not in m.split("export")[0])',
    'cases = ["const u = \'https://x/y\';", "const r = /a\\\\/b/g;", "const t = `a ${x} // b`;", "const d = a / b; // gone"]',
    'print(json.dumps([P.minify_js(c) for c in cases]))',
  ].join('\n')).split(/\r?\n/);
  assert.equal(out[0], 'True', 'it does shrink the source');
  assert.equal(out[1], 'True', 'and the comments are gone');
  const kept = JSON.parse(out[2]);
  assert.ok(kept[0].includes("'https://x/y'"), 'a URL inside a string is not a comment');
  assert.ok(kept[1].includes('/a\\/b/g'), 'a regular expression survives');
  assert.ok(kept[2].includes('`a ${x} // b`'), 'a template literal is passed through whole');
  assert.ok(kept[3].includes('a/b') && !kept[3].includes('gone'), 'division is division, and the comment goes');
});

test('round 77: both sides of the seam agree what the keystream is called', () => {
  // the job messages already carry `key` -- the cache key of the window wanted --
  // so a handler that greeted every one of those as a new keystream answered no
  // reads at all, and the game stopped at its first frame
  const b = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(b.includes('if (d.xorKey) { xorKey = new Uint8Array(d.xorKey); return; }'), 'the Worker takes it under its own name');
  assert.ok(b.includes("w.postMessage({ xorKey: hooks.chunkKey });"), 'and the page sends it under that name');
  assert.ok(!/if \(d\.key\)/.test(b), 'nothing keys off the field a job already uses');
  assert.match(portable, /if \(!xorKey \|\| pos < 0\) return buf;|if \(!KEY\) return bytes;/);
  // the position rides beside the range, because that is what unscrambles it
  assert.match(portable, /\+ '@' \+ \(p\.i \* S\[p\.s\]\.size \+ p\.within\)/);
  assert.ok(b.includes("let frag = url.slice(h + 3);") && b.includes("const cut = frag.indexOf('@');"), 'the Worker reads it back');
  // round 84: and the chunk's own length after it, which is the only thing a
  // Content-Range total can be checked against
  assert.match(portable, /\+ '!' \+ chunkLen\(p\.s, p\.i\)/);
  assert.ok(b.includes("const bang = frag.indexOf('!');"));
});

test('round 77: the loading screen says which chunk it is on', () => {
  const play = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
  assert.ok(play.includes('window.__isaacPortableData.onChunk = (got, total) => {'), 'the page listens');
  // round 89d: it counts what the first frame is waiting for, not every chunk,
  // and goes quiet once that wait is over
  assert.match(portable, /if \(quiet \|\| !P\.onChunk\) return;/, 'the provider counts until the wait is over');
  assert.match(portable, /P\.onChunk\(Math\.min\(loadedN, tot\), tot\);/, 'never past its own total');
  assert.match(portable, /"chunks": n_a \+ n_b,/, 'and the page is told how many there are');
});

test('round 90f: the cache evicts what has been read, not the boot\'s next chunk', () => {
  // The prefetch inserts the boot's chunks in trail order and a read moves its
  // chunk to the young end, so the OLDEST entries are the ones the boot has not
  // reached. Oldest-first eviction took exactly those: on the CDN the title came
  // 232 s after the first frame. Run the provider's own cache code to show it.
  const js = portable.slice(portable.indexOf('PROVIDER_JS = r"""'));
  const cut = (from, to) => {
    const a = js.indexOf(from), b = js.indexOf(to, a);
    assert.ok(a >= 0 && b > a, `provider section ${from.trim()}`);
    return js.slice(a, b);
  };
  const src = 'var cache = new Map();\n'
    + cut('  var CACHE_STEADY', '  // round 77: the chunks are XORed')
    + cut('  var unread = Object.create(null)', '  // resolves when there is room to fetch another')
    + 'return { cache, trim, remember, touch, wasRead, evicted, headLeft, max: (n) => { CACHE_MAX = n; }, bootOver: BOOT_OVER_FRAME };';
  const C = new Function('window', src)({ isaacFrame: 0 });
  C.max(1000);                                          // the boot's budget: the whole head
  for (const k of ['0:0', '0:1', '1:0', '1:1', '1:2', '1:3']) C.remember(k, new Uint8Array(10));
  for (const k of ['0:0', '0:1', '1:0']) { C.touch(k); C.wasRead(k); }
  C.max(35); C.trim();                                  // room for three
  assert.deepEqual([...C.cache.keys()].sort(), ['1:1', '1:2', '1:3'],
    'the three the boot has not read survive; the three it has are the ones evicted');
  // round 90g: and it says what it dropped and why -- the instrument that
  // closed 90g's two hypotheses (recomp-architecture §21.115)
  assert.deepEqual(C.evicted.map((e) => e.replace(/ @\d+$/, '')), ['0:0 read', '0:1 read', '1:0 read']);
  // the budget drops, and the leftovers start, when the boot is over -- the
  // frame boot_web.mjs itself calls the end of the boot, not the first one
  assert.equal(C.bootOver, Number(/READER_CLEAR_FRAME = (\d+)/.exec(bootWeb)[1]));
});

test('round 90f: a chunked page is never built without its boot trail', () => {
  // Rounds 90 to 90e shipped a dist built without ship.py --trail. The page then
  // prefetched the whole payload before its first frame, through a cache sized
  // for the steady state, and nothing in either build said so.
  const ship = readFileSync(join(root, 'scripts', 'recomp', 'assets', 'ship.py'), 'utf8');
  assert.match(ship, /"trail": os\.path\.join\(ROOT, "scripts", "recomp", "assets", TRAIL_NAME\),/,
    'ship.py ships the recorded trail by default');
  assert.match(ship, /p\.add_argument\("--trail", default=DEFAULTS\["trail"\]/);
  assert.match(ship, /no boot trail at %s/, 'and a missing trail file is an error, not a skip');
  assert.match(portable, /if not has_trail and not args\.no_trail:\s*\n\s*raise SystemExit/,
    'portable.py refuses a chunked build whose dist has no trail');
  assert.doesNotMatch(portable, /-- the modules and the boot trail are in it, nothing else is needed"\s*\n\s*% \(/,
    'and its summary only claims a trail when the page has one');
  // the recorded trail is in the tree, parses, and names only windowed archives
  const trail = JSON.parse(readFileSync(join(root, 'scripts', 'recomp', 'assets', 'boot-trail.json'), 'utf8'));
  assert.ok(Array.isArray(trail) && trail.length > 100, `a real trail (${trail.length} reads)`);
  const windowed = new Set([.../"(resources\/packed\/[a-z]+\.a)"/g[Symbol.matchAll](/WINDOWED = \(([^)]*)\)/.exec(portable)[1])].map((m) => m[1]));
  assert.equal(windowed.size, 4, 'the four windowed archives');
  for (const [f, off, len] of trail) {
    assert.ok(windowed.has(f), `${f}: a windowed archive`);
    assert.ok(Number.isInteger(off) && off >= 0 && Number.isInteger(len) && len > 0, `${f}@${off}: offset and length`);
    assert.ok((off % 1048576) + len <= 1048576, `${f}@${off}+${len}: a read inside one window`);
  }
});


test('round 77: every page module parses, before and after minifying', async (t) => {
  // A backtick in a comment inside the reader Worker -- which is one big template
  // literal -- ended that template early, and the pipeline module stopped parsing
  // at all. The page failed with "Unexpected identifier" and no first frame, and
  // nothing in the suite noticed, because nothing was reading the file as code.
  // `node --check` parses a file without running it, and needs no flag the
  // family does not already pass
  const parses = (file) => spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  const names = ['boot.mjs', 'boot_web.mjs', 'play.mjs', 'mods.mjs', 'zip.mjs', 'menu_overlay.mjs'];
  const web = join(root, 'scripts', 'recomp', 'web');
  for (const name of names) {
    const file = join(web, name);
    if (name === 'boot.mjs') continue;                 // the build's output, not in this tree
    const src = readFileSync(file, 'utf8');
    const first = parses(file);
    assert.equal(first.status, 0, `${name} parses: ${first.stderr}`);
    if (!python) continue;
    // through a file rather than stdout: the sources are UTF-8 and a pipe on
    // Windows is not, and a mangled byte would look like a minifier bug
    const tmp = join(tmpdir(), `isaac-min-${name}`);
    runPy([
      'import io, sys; sys.path.insert(0, "scripts/recomp/assets"); import portable as P',
      `src = io.open("scripts/recomp/web/${name}", encoding="utf-8").read()`,
      `io.open(${JSON.stringify(tmp.replace(/\\/g, '/'))}, "w", encoding="utf-8", newline="").write(P.minify_js(src))`,
    ].join('\n'));
    const min = readFileSync(tmp, 'utf8');
    assert.ok(min.length < src.length, `${name} does shrink`);
    const after = parses(tmp);
    assert.equal(after.status, 0, `${name} still parses minified: ${after.stderr}`);
  }
});

test('round 78: a portable build carries the menus own art', () => {
  // ship.py keeps page-assets out of instance_index.json (the pipeline must not
  // seed the page's files into the guest FS), and plan() walks that index -- so
  // the payload had no menu.json, no font, no cursor. readAsset returned null,
  // menuAssets.load() threw, and IMPORT MOD did nothing at all. Silently.
  assert.match(portable, /assets = os\.path\.join\(dist, "instance", "page-assets"\)/);
  assert.match(portable, /rel = "page-assets\/" \+ name/, 'keyed the way readAsset asks');
  const play = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
  const asks = [...play.matchAll(/portable\.bytesFor\(`page-assets\/\$\{name\}`/g)].length;
  assert.ok(asks >= 2, 'both menus read their art through the provider');
});

test('round 80: a rebuild can keep the key the uploaded chunks were scrambled with', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  // The default seed is the two stream lengths, so adding one file to part A
  // re-scrambles part B too: half a gigabyte of chunks that differ only in their
  // keystream, all of which would have to be uploaded again.
  assert.match(portable, /--key-b64/);
  assert.match(portable, /--key-of/);
  const out = runPy([
    'import base64, sys; sys.path.insert(0, "scripts/recomp/assets"); import portable as P',
    'k = P.keystream_key(b"pin")',
    'b64 = base64.b64encode(k).decode("ascii")',
    // what the CLI does with --key-b64, and that it round trips
    'print(base64.b64decode(b64) == k)',
    'print(len(k) == 256)',
    // and --key-of finds it in a page built with that key
    'page = "<script>window.__isaacPortableData = " + __import__("json").dumps({"key": b64, "chunks": 33}) + ";</script>"',
    'import re',
    'm = re.search(r"window\\.__isaacPortableData\\s*=\\s*(\\{.*?\\});", page, re.S)',
    'print(__import__("json").loads(m.group(1))["key"] == b64)',
  ].join('\n'));
  assert.deepEqual(out.split(/\r?\n/), ['True', 'True', 'True']);
});


test('round 88: the whole-read chunks may be zopfli, and it stays gzip', () => {
  // Part A is gzipped before it is scrambled, so its wire form is ours. Zopfli
  // is the same gzip format -- the page still calls DecompressionStream('gzip')
  // -- for about 0.55 MB across part A and six more minutes of build, which is
  // why it is a flag. It must never become the default silently.
  const p = readFileSync(join(root, 'scripts', 'recomp', 'assets', 'portable.py'), 'utf8');
  assert.match(p, /if not args\.zopfli:\s*\n\s*return gzip\.compress\(b, 9, mtime=0\)/,
    'gzip -9 stays the default');
  assert.match(p, /import zopfli\.gzip/, 'and zopfli is imported only when asked for');
  assert.match(p, /--zopfli needs the zopfli package/, 'with a clear word when it is missing');
  assert.match(p, /"--zopfli", action="store_true"/, 'it is opt-in');
});
