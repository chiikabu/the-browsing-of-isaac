// Round 36: music. The OpenAL surface has two halves -- the object model in
// host_audio.c (states, queues, the clock that retires buffers) and the
// WebAudio backend in host_audio_web.c (what is audible in the browser). The
// music path streams: alSourcePlay on an EMPTY source, then four 64 KiB
// chunks queued one by one by the engine's OpenAL thread, then one chunk per
// processed chunk for as long as the track runs. Rounds 22-35 had the model
// answering "processed" off the wall clock while the backend was handed ONE
// buffer at alSourcePlay (the queue head, 0 for that first play) and never
// heard of a queued buffer at all: the title theme never had an
// AudioBufferSourceNode, the census said 300 chunks queued, and nothing was
// audible.
//
// Coverage:
//   1. the model's OpenAL Soft rules and the backend contract run natively in
//      the host selftest (build-selftest.json: the `audio:` checks, a fake
//      clock, counted hooks);
//   2. the backend's JS bodies are extracted from the EM_JS blocks in
//      host_audio_web.c and run HERE against a fake AudioContext: a queue
//      becomes a chain of nodes started back to back on the context clock,
//      a queue while playing lands at the chain's end, an unqueue drops
//      bookkeeping only, a stop cancels, a play re-schedules from the head,
//      a suspended context defers and a resume replays, a chain far ahead of
//      the clock is trimmed;
//   3. the page's output gate and native readiness lifecycle, using the same
//      backend bodies and a signal-carrying fake audio graph.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hostSrc = join(root, 'scripts', 'recomp', 'host', 'src');
const web = join(root, 'scripts', 'recomp', 'web');
const modelSrc = readFileSync(join(hostSrc, 'host_audio.c'), 'utf8');
const backendSrc = readFileSync(join(hostSrc, 'host_audio_web.c'), 'utf8');

