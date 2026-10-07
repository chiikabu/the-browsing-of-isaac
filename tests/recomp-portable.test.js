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
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
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
          reply(bytes, { status = range ? 206 : 200, total, headers = {} } = {}) {
            assert.equal(this.settled, false, `already answered ${url} ${range}`);
            this.settled = true;
            resolve({
              ok: status >= 200 && status < 300, status,
              headers: new Headers({
                ...(total !== undefined && status === 206 ? { 'content-range': `bytes ${range.slice(6)}/${total}` } : {}),
                ...headers,
              }),
              arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
            });
          },
          stream({ status = range ? 206 : 200, total, headers = {}, cancel } = {}) {
            assert.equal(this.settled, false, `already answered ${url} ${range}`);
            this.settled = true;
            let controller;
            const body = new ReadableStream({
              start(value) { controller = value; },
              cancel,
            });
            resolve(new Response(body, { status, headers: {
              ...(total !== undefined && status === 206 ? { 'content-range': `bytes ${range.slice(6)}/${total}` } : {}),
              ...headers,
            } }));
            return controller;
          },
          fail(error) { this.settled = true; reject(error); },
        });
      });
    },
  };
}

function deferredPortable(data, search = '', options = {}) {
  const network = deferredFetch();
  const window = { __isaacPortableData: data };
  new Function('window', 'fetch', 'location', 'setTimeout', 'clearTimeout', 'DecompressionStream', providerSource)(
    window, network.fetch, { href: 'https://game.test/index.html' + search, search },
    options.setTimeout || (() => 0), options.clearTimeout || (() => {}), options.DecompressionStream || DecompressionStream,
  );
  return { ...network, provider: window.isaacPortable };
}

