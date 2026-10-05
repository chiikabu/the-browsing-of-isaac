// drive_floors.mjs -- two distinct floor-command workloads on the real page.
// Default: console-open retention probe; its FPS is NOT gameplay FPS.
// timing=1: Enter submission to a verified, console-closed playable floor.
//   node scripts/recomp/web/drive_floors.mjs <url> <out-dir> options=<options.ini>
//        [gl=hw|swiftshader] [cpu=1] [stages=2,8,2,8] [timing=0|1] [profile=0|1] [seed=3JY16FLR]
// Run timing=1 profile=0 for latency, then profile=1 separately for attribution.
// An optional native seed restart is verified before any measured floor interval.
// Typing, opening the console, profiler setup and memory queries are outside
// loadMs. Command verification, closing the console and observing two advancing
// simulation/presentation frames are inside it. There is no fixed readiness sleep.
// The default probe retains its 2.5-second settling and 2-second FPS windows.
// Receipts retain floors/checks and add boundaries, environment, errors and state;
// timing mode writes one floor-NNN-stage-X.cpuprofile per transition if requested.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { cpus, release } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { GAME_PTR, CONSOLE, OFF, ENT, consoleSeedFiles } from '../lift/explore.mjs';
import { planTyping } from '../lift/console_typing.mjs';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) {
  console.log('usage: node drive_floors.mjs <url> <out-dir> options=<options.ini> [gl=hw] [cpu=1] [stages=...] [timing=0|1] [profile=0|1] [seed=3JY16FLR]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.map((a) => { const i = a.indexOf('='); return i < 0 ? [a, ''] : [a.slice(0, i), a.slice(i + 1)]; }));
mkdirSync(OUT, { recursive: true });
const TIMING = opt.timing === '1', PROFILE = opt.profile === '1', CPU = Number(opt.cpu ?? 1), GL = opt.gl || 'hw';
const STAGES = (opt.stages || '2,3,4,5,6,7,8,9,10,11,12,13,1c,2c,3c,4c').split(',').map((s) => s.trim()).filter(Boolean);
const seedCompact = opt.seed?.replace(/\s/g, '').toUpperCase();
const SEED = seedCompact ? `${seedCompact.slice(0, 4)} ${seedCompact.slice(4)}` : null;
const STALL_MS = 30000, READY_MS = 120000, BOOT_MS = 900000, POLL_MS = 25;
const fatalPattern = /\bTRAP\b|\[ASSERT\]|\bassertion failed\b|\bRuntimeError\b|\bmemory access out of bounds\b|\babort(?:ed)?\(|RESULT: (?:aborted|main trapped)|module instantiation failed/i;
const levelPattern = /Level::Init m_Stage (\d+), m_StageType (\d+)/;
const floors = [], checks = [], errors = [], pageErrors = [], consoleErrors = [], consoleEvents = [], nativeEvents = [], nativeErrorLogs = [];
const clockStart = performance.now(), hostCpus = cpus();
const receipt = {
  url: URL, mode: TIMING ? 'stage-command-to-playable' : 'console-open-retention', status: 'failed', error: null,
  profile: PROFILE, requested: { ...opt, timing: TIMING, profile: PROFILE, cpu: CPU, gl: GL, stages: STAGES, seed: SEED },
  floors, checks, errors, pageErrors, consoleErrors, nativeErrorLogs, browser: null, renderer: null, module: null,
  host: { platform: process.platform, arch: process.arch, release: release(), cpuModel: hostCpus[0]?.model ?? null, logicalCpus: hostCpus.length, cpuThrottle: CPU },
  cache: { browserContext: 'fresh nonpersistent context; one game navigation', floorTransitions: 'same loaded page; runtime and asset caches are not cleared', osAndDriverCaches: 'uncontrolled; separate Node module preflight can warm server/OS caches, but not Chromium caches' },
  boundaries: TIMING ? {
    metric: 'loadMs', clock: 'Node performance.now, milliseconds since driver start',
    start: 'immediately before dispatching Enter keydown for the verified stage command',
    end: 'return of the state read proving closed console, requested stage, native-log stage type, live player, idle transition, and at least two advancing simulation and presentation frames in the same room',
    excludes: 'Node manifest/module preflight, navigation, menu input, optional native seed restart, console opening, command typing, profiler setup, memory queries',
    includes: 'input dispatch/hold, command/output/log verification, empty-line Enter to close the console, readiness polling and protocol round trips',
    pollMs: POLL_MS,
  } : { metric: 'console-open FPS and Windows working set', settleMs: 2500, fpsWindowMs: 2000, playableLatency: false },
  limits: [
    'First presentation can be loading UI; it is not playable readiness.',
    'isaacFrame counts host presentation callbacks, not GPU completion or individual simulation updates.',
    'The console is driven only through normal keyboard input; no gameplay or visual content is removed.',
    'Native severity [ERROR] lines are preserved separately in nativeErrorLogs, not equated with fatal execution. JS errors, unhandled rejections, traps, assertions, aborts, rejected commands and failed readiness still invalidate the run.',
    'Native logs come from append-only window.isaacLog, independently of browser console events. Polls collect only new entries into a monotonic native sequence, timestamped at collection; replacing or shrinking the observed log fails the run.',
    'Stage/type must agree with the fresh native Level::Init event. Stage suffixes are interpreted by the game, not independently decoded by this driver.',
    SEED ? 'The requested seed is applied through the native console and verified against a fresh RNG Start Seed restart log before measured floors; setup state and log evidence are recorded separately.' : 'The engine seed is recorded, not forced. ISAAC_EPOCH alone does not fix the run seed.',
    'Repeated commands share a loaded runtime and resident caches; prior identical command counts do not prove an independently cold or warm asset cache.',
    'Module identity is verified by a streaming Node fetch before Chromium launch, using the manifest-versioned URL. Preflight bytes/time are separate from browser network/timing totals; the browser response URL/status is checked without retaining its body.',
    'CDP CPU throttling is not Chromebook hardware, GPU, memory or thermal emulation.',
    `Preflight manifest timeout: 15000 ms; preflight module timeout: ${STALL_MS} ms. Boot wait: ${BOOT_MS} ms; command/playable waits: ${READY_MS} ms; state/input/no-presentation timeout: ${STALL_MS} ms; console open/close wait: 5000 ms.`,
    TIMING ? 'loadMs is an observed end-to-end upper bound including the documented input/verification/polling overhead, not isolated Level::Init CPU time. Timing mode makes no memory or FPS claim.' : 'The default keeps the console open and pauses gameplay. Its FPS is a retention-probe liveness check, never gameplay throughput or load latency.',
    PROFILE ? 'Each V8 page CPU profile starts before Enter dispatch and stops after readiness (or failure), including protocol margins. Profiling adds overhead; do not pool with profile=0 timings. Browser, worker and GPU CPU time is not sampled.' : 'CPU profiling is disabled.',
    'Retention memory checks require positive finite Windows renderer and GPU-process working-set/private counters without query errors. No forced GC, guest-heap census, unique-process-RSS sum or VRAM measurement is performed; this bounded probe cannot exclude leaks.',
  ],
};
let browser, page, cdp, activeFloor = null, profilingFloor = null;
let lastHealthFrame = null, lastHealthMs = performance.now(), pageLog = [], nativeLogCursor = 0;
const heldKeys = new Set(), visits = new Map();
const execute = promisify(execFile);
const now = () => performance.now() - clockStart;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (e) => { const message = e?.message || String(e); if (!errors.includes(message)) errors.push(message); };
const deadline = async (promise, ms, what) => {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`timeout: ${what}`)), ms); })]); }
  finally { clearTimeout(timer); }
};
const check = (ok, what, detail) => {
  checks.push(!!ok);
  console.log(`[floors] ${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' -- ' + detail : ''}`);
  if (!ok) throw new Error(`${what}${detail ? ': ' + detail : ''}`);
};
const recordNativeLines = (lines, atMs) => {
  for (const text of lines) {
    const event = { sequence: nativeEvents.length + 1, atMs, text };
    nativeEvents.push(event);
    if (/\[ERROR\]/i.test(text)) nativeErrorLogs.push(event);
    if (fatalPattern.test(text)) fail(text);
  }
};
const state = async () => {
  if (errors.length) throw new Error(errors[0]);
  const { nativeLines, ...s } = await deadline(page.evaluate(({ gamePtr, consoleOffset, offsets, entity, cursor }) => {
    const log = window.isaacLog, previousLog = window.__isaacFloorLogReference;
    if (previousLog && previousLog !== log) throw new Error('native isaacLog was replaced');
    if (log !== undefined && !Array.isArray(log)) throw new Error('native isaacLog is not an array');
    if (log && log.length < cursor) throw new Error(`native isaacLog shrank: ${log.length} < ${cursor}`);
    if (log && !previousLog) window.__isaacFloorLogReference = log;
    const guest = window.isaacGuest, game = guest && guest.u32(gamePtr);
    const room = game ? guest.u32(game + offsets.room) : 0;
    const begin = game ? guest.u32(game + offsets.playersBegin) : 0, end = game ? guest.u32(game + offsets.playersEnd) : 0;
    const player = begin && end > begin ? guest.u32(begin) : 0;
    const width = room ? guest.u32(room + offsets.roomW) : 0, height = room ? guest.u32(room + offsets.roomH) : 0;
    return { f: window.isaacFrame || 0, done: window.isaacDone ?? null, pageNowMs: performance.now(),
      nativeLines: log ? log.slice(cursor).map(String) : [], nativeLogLength: log?.length ?? 0,
      consoleState: game ? guest.u32(game + consoleOffset) : null, stage: game ? guest.u32(game + offsets.stage) : null,
      play: { player, room, frame: game ? guest.u32(game + offsets.frame) : null,
        roomIndex: game ? guest.u32(game + offsets.roomIdx) | 0 : null, stageType: game ? guest.u32(game + offsets.stageType) : null,
        transition: game ? guest.u32(game + offsets.rt) : null,
        live: !!(player && room && width > 0 && width < 64 && height > 0 && height < 64 && !guest.u8(player + entity.dead)) } };
  }, { gamePtr: GAME_PTR, consoleOffset: CONSOLE.state, offsets: OFF, entity: ENT, cursor: nativeLogCursor }), STALL_MS, 'reading live engine state');
  s.observedAtMs = now();
  recordNativeLines(nativeLines, s.observedAtMs);
  nativeLogCursor = s.nativeLogLength; s.nativeLogSequence = nativeEvents.length;
  receipt.lastState = s;
  if (errors.length) throw new Error(errors[0]);
  if (s.done !== null) throw new Error(`engine ended before workload validation: ${JSON.stringify(s.done)}`);
  if (s.f !== lastHealthFrame) { lastHealthFrame = s.f; lastHealthMs = performance.now(); }
  else if (s.f > 0 && performance.now() - lastHealthMs >= STALL_MS) throw new Error(`isaacFrame unchanged for ${STALL_MS} ms at ${s.f}`);
  return s;
};
const until = async (fn, ms, what) => {
  const end = performance.now() + ms;
  for (;;) {
    const s = await state(), value = await fn(s);
    if (performance.now() > end) throw new Error(`timeout: ${what}`);
    if (value) return value;
    await sleep(POLL_MS);
  }
};
// boot_web.mjs appends native logs to isaacLog, not the browser console.
// Sequence numbers belong to the collected native stream and never reset.
const logMatch = (re, since = 0) => nativeEvents.find((event) => event.sequence > since && re.test(event.text)) ?? null;
const waitPlayable = async (expected = null) => {
  let first = null;
  const ready = await until((s) => {
    const p = s.play;
    if (s.consoleState !== 0 || !p.live || p.transition !== 0 ||
        (expected && (s.stage !== expected.stage || p.stageType !== expected.stageType))) { first = null; return false; }
    if (!first || first.stage !== s.stage || first.play.stageType !== p.stageType || first.play.roomIndex !== p.roomIndex ||
        first.play.room !== p.room || first.play.player !== p.player || p.frame < first.play.frame) first = s;
    return p.frame >= first.play.frame + 2 && s.f >= first.f + 2 ? s : false;
  }, READY_MS, 'closed console, correct floor, live player and advancing simulation/presentation');
  return { first, ready, gameFrameDelta: ready.play.frame - first.play.frame, presentationDelta: ready.f - first.f };
};
const readConsole = (captureOutput = false) => deadline(page.evaluate(({ gamePtr, offsets, captureOutput }) => {
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
  let output = null;
  if (captureOutput) {
    // Same Console::Print ring layout as profile_load.mjs (PE 0x006929e0).
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
  return { state: g.u32(game + offsets.state), line: string(game + offsets.line, 512), output };
}, { gamePtr: GAME_PTR, offsets: CONSOLE, captureOutput }), STALL_MS, 'reading guest console');
const down = async (key) => { heldKeys.add(key); await deadline(page.keyboard.down(key), STALL_MS, `pressing ${key}`); };
const up = async (key) => { await deadline(page.keyboard.up(key), STALL_MS, `releasing ${key}`); heldKeys.delete(key); };
const hold = async (key, ms = 100) => {
  try {
    await down(key);
    const pressedFrame = (await state()).f;
    await sleep(ms);
    await until((s) => s.f >= pressedFrame + 2, STALL_MS, `${key} held across two presentations`);
  } finally { await up(key); }
};
const typingCodes = { shift: 'ShiftLeft', space: 'Space', grave: 'Backquote', minus: 'Minus', equals: 'Equal', lbracket: 'BracketLeft',
  rbracket: 'BracketRight', backslash: 'Backslash', semicolon: 'Semicolon', quote: 'Quote', comma: 'Comma', period: 'Period', slash: 'Slash' };
const typeSlow = async (text) => {
  let previousAt = 0;
  for (const event of planTyping(text)) {
    if (event.at > previousAt) {
      const frame = (await state()).f;
      await until((s) => s.f >= frame + event.at - previousAt, STALL_MS, 'console typing key hold/gap');
      previousAt = event.at;
    }
    const code = typingCodes[event.key] || (/^\d$/.test(event.key) ? `Digit${event.key}` : `Key${event.key.toUpperCase()}`);
    await (event.down ? down(code) : up(code));
  }
  const frame = (await state()).f;
  await until((s) => s.f >= frame + 2, STALL_MS, 'final typed character');
};
const openConsole = async () => {
  const before = await readConsole();
  if (before.state !== 0 || before.line !== '') throw new Error(`console not closed and empty before opening: ${JSON.stringify(before)}`);
  await hold('Backquote', 120);
  await until(async () => (await readConsole()).state === 2, 5000, 'opening debug console');
};
const closeConsole = async () => {
  const before = await readConsole();
  if (before.line !== '') throw new Error(`refusing to close console with unexecuted line ${JSON.stringify(before.line)}`);
  // Enter on the empty line closes reliably; Backquote can insert a character.
  if (before.state === 2) {
    // Let the engine observe the submit key's release before pressing it again.
    const releasedFrame = (await state()).f;
    await until((s) => s.f >= releasedFrame + 2, STALL_MS, 'Enter release before closing the console');
    await hold('Enter', 110);
  }
  await until(async () => (await readConsole()).state === 0, 5000, 'closing debug console');
};
const readCommandOutput = async (command, timeoutMs = READY_MS) => {
  const text = command.text;
  await until(async () => (await readConsole()).line === '', timeoutMs, `executing ${text}`);
  command.cleared = true;
  const after = await readConsole(true), previous = command.beforeConsole.output.entries[0];
  const boundary = previous ? after.output.entries.findIndex((e) => e.address === previous.address) : -1;
  const limit = boundary < 0 ? after.output.entries.length : boundary + (after.output.entries[boundary].text !== previous.text ? 1 : 0);
  const output = after.output.entries.slice(0, limit).map((e) => e.text).reverse();
  command.output = output;
  const rejected = output.find((line) => /\b(?:error|invalid|unknown|failed)\b|could not|not found|not (?:a )?valid/i.test(line));
  if (rejected) throw new Error(`native console rejected ${text}: ${rejected}`);
  if (!output.includes(`>${text}`)) throw new Error(`missing native command echo for ${text}: ${JSON.stringify(output)}`);
  return output;
};
const fpsOver = async (ms) => {
  const a = await state(), started = performance.now();
  await sleep(ms);
  const b = await state();
  return (b.f - a.f) * 1000 / (performance.now() - started);
};
const memory = async () => {
  const m = { supported: process.platform === 'win32', startedAtMs: now(), error: null, processes: null };
  let browserCdp;
  try {
    Object.assign(m, await deadline(page.evaluate(() => performance.memory ? { jsHeapMB: +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) } : {}), STALL_MS, 'reading JS memory'));
    if (!m.supported) throw new Error('OS process memory counters are supported only on Windows');
    browserCdp = await browser.newBrowserCDPSession();
    const { processInfo } = await deadline(browserCdp.send('SystemInfo.getProcessInfo'), STALL_MS, 'reading process IDs');
    const types = new Map(processInfo.filter((p) => ['renderer', 'gpu'].includes(p.type.toLowerCase())).map((p) => [p.id, p.type.toLowerCase()]));
    const ids = [...types.keys()];
    if (!ids.length || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error('invalid renderer/GPU process IDs');
    const command = `Get-Process -Id ${ids.join(',')} -ErrorAction Stop | ForEach-Object { "$($_.Id)|$($_.WorkingSet64)|$($_.PrivateMemorySize64)" }`;
    const { stdout, stderr } = await execute('powershell', ['-NoProfile', '-NonInteractive', '-Command', command], { encoding: 'utf8', timeout: STALL_MS });
    if (stderr.trim()) throw new Error(`OS process query: ${stderr.trim()}`);
    const seen = new Set();
    m.processes = stdout.trim().split(/\r?\n/).filter(Boolean).map((line) => {
      const fields = line.split('|'), [pid, workingSetBytes, privateBytes] = fields.map(Number);
      if (fields.length !== 3 || ![pid, workingSetBytes, privateBytes].every((v) => Number.isSafeInteger(v) && v > 0) || !types.has(pid) || seen.has(pid))
        throw new Error(`invalid OS process memory row: ${line}`);
      seen.add(pid);
      return { pid, type: types.get(pid), workingSetBytes, privateBytes };
    });
    if (ids.some((id) => !seen.has(id))) throw new Error('OS process query omitted a renderer/GPU process');
    for (const type of ['renderer', 'gpu']) {
      const rows = m.processes.filter((p) => p.type === type);
      if (!rows.length) throw new Error(`no ${type} OS memory counters collected`);
      m[`${type}WorkingSetMB`] = +(Math.max(...rows.map((p) => p.workingSetBytes)) / 1048576).toFixed(1);
    }
  } catch (e) { m.error = e.message; }
  finally {
    if (browserCdp) await browserCdp.detach().catch((e) => { m.error ||= e.message; });
    m.finishedAtMs = now();
  }
  return m;
};
const stopProfile = async (complete) => {
  const entry = profilingFloor;
  if (!entry) return;
  const result = await deadline(cdp.send('Profiler.stop'), STALL_MS, 'stopping floor CPU profile');
  profilingFloor = null;
  if (!result.profile) throw new Error('CPU profiler returned no profile');
  writeFileSync(join(OUT, entry.profile.file), JSON.stringify(result.profile));
  Object.assign(entry.profile, { complete, stoppedAtMs: now(), durationMs: (result.profile.endTime - result.profile.startTime) / 1000 });
};

try {
  if (!opt.options) throw new Error('options=<options.ini> is required');
  for (const name of ['timing', 'profile']) if (opt[name] !== undefined && !['0', '1'].includes(opt[name])) throw new Error(`${name} must be 0 or 1`);
  if (PROFILE && !TIMING) throw new Error('profile=1 requires timing=1; default retention workload remains unprofiled');
  if (!Number.isFinite(CPU) || CPU < 1) throw new Error('cpu must be finite and at least 1');
  if (!['hw', 'swiftshader'].includes(GL)) throw new Error('gl must be hw or swiftshader');
  if (!STAGES.length || STAGES.some((s) => !/^[1-9]\d*[a-c]?$/.test(s) || !Number.isSafeInteger(parseInt(s, 10)))) throw new Error('stages must be comma-separated positive integers with optional a/b/c suffix');
  if (opt.seed !== undefined && !/^[A-Z0-9]{8}$/.test(seedCompact)) throw new Error('seed must contain eight letters/digits (optional middle space)');
  const target = new globalThis.URL(URL);
  if (target.searchParams.get('persist') === '0') throw new Error('persist=0 disables the options.ini seed; enable persistence');
  const optionsText = consoleSeedFiles([], readFileSync(opt.options, 'utf8'))[0].text;
  receipt.seededOptions = { file: opt.options, sha256: createHash('sha256').update(optionsText).digest('hex'), EnableDebugConsole: 1, SaveCommandHistory: 1, VSync: 0 };
  const manifestUrl = new globalThis.URL('dist.json', target).href;
  const preflight = { startedAtMs: now(), finishedAtMs: null, elapsedMs: null, status: 'failed',
    excludedFromBrowserTiming: true, excludedFromBrowserNetworkTotals: true, decodedModuleBytes: 0 };
  receipt.module = { manifestUrl, url: null, path: 'boot.wasm', sha256: null, manifestSha256: null, manifestSize: null,
    hashSource: 'streaming Node preflight fetch before Chromium launch', preflight, browserResponse: null };
  try {
    const response = await fetch(manifestUrl, { signal: AbortSignal.timeout(15000), headers: { 'accept-encoding': 'identity' } });
    if (!response.ok) throw new Error(`dist.json HTTP ${response.status}`);
    const manifest = await response.json(), moduleEntry = manifest.files?.find((f) => f.path === 'boot.wasm');
    if (!/^[a-f\d]{64}$/i.test(moduleEntry?.sha256 ?? '')) throw new Error('dist.json has no valid boot.wasm SHA-256');
    if (!Number.isSafeInteger(moduleEntry.size) || moduleEntry.size <= 0) throw new Error('dist.json has no valid boot.wasm size');
    receipt.module.manifestSha256 = moduleEntry.sha256.toLowerCase();
    receipt.module.manifestSize = moduleEntry.size;
    // Match play.mjs's manifest-based ?v=<first 16 SHA-256 characters> URL.
    const moduleUrl = new globalThis.URL(moduleEntry.path, target);
    moduleUrl.searchParams.set('v', moduleEntry.sha256.slice(0, 16));
    receipt.module.url = moduleUrl.href;
    const moduleResponse = await fetch(moduleUrl, { signal: AbortSignal.timeout(STALL_MS), headers: { 'accept-encoding': 'identity' } });
    preflight.httpStatus = moduleResponse.status;
    if (!moduleResponse.ok || !moduleResponse.body) throw new Error(`boot.wasm preflight HTTP ${moduleResponse.status}`);
    const hash = createHash('sha256');
    for await (const chunk of moduleResponse.body) {
      hash.update(chunk);
      preflight.decodedModuleBytes += chunk.byteLength;
    }
    receipt.module.sha256 = hash.digest('hex');
    receipt.module.size = preflight.decodedModuleBytes;
    if (receipt.module.sha256 !== receipt.module.manifestSha256) throw new Error('preflight boot.wasm hash differs from dist.json');
    if (receipt.module.size !== receipt.module.manifestSize) throw new Error(`preflight boot.wasm size differs from dist.json: ${receipt.module.size} != ${receipt.module.manifestSize}`);
    preflight.status = 'complete';
  } finally {
    preflight.finishedAtMs = now();
    preflight.elapsedMs = preflight.finishedAtMs - preflight.startedAtMs;
  }
  const glArgs = GL === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
  browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync', '--mute-audio'] });
  receipt.browser = { version: browser.version(), headless: true, viewport: { width: 1280, height: 720 }, gl: GL, cpuThrottle: CPU };
  page = await browser.newPage({ viewport: receipt.browser.viewport });
  page.on('console', (message) => {
    const text = message.text(), event = { sequence: consoleEvents.length + 1, atMs: now(), type: message.type(), text };
    consoleEvents.push(event);
    if (message.type() === 'error') { consoleErrors.push(text); fail(`console error: ${text}`); }
    if (fatalPattern.test(text)) fail(text);
  });
  page.on('pageerror', (e) => { const text = String(e); pageErrors.push(text); fail(`pageerror: ${text}`); });
  page.on('crash', () => fail('browser page crashed'));
  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('UNHANDLEDREJECTION ' + String(event.reason?.stack || event.reason));
    });
  });
  cdp = await page.context().newCDPSession(page);
  if (CPU !== 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  page.on('response', (res) => {
    if (res.url().split('?')[0] !== receipt.module.url.split('?')[0]) return;
    receipt.module.browserResponse = { url: res.url(), status: res.status() };
    if (res.url() !== receipt.module.url) fail(`browser module URL differs from verified preflight: ${res.url()}`);
  });
  await page.goto(target.origin + '/instance_index.json');
  await deadline(page.evaluate(async (arr) => new Promise((resolve, reject) => {
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
  }), [...Buffer.from(optionsText)]), STALL_MS, 'seeding options.ini');
  check(true, 'options.ini seeded into the save store');
  receipt.navigationAtMs = now();
  await page.goto(URL, { timeout: BOOT_MS, waitUntil: 'domcontentloaded' });
  const firstFrame = await until((s) => s.f > 0 && s, BOOT_MS, 'first presentation (not playable)');
  receipt.firstPresentation = firstFrame;
  check(true, 'first presentation (not playable)', `${(firstFrame.observedAtMs - receipt.navigationAtMs).toFixed(1)} ms`);
  const observedModule = receipt.module.browserResponse;
  if (!observedModule || observedModule.status < 200 || observedModule.status >= 300) throw new Error('successful boot.wasm response was not observed');
  receipt.renderer = await page.evaluate(() => {
    const canvas = document.querySelector('canvas'), gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : null),
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : null, userAgent: navigator.userAgent };
  });
  let enters = 0;
  while (!(await state()).play.live) {
    if (enters >= 30) throw new Error('no run after 30 menu-input attempts');
    await hold('Enter'); await sleep(500);
    if (!(await state()).play.live) { await hold('Space'); await sleep(2000); }
    enters += 1;
  }
  const startup = await waitPlayable();
  const first = nativeEvents.findLast((event) => {
    const match = levelPattern.exec(event.text);
    return match && Number(match[1]) === startup.ready.stage && Number(match[2]) === startup.ready.play.stageType;
  });
  if (!first) throw new Error('playable startup has no matching native Level::Init log');
  receipt.startup = { ...startup, nativeInit: first, menuAttempts: enters, seedLog: logMatch(/RNG Start Seed/)?.text ?? null };
  check(true, 'a playable run started', first.text.replace(/^.*Level::Init /, ''));
  let startingReady = startup.ready;
  if (SEED) {
    const setup = receipt.seedSetup = { requested: SEED, seedVerified: false, startedAtMs: now(), excludedFromLoadMs: true, startingState: startup.ready };
    await openConsole();
    const text = `seed ${SEED}`, before = await readConsole(true);
    const command = setup.command = { text, typed: null, cleared: false, output: [], beforeConsole: before };
    if (before.state !== 2 || before.line !== '') throw new Error(`console not ready for ${text}: ${JSON.stringify(before)}`);
    await typeSlow(text);
    const typed = await readConsole(); command.typed = typed.line;
    if (typed.state !== 2 || typed.line !== text) throw new Error(`console typed ${JSON.stringify(typed.line)}, expected ${JSON.stringify(text)}`);
    setup.submissionState = await state();
    command.logSequenceBefore = setup.submissionState.nativeLogSequence;
    setup.submittedAtMs = now();
    await hold('Enter', 110); await sleep(500);
    await readCommandOutput(command, 5000);
    const seedEvent = await until(() => logMatch(/RNG Start Seed:/, command.logSequenceBefore), STALL_MS, 'native seed restart');
    const match = /RNG Start Seed:\s*([A-Z0-9]{4} [A-Z0-9]{4})\s+\((\d+)\)\s+\[New,/.exec(seedEvent.text);
    Object.assign(setup, { nativeSeedEvent: seedEvent, seedLog: seedEvent.text, seed: match?.[1] ?? null,
      seedValue: match ? Number(match[2]) : null, seedVerified: match?.[1] === SEED });
    if (!setup.seedVerified) throw new Error(`native seed restart mismatch: requested ${SEED}; ${seedEvent.text}`);
    await until(async () => [0, 2].includes((await readConsole()).state), 5000, 'console after seed restart');
    // The seed command may leave its console open. Close it before proving the
    // restarted room advances; each workload reopens only when it needs input.
    await closeConsole();
    const playable = await waitPlayable();
    setup.readyState = playable.ready;
    setup.advancement = { first: playable.first, gameFrameDelta: playable.gameFrameDelta, presentationDelta: playable.presentationDelta };
    setup.nativeInit = logMatch(levelPattern, command.logSequenceBefore);
    setup.finishedAtMs = now();
    startingReady = playable.ready;
    check(true, 'requested native seed restart verified and playable', `${SEED}; ${setup.seedValue}`);
  }
  floors.push({ stage: 'start', mode: receipt.mode, status: 'complete', readyState: startingReady,
    ...(TIMING ? {} : { ...(await memory()), fps: +(await fpsOver(2000)).toFixed(1) }) });
  console.log(`[floors] ${receipt.mode} start: ${JSON.stringify(floors[0])}`);
  if (PROFILE) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); }
  if (!TIMING) await openConsole();
  for (const [index, st] of STAGES.entries()) {
    const entry = { stage: st, mode: receipt.mode, status: 'failed', profileEnabled: PROFILE, init: null, error: null,
      cache: { sameDocument: true, cachesCleared: false, priorIdenticalCommands: visits.get(st) ?? 0 },
      startingState: TIMING ? (await waitPlayable()).ready : await state(), readyState: null };
    floors.push(entry); activeFloor = entry;
    if (TIMING) await openConsole();
    const text = `stage ${st}`, before = await readConsole(true);
    entry.command = { text, typed: null, cleared: false, output: [], beforeConsole: before };
    if (before.state !== 2 || before.line !== '') throw new Error(`console not ready for ${text}: ${JSON.stringify(before)}`);
    await typeSlow(text);
    const typed = await readConsole(); entry.command.typed = typed.line;
    if (typed.state !== 2 || typed.line !== text) throw new Error(`console typed ${JSON.stringify(typed.line)}, expected ${JSON.stringify(text)}`);
    if (PROFILE) {
      entry.profile = { file: `floor-${String(index + 1).padStart(3, '0')}-stage-${st}.cpuprofile`, complete: false, startingAtMs: now() };
      await cdp.send('Profiler.start'); profilingFloor = entry;
      entry.profile.startedAtMs = now();
    }
    entry.submissionState = await state();
    entry.command.logSequenceBefore = entry.submissionState.nativeLogSequence;
    entry.submittedAt = new Date().toISOString();
    entry.submittedAtMs = now();
    await hold('Enter', 110);
    const output = await readCommandOutput(entry.command);
    if (!output.some((line) => /Changed stage\./.test(line)))
      throw new Error(`missing native Changed stage. output for ${text}: ${JSON.stringify(output)}`);
    const init = await until(() => logMatch(levelPattern, entry.command.logSequenceBefore), READY_MS, `fresh native init for ${text}`);
    const match = levelPattern.exec(init.text), expected = { stage: parseInt(st, 10), stageType: Number(match[2]) };
    entry.nativeInit = init; entry.init = init.text.replace(/^.*Level::Init /, '');
    if (Number(match[1]) !== expected.stage) throw new Error(`wrong native stage for ${text}: ${init.text}`);
    visits.set(st, (visits.get(st) ?? 0) + 1);
    if (TIMING) {
      await closeConsole();
      entry.consoleClosedAtMs = now();
      const playable = await waitPlayable(expected);
      entry.readyState = playable.ready;
      entry.advancement = { first: playable.first, gameFrameDelta: playable.gameFrameDelta, presentationDelta: playable.presentationDelta };
      entry.readyAtMs = playable.ready.observedAtMs;
      entry.loadMs = entry.readyAtMs - entry.submittedAtMs;
      await stopProfile(true);
      check(Number.isFinite(entry.loadMs) && entry.loadMs > 0, `stage ${st} command-to-playable`, `${entry.loadMs.toFixed(1)} ms; profile=${PROFILE ? 1 : 0}; ${entry.init}`);
    } else {
      await sleep(2500); // Historical console-open retention workload, not readiness.
      entry.fps = +(await fpsOver(2000)).toFixed(1);
      Object.assign(entry, await memory());
      entry.retentionState = await state();
      check(entry.retentionState.consoleState === 2 && entry.retentionState.stage === expected.stage && entry.retentionState.play.stageType === expected.stageType && entry.fps > 20,
        `stage ${st} console-open retention`, `${entry.init}; ${entry.fps} fps; renderer ${entry.rendererWorkingSetMB} MB, gpu ${entry.gpuWorkingSetMB} MB`);
    }
    entry.status = 'complete'; activeFloor = null;
  }
  if (!TIMING) {
    await closeConsole();
    const validMemory = floors.every((f) => !f.error && [f.rendererWorkingSetMB, f.gpuWorkingSetMB].every((v) => Number.isFinite(v) && v > 0));
    check(validMemory, 'positive finite renderer/GPU memory counters without query errors', floors.find((f) => f.error)?.error || 'all floor samples required');
    const ws = floors.map((f) => f.rendererWorkingSetMB), gpu = floors.map((f) => f.gpuWorkingSetMB), grew = Math.max(...ws) - ws[0];
    check(grew < 400, 'the renderer working set stays within 400 MB of the first floor across the sweep', `${ws[0]} -> ${Math.max(...ws)} MB (max), gpu max ${Math.max(...gpu)} MB`);
  }
  await state();
  await page.screenshot({ path: join(OUT, 'last-floor.png'), timeout: STALL_MS });
  check(!errors.length, 'no page or fatal engine error across the sweep', errors[0]);
  receipt.status = 'complete';
} catch (e) {
  fail(e); checks.push(false);
  if (activeFloor) { activeFloor.status = 'failed'; activeFloor.error = e.message || String(e); }
  console.log(`[floors] FAIL the drive -- ${e.message || e}`);
  if (page) await page.screenshot({ path: join(OUT, 'failure.png'), timeout: 5000 }).catch(() => {});
} finally {
  if (profilingFloor) await stopProfile(false).catch(fail);
  if (page && !page.isClosed()) {
    for (const key of heldKeys) await deadline(page.keyboard.up(key), 1000, `releasing ${key}`).catch(fail);
    try {
      pageLog = await deadline(page.evaluate((cursor) => {
        const log = window.isaacLog, previousLog = window.__isaacFloorLogReference;
        if (previousLog && previousLog !== log) throw new Error('native isaacLog was replaced');
        if (log !== undefined && !Array.isArray(log)) throw new Error('native isaacLog is not an array');
        if (log && log.length < cursor) throw new Error(`native isaacLog shrank: ${log.length} < ${cursor}`);
        return log ? log.map(String) : [];
      }, nativeLogCursor), 5000, 'saving page log');
      recordNativeLines(pageLog.slice(nativeLogCursor), now());
      nativeLogCursor = pageLog.length;
    }
    catch (e) { fail(e); }
  }
  if (browser) await browser.close().catch(fail);
  for (const line of pageLog) if (fatalPattern.test(line)) fail(line);
  if (errors.length) receipt.status = 'failed';
  receipt.error = errors[0] ?? null;
  receipt.elapsedMs = now();
  writeFileSync(join(OUT, 'floors.json'), JSON.stringify(receipt, null, 1));
  writeFileSync(join(OUT, 'page.log'), pageLog.join('\n'));
  writeFileSync(join(OUT, 'console.log'), consoleEvents.map((e) => `[${e.sequence} ${e.atMs.toFixed(3)} ms ${e.type}] ${e.text}`).concat(pageErrors.map((e) => `PAGEERROR ${e}`)).join('\n'));
  writeFileSync(join(OUT, 'console-events.json'), JSON.stringify(consoleEvents, null, 1));
  writeFileSync(join(OUT, 'native-events.json'), JSON.stringify(nativeEvents, null, 1));
  const ok = receipt.status === 'complete' && checks.every(Boolean);
  console.log(`[floors] ${receipt.mode} ${ok ? 'PASS' : 'FAIL'}: ${checks.filter(Boolean).length}/${checks.length} checks; ${floors.filter((f) => f.stage !== 'start' && f.status === 'complete').length} floor(s); profile=${PROFILE ? 1 : 0}`);
  process.exitCode = ok ? 0 : 1;
}
