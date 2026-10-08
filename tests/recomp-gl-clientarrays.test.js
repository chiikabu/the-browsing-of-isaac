import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { withWasmBuildCache } from './wasm-build-cache.mjs';

const filename = fileURLToPath(import.meta.url);
const root = join(dirname(filename), '..');
const host = join(root, 'scripts', 'recomp', 'host');
const buildBoot = join(root, 'scripts', 'recomp', 'lift', 'build_boot.py');

// Only the logging dependency is supplied here. Staging, buffer uploads, GL
// validation, shader execution, and pixel readback all use the real code.
// Each nonempty case ends its final referenced attribute at the Wasm memory limit.
const fixture = String.raw`
#include "isaac_host.h"
#include <GLES3/gl3.h>
#include <emscripten.h>
#include <emscripten/heap.h>
#include <emscripten/html5.h>
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

void isaac_gl_enable_vertex_attrib_array(GLuint index);
void isaac_gl_disable_vertex_attrib_array(GLuint index);
void isaac_gl_vertex_attrib_pointer(GLuint index, GLint size, GLenum type,
                                   GLboolean normalized, GLsizei stride,
                                   uint32_t pointer_va);
void isaac_gl_draw_arrays(GLenum mode, GLint first, GLsizei count);
void isaac_gl_draw_arrays_instanced(GLenum mode, GLint first, GLsizei count,
                                   GLsizei prims);
void isaac_gl_draw_elements(GLenum mode, GLsizei count, GLenum type,
                           uint32_t indices_va);

void isaac_log(const char *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    vfprintf(stderr, fmt, ap);
    va_end(ap);
    fputc('\n', stderr);
}

static GLuint shader(GLenum type, const char *source) {
    GLuint object = glCreateShader(type);
    glShaderSource(object, 1, &source, NULL);
    glCompileShader(object);
    GLint ok;
    glGetShaderiv(object, GL_COMPILE_STATUS, &ok);
    if (!ok) {
        char message[2048];
        glGetShaderInfoLog(object, sizeof message, NULL, message);
        isaac_log("shader: %s", message);
        return 0;
    }
    return object;
}

EMSCRIPTEN_KEEPALIVE int initialize(void) {
    EmscriptenWebGLContextAttributes attributes;
    emscripten_webgl_init_context_attributes(&attributes);
    attributes.majorVersion = 2;
    attributes.minorVersion = 0;
    attributes.antialias = EM_FALSE;
    attributes.depth = EM_FALSE;
    attributes.stencil = EM_FALSE;
    attributes.alpha = EM_TRUE;
    attributes.premultipliedAlpha = EM_FALSE;
    attributes.preserveDrawingBuffer = EM_TRUE;
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context =
        emscripten_webgl_create_context("#canvas", &attributes);
    if (context <= 0) return 1;
    if (emscripten_webgl_make_context_current(context) != EMSCRIPTEN_RESULT_SUCCESS)
        return 2;
    GLuint vertex = shader(GL_VERTEX_SHADER,
        "#version 300 es\n"
        "layout(location=0) in vec4 color;\n"
        "layout(location=1) in vec2 position;\n"
        "out vec4 vertexColor;\n"
        "void main() { gl_Position = vec4(position, 0.0, 1.0); vertexColor = color; }\n");
    GLuint fragment = shader(GL_FRAGMENT_SHADER,
        "#version 300 es\n"
        "precision highp float;\n"
        "in vec4 vertexColor; out vec4 result;\n"
        "void main() { result = vertexColor; }\n");
    if (!vertex || !fragment) return 3;
    GLuint program = glCreateProgram();
    glAttachShader(program, vertex);
    glAttachShader(program, fragment);
    glLinkProgram(program);
    GLint ok;
    glGetProgramiv(program, GL_LINK_STATUS, &ok);
    if (!ok) return 4;
    glUseProgram(program);
    glDeleteShader(vertex);
    glDeleteShader(fragment);
    glViewport(0, 0, 64, 64);
    glDisable(GL_DITHER);
    return (int)glGetError();
}

static unsigned color_width(GLenum type, unsigned components) {
    switch (type) {
    case GL_BYTE: case GL_UNSIGNED_BYTE: return components;
    case GL_SHORT: case GL_UNSIGNED_SHORT: case GL_HALF_FLOAT: return components * 2u;
    case GL_INT_2_10_10_10_REV: case GL_UNSIGNED_INT_2_10_10_10_REV: return 4u;
    default: return components * 4u;
    }
}

static void store_color(uint8_t *destination, GLenum type, unsigned components,
                        unsigned palette) {
    unsigned values[4];
    for (unsigned c = 0; c < 4u; ++c)
        values[c] = palette == 2u || (palette == 0u ? c != 1u : c != 0u);
    if (type == GL_INT_2_10_10_10_REV || type == GL_UNSIGNED_INT_2_10_10_10_REV) {
        unsigned maximum = type == GL_INT_2_10_10_10_REV ? 511u : 1023u;
        unsigned alpha = type == GL_INT_2_10_10_10_REV ? 1u : 3u;
        uint32_t word = values[0] * maximum | (values[1] * maximum << 10u)
                      | (values[2] * maximum << 20u) | (values[3] * alpha << 30u);
        memcpy(destination, &word, sizeof word);
        return;
    }
    for (unsigned c = 0; c < components; ++c) {
        switch (type) {
        case GL_BYTE: case GL_UNSIGNED_BYTE: {
            uint8_t value = values[c] * (type == GL_BYTE ? 127u : 255u);
            memcpy(destination + c, &value, sizeof value);
            break;
        }
        case GL_SHORT: case GL_UNSIGNED_SHORT: case GL_HALF_FLOAT: {
            uint16_t value = values[c] * (type == GL_SHORT ? 32767u :
                                         type == GL_HALF_FLOAT ? 0x3c00u : 65535u);
            memcpy(destination + c * 2u, &value, sizeof value);
            break;
        }
        case GL_INT: case GL_UNSIGNED_INT: {
            uint32_t value = values[c] * (type == GL_INT ? 0x7fffffffu : 0xffffffffu);
            memcpy(destination + c * 4u, &value, sizeof value);
            break;
        }
        default: {
            float value = (float)values[c];
            memcpy(destination + c * 4u, &value, sizeof value);
            break;
        }
        }
    }
}

static void clear(void) {
    while (glGetError() != GL_NO_ERROR) {}
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);
}

// Layout 0 interleaves positions first; 1 separates arrays; 2 puts byte colors first.
// draw 0 uses arrays, 1/2/3 use byte/short/int indices, and 4 is instanced.
EMSCRIPTEN_KEEPALIVE int render_case(unsigned layout, GLenum type,
                                    unsigned components, unsigned stride,
                                    unsigned draw, unsigned first, unsigned palette) {
    static const float triangle[3][2] = {{-0.75f, -0.75f}, {0.75f, -0.75f}, {0.0f, 0.75f}};
    unsigned vertices = first + 3u;
    unsigned width = color_width(type, components);
    unsigned color_stride = stride ? stride : width;
    unsigned position_stride = layout != 1u ? stride : (stride ? 12u : 8u);
    unsigned span = (vertices - 1u) * color_stride + width;
    uint32_t end = (uint32_t)emscripten_get_heap_size();
    uint32_t colors = end - span;
    unsigned color_offset = 8u + ((4u - (width & 3u)) & 3u);
    uint32_t positions = layout == 0u ? colors - color_offset : end - 4096u;
    if (layout == 2u) {
        positions = end - ((vertices - 1u) * position_stride + 8u);
        colors = positions - 3u;
    }
    memset(isaac_g(end - 8192u), 0, 8192u);
    for (unsigned i = 0; i < vertices; ++i) {
        const float hidden[2] = {3.0f, 3.0f};
        memcpy(isaac_g(positions + i * position_stride),
               i < first ? hidden : triangle[i - first], sizeof triangle[0]);
        store_color(isaac_g(colors + i * color_stride), type, components, palette);
    }
    clear();
    // Color first deliberately makes an odd byte/short span precede a float
    // array in the fallback. Interleaving also visits the largest end first.
    isaac_gl_enable_vertex_attrib_array(0);
    isaac_gl_enable_vertex_attrib_array(1);
    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);
    isaac_gl_vertex_attrib_pointer(0, components, type, GL_TRUE, stride, colors);
    isaac_gl_vertex_attrib_pointer(1, 2, GL_FLOAT, GL_FALSE,
                                  layout != 1u ? stride : (stride ? 12u : 0u), positions);
    if (draw == 0u) {
        isaac_gl_draw_arrays(GL_TRIANGLES, first, 3);
    } else if (draw == 4u) {
        isaac_gl_draw_arrays_instanced(GL_TRIANGLES, first, 3, 2);
    } else if (draw == 1u) {
        uint8_t indices[3] = {first, first + 1u, first + 2u};
        isaac_gl_draw_elements(GL_TRIANGLES, 3, GL_UNSIGNED_BYTE, isaac_va(indices));
    } else if (draw == 2u) {
        uint16_t indices[3] = {first, first + 1u, first + 2u};
        isaac_gl_draw_elements(GL_TRIANGLES, 3, GL_UNSIGNED_SHORT, isaac_va(indices));
    } else {
        uint32_t indices[3] = {first, first + 1u, first + 2u};
        isaac_gl_draw_elements(GL_TRIANGLES, 3, GL_UNSIGNED_INT, isaac_va(indices));
    }
    return (int)glGetError();
}

EMSCRIPTEN_KEEPALIVE int zero_span_case(unsigned kind) {
    clear();
    isaac_gl_disable_vertex_attrib_array(0);
    glDisableVertexAttribArray(0);
    isaac_gl_enable_vertex_attrib_array(1);
    glEnableVertexAttribArray(1);
    isaac_gl_vertex_attrib_pointer(1, 2, GL_FLOAT, GL_FALSE, 16,
                                  (uint32_t)emscripten_get_heap_size());
    if (kind == 0u) {
        // Fixed restart produces max_index + 1 == 0. No attribute is read.
        uint32_t indices[3] = {0xffffffffu, 0xffffffffu, 0xffffffffu};
        isaac_gl_draw_elements(GL_TRIANGLES, 3, GL_UNSIGNED_INT, isaac_va(indices));
    } else if (kind == 1u) {
        // The unsigned sum wraps to zero, but raw GL must still reject first.
        isaac_gl_draw_arrays(GL_TRIANGLES, -3, 3);
    } else if (kind == 2u) {
        isaac_gl_draw_arrays(GL_TRIANGLES, 0, 0);
    } else if (kind == 3u) {
        isaac_gl_draw_arrays_instanced(GL_TRIANGLES, 0, 3, 0);
    } else {
        isaac_gl_draw_elements(GL_TRIANGLES, 0, GL_UNSIGNED_INT,
                               (uint32_t)emscripten_get_heap_size());
    }
    return (int)glGetError();
}

EMSCRIPTEN_KEEPALIVE int unsupported_type_case(int raw) {
    clear();
    if (raw) {
        glVertexAttribPointer(0, 3, 0x140au /* GL_DOUBLE */, GL_FALSE, 16, NULL);
        glDrawArrays(GL_TRIANGLES, 0, 3);
    } else {
        isaac_gl_vertex_attrib_pointer(0, 3, 0x140au, GL_FALSE, 16,
                                      (uint32_t)emscripten_get_heap_size() - 1024u);
        isaac_gl_draw_arrays(GL_TRIANGLES, 0, 3);
    }
    return (int)glGetError();
}

EMSCRIPTEN_KEEPALIVE uint32_t pixel(int x, int y) {
    uint8_t rgba[4];
    glReadPixels(x, y, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, rgba);
    return rgba[0] | ((uint32_t)rgba[1] << 8u) | ((uint32_t)rgba[2] << 16u)
         | ((uint32_t)rgba[3] << 24u);
}
EMSCRIPTEN_KEEPALIVE int error(void) { return (int)glGetError(); }
`;

