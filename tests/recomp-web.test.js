// Web build of the recomp boot (round 13): the GL surface has two backends --
// the headless fake in host_shims_gl.c (node profile) and the WebGL2
// forwarder in host_gl_webgl.c (build_boot.py --web). Every opengl32 entry
// point the shim table knows must have a body in BOTH, and the fake bodies
// must be compiled out of the web build, or the web link either fails or
// silently keeps a no-op for a call the game relies on.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hostSrc = join(root, 'scripts', 'recomp', 'host', 'src');
const table = join(root, 'scripts', 'recomp', 'host', 'generated', 'shim_table.c');

// entry points the shared fake keeps in both builds (capability gates)
const SHARED = new Set(['wglCreateContext', 'wglDeleteContext', 'wglGetProcAddress',
  'wglGetCurrentDC', 'wglGetCurrentContext', 'wglMakeCurrent', 'wglShareLists',
  'glGetIntegerv', 'glGetString', 'glGetStringi']);

function opengl32Symbols() {
  if (!existsSync(table)) return null;   // generated table not present: nothing to compare
  const t = readFileSync(table, 'utf8');
  const out = new Set();
  for (const m of t.matchAll(/"opengl32\.dll",\s*"([A-Za-z0-9_]+)"/g)) out.add(m[1]);
  return out;
}

