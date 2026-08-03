/**
 * Browser window / canvas sizing for Isaac's fixed internal resolution.
 * Isaac classic internal render is 480x270 logical, scaled up; Repentance
 * commonly uses larger window defaults. We force a sane Chromebook buffer.
 */

export const DEFAULT_INTERNAL = Object.freeze({ width: 960, height: 540 });
export const MIN_BUFFER = Object.freeze({ width: 640, height: 360 });
export const MAX_BUFFER = Object.freeze({ width: 1920, height: 1080 });

/**
 * Compute canvas buffer size from CSS client size and devicePixelRatio,
 * clamped for Chromebook memory/GPU limits.
 */
export function computeBufferSize(clientWidth, clientHeight, dpr = 1, opts = {}) {
  const maxW = opts.maxWidth ?? MAX_BUFFER.width;
  const maxH = opts.maxHeight ?? MAX_BUFFER.height;
  const minW = opts.minWidth ?? MIN_BUFFER.width;
  const minH = opts.minHeight ?? MIN_BUFFER.height;
  const scale = Math.min(Math.max(Number(dpr) || 1, 0.5), 2.5);
  let w = Math.round(Math.max(1, clientWidth) * scale);
  let h = Math.round(Math.max(1, clientHeight) * scale);
  // preserve aspect of internal if requested
  if (opts.fitInternal) {
    const iw = opts.internalWidth ?? DEFAULT_INTERNAL.width;
    const ih = opts.internalHeight ?? DEFAULT_INTERNAL.height;
    const aspect = iw / ih;
    const boxAspect = w / h;
    if (boxAspect > aspect) {
      w = Math.round(h * aspect);
    } else {
      h = Math.round(w / aspect);
    }
  }
  w = Math.max(minW, Math.min(maxW, w));
  h = Math.max(minH, Math.min(maxH, h));
  // even dimensions for some GL paths
  if (w % 2) w -= 1;
  if (h % 2) h -= 1;
  return { width: w, height: h, dpr: scale };
}

/**
 * Apply buffer size to a canvas-like object { width, height }.
 * Returns the applied size.
 */
export function applyCanvasSize(canvas, clientWidth, clientHeight, dpr = 1, opts = {}) {
  if (!canvas) throw new TypeError('canvas required');
  const size = computeBufferSize(clientWidth, clientHeight, dpr, opts);
  if (canvas.width !== size.width) canvas.width = size.width;
  if (canvas.height !== size.height) canvas.height = size.height;
  return size;
}

/**
 * Prefer WebGL2; fall back to WebGL1. Returns { gl, webgl2 }.
 */
export function createGlContext(canvas, attrs = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new TypeError('canvas.getContext required');
  }
  const base = {
    alpha: false,
    antialias: false,
    depth: true,
    stencil: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
    ...attrs,
  };
  let gl = canvas.getContext('webgl2', base);
  if (gl) return { gl, webgl2: true };
  gl = canvas.getContext('webgl', base) || canvas.getContext('experimental-webgl', base);
  if (gl) return { gl, webgl2: false };
  throw new Error('WebGL not available');
}

export default {
  DEFAULT_INTERNAL,
  MIN_BUFFER,
  MAX_BUFFER,
  computeBufferSize,
  applyCanvasSize,
  createGlContext,
};
