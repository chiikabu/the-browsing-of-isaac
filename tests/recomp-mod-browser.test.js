import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanModText, cleanModName, searchMods, wrapText, EXPERIMENTAL_TAG, EXPERIMENTAL_NOTE } from '../scripts/recomp/web/mod_browser.mjs';

const here = dirname(fileURLToPath(import.meta.url));

test('mod descriptions lose Steam BBCode, links and HTML entities', () => {
  assert.equal(cleanModText('[h1] Improved Chargebars! [/h1] This mod changes the UI'), 'Improved Chargebars! This mod changes the UI');
  assert.equal(cleanModText('[img]https://i.imgur.com/l9nbaxP.png[/img] This mod displays'), 'This mod displays');
  assert.equal(cleanModText('Replaces the normal &quot;Ah&quot; damage sound'), 'Replaces the normal "Ah" damage sound');
  assert.equal(cleanModText('Tom &amp; Jerry &#39;s &#x41;'), "Tom & Jerry 's A");
  assert.equal(cleanModText('see [url=https://example.com/x]the wiki[/url] now'), 'see the wiki now');
  assert.equal(cleanModText('see [url]https://example.com/x[/url] now'), 'see now');
  assert.equal(cleanModText('[list][*]one[*]two[/list]'), '- one - two');
  assert.equal(cleanModText('more at https://steamcommunity.com/x?id=1 today'), 'more at today');
  assert.equal(cleanModText('There are also versions for [url=https://github.com/wofsauge/'), 'There are also versions for');
  assert.equal(cleanModText('a’b “c” d—e f…'), 'a\'b "c" d-e f...');
  assert.equal(cleanModText('  many\n\n  spaces\t here '), 'many spaces here');
  assert.equal(cleanModText(null), '');
  assert.equal(cleanModText('keep [this] word'), 'keep word', 'a bracketed word is markup');
});

test('mod names lose the sort prefixes workshop authors put in front', () => {
  assert.equal(cleanModName('!!! (REP) Improved Chargebar'), '(REP) Improved Chargebar');
  assert.equal(cleanModName("'Enhanced Boss Bars"), 'Enhanced Boss Bars');
  assert.equal(cleanModName('!!~External item descriptions'), 'External item descriptions');
  assert.equal(cleanModName('cat coin'), 'cat coin');
  assert.equal(cleanModName('!!!'), '!!!', 'a name that is all prefix keeps itself');
});

test('search needs every word, and ranks name starts over words over substrings over descriptions', () => {
  const mods = [
    { name: 'Neko Hush', desc: 'Is Hush too scary? Then make him cute!' },
    { name: 'Neko Stoney Sprite', desc: 'neko stoney sprite' },
    { name: 'Hush Fix', desc: 'fixes hush' },
    { name: 'Tophat', desc: 'Larry just needed a tophat.' },
    { name: 'Better Explosions', desc: 'explosions, louder' },
    { name: 'Pushover', desc: 'nothing to see' },
  ];
  const names = (q) => searchMods(mods, q).map((m) => m.name);
  assert.deepEqual(names(''), mods.map((m) => m.name), 'no query keeps the order');
  assert.deepEqual(names('neko'), ['Neko Hush', 'Neko Stoney Sprite']);
  assert.deepEqual(names('hush'), ['Hush Fix', 'Neko Hush'], 'a name that starts with the word comes first');
  assert.deepEqual(names('ush'), ['Hush Fix', 'Neko Hush', 'Pushover'], 'substrings in names, then alphabetical');
  assert.deepEqual(names('larry'), ['Tophat'], 'descriptions are searched too');
  assert.deepEqual(names('neko cute'), ['Neko Hush'], 'every word must match somewhere');
  assert.deepEqual(names('NEKO   stoney'), ['Neko Stoney Sprite'], 'case and spacing do not matter');
  assert.deepEqual(names('zzz'), []);
  assert.deepEqual(names('explosions'), ['Better Explosions']);
  // a name typed as one word: the mod itself comes before the mods that only mention it
  const ff = [
    { name: 'Da Rules', desc: 'works with fiendfolio' },
    { name: 'Damn, Fiend Folio: RELOADED', desc: 'the big one' },
    { name: 'Folio Fiendish', desc: '' },
  ];
  assert.deepEqual(searchMods(ff, 'fiendfolio').map((m) => m.name), ['Damn, Fiend Folio: RELOADED', 'Da Rules']);
  assert.deepEqual(searchMods(ff, 'folioreloaded').map((m) => m.name), ['Damn, Fiend Folio: RELOADED']);
  assert.deepEqual(searchMods([{ name: 'Tophat', desc: 'hat' }, { name: 'Hat Trick', desc: '' }], 'hat').map((m) => m.name),
    ['Hat Trick', 'Tophat'], 'a name start beats a match inside a word');
});

