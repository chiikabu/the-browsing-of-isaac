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
import { Script } from 'node:vm';
import { gzipSync } from 'node:zlib';

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
  assert.ok(yieldBody.includes('var timer = setTimeout(function () {') && yieldBody.includes('requestAnimationFrame(function () { if (done) return; done = true; clearTimeout(timer); resolve(); });'),
    'round 49: the animation-frame wait races a 250 ms timer (a visible page can get no frames: an occluded embedded view)');
  assert.ok(yieldBody.includes('Module.isaacYieldNoRaf = (Module.isaacYieldNoRaf | 0) + 1;'), 'the fallback ticks are counted');
  const bb = readFileSync(join(root, 'scripts', 'recomp', 'lift', 'build_boot.py'), 'utf8');
  assert.ok(bb.includes('"-sJSPI_IMPORTS=emscripten_sleep,__asyncjs__isaac_yield_js,isaac_fs_lazy_pread_js"'), 'the yield import suspends the wasm stack, and so does the window read (round 56)');
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

test('round 44: redundant GL state calls are skipped in the web wrappers, and deletions clear the mirrors', () => {
  const gl = readFileSync(join(hostSrc, 'host_gl_webgl.c'), 'utf8');
  assert.ok(gl.includes('if (gls_prog_ok && gls_prog == A(0)) { ++gls_skip_prog; RET0; }'), 'glUseProgram of the current program is skipped');
  assert.ok(gl.includes('if (gls_unit_ok && gls_unit == A(0)) { ++gls_skip_unit; RET0; }'), 'glActiveTexture of the active unit is skipped');
  assert.ok(gl.includes("if (slot && *slot == A(1) + 1u) { ++gls_skip_tex; RET0; }"), 'glBindTexture of the bound texture (per unit and target) is skipped');
  assert.ok(gl.includes('gls_blend[2] == A(2) && gls_blend[3] == A(3)) { ++gls_skip_blend; RET0; }'), 'an identical blend function is skipped');
  assert.ok(gl.includes('gls_vp[2] == A(2) && gls_vp[3] == A(3)) { ++gls_skip_vp; RET0; }'), 'an identical viewport is skipped');
  assert.ok(gl.includes('if (gls_prog_ok && gls_prog == A(0)) gls_prog_ok = 0; glDeleteProgram(A(0));'), 'deleting the current program forgets it');
  assert.ok(gl.includes('if (gls_tex2d[u] == names[i] + 1u) gls_tex2d[u] = 0;'), 'deleting a bound texture forgets the binding');
  assert.ok(/isaac_glc_tex_active\(A\(0\)\);\s*if \(gls_unit_ok/.test(gl) && /isaac_glc_tex_bind\(A\(0\), A\(1\)\);\s*\{/.test(gl),
    'the framebuffer memo is told about the unit and the binding even when the call is skipped');
  assert.ok(gl.includes('redundant state calls skipped: useProgram %u, activeTexture %u, bindTexture %u, blend %u, viewport %u'), 'the census');
});

test('round 48: redundant attribute enables and uniform re-sends are skipped; a link or delete forgets the program', () => {
  const gl = readFileSync(join(hostSrc, 'host_gl_webgl.c'), 'utf8');
  assert.ok(gl.includes('if (gls_attrib_known[A(0)] && gls_attrib_on[A(0)]) { ++gls_skip_attrib; RET0; }'), 'an enable of an enabled attribute is skipped');
  assert.ok(gl.includes('if (gls_attrib_known[A(0)] && !gls_attrib_on[A(0)]) { ++gls_skip_attrib; RET0; }'), 'a disable of a disabled one too');
  assert.ok(gl.includes('glu_same((GLint)A(0), (uint8_t)(A(2) ? 7 : 6), AP(3), 16)'), 'a matrix already held by the program is not re-sent');
  assert.ok(gl.includes('glu_same((GLint)A(0), 2, &v, 1)'), 'nor a sampler unit');
  assert.ok(gl.includes('if (!gls_prog_ok || n > 16u) return 0;'), 'no current program: forwarded (GL reports it)');
  assert.ok(/glu_forget\(prog\);[^\n]*\n\s*glLinkProgram\(prog\);/.test(gl) && gl.includes('glu_forget(A(0)); if (gls_prog_ok && gls_prog == A(0)) gls_prog_ok = 0; glDeleteProgram(A(0));'),
    'a link resets the uniforms, a delete frees the name: both forget');
  assert.ok(gl.includes('attrib enables %u, uniforms %u'), 'the census');
});

test('round 49: the edge suite hides the tab for as long as asked and continues the same run after a reload', () => {
  const drv = readFileSync(join(root, 'scripts', 'recomp', 'web', 'drive_edges.mjs'), 'utf8');
  assert.ok(drv.includes("const HIDDEN_S = Number(opt.hidden_s || '8');"), 'hidden_s= sets the hidden period');
  assert.ok(drv.includes("'continue after the reload resumes the same run'"), 'the same-run check');
  assert.ok(drv.includes('/RNG Start Seed: .*\\[(Continue|New), \\d+\\]/'), 'a continue is told from a new run by the seed line');
  assert.ok(drv.includes("sa[2] === 'Continue' && sa[1] === sb[1]"), 'the seed must match the run before the reload');
  assert.ok(drv.includes("'the continued run plays at full rate'"), 'and the continued run is measured');
  assert.ok(drv.includes('window.requestAnimationFrame = () => 0;') && drv.includes("'no animation frames: the game ticks on the fallback timer instead of stalling'"),
    'check 5 forges a visible page with no animation frames');
  const play = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
  assert.ok(play.includes('no animation frames (${nrDelta} timer tick(s) this second: occluded?)'), 'the shipping status line names the fallback');
});


function liveInputPage() {
  const source = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  function eventTarget() {
    const listeners = new Map();
    return {
      addEventListener(type, listener, options = false) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push({ listener, capture: options === true || !!options.capture });
      },
      dispatch(type, event = {}, capture = null) {
        for (const entry of listeners.get(type) || []) {
          if (capture === null || entry.capture === capture) entry.listener(event);
        }
      },
    };
  }
  const window = eventTarget(), canvas = { ...eventTarget(), focus() {} }, saves = { open: false };
  const document = {
    ...eventTarget(), hidden: false,
    getElementById(id) { return id === 'canvas' ? canvas : id === 'saves' ? saves : null; },
  };
  const cfg = {}, m = { HEAP32: new Int32Array(4) };
  new Script(source.slice(source.indexOf('const KEYS = {'), source.indexOf('\nlet m;')))
    .runInNewContext({ window, document, cfg, m, params: new URLSearchParams(''), log() {} });
  return {
    window, document, saves,
    inject: window.isaacInjectKey,
    key(code, down, target = canvas) {
      const event = {
        code, target, repeat: false, defaultPrevented: false, stopped: false,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() { this.stopped = true; },
      };
      const type = down ? 'keydown' : 'keyup';
      window.dispatch(type, event, true);
      if (!event.stopped) target.dispatch?.(type, event);
      if (!event.stopped) window.dispatch(type, event, false);
    },
    drain() {
      const records = [];
      while (cfg.isaacInputPoll(0, 0)) {
        records.push(Array.from(m.HEAP32));
        assert.ok(records.length < 100, 'the native queue must drain');
      }
      return records;
    },
  };
}

test('live input: touch and physical holds survive either owner releasing first', () => {
  for (const first of ['touch', 'physical']) {
    const page = liveInputPage();
    page.key('KeyW', true);
    page.inject('w', true, 'touch');
    assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 1]]);
    if (first === 'touch') page.inject('w', false, 'touch');
    else page.key('KeyW', false);
    assert.deepEqual(page.drain(), [], `${first} cannot release the other owner's hold`);
    if (first === 'touch') page.key('KeyW', false);
    else page.inject('w', false, 'touch');
    assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 0]]);
  }
});