test('every opengl32 import has a fake body and a WebGL body', () => {
  const syms = opengl32Symbols();
  if (!syms) return;
  const fake = readFileSync(join(hostSrc, 'host_shims_gl.c'), 'utf8');
  const web = readFileSync(join(hostSrc, 'host_gl_webgl.c'), 'utf8');
  const fakeDefs = new Set([...fake.matchAll(/^void imp_opengl32__(\w+)\(CpuState/gm)].map((m) => m[1]));
  const webDefs = new Set([...web.matchAll(/^GLFN\((\w+)\)|^UMAT\((\w+),/gm)].map((m) => m[1] || m[2]));
  const missingFake = [...syms].filter((s) => !fakeDefs.has(s));
  const missingWeb = [...syms].filter((s) => !SHARED.has(s) && !webDefs.has(s));
  assert.deepEqual(missingFake, [], 'opengl32 imports without a headless body');
  assert.deepEqual(missingWeb, [], 'opengl32 imports without a WebGL body (host_gl_webgl.c)');
});

test('the fake GL bodies are compiled out of the web build', () => {
  const fake = readFileSync(join(hostSrc, 'host_shims_gl.c'), 'utf8');
  const open = fake.indexOf('#ifndef ISAAC_WEB');
  const close = fake.indexOf('#endif /* !ISAAC_WEB */');
  assert.ok(open > 0 && close > open, 'the #ifndef ISAAC_WEB region exists');
  const inside = fake.slice(open, close);
  for (const name of ['glClear', 'glDrawElements', 'glTexImage2D', 'glShaderSource', 'glUseProgram'])
    assert.ok(inside.includes(`imp_opengl32__${name}(`), `${name}: fake body inside the region`);
  const web = readFileSync(join(hostSrc, 'host_gl_webgl.c'), 'utf8');
  assert.ok(web.startsWith('/*') && web.includes('#ifdef ISAAC_WEB') && web.trimEnd().endsWith('#endif /* ISAAC_WEB */'),
    'host_gl_webgl.c is entirely under ISAAC_WEB');
});

test('the web build wires the frame capture and the context', () => {
  const win = readFileSync(join(hostSrc, 'host_shims_win.c'), 'utf8');
  assert.match(win, /imp_gdi32__SwapBuffers[\s\S]{0,200}#ifdef ISAAC_WEB[\s\S]{0,120}isaac_web_present\(\)/,
    'SwapBuffers presents the frame in the web build');
  const gl = readFileSync(join(hostSrc, 'host_shims_gl.c'), 'utf8');
  assert.ok(gl.includes('emscripten_webgl_create_context("#canvas"'), 'wglCreateContext creates the WebGL2 context on #canvas');
  const web = readFileSync(join(hostSrc, 'host_gl_webgl.c'), 'utf8');
  assert.ok(web.includes('Module.isaacPresent'), 'the frame reaches the page through Module.isaacPresent');
  assert.ok(web.includes('isaac_gl_draw_elements(') && web.includes('isaac_gl_vertex_attrib_pointer('),
    'geometry goes through the client-array emulation');
  const page = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  for (const s of ['cfg.isaacPresent', 'cfg.isaacLazyRead', '_isaac_fs_seed_lazy', '_isaac_run_main', 'FS.writeFile'])
    assert.ok(page.includes(s), `boot_web.mjs: ${s}`);
  const build = readFileSync(join(root, 'scripts', 'recomp', 'lift', 'build_boot.py'), 'utf8');
  assert.ok(build.includes('-DISAAC_WEB=1') && build.includes('-sENVIRONMENT=web') && build.includes('"-lGL"'),
    'build_boot.py --web defines ISAAC_WEB and links for the browser with GL');
});

test('scripted input: the page and the node driver agree on the key table, the host has the queue', () => {
  const page = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  // round 30: the node driver's table lives in explore.mjs (`export const KEYS`),
  // shared with the explorer and the console driver, and covers every letter,
  // digit and the US punctuation -- more than the page's; the two must agree on
  // every key both define
  const node = readFileSync(join(root, 'scripts', 'recomp', 'lift', 'explore.mjs'), 'utf8');
  const table = (src, decl) => {
    const out = {};
    const block = src.slice(src.indexOf(decl), src.indexOf('};', src.indexOf(decl)));
    for (const m of block.matchAll(/'?([a-z0-9]+)'?:\s*\[(0x[0-9A-Fa-f]+),\s*(0x[0-9A-Fa-f]+),\s*([01])\]/g))
      out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
    return out;
  };
  const pk = table(page, 'const KEYS = {'), nk = table(node, 'export const KEYS = {');
  assert.ok(Object.keys(pk).length >= 40, 'page key table parsed');
  assert.ok(Object.keys(nk).length >= 60, 'node key table parsed');
  const common = Object.keys(nk).filter((k) => k in pk);
  assert.ok(common.length >= 10, `page and node tables share at least ten keys (${common.length})`);
  for (const k of common)
    assert.deepEqual(pk[k], nk[k], `key '${k}': page and node driver disagree on vk/scancode/extended`);
  for (const k of ['enter', 'escape', 'up', 'down', 'left', 'right', 'a', 'd', 's', 'w'])
    assert.ok(k in nk && k in pk, `key '${k}' in both tables`);
  // GLFW decodes the scancode from lParam bits 16..23 (+24 extended); pin the
  // canonical ones so a typo cannot silently map Enter to another key
  assert.deepEqual(pk.enter, [0x0D, 0x1C, 0]); assert.deepEqual(pk.escape, [0x1B, 0x01, 0]);
  assert.deepEqual(pk.up, [0x26, 0x48, 1]); assert.deepEqual(pk.down, [0x28, 0x50, 1]);
  assert.deepEqual(pk.left, [0x25, 0x4B, 1]); assert.deepEqual(pk.right, [0x27, 0x4D, 1]);
  const win = readFileSync(join(hostSrc, 'host_shims_win.c'), 'utf8');
  for (const s of ['void isaac_input_key(', 'void isaac_input_mouse_move(', 'void isaac_input_mouse_button(',
                   'Module.isaacInputPoll', 'isaac_guest_call(proc, &sub)', 'input_poll_page();'])
    assert.ok(win.includes(s), `host_shims_win.c: ${s}`);
  assert.ok(/msgq_pop_into\(msg\)\) \{ cpu->EAX = 1; return; \}[\s\S]{0,200}frame_cap\(\)/.test(win),
    'PeekMessageW drains the queue before the frame cap posts WM_QUIT');
});

// Round 17: the canvas already shows every frame, so the framebuffer readback
// exists only to hand PNGs to the runner. Reading a 960x540 frame back is 2 MB
// through glReadPixels and it stalls the GL pipeline, so the host asks the page
// which frames it actually wants and skips the rest. Measured over 300 frames:
// 52.3 s with every frame read back, 46.6 s with 13 of them.
test('the web backend asks before reading a frame back, and the page answers', () => {
  const gl = readFileSync(join(root, 'scripts', 'recomp', 'host', 'src', 'host_gl_webgl.c'), 'utf8');
  assert.ok(gl.includes('EM_JS(int, isaac_wants_frame_js, (unsigned n)'), 'the host has the question');
  assert.ok(gl.includes('if (typeof Module.isaacWantsFrame !== "function") return 1;'),
    'a page without the hook still gets every frame');
  assert.ok(gl.includes('if (!isaac_wants_frame_js(g_present_count)) return;'),
    'the readback is skipped before glReadPixels, not after');
  const page = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(page.includes('cfg.isaacWantsFrame = (n) => {'), 'the page answers');
  assert.ok(page.includes('const frame = { n: wantedFrame || presented, w, h,'),
    'kept frames carry the host frame number, which no longer tracks the capture count');
});

test('a served page is playable from the bare origin: it redirects to the run query, the live page has no 5-frame budget, the type follows the file', () => {
  const r = readFileSync(join(root, 'scripts', 'recomp', 'web', 'run_web.mjs'), 'utf8');
  assert.ok(r.includes("res.writeHead(302, { Location: `/boot_web.html?${qs}`, 'Cache-Control': 'no-store' });"),
    'GET / redirects to the page with the frames budget and ISAAC_YIELD');
  assert.ok(r.includes("'Content-Type': b64 ? 'text/plain' : mime(r.file || rel)"),
    'the content type is the served file\'s, so / is text/html and not a download');
  const w = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(w.includes("cfg.ENV.ISAAC_MAX_FRAMES = params.get('frames') || (params.get('ISAAC_YIELD') === '1' ? '100000000' : '5');"),
    'a live page without frames= plays until it is closed');
});

test('round 37: the web GL wrappers answer from the host cache, the present drains errors sparsely, the yield is not a timer', () => {
  const gl = readFileSync(join(hostSrc, 'host_gl_webgl.c'), 'utf8');
  assert.ok(existsSync(join(hostSrc, 'host_gl_cache.c')), 'host_gl_cache.c holds the tables (compiled into every profile by the src glob)');
  assert.ok(gl.includes('if (out && A(0) == GL_RENDERBUFFER && isaac_glc_rb_param(A(1), &v)) { *out = (GLint)v; RET0; }'),
    'glGetRenderbufferParameteriv answers from the storage call');
  assert.ok(gl.includes('if (isaac_glc_fbo_status(A(0), &st)) RETV(st);'), 'glCheckFramebufferStatus is remembered');
  assert.ok(gl.includes('if (isaac_glc_loc_get(A(0), 1, name, &loc)) RETV((uint32_t)loc);'), 'glGetUniformLocation is remembered');
  assert.ok(gl.includes('if (isaac_glc_loc_get(A(0), 0, name, &loc)) RETV((uint32_t)loc);'), 'glGetAttribLocation is remembered');
  for (const feed of ['isaac_glc_rb_storage(A(1), A(2), A(3), 0);', 'isaac_glc_fbo_attach(A(0), A(1), 0, A(3), 0);',
                      'isaac_glc_fbo_attach(A(0), A(1), 1, A(3), (A(2) << 8) ^ A(4));', 'isaac_glc_tex_image(A(0));', 'isaac_glc_loc_flush(prog);',
                      'isaac_glc_tex_bind(A(0), A(1));', 'isaac_glc_tex_active(A(0));'])
    assert.ok(gl.includes(feed), `the cache is fed by ${feed}`);
  assert.ok(gl.includes('if (gl_check_mode() || (g_present_count & 63u) == 1u) {'),
    'the present drains glGetError every 64th frame unless ISAAC_GL_CHECK=1');
  const win = readFileSync(join(hostSrc, 'host_shims_win.c'), 'utf8');
  assert.ok(win.includes('if (isaac_web_yield_enabled()) isaac_yield_js();'), 'SwapBuffers yields through isaac_yield_js');
  const yieldBody = win.slice(win.indexOf('EM_ASYNC_JS(void, isaac_yield_js, (void), {'), win.indexOf('/* ISAAC_YIELD=1:'));
  assert.ok(yieldBody.includes('new MessageChannel()') && yieldBody.includes('port2.postMessage(0)'),
    'the yield is a MessageChannel message');
  assert.ok(yieldBody.includes('if (work < 15 && typeof requestAnimationFrame === "function") {'),
    'a frame with spare time waits for the next refresh instead (one game frame per display frame)');
  assert.ok(!/scheduler\.yield\(/.test(yieldBody), 'never scheduler.yield() (its continuation starves the other tasks)');
  assert.ok(!/setTimeout\(resolve, 0\)|emscripten_sleep/.test(yieldBody), 'never a zero timer (the 4 ms clamp)');
  assert.ok(yieldBody.includes('if (typeof document !== "undefined" && document.hidden) {') && yieldBody.includes('setTimeout(resolve, 250)'),
    'a hidden document ticks on a slow timer instead of stalling on requestAnimationFrame');
  const bb = readFileSync(join(root, 'scripts', 'recomp', 'lift', 'build_boot.py'), 'utf8');
  assert.ok(bb.includes('"-sJSPI_IMPORTS=emscripten_sleep,__asyncjs__isaac_yield_js"'), 'the yield import suspends the wasm stack');
});

test('round 40: the module is served cacheably and instantiated from the fetch itself, so V8 keeps its optimised code across visits', () => {
  const r = readFileSync(join(root, 'scripts', 'recomp', 'web', 'run_web.mjs'), 'utf8');
  assert.ok(r.includes("const whole = r.file && !u.searchParams.has('off') && !b64;"), 'whole files get a validator');
  assert.ok(r.includes("'Cache-Control': whole ? 'no-cache' : 'no-store' };"), 'whole files are no-cache (revalidate), slices stay no-store');
  assert.ok(r.includes("if (req.headers['if-none-match'] === etag) { res.writeHead(304,"), 'a matching validator answers 304');
  const p = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
  assert.ok(p.includes('await WebAssembly.instantiateStreaming(res, info);'), 'the shipping page streams the fetch Response itself');
  assert.ok(!p.includes('new Response(counted'), 'no synthetic Response (it has no cache entry for the code cache)');
  assert.ok(p.includes('const counted = res.clone().body.getReader();'), 'the progress bar reads a clone');
  for (const d of ['drive_perf.mjs', 'profile_play.mjs']) {
    const s = readFileSync(join(root, 'scripts', 'recomp', 'web', d), 'utf8');
    assert.ok(s.includes('chromium.launchPersistentContext(PROFILE_DIR,'), `${d} can measure a warm start (profile_dir=)`);
  }
});

test('round 41: a fetched archive window is detached right after the copy, so the GC never has to catch up with a level load', () => {
  const b = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(b.includes("if (b && typeof b.transfer === 'function' && !b.detached) b.transfer(0);"), 'transfer(0) frees the backing store at once (guarded for older browsers)');
  assert.ok(/m\.HEAPU8\.set\(bytes, dst\);[\s\S]{0,400}dropBody\(bytes\);[\s\S]{0,400}return n;/.test(b), 'the window is copied, then dropped, and the count returned is the saved one');
  assert.ok(/lazyBytes \+= len;[^\n]*\n\s*dropBody\(bytes\);/.test(b), 'a whole-file lazy read drops its body too');
});
