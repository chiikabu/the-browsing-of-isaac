/* Wave-18 layout merge audit v5: full pipeline — name pass, digit pass,
   offset pass, residual report. Emits /tmp/wave18-map.json. */
import { readFileSync, writeFileSync } from "node:fs";
import { RUNTIME_INPUTS_LAYOUT, EVENTS_LAYOUT } from "./game-update-model.mjs";

const layout = JSON.parse(readFileSync("output/decomp/5129df723e64/section-notes/wave18-merge/layout.json", "utf8"));

const SING = {
  slots: "slot", voices: "voice", nodes: "node", cells: "cell", bodies: "body",
  stages: "stage", players: "player", entries: "entry", flags: "flag",
  costs: "cost", trails: "trail", timers: "timer", packs: "pack", lists: "list",
  stores: "store", calls: "call", groups: "group", children: "child", ends: "end",
};
function singularize(t) {
  /* strip trailing digits first so flags44 -> flag44 -> flag letters */
  const m = t.match(/^(.*?)(\d+)$/);
  const word = m ? m[1] : t;
  const tail = m ? m[2] : "";
  let base = word;
  if (SING[base]) base = SING[base];
  else if (base.endsWith("ies") && base.length > 4) base = base.slice(0, -3) + "y";
  else if (base.endsWith("ses") && base.length > 4) base = base.slice(0, -2);
  else if (base.endsWith("s") && !base.endsWith("ss") && !base.endsWith("us") && base.length > 3) base = base.slice(0, -1);
  return base + tail;
}
function camelTokens(s) {
  const words = [];
  let cur = "";
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    const prev = i > 0 ? s[i - 1] : "";
    if (/[A-Z]/.test(c) && (i === 0 || /[a-z0-9]/.test(prev))) {
      if (cur) words.push(cur);
      cur = c.toLowerCase();
    } else if (/[A-Z]/.test(c)) {
      cur += c.toLowerCase();
    } else {
      cur += c;
    }
  }
  if (cur) words.push(cur);
  return words.flatMap((w) => w.split("_")).filter(Boolean);
}
function cppTokens(s) {
  return s.replace(/\./g, "_").split("_").filter(Boolean);
}
/* uppercase-only camel->snake: skip997a -> skip997a (no digit splits) */
function camelToSnakeUp(name) {
  let out = "";
  for (let i = 0; i < name.length; i += 1) {
    const c = name[i];
    const prev = i > 0 ? name[i - 1] : "";
    if (/[A-Z]/.test(c) && /[a-z0-9]/.test(prev)) out += "_";
    out += c.toLowerCase();
  }
  return out;
}
/* camel->snake with digit-run splits: skip997a -> skip_997a */
function camelToSnakeDigit(name) {
  const up = camelToSnakeUp(name);
  return up.replace(/([a-z])(\d+)/g, "$1_$2");
}
function cfg(toks) {
  const lettersFull = toks.map(singularize).map((t) => t.replace(/[^a-z]/g, "")).filter((t) => t.length).join("");
  const lettersNoHex = toks.map(singularize)
    .filter((t) => !/^\d/.test(t) || !/[a-z]/.test(t)) /* drop hex-ish tokens (start digit + letters) */
    .map((t) => t.replace(/[^a-z]/g, "")).filter((t) => t.length).join("");
  const digits = [];
  for (const t of toks) for (const m of t.matchAll(/(\d+)/g)) digits.push(parseInt(m[1], 10));
  return { letters: lettersFull, lettersNoHex, digits: digits.join(",") };
}
const sizeOf = (r) => ({ u8: 1, u16: 2, u32: 4, i32: 4, f32: 4 }[r.type] || 4);

function buildIndex(cppRows) {
  const index = { full: new Map(), nohex: new Map() };
  for (const r of cppRows) {
    const c = { cfg: cfg(cppTokens(r.name)) };
    for (const variant of ["full", "nohex"]) {
      const key = variant === "full" ? c.cfg.letters : c.cfg.lettersNoHex;
      if (!index[variant].has(key)) index[variant].set(key, []);
      index[variant].get(key).push({ row: r, c });
    }
  }
  return index;
}

