/* Wave-18 layout merge: regenerate RUNTIME_INPUTS_LAYOUT + EVENTS_LAYOUT in
   game-update-model.mjs from the v10 mapping + curated additions, and
   regenerate the pin tests. Run from repo root. */
import { readFileSync, writeFileSync } from "node:fs";
import { RUNTIME_INPUTS_LAYOUT as OLD_RI, EVENTS_LAYOUT as OLD_EV } from "./game-update-model.mjs";

const layout = JSON.parse(readFileSync("output/decomp/5129df723e64/section-notes/wave18-merge/layout.json", "utf8"));
const map = JSON.parse(readFileSync("/tmp/wave18-map.json", "utf8"));

const rowsByName = new Map(layout.runtimeInputs.map((r) => [r.name, r]));
const evRowsByName = new Map(layout.events.map((r) => [r.name, r]));
const sizeOf = (r) => ({ u8: 1, u16: 2, u32: 4, i32: 4, f32: 4 }[r.type] || 4);

/* ---- build the runtime-inputs entry list: model key -> {offset, type} ----
   Order preserved from the model layout; additions appended at the end. */
const riEntries = []; // {key, offset, type, size?}
for (const m of map.ri.matched) {
  if (m.key === "b2PoolCounts") continue; // expanded per element below
  const row = rowsByName.get(m.rowName);
  let type, size;
  if (m.modelType && m.modelType.startsWith("bytes")) {
    type = "bytes";
    size = parseInt(m.modelType.match(/\((\d+)\)/)[1], 10);
  } else {
    type = row.type;
  }
  riEntries.push({ key: m.key, offset: m.cppOffset, type, size });
}

/* b2PoolCounts -> per-element u16 lanes */
for (let i = 0; i < 31; i += 1) {
  const row = rowsByName.get(`b2_pool_counts_${i}`);
  riEntries.push({ key: `b2PoolCounts${i}`, offset: row.offset, type: "u16" });
}

/* Consumer-mandated additions: R4 equal-flags capture (verifier seeds the
   array + law guards; cpp rows add0_equal_flags_ready + 64 u8 flags). */
riEntries.push({ key: "frameOpaque4212c0Add0EqualFlagsReady", offset: rowsByName.get("frame_opaque_4212c0_add0_equal_flags_ready").offset, type: "u32" });
for (let i = 0; i < 64; i += 1) {
  const row = rowsByName.get(`frame_opaque_4212c0_add0_equal_flags_${i}`);
  riEntries.push({ key: `frameOpaque4212c0Add0EqualFlags${i}`, offset: row.offset, type: "u8" });
}

/* Consumer-mandated additions: SFX-STOP fold per-voice capture (whitelist
   seeds foldReady/voiceCount/voices; cpp rows sfx_stop_fold_ready +
   voice_count + voices[i].{channel_null,pending_09,probe_first,probe_second,
   channel_null_reload,voices_reloaded}). */
const VOICE_FIELDS = ["channel_null", "pending_09", "probe_first", "probe_second", "channel_null_reload", "voices_reloaded"];
riEntries.push({ key: "sfxStopFoldReady", offset: rowsByName.get("sfx_stop_fold_ready").offset, type: "u32" });
riEntries.push({ key: "sfxStopVoiceCount", offset: rowsByName.get("sfx_stop_voice_count").offset, type: "u32" });
for (let i = 0; i < 32; i += 1) {
  for (const f of VOICE_FIELDS) {
    const row = rowsByName.get(`sfx_stop_voices_${i}.${f}`);
    const keyName = `sfxStopVoice${i}${f.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}`;
    riEntries.push({ key: keyName, offset: row.offset, type: row.type });
  }
}

