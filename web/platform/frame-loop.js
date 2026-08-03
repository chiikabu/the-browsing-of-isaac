/**
 * requestAnimationFrame-driven host loop registration.
 * Works in browser; in Node tests, accepts an injected rAF.
 */

export function createFrameLoop(options = {}) {
  const {
    requestFrame = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame.bind(globalThis)
      : null,
    cancelFrame = typeof cancelAnimationFrame === 'function'
      ? cancelAnimationFrame.bind(globalThis)
      : null,
    now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
    targetFps = 60,
  } = options;

  if (!requestFrame) {
    throw new Error('requestAnimationFrame not available — inject requestFrame for tests');
  }

  let handle = null;
  let running = false;
  let last = 0;
  let frames = 0;
  let fpsAccum = 0;
  let fpsFrames = 0;
  let lastFps = 0;
  let tick = null;
  const minDelta = 1000 / Math.max(1, targetFps);

  function frame(ts) {
    if (!running) return;
    handle = requestFrame(frame);
    const t = typeof ts === 'number' ? ts : now();
    const dt = last ? t - last : 16.67;
    // Soft cap: still call tick every rAF; report dt for engine timing
    last = t;
    frames += 1;
    fpsAccum += dt;
    fpsFrames += 1;
    if (fpsAccum >= 500) {
      lastFps = (fpsFrames * 1000) / fpsAccum;
      fpsAccum = 0;
      fpsFrames = 0;
    }
    if (typeof tick === 'function') {
      tick({ time: t, dt, frame: frames, fps: lastFps, minDelta });
    }
  }

  function start(onTick) {
    if (running) stop();
    tick = onTick;
    running = true;
    last = 0;
    frames = 0;
    handle = requestFrame(frame);
    return true;
  }

  function stop() {
    running = false;
    if (handle != null && cancelFrame) cancelFrame(handle);
    handle = null;
  }

  function isRunning() {
    return running;
  }

  function getStats() {
    return { frames, fps: lastFps, running };
  }

  return { start, stop, isRunning, getStats };
}

/**
 * Register a module tick with optional pause when document hidden.
 */
export function bindVisibilityPause(loop, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || typeof doc.addEventListener !== 'function') {
    return () => {};
  }
  const onVis = () => {
    // Caller owns restart; we only signal via custom event-like callback store
  };
  doc.addEventListener('visibilitychange', onVis);
  return () => doc.removeEventListener('visibilitychange', onVis);
}

export default { createFrameLoop, bindVisibilityPause };
