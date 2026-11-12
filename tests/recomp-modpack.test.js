// Round 95: mods that need other mods. A Steam Workshop item lists its Required
// items; modpack.py turns them into catalogue ids ("requires"), leaving out a mod
// whose requirement the catalogue cannot carry (and anything needing that one),
// and the page installs the requirements first (mods.mjs requiredChain).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { requiredChain } from '../scripts/recomp/web/mods.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tool = join(root, 'scripts', 'recomp', 'assets', 'modpack.py');
const python = ['python3', 'python'].find((p) => spawnSync(p, ['-c', 'import zipfile'], { stdio: 'pipe' }).status === 0);

function mod(dir, folder, { name, id, directory, lua = true }) {
  const f = join(dir, folder);
  mkdirSync(f, { recursive: true });
  writeFileSync(join(f, 'metadata.xml'), `<?xml version="1.0"?><metadata><name>${name}</name><directory>${directory}</directory>`
    + (id ? `<id>${id}</id>` : '') + '<version>1</version></metadata>');
  if (lua) writeFileSync(join(f, 'main.lua'), `-- ${name}\n`);
}

function pack(args) {
  const r = spawnSync(python, [tool, ...args], { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
  assert.equal(r.status, 0, `modpack ${args.join(' ')}:\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}

test('round 95: requirements become catalogue ids; a missing one leaves the mod out, and what needs it', { skip: !python && 'no python' }, () => {
  const tmp = mkdtempSync(join(tmpdir(), 'modpack-'));
  try {
    const src = join(tmp, 'mods'), out = join(tmp, 'out');
    mod(src, 'api_100001', { name: 'The API', id: '100001', directory: 'the api' });
    mod(src, 'user_100002', { name: 'Uses The API', id: '100002', directory: 'uses api' });
    mod(src, 'orphan_100003', { name: 'Needs Missing', id: '100003', directory: 'needs missing' });
    mod(src, 'chain_100004', { name: 'Needs Orphan', id: '100004', directory: 'needs orphan' });
    mod(src, 'top_100005', { name: 'Needs User', id: '100005', directory: 'needs user' });
    mod(src, 'plain_777777', { name: 'Folder Id Only', directory: 'plain', lua: false });
    const req = join(tmp, 'requires.json');
    writeFileSync(req, JSON.stringify({ 100002: ['100001'], 100003: ['999999'], 100004: ['100003'], 100005: ['100002', '100005'] }));
    const said = pack([src, out, '--requires', req]);
    const cat = JSON.parse(readFileSync(join(out, 'catalogue.json'), 'utf8'));
    const by = Object.fromEntries(cat.mods.map((m) => [m.id, m]));
    assert.deepEqual(Object.keys(by).sort(), ['needs-user', 'plain', 'the-api', 'uses-api'], 'the stranded pair is left out');
    assert.deepEqual(by['uses-api'].requires, ['the-api'], 'a workshop id becomes the catalogue id of that mod');
    assert.deepEqual(by['needs-user'].requires, ['uses-api'], 'a mod is never its own requirement');
    assert.equal(by['the-api'].requires, undefined, 'no requirements: no field');
    assert.equal(by['the-api'].workshop, '100001', 'the workshop id comes from <id>');
    assert.equal(by.plain.workshop, '777777', 'or from the folder suffix');
    assert.ok(by['the-api'].unpacked > 0 && by['the-api'].unpacked >= 'the api'.length, 'the unpacked size is recorded');
    assert.match(said, /left out: Needs Missing\s+needs workshop item\(s\) 999999/);
    assert.match(said, /left out: Needs Orphan\s+needs workshop item\(s\) 100003/, 'stranded in turn');
    const bins = readdirSync(join(out, 'm')).sort();
    assert.ok(!bins.some((b) => /needs-missing|needs-orphan/.test(b)), 'and no parts are written for them');

    // --select packs only the folders named; --keep carries what this build does not make
    const sel = join(tmp, 'select.txt'), out2 = join(tmp, 'out2');
    writeFileSync(sel, 'top_100005\nuser_100002\n');
    pack([src, out2, '--requires', req, '--select', sel, '--keep', out]);
    const cat2 = JSON.parse(readFileSync(join(out2, 'catalogue.json'), 'utf8'));
    assert.deepEqual(cat2.mods.map((m) => m.id).sort(), ['needs-user', 'plain', 'the-api', 'uses-api']);
    assert.ok(readdirSync(join(out2, 'm')).includes('the-api.0.bin'), 'a kept entry brings its parts');
    assert.deepEqual(cat2.mods.find((m) => m.id === 'uses-api').requires, ['the-api'], 'a kept mod still satisfies a requirement');

    // round 109: a kept entry keeps its own requirements when this build's --requires says
    // nothing of it (the public catalogue lost three that way when one mod was added)
    const sel3 = join(tmp, 'select3.txt'), req3 = join(tmp, 'requires3.json'), out3 = join(tmp, 'out3');
    writeFileSync(sel3, 'plain_777777\n');
    writeFileSync(req3, '{}');
    pack([src, out3, '--requires', req3, '--select', sel3, '--keep', out2]);
    const by3 = Object.fromEntries(JSON.parse(readFileSync(join(out3, 'catalogue.json'), 'utf8')).mods.map((m) => [m.id, m]));
    assert.deepEqual(Object.keys(by3).sort(), ['needs-user', 'plain', 'the-api', 'uses-api']);
    assert.deepEqual(by3['uses-api'].requires, ['the-api'], 'kept, and still requiring what it did');
    assert.deepEqual(by3['needs-user'].requires, ['uses-api'], 'and so is the one that needs it');
    assert.equal(by3['the-api'].requires, undefined);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('round 95: what installing a mod downloads -- requirements first, each once, the mod last', () => {
  const cat = [
    { id: 'a' }, { id: 'b', requires: ['a'] }, { id: 'c', requires: ['b', 'a'] },
    { id: 'd', requires: ['c', 'e'] }, { id: 'e', requires: ['a'] },
    { id: 'x', requires: ['y'] }, { id: 'y', requires: ['x'] }, { id: 'z', requires: ['gone'] },
  ];
  const ids = (r) => r.order.map((e) => e.id);
  assert.deepEqual(ids(requiredChain(cat, 'a')), ['a']);
  assert.deepEqual(ids(requiredChain(cat, 'c')), ['a', 'b', 'c']);
  assert.deepEqual(ids(requiredChain(cat, 'd')), ['a', 'b', 'c', 'e', 'd'], 'a shared requirement comes once, before the first that needs it');
  assert.deepEqual(ids(requiredChain(cat, 'd', new Set(['b']))), ['a', 'c', 'e', 'd'], 'an installed mod is skipped');
  assert.deepEqual(ids(requiredChain(cat, 'c', new Set(['b']))), ['a', 'c'], 'and what it needs is still checked for its siblings');
  assert.deepEqual(ids(requiredChain(cat, 'x')), ['y', 'x'], 'a cycle is cut where it closes');
  const z = requiredChain(cat, 'z');
  assert.deepEqual(z.missing, ['gone'], 'a requirement the catalogue lacks is named');
  assert.deepEqual(requiredChain(cat, 'nope').missing, ['nope']);
  assert.deepEqual(ids(requiredChain(cat, 'c', new Set(['c']))), [], 'an installed mod brings nothing');
});

test('round 95: the page installs the chain and the browser shows what a mod requires', () => {
  const mods = readFileSync(join(root, 'scripts', 'recomp', 'web', 'mods.mjs'), 'utf8');
  const add = mods.slice(mods.indexOf('  async function add(entry) {'));
  const body = add.slice(0, add.indexOf('\n  }\n'));
  assert.ok(/const \{ order, missing \} = requiredChain\(\(catalogue && catalogue\.mods\) \|\| \[entry\], entry\.id, new Set\(mods\.map\(\(m\) => m\.id\)\)\);/.test(body),
    'installing asks for the chain, minus what is installed');
  assert.ok(body.includes("if (missing.length) throw new Error(`it needs ${missing.join(', ')}, which the browser does not have`);"), 'a missing requirement stops it');
  assert.ok(/for \(let i = 0; i < order\.length; i\+\+\) \{\s*const e = order\[i\];[^]*?fetchMod\(o\.catalogueBase, e,[^]*?await install\([^]*?, e\.name\);\s*fresh\.add\(e\.id\);/.test(body),
    'each mod of the chain is fetched and installed in order');
  assert.ok(mods.includes("requires: (Array.isArray(m.requires) ? m.requires : []).map((r) => (byId.has(r) ? cleanModName(byId.get(r).name) : r)),"),
    'the browser item names what it requires');
  const ui = readFileSync(join(root, 'scripts', 'recomp', 'web', 'mod_browser.mjs'), 'utf8');
  assert.ok(ui.includes("wrapText(`REQUIRES ${it.requires.join(', ').toUpperCase()}`, width, (t) => measure(F10, t), 2)"), 'the detail page says it');
  assert.ok(ui.includes("const of = s.step ? `${s.step.at} OF ${s.step.of}  ` : '';"), 'and counts the chain while it downloads');
});
