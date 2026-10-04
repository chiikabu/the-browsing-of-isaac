// Guards the session-orientation tooling: status.mjs must run and derive the
// live state from the tree, and frontier.json must stay parseable with the
// fields status.mjs and the runbook rely on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("status.mjs --json derives families, boundaries, and slice state", () => {
  const out = execFileSync(
    process.execPath,
    [join(ROOT, "scripts", "decomp", "status.mjs"), "--json"],
    { encoding: "utf8" },
  );
  const s = JSON.parse(out);
  assert.ok(Object.keys(s.families).length >= 10, "family versions derived");
  assert.equal(typeof s.families["game-update"], "number");
  assert.ok(s.updateSlice, "update slice summary present");
  assert.equal(typeof s.updateSlice.abiVersion, "number");
  assert.ok(Array.isArray(s.updateSlice.open), "open boundary list present");
  for (const b of s.updateSlice.open) {
    assert.ok(b.va, "boundary rows carry a VA/span");
    assert.ok(b.name, "boundary rows carry a name");
  }
  assert.ok(Array.isArray(s.warnings));
});

test("tree consistency: header/model/JSON ABI agree, no stranded mutants, JSON canonical + in sync", async () => {
  /* Every item here is a measured failure class (see lib/consistency.mjs):
     the ABI-101 unit shipped a cpp still carrying its mutation marker, 72
     literal `abiVersion, 100` pins went red at the bump, and the JSON spec
     had drifted 254 offsets from the model layout with nothing checking it. */
  const { runConsistencyChecks } = await import("../scripts/decomp/lib/consistency.mjs");
  const r = await runConsistencyChecks(ROOT);
  assert.deepEqual(r.errors, [], "consistency errors");
  assert.equal(r.info.layoutDrift, 0, "JSON runtimeInputs/events mirror the model layout");
});

test("slice-json.mjs canonical form is the committed form (indent 1 + LF)", async () => {
  const { isCanonical, canonical } = await import("../scripts/decomp/slice-json.mjs");
  assert.equal(isCanonical(), true, "decomp/game-update-slice.json is canonical");
  assert.equal(canonical({ a: [1] }), '{\n "a": [\n  1\n ]\n}\n');
});

test("mutate.mjs reports no stranded mutant on the tree", () => {
  const out = execFileSync(process.execPath, [join(ROOT, "scripts", "decomp", "mutate.mjs"), "check"], { encoding: "utf8" });
  assert.match(out, /clean — no stranded mutants/);
});

test("frontier.json carries the hand-off contract", () => {
  const f = JSON.parse(
    readFileSync(join(ROOT, "decomp", "frontier.json"), "utf8"),
  );
  assert.equal(typeof f.next, "string");
  assert.ok(f.next.length > 0, "next pointer is non-empty");
  assert.equal(typeof f.updated, "string");
  assert.equal(typeof f.updatedAbi, "number");
});
