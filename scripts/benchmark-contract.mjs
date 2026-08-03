import { createHash } from "node:crypto";
import { isAbsolute } from "node:path";

export const BENCHMARK_SEED_COMPACT = "3W3EGJ7M";
export const BENCHMARK_SEED_FORMATTED = "3W3E GJ7M";
export const BENCHMARK_SEED_NUMERIC = 3277667550;
export const BENCHMARK_MARKER =
  "[ISAAC_BENCH] floor_ready seed=3W3E GJ7M numeric=3277667550 " +
  "player=0 room=start guest_frames=30";
export const BENCHMARK_SEED_INPUT = Object.freeze([
  Object.freeze(["Tab", 43]),
  Object.freeze(["3", 32]),
  Object.freeze(["w", 26]),
  Object.freeze(["3", 32]),
  Object.freeze(["e", 8]),
  Object.freeze(["g", 10]),
  Object.freeze(["j", 13]),
  Object.freeze(["7", 36]),
  Object.freeze(["m", 16]),
  Object.freeze(["Enter", 40]),
]);
export const BENCHMARK_MOVEMENT_INPUT = Object.freeze([
  Object.freeze({ key: "d", scanCode: 7, holdMs: 1000, settleMs: 750 }),
  Object.freeze({ key: "s", scanCode: 22, holdMs: 1000, settleMs: 750 }),
  Object.freeze({ key: "a", scanCode: 4, holdMs: 1000, settleMs: 750 }),
  Object.freeze({ key: "w", scanCode: 26, holdMs: 1000, settleMs: 750 }),
]);

const RNG_PATTERN =
  /RNG Start Seed:\s*([A-Z0-9]{4})\s+([A-Z0-9]{4})\s+\((\d+)\)\s+\[New,\s*1\]/;

export function createBenchmarkEvidence(seedSubmittedLineIndex = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(seedSubmittedLineIndex) || seedSubmittedLineIndex < 0) {
    throw new Error("seedSubmittedLineIndex must be a nonnegative safe integer");
  }
  return {
    seedSubmittedLineIndex,
    lastSeenLineIndex: -1,
    lastAcceptedLineIndex: seedSubmittedLineIndex - 1,
    status: "await-seed",
    error: null,
    seed: null,
    lines: {},
    guestCallback: false,
  };
}

export function updateBenchmarkEvidence(evidence, line, lineIndex) {
  if (!Number.isSafeInteger(lineIndex) || lineIndex < 0) {
    throw new Error("lineIndex must be a nonnegative safe integer");
  }
  if (lineIndex <= evidence.lastSeenLineIndex) {
    throw new Error("benchmark console lines must be supplied once in increasing index order");
  }
  evidence.lastSeenLineIndex = lineIndex;
  if (lineIndex < evidence.seedSubmittedLineIndex || evidence.error) return evidence;

  if (!evidence.seed) {
    const match = line.match(RNG_PATTERN);
    if (!match) return evidence;
    const compact = match[1] + match[2];
    const numeric = Number(match[3]);
    evidence.seed = {
      compact,
      formatted: `${match[1]} ${match[2]}`,
      numeric,
      raw: line,
    };
    evidence.lines.seed = { index: lineIndex, raw: line };
    if (compact !== BENCHMARK_SEED_COMPACT || numeric !== BENCHMARK_SEED_NUMERIC) {
      evidence.status = "invalid-seed";
      evidence.error = `unexpected seed ${compact} (${numeric})`;
      return evidence;
    }
    evidence.lastAcceptedLineIndex = lineIndex;
    evidence.status = "await-player";
    return evidence;
  }

  if (lineIndex <= evidence.lastAcceptedLineIndex) return evidence;

  if (evidence.status === "await-player" && /Initialized player with Variant 0 and Subtype 0/.test(line)) {
    evidence.lines.player = { index: lineIndex, raw: line };
    evidence.status = "await-level";
  } else if (evidence.status === "await-level" && /Level::Init m_Stage 1, m_StageType 0/.test(line)) {
    evidence.lines.level = { index: lineIndex, raw: line };
    evidence.status = "await-start-room";
  } else if (evidence.status === "await-start-room" && /Room 1\.2\(Start Room\)/.test(line)) {
    evidence.lines.startRoom = { index: lineIndex, raw: line };
    evidence.status = "await-callback";
  } else if (evidence.status === "await-callback") {
    const markerAt = line.indexOf(BENCHMARK_MARKER);
    const markerSuffix = markerAt < 0 ? null : line.slice(markerAt + BENCHMARK_MARKER.length).trim();
    if (markerAt >= 0 && (markerSuffix === "" || markerSuffix === '"')) {
      evidence.lines.floorReady = { index: lineIndex, raw: line };
      evidence.status = "ready";
      evidence.guestCallback = true;
    }
  }
  if (Object.values(evidence.lines).some((entry) => entry?.index === lineIndex)) {
    evidence.lastAcceptedLineIndex = lineIndex;
  }
  return evidence;
}

