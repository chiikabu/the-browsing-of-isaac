import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePath,
  mapGamePath,
  joinVirtual,
  rewriteEnginePath,
  VIRTUAL_ROOTS,
} from '../platform/path.js';
import {
  indexFromPathList,
  validateGameMount,
  planEmscriptenMount,
} from '../platform/mount.js';
import {
  codeToVk,
  eventToAction,
  createInputState,
  Actions,
  VK,
  DEFAULT_KEYMAP,
} from '../platform/input.js';
import { computeBufferSize, applyCanvasSize } from '../platform/window.js';
import { createFrameLoop } from '../platform/frame-loop.js';

test('normalizePath collapses slashes and dots', () => {
  assert.equal(normalizePath('C:\\\\foo\\\\bar'), '/foo/bar');
  assert.equal(normalizePath('a/b/../c'), 'a/c');
  assert.equal(normalizePath('/a//b/./c/'), '/a/b/c');
});

test('mapGamePath maps Steam install and saves', () => {
  const game = mapGamePath(
    'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/resources/packed/graphics.a',
  );
  assert.equal(game, '/isaac/resources/packed/graphics.a');
  const save = mapGamePath('C:/Users/Player/Documents/My Games/Binding of Isaac Repentance+/persistentgamedata1.dat');
  assert.equal(save, '/saves/persistentgamedata1.dat');
  assert.equal(mapGamePath('resources/scripts/main.lua'), '/isaac/resources/scripts/main.lua');
});

test('rewriteEnginePath uses mount roots', () => {
  const p = rewriteEnginePath(
    'C:/Games/The Binding of Isaac Rebirth/mods/foo/main.lua',
    { gameRoot: 'C:/Games/The Binding of Isaac Rebirth' },
  );
  assert.equal(p, '/isaac/mods/foo/main.lua');
});

test('joinVirtual', () => {
  assert.equal(joinVirtual(VIRTUAL_ROOTS.game, 'resources', 'packed'), '/isaac/resources/packed');
});

test('mount index validates full install layout', () => {
  const paths = [
    'isaac-ng.exe',
    'resources/packed/graphics.a',
    'resources/packed/config.a',
    'resources/packed/rooms.a',
    'resources/packed/repentance.a',
    'resources/scripts/main.lua',
    'mods/example/main.lua',
  ];
  const sizes = { 'isaac-ng.exe': 9_000_000, 'resources/packed/graphics.a': 17_000_000 };
  const idx = indexFromPathList(paths, sizes);
  assert.equal(idx.hasExe, true);
  assert.equal(idx.hasResources, true);
  assert.equal(idx.hasPacked, true);
  assert.equal(idx.hasMods, true);
  const v = validateGameMount(idx);
  assert.equal(v.ok, true, v.errors.join(','));
  const plan = planEmscriptenMount(idx);
  assert.ok(plan.directories.includes('/isaac'));
  assert.ok(plan.directories.includes('/isaac/resources/packed'));
  assert.ok(plan.files.some((f) => f.path.endsWith('isaac-ng.exe')));
});

test('validateGameMount fails without exe', () => {
  const idx = indexFromPathList(['resources/foo.txt']);
  const v = validateGameMount(idx);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => e.includes('isaac-ng.exe')));
});

test('input mapping WASD and arrows', () => {
  assert.equal(eventToAction({ code: 'KeyW' }), Actions.UP);
  assert.equal(eventToAction({ code: 'ArrowLeft' }), Actions.SHOOT_LEFT);
  assert.equal(codeToVk('KeyE'), VK.E);
  assert.equal(codeToVk('Escape'), VK.ESCAPE);
  const st = createInputState();
  st.onKeyDown({ code: 'KeyA', key: 'a' });
  assert.equal(st.isActionDown(Actions.LEFT), true);
  assert.equal(st.isVkDown(VK.A), true);
  st.onKeyUp({ code: 'KeyA', key: 'a' });
  assert.equal(st.isActionDown(Actions.LEFT), false);
  assert.ok(DEFAULT_KEYMAP.Space);
});

test('computeBufferSize clamps and prefers even dims', () => {
  const s = computeBufferSize(400, 300, 2, { fitInternal: true });
  assert.ok(s.width >= 640);
  assert.ok(s.height >= 360);
  assert.equal(s.width % 2, 0);
  assert.equal(s.height % 2, 0);
  const canvas = { width: 0, height: 0 };
  const applied = applyCanvasSize(canvas, 1280, 720, 1, { fitInternal: true });
  assert.equal(canvas.width, applied.width);
  assert.equal(canvas.height, applied.height);
});

test('frame loop registers rAF and ticks', async () => {
  const queue = [];
  let id = 0;
  const handles = new Map();
  const requestFrame = (cb) => {
    const h = ++id;
    handles.set(h, cb);
    queue.push(h);
    return h;
  };
  const cancelFrame = (h) => handles.delete(h);
  const loop = createFrameLoop({ requestFrame, cancelFrame, now: () => 1000 });
  let ticks = 0;
  loop.start(() => {
    ticks += 1;
  });
  assert.equal(loop.isRunning(), true);
  // drain a few frames
  for (let i = 0; i < 5; i++) {
    const h = queue.shift();
    const cb = handles.get(h);
    handles.delete(h);
    cb(1000 + i * 16);
  }
  assert.ok(ticks >= 5);
  loop.stop();
  assert.equal(loop.isRunning(), false);
});

test('classify path of real Steam layout strings', () => {
  const steamExe =
    'C:\\\\Program Files (x86)\\\\Steam\\\\steamapps\\\\common\\\\The Binding of Isaac Rebirth\\\\isaac-ng.exe';
  assert.equal(mapGamePath(steamExe), '/isaac/isaac-ng.exe');
});
