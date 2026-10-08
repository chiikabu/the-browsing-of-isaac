// profile_load.mjs -- profile a deep floor with items and enemies while firing
// in place. Set up through the real console, and verify its guest state.
//
//   node scripts/recomp/web/profile_load.mjs <url> <out-dir> options=<options.ini>
//        [stage=8] [items=20] [spawn=20] [cpu=4] [gl=hw] [seconds=20] [warm=6]
//        [frames=900] [warmframes=180] [profile=0] [seed=3JY16FLR] [move=1] [gc=1] [scatter=1] [arena=1]
//
// frames overrides seconds; warmframes overrides the legacy warm key cycles.
// Fixed-frame input fires right/down/left/up for 24 of every 30 presents.
// move=1 additionally holds WASD; that is not a stable crowded-room workload.
// scatter=1 spawns Hosts across the upper room and requires a native count;
// the default retains repeated spawn 27.0 commands at the player.
// arena=1 removes room doors for a bounded benchmark arena and requires a
// native zero-door count; the default leaves doors unchanged.
// profile=0 disables the CPU profiler, not the exact presentation timestamps.
// gc=1 adds forced-GC and Windows process-memory snapshots at endpoints only.
// Writes summary.json, summary.txt, page.log, console.log, and (by default)
// load.cpuprofile. CPU self/subtree times remain in summary.txt.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { GAME_PTR, CONSOLE, OFF, ENT, consoleSeedFiles, planTyping } from '../lift/explore.mjs';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) {
  console.log('usage: node profile_load.mjs <url> <out-dir> options=<options.ini> [stage=8] [items=20] [spawn=20] [frames=900] [warmframes=180] [profile=0] [seed=3JY16FLR] [move=1] [gc=1] [scatter=1] [arena=1]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.map((a) => { const i = a.indexOf('='); return i < 0 ? [a, ''] : [a.slice(0, i), a.slice(i + 1)]; }));
mkdirSync(OUT, { recursive: true });
const STAGE = opt.stage || '8', ITEMS = Number(opt.items ?? 20), SPAWN = Number(opt.spawn ?? 20);
const SECONDS = Number(opt.seconds ?? 20), WARM = Number(opt.warm ?? 6), CPU = Number(opt.cpu ?? 4);
const FRAMES = opt.frames === undefined ? null : Number(opt.frames);
const WARMFRAMES = opt.warmframes === undefined ? null : Number(opt.warmframes);
const PROFILE = opt.profile !== '0', GL = opt.gl || 'hw';
const MOVE = opt.move === '1';
const GC = opt.gc === '1';
const SCATTER = opt.scatter === '1';
const ARENA = opt.arena === '1';
const seedCompact = opt.seed?.replace(/\s/g, '').toUpperCase();
const SEED = seedCompact ? `${seedCompact.slice(0, 4)} ${seedCompact.slice(4)}` : null;
// Seconds mode has an explicit 1000-present/s storage budget, not an assumed
// frame rate. Overflow invalidates the run instead of silently dropping data.
const CAPACITY = FRAMES ?? Math.ceil(SECONDS * 1000);
const STALL_MS = 30000;
const MULTI = [69, 68, 52, 20, 15, 118, 168, 395, 118];
const walk = ['KeyD', 'KeyS', 'KeyA', 'KeyW'], fire = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
const fatalPattern = /\bTRAP\b|\[ASSERT\]|\bassertion failed\b|\bRuntimeError\b|\bmemory access out of bounds\b|\bAborted\(|RESULT: (?:aborted|main trapped)|module instantiation failed/i;
const consoleLines = [], pageErrors = [], consoleErrors = [], errors = [], setup = [];
const receipt = {
  url: URL, status: 'failed', error: null, errors, pageErrors, consoleErrors,
  requested: { ...opt, stage: STAGE, items: ITEMS, spawn: SPAWN, cpu: CPU, gl: GL, seconds: SECONDS, warm: WARM, frames: FRAMES, warmframes: WARMFRAMES, profile: PROFILE, seed: SEED, move: MOVE, gc: GC, scatter: SCATTER, arena: ARENA },
  setup, commands: [], actual: null, browser: null, renderer: null, module: null,
  warmup: null, measurement: null, metrics: null, profile: null, memory: { before: null, after: null },
  limits: [
    'isaacFrame measures host presentation callbacks, not GPU completion or individual simulation updates.',
    MOVE ? 'move=1 allows room transitions: this is a moving-floor workload, not stable crowded-room evidence.' : 'Stationary input sends no WASD; room index, stage, transition state, and native room logs must remain unchanged from setup.',
    'CDP CPU throttling is not a measurement on Chromebook hardware.',
    SEED ? 'The requested seed is applied by the native seed command and checked against the new engine RNG Start Seed log.' : 'The engine seed is recorded, not forced; compare seeds and setup receipts before comparing runs.',
    GC ? 'Forced GC and OS process queries occur only before warmup and after measurement; the game continues during endpoint snapshots, whose timestamps delimit their overhead.' : 'Memory snapshots are not retained-after-GC measurements; forced GC and OS process queries are disabled.',
    'V8 heap metrics do not measure the guest/Wasm heap, total renderer memory, or GPU allocations. Process working set/private bytes include native allocation and allocator retention; growth alone does not prove a leak.',
    `The timestamp buffer holds ${CAPACITY} intervals; overflow or ${STALL_MS} ms without a presentation invalidates the run.`,
    PROFILE ? 'CPU profiling adds overhead and includes the reported warmup plus arming/collection margins; exact FPS intervals exclude warmup.' : 'CPU profiling is disabled; presentation timestamp and input hooks remain installed.',
  ],
};
let browser, page, cdp, profile = null, profiling = false, closedRequired = false;
let pageLog = [], logCursor = 0, lastHealthFrame = null, lastHealthMs = Date.now();
const heldKeys = new Set();
const execute = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (e) => { const message = e?.message || String(e); if (!errors.includes(message)) errors.push(message); };
const deadline = async (promise, ms, what) => {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`timeout: ${what}`)), ms); })]); }
  finally { clearTimeout(timer); }
};
const state = async () => {
  if (pageErrors.length) throw new Error(`pageerror: ${pageErrors[0]}`);
  const s = await deadline(page.evaluate(({ cursor, source, gamePtr, consoleOffset, offsets, entity }) => {
    const log = window.isaacLog || [], fatal = [];
    const re = new RegExp(source, 'i');
    for (let i = Math.min(cursor, log.length); i < log.length; i++) if (re.test(log[i])) fatal.push(String(log[i]));
    const guest = window.isaacGuest, game = guest && guest.u32(gamePtr);
    const room = game ? guest.u32(game + offsets.room) : 0;
    const playersBegin = game ? guest.u32(game + offsets.playersBegin) : 0;
    const playersEnd = game ? guest.u32(game + offsets.playersEnd) : 0;
    const player = playersBegin && playersEnd > playersBegin ? guest.u32(playersBegin) : 0;
    const width = room ? guest.u32(room + offsets.roomW) : 0, height = room ? guest.u32(room + offsets.roomH) : 0;
    return { f: window.isaacFrame || 0, n: log.length, done: window.isaacDone ?? null, fatal,
      consoleState: game ? guest.u32(game + consoleOffset) : null,
      stage: game ? guest.u32(game + offsets.stage) : null,
      play: { player, room, frame: game ? guest.u32(game + offsets.frame) : null,
        roomIndex: game ? guest.u32(game + offsets.roomIdx) | 0 : null, stageType: game ? guest.u32(game + offsets.stageType) : null,
        live: !!(player && room && width > 0 && width < 64 && height > 0 && height < 64 && !guest.u8(player + entity.dead)),
        transition: game ? guest.u32(game + offsets.rt) : null },
      sample: window.__isaacLoadSample?.status() ?? null };
  }, { cursor: logCursor, source: fatalPattern.source, gamePtr: GAME_PTR, consoleOffset: CONSOLE.state, offsets: OFF, entity: ENT }), STALL_MS, 'reading live engine state');
  receipt.lastState = { frame: s.f, consoleState: s.consoleState, stage: s.stage, play: s.play, done: s.done };
  logCursor = s.n;
  for (const line of s.fatal) fail(line);
  if (errors.length) throw new Error(errors[0]);
  if (pageErrors.length) throw new Error(`pageerror: ${pageErrors[0]}`);
  if (s.done !== null) throw new Error(`engine ended before workload validation: ${JSON.stringify(s.done)}`);
  if (s.sample?.error) throw new Error(s.sample.error);
  if (s.f !== lastHealthFrame) { lastHealthFrame = s.f; lastHealthMs = Date.now(); }
  else if (s.f > 0 && Date.now() - lastHealthMs >= STALL_MS) throw new Error(`isaacFrame unchanged for ${STALL_MS} ms at ${s.f}`);
  if (closedRequired && s.consoleState !== 0) throw new Error(`debug console is not closed: state ${s.consoleState}`);
  if (closedRequired && s.stage !== Number(STAGE)) throw new Error(`wrong floor: stage ${s.stage}, expected ${STAGE}`);
  return s;
};
const logMatch = (re, since = 0) => deadline(page.evaluate(([source, flags, start]) => {
  const rx = new RegExp(source, flags), log = window.isaacLog || [];
  for (let i = log.length - 1; i >= start; i--) if (rx.test(log[i])) return log[i];
  return null;
}, [re.source, re.flags, since]), STALL_MS, 'reading engine log');
const readConsole = ({ captureOutput = false, itemId = null } = {}) => deadline(page.evaluate(({ gamePtr, offsets, debugOffset, gameOffsets, captureOutput, itemId }) => {
  const g = window.isaacGuest, game = g && g.u32(gamePtr);
  if (!game) throw new Error('isaacGuest game pointer is unavailable');
  const string = (address, max) => {
    const size = g.u32(address + 0x10), capacity = g.u32(address + 0x14);
    if (size > max || capacity > 0x10000000 || size > capacity) throw new Error('invalid guest console string');
    const base = capacity > 15 ? g.u32(address) : address;
    let text = '';
    for (let i = 0; i < size; i++) text += String.fromCharCode(g.u8(base + i));
    return text;
  };
  let output = null, collectible = null;
  if (captureOutput) {
    // Console::Print (PE 0x006929e0) prepends Entry* at Console+0x44..0x50.
    // Each 0x28-byte Entry starts with an MSVC string; this is not isaacLog.
    const console = game + offsets.state, buffer = g.u32(console + 0x44), capacity = g.u32(console + 0x48);
    const head = g.u32(console + 0x4c), count = g.u32(console + 0x50), entries = [];
    if (count > 1024 || (count && (!buffer || !capacity || capacity > 4096 || (capacity & (capacity - 1)) || count > capacity)))
      throw new Error('invalid guest console output ring');
    for (let i = 0; i < count; i++) {
      const entry = g.u32(buffer + ((head + i) & (capacity - 1)) * 4);
      if (!entry) throw new Error('null guest console output entry');
      entries.push({ address: entry, text: string(entry, 4096) });
    }
    output = { head, count, capacity, entries };
  }
  if (itemId !== null) {
    const begin = g.u32(game + gameOffsets.playersBegin), end = g.u32(game + gameOffsets.playersEnd);
    const player = begin && end > begin ? g.u32(begin) : 0;
    // PE 0x0075f020 reads the passive collectible count at
    // *(Player+0x16c8) + itemId*4 (active slots are separate).
    const table = player ? g.u32(player + 0x16c8) : 0;
    if (!table) throw new Error('player collectible count table is unavailable');
    collectible = { player, itemId, count: g.u32(table + itemId * 4) };
  }
  return { state: g.u32(game + offsets.state), line: string(game + offsets.line, 512),
    debugFlags: g.u32(game + debugOffset), output, collectible };
}, { gamePtr: GAME_PTR, offsets: CONSOLE, debugOffset: OFF.debugFlags, gameOffsets: OFF, captureOutput, itemId }), STALL_MS, 'reading guest console');
const down = async (key) => { heldKeys.add(key); await page.keyboard.down(key); };
const up = async (key) => { await page.keyboard.up(key); heldKeys.delete(key); };
const hold = async (key, ms = 100) => {
  try {
    await down(key);
    const pressedFrame = (await state()).f;
    await sleep(ms);
    // The input queue may drain only after a loading stall. Never enqueue the
    // release until the engine has had two presentations to observe keydown.
    await until((s) => s.f >= pressedFrame + 2, STALL_MS, `${key} held across two presentations`);
  } finally { await up(key); }
};
const typingCodes = { space: 'Space', grave: 'Backquote', minus: 'Minus', equals: 'Equal', lbracket: 'BracketLeft',
  rbracket: 'BracketRight', backslash: 'Backslash', semicolon: 'Semicolon', quote: 'Quote', comma: 'Comma', period: 'Period', slash: 'Slash' };
