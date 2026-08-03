#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const directory = resolve(process.argv[2] || '.');
const jobs = Math.max(1, Math.min(15, Number(process.argv[3]) || 15));
const files = (await readdir(directory)).filter((name) => name.endsWith('.wasm'));
let next = 0;
let validated = 0;
let exportCount = 0;
let minExports = Number.POSITIVE_INFINITY;
let maxExports = 0;

await Promise.all(Array.from({ length: Math.min(jobs, files.length) }, async () => {
  for (;;) {
    const index = next++;
    if (index >= files.length) return;
    const module = await WebAssembly.compile(await readFile(join(directory, files[index])));
    const count = WebAssembly.Module.exports(module).length;
    exportCount += count;
    minExports = Math.min(minExports, count);
    maxExports = Math.max(maxExports, count);
    validated++;
  }
}));

console.log(JSON.stringify({
  directory,
  modules: files.length,
  validated,
  exportCount,
  minExports: Number.isFinite(minExports) ? minExports : 0,
  maxExports,
  jobs,
}));