/* ---- events entries: model keys at cpp offsets + 30 law-emitted adds ---- */
const evEntries = [];
for (const m of map.ev.matched) {
  const row = evRowsByName.get(m.rowName);
  evEntries.push({ key: m.key, offset: m.cppOffset, type: row.type });
}
/* the 30 cpp event rows the model laws emit by camelCase name */
const EV_ADD = [
  ["frame_opaque_98dba0_956110_probe_pure", "frameOpaque98dba0956110ProbePure"],
  ["player_manager_update_death_arg_prep", "playerManagerUpdateDeathArgPrep"],
  ["opaque_0092f1c0_case", "opaque0092f1c0Case"],
  ["opaque_0092f1c0_host_leaf", "opaque0092f1c0HostLeaf"],
  ["frame_opaque_4212c0_409030_advance", "frameOpaque4212c0409030Advance"],
  ["frame_opaque_4212c0_409030_rewind", "frameOpaque4212c0409030Rewind"],
  ["sfx_stop_fold_applied", "sfxStopFoldApplied"],
  ["sfx_stop_fold_stop_calls", "sfxStopFoldStopCalls"],
  ["sfx_stop_fold_stores", "sfxStopFoldStores"],
  ["sfx_stop_fold_pending_mask", "sfxStopFoldPendingMask"],
  ["b15_rain_pure_steps", "b15RainPureSteps"],
  ["b15_rain_host_search", "b15RainHostSearch"],
  ["b15_rain_host_create", "b15RainHostCreate"],
  ["b15_rain_host_bind", "b15RainHostBind"],
  ["b15_rain_host_swap", "b15RainHostSwap"],
  ["b15_rain_genrand_draws", "b15RainGenrandDraws"],
  ["player_manager_update_heartbeat_sfx_play_no_samples", "playerManagerUpdateHeartbeatSfxPlayNoSamples"],
  ["player_manager_update_heartbeat_sfx_play_preload", "playerManagerUpdateHeartbeatSfxPlayPreload"],
  ["player_manager_update_heartbeat_sfx_play_device", "playerManagerUpdateHeartbeatSfxPlayDevice"],
  ["opaque_008318a0_mode3_advance_pure", "opaque008318a0Mode3AdvancePure"],
  ["opaque_008318a0_mode4_sfx_gate_open", "opaque008318a0Mode4SfxGateOpen"],
  ["tcs_stats_growth_calls", "tcsStatsGrowthCalls"],
  ["tcs_stats_append_count", "tcsStatsAppendCount"],
  ["tcs_stats_record_dword", "tcsStatsRecordDword"],
  ["tcs_stats_record_byte", "tcsStatsRecordByte"],
  ["tcs_stats_record_float", "tcsStatsRecordFloat"],
  ["tcs_stats_tail_add", "tcsStatsTailAdd"],
  ["room_trigger_clear_audio_music", "roomTriggerClearAudioMusic"],
  ["room_trigger_clear_audio_flag_store", "roomTriggerClearAudioFlagStore"],
  ["room_trigger_clear_audio_sfx", "roomTriggerClearAudioSfx"],
];
for (const [cppName, keyName] of EV_ADD) {
  const row = evRowsByName.get(cppName);
  evEntries.push({ key: keyName, offset: row.offset, type: row.type });
}

/* ---- validation (separate buffers for RI and events) ---- */
const checkAll = (entries, sizeCap, label) => {
  const occupied = new Map();
  for (const e of entries) {
    const s = e.type === "bytes" ? e.size : sz[e.type];
    for (let o = e.offset; o < e.offset + s; o += 1) {
      if (occupied.has(o)) throw new Error(`${label} offset collision at ${o}: ${e.key} vs ${occupied.get(o)}`);
      occupied.set(o, e.key);
    }
    if (e.offset + s > sizeCap) throw new Error(`${label} key ${e.key} exceeds size ${sizeCap} at ${e.offset + s}`);
  }
};
const sz = { u8: 1, u16: 2, u32: 4, i32: 4, f32: 4 };
checkAll(riEntries, layout.sizes.runtimeInputs, "RI");
checkAll(evEntries, layout.sizes.events, "EV");
const riKeys = new Set(riEntries.map((e) => e.key));
const evKeys = new Set(evEntries.map((e) => e.key));
console.log(`RI entries ${riEntries.length} (old ${Object.keys(OLD_RI).length}); EV entries ${evEntries.length} (old ${Object.keys(OLD_EV).length})`);

/* ---- emit model layout source ---- */
function fmtField(e) {
  if (e.type === "bytes") return `Object.freeze({ offset: ${e.offset}, type: "bytes", size: ${e.size} })`;
  return `Object.freeze({ offset: ${e.offset}, type: "${e.type}" })`;
}
function emitLayout(entries, headerComment) {
  const lines = [];
  for (const e of entries) lines.push(`  ${e.key}: ${fmtField(e)},`);
  return `export const ${headerComment}\n  ${lines.join("\n  ")}\n});`;
}

const modelSrc = readFileSync("scripts/decomp/game-update-model.mjs", "utf8");
const RI_RE = /export const RUNTIME_INPUTS_LAYOUT = Object\.freeze\(\{[\s\S]*?\n\}\);/;
const EV_RE = /export const EVENTS_LAYOUT = Object\.freeze\(\{[\s\S]*?\n\}\);/;
const newRI = emitLayout(riEntries, "RUNTIME_INPUTS_LAYOUT = Object.freeze({");
const newEV = emitLayout(evEntries, "EVENTS_LAYOUT = Object.freeze({");
if (!RI_RE.test(modelSrc) || !EV_RE.test(modelSrc)) throw new Error("layout block markers not found");
const outModel = modelSrc.replace(RI_RE, newRI).replace(EV_RE, newEV);
writeFileSync("scripts/decomp/game-update-model.mjs", outModel, "utf8");
console.log("patched game-update-model.mjs");

/* ---- emit pin-test literals ---- */
writeFileSync("/tmp/wave18-ri-entries.json", JSON.stringify(riEntries, null, 1), "utf8");
writeFileSync("/tmp/wave18-ev-entries.json", JSON.stringify(evEntries, null, 1), "utf8");
writeFileSync("/tmp/wave18-ri-keys.json", JSON.stringify([...riKeys]), "utf8");
writeFileSync("/tmp/wave18-ev-keys.json", JSON.stringify([...evKeys]), "utf8");
console.log("wrote /tmp/wave18-{ri,ev}-entries.json + keys");