export function stableStringify(value) {
  const seen = new WeakSet();
  const visit = (current) => {
    if (current === null || typeof current === "boolean" || typeof current === "string") {
      return JSON.stringify(current);
    }
    if (typeof current === "number") {
      if (!Number.isFinite(current)) throw new Error("canonical JSON numbers must be finite");
      if (Object.is(current, -0)) throw new Error("canonical JSON does not accept negative zero");
      return JSON.stringify(current);
    }
    if (!current || typeof current !== "object") {
      throw new Error(`unsupported canonical JSON value: ${typeof current}`);
    }
    if (seen.has(current)) throw new Error("canonical JSON cannot contain cycles");
    seen.add(current);
    let result;
    if (Array.isArray(current)) {
      for (let index = 0; index < current.length; index++) {
        if (!(index in current)) throw new Error("canonical JSON does not accept sparse arrays");
      }
      result = `[${current.map(visit).join(",")}]`;
    } else {
      if (Object.getPrototypeOf(current) !== Object.prototype) {
        throw new Error("canonical JSON objects must be plain objects");
      }
      result = `{${Object.keys(current).sort().map((key) =>
        `${JSON.stringify(key)}:${visit(current[key])}`
      ).join(",")}}`;
    }
    seen.delete(current);
    return result;
  };
  return visit(value);
}

export function sha256Canonical(value) {
  return createHash("sha256").update(stableStringify(value)).digest("hex").toUpperCase();
}

export function percentile(sortedValues, fraction) {
  if (!sortedValues.length) return null;
  return sortedValues[Math.min(sortedValues.length - 1, Math.ceil(sortedValues.length * fraction) - 1)];
}

export function summarizeFrameDeltas(deltasUs) {
  const sorted = deltasUs.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  const frozenInput = Object.freeze([...deltasUs]);
  if (!sorted.length) {
    return Object.freeze({
      count: 0,
      rejectedCount: deltasUs.length,
      medianUs: null,
      p95Us: null,
      p99Us: null,
      maxUs: null,
      medianFps: null,
      p99FrameTimeFps: null,
      onePercentLowFps: null,
      averageFps: null,
      deltasUs: frozenInput,
    });
  }
  const medianUs = percentile(sorted, 0.5);
  const p95Us = percentile(sorted, 0.95);
  const p99Us = percentile(sorted, 0.99);
  const worstOnePercent = [...sorted].reverse().slice(0, Math.max(1, Math.ceil(sorted.length * 0.01)));
  const worstOnePercentAverageUs = worstOnePercent.reduce((sum, value) => sum + value, 0) / worstOnePercent.length;
  return Object.freeze({
    count: sorted.length,
    rejectedCount: deltasUs.length - sorted.length,
    medianUs,
    p95Us,
    p99Us,
    maxUs: sorted[sorted.length - 1],
    medianFps: 1_000_000 / medianUs,
    p99FrameTimeFps: 1_000_000 / p99Us,
    onePercentLowFps: 1_000_000 / worstOnePercentAverageUs,
    averageFps: sorted.length * 1_000_000 / sorted.reduce((sum, value) => sum + value, 0),
    deltasUs: frozenInput,
  });
}

export function parsePositiveInteger(value, name, fallback) {
  const text = value === undefined || value === "" ? String(fallback) : String(value);
  if (!/^[1-9]\d*$/.test(text)) throw new Error(`${name} must be a positive integer`);
  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed)) throw new Error(`${name} must be a safe integer`);
  return parsed;
}

export function parseBenchmarkConfig(env) {
  if (env.BENCHMARK !== "1") return { enabled: false };
  const cacheMode = env.BENCH_CACHE_MODE;
  if (!new Set(["cold", "warm"]).has(cacheMode)) {
    throw new Error("BENCH_CACHE_MODE must be cold or warm");
  }
  if (typeof env.BENCH_SAVE !== "string" || !env.BENCH_SAVE ||
      env.BENCH_SAVE.trim() !== env.BENCH_SAVE || !isAbsolute(env.BENCH_SAVE)) {
    throw new Error("BENCH_SAVE must be a nonempty trimmed absolute path");
  }
  const seed = env.BENCH_SEED === undefined ? BENCHMARK_SEED_COMPACT : env.BENCH_SEED;
  if (seed !== BENCHMARK_SEED_COMPACT && seed !== BENCHMARK_SEED_FORMATTED) {
    throw new Error(`BENCH_SEED must be ${BENCHMARK_SEED_COMPACT}`);
  }
  const repeats = parsePositiveInteger(env.BENCH_REPEATS, "BENCH_REPEATS", 3);
  const warmupMs = parsePositiveInteger(env.BENCH_WARMUP_MS, "BENCH_WARMUP_MS", 60_000);
  const measureMs = parsePositiveInteger(env.BENCH_MEASURE_MS, "BENCH_MEASURE_MS", 30_000);
  if (repeats < 3 || repeats > 20) throw new Error("BENCH_REPEATS must be between 3 and 20");
  if (warmupMs < 1_000 || warmupMs > 600_000) throw new Error("BENCH_WARMUP_MS is out of range");
  if (measureMs < 1_000 || measureMs > 300_000) throw new Error("BENCH_MEASURE_MS is out of range");
  return {
    enabled: true,
    cacheMode,
    save: env.BENCH_SAVE,
    seed: BENCHMARK_SEED_COMPACT,
    repeats,
    warmupMs,
    measureMs,
    inputScript: "benchmark-v1",
  };
}
