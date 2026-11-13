// mods.mjs -- mods imported from this device, kept in the browser (round 74),
// with the enabled state owned by the page (round 76).
//
// The game looks for mods in `mods/` beside its executable and scans that
// directory itself (FindFirstFileA/W over the shim's own table,
// host_shims_fs.c). Nothing in that scan cares where the bytes came from, so a
// mod seeded before main is a mod on disk as far as the engine is concerned --
// which is the whole trick here. No patching, no menu surgery.
//
// Four pieces:
//
//   the store    a database of its own, `isaac-mods`. The saves live in
//                `isaac-saves` and the two never touch: importing, removing or
//                resetting mods cannot reach a save file, and a corrupt or
//                half-written mod cannot make the save store unreadable.
//
//   the import   a .zip or a folder. Both are read in the browser: zips through
//                DecompressionStream, folders through the directory picker. The
//                bytes are copied into the store, so deleting the file afterwards
//                changes nothing -- the mod is in the browser now, not on disk.
//                RAR and 7z are named and refused rather than half-read.
//
//   the browser  a catalogue on a CDN, searched and installed from the menu.
//                Nothing is bundled: the page fetches the catalogue when it is
//                opened, and a mod only when it is asked for.
//                scripts/recomp/assets/modpack.py builds both from a folder.
//
//   the button   a mod of our own, `mods/ import mod/`, listed as IMPORT MOD.
//                It shows up in the game's own mods list like any other, and the
//                menu's Enter toggles it -- which writes a `disable.it` into its
//                folder. That write comes back to the page through the FS shim's
//                persist hook, and the page opens this menu instead.
//
//                Round 82: it is seeded only once the player has a mod of their
//                own. A mod loaded is a modded run, and a modded run is one the
//                game will not give achievements for -- so a row that existed to
//                offer an import was quietly costing the unlocks of a player who
//                had installed nothing. With no mods the way in is the EDIT FILE
//                menu's MODS row, which is the page's own and costs nothing.
//
//                And only on a page with no catalogue: where there is one, the
//                MODS screen carries the MOD BROWSER paper, whose browser adds a
//                .zip as well, so the row is left out (seedMods' sentinel: false).
//
// On enabled and disabled: the engine writes `disable.it` when a mod is toggled
// off in its own list and greys the row, but it does not read that file back at
// the next start -- measured, with the fs layer tracing, under both of the mods
// roots it scans: the listing hands back `main.lua metadata.xml disable.it` and
// the mod loads anyway. So the page keeps the flag itself. A disable.it write
// flips it, an unlink flips it back, and a mod that is off is simply not seeded,
// which the engine cannot argue with.

import { unzip, archiveKind } from './zip.mjs';
import { cleanModName, cleanModText } from './mod_browser.mjs';

export const MODS_DB = 'isaac-mods', F_STORE = 'files', M_STORE = 'mods', S_STORE = 'state';
// The two places the engine looks. `c:/isaac/mods/` is what the resource layer
// mounts and lists; the Documents one is where the mod manager scans.
export const GUEST_ROOT = 'c:/isaac/mods/';       // fs_key() normalises to this
export const USER_ROOT = 'c:/isaac/documents/my games/binding of isaac repentance+/mods/';
export const GUEST_ROOTS = [GUEST_ROOT, USER_ROOT];
export const underMods = (key) => GUEST_ROOTS.find((r) => String(key).startsWith(r)) || null;
// The game's mods list prints the folder name, not the <name> in the metadata,
// so the folder is what has to read right -- and the list is sorted by it, which
// is why the name starts with a space: the import row stays at the top however
// many mods are installed.
export const IMPORT_DIR = ' import mod';
export const IMPORT_MARKS = GUEST_ROOTS.map((r) => `${r}${IMPORT_DIR}/disable.it`);
export const IMPORT_MARK = IMPORT_MARKS[0];
export const isImportMark = (key) => IMPORT_MARKS.includes(String(key));
export const SEED_BUDGET = 96 << 20;              // what the guest arena can spare for mods

// A disable.it under a mods root names the mod it belongs to, or null.
export function disableTarget(key) {
  const root = underMods(key);
  if (!root || isImportMark(key)) return null;
  const rel = String(key).slice(root.length);
  const cut = rel.lastIndexOf('/');
  if (cut < 0 || rel.slice(cut + 1).toLowerCase() !== 'disable.it') return null;
  const id = rel.slice(0, cut);
  return id.includes('/') ? null : id;
}

// The sentinel is a mod with nothing in it but a name. The game lists it, the
// menu selects it, and Enter on it is the import.
export const IMPORT_METADATA = `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <name>IMPORT MOD</name>
  <directory>${IMPORT_DIR}</directory>
  <description>Add a mod from this device, or from the browser.</description>
  <version>1</version>
</metadata>
`;

// ---- the store ---------------------------------------------------------------