function mapLayout(modelLayout, cppRows, label) {
  const index = buildIndex(cppRows);
  const taken = new Set();
  const matched = [];
  const ambiguous = [];
  const unmatched = [];

  const candidateFor = (key, f, allowOffset) => {
    const cc = cfg(camelTokens(key));
    // bytes blob: prefix-based run search first (struct-array rows have
    // subfield tokens the model key omits, so skeleton matching fails)
    if (f.type === "bytes") {
      const prefixes = [camelToSnakeUp(key), camelToSnakeDigit(key)];
      const famOkFor = (name, prefix) => name === prefix || name.startsWith(prefix + "_");
      for (const prefix of prefixes) {
        const famRows = cppRows.filter((r) => !taken.has(r.name) && famOkFor(r.name, prefix));
        if (!famRows.length) continue;
        for (const first of famRows) {
          const start = first.offset;
          const run = cppRows.filter((r) => !taken.has(r.name) && r.offset >= start && r.offset < start + f.size);
          if (!run.length) continue;
          const sizeOk = run.reduce((a, r) => a + (sizeOf(r) || 0), 0) === f.size;
          const famOk = run.every((r) => famOkFor(r.name, prefix));
          if (famOk && sizeOk) {
            return { cc, cands: [], chosen: { row: run[0], c: { cfg: cfg(cppTokens(run[0].name)) } }, runLen: run.length };
          }
        }
      }
      return { cc, cands: [] };
    }
    // try full skeleton, then no-hex skeleton
    let cands = [];
    for (const variant of ["full", "nohex"]) {
      const k = variant === "full" ? cc.letters : cc.lettersNoHex;
      if (k) {
        cands = (index[variant].get(k) || []).filter((x) => !taken.has(x.row.name));
        if (cands.length) break;
      }
    }
    if (!cands.length) return { cc, cands };
    if (cands.length === 1) return { cc, cands, chosen: cands[0] };
    // digit-seq disambiguation
    if (cc.digits) {
      const byD = cands.filter((x) => x.c.cfg.digits === cc.digits);
      if (byD.length === 1) return { cc, cands, chosen: byD[0] };
    }
    // offset pass: exact offset match
    if (allowOffset) {
      const byOff = cands.filter((x) => x.row.offset === f.offset);
      if (byOff.length === 1) return { cc, cands, chosen: byOff[0] };
    }
    return { cc, cands };
  };

  for (const [key, f] of Object.entries(modelLayout)) {
    const r = candidateFor(key, f, false);
    if (!r.chosen) {
      ambiguous.push({ key, offset: f.offset, type: f.type, modelType: f.type === "bytes" ? `bytes(${f.size})` : f.type, letters: r.cc.letters, lettersNoHex: r.cc.lettersNoHex, cands: r.cands.map((x) => `${x.row.offset}:${x.row.name}`) });
      continue;
    }
    taken.add(r.chosen.row.name);
    matched.push({
      key, modelOffset: f.offset, cppOffset: r.chosen.row.offset, rowName: r.chosen.row.name,
      cppType: r.chosen.row.type,
      modelType: f.type === "bytes" ? `bytes(${f.size})` : f.type,
    });
  }
  // offset pass for leftovers
  const leftovers = [...ambiguous];
  ambiguous.length = 0;
  for (const u of leftovers) {
    let cands = [];
    for (const variant of ["full", "nohex"]) {
      const k = variant === "full" ? u.letters : (u.lettersNoHex || "");
      if (k) {
        cands = (index[variant].get(k) || []).filter((x) => !taken.has(x.row.name));
        if (cands.length) break;
      }
    }
    const byOff = cands.filter((x) => x.row.offset === u.offset);
    if (byOff.length === 1) {
      taken.add(byOff[0].row.name);
      matched.push({ key: u.key, modelOffset: u.offset, cppOffset: u.offset, rowName: byOff[0].row.name, cppType: byOff[0].row.type, modelType: u.modelType || u.type });
    } else if (cands.length === 1) {
      taken.add(cands[0].row.name);
      matched.push({ key: u.key, modelOffset: u.offset, cppOffset: cands[0].row.offset, rowName: cands[0].row.name, cppType: cands[0].row.type, modelType: u.modelType || u.type });
    } else {
      // direct offset scan (no letter constraint): only accept when the row
      // at the exact offset shares a PREFIX letter run with the model key
      const exact = cppRows.filter((r) => !taken.has(r.name) && r.offset === u.offset);
      const cc = cfg(camelTokens(u.key));
      const hit = exact.find((r) => {
        const rc = cfg(cppTokens(r.name));
        const len = Math.min(cc.letters.length, rc.letters.length);
        let same = 0;
        for (let i = 0; i < len; i += 1) if (cc.letters[i] === rc.letters[i]) same += 1;
        return len > 3 && same / len > 0.66;
      });
      if (hit) {
        taken.add(hit.name);
        matched.push({ key: u.key, modelOffset: u.offset, cppOffset: u.offset, rowName: hit.name, cppType: hit.type, modelType: u.modelType || u.type });
      } else {
        ambiguous.push(u);
      }
    }
  }
  // byte blob leftovers: try contiguous runs at the model offset
  const blobLeftovers = ambiguous.filter((u) => String(u.type).startsWith("bytes"));
  for (const u of blobLeftovers) {
    const start = u.offset;
    const msize = String(u.modelType || u.type).match(/\((\d+)\)/);
    if (!msize) continue;
    const run = cppRows.filter((r) => !taken.has(r.name) && r.offset >= start && r.offset < start + parseInt(msize[1], 10));
    if (run.length && run.every((r) => cfg(cppTokens(r.name)).letters === u.letters)) {
      taken.add(run[0].name);
      matched.push({ key: u.key, modelOffset: u.offset, cppOffset: start, rowName: run[0].name, cppType: run[0].type, modelType: u.type });
      ambiguous.splice(ambiguous.indexOf(u), 1);
    }
  }

  console.log(`\n==== ${label}: ${matched.length} matched | ${ambiguous.length} ambiguous`);
  const diffRows = matched.filter((m) => m.modelOffset !== m.cppOffset);
  const diffs = new Map();
  for (const m of diffRows) {
    const d = m.modelOffset - m.cppOffset;
    if (!diffs.has(d)) diffs.set(d, []);
    diffs.get(d).push(m);
  }
  console.log(`-- offset diffs (model-cpp), ${diffRows.length} keys, ${diffs.size} distinct:`);
  for (const [d, ms] of [...diffs.entries()].sort((a, b) => a[0] - b[0])) {
    const sample = ms.slice(0, 4).map((m) => `${m.key} (${m.modelOffset}->${m.cppOffset})`).join(", ");
    console.log(`  diff ${d} (${ms.length}): ${sample}${ms.length > 4 ? ", ..." : ""}`);
  }
  if (ambiguous.length) {
    console.log(`-- AMBIGUOUS (${ambiguous.length}):`);
    for (const u of ambiguous) console.log(`  ${u.key} @${u.offset} ${u.type} (letters=${u.letters}) <- ${u.cands.join(" | ")}`);
  }
  const covered = new Set();
  for (const m of matched) {
    if (m.modelType.startsWith("bytes")) {
      const size = parseInt(m.modelType.match(/\((\d+)\)/)[1], 10);
      for (const r of cppRows) if (r.offset >= m.cppOffset && r.offset < m.cppOffset + size) covered.add(r.name);
    } else covered.add(m.rowName);
  }
  const uncovered = cppRows.filter((r) => !covered.has(r.name));
  console.log(`-- cpp rows uncovered (${uncovered.length}):`);
  for (const r of uncovered) console.log(`  ${r.offset}\t${r.name}\t${r.type}`);
  return { matched, ambiguous, uncovered };
}

const ri = mapLayout(RUNTIME_INPUTS_LAYOUT, layout.runtimeInputs, "RUNTIME_INPUTS_LAYOUT");
const ev = mapLayout(EVENTS_LAYOUT, layout.events, "EVENTS_LAYOUT");
writeFileSync("/tmp/wave18-map.json", JSON.stringify({ ri, ev }, null, 1), "utf8");
console.log("\nwrote /tmp/wave18-map.json");