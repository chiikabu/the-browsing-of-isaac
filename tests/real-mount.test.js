import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { indexFromPathList, validateGameMount, planEmscriptenMount } from '../platform/mount.js';
import { mapGamePath, rewriteEnginePath, VIRTUAL_ROOTS } from '../platform/path.js';

const gameDir =
  process.env.ISAAC_GAME_DIR ||
  'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth';

function walk(dir, base = '') {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = base ? base + '/' + name : name;
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      // do not recurse deep into mods huge trees — shallow for packed/scripts
      if (rel === 'mods' || rel.startsWith('mods/')) {
        out.push(rel + '/.keep');
        continue;
      }
      out.push(...walk(full, rel.replace(/\\/g, '/')));
    } else {
      out.push({ path: rel.replace(/\\/g, '/'), size: st.size });
    }
  }
  return out;
}

test('real Steam install indexes as valid game mount', (t) => {
  if (!existsSync(join(gameDir, 'isaac-ng.exe'))) {
    t.skip('game not installed');
    return;
  }
  const files = walk(gameDir);
  const paths = files.map((f) => (typeof f === 'string' ? f : f.path));
  const sizes = {};
  for (const f of files) {
    if (typeof f === 'object') sizes[f.path] = f.size;
  }
  const idx = indexFromPathList(paths, sizes);
  const v = validateGameMount(idx);
  assert.equal(v.ok, true, v.errors.join('; '));
  assert.ok(idx.hasPacked);
  const plan = planEmscriptenMount(idx);
  assert.ok(plan.files.some((f) => f.path.endsWith('isaac-ng.exe')));
  assert.ok(plan.directories.some((d) => d.includes('resources/packed')));
  // path rewrite for a real file
  const host = join(gameDir, 'resources', 'scripts', 'main.lua').replace(/\\/g, '/');
  assert.equal(mapGamePath(host), '/isaac/resources/scripts/main.lua');
  assert.equal(
    rewriteEnginePath(host, { gameRoot: gameDir.replace(/\\/g, '/') }),
    '/isaac/resources/scripts/main.lua',
  );
  assert.equal(VIRTUAL_ROOTS.game, '/isaac');
});