test('live input: injected owners are independent and duplicate downs are idempotent', () => {
  const page = liveInputPage();
  page.inject('space', true, 'first');
  page.inject('space', true, 'first');
  page.inject('space', true, 'second');
  assert.deepEqual(page.drain(), [[1, 0x20, 0x39, 1]]);
  page.inject('space', false, 'first');
  assert.deepEqual(page.drain(), []);
  page.inject('space', false, 'second');
  assert.deepEqual(page.drain(), [[1, 0x20, 0x39, 0]]);
  page.inject('space', false, 'first');
  assert.deepEqual(page.drain(), []);
});

test('live input: left and right Control own separate physical holds', () => {
  const page = liveInputPage();
  page.key('ControlLeft', true);
  page.key('ControlRight', true);
  assert.deepEqual(page.drain(), [[1, 0x11, 0x1D, 1]]);
  page.key('ControlLeft', false);
  assert.deepEqual(page.drain(), []);
  page.key('ControlRight', false);
  assert.deepEqual(page.drain(), [[1, 0x11, 0x1D, 0]]);
});

test('live input: a newly opened paper menu cannot swallow touch or physical releases', () => {
  const page = liveInputPage();
  page.inject('up', true, 'touch');
  page.key('KeyW', true);
  assert.deepEqual(page.drain(), [[1, 0x26, 0x148, 1], [1, 0x57, 0x11, 1]]);
  page.window.isaacKeyCapture = () => true;
  page.inject('up', false, 'touch');
  page.key('KeyW', false);
  assert.deepEqual(page.drain(), [[1, 0x26, 0x148, 0], [1, 0x57, 0x11, 0]]);
});