// ---- EM_JS extraction -------------------------------------------------------
// EM_JS(ret, name, (c params), { body });  -- the body is plain JS. Braces are
// matched with string literals skipped, so a "{" inside a message is fine.
function extractEmJs(src) {
  const out = new Map();
  let at = 0;
  for (;;) {
    const i = src.indexOf('EM_JS(', at);
    if (i < 0) break;
    const head = src.slice(i + 6, src.indexOf('{', i));
    const parts = head.split(',');
    const name = parts[1].trim();
    const paramText = head.slice(head.indexOf('(') + 1, head.lastIndexOf(')'));
    const params = paramText.trim() === 'void' || !paramText.trim() ? []
      : paramText.split(',').map((p) => p.trim().split(/[\s*]+/).pop());
    let j = src.indexOf('{', i), depth = 0, inStr = null;
    const start = j;
    for (; j < src.length; j++) {
      const ch = src[j];
      if (inStr) {
        if (ch === '\\') { j++; continue; }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'") { inStr = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) break; }
    }
    out.set(name, { params, body: src.slice(start + 1, j) });
    at = j;
  }
  return out;
}

// ---- a fake WebAudio ----------------------------------------------------------
class FakeNode {
  constructor(ctx) { this.context = ctx; this.outputs = []; this.inputs = new Set(); }
  connect(dst) { this.outputs.push(dst); dst.inputs.add(this); return dst; }
  disconnect() { for (const dst of this.outputs) dst.inputs.delete(this); this.outputs = []; }
}
class FakeGain extends FakeNode {
  constructor(ctx) { super(ctx); this.gain = { value: 1 }; }
}
class FakeBufferSource extends FakeNode {
  constructor(ctx) { super(ctx); this.buffer = null; this.loop = false; this.playbackRate = { value: 1 }; this.started = null; this.stopped = false; }
  start(when = 0, offset = 0) { this.started = { when, offset }; this.context.nodes.push(this); }
  stop() { if (!this.started) throw new Error('InvalidStateError'); this.stopped = true; }
}
class FakeAnalyser extends FakeNode {
  getFloatTimeDomainData(buffer) { buffer.fill(this.context.level(this)); }
}
class FakeContext {
  constructor() {
    this.currentTime = 0; this.state = 'running'; this.sampleRate = 48000;
    this.destination = new FakeNode(this); this.destination.isDestination = true;
    this.nodes = []; this.listeners = {}; this.resumes = 0;
  }
  createGain() { return new FakeGain(this); }
  createBufferSource() { return new FakeBufferSource(this); }
  createAnalyser() { return new FakeAnalyser(this); }
  level(node = this.destination) {
    if (this.state !== 'running') return 0;
    if (node instanceof FakeBufferSource) {
      if (!node.started || node.stopped || this.currentTime < node.started.when) return 0;
      const elapsed = (this.currentTime - node.started.when) * node.playbackRate.value + node.started.offset;
      if (!node.loop && elapsed >= node.buffer.duration) return 0;
      const frame = Math.floor(elapsed * node.buffer.sampleRate) % node.buffer.length;
      return node.buffer.getChannelData(0)[frame];
    }
    let sample = 0;
    for (const input of node.inputs) sample += this.level(input);
    return node instanceof FakeGain ? sample * node.gain.value : sample;
  }
  createBuffer(channels, frames, rate) {
    const ch = Array.from({ length: channels }, () => new Float32Array(frames));
    return { numberOfChannels: channels, length: frames, sampleRate: rate, duration: frames / rate, getChannelData: (c) => ch[c] };
  }
  addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  setState(s) { this.state = s; for (const fn of this.listeners.statechange || []) fn(); }
  resume() { this.resumes += 1; return Promise.resolve(); }
}

// Bind every EM_JS body to one Module/HEAPU8/window and return callables.
function backend({ heap, trace = 0, maxLead = 3 } = {}) {
  const fns = extractEmJs(backendSrc);
  const Module = {};
  const errs = [];
  const err = (s) => errs.push(String(s));
  const window = { AudioContext: FakeContext };
  const HEAPU8 = heap || new Uint8Array(65536);
  const api = {};
  for (const [name, { params, body }] of fns) {
    const f = new Function('Module', 'HEAPU8', 'err', 'window', ...params, body);
    api[name.replace(/^isaac_audio_js_/, '')] = (...args) => f(Module, HEAPU8, err, window, ...args);
  }
  api.init(trace, maxLead);
  api.Module = Module; api.errs = errs; api.HEAPU8 = HEAPU8;
  return api;
}
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

// 100 ms of stereo16 at 48 kHz: 4800 frames, 19200 bytes, written at `ptr`
function stereoChunk(api, id, ptr, frames = 4800, sample = 0x4000) {
  for (let i = 0; i < frames * 2; i++) { api.HEAPU8[ptr + i * 2] = sample & 0xff; api.HEAPU8[ptr + i * 2 + 1] = (sample >> 8) & 0xff; }
  api.buffer(id, ptr, frames * 4, 2, 16, 48000);
  return frames / 48000;
}

test('EM_JS extraction finds every backend entry point with its parameters', () => {
  const fns = extractEmJs(backendSrc);
  for (const n of ['isaac_audio_js_init', 'isaac_audio_js_buffer', 'isaac_audio_js_queue', 'isaac_audio_js_unqueue',
                   'isaac_audio_js_play', 'isaac_audio_js_stop', 'isaac_audio_js_clear', 'isaac_audio_js_gain',
                   'isaac_audio_js_pitch', 'isaac_audio_js_drop', 'isaac_audio_js_state', 'isaac_audio_js_stat'])
    assert.ok(fns.has(n), `${n} extracted`);
  assert.deepEqual(fns.get('isaac_audio_js_play').params, ['src', 'buffer', 'gain', 'pitch', 'looping', 'streaming', 'head', 'offset_sec']);
  assert.deepEqual(fns.get('isaac_audio_js_buffer').params, ['id', 'pcm', 'bytes', 'channels', 'bits', 'freq']);
  assert.deepEqual(fns.get('isaac_audio_js_state').params, []);
});

test('PCM upload: interleaved int16 is de-interleaved into float channels through a master node', () => {
  const api = backend();
  const dur = stereoChunk(api, 1, 1024);
  const A = api.Module.isaacAudio;
  assert.ok(A.ctx && A.master, 'the context and the master gain exist after the first upload');
  assert.deepEqual(A.master.outputs, [A.ctx.destination], 'master -> destination');
  const ab = A.buffers.get(1);
  assert.ok(near(ab.duration, dur), 'duration follows frames / rate');
  assert.ok(near(ab.getChannelData(0)[0], 0.5) && near(ab.getChannelData(1)[4799], 0.5), '0x4000 -> 0.5 on both channels');
  // a negative sample: 0x8000 -> -1
  api.HEAPU8[2048] = 0x00; api.HEAPU8[2049] = 0x80;
  api.buffer(2, 2048, 4, 1, 16, 48000);
  assert.ok(near(A.buffers.get(2).getChannelData(0)[0], -1), 'int16 -32768 -> -1.0');
  api.drop(2);
  assert.ok(!A.buffers.has(2), 'alDeleteBuffers drops the AudioBuffer');
});

test('a streaming queue becomes a chain of nodes started back to back on the context clock', () => {
  const api = backend();
  const d = stereoChunk(api, 1, 1024); stereoChunk(api, 2, 1024); stereoChunk(api, 3, 1024);
  const A = api.Module.isaacAudio, ctx = A.ctx;
  // the engine's order: play on the empty source is not forwarded by the model;
  // the first queued chunk, then play, then the rest queued while playing
  api.queue(10, 1);
  assert.equal(ctx.nodes.length, 0, 'a queued chunk does not play until the source plays');
  api.play(10, 1, 0.6, 1, 0, 1, 0, 0);
  api.queue(10, 2);
  api.queue(10, 3);
  const s = A.sources.get(10);
  assert.equal(s.kind, 'stream');
  assert.equal(ctx.nodes.length, 3, 'three nodes, one per chunk');
  assert.ok(near(ctx.nodes[0].started.when, 0) && near(ctx.nodes[1].started.when, d) && near(ctx.nodes[2].started.when, 2 * d),
    `starts at 0, ${d}, ${2 * d}`);
  assert.ok(near(s.next, 3 * d), 'the chain end is the sum of the durations');
  assert.ok(ctx.nodes.every((n) => n.outputs[0] === s.gain), 'every node feeds the source gain');
  assert.equal(s.gain.gain.value, 0.6, 'the play carried the gain');
  assert.deepEqual(s.gain.outputs, [A.master], 'the source gain feeds the master');
  assert.equal(api.stat(0), 3, 'scheduled census');
  // the wall clock moved on; the model retired the first chunk; the game unqueues it
  ctx.currentTime = 0.15;
  api.unqueue(10, 1);
  assert.equal(s.entries.length, 2, 'bookkeeping dropped');
  assert.ok(!ctx.nodes[0].stopped, 'the node itself was not stopped (it plays out)');
  // the refill lands at the chain end, not at "now"
  api.buffer(1, 1024, 19200, 2, 16, 48000);
  api.queue(10, 1);
  assert.equal(ctx.nodes.length, 4);
  assert.ok(near(ctx.nodes[3].started.when, 3 * d), 'the refilled chunk starts when the previous one ends');
  assert.equal(ctx.nodes[3].buffer, A.buffers.get(1), 'with the freshly uploaded AudioBuffer');
  // gain while playing
  api.gain(10, 0.25);
  assert.equal(s.gain.gain.value, 0.25);
  // stop cancels everything scheduled; a play from the head re-schedules from now
  api.stop(10);
  assert.ok(ctx.nodes.slice(1).every((n) => n.stopped), 'stop cancelled the live chain');
  assert.equal(s.playing, false);
  ctx.currentTime = 0.5;
  api.play(10, 2, 0.25, 1, 0, 1, 0, 0);
  const again = ctx.nodes.slice(4);
  assert.equal(again.length, 3, 'the three still-queued entries are rescheduled');
  assert.ok(near(again[0].started.when, 0.5) && near(again[1].started.when, 0.5 + d) && near(again[2].started.when, 0.5 + 2 * d),
    'from now, back to back');
  // a resume from paused: from entry 1 at an offset
  api.stop(10);
  ctx.currentTime = 1;
  api.play(10, 3, 0.25, 1, 0, 1, 1, 0.04);
  const resumed = ctx.nodes.slice(7);
  assert.equal(resumed.length, 2, 'entries from the head index only');
  assert.ok(near(resumed[0].started.when, 1) && near(resumed[0].started.offset, 0.04), 'the current entry from its offset');
  assert.ok(near(resumed[1].started.when, 1 + d - 0.04), 'the next one when the shortened one ends');
  assert.equal(s.entries[0].done, true, 'the entry before the head is done');
  api.clear(10);
  assert.equal(s.entries.length, 0, 'AL_BUFFER 0 / delete forgets the queue');
  assert.ok(resumed.every((n) => n.stopped), 'and silences it');
});

test('a suspended context defers chunks; the resume schedules what is still pending, from now', () => {
  const api = backend();
  const d = stereoChunk(api, 1, 1024); stereoChunk(api, 2, 1024);
  const A = api.Module.isaacAudio, ctx = A.ctx;
  ctx.setState('suspended');
  api.queue(20, 1);
  api.play(20, 1, 1, 1, 0, 1, 0, 0);
  api.queue(20, 2);
  assert.equal(ctx.nodes.length, 0, 'nothing scheduled while suspended');
  assert.equal(api.stat(2), 2, 'two deferred');
  assert.equal(ctx.resumes, 1, 'the play asked the context to resume');
  // the game moved on: the model retired chunk 1 and the game unqueued it
  api.unqueue(20, 1);
  ctx.currentTime = 7;
  ctx.setState('running');
  assert.equal(ctx.nodes.length, 1, 'only the still-queued chunk is scheduled on resume');
  assert.ok(near(ctx.nodes[0].started.when, 7), 'at the current time, not at a stale chain end');
  assert.equal(ctx.nodes[0].buffer, A.buffers.get(2));
  assert.equal(api.stat(3), 1, 'resumed census');
  assert.ok(near(A.sources.get(20).next, 7 + d));
});

test('a chain that runs too far ahead of the clock is trimmed and re-anchored after the playing chunk', () => {
  const api = backend({ maxLead: 0.25 });
  const d = stereoChunk(api, 1, 1024);
  const A = api.Module.isaacAudio, ctx = A.ctx;
  api.queue(30, 1);
  api.play(30, 1, 1, 1, 0, 1, 0, 0);
  for (let i = 0; i < 3; i++) api.queue(30, 1);      // 0.1, 0.2, then 0.3 > 0.25 ahead
  const s = A.sources.get(30);
  assert.equal(api.stat(1), 2, 'the two not-yet-started nodes were trimmed');
  assert.ok(ctx.nodes[1].stopped && ctx.nodes[2].stopped && !ctx.nodes[0].stopped, 'the playing one stays');
  assert.ok(near(ctx.nodes[3].started.when, d), 'the new chunk starts when the playing one ends, not on top of it');
  assert.ok(near(s.next, 2 * d));
  assert.equal(s.entries.filter((e) => e.done).length, 2, 'trimmed entries are done until a play rewinds them');
});

test('static sources: one node per play, loop, pitch, restart, stop', () => {
  const api = backend();
  stereoChunk(api, 1, 1024);
  const A = api.Module.isaacAudio, ctx = A.ctx;
  api.play(40, 1, 0.3, 1.5, 1, 0, 0, 0);
  const s = A.sources.get(40);
  assert.equal(s.kind, 'static');
  assert.equal(ctx.nodes.length, 1);
  assert.ok(ctx.nodes[0].loop === true && near(ctx.nodes[0].playbackRate.value, 1.5) && near(s.gain.gain.value, 0.3));
  assert.equal(ctx.nodes[0].outputs[0], s.gain);
  api.pitch(40, 2);
  assert.ok(near(ctx.nodes[0].playbackRate.value, 2), 'a pitch change reaches the live node');
  api.play(40, 1, 0.3, 1, 0, 0, 0, 0.02);
  assert.ok(ctx.nodes[0].stopped, 'a replay stops the previous node');
  assert.ok(near(ctx.nodes[1].started.offset, 0.02) && ctx.nodes[1].loop === false, 'the new node from its offset');
  api.stop(40);
  assert.ok(ctx.nodes[1].stopped);
  api.play(40, 99, 1, 1, 0, 0, 0, 0);
  assert.equal(ctx.nodes.length, 2, 'an unknown buffer plays nothing and throws nothing');
  assert.equal(api.stat(4), 2, 'played census counts the two real plays');
});

test('the backend never throws into the guest and reports the context state', () => {
  const api = backend();
  assert.equal(api.state(), 0, 'no context yet');
  assert.doesNotThrow(() => { api.queue(1, 1); api.play(1, 1, 1, 1, 0, 1, 0, 0); api.stop(1); api.unqueue(1, 3); api.gain(1, 1); });
  stereoChunk(api, 1, 1024);
  assert.equal(api.state(), 1, 'running');
  api.Module.isaacAudio.ctx.setState('suspended');
  assert.equal(api.state(), 2, 'suspended');
  const noAudio = (() => {
    const fns = extractEmJs(backendSrc);
    const { params, body } = fns.get('isaac_audio_js_init');
    const Module = {};
    new Function('Module', 'HEAPU8', 'err', 'window', ...params, body)(Module, new Uint8Array(16), () => {}, {}, 0, 3);
    const b = fns.get('isaac_audio_js_buffer');
    return () => new Function('Module', 'HEAPU8', 'err', 'window', ...b.params, b.body)(Module, new Uint8Array(16), () => {}, {}, 1, 0, 4, 1, 16, 48000);
  })();
  assert.doesNotThrow(noAudio, 'a page with no AudioContext at all stays silent, not broken');
});

test('trace: the JS side logs schedules under the same switch as the model', () => {
  const api = backend({ trace: 1 });
  stereoChunk(api, 1, 1024);
  api.queue(50, 1); api.play(50, 1, 1, 1, 0, 1, 0, 0);
  assert.ok(api.errs.some((l) => /\[isaac\]\[audio-web\] .*context ready: 48000 Hz, running/.test(l)), 'context line');
  assert.ok(api.errs.some((l) => /src 50 buffer 1 scheduled at 0\.000 for 0\.100 s/.test(l)), 'one line per scheduled chunk with time and duration');
  assert.ok(api.errs.some((l) => /src 50 play stream from entry 0 of 1/.test(l)), 'the play line');
  assert.ok(backendSrc.includes('isaac_audio_js_init(isaac_audio_trace_on(), lead)'), 'the C side passes ISAAC_AUDIO_TRACE through');
  assert.ok(modelSrc.includes('getenv("ISAAC_AUDIO_TRACE")') && modelSrc.includes('int isaac_audio_trace_on(void)'), 'the model owns the switch');
});

test('the model follows OpenAL Soft where the music path needs it (source pins + the native selftest)', () => {
  // the streaming contract between the model and its backends
  for (const hook of ['isaac_audio_backend_queue(uint32_t src, uint32_t buffer)', 'isaac_audio_backend_unqueue(uint32_t src, uint32_t n)',
                      'isaac_audio_backend_clear(uint32_t src)', 'isaac_audio_backend_pitch(uint32_t src, float pitch)',
                      'int looping, int streaming, uint32_t head, float offset_sec'])
    assert.ok(modelSrc.includes(hook), `weak hook: ${hook}`);
  assert.ok(modelSrc.includes('__attribute__((weak)) double isaac_audio_clock_ms(void)'), 'the clock is overridable (the selftest sets it)');
  // the rules, by their code
  assert.ok(/case AL_BUFFERS_QUEUED:\s+return \(int32_t\)s->qn;/.test(modelSrc), 'AL_BUFFERS_QUEUED is the whole queue');
  assert.ok(/void isaac_audio_stop[\s\S]*?s->processed = s->qn;/.test(modelSrc), 'a stop marks every queued buffer processed');
  assert.ok(/void isaac_audio_play[\s\S]*?s->processed = 0;[\s\S]*?s->state = AL_STOPPED;\s+\+\+g_stat_empty_plays;/.test(modelSrc),
    'a play restarts at the head, and stops at once with nothing to play');
  assert.ok(/uint32_t isaac_audio_unqueue[\s\S]*?if \(n > s->processed\) \{/.test(modelSrc), 'an unqueue past the processed count takes nothing');
  assert.ok(/case AL_BUFFER:[\s\S]*?if \(s->state == AL_PLAYING \|\| s->state == AL_PAUSED\) \{/.test(modelSrc), 'AL_BUFFER is refused on a playing/paused source');
  assert.ok(modelSrc.includes('isaac_audio_backend_queue(src, id);') && modelSrc.includes('isaac_audio_backend_unqueue(src, take);'),
    'every queue and unqueue reaches the backend');
  // the web backend is entirely under ISAAC_WEB and defines every strong hook
  assert.ok(backendSrc.includes('#ifdef ISAAC_WEB') && backendSrc.trimEnd().endsWith('#endif /* ISAAC_WEB */'));
  for (const h of ['isaac_audio_backend_queue', 'isaac_audio_backend_unqueue', 'isaac_audio_backend_clear', 'isaac_audio_backend_play',
                   'isaac_audio_backend_pitch', 'isaac_audio_backend_gain', 'isaac_audio_backend_stop'])
    assert.ok(new RegExp(`^void ${h}\\(`, 'm').test(backendSrc), `strong web hook ${h}`);
  // the native selftest ran the model on the fake clock
  const json = join(root, 'output', 'recomp', 'host', 'build-selftest.json');
  if (!existsSync(json)) return;
  const b = JSON.parse(readFileSync(json, 'utf8'));
  const audio = (b.run.output || []).filter((l) => /^(ok|FAIL) {2,}audio: /.test(l));
  assert.ok(audio.length >= 18, `the selftest ran the audio section (${audio.length} checks)`);
  assert.deepEqual(audio.filter((l) => l.startsWith('FAIL')), [], 'and every audio check passed');
  for (const want of ['a play with nothing queued stops at once', 'a stop marks every queued buffer processed',
                      'a play from stopped restarts at the head of the queue', 'AL_BUFFERS_QUEUED still counts the whole queue',
                      'resumes the current entry at its offset'])
    assert.ok(audio.some((l) => l.includes(want)), `selftest: ${want}`);
});


// Execute the production graph and page lifecycle, replacing only browser I/O.
// No Wasm payload or private deployment fixture is needed.
function pageAudio(api, hooks = {}) {
  const source = readFileSync(join(web, 'boot_web.mjs'), 'utf8');
  const start = source.indexOf('let audioTap = null;');
  const end = source.indexOf("window.addEventListener('keydown'", start);
  const window = {}, timers = new Set();
  new Function('cfg', 'hooks', 'window', 'setInterval', 'clearInterval', 'log', source.slice(start, end))(
    api.Module, hooks, window, (fn) => { timers.add(fn); return fn; },
    (fn) => timers.delete(fn), (line) => api.errs.push(line));
  return window;
}

async function loadingPage(search = '', {
  received = 0, total = 1000, bootReceived = received, bootTotal = total,
  portable = true, knownTotals = true, holdCompilation = false,
} = {}) {
  const elements = new Map(), intervals = [], frames = [], words = new Map(), events = new Map(), injectedKeys = [];
  const memoryReads = new Set(), main = { appendChild(element) { element.parentElement = main; } };
  let now = 0, readTouchState;
  const downloaded = { received, total };
  const bootstrap = { received: bootReceived, total: bootTotal };
  // A valid empty module with a custom section keeps the served fixture at 100 bytes.
  const moduleBytes = new Uint8Array(100);
  moduleBytes.set([0, 97, 115, 109, 1, 0, 0, 0, 0, 90, 0]);
  const manifest = knownTotals ? { files: [{ path: 'boot.wasm', size: 100 }, { path: 'isaac.segs.bin', size: 600 }] } : null;
  const index = knownTotals ? [{ p: 'resources/packed/graphics.a', s: 300 }] : [];
  const responses = new Map([
    ['/dist.json', JSON.stringify(manifest)], ['/instance_index.json', JSON.stringify(index)],
    ['/boot.wasm', moduleBytes],
    ['/isaac.segs.bin', new Uint8Array(600)], ['/instance/resources/packed/graphics.a', new Uint8Array(300)],
  ]);
  let compilationStarted, finishCompilation, moduleDelivered;
  const compiling = new Promise((resolve) => { compilationStarted = resolve; });
  const compilation = new Promise((resolve) => { finishCompilation = resolve; });
  const moduleDownloaded = new Promise((resolve) => { moduleDelivered = resolve; });
  if (!holdCompilation) finishCompilation();
  const document = {
    hidden: false,
    getElementById: (id) => elements.get(id),
    createElement: () => ({ getContext: (kind) => kind === 'webgl2' ? { getExtension: () => null } : null }),
    addEventListener() {},
  };
  const html = readFileSync(join(web, 'play.html'), 'utf8');
  for (const [, tag, id] of html.matchAll(/(<[^>]*\bid="([^"]+)"[^>]*>)/g)) {
    const classes = new Set(), listeners = new Map();
    const attributes = new Map([...tag.matchAll(/\b([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
    const element = {
      hidden: /\bhidden\b/.test(tag), open: false, style: {}, textContent: '', title: '',
      classList: {
        add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name),
        toggle: (name, force = !classes.has(name)) => {
          if (force) classes.add(name); else classes.delete(name);
          return force;
        },
      },
      setAttribute: (key, value) => attributes.set(key, String(value)),
      removeAttribute: (key) => attributes.delete(key),
      getAttribute: (key) => attributes.get(key) ?? null,
      addEventListener: (event, fn) => listeners.set(event, fn),
      focus: () => { document.activeElement = element; },
      getContext: () => null,
      closest: (selector) => selector === 'main' ? main : null,
      click: () => listeners.get('click')?.(),
    };
    elements.set(id, element);
  }
  const window = {
    AudioContext: FakeContext,
    __isaacPortableData: {},
    isaacPortable: portable ? {
      manifest, index, chunks: 4,
      progress: (scope) => ({ ...(scope === 'boot' ? bootstrap : downloaded) }),
      bytesFor: async (rel) => rel === 'boot.wasm' ? moduleBytes : new Uint8Array(),
    } : null,
    isaacGuest: {
      u32: (address) => { memoryReads.add(address); return words.get(address) || 0; },
      u8: (address) => { memoryReads.add(address); return (words.get(address) || 0) & 255; },
    },
    addEventListener: (event, fn) => events.set(event, fn),
    isaacFrame: 0,
    isaacInjectKey: (...args) => injectedKeys.push(args),
  };
  const makeMenu = () => ({
    open: false, isOpen() { return this.open; }, setFps() {}, setScreen() {},
  });
  const editMenu = makeMenu(), modsMenu = makeMenu();
  const context = {
    window, document, location: new URL(`https://game.invalid/play.html${search}`), navigator: {},
    URL, URLSearchParams, TextEncoder, TextDecoder, performance: { now: () => now },
    console,
    WebAssembly: {
      Suspending: function () {},
      promising: (fn) => fn,
      async instantiate(bytes, imports) {
        compilationStarted();
        await compilation;
        return WebAssembly.instantiate(bytes, imports);
      },
      async instantiateStreaming(response, imports) {
        compilationStarted();
        await compilation;
        return WebAssembly.instantiateStreaming(response, imports);
      },
    },
    fetch: async (url) => {
      const path = new URL(url, 'https://game.invalid/').pathname;
      if (!responses.has(path)) throw new Error(`unexpected page fetch: ${path}`);
      const response = new Response(responses.get(path), { headers: { 'Content-Type': path.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' } });
      if (path === '/boot.wasm') {
        const clone = response.clone.bind(response);
        response.clone = () => {
          const reader = clone().body.getReader();
          return { body: { getReader: () => ({
            async read() {
              const next = await reader.read();
              if (next.done) moduleDelivered();
              return next;
            },
          }) } };
        };
      }
      return response;
    },
    requestAnimationFrame: (fn) => frames.push(fn),
    setInterval: (fn, ms) => { intervals.push({ fn, ms, next: now + ms }); },
    createEditFileMenu: () => editMenu, createPaperMenu: () => ({}), createModsMenu: () => modsMenu,
    createMenuTag: () => ({ setShown() {}, hit: () => false }),
    createModBrowser: () => ({ isOpen: () => false }),
    createTouchControls: ({ readState }) => { readTouchState = readState; return { destroy() {} }; },
  };
  const source = readFileSync(join(web, 'play.mjs'), 'utf8')
    .replace(/^import .+ from '.+';\r?$/gm, '')
    .replace("import('./boot_web.mjs')", 'Promise.resolve()');
  await new Script(`(async () => {\n${source}\n})()`).runInNewContext(context);
  const paint = () => { for (const fn of frames.splice(0)) fn(now); };
  return {
    window, elements, words, memoryReads, injectedKeys, hooks: window.isaacPageHooks,
    readTouchState, editMenu, modsMenu,
    paint, compiling, finishCompilation, moduleDownloaded,
    instantiate: () => new Promise((resolve) => window.isaacPageHooks.instantiateWasm({}, (instance, module) => resolve({ instance, module }))),
    download(bytes, scope = 'all') {
      (scope === 'boot' ? bootstrap : downloaded).received = bytes;
      window.__isaacPortableData.onProgress?.();
    },
    error: () => events.get('error')({ message: 'engine failed before readiness' }),
    menu: (screen = 1, manager = 0x1000) => { words.set(0x00c72a20, manager); words.set(manager + 0x40, screen); },
    cutscene({ shell = 0x500000, state = 3, loaded = 1, id = 1 } = {}) {
      words.set(0x00c7169c, shell);
      words.set(shell + 8, state);
      words.set(shell + 0x20dd0, loaded);
      words.set(shell + 0x215d8, id);
    },
    advance(frame, { paint: flushPaint = true } = {}) {
      window.isaacFrame = frame;
      now += 500;
      for (const timer of intervals) if (now >= timer.next) { timer.next += timer.ms; timer.fn(); }
      if (flushPaint) paint();
    },
  };
}

function assertStartupProgress(page, percent) {
  const bar = page.elements.get('bar'), percentage = page.elements.get('percentage');
  assert.equal(bar.classList.contains('indeterminate'), false);
  assert.equal(percentage.hidden, false);
  assert.equal(bar.getAttribute('role'), 'progressbar');
  assert.match(bar.getAttribute('aria-label'), /startup/i);
  assert.equal(bar.getAttribute('aria-valuemin'), '0');
  assert.equal(bar.getAttribute('aria-valuemax'), '100');
  assert.equal(bar.getAttribute('aria-valuenow'), String(percent));
  const valueText = bar.getAttribute('aria-valuetext');
  assert.match(valueText, /startup/i);
  assert.equal(Number(/(\d+)%/.exec(valueText)?.[1]), percent);
  assert.equal(percentage.textContent, `${percent}%`);
  assert.equal(percentage.style.backgroundPosition, `${-percent * 50}px 0px`);
  assert.equal(Number.parseFloat(page.elements.get('bar-fill').style.width), percent);
}

function assertInitializing(page) {
  const bar = page.elements.get('bar');
  assert.equal(bar.classList.contains('indeterminate'), true);
  assert.equal(bar.getAttribute('aria-valuenow'), null);
  assert.equal(page.elements.get('percentage').hidden, true);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(page.elements.get('overlay').getAttribute('aria-busy'), 'true');
}

test('bootstrap progress is fractional and ignores background downloads, chunk counts and logs', async () => {
  const page = await loadingPage('', { total: 4000, bootTotal: 1000 });
  page.paint();
  assertStartupProgress(page, 0);
  page.download(371, 'boot');
  page.download(371);
  page.paint();
  assertStartupProgress(page, 9);
  page.download(3000);
  page.window.__isaacPortableData.onChunk(4, 4);
  for (const line of [
    '=== layout ===', '=== host boot (IAT + TEB + TLS + _initterm) ===',
    '=== main @ 0x00931050 ===', 'isaac_boot_init -> 0',
  ]) page.hooks.onLog(line);
  for (const frame of [1, 100, 1000]) page.advance(frame);
  assertStartupProgress(page, 9);
  page.download(754, 'boot');
  page.paint();
  assertStartupProgress(page, 18);
  page.download(999, 'boot');
  page.paint();
  assertStartupProgress(page, 24);
  page.download(1000, 'boot');
  page.paint();
  assertStartupProgress(page, 25);
  page.download(1100, 'boot');
  page.paint();
  assertStartupProgress(page, 25);
  assert.equal(page.elements.get('overlay').hidden, false);
});

test('bootstrap delivery and compilation retain measured progress until native initialization starts', async () => {
  const page = await loadingPage('', { received: 1000, holdCompilation: true });
  page.paint();
  assertStartupProgress(page, 25);
  const instantiated = page.instantiate();
  await page.compiling;
  page.paint();
  assertStartupProgress(page, 25);
  page.finishCompilation();
  await instantiated;
  page.paint();
  assertStartupProgress(page, 50);
  page.hooks.onLog('=== host boot (IAT + TEB + TLS + _initterm) ===');
  page.hooks.onLog('=== main @ 0x00931050 ===');
  page.hooks.onLog('isaac_boot_init -> 0');
  page.paint();
  assertStartupProgress(page, 50);
  await page.hooks.beforeMain({});
  assertInitializing(page);
});

test('served startup uses fixed boot-file totals and waits for streaming instantiation', async () => {
  const page = await loadingPage('', { portable: false, holdCompilation: true });
  page.paint();
  assertStartupProgress(page, 0);
  await page.hooks.fetchBytes('/isaac.segs.bin');
  page.paint();
  assertStartupProgress(page, 15);
  page.hooks.onLog('=== layout ===');
  page.hooks.onLog('=== host boot (IAT + TEB + TLS + _initterm) ===');
  page.paint();
  assertStartupProgress(page, 15);
  await page.hooks.fetchBytes('/instance/resources/packed/graphics.a');
  page.paint();
  assertStartupProgress(page, 22);
  const instantiated = page.instantiate();
  await page.moduleDownloaded;
  await page.compiling;
  page.paint();
  assertStartupProgress(page, 25);
  page.finishCompilation();
  await instantiated;
  page.paint();
  assertStartupProgress(page, 50);
  await page.hooks.beforeMain({});
  assertInitializing(page);
});

test('inline delivery still requires compilation, CRT and native readiness before completion or audio', async () => {
  const page = await loadingPage('', { received: 0, total: 0, holdCompilation: true }), api = backend();
  pageAudio(api, page.hooks);
  page.paint();
  assertStartupProgress(page, 25);
  const instantiated = page.instantiate();
  await page.compiling;
  page.paint();
  assertStartupProgress(page, 25);
  page.finishCompilation();
  await instantiated;
  page.paint();
  assertStartupProgress(page, 50);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  for (const frame of [1, 3, 20]) page.advance(frame);
  assertInitializing(page);
  assert.equal(ctx.level(), 0);
  page.cutscene();
  page.advance(21);
  page.advance(22);
  assertInitializing(page);
  assert.equal(ctx.level(), 0);
  page.advance(23, { paint: false });
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

test('manual Play switches from waiting progress to immediate activity, then restores ready progress', async () => {
  const page = await loadingPage('?autoplay=0', { received: 1000 });
  await page.instantiate();
  let started = false;
  const starting = page.hooks.beforeMain({}).then(() => { started = true; });
  page.paint();
  assertStartupProgress(page, 75);
  assert.equal(page.elements.get('play').hidden, false);
  assert.equal(page.elements.get('overlay').getAttribute('aria-busy'), 'false');
  assert.equal(started, false);
  page.menu();
  for (const frame of [1, 2, 3]) page.advance(frame);
  assertStartupProgress(page, 75);
  assert.equal(page.elements.get('overlay').hidden, false);
  page.elements.get('play').click();
  assertInitializing(page);
  assert.equal(page.elements.get('play').hidden, true);
  assert.equal(started, false, 'activity begins before main resumes or another paint runs');
  await starting;
  assert.equal(started, true);
  page.advance(4);
  page.advance(5);
  assertInitializing(page);
  page.advance(6, { paint: false });
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.equal(page.elements.get('overlay').getAttribute('aria-busy'), 'false');
  assert.deepEqual(page.injectedKeys, []);
});

test('a fully downloaded payload stays indeterminate through early frames until stable native readiness', async () => {
  const page = await loadingPage('', { received: 1000 });
  await page.instantiate();
  await page.hooks.beforeMain({});
  assertInitializing(page);
  for (const frame of [1, 3, 20]) page.advance(frame);
  assertInitializing(page);
  page.menu();
  page.advance(21);
  page.advance(22);
  assertInitializing(page);
  page.download(1000);
  page.advance(23, { paint: false });
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
  page.paint();
  assertStartupProgress(page, 100);
});

test('a build that ships its boot trail shows the boot reading through it, and never goes back', async () => {
  const page = await loadingPage('', { received: 1000, total: 4000, bootReceived: 1000, bootTotal: 1000 });
  // the boot reads the trail's windows (3000 bytes here); the page counts what it has read
  page.window.__isaacPortableData.trail = [['resources/packed/music.a', 0, 2000], ['resources/packed/videos.a', 0, 1000]];
  let read = 0;
  page.window.isaacLazyStats = () => ({ windowBytes: read, windows: 0 });
  await page.instantiate();
  await page.hooks.beforeMain({});
  page.advance(1);
  // the download done (1000 of 4000 bytes in all), both work steps done, nothing read yet
  assertStartupProgress(page, Math.floor(100 * (0.9 * 1000 / 4000 + 0.1)));
  read = 1500;
  page.advance(2);
  assertStartupProgress(page, Math.floor(100 * (0.9 * 2500 / 4000 + 0.1)));
  read = 9000;                                   // more than the trail: it is capped
  page.advance(3);
  assertStartupProgress(page, 99);
  read = 0;                                      // a counter that went back cannot move the bar back
  page.advance(4);
  assertStartupProgress(page, 99);
  page.menu();
  page.advance(5);
  page.advance(6);
  page.advance(7, { paint: false });
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
});

test('background downloads preserve native activity and cannot lower completed startup', async () => {
  const page = await loadingPage('', { received: 1000, total: 4000, bootReceived: 1000, bootTotal: 1000 });
  await page.instantiate();
  await page.hooks.beforeMain({});
  page.download(2400);
  page.window.__isaacPortableData.onChunk(4, 4);
  page.hooks.onLog('isaac_boot_init -> 0');
  page.paint();
  assertInitializing(page);
  page.cutscene();
  page.advance(1);
  page.advance(2);
  assertInitializing(page);
  page.advance(3, { paint: false });
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
  page.download(3000);
  page.paint();
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
});

test('unknown served totals earn no delivery progress but native readiness still completes startup', async () => {
  const page = await loadingPage('', { portable: false, knownTotals: false });
  page.paint();
  assertStartupProgress(page, 0);
  await page.instantiate();
  await page.moduleDownloaded;
  page.paint();
  assertStartupProgress(page, 25);
  await page.hooks.beforeMain({});
  assertInitializing(page);
  page.menu();
  page.advance(1);
  page.advance(2);
  assertInitializing(page);
  page.advance(3, { paint: false });
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
});

function playTone(api, gain = 0.6) {
  stereoChunk(api, 1, 1024);
  api.play(10, 1, gain, 1, 1, 0, 0, 0);
  return api.Module.isaacAudio.ctx;
}

test('loading keeps mixer energy but silences output until a stable native menu is visible', async () => {
  const page = await loadingPage('', { received: 371, total: 1000 }), api = backend(), meter = pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  page.hooks.onLog('=== main @ 0x00931050 ===');
  for (const frame of [1, 3, 20]) page.advance(frame);
  assert.equal(page.elements.get('overlay').hidden, false, 'early presentations are not readiness');
  assert.ok(near(meter.isaacAudioLevel().rmsNow, 0.3), 'real PCM still reaches the mixer analyser');
  assert.equal(ctx.level(), 0, 'no PCM reaches the destination under the loader');
  page.menu();
  // The native title already allocates Game and Room, but has not begun a run.
  page.words.set(0x00c71678, 0x100000);
  page.words.set(0x100000 + 0x18300, 0x200000);
  page.advance(21);
  page.advance(22);
  assert.equal(ctx.level(), 0, 'one later presentation is not stable readiness');
  page.advance(23);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.equal(page.elements.get('overlay').getAttribute('aria-busy'), 'false');
  assert.ok(near(ctx.level(), 0.3), 'the same source becomes audible without restarting');
  page.download(826);
  page.advance(24);
  assert.equal(page.elements.get('overlay').hidden, true, 'background progress does not cover the ready game');
  api.gain(10, 0.25);
  assert.ok(near(ctx.level(), 0.125), 'normal volume still controls output');
  api.stop(10);
  assert.equal(ctx.level(), 0, 'normal pause still silences output');
  api.play(10, 1, 0.25, 1, 1, 0, 0, 0);
  assert.ok(near(ctx.level(), 0.125), 'normal resume restores output');
  ctx.setState('suspended');
  assert.equal(ctx.level(), 0);
  ctx.setState('running');
  assert.ok(near(ctx.level(), 0.125), 'context unlock does not reset the ready output gate');
});

test('loaded native cutscene reveals and unmutes after two new presentations without input or logs', async () => {
  const page = await loadingPage('', { received: 381, total: 1000 }), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  page.advance(40);
  assert.equal(page.elements.get('overlay').hidden, false, 'blank presentations do not reveal the game');
  assert.equal(ctx.level(), 0);
  page.cutscene();
  page.advance(41);
  page.advance(42);
  assert.equal(page.elements.get('overlay').hidden, false, 'a loaded entry still needs two later presentations');
  assert.equal(ctx.level(), 0);
  page.advance(43);
  assert.equal(page.elements.get('overlay').hidden, true, 'the intro does not need a menu manager');
  assert.equal(page.elements.get('overlay').getAttribute('aria-busy'), 'false');
  assert.ok(near(ctx.level(), 0.3), 'the playing intro becomes audible without restarting its source');
  assert.deepEqual(page.injectedKeys, [], 'readiness never sends a key to skip the intro');
});

for (const [name, native] of [
  ['missing shell manager', { shell: 0 }],
  ['inactive shell state', { state: 2 }],
  ['entry load still pending', { loaded: 0 }],
  ['entry state other than loaded', { loaded: 2 }],
  ['zero cutscene ID', { id: 0 }],
]) {
  test(`${name} keeps the native cutscene covered and muted`, async () => {
    const page = await loadingPage(), api = backend();
    pageAudio(api, page.hooks);
    await page.hooks.beforeMain(api.Module);
    const ctx = playTone(api);
    page.cutscene(native);
    if ('loaded' in native || 'id' in native) page.menu();
    for (const frame of [40, 41, 42]) page.advance(frame);
    assert.equal(page.elements.get('overlay').hidden, false, 'an incomplete active cutscene cannot borrow retained menu readiness');
    assert.equal(ctx.level(), 0);
  });
}

test('a loaded cutscene takes precedence over retained run state', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api), game = 0x100000;
  page.menu(5);
  page.words.set(0x00c71678, game);
  page.words.set(game + 0x1b83c, 1);
  page.words.set(game + 0x264f8, 10);
  page.cutscene();
  page.advance(1);
  page.advance(2);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0);
  page.advance(3);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3), 'the active native view is the loaded cutscene, not the retained run');
});

test('stalled and reset presentations cannot reveal a loaded cutscene early', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  page.cutscene();
  for (const frame of [10, 10, 10, 11]) page.advance(frame);
  assertInitializing(page);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0, 'timer polls do not count as new presentations');
  for (const frame of [1, 1, 2]) page.advance(frame);
  assertInitializing(page);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0, 'a reset presentation counter restarts the gate');
  page.advance(3);
  assertStartupProgress(page, 100);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

test('changing cutscene identity restarts presentation stabilization', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  page.cutscene();
  page.advance(1);
  page.advance(2);
  page.cutscene({ id: 2 });
  page.advance(3);
  page.advance(4);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0, 'another cutscene ID cannot inherit the previous entry presentations');
  page.cutscene({ shell: 0x600000, id: 2 });
  page.advance(5);
  page.advance(6);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0, 'a replacement shell cannot inherit the previous object presentations');
  page.advance(7);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

test('an interrupted cutscene entry load discards earlier ready presentations', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  page.cutscene();
  page.advance(1);
  page.advance(2);
  page.cutscene({ loaded: 0 });
  page.advance(3);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0);
  page.cutscene();
  page.advance(4);
  page.advance(5);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0, 'the completed load needs two new presentations');
  page.advance(6);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

test('audio initialized or recreated after cutscene readiness starts audible; raw boot needs no page hook', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  page.cutscene();
  for (const frame of [1, 2, 3]) page.advance(frame);
  assert.equal(page.elements.get('overlay').hidden, true);
  const ctx = playTone(api);
  assert.ok(near(ctx.level(), 0.3), 'readiness before the first buffer is retained');
  ctx.setState('closed');
  const replacement = backend();
  replacement.Module.isaacAudioReady = api.Module.isaacAudioReady;
  assert.ok(near(playTone(replacement).level(), 0.3), 'a replacement context inherits readiness');
  const raw = backend();
  pageAudio(raw);
  assert.ok(near(playTone(raw).level(), 0.3), 'the raw boot harness remains audible');
});

test('unlock and replacement audio contexts remain silent before native readiness', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api);
  ctx.setState('suspended');
  ctx.resume();
  ctx.setState('running');
  assert.equal(ctx.level(), 0, 'user activation is not native readiness');
  ctx.setState('closed');
  const replacement = backend();
  replacement.Module.isaacAudioReady = api.Module.isaacAudioReady;
  const next = playTone(replacement);
  assert.equal(next.level(), 0);
  page.menu();
  for (const frame of [1, 2, 3]) page.advance(frame);
  assert.ok(near(next.level(), 0.3), 'readiness opens the current context, not its predecessor');
});

for (const failure of ['error', 'ended']) {
  test(`${failure} before readiness stops startup activity and keeps existing and delayed audio silent`, async () => {
    const page = await loadingPage(), api = backend();
    pageAudio(api, page.hooks);
    await page.hooks.beforeMain(api.Module);
    const ctx = playTone(api);
    page.cutscene();
    page.advance(1);
    page.advance(2);
    assertInitializing(page);
    if (failure === 'error') page.error();
    else {
      page.window.isaacDone = { mainRc: 0, presented: 2 };
      page.advance(3, { paint: false });
    }
    assert.equal(page.elements.get('bar').classList.contains('indeterminate'), false);
    assert.equal(page.elements.get('overlay').getAttribute('aria-busy'), 'false');
    page.download(1000);
    page.window.__isaacPortableData.onChunk(4, 4);
    for (const frame of [4, 5, 6]) page.advance(frame);
    assert.equal(page.elements.get('bar').classList.contains('indeterminate'), false, 'later renders cannot restart failed initialization');
    assert.notEqual(page.elements.get('bar').getAttribute('aria-valuenow'), '100');
    assert.equal(page.elements.get('overlay').hidden, false);
    assert.equal(ctx.level(), 0);
    ctx.setState('closed');
    const replacement = backend();
    replacement.Module.isaacAudioReady = api.Module.isaacAudioReady;
    assert.equal(playTone(replacement).level(), 0, 'later initialization does not bypass the failed loader');
  });
}

test('screen-5 character selection opens output after stable presentations without a run', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api), game = 0x100000, players = 0x300000;
  page.menu(5);
  page.words.set(0x00c71678, game);
  page.words.set(game + 0x18300, 0x200000);
  page.words.set(game + 0x1baa8, players);
  page.words.set(game + 0x1baac, players);
  page.advance(1);
  page.advance(2);
  assert.equal(page.elements.get('overlay').hidden, false);
  assert.equal(ctx.level(), 0, 'character selection still needs two later presentations');
  page.advance(3);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3), 'allocated Game and an empty player vector do not block the menu');
  const state = page.readTouchState();
  assert.equal(state.ready, true);
  assert.equal(state.running, false, 'menu 5 alone cannot enable gameplay controls');
  assert.equal(state.twins, false);
});

