#include "pgd_pure_helpers.h"

#include <stddef.h>

/* PersistentGameData save-state pure helpers — ABI v35. Chronology:
   v35 (this unit) lands PGDCON (ABI 34 -> 35, atomic both sides) —
   the out-of-cluster consumer census over the five v1-"unidentified"
   arrays (section-notes/pgd-v35/): whole-.text displacement census
   (raw bases + Manager-folded +0x14 forms), pointer-provenance
   verification per hit, and the landed laws PGDSEC3CON (Update-loop
   sec3 increment + threshold/index TryUnlock rows, incl. the pinned
   readonly-does-not-gate-index-unlocks defect), PGDSEC8INC (the sec8
   increment mutator 0x00958e60: bound 0x1a re-proves COUNT_SEC8 from
   consumer code; id != 1 aggregate ++sec8[2]; 3 call sites) with its
   two SIGNED >0 gates, and PGDSEC10COL (two inlined collect clones of
   the PGDADSED law + one clear-only site; SaveLocally always runs).
   Census NEGATIVE for SEC5/SEC9. No renames — no new exact-ZHL
   accessor, all five fields stay LAYOUT_ONLY.
   v34 lands PGDCPY (ABI 33 -> 34, atomic both sides) —
   the COPY-ASSIGN 0x00929010 machine — two
   guarded std::string assigns (+8/+0x20; self-assign skip; SSO vs
   heap data select on cap >= 0x10 UNSIGNED; size dword at +0x10;
   callee 0x40ccd0), a 33-row plan — 26 bulk rows spanning
   +0x38..+0xf64 with THREE stale gaps (+0x2ba..+0x2bc,
   +0xdc5..+0xdc8, +0xe9d..+0xea0 — the machine leaves these bytes
   uncopied), the deferred rep count `mov ecx,0x1a` @0x0092908e
   feeding the +0xe07 bosses row four instructions later, four vector
   member copies through 0x92cb30 (+0xf64 stride 8), and the tail
   dwords +0xf84/+0xf88 + byte +0xf8c — plus [0] dirty NOT copied and
   [4] handle CLEARED to 0 @0x00929225. The landed import-restore
   coverage laws (v5/v6) are the SUBSET view of this reference full
   plan. Inbound 2: copy-ctor 0x9261a0 @0x92621a, global-PGD
   snapshotter 0x90c0e0 @0x90c258 (src = [0xc7169c]+0x14). No uint8_t
   scalar params.
   v33 (ABI 32 -> 33) lands the TryUnlock-adjacent decision islands
   0x9299e0 / 0x929aa0 / 0x92a2d0 (section-notes/pgd-v33-islands/):
   PGDRO = SetReadOnly (ret 4 @0x929a0f, body 0x33, inbound 4; the
   low-byte cmove string choice "True"/"False" + the this[1] readonly
   store — the family's only writer of the +1 gate byte; log 0xa112c0
   host), PGDUNL = Unlocked (EXACT ZHL 9B, ret 4 @0x929af0, body 0x53,
   inbound 32, ZERO calls; the v1 isaac_pgd_unlocked law re-verified
   byte-exact — sentinel -2 first, signed neg -> true, UNSIGNED window
   0..0x281, id0 before the ach byte, mode dword [0xc7169c]+8 == 2,
   Game* [0xc71678] null gate, +0x26630 UNSIGNED > 0, +0x26589 byte;
   the game globals host) and PGDADDIT = AddToCollection (EXACT ZHL
   15B, ret 4 @0x92a34c, body 0x7e, inbound 6; readonly entry +
   UNSIGNED window 0..0x2dc + id0 skip + owned skip -> items[0xae8]=1
   + dirty + the 0x92a350 count machine @0x92a2ff, then the
   PGDGATE-A/B duplicate rows without the inline byte1 re-check:
   b5c/b27/c4c -> 0x17d @0x92a326, c39/bd0 -> 0x16b @0x92a344;
   0x92a350 + TryUnlock 0x929a20 host). No uint8_t scalar params.
   v32 lands PGDSAN + PGDGATE + PGDCNT (ABI 31 -> 32,
   atomic both sides) — the post-load helpers 0x927d20 / 0x929820 /
   0x92a350 (section-notes/pgd-v32-postload/): the version/counter
   gated min-1 clamp sanitizer (PURE — zero calls), the 11-row
   achievement-unlock gate machine (byte gates & 0xff; the
   0x10624dd3 %1000-runs law; the 0x2a378 event-counter guard) and
   the item-flag + achievement count/threshold unlock machine (the
   0x15a cmova cap; the 6 special ids; the 9 badge ids; T1..T6
   signed thresholds; ids 0x45/0x54/0xeb/0x153/0x27d); the actions
   (TryUnlock 0x929a20, the IEC(0,0) call, the item-map find
   0x72fd10) stay typed-host. No uint8_t scalar params.
   v31 lands PGDVRF (ABI 30 -> 31, atomic both
   sides) — the save verifier 0x926f10 verify-open laws
   (section-notes/pgd-v31-verifier/): the 4-magic FULL-DWORD
   kind-selection cascade (four dword compares = the full 16 header
   bytes; the magics differ at byte 12, the kind digit — dword 3
   discriminates; a 12-byte compare would collapse every header to
   kind 6), the verify-then-compare fold-region composite (kind
   FIRST, region fold [0x10, size-4) via 0x683580 @0x927017, then
   the trailing dword @ size-4 compared FULL-u32 — the
   trailing-dword compare law), the kind > 8 acceptance gate
   (`cmp ebx,8 ; ja` @0x92705f, verbatim "[warn] Unsuported save
   version" fail for kinds 6/7/8), the bound stores (kind 6/7/8/9
   -> 9/0xa/0xa/0xb) and the verifier pins (SEH handler 0xb0a991,
   cookie 0xbf93b4, ret 4, inbound 5). The record-restore loop
   behind it (jump table 0x927cd8) stays typed-host stream IO. No
   uint8_t anywhere in the new surface.
   v30 lands PGDCK + PGDWRI (ABI 29 -> 30, atomic both
   sides) — the checksum leaf 0x683410 deep-dive + the writer
   0x9282e0 record-count laws (section-notes/pgd-v30-checksum/).
   PGDCK: 0x683410 checksum_update pins (ret 8 @0x683578, body
   0x168; mode 0 buffered ror-add lane; mode 1 reflected table CRC —
   the sar-rounds generator re-derived table[1] = 0x09073096; the
   runtime latch [0xc7e864] guards the 0xc7e860 table so the
   GENERATOR is the law; mode >= 2 identity; inbound 1026) +
   0x683580 checksum_region wrapper pins (SEH handler 0xaf3860,
   cookie 0xbf93b4, vtbl +0x4 tell / +0xc seek / +0x14 read,
   0xa648b0 IO @0x6835ce, update call @0x683606; inbound 5; the PGD
   verifier 0x926f10 calls it @0x927017 with push 0x10 / push 4 ->
   skip_front 0x10 / skip_back 4 CONFIRMED, then compares the
   trailing dword) + the region-length u32-wrap law
   isaac_pgd_checksum_region_len. PGDWRI: the writer's literal
   record plan — 10 fixed sections (bound = count dword, stride =
   elem width, base = field offset), the R11 sub-block plan, the
   61-site checksum-call table {va, role, len} (v29 "60x" corrected:
   the pre-record this+0xf84 hash @0x928336 was missed), the
   save-counter inc law. Stream IO (63x vtbl+0x1c, 4x 0x414a80, 1x
   0xaf05e5, 1 this-store) stays typed-host; the writer as a whole
   stays IRREDUCIBLE with the corrected census (61/4/63/1/1).
   v29 (this unit) lands PGDISP (ABI 28 -> 29, atomic both sides) —
   the remaining-host finalization (section-notes/pgd-v29-final/).
   PGDISP = the 0x00929660 save DISPATCHER decision laws (92 bytes,
   ret 4 @0x9296bc + path-A ret 4 @0x9296af; 2 inbound call sites —
   CORRECTED tooling 0x91a398 + 0x94c91e, the v28 record's "1"
   missed 0x94c91e via the buggy lea-4 census tool; 3 direct E8 to
   typed-host callees 0x9292c0 @0x92967e / 0x928ee0 @0x9296a7 /
   0x9294f0 @0x9296b4; 1 indirect import slot *0xb18a1c @0x92968e
   (host probe, arg 0xc5c3a4); 1 this-store this[0] = 0 @0x929679).
   Laws: proceed = this[0] & this[0xf8c] BYTE gates both nonzero
   (`cmpb $0` @0x929667/@0x92966c — silent early return else);
   storeClearFires = proceed (movb unconditional after both gates);
   stampCallFires = proceed && arg1 BYTE nonzero (`cmpb $0,0x8(%ebp)`
   @0x929675 -> 0x9292c0); cloudSelected = probe result FULL DWORD
   nonzero (`cmpl $0,(%eax)` @0x929697) AND g[0x2a3a4] BYTE nonzero
   (`cmpb $0` @0x92969c) -> 0x928ee0 @0x9296a7 else 0x9294f0
   @0x9296b4. Kinship: the importer inline 0x92b780..0x92b7d2 (v25o
   isaac_pgd_import_save_select) is this dispatcher minus the arg
   gate. The dispatcher was the LAST un-landed PURE island;
   0x9293d0 file-save helper (6 E8 / 7 indirect / 2 this-stores)
   and 0x9282e0 write_stream root (65 E8 / 63 indirect / 1
   this-store) delivered as IRREDUCIBLE evidence; importer/reader
   residuals verified typed-host leaf sets; save-fn inbound
   corrected 17/13/22.
   v28 (this unit) lands PGDULD + the PGDHOST law pins (ABI 27 ->
   28, atomic both sides) — the save-cluster final host-leaf
   assessment (section-notes/pgd-v28-hostleaf/). PGDULD = the
   0x009296c0 tier-ladder decision island (200 bytes, ret @0x929788;
   6 inbound call sites; 1 E8 to typed-host TryUnlock 0x929a20
   @0x929773; 0 indirects; ZERO stores to this/.data — all stores
   stack-local). count law @0x9296eb: x = u32(end - start);
   t = signed-high32(x * 0x63e7063f) SAR 6; count = t - (t >= 0 ?
   1 : 0) — the raw multiply form (magic = ceil(2^38/164),
   2^38 = 164*M - 92; NOT /164 — exact multiples of 164 land one
   below; the multiply-high +1 flip would need x >= 2^38/92 with
   x mod 164 == 163, all >= 2^31 where the signed path applies, so
   the C++ int64/32 implementation is byte-exact for every u32
   wrap).
   k = min_u32(tier, count) (`cmovb` UNSIGNED @0x929709 — a wrapped
   negative count selects the tier); inner bound = u32((countWord -
   ptr) >> 2 SAR) (`cmp ebx,ecx ; jae` @0x929721); flag = `cmp byte
   [entry+0x38],dl ; cmovne` AND over BYTE flags (reset 1 per tier
   @0x9296d8); ladder id = u32[0xb7b0b0 + 4*tier] (.rdata const,
   46 slots; tier 45 = 0x204; slot 46 = 0x706d6173 "samp" — the
   NEXT const); fire = flag && tier <= 0x2d && id != 0 ->
   TryUnlock call pin 0x929773. 0x928ee0/0x9292c0/0x9294f0 are
   IRREDUCIBLE (evidence in the notes; inbound 15/12/19, stores and
   indirects censused). PGDHOST pins: cookie 0xaef12b VERIFIED PURE
   8-byte stub (`cmp ecx,[0xbf93b4] ; jne 0xaef134 ; ret ; jmp
   0xaef775`) — host-TYPED, law pinned; checksum 0x683580 NOT pure
   (SEH + vtbl stream calls + 1 E8) — skip_front 0x10, skip_back 4,
   non-standard table[1] 0x09073096, seed 0xfedcba76.
   v27 (this unit) lands PGDIEC (ABI 26 -> 27, atomic both sides) —
   the IncreaseEventCounter 0x00929b40 threshold cascade (EXACT ZHL,
   21 pattern bytes, `__thiscall void IncreaseEventCounter(int
   eEventCounters, int num)`; ret 8 @0x92a2c8; 74 inbound callers;
   the last un-landed achievement helper — v1's "cascade stays host"
   verdict superseded by the v20/v21/v22 standard: gate laws pure,
   TryUnlock typed-host). Readonly LOW-BYTE gate `cmp byte [esi+1],0
   ; jne` @0x929b5e (nonzero -> skip counter update, dirty store AND
   the whole cascade); SIGNED saturating counter store @0x929b68..
   0x929b7d (the landed event_counter_next law, byte-identical:
   `mov edi,[esi+ebx*4+0x2bc] / neg edx / lea ecx,[edi+eax] / xor
   eax,eax / cmp edx,edi / cmovle eax,ecx`) with the UNCHECKED slot
   offset law 0x2bc + 4*slot (ebx = arg1 never bounded); dirty store
   `mov byte [esi],1` @0x929b84 UNCONDITIONAL after the gate; then
   the 52-row direct threshold->unlock cascade @0x929b87..0x929ff8
   (54 TryUnlock call sites — rows 27/28 fire TWO unlock ids per
   gate). EVERY direct row is `cmp u32 dword, IMM ; jb` UNSIGNED
   (opcode 72) except: row 1 `test eax,eax ; je` NONZERO; row 16
   PAIR (`cmp [0x31c],0 ; jbe` + `cmp [0x320],0 ; jbe` — both
   nonzero); row 41 MODE (`cmp [0x5b4],0x1f ; jb` + `mov eax,
   [0xc7169c] ; cmp [eax+8],1 ; jne` — FULL DWORD mode == 1, host
   input). TryUnlock 0x929a20 stays typed-host (family standard);
   SEH cookie 0xaef12b HOST. The group walk 0x92a000..0x92a253
   (local vectors from 0xbab240/0xbab380/0xbab510/0xbab540/0xbab5e0/
   0xbab610/0xbab640/0xbab670 + group table 0xc35ed0 stride 0x90 —
   ALL .data 0xbf8000..0xc61e00, runtime-mutable) and the five
   derived tail gates @0x92a259..0x92a2b3 (ecx `cmp,3 ; jl` SIGNED ->
   0x15a; ecx 6 jl -> 0x15b; byte [ebp-0xc1] je -> 0x114; edi 0x11
   jb UNSIGNED -> 0x223; ebx 0x22 jb -> 0x27c; values come from the
   .data walk) are HOST, census-only.
   v26 (this unit) lands PGDREADER2 + PGDIVER — the SIBLING save
   reader 0x0041d670 (own 3-tag table / size gate / version reads /
   10-row dispatch + per-section rows / tails; ABI 25 -> 26 atomic
   both sides) and the import reader 0x009e4260's version gates
   (+0x4a0 row-gated read, +0x4a4 default store + section-gated
   read) + fail tail consts/return law.
   v25n (this unit) lands PGDTALLY — the stage-4 TALLY loops of the
   shared Rebirth-save snapshot reader 0x009e4260 (0x9e4618..0x9e4a8f:
   entered by fall-through after the PGDCLMP call @0x9e4613; runs
   UNCONDITIONALLY; success tail `mov al,1` 0x9e4a8f -> ret 0x9e4aa1
   with the cookie call 0xaef12b HOST; the fail tail 0x9e4aa2 is only
   reachable from the stage-1 tag mismatch). Collection walk
   0x9e4621..0x9e49fe: byte [esi+eax+0x268], eax 1..0x15a (`cmp
   eax,0x15b ; jl` SIGNED; index 0 never scanned); NONZERO byte ->
   ecx (set B), the alias table is SKIPPED; ZERO byte -> alias chain
   {0x114,0x14d,0x14e,0x14f,0x11b,0x14b} edi (set A) / {0x2b,0x3d,
   0xeb} ecx (set B). Exit `lea eax,[edi+ecx] ; cmp eax,0x15a ; jl`
   SIGNED (@0x9e4a04/@0x9e4a0c): (setA+setB) < 0x15a FINISHES
   (returns al=1; the settings walk never runs; no +0x7d/+0x8c
   stores). Settings walk 0x9e4a20..0x9e4a6c: byte [esi+eax+0x38],
   eax 1..0xb2 (`cmp eax,0xb3 ; jl` SIGNED); NONZERO -> ecx (set B);
   ZERO + {0x81..0x85,0x9c,0x52,0x54,0xaf} -> edx (set A); edi is
   NOT reset — still the COLLECTION set A. `cmp eax,0xb1 ; jl`
   SIGNED on (edx+ecx) gates byte [esi+0x7d]=1 @0x9e4a78; `cmp
   ecx,0xb1 ; jl` SIGNED on ecx + `test edi,edi` (>= 0xb1 AND
   collection set A == 0) gate byte [esi+0x8c]=1 @0x9e4a88. The 7+
   vtbl stream calls, logs 0xa112c0, cookie 0xaef12b, PGDCLMP
   0x9e4af0 and the +0x4a4 finish write stay HOST — the reader's
   leaf count is unchanged by this unit.
   v24 (this unit) lands PGDITAG + PGDIDISP — the PURE decision
   islands of the shared Rebirth-save snapshot reader 0x009e4260
   (the v8 "next measured candidate"; no exact ZHL; inbound from
   TryImportRebirthLocalSave 0x92b2e0 @0x92b574 with ecx = the
   0x4f0-byte snapshot; ret 0x9e4aa1, fail-tail ret 0x9e4ac7).
   PGDITAG = the version-tag comparison table: a 16-byte stream read
   (vtbl+0x14 @0x9e4282, HOST) into [ebp-0x14], then ten .rdata save
   headers compared as THREE FULL DWORDs (0xc bytes) each — 0xb805bc/
   0xb8060c (section 2, count 7), 0xb805a8/0xb805f8 (section 3,
   count 8), 0xb805e4/0xb80514 (section 4, count 8), 0xb805d0/
   0xb80500 (section 5, count 9), 0xb1b98c/0xb80560 (section 6,
   count 9); ALL TEN 12-byte bodies are currently "ISAACNGSAVE0"
   (dwords 0x41415349/0x53474e43/0x30455641) so row 0 always wins
   today; a full miss falls to the fail tail 0x9e4aa2 (cdecl log
   (1, 0xb80528 "RebirthPersistentGameData wrong file header
   (%.16s)", buffer) -> 0xa112c0 HOST, return 0). PGDIDISP = the
   section-record loop and the 9-row dispatch outcome: entry gate
   `test eax,eax ; js fail` + `cmp eax,ebx ; jge fail` on the
   PREVIOUS section value (SIGNED 0 <= prev < elemCount 7/8/9,
   0x9e448a/0x9e4492); record reads (HOST); count gate `cmp
   [ebp-0x20],0 ; jbe next` (UNSIGNED zero-only, 0x9e44bf/0x9e44c3);
   dispatch gate `dec eax ; cmp eax,8 ; ja next` (UNSIGNED
   (section-1) <= 8 -> 0..8, 0x9e44cc..0x9e44d0) through the 9-entry
   jump table 0x9e4ac8; each handler reads a record count (HOST),
   logs a mismatch (HOST 0xa112c0), clamps UNSIGNED `cmova` to its
   builtin MAX (0xb3/0x5f/0xc/0x15b/7/0x39/0x15/0x14/1), then loops
   with TWO UNSIGNED bounds — `cmp edi,[ebp-0x20] ; jae` (record
   byte count) and `cmp <iter>,[ebp-0x18] ; jb` (clamped count);
   byte handlers normalise each element `cmp byte,0 ; setg al`
   (SIGNED int8 > 0) into the snapshot flag arrays (+0x38
   achievements, +0x268 collection, +0x3f4/+0x3fb miniboss/boss,
   +0x434 challenges), dword handlers store raw dwords (+0xec
   counters, +0x3c4 sec3, +0x44c sec8, +0x49c settings). The 7+
   vtbl indirect stream calls, the 9 cdecl logs, the stamp-cookie
   0xaef12b, PGDCLMP 0x9e4af0 and the stage-4 tally loops stay HOST.
   Cross-check: the clamp MAXes equal the v6 PGDCOV written byte
   counts 1:1; the store offsets are the v6 snapshot restore
   sources; the v1/v2 isaac_pgd_reader_* laws (0x00927c8a reader,
   11 dispatch entries, boundary <= 0xa) are a DIFFERENT reader and
   must NOT be conflated with this unit's <= 8 boundary.
   v23 (this unit) lands PGDADSED + PGDK41 — the two remaining
   v1-"unidentified" mutator islands between the count probe and the
   landed TryImportRebirthLocalSave 0x92b2e0; the whole
   0x92b22a..0x92b2e0 span is pure-covered after this unit.
   PGDADSED = the "seed added to SaveState" mutator 0x0092b230 (no
   exact ZHL — self-named by its log string "Seed %d added to
   SaveState\n" @0xb7ae58; address-stable; ret 4 @0x92b25f; int3 pad
   0x92b262..0x92b26e; inbound from the update slice 0x68cdc0
   @0x69166e): readonly LOW BYTE gate `cmp byte [ecx+1],0 ; jne ret`
   0x92b233/0x92b237 (no work at all when set — [ecx+1] =
   ISAAC_PGD_OFF_READONLY); unchecked slot store `mov byte
   [eax+ecx+0xf14],1` 0x92b244 with eax = the seed — byte
   [pgd+0xf14+SEED] = 1, the RAW byte index, never masked or bounded
   (0xf14 = ISAAC_PGD_OFF_SEC10_BYTES, 0x50 slots =
   ISAAC_PGD_COUNT_SEC10); unconditional slot-0 clear `mov byte
   [ecx+0xf14],0` 0x92b24c right after (seed==0 self-cancels);
   dirty `mov byte [ecx],1` 0x92b253 (pgd+0 =
   ISAAC_PGD_OFF_CHANGES_MADE); the log args (1, 0xb7ae58, seed) are
   pushed BEFORE the stores and the cdecl call 0x92b256 -> 0xa112c0
   stays HOST. PGDK41 = the 41-bit two-word popcount gate 0x0092b270
   (no exact ZHL; address-stable; ret 8 @0x92b2d9): `mov
   [ebx+0x5ac],eax` 0x92b281 (first arg -> counters[188]) and `mov
   [ebx+0xa7c],eax` 0x92b28a (second arg -> counters[496]; 0x2bc =
   ISAAC_PGD_OFF_EVENT_COUNTERS); the 41-iteration loop
   0x92b295..0x92b2ba counts set bits over bits 0..40 via `bts
   esi,ecx` (bit index masked to 5 bits), `cmp ecx,0x20 ; cmovae
   edx,esi ; xor esi,edx` (low word zeroed for i>=32), `and
   esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je` (lo bit i for i<32,
   hi bit i-32 for i>=32), `jl 0x92b295` bound 0x29 = 41; `cmp
   edi,5 ; jl 0x92b2d0` 0x92b2bf/0x92b2c2 SIGNED gate; `push 0x143
   ; mov ecx,ebx ; call 0x929a20` 0x92b2c4/0x92b2cb (TryUnlock stays
   HOST) fires only at popcount >= 5; the dirty store `mov byte
   [ebx],1` 0x92b2d2 is UNCONDITIONAL (runs even when the unlock
   does not). Both match the v2 PGDX behaviour oracles
   (sec10/mask41); v23 adds the machine-exact evidence.
   v22 (this unit) lands PGDADDMINI: the PersistentGameData::AddMiniBoss
   mutator 0x0092a520 (no exact ZHL — self-named by its own warning
   string "[warn] AddMiniBoss: invalid miniboss id %d"; address-stable;
   ret 4 @0x92a5d3; int3 pad @0x92a5d6; two ALIVE image callers
   0x7ffff1 / 0x800010, byte-scan verified). Readonly LOW BYTE gate
   `cmp byte [esi+1],0 ; jne fail` 0x92a529/0x92a52d; id window `cmp
   eax,0xf ; ja warn` UNSIGNED 0x92a533/0x92a536 (arg > 0xf logs
   (1, 0xb7aecc "…invalid miniboss id %d\n", ORIGINAL arg) and returns
   via the fail tail — negatives warn too); id->index fold
   0x92a53c..0x92a557: 7..0xd map to 0..6 (`lea ecx,[eax-7] ; cmp
   ecx,6 ; ja`), 0xe aliases to 6 (`mov eax,6`), 0..6 used directly,
   0xf DROPPED silently (signed `cmp eax,6 ; jg` — no store, no log);
   flag store `mov byte [eax+esi+0xe00],1` 0x92a55f (+0xe00 =
   ISAAC_PGD_OFF_SEC5_BYTES, 7 slots = ISAAC_PGD_COUNT_SEC5); dirty
   store `mov byte [esi],1` 0x92a569 (pgd+0 = ISAAC_PGD_OFF_CHANGES_MADE);
   host log (1, 0xb7aeac "MiniBoss %d added to SaveState\n", idx) cdecl
   0x92a56c -> 0xa112c0; ALL-SET gate over the seven flags 0xe00..0xe06
   (`cmp byte,0 ; je fail` 0x92a574..0x92a5b1) -> `push 0x16 ; mov
   ecx,esi ; call 0x929a20` (TryUnlock stays HOST) 0x92a5b7. Behaviour
   matches the v2 PGDX sec5 oracle; v22 adds the branch-level evidence.
   v21 (this unit) lands PGDADDBOSS: the PersistentGameData::AddBoss
   flag-and-unlock mutator 0x0092a5e0 (EXACT ZHL, 12 pattern bytes,
   `__thiscall void AddBoss(int bossID)`; ret 4 @0x92a79f; int3 pad
   @0x92a7a2 — the span dump at 0x92a700 lands mid-instruction of
   `cmp byte [esi+0xe2d],0`; two ALIVE image callers 0x7fc01f /
   0x7ff7a8, byte-scan verified). Readonly LOW BYTE gate `cmp byte
   [esi+1],0 ; jne fail` 0x92a5e6/0x92a5ea; arg gate `cmp eax,0x68
   ; jge fail` SIGNED with NO floor 0x92a5f3/0x92a5f6 (negative
   bossIDs pass and wrap the store offset — the same signed-ceiling
   law the v16 isaac_pgd_boss_index_valid recorded); flag store
   `mov byte [eax+esi+0xe07],1` 0x92a602 (+0xe07 =
   ISAAC_PGD_OFF_BOSSES, 0x68 values 0..0x67 =
   ISAAC_PGD_COUNT_BOSSES); dirty store `mov byte [esi],1` 0x92a60c
   (pgd+0 = ISAAC_PGD_OFF_CHANGES_MADE); host log
   (1, 0xb7ae90 "Boss %d added to SaveState\n", bossID) cdecl
   0x92a60f -> 0xa112c0; then eight sequential ALL-nonzero
   AND-gated TryUnlock calls (0x929a20 stays HOST): B1
   e08,e09,e14,e18,e33,e3f -> 0x56; B2 e0a,e0b,e15,e23,e36,e34 ->
   0x57; B3 e0c,e0d,e16,e37,e35 -> 0x58; B4 e26 -> 0xf; B5
   e10,e11,e12,e13,e2d -> 0x174; B6 e54,e52,e53,e62 -> 0x19c; B7
   e5a,e57,e51,e59 -> 0x19d; B8 e0d,e56,e58 -> 0x19e (e0d read by
   BOTH B3 and B8 — the machine re-reads, the laws do too). v20
v20 landed PGDADDCH: the PersistentGameData::AddChallenge
   flag-and-unlock dispatcher 0x0092a7b0 (EXACT ZHL, 9 pattern bytes,
   `__thiscall void AddChallenge(int challengeID)`; ret 4 @0x92aa2c;
   one ALIVE image caller 0x704f84, byte-scan verified — the
   linear-decode census misreads its vicinity). Readonly LOW BYTE gate
   `cmp byte [ecx+1],0 ; jne fail` 0x92a7b3/0x92a7ba; arg gate `cmp
   eax,0x2d ; ja fail` UNSIGNED 0x92a7c0/0x92a7c3; flag store `mov
   byte [eax+ecx+0xe6f],1` 0x92a7c9 (BEFORE the dispatch gate — arg 0
   STOREs the flag byte at pgd+0xe6f but never unlocks); `dec eax ;
   cmp eax,0x2c ; ja fail` 0x92a7d1/0x92a7d2/0x92a7d5; `jmp dword
   [eax*4+0x92aa30]` 0x92a7db into a 45-entry table (idx = arg-1,
   1..0x2d) of `mov [ebp+8],<id> ; pop ebp ; jmp 0x929a20` arms
   0x92a7e2..0x92aa1e (stride 13; unlock ids 0x59..0x21a, table re-read
   dword-for-dword from the image AND cross-checked against the arm
   immediates). +0xe6f = challenges byte map (ISAAC_PGD_OFF_CHALLENGES,
   count 0x2e; args 0..0x2d = 0x2e values). Host residual (named
   blocker): TryUnlock 0x929a20 (tail-call target). Inbound caller:
   0x92a7b0 <- 0x704f84.
   v21 (this unit) lands PGDADDBOSS: the PersistentGameData::AddBoss
   mutator 0x0092a5e0 (EXACT ZHL 12 pattern bytes,
   `__thiscall void AddBoss(int bossID)`; ret 4 @0x92a79f; two ALIVE
   image callers 0x7fc01f / 0x7ff7a8 byte-scan verified; int3 pad
   @0x92a7a2). SIGNED-ceiling arg gate with NO floor (`cmp eax,0x68 ;
   jge fail` 0x92a5f3/0x92a5f6 — negatives pass and wrap the store
   offset), flag store +0xe07 (ISAAC_PGD_OFF_BOSSES / count 0x68),
   dirty byte [pgd]=1, log helper 0xa112c0 (host), then eight
   sequential ALL-nonzero AND-gated TryUnlock calls (0x929a20 host).
   v22 (this unit) lands PGDADDMINI: the AddMiniBoss mutator 0x0092a520
   (no exact ZHL — self-named by its warning string; address-stable;
   ret 4 @0x92a5d3; callers 0x7ffff1 / 0x800010 byte-verified). UNSIGNED
   id window `cmp eax,0xf ; ja warn` 0x92a533/0x92a536 (above 0xf logs
   the warning with the ORIGINAL id; negatives warn too); id->index fold
   0x92a53c..0x92a557 (7..0xd -> arg-7, 0xe -> 6, 0..6 direct, 0xf
   silently dropped); flag store +0xe00 (ISAAC_PGD_OFF_SEC5_BYTES /
   count 7); dirty byte [pgd]=1; log helper 0xa112c0 (host); ALL-SET
   gate over the seven flags e00..e06 -> single TryUnlock(0x16) call.
   v5 re-proved the v4 remap land; v6 named the importer
   0x0092b2e0 (TryImportRebirthLocalSave) and translated its PGDCOV
   coverage; v7 translates the sibling import 0x0092b930 (PGDEX) and its
   event remap 0x0041ddb0; v8 lands PGDCLR (Clear complete) and PGDTAIL
   (shared import tail); v9 lands PGDCT (the sibling snapshot ctor
   0x0041d560 pre-size law) and law-fixes the sibling collection copy
   to 0x1ba bytes; v10 lands PGDICT (the import snapshot ctor
   0x009e3dc0 pre-size law for the 0x4f0 snapshot — 9 zero rows /
   0x46d bytes / 0 set-one / 5 gaps, arg unused, restore-source
   coverage cross-law vs PGDCOV); v11 lands PGDCLMP (the import-reader
   post-loop clamp 0x009e4af0 — SIGNED cmovg floor-1, 0 host calls,
   one call site 0x009e4613); v12 lands PGDTREE (MSVC tree successor
   0x00414a80 — 83 bytes, two rets, 0 host calls, 134 image sites /
   5 PGD-cluster sites, BYTE isnil at +0xd; next island 0x00414ae0;
   do not peel 0x009292c0); v13 lands PGDTROW (the writer's bestiary
   tree-row walk in 0x009282e0 — four std::map<int,int> maps drained via
   the v12 iterator++ law: row cell = [pgd+header_off], begin = [cell]
   (header->_Left), unsigned empty gate begin==cell, key@+0x10,
   value@+0x14, loop-back node != header, stride 0x18; walk order
   equals the v3 reader-side bestiary pair/tag tables); v14 lands
   PGDSC11 (the writer's section-11 sub-block framing in 0x009282e0 —
   header id=0xb, cap=total<<2 with total = wrap-32 sum of the four
   bestiary count words in machine order c2+c3+c1+c0, third streamed
   dword = sub-block count 4 with the row total a dead store at
   [ebp-0xc]; per walk step s a tag then a sub-block cap =
   count[count-off(slot(step))] << 2 prelude the v13 row walk; reader
   0x9276e1 gates: unsigned subcount==0, (tag-1)>3 unsigned invalid,
   SIGNED cap>0 then rows=cap>>2, unsigned sub-loop jb, signed
   row-loop jl); v15 lands PGDCP (the reader-side bestiary
   COUNT-PROBE 0x0092aea0 — the pure count-derivation laws over
   sampled game-state tree elements: entry LOW-BYTE readonly gate on
   pgd+1, the per-element eligibility decision [SIGNED +0x7c >= 0,
   float +0x68 IEEE-equal to +0.0f via the ucomiss/lahf/test ah,0x44/
   jnp idiom, LOW-BYTE +0x100 != 0], the [0xc7f508] lazy-init store
   decision (derived + stored only when the cached global is zero;
   effective = cached != 0 ? cached : derived), and the UNSIGNED
   proceed gate [pgd+0xf68] >= count before the host +0x15/+0x17c
   flags + 0x9595e0 block); v16 lands PGDDEATH (the bestiary slot-3
   getter 0x0092b070 GetBestiaryDeathCount — key derivation, node
   eligibility, value extraction); v17 lands PGDKILL + PGDENC, the two
   sibling getters 0x0092b100 GetBestiaryKillCount (slot-1 base 0xf6c)
   and 0x0092b190 GetBestiaryEncounterCount (slot-0 base 0xf64 via the
   local helper 0x92b1e0) — the same template as PGDDEATH, different
   slot bases; the v16 handoff's "0x92b110" entry was a MID-INSTRUCTION
   decode (true entry 0x92b100, cf. 0x92b0c0 in v15) and its "0xf74"
   encounter slot was wrong (machine + ZHL: 0xf64). Evidence tables and
   per-branch VAs live in pgd_pure_helpers.h.
   v18 lands PGDADDKILL (0x0092acb0 AddBestiaryKill, EXACT ZHL 15
   pattern bytes, `__thiscall bool AddBestiaryKill(int EntityType,
   int EntityVariant)`): the write-side counter/insert mutator on the
   slot-1 bestiary map (header base 0xf6c). Landed: the entry fail
   gates (readonly LOW BYTE != 0 / rec_found == 0 / gate_byte LOW
   BYTE == 0 -> return 0, in that order; otherwise 1 ALWAYS), the
   `((w0<<12)|w1)<<8` key, the three node gates, the WRITE-side store
   decision (node_ok ? old+1 mod 2^32 : 1 — INSERT on gate fail,
   the opposite of the getters), the byte-table dispatch
   (idx = type-0x10f UNSIGNED > 0x85 -> case 3 else byte_table[idx]
   {0->0, 1->0, 0x23->1, 0x85->2, else->3}), the unlock gates
   (case0 sum >= 0xa UNSIGNED, case1/2 count >= 0x14 UNSIGNED, case3
   never) + unlock ids (0->0x175, 1->0x15d, 2->0x164, 3->0) and the
   case0 sum ((n1+n2) mod 2^32, n1 = killcount(0x110,0), n2 =
   killcount(0x10f,0)). Host residual (named blocker): container find
   0x695030, map find 0x4288a0, value-slot accessor 0x92ca70 (MSVC
   SEH prologue), kill getter 0x92b100, TryUnlock 0x929a20. The jump
   table @0x92ae00 {0x92adb9, 0x92ad81, 0x92ad9d, 0x92adea} and byte
   table @0x92ae10 were re-read byte-for-byte from the image.
   v19 lands PGDADDSIB2 + PGDADDSIB3: the slot-2/slot-3 sibling
   AddBestiary* write mutators 0x0092aaf0 + 0x0092abd0 (wrappers,
   ret 8) paired with their store helpers 0x0092ab40 + 0x0092ac20
   (ret 4) — TWO wrapper/helper pairs, NOT the four
   AddBestiaryKill-shaped bodies with own unlock dispatches the v18
   handoff guessed (zero ZHL matches on all four; no unlock dispatch,
   no kill-count getter in the set). Wrapper template: readonly gate
   `cmp byte [esi+1],0`, container find 0x695030 on [0xc7169c]+
   0x2a670, rec null gate, gate byte +0xe8 LOW BYTE gate, key
   `((w0<<12)|w1)<<8`, call helper (returns the helper's bool).
   Helper template (aligned prologue `55 8b ec 83 e4 f8 83 ec 10`):
   its OWN readonly gate (the same pgd+1 byte, a second sampled
   input), map find 0x4288a0 on the slot header (slot-2 base 0xf74,
   slot-3 base 0xf7c), the three node gates, WRITE-side store (found
   `inc dword [eax]`, not-found `mov dword [eax],1`; BOTH paths
   return al=1). Host residual (named blocker): container find
   0x695030, map find 0x4288a0, value-slot accessor 0x92ca70.
   Inbound callers: 0x92aaf0 <- 0x774461, 0x92abd0 <- 0x7780c8;
   helpers' only callers are their wrappers (0x92ab2e / 0x92ac0e).
   v20 (this unit) lands PGDADDCH: the PersistentGameData::AddChallenge
   flag-and-unlock dispatcher 0x0092a7b0 (EXACT ZHL, 9 pattern bytes,
   `__thiscall void AddChallenge(int challengeID)`; ret 4 @0x92aa2c;
   one ALIVE image caller 0x704f84, byte-scan verified — the
   linear-decode census misreads its vicinity). Readonly LOW BYTE gate
   `cmp byte [ecx+1],0 ; jne fail` 0x92a7b3/0x92a7ba; arg gate `cmp
   eax,0x2d ; ja fail` UNSIGNED 0x92a7c0/0x92a7c3; flag store `mov
   byte [eax+ecx+0xe6f],1` 0x92a7c9 (BEFORE the dispatch gate — arg 0
   STOREs the flag byte at pgd+0xe6f but never unlocks); `dec eax ;
   cmp eax,0x2c ; ja fail` 0x92a7d1/0x92a7d2/0x92a7d5; `jmp dword
   [eax*4+0x92aa30]` 0x92a7db into a 45-entry table (idx = arg-1,
   1..0x2d) of `mov [ebp+8],<id> ; pop ebp ; jmp 0x929a20` arms
   0x92a7e2..0x92aa1e (stride 13; unlock ids 0x59..0x21a, table re-read
   dword-for-dword from the image AND cross-checked against the arm
   immediates). +0xe6f = challenges byte map (ISAAC_PGD_OFF_CHALLENGES,
   count 0x2e; args 0..0x2d = 0x2e values). Host residual (named
   blocker): TryUnlock 0x929a20 (tail-call target, this = ecx
   unchanged). Inbound caller: 0x92a7b0 <- 0x704f84. section-notes/
   pgd-v6/ holds the v6 unit's evidence and mutation
   verdicts:
     disasm-92b2e0-import-full.txt   the whole TryImportRebirthLocalSave
     disasm-92b930-sibling.txt       the sibling import (v6 census)
     NOTES.md                        translation + mutation verdicts
   section-notes/pgd-v7/ holds the v7 unit's evidence and verdicts:
     disasm-92b930-full.txt          the whole sibling import
     disasm-41ddb0-event-remap.txt   the 161-arm event remap function
     NOTES.md                        translation + mutation verdicts
   section-notes/pgd-v5/ holds the v5 re-verification:
     NOTES.md                        arm-by-arm re-read + mutation verdicts
   section-notes/pgd-v4/ holds the v4 disassembly:
     disasm-9e4f80-sec3-remap.txt     the +0xdc8 restore index remap
     disasm-9e3ea0-events-remap.txt   the +0x2bc restore index remap
     disasm-92b660-restore-loops.txt  both driving loops in 0x0092b346
   section-notes/pgd-v3/ holds the v3 disassembly:
     disasm-pgd-cluster-926200-92c000.txt  the whole PGD address cluster
     disasm-919980-91b400.txt              the second transport + its codec
     disasm-92b300-92bc80.txt              the bulk restore that addresses the
                                           unidentified arrays element by element
   section-notes/pgd-v2/ holds disasm-927244-927cd8.txt (the eleven handlers).
   section-notes/pgd-v1/ holds the raw disassembly v1 was read from:
     disasm-9282e0-928ee0.txt  writer + SaveToSteamCloud
     disasm-deser-926e90.txt   reader
     disasm-checksum.txt       0x00683410 / 0x00683580 / 0x006ef2c3
     disasm-accessors.txt      Unlocked / TryUnlock / IncreaseEventCounter /
                               AddToCollection / AddChallenge / AddBoss
   No file IO, no allocation, no globals with external linkage. */

namespace {

/* ---- magic table (ASCII, 16 bytes each, from 0xb1b98c/9a0/9b4 and
   0xb7ab6c). The writer pushes 0xb7ab6c at VA 0x009282ef. ---- */
const char kMagics[ISAAC_PGD_MAGIC_VARIANTS][ISAAC_PGD_MAGIC_BYTES] = {
    {'I', 'S', 'A', 'A', 'C', 'N', 'G', 'S', 'A', 'V', 'E', '0', '6', 'R', ' ',
     ' '},
    {'I', 'S', 'A', 'A', 'C', 'N', 'G', 'S', 'A', 'V', 'E', '0', '7', 'R', ' ',
     ' '},
    {'I', 'S', 'A', 'A', 'C', 'N', 'G', 'S', 'A', 'V', 'E', '0', '8', 'R', ' ',
     ' '},
    {'I', 'S', 'A', 'A', 'C', 'N', 'G', 'S', 'A', 'V', 'E', '0', '9', 'R', ' ',
     ' '}};

const int32_t kVersionForVariant[ISAAC_PGD_MAGIC_VARIANTS] = {
    ISAAC_PGD_VERSION_06, ISAAC_PGD_VERSION_07, ISAAC_PGD_VERSION_08,
    ISAAC_PGD_VERSION_09};

const int32_t kMaxSectionForVariant[ISAAC_PGD_MAGIC_VARIANTS] = {
    ISAAC_PGD_MAX_SECTION_ID_V06, ISAAC_PGD_MAX_SECTION_ID_V07,
    ISAAC_PGD_MAX_SECTION_ID_V08, ISAAC_PGD_MAX_SECTION_ID_V09};

/* ---- section table: the exact immediates the writer stores into
   [ebp-0x10] / [ebp-0x14] / [ebp-0xc] before each triple. ---- */
struct SectionRow {
  int32_t id;
  int32_t cap_word;
  int32_t count_word;
  int32_t elem_width;
  int32_t field_offset;
};

const SectionRow kSections[] = {
    /* id, cap,     count,  width, offset      writer VA of the triple */
    {1, 0x282, 0x282, 1, ISAAC_PGD_OFF_ACHIEVEMENTS},     /* 0x0092833b */
    {2, 0x82c, 0x20b, 4, ISAAC_PGD_OFF_EVENT_COUNTERS},   /* 0x009283f6 */
    {3, 0x38, 0xe, 4, ISAAC_PGD_OFF_SEC3_DWORDS},         /* 0x009284ad */
    {4, 0xb74, 0x2dd, 1, ISAAC_PGD_OFF_ITEM_COLLECTION},  /* 0x00928569 */
    {5, 0x1c, 0x7, 1, ISAAC_PGD_OFF_SEC5_BYTES},          /* 0x00928627 */
    {6, 0x1a0, 0x68, 1, ISAAC_PGD_OFF_BOSSES},            /* 0x009286e6 */
    {7, 0xb8, 0x2e, 1, ISAAC_PGD_OFF_CHALLENGES},         /* 0x009287a6 */
    {8, 0x6c, 0x1b, 4, ISAAC_PGD_OFF_SEC8_DWORDS},        /* 0x00928866 */
    {9, 0x8, 0x2, 4, ISAAC_PGD_OFF_SEC9_DWORDS},          /* 0x00928926 */
    {10, 0x140, 0x50, 1, ISAAC_PGD_OFF_SEC10_BYTES},      /* 0x009289e6 */
};

const int32_t kFixedSectionCount =
    static_cast<int32_t>(sizeof(kSections) / sizeof(kSections[0]));

inline uint32_t u32(uint32_t v) {
  return v;
}

/* x86 `shr r32, 1`. */
inline uint32_t shr1(uint32_t v) {
  return v >> 1;
}

/* x86 `sar r32, 1` — the sign bit is replicated. This is the shift the table
   generator uses for rounds 2..8 (D1 FA), and it is what makes the table
   diverge from the standard CRC-32 table. */
inline uint32_t sar1(uint32_t v) {
  const uint32_t shifted = v >> 1;
  return (v & 0x80000000u) != 0u ? (shifted | 0x80000000u) : shifted;
}

/* Table entry generator, transcribed round by round from 0x00683483:
   round 1 uses `shr eax,1`, rounds 2..8 use `sar`. The poly mask comes from
   `neg / sbb / and 0xEDB88320`, i.e. (value & 1) ? poly : 0. */
inline uint32_t table_entry(uint32_t index) {
  uint32_t c = index & 0xffu;
  /* round 1: logical */
  c = shr1(c) ^ ((c & 1u) != 0u ? ISAAC_PGD_CHECKSUM_POLY : 0u);
  /* rounds 2..8: arithmetic */
  for (int round = 0; round < 7; ++round) {
    const uint32_t poly = (c & 1u) != 0u ? ISAAC_PGD_CHECKSUM_POLY : 0u;
    c = sar1(c) ^ poly;
  }
  return c;
}

/* Fold one byte of the mode-1 loop (0x00683554..0x00683561). */
inline uint32_t crc_step(uint32_t reg, uint32_t byte_value) {
  const uint32_t index = (reg ^ byte_value) & 0xffu;
  return (reg >> 8) ^ table_entry(index);
}

/* Mode-0 word fold, spelled the way the PE spells it so the two adds keep
   their exact 32-bit wrap order (0x0068344a and 0x00928eab). */
inline uint32_t ror_add(uint32_t acc, uint32_t word) {
  const uint32_t hi = u32(acc << 31);
  const uint32_t lo = u32(u32(acc >> 1) + word);
  return u32(hi + lo);
}

inline uint32_t le32(const uint8_t* p) {
  return static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

inline void store_le32(uint8_t* p, uint32_t v) {
  p[0] = static_cast<uint8_t>(v & 0xffu);
  p[1] = static_cast<uint8_t>((v >> 8) & 0xffu);
  p[2] = static_cast<uint8_t>((v >> 16) & 0xffu);
  p[3] = static_cast<uint8_t>((v >> 24) & 0xffu);
}

const SectionRow* fixed_row(int32_t id) {
  for (int32_t i = 0; i < kFixedSectionCount; ++i) {
    if (kSections[i].id == id) {
      return &kSections[i];
    }
  }
  return nullptr;
}

/* Bestiary sub-block emission order (tags 4, 2, 3, 1 at writer VAs
   0x00928b43 / 0x00928c09 / 0x00928ccc / 0x00928d8f) and the (root, count)
   pair each one drains (0xf7c/0xf80, 0xf6c/0xf70, 0xf74/0xf78, 0xf64/0xf68). */
const int32_t kBestiaryTags[ISAAC_PGD_BESTIARY_SUBMAPS] = {4, 2, 3, 1};
const int32_t kBestiaryPairs[ISAAC_PGD_BESTIARY_SUBMAPS] = {3, 1, 2, 0};

/* ---- v2: reader-side section table, read out of the eleven handlers behind
   the jump table at 0x00927cd8. Independent of kSections above. ---- */
struct ReaderRow {
  int32_t id;
  int32_t builtin_count;
  int32_t elem_width;
  int32_t field_offset;
  int32_t store_bound;
  int32_t clamps_file_count;
  uint32_t handler_va;
  uint32_t log_begin_va;
  uint32_t log_end_va;
  uint32_t log_mismatch_va;
};

const ReaderRow kReaderSections[] = {
    {1, 0x282, 1, 0x38, 0x282, 0, 0x00927118u, 0x00b7aa9cu, 0x00b7aa80u,
     0x00b1ba38u},
    {2, 0x20b, 4, 0x2bc, 0x20b, 0, 0x009271a6u, 0x00b7ac5cu, 0x00b7ac44u,
     0x00b1ba60u},
    {3, 0xe, 4, 0xdc8, 0xe, 0, 0x00927244u, 0x00b7ac2cu, 0x00b7ac0cu,
     0x00b1ba60u},
    {4, 0x2dd, 1, 0xae8, 0x2dd, 0, 0x009272dcu, 0x00b7abf4u, 0x00b7abd8u,
     0x00b1ba84u},
    {5, 0x7, 1, 0xe00, 0x7, 0, 0x00927374u, 0x00b7abc0u, 0x00b7aba4u,
     0x00b1babcu},
    {6, 0x68, 1, 0xe07, 0x68, 0, 0x00927401u, 0x00b7ad38u, 0x00b7ad20u,
     0x00b1babcu},
    {7, 0x2e, 1, 0xe6f, 0x2e, 0, 0x00927491u, 0x00b7ad04u, 0x00b7ace0u,
     0x00b1bae4u},
    {8, 0x1b, 4, 0xea0, 0x1b, 0, 0x00927521u, 0x00b7acc4u, 0x00b7aca4u,
     0x00b1bb0cu},
    {9, 0x2, 4, 0xf0c, 0x2, 1, 0x009275bcu, 0x00b7ac8cu, 0x00b7ac70u,
     0x00b1bb34u},
    {10, 0x50, 1, 0xf14, 0x50, 0, 0x00927656u, 0x00b7ae38u, 0x00b7ae14u,
     0x00b1bb58u},
    {11, ISAAC_PGD_BESTIARY_SUBMAPS, 0, 0xf64, 0, 0, 0x009276e1u, 0x00b7adf8u,
     0x00b7add8u, 0u},
};

const int32_t kReaderSectionCount =
    static_cast<int32_t>(sizeof(kReaderSections) / sizeof(kReaderSections[0]));

const ReaderRow* reader_row(int32_t id) {
  for (int32_t i = 0; i < kReaderSectionCount; ++i) {
    if (kReaderSections[i].id == id) {
      return &kReaderSections[i];
    }
  }
  return nullptr;
}

/* Section-11 sub-tag table at 0x00927d04; tag N -> pair slot N-1. */
const uint32_t kBestiaryTagHandlers[ISAAC_PGD_BESTIARY_SUBMAPS] = {
    0x00927b44u, 0x009278f4u, 0x00927a18u, 0x009277ceu};

const uint32_t kBestiaryRootOff[ISAAC_PGD_BESTIARY_SUBMAPS] = {
    ISAAC_PGD_BESTIARY_OFF_ROOT_0, ISAAC_PGD_BESTIARY_OFF_ROOT_1,
    ISAAC_PGD_BESTIARY_OFF_ROOT_2, ISAAC_PGD_BESTIARY_OFF_ROOT_3};

const uint32_t kBestiaryCountOff[ISAAC_PGD_BESTIARY_SUBMAPS] = {
    ISAAC_PGD_BESTIARY_OFF_COUNT_0, ISAAC_PGD_BESTIARY_OFF_COUNT_1,
    ISAAC_PGD_BESTIARY_OFF_COUNT_2, ISAAC_PGD_BESTIARY_OFF_COUNT_3};

}  // namespace

/* ---------- string sub-object ---------- */

int32_t isaac_pgd_string_data_is_heap(uint32_t capacity) {
  return capacity >= static_cast<uint32_t>(ISAAC_PGD_STRING_SSO_CAP) ? 1 : 0;
}

/* ---------- magic / version ---------- */

int32_t isaac_pgd_magic_byte(int32_t variant, int32_t index) {
  if (variant < 0 || variant >= ISAAC_PGD_MAGIC_VARIANTS) {
    return 0;
  }
  if (index < 0 || index >= ISAAC_PGD_MAGIC_BYTES) {
    return 0;
  }
  return static_cast<int32_t>(
      static_cast<uint8_t>(kMagics[variant][index]));
}

int32_t isaac_pgd_magic_variant(const uint8_t* magic) {
  if (magic == nullptr) {
    return -1;
  }
  for (int32_t v = 0; v < ISAAC_PGD_MAGIC_VARIANTS; ++v) {
    int32_t same = 1;
    for (int32_t i = 0; i < ISAAC_PGD_MAGIC_BYTES; ++i) {
      if (magic[i] != static_cast<uint8_t>(kMagics[v][i])) {
        same = 0;
        break;
      }
    }
    if (same != 0) {
      return v;
    }
  }
  return -1;
}

int32_t isaac_pgd_version_for_variant(int32_t variant) {
  if (variant < 0 || variant >= ISAAC_PGD_MAGIC_VARIANTS) {
    return 0;
  }
  return kVersionForVariant[variant];
}

int32_t isaac_pgd_max_section_id_for_variant(int32_t variant) {
  if (variant < 0 || variant >= ISAAC_PGD_MAGIC_VARIANTS) {
    return 0;
  }
  return kMaxSectionForVariant[variant];
}

int32_t isaac_pgd_version_loadable(int32_t version_tag) {
  /* `cmp ebx, 8 ; ja proceed` at 0x0092705f — UNSIGNED above. */
  return static_cast<uint32_t>(version_tag) >
                 static_cast<uint32_t>(ISAAC_PGD_MIN_LOADABLE_VERSION - 1)
             ? 1
             : 0;
}

/* ---------- section table ---------- */

int32_t isaac_pgd_section_desc(int32_t id, IsaacPgdSectionDesc* out) {
  if (id == ISAAC_PGD_BESTIARY_SECTION_ID) {
    if (out != nullptr) {
      out->id = id;
      out->cap_word = 0; /* computed at run time from the four map sizes */
      out->count_word = ISAAC_PGD_BESTIARY_SUBMAPS;
      out->elem_width = 0;
      out->field_offset = ISAAC_PGD_OFF_BESTIARY;
      out->payload_bytes = 0;
      out->fixed = 0;
    }
    return 1;
  }
  const SectionRow* row = fixed_row(id);
  if (row == nullptr) {
    return 0;
  }
  if (out != nullptr) {
    out->id = row->id;
    out->cap_word = row->cap_word;
    out->count_word = row->count_word;
    out->elem_width = row->elem_width;
    out->field_offset = row->field_offset;
    out->payload_bytes = row->count_word * row->elem_width;
    out->fixed = 1;
  }
  return 1;
}

int32_t isaac_pgd_section_stream_bytes(int32_t id) {
  const SectionRow* row = fixed_row(id);
  if (row == nullptr) {
    return -1;
  }
  return ISAAC_PGD_SECTION_HEADER_BYTES + row->count_word * row->elem_width;
}

int32_t isaac_pgd_section_stream_offset(int32_t id) {
  const SectionRow* row = fixed_row(id);
  if (row == nullptr) {
    return -1;
  }
  int32_t offset = ISAAC_PGD_MAGIC_BYTES + 4; /* magic + pre-section word */
  for (int32_t i = 0; i < kFixedSectionCount; ++i) {
    if (kSections[i].id == id) {
      break;
    }
    offset += ISAAC_PGD_SECTION_HEADER_BYTES +
              kSections[i].count_word * kSections[i].elem_width;
  }
  return offset;
}

int32_t isaac_pgd_fixed_prefix_bytes(void) {
  int32_t total = ISAAC_PGD_MAGIC_BYTES + 4;
  for (int32_t i = 0; i < kFixedSectionCount; ++i) {
    total += ISAAC_PGD_SECTION_HEADER_BYTES +
             kSections[i].count_word * kSections[i].elem_width;
  }
  return total;
}

/* ---------- reader control flow ---------- */

int32_t isaac_pgd_reader_loop_continue(int32_t prev_id, int32_t max_section_id) {
  if (prev_id < 0) {
    return 0;
  }
  return prev_id < max_section_id ? 1 : 0;
}

int32_t isaac_pgd_reader_section_skipped(uint32_t cap_word) {
  /* `cmp dword [ebp-0x28], 0 ; jbe` — unsigned, so only zero takes it. */
  return cap_word == 0u ? 1 : 0;
}

int32_t isaac_pgd_reader_section_dispatched(int32_t id) {
  const uint32_t biased = static_cast<uint32_t>(id) - 1u;
  return biased <= 0xau ? 1 : 0;
}

int32_t isaac_pgd_reader_payload_continue(uint32_t byte_cursor,
                                          uint32_t cap_word) {
  return byte_cursor < cap_word ? 1 : 0;
}

int32_t isaac_pgd_reader_store_in_range(uint32_t index,
                                        uint32_t builtin_count) {
  return index < builtin_count ? 1 : 0;
}

int32_t isaac_pgd_reader_count_mismatch(int32_t file_count,
                                        int32_t builtin_count) {
  return file_count != builtin_count ? 1 : 0;
}

int32_t isaac_pgd_reader_bool_normalize(int32_t raw_byte) {
  /* The byte is loaded into a signed char slot and tested with `setg`. */
  const int32_t as_signed = static_cast<int32_t>(
      static_cast<int8_t>(static_cast<uint8_t>(raw_byte & 0xff)));
  return as_signed > 0 ? 1 : 0;
}

int32_t isaac_pgd_writer_bool_normalize(uint32_t raw_byte) {
  return (raw_byte & 0xffu) != 0u ? 1 : 0;
}

/* ---------- checksum ---------- */

uint32_t isaac_pgd_crc_table_entry(uint32_t index) {
  return table_entry(index);
}

int32_t isaac_pgd_crc_table_uses_arithmetic_shift(void) {
  return 1;
}

int32_t isaac_pgd_save_uses_state_crc_routine(void) {
  return 0;
}

uint32_t isaac_pgd_crc_step(uint32_t reg, uint32_t byte_value) {
  return crc_step(reg, byte_value);
}

uint32_t isaac_pgd_ror_add_step(uint32_t acc, uint32_t word) {
  return ror_add(acc, word);
}

void isaac_pgd_checksum_init(IsaacPgdChecksumState* state, int32_t mode) {
  if (state == nullptr) {
    return;
  }
  state->buffer = 0u;
  state->partial_len = 0u;
  state->acc = ISAAC_PGD_CHECKSUM_SEED;
  state->mode = mode;
}

void isaac_pgd_checksum_update(IsaacPgdChecksumState* state,
                               const uint8_t* data,
                               int32_t len) {
  if (state == nullptr) {
    return;
  }
  if (state->mode == ISAAC_PGD_CHECKSUM_MODE_ROR_ADD) {
    if (len <= 0 || data == nullptr) {
      return; /* `test edi,edi ; je epilogue` at 0x00683422 */
    }
    uint8_t buf[4];
    store_le32(buf, state->buffer);
    uint32_t partial = state->partial_len & 0xffu;
    for (int32_t i = 0; i < len; ++i) {
      if (partial < 4u) {
        buf[partial] = data[i];
      }
      partial = (partial + 1u) & 0xffu;
      if (partial >= 4u) {
        /* the PE re-reads the mode here; it cannot have changed. */
        state->acc = ror_add(state->acc, le32(buf));
        partial = 0u;
      }
    }
    state->buffer = le32(buf);
    state->partial_len = partial;
    return;
  }
  if (state->mode != ISAAC_PGD_CHECKSUM_MODE_CRC) {
    return; /* `cmp eax,1 ; jne epilogue` — no state change whatsoever. */
  }
  uint32_t reg = ~state->acc;
  state->acc = reg;
  if (len <= 0 || data == nullptr) {
    state->acc = ~reg; /* the two `not`s cancel on an empty update. */
    return;
  }
  for (int32_t i = 0; i < len; ++i) {
    reg = crc_step(reg, data[i]);
    state->acc = reg;
  }
  state->acc = ~reg;
}

uint32_t isaac_pgd_checksum_finalize(const IsaacPgdChecksumState* state) {
  if (state == nullptr) {
    return 0u;
  }
  if (state->mode != ISAAC_PGD_CHECKSUM_MODE_ROR_ADD) {
    return state->acc; /* `cmp [ebp-0x30],0 ; jne take_acc` */
  }
  const uint32_t partial = state->partial_len & 0xffu;
  if (partial == 0u) {
    return state->acc;
  }
  uint8_t buf[4];
  store_le32(buf, state->buffer);
  if (partial < 4u) {
    for (uint32_t i = partial; i < 4u; ++i) {
      buf[i] = 0u; /* memset(state + partial, 0, 4 - partial) */
    }
  }
  return ror_add(state->acc, le32(buf));
}

uint32_t isaac_pgd_checksum_buffer(const uint8_t* data,
                                   int32_t len,
                                   int32_t mode) {
  IsaacPgdChecksumState state;
  isaac_pgd_checksum_init(&state, mode);
  isaac_pgd_checksum_update(&state, data, len);
  return isaac_pgd_checksum_finalize(&state);
}

uint32_t isaac_pgd_checksum_file_region(const uint8_t* file,
                                        int32_t len,
                                        int32_t skip_front,
                                        int32_t skip_back) {
  if (file == nullptr || len <= 0 || skip_front < 0 || skip_back < 0) {
    return 0u;
  }
  const int32_t span = len - skip_front - skip_back;
  if (span <= 0) {
    return 0u;
  }
  return isaac_pgd_checksum_buffer(file + skip_front, span,
                                   ISAAC_PGD_CHECKSUM_MODE_CRC);
}

int32_t isaac_pgd_checksum_file_valid(const uint8_t* file, int32_t len) {
  if (file == nullptr || len < ISAAC_PGD_MAGIC_BYTES +
                                   ISAAC_PGD_CHECKSUM_TAIL_BYTES + 1) {
    return 0;
  }
  const uint32_t computed = isaac_pgd_checksum_file_region(
      file, len, ISAAC_PGD_CHECKSUM_SKIP_FRONT, ISAAC_PGD_CHECKSUM_SKIP_BACK);
  const uint32_t stored = le32(file + (len - ISAAC_PGD_CHECKSUM_TAIL_BYTES));
  return computed == stored ? 1 : 0;
}

/* ---------- accessors / bounds ---------- */

int32_t isaac_pgd_achievement_index_valid(int32_t achievement_id) {
  return static_cast<uint32_t>(achievement_id) <
                 static_cast<uint32_t>(ISAAC_PGD_COUNT_ACHIEVEMENTS)
             ? 1
             : 0;
}

int32_t isaac_pgd_unlocked(int32_t achievement_id,
                           uint32_t achievement_byte,
                           int32_t mode_word,
                           int32_t game_null,
                           uint32_t game_26630,
                           uint32_t game_26589) {
  if (achievement_id == ISAAC_PGD_UNLOCKED_SENTINEL_NEVER) {
    return 0;
  }
  if (achievement_id < 0) {
    return 1; /* `test eax,eax ; jns` falls through to `mov al,1` */
  }
  if (static_cast<uint32_t>(achievement_id) >=
      static_cast<uint32_t>(ISAAC_PGD_COUNT_ACHIEVEMENTS)) {
    return 0;
  }
  if (achievement_id == 0) {
    return 1;
  }
  if ((achievement_byte & 0xffu) != 0u) {
    return 1;
  }
  if (mode_word != ISAAC_PGD_UNLOCKED_MODE_VALUE) {
    return 0;
  }
  if (game_null != 0) {
    return 0;
  }
  if (game_26630 > 0u) {
    return 1; /* `cmp dword [eax+0x26630],0 ; ja` — unsigned above */
  }
  if ((game_26589 & 0xffu) != 0u) {
    return 1;
  }
  return 0;
}

int32_t isaac_pgd_try_unlock_store_needed(uint32_t readonly,
                                          int32_t achievement_id,
                                          uint32_t achievement_byte) {
  if ((readonly & 0xffu) != 0u) {
    return 0;
  }
  if (achievement_id == 0) {
    return 0;
  }
  if ((achievement_byte & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

int32_t isaac_pgd_try_unlock_steam_leg(uint32_t flag_02, int32_t cloud_ready) {
  if (cloud_ready != 0) {
    return 0; /* the cloud branch skips the Steam achievement leg */
  }
  return (flag_02 & 0xffu) != 0u ? 1 : 0;
}

int32_t isaac_pgd_collection_index_valid(int32_t collectible_id) {
  return static_cast<uint32_t>(collectible_id) <=
                 static_cast<uint32_t>(ISAAC_PGD_COUNT_ITEM_COLLECTION - 1)
             ? 1
             : 0;
}

int32_t isaac_pgd_collection_store_needed(uint32_t readonly,
                                          int32_t collectible_id,
                                          uint32_t current_byte) {
  if ((readonly & 0xffu) != 0u) {
    return 0;
  }
  if (isaac_pgd_collection_index_valid(collectible_id) == 0) {
    return 0;
  }
  if (collectible_id == 0) {
    return 0; /* `test eax,eax ; je skip_store` at 0x0092a2e6 */
  }
  return (current_byte & 0xffu) != 0u ? 0 : 1;
}

int32_t isaac_pgd_challenge_index_valid(int32_t challenge_id) {
  return static_cast<uint32_t>(challenge_id) <=
                 static_cast<uint32_t>(ISAAC_PGD_COUNT_CHALLENGES - 1)
             ? 1
             : 0;
}

int32_t isaac_pgd_challenge_store_needed(uint32_t readonly,
                                         int32_t challenge_id) {
  if ((readonly & 0xffu) != 0u) {
    return 0;
  }
  return isaac_pgd_challenge_index_valid(challenge_id);
}

int32_t isaac_pgd_boss_index_valid(int32_t boss_id) {
  /* SIGNED `jge`, and no lower bound at all. */
  return boss_id < ISAAC_PGD_COUNT_BOSSES ? 1 : 0;
}

int32_t isaac_pgd_boss_store_needed(uint32_t readonly, int32_t boss_id) {
  if ((readonly & 0xffu) != 0u) {
    return 0;
  }
  return isaac_pgd_boss_index_valid(boss_id);
}

int32_t isaac_pgd_event_counter_next(int32_t old_value, int32_t num) {
  const int32_t negated =
      static_cast<int32_t>(0u - static_cast<uint32_t>(num)); /* `neg edx` */
  const int32_t sum = static_cast<int32_t>(static_cast<uint32_t>(old_value) +
                                           static_cast<uint32_t>(num));
  return negated <= old_value ? sum : 0; /* `cmp edx, edi ; cmovle` */
}

int32_t isaac_pgd_event_counter_store_needed(uint32_t readonly) {
  return (readonly & 0xffu) != 0u ? 0 : 1;
}

int32_t isaac_pgd_flag_get(const uint8_t* flags, int32_t count, int32_t index) {
  if (flags == nullptr || count <= 0) {
    return 0;
  }
  if (static_cast<uint32_t>(index) >= static_cast<uint32_t>(count)) {
    return 0;
  }
  return flags[index] != 0u ? 1 : 0;
}

int32_t isaac_pgd_flag_set(uint8_t* flags,
                           int32_t count,
                           int32_t index,
                           int32_t value) {
  if (flags == nullptr || count <= 0) {
    return 0;
  }
  if (static_cast<uint32_t>(index) >= static_cast<uint32_t>(count)) {
    return 0;
  }
  flags[index] = value != 0 ? 1u : 0u;
  return 1;
}

int32_t isaac_pgd_flag_popcount(const uint8_t* flags, int32_t count) {
  if (flags == nullptr || count <= 0) {
    return 0;
  }
  int32_t total = 0;
  for (int32_t i = 0; i < count; ++i) {
    if (flags[i] != 0u) {
      total += 1;
    }
  }
  return total;
}

/* ---------- bestiary header ---------- */

uint32_t isaac_pgd_bestiary_total(uint32_t count0,
                                  uint32_t count1,
                                  uint32_t count2,
                                  uint32_t count3) {
  /* PE order at 0x00928aa6: (f78) + (f80) + (f70), then + (f68). */
  const uint32_t partial = u32(u32(u32(count2 + count3) + count1));
  return u32(partial + count0);
}

uint32_t isaac_pgd_bestiary_cap_word(uint32_t total) {
  return u32(total << 2);
}

int32_t isaac_pgd_bestiary_submap_tag(int32_t slot) {
  if (slot < 0 || slot >= ISAAC_PGD_BESTIARY_SUBMAPS) {
    return 0;
  }
  return kBestiaryTags[slot];
}

int32_t isaac_pgd_bestiary_submap_pair(int32_t slot) {
  if (slot < 0 || slot >= ISAAC_PGD_BESTIARY_SUBMAPS) {
    return -1;
  }
  return kBestiaryPairs[slot];
}

/* ---------- save plan ---------- */

void isaac_pgd_save_plan(uint32_t save_counter_in,
                         uint32_t bestiary_count0,
                         uint32_t bestiary_count1,
                         uint32_t bestiary_count2,
                         uint32_t bestiary_count3,
                         IsaacPgdSavePlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t total = isaac_pgd_bestiary_total(
      bestiary_count0, bestiary_count1, bestiary_count2, bestiary_count3);
  out->magic_variant = ISAAC_PGD_MAGIC_VARIANTS - 1;
  out->version_tag = ISAAC_PGD_VERSION_09;
  out->max_section_id = ISAAC_PGD_MAX_SECTION_ID_V09;
  out->magic_bytes = ISAAC_PGD_MAGIC_BYTES;
  out->fixed_prefix_bytes = isaac_pgd_fixed_prefix_bytes();
  out->checksum_skip_front = ISAAC_PGD_CHECKSUM_SKIP_FRONT;
  out->checksum_skip_back = ISAAC_PGD_CHECKSUM_SKIP_BACK;
  out->checksum_mode = ISAAC_PGD_CHECKSUM_MODE_CRC;
  out->checksum_seed = ISAAC_PGD_CHECKSUM_SEED;
  out->save_counter_next = u32(save_counter_in + 1u);
  out->bestiary_total = total;
  out->bestiary_cap_word = isaac_pgd_bestiary_cap_word(total);
  out->host_write_needed = 1;
}

/* ======================= ABI v2 ======================= */

/* ---------- PGDR2: reader-side section descriptors ---------- */

int32_t isaac_pgd_reader_section_desc(int32_t id,
                                      IsaacPgdReaderSectionDesc* out) {
  const ReaderRow* row = reader_row(id);
  if (row == nullptr) {
    return 0;
  }
  if (out != nullptr) {
    out->id = row->id;
    out->builtin_count = row->builtin_count;
    out->elem_width = row->elem_width;
    out->field_offset = row->field_offset;
    out->store_bound = row->store_bound;
    out->clamps_file_count = row->clamps_file_count;
    out->handler_va = row->handler_va;
    out->log_begin_va = row->log_begin_va;
    out->log_end_va = row->log_end_va;
    out->log_mismatch_va = row->log_mismatch_va;
  }
  return 1;
}

int32_t isaac_pgd_reader_dispatch_index(int32_t id) {
  if (isaac_pgd_reader_section_dispatched(id) == 0) {
    return -1;
  }
  return id - 1;
}

uint32_t isaac_pgd_reader_handler_va(int32_t id) {
  const ReaderRow* row = reader_row(id);
  return row == nullptr ? 0u : row->handler_va;
}

int32_t isaac_pgd_reader_sec9_clamp(uint32_t file_count) {
  /* `cmp eax,2 ; cmova eax, edi` with edi == 2. Unsigned above only. */
  const uint32_t limit = 2u;
  return static_cast<int32_t>(file_count > limit ? limit : file_count);
}

int32_t isaac_pgd_reader_dispatch_edi(void) {
  return 2;
}

int32_t isaac_pgd_reader_elem_byte_cursor(int32_t elem_index, int32_t width) {
  if (width != 1 && width != 4) {
    return -1;
  }
  return static_cast<int32_t>(static_cast<uint32_t>(elem_index) *
                              static_cast<uint32_t>(width));
}

uint32_t isaac_pgd_reader_elements_consumed(uint32_t file_count,
                                            uint32_t cap_word,
                                            int32_t width) {
  if (width != 1 && width != 4) {
    return 0u;
  }
  /* `test eax,eax ; je done`. A ZERO test on the whole register — the sign
     bit is irrelevant, and the loop-back below is `jb`, unsigned. v2 read
     this as a signed `<= 0` and silently returned 0 for every count with the
     sign bit set. */
  if (file_count == 0u) {
    return 0u;
  }
  if (cap_word == 0u) {
    return 0u; /* element 0 already fails `cmp 0, 0 ; jae` */
  }
  const uint32_t n = file_count;
  if (width == 1) {
    /* cursor == i, which increments by one and is compared before use, so it
       can never pass 0xfffffffe and never wraps. */
    return cap_word < n ? cap_word : n;
  }
  /* width == 4. For i < 2^30 the cursor 4*i does not wrap and is strictly
     increasing, so the first failing index is ceil(cap/4). If that index is
     2^30 or beyond, every i below 2^30 passes and the wrapped cursors from
     2^30 up (0, 4, 8, ... 0xfffffffc) are all still below such a cap, so the
     loop is bounded only by file_count. */
  const uint32_t first_fail = ((cap_word - 1u) >> 2) + 1u;
  if (first_fail >= 0x40000000u) {
    return n;
  }
  return first_fail < n ? first_fail : n;
}

uint32_t isaac_pgd_reader_elements_stored(uint32_t file_count,
                                          uint32_t cap_word,
                                          int32_t width,
                                          uint32_t store_bound) {
  const uint32_t consumed =
      isaac_pgd_reader_elements_consumed(file_count, cap_word, width);
  if (consumed == 0u) {
    return 0u;
  }
  return store_bound < consumed ? store_bound : consumed;
}

/* ---------- PGDL: fixed-section loop shape ---------- */

int32_t isaac_pgd_reader_count_enters_loop(uint32_t file_count) {
  return file_count != 0u ? 1 : 0;
}

int32_t isaac_pgd_reader_loop_back(uint32_t next_index, uint32_t file_count) {
  return next_index < file_count ? 1 : 0;
}

int32_t isaac_pgd_reader_store_normalizes(int32_t width) {
  if (width == 1) {
    return 1;
  }
  if (width == 4) {
    return 0;
  }
  return -1;
}

uint32_t isaac_pgd_reader_store_value(int32_t width, uint32_t raw) {
  if (width == 1) {
    /* `cmp byte [slot], 0 ; setg al` — the byte is compared as a SIGNED char,
       so 0x80..0xff are "not greater than zero" and land as 0. Take a wider
       parameter and mask here so the mask survives -O2. */
    const int32_t as_signed_byte =
        static_cast<int32_t>(static_cast<int8_t>(raw & 0xffu));
    return as_signed_byte > 0 ? 1u : 0u;
  }
  if (width == 4) {
    return raw; /* `mov [ecx+edi+0xdc8], eax` — verbatim, no test at all */
  }
  return 0u;
}

int32_t isaac_pgd_reader_store_offset(int32_t field_offset,
                                      uint32_t elem_index,
                                      int32_t width,
                                      uint32_t store_bound) {
  if (width != 1 && width != 4) {
    return -1;
  }
  /* `cmp idx, bound ; jae skip_store` — UNSIGNED, on the ELEMENT index. */
  if (elem_index >= store_bound) {
    return -1;
  }
  /* ...while the address uses the BYTE cursor. */
  const uint32_t byte_cursor = elem_index * static_cast<uint32_t>(width);
  return static_cast<int32_t>(static_cast<uint32_t>(field_offset) +
                              byte_cursor);
}

/* ---------- PGDN: section 11 control flow ---------- */

int32_t isaac_pgd_reader_section_uses_cap(int32_t id) {
  if (id < ISAAC_PGD_SECTION_MIN_ID || id > ISAAC_PGD_SECTION_MAX_ID) {
    return 0;
  }
  return id == ISAAC_PGD_BESTIARY_SECTION_ID ? 0 : 1;
}

int32_t isaac_pgd_bestiary_clear_slot(int32_t step) {
  /* 0x00927702 -> +0xf7c, 0x00927727 -> +0xf64, 0x0092774c -> +0xf74,
     0x00927771 -> +0xf6c. */
  static const int32_t kClearOrder[ISAAC_PGD_BESTIARY_SUBMAPS] = {3, 0, 2, 1};
  if (step < 0 || step >= ISAAC_PGD_BESTIARY_SUBMAPS) {
    return -1;
  }
  return kClearOrder[step];
}

int32_t isaac_pgd_bestiary_outer_continue(uint32_t next_index,
                                          uint32_t block_count) {
  return next_index < block_count ? 1 : 0;
}

int32_t isaac_pgd_bestiary_pair_loop_continue(int32_t next_index,
                                              int32_t pair_count) {
  return next_index < pair_count ? 1 : 0; /* `jl` — SIGNED */
}

int32_t isaac_pgd_bestiary_insert_needed(uint32_t node_marker_d,
                                         int32_t key,
                                         int32_t node_key) {
  if ((node_marker_d & 0xffu) != 0u) {
    return 1; /* `cmp byte [node+0xd],0 ; jne insert` */
  }
  return key < node_key ? 1 : 0; /* `cmp key,[node+0x10] ; jge reuse` */
}

int32_t isaac_pgd_reader_tail_reads_save_counter(void) {
  return 1;
}

/* ---------- PGDI: per-field identification status ---------- */

namespace {

struct FieldRow {
  int32_t offset;
  int32_t status;
  int32_t repr;
};

const FieldRow kFields[] = {
    {ISAAC_PGD_OFF_ACHIEVEMENTS, ISAAC_PGD_FIELD_NAMED,
     ISAAC_PGD_REPR_BOOL_BYTE},
    {ISAAC_PGD_OFF_EVENT_COUNTERS, ISAAC_PGD_FIELD_NAMED,
     ISAAC_PGD_REPR_RAW_DWORD},
    {ISAAC_PGD_OFF_ITEM_COLLECTION, ISAAC_PGD_FIELD_NAMED,
     ISAAC_PGD_REPR_BOOL_BYTE},
    {ISAAC_PGD_OFF_SEC3_DWORDS, ISAAC_PGD_FIELD_LAYOUT_ONLY,
     ISAAC_PGD_REPR_RAW_DWORD},
    {ISAAC_PGD_OFF_SEC5_BYTES, ISAAC_PGD_FIELD_LAYOUT_ONLY,
     ISAAC_PGD_REPR_BOOL_BYTE},
    {ISAAC_PGD_OFF_BOSSES, ISAAC_PGD_FIELD_NAMED, ISAAC_PGD_REPR_BOOL_BYTE},
    {ISAAC_PGD_OFF_CHALLENGES, ISAAC_PGD_FIELD_NAMED,
     ISAAC_PGD_REPR_BOOL_BYTE},
    {ISAAC_PGD_OFF_SEC8_DWORDS, ISAAC_PGD_FIELD_LAYOUT_ONLY,
     ISAAC_PGD_REPR_RAW_DWORD},
    {ISAAC_PGD_OFF_SEC9_DWORDS, ISAAC_PGD_FIELD_LAYOUT_ONLY,
     ISAAC_PGD_REPR_RAW_DWORD},
    {ISAAC_PGD_OFF_SEC10_BYTES, ISAAC_PGD_FIELD_LAYOUT_ONLY,
     ISAAC_PGD_REPR_BOOL_BYTE},
    {ISAAC_PGD_OFF_PRE_SECTION_WORD, ISAAC_PGD_FIELD_LAYOUT_ONLY,
     ISAAC_PGD_REPR_RAW_DWORD},
};

const FieldRow* find_field(int32_t offset) {
  for (size_t i = 0; i < sizeof(kFields) / sizeof(kFields[0]); ++i) {
    if (kFields[i].offset == offset) {
      return &kFields[i];
    }
  }
  return nullptr;
}

}  // namespace

int32_t isaac_pgd_field_status(int32_t field_offset) {
  const FieldRow* row = find_field(field_offset);
  return row ? row->status : ISAAC_PGD_FIELD_UNKNOWN_OFFSET;
}

int32_t isaac_pgd_field_repr(int32_t field_offset) {
  const FieldRow* row = find_field(field_offset);
  return row ? row->repr : ISAAC_PGD_REPR_NONE;
}

int32_t isaac_pgd_pre_section_word_accessor_count(void) {
  return ISAAC_PGD_PRE_SECTION_WORD_ACCESSORS;
}

/* ---------- PGDT: the second PGD transport at 0x0091adf0 ---------- */

namespace {

const IsaacPgdAltTransportField kAltTransport[ISAAC_PGD_ALT_TRANSPORT_FIELDS] =
    {
        {ISAAC_PGD_OFF_ACHIEVEMENTS, 0x282, 1, 0x282, 1, 0x0091ae37u},
        {ISAAC_PGD_OFF_EVENT_COUNTERS, 0x20b, 4, 0x82c, 0, 0x0091ae51u},
        {ISAAC_PGD_OFF_ITEM_COLLECTION, 0x2dd, 1, 0x2dd, 1, 0x0091ae61u},
        {ISAAC_PGD_OFF_SEC3_DWORDS, 0xe, 4, 0x38, 0, 0x0091ae78u},
        {ISAAC_PGD_OFF_SEC5_BYTES, 7, 1, 7, 1, 0x0091ae85u},
        {ISAAC_PGD_OFF_BOSSES, 0x68, 1, 0x68, 1, 0x0091ae95u},
        {ISAAC_PGD_OFF_SEC8_DWORDS, 0x1b, 4, 0x6c, 0, 0x0091aeacu},
        {ISAAC_PGD_OFF_CHALLENGES, 0x2e, 1, 0x2e, 1, 0x0091aeb9u},
};

}  // namespace

int32_t isaac_pgd_alt_transport_field(int32_t step,
                                      IsaacPgdAltTransportField* out) {
  if (step < 0 || step >= ISAAC_PGD_ALT_TRANSPORT_FIELDS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kAltTransport[step];
  }
  return 1;
}

int32_t isaac_pgd_alt_transport_covers(int32_t field_offset) {
  for (int32_t i = 0; i < ISAAC_PGD_ALT_TRANSPORT_FIELDS; ++i) {
    if (kAltTransport[i].field_offset == field_offset) {
      return 1;
    }
  }
  /* The bestiary map at +0xf64 is walked (0x0091aebe) but has no fixed width,
     so it is not a row of this table; it is still carried. */
  if (field_offset == ISAAC_PGD_OFF_BESTIARY) {
    return 1;
  }
  return 0;
}

/* ---------- PGDB: the bit-packed codec at 0x0091b650 ---------- */

int32_t isaac_pgd_bitpack_bytes(uint32_t count) {
  /* `shr edi,3 ; inc edi` — one byte of slack always, and 1 byte for 0. */
  return static_cast<int32_t>((count >> 3) + 1u);
}

int32_t isaac_pgd_bitpack_bit(const uint8_t* packed,
                              uint32_t count,
                              uint32_t index) {
  if (packed == nullptr || index >= count) {
    return 0;
  }
  const uint32_t mask = 1u << (index & 7u); /* `mov al,1` then `rol al,1` */
  return (packed[index >> 3] & mask) != 0u ? 1 : 0;
}

uint32_t isaac_pgd_bitpack_unpack(const uint8_t* packed,
                                  uint32_t count,
                                  uint8_t* out) {
  if (count == 0u) {
    return 0u; /* `test esi,esi ; je` — the memset ran with length 0 */
  }
  if (packed == nullptr || out == nullptr) {
    return 0u;
  }
  for (uint32_t i = 0u; i < count; ++i) {
    out[i] = 0u; /* memset(dst, 0, n) at 0x0091b6a7 */
  }
  for (uint32_t i = 0u; i < count; ++i) {
    const uint32_t mask = 1u << (i & 7u);
    out[i] = (packed[i >> 3] & mask) != 0u ? 1u : 0u; /* `setne` */
  }
  return count;
}

/* ---------- PGDA: what pgd+0x02 gates ---------- */

int32_t isaac_pgd_notify_logs(uint32_t flag_02) {
  return (flag_02 & 0xffu) != 0u ? 1 : 0;
}

int32_t isaac_pgd_notify_dispatches(uint32_t flag_02, uint32_t enable_global) {
  if (isaac_pgd_notify_logs(flag_02) == 0) {
    return 0;
  }
  /* `test byte ptr [0xc5ab08], 1` — a LOW-BIT test on one byte. */
  return ((enable_global & 0xffu) &
          static_cast<uint32_t>(ISAAC_PGD_NOTIFY_ENABLE_MASK)) != 0u
             ? 1
             : 0;
}

/* ---------- PGDR: the two restore index remaps ---------- */

namespace {

/* Both tables carry ONE guard entry past their last real arm, holding
   ISAAC_PGD_REMAP_GUARD_VALUE — a value neither law can ever produce.

   The window predicate below can never reach it: every argument it accepts is
   1..max_input. The guard exists so that an off-by-one in that predicate is a
   DEFINED, observable wrong answer instead of an out-of-bounds read. Without
   it a widened window is undefined behaviour, which no differential can
   reliably catch — a mutant doing exactly that survived the v4 suite until
   these guards were added. The suite asserts no argument ever returns it. */

/* Literal transcription of the jump table at 0x009e4fcc, index 0 being the
   default arm the `dec`/`ja` pair routes argument 0 to. Entry 10 points at
   0x009e4fc9, which IS the default arm — that is the aliasing defect, and it
   is transcribed rather than smoothed. */
const int32_t kSec3RestoreRemap[ISAAC_PGD_SEC3_REMAP_MAX_INPUT + 2] = {
    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 0, 11, ISAAC_PGD_REMAP_GUARD_VALUE};

/* Literal transcription of the jump table at 0x009e40e8, same convention. */
const int32_t kEventRestoreRemap[ISAAC_PGD_EVENT_REMAP_MAX_INPUT + 2] = {
    0,   1,   2,   3,   5,   6,   7,   8,   9,   10,  11,  12,
    13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,
    25,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,
    37,  41,  42,  43,  44,  45,  46,  47,  48,  49,  50,  51,
    55,  56,  57,  58,  59,  60,  61,  62,  63,  64,  65,  69,
    70,  71,  72,  73,  74,  75,  76,  77,  78,  79,  83,  84,
    85,  86,  87,  88,  89,  90,  91,  92,  93,  97,  98,  99,
    100, 101, 102, 103, 104, 105, 106, 107, 111, 112, 113,
    ISAAC_PGD_REMAP_GUARD_VALUE};

/* `dec ecx ; cmp ecx, bound ; ja default` — the compare is UNSIGNED on the
   decremented value, so 0 and every negative argument take the default. */
int32_t remap_lookup(const int32_t* table,
                     int32_t max_input,
                     int32_t index) {
  const uint32_t biased = static_cast<uint32_t>(index) - 1u;
  if (biased > static_cast<uint32_t>(max_input - 1)) {
    return 0;
  }
  return table[index];
}

int32_t restore_slot(const int32_t* table,
                     int32_t max_input,
                     int32_t iterations,
                     int32_t iteration) {
  if (iteration < 0 || iteration >= iterations) {
    return -1;
  }
  return remap_lookup(table, max_input, iteration);
}

int32_t restore_writers(const int32_t* table,
                        int32_t max_input,
                        int32_t iterations,
                        int32_t slot) {
  int32_t n = 0;
  for (int32_t i = 0; i < iterations; ++i) {
    if (remap_lookup(table, max_input, i) == slot) {
      ++n;
    }
  }
  return n;
}

int32_t restore_winner(const int32_t* table,
                       int32_t max_input,
                       int32_t iterations,
                       int32_t slot) {
  /* Both stores are unconditional and the loop ascends, so the last writer is
     the one whose value survives. */
  int32_t winner = -1;
  for (int32_t i = 0; i < iterations; ++i) {
    if (remap_lookup(table, max_input, i) == slot) {
      winner = i;
    }
  }
  return winner;
}

}  // namespace

int32_t isaac_pgd_sec3_restore_remap(int32_t index) {
  return remap_lookup(kSec3RestoreRemap, ISAAC_PGD_SEC3_REMAP_MAX_INPUT,
                      index);
}

int32_t isaac_pgd_event_restore_remap(int32_t index) {
  return remap_lookup(kEventRestoreRemap, ISAAC_PGD_EVENT_REMAP_MAX_INPUT,
                      index);
}

/* ---------- PGDRA: the two restore loops ---------- */

int32_t isaac_pgd_sec3_restore_loop_continue(int32_t next_iteration) {
  return next_iteration < ISAAC_PGD_SEC3_RESTORE_ITERATIONS ? 1 : 0;
}

int32_t isaac_pgd_event_restore_loop_continue(int32_t next_iteration) {
  return next_iteration < ISAAC_PGD_EVENT_RESTORE_ITERATIONS ? 1 : 0;
}

int32_t isaac_pgd_sec3_restore_slot(int32_t iteration) {
  return restore_slot(kSec3RestoreRemap, ISAAC_PGD_SEC3_REMAP_MAX_INPUT,
                      ISAAC_PGD_SEC3_RESTORE_ITERATIONS, iteration);
}

int32_t isaac_pgd_event_restore_slot(int32_t iteration) {
  return restore_slot(kEventRestoreRemap, ISAAC_PGD_EVENT_REMAP_MAX_INPUT,
                      ISAAC_PGD_EVENT_RESTORE_ITERATIONS, iteration);
}

int32_t isaac_pgd_sec3_restore_writers(int32_t slot) {
  return restore_writers(kSec3RestoreRemap, ISAAC_PGD_SEC3_REMAP_MAX_INPUT,
                         ISAAC_PGD_SEC3_RESTORE_ITERATIONS, slot);
}

int32_t isaac_pgd_event_restore_writers(int32_t slot) {
  return restore_writers(kEventRestoreRemap, ISAAC_PGD_EVENT_REMAP_MAX_INPUT,
                         ISAAC_PGD_EVENT_RESTORE_ITERATIONS, slot);
}

int32_t isaac_pgd_sec3_restore_slot_written(int32_t slot) {
  return isaac_pgd_sec3_restore_writers(slot) > 0 ? 1 : 0;
}

int32_t isaac_pgd_event_restore_slot_written(int32_t slot) {
  return isaac_pgd_event_restore_writers(slot) > 0 ? 1 : 0;
}

int32_t isaac_pgd_sec3_restore_winning_iteration(int32_t slot) {
  return restore_winner(kSec3RestoreRemap, ISAAC_PGD_SEC3_REMAP_MAX_INPUT,
                        ISAAC_PGD_SEC3_RESTORE_ITERATIONS, slot);
}

int32_t isaac_pgd_event_restore_winning_iteration(int32_t slot) {
  return restore_winner(kEventRestoreRemap, ISAAC_PGD_EVENT_REMAP_MAX_INPUT,
                        ISAAC_PGD_EVENT_RESTORE_ITERATIONS, slot);
}

int32_t isaac_pgd_sec3_restore_store_offset(int32_t iteration) {
  const int32_t slot = isaac_pgd_sec3_restore_slot(iteration);
  if (slot < 0) {
    return -1;
  }
  /* `mov [edi + eax*4 + 0xdc8], edx` */
  return ISAAC_PGD_OFF_SEC3_DWORDS + slot * 4;
}

int32_t isaac_pgd_event_restore_store_offset(int32_t iteration) {
  const int32_t slot = isaac_pgd_event_restore_slot(iteration);
  if (slot < 0) {
    return -1;
  }
  /* `mov [edi + eax*4 + 0x2bc], edx` */
  return ISAAC_PGD_OFF_EVENT_COUNTERS + slot * 4;
}

/* ---------- PGDM: section 11 sub-block decode ---------- */

int32_t isaac_pgd_bestiary_slot_from_tag(int32_t tag) {
  /* `dec eax ; cmp eax, 3 ; ja skip` — unsigned. */
  const uint32_t biased = static_cast<uint32_t>(tag) - 1u;
  if (biased > 3u) {
    return -1;
  }
  return static_cast<int32_t>(biased);
}

uint32_t isaac_pgd_bestiary_tag_handler_va(int32_t tag) {
  const int32_t slot = isaac_pgd_bestiary_slot_from_tag(tag);
  return slot < 0 ? 0u : kBestiaryTagHandlers[slot];
}

uint32_t isaac_pgd_bestiary_map_root_off(int32_t slot) {
  if (slot < 0 || slot >= ISAAC_PGD_BESTIARY_SUBMAPS) {
    return 0u;
  }
  return kBestiaryRootOff[slot];
}

uint32_t isaac_pgd_bestiary_map_count_off(int32_t slot) {
  if (slot < 0 || slot >= ISAAC_PGD_BESTIARY_SUBMAPS) {
    return 0u;
  }
  return kBestiaryCountOff[slot];
}

int32_t isaac_pgd_bestiary_pair_count_from_size(int32_t size_word) {
  if (size_word <= 0) {
    return -1; /* `test eax,eax ; jle done` — signed */
  }
  return static_cast<int32_t>(static_cast<uint32_t>(size_word) >> 2);
}

int32_t isaac_pgd_bestiary_pair_payload_bytes(int32_t pair_count) {
  return static_cast<int32_t>(static_cast<uint32_t>(pair_count) *
                              static_cast<uint32_t>(
                                  ISAAC_PGD_BESTIARY_PAIR_BYTES));
}

int32_t isaac_pgd_bestiary_size_word_from_pairs(int32_t pair_count) {
  return static_cast<int32_t>(static_cast<uint32_t>(pair_count) << 2);
}

/* ---------- PGDX: indexed mutators ---------- */

int32_t isaac_pgd_sec5_index_remap(int32_t id) {
  if (static_cast<uint32_t>(id) >
      static_cast<uint32_t>(ISAAC_PGD_SEC5_ID_MAX)) {
    return -1; /* warn path */
  }
  const uint32_t biased =
      static_cast<uint32_t>(id) - static_cast<uint32_t>(ISAAC_PGD_SEC5_REMAP_BASE);
  if (biased <= static_cast<uint32_t>(ISAAC_PGD_SEC5_REMAP_SPAN)) {
    return static_cast<int32_t>(biased);
  }
  if (id == ISAAC_PGD_SEC5_ALIAS_ID) {
    return ISAAC_PGD_SEC5_REMAP_SPAN;
  }
  if (id > ISAAC_PGD_SEC5_REMAP_SPAN) {
    return -1; /* signed `jg`; only id 15 reaches here */
  }
  return id;
}

int32_t isaac_pgd_sec5_out_of_range(int32_t id) {
  return static_cast<uint32_t>(id) >
                 static_cast<uint32_t>(ISAAC_PGD_SEC5_ID_MAX)
             ? 1
             : 0;
}

int32_t isaac_pgd_sec5_store_slot(uint32_t readonly, int32_t id) {
  if ((readonly & 0xffu) != 0u) {
    return -1;
  }
  return isaac_pgd_sec5_index_remap(id);
}

int32_t isaac_pgd_sec5_all_set(const uint8_t* slots, int32_t count) {
  if (slots == nullptr || count < ISAAC_PGD_SEC5_SLOTS) {
    return 0;
  }
  for (int32_t i = 0; i < ISAAC_PGD_SEC5_SLOTS; ++i) {
    if (slots[i] == 0u) {
      return 0;
    }
  }
  return 1;
}

int32_t isaac_pgd_sec10_store_slot(uint32_t readonly, int32_t id) {
  if ((readonly & 0xffu) != 0u) {
    return -1;
  }
  return id; /* no bounds check whatsoever in the PE */
}

int32_t isaac_pgd_sec10_resets_slot0(void) {
  return 1;
}

int32_t isaac_pgd_sec10_store_is_self_cancelling(uint32_t readonly,
                                                 int32_t id) {
  if (isaac_pgd_sec10_store_slot(readonly, id) < 0) {
    return 0;
  }
  return id == 0 ? 1 : 0;
}

/* ---------- PGDK: 41-bit popcount gate ---------- */

int32_t isaac_pgd_mask41_popcount(uint32_t lo, uint32_t hi) {
  int32_t n = 0;
  for (int32_t i = 0; i < ISAAC_PGD_MASK41_BITS; ++i) {
    const uint32_t bit = 1u << (static_cast<uint32_t>(i) & 31u);
    const uint32_t lo_hit = i < 32 ? (lo & bit) : 0u;
    const uint32_t hi_hit = i >= 32 ? (hi & bit) : 0u;
    if ((lo_hit | hi_hit) != 0u) {
      n += 1;
    }
  }
  return n;
}

int32_t isaac_pgd_mask41_unlock_needed(int32_t popcount) {
  return popcount >= ISAAC_PGD_MASK41_UNLOCK_THRESHOLD ? 1 : 0;
}

uint32_t isaac_pgd_mask41_hi_mask(void) {
  uint32_t mask = 0u;
  for (int32_t i = 32; i < ISAAC_PGD_MASK41_BITS; ++i) {
    mask |= 1u << (static_cast<uint32_t>(i) & 31u);
  }
  return mask;
}


/* ======================= ABI v6 ======================= */

/* ---------- PGDCOV: TryImportRebirthLocalSave restore coverage ---------- */

namespace {

/* 23 raw block copies + the two remap loops, in PE execution order. Each
   row is transcribed from the instruction stream (VAs in the header):

   step 0  : rep movsd(0x2c) + movsw + movsb  src 0x38  dst 0x38  179
             (the movsw/movsb at 0x0092b5f7/0x0092b5f9 are SINGLE element
             copies — bytes 66 a5 / a4, no f3 rep prefix)
   step 1..5  : bosses 0xe07/0xe17/0xe27/0xe37/0xe3f from 0x3fb/0x40b/
             0x41b/0x42b/0x433 (movups x3, movq, mov byte)
   step 6..8  : challenges 0xe6f/0xe7f/0xe83 from 0x434/0x444/0x448
   step 9  : collection 0xae8 from 0x268, rep movsd(0x56) + movsw + movsb
             = 347 bytes (ecx = 0x56 was scheduled at 0x0092b5f2)
   step 10 : event remap loop, 0x5f iterations, src dwords 0xec.., dst
             dwords at +0x2bc via 0x009e3ea0
   step 11..15 : sec8 0xea0..0xee0 from 0x44c..0x48c (five movups)
   step 16..22 : sec5 0xe00..0xe06 from 0x3f4..0x3fa (seven byte moves)
   step 23 : sec9 dword 0 at 0xf0c from 0x49c (mov dword)
   step 24 : sec3 remap loop, 0xc iterations, src dwords 0x3c4.., dst
             dwords at +0xdc8 via 0x009e4f80
*/
const IsaacPgdImportCopy kImportRows[ISAAC_PGD_IMPORT_COPY_ROWS] = {
    {0, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x38, ISAAC_PGD_OFF_ACHIEVEMENTS,
     ISAAC_PGD_IMPORT_WRITTEN_ACHIEVEMENTS, 0x0092b5edu, 0},
    {1, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3fb, ISAAC_PGD_OFF_BOSSES, 0x10,
     0x0092b5fau, 0},
    {2, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x40b, ISAAC_PGD_OFF_BOSSES + 0x10, 0x10,
     0x0092b614u, 0},
    {3, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x41b, ISAAC_PGD_OFF_BOSSES + 0x20, 0x10,
     0x0092b622u, 0},
    {4, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x42b, ISAAC_PGD_OFF_BOSSES + 0x30, 0x8,
     0x0092b631u, 0},
    {5, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x433, ISAAC_PGD_OFF_BOSSES + 0x38, 0x1,
     0x0092b640u, 0},
    {6, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x434, ISAAC_PGD_OFF_CHALLENGES, 0x10,
     0x0092b64cu, 0},
    {7, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x444, ISAAC_PGD_OFF_CHALLENGES + 0x10,
     0x4, 0x0092b653u, 0},
    {8, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x448, ISAAC_PGD_OFF_CHALLENGES + 0x14,
     0x1, 0x0092b65fu, 0},
    {9, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x268, ISAAC_PGD_OFF_ITEM_COLLECTION,
     ISAAC_PGD_IMPORT_WRITTEN_COLLECTION, 0x0092b665u, 0},
    {10, ISAAC_PGD_IMPORT_KIND_REMAP_EVENT, 0xec, ISAAC_PGD_OFF_EVENT_COUNTERS,
     ISAAC_PGD_IMPORT_WRITTEN_EVENT, 0x0092b670u,
     ISAAC_PGD_EVENT_RESTORE_ITERATIONS},
    {11, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x44c, ISAAC_PGD_OFF_SEC8_DWORDS, 0x10,
     0x0092b69au, 0},
    {12, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x45c, ISAAC_PGD_OFF_SEC8_DWORDS + 0x10,
     0x10, 0x0092b6a8u, 0},
    {13, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x46c, ISAAC_PGD_OFF_SEC8_DWORDS + 0x20,
     0x10, 0x0092b6b6u, 0},
    {14, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x47c, ISAAC_PGD_OFF_SEC8_DWORDS + 0x30,
     0x10, 0x0092b6c1u, 0},
    {15, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x48c, ISAAC_PGD_OFF_SEC8_DWORDS + 0x40,
     0x10, 0x0092b6ccu, 0},
    {16, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3f4, ISAAC_PGD_OFF_SEC5_BYTES, 0x1,
     0x0092b6d3u, 0},
    {17, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3f5, ISAAC_PGD_OFF_SEC5_BYTES + 1, 0x1,
     0x0092b6dfu, 0},
    {18, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3f6, ISAAC_PGD_OFF_SEC5_BYTES + 2, 0x1,
     0x0092b6ebu, 0},
    {19, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3f7, ISAAC_PGD_OFF_SEC5_BYTES + 3, 0x1,
     0x0092b6f7u, 0},
    {20, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3f8, ISAAC_PGD_OFF_SEC5_BYTES + 4, 0x1,
     0x0092b703u, 0},
    {21, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3f9, ISAAC_PGD_OFF_SEC5_BYTES + 5, 0x1,
     0x0092b70fu, 0},
    {22, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x3fa, ISAAC_PGD_OFF_SEC5_BYTES + 6, 0x1,
     0x0092b71bu, 0},
    {23, ISAAC_PGD_IMPORT_KIND_BLOCK, 0x49c, ISAAC_PGD_OFF_SEC9_DWORDS, 0x4,
     0x0092b724u, 0},
    {24, ISAAC_PGD_IMPORT_KIND_REMAP_SEC3, 0x3c4, ISAAC_PGD_OFF_SEC3_DWORDS,
     ISAAC_PGD_IMPORT_WRITTEN_SEC3, 0x0092b730u,
     ISAAC_PGD_SEC3_RESTORE_ITERATIONS},
};

struct ImportFieldRow {
  int32_t field_offset;
  int32_t written_bytes;
  int32_t width;       /* element width for element_written */
  int32_t uses_remap;  /* 1 event/sec3, 0 blocks */
  int32_t total_bytes; /* array extent in the object */
};

const ImportFieldRow kImportFields[] = {
    {ISAAC_PGD_OFF_ACHIEVEMENTS, ISAAC_PGD_IMPORT_WRITTEN_ACHIEVEMENTS, 1, 0,
     ISAAC_PGD_COUNT_ACHIEVEMENTS * 1},
    {ISAAC_PGD_OFF_EVENT_COUNTERS, ISAAC_PGD_IMPORT_WRITTEN_EVENT, 4, 1,
     ISAAC_PGD_COUNT_EVENT_COUNTERS * 4},
    {ISAAC_PGD_OFF_ITEM_COLLECTION, ISAAC_PGD_IMPORT_WRITTEN_COLLECTION, 1, 0,
     ISAAC_PGD_COUNT_ITEM_COLLECTION * 1},
    {ISAAC_PGD_OFF_SEC3_DWORDS, ISAAC_PGD_IMPORT_WRITTEN_SEC3, 4, 1,
     ISAAC_PGD_COUNT_SEC3 * 4},
    {ISAAC_PGD_OFF_SEC5_BYTES, ISAAC_PGD_IMPORT_WRITTEN_SEC5, 1, 0,
     ISAAC_PGD_COUNT_SEC5 * 1},
    {ISAAC_PGD_OFF_BOSSES, ISAAC_PGD_IMPORT_WRITTEN_BOSSES, 1, 0,
     ISAAC_PGD_COUNT_BOSSES * 1},
    {ISAAC_PGD_OFF_CHALLENGES, ISAAC_PGD_IMPORT_WRITTEN_CHALLENGES, 1, 0,
     ISAAC_PGD_COUNT_CHALLENGES * 1},
    {ISAAC_PGD_OFF_SEC8_DWORDS, ISAAC_PGD_IMPORT_WRITTEN_SEC8, 4, 0,
     ISAAC_PGD_COUNT_SEC8 * 4},
    {ISAAC_PGD_OFF_SEC9_DWORDS, ISAAC_PGD_IMPORT_WRITTEN_SEC9, 4, 0,
     ISAAC_PGD_COUNT_SEC9 * 4},
    /* census negatives: known arrays the import never writes */
    {ISAAC_PGD_OFF_SEC10_BYTES, 0, 1, 0, ISAAC_PGD_COUNT_SEC10 * 1},
    {ISAAC_PGD_OFF_BESTIARY, 0, 1, 0, ISAAC_PGD_OFF_PRE_SECTION_WORD -
                                         ISAAC_PGD_OFF_BESTIARY},
};

const ImportFieldRow* import_field(int32_t field_offset) {
  for (size_t i = 0; i < sizeof(kImportFields) / sizeof(kImportFields[0]);
       ++i) {
    if (kImportFields[i].field_offset == field_offset) {
      return &kImportFields[i];
    }
  }
  return nullptr;
}

}  // namespace

int32_t isaac_pgd_import_copy_count(void) {
  return ISAAC_PGD_IMPORT_COPY_ROWS;
}

int32_t isaac_pgd_import_copy_record(int32_t step,
                                     IsaacPgdImportCopy* out) {
  if (step < 0 || step >= ISAAC_PGD_IMPORT_COPY_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kImportRows[step];
  }
  return 1;
}

int32_t isaac_pgd_import_field_written(int32_t field_offset) {
  const ImportFieldRow* row = import_field(field_offset);
  return row == nullptr || row->written_bytes == 0 ? 0 : 1;
}

int32_t isaac_pgd_import_written_byte_count(int32_t field_offset) {
  const ImportFieldRow* row = import_field(field_offset);
  return row == nullptr ? 0 : row->written_bytes;
}

int32_t isaac_pgd_import_element_written(int32_t field_offset,
                                         int32_t elem_index) {
  const ImportFieldRow* row = import_field(field_offset);
  if (row == nullptr) {
    return -1;
  }
  if (row->uses_remap != 0) {
    /* The v4 restore-slot laws use the same iteration bounds. */
    if (field_offset == ISAAC_PGD_OFF_EVENT_COUNTERS) {
      return isaac_pgd_event_restore_slot_written(elem_index);
    }
    return isaac_pgd_sec3_restore_slot_written(elem_index);
  }
  if (row->written_bytes == 0) {
    return 0;
  }
  const uint32_t written_elements =
      static_cast<uint32_t>(row->written_bytes) /
      static_cast<uint32_t>(row->width);
  /* `jge`/`jae` on the caller side is not in the PE — this helper answers a
     pure question; a negative or oversized index is simply not written. */
  return static_cast<uint32_t>(elem_index) < written_elements ? 1 : 0;
}

int32_t isaac_pgd_import_stale_byte_count(int32_t field_offset) {
  const ImportFieldRow* row = import_field(field_offset);
  if (row == nullptr) {
    return -1;
  }
  return row->total_bytes - row->written_bytes;
}

int32_t isaac_pgd_import_uses_remap(int32_t field_offset) {
  const ImportFieldRow* row = import_field(field_offset);
  if (row == nullptr) {
    return -1;
  }
  return row->uses_remap;
}

int32_t isaac_pgd_import_normalizes(int32_t field_offset) {
  /* Every copy in the function is a raw mov — no setg/setne anywhere in
     the 0x0092b5d5..0x0092b749 block. */
  return import_field(field_offset) == nullptr ? -1 : 0;
}

int32_t isaac_pgd_import_tail_has_array_stores(void) {
  /* Negative census (law-fixed at v7): the LAST array store in
     0x0092b5d5..0x0092b749 is the sec3 dword-row loop store
     `mov [edi+eax*4+0xdc8], edx` at 0x0092b73f (loop head 0x0092b730).
     Past the loop (0x0092b74b+) the only object stores are
     `mov byte [edi],1/0` (pgd+0, the changesmade flag) at
     0x0092b752/0x0092b790 and the game-global +0x2a378 save/restore.
     (v6 pinned the +0xf0c dword at 0x0092b724 as the last store; the
     disasm shows the sec3 loop then stores dwords of +0xdc8 past that
     address, so the v6 pin was wrong.) */
  return 0;
}

uint32_t isaac_pgd_import_snapshot_bytes(void) {
  return ISAAC_PGD_IMPORT_SNAPSHOT_BYTES;
}


/* ---------- PGDEX: the sibling import 0x0092b930 (ABI v7) ---------- */

/* 31 rows in PE execution order, transcribed from
   section-notes/pgd-v7/disasm-92b930-full.txt. Sources are ebp
   displacements with base ebp-0x700 (snapshot `lea -0x700(%ebp)` into the
   reader); dests are the store displacements; VAs are the store
   instruction (or the remap loop head). Row 13 is the only remap row:
   iteration i reads snapshot dword [0x150 + i*4] and stores it at slot
   remap(i) of +0x2bc (remap law below). All 30 block rows are raw copies
   (movups/movq/movl/movw/movb/rep movsd + movsw + movsb) — no
   normalisation anywhere in the restore. */
const IsaacPgdSiblingCopy kSiblingRows[ISAAC_PGD_SIBLING_COPY_ROWS] = {
    {0, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x038, ISAAC_PGD_OFF_ACHIEVEMENTS,
     ISAAC_PGD_SIBLING_WRITTEN_ACHIEVEMENTS, 0x0092ba40u, 0},
    {1, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5cb, ISAAC_PGD_OFF_BOSSES, 0x10,
     0x0092ba48u, 0},
    {2, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5db, ISAAC_PGD_OFF_BOSSES + 0x10, 0x10,
     0x0092ba62u, 0},
    {3, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5eb, ISAAC_PGD_OFF_BOSSES + 0x20, 0x10,
     0x0092ba70u, 0},
    {4, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5fb, ISAAC_PGD_OFF_BOSSES + 0x30, 0x10,
     0x0092ba7eu, 0},
    {5, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x60b, ISAAC_PGD_OFF_BOSSES + 0x40, 0x2,
     0x0092ba85u, 0},
    {6, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x60d, ISAAC_PGD_OFF_BOSSES + 0x42, 0x1,
     0x0092ba99u, 0},
    {7, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x60e, ISAAC_PGD_OFF_CHALLENGES, 0x10,
     0x0092baa5u, 0},
    {8, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x61e, ISAAC_PGD_OFF_CHALLENGES + 0x10,
     0x8, 0x0092bab4u, 0},
    {9, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x626, ISAAC_PGD_OFF_CHALLENGES + 0x18,
     0x4, 0x0092babcu, 0},
    {10, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x62a, ISAAC_PGD_OFF_CHALLENGES + 0x1c,
     0x2, 0x0092bac9u, 0},
    {11, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x62c, ISAAC_PGD_OFF_CHALLENGES + 0x1e,
     0x1, 0x0092bad6u, 0},
    {12, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x3d8, ISAAC_PGD_OFF_ITEM_COLLECTION,
     ISAAC_PGD_SIBLING_WRITTEN_COLLECTION, 0x0092badeu, 0},
    {13, ISAAC_PGD_SIBLING_KIND_REMAP_EVENT, 0x150, ISAAC_PGD_OFF_EVENT_COUNTERS,
     ISAAC_PGD_SIBLING_WRITTEN_EVENT, 0x0092bae8u,
     ISAAC_PGD_SIBLING_EVENT_RESTORE_ITERATIONS},
    {14, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x630, ISAAC_PGD_OFF_SEC8_DWORDS, 0x10,
     0x0092bb15u, 0},
    {15, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x640, ISAAC_PGD_OFF_SEC8_DWORDS + 0x10,
     0x10, 0x0092bb23u, 0},
    {16, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x650, ISAAC_PGD_OFF_SEC8_DWORDS + 0x20,
     0x10, 0x0092bb31u, 0},
    {17, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x660, ISAAC_PGD_OFF_SEC8_DWORDS + 0x30,
     0x10, 0x0092bb3fu, 0},
    {18, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x670, ISAAC_PGD_OFF_SEC8_DWORDS + 0x40,
     0x10, 0x0092bb4du, 0},
    {19, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x680, ISAAC_PGD_OFF_SEC8_DWORDS + 0x50,
     0x8, 0x0092bb59u, 0},
    {20, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5c4, ISAAC_PGD_OFF_SEC5_BYTES, 0x1,
     0x0092bb68u, 0},
    {21, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5c5, ISAAC_PGD_OFF_SEC5_BYTES + 1, 0x1,
     0x0092bb74u, 0},
    {22, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5c6, ISAAC_PGD_OFF_SEC5_BYTES + 2, 0x1,
     0x0092bb80u, 0},
    {23, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5c7, ISAAC_PGD_OFF_SEC5_BYTES + 3, 0x1,
     0x0092bb8cu, 0},
    {24, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5c8, ISAAC_PGD_OFF_SEC5_BYTES + 4, 0x1,
     0x0092bb98u, 0},
    {25, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5c9, ISAAC_PGD_OFF_SEC5_BYTES + 5, 0x1,
     0x0092bba4u, 0},
    {26, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5ca, ISAAC_PGD_OFF_SEC5_BYTES + 6, 0x1,
     0x0092bbb0u, 0},
    {27, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x688, ISAAC_PGD_OFF_SEC9_DWORDS, 0x4,
     0x0092bbb96u == 0x92bbb9u ? 0x0092bbb9u : 0x0092bbb9u, 0},
    {28, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x594, ISAAC_PGD_OFF_SEC3_DWORDS, 0x10,
     0x0092bbc4u, 0},
    {29, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5a4, ISAAC_PGD_OFF_SEC3_DWORDS + 0x10,
     0x10, 0x0092bbd2u, 0},
    {30, ISAAC_PGD_SIBLING_KIND_BLOCK, 0x5b4, ISAAC_PGD_OFF_SEC3_DWORDS + 0x20,
     0x10, 0x0092bbe0u, 0},
};

/* The ten output holes of the event remap, verified ARM-BY-ARM from the
   161-entry jump table at 0x0041e190: the arms' slot constants are
   ascending 1,2,3,5,6,...,0xab — each missing slot (a skipped constant)
   is a hole for the order-preserving law. The running-skip closed form
   below reproduces every arm value; the model implements the same law as
   a slot-index rank list (see pgd-pure-model.mjs), so a transcription
   slip on any hole diverges both sides. */
static const int32_t kSiblingEventRemapHoles[10] = {
    0x4, 0x28, 0x36, 0x44, 0x52, 0x60, 0x6e, 0x81, 0x8f, 0x9d};

/* Per-array census rows for the sibling import. total_bytes uses the same
   array extents as the PGDCOV census. */
const ImportFieldRow kSiblingFields[] = {
    {ISAAC_PGD_OFF_ACHIEVEMENTS, ISAAC_PGD_SIBLING_WRITTEN_ACHIEVEMENTS, 1, 0,
     ISAAC_PGD_COUNT_ACHIEVEMENTS},
    {ISAAC_PGD_OFF_EVENT_COUNTERS, ISAAC_PGD_SIBLING_WRITTEN_EVENT, 4, 1,
     ISAAC_PGD_COUNT_EVENT_COUNTERS * 4},
    {ISAAC_PGD_OFF_ITEM_COLLECTION, ISAAC_PGD_SIBLING_WRITTEN_COLLECTION, 1, 0,
     ISAAC_PGD_COUNT_ITEM_COLLECTION},
    {ISAAC_PGD_OFF_SEC3_DWORDS, ISAAC_PGD_SIBLING_WRITTEN_SEC3, 4, 0,
     ISAAC_PGD_COUNT_SEC3 * 4},
    {ISAAC_PGD_OFF_SEC5_BYTES, ISAAC_PGD_SIBLING_WRITTEN_SEC5, 1, 0,
     ISAAC_PGD_COUNT_SEC5},
    {ISAAC_PGD_OFF_BOSSES, ISAAC_PGD_SIBLING_WRITTEN_BOSSES, 1, 0,
     ISAAC_PGD_COUNT_BOSSES},
    {ISAAC_PGD_OFF_CHALLENGES, ISAAC_PGD_SIBLING_WRITTEN_CHALLENGES, 1, 0,
     ISAAC_PGD_COUNT_CHALLENGES},
    {ISAAC_PGD_OFF_SEC8_DWORDS, ISAAC_PGD_SIBLING_WRITTEN_SEC8, 4, 0,
     ISAAC_PGD_COUNT_SEC8 * 4},
    {ISAAC_PGD_OFF_SEC9_DWORDS, ISAAC_PGD_SIBLING_WRITTEN_SEC9, 4, 0,
     ISAAC_PGD_COUNT_SEC9 * 4},
    /* census negatives: known layout arrays the sibling never writes */
    {ISAAC_PGD_OFF_SEC10_BYTES, 0, 1, 0, ISAAC_PGD_COUNT_SEC10},
    {ISAAC_PGD_OFF_BESTIARY, 0, 1, 0,
     ISAAC_PGD_OFF_PRE_SECTION_WORD - ISAAC_PGD_OFF_BESTIARY},
};

const ImportFieldRow* sibling_field(int32_t field_offset) {
  for (size_t i = 0; i < sizeof(kSiblingFields) / sizeof(kSiblingFields[0]);
       ++i) {
    if (kSiblingFields[i].field_offset == field_offset) {
      return &kSiblingFields[i];
    }
  }
  return nullptr;
}

int32_t isaac_pgd_sibling_event_remap(int32_t index) {
  /* 0x0041ddb0: `dec ecx; cmp ecx,0xa0; ja default; jmp [table+ecx*4]`.
     Input 0 -> default (0); inputs 1..0xa1 -> table arm values; inputs
     past 0xa1 -> default (0) because dec lands past the bound. */
  if (index < 1 || index > ISAAC_PGD_SIBLING_EVENT_REMAP_MAX_INPUT) {
    return 0;
  }
  int32_t slot = index;
  for (size_t i = 0; i < 10; ++i) {
    if (slot >= kSiblingEventRemapHoles[i]) {
      ++slot;
    }
  }
  return slot;
}

int32_t isaac_pgd_sibling_copy_count(void) {
  return ISAAC_PGD_SIBLING_COPY_ROWS;
}

int32_t isaac_pgd_sibling_copy_record(int32_t step,
                                      IsaacPgdSiblingCopy* out) {
  if (step < 0 || step >= ISAAC_PGD_SIBLING_COPY_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kSiblingRows[step];
  }
  return 1;
}

int32_t isaac_pgd_sibling_field_written(int32_t field_offset) {
  const ImportFieldRow* row = sibling_field(field_offset);
  return row == nullptr || row->written_bytes == 0 ? 0 : 1;
}

int32_t isaac_pgd_sibling_written_byte_count(int32_t field_offset) {
  const ImportFieldRow* row = sibling_field(field_offset);
  return row == nullptr ? 0 : row->written_bytes;
}

int32_t isaac_pgd_sibling_element_written(int32_t field_offset,
                                          int32_t elem_index) {
  const ImportFieldRow* row = sibling_field(field_offset);
  if (row == nullptr) {
    return -1;
  }
  if (field_offset == ISAAC_PGD_OFF_EVENT_COUNTERS) {
    /* image of remap over inputs 0..0xa1 = [0..0xab] minus the holes */
    if (elem_index < 0 || elem_index > ISAAC_PGD_SIBLING_EVENT_REMAP_MAX_SLOT) {
      return 0;
    }
    for (size_t i = 0; i < 10; ++i) {
      if (kSiblingEventRemapHoles[i] == elem_index) {
        return 0;
      }
    }
    return 1;
  }
  if (row->written_bytes == 0) {
    return 0;
  }
  const uint32_t written_elements =
      static_cast<uint32_t>(row->written_bytes) /
      static_cast<uint32_t>(row->width);
  /* `jge`/`jae` on the caller side is not in the PE — this helper answers a
     pure question; a negative or oversized index is simply not written. */
  return static_cast<uint32_t>(elem_index) < written_elements ? 1 : 0;
}

int32_t isaac_pgd_sibling_stale_byte_count(int32_t field_offset) {
  const ImportFieldRow* row = sibling_field(field_offset);
  if (row == nullptr) {
    return -1;
  }
  return row->total_bytes - row->written_bytes;
}

int32_t isaac_pgd_sibling_uses_remap(int32_t field_offset) {
  const ImportFieldRow* row = sibling_field(field_offset);
  if (row == nullptr) {
    return -1;
  }
  return row->uses_remap;
}

int32_t isaac_pgd_sibling_normalizes(int32_t field_offset) {
  /* Every copy in 0x0092ba40..0x0092bbe0 is a raw mov — no setg/setne. */
  return sibling_field(field_offset) == nullptr ? -1 : 0;
}

int32_t isaac_pgd_sibling_tail_has_array_stores(void) {
  /* Negative census: the last array store is the sec3 movups #3 store at
     0x0092bbe0; after it (0x0092bbe7+) the only object stores are
     `mov byte [edi],1/0` (changesmade), the game-global +0x2a378
     save/restore and the 0x92bc1a/0x92bc21 read-back gates. */
  return 0;
}

uint32_t isaac_pgd_sibling_snapshot_bytes(void) {
  return ISAAC_PGD_SIBLING_SNAPSHOT_BYTES;
}

/* ---------- toolchain defect guard (ABI v8) ---------- */

/* The Wasm ABI does not narrow i32 arguments, and -O2 deletes an in-body
   mask it can prove redundant for a uint8_t parameter, so a byte-gate export
   with a uint8_t scalar parameter silently disagrees with the PE for any
   argument above 0xff (AGENTS.md "Known toolchain defect"). Every byte gate
   in this family takes uint32_t and narrows explicitly. This static check
   proves no export takes a uint8_t/uint16_t scalar parameter, so the guard
   cannot rot. */



/* ======================== ABI v8 ======================== */

/* ---------- PGDCLR: PersistentGameData::Clear (0x009262b0) ---------- */

/* Rows are PE execution order (see header comment). `length` is bytes;
   row 3's 0x82c is the byte span of the rep stosd (0x20b dwords), rows
   4/5/8/9 are the exact store sets. */
const IsaacPgdClearRow kClearZeroRows[ISAAC_PGDCLR_ZERO_ROWS] = {
    {0, ISAAC_PGD_OFF_PRE_SECTION_WORD, 4, 0x009262bcu},
    {1, ISAAC_PGD_OFF_ACHIEVEMENTS, 0x282, 0x009262ddu},
    {2, ISAAC_PGD_OFF_ITEM_COLLECTION, 0x2dd, 0x009262f0u},
    {3, ISAAC_PGD_OFF_EVENT_COUNTERS, 0x82c, 0x00926305u},
    {4, ISAAC_PGD_OFF_SEC3_DWORDS, 0x38, 0x00926307u},
    {5, ISAAC_PGD_OFF_SEC5_BYTES, 7, 0x00926328u},
    {6, ISAAC_PGD_OFF_BOSSES, 0x68, 0x00926342u},
    {7, ISAAC_PGD_OFF_CHALLENGES, 0x2e, 0x00926352u},
    {8, ISAAC_PGD_OFF_SEC8_DWORDS, 0x6c, 0x00926360u},
    {9, ISAAC_PGD_OFF_SEC9_DWORDS, 8, 0x009263a1u},
    {10, ISAAC_PGD_OFF_SEC10_BYTES, 0x50, 0x009263b5u},
};

const IsaacPgdClearMapRow kClearMapRows[ISAAC_PGDCLR_MAP_ROWS] = {
    {0, 3, ISAAC_PGD_OFF_BESTIARY + 3 * 8, 0x009263cfu, 0x009263d4u,
     0x009263dcu},
    {1, 0, ISAAC_PGD_OFF_BESTIARY + 0 * 8, 0x009263f1u, 0x009263f6u,
     0x009263feu},
    {2, 2, ISAAC_PGD_OFF_BESTIARY + 2 * 8, 0x00926413u, 0x00926418u,
     0x00926420u},
    {3, 1, ISAAC_PGD_OFF_BESTIARY + 1 * 8, 0x00926435u, 0x0092643au,
     0x00926442u},
};

const IsaacPgdClearTailStore kClearTailStores[ISAAC_PGDCLR_TAIL_STORES] = {
    {0, ISAAC_PGD_OFF_CHANGES_MADE, 2, 0, 0x0092644bu},
    {1, ISAAC_PGD_OFF_FLAG_02, 1, 1, 0x00926450u},
    {2, ISAAC_PGD_OFF_FILE_LOADED_OK, 1, 1, 0x00926454u},
};

const uint32_t kClearCallSites[ISAAC_PGDCLR_CALL_SITES] = {
    0x00925ffcu, 0x0092646au, 0x0092682fu, 0x00926ad1u, 0x00926c0au,
    0x00926e0bu, 0x00926e7fu, 0x0092b5cau, 0x0092ba19u, 0x00959e8du,
    0x009d9e01u,
};

/* Absolute [start, end) ranges of every zeroed byte region, including
   the word [pgd+0] store and the conditional +0xf88 row. The map page
   +0xf64..+0xf84 is deliberately absent (struct reset, not zeroed). */
struct ClearZeroRange {
  int32_t start;
  int32_t end;
  int32_t conditional; /* 1 = gated on the argument low byte */
};

static const ClearZeroRange kClearZeroRanges[] = {
    {0, 2, 0},
    {ISAAC_PGD_OFF_PRE_SECTION_WORD, ISAAC_PGD_OFF_PRE_SECTION_WORD + 4, 0},
    {ISAAC_PGD_OFF_ACHIEVEMENTS, ISAAC_PGD_OFF_ACHIEVEMENTS + 0x282, 0},
    {ISAAC_PGD_OFF_EVENT_COUNTERS, ISAAC_PGD_OFF_EVENT_COUNTERS + 0x82c, 0},
    {ISAAC_PGD_OFF_ITEM_COLLECTION, ISAAC_PGD_OFF_ITEM_COLLECTION + 0x2dd, 0},
    {ISAAC_PGD_OFF_SEC3_DWORDS, ISAAC_PGD_OFF_SEC3_DWORDS + 0x38, 0},
    {ISAAC_PGD_OFF_SEC5_BYTES, ISAAC_PGD_OFF_SEC5_BYTES + 7, 0},
    {ISAAC_PGD_OFF_BOSSES, ISAAC_PGD_OFF_BOSSES + 0x68, 0},
    {ISAAC_PGD_OFF_CHALLENGES, ISAAC_PGD_OFF_CHALLENGES + 0x2e, 0},
    {ISAAC_PGD_OFF_SEC8_DWORDS, ISAAC_PGD_OFF_SEC8_DWORDS + 0x6c, 0},
    {ISAAC_PGD_OFF_SEC9_DWORDS, ISAAC_PGD_OFF_SEC9_DWORDS + 8, 0},
    {ISAAC_PGD_OFF_SEC10_BYTES, ISAAC_PGD_OFF_SEC10_BYTES + 0x50, 0},
    {ISAAC_PGD_OFF_SAVE_COUNTER, ISAAC_PGD_OFF_SAVE_COUNTER + 4, 1},
};

int32_t isaac_pgd_clear_zero_row_count(void) {
  return ISAAC_PGDCLR_ZERO_ROWS;
}

int32_t isaac_pgd_clear_zero_record(int32_t step, IsaacPgdClearRow* out) {
  if (step < 0 || step >= ISAAC_PGDCLR_ZERO_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kClearZeroRows[step];
  }
  return 1;
}

int32_t isaac_pgd_clear_zero_row_span_dwords(int32_t step) {
  if (step != 3) {
    return 0;
  }
  return 0x20b; /* `mov ecx,0x20b; rep stosd` at 0x009262fd/0x00926305 */
}

int32_t isaac_pgd_clear_save_counter_cleared(uint32_t unk) {
  /* `cmp byte [ebp+8],0; je 0x9262d2` — low-byte gate. */
  return (unk & 0xffu) != 0 ? 1 : 0;
}

int32_t isaac_pgd_clear_map_count(void) { return ISAAC_PGDCLR_MAP_ROWS; }

int32_t isaac_pgd_clear_map_record(int32_t step, IsaacPgdClearMapRow* out) {
  if (step < 0 || step >= ISAAC_PGDCLR_MAP_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kClearMapRows[step];
  }
  return 1;
}

int32_t isaac_pgd_clear_map_slot_at_step(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDCLR_MAP_ROWS) {
    return -1;
  }
  return kClearMapRows[step].slot;
}

int32_t isaac_pgd_clear_tail_store_count(void) {
  return ISAAC_PGDCLR_TAIL_STORES;
}

int32_t isaac_pgd_clear_tail_store_record(int32_t step,
                                          IsaacPgdClearTailStore* out) {
  if (step < 0 || step >= ISAAC_PGDCLR_TAIL_STORES) {
    return 0;
  }
  if (out != nullptr) {
    *out = kClearTailStores[step];
  }
  return 1;
}

int32_t isaac_pgd_clear_field_status(int32_t field_offset) {
  /* Whole-field verdicts first. */
  if (field_offset == ISAAC_PGD_OFF_PRE_SECTION_WORD ||
      field_offset == ISAAC_PGD_OFF_ACHIEVEMENTS ||
      field_offset == ISAAC_PGD_OFF_EVENT_COUNTERS ||
      field_offset == ISAAC_PGD_OFF_ITEM_COLLECTION ||
      field_offset == ISAAC_PGD_OFF_SEC3_DWORDS ||
      field_offset == ISAAC_PGD_OFF_SEC5_BYTES ||
      field_offset == ISAAC_PGD_OFF_BOSSES ||
      field_offset == ISAAC_PGD_OFF_CHALLENGES ||
      field_offset == ISAAC_PGD_OFF_SEC8_DWORDS ||
      field_offset == ISAAC_PGD_OFF_SEC9_DWORDS ||
      field_offset == ISAAC_PGD_OFF_SEC10_BYTES) {
    return ISAAC_PGDCLR_STATUS_ZEROED;
  }
  if (field_offset == ISAAC_PGD_OFF_SAVE_COUNTER) {
    return ISAAC_PGDCLR_STATUS_ZEROED_IF_ARG;
  }
  if (field_offset == ISAAC_PGD_OFF_CHANGES_MADE ||
      field_offset == ISAAC_PGD_OFF_READONLY) {
    return ISAAC_PGDCLR_STATUS_ZEROED; /* word [pgd+0] store */
  }
  if (field_offset == ISAAC_PGD_OFF_FLAG_02 ||
      field_offset == ISAAC_PGD_OFF_FILE_LOADED_OK) {
    return ISAAC_PGDCLR_STATUS_SET_ONE;
  }
  if (field_offset >= ISAAC_PGD_OFF_BESTIARY &&
      field_offset < ISAAC_PGD_OFF_PRE_SECTION_WORD) {
    return ISAAC_PGDCLR_STATUS_STRUCT_RESET;
  }
  return ISAAC_PGDCLR_STATUS_UNTOUCHED;
}

int32_t isaac_pgd_clear_byte_zeroed(int32_t offset, uint32_t unk) {
  const int32_t arg_low = (unk & 0xffu) != 0 ? 1 : 0;
  for (size_t i = 0; i < sizeof(kClearZeroRanges) / sizeof(kClearZeroRanges[0]);
       ++i) {
    const ClearZeroRange* r = &kClearZeroRanges[i];
    if (offset >= r->start && offset < r->end) {
      return r->conditional ? arg_low : 1;
    }
  }
  return 0;
}

int32_t isaac_pgd_clear_total_zeroed_bytes(uint32_t unk) {
  int32_t total = 0;
  for (size_t i = 0; i < sizeof(kClearZeroRanges) / sizeof(kClearZeroRanges[0]);
       ++i) {
    const ClearZeroRange* r = &kClearZeroRanges[i];
    if (r->conditional) {
      total += (unk & 0xffu) != 0 ? (r->end - r->start) : 0;
    } else {
      total += r->end - r->start;
    }
  }
  return total;
}

int32_t isaac_pgd_clear_gap_offset(void) { return ISAAC_PGDCLR_GAP_OFF; }

int32_t isaac_pgd_clear_gap_length(void) { return ISAAC_PGDCLR_GAP_LEN; }

int32_t isaac_pgd_clear_map_order_matches_reader(void) {
  /* The reader's v3 clear order is the same slot order 3,0,2,1 — see the
     v3 law table (isaac_pgd_reader_clear_slot_order). */
  return 1;
}

int32_t isaac_pgd_clear_map_order_matches_writer(void) {
  /* The writer emits slots in its section order, which differs. */
  return 0;
}

int32_t isaac_pgd_clear_call_site_count(void) {
  return ISAAC_PGDCLR_CALL_SITES;
}

uint32_t isaac_pgd_clear_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCLR_CALL_SITES) {
    return 0;
  }
  return kClearCallSites[index];
}

/* ---------- PGDTAIL: the shared import tail re-save lane ---------- */

const IsaacPgdTailStep kImportTailSteps[ISAAC_PGD_TAIL_STEPS] = {
    /* kind, va_import, va_sibling, detail */
    {0, ISAAC_PGD_TAIL_KIND_WRITE, 0x0092b752u, 0x0092bbe7u,
     ISAAC_PGD_TAIL_GATE_OFF_CHANGES}, /* changesmade = 1 */
    {1, ISAAC_PGD_TAIL_KIND_WRITE, 0x0092b755u, 0x0092bbeau,
     ISAAC_PGD_TAIL_GAME_GUARD_OFF}, /* save + zero game+0x2a378 */
    {2, ISAAC_PGD_TAIL_KIND_HOST_CALL, 0x0092b765u, 0x0092bbfau,
     ISAAC_PGD_TAIL_HOST_VA_9296C0},
    {3, ISAAC_PGD_TAIL_KIND_EVENT, 0x0092b770u, 0x0092bc05u,
     ISAAC_PGD_TAIL_EVENT_VA}, /* IncreaseEventCounter(0,0) */
    {4, ISAAC_PGD_TAIL_KIND_WRITE, 0x0092b77au, 0x0092bc0fu,
     ISAAC_PGD_TAIL_GAME_GUARD_OFF}, /* restore game+0x2a378 */
    {5, ISAAC_PGD_TAIL_KIND_GATE, 0x0092b780u, 0x0092bc15u,
     ISAAC_PGD_TAIL_GATE_OFF_CHANGES},
    {6, ISAAC_PGD_TAIL_KIND_WRITE, 0x0092b790u, 0x0092bc25u,
     ISAAC_PGD_TAIL_GATE_OFF_CHANGES}, /* changesmade = 0 */
    {7, ISAAC_PGD_TAIL_KIND_HOST_CALL, 0x0092b793u, 0x0092bc28u,
     ISAAC_PGD_TAIL_HOST_VA_9292C0},
    {8, ISAAC_PGD_TAIL_KIND_SAVE_SELECT, 0x0092b7a3u, 0x0092bc38u,
     ISAAC_PGD_TAIL_PROBE_GLOBAL_VA},
    {9, ISAAC_PGD_TAIL_KIND_SAVE, 0x0092b7bcu, 0x0092bc51u,
     ISAAC_PGD_TAIL_SAVE_STEAM_VA}, /* else local 0x009294f0 */
};

int32_t isaac_pgd_import_tail_step_count(void) { return ISAAC_PGD_TAIL_STEPS; }

int32_t isaac_pgd_import_tail_record(int32_t step, IsaacPgdTailStep* out) {
  if (step < 0 || step >= ISAAC_PGD_TAIL_STEPS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kImportTailSteps[step];
  }
  return 1;
}

int32_t isaac_pgd_import_tail_event_args_0(void) { return 0; }
int32_t isaac_pgd_import_tail_event_args_1(void) { return 0; }

int32_t isaac_pgd_import_tail_gate_open(uint32_t changesmade,
                                        uint32_t file_loaded_ok) {
  /* Two independent `cmp byte ...,0 / je` low-byte tests. */
  return (changesmade & 0xffu) != 0 && (file_loaded_ok & 0xffu) != 0 ? 1 : 0;
}

int32_t isaac_pgd_import_tail_save_to_steam_needed(uint32_t probe_deref_dword,
                                                   uint32_t game_2a3a4) {
  /* `cmp dword [eax],0; je local` then `cmp byte [esi+0x2a3a4],0; je
     local`. The probe pointer itself is dereferenced unconditionally. */
  return probe_deref_dword != 0 && (game_2a3a4 & 0xffu) != 0 ? 1 : 0;
}

int32_t isaac_pgd_import_tail_preserves_game_guard(void) { return 1; }

int32_t isaac_pgd_import_tail_returns_one_unless_read_failed(void) {
  return 1;
}

uint32_t isaac_pgd_import_reader_va(void) { return 0x009e4260u; }

uint32_t isaac_pgd_import_reader_call_site_va(void) { return 0x0092b574u; }

uint32_t isaac_pgd_sibling_reader_va(void) { return 0x0041d670u; }

uint32_t isaac_pgd_sibling_reader_call_site_va(void) { return 0x0092ba01u; }

uint32_t isaac_pgd_sibling_snapshot_ctor_va(void) { return 0x0041d560u; }

int32_t isaac_pgd_sibling_ctor_call_site_count(void) { return 2; }

uint32_t isaac_pgd_sibling_ctor_call_site_va(int32_t index) {
  if (index == 0) {
    return 0x0092b9d7u;
  }
  if (index == 1) {
    return 0x0092b9eau;
  }
  return 0;
}

int32_t isaac_pgd_import_reader_call_site_count(void) { return 1; }

int32_t isaac_pgd_sibling_reader_call_site_count(void) { return 1; }

int32_t isaac_pgd_import_reader_is_shared_with_sibling(void) { return 0; }

/* Plain structs + the __is_same builtin on purpose: the syntax-check host
   clang++ ships no libc++ include paths, so <type_traits> is unavailable. */
template <typename... Ts>
struct pgd_has_narrow_scalar;
template <>
struct pgd_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct pgd_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      pgd_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct pgd_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = pgd_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_PGD_NO_NARROW_PARAMS(FN)                                        \
  static_assert(!pgd_has_narrow_scalar<decltype(FN)>::value,                  \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_string_data_is_heap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_magic_byte);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_magic_variant);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_version_for_variant);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_max_section_id_for_variant);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_version_loadable);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_section_desc);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_section_stream_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_section_stream_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_fixed_prefix_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_loop_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_section_skipped);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_section_dispatched);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_payload_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_store_in_range);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_count_mismatch);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_bool_normalize);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_writer_bool_normalize);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_crc_table_entry);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_crc_table_uses_arithmetic_shift);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_save_uses_state_crc_routine);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_crc_step);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ror_add_step);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_init);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_update);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_finalize);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_buffer);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_file_region);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_file_valid);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_achievement_index_valid);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unlocked);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_try_unlock_store_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_try_unlock_steam_leg);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_collection_index_valid);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_collection_store_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_challenge_index_valid);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_challenge_store_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_boss_index_valid);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_boss_store_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_counter_next);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_counter_store_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_flag_get);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_flag_set);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_flag_popcount);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_total);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_cap_word);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_submap_tag);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_submap_pair);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_save_plan);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_section_desc);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_dispatch_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_handler_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_sec9_clamp);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_dispatch_edi);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_elem_byte_cursor);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_elements_consumed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_elements_stored);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_count_enters_loop);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_loop_back);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_store_normalizes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_store_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_store_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_section_uses_cap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_clear_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_outer_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_pair_loop_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_insert_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_tail_reads_save_counter);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_field_status);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_field_repr);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_pre_section_word_accessor_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_alt_transport_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_alt_transport_covers);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bitpack_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bitpack_bit);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bitpack_unpack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_notify_logs);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_notify_dispatches);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_loop_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_loop_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_slot_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_slot_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_writers);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_writers);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_winning_iteration);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_winning_iteration);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3_restore_store_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_event_restore_store_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_slot_from_tag);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_tag_handler_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_map_root_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_map_count_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_pair_count_from_size);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_pair_payload_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_size_word_from_pairs);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec5_index_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec5_out_of_range);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec5_store_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec5_all_set);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10_store_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10_resets_slot0);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10_store_is_self_cancelling);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_mask41_popcount);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_mask41_unlock_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_mask41_hi_mask);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_copy_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_copy_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_field_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_written_byte_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_element_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_stale_byte_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_uses_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_normalizes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_has_array_stores);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_snapshot_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_event_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_copy_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_copy_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_field_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_written_byte_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_element_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_stale_byte_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_uses_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_normalizes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tail_has_array_stores);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_snapshot_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_zero_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_zero_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_zero_row_span_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_save_counter_cleared);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_map_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_map_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_map_slot_at_step);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_tail_store_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_tail_store_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_field_status);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_byte_zeroed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_total_zeroed_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_gap_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_gap_length);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_map_order_matches_reader);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_map_order_matches_writer);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_clear_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_step_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_event_args_0);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_event_args_1);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_gate_open);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_save_to_steam_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_preserves_game_guard);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tail_returns_one_unless_read_failed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_reader_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_reader_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_reader_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_reader_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_snapshot_ctor_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_ctor_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_ctor_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_reader_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_reader_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_reader_is_shared_with_sibling);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_zero_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_zero_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_zero_span_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_byte_zeroed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_total_zeroed_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_set_one_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_set_one_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_gap_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_gap_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_arg_unused);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_restore_source_covered);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_snapshot_ctor_covers_all_restore_sources);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_zero_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_zero_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_zero_span_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_byte_zeroed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_total_zeroed_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_set_one_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_set_one_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_set_one_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_gap_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_gap_record);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_arg_unused);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_restore_source_covered);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_covers_all_restore_sources);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_snapshot_ctor_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_ctor_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_floor);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_flag_block_taken);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_stair_taken);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_stair_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_stair_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_tail_taken);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_tail_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_tail_gate_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_tail_slot_offset);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_accum_written);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_apply);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_host_calls);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_reader_clamp_floor_const);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_isnil_byte);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_right_nil_arm);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_iterator_next);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_ret_a_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_ret_b_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_host_calls);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_call_sites_image);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_call_sites_cluster);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_next_cluster_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_left_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_parent_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_right_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_isnil_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_key_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_value_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_stride);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_advance_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_writer_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_alt_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_reader_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_empty);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_loop_back);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_tag);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_header_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_count_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_loop_head_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_key_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_value_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_walk_loop_back_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_tree_row_order_matches_bestiary_pairs);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_ret_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_next_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_global_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_game_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_tree_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_slot7c_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_float_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_flag_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_slot0_count_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_readonly_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_store_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_store_gate_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_header_load_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_empty_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate1_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate1_jl_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate2_movss_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate2_ucomiss_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate2_lahf_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate2_test_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate2_jnp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate3_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_gate3_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_inc_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_advance_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_loop_back_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_loop_back_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_proceed_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_proceed_jb_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_probe_blocked);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_eligible);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_store_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_effective);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_count_proceed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_ret_node_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_ret_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_slot3_header_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_marker_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_value_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_game_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_container_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_gate_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_container_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_map_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key_shift12_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key_or_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key_shift8_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_marker_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_marker_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key_jl_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_header_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_header_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_value_load_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_key);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_node_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_death_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_ret_node_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_ret_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_slot1_header_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_marker_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_value_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_game_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_container_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_gate_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_container_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_map_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key_shift12_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key_or_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key_shift8_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_marker_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_marker_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key_jl_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_header_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_header_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_value_load_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_key);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_node_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_kill_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_ret_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_helper_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_helper_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_helper_ret_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_slot0_header_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_marker_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_value_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_game_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_container_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_gate_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_container_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_map_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key_shift12_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key_or_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key_shift8_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_marker_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_marker_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key_jl_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_header_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_header_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_value_load_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_helper_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_helper_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_key);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_node_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_encounter_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_ret_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_slot1_header_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_marker_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_value_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_game_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_container_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_gate_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_container_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_map_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_value_accessor_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_kill_getter_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_unlock_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_type_base);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_range);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_bt_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_bt_entries);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_jt_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_readonly_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_readonly_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_rec_test_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_rec_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_gate_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_gate_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key_shift12_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key_or_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key_shift8_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_marker_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_marker_jne_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key_jl_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_header_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_header_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_store_inc_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_store_set1_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_range_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_range_ja_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_table_load_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_dispatch_jmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case1_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case1_jb_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case1_push_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case1_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case2_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case2_jb_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case2_push_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case2_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_call1_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_call2_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_add_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_jb_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_push_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_key);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_node_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_store_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_dispatch_case);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_unlock_needed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addkill_case0_sum);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib2_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib2_helper_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib2_key);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib2_node_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib2_store_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib3_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib3_helper_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib3_key);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib3_node_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_bestiary_addsib3_store_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_table_entry_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_flag_store_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_dispatch_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_flag_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addchallenge_unlock_id_for_arg);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_first_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_push_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_byte_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_entry_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_flag_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_block_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addboss_unlock_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_index_remap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_out_of_range);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_outcome);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_flag_byte_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_unlock_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addmini_unlock_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_adsed_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_adsed_outcome);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_adsed_store_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_adsed_self_cancelling);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_adsed_slot0_after);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_adsed_dirty_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_k41_popcount);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_k41_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_k41_unlock_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_k41_dirty_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_k41_counter_store_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_header_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_header_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_header_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_header_count_max);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_header_dword);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_compare_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_compare_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_read_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_read_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_first_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_fail_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_fail_tail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_compare);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_first_match);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_match_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_match_count_max);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_dispatch_table_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_dispatch_entries);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_dispatch_gate_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_dispatch_gate_ja_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_entry_gate_js_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_entry_gate_jge_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_count_gate_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_count_gate_jbe_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_loop_jae_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_loop_jb_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_dispatch_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_target_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_store_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_elem_width);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_clamp_max);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_flag_normalize);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_handler_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_entry_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_count_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_clamp);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_byte_flag);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_byte_loop_iterations);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_dword_loop_iterations);
/* ABI v25p — PGDROWSEC: per-section handler row semantics. */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_row_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_store_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_elem_width);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_clamp_max);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_flag_normalize);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_target_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_section_loop_iterations);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_run_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_success_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_store_7d_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_store_8c_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_flags_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_flags_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_first_idx);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_bound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_iters);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_first_idx);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_bound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_iters);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_alias_a_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_alias_b_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_alias_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_alias_a);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_alias_b);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_alias);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_bucket);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_bucket);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_coll_continue);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_store_7d);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tally_sett_store_8c);
/* v25o PGDIMP exports — all scalar params are uint32_t/int32_t. */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_pattern_byte);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_compare_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_window_match);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_scan_start);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_scan_step);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_first_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_replace_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_suffix_replace_pos_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_rebirth_replacement_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_rebirth_replace_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_open_succeeded);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_open_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_open_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_open_state_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_open_state_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_stream_pos_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_stream_pos_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_file_io_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_pre_read_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_post_read_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_pre_read_io_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_post_read_io_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_post_read_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_post_read_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_post_read_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_changesmade_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_changesmade_store_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_changesmade_clear_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_save_select);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_save_select_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_save_select_0f8c_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_save_select_obj_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_save_select_obj_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_save_select_global_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_event_counter_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_global_save_ptr_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_global_save_field_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_global_save_cleared);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_global_save_restore);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_return1_va_a);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_return1_va_b);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_result);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_pure_helpers_abi_version);
/* ABI v26 — PGDIVER: import version gates + fail tail. */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_read_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_read_width);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_gate_row);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_gate_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_finish_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_version_finish_default);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_finish_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_fail_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_fail_log_argc);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_import_tag_fail_returns_zero);
/* ABI v26 — PGDREADER2: the sibling reader 0x0041d670. */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_compare);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_first_match);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_match_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_match_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_header_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_header_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_header_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_compare_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_compare_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_read_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_size_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_count_check_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_size_check_section);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_miss_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_tag_miss_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_count_mismatch_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_entry_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_record_count_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_dispatch_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_dispatch_table_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_dispatch_entries);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_version_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_version_finish_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_version_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_version_read_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_version_read_width);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_success_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_ret_ok_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_fail_tail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_fail_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_ret_stack_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_row_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_store_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_elem_width);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_clamp_max);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_flag_normalize);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_target_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sibling_section_loop_iterations);

/* ABI v27 — PGDIEC: IncreaseEventCounter 0x00929b40. */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_host_try_unlock_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_host_cookie_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_readonly_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_dirty_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_counter_base);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_gate_open);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_counter_store_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_dirty_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_gate_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_gate_row);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_iec_gate_fires);

/* ABI v28 — PGDULD: the 0x009296c0 tier-ladder decision island. */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_host_try_unlock_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_try_unlock_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_segment_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_loop_iterations);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_flag_accum);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_uld_fire);

/* ABI v28 — PGDHOST law pins (cookie 0xaef12b / checksum 0x683580). */
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_host_cookie_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cookie_global_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cookie_fail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cookie_check_ok);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_skip_front);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_skip_back);



/* ======================== ABI v9 ======================== */

/* ---------- PGDCT: the sibling snapshot ctor 0x0041d560 ---------- */

/* Ten unconditional zero rows, PE execution order (see the header for
   the per-row store mechanics and VAs). Row 3 is the rep stosd
   (`mov ecx,0xa2` at 0x0041d5a6); its length is the 0x288-byte span. */
const IsaacPgdSnapshotCtorZeroRow kSnapshotCtorZeroRows[ISAAC_PGDCT_ZERO_ROWS] = {
    {0, 0x6dc, 8, 0x0041d56eu},
    {1, 0x038, 0x115, 0x0041d583u},
    {2, 0x3d8, 0x1ba, 0x0041d596u},
    {3, 0x150, 0x288, 0x0041d5abu},
    {4, 0x594, 0x37, 0x0041d5adu},
    {5, 0x5cb, 0x43, 0x0041d5e0u},
    {6, 0x60e, 0x1f, 0x0041d5eeu},
    {7, 0x630, 0x5c, 0x0041d619u},
    {8, 0x68c, 0x4d, 0x0041d651u},
    {9, 0x000, 2, 0x0041d659u},
};

const IsaacPgdSnapshotCtorGap kSnapshotCtorGaps[ISAAC_PGDCT_GAP_COUNT] = {
    {0, 0x002, 0x36},
    {1, 0x14d, 3},
    {2, 0x592, 2},
    {3, 0x62d, 3},
    {4, 0x6d9, 3},
    {5, 0x6e5, 0x1b},
};

int32_t isaac_pgd_snapshot_ctor_zero_row_count(void) {
  return ISAAC_PGDCT_ZERO_ROWS;
}

int32_t isaac_pgd_snapshot_ctor_zero_record(int32_t step,
                                            IsaacPgdSnapshotCtorZeroRow* out) {
  if (step < 0 || step >= ISAAC_PGDCT_ZERO_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kSnapshotCtorZeroRows[step];
  }
  return 1;
}

int32_t isaac_pgd_snapshot_ctor_zero_span_dwords(int32_t step) {
  if (step != ISAAC_PGDCT_STOSD_ROW) {
    return 0;
  }
  return ISAAC_PGDCT_STOSD_DWORDS;
}

int32_t isaac_pgd_snapshot_ctor_byte_zeroed(int32_t offset) {
  for (size_t i = 0; i < ISAAC_PGDCT_ZERO_ROWS; ++i) {
    const IsaacPgdSnapshotCtorZeroRow* r = &kSnapshotCtorZeroRows[i];
    if (offset >= r->offset && offset < r->offset + r->length) {
      return 1;
    }
  }
  return 0;
}

int32_t isaac_pgd_snapshot_ctor_total_zeroed_bytes(void) {
  return ISAAC_PGDCT_TOTAL_ZEROED_BYTES;
}

int32_t isaac_pgd_snapshot_ctor_set_one_offset(void) {
  return ISAAC_PGDCT_SET_ONE_OFF;
}

int32_t isaac_pgd_snapshot_ctor_set_one_value(void) {
  return ISAAC_PGDCT_SET_ONE_VALUE;
}

int32_t isaac_pgd_snapshot_ctor_gap_count(void) {
  return ISAAC_PGDCT_GAP_COUNT;
}

int32_t isaac_pgd_snapshot_ctor_gap_record(int32_t step,
                                           IsaacPgdSnapshotCtorGap* out) {
  if (step < 0 || step >= ISAAC_PGDCT_GAP_COUNT) {
    return 0;
  }
  if (out != nullptr) {
    *out = kSnapshotCtorGaps[step];
  }
  return 1;
}

int32_t isaac_pgd_snapshot_ctor_arg_unused(void) {
  /* Body reads only esi (= ecx) and writes; `ret 4` pops one dword that
     is never read. */
  return 1;
}

int32_t isaac_pgd_snapshot_ctor_restore_source_covered(int32_t offset,
                                                       int32_t length) {
  if (offset < 0 || length < 0) {
    return 0;
  }
  if (length == 0) {
    return 1;
  }
  /* Rows are disjoint; sum the intersection of [offset, offset+length)
     with each row and require full coverage. */
  int64_t covered = 0;
  for (size_t i = 0; i < ISAAC_PGDCT_ZERO_ROWS; ++i) {
    const IsaacPgdSnapshotCtorZeroRow* r = &kSnapshotCtorZeroRows[i];
    const int64_t lo = offset > r->offset ? offset : r->offset;
    const int64_t hi = (int64_t)offset + length < r->offset + r->length
                           ? (int64_t)offset + length
                           : (int64_t)r->offset + r->length;
    if (hi > lo) {
      covered += hi - lo;
    }
  }
  return covered == length ? 1 : 0;
}

int32_t isaac_pgd_snapshot_ctor_covers_all_restore_sources(void) {
  /* Cross-law with PGDEX: every sibling restore source range must be
     pre-zeroed by the ctor. Iterates the landed kSiblingRows table, so
     the check is exact over the module's own copy of the law. */
  for (int32_t step = 0; step < ISAAC_PGD_SIBLING_COPY_ROWS; ++step) {
    const IsaacPgdSiblingCopy* row = &kSiblingRows[step];
    if (row->length > 0 &&
        !isaac_pgd_snapshot_ctor_restore_source_covered(row->source_offset,
                                                        row->length)) {
      return 0;
    }
  }
  return 1;
}


/* ======================== ABI v10 ======================== */

/* ---------- PGDICT: the import snapshot ctor 0x009e3dc0 ---------- */

/* Nine unconditional zero rows, PE execution order (see the header for
   the per-row store mechanics and VAs). Row 3 is the rep stosd
   (`mov ecx,0x5f` at 0x009e3e06); its length is the 0x17c-byte span. */
const IsaacPgdImportCtorZeroRow kImportCtorZeroRows[ISAAC_PGDICT_ZERO_ROWS] = {
    {0, 0x4a0, 8, 0x009e3dceu},
    {1, 0x038, 0xb3, 0x009e3de3u},
    {2, 0x268, 0x15b, 0x009e3df6u},
    {3, 0x0ec, 0x17c, 0x009e3e0bu},
    {4, 0x3c4, 0x37, 0x009e3e0du},
    {5, 0x3fb, 0x39, 0x009e3e40u},
    {6, 0x434, 0x15, 0x009e3e4bu},
    {7, 0x44c, 0x54, 0x009e3e63u},
    {8, 0x000, 2, 0x009e3e91u},
};

const IsaacPgdImportCtorGap kImportCtorGaps[ISAAC_PGDICT_GAP_COUNT] = {
    {0, 0x002, 0x36},
    {1, 0x0eb, 1},
    {2, 0x3c3, 1},
    {3, 0x449, 3},
    {4, 0x4a8, 0x48},
};

int32_t isaac_pgd_import_ctor_zero_row_count(void) {
  return ISAAC_PGDICT_ZERO_ROWS;
}

int32_t isaac_pgd_import_ctor_zero_record(int32_t step,
                                          IsaacPgdImportCtorZeroRow* out) {
  if (step < 0 || step >= ISAAC_PGDICT_ZERO_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kImportCtorZeroRows[step];
  }
  return 1;
}

int32_t isaac_pgd_import_ctor_zero_span_dwords(int32_t step) {
  if (step != ISAAC_PGDICT_STOSD_ROW) {
    return 0;
  }
  return ISAAC_PGDICT_STOSD_DWORDS;
}

int32_t isaac_pgd_import_ctor_byte_zeroed(int32_t offset) {
  for (size_t i = 0; i < ISAAC_PGDICT_ZERO_ROWS; ++i) {
    const IsaacPgdImportCtorZeroRow* r = &kImportCtorZeroRows[i];
    if (offset >= r->offset && offset < r->offset + r->length) {
      return 1;
    }
  }
  return 0;
}

int32_t isaac_pgd_import_ctor_total_zeroed_bytes(void) {
  return ISAAC_PGDICT_TOTAL_ZEROED_BYTES;
}

int32_t isaac_pgd_import_ctor_set_one_offset(void) {
  return ISAAC_PGDICT_SET_ONE_OFF;
}

int32_t isaac_pgd_import_ctor_set_one_value(void) {
  return ISAAC_PGDICT_SET_ONE_VALUE;
}

int32_t isaac_pgd_import_ctor_set_one_count(void) {
  return ISAAC_PGDICT_SET_ONE_COUNT;
}

int32_t isaac_pgd_import_ctor_gap_count(void) {
  return ISAAC_PGDICT_GAP_COUNT;
}

int32_t isaac_pgd_import_ctor_gap_record(int32_t step,
                                         IsaacPgdImportCtorGap* out) {
  if (step < 0 || step >= ISAAC_PGDICT_GAP_COUNT) {
    return 0;
  }
  if (out != nullptr) {
    *out = kImportCtorGaps[step];
  }
  return 1;
}

int32_t isaac_pgd_import_ctor_arg_unused(void) {
  /* Body reads only esi (= ecx) and writes; `ret 4` pops one dword that
     is never read. */
  return 1;
}

int32_t isaac_pgd_import_ctor_restore_source_covered(int32_t offset,
                                                     int32_t length) {
  if (offset < 0 || length < 0) {
    return 0;
  }
  if (length == 0) {
    return 1;
  }
  /* Rows are disjoint; sum the intersection of [offset, offset+length)
     with each row and require full coverage. */
  int64_t covered = 0;
  for (size_t i = 0; i < ISAAC_PGDICT_ZERO_ROWS; ++i) {
    const IsaacPgdImportCtorZeroRow* r = &kImportCtorZeroRows[i];
    const int64_t lo = offset > r->offset ? offset : r->offset;
    const int64_t hi = (int64_t)offset + length < r->offset + r->length
                           ? (int64_t)offset + length
                           : (int64_t)r->offset + r->length;
    if (hi > lo) {
      covered += hi - lo;
    }
  }
  return covered == length ? 1 : 0;
}

int32_t isaac_pgd_import_ctor_covers_all_restore_sources(void) {
  /* Cross-law with PGDCOV: every import restore source range must be
     pre-zeroed by the ctor. Iterates the landed kImportRows table, so
     the check is exact over the module's own copy of the law. */
  for (int32_t step = 0; step < ISAAC_PGD_IMPORT_COPY_ROWS; ++step) {
    const IsaacPgdImportCopy* row = &kImportRows[step];
    if (row->length > 0 &&
        !isaac_pgd_import_ctor_restore_source_covered(row->source_offset,
                                                      row->length)) {
      return 0;
    }
  }
  return 1;
}

uint32_t isaac_pgd_import_snapshot_ctor_va(void) { return ISAAC_PGDICT_VA; }

int32_t isaac_pgd_import_ctor_call_site_count(void) {
  return ISAAC_PGDICT_CALL_SITES;
}

uint32_t isaac_pgd_import_ctor_call_site_va(int32_t index) {
  if (index == 0) {
    return 0x0092b4d0u;
  }
  if (index == 1) {
    return 0x0092b4e0u;
  }
  return 0;
}

/* ======================== ABI v11 ======================== */

/* ---------- PGDCLMP: import-reader post-loop clamp 0x009e4af0 ---------- */

/* Tail pairs in PE execution order. +0x494 is BEFORE +0x490. */
static const int32_t kClampTailGateOff[ISAAC_PGDCLMP_TAIL_COUNT] = {
    0x11c, 0x114, 0x14c, 0x148, 0x150};
static const int32_t kClampTailSlotOff[ISAAC_PGDCLMP_TAIL_COUNT] = {
    0x488, 0x48c, 0x494, 0x490, 0x498};

static int32_t pgd_clamp_floor_i32(int32_t value) {
  /* PE: cmp dword,1 / cmovg — SIGNED. */
  return value > ISAAC_PGDCLMP_FLOOR ? value : ISAAC_PGDCLMP_FLOOR;
}

static int32_t pgd_clamp_read_i32(const uint8_t* snap, int32_t off) {
  const uint32_t b0 = snap[off];
  const uint32_t b1 = snap[off + 1];
  const uint32_t b2 = snap[off + 2];
  const uint32_t b3 = snap[off + 3];
  return (int32_t)(b0 | (b1 << 8) | (b2 << 16) | (b3 << 24));
}

static void pgd_clamp_write_i32(uint8_t* snap, int32_t off, int32_t v) {
  const uint32_t u = (uint32_t)v;
  snap[off] = (uint8_t)(u & 0xffu);
  snap[off + 1] = (uint8_t)((u >> 8) & 0xffu);
  snap[off + 2] = (uint8_t)((u >> 16) & 0xffu);
  snap[off + 3] = (uint8_t)((u >> 24) & 0xffu);
}

static void pgd_clamp_slot(uint8_t* snap, int32_t off) {
  pgd_clamp_write_i32(snap, off,
                      pgd_clamp_floor_i32(pgd_clamp_read_i32(snap, off)));
}

int32_t isaac_pgd_reader_clamp_floor(int32_t value) {
  return pgd_clamp_floor_i32(value);
}

int32_t isaac_pgd_reader_clamp_flag_block_taken(uint32_t flag_byte) {
  return ((flag_byte & 0xffu) != 0u) ? 1 : 0;
}

int32_t isaac_pgd_reader_clamp_stair_taken(uint32_t flag_byte, int32_t count,
                                           int32_t stair) {
  if (stair < 0 || stair >= ISAAC_PGDCLMP_STAIR_COUNT) {
    return 0;
  }
  if (stair == 0) {
    return isaac_pgd_reader_clamp_flag_block_taken(flag_byte);
  }
  return (count >= stair) ? 1 : 0;
}

int32_t isaac_pgd_reader_clamp_stair_offset(int32_t stair) {
  if (stair < 0 || stair >= ISAAC_PGDCLMP_STAIR_COUNT) {
    return -1;
  }
  return ISAAC_PGDCLMP_STAIR_BASE + stair * 4;
}

int32_t isaac_pgd_reader_clamp_stair_count(void) {
  return ISAAC_PGDCLMP_STAIR_COUNT;
}

int32_t isaac_pgd_reader_clamp_tail_taken(int32_t gate) {
  return (gate >= ISAAC_PGDCLMP_FLOOR) ? 1 : 0;
}

int32_t isaac_pgd_reader_clamp_tail_count(void) {
  return ISAAC_PGDCLMP_TAIL_COUNT;
}

int32_t isaac_pgd_reader_clamp_tail_gate_offset(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCLMP_TAIL_COUNT) {
    return -1;
  }
  return kClampTailGateOff[index];
}

int32_t isaac_pgd_reader_clamp_tail_slot_offset(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCLMP_TAIL_COUNT) {
    return -1;
  }
  return kClampTailSlotOff[index];
}

int32_t isaac_pgd_reader_clamp_accum_written(uint32_t flag_byte, int32_t count,
                                             int32_t gate0, int32_t gate1,
                                             int32_t gate2, int32_t gate3,
                                             int32_t gate4) {
  if (isaac_pgd_reader_clamp_flag_block_taken(flag_byte)) {
    return 1;
  }
  if (count >= 1) {
    return 1;
  }
  if (isaac_pgd_reader_clamp_tail_taken(gate0) ||
      isaac_pgd_reader_clamp_tail_taken(gate1) ||
      isaac_pgd_reader_clamp_tail_taken(gate2) ||
      isaac_pgd_reader_clamp_tail_taken(gate3) ||
      isaac_pgd_reader_clamp_tail_taken(gate4)) {
    return 1;
  }
  return 0;
}

int32_t isaac_pgd_reader_clamp_apply(uint8_t* snap, int32_t snap_bytes) {
  if (snap == nullptr || snap_bytes < ISAAC_PGDCLMP_MIN_SNAP) {
    return 0;
  }
  const uint32_t flag = snap[ISAAC_PGDCLMP_FLAG_OFF];
  const int32_t count = pgd_clamp_read_i32(snap, ISAAC_PGDCLMP_COUNT_OFF);
  if (isaac_pgd_reader_clamp_flag_block_taken(flag)) {
    pgd_clamp_slot(snap, ISAAC_PGDCLMP_STAIR_BASE);
    pgd_clamp_slot(snap, ISAAC_PGDCLMP_ACCUM_OFF);
    pgd_clamp_slot(snap, ISAAC_PGDCLMP_ACCUM_OFF);
    pgd_clamp_slot(snap, ISAAC_PGDCLMP_ACCUM_OFF);
  }
  for (int32_t k = 1; k <= ISAAC_PGDCLMP_STAIR_MAX_N; ++k) {
    if (count < k) {
      break;
    }
    pgd_clamp_slot(snap, ISAAC_PGDCLMP_STAIR_BASE + k * 4);
    pgd_clamp_slot(snap, ISAAC_PGDCLMP_ACCUM_OFF);
  }
  for (int32_t i = 0; i < ISAAC_PGDCLMP_TAIL_COUNT; ++i) {
    const int32_t gate = pgd_clamp_read_i32(snap, kClampTailGateOff[i]);
    if (isaac_pgd_reader_clamp_tail_taken(gate)) {
      pgd_clamp_slot(snap, kClampTailSlotOff[i]);
      pgd_clamp_slot(snap, ISAAC_PGDCLMP_ACCUM_OFF);
    }
  }
  return 1;
}

uint32_t isaac_pgd_reader_clamp_va(void) { return ISAAC_PGDCLMP_VA; }

uint32_t isaac_pgd_reader_clamp_ret_va(void) { return ISAAC_PGDCLMP_RET_VA; }

int32_t isaac_pgd_reader_clamp_call_site_count(void) {
  return ISAAC_PGDCLMP_CALL_SITES;
}

uint32_t isaac_pgd_reader_clamp_call_site_va(int32_t index) {
  if (index == 0) {
    return ISAAC_PGDCLMP_CALL_SITE_VA;
  }
  return 0;
}

int32_t isaac_pgd_reader_clamp_host_calls(void) {
  return ISAAC_PGDCLMP_HOST_CALLS;
}

int32_t isaac_pgd_reader_clamp_floor_const(void) {
  return ISAAC_PGDCLMP_FLOOR;
}



/* ======================== ABI v12 ======================== */

/* Wasm linear-memory model: node addresses are absolute i32 offsets. */
namespace {
inline const uint8_t* pgd_tree_ptr(uint32_t addr) {
  return reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
}
inline uint32_t pgd_tree_load_u32(uint32_t addr) {
  const uint8_t* p = pgd_tree_ptr(addr);
  uint32_t value = 0;
  value |= static_cast<uint32_t>(p[0]);
  value |= static_cast<uint32_t>(p[1]) << 8;
  value |= static_cast<uint32_t>(p[2]) << 16;
  value |= static_cast<uint32_t>(p[3]) << 24;
  return value;
}
inline uint8_t pgd_tree_load_isnil(uint32_t node) {
  return pgd_tree_ptr(node + static_cast<uint32_t>(ISAAC_PGD_TREE_ISNIL_OFF))[0];
}
const uint32_t kPgdTreeClusterSites[ISAAC_PGD_TREE_NEXT_CALL_SITES_CLUSTER] = {
    0x00928bf9u, 0x00928cbcu, 0x00928d7fu, 0x00928e49u, 0x0092af9au,
};
}  // namespace

extern "C" int32_t isaac_pgd_tree_isnil_byte(uint32_t isnil_word) {
  return ((isnil_word & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_pgd_tree_right_nil_arm(uint32_t right_isnil_word) {
  /* PE 0x00414a89: cmp byte [edi+0xd], 0 ; je leftmost. */
  return isaac_pgd_tree_isnil_byte(right_isnil_word);
}

extern "C" void isaac_pgd_tree_iterator_next(uint32_t* it) {
  if (it == nullptr) {
    return;
  }
  const uint32_t node = *it;
  if (node == 0u) {
    return;
  }
  const uint32_t right =
      pgd_tree_load_u32(node + static_cast<uint32_t>(ISAAC_PGD_TREE_RIGHT_OFF));
  if (pgd_tree_load_isnil(right) != 0) {
    uint32_t cur = node;
    uint32_t parent =
        pgd_tree_load_u32(cur + static_cast<uint32_t>(ISAAC_PGD_TREE_PARENT_OFF));
    if (pgd_tree_load_isnil(parent) == 0) {
      while (cur == pgd_tree_load_u32(
                        parent + static_cast<uint32_t>(ISAAC_PGD_TREE_RIGHT_OFF))) {
        *it = parent;
        cur = parent;
        parent = pgd_tree_load_u32(
            cur + static_cast<uint32_t>(ISAAC_PGD_TREE_PARENT_OFF));
        if (pgd_tree_load_isnil(parent) != 0) {
          break;
        }
      }
    }
    *it = parent;
    return;
  }
  uint32_t walk = right;
  uint32_t left =
      pgd_tree_load_u32(walk + static_cast<uint32_t>(ISAAC_PGD_TREE_LEFT_OFF));
  if (pgd_tree_load_isnil(left) == 0) {
    do {
      walk = left;
      left = pgd_tree_load_u32(walk +
                               static_cast<uint32_t>(ISAAC_PGD_TREE_LEFT_OFF));
    } while (pgd_tree_load_isnil(left) == 0);
  }
  *it = walk;
}

extern "C" uint32_t isaac_pgd_tree_next_va(void) { return ISAAC_PGD_TREE_NEXT_VA; }
extern "C" uint32_t isaac_pgd_tree_next_ret_a_va(void) {
  return ISAAC_PGD_TREE_NEXT_RET_A_VA;
}
extern "C" uint32_t isaac_pgd_tree_next_ret_b_va(void) {
  return ISAAC_PGD_TREE_NEXT_RET_B_VA;
}
extern "C" int32_t isaac_pgd_tree_next_body_bytes(void) {
  return ISAAC_PGD_TREE_NEXT_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_tree_next_host_calls(void) {
  return ISAAC_PGD_TREE_NEXT_HOST_CALLS;
}
extern "C" int32_t isaac_pgd_tree_next_call_sites_image(void) {
  return ISAAC_PGD_TREE_NEXT_CALL_SITES_IMAGE;
}
extern "C" int32_t isaac_pgd_tree_next_call_sites_cluster(void) {
  return ISAAC_PGD_TREE_NEXT_CALL_SITES_CLUSTER;
}
extern "C" uint32_t isaac_pgd_tree_next_cluster_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGD_TREE_NEXT_CALL_SITES_CLUSTER) {
    return 0;
  }
  return kPgdTreeClusterSites[index];
}
extern "C" int32_t isaac_pgd_tree_left_off(void) { return ISAAC_PGD_TREE_LEFT_OFF; }
extern "C" int32_t isaac_pgd_tree_parent_off(void) {
  return ISAAC_PGD_TREE_PARENT_OFF;
}
extern "C" int32_t isaac_pgd_tree_right_off(void) {
  return ISAAC_PGD_TREE_RIGHT_OFF;
}
extern "C" int32_t isaac_pgd_tree_isnil_off(void) {
  return ISAAC_PGD_TREE_ISNIL_OFF;
}

/* ======================== ABI v13 ======================== */

/* PGDTROW: the writer's bestiary tree-row walk inside 0x009282e0. The
   row cell holds the map header node address; begin = *cell (leftmost =
   header->_Left); the empty gate and the loop-back are PLAIN unsigned
   equality/inequality against the header node (MSVC end() == header).
   The per-row key/value stream writes and checksums stay host; the walk
   shape (offsets, gates, advance) is pure. */

namespace {

const int32_t kPgdTreeRowSlots[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_SLOT_0, ISAAC_PGDTROW_SLOT_1, ISAAC_PGDTROW_SLOT_2,
    ISAAC_PGDTROW_SLOT_3};
const int32_t kPgdTreeRowTags[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_TAG_0, ISAAC_PGDTROW_TAG_1, ISAAC_PGDTROW_TAG_2,
    ISAAC_PGDTROW_TAG_3};
const int32_t kPgdTreeRowHeaderOffs[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_HEADER_OFF_0, ISAAC_PGDTROW_HEADER_OFF_1,
    ISAAC_PGDTROW_HEADER_OFF_2, ISAAC_PGDTROW_HEADER_OFF_3};
const int32_t kPgdTreeRowCountOffs[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_COUNT_OFF_0, ISAAC_PGDTROW_COUNT_OFF_1,
    ISAAC_PGDTROW_COUNT_OFF_2, ISAAC_PGDTROW_COUNT_OFF_3};
const uint32_t kPgdTreeRowGateVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_GATE_VA_0, ISAAC_PGDTROW_GATE_VA_1, ISAAC_PGDTROW_GATE_VA_2,
    ISAAC_PGDTROW_GATE_VA_3};
const uint32_t kPgdTreeRowLoopHeadVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_LOOP_HEAD_VA_0, ISAAC_PGDTROW_LOOP_HEAD_VA_1,
    ISAAC_PGDTROW_LOOP_HEAD_VA_2, ISAAC_PGDTROW_LOOP_HEAD_VA_3};
const uint32_t kPgdTreeRowKeyVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_KEY_VA_0, ISAAC_PGDTROW_KEY_VA_1, ISAAC_PGDTROW_KEY_VA_2,
    ISAAC_PGDTROW_KEY_VA_3};
const uint32_t kPgdTreeRowValueVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_VALUE_VA_0, ISAAC_PGDTROW_VALUE_VA_1,
    ISAAC_PGDTROW_VALUE_VA_2, ISAAC_PGDTROW_VALUE_VA_3};
const uint32_t kPgdTreeRowCallVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_CALL_VA_0, ISAAC_PGDTROW_CALL_VA_1, ISAAC_PGDTROW_CALL_VA_2,
    ISAAC_PGDTROW_CALL_VA_3};
const uint32_t kPgdTreeRowLoopBackVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDTROW_LOOP_BACK_VA_0, ISAAC_PGDTROW_LOOP_BACK_VA_1,
    ISAAC_PGDTROW_LOOP_BACK_VA_2, ISAAC_PGDTROW_LOOP_BACK_VA_3};

}  // namespace

extern "C" int32_t isaac_pgd_tree_row_key_off(void) {
  return ISAAC_PGDTROW_KEY_OFF;
}
extern "C" int32_t isaac_pgd_tree_row_value_off(void) {
  return ISAAC_PGDTROW_VALUE_OFF;
}
extern "C" int32_t isaac_pgd_tree_row_stride(void) {
  return ISAAC_PGDTROW_STRIDE;
}
extern "C" uint32_t isaac_pgd_tree_row_advance_va(void) {
  return ISAAC_PGDTROW_ADVANCE_VA;
}
extern "C" uint32_t isaac_pgd_tree_row_writer_va(void) {
  return ISAAC_PGDTROW_WRITER_VA;
}
extern "C" uint32_t isaac_pgd_tree_row_alt_va(void) {
  return ISAAC_PGDTROW_ALT_VA;
}
extern "C" uint32_t isaac_pgd_tree_row_reader_va(void) {
  return ISAAC_PGDTROW_READER_VA;
}
extern "C" int32_t isaac_pgd_tree_row_empty(uint32_t begin_node,
                                            uint32_t header_node) {
  /* `cmp begin, header ; je skip` — whole-dword equality, no sign test. */
  return begin_node == header_node ? 1 : 0;
}
extern "C" int32_t isaac_pgd_tree_row_loop_back(uint32_t node,
                                                uint32_t header_node) {
  /* `cmp node, header ; jne loop` — whole-dword inequality. */
  return node != header_node ? 1 : 0;
}
extern "C" int32_t isaac_pgd_tree_row_walk_count(void) {
  return ISAAC_PGDTROW_WALKS;
}
extern "C" int32_t isaac_pgd_tree_row_walk_slot(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return -1;
  }
  return kPgdTreeRowSlots[step];
}
extern "C" int32_t isaac_pgd_tree_row_walk_tag(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowTags[step];
}
extern "C" int32_t isaac_pgd_tree_row_walk_header_off(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return -1;
  }
  return kPgdTreeRowHeaderOffs[step];
}
extern "C" int32_t isaac_pgd_tree_row_walk_count_off(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return -1;
  }
  return kPgdTreeRowCountOffs[step];
}
extern "C" uint32_t isaac_pgd_tree_row_walk_gate_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowGateVas[step];
}
extern "C" uint32_t isaac_pgd_tree_row_walk_loop_head_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowLoopHeadVas[step];
}
extern "C" uint32_t isaac_pgd_tree_row_walk_key_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowKeyVas[step];
}
extern "C" uint32_t isaac_pgd_tree_row_walk_value_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowValueVas[step];
}
extern "C" uint32_t isaac_pgd_tree_row_walk_call_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowCallVas[step];
}
extern "C" uint32_t isaac_pgd_tree_row_walk_loop_back_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdTreeRowLoopBackVas[step];
}
extern "C" int32_t isaac_pgd_tree_row_order_matches_bestiary_pairs(void) {
  /* The writer's walk order must equal the reader-side bestiary pair/tag
     tables (kBestiaryPairs / kBestiaryTags above, the v3 land). */
  for (int32_t s = 0; s < ISAAC_PGDTROW_WALKS; ++s) {
    if (kPgdTreeRowSlots[s] != kBestiaryPairs[s]) {
      return 0;
    }
    if (kPgdTreeRowTags[s] != kBestiaryTags[s]) {
      return 0;
    }
  }
  return 1;
}

/* ======================== ABI v14 ======================== */

/* PGDSC11: the writer's section-11 sub-block framing inside 0x009282e0
   and the reader gates in the section-11 handler 0x009276e1. Header:
   id = 11, cap = total<<2, third streamed dword = sub-block count 4
   (the row total at [ebp-0xc] is a dead store, never streamed). Per
   walk step s a tag then a sub-block cap = count[count-off(slot)] << 2
   prelude the v13 row walk. Reader grounds: unsigned subcount==0 gate,
   (tag-1)>3 unsigned invalid, SIGNED cap>0 gate then rows = cap>>2,
   unsigned sub-loop jb, signed row-loop jl. */

namespace {

const uint32_t kPgdSec11TagWriteVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDSC11_TAG_WRITE_VA_0, ISAAC_PGDSC11_TAG_WRITE_VA_1,
    ISAAC_PGDSC11_TAG_WRITE_VA_2, ISAAC_PGDSC11_TAG_WRITE_VA_3};
const uint32_t kPgdSec11CapSourceVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDSC11_CAP_SOURCE_VA_0, ISAAC_PGDSC11_CAP_SOURCE_VA_1,
    ISAAC_PGDSC11_CAP_SOURCE_VA_2, ISAAC_PGDSC11_CAP_SOURCE_VA_3};
const uint32_t kPgdSec11CapShlVas[ISAAC_PGDTROW_WALKS] = {
    ISAAC_PGDSC11_CAP_SHL_VA_0, ISAAC_PGDSC11_CAP_SHL_VA_1,
    ISAAC_PGDSC11_CAP_SHL_VA_2, ISAAC_PGDSC11_CAP_SHL_VA_3};

}  // namespace

extern "C" int32_t isaac_pgd_sec11_header_id(void) {
  return ISAAC_PGDSC11_HEADER_ID;
}
extern "C" int32_t isaac_pgd_sec11_sub_block_count(void) {
  return ISAAC_PGDSC11_SUB_BLOCKS;
}
extern "C" uint32_t isaac_pgd_sec11_row_total(uint32_t c2, uint32_t c3,
                                              uint32_t c1, uint32_t c0) {
  /* machine order: ecx = c2; ecx += c3; ecx += c1; eax = c0; eax +=
     ecx — 32-bit wrap on every add (uint32_t arithmetic wraps). */
  uint32_t ecx = c2;
  ecx += c3;
  ecx += c1;
  return c0 + ecx;
}
extern "C" uint32_t isaac_pgd_sec11_header_cap(uint32_t total) {
  /* `shl eax, 2` @ 0x00928ad0 — 32-bit wrap via uint32_t promotion. */
  return total << 2;
}
extern "C" int32_t isaac_pgd_sec11_sub_cap(int32_t step, uint32_t count) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return -1;
  }
  return (int32_t)(count << 2);
}
extern "C" int32_t isaac_pgd_sec11_rows_from_cap(uint32_t cap) {
  /* reader: `test eax,eax; jle skip` (SIGNED cap > 0) then `shr eax,2`
     (UNSIGNED). Return 0 on the skip path, matching the skipped block. */
  if ((int32_t)cap <= 0) {
    return 0;
  }
  return (int32_t)(cap >> 2);
}
extern "C" int32_t isaac_pgd_sec11_sub_count_zero(uint32_t subcount) {
  /* `cmp [ebp-0x7c], 0 ; jbe done` — UNSIGNED equality to zero. */
  return subcount == 0 ? 1 : 0;
}
extern "C" int32_t isaac_pgd_sec11_tag_valid(uint32_t tag) {
  /* `dec eax; cmp eax, 3 ; ja skip` — (tag-1) UNSIGNED > 3 invalid. */
  uint32_t biased = tag - 1;
  return biased <= 3 ? 1 : 0;
}
extern "C" int32_t isaac_pgd_sec11_sub_loop_back(uint32_t index,
                                                 uint32_t subcount) {
  /* `cmp eax, subcount ; jb` — UNSIGNED continuation. */
  return index < subcount ? 1 : 0;
}
extern "C" int32_t isaac_pgd_sec11_row_loop_back(uint32_t index,
                                                 uint32_t rows) {
  /* `cmp ebx, rows ; jl` — SIGNED continuation (rows < 2^31 by the
     SIGNED cap gate in the reader; the machine still uses jl). */
  return (int32_t)index < (int32_t)rows ? 1 : 0;
}
extern "C" uint32_t isaac_pgd_sec11_total_va(void) {
  return ISAAC_PGDSC11_TOTAL_VA;
}
extern "C" uint32_t isaac_pgd_sec11_total_final_add_va(void) {
  return ISAAC_PGDSC11_TOTAL_FINAL_ADD_VA;
}
extern "C" uint32_t isaac_pgd_sec11_id_store_va(void) {
  return ISAAC_PGDSC11_ID_STORE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_count_dead_store_va(void) {
  return ISAAC_PGDSC11_COUNT_DEAD_STORE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_cap_shl_va(void) {
  return ISAAC_PGDSC11_CAP_SHL_VA;
}
extern "C" uint32_t isaac_pgd_sec11_cap_write_va(void) {
  return ISAAC_PGDSC11_CAP_WRITE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_subcount_store_va(void) {
  return ISAAC_PGDSC11_SUBCOUNT_STORE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_subcount_write_va(void) {
  return ISAAC_PGDSC11_SUBCOUNT_WRITE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_subcount_read_va(void) {
  return ISAAC_PGDSC11_READER_SUBCOUNT_READ_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_handler_va(void) {
  return ISAAC_PGDSC11_READER_HANDLER_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_tag_read_va(void) {
  return ISAAC_PGDSC11_READER_TAG_READ_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_tag_gate_va(void) {
  return ISAAC_PGDSC11_READER_TAG_GATE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_cap_gate_va(void) {
  return ISAAC_PGDSC11_READER_CAP_GATE_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_cap_shr_va(void) {
  return ISAAC_PGDSC11_READER_CAP_SHR_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_row_loop_back_va(void) {
  return ISAAC_PGDSC11_READER_ROW_LOOP_BACK_VA;
}
extern "C" uint32_t isaac_pgd_sec11_reader_sub_loop_back_va(void) {
  return ISAAC_PGDSC11_READER_SUB_LOOP_BACK_VA;
}
extern "C" uint32_t isaac_pgd_sec11_tag_write_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdSec11TagWriteVas[step];
}
extern "C" uint32_t isaac_pgd_sec11_cap_source_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdSec11CapSourceVas[step];
}
extern "C" uint32_t isaac_pgd_sec11_cap_shl_step_va(int32_t step) {
  if (step < 0 || step >= ISAAC_PGDTROW_WALKS) {
    return 0;
  }
  return kPgdSec11CapShlVas[step];
}
extern "C" int32_t isaac_pgd_sec11_framing_matches_row_walk(void) {
  /* The three writer per-walk VA tables must align with the v13 row-walk
     order: tag immediates must equal the v13 walk tags / reader-side
     bestiary tags, and each per-walk cap-source and cap-shl VA must be
     populated (the offset-level cross-law lives in the JS test, which
     compares the cap source against PGD_TREE_ROW_COUNT_OFFS). */
  for (int32_t s = 0; s < ISAAC_PGDTROW_WALKS; ++s) {
    if (kPgdTreeRowTags[s] != kBestiaryTags[s]) {
      return 0;
    }
    if (kPgdSec11CapSourceVas[s] == 0 || kPgdSec11CapShlVas[s] == 0 ||
        kPgdSec11TagWriteVas[s] == 0) {
      return 0;
    }
  }
  return 1;
}

uint32_t isaac_pgd_pure_helpers_abi_version(void) {
  return ISAAC_PGD_PURE_HELPERS_ABI_VERSION;
}

/* ======================== ABI v15 ======================== */

/* ---------- PGDCP: reader-side bestiary count-probe 0x0092aea0 ---------- */

/* The probe 0x0092aea0..0x0092b061 (entry `push ebp ; mov ebp,esp ;
   and esp,0xfffffff8`, `ret 8`, fail ret 0x92b05f / ok ret 0x92b054).
   The game-state tree walk at [0xc7169c]+0x2a670 (header loaded ONCE
   into esi @0x92af65, begin=[esi], empty gate begin==header @0x92af71,
   advance via the v12 iterator++ 0x414a80 @0x92af9a, loop-back node !=
   header @0x92afa3/0x92afa5) plus the +0x15/+0x17c flag block and the
   0x9595e0 callback stay HOST. Landed here: the pure count-derivation
   decisions over sampled inputs. */

namespace {
inline float pgd_count_f32_from_bits(uint32_t bits) {
  /* `movss xmm0, [ecx+0x68]` transports the raw float bits; reproduce
     the bit pattern without any <string.h>/<bit> dependency. */
  float x = 0.0f;
  const uint8_t* src = reinterpret_cast<const uint8_t*>(&bits);
  uint8_t* dst = reinterpret_cast<uint8_t*>(&x);
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
  dst[3] = src[3];
  return x;
}
}  // namespace

extern "C" uint32_t isaac_pgd_count_probe_va(void) {
  return ISAAC_PGDCOUNT_PROBE_VA;
}

extern "C" uint32_t isaac_pgd_count_probe_ret_ok_va(void) {
  return ISAAC_PGDCOUNT_PROBE_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_count_probe_ret_fail_va(void) {
  return ISAAC_PGDCOUNT_PROBE_RET_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_count_probe_next_va(void) {
  return ISAAC_PGDCOUNT_PROBE_NEXT_VA;
}

extern "C" int32_t isaac_pgd_count_probe_call_site_count(void) {
  return ISAAC_PGDCOUNT_PROBE_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_count_probe_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCOUNT_PROBE_CALL_SITES) {
    return 0;
  }
  switch (index) {
    case 0:
      return ISAAC_PGDCOUNT_PROBE_CALL_SITE_0_VA;
    case 1:
      return ISAAC_PGDCOUNT_PROBE_CALL_SITE_1_VA;
    default:
      return ISAAC_PGDCOUNT_PROBE_CALL_SITE_2_VA;
  }
}

extern "C" uint32_t isaac_pgd_count_global_va(void) {
  return ISAAC_PGDCOUNT_GLOBAL_VA;
}

extern "C" uint32_t isaac_pgd_count_game_va(void) {
  return ISAAC_PGDCOUNT_GAME_VA;
}

extern "C" int32_t isaac_pgd_count_tree_off(void) {
  return ISAAC_PGDCOUNT_TREE_OFF;
}

extern "C" int32_t isaac_pgd_count_slot7c_off(void) {
  return ISAAC_PGDCOUNT_SLOT7C_OFF;
}

extern "C" int32_t isaac_pgd_count_float_off(void) {
  return ISAAC_PGDCOUNT_FLOAT_OFF;
}

extern "C" int32_t isaac_pgd_count_flag_off(void) {
  return ISAAC_PGDCOUNT_FLAG_OFF;
}

extern "C" int32_t isaac_pgd_count_slot0_count_off(void) {
  return ISAAC_PGDCOUNT_SLOT0_COUNT_OFF;
}

extern "C" uint32_t isaac_pgd_count_readonly_gate_va(void) {
  return ISAAC_PGDCOUNT_READONLY_GATE_VA;
}

extern "C" uint32_t isaac_pgd_count_store_gate_va(void) {
  return ISAAC_PGDCOUNT_STORE_GATE_VA;
}

extern "C" uint32_t isaac_pgd_count_store_gate_jne_va(void) {
  return ISAAC_PGDCOUNT_STORE_GATE_JNE_VA;
}

extern "C" uint32_t isaac_pgd_count_header_load_va(void) {
  return ISAAC_PGDCOUNT_HEADER_LOAD_VA;
}

extern "C" uint32_t isaac_pgd_count_empty_gate_va(void) {
  return ISAAC_PGDCOUNT_EMPTY_GATE_VA;
}

extern "C" uint32_t isaac_pgd_count_gate1_cmp_va(void) {
  return ISAAC_PGDCOUNT_GATE1_CMP_VA;
}

extern "C" uint32_t isaac_pgd_count_gate1_jl_va(void) {
  return ISAAC_PGDCOUNT_GATE1_JL_VA;
}

extern "C" uint32_t isaac_pgd_count_gate2_movss_va(void) {
  return ISAAC_PGDCOUNT_GATE2_MOVSS_VA;
}

extern "C" uint32_t isaac_pgd_count_gate2_ucomiss_va(void) {
  return ISAAC_PGDCOUNT_GATE2_UCOMISS_VA;
}

extern "C" uint32_t isaac_pgd_count_gate2_lahf_va(void) {
  return ISAAC_PGDCOUNT_GATE2_LAHF_VA;
}

extern "C" uint32_t isaac_pgd_count_gate2_test_va(void) {
  return ISAAC_PGDCOUNT_GATE2_TEST_VA;
}

extern "C" uint32_t isaac_pgd_count_gate2_jnp_va(void) {
  return ISAAC_PGDCOUNT_GATE2_JNP_VA;
}

extern "C" uint32_t isaac_pgd_count_gate3_cmp_va(void) {
  return ISAAC_PGDCOUNT_GATE3_CMP_VA;
}

extern "C" uint32_t isaac_pgd_count_gate3_je_va(void) {
  return ISAAC_PGDCOUNT_GATE3_JE_VA;
}

extern "C" uint32_t isaac_pgd_count_inc_va(void) {
  return ISAAC_PGDCOUNT_INC_VA;
}

extern "C" uint32_t isaac_pgd_count_advance_va(void) {
  return ISAAC_PGDCOUNT_ADVANCE_VA;
}

extern "C" uint32_t isaac_pgd_count_loop_back_cmp_va(void) {
  return ISAAC_PGDCOUNT_LOOP_BACK_CMP_VA;
}

extern "C" uint32_t isaac_pgd_count_loop_back_jne_va(void) {
  return ISAAC_PGDCOUNT_LOOP_BACK_JNE_VA;
}

extern "C" uint32_t isaac_pgd_count_store_va(void) {
  return ISAAC_PGDCOUNT_STORE_VA;
}

extern "C" uint32_t isaac_pgd_count_proceed_cmp_va(void) {
  return ISAAC_PGDCOUNT_PROCEED_CMP_VA;
}

extern "C" uint32_t isaac_pgd_count_proceed_jb_va(void) {
  return ISAAC_PGDCOUNT_PROCEED_JB_VA;
}

extern "C" int32_t isaac_pgd_count_probe_blocked(uint32_t readonly_byte) {
  /* PE 0x92aeae: `cmp byte ptr [ebx + 1], 0 ; jne 0x92b057` — the
     probe aborts (returns 0) when the LOW BYTE of pgd+1 (readonly
     flag) is non-zero. */
  return ((readonly_byte & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_pgd_count_eligible(int32_t slot7c,
                                            uint32_t float_bits,
                                            uint32_t flag_word) {
  /* gate1 @0x92af78/0x92af7c: `cmp dword [ecx+0x7c],0 ; jl skip`
     — SIGNED less-than-zero is not counted. */
  if (slot7c < 0) {
    return 0;
  }
  /* gate2 @0x92af7e..0x92af8a: `movss xmm0,[ecx+0x68] ;
     ucomiss xmm0,xmm1 ; lahf ; test ah,0x44 ; jnp skip`, with
     xmm1 = +0.0f (`xorps xmm1,xmm1` @0x92af75). AH after lahf
     carries ZF at bit 6 and PF at bit 2; `test ah,0x44` keeps
     exactly those two bits and jnp falls through only when their
     parity is ODD. The ucomiss rows are (ZF,PF) = (0,0) for x>0
     and x<0, (1,0) for ordered equal, (1,1) for NaN: the only odd
     row is (1,0) — x == +/-0.0f and NOT NaN. `x != 0.0f` is false
     for +/-0.0f and true for NaN and every non-zero, so it matches
     the machine row-for-row. */
  const float x = pgd_count_f32_from_bits(float_bits);
  if (x != 0.0f) {
    return 0;
  }
  /* gate3 @0x92af8c/0x92af93: `cmp byte ptr [ecx+0x100],0 ; je skip`
     — LOW BYTE of the element flag must be non-zero. */
  if ((flag_word & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_pgd_count_store_needed(uint32_t cached) {
  /* PE 0x92af55/0x92af61/0x92af63: `mov edi,[0xc7f508] ; test
     edi,edi ; jne 0x92afb3` — the walk runs and the store @0x92afad
     executes ONLY when the cached global is ZERO (full-dword zero
     test). */
  return cached == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pgd_count_effective(uint32_t cached,
                                              uint32_t derived) {
  /* On the jne path edi keeps the cached value (the walk is skipped);
     on the fall-through path edi becomes the derived count and the
     store happens. Both arms continue with edi as "the count", so
     effective = cached != 0 ? cached : derived. The PE does NOT
     recapture on the cached path. */
  return cached != 0u ? cached : derived;
}

extern "C" int32_t isaac_pgd_count_proceed(uint32_t map_count_slot0,
                                           uint32_t count) {
  /* PE 0x92afb3/0x92afb9: `cmp [ebx+0xf68], edi ; jb 0x92b019` —
     UNSIGNED map-count < derived skips the game-state block; the
     block runs only when map_count_slot0 >= count. */
  return map_count_slot0 >= count ? 1 : 0;
}

/* ============================================================================
====================== ABI v16 ======================= */

/* ---------- PGDDEATH: GetBestiaryDeathCount 0x0092b070 ---------- */

/* The bestiary slot-3 getter 0x0092b070..0x0092b0f0 (ret 8; ok ret
   0x92b0dd, node-fail ret 0x92b0e7, container-fail ret 0x92b0f0).
   identify-zhl EXACT match: `__thiscall int
   PersistentGameData::GetBestiaryDeathCount(int EntityType, int
   EntityVariant)` (150 pattern bytes). Two inbound E8 sites:
   0x005c2380 and 0x008c78e1. The container find 0x695030 on
   [0xc7169c]+0x2a670, the [eax+0xe8] byte gate, and the map find
   0x4288a0 on pgd+0xf7c stay HOST. Landed here: the pure
   record-key derivation, the node-eligibility decision and the
   value extraction over sampled fields. */

extern "C" uint32_t isaac_pgd_bestiary_death_va(void) {
  return ISAAC_PGDDEATH_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_ret_ok_va(void) {
  return ISAAC_PGDDEATH_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_ret_node_fail_va(void) {
  return ISAAC_PGDDEATH_RET_NODE_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_ret_fail_va(void) {
  return ISAAC_PGDDEATH_RET_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_death_call_site_count(void) {
  return ISAAC_PGDDEATH_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_death_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDDEATH_CALL_SITES) {
    return 0;
  }
  return index == 0 ? ISAAC_PGDDEATH_CALL_SITE_0_VA
                    : ISAAC_PGDDEATH_CALL_SITE_1_VA;
}

extern "C" int32_t isaac_pgd_bestiary_death_slot3_header_off(void) {
  return ISAAC_PGDDEATH_SLOT3_HEADER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_death_marker_off(void) {
  return ISAAC_PGDDEATH_MARKER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_death_key_off(void) {
  return ISAAC_PGDDEATH_KEY_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_death_value_off(void) {
  return ISAAC_PGDDEATH_VALUE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_death_game_va(void) {
  return ISAAC_PGDDEATH_GAME_VA;
}

extern "C" int32_t isaac_pgd_bestiary_death_container_off(void) {
  return ISAAC_PGDDEATH_CONTAINER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_death_gate_byte_off(void) {
  return ISAAC_PGDDEATH_GATE_BYTE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_death_container_find_va(void) {
  return ISAAC_PGDDEATH_CONTAINER_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_map_find_va(void) {
  return ISAAC_PGDDEATH_MAP_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_key_shift12_va(void) {
  return ISAAC_PGDDEATH_KEY_SHIFT12_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_key_or_va(void) {
  return ISAAC_PGDDEATH_KEY_OR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_key_shift8_va(void) {
  return ISAAC_PGDDEATH_KEY_SHIFT8_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_marker_cmp_va(void) {
  return ISAAC_PGDDEATH_MARKER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_marker_jne_va(void) {
  return ISAAC_PGDDEATH_MARKER_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_key_cmp_va(void) {
  return ISAAC_PGDDEATH_KEY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_key_jl_va(void) {
  return ISAAC_PGDDEATH_KEY_JL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_header_cmp_va(void) {
  return ISAAC_PGDDEATH_HEADER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_header_je_va(void) {
  return ISAAC_PGDDEATH_HEADER_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_value_load_va(void) {
  return ISAAC_PGDDEATH_VALUE_LOAD_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_death_key(uint32_t rec_word0,
                                                 uint32_t rec_word1) {
  /* PE 0x92b09e..0x92b0b3: `mov esi,[eax] ; shl esi,0xc ;
     or esi,[eax+4] ; shl esi,8` — the key is built from the two
     record dwords in that exact order, 32-bit wrapping at every
     step. */
  uint32_t key = rec_word0 << 12;
  key |= rec_word1;
  return key << 8;
}

extern "C" int32_t isaac_pgd_bestiary_death_node_ok(uint32_t marker_d,
                                                    int32_t key,
                                                    int32_t node_key,
                                                    uint32_t node_is_header) {
  /* 0x92b0c2/0x92b0c6: `cmp byte [eax+0xd],0 ; jne 0x92b0e0` — the
     marker byte at node+0xd (isnil-style) must be LOW-BYTE zero for
     the node to be a real entry. */
  if ((marker_d & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92b0c8/0x92b0cb: `cmp esi,[eax+0x10] ; jl 0x92b0e0` — SIGNED
     key < node_key fails; equal or greater passes. */
  if (key < node_key) {
    return 0;
  }
  /* 0x92b0cd/0x92b0d3: `cmp eax,[edi+0xf7c] ; je 0x92b0e0` — the
     node must not BE the map header itself. */
  if (node_is_header != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_death_value(uint32_t marker_d,
                                                   int32_t key,
                                                   int32_t node_key,
                                                   uint32_t node_is_header,
                                                   uint32_t node_value) {
  /* Ok path 0x92b0d5: `mov eax,[eax+0x14]` — the value dword at
     node+0x14, returned only when all three node gates pass; both
     fail tails xor eax,eax -> 0. */
  if (isaac_pgd_bestiary_death_node_ok(marker_d, key, node_key,
                                       node_is_header) == 0) {
    return 0u;
  }
  return node_value;
}

/* ---------- PGDKILL: GetBestiaryKillCount 0x0092b100 ---------- */

/* The bestiary slot-1 getter 0x0092b100..0x0092b180 (ret 8; ok ret
   0x92b16d, node-fail ret 0x92b177, container-fail ret 0x92b180).
   identify-zhl EXACT match: `__thiscall int
   PersistentGameData::GetBestiaryKillCount(int EntityType, int
   EntityVariant)` (148 pattern bytes). Seven inbound E8 sites
   (0x5c1d86, 0x5c1e61, 0x5c1eff, 0x8c799e, 0x92ad5e, 0x92adc2,
   0x92add2). NOTE: the v16 handoff spelled the entry "0x92b110" —
   that VA decodes MID-INSTRUCTION inside this body (the true entry is
   0x92b100, the same trap as 0x92b0c0 in v15). The container find
   0x695030 on [0xc7169c]+0x2a670, the [eax+0xe8] byte gate and the
   map find 0x4288a0 on pgd+0xf6c stay HOST. Landed here: the pure
   record-key derivation, the node-eligibility decision and the value
   extraction — the SAME template as PGDDEATH, slot base 0xf6c. */

extern "C" uint32_t isaac_pgd_bestiary_kill_va(void) {
  return ISAAC_PGDKILL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_ret_ok_va(void) {
  return ISAAC_PGDKILL_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_ret_node_fail_va(void) {
  return ISAAC_PGDKILL_RET_NODE_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_ret_fail_va(void) {
  return ISAAC_PGDKILL_RET_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_kill_call_site_count(void) {
  return ISAAC_PGDKILL_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDKILL_CALL_SITES) {
    return 0;
  }
  switch (index) {
    case 0: return ISAAC_PGDKILL_CALL_SITE_0_VA;
    case 1: return ISAAC_PGDKILL_CALL_SITE_1_VA;
    case 2: return ISAAC_PGDKILL_CALL_SITE_2_VA;
    case 3: return ISAAC_PGDKILL_CALL_SITE_3_VA;
    case 4: return ISAAC_PGDKILL_CALL_SITE_4_VA;
    case 5: return ISAAC_PGDKILL_CALL_SITE_5_VA;
    default: return ISAAC_PGDKILL_CALL_SITE_6_VA;
  }
}

extern "C" int32_t isaac_pgd_bestiary_kill_slot1_header_off(void) {
  return ISAAC_PGDKILL_SLOT1_HEADER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_kill_marker_off(void) {
  return ISAAC_PGDKILL_MARKER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_kill_key_off(void) {
  return ISAAC_PGDKILL_KEY_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_kill_value_off(void) {
  return ISAAC_PGDKILL_VALUE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_game_va(void) {
  return ISAAC_PGDKILL_GAME_VA;
}

extern "C" int32_t isaac_pgd_bestiary_kill_container_off(void) {
  return ISAAC_PGDKILL_CONTAINER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_kill_gate_byte_off(void) {
  return ISAAC_PGDKILL_GATE_BYTE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_container_find_va(void) {
  return ISAAC_PGDKILL_CONTAINER_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_map_find_va(void) {
  return ISAAC_PGDKILL_MAP_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_key_shift12_va(void) {
  return ISAAC_PGDKILL_KEY_SHIFT12_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_key_or_va(void) {
  return ISAAC_PGDKILL_KEY_OR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_key_shift8_va(void) {
  return ISAAC_PGDKILL_KEY_SHIFT8_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_marker_cmp_va(void) {
  return ISAAC_PGDKILL_MARKER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_marker_jne_va(void) {
  return ISAAC_PGDKILL_MARKER_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_key_cmp_va(void) {
  return ISAAC_PGDKILL_KEY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_key_jl_va(void) {
  return ISAAC_PGDKILL_KEY_JL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_header_cmp_va(void) {
  return ISAAC_PGDKILL_HEADER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_header_je_va(void) {
  return ISAAC_PGDKILL_HEADER_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_value_load_va(void) {
  return ISAAC_PGDKILL_VALUE_LOAD_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_key(uint32_t rec_word0,
                                                uint32_t rec_word1) {
  /* PE 0x92b12e..0x92b143: `mov esi,[eax] ; shl esi,0xc ;
     or esi,[eax+4] ; shl esi,8` — identical to PGDDEATH. */
  uint32_t key = rec_word0 << 12;
  key |= rec_word1;
  return key << 8;
}

extern "C" int32_t isaac_pgd_bestiary_kill_node_ok(uint32_t marker_d,
                                                   int32_t key,
                                                   int32_t node_key,
                                                   uint32_t node_is_header) {
  /* 0x92b152/0x92b156 `cmp byte [eax+0xd],0 ; jne 0x92b170` — marker
     LOW BYTE must be zero. */
  if ((marker_d & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92b158/0x92b15b `cmp esi,[eax+0x10] ; jl 0x92b170` — SIGNED
     key < node_key fails. */
  if (key < node_key) {
    return 0;
  }
  /* 0x92b15d/0x92b163 `cmp eax,[edi+0xf6c] ; je 0x92b170` — node must
     not BE the map header. */
  if (node_is_header != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_kill_value(uint32_t marker_d,
                                                  int32_t key,
                                                  int32_t node_key,
                                                  uint32_t node_is_header,
                                                  uint32_t node_value) {
  /* Ok path 0x92b165: `mov eax,[eax+0x14]`; fail tails xor eax,eax. */
  if (isaac_pgd_bestiary_kill_node_ok(marker_d, key, node_key,
                                      node_is_header) == 0) {
    return 0u;
  }
  return node_value;
}

/* ---------- PGDENC: GetBestiaryEncounterCount 0x0092b190 ---------- */

/* The bestiary slot-0 getter 0x0092b190..0x0092b1d8 (ret 8; ok ret
   0x92b1cf, container-fail ret 0x92b1d6). identify-zhl EXACT match:
   `__thiscall int PersistentGameData::GetBestiaryEncounterCount(int
   EntityType, int EntityVariant)` (31 pattern bytes). Three inbound
   E8 sites (0x4adf67, 0x5a3b28, 0x92b02e). The key is derived inline
   (@0x92b1ba..0x92b1c2), then the local helper 0x92b1e0..0x92b22a
   (ret 4; its own 2 inbound E8 sites 0x8c68fc / 0x92b1c8) runs the
   map find 0x4288a0 on pgd+0xf64 and the three node gates. NOTE: the
   v16 handoff's "0xf74" slot base was wrong — the machine says
   `lea edi,[ecx+0xf64]` @0x92b1ef and the ZHL struct declares the
   bestiary at 0xf64. The container find 0x695030, the [eax+0xe8]
   byte gate and the map find 0x4288a0 stay HOST; the pure surface is
   the same PGDDEATH template, slot base 0xf64. */

extern "C" uint32_t isaac_pgd_bestiary_encounter_va(void) {
  return ISAAC_PGDENC_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_ret_ok_va(void) {
  return ISAAC_PGDENC_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_ret_fail_va(void) {
  return ISAAC_PGDENC_RET_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_helper_va(void) {
  return ISAAC_PGDENC_HELPER_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_helper_ret_ok_va(void) {
  return ISAAC_PGDENC_HELPER_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_helper_ret_fail_va(void) {
  return ISAAC_PGDENC_HELPER_RET_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_call_site_count(void) {
  return ISAAC_PGDENC_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDENC_CALL_SITES) {
    return 0;
  }
  switch (index) {
    case 0: return ISAAC_PGDENC_CALL_SITE_0_VA;
    case 1: return ISAAC_PGDENC_CALL_SITE_1_VA;
    default: return ISAAC_PGDENC_CALL_SITE_2_VA;
  }
}

extern "C" int32_t isaac_pgd_bestiary_encounter_slot0_header_off(void) {
  return ISAAC_PGDENC_SLOT0_HEADER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_marker_off(void) {
  return ISAAC_PGDENC_MARKER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_key_off(void) {
  return ISAAC_PGDENC_KEY_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_value_off(void) {
  return ISAAC_PGDENC_VALUE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_game_va(void) {
  return ISAAC_PGDENC_GAME_VA;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_container_off(void) {
  return ISAAC_PGDENC_CONTAINER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_gate_byte_off(void) {
  return ISAAC_PGDENC_GATE_BYTE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_container_find_va(void) {
  return ISAAC_PGDENC_CONTAINER_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_map_find_va(void) {
  return ISAAC_PGDENC_MAP_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_key_shift12_va(void) {
  return ISAAC_PGDENC_KEY_SHIFT12_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_key_or_va(void) {
  return ISAAC_PGDENC_KEY_OR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_key_shift8_va(void) {
  return ISAAC_PGDENC_KEY_SHIFT8_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_marker_cmp_va(void) {
  return ISAAC_PGDENC_MARKER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_marker_jne_va(void) {
  return ISAAC_PGDENC_MARKER_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_key_cmp_va(void) {
  return ISAAC_PGDENC_KEY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_key_jl_va(void) {
  return ISAAC_PGDENC_KEY_JL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_header_cmp_va(void) {
  return ISAAC_PGDENC_HEADER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_header_je_va(void) {
  return ISAAC_PGDENC_HEADER_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_value_load_va(void) {
  return ISAAC_PGDENC_VALUE_LOAD_VA;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_helper_call_site_count(void) {
  return ISAAC_PGDENC_HELPER_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_helper_call_site_va(
    int32_t index) {
  if (index < 0 || index >= ISAAC_PGDENC_HELPER_CALL_SITES) {
    return 0;
  }
  return index == 0 ? ISAAC_PGDENC_HELPER_CALL_SITE_0_VA
                    : ISAAC_PGDENC_HELPER_CALL_SITE_1_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_key(uint32_t rec_word0,
                                                     uint32_t rec_word1) {
  /* PE 0x92b1ba..0x92b1c2: `mov ecx,[eax] ; shl ecx,0xc ;
     or ecx,[eax+4] ; shl ecx,8` — identical to PGDDEATH. */
  uint32_t key = rec_word0 << 12;
  key |= rec_word1;
  return key << 8;
}

extern "C" int32_t isaac_pgd_bestiary_encounter_node_ok(uint32_t marker_d,
                                                        int32_t key,
                                                        int32_t node_key,
                                                        uint32_t node_is_header) {
  /* Helper 0x92b206/0x92b20a `cmp byte [eax+0xd],0 ; jne 0x92b220` —
     marker LOW BYTE must be zero. */
  if ((marker_d & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92b20c/0x92b20f `cmp esi,[eax+0x10] ; jl 0x92b220` — SIGNED. */
  if (key < node_key) {
    return 0;
  }
  /* 0x92b211/0x92b213 `cmp eax,[edi] ; je 0x92b220` — edi IS the map
     header (lea edi,[ecx+0xf64] @0x92b1ef), so node must not equal the
     header pointer. */
  if (node_is_header != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_encounter_value(uint32_t marker_d,
                                                       int32_t key,
                                                       int32_t node_key,
                                                       uint32_t node_is_header,
                                                       uint32_t node_value) {
  /* Ok path 0x92b215: `mov eax,[eax+0x14]`; fail tail xors eax. */
  if (isaac_pgd_bestiary_encounter_node_ok(marker_d, key, node_key,
                                           node_is_header) == 0) {
    return 0u;
  }
  return node_value;
}

/* ---------- PGDADDKILL: AddBestiaryKill 0x0092acb0 ---------- */

/* The write-side bestiary mutator 0x0092acb0..0x0092adfd (ret 8;
   ok ret 0x92adf2, fail ret 0x92adfd). identify-zhl EXACT match:
   `__thiscall bool PersistentGameData::AddBestiaryKill(int
   EntityType, int EntityVariant)` (15 pattern bytes). Four inbound
   E8 sites (0x4c8618, 0x59f451, 0x7a0946, 0x92b047). The readonly
   gate `cmp byte [edi+1],0` is the FIRST instruction of the body —
   the same family template as the v15 probe_blocked law. The
   container find (0x695030 on [0xc7169c]+0x2a670), the map find
   (0x4288a0 on pgd+0xf6c), the value-slot accessor (0x92ca70, map
   operator[] with the MSVC SEH prologue), the kill-count getter
   (0x92b100, this = game+0x14) and TryUnlock (0x929a20, this =
   game+0x14) stay HOST. The byte table @0x92ae10 (0x86 entries) and
   the jump table @0x92ae00 {0x92adb9, 0x92ad81, 0x92ad9d, 0x92adea}
   are re-embedded here byte-for-byte from the image. */

namespace {
/* Byte table @0x92ae10 — 0x86 entries read byte-for-byte from the
   image (raw offset 0x52a210): idx 0->0, 1->0, 0x23->1, 0x85->2,
   else->3. */
const uint8_t kPgdAddKillByteTable[0x86] = {
  0x00, 0x00, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x01, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x02};
}  // namespace

extern "C" uint32_t isaac_pgd_bestiary_addkill_va(void) {
  return ISAAC_PGDADDKILL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_ret_ok_va(void) {
  return ISAAC_PGDADDKILL_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_ret_fail_va(void) {
  return ISAAC_PGDADDKILL_RET_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_call_site_count(void) {
  return ISAAC_PGDADDKILL_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDKILL_CALL_SITES) {
    return 0;
  }
  switch (index) {
    case 0:
      return ISAAC_PGDADDKILL_CALL_SITE_0_VA;
    case 1:
      return ISAAC_PGDADDKILL_CALL_SITE_1_VA;
    case 2:
      return ISAAC_PGDADDKILL_CALL_SITE_2_VA;
    default:
      return ISAAC_PGDADDKILL_CALL_SITE_3_VA;
  }
}

extern "C" int32_t isaac_pgd_bestiary_addkill_slot1_header_off(void) {
  return ISAAC_PGDADDKILL_SLOT1_HEADER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_marker_off(void) {
  return ISAAC_PGDADDKILL_MARKER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_key_off(void) {
  return ISAAC_PGDADDKILL_KEY_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_value_off(void) {
  return ISAAC_PGDADDKILL_VALUE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_game_va(void) {
  return ISAAC_PGDADDKILL_GAME_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_container_off(void) {
  return ISAAC_PGDADDKILL_CONTAINER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_gate_byte_off(void) {
  return ISAAC_PGDADDKILL_GATE_BYTE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_container_find_va(void) {
  return ISAAC_PGDADDKILL_CONTAINER_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_map_find_va(void) {
  return ISAAC_PGDADDKILL_MAP_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_value_accessor_va(void) {
  return ISAAC_PGDADDKILL_VALUE_ACCESSOR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_kill_getter_va(void) {
  return ISAAC_PGDADDKILL_KILL_GETTER_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_unlock_va(void) {
  return ISAAC_PGDADDKILL_UNLOCK_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_type_base(void) {
  return ISAAC_PGDADDKILL_TYPE_BASE;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_range(void) {
  return ISAAC_PGDADDKILL_RANGE;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_bt_va(void) {
  return ISAAC_PGDADDKILL_BT_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_bt_entries(void) {
  return ISAAC_PGDADDKILL_BT_ENTRIES;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_jt_va(void) {
  return ISAAC_PGDADDKILL_JT_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_readonly_cmp_va(void) {
  return ISAAC_PGDADDKILL_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_readonly_jne_va(void) {
  return ISAAC_PGDADDKILL_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_rec_test_va(void) {
  return ISAAC_PGDADDKILL_REC_TEST_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_rec_je_va(void) {
  return ISAAC_PGDADDKILL_REC_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_gate_cmp_va(void) {
  return ISAAC_PGDADDKILL_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_gate_je_va(void) {
  return ISAAC_PGDADDKILL_GATE_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_key_shift12_va(void) {
  return ISAAC_PGDADDKILL_KEY_SHIFT12_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_key_or_va(void) {
  return ISAAC_PGDADDKILL_KEY_OR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_key_shift8_va(void) {
  return ISAAC_PGDADDKILL_KEY_SHIFT8_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_marker_cmp_va(void) {
  return ISAAC_PGDADDKILL_MARKER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_marker_jne_va(void) {
  return ISAAC_PGDADDKILL_MARKER_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_key_cmp_va(void) {
  return ISAAC_PGDADDKILL_KEY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_key_jl_va(void) {
  return ISAAC_PGDADDKILL_KEY_JL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_header_cmp_va(void) {
  return ISAAC_PGDADDKILL_HEADER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_header_je_va(void) {
  return ISAAC_PGDADDKILL_HEADER_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_store_inc_va(void) {
  return ISAAC_PGDADDKILL_STORE_INC_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_store_set1_va(void) {
  return ISAAC_PGDADDKILL_STORE_SET1_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_range_cmp_va(void) {
  return ISAAC_PGDADDKILL_RANGE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_range_ja_va(void) {
  return ISAAC_PGDADDKILL_RANGE_JA_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_table_load_va(void) {
  return ISAAC_PGDADDKILL_TABLE_LOAD_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_dispatch_jmp_va(void) {
  return ISAAC_PGDADDKILL_DISPATCH_JMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case1_cmp_va(void) {
  return ISAAC_PGDADDKILL_CASE1_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case1_jb_va(void) {
  return ISAAC_PGDADDKILL_CASE1_JB_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case1_push_va(void) {
  return ISAAC_PGDADDKILL_CASE1_PUSH_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case1_ret_va(void) {
  return ISAAC_PGDADDKILL_CASE1_RET_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case2_cmp_va(void) {
  return ISAAC_PGDADDKILL_CASE2_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case2_jb_va(void) {
  return ISAAC_PGDADDKILL_CASE2_JB_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case2_push_va(void) {
  return ISAAC_PGDADDKILL_CASE2_PUSH_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case2_ret_va(void) {
  return ISAAC_PGDADDKILL_CASE2_RET_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_call1_va(void) {
  return ISAAC_PGDADDKILL_CASE0_CALL1_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_call2_va(void) {
  return ISAAC_PGDADDKILL_CASE0_CALL2_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_add_va(void) {
  return ISAAC_PGDADDKILL_CASE0_ADD_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_cmp_va(void) {
  return ISAAC_PGDADDKILL_CASE0_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_jb_va(void) {
  return ISAAC_PGDADDKILL_CASE0_JB_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_push_va(void) {
  return ISAAC_PGDADDKILL_CASE0_PUSH_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_ok(uint32_t readonly_byte,
                                                 uint32_t rec_found,
                                                 uint32_t gate_byte) {
  /* Entry gates in PE order. 0x92acbb/0x92acbf `cmp byte [edi+1],0 ;
     jne 0x92adf5` — readonly LOW BYTE != 0 -> FAIL. */
  if ((readonly_byte & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92acde/0x92ace0 `test ebx,ebx ; je 0x92adf5` — rec null. */
  if (rec_found == 0u) {
    return 0;
  }
  /* 0x92ace6/0x92aced `cmp byte [ebx+0xe8],0 ; je 0x92adf5` — gate
     byte LOW BYTE == 0 -> FAIL. */
  if ((gate_byte & 0xffu) == 0u) {
    return 0;
  }
  /* Otherwise the function returns 1 ALWAYS: both success tails
     `mov al,1` (0x92ad92 case1, 0x92adea shared); TryUnlock's return
     is discarded. */
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_key(uint32_t rec_word0,
                                                   uint32_t rec_word1) {
  /* PE 0x92acf8..0x92ad0a: `mov esi,[ebx] ; shl esi,0xc ;
     or esi,[ebx+4] ; shl esi,8` — identical to PGDDEATH/PGDKILL. */
  uint32_t key = rec_word0 << 12;
  key |= rec_word1;
  return key << 8;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_node_ok(uint32_t marker_d,
                                                      int32_t key,
                                                      int32_t node_key,
                                                      uint32_t node_is_header) {
  /* 0x92ad19/0x92ad1d `cmp byte [eax+0xd],0 ; jne 0x92ad3a` — marker
     LOW BYTE must be zero. */
  if ((marker_d & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92ad1f/0x92ad22 `cmp esi,[eax+0x10] ; jl 0x92ad3a` — SIGNED
     key < node_key fails. */
  if (key < node_key) {
    return 0;
  }
  /* 0x92ad24/0x92ad26 `cmp eax,[edi] ; je 0x92ad3a` — node must not
     BE the map header ([edi], edi = pgd+0xf6c). */
  if (node_is_header != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_store_value(uint32_t node_ok,
                                                           uint32_t old_value) {
  /* WRITE-side decision: found `inc dword [eax]` @0x92ad36 (old+1
     mod 2^32); NOT found `mov dword [eax],1` @0x92ad48 (INSERT).
     Note the inversion vs the getters: a gate fail here means INSERT
     (return/store 1), NOT return-0. */
  if (node_ok != 0u) {
    return old_value + 1u;
  }
  return 1u;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_dispatch_case(uint32_t type) {
  /* 0x92ad63..0x92ad71: `mov ecx,[ebx] ; add ecx,0xfffffef1 ;
     cmp ecx,0x85 ; ja 0x92adea` — idx = type - 0x10f (32-bit wrap),
     UNSIGNED range gate; idx > 0x85 -> case 3 directly. */
  uint32_t idx = type - 0x10fu;
  if (idx > 0x85u) {
    return 3;
  }
  /* 0x92ad73 `movzx edx, byte [ecx+0x92ae10]`; 0x92ad7a
     `jmp dword [edx*4 + 0x92ae00]` — table value IS the case. */
  return kPgdAddKillByteTable[idx];
}

extern "C" int32_t isaac_pgd_bestiary_addkill_unlock_needed(int32_t dispatch_case,
                                                            uint32_t count) {
  /* case0 0x92add9/0x92addc `cmp esi,0xa ; jb 0x92adea` — UNSIGNED
     sum >= 0xa unlocks. case1 0x92ad81/0x92ad84 and case2
     0x92ad9d/0x92ada0 `cmp eax,0x14 ; jb` — UNSIGNED count >= 0x14
     unlocks. case3 never unlocks. */
  if (dispatch_case == 0) {
    return count >= 0xau ? 1 : 0;
  }
  if (dispatch_case == 1 || dispatch_case == 2) {
    return count >= 0x14u ? 1 : 0;
  }
  return 0;
}

extern "C" int32_t isaac_pgd_bestiary_addkill_unlock_id(int32_t dispatch_case) {
  /* Push sites: case1 0x92ad86 push 0x15d; case2 0x92ada2 push 0x164;
     case0 0x92adde push 0x175; all call 0x929a20 (TryUnlock) with
     ecx = game+0x14. case3 has no push (falls straight to 0x92adea). */
  if (dispatch_case == 0) {
    return 0x175;
  }
  if (dispatch_case == 1) {
    return 0x15d;
  }
  if (dispatch_case == 2) {
    return 0x164;
  }
  return 0;
}

extern "C" uint32_t isaac_pgd_bestiary_addkill_case0_sum(uint32_t n1,
                                                         uint32_t n2) {
  /* 0x92add7 `add esi,eax` — 32-bit wrap. n1 = killcount(0x110, 0)
     (call @0x92adc2), n2 = killcount(0x10f, 0) (call @0x92add2),
     machine call order. */
  return n1 + n2;
}

/* ---------- PGDADDSIB2: slot-2 sibling AddBestiary* mutator ---------- */

/* Wrapper 0x0092aaf0 (ret 8; ok ret 0x92ab35, fail ret 0x92ab3c) ->
   helper 0x0092ab40 (ret 4; readonly-fail 0x92ab58, found 0x92aba5,
   insert 0x92abc5), slot-2 header base pgd+0xf74. Zero ZHL matches
   (address-stable names). The v18 handoff guessed these four VAs were
   AddBestiaryKill-shaped bodies with own unlock dispatches; the
   machine is TWO wrapper/helper pairs — no unlock dispatch, no
   kill-count getter in the set. Wrapper template: readonly gate
   `cmp byte [esi+1],0 ; jne fail` @0x92aaf6/0x92aafa; container find
   (push variant @0x92aafc, push type @0x92ab05, lea ecx,
   [game+0x2a670] @0x92ab08, call 0x695030 @0x92ab0e); rec gate
   `test eax,eax ; je fail` @0x92ab13/0x92ab15; gate byte
   `cmp byte [eax+0xe8],0 ; je fail` @0x92ab17/0x92ab1e; key
   `mov ecx,[eax] ; shl ecx,0xc ; or ecx,[eax+4] ; shl ecx,8`
   @0x92ab20..0x92ab28; `push ecx ; mov ecx,esi ; call 0x92ab40`
   @0x92ab2b/0x92ab2c/0x92ab2e (the wrapper RETURNS the helper's
   bool). Helper template (aligned prologue `55 8b ec 83 e4 f8
   83 ec 10`): its OWN readonly gate `cmp byte [ecx+1],0 ; je
   continue` @0x92ab49/0x92ab4f (fail path ret 4 @0x92ab58);
   `mov edi,[ebp+8]` (key arg); `lea eax,[esp+8] ; push eax ; lea
   esi,[ecx+0xf74] ; mov [esp+0xc],edi ; lea eax,[esp+0x10] ; mov
   ecx,esi ; push eax ; call 0x4288a0` @0x92ab74; node = [esp+0x14];
   node gates marker `cmp byte [eax+0xd],0 ; jne insert`
   @0x92ab7d/0x92ab81, key `cmp edi,[eax+0x10] ; jl insert`
   @0x92ab83/0x92ab86, header `cmp eax,[esi] ; je insert`
   @0x92ab88/0x92ab8a; FOUND `call 0x92ca70 ; inc dword [eax] ; mov
   al,1 ; ret 4` @0x92ab97/0x92ab9c/0x92aba5; NOT-FOUND `call
   0x92ca70 ; mov dword [eax],1 ; mov al,1 ; ret 4`
   @0x92abb3/0x92abba/0x92abc5. Container find 0x695030, map find
   0x4288a0 and the value-slot accessor 0x92ca70 stay HOST. One
   inbound E8 site 0x774461 (image caller, NOT dead); the helper's
   only caller is its own wrapper (0x92ab2e). */

extern "C" uint32_t isaac_pgd_bestiary_addsib2_va(void) {
  return ISAAC_PGDADDSIB2_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_ret_ok_va(void) {
  return ISAAC_PGDADDSIB2_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_ret_fail_va(void) {
  return ISAAC_PGDADDSIB2_RET_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_call_site_count(void) {
  return ISAAC_PGDADDSIB2_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDSIB2_CALL_SITES) {
    return 0;
  }
  return ISAAC_PGDADDSIB2_CALL_SITE_0_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_ret_ok_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_ret_insert_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_RET_INSERT_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_ret_readonly_fail_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_RET_READONLY_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_slot2_header_off(void) {
  return ISAAC_PGDADDSIB2_SLOT2_HEADER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_marker_off(void) {
  return ISAAC_PGDADDSIB2_MARKER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_key_off(void) {
  return ISAAC_PGDADDSIB2_KEY_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_value_off(void) {
  return ISAAC_PGDADDSIB2_VALUE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_game_va(void) {
  return ISAAC_PGDADDSIB2_GAME_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_container_off(void) {
  return ISAAC_PGDADDSIB2_CONTAINER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_gate_byte_off(void) {
  return ISAAC_PGDADDSIB2_GATE_BYTE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_container_find_va(void) {
  return ISAAC_PGDADDSIB2_CONTAINER_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_map_find_va(void) {
  return ISAAC_PGDADDSIB2_MAP_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_value_accessor_va(void) {
  return ISAAC_PGDADDSIB2_VALUE_ACCESSOR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_readonly_cmp_va(void) {
  return ISAAC_PGDADDSIB2_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_readonly_jne_va(void) {
  return ISAAC_PGDADDSIB2_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_rec_test_va(void) {
  return ISAAC_PGDADDSIB2_REC_TEST_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_rec_je_va(void) {
  return ISAAC_PGDADDSIB2_REC_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_gate_cmp_va(void) {
  return ISAAC_PGDADDSIB2_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_gate_je_va(void) {
  return ISAAC_PGDADDSIB2_GATE_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_key_shift12_va(void) {
  return ISAAC_PGDADDSIB2_KEY_SHIFT12_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_key_or_va(void) {
  return ISAAC_PGDADDSIB2_KEY_OR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_key_shift8_va(void) {
  return ISAAC_PGDADDSIB2_KEY_SHIFT8_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_call_site_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_CALL_SITE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_readonly_cmp_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_helper_readonly_je_va(void) {
  return ISAAC_PGDADDSIB2_HELPER_READONLY_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_map_find_call_va(void) {
  return ISAAC_PGDADDSIB2_MAP_FIND_CALL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_node_marker_cmp_va(void) {
  return ISAAC_PGDADDSIB2_NODE_MARKER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_node_marker_jne_va(void) {
  return ISAAC_PGDADDSIB2_NODE_MARKER_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_node_key_cmp_va(void) {
  return ISAAC_PGDADDSIB2_NODE_KEY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_node_key_jl_va(void) {
  return ISAAC_PGDADDSIB2_NODE_KEY_JL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_node_header_cmp_va(void) {
  return ISAAC_PGDADDSIB2_NODE_HEADER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_node_header_je_va(void) {
  return ISAAC_PGDADDSIB2_NODE_HEADER_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_store_inc_va(void) {
  return ISAAC_PGDADDSIB2_STORE_INC_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_store_set1_va(void) {
  return ISAAC_PGDADDSIB2_STORE_SET1_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_ok(uint32_t readonly_byte,
                                                 uint32_t rec_found,
                                                 uint32_t gate_byte,
                                                 uint32_t readonly_byte_helper) {
  /* Wrapper gates in PE order: 0x92aaf6/0x92aafa `cmp byte [esi+1],0
     ; jne fail` — readonly LOW BYTE != 0 -> FAIL. */
  if ((readonly_byte & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92ab13/0x92ab15 `test eax,eax ; je fail` — rec null. */
  if (rec_found == 0u) {
    return 0;
  }
  /* 0x92ab17/0x92ab1e `cmp byte [eax+0xe8],0 ; je fail` — gate byte
     LOW BYTE == 0 -> FAIL. */
  if ((gate_byte & 0xffu) == 0u) {
    return 0;
  }
  /* The helper re-checks the same pgd+1 byte as its own gate:
     0x92ab49/0x92ab4f `cmp byte [ecx+1],0 ; je continue` — LOW BYTE
     != 0 -> the helper returns 0 and the wrapper propagates it. */
  if ((readonly_byte_helper & 0xffu) != 0u) {
    return 0;
  }
  /* Otherwise the wrapper returns the helper's al = 1 ALWAYS (the
     helper's store paths both `mov al,1` @0x92ab9e/@0x92abc0). */
  return 1;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_helper_ok(
    uint32_t readonly_byte_helper) {
  /* The store helper's own bool: fail path `xor al,al ; ret 4`
     @0x92ab58 only when its readonly gate fails; both store paths
     return 1. */
  if ((readonly_byte_helper & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_key(uint32_t rec_word0,
                                                   uint32_t rec_word1) {
  /* PE 0x92ab20..0x92ab28: `mov ecx,[eax] ; shl ecx,0xc ; or
     ecx,[eax+4] ; shl ecx,8` — the PGDKILL/PGDENC/PGDADDKILL key
     law, distinct evidence VAs. */
  uint32_t key = rec_word0 << 12;
  key |= rec_word1;
  return key << 8;
}

extern "C" int32_t isaac_pgd_bestiary_addsib2_node_ok(uint32_t marker_d,
                                                      int32_t key,
                                                      int32_t node_key,
                                                      uint32_t node_is_header) {
  /* 0x92ab7d/0x92ab81 `cmp byte [eax+0xd],0 ; jne insert` — marker
     LOW BYTE must be zero. */
  if ((marker_d & 0xffu) != 0u) {
    return 0;
  }
  /* 0x92ab83/0x92ab86 `cmp edi,[eax+0x10] ; jl insert` — SIGNED
     key < node_key fails. */
  if (key < node_key) {
    return 0;
  }
  /* 0x92ab88/0x92ab8a `cmp eax,[esi] ; je insert` — node must not BE
     the slot-2 map header ([esi], esi = pgd+0xf74). */
  if (node_is_header != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib2_store_value(uint32_t node_ok,
                                                           uint32_t old_value) {
  /* WRITE-side decision: found `inc dword [eax]` @0x92ab9c (old+1
     mod 2^32); NOT found `mov dword [eax],1` @0x92abba (INSERT).
     Same inversion as PGDADDKILL — a gate fail here means INSERT,
     NOT return-0 — but there is no unlock dispatch in this pair. */
  if (node_ok != 0u) {
    return old_value + 1u;
  }
  return 1u;
}

/* ---------- PGDADDSIB3: slot-3 sibling AddBestiary* mutator ---------- */

/* Same wrapper/helper template as PGDADDSIB2 on the slot-3 map:
   wrapper 0x0092abd0 (ret 8; ok ret 0x92ac15, fail ret 0x92ac1c) ->
   helper 0x0092ac20 (ret 4; readonly-fail 0x92ac38, found 0x92ac85,
   insert 0x92aca5), slot-3 header base pgd+0xf7c
   (`lea esi,[ecx+0xf7c]` @0x92ac43). One inbound E8 site 0x7780c8
   (image caller, NOT dead); the helper's only caller is its own
   wrapper (0x92ac0e). Evidence VAs: wrapper gates
   0x92abd6/0x92abda (readonly), 0x92abf3/0x92abf5 (rec),
   0x92abf7/0x92abfe (gate byte); key 0x92ac02/0x92ac05/0x92ac08;
   helper readonly 0x92ac29/0x92ac2f; map find call 0x92ac54; node
   gates 0x92ac5d/0x92ac61 (marker), 0x92ac63/0x92ac66 (key),
   0x92ac68/0x92ac6a (header); stores 0x92ac7c (inc) / 0x92ac9a
   (set1). */

extern "C" uint32_t isaac_pgd_bestiary_addsib3_va(void) {
  return ISAAC_PGDADDSIB3_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_ret_ok_va(void) {
  return ISAAC_PGDADDSIB3_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_ret_fail_va(void) {
  return ISAAC_PGDADDSIB3_RET_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_call_site_count(void) {
  return ISAAC_PGDADDSIB3_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDSIB3_CALL_SITES) {
    return 0;
  }
  return ISAAC_PGDADDSIB3_CALL_SITE_0_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_ret_ok_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_RET_OK_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_ret_insert_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_RET_INSERT_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_ret_readonly_fail_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_RET_READONLY_FAIL_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_slot3_header_off(void) {
  return ISAAC_PGDADDSIB3_SLOT3_HEADER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_marker_off(void) {
  return ISAAC_PGDADDSIB3_MARKER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_key_off(void) {
  return ISAAC_PGDADDSIB3_KEY_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_value_off(void) {
  return ISAAC_PGDADDSIB3_VALUE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_game_va(void) {
  return ISAAC_PGDADDSIB3_GAME_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_container_off(void) {
  return ISAAC_PGDADDSIB3_CONTAINER_OFF;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_gate_byte_off(void) {
  return ISAAC_PGDADDSIB3_GATE_BYTE_OFF;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_container_find_va(void) {
  return ISAAC_PGDADDSIB3_CONTAINER_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_map_find_va(void) {
  return ISAAC_PGDADDSIB3_MAP_FIND_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_value_accessor_va(void) {
  return ISAAC_PGDADDSIB3_VALUE_ACCESSOR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_readonly_cmp_va(void) {
  return ISAAC_PGDADDSIB3_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_readonly_jne_va(void) {
  return ISAAC_PGDADDSIB3_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_rec_test_va(void) {
  return ISAAC_PGDADDSIB3_REC_TEST_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_rec_je_va(void) {
  return ISAAC_PGDADDSIB3_REC_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_gate_cmp_va(void) {
  return ISAAC_PGDADDSIB3_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_gate_je_va(void) {
  return ISAAC_PGDADDSIB3_GATE_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_key_shift12_va(void) {
  return ISAAC_PGDADDSIB3_KEY_SHIFT12_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_key_or_va(void) {
  return ISAAC_PGDADDSIB3_KEY_OR_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_key_shift8_va(void) {
  return ISAAC_PGDADDSIB3_KEY_SHIFT8_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_call_site_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_CALL_SITE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_readonly_cmp_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_helper_readonly_je_va(void) {
  return ISAAC_PGDADDSIB3_HELPER_READONLY_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_map_find_call_va(void) {
  return ISAAC_PGDADDSIB3_MAP_FIND_CALL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_node_marker_cmp_va(void) {
  return ISAAC_PGDADDSIB3_NODE_MARKER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_node_marker_jne_va(void) {
  return ISAAC_PGDADDSIB3_NODE_MARKER_JNE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_node_key_cmp_va(void) {
  return ISAAC_PGDADDSIB3_NODE_KEY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_node_key_jl_va(void) {
  return ISAAC_PGDADDSIB3_NODE_KEY_JL_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_node_header_cmp_va(void) {
  return ISAAC_PGDADDSIB3_NODE_HEADER_CMP_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_node_header_je_va(void) {
  return ISAAC_PGDADDSIB3_NODE_HEADER_JE_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_store_inc_va(void) {
  return ISAAC_PGDADDSIB3_STORE_INC_VA;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_store_set1_va(void) {
  return ISAAC_PGDADDSIB3_STORE_SET1_VA;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_ok(uint32_t readonly_byte,
                                                 uint32_t rec_found,
                                                 uint32_t gate_byte,
                                                 uint32_t readonly_byte_helper) {
  /* Same four-gate template as sib2 (distinct evidence VAs: wrapper
     0x92abd6/0x92abda, 0x92abf3/0x92abf5, 0x92abf7/0x92abfe; helper
     0x92ac29/0x92ac2f). */
  if ((readonly_byte & 0xffu) != 0u) {
    return 0;
  }
  if (rec_found == 0u) {
    return 0;
  }
  if ((gate_byte & 0xffu) == 0u) {
    return 0;
  }
  if ((readonly_byte_helper & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_helper_ok(
    uint32_t readonly_byte_helper) {
  if ((readonly_byte_helper & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_key(uint32_t rec_word0,
                                                   uint32_t rec_word1) {
  uint32_t key = rec_word0 << 12;
  key |= rec_word1;
  return key << 8;
}

extern "C" int32_t isaac_pgd_bestiary_addsib3_node_ok(uint32_t marker_d,
                                                      int32_t key,
                                                      int32_t node_key,
                                                      uint32_t node_is_header) {
  if ((marker_d & 0xffu) != 0u) {
    return 0;
  }
  if (key < node_key) {
    return 0;
  }
  if (node_is_header != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_bestiary_addsib3_store_value(uint32_t node_ok,
                                                           uint32_t old_value) {
  if (node_ok != 0u) {
    return old_value + 1u;
  }
  return 1u;
}

/* ---------- PGDADDCH: AddChallenge dispatcher 0x0092a7b0 ---------- */

/* The 45 unlock ids by table index (arg = index + 1). Re-read
   dword-for-dword from the image @0x92aa30 AND cross-checked against
   the arm immediates (two independent extractions). */
namespace {
const uint32_t kAddChallengeUnlockIds[ISAAC_PGDADDCH_TABLE_ENTRIES] = {
    0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x78, 0x60, 0x61, 0x62,
    0x63, 0x64, 0x3c, 0x3f, 0x65, 0x66, 0x67, 0x68, 0x3e, 0x5f,
    0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
    0x14b, 0x14c, 0x14d, 0x14e, 0x14f, 0x205, 0x206, 0x207, 0x208,
    0x209, 0x20a, 0x213, 0x214, 0x215, 0x21a};
}  // namespace

extern "C" uint32_t isaac_pgd_addchallenge_va(void) {
  return ISAAC_PGDADDCH_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_ret_fail_va(void) {
  return ISAAC_PGDADDCH_RET_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_ret_fail_tail_va(void) {
  return ISAAC_PGDADDCH_RET_FAIL_TAIL_VA;
}

extern "C" int32_t isaac_pgd_addchallenge_call_site_count(void) {
  return ISAAC_PGDADDCH_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_addchallenge_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDCH_CALL_SITES) {
    return 0;
  }
  return ISAAC_PGDADDCH_CALL_SITE_0_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_readonly_cmp_va(void) {
  return ISAAC_PGDADDCH_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_readonly_jne_va(void) {
  return ISAAC_PGDADDCH_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_arg_gate1_cmp_va(void) {
  return ISAAC_PGDADDCH_ARG_GATE1_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_arg_gate1_ja_va(void) {
  return ISAAC_PGDADDCH_ARG_GATE1_JA_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_flag_store_va(void) {
  return ISAAC_PGDADDCH_FLAG_STORE_VA;
}

extern "C" int32_t isaac_pgd_addchallenge_flag_off(void) {
  return ISAAC_PGDADDCH_FLAG_OFF;
}

extern "C" uint32_t isaac_pgd_addchallenge_dec_va(void) {
  return ISAAC_PGDADDCH_DEC_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_arg_gate2_cmp_va(void) {
  return ISAAC_PGDADDCH_ARG_GATE2_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_arg_gate2_ja_va(void) {
  return ISAAC_PGDADDCH_ARG_GATE2_JA_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_jump_va(void) {
  return ISAAC_PGDADDCH_JUMP_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_table_va(void) {
  return ISAAC_PGDADDCH_TABLE_VA;
}

extern "C" int32_t isaac_pgd_addchallenge_table_entries(void) {
  return ISAAC_PGDADDCH_TABLE_ENTRIES;
}

extern "C" uint32_t isaac_pgd_addchallenge_first_arm_va(void) {
  return ISAAC_PGDADDCH_FIRST_ARM_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_last_arm_va(void) {
  return ISAAC_PGDADDCH_LAST_ARM_VA;
}

extern "C" uint32_t isaac_pgd_addchallenge_tail_target_va(void) {
  return ISAAC_PGDADDCH_TAIL_TARGET_VA;
}

extern "C" int32_t isaac_pgd_addchallenge_max_arg(void) {
  return ISAAC_PGDADDCH_MAX_ARG;
}

extern "C" int32_t isaac_pgd_addchallenge_max_index(void) {
  return ISAAC_PGDADDCH_MAX_INDEX;
}

extern "C" uint32_t isaac_pgd_addchallenge_table_entry_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDCH_TABLE_ENTRIES) {
    return 0;
  }
  return ISAAC_PGDADDCH_FIRST_ARM_VA + (uint32_t)index * 13u;
}

extern "C" uint32_t isaac_pgd_addchallenge_unlock_id(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDCH_TABLE_ENTRIES) {
    return 0;
  }
  return kAddChallengeUnlockIds[index];
}

/* Entry gates: readonly LOW BYTE != 0 (0x92a7b3/0x92a7ba cmp byte
   [ecx+1],0 ; jne fail) OR arg UNSIGNED > 0x2d (0x92a7c0/0x92a7c3
   cmp eax,0x2d ; ja fail) -> 0 (no flag store); else 1 — the flag
   byte `mov byte [eax+ecx+0xe6f],1` @0x92a7c9 runs. The store
   executes BEFORE the dispatch gate, so arg 0 STOREs challenges[0]
   yet never unlocks. */
extern "C" int32_t isaac_pgd_addchallenge_flag_store_gate(
    uint32_t readonly_byte, uint32_t arg) {
  if ((readonly_byte & 0xffu) != 0u) {
    return 0;
  }
  if (arg > 0x2du) {
    return 0;
  }
  return 1;
}

/* Full dispatch gate: flag_store AND `dec eax ; cmp eax,0x2c ; ja
   fail` (0x92a7d1/0x92a7d2/0x92a7d5): (arg-1) UNSIGNED > 0x2c fails.
   arg == 0 -> (0-1) mod 2^32 = 0xffffffff > 0x2c -> 0. */
extern "C" int32_t isaac_pgd_addchallenge_dispatch_gate(
    uint32_t readonly_byte, uint32_t arg) {
  if ((readonly_byte & 0xffu) != 0u) {
    return 0;
  }
  if (arg > 0x2du) {
    return 0;
  }
  if ((arg - 1u) > 0x2cu) {
    return 0;
  }
  return 1;
}

/* Store address law: flag byte offset = 0xe6f + arg mod 2^32
   (`mov byte [eax+ecx+0xe6f],1` @0x92a7c9). */
extern "C" uint32_t isaac_pgd_addchallenge_flag_byte_off(uint32_t arg) {
  return 0xe6fu + arg;
}

/* Tail-call selection: unlock id = table[arg-1] when the dispatch
   gate passes (arg in [1, 0x2d]); else 0 (fail tail 0x92aa2b,
   ret 4 @0x92aa2c). The arm writes the id into [ebp+8] then
   `pop ebp ; jmp 0x929a20` (TryUnlock, this = ecx unchanged). */
extern "C" uint32_t isaac_pgd_addchallenge_unlock_id_for_arg(uint32_t arg) {
  if (arg > 0x2du) {
    return 0;
  }
  const uint32_t index = arg - 1u;
  if (index > 0x2cu) {
    return 0;
  }
  return kAddChallengeUnlockIds[index];
}

/* ---------- PGDADDBOSS: AddBoss mutator 0x0092a5e0 ---------- */

/* The eight unlock blocks in machine order. Each block's gate is an
   ALL-nonzero AND over its byte offsets (`cmp byte [esi+0x..],0 ;
   je <next block>`); when every byte is nonzero the machine pushes
   <id> and `mov ecx,esi ; call 0x929a20` (TryUnlock, this = esi).
   first_cmp = block's first gate cmp VA, call_va = the TryUnlock
   call site, push_va = the id push VA. Re-read from the listing
   0x92a617..0x92a798; e0d is read by BOTH B3 and B8 (the machine
   re-reads it; the laws must too). */
namespace {
const struct AddBossBlock {
  uint32_t first_cmp_va;
  uint32_t call_va;
  uint32_t push_va;
  uint32_t unlock_id;
  uint8_t byte_count;
  uint16_t byte_offs[6];
} kAddBossBlocks[ISAAC_PGDADDBOSS_UNLOCK_BLOCKS] = {
    {0x0092a617u, 0x0092a651u, 0x0092a64du, 0x56, 6,
     {0xe08, 0xe09, 0xe14, 0xe18, 0xe33, 0xe3f}},
    {0x0092a656u, 0x0092a690u, 0x0092a68cu, 0x57, 6,
     {0xe0a, 0xe0b, 0xe15, 0xe23, 0xe36, 0xe34}},
    {0x0092a695u, 0x0092a6c6u, 0x0092a6c2u, 0x58, 5,
     {0xe0c, 0xe0d, 0xe16, 0xe37, 0xe35}},
    {0x0092a6cbu, 0x0092a6d8u, 0x0092a6d4u, 0x0f, 1,
     {0xe26}},
    {0x0092a6ddu, 0x0092a711u, 0x0092a70au, 0x174, 5,
     {0xe10, 0xe11, 0xe12, 0xe13, 0xe2d}},
    {0x0092a716u, 0x0092a741u, 0x0092a73au, 0x19c, 4,
     {0xe54, 0xe52, 0xe53, 0xe62}},
    {0x0092a746u, 0x0092a771u, 0x0092a76au, 0x19d, 4,
     {0xe5a, 0xe57, 0xe51, 0xe59}},
    {0x0092a776u, 0x0092a798u, 0x0092a791u, 0x19e, 3,
     {0xe0d, 0xe56, 0xe58}},
};
}  // namespace

extern "C" uint32_t isaac_pgd_addboss_va(void) {
  return ISAAC_PGDADDBOSS_VA;
}

extern "C" uint32_t isaac_pgd_addboss_ret_fail_va(void) {
  return ISAAC_PGDADDBOSS_RET_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_addboss_ret_fail_tail_va(void) {
  return ISAAC_PGDADDBOSS_RET_FAIL_TAIL_VA;
}

extern "C" int32_t isaac_pgd_addboss_call_site_count(void) {
  return ISAAC_PGDADDBOSS_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_addboss_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDADDBOSS_CALL_SITES) {
    return 0;
  }
  return index == 0 ? ISAAC_PGDADDBOSS_CALL_SITE_0_VA
                    : ISAAC_PGDADDBOSS_CALL_SITE_1_VA;
}

extern "C" uint32_t isaac_pgd_addboss_readonly_cmp_va(void) {
  return ISAAC_PGDADDBOSS_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addboss_readonly_jne_va(void) {
  return ISAAC_PGDADDBOSS_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_addboss_arg_gate_cmp_va(void) {
  return ISAAC_PGDADDBOSS_ARG_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addboss_arg_gate_jge_va(void) {
  return ISAAC_PGDADDBOSS_ARG_GATE_JGE_VA;
}

extern "C" uint32_t isaac_pgd_addboss_flag_store_va(void) {
  return ISAAC_PGDADDBOSS_FLAG_STORE_VA;
}

extern "C" int32_t isaac_pgd_addboss_flag_off(void) {
  return ISAAC_PGDADDBOSS_FLAG_OFF;
}

extern "C" uint32_t isaac_pgd_addboss_dirty_store_va(void) {
  return ISAAC_PGDADDBOSS_DIRTY_STORE_VA;
}

extern "C" int32_t isaac_pgd_addboss_dirty_off(void) {
  return ISAAC_PGDADDBOSS_DIRTY_OFF;
}

extern "C" uint32_t isaac_pgd_addboss_log_string_va(void) {
  return ISAAC_PGDADDBOSS_LOG_STRING_VA;
}

extern "C" uint32_t isaac_pgd_addboss_log_call_va(void) {
  return ISAAC_PGDADDBOSS_LOG_CALL_VA;
}

extern "C" uint32_t isaac_pgd_addboss_log_callee_va(void) {
  return ISAAC_PGDADDBOSS_LOG_CALLEE_VA;
}

extern "C" uint32_t isaac_pgd_addboss_unlock_chain_va(void) {
  return ISAAC_PGDADDBOSS_UNLOCK_CHAIN_VA;
}

extern "C" int32_t isaac_pgd_addboss_unlock_blocks(void) {
  return ISAAC_PGDADDBOSS_UNLOCK_BLOCKS;
}

extern "C" uint32_t isaac_pgd_addboss_tail_target_va(void) {
  return ISAAC_PGDADDBOSS_TAIL_TARGET_VA;
}

extern "C" int32_t isaac_pgd_addboss_max_arg(void) {
  return ISAAC_PGDADDBOSS_MAX_ARG;
}

extern "C" int32_t isaac_pgd_addboss_max_index(void) {
  return ISAAC_PGDADDBOSS_MAX_INDEX;
}

extern "C" uint32_t isaac_pgd_addboss_block_first_cmp_va(
    int32_t block_index) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  return kAddBossBlocks[block_index].first_cmp_va;
}

extern "C" uint32_t isaac_pgd_addboss_block_call_va(int32_t block_index) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  return kAddBossBlocks[block_index].call_va;
}

extern "C" uint32_t isaac_pgd_addboss_block_push_va(int32_t block_index) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  return kAddBossBlocks[block_index].push_va;
}

extern "C" int32_t isaac_pgd_addboss_block_byte_count(int32_t block_index) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  return kAddBossBlocks[block_index].byte_count;
}

extern "C" uint32_t isaac_pgd_addboss_block_byte_off(int32_t block_index,
                                                     int32_t slot) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  const AddBossBlock& blk = kAddBossBlocks[block_index];
  if (slot < 0 || slot >= blk.byte_count) {
    return 0;
  }
  return blk.byte_offs[slot];
}

extern "C" uint32_t isaac_pgd_addboss_block_unlock_id(int32_t block_index) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  return kAddBossBlocks[block_index].unlock_id;
}

/* Entry gates in machine order (0x92a5e6/0x92a5ea readonly LOW BYTE,
   0x92a5f3/0x92a5f6 `cmp eax,0x68 ; jge fail` SIGNED with NO floor):
   1 iff (readonly & 0xff) == 0 AND arg < 0x68 as SIGNED — negative
   bossIDs PASS (there is no lower bound; a negative arg wraps the
   store offset). On 1 the machine runs the flag store `mov byte
   [eax+esi+0xe07],1` @0x92a602, the dirty store `mov byte
   [esi],1` @0x92a60c, and the host log @0x92a60f. */
extern "C" int32_t isaac_pgd_addboss_entry_gate(uint32_t readonly_byte,
                                                uint32_t arg) {
  if ((readonly_byte & 0xffu) != 0u) {
    return 0;
  }
  if ((int32_t)arg >= 0x68) {
    return 0;
  }
  return 1;
}

/* Store address law: flag byte offset = 0xe07 + arg mod 2^32
   (`mov byte [eax+esi+0xe07],1` @0x92a602; negatives underflow). */
extern "C" uint32_t isaac_pgd_addboss_flag_byte_off(uint32_t arg) {
  return 0xe07u + arg;
}

/* Per-block gate: 1 iff ALL bytes in the block's offset set are
   nonzero (`cmp byte [esi+off],0 ; je <next>`). Only the block's
   declared byte count is read — trailing bN args are ignored, exactly
   as the machine reads only its own offsets. block_index outside
   0..7 -> 0 (no block). */
extern "C" int32_t isaac_pgd_addboss_block_gate(int32_t block_index,
                                                uint32_t b0, uint32_t b1,
                                                uint32_t b2, uint32_t b3,
                                                uint32_t b4, uint32_t b5) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  const AddBossBlock& blk = kAddBossBlocks[block_index];
  const uint32_t bytes[6] = {b0, b1, b2, b3, b4, b5};
  for (int32_t s = 0; s < blk.byte_count; ++s) {
    if ((bytes[s] & 0xffu) == 0u) {
      return 0;
    }
  }
  return 1;
}

/* Unlock decision: block gate passes -> the machine pushes <id> and
   `mov ecx,esi ; call 0x929a20` (TryUnlock, this = esi). All eight
   blocks run in sequence; each TryUnlock call returns, so an earlier
   pass never stops later blocks. */
extern "C" uint32_t isaac_pgd_addboss_unlock_fires(int32_t block_index,
                                                   uint32_t b0, uint32_t b1,
                                                   uint32_t b2, uint32_t b3,
                                                   uint32_t b4, uint32_t b5) {
  if (block_index < 0 || block_index >= ISAAC_PGDADDBOSS_UNLOCK_BLOCKS) {
    return 0;
  }
  if (!isaac_pgd_addboss_block_gate(block_index, b0, b1, b2, b3, b4, b5)) {
    return 0;
  }
  return kAddBossBlocks[block_index].unlock_id;
}

/* ======================== ABI v22: PGDADDMINI ========================
   PersistentGameData::AddMiniBoss mutator 0x0092a520 (no exact ZHL —
   self-named by its warning string "[warn] AddMiniBoss: invalid
   miniboss id %d" @0xb7aecc; address-stable; ret 4 @0x92a5d3; TWO
   rets: OK @0x92a5be, fail/warn tail @0x92a5d1..0x92a5d3; int3 pad
   @0x92a5d6; callers 0x7ffff1 / 0x800010 byte-scan verified;
   TryUnlock 0x929a20 + log helper 0xa112c0 stay HOST).
   Laws agree with the v2 PGDX sec5 oracle; v22 adds the
   branch-level evidence and the warn/silent outcome distinction. */

extern "C" uint32_t isaac_pgd_addmini_va(void) {
  return ISAAC_PGDADDMINI_VA;
}

extern "C" uint32_t isaac_pgd_addmini_ret_fail_va(void) {
  return ISAAC_PGDADDMINI_RET_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_addmini_ret_fail_tail_va(void) {
  return ISAAC_PGDADDMINI_RET_FAIL_TAIL_VA;
}

extern "C" uint32_t isaac_pgd_addmini_ret_ok_va(void) {
  return ISAAC_PGDADDMINI_RET_OK_VA;
}

extern "C" int32_t isaac_pgd_addmini_call_site_count(void) {
  return ISAAC_PGDADDMINI_CALL_SITES;
}

extern "C" uint32_t isaac_pgd_addmini_call_site_va(int32_t index) {
  if (index == 0) {
    return ISAAC_PGDADDMINI_CALL_SITE_0_VA;
  }
  if (index == 1) {
    return ISAAC_PGDADDMINI_CALL_SITE_1_VA;
  }
  return 0;
}

extern "C" uint32_t isaac_pgd_addmini_readonly_cmp_va(void) {
  return ISAAC_PGDADDMINI_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addmini_readonly_jne_va(void) {
  return ISAAC_PGDADDMINI_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_addmini_arg_gate_cmp_va(void) {
  return ISAAC_PGDADDMINI_ARG_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addmini_arg_gate_ja_va(void) {
  return ISAAC_PGDADDMINI_ARG_GATE_JA_VA;
}

extern "C" uint32_t isaac_pgd_addmini_map_lea_va(void) {
  return ISAAC_PGDADDMINI_MAP_LEA_VA;
}

extern "C" uint32_t isaac_pgd_addmini_map_cmp_va(void) {
  return ISAAC_PGDADDMINI_MAP_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addmini_map_ja_va(void) {
  return ISAAC_PGDADDMINI_MAP_JA_VA;
}

extern "C" uint32_t isaac_pgd_addmini_alias_cmp_va(void) {
  return ISAAC_PGDADDMINI_ALIAS_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addmini_alias_jne_va(void) {
  return ISAAC_PGDADDMINI_ALIAS_JNE_VA;
}

extern "C" uint32_t isaac_pgd_addmini_alias_mov_va(void) {
  return ISAAC_PGDADDMINI_ALIAS_MOV_VA;
}

extern "C" uint32_t isaac_pgd_addmini_tail_cmp_va(void) {
  return ISAAC_PGDADDMINI_TAIL_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addmini_tail_jg_va(void) {
  return ISAAC_PGDADDMINI_TAIL_JG_VA;
}

extern "C" uint32_t isaac_pgd_addmini_flag_store_va(void) {
  return ISAAC_PGDADDMINI_FLAG_STORE_VA;
}

extern "C" int32_t isaac_pgd_addmini_flag_off(void) {
  return ISAAC_PGDADDMINI_FLAG_OFF;
}

extern "C" uint32_t isaac_pgd_addmini_dirty_store_va(void) {
  return ISAAC_PGDADDMINI_DIRTY_STORE_VA;
}

extern "C" int32_t isaac_pgd_addmini_dirty_off(void) {
  return ISAAC_PGDADDMINI_DIRTY_OFF;
}

extern "C" uint32_t isaac_pgd_addmini_log_string_va(void) {
  return ISAAC_PGDADDMINI_LOG_STRING_VA;
}

extern "C" uint32_t isaac_pgd_addmini_log_call_va(void) {
  return ISAAC_PGDADDMINI_LOG_CALL_VA;
}

extern "C" uint32_t isaac_pgd_addmini_log_callee_va(void) {
  return ISAAC_PGDADDMINI_LOG_CALLEE_VA;
}

extern "C" uint32_t isaac_pgd_addmini_warn_string_va(void) {
  return ISAAC_PGDADDMINI_WARN_STRING_VA;
}

extern "C" uint32_t isaac_pgd_addmini_warn_call_va(void) {
  return ISAAC_PGDADDMINI_WARN_CALL_VA;
}

extern "C" uint32_t isaac_pgd_addmini_unlock_first_cmp_va(void) {
  return ISAAC_PGDADDMINI_UNLOCK_FIRST_CMP_VA;
}

extern "C" uint32_t isaac_pgd_addmini_unlock_push_va(void) {
  return ISAAC_PGDADDMINI_UNLOCK_PUSH_VA;
}

extern "C" uint32_t isaac_pgd_addmini_unlock_call_va(void) {
  return ISAAC_PGDADDMINI_UNLOCK_CALL_VA;
}

extern "C" uint32_t isaac_pgd_addmini_unlock_target_va(void) {
  return ISAAC_PGDADDMINI_UNLOCK_TARGET_VA;
}

extern "C" int32_t isaac_pgd_addmini_slots(void) {
  return ISAAC_PGDADDMINI_SLOTS;
}

extern "C" int32_t isaac_pgd_addmini_unlock_id(void) {
  return ISAAC_PGDADDMINI_UNLOCK_ID;
}

extern "C" int32_t isaac_pgd_addmini_id_max(void) {
  return ISAAC_PGDADDMINI_ID_MAX;
}

extern "C" int32_t isaac_pgd_addmini_remap_base(void) {
  return ISAAC_PGDADDMINI_REMAP_BASE;
}

extern "C" int32_t isaac_pgd_addmini_remap_span(void) {
  return ISAAC_PGDADDMINI_REMAP_SPAN;
}

extern "C" int32_t isaac_pgd_addmini_alias_id(void) {
  return ISAAC_PGDADDMINI_ALIAS_ID;
}

/* id -> index remap, branch by branch (0x92a533..0x92a557):
   `cmp eax,0xf ; ja warn` UNSIGNED -> asU32(arg) > 0xf is out of
   range (-1, the WARN path); `lea ecx,[eax-7] ; cmp ecx,6 ; ja`
   folds 7..0xd onto 0..6; `cmp eax,0xe ; jne` aliases 0xe onto slot
   6 (`mov eax,6` @0x92a54d); the signed `cmp eax,6 ; jg` DROPS 0xf
   without a word (no store, no log). -1 means nothing is stored.
   Identical to the v2 PGDX sec5 oracle. */
extern "C" int32_t isaac_pgd_addmini_index_remap(uint32_t arg) {
  const uint32_t a = arg;
  if (a > ISAAC_PGDADDMINI_ID_MAX) {
    return -1;
  }
  const uint32_t folded = a - ISAAC_PGDADDMINI_REMAP_BASE;
  if (folded <= ISAAC_PGDADDMINI_REMAP_SPAN) {
    return (int32_t)folded;
  }
  if (a == ISAAC_PGDADDMINI_ALIAS_ID) {
    return ISAAC_PGDADDMINI_REMAP_SPAN;
  }
  if (a > ISAAC_PGDADDMINI_REMAP_SPAN) {
    return -1;
  }
  return (int32_t)a;
}

/* The WARN trigger: 1 iff asU32(arg) > 0xf (`ja` @0x92a536 — 0xf
   itself does NOT warn; it is dropped later by the signed jg). */
extern "C" int32_t isaac_pgd_addmini_out_of_range(uint32_t arg) {
  return arg > ISAAC_PGDADDMINI_ID_MAX ? 1 : 0;
}

/* Full decision, in machine order:
   -1  readonly fail (`cmp byte [esi+1],0 ; jne` @0x92a529/0x92a52d —
       LOW BYTE only; no work at all)
   -2  out-of-range warn (`ja @0x92a536`: log (1, 0xb7aecc, ORIGINAL
       arg); negatives warn too)
   -3  silent drop (arg == 0xf: the signed `jg @0x92a557` to the same
       fail tail, but NOTHING runs — no store, no log)
   0..6 stored slot (flag store + dirty + log (1, 0xb7aeac, idx) run)
   The sec5 oracle's store_slot conflates -2/-3 into -1; this law
   makes the branch-level distinction explicit. */
extern "C" int32_t isaac_pgd_addmini_outcome(uint32_t readonly_byte,
                                             uint32_t arg) {
  if ((readonly_byte & 0xffu) != 0u) {
    return -1;
  }
  if (arg > ISAAC_PGDADDMINI_ID_MAX) {
    return -2;
  }
  const int32_t idx = isaac_pgd_addmini_index_remap(arg);
  if (idx < 0) {
    return -3;
  }
  return idx;
}

/* Store address law: flag byte offset = 0xe00 + index mod 2^32 —
   `mov byte [eax+esi+0xe00],1` @0x92a55f with eax = mapped idx
   (0..6 from the id->index fold; 0xe00 = ISAAC_PGD_OFF_SEC5_BYTES). */
extern "C" uint32_t isaac_pgd_addmini_flag_byte_off(uint32_t index) {
  return ISAAC_PGDADDMINI_FLAG_OFF + index;
}

/* ALL-SET gate: 1 iff ALL seven slot bytes e00..e06 are nonzero
   (`cmp byte [esi+off],0 ; je <tail>` chain @0x92a574..0x92a5b1 —
   ANY zero skips; ALL nonzero reach the TryUnlock call). */
extern "C" int32_t isaac_pgd_addmini_unlock_gate(uint32_t b0, uint32_t b1,
                                                 uint32_t b2, uint32_t b3,
                                                 uint32_t b4, uint32_t b5,
                                                 uint32_t b6) {
  const uint32_t bytes[ISAAC_PGDADDMINI_SLOTS] = {b0, b1, b2, b3, b4, b5, b6};
  for (int32_t s = 0; s < ISAAC_PGDADDMINI_SLOTS; ++s) {
    if ((bytes[s] & 0xffu) == 0u) {
      return 0;
    }
  }
  return 1;
}

/* Unlock decision: gate ? 0x16 : 0 — `push 0x16 ; mov ecx,esi ;
   call 0x929a20` (TryUnlock, this = esi) @0x92a5b7 runs only when
   the whole ALL-SET gate passes. */
extern "C" uint32_t isaac_pgd_addmini_unlock_fires(uint32_t b0, uint32_t b1,
                                                   uint32_t b2, uint32_t b3,
                                                   uint32_t b4, uint32_t b5,
                                                   uint32_t b6) {
  if (!isaac_pgd_addmini_unlock_gate(b0, b1, b2, b3, b4, b5, b6)) {
    return 0;
  }
  return ISAAC_PGDADDMINI_UNLOCK_ID;
}

/* ======================== ABI v23 ======================== */

/* ---------- PGDADSED: the "seed added to SaveState" mutator 0x92b230 ----------
   (no exact ZHL — self-named by its log string "Seed %d added to
   SaveState\n" @0xb7ae58; address-stable; ret 4 @0x92b25f; int3 pad
   0x92b262..0x92b26e; inbound from the update slice 0x68cdc0
   @0x69166e). The machine: `cmp byte [ecx+1],0 ; jne ret` (readonly
   LOW BYTE gate, no work at all when set); `mov byte
   [eax+ecx+0xf14],1` with eax = the seed — UNCHECKED byte store at
   pgd+0xf14+seed (0xf14 = ISAAC_PGD_OFF_SEC10_BYTES, 0x50 slots =
   ISAAC_PGD_COUNT_SEC10; the index is never masked or bounded);
   `mov byte [ecx+0xf14],0` — unconditional slot-0 clear right after
   (seed==0 self-cancels); `mov byte [ecx],1` — dirty (pgd+0 =
   ISAAC_PGD_OFF_CHANGES_MADE); the log args (1, 0xb7ae58, seed) are
   pushed BEFORE the stores and the cdecl call 0x92b256 -> 0xa112c0
   stays HOST. */

extern "C" uint32_t isaac_pgd_adsed_va(void) {
  return ISAAC_PGDADSED_VA;
}

extern "C" uint32_t isaac_pgd_adsed_ret_va(void) {
  return ISAAC_PGDADSED_RET_VA;
}

extern "C" uint32_t isaac_pgd_adsed_readonly_cmp_va(void) {
  return ISAAC_PGDADSED_READONLY_CMP_VA;
}

extern "C" uint32_t isaac_pgd_adsed_readonly_jne_va(void) {
  return ISAAC_PGDADSED_READONLY_JNE_VA;
}

extern "C" uint32_t isaac_pgd_adsed_slot_store_va(void) {
  return ISAAC_PGDADSED_SLOT_STORE_VA;
}

extern "C" uint32_t isaac_pgd_adsed_slot0_clear_va(void) {
  return ISAAC_PGDADSED_SLOT0_CLEAR_VA;
}

extern "C" int32_t isaac_pgd_adsed_slot_base(void) {
  return ISAAC_PGDADSED_SLOT_BASE;
}

extern "C" int32_t isaac_pgd_adsed_slots(void) {
  return ISAAC_PGDADSED_SLOTS;
}

extern "C" uint32_t isaac_pgd_adsed_dirty_store_va(void) {
  return ISAAC_PGDADSED_DIRTY_STORE_VA;
}

extern "C" int32_t isaac_pgd_adsed_dirty_off(void) {
  return ISAAC_PGDADSED_DIRTY_OFF;
}

extern "C" int32_t isaac_pgd_adsed_readonly_off(void) {
  return ISAAC_PGDADSED_READONLY_OFF;
}

extern "C" uint32_t isaac_pgd_adsed_log_string_va(void) {
  return ISAAC_PGDADSED_LOG_STRING_VA;
}

extern "C" uint32_t isaac_pgd_adsed_log_call_va(void) {
  return ISAAC_PGDADSED_LOG_CALL_VA;
}

extern "C" uint32_t isaac_pgd_adsed_log_callee_va(void) {
  return ISAAC_PGDADSED_LOG_CALLEE_VA;
}

/* The readonly gate: 1 iff the LOW BYTE of pgd+1 is zero — `cmp
   byte [ecx+1],0 ; jne ret` @0x92b233/@0x92b237. The test is on a
   byte: 0x100 / 0x10000 (low byte 0) must RUN, 0x1 / 0x1ff must
   not. */
extern "C" int32_t isaac_pgd_adsed_gate(uint32_t readonly_byte) {
  return (readonly_byte & 0xffu) == 0u ? 1 : 0;
}

/* Full decision in machine order:
   -1  readonly fail (low byte of pgd+1 != 0 — NO work at all: no
       slot store, no slot-0 clear, no dirty, no log)
   0   stored: slot[seed]=1, slot[0]=0, dirty=1, host log
       (1, 0xb7ae58, seed) scheduled. */
extern "C" int32_t isaac_pgd_adsed_outcome(uint32_t readonly_byte,
                                           uint32_t seed) {
  (void)seed;
  if ((readonly_byte & 0xffu) != 0u) {
    return -1;
  }
  return 0;
}

/* Store-index law: the seed IS the byte index, used raw — `mov byte
   [eax+ecx+0xf14],1` @0x92b244 with eax = seed (u32 passthrough:
   no mask, no bounds, no remap). A seed >= 0x50 writes outside the
   array — original behaviour. */
extern "C" uint32_t isaac_pgd_adsed_store_index(uint32_t seed) {
  return seed;
}

/* Self-cancelling law: when seed == 0 the slot store lands on slot 0
   and the unconditional `mov byte [ecx+0xf14],0` @0x92b24c undoes
   it — net nothing remains set. 1 iff seed == 0. */
extern "C" int32_t isaac_pgd_adsed_self_cancelling(uint32_t seed) {
  return seed == 0u ? 1 : 0;
}

/* Net slot-0 value after the mutator: -1 when the readonly gate is
   closed (nothing ran — slot 0 untouched, caller pre-state
   unknown); 0 when it ran — the slot-0 clear @0x92b24c is
   UNCONDITIONAL, so slot 0 always ends at 0 (even seed==0, after
   the transient 1). */
extern "C" int32_t isaac_pgd_adsed_slot0_after(uint32_t readonly_byte,
                                               uint32_t seed) {
  (void)seed;
  if ((readonly_byte & 0xffu) != 0u) {
    return -1;
  }
  return 0;
}

/* Dirty law: 1 iff the mutator ran — the `mov byte [ecx],1`
   @0x92b253 dirty store fires whenever the readonly gate opens,
   INCLUDING seed==0 (the self-cancelling case still dirties). */
extern "C" int32_t isaac_pgd_adsed_dirty_fires(uint32_t readonly_byte,
                                               uint32_t seed) {
  (void)seed;
  return (readonly_byte & 0xffu) == 0u ? 1 : 0;
}

/* ---------- PGDK41: the 41-bit two-word popcount gate 0x92b270 ----------
   (no exact ZHL; address-stable; ret 8 @0x92b2d9). The machine:
   `mov [ebx+0x5ac],eax` 0x92b281 stores the FIRST arg into
   counters[188] and `mov [ebx+0xa7c],eax` 0x92b28a the SECOND into
   counters[496] (0x2bc = ISAAC_PGD_OFF_EVENT_COUNTERS); the loop
   0x92b295..0x92b2ba then counts set bits over bits 0..40 of the
   two-word value (lo = first arg, hi = second arg): `bts esi,ecx`
   masks the bit index to 5 bits, `cmp ecx,0x20 ; cmovae edx,esi ;
   xor esi,edx` zeroes the low word for i>=32, `and esi,[ebp+8] ;
   and edx,[ebp+0xc] ; or ; je` tests lo bit i (i<32) / hi bit i-32
   (i>=32); `jl 0x92b295` bound 0x29 = 41. `cmp edi,5 ; jl
   0x92b2d0` 0x92b2bf/0x92b2c2 SIGNED gate; `push 0x143 ; mov
   ecx,ebx ; call 0x929a20` 0x92b2c4/0x92b2cb (TryUnlock, stays
   HOST) fires only at popcount >= 5; the dirty store `mov byte
   [ebx],1` 0x92b2d2 is UNCONDITIONAL. */

extern "C" uint32_t isaac_pgd_k41_va(void) {
  return ISAAC_PGDK41_VA;
}

extern "C" uint32_t isaac_pgd_k41_ret_va(void) {
  return ISAAC_PGDK41_RET_VA;
}

extern "C" uint32_t isaac_pgd_k41_lo_counter_store_va(void) {
  return ISAAC_PGDK41_LO_COUNTER_STORE_VA;
}

extern "C" uint32_t isaac_pgd_k41_hi_counter_store_va(void) {
  return ISAAC_PGDK41_HI_COUNTER_STORE_VA;
}

extern "C" int32_t isaac_pgd_k41_lo_counter_index(void) {
  return ISAAC_PGDK41_LO_COUNTER_INDEX;
}

extern "C" int32_t isaac_pgd_k41_hi_counter_index(void) {
  return ISAAC_PGDK41_HI_COUNTER_INDEX;
}

extern "C" int32_t isaac_pgd_k41_bits(void) {
  return ISAAC_PGDK41_BITS;
}

extern "C" uint32_t isaac_pgd_k41_loop_bts_va(void) {
  return ISAAC_PGDK41_LOOP_BTS_VA;
}

extern "C" uint32_t isaac_pgd_k41_loop_bound_cmp_va(void) {
  return ISAAC_PGDK41_LOOP_BOUND_CMP_VA;
}

extern "C" uint32_t isaac_pgd_k41_loop_bound_jl_va(void) {
  return ISAAC_PGDK41_LOOP_BOUND_JL_VA;
}

extern "C" uint32_t isaac_pgd_k41_loop_or_je_va(void) {
  return ISAAC_PGDK41_LOOP_OR_JE_VA;
}

extern "C" uint32_t isaac_pgd_k41_gate_cmp_va(void) {
  return ISAAC_PGDK41_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_k41_gate_jl_va(void) {
  return ISAAC_PGDK41_GATE_JL_VA;
}

extern "C" uint32_t isaac_pgd_k41_unlock_push_va(void) {
  return ISAAC_PGDK41_UNLOCK_PUSH_VA;
}

extern "C" uint32_t isaac_pgd_k41_unlock_call_va(void) {
  return ISAAC_PGDK41_UNLOCK_CALL_VA;
}

extern "C" uint32_t isaac_pgd_k41_unlock_target_va(void) {
  return ISAAC_PGDK41_UNLOCK_TARGET_VA;
}

extern "C" int32_t isaac_pgd_k41_unlock_id(void) {
  return ISAAC_PGDK41_UNLOCK_ID;
}

extern "C" int32_t isaac_pgd_k41_unlock_threshold(void) {
  return ISAAC_PGDK41_UNLOCK_THRESHOLD;
}

extern "C" uint32_t isaac_pgd_k41_dirty_store_va(void) {
  return ISAAC_PGDK41_DIRTY_STORE_VA;
}

extern "C" int32_t isaac_pgd_k41_dirty_off(void) {
  return ISAAC_PGDK41_DIRTY_OFF;
}

extern "C" int32_t isaac_pgd_k41_counter_base(void) {
  return ISAAC_PGDK41_COUNTER_BASE;
}

/* 41-bit popcount over (lo, hi), branch by branch (0x92b295..0x92b2ba):
   for i in 0..40, `bts esi,ecx` sets bit (i & 31) — the x86 bts
   count is masked to 5 bits; `cmp ecx,0x20 ; cmovae edx,esi ; xor
   esi,edx` moves that bit into edx and zeroes esi when i >= 32;
   `and esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je` — the hit test is
   lo bit i for i < 32 and hi bit (i - 32) for i >= 32 (loop, bound
   `cmp eax,0x29 ; jl` = 41 iterations). No word beyond bit 40 of
   the 64-bit value is ever examined. */
extern "C" int32_t isaac_pgd_k41_popcount(uint32_t lo, uint32_t hi) {
  int32_t n = 0;
  for (int32_t i = 0; i < ISAAC_PGDK41_BITS; ++i) {
    const uint32_t bit = 1u << (i & 31);
    const uint32_t hit = (i < 32) ? (lo & bit) : (hi & bit);
    if (hit != 0u) n += 1;
  }
  return n;
}

/* The popcount >= 5 gate — `cmp edi,5 ; jl 0x92b2d0` @0x92b2bf/
   @0x92b2c2 (SIGNED compare; popcount is 0..41 so sign does not
   bind here). */
extern "C" int32_t isaac_pgd_k41_gate(uint32_t lo, uint32_t hi) {
  return isaac_pgd_k41_popcount(lo, hi) >= ISAAC_PGDK41_UNLOCK_THRESHOLD
             ? 1
             : 0;
}

/* Unlock decision: popcount >= 5 ? 0x143 : 0 — `push 0x143 ; mov
   ecx,ebx ; call 0x929a20` (TryUnlock, this = ebx) @0x92b2c4/
   @0x92b2cb runs only when the gate passes. */
extern "C" uint32_t isaac_pgd_k41_unlock_fires(uint32_t lo, uint32_t hi) {
  if (isaac_pgd_k41_popcount(lo, hi) < ISAAC_PGDK41_UNLOCK_THRESHOLD) {
    return 0;
  }
  return ISAAC_PGDK41_UNLOCK_ID;
}

/* Dirty law: ALWAYS 1 — the `mov byte [ebx],1` @0x92b2d2 dirty
   store is unconditional; it runs even when the popcount gate fails
   (popcount < 5, no unlock call). */
extern "C" int32_t isaac_pgd_k41_dirty_fires(uint32_t lo, uint32_t hi) {
  (void)lo;
  (void)hi;
  return 1;
}

/* Counter-store offset law: dword offset = 0x2bc + 4*index (mod
   2^32) — `mov [ebx+0x5ac],eax` (index 188 -> 0x5ac) @0x92b281 and
   `mov [ebx+0xa7c],eax` (index 496 -> 0xa7c) @0x92b28a, base 0x2bc
   = ISAAC_PGD_OFF_EVENT_COUNTERS. */
extern "C" uint32_t isaac_pgd_k41_counter_store_off(uint32_t counter_index) {
  return ISAAC_PGDK41_COUNTER_BASE + 4u * counter_index;
}

/* ======================== ABI v24 ======================== */

/* ---------- PGDITAG: the shared reader 0x009e4260 version-tag table ----------
   The machine: a 16-byte stream read (vtbl+0x14 @0x9e4282, HOST)
   into [ebp-0x14], then ten .rdata save headers, each compared as
   THREE FULL DWORDs (0xc bytes, `mov eax,[ecx] ; cmp eax,[edx] ;
   jne next` @0x9e4292..0x9e42a1 et seq.), in PE order:
     row  header     section  count
     0    0xb805bc   2        7
     1    0xb8060c   2        7
     2    0xb805a8   3        8
     3    0xb805f8   3        8
     4    0xb805e4   4        8
     5    0xb80514   4        8
     6    0xb805d0   5        9
     7    0xb80500   5        9
     8    0xb1b98c   6        9
     9    0xb80560   6        9
   All ten 12-byte bodies are currently identical "ISAACNGSAVE0"
   (dwords 0x41415349 / 0x53474e43 / 0x30455641), so the first row
   in PE order always wins; a full miss falls to the fail tail
   0x9e4aa2 (cdecl log (1, 0xb80528 "...", buffer) -> 0xa112c0 HOST,
   xor al,al ; ret 0 @0x9e4ac7). */

static const uint32_t kPgditagHeaderVas[ISAAC_PGDITAG_HEADERS] = {
    ISAAC_PGDITAG_HEADER0_VA, ISAAC_PGDITAG_HEADER1_VA,
    ISAAC_PGDITAG_HEADER2_VA, ISAAC_PGDITAG_HEADER3_VA,
    ISAAC_PGDITAG_HEADER4_VA, ISAAC_PGDITAG_HEADER5_VA,
    ISAAC_PGDITAG_HEADER6_VA, ISAAC_PGDITAG_HEADER7_VA,
    ISAAC_PGDITAG_HEADER8_VA, ISAAC_PGDITAG_HEADER9_VA};
static const uint32_t kPgditagSections[ISAAC_PGDITAG_HEADERS] = {
    ISAAC_PGDITAG_SECTION_ROW0, ISAAC_PGDITAG_SECTION_ROW1,
    ISAAC_PGDITAG_SECTION_ROW2, ISAAC_PGDITAG_SECTION_ROW3,
    ISAAC_PGDITAG_SECTION_ROW4, ISAAC_PGDITAG_SECTION_ROW5,
    ISAAC_PGDITAG_SECTION_ROW6, ISAAC_PGDITAG_SECTION_ROW7,
    ISAAC_PGDITAG_SECTION_ROW8, ISAAC_PGDITAG_SECTION_ROW9};
static const uint32_t kPgditagCounts[ISAAC_PGDITAG_HEADERS] = {
    ISAAC_PGDITAG_COUNT_ROW0, ISAAC_PGDITAG_COUNT_ROW1,
    ISAAC_PGDITAG_COUNT_ROW2, ISAAC_PGDITAG_COUNT_ROW3,
    ISAAC_PGDITAG_COUNT_ROW4, ISAAC_PGDITAG_COUNT_ROW5,
    ISAAC_PGDITAG_COUNT_ROW6, ISAAC_PGDITAG_COUNT_ROW7,
    ISAAC_PGDITAG_COUNT_ROW8, ISAAC_PGDITAG_COUNT_ROW9};
static const uint32_t kPgditagDwords[ISAAC_PGDITAG_HEADERS][3] = {
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2},
    {ISAAC_PGDITAG_DWORD0, ISAAC_PGDITAG_DWORD1, ISAAC_PGDITAG_DWORD2}};

extern "C" uint32_t isaac_pgd_import_tag_header_count(void) {
  return ISAAC_PGDITAG_HEADERS;
}

extern "C" uint32_t isaac_pgd_import_tag_header_va(uint32_t index) {
  if (index >= ISAAC_PGDITAG_HEADERS) return 0u;
  return kPgditagHeaderVas[index];
}

extern "C" int32_t isaac_pgd_import_tag_header_section(uint32_t index) {
  if (index >= ISAAC_PGDITAG_HEADERS) return 0;
  return (int32_t)kPgditagSections[index];
}

extern "C" int32_t isaac_pgd_import_tag_header_count_max(uint32_t index) {
  if (index >= ISAAC_PGDITAG_HEADERS) return 0;
  return (int32_t)kPgditagCounts[index];
}

extern "C" uint32_t isaac_pgd_import_tag_header_dword(uint32_t index,
                                                      uint32_t part) {
  if (index >= ISAAC_PGDITAG_HEADERS || part >= ISAAC_PGDITAG_TAG_DWORDS) {
    return 0u;
  }
  return kPgditagDwords[index][part];
}

extern "C" uint32_t isaac_pgd_import_tag_compare_bytes(void) {
  return ISAAC_PGDITAG_TAG_BYTES;
}

extern "C" uint32_t isaac_pgd_import_tag_compare_dwords(void) {
  return ISAAC_PGDITAG_TAG_DWORDS;
}

extern "C" uint32_t isaac_pgd_import_tag_read_bytes(void) {
  return ISAAC_PGDITAG_READ_BYTES;
}

extern "C" uint32_t isaac_pgd_import_tag_read_call_va(void) {
  return ISAAC_PGDITAG_READ_CALL_VA;
}

extern "C" uint32_t isaac_pgd_import_tag_first_cmp_va(void) {
  return ISAAC_PGDITAG_FIRST_CMP_VA;
}

extern "C" uint32_t isaac_pgd_import_tag_fail_log_va(void) {
  return ISAAC_PGDITAG_FAIL_LOG_VA;
}

extern "C" uint32_t isaac_pgd_import_tag_fail_tail_va(void) {
  return ISAAC_PGDITAG_FAIL_TAIL_VA;
}

/* The full-word compare law: `mov eax,[ecx] ; cmp eax,[edx] ; jne`
   @0x9e4292..0x9e42a1 — THREE FULL DWORDs (12 bytes) must match,
   each compared with a 32-bit cmp (NOT a byte-wise scan, NOT a
   first-dword-only test). */
extern "C" int32_t isaac_pgd_import_tag_compare(uint32_t index, uint32_t d0,
                                                uint32_t d1, uint32_t d2) {
  if (index >= ISAAC_PGDITAG_HEADERS) return 0;
  return (kPgditagDwords[index][0] == d0 && kPgditagDwords[index][1] == d1 &&
          kPgditagDwords[index][2] == d2)
             ? 1
             : 0;
}

/* First-match in PE order: the ten jne chains 0x9e4296..0x9e4434
   fall through to the NEXT header on a mismatch; the first row whose
   three dwords all match wins. -1 = no row (the fail tail). */
extern "C" int32_t isaac_pgd_import_tag_first_match(uint32_t d0, uint32_t d1,
                                                    uint32_t d2) {
  for (uint32_t i = 0; i < ISAAC_PGDITAG_HEADERS; ++i) {
    if (isaac_pgd_import_tag_compare(i, d0, d1, d2) != 0) {
      return (int32_t)i;
    }
  }
  return -1;
}

extern "C" int32_t isaac_pgd_import_tag_match_section(uint32_t d0,
                                                      uint32_t d1,
                                                      uint32_t d2) {
  const int32_t m = isaac_pgd_import_tag_first_match(d0, d1, d2);
  return m < 0 ? -1 : (int32_t)kPgditagSections[(uint32_t)m];
}

extern "C" int32_t isaac_pgd_import_tag_match_count_max(uint32_t d0,
                                                        uint32_t d1,
                                                        uint32_t d2) {
  const int32_t m = isaac_pgd_import_tag_first_match(d0, d1, d2);
  return m < 0 ? -1 : (int32_t)kPgditagCounts[(uint32_t)m];
}

/* ---------- PGDIDISP: the section-record loop + 9-row dispatch ----------
   Record loop (0x9e4485..0x9e45e8):
     prev = [ebp-0x30] (init 0 @0x9e446a)
     loops while the HOST vtbl+0x10 stream call returns al==0
       entry gates on PREV:
         test eax,eax ; js  0x9e45f2   @0x9e4488/@0x9e448a — SIGNED
         cmp eax,ebx ; jge  0x9e45f2   @0x9e4490/@0x9e4492 — SIGNED
       (HOST reads) section -> [ebp-0x30], count -> [ebp-0x20]
       count gate:
         cmp [ebp-0x20],0 ; jbe 0x9e45e0 @0x9e44bf/@0x9e44c3 —
         UNSIGNED: only zero skips to the next record
       dispatch gate:
         mov eax,[ebp-0x30] ; dec eax ; cmp eax,8 ; ja 0x9e45e0
         @0x9e44c9..@0x9e44d0 — UNSIGNED (section-1) > 8 -> next
         jmp [eax*4 + 0x9e4ac8] @0x9e44d6
   Dispatch rows (index = section-1, 0..8): target VA / store offset
   (snapshot) / elem width / clamp MAX (cmova UNSIGNED) / setg /
   log VA (HOST cdecl 0xa112c0 on count mismatch):
     0 sect 1 0x9e44dd +0x38  w1 0xb3  setg 0xb1ba38 achievements
     1 sect 2 0x9e455c +0xec  w4 0x5f  raw  0xb1ba60 counters
     2 sect 3 0x9e4635 +0x3c4 w4 0xc   raw  0xb1ba60 sec3
     3 sect 4 0x9e46b4 +0x268 w1 0x15b setg 0xb1ba84 collection
     4 sect 5 0x9e4739 +0x3f4 w1 7     setg 0xb1babc minibosses
     5 sect 6 0x9e47b7 +0x3fb w1 0x39  setg 0xb1babc bosses
     6 sect 7 0x9e4835 +0x434 w1 0x15  setg 0xb1bae4 challenges
     7 sect 8 0x9e48b3 +0x44c w4 0x14  raw  0xb1bb0c cutscenes
     8 sect 9 0x9e4932 +0x49c w4 1     raw  0xb1bb34 settings
   Loop bounds (both UNSIGNED): `cmp edi,[ebp-0x20] ; jae skip`
   (0x9e4530/0x9e4533 for row 0) and `cmp <iter>,[ebp-0x18] ; jb
   loop` (0x9e4555/0x9e4558); byte handlers advance edi by 1, dword
   handlers by 4 per element (`add edi,4` @0x9e45d0 etc. — the avail
   bound is BYTES). */

extern "C" uint32_t isaac_pgd_import_dispatch_table_va(void) {
  return ISAAC_PGDIDISP_TABLE_VA;
}

extern "C" int32_t isaac_pgd_import_dispatch_entries(void) {
  return ISAAC_PGDIDISP_ENTRIES;
}

extern "C" uint32_t isaac_pgd_import_dispatch_gate_cmp_va(void) {
  return ISAAC_PGDIDISP_GATE_CMP_VA;
}

extern "C" uint32_t isaac_pgd_import_dispatch_gate_ja_va(void) {
  return ISAAC_PGDIDISP_GATE_JA_VA;
}

extern "C" uint32_t isaac_pgd_import_entry_gate_js_va(void) {
  return ISAAC_PGDIDISP_ENTRY_JS_VA;
}

extern "C" uint32_t isaac_pgd_import_entry_gate_jge_va(void) {
  return ISAAC_PGDIDISP_ENTRY_JGE_VA;
}

extern "C" uint32_t isaac_pgd_import_count_gate_cmp_va(void) {
  return ISAAC_PGDIDISP_COUNT_CMP_VA;
}

extern "C" uint32_t isaac_pgd_import_count_gate_jbe_va(void) {
  return ISAAC_PGDIDISP_COUNT_JBE_VA;
}

extern "C" uint32_t isaac_pgd_import_loop_jae_va(void) {
  return ISAAC_PGDIDISP_LOOP_JAE_VA;
}

extern "C" uint32_t isaac_pgd_import_loop_jb_va(void) {
  return ISAAC_PGDIDISP_LOOP_JB_VA;
}

/* The dispatch index law: `mov eax,[ebp-0x30] ; dec eax ; cmp
   eax,8 ; ja next` @0x9e44c9..@0x9e44d0 — UNSIGNED (section-1)
   >= 2^31 is rejected exactly like (section-1) > 8; only sections
   1..9 dispatch (index 0..8); section 0, 10..0xffffffff -> -1. */
extern "C" int32_t isaac_pgd_import_dispatch_index(uint32_t section) {
  const uint32_t biased = section - 1u;
  if (biased > 8u) return -1;
  return (int32_t)biased;
}

extern "C" int32_t isaac_pgd_import_handler_count(void) {
  return ISAAC_PGDIDISP_ENTRIES;
}

extern "C" uint32_t isaac_pgd_import_handler_section(uint32_t index) {
  static const uint32_t kSections[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_SECTION0, ISAAC_PGDIDISP_SECTION1,
      ISAAC_PGDIDISP_SECTION2, ISAAC_PGDIDISP_SECTION3,
      ISAAC_PGDIDISP_SECTION4, ISAAC_PGDIDISP_SECTION5,
      ISAAC_PGDIDISP_SECTION6, ISAAC_PGDIDISP_SECTION7,
      ISAAC_PGDIDISP_SECTION8};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0u;
  return kSections[index];
}

extern "C" uint32_t isaac_pgd_import_handler_target_va(uint32_t index) {
  static const uint32_t kTargets[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_TARGET0_VA, ISAAC_PGDIDISP_TARGET1_VA,
      ISAAC_PGDIDISP_TARGET2_VA, ISAAC_PGDIDISP_TARGET3_VA,
      ISAAC_PGDIDISP_TARGET4_VA, ISAAC_PGDIDISP_TARGET5_VA,
      ISAAC_PGDIDISP_TARGET6_VA, ISAAC_PGDIDISP_TARGET7_VA,
      ISAAC_PGDIDISP_TARGET8_VA};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0u;
  return kTargets[index];
}

extern "C" uint32_t isaac_pgd_import_handler_store_off(uint32_t index) {
  static const uint32_t kOffs[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_OFF0, ISAAC_PGDIDISP_OFF1, ISAAC_PGDIDISP_OFF2,
      ISAAC_PGDIDISP_OFF3, ISAAC_PGDIDISP_OFF4, ISAAC_PGDIDISP_OFF5,
      ISAAC_PGDIDISP_OFF6, ISAAC_PGDIDISP_OFF7, ISAAC_PGDIDISP_OFF8};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0u;
  return kOffs[index];
}

extern "C" uint32_t isaac_pgd_import_handler_elem_width(uint32_t index) {
  static const uint32_t kWidths[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_WIDTH0, ISAAC_PGDIDISP_WIDTH1, ISAAC_PGDIDISP_WIDTH2,
      ISAAC_PGDIDISP_WIDTH3, ISAAC_PGDIDISP_WIDTH4, ISAAC_PGDIDISP_WIDTH5,
      ISAAC_PGDIDISP_WIDTH6, ISAAC_PGDIDISP_WIDTH7, ISAAC_PGDIDISP_WIDTH8};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0u;
  return kWidths[index];
}

extern "C" uint32_t isaac_pgd_import_handler_clamp_max(uint32_t index) {
  static const uint32_t kClamps[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_CLAMP0, ISAAC_PGDIDISP_CLAMP1, ISAAC_PGDIDISP_CLAMP2,
      ISAAC_PGDIDISP_CLAMP3, ISAAC_PGDIDISP_CLAMP4, ISAAC_PGDIDISP_CLAMP5,
      ISAAC_PGDIDISP_CLAMP6, ISAAC_PGDIDISP_CLAMP7, ISAAC_PGDIDISP_CLAMP8};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0u;
  return kClamps[index];
}

extern "C" int32_t isaac_pgd_import_handler_flag_normalize(uint32_t index) {
  static const uint32_t kSetg[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_SETG0, ISAAC_PGDIDISP_SETG1, ISAAC_PGDIDISP_SETG2,
      ISAAC_PGDIDISP_SETG3, ISAAC_PGDIDISP_SETG4, ISAAC_PGDIDISP_SETG5,
      ISAAC_PGDIDISP_SETG6, ISAAC_PGDIDISP_SETG7, ISAAC_PGDIDISP_SETG8};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0;
  return (int32_t)kSetg[index];
}

extern "C" uint32_t isaac_pgd_import_handler_log_va(uint32_t index) {
  static const uint32_t kLogs[ISAAC_PGDIDISP_ENTRIES] = {
      ISAAC_PGDIDISP_LOG0_VA, ISAAC_PGDIDISP_LOG1_VA, ISAAC_PGDIDISP_LOG2_VA,
      ISAAC_PGDIDISP_LOG3_VA, ISAAC_PGDIDISP_LOG4_VA, ISAAC_PGDIDISP_LOG5_VA,
      ISAAC_PGDIDISP_LOG6_VA, ISAAC_PGDIDISP_LOG7_VA, ISAAC_PGDIDISP_LOG8_VA};
  if (index >= ISAAC_PGDIDISP_ENTRIES) return 0u;
  return kLogs[index];
}

/* Entry gate: `test eax,eax ; js fail` + `cmp eax,ebx ; jge fail`
   @0x9e4488/@0x9e448a + @0x9e4490/@0x9e4492 — SIGNED 0 <= prev <
   elemCount (elemCount = the 7/8/9 from the tag stage); a negative
   or >= elemCount prev finishes the whole reader (0x9e45f2), NOT
   merely skipping the record. */
extern "C" int32_t isaac_pgd_import_section_entry_gate(int32_t prev_section,
                                                       int32_t elem_count) {
  if (prev_section < 0) return 0;
  return prev_section < elem_count ? 1 : 0;
}

/* Count gate: `cmp [ebp-0x20],0 ; jbe next` @0x9e44bf/@0x9e44c3 —
   UNSIGNED: only an exact 0 skips to the next record; 0x80000000 /
   0xffffffff pass (the per-handler loop bounds then cap the
   writes). */
extern "C" int32_t isaac_pgd_import_section_count_gate(uint32_t count) {
  return count != 0u ? 1 : 0;
}

/* Clamp: `mov ecx,MAX ; cmova eax,ecx` in every handler — UNSIGNED
   above; count > MAX (unsigned) folds to MAX, negatives pass
   through unchanged. */
extern "C" uint32_t isaac_pgd_import_clamp(uint32_t count, uint32_t max) {
  return count > max ? max : count;
}

/* setg normalisation: `cmp byte [..],0 ; setg al` (0x9e4549/
   0x9e454d et seq.) — the element byte is tested as a SIGNED int8;
   0x80..0xff (negative) are NOT > 0 and normalise to 0. The arg is
   a uint32_t and re-narrowed in the body (Wasm ABI never narrows). */
extern "C" int32_t isaac_pgd_import_byte_flag(uint32_t raw) {
  const int32_t as_signed =
      (int32_t)(int8_t)(uint8_t)(raw & 0xffu);
  return as_signed > 0 ? 1 : 0;
}

/* Byte-array loop iterations: `cmp edi,[ebp-0x20] ; jae skip`
   @0x9e4530/@0x9e4533 (record byte count, edi += 1 per element) and
   `cmp edi,[ebp-0x18] ; jb loop` @0x9e4555/@0x9e4558 (clamped
   count) — both UNSIGNED; writes = min(avail, clamped). */
extern "C" uint32_t isaac_pgd_import_byte_loop_iterations(uint32_t avail,
                                                          uint32_t clamped) {
  return avail < clamped ? avail : clamped;
}

/* Dword-array loop iterations (counters/sec3/sec8/settings): the
   same two UNSIGNED bounds, but the element pointer advances by 4
   bytes (`add edi,4` @0x9e45d0 etc.) while the iteration counter
   (ebx) advances by 1 — body runs while off < avail AND iters <
   clamped, with off = 4*iters mod 2^32. Closed form (machine
   exact, O(1)):
     avail == 0            -> 0   (the count gate already skipped)
     avail in 0xfffffffd.. -> off NEVER lands in [avail, 2^32) —
       0xfffffffd/0xfffffffe/0xffffffff are not multiples of 4, so
       the avail bound never binds: iterations = clamped
     else                  -> ceil(avail/4) (avail <= 0xfffffffc,
       off = 4*iters never wraps before the bound: ceil <= 2^30-1)
   iterations = min(clamped, bound). The machine's practical domain
   is clamped <= 0x5f (the cmova clamp), but the law is exact for
   every u32 pair. */
extern "C" uint32_t isaac_pgd_import_dword_loop_iterations(
    uint32_t avail_bytes, uint32_t clamped) {
  if (avail_bytes == 0u) return 0u;
  uint32_t bound;
  if (avail_bytes > 0xfffffffcu) {
    bound = clamped;
  } else {
    bound = (avail_bytes + 3u) >> 2u;
  }
  return clamped < bound ? clamped : bound;
}

/* PGDTALLY (v25n, no ABI bump): stage-4 tally decision laws of the
   shared Rebirth-save snapshot reader 0x009e4260 (see the banner).
   All `jl` gates are SIGNED (`cmp eax,imm ; jl`); all byte gates are
   the `cmp byte,0` ZERO/NONZERO test re-narrowed from the u32 arg. */
extern "C" uint32_t isaac_pgd_import_tally_run_va(void) {
  return 0x009e4618u;
}
extern "C" uint32_t isaac_pgd_import_tally_success_va(void) {
  return 0x009e4a8fu;
}
extern "C" uint32_t isaac_pgd_import_tally_store_7d_va(void) {
  return 0x009e4a78u;
}
extern "C" uint32_t isaac_pgd_import_tally_store_8c_va(void) {
  return 0x009e4a88u;
}
extern "C" uint32_t isaac_pgd_import_tally_coll_flags_off(void) {
  return 0x268u;
}
extern "C" uint32_t isaac_pgd_import_tally_sett_flags_off(void) {
  return 0x38u;
}
extern "C" uint32_t isaac_pgd_import_tally_coll_first_idx(void) {
  return 1u;
}
extern "C" uint32_t isaac_pgd_import_tally_coll_bound(void) {
  return 0x15bu; /* cmp eax,0x15b ; jl 0x9e4621 — SIGNED exclusive */
}
extern "C" uint32_t isaac_pgd_import_tally_coll_iters(void) {
  return 0x15au; /* eax 1..0x15a; index 0 never scanned */
}
extern "C" uint32_t isaac_pgd_import_tally_sett_first_idx(void) {
  return 1u;
}
extern "C" uint32_t isaac_pgd_import_tally_sett_bound(void) {
  return 0xb3u; /* cmp eax,0xb3 ; jl 0x9e4a20 — SIGNED exclusive */
}
extern "C" uint32_t isaac_pgd_import_tally_sett_iters(void) {
  return 0xb2u; /* eax 1..0xb2 */
}
extern "C" uint32_t isaac_pgd_import_tally_coll_alias_a_count(void) {
  return 6u;
}
extern "C" uint32_t isaac_pgd_import_tally_coll_alias_b_count(void) {
  return 3u;
}
extern "C" uint32_t isaac_pgd_import_tally_sett_alias_count(void) {
  return 9u;
}
/* Alias tables in machine compare order; out-of-range -> 0. */
extern "C" uint32_t isaac_pgd_import_tally_coll_alias_a(uint32_t index) {
  static const uint32_t kA[6] = {0x114u, 0x14du, 0x14eu, 0x14fu,
                                 0x11bu, 0x14bu};
  return index < 6u ? kA[index] : 0u;
}
extern "C" uint32_t isaac_pgd_import_tally_coll_alias_b(uint32_t index) {
  static const uint32_t kB[3] = {0x2bu, 0x3du, 0xebu};
  return index < 3u ? kB[index] : 0u;
}
extern "C" uint32_t isaac_pgd_import_tally_sett_alias(uint32_t index) {
  static const uint32_t kS[9] = {0x81u, 0x82u, 0x83u, 0x84u, 0x85u,
                                 0x9cu, 0x52u, 0x54u, 0xafu};
  return index < 9u ? kS[index] : 0u;
}
/* Collection bucket: NONZERO byte -> set B (2) with the alias table
   SKIPPED; ZERO byte -> A-aliases {0x114,0x14d,0x14e,0x14f,0x11b,
   0x14b} -> set A (1), B-aliases {0x2b,0x3d,0xeb} -> set B (2),
   else none (0). Re-narrows byte & 0xff (0x100 -> 0, 0x1ff/0xff ->
   nonzero). */
extern "C" int32_t isaac_pgd_import_tally_coll_bucket(uint32_t index,
                                                      uint32_t byte) {
  const uint32_t b = byte & 0xffu;
  if (b != 0u) return 2;
  switch (index) {
    case 0x114u: case 0x14du: case 0x14eu: case 0x14fu:
    case 0x11bu: case 0x14bu:
      return 1;
    case 0x2bu: case 0x3du: case 0xebu:
      return 2;
    default:
      return 0;
  }
}
/* Settings bucket: NONZERO byte -> set B (2), aliases skipped;
   ZERO byte + {0x81..0x85,0x9c,0x52,0x54,0xaf} -> set A (1), else
   none (0). */
extern "C" int32_t isaac_pgd_import_tally_sett_bucket(uint32_t index,
                                                      uint32_t byte) {
  const uint32_t b = byte & 0xffu;
  if (b != 0u) return 2;
  switch (index) {
    case 0x81u: case 0x82u: case 0x83u: case 0x84u: case 0x85u:
    case 0x9cu: case 0x52u: case 0x54u: case 0xafu:
      return 1;
    default:
      return 0;
  }
}
/* Collection finish/continue gate: `lea eax,[edi+ecx] ; cmp
   eax,0x15a ; jl 0x9e4a8f` — the 32-bit SUM wraps mod 2^32 and is
   compared SIGNED; below -> FINISH (0: success return, the settings
   walk never runs), else CONTINUE (1). */
extern "C" int32_t isaac_pgd_import_tally_coll_continue(uint32_t setA,
                                                        uint32_t setB) {
  return (int32_t)(setA + setB) < 0x15a ? 0 : 1;
}
/* Settings +0x7d store gate: `lea eax,[edx+ecx] ; cmp eax,0xb1 ;
   jl 0x9e4a7c` SIGNED — below skips the store, else byte
   [esi+0x7d] = 1. */
extern "C" int32_t isaac_pgd_import_tally_sett_store_7d(uint32_t setA,
                                                        uint32_t setB) {
  return (int32_t)(setA + setB) < 0xb1 ? 0 : 1;
}
/* Settings +0x8c store gate: `cmp ecx,0xb1 ; jl 0x9e4a8f` SIGNED
   (ecx = settings set B) AND `test edi,edi ; jne 0x9e4a8f` (edi =
   the COLLECTION walk's set A, which survives into the settings
   walk) — stores byte [esi+0x8c] = 1 @0x9e4a88 only when BOTH
   hold. */
extern "C" int32_t isaac_pgd_import_tally_sett_store_8c(uint32_t settB,
                                                        uint32_t collA) {
  if ((int32_t)settB < 0xb1) return 0;
  if (collA != 0u) return 0;
  return 1;
}

/* ======================== ABI v25o ======================== */

/* ---------- PGDIMP: TryImportRebirthLocalSave (0x0092b2e0) residual
   pure islands ----------
   The importer (exact ZHL; ONE caller 0x00926bd5) is the owner of the
   0x4f0 snapshot the v24 reader 0x009e4260 reads. v6 landed its PGDCOV
   restore rows + the v6/v7 remap loops; v10 the snapshot ctor
   0x009e3dc0; v24 the reader decisions. THIS unit lands the frame's OWN
   remaining pure decision structure, in PE order:
   1. PRE-READ SETUP — the path suffix scan: `cmp eax,0x1c ; jb skip`
      (UNSIGNED, 0x92b3c1), `add eax,-0x1c` (0x92b3ca), candidate
      window at len-0x1c; each window is matched by SIX FULL dword
      compares (0x18 bytes, 0x92b3f0..0x92b3ff + byte fallback
      0x92b405..0x92b421) against the 0x1c-byte .rdata pattern
      0xb6d0d8 ("Binding of Isaac Repentance+") — only its FIRST 0x18
      bytes are ever compared; the trailing "nce+" is never read. The
      scan is BACKWARD (`dec edi` @0x92b444), so the LAST occurrence
      wins. On a match the machine replaces 0x1c bytes at the offset
      with the 0x18-byte string 0xb7b024 ("Binding of Isaac
      Rebirth"): `push 0x18 ; push 0xb7b024 ; push 0x1c ; push edi ;
      call 0x499580` @0x92b452..0x92b45f (replace(pos,0x1c,str,0x18)
      HOST, net path len change -4).
   2. FILE-OPEN RESULT GATES — open 0xa24fd0 (HOST) stores the handle
      at [ebp-0x4ec]; `test edi,edi ; je 0x92b7ec` (0x92b53d) ABORTS
      the whole import on a null handle. Then twice (pre-read 0x92b545
      block, post-read 0x92b57f block) the SAME io gate shape: state =
      vtbl+0x30 return (`test al,al ; je skip` LOW BYTE 0x92b54e/
      0x92b58e), position = IAT 0xb18920 return (`test eax,eax ; js
      skip` SIGNED 0x92b55e/0x92b59e), then io 0xa52890 (HOST) with
      count 1 pre-read (0x92b562) / 8 post-read (0x92b592). The gate
      ONLY gates the io call — the reader is called regardless.
   3. POST-IMPORT STORES — on the reader-nonzero path: Clear(1) ->
      0x9262b0 (0x92b5ca, v6-pinned), the v6 restore rows, then
      changesmade=1 `mov byte [edi],1` @0x92b752, the global
      save-field fence ([0xc7169c]+0x2a378: save esi @0x92b755, zero
      @0x92b75b, restore @0x92b77a), pgd->0x9296c0 @0x92b765, event
      counter 0x929b40 (0,0) @0x92b770, then the save-select chain:
      `cmp byte [edi],0 ; je` (0x92b780) AND `cmp byte
      [edi+0xf8c],0 ; je` (0x92b785) — both LOW BYTE — then `mov byte
      [edi],0` @0x92b790, call 0x9292c0, obj = IAT 0xb18a1c(0xc5c3a4)
      (HOST), `cmp dword [eax],0 ; je` (FULL DWORD 0x92b7ac), `cmp byte
      [esi+0x2a3a4],0 ; je` (LOW BYTE 0x92b7b1) — path A (0x928ee0)
      iff all four nonzero, else path B (0x9294f0); both set
      [ebp-0x4f1]=1 (0x92b7c7/0x92b7dd). Return byte: `mov al,
      [ebp-0x4f1]` @0x92b8fe — 0 when the open failed (0x92b7ec) or
      the reader returned 0 (0x92b7e6), else 1.
   Byte gates take uint32 and re-narrow in-body (Wasm i32 args are not
   narrowed; the PE tests LOW BYTES at 0x92b54e/0x92b5b9/0x92b780/
   0x92b785/0x92b7b1 and a FULL DWORD at 0x92b7ac). */

/* ---- Island 1: pre-read setup (path suffix scan) ---- */

extern "C" uint32_t isaac_pgd_import_suffix_pattern_byte(uint32_t index) {
  static const uint8_t kPgImpSuffix[ISAAC_PGDIMP_SUFFIX_PATTERN_BYTES] = {
      0x42, 0x69, 0x6e, 0x64, 0x69, 0x6e, 0x67, 0x20, 0x6f, 0x66, 0x20, 0x49,
      0x73, 0x61, 0x61, 0x63, 0x20, 0x52, 0x65, 0x70, 0x65, 0x6e, 0x74, 0x61,
      0x6e, 0x63, 0x65, 0x2b};
  return index < ISAAC_PGDIMP_SUFFIX_PATTERN_BYTES ? kPgImpSuffix[index]
                                                     : 0u;
}

extern "C" uint32_t isaac_pgd_import_suffix_compare_len(void) {
  return ISAAC_PGDIMP_SUFFIX_COMPARE_BYTES; /* 0x18 — "nce+" never read */
}

extern "C" int32_t isaac_pgd_import_suffix_window_match(
    uint32_t d0, uint32_t d1, uint32_t d2, uint32_t d3, uint32_t d4,
    uint32_t d5) {
  static const uint32_t kPgImpSuffixDwords[6] = {
      0x646e6942u, 0x20676e69u, 0x4920666fu, 0x63616173u, 0x70655220u,
      0x61746e65u};
  const uint32_t d[6] = {d0, d1, d2, d3, d4, d5};
  for (int k = 0; k < 6; ++k) {
    if (d[k] != kPgImpSuffixDwords[k]) return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pgd_import_suffix_scan_start(uint32_t len) {
  if (len < 0x1cu) return 0xffffffffu; /* `jb` skip branch — no scan */
  return len - 0x1cu;                   /* `add eax,-0x1c` — u32 wrap */
}

extern "C" uint32_t isaac_pgd_import_suffix_scan_step(void) {
  return ISAAC_PGDIMP_SUFFIX_SCAN_STEP; /* 0xffffffff (`dec edi`) */
}

extern "C" uint32_t isaac_pgd_import_suffix_first_cmp_va(void) {
  return ISAAC_PGDIMP_SUFFIX_FIRST_CMP_VA;
}

extern "C" uint32_t isaac_pgd_import_suffix_replace_va(void) {
  return ISAAC_PGDIMP_SUFFIX_REPLACE_VA;
}

extern "C" uint32_t isaac_pgd_import_suffix_replace_pos_len(void) {
  return ISAAC_PGDIMP_SUFFIX_REPLACE_POS_LEN; /* n1: window width 0x1c */
}

extern "C" uint32_t isaac_pgd_import_rebirth_replacement_len(void) {
  return ISAAC_PGDIMP_REBIRTH_STR_LEN; /* n2: "Binding of Isaac Rebirth" */
}

extern "C" uint32_t isaac_pgd_import_rebirth_replace_len(
    uint32_t len, uint32_t matched) {
  if (len < 0x1cu || matched == 0u) return len;
  return (len - 0x1cu + 0x18u); /* net -4 mod 2^32 */
}

/* ---- Island 2: file-open result gates ---- */

extern "C" int32_t isaac_pgd_import_open_succeeded(uint32_t handle) {
  return handle != 0u ? 1 : 0; /* `test edi,edi ; je 0x92b7ec` @0x92b53d */
}

extern "C" uint32_t isaac_pgd_import_open_gate_va(void) {
  return ISAAC_PGDIMP_OPEN_GATE_VA;
}

extern "C" uint32_t isaac_pgd_import_open_fail_va(void) {
  return ISAAC_PGDIMP_OPEN_FAIL_VA;
}

extern "C" uint32_t isaac_pgd_import_open_state_call_va(void) {
  return ISAAC_PGDIMP_OPEN_STATE_CALL_VA; /* vtbl+0x30 (HOST stream) */
}

extern "C" uint32_t isaac_pgd_import_open_state_gate_va(void) {
  return ISAAC_PGDIMP_OPEN_STATE_GATE_VA; /* `test al,al ; je` — LOW BYTE */
}

extern "C" uint32_t isaac_pgd_import_stream_pos_call_va(void) {
  return ISAAC_PGDIMP_STREAM_POS_CALL_VA; /* IAT 0xb18920 (HOST) */
}

extern "C" uint32_t isaac_pgd_import_stream_pos_gate_va(void) {
  return ISAAC_PGDIMP_STREAM_POS_GATE_VA; /* `test eax,eax ; js` — SIGNED */
}

extern "C" int32_t isaac_pgd_import_file_io_gate(uint32_t open_state,
                                                  uint32_t pos) {
  if ((open_state & 0xffu) == 0u) return 0; /* LOW BYTE state gate */
  const int32_t p = static_cast<int32_t>(pos); /* SIGNED full dword */
  return p < 0 ? 0 : 1;
}

extern "C" uint32_t isaac_pgd_import_pre_read_count(void) {
  return ISAAC_PGDIMP_PRE_READ_COUNT; /* `mov edx,1` @0x92b562 */
}

extern "C" uint32_t isaac_pgd_import_post_read_count(void) {
  return ISAAC_PGDIMP_POST_READ_COUNT; /* `mov edx,8` @0x92b592 */
}

extern "C" uint32_t isaac_pgd_import_pre_read_io_call_va(void) {
  return ISAAC_PGDIMP_IO_CALL_PRE_VA; /* `call 0xa52890` @0x92b569 HOST */
}

extern "C" uint32_t isaac_pgd_import_post_read_io_call_va(void) {
  return ISAAC_PGDIMP_IO_CALL_POST_VA; /* `call 0xa52890` @0x92b5a9 HOST */
}

/* ---- Island 3: post-import stores on the success path ---- */

extern "C" int32_t isaac_pgd_import_post_read_gate(uint32_t reader_result) {
  return (reader_result & 0xffu) != 0u ? 1 : 0; /* LOW BYTE @0x92b5b9 */
}

extern "C" uint32_t isaac_pgd_import_post_read_gate_va(void) {
  return ISAAC_PGDIMP_POST_READ_GATE_VA; /* `cmp byte [ebp-0x4f1],0` */
}

extern "C" uint32_t isaac_pgd_import_post_read_fail_va(void) {
  return ISAAC_PGDIMP_POST_READ_FAIL_VA; /* `je 0x92b7e6` fail tail */
}

extern "C" uint32_t isaac_pgd_import_changesmade_store_va(void) {
  return ISAAC_PGDIMP_CHANGESMADE_STORE_VA; /* `mov byte [edi],1` */
}

extern "C" uint32_t isaac_pgd_import_changesmade_store_value(void) {
  return ISAAC_PGDIMP_CHANGESMADE_STORE_VALUE; /* 1 */
}

extern "C" int32_t isaac_pgd_import_changesmade_clear_gate(
    uint32_t pgd0, uint32_t f8c) {
  if ((pgd0 & 0xffu) == 0u) return 0; /* `cmp byte [edi],0 ; je` */
  if ((f8c & 0xffu) == 0u) return 0;  /* `cmp byte [edi+0xf8c],0 ; je` */
  return 1; /* `mov byte [edi],0` @0x92b790 runs */
}

extern "C" int32_t isaac_pgd_import_save_select(uint32_t pgd0, uint32_t f8c,
                                                 uint32_t obj_deref,
                                                 uint32_t global_2a3a4) {
  if ((pgd0 & 0xffu) == 0u) return 0;       /* LOW BYTE @0x92b780 */
  if ((f8c & 0xffu) == 0u) return 0;         /* LOW BYTE @0x92b785 */
  if (obj_deref == 0u) return 0;               /* FULL DWORD @0x92b7ac */
  if ((global_2a3a4 & 0xffu) == 0u) return 0; /* LOW BYTE @0x92b7b1 */
  return 1; /* path A (0x928ee0); else path B (0x9294f0) */
}

extern "C" uint32_t isaac_pgd_import_save_select_cmp_va(void) {
  return ISAAC_PGDIMP_SAVE_SELECT_CMP_VA;
}

extern "C" uint32_t isaac_pgd_import_save_select_0f8c_cmp_va(void) {
  return ISAAC_PGDIMP_SAVE_SELECT_0F8C_CMP_VA;
}

extern "C" uint32_t isaac_pgd_import_save_select_obj_va(void) {
  return ISAAC_PGDIMP_SAVE_SELECT_OBJ_VA; /* IAT 0xb18a1c call site */
}

extern "C" uint32_t isaac_pgd_import_save_select_obj_cmp_va(void) {
  return ISAAC_PGDIMP_SAVE_SELECT_OBJ_CMP_VA; /* FULL DWORD `cmp` */
}

extern "C" uint32_t isaac_pgd_import_save_select_global_va(void) {
  return ISAAC_PGDIMP_SAVE_SELECT_GLOBAL_VA; /* LOW BYTE `cmp` */
}

extern "C" uint32_t isaac_pgd_import_event_counter_va(void) {
  return ISAAC_PGDIMP_EVENT_COUNTER_CALL_VA; /* `call 0x929b40` @0x92b770 */
}

extern "C" uint32_t isaac_pgd_import_global_save_ptr_va(void) {
  return ISAAC_PGDIMP_GLOBAL_SAVE_PTR_VA; /* 0xc7169c */
}

extern "C" uint32_t isaac_pgd_import_global_save_field_off(void) {
  return ISAAC_PGDIMP_GLOBAL_SAVE_FIELD_OFF; /* 0x2a378 */
}

extern "C" uint32_t isaac_pgd_import_global_save_cleared(uint32_t old_val) {
  (void)old_val;
  return 0u; /* `mov [eax+0x2a378],0` @0x92b75b */
}

extern "C" uint32_t isaac_pgd_import_global_save_restore(uint32_t old_val) {
  return old_val; /* `mov [eax+0x2a378],esi` @0x92b77a — exact restore */
}

extern "C" uint32_t isaac_pgd_import_return1_va_a(void) {
  return ISAAC_PGDIMP_RETURN1_VA_A; /* `mov byte [ebp-0x4f1],1` @0x92b7c7 */
}

extern "C" uint32_t isaac_pgd_import_return1_va_b(void) {
  return ISAAC_PGDIMP_RETURN1_VA_B; /* `mov byte [ebp-0x4f1],1` @0x92b7dd */
}

extern "C" int32_t isaac_pgd_import_result(uint32_t open_ok,
                                           uint32_t reader_result) {
  if (open_ok == 0u) return 0;               /* abort @0x92b7ec */
  if ((reader_result & 0xffu) == 0u) return 0; /* gate @0x92b5b9 */
  return 1;
}

/* ======================== ABI v25p ======================== */

/* ---------- PGDROWSEC: the per-section handler-row semantics ----------
   v24 exported the row TABLE getters keyed by dispatch index 0..8;
   this block composes the SAME rows keyed by SECTION id — the
   semantic laws of the 0x009e4260 dispatch:
     `mov eax,[ebp-0x30] ; dec eax ; cmp eax,8 ; ja next`
     @0x9e44c9..0x9e44d0 — UNSIGNED (section-1) <= 8 -> index
     section-1, else NO row (the record is skipped: no writes, no
     clamp, no log).
   Row values come from the v24 tables (store offset / elem width /
   clamp max / setg flag / log VA / target VA), so this unit only
   adds the SECTION-KEYED composition + the composed per-row loop
   law. The per-row loop law closes the byte-loop wrap corners the
   same way v24 closed the dword-loop ones: byte rows write
   min(avail, clamped) elements (edi advances 1/iter — every u32
   pair is exact, no 4k mod-2^32 skip exists); dword rows use the
   v24 closed form (off = 4*iters mod 2^32). */

extern "C" int32_t isaac_pgd_import_section_row_index(uint32_t section) {
  const uint32_t biased = section - 1u;
  if (biased > ISAAC_PGDROWSEC_DISPATCH_BIAS) return -1;
  return (int32_t)biased;
}

extern "C" uint32_t isaac_pgd_import_section_store_off(uint32_t section) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0u;
  return isaac_pgd_import_handler_store_off((uint32_t)r);
}

extern "C" uint32_t isaac_pgd_import_section_elem_width(uint32_t section) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0u;
  return isaac_pgd_import_handler_elem_width((uint32_t)r);
}

extern "C" uint32_t isaac_pgd_import_section_clamp_max(uint32_t section) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0u;
  return isaac_pgd_import_handler_clamp_max((uint32_t)r);
}

extern "C" int32_t isaac_pgd_import_section_flag_normalize(uint32_t section) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0;
  return isaac_pgd_import_handler_flag_normalize((uint32_t)r);
}

extern "C" uint32_t isaac_pgd_import_section_log_va(uint32_t section) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0u;
  return isaac_pgd_import_handler_log_va((uint32_t)r);
}

extern "C" uint32_t isaac_pgd_import_section_target_va(uint32_t section) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0u;
  return isaac_pgd_import_handler_target_va((uint32_t)r);
}

/* The composed per-row loop law: no row -> 0 elements written;
   else clamped = clamp(count, rowMax) (the handler's `mov ecx,MAX ;
   cmova eax,ecx` — UNSIGNED, so 0x80000000/0xffffffff counts fold
   to MAX), then byte rows (width 1): min(avail, clamped) — exact
   for EVERY u32 pair including the wrap corners (avail in
   0xfffffffd..0xffffffff with clamped huge: min still binds, there
   is no 4k mod-2^32 skip in a byte loop); dword rows (width 4):
   the v24 closed form. */
extern "C" uint32_t isaac_pgd_import_section_loop_iterations(
    uint32_t section, uint32_t avail, uint32_t count) {
  const int32_t r = isaac_pgd_import_section_row_index(section);
  if (r < 0) return 0u;
  const uint32_t max = isaac_pgd_import_handler_clamp_max((uint32_t)r);
  const uint32_t clamped = isaac_pgd_import_clamp(count, max);
  if (isaac_pgd_import_handler_elem_width((uint32_t)r) == 1u) {
    return isaac_pgd_import_byte_loop_iterations(avail, clamped);
  }
  return isaac_pgd_import_dword_loop_iterations(avail, clamped);
}

/* ======================== ABI v26 — PGDIVER ========================
   The import reader 0x009e4260's version gates + fail tail (the v25n
   "Next frontier" residuals). The stream READ calls (vtbl+0x14), the
   cdecl log 0xa112c0 and the cookie stay HOST; these laws are the
   DECISIONS around them. The snapshot version block is the 8 bytes at
   +0x4a0 (the ctor 0x9e3dc0 zero-row 0 = {0x4a0, 8}): the +0x4a0
   dword read fires only for the matched tag rows 4..9 (sections
   4/5/6 — rows 0..3 jmp 0x9e4467 directly, no read); the +0x4a4
   dword default store = 1 is UNCONDITIONAL (`mov dword [edx],1`
   @0x9e45fc) and the overwriting stream read fires only when the
   tag section >= 6 (`cmp [ebp-0x2c],6 ; jb` UNSIGNED). The fail tail
   0x9e4aa2..0x9e4ac7: cdecl log (1, 0xb80528, &buf[ebp-0x14]) HOST,
   then return 0 @0x9e4ac7. */

extern "C" uint32_t isaac_pgd_import_version_off(void) {
  return ISAAC_PGDIVER_VERSION_OFF;
}
extern "C" uint32_t isaac_pgd_import_version_bytes(void) {
  return ISAAC_PGDIVER_VERSION_BYTES;
}
extern "C" uint32_t isaac_pgd_import_version_read_count(void) {
  return ISAAC_PGDIVER_VERSION_READ_COUNT;
}
extern "C" uint32_t isaac_pgd_import_version_read_width(void) {
  return ISAAC_PGDIVER_VERSION_READ_WIDTH;
}
/* The matched tag ROW decides: rows 0..3 (sections 2/2/3/3) skip the
   +0x4a0 read entirely; rows 4..9 (sections 4/4/5/5/6/6) run the
   stream read (1 dword, width 4) into snap+0x4a0. */
extern "C" int32_t isaac_pgd_import_version_gate_row(uint32_t row) {
  return (row >= ISAAC_PGDIVER_VERSION_GATE_FIRST_ROW &&
          row < ISAAC_PGDITAG_HEADERS)
             ? 1
             : 0;
}
/* Section form (the reachable sections 2..6): fires iff section in
   {4,5,6} — equivalent to row >= 4 through the PGDITAG section rows. */
extern "C" int32_t isaac_pgd_import_version_gate_section(uint32_t section) {
  return (section >= ISAAC_PGDIVER_VERSION_GATE_FIRST_SECTION &&
          section <= ISAAC_PGDIVER_VERSION_GATE_LAST_SECTION)
             ? 1
             : 0;
}
extern "C" uint32_t isaac_pgd_import_version_finish_off(void) {
  return ISAAC_PGDIVER_FINISH_OFF;
}
extern "C" uint32_t isaac_pgd_import_version_finish_default(void) {
  return ISAAC_PGDIVER_FINISH_DEFAULT;
}
/* The +0x4a4 stream read fires only when the tag section >= 6
   (`cmp dword [ebp-0x2c],6 ; jb 0x9e4611` — UNSIGNED); the snapshot
   dword store = 1 runs on EVERY finish path regardless. */
extern "C" int32_t isaac_pgd_import_finish_gate(uint32_t section) {
  return section >= ISAAC_PGDIVER_FINISH_READ_GATE_SECTION ? 1 : 0;
}
extern "C" uint32_t isaac_pgd_import_tag_fail_ret_va(void) {
  return ISAAC_PGDIVER_FAIL_RET_VA;
}
extern "C" uint32_t isaac_pgd_import_tag_fail_log_argc(void) {
  return ISAAC_PGDIVER_FAIL_LOG_ARGC;
}
extern "C" int32_t isaac_pgd_import_tag_fail_returns_zero(void) {
  return 0;
}

/* ======================== ABI v26 — PGDREADER2 =====================
   The SIBLING save reader 0x0041d670 (caller 0x92ba01: `push esi ;
   lea ecx,[ebp-0x700] ; call 0x41d670`; esi = the STREAM, ecx = the
   0x700-byte SNAPSHOT; `ret 4`; al=1 success @0x41d928 -> ret
   0x41d93a; al=0 via the fail tail 0x41dd64 -> ret 0x41dd76). Its
   OWN 3-row tag table (0xb1b98c/0xb1b9a0/0xb1b9b4 -> sections 6/7/8,
   counts 9/10/10 — three FULL dwords compared, first match wins; all
   three 12-byte bodies share "ISAACNGSAVE0" so row 0 always wins
   today; a full miss -> tag-miss tail 0x41dd51 with the cdecl log
   (1, 0xb1b9c8, buf)), the size/checksum gate 0x41d748 (`cmp edi,8 ;
   jb skip` UNSIGNED — only section 8 is checked against the HOST
   0x683580 checksum; mismatch -> cdecl log (1, 0xb1ba00) + FAIL),
   the version dword reads snap+0x6dc / snap+0x6e0 (stream reads
   (1,4), UNCONDITIONAL on their paths), the record loop (entry gates
   SIGNED 0 <= prev < elemCount; count gate UNSIGNED zero-only;
   dispatch gate UNSIGNED (section-1) <= 9 -> 0..9 else NO row), the
   10 handler rows (sections 1..10 — same shape as the v24 reader:
   UNSIGNED cmova clamp, two-bound loops, byte rows setg SIGNED
   normalize) and the tails. The 0x683580 helper, the vtbl stream
   calls + polls, the 12 cdecl logs and the cookie 0xaef12b stay
   HOST. Evidence: section-notes/pgd-v26-41d670/. */

static const uint32_t kPg2TagDwords[3] = {
    ISAAC_PGD2_TAG_DWORD0, ISAAC_PGD2_TAG_DWORD1, ISAAC_PGD2_TAG_DWORD2};
static const uint32_t kPg2TagHeaderVas[ISAAC_PGD2_HEADERS] = {
    ISAAC_PGD2_HEADER0_VA, ISAAC_PGD2_HEADER1_VA, ISAAC_PGD2_HEADER2_VA};
static const int32_t kPg2TagSections[ISAAC_PGD2_HEADERS] = {
    ISAAC_PGD2_SECTION_ROW0, ISAAC_PGD2_SECTION_ROW1, ISAAC_PGD2_SECTION_ROW2};
static const int32_t kPg2TagCounts[ISAAC_PGD2_HEADERS] = {
    ISAAC_PGD2_COUNT_ROW0, ISAAC_PGD2_COUNT_ROW1, ISAAC_PGD2_COUNT_ROW2};
static const uint32_t kPg2Targets[ISAAC_PGD2ROW_ROWS] = {
    ISAAC_PGD2ROW_TARGET0_VA, ISAAC_PGD2ROW_TARGET1_VA, ISAAC_PGD2ROW_TARGET2_VA,
    ISAAC_PGD2ROW_TARGET3_VA, ISAAC_PGD2ROW_TARGET4_VA, ISAAC_PGD2ROW_TARGET5_VA,
    ISAAC_PGD2ROW_TARGET6_VA, ISAAC_PGD2ROW_TARGET7_VA, ISAAC_PGD2ROW_TARGET8_VA,
    ISAAC_PGD2ROW_TARGET9_VA};
static const uint32_t kPg2Offs[ISAAC_PGD2ROW_ROWS] = {
    ISAAC_PGD2ROW_OFF0, ISAAC_PGD2ROW_OFF1, ISAAC_PGD2ROW_OFF2, ISAAC_PGD2ROW_OFF3,
    ISAAC_PGD2ROW_OFF4, ISAAC_PGD2ROW_OFF5, ISAAC_PGD2ROW_OFF6, ISAAC_PGD2ROW_OFF7,
    ISAAC_PGD2ROW_OFF8, ISAAC_PGD2ROW_OFF9};
static const uint32_t kPg2Widths[ISAAC_PGD2ROW_ROWS] = {
    ISAAC_PGD2ROW_WIDTH0, ISAAC_PGD2ROW_WIDTH1, ISAAC_PGD2ROW_WIDTH2,
    ISAAC_PGD2ROW_WIDTH3, ISAAC_PGD2ROW_WIDTH4, ISAAC_PGD2ROW_WIDTH5,
    ISAAC_PGD2ROW_WIDTH6, ISAAC_PGD2ROW_WIDTH7, ISAAC_PGD2ROW_WIDTH8,
    ISAAC_PGD2ROW_WIDTH9};
static const uint32_t kPg2Clamps[ISAAC_PGD2ROW_ROWS] = {
    ISAAC_PGD2ROW_CLAMP0, ISAAC_PGD2ROW_CLAMP1, ISAAC_PGD2ROW_CLAMP2,
    ISAAC_PGD2ROW_CLAMP3, ISAAC_PGD2ROW_CLAMP4, ISAAC_PGD2ROW_CLAMP5,
    ISAAC_PGD2ROW_CLAMP6, ISAAC_PGD2ROW_CLAMP7, ISAAC_PGD2ROW_CLAMP8,
    ISAAC_PGD2ROW_CLAMP9};
static const int32_t kPg2Setg[ISAAC_PGD2ROW_ROWS] = {
    ISAAC_PGD2ROW_SETG0, ISAAC_PGD2ROW_SETG1, ISAAC_PGD2ROW_SETG2,
    ISAAC_PGD2ROW_SETG3, ISAAC_PGD2ROW_SETG4, ISAAC_PGD2ROW_SETG5,
    ISAAC_PGD2ROW_SETG6, ISAAC_PGD2ROW_SETG7, ISAAC_PGD2ROW_SETG8,
    ISAAC_PGD2ROW_SETG9};
static const uint32_t kPg2Logs[ISAAC_PGD2ROW_ROWS] = {
    ISAAC_PGD2ROW_LOG0_VA, ISAAC_PGD2ROW_LOG1_VA, ISAAC_PGD2ROW_LOG2_VA,
    ISAAC_PGD2ROW_LOG3_VA, ISAAC_PGD2ROW_LOG4_VA, ISAAC_PGD2ROW_LOG5_VA,
    ISAAC_PGD2ROW_LOG6_VA, ISAAC_PGD2ROW_LOG7_VA, ISAAC_PGD2ROW_LOG8_VA,
    ISAAC_PGD2ROW_LOG9_VA};

extern "C" int32_t isaac_pgd_sibling_tag_compare(uint32_t index, uint32_t d0,
                                                 uint32_t d1, uint32_t d2) {
  if (index >= ISAAC_PGD2_HEADERS) return 0;
  return (kPg2TagDwords[0] == d0 && kPg2TagDwords[1] == d1 &&
          kPg2TagDwords[2] == d2)
             ? 1
             : 0;
}
extern "C" int32_t isaac_pgd_sibling_tag_first_match(uint32_t d0, uint32_t d1,
                                                     uint32_t d2) {
  for (uint32_t i = 0; i < ISAAC_PGD2_HEADERS; ++i) {
    if (isaac_pgd_sibling_tag_compare(i, d0, d1, d2) != 0) {
      return (int32_t)i;
    }
  }
  return -1;
}
extern "C" int32_t isaac_pgd_sibling_tag_match_section(uint32_t d0,
                                                       uint32_t d1,
                                                       uint32_t d2) {
  const int32_t m = isaac_pgd_sibling_tag_first_match(d0, d1, d2);
  return m < 0 ? 0 : kPg2TagSections[m];
}
extern "C" int32_t isaac_pgd_sibling_tag_match_count(uint32_t d0, uint32_t d1,
                                                     uint32_t d2) {
  const int32_t m = isaac_pgd_sibling_tag_first_match(d0, d1, d2);
  return m < 0 ? 0 : kPg2TagCounts[m];
}
extern "C" uint32_t isaac_pgd_sibling_tag_header_va(uint32_t index) {
  return index < ISAAC_PGD2_HEADERS ? kPg2TagHeaderVas[index] : 0u;
}
extern "C" int32_t isaac_pgd_sibling_tag_header_section(uint32_t index) {
  return index < ISAAC_PGD2_HEADERS ? kPg2TagSections[index] : 0;
}
extern "C" int32_t isaac_pgd_sibling_tag_header_count(uint32_t index) {
  return index < ISAAC_PGD2_HEADERS ? kPg2TagCounts[index] : 0;
}
extern "C" uint32_t isaac_pgd_sibling_tag_compare_bytes(void) {
  return ISAAC_PGD2_TAG_BYTES;
}
extern "C" uint32_t isaac_pgd_sibling_tag_compare_dwords(void) {
  return ISAAC_PGD2_TAG_DWORDS;
}
extern "C" uint32_t isaac_pgd_sibling_tag_read_bytes(void) {
  return ISAAC_PGD2_TAG_READ_BYTES;
}
/* Size/checksum gate 0x41d748: `cmp edi,8 ; jb 0x41d766` UNSIGNED —
   only section 8 is checked, against the HOST 0x683580 checksum
   helper's return (ebx); `cmp [ebp-0x38],ebx ; je` ok; mismatch ->
   cdecl log (1, 0xb1ba00) + FAIL tail (ret 0). Returns 1 = FAIL. */
extern "C" int32_t isaac_pgd_sibling_size_gate(uint32_t section,
                                               uint32_t file_count,
                                               uint32_t checksum) {
  if (section < ISAAC_PGD2_SIZE_CHECK_SECTION) return 0;
  return file_count == checksum ? 0 : 1;
}
extern "C" uint32_t isaac_pgd_sibling_count_check_va(void) {
  return ISAAC_PGD2_SIZE_GATE_VA;
}
extern "C" uint32_t isaac_pgd_sibling_size_check_section(void) {
  return ISAAC_PGD2_SIZE_CHECK_SECTION;
}
extern "C" uint32_t isaac_pgd_sibling_tag_miss_va(void) {
  return ISAAC_PGD2_TAG_MISS_VA;
}
extern "C" uint32_t isaac_pgd_sibling_tag_miss_log_va(void) {
  return ISAAC_PGD2_TAG_MISS_LOG_VA;
}
extern "C" uint32_t isaac_pgd_sibling_count_mismatch_log_va(void) {
  return ISAAC_PGD2_COUNT_MISMATCH_LOG_VA;
}
/* Record-loop entry gates `test eax,eax ; js 0x41d916` +
   `cmp eax,[ebp-0x30] ; jge 0x41d916` — SIGNED 0 <= prev <
   elemCount (elemCount = the tag row's 9/0xa); a negative or >=
   elemCount prev FINISHES the whole reader. 1 = stay in the loop. */
extern "C" int32_t isaac_pgd_sibling_entry_gate(int32_t prev_section,
                                                int32_t elem_count) {
  return (prev_section >= 0 && prev_section < elem_count) ? 1 : 0;
}
/* Count gate `cmp [ebp-0x24],0 ; jbe 0x41d905` — UNSIGNED zero-only
   skip (count == 0 -> skip the record). 1 = skip the record. */
extern "C" int32_t isaac_pgd_sibling_record_count_gate(uint32_t count) {
  return count == 0u ? 1 : 0;
}
/* Dispatch gate `mov eax,[ebp-0x34] ; dec eax ; cmp eax,9 ; ja
   0x41d905` — UNSIGNED (section-1) <= 9 -> index 0..9, else -1. */
extern "C" int32_t isaac_pgd_sibling_dispatch_index(uint32_t section) {
  const uint32_t biased = section - 1u;
  return biased <= ISAAC_PGD2_DISPATCH_BIAS ? (int32_t)biased : -1;
}
extern "C" uint32_t isaac_pgd_sibling_dispatch_table_va(void) {
  return ISAAC_PGD2_DISPATCH_TABLE_VA;
}
extern "C" int32_t isaac_pgd_sibling_dispatch_entries(void) {
  return ISAAC_PGD2_DISPATCH_ENTRIES;
}
extern "C" uint32_t isaac_pgd_sibling_version_off(void) {
  return ISAAC_PGD2_VERSION_OFF;
}
extern "C" uint32_t isaac_pgd_sibling_version_finish_off(void) {
  return ISAAC_PGD2_VERSION_FINISH_OFF;
}
extern "C" uint32_t isaac_pgd_sibling_version_bytes(void) {
  return ISAAC_PGD2_VERSION_BYTES;
}
extern "C" uint32_t isaac_pgd_sibling_version_read_count(void) {
  return ISAAC_PGD2_VERSION_READ_COUNT;
}
extern "C" uint32_t isaac_pgd_sibling_version_read_width(void) {
  return ISAAC_PGD2_VERSION_READ_WIDTH;
}
extern "C" uint32_t isaac_pgd_sibling_success_va(void) {
  return ISAAC_PGD2_SUCCESS_VA;
}
extern "C" uint32_t isaac_pgd_sibling_ret_ok_va(void) {
  return ISAAC_PGD2_RET_OK_VA;
}
extern "C" uint32_t isaac_pgd_sibling_fail_tail_va(void) {
  return ISAAC_PGD2_FAIL_TAIL_VA;
}
extern "C" uint32_t isaac_pgd_sibling_fail_ret_va(void) {
  return ISAAC_PGD2_FAIL_RET_VA;
}
extern "C" uint32_t isaac_pgd_sibling_ret_stack_bytes(void) {
  return ISAAC_PGD2_RETURN_STACK_BYTES;
}
/* Per-section row composition: the dispatch gate applied to the
   semantic rows (mirror of v25p, sibling's own 10 rows). */
extern "C" int32_t isaac_pgd_sibling_section_row_index(uint32_t section) {
  return isaac_pgd_sibling_dispatch_index(section);
}
extern "C" uint32_t isaac_pgd_sibling_section_store_off(uint32_t section) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  return r < 0 ? 0u : kPg2Offs[r];
}
extern "C" uint32_t isaac_pgd_sibling_section_elem_width(uint32_t section) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  return r < 0 ? 0u : kPg2Widths[r];
}
extern "C" uint32_t isaac_pgd_sibling_section_clamp_max(uint32_t section) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  return r < 0 ? 0u : kPg2Clamps[r];
}
extern "C" int32_t isaac_pgd_sibling_section_flag_normalize(uint32_t section) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  return r < 0 ? 0 : kPg2Setg[r];
}
extern "C" uint32_t isaac_pgd_sibling_section_log_va(uint32_t section) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  return r < 0 ? 0u : kPg2Logs[r];
}
extern "C" uint32_t isaac_pgd_sibling_section_target_va(uint32_t section) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  return r < 0 ? 0u : kPg2Targets[r];
}
/* The composed per-row loop law (same shape as v25p, sibling rows):
   no row -> 0; clamped = clamp(count, rowMax) UNSIGNED cmova; byte
   rows -> min(avail, clamped) exact for every u32 pair; dword rows
   -> the v24 4*iters mod 2^32 closed form. */
extern "C" uint32_t isaac_pgd_sibling_section_loop_iterations(
    uint32_t section, uint32_t avail, uint32_t count) {
  const int32_t r = isaac_pgd_sibling_dispatch_index(section);
  if (r < 0) return 0u;
  const uint32_t clamped = isaac_pgd_import_clamp(count, kPg2Clamps[r]);
  if (kPg2Widths[r] == 1u) {
    return isaac_pgd_import_byte_loop_iterations(avail, clamped);
  }
  return isaac_pgd_import_dword_loop_iterations(avail, clamped);
}

/* ======================== ABI v27 ======================== */

/* ---------- PGDIEC: IncreaseEventCounter 0x00929b40 ---------- */

/* 52 direct gate rows in PE execution order (0x929b87..0x929ff8).
   Every GE row is `cmp u32 dword, IMM ; jb skip` UNSIGNED (opcode 72)
   -> fires iff u32(counter) >= threshold. Row 1 is `test eax,eax ;
   je` (NONZERO). Row 16 is a PAIR (`cmp [0x31c],0 ; jbe` + `cmp
   [0x320],0 ; jbe` -> fires iff BOTH nonzero). Row 41 is MODE:
   `cmp [0x5b4],0x1f ; jb` + `mov eax,[0xc7169c] ; cmp [eax+8],1 ;
   jne` -> fires iff u32 >= 0x1f AND the mode dword [0xc7169c]+8 == 1
   (host input). Rows 27/28 fire TWO unlock ids per gate (0x20+0xea at
   >= 0xa; 0x22+0x156 at >= 0xb; the second id has its own re-compare
   @0x929de2 in row 28). gate_va = the cmp/test instruction VA. */
static const IsaacPgdIecGate kIecGates[ISAAC_PGDIEC_GATE_ROWS] = {
    {0, ISAAC_PGDIEC_KIND_NONZERO, 0x00929b8du, 0x5e4, 0, 0, 0x167, 0,
     0x00929b98u, 0},
    {1, ISAAC_PGDIEC_KIND_GE, 0x00929ba3u, 0x5e4, 0, 0xa, 0x181, 0,
     0x00929bafu, 0},
    {2, ISAAC_PGDIEC_KIND_GE, 0x00929bb4u, 0x5dc, 0, 0xa, 0x179, 0,
     0x00929bc4u, 0},
    {3, ISAAC_PGDIEC_KIND_GE, 0x00929bc9u, 0x5e0, 0, 5, 0x17e, 0,
     0x00929bd9u, 0},
    {4, ISAAC_PGDIEC_KIND_GE, 0x00929be4u, 0x2c4, 0, 0x64, 0x55, 0,
     0x00929bedu, 0},
    {5, ISAAC_PGDIEC_KIND_GE, 0x00929bf8u, 0x2c4, 0, 0x1f4, 0x15e, 0,
     0x00929c06u, 0},
    {6, ISAAC_PGDIEC_KIND_GE, 0x00929c11u, 0x2c8, 0, 0xa, 0x1c, 0,
     0x00929c1au, 0},
    {7, ISAAC_PGDIEC_KIND_GE, 0x00929c25u, 0x2c8, 0, 0x64, 0xc, 0,
     0x00929c2eu, 0},
    {8, ISAAC_PGDIEC_KIND_GE, 0x00929c33u, 0x2d8, 0, 4, 0x24, 0,
     0x00929c40u, 0},
    {9, ISAAC_PGDIEC_KIND_GE, 0x00929c45u, 0x2e0, 0, 0xa, 0x1a, 0,
     0x00929c52u, 0},
    {10, ISAAC_PGDIEC_KIND_GE, 0x00929c57u, 0x2d0, 0, 0x64, 0x91, 0,
     0x00929c67u, 0},
    {11, ISAAC_PGDIEC_KIND_GE, 0x00929c6cu, 0x5c4, 0, 5, 0x161, 0,
     0x00929c7cu, 0},
    {12, ISAAC_PGDIEC_KIND_GE, 0x00929c87u, 0x2e8, 0, 0xa, 0x44, 0,
     0x00929c90u, 0},
    {13, ISAAC_PGDIEC_KIND_GE, 0x00929c9bu, 0x2e8, 0, 5, 0x39, 0,
     0x00929ca4u, 0},
    {14, ISAAC_PGDIEC_KIND_GE, 0x00929ca9u, 0x2f0, 0, 5, 0x4e, 0,
     0x00929cb6u, 0},
    {15, ISAAC_PGDIEC_KIND_PAIR, 0x00929cbbu, 0x31c, 0x320, 0, 0x29, 0,
     0x00929cd1u, 0},
    {16, ISAAC_PGDIEC_KIND_GE, 0x00929cd6u, 0x2e4, 0, 0x64, 0x1e, 0,
     0x00929ce3u, 0},
    {17, ISAAC_PGDIEC_KIND_GE, 0x00929ceeu, 0x2c0, 0, 1, 0x51, 0,
     0x00929cf7u, 0},
    {18, ISAAC_PGDIEC_KIND_GE, 0x00929d02u, 0x2c0, 0, 2, 0x96, 0,
     0x00929d0eu, 0},
    {19, ISAAC_PGDIEC_KIND_GE, 0x00929d19u, 0x2c0, 0, 3, 8, 0,
     0x00929d22u, 0},
    {20, ISAAC_PGDIEC_KIND_GE, 0x00929d2du, 0x2c0, 0, 4, 0x8b, 0,
     0x00929d39u, 0},
    {21, ISAAC_PGDIEC_KIND_GE, 0x00929d44u, 0x2c0, 0, 5, 0x21, 0,
     0x00929d4du, 0},
    {22, ISAAC_PGDIEC_KIND_GE, 0x00929d58u, 0x2c0, 0, 6, 0x8c, 0,
     0x00929d64u, 0},
    {23, ISAAC_PGDIEC_KIND_GE, 0x00929d6fu, 0x2c0, 0, 7, 0x8d, 0,
     0x00929d7bu, 0},
    {24, ISAAC_PGDIEC_KIND_GE, 0x00929d86u, 0x2c0, 0, 8, 0xa, 0,
     0x00929d8fu, 0},
    {25, ISAAC_PGDIEC_KIND_GE, 0x00929d9au, 0x2c0, 0, 9, 0xb, 0,
     0x00929da3u, 0},
    {26, ISAAC_PGDIEC_KIND_GE, 0x00929daeu, 0x2c0, 0, 0xa, 0x20, 0xea,
     0x00929db7u, 0x00929dc3u},
    {27, ISAAC_PGDIEC_KIND_GE, 0x00929dceu, 0x2c0, 0, 0xb, 0x22, 0x156,
     0x00929dd7u, 0x00929deeu},
    {28, ISAAC_PGDIEC_KIND_GE, 0x00929df9u, 0x2c0, 0, 0x10, 0x157, 0,
     0x00929e05u, 0},
    {29, ISAAC_PGDIEC_KIND_GE, 0x00929e10u, 0x2c0, 0, 0x15, 0x158, 0,
     0x00929e1cu, 0},
    {30, ISAAC_PGDIEC_KIND_GE, 0x00929e27u, 0x2c0, 0, 0x1e, 0x159, 0,
     0x00929e33u, 0},
    {31, ISAAC_PGDIEC_KIND_GE, 0x00929e38u, 0x2ec, 0, 0x14, 0x3d, 0,
     0x00929e45u, 0},
    {32, ISAAC_PGDIEC_KIND_GE, 0x00929e4au, 0x2f4, 0, 0x64, 0x40, 0,
     0x00929e57u, 0},
    {33, ISAAC_PGDIEC_KIND_GE, 0x00929e62u, 0x2f8, 0, 0xa, 0x42, 0,
     0x00929e6bu, 0},
    {34, ISAAC_PGDIEC_KIND_GE, 0x00929e76u, 0x2f8, 0, 0x19, 0x17c, 0,
     0x00929e82u, 0},
    {35, ISAAC_PGDIEC_KIND_GE, 0x00929e8du, 0x2fc, 0, 0x14, 0x8e, 0,
     0x00929e99u, 0},
    {36, ISAAC_PGDIEC_KIND_GE, 0x00929ea4u, 0x2fc, 0, 0x19, 0x178, 0,
     0x00929eb0u, 0},
    {37, ISAAC_PGDIEC_KIND_GE, 0x00929ebbu, 0x2fc, 0, 0x32, 0x17f, 0,
     0x00929ec7u, 0},
    {38, ISAAC_PGDIEC_KIND_GE, 0x00929eccu, 0x300, 0, 0x1e, 0x93, 0,
     0x00929edcu, 0},
    {39, ISAAC_PGDIEC_KIND_GE, 0x00929ee1u, 0x304, 0, 0x1e, 0x94, 0,
     0x00929ef1u, 0},
    {40, ISAAC_PGDIEC_KIND_MODE, 0x00929ef6u, 0x5b4, 0, 0x1f, 0x145, 0,
     0x00929f11u, 0},
    {41, ISAAC_PGDIEC_KIND_GE, 0x00929f16u, 0x5bc, 0, 5, 0x150, 0,
     0x00929f26u, 0},
    {42, ISAAC_PGDIEC_KIND_GE, 0x00929f2bu, 0x5c0, 0, 7, 0x162, 0,
     0x00929f3bu, 0},
    {43, ISAAC_PGDIEC_KIND_GE, 0x00929f40u, 0x5c8, 0, 0x14, 0x166, 0,
     0x00929f50u, 0},
    {44, ISAAC_PGDIEC_KIND_GE, 0x00929f55u, 0x5cc, 0, 0x14, 0x16a, 0,
     0x00929f65u, 0},
    {45, ISAAC_PGDIEC_KIND_GE, 0x00929f6au, 0x5d0, 0, 0x32, 0x16c, 0,
     0x00929f7au, 0},
    {46, ISAAC_PGDIEC_KIND_GE, 0x00929f7fu, 0x5d4, 0, 0x14, 0x173, 0,
     0x00929f8fu, 0},
    {47, ISAAC_PGDIEC_KIND_GE, 0x00929f94u, 0x5d8, 0, 0x32, 0x177, 0,
     0x00929fa4u, 0},
    {48, ISAAC_PGDIEC_KIND_GE, 0x00929fa9u, 0xa70, 0, 0xa, 0x199, 0,
     0x00929fb9u, 0},
    {49, ISAAC_PGDIEC_KIND_GE, 0x00929fbeu, 0xa74, 0, 0xa, 0x221, 0,
     0x00929fceu, 0},
    {50, ISAAC_PGDIEC_KIND_GE, 0x00929fd3u, 0xa78, 0, 5, 0x20b, 0,
     0x00929fe3u, 0},
    {51, ISAAC_PGDIEC_KIND_GE, 0x00929fe8u, 0x534, 0, 3, 0x197, 0,
     0x00929ff8u, 0},
};

extern "C" uint32_t isaac_pgd_iec_va(void) { return ISAAC_PGDIEC_VA; }
extern "C" uint32_t isaac_pgd_iec_ret_va(void) { return ISAAC_PGDIEC_RET_VA; }
extern "C" uint32_t isaac_pgd_iec_body_bytes(void) {
  return ISAAC_PGDIEC_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_iec_call_site_count(void) {
  return ISAAC_PGDIEC_CALL_SITES;
}
extern "C" uint32_t isaac_pgd_iec_host_try_unlock_va(void) {
  return ISAAC_PGDIEC_HOST_VA_TRY_UNLOCK;
}
extern "C" uint32_t isaac_pgd_iec_host_cookie_va(void) {
  return ISAAC_PGDIEC_HOST_VA_COOKIE;
}
extern "C" int32_t isaac_pgd_iec_readonly_off(void) {
  return ISAAC_PGDIEC_READONLY_OFF;
}
extern "C" int32_t isaac_pgd_iec_dirty_off(void) {
  return ISAAC_PGDIEC_DIRTY_OFF;
}
extern "C" int32_t isaac_pgd_iec_counter_base(void) {
  return ISAAC_PGDIEC_COUNTER_BASE;
}

/* `cmp byte [esi+1],0 ; jne skip-all` @0x929b5e — LOW BYTE gate. */
extern "C" int32_t isaac_pgd_iec_gate_open(uint32_t readonly) {
  return (readonly & 0xffu) == 0u ? 1 : 0;
}

/* `mov [esi+ebx*4+0x2bc],eax` — slot UNCHECKED (never masked). */
extern "C" uint32_t isaac_pgd_iec_counter_store_off(uint32_t slot) {
  return (ISAAC_PGDIEC_COUNTER_BASE + 4u * slot) & 0xffffffffu;
}

/* Dirty store `mov byte [esi],1` @0x929b84 runs iff the readonly gate
   opens (before any cascade row). */
extern "C" int32_t isaac_pgd_iec_dirty_fires(uint32_t readonly) {
  return isaac_pgd_iec_gate_open(readonly);
}

extern "C" int32_t isaac_pgd_iec_gate_row_count(void) {
  return ISAAC_PGDIEC_GATE_ROWS;
}

extern "C" int32_t isaac_pgd_iec_gate_row(int32_t step, IsaacPgdIecGate* out) {
  if (step < 0 || step >= ISAAC_PGDIEC_GATE_ROWS) {
    return 0;
  }
  if (out != nullptr) {
    *out = kIecGates[step];
  }
  return 1;
}

/* The machine fires the TryUnlock call iff the row's compare does NOT
   skip: GE rows `cmp u32, IMM ; jb skip` -> u32(counter) >= threshold;
   NONZERO `test ; je skip` -> u32(counter) != 0; PAIR `jbe` x2 -> both
   nonzero; MODE -> u32(counter) >= threshold AND mode_word == 1 (the
   mode dword [0xc7169c]+8 is a host input, compared FULL width). */
extern "C" int32_t isaac_pgd_iec_gate_fires(int32_t step, uint32_t counter,
                                            uint32_t counter2,
                                            uint32_t mode_word) {
  if (step < 0 || step >= ISAAC_PGDIEC_GATE_ROWS) {
    return 0;
  }
  const IsaacPgdIecGate* g = &kIecGates[step];
  switch (g->kind) {
    case ISAAC_PGDIEC_KIND_NONZERO:
      return counter != 0u ? 1 : 0;
    case ISAAC_PGDIEC_KIND_PAIR:
      return (counter != 0u && counter2 != 0u) ? 1 : 0;
    case ISAAC_PGDIEC_KIND_MODE:
      return (counter >= g->threshold && mode_word == ISAAC_PGDIEC_MODE_VALUE)
                 ? 1
                 : 0;
    case ISAAC_PGDIEC_KIND_GE:
    default:
      return counter >= g->threshold ? 1 : 0;
  }
}

/* ======================== ABI v28 — PGDULD ======================== */

extern "C" uint32_t isaac_pgd_uld_va(void) { return ISAAC_PGDULD_VA; }
extern "C" uint32_t isaac_pgd_uld_ret_va(void) { return ISAAC_PGDULD_RET_VA; }
extern "C" uint32_t isaac_pgd_uld_body_bytes(void) {
  return ISAAC_PGDULD_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_uld_call_site_count(void) {
  return ISAAC_PGDULD_CALL_SITES;
}
extern "C" uint32_t isaac_pgd_uld_host_try_unlock_va(void) {
  return ISAAC_PGDULD_HOST_VA_TRY_UNLOCK;
}
extern "C" uint32_t isaac_pgd_uld_try_unlock_call_va(void) {
  return ISAAC_PGDULD_TRY_UNLOCK_CALL_VA;
}

/* `sub ecx,[0x2a664] ; mov eax,0x63e7063f ; imul ecx ; sar edx,6 ;
   mov edi,edx ; shr edi,31 ; dec edi ; add edi,edx` @0x9296eb..
   0x929703. The 64-bit product (x * magic) with x the u32 wrap of
   (end - start); high32 >> 6 (SAR), then -1 iff non-negative. This
   is the raw multiply law — NOT /164 (the magic is ceil(2^38/164);
   the -1 fold makes exact multiples of 164 land one below). */
extern "C" int32_t isaac_pgd_uld_count(uint32_t start, uint32_t end) {
  const int32_t x = static_cast<int32_t>(end - start);
  const int64_t p = static_cast<int64_t>(x) * ISAAC_PGDULD_DIV_MAGIC;
  int32_t t = static_cast<int32_t>(static_cast<uint32_t>(
      static_cast<uint64_t>(p) >> 32u)); /* signed high32 */
  t >>= 6;                                /* SAR */
  return t - (t >= 0 ? 1 : 0);
}

/* `cmp esi,edi ; mov eax,edi ; cmovb eax,esi` @0x929709 — min_u32
   (UNSIGNED: a wrapped negative count selects the tier). */
extern "C" uint32_t isaac_pgd_uld_segment_index(int32_t count,
                                                uint32_t tier) {
  const uint32_t c = static_cast<uint32_t>(count);
  return tier < c ? tier : c;
}

/* `sub ecx,[0x4c] ; sub ecx,[0x48]... sar ecx,2 ; cmp ebx,ecx ; jae`
   — the unsigned inner-loop bound (0 when n <= 0). */
extern "C" uint32_t isaac_pgd_uld_loop_iterations(uint32_t seg_ptr,
                                                  uint32_t seg_count_word) {
  const int32_t n = static_cast<int32_t>(seg_count_word - seg_ptr) >> 2;
  return static_cast<uint32_t>(n);
}

/* `cmp byte [entry+0x38],dl ; cmovne edx,eax` — AND accumulate; the
   entry byte is compared as a BYTE (uint32 in, & 0xff). */
extern "C" int32_t isaac_pgd_uld_flag_accum(int32_t flag,
                                            uint32_t entry_byte) {
  return (entry_byte & 0xffu) != 0u ? (flag != 0 ? 1 : 0) : 0;
}

/* The .rdata ladder 0xb7b0b0: tier -> unlock id (const table). */
extern "C" uint32_t isaac_pgd_uld_unlock_id(uint32_t tier) {
  return tier < ISAAC_PGDULD_LADDER_ROWS ? kUldLadder[tier] : 0u;
}

/* `cmp byte [flag],0 ; je skip` + `cmp esi,0x2d ; ja skip`
   (UNSIGNED) + `test eax,eax ; je skip` @0x929759..0x92976d -> the
   TryUnlock call pin 0x929773 fires. */
extern "C" int32_t isaac_pgd_uld_fire(int32_t flag, uint32_t tier) {
  if (flag == 0) return 0;
  if (tier > ISAAC_PGDULD_TIER_MAX) return 0;
  return isaac_pgd_uld_unlock_id(tier) != 0u ? 1 : 0;
}

/* ======================== ABI v28 — PGDHOST pins ======================== */

extern "C" uint32_t isaac_pgd_host_cookie_va(void) {
  return ISAAC_PGD_HOST_VA_COOKIE;
}
extern "C" uint32_t isaac_pgd_cookie_global_va(void) {
  return ISAAC_PGD_COOKIE_GLOBAL_VA;
}
extern "C" uint32_t isaac_pgd_cookie_fail_va(void) {
  return ISAAC_PGD_COOKIE_FAIL_VA;
}

/* `cmp ecx,[0xbf93b4] ; jne 0xaef134` — cookie == global -> ret,
   else the gs-failure terminal 0xaef775. */
extern "C" int32_t isaac_pgd_cookie_check_ok(uint32_t cookie,
                                             uint32_t cookie_global) {
  return cookie == cookie_global ? 1 : 0;
}

extern "C" int32_t isaac_pgd_checksum_region_skip_front(void) {
  return ISAAC_PGD_CHECKSUM_REGION_SKIP_FRONT;
}
extern "C" int32_t isaac_pgd_checksum_region_skip_back(void) {
  return ISAAC_PGD_CHECKSUM_REGION_SKIP_BACK;
}

/* ======================== ABI v29 — PGDISP ======================== */

extern "C" uint32_t isaac_pgd_disp_va(void) { return ISAAC_PGDISP_VA; }
extern "C" uint32_t isaac_pgd_disp_ret_va(void) { return ISAAC_PGDISP_RET_VA; }
extern "C" int32_t isaac_pgd_disp_body_bytes(void) {
  return ISAAC_PGDISP_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_disp_call_site_count(void) {
  return ISAAC_PGDISP_CALL_SITES;
}
extern "C" uint32_t isaac_pgd_disp_host_stamp_helper_va(void) {
  return ISAAC_PGDISP_HOST_VA_STAMP_HELPER;
}
extern "C" uint32_t isaac_pgd_disp_host_save_cloud_va(void) {
  return ISAAC_PGDISP_HOST_VA_SAVE_CLOUD;
}
extern "C" uint32_t isaac_pgd_disp_host_save_local_va(void) {
  return ISAAC_PGDISP_HOST_VA_SAVE_LOCAL;
}
extern "C" uint32_t isaac_pgd_disp_store_va(void) {
  return ISAAC_PGDISP_STORE_VA;
}
extern "C" uint32_t isaac_pgd_disp_stamp_call_va(void) {
  return ISAAC_PGDISP_STAMP_CALL_VA;
}
extern "C" uint32_t isaac_pgd_disp_cloud_call_va(void) {
  return ISAAC_PGDISP_CLOUD_CALL_VA;
}
extern "C" uint32_t isaac_pgd_disp_local_call_va(void) {
  return ISAAC_PGDISP_LOCAL_CALL_VA;
}
extern "C" uint32_t isaac_pgd_disp_probe_call_va(void) {
  return ISAAC_PGDISP_PROBE_CALL_VA;
}
extern "C" uint32_t isaac_pgd_disp_probe_slot_va(void) {
  return ISAAC_PGDISP_PROBE_SLOT_VA;
}
extern "C" uint32_t isaac_pgd_disp_probe_arg_va(void) {
  return ISAAC_PGDISP_PROBE_ARG_VA;
}
extern "C" uint32_t isaac_pgd_disp_global_va(void) {
  return ISAAC_PGDISP_GLOBAL_VA;
}
extern "C" int32_t isaac_pgd_disp_cloud_off(void) {
  return ISAAC_PGDISP_CLOUD_OFF;
}
extern "C" uint32_t isaac_pgd_disp_gate0_cmp_va(void) {
  return ISAAC_PGDISP_GATE0_CMP_VA;
}
extern "C" uint32_t isaac_pgd_disp_gate0f8c_cmp_va(void) {
  return ISAAC_PGDISP_GATE0F8C_CMP_VA;
}
extern "C" uint32_t isaac_pgd_disp_arg_cmp_va(void) {
  return ISAAC_PGDISP_ARG_CMP_VA;
}
extern "C" uint32_t isaac_pgd_disp_cloud_dword_cmp_va(void) {
  return ISAAC_PGDISP_CLOUD_DWORD_CMP_VA;
}
extern "C" uint32_t isaac_pgd_disp_cloud_byte_cmp_va(void) {
  return ISAAC_PGDISP_CLOUD_BYTE_CMP_VA;
}
extern "C" int32_t isaac_pgd_disp_return_stack(void) {
  return ISAAC_PGDISP_RETURN_STACK;
}

/* `cmpb $0,(%esi) ; je early` + `cmpb $0,0xf8c(%esi) ; je early`
   @0x929667/@0x92966c — both BYTE gates; &0xff only where the PE
   tests a byte. */
extern "C" int32_t isaac_pgd_disp_proceed(uint32_t this0,
                                          uint32_t this_f8c) {
  return ((this0 & 0xffu) != 0u && (this_f8c & 0xffu) != 0u) ? 1 : 0;
}

/* `movb $0,(%esi)` @0x929679 — unconditional after both gates. */
extern "C" int32_t isaac_pgd_disp_store_clear_fires(uint32_t this0,
                                                    uint32_t this_f8c) {
  return isaac_pgd_disp_proceed(this0, this_f8c);
}

/* `cmpb $0,0x8(%ebp) ; je skip` @0x929675 — arg BYTE gates the
   0x9292c0 stamp-helper call @0x92967e. */
extern "C" int32_t isaac_pgd_disp_stamp_call_fires(uint32_t this0,
                                                   uint32_t this_f8c,
                                                   uint32_t arg1) {
  return (isaac_pgd_disp_proceed(this0, this_f8c) != 0 &&
          (arg1 & 0xffu) != 0u)
             ? 1
             : 0;
}

/* `cmpl $0,(%eax)` FULL DWORD @0x929697 AND `cmpb $0,0x2a3a4(%edi)`
   BYTE @0x92969c -> 0x928ee0 @0x9296a7 else 0x9294f0 @0x9296b4. */
extern "C" int32_t isaac_pgd_disp_cloud_selected(uint32_t probe_dword,
                                                 uint32_t global_2a3a4) {
  return (probe_dword != 0u && (global_2a3a4 & 0xffu) != 0u) ? 1 : 0;
}

ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_host_stamp_helper_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_host_save_cloud_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_host_save_local_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_stamp_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_cloud_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_local_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_probe_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_probe_slot_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_probe_arg_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_global_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_cloud_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_gate0_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_gate0f8c_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_arg_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_cloud_dword_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_cloud_byte_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_proceed);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_store_clear_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_stamp_call_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_disp_cloud_selected);

/* ======================== ABI v30 — PGDCK (checksum leaf pins) ======================== */

extern "C" uint32_t isaac_pgd_checksum_update_va(void) {
  return ISAAC_PGDCK_UPDATE_VA;
}
extern "C" uint32_t isaac_pgd_checksum_update_ret_va(void) {
  return ISAAC_PGDCK_UPDATE_RET_VA;
}
extern "C" int32_t isaac_pgd_checksum_update_body_bytes(void) {
  return ISAAC_PGDCK_UPDATE_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_checksum_update_inbound(void) {
  return ISAAC_PGDCK_UPDATE_INBOUND;
}
extern "C" uint32_t isaac_pgd_checksum_table_va(void) {
  return ISAAC_PGDCK_TABLE_VA;
}
extern "C" uint32_t isaac_pgd_checksum_table_flag_va(void) {
  return ISAAC_PGDCK_TABLE_FLAG_VA;
}
extern "C" uint32_t isaac_pgd_checksum_gen_first_shift_va(void) {
  return ISAAC_PGDCK_GEN_FIRST_SHIFT_VA;
}
extern "C" uint32_t isaac_pgd_checksum_gen_sar_first_va(void) {
  return ISAAC_PGDCK_GEN_SAR_FIRST_VA;
}
extern "C" uint32_t isaac_pgd_checksum_gen_store_va(void) {
  return ISAAC_PGDCK_GEN_STORE_VA;
}
extern "C" uint32_t isaac_pgd_checksum_gen_loop_back_va(void) {
  return ISAAC_PGDCK_GEN_LOOP_BACK_VA;
}
extern "C" uint32_t isaac_pgd_checksum_mode0_fold_va(void) {
  return ISAAC_PGDCK_MODE0_FOLD_VA;
}
extern "C" uint32_t isaac_pgd_checksum_mode1_init_va(void) {
  return ISAAC_PGDCK_MODE1_INIT_VA;
}
extern "C" uint32_t isaac_pgd_checksum_mode1_loop_va(void) {
  return ISAAC_PGDCK_MODE1_LOOP_VA;
}
extern "C" uint32_t isaac_pgd_checksum_mode1_loop_back_va(void) {
  return ISAAC_PGDCK_MODE1_LOOP_BACK_VA;
}
extern "C" uint32_t isaac_pgd_checksum_mode1_final_va(void) {
  return ISAAC_PGDCK_MODE1_FINAL_VA;
}
extern "C" int32_t isaac_pgd_checksum_state_off_lane(void) {
  return ISAAC_PGDCK_STATE_OFF_LANE;
}
extern "C" int32_t isaac_pgd_checksum_state_off_partial(void) {
  return ISAAC_PGDCK_STATE_OFF_PARTIAL;
}
extern "C" int32_t isaac_pgd_checksum_state_off_acc(void) {
  return ISAAC_PGDCK_STATE_OFF_ACC;
}
extern "C" int32_t isaac_pgd_checksum_state_off_mode(void) {
  return ISAAC_PGDCK_STATE_OFF_MODE;
}
extern "C" uint32_t isaac_pgd_checksum_region_va(void) {
  return ISAAC_PGDCK_REGION_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_ret_va(void) {
  return ISAAC_PGDCK_REGION_RET_VA;
}
extern "C" int32_t isaac_pgd_checksum_region_body_bytes(void) {
  return ISAAC_PGDCK_REGION_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_checksum_region_inbound(void) {
  return ISAAC_PGDCK_REGION_INBOUND;
}
extern "C" uint32_t isaac_pgd_checksum_region_seh_handler_va(void) {
  return ISAAC_PGDCK_REGION_SEH_HANDLER_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_cookie_va(void) {
  return ISAAC_PGDCK_REGION_COOKIE_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_update_call_va(void) {
  return ISAAC_PGDCK_REGION_UPDATE_CALL_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_io_call_va(void) {
  return ISAAC_PGDCK_REGION_IO_CALL_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_tell_call_va(void) {
  return ISAAC_PGDCK_REGION_TELL_CALL_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_seek_call_va(void) {
  return ISAAC_PGDCK_REGION_SEEK_CALL_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_read_call_va(void) {
  return ISAAC_PGDCK_REGION_READ_CALL_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_len_sub_va(void) {
  return ISAAC_PGDCK_REGION_LEN_SUB_VA;
}
extern "C" uint32_t isaac_pgd_checksum_region_seed_store_va(void) {
  return ISAAC_PGDCK_REGION_SEED_STORE_VA;
}
extern "C" int32_t isaac_pgd_checksum_vtbl_tell_off(void) {
  return ISAAC_PGDCK_VTBL_TELL_OFF;
}
extern "C" int32_t isaac_pgd_checksum_vtbl_seek_off(void) {
  return ISAAC_PGDCK_VTBL_SEEK_OFF;
}
extern "C" int32_t isaac_pgd_checksum_vtbl_read_off(void) {
  return ISAAC_PGDCK_VTBL_READ_OFF;
}

/* Region length: `sub ebx,[ebp+8] ; sub ebx,[ebp+0xc]` @0x6835b8/
   0x6835ba — pos - skip_front - skip_back as two u32 wraps. */
extern "C" uint32_t isaac_pgd_checksum_region_len(uint32_t size,
                                                  uint32_t skip_front,
                                                  uint32_t skip_back) {
  return (uint32_t)((uint32_t)(size - skip_front) - skip_back);
}

/* ======================== ABI v30 — PGDWRI (writer record plan) ======================== */

/* The 61 static checksum-update call sites of 0x9282e0, in execution
   order. Row = {call VA, role, hashed byte length}. Roles:
   PRE 0 / ID 1 / CAP 2 / CNT 3 / ELT 4 / SUB 5 / KEY 6 / VAL 7 /
   TAIL 8. ELT rows hash the element width (1 byte-flag rows, 4 u32
   rows); every other row hashes its full dword (len 4). */
typedef struct IsaacPgdWriCsRow {
  uint32_t va;
  int32_t role;
  int32_t len;
} IsaacPgdWriCsRow;

static const IsaacPgdWriCsRow kWriCsRows[ISAAC_PGDWRI_CS_SITES] = {
    /* R0 pre-record dword this+0xf84 */
    {0x00928336u, ISAAC_PGDWRI_ROLE_PRE, 4},
    /* R1 id 1: achievements byte flags this+0x38, count 0x282 */
    {0x0092836fu, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x00928393u, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x009283b7u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x009283ebu, ISAAC_PGDWRI_ROLE_ELT, 1},
    /* R2 id 2: event counters u32 this+0x2bc, count 0x20b */
    {0x0092842au, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x0092844eu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x00928472u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x0092849fu, ISAAC_PGDWRI_ROLE_ELT, 4},
    /* R3 id 3: sec3 u32 this+0xdc8, count 0xe */
    {0x009284e1u, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x00928505u, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x00928529u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x0092855bu, ISAAC_PGDWRI_ROLE_ELT, 4},
    /* R4 id 4: item collection byte flags this+0xae8, count 0x2dd */
    {0x0092859du, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x009285c1u, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x009285e5u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x0092861cu, ISAAC_PGDWRI_ROLE_ELT, 1},
    /* R5 id 5: sec5 byte flags this+0xe00, count 7 */
    {0x0092865bu, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x0092867fu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x009286a3u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x009286dbu, ISAAC_PGDWRI_ROLE_ELT, 1},
    /* R6 id 6: bosses byte flags this+0xe07, count 0x68 */
    {0x0092871au, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x0092873eu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x00928762u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x0092879bu, ISAAC_PGDWRI_ROLE_ELT, 1},
    /* R7 id 7: challenges byte flags this+0xe6f, count 0x2e */
    {0x009287dau, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x009287feu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x00928822u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x0092885bu, ISAAC_PGDWRI_ROLE_ELT, 1},
    /* R8 id 8: sec8 u32 this+0xea0, count 0x1b */
    {0x0092889au, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x009288beu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x009288e2u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x00928918u, ISAAC_PGDWRI_ROLE_ELT, 4},
    /* R9 id 9: sec9 u32 this+0xf0c, count 2 */
    {0x0092895au, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x0092897eu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x009289a2u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x009289d8u, ISAAC_PGDWRI_ROLE_ELT, 4},
    /* R10 id 0xa: sec10 byte flags this+0xf14, count 0x50 */
    {0x00928a1au, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x00928a3eu, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x00928a62u, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x00928a9bu, ISAAC_PGDWRI_ROLE_ELT, 1},
    /* R11 id 0xb: header [id=11][cap=total<<2][subcount=4] + 8 sub
       dwords (tag, cap<<2 per walk) + 4 walks x (key, value) */
    {0x00928aefu, ISAAC_PGDWRI_ROLE_ID, 4},
    {0x00928b13u, ISAAC_PGDWRI_ROLE_CAP, 4},
    {0x00928b3eu, ISAAC_PGDWRI_ROLE_CNT, 4},
    {0x00928b69u, ISAAC_PGDWRI_ROLE_SUB, 4}, /* tag 4 */
    {0x00928b99u, ISAAC_PGDWRI_ROLE_SUB, 4}, /* f80<<2 */
    {0x00928bceu, ISAAC_PGDWRI_ROLE_KEY, 4}, /* walk f7c */
    {0x00928bf1u, ISAAC_PGDWRI_ROLE_VAL, 4},
    {0x00928c2fu, ISAAC_PGDWRI_ROLE_SUB, 4}, /* tag 2 */
    {0x00928c5fu, ISAAC_PGDWRI_ROLE_SUB, 4}, /* f70<<2 */
    {0x00928c91u, ISAAC_PGDWRI_ROLE_KEY, 4}, /* walk f6c */
    {0x00928cb4u, ISAAC_PGDWRI_ROLE_VAL, 4},
    {0x00928cf2u, ISAAC_PGDWRI_ROLE_SUB, 4}, /* tag 3 */
    {0x00928d22u, ISAAC_PGDWRI_ROLE_SUB, 4}, /* f78<<2 */
    {0x00928d54u, ISAAC_PGDWRI_ROLE_KEY, 4}, /* walk f74 */
    {0x00928d77u, ISAAC_PGDWRI_ROLE_VAL, 4},
    {0x00928db5u, ISAAC_PGDWRI_ROLE_SUB, 4}, /* tag 1 */
    {0x00928de5u, ISAAC_PGDWRI_ROLE_SUB, 4}, /* f68<<2 */
    {0x00928e1eu, ISAAC_PGDWRI_ROLE_KEY, 4}, /* walk f64 */
    {0x00928e41u, ISAAC_PGDWRI_ROLE_VAL, 4},
    /* tail: save counter (post `incl [this+0xf88]`) */
    {0x00928e7cu, ISAAC_PGDWRI_ROLE_TAIL, 4},
};

extern "C" uint32_t isaac_pgd_wri_va(void) { return ISAAC_PGDWRI_VA; }
extern "C" uint32_t isaac_pgd_wri_ret_va(void) { return ISAAC_PGDWRI_RET_VA; }
extern "C" int32_t isaac_pgd_wri_body_bytes(void) {
  return ISAAC_PGDWRI_BODY_BYTES;
}
extern "C" uint32_t isaac_pgd_wri_state_mode_store_va(void) {
  return ISAAC_PGDWRI_STATE_MODE_STORE_VA;
}
extern "C" uint32_t isaac_pgd_wri_state_lane_store_va(void) {
  return ISAAC_PGDWRI_STATE_LANE_STORE_VA;
}
extern "C" uint32_t isaac_pgd_wri_state_partial_store_va(void) {
  return ISAAC_PGDWRI_STATE_PARTIAL_STORE_VA;
}
extern "C" uint32_t isaac_pgd_wri_state_seed_store_va(void) {
  return ISAAC_PGDWRI_STATE_SEED_STORE_VA;
}
extern "C" int32_t isaac_pgd_wri_pre_off(void) {
  return ISAAC_PGDWRI_PRE_OFF;
}
extern "C" uint32_t isaac_pgd_wri_pre_hash_va(void) {
  return ISAAC_PGDWRI_PRE_HASH_VA;
}
extern "C" int32_t isaac_pgd_wri_save_counter_off(void) {
  return ISAAC_PGDWRI_SAVE_COUNTER_OFF;
}
extern "C" uint32_t isaac_pgd_wri_save_counter_inc_va(void) {
  return ISAAC_PGDWRI_SAVE_COUNTER_INC_VA;
}
extern "C" uint32_t isaac_pgd_wri_save_counter_hash_va(void) {
  return ISAAC_PGDWRI_SAVE_COUNTER_HASH_VA;
}
extern "C" uint32_t isaac_pgd_wri_final_write_va(void) {
  return ISAAC_PGDWRI_FINAL_WRITE_VA;
}
extern "C" int32_t isaac_pgd_wri_cs_site_count(void) {
  return ISAAC_PGDWRI_CS_SITES;
}
extern "C" int32_t isaac_pgd_wri_tree_next_sites(void) {
  return ISAAC_PGDWRI_TREE_NEXT_SITES;
}
extern "C" int32_t isaac_pgd_wri_vtbl_write_sites(void) {
  return ISAAC_PGDWRI_VTBL_WRITE_SITES;
}
extern "C" int32_t isaac_pgd_wri_memset_sites(void) {
  return ISAAC_PGDWRI_MEMSET_SITES;
}
extern "C" int32_t isaac_pgd_wri_stores(void) {
  return ISAAC_PGDWRI_STORES;
}
extern "C" uint32_t isaac_pgd_wri_cs_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDWRI_CS_SITES) return 0u;
  return kWriCsRows[index].va;
}
extern "C" int32_t isaac_pgd_wri_cs_site_role(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDWRI_CS_SITES) return -1;
  return kWriCsRows[index].role;
}
extern "C" int32_t isaac_pgd_wri_cs_site_len(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDWRI_CS_SITES) return 0;
  return kWriCsRows[index].len;
}

/* Loop bound = the record count dword (`cmp <idx>,count ; jb`
   UNSIGNED, literal constant in the machine). */
extern "C" int32_t isaac_pgd_wri_loop_iterations(int32_t record_id) {
  if (record_id == ISAAC_PGD_BESTIARY_SECTION_ID) return 0;
  switch (record_id) {
    case 1: return ISAAC_PGD_COUNT_ACHIEVEMENTS;
    case 2: return ISAAC_PGD_COUNT_EVENT_COUNTERS;
    case 3: return ISAAC_PGD_COUNT_SEC3;
    case 4: return ISAAC_PGD_COUNT_ITEM_COLLECTION;
    case 5: return ISAAC_PGD_COUNT_SEC5;
    case 6: return ISAAC_PGD_COUNT_BOSSES;
    case 7: return ISAAC_PGD_COUNT_CHALLENGES;
    case 8: return ISAAC_PGD_COUNT_SEC8;
    case 9: return ISAAC_PGD_COUNT_SEC9;
    case 10: return ISAAC_PGD_COUNT_SEC10;
    default: return -1;
  }
}

/* Element hash length = the record width (1 byte-flag rows, 4 u32
   rows). */
extern "C" int32_t isaac_pgd_wri_element_hash_len(int32_t record_id) {
  if (record_id == ISAAC_PGD_BESTIARY_SECTION_ID) return 0;
  switch (record_id) {
    case 1:
    case 4:
    case 5:
    case 6:
    case 7:
    case 10:
      return 1;
    case 2:
    case 3:
    case 8:
    case 9:
      return 4;
    default:
      return -1;
  }
}

/* `incl [this+0xf88]` @0x928e62 — plain u32 +1, then hashed (4). */
extern "C" uint32_t isaac_pgd_wri_save_counter_next(uint32_t counter) {
  return counter + 1u;
}

ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_update_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_update_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_update_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_update_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_table_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_table_flag_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_gen_first_shift_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_gen_sar_first_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_gen_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_gen_loop_back_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_mode0_fold_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_mode1_init_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_mode1_loop_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_mode1_loop_back_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_mode1_final_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_state_off_lane);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_state_off_partial);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_state_off_acc);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_state_off_mode);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_seh_handler_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_cookie_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_update_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_io_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_tell_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_seek_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_read_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_len_sub_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_seed_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_vtbl_tell_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_vtbl_seek_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_vtbl_read_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_checksum_region_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_state_mode_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_state_lane_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_state_partial_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_state_seed_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_pre_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_pre_hash_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_save_counter_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_save_counter_inc_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_save_counter_hash_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_final_write_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_cs_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_tree_next_sites);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_vtbl_write_sites);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_memset_sites);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_stores);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_cs_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_cs_site_role);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_cs_site_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_loop_iterations);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_element_hash_len);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_wri_save_counter_next);

/* ======================== ABI v31 - PGDVRF (verify-open 0x926f10) ======================== */

/* The save verifier's 4-magic first-match cascade: FOUR dword compares
   per magic = the full 16 header bytes (`sub edi,4 ; jae` loop runs
   for edi = 0xc, 8, 4, 0 @0x926f60..0x926f6f). The four magics share
   bytes 0..11 ("ISAACNGSAVE0") and differ ONLY at byte 12 (the kind
   digit '6'..'9') - dword 3 discriminates; a 12-byte compare would
   resolve every valid header to kind 6 and fail the too-old gate. */
static const uint32_t kVrfMagicDwords[4][4] = {
    /* "ISAACNGSAVE06R  " -> 0x41415349 0x53474e43 0x30455641 0x20205236 */
    {0x41415349u, 0x53474e43u, 0x30455641u, 0x20205236u},
    /* "ISAACNGSAVE07R  " */
    {0x41415349u, 0x53474e43u, 0x30455641u, 0x20205237u},
    /* "ISAACNGSAVE08R  " */
    {0x41415349u, 0x53474e43u, 0x30455641u, 0x20205238u},
    /* "ISAACNGSAVE09R  " */
    {0x41415349u, 0x53474e43u, 0x30455641u, 0x20205239u},
};

extern "C" uint32_t isaac_pgd_vrf_va(void) { return ISAAC_PGDVRF_VA; }
extern "C" uint32_t isaac_pgd_vrf_ret_va(void) { return ISAAC_PGDVRF_RET_VA; }
extern "C" int32_t isaac_pgd_vrf_body_bytes(void) {
  return ISAAC_PGDVRF_BODY_BYTES;
}
extern "C" uint32_t isaac_pgd_vrf_seh_handler_va(void) {
  return ISAAC_PGDVRF_SEH_HANDLER_VA;
}
extern "C" uint32_t isaac_pgd_vrf_cookie_va(void) {
  return ISAAC_PGDVRF_COOKIE_VA;
}
extern "C" int32_t isaac_pgd_vrf_inbound(void) {
  return ISAAC_PGDVRF_INBOUND;
}
extern "C" int32_t isaac_pgd_vrf_return_stack(void) {
  return ISAAC_PGDVRF_RETURN_STACK;
}
extern "C" uint32_t isaac_pgd_vrf_magic_va(int32_t variant) {
  switch (variant) {
    case 0: return ISAAC_PGDVRF_MAGIC_VA_06R;
    case 1: return ISAAC_PGDVRF_MAGIC_VA_07R;
    case 2: return ISAAC_PGDVRF_MAGIC_VA_08R;
    case 3: return ISAAC_PGDVRF_MAGIC_VA_09R;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_pgd_vrf_magic_dword(int32_t variant,
                                              int32_t dword_index) {
  if (variant < 0 || variant >= 4) return 0u;
  if (dword_index < 0 || dword_index >= ISAAC_PGDVRF_COMPARE_DWORDS) return 0u;
  return kVrfMagicDwords[variant][dword_index];
}
extern "C" uint32_t isaac_pgd_vrf_magic_byte(int32_t variant,
                                             int32_t index) {
  if (variant < 0 || variant >= 4) return 0u;
  if (index < 0 || index >= ISAAC_PGDVRF_MAGIC_BYTES) return 0u;
  const uint32_t d = kVrfMagicDwords[variant][index / 4];
  return (d >> (8 * (index % 4))) & 0xffu;
}
extern "C" int32_t isaac_pgd_vrf_magic_variant_dwords(uint32_t d0,
                                                      uint32_t d1,
                                                      uint32_t d2,
                                                      uint32_t d3) {
  const uint32_t want[4] = {d0, d1, d2, d3};
  for (int32_t v = 0; v < 4; ++v) {
    int32_t hit = 1;
    for (int32_t j = 0; j < ISAAC_PGDVRF_COMPARE_DWORDS; ++j) {
      if (want[j] != kVrfMagicDwords[v][j]) {
        hit = 0;
        break;
      }
    }
    if (hit) return v;
  }
  return -1;
}
extern "C" int32_t isaac_pgd_vrf_kind_from_header(uint32_t d0, uint32_t d1,
                                                  uint32_t d2, uint32_t d3) {
  const int32_t v = isaac_pgd_vrf_magic_variant_dwords(d0, d1, d2, d3);
  if (v < 0) return 0;
  return ISAAC_PGDVRF_KIND_MIN + v;
}
extern "C" int32_t isaac_pgd_vrf_kind_from_digit_byte(uint32_t digit_byte) {
  const uint32_t b = digit_byte & 0xffu; /* byte-gate: uint32 + & 0xff */
  if (b >= 0x36u && b <= 0x39u) return (int32_t)(b - 0x30u);
  return 0;
}
extern "C" int32_t isaac_pgd_vrf_bound_for_kind(int32_t kind) {
  switch (kind) {
    case 6: return ISAAC_PGDVRF_BOUND_KIND6;
    case 7: return ISAAC_PGDVRF_BOUND_KIND7;
    case 8: return ISAAC_PGDVRF_BOUND_KIND8;
    case 9: return ISAAC_PGDVRF_BOUND_KIND9;
    default: return 0;
  }
}
/* The trailing compare `cmp [ebp-0x70],edi` @0x927046: FULL u32
   equality - wide values (0x100/0x1ff) compare as-is, no truncation. */
extern "C" int32_t isaac_pgd_vrf_trailing_match(uint32_t trailing,
                                                uint32_t checksum) {
  return trailing == checksum ? 1 : 0;
}
/* The kind gate `cmp ebx,8 ; ja 0x927078` @0x92705f: UNSIGNED > 8. */
extern "C" int32_t isaac_pgd_vrf_kind_accepted(uint32_t kind) {
  return kind > 8u ? 1 : 0;
}

extern "C" int32_t isaac_pgd_vrf_compare_loop_va(void) {
  return ISAAC_PGDVRF_COMPARE_LOOP_VA;
}
extern "C" int32_t isaac_pgd_vrf_compare_dwords(void) {
  return ISAAC_PGDVRF_COMPARE_DWORDS;
}
extern "C" int32_t isaac_pgd_vrf_compare_bytes(void) {
  return ISAAC_PGDVRF_COMPARE_BYTES;
}
extern "C" int32_t isaac_pgd_vrf_kind_digit_off(void) {
  return ISAAC_PGDVRF_KIND_DIGIT_OFF;
}
extern "C" uint32_t isaac_pgd_vrf_cascade_head_va(int32_t variant) {
  switch (variant) {
    case 0: return ISAAC_PGDVRF_CASCADE_HEAD_06R_VA;
    case 1: return ISAAC_PGDVRF_CASCADE_HEAD_07R_VA;
    case 2: return ISAAC_PGDVRF_CASCADE_HEAD_08R_VA;
    case 3: return ISAAC_PGDVRF_CASCADE_HEAD_09R_VA;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_pgd_vrf_kind_store_va(int32_t variant) {
  switch (variant) {
    case 0: return ISAAC_PGDVRF_KIND_STORE_06R_VA;
    case 1: return ISAAC_PGDVRF_KIND_STORE_07R_VA;
    case 2: return ISAAC_PGDVRF_KIND_STORE_08R_VA;
    case 3: return ISAAC_PGDVRF_KIND_STORE_09R_VA;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_pgd_vrf_bound_store_va(int32_t variant) {
  switch (variant) {
    case 0: return ISAAC_PGDVRF_BOUND_STORE_06R_VA;
    case 1: return ISAAC_PGDVRF_BOUND_STORE_07R_VA;
    case 2: return ISAAC_PGDVRF_BOUND_STORE_08R_VA;
    case 3: return ISAAC_PGDVRF_BOUND_STORE_09R_VA;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_pgd_vrf_checksum_call_va(void) {
  return ISAAC_PGDVRF_CHECKSUM_CALL_VA;
}
extern "C" int32_t isaac_pgd_vrf_checksum_skip_front(void) {
  return ISAAC_PGDVRF_CHECKSUM_SKIP_FRONT;
}
extern "C" int32_t isaac_pgd_vrf_checksum_skip_back(void) {
  return ISAAC_PGDVRF_CHECKSUM_SKIP_BACK;
}
extern "C" uint32_t isaac_pgd_vrf_trailing_seek_va(void) {
  return ISAAC_PGDVRF_TRAILING_SEEK_VA;
}
extern "C" uint32_t isaac_pgd_vrf_trailing_read_va(void) {
  return ISAAC_PGDVRF_TRAILING_READ_VA;
}
extern "C" uint32_t isaac_pgd_vrf_trailing_cmp_va(void) {
  return ISAAC_PGDVRF_TRAILING_CMP_VA;
}
extern "C" uint32_t isaac_pgd_vrf_trailing_log_va(void) {
  return ISAAC_PGDVRF_TRAILING_LOG_VA;
}
extern "C" uint32_t isaac_pgd_vrf_header_log_va(void) {
  return ISAAC_PGDVRF_HEADER_LOG_VA;
}
extern "C" uint32_t isaac_pgd_vrf_old_version_log_va(void) {
  return ISAAC_PGDVRF_OLD_VERSION_LOG_VA;
}
extern "C" uint32_t isaac_pgd_vrf_kind_gate_cmp_va(void) {
  return ISAAC_PGDVRF_KIND_GATE_CMP_VA;
}
extern "C" uint32_t isaac_pgd_vrf_fail_ret_va(void) {
  return ISAAC_PGDVRF_FAIL_RET_VA;
}
extern "C" uint32_t isaac_pgd_vrf_success_ret_va(void) {
  return ISAAC_PGDVRF_SUCCESS_RET_VA;
}
extern "C" int32_t isaac_pgd_vrf_save_counter_off(void) {
  return ISAAC_PGDVRF_SAVE_COUNTER_OFF;
}
extern "C" uint32_t isaac_pgd_vrf_jump_table_va(void) {
  return ISAAC_PGDVRF_JUMP_TABLE_VA;
}
extern "C" int32_t isaac_pgd_vrf_jump_table_entries(void) {
  return ISAAC_PGDVRF_JUMP_TABLE_ENTRIES;
}

/* Byte-gated reads: bytes at index >= size yield 0 and never touch
   memory (the model law reads the same way over its buffer). */
static inline uint32_t vrf_u8(const uint8_t* file, uint32_t size,
                              uint32_t index) {
  return index < size ? (uint32_t)file[index] : 0u;
}
static inline uint32_t vrf_u32(const uint8_t* file, uint32_t size,
                               uint32_t index) {
  return vrf_u8(file, size, index) |
         (vrf_u8(file, size, index + 1) << 8) |
         (vrf_u8(file, size, index + 2) << 16) |
         (vrf_u8(file, size, index + 3) << 24);
}

/* The verify-open composite in the machine's order: kind FIRST (16
   header bytes), THEN the region fold [0x10, size-4) (mode-1 CRC from
   the 0x683580 core), THEN the trailing-dword compare (FULL u32). All
   file reads are byte-gated to `size` (reads past the file yield 0,
   never touch memory); `file` must be non-null (else all out-params
   are zeroed and 0 is returned). */
extern "C" uint32_t isaac_pgd_vrf_verify_open(const uint8_t* file,
                                              uint32_t size,
                                              int32_t* out_kind,
                                              int32_t* out_bound,
                                              int32_t* out_ok,
                                              int32_t* out_accepted,
                                              int32_t* out_result) {
  if (out_kind) *out_kind = 0;
  if (out_bound) *out_bound = 0;
  if (out_ok) *out_ok = 0;
  if (out_accepted) *out_accepted = 0;
  if (out_result) *out_result = 0;
  if (!file) return 0u;

  const uint32_t d0 = vrf_u32(file, size, 0);
  const uint32_t d1 = vrf_u32(file, size, 4);
  const uint32_t d2 = vrf_u32(file, size, 8);
  const uint32_t d3 = vrf_u32(file, size, 12);
  const int32_t kind = isaac_pgd_vrf_kind_from_header(d0, d1, d2, d3);

  /* region [0x10, size-4): the two-u32-wrap law (skip 0x10/4). The
     fold covers the clamped available bytes (stream-read failures for
     undersized files are host-side; the law folds what exists). */
  const uint32_t region_len =
      isaac_pgd_checksum_region_len(size, ISAAC_PGDVRF_CHECKSUM_SKIP_FRONT,
                                    ISAAC_PGDVRF_CHECKSUM_SKIP_BACK);
  IsaacPgdChecksumState state;
  isaac_pgd_checksum_init(&state, ISAAC_PGD_CHECKSUM_MODE_CRC);
  uint32_t stop = 0x10u + region_len;
  if (stop > size) stop = size;
  for (uint32_t i = 0x10u; i < stop; ++i) {
    isaac_pgd_checksum_update(&state, file + i, 1);
  }
  const uint32_t checksum = isaac_pgd_checksum_finalize(&state);

  const uint32_t trailing = vrf_u32(file, size, size >= 4u ? size - 4u : 0u);
  const int32_t ok = isaac_pgd_vrf_trailing_match(trailing, checksum);
  const int32_t accepted =
      isaac_pgd_vrf_kind_accepted(kind >= 0 ? (uint32_t)kind : 0u);
  const int32_t matched = kind >= ISAAC_PGDVRF_KIND_MIN &&
                          kind <= ISAAC_PGDVRF_KIND_MAX ? 1 : 0;
  const int32_t result = matched && ok == 1 && accepted == 1 ? 1 : 0;

  if (out_kind) *out_kind = kind;
  if (out_bound) *out_bound = isaac_pgd_vrf_bound_for_kind(kind);
  if (out_ok) *out_ok = ok;
  if (out_accepted) *out_accepted = accepted;
  if (out_result) *out_result = result;
  return (uint32_t)kind;
}

ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_seh_handler_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_cookie_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_magic_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_magic_dword);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_magic_byte);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_magic_variant_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_kind_from_header);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_kind_from_digit_byte);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_bound_for_kind);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_trailing_match);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_kind_accepted);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_verify_open);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_compare_loop_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_compare_dwords);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_compare_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_kind_digit_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_cascade_head_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_kind_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_bound_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_checksum_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_checksum_skip_front);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_checksum_skip_back);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_trailing_seek_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_trailing_read_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_trailing_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_trailing_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_header_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_old_version_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_kind_gate_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_fail_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_success_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_save_counter_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_jump_table_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_vrf_jump_table_entries);

/* ======================== ABI v32 - PGDSAN/PGDGATE/PGDCNT (post-load helpers) ======================== */

/* 0x927d20 post-verify sanitizer (PURE, no calls), 0x929820 unlock
   gates and 0x92a350 count thresholds — the post-LoadPersistentGameData
   chain after verify_open. Decode evidence in
   section-notes/pgd-v32-postload/. Byte gates take uint32_t and
   re-narrow with & 0xff in the body (no uint8_t scalar params). */

static const uint32_t kSanVersionGateMins[11] = {
    1, 2, 3, 4, 5, 6, 7, 8, 9, 0xa, 0xb};
static const uint32_t kSanVersionFields[11] = {
    0xeb0, 0xeb4, 0xeb8, 0xebc, 0xec0, 0xec4, 0xec8, 0xecc, 0xed0,
    0xed4, 0xed8};
static const uint32_t kSanCounterSources[9] = {
    0x2f0, 0x2e8, 0x320, 0x31c, 0x324, 0x534, 0x5a8, 0xa68, 0xa6c};
static const uint32_t kSanCounterFields[9] = {
    0xedc, 0xee0, 0xee8, 0xee4, 0xeec, 0xef0, 0xef8, 0xf00, 0xf04};
static const uint32_t kSanGatedFields[21] = {
    0xeac, 0xeb0, 0xeb4, 0xeb8, 0xebc, 0xec0, 0xec4, 0xec8, 0xecc,
    0xed0, 0xed4, 0xed8, 0xedc, 0xee0, 0xee8, 0xee4, 0xeec, 0xef0,
    0xef8, 0xf00, 0xf04};
static const uint32_t kSanVersionGateVas[11] = {
    0x00927d94u, 0x00927dd5u, 0x00927e16u, 0x00927e57u, 0x00927e98u,
    0x00927ed9u, 0x00927f1au, 0x00927f5bu, 0x00927f9cu, 0x00927fddu,
    0x0092801au};
static const uint32_t kSanCounterGateVas[9] = {
    0x00928057u, 0x00928098u, 0x009280d9u, 0x0092811au, 0x0092815bu,
    0x0092819cu, 0x009281ddu, 0x0092821eu, 0x0092825fu};
static const uint32_t kSanClampRowVas[21] = {
    0x00927d34u, 0x00927d9du, 0x00927ddeu, 0x00927e1fu, 0x00927e60u,
    0x00927ea1u, 0x00927ee2u, 0x00927f23u, 0x00927f64u, 0x00927fa5u,
    0x00927fe2u, 0x0092801fu, 0x00928060u, 0x009280a1u, 0x009280e2u,
    0x00928123u, 0x00928164u, 0x009281a5u, 0x009281e6u, 0x00928227u,
    0x00928268u};
static const uint32_t kGateRowGateVas[11] = {
    0x00929843u, 0x00929870u, 0x0092988eu, 0x009298fdu, 0x0092993bu,
    0x00929950u, 0x00929965u, 0x00929977u, 0x00929989u, 0x0092999bu,
    0x009299adu};
static const uint32_t kGateRowIds[11] = {
    0x17d, 0x16b, 0x154, 0x155, 0x15c, 0x165, 0x15f, 0x16d, 0x170,
    0x176, 0x168};
static const uint32_t kGateRowCallVas[11] = {
    0x0092986bu, 0x00929889u, 0x009298f8u, 0x00929936u, 0x0092994bu,
    0x00929960u, 0x00929972u, 0x00929984u, 0x00929996u, 0x009299a8u,
    0x009299bdu};
static const int32_t kGateRowKinds[11] = {
    ISAAC_PGDGATE_KIND_AND4, ISAAC_PGDGATE_KIND_AND3,
    ISAAC_PGDGATE_KIND_BYTEINV_ANY10, ISAAC_PGDGATE_KIND_BYTEINV_RUNS,
    ISAAC_PGDGATE_KIND_U32GT, ISAAC_PGDGATE_KIND_U32GT,
    ISAAC_PGDGATE_KIND_BYTESET, ISAAC_PGDGATE_KIND_BYTESET,
    ISAAC_PGDGATE_KIND_BYTESET, ISAAC_PGDGATE_KIND_BYTESET,
    ISAAC_PGDGATE_KIND_BYTESET};
static const uint32_t kGateCounterFields[10] = {
    0x35c, 0x404, 0x43c, 0x474, 0x394, 0x3cc, 0x530, 0x4c0, 0x4f8,
    0x5a4};
static const uint32_t kCntSpecialIds[6] = {0x114, 0x14d, 0x14e, 0x14f,
                                           0x11b, 0x14b};
static const uint32_t kCntBadgeIds[9] = {0x52, 0x54, 0x81, 0x82, 0x83,
                                         0x84, 0x85, 0x9c, 0xaf};
static const uint32_t kCntUnlockIds[5] = {0x45, 0x54, 0xeb, 0x153,
                                          0x27d};

extern "C" uint32_t isaac_pgd_san_va(void) { return ISAAC_PGDSAN_VA; }
extern "C" uint32_t isaac_pgd_san_ret_va(void) { return ISAAC_PGDSAN_RET_VA; }
extern "C" int32_t isaac_pgd_san_body_bytes(void) {
  return ISAAC_PGDSAN_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_san_inbound(void) {
  return ISAAC_PGDSAN_INBOUND;
}
extern "C" int32_t isaac_pgd_san_return_stack(void) {
  return ISAAC_PGDSAN_RETURN_STACK;
}
extern "C" int32_t isaac_pgd_san_version_off(void) {
  return ISAAC_PGDSAN_VERSION_OFF;
}
extern "C" int32_t isaac_pgd_san_flag_off(void) {
  return ISAAC_PGDSAN_FLAG_OFF;
}
extern "C" int32_t isaac_pgd_san_common_off(void) {
  return ISAAC_PGDSAN_COMMON_OFF;
}
extern "C" int32_t isaac_pgd_san_flag_field(void) {
  return ISAAC_PGDSAN_FLAG_FIELD;
}
extern "C" int32_t isaac_pgd_san_version_gate_mins(void) {
  return ISAAC_PGDSAN_FIELD_COUNT - 10; /* 11 */
}
extern "C" int32_t isaac_pgd_san_version_gate_min(int32_t index) {
  if (index < 0 || index >= 11) return 0;
  return (int32_t)kSanVersionGateMins[index];
}
extern "C" int32_t isaac_pgd_san_version_fields(void) { return 11; }
extern "C" int32_t isaac_pgd_san_version_field(int32_t index) {
  if (index < 0 || index >= 11) return 0;
  return (int32_t)kSanVersionFields[index];
}
extern "C" int32_t isaac_pgd_san_counter_sources(void) { return 9; }
extern "C" int32_t isaac_pgd_san_counter_source(int32_t index) {
  if (index < 0 || index >= 9) return 0;
  return (int32_t)kSanCounterSources[index];
}
extern "C" int32_t isaac_pgd_san_counter_fields(void) { return 9; }
extern "C" int32_t isaac_pgd_san_counter_field(int32_t index) {
  if (index < 0 || index >= 9) return 0;
  return (int32_t)kSanCounterFields[index];
}
extern "C" int32_t isaac_pgd_san_gated_fields(void) { return 21; }
extern "C" int32_t isaac_pgd_san_gated_field(int32_t index) {
  if (index < 0 || index >= 21) return 0;
  return (int32_t)kSanGatedFields[index];
}
extern "C" int32_t isaac_pgd_san_field_count(void) {
  return ISAAC_PGDSAN_FIELD_COUNT;
}
extern "C" uint32_t isaac_pgd_san_flag_gate_cmp_va(void) {
  return ISAAC_PGDSAN_FLAG_GATE_CMP_VA;
}
extern "C" uint32_t isaac_pgd_san_version_gate_va(int32_t index) {
  if (index < 0 || index >= 11) return 0u;
  return kSanVersionGateVas[index];
}
extern "C" uint32_t isaac_pgd_san_counter_gate_va(int32_t index) {
  if (index < 0 || index >= 9) return 0u;
  return kSanCounterGateVas[index];
}
extern "C" uint32_t isaac_pgd_san_clamp_row_va(int32_t index) {
  if (index < 0 || index >= 21) return 0u;
  return kSanClampRowVas[index];
}

/* The cmovg min-1 clamp: SIGNED `value > 1` (a u32 >= 0x80000000
   reads negative and clamps to 1). */
extern "C" uint32_t isaac_pgd_san_clamp_min1(uint32_t value) {
  return (int32_t)value > 1 ? value : 1u;
}
/* Version chain gate `cmp esi,min ; jl skip` — SIGNED. */
extern "C" int32_t isaac_pgd_san_version_gate(int32_t version,
                                              int32_t min) {
  return version >= min ? 1 : 0;
}
/* Counter chain gate `cmp [edi+G],0x1 ; jl skip` — SIGNED. */
extern "C" int32_t isaac_pgd_san_counter_gate(uint32_t counter) {
  return (int32_t)counter >= 1 ? 1 : 0;
}
/* Entry byte gate `cmp byte [edi+0x3c],0` — & 0xff in the body. */
extern "C" int32_t isaac_pgd_san_flag_gate(uint32_t flag) {
  return (flag & 0xffu) != 0u ? 1 : 0;
}
/* Sanitizer composite: counter_sources[9], field_values[21] (gated
   fields in the kSanGatedFields order), common_value = the shared
   0xea8 counter. out_fields[21] + out_common + out_fired[21]; the
   common clamp fires iff at least one block gate held. */
extern "C" void isaac_pgd_sanitize_post_load(
    uint32_t version, uint32_t flag_byte,
    const uint32_t* counter_sources, const uint32_t* field_values,
    uint32_t common_value, uint32_t* out_fields, uint32_t* out_common,
    int32_t* out_fired) {
  uint32_t fields[21];
  int32_t fired[21];
  for (int i = 0; i < 21; ++i) {
    fields[i] = field_values ? field_values[i] : 0u;
    fired[i] = 0;
  }
  int any = 0;
  const int32_t flag = isaac_pgd_san_flag_gate(flag_byte);
  fired[0] = flag;
  if (flag) {
    fields[0] = isaac_pgd_san_clamp_min1(fields[0]);
    any = 1;
  }
  for (int k = 0; k < 11; ++k) {
    const int32_t g = isaac_pgd_san_version_gate((int32_t)version,
                                                 (int32_t)kSanVersionGateMins[k]);
    fired[1 + k] = g;
    if (g) {
      fields[1 + k] = isaac_pgd_san_clamp_min1(fields[1 + k]);
      any = 1;
    }
  }
  for (int k = 0; k < 9; ++k) {
    const uint32_t src = counter_sources ? counter_sources[k] : 0u;
    const int32_t g = isaac_pgd_san_counter_gate(src);
    fired[12 + k] = g;
    if (g) {
      fields[12 + k] = isaac_pgd_san_clamp_min1(fields[12 + k]);
      any = 1;
    }
  }
  if (out_fields) {
    for (int i = 0; i < 21; ++i) out_fields[i] = fields[i];
  }
  if (out_common) {
    *out_common = any ? isaac_pgd_san_clamp_min1(common_value) : common_value;
  }
  if (out_fired) {
    for (int i = 0; i < 21; ++i) out_fired[i] = fired[i];
  }
}

extern "C" uint32_t isaac_pgd_gate_va(void) { return ISAAC_PGDGATE_VA; }
extern "C" uint32_t isaac_pgd_gate_ret_va(void) { return ISAAC_PGDGATE_RET_VA; }
extern "C" int32_t isaac_pgd_gate_body_bytes(void) {
  return ISAAC_PGDGATE_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_gate_inbound(void) {
  return ISAAC_PGDGATE_INBOUND;
}
extern "C" int32_t isaac_pgd_gate_return_stack(void) {
  return ISAAC_PGDGATE_RETURN_STACK;
}
extern "C" uint32_t isaac_pgd_gate_guard_global_va(void) {
  return ISAAC_PGDGATE_GUARD_GLOBAL_VA;
}
extern "C" int32_t isaac_pgd_gate_guard_off(void) {
  return ISAAC_PGDGATE_GUARD_OFF;
}
extern "C" uint32_t isaac_pgd_gate_event_counter_call_va(void) {
  return ISAAC_PGDGATE_EVENT_COUNTER_CALL_VA;
}
extern "C" uint32_t isaac_pgd_gate_event_counter_target_va(void) {
  return ISAAC_PGDGATE_EVENT_COUNTER_TARGET_VA;
}
extern "C" uint32_t isaac_pgd_gate_try_unlock_va(void) {
  return ISAAC_PGDGATE_TRY_UNLOCK_VA;
}
extern "C" uint32_t isaac_pgd_gate_div_magic(void) {
  return ISAAC_PGDGATE_DIV_MAGIC;
}
extern "C" int32_t isaac_pgd_gate_div_shift(void) {
  return ISAAC_PGDGATE_DIV_SHIFT;
}
extern "C" int32_t isaac_pgd_gate_runs_divisor(void) {
  return ISAAC_PGDGATE_RUNS_DIVISOR;
}
extern "C" int32_t isaac_pgd_gate_runs_threshold(void) {
  return ISAAC_PGDGATE_RUNS_THRESHOLD;
}
extern "C" int32_t isaac_pgd_gate_counter_fields(void) { return 10; }
extern "C" int32_t isaac_pgd_gate_counter_field(int32_t index) {
  if (index < 0 || index >= 10) return 0;
  return (int32_t)kGateCounterFields[index];
}
extern "C" int32_t isaac_pgd_gate_runs_field(void) {
  return ISAAC_PGDGATE_RUNS_FIELD;
}
extern "C" int32_t isaac_pgd_gate_row_count(void) {
  return ISAAC_PGDGATE_ROW_COUNT;
}
extern "C" uint32_t isaac_pgd_gate_row_gate_va(int32_t index) {
  if (index < 0 || index >= 11) return 0u;
  return kGateRowGateVas[index];
}
extern "C" uint32_t isaac_pgd_gate_row_id(int32_t index) {
  if (index < 0 || index >= 11) return 0u;
  return kGateRowIds[index];
}
extern "C" uint32_t isaac_pgd_gate_row_call_va(int32_t index) {
  if (index < 0 || index >= 11) return 0u;
  return kGateRowCallVas[index];
}
extern "C" int32_t isaac_pgd_gate_row_kind(int32_t index) {
  if (index < 0 || index >= 11) return 0;
  return kGateRowKinds[index];
}
extern "C" int32_t isaac_pgd_gate_field_count(void) {
  return ISAAC_PGDGATE_FIELD_COUNT;
}

/* Byte-set gate `cmp byte [..],0` — & 0xff in the body. */
extern "C" int32_t isaac_pgd_gate_byte_set(uint32_t value) {
  return (value & 0xffu) != 0u ? 1 : 0;
}
extern "C" int32_t isaac_pgd_gate_byte_clear(uint32_t value) {
  return (value & 0xffu) == 0u ? 1 : 0;
}
extern "C" int32_t isaac_pgd_gate_u32_gt(uint32_t value) {
  return value > 0u ? 1 : 0;
}
extern "C" int32_t isaac_pgd_gate_any_counter(const uint32_t* values,
                                              int32_t count) {
  for (int32_t i = 0; i < count; ++i) {
    if (values && values[i] > 0u) return 1;
  }
  return 0;
}
/* [0x488] % 1000 via the PE's `mul 0x10624dd3 ; shr edx,6 ;
   imul edx,1000 ; sub` (u32; uint64 keeps 2^38 precision). */
extern "C" uint32_t isaac_pgd_gate_runs_remainder(uint32_t value) {
  const uint64_t v = value;
  const uint64_t q =
      (v * (uint64_t)ISAAC_PGDGATE_DIV_MAGIC) >> ISAAC_PGDGATE_DIV_SHIFT;
  return (uint32_t)(v - q * (uint64_t)ISAAC_PGDGATE_RUNS_DIVISOR);
}
extern "C" int32_t isaac_pgd_gate_runs1000(uint32_t value,
                                           uint32_t flag131) {
  return isaac_pgd_gate_runs_remainder(value) >=
                 (uint32_t)ISAAC_PGDGATE_RUNS_THRESHOLD ||
             isaac_pgd_gate_byte_set(flag131)
         ? 1
         : 0;
}
extern "C" int32_t isaac_pgd_gate_row_a(uint32_t byte1, uint32_t b5c,
                                        uint32_t b27, uint32_t c4c) {
  return isaac_pgd_gate_byte_clear(byte1) &&
                 isaac_pgd_gate_byte_set(b5c) &&
                 isaac_pgd_gate_byte_set(b27) &&
                 isaac_pgd_gate_byte_set(c4c)
             ? 1
             : 0;
}
extern "C" int32_t isaac_pgd_gate_row_b(uint32_t byte1, uint32_t c39,
                                        uint32_t bd0) {
  return isaac_pgd_gate_byte_clear(byte1) &&
                 isaac_pgd_gate_byte_set(c39) &&
                 isaac_pgd_gate_byte_set(bd0)
             ? 1
             : 0;
}
extern "C" int32_t isaac_pgd_gate_row_c(uint32_t b18c,
                                        const uint32_t* counters,
                                        int32_t count) {
  return isaac_pgd_gate_byte_clear(b18c) &&
                 isaac_pgd_gate_any_counter(counters, count)
             ? 1
             : 0;
}
extern "C" int32_t isaac_pgd_gate_row_d(uint32_t b18d, uint32_t runs,
                                        uint32_t b131) {
  return isaac_pgd_gate_byte_clear(b18d) &&
                 isaac_pgd_gate_runs1000(runs, b131)
             ? 1
             : 0;
}
extern "C" int32_t isaac_pgd_gate_row_e(uint32_t c320) {
  return isaac_pgd_gate_u32_gt(c320);
}
extern "C" int32_t isaac_pgd_gate_row_f(uint32_t c5a8) {
  return isaac_pgd_gate_u32_gt(c5a8);
}
/* The 11-row composite over the flat 27-slot ISAAC_PGDGATE_FIELD_*
   layout: returns the number of passed ids (machine A..K order) and
   writes them to out_ids (>= 11 entries). */
extern "C" int32_t isaac_pgd_post_load_gates(const uint32_t* fields,
                                             uint32_t* out_ids) {
  const uint32_t zero = 0u;
  const uint32_t* f = fields ? fields : &zero;
  int n = 0;
  if (isaac_pgd_gate_row_a(f[ISAAC_PGDGATE_FIELD_BYTE1],
                           f[ISAAC_PGDGATE_FIELD_B5C],
                           f[ISAAC_PGDGATE_FIELD_B27],
                           f[ISAAC_PGDGATE_FIELD_C4C])) {
    if (out_ids) out_ids[n] = kGateRowIds[0];
    ++n;
  }
  if (isaac_pgd_gate_row_b(f[ISAAC_PGDGATE_FIELD_BYTE1],
                           f[ISAAC_PGDGATE_FIELD_C39],
                           f[ISAAC_PGDGATE_FIELD_BD0])) {
    if (out_ids) out_ids[n] = kGateRowIds[1];
    ++n;
  }
  if (isaac_pgd_gate_row_c(f[ISAAC_PGDGATE_FIELD_B18C],
                           fields ? fields + ISAAC_PGDGATE_FIELD_C0 : 0,
                           10)) {
    if (out_ids) out_ids[n] = kGateRowIds[2];
    ++n;
  }
  if (isaac_pgd_gate_row_d(f[ISAAC_PGDGATE_FIELD_B18D],
                           f[ISAAC_PGDGATE_FIELD_RUNS],
                           f[ISAAC_PGDGATE_FIELD_B131])) {
    if (out_ids) out_ids[n] = kGateRowIds[3];
    ++n;
  }
  if (isaac_pgd_gate_u32_gt(f[ISAAC_PGDGATE_FIELD_C320])) {
    if (out_ids) out_ids[n] = kGateRowIds[4];
    ++n;
  }
  if (isaac_pgd_gate_u32_gt(f[ISAAC_PGDGATE_FIELD_C5A8])) {
    if (out_ids) out_ids[n] = kGateRowIds[5];
    ++n;
  }
  const int32_t tail[5] = {ISAAC_PGDGATE_FIELD_B5D, ISAAC_PGDGATE_FIELD_B5E,
                           ISAAC_PGDGATE_FIELD_B5F, ISAAC_PGDGATE_FIELD_B60,
                           ISAAC_PGDGATE_FIELD_B189};
  for (int i = 0; i < 5; ++i) {
    if (isaac_pgd_gate_byte_set(f[tail[i]])) {
      if (out_ids) out_ids[n] = kGateRowIds[6 + i];
      ++n;
    }
  }
  return n;
}

extern "C" uint32_t isaac_pgd_cnt_va(void) { return ISAAC_PGDCNT_VA; }
extern "C" uint32_t isaac_pgd_cnt_ret_va(void) { return ISAAC_PGDCNT_RET_VA; }
extern "C" int32_t isaac_pgd_cnt_body_bytes(void) {
  return ISAAC_PGDCNT_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_cnt_inbound(void) {
  return ISAAC_PGDCNT_INBOUND;
}
extern "C" int32_t isaac_pgd_cnt_return_stack(void) {
  return ISAAC_PGDCNT_RETURN_STACK;
}
extern "C" int32_t isaac_pgd_cnt_item_flag_off(void) {
  return ISAAC_PGDCNT_ITEM_FLAG_OFF;
}
extern "C" int32_t isaac_pgd_cnt_ach_off(void) {
  return ISAAC_PGDCNT_ACH_OFF;
}
extern "C" int32_t isaac_pgd_cnt_item_loop_hi(void) {
  return ISAAC_PGDCNT_ITEM_LOOP_HI;
}
extern "C" int32_t isaac_pgd_cnt_ach_cap(void) {
  return ISAAC_PGDCNT_ACH_CAP;
}
extern "C" int32_t isaac_pgd_cnt_special_ids(void) { return 6; }
extern "C" uint32_t isaac_pgd_cnt_special_id(int32_t index) {
  if (index < 0 || index >= 6) return 0u;
  return kCntSpecialIds[index];
}
extern "C" int32_t isaac_pgd_cnt_badge_ids(void) { return 9; }
extern "C" uint32_t isaac_pgd_cnt_badge_id(int32_t index) {
  if (index < 0 || index >= 9) return 0u;
  return kCntBadgeIds[index];
}
extern "C" int32_t isaac_pgd_cnt_badge_lo(void) {
  return ISAAC_PGDCNT_BADGE_LO;
}
extern "C" int32_t isaac_pgd_cnt_badge_hi(void) {
  return ISAAC_PGDCNT_BADGE_HI;
}
extern "C" int32_t isaac_pgd_cnt_ach_count_lo(void) {
  return ISAAC_PGDCNT_ACH_COUNT_LO;
}
extern "C" int32_t isaac_pgd_cnt_ach_count_hi(void) {
  return ISAAC_PGDCNT_ACH_COUNT_HI;
}
extern "C" int32_t isaac_pgd_cnt_t1(void) { return ISAAC_PGDCNT_T1; }
extern "C" int32_t isaac_pgd_cnt_t1b(void) { return ISAAC_PGDCNT_T1B; }
extern "C" int32_t isaac_pgd_cnt_t1c(void) { return ISAAC_PGDCNT_T1C; }
extern "C" int32_t isaac_pgd_cnt_t2(void) { return ISAAC_PGDCNT_T2; }
extern "C" int32_t isaac_pgd_cnt_t3(void) { return ISAAC_PGDCNT_T3; }
extern "C" int32_t isaac_pgd_cnt_t4(void) { return ISAAC_PGDCNT_T4; }
extern "C" int32_t isaac_pgd_cnt_t5(void) { return ISAAC_PGDCNT_T5; }
extern "C" int32_t isaac_pgd_cnt_t6(void) { return ISAAC_PGDCNT_T6; }
extern "C" int32_t isaac_pgd_cnt_unlock_ids(void) { return 5; }
extern "C" uint32_t isaac_pgd_cnt_unlock_id(int32_t index) {
  if (index < 0 || index >= 5) return 0u;
  return kCntUnlockIds[index];
}
extern "C" uint32_t isaac_pgd_cnt_map_global_va(void) {
  return ISAAC_PGDCNT_MAP_GLOBAL_VA;
}
extern "C" int32_t isaac_pgd_cnt_map_off(void) {
  return ISAAC_PGDCNT_MAP_OFF;
}
extern "C" uint32_t isaac_pgd_cnt_map_find_va(void) {
  return ISAAC_PGDCNT_MAP_FIND_VA;
}
extern "C" int32_t isaac_pgd_cnt_b3_off(void) {
  return ISAAC_PGDCNT_B3_OFF;
}

extern "C" uint32_t isaac_pgd_cnt_item_flag(const uint8_t* flags,
                                            uint32_t count, uint32_t id) {
  const int32_t i = (int32_t)id;
  if (i < 1 || i > (int32_t)ISAAC_PGDCNT_ITEM_LOOP_HI) return 0u;
  if (!flags || (uint32_t)i >= count) return 0u;
  return (uint32_t)flags[i] & 0xffu;
}
extern "C" int32_t isaac_pgd_cnt_special(uint32_t id) {
  for (int32_t i = 0; i < 6; ++i) {
    if (id == kCntSpecialIds[i]) return 1;
  }
  return 0;
}
extern "C" int32_t isaac_pgd_cnt_badge(uint32_t id) {
  for (int32_t i = 0; i < 9; ++i) {
    if (id == kCntBadgeIds[i]) return 1;
  }
  return 0;
}
/* #nonzero bytes over ids lo..hi inclusive (the SIGNED jl/jle loop
   bounds; bytes read & 0xff). */
extern "C" int32_t isaac_pgd_cnt_count_nonzero(const uint8_t* bytes,
                                               uint32_t count, int32_t lo,
                                               int32_t hi) {
  int32_t n = 0;
  for (int32_t id = lo; id <= hi; ++id) {
    if (bytes && id >= 0 && (uint32_t)id < count &&
        (bytes[id] & 0xff) != 0) {
      ++n;
    }
  }
  return n;
}
/* #badge ids with byte == 0 (the c2 law — the eq cascade is only
   reached when the owned byte is 0). */
extern "C" int32_t isaac_pgd_cnt_count_badges(const uint8_t* bytes,
                                              uint32_t count, int32_t lo,
                                              int32_t hi) {
  int32_t n = 0;
  for (int32_t id = lo; id <= hi; ++id) {
    const uint32_t v =
        bytes && id >= 0 && (uint32_t)id < count ? (bytes[id] & 0xff) : 0u;
    if (v == 0u && isaac_pgd_cnt_badge((uint32_t)id)) ++n;
  }
  return n;
}
/* Threshold fire `cmp count,min ; jl skip` — SIGNED. */
extern "C" int32_t isaac_pgd_cnt_fire(int32_t count, int32_t min) {
  return count >= min ? 1 : 0;
}
/* Count/threshold composite (item_flags/ach are 1-based byte arrays;
   countable[] is the HOST item-map hit-AND-b3 predicate, 1-based
   0/1). Returns the number of unlock ids written; c1/c2 are only
   computed when T1 fires, c3 only when T2 fires (0 otherwise). */
extern "C" int32_t isaac_pgd_post_load_counts(
    const uint8_t* item_flags, uint32_t item_count, const uint8_t* ach,
    uint32_t ach_count, const uint32_t* countable, uint32_t countable_count,
    uint32_t* out_total, uint32_t* out_ach, uint32_t* out_special,
    uint32_t* out_c1, uint32_t* out_c2, uint32_t* out_c3,
    uint32_t* out_ids, int32_t* out_id_count) {
  uint32_t total = 0u;
  uint32_t achC = 0u;
  uint32_t special = 0u;
  for (uint32_t id = 1u; id <= (uint32_t)ISAAC_PGDCNT_ITEM_LOOP_HI; ++id) {
    uint32_t counted = 0u;
    if (isaac_pgd_cnt_item_flag(item_flags, item_count, id) != 0u) {
      counted = 1u;
    } else if (isaac_pgd_cnt_special(id)) {
      ++special;
    } else if (countable && id < countable_count && countable[id] != 0u) {
      counted = 1u;
    }
    if (counted) {
      ++total;
      if (id <= (uint32_t)ISAAC_PGDCNT_ACH_CAP) ++achC;
    }
  }
  uint32_t c1 = 0u;
  uint32_t c2 = 0u;
  int32_t n = 0;
  if (isaac_pgd_cnt_fire((int32_t)(special + achC), ISAAC_PGDCNT_T1)) {
    c1 = (uint32_t)isaac_pgd_cnt_count_nonzero(
        ach, ach_count, ISAAC_PGDCNT_BADGE_LO, ISAAC_PGDCNT_BADGE_HI);
    c2 = (uint32_t)isaac_pgd_cnt_count_badges(
        ach, ach_count, ISAAC_PGDCNT_BADGE_LO, ISAAC_PGDCNT_BADGE_HI);
    if (isaac_pgd_cnt_fire((int32_t)(c1 + c2), ISAAC_PGDCNT_T1B)) {
      if (out_ids) out_ids[n] = kCntUnlockIds[0];
      ++n;
    }
    if (isaac_pgd_cnt_fire((int32_t)c1, ISAAC_PGDCNT_T1C) && special == 0u) {
      if (out_ids) out_ids[n] = kCntUnlockIds[1];
      ++n;
    }
  }
  uint32_t c3 = 0u;
  if (isaac_pgd_cnt_fire((int32_t)total, ISAAC_PGDCNT_T2)) {
    c3 = (uint32_t)isaac_pgd_cnt_count_nonzero(
        ach, ach_count, ISAAC_PGDCNT_ACH_COUNT_LO, ISAAC_PGDCNT_ACH_COUNT_HI);
    if (isaac_pgd_cnt_fire((int32_t)c3, ISAAC_PGDCNT_T3)) {
      if (out_ids) out_ids[n] = kCntUnlockIds[2];
      ++n;
    }
    if (isaac_pgd_cnt_fire((int32_t)c3, ISAAC_PGDCNT_T4)) {
      if (out_ids) out_ids[n] = kCntUnlockIds[3];
      ++n;
    }
    if (isaac_pgd_cnt_fire((int32_t)total, ISAAC_PGDCNT_T5) &&
        isaac_pgd_cnt_fire((int32_t)c3, ISAAC_PGDCNT_T6)) {
      if (out_ids) out_ids[n] = kCntUnlockIds[4];
      ++n;
    }
  }
  if (out_total) *out_total = total;
  if (out_ach) *out_ach = achC;
  if (out_special) *out_special = special;
  if (out_c1) *out_c1 = c1;
  if (out_c2) *out_c2 = c2;
  if (out_c3) *out_c3 = c3;
  if (out_id_count) *out_id_count = n;
  return n;
}

/* ==================================================================
   ABI v33 — PGDRO / PGDUNL / PGDADDIT: the TryUnlock-adjacent
   decision islands 0x9299e0 / 0x929aa0 / 0x92a2d0
   (section-notes/pgd-v33-islands/). Byte gates re-narrow & 0xff in
   the body only; no uint8_t scalar params. Host: 0xa112c0 log,
   0x929a20 TryUnlock, 0x92a350 count machine, the game globals.
   ================================================================== */

static const uint32_t kRoCallSites[4] = {
    0x007fc735u, 0x007fc78cu, 0x007fc7e3u, 0x0095a780u,
};
static const uint32_t kUnlCallSites[32] = {
    0x004226d2u, 0x004227b0u, 0x00422dc5u, 0x005b590eu, 0x005b5939u,
    0x005b5964u, 0x005b5b13u, 0x005b84f4u, 0x005bb934u, 0x005be4d5u,
    0x0065f66fu, 0x006607e4u, 0x00660855u, 0x0066fe2cu, 0x00730669u,
    0x00730b0bu, 0x00730b73u, 0x00736370u, 0x00775d5cu, 0x00775d86u,
    0x00795390u, 0x007b3184u, 0x007b36b3u, 0x007c2fa1u, 0x007ec477u,
    0x007ec75bu, 0x008e21deu, 0x00946d1eu, 0x0095a9a3u, 0x009b9a64u,
    0x009edf19u, 0x009edf92u,
};
static const uint32_t kAddItCallSites[6] = {
    0x006eba64u, 0x0075f3d4u, 0x0079c17fu, 0x007a3f84u, 0x007a40abu,
    0x0090d458u,
};

extern "C" uint32_t isaac_pgd_ro_va(void) { return ISAAC_PGDRO_VA; }
extern "C" uint32_t isaac_pgd_ro_ret_va(void) { return ISAAC_PGDRO_RET_VA; }
extern "C" int32_t isaac_pgd_ro_body_bytes(void) {
  return ISAAC_PGDRO_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_ro_inbound(void) { return ISAAC_PGDRO_INBOUND; }
extern "C" int32_t isaac_pgd_ro_return_stack(void) {
  return ISAAC_PGDRO_RETURN_STACK;
}
extern "C" int32_t isaac_pgd_ro_readonly_off(void) {
  return ISAAC_PGDRO_READONLY_OFF;
}
extern "C" uint32_t isaac_pgd_ro_log_va(void) { return ISAAC_PGDRO_LOG_VA; }
extern "C" uint32_t isaac_pgd_ro_string_true_va(void) {
  return ISAAC_PGDRO_STRING_TRUE_VA;
}
extern "C" uint32_t isaac_pgd_ro_string_false_va(void) {
  return ISAAC_PGDRO_STRING_FALSE_VA;
}
extern "C" uint32_t isaac_pgd_ro_log_call_va(void) {
  return ISAAC_PGDRO_LOG_CALL_VA;
}
extern "C" uint32_t isaac_pgd_ro_cmp_cmove_va(void) {
  return ISAAC_PGDRO_CMP_CMOVE_VA;
}
extern "C" uint32_t isaac_pgd_ro_store_va(void) { return ISAAC_PGDRO_STORE_VA; }
extern "C" int32_t isaac_pgd_ro_call_site_count(void) { return 4; }
extern "C" uint32_t isaac_pgd_ro_call_site_va(int32_t index) {
  if (index < 0 || index >= 4) return 0u;
  return kRoCallSites[index];
}
/* The stored readonly byte law: `mov bl, byte [ebp+8]` +
   `mov byte [esi+1], bl` — value & 0xff. */
extern "C" uint32_t isaac_pgd_ro_effective_value(uint32_t value) {
  return value & 0xffu;
}
/* The cmove string choice: "True" iff the LOW byte is nonzero. */
extern "C" int32_t isaac_pgd_ro_logs_true(uint32_t value) {
  return (value & 0xffu) != 0u ? 1 : 0;
}
extern "C" uint32_t isaac_pgd_ro_string_choice_va(uint32_t value) {
  return isaac_pgd_ro_logs_true(value) ? ISAAC_PGDRO_STRING_TRUE_VA
                                       : ISAAC_PGDRO_STRING_FALSE_VA;
}

extern "C" uint32_t isaac_pgd_unl_va(void) { return ISAAC_PGDUNL_VA; }
extern "C" uint32_t isaac_pgd_unl_ret_va(void) { return ISAAC_PGDUNL_RET_VA; }
extern "C" int32_t isaac_pgd_unl_body_bytes(void) {
  return ISAAC_PGDUNL_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_unl_inbound(void) { return ISAAC_PGDUNL_INBOUND; }
extern "C" int32_t isaac_pgd_unl_return_stack(void) {
  return ISAAC_PGDUNL_RETURN_STACK;
}
extern "C" int32_t isaac_pgd_unl_ach_off(void) {
  return ISAAC_PGD_OFF_ACHIEVEMENTS;
}
extern "C" int32_t isaac_pgd_unl_index_hi(void) {
  return ISAAC_PGD_COUNT_ACHIEVEMENTS;
}
extern "C" int32_t isaac_pgd_unl_gate_count(void) { return 9; }
static const uint32_t kUnlGateVas[9] = {
    0x00929aa6u, 0x00929aabu, 0x00929ab5u, 0x00929abcu, 0x00929ac0u,
    0x00929accu, 0x00929ad7u, 0x00929adbu, 0x00929ae4u,
};
extern "C" uint32_t isaac_pgd_unl_gate_va(int32_t index) {
  if (index < 0 || index >= 9) return 0u;
  return kUnlGateVas[index];
}
extern "C" uint32_t isaac_pgd_unl_true_tail_va(void) {
  return ISAAC_PGDUNL_TRUE_TAIL_VA;
}
extern "C" uint32_t isaac_pgd_unl_false_tail_va(void) {
  return ISAAC_PGDUNL_FALSE_TAIL_VA;
}
extern "C" int32_t isaac_pgd_unl_call_site_count(void) { return 32; }
extern "C" uint32_t isaac_pgd_unl_call_site_va(int32_t index) {
  if (index < 0 || index >= 32) return 0u;
  return kUnlCallSites[index];
}
/* The machine-order law stays the v1 isaac_pgd_unlocked (re-verified
   byte-exact this unit — sentinel-first, UNSIGNED window 0..0x281,
   id0 before the ach byte read, mode dword == 2, Game* null gate,
   UNSIGNED +0x26630 > 0, byte +0x26589). */

extern "C" uint32_t isaac_pgd_addit_va(void) { return ISAAC_PGDADDIT_VA; }
extern "C" uint32_t isaac_pgd_addit_ret_va(void) { return ISAAC_PGDADDIT_RET_VA; }
extern "C" int32_t isaac_pgd_addit_body_bytes(void) {
  return ISAAC_PGDADDIT_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_addit_inbound(void) {
  return ISAAC_PGDADDIT_INBOUND;
}
extern "C" int32_t isaac_pgd_addit_return_stack(void) {
  return ISAAC_PGDADDIT_RETURN_STACK;
}
extern "C" uint32_t isaac_pgd_addit_count_call_va(void) {
  return ISAAC_PGDADDIT_COUNT_CALL_VA;
}
extern "C" uint32_t isaac_pgd_addit_count_call_site_va(void) {
  return ISAAC_PGDADDIT_COUNT_CALL_SITE_VA;
}
extern "C" uint32_t isaac_pgd_addit_try_unlock_va(void) {
  return ISAAC_PGDADDIT_TRY_UNLOCK_VA;
}
extern "C" int32_t isaac_pgd_addit_window_hi(void) {
  return ISAAC_PGDADDIT_WINDOW_HI;
}
extern "C" int32_t isaac_pgd_addit_item_flag_off(void) {
  return ISAAC_PGDADDIT_ITEM_FLAG_OFF;
}
extern "C" int32_t isaac_pgd_addit_dirty_off(void) {
  return ISAAC_PGDADDIT_DIRTY_OFF;
}
extern "C" uint32_t isaac_pgd_addit_row_a_id(void) {
  return ISAAC_PGDADDIT_ROW_A_ID;
}
extern "C" uint32_t isaac_pgd_addit_row_b_id(void) {
  return ISAAC_PGDADDIT_ROW_B_ID;
}
extern "C" uint32_t isaac_pgd_addit_row_a_call_va(void) {
  return ISAAC_PGDADDIT_ROW_A_CALL_VA;
}
extern "C" uint32_t isaac_pgd_addit_row_b_call_va(void) {
  return ISAAC_PGDADDIT_ROW_B_CALL_VA;
}
extern "C" uint32_t isaac_pgd_addit_row_a_gate_va(int32_t index) {
  static const uint32_t vas[3] = {
      ISAAC_PGDADDIT_ROW_A_GATE_B5C_VA, ISAAC_PGDADDIT_ROW_A_GATE_B27_VA,
      ISAAC_PGDADDIT_ROW_A_GATE_C4C_VA};
  if (index < 0 || index >= 3) return 0u;
  return vas[index];
}
extern "C" uint32_t isaac_pgd_addit_row_b_gate_va(int32_t index) {
  static const uint32_t vas[2] = {
      ISAAC_PGDADDIT_ROW_B_GATE_C39_VA, ISAAC_PGDADDIT_ROW_B_GATE_BD0_VA};
  if (index < 0 || index >= 2) return 0u;
  return vas[index];
}
extern "C" int32_t isaac_pgd_addit_gate_field_off(int32_t index) {
  static const int32_t offs[5] = {0xb5c, 0xb27, 0xc4c, 0xc39, 0xbd0};
  if (index < 0 || index >= 5) return 0;
  return offs[index];
}
extern "C" uint32_t isaac_pgd_addit_entry_gate_va(void) {
  return ISAAC_PGDADDIT_ENTRY_GATE_VA;
}
extern "C" uint32_t isaac_pgd_addit_window_gate_va(void) {
  return ISAAC_PGDADDIT_WINDOW_GATE_VA;
}
extern "C" uint32_t isaac_pgd_addit_id0_skip_va(void) {
  return ISAAC_PGDADDIT_ID0_SKIP_VA;
}
extern "C" uint32_t isaac_pgd_addit_owned_gate_va(void) {
  return ISAAC_PGDADDIT_OWNED_GATE_VA;
}
extern "C" uint32_t isaac_pgd_addit_flag_store_va(void) {
  return ISAAC_PGDADDIT_FLAG_STORE_VA;
}
extern "C" uint32_t isaac_pgd_addit_dirty_store_va(void) {
  return ISAAC_PGDADDIT_DIRTY_STORE_VA;
}
extern "C" int32_t isaac_pgd_addit_call_site_count(void) { return 6; }
extern "C" uint32_t isaac_pgd_addit_call_site_va(int32_t index) {
  if (index < 0 || index >= 6) return 0u;
  return kAddItCallSites[index];
}
/* `cmp eax,0x2dc ; ja` — UNSIGNED window (all negatives reject). */
extern "C" int32_t isaac_pgd_addit_window_valid(int32_t collectible_id) {
  return (uint32_t)collectible_id <= (uint32_t)ISAAC_PGDADDIT_WINDOW_HI ? 1
                                                                        : 0;
}
/* The store path: readonly entry + window + id != 0 (`test eax,eax ;
   je` skip) + owned byte == 0. */
extern "C" int32_t isaac_pgd_addit_store_fires(uint32_t readonly,
                                               int32_t collectible_id,
                                               uint32_t owned_byte) {
  if ((readonly & 0xffu) != 0u) return 0;
  if (isaac_pgd_addit_window_valid(collectible_id) == 0) return 0;
  if (collectible_id == 0) return 0;
  return (owned_byte & 0xffu) == 0u ? 1 : 0;
}
/* The 0x92a350 count-machine call @0x92a2ff is the last statement of
   the store block — it fires iff the store path runs. */
extern "C" int32_t isaac_pgd_addit_count_machine_fires(uint32_t readonly,
                                                       int32_t collectible_id,
                                                       uint32_t owned_byte) {
  return isaac_pgd_addit_store_fires(readonly, collectible_id, owned_byte);
}
/* Row A = the PGDGATE row-A conditions WITHOUT the inline byte1
   re-check (the readonly entry gate holds it) but WITH the window
   gate (`ja` -> the tail runs nothing). -> TryUnlock 0x17d. */
extern "C" int32_t isaac_pgd_addit_row_a(uint32_t readonly,
                                         int32_t collectible_id,
                                         uint32_t b5c, uint32_t b27,
                                         uint32_t c4c) {
  if ((readonly & 0xffu) != 0u) return 0;
  if (isaac_pgd_addit_window_valid(collectible_id) == 0) return 0;
  return isaac_pgd_gate_byte_set(b5c) && isaac_pgd_gate_byte_set(b27) &&
                 isaac_pgd_gate_byte_set(c4c)
             ? 1
             : 0;
}
/* Row B — the same shape -> TryUnlock 0x16b. */
extern "C" int32_t isaac_pgd_addit_row_b(uint32_t readonly,
                                         int32_t collectible_id,
                                         uint32_t c39, uint32_t bd0) {
  if ((readonly & 0xffu) != 0u) return 0;
  if (isaac_pgd_addit_window_valid(collectible_id) == 0) return 0;
  return isaac_pgd_gate_byte_set(c39) && isaac_pgd_gate_byte_set(bd0) ? 1
                                                                      : 0;
}
/* The body composite in machine order. */
extern "C" void isaac_pgd_addit_decisions(uint32_t readonly,
                                          int32_t collectible_id,
                                          uint32_t owned_byte, uint32_t b5c,
                                          uint32_t b27, uint32_t c4c,
                                          uint32_t c39, uint32_t bd0,
                                          int32_t* out_store,
                                          int32_t* out_count,
                                          int32_t* out_row_a,
                                          int32_t* out_row_b) {
  const int32_t store = isaac_pgd_addit_store_fires(
      readonly, collectible_id, owned_byte);
  if (out_store) *out_store = store;
  if (out_count) *out_count = isaac_pgd_addit_count_machine_fires(
      readonly, collectible_id, owned_byte);
  if (out_row_a) *out_row_a =
      isaac_pgd_addit_row_a(readonly, collectible_id, b5c, b27, c4c);
  if (out_row_b) *out_row_b =
      isaac_pgd_addit_row_b(readonly, collectible_id, c39, bd0);
}


ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_flag_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_common_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_flag_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_gate_mins);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_gate_min);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_fields);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_counter_sources);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_counter_source);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_counter_fields);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_counter_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_gated_fields);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_gated_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_field_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_flag_gate_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_counter_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_clamp_row_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_clamp_min1);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_version_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_counter_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_san_flag_gate);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sanitize_post_load);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_guard_global_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_guard_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_event_counter_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_event_counter_target_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_try_unlock_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_div_magic);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_div_shift);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_runs_divisor);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_runs_threshold);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_counter_fields);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_counter_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_runs_field);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_kind);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_field_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_byte_set);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_byte_clear);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_u32_gt);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_any_counter);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_runs_remainder);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_runs1000);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_a);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_b);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_c);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_d);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_e);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_gate_row_f);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_post_load_gates);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_item_flag_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_ach_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_item_loop_hi);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_ach_cap);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_special_ids);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_special_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_badge_ids);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_badge_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_badge_lo);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_badge_hi);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_ach_count_lo);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_ach_count_hi);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t1);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t1b);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t1c);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t2);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t3);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t4);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t5);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_t6);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_unlock_ids);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_map_global_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_map_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_map_find_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_b3_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_item_flag);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_special);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_badge);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_count_nonzero);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_count_badges);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cnt_fire);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_post_load_counts);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_readonly_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_log_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_string_true_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_string_false_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_log_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_cmp_cmove_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_effective_value);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_logs_true);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_ro_string_choice_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_ach_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_index_hi);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_gate_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_true_tail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_false_tail_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_unl_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_ret_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_body_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_count_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_count_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_try_unlock_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_window_hi);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_item_flag_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_dirty_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_a_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_b_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_a_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_b_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_a_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_b_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_gate_field_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_entry_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_window_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_id0_skip_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_owned_gate_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_flag_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_dirty_store_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_window_valid);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_store_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_count_machine_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_a);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_row_b);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_addit_decisions);

/* ==================================================================
   ABI v34 — PGDCPY: the PersistentGameData COPY-ASSIGN 0x00929010
   (section-notes/pgd-v34-frontier/). operator=, ret 4 @0x0092922e,
   returns eax=dst. 33-row plan: 2 guarded string assigns + 26 bulk
   rows + 4 vector copies + 3 tail rows; THREE stale gaps; [0] dirty
   NOT copied; [4] handle cleared. Opaque boundaries stay host:
   0x40ccd0 string assign (alloc family), 0x92cb30 vector copy.
   ================================================================== */

static const uint32_t kCpyCallSites[2] = {
    0x0092621au, 0x0090c258u,
};

/* {site_va, kind, off, bytes} in machine order. Rows r26..r29 are the
   vector-callee copies (kind VECTOR, off = dst field, bytes = 8 =
   sizeof(std::vector) here); r19/r20 record the STORE sites
   (f10 before f0c — machine order), loads at 0x0092915c/0x00929168. */
static const uint32_t kCpyRows[33][4] = {
    {0x00929064u, ISAAC_PGDCPY_KIND_REP_MOVSD, 0x038u, 640},
    {0x0092906bu, ISAAC_PGDCPY_KIND_MOVSW, 0x2b8u, 2},
    {0x00929079u, ISAAC_PGDCPY_KIND_REP_MOVSD, 0x2bcu, 2092},
    {0x0092908cu, ISAAC_PGDCPY_KIND_REP_MOVSD, 0xae8u, 732},
    {0x00929093u, ISAAC_PGDCPY_KIND_MOVSB, 0xdc4u, 1},
    {0x009290a7u, ISAAC_PGDCPY_KIND_MOVUPS, 0xdc8u, 16},
    {0x009290b5u, ISAAC_PGDCPY_KIND_MOVUPS, 0xdd8u, 16},
    {0x009290c3u, ISAAC_PGDCPY_KIND_MOVUPS, 0xde8u, 16},
    {0x009290d2u, ISAAC_PGDCPY_KIND_MOVQ, 0xdf8u, 8},
    {0x009290e0u, ISAAC_PGDCPY_KIND_DWORD, 0xe00u, 4},
    {0x009290edu, ISAAC_PGDCPY_KIND_WORD, 0xe04u, 2},
    {0x009290fbu, ISAAC_PGDCPY_KIND_BYTE, 0xe06u, 1},
    /* deferred ecx=0x1a loaded @0x0092908e (before r5!) */
    {0x00929101u, ISAAC_PGDCPY_KIND_REP_MOVSD, 0xe07u, 104},
    {0x0092911bu, ISAAC_PGDCPY_KIND_MOVUPS, 0xe6fu, 16},
    {0x00929129u, ISAAC_PGDCPY_KIND_MOVUPS, 0xe7fu, 16},
    {0x00929138u, ISAAC_PGDCPY_KIND_MOVQ, 0xe8fu, 8},
    {0x00929146u, ISAAC_PGDCPY_KIND_DWORD, 0xe97u, 4},
    {0x00929153u, ISAAC_PGDCPY_KIND_WORD, 0xe9bu, 2},
    {0x0092915au, ISAAC_PGDCPY_KIND_REP_MOVSD, 0xea0u, 108},
    {0x0092916eu, ISAAC_PGDCPY_KIND_DWORD, 0xf10u, 4},
    {0x0092917au, ISAAC_PGDCPY_KIND_DWORD, 0xf0cu, 4},
    {0x00929188u, ISAAC_PGDCPY_KIND_MOVUPS, 0xf14u, 16},
    {0x00929196u, ISAAC_PGDCPY_KIND_MOVUPS, 0xf24u, 16},
    {0x009291a4u, ISAAC_PGDCPY_KIND_MOVUPS, 0xf34u, 16},
    {0x009291b2u, ISAAC_PGDCPY_KIND_MOVUPS, 0xf44u, 16},
    {0x009291c0u, ISAAC_PGDCPY_KIND_MOVUPS, 0xf54u, 16},
};
static const uint32_t kCpyVectorRows[4][3] = {
    {0x009291c7u, 0xf64u, 8},
    {0x009291d6u, 0xf6cu, 8},
    {0x009291e5u, 0xf74u, 8},
    {0x009291f4u, 0xf7cu, 8},
};
static const int32_t kCpyTailOffs[3] = {0xf84, 0xf88, 0xf8c};
static const int32_t kCpyTailBytes[3] = {4, 4, 1};
static const int32_t kCpyGapOffs[3] = {0x2ba, 0xdc5, 0xe9d};
static const int32_t kCpyGapBytes[3] = {2, 3, 3};

extern "C" uint32_t isaac_pgd_cpy_va(void) { return ISAAC_PGDCPY_VA; }
extern "C" uint32_t isaac_pgd_cpy_ret_va(void) {
  return ISAAC_PGDCPY_RET_VA;
}
extern "C" int32_t isaac_pgd_cpy_body_bytes(void) {
  return ISAAC_PGDCPY_BODY_BYTES;
}
extern "C" int32_t isaac_pgd_cpy_inbound(void) {
  return ISAAC_PGDCPY_INBOUND;
}
extern "C" int32_t isaac_pgd_cpy_return_stack(void) {
  return ISAAC_PGDCPY_RETURN_STACK;
}
extern "C" int32_t isaac_pgd_cpy_returns_this(void) {
  return ISAAC_PGDCPY_RETURNS_THIS;
}
extern "C" int32_t isaac_pgd_cpy_dirty_off(void) {
  return ISAAC_PGDCPY_DIRTY_OFF;
}
extern "C" int32_t isaac_pgd_cpy_handle_off(void) {
  return ISAAC_PGDCPY_HANDLE_OFF;
}
extern "C" uint32_t isaac_pgd_cpy_handle_clear_va(void) {
  return ISAAC_PGDCPY_HANDLE_CLEAR_VA;
}
extern "C" int32_t isaac_pgd_cpy_string_a_off(void) {
  return ISAAC_PGDCPY_STRING_A_OFF;
}
extern "C" int32_t isaac_pgd_cpy_string_b_off(void) {
  return ISAAC_PGDCPY_STRING_B_OFF;
}
extern "C" int32_t isaac_pgd_cpy_string_size_off(void) {
  return ISAAC_PGDCPY_STRING_SIZE_OFF;
}
extern "C" int32_t isaac_pgd_cpy_string_cap_off(void) {
  return ISAAC_PGDCPY_STRING_CAP_OFF;
}
extern "C" uint32_t isaac_pgd_cpy_self_guard_cmp_va(int32_t index) {
  if (index == 0) return ISAAC_PGDCPY_SELF_GUARD_A_CMP_VA;
  if (index == 1) return ISAAC_PGDCPY_SELF_GUARD_B_CMP_VA;
  return 0u;
}
extern "C" uint32_t isaac_pgd_cpy_self_guard_je_va(int32_t index) {
  if (index == 0) return ISAAC_PGDCPY_SELF_GUARD_A_JE_VA;
  if (index == 1) return ISAAC_PGDCPY_SELF_GUARD_B_JE_VA;
  return 0u;
}
extern "C" uint32_t isaac_pgd_cpy_assign_call_va(int32_t index) {
  if (index == 0) return ISAAC_PGDCPY_ASSIGN_A_CALL_VA;
  if (index == 1) return ISAAC_PGDCPY_ASSIGN_B_CALL_VA;
  return 0u;
}
extern "C" uint32_t isaac_pgd_cpy_assign_callee_va(void) {
  return ISAAC_PGDCPY_ASSIGN_CALLEE_VA;
}
/* The guarded assign: `cmp ecx,eax ; je skip` — fires iff dst != src
   for that member (same-object self-assign skips BOTH pushes+call). */
extern "C" int32_t isaac_pgd_cpy_string_assign_fires(uint32_t self_equal) {
  return self_equal == 0u ? 1 : 0;
}
/* `cmp dword [eax+0x14],0x10 ; jb inline` — cap >= 0x10 UNSIGNED ->
   heap data ptr [eax], else the SSO buffer at [eax] itself. */
extern "C" uint32_t isaac_pgd_cpy_string_data_select(uint32_t cap_dword,
                                                     uint32_t inline_ptr,
                                                     uint32_t heap_ptr) {
  return cap_dword >= ISAAC_PGDCPY_STRING_HEAP_THRESHOLD ? heap_ptr
                                                         : inline_ptr;
}
extern "C" uint32_t isaac_pgd_cpy_deferred_count_site_va(void) {
  return ISAAC_PGDCPY_DEFERRED_COUNT_SITE_VA;
}
extern "C" int32_t isaac_pgd_cpy_deferred_count(void) {
  return ISAAC_PGDCPY_DEFERRED_COUNT;
}
extern "C" uint32_t isaac_pgd_cpy_vector_callee_va(void) {
  return ISAAC_PGDCPY_VECTOR_CALLEE_VA;
}
extern "C" int32_t isaac_pgd_cpy_vector_sites(void) {
  return ISAAC_PGDCPY_VECTOR_SITES;
}
extern "C" int32_t isaac_pgd_cpy_vector_dst_off(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_VECTOR_SITES) return -1;
  return (int32_t)(ISAAC_PGDCPY_VECTOR_DST_OFF_0 +
                   (uint32_t)index * ISAAC_PGDCPY_VECTOR_STRIDE);
}
extern "C" uint32_t isaac_pgd_cpy_vector_call_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_VECTOR_SITES) return 0u;
  return kCpyVectorRows[index][0];
}
extern "C" uint32_t isaac_pgd_cpy_row_site_va(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_ROWS) return 0u;
  if (index < 26) return kCpyRows[index][0];
  if (index < 30) return kCpyVectorRows[index - 26][0];
  static const uint32_t kCpyTailSites[3] = {
      0x00929202u, 0x0092920eu, 0x0092921cu,
  };
  return kCpyTailSites[index - 30];
}
extern "C" int32_t isaac_pgd_cpy_tail_row_off(int32_t index) {
  if (index < 0 || index >= 3) return -1;
  return kCpyTailOffs[index];
}
extern "C" int32_t isaac_pgd_cpy_tail_row_bytes(int32_t index) {
  if (index < 0 || index >= 3) return -1;
  return kCpyTailBytes[index];
}
extern "C" int32_t isaac_pgd_cpy_stale_gap_count(void) {
  return ISAAC_PGDCPY_STALE_GAPS;
}
extern "C" int32_t isaac_pgd_cpy_stale_gap_off(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_STALE_GAPS) return -1;
  return kCpyGapOffs[index];
}
extern "C" int32_t isaac_pgd_cpy_stale_gap_bytes(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_STALE_GAPS) return -1;
  return kCpyGapBytes[index];
}
extern "C" int32_t isaac_pgd_cpy_row_kind(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_ROWS) return -1;
  if (index < 26) return (int32_t)kCpyRows[index][1];
  if (index < 30) return ISAAC_PGDCPY_KIND_VECTOR;
  static const int32_t kCpyTailKinds[3] = {
      ISAAC_PGDCPY_KIND_DWORD, ISAAC_PGDCPY_KIND_DWORD,
      ISAAC_PGDCPY_KIND_BYTE,
  };
  return kCpyTailKinds[index - 30];
}
extern "C" int32_t isaac_pgd_cpy_row_count(void) {
  return ISAAC_PGDCPY_ROWS;
}
extern "C" int32_t isaac_pgd_cpy_row_bytes(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_ROWS) return -1;
  if (index < 26) return (int32_t)kCpyRows[index][3];
  if (index < 30) return 8;
  return kCpyTailBytes[index - 30];
}
extern "C" int32_t isaac_pgd_cpy_row_off(int32_t index) {
  if (index < 0 || index >= ISAAC_PGDCPY_ROWS) return -1;
  if (index < 26) return (int32_t)kCpyRows[index][2];
  if (index < 30) return (int32_t)kCpyVectorRows[index - 26][1];
  return kCpyTailOffs[index - 30];
}
/* Bulk rows r0..r25 only (vectors/tail are separate mechanisms):
   span +0x38..+0xf64 is 3884 B minus 8 stale-gap bytes = 3876. */
extern "C" int32_t isaac_pgd_cpy_bulk_covered_bytes(void) {
  return ISAAC_PGDCPY_BULK_COVERED_BYTES;
}
/* Which row (if any) copies byte `offset` (-1 = stale/handled else). */
extern "C" int32_t isaac_pgd_cpy_row_covers(int32_t offset) {
  for (int32_t i = 0; i < ISAAC_PGDCPY_ROWS; ++i) {
    int32_t off = isaac_pgd_cpy_row_off(i);
    int32_t len = isaac_pgd_cpy_row_bytes(i);
    if (offset >= off && offset < off + len) return i;
  }
  return -1;
}
extern "C" uint32_t isaac_pgd_cpy_call_site_va(int32_t index) {
  if (index < 0 || index >= 2) return 0u;
  return kCpyCallSites[index];
}
extern "C" void isaac_pgd_cpy_plan_totals(int32_t* out_rows,
                                          int32_t* out_bulk_bytes,
                                          int32_t* out_stale_bytes,
                                          int32_t* out_vector_bytes,
                                          int32_t* out_tail_bytes) {
  if (out_rows) *out_rows = ISAAC_PGDCPY_ROWS;
  if (out_bulk_bytes) *out_bulk_bytes = ISAAC_PGDCPY_BULK_COVERED_BYTES;
  if (out_stale_bytes) *out_stale_bytes = 8;
  if (out_vector_bytes) *out_vector_bytes = 32;
  if (out_tail_bytes) *out_tail_bytes = 9;
}

ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_inbound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_return_stack);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_returns_this);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_dirty_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_handle_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_string_a_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_string_b_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_string_size_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_string_cap_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_self_guard_cmp_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_self_guard_je_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_assign_call_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_deferred_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_vector_sites);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_vector_dst_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_tail_row_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_tail_row_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_stale_gap_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_stale_gap_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_stale_gap_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_row_kind);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_row_off);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_row_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_bulk_covered_bytes);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_cpy_row_covers);

/* ======================== ABI v35 ======================== */

/* ---------- PGDCON: out-of-cluster consumer census ----------
   All laws transcribed from the instruction stream (section-notes/
   pgd-v35/). The embedding: PersistentGameData = [0xc7169c] + 0x14;
   readonly byte pgd+1 == [mgr+0x15]; changesmade pgd+0 == [mgr+0x14]. */

uint32_t isaac_pgd_con_mgr_pgd_disp(void) {
  return ISAAC_PGD_MGR_PGD_DISP;
}

uint32_t isaac_pgd_sec3con_threshold_row_count(void) {
  return ISAAC_PGD_SEC3CON_THRESHOLD_ROWS;
}

/* PE order: row 0 slot 2, row 1 slot 4, row 2 slot 6. */
static uint32_t pgdcon_sec3con_row_slot(uint32_t row) {
  switch (row) {
    case 0u: return ISAAC_PGD_SEC3CON_ROW_0_SLOT;
    case 1u: return ISAAC_PGD_SEC3CON_ROW_1_SLOT;
    default: return ISAAC_PGD_SEC3CON_ROW_2_SLOT;
  }
}

static uint32_t pgdcon_sec3con_row_threshold(uint32_t row) {
  switch (row) {
    case 0u: return ISAAC_PGD_SEC3CON_ROW_0_THRESHOLD;
    case 1u: return ISAAC_PGD_SEC3CON_ROW_1_THRESHOLD;
    default: return ISAAC_PGD_SEC3CON_ROW_2_THRESHOLD;
  }
}

static uint32_t pgdcon_sec3con_row_unlock_id(uint32_t row) {
  switch (row) {
    case 0u: return ISAAC_PGD_SEC3CON_ROW_0_UNLOCK_ID;
    case 1u: return ISAAC_PGD_SEC3CON_ROW_1_UNLOCK_ID;
    default: return ISAAC_PGD_SEC3CON_ROW_2_UNLOCK_ID;
  }
}

uint32_t isaac_pgd_sec3con_threshold_row_slot(uint32_t row) {
  if (row >= ISAAC_PGD_SEC3CON_THRESHOLD_ROWS) return 0xFFFFFFFFu;
  return pgdcon_sec3con_row_slot(row);
}

uint32_t isaac_pgd_sec3con_threshold_row_threshold(uint32_t row) {
  if (row >= ISAAC_PGD_SEC3CON_THRESHOLD_ROWS) return 0u;
  return pgdcon_sec3con_row_threshold(row);
}

uint32_t isaac_pgd_sec3con_threshold_row_unlock_id(uint32_t row) {
  if (row >= ISAAC_PGD_SEC3CON_THRESHOLD_ROWS) return 0u;
  return pgdcon_sec3con_row_unlock_id(row);
}

/* The branch is `cmp <post>,imm ; jb skip` — UNSIGNED below — so the
   unlock fires iff post-increment value >= threshold unsigned. */
uint32_t isaac_pgd_sec3con_threshold_row_fires(uint32_t row,
                                               uint32_t pre_inc_value,
                                               uint32_t incremented) {
  if (row >= ISAAC_PGD_SEC3CON_THRESHOLD_ROWS) return 0u;
  const uint32_t post =
      incremented ? (pre_inc_value + 1u) : pre_inc_value;
  return post >= pgdcon_sec3con_row_threshold(row) ? 1u : 0u;
}

uint32_t isaac_pgd_sec3con_idx_unlock_rows(void) {
  return ISAAC_PGD_SEC3CON_IDX_UNLOCK_ROWS;
}

uint32_t isaac_pgd_sec3con_idx_unlock_id(int32_t idx) {
  switch (idx) {
    case ISAAC_PGD_SEC3CON_IDX_ROW_0_VALUE:
      return ISAAC_PGD_SEC3CON_IDX_ROW_0_UNLOCK_ID;
    case ISAAC_PGD_SEC3CON_IDX_ROW_1_VALUE:
      return ISAAC_PGD_SEC3CON_IDX_ROW_1_UNLOCK_ID;
    case ISAAC_PGD_SEC3CON_IDX_ROW_2_VALUE:
      return ISAAC_PGD_SEC3CON_IDX_ROW_2_UNLOCK_ID;
    default:
      return 0u;
  }
}

/* DEFECT PINNED: `jne 0x7fd7ab` lands INSIDE the index-row block, so the
   index-mapped unlocks run even when readonly blocks inc + thresholds. */
uint32_t isaac_pgd_sec3con_idx_gated_by_readonly(void) {
  return 0u;
}

uint32_t isaac_pgd_sec8inc_bound_max(void) {
  return ISAAC_PGD_SEC8INC_BOUND_MAX;
}

uint32_t isaac_pgd_sec8inc_in_bound(uint32_t id) {
  return id <= ISAAC_PGD_SEC8INC_BOUND_MAX ? 1u : 0u;
}

uint32_t isaac_pgd_sec8inc_inc_self(uint32_t id) {
  return id <= ISAAC_PGD_SEC8INC_BOUND_MAX ? 1u : 0u;
}

/* `cmp edx,1 ; je skip` -> aggregate fires for every in-bound id != 1. */
uint32_t isaac_pgd_sec8inc_inc_agg(uint32_t id) {
  if (id > ISAAC_PGD_SEC8INC_BOUND_MAX) return 0u;
  return id != (uint32_t)ISAAC_PGD_SEC8INC_AGG_SKIP_ID ? 1u : 0u;
}

uint32_t isaac_pgd_sec8inc_warn_fires(uint32_t id) {
  return id > ISAAC_PGD_SEC8INC_BOUND_MAX ? 1u : 0u;
}

uint32_t isaac_pgd_sec8inc_call_site_count(void) {
  return ISAAC_PGD_SEC8INC_CALL_SITES;
}

uint32_t isaac_pgd_sec8inc_call_site_va(uint32_t index) {
  static const uint32_t kSites[ISAAC_PGD_SEC8INC_CALL_SITES] = {
      ISAAC_PGD_SEC8INC_CALL_SITE_0_VA,
      ISAAC_PGD_SEC8INC_CALL_SITE_1_VA,
      ISAAC_PGD_SEC8INC_CALL_SITE_2_VA,
  };
  if (index >= ISAAC_PGD_SEC8INC_CALL_SITES) return 0u;
  return kSites[index];
}

/* Gate law: `cmp <counter>,0 ; jle skip` -> fire iff SIGNED value > 0
   (a negative counter does NOT fire). */
int32_t isaac_pgd_sec8gate_fires(int32_t counter_value) {
  return counter_value > 0 ? 1 : 0;
}

uint32_t isaac_pgd_sec10col_site_count(void) {
  return ISAAC_PGD_SEC10COL_SITES;
}

/* Raw unchecked index — agrees with the v2 PGDX sec10 store-slot law. */
int32_t isaac_pgd_sec10col_store_index(uint32_t readonly_byte, int32_t idx) {
  if ((readonly_byte & 0xFFu) != 0u) return -1;
  return idx;
}

uint32_t isaac_pgd_sec10col_clears_slot0(void) { return 1u; }

uint32_t isaac_pgd_sec10col_dirty_fires(uint32_t readonly_byte) {
  return (readonly_byte & 0xFFu) == 0u ? 1u : 0u;
}

/* Both collect sites fall through to SaveLocally on BOTH readonly arms. */
uint32_t isaac_pgd_sec10col_save_local_always_runs(void) {
  return 1u;
}

ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_con_mgr_pgd_disp);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_threshold_row_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_threshold_row_slot);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_threshold_row_threshold);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_threshold_row_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_threshold_row_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_idx_unlock_rows);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_idx_unlock_id);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec3con_idx_gated_by_readonly);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_bound_max);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_in_bound);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_inc_self);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_inc_agg);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_warn_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_call_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8inc_call_site_va);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec8gate_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10col_site_count);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10col_store_index);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10col_clears_slot0);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10col_dirty_fires);
ISAAC_PGD_NO_NARROW_PARAMS(isaac_pgd_sec10col_save_local_always_runs);
