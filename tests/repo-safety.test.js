import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gate = join(root, 'scripts', 'check-repo-safety.mjs');

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

function initializeRepository(directory) {
  mkdirSync(directory, { recursive: true });
  git(directory, ['init']);
  git(directory, ['config', 'user.email', 'repo-safety@example.test']);
  git(directory, ['config', 'user.name', 'Repository Safety Test']);
  writeFileSync(join(directory, 'README.md'), 'fixture\n');
  git(directory, ['add', 'README.md']);
  git(directory, ['commit', '-m', 'initial']);
}

function commitFile(directory, path, contents) {
  const target = join(directory, ...path.split('/'));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
  git(directory, ['add', path]);
  git(directory, ['commit', '-m', `add ${path}`]);
}

function runGate(directory) {
  return spawnSync('node', [gate], {
    cwd: directory,
    encoding: 'utf8',
    env: { ...process.env, REPO_SAFETY_ROOT: directory },
  });
}

function withFixture(callback) {
  const temporary = mkdtempSync(join(tmpdir(), 'isaac-repo-safety-'));
  try {
    const superproject = join(temporary, 'superproject');
    initializeRepository(superproject);
    callback({ temporary, superproject });
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

test('repo safety recursively rejects a large tracked file in a submodule', () => {
  withFixture(({ temporary, superproject }) => {
    const moduleSource = join(temporary, 'module-source');
    initializeRepository(moduleSource);
    commitFile(moduleSource, 'payload.bin', Buffer.alloc(5 * 1024 * 1024 + 1));
    git(superproject, ['-c', 'protocol.file.allow=always', 'submodule', 'add', moduleSource, 'third_party/fixture']);
    git(superproject, ['commit', '-am', 'add fixture submodule']);

    const result = runGate(superproject);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /third_party\/fixture: payload\.bin: \d+ bytes exceeds/);
  });
});

test('repo safety permits only the hash-pinned Zydis generated include', () => {
  withFixture(({ temporary, superproject }) => {
    const upstreamPath = join(root, 'third_party', 'REPENTOGON', 'libs', 'zydis',
      'src', 'Generated', 'InstructionDefinitions.inc');
    const pinnedContents = readFileSync(upstreamPath);
    const moduleSource = join(temporary, 'zydis-source');
    const trackedPath = 'src/Generated/InstructionDefinitions.inc';
    initializeRepository(moduleSource);
    commitFile(moduleSource, trackedPath, pinnedContents);
    const modulePath = 'third_party/REPENTOGON/libs/zydis';
    git(superproject, ['-c', 'protocol.file.allow=always', 'submodule', 'add', moduleSource, modulePath]);
    git(superproject, ['commit', '-am', 'add pinned Zydis fixture']);

    const checkout = join(superproject, ...modulePath.split('/'));
    const checkedOutFile = join(checkout, ...trackedPath.split('/'));
    // Global checkout conversion can rewrite this generated text file on
    // Windows. Restore the exact audited bytes before exercising the hash pin.
    writeFileSync(checkedOutFile, pinnedContents);
    const exact = runGate(superproject);
    assert.equal(exact.status, 0, exact.stderr || exact.stdout || 'exact repository, path, size, and hash must pass');

    const mutated = Buffer.from(pinnedContents);
    mutated[0] ^= 0xff;
    writeFileSync(checkedOutFile, mutated);
    let result = runGate(superproject);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /third_party\/REPENTOGON\/libs\/zydis: src\/Generated\/InstructionDefinitions\.inc: \d+ bytes exceeds/);

    writeFileSync(checkedOutFile, pinnedContents);
    const lookalike = 'src/Generated/InstructionDefinitions-copy.inc';
    writeFileSync(join(checkout, ...lookalike.split('/')), pinnedContents);
    git(checkout, ['add', lookalike]);
    result = runGate(superproject);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /third_party\/REPENTOGON\/libs\/zydis: src\/Generated\/InstructionDefinitions-copy\.inc: \d+ bytes exceeds/);
  });
});

