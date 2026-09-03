// Incremental lifted rebuilds (recomp round 14g). A lifter change used to cost
// a full recompile of every lifted TU (~17 min) because the tree was split by
// cumulative emitted bytes and one longer function moved every later
// boundary. Two parts keep that from happening again: the emitter's
// --split-va puts a function in a TU named by its ADDRESS bucket, and
// build_boot.py recompiles a TU only when the sha256 of its patched text
// differs from the one recorded beside its object.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');

test('emit.py: --split-va names a TU by its address bucket', () => {
  const src = readFileSync(join(lift, 'emit.py'), 'utf8');
  assert.ok(src.includes('"--split-va"'), 'the option exists');
  assert.ok(/buckets\.setdefault\(\(va - text_lo\) \/\/ args\.split_va, \[\]\)\.append\(va\)/.test(src),
    'bucket = (va - text_lo) // N');
  assert.ok(/chunk_names\.append\("%s_%03d\.c" % \(args\.module, b\)\)/.test(src),
    'the file name carries the bucket index, not the running chunk index');
});

test('build_boot.py: a lifted TU recompiles only when its text hash changed', () => {
  const src = readFileSync(join(lift, 'build_boot.py'), 'utf8');
  assert.ok(src.includes('hashlib.sha256(path.read_bytes()).hexdigest()'), 'sha256 of the patched TU text');
  assert.ok(/sha_file = lift_dir \/ \(src\.stem \+ lift_obj_suffix \+ "\.sha"\)/.test(src), 'the hash lives beside the object, per profile suffix');
  assert.ok(/elif sha_file\.exists\(\) and sha_file\.read_text\(\)\.strip\(\) == sha:\s*\n\s*lifted_objs\.append\(obj\)/.test(src),
    'an unchanged TU keeps its object');
  assert.ok(/lifted_objs\.append\(Path\(info\["obj"\]\)\)\s*\n\s*sha, sha_file = lifted_sha\[Path\(info\["src"\]\)\]\s*\n\s*sha_file\.write_text\(sha\)/.test(src),
    'a successful compile records the hash');
  assert.ok(src.includes('if args.recompile_lifted or not obj.exists():'), '--recompile-lifted still forces everything');
});

test('the documented boot lift uses the stable split', () => {
  const doc = readFileSync(join(root, 'docs', 'recomp-architecture.md'), 'utf8');
  const m = doc.match(/python scripts\/recomp\/lift\/emit\.py --exe tools\/isaac-ng\.unpacked\.exe[^\n]*--va-file[^\n]*/);
  assert.ok(m, 'the lift command is documented');
  assert.ok(m[0].includes('--split-va'), 'the documented argv carries --split-va');
  assert.ok(!m[0].includes('--split-bytes'), 'the byte split is no longer the documented default');
});
