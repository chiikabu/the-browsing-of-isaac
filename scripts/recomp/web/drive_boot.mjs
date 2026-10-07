// drive_boot.mjs -- navigation to native title and first playable room.
//   node scripts/recomp/web/drive_boot.mjs <url> <out-dir> [gl=hw] [cpu=4]
//        [visits=2] [fresh=1] [profile=0] [net=<Mbit/s>] [timeout=900]
//        [hide_at=<frame> hide_s=<seconds>]
// The first visit uses a fresh OUT/profile by default; later visits restart
// Chromium with that profile's HTTP/code cache and boot trail, but fresh saves.
// profile=1 is a separate attribution run, not an unprofiled timing baseline.
// Frame 1/300/600 are polling diagnostics, never native readiness boundaries.
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import { GAME_PTR, CONSOLE, OFF, ENT } from '../lift/explore.mjs';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) {
  console.error('usage: node drive_boot.mjs <url> <out-dir> [visits=2] [cpu=4] [gl=hw] [profile=0] [fresh=1] [timeout=900]');
  process.exit(2);
}
const opt = Object.fromEntries(rest.map((arg) => {
  const i = arg.indexOf('=');
  return i < 0 ? [arg, ''] : [arg.slice(0, i), arg.slice(i + 1)];
}));
mkdirSync(OUT, { recursive: true });
const PROFILE_DIR = resolve(OUT, 'profile');
const cpu = Number(opt.cpu ?? 4), visits = Number(opt.visits ?? 2), gl = opt.gl || 'hw';
const profilingEnabled = opt.profile === '1', fresh = opt.fresh !== '0';
const netMbps = Number(opt.net ?? 0), timeoutMs = Number(opt.timeout ?? 900) * 1000;
const hideAt = Number(opt.hide_at ?? 0), hideS = Number(opt.hide_s ?? 10);
const viewport = { width: 1280, height: 720 };
const glArgs = gl === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browserArgs = [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync', '--mute-audio'];
// MenuManager::Init's caller and screen field, as documented in play.mjs.
const MENU_MGR_PTR = 0x00c72a20, MENU_SCREEN_OFF = 0x40;
const fatalPattern = /\bTRAP\b|\[ASSERT\]|\bassertion failed\b|\bRuntimeError\b|\bmemory access out of bounds\b|\bAborted\(|RESULT: (?:aborted|main trapped)|module instantiation failed|lazy (?:read|pread) FAILED|reader Worker failed/i;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const bounded = async (promise, ms, what) => {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`timeout: ${what}`)), Math.max(0, ms));
    })]);
  } finally { clearTimeout(timer); }
};
const receipt = {
  url: URL, status: 'failed', errors: [], profile: profilingEnabled, cpu,
  requested: { ...opt, visits, cpu, gl, profile: profilingEnabled, fresh, netMbps, timeoutMs, hideAt, hideS },
  profileDirectory: PROFILE_DIR,
  machine: { platform: platform(), release: release(), arch: arch(), cpuModel: cpus()[0]?.model ?? null,
    logicalCpus: cpus().length, totalMemoryBytes: totalmem() },
  boundaries: {
    start: 'Host monotonic timestamp immediately before page.goto; browser launch, save reset and manifest/control requests are excluded.',
    firstVisible: 'First poll observing the native canvas visible without the HTML loading overlay, whether showing the intro or a menu. Recorded before any intro input.',
    titleVisible: 'First poll observing native MenuManager screen 1, a visible canvas without the HTML loading overlay, and at least two further presentations on that screen. Screenshot is taken before any title-menu input.',
    firstPlayable: 'First poll observing a live player and valid room, closed debug console, no transition, and the same stage/type/room index/player advancing at least two GameFrames and two presentations.',
    diagnostics: 'First poll observing isaacFrame >= 1/300/600; recorded frame and observation time may overshoot the threshold. These are not readiness metrics.',
  },
  limits: [
    'Polling observations are upper bounds on readiness, not exact native event or GPU-completion timestamps. Polls normally pause 50 ms; browser work, input and screenshots can delay them.',
    'Title evidence capture and ordinary Enter/Space input are included in navigation-to-playable time. Intro skips use the existing host input queue for one presentation, only while the canvas is visible, after the native intro-start log and before any MenuManager screen exists; menu holds start only after the title screenshot. No guest memory or production content is changed.',
    'An intro pulse enqueues keyup at the next host presentation; delivery still waits for the native input poll. Saved pulse frame/menu/page-time observations do not imply an exact simulation tick or GPU-completion boundary.',
    'After title capture, live-player state gates menu input and readiness; menu 5 can still be character selection and is not proof that a run has started.',
    'Cold means a fresh browser profile, not a cold OS/server disk cache. Warm means retained Chromium disk HTTP/code cache and local boot trail, not proven Wasm code-cache reuse; each visit starts a new browser process.',
    'The only deleted browser profile is OUT/profile when fresh=1. Only the isaac-saves IndexedDB database is reset between visits; localStorage and other databases are retained.',
    'Network totals cover the page-target CDP Network session only. Dedicated reader-worker fetches and their cache hits/bytes are not fully covered; isaacLazyStats reports consumed archive windows, not total wire traffic.',
    'Encoded network bytes count finished page-target requests only; in-flight bodies, cache delivery and worker downloads are not total transferred bytes. Out-of-band manifest checks and the pre-navigation control page are excluded.',
    'CDP CPU throttling is not Chromebook hardware. net= configures CDP page-target throttling with 20 ms latency; worker throttling is not independently verified.',
    'Module identity is the boot.wasm SHA-256 declared by a saved dist.json, not a second download/hash of the module. The manifest must remain byte-identical across page navigation, visit endpoints and visits.',
    profilingEnabled ? 'CPU sampling is enabled: do not pool these timings with profile=0. Profiles cover the page V8 isolate (JS/Wasm), not reader workers, GPU, browser/network processes or whole-system CPU.' : 'CPU sampling is disabled; readiness polling and evidence capture remain enabled.',
    'hide_at is an optional synthetic document.hidden override, not an OS occlusion test. Such runs are a separate workload from normal cold/warm baselines.',
  ],
  results: [],
};
const fail = (list, error) => {
  const message = error?.message || String(error);
  if (!list.includes(message)) list.push(message);
};
let immutableManifest = null;

