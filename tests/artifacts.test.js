/**
 * Structural tests: shipped web artifacts and glue export surface.
 *
 * The Path B (BoxedWine x86 emulation) runtime, its packaging/benchmark
 * harness, and every assertion that covered them were removed with the
 * emulator; only the native browser deliverable is asserted here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const web = join(root, 'web');

test('static deliverable files exist', () => {
  for (const f of ['index.html', 'styles.css', 'js/app.js', 'platform/path.js']) {
    const p = join(web, f);
    assert.ok(existsSync(p), `missing ${f}`);
  }
});

test('index.html uses canvas, rAF path, mount UI, file: guard', () => {
  const html = readFileSync(join(web, 'index.html'), 'utf8');
  assert.match(html, /id="canvas"/);
  assert.match(html, /btn-pick/);
  assert.match(html, /webkitGetAsEntry|drag/i);
  assert.match(html, /file:/);
  assert.match(html, /type="module"/);
});

test('index.html advertises no removed x86 emulation page', () => {
  const html = readFileSync(join(web, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /boxedwine|emu\/index\.html/i);
  assert.ok(!existsSync(join(web, 'emu')), 'web/emu must stay removed');
});

test('app.js wires requestAnimationFrame loop and mount controllers', () => {
  const js = readFileSync(join(web, 'js/app.js'), 'utf8');
  assert.match(js, /createFrameLoop/);
  assert.match(js, /createMountController/);
  assert.match(js, /isaac_init|createIsaacHost/);
  assert.match(js, /showDirectoryPicker|mountFromPicker/);
  assert.match(js, /mountFromDrop/);
  assert.match(js, /mountFromServerGame/);
  assert.match(js, /tryAutoServerMount|\/@game-index\.json/);
  assert.match(js, /menu lane: latched open|setKey\(0x1b/);
  assert.match(js, /processInputPrepoll/);
  assert.match(js, /toA1f280AxisSamples/);
  assert.match(js, /dirBitsMerged/);
});

test('WASD maps onto recovered a1f280 dirBits, not Game position fields', async () => {
  const { createInputBridge, BRIDGE_VK } = await import('../scripts/decomp/frame-input-bridge.mjs');
  const { applyA1f280VcallGatePurePosts } = await import('../scripts/decomp/process-input-residual.mjs');
  const bridge = createInputBridge();
  bridge.setKey(BRIDGE_VK.D, true);
  const posts = applyA1f280VcallGatePurePosts(bridge.toA1f280AxisSamples());
  const axis = posts.find((row) => row.slot === 'A1F280_AXIS_PAIR0');
  assert.ok(axis);
  assert.equal(axis.x, 1);
  assert.equal(axis.y, 0);
  assert.ok((axis.dirBitsMerged >>> 0) !== 0);
  const js = readFileSync(join(web, 'js/app.js'), 'utf8');
  assert.doesNotMatch(js, /positionXBits\s*=/);
  assert.match(js, /applyDirBitsToCapturedEntity/);
  assert.match(js, /entitiesSnapshotUrl/);
  assert.match(js, /setRenderRecapture/);
  assert.match(js, /isNativeFrameMountPath/);
  assert.match(js, /dirBits:\s*lastProcessInput\.dirBitsMerged\s*\|\|\s*0/);
  assert.doesNotMatch(js, /!menuOpen\s*&&\s*capturedPlayerAddr/);
  assert.match(js, /in-run sprites: uploaded/);
});

test('captured WASD writes Entity+_pos, not Game position fields', async () => {
  const { createLiveGuestMemory } = await import('../web/js/capture-wiring.js');
  const {
    applyDirBitsToCapturedEntity,
    ENTITY_POS_OFF,
    ENTITY_VEL_OFF,
  } = await import('../scripts/decomp/game-state-snapshot.mjs');
  const blob = new Uint8Array(0x368);
  const view = new DataView(blob.buffer);
  view.setFloat32(ENTITY_POS_OFF, 100, true);
  view.setFloat32(ENTITY_POS_OFF + 4, 200, true);
  const guest = createLiveGuestMemory();
  guest.addRegion(0x1000, blob);
  const moved = applyDirBitsToCapturedEntity(guest, 0x1000, { axisX: 1, axisY: 0, speed: 5, tickScale: 1 });
  assert.ok(moved);
  assert.equal(moved.x, 105);
  assert.equal(moved.y, 200);
  assert.equal(view.getFloat32(ENTITY_VEL_OFF, true), 5);

  view.setFloat32(ENTITY_POS_OFF, 100, true);
  view.setFloat32(ENTITY_POS_OFF + 4, 200, true);
  const diag = applyDirBitsToCapturedEntity(guest, 0x1000, { dirBits: 0x2 | 0x8, tickScale: 1 });
  assert.ok(diag);
  const step = 5 / Math.SQRT2;
  assert.ok(Math.abs(diag.vx - step) < 1e-6);
  assert.ok(Math.abs(diag.vy - step) < 1e-6);
  const again = applyDirBitsToCapturedEntity(guest, 0x1000, { dirBits: 0x2 | 0x8, tickScale: 1 });
  assert.ok(Math.abs(again.vx - step) < 1e-6, "strafe must not feed |vel| back into speed");
});

test('browser mount controller exposes server auto-mount', async () => {
  const { createMountController } = await import('../platform/browser-mount.js');
  const seen = [];
  const ctl = createMountController({
    requireValid: true,
    onMounted: (mount) => {
      seen.push(mount);
    },
  });
  const mount = await ctl.mountFromServerGame({
    files: [
      { path: 'isaac-ng.exe', size: 100 },
      { path: 'resources/font/teammeatfont10.fnt', size: 10 },
      { path: 'resources/gfx/ui/main menu/titlemenu.anm2', size: 20 },
    ],
  });
  assert.equal(mount.source, 'server');
  assert.equal(mount.validation.ok, true);
  assert.equal(mount.serverFiles.length, 3);
  assert.equal(mount.serverFiles[0].url, '/@game/isaac-ng.exe');
  assert.match(mount.serverFiles[2].url, /titlemenu\.anm2$/);
  assert.equal(seen.length, 1);
});

test('wasm build artifacts present (after build)', () => {
  const js = join(web, 'isaac-host.js');
  const wasm = join(web, 'isaac-host.wasm');
  assert.ok(existsSync(js), 'isaac-host.js missing — run npm run build:wasm');
  assert.ok(existsSync(wasm), 'isaac-host.wasm missing');
  assert.ok(statSync(wasm).size > 1000, 'wasm too small');
  const src = readFileSync(js, 'utf8');
  // modularized, not bare node require as entry
  assert.match(src, /createIsaacHost|moduleRtn|export default/);
  assert.doesNotMatch(src, /\brequire\(['\"]fs['\"]\)/);
});

test('build flags documented', () => {
  const flags = join(root, 'docs', 'build-flags.json');
  assert.ok(existsSync(flags));
  const j = JSON.parse(readFileSync(flags, 'utf8'));
  assert.ok(Array.isArray(j.flags));
  assert.ok(j.flags.some((f) => String(f).includes('WEBGL')));
});

test('native host exports expected symbols in source', () => {
  const cpp = readFileSync(join(root, 'native', 'isaac_host.cpp'), 'utf8');
  for (const sym of [
    'isaac_init',
    'isaac_tick',
    'isaac_load_pe',
    'isaac_find_sig',
    'isaac_lua_load_mod_script',
    'isaac_set_mounted',
    'isaac_count_nonblack_samples',
  ]) {
    assert.match(cpp, new RegExp(sym));
  }
});
