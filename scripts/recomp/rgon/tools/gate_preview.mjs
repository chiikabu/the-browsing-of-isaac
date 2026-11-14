// gate_preview.mjs -- what the layer's gate (rgon.lua, round 122) will decide for every mod of a
// catalogue, worked out here from the same inputs: the page's scan of each mod's Lua
// (mods.mjs createModScan), gate_names.lua, enums_ex.lua and the layer's own list of what it has
// (the lines of lab_names.lua from a running engine).
//
//   node scripts/recomp/rgon/tools/gate_preview.mjs <catalogue dir> <implemented.txt> [mod-id ...]
//
// The rule is written a second time on purpose (a reader's check of rgon.lua's gate_rule and
// gate_weigh): the browser test compares what the layer logs with what this prints.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzip } from '../../web/zip.mjs';
import { createModScan } from '../../web/mods.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..', '..');
const [catDir, implPath, ...only] = process.argv.slice(2);
if (!catDir || !implPath) { console.log('usage: node gate_preview.mjs <catalogue dir> <implemented.txt> [mod-id ...]'); process.exit(2); }

const names = readFileSync(join(here, '..', 'gate_names.lua'), 'utf8');
const block = (key) => new Set((new RegExp(key + '\\s*=\\s*\\[\\[([\\s\\S]*?)\\]\\]').exec(names) || [, ''])[1].split(/\s+/).filter(Boolean));
const FN = block('fns'), GL = block('globals');
const enums = readFileSync(join(root, 'third_party', 'REPENTOGON', 'repentogon', 'resources', 'scripts', 'enums_ex.lua'), 'utf8');
const CB = new Map([...enums.matchAll(/\b(MC_[A-Z0-9_]+)\s*=\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
const HAVE = new Set(), HAVECLASS = new Set(), HAVEID = new Set();
for (const line of readFileSync(implPath, 'utf8').split(/\r?\n/)) {
  if (line.startsWith('I ')) { const full = line.slice(2).trim(); HAVE.add(full.split('.').pop()); HAVECLASS.add(full.split('.')[0]); }
  else if (line.startsWith('C ')) HAVEID.add(Number(line.slice(2)));
}
export function weigh(namesStr) {
  let used = 0; const missing = [];
  for (const name of String(namesStr).match(/[A-Za-z_][A-Za-z0-9_]*/g) || []) {
    if (FN.has(name)) { used++; if (!HAVE.has(name)) missing.push(name); }
    else if (GL.has(name)) { used++; if (!HAVECLASS.has(name)) missing.push(name); }
    else if (name.startsWith('MC_')) { const id = CB.get(name); if (id >= 1000) { used++; if (!HAVEID.has(id)) missing.push(name); } }
  }
  return { used, missing: missing.sort() };
}
export function rule(quits, yields, used, nmissing) {
  if (quits > 0) return [true, 'does not run without REPENTOGON'];
  if (yields > 0) return [false, 'steps aside for REPENTOGON'];
  if (used === 0) return [false, 'names REPENTOGON, uses nothing of it'];
  if (nmissing === 0) return [true, 'the layer has all it uses'];
  return [false, 'the layer lacks part of what it uses'];
}

const cat = JSON.parse(readFileSync(join(catDir, 'catalogue.json'), 'utf8'));
const mods = cat.mods || cat;
let shown = 0, hidden = 0, silent = 0;
for (const m of mods) {
  if (only.length && !only.includes(m.id)) continue;
  let zip;
  try { zip = Buffer.concat(Array.from({ length: m.parts || 1 }, (_, i) => readFileSync(join(catDir, 'm', `${m.id}.${i}.bin`)))); } catch { continue; }
  let entries;
  try { entries = await unzip(zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength)); } catch (e) { console.log(`${m.id}: ${e.message}`); continue; }
  const files = entries.filter((e) => !e.name.endsWith('/')).map((e) => ({ rel: e.name.split('/').slice(1).join('/') || e.name, bytes: e.bytes }));
  const scan = createModScan();
  const row = scan.add(m.id, files);
  if (!row) { silent++; continue; }
  const w = weigh([...row.names].join(' '));
  const [show, why] = rule(row.quits, row.yields, w.used, w.missing.length);
  if (show) shown++; else hidden++;
  console.log(`${show ? 'SHOWN ' : 'hidden'} ${m.id.padEnd(40)} says ${String(row.says).padStart(3)} quits ${row.quits} yields ${row.yields} uses ${String(w.used).padStart(3)} lacks ${String(w.missing.length).padStart(2)}  ${why}${w.missing.length ? ': ' + w.missing.slice(0, 8).join(' ') : ''}`);
}
console.log(`${shown} shown, ${hidden} hidden, ${silent} never name REPENTOGON in their code`);