test('live input: a touch press consumed by a paper menu has no native release', () => {
  const page = liveInputPage();
  let menuOpen = true;
  page.window.isaacKeyCapture = () => menuOpen;
  page.inject('enter', true, 'touch');
  assert.deepEqual(page.drain(), []);
  menuOpen = false;
  page.inject('enter', false, 'touch');
  assert.deepEqual(page.drain(), []);
});

test('live input: two-argument injected confirmation bypasses paper menu capture', () => {
  const page = liveInputPage();
  page.window.isaacKeyCapture = () => true;
  page.inject('ENTER', true);
  page.inject('ENTER', false);
  assert.deepEqual(page.drain(), [[1, 0x0D, 0x1C, 1], [1, 0x0D, 0x1C, 0]]);
});

test('live input: typing and a focused dialog suppress downs but release existing physical holds', () => {
  const page = liveInputPage();
  const input = {
    closest(selector) { return selector.split(',').map((part) => part.trim()).includes('input') ? this : null; },
    dispatch(type, event) { event.stopPropagation(); },
  };
  page.key('KeyW', true);
  assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 1]]);
  // An ordinary input lets keydown bubble; its dialog stops keyup at the target.
  page.key('KeyA', true, { closest: input.closest });
  page.key('KeyW', false, input);
  assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 0]]);
  page.key('KeyW', true);
  assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 1]]);
  page.saves.open = true;
  page.key('KeyA', true);
  page.key('KeyW', false);
  assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 0]]);
});

test('live input: blur and hidden release only physical owners', () => {
  for (const lifecycle of ['blur', 'hidden']) {
    const page = liveInputPage();
    page.key('KeyW', true);
    page.inject('w', true, 'touch');
    page.key('KeyA', true);
    assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 1], [1, 0x41, 0x1E, 1]]);
    if (lifecycle === 'blur') page.window.dispatch('blur');
    else {
      page.document.dispatch('visibilitychange');
      assert.deepEqual(page.drain(), [], 'a visible document keeps physical holds');
      page.document.hidden = true;
      page.document.dispatch('visibilitychange');
    }
    assert.deepEqual(page.drain(), [[1, 0x41, 0x1E, 0]], lifecycle);
    page.inject('w', false, 'touch');
    assert.deepEqual(page.drain(), [[1, 0x57, 0x11, 0]], lifecycle);
  }
});

test('round 53: draws in the standard quad pattern take one static index buffer, no upload', () => {
  const ca = readFileSync(join(root, 'scripts', 'recomp', 'host', 'src', 'host_gl_clientarrays.c'), 'utf8');
  assert.ok(ca.includes('if (quad_mode() && is_quad_block(isrc, count, type) && quad_ibo_ready(type, (uint32_t)count / 6u)) {'), 'the quad path comes before the ring');
  assert.ok(ca.includes('glDrawElements(mode, count, type, (const void *)0);   /* the static quad indices, from the start */'), 'drawn from offset 0 of the static buffer');
  assert.ok(ca.includes('if (g_bound_ibo != g_iring.buf) { glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, g_iring.buf); g_bound_ibo = g_iring.buf; }'), 'a reused ring block rebinds the ring after a quad draw');
  assert.ok(ca.includes('getenv("ISAAC_GL_QUAD_IBO")'), 'ISAAC_GL_QUAD_IBO=0 is the A/B');
  assert.ok(ca.includes('%u draws on the static quad index buffer (pattern %u %u %u %u %u %u), %u index blocks not the pattern'), 'the census');
});