test('a starting run overrides a retained menu before its first game frame', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api), game = 0x100000, room = 0x200000, players = 0x300000, player = 0x400000;
  page.menu(5);
  for (const [address, value] of [[0x00c71678, game], [game + 0x18300, room],
    [game + 0x1baa8, players], [game + 0x1baac, players + 4], [players, player],
    [player + 0x28, 1], [room + 0xc, 13], [room + 0x10, 7]]) page.words.set(address, value);
  for (const frame of [1, 2, 3]) page.advance(frame);
  assert.equal(page.elements.get('overlay').hidden, false, 'a starting run cannot borrow retained menu readiness');
  assert.equal(ctx.level(), 0, 'nonempty players with gameFrame 0 are not ready');
  page.menu(1);
  page.words.set(game + 0x1b83c, 1);
  page.words.set(game + 0x264f8, 10);
  for (const frame of [4, 5, 6]) page.advance(frame);
  assert.equal(ctx.level(), 0, 'a transitioning run takes precedence over any retained menu');
  page.words.set(game + 0x1b83c, 0);
  for (const frame of [7, 8, 9]) {
    page.words.set(game + 0x264f8, frame + 10);
    page.advance(frame);
    if (frame < 9) assert.equal(ctx.level(), 0, 'the room must still stabilize after transition');
  }
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