const buildFixture = String.raw`
import json, subprocess, sys
from pathlib import Path
root, temporary = map(Path, sys.argv[1:3])
sys.path.insert(0, str(root / 'scripts/recomp/lift'))
from build_boot import ensure_emsdk_env, find_emcc
ensure_emsdk_env()
emcc = find_emcc()
if not emcc:
    print(json.dumps({'skip': 'Emscripten unavailable; set EMCC or EMSDK'}))
    sys.exit(0)
host = root / 'scripts/recomp/host'
command = [emcc, str(temporary / 'fixture.c'), str(host / 'src/host_gl_clientarrays.c'),
           '-I', str(host / 'include'), '-O2', '-std=gnu11', '--no-entry',
           '-sENVIRONMENT=web', '-sMODULARIZE=1', '-sEXPORT_NAME=createClientArrays',
           '-sSINGLE_FILE=1', '-sINITIAL_MEMORY=33554432', '-sALLOW_MEMORY_GROWTH=0',
           '-sMIN_WEBGL_VERSION=2', '-sMAX_WEBGL_VERSION=2', '-sGL_ENABLE_GET_PROC_ADDRESS=0',
           '-sERROR_ON_UNDEFINED_SYMBOLS=1', '-lGL', '-o', str(temporary / 'fixture.js')]
if emcc.endswith('.py'):
    command.insert(0, sys.executable)
result = subprocess.run(command, capture_output=True, text=True, timeout=180)
if result.returncode:
    raise RuntimeError(result.stdout + result.stderr)
print(json.dumps({'built': True}))
`;

