// Round 124: the debug console's switch on the game's OPTIONS screen, the options.ini
// line behind it, and what IMPORT FILE takes (menu_overlay.mjs getIniOption / setIniOption /
// saveFileKind; play.mjs; boot_web.mjs; the lift patch that keeps a new save writable).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIniOption, setIniOption, saveFileKind } from '../scripts/recomp/web/menu_overlay.mjs';

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
  assert.match(page, /const OPTIONS_SCREEN = 10;/);
  assert.ok(page.includes("if (ev.code === 'KeyC' && !ev.ctrlKey && !ev.altKey && !ev.metaKey && consoleTagUp()) {"), 'C, on the OPTIONS screen only');
  assert.ok(page.includes('const consoleUsable = !(coarsePointer || params.get(\'touch\') === \'1\');'), 'not offered where there are no keys to type with');
  assert.ok(page.includes("setIniOption(text, 'EnableDebugConsole', on ? 1 : 0)"), 'the stored options.ini follows the switch');
  // the byte: the Manager at [0x00c7169c], Options.EnableDebugConsole at +0x2a398 (the game's Lua setter 0x00897370)
  assert.match(boot, /const MANAGER_PTR = 0x00c7169c, OPT_DEBUG_CONSOLE = 0x2a398;/);
  assert.ok(boot.includes('set: (on) => { const at = optionByte(); if (!at) return false; m.HEAPU8[at] = on ? 1 : 0; return true; },'));
  assert.ok(boot.includes('return mgr && mgr + OPT_DEBUG_CONSOLE < H.length ? mgr + OPT_DEBUG_CONSOLE : 0;'), 'never before the game has a Manager');
  // the console key is still the game's own, where the game put it
  assert.ok(boot.includes("Backquote: 'grave',"), 'the key left of 1');
  assert.ok(!/F2: 'grave'/.test(boot), 'F2 stays F2: mods bind it');
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
