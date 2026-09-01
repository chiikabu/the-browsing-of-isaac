import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { SERVE_HOST, startServer } from '../scripts/serve.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wasmPath = join(root, 'output', 'decomp', 'wasm-slice', 'game-update-slice.wasm');

test('static server defaults to IPv4 loopback and logs its actual endpoint', async (t) => {
  const messages = [];
  const server = await startServer({ port: 0, log: (message) => messages.push(message) });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  assert.equal(typeof address, 'object');
  assert.ok(address);
  assert.equal(SERVE_HOST, '127.0.0.1');
  assert.equal(address.address, SERVE_HOST);
  assert.notEqual(address.address, '0.0.0.0');
  assert.notEqual(address.address, '::');
  assert.equal(messages.length, 1);
  assert.match(messages[0], new RegExp(`http://${SERVE_HOST}:${address.port}/$`));
});

test('static server exposes decomp Wasm and frame-path modules for browser native tick', async (t) => {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, 'scripts', 'decomp', 'build-game-update-slice.mjs')], {
      cwd: root,
      stdio: 'inherit',
    });
    assert.equal(built.status, 0);
  }

  const server = await startServer({ port: 0, log: () => {} });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const { port } = server.address();
  const base = `http://${SERVE_HOST}:${port}`;

  const wasmRes = await fetch(`${base}/@decomp/wasm/game-update-slice.wasm`);
  assert.equal(wasmRes.status, 200);
  assert.match(wasmRes.headers.get('content-type') || '', /wasm|octet-stream/i);
  const wasmBytes = new Uint8Array(await wasmRes.arrayBuffer());
  assert.ok(wasmBytes.byteLength > 1000);

  const scriptRes = await fetch(`${base}/@decomp/scripts/frame-path.mjs`);
  assert.equal(scriptRes.status, 200);
  const scriptText = await scriptRes.text();
  assert.match(scriptText, /NATIVE_WASM/);
  assert.match(scriptText, /loadGameUpdateSliceWasm/);

  // Path traversal under decomp mounts must 404.
  const trav = await fetch(`${base}/@decomp/wasm/../game-update-slice.wasm`);
  assert.equal(trav.status, 404);
});