const typeSlow = async (text) => {
  for (const { key, shift } of planTyping(text)) {
    const code = typingCodes[key] || (/^\d$/.test(key) ? `Digit${key}` : `Key${key.toUpperCase()}`);
    try { if (shift) await down('ShiftLeft'); await hold(code, 55); }
    finally { if (shift) await up('ShiftLeft'); }
    await sleep(35);
  }
};
const until = async (fn, ms, what) => {
  const end = Date.now() + ms;
  for (;;) { const s = await state(); const value = await fn(s); if (value) return value; if (Date.now() > end) throw new Error(`timeout: ${what}`); await sleep(150); }
};
const waitPlayable = async () => {
  let readyRoom = null;
  const playable = await until((s) => {
    const p = s.play;
    if (!p.live || p.transition !== 0) { readyRoom = null; return false; }
    if (!readyRoom || readyRoom.room !== p.room || p.frame < readyRoom.frame)
      readyRoom = { room: p.room, frame: p.frame, presented: s.f };
    return p.frame >= readyRoom.frame + 2 && s.f >= readyRoom.presented + 2 ? s : false;
  }, STALL_MS, 'live player and advancing room frames');
  receipt.actual = { ...receipt.actual, startup: { frame: playable.f, roomFrame: playable.play.frame, room: playable.play.room, player: playable.play.player } };
};
const cmd = async (text) => {
  const itemMatch = /^giveitem c(\d+)$/.exec(text), itemId = itemMatch ? Number(itemMatch[1]) : null;
  const before = await readConsole({ captureOutput: true, itemId });
  if (before.state !== 2 || before.line !== '') throw new Error(`console not ready for ${JSON.stringify(text)}: ${JSON.stringify(before)}`);
  await typeSlow(text); await sleep(150);
  const typed = await readConsole();
  if (typed.state !== 2 || typed.line !== text) throw new Error(`console typed ${JSON.stringify(typed.line)}, expected ${JSON.stringify(text)}`);
  await hold('Enter', 110); await sleep(500);
  await until(async () => (await readConsole()).line === '', 5000, `executing ${text}`);
  const after = await readConsole({ captureOutput: true, itemId });
  const previous = before.output.entries[0];
  const boundary = previous ? after.output.entries.findIndex((entry) => entry.address === previous.address) : -1;
  const limit = boundary < 0 ? after.output.entries.length : boundary + (after.output.entries[boundary].text !== previous.text ? 1 : 0);
  const output = after.output.entries.slice(0, limit).map((entry) => entry.text).reverse();
  receipt.commands.push({ command: text, frame: (await state()).f, typed: typed.line, cleared: true, output,
    collectibleBefore: before.collectible, collectibleAfter: after.collectible });
  const rejected = output.find((line) => /\b(?:error|invalid|unknown|failed)\b|could not|not found|not (?:a )?valid/i.test(line));
  if (rejected) throw new Error(`native console rejected ${text}: ${rejected}`);
  if (itemId !== null && (after.collectible.player !== before.collectible.player || after.collectible.count !== before.collectible.count + 1))
    throw new Error(`${text} did not add exactly one collectible: ${before.collectible.count} -> ${after.collectible.count}`);
  if (text.startsWith('spawn ') && !output.some((line) => /Spawned entity\./.test(line)))
    throw new Error(`${text} has no native Spawned entity result`);
};
const processMemory = async (phase) => {
  const result = { phase, platform: process.platform, supported: process.platform === 'win32', startedAt: new Date().toISOString(),
    finishedAt: null, pids: null, processes: null, renderers: null, error: null };
  if (!result.supported) { result.error = 'OS process memory counters are supported only on Windows'; result.finishedAt = new Date().toISOString(); return result; }
  let browserCdp;
  try {
    browserCdp = await browser.newBrowserCDPSession();
    const { processInfo } = await deadline(browserCdp.send('SystemInfo.getProcessInfo'), STALL_MS, 'reading browser process IDs');
    const ids = processInfo.map((p) => p.id);
    if (!ids.length || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error('invalid browser process IDs');
    result.pids = processInfo.map((p) => ({ pid: p.id, type: p.type }));
    // Same OS counters and SystemInfo PID attribution as drive_perf.mjs.
    const command = `Get-Process -Id ${ids.join(',')} -ErrorAction SilentlyContinue | ForEach-Object { "$($_.Id)|$($_.WorkingSet64)|$($_.PrivateMemorySize64)" }`;
    const { stdout } = await execute('powershell', ['-NoProfile', '-NonInteractive', '-Command', command], { encoding: 'utf8', timeout: STALL_MS });
    const types = new Map(processInfo.map((p) => [p.id, p.type]));
    const rows = stdout.trim().split(/\r?\n/).filter(Boolean).map((line) => {
      const [pid, workingSetBytes, privateBytes] = line.split('|').map(Number);
      if (![pid, workingSetBytes, privateBytes].every(Number.isSafeInteger) || !types.has(pid) || workingSetBytes < 0 || privateBytes < 0)
        throw new Error(`invalid OS process memory row: ${line}`);
      return { pid, type: types.get(pid).toLowerCase().replace(/ /g, '-'), workingSetBytes, privateBytes };
    });
    result.processes = rows;
    result.renderers = rows.filter((p) => p.type === 'renderer');
    if (!result.renderers.length) throw new Error('no renderer OS memory counters collected');
  } catch (e) { result.error = e.message; }
  finally {
    if (browserCdp) await browserCdp.detach().catch((e) => { result.error ||= e.message; });
    result.finishedAt = new Date().toISOString();
  }
  return result;
};
const memory = async (phase) => {
  const startedAt = new Date().toISOString();
  const gc = { requested: GC, completed: false, startedAt: null, finishedAt: null, frameBefore: null };
  if (GC) {
    const before = await deadline(page.evaluate(() => ({ frame: window.isaacFrame ?? null, active: !!window.__isaacLoadSample?.status()?.active })), STALL_MS, 'checking endpoint sampling state');
    if (before.active) throw new Error('refusing forced GC during an active presentation interval');
    gc.frameBefore = before.frame; gc.startedAt = new Date().toISOString();
    await deadline(cdp.send('HeapProfiler.collectGarbage'), STALL_MS, 'collecting endpoint garbage');
    gc.completed = true; gc.finishedAt = new Date().toISOString();
  }
  const heap = await deadline(cdp.send('Runtime.getHeapUsage'), STALL_MS, 'reading JS heap usage');
  const consoleStart = consoleLines.length;
  const snapshot = await deadline(page.evaluate(() => {
    const log = window.isaacLog || [], start = log.length;
    const hostHeap = { available: typeof window.isaacHeapReport === 'function', result: null, lines: [], error: null };
    if (hostHeap.available) {
      try { hostHeap.result = window.isaacHeapReport(); } catch (e) { hostHeap.error = e.message; }
      hostHeap.lines = log.slice(start).map(String);
      if (hostHeap.result === false) hostHeap.error = 'isaacHeapReport returned false';
    }
    let logBytes = 0;
    const encoder = new TextEncoder();
    for (const line of log) logBytes += encoder.encode(String(line)).byteLength;
    const m = performance.memory;
    return { frame: window.isaacFrame, pageTimestampMs: performance.now(), performanceMemory: m ? { usedJSHeapSize: m.usedJSHeapSize, totalJSHeapSize: m.totalJSHeapSize, jsHeapSizeLimit: m.jsHeapSizeLimit } : null,
      hostHeap, log: { retainedLines: log.length, retainedUtf8Bytes: logBytes, excludesSeparators: true,
        stats: typeof window.isaacLogStats === 'function' ? window.isaacLogStats() : null },
      audio: typeof window.isaacAudioLevel === 'function' ? window.isaacAudioLevel() : null };
  }), STALL_MS, 'reading host memory report');
  snapshot.hostHeap.pageLines = snapshot.hostHeap.lines;
  snapshot.hostHeap.consoleLines = consoleLines.slice(consoleStart);
  snapshot.hostHeap.consoleRange = { start: consoleStart, end: consoleLines.length };
  snapshot.hostHeap.lines = [...snapshot.hostHeap.consoleLines, ...snapshot.hostHeap.pageLines];
  snapshot.hostHeap.lineSources = 'Raw browser-console messages and page-log entries emitted around isaacHeapReport; not deduplicated.';
  if (snapshot.hostHeap.result === true && !snapshot.hostHeap.lines.length) snapshot.hostHeap.error = 'host report returned true without captured console or page lines';
  // Never query OS processes or force GC on the default FPS path.
  const os = GC ? await processMemory(phase) : null;
  return { ...snapshot, phase, startedAt, finishedAt: new Date().toISOString(), gc, runtimeHeapUsage: heap, processMemory: os };
};
const metrics = (intervals) => {
  if (!intervals.length) throw new Error('no presentation intervals sampled');
  const sorted = [...intervals].sort((a, b) => a - b), count = intervals.length;
  const elapsedMs = intervals.reduce((a, b) => a + b, 0);
  const windowFrames = Math.min(120, Math.floor(count / 2) || 1);
  const fps = (values) => 1000 * values.length / values.reduce((a, b) => a + b, 0);
  return { count, elapsedMs, medianMs: count % 2 ? sorted[count >> 1] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2,
    p95Ms: sorted[Math.ceil(count * 0.95) - 1], p99Ms: sorted[Math.ceil(count * 0.99) - 1], maxMs: sorted[count - 1],
    over25ms: intervals.filter((x) => x > 25).length, meanFPS: 1000 * count / elapsedMs,
    windowFrames, firstWindowFPS: fps(intervals.slice(0, windowFrames)), lastWindowFPS: fps(intervals.slice(-windowFrames)),
    percentileMethod: 'nearest rank', windowDefinition: 'first/last min(120, floor(intervalCount/2)) intervals; one interval minimum' };
};

try {
  if (!opt.options) throw new Error('options=<options.ini> is required');
  if (!/^\d+$/.test(STAGE) || Number(STAGE) < 1) throw new Error('stage must be a positive integer');
  for (const [name, value] of [['items', ITEMS], ['spawn', SPAWN], ['warm', WARM], ['warmframes', WARMFRAMES]])
    if (value !== null && (!Number.isSafeInteger(value) || value < 0)) throw new Error(`${name} must be a non-negative integer`);
  if (!Number.isFinite(SECONDS) || SECONDS <= 0) throw new Error('seconds must be positive');
  if (!Number.isFinite(CPU) || CPU < 1) throw new Error('cpu must be at least 1');
  if (FRAMES !== null && (!Number.isSafeInteger(FRAMES) || FRAMES < 1)) throw new Error('frames must be a positive integer');
  if (!Number.isSafeInteger(CAPACITY) || CAPACITY < 1) throw new Error('invalid timestamp buffer capacity');
  if (opt.profile !== undefined && !['0', '1'].includes(opt.profile)) throw new Error('profile must be 0 or 1');
  if (opt.move !== undefined && !['0', '1'].includes(opt.move)) throw new Error('move must be 0 or 1');
  if (opt.gc !== undefined && !['0', '1'].includes(opt.gc)) throw new Error('gc must be 0 or 1');
  if (opt.scatter !== undefined && !['0', '1'].includes(opt.scatter)) throw new Error('scatter must be 0 or 1');
  if (opt.arena !== undefined && !['0', '1'].includes(opt.arena)) throw new Error('arena must be 0 or 1');
  if (opt.seed !== undefined && !/^[A-Z0-9]{8}$/.test(seedCompact)) throw new Error('seed must contain eight letters/digits (optional middle space)');
  const target = new globalThis.URL(URL);
  if (target.searchParams.get('persist') === '0') throw new Error('persist=0 disables the options.ini seed; enable persistence (the browser context is fresh)');
  const optionsText = consoleSeedFiles([], readFileSync(opt.options, 'utf8'))[0].text;
  receipt.seededOptions = { EnableDebugConsole: 1, SaveCommandHistory: 1, VSync: 0 };
  const bytes = [...Buffer.from(optionsText)];
  const glArgs = GL === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
  browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync', '--mute-audio'] });
  receipt.browser = { version: browser.version(), headless: true, viewport: { width: 960, height: 640 } };
  page = await browser.newPage({ viewport: receipt.browser.viewport });
  page.on('console', (message) => {
    const text = message.text(); consoleLines.push(text);
    if (message.type() === 'error') consoleErrors.push(text);
    if (fatalPattern.test(text)) fail(text);
  });
  page.on('pageerror', (e) => { const text = String(e); pageErrors.push(text); consoleLines.push('PAGEERROR ' + text); });
  page.on('crash', () => fail('browser page crashed'));
  cdp = await page.context().newCDPSession(page);
  if (CPU !== 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const manifestUrl = new globalThis.URL('dist.json', target).href;
  receipt.module = { manifestUrl, path: 'boot.wasm', sha256: null, error: null };
  try {
    const response = await page.request.get(manifestUrl, { timeout: 15000 });
    if (!response.ok()) throw new Error(`dist.json HTTP ${response.status()}`);
    const manifest = await response.json(), entry = manifest.files?.find((f) => f.path === 'boot.wasm');
    if (!entry?.sha256) throw new Error('dist.json has no boot.wasm SHA');
    receipt.module.sha256 = entry.sha256;
    receipt.module.size = entry.size;
  } catch (e) { receipt.module.error = e.message; receipt.limits.push('Module SHA unavailable; this receipt cannot verify binary identity.'); }
  await page.goto(target.origin + '/instance_index.json');
  const seeded = await page.evaluate(async (arr) => new Promise((resolve, reject) => {
    const req = indexedDB.open('isaac-saves', 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('files'); };
    req.onerror = () => reject(new Error(`save database: ${req.error}`));
    req.onblocked = () => reject(new Error('save database blocked'));
    req.onsuccess = () => {
      const db = req.result, tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put({ src: null, bytes: new Uint8Array(arr) }, 'c:/isaac/documents/my games/binding of isaac repentance+/options.ini');
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = tx.onabort = () => { db.close(); reject(new Error(`save transaction: ${tx.error}`)); };
    };
  }), bytes);
  if (!seeded) throw new Error('options seed was not committed');
  await page.goto(URL);
  await until((s) => s.f > 0, 900000, 'first frame');
  receipt.renderer = await page.evaluate(() => {
    const canvas = document.getElementById('canvas');
    const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : null),
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null, userAgent: navigator.userAgent };
  });
  let enters = 0;
  for (;;) {
    await state();
    if (await logMatch(/Level::Init m_Stage|RNG Start Seed/)) break;
    if (enters >= 30) throw new Error('no run after 30 attempts');
    await hold('Enter'); await sleep(500); await hold('Space'); enters += 1; await sleep(2000);
  }
  await waitPlayable();
  await hold('Backquote', 120); await sleep(600);
  await until(async () => (await readConsole()).state === 2, 5000, 'opening debug console');
  if (SEED) {
    const beforeSeed = (await state()).n;
    await cmd(`seed ${SEED}`);
    const seedLog = await until(() => logMatch(/RNG Start Seed:/, beforeSeed), STALL_MS, 'native seed restart');
    const match = /RNG Start Seed:\s*([A-Z0-9]{4} [A-Z0-9]{4})\s+\((\d+)\)\s+\[New,/.exec(seedLog);
    receipt.actual = { ...receipt.actual, seedLog, seed: match?.[1] ?? null, seedValue: match ? Number(match[2]) : null, seedVerified: match?.[1] === SEED };
    if (!receipt.actual.seedVerified) throw new Error(`native seed restart mismatch: requested ${SEED}; ${seedLog}`);
    await until(async () => [0, 2].includes((await readConsole()).state), 5000, 'console after seed restart');
    // A surviving open console pauses gameplay. Close it before proving the
    // restarted room advances, then reopen only when its state is closed.
    if ((await readConsole()).state === 2) await hold('Enter', 110);
    await until(async () => (await readConsole()).state === 0, 5000, 'closing restarted console');
    await waitPlayable();
    if ((await readConsole()).state === 0) await hold('Backquote', 120);
    await until(async () => (await readConsole()).state === 2, 5000, 'opening restarted console');
  }
  await cmd('debug 3');
  const debug = await readConsole();
  // PE 0x0068e3b1 subtracts 1 from the console number before calling
  // ToggleDebugFlag (0x00685f10), then GetDebugFlag (0x00431760).
  const infiniteHpMask = 1 << (3 - 1);
  receipt.actual = { ...receipt.actual, debugFlags: debug.debugFlags, infiniteHpMask };
  if (!(debug.debugFlags & infiniteHpMask)) throw new Error(`debug 3 did not enable infinite HP: flags 0x${debug.debugFlags.toString(16)}, expected mask 0x${infiniteHpMask.toString(16)}`);
  const beforeStage = (await state()).n;
  await cmd(`stage ${STAGE}`);
  const init = await until(() => logMatch(new RegExp(`Level::Init m_Stage ${STAGE},`), beforeStage), 20000, `stage ${STAGE}`);
  await sleep(3000);
  setup.push(`stage ${STAGE}`);
  for (let i = 0; i < ITEMS; i++) await cmd(`giveitem c${MULTI[i % MULTI.length]}`);
  setup.push(`${ITEMS} items`);
  if (ARENA) {
    const command = 'lua local r=Game():GetRoom() for i=0,7 do r:RemoveDoor(i) end local n=0 for i=0,7 do if r:GetDoor(i) then n=n+1 end end Isaac.ConsoleOutput("load_doors="..n.."\\n")';
    if (command.length >= 512) throw new Error(`arena command must be shorter than 512 characters: ${command.length}`);
    await cmd(command);
    const output = receipt.commands[receipt.commands.length - 1].output;
    if (!output.some((line) => /(?:^|\s)load_doors=0(?=\s|$)/.test(line)))
      throw new Error(`arena command has no exact native load_doors=0 result: ${JSON.stringify(output)}`);
    setup.push('Room doors removed for a bounded benchmark arena (native zero-door count verified)');
  }
  if (SCATTER && SPAWN > 0) {
    const cols = Math.ceil(Math.sqrt(SPAWN)), rows = Math.ceil(SPAWN / cols);
    const xDivisor = Math.max(1, cols - 1), yDivisor = Math.max(1, rows - 1);
    const command = `lua for i=1,${SPAWN} do Isaac.Spawn(27,0,0,Vector(110+420*((i-1)%${cols})/${xDivisor},160+160*math.floor((i-1)/${cols})/${yDivisor}),Vector.Zero,nil) end Isaac.ConsoleOutput("load_hosts="..#Isaac.FindByType(27,0,0).."\\n")`;
    if (command.length >= 512) throw new Error(`scatter command must be shorter than 512 characters: ${command.length}`);
    await cmd(command);
    const output = receipt.commands[receipt.commands.length - 1].output;
    const marker = new RegExp(`(?:^|\\s)load_hosts=${SPAWN}(?=\\s|$)`);
    if (!output.some((line) => marker.test(line)))
      throw new Error(`scatter command has no exact native load_hosts=${SPAWN} result: ${JSON.stringify(output)}`);
  } else {
    for (let i = 0; i < SPAWN; i++) await cmd('spawn 27.0');
  }
  setup.push(SCATTER && SPAWN > 0 ? `${SPAWN} scattered Hosts across the upper room (native count verified)` : `${SPAWN} enemies`);
  await hold('Enter', 110); await sleep(900);
  await until(async () => (await readConsole()).state === 0, 5000, 'closing debug console');
  closedRequired = true;
  const ready = await state();
  receipt.actual = { ...receipt.actual, setupFrame: ready.f, setupGameFrame: ready.play.frame, roomIndex: ready.play.roomIndex,
    stage: ready.stage, stageType: ready.play.stageType, stageLog: init,
    seedLog: await logMatch(/RNG Start Seed/), consoleState: ready.consoleState,
    debugFlags: (await readConsole()).debugFlags };
  if (SEED && !receipt.actual.seedLog?.includes(`RNG Start Seed: ${SEED} (`)) throw new Error(`workload seed changed after setup: ${receipt.actual.seedLog}`);

  // Install only after setup. Forward the original property unchanged; the
  // setter observes each host present without rAF polling or GPU readbacks.
  await page.evaluate(({ capacity, moving, gamePtr, offsets, expectedRoom, setupLogIndex }) => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'isaacFrame');
    if (!descriptor?.configurable || ('value' in descriptor ? !descriptor.writable : !descriptor.get || !descriptor.set))
      throw new Error('isaacFrame cannot be observed without changing its semantics');
    if (typeof window.isaacInjectKey !== 'function') throw new Error('isaacInjectKey is unavailable');
    if (typeof window.isaacGuest?.u32 !== 'function') throw new Error('isaacGuest is unavailable');
    let value = descriptor.value;
    const get = descriptor.get || (() => value);
    const data = new Float64Array(capacity), walk = ['d', 's', 'a', 'w'], fire = ['right', 'down', 'left', 'up'];
    let s = null, held = -1;
    let roomLogCursor = setupLogIndex;
    const roomPattern = /Starting room transition|CURRENT ROOM INDEX|\[odsa\] \[INFO\] - Room \d+\.\d+\(/;
    const release = () => {
      if (held < 0) return;
      if (moving) window.isaacInjectKey(walk[held], false);
      window.isaacInjectKey(fire[held], false);
      held = -1; if (s) s.inputPairsUp++;
    };
    const stop = (complete = false) => { if (s) { s.active = false; s.complete = complete; } release(); };
    const drive = (frame) => {
      if (frame % 30 === 24) release();
      else if (frame % 30 === 0) {
        held = Math.floor(frame / 30) % 4;
        if (moving) window.isaacInjectKey(walk[held], true);
        window.isaacInjectKey(fire[held], true); s.inputPairsDown++;
      }
    };
    Object.defineProperty(window, 'isaacFrame', { configurable: descriptor.configurable, enumerable: descriptor.enumerable, get,
      set(next) {
        const previous = get.call(this);
        if (descriptor.set) descriptor.set.call(this, next); else value = next;
        const current = get.call(this);
        if (!s?.active || current === previous) return;
        try {
          if (window.isaacDone != null) throw new Error('isaacDone before the requested presentation count');
          if (!Number.isSafeInteger(current) || current !== previous + 1) throw new Error(`non-sequential isaacFrame: ${previous} -> ${current}`);
          const now = performance.now();
          const guest = window.isaacGuest, game = guest.u32(gamePtr);
          if (!game) throw new Error('game pointer disappeared during workload');
          const gameFrame = guest.u32(game + offsets.frame), roomIndex = guest.u32(game + offsets.roomIdx) | 0;
          const stage = guest.u32(game + offsets.stage), stageType = guest.u32(game + offsets.stageType);
          const transition = guest.u32(game + offsets.rt), log = window.isaacLog || [];
          for (let i = Math.min(roomLogCursor, log.length); i < log.length; i++) {
            if (!roomPattern.test(log[i])) continue;
            const event = { phase: s.phase, frame: current, gameFrame, roomIndex, line: String(log[i]) };
            s.roomEvents.push(event);
            if (!moving) { s.roomViolation = event; throw new Error(`stationary workload emitted a room transition/new-room log: ${event.line}`); }
          }
          roomLogCursor = log.length;
          if (!moving && (transition !== 0 || roomIndex !== expectedRoom.index || stage !== expectedRoom.stage || stageType !== expectedRoom.stageType)) {
            s.roomViolation = { phase: s.phase, frame: current, gameFrame, roomIndex, stage, stageType, transition };
            throw new Error(`stationary workload left setup room ${expectedRoom.stage}.${expectedRoom.stageType}/${expectedRoom.index}: ${stage}.${stageType}/${roomIndex}, transition ${transition}`);
          }
          if (s.armed) {
            s.armed = false; s.startFrame = s.endFrame = current; s.startedAt = s.lastAt = now;
            s.startGameFrame = s.endGameFrame = gameFrame; s.startRoomIndex = s.endRoomIndex = roomIndex;
            if (s.phase === 'warmup' || s.drive) drive(0);
            return;
          }
          if (s.phase === 'measure') {
            if (s.count >= data.length) throw new Error(`presentation buffer overflow at ${data.length} intervals`);
            data[s.count] = now - s.lastAt;
          }
          s.lastAt = now; s.endFrame = current; s.count++;
          s.endGameFrame = gameFrame; s.endRoomIndex = roomIndex;
          if (s.phase === 'warmup' && s.count === s.warmFrames) {
            release();
            s.warmup = { count: s.count, startFrame: s.startFrame, endFrame: current, elapsedMs: now - s.startedAt,
              startGameFrame: s.startGameFrame, endGameFrame: gameFrame, gameFrameDelta: gameFrame - s.startGameFrame,
              startRoomIndex: s.startRoomIndex, endRoomIndex: roomIndex, roomEvents: s.roomEvents,
              inputPairsDown: s.inputPairsDown, inputPairsUp: s.inputPairsUp, keysPerPulse: moving ? 2 : 1 };
            // No round trip, memory query, profiler setup, or unowned frame
            // separates warmup from measurement: this same present is both.
            s.phase = 'measure'; s.count = 0; s.startFrame = current; s.startedAt = now;
            s.startGameFrame = gameFrame; s.startRoomIndex = roomIndex; s.roomEvents = [];
            s.inputPairsDown = s.inputPairsUp = 0;
            if (s.drive) drive(0);
          } else if (s.phase === 'measure' && s.target !== null && s.count === s.target) stop(true);
          else if (s.phase === 'warmup' || s.drive) drive(s.count);
        } catch (e) { s.error = e.message; stop(false); }
      },
    });
    window.__isaacLoadSample = {
      start(target, fixedInput, warmFrames) {
        if (s?.active) throw new Error('presentation sampler already running');
        s = { target, drive: fixedInput, moving, keysPerPulse: moving ? 2 : 1, warmFrames, phase: warmFrames ? 'warmup' : 'measure', warmup: null,
          active: true, armed: true, complete: false, error: null, expectedRoom, roomEvents: [], roomViolation: null,
          count: 0, startFrame: null, endFrame: null, startGameFrame: null, endGameFrame: null, startRoomIndex: null, endRoomIndex: null,
          startedAt: null, lastAt: null, inputPairsDown: 0, inputPairsUp: 0 };
      },
      status: () => s && ({ active: s.active, complete: s.complete, phase: s.phase, count: s.count, error: s.error }),
      result: () => s && ({ ...s, gameFrameDelta: s.startGameFrame === null ? null : s.endGameFrame - s.startGameFrame,
        intervals: s.phase === 'measure' ? Array.from(data.subarray(0, s.count)) : [] }),
      stop: () => stop(s?.phase === 'measure' && !s.error && (s.target === null || s.count === s.target)),
      restore() {
        if (s?.active) stop(false);
        const current = get.call(window);
        Object.defineProperty(window, 'isaacFrame', 'value' in descriptor ? { ...descriptor, value: current } : descriptor);
        delete window.__isaacLoadSample;
      },
    };
  }, { capacity: CAPACITY, moving: MOVE, gamePtr: GAME_PTR, offsets: OFF, setupLogIndex: ready.n,
    expectedRoom: { stage: ready.stage, stageType: ready.play.stageType, index: ready.play.roomIndex } });
  receipt.memory.before = await memory('beforeWarmup');
  await state();
  if (PROFILE) {
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
    await cdp.send('Profiler.start'); profiling = true;
  }
  if (WARMFRAMES === null) {
    const warmStart = await state(), t0 = Date.now();
    for (let i = 0; i < WARM; i++) { await hold('ArrowRight', 500); await sleep(200); await state(); }
    const warmEnd = await state();
    receipt.warmup = { count: warmEnd.f - warmStart.f, elapsedMs: Date.now() - t0, legacyCycles: WARM,
      startGameFrame: warmStart.play.frame, endGameFrame: warmEnd.play.frame, gameFrameDelta: warmEnd.play.frame - warmStart.play.frame,
      startRoomIndex: warmStart.play.roomIndex, endRoomIndex: warmEnd.play.roomIndex };
  }
  const started = Date.now();
  await page.evaluate(({ frames, warmFrames }) => window.__isaacLoadSample.start(frames, frames !== null, warmFrames),
    { frames: FRAMES, warmFrames: WARMFRAMES ?? 0 });
  let sample;
  if (FRAMES !== null) {
    await until((s) => s.sample?.complete, Infinity, `${FRAMES} presentation intervals`);
    sample = await page.evaluate(() => window.__isaacLoadSample.result());
  } else {
    await until((s) => s.sample?.phase === 'measure', Infinity, 'frame-paced warmup');
    for (let i = 0; i * 500 < SECONDS * 1000; i++) {
      await state(); if (MOVE) await down(walk[i % 4]); await down(fire[i % 4]); await sleep(400);
      if (MOVE) await up(walk[i % 4]); await up(fire[i % 4]); await sleep(100);
    }
    sample = await page.evaluate(() => { window.__isaacLoadSample.stop(); return window.__isaacLoadSample.result(); });
  }
  receipt.warmup = sample.warmup || receipt.warmup || { count: 0, elapsedMs: 0 };
  const { intervals, ...measurement } = sample;
  receipt.measurement = { ...measurement, wallMs: Date.now() - started, wallIncludesFrameWarmup: WARMFRAMES !== null, capacity: CAPACITY,
    mode: FRAMES === null ? 'seconds' : 'frames', movement: MOVE ? 'wasd-square' : 'stationary',
    input: `${FRAMES === null ? 'wall-clock: 400 ms held / 100 ms released' : 'frame boundaries: 24 held / 6 released per 30 presents'}; right/down/left/up${MOVE ? ' plus D/S/A/W' : '; no WASD'}` };
  if (!sample.complete || sample.error || (FRAMES !== null && sample.count !== FRAMES)) throw new Error(`incomplete measurement: ${sample.count}/${FRAMES ?? 'seconds'}; ${sample.error || 'not complete'}`);
  receipt.metrics = metrics(intervals);
  if (profiling) { profile = (await deadline(cdp.send('Profiler.stop'), STALL_MS, 'stopping CPU profile')).profile; profiling = false; }
  if (PROFILE && !profile) throw new Error('CPU profiler returned no profile');
  await state();
  receipt.memory.after = await memory('afterMeasurement');
  await state();
  // Screenshot only after sampling/profiling; never read back the GPU in the interval.
  await page.screenshot({ path: join(OUT, 'loaded.png'), timeout: 10000 });
} catch (e) {
  fail(e);
  console.log('[load] FAILED: ' + (e?.message || e));
  if (page) await page.screenshot({ path: join(OUT, 'failure.png'), timeout: 5000 }).catch(() => {});
} finally {
  try {
    if (page && !page.isClosed()) {
      try {
        const final = await deadline(page.evaluate(({ gamePtr, consoleOffset, debugOffset, offsets }) => {
          const sampler = window.__isaacLoadSample;
          let partial = null;
          try {
            if (sampler) { sampler.stop(); partial = sampler.result(); }
          } finally {
            for (const key of ['d', 's', 'a', 'w', 'right', 'down', 'left', 'up']) window.isaacInjectKey?.(key, false);
            sampler?.restore();
          }
          const guest = window.isaacGuest, game = guest && guest.u32(gamePtr);
          return { log: (window.isaacLog || []).map(String), done: window.isaacDone ?? null, frame: window.isaacFrame ?? null, partial,
            consoleState: game ? guest.u32(game + consoleOffset) : null, debugFlags: game ? guest.u32(game + debugOffset) : null,
            gameFrame: game ? guest.u32(game + offsets.frame) : null, roomIndex: game ? guest.u32(game + offsets.roomIdx) | 0 : null };
        }, { gamePtr: GAME_PTR, consoleOffset: CONSOLE.state, debugOffset: OFF.debugFlags, offsets: OFF }), 5000, 'releasing workload input');
        pageLog = final.log;
        receipt.final = { frame: final.frame, gameFrame: final.gameFrame, roomIndex: final.roomIndex, done: final.done, consoleState: final.consoleState, debugFlags: final.debugFlags };
        if (!receipt.measurement && final.partial) {
          const { intervals, ...partial } = final.partial; receipt.measurement = partial;
          if (intervals?.length) receipt.metrics = metrics(intervals);
          if (partial.warmup) receipt.warmup = partial.warmup;
        }
        if (final.done !== null) fail(`engine ended: ${JSON.stringify(final.done)}`);
      } catch (e) { fail(e); }
      for (const key of new Set([...heldKeys, ...walk, ...fire, 'Enter', 'Space', 'Backquote']))
        await deadline(page.keyboard.up(key), 1000, `releasing ${key}`).catch(fail);
    }
    if (profiling && cdp) {
      try { profile = (await deadline(cdp.send('Profiler.stop'), 5000, 'stopping failed CPU profile')).profile; }
      catch (e) { fail(e); }
      profiling = false;
    }
    if (!receipt.memory.after && receipt.memory.before && page && !page.isClosed()) {
      try { receipt.memory.after = await memory('afterFailure'); } catch (e) { fail(e); }
    }
  } finally {
    if (browser) { try { await browser.close(); } catch (e) { fail(e); } }
  }
  for (const error of pageErrors) fail(`pageerror: ${error}`);
  for (const line of pageLog) if (fatalPattern.test(line)) fail(line);
  receipt.engineLogs = pageLog.filter((line) => /RNG Start Seed|Level::Init m_Stage/.test(line));
  const lines = [];
  if (receipt.metrics) {
    const m = receipt.metrics;
    lines.push(`presentations: ${m.count} intervals; mean ${m.meanFPS.toFixed(2)} fps; median/p95/p99/max ${m.medianMs.toFixed(2)}/${m.p95Ms.toFixed(2)}/${m.p99Ms.toFixed(2)}/${m.maxMs.toFixed(2)} ms; >25ms ${m.over25ms}`);
    lines.push(`first/last ${m.windowFrames} intervals: ${m.firstWindowFPS.toFixed(2)}/${m.lastWindowFPS.toFixed(2)} fps; cpu x${CPU}; ${setup.join(', ')}`);
  }
  if (profile) {
    writeFileSync(join(OUT, 'load.cpuprofile'), JSON.stringify(profile));
    const byId = new Map(profile.nodes.map((n) => [n.id, n])), parent = new Map(), self = new Map(), totalTime = new Map();
    for (const n of profile.nodes) for (const child of n.children || []) parent.set(child, n.id);
    const nameOf = (n) => n.callFrame.functionName || '(anonymous)';
    let total = 0;
    for (let i = 0; i < (profile.samples || []).length; i++) {
      const dt = profile.timeDeltas[i] || 0; total += dt;
      const id = profile.samples[i]; self.set(id, (self.get(id) || 0) + dt);
      const seen = new Set();
      for (let node = id; node !== undefined; node = parent.get(node)) {
        const n = byId.get(node); if (!n) break;
        const name = nameOf(n);
        if (!seen.has(name)) { seen.add(name); totalTime.set(name, (totalTime.get(name) || 0) + dt); }
      }
    }
    const fns = new Map();
    for (const [id, time] of self) { const n = byId.get(id); if (!n) continue; const name = nameOf(n); fns.set(name, (fns.get(name) || 0) + time); }
    const pct = (time) => (100 * time / Math.max(1, total)).toFixed(1) + '%', ms = (time) => (time / 1000).toFixed(0) + ' ms';
    receipt.profile = { sampleTimeMs: total / 1000, frames: receipt.metrics?.count ?? 0,
      includesWarmup: true, warmupFrames: receipt.warmup?.count ?? null, warmupMs: receipt.warmup?.elapsedMs ?? null,
      consoleShare: (totalTime.get('sub_0068b260') || 0) / Math.max(1, total) };
    lines.push(`profile: ${(total / 1000).toFixed(0)} ms sampled, including ${receipt.profile.warmupFrames ?? '?'} warmup frames; ${receipt.profile.frames} measured presentation intervals`);
    lines.push('top 30 by SELF time:');
    for (const [name, time] of [...fns].sort((a, b) => b[1] - a[1]).slice(0, 30)) lines.push(`  ${pct(time).padStart(6)} ${ms(time).padStart(9)}  ${name}`);
    lines.push('top 30 by TOTAL (subtree) time -- guest functions only:');
    for (const [name, time] of [...totalTime].sort((a, b) => b[1] - a[1]).filter(([name]) => /^sub_[0-9a-f]{8}$/.test(name)).slice(0, 30)) lines.push(`  ${pct(time).padStart(6)} ${ms(time).padStart(9)}  ${name}`);
    // This remains a supplemental contamination check, never proof of success.
    if (receipt.profile.consoleShare > 0.05) fail(`Console::Update occupied ${(100 * receipt.profile.consoleShare).toFixed(1)}% of CPU samples`);
  }
  receipt.status = errors.length ? 'failed' : 'complete';
  receipt.error = errors[0] || null;
  lines.unshift(`[load] ${receipt.status}${receipt.error ? ': ' + receipt.error : ''}`);
  writeFileSync(join(OUT, 'console.log'), consoleLines.join('\n'));
  writeFileSync(join(OUT, 'page.log'), pageLog.join('\n'));
  writeFileSync(join(OUT, 'summary.txt'), lines.join('\n') + '\n');
  writeFileSync(join(OUT, 'summary.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(lines.join('\n'));
  process.exitCode = errors.length ? 1 : 0;
}
