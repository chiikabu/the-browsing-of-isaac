/**
 * In-run entity sprite mount + boot upload for the native/Wasm hybrid.
 *
 * Type / variant / pos come from captured Entity bytes (see render-host-gl.js).
 * ANM2 object pointers are NOT in the 872-byte live blobs, so type→sheet is a
 * [BRIDGE CONVENTION] table driven by entities2.xml + the player/tear/fireplace
 * anm2 files that ship in the local game instance.
 *
 * ZERO PE names. This module only reads mounted PNG/ANM2 bytes and talks to
 * the GL host upload / atlas hooks.
 */

import { VIRTUAL_ROOTS } from '../platform/path.js';
import {
  parseAnm2,
  anm2Animation,
  anm2FrameAt,
} from './menu-scene.js';

/** Recovered: UPDATE capture B5 + live entity-live-*.bin census (2026-08-26). */
export const ENTITY_TYPE_OFF = 0x28;
export const ENTITY_VARIANT_OFF = 0x2c;
/** [CONVENTION] next dword after variant; blob values match Isaac Entity.SubType. */
export const ENTITY_SUBTYPE_OFF = 0x30;

/**
 * [BRIDGE CONVENTION] texture keys the GL host looks up from Entity+type.
 * Src rects are overwritten at boot when the matching .anm2 parses.
 */
export const IN_RUN_SPRITE_KEYS = Object.freeze({
  player: 'entity:player',
  tear: 'entity:tear',
  fireplace: 'entity:fireplace',
  backdrop: 'room:backdrop',
});

/**
 * Files the filtered auto-mount must bring in so boot can upload in-run art.
 * Backdrop + grid stay mounted for room gfx even though GRID_80C810 has no
 * recovered slot types (that host stays coloured).
 */
export function isNativeFrameMountPath(path) {
  const p = String(path || '').toLowerCase().replace(/\\/g, '/');
  if (p.endsWith('isaac-ng.exe')) return true;
  if (p.startsWith('resources/font/')) return true;
  if (p.startsWith('resources/gfx/ui/')) return true;
  if (p.startsWith('gfx/backdrop/')) return true;
  if (p.startsWith('gfx/grid/')) return true;
  if (p.startsWith('gfx/characters/costumes/character_001')) return true;
  if (p === 'gfx/characters/costumes/ghost.png') return true;
  if (p === 'gfx/001.000_player.anm2' || p === 'gfx/001.001_player2.anm2') return true;
  if (p === 'gfx/002.000_tear.anm2' || p === 'gfx/bulletatlas.png') return true;
  if (p.startsWith('gfx/033.') && (p.endsWith('.anm2') || p.endsWith('.png'))) return true;
  return false;
}

function decodeUtf8(bytes) {
  if (typeof bytes === 'string') return bytes;
  return new TextDecoder('utf-8').decode(bytes);
}

function firstVisibleAnm2LayerFrame(doc, { animation = null, layerName = null } = {}) {
  const anim = anm2Animation(doc, animation);
  if (!anim) return null;
  const tryLayer = (wantName) => {
    for (const la of anim.layerAnimations) {
      if (!la.visible) continue;
      const layer = doc.layers.get(la.layerId);
      if (wantName && (layer?.name || '') !== wantName) continue;
      const f = anm2FrameAt(la, 0);
      if (!f || !f.visible || !(f.width > 0) || !(f.height > 0)) continue;
      return {
        frame: f,
        layer,
        src: [f.xCrop, f.yCrop, f.width, f.height],
        w: f.width,
        h: f.height,
        via: 'anm2-frame',
      };
    }
    return null;
  };
  return (layerName && tryLayer(layerName)) || tryLayer(null);
}

function readMounted(readFile, rel) {
  if (typeof readFile !== 'function' || !rel) return null;
  const abs = `${VIRTUAL_ROOTS.game}/${String(rel).replace(/\\/g, '/')}`.replace(/\/+/g, '/');
  try {
    const bytes = readFile(abs);
    if (bytes && bytes.length) return { path: abs, bytes };
  } catch (_) { /* missing in MEMFS */ }
  return null;
}

