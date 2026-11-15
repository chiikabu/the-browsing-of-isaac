// Rounds 124 and 125: the debug console's row in the game's OPTIONS list, the options.ini
// line behind it, and what IMPORT FILE takes (menu_overlay.mjs getIniOption / setIniOption /
// saveFileKind; play.mjs; boot_web.mjs; the lift patch that keeps a new save writable).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIniOption, setIniOption, saveFileKind, consoleRowStep, rowFramesState } from '../scripts/recomp/web/menu_overlay.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => readFileSync(join(root, 'scripts', 'recomp', ...p), 'utf8');
const bytes = (s) => new TextEncoder().encode(s);

test('an option is read as the file has it: the last line that sets it, spaces aside', () => {
  const ini = '[Options]\r\nLanguage=0\r\nEnableDebugConsole=0\r\nMusicVolume=0.4000\r\n';
  assert.equal(getIniOption(ini, 'EnableDebugConsole'), '0');
  assert.equal(getIniOption(ini, 'MusicVolume'), '0.4000');
  assert.equal(getIniOption(ini, 'VSync'), null, 'not in the file');
  assert.equal(getIniOption('', 'EnableDebugConsole'), null);
  assert.equal(getIniOption('  EnableDebugConsole = 1  \n', 'EnableDebugConsole'), '1');
  assert.equal(getIniOption('EnableDebugConsole=0\nEnableDebugConsole=1\n', 'EnableDebugConsole'), '1', 'the last one');
  assert.equal(getIniOption('XEnableDebugConsole=1\nEnableDebugConsoleX=1\n', 'EnableDebugConsole'), null, 'the whole name, not a part of another');
});

test('setting an option changes that line and nothing else', () => {
  const ini = '[Options]\r\nLanguage=0\r\nEnableDebugConsole=0\r\nMusicVolume=0.4000\r\n';
  assert.equal(setIniOption(ini, 'EnableDebugConsole', 1), '[Options]\r\nLanguage=0\r\nEnableDebugConsole=1\r\nMusicVolume=0.4000\r\n');
  assert.equal(setIniOption(ini, 'EnableDebugConsole', 0), ini, 'already so');
  assert.ok(setIniOption(ini, 'EnableDebugConsole', 0) === ini, 'the same string comes back: nothing to write');
  // the line twice: neither keeps the old value
  assert.equal(setIniOption('[Options]\nEnableDebugConsole=0\nA=1\nEnableDebugConsole=0\n', 'EnableDebugConsole', 1),
    '[Options]\nEnableDebugConsole=1\nA=1\nEnableDebugConsole=1\n');
  // spaces around the sign are tidied on the line that is set, and only there
  assert.equal(setIniOption('A = 1\n EnableDebugConsole = 0 \nB=2\n', 'EnableDebugConsole', 1), 'A = 1\nEnableDebugConsole=1\nB=2\n');
  // a name that is part of another is not that option
  assert.equal(setIniOption('[Options]\nXEnableDebugConsole=0\n', 'EnableDebugConsole', 1), '[Options]\nEnableDebugConsole=1\nXEnableDebugConsole=0\n');
});

test('a file without the line gains it under [Options], in the file\'s own line endings', () => {
  assert.equal(setIniOption('[Options]\r\nLanguage=0\r\n', 'EnableDebugConsole', 1), '[Options]\r\nEnableDebugConsole=1\r\nLanguage=0\r\n');
  assert.equal(setIniOption('[Options]\nLanguage=0\n', 'EnableDebugConsole', 1), '[Options]\nEnableDebugConsole=1\nLanguage=0\n');
  assert.equal(setIniOption('[Options]', 'EnableDebugConsole', 1), '[Options]\nEnableDebugConsole=1\n', 'a header with no line end');
  assert.equal(setIniOption('﻿[Options]\r\nA=1\r\n', 'EnableDebugConsole', 0), '﻿[Options]\r\nEnableDebugConsole=0\r\nA=1\r\n', 'a byte order mark stays first');
  assert.equal(setIniOption('A=1', 'EnableDebugConsole', 1), 'A=1\nEnableDebugConsole=1\n', 'no header: at the end');
  assert.equal(setIniOption('A=1\r\n', 'EnableDebugConsole', 1), 'A=1\r\nEnableDebugConsole=1\r\n');
  assert.equal(setIniOption('', 'EnableDebugConsole', 1), 'EnableDebugConsole=1\n');
  // what was set is what is read back
  for (const ini of ['', '[Options]\r\nA=1\r\n', 'EnableDebugConsole=0\nEnableDebugConsole=0\n']) assert.equal(getIniOption(setIniOption(ini, 'EnableDebugConsole', 1), 'EnableDebugConsole'), '1');
});

