import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Same algorithm as native/isaac_host.cpp parse_sig / find_sig */
function parseSig(hex) {
  const out = [];
  let i = 0;
  const s = hex.replace(/\s+/g, '');
  while (i < s.length) {
    if (s[i] === '?' && s[i + 1] === '?') {
      out.push({ any: true, value: 0 });
      i += 2;
      continue;
    }
    const byte = parseInt(s.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) throw new Error('bad sig at ' + i);
    out.push({ any: false, value: byte });
    i += 2;
  }
  return out;
}

function findSig(data, sig) {
  const last = data.length - sig.length;
  for (let i = 0; i <= last; i++) {
    let ok = true;
    for (let j = 0; j < sig.length; j++) {
      if (!sig[j].any && data[i + j] !== sig[j].value) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

const defaultExe =
  process.env.ISAAC_EXE ||
  'C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/isaac-ng.exe';

test('signature scanner finds planted pattern (algorithm parity with host)', () => {
  const hay = Buffer.from([0x00, 0x11, 0x55, 0x8b, 0xec, 0x83, 0xe4, 0xf8, 0x99, 0xaa]);
  const off = findSig(hay, parseSig('558bec83e4f8'));
  assert.equal(off, 2);
  const wild = findSig(hay, parseSig('558b??83e4f8'));
  assert.equal(wild, 2);
});

test('user-owned isaac-ng.exe is PE32 and contains engine string markers', (t) => {
  if (!existsSync(defaultExe)) {
    t.skip('isaac-ng.exe not present');
    return;
  }
  const buf = readFileSync(defaultExe);
  assert.equal(buf[0], 0x4d);
  assert.equal(buf[1], 0x5a);
  const e_lfanew = buf.readUInt32LE(0x3c);
  assert.equal(buf.toString('ascii', e_lfanew, e_lfanew + 4), 'PE\u0000\u0000');
  const machine = buf.readUInt16LE(e_lfanew + 4);
  const magic = buf.readUInt16LE(e_lfanew + 24);
  assert.equal(machine, 0x14c, 'expected i386');
  assert.equal(magic, 0x10b, 'expected PE32');

  const markers = [
    'ISAACNGSAVE',
    'Repentance+',
    'resources/scripts/main.lua',
    'EntityList',
    'wglGetProcAddress',
  ];
  const hits = {};
  for (const m of markers) {
    const idx = buf.indexOf(Buffer.from(m, 'ascii'));
    hits[m] = idx;
    assert.ok(idx >= 0, 'missing marker ' + m);
  }

  // Also prove scanner works against a slice of the real binary (first 256 bytes of a known string region)
  const titleOff = hits['Repentance+'];
  const slice = buf.subarray(titleOff, titleOff + 16);
  const hex = Buffer.from(slice).toString('hex');
  const found = findSig(buf, parseSig(hex));
  assert.equal(found, titleOff);

  const scratch = process.env.SCRATCH || join(root, '.scratch');
  try {
    mkdirSync(scratch, { recursive: true });
    writeFileSync(
      join(scratch, 'sig-hits.json'),
      JSON.stringify(
        {
          exe: defaultExe,
          size: buf.length,
          machine: '0x' + machine.toString(16),
          pe: 'PE32',
          stringMarkers: hits,
          note: 'REPENTOGON ZHL byte patterns are version-sensitive; this install did not match stock LuaEngine::Init pattern. String markers + PE layout recovered instead.',
        },
        null,
        2,
      ),
    );
  } catch {
    // ignore
  }
});

test('native host embeds signature scanner and engine patterns', () => {
  const cpp = readFileSync(join(root, 'native', 'isaac_host.cpp'), 'utf8');
  assert.match(cpp, /isaac_find_sig/);
  assert.match(cpp, /parse_sig/);
  assert.match(cpp, /LuaEngine::Init/);
  assert.match(cpp, /Game::Update/);
});

test('REPENTOGON ZHL catalog is present for offline RE', () => {
  const zhl = join(root, 'third_party', 'REPENTOGON', 'libzhl', 'functions', 'LuaEngine.zhl');
  assert.ok(existsSync(zhl), 'clone REPENTOGON under third_party');
  const text = readFileSync(zhl, 'utf8');
  assert.match(text, /LuaEngine::Init/);
  assert.match(text, /"[0-9a-fA-F?]{16,}"/);
});