// Round 86c: a database can exist at this version WITHOUT the stores in it.
// `indexedDB.open(name)` with no version creates an empty database at version
// 1, and an upgrade that is interrupted can leave one behind too; after that
// `open(name, 1)` sees a current version and never fires onupgradeneeded, so
// the stores are never made and every import fails for the life of the origin
// with "One of the specified object stores was not found" -- with no way out
// but clearing site data. So the stores are checked after opening, and a
// database missing any of them is reopened one version up to create them.
const STORES = [F_STORE, M_STORE, S_STORE];
const makeStores = (db) => {
  for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
};
export function openModDb() {
  // The first open names no version on purpose: it opens whatever is there at
  // whatever version it is at (asking for 1 fails outright on a database that
  // has been repaired to 2), and creates it at version 1 if it is absent. The
  // store check below is what makes that safe.
  const open = (version) => new Promise((resolve, reject) => {
    const req = version ? indexedDB.open(MODS_DB, version) : indexedDB.open(MODS_DB);
    req.onupgradeneeded = () => makeStores(req.result);   // '<id>/<rel>' -> {bytes}, '<id>' -> {...}, fs key -> {bytes}
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { resolve(null); return; }
    open(0).then((db) => {
      if (STORES.every((s) => db.objectStoreNames.contains(s))) { resolve(db); return; }
      const next = db.version + 1;
      db.close();
      open(next).then(resolve, reject);
    }, reject);
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

// a mod written before round 76 has no `enabled`, and an absent flag means on
const withDefaults = (m) => Object.assign({}, m, { enabled: m.enabled !== false });
export const listMods = (db) => all(db, M_STORE).then((r) => r.map((x) => withDefaults(x.value)).sort((a, b) => a.name.localeCompare(b.name)));
export const listModFiles = (db) => all(db, F_STORE);
export const listModState = (db) => all(db, S_STORE);

export const getMod = (db, id) => new Promise((resolve) => {
  try {
    const req = db.transaction(M_STORE, 'readonly').objectStore(M_STORE).get(id);
    req.onsuccess = () => resolve(req.result ? withDefaults(req.result) : null);
    req.onerror = () => resolve(null);
  } catch { resolve(null); }
});

// Importing over a mod that is already there replaces it. The old files go
// first, in the same transaction: a version that dropped a file would otherwise
// leave it behind for the seed to find.
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
    tx.objectStore(F_STORE).delete(IDBKeyRange.bound(`${id}/`, `${id}/\uffff`));
    tx.objectStore(M_STORE).delete(id);
    for (const r of GUEST_ROOTS) tx.objectStore(S_STORE).delete(IDBKeyRange.bound(`${r}${id}/`, `${r}${id}/\uffff`));
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

// The flag the engine will not keep for us.
export function setModEnabled(db, id, enabled) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(M_STORE, 'readwrite'), st = tx.objectStore(M_STORE);
    const req = st.get(id);
    req.onsuccess = () => {
      const m = req.result;
      if (!m) return;
      m.enabled = !!enabled;
      st.put(m, id);
    };
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ---- what a mod may be called ------------------------------------------------

// A path out of an archive is not to be trusted: `..`, a drive letter or a
// leading slash would all seed outside mods/, and one of those lands on a save.
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
  return { mod: { id, name, files: files.length, bytes, added: Date.now(), enabled: true }, files, dropped, madeMetadata: added };
}

// ---- reading what the picker handed over -------------------------------------

// One archive, or a directory's worth of files. A File carries
// webkitRelativePath when it came from the directory picker, which is the only
// way the browser tells us the shape of what was chosen.
// A drop carries either: `webkitGetAsEntry` walks a folder, and a lone file
// comes back as one entry with no slash in its name, which is how the caller
// tells the two apart. A browser without the API answers null and the caller
// falls back to the plain file list.
export async function entriesFromDrop(dt) {
  const items = dt && dt.items ? Array.from(dt.items) : [];
  const roots = items.map((it) => (it.webkitGetAsEntry ? it.webkitGetAsEntry() : null)).filter(Boolean);
  if (!roots.length) return null;
  const readDir = (dir) => new Promise((res, rej) => {
    const r = dir.createReader(), acc = [];
    const step = () => r.readEntries((batch) => { if (!batch.length) { res(acc); return; } acc.push(...batch); step(); }, rej);
    step();
  });
  const asFile = (e) => new Promise((res, rej) => e.file(res, rej));
  const out = [];
  const walk = async (entry, prefix) => {
    if (entry.isFile) {
      const f = await asFile(entry);
      out.push({ name: prefix + entry.name, bytes: new Uint8Array(await f.arrayBuffer()) });
      return;
    }
    for (const child of await readDir(entry)) await walk(child, `${prefix}${entry.name}/`);
  };
  for (const r of roots) await walk(r, '');
  return out;
}

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
  return archiveEntries(new Uint8Array(await f.arrayBuffer()), f.name);
}

// One archive, whatever it arrived as.
export async function archiveEntries(bytes, name) {
  const kind = archiveKind(bytes.subarray(0, Math.min(16, bytes.length)));
  if (kind === 'rar' || kind === '7z') {
    throw new Error(`this is a .${kind}, and nothing in a browser can open one. `
      + 'Extract it and drop the folder instead.');
  }
  if (kind !== 'zip') throw new Error('not a zip archive, and not a folder');
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return { entries: await unzip(buf), fallback: String(name).replace(/\.[^.]+$/, '') };
}

// ---- the browser: a catalogue on a CDN ---------------------------------------

// modpack.py writes `catalogue.json` and the parts beside it. Nothing is in the
// build: the catalogue is fetched when the browser is opened, and a mod's parts
// only when it is asked for.
export async function fetchCatalogue(base) {
  if (!base) throw new Error('no catalogue is configured for this build');
  const root = String(base).replace(/\/$/, '');
  const r = await fetch(`${root}/catalogue.json`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`the catalogue answered ${r.status}`);
  const j = await r.json();
  if (!j || !Array.isArray(j.mods)) throw new Error('that is not a catalogue');
  // A catalogue built before modpack.py kept whole descriptions cut them at 400
  // characters; a descriptions.json beside it, when there is one, has them whole.
  try {
    const d = await fetch(`${root}/descriptions.json`, { cache: 'no-cache' });
    const full = d.ok ? await d.json() : null;
    mergeDescriptions(j, full);
  } catch { /* the short ones stand */ }
  return j;
}
// Round 95: what installing `id` downloads. A catalogue entry may carry `requires`
// (catalogue ids, from its Steam Workshop page's Required items, modpack.py): those
// come first, each after its own, and the mod last. Anything already in `installed`
// is skipped along with what it needs; a cycle is cut where it closes; a requirement
// the catalogue does not list is named in `missing`, and nothing is installed then.
export function requiredChain(entries, id, installed = new Set()) {
  const byId = new Map((entries || []).map((e) => [e.id, e]));
  const order = [], missing = [], done = new Set();
  const visit = (x, open) => {
    if (done.has(x) || open.has(x)) return;
    if (installed.has(x)) return;
    const e = byId.get(x);
    if (!e) { if (!missing.includes(x)) missing.push(x); return; }
    open.add(x);
    for (const r of Array.isArray(e.requires) ? e.requires : []) visit(r, open);
    open.delete(x);
    done.add(x);
    order.push(e);
  };
  visit(id, new Set());
  return { order, missing };
}

// The whole description for every catalogue entry the file names, marked as whole.
export function mergeDescriptions(catalogue, full) {
  const texts = full && full.descriptions && typeof full.descriptions === 'object' ? full.descriptions : null;
  if (!texts) return 0;
  let n = 0;
  for (const m of catalogue.mods) {
    const t = texts[m.id];
    if (typeof t === 'string' && t.length >= String(m.description || '').length) { m.description = t; m.whole = true; n++; }
  }
  return n;
}

// The parts of one mod, joined back into the zip they were cut from. Each part
// is under jsDelivr's 20 MB ceiling, which is why there is more than one.
export async function fetchMod(base, entry, onProgress) {
  const root = String(base).replace(/\/$/, '');
  const parts = [];
  // Round 82: in bytes, not in parts. A mod that is one 19 MB part reported
  // nothing until it had arrived, which is a menu that looks hung. The body is
  // read as a stream and every chunk moves the number; the total is the size the
  // catalogue already carries, so it is known before the first byte.
  let got = 0;
  const want = entry.bytes || 0;
  for (let i = 0; i < entry.parts; i++) {
    const r = await fetch(`${root}/m/${entry.id}.${i}.bin`);
    if (!r.ok) throw new Error(`part ${i + 1} of ${entry.parts} answered ${r.status}`);
    if (!r.body || !r.body.getReader) {                 // no streams: one lump, one report
      const b = new Uint8Array(await r.arrayBuffer());
      parts.push(b); got += b.length;
      if (onProgress) onProgress(got, want);
      continue;
    }
    const reader = r.body.getReader(), piece = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      piece.push(value); got += value.length;
      if (onProgress) onProgress(got, want);
    }
    const n = piece.reduce((a, p) => a + p.length, 0), one = new Uint8Array(n);
    let at0 = 0;
    for (const p of piece) { one.set(p, at0); at0 += p.length; }
    parts.push(one);
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

// ---- packed mods (round 107) ---------------------------------------------------
// A mod too big to be seeded (Fiend Folio: 20,814 files, 667 MB) is shipped as
// content-addressed packs and an index (modpack.py --packed): `pk/<hash>.idx`, a
// gzip'd JSON index, and `pk/<hash>.bin`, packs of whole files (raw or raw
// deflate) behind an "IMPK" magic, every one a name that is the start of its own
// sha256. A catalogue entry says so with `packed: {base, index, indexBytes,
// eagerBytes, storedBytes}` and `parts: 0`.
//
// Installing one downloads the index and the eager lane (every .lua, the XML,
// what the boot reads, and a blob of every WAV's header) into the Cache API,
// nothing else; the mods store gets a row with `packed` and no files. At boot
// the files are registered by name and size (boot_web.mjs), the engine reads
// them in place at the offsets it asks for (host_shims_fs.c ranged entries), and
// the page answers each read from the header blob or a pack it holds at once,
// or from a pack it fetches (Cache API, then the network) by suspending it.
// No range requests: jsDelivr's cannot be trusted (portable.py), and a pack is
// small enough to fetch whole.
export const PACK_CACHE = 'isaac-modpacks-v1';
const PACK_KEY = 'https://modpacks.isaac.invalid/';          // the cache's key space: a pack is its name, wherever it came from
export const isPacked = (m) => !!(m && m.packed && m.packed.index);
// A packed mod is a very large one: with Fiend Folio the game's memory goes from
// 640 MiB to about 1.2 GB, which a phone's browser does not give a page. A
// touch-first device that does not report 8 GB is told so in the list, rather
// than let run out of memory in the middle of a boot. (deviceMemory is Chrome's
// and stops at 8; a browser without it is judged by its pointer alone.)
export const smallDevice = (env = globalThis) => {
  const coarse = typeof env.matchMedia === 'function' && !!env.matchMedia('(pointer: coarse)').matches;
  const mem = env.navigator ? env.navigator.deviceMemory : undefined;
  return coarse && !(mem >= 8);
};
export const NEEDS_COMPUTER = 'NEEDS A COMPUTER';
const hexOf = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
export async function sha256Hex(bytes) { return hexOf(await crypto.subtle.digest('SHA-256', bytes)); }
// a pack or an index is named after its bytes: the name (less its extension) is
// the start of their sha256
export async function namedRight(name, bytes) {
  const want = String(name).replace(/\.[a-z]+$/i, '').toLowerCase();
  return /^[0-9a-f]{16,64}$/.test(want) && (await sha256Hex(bytes)).startsWith(want);
}
const streamed = async (bytes, format) => new Uint8Array(await new Response(
  new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format))).arrayBuffer());
export const gunzipBytes = (bytes) => streamed(bytes, 'gzip');
export const inflateRawBytes = (bytes) => streamed(bytes, 'deflate-raw');
// where an entry's packs are: `packed.base` absolute, or relative to the catalogue
export function packBase(catalogueBase, entry) {
  const b = String((entry && entry.packed && entry.packed.base) || 'pk');
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(b)) return b.replace(/\/+$/, '');
  return `${String(catalogueBase || '').replace(/\/+$/, '')}/${b.replace(/^\/+|\/+$/g, '')}`;
}
// index rows: [path, size, pack (or a list of packs for a split file), offset,
// stored length (or a list), codec 0 raw / 1 raw deflate, sha256 prefix, WAV
// header length]; packs: [name, stored bytes, lane]; heads: [pack, offset, length]
export function parseIndex(text) {
  const ix = JSON.parse(text);
  if (!ix || ix.v !== 1 || !Array.isArray(ix.packs) || !Array.isArray(ix.f)) throw new Error('not a pack index');
  for (const row of ix.f) {
    const p = Array.isArray(row[2]) ? row[2] : [row[2]];
    if (typeof row[0] !== 'string' || !safeRel(row[0]) || p.some((i) => !ix.packs[i])) throw new Error(`a bad index row: ${row[0]}`);
  }
  for (const [path, i] of ix.alias || []) if (!safeRel(path) || !ix.f[i]) throw new Error(`a bad alias: ${path}`);
  return ix;
}