const formats = [
  { name: 'signed byte', type: 0x1400, components: 3 },
  { name: 'unsigned byte', type: 0x1401, components: 3 },
  { name: 'signed short', type: 0x1402, components: 3 },
  { name: 'unsigned short', type: 0x1403, components: 3 },
  { name: 'signed int', type: 0x1404, components: 3 },
  { name: 'unsigned int', type: 0x1405, components: 3 },
  { name: 'float', type: 0x1406, components: 3 },
  { name: 'half float', type: 0x140b, components: 3 },
  { name: 'signed packed 2_10_10_10', type: 0x8d9f, components: 4 },
  { name: 'unsigned packed 2_10_10_10', type: 0x8368, components: 4 },
];
const black = [0, 0, 0, 255];
const magenta = [255, 0, 255, 255];
const cyan = [0, 255, 255, 255];
const white = [255, 255, 255, 255];

async function draw(page, entry, args) {
  return page.evaluate(({ entry, args }) => {
    let error = null;
    let exception = null;
    try { error = window.fixture[entry](...args); } catch (caught) { exception = String(caught); }
    const pixels = [[32, 24], [16, 12], [48, 12], [32, 44], [2, 2]].map(([x, y]) => {
      const rgba = window.fixture._pixel(x, y) >>> 0;
      return [rgba & 255, (rgba >>> 8) & 255, (rgba >>> 16) & 255, rgba >>> 24];
    });
    return { exception, error, readError: window.fixture._error(), pixels };
  }, { entry, args });
}