test('the node runner serves every module the pipeline imports', () => {
  // round 74 gave boot_web.mjs a sibling and the runner answered 404 for it: an
  // ES import that 404s is a module graph that never resolves, so window.isaacDone
  // was never set and every run sat on its 20-minute timeout with an empty log.
  // Served by shape now, and this is the pin that says so.
  const runner = readFileSync(join(root, 'scripts', 'recomp', 'web', 'run_web.mjs'), 'utf8');
  assert.ok(runner.includes("if (/^\\/[A-Za-z0-9_.-]+\\.mjs$/.test(rel)) return { file: join(HERE, rel.slice(1)) };"),
    'a page module is served by shape, not by name');
  // and the shape covers what is actually imported, transitively
  const web = join(root, 'scripts', 'recomp', 'web');
  const seen = new Set(['boot_web.mjs']);
  const queue = ['boot_web.mjs'];
  while (queue.length) {
    const f = queue.shift();
    const src = readFileSync(join(web, f), 'utf8');
    for (const m of src.matchAll(/from '\.\/([A-Za-z0-9_.-]+\.mjs)'/g)) {
      const dep = m[1];
      if (dep === 'boot.mjs') continue;              // the build output, served from BOOT
      assert.match(dep, /^[A-Za-z0-9_.-]+\.mjs$/, `${dep} would not match the runner's rule`);
      assert.ok(existsSync(join(web, dep)), `${f} imports ${dep}, which is not beside it`);
      if (!seen.has(dep)) { seen.add(dep); queue.push(dep); }
    }
  }
  assert.ok(seen.has('mods.mjs') && seen.has('zip.mjs'), 'and it does reach the round-74 modules');
});

test('round 59: the saves round trip is driven on the shipping page, and the menu says what it does', () => {
  const d = readFileSync(join(root, 'scripts', 'recomp', 'web', 'drive_saves.mjs'), 'utf8');
  assert.ok(d.includes("page.on('filechooser', (fc) => {") && d.includes('const nextChooser = (ms) =>'), 'one file-chooser listener for the whole drive, a queue behind it (the reloads in between)');
  assert.ok(d.includes("const keyOf = (n) => SAVE_DIR + `persistentgamedata${n}.dat`;") && d.includes('const lookalikes = (all, n) =>'), 'a file is found by the exact key the page writes; the engine\'s save_backups copies are named, not counted');
  assert.ok(d.includes("check(imported.length === 1 && same(imported[0].bytes, before[0].bytes)") && d.includes('a bare .dat imports into file 3 under this file'), 'the import is checked before the page reloads itself, and a bare .dat goes in too');
  const m = readFileSync(join(root, 'scripts', 'recomp', 'web', 'menu_overlay.mjs'), 'utf8');
  assert.ok(m.includes("log(`[menu] ${label} for file ${state.slot + 1}`);") && m.includes("log(`[menu] ${state.message}`);") && m.includes('message: () => state.message,'), 'the menu logs the choice and its outcome, and exposes the message');
  const pl = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
  assert.ok(pl.includes("console.log('[menu] the file chooser was asked for');"), 'the import logs the chooser call');
});

test('round 60: after the boot the reader Worker drops what it fetched ahead and keeps a small read-ahead', () => {
  const b = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(b.includes('const READER_PLAY_BUDGET = 8 << 20, READER_CLEAR_FRAME = 600;'), 'the play budget and the frame');
  assert.ok(b.includes("if (n === READER_CLEAR_FRAME && reader) { reader.postMessage({ clear: true, budget: READER_PLAY_BUDGET }); trailJobs = null; }"), 'the page tells the Worker at frame 600');
  assert.ok(b.includes("if (d.clear) { cache.clear(); held = inflightBytes; budget = d.budget; jobs = []; ji = 0; return; }"), 'the Worker drops its cache and the trail, keeps what is in flight, takes the new budget');
});