test('IMPORT FILE knows a save by its first bytes, whatever it is called', () => {
  assert.equal(saveFileKind(bytes('ISAACNGSAVE09R  \u0001\u0002')), 'persistentgamedata');
  assert.equal(saveFileKind(bytes('ISAACNGSAVE06R  ')), 'persistentgamedata', 'an older version the game still reads');
  assert.equal(saveFileKind(bytes('ISAACNG_GSR0018')), 'gamestate');
  assert.equal(saveFileKind(bytes('ISAACNGSAVE')), null, 'cut short');
  assert.equal(saveFileKind(bytes('\u0089PNG\r\n')), null, 'a picture');
  assert.equal(saveFileKind(bytes('PK\u0003\u0004')), null, 'a zip is not a bare save (its own branch reads it)');
  assert.equal(saveFileKind(new Uint8Array(0)), null);
  assert.equal(saveFileKind(null), null);
});

test('the page: no accept list on the picker, and a file that is not a save is refused', () => {
  const html = src('web', 'play.html'), page = src('web', 'play.mjs');
  const input = /<input id="import-file"[^>]*>/.exec(html);
  assert.ok(input, 'the picker is there');
  assert.ok(!/accept=/.test(input[0]), 'no accept list: an iPhone greys out a .dat under one (issue 17)');
  assert.ok(page.includes('const kind = saveFileKind(buf);') && page.includes("if (!kind) throw new Error('NOT A SAVE FILE');"), 'told by its bytes, and refused when it is not one');
  assert.ok(page.indexOf("if (!kind) throw new Error('NOT A SAVE FILE');") < page.indexOf('await writeSaves(db, items, false);\n  setTimeout(() => location.reload(), 1500);'), 'before anything is written');
});

test('the page: the console is off until asked for, and its switch is the game\'s own byte', () => {
  const page = src('web', 'play.mjs'), boot = src('web', 'boot_web.mjs');
  assert.match(page, /'EnableDebugConsole=0', 'MaxScale=99'/, 'a first visit gets it off, as the game ships it');
  assert.ok(!/EnableDebugConsole=1/.test(page), 'nothing on the page turns it on unasked');
  assert.ok(page.includes('const consoleUsable = !(coarsePointer || params.get(\'touch\') === \'1\');'), 'not offered where there are no keys to type with');
  assert.ok(page.includes("setIniOption(text, 'EnableDebugConsole', on ? 1 : 0)"), 'the stored options.ini follows the row');
  // the two bytes: the Manager at [0x00c7169c]; Options.EnableDebugConsole +0x2a398 (the game's Lua setter 0x00897370),
  // Options.StreamerMode +0x2a3e0 (what the row with id 22 toggles, 0x009b2f11)
  assert.match(boot, /const MANAGER_PTR = 0x00c7169c;/);
  assert.match(boot, /const OPTION_BYTES = \{ console: 0x2a398, streamer: 0x2a3e0 \};/);
  assert.ok(boot.includes("const off = Object.prototype.hasOwnProperty.call(OPTION_BYTES, name) ? OPTION_BYTES[name] : 0;"), 'only the two it names');
  assert.ok(boot.includes('return mgr && mgr + off < H.length ? mgr + off : 0;'), 'never before the game has a Manager');
  // the console key is still the game's own, where the game put it
  assert.ok(boot.includes("Backquote: 'grave',"), 'the key left of 1');
  assert.ok(!/F2: 'grave'/.test(boot), 'F2 stays F2: mods bind it');
});

test('the page: the console is a row of the OPTIONS list, not a paper of its own (round 125)', () => {
  const page = src('web', 'play.mjs'), boot = src('web', 'boot_web.mjs');
  assert.ok(!/consoleTag|console-tag|toggleConsole/.test(page), 'the hint paper of round 124 is gone');
  assert.ok(!/ev\.code === 'KeyC'/.test(page), 'and its C key');
  // where the row is: the main menu's options object, its sprite, the animation of the row with id 22
  assert.match(page, /const MENU_OPTIONS_OFF = 0xcecc, OPTIONS_SPRITE_OFF = 0x24;/);
  assert.match(page, /const CONSOLE_ROW_ANIM = 'StreamerMode';/);
  // the two frames, as OptionsMenu.anm2 has them and as they become: the name's crop goes to the
  // word CONSOLE of the game's own sheet (0,160 96x32), the cursor moves in beside it
  assert.ok(page.includes('{ layer: 13, was: [128, 64, 112, 16, -54, 19, 1, 1, 16, 16], now: [0, 160, 96, 32, -38, 12, 1, 1, 16, 16] },'));
  assert.ok(page.includes('{ layer: 5, was: [235, 24, 18, 22, -69, 18, 1, 1, 16, 16], now: [235, 24, 18, 22, -57, 17, 1, 1, 16, 16] },'));
  assert.ok(page.includes("if (plan === 'differs') { rowState = 'not the frames expected'; break; }"), 'nothing is written into a sprite that is not the one expected');
  assert.ok(page.indexOf("if (plan === 'differs')") < page.indexOf('G.swapFloats(found[k], f.was, f.now)'), 'the look comes before the write');
  assert.ok(page.includes("const tendConsoleRow = () => { if (consoleUsable && gameReady && relabelConsoleRow() === 'console') syncConsoleRow(); };"),
    'the row is tied to the console only once it says CONSOLE');
  // the one write the page can make into the game: floats, and only over the values it expects
  assert.ok(boot.includes("if (!have.every((v, i) => v === Math.fround(expect[i]))) return 'differs';"));
  assert.ok(boot.indexOf("return 'differs';") < boot.indexOf('next.forEach((v, i) => view.setFloat32(i * 4, v, true));'), 'compared first');
  assert.ok(boot.includes('|| va < 0x10000 || va + expect.length * 4 > H.length) return \'unmapped\';'), 'inside the heap');
});

