// mods.mjs -- mods imported from this device, kept in the browser (round 74).
//
// The game looks for mods in `mods/` beside its executable and scans that
// directory itself (FindFirstFileA over the shim's own table, host_shims_fs.c).
// Nothing in that scan cares where the bytes came from, so a mod seeded before
// main is a mod on disk as far as the engine is concerned -- which is the whole
// trick here. No patching, no menu surgery.
//
// Three pieces:
//
//   the store    a database of its own, `isaac-mods`. The saves live in
//                `isaac-saves` and the two never touch: importing, removing or
//                resetting mods cannot reach a save file, and a corrupt or
//                half-written mod cannot make the save store unreadable. Files
//                the game writes under mods/ (the `disable.it` that marks a mod
//                off) are routed here too, so the save store stays saves.
//
//   the import   a .zip or a folder. Both are read in the browser: zips through
//                DecompressionStream, folders through the directory picker. The
//                bytes are copied into the store, so deleting the file afterwards
//                changes nothing -- the mod is in the browser now, not on disk.
//                RAR and 7z are named and refused rather than half-read; see
//                importFrom() for what to do with one.
//
//   the button   a mod of our own, `mods/ import mod/`, listed as IMPORT MOD.
//                It shows up in the game's own mods list like any other, and the
//                menu's Enter toggles it -- which writes a `disable.it` into its
//                folder. That write comes back to the page through the FS shim's
//                persist hook, and the page opens this menu instead of storing
//                it. So the row is real, the key is the game's own, and the
//                engine is none the wiser.
//
// A mod is only read at startup, by the game as by Steam, so a fresh import asks
// for a reload rather than pretending it landed live.

import { unzip, archiveKind } from './zip.mjs';

export const MODS_DB = 'isaac-mods', F_STORE = 'files', M_STORE = 'mods', S_STORE = 'state';
export const GUEST_ROOT = 'c:/isaac/mods/';       // fs_key() normalises to this
// The game's mods list prints the folder name, not the <name> in the metadata,
// so the folder is what has to read right -- and the list is sorted by it, which
// is why the name starts with a space: the import row stays at the top however
// many mods are installed. fs_key() lowercases and collapses separators and
// leaves everything else, spaces included, exactly as it found them.
export const IMPORT_DIR = ' import mod';
export const IMPORT_MARK = `${GUEST_ROOT}${IMPORT_DIR}/disable.it`;
export const SEED_BUDGET = 96 << 20;              // what the guest arena can spare for mods

// The sentinel is a mod with nothing in it but a name. The game lists it, the
// menu selects it, and Enter on it is the import.
export const IMPORT_METADATA = `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <name>IMPORT MOD</name>
  <directory>${IMPORT_DIR}</directory>
  <description>Add a mod from this device: a .zip or a folder.</description>
  <version>1</version>
</metadata>
`;

// ---- the store ---------------------------------------------------------------

export function openModDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { resolve(null); return; }
    const req = indexedDB.open(MODS_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(F_STORE)) db.createObjectStore(F_STORE);   // '<id>/<rel>' -> {bytes}
      if (!db.objectStoreNames.contains(M_STORE)) db.createObjectStore(M_STORE);   // '<id>'       -> {id,name,files,bytes,added}
      if (!db.objectStoreNames.contains(S_STORE)) db.createObjectStore(S_STORE);   // fs key       -> {bytes}
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const all = (db, store) => new Promise((resolve, reject) => {
  const out = [];
  const req = db.transaction(store, 'readonly').objectStore(store).openCursor();
  req.onsuccess = () => {
    const c = req.result;
    if (!c) { resolve(out); return; }
    out.push({ key: c.key, value: c.value });
    c.continue();
  };
  req.onerror = () => reject(req.error);
});

export const listMods = (db) => all(db, M_STORE).then((r) => r.map((x) => x.value).sort((a, b) => a.name.localeCompare(b.name)));
export const listModFiles = (db) => all(db, F_STORE);
export const listModState = (db) => all(db, S_STORE);

// Importing over a mod that is already there replaces it. The old files go
// first, in the same transaction: a version that dropped a file would otherwise
// leave it behind for the seed to find, and the mod would load with a file its
// author removed.
export function putMod(db, mod, files) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([F_STORE, M_STORE], 'readwrite');
    const fs = tx.objectStore(F_STORE), ms = tx.objectStore(M_STORE);
    fs.delete(IDBKeyRange.bound(`${mod.id}/`, `${mod.id}/\uffff`));
    for (const f of files) fs.put({ bytes: f.bytes }, `${mod.id}/${f.name}`);
    ms.put(mod, mod.id);
    tx.oncomplete = () => resolve(mod);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('the mod store refused the write (out of space?)'));
  });
}

