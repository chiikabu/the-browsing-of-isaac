// boot_worker.mjs -- run boot_integration.mjs inside a worker thread with a
// large native stack. V8 bounds wasm call depth by the thread's stack;
// node's main thread cannot grow past ~1 MB on Windows, but a Worker takes
// resourceLimits.stackSizeMb. Same arguments and environment as the driver:
//
//   node boot_worker.mjs [stackMb] <segs> <stage>
//
// Used in round 14c to tell deep recursion (passes with a big stack) from
// infinite recursion (fails at any size) after the first room spawned.
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const stackMb = Number(process.argv[2] || 512);
const args = process.argv.slice(3);
const w = new Worker(join(here, 'boot_integration.mjs'), {
  argv: args,
  resourceLimits: { stackSizeMb: stackMb },
  stdout: false, stderr: false,
});
w.on('error', (e) => { console.log(`worker error: ${e && e.stack ? e.stack : e}`); process.exitCode = 1; });
w.on('exit', (code) => { process.exitCode = code; });
