// menu_overlay.mjs -- the save-select screen's EDIT FILE menu, drawn by the
// page with the game's own art, font and sounds (page-assets/, see
// scripts/recomp/assets/page_assets.py), driven by the game's own keys.
// Round 52.
//
// The engine's Menu_Save::Update is about to show its "ARE YOU SURE?" prompt
// for the file the cursor is on; the lifted block at 0x9d9d59 asks the host
// gate first, which asks window.isaacEditFile(slot): this module opens the
// menu instead. Its entries: EXPORT FILE, IMPORT FILE, DELETE FILE, BACK.
// The FPS readout is a key, not an entry: M flips it (play.mjs), a corner
// text in the same font, remembered by this browser only. Delete hands the flow back to the engine (the
// page sets window.isaacEditFileDelete and presses confirm again, so the
// game's own prompt and deletion run untouched). Export and import are the
// page's saves store; the fps viewer is a corner readout in the same font.
//
// Drawing: one canvas over the game's, 960x540 (the game's 480x270 at 2x,
// pixelated), the prompt paper crop of the save-select sheet where the
// engine draws its own prompt, the Team Meat 16-bold bitmap font (BMFont v3
// binary, the atlas tinted with the strip's ink), the sheet's cursor, and
// the engine's menu sounds through the page's AudioContext.

const GAME_W = 480, GAME_H = 270, SCALE = 2;

function parseBmfont(buf) {
  const b = new Uint8Array(buf), dv = new DataView(buf);
  if (!(b[0] === 66 && b[1] === 77 && b[2] === 70 && b[3] === 3)) throw new Error('not a BMFont v3 binary');
  const font = { chars: new Map(), kern: new Map(), lineHeight: 0, base: 0, pages: [] };
  let i = 4;
  while (i < b.length) {
    const t = b[i], n = dv.getUint32(i + 1, true), at = i + 5;
    if (t === 2) { font.lineHeight = dv.getUint16(at, true); font.base = dv.getUint16(at + 2, true); }
    else if (t === 4) {
      for (let k = 0; k + 20 <= n; k += 20) {
        const p = at + k;
        font.chars.set(dv.getUint32(p, true), { x: dv.getUint16(p + 4, true), y: dv.getUint16(p + 6, true), w: dv.getUint16(p + 8, true), h: dv.getUint16(p + 10, true),
          xo: dv.getInt16(p + 12, true), yo: dv.getInt16(p + 14, true), xa: dv.getInt16(p + 16, true) });
      }
    } else if (t === 5) {
      for (let k = 0; k + 10 <= n; k += 10) { const p = at + k; font.kern.set(dv.getUint32(p, true) * 4294967296 + dv.getUint32(p + 4, true), dv.getInt16(p + 8, true)); }
    }
    i = at + n;
  }
  return font;
}