// Packs, wherever they are: the Cache API first, then `<base>/<name>` (retried,
// then given up on), each checked against its name before it is used or kept.
export function createPackStore(opts) {
  const o = opts || {};
  const fetchFn = o.fetch || ((url, init) => fetch(url, init));
  const cacheApi = o.caches !== undefined ? o.caches : (typeof caches !== 'undefined' ? caches : null);
  const retries = o.retries == null ? 3 : o.retries;
  const backoff = o.backoffMs || [1000, 3000, 9000];
  const coldWaitMs = o.coldWaitMs || 22000, coldTries = o.coldTries == null ? 3 : o.coldTries;
  const sleep = o.sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
  const log = o.log || (() => {});
  const stats = { cacheHits: 0, fetched: 0, fetchedBytes: 0, retried: 0, rejected: 0, kept: 0, shared: 0 };
  // a pack being downloaded, by name: a second asker (the game and the background
  // download, say) waits on the same download rather than starting another
  const inflight = new Map();
  // the reads the game waits on that are on the network now, and who to tell when
  // there are none (the background download starts nothing while there are some)
  let urgent = 0;
  const idle = new Set(), keptBy = new Set(), wantedBy = new Set();
  const wanted = new Map();                  // name -> how many such reads want it
  const tell = (set, ...a) => { for (const f of [...set]) { try { f(...a); } catch { /* a listener's own trouble */ } } };
  let cacheP = null;
  const cache = () => {
    if (!cacheApi) return Promise.resolve(null);
    if (!cacheP) cacheP = Promise.resolve().then(() => cacheApi.open(PACK_CACHE)).catch(() => null);
    return cacheP;
  };
  async function cached(name) {
    const c = await cache();
    if (!c) return null;
    try { const r = await c.match(PACK_KEY + name); return r ? new Uint8Array(await r.arrayBuffer()) : null; } catch { return null; }
  }
  async function keep(name, bytes) {
    const c = await cache();
    if (!c) return false;
    try {
      await c.put(PACK_KEY + name, new Response(bytes, { headers: { 'content-type': 'application/octet-stream' } }));
      stats.kept += 1;
      tell(keptBy, name, bytes.length);
      return true;
    } catch (e) { log(`[mods] ${name} could not be kept: ${e.message}`); return false; }
  }
  const magicOk = (name, b) => !/\.bin$/i.test(name) || (b.length >= 8 && b[0] === 0x49 && b[1] === 0x4d && b[2] === 0x50 && b[3] === 0x4b);
  // a failure says what kind it was: `status` the HTTP answer, `refused` bytes that are not the pack's
  const failure = (msg, extra) => Object.assign(new Error(msg), extra);
  async function download(base, name, size, tries, signal, quiet) {
    const n = tries == null ? retries : tries;
    // A 403 is its own count: jsDelivr answers the first request for a file it has not
    // served with a 403 it then repeats for a minute, and the ordinary retries (13 s in
    // all) end inside that minute -- the game's read, or an install, failed on a pack
    // that was there. So a 403 waits `coldWaitMs` and is asked for `coldTries` more
    // times, past the minute. A caller with no retries of its own (the background
    // download, which keeps its own clock) gets none here either.
    const coldMax = n > 0 ? coldTries : 0;
    let last = null, plain = 0, cold = 0;
    for (;;) {
      if (last) { stats.retried += 1; await sleep(last.status === 403 ? coldWaitMs : backoff[Math.min(plain - 1, backoff.length - 1)]); }
      try {
        const r = await fetchFn(`${base}/${name}`, signal ? { signal } : undefined);
        if (!r.ok) throw failure(`HTTP ${r.status}`, { status: r.status });
        const b = new Uint8Array(await r.arrayBuffer());
        if (size != null && b.length !== size) throw failure(`${b.length} bytes where ${size} were expected`, { refused: true });
        if (!magicOk(name, b) || !(await namedRight(name, b))) { stats.rejected += 1; throw failure('its bytes are not the ones its name stands for', { refused: true }); }
        stats.fetched += 1; stats.fetchedBytes += b.length;
        return b;
      } catch (e) {
        last = e;
        // called off (the background download, for a read the game waits on): no retry
        if (signal && signal.aborted) throw failure(`${name}: called off`, { aborted: true });
        const more = e.status === 403 ? (cold += 1) <= coldMax : (plain += 1) <= n;
        if (!quiet) log(`[mods] ${name}: ${e.message}${more ? (e.status === 403 ? `; trying again in ${Math.round(coldWaitMs / 1000)} s` : '; trying again') : ''}`);
        if (!more) break;
      }
    }
    throw failure(`${name} could not be fetched (${last ? last.message : 'no answer'})`,
      { status: last && last.status, refused: !!(last && last.refused), network: !!last && !last.status && !last.refused });
  }
  // The bytes of `name` and where they came from ('cache' or 'net'), and whether
  // they were kept. how: { keep: false, or a function of the name saying whether
  // to keep it; retries: this call's own count; background: true for a fetch
  // nobody is waiting on (it does not count as urgent, and a failed download it
  // joined is not tried again for it, and its failures are its own to say);
  // signal: an AbortSignal that calls it off }.
  async function getFrom(base, name, size, how) {
    const h = how || {};
    const hit = await cached(name);
    if (hit && (size == null || hit.length === size) && magicOk(name, hit)) { stats.cacheHits += 1; return { bytes: hit, from: 'cache', kept: true }; }
    const bg = !!h.background;
    if (!bg) { urgent += 1; wanted.set(name, (wanted.get(name) || 0) + 1); tell(wantedBy, name); }
    try {
      const was = inflight.get(name);
      if (was) {
        try { const r = await was; stats.shared += 1; return { bytes: r.bytes, from: 'net', kept: r.kept }; }
        catch (e) { if (bg) throw e; }            // the game's read tries again on its own count
      }
      const p = download(base, name, size, h.retries, h.signal, bg).then(async (b) => {
        const want = typeof h.keep === 'function' ? h.keep(name) : h.keep !== false;
        return { bytes: b, kept: want ? await keep(name, b) : false };
      });
      inflight.set(name, p);
      p.then(() => {}, () => {}).then(() => { if (inflight.get(name) === p) inflight.delete(name); });
      const r = await p;
      return { bytes: r.bytes, from: 'net', kept: r.kept };
    } finally {
      if (!bg) {
        if (wanted.get(name) > 1) wanted.set(name, wanted.get(name) - 1); else wanted.delete(name);
        if (--urgent === 0) tell(idle);
      }
    }
  }
  // the bytes of `name`; `keep: false` fetches without keeping
  async function get(base, name, size, how) { return (await getFrom(base, name, size, how)).bytes; }
  // whether `name` is kept, without reading it
  async function has(name) {
    const c = await cache();
    if (!c) return false;
    try { return !!(await c.match(PACK_KEY + name)); } catch { return false; }
  }
  // the names of every pack and index kept (one listing, no bodies read)
  async function names() {
    const c = await cache(), out = new Set();
    if (!c || typeof c.keys !== 'function') return out;
    try { for (const req of await c.keys()) { const u = typeof req === 'string' ? req : req.url; if (u.startsWith(PACK_KEY)) out.add(u.slice(PACK_KEY.length)); } }
    catch { /* an unreadable cache lists nothing: every pack is fetched again, and checked */ }
    return out;
  }
  async function drop(names) {
    const c = await cache();
    let n = 0;
    if (c) for (const name of names) { try { if (await c.delete(PACK_KEY + name)) n += 1; } catch { /* gone */ } }
    return n;
  }
  return { get, getFrom, has, names, drop, stats,
           urgent: () => urgent,
           // whether a read the game waits on wants `name` from the network now; and
           // who to tell, with the name, when such a read starts
           wants: (name) => wanted.has(name),
           onWanted: (f) => { wantedBy.add(f); return () => wantedBy.delete(f); },
           onIdle: (f) => { idle.add(f); return () => idle.delete(f); },
           onKept: (f) => { keptBy.add(f); return () => keptBy.delete(f); } };
}