function deferredReaderWorker(provider) {
  // Cook the actual template, as the page and recomp-web.test.js do.
  const source = new Function('return `' + /const READER_WORKER = `([\s\S]*?)\r?\n`;/.exec(bootWeb)[1] + '`')();
  const network = deferredFetch(), replies = new Map();
  let nextWant = 1;
  const worker = {
    fetch: network.fetch, Blob, Response, DecompressionStream, Uint8Array, ArrayBuffer, setTimeout,
    postMessage(message) {
      if (message.download) {
        const { url, from, to } = message.download;
        provider.recordDownload(url, from, to);
      }
      if (!message.want) return;
      const resolve = replies.get(message.want);
      replies.delete(message.want);
      resolve(message);
    },
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
        z: '0'.repeat(engineCount), stored: Array(engineCount).fill(PIECE),
        v: Array.from({ length: engineCount }, (_, i) => 'engine-' + i) },
      { tag: 'b', size: PIECE, gz: false, n: archiveCount, bytes: archiveCount * PIECE,
        stored: Array(archiveCount).fill(PIECE),
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

function scramble(bytes, at, key) {
  const out = Buffer.from(bytes);
  for (let i = 0; i < out.length; i++) out[i] ^= key[(at + i) & 255] ^ (((at + i) >> 8) & 255);
  return out;
}

function windowData() {
  const data = chunkData(1, 3);
  const windows = [Buffer.alloc(WIN, 17), Buffer.alloc(WIN, 29),
    Buffer.alloc(WIN, 43), Buffer.alloc(WIN, 61), Buffer.alloc(317, 73)];
  const flags = '10110', key = Buffer.from(Array.from({ length: 256 }, (_, i) => (i * 31 + 7) & 255));
  const packed = windows.map((bytes, i) => flags[i] === '1' ? gzipSync(bytes) : bytes);
  const stored = [], flat = Buffer.concat(packed);
  let at = 0;
  for (let i = 0; i < packed.length; i += 2) {
    const size = packed[i].length + (packed[i + 1]?.length || 0);
    stored.push(scramble(flat.subarray(at, at + size), at, key));
    at += size;
  }
  Object.assign(data.streams[1], { win: WIN, wl: packed.map((b) => b.length), wz: flags,
    stored: stored.map((b) => b.length), bytes: 4 * WIN + 317 });
  data.files['resources/packed/archive.a'].size = 4 * WIN + 317;
  data.key = key.toString('base64');
  return { data, windows, stored, key, raw: Buffer.concat(windows) };
}

test('portable CDN readiness and engine reads do not wait for unrelated archive bodies', { timeout: 5000 }, async (t) => {
  for (const trail of [false, true]) {
    await t.test(trail ? 'recorded trail' : 'no trail', async () => {
      const { data, stored, key, windows } = windowData();
      if (trail) data.trail = [['resources/packed/archive.a', 0, data.streams[1].bytes]];
      let inflates = 0;
      const h = deferredPortable(data, '?noranges=1', {
        DecompressionStream: class {
          constructor(kind) { inflates++; return new DecompressionStream(kind); }
        },
      });
      let ready = false;
      h.provider.ready.then(() => { ready = true; });
      await turn();
      assert.equal(ready, true, 'only the range policy gates ready, with every archive unresolved');
      assert.equal(await h.provider.ready, false);
      const bodies = stored.map((_, i) => pending(h, `b${i}.bin`, null).stream());
      await turn();
      assert.equal(h.provider.loaded(), 0, 'headers are not completed chunks');
      assert.equal(h.provider.progress().received, 0);
      const engine = h.provider.bytesFor('engine0', 31, 97);
      pending(h, 'a0.bin', null).reply(scramble(Buffer.alloc(PIECE, 11), 0, key));
      assert.deepEqual(Buffer.from(await engine), Buffer.alloc(97, 11));
      const demand = h.provider.bytesFor('resources/packed/archive.a', 13, 71);
      assert.equal(h.requests.filter((r) => fileName(r) === 'b0.bin').length, 1,
        'the archive demand joins its background body');
      bodies[0].enqueue(stored[0]); bodies[0].close();
      assert.deepEqual(Buffer.from(await demand), windows[0].subarray(13, 84));
      assert.equal(inflates, 1, 'only the demanded compressed window was inflated');
      assert.equal(h.provider.loaded(), 2, 'unrelated bodies still need to arrive');
      for (let i = 1; i < bodies.length; i++) { bodies[i].enqueue(stored[i]); bodies[i].close(); }
      await turn();
      assert.equal(inflates, 1, 'finishing archive prefetch does not inflate its windows');
      assert.deepEqual(h.provider.progress(), {
        received: PIECE + stored.reduce((n, b) => n + b.length, 0),
        total: PIECE + stored.reduce((n, b) => n + b.length, 0),
      });
    });
  }
});

test('portable stored-window cache reads span windows, chunks and tails without mutating shared bytes', { timeout: 5000 }, async () => {
  const { data, stored, raw } = windowData();
  const h = deferredPortable(data, '?noranges=1');
  await h.provider.ready;
  await turn();
  for (let i = 0; i < stored.length; i++) pending(h, `b${i}.bin`, null).reply(stored[i]);
  await turn();
  const rel = 'resources/packed/archive.a';
  const cuts = [[WIN - 11, 2 * WIN + 37], [WIN + 19, 73], [raw.length - 17, 99]];
  for (const [off, len] of cuts) {
    const result = await h.provider.bytesFor(rel, off, len);
    assert.deepEqual(Buffer.from(result), raw.subarray(off, off + len));
    result.fill(0);
    assert.deepEqual(Buffer.from(await h.provider.bytesFor(rel, off, len)), raw.subarray(off, off + len));
  }
  assert.equal(h.requests.filter((r) => fileName(r).startsWith('b')).length, stored.length,
    'cache retains stored chunks, not decoded windows under chunk keys');
});

test('portable byte progress measures streamed prefixes with a fixed unequal-size total and deduplicates retries', { timeout: 5000 }, async () => {
  const data = chunkData(2, 0), updates = [], counts = [];
  const first = Buffer.from([3, 5, 7, 11, 13]), second = Buffer.from([17, 19, 23, 29, 31, 37, 41, 43, 47]);
  data.streams[0].stored = [first.length, second.length];
  data.files.engine0.size = first.length; data.files.engine1.size = second.length;
  data.onProgress = (value) => updates.push({ ...value });
  data.onChunk = (got, total) => counts.push([got, total]);
  const h = deferredPortable(data);
  const firstRead = h.provider.bytesFor('engine0', 0, 0);
  const failed = assert.rejects(firstRead, /disconnected/);
  const one = pending(h, 'a0.bin', null).stream({ headers: { 'content-length': '5' } });
  await turn();
  assert.deepEqual(h.provider.progress(), { received: 0, total: 14 });
  assert.equal(h.provider.loaded(), 0);
  one.enqueue(first.subarray(0, 3));
  await turn();
  assert.deepEqual(h.provider.progress(), { received: 3, total: 14 });
  assert.deepEqual(updates, [{ received: 3, total: 14 }]);
  assert.equal(h.provider.loaded(), 0, 'a partial body is not a whole chunk');
  one.error(new Error('disconnected'));
  await failed;
  const retry = h.provider.bytesFor('engine0', 0, 0);
  const again = pending(h, 'a0.bin', null).stream();
  again.enqueue(first.subarray(0, 2));
  await turn();
  assert.deepEqual(h.provider.progress(), { received: 3, total: 14 }, 'retry prefix was already received');
  again.enqueue(first.subarray(2)); again.close();
  assert.deepEqual(Buffer.from(await retry), first);
  assert.deepEqual(h.provider.progress(), { received: 5, total: 14 }, 'one of two unequal chunks is not fifty percent');
  assert.deepEqual(counts, [[1, 2]]);
  const lastRead = h.provider.bytesFor('engine1', 0, 0);
  pending(h, 'a1.bin', null).reply(second);
  assert.deepEqual(Buffer.from(await lastRead), second);
  assert.deepEqual(h.provider.progress(), { received: 14, total: 14 });
  assert.deepEqual(counts, [[1, 2], [2, 2]]);
  assert.ok(updates.every((p) => p.total === 14 && p.received <= 14));
});

test('portable boot progress excludes archive probes and worker ranges while deduplicating streamed retries', { timeout: 5000 }, async () => {
  const data = chunkData(2, 1), updates = [];
  const first = Buffer.from([3, 5, 7, 11, 13]), second = Buffer.from([17, 19, 23, 29, 31, 37, 41, 43, 47]);
  const archive = Buffer.alloc(2048, 59);
  data.streams[0].stored = [first.length, second.length];
  data.streams[1].stored = [archive.length];
  data.files.engine0.size = first.length; data.files.engine1.size = second.length;
  data.files['resources/packed/archive.a'].size = archive.length;
  data.onProgress = (value) => updates.push({ ...value });
  const h = deferredPortable(data);
  assert.deepEqual(h.provider.progress('boot'), { received: 0, total: 14 },
    'bootstrap denominator uses stored lengths, not logical bytes or archive lengths');
  assert.deepEqual(h.provider.progress(), { received: 0, total: 2062 });
  await answerProbes(h, [archive]);
  assert.equal(await h.provider.ready, true);
  assert.deepEqual(h.provider.progress('boot'), { received: 0, total: 14 });
  assert.deepEqual(h.provider.progress(), { received: 1536, total: 2062 },
    'full diagnostics retain the union of overlapping probe bytes');

  const firstRead = h.provider.bytesFor('engine0', 0, 0);
  const failed = assert.rejects(firstRead, /disconnected/);
  const one = pending(h, 'a0.bin', null).stream();
  one.enqueue(first.subarray(0, 3));
  await turn();
  assert.deepEqual(h.provider.progress('boot'), { received: 3, total: 14 });
  assert.deepEqual(h.provider.progress(), { received: 1539, total: 2062 });
  one.error(new Error('disconnected'));
  await failed;
  const retry = h.provider.bytesFor('engine0', 0, 0);
  const again = pending(h, 'a0.bin', null).stream();
  again.enqueue(first.subarray(0, 2));
  await turn();
  assert.deepEqual(h.provider.progress('boot'), { received: 3, total: 14 },
    'retry prefix cannot advance bootstrap twice');

  const worker = deferredReaderWorker(h.provider);
  const url = h.provider.urlFor('resources/packed/archive.a', 1024, 768);
  const workerRead = worker.read(url, 768);
  answerRange(pending(worker, 'b0.bin', 'bytes=1024-1791'), archive);
  assert.deepEqual(Buffer.from((await workerRead).buf), archive.subarray(1024, 1792));
  assert.deepEqual(h.provider.progress('boot'), { received: 3, total: 14 });
  assert.deepEqual(h.provider.progress(), { received: 1795, total: 2062 },
    'worker completion overlaps probes without entering bootstrap progress');

  again.enqueue(first.subarray(2)); again.close();
  assert.deepEqual(Buffer.from(await retry), first);
  assert.deepEqual(h.provider.progress('boot'), { received: 5, total: 14 },
    'one of two unequal bootstrap chunks is not fifty percent');
  const lastRead = h.provider.bytesFor('engine1', 0, 0);
  pending(h, 'a1.bin', null).reply(second);
  assert.deepEqual(Buffer.from(await lastRead), second);
  assert.deepEqual(h.provider.progress('boot'), { received: 14, total: 14 });
  assert.deepEqual(h.provider.progress(), { received: 1806, total: 2062 },
    'bootstrap finishes while future archive bytes remain');

  const endURL = h.provider.urlFor('resources/packed/archive.a', 1280, 768);
  const endRead = worker.read(endURL, 768);
  answerRange(pending(worker, 'b0.bin', 'bytes=1280-2047'), archive);
  assert.deepEqual(Buffer.from((await endRead).buf), archive.subarray(1280));
  assert.deepEqual(h.provider.progress('boot'), { received: 14, total: 14 });
  assert.deepEqual(h.provider.progress(), { received: 2062, total: 2062 });
  assert.deepEqual(updates.at(-1), { received: 2062, total: 2062 },
    'progress callbacks retain their full-payload contract');
  assert.ok(updates.every((value) => value.total === 2062 && value.received <= 2062));
});

test('portable inline boot progress requires no download while full progress retains embedded bytes before and after reads', async () => {
  const data = chunkData(1, 1);
  const engine = Buffer.from([3, 5, 7, 11, 13]), archive = Buffer.from([17, 19, 23, 29, 31, 37, 41]);
  delete data.base;
  data.blobs = [engine.toString('base64'), archive.toString('base64')];
  Object.assign(data.streams[0], { first: 0, stored: [engine.length] });
  Object.assign(data.streams[1], { first: 1, stored: [archive.length] });
  data.files.engine0.size = engine.length;
  data.files['resources/packed/archive.a'].size = archive.length;
  const h = deferredPortable(data);
  await h.provider.ready;
  assert.deepEqual(h.provider.progress('boot'), { received: 0, total: 0 });
  assert.deepEqual(h.provider.progress(), { received: 12, total: 12 });
  assert.deepEqual(Buffer.from(h.provider.bytesFor('engine0', 1, 3)), engine.subarray(1, 4));
  assert.deepEqual(Buffer.from(h.provider.bytesFor('resources/packed/archive.a', 2, 4)), archive.subarray(2, 6));
  assert.deepEqual(h.provider.progress('boot'), { received: 0, total: 0 });
  assert.deepEqual(h.provider.progress(), { received: 12, total: 12 });
  assert.equal(h.requests.length, 0);
});

test('portable worker intervals preserve version identity and union overlaps across all stored chunks', async () => {
  const data = chunkData(0, 2);
  data.streams[1].stored = [100, 300];
  const h = deferredPortable(data, '?noranges=1');
  await h.provider.ready;
  const a = 'https://assets.test/release/c/b0.bin?v=archive-0';
  const b = 'https://assets.test/release/c/b1.bin?v=archive-1';
  h.provider.recordDownload(a + '&w=0-39#r=0-39', 0, 40);
  h.provider.recordDownload(a + '&w=20-79', 20, 80);
  h.provider.recordDownload(a + '&w=0-39', 0, 40);
  assert.deepEqual(h.provider.progress(), { received: 80, total: 400 });
  assert.equal(h.provider.loaded(), 0);
  h.provider.recordDownload(a.replace('archive-0', 'old-version'), 0, 100);
  h.provider.recordDownload(a, -1, 100);
  h.provider.recordDownload(a, 0, 101);
  h.provider.recordDownload(a, 1.5, 80);
  h.provider.recordDownload('https://elsewhere.test/c/b0.bin?v=archive-0', 0, 100);
  assert.deepEqual(h.provider.progress(), { received: 80, total: 400 }, 'unknown identities and invalid intervals are ignored');
  h.provider.recordDownload(a, 80, 100);
  h.provider.recordDownload(b, 200, 300);
  h.provider.recordDownload(b, 0, 100);
  h.provider.recordDownload(b, 50, 250);
  assert.deepEqual(h.provider.progress(), { received: 400, total: 400 }, 'a bridging interval joins both existing spans once');
  assert.equal(h.provider.loaded(), 2);
});

test('portable whole responses reject invalid headers and bodies without completing progress or poisoning retry', { timeout: 5000 }, async (t) => {
  for (const mode of ['short', 'long', 'partial-status', 'content-range', 'content-length']) {
    await t.test(mode, async () => {
      const data = chunkData(1, 0), bytes = Buffer.from([7, 11, 13, 17]);
      data.streams[0].stored = [4]; data.files.engine0.size = 4;
      const h = deferredPortable(data), failed = assert.rejects(h.provider.bytesFor('engine0', 0, 4), /response|length/);
      pending(h, 'a0.bin', null).reply(mode === 'short' ? bytes.subarray(0, 3) : mode === 'long' ? Buffer.concat([bytes, bytes]) : bytes, {
        status: mode === 'partial-status' ? 206 : 200,
        headers: mode === 'content-range' ? { 'content-range': 'bytes 0-3/4' }
          : mode === 'content-length' ? { 'content-length': '19' } : {},
      });
      await failed;
      assert.deepEqual(h.provider.progress(), { received: 0, total: 4 });
      assert.equal(h.provider.loaded(), 0);
      const retry = h.provider.bytesFor('engine0', 0, 4);
      pending(h, 'a0.bin', null).reply(bytes);
      assert.deepEqual(Buffer.from(await retry), bytes);
      assert.deepEqual(h.provider.progress(), { received: 4, total: 4 });
    });
  }
});

test('portable whole HTTP gzip responses validate decoded payload size rather than encoded Content-Length', { timeout: 5000 }, async (t) => {
  for (const mode of ['exact', 'short']) {
    await t.test(mode, async () => {
      const data = chunkData(1, 0), payload = Buffer.alloc(257, 41);
      data.streams[0].stored = [payload.length]; data.files.engine0.size = payload.length;
      const decoded = mode === 'short' ? payload.subarray(0, payload.length - 1) : payload;
      const h = deferredPortable(data), read = h.provider.bytesFor('engine0', 0, 0);
      const failure = mode === 'short' ? assert.rejects(read, /wrong body length/) : null;
      const stream = pending(h, 'a0.bin', null).stream({
        headers: { 'content-encoding': 'gzip', 'content-length': String(gzipSync(decoded).length) },
      });
      // Fetch already removed HTTP compression before exposing this body.
      stream.enqueue(decoded); stream.close();
      if (failure) {
        await failure;
        assert.deepEqual(h.provider.progress(), { received: decoded.length, total: payload.length });
        assert.equal(h.provider.loaded(), 0, 'transport decoding does not bypass stored-payload length validation');
      } else {
        assert.deepEqual(Buffer.from(await read), payload);
        assert.deepEqual(h.provider.progress(), { received: payload.length, total: payload.length });
        assert.equal(h.provider.loaded(), 1);
      }
    });
  }
});

test('portable rejected whole bodies release their transfer before the preload pool advances', { timeout: 5000 }, async (t) => {
  for (const mode of ['http', 'header']) {
    await t.test(mode, async () => {
      const h = deferredPortable(chunkData(5, 0));
      let release;
      const closing = new Promise((resolve) => { release = resolve; });
      const failed = assert.rejects(h.provider.bytesFor('engine0', 0, 7), mode === 'http' ? /HTTP 503/ : /invalid whole response/);
      const stream = pending(h, 'a0.bin', null).stream({
        status: mode === 'http' ? 503 : 200,
        headers: mode === 'header' ? { 'content-length': String(PIECE + 1) } : {},
        cancel: () => closing,
      });
      await turn();
      assert.throws(() => stream.enqueue(Buffer.from([1])), TypeError, 'rejected response stream is closed');
      assert.equal(h.requests.some((r) => fileName(r) === 'a4.bin'), false,
        'the fifth transfer cannot start while cancellation of the first is pending');
      assert.equal(h.provider.progress().received, 0);
      release();
      await failed;
      await turn();
      pending(h, 'a4.bin', null);
      const retry = h.provider.bytesFor('engine0', 0, 7);
      pending(h, 'a0.bin', null).reply(Buffer.alloc(PIECE, 29));
      assert.deepEqual(Buffer.from(await retry), Buffer.alloc(7, 29));
    });
  }
});

test('portable rejected range bodies finish cancellation before fallback or consumer retry', { timeout: 5000 }, async (t) => {
  for (const mode of ['http', 'header']) {
    await t.test(mode, async () => {
      const h = deferredPortable(chunkData(0, 1)), bytes = Buffer.alloc(PIECE, 31);
      await answerProbes(h, [bytes]);
      await h.provider.ready;
      let release;
      const closing = new Promise((resolve) => { release = resolve; });
      const rel = 'resources/packed/archive.a';
      const read = h.provider.bytesFor(rel, 2000, 71).catch((error) => {
        assert.match(error.message, /HTTP 503/);
        return h.provider.bytesFor(rel, 2000, 71);
      });
      const request = pending(h, 'b0.bin', 'bytes=2000-2070');
      const stream = request.stream({
        status: mode === 'http' ? 503 : 206,
        headers: mode === 'header' ? { 'content-range': `bytes 2001-2071/${PIECE}` } : {},
        cancel: () => closing,
      });
      const requestsBeforeCancel = h.requests.length;
      await turn();
      assert.throws(() => stream.enqueue(Buffer.from([1])), TypeError);
      assert.equal(h.requests.length, requestsBeforeCancel, 'no replacement transfer overlaps cancellation');
      assert.deepEqual(h.provider.progress(), { received: 1536, total: PIECE });
      release();
      await turn();
      const next = pending(h, 'b0.bin', mode === 'http' ? 'bytes=2000-2070' : null);
      if (mode === 'http') answerRange(next, bytes);
      else next.reply(bytes);
      assert.deepEqual(Buffer.from(await read), bytes.subarray(2000, 2071));
    });
  }
});

test('portable probe rejection cancels both probe bodies before starting whole archives', { timeout: 5000 }, async (t) => {
  for (const stage of ['first', 'overlap']) {
    await t.test(stage, async () => {
      const h = deferredPortable(chunkData(0, 1)), bytes = Buffer.alloc(PIECE, 37);
      if (stage === 'overlap') {
        answerRange(pending(h, 'b0.bin', 'bytes=0-1023'), bytes);
        await turn();
      }
      let release, ready = false;
      const closing = new Promise((resolve) => { release = resolve; });
      h.provider.ready.then(() => { ready = true; });
      const stream = pending(h, 'b0.bin', stage === 'first' ? 'bytes=0-1023' : 'bytes=512-1535').stream({
        status: stage === 'first' ? 200 : 206,
        total: stage === 'overlap' ? PIECE + 37 : undefined,
        cancel: () => closing,
      });
      await turn();
      assert.throws(() => stream.enqueue(Buffer.from([1])), TypeError);
      assert.equal(ready, false, 'range policy cannot finish before the rejected transfer stops');
      assert.equal(h.requests.some((r) => !r.range), false);
      assert.deepEqual(h.provider.progress(), { received: stage === 'first' ? 0 : 1024, total: PIECE });
      release();
      assert.equal(await h.provider.ready, false);
      await turn();
      const read = h.provider.bytesFor('resources/packed/archive.a', 2000, 71);
      pending(h, 'b0.bin', null).reply(bytes);
      assert.deepEqual(Buffer.from(await read), bytes.subarray(2000, 2071));
    });
  }
});

test('portable streamed body completion is validated before a full-byte claim', { timeout: 5000 }, async (t) => {
  for (const mode of ['short', 'long']) {
    await t.test(mode, async () => {
      const data = chunkData(1, 0);
      data.streams[0].stored = [5]; data.files.engine0.size = 5;
      const h = deferredPortable(data);
      const failed = assert.rejects(h.provider.bytesFor('engine0', 0, 5), /length/);
      const stream = pending(h, 'a0.bin', null).stream();
      stream.enqueue(Buffer.from([3, 5, 7]));
      await turn();
      assert.deepEqual(h.provider.progress(), { received: 3, total: 5 });
      if (mode === 'long') {
        stream.enqueue(Buffer.from([11, 13]));
        await turn();
        assert.deepEqual(h.provider.progress(), { received: 3, total: 5 }, 'EOF has not verified the apparent full body');
        stream.enqueue(Buffer.from([17]));
      } else stream.close();
      await failed;
      assert.deepEqual(h.provider.progress(), { received: 3, total: 5 });
      assert.equal(h.provider.loaded(), 0);
    });
  }
});

test('portable compressed range rejection preserves stored cache bytes and excludes invalid accounting', { timeout: 5000 }, async (t) => {
  for (const mode of ['start', 'end', 'total', 'content-length', 'encoded-length', 'short', 'whole']) {
    await t.test(mode, async () => {
      const data = chunkData(0, 1), raw = Buffer.alloc(WIN, 23), window = Buffer.alloc(WIN, 41);
      const zipped = gzipSync(window), stored = Buffer.concat([raw, zipped]);
      Object.assign(data.streams[1], { win: WIN, wl: [raw.length, zipped.length], wz: '01', stored: [stored.length] });
      const h = deferredPortable(data);
      await answerProbes(h, [stored]);
      assert.equal(await h.provider.ready, true);
      assert.deepEqual(h.provider.progress(), { received: 1536, total: stored.length }, 'overlapping probes count their union');
      const read = h.provider.bytesFor('resources/packed/archive.a', WIN + 17, 71);
      const request = pending(h, 'b0.bin', `bytes=${WIN}-${stored.length - 1}`);
      const from = mode === 'start' ? WIN + 1 : WIN;
      const to = mode === 'end' ? stored.length : stored.length - 1;
      const total = mode === 'total' ? stored.length + 37 : stored.length;
      request.reply(mode === 'whole' ? stored : mode === 'short' ? zipped.subarray(0, zipped.length - 1) : zipped, {
        status: mode === 'whole' ? 200 : 206,
        headers: mode === 'whole' ? {} : {
          'content-range': `bytes ${from}-${to}/${total}`,
          ...(mode === 'content-length' ? { 'content-length': String(zipped.length + 1) } : {}),
          ...(mode === 'encoded-length' ? { 'content-encoding': 'gzip', 'content-length': String(gzipSync(zipped).length) } : {}),
        },
      });
      await turn();
      if (mode !== 'whole') {
        assert.deepEqual(h.provider.progress(), { received: 1536, total: stored.length });
        assert.equal(h.provider.loaded(), 0);
        pending(h, 'b0.bin', null).reply(stored);
      }
      assert.deepEqual(Buffer.from(await read), window.subarray(17, 88));
      assert.equal(h.provider.ranges(), false);
      assert.deepEqual(Buffer.from(await h.provider.bytesFor('resources/packed/archive.a', WIN - 11, 31)),
        Buffer.concat([raw.subarray(WIN - 11), window.subarray(0, 20)]));
      assert.deepEqual(h.provider.progress(), { received: stored.length, total: stored.length });
      assert.equal(h.provider.loaded(), 1);
    });
  }
});

test('portable prefetch bounds lookahead, releases consumed slots and expires stale slots without blocking demand', { timeout: 5000 }, async () => {
  const data = chunkData(1, 12), timers = new Map();
  let timerId = 0;
  const h = deferredPortable(data, '?noranges=1', {
    setTimeout(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  await h.provider.ready;
  await turn();
  const background = () => h.requests.filter((r) => !r.range && fileName(r).startsWith('b'));
  assert.equal(background().length, 6, 'six archive bodies at most begin together');
  for (let i = 0; i < 6; i++) pending(h, `b${i}.bin`, null).reply(Buffer.alloc(PIECE, i + 1));
  await turn();
  assert.equal(background().length, 8, 'pending bodies reserve the remaining two lookahead slots');
  for (let i = 6; i < 8; i++) pending(h, `b${i}.bin`, null).reply(Buffer.alloc(PIECE, i + 1));
  await turn();
  assert.equal(background().length, 8, 'unread cache cannot grow past eight chunks');
  assert.deepEqual(Buffer.from(await h.provider.bytesFor('resources/packed/archive.a', 13, 7)), Buffer.alloc(7, 1));
  await turn();
  assert.equal(background().length, 9, 'consuming one chunk releases one slot');
  const demand = h.provider.bytesFor('resources/packed/archive.a', 11 * PIECE + 17, 5);
  pending(h, 'b11.bin', null).reply(Buffer.alloc(PIECE, 12));
  assert.deepEqual(Buffer.from(await demand), Buffer.alloc(5, 12), 'far demand bypasses the saturated background queue');
  const expire = timers.values().next().value;
  assert.equal(typeof expire, 'function');
  expire();
  await turn();
  assert.equal(h.provider.cache().evicted.length, 1, 'stale unread eviction releases pacing bookkeeping');
  assert.equal(background().length, 11, 'one stale slot advances one background request, beside the far demand');
  const engine = h.provider.bytesFor('engine0', 0, 11);
  pending(h, 'a0.bin', null).reply(Buffer.alloc(PIECE, 19));
  assert.deepEqual(Buffer.from(await engine), Buffer.alloc(11, 19));
  assert.equal(h.requests.filter((r) => fileName(r) === 'a0.bin').length, 1);
});

test('portable byte-budget eviction protects unconsumed engine chunks from archive lookahead', { timeout: 10000 }, async (t) => {
  const data = chunkData(4, 8), size = 24 * WIN;
  const engine = gzipSync(Buffer.alloc(size, 19)), archive = Buffer.alloc(size, 37);
  Object.assign(data.streams[0], { size, bytes: 4 * size, stored: Array(4).fill(engine.length), z: '1111' });
  Object.assign(data.streams[1], { size, bytes: 8 * size, stored: Array(8).fill(size) });
  for (let i = 0; i < 4; i++) data.files['engine' + i] = { s: 0, at: i * size, size };
  data.files['resources/packed/archive.a'].size = 8 * size;
  const h = deferredPortable(data, '?noranges=1');
  await h.provider.ready;
  for (let i = 0; i < 4; i++) pending(h, `a${i}.bin`, null).reply(engine);
  while (h.provider.cache().n < 4 && !t.signal.aborted) await turn();
  assert.equal(h.provider.cache().n, 4);
  assert.deepEqual(Buffer.from(await h.provider.bytesFor('engine0', 31, 7)), Buffer.alloc(7, 19));
  for (let i = 0; i < 6; i++) pending(h, `b${i}.bin`, null).reply(archive);
  await turn();
  for (let i = 6; i < 8; i++) pending(h, `b${i}.bin`, null).reply(archive);
  await turn();
  assert.ok(h.provider.cache().mb <= 256, 'stored archives plus decoded engine obey the byte budget');
  assert.ok(h.provider.cache().evicted.some((key) => key.startsWith('0:0 read')),
    'an already consumed chunk leaves before unconsumed engine bytes');
  const retained = h.provider.bytesFor('engine1', 37, 11);
  assert.equal(h.requests.filter((r) => fileName(r) === 'a1.bin').length, 1,
    'background archives cannot evict the engine before its first consumer');
  assert.deepEqual(Buffer.from(await retained), Buffer.alloc(11, 19));
});

test('portable startup overlaps required chunks and four probe pairs without waiting for the image', { timeout: 5000 }, async () => {
  const data = chunkData();
  const engine = Array.from({ length: 4 }, (_, i) => Buffer.alloc(PIECE, i + 1));
  const archives = Array.from({ length: 4 }, (_, i) => Buffer.alloc(PIECE, i + 20));
  const packed = engine.map((bytes) => gzipSync(bytes));
  delete data.streams[0].z;
  data.streams[0].stored = packed.map((bytes) => bytes.length);
  const h = deferredPortable(data);
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

  for (let i = 0; i < 3; i++) pending(h, `a${i}.bin`, null).reply(packed[i]);
  assert.deepEqual(Buffer.from(await wasm), Buffer.concat(engine.slice(0, 3)));
  const image = h.provider.bytesFor('isaac.segs.bin', 0, 0);
  pending(h, 'a3.bin', null).reply(packed[3]);
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
  const network = deferredReaderWorker(h.provider);
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
    stored: [stored.length],
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
  const network = deferredReaderWorker(h.provider);
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
    streams: [{ tag: 'a', first: 0, size: 4, gz: false, n: 2, stored: [4, 4] }],
    blobs: [Buffer.from([10, 11, 12, 13]).toString('base64'), Buffer.from([14, 15, 16, 17]).toString('base64')],
    files: { asset: { s: 0, at: 0, size: 8 } },
  });
  await h.provider.ready;
  assert.equal(h.provider.urlFor, null);
  assert.deepEqual(Buffer.from(await h.provider.bytesFor('asset', 3, 5)), Buffer.from([13, 14, 15, 16, 17]));
  assert.deepEqual(h.provider.progress(), { received: 8, total: 8 });
  const changed = h.provider.bytesFor('asset', 0, 8);
  changed.fill(0);
  assert.deepEqual(Buffer.from(h.provider.bytesFor('asset', 3, 5)), Buffer.from([13, 14, 15, 16, 17]));
  assert.equal(h.requests.length, 0);
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

test('portable packers serialize exact stored sizes while retaining payload bytes and immutable tokens', (t) => {
  if (!python) { t.skip('no python 3 on PATH'); return; }
  const result = JSON.parse(runPy(String.raw`
import sys, json, tempfile, pathlib, contextlib, io, re, gzip, hashlib, base64
sys.path.insert(0, "scripts/recomp/assets")
import portable as P
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    dist, out = root / "dist", root / "chunks"
    (dist / "instance/resources/packed").mkdir(parents=True)
    engine = b"engine" * 12345
    archive = b"a" * P.MIB + b"b" * P.MIB + bytes(range(251)) * 3
    (dist / "boot.wasm").write_bytes(engine)
    (dist / "instance/resources/packed/music.a").write_bytes(archive)
    (dist / "instance_index.json").write_text(json.dumps([{"p": "resources/packed/music.a"}]))
    (dist / "boot-trail.json").write_text(json.dumps([["resources/packed/music.a", 0, P.MIB]]))
    (dist / "play.html").write_text('<html><body><script type="module" src="./play.mjs"></script></body></html>')
    for module in P.MODULES:
        (dist / module).write_text("export {};")
    with contextlib.redirect_stdout(io.StringIO()):
        P.main(["chunks", str(dist), str(out), "--plain", "--window-gz", "--part-mib", "2", "--chunks", "4"])
        P.main(["offline", str(dist), str(root / "offline.html"), "--piece-mib", "1"])
    def metadata(html):
        return json.loads(re.search(r"window\.__isaacPortableData = (\{.*?\});", html, re.S).group(1))
    meta = metadata((out / "index.html").read_text())
    actual, tokens, payload = [], True, []
    for stream in meta["streams"]:
        parts = [(out / "c" / ("%s%d.bin" % (stream["tag"], i))).read_bytes() for i in range(stream["n"])]
        actual.append([len(part) for part in parts])
        tokens = tokens and stream["v"] == [hashlib.sha256(part).hexdigest()[:8] for part in parts]
        if "wl" in stream:
            stored, pos, windows = b"".join(parts), 0, []
            for length, flag in zip(stream["wl"], stream["wz"]):
                window = stored[pos:pos + length]
                windows.append(gzip.decompress(window) if flag == "1" else window)
                pos += length
            payload.append(b"".join(windows))
        else:
            payload.append(b"".join(gzip.decompress(part) if stream.get("z", "1" * len(parts))[i] == "1" else part for i, part in enumerate(parts)))
    offline_html = (root / "offline.html").read_text()
    offline = metadata(offline_html)
    blobs = []
    for group in re.finditer(r"window\.__isaacPortableData.blobs.push\((.*?)\);", offline_html, re.S):
        blobs.extend(base64.b64decode(item) for item in json.loads("[" + group.group(1) + "]"))
    offline_actual = [[len(blobs[stream["first"] + i]) for i in range(stream["n"])] for stream in offline["streams"]]
    print(json.dumps({"stored": [stream["stored"] for stream in meta["streams"]], "actual": actual,
        "tokens": tokens, "engine": payload[0][:len(engine)] == engine, "archive": payload[1] == archive,
        "offlineStored": [stream["stored"] for stream in offline["streams"]], "offlineActual": offline_actual}))
`));
  assert.deepEqual(result.stored, result.actual);
  assert.deepEqual(result.offlineStored, result.offlineActual);
  assert.equal(result.tokens, true, 'size metadata does not alter content-derived immutable versions');
  assert.equal(result.engine, true);
  assert.equal(result.archive, true, 'compressed windows and a partial tail reconstruct the original archive');
});

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