function tintAtlas(img, ink) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export function createEditFileMenu(opts) {
  // opts: { stage, canvas, assetsUrl, audioContext(), actions: { export(slot), import(slot), delete(slot) }, injectKey(name, down), log }
  const { stage, canvas, assetsUrl, actions, injectKey } = opts;
  const log = opts.log || (() => {});
  const state = { open: false, slot: 0, cursor: 0, ready: false, loading: null, message: null, fps: null, fpsOn: false, closing: false };
  const A = { menu: null, sheet: null, paper: null, cursor: null, font: null, atlas: null, sounds: new Map() };
  try { state.fpsOn = localStorage.getItem('isaac-fps-viewer') === '1'; } catch (e) { /* no storage */ }

  const overlay = document.createElement('canvas');
  overlay.id = 'menu-overlay';
  overlay.width = GAME_W * SCALE; overlay.height = GAME_H * SCALE;
  overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges;';
  overlay.hidden = true;
  stage.appendChild(overlay);
  const g = overlay.getContext('2d');
  g.imageSmoothingEnabled = false;

  const fpsEl = document.createElement('canvas');
  fpsEl.id = 'fps-viewer';
  fpsEl.width = 120 * SCALE; fpsEl.height = 28 * SCALE;
  fpsEl.style.cssText = 'position:absolute;left:1%;top:1.5%;width:12.5%;height:auto;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges;';
  fpsEl.hidden = true;
  stage.appendChild(fpsEl);

  const fetchAsset = async (name, kind) => {
    const r = await fetch(`${assetsUrl}/${name}`);
    if (!r.ok) throw new Error(`${name}: ${r.status}`);
    if (kind === 'json') return r.json();
    if (kind === 'buffer') return r.arrayBuffer();
    const blob = await r.blob();
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(`${name}: not an image`)); img.src = URL.createObjectURL(blob); });
    return img;
  };
  const load = () => {
    if (state.loading) return state.loading;
    state.loading = (async () => {
      A.menu = await fetchAsset('menu.json', 'json');
      [A.sheet, A.paper, A.cursor, A.atlasImg] = await Promise.all([
        fetchAsset(A.menu.sheet, 'image'), fetchAsset(A.menu.paper, 'image'), fetchAsset(A.menu.cursor, 'image'), fetchAsset(A.menu.font.png, 'image')]);
      A.font = parseBmfont(await fetchAsset(A.menu.font.fnt, 'buffer'));
      A.atlas = tintAtlas(A.atlasImg, A.menu.colours.ink);
      A.atlasLight = tintAtlas(A.atlasImg, [140, 120, 120]);
      state.ready = true;
      // the sounds decode lazily on the first open (the AudioContext exists once the engine runs)
      const ctx = opts.audioContext && opts.audioContext();
      if (ctx) {
        for (const [role, file] of Object.entries(A.menu.sounds)) {
          try { A.sounds.set(role, await ctx.decodeAudioData(await fetchAsset(file, 'buffer'))); } catch (e) { log(`[menu] sound ${file}: ${e.message}`); }
        }
      }
    })().catch((e) => { log(`[menu] assets: ${e.message}`); state.loading = null; throw e; });
    return state.loading;
  };
  const play = (role) => {
    try {
      const ctx = opts.audioContext && opts.audioContext(), buf = A.sounds.get(role);
      if (!ctx || !buf) return;
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
    } catch (e) { /* sound is decoration */ }
  };

  // text in the font at game scale: returns the width drawn (game px)
  const measure = (text) => { let w = 0, prev = null; for (const ch of text) { const c = A.font.chars.get(ch.codePointAt(0)); if (!c) { w += 6; prev = null; continue; } if (prev !== null) w += A.font.kern.get(prev * 4294967296 + ch.codePointAt(0)) || 0; w += c.xa; prev = ch.codePointAt(0); } return w; };
  const drawText = (ctx, text, x, y, atlas) => {
    let cx = x, prev = null;
    for (const ch of text) {
      const cp = ch.codePointAt(0), c = A.font.chars.get(cp);
      if (!c) { cx += 6; prev = null; continue; }
      if (prev !== null) cx += A.font.kern.get(prev * 4294967296 + cp) || 0;
      ctx.drawImage(atlas, c.x, c.y, c.w, c.h, (cx + c.xo) * SCALE, (y + c.yo) * SCALE, c.w * SCALE, c.h * SCALE);
      cx += c.xa; prev = cp;
    }
    return cx - x;
  };

  const items = () => ['EXPORT FILE', 'IMPORT FILE', 'DELETE FILE', 'BACK'];
  // the FPS readout is a key, not a setting: M flips it (play.mjs), this browser remembers it
  const toggleFps = () => {
    state.fpsOn = !state.fpsOn;
    try { localStorage.setItem('isaac-fps-viewer', state.fpsOn ? '1' : '0'); } catch (e) { /* no storage */ }
    fpsEl.hidden = !state.fpsOn;
    if (state.fpsOn && !state.ready) load().then(() => { fpsEl.hidden = !state.fpsOn; drawFps(); }).catch(() => {});
    else if (state.fpsOn) drawFps();
    return state.fpsOn;
  };
  const draw = () => {
    if (!state.open || !state.ready) return;
    const R = A.menu.rects, [px0, py0] = R.prompt_at, [sx, sy, sw, sh0] = R.prompt_paper;
    // the seed paper (blank) where the engine draws its own prompt, the prompt
    // paper's width and a little taller: a title and five entries
    const sh = sh0 + 24, px = px0, py = py0 - 12;
    g.clearRect(0, 0, overlay.width, overlay.height);
    g.drawImage(A.paper, 0, 0, A.paper.width, A.paper.height, px * SCALE, py * SCALE, sw * SCALE, sh * SCALE);
    const title = `FILE ${state.slot + 1}`;
    drawText(g, title, px + (sw - measure(title)) / 2, py + 10, A.atlas);
    const list = items();
    const lineH = 17, top = py + 40;
    list.forEach((label, i) => {
      const y = top + i * lineH, w = measure(label), x = px + (sw - w) / 2;
      drawText(g, label, x, y, i === state.cursor ? A.atlas : A.atlasLight);
      if (i === state.cursor) {
        const [cx, cy, cw, ch] = R.cursor;
        g.drawImage(A.sheet, cx, cy, cw, ch, (x - cw - 4) * SCALE, (y - 4) * SCALE, cw * SCALE, ch * SCALE);
      }
    });
    if (state.message) drawText(g, state.message, px + (sw - measure(state.message)) / 2, py + sh - 24, A.atlas);
  };
  const drawFps = () => {
    if (!state.ready) return;
    const gg = fpsEl.getContext('2d');
    gg.imageSmoothingEnabled = false;
    gg.clearRect(0, 0, fpsEl.width, fpsEl.height);
    if (state.fps == null) return;
    // plain text in the game's font: a light shadow a pixel down-right, the ink on top
    const text = `${Math.round(state.fps)} FPS`;
    drawText(gg, text, 3, 3, A.atlasLight);
    drawText(gg, text, 2, 2, A.atlas);
  };

  const open = async (slot) => {
    if (state.open) return;
    state.slot = slot; state.cursor = 0; state.message = null; state.open = true; state.closing = false;
    try { await load(); } catch (e) { state.open = false; return; }
    if (!state.open) return;
    overlay.hidden = false;
    play('open');
    draw();
    log(`[menu] EDIT FILE open for file ${slot + 1}`);
  };
  const close = (sound) => {
    if (!state.open) return;
    state.open = false; overlay.hidden = true;
    if (sound) play(sound);
    log('[menu] EDIT FILE closed');
  };
  const select = async () => {
    const i = state.cursor;
    if (i === 3) { close('back'); return; }
    if (i === 2) {
      // the engine's own prompt: the gate lets the transition through when the
      // page has named the slot, and the confirm is pressed for the player
      play('delete');
      close(null);
      window.isaacEditFileDelete = state.slot;
      injectKey('enter', true);
      setTimeout(() => injectKey('enter', false), 80);
      return;
    }
    play('select');
    state.message = i === 0 ? 'EXPORTING...' : 'CHOOSE A FILE...';
    draw();
    try {
      const r = await (i === 0 ? actions.export(state.slot) : actions.import(state.slot));
      state.message = r || (i === 0 ? 'EXPORTED' : 'IMPORTED');
    } catch (e) { state.message = (e && e.message ? e.message : 'FAILED').toUpperCase().slice(0, 28); }
    draw();
  };
  const onKey = (ev, down) => {
    if (!state.open) return false;
    // key-ups always reach the engine: the confirm that opened this menu went
    // down in the engine's eyes, and its release must follow (a held confirm
    // would swallow the press the Delete entry makes for the player)
    if (!down) return false;
    const code = ev.code;
    if (code === 'ArrowUp' || code === 'KeyW') { state.cursor = (state.cursor + items().length - 1) % items().length; play('move'); draw(); }
    else if (code === 'ArrowDown' || code === 'KeyS') { state.cursor = (state.cursor + 1) % items().length; play('move'); draw(); }
    else if (code === 'Enter' || code === 'Space' || code === 'KeyE') { select(); }
    else if (code === 'Escape' || code === 'Backspace') { close('back'); }
    return true;
  };

  return {
    open, close, onKey, draw, toggleFps,
    isOpen: () => state.open,
    fpsViewer: () => state.fpsOn,
    setFps: (fps) => { state.fps = fps; if (state.fpsOn) { if (!state.ready) load().then(() => { fpsEl.hidden = false; drawFps(); }).catch(() => {}); else { fpsEl.hidden = false; drawFps(); } } },
    preload: load,
    element: overlay,
  };
}
