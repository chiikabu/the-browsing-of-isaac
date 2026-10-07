// Exercise the public lift pipeline, not its implementation text.
// The PE32 fixture has two framed callers in separate address shards. Their
// shared switch reaches missing table/direct/fallthrough continuations, loops
// through an adjacent census compartment, and re-enters a byte-covered caller
// interior listed as a nonprologue fragment. An uncovered fragment adds another
// recursive exit. A separate CALL graph checks nesting depth across jump chains.
// All VAs fit mkdispatch's production .text range. The isolated Wasm links the
// real dispatcher, host_trap trampoline, recomp_rt, and default missing_fns
// implementations; no tested target or dispatch function is supplied by hand.
// Parent command: node --test tests/recomp-parallel-lift.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const python = [
  process.env.PYTHON,
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3', 'python',
].find((path) => path && spawnSync(path, ['-B', '-c', 'import capstone, pypcode'], {
  encoding: 'utf8', timeout: 10000,
}).status === 0);

function runFixture(t) {
  if (!python) {
    t.skip('no Python with capstone+pypcode available');
    return null;
  }
  // A script file avoids Windows' command-line length limit for this fixture.
  const temporary = mkdtempSync(join(tmpdir(), 'isaac-closure-probe-'));
  try {
    const script = join(temporary, 'fixture.py');
    writeFileSync(script, fixtureProbe);
    const result = spawnSync(python, ['-B', script, lift, process.execPath], {
      cwd: root, encoding: 'utf8', timeout: 600000,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONHASHSEED: '0' },
    });
    assert.equal(result.status, 0,
      result.error?.message || `Python exited ${result.status}\n${result.stdout}\n${result.stderr}`);
    return JSON.parse(result.stdout);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

const fixtureProbe = String.raw`
import hashlib, json, os, re, sqlite3, struct, subprocess, sys, tempfile
from contextlib import closing
from pathlib import Path
import capstone
from capstone.x86 import X86_OP_IMM, X86_OP_MEM

sys.dont_write_bytecode = True
lift = Path(sys.argv[1])
node = sys.argv[2]
root = lift.parents[2]
host = lift.parent / 'host'
sys.path.insert(0, str(lift))
from build_boot import ensure_emsdk_env, find_emcc
from pe import PE32

TEXT = 0x401000
TEXT_SIZE = 0x6000
ROOT_A, ROOT_B = TEXT, 0x403000
LOCAL_FALL, INTERIOR = 0x401080, 0x401200
NEXT, COMMON, DIRECT = 0x401400, 0x401520, 0x4015b0
ORPHAN, ORPHAN_TAIL = 0x402100, 0x402300
CALL_ROOT, CALLEE, CALL_CONT_A, CALL_CONT_B, DEEP_CALLEE = (
    0x404000, 0x404100, 0x404200, 0x404300, 0x404500)
TABLE, LOG, STACK = 0x406000, 0x20000, 0x30000
LIVE = 0x10203040
boundaries = [TEXT, 0x401400, 0x401500, 0x401700, 0x402000,
              0x402200, 0x402400, 0x403000, 0x403100, 0x404000,
              0x404100, 0x404200, 0x404300, 0x404400, 0x404500,
              0x404600, TEXT + TEXT_SIZE]
text = bytearray(b'\xcc' * TEXT_SIZE)
written = set()

def put(va, code):
    code = bytes.fromhex(code) if isinstance(code, str) else code
    assert TEXT <= va and va + len(code) <= TEXT + TEXT_SIZE
    occupied = set(range(va, va + len(code)))
    assert not written.intersection(occupied), 'fixture instructions overlap'
    written.update(occupied)
    text[va - TEXT:va - TEXT + len(code)] = code
    return va + len(code)

def jump(va, target):
    return put(va, b'\xe9' + struct.pack('<i', target - va - 5))

def call(va, target):
    return put(va, b'\xe8' + struct.pack('<i', target - va - 5))

def conditional(va, target):
    return put(va, b'\x0f\x85' + struct.pack('<i', target - va - 6))

def record(va, event):
    # MOV, SETcc and LEA do not change incoming flags or the guest frame.
    return put(va, b'\xc7\x07' + struct.pack('<I', event) + bytes.fromhex(
        '89 67 04 89 6f 08 89 5f 0c 89 77 10 89 4f 14 89 47 18 89 57 1c '
        '0f 92 47 20 0f 94 47 21 0f 98 47 22 0f 90 47 23 8d 7f 24'))

def consume(va, amount):
    va = put(va, '83 d2 00')                  # adc edx, 0: read carried CF
    va = put(va, bytes([0x8d, 0x76, amount]))  # lea esi, [esi + amount]
    return put(va, 'f9')                      # stc before the next jump

def prologue(va):
    va = put(va, '55 89 e5 53 56 57')         # save EBP, EBX, ESI, EDI
    va = put(va, b'\xbf' + struct.pack('<I', LOG))
    va = put(va, b'\xbe' + struct.pack('<I', LIVE))
    return put(va, 'bb 03 00 00 00')

root_ends = {}
for entry in (ROOT_A, ROOT_B):
    at = prologue(entry)
    at = put(at, '83 e0 03 f9')              # masked index; CF set after AND
    root_ends[entry] = put(at, b'\xff\x24\x85' + struct.pack('<I', TABLE))

at = consume(record(LOCAL_FALL, 10), 11)
FALL = at
# FALL is an escaped entry, not an inventory row. It must be delivered even
# though its predecessor reaches it without an explicit x86 JMP.
at = consume(record(FALL, 11), 13)
jump(at, NEXT)
put(0x401800, b'\xb8' + struct.pack('<I', FALL))  # decoded MOV addr proof

at = consume(record(NEXT, 1), 3)
jump(at, COMMON)
at = consume(record(COMMON, 3), 7)
jump(at, INTERIOR)
at = consume(record(DIRECT, 2), 5)
jump(at, NEXT)

at = consume(record(INTERIOR, 5), 17)
at = put(at, '4b')                           # dec ebx preserves CF
at = conditional(at, NEXT)                   # cross-owner loop back-edge
at = record(at, 6)
put(at, '5f 5e 5b 5d c2 04 00')              # original frame, then ret 4

at = put(ORPHAN, '85 d2 f9')
at = consume(record(at, 20), 19)
orphan_end = jump(at, ORPHAN_TAIL)
at = record(ORPHAN_TAIL, 21)
at = put(at, '83 d2 00')
put(at, 'c2 04 00')

at = prologue(CALL_ROOT)
at = put(at, '85 d2 f9')
at = record(at, 30)
at = call(at, CALLEE)
at = record(at, 31)
call_root_end = put(at, '5f 5e 5b 5d c2 04 00')
at = put(CALLEE, '85 d2 f9')
at = consume(record(at, 32), 23)
jump(at, CALL_CONT_A)
at = consume(record(CALL_CONT_A, 33), 29)
jump(at, CALL_CONT_B)
at = consume(record(CALL_CONT_B, 34), 31)
at = call(at, DEEP_CALLEE)
at = record(at, 35)
put(at, 'c3')
at = put(DEEP_CALLEE, '85 d2 f9')
at = record(at, 36)
at = put(at, '83 d2 00 8d 76 25')
put(at, 'c3')

targets = [NEXT, DIRECT, LOCAL_FALL, INTERIOR]
for number, target in enumerate(targets):
    put(TABLE + number * 4, struct.pack('<I', target))

def make_pe():
    # One actual file-backed executable section, complete PE32 optional header.
    image = bytearray(0x200 + TEXT_SIZE)
    image[:2] = b'MZ'
    struct.pack_into('<I', image, 0x3c, 0x80)
    image[0x80:0x84] = b'PE\0\0'
    struct.pack_into('<HHIIIHH', image, 0x84, 0x14c, 1, 0, 0, 0, 0xe0, 0x102)
    opt = 0x98
    struct.pack_into('<H', image, opt, 0x10b)
    struct.pack_into('<I', image, opt + 4, TEXT_SIZE)
    struct.pack_into('<III', image, opt + 16, 0x1000, 0x1000, 0)
    struct.pack_into('<III', image, opt + 28, 0x400000, 0x1000, 0x200)
    struct.pack_into('<HH', image, opt + 40, 4, 0)
    struct.pack_into('<HH', image, opt + 48, 4, 0)
    struct.pack_into('<II', image, opt + 56, 0x8000, 0x200)
    struct.pack_into('<H', image, opt + 68, 3)
    struct.pack_into('<IIIII', image, opt + 72, 0x100000, 0x1000,
                     0x100000, 0x1000, 0)
    struct.pack_into('<I', image, opt + 92, 16)
    section = opt + 0xe0
    image[section:section + 8] = b'.text\0\0\0'
    struct.pack_into('<IIII', image, section + 8, TEXT_SIZE, 0x1000,
                     TEXT_SIZE, 0x200)
    struct.pack_into('<I', image, section + 36, 0x60000020)
    image[0x200:] = text
    return bytes(image)

env = os.environ.copy()
env.update(PYTHONDONTWRITEBYTECODE='1', PYTHONHASHSEED='0')
for key in list(env):
    if key.startswith('ISAAC_'):
        del env[key]

def run(argv, status=0, timeout=120):
    result = subprocess.run([str(arg) for arg in argv], cwd=root, env=env,
                            capture_output=True, text=True, timeout=timeout)
    if result.returncode != status:
        raise RuntimeError('command %r exited %s, expected %s\n%s\n%s' %
                           (argv, result.returncode, status, result.stdout, result.stderr))
    return result

def vas(path):
    return [int(line, 0) for line in path.read_text().splitlines() if line.strip()]

def collect(directory):
    units = sorted(directory.glob('lifted_*.c'))
    definitions = [int(match, 16) for unit in units for match in re.findall(
        r'^void sub_([0-9a-f]{8})\(CpuState\b', unit.read_text(), re.M)]
    names = ['recomp_state.h', 'lifted_decls.h', 'entries.txt', 'static_exits.txt',
             'direct_calls.json', 'covered.txt', 'missing.txt', 'failures.txt',
             'data_stops.txt'] + [unit.name for unit in units]
    artifacts = {name: hashlib.sha256((directory / name).read_bytes()).hexdigest()
                 for name in sorted(names)}
    summary = json.loads((directory / 'summary.json').read_text())
    stable = ['requested', 'lifted', 'failed', 'missing_callees', 'x86_bytes',
              'x86_insns', 'pcode_ops', 'c_bytes', 'c_lines', 'files',
              'text_bytes_covered', 'text_vsize', 'text_coverage_pct',
              'fragments_rescued', 'jt_tables', 'jt_entries', 'jt_tailcalls',
              'jt_unresolved', 'dispatch_loop_funcs', 'callind_remaining',
              'callind_const_unresolved', 'c_bytes_per_x86_byte',
              'c_lines_per_x86_insn']
    return dict(entries=vas(directory / 'entries.txt'), definitions=definitions,
                exits=vas(directory / 'static_exits.txt'),
                calls=json.loads((directory / 'direct_calls.json').read_text()),
                covered=[[int(value, 0) for value in line.split()]
                         for line in (directory / 'covered.txt').read_text().splitlines()],
                missing=vas(directory / 'missing.txt'),
                failures=(directory / 'failures.txt').read_text().splitlines(),
                dataStops=(directory / 'data_stops.txt').read_text().splitlines(),
                artifacts=artifacts, summary={key: summary[key] for key in stable
                                             if key in summary},
                parts=summary.get('parts'),
                stats=sorted(json.loads((directory / 'stats.json').read_text()),
                             key=lambda row: row['va']))

driver = r'''
#include "isaac_host.h"
#include "dispatch_tbl.h"
#include "recomp_rt.h"

#define LOG 0x20000u
#define STACK 0x30000u
#define TEXT 0x401000u
#define ORPHAN 0x402100u
#define LIVE 0x10203040u
#define RET 0xfaceb00cu

/* This PE has no imports, threads, audio, renderer, or input queue. Keep the
 * production runtime intact. Unexpected access to these subsystems is fatal,
 * never an alternate delivery path for a tested guest target. */
isaac_import isaac_imports[1];
const unsigned isaac_import_count = 0u;
static _Noreturn void fixture_unsupported(const char *name) {
    fprintf(stderr, "closure fixture reached unrelated host subsystem: %s\n", name);
    abort();
}
int isaac_threads_slicing(void) { return 0; }
void isaac_threads_progress(void) { fixture_unsupported("threads_progress"); }
void isaac_threads_report(void) { fixture_unsupported("threads_report"); }
void isaac_gl_census_report(void) { fixture_unsupported("gl_census_report"); }
void isaac_fastpath_report(void) { fixture_unsupported("fastpath_report"); }
void isaac_audio_report(void) { fixture_unsupported("audio_report"); }
uint32_t isaac_input_dispatched(void) { fixture_unsupported("input_dispatched"); }
uint32_t isaac_input_queued(void) { fixture_unsupported("input_queued"); }
uint32_t isaac_input_dropped(void) { fixture_unsupported("input_dropped"); }
uint32_t isaac_dispatch_calls(void);

void fixture_init(const void *bytes, uint32_t size) {
    if (size != 0x6000u) abort();
    memcpy((void *)(uintptr_t)TEXT, bytes, size);
}
uint32_t fixture_entries(uint32_t *out) {
    if (out) memcpy(out, g_dva, sizeof(g_dva));
    return G_NDISPATCH;
}
void fixture_run(uint32_t entry, uint32_t input, uint32_t complete,
                 uint32_t *out, uint32_t *trace) {
    CpuState cpu = {0};
    memset((void *)(uintptr_t)LOG, 0, 128u * 36u);
    memset((void *)(uintptr_t)(STACK - 0x40u), 0, 0x80u);
    cpu.EAX = input; cpu.ECX = input; cpu.EDX = 100u;
    cpu.EBX = 0x1234565au; cpu.ESI = 0x87654321u; cpu.EDI = 0x55667788u;
    cpu.EBP = 0xabcdef01u; cpu.ESP = STACK;
    /* Deliberately stale flags distinguish local AND/STC from omitted spills. */
    cpu.CF = 0u; cpu.ZF = 1u; cpu.PF = 1u; cpu.SF = 1u; cpu.OF = 1u;
    if (entry == ORPHAN) { cpu.EDI = LOG; cpu.ESI = LIVE; }
    MEMW32(STACK, RET); MEMW32(STACK + 4u, input);
    recomp_jmp_pending = 0u; recomp_jmp_target = 0u; g_reentry_eip = 0u;
    uint32_t before = isaac_dispatch_calls();
    if (complete) {
        isaac_guest_call(entry, &cpu);
    } else if (!isaac_lifted_dispatch(entry, &cpu)) {
        fprintf(stderr, "closure fixture root missing from dispatch: %#x\n", entry);
        abort();
    }
    uint32_t *records = (uint32_t *)(uintptr_t)LOG;
    unsigned count = 0u;
    while (count < 128u && records[count * 9u]) ++count;
    if (count == 128u) abort();
    memcpy(trace, records, count * 36u);
    uint32_t fields[] = {
        cpu.EAX, cpu.EBX, cpu.ECX, cpu.EDX, cpu.ESI, cpu.EDI,
        cpu.ESP, cpu.EIP, cpu.EBP, cpu.CF, cpu.ZF, cpu.PF, cpu.SF, cpu.OF,
        recomp_jmp_pending, recomp_jmp_target, MEMR32(STACK), MEMR32(STACK + 4u),
        MEMR32(STACK - 4u), MEMR32(STACK - 8u), MEMR32(STACK - 12u),
        MEMR32(STACK - 16u), isaac_dispatch_calls() - before, count
    };
    memcpy(out, fields, sizeof(fields));
}
'''

node_source = r'''
import createModule from './closure.mjs';
import { readFileSync } from 'node:fs';
const module = await createModule();
const image = readFileSync(new URL('../text.bin', import.meta.url));
const imageAddress = module._malloc(image.length);
module.HEAPU8.set(image, imageAddress);
module._fixture_init(imageAddress, image.length);
const count = module._fixture_entries(0);
const entriesAddress = module._malloc(count * 4);
module._fixture_entries(entriesAddress);
const dispatchEntries = Array.from(module.HEAPU32.subarray(entriesAddress >>> 2, (entriesAddress >>> 2) + count));
const fields = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'eip', 'ebp',
                'cf', 'zf', 'pf', 'sf', 'of', 'pending', 'target', 'returnAddress',
                'argument', 'savedEbp', 'savedEbx', 'savedEsi', 'savedEdi',
                'dispatches', 'traceCount'];
const out = module._malloc(fields.length * 4), trace = module._malloc(128 * 36);
const states = [];
for (const [entry, inputs] of SCENARIOS) for (const input of inputs) for (const complete of [0, 1]) {
    module._fixture_run(entry, input, complete, out, trace);
    const state = { entry, input, complete };
    for (let i = 0; i < fields.length; ++i) state[fields[i]] = module.HEAPU32[(out >>> 2) + i];
    state.trace = [];
    for (let i = 0; i < state.traceCount; ++i) {
        const words = Array.from(module.HEAPU32.subarray((trace >>> 2) + i * 9, (trace >>> 2) + (i + 1) * 9));
        state.trace.push({
            event: words[0], esp: words[1], ebp: words[2], ebx: words[3],
            esi: words[4], ecx: words[5], eax: words[6], edx: words[7],
            cf: words[8] & 255, zf: (words[8] >>> 8) & 255,
            sf: (words[8] >>> 16) & 255, of: words[8] >>> 24,
        });
    }
    states.push(state);
}
module._free(trace); module._free(out); module._free(entriesAddress); module._free(imageAddress);
console.log(JSON.stringify({ dispatchEntries, states }));
'''

with tempfile.TemporaryDirectory(prefix='isaac-closure-pipeline-') as temporary:
    temporary = Path(temporary)
    exe = temporary / 'fixture.exe'
    exe.write_bytes(make_pe())
    pe = PE32(exe)
    (temporary / 'text.bin').write_bytes(pe.read(TEXT, TEXT_SIZE))
    assert pe.entry_va == ROOT_A and pe.text().vaddr == TEXT
    db_path = temporary / 'pe-index.sqlite'
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)
    md.detail = True
    instructions = []
    for lo, hi in [(TEXT, TABLE), (TABLE + 16, TEXT + TEXT_SIZE)]:
        decoded = list(md.disasm(pe.read(lo, hi - lo), lo))
        assert sum(ins.size for ins in decoded) == hi - lo
        instructions.extend(decoded)
    xrefs = []
    for ins in instructions:
        if ins.mnemonic == 'call' and ins.operands[0].type == X86_OP_IMM:
            xrefs.append((ins.address, ins.operands[0].imm, 'call'))
        elif ins.mnemonic.startswith('j') and ins.operands[0].type == X86_OP_IMM:
            xrefs.append((ins.address, ins.operands[0].imm, 'jmp'))
        elif not ins.mnemonic.startswith('j'):
            xrefs.extend((ins.address, operand.imm, 'addr') for operand in ins.operands
                         if operand.type == X86_OP_IMM
                         and TEXT <= operand.imm < TEXT + TEXT_SIZE)
        xrefs.extend((ins.address, operand.mem.disp, 'read') for operand in ins.operands
                     if operand.type == X86_OP_MEM
                     and TEXT <= operand.mem.disp < TEXT + TEXT_SIZE)
    xrefs.extend((TABLE + number * 4, target, 'jtab')
                 for _ in range(3) for number, target in enumerate(targets))
    # Both the transaction and the connection close before any CLI opens it.
    # sqlite3's context manager alone leaves Windows' file handle open.
    with closing(sqlite3.connect(db_path)) as db, db:
        db.executescript('''
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE func (start INTEGER PRIMARY KEY, end INTEGER, ninsn INTEGER);
CREATE TABLE insn (va INTEGER PRIMARY KEY, size INTEGER, mn TEXT, ops TEXT);
CREATE TABLE xref (src INTEGER, dst INTEGER, kind TEXT);
CREATE TABLE seg (start INTEGER, end INTEGER, kind TEXT);
CREATE TABLE imp (va INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE str (va INTEGER PRIMARY KEY, s TEXT);
CREATE TABLE fld (va INTEGER, disp INTEGER, kind TEXT, base TEXT, size INTEGER);
''')
        db.executemany('INSERT INTO meta VALUES (?,?)',
                       [('sha256', pe.sha256), ('jtab_tables', '1'),
                        ('jtab_masked_bytes', '16'),
                        ('decode_config', 'linear+skipdata+jtab-mask v2')])
        db.executemany('INSERT INTO func VALUES (?,?,?)',
                       [(lo, hi, sum(lo <= ins.address < hi for ins in instructions))
                        for lo, hi in zip(boundaries, boundaries[1:])])
        db.executemany('INSERT INTO insn VALUES (?,?,?,?)',
                       [(ins.address, ins.size, ins.mnemonic, ins.op_str)
                        for ins in instructions])
        db.executemany('INSERT INTO xref VALUES (?,?,?)', xrefs)
        db.execute('INSERT INTO seg VALUES (?,?,?)', (TABLE, TABLE + 16, 'jtab'))

    inventory = temporary / 'functions.jsonl'
    inventory.write_text(''.join(json.dumps(dict(
        va=hex(va), minVa=hex(va), endVa=hex(end), inText=True, external=False)) + '\n'
        for va, end in [(ROOT_A, root_ends[ROOT_A]), (ROOT_B, root_ends[ROOT_B]),
                        (INTERIOR, INTERIOR + 1), (ORPHAN, orphan_end),
                        (CALL_ROOT, call_root_end)]))
    fragments = temporary / 'fragments.tsv'
    fragments.write_text('va\tlooksLikePrologue\n%08x\tfalse\n%08x\tfalse\n' %
                         (INTERIOR, ORPHAN))
    requested = temporary / 'roots.txt'
    # --va ROOT_A precedes this file; duplicate ROOT_A must not become a
    # second definition or change the global rescue decision.
    requested.write_text('\n'.join(hex(va) for va in (ROOT_B, ROOT_A, INTERIOR, ORPHAN)) + '\n')
    common = ['--exe', exe, '--pe-index', db_path, '--ghidra-functions', inventory,
              '--fragments-tsv', fragments, '--va', hex(ROOT_A), '--va-file', requested,
              '--split-va', '0x1000']

    result = dict(addresses=dict(rootA=ROOT_A, rootB=ROOT_B, localFall=LOCAL_FALL,
                                fall=FALL, interior=INTERIOR, next=NEXT, common=COMMON,
                                direct=DIRECT, orphan=ORPHAN, orphanTail=ORPHAN_TAIL,
                                callRoot=CALL_ROOT, callee=CALLEE,
                                callContA=CALL_CONT_A, callContB=CALL_CONT_B,
                                deepCallee=DEEP_CALLEE),
                  modes={}, guards=[])
    for absent in ('--va-file', '--split-va', '--out'):
        output = temporary / ('invalid-' + absent[2:])
        args = ['--exe', exe, '--va-file', requested, '--split-va', '0x1000', '--out', output]
        i = args.index(absent)
        del args[i:i + 2]
        refused = run([sys.executable, '-B', lift / 'lift_parallel.py', *args], status=2)
        result['guards'].append(dict(absent=absent, status=refused.returncode,
                                     wroteOutput=output.exists()))

    def emit(directory, extras=(), parallel=False, jobs=2):
        command = [sys.executable, '-B', lift / ('lift_parallel.py' if parallel else 'emit.py')]
        if parallel:
            command += ['--jobs', str(jobs)]
        run(command + common + list(extras) +
            ['--out', directory, '--stats', directory / 'stats.json'])
        return collect(directory)

    for name, extras in [
        ('core', ['--follow-depth', '0']),
        ('callsOff', ['--va', hex(CALL_ROOT)]),
        ('follow0', ['--va', hex(CALL_ROOT), '--follow', '--follow-depth', '0']),
        ('follow1', ['--va', hex(CALL_ROOT), '--follow', '--follow-depth', '1']),
        ('follow2', ['--va', hex(CALL_ROOT), '--follow', '--follow-depth', '2']),
    ]:
        serial = temporary / (name + '-serial')
        parallel = temporary / (name + '-parallel')
        result['modes'][name] = dict(serial=emit(serial, extras),
                                   parallel=emit(parallel, extras, parallel=True))
    result['modes']['core']['oneWorker'] = emit(
        temporary / 'core-one-worker', ['--follow-depth', '0'], parallel=True, jobs=1)

    deferred = temporary / 'deferred'
    result['deferred'] = emit(deferred, ['--defer-closure', '--no-rescue'])
    rescue = temporary / 'rescue'
    result['rescue'] = emit(rescue, [
        '--rescue-only', '--entries-file', deferred / 'entries.txt',
        '--static-exits-file', deferred / 'static_exits.txt',
        '--direct-calls-file', deferred / 'direct_calls.json',
        '--covered-file', deferred / 'covered.txt'])

    # mkdispatch discovers actual definitions, not declarations or covered
    # bytes. Its production handwritten catalog is linked as real source.
    for name in ('core-serial', 'core-parallel', 'follow2-parallel'):
        run([sys.executable, '-B', lift / 'mkdispatch.py', '--dir', temporary / name, '--exe', exe])
    ensure_emsdk_env()
    emcc = find_emcc()
    if emcc is None:
        result['skipExecution'] = 'Emscripten emcc unavailable; set EMCC or EMSDK'
    else:
        env.update(os.environ)
        env.update(PYTHONDONTWRITEBYTECODE='1', PYTHONHASHSEED='0')
        for key in list(env):
            if key.startswith('ISAAC_'):
                del env[key]
        result['execution'] = {}
        for name in ('core-serial', 'core-parallel', 'follow2-parallel'):
            directory = temporary / name
            source = directory / 'fixture.c'
            source.write_text(driver)
            module = directory / 'closure.mjs'
            run([emcc, source, directory / 'dispatch_tbl.c', lift / 'recomp_rt.c',
                 host / 'src' / 'host_trap.c', host / 'src' / 'missing_fns.c',
                 *sorted(directory.glob('lifted_*.c')),
                 '-O1', '-std=gnu11', '-ffunction-sections', '-fdata-sections',
                 '-Wl,--gc-sections', '-DRECOMP_MEM_IDENTITY=1',
                 '-I', directory, '-I', lift, '-I', host / 'include',
                 '-I', host / 'generated', '--no-entry', '-sENVIRONMENT=node',
                 '-sMODULARIZE=1', '-sEXPORT_ES6=1', '-sSINGLE_FILE=1',
                 '-sGLOBAL_BASE=16777216', '-sINITIAL_MEMORY=67108864',
                 '-sSTACK_SIZE=1048576', '-sALLOW_MEMORY_GROWTH=1',
                 '-sERROR_ON_UNDEFINED_SYMBOLS=1',
                 '-sEXPORTED_FUNCTIONS=["_fixture_init","_fixture_run","_fixture_entries","_malloc","_free"]',
                 '-sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAPU32', '-o', module], timeout=180)
            scenarios = [(ROOT_A, [0, 1, 2, 3]), (ROOT_B, [0, 1, 2, 3]), (ORPHAN, [0])]
            if name == 'follow2-parallel':
                scenarios.append((CALL_ROOT, [0]))
            runner = directory / 'run.mjs'
            runner.write_text(node_source.replace('SCENARIOS', json.dumps(scenarios)))
            result['execution'][name] = json.loads(run([node, runner]).stdout)
    print(json.dumps(result))
`;

const LIVE = 0x10203040;
const STACK = 0x30000;
const LOG = 0x20000;
const original = { ebx: 0x1234565a, esi: 0x87654321, edi: 0x55667788, ebp: 0xabcdef01 };

function assertManifest(run, entries, missing = []) {
  assert.deepEqual(run.entries, entries, 'sorted actual entry receipt');
  assert.deepEqual(run.definitions, entries, 'each requested delivery has exactly one C definition');
  assert.deepEqual(run.stats.map((row) => row.va), entries, 'stats count each definition once');
  assert.deepEqual(run.missing, missing, 'missing records contain exactly undelivered entries');
  assert.deepEqual(run.failures, []);
  assert.deepEqual(run.dataStops, []);
  assert.equal(run.summary.lifted, entries.length);
  assert.equal(run.summary.failed, 0);
  assert.equal(run.summary.missing_callees, missing.length);
  assert.equal(run.summary.text_bytes_covered,
    run.covered.reduce((sum, [lo, hi]) => sum + hi - lo, 0), 'coverage is a union, not a shard sum');
  assert.deepEqual(run.exits, [...new Set(run.exits)].sort((a, b) => a - b));
}

function assertSameArtifacts(serial, parallel) {
  assert.deepEqual(parallel.artifacts, serial.artifacts, 'C, TUs, headers, receipts and coverage are byte-identical');
  assert.deepEqual(parallel.stats, serial.stats, 'per-definition stats do not double-count shared closure');
  assert.deepEqual(parallel.summary, serial.summary, 'semantic summaries match; timings and invocation differ intentionally');
}

function assertOriginalFrame(state, complete) {
  assert.equal(state.returnAddress, 0xfaceb00c, 'original guest return slot is never replaced');
  assert.equal(state.argument, state.input);
  assert.equal(state.savedEbp, original.ebp);
  assert.equal(state.savedEbx, original.ebx);
  assert.equal(state.savedEsi, original.esi);
  assert.equal(state.savedEdi, original.edi);
  assert.equal(state.ecx, state.input, 'live input crosses every continuation');
  assert.equal(state.eax, state.input & 3);
  if (complete) {
    for (const [register, value] of Object.entries(original)) assert.equal(state[register], value, register);
    assert.equal(state.esp, STACK + 8, 'one original ret 4, no synthetic guest pushes or returns');
    assert.equal(state.eip, 0xfaceb00c);
    assert.equal(state.pending, 0);
  } else {
    assert.equal(state.esp, STACK - 16, 'park leaves caller frame intact');
    assert.equal(state.ebp, STACK - 4, 'park does not run another prologue');
    assert.equal(state.pending, 1, 'cross-owner instructions are not swallowed into caller');
    assert.equal(state.cf, 1, 'STC is spilled despite default function-local flags');
    assert.equal(state.zf, state.input === 0 ? 1 : 0);
    assert.equal(state.sf, 0);
    assert.equal(state.of, 0);
    assert.equal(state.dispatches, 1, 'dispatcher parks without secretly running target');
  }
}

function assertCoreExecution(execution, addresses, entries) {
  const delivered = execution.dispatchEntries.filter((va) => va >= 0x401000 && va < 0x407000);
  assert.deepEqual(delivered, entries, 'compiled dispatch contains definitions, including already-covered continuations');
  assert.deepEqual(execution.dispatchEntries, [...new Set(execution.dispatchEntries)].sort((a, b) => a - b));
  const paths = [
    [1, 3, 5, 1, 3, 5, 1, 3, 5, 6],
    [2, 1, 3, 5, 1, 3, 5, 1, 3, 5, 6],
    [10, 11, 1, 3, 5, 1, 3, 5, 1, 3, 5, 6],
    [5, 1, 3, 5, 1, 3, 5, 6],
  ];
  const amounts = { 1: 3, 2: 5, 3: 7, 5: 17, 10: 11, 11: 13 };
  for (const state of execution.states.filter((row) => row.entry === addresses.rootA || row.entry === addresses.rootB)) {
    const selected = state.input & 3;
    const callerA = state.entry === addresses.rootA;
    assertOriginalFrame(state, state.complete);
    const expectedTrace = state.complete ? paths[selected]
      : callerA && selected === 2 ? [10] : callerA && selected === 3 ? [5] : [];
    assert.deepEqual(state.trace.map((row) => row.event), expectedTrace);
    assert.equal(state.traceCount, expectedTrace.length);
    let edx = 100, esi = LIVE, ebx = 3;
    for (const [index, row] of state.trace.entries()) {
      assert.deepEqual(
        [row.esp, row.ebp, row.ebx, row.esi, row.ecx, row.eax, row.edx],
        [STACK - 16, STACK - 4, ebx, esi, state.input, selected, edx],
        'continuation keeps shared frame and live registers');
      assert.deepEqual([row.cf, row.sf, row.of], [1, 0, 0], 'flags are read after every jump');
      assert.equal(row.zf, row.event === 6 || (index === 0 && selected === 0) ? 1 : 0);
      if (row.event !== 6) {
        edx += 1;
        esi += amounts[row.event];
        if (row.event === 5) ebx -= 1;
      }
    }
    assert.equal(state.edx, edx, 'ADC consumes incoming carry on each executed block');
    if (state.complete) {
      const dispatches = [10, 11, callerA ? 11 : 12, callerA ? 7 : 8][selected];
      assert.equal(state.dispatches, dispatches, 'every nonlocal hop uses genuine runtime dispatch');
    } else {
      const target = [addresses.next, addresses.direct,
        callerA ? addresses.fall : addresses.localFall,
        callerA ? addresses.next : addresses.interior][selected];
      assert.equal(state.target, target);
      assert.equal(state.ebx, ebx);
      assert.equal(state.esi, esi);
      assert.equal(state.edi, LOG + expectedTrace.length * 36);
    }
  }
  for (const state of execution.states.filter((row) => row.entry === addresses.orphan)) {
    assert.deepEqual(state.trace.map((row) => row.event), state.complete ? [20, 21] : [20]);
    assert.equal(state.returnAddress, 0xfaceb00c);
    assert.equal(state.ebp, original.ebp);
    assert.equal(state.ebx, original.ebx);
    assert.equal(state.esi, LIVE + 19);
    assert.equal(state.edx, state.complete ? 102 : 101);
    assert.equal(state.esp, state.complete ? STACK + 8 : STACK);
    assert.equal(state.pending, state.complete ? 0 : 1);
    assert.equal(state.dispatches, state.complete ? 2 : 1);
    if (state.complete) assert.equal(state.eip, 0xfaceb00c);
    else assert.equal(state.target, addresses.orphanTail);
    for (const row of state.trace) {
      assert.equal(row.esp, STACK, 'rescued continuation never invents a frame');
      assert.equal(row.ebp, original.ebp);
      assert.deepEqual([row.cf, row.zf, row.sf, row.of], [1, 0, 0, 0]);
    }
  }
}

test('PE32 lift pipelines deliver recursive jump closure and executable shared frames', async (t) => {
  const result = runFixture(t);
  if (!result) return;
  const a = result.addresses;
  const core = [a.rootA, a.rootB, a.localFall, a.fall, a.interior, a.next,
    a.common, a.direct, a.orphan, a.orphanTail].sort((x, y) => x - y);

  await t.test('parallel CLI refuses missing inventory, address split, or output before writing', () => {
    assert.deepEqual(result.guards, ['--va-file', '--split-va', '--out']
      .map((absent) => ({ absent, status: 2, wroteOutput: false })));
  });

  await t.test('static table, direct, fallthrough, and rescued exits close without --follow', () => {
    for (const run of [result.modes.core.serial, result.modes.core.parallel, result.modes.core.oneWorker]) {
      assertManifest(run, core);
      assert.deepEqual(run.calls, {});
      assert.deepEqual(run.exits, [a.localFall, a.fall, a.interior, a.next,
        a.common, a.direct, a.orphanTail].sort((x, y) => x - y));
      assert.equal(run.summary.fragments_rescued, 1, 'only uncovered fragment is rescued');
    }
    assertSameArtifacts(result.modes.core.serial, result.modes.core.parallel);
    assertSameArtifacts(result.modes.core.serial, result.modes.core.oneWorker);
    assert.equal(result.modes.core.parallel.parts, 2);
    assert.equal(result.modes.core.oneWorker.parts, 1);
  });

  await t.test('global rescue imports entry receipts and delivers byte-covered, excluded, and absent targets', () => {
    assertManifest(result.deferred, [a.rootA, a.rootB],
      [a.localFall, a.fall, a.interior, a.next, a.direct].sort((x, y) => x - y));
    assert.deepEqual(result.deferred.exits,
      [a.localFall, a.fall, a.interior, a.next, a.direct].sort((x, y) => x - y));
    assert.equal(result.deferred.summary.fragments_rescued, 0);
    for (const target of [a.localFall, a.interior]) {
      assert.ok(result.deferred.covered.some(([lo, hi]) => lo <= target && target < hi),
        'target already exists as bytes in caller body');
      assert.ok(!result.deferred.entries.includes(target), 'byte coverage is not a dispatch entry');
      assert.ok(result.rescue.entries.includes(target), 'explicit exit overrides fragment/coverage filtering');
    }
    const imported = new Set(result.deferred.entries);
    assertManifest(result.rescue, core.filter((va) => !imported.has(va)));
    assert.ok(result.rescue.entries.includes(a.common), 'direct exit of a newly delivered exit closes recursively');
    assert.ok(result.rescue.entries.includes(a.orphanTail), 'rescued fragment recursively delivers its own exit');
    assert.equal(result.rescue.summary.fragments_rescued, 1);
  });

  await t.test('CALL follow depth counts calls only, not continuation hops, in serial and parallel', () => {
    const shallow = [...core, a.callRoot].sort((x, y) => x - y);
    const depth1 = [...shallow, a.callee, a.callContA, a.callContB].sort((x, y) => x - y);
    const depth2 = [...depth1, a.deepCallee].sort((x, y) => x - y);
    for (const [name, entries, missing, calls] of [
      ['callsOff', shallow, [a.callee], { [hex(a.callee)]: 1 }],
      ['follow0', shallow, [a.callee], { [hex(a.callee)]: 1 }],
      ['follow1', depth1, [a.deepCallee], { [hex(a.callee)]: 1, [hex(a.deepCallee)]: 2 }],
      ['follow2', depth2, [], { [hex(a.callee)]: 1, [hex(a.deepCallee)]: 2 }],
    ]) {
      const { serial, parallel } = result.modes[name];
      for (const run of [serial, parallel]) {
        assertManifest(run, entries, missing);
        assert.deepEqual(run.calls, calls, 'genuine callees record minimum nesting depth');
        assert.equal(run.summary.fragments_rescued, 1);
      }
      assertSameArtifacts(serial, parallel);
    }
    assert.deepEqual(result.modes.callsOff.serial.artifacts, result.modes.follow0.serial.artifacts);
  });

  await t.test('compiled Wasm dispatcher parks then completes every shared-frame path', (t) => {
    if (result.skipExecution) return t.skip(result.skipExecution);
    const serial = result.execution['core-serial'];
    const parallel = result.execution['core-parallel'];
    assertCoreExecution(serial, a, core);
    assertCoreExecution(parallel, a, core);
    assert.deepEqual(parallel, serial, 'serial and parallel artifacts have identical executable behavior');
  });

  await t.test('compiled CALL path pumps recursive continuations inside original callee frame', (t) => {
    if (result.skipExecution) return t.skip(result.skipExecution);
    const entries = result.modes.follow2.parallel.entries;
    const execution = result.execution['follow2-parallel'];
    assertCoreExecution(execution, a, entries);
    for (const state of execution.states.filter((row) => row.entry === a.callRoot)) {
      assertOriginalFrame(state, true);
      assert.deepEqual(state.trace.map((row) => row.event), [30, 32, 33, 34, 36, 35, 31]);
      assert.deepEqual(state.trace.map((row) => row.esp),
        [STACK - 16, STACK - 20, STACK - 20, STACK - 20, STACK - 24, STACK - 20, STACK - 16]);
      assert.deepEqual(state.trace.map((row) => row.edx), [100, 100, 101, 102, 103, 104, 104]);
      assert.deepEqual(state.trace.map((row) => row.esi),
        [LIVE, LIVE, LIVE + 23, LIVE + 52, LIVE + 83, LIVE + 120, LIVE + 120]);
      assert.equal(state.edx, 104);
      assert.equal(state.dispatches, 3, 'callee continuations, not direct CALLs, use dispatcher');
      for (const row of state.trace) {
        assert.equal(row.ebp, STACK - 4);
        assert.equal(row.ebx, 3);
        assert.deepEqual([row.cf, row.zf, row.sf, row.of], [1, 0, 0, 0]);
      }
    }
  });
});

function hex(va) {
  return `0x${va.toString(16).padStart(8, '0')}`;
}
