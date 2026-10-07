// touch_controls.mjs -- the phone's way into the game, with nothing on screen
// that the game does not already show.
//
//   - Sticks appear where a thumb lands and fade when it lifts: the left half
//     moves (any angle, touch_input.mjs createAnalogMove), the right half fires.
//   - The game's own HUD is the button set: tap the minimap for the big map
//     (hold to peek), the pause mark beside it pauses, the trinket and pocket
//     corners swap on a tap and drop on a hold. Under the room, the mobile
//     item bar: the active item with its charge, the pocket item and the bombs,
//     drawn with the HUD's own art (page_assets.py build_hud). Tap to use; the
//     small second item swaps.
//   - Menus are tapped: rows, files, characters, the game's BACK/SELECT papers;
//     a swipe steps the cursor, two fingers go back, so does Android's back.
//   - The game's rumble (Options > RUMBLE) drives navigator.vibrate.
//
// Every action is one of the game's keyboard keys, paced on native frames by
// touch_input.mjs. Guest state comes from touch_game.mjs, read-only.
import { createTouchInput, stickKeys, twinAction, createAnalogMove } from './touch_input.mjs';
import { parseBmfont } from './menu_overlay.mjs';
import {
  GAME_W, GAME_H, MENU, POCKET_ACTIVE, POCKET_PILL, PLAYER_JACOB, PLAYER_ESAU, PLAYER_FORGOTTEN, PLAYER_SOUL,
  readOptions, readRun, readMenu, createHapticDetector, hapticPattern,
} from './touch_game.mjs';

const STICK_RADIUS = 52;        // css px from the base to a full push
const TAP_SLOP = 14;            // css px a tap may wander before it is a drag
const HOLD_MS = 450;            // a press this long is a hold (drop, map peek)
const SWIPE_STEP = 34;          // css px of swipe per menu step

// ---- where the game draws its HUD (480x270 game px) ------------------------
// Measured on this build at Options > HUD OFFSET 1 (the page's default): the
// minimap at 400..452 x 14..50, the active item 28..56 x 14..44 with the
// Schoolbag's second item at 12..26, the trinket around 48..64 x 236..252 and
// the pocket items 418..462 x 226..258. Each corner moves in with the offset as
// the game's own HUD does; the boxes are generous, a thumb is not a cursor.
function hudLayout(offset) {
  const o = offset || 0;
  const right = GAME_W - 20 * o, top = 12 * o, left = 20 * o;
  const map = { x: right - 66, y: top, w: 66 + 20 * o, h: 56 };
  return {
    map,
    pause: { x: map.x - 22, y: top + 2, w: 18, h: 18 },
    twin: { x: map.x - 44, y: top + 2, w: 18, h: 18 },
    active: { x: Math.max(0, left - 12), y: top, w: 52, h: 40 },
    trinket: { x: left + 4, y: GAME_H - 16 * o - 44, w: 56, h: 44 + 16 * o },
    pocket: { x: GAME_W - 16 * o - 56, y: GAME_H - 6 * o - 50, w: 56 + 16 * o, h: 50 + 6 * o },
  };
}

const inside = (r, x, y, pad = 0) => !!r && x >= r.x - pad && x < r.x + r.w + pad && y >= r.y - pad && y < r.y + r.h + pad;