function expectPixels(actual, color, error = 0) {
  assert.deepEqual(actual, {
    exception: null, error, readError: 0,
    pixels: [color, color, color, color, black],
  });
}

// This suite builds only a private single-file fixture. The existing content
// cache copies opaque artifacts, so it can also cache JS with embedded Wasm.
test('client arrays render exact spans at the Wasm memory boundary', async (t) => {
  const python = [process.env.PYTHON, 'python3', 'python'].find((candidate) => candidate &&
    spawnSync(candidate, ['-B', '-c', 'import sys; sys.exit(sys.version_info < (3, 9))'],
      { encoding: 'utf8', timeout: 10000 }).status === 0);
  if (!python) return t.skip('Python 3 unavailable');
  const dir = mkdtempSync(join(tmpdir(), 'isaac-gl-clientarrays-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'fixture.c'), fixture);
  const modulePath = join(dir, 'fixture.js');
  let skipped;
  withWasmBuildCache({
    tag: 'recomp-gl-clientarrays',
    files: [filename, buildBoot, join(host, 'src', 'host_gl_clientarrays.c'), join(host, 'include', 'isaac_host.h')],
    extra: JSON.stringify({ EMCC: process.env.EMCC, EMSDK: process.env.EMSDK }),
    wasmPath: modulePath,
    build() {
      const built = spawnSync(python, ['-B', '-c', buildFixture, root, dir],
        { cwd: root, encoding: 'utf8', timeout: 200000 });
      assert.equal(built.status, 0, built.error?.message || built.stderr || built.stdout);
      skipped = JSON.parse(built.stdout.trim()).skip;
    },
  });
  if (skipped) return t.skip(skipped);
  assert.ok(existsSync(modulePath), 'the private browser fixture was built');
  const script = readFileSync(modulePath);
  // SINGLE_FILE embeds non-ASCII byte text; the browser must decode it as UTF-8.
  const server = createServer((request, response) => {
    if (request.url === '/fixture.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
      response.end(script);
    } else if (request.url === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end('<!doctype html><canvas id="canvas" width="64" height="64"></canvas>' +
        '<script src="/fixture.js"></script><script>' +
        'window.ready = createClientArrays({canvas: document.querySelector("canvas")});</script>');
    } else {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const initialized = await page.evaluate(async () => {
      window.fixture = await window.ready;
      return window.fixture._initialize();
    });
    assert.equal(initialized, 0, 'a real WebGL2 context and linked shader are required');

    await t.test('interleaved float triangle reaches the memory limit with nonzero first', async () => {
      expectPixels(await draw(page, '_render_case', [0, 0x1406, 3, 32, 0, 2, 0]), magenta);
    });
    await t.test('interleaved byte-first records preserve the following float alignment', async () => {
      expectPixels(await draw(page, '_render_case', [2, 0x1401, 3, 12, 0, 0, 0]), magenta);
    });
    for (const format of formats) {
      // Float interleaving is covered by the focused regression above.
      if (format.type !== 0x1406) {
        await t.test(`interleaved ${format.name} keeps its last component`, async () => {
          expectPixels(await draw(page, '_render_case', [0, format.type, format.components, 32, 0, 0, 0]), magenta);
        });
      }
      await t.test(`separate padded ${format.name} aligns the following float array`, async () => {
        expectPixels(await draw(page, '_render_case', [1, format.type, format.components, 16, 0, 0, 0]), magenta);
      });
      await t.test(`tightly packed ${format.name} uses stride zero`, async () => {
        expectPixels(await draw(page, '_render_case', [1, format.type, format.components, 0, 0, 0, 0]), magenta);
      });
    }
    for (const [drawKind, name] of [[1, 'byte'], [2, 'short'], [3, 'int']]) {
      await t.test(`${name} indices include the highest referenced vertex`, async () => {
        expectPixels(await draw(page, '_render_case', [0, 0x1406, 3, 32, drawKind, 2, 0]), magenta);
      });
    }
    await t.test('instanced arrays retain first and the last vertex component', async () => {
      expectPixels(await draw(page, '_render_case', [1, 0x1406, 3, 16, 4, 1, 0]), magenta);
    });
    await t.test('an element wider than its stride uploads all overlapping components', async () => {
      expectPixels(await draw(page, '_render_case', [1, 0x1406, 4, 8, 0, 0, 2]), white);
    });
    await t.test('rewriting the same client memory changes the next triangle', async () => {
      expectPixels(await draw(page, '_render_case', [0, 0x1406, 3, 32, 0, 0, 0]), magenta);
      expectPixels(await draw(page, '_render_case', [0, 0x1406, 3, 32, 0, 0, 1]), cyan);
    });
    await t.test('zero spans retain fixed restart, raw errors, and empty draw behavior', async () => {
      // Prime buffer storage with a valid draw before testing zero-byte staging.
      expectPixels(await draw(page, '_render_case', [1, 0x1406, 3, 0, 0, 0, 0]), magenta);
      for (const kind of [0, 1, 2, 3, 4]) {
        expectPixels(await draw(page, '_zero_span_case', [kind]), black, kind === 1 ? 0x501 : 0);
      }
    });
    await t.test('unsupported attribute types retain raw GL errors and prior attribute state', async () => {
      expectPixels(await draw(page, '_render_case', [1, 0x1406, 3, 0, 0, 0, 0]), magenta);
      const raw = await draw(page, '_unsupported_type_case', [1]);
      expectPixels(raw, magenta, 0x500);
      const staged = await draw(page, '_unsupported_type_case', [0]);
      assert.deepEqual(staged, raw);
    });
    await page.close();
  } finally {
    await browser?.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