async function visit(number, target) {
  const r = {
    visit: number, status: 'failed', errors: [], pageErrors: [], consoleErrors: [], inputs: [], profile: null,
    cache: { label: number === 1 ? (fresh ? 'cold-fresh-profile' : 'existing-profile-uncontrolled') : 'warm-retained-profile',
      browserProcess: 'new per visit', saveDatabase: 'isaac-saves', savesReset: false,
      httpAndCodeCache: number === 1 && fresh ? 'fresh; HTTP cache cleared after control navigation' : 'retained; actual cache reuse is not guaranteed',
      bootTrailBefore: null, bootTrailAfter: null },
    navigation: null, firstVisible: null, titleVisible: null, firstPlayable: null, hidden: null,
    introStarted: null, introInputStopped: null, titleFirstObserved: null,
    diagnostics: { frame1: null, frame300: null, frame600: null },
    browser: null, renderer: null, module: null, lastState: null, lazyAtPlayable: null, lazyFinal: null,
    networkAtPlayable: null, networkFinal: null,
  };
  receipt.results.push(r);
  const end = performance.now() + timeoutMs;
  const within = (promise, what, cap = 60000) => bounded(promise, Math.min(cap, end - performance.now()), what);
  const check = () => {
    if (r.errors.length) throw new Error(r.errors[0]);
    if (performance.now() >= end) throw new Error(`timeout: visit ${number} (${timeoutMs} ms including preparation)`);
  };
  let ctx, page, cdp, navStart = null, profiling = false, profile = null, hiddenActive = false;
  let logCursor = 0, collecting = false, servedManifest = null;
  const heldKeys = new Set(), engineLog = [], consoleLog = [], network = [], requests = new Map(), manifestReads = [];
  const sinceNavigation = () => navStart === null ? null : performance.now() - navStart;
  const optional404 = (url, status) => status === 404 && /\/(?:boot-trail\.json|favicon\.ico)(?:[?#]|$)/.test(url);
  const point = (s) => ({ sinceNavigationCallMs: s.sinceNavigationCallMs, observedAtPageMs: s.pageMs,
    pageTimeOrigin: s.pageTimeOrigin, observedFrame: s.f, menu: s.menu, stage: s.stage, consoleState: s.consoleState, play: s.play });
  const networkSummary = () => {
    const byType = {};
    for (const row of network) {
      const type = row.type || 'Other';
      const group = byType[type] ||= { requests: 0, finished: 0, encodedBytes: 0 };
      group.requests++;
      if (row.finished) { group.finished++; group.encodedBytes += row.encodedBytes; }
    }
    return { sinceNavigationCallMs: sinceNavigation(), coverage: 'page-target CDP only; reader-worker traffic incomplete',
      requests: network.length, finished: network.filter((row) => row.finished).length,
      inFlight: network.filter((row) => !row.finished && !row.failed && !row.redirected).length,
      encodedBytesFinished: network.reduce((n, row) => n + (row.finished ? row.encodedBytes : 0), 0),
      diskCacheResponses: network.filter((row) => row.fromDiskCache).length,
      cacheServedEvents: network.filter((row) => row.servedFromCache).length,
      serviceWorkerResponses: network.filter((row) => row.fromServiceWorker).length,
      failed: network.filter((row) => row.failed).length,
      httpErrors: network.filter((row) => row.status >= 400).map((row) => ({ url: row.url, status: row.status, optional: optional404(row.url, row.status) })), byType };
  };
  const state = async () => {
    check();
    const s = await within(page.evaluate(({ cursor, gamePtr, consoleOffset, offsets, entity, menuPtr, menuOffset }) => {
      const log = window.isaacLog || [], guest = window.isaacGuest;
      const game = guest && guest.u32(gamePtr), manager = guest && guest.u32(menuPtr);
      const room = game ? guest.u32(game + offsets.room) : 0;
      const begin = game ? guest.u32(game + offsets.playersBegin) : 0, finish = game ? guest.u32(game + offsets.playersEnd) : 0;
      const player = begin && finish > begin ? guest.u32(begin) : 0;
      const width = room ? guest.u32(room + offsets.roomW) : 0, height = room ? guest.u32(room + offsets.roomH) : 0;
      const canvas = document.querySelector('canvas'), overlay = document.getElementById('overlay'), error = document.getElementById('error');
      const box = canvas?.getBoundingClientRect(), style = canvas ? getComputedStyle(canvas) : null;
      return { pageMs: performance.now(), pageTimeOrigin: performance.timeOrigin, f: window.isaacFrame || 0,
        n: log.length, logs: log.slice(Math.min(cursor, log.length)), done: window.isaacDone ?? null,
        menu: manager ? guest.u32(manager + menuOffset) | 0 : -1,
        canvasVisible: !!(box?.width && box?.height && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0' && !document.hidden && (!overlay || overlay.hidden)),
        htmlPlayVisible: !!document.getElementById('play') && !document.getElementById('play').hidden,
        errorPanel: error && !error.hidden ? error.textContent : null,
        consoleState: game ? guest.u32(game + consoleOffset) : null,
        stage: game ? guest.u32(game + offsets.stage) : null,
        play: { player, room, frame: game ? guest.u32(game + offsets.frame) : null,
          roomIndex: game ? guest.u32(game + offsets.roomIdx) | 0 : null,
          stageType: game ? guest.u32(game + offsets.stageType) : null,
          live: !!(player && room && width > 0 && width < 64 && height > 0 && height < 64 && !guest.u8(player + entity.dead)),
          transition: game ? guest.u32(game + offsets.rt) : null },
        lazy: typeof window.isaacLazyStats === 'function' ? window.isaacLazyStats() : null };
    }, { cursor: logCursor, gamePtr: GAME_PTR, consoleOffset: CONSOLE.state, offsets: OFF, entity: ENT,
      menuPtr: MENU_MGR_PTR, menuOffset: MENU_SCREEN_OFF }), 'reading native boot state');
    s.sinceNavigationCallMs = sinceNavigation();
    logCursor = s.n;
    engineLog.push(...s.logs);
    for (const line of s.logs) if (fatalPattern.test(line)) fail(r.errors, line);
    if (!r.introStarted) {
      const introLog = s.logs.find((line) => /\bplaying cutscene 1 \(Intro\)/i.test(line));
      if (introLog) r.introStarted = { ...point(s), log: introLog };
    }
    // Screen 0 is menu initialization, not the skippable intro. A key held
    // there can be consumed by the title before the next driver poll.
    if (s.menu >= 0 && !r.introInputStopped) r.introInputStopped = point(s);
    if (s.menu === 1 && !r.titleFirstObserved) r.titleFirstObserved = point(s);
    if (s.canvasVisible && !r.firstVisible) r.firstVisible = point(s);
    if (s.errorPanel) fail(r.errors, `page error panel: ${s.errorPanel}`);
    if (s.done !== null) fail(r.errors, `engine ended: ${JSON.stringify(s.done)}`);
    r.lastState = point(s);
    r.lazyFinal = s.lazy;
    for (const frame of [1, 300, 600]) if (!r.diagnostics[`frame${frame}`] && s.f >= frame)
      r.diagnostics[`frame${frame}`] = { thresholdFrame: frame, isReadiness: false, ...point(s) };
    check();
    return s;
  };
  const restoreVisibility = () => page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const poll = async () => {
    let s = await state();
    if (hideAt > 0 && !r.hidden && s.f >= hideAt) {
      r.hidden = { requestedFrame: hideAt, seconds: hideS, before: point(s), after: null };
      hiddenActive = true;
      try {
        await within(page.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
          document.dispatchEvent(new Event('visibilitychange'));
        }), 'hiding probe document');
        const hiddenStart = performance.now();
        while (performance.now() - hiddenStart < hideS * 1000) { await sleep(50); s = await state(); }
        r.hidden.after = point(s);
        r.hidden.framesWhileHidden = s.f - r.hidden.before.observedFrame;
        r.hidden.actualHiddenMs = performance.now() - hiddenStart;
      } finally {
        await bounded(restoreVisibility(), 5000, 'restoring document visibility');
        hiddenActive = false;
      }
      s = await state();
    }
    return s;
  };
  const hold = async (key, before, intro = false) => {
    const input = { key, before: point(before), keydownIssuedSinceNavigationMs: sinceNavigation(), keyupIssuedSinceNavigationMs: null, afterRelease: null };
    r.inputs.push(input);
    if (intro) {
      input.mode = 'intro-one-presentation-host-input';
      let completed = false;
      try {
        input.pulse = await within(page.evaluate(({ key, menuPtr, menuOffset }) => {
          const observe = () => {
            const guest = window.isaacGuest, manager = guest && guest.u32(menuPtr);
            const canvas = document.querySelector('canvas'), overlay = document.getElementById('overlay');
            const box = canvas?.getBoundingClientRect(), style = canvas ? getComputedStyle(canvas) : null;
            return { observedAtPageMs: performance.now(), observedFrame: window.isaacFrame || 0,
              menu: manager ? guest.u32(manager + menuOffset) | 0 : -1,
              canvasVisible: !!(box?.width && box?.height && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0' && !document.hidden && (!overlay || overlay.hidden)) };
          };
          const before = observe();
          // Check at delivery time, not just before the CDP round trip.
          if (!before.canvasVisible) return { sent: false, reason: 'canvas not visible', before };
          if (before.menu !== -1 || !(window.isaacLog || []).some((line) => /\bplaying cutscene 1 \(Intro\)/i.test(line)))
            return { sent: false, reason: 'intro no longer active', before };
          const descriptor = Object.getOwnPropertyDescriptor(window, 'isaacFrame');
          if (!descriptor?.configurable || ('value' in descriptor ? !descriptor.writable : !descriptor.get || !descriptor.set))
            throw new Error('isaacFrame cannot be observed without changing its semantics');
          if (typeof window.isaacInjectKey !== 'function') throw new Error('isaacInjectKey is unavailable');
          if (window.__isaacBootIntroRelease) throw new Error('an intro pulse is already active');
          // Same presentation-observer pattern as profile_load.mjs. Release
          // in the browser, before a second presentation or slow CDP poll.
          return new Promise((done, reject) => {
            let value = descriptor.value, active = true;
            const get = descriptor.get || (() => value);
            const release = (reason, error = null) => {
              if (!active) return;
              active = false;
              let after;
              try { window.isaacInjectKey(key, false); after = observe(); }
              catch (failure) { error ||= failure; }
              finally {
                Object.defineProperty(window, 'isaacFrame', 'value' in descriptor ? { ...descriptor, value } : descriptor);
                delete window.__isaacBootIntroRelease;
              }
              if (error) reject(error);
              else done({ sent: true, before, after, reason });
            };
            window.__isaacBootIntroRelease = release;
            Object.defineProperty(window, 'isaacFrame', { configurable: descriptor.configurable, enumerable: descriptor.enumerable, get,
              set(next) {
                const previous = get.call(this);
                if (descriptor.set) descriptor.set.call(this, next); else value = next;
                const current = get.call(this);
                if (current === previous) return;
                if (!Number.isSafeInteger(current) || current !== previous + 1)
                  release('invalid-presentation-counter', new Error(`non-sequential isaacFrame: ${previous} -> ${current}`));
                else release('next-presentation');
              },
            });
            try { window.isaacInjectKey(key, true); }
            catch (error) { release('keydown-failed', error); }
          });
        }, { key, menuPtr: MENU_MGR_PTR, menuOffset: MENU_SCREEN_OFF }), 'pulsing intro key for one presentation');
        completed = true;
        input.keyupIssuedSinceNavigationMs = null; // Exact page-time release is in pulse.after.
        const observed = input.pulse.after || input.pulse.before;
        const observedPoint = { ...observed, sinceNavigationCallMs: sinceNavigation(), source: 'intro-pulse' };
        if (observed.menu >= 0 && !r.introInputStopped) r.introInputStopped = observedPoint;
        if (observed.menu === 1 && !r.titleFirstObserved) r.titleFirstObserved = observedPoint;
      } finally {
        if (!completed) await bounded(page.evaluate(() => window.__isaacBootIntroRelease?.('failure-cleanup')), 5000, 'releasing failed intro pulse');
      }
      const s = await state();
      input.afterRelease = point(s);
      return s;
    }
    input.mode = 'menu-frame-aware-hold';
    heldKeys.add(key);
    let s = before;
    try {
      await within(page.keyboard.down(key), `pressing ${key}`);
      const pressed = await state(), started = performance.now();
      s = pressed;
      // Title evidence already exists before menu holds are allowed.
      // Stop when a player becomes live or the screen changes; otherwise
      // hold two presentations / 100 ms.
      while (!s.play.live && s.menu === before.menu && (s.f < pressed.f + 2 || performance.now() - started < 100)) {
        await sleep(25); s = await state();
      }
    } finally {
      input.keyupIssuedSinceNavigationMs = sinceNavigation();
      await bounded(page.keyboard.up(key), 5000, `releasing ${key}`);
      heldKeys.delete(key);
    }
    // Let the guest consume keyup before any following keydown.
    const releasedFrame = (await state()).f;
    do { await sleep(50); s = await state(); } while (s.f < releasedFrame + 2);
    input.afterRelease = point(s);
    return s;
  };
  const stopProfile = async (reason, cleanup = false) => {
    if (!profiling) return;
    r.profile.stopRequestedSinceNavigationMs = sinceNavigation();
    const stopping = cdp.send('Profiler.stop');
    profile = (await (cleanup ? bounded(stopping, 10000, 'stopping failed CPU profile') : within(stopping, 'stopping CPU profile'))).profile;
    profiling = false;
    r.profile.stoppedSinceNavigationMs = sinceNavigation();
    r.profile.endReason = reason;
    r.profile.durationMs = (profile.endTime - profile.startTime) / 1000;
    r.profile.sampledMs = (profile.timeDeltas || []).reduce((sum, value) => sum + value, 0) / 1000;
    r.profile.samples = profile.samples?.length ?? 0;
  };
  try {
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, { headless: true, viewport, args: browserArgs, timeout: Math.min(60000, timeoutMs) });
    page = ctx.pages()[0] || await within(ctx.newPage(), 'creating browser page');
    page.setDefaultTimeout(30000);
    page.on('pageerror', (error) => { r.pageErrors.push(String(error)); fail(r.errors, `pageerror: ${error}`); });
    page.on('crash', () => fail(r.errors, 'browser page crashed'));
    page.on('console', (message) => {
      const text = message.text(), location = message.location();
      consoleLog.push(`${message.type()}: ${text}`);
      if (message.type() === 'error') {
        const optional = /404/.test(text) && optional404(location.url, 404);
        r.consoleErrors.push({ text, location, optional });
        if (!optional) fail(r.errors, `console error: ${text}`);
      }
      if (fatalPattern.test(text)) fail(r.errors, text);
    });
    cdp = await within(ctx.newCDPSession(page), 'opening page CDP session');
    r.browser = { ...(await within(cdp.send('Browser.getVersion'), 'reading browser version')), headless: true, viewport,
      args: browserArgs, cpuThrottlingRate: cpu, networkMbitPerSecond: netMbps, networkLatencyMs: netMbps > 0 ? 20 : 0 };
    if (cpu > 1) await within(cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }), 'setting CPU throttle');
    await within(cdp.send('Network.enable'), 'enabling network observations');
    if (netMbps > 0) await within(cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20,
      downloadThroughput: netMbps * 125000, uploadThroughput: netMbps * 125000 }), 'setting network throttle');
    const manifestUrl = new globalThis.URL('dist.json', target).href;
    const manifestResponse = await within(page.request.get(manifestUrl, { timeout: 30000 }), 'reading module manifest');
    if (!manifestResponse.ok()) throw new Error(`dist.json HTTP ${manifestResponse.status()}`);
    const manifestBytes = await within(manifestResponse.body(), 'reading manifest body');
    const manifest = JSON.parse(manifestBytes.toString('utf8')), entry = manifest.files?.find((file) => file.path === 'boot.wasm');
    if (!/^[a-f\d]{64}$/i.test(entry?.sha256 || '') || !Number.isSafeInteger(entry.size) || entry.size <= 0)
      throw new Error('dist.json has no valid boot.wasm SHA-256/size');
    r.module = { manifestUrl, manifestSha256: sha256(manifestBytes), path: entry.path, sha256: entry.sha256.toLowerCase(), size: entry.size,
      identitySource: 'dist.json; module bytes are not downloaded again', manifestFile: `visit-${number}-dist.json`, responses: [] };
    writeFileSync(join(OUT, r.module.manifestFile), manifestBytes);
    if (immutableManifest !== null && immutableManifest !== r.module.manifestSha256) throw new Error('dist.json changed between visits');
    immutableManifest = r.module.manifestSha256;
    // Use the existing JSON control page to reach the origin without starting
    // the game. Its cache entry is removed again for a fresh first visit.
    const controlUrl = new globalThis.URL('instance_index.json', target).href;
    const control = await within(page.goto(controlUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }), 'opening save-reset control page');
    if (!control?.ok()) throw new Error(`save-reset control page HTTP ${control?.status()}`);
    const beforeTrail = await within(page.evaluate(async () => {
      const trail = localStorage.getItem('isaac-boot-trail');
      await new Promise((done, reject) => {
        const request = indexedDB.deleteDatabase('isaac-saves');
        request.onsuccess = () => done();
        request.onerror = () => reject(new Error(`save reset: ${request.error}`));
        request.onblocked = () => reject(new Error('save reset blocked by an open database'));
      });
      if ((await indexedDB.databases()).some((db) => db.name === 'isaac-saves')) throw new Error('isaac-saves remains after reset');
      return trail;
    }), 'resetting game saves without clearing boot trail');
    r.cache.savesReset = true;
    const previousTrail = beforeTrail ? JSON.parse(beforeTrail) : [];
    if (!Array.isArray(previousTrail)) throw new Error('stored boot trail is not an array');
    r.cache.bootTrailBefore = { entries: previousTrail.length, sha256: beforeTrail ? sha256(beforeTrail) : null };
    if (number > 1 && r.cache.bootTrailBefore.sha256 !== receipt.results[number - 2].cache.bootTrailAfter?.sha256)
      throw new Error('warm visit did not retain the previous visit boot trail');
    r.cache.controlUrl = controlUrl;
    if (number === 1 && fresh) await within(cdp.send('Network.clearBrowserCache'), 'clearing control-page HTTP cache');
    cdp.on('Network.requestWillBeSent', (event) => {
      if (!collecting) return;
      const previous = requests.get(event.requestId);
      if (previous && event.redirectResponse) { previous.redirected = true; previous.status = event.redirectResponse.status; }
      const row = { id: event.requestId, url: event.request.url, method: event.request.method, type: event.type,
        startedSinceNavigationMs: sinceNavigation(), finished: false, encodedBytes: 0 };
      requests.set(event.requestId, row); network.push(row);
    });
    cdp.on('Network.requestServedFromCache', ({ requestId }) => { const row = requests.get(requestId); if (collecting && row) row.servedFromCache = true; });
    cdp.on('Network.responseReceived', ({ requestId, response }) => {
      if (!collecting) return;
      const row = requests.get(requestId);
      if (!row) return;
      Object.assign(row, { status: response.status, fromDiskCache: !!response.fromDiskCache, fromServiceWorker: !!response.fromServiceWorker,
        protocol: response.protocol, mimeType: response.mimeType });
      if (response.status >= 400 && !optional404(row.url, response.status)) fail(r.errors, `HTTP ${response.status}: ${row.url}`);
      const url = new globalThis.URL(row.url);
      if (url.pathname === new globalThis.URL('boot.wasm', target).pathname) {
        r.module.responses.push({ url: row.url, status: response.status, fromDiskCache: !!response.fromDiskCache });
        if (url.searchParams.get('v') !== r.module.sha256.slice(0, 16)) fail(r.errors, `boot.wasm URL is not bound to the recorded manifest: ${row.url}`);
      }
    });
    cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
      if (!collecting) return;
      const row = requests.get(requestId);
      if (row) Object.assign(row, { finished: true, encodedBytes: encodedDataLength, finishedSinceNavigationMs: sinceNavigation() });
    });
    cdp.on('Network.loadingFailed', ({ requestId, errorText, canceled }) => {
      if (!collecting) return;
      const row = requests.get(requestId);
      if (row) { Object.assign(row, { failed: errorText, canceled }); fail(r.errors, `network failure: ${row.url}: ${errorText}`); }
    });
    page.on('response', (response) => {
      if (collecting && response.url() === manifestUrl) manifestReads.push(response.body().then((bytes) => { servedManifest = sha256(bytes); }).catch((error) => fail(r.errors, error)));
    });
    if (profilingEnabled) {
      await within(cdp.send('Profiler.enable'), 'enabling CPU profiler');
      await within(cdp.send('Profiler.setSamplingInterval', { interval: 1000 }), 'setting CPU sampling interval');
      r.profile = { file: `visit-${number}.cpuprofile`, samplingIntervalUs: 1000,
        startedAt: new Date().toISOString(), startsBeforeNavigation: true,
        boundary: 'Profiler.start before page.goto through first observed playable readiness plus CDP stop latency; includes ordinary menu input and title screenshot.' };
      await within(cdp.send('Profiler.start'), 'starting CPU profile');
      profiling = true;
    }
    check();
    collecting = true;
    r.navigation = { calledAt: new Date().toISOString(), url: target.href };
    navStart = performance.now();
    const response = await within(page.goto(target.href, { waitUntil: 'commit', timeout: Math.min(60000, Math.max(1, end - performance.now())) }), 'committing measured navigation');
    if (!response?.ok()) throw new Error(`game navigation HTTP ${response?.status()}`);
    let s, titleCandidate = null, introInputs = 0, nextInputAt = 0, clickedPlay = false;
    for (;;) {
      s = await poll();
      if (s.menu > 1) throw new Error(`native title was skipped before capture (menu ${s.menu})`);
      if (s.menu === 1 && s.canvasVisible) {
        if (!titleCandidate) titleCandidate = s;
        if (s.f >= titleCandidate.f + 2) { r.titleVisible = { ...point(s), firstCandidate: point(titleCandidate) }; break; }
      } else titleCandidate = null;
      if (s.htmlPlayVisible && !clickedPlay) {
        await within(page.locator('#play').click(), 'clicking ordinary HTML Play button'); clickedPlay = true;
      } else if (s.canvasVisible && s.menu === -1 && r.introStarted && !r.introInputStopped && !r.titleFirstObserved && s.f > 0 && performance.now() >= nextInputAt) {
        await hold(introInputs++ % 2 ? 'Space' : 'Enter', s, true);
        nextInputAt = performance.now() + 500;
      }
      await sleep(50);
    }
    r.titleVisible.screenshot = `visit-${number}-title.png`;
    r.titleVisible.captureStartedSinceNavigationMs = sinceNavigation();
    await within(page.screenshot({ path: join(OUT, r.titleVisible.screenshot), timeout: 30000 }), 'capturing native title');
    r.titleVisible.captureFinishedSinceNavigationMs = sinceNavigation();
    s = await poll();
    if (s.menu !== 1 || !s.canvasVisible) throw new Error('native title changed before evidence capture completed');
    let menuInputs = 0, readyRoom = null;
    nextInputAt = 0;
    for (;;) {
      s = await poll();
      const p = s.play;
      if (s.canvasVisible && s.consoleState === 0 && s.stage >= 1 && p.live && p.transition === 0) {
        if (!readyRoom || readyRoom.play.room !== p.room || readyRoom.play.player !== p.player || readyRoom.play.roomIndex !== p.roomIndex ||
            readyRoom.stage !== s.stage || readyRoom.play.stageType !== p.stageType || p.frame < readyRoom.play.frame) readyRoom = s;
        if (p.frame >= readyRoom.play.frame + 2 && s.f >= readyRoom.f + 2) {
          r.firstPlayable = { ...point(s), firstCandidate: point(readyRoom) };
          r.lazyAtPlayable = s.lazy;
          r.networkAtPlayable = networkSummary();
          await stopProfile('firstPlayable');
          break;
        }
      } else readyRoom = null;
      if (s.canvasVisible && !p.live && performance.now() >= nextInputAt) {
        await hold(menuInputs++ % 2 ? 'Space' : 'Enter', s);
        nextInputAt = performance.now() + 500;
      }
      await sleep(50);
    }
    r.firstPlayable.screenshot = `visit-${number}-playable.png`;
    await within(page.screenshot({ path: join(OUT, r.firstPlayable.screenshot), timeout: 30000 }), 'capturing first playable room');
    r.renderer = await within(page.evaluate(() => {
      const canvas = document.querySelector('canvas'), context = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
      const ext = context?.getExtension('WEBGL_debug_renderer_info');
      return { renderer: context ? context.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : context.RENDERER) : null,
        vendor: context ? context.getParameter(ext ? ext.UNMASKED_VENDOR_WEBGL : context.VENDOR) : null,
        version: context?.getParameter(context.VERSION) ?? null, contextAttributes: context?.getContextAttributes() ?? null,
        canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
        userAgent: navigator.userAgent, hardwareConcurrency: navigator.hardwareConcurrency, deviceMemoryGB: navigator.deviceMemory ?? null };
    }), 'reading rendering configuration');
    // These observations and the trail write are post-readiness diagnostics;
    // they do not extend either readiness metric or the successful CPU profile.
    do { s = await poll(); if (s.f < Math.max(600, hideAt)) await sleep(50); } while (s.f < Math.max(600, hideAt));
    r.lazyFinal = s.lazy;
    if (!s.lazy?.trailWritten) throw new Error('boot trail was not written by the diagnostic endpoint');
    const trail = await within(page.evaluate(() => localStorage.getItem('isaac-boot-trail')), 'reading persisted boot trail');
    if (!trail || !Array.isArray(JSON.parse(trail)) || !JSON.parse(trail).length) throw new Error('persisted boot trail is missing or empty');
    r.cache.bootTrailAfter = { entries: JSON.parse(trail).length, sha256: sha256(trail), sinceNavigationCallMs: sinceNavigation() };
    writeFileSync(join(OUT, `visit-${number}-boot-trail.json`), trail);
    writeFileSync(join(OUT, 'boot-trail.json'), trail);
    await within(Promise.all(manifestReads), 'checking navigated manifest');
    if (servedManifest !== r.module.manifestSha256) throw new Error('navigated dist.json differs from the saved manifest or was not observed');
    if (!r.module.responses.length) throw new Error('no manifest-versioned boot.wasm response observed');
    const after = await within(page.request.get(manifestUrl, { timeout: 30000 }), 'checking immutable module manifest');
    if (!after.ok() || sha256(await within(after.body(), 'reading final manifest body')) !== r.module.manifestSha256)
      throw new Error('dist.json changed during the visit');
    await state();
    check();
    r.status = 'complete';
  } catch (error) {
    fail(r.errors, error);
  } finally {
    collecting = false;
    if (page && !page.isClosed()) {
      if (hiddenActive) await bounded(restoreVisibility(), 5000, 'restoring failed visibility probe').catch((error) => fail(r.errors, error));
      for (const key of heldKeys) await bounded(page.keyboard.up(key), 2000, `releasing failed ${key}`).catch((error) => fail(r.errors, error));
      if (profiling) await stopProfile('failure', true).catch((error) => fail(r.errors, error));
      try {
        const logs = await bounded(page.evaluate(() => (window.isaacLog || []).map(String)), 5000, 'saving engine log');
        if (logs.length) { engineLog.length = 0; engineLog.push(...logs); }
      } catch (error) { fail(r.errors, error); }
      if (r.errors.length) await bounded(page.screenshot({ path: join(OUT, `visit-${number}-failure.png`), timeout: 5000 }), 6000, 'capturing failed visit').catch(() => {});
    } else if (profiling && cdp) await stopProfile('failure', true).catch((error) => fail(r.errors, error));
    r.networkFinal = networkSummary();
    if (ctx) await bounded(ctx.close(), 30000, 'closing persistent browser context').catch((error) => fail(r.errors, error));
    for (const line of engineLog) if (fatalPattern.test(line)) fail(r.errors, line);
    if (profile) writeFileSync(join(OUT, r.profile.file), JSON.stringify(profile));
    writeFileSync(join(OUT, `visit-${number}-page.log`), engineLog.join('\n') + '\n');
    writeFileSync(join(OUT, `visit-${number}-console.log`), consoleLog.join('\n') + '\n');
    writeFileSync(join(OUT, `visit-${number}-network.json`), JSON.stringify(network, null, 2) + '\n');
    r.status = r.errors.length ? 'failed' : r.status;
    r.engineMarkers = engineLog.filter((line) => /Menu .* Init|RNG Start Seed|Level::Init m_Stage/.test(line));
    r.finishedAt = new Date().toISOString();
    writeFileSync(join(OUT, 'boot.json'), JSON.stringify(receipt, null, 2) + '\n');
  }
  console.log(`[boot] visit ${number} ${r.cache.label} profile=${Number(profilingEnabled)} ${r.status}: navigation-to-first-visible ${r.firstVisible?.sinceNavigationCallMs ?? 'unreached'} ms; navigation-to-title ${r.titleVisible?.sinceNavigationCallMs ?? 'unreached'} ms; navigation-to-playable ${r.firstPlayable?.sinceNavigationCallMs ?? 'unreached'} ms; cpu=${cpu} gl=${gl} module=${r.module?.sha256 ?? 'unknown'} browser=${r.browser?.product ?? 'unknown'} renderer=${r.renderer?.renderer ?? 'unknown'}${r.errors.length ? `; ${r.errors[0]}` : ''}`);
  if (r.status !== 'complete') throw new Error(`visit ${number}: ${r.errors[0] || 'incomplete'}`);
}