export function createTouchControls({ readState, emit, onGesture, guest, assetsUrl, readAsset }) {
  const preference = new URLSearchParams(location.search).get('touch');
  if (preference === '0') return { destroy() {} };
  const coarse = window.matchMedia('(pointer: coarse)');
  const main = document.querySelector('main');
  const stage = document.getElementById('stage');
  const G = () => (guest ? guest() : null);
  const listeners = [];
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  };

  const root = document.createElement('section');
  root.id = 'touch-controls';
  root.dataset.touchUi = '';
  root.setAttribute('aria-label', 'Touch controls');
  root.hidden = true;
  root.innerHTML = `
    <div class="touch-stick" data-stick="move" aria-hidden="true"><span class="touch-stick-base"></span><span class="touch-stick-knob"></span></div>
    <div class="touch-stick" data-stick="fire" aria-hidden="true"><span class="touch-stick-base"></span><span class="touch-stick-knob"></span></div>
    <canvas class="touch-bar" aria-hidden="true"></canvas>
    <input class="touch-keys" type="text" inputmode="text" enterkeyhint="done" autocomplete="off" autocapitalize="characters"
      autocorrect="off" spellcheck="false" aria-label="Seed" tabindex="-1">`;
  main.append(root);
  const hud = document.createElement('canvas');
  hud.className = 'touch-hud';
  hud.width = GAME_W * 2; hud.height = GAME_H * 2;
  hud.setAttribute('aria-hidden', 'true');
  stage.append(hud);
  const hudCtx = hud.getContext('2d');
  hudCtx.imageSmoothingEnabled = false;
  const bar = root.querySelector('.touch-bar');
  const barCtx = bar.getContext('2d');
  const keysInput = root.querySelector('.touch-keys');
  const sticks = Object.fromEntries([...root.querySelectorAll('.touch-stick')].map((el) => [el.dataset.stick, {
    el, knob: el.querySelector('.touch-stick-knob'), pointer: null, bx: 0, by: 0, x: 0, y: 0,
  }]));

  let state = readState();
  let enabled = preference === '1' || coarse.matches;
  let available = false, blurred = false, destroyed = false, raf = 0, timer = 0, lastTick = 0;
  let mode = 'off';                 // off | game | menu
  let run = null, menu = { screen: -1 }, options = null, hudBox = hudLayout(0);
  let mapLatched = false, logicFrame = -1, lastViewY = NaN, viewSettled = false;
  let fullscreenTried = false, backArmed = false;
  let nav = null;                   // a menu cursor walk in progress
  const pointers = new Map();
  const analog = createAnalogMove();
  const haptics = createHapticDetector();
  const input = createTouchInput({ readFrame: () => state.frame, emit });
  const gesture = () => { if (onGesture) onGesture(); };
  const vibrate = (ms) => { if (ms > 0 && options && options.rumble && navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* not allowed yet */ } } };

  // ---- art ------------------------------------------------------------------
  const art = { ready: false, hud: null, img: {}, font: null };
  (async () => {
    const fetchBytes = async (name) => {
      if (readAsset) { const bytes = await readAsset(name); if (!bytes) throw new Error(`${name}: not in the payload`); return bytes; }
      const res = await fetch(`${assetsUrl}/${name}`);
      if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    };
    const image = async (name) => {
      const blob = new Blob([await fetchBytes(name)], { type: 'image/png' });
      if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = URL.createObjectURL(blob); });
      return img;
    };
    try {
      const spec = JSON.parse(new TextDecoder().decode(await fetchBytes('hud.json')));
      const names = { actives: spec.actives.sheet, pocket: spec.pocket.sheet, pickups: spec.pickups.sheet, chargebar: spec.chargebar.sheet, font: spec.font.png };
      for (const [key, name] of Object.entries(names)) art.img[key] = await image(name);
      const fnt = await fetchBytes(spec.font.fnt);
      art.font = parseBmfont(fnt.buffer.slice(fnt.byteOffset, fnt.byteOffset + fnt.byteLength));
      art.hud = spec;
      art.ready = true;
      barKey = '';
    } catch (error) { console.warn(`[touch] item bar art unavailable: ${error.message || error}`); }
  })();

  // ---- geometry ---------------------------------------------------------------
  const portrait = () => innerHeight > innerWidth;
  function stageBox() {
    const r = stage.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, s: r.width / GAME_W };
  }
  const toGame = (box, cx, cy) => [(cx - box.x) / box.s, (cy - box.y) / box.s];

  // ---- the item bar -------------------------------------------------------------
  // Laid out in game px; drawn 4x into the canvas, shown at the stage's own
  // scale in landscape (it sits on the room's bottom wall, as on the mobile
  // Rebirth) and larger in the portrait deck under the picture.
  let barItems = [], barKey = '', barScale = 1, barRect = null;
  const BAR_K = 4;

  function players() {
    if (!run || !run.players.length) return [];
    const main = run.players[0];
    const esau = main.type === PLAYER_JACOB ? run.players.find((p) => p.type === PLAYER_ESAU) : null;
    return esau ? [main, esau] : [main];
  }

  function chargeFraction(active) {
    if (!active || active.max <= 0) return null;
    return Math.max(0, Math.min(1, active.charge / active.max));
  }

  function planBar() {
    const list = players(), items = [];
    const twins = list.length === 2;
    let x = 0;
    const push = (item) => { items.push({ ...item, x }); x += item.w + 6; };
    list.forEach((player, index) => {
      const who = twins ? (index === 0 ? 'jacob' : 'esau') : null;
      const active = player.actives[0];
      if (player.actives[1] && !twins) push({ kind: 'swap-active', w: 16, h: 16, y: 16, player, item: player.actives[1] });
      if (active) push({ kind: 'active', w: active.max > 0 && !active.special ? 46 : 32, h: 32, y: 0, player, item: active, who });
      const pocket = player.pockets[0];
      if (pocket) push({ kind: 'pocket', w: 32, h: 32, y: 0, player, item: pocket, who,
        active: pocket.kind === POCKET_ACTIVE ? player.actives[2] : null });
      if (player.pockets[1] && !twins) push({ kind: 'swap-pocket', w: 16, h: 16, y: 16, player, item: player.pockets[1] });
      if (index === 0) {
        if (player.bombs > 0 || player.goldenBomb) push({ kind: 'bomb', w: 32, h: 16, y: 16, player });
      }
    });
    return { items, width: Math.max(0, x - 6), height: 32 };
  }

  function drawText(ctx, text, x, y, k) {
    const font = art.font, img = art.img.font;
    if (!font || !img) return;
    let cx = x;
    for (const ch of text) {
      const c = font.chars.get(ch.codePointAt(0));
      if (!c) { cx += 4; continue; }
      ctx.drawImage(img, c.x, c.y, c.w, c.h, (cx + c.xo) * k, (y + c.yo) * k, c.w * k, c.h * k);
      cx += c.xa;
    }
  }

  function drawCollectible(ctx, id, x, y, size, k) {
    const entry = art.hud.actives.items[String(id)];
    if (!entry) return false;
    const cell = art.hud.actives.cell;
    ctx.drawImage(art.img.actives, entry.at[0], entry.at[1], cell, cell, x * k, y * k, size * k, size * k);
    return true;
  }

  function drawChargeBar(ctx, active, x, y, k) {
    const spec = art.hud.chargebar, [w, h] = spec.size, img = art.img.chargebar;
    const fraction = chargeFraction(active);
    if (fraction === null) return;
    ctx.drawImage(img, spec.empty[0], spec.empty[1], w, h, x * k, y * k, w * k, h * k);
    // ui_chargebar fills from the bottom of its 26 px well (rows 3..28)
    const fill = Math.round(26 * fraction);
    if (fill > 0) ctx.drawImage(img, spec.full[0], spec.full[1] + 29 - fill, w, fill, x * k, (y + 29 - fill) * k, w * k, fill * k);
    const notch = spec.overlay[String(active.max)];
    if (notch && !active.timed) ctx.drawImage(img, notch[0], notch[1], w, h, x * k, y * k, w * k, h * k);
  }

  function drawPocket(ctx, item, size, x, y, k) {
    if (item.active) return drawCollectible(ctx, item.active.id, x, y, size, k);
    const table = item.item.kind === POCKET_PILL ? art.hud.pocket.pills : art.hud.pocket.cards;
    const frame = table[String(item.item.id)] || art.hud.pocket.cards['1'];
    if (!frame) return false;
    const [sx, sy, sw, sh] = frame;
    ctx.drawImage(art.img.pocket, sx, sy, sw, sh, x * k, y * k, size * k, size * k);
    return true;
  }

  function drawBar() {
    const plan = planBar();
    const pressed = new Set([...pointers.values()].filter((p) => p.barItem).map((p) => p.barItem.kind + (p.barItem.who || '')));
    const key = JSON.stringify([plan.items.map((i) => [i.kind, i.who, i.item && i.item.id, i.item && i.item.charge, i.item && i.item.kind,
      i.player && i.player.bombs, i.player && i.player.goldenBomb, i.active && i.active.id]), [...pressed], barScale, portrait()]);
    if (key === barKey) return;
    barKey = key;
    barItems = plan.items;
    const k = BAR_K;
    const width = Math.max(1, plan.width), height = plan.height;
    if (bar.width !== width * k || bar.height !== height * k) { bar.width = width * k; bar.height = height * k; }
    barCtx.imageSmoothingEnabled = false;
    barCtx.clearRect(0, 0, bar.width, bar.height);
    bar.hidden = !art.ready || !plan.items.length || mode !== 'game';
    if (bar.hidden) return;
    for (const item of plan.items) {
      const down = pressed.has(item.kind + (item.who || '')) ? 1 : 0;
      const x = item.x, y = item.y + down;
      if (item.kind === 'active') {
        drawCollectible(barCtx, item.item.id, x, y, 32, k);
        if (item.w > 32) drawChargeBar(barCtx, item.item, x + 31, y, k);
      } else if (item.kind === 'swap-active') {
        drawCollectible(barCtx, item.item.id, x, y, 16, k);
      } else if (item.kind === 'pocket') {
        drawPocket(barCtx, item, 32, x, y, k);
      } else if (item.kind === 'swap-pocket') {
        drawPocket(barCtx, { item: item.item, active: item.item.kind === POCKET_ACTIVE ? item.player.actives[3] : null }, 16, x, y, k);
      } else if (item.kind === 'bomb') {
        const [sx, sy, sw, sh] = item.player.goldenBomb ? art.hud.pickups.goldenBomb : art.hud.pickups.bomb;
        barCtx.drawImage(art.img.pickups, sx, sy, sw, sh, x * k, y * k, sw * k, sh * k);
        drawText(barCtx, String(Math.min(99, item.player.bombs)).padStart(2, '0'), x + 16, y + 3, k);
      }
    }
    positionBar(plan);
  }

  function positionBar(plan = { width: bar.width / BAR_K, height: bar.height / BAR_K }) {
    const box = stageBox();
    if (portrait()) {
      const deckTop = box.y + box.h, deckH = innerHeight - deckTop;
      barScale = Math.max(1.4, Math.min(2.6, Math.min(innerWidth / 230, deckH / 120)));
      const w = plan.width * barScale, h = plan.height * barScale;
      barRect = { x: (innerWidth - w) / 2, y: deckTop + Math.max(10, Math.min(28, deckH * 0.05)), w, h };
    } else {
      barScale = box.s;
      const w = plan.width * barScale, h = plan.height * barScale;
      barRect = { x: box.x + (box.w - w) / 2, y: box.y + box.h - (plan.height + 5) * box.s, w, h };
    }
    Object.assign(bar.style, { left: `${barRect.x}px`, top: `${barRect.y}px`, width: `${barRect.w}px`, height: `${barRect.h}px` });
  }

  function barHit(cx, cy) {
    if (bar.hidden || !barRect) return null;
    const s = barScale, pad = Math.max(6, 22 - s * 6);
    for (const item of barItems) {
      const r = { x: barRect.x + item.x * s, y: barRect.y + item.y * s, w: item.w * s, h: item.h * s };
      if (inside(r, cx, cy, pad)) return item;
    }
    return null;
  }

  // ---- the HUD marks the game does not draw: pause, and the twins' freeze ----
  function drawHud() {
    hudCtx.clearRect(0, 0, hud.width, hud.height);
    if (mode !== 'game') return;
    const k = 2, p = hudBox.pause;
    // a scrap of paper with two strokes, in the HUD's black outline
    const px = (x, y, w, h, colour) => { hudCtx.fillStyle = colour; hudCtx.fillRect((p.x + x) * k, (p.y + y) * k, w * k, h * k); };
    px(2, 1, 12, 14, '#000'); px(1, 2, 14, 12, '#000');
    px(2, 2, 12, 12, '#d9cbb0'); px(3, 13, 11, 1, '#b3a184');
    px(5, 4, 2, 8, '#2a211b'); px(9, 4, 2, 8, '#2a211b');
    const twin = twinRole();
    if (twin) {
      const t = hudBox.twin, cx = (t.x + 8) * k, cy = (t.y + 8) * k;
      hudCtx.fillStyle = '#000'; hudCtx.beginPath(); hudCtx.arc(cx, cy, 7.5 * k, 0, Math.PI * 2); hudCtx.fill();
      hudCtx.fillStyle = pointersHold('twin') ? '#f1e5c8' : '#d9cbb0'; hudCtx.beginPath(); hudCtx.arc(cx, cy, 6.5 * k, 0, Math.PI * 2); hudCtx.fill();
      hudCtx.fillStyle = '#2a211b';
      hudCtx.fillRect(cx - 4 * k, cy - 2 * k, 3 * k, 4 * k); hudCtx.fillRect(cx + 1 * k, cy - 2 * k, 3 * k, 4 * k);
    }
  }
  const pointersHold = (kind) => [...pointers.values()].some((p) => p.hot === kind);
  function twinRole() {
    const list = run ? run.players : [];
    const main = list[0];
    if (!main) return null;
    if (main.type === PLAYER_JACOB) return 'freeze';
    if (main.type === PLAYER_FORGOTTEN || main.type === PLAYER_SOUL) return 'switch';
    return null;
  }

  function hotspotAt(gx, gy) {
    const list = players(), main = list[0];
    if (inside(hudBox.pause, gx, gy, 6)) return 'pause';
    if (twinRole() && inside(hudBox.twin, gx, gy, 5)) return 'twin';
    if (inside(hudBox.map, gx, gy, 4)) return 'map';
    if (main && main.actives[0] && inside(hudBox.active, gx, gy)) return 'active';
    if (main && (main.trinkets[0] || main.trinkets[1]) && inside(hudBox.trinket, gx, gy)) return 'trinket';
    if (main && main.pockets[0] && inside(hudBox.pocket, gx, gy)) return 'pocket';
    return null;
  }

  // ---- actions ------------------------------------------------------------------
  function twinUse(who, slot) {
    const binding = twinAction(`${who}-${slot}`, !!(options && options.betterTwins));
    return { key: binding.key, control: binding.control };
  }
  // What a press does the moment it lands, and on lift: { down(), tap(), hold(), up() }.
  function behaviour(kind, owner, who) {
    switch (kind) {
      case 'active': {
        const b = who ? twinUse(who, 'item') : { key: 'space', control: false };
        return { down: () => input.press(owner, b.key, b.control) };
      }
      case 'pocket': {
        const b = who ? twinUse(who, 'pocket') : { key: 'q', control: false };
        return { tap: () => input.tap(owner, b.key, b.control), hold: () => input.setKeys(owner, ['ctrl']) };
      }
      case 'swap-active': case 'swap-pocket': return { tap: () => input.tap(owner, 'ctrl') };
      case 'trinket': return { tap: () => input.tap(owner, 'ctrl'), hold: () => input.setKeys(owner, ['ctrl']) };
      case 'bomb': return { down: () => input.tap(owner, 'e') };
      case 'pause': return { tap: () => input.tap(owner, 'escape') };
      case 'twin': return twinRole() === 'freeze' ? { down: () => input.setKeys(owner, ['ctrl']) } : { tap: () => input.tap(owner, 'ctrl') };
      case 'map': return {
        down: () => input.setKeys(owner, ['tab']),
        tap: () => { mapLatched = !mapLatched; input.setKeys('touch:map', mapLatched ? ['tab'] : []); },
      };
    }
    return {};
  }

  // ---- sticks -------------------------------------------------------------------
  function showStick(stick, on) {
    stick.el.classList.toggle('is-on', on);
    if (!on) stick.knob.style.transform = 'translate(-50%, -50%)';
  }
  function placeStick(stick, x, y) {
    stick.bx = x; stick.by = y;
    stick.el.style.transform = `translate(${x}px, ${y}px)`;
  }
  function moveStick(stick, cx, cy) {
    let dx = cx - stick.bx, dy = cy - stick.by;
    const length = Math.hypot(dx, dy);
    // Floating: past the rim the base follows the thumb, so reversing is instant.
    if (length > STICK_RADIUS) {
      const pull = (length - STICK_RADIUS) / length;
      placeStick(stick, stick.bx + dx * pull, stick.by + dy * pull);
      dx = cx - stick.bx; dy = cy - stick.by;
    }
    stick.x = dx / STICK_RADIUS; stick.y = dy / STICK_RADIUS;
    stick.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    if (stick === sticks.fire) input.setKeys('touch:fire', stickKeys(stick.x, stick.y, true));
  }
  function releaseStick(stick) {
    stick.pointer = null; stick.x = stick.y = 0;
    if (stick === sticks.fire) input.release('touch:fire');
    else { analog.reset(); input.release('touch:move'); }
    showStick(stick, false);
  }

  // ---- menus ---------------------------------------------------------------------
  // A tap names a target; the cursor is walked to it one key at a time, each
  // step confirmed by the game's own cursor, then confirmed if the tap asks.
  function walk(screen, read, target, keyFor, confirm) {
    nav = { screen, read, target, keyFor, confirm, presses: 0, wait: 0, last: null, lastKey: null, limit: 14 };
  }
  const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  function stepWalk() {
    if (!nav) return;
    if (menu.screen !== nav.screen) { nav = null; return; }
    const cursor = nav.read(menu);
    if (cursor === nav.target) {
      if (nav.confirm) input.tap('touch:menu', nav.confirm);
      nav = null;
      return;
    }
    if (state.frame < nav.wait && cursor === nav.last) return;
    if (nav.presses >= nav.limit) { nav = null; return; }
    const key = nav.keyFor(cursor, nav.target);
    // Turning back means the cursor skipped the target: a row the game has
    // disabled (CONTINUE with no run saved). Stop where the game put it.
    if (!key || key === OPPOSITE[nav.lastKey]) { nav = null; return; }
    input.tap('touch:menu', key);
    nav.presses++; nav.last = cursor; nav.lastKey = key; nav.wait = state.frame + 10;
  }
  const upDown = (cursor, target) => (cursor > target ? 'up' : 'down');
  const PAPER_BACK = { x: 0, y: 200, w: 76, h: 70 }, PAPER_SELECT = { x: 392, y: 192, w: 88, h: 78 };

  // A tap at game (x, y) on the current screen -> handled?
  function menuTap(gx, gy) {
    const screen = menu.screen;
    if (state.paused && state.running) return pauseTap(gx, gy);
    if (typeof state.menu === 'string') return false;            // the page's own paper menus: generic
    if (!viewSettled) return true;                              // the menu camera is still travelling
    switch (screen) {
      case MENU.TITLE: input.tap('touch:menu', 'enter'); return true;
      case MENU.SAVES: {
        if (inside(PAPER_BACK, gx, gy)) { input.tap('touch:menu', 'escape'); return true; }
        if (inside(PAPER_SELECT, gx, gy)) { input.tap('touch:menu', 'enter'); return true; }
        const files = [[35, 160], [175, 305], [318, 445]];
        let target = files.findIndex(([a, b]) => gx >= a && gx < b && gy >= 25 && gy < 215);
        if (target < 0 && gx >= 110 && gx < 360 && gy >= 222 && gy < 268) target = 3;
        if (target < 0) return true;
        walk(screen, (m) => m.cursor, target, (c, t) => (t === 3 ? 'down' : c === 3 ? 'up' : c < t ? 'right' : 'left'), 'enter');
        return true;
      }
      case MENU.GAME: {
        const rows = [68, 90, 113, 136, 158, 180];
        if (gx >= 330 && gx < 465 && gy >= 150 && gy < 210) { input.tap('touch:menu', 'tab'); return true; }
        if (gx >= 140 && gx < 330 && gy >= 30 && gy < 240) {
          const target = rows.findIndex((y) => Math.abs(gy - y) <= 11);
          if (target >= 0) walk(screen, (m) => m.cursor, target, upDown, 'enter');
          return true;
        }
        input.tap('touch:menu', 'escape');
        return true;
      }
      case MENU.OPTIONS: {
        if (gx < 130 || gx >= 355) { input.tap('touch:menu', 'escape'); return true; }
        const scroll = (Number.isFinite(menu.viewY) ? menu.viewY : -1080) + 1080;
        const row = Math.round((gy - 72 - scroll) / 20);
        if (row < 0 || row > 22) return true;
        if (row !== menu.cursor) { walk(screen, (m) => m.cursor, row, upDown, null); return true; }
        // The selected row: CONTROLS opens, any other value steps left or right.
        if (row === 0) input.tap('touch:menu', 'enter');
        else input.tap('touch:menu', gx < 262 ? 'left' : 'right');
        return true;
      }
      case MENU.CHARACTER: {
        if (gx >= 340 && gx < 475 && gy >= 30 && gy < 105) { input.tap('touch:menu', 'tab'); return true; }
        if (gx >= 350 && gx < 480 && gy >= 112 && gy < 200) {
          const target = Math.max(0, Math.min(3, Math.round((gy - 136) / 21)));
          walk(screen, () => readDifficulty(), target, upDown, null);
          return true;
        }
        if (gx < 120 && gy >= 205) { input.tap('touch:menu', 'escape'); return true; }
        if (gx >= 205 && gx < 275 && gy >= 60 && gy < 175) { input.tap('touch:menu', 'enter'); return true; }
        if (gx >= 120 && gx < 205 && gy >= 40 && gy < 200) { input.tap('touch:menu', 'left'); return true; }
        if (gx >= 275 && gx < 350 && gy >= 40 && gy < 200) { input.tap('touch:menu', 'right'); return true; }
        return true;
      }
    }
    return false;
  }
  function readDifficulty() {
    const g = G();
    try { const m = g.u32(0x00c72a20); return m ? g.u32(m + 0x153c) | 0 : -1; } catch { return -1; }
  }
  function pauseTap(gx, gy) {
    // The pause paper sits at the bottom centre: OPTIONS, MY STUFF!, RESUME GAME,
    // EXIT GAME (cursor 0..3 at Game+0x23a7c). A tap on the room resumes.
    if (gx < 165 || gx >= 340 || gy < 172) { input.tap('touch:menu', 'escape'); return true; }
    const stops = [188, 208, 226, 245];
    const target = stops.findIndex((y) => Math.abs(gy - y) <= 10);
    if (target < 0) return true;
    const read = () => readPauseCursor();
    if (read() < 0) { input.tap('touch:menu', 'enter'); return true; }
    walk(menu.screen, read, target, upDown, 'enter');
    return true;
  }
  function readPauseCursor() {
    const g = G();
    try { const game = g.u32(0x00c71678); return game ? g.u32(game + 0x23a7c) | 0 : -1; } catch { return -1; }
  }

  // ---- the soft keyboard for seeds -------------------------------------------------
  function seedEntryOpen() {
    if (menu.screen !== MENU.CHARACTER) return false;
    const g = G();
    try { const m = g.u32(0x00c72a20); return !!m && (g.u32(m + 0x1534) | 0) === 1; } catch { return false; }
  }

  // ---- state ---------------------------------------------------------------------------
  function reset() {
    nav = null;
    input.reset();
    for (const pointer of pointers.values()) {
      try { if (root.hasPointerCapture(pointer.id)) root.releasePointerCapture(pointer.id); } catch { /* gone */ }
    }
    pointers.clear();
    for (const stick of Object.values(sticks)) { stick.pointer = null; showStick(stick, false); }
    analog.reset();
    mapLatched = false;
    barKey = '';
  }
  function refresh() {
    const previousFrame = state.frame;
    state = readState();
    const nextAvailable = enabled && !!state.ready && !state.blocked && !document.hidden && !blurred;
    const nextMode = !nextAvailable ? 'off' : state.running && !state.paused ? 'game' : 'menu';
    if (nextMode !== mode || state.frame < previousFrame) {
      reset();
      mode = nextMode;
      root.dataset.mode = mode;
    }
    available = nextAvailable;
    root.hidden = !available;
    document.documentElement.classList.toggle('isaac-touch', enabled);
    document.documentElement.classList.toggle('isaac-touch-ready', enabled && !!state.ready);
    const g = G();
    options = readOptions(g);
    run = state.running ? readRun(g) : null;
    menu = readMenu(g);
    viewSettled = menu.viewY === lastViewY;
    lastViewY = menu.viewY;
    hudBox = hudLayout(options ? options.hudOffset : 0);
  }

  function tick() {
    if (destroyed) return;
    lastTick = performance.now();
    refresh();
    if (available) {
      // Movement is re-chosen once per logic frame, not per presented frame.
      if (mode === 'game' && run && run.frame !== logicFrame) {
        logicFrame = run.frame;
        const move = sticks.move;
        if (move.pointer !== null) input.setKeys('touch:move', analog.step(move.x, move.y));
      }
      if (mode === 'menu') stepWalk();
      const typing = enabled && seedEntryOpen();
      if (typing && document.activeElement !== keysInput) keysInput.focus({ preventScroll: true });
      else if (!typing && document.activeElement === keysInput) keysInput.blur();
    }
    drawBar();
    drawHud();
    // The game's own rumble, whatever drives the run.
    const events = haptics.update(run && options ? { rumble: options.rumble, shake: run.shake, players: run.players } : null);
    vibrate(hapticPattern(events));
    input.update();
  }
  // Animation frames pace the drawing; when the browser withholds them (a
  // throttled or covered page) while the game runs on its timer, a slower timer
  // still releases taps and steps menus, so no key is ever left held.
  function frameLoop() { tick(); raf = requestAnimationFrame(frameLoop); }

  // ---- pointers ----------------------------------------------------------------------
  function shouldTrapBack() { return mode === 'game' || (mode === 'menu' && menu.screen !== MENU.TITLE && menu.screen !== -1) || (state.paused && state.running); }
  function armBack() {
    if (backArmed || !shouldTrapBack()) return;
    try { history.pushState({ isaacTouchBack: true }, ''); backArmed = true; } catch { /* sandboxed */ }
  }
  function firstTouch() {
    if (fullscreenTried || !coarse.matches) return;
    fullscreenTried = true;
    if (!document.fullscreenElement && main.requestFullscreen) main.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }

  function pointerDown(event) {
    if (event.button !== 0) return;
    refresh();
    if (!available) return;
    event.preventDefault();
    event.stopPropagation();
    gesture();
    firstTouch();
    armBack();
    const id = event.pointerId, cx = event.clientX, cy = event.clientY;
    const pointer = { id, owner: `touch:pointer:${id}`, sx: cx, sy: cy, x: cx, y: cy, at: performance.now(), moved: false };
    try { root.setPointerCapture(id); } catch { /* synthetic */ }
    pointers.set(id, pointer);
    if (mode === 'menu') {
      pointer.menu = true;
      pointer.anchorX = cx; pointer.anchorY = cy;
      if (pointers.size === 2) pointer.second = true;
      return;
    }
    const box = stageBox();
    const [gx, gy] = toGame(box, cx, cy);
    const item = barHit(cx, cy);
    const hot = item ? null : (gx >= 0 && gx < GAME_W && gy >= 0 && gy < GAME_H ? hotspotAt(gx, gy) : null);
    if (item || hot) {
      pointer.barItem = item;
      pointer.hot = item ? item.kind : hot;
      pointer.does = behaviour(item ? item.kind : hot, pointer.owner, item ? item.who : null);
      if (pointer.does.down) pointer.does.down();
      if (pointer.does.hold) pointer.holdTimer = setTimeout(() => { pointer.held = true; pointer.does.hold(); vibrate(20); }, HOLD_MS);
      vibrate(10);
      barKey = '';
      return;
    }
    startStick(pointer, cx, cy, box);
  }
  function startStick(pointer, cx, cy, box) {
    // Portrait keeps the picture clear: sticks live in the deck under it.
    if (portrait() && cy < box.y + box.h) { pointers.delete(pointer.id); return; }
    let stick = cx < innerWidth / 2 ? sticks.move : sticks.fire;
    if (stick.pointer !== null) stick = stick === sticks.move ? sticks.fire : sticks.move;
    if (stick.pointer !== null) { pointers.delete(pointer.id); return; }
    stick.pointer = pointer.id;
    pointer.stick = stick;
    const margin = STICK_RADIUS + 8;
    placeStick(stick, Math.max(margin, Math.min(innerWidth - margin, cx)), Math.max(margin, Math.min(innerHeight - margin, cy)));
    showStick(stick, true);
    moveStick(stick, cx, cy);
    if (stick === sticks.move) input.setKeys('touch:move', analog.step(stick.x, stick.y));
  }
  function pointerMove(event) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    event.preventDefault();
    event.stopPropagation();
    pointer.x = event.clientX; pointer.y = event.clientY;
    if (Math.hypot(pointer.x - pointer.sx, pointer.y - pointer.sy) > TAP_SLOP) pointer.moved = true;
    if (pointer.stick) { moveStick(pointer.stick, pointer.x, pointer.y); return; }
    if (pointer.menu) { swipe(pointer); return; }
    // A press that wanders off an icon before its hold becomes a stick.
    if (pointer.does && pointer.moved && !pointer.held && !pointer.does.down) {
      clearTimeout(pointer.holdTimer);
      pointer.does = null; pointer.barItem = null; pointer.hot = null; barKey = '';
      startStick(pointer, pointer.sx, pointer.sy, stageBox());
      if (pointer.stick) moveStick(pointer.stick, pointer.x, pointer.y);
    }
  }
  function swipe(pointer) {
    const dx = pointer.x - pointer.anchorX, dy = pointer.y - pointer.anchorY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_STEP) return;
    pointer.swiped = true;
    nav = null;
    const key = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'right' : 'left') : (dy < 0 ? 'down' : 'up');
    input.tap('touch:menu', key);
    pointer.anchorX = pointer.x; pointer.anchorY = pointer.y;
  }
  function pointerUp(event) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    event.preventDefault();
    event.stopPropagation();
    pointers.delete(event.pointerId);
    try { if (root.hasPointerCapture(pointer.id)) root.releasePointerCapture(pointer.id); } catch { /* gone */ }
    refresh();
    if (pointer.stick) { releaseStick(pointer.stick); return; }
    if (pointer.menu) {
      if (!available || mode !== 'menu') return;
      if (pointer.second && !pointer.moved && performance.now() - pointer.at < 400) { nav = null; input.tap('touch:menu', 'escape'); return; }
      if (pointer.moved || pointer.swiped || pointers.size) return;
      const [gx, gy] = toGame(stageBox(), pointer.sx, pointer.sy);
      if (!menuTap(gx, gy)) input.tap('touch:menu', 'enter');
      return;
    }
    clearTimeout(pointer.holdTimer);
    if (pointer.does) {
      const quick = performance.now() - pointer.at < HOLD_MS && !pointer.held;
      if (quick && pointer.does.tap) pointer.does.tap();
      if (pointer.hot === 'map' && !quick && mapLatched) { mapLatched = false; input.setKeys('touch:map', []); }
    }
    input.release(pointer.owner);
    barKey = '';
  }
  function pointerCancel(event) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    pointers.delete(event.pointerId);
    clearTimeout(pointer.holdTimer);
    if (pointer.stick) releaseStick(pointer.stick);
    input.release(pointer.owner);
    barKey = '';
  }

  // The soft keyboard: letters and digits become the game's keys.
  listen(keysInput, 'input', () => {
    const text = keysInput.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    keysInput.value = '';
    for (const ch of text) input.tap('touch:keys', ch);
  });
  listen(keysInput, 'keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); input.tap('touch:keys', 'enter'); }
    else if (event.key === 'Backspace') { event.preventDefault(); input.tap('touch:keys', 'backspace'); }
  });

  listen(root, 'pointerdown', pointerDown);
  listen(root, 'pointermove', pointerMove);
  listen(root, 'pointerup', pointerUp);
  listen(root, 'pointercancel', pointerCancel);
  listen(root, 'lostpointercapture', pointerCancel);
  for (const name of ['contextmenu', 'dragstart', 'selectstart']) listen(root, name, (event) => event.preventDefault());
  listen(window, 'popstate', () => {
    if (!backArmed) return;
    backArmed = false;
    refresh();
    if (available && shouldTrapBack()) input.tap('touch:back', 'escape');
  });
  listen(window, 'pointerdown', (event) => {
    // A touch on the page means the page is in front, whichever focus event is late.
    blurred = false;
    if (!enabled && event.pointerType === 'touch') enabled = true;
    const wasHidden = root.hidden;
    refresh();
    // The layer was hidden when this touch landed: it is the layer's touch all the same.
    if (wasHidden && available && main.contains(event.target) && !root.contains(event.target)) pointerDown(event);
  }, { capture: true });
  listen(window, 'blur', () => { blurred = true; reset(); refresh(); });
  listen(window, 'focus', () => { blurred = false; refresh(); });
  listen(document, 'visibilitychange', () => { reset(); refresh(); });
  const resized = () => { reset(); fullscreenTried = fullscreenTried && !!document.fullscreenElement; positionBar(); };
  listen(window, 'resize', resized);
  listen(window, 'orientationchange', resized);
  listen(document, 'fullscreenchange', resized);
  if (window.visualViewport) listen(window.visualViewport, 'resize', resized);
  listen(coarse, 'change', () => { if (coarse.matches) { enabled = true; refresh(); } });
  refresh();
  raf = requestAnimationFrame(frameLoop);
  timer = setInterval(() => { if (performance.now() - lastTick > 90) tick(); }, 50);
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf);
      clearInterval(timer);
      for (const remove of listeners) remove();
      reset();
      root.remove();
      hud.remove();
      document.documentElement.classList.remove('isaac-touch', 'isaac-touch-ready');
    },
  };
}
