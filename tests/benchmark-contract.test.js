import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import {
  BENCHMARK_MARKER,
  BENCHMARK_MOVEMENT_INPUT,
  BENCHMARK_SEED_INPUT,
  createBenchmarkEvidence,
  parseBenchmarkConfig,
  sha256Canonical,
  summarizeFrameDeltas,
  updateBenchmarkEvidence,
} from '../scripts/benchmark-contract.mjs';

test('benchmark seed input uses the fixed native scancode schedule', () => {
  assert.deepEqual(BENCHMARK_SEED_INPUT.map(([key, code]) => [key, code]), [
    ['Tab', 43], ['3', 32], ['w', 26], ['3', 32], ['e', 8],
    ['g', 10], ['j', 13], ['7', 36], ['m', 16], ['Enter', 40],
  ]);
  assert.deepEqual(BENCHMARK_MOVEMENT_INPUT.map(({ key, scanCode }) => [key, scanCode]), [
    ['d', 7], ['s', 22], ['a', 4], ['w', 26],
  ]);
});

test('benchmark evidence requires the exact ordered guest chain and callback', () => {
  const evidence = createBenchmarkEvidence(10);
  const lines = [
    'RNG Start Seed: AAAA BBBB (1) [New, 1]',
    'RNG Start Seed: 3W3E GJ7M (3277667550) [New, 1]',
    '[Frame: 0] Initialized player with Variant 0 and Subtype 0',
    'Level::Init m_Stage 1, m_StageType 0',
    'Room 1.2(Start Room)',
    BENCHMARK_MARKER,
  ];
  lines.forEach((line, offset) => updateBenchmarkEvidence(evidence, line, 9 + offset));
  assert.equal(evidence.status, 'ready');
  assert.equal(evidence.guestCallback, true);
  assert.equal(evidence.seed.compact, '3W3EGJ7M');
  assert.ok(evidence.lines.seed.index < evidence.lines.player.index);
  assert.ok(evidence.lines.player.index < evidence.lines.level.index);
  assert.ok(evidence.lines.level.index < evidence.lines.startRoom.index);
  assert.ok(evidence.lines.startRoom.index < evidence.lines.floorReady.index);
});

test('benchmark evidence rejects a wrong first post-submission seed', () => {
  const evidence = createBenchmarkEvidence(0);
  updateBenchmarkEvidence(evidence, 'RNG Start Seed: AAAA BBBB (1) [New, 1]', 0);
  assert.equal(evidence.status, 'invalid-seed');
  assert.match(evidence.error, /unexpected seed/);
});

test('benchmark evidence cannot accept out-of-order line indexes', () => {
  const evidence = createBenchmarkEvidence(10);
  updateBenchmarkEvidence(evidence, 'RNG Start Seed: 3W3E GJ7M (3277667550) [New, 1]', 10);
  assert.throws(() =>
    updateBenchmarkEvidence(evidence, '[Frame: 0] Initialized player with Variant 0 and Subtype 0', 10),
  /in increasing index order/);
  assert.throws(() => createBenchmarkEvidence(-1), /nonnegative safe integer/);
  assert.throws(() => updateBenchmarkEvidence(evidence, 'anything', 1.5), /nonnegative safe integer/);
});

test('benchmark config is strict and defaults to three fixed repeats', () => {
  assert.throws(() => parseBenchmarkConfig({ BENCHMARK: '1' }), /BENCH_CACHE_MODE/);
  const config = parseBenchmarkConfig({
    BENCHMARK: '1', BENCH_CACHE_MODE: 'cold', BENCH_SAVE: resolve('fixture.zip'),
  });
  assert.equal(config.repeats, 3);
  assert.equal(config.warmupMs, 60_000);
  assert.equal(config.measureMs, 30_000);
  assert.throws(() => parseBenchmarkConfig({
    BENCHMARK: '1', BENCH_CACHE_MODE: 'cold', BENCH_SAVE: ' fixture.zip',
  }), /trimmed/);
  assert.throws(() => parseBenchmarkConfig({
    BENCHMARK: '1', BENCH_CACHE_MODE: 'cold', BENCH_SAVE: resolve('fixture.zip'), BENCH_REPEATS: '2',
  }), /between 3 and 20/);
  assert.throws(() => parseBenchmarkConfig({
    BENCHMARK: '1', BENCH_CACHE_MODE: 'cold', BENCH_SAVE: resolve('fixture.zip'), BENCH_MEASURE_MS: '9'.repeat(400),
  }), /safe integer/);
  assert.throws(() => parseBenchmarkConfig({
    BENCHMARK: '1', BENCH_CACHE_MODE: 'cold', BENCH_SAVE: resolve('fixture.zip'), BENCH_SEED: '',
  }), /BENCH_SEED/);
});

test('frame summary reports median, tails, one-percent-low and stable identity', () => {
  const summary = summarizeFrameDeltas([10_000, 20_000, 30_000, 40_000, 50_000]);
  assert.equal(summary.medianUs, 30_000);
  assert.equal(summary.p95Us, 50_000);
  assert.equal(summary.onePercentLowFps, 20);
  assert.equal(sha256Canonical({ b: 2, a: 1 }), sha256Canonical({ a: 1, b: 2 }));
  assert.throws(() => sha256Canonical([undefined]), /unsupported/);
  assert.throws(() => sha256Canonical({ value: Number.NaN }), /finite/);
  assert.throws(() => sha256Canonical(new Array(1)), /sparse/);
  assert.throws(() => sha256Canonical(-0), /negative zero/);
  const empty = summarizeFrameDeltas([]);
  assert.ok(Object.isFrozen(empty));
  assert.ok(Object.isFrozen(empty.deltasUs));
});
