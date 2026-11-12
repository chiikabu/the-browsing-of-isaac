// Resolve REPENTOGON's ZHL function signatures against THIS executable (v1.9.7.17):
// name -> { va, n (matches), decl }. Written to the path given.
//   node scripts/recomp/rgon/tools/zhl-resolve.mjs <out.json>
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parsePe, parseSignature, findSignatureMatches, executableRanges, readZhlSignatures } from '../../../decomp/pe-signatures.mjs';
const exe = readFileSync('tools/isaac-ng.unpacked.exe');
const pe = parsePe(exe), ranges = executableRanges(pe, exe.length);
const dir = 'third_party/REPENTOGON/libzhl/functions';
const out = {};
let probe = null;
for (const f of readdirSync(dir).filter((n) => n.endsWith('.zhl'))) {
  for (const e of readZhlSignatures(join(dir, f))) {
    let m = [];
    try { m = findSignatureMatches(exe, parseSignature(e.pattern), ranges); } catch { m = []; }
    if (!probe && m.length === 1) probe = { e, m };
    const d = String(e.declaration || '').replace(/\s+/g, ' ').trim();
    const name = (d.match(/([A-Za-z_~][A-Za-z0-9_:~]*)\s*\(/) || [])[1] || d.slice(0, 60);
    const key = out[name] ? `${name}#${f}#${Object.keys(out).length}` : name;
    out[key] = { file: f, n: m.length, va: m.length === 1 ? m[0] : null, all: m.length > 1 && m.length < 6 ? m : undefined, decl: d };
  }
}
mkdirSync('output/recomp/rgon', { recursive: true });
writeFileSync(process.argv[2] || 'output/recomp/rgon/zhl-17.json', JSON.stringify(out, null, 1));
console.log('probe', JSON.stringify(probe).slice(0, 400));
const v = Object.values(out);
console.log(`${v.length} signatures: ${v.filter((x) => x.n === 1).length} unique, ${v.filter((x) => x.n === 0).length} none, ${v.filter((x) => x.n > 1).length} ambiguous`);
