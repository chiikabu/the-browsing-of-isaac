/**
 * Path normalization for browser / Emscripten FS mounts.
 * Pure module — no DOM. Maps Windows game paths to virtual FS roots.
 */

export const VIRTUAL_ROOTS = Object.freeze({
  game: '/isaac',
  resources: '/isaac/resources',
  mods: '/isaac/mods',
  saves: '/saves',
  user: '/user',
});

/** Normalize slashes and collapse . / .. segments without resolving absolute OS roots. */
export function normalizePath(input) {
  if (input == null) throw new TypeError('path required');
  let s = String(input).replace(/\\\\/g, '/');
  // Strip Windows drive letter for virtual mapping (C:/foo -> /foo after drive strip helpers)
  const drive = s.match(/^([A-Za-z]):(\/.*)?$/);
  if (drive) s = drive[2] || '/';
  s = s.replace(/\/+/g, '/');
  const absolute = s.startsWith('/');
  const parts = s.split('/').filter((p) => p && p !== '.');
  const out = [];
  for (const p of parts) {
    if (p === '..') {
      if (out.length && out[out.length - 1] !== '..') out.pop();
      else if (!absolute) out.push('..');
    } else {
      out.push(p);
    }
  }
  let result = (absolute ? '/' : '') + out.join('/');
  if (result === '') result = absolute ? '/' : '.';
  return result;
}

/**
 * Map a host-side Isaac path to the virtual FS path used inside the WASM runtime.
 * Recognizes Steam install layout and Documents save layout.
 */
export function mapGamePath(hostPath, opts = {}) {
  const savesHint = opts.savesHint || 'My Games/Binding of Isaac Repentance+';
  const n = normalizePath(hostPath);
  const lower = n.toLowerCase();

  // Save data: .../Documents/My Games/Binding of Isaac Repentance+
  const saveIdx = lower.indexOf('my games/binding of isaac');
  if (saveIdx !== -1) {
    const rest = n.slice(saveIdx + 'my games/'.length);
    const after = rest.split('/').slice(1).join('/'); // drop folder name
    return normalizePath(VIRTUAL_ROOTS.saves + (after ? '/' + after : ''));
  }

  // Game install: .../The Binding of Isaac Rebirth/...
  const markers = [
    'the binding of isaac rebirth',
    'the binding of isaac repentance',
    'binding of isaac',
  ];
  for (const m of markers) {
    const i = lower.indexOf(m);
    if (i !== -1) {
      const rest = n.slice(i + m.length).replace(/^\//, '');
      return normalizePath(VIRTUAL_ROOTS.game + (rest ? '/' + rest : ''));
    }
  }

  // Already virtual
  if (n.startsWith('/isaac') || n.startsWith('/saves') || n.startsWith('/user')) {
    return n;
  }

  // Bare relative resources/mods paths as used by the engine
  if (lower.startsWith('resources/') || lower === 'resources') {
    return normalizePath(VIRTUAL_ROOTS.game + '/' + n.replace(/^\//, ''));
  }
  if (lower.startsWith('mods/') || lower === 'mods') {
    return normalizePath(VIRTUAL_ROOTS.game + '/' + n.replace(/^\//, ''));
  }

  // Fallback: park under /user
  return normalizePath(VIRTUAL_ROOTS.user + '/' + n.replace(/^\//, ''));
}

/** Join virtual segments safely. */
export function joinVirtual(...parts) {
  const combined = parts
    .filter((p) => p != null && p !== '')
    .map((p, i) => {
      let s = String(p).replace(/\\\\/g, '/');
      if (i > 0) s = s.replace(/^\/+/, '');
      return s.replace(/\/+$/, '');
    })
    .join('/');
  return normalizePath(combined);
}

/**
 * Rewrite absolute Windows paths the engine might pass to fopen/CreateFile
 * into virtual FS paths given known mount points.
 */
export function rewriteEnginePath(enginePath, mounts = {}) {
  const n = normalizePath(enginePath);
  const lower = n.toLowerCase();
  if (mounts.gameRoot) {
    const gr = normalizePath(mounts.gameRoot).toLowerCase();
    if (lower === gr || lower.startsWith(gr + '/')) {
      const rest = n.slice(normalizePath(mounts.gameRoot).length).replace(/^\//, '');
      return joinVirtual(VIRTUAL_ROOTS.game, rest);
    }
  }
  if (mounts.saveRoot) {
    const sr = normalizePath(mounts.saveRoot).toLowerCase();
    if (lower === sr || lower.startsWith(sr + '/')) {
      const rest = n.slice(normalizePath(mounts.saveRoot).length).replace(/^\//, '');
      return joinVirtual(VIRTUAL_ROOTS.saves, rest);
    }
  }
  return mapGamePath(enginePath);
}

export default {
  VIRTUAL_ROOTS,
  normalizePath,
  mapGamePath,
  joinVirtual,
  rewriteEnginePath,
};