test('live-room readiness rejects dead players, stalled game frames and room transitions', async () => {
  const page = await loadingPage(), api = backend();
  pageAudio(api, page.hooks);
  await page.hooks.beforeMain(api.Module);
  const ctx = playTone(api), game = 0x100000, room = 0x200000, players = 0x300000, player = 0x400000;
  page.menu(5);
  for (const [address, value] of [[0x00c71678, game], [game + 0x18300, room],
    [game + 0x1baa8, players], [game + 0x1baac, players + 4], [players, player],
    [player + 0x28, 1], [player + 0x173, 1], [room + 0xc, 13], [room + 0x10, 7],
    [game + 0x264f8, 10]]) page.words.set(address, value);
  for (const frame of [1, 2, 3]) page.advance(frame);
  assert.equal(ctx.level(), 0, 'a dead player is not a playable room');
  page.words.set(player + 0x173, 0);
  for (const frame of [4, 5, 6]) page.advance(frame);
  assert.equal(ctx.level(), 0, 'presentations without advancing game frames do not reveal the room');
  page.words.set(game + 0x264f8, 11);
  page.advance(7);
  page.words.set(game + 0x18304, 1);
  page.words.set(game + 0x264f8, 12);
  page.advance(8);
  assert.equal(ctx.level(), 0, 'a changed room identity restarts stabilization');
  page.words.set(game + 0x264f8, 13);
  page.advance(9);
  assert.equal(ctx.level(), 0);
  page.words.set(game + 0x264f8, 14);
  page.advance(10);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

test('manual Play and a reset presentation counter cannot bypass readiness', async () => {
  const page = await loadingPage('?autoplay=0'), api = backend();
  pageAudio(api, page.hooks);
  const starting = page.hooks.beforeMain(api.Module), ctx = playTone(api);
  page.menu();
  for (const frame of [1, 2, 3]) page.advance(frame);
  assert.equal(page.elements.get('play').hidden, false);
  assert.equal(page.elements.get('overlay').hidden, false, 'native state cannot reveal the game before Play');
  assert.equal(ctx.level(), 0);
  page.elements.get('play').click();
  await starting;
  page.advance(10);
  page.advance(1);
  page.advance(2);
  assert.equal(ctx.level(), 0, 'a reset frame counter restarts stabilization');
  page.advance(3);
  assert.equal(page.elements.get('overlay').hidden, true);
  assert.ok(near(ctx.level(), 0.3));
});

async function liveTouchPage() {
  const page = await loadingPage();
  await page.hooks.beforeMain({});
  const game = 0x100000, room = 0x200000, players = 0x300000, player = 0x400000, shell = 0x500000;
  page.menu(5);
  for (const [address, value] of [
    [0x00c71678, game], [0x00c7169c, shell], [game + 0x18300, room],
    [game + 0x1baa8, players], [game + 0x1baac, players + 4], [players, player],
    [player + 0x28, 1], [room + 0xc, 13], [room + 0x10, 7],
  ]) page.words.set(address, value);
  return { page, game, players, player, shell };
}

test('touch state reads live twin types and Better controls, not linked-player pointers', async () => {
  const { page, game, player, shell } = await liveTouchPage();
  page.words.set(player + 0x13c0, 19);
  assert.equal(page.readTouchState().ready, false, 'native allocation is not surface readiness');
  for (const frame of [1, 2, 3]) {
    page.words.set(game + 0x264f8, frame);
    page.advance(frame);
  }
  let state = page.readTouchState();
  assert.equal(state.ready, true);
  assert.equal(state.running, true, 'validated gameplay takes precedence over retained menu 5');
  assert.equal(state.twins, true, 'Jacob needs no linked-player pointer');
  assert.equal(state.better, false);
  page.words.set(player + 0x13c0, 20);
  page.words.set(shell + 0x2a3d4, 1);
  state = page.readTouchState();
  assert.equal(state.twins, true, 'Esau also enables twin controls');
  assert.equal(state.better, true, 'live option changes apply without another presentation');
  page.words.set(player + 0x13c0, 37);
  page.words.set(player + 0x1e68, 0x600000);
  page.words.set(shell + 0x2a3d4, 0);
  state = page.readTouchState();
  assert.equal(state.running, true);
  assert.equal(state.twins, false, 'a linked non-Jacob/Esau player is not a twin control scheme');
  assert.equal(state.better, false, 'turning Better controls off is also observed immediately');
});

test('touch state rejects invalid gameplay and follows the native pause menu predicate', async () => {
  const { page, game, players, player, shell } = await liveTouchPage();
  page.words.set(player + 0x13c0, 19);
  for (const frame of [1, 2, 3]) {
    page.words.set(game + 0x264f8, frame);
    page.advance(frame);
  }
  assert.equal(page.readTouchState().paused, false);
  page.words.set(game + 0x23a74, 2);
  assert.equal(page.readTouchState().paused, true);
  const participants = 0x600000;
  page.words.set(shell + 0x4b3d8, participants);
  page.words.set(shell + 0x4b3dc, participants + 4);
  assert.equal(page.readTouchState().paused, true, 'one participant retains the pause menu');
  page.words.set(shell + 0x4b3dc, participants + 8);
  assert.equal(page.readTouchState().paused, false, 'two participants fail the native pause menu gate');
  page.words.set(shell + 0x4b3dc, participants);
  page.words.set(game + 0x23a74, 0xffffffff);
  assert.equal(page.readTouchState().paused, true, 'the native predicate accepts any nonzero state');
  page.words.set(game + 0x23a74, 0);
  assert.equal(page.readTouchState().paused, false);
  page.words.set(player + 0x173, 1);
  assert.equal(page.readTouchState().running, false, 'dead primary players do not retain gameplay controls');
  assert.equal(page.readTouchState().twins, false);
  page.words.set(player + 0x173, 0);
  page.words.set(players, 0);
  page.memoryReads.clear();
  let state = page.readTouchState();
  assert.equal(state.running, false);
  assert.equal(state.twins, false);
  assert.equal(page.memoryReads.has(0x13c0), false, 'null player is not dereferenced for its type');
  page.words.set(0x00c71678, 0);
  page.words.set(0x00c7169c, 0);
  page.memoryReads.clear();
  state = page.readTouchState();
  assert.equal(state.ready, true, 'the revealed menu remains available after a run ends');
  assert.equal(state.running, false, 'menu 5 without a native game is character selection');
  assert.equal(state.twins, false);
  assert.equal(state.better, false);
  for (const offset of [0x13c0, 0x23a74, 0x2a3d4, 0x4b3d8, 0x4b3dc])
    assert.equal(page.memoryReads.has(offset), false, `null owners are not dereferenced at ${offset.toString(16)}`);
});

test('touch state marks room and floor transitions inside a started run', async () => {
  const { page, game } = await liveTouchPage();
  for (const frame of [1, 2, 3]) {
    page.words.set(game + 0x264f8, frame);
    page.advance(frame);
  }
  let state = page.readTouchState();
  assert.equal(state.running, true);
  assert.equal(state.transit, false, 'a live room is not a transition');
  page.words.set(game + 0x1b83c, 1);
  state = page.readTouchState();
  assert.equal(state.running, false, 'a room transition is not a playable room');
  assert.equal(state.transit, true, 'a door transition inside a run');
  page.words.set(game + 0x1b83c, 0);
  page.words.set(game + 0x68d78, 2);
  assert.equal(page.readTouchState().transit, true, 'a floor transition too');
  page.modsMenu.open = true;
  assert.equal(page.readTouchState().transit, false, 'a paper menu over the run is not a transition');
  page.modsMenu.open = false;
  page.words.set(game + 0x264f8, 0);
  assert.equal(page.readTouchState().transit, false, 'nor is anything before the run has a logic frame');
  page.words.set(game + 0x264f8, 3);
  page.words.set(game + 0x68d78, 0);
  state = page.readTouchState();
  assert.equal(state.running, true, 'the next room is live again');
  assert.equal(state.transit, false);
});

test('touch state marks the full-screen moments of the game, and only those', async () => {
  const { page, game } = await liveTouchPage();
  for (const frame of [1, 2, 3]) {
    page.words.set(game + 0x264f8, frame);
    page.advance(frame);
  }
  assert.equal(page.readTouchState().cinematic, false, 'a live room');
  page.words.set(game + 0x1b83c, 3);
  assert.equal(page.readTouchState().cinematic, false, 'a door slide keeps the HUD');
  page.words.set(game + 0x1b83c, 1);
  assert.equal(page.readTouchState().cinematic, false, 'nor does the start of one');
  page.words.set(game + 0x1b83c, 2);
  assert.equal(page.readTouchState().cinematic, true, 'the boss VS card');
  page.words.set(game + 0x1b83c, 0);
  for (const [step, want] of [[1, true], [2, true], [3, false], [0, false]]) {
    page.words.set(game + 0x1ba78, step);
    assert.equal(page.readTouchState().cinematic, want, `stage transition step ${step}`);
  }
  page.words.set(game + 0x1ba78, 2);
  page.words.set(game + 0x264f8, 0);
  assert.equal(page.readTouchState().cinematic, false, 'nothing before the run has a logic frame');
});

test('the crash panel shows what led to the stop, not the report printed after it', async () => {
  const { page } = await liveTouchPage();
  const before = [...Array(30)].map((_, i) => `[odsa] [INFO] - line ${i}`);
  const cause = ['glFoo() not found in OPENGL32: (null)', '[isaac][crt] exit(1) from 0x00a62543'];
  const report = ['[isaac][dispatch] 70539132 dispatches (3083 block re-entries, 0 misses); hottest entries:',
    ...[...Array(16)].map((_, i) => `[isaac][dispatch]     ${i + 1} x sub_0040c6b0`), '[isaac][input] 3 messages dispatched'];
  const end = ['  TRAP in main @ 0x00931050: Program terminated with exit(1)'];
  const out = page.window.isaacCrashExcerpt([...before, ...cause, ...report, ...end]);
  for (const line of cause) assert.ok(out.includes(line), `the cause: ${line}`);
  assert.ok(out.includes('[odsa] [INFO] - line 29') && out.includes('[odsa] [INFO] - line 12'), 'the lines leading up to it');
  assert.ok(!out.includes('[odsa] [INFO] - line 11'), 'eighteen of them');
  assert.ok(!out.some((l) => l.startsWith('[isaac][dispatch]') || l.startsWith('[isaac][input]')), 'not the report');
  assert.ok(out.includes(end[0]), 'and the stop itself');
  assert.deepEqual(page.window.isaacCrashExcerpt(['a', 'b']), ['a', 'b'], 'with no stop in the log, its tail');
});

test('touch state routes paper menus without blocking and blocks the saves dialog', async () => {
  const { page, game } = await liveTouchPage();
  for (const frame of [1, 2, 3]) {
    page.words.set(game + 0x264f8, frame);
    page.advance(frame);
  }
  page.editMenu.open = true;
  let state = page.readTouchState();
  assert.equal(state.menu, 'edit-file');
  assert.equal(state.running, false);
  assert.equal(state.blocked, false, 'touch navigation must remain available on the paper menu');
  page.modsMenu.open = true;
  state = page.readTouchState();
  assert.equal(state.menu, 'mods', 'the foreground mods menu overrides Edit File');
  assert.equal(state.running, false);
  assert.equal(state.blocked, false);
  page.elements.get('saves').open = true;
  assert.equal(page.readTouchState().blocked, true);
  page.elements.get('saves').open = false;
  page.modsMenu.open = false;
  page.editMenu.open = false;
  state = page.readTouchState();
  assert.equal(state.running, true, 'closing menus restores the live run');
  assert.equal(state.blocked, false);
  page.error();
  state = page.readTouchState();
  assert.equal(state.ready, false, 'a fatal error revokes previously revealed readiness');
  assert.equal(state.running, false);
  assert.equal(state.blocked, true);
});
