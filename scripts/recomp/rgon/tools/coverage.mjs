// coverage.mjs -- for each installed workshop mod that mentions REPENTOGON: the
// REPENTOGON-only names its Lua uses, and which of them the layer does not have.
// The static half of letting a mod see REPENTOGON (the other half is running it:
// drive_stress.mjs phases=tour with ISAAC_RGON_ALLOW=*).
//
//   node scripts/recomp/rgon/tools/coverage.mjs [mod-folder-substring ...]
//
// A name is "REPENTOGON-only" when REPENTOGON registers it and neither the
// executable nor the game's own scripts contain it. Method names are matched
// without their class (`:GetLayer(`), so a name the layer has on one class
// counts as covered on any: read the result as a list of what to look at.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const RG = join(root, 'third_party', 'REPENTOGON');
const GAME = process.env.ISAAC_GAME_DIR || 'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth';
const want = process.argv.slice(2).map((s) => s.toLowerCase());
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
const enums = readFileSync(join(RG, 'repentogon/resources/scripts/enums_ex.lua'), 'utf8');
const rgCbs = new Map([...enums.matchAll(/\b(MC_[A-Z0-9_]+)\s*=\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
const vanilla = new Set();
for (const m of readFileSync(join(root, 'tools', 'isaac-ng.unpacked.exe')).toString('latin1').matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) vanilla.add(m[0]);
for (const f of walk(join(GAME, 'resources/scripts'), '.lua'))
  for (const m of readFileSync(f, 'utf8').matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) vanilla.add(m[0]);
const onlyFns = new Set([...rgFns].filter((n) => !vanilla.has(n)));

// what the layer has: method("Class", "Name"), static(..., "Name"), function L:Name / PM.Name, define(..., { ids })
const layer = readFileSync(join(root, 'scripts', 'recomp', 'rgon', 'rgon.lua'), 'utf8');
const have = new Set();
for (const m of layer.matchAll(/\b(?:method|static)\((?:[^,]+,\s*)?"[A-Za-z]+",\s*"([A-Za-z_0-9]+)"/g)) have.add(m[1]);
for (const m of layer.matchAll(/function\s+[A-Za-z_]+[.:]([A-Za-z_0-9]+)\s*\(/g)) have.add(m[1]);
const haveIds = new Set();
for (const m of layer.matchAll(/define\(SLOT\.[A-Za-z]+,\s*\{([^}]*)\}/g)) for (const id of m[1].split(',')) haveIds.add(Number(id.trim()));

const rows = [];
for (const dir of readdirSync(join(GAME, 'mods'))) {
  if (want.length && !want.some((w) => dir.toLowerCase().includes(w))) continue;
  const files = walk(join(GAME, 'mods', dir), '.lua');
  let mentions = 0;
  const fns = new Set(), cbs = new Set(), globals = new Set();
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    mentions += (t.match(/\bREPENTOGON\b/g) || []).length;
    for (const m of t.matchAll(/[:.]([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) if (onlyFns.has(m[1])) fns.add(m[1]);
    for (const m of t.matchAll(/\b(MC_[A-Z0-9_]+)\b/g)) if (rgCbs.has(m[1]) && rgCbs.get(m[1]) >= 1000) cbs.add(m[1]);
    for (const g of ['ImGui', 'PersistentGameData', 'XMLData', 'EntityConfig', 'RoomConfig', 'MenuManager', 'Console', 'DebugRenderer', 'ProceduralItemManager', 'BossPoolManager', 'ItemOverlay', 'RoomTransition', 'NightmareScene', 'StageTransition', 'PauseMenu', 'Minimap', 'Ambush', 'ScoreSheet', 'PlayerManager'])
      if (new RegExp(`\\b${g}\\s*[.:]`).test(t)) globals.add(g);
  }
  if (!mentions) continue;
  const missingFns = [...fns].filter((n) => !have.has(n)).sort();
  const missingCbs = [...cbs].filter((n) => !haveIds.has(rgCbs.get(n))).sort();
  const missingGlobals = [...globals].filter((g) => !new RegExp(`rawset\\(_G, "${g}"`).test(layer)).sort();
  rows.push({ dir, uses: fns.size + cbs.size + globals.size, missingFns, missingCbs, missingGlobals });
}
rows.sort((a, b) => (a.missingFns.length + a.missingCbs.length + a.missingGlobals.length) - (b.missingFns.length + b.missingCbs.length + b.missingGlobals.length));
for (const r of rows) {
  const n = r.missingFns.length + r.missingCbs.length + r.missingGlobals.length;
  console.log(`${n === 0 ? 'COVERED' : String(n).padStart(4) + ' gap'}  ${r.dir}  (uses ${r.uses})`);
  const list = [...r.missingGlobals.map((g) => g + '.*'), ...r.missingFns, ...r.missingCbs];
  if (list.length) console.log('         ' + list.slice(0, 14).join(' ') + (list.length > 14 ? ` ... +${list.length - 14}` : ''));
}
