// Which installed workshop mods touch REPENTOGON, and which of its Lua names they use.
//   node scripts/recomp/rgon/tools/mods-census.mjs [out.json]
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const RG = 'third_party/REPENTOGON';
const GAME = 'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth';
const walk = (d, ext, out = []) => {
  let names = [];
  try { names = readdirSync(d); } catch { return out; }
  for (const n of names) {
    const p = join(d, n);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, ext, out); else if (n.toLowerCase().endsWith(ext)) out.push(p);
  }
  return out;
};
const rgFns = new Set();
for (const f of walk(join(RG, 'repentogon'), '.cpp'))
  for (const m of readFileSync(f, 'utf8').matchAll(/\{\s*"([A-Za-z_][A-Za-z0-9_]*)"\s*,\s*[A-Za-z_:][A-Za-z0-9_:]*\s*\}/g)) rgFns.add(m[1]);
const rgCbs = new Set();
for (const m of readFileSync(join(RG, 'repentogon/resources/scripts/enums_ex.lua'), 'utf8').matchAll(/\b(MC_[A-Z0-9_]+)\s*=\s*\d+/g)) rgCbs.add(m[1]);
const vanilla = new Set();
const exe = readFileSync('tools/isaac-ng.unpacked.exe').toString('latin1');
for (const m of exe.matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) vanilla.add(m[0]);
for (const f of walk(join(GAME, 'resources/scripts'), '.lua'))
  for (const m of readFileSync(f, 'utf8').matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) vanilla.add(m[0]);
const newFns = new Set([...rgFns].filter((n) => !vanilla.has(n)));
const newCbs = new Set([...rgCbs].filter((n) => !vanilla.has(n)));

const rows = [];
const allFn = new Map(), allCb = new Map();
for (const dir of readdirSync(join(GAME, 'mods'))) {
  const root = join(GAME, 'mods', dir);
  const files = walk(root, '.lua');
  if (!files.length) continue;
  let mentions = 0, guarded = 0, hardReq = 0;
  const fn = new Map(), cb = new Map();
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    mentions += (t.match(/\bREPENTOGON\b/g) || []).length;
    guarded += (t.match(/\bif\s+(?:not\s+)?REPENTOGON\b|REPENTOGON\s+(?:and|or)\b|\b(?:and|or)\s+REPENTOGON\b/g) || []).length;
    hardReq += (t.match(/if\s+not\s+REPENTOGON\s+then[\s\S]{0,160}?(?:return|error)/g) || []).length;
    for (const m of t.matchAll(/[:.]([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) if (newFns.has(m[1])) fn.set(m[1], (fn.get(m[1]) || 0) + 1);
    for (const m of t.matchAll(/\b(MC_[A-Z0-9_]+)\b/g)) if (newCbs.has(m[1])) cb.set(m[1], (cb.get(m[1]) || 0) + 1);
  }
  if (!mentions) continue;
  for (const [k, v] of fn) allFn.set(k, (allFn.get(k) || 0) + 1);
  for (const [k, v] of cb) allCb.set(k, (allCb.get(k) || 0) + 1);
  rows.push({ mod: dir, lua: files.length, mentions, guarded, hardReq, fns: fn.size, cbs: cb.size });
}
rows.sort((a, b) => b.hardReq - a.hardReq || b.fns + b.cbs - (a.fns + a.cbs));
const out = { repentogonFunctions: rgFns.size, repentogonOnly: newFns.size, callbacks: rgCbs.size, callbacksOnly: newCbs.size,
  modsMentioning: rows.length, rows,
  distinctFunctionsUsed: allFn.size, distinctCallbacksUsed: allCb.size,
  topFunctions: [...allFn].sort((a, b) => b[1] - a[1]).slice(0, 40), topCallbacks: [...allCb].sort((a, b) => b[1] - a[1]).slice(0, 30) };
mkdirSync('output/recomp/rgon', { recursive: true });
writeFileSync(process.argv[2] || 'output/recomp/rgon/mods-census.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, rows: undefined, topFunctions: undefined, topCallbacks: undefined }));
for (const r of rows) console.log(`${String(r.hardReq).padStart(2)} hard  ${String(r.mentions).padStart(4)} mentions  ${String(r.fns).padStart(3)} fns ${String(r.cbs).padStart(3)} cbs  ${r.mod}`);