// Removing a mod takes its files, its index row and any state the game wrote for
// it. Everything is keyed by the id, so nothing outside it can be caught up.
export function deleteMod(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([F_STORE, M_STORE, S_STORE], 'readwrite');
    const range = IDBKeyRange.bound(`${id}/`, `${id}/\uffff`);
    tx.objectStore(F_STORE).delete(range);
    tx.objectStore(M_STORE).delete(id);
    tx.objectStore(S_STORE).delete(IDBKeyRange.bound(`${GUEST_ROOT}${id}/`, `${GUEST_ROOT}${id}/\uffff`));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export function putModState(db, key, bytes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(S_STORE, 'readwrite');
    if (bytes) tx.objectStore(S_STORE).put({ bytes }, key); else tx.objectStore(S_STORE).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ---- what a mod may be called ------------------------------------------------

// A path out of an archive is not to be trusted: `..`, a drive letter or a
// leading slash would all seed outside mods/, and one of those lands on a save.
// Anything that is not a plain relative path is dropped, not repaired.
export function safeRel(p) {
  const s = String(p == null ? '' : p).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!s || s.length > 240) return null;
  if (/^[A-Za-z]:/.test(s)) return null;
  const parts = s.split('/');
  for (const seg of parts) {
    if (!seg || seg === '.' || seg === '..') return null;
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u001f:*?"<>|]/.test(seg)) return null;
  }
  return parts.join('/');
}

// The import row's folder, and the id an import would have to produce to collide
// with it. modId() turns a space into a dash, so the second is the one that can
// actually happen; both are refused.
const RESERVED = new Set([IMPORT_DIR, IMPORT_DIR.trim().replace(/\s+/g, '-')]);

export function modId(name) {
  const s = String(name == null ? '' : name).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  return s.slice(0, 64) || null;
}

// Archives are packed with the mod folder inside them as often as not, and a mod
// whose metadata.xml sits one level down does not load. Peel single roots off
// until the metadata is at the top, or until there is nothing single about it.
export function stripRoots(entries) {
  let e = entries, peeled = null;
  for (let i = 0; i < 4; i++) {
    if (e.some((x) => x.name.toLowerCase() === 'metadata.xml')) break;
    const roots = new Set(e.map((x) => x.name.split('/')[0] + (x.name.includes('/') ? '' : '\u0000')));
    if (roots.size !== 1) break;
    const root = e[0].name.split('/')[0];
    if (!e.every((x) => x.name.startsWith(root + '/'))) break;
    peeled = root;
    e = e.map((x) => ({ name: x.name.slice(root.length + 1), bytes: x.bytes }));
  }
  return { entries: e, root: peeled };
}

const textOf = (bytes) => new TextDecoder('utf-8', { fatal: false }).decode(bytes);

export function readMetadata(bytes) {
  const text = textOf(bytes);
  const pick = (tag) => {
    const m = new RegExp(`<${tag}\\s*>([\\s\\S]*?)</${tag}\\s*>`, 'i').exec(text);
    const t = m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
    return t && t.length <= 120 ? t : null;
  };
  return { name: pick('name'), directory: pick('directory') };
}

// Entries in, a mod out: the id it will live under, the name the menu shows, and
// the files as they will be seeded. A mod with no metadata.xml gets one, because
// the game skips a folder without it and "nothing happened" is a bad answer.
export function planMod(rawEntries, fallback) {
  const dropped = [];
  const cleaned = [];
  for (const e of rawEntries) {
    const rel = safeRel(e.name);
    if (!rel) { dropped.push(e.name); continue; }
    cleaned.push({ name: rel, bytes: e.bytes });
  }
  if (!cleaned.length) throw new Error('nothing in it that could be a mod file');
  const { entries, root } = stripRoots(cleaned);
  const meta = entries.find((x) => x.name.toLowerCase() === 'metadata.xml');
  const m = meta ? readMetadata(meta.bytes) : { name: null, directory: null };
  const name = m.name || root || fallback || 'mod';
  const id = modId(m.directory) || modId(root) || modId(fallback) || modId(name);
  if (!id) throw new Error('no usable name for this mod');
  if (RESERVED.has(id)) throw new Error(`"${id}" is the name of the import row itself`);
  const files = entries.slice();
  let added = false;
  if (!meta) {
    files.push({ name: 'metadata.xml', bytes: new TextEncoder().encode(
      `<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n  <name>${name.replace(/[<>&]/g, '')}</name>\n`
      + `  <directory>${id}</directory>\n  <description>imported</description>\n  <version>1</version>\n</metadata>\n`) });
    added = true;
  }
  const bytes = files.reduce((n, f) => n + f.bytes.length, 0);
  return { mod: { id, name, files: files.length, bytes, added: Date.now() }, files, dropped, madeMetadata: added };
}

// ---- reading what the picker handed over -------------------------------------

// One archive, or a directory's worth of files. A File carries
// webkitRelativePath when it came from the directory picker, which is the only
// way the browser tells us the shape of what was chosen.
export async function importFrom(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) throw new Error('nothing chosen');
  const dir = files.find((f) => f.webkitRelativePath);
  if (dir || files.length > 1) {
    const entries = [];
    for (const f of files) {
      const rel = f.webkitRelativePath || f.name;
      entries.push({ name: rel, bytes: new Uint8Array(await f.arrayBuffer()) });
    }
    const top = (dir && dir.webkitRelativePath.split('/')[0]) || null;
    return { entries, fallback: top };
  }
  const f = files[0];
  const buf = await f.arrayBuffer();
  const kind = archiveKind(new Uint8Array(buf, 0, Math.min(16, buf.byteLength)));
  if (kind === 'rar' || kind === '7z') {
    throw new Error(`this is a .${kind}, and nothing in a browser can open one. `
      + 'Extract it and choose the folder instead.');
  }
  if (kind !== 'zip') throw new Error('not a zip archive, and not a folder');
  const entries = await unzip(buf);
  return { entries, fallback: f.name.replace(/\.[^.]+$/, '') };
}