test('round 60: a large texture upload goes in bands, so the GL transfer chunk never grows past 4 MB', () => {
  const g = readFileSync(join(root, 'scripts', 'recomp', 'host', 'src', 'host_gl_webgl.c'), 'utf8');
  assert.ok(g.includes('#define TEX_BAND_BYTES (4u << 20)') && g.includes('getenv("ISAAC_GL_TEX_BAND")'), 'the band size and the A/B switch');
  assert.ok(g.includes('glTexImage2D(target, (GLint)A(1), (GLint)A(2), w, h, (GLint)A(5), format, type, NULL);') && g.includes('glTexSubImage2D(target, (GLint)A(1), 0, y, w, n, format, type, px + (size_t)y * row);'), 'a null allocation, then rows');
  assert.ok(g.includes('uint32_t row = ((uint32_t)w * bpp + 3u) & ~3u;'), 'rows at the default unpack alignment');
  assert.ok(g.includes('texture uploads: %u, %u of them in bands of %u MB (%u bands)%s'), 'the census line');
  const b = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.ok(b.includes("dropBody(blob);                                           // round 60: this frame lives as long as main() does"), 'the placed image\'s bytes are dropped');
  const d = readFileSync(join(root, 'scripts', 'recomp', 'web', 'drive_memory.mjs'), 'utf8');
  assert.ok(d.includes("await cdp.send('HeapProfiler.collectGarbage')") && d.includes('window.__texUploads = T;'), 'the memory driver collects garbage before its reading and counts the uploads');
});

function readerWorkerSource() {
  // Cook the template exactly as the page does before evaluating the worker.
  const b = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  const open = b.indexOf('`', b.indexOf('const READER_WORKER'));
  let end = -1, depth = 0;
  for (let i = open + 1; i < b.length; i++) {
    const c = b[i];
    if (c === '\\') { i++; continue; }
    if (depth === 0 && c === '`') { end = i; break; }
    if (c === '$' && b[i + 1] === '{') { depth++; i++; continue; }
    if (depth > 0 && c === '}') depth--;
  }
  assert.ok(end > open, 'the template closes');
  const raw = b.slice(open + 1, end);

  return new Function('return `' + raw + '`')();
}

function deferredReaderWorker() {
  const requests = [], messages = [], downloads = [], timers = [];
  let complete;
  const completed = new Promise((resolve) => { complete = resolve; });
  const worker = {
    Blob, Response, DecompressionStream,
    fetch(url, init) {
      return new Promise((resolve) => requests.push({ url, init, resolve }));
    },
    setTimeout(callback) { timers.push(callback); },
    postMessage(message) {
      if (message.download) downloads.push({ ...message.download });
      else { messages.push(message); complete(message); }
    },
  };
  new Script(readerWorkerSource()).runInNewContext(worker);
  return { worker, requests, messages, downloads, timers, completed };
}

test('reader scheduler: configured parallel cap bounds a demand and ahead burst', async () => {
  const { worker, requests, messages } = deferredReaderWorker();
  worker.onmessage({ data: { jobs: [], budget: 1024, parallel: 2 } });
  worker.onmessage({ data: {
    want: 1, key: 'demand', url: '/demand', len: 16,
    ahead: [1, 2, 3, 4].map((i) => ['ahead' + i, '/ahead' + i, 16]),
  } });

  assert.deepEqual(requests.map(({ url }) => url), ['/demand', '/ahead1'],
    'the demand uses one slot and only one speculative fetch fits');
  assert.deepEqual(messages, [], 'fetches stay pending until explicitly resolved');
  const demandBytes = Uint8Array.from({ length: 16 }, (_, i) => i);
  const aheadBytes = Uint8Array.from({ length: 16 }, (_, i) => i + 32);
  requests[0].resolve({ ok: true, status: 200, arrayBuffer: async () => demandBytes.buffer });
  requests[1].resolve({ ok: true, status: 200, arrayBuffer: async () => aheadBytes.buffer });
  await new Promise(setImmediate);

  assert.equal(messages.length, 1);
  assert.equal(messages[0].want, 1);
  assert.equal(messages[0].hit, false);
  assert.deepEqual(new Uint8Array(messages[0].buf), demandBytes);
  worker.onmessage({ data: { want: 2, key: 'ahead1', url: '/ahead1', len: 16 } });
  assert.equal(messages.length, 2);
  assert.equal(messages[1].want, 2);
  assert.equal(messages[1].hit, true);
  assert.deepEqual(new Uint8Array(messages[1].buf), aheadBytes);
  assert.deepEqual(requests.map(({ url }) => url), ['/demand', '/ahead1'],
    'the admitted speculative fetch supplies the later demand from cache');
});

