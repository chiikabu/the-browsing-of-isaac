// The start-room ping-pong (recomp round 26). In some floors the player
// bounced between the start room and a neighbour once per game frame, and in
// every floor a walk transition started on the run's first update with no
// movement key. The door-touch check (0x007f01c0) fires when a player is
// within 25 px of an open door's trigger point, and that distance goes
// through the game's sqrtf wrapper (0x00435a50): cvtss2sd, sqrtsd, cvtsd2ss.
// The lifter lowers sqrtsd to recomp_fsqrt_f64(recomp_rd64(...)) -- the
// operand's BIT PATTERN in and out, the shape of every other f64 helper --
// but recomp_rt.h declared it double(double), and -w hid the conversions:
// the bits arrived as a value (~4.7e18 for 98800.0), sqrt of that truncated
// back to a bit pattern was a denormal, cvtsd2ss made it 0.0. Every vector
// length in the game was 0, so the first open door of every room was
// "touched" every frame, and entity positions went inf/NaN (the
// `Invalid entity position` asserts and the CellSpace::insert hang).
// These pins hold the helper to the bit contract and keep the oracle case
// that catches it. The first test is red until the helper is fixed (see
// the patch in the round-26 notes); the current tree is its mutant.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const host = join(root, 'scripts', 'recomp', 'host', 'src');
const oracle = join(root, 'scripts', 'recomp', 'oracle', 'wideops.py');

test('recomp_fsqrt_f64 takes and returns the operand bit pattern, like every other f64 helper', () => {
  const h = readFileSync(join(lift, 'recomp_rt.h'), 'utf8');
  const c = readFileSync(join(lift, 'recomp_rt.c'), 'utf8');
  assert.ok(/^uint64_t recomp_fsqrt_f64\(uint64_t\);/m.test(h), 'declared on uint64_t in recomp_rt.h');
  assert.ok(!/double recomp_fsqrt_f64\(double/.test(h) && !/double recomp_fsqrt_f64\(double/.test(c),
    'the double(double) prototype is gone from both files');
  assert.ok(/uint64_t recomp_fsqrt_f64\(uint64_t a\) \{ return recomp_f642bits\(sqrt\(recomp_bits2f64\(a\)\)\); \}/.test(c),
    'defined on bits in recomp_rt.c');
  // the lifter emits recomp_f*_f64(recomp_rd64(...)) for every f64 SSE op:
  // no helper of that family may be declared on double values
  assert.ok(!/\bdouble recomp_f[a-z0-9_]*_f64\s*\(\s*double/.test(h), 'no f64 helper is declared on double values');
});

test('the wideops oracle covers scalar sqrt with numeric (byte-exact) f64 lanes', () => {
  const src = readFileSync(oracle, 'utf8');
  assert.ok(/dict\(name="sqrtsd", code="f20f51c1", pos_f64=True/.test(src),
    'sqrtsd xmm0, xmm1 is a case with non-negative finite inputs');
  assert.ok(/dict\(name="sqrtss", code="f30f51c1", nan_lanes=4/.test(src), 'sqrtss is the bit-typed control');
  assert.ok(/elif case\.get\("pos_f64"\):[\s\S]{0,400}0x7FEFFFFFFFFFFFFF/.test(src),
    'pos_f64 clears the sign bit and keeps the exponent finite, so the lane must be byte-exact');
  assert.ok(src.includes('rt_dir = os.environ.get("WIDEOPS_RT_DIR") or LIFT'),
    'WIDEOPS_RT_DIR points the oracle at an alternative runtime pair for an A/B');
});

test('the room-transition probes are env-gated; the dump is observe-only', () => {
  const gl = readFileSync(join(host, 'host_shims_gl.c'), 'utf8');
  const probeAt = gl.indexOf('void isaac_room_probe(const char *why) {');
  const testAt = gl.indexOf('void isaac_room_test(CpuState *cpu, const char *line) {');
  assert.ok(probeAt > 0 && testAt > probeAt, 'both probes exist');
  const probe = gl.slice(probeAt, gl.indexOf('/* ISAAC_ROOM_TEST=1', probeAt));
  assert.ok(probe.includes('getenv("ISAAC_ROOM_PROBE")'), 'the dump is off unless ISAAC_ROOM_PROBE is set');
  assert.ok(!probe.includes('isaac_w32('), 'the dump never writes guest memory');
  const t = gl.slice(testAt);
  assert.ok(t.includes('getenv("ISAAC_ROOM_TEST")'), 'the in-situ test is off unless ISAAC_ROOM_TEST is set');
  assert.ok(t.includes('isaac_w32(door + 0xcu, ostate);'), 'it restores the door state it forced open');
  assert.ok(gl.includes('isaac_room_probe("log");') && gl.includes('isaac_room_probe("frame");'),
    'hooked at every engine log line and once per frame');
});