// The packed mods of one boot: which engine paths are theirs, and the bytes of a
// read. `pread` answers a Uint8Array when it can at once (a WAV header out of the
// header blob, a file decoded already, a raw file in a pack held) and a Promise
// of one otherwise. The eager lane is held until release(); then the packs a
// read needs are held up to `holdBytes`, and decoded files up to `fileBytes`.
export function createPackedMods(opts) {
  const o = opts || {};
  const store = o.store;
  const holdBytes = o.holdBytes == null ? (48 << 20) : o.holdBytes;
  const fileBytes = o.fileBytes == null ? (16 << 20) : o.fileBytes;
  const onWait = o.onWait || (() => {});
  const clock = o.now || (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const files = new Map();                 // engine path -> { mod, row, i }
  const mods = new Map();                  // id -> { id, base, index, heads, headAt }
  const packs = new Map(), pinned = new Set(), decoded = new Map(), loading = new Map(), cameFrom = new Map();
  // A read the game waited on: how many, for how long in all (ms), the longest, how
  // many over 50 ms; and the same by what it waited for -- a pack off the network
  // ('net'), a pack out of the Cache API ('cache'), or only the decoding of a file
  // whose pack was held ('decode').
  const waitKind = () => ({ n: 0, ms: 0, max: 0 });
  const stats = { heads: 0, held: 0, waited: 0, packLoads: 0, bytes: 0, pending: 0, failed: 0,
                  waitMs: 0, waitMax: 0, waitOver50: 0, waitBy: { net: waitKind(), cache: waitKind(), decode: waitKind() } };
  function waitedFor(kind, ms) {
    stats.waitMs += ms; if (ms > stats.waitMax) stats.waitMax = ms; if (ms > 50) stats.waitOver50 += 1;
    const k = stats.waitBy[kind];
    k.n += 1; k.ms += ms; if (ms > k.max) k.max = ms;
  }
  const lru = (map, k) => { const v = map.get(k); if (v !== undefined) { map.delete(k); map.set(k, v); } return v; };
  const sizeOf = (map) => { let n = 0; for (const b of map.values()) n += b.length; return n; };
  function trim() {
    let held = sizeOf(packs);
    for (const [k, b] of packs) { if (held <= holdBytes) break; if (pinned.has(k)) continue; packs.delete(k); held -= b.length; }
    let dec = sizeOf(decoded);
    for (const [k, b] of decoded) { if (dec <= fileBytes) break; decoded.delete(k); dec -= b.length; }
  }
  function pack(mod, p) {
    const [name, size] = mod.index.packs[p];
    const have = lru(packs, name);
    if (have) return have;
    if (!loading.has(name)) {
      stats.packLoads += 1;
      loading.set(name, store.getFrom(mod.base, name, size).then((r) => { cameFrom.set(name, r.from); packs.set(name, r.bytes); trim(); return r.bytes; })
        .finally(() => loading.delete(name)));
    }
    return loading.get(name);
  }
  async function add(id, base, index) {
    const mod = { id, base, index, heads: null, headAt: new Map() };
    let at = 0;
    index.f.forEach((row, i) => { if (row[7]) { mod.headAt.set(i, at); at += row[7]; } });
    const eager = [];
    index.packs.forEach((p, i) => { if (p[2] === 'eager') eager.push(i); });
    for (const i of eager) { pinned.add(index.packs[i][0]); await pack(mod, i); }
    if (index.heads) {
      const [p, off, len] = index.heads;
      mod.heads = (await pack(mod, p)).slice(off, off + len);
    }
    mods.set(id, mod);
    index.f.forEach((row, i) => files.set(`mods/${id}/${row[0]}`, { mod, row, i }));
    for (const [path, i] of index.alias || []) files.set(`mods/${id}/${path}`, { mod, row: index.f[i], i });
    return mod;
  }
  function remove(id) {
    for (const [k, e] of files) if (e.mod.id === id) files.delete(k);
    mods.delete(id);
  }
  // the engine paths and sizes of one mod, for registration
  function* paths(id) { for (const [k, e] of files) if (e.mod.id === id) yield [k, e.row[1]]; }
  const key = (e) => `${e.mod.id}#${e.i}`;
  function bodyNow(e) {
    const d = lru(decoded, key(e));
    if (d) return d;
    const [, , p, off, ln, codec] = e.row;
    if (codec === 0 && !Array.isArray(p)) {
      const b = lru(packs, e.mod.index.packs[p][0]);
      if (b) return b.subarray(off, off + ln);
    }
    return null;
  }
  // `why`, when given, is told what the read waited for: 'net' over 'cache' over 'decode'
  async function body(e, why) {
    const now = bodyNow(e);
    if (now) return now;
    const [path, size, p, off, ln, codec] = e.row;
    const names = (Array.isArray(p) ? p : [p]).map((pi) => e.mod.index.packs[pi][0]);
    const away = names.filter((n) => !packs.has(n));
    let stored;
    if (Array.isArray(p)) {
      const parts = await Promise.all(p.map((pi) => pack(e.mod, pi)));
      stored = new Uint8Array(ln.reduce((a, b) => a + b, 0));
      let at = 0;
      parts.forEach((b, k) => { stored.set(b.subarray(8, 8 + ln[k]), at); at += ln[k]; });
    } else stored = (await pack(e.mod, p)).subarray(off, off + ln);
    if (why && away.length) why.from = away.some((n) => cameFrom.get(n) === 'net') ? 'net' : 'cache';
    const out = codec === 1 ? await inflateRawBytes(stored) : stored;
    if (out.length !== size) throw new Error(`${path}: ${out.length} bytes out of its pack, ${size} in the index`);
    if (codec === 1 || Array.isArray(p)) { decoded.set(key(e), out); trim(); }
    return out;
  }
  function pread(src, off, len) {
    const e = files.get(src);
    if (!e) return null;
    const size = e.row[1], end = Math.min(size, off + len);
    if (off >= end) return new Uint8Array(0);
    const hl = e.row[7];
    if (hl && end <= hl && e.mod.heads) {
      stats.heads += 1; stats.bytes += end - off;
      const h = e.mod.headAt.get(e.i);
      return e.mod.heads.subarray(h + off, h + end);
    }
    const now = bodyNow(e);
    if (now) { stats.held += 1; stats.bytes += end - off; return now.subarray(off, end); }
    stats.waited += 1; stats.pending += 1;
    onWait(stats.pending, src);
    const t0 = clock(), why = { from: 'decode' };
    return body(e, why).then((b) => { stats.bytes += end - off; waitedFor(why.from, clock() - t0); return b.subarray(off, end); },
      (err) => { stats.failed += 1; throw err; })
      .finally(() => { stats.pending -= 1; onWait(stats.pending, src); });
  }
  // a whole file, only if it is at hand (the engine's whole-file read cannot wait)
  function readNow(src) { const e = files.get(src); return e ? bodyNow(e) : null; }
  // the mod's Lua, for MEMFS: [relative path, bytes]
  async function lua(id) {
    const out = [];
    for (const [k, e] of files) if (e.mod.id === id && /\.lua$/i.test(k)) out.push([k.slice(`mods/${id}/`.length), await body(e)]);
    return out;
  }
  function release() { pinned.clear(); decoded.clear(); trim(); }
  return { add, remove, paths, pread, readNow, lua, release, owns: (src) => files.has(src), stats,
           held: () => ({ packs: packs.size, packBytes: sizeOf(packs), files: decoded.size, fileBytes: sizeOf(decoded) }) };
}

// An installed packed mod's index, from the Cache API (or its base again)
export async function packedIndex(store, mod) {
  const p = mod.packed;
  const gz = await store.get(p.base, p.index, p.indexBytes == null ? null : p.indexBytes);
  return parseIndex(new TextDecoder().decode(await gunzipBytes(gz)));
}
// What deleting `mod` frees: its index and every pack no other installed packed
// mod's index names
export async function packsOnlyOf(store, mod, others) {
  const keep = new Set();
  for (const m of others) {
    if (!isPacked(m) || m.id === mod.id) continue;
    try { const ix = await packedIndex(store, m); keep.add(m.packed.index); for (const [n] of ix.packs) keep.add(n); } catch { /* unreadable: it keeps nothing */ }
  }
  const mine = [mod.packed.index];
  try { for (const [n] of (await packedIndex(store, mod)).packs) mine.push(n); } catch { /* its index is gone: drop what we can name */ }
  return mine.filter((n) => !keep.has(n));
}

// The installed packed mods that are on, from the mods store
export async function installedPacked(db) {
  const d = db || await openModDb();
  return d ? (await listMods(d)).filter((m) => m.enabled !== false && isPacked(m)) : [];
}

// Round 108: every pack of an installed packed mod, fetched into the pack cache in
// the background, so that once it is done no read of the mod waits on the network
// (measured on the live site: 399 reads waited during one tour, ten of them on a
// pack fetch, each a freeze as long as the fetch).
//
//  - What is fetched: the packs of `mods()` (the installed packed mods that are on)
//    the cache does not list (store.names(): one listing, no bodies read), the lazy
//    lane before the WAV bodies; so a later boot carries on where the last stopped
//    and nothing kept is fetched twice.
//  - How: `concurrency` (2) at a time (pace(n) changes that: one at a time while the
//    game boots), through the same store the game reads with, which shares a
//    download two askers want. A read the game is waiting on jumps the
//    queue: when one goes to the network (store.onWanted), the downloads under way for
//    other packs are called off (they go back to the front, and start again later),
//    nothing new starts until no such read is left (store.urgent()), and the packs
//    either side of the one it wanted (`near`, in the same mod and lane: modpack.py
//    packs files in path order, so they hold the files next to it) move to the front.
//  - When it fails: a 403 (jsDelivr's answer, cached for 60 s, to the first request
//    for a file it has not served) is tried again after `wait403` (65 s); any other
//    failure after `backoffMs`, growing; the pack goes to the back of the queue in
//    the meantime. Three failures in a row pause the whole queue (offline, or the
//    host down), as does the browser saying it is offline, until it says it is
//    online again or the pause runs out. A pack the host does not have (404) or whose
//    bytes are not the ones its name stands for is given up on after `giveUpAfter`
//    tries, for this visit: the game still fetches it as it is played.
//  - Room: before anything is fetched, storage.estimate() must leave room for what
//    is left (plus a margin); persist() is asked for. Without room nothing is
//    fetched, it is said once, and the mod is fetched as it is played, as before.
// State: 'idle', 'checking', 'running', 'waiting' (everything left is backing off),
// 'paused' (offline, or failing), 'noroom', 'phone', 'complete', 'incomplete' (some
// packs given up on), 'stopped'.
export function createPackDownloader(opts) {
  const o = opts || {};
  const store = o.store;
  const log = o.log || (() => {});
  const concurrency = Math.max(1, o.concurrency || 2);
  const backoffMs = o.backoffMs || [5000, 20000, 60000, 120000, 300000];
  const wait403 = o.wait403 == null ? 65000 : o.wait403;
  const pauseMs = o.pauseMs || [15000, 60000, 300000];
  const giveUpAfter = o.giveUpAfter || 4;
  const near = o.near == null ? 2 : o.near;
  const margin = o.marginBytes == null ? (64 << 20) : o.marginBytes;
  const now = o.now || (() => Date.now());
  const sleep = o.sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
  const nav = o.navigator !== undefined ? o.navigator : (typeof navigator !== 'undefined' ? navigator : null);
  const storage = o.storage !== undefined ? o.storage : (nav && nav.storage) || null;
  const online = o.online || (() => !(nav && nav.onLine === false));
  const small = o.smallDevice || (() => smallDevice());
  // a mod's packs, read out of its index once per mod (a plan again later costs no parse)
  const packsMemo = new Map();
  const packsOf = async (mod) => {
    if (!packsMemo.has(mod.id)) packsMemo.set(mod.id, await (o.packsOf ? o.packsOf(mod) : packedIndex(store, mod).then((ix) => ix.packs)));
    return packsMemo.get(mod.id);
  };
  let limit = concurrency;
  const modsNow = o.mods || (() => installedPacked());
  const events = o.events !== undefined ? o.events : (typeof window !== 'undefined' ? window : null);
  const listeners = new Set();
  const st = { state: 'idle', packs: 0, packsHave: 0, bytes: 0, bytesHave: 0, fetched: 0, fetchedBytes: 0, fromGame: 0,
               failures: 0, refused403: 0, pauses: 0, gaveUp: 0, calledOff: 0, active: 0, startedAt: null, ms: null, need: null, free: null, lastError: null };
  let jobs = [];                            // { name, base, size, lane, mods: [rec], tries, notBefore, active }
  let recs = new Map();                     // mod id -> { id, name, total, have, packs, packsHave }
  let where = new Map();                    // pack name -> { mod, i, lane }: its place in its mod's index
  const done = new Set(), forgotten = new Set();
  let running = null, again = false, stopped = false, said = false, inARow = 0, pausedUntil = 0, wakeUp = null;
  const changed = () => { for (const f of listeners) { try { f(); } catch { /* a listener's own trouble */ } } };
  const setState = (s) => { if (st.state !== s) { st.state = s; changed(); } };
  const wake = () => { const w = wakeUp; wakeUp = null; if (w) w(); };
  const nap = (ms) => new Promise((r) => { wakeUp = r; sleep(Math.max(1, ms)).then(r); });
  // a pack kept by anyone (the game's own read, say) counts at once
  function have(name) {
    if (done.has(name)) return;
    const j = jobs.find((x) => x.name === name);
    if (!j || j.active) return;
    finish(j, false);
  }
  if (store && store.onKept) store.onKept((name) => { have(name); });
  if (store && store.onIdle) store.onIdle(wake);
  // a read the game waits on went to the network for `name`: it has the line to itself
  if (store && store.onWanted) store.onWanted((name) => {
    for (const j of jobs) if (j.active && j.ctl && !j.ctl.signal.aborted && !store.wants(j.name)) { j.calledOff = true; j.ctl.abort(); }
    const at = where.get(name);
    if (!at || !near) return;
    const dist = (j) => Math.abs(j.i - at.i);
    const close = jobs.filter((j) => !j.active && j.mod === at.mod && j.lane === at.lane && dist(j) <= near).sort((a, b) => dist(a) - dist(b));
    if (close.length) { jobs = close.concat(jobs.filter((j) => !close.includes(j))); changed(); }
  });
  if (events && typeof events.addEventListener === 'function') {
    events.addEventListener('online', () => { pausedUntil = 0; inARow = 0; for (const j of jobs) if (!j.was403) j.notBefore = 0; wake(); });
    events.addEventListener('offline', () => wake());
  }
  function finish(j, fetched) {
    jobs = jobs.filter((x) => x !== j);
    if (done.has(j.name)) return;
    done.add(j.name);
    for (const r of j.mods) { r.have += j.size; r.packsHave += 1; }
    st.packsHave += 1; st.bytesHave += j.size;
    if (fetched) { st.fetched += 1; st.fetchedBytes += j.size; } else st.fromGame += 1;
    changed();
  }
  async function plan() {
    // what the store lists now is what is wanted (a mod removed is gone from it; one
    // installed again is wanted again)
    const list = await modsNow();
    for (const m of list) forgotten.delete(m.id);
    const kept = await store.names();
    const byName = new Map(), active = new Map(jobs.filter((j) => j.active).map((j) => [j.name, j]));
    recs = new Map(); where = new Map();
    const order = { eager: 0, lazy: 1, wav: 2 };
    for (const mod of list) {
      let packs;
      try { packs = await packsOf(mod); } catch (e) { log(`[mods] ${mod.name || mod.id}: its index could not be read (${e.message}); it is fetched as it is played`); continue; }
      const ib = (mod.packed && mod.packed.indexBytes) || 0;
      const r = { id: mod.id, name: mod.name || mod.id, total: ib, have: ib, packs: packs.length, packsHave: 0 };
      recs.set(mod.id, r);
      packs.forEach(([name, , lane], i) => { if (!where.has(name)) where.set(name, { mod: mod.id, i, lane }); });
      for (const [name, size, lane] of packs) {
        r.total += size;
        if (kept.has(name) || done.has(name)) { r.have += size; r.packsHave += 1; continue; }
        if (byName.has(name)) { byName.get(name).mods.push(r); continue; }
        // one being fetched stays the one being fetched
        const was = active.get(name);
        if (was) { was.mods = [r]; byName.set(name, was); continue; }
        const at = where.get(name);
        byName.set(name, { name, base: mod.packed.base, size, lane, mod: at.mod, i: at.i, mods: [r], tries: 0, notBefore: 0, active: false });
      }
    }
    jobs = [...byName.values()].map((j, i) => [j, i]).sort((a, b) => ((order[a[0].lane] ?? 1) - (order[b[0].lane] ?? 1)) || a[1] - b[1]).map(([j]) => j);
    st.packs = 0; st.packsHave = 0; st.bytes = 0; st.bytesHave = 0;
    for (const r of recs.values()) { st.packs += r.packs; st.packsHave += r.packsHave; st.bytes += r.total; st.bytesHave += r.have; }
  }
  async function roomFor(need) {
    if (!storage) return true;
    try { if (storage.persist) await storage.persist(); } catch { /* best effort */ }
    if (!storage.estimate) return true;
    let e;
    try { e = await storage.estimate(); } catch { return true; }
    if (!e || !(e.quota > 0)) return true;
    st.free = Math.max(0, e.quota - (e.usage || 0)); st.need = need;
    return st.free >= need + margin;
  }
  function launch(j) {
    j.active = true; st.active += 1;
    j.ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    (async () => {
      // the game may have fetched it since the plan
      if (await store.has(j.name)) return { from: 'cache', kept: true };
      return store.getFrom(j.base, j.name, j.size, { background: true, retries: 0, signal: j.ctl ? j.ctl.signal : undefined,
                                                       keep: () => !j.mods.every((r) => forgotten.has(r.id)) });
    })().then((r) => {
      j.active = false; st.active -= 1;
      if (r.from === 'net' && !r.kept && !j.mods.every((rr) => forgotten.has(rr.id))) {
        // fetched and not kept: the storage is full after all
        st.lastError = `${j.name} could not be kept`;
        if (!said) { said = true; log(`[mods] there is no room left to keep the rest of the mod's files: they are fetched as they are played`); }
        stopped = true; setState('noroom');
        return;
      }
      inARow = 0;
      finish(j, r.from === 'net');
    }, (e) => {
      j.active = false; st.active -= 1;
      // called off for the game's read: not a failure, and it keeps its place
      if (j.calledOff) { j.calledOff = false; st.calledOff += 1; changed(); return; }
      st.failures += 1; j.tries += 1; inARow += 1;
      st.lastError = `${j.name}: ${e.message}`;
      j.was403 = e.status === 403;
      if (j.was403) st.refused403 += 1;
      const hopeless = (e.status === 404 || e.status === 410 || e.refused) && j.tries >= giveUpAfter;
      if (hopeless) {
        jobs = jobs.filter((x) => x !== j);
        st.gaveUp += 1;
        log(`[mods] ${j.name}: given up on after ${j.tries} tries (${e.message}); it is fetched when the game needs it`);
      } else {
        j.notBefore = now() + (j.was403 ? wait403 : backoffMs[Math.min(j.tries - 1, backoffMs.length - 1)]);
        // to the back of the queue meanwhile
        jobs = jobs.filter((x) => x !== j).concat([j]);
        if (inARow >= 3 && !j.was403) { pausedUntil = now() + pauseMs[Math.min(st.pauses, pauseMs.length - 1)]; st.pauses += 1; inARow = 0; }
      }
      changed();
    }).finally(wake);
  }
  async function loop() {
    for (;;) {
      if (stopped) { if (st.state !== 'noroom') setState('stopped'); return; }
      if (again) { again = false; await plan(); changed(); }
      if (!jobs.length && !st.active) {
        st.ms = now() - st.startedAt;
        setState(st.gaveUp ? 'incomplete' : 'complete');
        log(`[mods] ${st.gaveUp ? `every pack but ${st.gaveUp} is kept` : 'every pack is kept'}: ${st.fetched} fetched (${(st.fetchedBytes / 1048576).toFixed(1)} MB) in ${(st.ms / 1000).toFixed(1)} s`);
        return;
      }
      const t = now();
      if (!online()) { setState('paused'); await nap(30000); continue; }
      if (pausedUntil > t) { setState('paused'); await nap(pausedUntil - t); continue; }
      // a read the game is waiting on is on the network: it has the line to itself
      if (store.urgent && store.urgent() > 0) { await nap(1000); continue; }
      if (st.active < limit) {
        const j = jobs.find((x) => !x.active && x.notBefore <= t);
        if (j) { setState('running'); launch(j); continue; }
      }
      const soonest = jobs.filter((x) => !x.active).reduce((m, x) => Math.min(m, x.notBefore), Infinity);
      if (!st.active) setState('waiting');
      await nap(st.active ? Math.min(30000, Math.max(0, soonest - t)) || 30000 : Math.max(0, soonest - t));
    }
  }
  // Starts (or, running, looks again at what is installed). The promise settles
  // once the plan is made and the room checked; the queue then runs on its own.
  async function start() {
    if (running) { again = true; wake(); return st.state; }
    stopped = false;
    if (small()) { setState('phone'); return st.state; }
    setState('checking');
    try { await plan(); } catch (e) { st.lastError = e.message; setState('idle'); log(`[mods] the background download could not start: ${e.message}`); return st.state; }
    if (!jobs.length) { st.ms = st.ms || 0; setState(st.gaveUp ? 'incomplete' : (st.packs ? 'complete' : 'idle')); return st.state; }
    const need = jobs.reduce((n, j) => n + j.size, 0);
    if (!(await roomFor(need))) {
      if (!said) {
        said = true;
        log(`[mods] not enough room to keep every file of the packed mods (${(need / 1048576).toFixed(0)} MB to come, ${(st.free / 1048576).toFixed(0)} MB free): they are fetched as they are played`);
      }
      setState('noroom');
      return st.state;
    }
    st.startedAt = now(); st.ms = null;
    log(`[mods] fetching the rest of the packed mods in the background: ${jobs.length} pack(s), ${(need / 1048576).toFixed(1)} MB`);
    setState('running');
    running = loop().catch((e) => { st.lastError = e.message; setState('stopped'); log(`[mods] the background download stopped: ${e.message}`); })
      .finally(() => { running = null; });
    return st.state;
  }
  // a mod removed: its packs are no longer wanted (one another mod names still is)
  function forget(id) {
    forgotten.add(id);
    packsMemo.delete(id);
    jobs = jobs.filter((j) => !j.mods.every((r) => forgotten.has(r.id)));
    recs.delete(id);
    done.clear();                           // its packs leave the cache: the next plan asks the cache again
    changed();
  }
  function progress(id) {
    const r = recs.get(id);
    return r ? { have: r.have, total: r.total, packs: r.packs, packsHave: r.packsHave, state: r.have >= r.total ? 'complete' : st.state } : null;
  }
  return {
    start, forget, progress,
    stop: () => { stopped = true; wake(); },
    // how many at a time from now on (0: `concurrency`); the boot asks for one while it loads
    pace: (n) => { limit = n > 0 ? n : concurrency; wake(); },
    stats: () => Object.assign({}, st, { queued: jobs.length }),
    onChange: (f) => { listeners.add(f); return () => listeners.delete(f); },
    // what the queue holds, in order (for tests and drivers)
    queue: () => jobs.map((j) => j.name),
  };
}

// ---- seeding, before the game looks ------------------------------------------

// `seed(path, bytes)` is the pipeline's isaac_fs_seed. Every path is built here,
// under a mods root, from an id and a relative name that have both already been
// through safeRel/modId -- so nothing a mod carries can decide where it lands.
// A mod that is off is not seeded at all: the engine will not keep that flag for
// us, so the page keeps it by leaving the mod out.
export async function seedMods(db, seed, log, opts) {
  const o = opts || {};
  const out = { mods: 0, files: 0, bytes: 0, skipped: 0, state: 0, off: 0 };
  const index = db ? await listMods(db) : [];
  const on = index.filter((m) => m.enabled !== false);
  // Round 82: the import row is a mod, and a mod loaded is a modded run -- which
  // turned the achievement indicator on for a player who had installed nothing.
  // It is seeded only once there is a mod of the player's own, by which point the
  // run is modded anyway. With none, the way in is the EDIT FILE menu.
  if (o.sentinel !== false && on.length) {
    const meta = new TextEncoder().encode(IMPORT_METADATA);
    for (const root of GUEST_ROOTS) if (seed(`${root}${IMPORT_DIR}/metadata.xml`, meta)) out.files += 1;
  }
  if (!db) return out;
  const known = new Set(on.map((x) => x.id));
  out.off = index.length - on.length;
  const byId = new Map();
  for (const { key, value } of await listModFiles(db)) {
    const cut = String(key).indexOf('/');
    if (cut <= 0) continue;
    const id = key.slice(0, cut), rel = safeRel(key.slice(cut + 1));
    if (!rel || !known.has(id) || RESERVED.has(id)) { out.skipped += 1; continue; }
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push({ rel, bytes: value.bytes });
  }
  const budget = o.budget == null ? SEED_BUDGET : o.budget;
  for (const mod of on) {
    const files = byId.get(mod.id) || [];
    if (!files.length) continue;
    const size = files.reduce((n, f) => n + f.bytes.length, 0);
    if (out.bytes + size > budget) {
      log && log(`  ${mod.name}: skipped, ${(size / 1048576).toFixed(1)} MB over the ${(budget / 1048576) | 0} MB budget`);
      out.skipped += files.length;
      continue;
    }
    let n = 0;
    for (const f of files) for (const root of GUEST_ROOTS) if (seed(`${root}${mod.id}/${f.rel}`, f.bytes)) n += 1;
    out.mods += 1; out.files += n; out.bytes += size;
    log && log(`  ${mod.name} (${mod.id}): ${n} file(s), ${(size / 1048576).toFixed(2)} MB`);
    // round 95: a seed the engine's file table refused is a file the mod will miss
    // (the table overflowed at 16,384 entries before, dropping a big mod's last folders)
    if (n < files.length * GUEST_ROOTS.length) {
      log && log(`  ${mod.name}: ${files.length * GUEST_ROOTS.length - n} of ${files.length * GUEST_ROOTS.length} file(s) did not fit in the game's file table`);
    }
  }
  // whatever the game wrote under mods/ last time, for a mod that is installed
  // and on. A disable.it is never seeded back: the flag it stands for lives in
  // the index, and a mod that is off is absent rather than marked.
  for (const { key, value } of await listModState(db)) {
    const k = String(key), root = underMods(k);
    if (!root || isImportMark(k) || disableTarget(k)) continue;
    const rel = k.slice(root.length);
    if (!known.has(rel.split('/')[0])) continue;
    for (const r of GUEST_ROOTS) if (seed(r + rel, value.bytes)) out.state += 1;
  }
  return out;
}

// ---- the menu, drawn like the game's own -------------------------------------

const mib = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
// Round 108: a packed mod's download in words -- `short` for a row's note (a per cent,
// or INSTALLED once whole), `note` for the remove list, `long` for its description
export function packedWords(have, total, state) {
  const mb = (n) => Math.round(n / 1048576);
  if (have >= total) return { short: 'INSTALLED', note: `${mb(total)} MB`, long: `ALL ${mb(total)} MB DOWNLOADED`, pct: 100 };
  const pct = Math.min(99, Math.floor(100 * have / total));
  // the description's line is narrow: a few words for why it is not moving
  const why = state === 'noroom' ? ', NO ROOM FOR MORE' : state === 'paused' ? ', PAUSED' : '';
  return { short: `${pct}%`, note: `${mb(have)} OF ${mb(total)} MB`, long: `${mb(have)} OF ${mb(total)} MB DOWNLOADED${why}`, pct };
}

// opts: { paper, log, catalogueBase, onInstalled() }
// `paper` is createPaperMenu(...) from menu_overlay.mjs: the game's own paper,
// font, cursor and sounds. The two file inputs are the only DOM here, because a
// file picker cannot be opened from a canvas.
export function createModsMenu(opts) {
  const o = opts || {};
  const log = o.log || (() => {});
  const paper = o.paper;
  // the browser (mod_browser.mjs) when the build carries its art; the paper otherwise
  const browser = o.browser || null;
  // round 108: the page's one pack store and background download (play.mjs), shared
  // with the game; a menu on its own makes a store of its own
  const packs = o.packs || null;
  const packStore = () => o.store || createPackStore({ log });
  let db = null, mods = [], catalogue = null, message = null, dirty = false, busy = false;
  let catalogueLoading = false, catalogueError = null, phase = null;
  const fresh = new Set();                     // installed during this visit: they load on close
  const redraw = () => { paper.redraw(); if (browser && browser.isOpen()) browser.redraw(); };
  let progress = null, busyId = null;        // per cent of the mod being downloaded, and which
  let step = null;                             // round 95: { at, of, name } while a chain installs
  let view = 'installed';                      // or 'browse'
  let search = '';

  const hiddenInput = (id, setup) => {
    const el = document.createElement('input');
    el.type = 'file'; el.id = id; el.hidden = true;
    setup(el);
    document.body.appendChild(el);
    return el;
  };
  const fileInput = hiddenInput('mods-file', (el) => { el.accept = '.zip,application/zip'; });
  const dirInput = hiddenInput('mods-folder', (el) => {
    el.setAttribute('webkitdirectory', ''); el.setAttribute('directory', ''); el.multiple = true;
  });

  // round 108: how much of an installed packed mod is kept (createPackDownloader), in
  // words for its row: `short` for a list's note, `long` for its description
  const keptWords = (id) => {
    const p = packs && packs.progress(id);
    if (!p || !(p.total > 0)) return null;
    return packedWords(p.have, p.total, packs.stats().state);
  };
  // the menus show it as it moves, a few times a second at most
  let redrawSoon = null;
  if (packs) packs.onChange(() => {
    if (redrawSoon || !(paper.isOpen() || (browser && browser.isOpen()))) return;
    redrawSoon = setTimeout(() => { redrawSoon = null; redraw(); }, 250);
  });

  const say = (text, changed) => {
    message = text ? String(text).toUpperCase().slice(0, 64) : null;
    if (changed) dirty = true;
    log(`[mods] ${text}`);
    redraw();
  };

  async function refresh() {
    try { db = db || await openModDb(); mods = db ? await listMods(db) : []; }
    catch (e) { mods = []; say(`the mod store is unavailable: ${e.message}`); }
  }

  async function install(entries, fallback) {
    const { mod, files, dropped, madeMetadata } = planMod(entries, fallback);
    if (mod.bytes > SEED_BUDGET) {
      throw new Error(`${mod.name} is ${mib(mod.bytes)}; the game is given ${mib(SEED_BUDGET)} for mods`);
    }
    db = db || await openModDb();
    if (!db) throw new Error('this browser keeps no database, so a mod could not be kept');
    const already = await getMod(db, mod.id);
    if (already) throw new Error(`${already.name} is already installed`);
    await putMod(db, mod, files);
    const notes = [];
    if (madeMetadata) notes.push('metadata written');
    if (dropped.length) notes.push(`${dropped.length} path(s) dropped`);
    await refresh();
    // round 107: a packed mod is never seeded, so it takes nothing of the budget
    if (mods.filter((x) => !isPacked(x)).reduce((n, x) => n + x.bytes, 0) > SEED_BUDGET) notes.push(`over the ${mib(SEED_BUDGET)} budget`);
    // Round 82: installing a mod is choosing to have mods on. A page that ran
    // before round 81 wrote EnableMods=0 and kept it, so the mod was seeded, the
    // engine listed it, and nothing happened -- the quietest failure there is.
    if (o.onInstalled) { try { await o.onInstalled(); } catch (e) { log(`[mods] the options: ${e.message}`); } }
    say(`${mod.name}: ${files.length} file(s)${notes.length ? ', ' + notes.join(', ') : ''}`, true);
  }

  async function take(input) {
    if (busy) return;
    busy = true;
    try {
      say('reading...');
      const { entries, fallback } = await importFrom(input.files);
      await install(entries, fallback);
    } catch (e) { say(`import failed: ${e.message}`); }
    input.value = '';
    busy = false;
  }

  // A folder or an archive dropped on the window, which is the one way in that
  // takes either -- the two pickers cannot.
  async function drop(dt) {
    if (busy) return;
    busy = true;
    try {
      say('reading...');
      let entries = await entriesFromDrop(dt);
      if (!entries) { const r = await importFrom(dt.files); entries = r.entries; await install(entries, r.fallback); return; }
      if (!entries.length) throw new Error('nothing in what was dropped');
      if (entries.length === 1 && !entries[0].name.includes('/')) {
        const one = entries[0];
        const r = await archiveEntries(one.bytes, one.name);
        await install(r.entries, r.fallback);
        return;
      }
      const top = entries[0].name.split('/')[0];
      await install(entries, entries.every((e) => e.name.startsWith(`${top}/`)) ? top : null);
    } catch (e) { say(`import failed: ${e.message}`); }
    busy = false;
  }

  async function toggle(mod) {
    if (busy) return;
    busy = true;
    try {
      await setModEnabled(db, mod.id, !mod.enabled);
      await refresh();
      say(`${mod.name} ${mod.enabled ? 'off' : 'on'}`, true);
    } catch (e) { say(`could not change ${mod.name}: ${e.message}`); }
    busy = false;
  }

  // Round 107: a packed mod installed from the catalogue -- its index and eager
  // lane into the Cache API, a row in the mods store with no files.
  async function installPacked(entry, onProgress) {
    db = db || await openModDb();
    if (!db) throw new Error('this browser keeps no database, so a mod could not be kept');
    if (smallDevice()) throw new Error(`${entry.name} needs more memory than a phone's browser gives the game`);
    const already = await getMod(db, entry.id);
    if (already) throw new Error(`${already.name} is already installed`);
    const store = packStore();
    const base = packBase(o.catalogueBase, entry);
    const p = entry.packed;
    const want = (p.indexBytes || 0) + (p.eagerBytes || 0);
    let got = 0;
    const gz = await store.get(base, p.index, p.indexBytes == null ? null : p.indexBytes);
    got += gz.length; if (onProgress) onProgress(got, want);
    const index = parseIndex(new TextDecoder().decode(await gunzipBytes(gz)));
    let eager = 0;
    for (const [name, size, lane] of index.packs) {
      if (lane !== 'eager') continue;
      await store.get(base, name, size);
      got += size; eager += size;
      if (onProgress) onProgress(got, want);
    }
    // the rest is fetched as it is played, so the browser is asked not to clear it under pressure
    try { if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch { /* best effort */ }
    const mod = { id: entry.id, name: entry.name || index.name || entry.id, files: index.files, bytes: index.bytes,
                  version: entry.version || index.version || '', added: Date.now(), enabled: true,
                  packed: { base, index: p.index, indexBytes: gz.length, eagerBytes: eager,
                            storedBytes: index.packs.reduce((n, x) => n + x[1], 0) } };
    await putMod(db, mod, []);
    await refresh();
    if (o.onInstalled) { try { await o.onInstalled(); } catch (e) { log(`[mods] the options: ${e.message}`); } }
    say(`${mod.name}: ${mod.files} file(s), ${mib(got)} now, the rest as it is played`, true);
    // round 108: and the rest from now on, in the background, while the player is still here
    if (packs) packs.start().catch((e) => log(`[mods] the background download: ${e.message}`));
  }

  async function remove(mod) {
    if (busy) return;
    busy = true;
    try {
      // round 107: a packed mod takes its packs with it, except any another installed one names
      let freed = 0;
      if (isPacked(mod)) {
        if (packs) packs.forget(mod.id);
        const store = packStore();
        freed = await store.drop(await packsOnlyOf(store, mod, mods));
      }
      await deleteMod(db, mod.id); await refresh();
      say(`${mod.name} removed${freed ? `, ${freed} pack(s) freed` : ''}`, true);
    }
    catch (e) { say(`could not remove ${mod.name}: ${e.message}`); }
    busy = false;
  }

  async function loadCatalogue() {
    if (catalogue || catalogueLoading) return;
    catalogueLoading = true; catalogueError = null;
    redraw();
    try {
      catalogue = await fetchCatalogue(o.catalogueBase);
      log(`[mods] ${catalogue.mods.length} mod(s) to choose from`);
    } catch (e) { catalogueError = `the catalogue: ${e.message}`; log(`[mods] ${catalogueError}`); }
    catalogueLoading = false;
    redraw();
  }

  async function openBrowse() {
    view = 'browse'; search = ''; message = null;
    paper.redraw();
    if (catalogue) return;
    say('fetching the catalogue...');
    await loadCatalogue();
    message = catalogueError ? String(catalogueError).toUpperCase() : null;
    paper.redraw();
  }

  // an older modpack.py kept the first 400 characters of a description: one that
  // long, and not known to be whole, was cut
  const describe = (raw, whole) => { const t = cleanModText(raw); return !whole && String(raw || '').length >= 398 && t ? `${t.replace(/[\s.,;:-]+$/, '')}...` : t; };
  // What the browser lists: the catalogue, cleaned of its BBCode, plus the mods
  // added from this device that the catalogue does not have (so they can go).
  function browserItems() {
    const have = new Map(mods.map((m) => [m.id, m]));
    const byId = new Map(((catalogue && catalogue.mods) || []).map((m) => [m.id, m]));
    const list = ((catalogue && catalogue.mods) || []).map((m) => ({
      id: m.id, name: cleanModName(m.name), desc: describe(m.description, m.whole), version: m.version || '',
      bytes: m.bytes || 0, files: m.files || 0, installed: have.has(m.id), big: !isPacked(m) && (m.bytes || 0) > SEED_BUDGET,
      // a packed mod on a phone: not offered (smallDevice above)
      needsComputer: isPacked(m) && smallDevice(),
      // round 107: a packed mod downloads its eager lane now and the rest as it is played;
      // round 108: installed, how much of it is kept by now
      sizeNote: isPacked(m) ? ((have.has(m.id) && keptWords(m.id)) || {}).long
        || `${mib((m.packed.eagerBytes || 0) + (m.packed.indexBytes || 0))} NOW, UP TO ${mib(m.bytes || 0)}` : null,
      rowNote: isPacked(m) && have.has(m.id) ? ((keptWords(m.id) || {}).short || null) : null,
      // round 95: what installing it brings along, by name
      requires: (Array.isArray(m.requires) ? m.requires : []).map((r) => (byId.has(r) ? cleanModName(byId.get(r).name) : r)),
    }));
    const listed = new Set(list.map((m) => m.id));
    for (const m of mods) {
      if (listed.has(m.id)) continue;
      list.push({ id: m.id, name: cleanModName(m.name), desc: 'Added from this device.', version: m.version || '',
        bytes: m.bytes || 0, files: m.files || 0, installed: true, big: false, requires: [] });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  async function openBrowser() {
    await refresh();
    if (!browser || !(await browser.supported())) return false;
    message = null;
    await browser.open({
      items: browserItems,
      status: () => ({ loading: catalogueLoading, error: catalogueError, busyId, progress, phase, message, fresh, step }),
      install: (id) => { const entry = catalogue && catalogue.mods.find((m) => m.id === id); return entry ? add(entry) : null; },
      remove: async (id) => { const mod = mods.find((m) => m.id === id); if (mod) await remove(mod); },
      addFromDevice: () => fileInput.click(),
      onClose: () => reloadIfNew(),
    });
    loadCatalogue();
    return true;
  }

  // Round 95: a mod that needs others brings them: its required mods are downloaded
  // and installed first (requiredChain), each once, under the one row the player
  // chose, which counts them off (1 OF 2 ...).
  async function add(entry) {
    if (busy) return;
    busy = true;
    try {
      db = db || await openModDb();
      if (db && await getMod(db, entry.id)) throw new Error('already installed');
      await refresh();
      const { order, missing } = requiredChain((catalogue && catalogue.mods) || [entry], entry.id, new Set(mods.map((m) => m.id)));
      if (missing.length) throw new Error(`it needs ${missing.join(', ')}, which the browser does not have`);
      // a phone is refused before anything is fetched: the paper list's row still takes Enter, and
      // without this the mods it needs were installed first and then the mod itself refused
      const heavy = smallDevice() && order.find((e) => isPacked(e));
      if (heavy) throw new Error(`${heavy.id === entry.id ? 'it' : cleanModName(heavy.name)} needs more memory than a phone's browser gives the game`);
      // the row carries the percentage while it downloads, the line says what for
      busyId = entry.id;
      for (let i = 0; i < order.length; i++) {
        const e = order[i];
        step = order.length > 1 ? { at: i + 1, of: order.length, name: cleanModName(e.name) } : null;
        progress = 0;
        phase = 'download';
        message = browser && browser.isOpen() ? null : (step ? `DOWNLOADING ${step.at} OF ${step.of}...` : 'DOWNLOADING...');
        redraw();
        const onProgress = (n, total) => {
          const pct = total ? Math.min(100, Math.round(100 * n / total)) : 0;
          if (pct === progress) return;                    // a redraw a frame is plenty
          progress = pct;
          redraw();
        };
        // round 107: a packed mod is its index and eager lane now, the rest as it is played
        if (isPacked(e)) { await installPacked(e, onProgress); fresh.add(e.id); continue; }
        const zip = await fetchMod(o.catalogueBase, e, onProgress);
        progress = null;
        phase = 'unpack';
        message = browser && browser.isOpen() ? null : 'UNPACKING...';
        redraw();
        await install(await unzip(zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength)), e.name);
        fresh.add(e.id);
      }
      if (order.length > 1) say(`${cleanModName(entry.name)} and ${order.length - 1} mod(s) it needs`, true);
      if (browser && browser.isOpen()) message = null;
    } catch (e) { say(`${entry.name}: ${e.message}`); }
    busyId = null; progress = null; phase = null; step = null;
    busy = false;
    redraw();
  }

  // ---- what the paper shows
  function model() {
    if (view === 'browse') {
      const have = new Set(mods.map((m) => m.id));
      const q = search.trim().toLowerCase();
      const list = ((catalogue && catalogue.mods) || []).filter((m) =>
        !q || m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
      const rows = list.map((m) => ({
        label: m.name.replace(/^[!\s]+/, ''),
        note: busyId === m.id && progress != null ? `${progress}%`
          : have.has(m.id) ? ((isPacked(m) && keptWords(m.id)) || {}).short || 'INSTALLED' : (!isPacked(m) && m.bytes > SEED_BUDGET ? 'TOO BIG'
            : isPacked(m) && smallDevice() ? NEEDS_COMPUTER
              : mib(isPacked(m) ? (m.packed.eagerBytes || 0) + (m.packed.indexBytes || 0) : m.bytes)),
        dim: have.has(m.id) || (!isPacked(m) && m.bytes > SEED_BUDGET) || (isPacked(m) && smallDevice()),
        // what the mod does, under the list, as the game's own mods screen shows it
        detail: [m.version ? `V${m.version}` : '', have.has(m.id) && isPacked(m) ? ((keptWords(m.id) || {}).long || '') : '',
          m.description || 'NO DESCRIPTION'].filter(Boolean).join(' - '),
        action: () => (have.has(m.id) ? say(`${m.name} is already installed`) : add(m)),
      }));
      rows.push({ label: 'FROM THIS DEVICE', detail: 'A .ZIP OR A FOLDER OF A MOD YOU ALREADY HAVE', action: () => fileInput.click() });
      if (mods.length) rows.push({ label: 'REMOVE A MOD', detail: `${mods.length} INSTALLED`, action: () => { view = 'remove'; message = null; paper.redraw(); } });
      rows.push({ label: 'BACK', action: () => paper.close('back') });
      return { title: 'MOD BROWSER', rows, search, searchHint: 'SEARCH', message,
        footer: catalogue ? `${list.length} OF ${catalogue.mods.length} MODS` : null };
    }
    // Round 84: what is installed belongs on the game's own mods screen, which
    // lists it, greys it and toggles it already. This menu is what that screen
    // cannot do: bring a mod in, and take one out again.
    if (view === 'remove') {
      const rows = mods.map((m) => ({
        label: m.name,
        note: (isPacked(m) && (keptWords(m.id) || {}).note) || mib(m.bytes),
        action: () => remove(m),
        remove: () => remove(m),
      }));
      rows.push({ label: 'BACK', action: () => { view = 'installed'; message = null; paper.redraw(); } });
      return { title: 'REMOVE MOD', rows, message: message || (mods.length ? null : 'NO MODS') };
    }
    const rows = [];
    rows.push({ label: 'IMPORT MOD', action: () => fileInput.click() });
    if (o.catalogueBase) rows.push({ label: 'MOD BROWSER', action: () => openBrowse() });
    if (mods.length) rows.push({ label: 'REMOVE MOD', action: () => { view = 'remove'; message = null; paper.redraw(); } });
    rows.push({ label: 'BACK', action: () => paper.close('back') });
    return { title: 'MODS', rows, message: message || 'OR DROP A FOLDER OR .ZIP HERE' };
  }

  fileInput.addEventListener('change', () => take(fileInput));
  dirInput.addEventListener('change', () => take(dirInput));
  // the window takes a drop while the menu is up, and only then: the game has the
  // page to itself otherwise
  const overDrop = (ev) => { if (paper.isOpen()) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; } };
  window.addEventListener('dragover', overDrop);
  window.addEventListener('drop', (ev) => {
    if (!paper.isOpen()) return;
    ev.preventDefault();
    drop(ev.dataTransfer);
  });

  // The engine scans mods/ once, before main. So a mod that arrived during this
  // visit is in the page's store and not in the game's list, and the only way
  // into that list is another boot: closing the menu after an import reloads.
  // R still does it early, for anyone who wants it before closing.
  const reloadIfNew = () => { if (dirty) location.reload(); };

  // 'browse' opens straight onto the catalogue (the MODS screen's BROWSE MODS
  // paper); with no catalogue configured it is the import menu.
  const open = async (start) => {
    view = 'installed'; search = ''; message = null;
    if (start === 'browse' && o.catalogueBase && await openBrowser()) return;
    await refresh();
    if (start === 'browse' && o.catalogueBase) openBrowse();
    await paper.open(model, {
      onClose: reloadIfNew,
      onKey: (code, key) => {
        if (code === 'KeyR' && dirty) { location.reload(); return true; }
        if (view === 'browse') {
          if (code === 'Backspace') { search = search.slice(0, -1); paper.redraw(); return true; }
          if (key && key.length === 1 && /[ -~]/.test(key)) { search += key; paper.redraw(); return true; }
        }
        // X and not Delete: the page is handed the keys the input shim forwards,
        // and Delete is not one of them, so a row bound to it never went
        if (code === 'KeyX' && view === 'remove') {
          const row = paper.currentRow();
          if (row && row.remove) { row.remove(); return true; }
        }
        return false;
      },
    });
  };
  return {
    open,
    close: () => { if (browser && browser.isOpen()) browser.close(); else paper.close('back'); },
    isOpen: () => paper.isOpen() || !!(browser && browser.isOpen()),
    refresh,
    // touch: where a tap lands on the paper, and acting on a row
    hit: (gx, gy) => paper.hit(gx, gy), tapRow: (i) => paper.tapRow(i),
    // the browser takes taps and clicks in client pixels (it may cover the whole screen)
    inBrowser: () => !!(browser && browser.isOpen()),
    tapClient: (cx, cy) => (browser && browser.isOpen() ? browser.tapClient(cx, cy) : false),
    wheel: (dy, cx, cy) => { if (browser && browser.isOpen()) browser.wheel(dy, cx, cy); },
    // a swipe that starts on the chosen mod's description scrolls it; true when it did
    swipeClient: (cx, cy, key) => (browser && browser.isOpen() && browser.swipeClient ? browser.swipeClient(cx, cy, key) : false),
    browsing: () => (browser && browser.isOpen()) || view === 'browse',
    onKey: (ev, down) => (browser && browser.isOpen() ? browser.onKey(ev, down) : paper.onKey(ev, down)),
    element: () => (browser && browser.isOpen() ? browser.element() : paper.element()),
    // What a driver can see: the same model the paper draws, flattened. Rows are
    // labels rather than the rows themselves, so nothing outside can call an
    // action -- a driver has to press the key a player would.
    state: () => {
      if (browser && browser.isOpen()) {
        const b = browser.state();
        return { view: 'browser', dirty, message, search: b.query, title: 'MOD BROWSER', rows: b.shown, current: b.current,
                 browser: b, mods: mods.map((x) => ({ id: x.id, name: x.name, enabled: x.enabled })) };
      }
      const m = model();
      return { view, dirty, message, search, title: m.title, rows: m.rows.map((r) => r.label),
               current: (paper.currentRow() || {}).label || null,
               mods: mods.map((x) => ({ id: x.id, name: x.name, enabled: x.enabled })) };
    },
  };
}
