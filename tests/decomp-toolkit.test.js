// Guards the session-orientation tooling: status.mjs must run and derive the
// live state from the tree, and frontier.json must stay parseable with the
// fields status.mjs and the runbook rely on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

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

test("tree consistency rejects NUL-corrupted family C++ implementations", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "isaac-consistency-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ["scripts/decomp/lib", "native/decomp", "decomp"]) {
    mkdirSync(join(root, directory), { recursive: true });
  }
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  // Copy the checker and its reader so all inputs, including the reader's
  // module-relative JSON path, belong to this fixture rather than the live tree.
  for (const file of ["scripts/decomp/lib/consistency.mjs", "scripts/decomp/slice-json.mjs"]) {
    copyFileSync(join(ROOT, file), join(root, file));
  }
  const files = {
    "scripts/decomp/game-update-model.mjs": `
export const ABI_VERSION = 1;
export const ABI_SIZES = { runtimeInputs: 4, events: 4 };
export const RUNTIME_INPUTS_LAYOUT = { tick: { offset: 0, type: "u32" } };
export const EVENTS_LAYOUT = { tick: { offset: 0, type: "u32" } };
`,
    "native/decomp/game_update_slice.h": `
enum { ISAAC_GAME_UPDATE_ABI_VERSION = 1 };
struct IsaacGameUpdateSliceRuntimeInputs { unsigned tick; };
struct IsaacGameUpdateSliceEvents { unsigned tick; };
`,
    "native/decomp/game_update_slice.cpp": `
#include "game_update_slice.h"
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 4);
static_assert(sizeof(IsaacGameUpdateSliceEvents) == 4);
`,
    "scripts/decomp/log-pure-model.mjs": "export const ABI_VERSION = 1;\n",
    "native/decomp/log_pure_helpers.h": "enum { ISAAC_LOG_ABI_VERSION = 1 };\n",
    "decomp/frontier.json": JSON.stringify({ updatedAbi: 1 }),
    "decomp/game-update-slice.json": JSON.stringify({
      abiVersion: 1,
      runtimeInputs: [{ name: "tick", offset: 0, type: "u32", bytes: 4 }],
      events: [{ name: "tick", offset: 0, type: "u32", bytes: 4 }],
    }, null, 1) + "\n",
  };
  for (const [file, contents] of Object.entries(files)) writeFileSync(join(root, file), contents);
  const sourcePath = "native/decomp/log_pure_helpers.cpp";
  const validSource = '#include "log_pure_helpers.h"\nchar log_terminator() { return \'\\0\'; }\n';
  writeFileSync(join(root, sourcePath), validSource);
  const { runConsistencyChecks } = await import(pathToFileURL(join(root, "scripts/decomp/lib/consistency.mjs")).href);
  assert.deepEqual((await runConsistencyChecks(root)).errors, [], "valid family source is accepted");
  for (const corruptSource of [
    Buffer.alloc(Buffer.byteLength(validSource)),
    Buffer.concat([Buffer.from(validSource), Buffer.from([0])]),
  ]) {
    writeFileSync(join(root, sourcePath), corruptSource);
    const result = await runConsistencyChecks(root);
    assert.equal(result.errors.length, 1, "NUL corruption fails preflight");
    assert.ok(result.errors[0].includes(sourcePath), "error identifies the affected implementation");
  }
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