test('reader scheduler: demand starts with all speculative slots occupied', async () => {
  const { worker, requests, messages } = deferredReaderWorker();
  worker.onmessage({ data: {
    jobs: [['trail1', '/trail1', 16], ['trail2', '/trail2', 16]],
    budget: 1024, parallel: 2,
  } });
  assert.deepEqual(requests.map(({ url }) => url), ['/trail1', '/trail2']);
  worker.onmessage({ data: {
    want: 1, key: 'demand', url: '/demand', len: 16,
    ahead: [['ahead', '/ahead', 16]],
  } });
  assert.deepEqual(requests.map(({ url }) => url), ['/trail1', '/trail2', '/demand'],
    'demand bypasses the occupied slots, but additional speculation does not');

  const bytes = Uint8Array.from({ length: 16 }, (_, i) => 255 - i);
  requests[2].resolve({ ok: true, status: 200, arrayBuffer: async () => bytes.buffer });
  await new Promise(setImmediate);
  assert.equal(messages.length, 1, 'demand finishes while both speculative fetches remain pending');
  assert.equal(messages[0].want, 1);
  assert.equal(messages[0].hit, false);
  assert.deepEqual(new Uint8Array(messages[0].buf), bytes);

  for (const request of requests.slice(0, 2)) {
    request.resolve({ ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(16) });
  }
  await new Promise(setImmediate);
});

test('reader downloads: compressed ranges count stored bytes, not decoded output', async () => {
  const { worker, requests, messages, downloads, completed } = deferredReaderWorker();
  const plain = Uint8Array.from({ length: 32 }, (_, i) => i * 3);
  const packed = gzipSync(plain);
  const key = Uint8Array.from({ length: 256 }, (_, i) => 255 - i);
  const stored = Uint8Array.from(packed, (byte, i) => byte ^ key[(256 + i) & 255] ^ (((256 + i) >> 8) & 255));
  const url = 'https://assets.example/stream.bin?v=immutable&w=8';
  const windowUrl = url + '#w=8-' + (8 + stored.length - 1) + '@256!1*2-4';
  worker.onmessage({ data: { xorKey: key } });
  worker.onmessage({ data: { jobs: [['window', windowUrl, 4]], budget: 1024, parallel: 2 } });
  assert.deepEqual(requests.map(({ url }) => url), [url]);
  assert.equal(requests[0].init.headers.Range, 'bytes=8-' + (8 + stored.length - 1));
  assert.deepEqual(downloads, []);
  requests[0].resolve(new Response(stored, {
    status: 206, headers: { 'content-range': 'bytes 8-' + (8 + stored.length - 1) + '/128' },
  }));
  // Attach demand while decompression is in flight.
  worker.onmessage({ data: { want: 1, key: 'window', url: windowUrl, len: 4 } });
  await completed;
  assert.deepEqual(downloads, [{ url, from: 8, to: 8 + stored.length }]);
  assert.deepEqual(Array.from(new Uint8Array(messages[0].buf)), Array.from(plain.slice(2, 6)));
});