// ---- seeding, before the game looks ------------------------------------------

// `seed(path, bytes)` is the pipeline's isaac_fs_seed. Every path is built here,
// under GUEST_ROOT, from an id and a relative name that have both already been
// through safeRel/modId -- so nothing a mod carries can decide where it lands.
export async function seedMods(db, seed, log, opts) {
  const o = opts || {};
  const out = { mods: 0, files: 0, bytes: 0, skipped: 0, state: 0 };
  if (o.sentinel !== false) {
    if (seed(`${GUEST_ROOT}${IMPORT_DIR}/metadata.xml`, new TextEncoder().encode(IMPORT_METADATA))) out.files += 1;
  }
  if (!db) return out;
  const index = await listMods(db);
  const known = new Set(index.map((x) => x.id));
  const byId = new Map();
  for (const { key, value } of await listModFiles(db)) {
    const cut = String(key).indexOf('/');
    if (cut <= 0) continue;
    const id = key.slice(0, cut), rel = safeRel(key.slice(cut + 1));
    if (!rel || !known.has(id) || id === IMPORT_DIR) { out.skipped += 1; continue; }
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push({ rel, bytes: value.bytes });
  }
  const budget = o.budget == null ? SEED_BUDGET : o.budget;
  for (const mod of index) {
    const files = byId.get(mod.id) || [];
    if (!files.length) continue;
    const size = files.reduce((n, f) => n + f.bytes.length, 0);
    if (out.bytes + size > budget) {
      log && log(`  ${mod.name}: skipped, ${(size / 1048576).toFixed(1)} MB over the ${(budget / 1048576) | 0} MB budget`);
      out.skipped += files.length;
      continue;
    }
    let n = 0;
    for (const f of files) if (seed(`${GUEST_ROOT}${mod.id}/${f.rel}`, f.bytes)) n += 1;
    out.mods += 1; out.files += n; out.bytes += size;
    log && log(`  ${mod.name} (${mod.id}): ${n} file(s), ${(size / 1048576).toFixed(2)} MB`);
  }
  // whatever the game wrote under mods/ last time -- the disable.it that marks a
  // mod off -- but only for a mod that is still installed
  for (const { key, value } of await listModState(db)) {
    const k = String(key);
    if (!k.startsWith(GUEST_ROOT) || k === IMPORT_MARK) continue;
    const id = k.slice(GUEST_ROOT.length).split('/')[0];
    if (!known.has(id)) continue;
    if (seed(k, value.bytes)) out.state += 1;
  }
  return out;
}

// ---- the menu ----------------------------------------------------------------

const MENU_CSS = `
.isaac-mods-body { min-width: 26em; }
.isaac-mods-list { max-height: 40vh; overflow: auto; margin: 8px 0; }
.isaac-mods-list td.a { text-align: right; white-space: nowrap; }
.isaac-mods-empty { padding: 6px 0; }
`;

