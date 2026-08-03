/**
 * Structural tests: shipped web artifacts and glue export surface.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
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

test('app.js wires requestAnimationFrame loop and mount controllers', () => {
  const js = readFileSync(join(web, 'js/app.js'), 'utf8');
  assert.match(js, /createFrameLoop/);
  assert.match(js, /createMountController/);
  assert.match(js, /isaac_init|createIsaacHost/);
  assert.match(js, /showDirectoryPicker|mountFromPicker/);
  assert.match(js, /mountFromDrop/);
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

test('Path B Boxedwine emu artifacts present', () => {
  const emu = join(web, 'emu');
  for (const f of ['index.html', 'boxedwine.js', 'boxedwine.wasm', 'boxedwine-shell.js', 'README.md']) {
    assert.ok(existsSync(join(emu, f)), 'missing emu/' + f);
  }
  assert.ok(statSync(join(emu, 'boxedwine.wasm')).size > 100_000);
});

test('Path B page is game-only, fullscreen-capable, and self-configuring without reload', () => {
  const html = readFileSync(join(web, 'emu', 'index.html'), 'utf8');
  assert.match(html, /history\.replaceState/);
  assert.doesNotMatch(html, /location\.replace\(/);
  assert.match(html, /requestFullscreen/);
  assert.match(html, /#controls, #console \{ display: none !important; \}/);
  assert.match(html, /_boxedwine_inject_key/);
});

test('standalone packer embeds every runtime dependency and proprietary output is ignored', () => {
  const packer = readFileSync(join(root, 'scripts', 'build-standalone-html.mjs'), 'utf8');
  for (const name of [
    'boxedwine.wasm',
    'boxedwine.zip',
    'debian10.zip',
    'isaac-savedir.zip',
    'isaac-phase6-full.zip',
    'isaac-phase6-full-jit-modules.zip',
  ]) {
    assert.match(packer, new RegExp(name.replaceAll('.', '\\.')));
  }
  assert.match(packer, /boxedwineTakeEmbeddedFile/);
  assert.match(packer, /boxedwineEmbeddedParseProgress/);
  const ignore = readFileSync(join(root, '.gitignore'), 'utf8');
  assert.match(ignore, /standalone.*\.html/);
  const shell = readFileSync(join(web, 'emu', 'boxedwine-shell.js'), 'utf8');
  assert.match(shell, /boxedwineTakeEmbeddedFile\('boxedwine\.wasm'\)/);
  assert.match(shell, /boxedwineTakeEmbeddedFile\(filename\)/);
  const server = readFileSync(join(root, 'scripts', 'serve-standalone.mjs'), 'utf8');
  assert.match(server, /Cross-Origin-Embedder-Policy/);
  assert.match(server, /createReadStream/);
});

test('offline PWA builder versions, verifies, and caches the complete release', () => {
  const builder = readFileSync(join(root, 'scripts', 'build-offline-pwa.mjs'), 'utf8');
  const bootstrap = readFileSync(join(web, 'emu', 'offline-bootstrap.js'), 'utf8');
  const worker = readFileSync(join(web, 'emu', 'offline-sw.js'), 'utf8');
  for (const name of [
    'boxedwine.wasm',
    'boxedwine.zip',
    'debian10.zip',
    'isaac-savedir.zip',
    'isaac-phase6-full.zip',
    'isaac-phase6-full-jit-modules.zip',
  ]) {
    assert.match(builder, new RegExp(name.replaceAll('.', '\\.')));
  }
  assert.match(builder, /manifest\.webmanifest/);
  assert.match(builder, /icon-192\.png/);
  assert.match(builder, /icon-512\.png/);
  assert.match(builder, /storage=indexeddb/);
  assert.match(bootstrap, /navigator\.storage\.persist/);
  assert.match(bootstrap, /integrity: asset\.integrity/);
  assert.match(bootstrap, /READY_MARKER/);
  assert.match(worker, /self\.addEventListener\("fetch"/);
  assert.match(worker, /self\.addEventListener\("install"/);
  assert.match(worker, /integrity: asset\.integrity/);
});

test('IndexedDB failure keeps bundled JIT cache and session startup available', () => {
  const shell = readFileSync(join(web, 'emu', 'boxedwine-shell.js'), 'utf8');
  assert.match(shell, /IndexedDB unavailable; using bundled JIT cache in memory/);
  assert.match(shell, /catch \(error\)[\s\S]*loadServerCache\(\)/);
  assert.match(shell, /unable to sync persistent folder; continuing in this session/);
});

test('Boxedwine rebuild helpers require explicit deployment', () => {
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.doesNotMatch(packageJson.scripts['build:boxedwine'], /--deploy/);

  for (const name of ['rebuild-boxedwine.mjs', 'rebuild-gl-present.mjs']) {
    const source = readFileSync(join(root, 'scripts', name), 'utf8');
    assert.match(source, /process\.argv\.includes\(["']--deploy["']\)/);
    assert.match(source, /if \(deploy\)[\s\S]*copyFileSync/);
    assert.match(source, /without deployment/);
    assert.match(source, /choose either --deploy or --no-deploy/);
  }
});

test('benchmark overlay builder is deterministic, private, and guest-signalled', () => {
  const builder = readFileSync(join(root, 'scripts', 'make-benchmark-overlay.py'), 'utf8');
  assert.match(builder, /ZIP_STORED/);
  assert.match(builder, /1980, 1, 1/);
  assert.match(builder, /EnableMods=0/);
  assert.match(builder, /EnableMods=1/);
  assert.match(builder, /ISAACNGSAVE/);
  assert.match(builder, /MC_POST_GAME_STARTED/);
  assert.match(builder, /MC_POST_NEW_ROOM/);
  assert.match(builder, /MC_POST_UPDATE/);
  assert.match(builder, /GetStartSeedString/);
  assert.match(builder, /GetStartingRoomIndex/);
  assert.match(builder, /guest_frames=30/);
  assert.match(builder, /refusing to overwrite an input archive/);
});

test('benchmark overlay builds byte-identically with the expected private members', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'isaac-benchmark-overlay-'));
  try {
    const builder = join(root, 'scripts', 'make-benchmark-overlay.py');
    const seeded = join(web, 'emu', 'isaac-savedir-seeded.zip');
    const first = join(temporary, 'first.zip');
    const second = join(temporary, 'second.zip');
    for (const output of [first, second]) {
      const result = spawnSync('python', [builder, '--seed-overlay', seeded, '--output', output], {
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
    assert.deepEqual(readFileSync(first), readFileSync(second));

    const inspect = [
      'import json,sys',
      'from zipfile import ZipFile',
      'z=ZipFile(sys.argv[1])',
      'n=z.namelist()',
      'o=[z.read(x).decode("utf-8") for x in n if x.endswith("/options.ini")]',
      'm=[z.read(x).decode("utf-8") for x in n if x.endswith("/mods/isaac-bench/main.lua")]',
      'print(json.dumps({"names":n,"options":o,"mods":m}))',
    ].join(';');
    const result = spawnSync('python', ['-c', inspect, first], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const archive = JSON.parse(result.stdout);
    assert.equal(archive.names.filter((name) => /persistentgamedata[1-3]\.dat$/.test(name)).length, 6);
    assert.equal(archive.names.filter((name) => name.endsWith('/mods/isaac-bench/main.lua')).length, 2);
    assert.equal(archive.names.filter((name) => name.endsWith('/mods/isaac-bench/metadata.xml')).length, 2);
    assert.ok(archive.options.every((text) => text.includes('EnableMods=1') && !text.includes('EnableMods=0')));
    assert.ok(archive.mods.every((text) => text.includes('[ISAAC_BENCH] floor_ready') && text.includes('guest_frames=30')));
    assert.ok(archive.names.every((name) => !/\.(?:exe|dll)$/i.test(name)));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
