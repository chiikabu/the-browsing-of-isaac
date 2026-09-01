/**
 * Browser-side mount: showDirectoryPicker + drag-and-drop (webkitGetAsEntry)
 * into OPFS / an abstract FS writer used by the WASM layer.
 */

import {
  indexFromPathList,
  validateGameMount,
  planEmscriptenMount,
} from './mount.js';
import { VIRTUAL_ROOTS, normalizePath } from './path.js';

/**
 * Recursively list files from a FileSystemDirectoryHandle.
 */
export async function listDirectoryHandle(dirHandle, base = '') {
  const out = [];
  for await (const [name, handle] of dirHandle.entries()) {
    const rel = base ? base + '/' + name : name;
    if (handle.kind === 'directory') {
      out.push(...(await listDirectoryHandle(handle, rel)));
    } else {
      out.push({ relativePath: rel.replace(/\\/g, '/'), handle });
    }
  }
  return out;
}

/**
 * Recursively list files from a webkit FileSystemDirectoryEntry.
 */
export function listDirectoryEntry(dirEntry, base = '') {
  return new Promise((resolve, reject) => {
    const reader = dirEntry.createReader();
    const acc = [];
    const readBatch = () => {
      reader.readEntries(async (entries) => {
        if (!entries.length) {
          try {
            const files = [];
            for (const item of acc) {
              if (item.isFile) {
                const relativePath = (base ? base + '/' + item.name : item.name).replace(/\\/g, '/');
                files.push({ relativePath, entry: item });
              } else if (item.isDirectory) {
                const next = base ? base + '/' + item.name : item.name;
                const sub = await listDirectoryEntry(item, next);
                files.push(...sub);
              }
            }
            resolve(files);
          } catch (e) {
            reject(e);
          }
          return;
        }
        acc.push(...entries);
        readBatch();
      }, reject);
    };
    readBatch();
  });
}

export async function pickGameDirectory(picker = globalThis.showDirectoryPicker) {
  if (typeof picker !== 'function') {
    throw new Error('showDirectoryPicker is not supported in this browser');
  }
  return picker({ id: 'isaac-game', mode: 'read' });
}

export async function indexFromDirectoryHandle(dirHandle, root = VIRTUAL_ROOTS.game) {
  const listed = await listDirectoryHandle(dirHandle);
  const sizes = {};
  const paths = [];
  for (const { relativePath, handle } of listed) {
    paths.push(relativePath);
    try {
      const file = await handle.getFile();
      sizes[relativePath] = file.size;
    } catch {
      sizes[relativePath] = 0;
    }
  }
  const index = indexFromPathList(paths, sizes, root);
  return { index, listed, validation: validateGameMount(index) };
}

export async function indexFromDataTransfer(dataTransfer, root = VIRTUAL_ROOTS.game) {
  if (!dataTransfer) throw new TypeError('dataTransfer required');
  const items = dataTransfer.items ? [...dataTransfer.items] : [];
  const paths = [];
  const sizes = {};
  const fileRecords = [];

  for (const item of items) {
    if (item.kind !== 'file') continue;
    const entry = typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null;
    if (entry && entry.isDirectory) {
      const listed = await listDirectoryEntry(entry);
      for (const { relativePath, entry: fe } of listed) {
        paths.push(relativePath);
        const file = await new Promise((res, rej) => fe.file(res, rej));
        sizes[relativePath] = file.size;
        fileRecords.push({ relativePath, file });
      }
    } else if (entry && entry.isFile) {
      const file = await new Promise((res, rej) => entry.file(res, rej));
      paths.push(entry.name);
      sizes[entry.name] = file.size;
      fileRecords.push({ relativePath: entry.name, file });
    } else {
      const file = item.getAsFile?.();
      if (file) {
        paths.push(file.name);
        sizes[file.name] = file.size;
        fileRecords.push({ relativePath: file.name, file });
      }
    }
  }

  const stripped = stripCommonTopFolder(paths);
  const index = indexFromPathList(stripped.paths, remapKeys(sizes, stripped.map), root);
  return {
    index,
    files: fileRecords.map((r) => ({
      relativePath: stripped.map[r.relativePath] || r.relativePath,
      file: r.file,
    })),
    validation: validateGameMount(index),
  };
}

function stripCommonTopFolder(paths) {
  if (!paths.length) return { paths, map: {} };
  const first = paths[0].split('/')[0];
  const all = paths.every((p) => p === first || p.startsWith(first + '/'));
  const looksLikeRoot =
    all &&
    paths.some(
      (p) =>
        /isaac-ng\.exe$/i.test(p) ||
        /\/resources(\/|$)/i.test(p) ||
        p.startsWith(first + '/resources'),
    );
  const map = {};
  if (!looksLikeRoot) {
    for (const p of paths) map[p] = p;
    return { paths: [...paths], map };
  }
  const out = [];
  for (const p of paths) {
    if (p === first) continue;
    const rel = p.slice(first.length + 1);
    map[p] = rel;
    out.push(rel);
  }
  return { paths: out, map };
}