export function createModsMenu(opts) {
  const o = opts || {};
  const log = o.log || (() => {});
  const doc = o.document || document;
  let db = null, dlg = null, els = null, busy = false;

  function build() {
    if (dlg) return dlg;
    const style = doc.createElement('style');
    style.textContent = MENU_CSS;
    doc.head.appendChild(style);
    dlg = doc.createElement('dialog');
    dlg.id = 'mods';
    dlg.innerHTML = `<form method="dialog" class="isaac-mods-body">
      <h3>Mods</h3>
      <div class="note">Imported here, they stay in this browser: the file you chose can go.</div>
      <div class="isaac-mods-list"><table><tbody id="mods-rows"></tbody></table></div>
      <div class="row">
        <button id="mods-zip" type="button">Import .zip&hellip;</button>
        <button id="mods-dir" type="button">Import folder&hellip;</button>
      </div>
      <div id="mods-status" class="note"></div>
      <div class="row">
        <button id="mods-reload" type="button" hidden>Reload to apply</button>
        <button id="mods-close" type="button">Close</button>
      </div>
      <input id="mods-file" type="file" accept=".zip,application/zip" hidden>
      <input id="mods-folder" type="file" webkitdirectory directory multiple hidden>
    </form>`;
    doc.body.appendChild(dlg);
    const $ = (id) => dlg.querySelector('#' + id);
    els = { rows: $('mods-rows'), status: $('mods-status'), reload: $('mods-reload'),
            file: $('mods-file'), folder: $('mods-folder') };
    $('mods-close').addEventListener('click', () => close());
    $('mods-zip').addEventListener('click', () => els.file.click());
    $('mods-dir').addEventListener('click', () => els.folder.click());
    els.file.addEventListener('change', () => take(els.file));
    els.folder.addEventListener('change', () => take(els.folder));
    els.reload.addEventListener('click', () => location.reload());
    dlg.addEventListener('close', () => { if (o.onClose) o.onClose(); });
    return dlg;
  }

  function say(text, dirty) {
    els.status.textContent = text;
    if (dirty) els.reload.hidden = false;
    log(`[mods] ${text}`);
  }

  async function refresh() {
    const rows = [];
    let mods = [];
    try { db = db || await openModDb(); mods = db ? await listMods(db) : []; }
    catch (e) { say(`the mod store is unavailable: ${e.message}`); }
    for (const mod of mods) {
      const tr = doc.createElement('tr');
      const size = mod.bytes >= 1048576 ? `${(mod.bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(mod.bytes / 1024))} KB`;
      tr.innerHTML = `<td></td><td class="n">${mod.files}</td><td class="n">${size}</td><td class="a"><button type="button" data-id="">Remove</button></td>`;
      tr.children[0].textContent = mod.name;
      const btn = tr.querySelector('button');
      btn.dataset.id = mod.id;
      btn.addEventListener('click', () => remove(mod));
      rows.push(tr);
    }
    els.rows.replaceChildren(...rows);
    if (!rows.length) {
      const tr = doc.createElement('tr');
      tr.innerHTML = '<td class="isaac-mods-empty note">no mods yet</td>';
      els.rows.replaceChildren(tr);
    }
  }

  async function remove(mod) {
    if (busy) return;
    busy = true;
    try {
      await deleteMod(db, mod.id);
      say(`${mod.name} removed`, true);
      await refresh();
    } catch (e) { say(`could not remove ${mod.name}: ${e.message}`); }
    busy = false;
  }

  async function take(input) {
    if (busy) return;
    busy = true;
    const chosen = input.files;
    try {
      say('reading\u2026');
      const { entries, fallback } = await importFrom(chosen);
      const { mod, files, dropped, madeMetadata } = planMod(entries, fallback);
      const mib = (n) => `${(n / 1048576).toFixed(1)} MB`;
      if (mod.bytes > SEED_BUDGET) {
        throw new Error(`${mod.name} is ${mib(mod.bytes)}; the game is given ${mib(SEED_BUDGET)} for mods, `
          + 'so this one would be kept and never loaded');
      }
      db = db || await openModDb();
      if (!db) throw new Error('this browser keeps no database, so a mod could not be kept');
      await putMod(db, mod, files);
      const notes = [];
      if (madeMetadata) notes.push('no metadata.xml, so one was written');
      if (dropped.length) notes.push(`${dropped.length} path(s) outside the mod were dropped`);
      const total = (await listMods(db)).reduce((n, x) => n + x.bytes, 0);
      if (total > SEED_BUDGET) notes.push(`${mib(total)} of mods now, over the ${mib(SEED_BUDGET)} the game is given: `
        + 'the ones past it are skipped at the next boot');
      say(`${mod.name}: ${files.length} file(s), ${(mod.bytes / 1048576).toFixed(2)} MB`
        + (notes.length ? ` (${notes.join('; ')})` : ''), true);
      await refresh();
    } catch (e) {
      say(`import failed: ${e.message}`);
    }
    input.value = '';
    busy = false;
  }

  function open() {
    build();
    els.status.textContent = '';
    refresh();
    if (!dlg.open) dlg.showModal();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  return { open, close, isOpen: () => !!(dlg && dlg.open), refresh, element: () => dlg };
}
