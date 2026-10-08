// mod_browser.mjs -- the mod browser, on the paper the game's own MODS screen
// is drawn on.
//
// modsmenu.png cut the way modsmenu.anm2 cuts it (a top with the MODS title,
// 32 px middle pieces, a bottom), so a page can be any height. Two pages: the
// list with its search line, and the chosen mod -- its name, version, size,
// its whole description and what Enter (or a tap) does with it. Side by side
// over the game in a landscape window; one above the other, filling the screen,
// on a phone held upright, where the game's picture is too small to read.
//
// Everything is the game's: the paper, the Team Meat fonts (16 bold for names,
// 10 for the rest), the cursor, the menu sounds. Names and descriptions come
// from Steam workshop metadata, so the BBCode and HTML entities are taken out
// (cleanModText), and search ranks name matches over description matches
// (searchMods). Both are pure, for the tests.

import { parseBmfont } from './menu_overlay.mjs';

// ---- text -------------------------------------------------------------------------------------
const ENTITY = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", nbsp: ' ' };

export function cleanModText(s) {
  let t = String(s == null ? '' : s);
  t = t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ' ';
    }
    return ENTITY[e.toLowerCase()] ?? m;
  });
  return t
    .replace(/\[img\][\s\S]*?\[\/img\]/gi, ' ')
    .replace(/\[previewyoutube[^\]]*\][\s\S]*?\[\/previewyoutube\]/gi, ' ')
    .replace(/\[url=[^\]]*\]([\s\S]*?)\[\/url\]/gi, '$1')
    .replace(/\[url\][\s\S]*?\[\/url\]/gi, ' ')
    .replace(/\[\*\]/g, ' - ')
    .replace(/\[\/?[a-z0-9]+(?:=[^\]]*)?\]/gi, ' ')
    .replace(/\[[^\]]*$/, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

// Workshop names carry sort prefixes ("!!! ", "'", "!!~"): the list sorts by the
// cleaned name instead.
export function cleanModName(s) {
  const t = cleanModText(s).replace(/^[\s!~'"*_.#,-]+/, '').trim();
  return t || cleanModText(s) || '?';
}

// Every word of the query must be somewhere in the name or the description; a
// name that starts with a word beats one that has a word starting with it,
// beats one that merely contains it, beats a description that does.
export function searchMods(items, query) {
  const words = cleanModText(query).toLowerCase().split(' ').filter(Boolean);
  if (!words.length) return items.slice();
  const out = [];
  for (const item of items) {
    const name = String(item.name || '').toLowerCase(), desc = String(item.desc || '').toLowerCase();
    const parts = name.split(/[^a-z0-9]+/).filter(Boolean);
    let score = 0;
    for (const w of words) {
      if (name.startsWith(w)) score += 8;
      else if (parts.some((p) => p.startsWith(w))) score += 4;
      else if (name.includes(w)) score += 2;
      else if (desc.includes(w)) score += 1;
      else { score = -1; break; }
    }
    if (score >= 0) out.push({ item, score });
  }
  out.sort((a, b) => b.score - a.score || String(a.item.name).localeCompare(String(b.item.name)));
  return out.map((x) => x.item);
}

// Words into lines no wider than `width` (measured by `measure`); a word wider
// than a line is cut; when the words do not fit in `max` lines the last one
// ends in "...".
export function wrapText(text, width, measure, max = Infinity) {
  const words = String(text).split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  const push = (l) => { lines.push(l); };
  for (let word of words) {
    while (measure(word) > width && word.length > 1) {
      let cut = word.length - 1;
      while (cut > 1 && measure(word.slice(0, cut)) > width) cut--;
      if (line) { push(line); line = ''; }
      push(word.slice(0, cut));
      word = word.slice(cut);
    }
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= width) { line = next; continue; }
    push(line);
    line = word;
  }
  if (line) push(line);
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = kept[max - 1];
  while (last.length && measure(`${last}...`) > width) {
    const space = last.lastIndexOf(' ');
    last = (space > 0 ? last.slice(0, space) : last.slice(0, -1)).trimEnd();
  }
  kept[max - 1] = `${last}...`;
  return kept;
}

const mib = (n) => (n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// ---- the browser ------------------------------------------------------------------------------
const DEFAULT_ART = {
  sheet: 'modsmenu.png', top: [0, 0, 256, 48], bottom: [0, 208, 256, 48], cursor: [272, 0, 16, 16],
  pieces: [[0, 48, 256, 32], [0, 80, 256, 32], [0, 112, 256, 32], [0, 144, 256, 32], [0, 176, 256, 32]],
  title: [22, 5, 214, 31],
};
const INK = [54, 47, 45], LIGHT = [140, 120, 120], HILITE = [212, 196, 202];

export function createModBrowser(opts) {
  const { stage, assetsUrl, readAsset } = opts;
  const log = opts.log || (() => {});
  const touch = opts.touch || (() => false);
  const A = { ready: false, loading: null, menu: null, art: null, sheet: null, fonts: {}, sounds: new Map() };
  const st = { open: false, ctl: null, query: '', cursor: 0, top: 0, confirm: null, caret: true, layout: null, regions: [] };

  const canvas = document.createElement('canvas');
  canvas.id = 'mod-browser';
  canvas.hidden = true;
  const g = canvas.getContext('2d');

  // ---- assets
  const fetchAsset = async (name, kind) => {
    let bytes = null;
    if (readAsset) {
      bytes = await readAsset(name);
      if (!bytes) throw new Error(`${name}: not in the payload`);
    } else {
      const r = await fetch(`${assetsUrl}/${name}`);
      if (!r.ok) throw new Error(`${name}: ${r.status}`);
      bytes = new Uint8Array(await r.arrayBuffer());
    }
    if (kind === 'json') return JSON.parse(new TextDecoder().decode(bytes));
    if (kind === 'buffer') return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(`${name}: not an image`)); img.src = URL.createObjectURL(new Blob([bytes])); });
    return img;
  };
  const tint = (img, ink) => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const t = c.getContext('2d');
    t.drawImage(img, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
    t.fillRect(0, 0, c.width, c.height);
    return c;
  };
  const loadFont = async (spec) => {
    const [img, buf] = await Promise.all([fetchAsset(spec.png, 'image'), fetchAsset(spec.fnt, 'buffer')]);
    return { font: parseBmfont(buf), ink: tint(img, INK), light: tint(img, LIGHT) };
  };
  const load = () => {
    if (A.loading) return A.loading;
    A.loading = (async () => {
      A.menu = await fetchAsset('menu.json', 'json');
      const b = A.menu.browser;
      if (!b) throw new Error('this build has no mod browser art');
      A.art = { ...DEFAULT_ART, ...b };
      A.sheet = await fetchAsset(A.art.sheet, 'image');
      [A.fonts.title, A.fonts.body, A.fonts.small] = await Promise.all([
        loadFont(A.menu.font), loadFont(b.fonts.body || A.menu.font), loadFont(b.fonts.small)]);
      A.ready = true;
      const ctx = opts.audioContext && opts.audioContext();
      if (ctx) {
        for (const role of ['open', 'move', 'select', 'back', 'delete']) {
          const file = A.menu.sounds && A.menu.sounds[role];
          if (!file) continue;
          try { A.sounds.set(role, await ctx.decodeAudioData(await fetchAsset(file, 'buffer'))); } catch (e) { log(`[mods] sound ${file}: ${e.message}`); }
        }
      }
    })().catch((e) => { A.loading = null; throw e; });
    return A.loading;
  };
  const play = (role) => {
    try {
      const ctx = opts.audioContext && opts.audioContext(), buf = A.sounds.get(role);
      if (!ctx || !buf) return;
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
    } catch { /* sound is decoration */ }
  };

  // ---- text in a font, at the canvas's pixel scale
  let K = 2;
  const glyph = (f, cp) => f.font.chars.get(cp) || f.font.chars.get(String.fromCodePoint(cp).toUpperCase().codePointAt(0)) || null;
  const measure = (f, text) => {
    let w = 0, prev = null;
    for (const ch of String(text)) {
      const cp = ch.codePointAt(0), c = glyph(f, cp);
      if (!c) { w += 4; prev = null; continue; }
      if (prev !== null) w += f.font.kern.get(prev * 4294967296 + cp) || 0;
      w += c.xa; prev = cp;
    }
    return w;
  };
  const text = (f, s, x, y, tone = 'ink') => {
    const atlas = f[tone] || f.ink;
    let cx = x, prev = null;
    for (const ch of String(s)) {
      const cp = ch.codePointAt(0), c = glyph(f, cp);
      if (!c) { cx += 4; prev = null; continue; }
      if (prev !== null) cx += f.font.kern.get(prev * 4294967296 + cp) || 0;
      if (c.w && c.h) g.drawImage(atlas, c.x, c.y, c.w, c.h, Math.round((cx + c.xo) * K), Math.round((y + c.yo) * K), c.w * K, c.h * K);
      cx += c.xa; prev = cp;
    }
    return cx - x;
  };
  const clip = (f, s, width) => {
    if (measure(f, s) <= width) return s;
    let t = String(s);
    while (t.length > 1 && measure(f, `${t}...`) > width) t = t.slice(0, -1);
    return `${t.trimEnd()}...`;
  };
  const rect = (x, y, w, h, rgb, a = 1) => { g.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`; g.fillRect(Math.round(x * K), Math.round(y * K), Math.round(w * K), Math.round(h * K)); };
  const frame = (x, y, w, h, rgb) => { rect(x, y, w, 1, rgb); rect(x, y + h - 1, w, 1, rgb); rect(x, y, 1, h, rgb); rect(x + w - 1, y, 1, h, rgb); };
  const blit = (r, x, y) => g.drawImage(A.sheet, r[0], r[1], r[2], r[3], Math.round(x * K), Math.round(y * K), r[2] * K, r[3] * K);

  // A page: the top, `n` middle pieces (the five cycled), the bottom. Untitled
  // pages have the MODS lettering covered with the paper's own colour.
  const page = (x, y, n, titled) => {
    const a = A.art;
    blit(a.top, x, y);
    for (let i = 0; i < n; i++) blit(a.pieces[i % a.pieces.length], x, y + a.top[3] + i * 32);
    blit(a.bottom, x, y + a.top[3] + n * 32);
    if (!titled) rect(x + a.title[0], y + a.title[1], a.title[2], a.title[3], A.menu.colours ? A.menu.colours.paper : [233, 218, 223]);
    return a.top[3] + n * 32 + a.bottom[3];
  };

  // ---- the layout: landscape over the game picture, portrait over the whole screen
  const portraitWanted = () => touch() && typeof innerWidth === 'number' && innerHeight > innerWidth * 1.15;
  function layout() {
    if (!portraitWanted()) {
      const L = { kind: 'land', W: 480, H: 270, K: 2 };
      L.list = { px: -8, py: 7, n: 5, x0: 22, x1: 226 };
      L.detail = { px: 232, py: 7, n: 5, x0: 262, x1: 462 };
      return L;
    }
    const W = 264, H = Math.max(420, Math.round(W * innerHeight / innerWidth));
    const k = Math.max(2, Math.round((innerWidth / W) * (devicePixelRatio || 1)));
    const listN = 4, listH = 48 + listN * 32 + 48;
    const detailN = Math.max(3, Math.floor((H - listH - 16 - 96) / 32));
    const detailH = 48 + detailN * 32 + 48;
    const top = Math.max(4, Math.round((H - listH - detailH - 6) / 2));
    return { kind: 'port', W, H, K: k,
      list: { px: 4, py: top, n: listN, x0: 30, x1: 238 },
      detail: { px: 4, py: top + listH + 6, n: detailN, x0: 30, x1: 238 } };
  }
  function place(L) {
    if (st.layout && st.layout.kind === L.kind && st.layout.W === L.W && st.layout.H === L.H && st.layout.K === L.K) return;
    st.layout = L; K = L.K;
    canvas.width = L.W * K; canvas.height = L.H * K;
    g.imageSmoothingEnabled = false;
    const base = 'image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none;';
    if (L.kind === 'land') {
      canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:30;${base}`;
      if (canvas.parentNode !== stage) stage.appendChild(canvas);
    } else {
      canvas.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;z-index:60;${base}`;
      if (canvas.parentNode !== document.body) document.body.appendChild(canvas);
    }
  }

  // ---- the state the pages draw
  const items = () => (st.ctl ? st.ctl.items() : []);
  const shown = () => searchMods(items(), st.query);
  const status = () => (st.ctl ? st.ctl.status() : {});
  const visibleRows = () => {
    const L = st.layout, l = L.list, listTop = l.py + 62, listBottom = l.py + 48 + l.n * 32 + 48 - 38;
    return Math.max(3, Math.floor((listBottom - listTop) / 16));
  };

  function draw() {
    if (!st.open || !A.ready) return;
    place(layout());
    const L = st.layout, s = status(), list = shown();
    st.cursor = Math.max(0, Math.min(st.cursor, list.length - 1));
    const span = visibleRows();
    if (st.cursor < st.top) st.top = st.cursor;
    if (st.cursor >= st.top + span) st.top = st.cursor - span + 1;
    st.top = Math.max(0, Math.min(st.top, Math.max(0, list.length - span)));
    st.regions = [];
    g.clearRect(0, 0, canvas.width, canvas.height);
    rect(0, 0, L.W, L.H, [0, 0, 0], L.kind === 'land' ? 0.45 : 0.82);
    const { title: F16, body: F12, small: F10 } = A.fonts;

    // the list page
    const l = L.list, lh = page(l.px, l.py, l.n, true);
    st.regions.push({ kind: 'paper', x: l.px + 12, y: l.py, w: 234, h: lh });
    const sy = l.py + 40;
    const label = 'SEARCH';
    text(F10, label, l.x0, sy, 'light');
    const fx = l.x0 + measure(F10, label) + 6, fw = l.x1 - fx;
    const q = st.query;
    if (q) text(F10, clip(F10, q, fw - 8) + (st.caret ? '_' : ''), fx, sy);
    else text(F10, (touch() ? 'TAP TO TYPE' : 'TYPE TO SEARCH') + (st.caret && !touch() ? '_' : ''), fx, sy, 'light');
    rect(fx - 2, sy + 13, l.x1 - fx + 2, 1, LIGHT);
    st.regions.push({ kind: 'search', x: l.x0, y: sy - 4, w: l.x1 - l.x0, h: 20 });
    const listTop = l.py + 62;
    if (s.loading) text(F10, 'FETCHING THE CATALOGUE...', l.x0 + 8, listTop + 4, 'light');
    else if (s.error && !items().length) wrapText(String(s.error).toUpperCase(), l.x1 - l.x0 - 8, (t) => measure(F10, t), 4).forEach((line, i) => text(F10, line, l.x0 + 8, listTop + 4 + i * 13));
    else if (!list.length) text(F10, q ? 'NO MOD MATCHES THAT' : 'NO MODS', l.x0 + 8, listTop + 4, 'light');
    for (let i = st.top; i < Math.min(list.length, st.top + span); i++) {
      const it = list[i], y = listTop + (i - st.top) * 16;
      if (i === st.cursor) {
        rect(l.x0 + 6, y - 1, l.x1 - l.x0 - 4, 15, HILITE);
        blit(A.art.cursor, l.x0 - 9, y - 1);
      }
      const busy = s.busyId === it.id;
      const note = busy ? (s.progress != null ? `${s.progress}%` : '...') : '';
      const noteW = note ? measure(F10, note) : 0;
      const nameW = l.x1 - (l.x0 + 10) - (noteW ? noteW + 8 : 0) - (it.installed ? 14 : 0);
      text(F10, clip(F10, it.name, nameW), l.x0 + 10, y, it.big && !it.installed ? 'light' : 'ink');
      if (note) text(F10, note, l.x1 - noteW, y);
      if (it.installed) tick(l.x1 - 10, y + 2);
      st.regions.push({ kind: 'row', index: i, x: l.x0, y: y - 2, w: l.x1 - l.x0, h: 16 });
    }
    if (list.length > span) {
      const trackY = listTop, trackH = span * 16 - 2;
      const barH = Math.max(10, Math.round(trackH * span / list.length));
      const barY = trackY + Math.round((trackH - barH) * st.top / Math.max(1, list.length - span));
      rect(l.x1 + 5, trackY, 1, trackH, HILITE);
      rect(l.x1 + 4, barY, 3, barH, LIGHT);
    }
    // the footer: how many, and the two ways out of the list
    const fy = l.py + lh - 34;
    const count = items().length ? (q ? `${list.length} OF ${items().length}` : `${items().length} MODS`) : '';
    if (count) text(F10, count, l.x0, fy, 'light');
    const add = '+ ADD A .ZIP', addW = measure(F10, add);
    text(F10, add, l.x1 - addW, fy);
    st.regions.push({ kind: 'add', x: l.x1 - addW - 4, y: fy - 4, w: addW + 8, h: 20 });

    // the chosen mod
    const d = L.detail, dh = page(d.px, d.py, d.n, false);
    st.regions.push({ kind: 'paper', x: d.px + 12, y: d.py, w: 234, h: dh });
    const back = touch() ? 'BACK' : 'ESC  BACK', backW = measure(F10, back), by = d.py + dh - 30;
    text(F10, back, d.x1 - backW, by, 'light');
    st.regions.push({ kind: 'back', x: d.x1 - backW - 6, y: by - 4, w: backW + 12, h: 20 });
    const it = list[st.cursor];
    const width = d.x1 - d.x0;
    let y = d.py + 12;
    if (!it) {
      const msg = s.message || (s.loading ? '' : q ? 'TRY A SHORTER WORD' : '');
      if (msg) wrapText(String(msg).toUpperCase(), width, (t) => measure(F10, t), 6).forEach((line, i) => text(F10, line, d.x0, y + 20 + i * 13));
      return;
    }
    const nameLines = wrapText(it.name, width, (t) => measure(F16, t), 2);
    nameLines.forEach((line, i) => text(F16, line, d.x0, y + i * 22));
    y += nameLines.length * 22 + 4;
    const meta = [it.version ? `VERSION ${it.version}` : '', it.bytes ? mib(it.bytes) : ''].filter(Boolean).join('    ');
    text(F10, clip(F10, meta, width), d.x0, y, 'light');
    y += 16;
    rect(d.x0, y, width, 1, HILITE);
    y += 7;
    const actionY = d.py + dh - 62;
    const descLines = Math.max(1, Math.floor((actionY - 6 - y) / 13));
    const desc = it.desc || 'This mod has no description.';
    wrapText(desc, width, (t) => measure(F10, t), descLines).forEach((line, i) => text(F10, line, d.x0, y + i * 13, it.desc ? 'ink' : 'light'));

    // what Enter or a tap does
    rect(d.x0, actionY - 4, width, 1, HILITE);
    const busy = s.busyId === it.id;
    const key = touch() ? 'TAP' : 'ENTER';
    if (busy) {
      const pct = s.progress != null ? s.progress : 100;
      frame(d.x0, actionY + 2, width, 12, INK);
      rect(d.x0 + 2, actionY + 4, Math.round((width - 4) * pct / 100), 8, LIGHT);
      text(F10, s.phase === 'unpack' ? 'UNPACKING...' : `DOWNLOADING  ${pct}%`, d.x0, actionY + 18);
    } else if (it.installed) {
      const done = s.fresh && s.fresh.has(it.id);
      tick(d.x0, actionY + 7);
      text(F16, 'INSTALLED', d.x0 + 15, actionY);
      const sub = done ? 'LOADS WHEN YOU CLOSE THIS' : st.confirm === it.id ? `${key} AGAIN TO REMOVE IT` : `${key} TO REMOVE`;
      text(F10, sub, d.x0, actionY + 24, st.confirm === it.id ? 'ink' : 'light');
      if (!done) st.regions.push({ kind: 'act', x: d.x0 - 4, y: actionY - 4, w: width + 8, h: 44 });
    } else if (it.big) {
      text(F10, 'TOO BIG FOR THE BROWSER', d.x0, actionY + 4);
      text(F10, 'THE GAME IS GIVEN 96 MB FOR MODS', d.x0, actionY + 18, 'light');
    } else {
      const label2 = 'INSTALL', w2 = measure(F16, label2) + 16;
      frame(d.x0, actionY, w2, 22, INK);
      frame(d.x0 + 1, actionY + 1, w2 - 2, 20, INK);
      text(F16, label2, d.x0 + 8, actionY - 1);
      text(F10, key, d.x0 + w2 + 8, actionY + 5, 'light');
      st.regions.push({ kind: 'act', x: d.x0 - 4, y: actionY - 4, w: width + 8, h: 30 });
    }
    if (s.message) text(F10, clip(F10, String(s.message).toUpperCase(), width - backW - 10), d.x0, by, 'ink');
  }
  // a check mark, pixel by pixel, in the ink
  function tick(x, y) {
    const px = [[0, 4], [1, 5], [2, 6], [3, 5], [4, 4], [5, 3], [6, 2], [7, 1], [8, 0]];
    for (const [dx, dy] of px) rect(x + dx, y + dy, 1.5, 2, INK);
  }

  // ---- doing things
  const current = () => shown()[st.cursor] || null;
  function move(by) {
    const n = shown().length; if (!n) return;
    const next = Math.max(0, Math.min(n - 1, st.cursor + by));
    if (next !== st.cursor) { st.cursor = next; st.confirm = null; play('move'); draw(); }
  }
  function act() {
    const it = current(), s = status();
    if (!it || !st.ctl || s.busyId) return;
    if (it.installed) {
      if (s.fresh && s.fresh.has(it.id)) return;
      if (st.confirm !== it.id) { st.confirm = it.id; play('move'); draw(); return; }
      st.confirm = null; play('delete');
      Promise.resolve(st.ctl.remove(it.id)).then(draw, draw);
      return;
    }
    if (it.big) return;
    play('select');
    Promise.resolve(st.ctl.install(it.id)).then(draw, draw);
  }
  function setQuery(q) { st.query = q.slice(0, 32); st.cursor = 0; st.top = 0; st.confirm = null; draw(); }
  function close(sound = 'back') {
    if (!st.open) return;
    st.open = false; canvas.hidden = true;
    clearInterval(st.blink);
    play(sound);
    const ctl = st.ctl; st.ctl = null;
    if (ctl && ctl.onClose) ctl.onClose();
  }

  const onKey = (ev, down) => {
    if (!st.open) return false;
    if (!down) return true;
    const code = ev.code, key = ev.key;
    if (code === 'ArrowUp') move(-1);
    else if (code === 'ArrowDown') move(1);
    else if (code === 'PageUp') move(-visibleRows());
    else if (code === 'PageDown') move(visibleRows());
    else if (code === 'Home' && !st.query) move(-1e6);
    else if (code === 'End' && !st.query) move(1e6);
    else if (code === 'Enter' || code === 'NumpadEnter') act();
    else if (code === 'Escape') { if (st.query) setQuery(''); else close(); }
    else if (code === 'Backspace') { if (st.query) setQuery(st.query.slice(0, -1)); }
    else if (key && key.length === 1 && /[ -~]/.test(key) && !(ev.ctrlKey || ev.metaKey || ev.altKey)) {
      if (key === ' ' && !st.query) return true;
      setQuery(st.query + key);
    }
    return true;
  };

  // A tap or a click at client (cx, cy): 'keyboard' when it lands on the search
  // line and the page should bring a keyboard up, true when it did something.
  const tapClient = (cx, cy) => {
    if (!st.open || !st.layout) return false;
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const x = (cx - r.left) / r.width * st.layout.W, y = (cy - r.top) / r.height * st.layout.H;
    const hit = st.regions.filter((g2) => g2.kind !== 'paper').find((g2) => x >= g2.x && x < g2.x + g2.w && y >= g2.y && y < g2.y + g2.h);
    if (hit) {
      if (hit.kind === 'row') { if (hit.index !== st.cursor) { st.cursor = hit.index; st.confirm = null; play('move'); draw(); } return true; }
      if (hit.kind === 'act') { act(); return true; }
      if (hit.kind === 'search') return 'keyboard';
      if (hit.kind === 'back') { close(); return true; }
      if (hit.kind === 'add') { if (st.ctl && st.ctl.addFromDevice) st.ctl.addFromDevice(); return true; }
    }
    if (!st.regions.some((g2) => g2.kind === 'paper' && x >= g2.x && x < g2.x + g2.w && y >= g2.y && y < g2.y + g2.h)) { close(); return true; }
    return true;
  };
  const wheel = (dy) => { if (st.open) move(dy > 0 ? 3 : -3); };

  const open = async (ctl) => {
    await load();
    st.ctl = ctl; st.query = ''; st.cursor = 0; st.top = 0; st.confirm = null; st.layout = null;
    st.open = true;
    place(layout());
    canvas.hidden = false;
    play('open');
    clearInterval(st.blink);
    st.blink = setInterval(() => { st.caret = !st.caret; draw(); }, 500);
    draw();
  };
  if (typeof addEventListener === 'function') addEventListener('resize', () => { if (st.open) { st.layout = null; draw(); } });

  return {
    open, close, onKey, tapClient, wheel, redraw: draw, preload: load,
    isOpen: () => st.open,
    supported: async () => { try { await load(); return true; } catch (e) { log(`[mods] the browser art: ${e.message}`); return false; } },
    element: () => canvas,
    // what a driver can see
    state: () => ({ open: st.open, query: st.query, cursor: st.cursor, layout: st.layout && st.layout.kind,
      shown: shown().map((x) => x.name), current: current() ? current().name : null, confirm: st.confirm }),
  };
}