function remapKeys(sizes, map) {
  const out = {};
  for (const [k, v] of Object.entries(sizes)) {
    out[map[k] || k] = v;
  }
  return out;
}

export async function writeToOpfs(namespace, files, onProgress) {
  if (!navigator?.storage?.getDirectory) {
    throw new Error('Origin Private File System not available');
  }
  const root = await navigator.storage.getDirectory();
  const ns = await root.getDirectoryHandle(namespace, { create: true });
  let done = 0;
  for (const { relativePath, file, stream } of files) {
    const parts = normalizePath(relativePath).replace(/^\//, '').split('/');
    let dir = ns;
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: true });
    }
    const fh = await dir.getFileHandle(parts[parts.length - 1], { create: true });
    const w = await fh.createWritable();
    if (file) await w.write(file);
    else if (stream) await w.write(stream);
    await w.close();
    done += 1;
    if (onProgress) onProgress({ done, total: files.length, path: relativePath });
  }
  return { namespace, count: done };
}

export function applyPlanToEmscriptenFS(FS, plan, fileProvider) {
  if (!FS) throw new TypeError('FS required');
  for (const d of plan.directories) {
    try {
      if (FS.mkdirTree) FS.mkdirTree(d);
      else mkdirp(FS, d);
    } catch {
      // exists
    }
  }
  const opened = [];
  for (const f of plan.files) {
    const rel = f.path.startsWith(plan.root)
      ? f.path.slice(plan.root.length).replace(/^\//, '')
      : f.path.replace(/^\//, '');
    if (fileProvider && fileProvider.lazy) {
      fileProvider.register?.(f.path, rel, f.size);
      opened.push(f.path);
      continue;
    }
    if (fileProvider?.getBytes) {
      const bytes = fileProvider.getBytes(rel);
      if (bytes) {
        FS.writeFile(f.path, bytes);
        opened.push(f.path);
      }
    }
  }
  return { mounted: opened.length, plan };
}

function mkdirp(FS, path) {
  const parts = path.split('/').filter(Boolean);
  let cur = '';
  for (const p of parts) {
    cur += '/' + p;
    try {
      FS.mkdir(cur);
    } catch {
      // exists
    }
  }
}

export function createMountController(hooks = {}) {
  let current = null;

  async function mountFromPicker() {
    const handle = await pickGameDirectory(hooks.picker);
    const { index, listed, validation } = await indexFromDirectoryHandle(handle);
    if (!validation.ok && hooks.requireValid !== false) {
      const err = new Error(validation.errors.join('; '));
      err.validation = validation;
      throw err;
    }
    const plan = planEmscriptenMount(index);
    current = { source: 'picker', index, plan, validation, listed, handle };
    if (hooks.onMounted) await hooks.onMounted(current);
    return current;
  }

  async function mountFromDrop(dataTransfer) {
    const result = await indexFromDataTransfer(dataTransfer);
    if (!result.validation.ok && hooks.requireValid !== false) {
      const err = new Error(result.validation.errors.join('; '));
      err.validation = result.validation;
      throw err;
    }
    const plan = planEmscriptenMount(result.index);
    current = {
      source: 'drop',
      index: result.index,
      plan,
      validation: result.validation,
      files: result.files,
    };
    if (hooks.onMounted) await hooks.onMounted(current);
    return current;
  }

  /**
   * Dev-server auto-mount: files are fetched from /@game/* (see scripts/serve.mjs).
   * `files` is [{ path, size?, url? }] from /@game-index.json.
   */
  async function mountFromServerGame({ files } = {}) {
    const list = Array.isArray(files) ? files : [];
    const paths = [];
    const sizes = {};
    const serverFiles = [];
    for (const f of list) {
      const relativePath = String(f.path || f.relativePath || '').replace(/^[/\\]+/, '').replace(/\\/g, '/');
      if (!relativePath) continue;
      paths.push(relativePath);
      sizes[relativePath] = f.size || 0;
      const url =
        f.url ||
        `/@game/${relativePath.split('/').map(encodeURIComponent).join('/')}`;
      serverFiles.push({ relativePath, url, size: f.size || 0 });
    }
    const index = indexFromPathList(paths, sizes);
    const validation = validateGameMount(index);
    if (!validation.ok && hooks.requireValid !== false) {
      const err = new Error(validation.errors.join('; '));
      err.validation = validation;
      throw err;
    }
    const plan = planEmscriptenMount(index);
    current = { source: 'server', index, plan, validation, serverFiles };
    if (hooks.onMounted) await hooks.onMounted(current);
    return current;
  }

  function getCurrent() {
    return current;
  }

  return { mountFromPicker, mountFromDrop, mountFromServerGame, getCurrent };
}

export default {
  listDirectoryHandle,
  listDirectoryEntry,
  pickGameDirectory,
  indexFromDirectoryHandle,
  indexFromDataTransfer,
  writeToOpfs,
  applyPlanToEmscriptenFS,
  createMountController,
};
