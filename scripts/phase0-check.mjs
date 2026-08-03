/**
 * Phase 0 environment check — writes report JSON to stdout and optional path.
 */
import { existsSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const gameDefault =
  process.env.ISAAC_GAME_DIR ||
  'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth';

const report = {
  when: new Date().toISOString(),
  node: process.version,
  gameDir: gameDefault,
  gameDirExists: existsSync(gameDefault),
  exe: null,
  resources: null,
  packed: null,
  emsdk: process.env.EMSDK || null,
  emccOk: false,
  ghidra: null,
  blockers: [],
};

const exe = join(gameDefault, 'isaac-ng.exe');
if (existsSync(exe)) {
  const st = statSync(exe);
  report.exe = { path: exe, size: st.size, mtime: st.mtime.toISOString() };
} else {
  report.blockers.push('isaac-ng.exe missing');
}

const resDir = join(gameDefault, 'resources');
report.resources = { path: resDir, exists: existsSync(resDir) };
if (!report.resources.exists) report.blockers.push('resources/ missing');

const packed = join(resDir, 'packed');
report.packed = { path: packed, exists: existsSync(packed) };
if (!report.packed.exists) report.blockers.push('resources/packed missing');

const emccCandidates = report.emsdk ? [
  join(report.emsdk, 'upstream/emscripten/emcc.exe'),
  join(report.emsdk, 'upstream/emscripten/emcc.bat'),
  join(report.emsdk, 'upstream/emscripten/emcc'),
  join(report.emsdk, 'upstream/emscripten/emcc.py'),
] : [];
report.emccPath = emccCandidates.find((p) => existsSync(p)) || null;
if (report.emccPath) {
  report.emccOk = true;
} else {
  report.blockers.push('emcc not found under EMSDK');
}

const ghidra = process.env.GHIDRA_HOME || null;
report.ghidra = { path: ghidra, exists: Boolean(ghidra && existsSync(ghidra)) };
if (!report.ghidra.exists) {
  // not a hard blocker if PE analysis scripts work, but note it
  report.blockers.push('GHIDRA_HOME is unset or unavailable (optional once PE string dump exists)');
}

console.log(JSON.stringify(report, null, 2));
const out = process.env.PHASE0_OUT;
if (out) {
  mkdirSync(join(out, '..'), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2));
}
process.exit(report.exe && report.resources.exists && report.emccOk ? 0 : 2);
