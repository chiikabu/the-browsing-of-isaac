// recomp-portable.test.js -- the two portable shapes (round 70).
//
// The shipping page reads its bytes from a server. A portable build gives it a
// provider instead: `window.isaacPortable`, set before the module runs, which
// answers a window either with a URL (the chunked build, so the reader Worker
// keeps fetching in parallel) or with bytes (the single-file build, which has
// them inline). These pin the seam and the chunk arithmetic -- the parts that
// are quiet when they break, because the page falls back to a fetch that a
// static host answers with 404 and the engine walks off the end.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const play = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
const bootWeb = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
const portable = readFileSync(join(root, 'scripts', 'recomp', 'assets', 'portable.py'), 'utf8');

test('the page takes a provider, and falls back to the server without one', () => {
  assert.match(play, /const portable = \(typeof window !== 'undefined' && window\.isaacPortable\) \|\| null;/);
  // every path that reads bytes asks the provider first
  assert.match(play, /if \(portable\) manifest = portable\.manifest \|\| null;\s*\n\s*else try \{/,
    'the manifest comes from the provider, or from dist.json as before');
  assert.match(play, /if \(portable\) \{\s*\n\s*index = portable\.index \|\| \[\];/, 'so does the instance index');
  assert.match(play, /if \(len\) return \(portable\.urlFor && portable\.urlFor\(rel, off, len\)\) \|\| null;/,
    'a window may be answered with a URL, and a provider that cannot serve it says so');
  assert.match(play, /const bytes = await portable\.bytesFor\(q\.rel, q\.off, q\.len\);/, 'or with bytes');
  assert.match(play, /const bytes = await portable\.bytesFor\('boot\.wasm', 0, 0\);/, 'the module too');
  // and with no provider nothing about the served dist changes
  assert.ok(play.includes("await fetch(rewrite('/boot.wasm'))"), 'the served path still streams the module');
  assert.ok(play.includes('WebAssembly.instantiateStreaming(res, info)'), "round 40's code cache is still used when there is a server");
});

test('a build with no URLs does not start the reader Worker', () => {
  // the Worker overlaps the network with the engine's work; inline, there is no
  // network, and every URL it was given would fail to resolve
  assert.match(play, /hooks\.noReader = !!\(portable && !portable\.urlFor\);/);
  assert.match(bootWeb, /function startReader\(\) \{[\s\S]{0,400}?if \(hooks\.noReader\) return;/);
});

test('a window is a byte range inside a large chunk, and the payload is a dozen files', () => {
  // The first cut gave every 1 MiB window its own chunk, which is correct and
  // useless: 559 files, and a cold start that spent 23 s fetching them one at a
  // time. The chunks are coarse now and a window is a Range inside one, so the
  // chunk's size costs nothing -- but only where the host honours the range.
  assert.match(portable, /p\.add_argument\("--chunks", type=int, default=12,/);
  assert.match(portable, /if \(!len \|\| !ranges\) return null;/, 'no range support, no URL: the bytes path serves it');
  assert.match(portable, /if \(!parts \|\| parts\.length !== 1 \|\| S\[parts\[0\]\.s\]\.gz\) return null;/,
    'a window that straddles two chunks, or lands in a compressed one, is not a range');
  assert.match(portable, /return name\(p\.s, p\.i\) \+ '#r=' \+ p\.within \+ '-' \+ \(p\.within \+ p\.take - 1\);/,
    'the range rides in the fragment, which no server ever sees');
  // windowed archives are padded up to the window so a read never crosses a cut
  assert.match(portable, /def lay_out\(part: list\[dict\], table: dict, stream: int, align: int = 1\) -> int:/);
  assert.match(portable, /b_len = lay_out\(windowed, table, 1, WINDOW\)/, 'part B is laid out on window boundaries');
  // and the host is asked once, before the first window goes out as a range
  assert.match(portable, /async function probeRanges\(\) \{/);
  assert.match(portable, /ranges = r\.status === 206 && \(await r\.arrayBuffer\(\)\)\.byteLength === 2;/);
});

test('the pieces of a read are fetched in parallel', () => {
  // 49 MB of module in 1 MiB pieces, one at a time, was 23.2 s to the first frame
  assert.match(portable, /for \(var w = 0; w < Math\.min\(6, parts\.length\); w\+\+\) crew\.push\(worker\(\)\);/);
  assert.match(portable, /if \(r\.status !== 206 \|\| u\.length !== p\.take\) \{/, 'a host that ignores Range is noticed and not asked again');
  assert.match(portable, /ranges = false;/);
});

test('the provider is keyed by the engine\'s own name for a file', () => {
  // play.mjs strips `instance/` off a pipeline URL before it asks; a plan that
  // kept the prefix missed every lookup and fell through to a 404
  assert.match(play, /rel: inInstance \? rel\.slice\('instance\/'\.length\) : rel,/);
  assert.match(portable, /out\.append\(\{"rel": e\["p"\], "path": p, "size": os\.path\.getsize\(p\),/);
  assert.match(portable, /"dist": "instance\/" \+ e\["p"\], "instance": e\["p"\]\}\)/);
});

test('the single-file build inlines the payload in pieces, not one string', () => {
  // a JavaScript string tops out near 512 MB and the payload is larger, so the
  // chunks are separate literals and decoded on demand
  assert.match(portable, /window\.__isaacPortableData\.blobs = \[\];<\/script>/);
  assert.match(portable, /SCRIPT_BYTES = 48 << 20/, 'one script holds 48 MB of base64: V8 stops compiling near 512 MB, silently');
  assert.match(portable, /if state\["budget"\] >= SCRIPT_BYTES:/, 'the pieces are grouped into scripts by that budget');
  assert.match(portable, /typeof Uint8Array\.fromBase64 === 'function'/, 'the native decoder when the browser has it');
  assert.match(portable, /if \(cache\.size > 24\) cache\.delete\(cache\.keys\(\)\.next\(\)\.value\);/, 'decoded chunks are dropped again');
  // the page's modules import each other by relative path: inline they are blobs,
  // whose imports do not resolve against the page
  assert.ok(portable.includes(String.raw`var text = src[name].replace(/(["'])\.\/([A-Za-z0-9_.-]+\.mjs)\1/g,`),
    'a blob URL resolves no relative import, so each module\'s imports are rewritten to the map first');
});
