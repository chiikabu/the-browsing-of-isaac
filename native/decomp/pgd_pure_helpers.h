#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* PersistentGameData save-state pure helpers — ABI v35.
   v35 (this unit) lands PGDCON, the out-of-cluster consumer census
   over the five v1-"unidentified" arrays (ABI 34 -> 35, atomic on
   both sides; section-notes/pgd-v35/). Method: whole-.text linear
   decode with resync, every memory-operand displacement equal to a
   raw array base (+0xdc8/+0xe00/+0xea0/+0xf0c/+0xf14) or the
   Manager-folded form (+0x14+base), every out-of-cluster hit then
   pointer-traced to its object. Four sites authenticate through one
   fingerprint — base [0xc7169c] (+ add 0x14), readonly byte [mgr+0x15]
   (= pgd+1), dirty store [mgr+0x14] (= pgd+0), log 0xa112c0 /
   TryUnlock / SaveLocally:
     PGDSEC3CON  Update() 0x007fb250 @0x7fd75c..0x7fd7d3: readonly-
                 guarded indexed ++sec3[idx], unconditional dirty,
                 three threshold rows (sec3[2]>=40->ach 0x10,
                 sec3[4]>=30->0x11, sec3[6]>=20->0x12; UNSIGNED jb)
                 and three index rows (idx==2->0xd, idx==4->0xe,
                 idx==11(0xb)->0x9b). DEFECT PINNED: the guard's
                 `jne` target 0x7fd7ab is INSIDE the index-row block,
                 so index unlocks fire even when readonly blocks the
                 increment and thresholds.
     PGDSEC8INC  cdecl mutator 0x00958e60 (ret 0xc): unsigned bound
                 id <= 0x1a (== PGD_COUNT_SEC8 - 1, consumer-side
                 re-proof of COUNT_SEC8), ++[mgr+id*4+0xeb4]
                 (= sec8[id]), dirty, id != 1 -> aggregate
                 ++[mgr+0xebc] (= sec8[2]) + dirty again; bound miss
                 logs (8, 0xb7ae74, id) and stores nothing. Exactly 3
                 E8 call sites: 0x68fcca (caller re-checks the bound),
                 0x6f9a19 (Game::End ending->id mapping), 0x8cedbd
                 (behind gate site 0x8ced40).
     PGDSEC8GATE two read gates `cmp sec8[id],0 ; jle skip`
                 (@0x8cedae fn 0x8ced40 feeding the mutator call;
                 @0x8cf193 fn 0x8cf0e0): fire iff SIGNED counter > 0.
     PGDSEC10COL two inlined clones of the PGDADSED collect law at
                 fn 0x8cddf0 (@0x8cde6d..0x8cde9f) and fn 0x94d040
                 (@0x94d09a..0x94d0d6): raw unchecked flag store 1
                 into sec10[idx], unconditional slot-0 clear, dirty,
                 log (1, 0xb7ae58, idx); SaveLocally runs REGARDLESS
                 of the readonly verdict. Third site fn 0x8f01b0
                 clears one flag (no slot-0 clear, no log).
   Census NEGATIVE for SEC5/SEC9: zero authenticated consumers; the
   Game::End increments sit in Manager-owned ending counters (esi is
   never folded), only their dirty byte touches pgd. No renames —
   none of the new consumers carries an exact ZHL signature, so all
   five FIELD_IDENTIFICATION rows stay LAYOUT_ONLY; identifiers stay
   address-stable per the v2 naming policy.
   v34 lands PGDCPY (ABI 33 -> 34, atomic on
   both sides) — the PersistentGameData COPY-ASSIGN 0x00929010 (section-notes/
   pgd-v34-frontier/): `__thiscall PGD* operator=(const PGD&)`, ret 4
   @0x0092922e returning this. The machine is a FULL-COVERAGE row
   plan over the whole object: two guarded std::string assigns (+8,
   +0x20; self-assign skip; SSO-vs-heap data select via cap >= 0x10
   UNSIGNED, size dword at +0x10, callee 0x40ccd0), 26 bulk rows
   spanning +0x38..+0xf64 with THREE pinned stale gaps (+0x2ba..2,
   +0xdc5..3, +0xe9d..3), the deferred rep count `mov ecx,0x1a`
   @0x0092908e feeding the +0xe07 bosses row four instructions later,
   four vector member copies through 0x92cb30 (+0xf64 stride 8),
   tail dwords +0xf84/+0xf88 and byte +0xf8c, [0] dirty NOT copied,
   [4] handle CLEARED to 0 @0x00929225. The import-restore coverage
   laws (v5/v6) are the SUBSET view; this is the reference full plan.
   Inbound 2: copy-ctor 0x9261a0 @0x92621a, global-PGD snapshotter
   0x90c0e0 @0x90c258 (src = [0xc7169c]+0x14). No uint8_t anywhere.
   v33 lands PGDRO + PGDUNL + PGDADDIT (ABI 32 -> 33, atomic on
   both sides) — the TryUnlock-adjacent decision islands
   0x9299e0 / 0x929aa0 / 0x92a2d0 (section-notes/pgd-v33-islands/):
   the SetReadOnly low-byte cmove string-choice + this[1] readonly
   store (the family's only writer of the +1 gate byte), the Unlocked
   probe (EXACT ZHL 9B, ZERO calls; the v1 law re-verified byte-exact
   — sentinel -2 first, signed neg -> true, UNSIGNED window 0..0x281,
   id0 before the ach byte read, mode dword [0xc7169c]+8 == 2, Game*
   [0xc71678] null gate, +0x26630 UNSIGNED > 0, +0x26589 byte) and
   the AddToCollection mutator (EXACT ZHL 15B; readonly entry +
   UNSIGNED window 0..0x2dc + id0 skip + owned skip -> items[0xae8]=1
   + dirty + the 0x92a350 count machine @0x92a2ff, then the
   PGDGATE-A/B duplicate rows without the inline byte1 re-check:
   b5c/b27/c4c -> 0x17d @0x92a326, c39/bd0 -> 0x16b @0x92a344);
   the log 0xa112c0, TryUnlock 0x929a20, 0x92a350 and the game
   globals stay typed-host. No uint8_t anywhere in the new surface.
   v32 lands PGDSAN + PGDGATE + PGDCNT (ABI 31 -> 32, atomic
   on both sides) — the post-load helpers 0x927d20 / 0x929820
   / 0x92a350 (section-notes/pgd-v32-postload/): the version/counter
   gated min-1 clamp sanitizer (PURE, no calls), the 11-row
   achievement-unlock gate machine and the item-flag + achievement
   count/threshold unlock machine; the unlock actions (TryUnlock
   0x929a20, the IEC(0,0) call + the 0x2a378 guard, the item-map
   find 0x72fd10) stay typed-host.
   v31 lands PGDVRF (ABI 30 -> 31, atomic on
   both sides) — the save verifier 0x926f10 verify-open laws
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
   v30 lands PGDCK + PGDWRI (ABI 29 -> 30, atomic on
   both sides) — the checksum leaf 0x683410 deep-dive + the writer
   0x9282e0 record-count laws (section-notes/pgd-v30-checksum/).
   PGDCK pins the arithmetic core (RE-VERIFIED byte-exact vs the
   v1 PGDC block): 0x683410 checksum_update (ret 8 @0x683578, body
   0x168; mode 0 = buffered ror-add lane, mode 1 = reflected table
   CRC with the sar-rounds generator — table[1] 0x09073096
   re-derived; the runtime latch [0xc7e864] guards the 0xc7e860
   table so the GENERATOR is the law; mode >= 2 = identity;
   inbound 1026 — PGD writer 61 + region 1 + ~964 other families)
   and the 0x683580 checksum_region wrapper (SEH handler 0xaf3860,
   cookie 0xbf93b4, vtbl +0x4 tell @0x6835ae / +0xc seek @0x6835c5
   / +0x14 read @0x6835e6, string IO 0xa648b0 @0x6835ce, update
   call @0x683606; inbound 5; the PGD verifier 0x926f10 calls it
   from 0x927017 with push 0x10 / push 4 — skip_front 0x10 /
   skip_back 4 CONFIRMED at the call site — then compares the
   trailing dword). Wrapper stays typed-host; the region-length
   u32-wrap law pgdChecksumRegionLen + the mode-1 fold from seed
   0xfedcba76 are PURE. PGDWRI lands the writer's literal record
   plan: 10 fixed sections (loop bound = count dword, stride = elem
   width, base = field offset), the R11 sub-block plan, the 61-site
   checksum-call table {va, role, len} — v29's "60x" corrected to
   61 (the pre-record this+0xf84 dword hash @0x928336 was missed)
   — and the save-counter inc law. The stream IO stays typed-host
   (63x vtbl+0x1c, 4x 0x414a80, 1x 0xaf05e5, 1 this-store); the
   writer as a whole stays IRREDUCIBLE with the corrected census.
   v29 (this unit) lands PGDISP (ABI 28 -> 29, atomic on both
   sides) — the remaining-host finalization
   (section-notes/pgd-v29-final/). PGDISP = the 0x00929660 save
   DISPATCHER decision laws (92 bytes, ret 4 @0x9296bc, 2 inbound
   call sites — CORRECTED tooling: 0x91a398 + 0x94c91e; the
   v28-hostleaf record's "1" missed 0x94c91e via the buggy lea-4
   census tool). 3 direct E8 (typed-host 0x9292c0 stamp-helper
   @0x92967e, 0x928ee0 SaveToSteamCloud @0x9296a7, 0x9294f0
   save_local @0x9296b4), 1 indirect (import slot *0xb18a1c
   @0x92968e — host probe, arg 0xc5c3a4 ptr into .data), 1
   this-store (this[0] = 0 @0x929679). Laws: pgdDispProceed =
   this[0] & this[0xf8c] BYTE gates both nonzero (silent early
   return else); pgdDispStoreClearFires = proceed (the movb fire,
   PGDIEC dirty-store style); pgdDispStampCallFires = proceed &&
   arg1 BYTE nonzero (0x9292c0 call); pgdDispCloudSelected =
   probe result FULL DWORD nonzero AND g[0x2a3a4] BYTE nonzero
   (0x928ee0 @0x9296a7 else 0x9294f0 @0x9296b4). Kinship: the
   importer inline 0x92b780..0x92b7d2 (v25o pgdImportSaveSelect)
   is this dispatcher minus the arg gate. The dispatcher was the
   LAST un-landed PURE island: 0x9293d0 file-save helper (6 E8 /
   7 indirect / 2 this-stores) and 0x9282e0 write_stream root
   (65 E8 / 63 indirect / 1 this-store — CORRECTED this unit to
   66 E8 / 61 checksum sites) delivered as written
   IRREDUCIBLE evidence; importer/reader residuals verified as
   typed-host leaf sets only. Inbound CORRECTED: 0x928ee0 17,
   0x9292c0 13, 0x9294f0 22.
   v28 (this unit) lands PGDULD + the PGDHOST law pins (ABI 27 ->
   28, atomic on both sides) — the save-cluster final host-leaf
   assessment (section-notes/pgd-v28-hostleaf/). PGDULD = the
   0x009296c0 tier-ladder decision island (200 bytes, ret
   @0x929788, 6 inbound call sites; the LAST pure island on the
   family record — the F11 "no un-landed pure island" claim missed
   it). 1 direct E8 (typed-host TryUnlock 0x929a20 @0x929773),
   0 indirects, ZERO stores to this/.data. Laws: pgdUldCount =
   (u32(end-start) * 0x63e7063f) >> 38, minus 1 for non-negative
   (BigInt-exact; magic = ceil(2^38/164), 2^38 = 164*M - 92; for
   x < 2^31 it equals floor(x/164), minus 1 at exact multiples —
   the multiply-high +1 flip would need x >= 2^38/92 with x mod
   164 == 163, all >= 2^31 where the signed path applies, so the
   raw multiply is the law);
   pgdUldSegmentIndex = min_u32(tier, count) — `cmovb` UNSIGNED,
   wrapped negative counts select the tier; pgdUldLoopIterations =
   u32((countWord - ptr) >> 2 SAR) — unsigned `cmp ebx,ecx ; jae`
   bound; pgdUldFlagAccum = the `cmp byte [entry+0x38],dl ;
   cmovne` AND over BYTE flags (reset 1 per tier @0x9296d8);
   pgdUldUnlockId = the 46-entry .rdata ladder 0xb7b0b0 (const,
   transcribed; tier 45 = 0x204); pgdUldFire = flag && tier <=
   0x2d && id != 0 -> the TryUnlock call pin 0x929773. The three
   other save fns are IRREDUCIBLE (written evidence in the notes):
   0x928ee0 SaveToSteamCloud (5 E8 + 4 indirect + 1 store),
   0x9292c0 timestamp+SEH (6 E8 + 2 indirect data-slot + global
   string 0xc93e50 writes via callees), 0x9294f0 save-local
   (8 E8 + 7 indirect + 2 this-stores); the dispatcher 0x929660,
   the file helper 0x9293d0 and the serializer root 0x9282e0 are
   host census. PGDHOST pins: cookie 0xaef12b VERIFIED PURE
   (`cmp ecx,[0xbf93b4] ; jne 0xaef134 ; ret ; jmp 0xaef775`,
   8 bytes, 0 E8) — stays host-TYPED but the stub law is now a
   pin; checksum 0x683580 VERIFIED NOT pure (SEH + vtbl stream
   calls + 1 E8) — region pins: skip_front 0x10, skip_back 4,
   non-standard table[1] 0x09073096, seed 0xfedcba76.
   v27 (this unit) lands PGDIEC (ABI 26 -> 27, atomic on both sides).
   PGDIEC = the IncreaseEventCounter 0x00929b40 threshold cascade
   (EXACT ZHL, 21 pattern bytes, ret 8 @0x92a2c8) — the family's last
   un-landed achievement helper (the v1 "host cascade" verdict was
   superseded by the v20/v21/v22 standard: gate laws pure, TryUnlock
   typed-host). Readonly LOW-BYTE gate `cmp byte [esi+1],0 ; jne`
   @0x929b5e; SIGNED saturating counter store @0x929b68..0x929b7d
   (the landed event_counter_next law, byte-identical) with UNCHECKED
   slot offset 0x2bc + 4*slot; dirty store `mov byte [esi],1`
   @0x929b84 UNCONDITIONAL after the gate; then the 52-row direct
   threshold->unlock cascade @0x929b87..0x929ff8 (54 TryUnlock call
   sites; every row `cmp u32 dword, IMM ; jb` UNSIGNED except row 1
   `test eax,eax ; je` NONZERO, row 16 two-`jbe`-vs-0 PAIR (0x31c AND
   0x320 both nonzero) and row 41 MODE (`cmp [0x5b4],0x1f ; jb` +
   `cmp [0xc7169c]+8,1 ; jne` full-dword mode == 1, host input); rows
   27/28 fire TWO unlock ids per gate). TryUnlock 0x929a20 stays
   typed-host (family standard); the group walk 0x92a000..0x92a253
   (group table 0xc35ed0 stride 0x90 + vectors 0xbabxxx — ALL .data,
   runtime-mutable) and the five derived tail gates @0x92a259..0x92a2b3
   (ecx/edi/ebx counts + byte flag from the walk) are HOST, census
   only. 74 inbound call sites (whole-.text rel32 scan).
   v26 (this unit) lands PGDREADER2 + PGDIVER (ABI 25 -> 26, atomic
   on both sides). PGDREADER2 = the FULL pure surface of the SIBLING
   save reader 0x0041d670 — the v8-recorded "reader of PGD_SIBLING_VA
   0x92b930", inbound from that driver @0x92ba01 (mov esi,[ebp+8] =
   the STREAM; mov [ebp-0x20],ecx = the 0x700-byte SNAPSHOT; ret 4;
   al=1 success @0x41d928 -> ret 0x41d93a; al=0 via the fail tail
   0x41dd64 -> ret 0x41dd76) — a MIRROR of the v24/v25n reader
   0x009e4260 that was NEVER landed (only v6/v8 VA pins). ITS OWN
   3-row tag table: 0xb1b98c -> section 6 count 9, 0xb1b9a0 ->
   section 7 count 0xa, 0xb1b9b4 -> section 8 count 0xa (THREE full
   dwords = 0xc bytes, first match wins; all three 12-byte bodies
   share "ISAACNGSAVE0", so row 0 always wins today — the "6R  "/
   "7R  "/"8R  " tails sit outside the compare width; a full miss ->
   tag-miss tail 0x41dd51, cdecl log (1, 0xb1b9c8, buf) -> 0xa112c0
   HOST). The size/checksum gate 0x41d748: `cmp edi,8 ; jb skip`
   UNSIGNED — only section 8 is checked, against the 0x683580
   checksum helper's return (HOST); mismatch -> cdecl log (1,
   0xb1ba00) + FAIL. Version dword reads: snap+0x6dc BEFORE the
   record loop and snap+0x6e0 at FINISH — stream reads (count 1,
   width 4), UNCONDITIONAL on their paths (mirror of the import's
   +0x4a0/+0x4a4; the sibling ctor 0x41d560 zero-row {0x6dc, 8}).
   The record loop: entry gates `test eax,eax ; js` + `cmp
   eax,[ebp-0x30] ; jge` (SIGNED 0 <= prev < elemCount 9/0xa), count
   gate `cmp [ebp-0x24],0 ; jbe` (UNSIGNED zero-only skip), dispatch
   gate `dec eax ; cmp eax,9 ; ja` (UNSIGNED (section-1) <= 9 ->
   0..9 else NO row) through the 10-entry table 0x41dd7c; the 10
   handlers (sections 1..10) use the SAME shape as the v24 reader —
   UNSIGNED cmova clamp (0x115/0xa2/0xc/0x1ba/7/0x43/0x1f/0x16/1/
   0x4d), two-bound loops (`jae` avail / `jb` clamped), byte rows
   `setg` SIGNED normalize into snap +0x38/+0x3d8/+0x5c4/+0x5cb/
   +0x60e/+0x68c, dword rows into +0x150/+0x594/+0x630/+0x688; the
   composed per-row loop law reuses the v24 byte/dword/clamp laws
   (byte rows min(avail, clamped) exact for every u32 pair; dword
   rows the 4*iters mod 2^32 closed form). PGDIVER = the import
   reader 0x009e4260's remaining pure islands: the +0x4a0
   version-read gate (rows 4..9 -> sections 4/5/6 -> stream-read one
   dword into snap+0x4a0; rows 0..3 -> no read), the +0x4a4 finish
   gate (snap+0x4a4 = 1 store UNCONDITIONAL @0x9e45fc; then `cmp
   [ebp-0x2c],6 ; jb` UNSIGNED — section == 6 -> stream-read over the
   +0x4a4 dword), and the fail tail 0x9e4aa2..0x9e4ac7 (cdecl log
   (1, 0xb80528, buf) HOST, return 0 @0x9e4ac7). All stream
   reads/calls/logs/cookies/0x683580 stay HOST; the laws are the
   decisions around them (byte-gate discipline: uint32_t params,
   re-narrowed & 0xff only where the PE tests a byte).
   v25n (this unit) lands PGDTALLY — the stage-4 TALLY loops of the
   shared reader 0x009e4260 (0x9e4618..0x9e4a8f; entered by
   fall-through after the PGDCLMP call @0x9e4613, runs
   UNCONDITIONALLY; al=1 success tail 0x9e4a8f..0x9e4aa1, cookie
   0xaef12b HOST; the fail tail 0x9e4aa2 is only reachable from the
   stage-1 tag mismatch). Collection walk 0x9e4621..0x9e49fe:
   byte [esi+eax+0x268], eax 1..0x15a (`cmp eax,0x15b ; jl` SIGNED,
   index 0 never scanned); NONZERO byte -> ecx (set B) and the alias
   table is SKIPPED; ZERO byte -> {0x114,0x14d,0x14e,0x14f,0x11b,
   0x14b} edi (set A) / {0x2b,0x3d,0xeb} ecx (set B). Exit gate
   0x9e4a04/0x9e4a0c `lea eax,[edi+ecx] ; cmp eax,0x15a ; jl`
   SIGNED: (setA+setB) < 0x15a FINISHES the reader (returns al=1,
   the settings walk never runs, no +0x7d/+0x8c stores). Settings
   walk 0x9e4a20..0x9e4a6c: byte [esi+eax+0x38], eax 1..0xb2
   (`cmp eax,0xb3 ; jl` SIGNED); NONZERO -> ecx (set B); ZERO +
   {0x81..0x85,0x9c,0x52,0x54,0xaf} -> edx (set A); **edi is NOT
   reset — it still holds the COLLECTION set A**. Stores:
   `cmp eax,0xb1 ; jl` SIGNED on (edx+ecx) gates byte [esi+0x7d]=1
   @0x9e4a78; `cmp ecx,0xb1 ; jl` SIGNED on ecx and `test edi,edi`
   gate byte [esi+0x8c]=1 @0x9e4a88 (needs COLLECTION set A == 0).
   The 7+ vtbl stream calls, the 9 cdecl logs 0xa112c0, the
   stamp-cookie 0xaef12b, PGDCLMP 0x9e4af0 and the +0x4a4 finish
   write stay HOST — the reader's leaf count is unchanged by this
   unit.
   v24 (this unit) lands PGDITAG + PGDIDISP — the PURE decision
   islands of the shared Rebirth-save snapshot reader 0x009e4260
   (the v8 "next measured candidate", never claimed; no exact ZHL;
   inbound from TryImportRebirthLocalSave 0x92b2e0 @0x92b574 with
   ecx = the 0x4f0-byte snapshot; ret 0x9e4aa1 / fail-tail ret
   0x9e4ac7). PGDITAG = the version-tag comparison table: a 16-byte
   stream read (vtbl+0x14 @0x9e4282, HOST) into [ebp-0x14], then ten
   .rdata save headers compared as THREE FULL DWORDs (0xc bytes)
   each — 0xb805bc / 0xb8060c (section 2, count 7), 0xb805a8 /
   0xb805f8 (section 3, count 8), 0xb805e4 / 0xb80514 (section 4,
   count 8), 0xb805d0 / 0xb80500 (section 5, count 9), 0xb1b98c /
   0xb80560 (section 6, count 9); ALL TEN 12-byte bodies are
   currently "ISAACNGSAVE0" (dwords 0x41415349 / 0x53474e43 /
   0x30455641), so the first row always wins today; a full miss
   falls to the fail tail 0x9e4aa2 (cdecl log (1, 0xb80528
   "RebirthPersistentGameData wrong file header (%.16s)", buffer) ->
   0xa112c0 HOST, return 0). PGDIDISP = the section-record loop and
   the 9-row dispatch outcome: entry gate `test eax,eax ; js fail`
   + `cmp eax,ebx ; jge fail` on the PREVIOUS section value (SIGNED
   0 <= prev < elemCount 7/8/9, 0x9e448a/0x9e4492), record reads
   (HOST), count gate `cmp [ebp-0x20],0 ; jbe next` (UNSIGNED
   zero-only, 0x9e44bf/0x9e44c3), dispatch gate `dec eax ; cmp
   eax,8 ; ja next` (UNSIGNED (section-1) <= 8 -> 0..8,
   0x9e44cc..0x9e44d0) through the 9-entry jump table 0x9e4ac8;
   each handler reads a record count (HOST), logs a mismatch
   (HOST 0xa112c0), clamps UNSIGNED `cmova` to its builtin MAX
   (0xb3/0x5f/0xc/0x15b/7/0x39/0x15/0x14/1), then loops with TWO
   UNSIGNED bounds — `cmp edi,[ebp-0x20] ; jae` (record byte
   count) and `cmp <iter>,[ebp-0x18] ; jb` (clamped count); byte
   handlers normalise each element `cmp byte,0 ; setg al` (SIGNED
   int8 > 0) into the snapshot flag arrays (+0x38 achievements,
   +0x268 collection, +0x3f4/+0x3fb miniboss/boss, +0x434
   challenges), dword handlers store raw dwords (+0xec counters,
   +0x3c4 sec3, +0x44c sec8, +0x49c settings). The 7+ vtbl indirect
   stream calls, the 9 cdecl logs, the stamp-cookie 0xaef12b,
   PGDCLMP 0x9e4af0 and the stage-4 tally loops stay HOST.
   Cross-check: the clamp MAXes equal the v6 PGDCOV written byte
   counts 1:1, and the store offsets are the v6 snapshot restore
   sources. The v1/v2 `isaac_pgd_reader_*` laws (0x00927c8a reader,
   11 dispatch entries, boundary <= 0xa) are a DIFFERENT reader and
   must NOT be conflated.
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
   ISAAC_PGD_OFF_READONLY); then `mov byte [eax+ecx+0xf14],1`
   0x92b244 with eax = the seed argument — an UNCHECKED byte store at
   pgd+0xf14+seed (ISAAC_PGD_OFF_SEC10_BYTES, 0x50 slots =
   ISAAC_PGD_COUNT_SEC10; the index is never masked or bounded);
   `mov byte [ecx+0xf14],0` 0x92b24c clears slot 0 UNCONDITIONALLY
   right after (the seed==0 store self-cancels); `mov byte [ecx],1`
   0x92b253 dirty (pgd+0 = ISAAC_PGD_OFF_CHANGES_MADE); the log args
   (1, 0xb7ae58, seed) are pushed BEFORE the stores and the cdecl
   call 0x92b256 -> 0xa112c0 stays HOST.
   PGDK41 = the 41-bit two-word popcount gate 0x0092b270 (no exact
   ZHL; address-stable; ret 8 @0x92b2d9): the two words go into the
   event counters first — `mov [ebx+0x5ac],eax` 0x92b281 (first arg
   -> index 188, +0x2bc = ISAAC_PGD_OFF_EVENT_COUNTERS) and `mov
   [ebx+0xa7c],eax` 0x92b28a (second arg -> index 496) — then the
   loop 0x92b295..0x92b2ba counts set bits over bits 0..40: `bts
   esi,ecx` masks the bit index to 5 bits, `cmp ecx,0x20 ; cmovae
   edx,esi ; xor esi,edx` zeroes the low word for i>=32, `and
   esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je` tests lo bit i for
   i<32 and hi bit (i-32) for i>=32; `jl 0x92b295` bound 0x29 = 41.
   `cmp edi,5 ; jl` 0x92b2bf/0x92b2c2 SIGNED gate; `push 0x143 ;
   mov ecx,ebx ; call 0x929a20` 0x92b2c4/0x92b2cb (TryUnlock, stays
   HOST) fires only at popcount >= 5; the dirty store `mov byte
   [ebx],1` 0x92b2d2 is UNCONDITIONAL (runs even when the unlock
   does not). Both match the v2 PGDX behaviour oracles
   (sec10/mask41); v23 adds the machine-exact evidence.
   v22 (this unit) lands PGDADDMINI: the `PersistentGameData::AddMiniBoss`
   mutator 0x0092a520 (no exact ZHL — it names itself only in its own
   warning string; stays address-stable; ret 4 @0x92a5d3; int3 pad
   @0x92a5d6; two ALIVE image callers 0x7ffff1 / 0x800010, byte-scan
   verified). Readonly LOW BYTE gate `cmp byte [esi+1],0 ; jne fail`
   0x92a529/0x92a52d; id window `cmp eax,0xf ; ja warn` UNSIGNED
   0x92a533/0x92a536 (anything above 0xf logs the warning and returns;
   NEGATIVES warn too — the window is unsigned); then a 7-slot id->index
   fold (0x92a53c..0x92a557): 7..0xd map to 0..6 by subtracting 7, 0xe
   aliases onto slot 6, 0..6 are used directly, and 0xf is DROPPED
   WITHOUT A WORD (signed `jg` to the fail tail — no store, no log);
   flag store `mov byte [eax+esi+0xe00],1` @0x92a55f (+0xe00 =
   ISAAC_PGD_OFF_SEC5_BYTES, 7 slots = ISAAC_PGD_COUNT_SEC5); dirty
   store `mov byte [esi],1` @0x92a569 (pgd+0 = ISAAC_PGD_OFF_CHANGES_MADE);
   host log (1, 0xb7aeac "MiniBoss %d added to SaveState\n", idx) cdecl
   0x92a56c -> 0xa112c0; then the ALL-SET gate: the seven flags 0xe00..
   0xe06 must ALL be nonzero (`cmp byte,0 ; je tail` chain
   0x92a574..0x92a5b1) before `push 0x16 ; mov ecx,esi ; call 0x929a20`
   (TryUnlock, stays HOST) @0x92a5b7. The warn log uses the ORIGINAL id.

   Freestanding; not wired into any root slice yet. Everything here is
   deterministic byte math recovered from the save/load instruction streams.
   All storage IO stays an address-stable host action (see "Host residual").

   v4 recovers the two restore index remaps `0x009e4f80` (the `+0xdc8` array)
   and `0x009e3ea0` (the `+0x2bc` event counters), and the two loops in
   `0x0092b346` that drive them. Both remaps are COMPLETE — every arm of both
   jump tables was decoded and every one is `mov eax, imm32 ; ret` or
   `xor eax,eax ; ret`. No memory access, no call, no host residual at all;
   these are the first two bodies in this family that are wholly translated.
     PGDR   the two remap laws themselves.
     PGDRA  what the caller's loops do with them: signed bounds, the slot a
            given iteration lands on, which slots are never written, and the
            slot-0 aliasing defect.

   ORIGINAL DEFECT PINNED AT v4 — reproduce, do not correct.
   The `0x009e4f80` table entry for input 10 points at the SAME arm as the
   out-of-range default (`0x009e4fc9`, `xor eax,eax ; ret`), so
   remap(10) == remap(0) == 0. The caller's loop runs ascending with two
   unconditional stores, so `source[10]` overwrites `source[0]` in slot 0 and
   `source[0]` is lost. Separately, slots 9, 12 and 13 of the fourteen-slot
   `+0xdc8` array are never written by that path at all.

   NOTE ON MEANING. A remap law is evidence about INDEXING, not about what a
   slot holds. The five v1-unidentified arrays therefore keep their
   ISAAC_PGD_FIELD_LAYOUT_ONLY status; v4 changes no verdict in
   isaac_pgd_field_status, and the suite asserts that it did not.

   v5 (this unit) does not move a single instruction of v4's land — it
   re-proves it. Every arm of both jump tables was re-read byte-for-byte from
   the image (105 table entries — 94 + 11; 104 are `mov eax, imm32 ; ret`
   arms and the sec3 entry for input 10 points at the shared
   `xor eax,eax ; ret` default, which is the pinned defect; the two
   prologues are `49 83 f9 5d 0f 87 ... ff 24 8d` and
   `49 83 f9 0a 77 43 ff 24 8d`), the rel32 census was re-run (one call site
   each, 0x0092b679 / 0x0092b739), and the C++ tables were compared against
   the PE dword-for-dword. Added this unit:
     - a randomized high-bit differential over both laws and all six loop
       predicates (draws include 0x40000000, 0x80000000, 0xffffffff, values
       past both bounds — 0x5d and 0xa — and the 0/10/11 alias boundary);
     - an end-to-end caller-loop simulation that PHYSICALLY performs the
       stores in Wasm memory and checks the final array, so the slot-0
       aliasing defect is pinned at the memory level, not just in predicates;
     - the family-wide toolchain guard: a static assertion on every export
       that no uint8_t/uint16_t scalar parameter exists (the Wasm ABI does
       not narrow i32 arguments; see AGENTS.md "Known toolchain defect");
     - mutation verdicts for all of the above (see
       section-notes/pgd-v5/NOTES.md).
   No identification verdict moved; no field meaning changed.

   v6 (this unit) names and translates the import path the v4/v5 land was
   always inside. 0x0092b2e0 is an EXACT ZHL match for
   `__thiscall bool PersistentGameData::TryImportRebirthLocalSave(const
   char* path)` (43 pattern bytes, PersistentGameData.zhl) — the first
   source-level name this family promotes that is not one of the v1 roots.
   The function reads a Rebirth-era save into a 0x4f0-byte stack snapshot
   (host stream read at 0x009e4260), clears the object, and then restores
   the arrays element by element. This unit translates the COMPLETE restore
   coverage law:
     PGDCOV  the 25 copy rows in PE execution order (23 raw block copies
             + the two remap loops the v4 land already lawed), each with
             its exact source offset into the snapshot, destination offset
             in the object, byte length, and first instruction VA;
             per-array written/stale byte counts; the element-written
             predicate (block arrays: prefix test; the two remap arrays:
             exactly the v4 restore-slot laws); and the negative census —
             +0xf14 (sec10), the +0xf64 bestiary maps, +0xf84, +0xf88 and
             +0xf8c are NOT written anywhere in the body, and no array
             store exists past 0x0092b724 (the tail at 0x0092b74b.. only
             touches the pgd+0 changesmade byte and the game global
             +0x2a378). Every copy is a raw byte/dword move: no setg, no
             setne, no clamp of any kind — deliberately different from the
             reader's `setg` normalisation (v1) and the writer's `setne`
             (v1), and asserted.
   Key VAs: 0x0092b5ed (ach blob: rep movsd 0x2c + ONE movsw + ONE movsb =
   179 bytes — the `mov ecx,0x56` at 0x0092b5f2 is a scheduled constant for
   the LATER collection copy, NOT a rep prefix; bytes `66 a5`/`a4` at
   0x0092b5f7/0x0092b5f9 carry no f3), 0x0092b665 (collection blob:
   rep movsd 0x56 + movsw + movsb = 347 bytes), 0x0092b670 (event remap
   loop, 0x5f iterations, source dwords at snapshot+0xec), 0x0092b730
   (sec3 remap loop, 0xc iterations, source dwords at snapshot+0x3c4).
   The sibling at 0x0092b930 is a DIFFERENT import (no ZHL match; two
   callers 0x92be43 / 0x92c497; its own event remap 0x41ddb0 with 0xa2
   iterations and no sec3 remap loop — sec3 copied by three movups). It is
   recorded as census evidence at v6, NOT translated at v6; its coverage
   law became v7's unit (PGDEX, below). Call-site census for 0x0092b2e0:
   exactly ONE caller in the whole
   image, 0x00926bd5 inside PersistentGameData::Load (0x00926a50, exact
   ZHL), which passes the path string and checks pgd+0xf8c afterwards.
   v7 (this unit) is the sibling import — the census v6 deliberately left
   open ("its coverage law is its own unit"). 0x0092b930 is a SECOND
   Rebirth-save importer: same snapshot reader 0x009e4260 into a 0x700-byte
   stack buffer, same Clear 0x009262b0, same tail re-save, but its own
   event restore index 0x0041ddb0 with a 161-entry jump table (0xa2 driver
   iterations, inputs 0..0xa1). The remap law, verified arm-by-arm from
   the whole function, is order-preserving onto the non-hole slots of
   [1..0xab]: input i lands on the i-th non-hole integer, max slot 0xab,
   with exactly ten holes {0x4, 0x28, 0x36, 0x44, 0x52, 0x60, 0x6e, 0x81,
   0x8f, 0x9d}; input 0 and inputs past 0xa1 return 0 (the xor default
   arm 0x0041e18a). There is NO sec3 remap loop — sec3 is three raw
   movups rows. This unit translates PGDEX: the 31 copy rows in PE
   execution order (30 raw blocks + the event remap loop), per-array
   written/stale counts, the whole-body negative census (sec10, bestiary,
   +0xf84, +0xf88 and +0xf8c are never stored inside the body — the two
   callers 0x0092be43/0x0092c497 write pgd+0xf8c AFTER the call), and
   tail_has_array_stores = 0 with the last array store pinned at the
   third sec3 movups store 0x0092bbe0. No identification verdict moved;
   no host call translated.

   v10 (this unit) is the import-side snapshot ctor 0x009e3dc0 — the
   PGDCT analogue for TryImportRebirthLocalSave's 0x4f0-byte snapshot.
   identify-zhl-address: no exact match. Whole-.text E8 rel32 census:
   EXACTLY two call sites, 0x0092b4d0 and 0x0092b4e0, both in
   0x0092b2e0, both with ecx = [ebp-0x4f0]. No stream, no vtable, no
   log. Zero rows via memset 0x00af05e5 + `rep stosd` + movups, then
   `mov word [esi],0`. There is NO set-one store (unlike PGDCT's
   +0x6e4=1). The stack argument is never read (`ret 4`). This unit
   translates PGDICT: 9 unconditional zero rows / 0x46d bytes / 5 gaps
   / 0 set-one, arg unused, and the restore-source coverage cross-law
   against the v6 PGDCOV import copy sources. No identification
   verdict moved; memset stays the same platform primitive PGDCLR /
   PGDCT already named.

   v11 (this unit) is the import-reader post-loop clamp 0x009e4af0 —
   a freestanding `push ebp / mov ebp,esp` body through `ret` (not
   `ret 4`) at 0x009e4f71, 1154 bytes, 296 instructions, ZERO host
   calls (0 E8, 0 indirect). identify-zhl-address: 0 exact matches.
   Whole-.text E8 rel32 census: EXACTLY one call site, 0x009e4613,
   inside the import snapshot reader 0x009e4260 after the stream
   loop (`mov ecx,esi ; call 0x9e4af0`). No vtable, no log, no
   stream. The official 0x400 cpu-dump window ends mid-tail at
   0x009e4eeb (one resync, a false `mov esi,0x148`); the body
   continues through five more gate/clamp pairs to the `ret`.
   This unit translates PGDCLMP: SIGNED `cmovg` floor-1 on the
   +0x454 accumulator and on twelve stair slots +0x458..+0x484
   gated by the +0x3c byte (low-byte zero test) and the SIGNED
   +0xf0 count, then five independent SIGNED +0x11c/+0x114/
   +0x14c/+0x148/+0x150 gates onto +0x488/+0x48c/+0x494/+0x490/
   +0x498 (PE order: +0x494 before +0x490). No identification
   verdict moved.

   v3 walked the section-3 handler `0x00927244` and its ten siblings through
   `0x00927cd8` instruction by instruction, and adds:
     PGDL   the exact per-section loop shape: entry gate, loop-back, store
            clamp, store address and store normalisation, each as its own
            predicate. This CORRECTS v2 (see "v2 correction" below).
     PGDN   section 11's own control flow, which is not the fixed-section
            shape at all: no cap check, unsigned outer loop, SIGNED pair loop,
            and a map clear order that differs from the writer's emit order.
     PGDT   the SECOND, independent PersistentGameData transport at
            `0x0091adf0`, which walks the same object with explicit byte
            counts and so cross-proves the array widths from a stream that
            has nothing to do with the save file.
     PGDB   `0x0091b650`, that transport's bit-packed boolean array codec.
     PGDA   the complete control flow of `0x00929790`, the routine the
            unidentified `pgd+0x02` byte gates.
     PGDI   explicit per-field identification status, so "layout proved,
            meaning not proved" is machine-checkable rather than a comment.

   v2 correction (behavioural, pinned by a test):
     `isaac_pgd_reader_elements_consumed` read the loop's entry gate as a
     SIGNED positivity test (`file_count <= 0` -> nothing consumed). The PE
     spells `test eax,eax ; je done` — a ZERO test — and the loop-back is
     `cmp idx, count ; jb` — UNSIGNED. A count with the sign bit set therefore
     enters the loop and runs until the byte-cursor cap stops it. Both
     `..._elements_consumed` and `..._elements_stored` now take and return
     unsigned. Also fixed: the `mov edi, 2` VA is `0x009270b5`, not the
     `0x009070b5` v2 recorded.

   v2 walked the deserializer section handlers `0x00927244`..`0x00927cd8`
   (jump table at `0x00927cd8`, eleven entries) and adds:
     PGDR2  per-section reader descriptors derived from the READER, so the
            writer table in v1 is now cross-proved rather than assumed;
            plus the section-9-only `cmova` count clamp.
     PGDM   section 11 sub-block decode: tag -> map slot (read side), and the
            `test/jle` + `shr 2` pair-count derivation.
     PGDX   two indexed mutators found by scanning the PGD cluster for the
            v1 "unidentified" offsets: the +0xe00 index REMAP at 0x0092a520
            and the completely unchecked +0xf14 store at 0x0092b230.
     PGDK   the 41-bit two-word popcount gate at 0x0092b270.

   NAMING POLICY FOR THE v1 "UNIDENTIFIED" ARRAYS.
   The deserializer prints a label immediately before each section handler
   ("Reading Level Counters", "Reading Mini Bosses", "Reading Cutscene
   Counters", "Reading GameSettings", "Reading Special Seed Counters"), and
   0x0092a520 names itself in its own warning ("AddMiniBoss: invalid miniboss
   id %d"). That is self-description, not proximity — but it is still a string
   reference, which is explicitly not sufficient to promote a name. The exact
   string VAs are therefore recorded below as evidence and the identifiers
   stay address-stable (`SEC3`, `SEC5`, `SEC8`, `SEC9`, `SEC10`). What v2
   promotes is BEHAVIOUR the instruction stream proves: bounds, remaps,
   clamps, widths and store predicates.

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200

   Roots (identify-zhl-address):
     0x00928ee0  exact PersistentGameData::SaveToSteamCloud()   [confirmed]
     0x00929aa0  exact PersistentGameData::Unlocked(int)
     0x00929a20  exact PersistentGameData::TryUnlock(int)
     0x00929b40  exact PersistentGameData::IncreaseEventCounter(int,int)
     0x0092a2d0  exact PersistentGameData::AddToCollection(int)
     0x0092a7b0  exact PersistentGameData::AddChallenge(int)
     0x0092a5e0  exact PersistentGameData::AddBoss(int)
     0x00926a50  exact PersistentGameData::Load(char const*)
     0x009282e0  none  -> pgd_write_stream_009282e0   (serializer)
     0x00926f10  none  -> pgd_read_stream_00926f10    (deserializer)
     0x00683410  none  -> pgd_checksum_update_00683410
     0x00683580  none  -> pgd_checksum_region_00683580
     0x009294f0  none  -> pgd_save_local_009294f0

   SIGNATURE COLLISION — do not promote:
     The catalog pattern "558bec518b15????????535657" for
     PersistentGameData::SaveLocally() matches exactly once in this image, at
     0x006d0ca0, but that body takes three stack arguments and walks the live
     entity list comparing collectible ids (0x006d0d1a..0x006d0d39). It is not
     a save routine. Nine fixed bytes is too weak a pattern; the local-save
     counterpart in this build is the address-stable 0x009294f0 (reached from
     Load 0x00926aff / 0x00926c20), whose first bytes 55 8b ec 83 e4 f8 51 ...
     do not match the catalog pattern at all. Keep both address-stable.

   Reached from Game::Exit: the Exit residual calls SaveToSteamCloud at
   VA 0x006fa200, in the same function that ends with the recorded Exit
   terminal (`Game+0x265c0 <- 0` at 0x006fa51e, word `Game+0x2658a <- 0` at
   0x006fa528).  Exit-side context: section-notes/exit-residual-2/.

   ---------------------------------------------------------------------------
   STREAM FORMAT (proved twice: writer 0x009282e0 and reader 0x00926f10)

     [0x00] 16-byte ASCII magic, NOT checksummed
     [0x10] u32 pre-section word  = *(u32*)(pgd + 0xf84)
            then, repeated: u32 id, u32 cap_word, u32 count_word, payload
            (sections 1..10 fixed; section 11 is the bestiary map block)
            then u32 save counter = *(u32*)(pgd + 0xf88) AFTER `inc`
     [eof-4] u32 checksum, NOT checksummed

   The reader computes the expected checksum over the byte range
   [16, filesize-4) (0x00683580 called with skip_front=0x10, skip_back=4 at
   VA 0x00927011) and compares it against the trailing dword; mismatch logs
   "[warn] PersistentGameData checksum invalid!" and fails.  The writer feeds
   the checksum every dword/byte it writes after the magic and before the
   trailing dword.  The two ranges agree exactly.

   cap_word semantics (this is the field that is easy to guess wrong):
   the reader uses it as a BYTE cap on the payload cursor, not as a payload
   size.  Section 1 (0x0092716[5]): `cmp edi, cap ; jae break` with `inc edi`
   over 1-byte elements.  Section 2 (0x009271f5): the same compare against a
   cursor advanced by 4 per element (`add edi, 4` at 0x00927225).  The writer
   emits cap = count for section 1 and cap = count*4 for every other fixed
   section, even the byte-valued ones, so for sections 4..7 and 10 the cap is
   four times the payload it actually writes and never binds.  Do not call
   this field a size.

   count_word is the loop count (`cmp ebx, count ; jb`) and is separately
   range-checked against the compiled-in expectation with a non-fatal warning
   ("Different number of achievements %d/%d", 0x00927147).  The store itself
   is clamped to the compiled-in count (`cmp edi, 0x282 ; jae skip_store` at
   0x00927179), so a longer file is consumed but not stored.

   Bool normalisation is ASYMMETRIC and provable:
     write 0x009283d0 `setne` -> any non-zero byte becomes 1
     read  0x00927185 `setg`  -> SIGNED > 0, so 0x80..0xff read back as 0
   ---------------------------------------------------------------------------
   CHECKSUM

   0x00683410 is a two-mode accumulator over a 16-byte state.  The save/load
   path always seeds mode 1 (0x009282ec / 0x006835ed) so the shipped format
   uses the CRC branch; mode 0 is the legacy rotate-add fold and is retained
   here because the finalize tail at 0x00928e81 still contains it.

   Mode 1 per call:  acc = ~fold(~acc, bytes), fold = reflected byte loop
                     `r = (r >>> 8) ^ table[(r ^ b) & 0xff]`
                     (`shr ebx, 8` = C1 EB 08 at 0x0068355e: UNSIGNED).
                     len == 0 leaves acc unchanged (two `not`s, 0x00683548 and
                     0x0068356f).
   Mode 0 per byte:  buffer[partial++] = b; on partial == 4,
                     acc = ror32(acc,1) + le32(buffer), partial = 0.
   Any other mode:   no change at all (0x0068346e `cmp eax,1 ; jne epilogue`).

   THE TABLE IS NOT THE STANDARD CRC-32 TABLE.  The generator at 0x00683483
   uses the reflected polynomial constant 0xEDB88320, but only round 1 shifts
   logically (`shr eax,1` = D1 E8 at 0x00683490); rounds 2..8 use an
   ARITHMETIC shift (`sar` = D1 FA at 0x006834a5 / 0x006834cf / 0x00683523),
   so the sign bit propagates and table[1] is 0x09073096, not 0x77073096.
   Both table generators in this image (0x00683483 and 0x006ef201) have the
   same shape, so both produce this same non-standard table.

   The task asked whether the save path reuses the state CRC-32 at 0x006ef2c3.
   It does not, and the difference is provable three ways:
     - different routine: 0x006ef2c3 is a fixed 6-bytes-per-iteration unrolled
}


   v12 (this unit) peels the freestanding MSVC tree iterator++ at
   0x00414a80 (identify-zhl-address: 0 exact matches; address-stable
   PGDTREE). Body 0x00414a80..0x00414ad2, 83 bytes, two `ret`s
   (parent-climb 0x00414ab0 / leftmost 0x00414ad2), ZERO host calls
   (0 E8, 0 indirect). Whole-.text E8 rel32 census: 134 call sites,
   5 in the PGD cluster 0x00926000..0x0092c000 (writer bestiary emit
   0x00928bf9/0x00928cbc/0x00928d7f/0x00928e49 and 0x0092af9a).
   Node layout: left@0 parent@4 right@8 isnil@0xd. Right-nil (LOW
   BYTE of [right+0xd] != 0) climbs parents while current is a right
   child; else walks leftmost of the right subtree. Same algorithm
   as Exit's isaac_exit_tree_iterator_next. The red-black insert/
   erase/IO around those sites stay host.
   Evidence VAs retained: 0x0092b6d3 0x009272b5 0x009273dd 0x0091ae6a 0x00927d04 0x0092a520 0x0092b230 0x0092b270.
   v3 PROMOTION VERDICTS. Meaning NOT promoted. Nothing above promotes a NAME.
   NEGATIVE result recorded in writing. Reproduce, do not repair; must not be
   "corrected". Unidentified but kept address-stable. The magic is
   ISAACNGSAVE09R. NOT the standard CRC-32 table (table[1] is 0x09073096);
   seed 0xFEDCBA76. LOW byte of the single argument. Event counters are
   0x20b dwords. Map erase order is slot 3, slot 0, slot 2, slot 1.
   Whole-.text census: 2,094,216 instructions, 469 resyncs. CORRECTED at v8
   by a whole-image rel32 call census. Sibling snapshot reader 0x0041d670
   and ctor 0x0041d560. Import reader is exactly ONE site, not the sibling's.
   Probe dword is dereferenced UNCONDITIONALLY. Return is 0 only on the
   read-failure arm. The single stack argument is NEVER read. EXACTLY two
   call sites for each snapshot ctor. LAW-FIXED AT v9: collection copy is
   0x1ba bytes (VA 0x0041d9dc / 0x0092bae0). 23 blocks + 2 remap loops.

 
   CRC tables live at 0x00c7e860 (save) and 0x00c7ec70 (state).
   v7 law-fix of the sibling collection width. Sibling event remap holes:
   0x4, 0x28, 0x36, 0x44, 0x52, 0x60, 0x6e, 0x81, 0x8f, 0x9d.
   Section-11 tag table at 0x00927d04. ABI v4 remap land stays.
   CORRECTED at v8 by a whole-image rel32 call census.
   Tail returns 0 only on the read-failure path.
   PGDCLMP: SIGNED `cmovg`; +0x494 is BEFORE +0x490.

   v12 (this unit) is the MSVC tree successor 0x00414a80 — previously
   ISAAC_PGD_HOST_VA_TREE_NEXT. Body 0x00414a80..0x00414ad2 (two rets,
   0x53 bytes, 36 insns), ZERO host calls (0 E8, 0 indirect).
   identify-zhl-address: 0 exact matches. Whole-.text E8 rel32 census
   (2,094,319 insns, 469 resyncs): EXACTLY 134 call sites, five in the
   PGD cluster (0x00928bf9 / 0x00928cbc / 0x00928d7f / 0x00928e49 /
   0x0092af9a). int3 pad 0x00414ad3..0x00414adf; next island 0x00414ae0
   (0x18-stride destroy loop calling 0x0040d040). Do NOT full-peel
   0x009292c0 (already host, 531 insns). This unit translates PGDTREE:
   BYTE isnil at +0xd, right-live je onto leftmost-of-right, else
   parent-climb while current is the right child. Map insert/erase stay
   host. No identification verdict moved.

   v13 (this unit) translates PGDTROW: the writer's bestiary tree-row
   walk inside pgd_write_stream_009282e0 (0x009282e0, a v1 root). The
   serializer drains the four std::map<int,int> bestiary maps (header
   offsets +0xf7c / +0xf6c / +0xf74 / +0xf64, count words +0xf80 / +0xf70
   / +0xf78 / +0xf68) row by row via the v12 iterator++ law (0x00414a80).
   Four structurally identical walks; this unit laws the ROW WALK shape:
     - row cell = [pgd+header_off] (map header node address);
       begin = [cell] = header->_Left (leftmost = begin()).
     - empty gate: cmp begin, cell ; je skip — plain unsigned equality
       (empty tree has _Left == header); the walk is skipped.
     - per row: key dword at node+0x10, value dword at node+0x14 (both
       stream writes + checksums stay host), then `lea ecx,[ebp-0x24] ;
       call 0x414a80` (iterator++ on the cell).
     - loop-back: cmp node, [pgd+header_off] ; jne loop — unsigned
       inequality vs the header (end() == header in MSVC).
     - row stride (node size) = 0x18, cross-proved by the destroy
       row-walk 0x00414ae0 (add esi,0x18) and the node-index helper
       0x00414b10 (lea ecx,[eax+eax*2] ; shl ecx,3 = i*24).
   Walk order = tag order: step s drains slot pgdBestiarySubmapPair(s)
   and emits tag pgdBestiarySubmapTag(s) — the v3 reader-side pair/tag
   tables, now writer-proved. Sibling evidence: alt transport 0x0091adf0
   walks slot 0 with the same shape (call 0x91b2f9, loop-back 0x91b304,
   plus a count-word gate 0x91b278), and the reader-side walk 0x92af9a
   uses the same iterator++ row shape. Census: 0x00414ae0 has ONE image
   caller (0x685330, generic STL _Destroy_range — not PGD-reachable);
   0x0040d040 has 1288 sites (generic SSO string dtor); the PGD cluster
   reaches exactly three tree-region targets: 0x414730 / 0x414870 /
   0x414a80 (the first two are generic container helpers with host
   indirect calls — out of scope). Stream writes and checksums stay
   host; no identification verdict moved.

   v14 (this unit) translates PGDSC11: the section-11 SUB-BLOCK FRAMING
   inside the same writer 0x009282e0 (before the v13 row walks) plus the
   reader-side gates in the section-11 handler 0x009276e1. The writer
   frames section 11 immediately after the ten fixed sections:
     - 0x928aa6..0x928ac1  total = c0 + (c1 + (c2 + c3)) — the four
       bestiary count words are summed in machine order
       `mov ecx,[edi+0xf78]; add ecx,[edi+0xf80]; add ecx,[edi+0xf70];
       mov eax,[edi+0xf68]; add eax,ecx`, 32-bit wrap on every add
       (slot 2 + slot 3 + slot 1 + slot 0).
     - 0x928ac3  id store: `mov [ebp-0x10], 0xb` (section id 11).
     - 0x928acd  count_word = total is STORED to [ebp-0xc] but NEVER
       streamed — dead store. The THIRD streamed header dword is the
       sub-block count 4 (`mov [ebp-0x20], 4` @ 0x928b20, written by
       the 0x928b2c vtable call), which the reader consumes as its
       sub-block loop bound ([ebp-0x7c] @ 0x927791). So the header is
       [id=11][cap=total<<2][sub-blocks=4], NOT [id][cap][count].
     - 0x928ad0  cap_word = total << 2 (`shl eax,2`), written at
       0x928b01 after id.
   Per walk step s (v13 order, slots 3,1,2,0), before the row walk the
   writer streams the sub-block tag (4,2,3,1 @ 0x928b4b/0x928c11/
   0x928cd4/0x928d97) and the sub-block cap word = count[count-off of
   the walk's slot] << 2 (0x928b6e..0x928b7a, 0x928c34..0x928c40,
   0x928cf7..0x928d03, 0x928dba..0x928dc6). Reader 0x9276e1 gates:
     - subcount zero gate: `cmp [ebp-0x7c],0; jbe` — UNSIGNED, skip
       the whole section when subcount == 0.
     - tag gate: tag is read, `dec eax; cmp eax,3; ja` — (tag-1) > 3
       UNSIGNED is invalid; valid tags 1..4 (matches pgdBestiary-
       SlotFromTag: slot = tag-1).
     - per sub-block cap gate: `test eax,eax; jle` — SIGNED cap > 0
       required; then rows = cap >> 2 via `shr eax,2` (UNSIGNED).
     - sub-block loop-back: `inc [ebp-0x78]; cmp eax,subcount; jb`
       — UNSIGNED index < subcount continues.
     - row loop-back: `cmp ebx,rows; jl` — SIGNED index < rows
       continues (rows == cap>>2 and cap was gated SIGNED > 0, so rows
       stays below 2^31; the machine still uses jl).
   Stream writes and checksums stay host; the framing arithmetic and
   every gate are pure. Evidence VAs in ISAAC_PGDSC11_*; cross-law vs
   the v13 row-walk order and the v2/v3 bestiary pair/tag tables.

   v15 (this unit) lands PGDCP: the reader-side bestiary COUNT-PROBE
   0x0092aea0 .. 0x0092b061 (ret 8; entry address-stable — identify-zhl
   0 exact matches; three inbound E8 sites image-wide: 0x006c10bf,
   0x006ca239, and the probe's own recursive 0x92b03c — NOT dead). The
   probe's pure surface, transcribed as laws over SAMPLED inputs
   (the game-state tree walk, the +0x15/+0x17c flags and the 0x9595e0
   callback stay host after the pure gates):
     - probe_blocked: entry gate `cmp byte [ebx+1],0 ; jne fail`
       (0x92aeae/0x92aeb2) — the probe aborts (returns 0) when the
       LOW BYTE of pgd+1 (readonly flag) is non-zero.
     - eligible: the per-element count decision in the derivation loop
       (0x92af78..0x92af95). gate1 `cmp dword [ecx+0x7c],0 ; jl skip`
       (0x92af78/0x92af7c) — SIGNED < 0 is not counted. gate2
       `movss xmm0,[ecx+0x68] ; ucomiss xmm0,xmm1 ; lahf ; test
       ah,0x44 ; jnp skip` (0x92af7e..0x92af8a, xmm1=+0.0f from
       `xorps xmm1,xmm1` @0x92af75) — AH after lahf holds ZF@bit6 and
       PF@bit2; `test ah,0x44` leaves exactly those two bits; jnp
       falls through ONLY on the ordered-equal row (ZF=1,PF=0 — x ==
       +/-0.0f, NOT NaN; the (0,0) greater/less rows and the (1,1)
       unordered row both skip). So the float gate is IEEE equality
       with +0.0f. gate3 `cmp byte [ecx+0x100],0 ; je skip`
       (0x92af8c/0x92af93) — LOW BYTE of the element flag must be
       non-zero. All three must pass for the `inc edi` (0x92af95).
     - store_needed / effective: `mov edi,[0xc7f508] ; test edi,edi ;
       jne skip` (0x92af55/0x92af61/0x92af63) — the walk runs and
       `mov [0xc7f508],edi` (0x92afad) executes ONLY when the cached
       global is ZERO; otherwise the cached value survives untouched.
       effective = cached != 0 ? cached : derived (the known
       recapture-on-one-path defect class: the PE does NOT recapture
       on the cached path).
     - proceed: `cmp [ebx+0xf68],edi ; jb skip` (0x92afb3/0x92afb9)
       — UNSIGNED; the game-state block (0x92afbb..0x92b017: the
       +0x15 / +0x17c flags, 0x9595e0, 0x929790/0x9589d0,
       0x9296c0/0x92a350, all host) runs only when the bestiary
       slot-0 count word (pgd+0xf68) is >= the derived count.
   The derivation loop itself reuses the v12 iterator++ law
   (0x0092af9a -> 0x414a80) with the v13 row-walk shape: header
   pointer loaded ONCE from [game+0x2a670] (0x92af65), begin=[header],
   empty gate begin==header (0x92af71/0x92af73), loop-back node !=
   header (0x92afa3/0x92afa5). Game receiver global 0xc7169c, count
   global 0xc7f508 (`.data` VA 0xbf8000 raw 0x7f6000: raw offsets
   0x86f69c / 0x87d508). No identification verdict moved.

   v18 (this unit) lands PGDADDKILL: the write-side bestiary mutator
   `PersistentGameData::AddBestiaryKill(EntityType, EntityVariant)`
   0x0092acb0..0x0092adfd (EXACT ZHL match, 15 pattern bytes; ret 8
   @0x92adf2 ok / @0x92adfd fail; four inbound E8 sites 0x4c8618,
   0x59f451, 0x7a0946, 0x92b047 — the v15 PGDCP probe's own call is
   one of them, NOT dead; next island 0x92aea0 = the landed v15 PGDCP).
   The pure laws over sampled inputs: the entry fail gates (readonly
   LOW BYTE != 0, rec_found == 0, gate_byte LOW BYTE == 0, in that
   order — otherwise the function returns 1 ALWAYS, TryUnlock's return
   discarded), the `((w0<<12)|w1)<<8` key, the three node gates
   (marker LOW BYTE / SIGNED key / node != header), the WRITE-side
   store decision (node_ok ? old+1 mod 2^32 : 1 — INSERT on gate
   fail, opposite of the getters), the byte-table dispatch
   (idx = type - 0x10f UNSIGNED > 0x85 -> case 3, else
   byte_table[idx] {0->0, 1->0, 0x23->1, 0x85->2, else->3}), the
   unlock gates (case0 sum >= 0xa UNSIGNED, case1/2 count >= 0x14
   UNSIGNED, case3 never) and unlock ids (0->0x175, 1->0x15d,
   2->0x164, 3->0). Container find 0x695030, map find 0x4288a0,
   value-slot accessor 0x92ca70, kill getter 0x92b100 and TryUnlock
   0x929a20 stay HOST. The jump table @0x92ae00 {0x92adb9, 0x92ad81,
   0x92ad9d, 0x92adea} and the byte table @0x92ae10 (0x86 entries)
   were re-read byte-for-byte from the image. No identification
   verdict moved.

   v19 (this unit) lands PGDADDSIB2 + PGDADDSIB3: the slot-2 and
   slot-3 sibling AddBestiary* write mutators 0x0092aaf0 + 0x0092abd0
   (each ret 8, wrapper) paired with their store helpers 0x0092ab40 +
   0x0092ac20 (each ret 4). The v18 handoff guessed these four were
   full AddBestiaryKill-shaped bodies with their own unlock
   dispatches; the machine is TWO wrapper/helper pairs instead (zero
   ZHL matches, ALL FOUR — address-stable names; no unlock dispatch,
   no kill-count getter anywhere in the set). Each wrapper: readonly
   gate `cmp byte [esi+1],0`, container find 0x695030 on
   [0xc7169c]+0x2a670, rec null gate, gate byte +0xe8 LOW BYTE gate,
   key `((w0<<12)|w1)<<8`, then calls its helper with the key on the
   stack; the wrapper returns the helper's bool. Each helper: aligned
   frame prologue `55 8b ec 83 e4 f8 83 ec 10`, its OWN readonly gate
   (the same pgd+1 byte, checked a second time as a separate sampled
   input), map find 0x4288a0 on the slot header (slot-2 base 0xf74 =
   ISAAC_PGD_BESTIARY_OFF_ROOT_2, slot-3 base 0xf7c =
   ISAAC_PGD_BESTIARY_OFF_ROOT_3), the three node gates, then
   WRITE-side store: found `inc dword [eax]` (old+1 mod 2^32),
   not-found `mov dword [eax],1` (INSERT); BOTH store paths return
   al=1, only the helper's readonly gate returns 0. Host residual
   (named blocker): container find 0x695030, map find 0x4288a0,
   value-slot accessor 0x92ca70. Inbound callers (direct E8 rel32):
   0x92aaf0 <- 0x774461, 0x92abd0 <- 0x7780c8 (each wrapper has one
   image caller, NOT dead); the helpers' only callers are their own
   wrappers (0x92ab2e / 0x92ac0e). No identification verdict moved.

   v20 landed PGDADDCH: the `PersistentGameData::AddChallenge`
   flag-and-unlock dispatcher 0x0092a7b0 (EXACT ZHL match, 9 pattern
   bytes, `__thiscall void AddChallenge(int challengeID)`; ret 4
   @0x92aa2c; one ALIVE image caller 0x704f84, byte-scan verified).
   Semantics: set the challenge-completed flag byte at
   `pgd + 0xe6f + challengeID` to 1, then tail-call
   `PersistentGameData::TryUnlock` (0x929a20, THIS stays HOST) with a
   challenge->achievement mapping fetched from a 45-entry jump table
   @0x92aa30. Dispatcher gates in machine order: readonly LOW BYTE
   gate `cmp byte [ecx+1],0 ; jne fail` (0x92a7b3/0x92a7ba); arg gate
   `cmp eax,0x2d ; ja fail` UNSIGNED (0x92a7c0/0x92a7c3); flag store
   `mov byte [eax+ecx+0xe6f],1` @0x92a7c9 (runs BEFORE the dispatch
   gate — arg 0 STOREs the flag byte but never unlocks); then
   `dec eax ; cmp eax,0x2c ; ja fail` (0x92a7d1/0x92a7d2/0x92a7d5:
   (arg-1) UNSIGNED > 0x2c fails, so arg 0 ends here) and
   `jmp dword [eax*4+0x92aa30]` @0x92a7db. The 45 table arms
   (0x92a7e2..0x92aa1e, stride 13) are `mov [ebp+8],<id> ; pop ebp ;
   jmp 0x929a20` (tail-call TryUnlock with the achievement id, this =
   ecx unchanged). Unlock ids by arg 1..45 (idx = arg-1, table re-read
   dword-for-dword from the image AND cross-checked against the arm
   immediates): 0x59 0x5a 0x5b 0x5c 0x5d 0x5e 0x78 0x60 0x61 0x62
   0x63 0x64 0x3c 0x3f 0x65 0x66 0x67 0x68 0x3e 0x5f 0xe0 0xe1 0xe2
   0xe3 0xe4 0xe5 0xe6 0xe7 0xe8 0xe9 0x14b 0x14c 0x14d 0x14e 0x14f
   0x205 0x206 0x207 0x208 0x209 0x20a 0x213 0x214 0x215 0x21a.
   The +0xe6f flag array is the challenges byte map
   (ISAAC_PGD_OFF_CHALLENGES = 0xe6f, ISAAC_PGD_COUNT_CHALLENGES =
   0x2e = 46, args 0..0x2d = 0x2e values — exact fit). The dispatch
   range is 1..0x2d = 45 = table entries. Host residual (named
   blocker): TryUnlock 0x929a20 (the tail-call target). Inbound
   caller: 0x92a7b0 <- 0x704f84. No identification verdict moved.

   v21 (this unit) lands PGDADDBOSS: the `PersistentGameData::AddBoss`
   flag-and-unlock mutator 0x0092a5e0 (EXACT ZHL match, 12 pattern
   bytes, `__thiscall void AddBoss(int bossID)`; ret 4 @0x92a79f;
   two ALIVE image callers 0x7fc01f / 0x7ff7a8, byte-scan verified;
   int3 pad @0x92a7a2 — the dump at 0x92a700 lands mid-instruction).
   Semantics: mark the boss-killed flag byte at `pgd + 0xe07 + bossID`
   to 1, set the pgd+0 dirty byte (ISAAC_PGD_OFF_CHANGES_MADE) to 1,
   log `"Boss %d added to SaveState\n"` via the host helper 0xa112c0
   (cdecl, args 1/0xb7ae90/bossID), then run eight sequential
   byte-gated `PersistentGameData::TryUnlock` calls (0x929a20, THIS
   stays HOST) whose gate flag sets are all-key-nonzero AND-gates.
   Entry gates in machine order: readonly LOW BYTE gate `cmp byte
   [esi+1],0 ; jne fail` (0x92a5e6/0x92a5ea); arg gate `cmp eax,0x68
   ; jge fail` SIGNED with NO floor (0x92a5f3/0x92a5f6: negative
   bossIDs pass and wrap the store offset — the same signed-ceiling
   law the v16-era isaac_pgd_boss_index_valid already recorded);
   flag store `mov byte [eax+esi+0xe07],1` @0x92a602 (base 0xe07 =
   ISAAC_PGD_OFF_BOSSES, 0x68 values 0..0x67 = ISAAC_PGD_COUNT_BOSSES
   — exact fit); dirty store `mov byte [esi],1` @0x92a60c. The eight
   unlock blocks (all bytes nonzero required, `cmp byte,0 ; je skip`):
   B1 0x92a617 e08,e09,e14,e18,e33,e3f -> 0x56; B2 0x92a656
   e0a,e0b,e15,e23,e36,e34 -> 0x57; B3 0x92a695 e0c,e0d,e16,e37,e35
   -> 0x58; B4 0x92a6cb e26 -> 0xf; B5 0x92a6dd e10,e11,e12,e13,e2d
   -> 0x174; B6 0x92a716 e54,e52,e53,e62 -> 0x19c; B7 0x92a746
   e5a,e57,e51,e59 -> 0x19d; B8 0x92a776 e0d,e56,e58 -> 0x19e (e0d
   is read by BOTH B3 and B8 — the machine re-reads; the laws do
   too). Host residual (named blockers): TryUnlock 0x929a20 and the
   log helper 0xa112c0. No identification verdict moved.

   v22 (this unit) lands PGDADDMINI: the `PersistentGameData::AddMiniBoss`
   mutator 0x0092a520 (no exact ZHL; self-named by its own warning
   string "[warn] AddMiniBoss: invalid miniboss id %d" @0xb7aecc —
   address-stable; ret 4 @0x92a5d3; callers 0x7ffff1 / 0x800010
   byte-scan verified). Readonly LOW BYTE gate 0x92a529/0x92a52d; id
   window `cmp eax,0xf ; ja warn` UNSIGNED 0x92a533/0x92a536 (above
   0xf logs the warning with the ORIGINAL id and returns; negatives
   warn too); id->index fold 0x92a53c..0x92a557 (7..0xd fold to 0..6
   via `lea ecx,[eax-7] ; cmp ecx,6 ; ja`; 0xe aliases to 6 via
   `mov eax,6`; 0..6 used directly; 0xf dropped SILENTLY via signed
   `cmp eax,6 ; jg` — no store, no log); flag store byte
   [pgd+0xe00+idx]=1 @0x92a55f (0xe00 = ISAAC_PGD_OFF_SEC5_BYTES,
   7 slots = ISAAC_PGD_COUNT_SEC5); dirty [pgd]=1 @0x92a569; host log
   (1, 0xb7aeac, idx) @0x92a56c; ALL-SET gate over the seven flags
   0xe00..0xe06 (@0x92a574..0x92a5b1) -> `push 0x16 ; mov ecx,esi ;
   call 0x929a20` (TryUnlock, stays HOST). Matches the v2 PGDX
   sec5 behaviour oracle exactly; v22 adds the branch-level evidence
   and makes the warn/silent distinction explicit. Host residual:
   TryUnlock 0x929a20 and the log helper 0xa112c0. No identification
   verdict moved.

*/

enum {
  ISAAC_PGD_IMPORT_VA = 0x0092b2e0u,
  ISAAC_PGD_IMPORT_READER_VA = 0x009e4260u,
  ISAAC_PGD_IMPORT_SNAPSHOT_BYTES = 0x4f0,
  ISAAC_PGD_IMPORT_CLEAR_CALL_VA = 0x0092b5cau,
  ISAAC_PGD_IMPORT_CLEAR_TARGET_VA = 0x009262b0u,
  ISAAC_PGD_IMPORT_CALLER_VA = 0x00926bd5u,
  ISAAC_PGD_IMPORT_LAST_ARRAY_STORE_VA = 0x0092b73fu,
  ISAAC_PGD_IMPORT_COPY_BLOCK_ROWS = 23,
  ISAAC_PGD_IMPORT_COPY_ROWS = 25,
  ISAAC_PGD_IMPORT_WRITTEN_ACHIEVEMENTS = 0xb3,
  ISAAC_PGD_IMPORT_WRITTEN_EVENT = 0x17c,
  ISAAC_PGD_IMPORT_WRITTEN_COLLECTION = 0x15b,
  ISAAC_PGD_IMPORT_WRITTEN_SEC3 = 0x30,
  ISAAC_PGD_IMPORT_WRITTEN_SEC5 = 7,
  ISAAC_PGD_IMPORT_WRITTEN_BOSSES = 0x39,
  ISAAC_PGD_IMPORT_WRITTEN_CHALLENGES = 0x15,
  ISAAC_PGD_IMPORT_WRITTEN_SEC8 = 0x50,
  ISAAC_PGD_IMPORT_WRITTEN_SEC9 = 4,
  ISAAC_PGD_IMPORT_WRITTEN_SEC10 = 0,
  ISAAC_PGD_IMPORT_WRITTEN_BESTIARY = 0,
  ISAAC_PGD_IMPORT_WRITTEN_SAVE_COUNTER = 0,
  ISAAC_PGD_IMPORT_KIND_REMAP_EVENT = 2,
  ISAAC_PGD_IMPORT_KIND_REMAP_SEC3 = 3,
  ISAAC_PGD_SIBLING_VA = 0x0092b930u,
  ISAAC_PGD_SIBLING_READER_VA = 0x0041d670u,
  ISAAC_PGD_SIBLING_SNAPSHOT_CTOR_VA = 0x0041d560u,
  ISAAC_PGD_SIBLING_SNAPSHOT_BYTES = 0x700,
  ISAAC_PGD_SIBLING_CLEAR_CALL_VA = 0x0092ba19u,
  ISAAC_PGD_SIBLING_CLEAR_TARGET_VA = 0x009262b0u,
  ISAAC_PGD_SIBLING_CALL_SITES = 2,
  ISAAC_PGD_SIBLING_EVENT_REMAP_VA = 0x0041ddb0u,
  ISAAC_PGD_SIBLING_EVENT_REMAP_TABLE_VA = 0x0041e190u,
  ISAAC_PGD_SIBLING_EVENT_REMAP_DEFAULT_ARM_VA = 0x0041e18au,
  ISAAC_PGD_SIBLING_EVENT_REMAP_BOUND = 0xa0,
  ISAAC_PGD_SIBLING_EVENT_REMAP_ENTRIES = 0xa1,
  ISAAC_PGD_SIBLING_EVENT_REMAP_MAX_INPUT = 0xa1,
  ISAAC_PGD_SIBLING_EVENT_REMAP_MAX_SLOT = 0xab,
  ISAAC_PGD_SIBLING_EVENT_RESTORE_ITERATIONS = 0xa2,
  ISAAC_PGD_SIBLING_LAST_ARRAY_STORE_VA = 0x0092bbe0u,
  ISAAC_PGD_SIBLING_COPY_BLOCK_ROWS = 30,
  ISAAC_PGD_SIBLING_COPY_ROWS = 31,
  ISAAC_PGD_SIBLING_WRITTEN_ACHIEVEMENTS = 0x115,
  ISAAC_PGD_SIBLING_WRITTEN_EVENT = 0x288,
  ISAAC_PGD_SIBLING_WRITTEN_COLLECTION = 0x1ba,
  ISAAC_PGD_SIBLING_WRITTEN_SEC3 = 0x30,
  ISAAC_PGD_SIBLING_WRITTEN_SEC5 = 7,
  ISAAC_PGD_SIBLING_WRITTEN_BOSSES = 0x43,
  ISAAC_PGD_SIBLING_WRITTEN_CHALLENGES = 0x1f,
  ISAAC_PGD_SIBLING_WRITTEN_SEC8 = 0x58,
  ISAAC_PGD_SIBLING_WRITTEN_SEC9 = 4,
  ISAAC_PGD_BESTIARY_NODE_MARKER_OFF = 0xd,
  ISAAC_PGD_READER_TAIL_VA = 0x00927c8au,
  ISAAC_PGD_READER_FAIL_VA = 0x00927ca0u,
  ISAAC_PGD_READER_PRE_SECTION_READ_VA = 0x00927091u,
  ISAAC_PGD_FIELD_UNKNOWN_OFFSET = 0,
  ISAAC_PGD_FIELD_NAMED = 1,
  ISAAC_PGD_FIELD_LAYOUT_ONLY = 2,
  ISAAC_PGD_REPR_NONE = 0,
  ISAAC_PGD_REPR_BOOL_BYTE = 1,
  ISAAC_PGD_REPR_RAW_DWORD = 2,
  ISAAC_PGD_PRE_SECTION_WORD_SITES = 5,
  ISAAC_PGD_PRE_SECTION_WORD_ACCESSORS = 0,
  ISAAC_PGD_ALT_TRANSPORT_FIELDS = 8,
  ISAAC_PGD_ALT_TRANSPORT_VA = 0x0091adf0u,
  ISAAC_PGD_ALT_BITPACK_VA = 0x0091b650u,
  ISAAC_PGD_ALT_HOST_VA_ALLOC = 0x00a648b0u,
  ISAAC_PGD_ALT_HOST_VA_MEMSET = 0x00af05e5u,
  ISAAC_PGD_NOTIFY_VA = 0x00929790u,
  ISAAC_PGD_NOTIFY_FORMAT_VA = 0x0041e420u,
  ISAAC_PGD_NOTIFY_BUFFER_BYTES = 8,
  ISAAC_PGD_NOTIFY_ENABLE_GLOBAL_VA = 0x00c5ab08u,
  ISAAC_PGD_NOTIFY_ENABLE_MASK = 1,
  ISAAC_PGD_NOTIFY_SINGLETON_VA = 0x00bf93c8u,
  ISAAC_PGD_NOTIFY_VTBL_OFF_A = 0x18,
  ISAAC_PGD_NOTIFY_VTBL_OFF_B = 0x24,
  ISAAC_PGD_CLEAR_VA = 0x009262b0u,
  ISAAC_PGD_CLEAR_FLAG_02_VALUE = 1,
  ISAAC_PGD_FLAG_02_STORES_IN_CLUSTER = 1,
  ISAAC_PGD_FLAG_02_LOADS_IN_CLUSTER = 3,
  ISAAC_PGD_SEC3_REMAP_VA = 0x009e4f80u,
  ISAAC_PGD_SEC3_REMAP_TABLE_VA = 0x009e4fccu,
  ISAAC_PGD_SEC3_REMAP_DEFAULT_ARM_VA = 0x009e4fc9u,
  ISAAC_PGD_SEC3_REMAP_BOUND = 0xa,
  ISAAC_PGD_SEC3_REMAP_ENTRIES = 11,
  ISAAC_PGD_SEC3_REMAP_MAX_INPUT = 11,
  ISAAC_PGD_SEC3_REMAP_MAX_SLOT = 11,
  ISAAC_PGD_EVENT_REMAP_VA = 0x009e3ea0u,
  ISAAC_PGD_EVENT_REMAP_TABLE_VA = 0x009e40e8u,
  ISAAC_PGD_EVENT_REMAP_DEFAULT_ARM_VA = 0x009e40e5u,
  ISAAC_PGD_EVENT_REMAP_BOUND = 0x5d,
  ISAAC_PGD_EVENT_REMAP_ENTRIES = 94,
  ISAAC_PGD_EVENT_REMAP_MAX_INPUT = 94,
  ISAAC_PGD_EVENT_REMAP_MAX_SLOT = 113,
  ISAAC_PGD_BULK_RESTORE_VA = 0x0092b346u,
  ISAAC_PGD_SEC3_RESTORE_ITERATIONS = 0xc,
  ISAAC_PGD_EVENT_RESTORE_ITERATIONS = 0x5f,
  ISAAC_PGD_SEC3_REMAP_CALL_SITES = 1,
  ISAAC_PGD_EVENT_REMAP_CALL_SITES = 1,
  ISAAC_PGD_SEC3_RESTORE_SLOTS_UNWRITTEN = 3,
  ISAAC_PGD_EVENT_RESTORE_SLOTS_UNWRITTEN_BELOW_MAX = 19,
  ISAAC_PGD_SEC3_RESTORE_ALIASED_SLOTS = 1,
  ISAAC_PGD_EVENT_RESTORE_ALIASED_SLOTS = 0,
  ISAAC_PGD_SEC3_RESTORE_ALIASED_SLOT = 0,
  ISAAC_PGD_SEC3_RESTORE_ALIAS_LOSER = 0,
  ISAAC_PGD_SEC3_RESTORE_ALIAS_WINNER = 10,
  ISAAC_PGD_REMAP_GUARD_VALUE = -1,
  ISAAC_PGDCLR_VA = 0x009262b0u,
  ISAAC_PGDCLR_RET_VA = 0x0092645du,
  ISAAC_PGDCLR_MEMSET_VA = 0x00af05e5u,
  ISAAC_PGDCLR_MAP_ERASE_VA = 0x0042c8e0u,
  ISAAC_PGDCLR_ZERO_ROWS = 11,
  ISAAC_PGDCLR_COND_ROW_OFF = 0xf88,
  ISAAC_PGDCLR_COND_ROW_LEN = 4,
  ISAAC_PGDCLR_COND_ROW_VA = 0x009262c8u,
  ISAAC_PGDCLR_GATE_VA = 0x009262c6u,
  ISAAC_PGDCLR_MAP_ROWS = 4,
  ISAAC_PGDCLR_TAIL_STORES = 3,
  ISAAC_PGDCLR_GAP_OFF = 0xe9d,
  ISAAC_PGDCLR_GAP_LEN = 3,
  ISAAC_PGDCLR_CALL_SITES = 11,
  ISAAC_PGDCLR_STATUS_ZEROED = 1,
  ISAAC_PGDCLR_STATUS_ZEROED_IF_ARG = 2,
  ISAAC_PGDCLR_STATUS_SET_ONE = 3,
  ISAAC_PGDCLR_STATUS_STRUCT_RESET = 4,
  ISAAC_PGD_TAIL_STEPS = 10,
  ISAAC_PGD_TAIL_KIND_WRITE = 1,
  ISAAC_PGD_TAIL_KIND_HOST_CALL = 2,
  ISAAC_PGD_TAIL_KIND_EVENT = 3,
  ISAAC_PGD_TAIL_KIND_GATE = 4,
  ISAAC_PGD_TAIL_KIND_SAVE_SELECT = 5,
  ISAAC_PGD_TAIL_KIND_SAVE = 6,
  ISAAC_PGD_TAIL_HOST_VA_9296C0 = 0x009296c0u,
  ISAAC_PGD_TAIL_HOST_VA_9292C0 = 0x009292c0u,
  ISAAC_PGD_TAIL_EVENT_VA = 0x00929b40u,
  ISAAC_PGD_TAIL_EVENT_ARGS = 0,
  ISAAC_PGD_TAIL_SAVE_STEAM_VA = 0x00928ee0u,
  ISAAC_PGD_TAIL_SAVE_LOCAL_VA = 0x009294f0u,
  ISAAC_PGD_TAIL_PROBE_GLOBAL_VA = 0x00b18a1cu,
  ISAAC_PGD_TAIL_PROBE_ARG = 0x00c5c3a4u,
  ISAAC_PGD_TAIL_GAME_GUARD_OFF = 0x2a378,
  ISAAC_PGD_TAIL_GAME_2A3A4_OFF = 0x2a3a4,
  ISAAC_PGDCT_VA = 0x0041d560u,
  ISAAC_PGDCT_RET_VA = 0x0041d667u,
  ISAAC_PGDCT_MEMSET_VA = 0x00af05e5u,
  ISAAC_PGDCT_SNAPSHOT_BYTES = 0x700,
  ISAAC_PGDCT_ZERO_ROWS = 10,
  ISAAC_PGDCT_STOSD_ROW = 3,
  ISAAC_PGDCT_STOSD_DWORDS = 0xa2,
  ISAAC_PGDCT_TOTAL_ZEROED_BYTES = 0x6a3,
  ISAAC_PGDCT_SET_ONE_OFF = 0x6e4,
  ISAAC_PGDCT_SET_ONE_VALUE = 1,
  ISAAC_PGDCT_GAP_COUNT = 6,
  ISAAC_PGDCT_CALL_SITES = 2,
  ISAAC_PGDICT_VA = 0x009e3dc0u,
  ISAAC_PGDICT_RET_VA = 0x009e3e97u,
  ISAAC_PGDICT_MEMSET_VA = 0x00af05e5u,
  ISAAC_PGDICT_SNAPSHOT_BYTES = 0x4f0,
  ISAAC_PGDICT_ZERO_ROWS = 9,
  ISAAC_PGDICT_STOSD_ROW = 3,
  ISAAC_PGDICT_STOSD_DWORDS = 0x5f,
  ISAAC_PGDICT_TOTAL_ZEROED_BYTES = 0x46d,
  ISAAC_PGDICT_SET_ONE_COUNT = 0,
  ISAAC_PGDICT_SET_ONE_OFF = -1,
  ISAAC_PGDICT_SET_ONE_VALUE = 0,
  ISAAC_PGDICT_GAP_COUNT = 5,
  ISAAC_PGDICT_CALL_SITES = 2,
  ISAAC_PGDCLMP_VA = 0x009e4af0u,
  ISAAC_PGDCLMP_RET_VA = 0x009e4f71u,
  ISAAC_PGDCLMP_FLOOR = 1,
  ISAAC_PGDCLMP_FLAG_OFF = 0x3c,
  ISAAC_PGDCLMP_COUNT_OFF = 0xf0,
  ISAAC_PGDCLMP_ACCUM_OFF = 0x454,
  ISAAC_PGDCLMP_STAIR_BASE = 0x458,
  ISAAC_PGDCLMP_STAIR_COUNT = 12,
  ISAAC_PGDCLMP_STAIR_MAX_N = 11,
  ISAAC_PGDCLMP_TAIL_COUNT = 5,
  ISAAC_PGDCLMP_CALL_SITES = 1,
  ISAAC_PGDCLMP_CALL_SITE_VA = 0x009e4613u,
  ISAAC_PGDCLMP_HOST_CALLS = 0,
  ISAAC_PGDCLMP_BODY_BYTES = 1154,
  ISAAC_PGDCLMP_MIN_SNAP = 0x49c,
  ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35,
  ISAAC_PGD_OFF_CHANGES_MADE = 0x00,
  ISAAC_PGD_OFF_READONLY = 0x01,
  ISAAC_PGD_OFF_FLAG_02 = 0x02,
  ISAAC_PGD_OFF_FILE = 0x04,
  ISAAC_PGD_OFF_FILEPATH = 0x08,
  ISAAC_PGD_OFF_STEAMCLOUDPATH = 0x20,
  ISAAC_PGD_OFF_ACHIEVEMENTS = 0x38,
  ISAAC_PGD_OFF_EVENT_COUNTERS = 0x2bc,
  ISAAC_PGD_OFF_ITEM_COLLECTION = 0xae8,
  ISAAC_PGD_OFF_SEC3_DWORDS = 0xdc8,
  ISAAC_PGD_OFF_SEC5_BYTES = 0xe00,
  ISAAC_PGD_OFF_BOSSES = 0xe07,
  ISAAC_PGD_OFF_CHALLENGES = 0xe6f,
  ISAAC_PGD_OFF_SEC8_DWORDS = 0xea0,
  ISAAC_PGD_OFF_SEC9_DWORDS = 0xf0c,
  ISAAC_PGD_OFF_SEC10_BYTES = 0xf14,
  ISAAC_PGD_OFF_BESTIARY = 0xf64,
  ISAAC_PGD_OFF_PRE_SECTION_WORD = 0xf84,
  ISAAC_PGD_OFF_SAVE_COUNTER = 0xf88,
  ISAAC_PGD_OFF_FILE_LOADED_OK = 0xf8c,
  ISAAC_PGD_COUNT_ACHIEVEMENTS = 0x282,
  ISAAC_PGD_COUNT_EVENT_COUNTERS = 0x20b,
  ISAAC_PGD_COUNT_ITEM_COLLECTION = 0x2dd,
  ISAAC_PGD_COUNT_SEC3 = 0xe,
  ISAAC_PGD_COUNT_SEC5 = 7,
  ISAAC_PGD_COUNT_BOSSES = 0x68,
  ISAAC_PGD_COUNT_CHALLENGES = 0x2e,
  ISAAC_PGD_COUNT_SEC8 = 0x1b,
  ISAAC_PGD_COUNT_SEC9 = 2,
  ISAAC_PGD_COUNT_SEC10 = 0x50,
  ISAAC_PGD_STRING_SSO_CAP = 0x10,
  ISAAC_PGD_MAGIC_BYTES = 16,
  ISAAC_PGD_MAGIC_VARIANTS = 4,
  ISAAC_PGD_CHECKSUM_TAIL_BYTES = 4,
  ISAAC_PGD_CHECKSUM_SKIP_FRONT = 0x10,
  ISAAC_PGD_CHECKSUM_SKIP_BACK = 4,
  ISAAC_PGD_SECTION_HEADER_BYTES = 12,
  ISAAC_PGD_MIN_LOADABLE_VERSION = 9,
  ISAAC_PGD_VERSION_06 = 6,
  ISAAC_PGD_VERSION_07 = 7,
  ISAAC_PGD_VERSION_08 = 8,
  ISAAC_PGD_VERSION_09 = 9,
  ISAAC_PGD_MAX_SECTION_ID_V06 = 0x9,
  ISAAC_PGD_MAX_SECTION_ID_V07 = 0xa,
  ISAAC_PGD_MAX_SECTION_ID_V08 = 0xa,
  ISAAC_PGD_MAX_SECTION_ID_V09 = 0xb,
  ISAAC_PGD_SECTION_MIN_ID = 1,
  ISAAC_PGD_SECTION_MAX_ID = 11,
  ISAAC_PGD_BESTIARY_SECTION_ID = 11,
  ISAAC_PGD_BESTIARY_SUBMAPS = 4,
  ISAAC_PGD_BESTIARY_OFF_ROOT_0 = 0xf64,
  ISAAC_PGD_BESTIARY_OFF_COUNT_0 = 0xf68,
  ISAAC_PGD_BESTIARY_OFF_ROOT_1 = 0xf6c,
  ISAAC_PGD_BESTIARY_OFF_COUNT_1 = 0xf70,
  ISAAC_PGD_BESTIARY_OFF_ROOT_2 = 0xf74,
  ISAAC_PGD_BESTIARY_OFF_COUNT_2 = 0xf78,
  ISAAC_PGD_BESTIARY_OFF_ROOT_3 = 0xf7c,
  ISAAC_PGD_BESTIARY_OFF_COUNT_3 = 0xf80,
  ISAAC_PGD_BESTIARY_PAIR_BYTES = 8,
  ISAAC_PGD_CHECKSUM_SEED = 0xfedcba76u,
  ISAAC_PGD_CHECKSUM_POLY = 0xedb88320u,
  ISAAC_PGD_CHECKSUM_MODE_ROR_ADD = 0,
  ISAAC_PGD_CHECKSUM_MODE_CRC = 1,
  ISAAC_PGD_UNLOCKED_SENTINEL_NEVER = -2,
  ISAAC_PGD_UNLOCKED_MODE_VALUE = 2,
  ISAAC_PGD_HOST_VA_TREE_NEXT = 0x00414a80u,
  ISAAC_PGD_IMPORT_KIND_BLOCK = 1,
  ISAAC_PGD_SIBLING_KIND_BLOCK = 1,
  ISAAC_PGD_SIBLING_KIND_REMAP_EVENT = 2,
  ISAAC_PGDCLR_STATUS_UNTOUCHED = 0,
  ISAAC_PGD_TAIL_GATE_OFF_CHANGES = 0,
  ISAAC_PGD_TREE_LEFT_OFF = 0,
  ISAAC_PGD_TREE_PARENT_OFF = 4,
  ISAAC_PGD_TREE_RIGHT_OFF = 8,
  ISAAC_PGD_TREE_ISNIL_OFF = 0xd,
  ISAAC_PGD_TREE_NEXT_VA = 0x00414a80u,
  ISAAC_PGD_TREE_NEXT_RET_A_VA = 0x00414ab0u,
  ISAAC_PGD_TREE_NEXT_RET_B_VA = 0x00414ad2u,
  ISAAC_PGD_TREE_NEXT_BODY_BYTES = 83,
  ISAAC_PGD_TREE_NEXT_HOST_CALLS = 0,
  ISAAC_PGD_TREE_NEXT_CALL_SITES_IMAGE = 134,
  ISAAC_PGD_TREE_NEXT_CALL_SITES_CLUSTER = 5,
  ISAAC_PGD_SEC5_SLOTS = 7,
  ISAAC_PGD_SEC5_ID_MAX = 0xf,
  ISAAC_PGD_SEC5_REMAP_BASE = 7,
  ISAAC_PGD_SEC5_REMAP_SPAN = 6,
  ISAAC_PGD_SEC5_ALIAS_ID = 0xe,
  ISAAC_PGD_MASK41_BITS = 0x29,
  ISAAC_PGD_MASK41_UNLOCK_THRESHOLD = 5
};

typedef struct IsaacPgdChecksumState {
  uint32_t buffer;
  uint32_t partial_len;
  uint32_t acc;
  int32_t mode;
} IsaacPgdChecksumState;

typedef struct IsaacPgdSectionDesc {
  int32_t id;
  uint32_t cap_word;
  int32_t count_word;
  int32_t elem_width;
  int32_t field_offset;
  int32_t payload_bytes;
  int32_t fixed;
} IsaacPgdSectionDesc;

typedef struct IsaacPgdReaderSectionDesc {
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
} IsaacPgdReaderSectionDesc;

typedef struct IsaacPgdSavePlan {
  int32_t magic_variant;
  int32_t version_tag;
  int32_t max_section_id;
  int32_t magic_bytes;
  int32_t fixed_prefix_bytes;
  int32_t checksum_skip_front;
  int32_t checksum_skip_back;
  int32_t checksum_mode;
  uint32_t checksum_seed;
  uint32_t save_counter_next;
  uint32_t bestiary_total;
  uint32_t bestiary_cap_word;
  int32_t host_write_needed;
} IsaacPgdSavePlan;

typedef struct IsaacPgdImportCopy {
  int32_t step;
  int32_t kind;
  int32_t source_offset;
  int32_t dst;
  int32_t length;
  uint32_t va;
  int32_t iterations;
} IsaacPgdImportCopy;

typedef struct IsaacPgdSiblingCopy {
  int32_t step;
  int32_t kind;
  int32_t source_offset;
  int32_t dst;
  int32_t length;
  uint32_t va;
  int32_t iterations;
} IsaacPgdSiblingCopy;

typedef struct IsaacPgdClearRow {
  int32_t step;
  int32_t offset;
  int32_t length;
  uint32_t va;
} IsaacPgdClearRow;

typedef struct IsaacPgdClearMapRow {
  int32_t step;
  int32_t slot;
  int32_t base;
  uint32_t erase_va;
  uint32_t selflink_va;
  uint32_t size_va;
} IsaacPgdClearMapRow;

typedef struct IsaacPgdClearTailStore {
  int32_t step;
  int32_t offset;
  int32_t length;
  int32_t value;
  uint32_t va;
} IsaacPgdClearTailStore;

typedef struct IsaacPgdTailStep {
  int32_t step;
  int32_t kind;
  uint32_t va_import;
  uint32_t va_sibling;
  uint32_t detail;
} IsaacPgdTailStep;

typedef struct IsaacPgdSnapshotCtorZeroRow {
  int32_t step;
  int32_t offset;
  int32_t length;
  uint32_t va;
} IsaacPgdSnapshotCtorZeroRow;

typedef struct IsaacPgdSnapshotCtorGap {
  int32_t step;
  int32_t offset;
  int32_t length;
} IsaacPgdSnapshotCtorGap;

typedef struct IsaacPgdImportCtorZeroRow {
  int32_t step;
  int32_t offset;
  int32_t length;
  uint32_t va;
} IsaacPgdImportCtorZeroRow;

typedef struct IsaacPgdImportCtorGap {
  int32_t step;
  int32_t offset;
  int32_t length;
} IsaacPgdImportCtorGap;

typedef struct IsaacPgdAltTransportField {
  int32_t field_offset;
  int32_t count;
  int32_t elem_width;
  int32_t payload_bytes;
  int32_t bool_normalize;
  uint32_t va;
} IsaacPgdAltTransportField;

/* Prototypes recovered from pgd_pure_helpers.cpp (ABI v12). */
int32_t isaac_pgd_string_data_is_heap(uint32_t capacity);
int32_t isaac_pgd_magic_byte(int32_t variant, int32_t index);
int32_t isaac_pgd_magic_variant(const uint8_t* magic);
int32_t isaac_pgd_version_for_variant(int32_t variant);
int32_t isaac_pgd_max_section_id_for_variant(int32_t variant);
int32_t isaac_pgd_version_loadable(int32_t version_tag);
int32_t isaac_pgd_section_desc(int32_t id, IsaacPgdSectionDesc* out);
int32_t isaac_pgd_section_stream_bytes(int32_t id);
int32_t isaac_pgd_section_stream_offset(int32_t id);
int32_t isaac_pgd_fixed_prefix_bytes(void);
int32_t isaac_pgd_reader_loop_continue(int32_t prev_id, int32_t max_section_id);
int32_t isaac_pgd_reader_section_skipped(uint32_t cap_word);
int32_t isaac_pgd_reader_section_dispatched(int32_t id);
int32_t isaac_pgd_reader_payload_continue(uint32_t byte_cursor, uint32_t cap_word);
int32_t isaac_pgd_reader_store_in_range(uint32_t index, uint32_t builtin_count);
int32_t isaac_pgd_reader_count_mismatch(int32_t file_count, int32_t builtin_count);
int32_t isaac_pgd_reader_bool_normalize(int32_t raw_byte);
int32_t isaac_pgd_writer_bool_normalize(uint32_t raw_byte);
uint32_t isaac_pgd_crc_table_entry(uint32_t index);
int32_t isaac_pgd_crc_table_uses_arithmetic_shift(void);
int32_t isaac_pgd_save_uses_state_crc_routine(void);
uint32_t isaac_pgd_crc_step(uint32_t reg, uint32_t byte_value);
uint32_t isaac_pgd_ror_add_step(uint32_t acc, uint32_t word);
void isaac_pgd_checksum_init(IsaacPgdChecksumState* state, int32_t mode);
void isaac_pgd_checksum_update(IsaacPgdChecksumState* state, const uint8_t* data, int32_t len);
uint32_t isaac_pgd_checksum_finalize(const IsaacPgdChecksumState* state);
uint32_t isaac_pgd_checksum_buffer(const uint8_t* data, int32_t len, int32_t mode);
uint32_t isaac_pgd_checksum_file_region(const uint8_t* file, int32_t len, int32_t skip_front, int32_t skip_back);
int32_t isaac_pgd_checksum_file_valid(const uint8_t* file, int32_t len);
int32_t isaac_pgd_achievement_index_valid(int32_t achievement_id);
int32_t isaac_pgd_unlocked(int32_t achievement_id, uint32_t achievement_byte, int32_t mode_word, int32_t game_null, uint32_t game_26630, uint32_t game_26589);
int32_t isaac_pgd_try_unlock_store_needed(uint32_t readonly, int32_t achievement_id, uint32_t achievement_byte);
int32_t isaac_pgd_try_unlock_steam_leg(uint32_t flag_02, int32_t cloud_ready);
int32_t isaac_pgd_collection_index_valid(int32_t collectible_id);
int32_t isaac_pgd_collection_store_needed(uint32_t readonly, int32_t collectible_id, uint32_t current_byte);
int32_t isaac_pgd_challenge_index_valid(int32_t challenge_id);
int32_t isaac_pgd_challenge_store_needed(uint32_t readonly, int32_t challenge_id);
int32_t isaac_pgd_boss_index_valid(int32_t boss_id);
int32_t isaac_pgd_boss_store_needed(uint32_t readonly, int32_t boss_id);
int32_t isaac_pgd_event_counter_next(int32_t old_value, int32_t num);
int32_t isaac_pgd_event_counter_store_needed(uint32_t readonly);
int32_t isaac_pgd_flag_get(const uint8_t* flags, int32_t count, int32_t index);
int32_t isaac_pgd_flag_set(uint8_t* flags, int32_t count, int32_t index, int32_t value);
int32_t isaac_pgd_flag_popcount(const uint8_t* flags, int32_t count);
uint32_t isaac_pgd_bestiary_total(uint32_t count0, uint32_t count1, uint32_t count2, uint32_t count3);
uint32_t isaac_pgd_bestiary_cap_word(uint32_t total);
int32_t isaac_pgd_bestiary_submap_tag(int32_t slot);
int32_t isaac_pgd_bestiary_submap_pair(int32_t slot);
void isaac_pgd_save_plan(uint32_t save_counter_in, uint32_t bestiary_count0, uint32_t bestiary_count1, uint32_t bestiary_count2, uint32_t bestiary_count3, IsaacPgdSavePlan* out);
int32_t isaac_pgd_reader_section_desc(int32_t id, IsaacPgdReaderSectionDesc* out);
int32_t isaac_pgd_reader_dispatch_index(int32_t id);
uint32_t isaac_pgd_reader_handler_va(int32_t id);
int32_t isaac_pgd_reader_sec9_clamp(uint32_t file_count);
int32_t isaac_pgd_reader_dispatch_edi(void);
int32_t isaac_pgd_reader_elem_byte_cursor(int32_t elem_index, int32_t width);
uint32_t isaac_pgd_reader_elements_consumed(uint32_t file_count, uint32_t cap_word, int32_t width);
uint32_t isaac_pgd_reader_elements_stored(uint32_t file_count, uint32_t cap_word, int32_t width, uint32_t store_bound);
int32_t isaac_pgd_reader_count_enters_loop(uint32_t file_count);
int32_t isaac_pgd_reader_loop_back(uint32_t next_index, uint32_t file_count);
int32_t isaac_pgd_reader_store_normalizes(int32_t width);
uint32_t isaac_pgd_reader_store_value(int32_t width, uint32_t raw);
int32_t isaac_pgd_reader_store_offset(int32_t field_offset, uint32_t elem_index, int32_t width, uint32_t store_bound);
int32_t isaac_pgd_reader_section_uses_cap(int32_t id);
int32_t isaac_pgd_bestiary_clear_slot(int32_t step);
int32_t isaac_pgd_bestiary_outer_continue(uint32_t next_index, uint32_t block_count);
int32_t isaac_pgd_bestiary_pair_loop_continue(int32_t next_index, int32_t pair_count);
int32_t isaac_pgd_bestiary_insert_needed(uint32_t node_marker_d, int32_t key, int32_t node_key);
int32_t isaac_pgd_reader_tail_reads_save_counter(void);
int32_t isaac_pgd_field_status(int32_t field_offset);
int32_t isaac_pgd_field_repr(int32_t field_offset);
int32_t isaac_pgd_pre_section_word_accessor_count(void);
int32_t isaac_pgd_alt_transport_field(int32_t step, IsaacPgdAltTransportField* out);
int32_t isaac_pgd_alt_transport_covers(int32_t field_offset);
int32_t isaac_pgd_bitpack_bytes(uint32_t count);
int32_t isaac_pgd_bitpack_bit(const uint8_t* packed, uint32_t count, uint32_t index);
uint32_t isaac_pgd_bitpack_unpack(const uint8_t* packed, uint32_t count, uint8_t* out);
int32_t isaac_pgd_notify_logs(uint32_t flag_02);
int32_t isaac_pgd_notify_dispatches(uint32_t flag_02, uint32_t enable_global);
int32_t isaac_pgd_sec3_restore_remap(int32_t index);
int32_t isaac_pgd_event_restore_remap(int32_t index);
int32_t isaac_pgd_sec3_restore_loop_continue(int32_t next_iteration);
int32_t isaac_pgd_event_restore_loop_continue(int32_t next_iteration);
int32_t isaac_pgd_sec3_restore_slot(int32_t iteration);
int32_t isaac_pgd_event_restore_slot(int32_t iteration);
int32_t isaac_pgd_sec3_restore_writers(int32_t slot);
int32_t isaac_pgd_event_restore_writers(int32_t slot);
int32_t isaac_pgd_sec3_restore_slot_written(int32_t slot);
int32_t isaac_pgd_event_restore_slot_written(int32_t slot);
int32_t isaac_pgd_sec3_restore_winning_iteration(int32_t slot);
int32_t isaac_pgd_event_restore_winning_iteration(int32_t slot);
int32_t isaac_pgd_sec3_restore_store_offset(int32_t iteration);
int32_t isaac_pgd_event_restore_store_offset(int32_t iteration);
int32_t isaac_pgd_bestiary_slot_from_tag(int32_t tag);
uint32_t isaac_pgd_bestiary_tag_handler_va(int32_t tag);
uint32_t isaac_pgd_bestiary_map_root_off(int32_t slot);
uint32_t isaac_pgd_bestiary_map_count_off(int32_t slot);
int32_t isaac_pgd_bestiary_pair_count_from_size(int32_t size_word);
int32_t isaac_pgd_bestiary_pair_payload_bytes(int32_t pair_count);
int32_t isaac_pgd_bestiary_size_word_from_pairs(int32_t pair_count);
int32_t isaac_pgd_sec5_index_remap(int32_t id);
int32_t isaac_pgd_sec5_out_of_range(int32_t id);
int32_t isaac_pgd_sec5_store_slot(uint32_t readonly, int32_t id);
int32_t isaac_pgd_sec5_all_set(const uint8_t* slots, int32_t count);
int32_t isaac_pgd_sec10_store_slot(uint32_t readonly, int32_t id);
int32_t isaac_pgd_sec10_resets_slot0(void);
int32_t isaac_pgd_sec10_store_is_self_cancelling(uint32_t readonly, int32_t id);
int32_t isaac_pgd_mask41_popcount(uint32_t lo, uint32_t hi);
int32_t isaac_pgd_mask41_unlock_needed(int32_t popcount);
uint32_t isaac_pgd_mask41_hi_mask(void);
int32_t isaac_pgd_import_copy_count(void);
int32_t isaac_pgd_import_copy_record(int32_t step, IsaacPgdImportCopy* out);
int32_t isaac_pgd_import_field_written(int32_t field_offset);
int32_t isaac_pgd_import_written_byte_count(int32_t field_offset);
int32_t isaac_pgd_import_element_written(int32_t field_offset, int32_t elem_index);
int32_t isaac_pgd_import_stale_byte_count(int32_t field_offset);
int32_t isaac_pgd_import_uses_remap(int32_t field_offset);
int32_t isaac_pgd_import_normalizes(int32_t field_offset);
int32_t isaac_pgd_import_tail_has_array_stores(void);
uint32_t isaac_pgd_import_snapshot_bytes(void);
int32_t isaac_pgd_sibling_event_remap(int32_t index);
int32_t isaac_pgd_sibling_copy_count(void);
int32_t isaac_pgd_sibling_copy_record(int32_t step, IsaacPgdSiblingCopy* out);
int32_t isaac_pgd_sibling_field_written(int32_t field_offset);
int32_t isaac_pgd_sibling_written_byte_count(int32_t field_offset);
int32_t isaac_pgd_sibling_element_written(int32_t field_offset, int32_t elem_index);
int32_t isaac_pgd_sibling_stale_byte_count(int32_t field_offset);
int32_t isaac_pgd_sibling_uses_remap(int32_t field_offset);
int32_t isaac_pgd_sibling_normalizes(int32_t field_offset);
int32_t isaac_pgd_sibling_tail_has_array_stores(void);
uint32_t isaac_pgd_sibling_snapshot_bytes(void);
int32_t isaac_pgd_clear_zero_row_count(void);
int32_t isaac_pgd_clear_zero_record(int32_t step, IsaacPgdClearRow* out);
int32_t isaac_pgd_clear_zero_row_span_dwords(int32_t step);
int32_t isaac_pgd_clear_save_counter_cleared(uint32_t unk);
int32_t isaac_pgd_clear_map_count(void);
int32_t isaac_pgd_clear_map_record(int32_t step, IsaacPgdClearMapRow* out);
int32_t isaac_pgd_clear_map_slot_at_step(int32_t step);
int32_t isaac_pgd_clear_tail_store_count(void);
int32_t isaac_pgd_clear_tail_store_record(int32_t step, IsaacPgdClearTailStore* out);
int32_t isaac_pgd_clear_field_status(int32_t field_offset);
int32_t isaac_pgd_clear_byte_zeroed(int32_t offset, uint32_t unk);
int32_t isaac_pgd_clear_total_zeroed_bytes(uint32_t unk);
int32_t isaac_pgd_clear_gap_offset(void);
int32_t isaac_pgd_clear_gap_length(void);
int32_t isaac_pgd_clear_map_order_matches_reader(void);
int32_t isaac_pgd_clear_map_order_matches_writer(void);
int32_t isaac_pgd_clear_call_site_count(void);
uint32_t isaac_pgd_clear_call_site_va(int32_t index);
int32_t isaac_pgd_import_tail_step_count(void);
int32_t isaac_pgd_import_tail_record(int32_t step, IsaacPgdTailStep* out);
int32_t isaac_pgd_import_tail_event_args_0(void);
int32_t isaac_pgd_import_tail_event_args_1(void);
int32_t isaac_pgd_import_tail_gate_open(uint32_t changesmade, uint32_t file_loaded_ok);
int32_t isaac_pgd_import_tail_save_to_steam_needed(uint32_t probe_deref_dword, uint32_t game_2a3a4);
int32_t isaac_pgd_import_tail_preserves_game_guard(void);
int32_t isaac_pgd_import_tail_returns_one_unless_read_failed(void);
uint32_t isaac_pgd_import_reader_va(void);
uint32_t isaac_pgd_import_reader_call_site_va(void);
uint32_t isaac_pgd_sibling_reader_va(void);
uint32_t isaac_pgd_sibling_reader_call_site_va(void);
uint32_t isaac_pgd_sibling_snapshot_ctor_va(void);
int32_t isaac_pgd_sibling_ctor_call_site_count(void);
uint32_t isaac_pgd_sibling_ctor_call_site_va(int32_t index);
int32_t isaac_pgd_import_reader_call_site_count(void);
int32_t isaac_pgd_sibling_reader_call_site_count(void);
int32_t isaac_pgd_import_reader_is_shared_with_sibling(void);
int32_t isaac_pgd_snapshot_ctor_zero_row_count(void);
int32_t isaac_pgd_snapshot_ctor_zero_record(int32_t step, IsaacPgdSnapshotCtorZeroRow* out);
int32_t isaac_pgd_snapshot_ctor_zero_span_dwords(int32_t step);
int32_t isaac_pgd_snapshot_ctor_byte_zeroed(int32_t offset);
int32_t isaac_pgd_snapshot_ctor_total_zeroed_bytes(void);
int32_t isaac_pgd_snapshot_ctor_set_one_offset(void);
int32_t isaac_pgd_snapshot_ctor_set_one_value(void);
int32_t isaac_pgd_snapshot_ctor_gap_count(void);
int32_t isaac_pgd_snapshot_ctor_gap_record(int32_t step, IsaacPgdSnapshotCtorGap* out);
int32_t isaac_pgd_snapshot_ctor_arg_unused(void);
int32_t isaac_pgd_snapshot_ctor_restore_source_covered(int32_t offset, int32_t length);
int32_t isaac_pgd_snapshot_ctor_covers_all_restore_sources(void);
int32_t isaac_pgd_import_ctor_zero_row_count(void);
int32_t isaac_pgd_import_ctor_zero_record(int32_t step, IsaacPgdImportCtorZeroRow* out);
int32_t isaac_pgd_import_ctor_zero_span_dwords(int32_t step);
int32_t isaac_pgd_import_ctor_byte_zeroed(int32_t offset);
int32_t isaac_pgd_import_ctor_total_zeroed_bytes(void);
int32_t isaac_pgd_import_ctor_set_one_offset(void);
int32_t isaac_pgd_import_ctor_set_one_value(void);
int32_t isaac_pgd_import_ctor_set_one_count(void);
int32_t isaac_pgd_import_ctor_gap_count(void);
int32_t isaac_pgd_import_ctor_gap_record(int32_t step, IsaacPgdImportCtorGap* out);
int32_t isaac_pgd_import_ctor_arg_unused(void);
int32_t isaac_pgd_import_ctor_restore_source_covered(int32_t offset, int32_t length);
int32_t isaac_pgd_import_ctor_covers_all_restore_sources(void);
uint32_t isaac_pgd_import_snapshot_ctor_va(void);
int32_t isaac_pgd_import_ctor_call_site_count(void);
uint32_t isaac_pgd_import_ctor_call_site_va(int32_t index);
int32_t isaac_pgd_reader_clamp_floor(int32_t value);
int32_t isaac_pgd_reader_clamp_flag_block_taken(uint32_t flag_byte);
int32_t isaac_pgd_reader_clamp_stair_taken(uint32_t flag_byte, int32_t count, int32_t stair);
int32_t isaac_pgd_reader_clamp_stair_offset(int32_t stair);
int32_t isaac_pgd_reader_clamp_stair_count(void);
int32_t isaac_pgd_reader_clamp_tail_taken(int32_t gate);
int32_t isaac_pgd_reader_clamp_tail_count(void);
int32_t isaac_pgd_reader_clamp_tail_gate_offset(int32_t index);
int32_t isaac_pgd_reader_clamp_tail_slot_offset(int32_t index);
int32_t isaac_pgd_reader_clamp_accum_written(uint32_t flag_byte, int32_t count, int32_t gate0, int32_t gate1, int32_t gate2, int32_t gate3, int32_t gate4);
int32_t isaac_pgd_reader_clamp_apply(uint8_t* snap, int32_t snap_bytes);
uint32_t isaac_pgd_reader_clamp_va(void);
uint32_t isaac_pgd_reader_clamp_ret_va(void);
int32_t isaac_pgd_reader_clamp_call_site_count(void);
uint32_t isaac_pgd_reader_clamp_call_site_va(int32_t index);
int32_t isaac_pgd_reader_clamp_host_calls(void);
int32_t isaac_pgd_reader_clamp_floor_const(void);

/* ============================================================================
====================== ABI v12 ======================= */

/* PGDTREE: MSVC tree successor 0x00414a80. BYTE isnil at +0xd.
   Right-live path je 0x414ab1; else parent-climb while cur==[parent+8].
   Two rets 0x00414ab0 / 0x00414ad2. Next island 0x00414ae0. */

enum {
  ISAAC_PGDTREE_VA = 0x00414a80u,
  ISAAC_PGDTREE_RET0_VA = 0x00414ab0u,
  ISAAC_PGDTREE_RET_VA = 0x00414ad2u,
  ISAAC_PGDTREE_NEXT_VA = 0x00414ae0u,
  ISAAC_PGDTREE_LEFT_OFF = 0,
  ISAAC_PGDTREE_PARENT_OFF = 4,
  ISAAC_PGDTREE_RIGHT_OFF = 8,
  ISAAC_PGDTREE_ISNIL_OFF = 0xd,
  ISAAC_PGDTREE_NODE_MIN = 0x0e,
  ISAAC_PGDTREE_HOST_CALLS = 0,
  ISAAC_PGDTREE_BODY_BYTES = 0x53,
  ISAAC_PGDTREE_INSNS = 36,
  ISAAC_PGDTREE_CALL_SITES = 134,
  ISAAC_PGDTREE_PGD_SITES = 5
};

int32_t isaac_pgd_tree_isnil_byte(uint32_t isnil_word);
int32_t isaac_pgd_tree_right_nil_arm(uint32_t right_isnil_word);
void isaac_pgd_tree_iterator_next(uint32_t* it);
uint32_t isaac_pgd_tree_next_va(void);
uint32_t isaac_pgd_tree_next_ret_a_va(void);
uint32_t isaac_pgd_tree_next_ret_b_va(void);
int32_t isaac_pgd_tree_next_body_bytes(void);
int32_t isaac_pgd_tree_next_host_calls(void);
int32_t isaac_pgd_tree_next_call_sites_image(void);
int32_t isaac_pgd_tree_next_call_sites_cluster(void);
uint32_t isaac_pgd_tree_next_cluster_site_va(int32_t index);
int32_t isaac_pgd_tree_left_off(void);
int32_t isaac_pgd_tree_parent_off(void);
int32_t isaac_pgd_tree_right_off(void);
int32_t isaac_pgd_tree_isnil_off(void);

/* ============================================================================
====================== ABI v13 ======================= */

/* PGDTROW: writer bestiary tree-row walk inside 0x009282e0. Four maps
   drained via the v12 iterator++ 0x00414a80; row cell = [pgd+header_off],
   begin = [cell] (header->_Left), empty gate begin==cell, key@+0x10,
   value@+0x14, loop-back node != header, stride 0x18. See the v13
   narrative above and section-notes/pgd-v13/NOTES.md. */

enum {
  ISAAC_PGDTROW_KEY_OFF = 0x10,
  ISAAC_PGDTROW_VALUE_OFF = 0x14,
  ISAAC_PGDTROW_STRIDE = 0x18,
  ISAAC_PGDTROW_ADVANCE_VA = 0x00414a80u,
  ISAAC_PGDTROW_WRITER_VA = 0x009282e0u,
  ISAAC_PGDTROW_ALT_VA = 0x0091b2f9u,
  ISAAC_PGDTROW_READER_VA = 0x0092af9au,
  ISAAC_PGDTROW_WALKS = 4,
  ISAAC_PGDTROW_SLOT_0 = 3,
  ISAAC_PGDTROW_SLOT_1 = 1,
  ISAAC_PGDTROW_SLOT_2 = 2,
  ISAAC_PGDTROW_SLOT_3 = 0,
  ISAAC_PGDTROW_TAG_0 = 4,
  ISAAC_PGDTROW_TAG_1 = 2,
  ISAAC_PGDTROW_TAG_2 = 3,
  ISAAC_PGDTROW_TAG_3 = 1,
  ISAAC_PGDTROW_HEADER_OFF_0 = 0xf7c,
  ISAAC_PGDTROW_HEADER_OFF_1 = 0xf6c,
  ISAAC_PGDTROW_HEADER_OFF_2 = 0xf74,
  ISAAC_PGDTROW_HEADER_OFF_3 = 0xf64,
  ISAAC_PGDTROW_COUNT_OFF_0 = 0xf80,
  ISAAC_PGDTROW_COUNT_OFF_1 = 0xf70,
  ISAAC_PGDTROW_COUNT_OFF_2 = 0xf78,
  ISAAC_PGDTROW_COUNT_OFF_3 = 0xf68,
  ISAAC_PGDTROW_GATE_VA_0 = 0x00928ba9u,
  ISAAC_PGDTROW_GATE_VA_1 = 0x00928c6fu,
  ISAAC_PGDTROW_GATE_VA_2 = 0x00928d32u,
  ISAAC_PGDTROW_GATE_VA_3 = 0x00928df5u,
  ISAAC_PGDTROW_LOOP_HEAD_VA_0 = 0x00928bb0u,
  ISAAC_PGDTROW_LOOP_HEAD_VA_1 = 0x00928c73u,
  ISAAC_PGDTROW_LOOP_HEAD_VA_2 = 0x00928d36u,
  ISAAC_PGDTROW_LOOP_HEAD_VA_3 = 0x00928e00u,
  ISAAC_PGDTROW_KEY_VA_0 = 0x00928bb3u,
  ISAAC_PGDTROW_KEY_VA_1 = 0x00928c76u,
  ISAAC_PGDTROW_KEY_VA_2 = 0x00928d39u,
  ISAAC_PGDTROW_KEY_VA_3 = 0x00928e03u,
  ISAAC_PGDTROW_VALUE_VA_0 = 0x00928bd6u,
  ISAAC_PGDTROW_VALUE_VA_1 = 0x00928c99u,
  ISAAC_PGDTROW_VALUE_VA_2 = 0x00928d5cu,
  ISAAC_PGDTROW_VALUE_VA_3 = 0x00928e26u,
  ISAAC_PGDTROW_CALL_VA_0 = 0x00928bf9u,
  ISAAC_PGDTROW_CALL_VA_1 = 0x00928cbcu,
  ISAAC_PGDTROW_CALL_VA_2 = 0x00928d7fu,
  ISAAC_PGDTROW_CALL_VA_3 = 0x00928e49u,
  ISAAC_PGDTROW_LOOP_BACK_VA_0 = 0x00928c01u,
  ISAAC_PGDTROW_LOOP_BACK_VA_1 = 0x00928cc4u,
  ISAAC_PGDTROW_LOOP_BACK_VA_2 = 0x00928d87u,
  ISAAC_PGDTROW_LOOP_BACK_VA_3 = 0x00928e51u
};

int32_t isaac_pgd_tree_row_key_off(void);
int32_t isaac_pgd_tree_row_value_off(void);
int32_t isaac_pgd_tree_row_stride(void);
uint32_t isaac_pgd_tree_row_advance_va(void);
uint32_t isaac_pgd_tree_row_writer_va(void);
uint32_t isaac_pgd_tree_row_alt_va(void);
uint32_t isaac_pgd_tree_row_reader_va(void);
int32_t isaac_pgd_tree_row_empty(uint32_t begin_node, uint32_t header_node);
int32_t isaac_pgd_tree_row_loop_back(uint32_t node, uint32_t header_node);
int32_t isaac_pgd_tree_row_walk_count(void);
int32_t isaac_pgd_tree_row_walk_slot(int32_t step);
int32_t isaac_pgd_tree_row_walk_tag(int32_t step);
int32_t isaac_pgd_tree_row_walk_header_off(int32_t step);
int32_t isaac_pgd_tree_row_walk_count_off(int32_t step);
uint32_t isaac_pgd_tree_row_walk_gate_va(int32_t step);
uint32_t isaac_pgd_tree_row_walk_loop_head_va(int32_t step);
uint32_t isaac_pgd_tree_row_walk_key_va(int32_t step);
uint32_t isaac_pgd_tree_row_walk_value_va(int32_t step);
uint32_t isaac_pgd_tree_row_walk_call_va(int32_t step);
uint32_t isaac_pgd_tree_row_walk_loop_back_va(int32_t step);
int32_t isaac_pgd_tree_row_order_matches_bestiary_pairs(void);

/* ============================================================================
====================== ABI v14 ======================= */

/* PGDSC11: the writer's section-11 sub-block framing inside 0x009282e0
   and the reader gates in the section-11 handler 0x009276e1. Header:
   id = 11, cap = total<<2 (total = wrap-32 sum of the four bestiary
   count words in machine order c0+(c1+(c2+c3))), third dword = sub-block
   count 4 (the row total at [ebp-0xc] is a dead store). Per walk step s:
   tag then sub-block cap = count[count-off(slot(step))] << 2, then the
   v13 row walk. Reader gates: unsigned subcount==0, (tag-1)<=3 unsigned,
   SIGNED cap>0 then rows=cap>>2, unsigned sub-loop jb, signed row-loop
   jl. See the v14 narrative above and section-notes/pgd-v14/NOTES.md. */

enum {
  ISAAC_PGDSC11_HEADER_ID = 0xb,
  ISAAC_PGDSC11_SUB_BLOCKS = 4,
  ISAAC_PGDSC11_TOTAL_VA = 0x00928aa6u,
  ISAAC_PGDSC11_TOTAL_FINAL_ADD_VA = 0x00928ac1u,
  ISAAC_PGDSC11_ID_STORE_VA = 0x00928ac3u,
  ISAAC_PGDSC11_COUNT_DEAD_STORE_VA = 0x00928acdu,
  ISAAC_PGDSC11_CAP_SHL_VA = 0x00928ad0u,
  ISAAC_PGDSC11_CAP_WRITE_VA = 0x00928b01u,
  ISAAC_PGDSC11_SUBCOUNT_STORE_VA = 0x00928b20u,
  ISAAC_PGDSC11_SUBCOUNT_WRITE_VA = 0x00928b2cu,
  ISAAC_PGDSC11_READER_SUBCOUNT_READ_VA = 0x00927791u,
  ISAAC_PGDSC11_READER_HANDLER_VA = 0x009276e1u,
  ISAAC_PGDSC11_READER_TAG_READ_VA = 0x009277b4u,
  ISAAC_PGDSC11_READER_TAG_GATE_VA = 0x009277bdu,
  ISAAC_PGDSC11_READER_CAP_GATE_VA = 0x009277e6u,
  ISAAC_PGDSC11_READER_CAP_SHR_VA = 0x009277eeu,
  ISAAC_PGDSC11_READER_ROW_LOOP_BACK_VA = 0x009278e6u,
  ISAAC_PGDSC11_READER_SUB_LOOP_BACK_VA = 0x00927c63u,
  ISAAC_PGDSC11_TAG_WRITE_VA_0 = 0x00928b4bu,
  ISAAC_PGDSC11_TAG_WRITE_VA_1 = 0x00928c11u,
  ISAAC_PGDSC11_TAG_WRITE_VA_2 = 0x00928cd4u,
  ISAAC_PGDSC11_TAG_WRITE_VA_3 = 0x00928d97u,
  ISAAC_PGDSC11_CAP_SOURCE_VA_0 = 0x00928b6eu,
  ISAAC_PGDSC11_CAP_SOURCE_VA_1 = 0x00928c34u,
  ISAAC_PGDSC11_CAP_SOURCE_VA_2 = 0x00928cf7u,
  ISAAC_PGDSC11_CAP_SOURCE_VA_3 = 0x00928dbau,
  ISAAC_PGDSC11_CAP_SHL_VA_0 = 0x00928b7au,
  ISAAC_PGDSC11_CAP_SHL_VA_1 = 0x00928c40u,
  ISAAC_PGDSC11_CAP_SHL_VA_2 = 0x00928d03u,
  ISAAC_PGDSC11_CAP_SHL_VA_3 = 0x00928dc6u
};

int32_t isaac_pgd_sec11_header_id(void);
int32_t isaac_pgd_sec11_sub_block_count(void);
uint32_t isaac_pgd_sec11_row_total(uint32_t c2, uint32_t c3, uint32_t c1,
                                   uint32_t c0);
uint32_t isaac_pgd_sec11_header_cap(uint32_t total);
int32_t isaac_pgd_sec11_sub_cap(int32_t step, uint32_t count);
int32_t isaac_pgd_sec11_rows_from_cap(uint32_t cap);
int32_t isaac_pgd_sec11_sub_count_zero(uint32_t subcount);
int32_t isaac_pgd_sec11_tag_valid(uint32_t tag);
int32_t isaac_pgd_sec11_sub_loop_back(uint32_t index, uint32_t subcount);
int32_t isaac_pgd_sec11_row_loop_back(uint32_t index, uint32_t rows);
uint32_t isaac_pgd_sec11_total_va(void);
uint32_t isaac_pgd_sec11_total_final_add_va(void);
uint32_t isaac_pgd_sec11_id_store_va(void);
uint32_t isaac_pgd_sec11_count_dead_store_va(void);
uint32_t isaac_pgd_sec11_cap_shl_va(void);
uint32_t isaac_pgd_sec11_cap_write_va(void);
uint32_t isaac_pgd_sec11_subcount_store_va(void);
uint32_t isaac_pgd_sec11_subcount_write_va(void);
uint32_t isaac_pgd_sec11_reader_subcount_read_va(void);
uint32_t isaac_pgd_sec11_reader_handler_va(void);
uint32_t isaac_pgd_sec11_reader_tag_read_va(void);
uint32_t isaac_pgd_sec11_reader_tag_gate_va(void);
uint32_t isaac_pgd_sec11_reader_cap_gate_va(void);
uint32_t isaac_pgd_sec11_reader_cap_shr_va(void);
uint32_t isaac_pgd_sec11_reader_row_loop_back_va(void);
uint32_t isaac_pgd_sec11_reader_sub_loop_back_va(void);
uint32_t isaac_pgd_sec11_tag_write_va(int32_t step);
uint32_t isaac_pgd_sec11_cap_source_va(int32_t step);
uint32_t isaac_pgd_sec11_cap_shl_step_va(int32_t step);
int32_t isaac_pgd_sec11_framing_matches_row_walk(void);

/* ============================================================================
====================== ABI v15 ======================= */

/* PGDCP: reader-side bestiary COUNT-PROBE 0x0092aea0..0x0092b061
   (ret 8; entry 0x92aea0, fail ret 0x92b05f, ok ret 0x92b054; next
   island 0x92b070 — the slot-3 GetBestiaryDeathCount getter (v16),
   NOT this body; v15 had recorded 0x92b0c0, which decodes
   MID-INSTRUCTION of that getter and has 0 callers). Three inbound
   E8 sites: 0x006c10bf / 0x006ca239 (game code)
   and the probe's own iterative 0x92b03c. Pure laws over sampled
   inputs (the game-state +0x15/+0x17c flags and 0x9595e0 callback
   stay host AFTER these gates):
     - probe_blocked: entry LOW-BYTE gate on pgd+1 (readonly);
     - eligible: gate1 SIGNED [el+0x7c] >= 0, gate2 float [el+0x68]
       IEEE-equal to +0.0f (ucomiss xmm0,0.0 / lahf / test ah,0x44 /
       jnp — only the ordered-equal ZF=1,PF=0 row counts; NaN and all
       non-zero skip), gate3 LOW-BYTE [el+0x100] != 0; all three must
       pass for the inc;
     - store_needed / effective: the cached global [0xc7f508] is
       re-derived and stored ONLY when it is zero;
     - proceed: UNSIGNED [pgd+0xf68] >= derived count (jb skips). */

enum {
  ISAAC_PGDCOUNT_PROBE_VA = 0x0092aea0u,
  ISAAC_PGDCOUNT_PROBE_RET_OK_VA = 0x0092b054u,
  ISAAC_PGDCOUNT_PROBE_RET_FAIL_VA = 0x0092b05fu,
  ISAAC_PGDCOUNT_PROBE_NEXT_VA = 0x0092b070u, /* v16 CORRECTED from
     0x92b0c0 (mid-instruction decode; 0 callers) — the 0x92b070
     GetBestiaryDeathCount getter is the real next island (2 callers) */
  ISAAC_PGDCOUNT_PROBE_CALL_SITES = 3,
  ISAAC_PGDCOUNT_PROBE_CALL_SITE_0_VA = 0x006c10bfu,
  ISAAC_PGDCOUNT_PROBE_CALL_SITE_1_VA = 0x006ca239u,
  ISAAC_PGDCOUNT_PROBE_CALL_SITE_2_VA = 0x0092b03cu,
  ISAAC_PGDCOUNT_GLOBAL_VA = 0x00c7f508u,
  ISAAC_PGDCOUNT_GAME_VA = 0x00c7169cu,
  ISAAC_PGDCOUNT_TREE_OFF = 0x2a670,
  ISAAC_PGDCOUNT_READONLY_GATE_VA = 0x0092aeaEu,
  ISAAC_PGDCOUNT_READONLY_JNE_VA = 0x0092aeb2u,
  ISAAC_PGDCOUNT_CACHED_LOAD_VA = 0x0092af55u,
  ISAAC_PGDCOUNT_STORE_GATE_VA = 0x0092af61u,
  ISAAC_PGDCOUNT_STORE_GATE_JNE_VA = 0x0092af63u,
  ISAAC_PGDCOUNT_HEADER_LOAD_VA = 0x0092af65u,
  ISAAC_PGDCOUNT_EMPTY_GATE_VA = 0x0092af71u,
  ISAAC_PGDCOUNT_GATE1_CMP_VA = 0x0092af78u,
  ISAAC_PGDCOUNT_GATE1_JL_VA = 0x0092af7cu,
  ISAAC_PGDCOUNT_GATE2_MOVSS_VA = 0x0092af7eu,
  ISAAC_PGDCOUNT_GATE2_UCOMISS_VA = 0x0092af83u,
  ISAAC_PGDCOUNT_GATE2_LAHF_VA = 0x0092af86u,
  ISAAC_PGDCOUNT_GATE2_TEST_VA = 0x0092af87u,
  ISAAC_PGDCOUNT_GATE2_JNP_VA = 0x0092af8au,
  ISAAC_PGDCOUNT_GATE3_CMP_VA = 0x0092af8cu,
  ISAAC_PGDCOUNT_GATE3_JE_VA = 0x0092af93u,
  ISAAC_PGDCOUNT_INC_VA = 0x0092af95u,
  ISAAC_PGDCOUNT_ADVANCE_VA = 0x0092af9au,
  ISAAC_PGDCOUNT_LOOP_BACK_CMP_VA = 0x0092afa3u,
  ISAAC_PGDCOUNT_LOOP_BACK_JNE_VA = 0x0092afa5u,
  ISAAC_PGDCOUNT_STORE_VA = 0x0092afadu,
  ISAAC_PGDCOUNT_PROCEED_CMP_VA = 0x0092afb3u,
  ISAAC_PGDCOUNT_PROCEED_JB_VA = 0x0092afb9u,
  ISAAC_PGDCOUNT_SLOT7C_OFF = 0x7c,
  ISAAC_PGDCOUNT_FLOAT_OFF = 0x68,
  ISAAC_PGDCOUNT_FLAG_OFF = 0x100,
  ISAAC_PGDCOUNT_SLOT0_COUNT_OFF = 0xf68
};

uint32_t isaac_pgd_count_probe_va(void);
uint32_t isaac_pgd_count_probe_ret_ok_va(void);
uint32_t isaac_pgd_count_probe_ret_fail_va(void);
uint32_t isaac_pgd_count_probe_next_va(void);
int32_t isaac_pgd_count_probe_call_site_count(void);
uint32_t isaac_pgd_count_probe_call_site_va(int32_t index);
uint32_t isaac_pgd_count_global_va(void);
uint32_t isaac_pgd_count_game_va(void);
int32_t isaac_pgd_count_tree_off(void);
int32_t isaac_pgd_count_slot7c_off(void);
int32_t isaac_pgd_count_float_off(void);
int32_t isaac_pgd_count_flag_off(void);
int32_t isaac_pgd_count_slot0_count_off(void);
uint32_t isaac_pgd_count_readonly_gate_va(void);
uint32_t isaac_pgd_count_store_gate_va(void);
uint32_t isaac_pgd_count_store_gate_jne_va(void);
uint32_t isaac_pgd_count_header_load_va(void);
uint32_t isaac_pgd_count_empty_gate_va(void);
uint32_t isaac_pgd_count_gate1_cmp_va(void);
uint32_t isaac_pgd_count_gate1_jl_va(void);
uint32_t isaac_pgd_count_gate2_movss_va(void);
uint32_t isaac_pgd_count_gate2_ucomiss_va(void);
uint32_t isaac_pgd_count_gate2_lahf_va(void);
uint32_t isaac_pgd_count_gate2_test_va(void);
uint32_t isaac_pgd_count_gate2_jnp_va(void);
uint32_t isaac_pgd_count_gate3_cmp_va(void);
uint32_t isaac_pgd_count_gate3_je_va(void);
uint32_t isaac_pgd_count_inc_va(void);
uint32_t isaac_pgd_count_advance_va(void);
uint32_t isaac_pgd_count_loop_back_cmp_va(void);
uint32_t isaac_pgd_count_loop_back_jne_va(void);
uint32_t isaac_pgd_count_store_va(void);
uint32_t isaac_pgd_count_proceed_cmp_va(void);
uint32_t isaac_pgd_count_proceed_jb_va(void);
int32_t isaac_pgd_count_probe_blocked(uint32_t readonly_byte);
int32_t isaac_pgd_count_eligible(int32_t slot7c, uint32_t float_bits,
                                 uint32_t flag_word);
int32_t isaac_pgd_count_store_needed(uint32_t cached);
uint32_t isaac_pgd_count_effective(uint32_t cached, uint32_t derived);
int32_t isaac_pgd_count_proceed(uint32_t map_count_slot0, uint32_t count);

/* ============================================================================
====================== ABI v16 ======================= */

/* PGDDEATH: bestiary slot-3 getter `PersistentGameData::
   GetBestiaryDeathCount(EntityType, EntityVariant)` 0x0092b070..
   0x0092b0f0 (ret 8 at 0x92b0dd ok / 0x92b0e7 node-fail / 0x92b0f0
   container-fail). identify-zhl EXACT match (150 pattern bytes):
   `__thiscall int PersistentGameData::GetBestiaryDeathCount(int
   EntityType, int EntityVariant)`. Two inbound E8 sites: 0x005c2380
   and 0x008c78e1. Sibling getters: 0x92b110 (slot 1 base 0xf6c,
   kill-count shape) and 0x92b190 EXACT MATCH `GetBestiaryEncounterCount`.
   The container find (0x695030 on [0xc7169c]+0x2a670) and the map
   find (0x4288a0) stay HOST; the pure surface over sampled record/
   node fields:
     - key: `((w0 << 12) | w1) << 8` (PE `shl esi,0xc ; or esi,
       [eax+4] ; shl esi,8` @0x92b0a6/0x92b0a9/0x92b0b3);
     - node_ok: marker byte [node+0xd] LOW BYTE == 0 (@0x92b0c2 jne)
       AND key >= node_key SIGNED (@0x92b0c8 jl) AND node != map
       header (@0x92b0cd je);
     - value: node_ok ? [node+0x14] : 0 (@0x92b0d5 loads the value
       only on the ok path; node-fail tail xors eax). */

enum {
  ISAAC_PGDDEATH_VA = 0x0092b070u,
  ISAAC_PGDDEATH_RET_OK_VA = 0x0092b0ddu,
  ISAAC_PGDDEATH_RET_NODE_FAIL_VA = 0x0092b0e7u,
  ISAAC_PGDDEATH_RET_FAIL_VA = 0x0092b0f0u,
  ISAAC_PGDDEATH_CALL_SITES = 2,
  ISAAC_PGDDEATH_CALL_SITE_0_VA = 0x005c2380u,
  ISAAC_PGDDEATH_CALL_SITE_1_VA = 0x008c78e1u,
  ISAAC_PGDDEATH_SLOT3_HEADER_OFF = 0xf7c,
  ISAAC_PGDDEATH_MARKER_OFF = 0xd,
  ISAAC_PGDDEATH_KEY_OFF = 0x10,
  ISAAC_PGDDEATH_VALUE_OFF = 0x14,
  ISAAC_PGDDEATH_GAME_VA = 0x00c7169cu,
  ISAAC_PGDDEATH_CONTAINER_OFF = 0x2a670,
  ISAAC_PGDDEATH_GATE_BYTE_OFF = 0xe8,
  ISAAC_PGDDEATH_CONTAINER_FIND_VA = 0x00695030u,
  ISAAC_PGDDEATH_MAP_FIND_VA = 0x004288a0u,
  ISAAC_PGDDEATH_KEY_SHIFT12_VA = 0x0092b0a6u,
  ISAAC_PGDDEATH_KEY_OR_VA = 0x0092b0a9u,
  ISAAC_PGDDEATH_KEY_SHIFT8_VA = 0x0092b0b3u,
  ISAAC_PGDDEATH_MARKER_CMP_VA = 0x0092b0c2u,
  ISAAC_PGDDEATH_MARKER_JNE_VA = 0x0092b0c6u,
  ISAAC_PGDDEATH_KEY_CMP_VA = 0x0092b0c8u,
  ISAAC_PGDDEATH_KEY_JL_VA = 0x0092b0cbu,
  ISAAC_PGDDEATH_HEADER_CMP_VA = 0x0092b0cdu,
  ISAAC_PGDDEATH_HEADER_JE_VA = 0x0092b0d3u,
  ISAAC_PGDDEATH_VALUE_LOAD_VA = 0x0092b0d5u
};

uint32_t isaac_pgd_bestiary_death_va(void);
uint32_t isaac_pgd_bestiary_death_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_death_ret_node_fail_va(void);
uint32_t isaac_pgd_bestiary_death_ret_fail_va(void);
int32_t isaac_pgd_bestiary_death_call_site_count(void);
uint32_t isaac_pgd_bestiary_death_call_site_va(int32_t index);
int32_t isaac_pgd_bestiary_death_slot3_header_off(void);
int32_t isaac_pgd_bestiary_death_marker_off(void);
int32_t isaac_pgd_bestiary_death_key_off(void);
int32_t isaac_pgd_bestiary_death_value_off(void);
uint32_t isaac_pgd_bestiary_death_game_va(void);
int32_t isaac_pgd_bestiary_death_container_off(void);
int32_t isaac_pgd_bestiary_death_gate_byte_off(void);
uint32_t isaac_pgd_bestiary_death_container_find_va(void);
uint32_t isaac_pgd_bestiary_death_map_find_va(void);
uint32_t isaac_pgd_bestiary_death_key_shift12_va(void);
uint32_t isaac_pgd_bestiary_death_key_or_va(void);
uint32_t isaac_pgd_bestiary_death_key_shift8_va(void);
uint32_t isaac_pgd_bestiary_death_marker_cmp_va(void);
uint32_t isaac_pgd_bestiary_death_marker_jne_va(void);
uint32_t isaac_pgd_bestiary_death_key_cmp_va(void);
uint32_t isaac_pgd_bestiary_death_key_jl_va(void);
uint32_t isaac_pgd_bestiary_death_header_cmp_va(void);
uint32_t isaac_pgd_bestiary_death_header_je_va(void);
uint32_t isaac_pgd_bestiary_death_value_load_va(void);
uint32_t isaac_pgd_bestiary_death_key(uint32_t rec_word0, uint32_t rec_word1);
int32_t isaac_pgd_bestiary_death_node_ok(uint32_t marker_d, int32_t key,
                                         int32_t node_key,
                                         uint32_t node_is_header);
uint32_t isaac_pgd_bestiary_death_value(uint32_t marker_d, int32_t key,
                                        int32_t node_key,
                                        uint32_t node_is_header,
                                        uint32_t node_value);

/* ============================================================================
====================== ABI v17 ======================= */

/* PGDKILL + PGDENC: the two sibling bestiary getters the v16 handoff
   named as the family's next frontier. Same template as PGDDEATH (key
   derivation `((w0<<12)|w1)<<8`, node eligibility marker-byte LOW-BYTE
   zero AND SIGNED key >= node_key AND node != header, value at
   node+0x14), different slot bases:
   - GetBestiaryKillCount 0x0092b100..0x0092b180 (ret 8 @0x92b16d ok /
     0x92b177 node-fail / 0x92b180 container-fail). identify-zhl EXACT
     match (148 pattern bytes). SLOT-1 header base 0xf6c. 7 inbound E8
     sites (0x5c1d86, 0x5c1e61, 0x5c1eff, 0x8c799e, 0x92ad5e, 0x92adc2,
     0x92add2). NOTE: the v16 note spelled the entry "0x92b110" — that
     VA (0x92b110 decodes MID-INSTRUCTION inside the body: bytes
     `c7 00 ff 75 08 8d` are a garbage start; the prologue's
     `mov ecx,[0xc7169c]` tail
     `c7 00` owns 0x92b110..0x92b111); the true aligned entry is
     0x92b100, the same trap the v15 note hit at 0x92b0c0.
   - GetBestiaryEncounterCount 0x0092b190..0x0092b1d8 (ret 8 @0x92b1cf
     ok / 0x92b1d6 container-fail); identify-zhl EXACT match (31
     pattern bytes). The key is derived inline (@0x92b1ba..0x92b1c2),
     then a local helper 0x92b1e0..0x92b22a (ret 4 @0x92b21d ok /
     0x92b227 node-fail; its own 2 inbound E8 sites 0x8c68fc and
     0x92b1c8) does the map find on SLOT-0 header base 0xf64 (ZHL
     struct: `PersistentGameData_Bestiary bestiary : 0xf64` — the v16
     "0xf74" label was wrong) + the three node gates + value load.
     3 inbound E8 sites on the getter (0x4adf67, 0x5a3b28, 0x92b02e).
   The container find (0x695030 on [0xc7169c]+0x2a670), the [eax+0xe8]
   byte gate and the map find (0x4288a0) stay HOST; the pure surface
   over sampled record/node fields is the same three laws as PGDDEATH. */

enum {
  ISAAC_PGDKILL_VA = 0x0092b100u,
  ISAAC_PGDKILL_RET_OK_VA = 0x0092b16du,
  ISAAC_PGDKILL_RET_NODE_FAIL_VA = 0x0092b177u,
  ISAAC_PGDKILL_RET_FAIL_VA = 0x0092b180u,
  ISAAC_PGDKILL_CALL_SITES = 7,
  ISAAC_PGDKILL_CALL_SITE_0_VA = 0x005c1d86u,
  ISAAC_PGDKILL_CALL_SITE_1_VA = 0x005c1e61u,
  ISAAC_PGDKILL_CALL_SITE_2_VA = 0x005c1effu,
  ISAAC_PGDKILL_CALL_SITE_3_VA = 0x008c799eu,
  ISAAC_PGDKILL_CALL_SITE_4_VA = 0x0092ad5eu,
  ISAAC_PGDKILL_CALL_SITE_5_VA = 0x0092adc2u,
  ISAAC_PGDKILL_CALL_SITE_6_VA = 0x0092add2u,
  ISAAC_PGDKILL_SLOT1_HEADER_OFF = 0xf6c,
  ISAAC_PGDKILL_MARKER_OFF = 0xd,
  ISAAC_PGDKILL_KEY_OFF = 0x10,
  ISAAC_PGDKILL_VALUE_OFF = 0x14,
  ISAAC_PGDKILL_GAME_VA = 0x00c7169cu,
  ISAAC_PGDKILL_CONTAINER_OFF = 0x2a670,
  ISAAC_PGDKILL_GATE_BYTE_OFF = 0xe8,
  ISAAC_PGDKILL_CONTAINER_FIND_VA = 0x00695030u,
  ISAAC_PGDKILL_MAP_FIND_VA = 0x004288a0u,
  ISAAC_PGDKILL_KEY_SHIFT12_VA = 0x0092b136u,
  ISAAC_PGDKILL_KEY_OR_VA = 0x0092b139u,
  ISAAC_PGDKILL_KEY_SHIFT8_VA = 0x0092b143u,
  ISAAC_PGDKILL_MARKER_CMP_VA = 0x0092b152u,
  ISAAC_PGDKILL_MARKER_JNE_VA = 0x0092b156u,
  ISAAC_PGDKILL_KEY_CMP_VA = 0x0092b158u,
  ISAAC_PGDKILL_KEY_JL_VA = 0x0092b15bu,
  ISAAC_PGDKILL_HEADER_CMP_VA = 0x0092b15du,
  ISAAC_PGDKILL_HEADER_JE_VA = 0x0092b163u,
  ISAAC_PGDKILL_VALUE_LOAD_VA = 0x0092b165u
};

uint32_t isaac_pgd_bestiary_kill_va(void);
uint32_t isaac_pgd_bestiary_kill_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_kill_ret_node_fail_va(void);
uint32_t isaac_pgd_bestiary_kill_ret_fail_va(void);
int32_t isaac_pgd_bestiary_kill_call_site_count(void);
uint32_t isaac_pgd_bestiary_kill_call_site_va(int32_t index);
int32_t isaac_pgd_bestiary_kill_slot1_header_off(void);
int32_t isaac_pgd_bestiary_kill_marker_off(void);
int32_t isaac_pgd_bestiary_kill_key_off(void);
int32_t isaac_pgd_bestiary_kill_value_off(void);
uint32_t isaac_pgd_bestiary_kill_game_va(void);
int32_t isaac_pgd_bestiary_kill_container_off(void);
int32_t isaac_pgd_bestiary_kill_gate_byte_off(void);
uint32_t isaac_pgd_bestiary_kill_container_find_va(void);
uint32_t isaac_pgd_bestiary_kill_map_find_va(void);
uint32_t isaac_pgd_bestiary_kill_key_shift12_va(void);
uint32_t isaac_pgd_bestiary_kill_key_or_va(void);
uint32_t isaac_pgd_bestiary_kill_key_shift8_va(void);
uint32_t isaac_pgd_bestiary_kill_marker_cmp_va(void);
uint32_t isaac_pgd_bestiary_kill_marker_jne_va(void);
uint32_t isaac_pgd_bestiary_kill_key_cmp_va(void);
uint32_t isaac_pgd_bestiary_kill_key_jl_va(void);
uint32_t isaac_pgd_bestiary_kill_header_cmp_va(void);
uint32_t isaac_pgd_bestiary_kill_header_je_va(void);
uint32_t isaac_pgd_bestiary_kill_value_load_va(void);
uint32_t isaac_pgd_bestiary_kill_key(uint32_t rec_word0, uint32_t rec_word1);
int32_t isaac_pgd_bestiary_kill_node_ok(uint32_t marker_d, int32_t key,
                                        int32_t node_key,
                                        uint32_t node_is_header);
uint32_t isaac_pgd_bestiary_kill_value(uint32_t marker_d, int32_t key,
                                       int32_t node_key,
                                       uint32_t node_is_header,
                                       uint32_t node_value);

enum {
  ISAAC_PGDENC_VA = 0x0092b190u,
  ISAAC_PGDENC_RET_OK_VA = 0x0092b1cfu,
  ISAAC_PGDENC_RET_FAIL_VA = 0x0092b1d6u,
  ISAAC_PGDENC_HELPER_VA = 0x0092b1e0u,
  ISAAC_PGDENC_HELPER_RET_OK_VA = 0x0092b21du,
  ISAAC_PGDENC_HELPER_RET_FAIL_VA = 0x0092b227u,
  ISAAC_PGDENC_CALL_SITES = 3,
  ISAAC_PGDENC_CALL_SITE_0_VA = 0x004adf67u,
  ISAAC_PGDENC_CALL_SITE_1_VA = 0x005a3b28u,
  ISAAC_PGDENC_CALL_SITE_2_VA = 0x0092b02eu,
  ISAAC_PGDENC_SLOT0_HEADER_OFF = 0xf64,
  ISAAC_PGDENC_MARKER_OFF = 0xd,
  ISAAC_PGDENC_KEY_OFF = 0x10,
  ISAAC_PGDENC_VALUE_OFF = 0x14,
  ISAAC_PGDENC_GAME_VA = 0x00c7169cu,
  ISAAC_PGDENC_CONTAINER_OFF = 0x2a670,
  ISAAC_PGDENC_GATE_BYTE_OFF = 0xe8,
  ISAAC_PGDENC_CONTAINER_FIND_VA = 0x00695030u,
  ISAAC_PGDENC_MAP_FIND_VA = 0x004288a0u,
  ISAAC_PGDENC_KEY_SHIFT12_VA = 0x0092b1bcu,
  ISAAC_PGDENC_KEY_OR_VA = 0x0092b1bfu,
  ISAAC_PGDENC_KEY_SHIFT8_VA = 0x0092b1c2u,
  ISAAC_PGDENC_MARKER_CMP_VA = 0x0092b206u,
  ISAAC_PGDENC_MARKER_JNE_VA = 0x0092b20au,
  ISAAC_PGDENC_KEY_CMP_VA = 0x0092b20cu,
  ISAAC_PGDENC_KEY_JL_VA = 0x0092b20fu,
  ISAAC_PGDENC_HEADER_CMP_VA = 0x0092b211u,
  ISAAC_PGDENC_HEADER_JE_VA = 0x0092b213u,
  ISAAC_PGDENC_VALUE_LOAD_VA = 0x0092b215u,
  ISAAC_PGDENC_HELPER_CALL_SITES = 2,
  ISAAC_PGDENC_HELPER_CALL_SITE_0_VA = 0x008c68fcu,
  ISAAC_PGDENC_HELPER_CALL_SITE_1_VA = 0x0092b1c8u
};

uint32_t isaac_pgd_bestiary_encounter_va(void);
uint32_t isaac_pgd_bestiary_encounter_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_encounter_ret_fail_va(void);
uint32_t isaac_pgd_bestiary_encounter_helper_va(void);
uint32_t isaac_pgd_bestiary_encounter_helper_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_encounter_helper_ret_fail_va(void);
int32_t isaac_pgd_bestiary_encounter_call_site_count(void);
uint32_t isaac_pgd_bestiary_encounter_call_site_va(int32_t index);
int32_t isaac_pgd_bestiary_encounter_slot0_header_off(void);
int32_t isaac_pgd_bestiary_encounter_marker_off(void);
int32_t isaac_pgd_bestiary_encounter_key_off(void);
int32_t isaac_pgd_bestiary_encounter_value_off(void);
uint32_t isaac_pgd_bestiary_encounter_game_va(void);
int32_t isaac_pgd_bestiary_encounter_container_off(void);
int32_t isaac_pgd_bestiary_encounter_gate_byte_off(void);
uint32_t isaac_pgd_bestiary_encounter_container_find_va(void);
uint32_t isaac_pgd_bestiary_encounter_map_find_va(void);
uint32_t isaac_pgd_bestiary_encounter_key_shift12_va(void);
uint32_t isaac_pgd_bestiary_encounter_key_or_va(void);
uint32_t isaac_pgd_bestiary_encounter_key_shift8_va(void);
uint32_t isaac_pgd_bestiary_encounter_marker_cmp_va(void);
uint32_t isaac_pgd_bestiary_encounter_marker_jne_va(void);
uint32_t isaac_pgd_bestiary_encounter_key_cmp_va(void);
uint32_t isaac_pgd_bestiary_encounter_key_jl_va(void);
uint32_t isaac_pgd_bestiary_encounter_header_cmp_va(void);
uint32_t isaac_pgd_bestiary_encounter_header_je_va(void);
uint32_t isaac_pgd_bestiary_encounter_value_load_va(void);
int32_t isaac_pgd_bestiary_encounter_helper_call_site_count(void);
uint32_t isaac_pgd_bestiary_encounter_helper_call_site_va(int32_t index);
uint32_t isaac_pgd_bestiary_encounter_key(uint32_t rec_word0,
                                          uint32_t rec_word1);
int32_t isaac_pgd_bestiary_encounter_node_ok(uint32_t marker_d, int32_t key,
                                             int32_t node_key,
                                             uint32_t node_is_header);
uint32_t isaac_pgd_bestiary_encounter_value(uint32_t marker_d, int32_t key,
                                            int32_t node_key,
                                            uint32_t node_is_header,
                                            uint32_t node_value);

/* ============================================================================
====================== ABI v18 ======================= */

/* PGDADDKILL: the write-side bestiary mutator `PersistentGameData::
   AddBestiaryKill(EntityType, EntityVariant)` 0x0092acb0..0x0092adfd
   (ret 8 @0x92adf2 ok / @0x92adfd fail). identify-zhl EXACT match
   (15 pattern bytes): `__thiscall bool PersistentGameData::
   AddBestiaryKill(int EntityType, int EntityVariant)`. FOUR inbound
   E8 sites (0x4c8618, 0x59f451, 0x7a0946, 0x92b047 — the PGDCP
   probe's own 0x92b047 is one of them; NOT dead). Prologue
   `55 8b ec 83 ec 0c 53 56 57 8b f9 80 7f 01 00` — the readonly gate
   `cmp byte [edi+1],0` is the FIRST instruction of the body (the same
   family template the v15 probe_blocked law came from). The pure
   surface over sampled inputs (the container find 0x695030, the map
   find 0x4288a0, the value-slot accessor 0x92ca70, the kill-count
   getter 0x92b100 and TryUnlock 0x929a20 all stay HOST):
     - ok: the entry fail gates. FAIL (return 0) when any of
       readonly LOW BYTE != 0 (0x92acbb/0x92acbf jne) OR rec_found
       == 0 (0x92acde/0x92ace0 je) OR gate_byte LOW BYTE == 0
       (0x92ace6/0x92aced je); checked in that order. Otherwise the
       function returns 1 ALWAYS (both success tails `mov al,1`;
       TryUnlock's return is discarded).
     - key: `((w0 << 12) | w1) << 8` — 32-bit wrap (shl @0x92acf8 /
       or @0x92ad01 / shl8 @0x92ad0a; identical to the v16/v17
       getter laws but distinct evidence VAs).
     - node_ok: 3 gates, ALL must pass to treat the record as
       EXISTING: marker_d LOW BYTE == 0 (0x92ad19/0x92ad1d jne) AND
       key >= node_key SIGNED (0x92ad1f/0x92ad22 jl) AND node != map
       header (0x92ad24/0x92ad26 je; the header is [edi], edi =
       pgd+0xf6c).
     - store_value: node_ok ? (old_value + 1) mod 2^32 : 1 (found:
       `inc dword [eax]` @0x92ad36; NOT found: `mov dword [eax],1`
       @0x92ad48). NOTE the write-side inversion: a gate fail here
       means INSERT (set 1), NOT return-0 — opposite of the getters.
     - dispatch_case: idx = type - 0x10f (add 0xfffffef1 @0x92ad65);
       if idx UNSIGNED > 0x85 (cmp/ja @0x92ad6b/0x92ad71) -> case 3;
       else byte_table[idx] (movzx @0x92ad73, jmp @0x92ad7a):
       {0->0, 1->0, 0x23->1, 0x85->2, else->3}.
     - unlock_needed(case, count): case0 -> count >= 0xa UNSIGNED
       (cmp/jb @0x92add9/0x92addc); case1/case2 -> count >= 0x14
       UNSIGNED (cmp/jb @0x92ad81/0x92ad84 and @0x92ad9d/0x92ada0);
       case3 -> never.
     - unlock_id(case): 0 -> 0x175, 1 -> 0x15d, 2 -> 0x164, 3 -> 0
       (push sites @0x92adde / @0x92ad86 / @0x92ada2; all three calls
       0x929a20 = PersistentGameData::TryUnlock, this = game+0x14).
     - case0_sum: (n1 + n2) mod 2^32 (add @0x92add7) where n1 =
       killcount(0x110, 0) and n2 = killcount(0x10f, 0) in machine
       call order (0x92adc2 first, 0x92add2 second).
   The tables are code-embedded data: jump table @0x92ae00
   {0x92adb9, 0x92ad81, 0x92ad9d, 0x92adea} (16 bytes) and byte table
   @0x92ae10 (0x86 entries; idx 0->0, 1->0, 0x23->1, 0x85->2,
   else->3) — re-read byte-for-byte from the image (raw offsets
   .text 0x92ae00 -> file 0x52a200, 0x92ae10 -> file 0x52a210). */

enum {
  ISAAC_PGDADDKILL_VA = 0x0092acb0u,
  ISAAC_PGDADDKILL_RET_OK_VA = 0x0092adf2u,
  ISAAC_PGDADDKILL_RET_FAIL_VA = 0x0092adfdu,
  ISAAC_PGDADDKILL_CALL_SITES = 4,
  ISAAC_PGDADDKILL_CALL_SITE_0_VA = 0x004c8618u,
  ISAAC_PGDADDKILL_CALL_SITE_1_VA = 0x0059f451u,
  ISAAC_PGDADDKILL_CALL_SITE_2_VA = 0x007a0946u,
  ISAAC_PGDADDKILL_CALL_SITE_3_VA = 0x0092b047u,
  ISAAC_PGDADDKILL_SLOT1_HEADER_OFF = 0xf6c,
  ISAAC_PGDADDKILL_MARKER_OFF = 0xd,
  ISAAC_PGDADDKILL_KEY_OFF = 0x10,
  ISAAC_PGDADDKILL_VALUE_OFF = 0x14,
  ISAAC_PGDADDKILL_GAME_VA = 0x00c7169cu,
  ISAAC_PGDADDKILL_CONTAINER_OFF = 0x2a670,
  ISAAC_PGDADDKILL_GATE_BYTE_OFF = 0xe8,
  ISAAC_PGDADDKILL_CONTAINER_FIND_VA = 0x00695030u,
  ISAAC_PGDADDKILL_MAP_FIND_VA = 0x004288a0u,
  ISAAC_PGDADDKILL_VALUE_ACCESSOR_VA = 0x0092ca70u,
  ISAAC_PGDADDKILL_KILL_GETTER_VA = 0x0092b100u,
  ISAAC_PGDADDKILL_UNLOCK_VA = 0x00929a20u,
  ISAAC_PGDADDKILL_TYPE_BASE = 0x10f,
  ISAAC_PGDADDKILL_RANGE = 0x85,
  ISAAC_PGDADDKILL_BT_VA = 0x0092ae10u,
  ISAAC_PGDADDKILL_BT_ENTRIES = 0x86,
  ISAAC_PGDADDKILL_JT_VA = 0x0092ae00u,
  ISAAC_PGDADDKILL_READONLY_CMP_VA = 0x0092acbbu,
  ISAAC_PGDADDKILL_READONLY_JNE_VA = 0x0092acbfu,
  ISAAC_PGDADDKILL_REC_TEST_VA = 0x0092acdeu,
  ISAAC_PGDADDKILL_REC_JE_VA = 0x0092ace0u,
  ISAAC_PGDADDKILL_GATE_CMP_VA = 0x0092ace6u,
  ISAAC_PGDADDKILL_GATE_JE_VA = 0x0092acedu,
  ISAAC_PGDADDKILL_KEY_SHIFT12_VA = 0x0092acf8u,
  ISAAC_PGDADDKILL_KEY_OR_VA = 0x0092ad01u,
  ISAAC_PGDADDKILL_KEY_SHIFT8_VA = 0x0092ad0au,
  ISAAC_PGDADDKILL_MARKER_CMP_VA = 0x0092ad19u,
  ISAAC_PGDADDKILL_MARKER_JNE_VA = 0x0092ad1du,
  ISAAC_PGDADDKILL_KEY_CMP_VA = 0x0092ad1fu,
  ISAAC_PGDADDKILL_KEY_JL_VA = 0x0092ad22u,
  ISAAC_PGDADDKILL_HEADER_CMP_VA = 0x0092ad24u,
  ISAAC_PGDADDKILL_HEADER_JE_VA = 0x0092ad26u,
  ISAAC_PGDADDKILL_STORE_INC_VA = 0x0092ad36u,
  ISAAC_PGDADDKILL_STORE_SET1_VA = 0x0092ad48u,
  ISAAC_PGDADDKILL_RANGE_CMP_VA = 0x0092ad6bu,
  ISAAC_PGDADDKILL_RANGE_JA_VA = 0x0092ad71u,
  ISAAC_PGDADDKILL_TABLE_LOAD_VA = 0x0092ad73u,
  ISAAC_PGDADDKILL_DISPATCH_JMP_VA = 0x0092ad7au,
  ISAAC_PGDADDKILL_CASE1_CMP_VA = 0x0092ad81u,
  ISAAC_PGDADDKILL_CASE1_JB_VA = 0x0092ad84u,
  ISAAC_PGDADDKILL_CASE1_PUSH_VA = 0x0092ad86u,
  ISAAC_PGDADDKILL_CASE1_RET_VA = 0x0092ad9au,
  ISAAC_PGDADDKILL_CASE2_CMP_VA = 0x0092ad9du,
  ISAAC_PGDADDKILL_CASE2_JB_VA = 0x0092ada0u,
  ISAAC_PGDADDKILL_CASE2_PUSH_VA = 0x0092ada2u,
  ISAAC_PGDADDKILL_CASE2_RET_VA = 0x0092adb6u,
  ISAAC_PGDADDKILL_CASE0_CALL1_VA = 0x0092adc2u,
  ISAAC_PGDADDKILL_CASE0_CALL2_VA = 0x0092add2u,
  ISAAC_PGDADDKILL_CASE0_ADD_VA = 0x0092add7u,
  ISAAC_PGDADDKILL_CASE0_CMP_VA = 0x0092add9u,
  ISAAC_PGDADDKILL_CASE0_JB_VA = 0x0092addcu,
  ISAAC_PGDADDKILL_CASE0_PUSH_VA = 0x0092addeu
};

uint32_t isaac_pgd_bestiary_addkill_va(void);
uint32_t isaac_pgd_bestiary_addkill_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_addkill_ret_fail_va(void);
int32_t isaac_pgd_bestiary_addkill_call_site_count(void);
uint32_t isaac_pgd_bestiary_addkill_call_site_va(int32_t index);
int32_t isaac_pgd_bestiary_addkill_slot1_header_off(void);
int32_t isaac_pgd_bestiary_addkill_marker_off(void);
int32_t isaac_pgd_bestiary_addkill_key_off(void);
int32_t isaac_pgd_bestiary_addkill_value_off(void);
uint32_t isaac_pgd_bestiary_addkill_game_va(void);
int32_t isaac_pgd_bestiary_addkill_container_off(void);
int32_t isaac_pgd_bestiary_addkill_gate_byte_off(void);
uint32_t isaac_pgd_bestiary_addkill_container_find_va(void);
uint32_t isaac_pgd_bestiary_addkill_map_find_va(void);
uint32_t isaac_pgd_bestiary_addkill_value_accessor_va(void);
uint32_t isaac_pgd_bestiary_addkill_kill_getter_va(void);
uint32_t isaac_pgd_bestiary_addkill_unlock_va(void);
int32_t isaac_pgd_bestiary_addkill_type_base(void);
int32_t isaac_pgd_bestiary_addkill_range(void);
uint32_t isaac_pgd_bestiary_addkill_bt_va(void);
int32_t isaac_pgd_bestiary_addkill_bt_entries(void);
uint32_t isaac_pgd_bestiary_addkill_jt_va(void);
uint32_t isaac_pgd_bestiary_addkill_readonly_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_readonly_jne_va(void);
uint32_t isaac_pgd_bestiary_addkill_rec_test_va(void);
uint32_t isaac_pgd_bestiary_addkill_rec_je_va(void);
uint32_t isaac_pgd_bestiary_addkill_gate_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_gate_je_va(void);
uint32_t isaac_pgd_bestiary_addkill_key_shift12_va(void);
uint32_t isaac_pgd_bestiary_addkill_key_or_va(void);
uint32_t isaac_pgd_bestiary_addkill_key_shift8_va(void);
uint32_t isaac_pgd_bestiary_addkill_marker_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_marker_jne_va(void);
uint32_t isaac_pgd_bestiary_addkill_key_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_key_jl_va(void);
uint32_t isaac_pgd_bestiary_addkill_header_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_header_je_va(void);
uint32_t isaac_pgd_bestiary_addkill_store_inc_va(void);
uint32_t isaac_pgd_bestiary_addkill_store_set1_va(void);
uint32_t isaac_pgd_bestiary_addkill_range_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_range_ja_va(void);
uint32_t isaac_pgd_bestiary_addkill_table_load_va(void);
uint32_t isaac_pgd_bestiary_addkill_dispatch_jmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_case1_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_case1_jb_va(void);
uint32_t isaac_pgd_bestiary_addkill_case1_push_va(void);
uint32_t isaac_pgd_bestiary_addkill_case1_ret_va(void);
uint32_t isaac_pgd_bestiary_addkill_case2_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_case2_jb_va(void);
uint32_t isaac_pgd_bestiary_addkill_case2_push_va(void);
uint32_t isaac_pgd_bestiary_addkill_case2_ret_va(void);
uint32_t isaac_pgd_bestiary_addkill_case0_call1_va(void);
uint32_t isaac_pgd_bestiary_addkill_case0_call2_va(void);
uint32_t isaac_pgd_bestiary_addkill_case0_add_va(void);
uint32_t isaac_pgd_bestiary_addkill_case0_cmp_va(void);
uint32_t isaac_pgd_bestiary_addkill_case0_jb_va(void);
uint32_t isaac_pgd_bestiary_addkill_case0_push_va(void);
int32_t isaac_pgd_bestiary_addkill_ok(uint32_t readonly_byte, uint32_t rec_found,
                                      uint32_t gate_byte);
uint32_t isaac_pgd_bestiary_addkill_key(uint32_t rec_word0, uint32_t rec_word1);
int32_t isaac_pgd_bestiary_addkill_node_ok(uint32_t marker_d, int32_t key,
                                           int32_t node_key,
                                           uint32_t node_is_header);
uint32_t isaac_pgd_bestiary_addkill_store_value(uint32_t node_ok,
                                                uint32_t old_value);
int32_t isaac_pgd_bestiary_addkill_dispatch_case(uint32_t type);
int32_t isaac_pgd_bestiary_addkill_unlock_needed(int32_t dispatch_case,
                                                 uint32_t count);
int32_t isaac_pgd_bestiary_addkill_unlock_id(int32_t dispatch_case);
uint32_t isaac_pgd_bestiary_addkill_case0_sum(uint32_t n1, uint32_t n2);

/* ============================================================================
====================== ABI v19 ======================= */

/* PGDADDSIB2 + PGDADDSIB3: the slot-2 / slot-3 sibling AddBestiary*
   write mutators immediately preceding the v18 PGDADDKILL. The v18
   handoff read all four VAs (0x92aaf0 / 0x92ab40 / 0x92abd0 /
   0x92ac20) as full AddBestiaryKill-shaped bodies with their own
   unlock dispatches; the machine is TWO wrapper/helper pairs (zero
   ZHL matches on all four — address-stable names):
     - PGDADDSIB2: wrapper 0x0092aaf0 (ret 8 @0x92ab35 ok /
       @0x92ab3c fail) -> helper 0x0092ab40 (ret 4; @0x92ab58
       readonly-fail, @0x92aba5 found, @0x92abc5 insert), slot-2
       header base pgd+0xf74 (`lea esi,[ecx+0xf74]` @0x92ab63,
       = ISAAC_PGD_BESTIARY_OFF_ROOT_2). One inbound E8 site
       0x774461 (image caller, NOT dead); helper's only caller is
       its own wrapper (0x92ab2e).
     - PGDADDSIB3: wrapper 0x0092abd0 (ret 8 @0x92ac15 ok /
       @0x92ac1c fail) -> helper 0x0092ac20 (ret 4; @0x92ac38
       readonly-fail, @0x92ac85 found, @0x92aca5 insert), slot-3
       header base pgd+0xf7c (`lea esi,[ecx+0xf7c]` @0x92ac43,
       = ISAAC_PGD_BESTIARY_OFF_ROOT_3). One inbound E8 site
       0x7780c8 (image caller, NOT dead); helper's only caller is
       its own wrapper (0x92ac0e).
   Wrapper template (both pairs; SLOT2 evidence VAs first): prologue
   `55 8b ec 56 8b f1`; readonly gate `cmp byte [esi+1],0 ; jne fail`
   @0x92aaf6/0x92aafa; container find (push variant @0x92aafc, push
   type @0x92ab05, lea ecx,[game+0x2a670] @0x92ab08, call 0x695030
   @0x92ab0e); rec gate `test eax,eax ; je fail` @0x92ab13/0x92ab15;
   gate byte `cmp byte [eax+0xe8],0 ; je fail` @0x92ab17/0x92ab1e;
   key `mov ecx,[eax] ; shl ecx,0xc ; or ecx,[eax+4] ; shl ecx,8`
   @0x92ab20..0x92ab28; `push ecx ; mov ecx,esi ; call helper`
   @0x92ab2b/0x92ab2c/0x92ab2e; ok tail `mov al,<helper> ; ret 8`,
   fail tail `xor al,al ; ret 8`. Helper template (SLOT2 evidence
   VAs first): aligned prologue `55 8b ec 83 e4 f8 83 ec 10`; its OWN
   readonly gate `cmp byte [ecx+1],0 ; je continue` @0x92ab49/
   0x92ab4f (fail path `xor al,al ; ret 4` @0x92ab58); `mov edi,
   [ebp+8]` (key arg); `lea eax,[esp+8] ; push eax ; lea esi,
   [ecx+slot_off] ; mov [esp+0xc],edi ; lea eax,[esp+0x10] ; mov
   ecx,esi ; push eax ; call 0x4288a0` (map find, @0x92ab74);
   node = [esp+0x14]; node gates: marker `cmp byte [eax+0xd],0 ;
   jne insert` @0x92ab7d/0x92ab81, key `cmp edi,[eax+0x10] ; jl
   insert` @0x92ab83/0x92ab86, header `cmp eax,[esi] ; je insert`
   @0x92ab88/0x92ab8a; FOUND store `call 0x92ca70 ; inc dword [eax] ;
   mov al,1 ; ret 4` @0x92ab97/0x92ab9c/0x92aba5; NOT-FOUND store
   `call 0x92ca70 ; mov dword [eax],1 ; mov al,1 ; ret 4`
   @0x92abb3/0x92abba/0x92abc5. Pure surface over sampled inputs:
     - ok(readonly_byte, rec_found, gate_byte, readonly_byte_helper):
       return 0 iff readonly_byte LOW BYTE != 0 (wrapper gate) OR
       rec_found == 0 OR gate_byte LOW BYTE == 0 OR
       readonly_byte_helper LOW BYTE != 0 (the helper re-checks the
       same pgd+1 byte; distinct sampled inputs); else 1.
     - helper_ok(readonly_byte_helper): 1 iff LOW BYTE == 0 else 0
       (the store helper's own bool; BOTH store paths return 1).
     - key(w0, w1) = ((w0<<12)|w1)<<8 mod 2^32 (identical to
       PGDKILL/PGDENC/PGDADDKILL).
     - node_ok(marker_d, key, node_key, node_is_header): the three
       node gates (marker LOW BYTE zero / SIGNED key >= node_key /
       node != header).
     - store_value(node_ok, old_value) = node_ok ? (old_value+1)
       mod 2^32 : 1 — WRITE-side INSERT on gate fail, same inversion
       as PGDADDKILL, no unlock dispatch (unlike PGDADDKILL).
   Container find 0x695030, map find 0x4288a0 and the value-slot
   accessor 0x92ca70 (MSVC SEH prologue) stay HOST. */

enum {
  ISAAC_PGDADDSIB2_VA = 0x0092aaf0u,
  ISAAC_PGDADDSIB2_RET_OK_VA = 0x0092ab35u,
  ISAAC_PGDADDSIB2_RET_FAIL_VA = 0x0092ab3cu,
  ISAAC_PGDADDSIB2_CALL_SITES = 1,
  ISAAC_PGDADDSIB2_CALL_SITE_0_VA = 0x00774461u,
  ISAAC_PGDADDSIB2_HELPER_VA = 0x0092ab40u,
  ISAAC_PGDADDSIB2_HELPER_RET_OK_VA = 0x0092aba5u,
  ISAAC_PGDADDSIB2_HELPER_RET_INSERT_VA = 0x0092abc5u,
  ISAAC_PGDADDSIB2_HELPER_RET_READONLY_FAIL_VA = 0x0092ab58u,
  ISAAC_PGDADDSIB2_SLOT2_HEADER_OFF = 0xf74,
  ISAAC_PGDADDSIB2_MARKER_OFF = 0xd,
  ISAAC_PGDADDSIB2_KEY_OFF = 0x10,
  ISAAC_PGDADDSIB2_VALUE_OFF = 0x14,
  ISAAC_PGDADDSIB2_GAME_VA = 0x00c7169cu,
  ISAAC_PGDADDSIB2_CONTAINER_OFF = 0x2a670,
  ISAAC_PGDADDSIB2_GATE_BYTE_OFF = 0xe8,
  ISAAC_PGDADDSIB2_CONTAINER_FIND_VA = 0x00695030u,
  ISAAC_PGDADDSIB2_MAP_FIND_VA = 0x004288a0u,
  ISAAC_PGDADDSIB2_VALUE_ACCESSOR_VA = 0x0092ca70u,
  ISAAC_PGDADDSIB2_READONLY_CMP_VA = 0x0092aaf6u,
  ISAAC_PGDADDSIB2_READONLY_JNE_VA = 0x0092aafau,
  ISAAC_PGDADDSIB2_REC_TEST_VA = 0x0092ab13u,
  ISAAC_PGDADDSIB2_REC_JE_VA = 0x0092ab15u,
  ISAAC_PGDADDSIB2_GATE_CMP_VA = 0x0092ab17u,
  ISAAC_PGDADDSIB2_GATE_JE_VA = 0x0092ab1eu,
  ISAAC_PGDADDSIB2_KEY_SHIFT12_VA = 0x0092ab22u,
  ISAAC_PGDADDSIB2_KEY_OR_VA = 0x0092ab25u,
  ISAAC_PGDADDSIB2_KEY_SHIFT8_VA = 0x0092ab28u,
  ISAAC_PGDADDSIB2_HELPER_CALL_SITE_VA = 0x0092ab2eu,
  ISAAC_PGDADDSIB2_HELPER_READONLY_CMP_VA = 0x0092ab49u,
  ISAAC_PGDADDSIB2_HELPER_READONLY_JE_VA = 0x0092ab4fu,
  ISAAC_PGDADDSIB2_MAP_FIND_CALL_VA = 0x0092ab74u,
  ISAAC_PGDADDSIB2_NODE_MARKER_CMP_VA = 0x0092ab7du,
  ISAAC_PGDADDSIB2_NODE_MARKER_JNE_VA = 0x0092ab81u,
  ISAAC_PGDADDSIB2_NODE_KEY_CMP_VA = 0x0092ab83u,
  ISAAC_PGDADDSIB2_NODE_KEY_JL_VA = 0x0092ab86u,
  ISAAC_PGDADDSIB2_NODE_HEADER_CMP_VA = 0x0092ab88u,
  ISAAC_PGDADDSIB2_NODE_HEADER_JE_VA = 0x0092ab8au,
  ISAAC_PGDADDSIB2_STORE_INC_VA = 0x0092ab9cu,
  ISAAC_PGDADDSIB2_STORE_SET1_VA = 0x0092abbau
};

uint32_t isaac_pgd_bestiary_addsib2_va(void);
uint32_t isaac_pgd_bestiary_addsib2_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_addsib2_ret_fail_va(void);
int32_t isaac_pgd_bestiary_addsib2_call_site_count(void);
uint32_t isaac_pgd_bestiary_addsib2_call_site_va(int32_t index);
uint32_t isaac_pgd_bestiary_addsib2_helper_va(void);
uint32_t isaac_pgd_bestiary_addsib2_helper_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_addsib2_helper_ret_insert_va(void);
uint32_t isaac_pgd_bestiary_addsib2_helper_ret_readonly_fail_va(void);
int32_t isaac_pgd_bestiary_addsib2_slot2_header_off(void);
int32_t isaac_pgd_bestiary_addsib2_marker_off(void);
int32_t isaac_pgd_bestiary_addsib2_key_off(void);
int32_t isaac_pgd_bestiary_addsib2_value_off(void);
uint32_t isaac_pgd_bestiary_addsib2_game_va(void);
int32_t isaac_pgd_bestiary_addsib2_container_off(void);
int32_t isaac_pgd_bestiary_addsib2_gate_byte_off(void);
uint32_t isaac_pgd_bestiary_addsib2_container_find_va(void);
uint32_t isaac_pgd_bestiary_addsib2_map_find_va(void);
uint32_t isaac_pgd_bestiary_addsib2_value_accessor_va(void);
uint32_t isaac_pgd_bestiary_addsib2_readonly_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib2_readonly_jne_va(void);
uint32_t isaac_pgd_bestiary_addsib2_rec_test_va(void);
uint32_t isaac_pgd_bestiary_addsib2_rec_je_va(void);
uint32_t isaac_pgd_bestiary_addsib2_gate_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib2_gate_je_va(void);
uint32_t isaac_pgd_bestiary_addsib2_key_shift12_va(void);
uint32_t isaac_pgd_bestiary_addsib2_key_or_va(void);
uint32_t isaac_pgd_bestiary_addsib2_key_shift8_va(void);
uint32_t isaac_pgd_bestiary_addsib2_helper_call_site_va(void);
uint32_t isaac_pgd_bestiary_addsib2_helper_readonly_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib2_helper_readonly_je_va(void);
uint32_t isaac_pgd_bestiary_addsib2_map_find_call_va(void);
uint32_t isaac_pgd_bestiary_addsib2_node_marker_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib2_node_marker_jne_va(void);
uint32_t isaac_pgd_bestiary_addsib2_node_key_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib2_node_key_jl_va(void);
uint32_t isaac_pgd_bestiary_addsib2_node_header_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib2_node_header_je_va(void);
uint32_t isaac_pgd_bestiary_addsib2_store_inc_va(void);
uint32_t isaac_pgd_bestiary_addsib2_store_set1_va(void);
int32_t isaac_pgd_bestiary_addsib2_ok(uint32_t readonly_byte,
                                      uint32_t rec_found,
                                      uint32_t gate_byte,
                                      uint32_t readonly_byte_helper);
int32_t isaac_pgd_bestiary_addsib2_helper_ok(uint32_t readonly_byte_helper);
uint32_t isaac_pgd_bestiary_addsib2_key(uint32_t rec_word0, uint32_t rec_word1);
int32_t isaac_pgd_bestiary_addsib2_node_ok(uint32_t marker_d, int32_t key,
                                           int32_t node_key,
                                           uint32_t node_is_header);
uint32_t isaac_pgd_bestiary_addsib2_store_value(uint32_t node_ok,
                                                uint32_t old_value);

enum {
  ISAAC_PGDADDSIB3_VA = 0x0092abd0u,
  ISAAC_PGDADDSIB3_RET_OK_VA = 0x0092ac15u,
  ISAAC_PGDADDSIB3_RET_FAIL_VA = 0x0092ac1cu,
  ISAAC_PGDADDSIB3_CALL_SITES = 1,
  ISAAC_PGDADDSIB3_CALL_SITE_0_VA = 0x007780c8u,
  ISAAC_PGDADDSIB3_HELPER_VA = 0x0092ac20u,
  ISAAC_PGDADDSIB3_HELPER_RET_OK_VA = 0x0092ac85u,
  ISAAC_PGDADDSIB3_HELPER_RET_INSERT_VA = 0x0092aca5u,
  ISAAC_PGDADDSIB3_HELPER_RET_READONLY_FAIL_VA = 0x0092ac38u,
  ISAAC_PGDADDSIB3_SLOT3_HEADER_OFF = 0xf7c,
  ISAAC_PGDADDSIB3_MARKER_OFF = 0xd,
  ISAAC_PGDADDSIB3_KEY_OFF = 0x10,
  ISAAC_PGDADDSIB3_VALUE_OFF = 0x14,
  ISAAC_PGDADDSIB3_GAME_VA = 0x00c7169cu,
  ISAAC_PGDADDSIB3_CONTAINER_OFF = 0x2a670,
  ISAAC_PGDADDSIB3_GATE_BYTE_OFF = 0xe8,
  ISAAC_PGDADDSIB3_CONTAINER_FIND_VA = 0x00695030u,
  ISAAC_PGDADDSIB3_MAP_FIND_VA = 0x004288a0u,
  ISAAC_PGDADDSIB3_VALUE_ACCESSOR_VA = 0x0092ca70u,
  ISAAC_PGDADDSIB3_READONLY_CMP_VA = 0x0092abd6u,
  ISAAC_PGDADDSIB3_READONLY_JNE_VA = 0x0092abdau,
  ISAAC_PGDADDSIB3_REC_TEST_VA = 0x0092abf3u,
  ISAAC_PGDADDSIB3_REC_JE_VA = 0x0092abf5u,
  ISAAC_PGDADDSIB3_GATE_CMP_VA = 0x0092abf7u,
  ISAAC_PGDADDSIB3_GATE_JE_VA = 0x0092abfeu,
  ISAAC_PGDADDSIB3_KEY_SHIFT12_VA = 0x0092ac02u,
  ISAAC_PGDADDSIB3_KEY_OR_VA = 0x0092ac05u,
  ISAAC_PGDADDSIB3_KEY_SHIFT8_VA = 0x0092ac08u,
  ISAAC_PGDADDSIB3_HELPER_CALL_SITE_VA = 0x0092ac0eu,
  ISAAC_PGDADDSIB3_HELPER_READONLY_CMP_VA = 0x0092ac29u,
  ISAAC_PGDADDSIB3_HELPER_READONLY_JE_VA = 0x0092ac2fu,
  ISAAC_PGDADDSIB3_MAP_FIND_CALL_VA = 0x0092ac54u,
  ISAAC_PGDADDSIB3_NODE_MARKER_CMP_VA = 0x0092ac5du,
  ISAAC_PGDADDSIB3_NODE_MARKER_JNE_VA = 0x0092ac61u,
  ISAAC_PGDADDSIB3_NODE_KEY_CMP_VA = 0x0092ac63u,
  ISAAC_PGDADDSIB3_NODE_KEY_JL_VA = 0x0092ac66u,
  ISAAC_PGDADDSIB3_NODE_HEADER_CMP_VA = 0x0092ac68u,
  ISAAC_PGDADDSIB3_NODE_HEADER_JE_VA = 0x0092ac6au,
  ISAAC_PGDADDSIB3_STORE_INC_VA = 0x0092ac7cu,
  ISAAC_PGDADDSIB3_STORE_SET1_VA = 0x0092ac9au
};

uint32_t isaac_pgd_bestiary_addsib3_va(void);
uint32_t isaac_pgd_bestiary_addsib3_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_addsib3_ret_fail_va(void);
int32_t isaac_pgd_bestiary_addsib3_call_site_count(void);
uint32_t isaac_pgd_bestiary_addsib3_call_site_va(int32_t index);
uint32_t isaac_pgd_bestiary_addsib3_helper_va(void);
uint32_t isaac_pgd_bestiary_addsib3_helper_ret_ok_va(void);
uint32_t isaac_pgd_bestiary_addsib3_helper_ret_insert_va(void);
uint32_t isaac_pgd_bestiary_addsib3_helper_ret_readonly_fail_va(void);
int32_t isaac_pgd_bestiary_addsib3_slot3_header_off(void);
int32_t isaac_pgd_bestiary_addsib3_marker_off(void);
int32_t isaac_pgd_bestiary_addsib3_key_off(void);
int32_t isaac_pgd_bestiary_addsib3_value_off(void);
uint32_t isaac_pgd_bestiary_addsib3_game_va(void);
int32_t isaac_pgd_bestiary_addsib3_container_off(void);
int32_t isaac_pgd_bestiary_addsib3_gate_byte_off(void);
uint32_t isaac_pgd_bestiary_addsib3_container_find_va(void);
uint32_t isaac_pgd_bestiary_addsib3_map_find_va(void);
uint32_t isaac_pgd_bestiary_addsib3_value_accessor_va(void);
uint32_t isaac_pgd_bestiary_addsib3_readonly_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib3_readonly_jne_va(void);
uint32_t isaac_pgd_bestiary_addsib3_rec_test_va(void);
uint32_t isaac_pgd_bestiary_addsib3_rec_je_va(void);
uint32_t isaac_pgd_bestiary_addsib3_gate_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib3_gate_je_va(void);
uint32_t isaac_pgd_bestiary_addsib3_key_shift12_va(void);
uint32_t isaac_pgd_bestiary_addsib3_key_or_va(void);
uint32_t isaac_pgd_bestiary_addsib3_key_shift8_va(void);
uint32_t isaac_pgd_bestiary_addsib3_helper_call_site_va(void);
uint32_t isaac_pgd_bestiary_addsib3_helper_readonly_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib3_helper_readonly_je_va(void);
uint32_t isaac_pgd_bestiary_addsib3_map_find_call_va(void);
uint32_t isaac_pgd_bestiary_addsib3_node_marker_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib3_node_marker_jne_va(void);
uint32_t isaac_pgd_bestiary_addsib3_node_key_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib3_node_key_jl_va(void);
uint32_t isaac_pgd_bestiary_addsib3_node_header_cmp_va(void);
uint32_t isaac_pgd_bestiary_addsib3_node_header_je_va(void);
uint32_t isaac_pgd_bestiary_addsib3_store_inc_va(void);
uint32_t isaac_pgd_bestiary_addsib3_store_set1_va(void);
int32_t isaac_pgd_bestiary_addsib3_ok(uint32_t readonly_byte,
                                      uint32_t rec_found,
                                      uint32_t gate_byte,
                                      uint32_t readonly_byte_helper);
int32_t isaac_pgd_bestiary_addsib3_helper_ok(uint32_t readonly_byte_helper);
uint32_t isaac_pgd_bestiary_addsib3_key(uint32_t rec_word0, uint32_t rec_word1);
int32_t isaac_pgd_bestiary_addsib3_node_ok(uint32_t marker_d, int32_t key,
                                           int32_t node_key,
                                           uint32_t node_is_header);
uint32_t isaac_pgd_bestiary_addsib3_store_value(uint32_t node_ok,
                                                uint32_t old_value);

/* PGDADDCH: PersistentGameData::AddChallenge dispatcher 0x0092a7b0
   (EXACT ZHL; ret 4 @0x92aa2c; caller 0x704f84). Body laws (TryUnlock
   0x929a20 stays HOST):
     - readonly gate `cmp byte [ecx+1],0 ; jne fail` @0x92a7b3/
       @0x92a7ba: readonly LOW BYTE != 0 -> fail (no store).
     - arg gate 1 `cmp eax,0x2d ; ja fail` @0x92a7c0/@0x92a7c3:
       arg UNSIGNED > 0x2d -> fail (no store).
     - flag store `mov byte [eax+ecx+0xe6f],1` @0x92a7c9: byte
       [pgd+0xe6f+arg] = 1 — runs BEFORE the dispatch gate, so
       arg == 0 STOREs the flag byte but never unlocks.
     - dispatch gate `dec eax ; cmp eax,0x2c ; ja fail` @0x92a7d1/
       @0x92a7d2/@0x92a7d5: (arg-1) UNSIGNED > 0x2c -> fail.
     - tail `jmp dword [eax*4+0x92aa30]` @0x92a7db: table[arg-1]
       arm `mov [ebp+8],<id> ; pop ebp ; jmp 0x929a20` (TryUnlock,
       45 entries idx 0..44, ids 0x59..0x21a). */
enum {
  ISAAC_PGDADDCH_VA = 0x0092a7b0u,
  ISAAC_PGDADDCH_RET_FAIL_VA = 0x0092aa2cu,
  ISAAC_PGDADDCH_RET_FAIL_TAIL_VA = 0x0092aa2bu,
  ISAAC_PGDADDCH_CALL_SITES = 1,
  ISAAC_PGDADDCH_CALL_SITE_0_VA = 0x00704f84u,
  ISAAC_PGDADDCH_READONLY_CMP_VA = 0x0092a7b3u,
  ISAAC_PGDADDCH_READONLY_JNE_VA = 0x0092a7bau,
  ISAAC_PGDADDCH_ARG_GATE1_CMP_VA = 0x0092a7c0u,
  ISAAC_PGDADDCH_ARG_GATE1_JA_VA = 0x0092a7c3u,
  ISAAC_PGDADDCH_FLAG_STORE_VA = 0x0092a7c9u,
  ISAAC_PGDADDCH_FLAG_OFF = 0xe6f,
  ISAAC_PGDADDCH_DEC_VA = 0x0092a7d1u,
  ISAAC_PGDADDCH_ARG_GATE2_CMP_VA = 0x0092a7d2u,
  ISAAC_PGDADDCH_ARG_GATE2_JA_VA = 0x0092a7d5u,
  ISAAC_PGDADDCH_JUMP_VA = 0x0092a7dbu,
  ISAAC_PGDADDCH_TABLE_VA = 0x0092aa30u,
  ISAAC_PGDADDCH_TABLE_ENTRIES = 0x2d,
  ISAAC_PGDADDCH_FIRST_ARM_VA = 0x0092a7e2u,
  ISAAC_PGDADDCH_LAST_ARM_VA = 0x0092aa1eu,
  ISAAC_PGDADDCH_TAIL_TARGET_VA = 0x00929a20u,
  ISAAC_PGDADDCH_MAX_ARG = 0x2d,
  ISAAC_PGDADDCH_MAX_INDEX = 0x2c
};

uint32_t isaac_pgd_addchallenge_va(void);
uint32_t isaac_pgd_addchallenge_ret_fail_va(void);
uint32_t isaac_pgd_addchallenge_ret_fail_tail_va(void);
int32_t isaac_pgd_addchallenge_call_site_count(void);
uint32_t isaac_pgd_addchallenge_call_site_va(int32_t index);
uint32_t isaac_pgd_addchallenge_readonly_cmp_va(void);
uint32_t isaac_pgd_addchallenge_readonly_jne_va(void);
uint32_t isaac_pgd_addchallenge_arg_gate1_cmp_va(void);
uint32_t isaac_pgd_addchallenge_arg_gate1_ja_va(void);
uint32_t isaac_pgd_addchallenge_flag_store_va(void);
int32_t isaac_pgd_addchallenge_flag_off(void);
uint32_t isaac_pgd_addchallenge_dec_va(void);
uint32_t isaac_pgd_addchallenge_arg_gate2_cmp_va(void);
uint32_t isaac_pgd_addchallenge_arg_gate2_ja_va(void);
uint32_t isaac_pgd_addchallenge_jump_va(void);
uint32_t isaac_pgd_addchallenge_table_va(void);
int32_t isaac_pgd_addchallenge_table_entries(void);
uint32_t isaac_pgd_addchallenge_first_arm_va(void);
uint32_t isaac_pgd_addchallenge_last_arm_va(void);
uint32_t isaac_pgd_addchallenge_tail_target_va(void);
int32_t isaac_pgd_addchallenge_max_arg(void);
int32_t isaac_pgd_addchallenge_max_index(void);
uint32_t isaac_pgd_addchallenge_table_entry_va(int32_t index);
uint32_t isaac_pgd_addchallenge_unlock_id(int32_t index);
int32_t isaac_pgd_addchallenge_flag_store_gate(uint32_t readonly_byte,
                                               uint32_t arg);
int32_t isaac_pgd_addchallenge_dispatch_gate(uint32_t readonly_byte,
                                             uint32_t arg);
uint32_t isaac_pgd_addchallenge_flag_byte_off(uint32_t arg);
uint32_t isaac_pgd_addchallenge_unlock_id_for_arg(uint32_t arg);

/* PGDADDBOSS: PersistentGameData::AddBoss mutator 0x0092a5e0
   (EXACT ZHL; ret 4 @0x92a79f; callers 0x7fc01f / 0x7ff7a8). Body
   laws (TryUnlock 0x929a20 + log helper 0xa112c0 stay HOST):
     - readonly gate `cmp byte [esi+1],0 ; jne fail` @0x92a5e6/
       @0x92a5ea: readonly LOW BYTE != 0 -> fail (no work).
     - arg gate `cmp eax,0x68 ; jge fail` @0x92a5f3/@0x92a5f6:
       arg >= 0x68 SIGNED -> fail; NO floor (negative bossIDs pass
       and wrap the store offset — the v16 boss_index_valid law).
     - flag store `mov byte [eax+esi+0xe07],1` @0x92a602: byte
       [pgd+0xe07+arg] = 1 (0xe07 = ISAAC_PGD_OFF_BOSSES,
       0x68 values 0..0x67 = ISAAC_PGD_COUNT_BOSSES).
     - dirty store `mov byte [esi],1` @0x92a60c (pgd+0 =
       ISAAC_PGD_OFF_CHANGES_MADE); host log `(1, 0xb7ae90, arg)`
       cdecl @0x92a60f -> 0xa112c0 ("Boss %d added to SaveState\n").
     - eight sequential TryUnlock blocks, each an ALL-nonzero
       AND-gate over a fixed byte-offset set (`cmp byte,0 ; je skip`
       @block_start..push): B1 e08,e09,e14,e18,e33,e3f -> 0x56;
       B2 e0a,e0b,e15,e23,e36,e34 -> 0x57; B3 e0c,e0d,e16,e37,e35
       -> 0x58; B4 e26 -> 0xf; B5 e10,e11,e12,e13,e2d -> 0x174;
       B6 e54,e52,e53,e62 -> 0x19c; B7 e5a,e57,e51,e59 -> 0x19d;
       B8 e0d,e56,e58 -> 0x19e (e0d read by BOTH B3 and B8). All
       eight calls run in sequence; each is `push <id> ; mov ecx,esi
       ; call 0x929a20` and returns. */
enum {
  ISAAC_PGDADDBOSS_VA = 0x0092a5e0u,
  ISAAC_PGDADDBOSS_RET_FAIL_VA = 0x0092a79fu,
  ISAAC_PGDADDBOSS_RET_FAIL_TAIL_VA = 0x0092a79du,
  ISAAC_PGDADDBOSS_CALL_SITES = 2,
  ISAAC_PGDADDBOSS_CALL_SITE_0_VA = 0x007fc01fu,
  ISAAC_PGDADDBOSS_CALL_SITE_1_VA = 0x007ff7a8u,
  ISAAC_PGDADDBOSS_READONLY_CMP_VA = 0x0092a5e6u,
  ISAAC_PGDADDBOSS_READONLY_JNE_VA = 0x0092a5eau,
  ISAAC_PGDADDBOSS_ARG_GATE_CMP_VA = 0x0092a5f3u,
  ISAAC_PGDADDBOSS_ARG_GATE_JGE_VA = 0x0092a5f6u,
  ISAAC_PGDADDBOSS_FLAG_STORE_VA = 0x0092a602u,
  ISAAC_PGDADDBOSS_FLAG_OFF = 0xe07,
  ISAAC_PGDADDBOSS_DIRTY_STORE_VA = 0x0092a60cu,
  ISAAC_PGDADDBOSS_DIRTY_OFF = 0,
  ISAAC_PGDADDBOSS_LOG_STRING_VA = 0x00b7ae90u,
  ISAAC_PGDADDBOSS_LOG_CALL_VA = 0x0092a60fu,
  ISAAC_PGDADDBOSS_LOG_CALLEE_VA = 0x00a112c0u,
  ISAAC_PGDADDBOSS_UNLOCK_CHAIN_VA = 0x0092a617u,
  ISAAC_PGDADDBOSS_UNLOCK_BLOCKS = 8,
  ISAAC_PGDADDBOSS_TAIL_TARGET_VA = 0x00929a20u,
  ISAAC_PGDADDBOSS_MAX_ARG = 0x67,
  ISAAC_PGDADDBOSS_MAX_INDEX = 0x67
};

uint32_t isaac_pgd_addboss_va(void);
uint32_t isaac_pgd_addboss_ret_fail_va(void);
uint32_t isaac_pgd_addboss_ret_fail_tail_va(void);
int32_t isaac_pgd_addboss_call_site_count(void);
uint32_t isaac_pgd_addboss_call_site_va(int32_t index);
uint32_t isaac_pgd_addboss_readonly_cmp_va(void);
uint32_t isaac_pgd_addboss_readonly_jne_va(void);
uint32_t isaac_pgd_addboss_arg_gate_cmp_va(void);
uint32_t isaac_pgd_addboss_arg_gate_jge_va(void);
uint32_t isaac_pgd_addboss_flag_store_va(void);
int32_t isaac_pgd_addboss_flag_off(void);
uint32_t isaac_pgd_addboss_dirty_store_va(void);
int32_t isaac_pgd_addboss_dirty_off(void);
uint32_t isaac_pgd_addboss_log_string_va(void);
uint32_t isaac_pgd_addboss_log_call_va(void);
uint32_t isaac_pgd_addboss_log_callee_va(void);
uint32_t isaac_pgd_addboss_unlock_chain_va(void);
int32_t isaac_pgd_addboss_unlock_blocks(void);
uint32_t isaac_pgd_addboss_tail_target_va(void);
int32_t isaac_pgd_addboss_max_arg(void);
int32_t isaac_pgd_addboss_max_index(void);
uint32_t isaac_pgd_addboss_block_first_cmp_va(int32_t block_index);
uint32_t isaac_pgd_addboss_block_call_va(int32_t block_index);
uint32_t isaac_pgd_addboss_block_push_va(int32_t block_index);
int32_t isaac_pgd_addboss_block_byte_count(int32_t block_index);
uint32_t isaac_pgd_addboss_block_byte_off(int32_t block_index,
                                          int32_t slot);
uint32_t isaac_pgd_addboss_block_unlock_id(int32_t block_index);
int32_t isaac_pgd_addboss_entry_gate(uint32_t readonly_byte,
                                     uint32_t arg);
uint32_t isaac_pgd_addboss_flag_byte_off(uint32_t arg);
int32_t isaac_pgd_addboss_block_gate(int32_t block_index,
                                     uint32_t b0, uint32_t b1,
                                     uint32_t b2, uint32_t b3,
                                     uint32_t b4, uint32_t b5);
uint32_t isaac_pgd_addboss_unlock_fires(int32_t block_index,
                                        uint32_t b0, uint32_t b1,
                                        uint32_t b2, uint32_t b3,
                                        uint32_t b4, uint32_t b5);

/* PGDADDMINI: PersistentGameData::AddMiniBoss mutator 0x0092a520
   (no exact ZHL — self-named by its warning string; address-stable;
   ret 4 @0x92a5d3; callers 0x7ffff1 / 0x800010). Body laws
   (TryUnlock 0x929a20 + log helper 0xa112c0 stay HOST):
     - readonly gate `cmp byte [esi+1],0 ; jne fail` @0x92a529/
       @0x92a52d: readonly LOW BYTE != 0 -> fail (no work).
     - id window `cmp eax,0xf ; ja warn` @0x92a533/@0x92a536 UNSIGNED:
       arg > 0xf -> warn path (log (1, 0xb7aecc, ORIGINAL arg), then
       fail tail; no store). Negatives warn too (unsigned window).
     - id->index fold @0x92a53c..0x92a557: 7..0xd -> arg-7 (0..6),
       0xe -> 6 (alias), 0..6 -> arg, 0xf -> SILENT fail (no store,
       no log; signed `cmp eax,6 ; jg`).
     - flag store `mov byte [eax+esi+0xe00],1` @0x92a55f: byte
       [pgd+0xe00+idx] = 1 (0xe00 = ISAAC_PGD_OFF_SEC5_BYTES,
       7 slots = ISAAC_PGD_COUNT_SEC5).
     - dirty store `mov byte [esi],1` @0x92a569 (pgd+0 =
       ISAAC_PGD_OFF_CHANGES_MADE); host log `(1, 0xb7aeac, idx)`
       cdecl @0x92a56c -> 0xa112c0 ("MiniBoss %d added to SaveState\n").
     - ALL-SET gate over the seven flags 0xe00..0xe06 (`cmp byte,0 ;
       je fail` @0x92a574..0x92a5b1): ALL nonzero required, then
       `push 0x16 ; mov ecx,esi ; call 0x929a20` (TryUnlock) @0x92a5b7
       (unlock id 0x16 = the model's PGD_SEC5_UNLOCK_ID). */
enum {
  ISAAC_PGDADDMINI_VA = 0x0092a520u,
  ISAAC_PGDADDMINI_RET_FAIL_VA = 0x0092a5d3u,
  ISAAC_PGDADDMINI_RET_FAIL_TAIL_VA = 0x0092a5d1u,
  ISAAC_PGDADDMINI_RET_OK_VA = 0x0092a5beu,
  ISAAC_PGDADDMINI_CALL_SITES = 2,
  ISAAC_PGDADDMINI_CALL_SITE_0_VA = 0x007ffff1u,
  ISAAC_PGDADDMINI_CALL_SITE_1_VA = 0x00800010u,
  ISAAC_PGDADDMINI_READONLY_CMP_VA = 0x0092a529u,
  ISAAC_PGDADDMINI_READONLY_JNE_VA = 0x0092a52du,
  ISAAC_PGDADDMINI_ARG_GATE_CMP_VA = 0x0092a533u,
  ISAAC_PGDADDMINI_ARG_GATE_JA_VA = 0x0092a536u,
  ISAAC_PGDADDMINI_MAP_LEA_VA = 0x0092a53cu,
  ISAAC_PGDADDMINI_MAP_CMP_VA = 0x0092a53fu,
  ISAAC_PGDADDMINI_MAP_JA_VA = 0x0092a542u,
  ISAAC_PGDADDMINI_ALIAS_CMP_VA = 0x0092a548u,
  ISAAC_PGDADDMINI_ALIAS_JNE_VA = 0x0092a54bu,
  ISAAC_PGDADDMINI_ALIAS_MOV_VA = 0x0092a54du,
  ISAAC_PGDADDMINI_TAIL_CMP_VA = 0x0092a554u,
  ISAAC_PGDADDMINI_TAIL_JG_VA = 0x0092a557u,
  ISAAC_PGDADDMINI_FLAG_STORE_VA = 0x0092a55fu,
  ISAAC_PGDADDMINI_FLAG_OFF = 0xe00,
  ISAAC_PGDADDMINI_DIRTY_STORE_VA = 0x0092a569u,
  ISAAC_PGDADDMINI_DIRTY_OFF = 0,
  ISAAC_PGDADDMINI_LOG_STRING_VA = 0x00b7aeacu,
  ISAAC_PGDADDMINI_LOG_CALL_VA = 0x0092a56cu,
  ISAAC_PGDADDMINI_LOG_CALLEE_VA = 0x00a112c0u,
  ISAAC_PGDADDMINI_WARN_STRING_VA = 0x00b7aeccu,
  ISAAC_PGDADDMINI_WARN_CALL_VA = 0x0092a5c9u,
  ISAAC_PGDADDMINI_UNLOCK_FIRST_CMP_VA = 0x0092a574u,
  ISAAC_PGDADDMINI_UNLOCK_PUSH_VA = 0x0092a5b3u,
  ISAAC_PGDADDMINI_UNLOCK_CALL_VA = 0x0092a5b7u,
  ISAAC_PGDADDMINI_UNLOCK_TARGET_VA = 0x00929a20u,
  ISAAC_PGDADDMINI_SLOTS = 7,
  ISAAC_PGDADDMINI_UNLOCK_ID = 0x16,
  ISAAC_PGDADDMINI_ID_MAX = 0xf,
  ISAAC_PGDADDMINI_REMAP_BASE = 7,
  ISAAC_PGDADDMINI_REMAP_SPAN = 6,
  ISAAC_PGDADDMINI_ALIAS_ID = 0xe
};

uint32_t isaac_pgd_addmini_va(void);
uint32_t isaac_pgd_addmini_ret_fail_va(void);
uint32_t isaac_pgd_addmini_ret_fail_tail_va(void);
uint32_t isaac_pgd_addmini_ret_ok_va(void);
int32_t isaac_pgd_addmini_call_site_count(void);
uint32_t isaac_pgd_addmini_call_site_va(int32_t index);
uint32_t isaac_pgd_addmini_readonly_cmp_va(void);
uint32_t isaac_pgd_addmini_readonly_jne_va(void);
uint32_t isaac_pgd_addmini_arg_gate_cmp_va(void);
uint32_t isaac_pgd_addmini_arg_gate_ja_va(void);
uint32_t isaac_pgd_addmini_map_lea_va(void);
uint32_t isaac_pgd_addmini_map_cmp_va(void);
uint32_t isaac_pgd_addmini_map_ja_va(void);
uint32_t isaac_pgd_addmini_alias_cmp_va(void);
uint32_t isaac_pgd_addmini_alias_jne_va(void);
uint32_t isaac_pgd_addmini_alias_mov_va(void);
uint32_t isaac_pgd_addmini_tail_cmp_va(void);
uint32_t isaac_pgd_addmini_tail_jg_va(void);
uint32_t isaac_pgd_addmini_flag_store_va(void);
int32_t isaac_pgd_addmini_flag_off(void);
uint32_t isaac_pgd_addmini_dirty_store_va(void);
int32_t isaac_pgd_addmini_dirty_off(void);
uint32_t isaac_pgd_addmini_log_string_va(void);
uint32_t isaac_pgd_addmini_log_call_va(void);
uint32_t isaac_pgd_addmini_log_callee_va(void);
uint32_t isaac_pgd_addmini_warn_string_va(void);
uint32_t isaac_pgd_addmini_warn_call_va(void);
uint32_t isaac_pgd_addmini_unlock_first_cmp_va(void);
uint32_t isaac_pgd_addmini_unlock_push_va(void);
uint32_t isaac_pgd_addmini_unlock_call_va(void);
uint32_t isaac_pgd_addmini_unlock_target_va(void);
int32_t isaac_pgd_addmini_slots(void);
int32_t isaac_pgd_addmini_unlock_id(void);
int32_t isaac_pgd_addmini_id_max(void);
int32_t isaac_pgd_addmini_remap_base(void);
int32_t isaac_pgd_addmini_remap_span(void);
int32_t isaac_pgd_addmini_alias_id(void);
int32_t isaac_pgd_addmini_index_remap(uint32_t arg);
int32_t isaac_pgd_addmini_out_of_range(uint32_t arg);
int32_t isaac_pgd_addmini_outcome(uint32_t readonly_byte, uint32_t arg);
uint32_t isaac_pgd_addmini_flag_byte_off(uint32_t index);
int32_t isaac_pgd_addmini_unlock_gate(uint32_t b0, uint32_t b1,
                                      uint32_t b2, uint32_t b3,
                                      uint32_t b4, uint32_t b5,
                                      uint32_t b6);
uint32_t isaac_pgd_addmini_unlock_fires(uint32_t b0, uint32_t b1,
                                        uint32_t b2, uint32_t b3,
                                        uint32_t b4, uint32_t b5,
                                        uint32_t b6);

/* PGDADSED: PersistentGameData "seed added to SaveState" mutator
   0x0092b230 (no exact ZHL — self-named by its log string "Seed %d
   added to SaveState\n" @0xb7ae58; address-stable; ret 4 @0x92b25f;
   int3 pad 0x92b262..0x92b26e; inbound from the update slice
   0x68cdc0 @0x69166e). Body laws (the cdecl log helper 0xa112c0
   stays HOST):
     - readonly gate `cmp byte [ecx+1],0 ; jne ret` @0x92b233/
       @0x92b237: LOW BYTE of pgd+1 (ISAAC_PGD_OFF_READONLY) != 0 ->
       return with NO work at all.
     - unchecked slot store `mov byte [eax+ecx+0xf14],1` @0x92b244:
       byte [pgd+0xf14+SEED] = 1 — the seed is the RAW byte index
       (0xf14 = ISAAC_PGD_OFF_SEC10_BYTES, 0x50 slots =
       ISAAC_PGD_COUNT_SEC10; never masked or bounded; a seed >=
       0x50 writes out of the array — original behaviour).
     - unconditional slot-0 clear `mov byte [ecx+0xf14],0`
       @0x92b24c right after the store — seed==0 self-cancels.
     - dirty store `mov byte [ecx],1` @0x92b253 (pgd+0 =
       ISAAC_PGD_OFF_CHANGES_MADE).
     - the log args (1, 0xb7ae58, SEED) are pushed BEFORE the
       stores; cdecl call @0x92b256 -> 0xa112c0 stays HOST. */
enum {
  ISAAC_PGDADSED_VA = 0x0092b230u,
  ISAAC_PGDADSED_RET_VA = 0x0092b25fu,
  ISAAC_PGDADSED_READONLY_CMP_VA = 0x0092b233u,
  ISAAC_PGDADSED_READONLY_JNE_VA = 0x0092b237u,
  ISAAC_PGDADSED_SLOT_STORE_VA = 0x0092b244u,
  ISAAC_PGDADSED_SLOT0_CLEAR_VA = 0x0092b24cu,
  ISAAC_PGDADSED_SLOT_BASE = 0xf14,
  ISAAC_PGDADSED_SLOTS = 0x50,
  ISAAC_PGDADSED_DIRTY_STORE_VA = 0x0092b253u,
  ISAAC_PGDADSED_DIRTY_OFF = 0,
  ISAAC_PGDADSED_READONLY_OFF = 1,
  ISAAC_PGDADSED_LOG_STRING_VA = 0x00b7ae58u,
  ISAAC_PGDADSED_LOG_CALL_VA = 0x0092b256u,
  ISAAC_PGDADSED_LOG_CALLEE_VA = 0x00a112c0u
};

uint32_t isaac_pgd_adsed_va(void);
uint32_t isaac_pgd_adsed_ret_va(void);
uint32_t isaac_pgd_adsed_readonly_cmp_va(void);
uint32_t isaac_pgd_adsed_readonly_jne_va(void);
uint32_t isaac_pgd_adsed_slot_store_va(void);
uint32_t isaac_pgd_adsed_slot0_clear_va(void);
int32_t isaac_pgd_adsed_slot_base(void);
int32_t isaac_pgd_adsed_slots(void);
uint32_t isaac_pgd_adsed_dirty_store_va(void);
int32_t isaac_pgd_adsed_dirty_off(void);
int32_t isaac_pgd_adsed_readonly_off(void);
uint32_t isaac_pgd_adsed_log_string_va(void);
uint32_t isaac_pgd_adsed_log_call_va(void);
uint32_t isaac_pgd_adsed_log_callee_va(void);
int32_t isaac_pgd_adsed_gate(uint32_t readonly_byte);
int32_t isaac_pgd_adsed_outcome(uint32_t readonly_byte, uint32_t seed);
uint32_t isaac_pgd_adsed_store_index(uint32_t seed);
int32_t isaac_pgd_adsed_self_cancelling(uint32_t seed);
int32_t isaac_pgd_adsed_slot0_after(uint32_t readonly_byte, uint32_t seed);
int32_t isaac_pgd_adsed_dirty_fires(uint32_t readonly_byte, uint32_t seed);

/* PGDK41: the 41-bit two-word popcount gate 0x0092b270 (no exact
   ZHL; address-stable; ret 8 @0x92b2d9). Body laws (TryUnlock
   0x929a20 stays HOST):
     - counter stores `mov [ebx+0x5ac],eax` @0x92b281 / `mov
       [ebx+0xa7c],eax` @0x92b28a: first arg -> counters[188],
       second arg -> counters[496] (0x2bc =
       ISAAC_PGD_OFF_EVENT_COUNTERS).
     - the 41-iteration loop @0x92b295..0x92b2ba counts set bits
       over bits 0..40: `bts esi,ecx` masks the bit index to 5 bits;
       `cmp ecx,0x20 ; cmovae edx,esi ; xor esi,edx` zeroes the low
       word for i>=32; `and esi,[ebp+8] ; and edx,[ebp+0xc] ; or ;
       je` tests lo bit i (i<32) and hi bit i-32 (i>=32); `jl
       0x92b295` bound 0x29 = 41 bits.
     - `cmp edi,5 ; jl 0x92b2d0` @0x92b2bf/@0x92b2c2 SIGNED ->
       popcount >= 5 opens the unlock: `push 0x143 ; mov ecx,ebx ;
       call 0x929a20` @0x92b2c4/@0x92b2cb (TryUnlock, stays HOST).
     - dirty store `mov byte [ebx],1` @0x92b2d2 UNCONDITIONAL —
       runs even when the unlock does not (pgd+0 =
       ISAAC_PGD_OFF_CHANGES_MADE). */
enum {
  ISAAC_PGDK41_VA = 0x0092b270u,
  ISAAC_PGDK41_RET_VA = 0x0092b2d9u,
  ISAAC_PGDK41_LO_COUNTER_STORE_VA = 0x0092b281u,
  ISAAC_PGDK41_HI_COUNTER_STORE_VA = 0x0092b28au,
  ISAAC_PGDK41_LO_COUNTER_INDEX = 188,
  ISAAC_PGDK41_HI_COUNTER_INDEX = 496,
  ISAAC_PGDK41_BITS = 0x29,
  ISAAC_PGDK41_LOOP_BTS_VA = 0x0092b29bu,
  ISAAC_PGDK41_LOOP_BOUND_CMP_VA = 0x0092b2b7u,
  ISAAC_PGDK41_LOOP_BOUND_JL_VA = 0x0092b2bau,
  ISAAC_PGDK41_LOOP_OR_JE_VA = 0x0092b2b1u,
  ISAAC_PGDK41_GATE_CMP_VA = 0x0092b2bfu,
  ISAAC_PGDK41_GATE_JL_VA = 0x0092b2c2u,
  ISAAC_PGDK41_UNLOCK_PUSH_VA = 0x0092b2c4u,
  ISAAC_PGDK41_UNLOCK_CALL_VA = 0x0092b2cbu,
  ISAAC_PGDK41_UNLOCK_TARGET_VA = 0x00929a20u,
  ISAAC_PGDK41_UNLOCK_ID = 0x143,
  ISAAC_PGDK41_UNLOCK_THRESHOLD = 5,
  ISAAC_PGDK41_DIRTY_STORE_VA = 0x0092b2d2u,
  ISAAC_PGDK41_DIRTY_OFF = 0,
  ISAAC_PGDK41_COUNTER_BASE = 0x2bc
};

uint32_t isaac_pgd_k41_va(void);
uint32_t isaac_pgd_k41_ret_va(void);
uint32_t isaac_pgd_k41_lo_counter_store_va(void);
uint32_t isaac_pgd_k41_hi_counter_store_va(void);
int32_t isaac_pgd_k41_lo_counter_index(void);
int32_t isaac_pgd_k41_hi_counter_index(void);
int32_t isaac_pgd_k41_bits(void);
uint32_t isaac_pgd_k41_loop_bts_va(void);
uint32_t isaac_pgd_k41_loop_bound_cmp_va(void);
uint32_t isaac_pgd_k41_loop_bound_jl_va(void);
uint32_t isaac_pgd_k41_loop_or_je_va(void);
uint32_t isaac_pgd_k41_gate_cmp_va(void);
uint32_t isaac_pgd_k41_gate_jl_va(void);
uint32_t isaac_pgd_k41_unlock_push_va(void);
uint32_t isaac_pgd_k41_unlock_call_va(void);
uint32_t isaac_pgd_k41_unlock_target_va(void);
int32_t isaac_pgd_k41_unlock_id(void);
int32_t isaac_pgd_k41_unlock_threshold(void);
uint32_t isaac_pgd_k41_dirty_store_va(void);
int32_t isaac_pgd_k41_dirty_off(void);
int32_t isaac_pgd_k41_counter_base(void);
int32_t isaac_pgd_k41_popcount(uint32_t lo, uint32_t hi);
int32_t isaac_pgd_k41_gate(uint32_t lo, uint32_t hi);
uint32_t isaac_pgd_k41_unlock_fires(uint32_t lo, uint32_t hi);
int32_t isaac_pgd_k41_dirty_fires(uint32_t lo, uint32_t hi);
uint32_t isaac_pgd_k41_counter_store_off(uint32_t counter_index);

/* ---------- ABI v24 — PGDITAG + PGDIDISP: the shared Rebirth-save
   snapshot reader 0x009e4260 (no exact ZHL; inbound from
   TryImportRebirthLocalSave 0x92b2e0 @0x92b574; ret 0x9e4aa1,
   fail-tail ret 0x9e4ac7; evidence: section-notes/pgd-v24/). */

enum {
  /* PGDITAG — the version-tag comparison table. */
  ISAAC_PGDITAG_HEADERS = 10,
  ISAAC_PGDITAG_TAG_BYTES = 0xc,
  ISAAC_PGDITAG_TAG_DWORDS = 3,
  ISAAC_PGDITAG_READ_BYTES = 0x10,
  ISAAC_PGDITAG_READ_CALL_VA = 0x009e4282u,
  ISAAC_PGDITAG_FIRST_CMP_VA = 0x009e4294u,
  ISAAC_PGDITAG_HEADER0_VA = 0x00b805bcu,
  ISAAC_PGDITAG_HEADER1_VA = 0x00b8060cu,
  ISAAC_PGDITAG_HEADER2_VA = 0x00b805a8u,
  ISAAC_PGDITAG_HEADER3_VA = 0x00b805f8u,
  ISAAC_PGDITAG_HEADER4_VA = 0x00b805e4u,
  ISAAC_PGDITAG_HEADER5_VA = 0x00b80514u,
  ISAAC_PGDITAG_HEADER6_VA = 0x00b805d0u,
  ISAAC_PGDITAG_HEADER7_VA = 0x00b80500u,
  ISAAC_PGDITAG_HEADER8_VA = 0x00b1b98cu,
  ISAAC_PGDITAG_HEADER9_VA = 0x00b80560u,
  ISAAC_PGDITAG_FAIL_LOG_VA = 0x00b80528u,
  ISAAC_PGDITAG_FAIL_TAIL_VA = 0x009e4aa2u,
  /* per-header dispatch rows: section + element count (0 = row 0). */
  ISAAC_PGDITAG_SECTION_ROW0 = 2,
  ISAAC_PGDITAG_SECTION_ROW1 = 2,
  ISAAC_PGDITAG_SECTION_ROW2 = 3,
  ISAAC_PGDITAG_SECTION_ROW3 = 3,
  ISAAC_PGDITAG_SECTION_ROW4 = 4,
  ISAAC_PGDITAG_SECTION_ROW5 = 4,
  ISAAC_PGDITAG_SECTION_ROW6 = 5,
  ISAAC_PGDITAG_SECTION_ROW7 = 5,
  ISAAC_PGDITAG_SECTION_ROW8 = 6,
  ISAAC_PGDITAG_SECTION_ROW9 = 6,
  ISAAC_PGDITAG_COUNT_ROW0 = 7,
  ISAAC_PGDITAG_COUNT_ROW1 = 7,
  ISAAC_PGDITAG_COUNT_ROW2 = 8,
  ISAAC_PGDITAG_COUNT_ROW3 = 8,
  ISAAC_PGDITAG_COUNT_ROW4 = 8,
  ISAAC_PGDITAG_COUNT_ROW5 = 8,
  ISAAC_PGDITAG_COUNT_ROW6 = 9,
  ISAAC_PGDITAG_COUNT_ROW7 = 9,
  ISAAC_PGDITAG_COUNT_ROW8 = 9,
  ISAAC_PGDITAG_COUNT_ROW9 = 9,
  /* the tag dwords (all ten rows currently equal these). */
  ISAAC_PGDITAG_DWORD0 = 0x41415349u,
  ISAAC_PGDITAG_DWORD1 = 0x53474e43u,
  ISAAC_PGDITAG_DWORD2 = 0x30455641u,
  /* PGDIDISP — the section-record loop + 9-row dispatch table. */
  ISAAC_PGDIDISP_TABLE_VA = 0x009e4ac8u,
  ISAAC_PGDIDISP_ENTRIES = 9,
  ISAAC_PGDIDISP_GATE_CMP_VA = 0x009e44cdu,
  ISAAC_PGDIDISP_GATE_JA_VA = 0x009e44d0u,
  ISAAC_PGDIDISP_ENTRY_JS_VA = 0x009e448au,
  ISAAC_PGDIDISP_ENTRY_JGE_VA = 0x009e4492u,
  ISAAC_PGDIDISP_COUNT_CMP_VA = 0x009e44bfu,
  ISAAC_PGDIDISP_COUNT_JBE_VA = 0x009e44c3u,
  ISAAC_PGDIDISP_LOOP_JAE_VA = 0x009e4530u,
  ISAAC_PGDIDISP_LOOP_JB_VA = 0x009e4555u,
  ISAAC_PGDIDISP_NEXT_VTBL_CALL_VA = 0x009e45e8u,
  ISAAC_PGDIDISP_NEXT_JE_VA = 0x009e45ecu,
  /* dispatch rows (index 0..8 = section 1..9). */
  ISAAC_PGDIDISP_SECTION0 = 1,
  ISAAC_PGDIDISP_SECTION1 = 2,
  ISAAC_PGDIDISP_SECTION2 = 3,
  ISAAC_PGDIDISP_SECTION3 = 4,
  ISAAC_PGDIDISP_SECTION4 = 5,
  ISAAC_PGDIDISP_SECTION5 = 6,
  ISAAC_PGDIDISP_SECTION6 = 7,
  ISAAC_PGDIDISP_SECTION7 = 8,
  ISAAC_PGDIDISP_SECTION8 = 9,
  ISAAC_PGDIDISP_TARGET0_VA = 0x009e44ddu,
  ISAAC_PGDIDISP_TARGET1_VA = 0x009e455cu,
  ISAAC_PGDIDISP_TARGET2_VA = 0x009e4635u,
  ISAAC_PGDIDISP_TARGET3_VA = 0x009e46b4u,
  ISAAC_PGDIDISP_TARGET4_VA = 0x009e4739u,
  ISAAC_PGDIDISP_TARGET5_VA = 0x009e47b7u,
  ISAAC_PGDIDISP_TARGET6_VA = 0x009e4835u,
  ISAAC_PGDIDISP_TARGET7_VA = 0x009e48b3u,
  ISAAC_PGDIDISP_TARGET8_VA = 0x009e4932u,
  ISAAC_PGDIDISP_OFF0 = 0x38,
  ISAAC_PGDIDISP_OFF1 = 0xec,
  ISAAC_PGDIDISP_OFF2 = 0x3c4,
  ISAAC_PGDIDISP_OFF3 = 0x268,
  ISAAC_PGDIDISP_OFF4 = 0x3f4,
  ISAAC_PGDIDISP_OFF5 = 0x3fb,
  ISAAC_PGDIDISP_OFF6 = 0x434,
  ISAAC_PGDIDISP_OFF7 = 0x44c,
  ISAAC_PGDIDISP_OFF8 = 0x49c,
  ISAAC_PGDIDISP_WIDTH0 = 1,
  ISAAC_PGDIDISP_WIDTH1 = 4,
  ISAAC_PGDIDISP_WIDTH2 = 4,
  ISAAC_PGDIDISP_WIDTH3 = 1,
  ISAAC_PGDIDISP_WIDTH4 = 1,
  ISAAC_PGDIDISP_WIDTH5 = 1,
  ISAAC_PGDIDISP_WIDTH6 = 1,
  ISAAC_PGDIDISP_WIDTH7 = 4,
  ISAAC_PGDIDISP_WIDTH8 = 4,
  ISAAC_PGDIDISP_CLAMP0 = 0xb3,
  ISAAC_PGDIDISP_CLAMP1 = 0x5f,
  ISAAC_PGDIDISP_CLAMP2 = 0xc,
  ISAAC_PGDIDISP_CLAMP3 = 0x15b,
  ISAAC_PGDIDISP_CLAMP4 = 7,
  ISAAC_PGDIDISP_CLAMP5 = 0x39,
  ISAAC_PGDIDISP_CLAMP6 = 0x15,
  ISAAC_PGDIDISP_CLAMP7 = 0x14,
  ISAAC_PGDIDISP_CLAMP8 = 1,
  ISAAC_PGDIDISP_SETG0 = 1,
  ISAAC_PGDIDISP_SETG1 = 0,
  ISAAC_PGDIDISP_SETG2 = 0,
  ISAAC_PGDIDISP_SETG3 = 1,
  ISAAC_PGDIDISP_SETG4 = 1,
  ISAAC_PGDIDISP_SETG5 = 1,
  ISAAC_PGDIDISP_SETG6 = 1,
  ISAAC_PGDIDISP_SETG7 = 0,
  ISAAC_PGDIDISP_SETG8 = 0,
  ISAAC_PGDIDISP_LOG0_VA = 0x00b1ba38u,
  ISAAC_PGDIDISP_LOG1_VA = 0x00b1ba60u,
  ISAAC_PGDIDISP_LOG2_VA = 0x00b1ba60u,
  ISAAC_PGDIDISP_LOG3_VA = 0x00b1ba84u,
  ISAAC_PGDIDISP_LOG4_VA = 0x00b1babcu,
  ISAAC_PGDIDISP_LOG5_VA = 0x00b1babcu,
  ISAAC_PGDIDISP_LOG6_VA = 0x00b1bae4u,
  ISAAC_PGDIDISP_LOG7_VA = 0x00b1bb0cu,
  ISAAC_PGDIDISP_LOG8_VA = 0x00b1bb34u
};

/* ---------- ABI v25p — PGDROWSEC: the per-section handler-row
   semantics of the 0x009e4260 dispatch (banner v25p; NO ABI bump —
   the Part-C coordinator merges the family bumps). v24 exported the
   row TABLE getters keyed by dispatch index 0..8; v25p lands the
   SEMANTIC composition keyed by SECTION id: the dispatch gate
   `mov eax,[ebp-0x30] ; dec eax ; cmp eax,8 ; ja next` @0x9e44c9..
   0x9e44d0 (UNSIGNED (section-1) <= 8 -> index section-1, else NO
   row — the record is skipped, no writes/clamp/log), then the
   row's store offset / elem width / clamp max / setg / log VA /
   target VA from the section id, plus the per-row loop law (byte
   rows: min(avail, clamped) exact for EVERY u32 pair incl. the
   wrap corners; dword rows: the v24 4*iters mod 2^32 closed form;
   both composed with the row's UNSIGNED cmova clamp). Evidence:
   section-notes/pgd-v25p-9e4260/. */

enum {
  ISAAC_PGDROWSEC_ROWS = 9,
  ISAAC_PGDROWSEC_FIRST_SECTION = 1,
  ISAAC_PGDROWSEC_LAST_SECTION = 9,
  ISAAC_PGDROWSEC_DISPATCH_BIAS = 8,
  ISAAC_PGDROWSEC_ROW_S1 = 0,
  ISAAC_PGDROWSEC_ROW_S2 = 1,
  ISAAC_PGDROWSEC_ROW_S3 = 2,
  ISAAC_PGDROWSEC_ROW_S4 = 3,
  ISAAC_PGDROWSEC_ROW_S5 = 4,
  ISAAC_PGDROWSEC_ROW_S6 = 5,
  ISAAC_PGDROWSEC_ROW_S7 = 6,
  ISAAC_PGDROWSEC_ROW_S8 = 7,
  ISAAC_PGDROWSEC_ROW_S9 = 8
};

/* PGDTALLY (v25n): stage-4 tally of the shared reader 0x009e4260 —
   the flag-array walks + success stores (the vtbl stream calls,
   logs, cookie, PGDCLMP stay HOST). All `jl` gates are SIGNED; all
   byte gates re-narrow byte & 0xff (cmp byte,0 = zero/nonzero). */
enum {
  ISAAC_PGDTALLY_RUN_VA = 0x009e4618u,
  ISAAC_PGDTALLY_SUCCESS_VA = 0x009e4a8fu,
  ISAAC_PGDTALLY_STORE_7D_VA = 0x009e4a78u,
  ISAAC_PGDTALLY_STORE_8C_VA = 0x009e4a88u,
  ISAAC_PGDTALLY_COLL_FLAGS_OFF = 0x268,
  ISAAC_PGDTALLY_SETT_FLAGS_OFF = 0x38,
  ISAAC_PGDTALLY_COLL_FIRST_IDX = 1,
  ISAAC_PGDTALLY_COLL_BOUND = 0x15b,
  ISAAC_PGDTALLY_COLL_ITERS = 0x15a,
  ISAAC_PGDTALLY_COLL_SUM_GATE = 0x15a,
  ISAAC_PGDTALLY_SETT_FIRST_IDX = 1,
  ISAAC_PGDTALLY_SETT_BOUND = 0xb3,
  ISAAC_PGDTALLY_SETT_ITERS = 0xb2,
  ISAAC_PGDTALLY_SETT_SUM_GATE = 0xb1,
  ISAAC_PGDTALLY_SETT_B_GATE = 0xb1,
  ISAAC_PGDTALLY_COLL_ALIAS_A_COUNT = 6,
  ISAAC_PGDTALLY_COLL_ALIAS_B_COUNT = 3,
  ISAAC_PGDTALLY_SETT_ALIAS_COUNT = 9,
  ISAAC_PGDTALLY_COLL_ALIAS_A0 = 0x114,
  ISAAC_PGDTALLY_COLL_ALIAS_A1 = 0x14d,
  ISAAC_PGDTALLY_COLL_ALIAS_A2 = 0x14e,
  ISAAC_PGDTALLY_COLL_ALIAS_A3 = 0x14f,
  ISAAC_PGDTALLY_COLL_ALIAS_A4 = 0x11b,
  ISAAC_PGDTALLY_COLL_ALIAS_A5 = 0x14b,
  ISAAC_PGDTALLY_COLL_ALIAS_B0 = 0x2b,
  ISAAC_PGDTALLY_COLL_ALIAS_B1 = 0x3d,
  ISAAC_PGDTALLY_COLL_ALIAS_B2 = 0xeb,
  ISAAC_PGDTALLY_SETT_ALIAS0 = 0x81,
  ISAAC_PGDTALLY_SETT_ALIAS1 = 0x82,
  ISAAC_PGDTALLY_SETT_ALIAS2 = 0x83,
  ISAAC_PGDTALLY_SETT_ALIAS3 = 0x84,
  ISAAC_PGDTALLY_SETT_ALIAS4 = 0x85,
  ISAAC_PGDTALLY_SETT_ALIAS5 = 0x9c,
  ISAAC_PGDTALLY_SETT_ALIAS6 = 0x52,
  ISAAC_PGDTALLY_SETT_ALIAS7 = 0x54,
  ISAAC_PGDTALLY_SETT_ALIAS8 = 0xaf
};

uint32_t isaac_pgd_import_tag_header_count(void);
uint32_t isaac_pgd_import_tag_header_va(uint32_t index);
int32_t isaac_pgd_import_tag_header_section(uint32_t index);
int32_t isaac_pgd_import_tag_header_count_max(uint32_t index);
uint32_t isaac_pgd_import_tag_header_dword(uint32_t index, uint32_t part);
uint32_t isaac_pgd_import_tag_compare_bytes(void);
uint32_t isaac_pgd_import_tag_compare_dwords(void);
uint32_t isaac_pgd_import_tag_read_bytes(void);
uint32_t isaac_pgd_import_tag_read_call_va(void);
uint32_t isaac_pgd_import_tag_first_cmp_va(void);
uint32_t isaac_pgd_import_tag_fail_log_va(void);
uint32_t isaac_pgd_import_tag_fail_tail_va(void);
int32_t isaac_pgd_import_tag_compare(uint32_t index, uint32_t d0, uint32_t d1, uint32_t d2);
int32_t isaac_pgd_import_tag_first_match(uint32_t d0, uint32_t d1, uint32_t d2);
int32_t isaac_pgd_import_tag_match_section(uint32_t d0, uint32_t d1, uint32_t d2);
int32_t isaac_pgd_import_tag_match_count_max(uint32_t d0, uint32_t d1, uint32_t d2);
uint32_t isaac_pgd_import_dispatch_table_va(void);
int32_t isaac_pgd_import_dispatch_entries(void);
uint32_t isaac_pgd_import_dispatch_gate_cmp_va(void);
uint32_t isaac_pgd_import_dispatch_gate_ja_va(void);
uint32_t isaac_pgd_import_entry_gate_js_va(void);
uint32_t isaac_pgd_import_entry_gate_jge_va(void);
uint32_t isaac_pgd_import_count_gate_cmp_va(void);
uint32_t isaac_pgd_import_count_gate_jbe_va(void);
uint32_t isaac_pgd_import_loop_jae_va(void);
uint32_t isaac_pgd_import_loop_jb_va(void);
int32_t isaac_pgd_import_dispatch_index(uint32_t section);
int32_t isaac_pgd_import_handler_count(void);
uint32_t isaac_pgd_import_handler_section(uint32_t index);
uint32_t isaac_pgd_import_handler_target_va(uint32_t index);
uint32_t isaac_pgd_import_handler_store_off(uint32_t index);
uint32_t isaac_pgd_import_handler_elem_width(uint32_t index);
uint32_t isaac_pgd_import_handler_clamp_max(uint32_t index);
int32_t isaac_pgd_import_handler_flag_normalize(uint32_t index);
uint32_t isaac_pgd_import_handler_log_va(uint32_t index);
int32_t isaac_pgd_import_section_entry_gate(int32_t prev_section, int32_t elem_count);
int32_t isaac_pgd_import_section_count_gate(uint32_t count);
uint32_t isaac_pgd_import_clamp(uint32_t count, uint32_t max);
int32_t isaac_pgd_import_byte_flag(uint32_t raw);
uint32_t isaac_pgd_import_byte_loop_iterations(uint32_t avail, uint32_t clamped);
uint32_t isaac_pgd_import_dword_loop_iterations(uint32_t avail_bytes, uint32_t clamped);
/* ABI v25p — PGDROWSEC: per-section handler-row semantics. */
int32_t isaac_pgd_import_section_row_index(uint32_t section);
uint32_t isaac_pgd_import_section_store_off(uint32_t section);
uint32_t isaac_pgd_import_section_elem_width(uint32_t section);
uint32_t isaac_pgd_import_section_clamp_max(uint32_t section);
int32_t isaac_pgd_import_section_flag_normalize(uint32_t section);
uint32_t isaac_pgd_import_section_log_va(uint32_t section);
uint32_t isaac_pgd_import_section_target_va(uint32_t section);
uint32_t isaac_pgd_import_section_loop_iterations(uint32_t section, uint32_t avail, uint32_t count);
uint32_t isaac_pgd_import_tally_run_va(void);
uint32_t isaac_pgd_import_tally_success_va(void);
uint32_t isaac_pgd_import_tally_store_7d_va(void);
uint32_t isaac_pgd_import_tally_store_8c_va(void);
uint32_t isaac_pgd_import_tally_coll_flags_off(void);
uint32_t isaac_pgd_import_tally_sett_flags_off(void);
uint32_t isaac_pgd_import_tally_coll_first_idx(void);
uint32_t isaac_pgd_import_tally_coll_bound(void);
uint32_t isaac_pgd_import_tally_coll_iters(void);
uint32_t isaac_pgd_import_tally_sett_first_idx(void);
uint32_t isaac_pgd_import_tally_sett_bound(void);
uint32_t isaac_pgd_import_tally_sett_iters(void);
uint32_t isaac_pgd_import_tally_coll_alias_a_count(void);
uint32_t isaac_pgd_import_tally_coll_alias_b_count(void);
uint32_t isaac_pgd_import_tally_sett_alias_count(void);
uint32_t isaac_pgd_import_tally_coll_alias_a(uint32_t index);
uint32_t isaac_pgd_import_tally_coll_alias_b(uint32_t index);
uint32_t isaac_pgd_import_tally_sett_alias(uint32_t index);
int32_t isaac_pgd_import_tally_coll_bucket(uint32_t index, uint32_t byte);
int32_t isaac_pgd_import_tally_sett_bucket(uint32_t index, uint32_t byte);
int32_t isaac_pgd_import_tally_coll_continue(uint32_t setA, uint32_t setB);
int32_t isaac_pgd_import_tally_sett_store_7d(uint32_t setA, uint32_t setB);
int32_t isaac_pgd_import_tally_sett_store_8c(uint32_t settB, uint32_t collA);

/* ===== v25o PGDIMP: TryImportRebirthLocalSave (0x0092b2e0) residual
   pure islands (pre-read setup / file-open result gates / post-import
   stores; evidence: section-notes/pgd-wave16o-92b2e0/). The importer
   frame's OWN decisions — every call target stays HOST. ===== */

enum {
  ISAAC_PGDIMP_SUFFIX_PATTERN_VA = 0x00b6d0d8u, /* "Binding of Isaac Repentance+" */
  ISAAC_PGDIMP_SUFFIX_PATTERN_BYTES = 0x1c,
  ISAAC_PGDIMP_SUFFIX_COMPARE_BYTES = 0x18, /* memcmp width — "nce+" never read */
  ISAAC_PGDIMP_SUFFIX_SCAN_STEP = 0xffffffffu, /* `dec edi` — backward scan */
  ISAAC_PGDIMP_SUFFIX_FIRST_CMP_VA = 0x0092b3e5u,
  ISAAC_PGDIMP_SUFFIX_REPLACE_VA = 0x0092b45fu,
  ISAAC_PGDIMP_SUFFIX_REPLACE_POS_LEN = 0x1c, /* n1 = window width */
  ISAAC_PGDIMP_REBIRTH_STR_VA = 0x00b7b024u, /* "Binding of Isaac Rebirth" */
  ISAAC_PGDIMP_REBIRTH_STR_LEN = 0x18, /* n2 */
  ISAAC_PGDIMP_OPEN_GATE_VA = 0x0092b53du, /* `test edi,edi ; je fail` */
  ISAAC_PGDIMP_OPEN_FAIL_VA = 0x0092b7ecu,
  ISAAC_PGDIMP_OPEN_STATE_CALL_VA = 0x0092b54cu, /* vtbl+0x30 HOST */
  ISAAC_PGDIMP_OPEN_STATE_GATE_VA = 0x0092b54eu, /* `test al,al ; je` LOW BYTE */
  ISAAC_PGDIMP_STREAM_POS_CALL_VA = 0x0092b555u, /* IAT 0xb18920 HOST */
  ISAAC_PGDIMP_STREAM_POS_GATE_VA = 0x0092b55eu, /* `test eax,eax ; js` SIGNED */
  ISAAC_PGDIMP_IO_CALL_PRE_VA = 0x0092b569u, /* `call 0xa52890` count 1 */
  ISAAC_PGDIMP_IO_CALL_POST_VA = 0x0092b5a9u, /* `call 0xa52890` count 8 */
  ISAAC_PGDIMP_PRE_READ_COUNT = 1,
  ISAAC_PGDIMP_POST_READ_COUNT = 8,
  ISAAC_PGDIMP_POST_READ_GATE_VA = 0x0092b5b9u, /* `cmp byte [ebp-0x4f1],0` */
  ISAAC_PGDIMP_POST_READ_FAIL_VA = 0x0092b7e6u,
  ISAAC_PGDIMP_CHANGESMADE_STORE_VA = 0x0092b752u, /* `mov byte [edi],1` */
  ISAAC_PGDIMP_CHANGESMADE_STORE_VALUE = 1,
  ISAAC_PGDIMP_SAVE_SELECT_CMP_VA = 0x0092b780u, /* `cmp byte [edi],0 ; je` */
  ISAAC_PGDIMP_SAVE_SELECT_0F8C_CMP_VA = 0x0092b785u, /* `cmp byte [edi+0xf8c],0` */
  ISAAC_PGDIMP_SAVE_SELECT_OBJ_VA = 0x0092b7a3u, /* IAT 0xb18a1c call site */
  ISAAC_PGDIMP_SAVE_SELECT_OBJ_CMP_VA = 0x0092b7acu, /* `cmp dword [eax],0` FULL */
  ISAAC_PGDIMP_SAVE_SELECT_GLOBAL_VA = 0x0092b7b1u, /* `cmp byte [esi+0x2a3a4],0` */
  ISAAC_PGDIMP_EVENT_COUNTER_CALL_VA = 0x0092b770u, /* `call 0x929b40` (0,0) */
  ISAAC_PGDIMP_GLOBAL_SAVE_PTR_VA = 0x00c7169cu, /* the game global */
  ISAAC_PGDIMP_GLOBAL_SAVE_FIELD_OFF = 0x2a378,
  ISAAC_PGDIMP_RETURN1_VA_A = 0x0092b7c7u, /* `mov byte [ebp-0x4f1],1` path A */
  ISAAC_PGDIMP_RETURN1_VA_B = 0x0092b7ddu  /* `mov byte [ebp-0x4f1],1` path B */
};

uint32_t isaac_pgd_import_suffix_pattern_byte(uint32_t index);
uint32_t isaac_pgd_import_suffix_compare_len(void);
int32_t isaac_pgd_import_suffix_window_match(uint32_t d0, uint32_t d1, uint32_t d2, uint32_t d3, uint32_t d4, uint32_t d5);
uint32_t isaac_pgd_import_suffix_scan_start(uint32_t len);
uint32_t isaac_pgd_import_suffix_scan_step(void);
uint32_t isaac_pgd_import_suffix_first_cmp_va(void);
uint32_t isaac_pgd_import_suffix_replace_va(void);
uint32_t isaac_pgd_import_suffix_replace_pos_len(void);
uint32_t isaac_pgd_import_rebirth_replacement_len(void);
uint32_t isaac_pgd_import_rebirth_replace_len(uint32_t len, uint32_t matched);
int32_t isaac_pgd_import_open_succeeded(uint32_t handle);
uint32_t isaac_pgd_import_open_gate_va(void);
uint32_t isaac_pgd_import_open_fail_va(void);
uint32_t isaac_pgd_import_open_state_call_va(void);
uint32_t isaac_pgd_import_open_state_gate_va(void);
uint32_t isaac_pgd_import_stream_pos_call_va(void);
uint32_t isaac_pgd_import_stream_pos_gate_va(void);
int32_t isaac_pgd_import_file_io_gate(uint32_t open_state, uint32_t pos);
uint32_t isaac_pgd_import_pre_read_count(void);
uint32_t isaac_pgd_import_post_read_count(void);
uint32_t isaac_pgd_import_pre_read_io_call_va(void);
uint32_t isaac_pgd_import_post_read_io_call_va(void);
int32_t isaac_pgd_import_post_read_gate(uint32_t reader_result);
uint32_t isaac_pgd_import_post_read_gate_va(void);
uint32_t isaac_pgd_import_post_read_fail_va(void);
uint32_t isaac_pgd_import_changesmade_store_va(void);
uint32_t isaac_pgd_import_changesmade_store_value(void);
int32_t isaac_pgd_import_changesmade_clear_gate(uint32_t pgd0, uint32_t f8c);
int32_t isaac_pgd_import_save_select(uint32_t pgd0, uint32_t f8c, uint32_t obj_deref, uint32_t global_2a3a4);
uint32_t isaac_pgd_import_save_select_cmp_va(void);
uint32_t isaac_pgd_import_save_select_0f8c_cmp_va(void);
uint32_t isaac_pgd_import_save_select_obj_va(void);
uint32_t isaac_pgd_import_save_select_obj_cmp_va(void);
uint32_t isaac_pgd_import_save_select_global_va(void);
uint32_t isaac_pgd_import_event_counter_va(void);
uint32_t isaac_pgd_import_global_save_ptr_va(void);
uint32_t isaac_pgd_import_global_save_field_off(void);
uint32_t isaac_pgd_import_global_save_cleared(uint32_t old_val);
uint32_t isaac_pgd_import_global_save_restore(uint32_t old_val);
uint32_t isaac_pgd_import_return1_va_a(void);
uint32_t isaac_pgd_import_return1_va_b(void);
int32_t isaac_pgd_import_result(uint32_t open_ok, uint32_t reader_result);

/* ===== v26 PGDIVER: the import reader 0x009e4260's version gates +
   fail tail (the v25n "Next frontier" residuals). The +0x4a0 read
   fires only for the matched tag rows 4..9 (sections 4/5/6); the
   +0x4a4 finish store = 1 is UNCONDITIONAL and the overwriting
   stream read fires only for section 6 (`cmp [ebp-0x2c],6 ; jb`
   UNSIGNED @0x9e45f2..0x9e4611); the fail tail 0x9e4aa2 logs and
   returns 0 @0x9e4ac7. Evidence: section-notes/pgd-v26-41d670/. ===== */

enum {
  ISAAC_PGDIVER_VERSION_OFF = 0x4a0,
  ISAAC_PGDIVER_VERSION_BYTES = 8,
  ISAAC_PGDIVER_VERSION_READ_COUNT = 1,
  ISAAC_PGDIVER_VERSION_READ_WIDTH = 4,
  ISAAC_PGDIVER_VERSION_GATE_FIRST_ROW = 4,
  ISAAC_PGDIVER_VERSION_GATE_FIRST_SECTION = 4,
  ISAAC_PGDIVER_VERSION_GATE_LAST_SECTION = 6,
  ISAAC_PGDIVER_FINISH_OFF = 0x4a4,
  ISAAC_PGDIVER_FINISH_DEFAULT = 1,
  ISAAC_PGDIVER_FINISH_READ_GATE_SECTION = 6,
  ISAAC_PGDIVER_FAIL_RET_VA = 0x009e4ac7u,
  ISAAC_PGDIVER_FAIL_LOG_ARGC = 3
};

/* ===== v26 PGDREADER2: the SIBLING save reader 0x0041d670 (own tag
   table / size gate / version reads / record loop / 10-row dispatch +
   per-section rows / tails). `mov esi,[ebp+8]` = stream, `mov
   [ebp-0x20],ecx` = snapshot; ret 4; success al=1 @0x41d928 (caller
   0x92ba01: `push esi ; lea ecx,[ebp-0x700] ; call 0x41d670`). The
   0x683580 checksum helper, the vtbl stream calls + polls, the 12
   cdecl logs and the cookie stay HOST. Evidence:
   section-notes/pgd-v26-41d670/. ===== */

enum {
  ISAAC_PGD2_READER_VA = 0x0041d670u,
  ISAAC_PGD2_SUCCESS_VA = 0x0041d928u,
  ISAAC_PGD2_RET_OK_VA = 0x0041d93au,
  ISAAC_PGD2_FAIL_TAIL_VA = 0x0041dd64u,
  ISAAC_PGD2_FAIL_RET_VA = 0x0041dd76u,
  ISAAC_PGD2_RETURN_STACK_BYTES = 4,
  ISAAC_PGD2_READ_CALL_VA = 0x0041d695u,
  ISAAC_PGD2_FIRST_CMP_VA = 0x0041d6a7u,
  ISAAC_PGD2_TAG_READ_BYTES = 0x10,
  ISAAC_PGD2_TAG_BYTES = 0xc,
  ISAAC_PGD2_TAG_DWORDS = 3,
  ISAAC_PGD2_HEADERS = 3,
  ISAAC_PGD2_HEADER0_VA = 0x00b1b98cu,
  ISAAC_PGD2_HEADER1_VA = 0x00b1b9a0u,
  ISAAC_PGD2_HEADER2_VA = 0x00b1b9b4u,
  ISAAC_PGD2_SECTION_ROW0 = 6,
  ISAAC_PGD2_SECTION_ROW1 = 7,
  ISAAC_PGD2_SECTION_ROW2 = 8,
  ISAAC_PGD2_COUNT_ROW0 = 9,
  ISAAC_PGD2_COUNT_ROW1 = 0xa,
  ISAAC_PGD2_COUNT_ROW2 = 0xa,
  ISAAC_PGD2_TAG_DWORD0 = 0x41415349u,
  ISAAC_PGD2_TAG_DWORD1 = 0x53474e43u,
  ISAAC_PGD2_TAG_DWORD2 = 0x30455641u,
  ISAAC_PGD2_SIZE_GATE_VA = 0x0041d748u,
  ISAAC_PGD2_SIZE_CHECK_SECTION = 8,
  ISAAC_PGD2_SIZE_JB_VA = 0x0041d74bu,
  ISAAC_PGD2_COUNT_CHECK_CMP_VA = 0x0041d74du,
  ISAAC_PGD2_COUNT_MISMATCH_LOG_VA = 0x00b1ba00u,
  ISAAC_PGD2_TAG_MISS_VA = 0x0041dd51u,
  ISAAC_PGD2_TAG_MISS_LOG_VA = 0x00b1b9c8u,
  ISAAC_PGD2_VERSION_OFF = 0x6dc,
  ISAAC_PGD2_VERSION_FINISH_OFF = 0x6e0,
  ISAAC_PGD2_VERSION_BYTES = 8,
  ISAAC_PGD2_VERSION_READ_COUNT = 1,
  ISAAC_PGD2_VERSION_READ_WIDTH = 4,
  ISAAC_PGD2_DISPATCH_TABLE_VA = 0x0041dd7cu,
  ISAAC_PGD2_DISPATCH_ENTRIES = 10,
  ISAAC_PGD2_DISPATCH_BIAS = 9,
  ISAAC_PGD2_DISPATCH_GATE_DEC_VA = 0x0041d7e9u,
  ISAAC_PGD2_DISPATCH_GATE_JA_VA = 0x0041d7edu,
  ISAAC_PGD2_ENTRY_GATE_JS_VA = 0x0041d7a8u,
  ISAAC_PGD2_ENTRY_GATE_JGE_VA = 0x0041d7b1u,
  ISAAC_PGD2_COUNT_GATE_CMP_VA = 0x0041d7dcu,
  ISAAC_PGD2_COUNT_GATE_JBE_VA = 0x0041d7e0u,
  ISAAC_PGD2_LOOP_JAE_VA = 0x0041d847u,
  ISAAC_PGD2_LOOP_JB_VA = 0x0041d86bu,
  ISAAC_PGD2_NEXT_VTBL_CALL_VA = 0x0041d90cu,
  ISAAC_PGD2_NEXT_JE_VA = 0x0041d910u,
  ISAAC_PGD2_FINISH_READ_CALL_VA = 0x0041d925u,
  ISAAC_PGD2ROW_ROWS = 10,
  ISAAC_PGD2ROW_FIRST_SECTION = 1,
  ISAAC_PGD2ROW_LAST_SECTION = 10,
  ISAAC_PGD2ROW_ROW_S1 = 0,
  ISAAC_PGD2ROW_ROW_S2 = 1,
  ISAAC_PGD2ROW_ROW_S3 = 2,
  ISAAC_PGD2ROW_ROW_S4 = 3,
  ISAAC_PGD2ROW_ROW_S5 = 4,
  ISAAC_PGD2ROW_ROW_S6 = 5,
  ISAAC_PGD2ROW_ROW_S7 = 6,
  ISAAC_PGD2ROW_ROW_S8 = 7,
  ISAAC_PGD2ROW_ROW_S9 = 8,
  ISAAC_PGD2ROW_ROW_S10 = 9,
  ISAAC_PGD2ROW_TARGET0_VA = 0x0041d7fau,
  ISAAC_PGD2ROW_TARGET1_VA = 0x0041d875u,
  ISAAC_PGD2ROW_TARGET2_VA = 0x0041d93du,
  ISAAC_PGD2ROW_TARGET3_VA = 0x0041d9c3u,
  ISAAC_PGD2ROW_TARGET4_VA = 0x0041da46u,
  ISAAC_PGD2ROW_TARGET5_VA = 0x0041dac2u,
  ISAAC_PGD2ROW_TARGET6_VA = 0x0041db41u,
  ISAAC_PGD2ROW_TARGET7_VA = 0x0041dbc1u,
  ISAAC_PGD2ROW_TARGET8_VA = 0x0041dc43u,
  ISAAC_PGD2ROW_TARGET9_VA = 0x0041dcc3u,
  ISAAC_PGD2ROW_OFF0 = 0x38,
  ISAAC_PGD2ROW_OFF1 = 0x150,
  ISAAC_PGD2ROW_OFF2 = 0x594,
  ISAAC_PGD2ROW_OFF3 = 0x3d8,
  ISAAC_PGD2ROW_OFF4 = 0x5c4,
  ISAAC_PGD2ROW_OFF5 = 0x5cb,
  ISAAC_PGD2ROW_OFF6 = 0x60e,
  ISAAC_PGD2ROW_OFF7 = 0x630,
  ISAAC_PGD2ROW_OFF8 = 0x688,
  ISAAC_PGD2ROW_OFF9 = 0x68c,
  ISAAC_PGD2ROW_WIDTH0 = 1,
  ISAAC_PGD2ROW_WIDTH1 = 4,
  ISAAC_PGD2ROW_WIDTH2 = 4,
  ISAAC_PGD2ROW_WIDTH3 = 1,
  ISAAC_PGD2ROW_WIDTH4 = 1,
  ISAAC_PGD2ROW_WIDTH5 = 1,
  ISAAC_PGD2ROW_WIDTH6 = 1,
  ISAAC_PGD2ROW_WIDTH7 = 4,
  ISAAC_PGD2ROW_WIDTH8 = 4,
  ISAAC_PGD2ROW_WIDTH9 = 1,
  ISAAC_PGD2ROW_CLAMP0 = 0x115,
  ISAAC_PGD2ROW_CLAMP1 = 0xa2,
  ISAAC_PGD2ROW_CLAMP2 = 0xc,
  ISAAC_PGD2ROW_CLAMP3 = 0x1ba,
  ISAAC_PGD2ROW_CLAMP4 = 7,
  ISAAC_PGD2ROW_CLAMP5 = 0x43,
  ISAAC_PGD2ROW_CLAMP6 = 0x1f,
  ISAAC_PGD2ROW_CLAMP7 = 0x16,
  ISAAC_PGD2ROW_CLAMP8 = 1,
  ISAAC_PGD2ROW_CLAMP9 = 0x4d,
  ISAAC_PGD2ROW_SETG0 = 1,
  ISAAC_PGD2ROW_SETG1 = 0,
  ISAAC_PGD2ROW_SETG2 = 0,
  ISAAC_PGD2ROW_SETG3 = 1,
  ISAAC_PGD2ROW_SETG4 = 1,
  ISAAC_PGD2ROW_SETG5 = 1,
  ISAAC_PGD2ROW_SETG6 = 1,
  ISAAC_PGD2ROW_SETG7 = 0,
  ISAAC_PGD2ROW_SETG8 = 0,
  ISAAC_PGD2ROW_SETG9 = 1,
  ISAAC_PGD2ROW_LOG0_VA = 0x00b1ba38u,
  ISAAC_PGD2ROW_LOG1_VA = 0x00b1ba60u,
  ISAAC_PGD2ROW_LOG2_VA = 0x00b1ba60u,
  ISAAC_PGD2ROW_LOG3_VA = 0x00b1ba84u,
  ISAAC_PGD2ROW_LOG4_VA = 0x00b1babcu,
  ISAAC_PGD2ROW_LOG5_VA = 0x00b1babcu,
  ISAAC_PGD2ROW_LOG6_VA = 0x00b1bae4u,
  ISAAC_PGD2ROW_LOG7_VA = 0x00b1bb0cu,
  ISAAC_PGD2ROW_LOG8_VA = 0x00b1bb34u,
  ISAAC_PGD2ROW_LOG9_VA = 0x00b1bb58u
};

/* ABI v26 — PGDIVER: import reader 0x009e4260 version gates + fail tail. */
uint32_t isaac_pgd_import_version_off(void);
uint32_t isaac_pgd_import_version_bytes(void);
uint32_t isaac_pgd_import_version_read_count(void);
uint32_t isaac_pgd_import_version_read_width(void);
int32_t isaac_pgd_import_version_gate_row(uint32_t row);
int32_t isaac_pgd_import_version_gate_section(uint32_t section);
uint32_t isaac_pgd_import_version_finish_off(void);
uint32_t isaac_pgd_import_version_finish_default(void);
int32_t isaac_pgd_import_finish_gate(uint32_t section);
uint32_t isaac_pgd_import_tag_fail_ret_va(void);
uint32_t isaac_pgd_import_tag_fail_log_argc(void);
int32_t isaac_pgd_import_tag_fail_returns_zero(void);
/* ABI v26 — PGDREADER2: the sibling reader 0x0041d670. */
int32_t isaac_pgd_sibling_tag_compare(uint32_t index, uint32_t d0, uint32_t d1, uint32_t d2);
int32_t isaac_pgd_sibling_tag_first_match(uint32_t d0, uint32_t d1, uint32_t d2);
int32_t isaac_pgd_sibling_tag_match_section(uint32_t d0, uint32_t d1, uint32_t d2);
int32_t isaac_pgd_sibling_tag_match_count(uint32_t d0, uint32_t d1, uint32_t d2);
uint32_t isaac_pgd_sibling_tag_header_va(uint32_t index);
int32_t isaac_pgd_sibling_tag_header_section(uint32_t index);
int32_t isaac_pgd_sibling_tag_header_count(uint32_t index);
uint32_t isaac_pgd_sibling_tag_compare_bytes(void);
uint32_t isaac_pgd_sibling_tag_compare_dwords(void);
uint32_t isaac_pgd_sibling_tag_read_bytes(void);
int32_t isaac_pgd_sibling_size_gate(uint32_t section, uint32_t file_count, uint32_t checksum);
uint32_t isaac_pgd_sibling_count_check_va(void);
uint32_t isaac_pgd_sibling_size_check_section(void);
uint32_t isaac_pgd_sibling_tag_miss_va(void);
uint32_t isaac_pgd_sibling_tag_miss_log_va(void);
uint32_t isaac_pgd_sibling_count_mismatch_log_va(void);
int32_t isaac_pgd_sibling_entry_gate(int32_t prev_section, int32_t elem_count);
int32_t isaac_pgd_sibling_record_count_gate(uint32_t count);
int32_t isaac_pgd_sibling_dispatch_index(uint32_t section);
uint32_t isaac_pgd_sibling_dispatch_table_va(void);
int32_t isaac_pgd_sibling_dispatch_entries(void);
uint32_t isaac_pgd_sibling_version_off(void);
uint32_t isaac_pgd_sibling_version_finish_off(void);
uint32_t isaac_pgd_sibling_version_bytes(void);
uint32_t isaac_pgd_sibling_version_read_count(void);
uint32_t isaac_pgd_sibling_version_read_width(void);
uint32_t isaac_pgd_sibling_success_va(void);
uint32_t isaac_pgd_sibling_ret_ok_va(void);
uint32_t isaac_pgd_sibling_fail_tail_va(void);
uint32_t isaac_pgd_sibling_fail_ret_va(void);
uint32_t isaac_pgd_sibling_ret_stack_bytes(void);
int32_t isaac_pgd_sibling_section_row_index(uint32_t section);
uint32_t isaac_pgd_sibling_section_store_off(uint32_t section);
uint32_t isaac_pgd_sibling_section_elem_width(uint32_t section);
uint32_t isaac_pgd_sibling_section_clamp_max(uint32_t section);
int32_t isaac_pgd_sibling_section_flag_normalize(uint32_t section);
uint32_t isaac_pgd_sibling_section_log_va(uint32_t section);
uint32_t isaac_pgd_sibling_section_target_va(uint32_t section);
uint32_t isaac_pgd_sibling_section_loop_iterations(uint32_t section, uint32_t avail, uint32_t count);

/* ABI v27 — PGDIEC: PersistentGameData::IncreaseEventCounter
   0x00929b40 threshold cascade (EXACT ZHL, 21 pattern bytes; ret 8
   @0x92a2c8). 52 direct gate rows -> 54 TryUnlock call sites; every
   row is `cmp u32 dword, IMM ; jb skip` UNSIGNED except row 1
   (test/je NONZERO), row 16 (PAIR: 0x31c AND 0x320 both nonzero via
   jbe-vs-0) and row 41 (MODE: counter >= 0x1f AND mode dword
   [0xc7169c]+8 == 1). Rows 27/28 fire TWO unlock ids per gate.
   TryUnlock 0x929a20 + SEH cookie 0xaef12b stay HOST; the group walk
   0x92a000..0x92a253 and the five derived tail gates are HOST (.data
   tables). */
enum {
  ISAAC_PGDIEC_VA = 0x00929b40u,
  ISAAC_PGDIEC_RET_VA = 0x0092a2c8u,
  ISAAC_PGDIEC_BODY_BYTES = 1928,
  ISAAC_PGDIEC_CALL_SITES = 74,
  ISAAC_PGDIEC_HOST_VA_TRY_UNLOCK = 0x00929a20u,
  ISAAC_PGDIEC_HOST_VA_COOKIE = 0x00aef12bu,
  ISAAC_PGDIEC_READONLY_OFF = 0x01,
  ISAAC_PGDIEC_DIRTY_OFF = 0x00,
  ISAAC_PGDIEC_COUNTER_BASE = 0x2bc,
  ISAAC_PGDIEC_GATE_ROWS = 52,
  ISAAC_PGDIEC_UNLOCK_CALLS = 54,
  ISAAC_PGDIEC_KIND_GE = 1,      /* u32 >= IMM, `cmp ; jb` UNSIGNED */
  ISAAC_PGDIEC_KIND_NONZERO = 2, /* `test eax,eax ; je` */
  ISAAC_PGDIEC_KIND_PAIR = 3,    /* two jbe-vs-0: both nonzero */
  ISAAC_PGDIEC_KIND_MODE = 4,    /* GE + mode dword [0xc7169c]+8 == 1 */
  ISAAC_PGDIEC_MODE_GLOBAL_VA = 0x00c7169cu,
  ISAAC_PGDIEC_MODE_GLOBAL_OFF = 8,
  ISAAC_PGDIEC_MODE_VALUE = 1,
  ISAAC_PGDIEC_DIRTY_VA = 0x0092b84u,
  ISAAC_PGDIEC_COUNTER_LOAD_VA = 0x00929b68u,
  ISAAC_PGDIEC_READONLY_CMP_VA = 0x00929b5eu,
  ISAAC_PGDIEC_GROUP_WALK_VA = 0x0092a000u,
  ISAAC_PGDIEC_GROUP_TABLE_VA = 0x00c35ed0u,
  ISAAC_PGDIEC_GROUP_STRIDE = 0x90
};

typedef struct IsaacPgdIecGate {
  int32_t step;
  int32_t kind;
  uint32_t gate_va;
  uint32_t counter_off;
  uint32_t counter_off2; /* PAIR only, else 0 */
  uint32_t threshold;
  uint32_t unlock_id;
  uint32_t unlock_id2;   /* rows 27/28 double, else 0 */
  uint32_t call_va;
  uint32_t call_va2;     /* rows 27/28 double, else 0 */
} IsaacPgdIecGate;

uint32_t isaac_pgd_iec_va(void);
uint32_t isaac_pgd_iec_ret_va(void);
uint32_t isaac_pgd_iec_body_bytes(void);
int32_t isaac_pgd_iec_call_site_count(void);
uint32_t isaac_pgd_iec_host_try_unlock_va(void);
uint32_t isaac_pgd_iec_host_cookie_va(void);
int32_t isaac_pgd_iec_readonly_off(void);
int32_t isaac_pgd_iec_dirty_off(void);
int32_t isaac_pgd_iec_counter_base(void);
int32_t isaac_pgd_iec_gate_open(uint32_t readonly);
uint32_t isaac_pgd_iec_counter_store_off(uint32_t slot);
int32_t isaac_pgd_iec_dirty_fires(uint32_t readonly);
int32_t isaac_pgd_iec_gate_row_count(void);
int32_t isaac_pgd_iec_gate_row(int32_t step, IsaacPgdIecGate* out);
int32_t isaac_pgd_iec_gate_fires(int32_t step, uint32_t counter,
                                 uint32_t counter2, uint32_t mode_word);

/* ABI v28 — PGDULD: the 0x009296c0 tier-ladder decision island
   (save-cluster final host-leaf; 200 bytes, ret @0x929788, 6
   inbound call sites; 1 E8 to typed-host TryUnlock 0x929a20
   @0x929773, 0 indirects, ZERO this/.data stores). count =
   (u32(end-start) * 0x63e7063f) >> 38 minus 1 for non-negative
   (magic = ceil(2^38/164), BigInt-exact — the raw multiply is the
   law, NOT /164); k = min_u32(tier, count) `cmovb` UNSIGNED;
   inner bound = u32((countWord - ptr) >> 2 SAR) `cmp ebx,ecx ;
   jae`; flag = `cmp byte [entry+0x38],dl ; cmovne` AND over BYTE
   flags (reset 1 per tier); ladder id = u32[0xb7b0b0 + 4*tier]
   (.rdata const, 46 slots, tier 1..0x2d); fire iff flag != 0 &&
   tier <= 0x2d && id != 0. PGDHOST pins: cookie 0xaef12b VERIFIED
   PURE 8-byte stub (`cmp ecx,[0xbf93b4] ; jne 0xaef134 ; ret ;
   jmp 0xaef775`, 0 E8 — host-TYPED, law pinned); checksum 0x683580
   NOT pure (SEH + vtbl + 1 E8; skip_front 0x10, skip_back 4,
   non-standard table[1] 0x09073096, seed 0xfedcba76). Evidence:
   section-notes/pgd-v28-hostleaf/. */
enum {
  ISAAC_PGDULD_VA = 0x009296c0u,
  ISAAC_PGDULD_RET_VA = 0x00929788u,
  ISAAC_PGDULD_BODY_BYTES = 200,
  ISAAC_PGDULD_CALL_SITES = 6,
  ISAAC_PGDULD_HOST_VA_TRY_UNLOCK = 0x00929a20u,
  ISAAC_PGDULD_TRY_UNLOCK_CALL_VA = 0x00929773u,
  ISAAC_PGDULD_DIV_MAGIC = 0x63e7063fu,
  ISAAC_PGDULD_DIV_SHIFT = 38,
  ISAAC_PGDULD_DIV_MOD = 164,
  ISAAC_PGDULD_GLOBAL_VA = 0x00c7169cu,
  ISAAC_PGDULD_RANGE_OFF = 0x2a664,
  ISAAC_PGDULD_SEG_STRIDE = 0xa4,
  ISAAC_PGDULD_SEG_PTR_OFF = 0x48,
  ISAAC_PGDULD_SEG_COUNT_OFF = 0x4c,
  ISAAC_PGDULD_ENTRY_FLAG_OFF = 0x38,
  ISAAC_PGDULD_LADDER_TABLE_VA = 0x00b7b0b0u,
  ISAAC_PGDULD_LADDER_ROWS = 46,
  ISAAC_PGDULD_TIER_MAX = 0x2d,
  ISAAC_PGDULD_COUNT_LOAD_VA = 0x009296dcu,
  ISAAC_PGDULD_SEG_INDEX_VA = 0x00929709u,
  ISAAC_PGDULD_FLAG_STORE_VA = 0x009296d8u,
  ISAAC_PGDULD_UNLOCK_GATE_VA = 0x00929759u,
  ISAAC_PGDULD_LADDER_LOAD_VA = 0x00929764u,
  ISAAC_PGDULD_LADDER_GATE_VA = 0x0092976du,

  ISAAC_PGD_HOST_VA_COOKIE = 0x00aef12bu,
  ISAAC_PGD_COOKIE_GLOBAL_VA = 0x00bf93b4u,
  ISAAC_PGD_COOKIE_FAIL_VA = 0x00aef775u,
  ISAAC_PGD_COOKIE_BODY_BYTES = 8,
  ISAAC_PGD_CHECKSUM_REGION_SKIP_FRONT = 0x10,
  ISAAC_PGD_CHECKSUM_REGION_SKIP_BACK = 4,
  ISAAC_PGD_CHECKSUM_NONSTANDARD_TABLE1 = 0x09073096u
};

/* The .rdata ladder 0xb7b0b0 (46 u32 slots; index 0 unused; the
   byte at slot 46, 0x706d6173 "samp", is the NEXT const). */
static const uint32_t kUldLadder[ISAAC_PGDULD_LADDER_ROWS] = {
  0x000u, 0x000u, 0x000u, 0x000u, 0x09du, 0x09eu, 0x09fu, 0x0a0u,
  0x0a1u, 0x0a2u, 0x0a3u, 0x0a4u, 0x000u, 0x000u, 0x000u, 0x000u,
  0x000u, 0x000u, 0x000u, 0x0a5u, 0x0a6u, 0x109u, 0x10au, 0x10bu,
  0x10cu, 0x10du, 0x10eu, 0x10fu, 0x110u, 0x111u, 0x112u, 0x115u,
  0x116u, 0x117u, 0x118u, 0x119u, 0x000u, 0x1fcu, 0x1fdu, 0x1feu,
  0x1ffu, 0x200u, 0x201u, 0x202u, 0x203u, 0x204u
};

uint32_t isaac_pgd_uld_va(void);
uint32_t isaac_pgd_uld_ret_va(void);
uint32_t isaac_pgd_uld_body_bytes(void);
int32_t isaac_pgd_uld_call_site_count(void);
uint32_t isaac_pgd_uld_host_try_unlock_va(void);
uint32_t isaac_pgd_uld_try_unlock_call_va(void);
int32_t isaac_pgd_uld_count(uint32_t start, uint32_t end);
uint32_t isaac_pgd_uld_segment_index(int32_t count, uint32_t tier);
uint32_t isaac_pgd_uld_loop_iterations(uint32_t seg_ptr,
                                       uint32_t seg_count_word);
int32_t isaac_pgd_uld_flag_accum(int32_t flag, uint32_t entry_byte);
uint32_t isaac_pgd_uld_unlock_id(uint32_t tier);
int32_t isaac_pgd_uld_fire(int32_t flag, uint32_t tier);

uint32_t isaac_pgd_host_cookie_va(void);
uint32_t isaac_pgd_cookie_global_va(void);
uint32_t isaac_pgd_cookie_fail_va(void);
int32_t isaac_pgd_cookie_check_ok(uint32_t cookie, uint32_t cookie_global);
int32_t isaac_pgd_checksum_region_skip_front(void);
int32_t isaac_pgd_checksum_region_skip_back(void);

/* ABI v29 — PGDISP: the 0x00929660 save DISPATCHER decision
   laws (the family's LAST un-landed PURE island; 92 bytes, ret 4
   @0x9296bc + path-A ret 4 @0x9296af; 2 inbound call sites —
   CORRECTED tooling 0x91a398 + 0x94c91e; 3 direct E8 to typed-host
   callees 0x9292c0 @0x92967e / 0x928ee0 @0x9296a7 / 0x9294f0
   @0x9296b4; 1 indirect import slot *0xb18a1c @0x92968e (host
   probe, arg 0xc5c3a4); 1 this-store this[0] = 0 @0x929679).
   Laws: proceed = this[0] & this[0xf8c] BYTE gates both nonzero
   (`cmpb $0` @0x929667/@0x92966c — silent early return else);
   storeClearFires = proceed (`movb $0,(%esi)` unconditional after
   both gates); stampCallFires = proceed && arg1 BYTE nonzero
   (`cmpb $0,0x8(%ebp)` @0x929675 -> call 0x9292c0); cloudSelected
   = probe result FULL DWORD nonzero (`cmpl $0,(%eax)` @0x929697)
   AND g[0x2a3a4] BYTE nonzero (`cmpb $0` @0x92969c, g = [0xc7169c])
   -> call 0x928ee0 @0x9296a7 else 0x9294f0 @0x9296b4. Kinship:
   the importer inline 0x92b780..0x92b7d2 (v25o
   isaac_pgd_import_save_select) is this dispatcher minus the arg
   gate. Evidence: section-notes/pgd-v29-final/. */
enum {
  ISAAC_PGDISP_VA = 0x00929660u,
  ISAAC_PGDISP_RET_VA = 0x009296bcu,
  ISAAC_PGDISP_BODY_BYTES = 92,
  ISAAC_PGDISP_CALL_SITES = 2,
  ISAAC_PGDISP_HOST_VA_STAMP_HELPER = 0x009292c0u,
  ISAAC_PGDISP_HOST_VA_SAVE_CLOUD = 0x00928ee0u,
  ISAAC_PGDISP_HOST_VA_SAVE_LOCAL = 0x009294f0u,
  ISAAC_PGDISP_STORE_VA = 0x00929679u,
  ISAAC_PGDISP_STAMP_CALL_VA = 0x0092967eu,
  ISAAC_PGDISP_CLOUD_CALL_VA = 0x009296a7u,
  ISAAC_PGDISP_LOCAL_CALL_VA = 0x009296b4u,
  ISAAC_PGDISP_PROBE_CALL_VA = 0x0092968eu,
  ISAAC_PGDISP_PROBE_SLOT_VA = 0x00b18a1cu,
  ISAAC_PGDISP_PROBE_ARG_VA = 0x00c5c3a4u,
  ISAAC_PGDISP_GLOBAL_VA = 0x00c7169cu,
  ISAAC_PGDISP_CLOUD_OFF = 0x2a3a4,
  ISAAC_PGDISP_GATE0_CMP_VA = 0x00929667u,
  ISAAC_PGDISP_GATE0F8C_CMP_VA = 0x0092966cu,
  ISAAC_PGDISP_ARG_CMP_VA = 0x00929675u,
  ISAAC_PGDISP_CLOUD_DWORD_CMP_VA = 0x00929697u,
  ISAAC_PGDISP_CLOUD_BYTE_CMP_VA = 0x0092969cu,
  ISAAC_PGDISP_RETURN_STACK = 4,
  /* ABI v30 — PGDCK: checksum leaf 0x683410 / region 0x683580 pins.
     The arithmetic core (mode-0 ror-add lane, mode-1 table CRC with
     the sar-rounds generator, seed 0xfedcba76) is the PGDC block;
     these pins bind it to the machine (body evidence in
     section-notes/pgd-v30-checksum/). */
  ISAAC_PGDCK_UPDATE_VA = 0x00683410u,
  ISAAC_PGDCK_UPDATE_RET_VA = 0x00683578u,
  ISAAC_PGDCK_UPDATE_BODY_BYTES = 0x168,
  ISAAC_PGDCK_UPDATE_INBOUND = 1026,
  ISAAC_PGDCK_TABLE_VA = 0x00c7e860u,
  ISAAC_PGDCK_TABLE_FLAG_VA = 0x00c7e864u,
  ISAAC_PGDCK_GEN_FIRST_SHIFT_VA = 0x00683490u,
  ISAAC_PGDCK_GEN_SAR_FIRST_VA = 0x006834a5u,
  ISAAC_PGDCK_GEN_STORE_VA = 0x0068352cu,
  ISAAC_PGDCK_GEN_LOOP_BACK_VA = 0x0068353au,
  ISAAC_PGDCK_MODE0_FOLD_VA = 0x0068344au,
  ISAAC_PGDCK_MODE1_INIT_VA = 0x00683548u,
  ISAAC_PGDCK_MODE1_LOOP_VA = 0x00683551u,
  ISAAC_PGDCK_MODE1_LOOP_BACK_VA = 0x0068356du,
  ISAAC_PGDCK_MODE1_FINAL_VA = 0x0068356fu,
  ISAAC_PGDCK_STATE_OFF_LANE = 0x0,
  ISAAC_PGDCK_STATE_OFF_PARTIAL = 0x4,
  ISAAC_PGDCK_STATE_OFF_ACC = 0x8,
  ISAAC_PGDCK_STATE_OFF_MODE = 0xc,
  ISAAC_PGDCK_REGION_VA = 0x00683580u,
  ISAAC_PGDCK_REGION_RET_VA = 0x00683674u,
  ISAAC_PGDCK_REGION_BODY_BYTES = 0xf4,
  ISAAC_PGDCK_REGION_INBOUND = 5,
  ISAAC_PGDCK_REGION_SEH_HANDLER_VA = 0x00af3860u,
  ISAAC_PGDCK_REGION_COOKIE_VA = 0x00bf93b4u,
  ISAAC_PGDCK_REGION_UPDATE_CALL_VA = 0x00683606u,
  ISAAC_PGDCK_REGION_IO_CALL_VA = 0x006835ceu,
  ISAAC_PGDCK_REGION_TELL_CALL_VA = 0x006835aeu,
  ISAAC_PGDCK_REGION_SEEK_CALL_VA = 0x006835c5u,
  ISAAC_PGDCK_REGION_READ_CALL_VA = 0x006835e6u,
  ISAAC_PGDCK_REGION_LEN_SUB_VA = 0x006835b8u,
  ISAAC_PGDCK_REGION_SEED_STORE_VA = 0x006835ffu,
  ISAAC_PGDCK_VTBL_TELL_OFF = 0x4,
  ISAAC_PGDCK_VTBL_SEEK_OFF = 0xc,
  ISAAC_PGDCK_VTBL_READ_OFF = 0x14,
  /* ABI v30 — PGDWRI: writer 0x9282e0 record plan + the 61-site
     checksum-call table. Roles: PRE/ID/CAP/CNT/ELT/SUB/KEY/VAL/TAIL. */
  ISAAC_PGDWRI_VA = 0x009282e0u,
  ISAAC_PGDWRI_RET_VA = 0x00928ed8u,
  ISAAC_PGDWRI_BODY_BYTES = 0xbf8,
  ISAAC_PGDWRI_STATE_MODE_STORE_VA = 0x0092830cu,
  ISAAC_PGDWRI_STATE_LANE_STORE_VA = 0x00928313u,
  ISAAC_PGDWRI_STATE_PARTIAL_STORE_VA = 0x0092831au,
  ISAAC_PGDWRI_STATE_SEED_STORE_VA = 0x0092831eu,
  ISAAC_PGDWRI_PRE_OFF = 0xf84,
  ISAAC_PGDWRI_PRE_HASH_VA = 0x00928336u,
  ISAAC_PGDWRI_SAVE_COUNTER_OFF = 0xf88,
  ISAAC_PGDWRI_SAVE_COUNTER_INC_VA = 0x00928e62u,
  ISAAC_PGDWRI_SAVE_COUNTER_HASH_VA = 0x00928e7cu,
  ISAAC_PGDWRI_FINAL_WRITE_VA = 0x00928ecfu,
  ISAAC_PGDWRI_CS_SITES = 61,
  ISAAC_PGDWRI_TREE_NEXT_SITES = 4,
  ISAAC_PGDWRI_VTBL_WRITE_SITES = 63,
  ISAAC_PGDWRI_MEMSET_SITES = 1,
  ISAAC_PGDWRI_STORES = 1,
  ISAAC_PGDWRI_ROLE_PRE = 0,
  ISAAC_PGDWRI_ROLE_ID = 1,
  ISAAC_PGDWRI_ROLE_CAP = 2,
  ISAAC_PGDWRI_ROLE_CNT = 3,
  ISAAC_PGDWRI_ROLE_ELT = 4,
  ISAAC_PGDWRI_ROLE_SUB = 5,
  ISAAC_PGDWRI_ROLE_KEY = 6,
  ISAAC_PGDWRI_ROLE_VAL = 7,
  ISAAC_PGDWRI_ROLE_TAIL = 8,
  /* ABI v31 — PGDVRF: save verifier 0x926f10 verify-open pins.
     Body 0x926f10..0x927cd0 (ret 4 @0x927cd0, body 0xdc0; SEH
     handler 0xb0a991, cookie 0xbf93b4; __thiscall bool (PGD* ecx,
     Stream* @[ebp+8]); inbound 5 — 0x926e98 / 0x92c023 / 0x92c203
     / 0x92c727 / 0x92c9b7). The 4-magic cascade compares FOUR
     dwords = the full 16 header bytes (`sub edi,4 ; jae` loop runs
     for edi = 0xc,8,4,0); the magics share bytes 0..11
     ("ISAACNGSAVE0") and differ at byte 12 (the kind digit) —
     dword 3 discriminates. */
  ISAAC_PGDVRF_VA = 0x00926f10u,
  ISAAC_PGDVRF_RET_VA = 0x00927cd0u,
  ISAAC_PGDVRF_BODY_BYTES = 0xdc0,
  ISAAC_PGDVRF_SEH_HANDLER_VA = 0x00b0a991u,
  ISAAC_PGDVRF_COOKIE_VA = 0x00bf93b4u,
  ISAAC_PGDVRF_INBOUND = 5,
  ISAAC_PGDVRF_RETURN_STACK = 4,
  ISAAC_PGDVRF_MAGIC_VA_06R = 0x00b1b98cu,
  ISAAC_PGDVRF_MAGIC_VA_07R = 0x00b1b9a0u,
  ISAAC_PGDVRF_MAGIC_VA_08R = 0x00b1b9b4u,
  ISAAC_PGDVRF_MAGIC_VA_09R = 0x00b7ab6cu,
  ISAAC_PGDVRF_COMPARE_LOOP_VA = 0x00926f60u,
  ISAAC_PGDVRF_COMPARE_JA_VA = 0x00926f6fu,
  ISAAC_PGDVRF_CASCADE_HEAD_06R_VA = 0x00926f53u,
  ISAAC_PGDVRF_CASCADE_HEAD_07R_VA = 0x00926f82u,
  ISAAC_PGDVRF_CASCADE_HEAD_08R_VA = 0x00926fafu,
  ISAAC_PGDVRF_CASCADE_HEAD_09R_VA = 0x00926fdfu,
  ISAAC_PGDVRF_KIND_STORE_06R_VA = 0x00926f71u,
  ISAAC_PGDVRF_KIND_STORE_07R_VA = 0x00926fa1u,
  ISAAC_PGDVRF_KIND_STORE_08R_VA = 0x00926fd1u,
  ISAAC_PGDVRF_KIND_STORE_09R_VA = 0x00927005u,
  ISAAC_PGDVRF_BOUND_STORE_06R_VA = 0x00926f76u,
  ISAAC_PGDVRF_BOUND_STORE_07R_VA = 0x00926fa6u,
  ISAAC_PGDVRF_BOUND_STORE_08R_VA = 0x00926fd6u,
  ISAAC_PGDVRF_BOUND_STORE_09R_VA = 0x0092700au,
  ISAAC_PGDVRF_MAGIC_BYTES = 16,
  ISAAC_PGDVRF_COMPARE_DWORDS = 4,
  ISAAC_PGDVRF_COMPARE_BYTES = 16,
  ISAAC_PGDVRF_KIND_DIGIT_OFF = 12,
  ISAAC_PGDVRF_KIND_MIN = 6,
  ISAAC_PGDVRF_KIND_MAX = 9,
  ISAAC_PGDVRF_CHECKSUM_CALL_VA = 0x00927017u,
  ISAAC_PGDVRF_CHECKSUM_SKIP_FRONT = 0x10,
  ISAAC_PGDVRF_CHECKSUM_SKIP_BACK = 4,
  ISAAC_PGDVRF_TRAILING_SEEK_VA = 0x0092702cu,
  ISAAC_PGDVRF_TRAILING_READ_VA = 0x00927044u,
  ISAAC_PGDVRF_TRAILING_CMP_VA = 0x00927046u,
  ISAAC_PGDVRF_TRAILING_LOG_VA = 0x00b7ab0cu,
  ISAAC_PGDVRF_HEADER_LOG_VA = 0x00b7ab3cu,
  ISAAC_PGDVRF_OLD_VERSION_LOG_VA = 0x00b7aac8u,
  ISAAC_PGDVRF_KIND_GATE_CMP_VA = 0x0092705fu,
  ISAAC_PGDVRF_KIND_GATE_JA_VA = 0x00927062u,
  ISAAC_PGDVRF_FAIL_RET_VA = 0x00927cb3u,
  ISAAC_PGDVRF_SUCCESS_RET_VA = 0x00927c9cu,
  ISAAC_PGDVRF_SAVE_COUNTER_OFF = 0xf88,
  ISAAC_PGDVRF_JUMP_TABLE_VA = 0x00927cd8u,
  ISAAC_PGDVRF_JUMP_TABLE_ENTRIES = 11,
  ISAAC_PGDVRF_BOUND_KIND6 = 0x9,
  ISAAC_PGDVRF_BOUND_KIND7 = 0xa,
  ISAAC_PGDVRF_BOUND_KIND8 = 0xa,
  ISAAC_PGDVRF_BOUND_KIND9 = 0xb,
  /* ABI v32 — PGDSAN/PGDGATE/PGDCNT: the post-load helpers
     0x927d20 / 0x929820 / 0x92a350 pins
     (section-notes/pgd-v32-postload/). */
  ISAAC_PGDSAN_VA = 0x00927d20u,
  ISAAC_PGDSAN_RET_VA = 0x009282d3u,
  ISAAC_PGDSAN_BODY_BYTES = 0x5b4,
  ISAAC_PGDSAN_INBOUND = 1,
  ISAAC_PGDSAN_RETURN_STACK = 0,
  ISAAC_PGDSAN_VERSION_OFF = 0x2c0,
  ISAAC_PGDSAN_FLAG_OFF = 0x3c,
  ISAAC_PGDSAN_COMMON_OFF = 0xea8,
  ISAAC_PGDSAN_FLAG_FIELD = 0xeac,
  ISAAC_PGDSAN_FIELD_COUNT = 21,
  ISAAC_PGDSAN_FLAG_GATE_CMP_VA = 0x00927d28u,
  ISAAC_PGDGATE_VA = 0x00929820u,
  ISAAC_PGDGATE_RET_VA = 0x009299d0u,
  ISAAC_PGDGATE_BODY_BYTES = 0x1b1,
  ISAAC_PGDGATE_INBOUND = 1,
  ISAAC_PGDGATE_RETURN_STACK = 0,
  ISAAC_PGDGATE_GUARD_GLOBAL_VA = 0x00c7169cu,
  ISAAC_PGDGATE_GUARD_OFF = 0x2a378,
  ISAAC_PGDGATE_EVENT_COUNTER_CALL_VA = 0x0092983eu,
  ISAAC_PGDGATE_EVENT_COUNTER_TARGET_VA = 0x00929b40u,
  ISAAC_PGDGATE_TRY_UNLOCK_VA = 0x00929a20u,
  ISAAC_PGDGATE_DIV_MAGIC = 0x10624dd3u,
  ISAAC_PGDGATE_DIV_SHIFT = 38,
  ISAAC_PGDGATE_RUNS_DIVISOR = 1000,
  ISAAC_PGDGATE_RUNS_THRESHOLD = 0x1f4,
  ISAAC_PGDGATE_RUNS_FIELD = 0x488,
  ISAAC_PGDGATE_ROW_COUNT = 11,
  ISAAC_PGDGATE_KIND_AND4 = 0,
  ISAAC_PGDGATE_KIND_AND3 = 1,
  ISAAC_PGDGATE_KIND_BYTEINV_ANY10 = 2,
  ISAAC_PGDGATE_KIND_BYTEINV_RUNS = 3,
  ISAAC_PGDGATE_KIND_U32GT = 4,
  ISAAC_PGDGATE_KIND_BYTESET = 5,
  ISAAC_PGDGATE_FIELD_BYTE1 = 0,
  ISAAC_PGDGATE_FIELD_B5C = 1,
  ISAAC_PGDGATE_FIELD_B27 = 2,
  ISAAC_PGDGATE_FIELD_C4C = 3,
  ISAAC_PGDGATE_FIELD_C39 = 4,
  ISAAC_PGDGATE_FIELD_BD0 = 5,
  ISAAC_PGDGATE_FIELD_B18C = 6,
  ISAAC_PGDGATE_FIELD_C0 = 7,
  ISAAC_PGDGATE_FIELD_C1 = 8,
  ISAAC_PGDGATE_FIELD_C2 = 9,
  ISAAC_PGDGATE_FIELD_C3 = 10,
  ISAAC_PGDGATE_FIELD_C4 = 11,
  ISAAC_PGDGATE_FIELD_C5 = 12,
  ISAAC_PGDGATE_FIELD_C6 = 13,
  ISAAC_PGDGATE_FIELD_C7 = 14,
  ISAAC_PGDGATE_FIELD_C8 = 15,
  ISAAC_PGDGATE_FIELD_C9 = 16,
  ISAAC_PGDGATE_FIELD_B18D = 17,
  ISAAC_PGDGATE_FIELD_RUNS = 18,
  ISAAC_PGDGATE_FIELD_B131 = 19,
  ISAAC_PGDGATE_FIELD_C320 = 20,
  ISAAC_PGDGATE_FIELD_C5A8 = 21,
  ISAAC_PGDGATE_FIELD_B5D = 22,
  ISAAC_PGDGATE_FIELD_B5E = 23,
  ISAAC_PGDGATE_FIELD_B5F = 24,
  ISAAC_PGDGATE_FIELD_B60 = 25,
  ISAAC_PGDGATE_FIELD_B189 = 26,
  ISAAC_PGDGATE_FIELD_COUNT = 27,
  ISAAC_PGDCNT_VA = 0x0092a350u,
  ISAAC_PGDCNT_RET_VA = 0x0092a510u,
  ISAAC_PGDCNT_BODY_BYTES = 0x1c1,
  ISAAC_PGDCNT_INBOUND = 6,
  ISAAC_PGDCNT_RETURN_STACK = 0,
  ISAAC_PGDCNT_ITEM_FLAG_OFF = 0xae8,
  ISAAC_PGDCNT_ACH_OFF = 0x38,
  ISAAC_PGDCNT_ITEM_LOOP_HI = 0x2dc,
  ISAAC_PGDCNT_ACH_CAP = 0x15a,
  ISAAC_PGDCNT_BADGE_LO = 1,
  ISAAC_PGDCNT_BADGE_HI = 0xb2,
  ISAAC_PGDCNT_ACH_COUNT_LO = 1,
  ISAAC_PGDCNT_ACH_COUNT_HI = 0x281,
  ISAAC_PGDCNT_T1 = 0x15a,
  ISAAC_PGDCNT_T1B = 0xb1,
  ISAAC_PGDCNT_T1C = 0xb1,
  ISAAC_PGDCNT_T2 = 0x1fe,
  ISAAC_PGDCNT_T3 = 0x113,
  ISAAC_PGDCNT_T4 = 0x192,
  ISAAC_PGDCNT_T5 = 0x2dc,
  ISAAC_PGDCNT_T6 = 0x280,
  ISAAC_PGDCNT_MAP_GLOBAL_VA = 0x00c7169cu,
  ISAAC_PGDCNT_MAP_OFF = 0x2a404,
  ISAAC_PGDCNT_MAP_FIND_VA = 0x0072fd10u,
  ISAAC_PGDCNT_B3_OFF = 0xb3,
  /* ABI v33 — PGDRO/PGDUNL/PGDADDIT: the TryUnlock-adjacent
     decision islands 0x9299e0 / 0x929aa0 / 0x92a2d0 pins
     (section-notes/pgd-v33-islands/). */
  ISAAC_PGDRO_VA = 0x009299e0u,
  ISAAC_PGDRO_RET_VA = 0x00929a0fu,
  ISAAC_PGDRO_BODY_BYTES = 0x33,
  ISAAC_PGDRO_INBOUND = 4,
  ISAAC_PGDRO_RETURN_STACK = 4,
  ISAAC_PGDRO_READONLY_OFF = 0x01,
  ISAAC_PGDRO_LOG_VA = 0x00b7aef8u,
  ISAAC_PGDRO_STRING_TRUE_VA = 0x00b64ff0u,
  ISAAC_PGDRO_STRING_FALSE_VA = 0x00b7af24u,
  ISAAC_PGDRO_LOG_CALL_VA = 0x00a112c0u,
  ISAAC_PGDRO_CMP_CMOVE_VA = 0x009299efu,
  ISAAC_PGDRO_STORE_VA = 0x00929a09u,
  ISAAC_PGDUNL_VA = 0x00929aa0u,
  ISAAC_PGDUNL_RET_VA = 0x00929af0u,
  ISAAC_PGDUNL_BODY_BYTES = 0x53,
  ISAAC_PGDUNL_INBOUND = 32,
  ISAAC_PGDUNL_RETURN_STACK = 4,
  ISAAC_PGDUNL_TRUE_TAIL_VA = 0x00929aafu,
  ISAAC_PGDUNL_FALSE_TAIL_VA = 0x00929aedu,
  ISAAC_PGDUNL_GATE_SENTINEL_VA = 0x00929aa6u,
  ISAAC_PGDUNL_GATE_NEG_VA = 0x00929aabu,
  ISAAC_PGDUNL_GATE_WINDOW_VA = 0x00929ab5u,
  ISAAC_PGDUNL_GATE_ID0_VA = 0x00929abcu,
  ISAAC_PGDUNL_GATE_ACH_VA = 0x00929ac0u,
  ISAAC_PGDUNL_GATE_MODE_VA = 0x00929accu,
  ISAAC_PGDUNL_GATE_GAME_NULL_VA = 0x00929ad7u,
  ISAAC_PGDUNL_GATE_26630_VA = 0x00929adbu,
  ISAAC_PGDUNL_GATE_26589_VA = 0x00929ae4u,
  ISAAC_PGDADDIT_VA = 0x0092a2d0u,
  ISAAC_PGDADDIT_RET_VA = 0x0092a34cu,
  ISAAC_PGDADDIT_BODY_BYTES = 0x7e,
  ISAAC_PGDADDIT_INBOUND = 6,
  ISAAC_PGDADDIT_RETURN_STACK = 4,
  ISAAC_PGDADDIT_COUNT_CALL_VA = 0x0092a350u,
  ISAAC_PGDADDIT_COUNT_CALL_SITE_VA = 0x0092a2ffu,
  ISAAC_PGDADDIT_TRY_UNLOCK_VA = 0x00929a20u,
  ISAAC_PGDADDIT_WINDOW_HI = 0x2dc,
  ISAAC_PGDADDIT_ITEM_FLAG_OFF = 0xae8,
  ISAAC_PGDADDIT_DIRTY_OFF = 0x00,
  ISAAC_PGDADDIT_ROW_A_ID = 0x17d,
  ISAAC_PGDADDIT_ROW_B_ID = 0x16b,
  ISAAC_PGDADDIT_ROW_A_CALL_VA = 0x0092a326u,
  ISAAC_PGDADDIT_ROW_B_CALL_VA = 0x0092a344u,
  ISAAC_PGDADDIT_ROW_A_GATE_B5C_VA = 0x0092a304u,
  ISAAC_PGDADDIT_ROW_A_GATE_B27_VA = 0x0092a30du,
  ISAAC_PGDADDIT_ROW_A_GATE_C4C_VA = 0x0092a316u,
  ISAAC_PGDADDIT_ROW_B_GATE_C39_VA = 0x0092a32bu,
  ISAAC_PGDADDIT_ROW_B_GATE_BD0_VA = 0x0092a334u,
  ISAAC_PGDADDIT_ENTRY_GATE_VA = 0x0092a2d9u,
  ISAAC_PGDADDIT_WINDOW_GATE_VA = 0x0092a2dfu,
  ISAAC_PGDADDIT_ID0_SKIP_VA = 0x0092a2e6u,
  ISAAC_PGDADDIT_OWNED_GATE_VA = 0x0092a2eau,
  ISAAC_PGDADDIT_FLAG_STORE_VA = 0x0092a2f4u,
  ISAAC_PGDADDIT_DIRTY_STORE_VA = 0x0092a2fcu
};

enum {
  /* ABI v34 — PGDCPY: the PersistentGameData COPY-ASSIGN 0x00929010
     (operator=, ret 4 @0x0092922e, returns this; section-notes/
     pgd-v34-frontier/). Full-coverage row plan: guarded string
     assigns + 26 bulk rows + 4 vector copies + 3 tail rows; THREE
     stale gaps; [0] dirty NOT copied; [4] handle cleared. */
  ISAAC_PGDCPY_VA = 0x00929010u,
  ISAAC_PGDCPY_RET_VA = 0x0092922eu,
  ISAAC_PGDCPY_BODY_BYTES = 0x220,
  ISAAC_PGDCPY_INBOUND = 2,
  ISAAC_PGDCPY_RETURN_STACK = 4,
  ISAAC_PGDCPY_RETURNS_THIS = 1,
  ISAAC_PGDCPY_DIRTY_OFF = 0x00,
  ISAAC_PGDCPY_HANDLE_OFF = 0x04,
  ISAAC_PGDCPY_HANDLE_CLEAR_VA = 0x00929225u,
  ISAAC_PGDCPY_STRING_A_OFF = 0x08,
  ISAAC_PGDCPY_STRING_B_OFF = 0x20,
  /* ABI v35 — PGDCON: out-of-cluster consumer census
     (section-notes/pgd-v35/). */
  ISAAC_PGD_MGR_PGD_DISP = 0x14,
  ISAAC_PGD_READONLY_MGR_DISP = 0x15,
  ISAAC_PGD_DIRTY_MGR_DISP = 0x14,
  /* PGDSEC3CON: Update-loop sec3 increment + unlock rows. */
  ISAAC_PGD_SEC3CON_FN_VA = 0x007fb250u,
  ISAAC_PGD_SEC3CON_MGR_LOAD_VA = 0x007fd75cu,
  ISAAC_PGD_SEC3CON_ADD_DISP_VA = 0x007fd762u,
  ISAAC_PGD_SEC3CON_READONLY_CMP_VA = 0x007fd765u,
  ISAAC_PGD_SEC3CON_READONLY_JNE_VA = 0x007fd769u,
  ISAAC_PGD_SEC3CON_READONLY_JNE_TARGET_VA = 0x007fd7abu,
  ISAAC_PGD_SEC3CON_INC_VA = 0x007fd76bu,
  ISAAC_PGD_SEC3CON_INC_FOLDED_DISP = 0xdc8,
  ISAAC_PGD_SEC3CON_DIRTY_STORE_VA = 0x007fd779u,
  ISAAC_PGD_SEC3CON_THRESHOLD_ROWS = 3,
  ISAAC_PGD_SEC3CON_ROW_0_CMP_VA = 0x007fd772u,
  ISAAC_PGD_SEC3CON_ROW_0_SLOT_OFF = 0xdd0,
  ISAAC_PGD_SEC3CON_ROW_0_SLOT = 2,
  ISAAC_PGD_SEC3CON_ROW_0_THRESHOLD = 0x28,
  ISAAC_PGD_SEC3CON_ROW_0_UNLOCK_ID = 0x10,
  ISAAC_PGD_SEC3CON_ROW_1_CMP_VA = 0x007fd787u,
  ISAAC_PGD_SEC3CON_ROW_1_SLOT_OFF = 0xdd8,
  ISAAC_PGD_SEC3CON_ROW_1_SLOT = 4,
  ISAAC_PGD_SEC3CON_ROW_1_THRESHOLD = 0x1e,
  ISAAC_PGD_SEC3CON_ROW_1_UNLOCK_ID = 0x11,
  ISAAC_PGD_SEC3CON_ROW_2_CMP_VA = 0x007fd799u,
  ISAAC_PGD_SEC3CON_ROW_2_SLOT_OFF = 0xde0,
  ISAAC_PGD_SEC3CON_ROW_2_SLOT = 6,
  ISAAC_PGD_SEC3CON_ROW_2_THRESHOLD = 0x14,
  ISAAC_PGD_SEC3CON_ROW_2_UNLOCK_ID = 0x12,
  ISAAC_PGD_SEC3CON_IDX_UNLOCK_ROWS = 3,
  ISAAC_PGD_SEC3CON_IDX_ROW_0_CMP_VA = 0x007fd7aeu,
  ISAAC_PGD_SEC3CON_IDX_ROW_0_VALUE = 2,
  ISAAC_PGD_SEC3CON_IDX_ROW_0_UNLOCK_ID = 0xd,
  ISAAC_PGD_SEC3CON_IDX_ROW_1_CMP_VA = 0x007fd7b7u,
  ISAAC_PGD_SEC3CON_IDX_ROW_1_VALUE = 4,
  ISAAC_PGD_SEC3CON_IDX_ROW_1_UNLOCK_ID = 0xe,
  ISAAC_PGD_SEC3CON_IDX_ROW_2_CMP_VA = 0x007fd7c0u,
  ISAAC_PGD_SEC3CON_IDX_ROW_2_VALUE = 0xb,
  ISAAC_PGD_SEC3CON_IDX_ROW_2_UNLOCK_ID = 0x9b,
  ISAAC_PGD_SEC3CON_IDX_TAIL_LEA_VA = 0x007fd7d0u,
  ISAAC_PGD_SEC3CON_IDX_TAIL_CALL_VA = 0x007fd7d3u,
  /* PGDSEC8INC: the whole-.text sec8 increment mutator. */
  ISAAC_PGD_SEC8INC_FN_VA = 0x00958e60u,
  ISAAC_PGD_SEC8INC_BOUND_CMP_VA = 0x00958e6du,
  ISAAC_PGD_SEC8INC_BOUND_MAX = 0x1a,
  ISAAC_PGD_SEC8INC_INC_VA = 0x00958e72u,
  ISAAC_PGD_SEC8INC_FOLDED_DISP = 0xeb4,
  ISAAC_PGD_SEC8INC_DIRTY_0_VA = 0x00958e79u,
  ISAAC_PGD_SEC8INC_AGG_CMP_VA = 0x00958e7du,
  ISAAC_PGD_SEC8INC_AGG_SLOT = 2,
  ISAAC_PGD_SEC8INC_AGG_SKIP_ID = 1,
  ISAAC_PGD_SEC8INC_AGG_FOLDED_DISP = 0xebc,
  ISAAC_PGD_SEC8INC_DIRTY_1_VA = 0x00958e88u,
  ISAAC_PGD_SEC8INC_WARN_STRING_VA = 0x00b7ae74u,
  ISAAC_PGD_SEC8INC_LOG_CALLEE_VA = 0x00a112c0u,
  ISAAC_PGD_SEC8INC_RETURN_STACK = 0xc,
  ISAAC_PGD_SEC8INC_CALL_SITES = 3,
  ISAAC_PGD_SEC8INC_CALL_SITE_0_VA = 0x0068fccau,
  ISAAC_PGD_SEC8INC_CALL_SITE_1_VA = 0x006f9a19u,
  ISAAC_PGD_SEC8INC_CALL_SITE_2_VA = 0x008cedbdu,
  ISAAC_PGD_SEC8INC_CALLER_GATE_VA = 0x0068fcbau,
  /* PGDSEC10COL: inlined collect clones + clear-only site. */
  ISAAC_PGD_SEC10COL_INDEX_PROVIDER_VA = 0x009e9db0u,
  ISAAC_PGD_SEC10COL_SITES = 2,
  ISAAC_PGD_SEC10COL_SITE_0_FN_VA = 0x008cddf0u,
  ISAAC_PGD_SEC10COL_SITE_0_RO_CMP_VA = 0x008cde6du,
  ISAAC_PGD_SEC10COL_SITE_0_STORE_VA = 0x008cde74u,
  ISAAC_PGD_SEC10COL_SITE_0_CLEAR0_VA = 0x008cde83u,
  ISAAC_PGD_SEC10COL_SITE_0_DIRTY_VA = 0x008cde8au,
  ISAAC_PGD_SEC10COL_SITE_0_LOG_CALL_VA = 0x008cde8eu,
  ISAAC_PGD_SEC10COL_SITE_0_SAVE_CALL_VA = 0x008cde9fu,
  ISAAC_PGD_SEC10COL_SITE_1_FN_VA = 0x0094d040u,
  ISAAC_PGD_SEC10COL_SITE_1_RO_CMP_VA = 0x0094d09au,
  ISAAC_PGD_SEC10COL_SITE_1_READ_OLD_VA = 0x0094d09eu,
  ISAAC_PGD_SEC10COL_SITE_1_STORE_VA = 0x0094d0abu,
  ISAAC_PGD_SEC10COL_SITE_1_CLEAR0_VA = 0x0094d0bau,
  ISAAC_PGD_SEC10COL_SITE_1_DIRTY_VA = 0x0094d0c1u,
  ISAAC_PGD_SEC10COL_SITE_1_LOG_CALL_VA = 0x0094d0c5u,
  ISAAC_PGD_SEC10COL_SITE_1_SAVE_CALL_VA = 0x0094d0d6u,
  ISAAC_PGD_SEC10CLEAR_FN_VA = 0x008f01b0u,
  ISAAC_PGD_SEC10CLEAR_RO_CMP_VA = 0x008f0398u,
  ISAAC_PGD_SEC10CLEAR_CLEAR_VA = 0x008f03a2u,
  ISAAC_PGD_SEC10CLEAR_DIRTY_VA = 0x008f03aau,
  ISAAC_PGD_SEC5_OUT_CONSUMERS = 0,
  ISAAC_PGD_SEC9_OUT_CONSUMERS = 0,
  ISAAC_PGDCPY_STRING_SIZE_OFF = 0x10,
  ISAAC_PGDCPY_STRING_CAP_OFF = 0x14,
  ISAAC_PGDCPY_STRING_HEAP_THRESHOLD = 0x10,
  ISAAC_PGDCPY_STRING_INLINE_CAP = 0xf,
  ISAAC_PGDCPY_SELF_GUARD_A_CMP_VA = 0x00929021u,
  ISAAC_PGDCPY_SELF_GUARD_A_JE_VA = 0x00929023u,
  ISAAC_PGDCPY_ASSIGN_A_CALL_VA = 0x00929032u,
  ISAAC_PGDCPY_SELF_GUARD_B_CMP_VA = 0x00929040u,
  ISAAC_PGDCPY_SELF_GUARD_B_JE_VA = 0x00929042u,
  ISAAC_PGDCPY_ASSIGN_B_CALL_VA = 0x00929051u,
  ISAAC_PGDCPY_ASSIGN_CALLEE_VA = 0x0040ccd0u,
  ISAAC_PGDCPY_DEFERRED_COUNT_SITE_VA = 0x0092908eu,
  ISAAC_PGDCPY_DEFERRED_COUNT = 0x1a,
  ISAAC_PGDCPY_VECTOR_CALLEE_VA = 0x0092cb30u,
  ISAAC_PGDCPY_VECTOR_SITES = 4,
  ISAAC_PGDCPY_VECTOR_DST_OFF_0 = 0xf64,
  ISAAC_PGDCPY_VECTOR_STRIDE = 8,
  ISAAC_PGDCPY_TAIL_PRE_OFF = 0xf84,
  ISAAC_PGDCPY_TAIL_SAVE_COUNTER_OFF = 0xf88,
  ISAAC_PGDCPY_TAIL_FILE_LOADED_OFF = 0xf8c,
  ISAAC_PGDCPY_STALE_GAPS = 3,
  ISAAC_PGDCPY_STALE_GAP_0_OFF = 0x2ba,
  ISAAC_PGDCPY_STALE_GAP_0_BYTES = 2,
  ISAAC_PGDCPY_STALE_GAP_1_OFF = 0xdc5,
  ISAAC_PGDCPY_STALE_GAP_1_BYTES = 3,
  ISAAC_PGDCPY_STALE_GAP_2_OFF = 0xe9d,
  ISAAC_PGDCPY_STALE_GAP_2_BYTES = 3,
  ISAAC_PGDCPY_ROWS = 33,
  ISAAC_PGDCPY_BULK_COVERED_BYTES = 3876,
  /* row kinds (the machine's copy mechanisms). */
  ISAAC_PGDCPY_KIND_REP_MOVSD = 0,
  ISAAC_PGDCPY_KIND_MOVSW = 1,
  ISAAC_PGDCPY_KIND_MOVSB = 2,
  ISAAC_PGDCPY_KIND_MOVUPS = 3,
  ISAAC_PGDCPY_KIND_MOVQ = 4,
  ISAAC_PGDCPY_KIND_DWORD = 5,
  ISAAC_PGDCPY_KIND_WORD = 6,
  ISAAC_PGDCPY_KIND_BYTE = 7,
  ISAAC_PGDCPY_KIND_VECTOR = 8,
  /* the two inbound sites (window-verified rel32). */
  ISAAC_PGDCPY_CALLER_COPY_CTOR_VA = 0x009261a0u,
  ISAAC_PGDCPY_CALLER_SNAPSHOT_VA = 0x0090c0e0u,
  ISAAC_PGDCPY_CALL_SITE_A_VA = 0x0092621au,
  ISAAC_PGDCPY_CALL_SITE_B_VA = 0x0090c258u
};

uint32_t isaac_pgd_checksum_update_va(void);
uint32_t isaac_pgd_checksum_update_ret_va(void);
int32_t isaac_pgd_checksum_update_body_bytes(void);
int32_t isaac_pgd_checksum_update_inbound(void);
uint32_t isaac_pgd_checksum_table_va(void);
uint32_t isaac_pgd_checksum_table_flag_va(void);
uint32_t isaac_pgd_checksum_gen_first_shift_va(void);
uint32_t isaac_pgd_checksum_gen_sar_first_va(void);
uint32_t isaac_pgd_checksum_gen_store_va(void);
uint32_t isaac_pgd_checksum_gen_loop_back_va(void);
uint32_t isaac_pgd_checksum_mode0_fold_va(void);
uint32_t isaac_pgd_checksum_mode1_init_va(void);
uint32_t isaac_pgd_checksum_mode1_loop_va(void);
uint32_t isaac_pgd_checksum_mode1_loop_back_va(void);
uint32_t isaac_pgd_checksum_mode1_final_va(void);
int32_t isaac_pgd_checksum_state_off_lane(void);
int32_t isaac_pgd_checksum_state_off_partial(void);
int32_t isaac_pgd_checksum_state_off_acc(void);
int32_t isaac_pgd_checksum_state_off_mode(void);
uint32_t isaac_pgd_checksum_region_va(void);
uint32_t isaac_pgd_checksum_region_ret_va(void);
int32_t isaac_pgd_checksum_region_body_bytes(void);
int32_t isaac_pgd_checksum_region_inbound(void);
uint32_t isaac_pgd_checksum_region_seh_handler_va(void);
uint32_t isaac_pgd_checksum_region_cookie_va(void);
uint32_t isaac_pgd_checksum_region_update_call_va(void);
uint32_t isaac_pgd_checksum_region_io_call_va(void);
uint32_t isaac_pgd_checksum_region_tell_call_va(void);
uint32_t isaac_pgd_checksum_region_seek_call_va(void);
uint32_t isaac_pgd_checksum_region_read_call_va(void);
uint32_t isaac_pgd_checksum_region_len_sub_va(void);
uint32_t isaac_pgd_checksum_region_seed_store_va(void);
int32_t isaac_pgd_checksum_vtbl_tell_off(void);
int32_t isaac_pgd_checksum_vtbl_seek_off(void);
int32_t isaac_pgd_checksum_vtbl_read_off(void);
uint32_t isaac_pgd_checksum_region_len(uint32_t size,
                                        uint32_t skip_front,
                                        uint32_t skip_back);
uint32_t isaac_pgd_wri_va(void);
uint32_t isaac_pgd_wri_ret_va(void);
int32_t isaac_pgd_wri_body_bytes(void);
uint32_t isaac_pgd_wri_state_mode_store_va(void);
uint32_t isaac_pgd_wri_state_lane_store_va(void);
uint32_t isaac_pgd_wri_state_partial_store_va(void);
uint32_t isaac_pgd_wri_state_seed_store_va(void);
int32_t isaac_pgd_wri_pre_off(void);
uint32_t isaac_pgd_wri_pre_hash_va(void);
int32_t isaac_pgd_wri_save_counter_off(void);
uint32_t isaac_pgd_wri_save_counter_inc_va(void);
uint32_t isaac_pgd_wri_save_counter_hash_va(void);
uint32_t isaac_pgd_wri_final_write_va(void);
int32_t isaac_pgd_wri_cs_site_count(void);
int32_t isaac_pgd_wri_tree_next_sites(void);
int32_t isaac_pgd_wri_vtbl_write_sites(void);
int32_t isaac_pgd_wri_memset_sites(void);
int32_t isaac_pgd_wri_stores(void);
uint32_t isaac_pgd_wri_cs_site_va(int32_t index);
int32_t isaac_pgd_wri_cs_site_role(int32_t index);
int32_t isaac_pgd_wri_cs_site_len(int32_t index);
int32_t isaac_pgd_wri_loop_iterations(int32_t record_id);
int32_t isaac_pgd_wri_element_hash_len(int32_t record_id);
uint32_t isaac_pgd_wri_save_counter_next(uint32_t counter);
uint32_t isaac_pgd_vrf_va(void);
uint32_t isaac_pgd_vrf_ret_va(void);
int32_t isaac_pgd_vrf_body_bytes(void);
uint32_t isaac_pgd_vrf_seh_handler_va(void);
uint32_t isaac_pgd_vrf_cookie_va(void);
int32_t isaac_pgd_vrf_inbound(void);
int32_t isaac_pgd_vrf_return_stack(void);
uint32_t isaac_pgd_vrf_magic_va(int32_t variant);
uint32_t isaac_pgd_vrf_magic_dword(int32_t variant, int32_t dword_index);
uint32_t isaac_pgd_vrf_magic_byte(int32_t variant, int32_t index);
int32_t isaac_pgd_vrf_magic_variant_dwords(uint32_t d0, uint32_t d1,
                                           uint32_t d2, uint32_t d3);
int32_t isaac_pgd_vrf_kind_from_header(uint32_t d0, uint32_t d1,
                                       uint32_t d2, uint32_t d3);
int32_t isaac_pgd_vrf_kind_from_digit_byte(uint32_t digit_byte);
int32_t isaac_pgd_vrf_bound_for_kind(int32_t kind);
int32_t isaac_pgd_vrf_trailing_match(uint32_t trailing,
                                     uint32_t checksum);
int32_t isaac_pgd_vrf_kind_accepted(uint32_t kind);
uint32_t isaac_pgd_vrf_verify_open(const uint8_t* file, uint32_t size,
                                   int32_t* out_kind, int32_t* out_bound,
                                   int32_t* out_ok, int32_t* out_accepted,
                                   int32_t* out_result);
int32_t isaac_pgd_vrf_compare_loop_va(void);
int32_t isaac_pgd_vrf_compare_dwords(void);
int32_t isaac_pgd_vrf_compare_bytes(void);
int32_t isaac_pgd_vrf_kind_digit_off(void);
uint32_t isaac_pgd_vrf_cascade_head_va(int32_t variant);
uint32_t isaac_pgd_vrf_kind_store_va(int32_t variant);
uint32_t isaac_pgd_vrf_bound_store_va(int32_t variant);
uint32_t isaac_pgd_vrf_checksum_call_va(void);
int32_t isaac_pgd_vrf_checksum_skip_front(void);
int32_t isaac_pgd_vrf_checksum_skip_back(void);
uint32_t isaac_pgd_vrf_trailing_seek_va(void);
uint32_t isaac_pgd_vrf_trailing_read_va(void);
uint32_t isaac_pgd_vrf_trailing_cmp_va(void);
uint32_t isaac_pgd_vrf_trailing_log_va(void);
uint32_t isaac_pgd_vrf_header_log_va(void);
uint32_t isaac_pgd_vrf_old_version_log_va(void);
uint32_t isaac_pgd_vrf_kind_gate_cmp_va(void);
uint32_t isaac_pgd_vrf_fail_ret_va(void);
uint32_t isaac_pgd_vrf_success_ret_va(void);
int32_t isaac_pgd_vrf_save_counter_off(void);
uint32_t isaac_pgd_vrf_jump_table_va(void);
int32_t isaac_pgd_vrf_jump_table_entries(void);
uint32_t isaac_pgd_san_va(void);
uint32_t isaac_pgd_san_ret_va(void);
int32_t isaac_pgd_san_body_bytes(void);
int32_t isaac_pgd_san_inbound(void);
int32_t isaac_pgd_san_return_stack(void);
int32_t isaac_pgd_san_version_off(void);
int32_t isaac_pgd_san_flag_off(void);
int32_t isaac_pgd_san_common_off(void);
int32_t isaac_pgd_san_flag_field(void);
int32_t isaac_pgd_san_version_gate_mins(void);
int32_t isaac_pgd_san_version_gate_min(int32_t index);
int32_t isaac_pgd_san_version_fields(void);
int32_t isaac_pgd_san_version_field(int32_t index);
int32_t isaac_pgd_san_counter_sources(void);
int32_t isaac_pgd_san_counter_source(int32_t index);
int32_t isaac_pgd_san_counter_fields(void);
int32_t isaac_pgd_san_counter_field(int32_t index);
int32_t isaac_pgd_san_gated_fields(void);
int32_t isaac_pgd_san_gated_field(int32_t index);
int32_t isaac_pgd_san_field_count(void);
uint32_t isaac_pgd_san_flag_gate_cmp_va(void);
uint32_t isaac_pgd_san_version_gate_va(int32_t index);
uint32_t isaac_pgd_san_counter_gate_va(int32_t index);
uint32_t isaac_pgd_san_clamp_row_va(int32_t index);
uint32_t isaac_pgd_san_clamp_min1(uint32_t value);
int32_t isaac_pgd_san_version_gate(int32_t version, int32_t min);
int32_t isaac_pgd_san_counter_gate(uint32_t counter);
int32_t isaac_pgd_san_flag_gate(uint32_t flag);
void isaac_pgd_sanitize_post_load(uint32_t version, uint32_t flag_byte,
                                  const uint32_t* counter_sources,
                                  const uint32_t* field_values,
                                  uint32_t common_value,
                                  uint32_t* out_fields,
                                  uint32_t* out_common,
                                  int32_t* out_fired);
uint32_t isaac_pgd_gate_va(void);
uint32_t isaac_pgd_gate_ret_va(void);
int32_t isaac_pgd_gate_body_bytes(void);
int32_t isaac_pgd_gate_inbound(void);
int32_t isaac_pgd_gate_return_stack(void);
uint32_t isaac_pgd_gate_guard_global_va(void);
int32_t isaac_pgd_gate_guard_off(void);
uint32_t isaac_pgd_gate_event_counter_call_va(void);
uint32_t isaac_pgd_gate_event_counter_target_va(void);
uint32_t isaac_pgd_gate_try_unlock_va(void);
uint32_t isaac_pgd_gate_div_magic(void);
int32_t isaac_pgd_gate_div_shift(void);
int32_t isaac_pgd_gate_runs_divisor(void);
int32_t isaac_pgd_gate_runs_threshold(void);
int32_t isaac_pgd_gate_counter_fields(void);
int32_t isaac_pgd_gate_counter_field(int32_t index);
int32_t isaac_pgd_gate_runs_field(void);
int32_t isaac_pgd_gate_row_count(void);
uint32_t isaac_pgd_gate_row_gate_va(int32_t index);
uint32_t isaac_pgd_gate_row_id(int32_t index);
uint32_t isaac_pgd_gate_row_call_va(int32_t index);
int32_t isaac_pgd_gate_row_kind(int32_t index);
int32_t isaac_pgd_gate_field_count(void);
int32_t isaac_pgd_gate_byte_set(uint32_t value);
int32_t isaac_pgd_gate_byte_clear(uint32_t value);
int32_t isaac_pgd_gate_u32_gt(uint32_t value);
int32_t isaac_pgd_gate_any_counter(const uint32_t* values, int32_t count);
uint32_t isaac_pgd_gate_runs_remainder(uint32_t value);
int32_t isaac_pgd_gate_runs1000(uint32_t value, uint32_t flag131);
int32_t isaac_pgd_gate_row_a(uint32_t byte1, uint32_t b5c, uint32_t b27,
                             uint32_t c4c);
int32_t isaac_pgd_gate_row_b(uint32_t byte1, uint32_t c39, uint32_t bd0);
int32_t isaac_pgd_gate_row_c(uint32_t b18c, const uint32_t* counters,
                             int32_t count);
int32_t isaac_pgd_gate_row_d(uint32_t b18d, uint32_t runs, uint32_t b131);
int32_t isaac_pgd_gate_row_e(uint32_t c320);
int32_t isaac_pgd_gate_row_f(uint32_t c5a8);
int32_t isaac_pgd_post_load_gates(const uint32_t* fields,
                                  uint32_t* out_ids);
uint32_t isaac_pgd_cnt_va(void);
uint32_t isaac_pgd_cnt_ret_va(void);
int32_t isaac_pgd_cnt_body_bytes(void);
int32_t isaac_pgd_cnt_inbound(void);
int32_t isaac_pgd_cnt_return_stack(void);
int32_t isaac_pgd_cnt_item_flag_off(void);
int32_t isaac_pgd_cnt_ach_off(void);
int32_t isaac_pgd_cnt_item_loop_hi(void);
int32_t isaac_pgd_cnt_ach_cap(void);
int32_t isaac_pgd_cnt_special_ids(void);
uint32_t isaac_pgd_cnt_special_id(int32_t index);
int32_t isaac_pgd_cnt_badge_ids(void);
uint32_t isaac_pgd_cnt_badge_id(int32_t index);
int32_t isaac_pgd_cnt_badge_lo(void);
int32_t isaac_pgd_cnt_badge_hi(void);
int32_t isaac_pgd_cnt_ach_count_lo(void);
int32_t isaac_pgd_cnt_ach_count_hi(void);
int32_t isaac_pgd_cnt_t1(void);
int32_t isaac_pgd_cnt_t1b(void);
int32_t isaac_pgd_cnt_t1c(void);
int32_t isaac_pgd_cnt_t2(void);
int32_t isaac_pgd_cnt_t3(void);
int32_t isaac_pgd_cnt_t4(void);
int32_t isaac_pgd_cnt_t5(void);
int32_t isaac_pgd_cnt_t6(void);
int32_t isaac_pgd_cnt_unlock_ids(void);
uint32_t isaac_pgd_cnt_unlock_id(int32_t index);
uint32_t isaac_pgd_cnt_map_global_va(void);
int32_t isaac_pgd_cnt_map_off(void);
uint32_t isaac_pgd_cnt_map_find_va(void);
int32_t isaac_pgd_cnt_b3_off(void);
uint32_t isaac_pgd_cnt_item_flag(const uint8_t* flags, uint32_t count,
                                 uint32_t id);
int32_t isaac_pgd_cnt_special(uint32_t id);
int32_t isaac_pgd_cnt_badge(uint32_t id);
int32_t isaac_pgd_cnt_count_nonzero(const uint8_t* bytes, uint32_t count,
                                    int32_t lo, int32_t hi);
int32_t isaac_pgd_cnt_count_badges(const uint8_t* bytes, uint32_t count,
                                   int32_t lo, int32_t hi);
int32_t isaac_pgd_cnt_fire(int32_t count, int32_t min);
int32_t isaac_pgd_post_load_counts(const uint8_t* item_flags,
                                   uint32_t item_count, const uint8_t* ach,
                                   uint32_t ach_count,
                                   const uint32_t* countable,
                                   uint32_t countable_count,
                                   uint32_t* out_total, uint32_t* out_ach,
                                   uint32_t* out_special, uint32_t* out_c1,
                                   uint32_t* out_c2, uint32_t* out_c3,
                                   uint32_t* out_ids,
                                   int32_t* out_id_count);
uint32_t isaac_pgd_ro_va(void);
uint32_t isaac_pgd_ro_ret_va(void);
int32_t isaac_pgd_ro_body_bytes(void);
int32_t isaac_pgd_ro_inbound(void);
int32_t isaac_pgd_ro_return_stack(void);
int32_t isaac_pgd_ro_readonly_off(void);
uint32_t isaac_pgd_ro_log_va(void);
uint32_t isaac_pgd_ro_string_true_va(void);
uint32_t isaac_pgd_ro_string_false_va(void);
uint32_t isaac_pgd_ro_log_call_va(void);
uint32_t isaac_pgd_ro_cmp_cmove_va(void);
uint32_t isaac_pgd_ro_store_va(void);
int32_t isaac_pgd_ro_call_site_count(void);
uint32_t isaac_pgd_ro_call_site_va(int32_t index);
uint32_t isaac_pgd_ro_effective_value(uint32_t value);
int32_t isaac_pgd_ro_logs_true(uint32_t value);
uint32_t isaac_pgd_ro_string_choice_va(uint32_t value);
uint32_t isaac_pgd_unl_va(void);
uint32_t isaac_pgd_unl_ret_va(void);
int32_t isaac_pgd_unl_body_bytes(void);
int32_t isaac_pgd_unl_inbound(void);
int32_t isaac_pgd_unl_return_stack(void);
int32_t isaac_pgd_unl_ach_off(void);
int32_t isaac_pgd_unl_index_hi(void);
int32_t isaac_pgd_unl_gate_count(void);
uint32_t isaac_pgd_unl_gate_va(int32_t index);
uint32_t isaac_pgd_unl_true_tail_va(void);
uint32_t isaac_pgd_unl_false_tail_va(void);
int32_t isaac_pgd_unl_call_site_count(void);
uint32_t isaac_pgd_unl_call_site_va(int32_t index);
uint32_t isaac_pgd_addit_va(void);
uint32_t isaac_pgd_addit_ret_va(void);
int32_t isaac_pgd_addit_body_bytes(void);
int32_t isaac_pgd_addit_inbound(void);
int32_t isaac_pgd_addit_return_stack(void);
uint32_t isaac_pgd_addit_count_call_va(void);
uint32_t isaac_pgd_addit_count_call_site_va(void);
uint32_t isaac_pgd_addit_try_unlock_va(void);
int32_t isaac_pgd_addit_window_hi(void);
int32_t isaac_pgd_addit_item_flag_off(void);
int32_t isaac_pgd_addit_dirty_off(void);
uint32_t isaac_pgd_addit_row_a_id(void);
uint32_t isaac_pgd_addit_row_b_id(void);
uint32_t isaac_pgd_addit_row_a_call_va(void);
uint32_t isaac_pgd_addit_row_b_call_va(void);
uint32_t isaac_pgd_addit_row_a_gate_va(int32_t index);
uint32_t isaac_pgd_addit_row_b_gate_va(int32_t index);
int32_t isaac_pgd_addit_gate_field_off(int32_t index);
uint32_t isaac_pgd_addit_entry_gate_va(void);
uint32_t isaac_pgd_addit_window_gate_va(void);
uint32_t isaac_pgd_addit_id0_skip_va(void);
uint32_t isaac_pgd_addit_owned_gate_va(void);
uint32_t isaac_pgd_addit_flag_store_va(void);
uint32_t isaac_pgd_addit_dirty_store_va(void);
int32_t isaac_pgd_addit_call_site_count(void);
uint32_t isaac_pgd_addit_call_site_va(int32_t index);
int32_t isaac_pgd_addit_window_valid(int32_t collectible_id);
int32_t isaac_pgd_addit_store_fires(uint32_t readonly,
                                    int32_t collectible_id,
                                    uint32_t owned_byte);
int32_t isaac_pgd_addit_count_machine_fires(uint32_t readonly,
                                            int32_t collectible_id,
                                            uint32_t owned_byte);
int32_t isaac_pgd_addit_row_a(uint32_t readonly, int32_t collectible_id,
                              uint32_t b5c, uint32_t b27, uint32_t c4c);
int32_t isaac_pgd_addit_row_b(uint32_t readonly, int32_t collectible_id,
                              uint32_t c39, uint32_t bd0);
void isaac_pgd_addit_decisions(uint32_t readonly,
                               int32_t collectible_id,
                               uint32_t owned_byte, uint32_t b5c,
                               uint32_t b27, uint32_t c4c, uint32_t c39,
                               uint32_t bd0, int32_t* out_store,
                               int32_t* out_count, int32_t* out_row_a,
                               int32_t* out_row_b);
uint32_t isaac_pgd_disp_probe_slot_va(void);
uint32_t isaac_pgd_disp_probe_arg_va(void);
uint32_t isaac_pgd_disp_global_va(void);
int32_t isaac_pgd_disp_cloud_off(void);
uint32_t isaac_pgd_disp_gate0_cmp_va(void);
uint32_t isaac_pgd_disp_gate0f8c_cmp_va(void);
uint32_t isaac_pgd_disp_arg_cmp_va(void);
uint32_t isaac_pgd_disp_cloud_dword_cmp_va(void);
uint32_t isaac_pgd_disp_cloud_byte_cmp_va(void);
int32_t isaac_pgd_disp_return_stack(void);
int32_t isaac_pgd_disp_proceed(uint32_t this0, uint32_t this_f8c);
int32_t isaac_pgd_disp_store_clear_fires(uint32_t this0,
                                         uint32_t this_f8c);
int32_t isaac_pgd_disp_stamp_call_fires(uint32_t this0,
                                        uint32_t this_f8c,
                                        uint32_t arg1);
int32_t isaac_pgd_disp_cloud_selected(uint32_t probe_dword,
                                      uint32_t global_2a3a4);

/* ABI v34 — PGDCPY: copy-assign row-plan laws. */
uint32_t isaac_pgd_cpy_va(void);
uint32_t isaac_pgd_cpy_ret_va(void);
int32_t isaac_pgd_cpy_body_bytes(void);
int32_t isaac_pgd_cpy_inbound(void);
int32_t isaac_pgd_cpy_return_stack(void);
int32_t isaac_pgd_cpy_returns_this(void);
int32_t isaac_pgd_cpy_dirty_off(void);
int32_t isaac_pgd_cpy_handle_off(void);
uint32_t isaac_pgd_cpy_handle_clear_va(void);
int32_t isaac_pgd_cpy_string_a_off(void);
int32_t isaac_pgd_cpy_string_b_off(void);
int32_t isaac_pgd_cpy_string_size_off(void);
int32_t isaac_pgd_cpy_string_cap_off(void);
uint32_t isaac_pgd_cpy_self_guard_cmp_va(int32_t index);
uint32_t isaac_pgd_cpy_self_guard_je_va(int32_t index);
uint32_t isaac_pgd_cpy_assign_call_va(int32_t index);
uint32_t isaac_pgd_cpy_assign_callee_va(void);
int32_t isaac_pgd_cpy_string_assign_fires(uint32_t self_equal);
uint32_t isaac_pgd_cpy_string_data_select(uint32_t cap_dword,
                                          uint32_t inline_ptr,
                                          uint32_t heap_ptr);
uint32_t isaac_pgd_cpy_deferred_count_site_va(void);
int32_t isaac_pgd_cpy_deferred_count(void);
uint32_t isaac_pgd_cpy_vector_callee_va(void);
int32_t isaac_pgd_cpy_vector_sites(void);
int32_t isaac_pgd_cpy_vector_dst_off(int32_t index);
uint32_t isaac_pgd_cpy_vector_call_site_va(int32_t index);
int32_t isaac_pgd_cpy_tail_row_off(int32_t index);
int32_t isaac_pgd_cpy_tail_row_bytes(int32_t index);
int32_t isaac_pgd_cpy_stale_gap_count(void);
int32_t isaac_pgd_cpy_stale_gap_off(int32_t index);
int32_t isaac_pgd_cpy_stale_gap_bytes(int32_t index);
int32_t isaac_pgd_cpy_row_count(void);
uint32_t isaac_pgd_cpy_row_site_va(int32_t index);
int32_t isaac_pgd_cpy_row_kind(int32_t index);
int32_t isaac_pgd_cpy_row_off(int32_t index);
int32_t isaac_pgd_cpy_row_bytes(int32_t index);
int32_t isaac_pgd_cpy_bulk_covered_bytes(void);
int32_t isaac_pgd_cpy_row_covers(int32_t offset);
uint32_t isaac_pgd_cpy_call_site_va(int32_t index);
void isaac_pgd_cpy_plan_totals(int32_t* out_rows,
                               int32_t* out_bulk_bytes,
                               int32_t* out_stale_bytes,
                               int32_t* out_vector_bytes,
                               int32_t* out_tail_bytes);

/* ABI v35 — PGDCON: out-of-cluster consumer census laws. */
uint32_t isaac_pgd_con_mgr_pgd_disp(void);
uint32_t isaac_pgd_sec3con_threshold_row_count(void);
uint32_t isaac_pgd_sec3con_threshold_row_slot(uint32_t row);
uint32_t isaac_pgd_sec3con_threshold_row_threshold(uint32_t row);
uint32_t isaac_pgd_sec3con_threshold_row_unlock_id(uint32_t row);
uint32_t isaac_pgd_sec3con_threshold_row_fires(uint32_t row,
                                               uint32_t pre_inc_value,
                                               uint32_t incremented);
uint32_t isaac_pgd_sec3con_idx_unlock_rows(void);
uint32_t isaac_pgd_sec3con_idx_unlock_id(int32_t idx);
uint32_t isaac_pgd_sec3con_idx_gated_by_readonly(void);
uint32_t isaac_pgd_sec8inc_bound_max(void);
uint32_t isaac_pgd_sec8inc_in_bound(uint32_t id);
uint32_t isaac_pgd_sec8inc_inc_self(uint32_t id);
uint32_t isaac_pgd_sec8inc_inc_agg(uint32_t id);
uint32_t isaac_pgd_sec8inc_warn_fires(uint32_t id);
uint32_t isaac_pgd_sec8inc_call_site_count(void);
uint32_t isaac_pgd_sec8inc_call_site_va(uint32_t index);
int32_t isaac_pgd_sec8gate_fires(int32_t counter_value);
uint32_t isaac_pgd_sec10col_site_count(void);
int32_t isaac_pgd_sec10col_store_index(uint32_t readonly_byte, int32_t idx);
uint32_t isaac_pgd_sec10col_clears_slot0(void);
uint32_t isaac_pgd_sec10col_dirty_fires(uint32_t readonly_byte);
uint32_t isaac_pgd_sec10col_save_local_always_runs(void);

uint32_t isaac_pgd_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
