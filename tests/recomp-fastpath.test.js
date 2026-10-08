// Execute the real host predicate and installed wrapper. The optional lifted
// oracle uses the generated PE bodies, never a second implementation of them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const python = [process.env.PYTHON, 'python3', 'python'].find((p) => p &&
  spawnSync(p, ['-B', '-c', 'import sys; sys.exit(sys.version_info < (3, 9))'],
    { encoding: 'utf8', timeout: 10000 }).status === 0);

const fixture = String.raw`
#include "isaac_host.h"
#include "recomp_rt.h"
#include <emscripten.h>
#include <setjmp.h>
#include <stdarg.h>

#define ARENA 0x01800000u
#define SELF (ARENA + 0x100u)
#define SLOTS (ARENA + 0x200u)
#define NAME (ARENA + 0x400u)
#define OTHER_NAME (ARENA + 0x440u)
#define VERSIONS (ARENA + 0x500u)
#define OLD (ARENA + 0x604u)
#define LATEST (ARENA + 0x704u)
#define DATA (ARENA + 0x805u)
#define SNAPSHOT (ARENA + 0x900u)
#define STACK 0x01008000u
#define SEH 0x01300000u
#define COOKIE 0x00bf93b4u
static const unsigned widths[] = {4,8,12,16,4,8,12,16,4,8,12,16,16,24,32,24,36,48,32,48,64};
static int failures;
static int fault;
static int native_fault;
static jmp_buf escape;
static unsigned stop;
uint32_t g_reentry_eip, recomp_jmp_pending, recomp_jmp_target;
uint32_t isaac_fastpath_mismatches(void);
int uniform_native_candidate(CpuState *s);
int isaac_fast_shader_uniform(CpuState *s) {
    int handled = uniform_native_candidate(s);
    /* The real candidate runs first. Inject an illegal write afterwards to
     * ensure verification did not take its baseline after the candidate. */
    if (handled && native_fault) MEMW32(SNAPSHOT, 0u);
    return handled;
}

void isaac_log(const char *fmt, ...) {
    va_list ap; va_start(ap, fmt); vfprintf(stderr, fmt, ap); va_end(ap);
    fputc('\n', stderr);
}
static void check(int ok, const char *label) {
    if (!ok) { fprintf(stderr, "FAIL %s\n", label); ++failures; }
}
static void stopped(unsigned va) { stop = va; longjmp(escape, 1); }
void recomp_run_pending(CpuState *s) { (void)s; stopped(0xffff0001u); }
void recomp_jump_indirect(CpuState *s, uint32_t target) { (void)s; stopped(target); }
void recomp_call_indirect(CpuState *s, uint32_t target) { (void)s; stopped(target); }
void recomp_unreachable(CpuState *s, uint32_t target) { (void)s; stopped(target); }

static CpuState seed(unsigned type, unsigned alignment) {
    memset(isaac_g(ARENA), 0x5a, 0x1000u);
    memset(isaac_g(STACK - 256u), 0xa6, 512u);
    CpuState s;
    memset(&s, 0x39, sizeof s);
    s.ESP = STACK + alignment; s.ECX = SELF; s.FS_OFFSET = SEH;
    s.CF = s.AF = s.SF = s.OF = 1u; s.PF = s.ZF = 0u;
    MEMW32(SEH, 0x12345678u); MEMW32(COOKIE, 0x9e3779b9u);
    MEMW32(s.ESP, 0x004095c8u);
    MEMW32(s.ESP + 4u, NAME); MEMW32(s.ESP + 8u, type);
    MEMW32(s.ESP + 12u, DATA); MEMW32(s.ESP + 16u, 0xdeadc0deu);
    memcpy(isaac_g(NAME), "ChampionColor", 14u);
    memcpy(isaac_g(OTHER_NAME), "OtherUniform!", 14u);
    MEMW32(SELF + 0x34u, SLOTS); MEMW32(SELF + 0x38u, SLOTS + 24u);
    MEMW32(SELF + 0x3cu, SLOTS + 72u);
    MEMW32(SELF + 0x40u, SNAPSHOT); MEMW32(SELF + 0x44u, SNAPSHOT + 4u);
    MEMW32(SELF + 0x48u, SNAPSHOT + 12u); MEMW32(SNAPSHOT, 1u);
    MEMW32(SLOTS, NAME); MEMW32(SLOTS + 4u, 1u); MEMW32(SLOTS + 8u, 28u);
    MEMW32(SLOTS + 12u, VERSIONS); MEMW32(SLOTS + 16u, VERSIONS + 8u);
    MEMW32(SLOTS + 20u, VERSIONS + 16u);
    MEMW32(VERSIONS, OLD); MEMW32(VERSIONS + 4u, LATEST);
    MEMW32(OLD - 4u, 64u); MEMW32(LATEST - 4u, 64u);
    for (unsigned p = 0; p < 64u; p += 4u) {
        MEMW32(LATEST + p, 0x7fc01234u + p);
        MEMW32(DATA + p, 0x7fc01234u + p);
        MEMW32(OLD + p, 0x80000000u + p);
    }
    return s;
}

static CpuState expected(CpuState s, unsigned size) {
    unsigned data = MEMR32(s.ESP + 12u);
    s.EAX = MEMR32(data + size - 4u); s.EDX = data + size;
    s.ECX = MEMR32(COOKIE) ^ ((s.ESP - 12u) & ~7u);
    s.CF = s.AF = s.SF = s.OF = 0u; s.PF = s.ZF = 1u;
    s.EIP = MEMR32(s.ESP); s.ESP += 20u;
    return s;
}

static void attempt(CpuState s, int handled, unsigned size, const char *label) {
    uint8_t before[0x1000], stack[512];
    memcpy(before, isaac_g(ARENA), sizeof before);
    memcpy(stack, isaac_g(STACK - 256u), sizeof stack);
    unsigned seh = MEMR32(SEH), cookie = MEMR32(COOKIE);
    CpuState want = handled ? expected(s, size) : s;
    int result = isaac_fast_shader_uniform(&s);
    check(result == handled && memcmp(&s, &want, sizeof s) == 0
          && memcmp(before, isaac_g(ARENA), sizeof before) == 0
          && memcmp(stack, isaac_g(STACK - 256u), sizeof stack) == 0
          && MEMR32(SEH) == seh && MEMR32(COOKIE) == cookie, label);
}

EMSCRIPTEN_KEEPALIVE int uniform_cases(void) {
    failures = 0;
    for (unsigned type = 8u; type <= 28u; ++type) {
        unsigned size = widths[type - 8u];
        for (unsigned align = 0; align <= 4u; align += 4u) {
            CpuState s = seed(type, align);
            MEMW8(DATA + size, (uint8_t)(MEMR8(DATA + size) ^ 1u));
            attempt(s, 1, size, "incoming PE type width, next byte ignored, exact CPU return");
            MEMW8(DATA + size - 1u, (uint8_t)(MEMR8(DATA + size - 1u) ^ 1u));
            attempt(s, 0, size, "last byte in every PE width must compare");
            s = seed(type, align); MEMW8(DATA, (uint8_t)(MEMR8(DATA) ^ 1u));
            attempt(s, 0, size, "first byte in every PE width must compare");
        }
    }
    for (unsigned type = 0; type <= 7u; ++type) attempt(seed(type, 0), 0, 0, "low invalid types retain logger");
    attempt(seed(29u, 0), 0, 0, "high invalid type retains logger");
    attempt(seed(0xffffffffu, 0), 0, 0, "type comparison is unsigned");
    CpuState s = seed(11u, 0);
    MEMW32(SELF + 0x38u, SLOTS + 72u);
    memcpy(isaac_g(SLOTS + 24u), isaac_g(SLOTS), 24u);
    memcpy(isaac_g(SLOTS + 48u), isaac_g(SLOTS), 24u);
    MEMW32(SLOTS + 4u, 0u); MEMW32(SLOTS + 16u, VERSIONS + 4u);
    attempt(s, 1, 16u, "inactive duplicate cannot hide first active row");
    MEMW32(SLOTS + 24u + 16u, VERSIONS + 4u);
    attempt(s, 0, 16u, "later active duplicate cannot replace first active row");
    s = seed(11u, 0); MEMW32(s.ESP + 4u, OTHER_NAME);
    attempt(s, 0, 16u, "missing name declines");
    memcpy(isaac_g(OTHER_NAME), isaac_g(NAME), 14u);
    attempt(s, 1, 16u, "same pointer with changed string content is searched again");
    MEMW8(OTHER_NAME, 'X');
    attempt(s, 0, 16u, "mutable input name cannot reuse cached slot");
    s = seed(11u, 0); memcpy(isaac_g(OTHER_NAME), isaac_g(NAME), 14u);
    MEMW32(SLOTS, OTHER_NAME);
    attempt(s, 1, 16u, "separate mutable stored name initially matches");
    MEMW8(OTHER_NAME, 'X');
    attempt(s, 0, 16u, "same stored name pointer with changed content is searched again");
    s = seed(11u, 0);
    attempt(s, 1, 16u, "warm match before relocation");
    memcpy(isaac_g(SLOTS + 24u), isaac_g(SLOTS), 24u);
    MEMW32(SELF + 0x34u, SLOTS + 24u); MEMW32(SELF + 0x38u, SLOTS + 48u);
    MEMW32(SLOTS, 0u);
    attempt(s, 1, 16u, "relocated slot uses current vector");
    MEMW32(SLOTS + 24u, OTHER_NAME);
    attempt(s, 0, 16u, "replacement slot at same address is not cached");
    s = seed(11u, 0); memcpy(isaac_g(DATA), isaac_g(OLD), 16u);
    attempt(s, 0, 16u, "matching historical version is not latest");
    s = seed(8u, 0); MEMW32(SLOTS + 8u, 0u); MEMW32(DATA + 4u, 0u);
    attempt(s, 1, 4u, "stored type does not determine incoming width");
    s = seed(28u, 0); MEMW32(SLOTS + 8u, 8u); MEMW8(DATA + 63u, 0u);
    attempt(s, 0, 64u, "larger incoming type cannot truncate to stored width");
    s = seed(8u, 0); MEMW32(DATA, 0u); MEMW32(LATEST, 0x80000000u);
    attempt(s, 0, 4u, "signed zeros differ bitwise");
    MEMW32(DATA, 0x7fa12345u); MEMW32(LATEST, 0x7fa12345u);
    attempt(s, 1, 4u, "identical signaling NaN bits match");
    MEMW32(DATA, 0x7fa12344u);
    attempt(s, 0, 4u, "NaN payload bits differ");
    s = seed(11u, 0); MEMW32(SLOTS + 16u, VERSIONS);
    attempt(s, 0, 0, "empty versions decline");
    s = seed(11u, 0); MEMW32(SLOTS + 16u, VERSIONS - 4u);
    attempt(s, 0, 0, "reversed versions decline");
    s = seed(11u, 0); MEMW32(SLOTS + 16u, VERSIONS + 7u);
    attempt(s, 0, 0, "partial version pointer declines");
    s = seed(11u, 0); MEMW32(SELF + 0x38u, SLOTS + 23u);
    attempt(s, 0, 0, "partial slot declines");
    s = seed(11u, 0); MEMW32(SLOTS, 0u); MEMW32(SLOTS + 4u, 0u);
    attempt(s, 0, 0, "invalid inactive name is not skipped");
    s = seed(11u, 0); MEMW32(s.ESP + 12u, 0xfffffff8u);
    attempt(s, 0, 0, "wrapped payload range declines");
    s = seed(11u, 0); MEMW32(VERSIONS + 4u, 0u);
    attempt(s, 0, 0, "null latest buffer declines");
    s = seed(11u, 0); s.ECX = ISAAC_GUEST_LIMIT_VA - 4u;
    attempt(s, 0, 0, "receiver outside guest range declines");
    s = seed(11u, 0); s.ESP = ISAAC_GUEST_LIMIT_VA - 16u;
    attempt(s, 0, 0, "truncated argument frame declines before reads");
    /* The first PE instruction pushes EBX over these pre-call matching bytes. */
    s = seed(8u, 0); s.EBX = 0u;
    MEMW32(s.ESP - 4u, MEMR32(LATEST)); MEMW32(s.ESP + 12u, s.ESP - 4u);
    attempt(s, 0, 0, "payload overwritten by original push cannot use pre-call equality");
    s = seed(11u, 0); s.EBX = 0u;
    MEMW32(NAME, 0x71u); MEMW32(s.ESP - 4u, 0x71u);
    MEMW32(s.ESP + 4u, s.ESP - 4u);
    attempt(s, 0, 0, "matching name overwritten by original push declines unchanged");
    s = seed(11u, 0); s.FS_OFFSET = s.ESP - 8u;
    attempt(s, 0, 0, "SEH and frame alias declines");
    s = seed(11u, 0); s.FS_OFFSET = COOKIE;
    attempt(s, 0, 0, "SEH and cookie alias declines");
    s = seed(8u, 0); MEMW32(LATEST, MEMR32(SEH)); MEMW32(s.ESP + 12u, SEH);
    attempt(s, 0, 0, "matching payload overwritten by temporary SEH frame declines");
    s = seed(11u, 0); unsigned edge = ISAAC_GUEST_LIMIT_VA - 16u;
    memcpy(isaac_g(edge), isaac_g(LATEST), 16u); MEMW32(s.ESP + 12u, edge);
    attempt(s, 1, 16u, "payload ending exactly at guest limit matches");
    MEMW32(s.ESP + 12u, edge + 1u);
    attempt(s, 0, 0, "payload crossing guest limit declines");
    s = seed(8u, 0); edge = ISAAC_GUEST_LIMIT_VA - 1u;
    MEMW8(edge, 0u); MEMW8(NAME, 0u); MEMW32(s.ESP + 4u, edge);
    attempt(s, 1, 4u, "terminator at final guest byte is valid");
    MEMW8(edge, 'Q'); MEMW8(NAME, 'Q');
    attempt(s, 0, 0, "unterminated equal prefix reaches guest boundary safely");
    return failures;
}

#ifdef HAVE_UNIFORM_LIFT
void original_shader_uniform(CpuState *restrict s);
void sub_00a14c00(CpuState *restrict s);
void sub_00a14c00__lifted(CpuState *restrict s) {
    original_shader_uniform(s);
    /* Fault injection after the REAL original returns proves mode 2 detects
     * CPU, old payload, pointer-list and recorded-snapshot corruption. */
    if (fault == 1) s->AF ^= 1u;
    if (fault == 2) MEMW8(OLD, (uint8_t)(MEMR8(OLD) ^ 1u));
    if (fault == 3) MEMW32(VERSIONS, LATEST);
    if (fault == 4) MEMW32(SNAPSHOT, 0u);
}

EMSCRIPTEN_KEEPALIVE int uniform_wrappers(int mode) {
    failures = 0; fault = 0;
    setenv("ISAAC_FASTPATH", mode == 0 ? "0" : "1", 1);
    setenv("ISAAC_FASTPATH_VERIFY", mode == 2 ? "1" : "0", 1);
    for (unsigned type = 8u; type <= 28u; ++type) {
        for (unsigned align = 0u; align <= 4u; align += 4u) {
            CpuState s = seed(type, align), want = expected(s, widths[type - 8u]);
            uint8_t before[0x1000]; memcpy(before, isaac_g(ARENA), sizeof before);
            unsigned mismatches = isaac_fastpath_mismatches();
            stop = 0u;
            if (!setjmp(escape)) sub_00a14c00(&s);
            check(!stop && memcmp(&s, &want, sizeof s) == 0
                  && memcmp(before, isaac_g(ARENA), sizeof before) == 0
                  && MEMR32(SEH) == 0x12345678u
                  && isaac_fastpath_mismatches() == mismatches,
                  "wrapper mode uses real lift or exact host result with full CPU and live memory");
        }
    }
    /* These tripwires stop at the actual original side-effect callee, not a
     * modelled return. They prove rejected calls reach allocation/insertion
     * or logging, rather than silently emulating a successful return. */
    static CpuState s;
    s = seed(11u, 0); MEMW8(DATA, 0u); stop = 0u;
    if (!setjmp(escape)) sub_00a14c00(&s);
    check(stop == 0x00a0f4e0u && s.ECX == 16u && MEMR32(SLOTS + 16u) == VERSIONS + 8u,
          "changed value reaches original tracked allocation");
    s = seed(11u, 0); MEMW32(s.ESP + 4u, OTHER_NAME); stop = 0u;
    if (!setjmp(escape)) sub_00a14c00(&s);
    check(stop == 0x00a152a0u, "missing name reaches original slot insertion");
    s = seed(11u, 0); s.EBX = 0u; stop = 0u;
    MEMW32(NAME, 0x71u); MEMW32(s.ESP - 4u, 0x71u);
    MEMW32(s.ESP + 4u, s.ESP - 4u);
    if (!setjmp(escape)) sub_00a14c00(&s);
    check(stop == 0x00a152a0u,
          "original push changes matching name to empty and reaches slot insertion");
    s = seed(8u, 0); s.EBX = 0u; stop = 0u;
    MEMW32(s.ESP - 4u, MEMR32(LATEST)); MEMW32(s.ESP + 12u, s.ESP - 4u);
    if (!setjmp(escape)) sub_00a14c00(&s);
    check(stop == 0x00a0f4e0u && s.ECX == 4u,
          "original push changes matching payload and reaches tracked allocation");
    s = seed(8u, 0); stop = 0u;
    MEMW32(LATEST, MEMR32(SEH)); MEMW32(s.ESP + 12u, SEH);
    if (!setjmp(escape)) sub_00a14c00(&s);
    check(stop == 0x00a0f4e0u && s.ECX == 4u,
          "temporary SEH installation changes matching payload and reaches allocation");
    const unsigned invalid[] = {0u, 7u, 29u, 0xffffffffu};
    for (unsigned i = 0; i < 4u; ++i) {
        s = seed(invalid[i], 0); stop = 0u;
        if (!setjmp(escape)) sub_00a14c00(&s);
        check(stop == 0x00a112c0u && MEMR32(s.ESP + 4u) == 16u
              && MEMR32(s.ESP + 8u) == (invalid[i] <= 7u ? 0x00b81b40u : 0x00b81aecu),
              "both invalid type bands retain original logger and message");
    }
    if (mode == 2) {
        for (fault = 1; fault <= 4; ++fault) {
            s = seed(11u, 0); unsigned before = isaac_fastpath_mismatches();
            sub_00a14c00(&s);
            check(isaac_fastpath_mismatches() == before + 1u,
                  "verification detects actual CPU or live uniform graph corruption");
        }
        fault = 0;
        native_fault = 1;
        s = seed(11u, 0);
        unsigned before = isaac_fastpath_mismatches();
        CpuState want = expected(s, 16u);
        sub_00a14c00(&s);
        check(isaac_fastpath_mismatches() == before + 1u
              && MEMR32(SNAPSHOT) == 1u && memcmp(&s, &want, sizeof s) == 0,
              "verification snapshots before native work and restores an illegal write before the original");
        native_fault = 0;
    }
    return failures;
}
#endif
`;

