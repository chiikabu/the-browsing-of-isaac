/**
 * Resource mount index + FS plan for MEMFS / OPFS.
 * Pure module: builds a mount plan from FileSystemEntry / FileSystemHandle trees
 * or plain {path, size} listings. Actual browser I/O lives in browser-mount.js.
 */

import { VIRTUAL_ROOTS, normalizePath, joinVirtual } from './path.js';

/**
 * @typedef {{ path: string, size?: number, kind?: 'file'|'directory' }} MountEntry
 * @typedef {{
 *   root: string,
 *   entries: MountEntry[],
 *   files: number,
 *   bytes: number,
 *   hasExe: boolean,
 *   hasResources: boolean,
 *   hasPacked: boolean,
 *   hasMods: boolean,
 *   exeName: string|null,
 * }} MountIndex
 */

export function createEmptyIndex(root = VIRTUAL_ROOTS.game) {
  return {
    root: normalizePath(root),
    entries: [],
    files: 0,
    bytes: 0,
    hasExe: false,
    hasResources: false,
    hasPacked: false,
    hasMods: false,
    exeName: null,
  };
}

/**
 * Build a MountIndex from a flat list of relative paths (posix).
 * @param {string[]} relativePaths
 * @param {Record<string, number>} [sizes]
 * @param {string} [root]
 */
export function indexFromPathList(relativePaths, sizes = {}, root = VIRTUAL_ROOTS.game) {
  const idx = createEmptyIndex(root);
  for (const raw of relativePaths) {
    const rel = normalizePath(raw).replace(/^\//, '');
    const size = sizes[raw] ?? sizes[rel] ?? 0;
    const full = joinVirtual(root, rel);
    idx.entries.push({ path: full, size, kind: 'file' });
    idx.files += 1;
    idx.bytes += size;
    const lower = rel.toLowerCase();
    if (lower === 'isaac-ng.exe' || lower.endsWith('/isaac-ng.exe')) {
      idx.hasExe = true;
      idx.exeName = 'isaac-ng.exe';
    }
    if (lower === 'resources' || lower.startsWith('resources/')) idx.hasResources = true;
    if (lower.includes('resources/packed/') || lower.startsWith('resources/packed')) idx.hasPacked = true;
    if (lower === 'mods' || lower.startsWith('mods/')) idx.hasMods = true;
  }
  return idx;
}

/**
 * Validate that a mount looks like a legitimate full Isaac install.
 * Returns { ok, errors[], warnings[] }.
 */
export function validateGameMount(index) {
  const errors = [];
  const warnings = [];
  if (!index) {
    return { ok: false, errors: ['no mount index'], warnings };
  }
  if (!index.hasExe) errors.push('isaac-ng.exe not found in mounted directory');
  if (!index.hasResources) errors.push('resources/ tree not found');
  if (!index.hasPacked) {
    warnings.push('resources/packed/*.a archives not detected — game may fail to load assets');
  }
  // Required packed basenames for Repentance+
  const requiredPacked = ['graphics.a', 'config.a', 'rooms.a', 'repentance.a'];
  const names = new Set(index.entries.map((e) => e.path.split('/').pop().toLowerCase()));
  for (const r of requiredPacked) {
    if (!names.has(r)) warnings.push(`packed archive missing from index: ${r}`);
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Produce an Emscripten FS mount plan (directories to mkdir + files to create).
 * @param {MountIndex} index
 */
export function planEmscriptenMount(index) {
  const dirs = new Set([index.root, VIRTUAL_ROOTS.saves, VIRTUAL_ROOTS.user, VIRTUAL_ROOTS.mods]);
  const files = [];
  for (const e of index.entries) {
    const parts = e.path.split('/').filter(Boolean);
    let cur = '';
    for (let i = 0; i < parts.length - 1; i++) {
      cur += '/' + parts[i];
      dirs.add(cur);
    }
    if (e.kind !== 'directory') {
      files.push({ path: e.path, size: e.size || 0 });
    }
  }
  // Always ensure classic layout dirs
  dirs.add(VIRTUAL_ROOTS.resources);
  dirs.add(joinVirtual(VIRTUAL_ROOTS.resources, 'packed'));
  dirs.add(joinVirtual(VIRTUAL_ROOTS.resources, 'scripts'));
  dirs.add(joinVirtual(VIRTUAL_ROOTS.game, 'mods'));
  return {
    directories: [...dirs].sort(),
    files,
    root: index.root,
  };
}

/**
 * Merge a secondary mount (e.g. saves) into a plan.
 */
export function planSaveMount(relativePaths, sizes = {}) {
  return planEmscriptenMount(indexFromPathList(relativePaths, sizes, VIRTUAL_ROOTS.saves));
}

/**
 * Detect drag-and-drop item kind from DataTransfer item (duck-typed for tests).
 */
export function classifyDataTransferItem(item) {
  if (!item) return 'unknown';
  if (typeof item.webkitGetAsEntry === 'function') {
    return 'entry';
  }
  if (typeof item.getAsFileSystemHandle === 'function') {
    return 'handle';
  }
  if (item.kind === 'file') return 'file';
  return 'unknown';
}

export default {
  createEmptyIndex,
  indexFromPathList,
  validateGameMount,
  planEmscriptenMount,
  planSaveMount,
  classifyDataTransferItem,
  VIRTUAL_ROOTS,
};