test('the row and the console\'s switch: who follows whom', () => {
  const st = { seen: false, console: false, row: false };
  // first sight: the row takes the console's value, whatever it was, and nothing is stored
  assert.deepEqual(consoleRowStep(st, true, false), { write: { name: 'streamer', value: true }, store: null });
  assert.deepEqual(st, { seen: true, console: true, row: true });
  assert.deepEqual(consoleRowStep(st, true, true), { write: null, store: null }, 'nothing changed');
  // the player turns the row off: the console follows and the choice is stored
  assert.deepEqual(consoleRowStep(st, true, false), { write: { name: 'console', value: false }, store: false });
  assert.deepEqual(consoleRowStep(st, false, false), { write: null, store: null });
  // and on
  assert.deepEqual(consoleRowStep(st, false, true), { write: { name: 'console', value: true }, store: true });
  // a mod sets the console's switch: the row follows, nothing is stored
  assert.deepEqual(consoleRowStep(st, false, true), { write: { name: 'streamer', value: false }, store: null });
  assert.deepEqual(st, { seen: true, console: false, row: false });
  // both moved between two looks: the row is the player's hand
  assert.deepEqual(consoleRowStep(st, true, true), { write: null, store: true }, 'they already agree: only the store is owed');
  // first sight with the two equal: nothing to write
  assert.deepEqual(consoleRowStep({ seen: false, console: false, row: false }, false, false), { write: null, store: null });
  assert.deepEqual(consoleRowStep({ seen: false, console: false, row: false }, false, true), { write: { name: 'streamer', value: false }, store: null },
    'a row left on by an earlier build does not turn the console on');
  // the game is not up: nothing
  const cold = { seen: false, console: false, row: false };
  assert.deepEqual(consoleRowStep(cold, null, null), { write: null, store: null });
  assert.equal(cold.seen, false);
});

test('the row\'s frames: written only over the game\'s own values', () => {
  const frames = [{ was: [1, 2, 3], now: [4, 5, 6] }, { was: [7, 8], now: [9, 8] }];
  assert.equal(rowFramesState([[1, 2, 3], [7, 8]], frames), 'swap', 'as the game loaded them');
  assert.equal(rowFramesState([[4, 5, 6], [9, 8]], frames), 'done', 'already the new ones');
  assert.equal(rowFramesState([[4, 5, 6], [7, 8]], frames), 'swap', 'one of each: finish it');
  assert.equal(rowFramesState([[1, 2, 3], [7, 9]], frames), 'differs', 'one value off: another sprite');
  assert.equal(rowFramesState([[1, 2, 3], null], frames), 'differs', 'a layer that is not there');
  assert.equal(rowFramesState([[1, 2], [7, 8]], frames), 'differs', 'a shorter read');
  assert.equal(rowFramesState([[1, 2, 3, 0], [7, 8]], frames), 'differs');
});

test('the page: its own keys stand aside while the console is open', () => {
  const page = src('web', 'play.mjs');
  assert.match(page, /const GAME_PTR = 0x00c71678, CONSOLE_OFF = 0x68d78;/);
  const guard = page.indexOf("if ((ev.code === 'KeyF' || ev.code === 'KeyN') && consoleOpen()) return;");
  assert.ok(guard > 0, 'F and N are letters of a command then');
  assert.ok(guard < page.indexOf("if (ev.code === 'KeyF' && !ev.repeat"), 'tested before fullscreen is asked for');
  assert.ok(guard < page.indexOf("if (ev.code === 'KeyN' && !ev.repeat"), 'and before the FPS readout flips');
});

test('the lift: mods and the console do not make a new save read-only', () => {
  const lp = src('lift', 'lift_patches.py');
  const at = lp.indexOf('("0x00959618",');
  assert.ok(at > 0, 'the block patch is in the table');
  const row = lp.slice(at, lp.indexOf('# Round 52: the save-select screen', at));
  assert.ok(row.includes("'  RECOMP_VA(0x959618u);\\n  ubf00_1 = (uint8_t)(!ZF);\\n  if (ubf00_1) {\\n    goto L_00959622;\\n  }\\n'"), 'it replaces the branch taken when a mod is enabled');
  assert.ok(row.includes('LIFT-PATCH 0x00959618 (round 124)') && /\*\/\\n  goto L_00959652;\\n'\),/.test(row), 'with the exit that answers no');
  assert.ok(!/L_0095965b/.test(row.split('*/')[1] || ''), 'the netplay branch is not what it jumps to');
});