const buildFixture = String.raw`
import json, re, shutil, subprocess, sys
from pathlib import Path
root, temporary = map(Path, sys.argv[1:3])
lift = root / 'scripts/recomp/lift'
host = root / 'scripts/recomp/host'
sys.path.insert(0, str(lift))
from build_boot import ensure_emsdk_env, find_emcc
from lift_patches import BLOCK_PATCHES, WRAP_PATCHES, find_function
ensure_emsdk_env()
emcc = find_emcc()
if not emcc:
    print(json.dumps({'skip': 'Emscripten unavailable; set EMCC or EMSDK'}))
    sys.exit(0)
output = root / 'output/recomp/lift/gu'
bodies = {}
if (output / 'recomp_state.h').exists():
    for path in sorted(output.glob('lifted_*.c')):
        text = path.read_text(encoding='utf-8')
        for va in (0xa14c00, 0xa15040):
            if va in bodies:
                continue
            for suffix in ('__lifted', ''):
                name = f'sub_{va:08x}' + suffix
                found = find_function(text, name)
                if found:
                    body = text[found[0]:found[1]]
                    body = body.replace(name + '(', f'sub_{va:08x}(', 1)
                    bodies[va] = body
                    break
        if len(bodies) == 2:
            break
native = temporary / 'native.c'
native.write_text('#define isaac_fast_shader_uniform uniform_native_candidate\n'
                  + '#include "' + (host / 'src/host_fastpath.c').as_posix() + '"\n')
sources = [temporary / 'fixture.c', native]
flags = []
if len(bodies) == 2:
    shutil.copyfile(output / 'recomp_state.h', temporary / 'recomp_state.h')
    setter = bodies[0xa14c00]
    _, _, new = next(p for p in BLOCK_PATCHES if p[0] == '0x00a14de7')
    # Apply today's patch even when the generated tree contains an older
    # installed copy. Mutation runs must exercise the edited production rule.
    start = setter.index('  RECOMP_VA(0xa14de7u);\n')
    end = setter.index('  RECOMP_VA(0xa14dedu);\n', start)
    setter = setter[:start] + new + setter[end:]
    setter = setter.replace('void sub_00a14c00(', 'void original_shader_uniform(', 1)
    callees = set(re.findall(r'\b((?:sub_|imp_)[A-Za-z0-9_]+)\(s\)', setter + bodies[0xa15040]))
    declarations = ''.join(f'void {name}(CpuState *restrict s);\n' for name in sorted(callees))
    tripwires = ''.join(f'void {name}(CpuState *restrict s) {{ (void)s; stopped(0x{name[4:]}u); }}\n'
                       if name.startswith('sub_') else
                       f'void {name}(CpuState *restrict s) {{ (void)s; stopped(0xffff0002u); }}\n'
                       for name in sorted(callees) if name != 'sub_00a15040')
    # Include in the same TU so fail-fast callee boundaries use the fixture's
    # setjmp observer; the lookup and setter themselves remain real lifted C.
    source = (temporary / 'fixture.c').read_text()
    source += '\n' + declarations + '\n' + tripwires + '\n' + bodies[0xa15040] + '\n' + setter
    source += '\n' + WRAP_PATCHES[0xa14c00]
    # Initialise the actual indirect jump table from its PE-derived targets.
    targets = [0xa14d9b] * 8 + [0xa14d5c,0xa14d63,0xa14d6a,0xa14d71] * 3
    targets += [0xa14d71,0xa14d78,0xa14d7f,0xa14d78,0xa14d86,0xa14d8d,0xa14d7f,0xa14d8d,0xa14d94]
    init = ''.join(f'MEMW32(0x{0xa14f10+4*i:x}u, 0x{target:x}u);\n' for i, target in enumerate(targets))
    source = source.replace('failures = 0; fault = 0;', 'failures = 0; fault = 0;\n' + init)
    (temporary / 'fixture.c').write_text(source)
    flags.append('-DHAVE_UNIFORM_LIFT=1')
command = [emcc, *map(str, sources), '-O2', '-std=gnu11', '-ffunction-sections', '-fdata-sections',
           '-Wl,--gc-sections', '-I', str(temporary), '-I', str(host / 'include'), '-I', str(lift), *flags,
           '--no-entry', '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sSINGLE_FILE=1',
           '-sGLOBAL_BASE=469762048', '-sINITIAL_MEMORY=503316480', '-sSTACK_SIZE=1048576',
           '-sERROR_ON_UNDEFINED_SYMBOLS=1', '-o', str(temporary / 'uniform.cjs')]
result = subprocess.run(command, capture_output=True, text=True, timeout=180)
if result.returncode:
    raise RuntimeError(result.stdout + result.stderr)
print(json.dumps({'lifted': len(bodies) == 2}))
`;

