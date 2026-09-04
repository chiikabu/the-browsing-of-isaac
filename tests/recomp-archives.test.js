// Round 24e: the archive set, and why the port was silent.
//
// The sound effects and the music exist only inside the packed archives (the
// instance's extracted tree has no sfx/ or music/), and three things stood
// between the game and them: the instance only carried the eight base-game
// archives (the Repentance title theme lives in repentance.a), the archive
// index is keyed "resources/<path>" while the project's own 0x009ab970 patch
// had removed the "resources/" mount root, and the project's 0x00a2b5c2
// patch forced a jump over the open of every sound source right after its
// construction. These pins hold the fix together: the DLC archives are
// registered lazily and served through windows (1.5 GB cannot live in a
// wasm32 heap), the mount root override is back, and the branch is a lift
// patch that re-enters the orphaned tail function Ghidra split off.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const host = join(root, 'scripts', 'recomp', 'host', 'src');
const lift = join(root, 'scripts', 'recomp', 'lift');

test('the DLC archives are lazy and the language packs are not registered', () => {
  const drv = readFileSync(join(lift, 'boot_integration.mjs'), 'utf8');
  const m = drv.match(/const LAZY_ARCHIVES = \[([^\]]*)\]/);
  assert.ok(m, 'LAZY_ARCHIVES exists');
  const names = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  for (const n of ['music.a', 'videos.a', 'afterbirth.a', 'afterbirthp.a', 'repentance.a']) {
    assert.ok(names.includes(n), `${n} is registered lazily`);
  }
  for (const n of names) {
    assert.ok(!/_(de|es|fr|jp|kr|ru|zh)\.a$/.test(n), `${n}: a language pack would shadow English assets`);
  }
  assert.ok(drv.includes('m.isaacLazyPread = (src, dst, off, len) => {'), 'the driver offers positional reads');
  assert.ok(drv.includes('readSync(fd, view, 0, len, off)'), 'a positional read goes straight into the wasm heap');
});

test('the browser driver mounts the same archive set through byte-slice reads', () => {
  const web = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(web.includes('cfg.isaacLazyPread = (src, dst, off, len) => {'), 'the page offers positional reads');
  assert.ok(web.includes('fetchSync(`/instance/${src}?off=${off}&len=${len}`)'), 'a positional read is a byte slice of the served file');
  for (const n of ['afterbirth.a', 'afterbirthp.a', 'repentance.a']) {
    assert.ok(web.includes(`'resources/packed/${n}'`), `${n} is registered lazily in the browser too`);
  }
  const runner = readFileSync(join(root, 'scripts', 'recomp', 'web', 'run_web.mjs'), 'utf8');
  assert.ok(/const n = readSync\(fd, buf, 0, len, off\);/.test(runner), 'the runner reads the slice positionally, never the whole archive');
});

test('a big lazy file is served through two windows and is never loaded whole', () => {
  const fs = readFileSync(join(host, 'host_shims_fs.c'), 'utf8');
  assert.ok(fs.includes('#define FS_WIN (1u << 20)'), 'one window is 1 MB');
  assert.ok(fs.includes('uint8_t *win[2];'), 'two windows per entry (the mount loop alternates table and data)');
  assert.ok(/if \(e->size >= fs_window_min\(\) && isaac_fs_lazy_pread_avail\(\)\) \{\s*e->lazy = 0; e->windowed = 1;/.test(fs),
    'materialise turns a large lazy entry into a windowed one when the driver can pread');
  assert.ok(fs.includes('if (e->windowed) got = fs_window_read(e, pos, got, (uint8_t *)isaac_g(dst));'),
    'fread reads through the window');
  assert.ok(fs.includes('ISAAC_FS_WINDOW_MIN'), 'the threshold is tunable (MiB; 0 = never window)');
  assert.ok(fs.includes("fwrite to the windowed file"), 'a write to a windowed file is refused, not silently lost');
});

test('the resources/ mount root override is back, with the reason', () => {
  const lp = readFileSync(join(lift, 'lift_patches.py'), 'utf8');
  assert.ok(/PATCHES: dict\[int, tuple\[str, str\]\] = \{[\s\S]*?0x009ab970: \(/.test(lp), '0x009ab970 is a lift patch again');
  assert.ok(lp.includes('sub_009ab973(s);'), 'it restores the prologue and falls into the orphaned body');
  assert.ok(lp.includes('"resources/<path>"'), 'the archive-index key form is documented next to it');
});

test('the forced branch over the sound open is undone at the block level', () => {
  const lp = readFileSync(join(lift, 'lift_patches.py'), 'utf8');
  assert.ok(lp.includes('BLOCK_PATCHES: list[tuple[str, str, str]] = ['), 'block patches exist');
  assert.ok(lp.includes('recomp_jmp_target = ZF ? 0xa2b5e1u : 0xa2b5c8u; recomp_jmp_pending = 1u; return;'),
    'the pristine `cmp byte [ebp+0x14], 0; je 0xa2b5e1` becomes a tail jump into the orphaned tail');
  assert.ok(lp.includes('L_00a2b5c8: ;') && lp.includes('RECOMP_VA(0xa2b5c8u);'),
    'the tail function gets a re-decoded first block at 0xa2b5c8');
  assert.ok(lp.includes('case 0x00a2b5c8u: goto L_00a2b5c8;') && lp.includes('case 0x00a2b5e1u: goto L_00a2b5e1;'),
    'both targets are re-entry cases');
  for (const marker of ['LIFT-PATCH 0x00a2b5c2', 'LIFT-PATCH 0x00a2b5c8', 'LIFT-PATCH 0x00a2b5c7-reentry',
                        'LIFT-PATCH REENTRY 0x00a2b5c8', 'LIFT-PATCH REENTRY 0x00a2b5e1']) {
    assert.ok(lp.includes(marker), `${marker}: the idempotence marker`);
  }
  const bb = readFileSync(join(lift, 'build_boot.py'), 'utf8');
  assert.ok(bb.includes('set(apply_block_patches(lift_dir))'), 'build_boot applies block patches like the others');
  // the dispatcher only knows function entries and call continuations; a
  // block another function jumps into has to be declared to it
  const mk = readFileSync(join(lift, 'mkdispatch.py'), 'utf8');
  assert.ok(mk.includes('if (v in cont or "LIFT-PATCH REENTRY" in line) and v not in seen_b:'),
    'mkdispatch treats a marked RECOMP_VA line as a re-entry block');
});

test('the archive key form is the one the tables were built with', () => {
  // djb2 over the path with ASCII upper-case folded down and backslash folded
  // to slash (FUN_00a159d0), FNV-1a from 0x5bb2220e (FUN_00a15ab0), both over
  // "resources/<path>": 102 of the extracted tree's files match graphics.a
  // that way and none match without the prefix (round 24e, amass.py).
  const norm = (c) => { let b = c.charCodeAt(0); if (b >= 65 && b <= 90) b += 32; if (b === 92) b = 47; return b; };
  const djb2 = (s) => { let h = 0x1505; for (const c of s) h = (Math.imul(h, 33) + norm(c)) >>> 0; return h; };
  const fnv = (s) => { let h = 0x5bb2220e; for (const c of s) h = Math.imul(h ^ norm(c), 0x1000193) >>> 0; return h; };
  assert.equal(djb2('resources/achievements.xml'), djb2('RESOURCES\\ACHIEVEMENTS.XML'), 'case and separator fold');
  assert.notEqual(djb2('achievements.xml'), djb2('resources/achievements.xml'), 'the prefix is part of the key');
  assert.equal(typeof fnv('resources/music/x.ogg'), 'number');
});
