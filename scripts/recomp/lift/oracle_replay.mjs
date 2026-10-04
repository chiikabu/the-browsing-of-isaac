// Drive the oracle replay from JS so a wasm trap is a scored failure,
// not a dead run.
import Module from './orc.mjs';
const m = await Module();
const vecPath = process.argv[2] || 'vectors.bin';
const imgPath = process.argv[3] || 'output/recomp/lift/image.bin';
const nsec = m._orc_load_image(m.stringToNewUTF8(imgPath));
if (nsec < 0) { console.error('image load failed', nsec); process.exit(2); }
const rc = m._orc_load(m.stringToNewUTF8(vecPath));
if (rc !== 0) { console.error('vector load failed', rc); process.exit(2); }
const nv = m._orc_nvec(), nf = m._orc_nfn();
const byFn = new Map();
const codes = new Map();
let pass = 0, fail = 0;
for (let i = 0; i < nv; ++i) {
  const va = m._orc_vec_va(i) >>> 0;
  let c;
  try { c = m._orc_run(i); } catch (e) { c = 100; }
  if (!byFn.has(va)) byFn.set(va, [0, 0]);
  const e = byFn.get(va);
  if (c === 0) { ++pass; ++e[0]; }
  else { ++fail; ++e[1]; codes.set(c, (codes.get(c) || 0) + 1); }
}
const NAMES = {1:'unresolved indirect',2:'EAX',3:'EDX',4:'ECX',5:'EBX',6:'ESI',7:'EDI',
  8:'esp_delta',9:'memory writes',90:'record truncated',91:'bad n_stack',93:'guest addr out of range',
  95:'write rec truncated',96:'write bytes truncated',97:'write addr out of range',
  99:'not in module',100:'wasm trap'};
let fp = 0, ff = 0; const bad = [];
for (const [va, e] of byFn) { if (e[1]) { ++ff; bad.push('0x'+va.toString(16).padStart(8,'0')); } else ++fp; }
console.log(`oracle replay: image sections ${nsec}, ${nf} functions, ${nv} vectors`);
console.log(`  functions PASS : ${fp}  (${(100*fp/(fp+ff)).toFixed(1)}%)`);
console.log(`  functions FAIL : ${ff}`);
console.log(`  vectors        : ${pass} pass / ${fail} fail  (${(100*pass/nv).toFixed(3)}% pass)`);
if (fail) { console.log('  failure kinds:');
  for (const [c,n] of [...codes].sort((a,b)=>b[1]-a[1]))
    console.log(`    ${String(NAMES[c]||c).padEnd(24)} ${n}`); }
if (bad.length) console.log('  failing functions: ' + bad.slice(0,20).join(' ') + (bad.length>20?` … (+${bad.length-20})`:''));