test('compiled uniform no-change path preserves CPU, bitwise payloads and version lifetimes', async (t) => {
  if (!python) return t.skip('Python 3 unavailable');
  const temporary = mkdtempSync(join(tmpdir(), 'isaac-uniform-'));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  writeFileSync(join(temporary, 'fixture.c'), fixture);
  writeFileSync(join(temporary, 'build.py'), buildFixture);
  const built = spawnSync(python, ['-B', join(temporary, 'build.py'), root, temporary], {
    cwd: root, encoding: 'utf8', timeout: 240000,
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
  });
  assert.equal(built.status, 0, built.error?.message || built.stderr || built.stdout);
  const result = JSON.parse(built.stdout.trim());
  if (result.skip) return t.skip(result.skip);
  const createFixture = require(join(temporary, 'uniform.cjs'));
  await t.test('all PE widths, duplicate/mutable names, latest values, range guards and full CPU state', async () => {
    const module = await createFixture();
    assert.equal(module._uniform_cases(), 0);
  });
  for (const mode of [0, 1, 2]) {
    await t.test(`compiled wrapper mode ${mode}: actual lifted return, fallback side effects and verification`, async (t) => {
      if (!result.lifted) return t.skip('generated uniform setter/lookup unavailable; build the PE lift');
      const module = await createFixture();
      assert.equal(module._uniform_wrappers(mode), 0);
    });
  }
});
