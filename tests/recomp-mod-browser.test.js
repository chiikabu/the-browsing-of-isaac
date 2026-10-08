import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanModText, cleanModName, searchMods, wrapText } from '../scripts/recomp/web/mod_browser.mjs';

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
