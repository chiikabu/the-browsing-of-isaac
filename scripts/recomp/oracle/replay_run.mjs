/**
 * Run the oracle vectors against the lifted module and emit a detailed,
 * per-vector result file for classification.
 *
 * The lifter's own driver prints a blended pass rate.  This one records the
 * failing code per vector and per function so accuracy can be stratified by
 * block coverage -- a function that passes on vectors touching 20% of its
 * blocks is much weaker evidence than one at 99%, and a single blended
 * number over 21,411 functions would hide exactly that.
 *
 * usage: node replay_run.mjs <orc.mjs> <vectors.bin> <image.bin> <out.json> [strict]
 */
import { writeFileSync } from 'node:fs';

const [modPath, vecPath, imgPath, outPath, strictArg] = process.argv.slice(2);
const strict = strictArg === undefined ? 1 : Number(strictArg);

const Module = (await import(modPath)).default;
const m = await Module();

const nsec = m._orc_load_image(m.stringToNewUTF8(imgPath));
if (nsec < 0) { console.error('image load failed', nsec); process.exit(2); }
const rc = m._orc_load(m.stringToNewUTF8(vecPath));
if (rc !== 0) { console.error('vector load failed', rc); process.exit(2); }
if (m._orc_set_strict) m._orc_set_strict(strict);

const nv = m._orc_nvec(), nf = m._orc_nfn();
console.error(`image sections ${nsec}, ${nf} functions, ${nv} vectors, strict=${strict}`);

const CODE = {
  0: 'pass', 1: 'unresolved indirect', 2: 'EAX', 3: 'EDX', 4: 'ECX',
  5: 'EBX', 6: 'ESI', 7: 'EDI', 8: 'esp_delta', 9: 'memory writes',
  90: 'record truncated', 91: 'bad n_stack', 93: 'guest addr out of range',
  95: 'write rec truncated', 96: 'write bytes truncated',
  97: 'write addr out of range', 99: 'not in module', 100: 'wasm trap',
};

const perFn = new Map();   // va -> {pass, fail, codes:Map, firstFail:index}
let pass = 0, fail = 0;
const t0 = Date.now();
for (let i = 0; i < nv; ++i) {
  const va = m._orc_vec_va(i) >>> 0;
  let c;
  try { c = m._orc_run(i); } catch (e) { c = 100; }
  let e = perFn.get(va);
  if (!e) { e = { pass: 0, fail: 0, codes: {}, firstFail: -1 }; perFn.set(va, e); }
  if (c === 0) { ++pass; ++e.pass; }
  else {
    ++fail; ++e.fail;
    e.codes[c] = (e.codes[c] || 0) + 1;
    if (e.firstFail < 0) e.firstFail = i;
  }
  if ((i + 1) % 20000 === 0) {
    console.error(`  ${i + 1}/${nv}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}

const fns = [];
for (const [va, e] of perFn) {
  const codes = Object.entries(e.codes)
    .map(([k, n]) => [Number(k), n]).sort((a, b) => b[1] - a[1]);
  fns.push({
    va, va_hex: '0x' + va.toString(16).padStart(8, '0'),
    pass: e.pass, fail: e.fail, n: e.pass + e.fail,
    ok: e.fail === 0,
    dominant: codes.length ? CODE[codes[0][0]] || String(codes[0][0]) : null,
    dominant_code: codes.length ? codes[0][0] : 0,
    codes: Object.fromEntries(codes.map(([k, n]) => [CODE[k] || k, n])),
    first_fail_vector: e.firstFail,
  });
}
fns.sort((a, b) => a.va - b.va);
writeFileSync(outPath, JSON.stringify({
  n_functions: fns.length, n_vectors: nv, strict,
  vectors_pass: pass, vectors_fail: fail,
  functions_pass: fns.filter((f) => f.ok).length,
  seconds: (Date.now() - t0) / 1000,
  functions: fns,
}));
console.error(`vectors ${pass}/${nv} pass; functions ` +
  `${fns.filter((f) => f.ok).length}/${fns.length} pass; ` +
  `${((Date.now() - t0) / 1000).toFixed(0)}s -> ${outPath}`);