try {
  const allowed = new Set(['gl', 'cpu', 'visits', 'fresh', 'profile', 'net', 'timeout', 'hide_at', 'hide_s']);
  for (const key of Object.keys(opt)) if (!allowed.has(key)) throw new Error(`unknown option: ${key}`);
  for (const name of ['fresh', 'profile']) if (opt[name] !== undefined && !['0', '1'].includes(opt[name])) throw new Error(`${name} must be 0 or 1`);
  if (!['hw', 'sw'].includes(gl)) throw new Error('gl must be hw or sw (SwiftShader)');
  if (!Number.isFinite(cpu) || cpu < 1) throw new Error('cpu must be at least 1');
  if (!Number.isSafeInteger(visits) || visits < 1) throw new Error('visits must be a positive integer');
  if (!Number.isFinite(netMbps) || netMbps < 0) throw new Error('net must be a non-negative Mbit/s rate');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2147483647) throw new Error('timeout must be positive seconds within the timer range');
  if (!Number.isSafeInteger(hideAt) || hideAt < 0 || !Number.isFinite(hideS) || hideS <= 0) throw new Error('hide_at must be a non-negative frame and hide_s must be positive seconds');
  const target = new globalThis.URL(URL);
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('URL must be an HTTP(S) served game');
  if (fresh) rmSync(PROFILE_DIR, { recursive: true, force: true });
  for (let number = 1; number <= visits; number++) await visit(number, target);
  receipt.status = 'complete';
} catch (error) {
  fail(receipt.errors, error);
  console.error(`[boot] failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  writeFileSync(join(OUT, 'boot.json'), JSON.stringify(receipt, null, 2) + '\n');
}