test('reader downloads: completed speculative response is not counted again on cached demand', async () => {
  const { worker, requests, messages, downloads } = deferredReaderWorker();
  const bytes = Uint8Array.from([9, 7, 5, 3]);
  const url = 'https://assets.example/stream.bin?v=immutable&w=20';
  const rangeUrl = url + '#r=20-23!32';
  worker.onmessage({ data: { jobs: [['cached', rangeUrl, 4]], budget: 1024, parallel: 2 } });
  requests[0].resolve(new Response(bytes, { status: 206, headers: { 'content-range': 'bytes 20-23/32' } }));
  await new Promise(setImmediate);
  assert.deepEqual(messages, [], 'background download has no waiting engine read');
  assert.deepEqual(downloads, [{ url, from: 20, to: 24 }]);
  worker.onmessage({ data: { want: 1, key: 'cached', url: rangeUrl, len: 4 } });
  assert.equal(requests.length, 1);
  assert.deepEqual(downloads, [{ url, from: 20, to: 24 }]);
  assert.equal(messages[0].hit, true);
  assert.deepEqual(Array.from(new Uint8Array(messages[0].buf)), Array.from(bytes));
});

test('reader downloads: failed and short bodies earn no credit before existing retry succeeds', async () => {
  const { worker, requests, messages, downloads, timers } = deferredReaderWorker();
  const url = 'https://assets.example/stream.bin?v=immutable&w=20';
  const bytes = Uint8Array.from([2, 4, 6, 8]);
  worker.onmessage({ data: { want: 1, key: 'retry', url: url + '#r=20-23!32', len: 4 } });
  let rejectBody;
  requests[0].resolve({
    ok: true, status: 206, headers: new Headers({ 'content-range': 'bytes 20-23/32' }),
    arrayBuffer: () => new Promise((resolve, reject) => { rejectBody = reject; }),
  });
  await new Promise(setImmediate);
  assert.deepEqual(downloads, [], 'response headers are not downloaded bytes');
  rejectBody(new Error('connection closed'));
  await new Promise(setImmediate);
  assert.deepEqual(downloads, []);
  timers.shift()();
  await new Promise(setImmediate);
  requests[1].resolve(new Response(bytes.slice(0, 3), {
    status: 206, headers: { 'content-range': 'bytes 20-23/32' },
  }));
  await new Promise(setImmediate);
  assert.deepEqual(downloads, []);
  assert.deepEqual(messages, [], 'short body does not reach engine');
  timers.shift()();
  await new Promise(setImmediate);
  requests[2].resolve(new Response(bytes, {
    status: 206, headers: { 'content-range': 'bytes 20-23/32' },
  }));
  await new Promise(setImmediate);
  assert.equal(requests.length, 3, 'the existing three-attempt budget is unchanged');
  assert.deepEqual(downloads, [{ url, from: 20, to: 24 }]);
  assert.deepEqual(Array.from(new Uint8Array(messages[0].buf)), Array.from(bytes));
});

test('reader downloads: wrong response offsets are cancelled before retrying the requested range', async () => {
  const { worker, requests, messages, downloads, timers } = deferredReaderWorker();
  const url = 'https://assets.example/stream.bin?v=immutable&w=20';
  const bytes = Uint8Array.from([2, 4, 6, 8]);
  worker.onmessage({ data: { want: 1, key: 'offset', url: url + '#r=20-23!32', len: 4 } });
  let cancelled = false;
  const wrongBody = new ReadableStream({
    start(controller) { controller.enqueue(bytes); },
    cancel() { cancelled = true; },
  });
  requests[0].resolve(new Response(wrongBody, {
    status: 206, headers: { 'content-range': 'bytes 24-27/32' },
  }));
  await new Promise(setImmediate);
  assert.equal(cancelled, true, 'rejected range stops downloading before retry');
  assert.deepEqual(downloads, []);
  assert.deepEqual(messages, [], 'the wrong bytes never reach the engine');
  timers.shift()();
  await new Promise(setImmediate);
  requests[1].resolve(new Response(bytes, {
    status: 206, headers: { 'content-range': 'bytes 20-23/32' },
  }));
  await new Promise(setImmediate);
  assert.deepEqual(downloads, [{ url, from: 20, to: 24 }]);
  assert.deepEqual(Array.from(new Uint8Array(messages[0].buf)), Array.from(bytes));
});

