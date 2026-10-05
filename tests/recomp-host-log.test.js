import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const host = join(root, 'scripts', 'recomp', 'host');
const require = createRequire(import.meta.url);

// Link the real logger, discarding unrelated host functions and their imports.
const harness = String.raw`
#include "isaac_host.h"
#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

double recomp_last_log_ms;

EMSCRIPTEN_KEEPALIVE void configure(int stamp) {
    setenv("ISAAC_LOG_TIME", stamp ? "1" : "0", 1);
}

EMSCRIPTEN_KEEPALIVE int emit_formatted(int index) {
    double before = emscripten_get_now();
    recomp_last_log_ms = -1;
    isaac_log("message=%04d hex=%08x value=%.2f %% %s", index,
              (unsigned)index, 1.25, "payload");
    double after = emscripten_get_now();
    return recomp_last_log_ms >= before && recomp_last_log_ms <= after;
}

EMSCRIPTEN_KEEPALIVE void emit_body(int length) {
    char body[1101];
    memset(body, 'x', (size_t)length);
    body[length] = '\0';
    isaac_log("%s", body);
}

EMSCRIPTEN_KEEPALIVE void stderr_sentinel(void) {
    fputs("stderr-sentinel", stderr);
    fputc('\n', stderr);
    fflush(stderr);
}
`;

test('compiled host logger delivers complete diagnostics without buffering stderr prefixes', async (t) => {
  const emsdk = process.env.EMSDK || join(homedir(), 'emsdk');
  const emcc = [
    process.env.EMCC,
    join(emsdk, 'upstream', 'emscripten', 'emcc.exe'),
    join(emsdk, 'upstream', 'emscripten', 'emcc'),
  ].find((path) => path && existsSync(path));
  if (!emcc) return t.skip('Emscripten emcc missing; set EMCC');

  const dir = mkdtempSync(join(tmpdir(), 'isaac-host-log-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = join(dir, 'logger.c');
  const modulePath = join(dir, 'logger.cjs');
  writeFileSync(source, harness);
  const built = spawnSync(emcc, [
    source, join(host, 'src', 'host_trap.c'), '-I', join(host, 'include'),
    '-O2', '-ffunction-sections', '-fdata-sections', '-Wl,--gc-sections',
    '--no-entry', '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sSINGLE_FILE=1',
    '-sERROR_ON_UNDEFINED_SYMBOLS=1', '-o', modulePath,
  ], { cwd: root, encoding: 'utf8', timeout: 120000 });
  assert.equal(built.status, 0, built.error?.message || built.stderr || built.stdout);
  const createLogger = require(modulePath);

  for (const stamp of [1, 0]) {
    await t.test(`ISAAC_LOG_TIME=${stamp}`, async () => {
      const stderr = [];
      const warnings = [];
      // A fresh instance also resets isaac_log's cached environment setting.
      const logger = await createLogger({ printErr: (line) => stderr.push(line) });
      logger._configure(stamp);
      const originalWarn = console.warn;
      console.warn = (...args) => warnings.push(args.join(' '));
      try {
        let previousTime = 0;
        function expectMessage(body) {
          assert.equal(warnings.length, 1, 'each call delivers one diagnostic immediately');
          const message = warnings.shift();
          if (!stamp) {
            assert.equal(message, body);
            return;
          }
          const prefix = /^\[ *(\d+\.\d)\] /.exec(message);
          assert.ok(prefix, 'timestamp accompanies the diagnostic, not a later stderr line');
          const elapsed = Number(prefix[1]);
          assert.ok(elapsed >= previousTime, 'elapsed timestamp is monotonic');
          previousTime = elapsed;
          assert.equal(message.slice(prefix[0].length), body);
        }

        for (let batch = 0; batch < 2; batch++) {
          for (let i = 0; i < 128; i++) {
            const index = batch * 128 + i;
            assert.equal(logger._emit_formatted(index), 1, 'last-log timestamp brackets the actual log call');
            expectMessage(`message=${String(index).padStart(4, '0')} hex=${index.toString(16).padStart(8, '0')} value=1.25 % payload`);
          }
          assert.deepEqual(stderr, Array(batch).fill('stderr-sentinel'), 'logging emits no stderr bytes as lines accumulate');
          logger._stderr_sentinel();
          assert.deepEqual(stderr, Array(batch + 1).fill('stderr-sentinel'), 'newline flush has no buffered timestamp tail');
        }

        for (const length of [1023, 1100]) {
          logger._emit_body(length);
          expectMessage('x'.repeat(Math.min(length, 1023)));
        }
        logger._stderr_sentinel();
        assert.deepEqual(stderr, Array(3).fill('stderr-sentinel'), 'full and truncated bodies leave no stderr prefix tail');
      } finally {
        console.warn = originalWarn;
      }
    });
  }
});