function readFirst(readFile, rels) {
  for (const rel of rels) {
    const hit = readMounted(readFile, rel);
    if (hit) return { ...hit, rel };
  }
  return null;
}

/**
 * [BRIDGE CONVENTION] default src when the anm2 is missing.
 * Player WalkDown body first sized frame is 32x32 @ crop (0,32) in
 * gfx/001.000_player.anm2 — used only if that file is not mounted.
 */
const CONVENTION_FRAMES = Object.freeze({
  [IN_RUN_SPRITE_KEYS.player]: Object.freeze({ src: [0, 32, 32, 32], w: 32, h: 32 }),
  [IN_RUN_SPRITE_KEYS.tear]: Object.freeze({ src: [0, 0, 32, 32], w: 32, h: 32 }),
  [IN_RUN_SPRITE_KEYS.fireplace]: Object.freeze({ src: [0, 0, 32, 32], w: 32, h: 32 }),
});

const UPLOAD_SPECS = Object.freeze([
  {
    key: IN_RUN_SPRITE_KEYS.player,
    type: 1,
    variant: 0,
    png: [
      'gfx/characters/costumes/character_001_isaac.png',
      'gfx/characters/costumes/Character_001_Isaac.png',
    ],
    anm2: ['gfx/001.000_player.anm2', 'gfx/001.000_Player.anm2'],
    animation: 'WalkDown',
    layerName: 'body',
  },
  {
    key: IN_RUN_SPRITE_KEYS.tear,
    type: 2,
    variant: 0,
    png: ['gfx/bulletatlas.png', 'gfx/BulletAtlas.png'],
    anm2: ['gfx/002.000_tear.anm2', 'gfx/002.000_Tear.anm2'],
    animation: 'RegularTear1',
  },
  {
    key: IN_RUN_SPRITE_KEYS.fireplace,
    type: 33,
    variant: 0,
    png: ['gfx/grid/grid_fireplace.png'],
    anm2: ['gfx/033.000_fireplace.anm2', 'gfx/grid/grid_fireplace.anm2'],
    animation: 'Idle',
  },
  {
    key: IN_RUN_SPRITE_KEYS.backdrop,
    png: ['gfx/backdrop/01_basement.png'],
  },
]);

/**
 * Upload mapped in-run PNGs and build a type/variant atlas for the GL host.
 * @returns {{ uploaded: string[], atlas: object, missing: string[] }}
 */
export async function uploadInRunEntityTextures({
  readFile,
  uploadTexture,
  log = null,
} = {}) {
  const uploaded = [];
  const missing = [];
  const atlas = Object.create(null);
  const say = (m) => { if (typeof log === 'function') log(m); };

  for (const spec of UPLOAD_SPECS) {
    const png = readFirst(readFile, spec.png);
    if (!png) {
      missing.push(spec.key);
      say(`in-run texture missing: ${spec.key} (${spec.png[0]})`);
      continue;
    }
    if (typeof uploadTexture === 'function') {
      await uploadTexture(spec.key, png.bytes);
    }
    uploaded.push(spec.key);

    let frame = CONVENTION_FRAMES[spec.key] || { src: [0, 0, 32, 32], w: 32, h: 32, via: 'convention' };
    let via = 'convention';
    if (spec.anm2) {
      const anm = readFirst(readFile, spec.anm2);
      if (anm) {
        try {
          const doc = parseAnm2(decodeUtf8(anm.bytes));
          const hit = firstVisibleAnm2LayerFrame(doc, {
            animation: spec.animation,
            layerName: spec.layerName || null,
          });
          if (hit) {
            frame = hit;
            via = 'anm2-frame';
          }
        } catch (err) {
          say(`in-run anm2 parse failed ${spec.anm2[0]}: ${err.message}`);
        }
      }
    }

    if (Number.isInteger(spec.type)) {
      const entry = {
        tex: spec.key,
        src: frame.src,
        w: frame.w,
        h: frame.h,
        via,
      };
      atlas[spec.type] = entry;
      atlas[`${spec.type}:${spec.variant ?? 0}`] = entry;
    }
    say(`in-run texture ${spec.key} from ${png.rel} src=${frame.src.join(',')} via=${via}`);
  }

  return { uploaded, atlas, missing };
}

export { firstVisibleAnm2LayerFrame };