test('descriptions wrap to the page, cut long words, and end in ... when they run out of lines', () => {
  const measure = (s) => s.length * 5;                 // a fixed-pitch stand-in: 5 px a character
  assert.deepEqual(wrapText('one two three four', 50, measure), ['one two', 'three four']);
  assert.deepEqual(wrapText('one two three four', 34, measure), ['one', 'two', 'three', 'four']);
  assert.deepEqual(wrapText('abcdefghijkl', 25, measure), ['abcde', 'fghij', 'kl'], 'a word wider than a line is cut');
  assert.deepEqual(wrapText('one two three four five six', 50, measure, 2), ['one two', 'three...']);
  assert.ok(wrapText('one two three four five six', 50, measure, 2).every((l) => measure(l) <= 50), 'the ... fits the line too');
  assert.deepEqual(wrapText('', 50, measure), []);
});

// round 123: a mod the catalogue marks experimental (Fiend Folio) says so in the browser
test('round 123: an experimental mod is tagged in the list and on its page, and the tag can be searched', () => {
  assert.equal(EXPERIMENTAL_TAG, 'EXPERIMENTAL');
  assert.equal(EXPERIMENTAL_NOTE, 'MAY BE BUGGY AND LAGGY');
  const items = [
    { id: 'a', name: 'An Experience Mod', desc: 'no tag here' },
    { id: 'b', name: 'Big Mod', desc: 'an experiment in its description' },
    { id: 'ff', name: 'Fiend Folio', desc: 'monsters', experimental: true },
    { id: 'z', name: 'Zed', desc: 'nothing', experimental: false },
  ];
  assert.deepEqual(searchMods(items, 'experimental').map((m) => m.id), ['ff'], 'the whole word finds the tagged mod only');
  assert.deepEqual(searchMods(items, 'exper').map((m) => m.id), ['a', 'ff', 'b'], 'a name still comes first; the tag beats a description');
  assert.deepEqual(searchMods(items, 'ex').map((m) => m.id), ['a', 'b'], 'two letters are not the tag');
  assert.deepEqual(searchMods(items, 'fiend exp').map((m) => m.id), ['ff'], 'with another word');
  assert.deepEqual(searchMods(items, 'zed exp').map((m) => m.id), [], 'a mod that is not marked has no tag');
  const ui = readFileSync(join(here, '..', 'scripts', 'recomp', 'web', 'mod_browser.mjs'), 'utf8');
  const mods = readFileSync(join(here, '..', 'scripts', 'recomp', 'web', 'mods.mjs'), 'utf8');
  assert.ok(mods.includes('experimental: m.experimental === true,'), 'the page hands the mark to the browser, and only a true one');
  assert.ok(ui.includes("const tag = !own && it.experimental ? EXPERIMENTAL_TAG : '';"), 'the list row says it where no progress or update note is');
  assert.ok(ui.includes('if (it.experimental) {') && ui.includes('text(F10, EXPERIMENTAL_TAG, d.x0 + 4, y + 1);'), 'the page of the mod says it in a frame');
  assert.ok(ui.indexOf('if (it.experimental) {') < ui.indexOf("const label2 = 'INSTALL'"), 'above the INSTALL button');
  assert.ok(mods.includes("detail: [m.experimental === true ? `${EXPERIMENTAL_TAG}: ${EXPERIMENTAL_NOTE}` : '',"), 'the paper a build without the art shows says it first');
});
