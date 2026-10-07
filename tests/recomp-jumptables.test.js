// Computed jumps must keep recovered cases inside their owning CPU frame.
// Fixtures reproduce MSVC's length-minus-one fallthrough and masked-index
// switch forms. Private-PE checks cover the two observed truncated owners.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const exe = join(root, 'tools', 'isaac-ng.unpacked.exe');
const inventory = join(root, 'output', 'recomp', 'export', 'functions.jsonl');
const index = join(root, 'output', 'decomp', '5129df723e64', 'index', 'pe-index.sqlite');
const python = [
  process.env.PYTHON,
  join(process.env.LOCALAPPDATA ?? '', 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3', 'python',
].find((path) => path && spawnSync(path, ['-c', 'import capstone, pypcode'],
  { encoding: 'utf8', timeout: 10000 }).status === 0);

function runPython(t, source, args = []) {
  if (!python) {
    t.skip('no Python with capstone+pypcode available');
    return null;
  }
  const result = spawnSync(python, ['-B', '-c', source, lift, ...args], {
    cwd: root, encoding: 'utf8', timeout: 120000,
  });
  assert.equal(result.status, 0, `Python exited ${result.status}\n${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

const fixtureProbe = String.raw`
import ctypes, hashlib, json, os, shutil, sqlite3, struct, subprocess, sys, tempfile
from contextlib import closing
from pathlib import Path
from types import SimpleNamespace
sys.path.insert(0, sys.argv[1])
from build_boot import ensure_emsdk_env, find_emcc
import pypcode
from emit import gen_state_header
from jumptables import JumpTables, PEIndex
from lift import Decoder, FuncEmitter, LANG, RegMap, discover_body

class FixturePE:
    def __init__(self):
        self.image_base = 0
        self.image = bytearray(0x4000)
        self.dirs = [(0, 0)] * 6
        self.sections = [SimpleNamespace(name='.text', vaddr=0x1000, vsize=0xff0, raw_size=0x1000),
                         SimpleNamespace(name='.rdata', vaddr=0x3000, vsize=0x200)]
        self.instructions = {}
        self.jump_tables = {}
    def text(self):
        return self.sections[0]
    def section_at(self, va):
        return next((s for s in self.sections if s.vaddr <= va < s.vaddr + s.vsize), None)
    def read(self, va, n):
        if va < 0 or va + n > len(self.image):
            raise ValueError('outside fixture image')
        return bytes(self.image[va:va+n])
    def instruction(self, va, code):
        code = bytes.fromhex(code) if isinstance(code, str) else code
        self.image[va:va+len(code)] = code
        self.instructions[va] = len(code)
        return va + len(code)
    def jump(self, va, target):
        return self.instruction(va, b'\xe9' + struct.pack('<i', target - va - 5))
    def table_jump(self, va, table):
        self.jump_tables[va] = table
        return self.instruction(va, b'\xff\x24\x85' + struct.pack('<I', table))
    def seal(self):
        self.data = bytes(self.image)
        self.sha256 = hashlib.sha256(self.data).hexdigest().upper()

kind = sys.argv[2]
pe = FixturePE()
table = 0x11e0 if kind == 'shared' else 0x10e0
escaped = []
if kind == 'lea':
    # Carry is set before LEA and consumed after every case. The saved EBX
    # and ret 4 expose accidental function splitting or stack consumption.
    at = pe.instruction(0x1000, '53')
    at = pe.instruction(at, '29ce')
    at = pe.instruction(at, 'f9')
    at = pe.instruction(at, '8d41ff')
    site = at
    pe.table_jump(site, table)
    at = pe.instruction(0x1020, '885e03')
    at = pe.instruction(at, '885e02')
    at = pe.instruction(at, '885e01')
    at = pe.instruction(at, '881e')
    at = pe.instruction(at, '83d200')
    at = pe.instruction(at, 'bbefbeadde')
    at = pe.instruction(at, '5b')
    pe.instruction(at, 'c20400')
    targets = [0x1029, 0x1026, 0x1023, 0x1020]
    nominal = {0x1000, 0x1020, 0x1023, 0x1026, 0x1029, 0x1100}
    truncated = site + 7
elif kind in ('mask', 'merged', 'shared'):
    pe.instruction(0x1000, '53')
    pe.jump(0x1001, 0x1010)
    pe.instruction(0x1010, '83e003')
    site = 0x1013
    pe.table_jump(site, table)
    targets = [0x1020, 0x1030, 0x1040, 0x1050]
    for number, target in enumerate(targets, 1):
        at = pe.instruction(target, b'\xbe' + struct.pack('<I', number * 10))
        pe.jump(at, 0x1060)
    # CMOVZ consumes AND's local ZF after crossing a nominal fragment start.
    at = pe.instruction(0x1060, '0f44d6')
    at = pe.instruction(at, 'bbefbeadde')
    at = pe.instruction(at, '5b')
    at = pe.instruction(at, '89e7')
    pe.instruction(at, 'c20400')
    nominal = {0x1000, 0x1010, *targets, 0x1060, 0x1100}
    truncated = 0x1006
elif kind == 'bad-data':
    pe.instruction(0x1000, '85c0')
    pe.instruction(0x1002, b'\x0f\x85' + struct.pack('<i', 0x1040 - 0x1008))
    at = pe.instruction(0x1008, 'ba11000000')
    pe.instruction(at, 'c20400')
    pe.instruction(0x1040, 'ffff')  # FF /7 is an invalid x86 encoding.
    site = 0x1070
    pe.table_jump(site, table)
    targets = [0x1008, 0x1100]
    nominal = {0x1000, 0x1100}
    truncated = 0x1010
else:
    assert kind in ('tail', 'identity')
    pe.instruction(0x1000, '89c6')
    pe.instruction(0x1002, '83e007')
    site = 0x1005
    pe.table_jump(site, table)
    targets = [0x1020, 0x1100, 0x1080, 0x10a0, 0x1110, 0x1110, 0x1100, 0x1080]
    # Case zero falls through into an escaped independent entry. Other
    # cases cover canonical, escaped, data-pointer, and other-owner targets.
    pe.instruction(0x1020, 'bf55000000')
    escaped = [0x1025, 0x1080]
    for target, value in [(0x1025, 17), (0x1100, 34), (0x1080, 51), (0x10a0, 68), (0x1110, 85)]:
        at = pe.instruction(target, b'\xba' + struct.pack('<I', value))
        pe.instruction(at, 'c20400')
    struct.pack_into('<I', pe.image, 0x3000, 0x10a0)
    struct.pack_into('<IIHH', pe.image, 0x3100, 0x3000, 12, 0x3000, 0)
    pe.dirs[5] = (0x3100, 12)
    nominal = {0x1000, 0x1020, 0x1025, 0x1080, 0x10a0, 0x1100}
    truncated = 0x100c
tables = [(table, targets)]
if kind == 'merged':
    pe.table_jump(0x1100, table + 16)
    pe.instruction(0x1108, 'c3')
    pe.instruction(0x1110, 'c3')
    tables.append((table + 16, [0x1108, 0x1110]))
if 0x1100 not in pe.instructions:
    pe.instruction(0x1100, 'c3')
for base, entries in tables:
    for number, target in enumerate(entries):
        struct.pack_into('<I', pe.image, base + number * 4, target)
pe.seal()

with tempfile.TemporaryDirectory(prefix='isaac-jumptables-') as temporary:
    temporary = Path(temporary)
    db_path = temporary / 'pe-index.sqlite'
    with closing(sqlite3.connect(db_path)) as db, db:
        db.executescript('''
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE func (start INTEGER PRIMARY KEY, end INTEGER, ninsn INTEGER);
CREATE TABLE insn (va INTEGER PRIMARY KEY, size INTEGER, mn TEXT, ops TEXT);
CREATE TABLE xref (src INTEGER, dst INTEGER, kind TEXT);
CREATE TABLE seg (start INTEGER, end INTEGER, kind TEXT);
''')
        db.execute('INSERT INTO meta VALUES (?,?)', ('sha256', pe.sha256))
        db.execute('INSERT INTO meta VALUES (?,?)', ('jtab_tables', str(len(tables))))
        db.execute('INSERT INTO meta VALUES (?,?)',
                   ('jtab_masked_bytes', str(sum(len(entries) * 4 for _base, entries in tables))))
        db.execute('INSERT INTO meta VALUES (?,?)', ('decode_config', 'linear+skipdata+jtab-mask v2'))
        db.executemany('INSERT INTO func VALUES (?,?,0)', [(0x1000, 0x1100), (0x1100, 0x2000)])
        db.executemany('INSERT INTO insn VALUES (?,?,?,?)',
                       [(va, size, 'jmp', 'dword ptr [eax*4 + %#x]' % pe.jump_tables[va])
                        if va in pe.jump_tables else (va, size, '', '')
                        for va, size in pe.instructions.items()])
        # Adjacent logical tables share one masking region in the PE census.
        db.execute('INSERT INTO seg VALUES (?,?,?)',
                   (table, tables[-1][0] + len(tables[-1][1]) * 4, 'jtab'))
        # The real Gate census has repeated identical jtab xrefs.
        db.executemany('INSERT INTO xref VALUES (?,?,?)',
                       [(base + number * 4, target, 'jtab')
                        for _ in range(3) for base, entries in tables
                        for number, target in enumerate(entries)])
        db.executemany('INSERT INTO xref VALUES (?,?,?)',
                       [(0x1100, target, 'addr') for target in escaped])
    if kind == 'identity':
        rejected = {}
        for label in ('missing', 'malformed', 'stale', 'invalidTarget', 'missingMask',
                      'truncatedOwner', 'leadingGap', 'ownerGap', 'finalBoundary',
                      'partialMask', 'partialMaskAdjusted', 'missingMaskedBytes',
                      'wrongMaskedBytes', 'baseCount'):
            candidate = temporary / (label + '.sqlite')
            if label == 'malformed':
                candidate.write_bytes(b'not a SQLite database')
            elif label != 'missing':
                shutil.copyfile(db_path, candidate)
                with closing(sqlite3.connect(candidate)) as db, db:
                    if label == 'stale':
                        db.execute("UPDATE meta SET value='wrong-binary' WHERE key='sha256'")
                    elif label == 'missingMask':
                        db.execute('DELETE FROM seg')
                    elif label == 'truncatedOwner':
                        db.execute('UPDATE func SET end=0x1080 WHERE start=0x1000')
                    elif label == 'leadingGap':
                        db.execute('UPDATE func SET start=0x1001 WHERE start=0x1000')
                    elif label == 'ownerGap':
                        db.execute('UPDATE func SET start=0x1101 WHERE start=0x1100')
                    elif label == 'finalBoundary':
                        db.execute('UPDATE func SET end=0x1ff0 WHERE start=0x1100')
                    elif label in ('partialMask', 'partialMaskAdjusted'):
                        db.execute('UPDATE seg SET end=end-4')
                        if label == 'partialMaskAdjusted':
                            db.execute("UPDATE meta SET value=CAST(value AS INTEGER)-4 "
                                       "WHERE key='jtab_masked_bytes'")
                    elif label == 'missingMaskedBytes':
                        db.execute("DELETE FROM meta WHERE key='jtab_masked_bytes'")
                    elif label == 'wrongMaskedBytes':
                        db.execute("UPDATE meta SET value=CAST(value AS INTEGER)+4 "
                                   "WHERE key='jtab_masked_bytes'")
                    elif label == 'baseCount':
                        db.execute("UPDATE meta SET value='0' WHERE key='jtab_tables'")
                    else:
                        db.execute("UPDATE xref SET dst=0x1101 WHERE kind='jtab' AND src=?", (table,))
            try:
                PEIndex(pe, candidate)
            except (ValueError, sqlite3.Error):
                rejected[label] = True
            else:
                rejected[label] = False
        print(json.dumps(rejected))
        sys.exit(0)

    census = PEIndex(pe, db_path)
    ownership = census.owner(0x1000)
    ctx = pypcode.Context(LANG)
    decoder = Decoder(pe, ctx)
    data_stops = {}
    body, jumps = discover_body(decoder, 0x1000, nominal, 0x1000, 0x2000,
                                jt=JumpTables(pe, index=census),
                                extent=(0x1000, truncated), ownership=ownership, bad=data_stops)
    regmap = RegMap(ctx)
    emitter = FuncEmitter(regmap, 'sub_00001000', 0x1000, body,
                          dict(local_flags=True), jumps, ownership)
    sources = [emitter.run()]
    result = dict(kind=jumps.get(site), local=[target for target in targets if target in body],
                  tails=sorted(emitter.static_exits), fragments=sorted(census.fragments(nominal)),
                  outside=[va for va in body if not 0x1000 <= va < 0x1100],
                  data_lifted=any(census.is_data(va) for va in body),
                  extent=ownership.extent if ownership is not None else None,
                  data_stops=sorted(data_stops))
    if kind == 'tail':
        result['proven_entries'] = sorted(census.entries)
    if kind == 'merged':
        result['adjacent_table'] = JumpTables(pe, index=census).classify(
            0x1100, list(pe.instructions), 0x1100, 0x2000)
    tail_dispatch = ''
    if kind == 'tail':
        for target in sorted(emitter.static_exits):
            callee, callee_jumps = discover_body(decoder, target, nominal, 0x1000, 0x2000,
                                                jt=JumpTables(pe, index=census))
            sources.append(FuncEmitter(regmap, 'sub_%08x' % target, target, callee,
                                       dict(local_flags=True), callee_jumps).run())
            tail_dispatch += 'case %#xu: sub_%08x(&s); break;\n' % (target, target)
    compiler = next((shutil.which(name) for name in (os.environ.get('CC'), 'cc', 'gcc', 'clang')
                     if name and shutil.which(name)), None)
    ensure_emsdk_env()
    emcc = find_emcc()
    if compiler is None and emcc is None:
        result['skipExecution'] = 'no Emscripten or native C compiler available'
        print(json.dumps(result))
        sys.exit(0)
    header, _ = gen_state_header(regmap)
    (temporary / 'recomp_state.h').write_text(header)
    driver = r'''
#include "recomp_state.h"
#include "recomp_rt.h"
#ifdef _WIN32
#define TEST_API __declspec(dllexport)
#else
#define TEST_API
#endif
static uint8_t initial[0x4000], memory[0x4000];
uint8_t *recomp_mem_base = memory;
uint32_t recomp_jmp_pending, recomp_jmp_target;
void recomp_unreachable(CpuState *s, uint32_t va) { (void)s; (void)va; abort(); }
void recomp_jump_indirect(CpuState *s, uint32_t target) { (void)s; (void)target; abort(); }
''' + '\n\n'.join(sources) + r'''
TEST_API void jt_init(const void *bytes, unsigned size) { memcpy(initial, bytes, size); }
TEST_API void jt_run(uint32_t input, unsigned complete, uint32_t *out) {
  CpuState s = {0};
  memcpy(memory, initial, sizeof(memory));
  s.EAX = input; s.ECX = input; s.EDX = 99u; s.EBX = 0x1234565au;
  s.ESI = 0x700u + input; s.EDI = 0x87654321u; s.EBP = 0xabcdef01u; s.ESP = 0x800u;
  MEMW32(s.ESP, 0xfaceb00cu); MEMW32(s.ESP + 4u, input);
  recomp_jmp_pending = 0u; recomp_jmp_target = 0u;
  sub_00001000(&s);
  if (complete && recomp_jmp_pending) {
    recomp_jmp_pending = 0u;
    switch (recomp_jmp_target) {
''' + tail_dispatch + r'''
      default: abort();
    }
  }
  out[0] = s.EAX; out[1] = s.EBX; out[2] = s.ECX; out[3] = s.EDX;
  out[4] = s.ESI; out[5] = s.EDI; out[6] = s.ESP; out[7] = s.EIP;
  out[8] = s.EBP; out[9] = recomp_jmp_pending; out[10] = recomp_jmp_target;
  for (unsigned i = 0; i < 4; ++i) out[11 + i] = memory[0x700u + i];
  out[15] = MEMR32(0x800u); out[16] = MEMR32(0x7fcu);
}
'''
    source = temporary / 'cases.c'
    source.write_text(driver)
    fields = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'eip', 'ebp',
              'pending', 'target', 'byte0', 'byte1', 'byte2', 'byte3', 'returnAddress', 'savedEbx']
    inputs = ([1, 2, 3, 4] if kind == 'lea' else [0] if kind == 'bad-data'
              else [0, 1, 2, 3, 4, 5, 6, 7, 0xffffffff] if kind == 'tail'
              else [0, 1, 2, 3, 4, 7, 0xffffffff])
    phases = [0, 1] if kind == 'tail' else [0]
    result['states'] = []
    if emcc is not None:
        module = temporary / 'cases.mjs'
        built = subprocess.run([emcc, str(source), '-O1', '-DRECOMP_MEM_IDENTITY=0',
                                '-I', str(temporary), '-I', sys.argv[1], '--no-entry',
                                '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sEXPORT_ES6=1',
                                '-sSINGLE_FILE=1',
                                '-sEXPORTED_FUNCTIONS=["_jt_init","_jt_run","_malloc","_free"]',
                                '-sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAPU32',
                                '-o', str(module)], capture_output=True, text=True)
        if built.returncode:
            raise RuntimeError(built.stdout + built.stderr)
        (temporary / 'image.bin').write_bytes(pe.data)
        node_source = '''
import createModule from './cases.mjs';
import { readFileSync } from 'node:fs';
const module = await createModule();
const image = readFileSync(new URL('./image.bin', import.meta.url));
const imageAddress = module._malloc(image.length);
module.HEAPU8.set(image, imageAddress);
module._jt_init(imageAddress, image.length);
const fields = FIELDS, inputs = INPUTS, phases = PHASES;
const out = module._malloc(fields.length * 4), states = [];
for (const input of inputs) for (const complete of phases) {
  module._jt_run(input, complete, out);
  const state = { input, complete };
  for (let i = 0; i < fields.length; ++i) state[fields[i]] = module.HEAPU32[(out >>> 2) + i];
  states.push(state);
}
module._free(out); module._free(imageAddress);
console.log(JSON.stringify(states));
'''.replace('FIELDS', json.dumps(fields)).replace('INPUTS', json.dumps(inputs)).replace('PHASES', json.dumps(phases))
        node_path = temporary / 'run.mjs'
        node_path.write_text(node_source)
        ran = subprocess.run([shutil.which('node') or 'node', str(node_path)],
                             capture_output=True, text=True)
        if ran.returncode:
            raise RuntimeError(ran.stdout + ran.stderr)
        result['states'] = json.loads(ran.stdout)
    else:
        library = temporary / ('cases.dll' if os.name == 'nt' else 'cases.so')
        built = subprocess.run([compiler, '-O1', '-shared', '-fPIC', '-DRECOMP_MEM_IDENTITY=0',
                                '-I', str(temporary), '-I', sys.argv[1], str(source), '-o', str(library)],
                               capture_output=True, text=True)
        if built.returncode:
            raise RuntimeError(built.stdout + built.stderr)
        native = ctypes.CDLL(str(library))
        native.jt_init.argtypes = [ctypes.c_void_p, ctypes.c_uint]
        native.jt_run.argtypes = [ctypes.c_uint32, ctypes.c_uint, ctypes.POINTER(ctypes.c_uint32)]
        native.jt_init(ctypes.create_string_buffer(pe.data), len(pe.data))
        for value in inputs:
            for complete in phases:
                output = (ctypes.c_uint32 * len(fields))()
                native.jt_run(value, complete, output)
                result['states'].append(dict(input=value, complete=complete, **dict(zip(fields, output))))
        import _ctypes
        if os.name == 'nt':
            _ctypes.FreeLibrary(native._handle)
        else:
            _ctypes.dlclose(native._handle)
    print(json.dumps(result))
`;

function checkFrame(state) {
  assert.equal(state.ebx, 0x1234565a, 'callee-saved EBX restored');
  assert.equal(state.ebp, 0xabcdef01, 'EBP unchanged');
  assert.equal(state.returnAddress, 0xfaceb00c, 'caller return address unchanged');
}

function checkLocal(result, targets) {
  assert.deepEqual(result.kind, ['table', targets]);
  assert.deepEqual(result.local, targets, 'every case lifted locally');
  assert.deepEqual(result.tails, [], 'no case escapes through global dispatch');
  assert.deepEqual(result.outside, [], 'body stays inside canonical owner');
  assert.equal(result.data_lifted, false, 'jump-table bytes are not code');
  assert.deepEqual(result.extent, [0x1000, 0x1100]);
}

test('lifter: truncated length-minus-one switch preserves carry, fallthrough, and stack', (t) => {
  const result = runPython(t, fixtureProbe, ['lea']);
  if (!result) return;
  checkLocal(result, [0x1029, 0x1026, 0x1023, 0x1020]);
  assert.deepEqual(result.fragments, [0x1020, 0x1023, 0x1026, 0x1029]);
  if (result.skipExecution) return t.skip(result.skipExecution);
  for (const state of result.states) {
    checkFrame(state);
    assert.equal(state.eax, state.input - 1);
    assert.equal(state.esi, 0x700);
    assert.equal(state.edx, 100, 'carry survives local computed jump');
    assert.equal(state.savedEbx, 0x1234565a, 'push saved original EBX');
    assert.equal(state.esp, 0x808, 'push/pop and ret 4 consume only original frame');
    assert.equal(state.eip, 0xfaceb00c);
    assert.equal(state.pending, 0);
    assert.deepEqual([state.byte0, state.byte1, state.byte2, state.byte3],
      Array.from({ length: 4 }, (_, i) => i < state.input ? 0x5a : 0), 'all selected fallthrough writes execute');
  }
});

test('lifter: pre-table fragment and masked switch keep all four cases and local flags', (t) => {
  const result = runPython(t, fixtureProbe, ['mask']);
  if (!result) return;
  checkLocal(result, [0x1020, 0x1030, 0x1040, 0x1050]);
  assert.deepEqual(result.fragments, [0x1010, 0x1020, 0x1030, 0x1040, 0x1050, 0x1060]);
  if (result.skipExecution) return t.skip(result.skipExecution);
  for (const state of result.states) {
    checkFrame(state);
    const selected = state.input & 3;
    assert.equal(state.eax, selected);
    assert.equal(state.esi, (selected + 1) * 10, 'selected case changes live local register');
    assert.equal(state.edx, selected === 0 ? 10 : 99, 'shared tail consumes AND flags, not stale CpuState flags');
    assert.equal(state.edi, 0x800, 'shared tail observes original guest ESP');
    assert.equal(state.esp, 0x808);
    assert.equal(state.eip, 0xfaceb00c);
    assert.equal(state.pending, 0);
  }
});

test('lifter: cross-compartment, escaped, and data-pointer entries remain tails, including fallthrough', (t) => {
  const result = runPython(t, fixtureProbe, ['tail']);
  if (!result) return;
  assert.deepEqual(result.kind, ['table', [0x1020, 0x1100, 0x1080, 0x10a0, 0x1110, 0x1110, 0x1100, 0x1080]]);
  assert.deepEqual(result.local, [0x1020]);
  assert.deepEqual(result.tails, [0x1025, 0x1080, 0x10a0, 0x1100, 0x1110]);
  assert.deepEqual(result.fragments, [0x1020], 'proven entries never become fragments');
  assert.deepEqual(result.proven_entries, [0x1025, 0x1080, 0x10a0],
    'census compartment starts alone do not prove ABI entries');
  assert.deepEqual(result.outside, []);
  if (result.skipExecution) return t.skip(result.skipExecution);
  const destinations = [0x1025, 0x1100, 0x1080, 0x10a0, 0x1110, 0x1110, 0x1100, 0x1080];
  const results = [17, 34, 51, 68, 85, 85, 34, 51];
  for (const state of result.states) {
    checkFrame(state);
    const selected = state.input & 7;
    assert.equal(state.esi, state.input, 'tail receives caller local register');
    assert.equal(state.edi, selected === 0 ? 0x55 : 0x87654321);
    assert.equal(state.target, destinations[selected]);
    assert.equal(state.pending, state.complete ? 0 : 1);
    assert.equal(state.esp, state.complete ? 0x808 : 0x800, 'tail uses caller return slot, never a synthetic call frame');
    assert.equal(state.edx, state.complete ? results[selected] : 99);
    if (state.complete) assert.equal(state.eip, 0xfaceb00c);
  }
});

test('PE ownership rejects missing, malformed, stale, and inconsistent indexes', (t) => {
  const result = runPython(t, fixtureProbe, ['identity']);
  if (result) assert.deepEqual(result, {
    missing: true, malformed: true, stale: true, invalidTarget: true, missingMask: true,
    truncatedOwner: true, leadingGap: true, ownerGap: true, finalBoundary: true,
    partialMask: true, partialMaskAdjusted: true, missingMaskedBytes: true,
    wrongMaskedBytes: true, baseCount: true,
  });
});

test('lifter: adjacent masked tables keep distinct target sets', (t) => {
  const result = runPython(t, fixtureProbe, ['merged']);
  if (!result) return;
  checkLocal(result, [0x1020, 0x1030, 0x1040, 0x1050]);
  assert.deepEqual(result.adjacent_table, ['table', [0x1108, 0x1110]]);
  if (result.skipExecution) return t.skip(result.skipExecution);
  assert.deepEqual(result.states.map((state) => state.esi), [10, 20, 30, 40, 10, 40, 40]);
});

test('lifter: table storage in another function does not move case ownership', (t) => {
  const result = runPython(t, fixtureProbe, ['shared']);
  if (!result) return;
  checkLocal(result, [0x1020, 0x1030, 0x1040, 0x1050]);
  assert.deepEqual(result.fragments, [0x1010, 0x1020, 0x1030, 0x1040, 0x1050, 0x1060]);
  if (result.skipExecution) return t.skip(result.skipExecution);
  assert.deepEqual(result.states.map((state) => state.esi), [10, 20, 30, 40, 10, 40, 40]);
});

test('lifter: undecodable branch stops only that path; valid branch still executes', (t) => {
  const result = runPython(t, fixtureProbe, ['bad-data']);
  if (!result) return;
  assert.deepEqual(result.data_stops, [0x1040]);
  if (result.skipExecution) return t.skip(result.skipExecution);
  assert.equal(result.states[0].edx, 17);
  assert.equal(result.states[0].esp, 0x808);
  assert.equal(result.states[0].eip, 0xfaceb00c);
});

test('jumptables: fallback guards remain entry-specific within one census compartment', (t) => {
  const result = runPython(t, String.raw`
import json, struct, sys
from types import SimpleNamespace
sys.path.insert(0, sys.argv[1])
from jumptables import JumpTables
class GuardPE:
    def __init__(self):
        self.image = bytearray(0x4000)
    def text(self):
        return SimpleNamespace(vaddr=0x1000, vsize=0x1000)
    def read(self, va, size):
        return bytes(self.image[va:va+size])
pe = GuardPE()
pe.image[0x1010:0x1015] = bytes.fromhex('83f801774b')
pe.image[0x1020:0x1025] = bytes.fromhex('83f803773b')
pe.image[0x1040:0x1047] = b'\xff\x24\x85' + struct.pack('<I', 0x3000)
targets = [0x1100, 0x1500, 0x1600, 0x1700]
struct.pack_into('<4I', pe.image, 0x3000, *targets)
tables = JumpTables(pe)
short = tables.classify(0x1040, [0x1010, 0x1013, 0x1040], 0x1000, 0x1200)
long = tables.classify(0x1040, [0x1020, 0x1023, 0x1040], 0x1000, 0x1200)
print(json.dumps([short, long]))
`);
  if (result) assert.deepEqual(result, [
    ['table', [0x1100, 0x1500]],
    ['table', [0x1100, 0x1500, 0x1600, 0x1700]],
  ], 'shared JMP and bounds cannot reuse another entry path\'s shorter guard');
});

const binaryProbe = String.raw`
import json, sys
sys.path.insert(0, sys.argv[1])
import pypcode
from emit import load_ghidra
from pe import PE32
from jumptables import JumpTables, PEIndex
from lift import Decoder, FuncEmitter, LANG, RegMap, discover_body
pe = PE32(sys.argv[2])
census = PEIndex(pe, sys.argv[4])
starts, extents = load_ghidra(sys.argv[3])
ctx = pypcode.Context(LANG)
decoder = Decoder(pe, ctx)
regmap = RegMap(ctx)
result = []
for entry, site, required in [
    (0xa2c570, 0xa2c680, [0xa2c687, 0xa2c693, 0xa2c69f, 0xa2c6ab, 0xa2c6b3, 0xa2c6c5, 0xa2c6cb]),
    (0x45fc00, 0x4603ed, [0x45fd7c, 0x4603f4, 0x460417, 0x460424, 0x46048c, 0x460494, 0x46049c, 0x4604ab]),
    (0x52c2f0, 0x52c6a8, [0x52c698, 0x52c6af, 0x52c6bd, 0x52c6c7, 0x52c6cf, 0x52c6d2, 0x52c6e1, 0x52c6eb, 0x52c6f8]),
]:
    owner = census.owner(entry)
    body, jumps = discover_body(decoder, entry, starts, pe.text().vaddr,
                                pe.text().vaddr + pe.text().vsize,
                                jt=JumpTables(pe, index=census), extent=extents[entry],
                                ownership=owner)
    emitter = FuncEmitter(regmap, 'sub_%08x' % entry, entry, body,
                          dict(local_flags=True), jumps, owner)
    emitter.run()
    kind, targets = jumps.get(site, ('unknown', []))
    result.append(dict(entry=entry, kind=kind, targets=targets,
                       local=[target for target in targets if target in body],
                       case_tails=[target for target in targets if target in emitter.static_exits],
                       missing=[va for va in required if va not in body],
                       table_data_lifted=any(census.is_data(va) for va in body)))
print(json.dumps(result))
`;

test('lifter: observed sacrifice, Gate, and Greed Fistuloid computed cases are complete local bodies (needs private PE/index)', (t) => {
  if (![exe, inventory, index].every(existsSync)) return t.skip('private PE, Ghidra inventory, or PE index unavailable');
  const result = runPython(t, binaryProbe, [exe, inventory, index]);
  if (!result) return;
  const expected = [
    [0xa2c6ab, 0xa2c69f, 0xa2c693, 0xa2c687],
    [0x4603f4, 0x460417, 0x460424, 0x46048c],
    [0x52c6af, 0x52c6bd, 0x52c6cf, 0x52c6c7],
  ];
  for (const [number, row] of result.entries()) {
    assert.equal(row.kind, 'table');
    assert.deepEqual(row.targets, expected[number]);
    assert.deepEqual(row.local, expected[number]);
    assert.deepEqual(row.case_tails, [], 'observed targets never become global calls');
    assert.deepEqual(row.missing, [], 'pre-table fragments, case writes, shared tails, and exits all lift');
    assert.equal(row.table_data_lifted, false);
  }
});

test('jumptables: bare cmp/je does not truncate Basement switch (needs private PE)', (t) => {
  if (!existsSync(exe)) return t.skip('private PE unavailable');
  const result = runPython(t, String.raw`
import json, sys, capstone
sys.path.insert(0, sys.argv[1])
from pe import PE32
from jumptables import JumpTables
pe = PE32(sys.argv[2])
md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
body = []
for ins in md.disasm(pe.read(0x9b0d40, 0x50), 0x9b0d40):
    body.append(ins.address)
    if ins.address >= 0x9b0d7b:
        break
print(json.dumps(JumpTables(pe).classify(0x9b0d7b, body, 0x9b0b00, 0x9b120e)))
`, [exe]);
  if (result) assert.deepEqual(result, ['table', [0x9b0d82, 0x9b0f26, 0x9b0f5d, 0x9b0f8a]]);
});