test('repo safety rejects dangerous local files but permits explicit private roots', () => {
  withFixture(({ superproject }) => {
    writeFileSync(join(superproject, '.gitignore'), [
      '.scratch/', 'output/', 'extracted_work/', 'tools/', 'game-instance/',
      '*.dll', '*.wasm', '*.bin',
    ].join('\n') + '\n');
    git(superproject, ['add', '.gitignore']);
    git(superproject, ['commit', '-m', 'ignore local artifacts']);

    for (const path of [
      '.scratch/private.dll', 'output/release.zip', 'extracted_work/game.dat', 'tools/helper.exe',
      'game-instance/isaac-phase6-full.zip', 'game-instance/nested/extra.dll',
    ]) {
      const target = join(superproject, ...path.split('/'));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, 'private fixture');
    }
    assert.equal(runGate(superproject).status, 0);

    writeFileSync(join(superproject, 'leaked.dll'), 'not allowed');
    writeFileSync(join(superproject, 'large.bin'), Buffer.alloc(5 * 1024 * 1024 + 1));
    const result = runGate(superproject);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /leaked\.dll: dangerous ignored file outside an explicit private root/);
    assert.match(result.stderr, /large\.bin: dangerous ignored file outside an explicit private root/);
  });
});

test('repo safety rejects a lookalike web runtime and an uninitialized submodule', () => {
  withFixture(({ temporary, superproject }) => {
    writeFileSync(join(superproject, '.gitignore'), 'web/*.wasm\n');
    git(superproject, ['add', '.gitignore']);
    git(superproject, ['commit', '-m', 'ignore generated wasm']);
    mkdirSync(join(superproject, 'web'), { recursive: true });
    writeFileSync(join(superproject, 'web', 'unrelated.wasm'), 'not an approved runtime');
    let result = runGate(superproject);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /web\/unrelated\.wasm: dangerous ignored file outside an explicit private root/);

    rmSync(join(superproject, 'web', 'unrelated.wasm'));
    for (const name of ['first', 'second']) {
      const moduleSource = join(temporary, `${name}-module-source`);
      initializeRepository(moduleSource);
      git(superproject, ['-c', 'protocol.file.allow=always', 'submodule', 'add', moduleSource, `third_party/${name}`]);
    }
    git(superproject, ['commit', '-am', 'add fixture submodules']);
    git(superproject, ['submodule', 'deinit', '-f', 'third_party/first']);
    git(superproject, ['submodule', 'deinit', '-f', 'third_party/second']);
    result = runGate(superproject);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Submodules are not initialized:/);
    assert.match(result.stderr, /third_party\/first @ [0-9a-f]{40}/);
    assert.match(result.stderr, /third_party\/second @ [0-9a-f]{40}/);
  });
});

test('repo safety permits only the three exact native stub DLL paths', () => {
  withFixture(({ superproject }) => {
    writeFileSync(join(superproject, '.gitignore'), 'native/**/*.dll\n');
    git(superproject, ['add', '.gitignore']);
    git(superproject, ['commit', '-m', 'ignore native build products']);

    for (const path of [
      'native/eos_stub/EOSSDK-Win32-Shipping.dll',
      'native/openal_stub/OpenAL32.dll',
      'native/steam_stub/steam_api.dll',
    ]) {
      const target = join(superproject, ...path.split('/'));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, `approved fixture: ${path}\n`);
    }
    assert.equal(runGate(superproject).status, 0);

    for (const path of [
      'native/eos_stub/EOSSDK-Win64-Shipping.dll',
      'native/openal_stub/OpenAL32-copy.dll',
      'native/steam_stub/steam_api64.dll',
    ]) {
      writeFileSync(join(superproject, ...path.split('/')), `lookalike fixture: ${path}\n`);
    }
    const result = runGate(superproject);
    assert.notEqual(result.status, 0);
    for (const path of [
      'native/eos_stub/EOSSDK-Win64-Shipping.dll',
      'native/openal_stub/OpenAL32-copy.dll',
      'native/steam_stub/steam_api64.dll',
    ]) {
      assert.match(result.stderr, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