for (const fallback of [false, true]) {
  test('reader downloads: whole 200 ' + (fallback ? 'fallback' : 'range response') + ' counts full body and returns requested slice', async () => {
    const { worker, requests, messages, downloads } = deferredReaderWorker();
    const url = 'https://assets.example/stream.bin?v=immutable&w=8';
    const bytes = Uint8Array.from({ length: 32 }, (_, i) => i + 10);
    worker.onmessage({ data: { want: 1, key: 'whole', url: url + '#r=8-11!32', len: 4 } });
    if (fallback) {
      let cancelled = false;
      const wrongBody = new ReadableStream({
        start(controller) { controller.enqueue(bytes.slice(8, 12)); },
        cancel() { cancelled = true; },
      });
      requests[0].resolve(new Response(wrongBody, {
        status: 206, headers: { 'content-range': 'bytes 8-11/64' },
      }));
      await new Promise(setImmediate);
      assert.equal(cancelled, true, 'wrong-total response stops downloading before fallback');
      assert.deepEqual(downloads, [], 'a response for the wrong chunk earns no credit');
      assert.equal(requests.length, 2);
      assert.equal(requests[1].init, undefined, 'fallback requests the whole chunk');
    }
    requests[requests.length - 1].resolve(new Response(bytes));
    await new Promise(setImmediate);
    assert.deepEqual(downloads, [{ url, from: 0, to: 32 }]);
    assert.deepEqual(Array.from(new Uint8Array(messages[0].buf)), Array.from(bytes.slice(8, 12)));
  });
}

test('round 87: the credit is drawn on the menu paper and nowhere else', () => {
  // Bottom-left of the picture, in the game's own font. #stage IS the 16:9
  // picture and the canvas fills it, so a percentage from the left edge is a
  // percentage into the game rather than into the letterbox around it.
  const ov = readFileSync(join(root, 'scripts', 'recomp', 'web', 'menu_overlay.mjs'), 'utf8');
  assert.match(ov, /const CREDIT_TEXT = 'ported by chiikabu';/, 'the text');
  assert.match(ov, /creditEl\.id = 'credit';/, 'its own surface');
  assert.match(ov, /left:1%;bottom:1\.2%/, 'bottom-left');
  assert.match(ov, /const CREDIT_ON = new Set\(\[3, 7, 9, 10, 19\]\);/,
    'the paper and the rows off it, and no other screen');
  // the same two passes the fps readout uses: a dark shadow, then the white
  assert.match(ov, /drawText\(gg, CREDIT_TEXT, 3, 3, A\.atlas\);/);
  assert.match(ov, /drawText\(gg, CREDIT_TEXT, 2, 2, A\.atlasWhite\);/);
  // the canvas keeps game-pixel geometry and only the box it is shown in
  // shrinks, so the size is one knob and the glyphs stay crisp
  assert.match(ov, /\$\{\(CREDIT_W \/ GAME_W \* 100 \* CREDIT_ZOOM\)\.toFixed\(2\)\}%/);
  assert.match(ov, /CREDIT_ZOOM = 0\.\d+;/, 'and it is smaller than the game\'s own menu text');

  // the screen id is read out of the engine's own memory, which this port can
  // do because a guest VA is a wasm address (isaac_g is the identity)
  const play = readFileSync(join(root, 'scripts', 'recomp', 'web', 'play.mjs'), 'utf8');
  // Anchored on an object the code names and a field the code tests. The first
  // attempt read a loose .data word that had tracked the screen for a whole
  // session and reported a different number on another machine: the index says
  // it has one read and one write in the binary, both against 0. A correlate
  // found by diffing is not a variable.
  assert.match(play, /const MENU_MGR_PTR = 0x00c72a20, MENU_SCREEN_OFF = 0x40;/,
    'the manager pointer and the screen field');
  assert.ok(!/0x00c79970/.test(play), 'and not the word that merely correlated');
  assert.match(play, /const screen = readMenuId\(\), view = menuView\(\)/, 'the screen, polled');
  assert.match(play, /editMenu\.setScreen\(screen\);/, 'and the credit follows it');
  const boot = readFileSync(join(root, 'scripts', 'recomp', 'web', 'boot_web.mjs'), 'utf8');
  assert.match(boot, /window\.isaacGuest = \{/, 'the page can read guest memory');
  // HEAPU32 is not exported by this build: touching it aborts the runtime
  const bootCode = boot.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  assert.ok(!/m\.HEAPU32/.test(bootCode), 'and it does it through HEAPU8, the view this build exports');
});
