/** Independent JS oracle for the PersistentGameData save-state pure helpers.
 *  Reasoned from the PE, not transliterated from native/decomp/pgd_pure_helpers.cpp.
 *
 *  Binary SHA-256 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
 *  Notes: output/decomp/5129df723e64/section-notes/pgd-v1/
 *
 *  Helpers ABI v24: PGDITAG + PGDIDISP — the PURE decision islands
 *            of the shared Rebirth-save snapshot reader 0x009e4260
 *            (no exact ZHL; inbound from TryImportRebirthLocalSave
 *            0x92b2e0 @0x92b574 with ecx = the 0x4f0-byte snapshot).
 *            PGDITAG: the 10-header version-tag comparison table
 *            (three FULL dwords / 0xc bytes per .rdata header;
 *            sections 2..6, counts 7/8/9; all ten bodies are
 *            "ISAACNGSAVE0" today) + the first-match outcome + the
 *            fail tail. PGDIDISP: the section-record loop gates
 *            (SIGNED js/jge entry bounds on the prev section,
 *            UNSIGNED jbe count zero-test, UNSIGNED dec/ja dispatch
 *            bound (section-1) <= 8) and the 9-row dispatch outcome
 *            (target VA, snapshot store offset, elem width 1/4,
 *            UNSIGNED cmova clamp MAX, setg flag, log VA) plus the
 *            shared gates (clamp, signed byte setg, unsigned loop
 *            bounds jae/jb for byte and dword arrays).
 *  Helpers ABI v12: PGDTREE freestanding MSVC tree iterator++ at
 *            0x00414a80 (83 bytes, 0 host calls, 134 image sites /
 *            5 PGD-cluster sites). Low-byte isnil@+0xd; left@0
 *            parent@4 right@8. Same algorithm as Exit 0x00414a80.
 *  Helpers ABI v11: PGDCLMP import-reader post-loop clamp 0x009e4af0.
 *  Helpers ABI v6:
 *    PGDCOV the complete restore coverage of
 *            PersistentGameData::TryImportRebirthLocalSave (0x0092b2e0,
 *            exact ZHL, 43 pattern bytes) — the function the v4 remap loops
 *            live in. 25 copy rows in PE execution order (23 raw block
 *            copies + the two remap loops), each transcribed from the
 *            instruction stream with its VA; per-array written/stale byte
 *            counts; the element-written predicate (blocks: written prefix;
 *            remap arrays: the v4 restore-slot laws); and the negative
 *            census (sec10/bestiary/pre-word/save-counter/file-loaded-ok
 *            never written; no array store past 0x0092b724). The block
 *            copies are RAW — no setg/setne — so a 0x80 byte lands as 0x80,
 *            unlike the reader (setg) and writer (setne).
 *    Helpers ABI v5:
 *    re-verification of the v4 remap land: the oracle laws below are
 *    unchanged, and the suite now drives them with a randomized high-bit
 *    differential (0x40000000..0xffffffff, values past both 0x5d/0xa bounds,
 *    and the 0/10/11 alias boundary) and an end-to-end caller-loop
 *    simulation performed in Wasm memory. Mutation verdicts in
 *    section-notes/pgd-v5/NOTES.md.
 *
 *  Helpers ABI v4:
 *    PGDRMAP the two restore index remaps, 0x009e4f80 (+0xdc8) and
 *            0x009e3ea0 (+0x2bc). Both are complete jump-table lookups with
 *            no host content whatsoever. Modelled here from the SHAPE of the
 *            mapping rather than as a copy of the C++ table, so a single
 *            mis-transcribed table entry shows up as a differential failure.
 *    PGDRLOOP the two loops in 0x0092b346 that drive them: signed bounds, the
 *            slot each iteration lands on, the slots never written, and the
 *            slot-0 aliasing defect (reproduced, not corrected).
 *
 *  Helpers ABI v3:
 *    PGDLOOP the exact fixed-section reader loop shape (v3) — entry gate,
 *            loop-back, store clamp, store address and store normalisation,
 *            each as its own predicate. Corrects the v2 entry gate, which was
 *            read as a signed positivity test where the PE tests for zero.
 *    PGDN    section 11's own control flow (v3): no cap check, unsigned outer
 *            loop, SIGNED pair loop, and its own map clear order
 *    PGDT    the SECOND PersistentGameData transport at 0x0091adf0 (v3),
 *            which walks the same object with explicit byte counts and so
 *            cross-proves the array widths independently of the save file
 *    PGDBP   that transport's bit-packed boolean codec at 0x0091b650 (v3)
 *    PGDGATE the full control flow of 0x00929790, which pgd+0x02 gates (v3)
 *    PGDID   per-field identification status, so "layout proved, meaning not
 *            proved" is machine-checkable rather than prose (v3)
 *    PGDL  object layout + std::string sub-object shape
 *    PGDV  magic / version tag / section ceiling
 *    PGDS  writer section descriptor table + stream offsets
 *    PGDR  reader control flow (caps, clamps, bool normalisation)
 *    PGDC  checksum: non-standard reflected table, CRC mode, ror-add mode
 *    PGDA  accessors, bounds and validation predicates
 *    PGDB  bestiary section header arithmetic
 *    PGDR2 reader-side section descriptors (v2) — read out of the eleven
 *          handlers, so the v1 writer table is cross-proved not assumed
 *    PGDM  section 11 sub-block decode (v2)
 *    PGDX  the +0xe00 index remap and the unchecked +0xf14 store (v2)
 *    PGDK  the 41-bit two-word popcount gate (v2)
 *
 *  Everything that touches storage stays host: the KAGE file stream vtable,
 *  Steam Cloud, the logging calls, the IAT allocator, and the std::map walks
 *  behind section 11.
 *
 *  The v1 "unidentified" arrays stay unidentified. The deserializer prints a
 *  label before each handler and the +0xe00 mutator names itself in its own
 *  warning, but a string is not a signature; the labels are recorded with
 *  their VAs and the identifiers stay address-stable. What v2 promotes is the
 *  behaviour the instruction stream proves.
 *
 *  v3 goes one step further and promotes each array's REPRESENTATION, which
 *  the reader does prove: width-1 sections normalise through a signed `setg`
 *  and are therefore booleans; width-4 sections copy the dword verbatim.
 *  Widths and counts are now cross-proved a third and fourth time by the
 *  0x0091adf0 transport's explicit byte counts and by the element-by-element
 *  restore at 0x0092b6d3. None of that promotes a NAME, and pgdFieldStatus
 *  encodes exactly which fields are named and which are layout-only so a
 *  later unit cannot upgrade a verdict without new machine evidence.
 */

export const PGD_PURE_ABI_VERSION = 35; /* v35-pgdcon: out-of-cluster
   consumer census (ABI 34 -> 35 atomic both sides;
   section-notes/pgd-v35/) — whole-.text displacement census over the five
   v1-unidentified array bases (+0xdc8/+0xe00/+0xea0/+0xf0c/+0xf14, both
   raw and Manager-folded +0x14 forms), pointer-provenance-verified.
   Landed: PGDSEC3CON (the Update-loop sec3 increment + threshold/index
   TryUnlock rows @0x7fd75c..0x7fd7d3 incl. the readonly-does-NOT-gate-
   index-unlocks defect), PGDSEC8INC (the whole-.text sec8 increment
   mutator 0x958e60 — unsigned bound 0x1a == PGD_COUNT_SEC8-1 re-proved
   from consumer code, id!=1 aggregate ++sec8[2], warn string 0xb7ae74,
   3 call sites) + its two >0 gates, PGDSEC10COL (two inlined collect
   clones of the PGDADSED law at 0x8cddf0/0x94d040 plus one clear-only
   site 0x8f01b0, all readonly-guarded via [mgr+0x15] and dirty via
   [mgr+0x14], SaveLocally always runs). SEC5/SEC9: census NEGATIVE —
   zero authenticated out-of-cluster consumers. No renames: identifiers
   stay address-stable per the v2 naming policy. */
   /* v34 history: copy-assign 0x00929010 (ABI 33 -> 34 atomic both sides;
   section-notes/pgd-v34-frontier/) — the full-coverage row plan.
   v33-islands: PGDRO +
   PGDUNL + PGDADDIT (ABI 32 -> 33 atomic both sides;
   section-notes/pgd-v33-islands/) — the TryUnlock-adjacent decision
   islands 0x9299e0 (SetReadOnly: low-byte cmove string choice + the
   this[1] readonly store), 0x929aa0 (Unlocked: EXACT ZHL 9B, the v1
   pgdUnlocked law re-verified byte-exact — sentinel -2 first, signed
   neg -> true, UNSIGNED window 0..0x281, id0 true before the ach
   byte, mode [0xc7169c]+8 == 2, Game* [0xc71678] null gate,
   +0x26630 UNSIGNED > 0, +0x26589 byte) and 0x92a2d0
   (AddToCollection: EXACT ZHL 15B, readonly entry + UNSIGNED window
   0..0x2dc + id0 skip + owned skip -> items[0xae8]=1 + dirty + the
   0x92a350 count machine @0x92a2ff, then the PGDGATE-A/B duplicate
   rows b5c/b27/c4c -> 0x17d @0x92a326 and c39/bd0 -> 0x16b @0x92a344);
   the log 0xa112c0, TryUnlock 0x929a20, 0x92a350 and the game globals
   stay typed-host. v32-postload: PGDSAN +
   PGDGATE + PGDCNT (ABI 31 -> 32 atomic both sides;
   section-notes/pgd-v32-postload/) — the post-load helpers
   0x927d20 (version/counter-gated min-1 clamp sanitizer, PURE),
   0x929820 (the 11-row achievement-unlock gate machine) and 0x92a350
   (the item-flag + ach count/threshold unlock machine); the unlock
   actions (TryUnlock 0x929a20, the IEC(0,0) call + the 0x2a378 guard,
   the item-map find 0x72fd10) stay typed-host. v31-verifier: PGDVRF — the
   save verifier 0x926f10 verify-open laws (ABI 30 -> 31 atomic both
   sides; section-notes/pgd-v31-verifier/): the 4-magic FULL-DWORD
   kind-selection cascade (16 bytes, four dwords — the magics differ
   at byte 12, the kind digit; dword 3 discriminates; a 12-byte
   compare would collapse every header to kind 6), the
   verify-then-compare fold-region composite (kind FIRST, region fold
   [0x10, size-4) via 0x683580 @0x927017, trailing dword @ size-4
   FULL-u32 compare), the kind > 8 acceptance gate (`cmp ebx,8 ; ja`
   @0x92705f), the bound stores (kind 6/7/8/9 -> 9/0xa/0xa/0xb) and
   the verifier pins. The record-restore loop behind it (jump table
   0x927cd8) stays typed-host stream IO. v30-checksum: the checksum
   leaf 0x683410 deep-dive + the writer 0x9282e0 record-count laws;
   ABI 29 -> 30 atomic both sides (section-notes/pgd-v30-checksum/).
   PGDCK pins the arithmetic core (RE-VERIFIED byte-exact vs the v1
   PGDC block): 0x683410 update (ret 8 @0x683578, body 0x168; mode 0 =
   buffered ror-add lane, mode 1 = reflected table CRC with the
   sar-rounds generator — table[1] 0x09073096 re-derived, the on-disk
   .data table is stale so the GENERATOR is the law; mode >= 2 =
   identity; inbound 1026) and the 0x683580 region wrapper (SEH
   handler 0xaf3860, cookie 0xbf93b4, vtbl +0x4 tell / +0xc seek /
   +0x14 read, 0xa648b0 string IO @0x6835ce, update call @0x683606;
   inbound 5; skip_front 0x10 / skip_back 4 CONFIRMED at the verifier
   call site 0x927017 inside 0x926f10) + the region-length u32-wrap
   law pgdChecksumRegionLen. PGDWRI lands the writer's literal
   record plan: 10 fixed sections (bound = count_word, stride = elem
   width, base = field offset) + the R11 sub-block plan + the 61-site
   checksum-call table {va, role, len} (v29's "60x" corrected to 61 —
   the pre-record this+0xf84 dword hash @0x928336 was missed) + the
   save-counter inc law. Stream IO (63x vtbl+0x1c, 4x 0x414a80, 1
   memset) stays typed-host; the writer as a whole stays IRREDUCIBLE.
   v29-final: PGDISP (the save
   dispatcher 0x929660 decision laws) lands — the LAST un-landed PURE
   island of the family; ABI 28 -> 29 atomic both sides
   (section-notes/pgd-v29-final/). PGDISP = the dispatcher's four
   predicates: pgdDispProceed (this[0] & this[0xf8c] BYTE gates,
   `cmpb $0` @0x929667/@0x92966c — silent early return unless both
   nonzero), pgdDispStoreClearFires (the `movb $0,(%esi)` @0x929679
   fires iff proceed — unconditional after gates, PGDIEC dirty-store
   style), pgdDispStampCallFires (arg1 BYTE gate @0x929675 ->
   0x9292c0 call pin 0x92967e), pgdDispCloudSelected (probe result
   FULL DWORD `cmpl $0,(%eax)` @0x929697 AND g[0x2a3a4] BYTE
   @0x92969c -> 0x928ee0 @0x9296a7 else 0x9294f0 @0x9296b4; probe =
   import slot *0xb18a1c @0x92968e with arg 0xc5c3a4, host input).
   Kinship: the importer inline 0x92b780..0x92b7d2 (v25o
   pgdImportSaveSelect) is this dispatcher minus the arg gate.
   0x9293d0 file-save helper + 0x9282e0 write_stream root stay
   IRREDUCIBLE (census: 6 E8/7 indirect/2 stores and 65 E8/63
   indirect/1 store — written evidence). Inbound CORRECTED via
   census-callers-fixed.py + per-site windows: dispatcher 2
   (0x91a398, 0x94c91e), 0x928ee0 17, 0x9292c0 13, 0x9294f0 22.
   v28-hostleaf: PGDULD +
   the PGDHOST law pins — the save-cluster host-leaf assessment
   (section-notes/pgd-v28-hostleaf/). PGDULD = the 0x009296c0
   tier-ladder decision island (the LAST pure island on the family
   record; 200 bytes, ret @0x929788; 6 inbound call sites; the only
   call is typed-host TryUnlock 0x929a20 @0x929773). Laws:
   pgdUldCount = (u32(end-start) * 0x63e7063f)>>38, minus 1 for
   non-negative (magic = ceil(2^38/164), 2^38 = 164*M - 92;
   BigInt-exact for every u32 wrap. For x < 2^31 the result equals
   floor(x/164), minus 1 at exact multiples of 164 — the multiply-
   high +1 flip needs x >= 2^38/92 = 2987803336 with x mod 164 ==
   163, and every such x is >= 2^31, where the SIGNED imul path
   applies, so no flip is observable: the raw multiply is the law);
   pgdUldSegmentIndex = min_u32(tier, count) (`cmovb` UNSIGNED —
   wrapped negative counts select the tier); pgdUldLoopIterations =
   u32((countWord - ptr)>>2 SAR) unsigned loop bound (`cmp ebx,ecx ;
   jae`); pgdUldFlagAccum = cmovne AND over this[entry+0x38] BYTE
   flags (reset 1 per tier @0x9296d8); pgdUldUnlockId = the 46-entry
   .rdata ladder 0xb7b0b0 (const, transcribed; row 45 = 0x204);
   pgdUldFire = flag && tier <= 0x2d && id != 0. Store census:
   ZERO this/global stores, 0 indirects. PGDHOST pins: cookie stub
   0xaef12b verified PURE (`cmp ecx,[0xbf93b4] ; jne fail ; ret ;
   jmp 0xaef775`, 8 bytes, 0 E8, stays host-TYPED) + checksum region
   0x683580 verified NOT pure (SEH + vtbl + 1 E8; skip_front 0x10,
   skip_back 4, non-standard table[1] 0x09073096, seed 0xfedcba76).
   The three remaining save fns 0x928ee0/0x9292c0/0x9294f0 are
   IRREDUCIBLE (evidence in the notes; ABI 27 -> 28 atomic).
   v27: PGDIEC — the
   IncreaseEventCounter 0x00929b40 threshold cascade (EXACT ZHL, 21
   pattern bytes, ret 8 @0x92a2c8; 74 inbound callers; the v1 "host
   cascade" verdict superseded by the v20/v21/v22 standard: gate laws
   pure, TryUnlock typed-host). Readonly LOW-BYTE gate `cmp byte
   [esi+1],0 ; jne skip-all` @0x929b5e; SIGNED saturating counter
   store @0x929b68..0x929b7d (the landed event_counter_next law,
   byte-identical) with the UNCHECKED slot offset 0x2bc + 4*slot;
   dirty store `mov byte [esi],1` @0x929b84 UNCONDITIONAL after the
   gate; then the 52-row direct threshold->unlock cascade
   @0x929b87..0x929ff8 (54 TryUnlock call sites — rows 27/28 fire
   TWO unlock ids per gate). EVERY direct row is `cmp u32 dword, IMM
   ; jb` UNSIGNED (opcode 72) except: row 1 `test eax,eax ; je`
   NONZERO; row 16 PAIR (0x31c AND 0x320 both nonzero via jbe-vs-0);
   row 41 MODE (`cmp [0x5b4],0x1f ; jb` + `cmp [0xc7169c]+8,1 ;
   jne` — FULL DWORD mode == 1, host input). TryUnlock 0x929a20
   typed-host; cookie 0xaef12b HOST. The group walk 0x92a000..
   0x92a253 (vectors 0xbabxxx + group table 0xc35ed0 stride 0x90 —
   ALL .data, runtime-mutable) and the five derived tail gates
   @0x92a259..0x92a2b3 (ecx jl SIGNED 3/6 -> 0x15a/0x15b, byte flag
   je -> 0x114, edi jb 0x11 -> 0x223, ebx jb 0x22 -> 0x27c) are HOST
   census (values come from the .data walk). ABI 26 -> 27, atomic
   both sides.
   v26: PGDREADER2 + PGDIVER —
   the SIBLING save reader 0x0041d670's full pure surface (own 3-row
   tag table / size gate / version reads / 10-row dispatch + per-
   section rows / tails) and the import reader 0x009e4260's version
   gates + fail tail (ABI 25 -> 26, atomic both sides).
   v24: PGDITAG + PGDIDISP —
   the PURE decision islands of the shared Rebirth-save snapshot
   reader 0x009e4260 (the v8 "next measured candidate"; no exact
   ZHL; inbound from TryImportRebirthLocalSave 0x92b2e0 @0x92b574
   with ecx = the 0x4f0-byte snapshot; ret 0x9e4aa1, fail-tail ret
   0x9e4ac7). PGDITAG = the version-tag comparison table: a 16-byte
   stream read (vtbl+0x14 @0x9e4282, HOST) into [ebp-0x14], then
   ten .rdata save headers compared as THREE FULL DWORDs (0xc
   bytes) each — 0xb805bc/0xb8060c (section 2, count 7), 0xb805a8/
   0xb805f8 (section 3, count 8), 0xb805e4/0xb80514 (section 4,
   count 8), 0xb805d0/0xb80500 (section 5, count 9), 0xb1b98c/
   0xb80560 (section 6, count 9); ALL TEN 12-byte bodies are
   currently "ISAACNGSAVE0" (dwords 0x41415349/0x53474e43/
   0x30455641) so row 0 always wins; a full miss falls to the fail
   tail 0x9e4aa2 (cdecl log (1, 0xb80528 "...", buffer) ->
   0xa112c0 HOST, return 0). PGDIDISP = the section-record loop and
   the 9-row dispatch outcome: entry gate `test eax,eax ; js fail`
   + `cmp eax,ebx ; jge fail` on the PREVIOUS section value (SIGNED
   0 <= prev < elemCount 7/8/9, 0x9e448a/0x9e4492); record reads
   (HOST); count gate `cmp [ebp-0x20],0 ; jbe next` (UNSIGNED
   zero-only, 0x9e44bf/0x9e44c3); dispatch gate `dec eax ; cmp
   eax,8 ; ja next` (UNSIGNED (section-1) <= 8 -> 0..8,
   0x9e44cc..0x9e44d0) through the 9-entry jump table 0x9e4ac8;
   each handler reads a record count (HOST), logs a mismatch (HOST
   0xa112c0), clamps UNSIGNED `cmova` to its builtin MAX
   (0xb3/0x5f/0xc/0x15b/7/0x39/0x15/0x14/1), then loops with TWO
   UNSIGNED bounds — `cmp edi,[ebp-0x20] ; jae` (record byte count)
   and `cmp <iter>,[ebp-0x18] ; jb` (clamped count); byte handlers
   normalise each element `cmp byte,0 ; setg al` (SIGNED int8 > 0)
   into the snapshot flag arrays (+0x38 achievements, +0x268
   collection, +0x3f4/+0x3fb miniboss/boss, +0x434 challenges),
   dword handlers store raw dwords (+0xec counters, +0x3c4 sec3,
   +0x44c sec8, +0x49c settings). The 7+ vtbl indirect stream calls,
   the 9 cdecl logs, the stamp-cookie 0xaef12b, PGDCLMP 0x9e4af0
   and the stage-4 tally loops stay HOST. Cross-check: the clamp
   MAXes equal the v6 PGDCOV written byte counts 1:1; the store
   offsets are the v6 snapshot restore sources; the v1/v2
   isaac_pgd_reader_* laws (0x00927c8a reader, 11 dispatch entries,
   boundary <= 0xa) are a DIFFERENT reader and must NOT be conflated
   with this unit's <= 8 boundary. v23: PGDADSED + PGDK41 —
   the two remaining v1-"unidentified" mutator islands between the
   count probe and the landed TryImportRebirthLocalSave 0x92b2e0;
   the whole 0x92b22a..0x92b2e0 span is pure-covered after this
   unit. PGDADSED = the "seed added to SaveState" mutator 0x0092b230
   (no exact ZHL — self-named by its log string "Seed %d added to
   SaveState\n" @0xb7ae58; address-stable; ret 4 @0x92b25f; int3 pad
   0x92b262..0x92b26e; inbound from the update slice 0x68cdc0
   @0x69166e). Readonly LOW BYTE gate `cmp byte [ecx+1],0 ; jne ret`
   @0x92b233/@0x92b237 (no work at all when set — [ecx+1] =
   PGD_OFF_READONLY); unchecked slot store `mov byte [eax+ecx+0xf14],1`
   @0x92b244 with eax = the seed — byte [pgd+0xf14+SEED] = 1, the
   RAW byte index, never masked or bounded (0xf14 =
   PGD_OFF_SEC10_BYTES, 0x50 slots = PGD_SEC10_SLOTS); unconditional
   slot-0 clear `mov byte [ecx+0xf14],0` @0x92b24c right after
   (seed==0 self-cancels); dirty `mov byte [ecx],1` @0x92b253
   (pgd+0 = PGD_OFF_CHANGES_MADE); the log args (1, 0xb7ae58, seed)
   are pushed BEFORE the stores and the cdecl call @0x92b256 ->
   0xa112c0 stays HOST. PGDK41 = the 41-bit two-word popcount gate
   0x0092b270 (no exact ZHL; address-stable; ret 8 @0x92b2d9):
   `mov [ebx+0x5ac],eax` @0x92b281 (first arg -> counters[188]) and
   `mov [ebx+0xa7c],eax` @0x92b28a (second arg -> counters[496];
   0x2bc = PGD_OFF_EVENT_COUNTERS); the 41-iteration loop
   @0x92b295..0x92b2ba counts set bits over bits 0..40 via `bts
   esi,ecx` (bit index masked to 5 bits), `cmp ecx,0x20 ; cmovae
   edx,esi ; xor esi,edx` (low word zeroed for i>=32), `and
   esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je` (lo bit i for i<32,
   hi bit i-32 for i>=32), `jl 0x92b295` bound 0x29 = 41; `cmp
   edi,5 ; jl 0x92b2d0` @0x92b2bf/@0x92b2c2 SIGNED gate; `push
   0x143 ; mov ecx,ebx ; call 0x929a20` @0x92b2c4/@0x92b2cb
   (TryUnlock stays HOST) fires only at popcount >= 5; the dirty
   store `mov byte [ebx],1` @0x92b2d2 is UNCONDITIONAL (runs even
   when the unlock does not). Both match the v2 PGDX behaviour
   oracles (sec10/mask41); v23 adds the machine-exact
   evidence. v22: PGDADDMINI — the
   PersistentGameData::AddMiniBoss flag-and-unlock mutator 0x0092a520
   (no exact ZHL — self-named by its own warning string "[warn]
   AddMiniBoss: invalid miniboss id %d" @0xb7aecc; address-stable;
   ret 4 @0x92a5d3; two ALIVE image callers 0x7ffff1 / 0x800010
   byte-scan verified). Readonly LOW BYTE gate `cmp byte [esi+1],0
   ; jne fail` @0x92a529/0x92a52d; id window `cmp eax,0xf ; ja warn`
   UNSIGNED @0x92a533/0x92a536 (above 0xf logs (1, 0xb7aecc, ORIGINAL
   arg) and returns via the fail tail — negatives warn too); id->index
   fold @0x92a53c..0x92a557: 7..0xd map to 0..6 (`lea ecx,[eax-7] ;
   cmp ecx,6 ; ja`), 0xe aliases to 6 (`mov eax,6` @0x92a54d),
   0..6 used directly, 0xf DROPPED SILENTLY (signed `cmp eax,6 ; jg`
   @0x92a557 — no store, no log); flag store `mov byte
   [eax+esi+0xe00],1` @0x92a55f (+0xe00 = ISAAC_PGD_OFF_SEC5_BYTES,
   7 slots = ISAAC_PGD_COUNT_SEC5); dirty store `mov byte [esi],1`
   @0x92a569 (pgd+0 = ISAAC_PGD_OFF_CHANGES_MADE); host log
   (1, "MiniBoss %d added to SaveState\n" @0xb7aeac, idx) cdecl
   @0x92a56c -> 0xa112c0; ALL-SET gate over the seven flags
   0xe00..0xe06 (@0x92a574..0x92a5b1) -> `push 0x16 ; mov ecx,esi ;
   call 0x929a20` (TryUnlock stays HOST) @0x92a5b7. Matches the v2
   PGDX sec5 behaviour oracle exactly; v22 adds the branch-level
   evidence and makes the warn/silent distinction explicit. v21:
   PGDADDBOSS — the
   PersistentGameData::AddBoss flag-and-unlock mutator 0x0092a5e0
   (EXACT ZHL `__thiscall void AddBoss(int bossID)`, 12 pattern
   bytes; ret 4 @0x92a79f; two ALIVE image callers 0x7fc01f /
   0x7ff7a8 byte-scan verified; int3 pad @0x92a7a2; the dump at
   0x92a700 lands mid-instruction of `cmp byte [esi+0xe2d],0`).
   Readonly LOW BYTE gate @0x92a5e6/0x92a5ea; arg gate `cmp eax,0x68
   ; jge fail` SIGNED with NO floor @0x92a5f3/0x92a5f6 (negative
   bossIDs pass, wrap the store offset — the v16
   isaac_pgd_boss_index_valid law); flag store `mov byte
   [eax+esi+0xe07],1` @0x92a602 (+0xe07 = ISAAC_PGD_OFF_BOSSES,
   0x68 values 0..0x67 = ISAAC_PGD_COUNT_BOSSES); dirty store `mov
   byte [esi],1` @0x92a60c (pgd+0 = ISAAC_PGD_OFF_CHANGES_MADE);
   host log (1, "Boss %d added to SaveState\n" @0xb7ae90, bossID)
   cdecl @0x92a60f -> 0xa112c0; then eight sequential ALL-nonzero
   AND-gated TryUnlock calls (0x929a20 stays HOST): B1
   e08,e09,e14,e18,e33,e3f -> 0x56; B2 e0a,e0b,e15,e23,e36,e34 ->
   0x57; B3 e0c,e0d,e16,e37,e35 -> 0x58; B4 e26 -> 0xf; B5
   e10,e11,e12,e13,e2d -> 0x174; B6 e54,e52,e53,e62 -> 0x19c; B7
   e5a,e57,e51,e59 -> 0x19d; B8 e0d,e56,e58 -> 0x19e (e0d read by
   BOTH B3 and B8). v20: PGDADDCH — the
   PersistentGameData::AddChallenge flag-and-unlock dispatcher
   0x0092a7b0 (EXACT ZHL `__thiscall void AddChallenge(int
   challengeID)`, 9 pattern bytes; ret 4 @0x92aa2c; one ALIVE image
   caller 0x704f84 byte-scan verified). Readonly LOW BYTE gate
   @0x92a7b3/0x92a7ba; arg gate `cmp eax,0x2d ; ja fail` UNSIGNED
   @0x92a7c0/0x92a7c3; flag store `mov byte [eax+ecx+0xe6f],1`
   @0x92a7c9 (BEFORE the dispatch gate — arg 0 STOREs the flag byte
   but never unlocks); `dec eax ; cmp eax,0x2c ; ja fail`
   @0x92a7d1/0x92a7d2/0x92a7d5; `jmp [eax*4+0x92aa30]` @0x92a7db into
   a 45-entry table of `mov [ebp+8],<id> ; pop ebp ; jmp 0x929a20`
   arms (idx 0..44, unlock ids 0x59..0x21a by arg 1..45; TryUnlock
   0x929a20 stays HOST; +0xe6f = challenges byte map,
   ISAAC_PGD_OFF_CHALLENGES, count 0x2e, args 0..0x2d = 0x2e values).
   v19: PGDADDSIB2 +
   PGDADDSIB3 — the slot-2/slot-3 sibling AddBestiary* write mutators
   0x0092aaf0 + 0x0092abd0 (wrappers, ret 8) paired with their store
   helpers 0x0092ab40 + 0x0092ac20 (ret 4). The v18 handoff guessed
   these four were AddBestiaryKill-shaped bodies with own unlock
   dispatches; the machine is TWO wrapper/helper pairs, zero ZHL
   matches on all four (address-stable names; no unlock dispatch, no
   kill-count getter in the set). Wrapper: readonly gate (cmp byte
   [esi+1],0), container find 0x695030 on [0xc7169c]+0x2a670, rec
   null gate, gate byte +0xe8 LOW BYTE gate, `((w0<<12)|w1)<<8` key,
   call helper (returns the helper's bool; helper's own readonly gate
   = the same pgd+1 byte re-checked, a separate sampled input).
   Helper (aligned prologue `55 8b ec 83 e4 f8 83 ec 10`): its own
   readonly gate, map find 0x4288a0 on the slot header (slot-2 base
   0xf74 = PGD_BESTIARY_OFF_ROOT[2], slot-3 base 0xf7c =
   PGD_BESTIARY_OFF_ROOT[3]), the three node gates, WRITE-side store
   (node_ok ? old+1 mod 2^32 : 1 — INSERT on gate fail, same
   inversion as PGDADDKILL; both store paths return al=1). Callers:
   0x92aaf0 <- 0x774461, 0x92abd0 <- 0x7780c8; helpers' only callers
   are their wrappers. Container find 0x695030, map find 0x4288a0,
   value-slot accessor 0x92ca70 stay HOST. v18: PGDADDKILL — the
   write-side bestiary mutator PersistentGameData::AddBestiaryKill
   0x0092acb0 (EXACT ZHL, 15 pattern bytes, `__thiscall bool
   AddBestiaryKill(int EntityType, int EntityVariant)`; four inbound
   E8 sites 0x4c8618/0x59f451/0x7a0946/0x92b047; ret 8 @0x92adf2 ok /
   @0x92adfd fail; next island 0x92aea0 = the landed v15 PGDCP probe).
   Pure laws over sampled inputs: entry fail gates (readonly LOW BYTE
   != 0 / rec_found == 0 / gate_byte LOW BYTE == 0 -> return 0, in
   that order; otherwise 1 ALWAYS), `((w0<<12)|w1)<<8` key, three
   node gates (marker LOW BYTE zero AND SIGNED key >= node_key AND
   node != header), WRITE-side store decision (node_ok ? old+1 mod
   2^32 : 1 — INSERT on gate fail, opposite of the getters), byte-
   table dispatch (idx = type-0x10f UNSIGNED > 0x85 -> case 3 else
   byte_table[idx] {0->0, 1->0, 0x23->1, 0x85->2, else->3}), unlock
   gates (case0 sum >= 0xa UNSIGNED, case1/2 count >= 0x14 UNSIGNED,
   case3 never) + unlock ids (0->0x175, 1->0x15d, 2->0x164, 3->0)
   and the case0 sum (n1+n2 mod 2^32, n1=killcount(0x110,0),
   n2=killcount(0x10f,0)). Container find 0x695030, map find
   0x4288a0, value accessor 0x92ca70, kill getter 0x92b100 and
   TryUnlock 0x929a20 stay HOST. v17: PGDKILL + PGDENC — the
   bestiary slot-1 GetBestiaryKillCount getter 0x0092b100 and the
   bestiary slot-0 GetBestiaryEncounterCount getter 0x0092b190, the
   sibling template of PGDDEATH (key derivation
   `((w0<<12)|w1)<<8` from the record dwords, node eligibility:
   marker byte +0xd LOW-BYTE zero AND SIGNED key >= node_key AND node
   != map header, value at node+0x14) with slot bases 0xf6c (kill) and
   0xf64 (encounter; the v16 handoff's "0xf74" was wrong — machine
   `lea edi,[ecx+0xf64]` @0x92b1ef + ZHL struct bestiary@0xf64). The
   v16 handoff's "0x92b110" kill entry was a MID-INSTRUCTION decode —
   the true aligned entry is 0x92b100 (cf. 0x92b0c0 in v15). The
   encounter getter derives the key inline then calls the local helper
   0x92b1e0 (map find 0x4288a0 on pgd+0xf64 + the three node gates).
   v16: PGDDEATH the bestiary slot-3 GetBestiaryDeathCount getter
   0x0092b070. v15: PGDCP reader-side
   bestiary count-probe 0x0092aea0 — the pure count-derivation laws
   over sampled game-state tree elements (entry LOW-BYTE readonly gate
   on pgd+1; gate1 SIGNED [el+0x7c] >= 0; gate2 float [el+0x68]
   IEEE-equal to +0.0f via `ucomiss xmm0,0.0 ; lahf ; test ah,0x44 ;
   jnp` — only the ordered-equal ZF=1,PF=0 row counts, NaN and every
   non-zero skip; gate3 LOW-BYTE [el+0x100] != 0; store decision:
   [0xc7f508] re-derived + stored ONLY while the cached global is
   zero, effective = cached!=0 ? cached : derived; proceed gate:
   UNSIGNED [pgd+0xf68] >= count before the host +0x15/+0x17c /
   0x9595e0 block). v14: PGDSC11 the writer's
   section-11 sub-block framing inside 0x009282e0 (header id=0xb, cap =
   totalRows<<2 where totalRows = wrap-32 sum of the four bestiary count
   words +0xf68/+0xf70/+0xf78/+0xf80 added in machine order c2+c3+c1+c0;
   the THIRD header dword is the sub-block count 4, not the row total —
   the total stored at [ebp-0xc] @0x928acd is a dead store, the streamed
   word is subcount=4 @0x928b20; per walk step s a sub-block cap =
   count[PGD_TREE_ROW_COUNT_OFFS[s]] << 2 preludes the row walk; reader
   0x9276e1: unsigned jbe subcount==0 gate, tag-1 unsigned <= 3 gate,
   SIGNED cap>0 gate then unsigned shr 2 -> rows, unsigned sub-loop jb,
   signed row-loop jl). v13: PGDTROW writer bestiary tree-row walk
   0x009282e0. v12: PGDTREE 0x00414a80 iterator++. v11: PGDCLMP
   import-reader post-loop clamp 0x009e4af0 (SIGNED cmovg floor-1, 0 host,
   one site 0x009e4613). v10 PGDICT + v9 PGDCT stay. */

/* ---------- PGDL: object layout ---------- */

export const PGD_OFF_CHANGES_MADE = 0x00;
export const PGD_OFF_READONLY = 0x01;
export const PGD_OFF_FLAG_02 = 0x02;
export const PGD_OFF_FILE = 0x04;
export const PGD_OFF_FILEPATH = 0x08;
export const PGD_OFF_STEAMCLOUDPATH = 0x20;
export const PGD_OFF_ACHIEVEMENTS = 0x38;
export const PGD_OFF_EVENT_COUNTERS = 0x2bc;
export const PGD_OFF_ITEM_COLLECTION = 0xae8;
export const PGD_OFF_SEC3_DWORDS = 0xdc8;
export const PGD_OFF_SEC5_BYTES = 0xe00;
export const PGD_OFF_BOSSES = 0xe07;
export const PGD_OFF_CHALLENGES = 0xe6f;
export const PGD_OFF_SEC8_DWORDS = 0xea0;
export const PGD_OFF_SEC9_DWORDS = 0xf0c;
export const PGD_OFF_SEC10_BYTES = 0xf14;
export const PGD_OFF_BESTIARY = 0xf64;
export const PGD_OFF_PRE_SECTION_WORD = 0xf84;
export const PGD_OFF_SAVE_COUNTER = 0xf88;
export const PGD_OFF_FILE_LOADED_OK = 0xf8c;

export const PGD_COUNT_ACHIEVEMENTS = 0x282;
export const PGD_COUNT_EVENT_COUNTERS = 0x20b;
export const PGD_COUNT_ITEM_COLLECTION = 0x2dd;
export const PGD_COUNT_SEC3 = 0xe;
export const PGD_COUNT_SEC5 = 7;
export const PGD_COUNT_BOSSES = 0x68;
export const PGD_COUNT_CHALLENGES = 0x2e;
export const PGD_COUNT_SEC8 = 0x1b;
export const PGD_COUNT_SEC9 = 2;
export const PGD_COUNT_SEC10 = 0x50;

export const PGD_STRING_SIZE = 0x18;
export const PGD_STRING_OFF_LEN = 0x10;
export const PGD_STRING_OFF_CAP = 0x14;
export const PGD_STRING_SSO_CAP = 0x10;

/* Host residual VAs recorded for the plan, never invoked from here.
   (0x926f10 = verify_open: its PURE verify-open front now lands as
   PGDVRF — magic-kind selection + fold-region + trailing compare; the
   record-restore loop behind it stays host.) */
export const PGD_HOST_VA_SAVE_TO_STEAM_CLOUD = 0x00928ee0;
export const PGD_HOST_VA_WRITE_STREAM = 0x009282e0;
export const PGD_HOST_VA_READ_STREAM = 0x00926f10;
export const PGD_HOST_VA_SAVE_LOCAL = 0x009294f0;
export const PGD_HOST_VA_STREAM_OPEN = 0x00683930;
export const PGD_HOST_VA_CHECKSUM_UPDATE = 0x00683410;
export const PGD_HOST_VA_CHECKSUM_REGION = 0x00683580;
export const PGD_HOST_VA_TREE_NEXT = 0x00414a80;
export const PGD_CRC_TABLE_VA = 0x00c7e860;
export const PGD_CRC_TABLE_GUARD_VA = 0x00c7e864;
export const PGD_STATE_CRC_VA = 0x006ef2c3;
export const PGD_STATE_CRC_TABLE_VA = 0x00c7ec70;
export const PGD_STATE_CRC_INIT = 0xffffffff;

/* Collision to keep on record: the catalog SaveLocally pattern resolves to
 * 0x006d0ca0 in this image, which is an entity-list walk, not a save. */
export const PGD_SIGNATURE_COLLISION_SAVE_LOCALLY_VA = 0x006d0ca0;

function asI32(v) {
  return v | 0;
}

function asU32(v) {
  return v >>> 0;
}

function asU8(v) {
  return (v | 0) & 0xff;
}

/** Reinterpret the low byte as a signed char, which is what `setg` tests. */
function asI8(v) {
  return (asU8(v) << 24) >> 24;
}

/* ---------- PGDL helpers ---------- */

/**
 * A MSVC short string keeps its characters inline until the capacity slot
 * reaches the inline budget; from that point the first word is a pointer.
 */
export function pgdStringDataIsHeap(capacity) {
  return asU32(capacity) >= PGD_STRING_SSO_CAP;
}

/* ---------- PGDV: magic / version ---------- */

export const PGD_MAGIC_BYTES = 16;
export const PGD_MAGIC_VARIANTS = 4;
export const PGD_CHECKSUM_TAIL_BYTES = 4;
export const PGD_CHECKSUM_SKIP_FRONT = 0x10;
export const PGD_CHECKSUM_SKIP_BACK = 4;
export const PGD_SECTION_HEADER_BYTES = 12;
export const PGD_MIN_LOADABLE_VERSION = 9;

/** The four accepted headers, oldest first. Each is exactly 16 ASCII bytes. */
export const PGD_MAGIC_STRINGS = [
  "ISAACNGSAVE06R  ",
  "ISAACNGSAVE07R  ",
  "ISAACNGSAVE08R  ",
  "ISAACNGSAVE09R  ",
];

/** Version tag and the exclusive section-id ceiling each header selects. */
const MAGIC_TABLE = [
  { version: 6, maxSectionId: 0x9 },
  { version: 7, maxSectionId: 0xa },
  { version: 8, maxSectionId: 0xa },
  { version: 9, maxSectionId: 0xb },
];

export const PGD_VERSION_09 = 9;
export const PGD_MAX_SECTION_ID_V09 = 0xb;

export function pgdMagicByte(variant, index) {
  const v = asI32(variant);
  const i = asI32(index);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  if (i < 0 || i >= PGD_MAGIC_BYTES) return 0;
  return PGD_MAGIC_STRINGS[v].charCodeAt(i);
}

/**
 * @param {ArrayLike<number>} magic 16 bytes read from the head of the file
 * @returns {number} variant index, or -1 when nothing matches
 */
export function pgdMagicVariant(magic) {
  if (!magic || magic.length < PGD_MAGIC_BYTES) return -1;
  for (let v = 0; v < PGD_MAGIC_VARIANTS; ++v) {
    let hit = true;
    for (let i = 0; i < PGD_MAGIC_BYTES; ++i) {
      if (asU8(magic[i]) !== PGD_MAGIC_STRINGS[v].charCodeAt(i)) {
        hit = false;
        break;
      }
    }
    if (hit) return v;
  }
  return -1;
}

export function pgdVersionForVariant(variant) {
  const v = asI32(variant);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  return MAGIC_TABLE[v].version;
}

export function pgdMaxSectionIdForVariant(variant) {
  const v = asI32(variant);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  return MAGIC_TABLE[v].maxSectionId;
}

/** Only the newest header is loaded directly; the others need conversion. */
export function pgdVersionLoadable(versionTag) {
  return asU32(versionTag) > PGD_MIN_LOADABLE_VERSION - 1;
}

/* ---------- PGDS: section table ---------- */

export const PGD_SECTION_MIN_ID = 1;
export const PGD_SECTION_MAX_ID = 11;
export const PGD_BESTIARY_SECTION_ID = 11;
export const PGD_BESTIARY_SUBMAPS = 4;

/**
 * The ten fixed sections, in emission order. `cap` and `count` are the literal
 * header dwords; `width` is how wide each payload element is written.
 */
const SECTIONS = [
  { id: 1, cap: 0x282, count: 0x282, width: 1, offset: PGD_OFF_ACHIEVEMENTS },
  { id: 2, cap: 0x82c, count: 0x20b, width: 4, offset: PGD_OFF_EVENT_COUNTERS },
  { id: 3, cap: 0x38, count: 0xe, width: 4, offset: PGD_OFF_SEC3_DWORDS },
  { id: 4, cap: 0xb74, count: 0x2dd, width: 1, offset: PGD_OFF_ITEM_COLLECTION },
  { id: 5, cap: 0x1c, count: 0x7, width: 1, offset: PGD_OFF_SEC5_BYTES },
  { id: 6, cap: 0x1a0, count: 0x68, width: 1, offset: PGD_OFF_BOSSES },
  { id: 7, cap: 0xb8, count: 0x2e, width: 1, offset: PGD_OFF_CHALLENGES },
  { id: 8, cap: 0x6c, count: 0x1b, width: 4, offset: PGD_OFF_SEC8_DWORDS },
  { id: 9, cap: 0x8, count: 0x2, width: 4, offset: PGD_OFF_SEC9_DWORDS },
  { id: 10, cap: 0x140, count: 0x50, width: 1, offset: PGD_OFF_SEC10_BYTES },
];

/**
 * @returns {null | {id:number, capWord:number, countWord:number,
 *   elemWidth:number, fieldOffset:number, payloadBytes:number, fixed:boolean}}
 */
export function pgdSectionDesc(id) {
  const wanted = asI32(id);
  if (wanted === PGD_BESTIARY_SECTION_ID) {
    return {
      id: wanted,
      capWord: 0,
      countWord: PGD_BESTIARY_SUBMAPS,
      elemWidth: 0,
      fieldOffset: PGD_OFF_BESTIARY,
      payloadBytes: 0,
      fixed: false,
    };
  }
  const row = SECTIONS.find((s) => s.id === wanted);
  if (!row) return null;
  return {
    id: row.id,
    capWord: row.cap,
    countWord: row.count,
    elemWidth: row.width,
    fieldOffset: row.offset,
    payloadBytes: row.count * row.width,
    fixed: true,
  };
}

/** Header dwords plus payload, for the fixed sections only. */
export function pgdSectionStreamBytes(id) {
  const row = SECTIONS.find((s) => s.id === asI32(id));
  if (!row) return -1;
  return PGD_SECTION_HEADER_BYTES + row.count * row.width;
}

/** Where the section's first header dword lands in the file. */
export function pgdSectionStreamOffset(id) {
  const wanted = asI32(id);
  if (!SECTIONS.some((s) => s.id === wanted)) return -1;
  let at = PGD_MAGIC_BYTES + 4;
  for (const row of SECTIONS) {
    if (row.id === wanted) break;
    at += PGD_SECTION_HEADER_BYTES + row.count * row.width;
  }
  return at;
}

/** Everything before the bestiary block is a compile-time constant size. */
export function pgdFixedPrefixBytes() {
  let at = PGD_MAGIC_BYTES + 4;
  for (const row of SECTIONS) {
    at += PGD_SECTION_HEADER_BYTES + row.count * row.width;
  }
  return at;
}

/* ---------- PGDR: reader control flow ---------- */

/** The loop stops as soon as the id it last saw is negative or past the tag's
 *  ceiling. Both comparisons are signed. */
export function pgdReaderLoopContinue(prevId, maxSectionId) {
  const id = asI32(prevId);
  if (id < 0) return false;
  return id < asI32(maxSectionId);
}

/** A zero cap means "nothing to consume"; the compare is unsigned so a cap
 *  with the sign bit set is still a live section. */
export function pgdReaderSectionSkipped(capWord) {
  return asU32(capWord) === 0;
}

/** The jump table covers ids 1..11 after a bias of one. */
export function pgdReaderSectionDispatched(id) {
  return asU32(asI32(id) - 1) <= 0xa;
}

/** The payload cursor is counted in bytes for every section width. */
export function pgdReaderPayloadContinue(byteCursor, capWord) {
  return asU32(byteCursor) < asU32(capWord);
}

/** Stores are clamped to the array the executable was built with. */
export function pgdReaderStoreInRange(index, builtinCount) {
  return asU32(index) < asU32(builtinCount);
}

/** Only a diagnostic; the section is still consumed. */
export function pgdReaderCountMismatch(fileCount, builtinCount) {
  return asI32(fileCount) !== asI32(builtinCount);
}

/** Read side treats the stored byte as signed, so 0x80..0xff decode to false. */
export function pgdReaderBoolNormalize(rawByte) {
  return asI8(rawByte) > 0;
}

/** Write side only asks whether the byte is non-zero. */
export function pgdWriterBoolNormalize(rawByte) {
  return asU8(rawByte) !== 0;
}

/* ---------- PGDC: checksum ---------- */

export const PGD_CHECKSUM_SEED = 0xfedcba76;
export const PGD_CHECKSUM_POLY = 0xedb88320;
export const PGD_CHECKSUM_MODE_ROR_ADD = 0;
export const PGD_CHECKSUM_MODE_CRC = 1;
export const PGD_CHECKSUM_TABLE_ENTRIES = 256;

/**
 * The table is generated with the register held in a signed slot, so seven of
 * the eight halvings keep the sign bit alive. Only the first halving acts on a
 * value that is guaranteed non-negative (the seed index is below 256), which
 * is why the machine can use a logical shift there and an arithmetic one
 * afterwards without changing meaning. The consequence is that this is *not*
 * the textbook CRC-32 table: entry 1 is 0x09073096.
 */
export function pgdCrcTableEntry(index) {
  let c = asU32(index) & 0xff;
  // first halving: the value is small, so logical and arithmetic agree
  c = asU32((c >>> 1) ^ (c & 1 ? PGD_CHECKSUM_POLY : 0));
  for (let round = 1; round < 8; ++round) {
    const carry = c & 1;
    // arithmetic halving: `>>` on a signed 32-bit view keeps the sign bit
    c = asU32((asI32(c) >> 1) ^ (carry ? PGD_CHECKSUM_POLY : 0));
  }
  return c;
}

let cachedTable = null;

function crcTable() {
  if (cachedTable === null) {
    cachedTable = new Uint32Array(PGD_CHECKSUM_TABLE_ENTRIES);
    for (let i = 0; i < PGD_CHECKSUM_TABLE_ENTRIES; ++i) {
      cachedTable[i] = pgdCrcTableEntry(i);
    }
  }
  return cachedTable;
}

/** Recorded so the difference from the state CRC-32 is testable, not implied. */
export function pgdCrcTableUsesArithmeticShift() {
  return true;
}

/** The save path never reaches 0x006ef2c3; it only shares the polynomial. */
export function pgdSaveUsesStateCrcRoutine() {
  return false;
}

/** One reflected byte of the fold. */
export function pgdCrcStep(reg, byteValue) {
  const r = asU32(reg);
  return asU32((r >>> 8) ^ crcTable()[(r ^ asU8(byteValue)) & 0xff]);
}

/**
 * The legacy fold: rotate the accumulator right by one bit, then add the
 * little-endian word. The machine spells the rotate as two shifts summed
 * together, and because the halves never overlap the sum is exactly a rotate.
 */
export function pgdRorAddStep(acc, word) {
  const a = asU32(acc);
  const rotated = asU32(((a >>> 1) | (a << 31)) >>> 0);
  return asU32(rotated + asU32(word));
}

/** @returns {{buffer:number, partialLen:number, acc:number, mode:number}} */
export function pgdChecksumInit(mode) {
  return {
    buffer: 0,
    partialLen: 0,
    acc: asU32(PGD_CHECKSUM_SEED),
    mode: asI32(mode),
  };
}

function bufferBytes(state) {
  const b = asU32(state.buffer);
  return [b & 0xff, (b >>> 8) & 0xff, (b >>> 16) & 0xff, (b >>> 24) & 0xff];
}

function packBytes(bytes) {
  return asU32(
    (bytes[0] & 0xff) |
      ((bytes[1] & 0xff) << 8) |
      ((bytes[2] & 0xff) << 16) |
      ((bytes[3] & 0xff) << 24),
  );
}

/**
 * @param {{buffer:number, partialLen:number, acc:number, mode:number}} state
 * @param {ArrayLike<number>|null} data
 * @param {number} len
 */
export function pgdChecksumUpdate(state, data, len) {
  const n = asI32(len);
  if (state.mode === PGD_CHECKSUM_MODE_ROR_ADD) {
    if (n <= 0 || !data) return state;
    const bytes = bufferBytes(state);
    let partial = state.partialLen & 0xff;
    for (let i = 0; i < n; ++i) {
      if (partial < 4) bytes[partial] = asU8(data[i]);
      partial = (partial + 1) & 0xff;
      if (partial >= 4) {
        state.acc = pgdRorAddStep(state.acc, packBytes(bytes));
        partial = 0;
      }
    }
    state.buffer = packBytes(bytes);
    state.partialLen = partial;
    return state;
  }
  if (state.mode !== PGD_CHECKSUM_MODE_CRC) {
    // any other selector leaves the object untouched
    return state;
  }
  // the stored word is the complement of the working register
  let reg = asU32(~state.acc);
  if (n <= 0 || !data) {
    state.acc = asU32(~reg);
    return state;
  }
  for (let i = 0; i < n; ++i) {
    reg = pgdCrcStep(reg, data[i]);
  }
  state.acc = asU32(~reg);
  return state;
}

/**
 * Only the legacy mode has a tail to flush; the CRC mode has already stored a
 * complete value after every update.
 */
export function pgdChecksumFinalize(state) {
  if (state.mode !== PGD_CHECKSUM_MODE_ROR_ADD) return asU32(state.acc);
  const partial = state.partialLen & 0xff;
  if (partial === 0) return asU32(state.acc);
  const bytes = bufferBytes(state);
  if (partial < 4) {
    for (let i = partial; i < 4; ++i) bytes[i] = 0;
  }
  return pgdRorAddStep(state.acc, packBytes(bytes));
}

/**
 * @param {ArrayLike<number>|null} data
 * @param {number} len
 * @param {number} mode
 */
export function pgdChecksumBuffer(data, len, mode) {
  const state = pgdChecksumInit(mode);
  pgdChecksumUpdate(state, data, len);
  return pgdChecksumFinalize(state);
}

/** The reader's range: skip the header, stop before the trailing word. */
export function pgdChecksumFileRegion(file, len, skipFront, skipBack) {
  const n = asI32(len);
  const front = asI32(skipFront);
  const back = asI32(skipBack);
  if (!file || n <= 0 || front < 0 || back < 0) return 0;
  const span = n - front - back;
  if (span <= 0) return 0;
  const slice = Array.from({ length: span }, (_, i) => asU8(file[front + i]));
  return pgdChecksumBuffer(slice, span, PGD_CHECKSUM_MODE_CRC);
}

export function pgdChecksumFileValid(file, len) {
  const n = asI32(len);
  if (!file || n < PGD_MAGIC_BYTES + PGD_CHECKSUM_TAIL_BYTES + 1) return false;
  const computed = pgdChecksumFileRegion(
    file,
    n,
    PGD_CHECKSUM_SKIP_FRONT,
    PGD_CHECKSUM_SKIP_BACK,
  );
  const base = n - PGD_CHECKSUM_TAIL_BYTES;
  const stored = packBytes([
    file[base],
    file[base + 1],
    file[base + 2],
    file[base + 3],
  ]);
  return computed === stored;
}

/* ============================================================
   Helpers ABI v30 — PGDCK: checksum leaf pins + region length.
   ============================================================ */

/* 0x00683410 checksum_update leaf — arithmetic core pins (body evidence
   in section-notes/pgd-v30-checksum/). __thiscall (state, ptr, len),
   ret 8 @0x683578, BODY_BYTES 0x168. State: +0 lane u32, +4 partial
   BYTE, +8 acc u32, +0xc mode i32. mode 0 = buffered ror-add; mode 1 =
   reflected table CRC (table generated once at 0xc7e860, latch flag
   0xc7e864); mode >= 2 = identity. The PGDC block above is the exact
   arithmetic law (re-verified this unit against a fresh full decode);
   these pins tie it to the machine. */
export const PGD_CHECKSUM_UPDATE_VA = 0x00683410;
export const PGD_CHECKSUM_UPDATE_RET_VA = 0x00683578;
export const PGD_CHECKSUM_UPDATE_BODY_BYTES = 0x168;
export const PGD_CHECKSUM_UPDATE_INBOUND = 1026;
export const PGD_CHECKSUM_TABLE_VA = 0x00c7e860;
export const PGD_CHECKSUM_TABLE_FLAG_VA = 0x00c7e864;
export const PGD_CHECKSUM_GEN_FIRST_SHIFT_VA = 0x00683490;
export const PGD_CHECKSUM_GEN_SAR_FIRST_VA = 0x006834a5;
export const PGD_CHECKSUM_GEN_STORE_VA = 0x0068352c;
export const PGD_CHECKSUM_GEN_LOOP_BACK_VA = 0x0068353a;
export const PGD_CHECKSUM_MODE0_FOLD_VA = 0x0068344a;
export const PGD_CHECKSUM_MODE1_INIT_VA = 0x00683548;
export const PGD_CHECKSUM_MODE1_LOOP_VA = 0x00683551;
export const PGD_CHECKSUM_MODE1_LOOP_BACK_VA = 0x0068356d;
export const PGD_CHECKSUM_MODE1_FINAL_VA = 0x0068356f;
export const PGD_CHECKSUM_STATE_OFF_LANE = 0x0;
export const PGD_CHECKSUM_STATE_OFF_PARTIAL = 0x4;
export const PGD_CHECKSUM_STATE_OFF_ACC = 0x8;
export const PGD_CHECKSUM_STATE_OFF_MODE = 0xc;

/* 0x00683580 checksum_region — the SEH/vtbl wrapper stays typed-host
   (handler 0xaf3860, cookie 0xbf93b4, vtbl +0x4 tell @0x6835ae / +0xc
   seek @0x6835c5 / +0x14 read @0x6835e6, 0xa648b0 IO @0x6835ce); the
   arithmetic core = mode-1 fold of [start, start+len) seeded
   0xfedcba76 (state init @0x6835ed..0x6835ff, update call @0x683606).
   Inbound 5 (0x41d71d, 0x90d874, 0x927017 — the PGD verifier inside
   0x926f10, with `push 4 ; push 0x10` -> skip_front 0x10 / skip_back
   4 CONFIRMED at the call site —, 0x9cc2aa, 0x9d7dff). */
export const PGD_CHECKSUM_REGION_VA = 0x00683580;
export const PGD_CHECKSUM_REGION_RET_VA = 0x00683674;
export const PGD_CHECKSUM_REGION_BODY_BYTES = 0xf4;
export const PGD_CHECKSUM_REGION_INBOUND = 5;
export const PGD_CHECKSUM_REGION_SEH_HANDLER_VA = 0x00af3860;
export const PGD_CHECKSUM_REGION_COOKIE_VA = 0x00bf93b4;
export const PGD_CHECKSUM_REGION_UPDATE_CALL_VA = 0x00683606;
export const PGD_CHECKSUM_REGION_IO_CALL_VA = 0x006835ce;
export const PGD_CHECKSUM_REGION_TELL_CALL_VA = 0x006835ae;
export const PGD_CHECKSUM_REGION_SEEK_CALL_VA = 0x006835c5;
export const PGD_CHECKSUM_REGION_READ_CALL_VA = 0x006835e6;
export const PGD_CHECKSUM_REGION_LEN_SUB_VA = 0x006835b8;
export const PGD_CHECKSUM_REGION_SEED_STORE_VA = 0x006835ff;
export const PGD_CHECKSUM_VTBL_TELL_OFF = 0x4;
export const PGD_CHECKSUM_VTBL_SEEK_OFF = 0xc;
export const PGD_CHECKSUM_VTBL_READ_OFF = 0x14;

/* The region length law: `sub ebx,[ebp+8] ; sub ebx,[ebp+0xc]` —
   pos - skip_front - skip_back as two u32 wraps. (The file-level
   helper pgdChecksumFileRegion keeps its validated span guard; this is
   the raw machine arithmetic.) */
export function pgdChecksumRegionLen(size, skipFront, skipBack) {
  return asU32(asU32(asU32(size) - asU32(skipFront)) - asU32(skipBack));
}

export function pgdChecksumUpdateVa() {
  return PGD_CHECKSUM_UPDATE_VA;
}
export function pgdChecksumUpdateRetVa() {
  return PGD_CHECKSUM_UPDATE_RET_VA;
}
export function pgdChecksumUpdateBodyBytes() {
  return PGD_CHECKSUM_UPDATE_BODY_BYTES;
}
export function pgdChecksumUpdateInbound() {
  return PGD_CHECKSUM_UPDATE_INBOUND;
}
export function pgdChecksumTableVa() {
  return PGD_CHECKSUM_TABLE_VA;
}
export function pgdChecksumTableFlagVa() {
  return PGD_CHECKSUM_TABLE_FLAG_VA;
}
export function pgdChecksumGenFirstShiftVa() {
  return PGD_CHECKSUM_GEN_FIRST_SHIFT_VA;
}
export function pgdChecksumGenSarFirstVa() {
  return PGD_CHECKSUM_GEN_SAR_FIRST_VA;
}
export function pgdChecksumGenStoreVa() {
  return PGD_CHECKSUM_GEN_STORE_VA;
}
export function pgdChecksumGenLoopBackVa() {
  return PGD_CHECKSUM_GEN_LOOP_BACK_VA;
}
export function pgdChecksumMode0FoldVa() {
  return PGD_CHECKSUM_MODE0_FOLD_VA;
}
export function pgdChecksumMode1InitVa() {
  return PGD_CHECKSUM_MODE1_INIT_VA;
}
export function pgdChecksumMode1LoopVa() {
  return PGD_CHECKSUM_MODE1_LOOP_VA;
}
export function pgdChecksumMode1LoopBackVa() {
  return PGD_CHECKSUM_MODE1_LOOP_BACK_VA;
}
export function pgdChecksumMode1FinalVa() {
  return PGD_CHECKSUM_MODE1_FINAL_VA;
}
export function pgdChecksumStateOffLane() {
  return PGD_CHECKSUM_STATE_OFF_LANE;
}
export function pgdChecksumStateOffPartial() {
  return PGD_CHECKSUM_STATE_OFF_PARTIAL;
}
export function pgdChecksumStateOffAcc() {
  return PGD_CHECKSUM_STATE_OFF_ACC;
}
export function pgdChecksumStateOffMode() {
  return PGD_CHECKSUM_STATE_OFF_MODE;
}
export function pgdChecksumRegionVa() {
  return PGD_CHECKSUM_REGION_VA;
}
export function pgdChecksumRegionRetVa() {
  return PGD_CHECKSUM_REGION_RET_VA;
}
export function pgdChecksumRegionBodyBytes() {
  return PGD_CHECKSUM_REGION_BODY_BYTES;
}
export function pgdChecksumRegionInbound() {
  return PGD_CHECKSUM_REGION_INBOUND;
}
export function pgdChecksumRegionSehHandlerVa() {
  return PGD_CHECKSUM_REGION_SEH_HANDLER_VA;
}
export function pgdChecksumRegionCookieVa() {
  return PGD_CHECKSUM_REGION_COOKIE_VA;
}
export function pgdChecksumRegionUpdateCallVa() {
  return PGD_CHECKSUM_REGION_UPDATE_CALL_VA;
}
export function pgdChecksumRegionIoCallVa() {
  return PGD_CHECKSUM_REGION_IO_CALL_VA;
}
export function pgdChecksumRegionTellCallVa() {
  return PGD_CHECKSUM_REGION_TELL_CALL_VA;
}
export function pgdChecksumRegionSeekCallVa() {
  return PGD_CHECKSUM_REGION_SEEK_CALL_VA;
}
export function pgdChecksumRegionReadCallVa() {
  return PGD_CHECKSUM_REGION_READ_CALL_VA;
}
export function pgdChecksumRegionLenSubVa() {
  return PGD_CHECKSUM_REGION_LEN_SUB_VA;
}
export function pgdChecksumRegionSeedStoreVa() {
  return PGD_CHECKSUM_REGION_SEED_STORE_VA;
}
export function pgdChecksumVtblTellOff() {
  return PGD_CHECKSUM_VTBL_TELL_OFF;
}
export function pgdChecksumVtblSeekOff() {
  return PGD_CHECKSUM_VTBL_SEEK_OFF;
}
export function pgdChecksumVtblReadOff() {
  return PGD_CHECKSUM_VTBL_READ_OFF;
}

/* ---------- PGDA: accessors and bounds ---------- */

export const PGD_UNLOCKED_SENTINEL_NEVER = -2;
export const PGD_UNLOCKED_MODE_VALUE = 2;
export const PGD_UNLOCKED_MODE_GLOBAL_VA = 0x00c7169c;
export const PGD_GAME_GLOBAL_VA = 0x00c71678;
export const PGD_GAME_OFF_26630 = 0x26630;
export const PGD_GAME_OFF_26589 = 0x26589;

export function pgdAchievementIndexValid(achievementId) {
  return asU32(achievementId) < PGD_COUNT_ACHIEVEMENTS;
}

/**
 * @param {object} opts
 * @param {number} opts.achievementId
 * @param {number} [opts.achievementByte] stored flag, read only when in range
 * @param {number} [opts.modeWord] the global at 0x00c7169c + 8
 * @param {boolean|number} [opts.gameNull]
 * @param {number} [opts.game26630]
 * @param {number} [opts.game26589]
 */
export function pgdUnlocked({
  achievementId,
  achievementByte = 0,
  modeWord = 0,
  gameNull = 0,
  game26630 = 0,
  game26589 = 0,
} = {}) {
  const id = asI32(achievementId);
  if (id === PGD_UNLOCKED_SENTINEL_NEVER) return false;
  if (id < 0) return true;
  if (!pgdAchievementIndexValid(id)) return false;
  if (id === 0) return true;
  if (asU8(achievementByte) !== 0) return true;
  if (asI32(modeWord) !== PGD_UNLOCKED_MODE_VALUE) return false;
  if (gameNull) return false;
  if (asU32(game26630) > 0) return true;
  return asU8(game26589) !== 0;
}

/**
 * There is no upper bound here in the executable, only the two rejections.
 * A caller-supplied id past the array writes past the array.
 */
export function pgdTryUnlockStoreNeeded(readonly, achievementId, achievementByte) {
  if (asU8(readonly) !== 0) return false;
  if (asI32(achievementId) === 0) return false;
  return asU8(achievementByte) === 0;
}

export function pgdTryUnlockSteamLeg(flag02, cloudReady) {
  if (cloudReady) return false;
  return asU8(flag02) !== 0;
}

export function pgdCollectionIndexValid(collectibleId) {
  return asU32(collectibleId) <= PGD_COUNT_ITEM_COLLECTION - 1;
}

export function pgdCollectionStoreNeeded(readonly, collectibleId, currentByte) {
  if (asU8(readonly) !== 0) return false;
  if (!pgdCollectionIndexValid(collectibleId)) return false;
  if (asI32(collectibleId) === 0) return false;
  return asU8(currentByte) === 0;
}

export function pgdChallengeIndexValid(challengeId) {
  return asU32(challengeId) <= PGD_COUNT_CHALLENGES - 1;
}

export function pgdChallengeStoreNeeded(readonly, challengeId) {
  if (asU8(readonly) !== 0) return false;
  return pgdChallengeIndexValid(challengeId);
}

/** Signed ceiling and no floor at all — deliberately unlike the two above. */
export function pgdBossIndexValid(bossId) {
  return asI32(bossId) < PGD_COUNT_BOSSES;
}

export function pgdBossStoreNeeded(readonly, bossId) {
  if (asU8(readonly) !== 0) return false;
  return pgdBossIndexValid(bossId);
}

/**
 * The counter saturates at zero on the way down: the delta is only applied
 * when adding it cannot take the stored value below zero, tested by comparing
 * the negated delta against the stored value with signed ordering. Both the
 * negation and the addition wrap at 32 bits.
 */
export function pgdEventCounterNext(oldValue, num) {
  const old = asI32(oldValue);
  const delta = asI32(num);
  const negated = asI32(-delta);
  if (negated <= old) return asI32(old + delta);
  return 0;
}

export function pgdEventCounterStoreNeeded(readonly) {
  return asU8(readonly) === 0;
}

/**
 * @param {ArrayLike<number>|null} flags
 * @param {number} count
 * @param {number} index
 */
export function pgdFlagGet(flags, count, index) {
  const n = asI32(count);
  if (!flags || n <= 0) return false;
  if (asU32(index) >= asU32(n)) return false;
  return asU8(flags[index]) !== 0;
}

export function pgdFlagSet(flags, count, index, value) {
  const n = asI32(count);
  if (!flags || n <= 0) return false;
  if (asU32(index) >= asU32(n)) return false;
  flags[index] = value ? 1 : 0;
  return true;
}

export function pgdFlagPopcount(flags, count) {
  const n = asI32(count);
  if (!flags || n <= 0) return 0;
  let total = 0;
  for (let i = 0; i < n; ++i) {
    if (asU8(flags[i]) !== 0) total += 1;
  }
  return total;
}

/* ---------- PGDB: bestiary header ---------- */

export const PGD_BESTIARY_OFF_ROOT = [0xf64, 0xf6c, 0xf74, 0xf7c];
export const PGD_BESTIARY_OFF_COUNT = [0xf68, 0xf70, 0xf78, 0xf80];
export const PGD_BESTIARY_NODE_KEY_OFF = 0x10;
export const PGD_BESTIARY_NODE_VALUE_OFF = 0x14;

/** Summation order matters only for the wrap, and the machine adds the third
 *  and fourth pair sizes first, then the second, then the first. */
export function pgdBestiaryTotal(count0, count1, count2, count3) {
  let acc = asU32(asU32(count2) + asU32(count3));
  acc = asU32(acc + asU32(count1));
  return asU32(acc + asU32(count0));
}

export function pgdBestiaryCapWord(total) {
  return asU32(asU32(total) << 2);
}

/** Sub-blocks are emitted with tags 4, 2, 3, 1 in that order. */
const BESTIARY_TAGS = [4, 2, 3, 1];
const BESTIARY_PAIRS = [3, 1, 2, 0];

export function pgdBestiarySubmapTag(slot) {
  const s = asI32(slot);
  if (s < 0 || s >= PGD_BESTIARY_SUBMAPS) return 0;
  return BESTIARY_TAGS[s];
}

export function pgdBestiarySubmapPair(slot) {
  const s = asI32(slot);
  if (s < 0 || s >= PGD_BESTIARY_SUBMAPS) return -1;
  return BESTIARY_PAIRS[s];
}

/* ======================= ABI v2 ======================= */

/* ---------- PGDR2: reader-side section descriptors ---------- */

/**
 * Read out of the eleven jump-table handlers, not copied from SECTIONS above.
 * `builtinCount` is the value the handler compares the file's count against
 * (mismatch only warns); `storeBound` is the separate clamp that decides
 * whether an element reaches the array. They agree everywhere, but they are
 * two different instructions, so keeping both makes the agreement testable.
 * `logBeginVa` / `logEndVa` / `logMismatchVa` are recorded as evidence for
 * what each section is called — deliberately not used to name anything.
 */
const READER_SECTIONS = [
  { id: 1, builtinCount: 0x282, elemWidth: 1, fieldOffset: 0x38, storeBound: 0x282, clampsFileCount: false, handlerVa: 0x00927118, logBeginVa: 0x00b7aa9c, logEndVa: 0x00b7aa80, logMismatchVa: 0x00b1ba38 },
  { id: 2, builtinCount: 0x20b, elemWidth: 4, fieldOffset: 0x2bc, storeBound: 0x20b, clampsFileCount: false, handlerVa: 0x009271a6, logBeginVa: 0x00b7ac5c, logEndVa: 0x00b7ac44, logMismatchVa: 0x00b1ba60 },
  { id: 3, builtinCount: 0xe, elemWidth: 4, fieldOffset: 0xdc8, storeBound: 0xe, clampsFileCount: false, handlerVa: 0x00927244, logBeginVa: 0x00b7ac2c, logEndVa: 0x00b7ac0c, logMismatchVa: 0x00b1ba60 },
  { id: 4, builtinCount: 0x2dd, elemWidth: 1, fieldOffset: 0xae8, storeBound: 0x2dd, clampsFileCount: false, handlerVa: 0x009272dc, logBeginVa: 0x00b7abf4, logEndVa: 0x00b7abd8, logMismatchVa: 0x00b1ba84 },
  { id: 5, builtinCount: 0x7, elemWidth: 1, fieldOffset: 0xe00, storeBound: 0x7, clampsFileCount: false, handlerVa: 0x00927374, logBeginVa: 0x00b7abc0, logEndVa: 0x00b7aba4, logMismatchVa: 0x00b1babc },
  { id: 6, builtinCount: 0x68, elemWidth: 1, fieldOffset: 0xe07, storeBound: 0x68, clampsFileCount: false, handlerVa: 0x00927401, logBeginVa: 0x00b7ad38, logEndVa: 0x00b7ad20, logMismatchVa: 0x00b1babc },
  { id: 7, builtinCount: 0x2e, elemWidth: 1, fieldOffset: 0xe6f, storeBound: 0x2e, clampsFileCount: false, handlerVa: 0x00927491, logBeginVa: 0x00b7ad04, logEndVa: 0x00b7ace0, logMismatchVa: 0x00b1bae4 },
  { id: 8, builtinCount: 0x1b, elemWidth: 4, fieldOffset: 0xea0, storeBound: 0x1b, clampsFileCount: false, handlerVa: 0x00927521, logBeginVa: 0x00b7acc4, logEndVa: 0x00b7aca4, logMismatchVa: 0x00b1bb0c },
  { id: 9, builtinCount: 0x2, elemWidth: 4, fieldOffset: 0xf0c, storeBound: 0x2, clampsFileCount: true, handlerVa: 0x009275bc, logBeginVa: 0x00b7ac8c, logEndVa: 0x00b7ac70, logMismatchVa: 0x00b1bb34 },
  { id: 10, builtinCount: 0x50, elemWidth: 1, fieldOffset: 0xf14, storeBound: 0x50, clampsFileCount: false, handlerVa: 0x00927656, logBeginVa: 0x00b7ae38, logEndVa: 0x00b7ae14, logMismatchVa: 0x00b1bb58 },
  { id: 11, builtinCount: 4, elemWidth: 0, fieldOffset: 0xf64, storeBound: 0, clampsFileCount: false, handlerVa: 0x009276e1, logBeginVa: 0x00b7adf8, logEndVa: 0x00b7add8, logMismatchVa: 0 },
];

/** The reader's own diagnostic labels, recorded as evidence only. */
export const PGD_READER_SECTION_LABELS = [
  "Achievements",
  "Counters",
  "Level Counters",
  "Collectibles",
  "Mini Bosses",
  "Bosses",
  "Challenge Counters",
  "Cutscene Counters",
  "GameSettings",
  "Special Seed Counters",
  "Bestiary Counters",
];

/** @returns {null|object} a copy of the reader descriptor for `id` */
export function pgdReaderSectionDesc(id) {
  const row = READER_SECTIONS.find((r) => r.id === asI32(id));
  return row ? { ...row } : null;
}

/** Jump-table slot the dispatch lands on, or -1. */
export function pgdReaderDispatchIndex(id) {
  if (!pgdReaderSectionDispatched(id)) return -1;
  return asI32(id) - 1;
}

export function pgdReaderHandlerVa(id) {
  const row = pgdReaderSectionDesc(id);
  return row ? row.handlerVa : 0;
}

/**
 * Section 9 alone re-clamps the count it read from the file, using the
 * constant 2 that the loop head parks in a register before every dispatch.
 * The comparison is unsigned-above, so only counts strictly greater than two
 * are pulled down; everything else, including zero, is left alone.
 */
export function pgdReaderSec9Clamp(fileCount) {
  const n = asU32(fileCount);
  return n > 2 ? 2 : asI32(n);
}

/** The register the loop head loads before dispatching, every iteration.
 *  It is parked at 0x009270b5, ahead of the id checks and the dispatch, so
 *  section 9's clamp always sees the same value. */
export function pgdReaderDispatchEdi() {
  return 2;
}

/** Byte position of element `i` for a section of this element width. */
export function pgdReaderElemByteCursor(elemIndex, width) {
  const w = asI32(width);
  if (w !== 1 && w !== 4) return -1;
  return asI32(Math.imul(asI32(elemIndex), w));
}

/**
 * How many elements the handler reads before one of its two exits fires: the
 * byte-cursor cap, or the file's declared count.
 *
 * The count is guarded once on the way in and once per iteration on the way
 * round, and BOTH of those look at the full 32-bit pattern rather than its
 * sign: the entry test only recognises an all-zero register, and the
 * loop-back is a below-comparison. So the only count that skips the body is
 * literally zero; 0x80000000 is an enormous bound, not an empty one. (v2 read
 * the entry test as a signed "is it positive" and returned nothing for every
 * count with the top bit set.)
 */
export function pgdReaderElementsConsumed(fileCount, capWord, width) {
  const w = asI32(width);
  if (w !== 1 && w !== 4) return 0;
  const n = asU32(fileCount);
  if (n === 0) return 0;
  const cap = asU32(capWord);
  if (cap === 0) return 0;
  // A one-byte cursor is compared before it is used, so it stops one short of
  // the wrap point and the cap is simply an element limit.
  if (w === 1) return Math.min(cap, n);
  // Four-byte cursors climb four at a time. Below a quarter of the address
  // space they are ordered, so the first index that fails is the cap rounded
  // up to a whole element. Past that point the cursor wraps back through the
  // low addresses, which are below any cap large enough to get there, so
  // nothing stops the walk before the declared count does.
  const firstFail = Math.floor((cap - 1) / 4) + 1;
  if (firstFail >= 0x40000000) return n;
  return Math.min(firstFail, n);
}

/** Of the consumed elements, the ones that survive the store clamp. */
export function pgdReaderElementsStored(fileCount, capWord, width, storeBound) {
  const consumed = pgdReaderElementsConsumed(fileCount, capWord, width);
  if (consumed === 0) return 0;
  return Math.min(asU32(storeBound), consumed);
}

/* ---------- PGDLOOP: the fixed-section loop, branch by branch (v3) -------- */

/**
 * Whether the body runs at all. The handler looks at the count register as a
 * whole and only steps over the loop when every bit is clear, so this is an
 * inequality against zero and nothing more.
 */
export function pgdReaderCountEntersLoop(fileCount) {
  return asU32(fileCount) !== 0 ? 1 : 0;
}

/** Round-again test, taken on the already-incremented index, unsigned. */
export function pgdReaderLoopBack(nextIndex, fileCount) {
  return asU32(nextIndex) < asU32(fileCount) ? 1 : 0;
}

/**
 * Whether the store passes the element through a normaliser. Byte sections
 * compare the freshly read byte against zero and keep the flag; dword
 * sections never look at what they read.
 * -1 for a width no handler uses.
 */
export function pgdReaderStoreNormalizes(width) {
  const w = asI32(width);
  if (w === 1) return 1;
  if (w === 4) return 0;
  return -1;
}

/**
 * What one element becomes in the array. The byte comparison is against a
 * signed char, so only 1..127 count as set; 128..255 are "not above zero" and
 * collapse to 0, which is the half of the round trip the writer does not
 * agree with. Dword sections hand the raw bits straight through.
 */
export function pgdReaderStoreValue(width, raw) {
  const w = asI32(width);
  const bits = asU32(raw);
  if (w === 1) {
    const signedByte = ((bits & 0xff) << 24) >> 24;
    return signedByte > 0 ? 1 : 0;
  }
  if (w === 4) return bits;
  return 0;
}

/**
 * Where in the object the element lands, or -1 when the clamp rejects it.
 * The rejection test looks at the running element count while the address is
 * formed from the running byte position; for four-byte sections those are two
 * different registers advancing at different rates.
 */
export function pgdReaderStoreOffset(fieldOffset, elemIndex, width, storeBound) {
  const w = asI32(width);
  if (w !== 1 && w !== 4) return -1;
  const idx = asU32(elemIndex);
  if (idx >= asU32(storeBound)) return -1;
  const cursor = asU32(Math.imul(idx, w));
  return asI32(asU32(asU32(fieldOffset) + cursor));
}

/* ---------- PGDN: section 11 has its own control flow (v3) ---------- */

/**
 * Whether the handler consults the header's cap word while it runs. Every
 * fixed section re-tests it before each element; the bestiary handler reads
 * the header once to decide it is non-empty and then never refers to it.
 */
export function pgdReaderSectionUsesCap(id) {
  const n = asI32(id);
  if (n < PGD_SECTION_MIN_ID || n > PGD_SECTION_MAX_ID) return 0;
  return n === PGD_BESTIARY_SECTION_ID ? 0 : 1;
}

/**
 * Which of the four maps is emptied at each step of the pre-loop reset.
 * The reset visits them in an order of its own; it is not the order the
 * writer emits the sub-blocks in, and the two must stay separate because
 * this one is the sequence of calls into the host erase primitive.
 */
const BESTIARY_CLEAR_ORDER = [3, 0, 2, 1];

export function pgdBestiaryClearSlot(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_BESTIARY_SUBMAPS) return -1;
  return BESTIARY_CLEAR_ORDER[s];
}

/** Outer sub-block loop-back — unsigned, like the fixed sections. */
export function pgdBestiaryOuterContinue(nextIndex, blockCount) {
  return asU32(nextIndex) < asU32(blockCount) ? 1 : 0;
}

/**
 * Pair loop-back. This one is a signed comparison, which is a genuine
 * difference from every fixed section rather than an accident: the pair count
 * came out of an unsigned shift and can never have its top bit set, so the PE
 * was free to use the signed form.
 */
export function pgdBestiaryPairLoopContinue(nextIndex, pairCount) {
  return asI32(nextIndex) < asI32(pairCount) ? 1 : 0;
}

/**
 * Whether a fresh node has to be built after the ordered probe. The probe
 * lands either on the past-the-end marker — a byte flag on the node — or on
 * the first node whose key is not less than the wanted one. Only a key that
 * sorts strictly before the landing node means the key is absent.
 */
export function pgdBestiaryInsertNeeded(nodeMarkerD, key, nodeKey) {
  if ((asU32(nodeMarkerD) & 0xff) !== 0) return 1;
  return asI32(key) < asI32(nodeKey) ? 1 : 0;
}

export const PGD_BESTIARY_NODE_MARKER_OFF = 0xd;
export const PGD_READER_TAIL_VA = 0x00927c8a;
export const PGD_READER_FAIL_VA = 0x00927ca0;
export const PGD_READER_PRE_SECTION_READ_VA = 0x00927091;

/** The reader's success tail reads the trailing dword into pgd+0xf88. */
export function pgdReaderTailReadsSaveCounter() {
  return 1;
}

/* ---------- PGDID: per-field identification status (v3) ---------- */

export const PGD_FIELD_UNKNOWN_OFFSET = 0;
export const PGD_FIELD_NAMED = 1;
export const PGD_FIELD_LAYOUT_ONLY = 2;

export const PGD_REPR_NONE = 0;
export const PGD_REPR_BOOL_BYTE = 1;
export const PGD_REPR_RAW_DWORD = 2;

/**
 * NAMED means an exact-signature accessor exists whose own body indexes that
 * array, so the array inherits the accessor's name. LAYOUT_ONLY means the
 * offset, width, count, bounds and store behaviour are all proved and the
 * purpose is not — the only naming evidence for those is diagnostic text.
 */
const FIELD_IDENTIFICATION = [
  [PGD_OFF_ACHIEVEMENTS, PGD_FIELD_NAMED, PGD_REPR_BOOL_BYTE],
  [PGD_OFF_EVENT_COUNTERS, PGD_FIELD_NAMED, PGD_REPR_RAW_DWORD],
  [PGD_OFF_ITEM_COLLECTION, PGD_FIELD_NAMED, PGD_REPR_BOOL_BYTE],
  [PGD_OFF_SEC3_DWORDS, PGD_FIELD_LAYOUT_ONLY, PGD_REPR_RAW_DWORD],
  [PGD_OFF_SEC5_BYTES, PGD_FIELD_LAYOUT_ONLY, PGD_REPR_BOOL_BYTE],
  [PGD_OFF_BOSSES, PGD_FIELD_NAMED, PGD_REPR_BOOL_BYTE],
  [PGD_OFF_CHALLENGES, PGD_FIELD_NAMED, PGD_REPR_BOOL_BYTE],
  [PGD_OFF_SEC8_DWORDS, PGD_FIELD_LAYOUT_ONLY, PGD_REPR_RAW_DWORD],
  [PGD_OFF_SEC9_DWORDS, PGD_FIELD_LAYOUT_ONLY, PGD_REPR_RAW_DWORD],
  [PGD_OFF_SEC10_BYTES, PGD_FIELD_LAYOUT_ONLY, PGD_REPR_BOOL_BYTE],
  [PGD_OFF_PRE_SECTION_WORD, PGD_FIELD_LAYOUT_ONLY, PGD_REPR_RAW_DWORD],
];

export function pgdFieldStatus(fieldOffset) {
  const row = FIELD_IDENTIFICATION.find((r) => r[0] === asI32(fieldOffset));
  return row ? row[1] : PGD_FIELD_UNKNOWN_OFFSET;
}

export function pgdFieldRepr(fieldOffset) {
  const row = FIELD_IDENTIFICATION.find((r) => r[0] === asI32(fieldOffset));
  return row ? row[2] : PGD_REPR_NONE;
}

/**
 * Census result, not a guess: across the whole code section the pre-section
 * word is touched by five instructions in four routines, and every one of
 * them is format plumbing — the reset, the read, the write and the two halves
 * of a field-by-field copy. No load of it reaches a comparison, an index or
 * any arithmetic. Exported so that "nothing consumes this" is a machine-
 * checkable claim rather than a remark someone can quietly drop.
 */
export const PGD_PRE_SECTION_WORD_SITES = 5;
export const PGD_PRE_SECTION_WORD_ACCESSORS = 0;
export const PGD_PRE_SECTION_WORD_SITE_VAS = [
  0x009262bc, 0x00927091, 0x009282ff, 0x009291fc, 0x00929202,
];

export function pgdPreSectionWordAccessorCount() {
  return PGD_PRE_SECTION_WORD_ACCESSORS;
}

/* ---------- PGDT: the second PGD transport at 0x0091adf0 (v3) ---------- */

export const PGD_ALT_TRANSPORT_FIELDS = 8;
export const PGD_ALT_TRANSPORT_VA = 0x0091adf0;
export const PGD_ALT_BITPACK_VA = 0x0091b650;
export const PGD_ALT_HOST_VA_ALLOC = 0x00a648b0;
export const PGD_ALT_HOST_VA_MEMSET = 0x00af05e5;

/**
 * A second route the same object travels, in the order that route uses. Every
 * row's byte figure is an immediate at its call site rather than something
 * derived here, which is what makes it an independent check on the widths:
 * the two dword arrays announce 0x38 and 0x6c bytes, and 0x38/4 and 0x6c/4
 * are exactly the element counts the save reader clamps to.
 */
const ALT_TRANSPORT = [
  { fieldOffset: PGD_OFF_ACHIEVEMENTS, elemCount: 0x282, elemWidth: 1, payloadBytes: 0x282, bitpacked: 1, callVa: 0x0091ae37 },
  { fieldOffset: PGD_OFF_EVENT_COUNTERS, elemCount: 0x20b, elemWidth: 4, payloadBytes: 0x82c, bitpacked: 0, callVa: 0x0091ae51 },
  { fieldOffset: PGD_OFF_ITEM_COLLECTION, elemCount: 0x2dd, elemWidth: 1, payloadBytes: 0x2dd, bitpacked: 1, callVa: 0x0091ae61 },
  { fieldOffset: PGD_OFF_SEC3_DWORDS, elemCount: 0xe, elemWidth: 4, payloadBytes: 0x38, bitpacked: 0, callVa: 0x0091ae78 },
  { fieldOffset: PGD_OFF_SEC5_BYTES, elemCount: 7, elemWidth: 1, payloadBytes: 7, bitpacked: 1, callVa: 0x0091ae85 },
  { fieldOffset: PGD_OFF_BOSSES, elemCount: 0x68, elemWidth: 1, payloadBytes: 0x68, bitpacked: 1, callVa: 0x0091ae95 },
  { fieldOffset: PGD_OFF_SEC8_DWORDS, elemCount: 0x1b, elemWidth: 4, payloadBytes: 0x6c, bitpacked: 0, callVa: 0x0091aeac },
  { fieldOffset: PGD_OFF_CHALLENGES, elemCount: 0x2e, elemWidth: 1, payloadBytes: 0x2e, bitpacked: 1, callVa: 0x0091aeb9 },
];

export function pgdAltTransportField(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_ALT_TRANSPORT_FIELDS) return null;
  return { ...ALT_TRANSPORT[s] };
}

/**
 * Whether this route carries a field at all. It walks the eight fixed arrays
 * plus the bestiary map and then seeks to the end, so the two arrays it never
 * mentions are genuinely outside it — an absence over the whole routine, not
 * an assumption.
 */
export function pgdAltTransportCovers(fieldOffset) {
  const off = asI32(fieldOffset);
  if (ALT_TRANSPORT.some((r) => r.fieldOffset === off)) return 1;
  return off === PGD_OFF_BESTIARY ? 1 : 0;
}

/* ---------- PGDBP: the bit-packed boolean codec (v3) ---------- */

/**
 * Size of the packed buffer. The routine divides the entry count by eight and
 * then adds one unconditionally, so there is always a spare byte and an empty
 * array still costs one — which is then read off the stream and ignored.
 */
export function pgdBitpackBytes(count) {
  return asI32((asU32(count) >>> 3) + 1);
}

/**
 * Value of one packed entry. A single-bit mask starts at the low bit and
 * rotates one place per entry, so entry i is bit (i mod 8) of byte
 * floor(i / 8) — low bit first. Extraction is a plain non-zero test.
 */
export function pgdBitpackBit(packed, count, index) {
  const n = asU32(count);
  const i = asU32(index);
  if (!packed || i >= n) return 0;
  return (packed[i >>> 3] & (1 << (i & 7))) !== 0 ? 1 : 0;
}

/** Every entry of the packed buffer, expanded to one byte each. */
export function pgdBitpackUnpack(packed, count) {
  const n = asU32(count);
  if (n === 0) return [];
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; ++i) out[i] = pgdBitpackBit(packed, n, i);
  return out;
}

/* ---------- PGDGATE: what pgd+0x02 gates (v3) ---------- */

export const PGD_NOTIFY_VA = 0x00929790;
export const PGD_NOTIFY_FORMAT_VA = 0x0041e420;
export const PGD_NOTIFY_BUFFER_BYTES = 8;
export const PGD_NOTIFY_ENABLE_GLOBAL_VA = 0x00c5ab08;
export const PGD_NOTIFY_ENABLE_MASK = 1;
export const PGD_NOTIFY_SINGLETON_VA = 0x00bf93c8;
export const PGD_NOTIFY_VTBL_OFF_A = 0x18;
export const PGD_NOTIFY_VTBL_OFF_B = 0x24;
export const PGD_CLEAR_VA = 0x009262b0;
export const PGD_CLEAR_FLAG_02_VALUE = 1;
export const PGD_FLAG_02_STORES_IN_CLUSTER = 1;
export const PGD_FLAG_02_LOADS_IN_CLUSTER = 3;

/**
 * First gate of 0x00929790. The byte at +0x02 stops the routine before it
 * does anything at all, including its own logging, so it is not merely a
 * dispatch switch.
 */
export function pgdNotifyLogs(flag02) {
  return (asU32(flag02) & 0xff) !== 0 ? 1 : 0;
}

/**
 * Second gate. A separate global is tested for its low bit only, as a byte,
 * so a value of two enables nothing while three does.
 */
export function pgdNotifyDispatches(flag02, enableGlobal) {
  if (!pgdNotifyLogs(flag02)) return 0;
  return (asU32(enableGlobal) & 0xff & PGD_NOTIFY_ENABLE_MASK) !== 0 ? 1 : 0;
}

/* ---------- PGDRMAP: the two restore index remaps (v4) ---------- */

export const PGD_SEC3_REMAP_VA = 0x009e4f80;
export const PGD_SEC3_REMAP_TABLE_VA = 0x009e4fcc;
export const PGD_SEC3_REMAP_DEFAULT_ARM_VA = 0x009e4fc9;
export const PGD_SEC3_REMAP_BOUND = 0xa;
export const PGD_SEC3_REMAP_ENTRIES = 11;
export const PGD_SEC3_REMAP_MAX_INPUT = 11;
export const PGD_SEC3_REMAP_MAX_SLOT = 11;

export const PGD_EVENT_REMAP_VA = 0x009e3ea0;
export const PGD_EVENT_REMAP_TABLE_VA = 0x009e40e8;
export const PGD_EVENT_REMAP_DEFAULT_ARM_VA = 0x009e40e5;
export const PGD_EVENT_REMAP_BOUND = 0x5d;
export const PGD_EVENT_REMAP_ENTRIES = 94;
export const PGD_EVENT_REMAP_MAX_INPUT = 94;
export const PGD_EVENT_REMAP_MAX_SLOT = 113;

/**
 * Not from the image. The native side keeps one guard entry past the end of
 * each transcribed table holding this value, so that an off-by-one in the
 * acceptance window produces an observable wrong answer rather than reading
 * past the table. Neither law can ever produce it, and the suite asserts so.
 */
export const PGD_REMAP_GUARD_VALUE = -1;

/**
 * Whether an argument reaches the table at all. The body decrements first and
 * then does an above-comparison, so the accepted window is 1 up to the entry
 * count inclusive, and zero falls out with the negatives because the
 * decrement takes it to the top of the range rather than below it.
 */
function remapInWindow(index, maxInput) {
  return asU32(asI32(index) - 1) <= asU32(maxInput - 1);
}

/**
 * 0x009e4f80, expressed as what it does to its input rather than as a copy of
 * the table: it passes almost everything through untouched, and there are
 * exactly two arguments it treats specially — one is pushed up by a place,
 * and one is routed to the same arm as an out-of-range argument.
 */
export const PGD_SEC3_REMAP_IRREGULAR = Object.freeze({ 9: 10, 10: 0 });

export function pgdSec3RestoreRemap(index) {
  const i = asI32(index);
  if (!remapInWindow(i, PGD_SEC3_REMAP_MAX_INPUT)) return 0;
  if (Object.prototype.hasOwnProperty.call(PGD_SEC3_REMAP_IRREGULAR, i)) {
    return PGD_SEC3_REMAP_IRREGULAR[i];
  }
  return i;
}

/**
 * 0x009e3ea0, expressed as its offset structure. The mapping never reorders
 * anything: it walks upward one step at a time and periodically jumps ahead,
 * leaving gaps in the destination. There is one gap of a single place early
 * on, and after that a gap of three places every eleven arguments.
 */
export function pgdEventRestoreRemap(index) {
  const i = asI32(index);
  if (!remapInWindow(i, PGD_EVENT_REMAP_MAX_INPUT)) return 0;
  if (i <= 3) return i;
  if (i <= 36) return i + 1;
  return i + 4 + 3 * Math.floor((i - 37) / 11);
}

/* ---------- PGDRLOOP: the two restore loops in 0x0092b346 (v4) ---------- */

export const PGD_BULK_RESTORE_VA = 0x0092b346;
export const PGD_SEC3_RESTORE_LOOP_VA = 0x0092b730;
export const PGD_SEC3_RESTORE_CALL_VA = 0x0092b739;
export const PGD_SEC3_RESTORE_STORE_VA = 0x0092b73f;
export const PGD_SEC3_RESTORE_ITERATIONS = 0xc;
export const PGD_EVENT_RESTORE_LOOP_VA = 0x0092b670;
export const PGD_EVENT_RESTORE_CALL_VA = 0x0092b679;
export const PGD_EVENT_RESTORE_STORE_VA = 0x0092b67f;
export const PGD_EVENT_RESTORE_ITERATIONS = 0x5f;

export const PGD_SEC3_REMAP_CALL_SITES = 1;
export const PGD_EVENT_REMAP_CALL_SITES = 1;
export const PGD_SEC3_RESTORE_SLOTS_UNWRITTEN = 3;
export const PGD_EVENT_RESTORE_SLOTS_UNWRITTEN_BELOW_MAX = 19;
export const PGD_SEC3_RESTORE_ALIASED_SLOTS = 1;
export const PGD_EVENT_RESTORE_ALIASED_SLOTS = 0;
export const PGD_SEC3_RESTORE_ALIASED_SLOT = 0;
export const PGD_SEC3_RESTORE_ALIAS_LOSER = 0;
export const PGD_SEC3_RESTORE_ALIAS_WINNER = 10;

/** Both loops compare their counter as a signed value. */
export function pgdSec3RestoreLoopContinue(nextIteration) {
  return asI32(nextIteration) < PGD_SEC3_RESTORE_ITERATIONS ? 1 : 0;
}

export function pgdEventRestoreLoopContinue(nextIteration) {
  return asI32(nextIteration) < PGD_EVENT_RESTORE_ITERATIONS ? 1 : 0;
}

function restoreSlot(remap, iterations, iteration) {
  const i = asI32(iteration);
  if (i < 0 || i >= iterations) return -1;
  return remap(i);
}

export function pgdSec3RestoreSlot(iteration) {
  return restoreSlot(pgdSec3RestoreRemap, PGD_SEC3_RESTORE_ITERATIONS, iteration);
}

export function pgdEventRestoreSlot(iteration) {
  return restoreSlot(pgdEventRestoreRemap, PGD_EVENT_RESTORE_ITERATIONS, iteration);
}

function restoreWriters(remap, iterations, slot) {
  const s = asI32(slot);
  let n = 0;
  for (let i = 0; i < iterations; ++i) if (remap(i) === s) n += 1;
  return n;
}

export function pgdSec3RestoreWriters(slot) {
  return restoreWriters(pgdSec3RestoreRemap, PGD_SEC3_RESTORE_ITERATIONS, slot);
}

export function pgdEventRestoreWriters(slot) {
  return restoreWriters(pgdEventRestoreRemap, PGD_EVENT_RESTORE_ITERATIONS, slot);
}

export function pgdSec3RestoreSlotWritten(slot) {
  return pgdSec3RestoreWriters(slot) > 0 ? 1 : 0;
}

export function pgdEventRestoreSlotWritten(slot) {
  return pgdEventRestoreWriters(slot) > 0 ? 1 : 0;
}

/**
 * Which iteration's value is still in the slot once the loop ends.
 * Nothing guards either store and the counter only ever goes up, so whichever
 * iteration reaches the slot last is the one that leaves its value there.
 * This is the shipped behaviour of the aliased slot, not a repair of it.
 */
function restoreWinner(remap, iterations, slot) {
  const s = asI32(slot);
  let winner = -1;
  for (let i = 0; i < iterations; ++i) if (remap(i) === s) winner = i;
  return winner;
}

export function pgdSec3RestoreWinningIteration(slot) {
  return restoreWinner(pgdSec3RestoreRemap, PGD_SEC3_RESTORE_ITERATIONS, slot);
}

export function pgdEventRestoreWinningIteration(slot) {
  return restoreWinner(pgdEventRestoreRemap, PGD_EVENT_RESTORE_ITERATIONS, slot);
}

/** Both stores scale the remapped slot by four, so both write dwords. */
export function pgdSec3RestoreStoreOffset(iteration) {
  const slot = pgdSec3RestoreSlot(iteration);
  return slot < 0 ? -1 : PGD_OFF_SEC3_DWORDS + slot * 4;
}

export function pgdEventRestoreStoreOffset(iteration) {
  const slot = pgdEventRestoreSlot(iteration);
  return slot < 0 ? -1 : PGD_OFF_EVENT_COUNTERS + slot * 4;
}

/* ---------- PGDM: section 11 sub-block decode ---------- */

export const PGD_BESTIARY_TAG_MIN = 1;
export const PGD_BESTIARY_TAG_MAX = 4;
export const PGD_BESTIARY_PAIR_BYTES = 8;
export const PGD_BESTIARY_MAP_MAX_SIZE = 0xaaaaaaa;
export const PGD_HOST_VA_MAP_FIND = 0x004288a0;
export const PGD_HOST_VA_MAP_INSERT = 0x00415bd0;
export const PGD_HOST_VA_MAP_ERASE_ALL = 0x0042c8e0;
export const PGD_BESTIARY_NODE_BYTES = 0x18;

const BESTIARY_TAG_HANDLERS = [0x00927b44, 0x009278f4, 0x00927a18, 0x009277ce];

/** Sub-tags are one-based; the four-entry table rejects everything else. */
export function pgdBestiarySlotFromTag(tag) {
  const biased = asU32(asI32(tag) - 1);
  return biased > 3 ? -1 : asI32(biased);
}

export function pgdBestiaryTagHandlerVa(tag) {
  const slot = pgdBestiarySlotFromTag(tag);
  return slot < 0 ? 0 : BESTIARY_TAG_HANDLERS[slot];
}

export function pgdBestiaryMapRootOff(slot) {
  const s = asI32(slot);
  if (s < 0 || s >= PGD_BESTIARY_SUBMAPS) return 0;
  return PGD_BESTIARY_OFF_ROOT[s];
}

export function pgdBestiaryMapCountOff(slot) {
  const s = asI32(slot);
  if (s < 0 || s >= PGD_BESTIARY_SUBMAPS) return 0;
  return PGD_BESTIARY_OFF_COUNT[s];
}

/**
 * The sub-block's size dword is tested as a signed quantity and then halved
 * twice as an unsigned one. Zero and negatives abandon the sub-block, so the
 * result is -1 there rather than a count. Each pair costs eight bytes while
 * this dword only accounts for four of them; the writer stores the same
 * halved figure, so the round trip is consistent and must stay that way.
 */
export function pgdBestiaryPairCountFromSize(sizeWord) {
  const size = asI32(sizeWord);
  if (size <= 0) return -1;
  return asI32(asU32(size) >>> 2);
}

export function pgdBestiaryPairPayloadBytes(pairCount) {
  return asI32(Math.imul(asI32(pairCount), PGD_BESTIARY_PAIR_BYTES));
}

export function pgdBestiarySizeWordFromPairs(pairCount) {
  return asI32(asU32(asI32(pairCount)) << 2);
}

/* ---------- PGDX: indexed mutators on the unnamed arrays ---------- */

export const PGD_SEC5_SLOTS = 7;
export const PGD_SEC5_ID_MAX = 0xf;
export const PGD_SEC5_REMAP_BASE = 7;
export const PGD_SEC5_REMAP_SPAN = 6;
export const PGD_SEC5_ALIAS_ID = 0xe;
export const PGD_SEC5_UNLOCK_ID = 0x16;
export const PGD_SEC5_HOST_VA_MUTATOR = 0x0092a520;
export const PGD_SEC5_LOG_ADD_VA = 0x00b7aeac;
export const PGD_SEC5_LOG_WARN_VA = 0x00b7aecc;

export const PGD_SEC10_SLOTS = 0x50;
export const PGD_SEC10_HOST_VA_MUTATOR = 0x0092b230;
export const PGD_SEC10_LOG_ADD_VA = 0x00b7ae58;

/**
 * The +0xe00 mutator accepts a 0..15 window (unsigned, so negatives are out)
 * and then folds it onto seven slots. Ids at or above the fold base map down
 * by that base; one id above the folded range is special-cased onto the last
 * slot; the value between them is dropped without a word; anything below the
 * fold base is used directly. -1 means nothing is stored.
 */
export function pgdSec5IndexRemap(id) {
  const v = asI32(id);
  if (asU32(v) > PGD_SEC5_ID_MAX) return -1;
  const folded = asU32(v - PGD_SEC5_REMAP_BASE);
  if (folded <= PGD_SEC5_REMAP_SPAN) return asI32(folded);
  if (v === PGD_SEC5_ALIAS_ID) return PGD_SEC5_REMAP_SPAN;
  if (v > PGD_SEC5_REMAP_SPAN) return -1;
  return v;
}

/** Only ids outside the accepted window produce the warning. */
export function pgdSec5OutOfRange(id) {
  return asU32(asI32(id)) > PGD_SEC5_ID_MAX;
}

export function pgdSec5StoreSlot(readonly, id) {
  if (asU8(readonly) !== 0) return -1;
  return pgdSec5IndexRemap(id);
}

/** The follow-up unlock fires only when every one of the seven slots is set. */
export function pgdSec5AllSet(slots, count) {
  const n = asI32(count);
  if (!slots || n < PGD_SEC5_SLOTS) return false;
  for (let i = 0; i < PGD_SEC5_SLOTS; ++i) {
    if (asU8(slots[i]) === 0) return false;
  }
  return true;
}

/**
 * The +0xf14 mutator does not check its index at all, and it clears the first
 * slot right after storing. Both are original behaviour: an arbitrary index
 * lands outside the array, and index zero has its own store undone.
 */
export function pgdSec10StoreSlot(readonly, id) {
  if (asU8(readonly) !== 0) return -1;
  return asI32(id);
}

export function pgdSec10ResetsSlot0() {
  return true;
}

export function pgdSec10StoreIsSelfCancelling(readonly, id) {
  if (pgdSec10StoreSlot(readonly, id) < 0) return false;
  return asI32(id) === 0;
}

/* ---------- PGDK: 41-bit two-word popcount gate ---------- */

export const PGD_MASK41_BITS = 0x29;
export const PGD_MASK41_UNLOCK_THRESHOLD = 5;
export const PGD_MASK41_UNLOCK_ID = 0x143;
export const PGD_MASK41_LO_COUNTER_INDEX = 188;
export const PGD_MASK41_HI_COUNTER_INDEX = 496;
export const PGD_MASK41_HOST_VA = 0x0092b270;

/**
 * Counts set bits over the first 41 positions of a value spread across two
 * words: positions below the word size come from the low word, the rest from
 * the high word at the same bit within its own word. High-word bits past the
 * 41st are never examined.
 */
export function pgdMask41Popcount(lo, hi) {
  const low = asU32(lo);
  const high = asU32(hi);
  let n = 0;
  for (let i = 0; i < PGD_MASK41_BITS; ++i) {
    const bit = asU32(1 << (i & 31));
    const hit = i < 32 ? (low & bit) !== 0 : (high & bit) !== 0;
    if (hit) n += 1;
  }
  return n;
}

export function pgdMask41UnlockNeeded(popcount) {
  return asI32(popcount) >= PGD_MASK41_UNLOCK_THRESHOLD;
}

/** The high-word bits the count can reach at all. */
export function pgdMask41HiMask() {
  let mask = 0;
  for (let i = 32; i < PGD_MASK41_BITS; ++i) mask |= 1 << (i & 31);
  return asU32(mask);
}

/* ---------- save plan ---------- */

/**
 * @param {object} opts
 * @param {number} opts.saveCounterIn value of pgd+0xf88 before the write
 * @param {number[]} [opts.bestiaryCounts] the four map sizes, slot order
 */
export function pgdSavePlan({ saveCounterIn = 0, bestiaryCounts = [0, 0, 0, 0] } = {}) {
  const c = [0, 1, 2, 3].map((i) => asU32(bestiaryCounts[i] ?? 0));
  const total = pgdBestiaryTotal(c[0], c[1], c[2], c[3]);
  return {
    magicVariant: PGD_MAGIC_VARIANTS - 1,
    versionTag: PGD_VERSION_09,
    maxSectionId: PGD_MAX_SECTION_ID_V09,
    magicBytes: PGD_MAGIC_BYTES,
    fixedPrefixBytes: pgdFixedPrefixBytes(),
    checksumSkipFront: PGD_CHECKSUM_SKIP_FRONT,
    checksumSkipBack: PGD_CHECKSUM_SKIP_BACK,
    checksumMode: PGD_CHECKSUM_MODE_CRC,
    checksumSeed: asU32(PGD_CHECKSUM_SEED),
    saveCounterNext: asU32(asU32(saveCounterIn) + 1),
    bestiaryTotal: total,
    bestiaryCapWord: pgdBestiaryCapWord(total),
    hostWriteNeeded: true,
  };
}

/* ---------- PGDCOV: TryImportRebirthLocalSave restore coverage ---------- */

/* 0x0092b2e0 = PersistentGameData::TryImportRebirthLocalSave (exact ZHL,
   PersistentGameData.zhl, 43 pattern bytes). The v4 remap loops sit at
   0x0092b670 (event) and 0x0092b730 (sec3) inside it. The copy rows below
   are transcribed from the disassembly of the import body
   (section-notes/pgd-v6/disasm-92b2e0-import-full.txt), NOT from the C++:
   each row is the (source byte offset in the 0x4f0-byte snapshot at
   [ebp-0x4f0], destination byte offset in the PGD object, length, VA) of
   one contiguous raw move. The two remap rows carry their loop bound and
   delegate the slot law to the v4 remap functions. */

export const PGD_IMPORT_VA = 0x0092b2e0;
export const PGD_IMPORT_SNAPSHOT_BYTES = 0x4f0;
export const PGD_IMPORT_CLEAR_CALL_VA = 0x0092b5ca;
export const PGD_IMPORT_CLEAR_TARGET_VA = 0x009262b0;
export const PGD_IMPORT_CALLER_VA = 0x00926bd5;
export const PGD_IMPORT_LAST_ARRAY_STORE_VA = 0x0092b73f; /* sec3 remap-loop store; law-fixed at v7 (v6 pinned 0x92b724,
                                            but the +0xdc8 loop writes rows past it) */

export const PGD_IMPORT_KIND_BLOCK = 1;
export const PGD_IMPORT_KIND_REMAP_EVENT = 2;
export const PGD_IMPORT_KIND_REMAP_SEC3 = 3;

/* 23 block rows + the event and sec3 remap rows = 25. */
export const PGD_IMPORT_COPY_BLOCK_ROWS = 23;
export const PGD_IMPORT_COPY_ROWS = 25;

/* Row order = PE execution order. The achievements row is 179 bytes:
   `rep movsd` with ecx=0x2c (176) + ONE `movsw` (2, bytes 66 a5 at
   0x0092b5f7 — no rep prefix) + ONE `movsb` (1, byte a4). The collection
   row is 347 bytes: `rep movsd` with ecx=0x56 (344) + movsw + movsb; the
   ecx=0x56 is loaded at 0x0092b5f2, before the achievements tail. */
export const PGD_IMPORT_COPY_ROWS_TABLE = [
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x38, dst: PGD_OFF_ACHIEVEMENTS,
    len: 0xb3, va: 0x0092b5ed },        /* achievements */
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3fb, dst: PGD_OFF_BOSSES,
    len: 0x10, va: 0x0092b5fa },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x40b, dst: PGD_OFF_BOSSES + 0x10,
    len: 0x10, va: 0x0092b614 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x41b, dst: PGD_OFF_BOSSES + 0x20,
    len: 0x10, va: 0x0092b622 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x42b, dst: PGD_OFF_BOSSES + 0x30,
    len: 0x8, va: 0x0092b631 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x433, dst: PGD_OFF_BOSSES + 0x38,
    len: 1, va: 0x0092b640 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x434, dst: PGD_OFF_CHALLENGES,
    len: 0x10, va: 0x0092b64c },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x444, dst: PGD_OFF_CHALLENGES + 0x10,
    len: 4, va: 0x0092b653 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x448, dst: PGD_OFF_CHALLENGES + 0x14,
    len: 1, va: 0x0092b65f },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x268, dst: PGD_OFF_ITEM_COLLECTION,
    len: 0x15b, va: 0x0092b665 },       /* collection */
  { kind: PGD_IMPORT_KIND_REMAP_EVENT, src: 0xec, dst: PGD_OFF_EVENT_COUNTERS,
    len: 0x17c, va: 0x0092b670, iterations: PGD_EVENT_RESTORE_ITERATIONS },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x44c, dst: PGD_OFF_SEC8_DWORDS,
    len: 0x10, va: 0x0092b69a },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x45c, dst: PGD_OFF_SEC8_DWORDS + 0x10,
    len: 0x10, va: 0x0092b6a8 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x46c, dst: PGD_OFF_SEC8_DWORDS + 0x20,
    len: 0x10, va: 0x0092b6b6 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x47c, dst: PGD_OFF_SEC8_DWORDS + 0x30,
    len: 0x10, va: 0x0092b6c1 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x48c, dst: PGD_OFF_SEC8_DWORDS + 0x40,
    len: 0x10, va: 0x0092b6cc },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f4, dst: PGD_OFF_SEC5_BYTES,
    len: 1, va: 0x0092b6d3 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f5, dst: PGD_OFF_SEC5_BYTES + 1,
    len: 1, va: 0x0092b6df },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f6, dst: PGD_OFF_SEC5_BYTES + 2,
    len: 1, va: 0x0092b6eb },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f7, dst: PGD_OFF_SEC5_BYTES + 3,
    len: 1, va: 0x0092b6f7 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f8, dst: PGD_OFF_SEC5_BYTES + 4,
    len: 1, va: 0x0092b703 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f9, dst: PGD_OFF_SEC5_BYTES + 5,
    len: 1, va: 0x0092b70f },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3fa, dst: PGD_OFF_SEC5_BYTES + 6,
    len: 1, va: 0x0092b71b },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x49c, dst: PGD_OFF_SEC9_DWORDS,
    len: 4, va: 0x0092b724 },           /* sec9 dword 0 */
  { kind: PGD_IMPORT_KIND_REMAP_SEC3, src: 0x3c4, dst: PGD_OFF_SEC3_DWORDS,
    len: 0x30, va: 0x0092b730, iterations: PGD_SEC3_RESTORE_ITERATIONS },
];  /* loop store at 0x0092b73f — LAST array store (v7 law-fix) */

export const PGD_IMPORT_WRITTEN_ACHIEVEMENTS = 0xb3;
export const PGD_IMPORT_WRITTEN_EVENT = 0x17c;
export const PGD_IMPORT_WRITTEN_COLLECTION = 0x15b;
export const PGD_IMPORT_WRITTEN_SEC3 = 0x30;
export const PGD_IMPORT_WRITTEN_SEC5 = 7;
export const PGD_IMPORT_WRITTEN_BOSSES = 0x39;
export const PGD_IMPORT_WRITTEN_CHALLENGES = 0x15;
export const PGD_IMPORT_WRITTEN_SEC8 = 0x50;
export const PGD_IMPORT_WRITTEN_SEC9 = 4;
export const PGD_IMPORT_WRITTEN_SEC10 = 0;
export const PGD_IMPORT_WRITTEN_BESTIARY = 0;
export const PGD_IMPORT_WRITTEN_PRE_SECTION_WORD = 0;
export const PGD_IMPORT_WRITTEN_SAVE_COUNTER = 0;
export const PGD_IMPORT_WRITTEN_FILE_LOADED_OK = 0;

/** Array extent (bytes) of each layout array, for the stale counts. */
const IMPORT_ARRAY_TOTAL_BYTES = {
  [PGD_OFF_ACHIEVEMENTS]: PGD_COUNT_ACHIEVEMENTS,
  [PGD_OFF_EVENT_COUNTERS]: PGD_COUNT_EVENT_COUNTERS * 4,
  [PGD_OFF_ITEM_COLLECTION]: PGD_COUNT_ITEM_COLLECTION,
  [PGD_OFF_SEC3_DWORDS]: PGD_COUNT_SEC3 * 4,
  [PGD_OFF_SEC5_BYTES]: PGD_COUNT_SEC5,
  [PGD_OFF_BOSSES]: PGD_COUNT_BOSSES,
  [PGD_OFF_CHALLENGES]: PGD_COUNT_CHALLENGES,
  [PGD_OFF_SEC8_DWORDS]: PGD_COUNT_SEC8 * 4,
  [PGD_OFF_SEC9_DWORDS]: PGD_COUNT_SEC9 * 4,
  [PGD_OFF_SEC10_BYTES]: PGD_COUNT_SEC10,
  [PGD_OFF_BESTIARY]: PGD_OFF_PRE_SECTION_WORD - PGD_OFF_BESTIARY,
};

/** Written byte count per layout array, keyed by field offset. */
const IMPORT_WRITTEN_BYTES = {
  [PGD_OFF_ACHIEVEMENTS]: PGD_IMPORT_WRITTEN_ACHIEVEMENTS,
  [PGD_OFF_EVENT_COUNTERS]: PGD_IMPORT_WRITTEN_EVENT,
  [PGD_OFF_ITEM_COLLECTION]: PGD_IMPORT_WRITTEN_COLLECTION,
  [PGD_OFF_SEC3_DWORDS]: PGD_IMPORT_WRITTEN_SEC3,
  [PGD_OFF_SEC5_BYTES]: PGD_IMPORT_WRITTEN_SEC5,
  [PGD_OFF_BOSSES]: PGD_IMPORT_WRITTEN_BOSSES,
  [PGD_OFF_CHALLENGES]: PGD_IMPORT_WRITTEN_CHALLENGES,
  [PGD_OFF_SEC8_DWORDS]: PGD_IMPORT_WRITTEN_SEC8,
  [PGD_OFF_SEC9_DWORDS]: PGD_IMPORT_WRITTEN_SEC9,
  [PGD_OFF_SEC10_BYTES]: PGD_IMPORT_WRITTEN_SEC10,
  [PGD_OFF_BESTIARY]: PGD_IMPORT_WRITTEN_BESTIARY,
};

/** Element width of each array (1 byte or 4 bytes per element). */
const IMPORT_ARRAY_WIDTH = {
  [PGD_OFF_ACHIEVEMENTS]: 1,
  [PGD_OFF_EVENT_COUNTERS]: 4,
  [PGD_OFF_ITEM_COLLECTION]: 1,
  [PGD_OFF_SEC3_DWORDS]: 4,
  [PGD_OFF_SEC5_BYTES]: 1,
  [PGD_OFF_BOSSES]: 1,
  [PGD_OFF_CHALLENGES]: 1,
  [PGD_OFF_SEC8_DWORDS]: 4,
  [PGD_OFF_SEC9_DWORDS]: 4,
  [PGD_OFF_SEC10_BYTES]: 1,
  [PGD_OFF_BESTIARY]: 1,
};

export function pgdImportCopyCount() {
  return PGD_IMPORT_COPY_ROWS;
}

/** Row `step` (0..24) or null. */
export function pgdImportCopyRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_IMPORT_COPY_ROWS) return null;
  return PGD_IMPORT_COPY_ROWS_TABLE[s];
}

export function pgdImportFieldWritten(fieldOffset) {
  return (IMPORT_WRITTEN_BYTES[asI32(fieldOffset)] ?? 0) > 0 ? 1 : 0;
}

export function pgdImportWrittenByteCount(fieldOffset) {
  return IMPORT_WRITTEN_BYTES[asI32(fieldOffset)] ?? 0;
}

export function pgdImportElementWritten(fieldOffset, elemIndex) {
  const off = asI32(fieldOffset);
  const i = asI32(elemIndex);
  if (!(off in IMPORT_WRITTEN_BYTES)) return -1;
  if (off === PGD_OFF_EVENT_COUNTERS) return pgdEventRestoreSlotWritten(i);
  if (off === PGD_OFF_SEC3_DWORDS) return pgdSec3RestoreSlotWritten(i);
  const written = IMPORT_WRITTEN_BYTES[off];
  if (written <= 0) return 0;
  return asU32(i) < asU32(written / IMPORT_ARRAY_WIDTH[off]) ? 1 : 0;
}

export function pgdImportStaleByteCount(fieldOffset) {
  const off = asI32(fieldOffset);
  if (!(off in IMPORT_ARRAY_TOTAL_BYTES)) return -1;
  return IMPORT_ARRAY_TOTAL_BYTES[off] - IMPORT_WRITTEN_BYTES[off];
}

export function pgdImportUsesRemap(fieldOffset) {
  const off = asI32(fieldOffset);
  if (off === PGD_OFF_EVENT_COUNTERS || off === PGD_OFF_SEC3_DWORDS) return 1;
  if (off in IMPORT_WRITTEN_BYTES) return 0;
  return -1;
}

export function pgdImportNormalizes(fieldOffset) {
  const off = asI32(fieldOffset);
  return off in IMPORT_WRITTEN_BYTES ? 0 : -1;
}

export function pgdImportTailHasArrayStores() {
  return 0;
}

export function pgdImportSnapshotBytes() {
  return asU32(PGD_IMPORT_SNAPSHOT_BYTES);
}


/* ==========================================================================
   ABI v7 — PGDEX: the sibling import 0x0092b930 restore coverage.
   The header's v6 census named 0x0092b930 as "a DIFFERENT import (its own
   event remap 0x41ddb0 with 0xa2 iterations, no sec3 remap loop)". v7
   translates that coverage law: the 31 copy rows in PE execution order
   (30 raw block copies + the event remap loop) and the event remap's
   index law.

   Snapshot: stack buffer [ebp-0x700], 0x700 bytes (`sub esp,0x6f8` +
   `lea -0x700(%ebp),%ecx` into the shared reader 0x009e4260; read
   failure -> return 0). On success the same Clear (0x009262b0) runs, the
   rows copy into a 0x4f0-slot-identical object, and the tail re-saves
   through the same SaveToSteamCloud / pgd_save_local hosts; the success
   flag is `byte [ebp-0x701]` (0 at 0x0092ba0a via `testb al,al / jne`,
   1 at 0x0092bc5f). Both callers (0x0092be43, 0x0092c497) store the
   return value into pgd+0xf8c.

   Event remap 0x0041ddb0 (whole function verified from the disassembly):
   `dec ecx; cmp ecx,0xa0; ja 0x0041e18a; jmp *0x0041e190(,ecx,4)` — a
   161-entry jump table of arms that load the slot number (min arm 0x1,
   max arm `mov $0xab` at 0x0041e184), and the xor default arm is
   0x0041e18a. The law is order-preserving: input i (1..0xa1) returns the
   i-th non-hole integer of [1..0xab]; the ten holes are {0x4, 0x28, 0x36,
   0x44, 0x52, 0x60, 0x6e, 0x81, 0x8f, 0x9d}. Input 0 and inputs past
   0xa1 return 0. The sibling's driver loop at 0x0092bae8 runs edx
   0..0xa1 (0xa2 iterations) storing source dword [0x150 + edx*4] at
   slot remap(edx) of the +0x2bc array: slot 0 holds iteration 0's value
   (remap(0) = 0 through the default arm) and the 10 holes stay stale.

   Rows: achievements 0x115 (rep movsd 0x45 + ONE movsb), collection 0x1bb
   (rep movsd 0x6e + movsw + movsb), bosses 0x43 (4 movups + 1 movw +
   1 movb), challenges 0x1f (movups/movq/movl/movw/movb), sec8 0x58
   (5 movups + 1 movq), sec5 7 single-byte moves, sec9 dword 0 only,
   sec3 3 movups. Whole-body census (never written): +0xf14 sec10, the
   +0xf64 bestiary maps, +0xf84, +0xf88, +0xf9c file-loaded-ok byte is
   only SET by the CALLERS, never inside 0x0092b930. Last array store =
   the sec3 third movups store at 0x0092bbe0; past 0x0092bbe7 the tail
   only writes the pgd+0 changesmade byte, the game global +0x2a378 and
   the cleared pgd+0/steam-path call. tail_has_array_stores = 0.
 */

export const PGD_SIBLING_VA = 0x0092b930;
export const PGD_SIBLING_READER_VA = 0x0041d670; /* v8 census: the sibling's OWN
   reader; 0x009e4260 (one call site 0x92b574) belongs to the v6 import. */
export const PGD_IMPORT_READER_VA = 0x009e4260;
export const PGD_SIBLING_SNAPSHOT_BYTES = 0x700;
export const PGD_SIBLING_CLEAR_CALL_VA = 0x0092ba19;
export const PGD_SIBLING_CLEAR_TARGET_VA = 0x009262b0;
export const PGD_SIBLING_CALLER_VAS = [0x0092be43, 0x0092c497];
export const PGD_SIBLING_EVENT_REMAP_VA = 0x0041ddb0;
export const PGD_SIBLING_EVENT_REMAP_TABLE_VA = 0x0041e190;
export const PGD_SIBLING_EVENT_REMAP_DEFAULT_ARM_VA = 0x0041e18a;
export const PGD_SIBLING_EVENT_REMAP_BOUND = 0xa0;
export const PGD_SIBLING_EVENT_REMAP_ENTRIES = 0xa1;
export const PGD_SIBLING_EVENT_REMAP_MAX_INPUT = 0xa1;
export const PGD_SIBLING_EVENT_REMAP_MAX_SLOT = 0xab;
export const PGD_SIBLING_EVENT_RESTORE_ITERATIONS = 0xa2;
export const PGD_SIBLING_EVENT_REMAP_HOLES = [
  0x4, 0x28, 0x36, 0x44, 0x52, 0x60, 0x6e, 0x81, 0x8f, 0x9d,
];
export const PGD_SIBLING_LAST_ARRAY_STORE_VA = 0x0092bbe0;
export const PGD_SIBLING_KIND_BLOCK = 1;
export const PGD_SIBLING_KIND_REMAP_EVENT = 2;
export const PGD_SIBLING_COPY_BLOCK_ROWS = 30;
export const PGD_SIBLING_COPY_ROWS = 31; /* 30 blocks + 1 remap loop */

/* i-th non-hole slot (0-based: slots[0] = 0 via the default arm). */
const PGD_SIBLING_EVENT_REMAP_SLOTS = (() => {
  const holes = new Set(PGD_SIBLING_EVENT_REMAP_HOLES);
  const slots = [0];
  for (let v = 1; v <= PGD_SIBLING_EVENT_REMAP_MAX_SLOT; ++v) {
    if (!holes.has(v)) slots.push(v);
  }
  return slots;
})();

/* The 31 rows, transcribed from section-notes/pgd-v7/disasm-92b930-full.txt
   and disasm-41ddb0-event-remap.txt. Sources are ebp displacements with
   base ebp-0x700; dests are store displacements; VAs are the store (or
   loop-head for the remap row). */
export const PGD_SIBLING_COPY_ROWS_TABLE = [
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x038, dst: 0x038, len: 0x115, va: 0x0092ba40 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5cb, dst: 0xe07, len: 0x010, va: 0x0092ba48 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5db, dst: 0xe17, len: 0x010, va: 0x0092ba62 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5eb, dst: 0xe27, len: 0x010, va: 0x0092ba70 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5fb, dst: 0xe37, len: 0x010, va: 0x0092ba7e },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x60b, dst: 0xe47, len: 0x002, va: 0x0092ba85 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x60d, dst: 0xe49, len: 0x001, va: 0x0092ba99 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x60e, dst: 0xe6f, len: 0x010, va: 0x0092baa5 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x61e, dst: 0xe7f, len: 0x008, va: 0x0092bab4 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x626, dst: 0xe87, len: 0x004, va: 0x0092babc },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x62a, dst: 0xe8b, len: 0x002, va: 0x0092bac9 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x62c, dst: 0xe8d, len: 0x001, va: 0x0092bad6 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x3d8, dst: 0xae8, len: 0x1ba, va: 0x0092bade }, /* v9 law-fix: 0x1ba */
  { kind: PGD_SIBLING_KIND_REMAP_EVENT, src: 0x150, dst: 0x2bc, len: 0x288,
    va: 0x0092bae8, iterations: PGD_SIBLING_EVENT_RESTORE_ITERATIONS },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x630, dst: 0xea0, len: 0x010, va: 0x0092bb15 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x640, dst: 0xeb0, len: 0x010, va: 0x0092bb23 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x650, dst: 0xec0, len: 0x010, va: 0x0092bb31 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x660, dst: 0xed0, len: 0x010, va: 0x0092bb3f },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x670, dst: 0xee0, len: 0x010, va: 0x0092bb4d },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x680, dst: 0xef0, len: 0x008, va: 0x0092bb59 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c4, dst: 0xe00, len: 0x001, va: 0x0092bb68 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c5, dst: 0xe01, len: 0x001, va: 0x0092bb74 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c6, dst: 0xe02, len: 0x001, va: 0x0092bb80 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c7, dst: 0xe03, len: 0x001, va: 0x0092bb8c },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c8, dst: 0xe04, len: 0x001, va: 0x0092bb98 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c9, dst: 0xe05, len: 0x001, va: 0x0092bba4 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5ca, dst: 0xe06, len: 0x001, va: 0x0092bbb0 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x688, dst: 0xf0c, len: 0x004, va: 0x0092bbb9 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x594, dst: 0xdc8, len: 0x010, va: 0x0092bbc4 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5a4, dst: 0xdd8, len: 0x010, va: 0x0092bbd2 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5b4, dst: 0xde8, len: 0x010, va: 0x0092bbe0 },
];

export const PGD_SIBLING_WRITTEN_ACHIEVEMENTS = 0x115;
export const PGD_SIBLING_WRITTEN_EVENT = 0x288;   /* 0xa2 dwords */
export const PGD_SIBLING_WRITTEN_COLLECTION = 0x1ba;
/* LAW-FIXED AT v9: 0x1ba (0x6e dw + 1 w). The sibling's collection copy is
   `rep movsd` ecx=0x6e @ 0x92bade + `movsw` @ 0x92bae0 with NO trailing
   movsb (the v6 import's 0x15b has one, at 0x92b669). v7 recorded 0x1bb.
   Three-way proof: ctor memset 0x1ba (0x41d588) == restore copy == reader
   clamp 0x1ba (0x41d9dc). */
export const PGD_SIBLING_WRITTEN_SEC3 = 0x30;
export const PGD_SIBLING_WRITTEN_SEC5 = 7;
export const PGD_SIBLING_WRITTEN_BOSSES = 0x43;
export const PGD_SIBLING_WRITTEN_CHALLENGES = 0x1f;
export const PGD_SIBLING_WRITTEN_SEC8 = 0x58;
export const PGD_SIBLING_WRITTEN_SEC9 = 4;
export const PGD_SIBLING_WRITTEN_SEC10 = 0;
export const PGD_SIBLING_WRITTEN_BESTIARY = 0;
export const PGD_SIBLING_WRITTEN_PRE_SECTION_WORD = 0;
export const PGD_SIBLING_WRITTEN_SAVE_COUNTER = 0;
export const PGD_SIBLING_WRITTEN_FILE_LOADED_OK = 0;

const SIBLING_WRITTEN_BYTES = {
  [PGD_OFF_ACHIEVEMENTS]: PGD_SIBLING_WRITTEN_ACHIEVEMENTS,
  [PGD_OFF_EVENT_COUNTERS]: PGD_SIBLING_WRITTEN_EVENT,
  [PGD_OFF_ITEM_COLLECTION]: PGD_SIBLING_WRITTEN_COLLECTION,
  [PGD_OFF_SEC3_DWORDS]: PGD_SIBLING_WRITTEN_SEC3,
  [PGD_OFF_SEC5_BYTES]: PGD_SIBLING_WRITTEN_SEC5,
  [PGD_OFF_BOSSES]: PGD_SIBLING_WRITTEN_BOSSES,
  [PGD_OFF_CHALLENGES]: PGD_SIBLING_WRITTEN_CHALLENGES,
  [PGD_OFF_SEC8_DWORDS]: PGD_SIBLING_WRITTEN_SEC8,
  [PGD_OFF_SEC9_DWORDS]: PGD_SIBLING_WRITTEN_SEC9,
  [PGD_OFF_SEC10_BYTES]: PGD_SIBLING_WRITTEN_SEC10,
  [PGD_OFF_BESTIARY]: PGD_SIBLING_WRITTEN_BESTIARY,
};

/* Event remap slots that the sibling's driver loop writes: slot 0 (input 0
   via the default arm) + remap(1..0xa1) = all of [0..0xab] minus the ten
   holes. */
export function pgdSiblingEventRemap(index) {
  const i = asI32(index);
  if (i < 0 || i > PGD_SIBLING_EVENT_REMAP_MAX_INPUT) return 0;
  return PGD_SIBLING_EVENT_REMAP_SLOTS[i];
}

export function pgdSiblingCopyCount() {
  return PGD_SIBLING_COPY_ROWS;
}

export function pgdSiblingCopyRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_SIBLING_COPY_ROWS) return null;
  return PGD_SIBLING_COPY_ROWS_TABLE[s];
}

export function pgdSiblingFieldWritten(fieldOffset) {
  return (SIBLING_WRITTEN_BYTES[asI32(fieldOffset)] ?? 0) > 0 ? 1 : 0;
}

export function pgdSiblingWrittenByteCount(fieldOffset) {
  return SIBLING_WRITTEN_BYTES[asI32(fieldOffset)] ?? 0;
}

export function pgdSiblingElementWritten(fieldOffset, elemIndex) {
  const off = asI32(fieldOffset);
  const i = asI32(elemIndex);
  if (!(off in SIBLING_WRITTEN_BYTES)) return -1;
  if (off === PGD_OFF_EVENT_COUNTERS) {
    if (i < 0 || i > PGD_SIBLING_EVENT_REMAP_MAX_SLOT) return 0;
    return PGD_SIBLING_EVENT_REMAP_HOLES.includes(i) ? 0 : 1;
  }
  const written = SIBLING_WRITTEN_BYTES[off];
  if (written <= 0) return 0;
  return asU32(i) < asU32(written / IMPORT_ARRAY_WIDTH[off]) ? 1 : 0;
}

export function pgdSiblingStaleByteCount(fieldOffset) {
  const off = asI32(fieldOffset);
  if (!(off in IMPORT_ARRAY_TOTAL_BYTES)) return -1;
  return IMPORT_ARRAY_TOTAL_BYTES[off] - SIBLING_WRITTEN_BYTES[off];
}

export function pgdSiblingUsesRemap(fieldOffset) {
  const off = asI32(fieldOffset);
  if (off === PGD_OFF_EVENT_COUNTERS) return 1;
  if (off in SIBLING_WRITTEN_BYTES) return 0;
  return -1;
}

export function pgdSiblingNormalizes(fieldOffset) {
  const off = asI32(fieldOffset);
  return off in SIBLING_WRITTEN_BYTES ? 0 : -1;
}

export function pgdSiblingTailHasArrayStores() {
  return 0;
}

export function pgdSiblingSnapshotBytes() {
  return asU32(PGD_SIBLING_SNAPSHOT_BYTES);
}

/* ==================== Helpers ABI v8 ====================

   PGDCLR — the COMPLETE PersistentGameData::Clear (0x009262b0, exact ZHL)
   body law: 11 unconditional zero rows in PE execution order, the
   arg-gated +0xf88 row (LOW-byte gate: `cmp byte [ebp+8],0; je`), the
   four std::map erase-all rows in slot order 3,0,2,1 with the
   header-self-link + size-0 post-condition, the three tail flag stores,
   the +0xe9d gap that is never zeroed, per-field status, end-to-end
   byte-zeroed and total-zeroed predicates, and the 11-callsite census.
   Cross-law: the map order equals the reader's v3 slot order and differs
   from the writer's emit order.

   PGDTAIL — the shared tail re-save lane of BOTH importers (v6 tail
   0x0092b74b..0x0092b7e4, sibling tail 0x0092bbe7..0x0092bc5f): a
   10-step plan (changesmade=1; game+0x2a378 guard save/zero; host
   0x9296c0; IncreaseEventCounter(0,0); guard restore; two low-byte
   gates; changesmade=0; host 0x9292c0; probe+selector; SaveToSteamCloud
   or pgd_save_local). Return law: 1 on success AND gate-skip, 0 only on
   read failure. Plus the reader-identity correction below. */

/* ---------- PGDCLR: Clear 0x009262b0 ---------- */

export const PGDCLR_VA = 0x009262b0;
export const PGDCLR_RET_VA = 0x0092645d;
export const PGDCLR_MEMSET_VA = 0x00af05e5;
export const PGDCLR_MAP_ERASE_VA = 0x0042c8e0;
export const PGDCLR_ZERO_ROWS = 11;
export const PGDCLR_COND_OFF = 0xf88;
export const PGDCLR_COND_LEN = 4;
export const PGDCLR_COND_VA = 0x009262c8;
export const PGDCLR_GATE_VA = 0x009262c6;
export const PGDCLR_MAP_ROWS = 4;
export const PGDCLR_TAIL_STORES = 3;
export const PGDCLR_GAP_OFF = 0xe9d;
export const PGDCLR_GAP_LEN = 3;
export const PGDCLR_CALL_SITES = 11;
export const PGDCLR_CALL_SITE_VAS = [
  0x00925ffc, 0x0092646a, 0x0092682f, 0x00926ad1, 0x00926c0a,
  0x00926e0b, 0x00926e7f, 0x0092b5ca, 0x0092ba19, 0x00959e8d,
  0x009d9e01,
];

export const PGDCLR_STATUS_UNTOUCHED = 0;
export const PGDCLR_STATUS_ZEROED = 1;
export const PGDCLR_STATUS_ZEROED_IF_ARG = 2;
export const PGDCLR_STATUS_SET_ONE = 3;
export const PGDCLR_STATUS_STRUCT_RESET = 4;

/* The 11 unconditional rows: {offset, length, va}. Rows 4/5/8/9 are the
   exact store sets from the instruction stream (movups/movq/dword/word/
   byte), not one memset; row 3 is the rep stosd span (0x20b dwords). */
export const PGDCLR_ZERO_ROWS_TABLE = [
  { offset: PGD_OFF_PRE_SECTION_WORD, length: 4, va: 0x009262bc },
  { offset: PGD_OFF_ACHIEVEMENTS, length: 0x282, va: 0x009262dd },
  { offset: PGD_OFF_ITEM_COLLECTION, length: 0x2dd, va: 0x009262f0 },
  { offset: PGD_OFF_EVENT_COUNTERS, length: 0x82c, va: 0x00926305 },
  { offset: PGD_OFF_SEC3_DWORDS, length: 0x38, va: 0x00926307 },
  { offset: PGD_OFF_SEC5_BYTES, length: 7, va: 0x00926328 },
  { offset: PGD_OFF_BOSSES, length: 0x68, va: 0x00926342 },
  { offset: PGD_OFF_CHALLENGES, length: 0x2e, va: 0x00926352 },
  { offset: PGD_OFF_SEC8_DWORDS, length: 0x6c, va: 0x00926360 },
  { offset: PGD_OFF_SEC9_DWORDS, length: 8, va: 0x009263a1 },
  { offset: PGD_OFF_SEC10_BYTES, length: 0x50, va: 0x009263b5 },
];

/* Map erase rows in PE order: {slot, base, erase_va, selflink_va,
   size_va}. base is the map header offset (root at +0, count at +4). */
export const PGDCLR_MAP_ROWS_TABLE = [
  { slot: 3, base: PGD_OFF_BESTIARY + 3 * 8, erase_va: 0x009263cf,
    selflink_va: 0x009263d4, size_va: 0x009263dc },
  { slot: 0, base: PGD_OFF_BESTIARY + 0 * 8, erase_va: 0x009263f1,
    selflink_va: 0x009263f6, size_va: 0x009263fe },
  { slot: 2, base: PGD_OFF_BESTIARY + 2 * 8, erase_va: 0x00926413,
    selflink_va: 0x00926418, size_va: 0x00926420 },
  { slot: 1, base: PGD_OFF_BESTIARY + 1 * 8, erase_va: 0x00926435,
    selflink_va: 0x0092643a, size_va: 0x00926442 },
];

export const PGDCLR_TAIL_STORES_TABLE = [
  { offset: PGD_OFF_CHANGES_MADE, length: 2, value: 0, va: 0x0092644b },
  { offset: PGD_OFF_FLAG_02, length: 1, value: 1, va: 0x00926450 },
  { offset: PGD_OFF_FILE_LOADED_OK, length: 1, value: 1, va: 0x00926454 },
];

/* [start, end) zeroed ranges incl. the word [pgd+0] store and the
   conditional row; the map page is absent by design. */
const CLEAR_ZERO_RANGES = [
  [0, 2, 0],
  [PGD_OFF_PRE_SECTION_WORD, PGD_OFF_PRE_SECTION_WORD + 4, 0],
  [PGD_OFF_ACHIEVEMENTS, PGD_OFF_ACHIEVEMENTS + 0x282, 0],
  [PGD_OFF_EVENT_COUNTERS, PGD_OFF_EVENT_COUNTERS + 0x82c, 0],
  [PGD_OFF_ITEM_COLLECTION, PGD_OFF_ITEM_COLLECTION + 0x2dd, 0],
  [PGD_OFF_SEC3_DWORDS, PGD_OFF_SEC3_DWORDS + 0x38, 0],
  [PGD_OFF_SEC5_BYTES, PGD_OFF_SEC5_BYTES + 7, 0],
  [PGD_OFF_BOSSES, PGD_OFF_BOSSES + 0x68, 0],
  [PGD_OFF_CHALLENGES, PGD_OFF_CHALLENGES + 0x2e, 0],
  [PGD_OFF_SEC8_DWORDS, PGD_OFF_SEC8_DWORDS + 0x6c, 0],
  [PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC9_DWORDS + 8, 0],
  [PGD_OFF_SEC10_BYTES, PGD_OFF_SEC10_BYTES + 0x50, 0],
  [PGD_OFF_SAVE_COUNTER, PGD_OFF_SAVE_COUNTER + 4, 1],
];

export function pgdClearZeroRowCount() {
  return PGDCLR_ZERO_ROWS;
}

export function pgdClearZeroRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDCLR_ZERO_ROWS) return null;
  return PGDCLR_ZERO_ROWS_TABLE[s];
}

/* Row 3 is a rep stosd of 0x20b dwords (`mov ecx,0x20b` 0x009262fd). */
export function pgdClearZeroRowSpanDwords(step) {
  return asI32(step) === 3 ? 0x20b : 0;
}

/* The +0xf88 gate tests the LOW byte of the argument. */
export function pgdClearSaveCounterCleared(unk) {
  return (asU32(unk) & 0xff) !== 0 ? 1 : 0;
}

export function pgdClearMapCount() {
  return PGDCLR_MAP_ROWS;
}

export function pgdClearMapRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDCLR_MAP_ROWS) return null;
  return PGDCLR_MAP_ROWS_TABLE[s];
}

export function pgdClearMapSlotAtStep(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDCLR_MAP_ROWS) return -1;
  return PGDCLR_MAP_ROWS_TABLE[s].slot;
}

export function pgdClearTailStoreCount() {
  return PGDCLR_TAIL_STORES;
}

export function pgdClearTailStoreRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDCLR_TAIL_STORES) return null;
  return PGDCLR_TAIL_STORES_TABLE[s];
}

const CLEAR_FIELD_STATUS = {
  [PGD_OFF_CHANGES_MADE]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_READONLY]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_FLAG_02]: PGDCLR_STATUS_SET_ONE,
  [PGD_OFF_ACHIEVEMENTS]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_EVENT_COUNTERS]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_ITEM_COLLECTION]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_SEC3_DWORDS]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_SEC5_BYTES]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_BOSSES]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_CHALLENGES]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_SEC8_DWORDS]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_SEC9_DWORDS]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_SEC10_BYTES]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_PRE_SECTION_WORD]: PGDCLR_STATUS_ZEROED,
  [PGD_OFF_SAVE_COUNTER]: PGDCLR_STATUS_ZEROED_IF_ARG,
  [PGD_OFF_FILE_LOADED_OK]: PGDCLR_STATUS_SET_ONE,
};

export function pgdClearFieldStatus(field_offset) {
  const off = asI32(field_offset);
  if (off in CLEAR_FIELD_STATUS) return CLEAR_FIELD_STATUS[off];
  if (off >= PGD_OFF_BESTIARY && off < PGD_OFF_PRE_SECTION_WORD) {
    return PGDCLR_STATUS_STRUCT_RESET;
  }
  return PGDCLR_STATUS_UNTOUCHED;
}

export function pgdClearByteZeroed(offset, unk) {
  const o = asI32(offset);
  const argLow = (asU32(unk) & 0xff) !== 0 ? 1 : 0;
  for (const [start, end, cond] of CLEAR_ZERO_RANGES) {
    if (o >= start && o < end) return cond ? argLow : 1;
  }
  return 0;
}

export function pgdClearTotalZeroedBytes(unk) {
  let total = 0;
  const argLow = (asU32(unk) & 0xff) !== 0 ? 1 : 0;
  for (const [start, end, cond] of CLEAR_ZERO_RANGES) {
    total += cond ? (argLow ? end - start : 0) : end - start;
  }
  return total;
}

export function pgdClearGapOffset() {
  return PGDCLR_GAP_OFF;
}

export function pgdClearGapLength() {
  return PGDCLR_GAP_LEN;
}

/* Reader's v3 clear order is the same slot order 3,0,2,1. */
export function pgdClearMapOrderMatchesReader() {
  return 1;
}

export function pgdClearMapOrderMatchesWriter() {
  return 0;
}

export function pgdClearCallSiteCount() {
  return PGDCLR_CALL_SITES;
}

export function pgdClearCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGDCLR_CALL_SITES) return 0;
  return PGDCLR_CALL_SITE_VAS[i];
}

/* ---------- PGDTAIL: shared import tail re-save lane ---------- */

export const PGD_TAIL_STEPS = 10;
export const PGD_TAIL_KIND_WRITE = 1;
export const PGD_TAIL_KIND_HOST_CALL = 2;
export const PGD_TAIL_KIND_EVENT = 3;
export const PGD_TAIL_KIND_GATE = 4;
export const PGD_TAIL_KIND_SAVE_SELECT = 5;
export const PGD_TAIL_KIND_SAVE = 6;

export const PGD_TAIL_IMPORT_BASE_VA = 0x0092b74b;
export const PGD_TAIL_SIBLING_BASE_VA = 0x0092bbe7;
export const PGD_TAIL_HOST_VA_9296C0 = 0x009296c0;
export const PGD_TAIL_HOST_VA_9292C0 = 0x009292c0;
export const PGD_TAIL_EVENT_VA = 0x00929b40;
export const PGD_TAIL_SAVE_STEAM_VA = 0x00928ee0;
export const PGD_TAIL_SAVE_LOCAL_VA = 0x009294f0;
export const PGD_TAIL_PROBE_GLOBAL_VA = 0x00b18a1c;
export const PGD_TAIL_PROBE_ARG = 0x00c5c3a4;
export const PGD_TAIL_GAME_GUARD_OFF = 0x2a378;
export const PGD_TAIL_GAME_2A3A4_OFF = 0x2a3a4;

/* Ten steps, VAs for both import tails (v6 import / sibling). */
export const PGD_TAIL_STEPS_TABLE = [
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b752, vaSibling: 0x0092bbe7,
    detail: "changesmade=1" },
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b755, vaSibling: 0x0092bbea,
    detail: "save+zero game+0x2a378" },
  { kind: PGD_TAIL_KIND_HOST_CALL, vaImport: 0x0092b765, vaSibling: 0x0092bbfa,
    detail: "host 0x9296c0" },
  { kind: PGD_TAIL_KIND_EVENT, vaImport: 0x0092b770, vaSibling: 0x0092bc05,
    detail: "IncreaseEventCounter(0,0)" },
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b77a, vaSibling: 0x0092bc0f,
    detail: "restore game+0x2a378" },
  { kind: PGD_TAIL_KIND_GATE, vaImport: 0x0092b780, vaSibling: 0x0092bc15,
    detail: "low-byte gate +0 / +0xf8c" },
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b790, vaSibling: 0x0092bc25,
    detail: "changesmade=0" },
  { kind: PGD_TAIL_KIND_HOST_CALL, vaImport: 0x0092b793, vaSibling: 0x0092bc28,
    detail: "host 0x9292c0" },
  { kind: PGD_TAIL_KIND_SAVE_SELECT, vaImport: 0x0092b7a3, vaSibling: 0x0092bc38,
    detail: "probe [0xb18a1c](0xc5c3a4)" },
  { kind: PGD_TAIL_KIND_SAVE, vaImport: 0x0092b7bc, vaSibling: 0x0092bc51,
    detail: "steam 0x928ee0 else local 0x9294f0" },
];

export function pgdImportTailStepCount() {
  return PGD_TAIL_STEPS;
}

export function pgdImportTailRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TAIL_STEPS) return null;
  return PGD_TAIL_STEPS_TABLE[s];
}

/* T3 event: IncreaseEventCounter(0,0) at both sites (0x92b770 / 0x92bc05);
   both arguments are literal zeros on every path into the tail. */
export function pgdImportTailEventArgs0() {
  return 0;
}

export function pgdImportTailEventArgs1() {
  return 0;
}

/* T5 gate: two INDEPENDENT low-byte nonzero tests. */
export function pgdImportTailGateOpen(changesmade, file_loaded_ok) {
  return (asU32(changesmade) & 0xff) !== 0 &&
         (asU32(file_loaded_ok) & 0xff) !== 0
    ? 1
    : 0;
}

/* T8 selector: the probe pointer is dereferenced UNCONDITIONALLY in the
   PE (`cmp dword [eax],0`), so this takes the dereferenced dword. */
export function pgdImportTailSaveToSteamNeeded(probe_deref_dword, game_2a3a4) {
  return asU32(probe_deref_dword) !== 0 && (asU32(game_2a3a4) & 0xff) !== 0
    ? 1
    : 0;
}

export function pgdImportTailPreservesGameGuard() {
  return 1;
}

export function pgdImportTailReturnsOneUnlessReadFailed() {
  return 1;
}

/* Reader identity (whole-.text rel32 call census, 2,094,216 instructions,
   469 resyncs). v7's "same reader" claim is corrected here. */
export function pgdImportReaderVa() {
  return PGD_IMPORT_READER_VA; /* 0x009e4260 */
}

export function pgdImportReaderCallSiteVa() {
  return 0x0092b574;
}

export function pgdSiblingReaderVa() {
  return PGD_SIBLING_READER_VA; /* 0x0041d670 */
}

export function pgdSiblingReaderCallSiteVa() {
  return 0x0092ba01;
}

export function pgdSiblingSnapshotCtorVa() {
  return 0x0041d560;
}

export function pgdSiblingCtorCallSiteCount() {
  return 2;
}

export function pgdSiblingCtorCallSiteVa(index) {
  const i = asI32(index);
  if (i === 0) return 0x0092b9d7;
  if (i === 1) return 0x0092b9ea;
  return 0;
}

export function pgdImportReaderCallSiteCount() {
  return 1;
}

export function pgdSiblingReaderCallSiteCount() {
  return 1;
}

export function pgdImportReaderIsSharedWithSibling() {
  return 0;
}

/* ---------- PGDCT: the sibling snapshot ctor 0x0041d560 ---------- */
/* ============================================================
   Helpers ABI v9 — PGDCT (snapshot ctor 0x0041d560).
   ============================================================ */


/* Ten unconditional zero rows, PE execution order (offsets are snapshot
   offsets). Rows are disjoint; row 3 is the rep stosd (0xa2 dwords =
   0x288 bytes). The set-one byte at +0x6e4 = 1 has no reader-side
   writer (whole-reader census). The ctor's stack arg is never read
   (`ret 4`). See section-notes/pgd-v9/NOTES.md. */
export const PGDCT_VA = 0x0041d560;
export const PGDCT_RET_VA = 0x0041d667;
export const PGDCT_MEMSET_VA = 0x00af05e5;
export const PGDCT_SNAPSHOT_BYTES = 0x700;
export const PGDCT_ZERO_ROWS = 10;
export const PGDCT_STOSD_ROW = 3;
export const PGDCT_STOSD_DWORDS = 0xa2;
export const PGDCT_TOTAL_ZEROED_BYTES = 0x6a3;
export const PGDCT_SET_ONE_OFF = 0x6e4;
export const PGDCT_SET_ONE_VALUE = 1;
export const PGDCT_GAP_COUNT = 6;
export const PGDCT_CALL_SITES = 2;

export const PGDCT_ZERO_ROWS_TABLE = [
  { step: 0, offset: 0x6dc, length: 8, va: 0x0041d56e },
  { step: 1, offset: 0x038, length: 0x115, va: 0x0041d583 },
  { step: 2, offset: 0x3d8, length: 0x1ba, va: 0x0041d596 },
  { step: 3, offset: 0x150, length: 0x288, va: 0x0041d5ab },
  { step: 4, offset: 0x594, length: 0x37, va: 0x0041d5ad },
  { step: 5, offset: 0x5cb, length: 0x43, va: 0x0041d5e0 },
  { step: 6, offset: 0x60e, length: 0x1f, va: 0x0041d5ee },
  { step: 7, offset: 0x630, length: 0x5c, va: 0x0041d619 },
  { step: 8, offset: 0x68c, length: 0x4d, va: 0x0041d651 },
  { step: 9, offset: 0x000, length: 2, va: 0x0041d659 },
];

export const PGDCT_GAPS_TABLE = [
  { step: 0, offset: 0x002, length: 0x36 },
  { step: 1, offset: 0x14d, length: 3 },
  { step: 2, offset: 0x592, length: 2 },
  { step: 3, offset: 0x62d, length: 3 },
  { step: 4, offset: 0x6d9, length: 3 },
  { step: 5, offset: 0x6e5, length: 0x1b },
];

export function pgdSnapshotCtorZeroRowCount() {
  return PGDCT_ZERO_ROWS;
}

export function pgdSnapshotCtorZeroRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDCT_ZERO_ROWS) return null;
  return PGDCT_ZERO_ROWS_TABLE[s];
}

export function pgdSnapshotCtorZeroSpanDwords(step) {
  const s = asI32(step);
  return s === PGDCT_STOSD_ROW ? PGDCT_STOSD_DWORDS : 0;
}

export function pgdSnapshotCtorByteZeroed(offset) {
  const o = asI32(offset);
  for (const row of PGDCT_ZERO_ROWS_TABLE) {
    if (o >= row.offset && o < row.offset + row.length) return 1;
  }
  return 0;
}

export function pgdSnapshotCtorTotalZeroedBytes() {
  return PGDCT_TOTAL_ZEROED_BYTES;
}

export function pgdSnapshotCtorSetOneOffset() {
  return PGDCT_SET_ONE_OFF;
}

export function pgdSnapshotCtorSetOneValue() {
  return PGDCT_SET_ONE_VALUE;
}

export function pgdSnapshotCtorGapCount() {
  return PGDCT_GAP_COUNT;
}

export function pgdSnapshotCtorGapRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDCT_GAP_COUNT) return null;
  return PGDCT_GAPS_TABLE[s];
}

export function pgdSnapshotCtorArgUnused() {
  return 1;
}

/* [offset, offset+length) fully inside the union of the zero rows. */
export function pgdSnapshotCtorRestoreSourceCovered(offset, length) {
  const o = asI32(offset);
  const len = asI32(length);
  if (o < 0 || len < 0) return 0;
  if (len === 0) return 1;
  let covered = 0;
  for (const row of PGDCT_ZERO_ROWS_TABLE) {
    const lo = Math.max(o, row.offset);
    const hi = Math.min(o + len, row.offset + row.length);
    if (hi > lo) covered += hi - lo;
  }
  return covered === len ? 1 : 0;
}

/* Cross-law: every PGDEX sibling restore source is pre-zeroed. */
export function pgdSnapshotCtorCoversAllRestoreSources() {
  for (const row of PGD_SIBLING_COPY_ROWS_TABLE) {
    if (row.len > 0 && !pgdSnapshotCtorRestoreSourceCovered(row.src, row.len)) {
      return 0;
    }
  }
  return 1;
}

/* ============================================================
   Helpers ABI v10 — PGDICT (import snapshot ctor 0x009e3dc0).
   ============================================================ */

/* Nine unconditional zero rows, PE execution order (offsets are
   snapshot offsets). Rows are disjoint; row 3 is the rep stosd
   (0x5f dwords = 0x17c bytes). There is no set-one store. The
   ctor's stack arg is never read (`ret 4`). Reasoned from the PE
   body at 0x009e3dc0..0x009e3e97, not copied from the C++ table. */
export const PGDICT_VA = 0x009e3dc0;
export const PGDICT_RET_VA = 0x009e3e97;
export const PGDICT_MEMSET_VA = 0x00af05e5;
export const PGDICT_SNAPSHOT_BYTES = 0x4f0;
export const PGDICT_ZERO_ROWS = 9;
export const PGDICT_STOSD_ROW = 3;
export const PGDICT_STOSD_DWORDS = 0x5f;
export const PGDICT_TOTAL_ZEROED_BYTES = 0x46d;
export const PGDICT_SET_ONE_COUNT = 0;
export const PGDICT_SET_ONE_OFF = -1;
export const PGDICT_SET_ONE_VALUE = 0;
export const PGDICT_GAP_COUNT = 5;
export const PGDICT_CALL_SITES = 2;

export const PGDICT_ZERO_ROWS_TABLE = [
  { step: 0, offset: 0x4a0, length: 8, va: 0x009e3dce },
  { step: 1, offset: 0x038, length: 0xb3, va: 0x009e3de3 },
  { step: 2, offset: 0x268, length: 0x15b, va: 0x009e3df6 },
  { step: 3, offset: 0x0ec, length: 0x17c, va: 0x009e3e0b },
  { step: 4, offset: 0x3c4, length: 0x37, va: 0x009e3e0d },
  { step: 5, offset: 0x3fb, length: 0x39, va: 0x009e3e40 },
  { step: 6, offset: 0x434, length: 0x15, va: 0x009e3e4b },
  { step: 7, offset: 0x44c, length: 0x54, va: 0x009e3e63 },
  { step: 8, offset: 0x000, length: 2, va: 0x009e3e91 },
];

export const PGDICT_GAPS_TABLE = [
  { step: 0, offset: 0x002, length: 0x36 },
  { step: 1, offset: 0x0eb, length: 1 },
  { step: 2, offset: 0x3c3, length: 1 },
  { step: 3, offset: 0x449, length: 3 },
  { step: 4, offset: 0x4a8, length: 0x48 },
];

export function pgdImportCtorZeroRowCount() {
  return PGDICT_ZERO_ROWS;
}

export function pgdImportCtorZeroRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDICT_ZERO_ROWS) return null;
  return PGDICT_ZERO_ROWS_TABLE[s];
}

export function pgdImportCtorZeroSpanDwords(step) {
  const s = asI32(step);
  return s === PGDICT_STOSD_ROW ? PGDICT_STOSD_DWORDS : 0;
}

export function pgdImportCtorByteZeroed(offset) {
  const o = asI32(offset);
  for (const row of PGDICT_ZERO_ROWS_TABLE) {
    if (o >= row.offset && o < row.offset + row.length) return 1;
  }
  return 0;
}

export function pgdImportCtorTotalZeroedBytes() {
  return PGDICT_TOTAL_ZEROED_BYTES;
}

export function pgdImportCtorSetOneOffset() {
  return PGDICT_SET_ONE_OFF;
}

export function pgdImportCtorSetOneValue() {
  return PGDICT_SET_ONE_VALUE;
}

export function pgdImportCtorSetOneCount() {
  return PGDICT_SET_ONE_COUNT;
}

export function pgdImportCtorGapCount() {
  return PGDICT_GAP_COUNT;
}

export function pgdImportCtorGapRecord(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDICT_GAP_COUNT) return null;
  return PGDICT_GAPS_TABLE[s];
}

export function pgdImportCtorArgUnused() {
  return 1;
}

/* [offset, offset+length) fully inside the union of the zero rows. */
export function pgdImportCtorRestoreSourceCovered(offset, length) {
  const o = asI32(offset);
  const len = asI32(length);
  if (o < 0 || len < 0) return 0;
  if (len === 0) return 1;
  let covered = 0;
  for (const row of PGDICT_ZERO_ROWS_TABLE) {
    const lo = Math.max(o, row.offset);
    const hi = Math.min(o + len, row.offset + row.length);
    if (hi > lo) covered += hi - lo;
  }
  return covered === len ? 1 : 0;
}

/* Cross-law: every PGDCOV import restore source is pre-zeroed. */
export function pgdImportCtorCoversAllRestoreSources() {
  for (const row of PGD_IMPORT_COPY_ROWS_TABLE) {
    if (row.len > 0 && !pgdImportCtorRestoreSourceCovered(row.src, row.len)) {
      return 0;
    }
  }
  return 1;
}

export function pgdImportSnapshotCtorVa() {
  return PGDICT_VA;
}

export function pgdImportCtorCallSiteCount() {
  return PGDICT_CALL_SITES;
}

export function pgdImportCtorCallSiteVa(index) {
  const i = asI32(index);
  if (i === 0) return 0x0092b4d0;
  if (i === 1) return 0x0092b4e0;
  return 0;
}

/* ============================================================
   Helpers ABI v11 — PGDCLMP (import-reader post-loop clamp
   0x009e4af0). Independent of the C++: the JS side is a
   branch-target machine over the PE gates, not a port of the
   apply() loop.
   ============================================================ */

export const PGDCLMP_VA = 0x009e4af0;
export const PGDCLMP_RET_VA = 0x009e4f71;
export const PGDCLMP_FLOOR = 1;
export const PGDCLMP_FLAG_OFF = 0x3c;
export const PGDCLMP_COUNT_OFF = 0xf0;
export const PGDCLMP_ACCUM_OFF = 0x454;
export const PGDCLMP_STAIR_BASE = 0x458;
export const PGDCLMP_STAIR_COUNT = 12;
export const PGDCLMP_STAIR_MAX_N = 11;
export const PGDCLMP_TAIL_COUNT = 5;
export const PGDCLMP_CALL_SITES = 1;
export const PGDCLMP_CALL_SITE_VA = 0x009e4613;
export const PGDCLMP_HOST_CALLS = 0;
export const PGDCLMP_BODY_BYTES = 1154;
export const PGDCLMP_MIN_SNAP = 0x49c;

/* PE execution order. Slot +0x494 is BEFORE +0x490. */
export const PGDCLMP_TAIL_GATES = [0x11c, 0x114, 0x14c, 0x148, 0x150];
export const PGDCLMP_TAIL_SLOTS = [0x488, 0x48c, 0x494, 0x490, 0x498];

export function pgdReaderClampFloor(value) {
  const v = asI32(value);
  return v > PGDCLMP_FLOOR ? v : PGDCLMP_FLOOR;
}

export function pgdReaderClampFlagBlockTaken(flagByte) {
  return (asU32(flagByte) & 0xff) !== 0 ? 1 : 0;
}

export function pgdReaderClampStairTaken(flagByte, count, stair) {
  const s = asI32(stair);
  if (s < 0 || s >= PGDCLMP_STAIR_COUNT) return 0;
  if (s === 0) return pgdReaderClampFlagBlockTaken(flagByte);
  return asI32(count) >= s ? 1 : 0;
}

export function pgdReaderClampStairOffset(stair) {
  const s = asI32(stair);
  if (s < 0 || s >= PGDCLMP_STAIR_COUNT) return -1;
  return PGDCLMP_STAIR_BASE + s * 4;
}

export function pgdReaderClampStairCount() {
  return PGDCLMP_STAIR_COUNT;
}

export function pgdReaderClampTailTaken(gate) {
  return asI32(gate) >= PGDCLMP_FLOOR ? 1 : 0;
}

export function pgdReaderClampTailCount() {
  return PGDCLMP_TAIL_COUNT;
}

export function pgdReaderClampTailGateOffset(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGDCLMP_TAIL_COUNT) return -1;
  return PGDCLMP_TAIL_GATES[i];
}

export function pgdReaderClampTailSlotOffset(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGDCLMP_TAIL_COUNT) return -1;
  return PGDCLMP_TAIL_SLOTS[i];
}

export function pgdReaderClampAccumWritten(flagByte, count, g0, g1, g2, g3, g4) {
  if (pgdReaderClampFlagBlockTaken(flagByte)) return 1;
  if (asI32(count) >= 1) return 1;
  if (pgdReaderClampTailTaken(g0) || pgdReaderClampTailTaken(g1) ||
      pgdReaderClampTailTaken(g2) || pgdReaderClampTailTaken(g3) ||
      pgdReaderClampTailTaken(g4)) {
    return 1;
  }
  return 0;
}

function clampReadI32(bytes, off) {
  return (bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) |
          (bytes[off + 3] << 24)) | 0;
}

function clampWriteI32(bytes, off, v) {
  const u = v >>> 0;
  bytes[off] = u & 0xff;
  bytes[off + 1] = (u >>> 8) & 0xff;
  bytes[off + 2] = (u >>> 16) & 0xff;
  bytes[off + 3] = (u >>> 24) & 0xff;
}

/* Independent apply: build the written-slot SET from the predicates,
   then floor each once. C++ walks PE order and may rewrite +0x454
   many times; floor is idempotent so the final bytes agree, but a
   slipped stair/tail table diverges. */
export function pgdReaderClampApply(bytes) {
  if (!bytes || bytes.length < PGDCLMP_MIN_SNAP) return 0;
  const flag = bytes[PGDCLMP_FLAG_OFF];
  const count = clampReadI32(bytes, PGDCLMP_COUNT_OFF);
  const written = new Set();
  if (pgdReaderClampFlagBlockTaken(flag)) {
    written.add(PGDCLMP_STAIR_BASE);
    written.add(PGDCLMP_ACCUM_OFF);
  }
  const maxStair = count < 0 ? 0 : (count > PGDCLMP_STAIR_MAX_N
    ? PGDCLMP_STAIR_MAX_N : count);
  for (let k = 1; k <= maxStair; k++) {
    written.add(PGDCLMP_STAIR_BASE + k * 4);
    written.add(PGDCLMP_ACCUM_OFF);
  }
  for (let i = 0; i < PGDCLMP_TAIL_COUNT; i++) {
    if (pgdReaderClampTailTaken(clampReadI32(bytes, PGDCLMP_TAIL_GATES[i]))) {
      written.add(PGDCLMP_TAIL_SLOTS[i]);
      written.add(PGDCLMP_ACCUM_OFF);
    }
  }
  for (const off of written) {
    clampWriteI32(bytes, off, pgdReaderClampFloor(clampReadI32(bytes, off)));
  }
  return 1;
}

export function pgdReaderClampVa() { return PGDCLMP_VA; }
export function pgdReaderClampRetVa() { return PGDCLMP_RET_VA; }
export function pgdReaderClampCallSiteCount() { return PGDCLMP_CALL_SITES; }
export function pgdReaderClampCallSiteVa(index) {
  return asI32(index) === 0 ? PGDCLMP_CALL_SITE_VA : 0;
}
export function pgdReaderClampHostCalls() { return PGDCLMP_HOST_CALLS; }
export function pgdReaderClampFloorConst() { return PGDCLMP_FLOOR; }

/* ---------- ABI v12: PGDTREE 0x00414a80 ---------- */
export const PGD_TREE_LEFT_OFF = 0;
export const PGD_TREE_PARENT_OFF = 4;
export const PGD_TREE_RIGHT_OFF = 8;
export const PGD_TREE_ISNIL_OFF = 0xd;
export const PGD_TREE_NEXT_VA = 0x00414a80;
export const PGD_TREE_NEXT_RET_A_VA = 0x00414ab0;
export const PGD_TREE_NEXT_RET_B_VA = 0x00414ad2;
export const PGD_TREE_NEXT_BODY_BYTES = 83;
export const PGD_TREE_NEXT_HOST_CALLS = 0;
export const PGD_TREE_NEXT_CALL_SITES_IMAGE = 134;
export const PGD_TREE_NEXT_CALL_SITES_CLUSTER = 5;
export const PGD_TREE_NEXT_CLUSTER_SITES = Object.freeze([
  0x00928bf9, 0x00928cbc, 0x00928d7f, 0x00928e49, 0x0092af9a,
]);

export function pgdTreeIsnilByte(isnilWord) {
  return ((isnilWord >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function pgdTreeRightNilArm(rightIsnilWord) {
  return pgdTreeIsnilByte(rightIsnilWord);
}

/**
 * Independent JS oracle for PE 0x00414a80 (MSVC tree iterator++).
 * @param {DataView} view
 * @param {number} itOff
 * @returns {number} new node address
 */
export function pgdTreeIteratorNext(view, itOff) {
  const base = itOff >>> 0;
  let node = view.getUint32(base, true) >>> 0;
  if (node === 0) return 0;
  const loadU32 = (addr) => view.getUint32(addr >>> 0, true) >>> 0;
  const isNil = (addr) => view.getUint8(((addr >>> 0) + PGD_TREE_ISNIL_OFF) >>> 0);
  const right = loadU32(node + PGD_TREE_RIGHT_OFF);
  if (isNil(right) !== 0) {
    let cur = node;
    let parent = loadU32(cur + PGD_TREE_PARENT_OFF);
    if (isNil(parent) === 0) {
      while (cur === loadU32(parent + PGD_TREE_RIGHT_OFF)) {
        view.setUint32(base, parent >>> 0, true);
        cur = parent;
        parent = loadU32(cur + PGD_TREE_PARENT_OFF);
        if (isNil(parent) !== 0) break;
      }
    }
    view.setUint32(base, parent >>> 0, true);
    return parent >>> 0;
  }
  let walk = right;
  let left = loadU32(walk + PGD_TREE_LEFT_OFF);
  if (isNil(left) === 0) {
    do {
      walk = left;
      left = loadU32(walk + PGD_TREE_LEFT_OFF);
    } while (isNil(left) === 0);
  }
  view.setUint32(base, walk >>> 0, true);
  return walk >>> 0;
}

export function pgdTreeNextVa() { return PGD_TREE_NEXT_VA; }
export function pgdTreeNextHostCalls() { return PGD_TREE_NEXT_HOST_CALLS; }
export function pgdTreeNextBodyBytes() { return PGD_TREE_NEXT_BODY_BYTES; }
export function pgdTreeNextCallSitesImage() { return PGD_TREE_NEXT_CALL_SITES_IMAGE; }
export function pgdTreeNextCallSitesCluster() { return PGD_TREE_NEXT_CALL_SITES_CLUSTER; }
export function pgdTreeNextClusterSiteVa(index) {
  const i = index | 0;
  if (i < 0 || i >= PGD_TREE_NEXT_CALL_SITES_CLUSTER) return 0;
  return PGD_TREE_NEXT_CLUSTER_SITES[i] >>> 0;
}

/* ============================================================
   Helpers ABI v13 — PGDTROW (writer bestiary tree-row walk).
   ============================================================ */

/* The PGD serializer 0x009282e0 drains the four bestiary maps
   (std::map<int,int> at pgd+0xf64/+0xf6c/+0xf74/+0xf7c) row by row using
   the v12 iterator++ law (0x00414a80). Four structurally identical walks;
   every predicate below is transcribed from the writer's instruction
   stream (see section-notes/pgd-v13/NOTES.md). The stream writes and the
   checksum calls stay host; the ROW WALK shape is pure. */

export const PGD_TREE_ROW_KEY_OFF = 0x10;
export const PGD_TREE_ROW_VALUE_OFF = 0x14;
export const PGD_TREE_ROW_STRIDE = 0x18;
export const PGD_TREE_ROW_ADVANCE_VA = 0x00414a80;
export const PGD_TREE_ROW_WRITER_VA = 0x009282e0;
export const PGD_TREE_ROW_ALT_VA = 0x0091b2f9;
export const PGD_TREE_ROW_READER_VA = 0x0092af9a;
export const PGD_TREE_ROW_WALKS = 4;
export const PGD_TREE_ROW_SLOTS = Object.freeze([3, 1, 2, 0]);
export const PGD_TREE_ROW_TAGS = Object.freeze([4, 2, 3, 1]);
export const PGD_TREE_ROW_HEADER_OFFS = Object.freeze([
  0xf7c, 0xf6c, 0xf74, 0xf64,
]);
export const PGD_TREE_ROW_COUNT_OFFS = Object.freeze([
  0xf80, 0xf70, 0xf78, 0xf68,
]);

/* Per-walk instruction VAs, PE execution order (gate cmp / loop head /
   key lea / value add / advance call / loop-back cmp). */
export const PGD_TREE_ROW_GATE_VAS = Object.freeze([
  0x00928ba9, 0x00928c6f, 0x00928d32, 0x00928df5,
]);
export const PGD_TREE_ROW_LOOP_HEAD_VAS = Object.freeze([
  0x00928bb0, 0x00928c73, 0x00928d36, 0x00928e00,
]);
export const PGD_TREE_ROW_KEY_VAS = Object.freeze([
  0x00928bb3, 0x00928c76, 0x00928d39, 0x00928e03,
]);
export const PGD_TREE_ROW_VALUE_VAS = Object.freeze([
  0x00928bd6, 0x00928c99, 0x00928d5c, 0x00928e26,
]);
export const PGD_TREE_ROW_CALL_VAS = Object.freeze([
  0x00928bf9, 0x00928cbc, 0x00928d7f, 0x00928e49,
]);
export const PGD_TREE_ROW_LOOP_BACK_VAS = Object.freeze([
  0x00928c01, 0x00928cc4, 0x00928d87, 0x00928e51,
]);

export function pgdTreeRowKeyOff() {
  return PGD_TREE_ROW_KEY_OFF;
}
export function pgdTreeRowValueOff() {
  return PGD_TREE_ROW_VALUE_OFF;
}
export function pgdTreeRowStride() {
  return PGD_TREE_ROW_STRIDE;
}
export function pgdTreeRowAdvanceVa() {
  return PGD_TREE_ROW_ADVANCE_VA;
}
export function pgdTreeRowWriterVa() {
  return PGD_TREE_ROW_WRITER_VA;
}
export function pgdTreeRowAltVa() {
  return PGD_TREE_ROW_ALT_VA;
}
export function pgdTreeRowReaderVa() {
  return PGD_TREE_ROW_READER_VA;
}

/* Empty gate: `cmp begin, header ; je skip` — plain equality on the whole
   dword, no sign test. begin == header means the tree is empty. */
export function pgdTreeRowEmpty(beginNode, headerNode) {
  return asU32(beginNode) === asU32(headerNode) ? 1 : 0;
}

/* Loop-back: `cmp node, header ; jne loop` — plain inequality. */
export function pgdTreeRowLoopBack(node, headerNode) {
  return asU32(node) !== asU32(headerNode) ? 1 : 0;
}

export function pgdTreeRowWalkCount() {
  return PGD_TREE_ROW_WALKS;
}

export function pgdTreeRowWalkSlot(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return -1;
  return PGD_TREE_ROW_SLOTS[s];
}

export function pgdTreeRowWalkTag(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_TAGS[s];
}

export function pgdTreeRowWalkHeaderOff(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return -1;
  return PGD_TREE_ROW_HEADER_OFFS[s];
}

export function pgdTreeRowWalkCountOff(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return -1;
  return PGD_TREE_ROW_COUNT_OFFS[s];
}

export function pgdTreeRowWalkGateVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_GATE_VAS[s] >>> 0;
}

export function pgdTreeRowWalkLoopHeadVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_LOOP_HEAD_VAS[s] >>> 0;
}

export function pgdTreeRowWalkKeyVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_KEY_VAS[s] >>> 0;
}

export function pgdTreeRowWalkValueVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_VALUE_VAS[s] >>> 0;
}

export function pgdTreeRowWalkCallVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_CALL_VAS[s] >>> 0;
}

export function pgdTreeRowWalkLoopBackVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_TREE_ROW_LOOP_BACK_VAS[s] >>> 0;
}

/* Cross-law: the walk slot order must equal the reader-side bestiary pair
   table, and the emitted tags must equal the reader-side tag table. */
export function pgdTreeRowOrderMatchesBestiaryPairs() {
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    if (pgdTreeRowWalkSlot(s) !== pgdBestiarySubmapPair(s)) return 0;
    if (pgdTreeRowWalkTag(s) !== pgdBestiarySubmapTag(s)) return 0;
  }
  return 1;
}

/* ============================================================
   Helpers ABI v14 — PGDSC11 (writer section-11 sub-block framing).
   ============================================================ */

/* The writer 0x009282e0 frames section 11 (id 0xb) right after the ten
   fixed sections, BEFORE the v13 row walks. Evidence VAs (writer):
     - 0x928aa6..0x928ac1  total = c0 + (c1 + (c2 + c3)) — the four
       bestiary count words 0xf78 / 0xf80 / 0xf70 / 0xf68 are summed in
       THAT order: `mov ecx,[edi+0xf78] ; add ecx,[edi+0xf80] ;
       add ecx,[edi+0xf70] ; mov eax,[edi+0xf68] ; add eax,ecx`
       (32-bit wrap, plain add).
     - 0x928ac3  id store: `mov [ebp-0x10], 0xb` (section 11).
     - 0x928acd  count_word = total is STORED to [ebp-0xc] but NEVER
       streamed — dead store. The third streamed header dword is the
       sub-block count 4 (`mov [ebp-0x20], 4` @ 0x928b20, written by
       the 0x928b2c vtable call), which the reader consumes as its
       sub-block loop bound ([ebp-0x7c] @ 0x927791).
     - 0x928ad0  cap_word = total << 2 (`shl eax,2`), streamed after id
       (0x928b01), so the section header is [id=11][cap=total*4][sub-blocks=4].
   Per walk step s (the v13 order, slots 3,1,2,0): the writer first
   streams the sub-block tag (0x928b4b / 0x928c11 / 0x928cd4 / 0x928d97
   immediates 4,2,3,1 — the v13 tags) and a sub-block cap word =
   count[PGD_TREE_ROW_COUNT_OFFS[s]] << 2 (0x928b6e/0x928b7a,
   0x928c34/0x928c40, 0x928cf7/0x928d03, 0x928dba/0x928dc6) before the
   row walk itself. Reader 0x9276e1: subcount==0 gate (`cmp [ebp-0x7c],0
   ; jbe` @0x927794/0x92779f — UNSIGNED), per sub-block the tag is read
   and `dec eax; cmp eax,3; ja` (0x9277bd/0x9277c1) rejects tag-1 > 3
   (UNSIGNED — valid tags 1..4, matching pgdBestiarySlotFromTag), then
   the cap word is read and gated `test eax,eax; jle` (SIGNED cap > 0,
   e.g. 0x9277e6/0x9277e8) and rows = cap >> 2 via `shr eax,2`
   (UNSIGNED, 0x9277ee); row loop-back `cmp ebx,rows; jl` (SIGNED,
   0x9278e6/0x9278e9); sub-block loop-back `inc [ebp-0x78]; cmp
   eax,subcount; jb` (UNSIGNED, 0x927c63/0x927c6d). The stream writes
   and checksums stay host; all framing gates are pure. */

export const PGD_SEC11_HEADER_ID = 0xb;
export const PGD_SEC11_SUB_BLOCKS = 4;
export const PGD_SEC11_TOTAL_VA = 0x00928aa6;
export const PGD_SEC11_TOTAL_FINAL_ADD_VA = 0x00928ac1;
export const PGD_SEC11_ID_STORE_VA = 0x00928ac3;
export const PGD_SEC11_COUNT_DEAD_STORE_VA = 0x00928acd;
export const PGD_SEC11_CAP_SHL_VA = 0x00928ad0;
export const PGD_SEC11_CAP_WRITE_VA = 0x00928b01;
export const PGD_SEC11_SUBCOUNT_STORE_VA = 0x00928b20;
export const PGD_SEC11_SUBCOUNT_WRITE_VA = 0x00928b2c;
export const PGD_SEC11_READER_SUBCOUNT_READ_VA = 0x00927791;
export const PGD_SEC11_READER_HANDLER_VA = 0x009276e1;
export const PGD_SEC11_READER_TAG_READ_VA = 0x009277b4;
export const PGD_SEC11_READER_TAG_GATE_VA = 0x009277bd;
export const PGD_SEC11_READER_CAP_GATE_VA = 0x009277e6;
export const PGD_SEC11_READER_CAP_SHR_VA = 0x009277ee;
export const PGD_SEC11_READER_ROW_LOOP_BACK_VA = 0x009278e6;
export const PGD_SEC11_READER_SUB_LOOP_BACK_VA = 0x00927c63;
export const PGD_SEC11_TAG_WRITE_VAS = Object.freeze([
  0x00928b4b, 0x00928c11, 0x00928cd4, 0x00928d97,
]);
export const PGD_SEC11_CAP_SOURCE_VAS = Object.freeze([
  0x00928b6e, 0x00928c34, 0x00928cf7, 0x00928dba,
]);
export const PGD_SEC11_CAP_SHL_VAS = Object.freeze([
  0x00928b7a, 0x00928c40, 0x00928d03, 0x00928dc6,
]);

export function pgdSec11HeaderId() {
  return PGD_SEC11_HEADER_ID;
}
export function pgdSec11SubBlockCount() {
  return PGD_SEC11_SUB_BLOCKS;
}

/* The four bestiary count words, summed in the machine's exact order:
   ecx = [0xf78]; ecx += [0xf80]; ecx += [0xf70]; eax = [0xf68]; eax +=
   ecx. 32-bit wrap on every add. */
export function pgdSec11RowTotal(c2, c3, c1, c0) {
  return asU32(asU32(asU32(c0) + asU32(asU32(asU32(c2) + asU32(c3)) + asU32(c1))));
}

/* cap_word = total << 2 (writer 0x928ad0 `shl eax,2`), 32-bit wrap. The
   header streams [id=11][cap][subcount=4]; the count_word (total) is a
   dead store and never reaches the stream. */
export function pgdSec11HeaderCap(total) {
  return asU32(asU32(total) << 2);
}

/* Per-walk sub-block cap = count[slot(step)] << 2 (writer loads the count
   word at PGD_TREE_ROW_COUNT_OFFS[step], shl 2, streams it BEFORE the
   row walk). */
export function pgdSec11SubCap(step, count) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return -1;
  return asU32(asU32(count) << 2);
}

/* Reader rows from the sub-block cap: `test eax,eax; jle skip` (SIGNED
   cap > 0 required) then `shr eax,2` (UNSIGNED). */
export function pgdSec11RowsFromCap(cap) {
  return asI32(cap) > 0 ? asU32(cap) >>> 2 : 0;
}

/* Reader sub-block count gate: `cmp [ebp-0x7c],0 ; jbe done` — UNSIGNED
   (skip the whole section when subcount == 0). */
export function pgdSec11SubCountZero(subcount) {
  return asU32(subcount) === 0 ? 1 : 0;
}

/* Reader tag gate: `dec eax; cmp eax,3; ja skip` — (tag-1) > 3 UNSIGNED
   is invalid; valid tags are 1..4. */
export function pgdSec11TagValid(tag) {
  const biased = asU32(asU32(tag) - 1);
  return biased <= 3 ? 1 : 0;
}

/* Reader sub-block loop-back: `inc [ebp-0x78]; cmp eax,subcount; jb
   0x9277a5` — UNSIGNED index < subcount continues. */
export function pgdSec11SubLoopBack(index, subcount) {
  return asU32(index) < asU32(subcount) ? 1 : 0;
}

/* Reader row loop-back: `cmp ebx,rows; jl 0x927800` — SIGNED index <
   rows continues (rows == cap >> 2, and cap was already gated SIGNED
   > 0, so rows stays below 2^31; the machine still uses jl). */
export function pgdSec11RowLoopBack(index, rows) {
  return asI32(index) < asI32(rows) ? 1 : 0;
}

export function pgdSec11TotalVa() {
  return PGD_SEC11_TOTAL_VA;
}
export function pgdSec11TotalFinalAddVa() {
  return PGD_SEC11_TOTAL_FINAL_ADD_VA;
}
export function pgdSec11IdStoreVa() {
  return PGD_SEC11_ID_STORE_VA;
}
export function pgdSec11CountDeadStoreVa() {
  return PGD_SEC11_COUNT_DEAD_STORE_VA;
}
export function pgdSec11CapShlVa() {
  return PGD_SEC11_CAP_SHL_VA;
}
export function pgdSec11CapWriteVa() {
  return PGD_SEC11_CAP_WRITE_VA;
}
export function pgdSec11SubcountStoreVa() {
  return PGD_SEC11_SUBCOUNT_STORE_VA;
}
export function pgdSec11SubcountWriteVa() {
  return PGD_SEC11_SUBCOUNT_WRITE_VA;
}
export function pgdSec11ReaderSubcountReadVa() {
  return PGD_SEC11_READER_SUBCOUNT_READ_VA;
}
export function pgdSec11ReaderHandlerVa() {
  return PGD_SEC11_READER_HANDLER_VA;
}
export function pgdSec11ReaderTagReadVa() {
  return PGD_SEC11_READER_TAG_READ_VA;
}
export function pgdSec11ReaderTagGateVa() {
  return PGD_SEC11_READER_TAG_GATE_VA;
}
export function pgdSec11ReaderCapGateVa() {
  return PGD_SEC11_READER_CAP_GATE_VA;
}
export function pgdSec11ReaderCapShrVa() {
  return PGD_SEC11_READER_CAP_SHR_VA;
}
export function pgdSec11ReaderRowLoopBackVa() {
  return PGD_SEC11_READER_ROW_LOOP_BACK_VA;
}
export function pgdSec11ReaderSubLoopBackVa() {
  return PGD_SEC11_READER_SUB_LOOP_BACK_VA;
}
export function pgdSec11TagWriteVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_SEC11_TAG_WRITE_VAS[s] >>> 0;
}
export function pgdSec11CapSourceVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_SEC11_CAP_SOURCE_VAS[s] >>> 0;
}
export function pgdSec11CapShlStepVa(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGD_TREE_ROW_WALKS) return 0;
  return PGD_SEC11_CAP_SHL_VAS[s] >>> 0;
}

/* Cross-law: the three writer per-walk VA tables must align with the
   v13 row-walk order (tag immediates == bestiary tags; the per-walk
   cap-source / cap-shl / tag-write VA tables fully populated). The
   offset-level law (sub-cap reads the count word at the walk's slot
   count-offset, i.e. headerCap(rowTotal) == sum of per-walk sub-caps)
   is asserted in the test suite. */
export function pgdSec11FramingMatchesRowWalk() {
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    if (pgdTreeRowWalkTag(s) !== pgdBestiarySubmapTag(s)) return 0;
    if (pgdSec11TagWriteVa(s) === 0 || pgdSec11CapSourceVa(s) === 0 ||
        pgdSec11CapShlVa(s) === 0) {
      return 0;
    }
  }
  return 1;
}

/* ============================================================
   Helpers ABI v30 — PGDWRI: writer 0x9282e0 record-count plan and
   the 61-site checksum-call sequence.
   ============================================================ */

/* The write_stream root: body 0x9282e0..0x928ed8 (ret @0x928ed8, body
   0xbf8). One checksum state for the whole write: mode 1 (store
   @0x92830c), lane 0 (@0x928313), partial 0 (@0x92831a), seed
   0xfedcba76 (@0x92831e); every one of the 61 update calls uses
   ecx = lea [ebp-0x3c]. The final dword written @0x928ecf (vtbl+0x1c,
   NOT hashed) is the acc — the file checksum. Census (CORRECTED this
   unit): 61x 0x683410 (v29 "60x" missed the pre-record hash
   @0x928336), 4x 0x414a80 tree-next, 63x vtbl+0x1c stream writes, 1x
   0xaf05e5 (the dead mode-0 tail pad), 1 this-store `incl [this+0xf88]`
   @0x928e62. The record loop laws: bound = the count dword (literal,
   `cmp <idx>,count ; jb` UNSIGNED), stride = the elem width, base =
   the field offset — pgdWriLoopIterations / pgdWriElementHashLen /
   pgdSectionDesc agree with the SECTIONS table. */
export const PGD_WRI_VA = 0x009282e0;
export const PGD_WRI_RET_VA = 0x00928ed8;
export const PGD_WRI_BODY_BYTES = 0xbf8;
export const PGD_WRI_STATE_MODE_STORE_VA = 0x0092830c;
export const PGD_WRI_STATE_LANE_STORE_VA = 0x00928313;
export const PGD_WRI_STATE_PARTIAL_STORE_VA = 0x0092831a;
export const PGD_WRI_STATE_SEED_STORE_VA = 0x0092831e;
export const PGD_WRI_PRE_OFF = 0xf84;
export const PGD_WRI_PRE_HASH_VA = 0x00928336;
export const PGD_WRI_SAVE_COUNTER_OFF = 0xf88;
export const PGD_WRI_SAVE_COUNTER_INC_VA = 0x00928e62;
export const PGD_WRI_SAVE_COUNTER_HASH_VA = 0x00928e7c;
export const PGD_WRI_FINAL_WRITE_VA = 0x00928ecf;
export const PGD_WRI_CS_SITES = 61;
export const PGD_WRI_TREE_NEXT_SITES = 4;
export const PGD_WRI_VTBL_WRITE_SITES = 63;
export const PGD_WRI_MEMSET_SITES = 1;
export const PGD_WRI_STORES = 1;

/* Role codes for the 61 checksum-call rows. */
export const PGD_WRI_ROLE_PRE = 0;
export const PGD_WRI_ROLE_ID = 1;
export const PGD_WRI_ROLE_CAP = 2;
export const PGD_WRI_ROLE_CNT = 3;
export const PGD_WRI_ROLE_ELT = 4;
export const PGD_WRI_ROLE_SUB = 5;
export const PGD_WRI_ROLE_KEY = 6;
export const PGD_WRI_ROLE_VAL = 7;
export const PGD_WRI_ROLE_TAIL = 8;

/* The 61 static call sites, in execution order. Every row hashes its
   data with len 4 except the ELT rows, whose len is the element width
   (1 for the byte-flag arrays, 4 for the u32 arrays). Verified against
   the objdump site scan (61 E8s exactly). */
export const PGD_WRI_CS_TABLE = Object.freeze([
  /* R0 pre-record dword this+0xf84 */
  { va: 0x00928336, role: PGD_WRI_ROLE_PRE, len: 4 },
  /* R1 id 1: achievements byte flags this+0x38, count 0x282 */
  { va: 0x0092836f, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x00928393, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x009283b7, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x009283eb, role: PGD_WRI_ROLE_ELT, len: 1 },
  /* R2 id 2: event counters u32 this+0x2bc, count 0x20b */
  { va: 0x0092842a, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x0092844e, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x00928472, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x0092849f, role: PGD_WRI_ROLE_ELT, len: 4 },
  /* R3 id 3: sec3 u32 this+0xdc8, count 0xe */
  { va: 0x009284e1, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x00928505, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x00928529, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x0092855b, role: PGD_WRI_ROLE_ELT, len: 4 },
  /* R4 id 4: item collection byte flags this+0xae8, count 0x2dd */
  { va: 0x0092859d, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x009285c1, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x009285e5, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x0092861c, role: PGD_WRI_ROLE_ELT, len: 1 },
  /* R5 id 5: sec5 byte flags this+0xe00, count 7 */
  { va: 0x0092865b, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x0092867f, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x009286a3, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x009286db, role: PGD_WRI_ROLE_ELT, len: 1 },
  /* R6 id 6: bosses byte flags this+0xe07, count 0x68 */
  { va: 0x0092871a, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x0092873e, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x00928762, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x0092879b, role: PGD_WRI_ROLE_ELT, len: 1 },
  /* R7 id 7: challenges byte flags this+0xe6f, count 0x2e */
  { va: 0x009287da, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x009287fe, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x00928822, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x0092885b, role: PGD_WRI_ROLE_ELT, len: 1 },
  /* R8 id 8: sec8 u32 this+0xea0, count 0x1b */
  { va: 0x0092889a, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x009288be, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x009288e2, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x00928918, role: PGD_WRI_ROLE_ELT, len: 4 },
  /* R9 id 9: sec9 u32 this+0xf0c, count 2 */
  { va: 0x0092895a, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x0092897e, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x009289a2, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x009289d8, role: PGD_WRI_ROLE_ELT, len: 4 },
  /* R10 id 0xa: sec10 byte flags this+0xf14, count 0x50 */
  { va: 0x00928a1a, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x00928a3e, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x00928a62, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x00928a9b, role: PGD_WRI_ROLE_ELT, len: 1 },
  /* R11 id 0xb: header [id=11][cap=total<<2][subcount=4] + 8 sub
     dwords (tag, cap<<2 per walk) + 4 walks x (key, value) */
  { va: 0x00928aef, role: PGD_WRI_ROLE_ID, len: 4 },
  { va: 0x00928b13, role: PGD_WRI_ROLE_CAP, len: 4 },
  { va: 0x00928b3e, role: PGD_WRI_ROLE_CNT, len: 4 },
  { va: 0x00928b69, role: PGD_WRI_ROLE_SUB, len: 4 }, /* tag 4 */
  { va: 0x00928b99, role: PGD_WRI_ROLE_SUB, len: 4 }, /* f80<<2 */
  { va: 0x00928bce, role: PGD_WRI_ROLE_KEY, len: 4 }, /* walk f7c */
  { va: 0x00928bf1, role: PGD_WRI_ROLE_VAL, len: 4 },
  { va: 0x00928c2f, role: PGD_WRI_ROLE_SUB, len: 4 }, /* tag 2 */
  { va: 0x00928c5f, role: PGD_WRI_ROLE_SUB, len: 4 }, /* f70<<2 */
  { va: 0x00928c91, role: PGD_WRI_ROLE_KEY, len: 4 }, /* walk f6c */
  { va: 0x00928cb4, role: PGD_WRI_ROLE_VAL, len: 4 },
  { va: 0x00928cf2, role: PGD_WRI_ROLE_SUB, len: 4 }, /* tag 3 */
  { va: 0x00928d22, role: PGD_WRI_ROLE_SUB, len: 4 }, /* f78<<2 */
  { va: 0x00928d54, role: PGD_WRI_ROLE_KEY, len: 4 }, /* walk f74 */
  { va: 0x00928d77, role: PGD_WRI_ROLE_VAL, len: 4 },
  { va: 0x00928db5, role: PGD_WRI_ROLE_SUB, len: 4 }, /* tag 1 */
  { va: 0x00928de5, role: PGD_WRI_ROLE_SUB, len: 4 }, /* f68<<2 */
  { va: 0x00928e1e, role: PGD_WRI_ROLE_KEY, len: 4 }, /* walk f64 */
  { va: 0x00928e41, role: PGD_WRI_ROLE_VAL, len: 4 },
  /* tail: save counter (post `incl [this+0xf88]`) */
  { va: 0x00928e7c, role: PGD_WRI_ROLE_TAIL, len: 4 },
]);

/* The per-record checksum-site layout: for the ten fixed sections the
   row roles ID/CAP/CNT each hash 4 bytes and the element loop site
   (ELT) hashes width bytes count times. */
export function pgdWriLoopIterations(recordId) {
  const want = asI32(recordId);
  if (want === PGD_BESTIARY_SECTION_ID) return 0;
  const row = SECTIONS.find((s) => s.id === want);
  if (!row) return -1;
  return row.count;
}

export function pgdWriElementHashLen(recordId) {
  const want = asI32(recordId);
  if (want === PGD_BESTIARY_SECTION_ID) return 0;
  const row = SECTIONS.find((s) => s.id === want);
  if (!row) return -1;
  return row.width;
}

/* `incl [this+0xf88]` @0x928e62 — plain u32 +1, then hashed (4) and
   streamed before the final checksum dword. */
export function pgdWriSaveCounterNext(counter) {
  return asU32(asU32(counter) + 1);
}

/* Cross-count: the site table must contain exactly the claimed number
   of newline-separated rows and match the writen census (61). */
export function pgdWriCsSiteCount() {
  return PGD_WRI_CS_SITES;
}

export function pgdWriCsSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_WRI_CS_TABLE.length) return 0;
  return PGD_WRI_CS_TABLE[i].va;
}

export function pgdWriCsSiteRole(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_WRI_CS_TABLE.length) return -1;
  return PGD_WRI_CS_TABLE[i].role;
}

export function pgdWriCsSiteLen(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_WRI_CS_TABLE.length) return 0;
  return PGD_WRI_CS_TABLE[i].len;
}

/* PE-truth helpers for the census constants. */
export function pgdWriVa() {
  return PGD_WRI_VA;
}
export function pgdWriRetVa() {
  return PGD_WRI_RET_VA;
}
export function pgdWriBodyBytes() {
  return PGD_WRI_BODY_BYTES;
}
export function pgdWriStateModeStoreVa() {
  return PGD_WRI_STATE_MODE_STORE_VA;
}
export function pgdWriStateLaneStoreVa() {
  return PGD_WRI_STATE_LANE_STORE_VA;
}
export function pgdWriStatePartialStoreVa() {
  return PGD_WRI_STATE_PARTIAL_STORE_VA;
}
export function pgdWriStateSeedStoreVa() {
  return PGD_WRI_STATE_SEED_STORE_VA;
}
export function pgdWriPreOff() {
  return PGD_WRI_PRE_OFF;
}
export function pgdWriPreHashVa() {
  return PGD_WRI_PRE_HASH_VA;
}
export function pgdWriSaveCounterOff() {
  return PGD_WRI_SAVE_COUNTER_OFF;
}
export function pgdWriSaveCounterIncVa() {
  return PGD_WRI_SAVE_COUNTER_INC_VA;
}
export function pgdWriSaveCounterHashVa() {
  return PGD_WRI_SAVE_COUNTER_HASH_VA;
}
export function pgdWriFinalWriteVa() {
  return PGD_WRI_FINAL_WRITE_VA;
}
export function pgdWriTreeNextSites() {
  return PGD_WRI_TREE_NEXT_SITES;
}
export function pgdWriVtblWriteSites() {
  return PGD_WRI_VTBL_WRITE_SITES;
}
export function pgdWriMemsetSites() {
  return PGD_WRI_MEMSET_SITES;
}
export function pgdWriStores() {
  return PGD_WRI_STORES;
}

/* ============================================================
   Helpers ABI v31 — PGDVRF: the save verifier 0x926f10
   verify-open laws (magic-kind selection, fold-region
   verify-then-compare, trailing-dword compare).
   ============================================================ */

/* verify_open 0x926f10..0x927cd0 (ret 4 @0x927cd0, body 0xdc0; SEH
   handler 0xb0a991, cookie 0xbf93b4; __thiscall bool (PGD* ecx,
   Stream* @[ebp+8]), ret 4; inbound 5 — 0x926e98 / 0x92c023 /
   0x92c203 / 0x92c727 / 0x92c9b7). Front: read 0x10 header bytes via
   vtbl+0x14 @0x926f50 -> the 4-magic cascade (0x926f53..0x92700a:
   dword loop `sub edi,4 ; jae` runs for edi = 0xc,8,4,0 = FOUR dwords
   = the FULL 16 bytes; first match wins) -> kind 6/7/8/9 in ebx +
   the bound store [ebp-0x44] = 9/0xa/0xa/0xb; no match -> log
   0xb7ab3c ("PersistentGameData wrong file header (%.16s)\n") +
   FALSE. Then the region fold: `push 4 ; push 0x10 ; mov edx,esi ;
   call 0x683580` @0x927017 (skip_front 0x10 / skip_back 4 CONFIRMED),
   seek(size-4) @0x92702c (`push 2 ; push -4 ; call [vtbl+0xc]`),
   read the trailing dword @0x927044, `cmp [ebp-0x70],edi` @0x927046 —
   mismatch -> log 0xb7ab0c ("[warn] PersistentGameData checksum
   invalid!\n") + FALSE. Then the kind gate `cmp ebx,8 ; ja` @0x92705f
   (kind > 8 UNSIGNED -> proceed; 6/7/8 -> log 0xb7aac8 "[warn]
   Unsuported save version (probably an AB or Rebirth save)!\n"
   verbatim + FALSE). The record loop (ids 1..11 via the jump table
   0x927cd8, signed js/jge gates = pgdReaderLoopContinue) and the
   success exit 0x927c8a (read this+0xf88 save counter + TRUE) stay
   typed-host. The four magics are exactly 16 ASCII bytes each with
   TRAILING SPACES (not NUL): "ISAACNGSAVE06R  " / "07R  " / "08R  " /
   "09R  "; bytes 0..11 are identical ("ISAACNGSAVE0"; dwords
   0x41415349 / 0x53474e43 / 0x30455641), byte 12 is the kind digit
   ('6'/'7'/'8'/'9' = 0x36..0x39), byte 13 is 'R' (0x52), bytes
   14-15 are 0x20 0x20 — dword 3 discriminates: 0x20205236 /
   0x20205237 / 0x20205238 / 0x20205239. */
export const PGD_VRF_VA = 0x00926f10;
export const PGD_VRF_RET_VA = 0x00927cd0;
export const PGD_VRF_BODY_BYTES = 0xdc0;
export const PGD_VRF_SEH_HANDLER_VA = 0x00b0a991;
export const PGD_VRF_COOKIE_VA = 0x00bf93b4;
export const PGD_VRF_INBOUND = 5;
export const PGD_VRF_RETURN_STACK = 4;
export const PGD_VRF_MAGIC_VAS = Object.freeze([
  0x00b1b98c, 0x00b1b9a0, 0x00b1b9b4, 0x00b7ab6c,
]);
export const PGD_VRF_COMPARE_LOOP_VA = 0x00926f60;
export const PGD_VRF_COMPARE_JA_VA = 0x00926f6f;
export const PGD_VRF_CASCADE_HEAD_VAS = Object.freeze([
  0x00926f53, 0x00926f82, 0x00926faf, 0x00926fdf,
]);
export const PGD_VRF_KIND_STORE_VAS = Object.freeze([
  0x00926f71, 0x00926fa1, 0x00926fd1, 0x00927005,
]);
export const PGD_VRF_BOUND_STORE_VAS = Object.freeze([
  0x00926f76, 0x00926fa6, 0x00926fd6, 0x0092700a,
]);
export const PGD_VRF_MAGIC_BYTES = 16;
export const PGD_VRF_COMPARE_DWORDS = 4;
export const PGD_VRF_COMPARE_BYTES = 16;
export const PGD_VRF_KIND_DIGIT_OFF = 12;
export const PGD_VRF_KIND_MIN = 6;
export const PGD_VRF_KIND_MAX = 9;
export const PGD_VRF_CHECKSUM_CALL_VA = 0x00927017;
export const PGD_VRF_CHECKSUM_SKIP_FRONT = 0x10;
export const PGD_VRF_CHECKSUM_SKIP_BACK = 4;
export const PGD_VRF_TRAILING_SEEK_VA = 0x0092702c;
export const PGD_VRF_TRAILING_READ_VA = 0x00927044;
export const PGD_VRF_TRAILING_CMP_VA = 0x00927046;
export const PGD_VRF_TRAILING_LOG_VA = 0x00b7ab0c;
export const PGD_VRF_HEADER_LOG_VA = 0x00b7ab3c;
export const PGD_VRF_OLD_VERSION_LOG_VA = 0x00b7aac8;
export const PGD_VRF_KIND_GATE_CMP_VA = 0x0092705f;
export const PGD_VRF_KIND_GATE_JA_VA = 0x00927062;
export const PGD_VRF_FAIL_RET_VA = 0x00927cb3;
export const PGD_VRF_SUCCESS_RET_VA = 0x00927c9c;
export const PGD_VRF_SAVE_COUNTER_OFF = 0xf88;
export const PGD_VRF_JUMP_TABLE_VA = 0x00927cd8;
export const PGD_VRF_JUMP_TABLE_ENTRIES = 11;
export const PGD_VRF_BOUNDS = Object.freeze([
  0x9, 0xa, 0xa, 0xb,
]);

/* The 16 bytes of each magic, byte-exact from the .rdata dump. */
const VRF_MAGIC_STRINGS = PGD_MAGIC_STRINGS;

/** Byte k of the variant-v magic, u8-gated. */
export function pgdVrfMagicByte(variant, index) {
  return pgdMagicByte(variant, index);
}

/** Dword j (0..3) of the variant-v magic, little-endian over the 16
 *  ASCII bytes. */
export function pgdVrfMagicDword(variant, dwordIndex) {
  const v = asI32(variant);
  const j = asI32(dwordIndex);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  if (j < 0 || j >= PGD_VRF_COMPARE_DWORDS) return 0;
  let w = 0;
  for (let b = 0; b < 4; ++b) {
    w |= asU8(VRF_MAGIC_STRINGS[v].charCodeAt(j * 4 + b)) << (8 * b);
  }
  return w >>> 0;
}

/** The FULL-DWORD first-match cascade: four dword compares per magic
 *  (the machine's `sub edi,4 ; jae` loop covers edi = 0xc,8,4,0 — the
 *  full 16 header bytes). Returns the variant index 0..3 or -1.
 *  A 12-byte (3-dword) compare would be WRONG: bytes 0..11 are shared
 *  by all four magics, so every valid header would resolve to kind 6
 *  and fail the too-old gate. */
export function pgdVrfMagicVariantDwords(d0, d1, d2, d3) {
  const want = [asU32(d0), asU32(d1), asU32(d2), asU32(d3)];
  for (let v = 0; v < PGD_MAGIC_VARIANTS; ++v) {
    let hit = true;
    for (let j = 0; j < PGD_VRF_COMPARE_DWORDS; ++j) {
      if (want[j] !== pgdVrfMagicDword(v, j)) {
        hit = false;
        break;
      }
    }
    if (hit) return v;
  }
  return -1;
}

/** Kind (version tag 6..9) selected by the full 16 header bytes, or 0
 *  when no magic matches. */
export function pgdVrfKindFromHeader(d0, d1, d2, d3) {
  const v = pgdVrfMagicVariantDwords(d0, d1, d2, d3);
  if (v < 0) return 0;
  return MAGIC_TABLE[v].version;
}

/** The kind digit byte (header[12] = '6'..'9') alone, u8-gated:
 *  0x36 -> 6 .. 0x39 -> 9, anything else -> 0. The machine never
 *  tests the digit alone (the dword compare does it), but the digit
 *  is the ONLY discriminating byte — exported so the byte-gate
 *  (uint32 + & 0xff) is driven with wide values 0x100/0x1ff. */
export function pgdVrfKindFromDigitByte(digitByte) {
  const b = asU8(digitByte);
  if (b >= 0x36 && b <= 0x39) return b - 0x30;
  return 0;
}

/** The exclusive section-id ceiling stored with the kind at the
 *  cascade tails: [ebp-0x44] = 9 / 0xa / 0xa / 0xb for kinds
 *  6/7/8/9 (store VAs 0x926f76 / 0x926fa6 / 0x926fd6 / 0x92700a);
 *  0 for any other kind. */
export function pgdVrfBoundForKind(kind) {
  const k = asI32(kind);
  if (k < PGD_VRF_KIND_MIN || k > PGD_VRF_KIND_MAX) return 0;
  return PGD_VRF_BOUNDS[k - PGD_VRF_KIND_MIN];
}

/** The trailing-dword compare `cmp [ebp-0x70],edi` @0x927046 — FULL
 *  u32 equality (no byte truncation: wide values 0x100/0x1ff compare
 *  as-is; a uint8_t-shaped param would wrongly pass 0x100 == 0). */
export function pgdVrfTrailingMatch(trailing, checksum) {
  return asU32(trailing) === asU32(checksum) ? 1 : 0;
}

/** The kind acceptance gate `cmp ebx,8 ; ja 0x927078` @0x92705f —
 *  UNSIGNED kind > 8. Kinds 6/7/8 fail with the "Unsuported save
 *  version" log (verbatim typo); only kind 9 proceeds. Wide drives
 *  (0x100/0x1ff) pass exactly like the unsigned compare. */
export function pgdVrfKindAccepted(kind) {
  return asU32(kind) > 8 ? 1 : 0;
}

/** Verify-open composite in the machine's order: kind selection
 *  FIRST (16 header bytes as four dwords with u8 byte-gates), THEN
 *  the region fold [0x10, size-4) (pgdChecksumRegionLen + the mode-1
 *  buffer fold — the 0x683580 core), THEN the trailing-dword compare
 *  (full u32). file = the whole save file (header + body + trailing
 *  dword); size = its byte length. Returns {kind, bound, ok,
 *  accepted, result}: ok is the pure trailing compare (kind-
 *  independent — the machine early-fails on the header BEFORE the
 *  compare); result is the machine's final decision — magic matched
 *  (kind 6..9) AND ok AND kind accepted — the three gates
 *  (header fail @0x927ca0, checksum fail @0x927049, too-old fail
 *  @0x927062) all funnel to xor al,al (@0x927cb3). */
export function pgdVrfVerifyOpen(file, size) {
  const n = asU32(size);
  const buf = file || [];
  const readU8 = (i) => (i < buf.length ? asU8(buf[i]) : 0);
  const readU32 = (i) =>
    asU32(readU8(i) | (readU8(i + 1) << 8) | (readU8(i + 2) << 16) | (readU8(i + 3) << 24));
  const kind = pgdVrfKindFromHeader(readU32(0), readU32(4), readU32(8), readU32(12));
  const regionLen = pgdChecksumRegionLen(n, PGD_VRF_CHECKSUM_SKIP_FRONT, PGD_VRF_CHECKSUM_SKIP_BACK);
  let checksum = PGD_CHECKSUM_SEED;
  if (regionLen > 0) {
    const region = [];
    /* u32 wrap on 0x10 + regionLen, exactly like the C++ uint32 add */
    const stop = Math.min(asU32(0x10 + regionLen), buf.length);
    for (let i = 0x10; i < stop; ++i) region.push(readU8(i));
    checksum = pgdChecksumBuffer(region, region.length, PGD_CHECKSUM_MODE_CRC);
  }
  const trailing = readU32(Math.max(0, n - 4));
  const ok = pgdVrfTrailingMatch(trailing, checksum);
  const accepted = pgdVrfKindAccepted(kind);
  const matched = kind >= PGD_VRF_KIND_MIN && kind <= PGD_VRF_KIND_MAX;
  return {
    kind,
    bound: pgdVrfBoundForKind(kind),
    ok,
    accepted,
    result: matched && ok === 1 && accepted === 1 ? 1 : 0,
  };
}

/* Pin accessors (mirrored in the cpp exports). */
export function pgdVrfVa() { return PGD_VRF_VA; }
export function pgdVrfRetVa() { return PGD_VRF_RET_VA; }
export function pgdVrfBodyBytes() { return PGD_VRF_BODY_BYTES; }
export function pgdVrfSehHandlerVa() { return PGD_VRF_SEH_HANDLER_VA; }
export function pgdVrfCookieVa() { return PGD_VRF_COOKIE_VA; }
export function pgdVrfInbound() { return PGD_VRF_INBOUND; }
export function pgdVrfReturnStack() { return PGD_VRF_RETURN_STACK; }
export function pgdVrfMagicVa(variant) {
  const v = asI32(variant);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  return PGD_VRF_MAGIC_VAS[v];
}
export function pgdVrfCompareLoopVa() { return PGD_VRF_COMPARE_LOOP_VA; }
export function pgdVrfCompareDwords() { return PGD_VRF_COMPARE_DWORDS; }
export function pgdVrfCompareBytes() { return PGD_VRF_COMPARE_BYTES; }
export function pgdVrfKindDigitOff() { return PGD_VRF_KIND_DIGIT_OFF; }
export function pgdVrfCascadeHeadVa(variant) {
  const v = asI32(variant);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  return PGD_VRF_CASCADE_HEAD_VAS[v];
}
export function pgdVrfKindStoreVa(variant) {
  const v = asI32(variant);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  return PGD_VRF_KIND_STORE_VAS[v];
}
export function pgdVrfBoundStoreVa(variant) {
  const v = asI32(variant);
  if (v < 0 || v >= PGD_MAGIC_VARIANTS) return 0;
  return PGD_VRF_BOUND_STORE_VAS[v];
}
export function pgdVrfChecksumCallVa() { return PGD_VRF_CHECKSUM_CALL_VA; }
export function pgdVrfChecksumSkipFront() { return PGD_VRF_CHECKSUM_SKIP_FRONT; }
export function pgdVrfChecksumSkipBack() { return PGD_VRF_CHECKSUM_SKIP_BACK; }
export function pgdVrfTrailingSeekVa() { return PGD_VRF_TRAILING_SEEK_VA; }
export function pgdVrfTrailingReadVa() { return PGD_VRF_TRAILING_READ_VA; }
export function pgdVrfTrailingCmpVa() { return PGD_VRF_TRAILING_CMP_VA; }
export function pgdVrfTrailingLogVa() { return PGD_VRF_TRAILING_LOG_VA; }
export function pgdVrfHeaderLogVa() { return PGD_VRF_HEADER_LOG_VA; }
export function pgdVrfOldVersionLogVa() { return PGD_VRF_OLD_VERSION_LOG_VA; }
export function pgdVrfKindGateCmpVa() { return PGD_VRF_KIND_GATE_CMP_VA; }
export function pgdVrfFailRetVa() { return PGD_VRF_FAIL_RET_VA; }
export function pgdVrfSuccessRetVa() { return PGD_VRF_SUCCESS_RET_VA; }
export function pgdVrfSaveCounterOff() { return PGD_VRF_SAVE_COUNTER_OFF; }
export function pgdVrfJumpTableVa() { return PGD_VRF_JUMP_TABLE_VA; }
export function pgdVrfJumpTableEntries() { return PGD_VRF_JUMP_TABLE_ENTRIES; }

/* ============================================================
   Helpers ABI v32 — PGDSAN + PGDGATE + PGDCNT: the post-load
   helpers 0x927d20 / 0x929820 / 0x92a350 (ABI 31 -> 32 atomic
   both sides; section-notes/pgd-v32-postload/).
   ============================================================ */

/* The post-LoadPersistentGameData chain (driver 0x926e90 call 0x926f10
   -> 0x927d20 -> 0x929820 -> 0x92a350) has three pure DECISION
   islands; the actions stay typed-host (TryUnlock 0x929a20, the
   event-counter 0x929b40 call + the 0x2a378 guard global, the item-
   map find 0x72fd10). */

/* ---------------- PGDSAN — post-verify sanitizer 0x927d20 --------
   `__thiscall void (PGD* ecx)`, ret 0 @0x9282d3, body
   0x927d20..0x9282d3 (BODY_BYTES 0x5b4 = 1460), int3 pad @0x9282d4.
   NO calls, NO vtbl, NO globals — PURE. Inbound 1 (driver
   0x926ea3). State: esi = u32 [this+0x2c0] (version); gate
   `cmp byte [this+0x3c],0` (a byte flag). 21 clamp blocks, each
   `*p = max(*p,1)` via `cmp [..],0x1 ; lea .. ; mov [ebp-4],1 ;
   cmovg` (SIGNED cmovg — a u32 >= 0x80000000 clamps to 1); every
   block ALSO clamps the shared counter [this+0xea8] (21 lea sites).
   Gates: B0 = byte-flag != 0; B1..B11 = version >= 1..0xb (SIGNED
   `cmp esi,imm ; jl`); B12..B20 = counter-source [0x2f0,0x2e8,0x320,
   0x31c,0x324,0x534,0x5a8,0xa68,0xa6c] >= 1 (SIGNED `jl`). Version
   gates share the skip target 0x928057 (the first counter gate);
   version < N skips the remaining version blocks and ENTERS the
   counter chain. The 0xea8 common clamp fires iff at least one block
   gate held. */
export const PGD_SAN_VA = 0x00927d20;
export const PGD_SAN_RET_VA = 0x009282d3;
export const PGD_SAN_BODY_BYTES = 0x5b4;
export const PGD_SAN_INBOUND = 1;
export const PGD_SAN_RETURN_STACK = 0;
export const PGD_SAN_VERSION_OFF = 0x2c0;
export const PGD_SAN_FLAG_OFF = 0x3c;
export const PGD_SAN_COMMON_OFF = 0xea8;
export const PGD_SAN_FLAG_FIELD = 0xeac;
export const PGD_SAN_VERSION_GATE_MINS = Object.freeze([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 0xa, 0xb,
]);
export const PGD_SAN_VERSION_FIELDS = Object.freeze([
  0xeb0, 0xeb4, 0xeb8, 0xebc, 0xec0, 0xec4, 0xec8, 0xecc, 0xed0,
  0xed4, 0xed8,
]);
export const PGD_SAN_COUNTER_SOURCES = Object.freeze([
  0x2f0, 0x2e8, 0x320, 0x31c, 0x324, 0x534, 0x5a8, 0xa68, 0xa6c,
]);
export const PGD_SAN_COUNTER_FIELDS = Object.freeze([
  0xedc, 0xee0, 0xee8, 0xee4, 0xeec, 0xef0, 0xef8, 0xf00, 0xf04,
]);
export const PGD_SAN_GATED_FIELDS = Object.freeze([
  0xeac, 0xeb0, 0xeb4, 0xeb8, 0xebc, 0xec0, 0xec4, 0xec8, 0xecc,
  0xed0, 0xed4, 0xed8, 0xedc, 0xee0, 0xee8, 0xee4, 0xeec, 0xef0,
  0xef8, 0xf00, 0xf04,
]);
export const PGD_SAN_FIELD_COUNT = 21;
export const PGD_SAN_FLAG_GATE_CMP_VA = 0x00927d28;
export const PGD_SAN_VERSION_GATE_VAS = Object.freeze([
  0x00927d94, 0x00927dd5, 0x00927e16, 0x00927e57, 0x00927e98,
  0x00927ed9, 0x00927f1a, 0x00927f5b, 0x00927f9c, 0x00927fdd,
  0x0092801a,
]);
export const PGD_SAN_COUNTER_GATE_VAS = Object.freeze([
  0x00928057, 0x00928098, 0x009280d9, 0x0092811a, 0x0092815b,
  0x0092819c, 0x009281dd, 0x0092821e, 0x0092825f,
]);
export const PGD_SAN_CLAMP_ROW_VAS = Object.freeze([
  0x00927d34, 0x00927d9d, 0x00927dde, 0x00927e1f, 0x00927e60,
  0x00927ea1, 0x00927ee2, 0x00927f23, 0x00927f64, 0x00927fa5,
  0x00927fe2, 0x0092801f, 0x00928060, 0x009280a1, 0x009280e2,
  0x00928123, 0x00928164, 0x009281a5, 0x009281e6, 0x00928227,
  0x00928268,
]);

/* The cmovg min-1 clamp: SIGNED `value > 1` keeps the value, else 1.
   A u32 value with the high bit set reads negative -> clamped to 1. */
export function pgdSanClampMin1(value) {
  return asI32(value) > 1 ? asU32(value) : 1;
}

/* The version-chain gates `cmp esi,min ; jl skip` — SIGNED. */
export function pgdSanVersionGate(version, min) {
  return asI32(version) >= asI32(min) ? 1 : 0;
}

/* The counter-chain gates `cmp [edi+G],0x1 ; jl skip` — SIGNED. */
export function pgdSanCounterGate(counter) {
  return asI32(counter) >= 1 ? 1 : 0;
}

/* The entry byte gate `cmp byte [edi+0x3c],0` — byte-gate: uint32
   param, & 0xff in the body (no uint8_t in the surface). */
export function pgdSanFlagGate(flag) {
  return asU8(flag) !== 0 ? 1 : 0;
}

/* Sanitizer composite in the machine's order. counterSources[9] =
   the [0x2f0..0xa6c] sources; fieldValues[21] = the gated fields
   (PGD_SAN_GATED_FIELDS order); commonValue = the shared 0xea8
   counter. Returns { fields (21 updated), common, fired (21) }. The
   common clamp fires iff at least one block gate held. */
export function pgdSanitizePostLoad(version, flagByte, counterSources,
                                    fieldValues, commonValue) {
  const src = (counterSources || []).map((v) => asU32(v));
  const out = (fieldValues || []).map((v) => asU32(v));
  const fired = new Array(PGD_SAN_FIELD_COUNT).fill(0);
  let any = 0;
  for (let i = 0; i < PGD_SAN_FIELD_COUNT; ++i) {
    if (out[i] === undefined) out[i] = 0;
  }
  const flag = pgdSanFlagGate(flagByte);
  fired[0] = flag;
  if (flag === 1) {
    out[0] = pgdSanClampMin1(out[0]);
    any = 1;
  }
  for (let k = 0; k < PGD_SAN_VERSION_GATE_MINS.length; ++k) {
    const g = pgdSanVersionGate(version, PGD_SAN_VERSION_GATE_MINS[k]);
    fired[1 + k] = g;
    if (g === 1) {
      out[1 + k] = pgdSanClampMin1(out[1 + k]);
      any = 1;
    }
  }
  for (let k = 0; k < PGD_SAN_COUNTER_SOURCES.length; ++k) {
    const g = pgdSanCounterGate(src[k]);
    fired[12 + k] = g;
    if (g === 1) {
      out[12 + k] = pgdSanClampMin1(out[12 + k]);
      any = 1;
    }
  }
  const common = asU32(commonValue);
  return {
    fields: out,
    common: any === 1 ? pgdSanClampMin1(common) : common,
    fired,
  };
}

/* ---- PGDGATE — post-load unlock gates 0x929820 -----------------
   `__thiscall void (PGD* ecx)`, ret 0 @0x9299d0, body
   0x929820..0x9299d0 (BODY_BYTES 0x1b1 = 433), int3 pad @0x9299d1.
   Inbound 1 (driver 0x926eaa). Prologue: the PGDTAIL event-counter
   guard — save [0xc7169c+0x2a378], zero it, `call 0x929b40` @0x92983e
   (this->IncreaseEventCounter(0,0) — the v28 PGDIEC laws are already
   landed; the CALL + the guard global stay HOST), epilogue restores
   the guard. Then 11 gate rows, each fires `push ID ; mov ecx,this ;
   call 0x929a20` (TryUnlock, TYPED-HOST — the laws below are the
   PURE passed-id decisions; TryUnlock's own owned-skip is effect
   side). Row semantics: A = !b[0x1] && b[0xb5c] && b[0xb27] &&
   b[0xc4c] -> 0x17d; B = !b[0x1] && b[0xc39] && b[0xbd0] -> 0x16b;
   C = !b[0x18c] && OR(u32 {0x35c,0x404,0x43c,0x474,0x394,0x3cc,
   0x530,0x4c0,0x4f8,0x5a4} > 0) -> 0x154; D = !b[0x18d] &&
   ([0x488]%1000 >= 500 || b[0x131]) -> 0x155 (the remainder via
   `mul 0x10624dd3 ; shr edx,6 ; imul 0x3e8 ; sub` — the 2^38/1000
   magic); E = u32[0x320] > 0 -> 0x15c; F = u32[0x5a8] > 0 -> 0x165;
   G..K = b[0x5d]/b[0x5e]/b[0x5f]/b[0x60]/b[0x189] != 0 ->
   0x15f/0x16d/0x170/0x176/0x168. A..K fire in order; the returned
   list is the machine's passed-id order. */
export const PGD_GATE_VA = 0x00929820;
export const PGD_GATE_RET_VA = 0x009299d0;
export const PGD_GATE_BODY_BYTES = 0x1b1;
export const PGD_GATE_INBOUND = 1;
export const PGD_GATE_RETURN_STACK = 0;
export const PGD_GATE_GUARD_GLOBAL_VA = 0x00c7169c;
export const PGD_GATE_GUARD_OFF = 0x2a378;
export const PGD_GATE_EVENT_COUNTER_CALL_VA = 0x0092983e;
export const PGD_GATE_EVENT_COUNTER_TARGET_VA = 0x00929b40;
export const PGD_GATE_TRY_UNLOCK_VA = 0x00929a20;
export const PGD_GATE_DIV_MAGIC = 0x10624dd3; /* 2^38 / 1000 */
export const PGD_GATE_DIV_SHIFT = 38;
export const PGD_GATE_RUNS_DIVISOR = 1000;
export const PGD_GATE_RUNS_THRESHOLD = 0x1f4;
export const PGD_GATE_COUNTER_FIELDS = Object.freeze([
  0x35c, 0x404, 0x43c, 0x474, 0x394, 0x3cc, 0x530, 0x4c0, 0x4f8,
  0x5a4,
]);
export const PGD_GATE_RUNS_FIELD = 0x488;
export const PGD_GATE_ROW_COUNT = 11;
export const PGD_GATE_ROW_GATE_VAS = Object.freeze([
  0x00929843, 0x00929870, 0x0092988e, 0x009298fd, 0x0092993b,
  0x00929950, 0x00929965, 0x00929977, 0x00929989, 0x0092999b,
  0x009299ad,
]);
export const PGD_GATE_ROW_IDS = Object.freeze([
  0x17d, 0x16b, 0x154, 0x155, 0x15c, 0x165, 0x15f, 0x16d, 0x170,
  0x176, 0x168,
]);
export const PGD_GATE_ROW_CALL_VAS = Object.freeze([
  0x0092986b, 0x00929889, 0x009298f8, 0x00929936, 0x0092994b,
  0x00929960, 0x00929972, 0x00929984, 0x00929996, 0x009299a8,
  0x009299bd,
]);
export const PGD_GATE_KIND_AND4 = 0;
export const PGD_GATE_KIND_AND3 = 1;
export const PGD_GATE_KIND_BYTEINV_ANY10 = 2;
export const PGD_GATE_KIND_BYTEINV_RUNS = 3;
export const PGD_GATE_KIND_U32GT = 4;
export const PGD_GATE_KIND_BYTESET = 5;
export const PGD_GATE_ROW_KINDS = Object.freeze([
  PGD_GATE_KIND_AND4, PGD_GATE_KIND_AND3,
  PGD_GATE_KIND_BYTEINV_ANY10, PGD_GATE_KIND_BYTEINV_RUNS,
  PGD_GATE_KIND_U32GT, PGD_GATE_KIND_U32GT, PGD_GATE_KIND_BYTESET,
  PGD_GATE_KIND_BYTESET, PGD_GATE_KIND_BYTESET, PGD_GATE_KIND_BYTESET,
  PGD_GATE_KIND_BYTESET,
]);
/* Flat composite input slots (27): the C++ mirror takes the same
   layout; byte slots are u32 values narrowed & 0xff in the body. */
export const PGD_GATE_FIELD_SLOTS = Object.freeze([
  "byte1", "b5c", "b27", "c4c", "c39", "bd0", "b18c", "c0", "c1",
  "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "b18d", "runs",
  "b131", "c320", "c5a8", "b5d", "b5e", "b5f", "b60", "b189",
]);
export const PGD_GATE_FIELD_COUNT = PGD_GATE_FIELD_SLOTS.length;

/* Byte-set gate `cmp byte [..],0` — & 0xff in the body. */
export function pgdGateByteSet(value) {
  return asU8(value) !== 0 ? 1 : 0;
}

/* Byte-clear gate (the `je skip` rows / inverted first byte). */
export function pgdGateByteClear(value) {
  return asU8(value) === 0 ? 1 : 0;
}

/* u32 > 0 gate (`ja`/`jbe` rows) — full width, no truncation. */
export function pgdGateU32Gt(value) {
  return asU32(value) > 0 ? 1 : 0;
}

/* Row-C OR: any of the ten u32 counters > 0 (UNSIGNED). */
export function pgdGateAnyCounter(values) {
  return (values || []).some((v) => asU32(v) > 0) ? 1 : 0;
}

/* [0x488] % 1000 via the PE's `mul 0x10624dd3 ; shr edx,6 ;
   imul edx,1000 ; sub ecx,eax` (u32; BigInt for exactness). */
export function pgdGateRunsRemainder(value) {
  const v = BigInt(asU32(value));
  const q = (v * BigInt(PGD_GATE_DIV_MAGIC)) >> BigInt(PGD_GATE_DIV_SHIFT);
  return Number(v - q * BigInt(PGD_GATE_RUNS_DIVISOR));
}

/* Row-D condition: `cmp ecx,0x1f4 ; jge` (remainder >= 500, signed
   jge — remainder < 1000 so sign never matters) OR b[0x131] set. */
export function pgdGateRuns1000(value, flag131) {
  return pgdGateRunsRemainder(value) >= PGD_GATE_RUNS_THRESHOLD ||
         pgdGateByteSet(flag131) === 1
    ? 1
    : 0;
}

/* Per-row predicates (the C++ mirrors take explicit params). */
export function pgdGateRowA(byte1, b5c, b27, c4c) {
  return pgdGateByteClear(byte1) === 1 && pgdGateByteSet(b5c) === 1 &&
         pgdGateByteSet(b27) === 1 && pgdGateByteSet(c4c) === 1
    ? 1 : 0;
}
export function pgdGateRowB(byte1, c39, bd0) {
  return pgdGateByteClear(byte1) === 1 && pgdGateByteSet(c39) === 1 &&
         pgdGateByteSet(bd0) === 1
    ? 1 : 0;
}
export function pgdGateRowC(b18c, counters) {
  return pgdGateByteClear(b18c) === 1 && pgdGateAnyCounter(counters) === 1
    ? 1 : 0;
}
export function pgdGateRowD(b18d, runs, b131) {
  return pgdGateByteClear(b18d) === 1 && pgdGateRuns1000(runs, b131) === 1
    ? 1 : 0;
}
export function pgdGateRowE(c320) { return pgdGateU32Gt(c320); }
export function pgdGateRowF(c5a8) { return pgdGateU32Gt(c5a8); }

/* The 11-row composite: input = { byte1, b5c, b27, c4c, c39, bd0,
   b18c, counters[10], b18d, runs, b131, c320, c5a8, b5d, b5e, b5f,
   b60, b189 } -> the ordered passed-id list (PGD_GATE_ROW_IDS order
   = the machine's A..K call order). */
export function pgdPostLoadGates(input) {
  const o = input || {};
  const u = (x) => (x === undefined ? 0 : asU32(x));
  const ids = [];
  if (pgdGateRowA(u(o.byte1), u(o.b5c), u(o.b27), u(o.c4c)) === 1) {
    ids.push(PGD_GATE_ROW_IDS[0]);
  }
  if (pgdGateRowB(u(o.byte1), u(o.c39), u(o.bd0)) === 1) {
    ids.push(PGD_GATE_ROW_IDS[1]);
  }
  if (pgdGateRowC(u(o.b18c), o.counters) === 1) {
    ids.push(PGD_GATE_ROW_IDS[2]);
  }
  if (pgdGateRowD(u(o.b18d), u(o.runs), u(o.b131)) === 1) {
    ids.push(PGD_GATE_ROW_IDS[3]);
  }
  if (pgdGateU32Gt(u(o.c320)) === 1) ids.push(PGD_GATE_ROW_IDS[4]);
  if (pgdGateU32Gt(u(o.c5a8)) === 1) ids.push(PGD_GATE_ROW_IDS[5]);
  const tail = ["b5d", "b5e", "b5f", "b60", "b189"];
  for (let i = 0; i < tail.length; ++i) {
    if (pgdGateByteSet(u(o[tail[i]])) === 1) {
      ids.push(PGD_GATE_ROW_IDS[6 + i]);
    }
  }
  return ids;
}

/* ---- PGDCNT — post-load count/threshold unlocks 0x92a350 --------
   `__thiscall void (PGD* ecx)`, ret 0 @0x92a510, body
   0x92a350..0x92a510 (BODY_BYTES 0x1c1 = 449), int3 pad @0x92a511.
   Inbound 6 (0x926eb1 driver / 0x929a81 TryUnlock tail / 0x92a2ff
   wrapper / 0x92b014 award path / 0x759b6f + 0x76335e OUTSIDE the
   save cluster). Loop 1 ids 1..0x2dc (SIGNED `cmp esi,0x2dd ; jl`):
   byte[this+id+0xae8] (the R4 item-collection flags, model
   PGD_OFF_ITEM_COLLECTION) != 0 -> total++ and ach +=
   asU32(id) <= 0x15a (cmova cap, UNSIGNED); else SPECIAL
   {0x114,0x14d,0x14e,0x14f,0x11b,0x14b} (eq cascade) -> special++;
   else host item-map find 0x72fd10 ([0xc7169c]+0x2a404, key id):
   hit AND byte[hit+0xb3] != 0 -> same count as the flag-set row
   (find + b3 HOST; the law takes a countableItem[] predicate).
   T1 (0x92a408): (special + ach) >= 0x15a SIGNED -> c1 = #nonzero
   ach bytes [0x38+1..0x38+0xb2] (SIGNED `jle`), c2 = #BADGE
   {0x52,0x54,0x81..0x85,0x9c,0xaf} ids NOT yet owned in the same
   range (the eq cascade only reached when the byte is 0); c1+c2 >=
   0xb1 -> unlock 0x45; c1 >= 0xb1 AND special == 0 -> unlock 0x54.
   T2 (0x92a4a1): total >= 0x1fe SIGNED -> c3 = #nonzero ach bytes
   [0x38+1..0x38+0x281] (SIGNED `cmp ecx,0x282 ; jl`; cmove accum);
   c3 >= 0x113 -> unlock 0xeb; c3 >= 0x192 -> unlock 0x153; total >=
   0x2dc AND c3 >= 0x280 -> unlock 0x27d. ids in machine order
   [0x45, 0x54, 0xeb, 0x153, 0x27d]. */
export const PGD_CNT_VA = 0x0092a350;
export const PGD_CNT_RET_VA = 0x0092a510;
export const PGD_CNT_BODY_BYTES = 0x1c1;
export const PGD_CNT_INBOUND = 6;
export const PGD_CNT_RETURN_STACK = 0;
export const PGD_CNT_ITEM_FLAG_OFF = 0xae8;
export const PGD_CNT_ACH_OFF = 0x38;
export const PGD_CNT_ITEM_LOOP_HI = 0x2dc;
export const PGD_CNT_ACH_CAP = 0x15a;
export const PGD_CNT_SPECIAL_IDS = Object.freeze([
  0x114, 0x14d, 0x14e, 0x14f, 0x11b, 0x14b,
]);
export const PGD_CNT_BADGE_IDS = Object.freeze([
  0x52, 0x54, 0x81, 0x82, 0x83, 0x84, 0x85, 0x9c, 0xaf,
]);
export const PGD_CNT_BADGE_LO = 1;
export const PGD_CNT_BADGE_HI = 0xb2;
export const PGD_CNT_ACH_COUNT_LO = 1;
export const PGD_CNT_ACH_COUNT_HI = 0x281;
export const PGD_CNT_T1 = 0x15a;
export const PGD_CNT_T1B = 0xb1;
export const PGD_CNT_T1C = 0xb1;
export const PGD_CNT_T2 = 0x1fe;
export const PGD_CNT_T3 = 0x113;
export const PGD_CNT_T4 = 0x192;
export const PGD_CNT_T5 = 0x2dc;
export const PGD_CNT_T6 = 0x280;
export const PGD_CNT_UNLOCK_IDS = Object.freeze([
  0x45, 0x54, 0xeb, 0x153, 0x27d,
]);
export const PGD_CNT_MAP_GLOBAL_VA = 0x00c7169c;
export const PGD_CNT_MAP_OFF = 0x2a404;
export const PGD_CNT_MAP_FIND_VA = 0x0072fd10;
export const PGD_CNT_B3_OFF = 0xb3;

/* Byte-gated read of the R4 item-flag array (id 1..0x2dc; & 0xff). */
export function pgdCntItemFlag(flags, id) {
  const i = asI32(id);
  if (i < 1 || i > PGD_CNT_ITEM_LOOP_HI) return 0;
  return flags && flags[i] !== undefined ? asU8(flags[i]) : 0;
}

/* Special-id test (the 6-id eq cascade @0x92a38b..0x92a3bf). */
export function pgdCntSpecial(id) {
  return PGD_CNT_SPECIAL_IDS.includes(asU32(id)) ? 1 : 0;
}

/* Badge-id test (the 9-id eq cascade @0x92a432..0x92a46b). */
export function pgdCntBadge(id) {
  return PGD_CNT_BADGE_IDS.includes(asU32(id)) ? 1 : 0;
}

/* #nonzero bytes over ids lo..hi inclusive (the SIGNED jl/jle loop
   bounds; byte-gated & 0xff reads). */
export function pgdCntCountNonzero(array, lo, hi) {
  let n = 0;
  for (let id = asI32(lo); id <= asI32(hi); ++id) {
    if (array && array[id] !== undefined && asU8(array[id]) !== 0) n += 1;
  }
  return n;
}

/* #badge ids with byte == 0 over ids lo..hi (the c2 law — the eq
   cascade is only reached when the owned byte is 0). */
export function pgdCntCountBadges(array, lo, hi) {
  let n = 0;
  for (let id = asI32(lo); id <= asI32(hi); ++id) {
    const v = array && array[id] !== undefined ? asU8(array[id]) : 0;
    if (v === 0 && pgdCntBadge(id) === 1) n += 1;
  }
  return n;
}

/* Threshold fire `cmp count,min ; jl skip` — SIGNED. */
export function pgdCntFire(count, min) {
  return asI32(count) >= asI32(min) ? 1 : 0;
}

/* Composite: itemFlags[] (1-based at index id), ach[] (achievement
   bytes, 1-based), countable[] (the host item-map hit AND b3
   predicate, 1-based 0/1). Returns {total, ach, special, c1, c2,
   c3, ids}: c1/c2 are only computed when T1 fires, c3 only when T2
   fires (0 otherwise — the machine never computes them), ids in the
   machine's call order. */
export function pgdPostLoadCounts(itemFlags, ach, countable) {
  let total = 0;
  let achC = 0;
  let special = 0;
  for (let id = 1; id <= PGD_CNT_ITEM_LOOP_HI; ++id) {
    let counted = 0;
    if (pgdCntItemFlag(itemFlags, id) !== 0) {
      counted = 1;
    } else if (pgdCntSpecial(id) === 1) {
      special += 1;
    } else if (
      countable && countable[id] !== undefined && asU8(countable[id]) !== 0
    ) {
      counted = 1;
    }
    if (counted === 1) {
      total += 1;
      if (asU32(id) <= PGD_CNT_ACH_CAP) achC += 1;
    }
  }
  const ids = [];
  let c1 = 0;
  let c2 = 0;
  if (pgdCntFire(special + achC, PGD_CNT_T1) === 1) {
    c1 = pgdCntCountNonzero(ach, PGD_CNT_BADGE_LO, PGD_CNT_BADGE_HI);
    c2 = pgdCntCountBadges(ach, PGD_CNT_BADGE_LO, PGD_CNT_BADGE_HI);
    if (pgdCntFire(c1 + c2, PGD_CNT_T1B) === 1) ids.push(PGD_CNT_UNLOCK_IDS[0]);
    if (pgdCntFire(c1, PGD_CNT_T1C) === 1 && special === 0) {
      ids.push(PGD_CNT_UNLOCK_IDS[1]);
    }
  }
  let c3 = 0;
  if (pgdCntFire(total, PGD_CNT_T2) === 1) {
    c3 = pgdCntCountNonzero(ach, PGD_CNT_ACH_COUNT_LO, PGD_CNT_ACH_COUNT_HI);
    if (pgdCntFire(c3, PGD_CNT_T3) === 1) ids.push(PGD_CNT_UNLOCK_IDS[2]);
    if (pgdCntFire(c3, PGD_CNT_T4) === 1) ids.push(PGD_CNT_UNLOCK_IDS[3]);
    if (pgdCntFire(total, PGD_CNT_T5) === 1 &&
        pgdCntFire(c3, PGD_CNT_T6) === 1) {
      ids.push(PGD_CNT_UNLOCK_IDS[4]);
    }
  }
  return { total, ach: achC, special, c1, c2, c3, ids };
}

/* Pin accessors (mirrored in the cpp exports). */
export function pgdSanVa() { return PGD_SAN_VA; }
export function pgdSanRetVa() { return PGD_SAN_RET_VA; }
export function pgdSanBodyBytes() { return PGD_SAN_BODY_BYTES; }
export function pgdSanInbound() { return PGD_SAN_INBOUND; }
export function pgdSanReturnStack() { return PGD_SAN_RETURN_STACK; }
export function pgdSanVersionOff() { return PGD_SAN_VERSION_OFF; }
export function pgdSanFlagOff() { return PGD_SAN_FLAG_OFF; }
export function pgdSanCommonOff() { return PGD_SAN_COMMON_OFF; }
export function pgdSanFlagField() { return PGD_SAN_FLAG_FIELD; }
export function pgdSanVersionGateMins() { return PGD_SAN_VERSION_GATE_MINS; }
export function pgdSanVersionGateMin(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_SAN_VERSION_GATE_MINS.length) return 0;
  return PGD_SAN_VERSION_GATE_MINS[i];
}
export function pgdSanVersionFields() { return PGD_SAN_VERSION_FIELDS; }
export function pgdSanCounterSources() { return PGD_SAN_COUNTER_SOURCES; }
export function pgdSanCounterFields() { return PGD_SAN_COUNTER_FIELDS; }
export function pgdSanGatedFields() { return PGD_SAN_GATED_FIELDS; }
export function pgdSanFieldCount() { return PGD_SAN_FIELD_COUNT; }
export function pgdSanFlagGateCmpVa() { return PGD_SAN_FLAG_GATE_CMP_VA; }
export function pgdSanVersionGateVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_SAN_VERSION_GATE_VAS.length) return 0;
  return PGD_SAN_VERSION_GATE_VAS[i];
}
export function pgdSanCounterGateVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_SAN_COUNTER_GATE_VAS.length) return 0;
  return PGD_SAN_COUNTER_GATE_VAS[i];
}
export function pgdSanClampRowVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_SAN_CLAMP_ROW_VAS.length) return 0;
  return PGD_SAN_CLAMP_ROW_VAS[i];
}

export function pgdGateVa() { return PGD_GATE_VA; }
export function pgdGateRetVa() { return PGD_GATE_RET_VA; }
export function pgdGateBodyBytes() { return PGD_GATE_BODY_BYTES; }
export function pgdGateInbound() { return PGD_GATE_INBOUND; }
export function pgdGateReturnStack() { return PGD_GATE_RETURN_STACK; }
export function pgdGateGuardGlobalVa() { return PGD_GATE_GUARD_GLOBAL_VA; }
export function pgdGateGuardOff() { return PGD_GATE_GUARD_OFF; }
export function pgdGateEventCounterCallVa() { return PGD_GATE_EVENT_COUNTER_CALL_VA; }
export function pgdGateEventCounterTargetVa() { return PGD_GATE_EVENT_COUNTER_TARGET_VA; }
export function pgdGateTryUnlockVa() { return PGD_GATE_TRY_UNLOCK_VA; }
export function pgdGateDivMagic() { return PGD_GATE_DIV_MAGIC; }
export function pgdGateDivShift() { return PGD_GATE_DIV_SHIFT; }
export function pgdGateRunsDivisor() { return PGD_GATE_RUNS_DIVISOR; }
export function pgdGateRunsThreshold() { return PGD_GATE_RUNS_THRESHOLD; }
export function pgdGateCounterFields() { return PGD_GATE_COUNTER_FIELDS; }
export function pgdGateRunsField() { return PGD_GATE_RUNS_FIELD; }
export function pgdGateRowCount() { return PGD_GATE_ROW_COUNT; }
export function pgdGateRowGateVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_GATE_ROW_GATE_VAS.length) return 0;
  return PGD_GATE_ROW_GATE_VAS[i];
}
export function pgdGateRowId(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_GATE_ROW_IDS.length) return 0;
  return PGD_GATE_ROW_IDS[i];
}
export function pgdGateRowCallVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_GATE_ROW_CALL_VAS.length) return 0;
  return PGD_GATE_ROW_CALL_VAS[i];
}
export function pgdGateRowKind(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_GATE_ROW_KINDS.length) return 0;
  return PGD_GATE_ROW_KINDS[i];
}
export function pgdGateFieldSlots() { return PGD_GATE_FIELD_SLOTS; }
export function pgdGateFieldCount() { return PGD_GATE_FIELD_COUNT; }

export function pgdCntVa() { return PGD_CNT_VA; }
export function pgdCntRetVa() { return PGD_CNT_RET_VA; }
export function pgdCntBodyBytes() { return PGD_CNT_BODY_BYTES; }
export function pgdCntInbound() { return PGD_CNT_INBOUND; }
export function pgdCntReturnStack() { return PGD_CNT_RETURN_STACK; }
export function pgdCntItemFlagOff() { return PGD_CNT_ITEM_FLAG_OFF; }
export function pgdCntAchOff() { return PGD_CNT_ACH_OFF; }
export function pgdCntItemLoopHi() { return PGD_CNT_ITEM_LOOP_HI; }
export function pgdCntAchCap() { return PGD_CNT_ACH_CAP; }
export function pgdCntSpecialIds() { return PGD_CNT_SPECIAL_IDS; }
export function pgdCntSpecialId(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_CNT_SPECIAL_IDS.length) return 0;
  return PGD_CNT_SPECIAL_IDS[i];
}
export function pgdCntBadgeIds() { return PGD_CNT_BADGE_IDS; }
export function pgdCntBadgeId(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_CNT_BADGE_IDS.length) return 0;
  return PGD_CNT_BADGE_IDS[i];
}
export function pgdCntBadgeLo() { return PGD_CNT_BADGE_LO; }
export function pgdCntBadgeHi() { return PGD_CNT_BADGE_HI; }
export function pgdCntAchCountLo() { return PGD_CNT_ACH_COUNT_LO; }
export function pgdCntAchCountHi() { return PGD_CNT_ACH_COUNT_HI; }
export function pgdCntT1() { return PGD_CNT_T1; }
export function pgdCntT1B() { return PGD_CNT_T1B; }
export function pgdCntT1C() { return PGD_CNT_T1C; }
export function pgdCntT2() { return PGD_CNT_T2; }
export function pgdCntT3() { return PGD_CNT_T3; }
export function pgdCntT4() { return PGD_CNT_T4; }
export function pgdCntT5() { return PGD_CNT_T5; }
export function pgdCntT6() { return PGD_CNT_T6; }
export function pgdCntUnlockIds() { return PGD_CNT_UNLOCK_IDS; }
export function pgdCntUnlockId(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_CNT_UNLOCK_IDS.length) return 0;
  return PGD_CNT_UNLOCK_IDS[i];
}
export function pgdCntMapGlobalVa() { return PGD_CNT_MAP_GLOBAL_VA; }
export function pgdCntMapOff() { return PGD_CNT_MAP_OFF; }
export function pgdCntMapFindVa() { return PGD_CNT_MAP_FIND_VA; }
export function pgdCntB3Off() { return PGD_CNT_B3_OFF; }

/* ============================================================
   Helpers ABI v33 — PGDRO + PGDUNL + PGDADDIT: the
   TryUnlock-adjacent decision islands 0x9299e0 / 0x929aa0 /
   0x92a2d0 (section-notes/pgd-v33-islands/; ABI 32 -> 33 atomic
   both sides). PGDRO = SetReadOnly 0x9299e0 (ret 4 @0x929a0f, body
   0x33, inbound 4 — 0x7fc735/0x7fc78c/0x7fc7e3/0x95a780): low-byte
   cmove string choice ("True" 0xb64ff0 iff (value & 0xff) != 0 else
   "False" 0xb7af24) + the this[1] = value & 0xff store — the family's
   ONLY writer of the readonly byte; the cdecl log 0xa112c0 (argc 1,
   format 0xb7aef8) stays host. PGDUNL = Unlocked 0x929aa0 (EXACT ZHL
   9B, ret 4 @0x929af0, body 0x53, inbound 32, ZERO calls): the
   machine-order law is the v1 pgdUnlocked RE-VERIFIED byte-exact
   (sentinel -2 first; signed negative -> true; UNSIGNED window
   asU32 < 0x282; id==0 -> true BEFORE the ach byte read; ach byte
   gate; mode dword [0xc7169c]+8 == 2; Game* [0xc71678] null gate;
   [Game+0x26630] UNSIGNED > 0; [Game+0x26589] byte); the game
   globals are host inputs. PGDADDIT = AddToCollection 0x92a2d0
   (EXACT ZHL 15B, ret 4 @0x92a34c, body 0x7e, inbound 6 — 0x6eba64 /
   0x75f3d4 / 0x79c17f / 0x7a3f84 / 0x7a40ab / 0x90d458): readonly
   entry gate + UNSIGNED window asU32 <= 0x2dc + id==0 skip + owned
   skip -> items[0xae8]=1 + dirty[0]=1 + the 0x92a350 count machine
   @0x92a2ff, then the PGDGATE-A/B duplicate rows without the inline
   byte1 re-check, window-gated: b5c/b27/c4c -> 0x17d @0x92a326 and
   c39/bd0 -> 0x16b @0x92a344; 0x92a350 + TryUnlock 0x929a20 stay
   host. The v2 collection laws (pgdCollectionIndexValid /
   pgdCollectionStoreNeeded) are re-verified byte-exact against this
   machine.
   ============================================================ */

/* ---- PGDRO — SetReadOnly 0x9299e0 ---- */
export const PGD_RO_VA = 0x009299e0;
export const PGD_RO_RET_VA = 0x00929a0f;
export const PGD_RO_BODY_BYTES = 0x33;
export const PGD_RO_INBOUND = 4;
export const PGD_RO_RETURN_STACK = 4;
export const PGD_RO_READONLY_OFF = 0x01;
export const PGD_RO_LOG_VA = 0x00b7aef8;
export const PGD_RO_STRING_TRUE_VA = 0x00b64ff0;
export const PGD_RO_STRING_FALSE_VA = 0x00b7af24;
export const PGD_RO_LOG_CALL_VA = 0x00a112c0;
export const PGD_RO_CMP_CMOVE_VA = 0x009299ef;
export const PGD_RO_STORE_VA = 0x00929a09;
export const PGD_RO_CALL_SITE_VAS = Object.freeze([
  0x007fc735, 0x007fc78c, 0x007fc7e3, 0x0095a780,
]);

/* The stored readonly byte: `mov bl, byte [ebp+8]` then
   `mov byte [esi+1], bl` — value & 0xff (wide args narrowed). */
export function pgdRoEffectiveValue(value) {
  return asU8(value);
}

/* The cmove string choice: `test bl,bl ; cmove eax,"False"` —
   "True" iff the LOW byte is nonzero. */
export function pgdRoLogsTrue(value) {
  return asU8(value) !== 0 ? 1 : 0;
}

export function pgdRoStringChoiceVa(value) {
  return pgdRoLogsTrue(value) === 1
    ? PGD_RO_STRING_TRUE_VA
    : PGD_RO_STRING_FALSE_VA;
}

/* ---- PGDUNL — Unlocked 0x929aa0 ---- */
export const PGD_UNL_VA = 0x00929aa0;
export const PGD_UNL_RET_VA = 0x00929af0;
export const PGD_UNL_BODY_BYTES = 0x53;
export const PGD_UNL_INBOUND = 32;
export const PGD_UNL_RETURN_STACK = 4;
export const PGD_UNL_ACH_OFF = PGD_OFF_ACHIEVEMENTS;
export const PGD_UNL_INDEX_HI = PGD_COUNT_ACHIEVEMENTS;
export const PGD_UNL_GATE_VAS = Object.freeze([
  /* sentinel -2 | signed-neg | UNSIGNED window | id==0 | ach byte | */
  0x00929aa6, 0x00929aab, 0x00929ab5, 0x00929abc, 0x00929ac0,
  /* mode dword | Game* null | +0x26630 | +0x26589 */
  0x00929acc, 0x00929ad7, 0x00929adb, 0x00929ae4,
]);
export const PGD_UNL_TRUE_TAIL_VA = 0x00929aaf;
export const PGD_UNL_FALSE_TAIL_VA = 0x00929aed;
export const PGD_UNL_CALL_SITE_VAS = Object.freeze([
  0x004226d2, 0x004227b0, 0x00422dc5, 0x005b590e, 0x005b5939,
  0x005b5964, 0x005b5b13, 0x005b84f4, 0x005bb934, 0x005be4d5,
  0x0065f66f, 0x006607e4, 0x00660855, 0x0066fe2c, 0x00730669,
  0x00730b0b, 0x00730b73, 0x00736370, 0x00775d5c, 0x00775d86,
  0x00795390, 0x007b3184, 0x007b36b3, 0x007c2fa1, 0x007ec477,
  0x007ec75b, 0x008e21de, 0x00946d1e, 0x0095a9a3, 0x009b9a64,
  0x009edf19, 0x009edf92,
]);

/* The machine-order decision law — the v1 pgdUnlocked RE-VERIFIED
   byte-exact this unit (sentinel-first; the id==0 row runs before the
   ach byte read; the ach byte and the 0x26589 byte are byte-gated
   & 0xff; the window and the +0x26630 test are UNSIGNED). */

/* ---- PGDADDIT — AddToCollection 0x92a2d0 ---- */
export const PGD_ADDIT_VA = 0x0092a2d0;
export const PGD_ADDIT_RET_VA = 0x0092a34c;
export const PGD_ADDIT_BODY_BYTES = 0x7e;
export const PGD_ADDIT_INBOUND = 6;
export const PGD_ADDIT_RETURN_STACK = 4;
export const PGD_ADDIT_COUNT_CALL_VA = PGD_CNT_VA;
export const PGD_ADDIT_COUNT_CALL_SITE_VA = 0x0092a2ff;
export const PGD_ADDIT_TRY_UNLOCK_VA = 0x00929a20;
export const PGD_ADDIT_WINDOW_HI = PGD_CNT_ITEM_LOOP_HI;
export const PGD_ADDIT_ITEM_FLAG_OFF = PGD_CNT_ITEM_FLAG_OFF;
export const PGD_ADDIT_DIRTY_OFF = 0x00;
export const PGD_ADDIT_ROW_A_ID = 0x17d;
export const PGD_ADDIT_ROW_B_ID = 0x16b;
export const PGD_ADDIT_ROW_A_CALL_VA = 0x0092a326;
export const PGD_ADDIT_ROW_B_CALL_VA = 0x0092a344;
export const PGD_ADDIT_ROW_A_GATE_VAS = Object.freeze([
  0x0092a304, 0x0092a30d, 0x0092a316,
]);
export const PGD_ADDIT_ROW_B_GATE_VAS = Object.freeze([
  0x0092a32b, 0x0092a334,
]);
export const PGD_ADDIT_GATE_FIELD_OFFS = Object.freeze([
  0xb5c, 0xb27, 0xc4c, 0xc39, 0xbd0,
]);
export const PGD_ADDIT_ENTRY_GATE_VA = 0x0092a2d9;
export const PGD_ADDIT_WINDOW_GATE_VA = 0x0092a2df;
export const PGD_ADDIT_ID0_SKIP_VA = 0x0092a2e6;
export const PGD_ADDIT_OWNED_GATE_VA = 0x0092a2ea;
export const PGD_ADDIT_FLAG_STORE_VA = 0x0092a2f4;
export const PGD_ADDIT_DIRTY_STORE_VA = 0x0092a2fc;
export const PGD_ADDIT_CALL_SITE_VAS = Object.freeze([
  0x006eba64, 0x0075f3d4, 0x0079c17f, 0x007a3f84, 0x007a40ab,
  0x0090d458,
]);

/* The `cmp eax,0x2dc ; ja` window — UNSIGNED (all negatives reject). */
export function pgdAddToCollectionWindowValid(collectibleId) {
  return asU32(collectibleId) <= PGD_ADDIT_WINDOW_HI ? 1 : 0;
}

/* The store path: readonly entry gate + window + id != 0 (`test
   eax,eax ; je` skip) + owned byte == 0. */
export function pgdAddToCollectionStoreFires(readonly, collectibleId,
                                             ownedByte) {
  if (asU8(readonly) !== 0) return 0;
  if (pgdAddToCollectionWindowValid(collectibleId) === 0) return 0;
  if (asI32(collectibleId) === 0) return 0;
  return asU8(ownedByte) === 0 ? 1 : 0;
}

/* The 0x92a350 count-machine call @0x92a2ff fires iff the store path
   runs (it is the last statement of the store block). */
export function pgdAddToCollectionCountMachineFires(readonly,
                                                    collectibleId,
                                                    ownedByte) {
  return pgdAddToCollectionStoreFires(readonly, collectibleId, ownedByte);
}

/* Row A = the PGDGATE row-A conditions WITHOUT the inline byte1
   re-check (the readonly entry gate holds it) but WITH the window
   gate (`ja` -> the tail runs nothing). -> TryUnlock 0x17d. */
export function pgdAddToCollectionRowA(readonly, collectibleId, b5c,
                                       b27, c4c) {
  if (asU8(readonly) !== 0) return 0;
  if (pgdAddToCollectionWindowValid(collectibleId) === 0) return 0;
  return pgdGateByteSet(b5c) === 1 && pgdGateByteSet(b27) === 1 &&
         pgdGateByteSet(c4c) === 1
    ? 1
    : 0;
}

/* Row B = the same shape -> TryUnlock 0x16b. */
export function pgdAddToCollectionRowB(readonly, collectibleId, c39,
                                       bd0) {
  if (asU8(readonly) !== 0) return 0;
  if (pgdAddToCollectionWindowValid(collectibleId) === 0) return 0;
  return pgdGateByteSet(c39) === 1 && pgdGateByteSet(bd0) === 1 ? 1 : 0;
}

/* The body composite in machine order. */
export function pgdAddToCollectionDecisions(readonly, collectibleId,
                                            ownedByte, b5c, b27, c4c,
                                            c39, bd0) {
  const store = pgdAddToCollectionStoreFires(readonly, collectibleId,
                                             ownedByte);
  return {
    store,
    count: pgdAddToCollectionCountMachineFires(readonly, collectibleId,
                                               ownedByte),
    rowA: pgdAddToCollectionRowA(readonly, collectibleId, b5c, b27, c4c),
    rowB: pgdAddToCollectionRowB(readonly, collectibleId, c39, bd0),
  };
}

/* Pin accessors (mirrored in the cpp exports). */
export function pgdRoVa() { return PGD_RO_VA; }
export function pgdRoRetVa() { return PGD_RO_RET_VA; }
export function pgdRoBodyBytes() { return PGD_RO_BODY_BYTES; }
export function pgdRoInbound() { return PGD_RO_INBOUND; }
export function pgdRoReturnStack() { return PGD_RO_RETURN_STACK; }
export function pgdRoReadonlyOff() { return PGD_RO_READONLY_OFF; }
export function pgdRoLogVa() { return PGD_RO_LOG_VA; }
export function pgdRoStringTrueVa() { return PGD_RO_STRING_TRUE_VA; }
export function pgdRoStringFalseVa() { return PGD_RO_STRING_FALSE_VA; }
export function pgdRoLogCallVa() { return PGD_RO_LOG_CALL_VA; }
export function pgdRoCmpCmMoveVa() { return PGD_RO_CMP_CMOVE_VA; }
export function pgdRoStoreVa() { return PGD_RO_STORE_VA; }
export function pgdRoCallSiteCount() { return PGD_RO_CALL_SITE_VAS.length; }
export function pgdRoCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_RO_CALL_SITE_VAS.length) return 0;
  return PGD_RO_CALL_SITE_VAS[i];
}
export function pgdUnlVa() { return PGD_UNL_VA; }
export function pgdUnlRetVa() { return PGD_UNL_RET_VA; }
export function pgdUnlBodyBytes() { return PGD_UNL_BODY_BYTES; }
export function pgdUnlInbound() { return PGD_UNL_INBOUND; }
export function pgdUnlReturnStack() { return PGD_UNL_RETURN_STACK; }
export function pgdUnlAchOff() { return PGD_UNL_ACH_OFF; }
export function pgdUnlIndexHi() { return PGD_UNL_INDEX_HI; }
export function pgdUnlGateCount() { return PGD_UNL_GATE_VAS.length; }
export function pgdUnlGateVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_UNL_GATE_VAS.length) return 0;
  return PGD_UNL_GATE_VAS[i];
}
export function pgdUnlTrueTailVa() { return PGD_UNL_TRUE_TAIL_VA; }
export function pgdUnlFalseTailVa() { return PGD_UNL_FALSE_TAIL_VA; }
export function pgdUnlCallSiteCount() { return PGD_UNL_CALL_SITE_VAS.length; }
export function pgdUnlCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_UNL_CALL_SITE_VAS.length) return 0;
  return PGD_UNL_CALL_SITE_VAS[i];
}
export function pgdAdditVa() { return PGD_ADDIT_VA; }
export function pgdAdditRetVa() { return PGD_ADDIT_RET_VA; }
export function pgdAdditBodyBytes() { return PGD_ADDIT_BODY_BYTES; }
export function pgdAdditInbound() { return PGD_ADDIT_INBOUND; }
export function pgdAdditReturnStack() { return PGD_ADDIT_RETURN_STACK; }
export function pgdAdditCountCallVa() { return PGD_ADDIT_COUNT_CALL_VA; }
export function pgdAdditCountCallSiteVa() { return PGD_ADDIT_COUNT_CALL_SITE_VA; }
export function pgdAdditTryUnlockVa() { return PGD_ADDIT_TRY_UNLOCK_VA; }
export function pgdAdditWindowHi() { return PGD_ADDIT_WINDOW_HI; }
export function pgdAdditItemFlagOff() { return PGD_ADDIT_ITEM_FLAG_OFF; }
export function pgdAdditDirtyOff() { return PGD_ADDIT_DIRTY_OFF; }
export function pgdAdditRowAId() { return PGD_ADDIT_ROW_A_ID; }
export function pgdAdditRowBId() { return PGD_ADDIT_ROW_B_ID; }
export function pgdAdditRowACallVa() { return PGD_ADDIT_ROW_A_CALL_VA; }
export function pgdAdditRowBCallVa() { return PGD_ADDIT_ROW_B_CALL_VA; }
export function pgdAdditRowAGateVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDIT_ROW_A_GATE_VAS.length) return 0;
  return PGD_ADDIT_ROW_A_GATE_VAS[i];
}
export function pgdAdditRowBGateVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDIT_ROW_B_GATE_VAS.length) return 0;
  return PGD_ADDIT_ROW_B_GATE_VAS[i];
}
export function pgdAdditGateFieldOff(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDIT_GATE_FIELD_OFFS.length) return 0;
  return PGD_ADDIT_GATE_FIELD_OFFS[i];
}
export function pgdAdditEntryGateVa() { return PGD_ADDIT_ENTRY_GATE_VA; }
export function pgdAdditWindowGateVa() { return PGD_ADDIT_WINDOW_GATE_VA; }
export function pgdAdditId0SkipVa() { return PGD_ADDIT_ID0_SKIP_VA; }
export function pgdAdditOwnedGateVa() { return PGD_ADDIT_OWNED_GATE_VA; }
export function pgdAdditFlagStoreVa() { return PGD_ADDIT_FLAG_STORE_VA; }
export function pgdAdditDirtyStoreVa() { return PGD_ADDIT_DIRTY_STORE_VA; }
export function pgdAdditCallSiteCount() { return PGD_ADDIT_CALL_SITE_VAS.length; }
export function pgdAdditCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDIT_CALL_SITE_VAS.length) return 0;
  return PGD_ADDIT_CALL_SITE_VAS[i];
}

/* ============================================================
   Helpers ABI v15 — PGDCP (reader-side bestiary count-probe).
   ============================================================ */

/* The reader-side count-probe 0x0092aea0..0x0092b061 (ret 8; entry
   address-stable — identify-zhl 0 exact matches; three inbound E8
   sites: 0x006c10bf / 0x006ca239 and the probe's own recursive
   0x92b03c; next island 0x92b070 — the slot-3 GetBestiaryDeathCount
   getter (v16 PGDDEATH); v15 had recorded 0x92b0c0, which decodes
   MID-INSTRUCTION of that getter and has 0 callers). After a host
   container find (0x695030 ->
   [0xc7169c]+0x2a670, [eax+0xe8] gate) and a host bestiary slot-0
   map upsert (0x4288a0 / 0x92ca70 on pgd+0xf64), the probe derives a
   count by walking the game-state entity tree at [0xc7169c]+0x2a670
   (v12 iterator++ 0x414a80 @0x92af9a; v13 row-walk shape: header
   loaded ONCE @0x92af65, begin=[header], empty gate @0x92af71,
   loop-back node != header @0x92afa3/0x92afa5) and stores it to
   [0xc7f508]. The game-state gates (+0x15 / +0x17c flags) and the
   0x9595e0 callback stay HOST. Landed: the pure count-derivation
   laws over sampled element inputs. */

export const PGD_COUNT_PROBE_VA = 0x0092aea0;
export const PGD_COUNT_PROBE_RET_OK_VA = 0x0092b054;
export const PGD_COUNT_PROBE_RET_FAIL_VA = 0x0092b05f;
export const PGD_COUNT_PROBE_NEXT_VA = 0x009e4260; /* v25n: PGDTALLY
   landed at v25n — the shared Rebirth-save snapshot reader's
   stage-4 tally loops (0x9e4618..0x9e4a8f, entered by fall-through
   after PGDCLMP): the collection walk (byte [..+0x268], eax
   1..0x15a SIGNED `jl` bound 0x15b; nonzero -> setB skipping the
   alias table; zero -> {0x114,0x14d,0x14e,0x14f,0x11b,0x14b}
   setA / {0x2b,0x3d,0xeb} setB) with the SIGNED
   (setA+setB) < 0x15a finish gate (below: success return al=1, the
   settings walk never runs) and the settings walk (byte
   [..+0x38], eax 1..0xb2 SIGNED bound 0xb3; nonzero -> setB; zero
   + {0x81..0x85,0x9c,0x52,0x54,0xaf} -> setA; edi keeps the
   COLLECTION setA) with SIGNED (setA+setB) < 0xb1 gating
   byte [..+0x7d]=1 @0x9e4a78 and SIGNED settB >= 0xb1 AND
   collection setA == 0 gating byte [..+0x8c]=1 @0x9e4a88; success
   `mov al,1` tail 0x9e4a8f..0x9e4aa1. The reader's residual host
   surface (7+ vtbl stream reads, the 9 cdecl logs 0xa112c0, the
   stamp-cookie 0xaef12b, PGDCLMP 0x9e4af0, the +0x4a4 finish write)
   stays HOST — the opaque boundary count is UNCHANGED by v25n.
   v24: PGDITAG + PGDIDISP (version-tag table ten .rdata headers /
   the 9-entry dispatch outcome with clamp/setg/loop-bound laws)
   landed at v24. v23: PGDADSED
   0x92b230 + PGDK41 0x92b270 landed at v23, completing the
   PGDX/PGDK mutator cluster — the whole 0x92b22a..0x92b2e0 span is
   pure-covered. The family's next island is the shared Rebirth-save
   snapshot reader 0x009e4260 (the v8-recorded "next measured
   candidate", never claimed; no exact ZHL; 235 insns, 1 E8
   (log 0xa112c0) + 7 vtbl indirect stream calls + 20 mem-stores:
   version-tag match against the ten .rdata save headers
   0xb805bc/0xb8060c/0xb805a8/0xb805f8/0xb805e4/0xb80514/0xb805d0/
   0xb80500/0xb1b98c/0xb80560 and the section-tag dispatch table
   0x9e4ac8 — the PURE decision islands; reader clamp laws for the
   sec3 window already landed at v3). v22: the
   AddMiniBoss mutator 0x92a520 (PGDADDMINI) landed at v22; the
   family's next island is 0x92b230 (the completely unchecked +0xf14
   BYTE store (v23 corrected the v22 "dword" shorthand — `c6 84 08 14
   0f 00 00 01` = mov byte [eax+ecx+0xf14],1), PGDX v1 record —
   PGD_SEC10_* consts + oracles already
   in this model), then 0x92b270 (the 41-bit popcount gate, PGDK).
   v21: the
   AddBoss mutator 0x92a5e0 (PGDADDBOSS) landed at v21; the family's
   next island was AddMiniBoss 0x92a520 (self-named by its warning
   string "AddMiniBoss: invalid miniboss id %d" — header line 196;
   no exact ZHL -> address-stable PGDADDMINI; flag store +0xe00,
   calls 0xa112c0; ALIVE: direct E8 callers 0x7ffff1 / 0x800010,
   byte-scan verified). v20: the
   AddChallenge dispatcher 0x92a7b0 (PGDADDCH) landed at v20; the
   family's next island was AddBoss 0x92a5e0 (EXACT ZHL per header
   roots; flag gates +0xe07.., TryUnlock ids 0x56/0x57/0x58/0xf/
   0x174/0x19c/0x19d/0x19e; ALIVE: direct E8 callers 0x7fc01f /
   0x7ff7a8, byte-scan verified).
   v19: the slot-2 +
   slot-3 sibling mutators 0x92aaf0/0x92ab40/0x92abd0/0x92ac20
   (PGDADDSIB2/PGDADDSIB3) landed at v19; the family's next island was
   the TryUnlock dispatcher 0x92a7b0 (ret 4 @0x92aa2c, readonly gate,
   arg gate `cmp eax,0x2d ; ja fail`, flag byte [eax+ecx+0xe6f]=1,
   `dec eax ; cmp eax,0x2c ; ja fail ; jmp [eax*4 + 0x92aa30]` into a
   0x2d-entry table of `mov [ebp+8],id ; pop ebp ; jmp 0x929a20`
   arms for unlock ids 0x59..0x21a; alive: direct E8 caller 0x704f84
   — the linear-decode census misreads its vicinity, byte-scan is
   authoritative). Followed by 0x92a5e0 (flag gates +0xe07..,
   TryUnlock 0x56/0x57/0x58/0xf/0x174/0x19c/0x19d/0x19e; callers
   0x7fc01f/0x7ff7a8) and 0x92a520 (flag +0xe00, calls 0xa112c0;
   callers 0x7ffff1/0x800010). v18: the write-side
   AddBestiaryKill 0x92acb0 (PGDADDKILL) landed at v18; the family's
   next island was the slot-3 sibling mutator 0x92ac20 (address-stable,
   same AddBestiary* template, own unlock dispatch; zero ZHL matches).
   v17: the v16 record
   (0x92b070, PGDDEATH) landed at v16; the family's next island is
   AddBestiaryKill 0x92acb0 (EXACT ZHL match, slot-1 0xf6c write
   side). v16 CORRECTED:
   0x92b0c0 decodes MID-INSTRUCTION of the 0x92b070 getter and has 0
   callers; the real next island was 0x92b070 (2 callers) — PGDDEATH */
export const PGD_COUNT_PROBE_CALL_SITES = 3;
export const PGD_COUNT_PROBE_CALL_SITE_VAS = Object.freeze([
  0x006c10bf, 0x006ca239, 0x0092b03c,
]);
export const PGD_COUNT_GLOBAL_VA = 0x00c7f508;
export const PGD_COUNT_GAME_VA = 0x00c7169c;
export const PGD_COUNT_TREE_OFF = 0x2a670;
export const PGD_COUNT_READONLY_GATE_VA = 0x0092aeae;
export const PGD_COUNT_READONLY_JNE_VA = 0x0092aeb2;
export const PGD_COUNT_CACHED_LOAD_VA = 0x0092af55;
export const PGD_COUNT_STORE_GATE_VA = 0x0092af61;
export const PGD_COUNT_STORE_GATE_JNE_VA = 0x0092af63;
export const PGD_COUNT_HEADER_LOAD_VA = 0x0092af65;
export const PGD_COUNT_EMPTY_GATE_VA = 0x0092af71;
export const PGD_COUNT_GATE1_CMP_VA = 0x0092af78;
export const PGD_COUNT_GATE1_JL_VA = 0x0092af7c;
export const PGD_COUNT_GATE2_MOVSS_VA = 0x0092af7e;
export const PGD_COUNT_GATE2_UCOMISS_VA = 0x0092af83;
export const PGD_COUNT_GATE2_LAHF_VA = 0x0092af86;
export const PGD_COUNT_GATE2_TEST_VA = 0x0092af87;
export const PGD_COUNT_GATE2_JNP_VA = 0x0092af8a;
export const PGD_COUNT_GATE3_CMP_VA = 0x0092af8c;
export const PGD_COUNT_GATE3_JE_VA = 0x0092af93;
export const PGD_COUNT_INC_VA = 0x0092af95;
export const PGD_COUNT_ADVANCE_VA = 0x0092af9a;
export const PGD_COUNT_LOOP_BACK_CMP_VA = 0x0092afa3;
export const PGD_COUNT_LOOP_BACK_JNE_VA = 0x0092afa5;
export const PGD_COUNT_STORE_VA = 0x0092afad;
export const PGD_COUNT_PROCEED_CMP_VA = 0x0092afb3;
export const PGD_COUNT_PROCEED_JB_VA = 0x0092afb9;
export const PGD_COUNT_SLOT7C_OFF = 0x7c;
export const PGD_COUNT_FLOAT_OFF = 0x68;
export const PGD_COUNT_FLAG_OFF = 0x100;
export const PGD_COUNT_SLOT0_COUNT_OFF = 0xf68;

export function pgdCountProbeVa() { return PGD_COUNT_PROBE_VA; }
export function pgdCountProbeRetOkVa() { return PGD_COUNT_PROBE_RET_OK_VA; }
export function pgdCountProbeRetFailVa() { return PGD_COUNT_PROBE_RET_FAIL_VA; }
export function pgdCountProbeNextVa() { return PGD_COUNT_PROBE_NEXT_VA; }
export function pgdCountProbeCallSiteCount() {
  return PGD_COUNT_PROBE_CALL_SITES;
}
export function pgdCountProbeCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_COUNT_PROBE_CALL_SITES) return 0;
  return PGD_COUNT_PROBE_CALL_SITE_VAS[i] >>> 0;
}
export function pgdCountGlobalVa() { return PGD_COUNT_GLOBAL_VA; }
export function pgdCountGameVa() { return PGD_COUNT_GAME_VA; }
export function pgdCountTreeOff() { return PGD_COUNT_TREE_OFF; }
export function pgdCountSlot7cOff() { return PGD_COUNT_SLOT7C_OFF; }
export function pgdCountFloatOff() { return PGD_COUNT_FLOAT_OFF; }
export function pgdCountFlagOff() { return PGD_COUNT_FLAG_OFF; }
export function pgdCountSlot0CountOff() { return PGD_COUNT_SLOT0_COUNT_OFF; }
export function pgdCountReadonlyGateVa() { return PGD_COUNT_READONLY_GATE_VA; }
export function pgdCountStoreGateVa() { return PGD_COUNT_STORE_GATE_VA; }
export function pgdCountStoreGateJneVa() { return PGD_COUNT_STORE_GATE_JNE_VA; }
export function pgdCountHeaderLoadVa() { return PGD_COUNT_HEADER_LOAD_VA; }
export function pgdCountEmptyGateVa() { return PGD_COUNT_EMPTY_GATE_VA; }
export function pgdCountGate1CmpVa() { return PGD_COUNT_GATE1_CMP_VA; }
export function pgdCountGate1JlVa() { return PGD_COUNT_GATE1_JL_VA; }
export function pgdCountGate2MovssVa() { return PGD_COUNT_GATE2_MOVSS_VA; }
export function pgdCountGate2UcomissVa() { return PGD_COUNT_GATE2_UCOMISS_VA; }
export function pgdCountGate2LahfVa() { return PGD_COUNT_GATE2_LAHF_VA; }
export function pgdCountGate2TestVa() { return PGD_COUNT_GATE2_TEST_VA; }
export function pgdCountGate2JnpVa() { return PGD_COUNT_GATE2_JNP_VA; }
export function pgdCountGate3CmpVa() { return PGD_COUNT_GATE3_CMP_VA; }
export function pgdCountGate3JeVa() { return PGD_COUNT_GATE3_JE_VA; }
export function pgdCountIncVa() { return PGD_COUNT_INC_VA; }
export function pgdCountAdvanceVa() { return PGD_COUNT_ADVANCE_VA; }
export function pgdCountLoopBackCmpVa() { return PGD_COUNT_LOOP_BACK_CMP_VA; }
export function pgdCountLoopBackJneVa() { return PGD_COUNT_LOOP_BACK_JNE_VA; }
export function pgdCountStoreVa() { return PGD_COUNT_STORE_VA; }
export function pgdCountProceedCmpVa() { return PGD_COUNT_PROCEED_CMP_VA; }
export function pgdCountProceedJbVa() { return PGD_COUNT_PROCEED_JB_VA; }

/** float32 bit pattern -> IEEE float (independent of the C++ byte copy). */
let pgdF32Buf;
let pgdF32View;
function f32FromBits(bits) {
  if (!pgdF32Buf) {
    pgdF32Buf = new ArrayBuffer(4);
    pgdF32View = new DataView(pgdF32Buf);
  }
  pgdF32View.setUint32(0, asU32(bits), true);
  return pgdF32View.getFloat32(0, true);
}

/* Entry gate @0x92aeae/0x92aeb2: `cmp byte ptr [ebx+1], 0 ; jne
   fail` — the probe aborts (returns 0) when the LOW BYTE of pgd+1
   (readonly flag) is non-zero. */
export function pgdCountProbeBlocked(readonlyByte) {
  return (asU32(readonlyByte) & 0xff) !== 0 ? 1 : 0;
}

/* Per-element count decision (loop head 0x92af78..0x92af95):
   - gate1 `cmp dword [ecx+0x7c], 0 ; jl skip` — SIGNED less-than-zero
     is NOT counted.
   - gate2 `movss xmm0,[ecx+0x68] ; ucomiss xmm0,xmm1 ; lahf ;
     test ah,0x44 ; jnp skip` (xmm1 = +0.0f). AH after lahf has ZF at
     bit 6 and PF at bit 2; `test ah,0x44` keeps only those two bits
     and jnp falls through when their parity is ODD. The ucomiss rows
     vs +0.0 are (ZF,PF) = (0,0) for x>0 / x<0, (1,0) ordered equal,
     (1,1) NaN: the only odd row is (1,0) — x == +/-0.0f and NOT NaN.
   - gate3 `cmp byte ptr [ecx+0x100], 0 ; je skip` — LOW BYTE of the
     element flag must be non-zero.
   All three must pass for the `inc edi` @0x92af95. */
export function pgdCountEligible(slot7c, floatBits, flagWord) {
  if (asI32(slot7c) < 0) return 0;
  const x = f32FromBits(floatBits);
  if (x !== 0.0) return 0; /* +/-0.0 pass; NaN and every non-zero skip */
  if ((asU32(flagWord) & 0xff) === 0) return 0;
  return 1;
}

/* Store decision @0x92af55/0x92af61/0x92af63: the walk runs and the
   `mov [0xc7f508], edi` @0x92afad executes ONLY while the cached
   global is ZERO (full-dword `test edi,edi`). */
export function pgdCountStoreNeeded(cached) {
  return asU32(cached) === 0 ? 1 : 0;
}

/* Both arms continue with edi as "the count": the jne path keeps the
   cached value (walk skipped, no store); the fall-through path uses
   the derived count. effective = cached != 0 ? cached : derived —
   the PE does NOT recapture on the cached path. */
export function pgdCountEffective(cached, derived) {
  return asU32(cached) !== 0 ? asU32(cached) : asU32(derived);
}

/* Proceed gate @0x92afb3/0x92afb9: `cmp [ebx+0xf68], edi ; jb skip`
   — UNSIGNED map-count < derived skips the game-state block
   (0x92afbb..0x92b017: +0x15 / +0x17c flags, 0x9595e0 callback —
   HOST); the block runs only when map_count_slot0 >= count. */
export function pgdCountProceed(mapCountSlot0, count) {
  return asU32(mapCountSlot0) >= asU32(count) ? 1 : 0;
}

/* ============================================================
   Helpers ABI v16 — PGDDEATH (bestiary slot-3 death-count getter).
   ============================================================ */

/* The bestiary slot-3 getter 0x0092b070..0x0092b0f0 (ret 8; ok ret
   0x92b0dd, node-fail ret 0x92b0e7, container-fail ret 0x92b0f0).
   identify-zhl EXACT match (150 pattern bytes): `__thiscall int
   PersistentGameData::GetBestiaryDeathCount(int EntityType, int
   EntityVariant)`. Two inbound E8 sites: 0x005c2380 and 0x008c78e1.
   Sibling getters: 0x92b110 (slot 1 base 0xf6c — kill-count shape:
   same 0x695030 + 0x4288a0 pair, ret 8, fail 0x92b177) and 0x92b190
   EXACT MATCH `GetBestiaryEncounterCount`. The container find
   (0x695030 on [0xc7169c]+0x2a670), the [eax+0xe8] byte gate and the
   map find (0x4288a0 on pgd+0xf7c) stay HOST. Landed: key derivation,
   node eligibility and value extraction over sampled fields. */

export const PGD_DEATH_VA = 0x0092b070;
export const PGD_DEATH_RET_OK_VA = 0x0092b0dd;
export const PGD_DEATH_RET_NODE_FAIL_VA = 0x0092b0e7;
export const PGD_DEATH_RET_FAIL_VA = 0x0092b0f0;
export const PGD_DEATH_CALL_SITES = 2;
export const PGD_DEATH_CALL_SITE_VAS = Object.freeze([
  0x005c2380, 0x008c78e1,
]);
export const PGD_DEATH_SLOT3_HEADER_OFF = 0xf7c;
export const PGD_DEATH_MARKER_OFF = 0xd;
export const PGD_DEATH_KEY_OFF = 0x10;
export const PGD_DEATH_VALUE_OFF = 0x14;
export const PGD_DEATH_GAME_VA = 0x00c7169c;
export const PGD_DEATH_CONTAINER_OFF = 0x2a670;
export const PGD_DEATH_GATE_BYTE_OFF = 0xe8;
export const PGD_DEATH_CONTAINER_FIND_VA = 0x00695030;
export const PGD_DEATH_MAP_FIND_VA = 0x004288a0;
export const PGD_DEATH_KEY_SHIFT12_VA = 0x0092b0a6;
export const PGD_DEATH_KEY_OR_VA = 0x0092b0a9;
export const PGD_DEATH_KEY_SHIFT8_VA = 0x0092b0b3;
export const PGD_DEATH_MARKER_CMP_VA = 0x0092b0c2;
export const PGD_DEATH_MARKER_JNE_VA = 0x0092b0c6;
export const PGD_DEATH_KEY_CMP_VA = 0x0092b0c8;
export const PGD_DEATH_KEY_JL_VA = 0x0092b0cb;
export const PGD_DEATH_HEADER_CMP_VA = 0x0092b0cd;
export const PGD_DEATH_HEADER_JE_VA = 0x0092b0d3;
export const PGD_DEATH_VALUE_LOAD_VA = 0x0092b0d5;

export function pgdBestiaryDeathVa() { return PGD_DEATH_VA; }
export function pgdBestiaryDeathRetOkVa() { return PGD_DEATH_RET_OK_VA; }
export function pgdBestiaryDeathRetNodeFailVa() { return PGD_DEATH_RET_NODE_FAIL_VA; }
export function pgdBestiaryDeathRetFailVa() { return PGD_DEATH_RET_FAIL_VA; }
export function pgdBestiaryDeathCallSiteCount() {
  return PGD_DEATH_CALL_SITES;
}
export function pgdBestiaryDeathCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_DEATH_CALL_SITES) return 0;
  return PGD_DEATH_CALL_SITE_VAS[i] >>> 0;
}
export function pgdBestiaryDeathSlot3HeaderOff() { return PGD_DEATH_SLOT3_HEADER_OFF; }
export function pgdBestiaryDeathMarkerOff() { return PGD_DEATH_MARKER_OFF; }
export function pgdBestiaryDeathKeyOff() { return PGD_DEATH_KEY_OFF; }
export function pgdBestiaryDeathValueOff() { return PGD_DEATH_VALUE_OFF; }
export function pgdBestiaryDeathGameVa() { return PGD_DEATH_GAME_VA; }
export function pgdBestiaryDeathContainerOff() { return PGD_DEATH_CONTAINER_OFF; }
export function pgdBestiaryDeathGateByteOff() { return PGD_DEATH_GATE_BYTE_OFF; }
export function pgdBestiaryDeathContainerFindVa() { return PGD_DEATH_CONTAINER_FIND_VA; }
export function pgdBestiaryDeathMapFindVa() { return PGD_DEATH_MAP_FIND_VA; }
export function pgdBestiaryDeathKeyShift12Va() { return PGD_DEATH_KEY_SHIFT12_VA; }
export function pgdBestiaryDeathKeyOrVa() { return PGD_DEATH_KEY_OR_VA; }
export function pgdBestiaryDeathKeyShift8Va() { return PGD_DEATH_KEY_SHIFT8_VA; }
export function pgdBestiaryDeathMarkerCmpVa() { return PGD_DEATH_MARKER_CMP_VA; }
export function pgdBestiaryDeathMarkerJneVa() { return PGD_DEATH_MARKER_JNE_VA; }
export function pgdBestiaryDeathKeyCmpVa() { return PGD_DEATH_KEY_CMP_VA; }
export function pgdBestiaryDeathKeyJlVa() { return PGD_DEATH_KEY_JL_VA; }
export function pgdBestiaryDeathHeaderCmpVa() { return PGD_DEATH_HEADER_CMP_VA; }
export function pgdBestiaryDeathHeaderJeVa() { return PGD_DEATH_HEADER_JE_VA; }
export function pgdBestiaryDeathValueLoadVa() { return PGD_DEATH_VALUE_LOAD_VA; }

/* Key derivation @0x92b09e..0x92b0b3: `mov esi,[eax] ; shl esi,0xc ;
   or esi,[eax+4] ; shl esi,8` — the two record dwords combine in
   exactly that order with 32-bit wrap at every step. */
export function pgdBestiaryDeathKey(recWord0, recWord1) {
  let key = asU32(recWord0) << 12;
  key |= asU32(recWord1);
  return (key << 8) >>> 0;
}

/* Node eligibility @0x92b0c2..0x92b0d3 — ALL THREE must pass:
   - marker byte [node+0xd] LOW BYTE == 0 (`cmp byte ; jne fail`);
   - SIGNED key >= node_key (`cmp esi,[node+0x10] ; jl fail`);
   - node must not BE the map header (`cmp eax,[map+0xf7c] ; je
     fail`). */
export function pgdBestiaryDeathNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((asU32(markerD) & 0xff) !== 0) return 0;
  if (asI32(key) < asI32(nodeKey)) return 0;
  if (asU32(nodeIsHeader) !== 0) return 0;
  return 1;
}

/* Value extraction: ok path @0x92b0d5 `mov eax,[eax+0x14]` — the
   value dword at node+0x14 is returned ONLY when every gate passes;
   both fail tails `xor eax,eax` -> 0. */
export function pgdBestiaryDeathValue(markerD, key, nodeKey, nodeIsHeader, nodeValue) {
  if (pgdBestiaryDeathNodeOk(markerD, key, nodeKey, nodeIsHeader) === 0) {
    return 0;
  }
  return asU32(nodeValue);
}

/* ============================================================
   ABI v17 — PGDKILL (GetBestiaryKillCount 0x0092b100) and
   PGDENC (GetBestiaryEncounterCount 0x0092b190)
   ============================================================ */

/* The bestiary slot-1 getter 0x0092b100..0x0092b180 (ret 8; ok ret
   0x92b16d, node-fail ret 0x92b177, container-fail ret 0x92b180).
   identify-zhl EXACT match (148 pattern bytes): `__thiscall int
   PersistentGameData::GetBestiaryKillCount(int EntityType, int
   EntityVariant)`. Seven inbound E8 sites: 0x5c1d86, 0x5c1e61,
   0x5c1eff, 0x8c799e, 0x92ad5e, 0x92adc2, 0x92add2. NOTE: the v16
   note spelled the entry "0x92b110", which decodes MID-INSTRUCTION
   inside this body — the true aligned entry is 0x92b100 (same trap
   as 0x92b0c0 in v15). The container find (0x695030 on
   [0xc7169c]+0x2a670), the [eax+0xe8] byte gate and the map find
   (0x4288a0 on pgd+0xf6c) stay HOST. Landed: key derivation, node
   eligibility and value extraction — the SAME template as PGDDEATH,
   slot base 0xf6c. */

export const PGD_KILL_VA = 0x0092b100;
export const PGD_KILL_RET_OK_VA = 0x0092b16d;
export const PGD_KILL_RET_NODE_FAIL_VA = 0x0092b177;
export const PGD_KILL_RET_FAIL_VA = 0x0092b180;
export const PGD_KILL_CALL_SITES = 7;
export const PGD_KILL_CALL_SITE_VAS = Object.freeze([
  0x005c1d86, 0x005c1e61, 0x005c1eff, 0x008c799e,
  0x0092ad5e, 0x0092adc2, 0x0092add2,
]);
export const PGD_KILL_SLOT1_HEADER_OFF = 0xf6c;
export const PGD_KILL_MARKER_OFF = 0xd;
export const PGD_KILL_KEY_OFF = 0x10;
export const PGD_KILL_VALUE_OFF = 0x14;
export const PGD_KILL_GAME_VA = 0x00c7169c;
export const PGD_KILL_CONTAINER_OFF = 0x2a670;
export const PGD_KILL_GATE_BYTE_OFF = 0xe8;
export const PGD_KILL_CONTAINER_FIND_VA = 0x00695030;
export const PGD_KILL_MAP_FIND_VA = 0x004288a0;
export const PGD_KILL_KEY_SHIFT12_VA = 0x0092b136;
export const PGD_KILL_KEY_OR_VA = 0x0092b139;
export const PGD_KILL_KEY_SHIFT8_VA = 0x0092b143;
export const PGD_KILL_MARKER_CMP_VA = 0x0092b152;
export const PGD_KILL_MARKER_JNE_VA = 0x0092b156;
export const PGD_KILL_KEY_CMP_VA = 0x0092b158;
export const PGD_KILL_KEY_JL_VA = 0x0092b15b;
export const PGD_KILL_HEADER_CMP_VA = 0x0092b15d;
export const PGD_KILL_HEADER_JE_VA = 0x0092b163;
export const PGD_KILL_VALUE_LOAD_VA = 0x0092b165;

export function pgdBestiaryKillVa() { return PGD_KILL_VA; }
export function pgdBestiaryKillRetOkVa() { return PGD_KILL_RET_OK_VA; }
export function pgdBestiaryKillRetNodeFailVa() { return PGD_KILL_RET_NODE_FAIL_VA; }
export function pgdBestiaryKillRetFailVa() { return PGD_KILL_RET_FAIL_VA; }
export function pgdBestiaryKillCallSiteCount() {
  return PGD_KILL_CALL_SITES;
}
export function pgdBestiaryKillCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_KILL_CALL_SITES) return 0;
  return PGD_KILL_CALL_SITE_VAS[i] >>> 0;
}
export function pgdBestiaryKillSlot1HeaderOff() { return PGD_KILL_SLOT1_HEADER_OFF; }
export function pgdBestiaryKillMarkerOff() { return PGD_KILL_MARKER_OFF; }
export function pgdBestiaryKillKeyOff() { return PGD_KILL_KEY_OFF; }
export function pgdBestiaryKillValueOff() { return PGD_KILL_VALUE_OFF; }
export function pgdBestiaryKillGameVa() { return PGD_KILL_GAME_VA; }
export function pgdBestiaryKillContainerOff() { return PGD_KILL_CONTAINER_OFF; }
export function pgdBestiaryKillGateByteOff() { return PGD_KILL_GATE_BYTE_OFF; }
export function pgdBestiaryKillContainerFindVa() { return PGD_KILL_CONTAINER_FIND_VA; }
export function pgdBestiaryKillMapFindVa() { return PGD_KILL_MAP_FIND_VA; }
export function pgdBestiaryKillKeyShift12Va() { return PGD_KILL_KEY_SHIFT12_VA; }
export function pgdBestiaryKillKeyOrVa() { return PGD_KILL_KEY_OR_VA; }
export function pgdBestiaryKillKeyShift8Va() { return PGD_KILL_KEY_SHIFT8_VA; }
export function pgdBestiaryKillMarkerCmpVa() { return PGD_KILL_MARKER_CMP_VA; }
export function pgdBestiaryKillMarkerJneVa() { return PGD_KILL_MARKER_JNE_VA; }
export function pgdBestiaryKillKeyCmpVa() { return PGD_KILL_KEY_CMP_VA; }
export function pgdBestiaryKillKeyJlVa() { return PGD_KILL_KEY_JL_VA; }
export function pgdBestiaryKillHeaderCmpVa() { return PGD_KILL_HEADER_CMP_VA; }
export function pgdBestiaryKillHeaderJeVa() { return PGD_KILL_HEADER_JE_VA; }
export function pgdBestiaryKillValueLoadVa() { return PGD_KILL_VALUE_LOAD_VA; }

/* Key derivation @0x92b12e..0x92b143 — identical to PGDDEATH:
   `mov esi,[eax] ; shl esi,0xc ; or esi,[eax+4] ; shl esi,8`. */
export function pgdBestiaryKillKey(recWord0, recWord1) {
  let key = asU32(recWord0) << 12;
  key |= asU32(recWord1);
  return (key << 8) >>> 0;
}

/* Node gates @0x92b152..0x92b163 — the PGDDEATH template. */
export function pgdBestiaryKillNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((asU32(markerD) & 0xff) !== 0) return 0;
  if (asI32(key) < asI32(nodeKey)) return 0;
  if (asU32(nodeIsHeader) !== 0) return 0;
  return 1;
}

/* Value extraction: ok path @0x92b165 `mov eax,[eax+0x14]`. */
export function pgdBestiaryKillValue(markerD, key, nodeKey, nodeIsHeader, nodeValue) {
  if (pgdBestiaryKillNodeOk(markerD, key, nodeKey, nodeIsHeader) === 0) {
    return 0;
  }
  return asU32(nodeValue);
}

/* The bestiary slot-0 getter 0x0092b190..0x0092b1d8 (ret 8; ok ret
   0x92b1cf, container-fail ret 0x92b1d6). identify-zhl EXACT match
   (31 pattern bytes): `__thiscall int
   PersistentGameData::GetBestiaryEncounterCount(int EntityType, int
   EntityVariant)`. Three inbound E8 sites: 0x4adf67, 0x5a3b28,
   0x92b02e. The key is derived inline (@0x92b1ba..0x92b1c2), then the
   local helper 0x92b1e0..0x92b22a (ret 4; its own 2 inbound E8 sites
   0x8c68fc / 0x92b1c8) runs the map find 0x4288a0 on pgd+0xf64 and
   the three node gates. NOTE: the v16 handoff's "0xf74" slot base
   was WRONG — the machine says `lea edi,[ecx+0xf64]` @0x92b1ef and
   the ZHL struct declares the bestiary at 0xf64. The container find
   (0x695030 on [0xc7169c]+0x2a670), the [eax+0xe8] byte gate and the
   map find (0x4288a0) stay HOST. Landed: key derivation, node
   eligibility and value extraction — the PGDDEATH template, slot
   base 0xf64. */

export const PGD_ENC_VA = 0x0092b190;
export const PGD_ENC_RET_OK_VA = 0x0092b1cf;
export const PGD_ENC_RET_FAIL_VA = 0x0092b1d6;
export const PGD_ENC_HELPER_VA = 0x0092b1e0;
export const PGD_ENC_HELPER_RET_OK_VA = 0x0092b21d;
export const PGD_ENC_HELPER_RET_FAIL_VA = 0x0092b227;
export const PGD_ENC_CALL_SITES = 3;
export const PGD_ENC_CALL_SITE_VAS = Object.freeze([
  0x004adf67, 0x005a3b28, 0x0092b02e,
]);
export const PGD_ENC_SLOT0_HEADER_OFF = 0xf64;
export const PGD_ENC_MARKER_OFF = 0xd;
export const PGD_ENC_KEY_OFF = 0x10;
export const PGD_ENC_VALUE_OFF = 0x14;
export const PGD_ENC_GAME_VA = 0x00c7169c;
export const PGD_ENC_CONTAINER_OFF = 0x2a670;
export const PGD_ENC_GATE_BYTE_OFF = 0xe8;
export const PGD_ENC_CONTAINER_FIND_VA = 0x00695030;
export const PGD_ENC_MAP_FIND_VA = 0x004288a0;
export const PGD_ENC_KEY_SHIFT12_VA = 0x0092b1bc;
export const PGD_ENC_KEY_OR_VA = 0x0092b1bf;
export const PGD_ENC_KEY_SHIFT8_VA = 0x0092b1c2;
export const PGD_ENC_MARKER_CMP_VA = 0x0092b206;
export const PGD_ENC_MARKER_JNE_VA = 0x0092b20a;
export const PGD_ENC_KEY_CMP_VA = 0x0092b20c;
export const PGD_ENC_KEY_JL_VA = 0x0092b20f;
export const PGD_ENC_HEADER_CMP_VA = 0x0092b211;
export const PGD_ENC_HEADER_JE_VA = 0x0092b213;
export const PGD_ENC_VALUE_LOAD_VA = 0x0092b215;
export const PGD_ENC_HELPER_CALL_SITES = 2;
export const PGD_ENC_HELPER_CALL_SITE_VAS = Object.freeze([
  0x008c68fc, 0x0092b1c8,
]);

export function pgdBestiaryEncounterVa() { return PGD_ENC_VA; }
export function pgdBestiaryEncounterRetOkVa() { return PGD_ENC_RET_OK_VA; }
export function pgdBestiaryEncounterRetFailVa() { return PGD_ENC_RET_FAIL_VA; }
export function pgdBestiaryEncounterHelperVa() { return PGD_ENC_HELPER_VA; }
export function pgdBestiaryEncounterHelperRetOkVa() { return PGD_ENC_HELPER_RET_OK_VA; }
export function pgdBestiaryEncounterHelperRetFailVa() { return PGD_ENC_HELPER_RET_FAIL_VA; }
export function pgdBestiaryEncounterCallSiteCount() {
  return PGD_ENC_CALL_SITES;
}
export function pgdBestiaryEncounterCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ENC_CALL_SITES) return 0;
  return PGD_ENC_CALL_SITE_VAS[i] >>> 0;
}
export function pgdBestiaryEncounterSlot0HeaderOff() { return PGD_ENC_SLOT0_HEADER_OFF; }
export function pgdBestiaryEncounterMarkerOff() { return PGD_ENC_MARKER_OFF; }
export function pgdBestiaryEncounterKeyOff() { return PGD_ENC_KEY_OFF; }
export function pgdBestiaryEncounterValueOff() { return PGD_ENC_VALUE_OFF; }
export function pgdBestiaryEncounterGameVa() { return PGD_ENC_GAME_VA; }
export function pgdBestiaryEncounterContainerOff() { return PGD_ENC_CONTAINER_OFF; }
export function pgdBestiaryEncounterGateByteOff() { return PGD_ENC_GATE_BYTE_OFF; }
export function pgdBestiaryEncounterContainerFindVa() { return PGD_ENC_CONTAINER_FIND_VA; }
export function pgdBestiaryEncounterMapFindVa() { return PGD_ENC_MAP_FIND_VA; }
export function pgdBestiaryEncounterKeyShift12Va() { return PGD_ENC_KEY_SHIFT12_VA; }
export function pgdBestiaryEncounterKeyOrVa() { return PGD_ENC_KEY_OR_VA; }
export function pgdBestiaryEncounterKeyShift8Va() { return PGD_ENC_KEY_SHIFT8_VA; }
export function pgdBestiaryEncounterMarkerCmpVa() { return PGD_ENC_MARKER_CMP_VA; }
export function pgdBestiaryEncounterMarkerJneVa() { return PGD_ENC_MARKER_JNE_VA; }
export function pgdBestiaryEncounterKeyCmpVa() { return PGD_ENC_KEY_CMP_VA; }
export function pgdBestiaryEncounterKeyJlVa() { return PGD_ENC_KEY_JL_VA; }
export function pgdBestiaryEncounterHeaderCmpVa() { return PGD_ENC_HEADER_CMP_VA; }
export function pgdBestiaryEncounterHeaderJeVa() { return PGD_ENC_HEADER_JE_VA; }
export function pgdBestiaryEncounterValueLoadVa() { return PGD_ENC_VALUE_LOAD_VA; }
export function pgdBestiaryEncounterHelperCallSiteCount() {
  return PGD_ENC_HELPER_CALL_SITES;
}
export function pgdBestiaryEncounterHelperCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ENC_HELPER_CALL_SITES) return 0;
  return PGD_ENC_HELPER_CALL_SITE_VAS[i] >>> 0;
}

/* Key derivation @0x92b1ba..0x92b1c2 — identical to PGDDEATH:
   `mov ecx,[eax] ; shl ecx,0xc ; or ecx,[eax+4] ; shl ecx,8`. */
export function pgdBestiaryEncounterKey(recWord0, recWord1) {
  let key = asU32(recWord0) << 12;
  key |= asU32(recWord1);
  return (key << 8) >>> 0;
}

/* Node gates @0x92b206..0x92b213 in the helper — the PGDDEATH
   template (header compare is `cmp eax,[edi]` with edi the header). */
export function pgdBestiaryEncounterNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((asU32(markerD) & 0xff) !== 0) return 0;
  if (asI32(key) < asI32(nodeKey)) return 0;
  if (asU32(nodeIsHeader) !== 0) return 0;
  return 1;
}

/* Value extraction: ok path @0x92b215 `mov eax,[eax+0x14]`. */
export function pgdBestiaryEncounterValue(markerD, key, nodeKey, nodeIsHeader, nodeValue) {
  if (pgdBestiaryEncounterNodeOk(markerD, key, nodeKey, nodeIsHeader) === 0) {
    return 0;
  }
  return asU32(nodeValue);
}

/* ============================================================
   ABI v18 — PGDADDKILL (AddBestiaryKill 0x0092acb0)
   ============================================================ */

/* The write-side bestiary mutator 0x0092acb0..0x0092adfd (ret 8
   @0x92adf2 ok / @0x92adfd fail). identify-zhl EXACT match (15
   pattern bytes): `__thiscall bool PersistentGameData::
   AddBestiaryKill(int EntityType, int EntityVariant)`. Four inbound
   E8 sites: 0x4c8618, 0x59f451, 0x7a0946, 0x92b047 (the last is the
   v15 PGDCP probe's own call — NOT dead). Prologue
   `55 8b ec 83 ec 0c 53 56 57 8b f9 80 7f 01 00` — the readonly gate
   `cmp byte [edi+1],0` is the FIRST instruction of the body.
   The container find (0x695030 on [0xc7169c]+0x2a670), the map find
   (0x4288a0), the value-slot accessor (0x92ca70, MSVC SEH
   prologue — map operator[] on the slot-1 map header pgd+0xf6c), the
   kill-count getter (0x92b100) and TryUnlock (0x929a20) stay HOST.
   Landed pure laws: entry fail gates (readonly LOW BYTE != 0 /
   rec_found == 0 / gate_byte LOW BYTE == 0 -> return 0, in that
   order; otherwise the function returns 1 ALWAYS), the
   `((w0<<12)|w1)<<8` key, the three node gates (marker LOW BYTE
   zero / SIGNED key >= node_key / node != header), the WRITE-side
   store decision (node_ok ? old+1 mod 2^32 : 1 — INSERT on gate
   fail), the byte-table dispatch (idx = type-0x10f UNSIGNED > 0x85
   -> case 3 else byte_table[idx] {0->0, 1->0, 0x23->1, 0x85->2,
   else->3}), the unlock gates (case0 sum >= 0xa UNSIGNED, case1/2
   count >= 0x14 UNSIGNED, case3 never) + unlock ids (0->0x175,
   1->0x15d, 2->0x164, 3->0) and the case0 sum ((n1+n2) mod 2^32,
   n1 = killcount(0x110,0), n2 = killcount(0x10f,0)). */

export const PGD_ADDKILL_VA = 0x0092acb0;
export const PGD_ADDKILL_RET_OK_VA = 0x0092adf2;
export const PGD_ADDKILL_RET_FAIL_VA = 0x0092adfd;
export const PGD_ADDKILL_CALL_SITES = 4;
export const PGD_ADDKILL_CALL_SITE_VAS = Object.freeze([
  0x004c8618, 0x0059f451, 0x007a0946, 0x0092b047,
]);
export const PGD_ADDKILL_SLOT1_HEADER_OFF = 0xf6c;
export const PGD_ADDKILL_MARKER_OFF = 0xd;
export const PGD_ADDKILL_KEY_OFF = 0x10;
export const PGD_ADDKILL_VALUE_OFF = 0x14;
export const PGD_ADDKILL_GAME_VA = 0x00c7169c;
export const PGD_ADDKILL_CONTAINER_OFF = 0x2a670;
export const PGD_ADDKILL_GATE_BYTE_OFF = 0xe8;
export const PGD_ADDKILL_CONTAINER_FIND_VA = 0x00695030;
export const PGD_ADDKILL_MAP_FIND_VA = 0x004288a0;
export const PGD_ADDKILL_VALUE_ACCESSOR_VA = 0x0092ca70;
export const PGD_ADDKILL_KILL_GETTER_VA = 0x0092b100;
export const PGD_ADDKILL_UNLOCK_VA = 0x00929a20;
export const PGD_ADDKILL_TYPE_BASE = 0x10f;
export const PGD_ADDKILL_RANGE = 0x85;
export const PGD_ADDKILL_BT_VA = 0x0092ae10;
export const PGD_ADDKILL_BT_ENTRIES = 0x86;
export const PGD_ADDKILL_JT_VA = 0x0092ae00;
export const PGD_ADDKILL_READONLY_CMP_VA = 0x0092acbb;
export const PGD_ADDKILL_READONLY_JNE_VA = 0x0092acbf;
export const PGD_ADDKILL_REC_TEST_VA = 0x0092acde;
export const PGD_ADDKILL_REC_JE_VA = 0x0092ace0;
export const PGD_ADDKILL_GATE_CMP_VA = 0x0092ace6;
export const PGD_ADDKILL_GATE_JE_VA = 0x0092aced;
export const PGD_ADDKILL_KEY_SHIFT12_VA = 0x0092acf8;
export const PGD_ADDKILL_KEY_OR_VA = 0x0092ad01;
export const PGD_ADDKILL_KEY_SHIFT8_VA = 0x0092ad0a;
export const PGD_ADDKILL_MARKER_CMP_VA = 0x0092ad19;
export const PGD_ADDKILL_MARKER_JNE_VA = 0x0092ad1d;
export const PGD_ADDKILL_KEY_CMP_VA = 0x0092ad1f;
export const PGD_ADDKILL_KEY_JL_VA = 0x0092ad22;
export const PGD_ADDKILL_HEADER_CMP_VA = 0x0092ad24;
export const PGD_ADDKILL_HEADER_JE_VA = 0x0092ad26;
export const PGD_ADDKILL_STORE_INC_VA = 0x0092ad36;
export const PGD_ADDKILL_STORE_SET1_VA = 0x0092ad48;
export const PGD_ADDKILL_RANGE_CMP_VA = 0x0092ad6b;
export const PGD_ADDKILL_RANGE_JA_VA = 0x0092ad71;
export const PGD_ADDKILL_TABLE_LOAD_VA = 0x0092ad73;
export const PGD_ADDKILL_DISPATCH_JMP_VA = 0x0092ad7a;
export const PGD_ADDKILL_CASE1_CMP_VA = 0x0092ad81;
export const PGD_ADDKILL_CASE1_JB_VA = 0x0092ad84;
export const PGD_ADDKILL_CASE1_PUSH_VA = 0x0092ad86;
export const PGD_ADDKILL_CASE1_RET_VA = 0x0092ad9a;
export const PGD_ADDKILL_CASE2_CMP_VA = 0x0092ad9d;
export const PGD_ADDKILL_CASE2_JB_VA = 0x0092ada0;
export const PGD_ADDKILL_CASE2_PUSH_VA = 0x0092ada2;
export const PGD_ADDKILL_CASE2_RET_VA = 0x0092adb6;
export const PGD_ADDKILL_CASE0_CALL1_VA = 0x0092adc2;
export const PGD_ADDKILL_CASE0_CALL2_VA = 0x0092add2;
export const PGD_ADDKILL_CASE0_ADD_VA = 0x0092add7;
export const PGD_ADDKILL_CASE0_CMP_VA = 0x0092add9;
export const PGD_ADDKILL_CASE0_JB_VA = 0x0092addc;
export const PGD_ADDKILL_CASE0_PUSH_VA = 0x0092adde;

/* The byte table @0x92ae10, re-read byte-for-byte from the image
   (134 entries; idx 0->0, 1->0, 0x23->1, 0x85->2, else->3). */
export const PGD_ADDKILL_BYTE_TABLE = Object.freeze([
  0x00, 0x00, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x01, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,
  0x03, 0x03, 0x03, 0x03, 0x03, 0x02,
]);

export function pgdBestiaryAddKillVa() { return PGD_ADDKILL_VA; }
export function pgdBestiaryAddKillRetOkVa() { return PGD_ADDKILL_RET_OK_VA; }
export function pgdBestiaryAddKillRetFailVa() { return PGD_ADDKILL_RET_FAIL_VA; }
export function pgdBestiaryAddKillCallSiteCount() {
  return PGD_ADDKILL_CALL_SITES;
}
export function pgdBestiaryAddKillCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDKILL_CALL_SITES) return 0;
  return PGD_ADDKILL_CALL_SITE_VAS[i] >>> 0;
}
export function pgdBestiaryAddKillSlot1HeaderOff() { return PGD_ADDKILL_SLOT1_HEADER_OFF; }
export function pgdBestiaryAddKillMarkerOff() { return PGD_ADDKILL_MARKER_OFF; }
export function pgdBestiaryAddKillKeyOff() { return PGD_ADDKILL_KEY_OFF; }
export function pgdBestiaryAddKillValueOff() { return PGD_ADDKILL_VALUE_OFF; }
export function pgdBestiaryAddKillGameVa() { return PGD_ADDKILL_GAME_VA; }
export function pgdBestiaryAddKillContainerOff() { return PGD_ADDKILL_CONTAINER_OFF; }
export function pgdBestiaryAddKillGateByteOff() { return PGD_ADDKILL_GATE_BYTE_OFF; }
export function pgdBestiaryAddKillContainerFindVa() { return PGD_ADDKILL_CONTAINER_FIND_VA; }
export function pgdBestiaryAddKillMapFindVa() { return PGD_ADDKILL_MAP_FIND_VA; }
export function pgdBestiaryAddKillValueAccessorVa() { return PGD_ADDKILL_VALUE_ACCESSOR_VA; }
export function pgdBestiaryAddKillKillGetterVa() { return PGD_ADDKILL_KILL_GETTER_VA; }
export function pgdBestiaryAddKillUnlockVa() { return PGD_ADDKILL_UNLOCK_VA; }
export function pgdBestiaryAddKillTypeBase() { return PGD_ADDKILL_TYPE_BASE; }
export function pgdBestiaryAddKillRange() { return PGD_ADDKILL_RANGE; }
export function pgdBestiaryAddKillBtVa() { return PGD_ADDKILL_BT_VA; }
export function pgdBestiaryAddKillBtEntries() { return PGD_ADDKILL_BT_ENTRIES; }
export function pgdBestiaryAddKillJtVa() { return PGD_ADDKILL_JT_VA; }
export function pgdBestiaryAddKillReadonlyCmpVa() { return PGD_ADDKILL_READONLY_CMP_VA; }
export function pgdBestiaryAddKillReadonlyJneVa() { return PGD_ADDKILL_READONLY_JNE_VA; }
export function pgdBestiaryAddKillRecTestVa() { return PGD_ADDKILL_REC_TEST_VA; }
export function pgdBestiaryAddKillRecJeVa() { return PGD_ADDKILL_REC_JE_VA; }
export function pgdBestiaryAddKillGateCmpVa() { return PGD_ADDKILL_GATE_CMP_VA; }
export function pgdBestiaryAddKillGateJeVa() { return PGD_ADDKILL_GATE_JE_VA; }
export function pgdBestiaryAddKillKeyShift12Va() { return PGD_ADDKILL_KEY_SHIFT12_VA; }
export function pgdBestiaryAddKillKeyOrVa() { return PGD_ADDKILL_KEY_OR_VA; }
export function pgdBestiaryAddKillKeyShift8Va() { return PGD_ADDKILL_KEY_SHIFT8_VA; }
export function pgdBestiaryAddKillMarkerCmpVa() { return PGD_ADDKILL_MARKER_CMP_VA; }
export function pgdBestiaryAddKillMarkerJneVa() { return PGD_ADDKILL_MARKER_JNE_VA; }
export function pgdBestiaryAddKillKeyCmpVa() { return PGD_ADDKILL_KEY_CMP_VA; }
export function pgdBestiaryAddKillKeyJlVa() { return PGD_ADDKILL_KEY_JL_VA; }
export function pgdBestiaryAddKillHeaderCmpVa() { return PGD_ADDKILL_HEADER_CMP_VA; }
export function pgdBestiaryAddKillHeaderJeVa() { return PGD_ADDKILL_HEADER_JE_VA; }
export function pgdBestiaryAddKillStoreIncVa() { return PGD_ADDKILL_STORE_INC_VA; }
export function pgdBestiaryAddKillStoreSet1Va() { return PGD_ADDKILL_STORE_SET1_VA; }
export function pgdBestiaryAddKillRangeCmpVa() { return PGD_ADDKILL_RANGE_CMP_VA; }
export function pgdBestiaryAddKillRangeJaVa() { return PGD_ADDKILL_RANGE_JA_VA; }
export function pgdBestiaryAddKillTableLoadVa() { return PGD_ADDKILL_TABLE_LOAD_VA; }
export function pgdBestiaryAddKillDispatchJmpVa() { return PGD_ADDKILL_DISPATCH_JMP_VA; }
export function pgdBestiaryAddKillCase1CmpVa() { return PGD_ADDKILL_CASE1_CMP_VA; }
export function pgdBestiaryAddKillCase1JbVa() { return PGD_ADDKILL_CASE1_JB_VA; }
export function pgdBestiaryAddKillCase1PushVa() { return PGD_ADDKILL_CASE1_PUSH_VA; }
export function pgdBestiaryAddKillCase1RetVa() { return PGD_ADDKILL_CASE1_RET_VA; }
export function pgdBestiaryAddKillCase2CmpVa() { return PGD_ADDKILL_CASE2_CMP_VA; }
export function pgdBestiaryAddKillCase2JbVa() { return PGD_ADDKILL_CASE2_JB_VA; }
export function pgdBestiaryAddKillCase2PushVa() { return PGD_ADDKILL_CASE2_PUSH_VA; }
export function pgdBestiaryAddKillCase2RetVa() { return PGD_ADDKILL_CASE2_RET_VA; }
export function pgdBestiaryAddKillCase0Call1Va() { return PGD_ADDKILL_CASE0_CALL1_VA; }
export function pgdBestiaryAddKillCase0Call2Va() { return PGD_ADDKILL_CASE0_CALL2_VA; }
export function pgdBestiaryAddKillCase0AddVa() { return PGD_ADDKILL_CASE0_ADD_VA; }
export function pgdBestiaryAddKillCase0CmpVa() { return PGD_ADDKILL_CASE0_CMP_VA; }
export function pgdBestiaryAddKillCase0JbVa() { return PGD_ADDKILL_CASE0_JB_VA; }
export function pgdBestiaryAddKillCase0PushVa() { return PGD_ADDKILL_CASE0_PUSH_VA; }

/* Entry fail gates @0x92acbb..0x92aced — checked in PE order:
   readonly LOW BYTE != 0 (jne @0x92acbf), rec_found == 0
   (je @0x92ace0), gate_byte LOW BYTE == 0 (je @0x92aced). FAIL -> 0;
   otherwise 1 ALWAYS (both success tails `mov al,1`; TryUnlock's
   return is discarded). */
export function pgdBestiaryAddKillOk(readonlyByte, recFound, gateByte) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return 0;
  if (asU32(recFound) === 0) return 0;
  if ((asU32(gateByte) & 0xff) === 0) return 0;
  return 1;
}

/* Key derivation @0x92acf8..0x92ad0a — identical to the v16/v17
   getters: `mov esi,[ebx] ; shl esi,0xc ; or esi,[ebx+4] ; shl esi,8`. */
export function pgdBestiaryAddKillKey(recWord0, recWord1) {
  let key = asU32(recWord0) << 12;
  key |= asU32(recWord1);
  return (key << 8) >>> 0;
}

/* Node gates @0x92ad19..0x92ad26 — the PGDDEATH/PGDKILL template
   (header compare is `cmp eax,[edi]` with edi = pgd+0xf6c). */
export function pgdBestiaryAddKillNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((asU32(markerD) & 0xff) !== 0) return 0;
  if (asI32(key) < asI32(nodeKey)) return 0;
  if (asU32(nodeIsHeader) !== 0) return 0;
  return 1;
}

/* WRITE-side store decision: found path `inc dword [eax]` @0x92ad36
   (old+1 mod 2^32); NOT-found path `mov dword [eax],1` @0x92ad48
   (INSERT — the opposite of the getters' gate-fail return 0). */
export function pgdBestiaryAddKillStoreValue(nodeOk, oldValue) {
  if (asU32(nodeOk) !== 0) {
    return (asU32(oldValue) + 1) >>> 0;
  }
  return 1;
}

/* Dispatch @0x92ad63..0x92ad7a: idx = type - 0x10f (wrap); UNSIGNED
   idx > 0x85 -> case 3 (ja @0x92ad71); else byte_table[idx] (movzx
   @0x92ad73) -> {0->0, 1->0, 0x23->1, 0x85->2, else->3},
   then jmp [case*4 + 0x92ae00] (case0 0x92adb9 arm, case1 0x92ad81,
   case2 0x92ad9d, case3 0x92adea). */
export function pgdBestiaryAddKillDispatchCase(type) {
  const idx = (asU32(type) - 0x10f) >>> 0;
  if (idx > 0x85) return 3;
  const tbl = PGD_ADDKILL_BYTE_TABLE[idx];
  return tbl === undefined ? 3 : tbl;
}

/* Unlock gates: case0 sum >= 0xa UNSIGNED (cmp/jb @0x92add9/0x92addc);
   case1/2 count >= 0x14 UNSIGNED (cmp/jb @0x92ad81/0x92ad84 and
   @0x92ad9d/0x92ada0); case3 never. */
export function pgdBestiaryAddKillUnlockNeeded(dispatchCase, count) {
  const c = asI32(dispatchCase);
  const n = asU32(count);
  if (c === 0) return n >= 0xa ? 1 : 0;
  if (c === 1) return n >= 0x14 ? 1 : 0;
  if (c === 2) return n >= 0x14 ? 1 : 0;
  return 0;
}

/* Unlock ids (push sites @0x92adde / @0x92ad86 / @0x92ada2): all
   three calls 0x929a20 = PersistentGameData::TryUnlock, this =
   game+0x14. Case 3 never unlocks (id 0). */
export function pgdBestiaryAddKillUnlockId(dispatchCase) {
  const c = asI32(dispatchCase);
  if (c === 0) return 0x175;
  if (c === 1) return 0x15d;
  if (c === 2) return 0x164;
  return 0;
}

/* Case0 sum @0x92add7 `add esi,eax` — (n1 + n2) mod 2^32, n1 =
   killcount(0x110,0) (call @0x92adc2), n2 = killcount(0x10f,0)
   (call @0x92add2), machine call order. */
export function pgdBestiaryAddKillCase0Sum(n1, n2) {
  return (asU32(n1) + asU32(n2)) >>> 0;
}

/* ============================================================
   ABI v19 — PGDADDSIB2 + PGDADDSIB3
   (slot-2/slot-3 sibling AddBestiary* mutators 0x92aaf0+0x92abd0,
   helpers 0x92ab40+0x92ac20)
   ============================================================ */

/* The slot-2 / slot-3 sibling AddBestiary* write mutators immediately
   preceding the v18 PGDADDKILL. The v18 handoff read the four VAs
   0x92aaf0 / 0x92ab40 / 0x92abd0 / 0x92ac20 as full AddBestiaryKill-
   shaped bodies with their own unlock dispatches; the machine is TWO
   wrapper/helper pairs, ALL FOUR zero ZHL matches (address-stable
   names; no unlock dispatch, no kill-count getter in the set):
     - PGDADDSIB2: wrapper 0x92aaf0 (ret 8 @0x92ab35 ok / @0x92ab3c
       fail; caller 0x774461) -> helper 0x92ab40 (ret 4; @0x92ab58
       readonly-fail, @0x92aba5 found, @0x92abc5 insert), slot-2
       header base 0xf74.
     - PGDADDSIB3: wrapper 0x92abd0 (ret 8 @0x92ac15 ok / @0x92ac1c
       fail; caller 0x7780c8) -> helper 0x92ac20 (ret 4; @0x92ac38
       readonly-fail, @0x92ac85 found, @0x92aca5 insert), slot-3
       header base 0xf7c.
   Wrapper template (SLOT2 evidence VAs): readonly gate `cmp byte
   [esi+1],0 ; jne fail` @0x92aaf6/0x92aafa; container find (push
   variant @0x92aafc / push type @0x92ab05 / lea ecx,[game+0x2a670]
   @0x92ab08 / call 0x695030 @0x92ab0e); rec gate `test eax,eax ; je
   fail` @0x92ab13/0x92ab15; gate byte `cmp byte [eax+0xe8],0 ; je
   fail` @0x92ab17/0x92ab1e; key `mov ecx,[eax] ; shl ecx,0xc ; or
   ecx,[eax+4] ; shl ecx,8` @0x92ab20..0x92ab28; `push ecx ; mov
   ecx,esi ; call helper` @0x92ab2b/0x92ab2c/0x92ab2e (the wrapper
   RETURNS the helper's bool). Helper template: aligned prologue
   `55 8b ec 83 e4 f8 83 ec 10`; its OWN readonly gate `cmp byte
   [ecx+1],0 ; je continue` @0x92ab49/0x92ab4f (fail path ret 4
   @0x92ab58); `mov edi,[ebp+8]` (key arg); map find 0x4288a0 on the
   slot header @0x92ab74; node gates marker `cmp byte [eax+0xd],0 ;
   jne insert` @0x92ab7d/0x92ab81, key `cmp edi,[eax+0x10] ; jl
   insert` @0x92ab83/0x92ab86, header `cmp eax,[esi] ; je insert`
   @0x92ab88/0x92ab8a; FOUND `call 0x92ca70 ; inc dword [eax] ; mov
   al,1 ; ret 4` @0x92ab97/0x92ab9c/0x92aba5; NOT-FOUND `call
   0x92ca70 ; mov dword [eax],1 ; mov al,1 ; ret 4`
   @0x92abb3/0x92abba/0x92abc5. */

export const PGD_ADDSIB2_VA = 0x0092aaf0;
export const PGD_ADDSIB2_RET_OK_VA = 0x0092ab35;
export const PGD_ADDSIB2_RET_FAIL_VA = 0x0092ab3c;
export const PGD_ADDSIB2_CALL_SITES = 1;
export const PGD_ADDSIB2_CALL_SITE_VAS = Object.freeze([0x00774461]);
export const PGD_ADDSIB2_HELPER_VA = 0x0092ab40;
export const PGD_ADDSIB2_HELPER_RET_OK_VA = 0x0092aba5;
export const PGD_ADDSIB2_HELPER_RET_INSERT_VA = 0x0092abc5;
export const PGD_ADDSIB2_HELPER_RET_READONLY_FAIL_VA = 0x0092ab58;
export const PGD_ADDSIB2_SLOT2_HEADER_OFF = 0xf74;
export const PGD_ADDSIB2_MARKER_OFF = 0xd;
export const PGD_ADDSIB2_KEY_OFF = 0x10;
export const PGD_ADDSIB2_VALUE_OFF = 0x14;
export const PGD_ADDSIB2_GAME_VA = 0x00c7169c;
export const PGD_ADDSIB2_CONTAINER_OFF = 0x2a670;
export const PGD_ADDSIB2_GATE_BYTE_OFF = 0xe8;
export const PGD_ADDSIB2_CONTAINER_FIND_VA = 0x00695030;
export const PGD_ADDSIB2_MAP_FIND_VA = 0x004288a0;
export const PGD_ADDSIB2_VALUE_ACCESSOR_VA = 0x0092ca70;
export const PGD_ADDSIB2_READONLY_CMP_VA = 0x0092aaf6;
export const PGD_ADDSIB2_READONLY_JNE_VA = 0x0092aafa;
export const PGD_ADDSIB2_REC_TEST_VA = 0x0092ab13;
export const PGD_ADDSIB2_REC_JE_VA = 0x0092ab15;
export const PGD_ADDSIB2_GATE_CMP_VA = 0x0092ab17;
export const PGD_ADDSIB2_GATE_JE_VA = 0x0092ab1e;
export const PGD_ADDSIB2_KEY_SHIFT12_VA = 0x0092ab22;
export const PGD_ADDSIB2_KEY_OR_VA = 0x0092ab25;
export const PGD_ADDSIB2_KEY_SHIFT8_VA = 0x0092ab28;
export const PGD_ADDSIB2_HELPER_CALL_SITE_VA = 0x0092ab2e;
export const PGD_ADDSIB2_HELPER_READONLY_CMP_VA = 0x0092ab49;
export const PGD_ADDSIB2_HELPER_READONLY_JE_VA = 0x0092ab4f;
export const PGD_ADDSIB2_MAP_FIND_CALL_VA = 0x0092ab74;
export const PGD_ADDSIB2_NODE_MARKER_CMP_VA = 0x0092ab7d;
export const PGD_ADDSIB2_NODE_MARKER_JNE_VA = 0x0092ab81;
export const PGD_ADDSIB2_NODE_KEY_CMP_VA = 0x0092ab83;
export const PGD_ADDSIB2_NODE_KEY_JL_VA = 0x0092ab86;
export const PGD_ADDSIB2_NODE_HEADER_CMP_VA = 0x0092ab88;
export const PGD_ADDSIB2_NODE_HEADER_JE_VA = 0x0092ab8a;
export const PGD_ADDSIB2_STORE_INC_VA = 0x0092ab9c;
export const PGD_ADDSIB2_STORE_SET1_VA = 0x0092abba;

export const PGD_ADDSIB3_VA = 0x0092abd0;
export const PGD_ADDSIB3_RET_OK_VA = 0x0092ac15;
export const PGD_ADDSIB3_RET_FAIL_VA = 0x0092ac1c;
export const PGD_ADDSIB3_CALL_SITES = 1;
export const PGD_ADDSIB3_CALL_SITE_VAS = Object.freeze([0x007780c8]);
export const PGD_ADDSIB3_HELPER_VA = 0x0092ac20;
export const PGD_ADDSIB3_HELPER_RET_OK_VA = 0x0092ac85;
export const PGD_ADDSIB3_HELPER_RET_INSERT_VA = 0x0092aca5;
export const PGD_ADDSIB3_HELPER_RET_READONLY_FAIL_VA = 0x0092ac38;
export const PGD_ADDSIB3_SLOT3_HEADER_OFF = 0xf7c;
export const PGD_ADDSIB3_MARKER_OFF = 0xd;
export const PGD_ADDSIB3_KEY_OFF = 0x10;
export const PGD_ADDSIB3_VALUE_OFF = 0x14;
export const PGD_ADDSIB3_GAME_VA = 0x00c7169c;
export const PGD_ADDSIB3_CONTAINER_OFF = 0x2a670;
export const PGD_ADDSIB3_GATE_BYTE_OFF = 0xe8;
export const PGD_ADDSIB3_CONTAINER_FIND_VA = 0x00695030;
export const PGD_ADDSIB3_MAP_FIND_VA = 0x004288a0;
export const PGD_ADDSIB3_VALUE_ACCESSOR_VA = 0x0092ca70;
export const PGD_ADDSIB3_READONLY_CMP_VA = 0x0092abd6;
export const PGD_ADDSIB3_READONLY_JNE_VA = 0x0092abda;
export const PGD_ADDSIB3_REC_TEST_VA = 0x0092abf3;
export const PGD_ADDSIB3_REC_JE_VA = 0x0092abf5;
export const PGD_ADDSIB3_GATE_CMP_VA = 0x0092abf7;
export const PGD_ADDSIB3_GATE_JE_VA = 0x0092abfe;
export const PGD_ADDSIB3_KEY_SHIFT12_VA = 0x0092ac02;
export const PGD_ADDSIB3_KEY_OR_VA = 0x0092ac05;
export const PGD_ADDSIB3_KEY_SHIFT8_VA = 0x0092ac08;
export const PGD_ADDSIB3_HELPER_CALL_SITE_VA = 0x0092ac0e;
export const PGD_ADDSIB3_HELPER_READONLY_CMP_VA = 0x0092ac29;
export const PGD_ADDSIB3_HELPER_READONLY_JE_VA = 0x0092ac2f;
export const PGD_ADDSIB3_MAP_FIND_CALL_VA = 0x0092ac54;
export const PGD_ADDSIB3_NODE_MARKER_CMP_VA = 0x0092ac5d;
export const PGD_ADDSIB3_NODE_MARKER_JNE_VA = 0x0092ac61;
export const PGD_ADDSIB3_NODE_KEY_CMP_VA = 0x0092ac63;
export const PGD_ADDSIB3_NODE_KEY_JL_VA = 0x0092ac66;
export const PGD_ADDSIB3_NODE_HEADER_CMP_VA = 0x0092ac68;
export const PGD_ADDSIB3_NODE_HEADER_JE_VA = 0x0092ac6a;
export const PGD_ADDSIB3_STORE_INC_VA = 0x0092ac7c;
export const PGD_ADDSIB3_STORE_SET1_VA = 0x0092ac9a;

export function pgdBestiaryAddSib2Va() { return PGD_ADDSIB2_VA; }
export function pgdBestiaryAddSib2RetOkVa() { return PGD_ADDSIB2_RET_OK_VA; }
export function pgdBestiaryAddSib2RetFailVa() { return PGD_ADDSIB2_RET_FAIL_VA; }
export function pgdBestiaryAddSib2CallSiteCount() { return PGD_ADDSIB2_CALL_SITES; }
export function pgdBestiaryAddSib2CallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDSIB2_CALL_SITES) return 0;
  return PGD_ADDSIB2_CALL_SITE_VAS[i] >>> 0;
}
export function pgdBestiaryAddSib2HelperVa() { return PGD_ADDSIB2_HELPER_VA; }
export function pgdBestiaryAddSib2HelperRetOkVa() { return PGD_ADDSIB2_HELPER_RET_OK_VA; }
export function pgdBestiaryAddSib2HelperRetInsertVa() { return PGD_ADDSIB2_HELPER_RET_INSERT_VA; }
export function pgdBestiaryAddSib2HelperRetReadonlyFailVa() { return PGD_ADDSIB2_HELPER_RET_READONLY_FAIL_VA; }
export function pgdBestiaryAddSib2Slot2HeaderOff() { return PGD_ADDSIB2_SLOT2_HEADER_OFF; }
export function pgdBestiaryAddSib2MarkerOff() { return PGD_ADDSIB2_MARKER_OFF; }
export function pgdBestiaryAddSib2KeyOff() { return PGD_ADDSIB2_KEY_OFF; }
export function pgdBestiaryAddSib2ValueOff() { return PGD_ADDSIB2_VALUE_OFF; }
export function pgdBestiaryAddSib2GameVa() { return PGD_ADDSIB2_GAME_VA; }
export function pgdBestiaryAddSib2ContainerOff() { return PGD_ADDSIB2_CONTAINER_OFF; }
export function pgdBestiaryAddSib2GateByteOff() { return PGD_ADDSIB2_GATE_BYTE_OFF; }
export function pgdBestiaryAddSib2ContainerFindVa() { return PGD_ADDSIB2_CONTAINER_FIND_VA; }
export function pgdBestiaryAddSib2MapFindVa() { return PGD_ADDSIB2_MAP_FIND_VA; }
export function pgdBestiaryAddSib2ValueAccessorVa() { return PGD_ADDSIB2_VALUE_ACCESSOR_VA; }
export function pgdBestiaryAddSib2ReadonlyCmpVa() { return PGD_ADDSIB2_READONLY_CMP_VA; }
export function pgdBestiaryAddSib2ReadonlyJneVa() { return PGD_ADDSIB2_READONLY_JNE_VA; }
export function pgdBestiaryAddSib2RecTestVa() { return PGD_ADDSIB2_REC_TEST_VA; }
export function pgdBestiaryAddSib2RecJeVa() { return PGD_ADDSIB2_REC_JE_VA; }
export function pgdBestiaryAddSib2GateCmpVa() { return PGD_ADDSIB2_GATE_CMP_VA; }
export function pgdBestiaryAddSib2GateJeVa() { return PGD_ADDSIB2_GATE_JE_VA; }
export function pgdBestiaryAddSib2KeyShift12Va() { return PGD_ADDSIB2_KEY_SHIFT12_VA; }
export function pgdBestiaryAddSib2KeyOrVa() { return PGD_ADDSIB2_KEY_OR_VA; }
export function pgdBestiaryAddSib2KeyShift8Va() { return PGD_ADDSIB2_KEY_SHIFT8_VA; }
export function pgdBestiaryAddSib2HelperCallSiteVa() { return PGD_ADDSIB2_HELPER_CALL_SITE_VA; }
export function pgdBestiaryAddSib2HelperReadonlyCmpVa() { return PGD_ADDSIB2_HELPER_READONLY_CMP_VA; }
export function pgdBestiaryAddSib2HelperReadonlyJeVa() { return PGD_ADDSIB2_HELPER_READONLY_JE_VA; }
export function pgdBestiaryAddSib2MapFindCallVa() { return PGD_ADDSIB2_MAP_FIND_CALL_VA; }
export function pgdBestiaryAddSib2NodeMarkerCmpVa() { return PGD_ADDSIB2_NODE_MARKER_CMP_VA; }
export function pgdBestiaryAddSib2NodeMarkerJneVa() { return PGD_ADDSIB2_NODE_MARKER_JNE_VA; }
export function pgdBestiaryAddSib2NodeKeyCmpVa() { return PGD_ADDSIB2_NODE_KEY_CMP_VA; }
export function pgdBestiaryAddSib2NodeKeyJlVa() { return PGD_ADDSIB2_NODE_KEY_JL_VA; }
export function pgdBestiaryAddSib2NodeHeaderCmpVa() { return PGD_ADDSIB2_NODE_HEADER_CMP_VA; }
export function pgdBestiaryAddSib2NodeHeaderJeVa() { return PGD_ADDSIB2_NODE_HEADER_JE_VA; }
export function pgdBestiaryAddSib2StoreIncVa() { return PGD_ADDSIB2_STORE_INC_VA; }
export function pgdBestiaryAddSib2StoreSet1Va() { return PGD_ADDSIB2_STORE_SET1_VA; }

/* Wrapper + helper entry gates in machine order (wrapper 0x92aaf6..
   0x92ab1e, helper 0x92ab49/0x92ab4f): FAIL (0) when readonly_byte
   LOW BYTE != 0 OR rec_found == 0 OR gate_byte LOW BYTE == 0 OR
   readonly_byte_helper LOW BYTE != 0 (the helper re-checks the same
   pgd+1 byte; a distinct sampled input); else 1 (the wrapper returns
   the helper's al; both helper store paths set al=1). */
export function pgdBestiaryAddSib2Ok(readonlyByte, recFound, gateByte,
                                     readonlyByteHelper) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return 0;
  if (asU32(recFound) === 0) return 0;
  if ((asU32(gateByte) & 0xff) === 0) return 0;
  if ((asU32(readonlyByteHelper) & 0xff) !== 0) return 0;
  return 1;
}

/* The store helper's own bool: returns 0 ONLY when its readonly gate
   fails (`cmp byte [ecx+1],0 ; je continue` @0x92ab49/0x92ab4f); both
   store paths (`mov al,1` @0x92ab9e/@0x92abc0) return 1. */
export function pgdBestiaryAddSib2HelperOk(readonlyByteHelper) {
  if ((asU32(readonlyByteHelper) & 0xff) !== 0) return 0;
  return 1;
}

/* Key derivation @0x92ab20..0x92ab28 — same `((w0<<12)|w1)<<8` law as
   PGDKILL/PGDENC/PGDADDKILL, distinct evidence VAs. */
export function pgdBestiaryAddSib2Key(recWord0, recWord1) {
  let key = asU32(recWord0) << 12;
  key |= asU32(recWord1);
  return (key << 8) >>> 0;
}

/* Node gates @0x92ab7d..0x92ab8a: marker LOW BYTE zero, SIGNED
   key >= node_key, node != header ([esi] = slot-2 map header). */
export function pgdBestiaryAddSib2NodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((asU32(markerD) & 0xff) !== 0) return 0;
  if (asI32(key) < asI32(nodeKey)) return 0;
  if (asU32(nodeIsHeader) !== 0) return 0;
  return 1;
}

/* WRITE-side store decision (found `inc dword [eax]` @0x92ab9c, insert
   `mov dword [eax],1` @0x92abba): node_ok ? old+1 mod 2^32 : 1 —
   INSERT on gate fail, the PGDADDKILL inversion with no unlock
   dispatch. */
export function pgdBestiaryAddSib2StoreValue(nodeOk, oldValue) {
  if (asU32(nodeOk) !== 0) {
    return (asU32(oldValue) + 1) >>> 0;
  }
  return 1;
}

export function pgdBestiaryAddSib3Va() { return PGD_ADDSIB3_VA; }
export function pgdBestiaryAddSib3RetOkVa() { return PGD_ADDSIB3_RET_OK_VA; }
export function pgdBestiaryAddSib3RetFailVa() { return PGD_ADDSIB3_RET_FAIL_VA; }
export function pgdBestiaryAddSib3CallSiteCount() { return PGD_ADDSIB3_CALL_SITES; }
export function pgdBestiaryAddSib3CallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDSIB3_CALL_SITES) return 0;
  return PGD_ADDSIB3_CALL_SITE_VAS[i] >>> 0;
}
export function pgdBestiaryAddSib3HelperVa() { return PGD_ADDSIB3_HELPER_VA; }
export function pgdBestiaryAddSib3HelperRetOkVa() { return PGD_ADDSIB3_HELPER_RET_OK_VA; }
export function pgdBestiaryAddSib3HelperRetInsertVa() { return PGD_ADDSIB3_HELPER_RET_INSERT_VA; }
export function pgdBestiaryAddSib3HelperRetReadonlyFailVa() { return PGD_ADDSIB3_HELPER_RET_READONLY_FAIL_VA; }
export function pgdBestiaryAddSib3Slot3HeaderOff() { return PGD_ADDSIB3_SLOT3_HEADER_OFF; }
export function pgdBestiaryAddSib3MarkerOff() { return PGD_ADDSIB3_MARKER_OFF; }
export function pgdBestiaryAddSib3KeyOff() { return PGD_ADDSIB3_KEY_OFF; }
export function pgdBestiaryAddSib3ValueOff() { return PGD_ADDSIB3_VALUE_OFF; }
export function pgdBestiaryAddSib3GameVa() { return PGD_ADDSIB3_GAME_VA; }
export function pgdBestiaryAddSib3ContainerOff() { return PGD_ADDSIB3_CONTAINER_OFF; }
export function pgdBestiaryAddSib3GateByteOff() { return PGD_ADDSIB3_GATE_BYTE_OFF; }
export function pgdBestiaryAddSib3ContainerFindVa() { return PGD_ADDSIB3_CONTAINER_FIND_VA; }
export function pgdBestiaryAddSib3MapFindVa() { return PGD_ADDSIB3_MAP_FIND_VA; }
export function pgdBestiaryAddSib3ValueAccessorVa() { return PGD_ADDSIB3_VALUE_ACCESSOR_VA; }
export function pgdBestiaryAddSib3ReadonlyCmpVa() { return PGD_ADDSIB3_READONLY_CMP_VA; }
export function pgdBestiaryAddSib3ReadonlyJneVa() { return PGD_ADDSIB3_READONLY_JNE_VA; }
export function pgdBestiaryAddSib3RecTestVa() { return PGD_ADDSIB3_REC_TEST_VA; }
export function pgdBestiaryAddSib3RecJeVa() { return PGD_ADDSIB3_REC_JE_VA; }
export function pgdBestiaryAddSib3GateCmpVa() { return PGD_ADDSIB3_GATE_CMP_VA; }
export function pgdBestiaryAddSib3GateJeVa() { return PGD_ADDSIB3_GATE_JE_VA; }
export function pgdBestiaryAddSib3KeyShift12Va() { return PGD_ADDSIB3_KEY_SHIFT12_VA; }
export function pgdBestiaryAddSib3KeyOrVa() { return PGD_ADDSIB3_KEY_OR_VA; }
export function pgdBestiaryAddSib3KeyShift8Va() { return PGD_ADDSIB3_KEY_SHIFT8_VA; }
export function pgdBestiaryAddSib3HelperCallSiteVa() { return PGD_ADDSIB3_HELPER_CALL_SITE_VA; }
export function pgdBestiaryAddSib3HelperReadonlyCmpVa() { return PGD_ADDSIB3_HELPER_READONLY_CMP_VA; }
export function pgdBestiaryAddSib3HelperReadonlyJeVa() { return PGD_ADDSIB3_HELPER_READONLY_JE_VA; }
export function pgdBestiaryAddSib3MapFindCallVa() { return PGD_ADDSIB3_MAP_FIND_CALL_VA; }
export function pgdBestiaryAddSib3NodeMarkerCmpVa() { return PGD_ADDSIB3_NODE_MARKER_CMP_VA; }
export function pgdBestiaryAddSib3NodeMarkerJneVa() { return PGD_ADDSIB3_NODE_MARKER_JNE_VA; }
export function pgdBestiaryAddSib3NodeKeyCmpVa() { return PGD_ADDSIB3_NODE_KEY_CMP_VA; }
export function pgdBestiaryAddSib3NodeKeyJlVa() { return PGD_ADDSIB3_NODE_KEY_JL_VA; }
export function pgdBestiaryAddSib3NodeHeaderCmpVa() { return PGD_ADDSIB3_NODE_HEADER_CMP_VA; }
export function pgdBestiaryAddSib3NodeHeaderJeVa() { return PGD_ADDSIB3_NODE_HEADER_JE_VA; }
export function pgdBestiaryAddSib3StoreIncVa() { return PGD_ADDSIB3_STORE_INC_VA; }
export function pgdBestiaryAddSib3StoreSet1Va() { return PGD_ADDSIB3_STORE_SET1_VA; }

/* Same template as sib2 (separable exported bodies so a slot-local
   mistranscription breaks only its own pair's tests). */
export function pgdBestiaryAddSib3Ok(readonlyByte, recFound, gateByte,
                                     readonlyByteHelper) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return 0;
  if (asU32(recFound) === 0) return 0;
  if ((asU32(gateByte) & 0xff) === 0) return 0;
  if ((asU32(readonlyByteHelper) & 0xff) !== 0) return 0;
  return 1;
}
export function pgdBestiaryAddSib3HelperOk(readonlyByteHelper) {
  if ((asU32(readonlyByteHelper) & 0xff) !== 0) return 0;
  return 1;
}
export function pgdBestiaryAddSib3Key(recWord0, recWord1) {
  let key = asU32(recWord0) << 12;
  key |= asU32(recWord1);
  return (key << 8) >>> 0;
}
export function pgdBestiaryAddSib3NodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((asU32(markerD) & 0xff) !== 0) return 0;
  if (asI32(key) < asI32(nodeKey)) return 0;
  if (asU32(nodeIsHeader) !== 0) return 0;
  return 1;
}
export function pgdBestiaryAddSib3StoreValue(nodeOk, oldValue) {
  if (asU32(nodeOk) !== 0) {
    return (asU32(oldValue) + 1) >>> 0;
  }
  return 1;
}

/* ============================================================
   ABI v20 — PGDADDCH
   (PersistentGameData::AddChallenge dispatcher 0x92a7b0, EXACT ZHL
    `__thiscall void AddChallenge(int challengeID)`, 9 pattern bytes;
    ret 4 @0x92aa2c; ALIVE caller 0x704f84 byte-scan verified)
   ============================================================ */

export const PGD_ADDCH_VA = 0x0092a7b0;
export const PGD_ADDCH_RET_FAIL_VA = 0x0092aa2c;
export const PGD_ADDCH_RET_FAIL_TAIL_VA = 0x0092aa2b;
export const PGD_ADDCH_CALL_SITES = 1;
export const PGD_ADDCH_CALL_SITE_VAS = Object.freeze([0x00704f84]);
export const PGD_ADDCH_READONLY_CMP_VA = 0x0092a7b3;
export const PGD_ADDCH_READONLY_JNE_VA = 0x0092a7ba;
export const PGD_ADDCH_ARG_GATE1_CMP_VA = 0x0092a7c0;
export const PGD_ADDCH_ARG_GATE1_JA_VA = 0x0092a7c3;
export const PGD_ADDCH_FLAG_STORE_VA = 0x0092a7c9;
export const PGD_ADDCH_FLAG_OFF = 0xe6f;
export const PGD_ADDCH_DEC_VA = 0x0092a7d1;
export const PGD_ADDCH_ARG_GATE2_CMP_VA = 0x0092a7d2;
export const PGD_ADDCH_ARG_GATE2_JA_VA = 0x0092a7d5;
export const PGD_ADDCH_JUMP_VA = 0x0092a7db;
export const PGD_ADDCH_TABLE_VA = 0x0092aa30;
export const PGD_ADDCH_TABLE_ENTRIES = 0x2d;
export const PGD_ADDCH_FIRST_ARM_VA = 0x0092a7e2;
export const PGD_ADDCH_LAST_ARM_VA = 0x0092aa1e;
export const PGD_ADDCH_TAIL_TARGET_VA = 0x00929a20;
export const PGD_ADDCH_MAX_ARG = 0x2d;
export const PGD_ADDCH_MAX_INDEX = 0x2c;
/* Unlock ids by table index 0..44 (arg = index + 1). Re-read
   dword-for-dword from the image @0x92aa30 AND cross-checked against
   the arm immediates at each arm VA (two independent extractions). */
export const PGD_ADDCH_UNLOCK_IDS = Object.freeze([
  0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x78, 0x60, 0x61, 0x62,
  0x63, 0x64, 0x3c, 0x3f, 0x65, 0x66, 0x67, 0x68, 0x3e, 0x5f,
  0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
  0x14b, 0x14c, 0x14d, 0x14e, 0x14f, 0x205, 0x206, 0x207, 0x208,
  0x209, 0x20a, 0x213, 0x214, 0x215, 0x21a,
]);
/* The 45 table dwords (arm VAs) as read from the image @0x92aa30. */
export const PGD_ADDCH_TABLE_ARMS = Object.freeze([
  0x0092a7e2, 0x0092a7ef, 0x0092a7fc, 0x0092a809, 0x0092a816,
  0x0092a823, 0x0092a830, 0x0092a83d, 0x0092a84a, 0x0092a857,
  0x0092a864, 0x0092a871, 0x0092a87e, 0x0092a88b, 0x0092a898,
  0x0092a8a5, 0x0092a8b2, 0x0092a8bf, 0x0092a8cc, 0x0092a8d9,
  0x0092a8e6, 0x0092a8f3, 0x0092a900, 0x0092a90d, 0x0092a91a,
  0x0092a927, 0x0092a934, 0x0092a941, 0x0092a94e, 0x0092a95b,
  0x0092a968, 0x0092a975, 0x0092a982, 0x0092a98f, 0x0092a99c,
  0x0092a9a9, 0x0092a9b6, 0x0092a9c3, 0x0092a9d0, 0x0092a9dd,
  0x0092a9ea, 0x0092a9f7, 0x0092aa04, 0x0092aa11, 0x0092aa1e,
]);

export function pgdAddChallengeVa() { return PGD_ADDCH_VA; }
export function pgdAddChallengeRetFailVa() { return PGD_ADDCH_RET_FAIL_VA; }
export function pgdAddChallengeRetFailTailVa() { return PGD_ADDCH_RET_FAIL_TAIL_VA; }
export function pgdAddChallengeCallSiteCount() { return PGD_ADDCH_CALL_SITES; }
export function pgdAddChallengeCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDCH_CALL_SITES) return 0;
  return PGD_ADDCH_CALL_SITE_VAS[i] >>> 0;
}
export function pgdAddChallengeReadonlyCmpVa() { return PGD_ADDCH_READONLY_CMP_VA; }
export function pgdAddChallengeReadonlyJneVa() { return PGD_ADDCH_READONLY_JNE_VA; }
export function pgdAddChallengeArgGate1CmpVa() { return PGD_ADDCH_ARG_GATE1_CMP_VA; }
export function pgdAddChallengeArgGate1JaVa() { return PGD_ADDCH_ARG_GATE1_JA_VA; }
export function pgdAddChallengeFlagStoreVa() { return PGD_ADDCH_FLAG_STORE_VA; }
export function pgdAddChallengeFlagOff() { return PGD_ADDCH_FLAG_OFF; }
export function pgdAddChallengeDecVa() { return PGD_ADDCH_DEC_VA; }
export function pgdAddChallengeArgGate2CmpVa() { return PGD_ADDCH_ARG_GATE2_CMP_VA; }
export function pgdAddChallengeArgGate2JaVa() { return PGD_ADDCH_ARG_GATE2_JA_VA; }
export function pgdAddChallengeJumpVa() { return PGD_ADDCH_JUMP_VA; }
export function pgdAddChallengeTableVa() { return PGD_ADDCH_TABLE_VA; }
export function pgdAddChallengeTableEntries() { return PGD_ADDCH_TABLE_ENTRIES; }
export function pgdAddChallengeFirstArmVa() { return PGD_ADDCH_FIRST_ARM_VA; }
export function pgdAddChallengeLastArmVa() { return PGD_ADDCH_LAST_ARM_VA; }
export function pgdAddChallengeTailTargetVa() { return PGD_ADDCH_TAIL_TARGET_VA; }
export function pgdAddChallengeMaxArg() { return PGD_ADDCH_MAX_ARG; }
export function pgdAddChallengeMaxIndex() { return PGD_ADDCH_MAX_INDEX; }
export function pgdAddChallengeTableEntryVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDCH_TABLE_ENTRIES) return 0;
  return PGD_ADDCH_TABLE_ARMS[i] >>> 0;
}
export function pgdAddChallengeUnlockId(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDCH_TABLE_ENTRIES) return 0;
  return PGD_ADDCH_UNLOCK_IDS[i];
}

/* Entry gates in machine order (0x92a7b3/0x92a7ba readonly LOW BYTE,
   0x92a7c0/0x92a7c3 arg UNSIGNED > 0x2d): decides whether the FLAG
   STORE byte [pgd+0xe6f+arg]=1 runs @0x92a7c9. The store executes
   BEFORE the dispatch gate, so arg 0 STOREs the flag byte (readonly
   ok, 0 <= 0x2d) yet never unlocks. */
export function pgdAddChallengeFlagStoreGate(readonlyByte, arg) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return 0;
  if (asU32(arg) > 0x2d) return 0;
  return 1;
}

/* Full dispatch decision: flag_store AND `dec eax ; cmp eax,0x2c ;
   ja fail` (0x92a7d1/0x92a7d2/0x92a7d5) — (arg-1) UNSIGNED > 0x2c
   fails. arg == 0 -> (0-1) mod 2^32 = 0xffffffff > 0x2c -> 0. */
export function pgdAddChallengeDispatchGate(readonlyByte, arg) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return 0;
  if (asU32(arg) > 0x2d) return 0;
  if ((asU32(arg) - 1) >>> 0 > 0x2c) return 0;
  return 1;
}

/* Store address law: flag byte offset = 0xe6f + arg (mod 2^32) —
   `mov byte [eax+ecx+0xe6f],1` @0x92a7c9. */
export function pgdAddChallengeFlagByteOff(arg) {
  return ((0xe6f + asU32(arg)) >>> 0);
}

/* Tail-call selection: unlock id = table[arg-1] if the dispatch gate
   passes (arg in [1, 0x2d]); else 0 (no arm reached, ret 4 @0x92aa2c
   through the fail tail 0x92aa2b). */
export function pgdAddChallengeUnlockIdForArg(arg) {
  if (asU32(arg) > 0x2d) return 0;
  const index = (asU32(arg) - 1) >>> 0;
  if (index > 0x2c) return 0;
  return PGD_ADDCH_UNLOCK_IDS[index];
}

/* ============================================================
   ABI v21 — PGDADDBOSS
   (PersistentGameData::AddBoss mutator 0x92a5e0, EXACT ZHL
   `__thiscall void AddBoss(int bossID)`, 12 pattern bytes; ret 4
   @0x92a79f; ALIVE callers 0x7fc01f / 0x7ff7a8 byte-scan verified;
   int3 pad @0x92a7a2 — the 0x92a700 dump lands mid-instruction)
   ============================================================
   Evidence: section-notes/pgd-v21/ (cpu-dump 0x92a5e0..0x92a7a1;
   readonly LOW BYTE gate cmp byte [esi+1],0 ; jne fail @0x92a5e6/
   0x92a5ea; arg gate cmp eax,0x68 ; jge fail SIGNED no floor
   @0x92a5f3/0x92a5f6; flag store mov byte [eax+esi+0xe07],1
   @0x92a602; dirty store mov byte [esi],1 @0x92a60c; host log
   (1, 0xb7ae90, bossID) cdecl @0x92a60f -> 0xa112c0; eight
   sequential ALL-nonzero AND-gated TryUnlock calls; tail
   0x92a79d pop esi ; pop ebp ; ret 4 @0x92a79f) */

export const PGD_ADDBOSS_VA = 0x0092a5e0;
export const PGD_ADDBOSS_RET_FAIL_VA = 0x0092a79f;
export const PGD_ADDBOSS_RET_FAIL_TAIL_VA = 0x0092a79d;
export const PGD_ADDBOSS_CALL_SITES = 2;
export const PGD_ADDBOSS_CALL_SITE_VAS = Object.freeze([
  0x007fc01f, 0x007ff7a8,
]);
export const PGD_ADDBOSS_READONLY_CMP_VA = 0x0092a5e6;
export const PGD_ADDBOSS_READONLY_JNE_VA = 0x0092a5ea;
export const PGD_ADDBOSS_ARG_GATE_CMP_VA = 0x0092a5f3;
export const PGD_ADDBOSS_ARG_GATE_JGE_VA = 0x0092a5f6;
export const PGD_ADDBOSS_FLAG_STORE_VA = 0x0092a602;
export const PGD_ADDBOSS_FLAG_OFF = 0xe07;
export const PGD_ADDBOSS_DIRTY_STORE_VA = 0x0092a60c;
export const PGD_ADDBOSS_DIRTY_OFF = 0;
export const PGD_ADDBOSS_LOG_STRING_VA = 0x00b7ae90;
export const PGD_ADDBOSS_LOG_CALL_VA = 0x0092a60f;
export const PGD_ADDBOSS_LOG_CALLEE_VA = 0x00a112c0;
export const PGD_ADDBOSS_UNLOCK_CHAIN_VA = 0x0092a617;
export const PGD_ADDBOSS_UNLOCK_BLOCKS = 8;
export const PGD_ADDBOSS_TAIL_TARGET_VA = 0x00929a20;
export const PGD_ADDBOSS_MAX_ARG = 0x67;
export const PGD_ADDBOSS_MAX_INDEX = 0x67;
/* The eight unlock blocks in machine order. Each block's gate is an
   ALL-nonzero AND over its byte offsets (`cmp byte [esi+off],0 ;
   je <next block>`); when all are nonzero the machine pushes the id
   and `mov ecx,esi ; call 0x929a20` (TryUnlock, THIS stays HOST).
   first_cmp = first gate cmp VA, call_va = the TryUnlock call site,
   push_va = the id push VA. e0d is read by BOTH B3 and B8 (the
   machine re-reads; the laws must too). */
export const PGD_ADDBOSS_BLOCKS = Object.freeze([
  { firstCmpVa: 0x0092a617, callVa: 0x0092a651, pushVa: 0x0092a64d,
    unlockId: 0x56, byteOffs: Object.freeze([0xe08, 0xe09, 0xe14,
      0xe18, 0xe33, 0xe3f]) },
  { firstCmpVa: 0x0092a656, callVa: 0x0092a690, pushVa: 0x0092a68c,
    unlockId: 0x57, byteOffs: Object.freeze([0xe0a, 0xe0b, 0xe15,
      0xe23, 0xe36, 0xe34]) },
  { firstCmpVa: 0x0092a695, callVa: 0x0092a6c6, pushVa: 0x0092a6c2,
    unlockId: 0x58, byteOffs: Object.freeze([0xe0c, 0xe0d, 0xe16,
      0xe37, 0xe35]) },
  { firstCmpVa: 0x0092a6cb, callVa: 0x0092a6d8, pushVa: 0x0092a6d4,
    unlockId: 0xf, byteOffs: Object.freeze([0xe26]) },
  { firstCmpVa: 0x0092a6dd, callVa: 0x0092a711, pushVa: 0x0092a70a,
    unlockId: 0x174, byteOffs: Object.freeze([0xe10, 0xe11, 0xe12,
      0xe13, 0xe2d]) },
  { firstCmpVa: 0x0092a716, callVa: 0x0092a741, pushVa: 0x0092a73a,
    unlockId: 0x19c, byteOffs: Object.freeze([0xe54, 0xe52, 0xe53,
      0xe62]) },
  { firstCmpVa: 0x0092a746, callVa: 0x0092a771, pushVa: 0x0092a76a,
    unlockId: 0x19d, byteOffs: Object.freeze([0xe5a, 0xe57, 0xe51,
      0xe59]) },
  { firstCmpVa: 0x0092a776, callVa: 0x0092a798, pushVa: 0x0092a791,
    unlockId: 0x19e, byteOffs: Object.freeze([0xe0d, 0xe56, 0xe58]) },
]);

export function pgdAddBossVa() { return PGD_ADDBOSS_VA; }
export function pgdAddBossRetFailVa() { return PGD_ADDBOSS_RET_FAIL_VA; }
export function pgdAddBossRetFailTailVa() { return PGD_ADDBOSS_RET_FAIL_TAIL_VA; }
export function pgdAddBossCallSiteCount() { return PGD_ADDBOSS_CALL_SITES; }
export function pgdAddBossCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDBOSS_CALL_SITES) return 0;
  return PGD_ADDBOSS_CALL_SITE_VAS[i] >>> 0;
}
export function pgdAddBossReadonlyCmpVa() { return PGD_ADDBOSS_READONLY_CMP_VA; }
export function pgdAddBossReadonlyJneVa() { return PGD_ADDBOSS_READONLY_JNE_VA; }
export function pgdAddBossArgGateCmpVa() { return PGD_ADDBOSS_ARG_GATE_CMP_VA; }
export function pgdAddBossArgGateJgeVa() { return PGD_ADDBOSS_ARG_GATE_JGE_VA; }
export function pgdAddBossFlagStoreVa() { return PGD_ADDBOSS_FLAG_STORE_VA; }
export function pgdAddBossFlagOff() { return PGD_ADDBOSS_FLAG_OFF; }
export function pgdAddBossDirtyStoreVa() { return PGD_ADDBOSS_DIRTY_STORE_VA; }
export function pgdAddBossDirtyOff() { return PGD_ADDBOSS_DIRTY_OFF; }
export function pgdAddBossLogStringVa() { return PGD_ADDBOSS_LOG_STRING_VA; }
export function pgdAddBossLogCallVa() { return PGD_ADDBOSS_LOG_CALL_VA; }
export function pgdAddBossLogCalleeVa() { return PGD_ADDBOSS_LOG_CALLEE_VA; }
export function pgdAddBossUnlockChainVa() { return PGD_ADDBOSS_UNLOCK_CHAIN_VA; }
export function pgdAddBossUnlockBlocks() { return PGD_ADDBOSS_UNLOCK_BLOCKS; }
export function pgdAddBossTailTargetVa() { return PGD_ADDBOSS_TAIL_TARGET_VA; }
export function pgdAddBossMaxArg() { return PGD_ADDBOSS_MAX_ARG; }
export function pgdAddBossMaxIndex() { return PGD_ADDBOSS_MAX_INDEX; }
export function pgdAddBossBlockFirstCmpVa(blockIndex) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  return PGD_ADDBOSS_BLOCKS[b].firstCmpVa >>> 0;
}
export function pgdAddBossBlockCallVa(blockIndex) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  return PGD_ADDBOSS_BLOCKS[b].callVa >>> 0;
}
export function pgdAddBossBlockPushVa(blockIndex) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  return PGD_ADDBOSS_BLOCKS[b].pushVa >>> 0;
}
export function pgdAddBossBlockByteCount(blockIndex) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  return PGD_ADDBOSS_BLOCKS[b].byteOffs.length;
}
export function pgdAddBossBlockByteOff(blockIndex, slot) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  const s = asI32(slot);
  if (s < 0 || s >= PGD_ADDBOSS_BLOCKS[b].byteOffs.length) return 0;
  return PGD_ADDBOSS_BLOCKS[b].byteOffs[s] >>> 0;
}
export function pgdAddBossBlockUnlockId(blockIndex) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  return PGD_ADDBOSS_BLOCKS[b].unlockId;
}

/* Entry gates in machine order (0x92a5e6/0x92a5ea readonly LOW BYTE,
   0x92a5f3/0x92a5f6 arg >= 0x68 SIGNED): decides whether the flag
   store byte [pgd+0xe07+arg]=1 @0x92a602, the dirty byte [pgd]=1
   @0x92a60c, and the host log (1, "Boss %d added to SaveState\n",
   arg) cdecl @0x92a60f all run. SIGNED jge with NO floor: negative
   bossIDs pass (wrap the store offset) — the same law the v16
   isaac_pgd_boss_index_valid records. */
export function pgdAddBossEntryGate(readonlyByte, arg) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return 0;
  if (asI32(arg) >= 0x68) return 0;
  return 1;
}

/* Store address law: flag byte offset = 0xe07 + arg (mod 2^32) —
   `mov byte [eax+esi+0xe07],1` @0x92a602 (negatives underflow). */
export function pgdAddBossFlagByteOff(arg) {
  return ((0xe07 + asU32(arg)) >>> 0);
}

/* Per-block gate: 1 iff ALL bytes in the block's offset set are
   nonzero (`cmp byte [esi+off],0 ; je <next>` — a zero skips; an
   ALL-nonzero set calls). Only the block's declared byte count is
   read; trailing bN args are ignored, exactly as the machine reads
   only its own offsets. */
export function pgdAddBossBlockGate(blockIndex, b0, b1, b2, b3, b4, b5) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  const bytes = [b0, b1, b2, b3, b4, b5];
  for (let s = 0; s < PGD_ADDBOSS_BLOCKS[b].byteOffs.length; ++s) {
    if ((asU32(bytes[s]) & 0xff) === 0) return 0;
  }
  return 1;
}

/* Unlock decision: block_gate ? block_unlock_id : 0 — the machine
   pushes <id> and `mov ecx,esi ; call 0x929a20` only when the whole
   block's gate passes. All eight blocks run in sequence; each call
   returns, so an earlier pass does not stop later blocks. */
export function pgdAddBossUnlockFires(blockIndex, b0, b1, b2, b3, b4, b5) {
  const b = asI32(blockIndex);
  if (b < 0 || b >= PGD_ADDBOSS_UNLOCK_BLOCKS) return 0;
  if (!pgdAddBossBlockGate(b, b0, b1, b2, b3, b4, b5)) return 0;
  return PGD_ADDBOSS_BLOCKS[b].unlockId;
}

/* ============================================================
   ABI v22 — PGDADDMINI
   (PersistentGameData::AddMiniBoss mutator 0x92a520, no exact ZHL
   — self-named by its warning string "[warn] AddMiniBoss: invalid
   miniboss id %d" @0xb7aecc; address-stable; ret 4 @0x92a5d3;
   ALIVE callers 0x7ffff1 / 0x800010 byte-scan verified; TWO rets:
   OK @0x92a5be, fail/warn tail @0x92a5d3; int3 pad @0x92a5d6)
   ============================================================
   Evidence: section-notes/pgd-v22/ (readonly LOW BYTE gate cmp byte
   [esi+1],0 ; jne fail @0x92a529/0x92a52d; id window cmp eax,0xf ;
   ja warn UNSIGNED @0x92a533/0x92a536; id->index fold
   @0x92a53c..0x92a557: lea ecx,[eax-7] ; cmp ecx,6 ; ja (7..0xd ->
   0..6), cmp eax,0xe ; jne (0xe -> 6 via mov eax,6), cmp eax,6 ; jg
   (0xf DROPPED silently — no store, no log); flag store mov byte
   [eax+esi+0xe00],1 @0x92a55f; dirty store mov byte [esi],1
   @0x92a569; host log (1, 0xb7aeac, idx) cdecl @0x92a56c ->
   0xa112c0; ALL-SET gate: cmp byte [esi+0xe00..0xe06],0 ; je tail
   @0x92a574..0x92a5b1; push 0x16 ; mov ecx,esi ; call 0x929a20
   @0x92a5b7 — TryUnlock stays HOST)

   LAWS must AGREE with the v2-era PGDX sec5 oracle (pgdSec5*):
   same id->index remap, same exclusive/warn window, same seven-slot
   ALL-nonzero unlock gate. The NEW outcome law makes the warn/silent
   distinction explicit (sec5_store_slot conflates -1). */

export const PGD_ADDMINI_VA = 0x0092a520;
export const PGD_ADDMINI_RET_FAIL_VA = 0x0092a5d3;
export const PGD_ADDMINI_RET_FAIL_TAIL_VA = 0x0092a5d1;
export const PGD_ADDMINI_RET_OK_VA = 0x0092a5be;
export const PGD_ADDMINI_CALL_SITES = 2;
export const PGD_ADDMINI_CALL_SITE_VAS = Object.freeze([
  0x007ffff1, 0x00800010,
]);
export const PGD_ADDMINI_READONLY_CMP_VA = 0x0092a529;
export const PGD_ADDMINI_READONLY_JNE_VA = 0x0092a52d;
export const PGD_ADDMINI_ARG_GATE_CMP_VA = 0x0092a533;
export const PGD_ADDMINI_ARG_GATE_JA_VA = 0x0092a536;
export const PGD_ADDMINI_MAP_LEA_VA = 0x0092a53c;
export const PGD_ADDMINI_MAP_CMP_VA = 0x0092a53f;
export const PGD_ADDMINI_MAP_JA_VA = 0x0092a542;
export const PGD_ADDMINI_ALIAS_CMP_VA = 0x0092a548;
export const PGD_ADDMINI_ALIAS_JNE_VA = 0x0092a54b;
export const PGD_ADDMINI_ALIAS_MOV_VA = 0x0092a54d;
export const PGD_ADDMINI_TAIL_CMP_VA = 0x0092a554;
export const PGD_ADDMINI_TAIL_JG_VA = 0x0092a557;
export const PGD_ADDMINI_FLAG_STORE_VA = 0x0092a55f;
export const PGD_ADDMINI_FLAG_OFF = 0xe00;
export const PGD_ADDMINI_DIRTY_STORE_VA = 0x0092a569;
export const PGD_ADDMINI_DIRTY_OFF = 0;
export const PGD_ADDMINI_LOG_STRING_VA = 0x00b7aeac;
export const PGD_ADDMINI_LOG_CALL_VA = 0x0092a56c;
export const PGD_ADDMINI_LOG_CALLEE_VA = 0x00a112c0;
export const PGD_ADDMINI_WARN_STRING_VA = 0x00b7aecc;
export const PGD_ADDMINI_WARN_CALL_VA = 0x0092a5c9;
export const PGD_ADDMINI_UNLOCK_FIRST_CMP_VA = 0x0092a574;
export const PGD_ADDMINI_UNLOCK_PUSH_VA = 0x0092a5b3;
export const PGD_ADDMINI_UNLOCK_CALL_VA = 0x0092a5b7;
export const PGD_ADDMINI_UNLOCK_TARGET_VA = 0x00929a20;
export const PGD_ADDMINI_SLOTS = 7;
export const PGD_ADDMINI_UNLOCK_ID = 0x16;
export const PGD_ADDMINI_ID_MAX = 0xf;
export const PGD_ADDMINI_REMAP_BASE = 7;
export const PGD_ADDMINI_REMAP_SPAN = 6;
export const PGD_ADDMINI_ALIAS_ID = 0xe;

export function pgdAddMiniVa() { return PGD_ADDMINI_VA; }
export function pgdAddMiniRetFailVa() { return PGD_ADDMINI_RET_FAIL_VA; }
export function pgdAddMiniRetFailTailVa() { return PGD_ADDMINI_RET_FAIL_TAIL_VA; }
export function pgdAddMiniRetOkVa() { return PGD_ADDMINI_RET_OK_VA; }
export function pgdAddMiniCallSiteCount() { return PGD_ADDMINI_CALL_SITES; }
export function pgdAddMiniCallSiteVa(index) {
  const i = asI32(index);
  if (i < 0 || i >= PGD_ADDMINI_CALL_SITES) return 0;
  return PGD_ADDMINI_CALL_SITE_VAS[i] >>> 0;
}
export function pgdAddMiniReadonlyCmpVa() { return PGD_ADDMINI_READONLY_CMP_VA; }
export function pgdAddMiniReadonlyJneVa() { return PGD_ADDMINI_READONLY_JNE_VA; }
export function pgdAddMiniArgGateCmpVa() { return PGD_ADDMINI_ARG_GATE_CMP_VA; }
export function pgdAddMiniArgGateJaVa() { return PGD_ADDMINI_ARG_GATE_JA_VA; }
export function pgdAddMiniMapLeaVa() { return PGD_ADDMINI_MAP_LEA_VA; }
export function pgdAddMiniMapCmpVa() { return PGD_ADDMINI_MAP_CMP_VA; }
export function pgdAddMiniMapJaVa() { return PGD_ADDMINI_MAP_JA_VA; }
export function pgdAddMiniAliasCmpVa() { return PGD_ADDMINI_ALIAS_CMP_VA; }
export function pgdAddMiniAliasJneVa() { return PGD_ADDMINI_ALIAS_JNE_VA; }
export function pgdAddMiniAliasMovVa() { return PGD_ADDMINI_ALIAS_MOV_VA; }
export function pgdAddMiniTailCmpVa() { return PGD_ADDMINI_TAIL_CMP_VA; }
export function pgdAddMiniTailJgVa() { return PGD_ADDMINI_TAIL_JG_VA; }
export function pgdAddMiniFlagStoreVa() { return PGD_ADDMINI_FLAG_STORE_VA; }
export function pgdAddMiniFlagOff() { return PGD_ADDMINI_FLAG_OFF; }
export function pgdAddMiniDirtyStoreVa() { return PGD_ADDMINI_DIRTY_STORE_VA; }
export function pgdAddMiniDirtyOff() { return PGD_ADDMINI_DIRTY_OFF; }
export function pgdAddMiniLogStringVa() { return PGD_ADDMINI_LOG_STRING_VA; }
export function pgdAddMiniLogCallVa() { return PGD_ADDMINI_LOG_CALL_VA; }
export function pgdAddMiniLogCalleeVa() { return PGD_ADDMINI_LOG_CALLEE_VA; }
export function pgdAddMiniWarnStringVa() { return PGD_ADDMINI_WARN_STRING_VA; }
export function pgdAddMiniWarnCallVa() { return PGD_ADDMINI_WARN_CALL_VA; }
export function pgdAddMiniUnlockFirstCmpVa() { return PGD_ADDMINI_UNLOCK_FIRST_CMP_VA; }
export function pgdAddMiniUnlockPushVa() { return PGD_ADDMINI_UNLOCK_PUSH_VA; }
export function pgdAddMiniUnlockCallVa() { return PGD_ADDMINI_UNLOCK_CALL_VA; }
export function pgdAddMiniUnlockTargetVa() { return PGD_ADDMINI_UNLOCK_TARGET_VA; }
export function pgdAddMiniSlots() { return PGD_ADDMINI_SLOTS; }
export function pgdAddMiniUnlockId() { return PGD_ADDMINI_UNLOCK_ID; }
export function pgdAddMiniIdMax() { return PGD_ADDMINI_ID_MAX; }
export function pgdAddMiniRemapBase() { return PGD_ADDMINI_REMAP_BASE; }
export function pgdAddMiniRemapSpan() { return PGD_ADDMINI_REMAP_SPAN; }
export function pgdAddMiniAliasId() { return PGD_ADDMINI_ALIAS_ID; }

/* id -> index remap, branch by branch (0x92a533..0x92a557):
   `cmp eax,0xf ; ja warn` UNSIGNED -> asU32(arg) > 0xf is out of
   range (-1, the WARN path); `lea ecx,[eax-7] ; cmp ecx,6 ; ja`
   folds 7..0xd onto 0..6; `cmp eax,0xe ; jne` aliases 0xe onto slot
   6; the signed `cmp eax,6 ; jg` DROPS 0xf without a word. -1 means
   nothing is stored. Identical to the PGDX sec5 oracle. */
export function pgdAddMiniIndexRemap(arg) {
  const a = asU32(arg);
  if (a > PGD_ADDMINI_ID_MAX) return -1;
  const folded = asU32(a - PGD_ADDMINI_REMAP_BASE);
  if (folded <= PGD_ADDMINI_REMAP_SPAN) return asI32(folded);
  if (a === PGD_ADDMINI_ALIAS_ID) return PGD_ADDMINI_REMAP_SPAN;
  if (a > PGD_ADDMINI_REMAP_SPAN) return -1;
  return asI32(a);
}

/* The WARN trigger: 1 iff asU32(arg) > 0xf (the `ja` @0x92a536 —
   0xf itself does NOT warn, it is dropped later). */
export function pgdAddMiniOutOfRange(arg) {
  return asU32(arg) > PGD_ADDMINI_ID_MAX ? 1 : 0;
}

/* Full decision, in machine order:
   -1  readonly fail (`cmp byte [esi+1],0 ; jne @0x92a52d` — LOW
       BYTE, no work at all)
   -2  out-of-range warn (`ja @0x92a536`: logs (1, 0xb7aecc, ORIGINAL
       arg); negatives warn too)
   -3  silent drop (arg == 0xf: the signed `jg @0x92a557` to the same
       fail tail, but NOTHING runs — no store, no log)
   0..6 stored slot (flag store + dirty + log (1, 0xb7aeac, idx) run)
   The sec5 oracle's store_slot conflates -2/-3 into -1; this law
   makes the branch-level distinction explicit. */
export function pgdAddMiniOutcome(readonlyByte, arg) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return -1;
  const a = asU32(arg);
  if (a > PGD_ADDMINI_ID_MAX) return -2;
  const idx = pgdAddMiniIndexRemap(a);
  if (idx < 0) return -3;
  return idx;
}

/* Store address law: flag byte offset = 0xe00 + index (mod 2^32) —
   `mov byte [eax+esi+0xe00],1` @0x92a55f with eax = the mapped idx
   (0..6 from the id->index fold). */
export function pgdAddMiniFlagByteOff(index) {
  return ((PGD_ADDMINI_FLAG_OFF + asU32(index)) >>> 0);
}

/* ALL-SET gate: 1 iff ALL seven slot bytes e00..e06 are nonzero
   (`cmp byte [esi+off],0 ; je <tail>` chain @0x92a574..0x92a5b1 —
   ANY zero skips; ALL nonzero reach the TryUnlock call). */
export function pgdAddMiniUnlockGate(b0, b1, b2, b3, b4, b5, b6) {
  const bytes = [b0, b1, b2, b3, b4, b5, b6];
  for (let s = 0; s < PGD_ADDMINI_SLOTS; ++s) {
    if ((asU32(bytes[s]) & 0xff) === 0) return 0;
  }
  return 1;
}

/* Unlock decision: gate ? 0x16 : 0 — `push 0x16 ; mov ecx,esi ;
   call 0x929a20` (TryUnlock, this = esi) @0x92a5b7 runs only when
   the whole ALL-SET gate passes. */
export function pgdAddMiniUnlockFires(b0, b1, b2, b3, b4, b5, b6) {
  if (!pgdAddMiniUnlockGate(b0, b1, b2, b3, b4, b5, b6)) return 0;
  return PGD_ADDMINI_UNLOCK_ID;
}

/* ============================================================
   ABI v23 — PGDADSED + PGDK41
   (the two remaining v1-"unidentified" mutator islands between the
   count probe and the landed TryImportRebirthLocalSave 0x92b2e0;
   the whole 0x92b22a..0x92b2e0 span is pure-covered after this
   unit)
   ============================================================
   PGDADSED = the "seed added to SaveState" mutator 0x0092b230 (no
   exact ZHL — self-named by its log string "Seed %d added to
   SaveState\n" @0xb7ae58; address-stable; ret 4 @0x92b25f; int3
   pad 0x92b262..0x92b26e; inbound from the update slice 0x68cdc0
   @0x69166e). Evidence: section-notes/pgd-v23/ (readonly LOW BYTE
   gate cmp byte [ecx+1],0 ; jne ret @0x92b233/0x92b237 — no work
   at all when set; unchecked slot store mov byte
   [eax+ecx+0xf14],1 @0x92b244 with eax = the seed — byte
   [pgd+0xf14+SEED] = 1, the RAW byte index, never masked or
   bounded (0xf14 = PGD_OFF_SEC10_BYTES, 0x50 slots =
   PGD_SEC10_SLOTS); unconditional slot-0 clear mov byte
   [ecx+0xf14],0 @0x92b24c right after — seed==0 self-cancels;
   dirty mov byte [ecx],1 @0x92b253 (pgd+0 = PGD_OFF_CHANGES_MADE);
   the log args (1, 0xb7ae58, seed) are pushed BEFORE the stores
   and the cdecl call @0x92b256 -> 0xa112c0 stays HOST)
   PGDK41 = the 41-bit two-word popcount gate 0x0092b270 (no exact
   ZHL; address-stable; ret 8 @0x92b2d9): mov [ebx+0x5ac],eax
   @0x92b281 (first arg -> counters[188]) + mov [ebx+0xa7c],eax
   @0x92b28a (second arg -> counters[496]; 0x2bc =
   PGD_OFF_EVENT_COUNTERS); the 41-iteration loop
   @0x92b295..0x92b2ba counts set bits over bits 0..40 via bts
   esi,ecx (bit index masked to 5 bits), cmp ecx,0x20 ; cmovae
   edx,esi ; xor esi,edx (low word zeroed for i>=32), and
   esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je (lo bit i for i<32,
   hi bit i-32 for i>=32), jl 0x92b295 bound 0x29 = 41; cmp edi,5
   ; jl 0x92b2d0 @0x92b2bf/@0x92b2c2 SIGNED gate; push 0x143 ;
   mov ecx,ebx ; call 0x929a20 @0x92b2c4/@0x92b2cb (TryUnlock
   stays HOST) fires only at popcount >= 5; the dirty store mov
   byte [ebx],1 @0x92b2d2 is UNCONDITIONAL (runs even when the
   unlock does not).

   LAWS must AGREE with the v2-era PGDX oracles (sec10/mask41):
   same unchecked seed index / resets-slot0 / self-cancelling laws,
   same 41-bit two-word popcount + >= 5 unlock threshold. v23 adds
   the address-stable evidence family with branch-level laws. */

export const PGD_ADSED_VA = 0x0092b230;
export const PGD_ADSED_RET_VA = 0x0092b25f;
export const PGD_ADSED_READONLY_CMP_VA = 0x0092b233;
export const PGD_ADSED_READONLY_JNE_VA = 0x0092b237;
export const PGD_ADSED_SLOT_STORE_VA = 0x0092b244;
export const PGD_ADSED_SLOT0_CLEAR_VA = 0x0092b24c;
export const PGD_ADSED_SLOT_BASE = 0xf14;
export const PGD_ADSED_SLOTS = 0x50;
export const PGD_ADSED_DIRTY_STORE_VA = 0x0092b253;
export const PGD_ADSED_DIRTY_OFF = 0;
export const PGD_ADSED_READONLY_OFF = 1;
export const PGD_ADSED_LOG_STRING_VA = 0x00b7ae58;
export const PGD_ADSED_LOG_CALL_VA = 0x0092b256;
export const PGD_ADSED_LOG_CALLEE_VA = 0x00a112c0;

export function pgdAdsEdVa() { return PGD_ADSED_VA; }
export function pgdAdsEdRetVa() { return PGD_ADSED_RET_VA; }
export function pgdAdsEdReadonlyCmpVa() { return PGD_ADSED_READONLY_CMP_VA; }
export function pgdAdsEdReadonlyJneVa() { return PGD_ADSED_READONLY_JNE_VA; }
export function pgdAdsEdSlotStoreVa() { return PGD_ADSED_SLOT_STORE_VA; }
export function pgdAdsEdSlot0ClearVa() { return PGD_ADSED_SLOT0_CLEAR_VA; }
export function pgdAdsEdSlotBase() { return PGD_ADSED_SLOT_BASE; }
export function pgdAdsEdSlots() { return PGD_ADSED_SLOTS; }
export function pgdAdsEdDirtyStoreVa() { return PGD_ADSED_DIRTY_STORE_VA; }
export function pgdAdsEdDirtyOff() { return PGD_ADSED_DIRTY_OFF; }
export function pgdAdsEdReadonlyOff() { return PGD_ADSED_READONLY_OFF; }
export function pgdAdsEdLogStringVa() { return PGD_ADSED_LOG_STRING_VA; }
export function pgdAdsEdLogCallVa() { return PGD_ADSED_LOG_CALL_VA; }
export function pgdAdsEdLogCalleeVa() { return PGD_ADSED_LOG_CALLEE_VA; }

/* The readonly gate: 1 iff the LOW BYTE of pgd+1 is zero — `cmp
   byte [ecx+1],0 ; jne ret` @0x92b233/@0x92b237. Byte test:
   0x100 / 0x10000 (low byte 0) must RUN, 0x1 / 0x1ff must not. */
export function pgdAdsEdGate(readonlyByte) {
  return ((asU32(readonlyByte) & 0xff) === 0) ? 1 : 0;
}

/* Full decision in machine order:
   -1  readonly fail (low byte of pgd+1 != 0 — NO work at all: no
       slot store, no slot-0 clear, no dirty, no log)
   0   stored: slot[seed]=1, slot[0]=0, dirty=1, host log
       (1, 0xb7ae58, seed) scheduled. */
export function pgdAdsEdOutcome(readonlyByte, seed) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return -1;
  return 0;
}

/* Store-index law: the seed IS the byte index, used raw — `mov byte
   [eax+ecx+0xf14],1` @0x92b244 with eax = seed (u32 passthrough:
   no mask, no bounds, no remap). A seed >= 0x50 writes outside the
   array — original behaviour. */
export function pgdAdsEdStoreIndex(seed) {
  return asU32(seed);
}

/* Self-cancelling law: when seed == 0 the slot store lands on slot 0
   and the unconditional `mov byte [ecx+0xf14],0` @0x92b24c undoes
   it — net nothing remains set. 1 iff seed == 0. */
export function pgdAdsEdSelfCancelling(seed) {
  return asU32(seed) === 0 ? 1 : 0;
}

/* Net slot-0 value after the mutator: -1 when the readonly gate is
   closed (nothing ran — slot 0 untouched, caller pre-state
   unknown); 0 when it ran — the slot-0 clear @0x92b24c is
   UNCONDITIONAL, so slot 0 always ends at 0 (even seed==0, after
   the transient 1). */
export function pgdAdsEdSlot0After(readonlyByte, seed) {
  if ((asU32(readonlyByte) & 0xff) !== 0) return -1;
  return 0;
}

/* Dirty law: 1 iff the mutator ran — the `mov byte [ecx],1`
   @0x92b253 dirty store fires whenever the readonly gate opens,
   INCLUDING seed==0 (the self-cancelling case still dirties). */
export function pgdAdsEdDirtyFires(readonlyByte, seed) {
  return ((asU32(readonlyByte) & 0xff) === 0) ? 1 : 0;
}

export const PGD_K41_VA = 0x0092b270;
export const PGD_K41_RET_VA = 0x0092b2d9;
export const PGD_K41_LO_COUNTER_STORE_VA = 0x0092b281;
export const PGD_K41_HI_COUNTER_STORE_VA = 0x0092b28a;
export const PGD_K41_LO_COUNTER_INDEX = 188;
export const PGD_K41_HI_COUNTER_INDEX = 496;
export const PGD_K41_BITS = 0x29;
export const PGD_K41_LOOP_BTS_VA = 0x0092b29b;
export const PGD_K41_LOOP_BOUND_CMP_VA = 0x0092b2b7;
export const PGD_K41_LOOP_BOUND_JL_VA = 0x0092b2ba;
export const PGD_K41_LOOP_OR_JE_VA = 0x0092b2b1;
export const PGD_K41_GATE_CMP_VA = 0x0092b2bf;
export const PGD_K41_GATE_JL_VA = 0x0092b2c2;
export const PGD_K41_UNLOCK_PUSH_VA = 0x0092b2c4;
export const PGD_K41_UNLOCK_CALL_VA = 0x0092b2cb;
export const PGD_K41_UNLOCK_TARGET_VA = 0x00929a20;
export const PGD_K41_UNLOCK_ID = 0x143;
export const PGD_K41_UNLOCK_THRESHOLD = 5;
export const PGD_K41_DIRTY_STORE_VA = 0x0092b2d2;
export const PGD_K41_DIRTY_OFF = 0;
export const PGD_K41_COUNTER_BASE = 0x2bc;

export function pgdK41Va() { return PGD_K41_VA; }
export function pgdK41RetVa() { return PGD_K41_RET_VA; }
export function pgdK41LoCounterStoreVa() { return PGD_K41_LO_COUNTER_STORE_VA; }
export function pgdK41HiCounterStoreVa() { return PGD_K41_HI_COUNTER_STORE_VA; }
export function pgdK41LoCounterIndex() { return PGD_K41_LO_COUNTER_INDEX; }
export function pgdK41HiCounterIndex() { return PGD_K41_HI_COUNTER_INDEX; }
export function pgdK41Bits() { return PGD_K41_BITS; }
export function pgdK41LoopBtsVa() { return PGD_K41_LOOP_BTS_VA; }
export function pgdK41LoopBoundCmpVa() { return PGD_K41_LOOP_BOUND_CMP_VA; }
export function pgdK41LoopBoundJlVa() { return PGD_K41_LOOP_BOUND_JL_VA; }
export function pgdK41LoopOrJeVa() { return PGD_K41_LOOP_OR_JE_VA; }
export function pgdK41GateCmpVa() { return PGD_K41_GATE_CMP_VA; }
export function pgdK41GateJlVa() { return PGD_K41_GATE_JL_VA; }
export function pgdK41UnlockPushVa() { return PGD_K41_UNLOCK_PUSH_VA; }
export function pgdK41UnlockCallVa() { return PGD_K41_UNLOCK_CALL_VA; }
export function pgdK41UnlockTargetVa() { return PGD_K41_UNLOCK_TARGET_VA; }
export function pgdK41UnlockId() { return PGD_K41_UNLOCK_ID; }
export function pgdK41UnlockThreshold() { return PGD_K41_UNLOCK_THRESHOLD; }
export function pgdK41DirtyStoreVa() { return PGD_K41_DIRTY_STORE_VA; }
export function pgdK41DirtyOff() { return PGD_K41_DIRTY_OFF; }
export function pgdK41CounterBase() { return PGD_K41_COUNTER_BASE; }

/* 41-bit popcount over (lo, hi), branch by branch (0x92b295..0x92b2ba):
   for i in 0..40, `bts esi,ecx` sets bit (i & 31) — the x86 bts
   count is masked to 5 bits; `cmp ecx,0x20 ; cmovae edx,esi ; xor
   esi,edx` moves that bit into edx and zeroes esi when i >= 32;
   `and esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je` — the hit test is
   lo bit i for i < 32 and hi bit (i - 32) for i >= 32 (loop bound
   `cmp eax,0x29 ; jl` = 41 iterations). No word beyond bit 40 of
   the 64-bit value is ever examined. */
export function pgdK41Popcount(lo, hi) {
  const low = asU32(lo);
  const high = asU32(hi);
  let n = 0;
  for (let i = 0; i < PGD_K41_BITS; ++i) {
    const bit = asU32(1 << (i & 31));
    if ((i < 32 ? (low & bit) : (high & bit)) !== 0) n += 1;
  }
  return n;
}

/* The popcount >= 5 gate — `cmp edi,5 ; jl 0x92b2d0` @0x92b2bf/
   @0x92b2c2 (SIGNED compare; popcount is 0..41 so sign does not
   bind here). */
export function pgdK41Gate(lo, hi) {
  return pgdK41Popcount(lo, hi) >= PGD_K41_UNLOCK_THRESHOLD ? 1 : 0;
}

/* Unlock decision: popcount >= 5 ? 0x143 : 0 — `push 0x143 ; mov
   ecx,ebx ; call 0x929a20` (TryUnlock, this = ebx) @0x92b2c4/
   @0x92b2cb runs only when the gate passes. */
export function pgdK41UnlockFires(lo, hi) {
  if (pgdK41Popcount(lo, hi) < PGD_K41_UNLOCK_THRESHOLD) return 0;
  return PGD_K41_UNLOCK_ID;
}

/* Dirty law: ALWAYS 1 — the `mov byte [ebx],1` @0x92b2d2 dirty
   store is unconditional; it runs even when the popcount gate fails
   (popcount < 5, no unlock call). */
export function pgdK41DirtyFires(lo, hi) {
  return 1;
}

/* Counter-store offset law: dword offset = 0x2bc + 4*index (mod
   2^32) — `mov [ebx+0x5ac],eax` (index 188 -> 0x5ac) @0x92b281 and
   `mov [ebx+0xa7c],eax` (index 496 -> 0xa7c) @0x92b28a, base 0x2bc
   = PGD_OFF_EVENT_COUNTERS. */
export function pgdK41CounterStoreOff(counterIndex) {
  return (PGD_K41_COUNTER_BASE + 4 * asU32(counterIndex)) >>> 0;
}

/* ============================================================
   ABI v27 — PGDIEC
   (PersistentGameData::IncreaseEventCounter 0x00929b40 — EXACT ZHL,
   21 pattern bytes; ret 8 @0x92a2c8; 74 inbound callers. The last
   un-landed achievement helper: v1's "TryUnlock cascade stays host"
   verdict was superseded by the v20/v21/v22 standard — gate laws
   pure, TryUnlock 0x929a20 typed-host. Evidence:
   section-notes/pgd-v28-929b40/ + cpu-dump/00929b40.txt +
   00929e38.txt.)
   Body: readonly LOW-BYTE gate @0x929b5e; SIGNED saturating counter
   store @0x929b68..0x929b7d (the landed event_counter_next law,
   byte-identical) at the UNCHECKED slot offset 0x2bc + 4*slot;
   dirty store @0x929b84 UNCONDITIONAL after the gate; then 52
   direct threshold->unlock rows @0x929b87..0x929ff8 (54 TryUnlock
   call sites; rows 27/28 fire TWO unlock ids per gate). Every row
   is `cmp u32 dword, IMM ; jb` UNSIGNED except row 1 (test/je
   NONZERO), row 16 (PAIR: 0x31c AND 0x320 both nonzero via jbe-vs-0)
   and row 41 (MODE: u32 >= 0x1f AND mode dword [0xc7169c]+8 == 1,
   host input, FULL DWORD compare). The group walk 0x92a000..0x92a253
   (vectors 0xbab240/0xbab380/0xbab510/0xbab540/0xbab5e0/0xbab610/
   0xbab640/0xbab670 + group table 0xc35ed0 stride 0x90 — ALL .data,
   runtime-mutable) and the five derived tail gates @0x92a259..
   0x92a2b3 (ecx `cmp,3 ; jl` SIGNED -> 0x15a; ecx 6 jl SIGNED ->
   0x15b; byte [ebp-0xc1] je -> 0x114; edi 0x11 jb UNSIGNED -> 0x223;
   ebx 0x22 jb UNSIGNED -> 0x27c) are HOST census: their values come
   from the .data walk, so they are NOT laws here.
   ============================================================ */

export const PGDIEC_VA = 0x00929b40;
export const PGDIEC_RET_VA = 0x0092a2c8;
export const PGDIEC_BODY_BYTES = 1928;
export const PGDIEC_CALL_SITES = 74;
export const PGDIEC_HOST_VA_TRY_UNLOCK = 0x00929a20;
export const PGDIEC_HOST_VA_COOKIE = 0x00aef12b;
export const PGDIEC_READONLY_OFF = 0x01;
export const PGDIEC_DIRTY_OFF = 0x00;
export const PGDIEC_COUNTER_BASE = 0x2bc;
export const PGDIEC_GATE_ROWS = 52;
export const PGDIEC_UNLOCK_CALLS = 54;
export const PGDIEC_KIND_GE = 1;
export const PGDIEC_KIND_NONZERO = 2;
export const PGDIEC_KIND_PAIR = 3;
export const PGDIEC_KIND_MODE = 4;
export const PGDIEC_MODE_GLOBAL_VA = 0x00c7169c;
export const PGDIEC_MODE_GLOBAL_OFF = 8;
export const PGDIEC_MODE_VALUE = 1;
export const PGDIEC_DIRTY_VA = 0x0092b84;
export const PGDIEC_COUNTER_LOAD_VA = 0x00929b68;
export const PGDIEC_READONLY_CMP_VA = 0x00929b5e;
export const PGDIEC_GROUP_WALK_VA = 0x0092a000;
export const PGDIEC_GROUP_TABLE_VA = 0x00c35ed0;
export const PGDIEC_GROUP_STRIDE = 0x90;

/* 52 rows in PE execution order; unlock_id2/call_va2 are 0 except
   rows 26/27 (0-indexed) which fire two ids per gate. */
export const PGDIEC_GATES = [
  { step: 0, kind: PGDIEC_KIND_NONZERO, gateVa: 0x00929b8d, off: 0x5e4, off2: 0, thr: 0, id: 0x167, id2: 0, callVa: 0x00929b98, callVa2: 0 },
  { step: 1, kind: PGDIEC_KIND_GE, gateVa: 0x00929ba3, off: 0x5e4, off2: 0, thr: 0xa, id: 0x181, id2: 0, callVa: 0x00929baf, callVa2: 0 },
  { step: 2, kind: PGDIEC_KIND_GE, gateVa: 0x00929bb4, off: 0x5dc, off2: 0, thr: 0xa, id: 0x179, id2: 0, callVa: 0x00929bc4, callVa2: 0 },
  { step: 3, kind: PGDIEC_KIND_GE, gateVa: 0x00929bc9, off: 0x5e0, off2: 0, thr: 5, id: 0x17e, id2: 0, callVa: 0x00929bd9, callVa2: 0 },
  { step: 4, kind: PGDIEC_KIND_GE, gateVa: 0x00929be4, off: 0x2c4, off2: 0, thr: 0x64, id: 0x55, id2: 0, callVa: 0x00929bed, callVa2: 0 },
  { step: 5, kind: PGDIEC_KIND_GE, gateVa: 0x00929bf8, off: 0x2c4, off2: 0, thr: 0x1f4, id: 0x15e, id2: 0, callVa: 0x00929c06, callVa2: 0 },
  { step: 6, kind: PGDIEC_KIND_GE, gateVa: 0x00929c11, off: 0x2c8, off2: 0, thr: 0xa, id: 0x1c, id2: 0, callVa: 0x00929c1a, callVa2: 0 },
  { step: 7, kind: PGDIEC_KIND_GE, gateVa: 0x00929c25, off: 0x2c8, off2: 0, thr: 0x64, id: 0xc, id2: 0, callVa: 0x00929c2e, callVa2: 0 },
  { step: 8, kind: PGDIEC_KIND_GE, gateVa: 0x00929c33, off: 0x2d8, off2: 0, thr: 4, id: 0x24, id2: 0, callVa: 0x00929c40, callVa2: 0 },
  { step: 9, kind: PGDIEC_KIND_GE, gateVa: 0x00929c45, off: 0x2e0, off2: 0, thr: 0xa, id: 0x1a, id2: 0, callVa: 0x00929c52, callVa2: 0 },
  { step: 10, kind: PGDIEC_KIND_GE, gateVa: 0x00929c57, off: 0x2d0, off2: 0, thr: 0x64, id: 0x91, id2: 0, callVa: 0x00929c67, callVa2: 0 },
  { step: 11, kind: PGDIEC_KIND_GE, gateVa: 0x00929c6c, off: 0x5c4, off2: 0, thr: 5, id: 0x161, id2: 0, callVa: 0x00929c7c, callVa2: 0 },
  { step: 12, kind: PGDIEC_KIND_GE, gateVa: 0x00929c87, off: 0x2e8, off2: 0, thr: 0xa, id: 0x44, id2: 0, callVa: 0x00929c90, callVa2: 0 },
  { step: 13, kind: PGDIEC_KIND_GE, gateVa: 0x00929c9b, off: 0x2e8, off2: 0, thr: 5, id: 0x39, id2: 0, callVa: 0x00929ca4, callVa2: 0 },
  { step: 14, kind: PGDIEC_KIND_GE, gateVa: 0x00929ca9, off: 0x2f0, off2: 0, thr: 5, id: 0x4e, id2: 0, callVa: 0x00929cb6, callVa2: 0 },
  { step: 15, kind: PGDIEC_KIND_PAIR, gateVa: 0x00929cbb, off: 0x31c, off2: 0x320, thr: 0, id: 0x29, id2: 0, callVa: 0x00929cd1, callVa2: 0 },
  { step: 16, kind: PGDIEC_KIND_GE, gateVa: 0x00929cd6, off: 0x2e4, off2: 0, thr: 0x64, id: 0x1e, id2: 0, callVa: 0x00929ce3, callVa2: 0 },
  { step: 17, kind: PGDIEC_KIND_GE, gateVa: 0x00929cee, off: 0x2c0, off2: 0, thr: 1, id: 0x51, id2: 0, callVa: 0x00929cf7, callVa2: 0 },
  { step: 18, kind: PGDIEC_KIND_GE, gateVa: 0x00929d02, off: 0x2c0, off2: 0, thr: 2, id: 0x96, id2: 0, callVa: 0x00929d0e, callVa2: 0 },
  { step: 19, kind: PGDIEC_KIND_GE, gateVa: 0x00929d19, off: 0x2c0, off2: 0, thr: 3, id: 8, id2: 0, callVa: 0x00929d22, callVa2: 0 },
  { step: 20, kind: PGDIEC_KIND_GE, gateVa: 0x00929d2d, off: 0x2c0, off2: 0, thr: 4, id: 0x8b, id2: 0, callVa: 0x00929d39, callVa2: 0 },
  { step: 21, kind: PGDIEC_KIND_GE, gateVa: 0x00929d44, off: 0x2c0, off2: 0, thr: 5, id: 0x21, id2: 0, callVa: 0x00929d4d, callVa2: 0 },
  { step: 22, kind: PGDIEC_KIND_GE, gateVa: 0x00929d58, off: 0x2c0, off2: 0, thr: 6, id: 0x8c, id2: 0, callVa: 0x00929d64, callVa2: 0 },
  { step: 23, kind: PGDIEC_KIND_GE, gateVa: 0x00929d6f, off: 0x2c0, off2: 0, thr: 7, id: 0x8d, id2: 0, callVa: 0x00929d7b, callVa2: 0 },
  { step: 24, kind: PGDIEC_KIND_GE, gateVa: 0x00929d86, off: 0x2c0, off2: 0, thr: 8, id: 0xa, id2: 0, callVa: 0x00929d8f, callVa2: 0 },
  { step: 25, kind: PGDIEC_KIND_GE, gateVa: 0x00929d9a, off: 0x2c0, off2: 0, thr: 9, id: 0xb, id2: 0, callVa: 0x00929da3, callVa2: 0 },
  { step: 26, kind: PGDIEC_KIND_GE, gateVa: 0x00929dae, off: 0x2c0, off2: 0, thr: 0xa, id: 0x20, id2: 0xea, callVa: 0x00929db7, callVa2: 0x00929dc3 },
  { step: 27, kind: PGDIEC_KIND_GE, gateVa: 0x00929dce, off: 0x2c0, off2: 0, thr: 0xb, id: 0x22, id2: 0x156, callVa: 0x00929dd7, callVa2: 0x00929dee },
  { step: 28, kind: PGDIEC_KIND_GE, gateVa: 0x00929df9, off: 0x2c0, off2: 0, thr: 0x10, id: 0x157, id2: 0, callVa: 0x00929e05, callVa2: 0 },
  { step: 29, kind: PGDIEC_KIND_GE, gateVa: 0x00929e10, off: 0x2c0, off2: 0, thr: 0x15, id: 0x158, id2: 0, callVa: 0x00929e1c, callVa2: 0 },
  { step: 30, kind: PGDIEC_KIND_GE, gateVa: 0x00929e27, off: 0x2c0, off2: 0, thr: 0x1e, id: 0x159, id2: 0, callVa: 0x00929e33, callVa2: 0 },
  { step: 31, kind: PGDIEC_KIND_GE, gateVa: 0x00929e38, off: 0x2ec, off2: 0, thr: 0x14, id: 0x3d, id2: 0, callVa: 0x00929e45, callVa2: 0 },
  { step: 32, kind: PGDIEC_KIND_GE, gateVa: 0x00929e4a, off: 0x2f4, off2: 0, thr: 0x64, id: 0x40, id2: 0, callVa: 0x00929e57, callVa2: 0 },
  { step: 33, kind: PGDIEC_KIND_GE, gateVa: 0x00929e62, off: 0x2f8, off2: 0, thr: 0xa, id: 0x42, id2: 0, callVa: 0x00929e6b, callVa2: 0 },
  { step: 34, kind: PGDIEC_KIND_GE, gateVa: 0x00929e76, off: 0x2f8, off2: 0, thr: 0x19, id: 0x17c, id2: 0, callVa: 0x00929e82, callVa2: 0 },
  { step: 35, kind: PGDIEC_KIND_GE, gateVa: 0x00929e8d, off: 0x2fc, off2: 0, thr: 0x14, id: 0x8e, id2: 0, callVa: 0x00929e99, callVa2: 0 },
  { step: 36, kind: PGDIEC_KIND_GE, gateVa: 0x00929ea4, off: 0x2fc, off2: 0, thr: 0x19, id: 0x178, id2: 0, callVa: 0x00929eb0, callVa2: 0 },
  { step: 37, kind: PGDIEC_KIND_GE, gateVa: 0x00929ebb, off: 0x2fc, off2: 0, thr: 0x32, id: 0x17f, id2: 0, callVa: 0x00929ec7, callVa2: 0 },
  { step: 38, kind: PGDIEC_KIND_GE, gateVa: 0x00929ecc, off: 0x300, off2: 0, thr: 0x1e, id: 0x93, id2: 0, callVa: 0x00929edc, callVa2: 0 },
  { step: 39, kind: PGDIEC_KIND_GE, gateVa: 0x00929ee1, off: 0x304, off2: 0, thr: 0x1e, id: 0x94, id2: 0, callVa: 0x00929ef1, callVa2: 0 },
  { step: 40, kind: PGDIEC_KIND_MODE, gateVa: 0x00929ef6, off: 0x5b4, off2: 0, thr: 0x1f, id: 0x145, id2: 0, callVa: 0x00929f11, callVa2: 0 },
  { step: 41, kind: PGDIEC_KIND_GE, gateVa: 0x00929f16, off: 0x5bc, off2: 0, thr: 5, id: 0x150, id2: 0, callVa: 0x00929f26, callVa2: 0 },
  { step: 42, kind: PGDIEC_KIND_GE, gateVa: 0x00929f2b, off: 0x5c0, off2: 0, thr: 7, id: 0x162, id2: 0, callVa: 0x00929f3b, callVa2: 0 },
  { step: 43, kind: PGDIEC_KIND_GE, gateVa: 0x00929f40, off: 0x5c8, off2: 0, thr: 0x14, id: 0x166, id2: 0, callVa: 0x00929f50, callVa2: 0 },
  { step: 44, kind: PGDIEC_KIND_GE, gateVa: 0x00929f55, off: 0x5cc, off2: 0, thr: 0x14, id: 0x16a, id2: 0, callVa: 0x00929f65, callVa2: 0 },
  { step: 45, kind: PGDIEC_KIND_GE, gateVa: 0x00929f6a, off: 0x5d0, off2: 0, thr: 0x32, id: 0x16c, id2: 0, callVa: 0x00929f7a, callVa2: 0 },
  { step: 46, kind: PGDIEC_KIND_GE, gateVa: 0x00929f7f, off: 0x5d4, off2: 0, thr: 0x14, id: 0x173, id2: 0, callVa: 0x00929f8f, callVa2: 0 },
  { step: 47, kind: PGDIEC_KIND_GE, gateVa: 0x00929f94, off: 0x5d8, off2: 0, thr: 0x32, id: 0x177, id2: 0, callVa: 0x00929fa4, callVa2: 0 },
  { step: 48, kind: PGDIEC_KIND_GE, gateVa: 0x00929fa9, off: 0xa70, off2: 0, thr: 0xa, id: 0x199, id2: 0, callVa: 0x00929fb9, callVa2: 0 },
  { step: 49, kind: PGDIEC_KIND_GE, gateVa: 0x00929fbe, off: 0xa74, off2: 0, thr: 0xa, id: 0x221, id2: 0, callVa: 0x00929fce, callVa2: 0 },
  { step: 50, kind: PGDIEC_KIND_GE, gateVa: 0x00929fd3, off: 0xa78, off2: 0, thr: 5, id: 0x20b, id2: 0, callVa: 0x00929fe3, callVa2: 0 },
  { step: 51, kind: PGDIEC_KIND_GE, gateVa: 0x00929fe8, off: 0x534, off2: 0, thr: 3, id: 0x197, id2: 0, callVa: 0x00929ff8, callVa2: 0 },
];

export function pgdIecVa() { return PGDIEC_VA; }
export function pgdIecRetVa() { return PGDIEC_RET_VA; }
export function pgdIecBodyBytes() { return PGDIEC_BODY_BYTES; }
export function pgdIecCallSiteCount() { return PGDIEC_CALL_SITES; }
export function pgdIecHostTryUnlockVa() { return PGDIEC_HOST_VA_TRY_UNLOCK; }
export function pgdIecHostCookieVa() { return PGDIEC_HOST_VA_COOKIE; }
export function pgdIecReadonlyOff() { return PGDIEC_READONLY_OFF; }
export function pgdIecDirtyOff() { return PGDIEC_DIRTY_OFF; }
export function pgdIecCounterBase() { return PGDIEC_COUNTER_BASE; }

/* `cmp byte [esi+1],0 ; jne skip-all` @0x929b5e — LOW BYTE gate. */
export function pgdIecGateOpen(readonly) {
  return asU8(readonly) === 0 ? 1 : 0;
}

/* `mov [esi+ebx*4+0x2bc],eax` — slot UNCHECKED (never masked). */
export function pgdIecCounterStoreOff(slot) {
  return (PGDIEC_COUNTER_BASE + 4 * asU32(slot)) >>> 0;
}

export function pgdIecDirtyFires(readonly) {
  return pgdIecGateOpen(readonly);
}

export function pgdIecGateRowCount() { return PGDIEC_GATE_ROWS; }

export function pgdIecGateRow(step) {
  const s = asI32(step);
  if (s < 0 || s >= PGDIEC_GATE_ROWS) return null;
  return PGDIEC_GATES[s];
}

/* The machine fires the TryUnlock call iff the row's compare does NOT
   skip. All GE rows are `cmp u32, IMM ; jb` UNSIGNED (opcode 72);
   NONZERO = `test ; je`; PAIR = two `jbe` vs 0 (both nonzero); MODE =
   GE AND mode_word == 1 (mode dword [0xc7169c]+8, FULL DWORD, host). */
export function pgdIecGateFires(step, counter, counter2, modeWord) {
  const g = pgdIecGateRow(step);
  if (!g) return 0;
  switch (g.kind) {
    case PGDIEC_KIND_NONZERO:
      return asU32(counter) !== 0 ? 1 : 0;
    case PGDIEC_KIND_PAIR:
      return asU32(counter) !== 0 && asU32(counter2) !== 0 ? 1 : 0;
    case PGDIEC_KIND_MODE:
      return asU32(counter) >= asU32(g.thr) &&
             asU32(modeWord) === PGDIEC_MODE_VALUE
        ? 1 : 0;
    case PGDIEC_KIND_GE:
    default:
      return asU32(counter) >= asU32(g.thr) ? 1 : 0;
  }
}

/* Composed unlock list for a row: the ids fired (1 or 2). */
export function pgdIecUnlocksAt(step, counter, counter2, modeWord) {
  if (!pgdIecGateFires(step, counter, counter2, modeWord)) return [];
  const g = pgdIecGateRow(step);
  return g.id2 ? [g.id, g.id2] : [g.id];
}
/* ============================================================
   ABI v28 — PGDULD (0x009296c0 tier-ladder decision island) +
   PGDHOST law pins (cookie 0xaef12b / checksum 0x683580)
   (the save-cluster final host-leaf assessment; evidence:
   section-notes/pgd-v28-hostleaf/ + cluster disasm
   output/decomp/5129df723e64/cluster-disasm.txt)
   ============================================================
   PGDULD body 0x9296c0..0x929788 (ret @0x929788, 200 bytes):
   1 direct E8 (typed-host TryUnlock 0x929a20 @0x929773), 0
   indirects, ZERO stores to this/.data (all stores stack-local
   [ebp-0x8/-0xc/-0x10/-0x1]). Reads: global [0xc7169c]+0x2a664/
   +0x2a668 (u32 start/end pair, .data runtime input), the 0xa4-
   stride segment vector table (ptr @ seg+0x48, count word @
   seg+0x4c), the BYTE flag this[entry+0x38], and the .rdata
   LADDER 0xb7b0b0 (46 u32 slots, loop uses 1..0x2d). Tier loop
   @0x9296d1..0x92977f (`jl` SIGNED cap 0x2e -> esi 1..0x2d).
0x9296eb..0x929703, the `shr edi,31 ; dec edi ; add edi,edx`
   fold. M = 0x63e7063f = ceil(2^38/164), 2^38 = 164*M - 92. For
   x < 2^31 the result equals floor(x/164) minus 1 at exact
   multiples of 164; the multiply-high +1 flip would need x >=
   2^38/92 = 0xb21d3e88 with x mod 164 == 163 — every such x is
   >= 2^31, where the signed imul path yields negative counts, so
   no flip is observable: the raw multiply is the law (BigInt-
   exact for every x).
   k @0x929709 `cmp esi,edi ; mov eax,edi ; cmovb eax,esi` =
   min_u32(tier, count) — UNSIGNED compare, so a wrapped negative
   count (u32 0xffffffff) selects the TIER.
   inner bound @0x92971e `mov ecx,[0x4c] ; sub ecx,[0x48] ; sar
   ecx,2` + `cmp ebx,ecx ; jae exit`: iterations = u32(n) where
   n = (countWord - ptr) >> 2 SAR (n <= 0 -> 0 iterations; a
   negative n would be 2^32+n unsigned — degenerate, never hit).
   flag @0x929746..0x929754 `movzx eax,[flag] ; cmp byte
   [entry+0x38],dl ; cmovne edx,eax ; mov [flag],dl`: per element
   flag = (byte != 0) ? flag : 0, reset to 1 at the tier head
   `c6 45 ff 01` @0x9296d8.
   fire @0x929759..0x929773 `cmp byte [flag],0 ; je skip` +
   `cmp esi,0x2d ; ja skip` (UNSIGNED) + `mov eax,[esi*4+0xb7b0b0]
   ; test eax,eax ; je skip` -> TryUnlock(ecx=this, eax=id).
   ============================================================ */

export const PGDULD_VA = 0x009296c0;
export const PGDULD_RET_VA = 0x00929788;
export const PGDULD_BODY_BYTES = 200;
export const PGDULD_CALL_SITES = 6;
export const PGDULD_HOST_VA_TRY_UNLOCK = 0x00929a20;
export const PGDULD_TRY_UNLOCK_CALL_VA = 0x00929773;
export const PGDULD_DIV_MAGIC = 0x63e7063f;
export const PGDULD_DIV_SHIFT = 38;
export const PGDULD_DIV_MOD = 164;
export const PGDULD_GLOBAL_VA = 0x00c7169c;
export const PGDULD_RANGE_OFF = 0x2a664;
export const PGDULD_SEG_STRIDE = 0xa4;
export const PGDULD_SEG_PTR_OFF = 0x48;
export const PGDULD_SEG_COUNT_OFF = 0x4c;
export const PGDULD_ENTRY_FLAG_OFF = 0x38;
export const PGDULD_LADDER_TABLE_VA = 0x00b7b0b0;
export const PGDULD_LADDER_ROWS = 46;
export const PGDULD_TIER_MAX = 0x2d;
export const PGDULD_COUNT_LOAD_VA = 0x009296dc;
export const PGDULD_SEG_INDEX_VA = 0x00929709;
export const PGDULD_FLAG_STORE_VA = 0x009296d8;
export const PGDULD_INNER_LOOP_VA = 0x00929721;
export const PGDULD_UNLOCK_GATE_VA = 0x00929759;
export const PGDULD_LADDER_LOAD_VA = 0x00929764;
export const PGDULD_LADDER_GATE_VA = 0x0092976d;

/* The .rdata ladder 0xb7b0b0, 46 u32 slots: index 0 unused, the
   tier loop reads [tier] for tier 1..0x2d; index 46 (0x706d6173
   "samp") is the NEXT const, not part of the table. Raw PE bytes
   (little-endian u32 at 0x7796b0). */
export const PGDU_LADDER = [
  0x000, 0x000, 0x000, 0x000, 0x09d, 0x09e, 0x09f, 0x0a0, 0x0a1,
  0x0a2, 0x0a3, 0x0a4, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000,
  0x000, 0x0a5, 0x0a6, 0x109, 0x10a, 0x10b, 0x10c, 0x10d, 0x10e,
  0x10f, 0x110, 0x111, 0x112, 0x115, 0x116, 0x117, 0x118, 0x119,
  0x000, 0x1fc, 0x1fd, 0x1fe, 0x1ff, 0x200, 0x201, 0x202, 0x203,
  0x204,
];

/* `sub ecx,[eax+0x2a664] ; mov eax,0x63e7063f ; imul ecx ; sar
   edx,6 ; mov edi,edx ; shr edi,31 ; dec edi ; add edi,edx`
   @0x9296eb..0x929703 — the BigInt-exact form. */
export function pgdUldCount(start, end) {
  const x = (asU32(end) - asU32(start)) | 0;
  const p = BigInt(x) * BigInt(PGDULD_DIV_MAGIC);
  let t = Number(p >> 32n); /* signed high32 (BigInt >> is floor) */
  t = t >> 6;               /* SAR */
  return t - (t >= 0 ? 1 : 0);
}

/* `cmp esi,edi ; mov eax,edi ; cmovb eax,esi` — min_u32. */
export function pgdUldSegmentIndex(count, tier) {
  const c = asU32(count), t = asU32(tier);
  return t < c ? t : c;
}

/* `sub ecx,[eax+edx+0x4c]... sar ecx,2 ; cmp ebx,ecx ; jae`
   — unsigned loop bound (0 when n <= 0). */
export function pgdUldLoopIterations(segPtr, segCountWord) {
  let n = (asU32(segCountWord) - asU32(segPtr)) | 0;
  n >>= 2;
  return n >>> 0;
}

/* `cmp byte [entry+0x38],dl ; cmovne edx,eax` — AND accumulate;
   entryByte is the LOW BYTE the PE tests. */
export function pgdUldFlagAccum(flag, entryByte) {
  return asU8(entryByte) !== 0 ? (flag ? 1 : 0) : 0;
}

export function pgdUldUnlockId(tier) {
  const t = asU32(tier);
  return t < PGDULD_LADDER_ROWS ? PGDU_LADDER[t] : 0;
}

/* flag && tier <= 0x2d (unsigned) && ladder id != 0 -> TryUnlock. */
export function pgdUldFire(flag, tier) {
  if (!flag) return 0;
  if (asU32(tier) > PGDULD_TIER_MAX) return 0;
  return pgdUldUnlockId(tier) !== 0 ? 1 : 0;
}

/* ============================================================
   ABI v28 — PGDHOST law pins (cookie 0xaef12b / checksum
   0x683580) — verified this unit:
   cookie 0xaef12b is PURE: `cmp ecx,[0xbf93b4] ; jne 0xaef134 ;
   ret ; jmp 0xaef775` (8 bytes, 0 E8, 0 stores, 1 .data read).
   0xaef775 = the gs-failure terminal. Family-typed HOST
   (infrastructure, inbound ~889 whole-.text sites — not a PGD
   decision), but the stub law is PINNED.
   checksum 0x683580 is NOT pure (SEH prologue + cookie + vtbl
   stream calls [edi+0x4]/[edi+0xc]/[edi+0x14] + 1 E8 0xa648b0).
   Region law (v8/v12 header text): the save checksum covers the
   file byte range [0x10, size-4); mode 1 = reflected byte fold
   with the NON-standard table (table[1] = 0x09073096, generated
   from reflected poly 0xEDB88320 with sar rounds 2..8; both
   generators 0x00683483/0x006ef201 share the shape; seed
   0xfedcba76; table @0xc7e860). Pins below.
   ============================================================ */

export const PGD_HOST_VA_COOKIE = 0x00aef12b;
export const PGD_COOKIE_GLOBAL_VA = 0x00bf93b4;
export const PGD_COOKIE_FAIL_VA = 0x00aef775;
export const PGD_COOKIE_BODY_BYTES = 8;
export const PGD_CHECKSUM_REGION_SKIP_FRONT = 0x10;
export const PGD_CHECKSUM_REGION_SKIP_BACK = 4;
export const PGD_CHECKSUM_NONSTANDARD_TABLE1 = 0x09073096;

/* `cmp ecx,[0xbf93b4] ; jne 0xaef134` — cookie == global -> ret,
   else the fail terminal. */
export function pgdCookieCheckOk(cookie, cookieGlobal) {
  return asU32(cookie) === asU32(cookieGlobal) ? 1 : 0;
}

export function pgdChecksumRegionSkipFront() {
  return PGD_CHECKSUM_REGION_SKIP_FRONT;
}

export function pgdChecksumRegionSkipBack() {
  return PGD_CHECKSUM_REGION_SKIP_BACK;
}
/* ============================================================
   ABI v24 — PGDITAG + PGDIDISP
   (the PURE decision islands of the shared Rebirth-save snapshot
   reader 0x009e4260; the v8 "next measured candidate"; inbound from
   TryImportRebirthLocalSave 0x92b2e0 @0x92b574 with ecx = the
   0x4f0-byte snapshot; ret 0x9e4aa1, fail-tail ret 0x9e4ac7)
   ============================================================
   PGDITAG = the version-tag comparison table (evidence:
   section-notes/pgd-v24/): a 16-byte stream read (vtbl+0x14
   @0x9e4282, HOST) into [ebp-0x14], then ten .rdata save headers
   compared as THREE FULL DWORDs (0xc bytes) each ("mov eax,[ecx] ;
   cmp eax,[edx] ; jne next" @0x9e4292..0x9e42a1 et seq.) in PE
   order; per-row (header VA, section 2..6, count 7/8/9): all ten
   12-byte bodies are currently "ISAACNGSAVE0" (0x41415349/
   0x53474e43/0x30455641), so row 0 always wins; a full miss falls
   to the fail tail 0x9e4aa2 (host cdecl log (1, 0xb80528, buffer)
   -> 0xa112c0, return 0 @0x9e4ac7).
   PGDIDISP = the section-record loop + the 9-row dispatch outcome
   (0x9e4485..0x9e45e8): entry gates on the PREVIOUS section value
   `test eax,eax ; js 0x9e45f2` + `cmp eax,ebx ; jge 0x9e45f2`
   (SIGNED 0 <= prev < elemCount); count gate `cmp [ebp-0x20],0 ;
   jbe next` (UNSIGNED zero-only); dispatch gate `mov eax,[ebp-0x30]
   ; dec eax ; cmp eax,8 ; ja next` (UNSIGNED (section-1) <= 8 ->
   0..8) through the 9-entry jump table 0x9e4ac8; per-handler:
   record count read (HOST), mismatch log (HOST), UNSIGNED cmova
   clamp to MAX, loop `cmp edi,[ebp-0x20] ; jae skip` (record byte
   count) + `cmp <iter>,[ebp-0x18] ; jb loop` (clamped count);
   byte handlers normalise `cmp byte,0 ; setg al` (SIGNED int8 > 0).
   Row table (index = section-1): 0 sect 1 0x9e44dd +0x38 w1
   0xb3 setg 0xb1ba38; 1 sect 2 0x9e455c +0xec w4 0x5f raw
   0xb1ba60; 2 sect 3 0x9e4635 +0x3c4 w4 0xc raw 0xb1ba60; 3 sect
   4 0x9e46b4 +0x268 w1 0x15b setg 0xb1ba84; 4 sect 5 0x9e4739
   +0x3f4 w1 7 setg 0xb1babc; 5 sect 6 0x9e47b7 +0x3fb w1 0x39
   setg 0xb1babc; 6 sect 7 0x9e4835 +0x434 w1 0x15 setg 0xb1bae4;
   7 sect 8 0x9e48b3 +0x44c w4 0x14 raw 0xb1bb0c; 8 sect 9
   0x9e4932 +0x49c w4 1 raw 0xb1bb34. The clamp MAXes equal the v6
   PGDCOV written byte counts 1:1 and the store offsets are the v6
   snapshot restore sources. The v1/v2 isaac_pgd_reader_* laws
   (0x00927c8a reader, 11 dispatch entries, boundary <= 0xa) are a
   DIFFERENT reader — do NOT conflate. */

export const PGDITAG_HEADERS = 10;
export const PGDITAG_TAG_BYTES = 0xc;
export const PGDITAG_TAG_DWORDS = 3;
export const PGDITAG_READ_BYTES = 0x10;
export const PGDITAG_READ_CALL_VA = 0x009e4282;
export const PGDITAG_FIRST_CMP_VA = 0x009e4294;
export const PGDITAG_HEADER_VAS = [
  0x00b805bc, 0x00b8060c, 0x00b805a8, 0x00b805f8, 0x00b805e4,
  0x00b80514, 0x00b805d0, 0x00b80500, 0x00b1b98c, 0x00b80560,
];
export const PGDITAG_SECTIONS = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
export const PGDITAG_COUNTS = [7, 7, 8, 8, 8, 8, 9, 9, 9, 9];
/* All ten rows currently hold the same 12 bytes ("ISAACNGSAVE0"). */
export const PGDITAG_DWORDS = [
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
  [0x41415349, 0x53474e43, 0x30455641],
];
export const PGDITAG_FAIL_LOG_VA = 0x00b80528;
export const PGDITAG_FAIL_TAIL_VA = 0x009e4aa2;

export const PGDIDISP_TABLE_VA = 0x009e4ac8;
export const PGDIDISP_ENTRIES = 9;
export const PGDIDISP_GATE_CMP_VA = 0x009e44cd;
export const PGDIDISP_GATE_JA_VA = 0x009e44d0;
export const PGDIDISP_ENTRY_JS_VA = 0x009e448a;
export const PGDIDISP_ENTRY_JGE_VA = 0x009e4492;
export const PGDIDISP_COUNT_CMP_VA = 0x009e44bf;
export const PGDIDISP_COUNT_JBE_VA = 0x009e44c3;
export const PGDIDISP_LOOP_JAE_VA = 0x009e4530;
export const PGDIDISP_LOOP_JB_VA = 0x009e4555;
export const PGDIDISP_NEXT_VTBL_CALL_VA = 0x009e45e8;
export const PGDIDISP_NEXT_JE_VA = 0x009e45ec;
export const PGDIDISP_SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const PGDIDISP_TARGET_VAS = [
  0x009e44dd, 0x009e455c, 0x009e4635, 0x009e46b4, 0x009e4739,
  0x009e47b7, 0x009e4835, 0x009e48b3, 0x009e4932,
];
export const PGDIDISP_STORE_OFFS = [
  0x38, 0xec, 0x3c4, 0x268, 0x3f4, 0x3fb, 0x434, 0x44c, 0x49c,
];
export const PGDIDISP_WIDTHS = [1, 4, 4, 1, 1, 1, 1, 4, 4];
export const PGDIDISP_CLAMP_MAXES = [0xb3, 0x5f, 0xc, 0x15b, 7, 0x39, 0x15, 0x14, 1];
export const PGDIDISP_SETG = [1, 0, 0, 1, 1, 1, 1, 0, 0];
export const PGDIDISP_LOG_VAS = [
  0x00b1ba38, 0x00b1ba60, 0x00b1ba60, 0x00b1ba84, 0x00b1babc,
  0x00b1babc, 0x00b1bae4, 0x00b1bb0c, 0x00b1bb34,
];

export function pgdImportTagHeaderCount() { return PGDITAG_HEADERS; }

export function pgdImportTagHeaderVa(index) {
  const i = asU32(index);
  return i < PGDITAG_HEADERS ? PGDITAG_HEADER_VAS[i] : 0;
}

export function pgdImportTagHeaderSection(index) {
  const i = asU32(index);
  return i < PGDITAG_HEADERS ? PGDITAG_SECTIONS[i] : 0;
}

export function pgdImportTagHeaderCountMax(index) {
  const i = asU32(index);
  return i < PGDITAG_HEADERS ? PGDITAG_COUNTS[i] : 0;
}

export function pgdImportTagHeaderDword(index, part) {
  const i = asU32(index);
  const p = asU32(part);
  if (i >= PGDITAG_HEADERS || p >= PGDITAG_TAG_DWORDS) return 0;
  return PGDITAG_DWORDS[i][p] >>> 0;
}

export function pgdImportTagCompareBytes() { return PGDITAG_TAG_BYTES; }

export function pgdImportTagCompareDwords() { return PGDITAG_TAG_DWORDS; }

export function pgdImportTagReadBytes() { return PGDITAG_READ_BYTES; }

export function pgdImportTagReadCallVa() { return PGDITAG_READ_CALL_VA; }

export function pgdImportTagFirstCmpVa() { return PGDITAG_FIRST_CMP_VA; }

export function pgdImportTagFailLogVa() { return PGDITAG_FAIL_LOG_VA; }

export function pgdImportTagFailTailVa() { return PGDITAG_FAIL_TAIL_VA; }

/* The full-word compare law: three FULL dword cmps (NOT byte-wise,
   NOT first-dword-only). */
export function pgdImportTagCompare(index, d0, d1, d2) {
  const i = asU32(index);
  if (i >= PGDITAG_HEADERS) return 0;
  const row = PGDITAG_DWORDS[i];
  return (row[0] >>> 0) === asU32(d0) &&
         (row[1] >>> 0) === asU32(d1) &&
         (row[2] >>> 0) === asU32(d2) ? 1 : 0;
}

/* First-match in PE order (the ten jne chains); -1 = fail tail. */
export function pgdImportTagFirstMatch(d0, d1, d2) {
  for (let i = 0; i < PGDITAG_HEADERS; ++i) {
    if (pgdImportTagCompare(i, d0, d1, d2) === 1) return i;
  }
  return -1;
}

export function pgdImportTagMatchSection(d0, d1, d2) {
  const m = pgdImportTagFirstMatch(d0, d1, d2);
  return m < 0 ? -1 : PGDITAG_SECTIONS[m];
}

export function pgdImportTagMatchCountMax(d0, d1, d2) {
  const m = pgdImportTagFirstMatch(d0, d1, d2);
  return m < 0 ? -1 : PGDITAG_COUNTS[m];
}

export function pgdImportDispatchTableVa() { return PGDIDISP_TABLE_VA; }

export function pgdImportDispatchEntries() { return PGDIDISP_ENTRIES; }

export function pgdImportDispatchGateCmpVa() { return PGDIDISP_GATE_CMP_VA; }

export function pgdImportDispatchGateJaVa() { return PGDIDISP_GATE_JA_VA; }

export function pgdImportEntryGateJsVa() { return PGDIDISP_ENTRY_JS_VA; }

export function pgdImportEntryGateJgeVa() { return PGDIDISP_ENTRY_JGE_VA; }

export function pgdImportCountGateCmpVa() { return PGDIDISP_COUNT_CMP_VA; }

export function pgdImportCountGateJbeVa() { return PGDIDISP_COUNT_JBE_VA; }

export function pgdImportLoopJaeVa() { return PGDIDISP_LOOP_JAE_VA; }

export function pgdImportLoopJbVa() { return PGDIDISP_LOOP_JB_VA; }

/* The dispatch index law: `dec eax ; cmp eax,8 ; ja next` — UNSIGNED
   (section-1) > 8 skips to the next record; sections 1..9 dispatch
   (index 0..8); section 0 / 10+ / huge -> -1 (next record). */
export function pgdImportDispatchIndex(section) {
  const biased = (asU32(section) - 1) >>> 0;
  return biased <= 8 ? biased : -1;
}

export function pgdImportHandlerCount() { return PGDIDISP_ENTRIES; }

export function pgdImportHandlerSection(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_SECTIONS[i] : 0;
}

export function pgdImportHandlerTargetVa(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_TARGET_VAS[i] : 0;
}

export function pgdImportHandlerStoreOff(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_STORE_OFFS[i] : 0;
}

export function pgdImportHandlerElemWidth(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_WIDTHS[i] : 0;
}

export function pgdImportHandlerClampMax(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_CLAMP_MAXES[i] : 0;
}

export function pgdImportHandlerFlagNormalize(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_SETG[i] : 0;
}

export function pgdImportHandlerLogVa(index) {
  const i = asU32(index);
  return i < PGDIDISP_ENTRIES ? PGDIDISP_LOG_VAS[i] : 0;
}

/* Entry gate: `test eax,eax ; js 0x9e45f2` + `cmp eax,ebx ; jge
   0x9e45f2` — SIGNED 0 <= prev < elemCount; a negative or >=
   elemCount prev FINISHES the whole reader (not merely skipping
   the record). */
export function pgdImportSectionEntryGate(prevSection, elemCount) {
  const p = asI32(prevSection);
  if (p < 0) return 0;
  return p < asI32(elemCount) ? 1 : 0;
}

/* Count gate: `cmp [ebp-0x20],0 ; jbe next` — UNSIGNED: only
   exact 0 skips; 0x80000000 / 0xffffffff pass. */
export function pgdImportSectionCountGate(count) {
  return asU32(count) !== 0 ? 1 : 0;
}

/* Clamp: `mov ecx,MAX ; cmova eax,ecx` — UNSIGNED above. */
export function pgdImportClamp(count, max) {
  const c = asU32(count);
  const m = asU32(max);
  return c > m ? m : c;
}

/* setg normalisation: `cmp byte [..],0 ; setg al` — the element is
   a SIGNED int8; 0x80..0xff (negative) normalise to 0. uint32 arg,
   re-narrowed in the body. */
export function pgdImportByteFlag(raw) {
  const b = (asU32(raw) & 0xff) << 24 >> 24;   /* int8 sign-extend */
  return b > 0 ? 1 : 0;
}

/* Byte-array loop: `cmp edi,[ebp-0x20] ; jae skip` + `cmp
   edi,[ebp-0x18] ; jb loop` — both UNSIGNED, edi += 1/iter;
   writes = min(avail, clamped). */
export function pgdImportByteLoopIterations(avail, clamped) {
  const a = asU32(avail);
  const c = asU32(clamped);
  return a < c ? a : c;
}

/* Dword-array loop: edi advances 4/iter (off = 4*iters mod 2^32),
   `cmp edi,avail ; jae` + `cmp <iter>,clamped ; jb` — both
   UNSIGNED. Closed form (machine exact, O(1)): avail == 0 -> 0;
   avail in 0xfffffffd..0xffffffff (not multiples of 4) -> the avail
   bound never binds -> clamped; else ceil(avail/4) (avail <=
   0xfffffffc, off cannot wrap before the bound); iterations =
   min(clamped, bound). */
export function pgdImportDwordLoopIterations(availBytes, clamped) {
  const avail = asU32(availBytes);
  const cap = asU32(clamped);
  if (avail === 0) return 0;
  const bound = avail > 0xfffffffc
    ? cap
    : (avail + 3) >>> 2;
  return cap < bound ? cap : bound;
}

/* PGDTALLY (v25n, no ABI bump): stage-4 tally decision laws of the
   shared Rebirth-save snapshot reader 0x009e4260 (0x9e4618..0x9e4a8f,
   entered by fall-through after PGDCLMP @0x9e4613; success `mov
   al,1` 0x9e4a8f -> ret 0x9e4aa1; the fail tail 0x9e4aa2 is only
   reachable from the stage-1 tag mismatch). All `jl` gates are
   SIGNED (`cmp eax,imm ; jl`); all byte gates are the `cmp byte,0`
   ZERO/NONZERO test re-narrowed to byte & 0xff. */
export const PGDTALLY_RUN_VA = 0x009e4618;
export const PGDTALLY_SUCCESS_VA = 0x009e4a8f;
export const PGDTALLY_STORE_7D_VA = 0x009e4a78;
export const PGDTALLY_STORE_8C_VA = 0x009e4a88;
export const PGDTALLY_COLL_FLAGS_OFF = 0x268;
export const PGDTALLY_SETT_FLAGS_OFF = 0x38;
export const PGDTALLY_COLL_FIRST_IDX = 1;
export const PGDTALLY_COLL_BOUND = 0x15b;
export const PGDTALLY_COLL_ITERS = 0x15a;
export const PGDTALLY_COLL_SUM_GATE = 0x15a;
export const PGDTALLY_SETT_FIRST_IDX = 1;
export const PGDTALLY_SETT_BOUND = 0xb3;
export const PGDTALLY_SETT_ITERS = 0xb2;
export const PGDTALLY_SETT_SUM_GATE = 0xb1;
export const PGDTALLY_SETT_B_GATE = 0xb1;
export const PGDTALLY_COLL_ALIAS_A = [0x114, 0x14d, 0x14e, 0x14f, 0x11b, 0x14b];
export const PGDTALLY_COLL_ALIAS_B = [0x2b, 0x3d, 0xeb];
export const PGDTALLY_SETT_ALIAS = [0x81, 0x82, 0x83, 0x84, 0x85, 0x9c, 0x52, 0x54, 0xaf];

export function pgdImportTallyRunVa() { return PGDTALLY_RUN_VA; }
export function pgdImportTallySuccessVa() { return PGDTALLY_SUCCESS_VA; }
export function pgdImportTallyStore7dVa() { return PGDTALLY_STORE_7D_VA; }
export function pgdImportTallyStore8cVa() { return PGDTALLY_STORE_8C_VA; }
export function pgdImportTallyCollFlagsOff() { return PGDTALLY_COLL_FLAGS_OFF; }
export function pgdImportTallySettFlagsOff() { return PGDTALLY_SETT_FLAGS_OFF; }
export function pgdImportTallyCollFirstIdx() { return PGDTALLY_COLL_FIRST_IDX; }
export function pgdImportTallyCollBound() { return PGDTALLY_COLL_BOUND; }
export function pgdImportTallyCollIters() { return PGDTALLY_COLL_ITERS; }
export function pgdImportTallySettFirstIdx() { return PGDTALLY_SETT_FIRST_IDX; }
export function pgdImportTallySettBound() { return PGDTALLY_SETT_BOUND; }
export function pgdImportTallySettIters() { return PGDTALLY_SETT_ITERS; }
export function pgdImportTallyCollAliasACount() { return PGDTALLY_COLL_ALIAS_A.length; }
export function pgdImportTallyCollAliasBCount() { return PGDTALLY_COLL_ALIAS_B.length; }
export function pgdImportTallySettAliasCount() { return PGDTALLY_SETT_ALIAS.length; }

export function pgdImportTallyCollAliasA(index) {
  const i = asU32(index);
  return i < PGDTALLY_COLL_ALIAS_A.length ? PGDTALLY_COLL_ALIAS_A[i] : 0;
}
export function pgdImportTallyCollAliasB(index) {
  const i = asU32(index);
  return i < PGDTALLY_COLL_ALIAS_B.length ? PGDTALLY_COLL_ALIAS_B[i] : 0;
}
export function pgdImportTallySettAlias(index) {
  const i = asU32(index);
  return i < PGDTALLY_SETT_ALIAS.length ? PGDTALLY_SETT_ALIAS[i] : 0;
}

/* Collection bucket: NONZERO byte -> set B (2), alias table
   SKIPPED; ZERO byte -> A-aliases -> set A (1), B-aliases -> set B
   (2), else none (0). byte re-narrowed to & 0xff. */
export function pgdImportTallyCollBucket(index, byte) {
  const b = asU8(byte);
  const i = asU32(index);
  if (b !== 0) return 2;
  if (PGDTALLY_COLL_ALIAS_A.includes(i)) return 1;
  if (PGDTALLY_COLL_ALIAS_B.includes(i)) return 2;
  return 0;
}
/* Settings bucket: NONZERO byte -> set B (2), aliases skipped;
   ZERO byte + A-aliases -> set A (1), else none (0). */
export function pgdImportTallySettBucket(index, byte) {
  const b = asU8(byte);
  const i = asU32(index);
  if (b !== 0) return 2;
  if (PGDTALLY_SETT_ALIAS.includes(i)) return 1;
  return 0;
}
/* Collection finish/continue: the 32-bit SUM wraps mod 2^32 and is
   compared SIGNED against the 0x15a gate. 0 = FINISH (success
   return, settings walk never runs), 1 = CONTINUE. */
export function pgdImportTallyCollContinue(setA, setB) {
  const sum = (asU32(setA) + asU32(setB)) | 0;
  return sum < 0x15a ? 0 : 1;
}
/* Settings +0x7d store gate: SIGNED (setA+setB) < 0xb1 skips the
   store; else byte [..+0x7d] = 1. */
export function pgdImportTallySettStore7d(setA, setB) {
  const sum = (asU32(setA) + asU32(setB)) | 0;
  return sum < 0xb1 ? 0 : 1;
}
/* Settings +0x8c store gate: fires only when SIGNED settB >= 0xb1
   (jl skipped) AND the COLLECTION walk's set A == 0 (test edi,edi
   — edi survives into the settings walk). */
export function pgdImportTallySettStore8c(settB, collA) {
  if ((asU32(settB) | 0) < 0xb1) return 0;
  if (asU32(collA) !== 0) return 0;
  return 1;
}

/* Model-only walk composites (the flag arrays cannot cross the Wasm
   ABI; these give the test rows their expected values FROM THE
   MODEL, per the wave-16 contract): the collection walk reads
   flags[i] for i in 1..0x15a (index 0 never scanned; the machine
   reads byte [esi+eax+0x268]); the settings walk reads flags[i]
   for i in 1..0xb2 (byte [esi+eax+0x38]). */
export function pgdImportTallyCollectionCounts(flags) {
  let setA = 0;
  let setB = 0;
  for (let i = 1; i < PGDTALLY_COLL_BOUND; ++i) {
    const b = flags[i] ?? 0;
    const bucket = pgdImportTallyCollBucket(i, b);
    if (bucket === 1) setA += 1;
    else if (bucket === 2) setB += 1;
  }
  return { setA, setB };
}
export function pgdImportTallySettingsCounts(flags) {
  let setA = 0;
  let setB = 0;
  for (let i = 1; i < PGDTALLY_SETT_BOUND; ++i) {
    const b = flags[i] ?? 0;
    const bucket = pgdImportTallySettBucket(i, b);
    if (bucket === 1) setA += 1;
    else if (bucket === 2) setB += 1;
  }
  return { setA, setB };
}
/* Full stage-4 decision composite: collection gate FINISHES -> the
   settings walk never runs and no +0x7d/+0x8c store fires. */
export function pgdImportTallyRun(collectionFlags, settingsFlags) {
  const coll = pgdImportTallyCollectionCounts(collectionFlags);
  const skipSettings = pgdImportTallyCollContinue(coll.setA, coll.setB) === 0 ? 1 : 0;
  if (skipSettings) {
    return { skipSettings, store7d: 0, store8c: 0, collections: coll, settings: { setA: 0, setB: 0 } };
  }
  const sett = pgdImportTallySettingsCounts(settingsFlags);
  return {
    skipSettings,
    store7d: pgdImportTallySettStore7d(sett.setA, sett.setB),
    store8c: pgdImportTallySettStore8c(sett.setB, coll.setA),
    collections: coll,
    settings: sett,
  };
}

/* ===== v25o PGDIMP: TryImportRebirthLocalSave (0x0092b2e0) residual
   pure islands =====
   The importer (exact ZHL; ONE caller 0x00926bd5) owns the 0x4f0 snapshot
   the reader above reads. v6 landed its PGDCOV restore rows + the v6/v7
   remap loops; v10 the snapshot ctor 0x009e3dc0; v24 the reader
   decisions. THIS unit lands the frame's OWN remaining decision
   structure: pre-read setup (path suffix scan + Rebirth path rewrite),
   file-open result gates (null-handle abort, vtbl+0x30 state gate,
   IAT 0xb18920 stream-position sign gate, io counts 1/8), post-import
   stores (changesmade=1, global save-field fence +0x2a378, event
   counter, save-select gate chain, result byte) — all on the SUCCESS
   path. Callees stay HOST (alloc 0x40cf00, string ops 0x40ccd0/
   0x499580, log 0xa112c0, open 0xa24fd0, vtbl stream, IAT calls, io
   0xa52890, clear 0x9262b0, save fns 0x9296c0/0x929b40/0x9292c0/
   0x928ee0/0x9294f0, frees 0xaef15c, cookie 0xaef12b). Evidence:
   section-notes/pgd-wave16o-92b2e0/ (disasm 0x92b2e0..0x92b927,
   ret 4). Byte gates take uint32 and re-narrow (& 0xff) in-body —
   the PE tests LOW BYTES at 0x92b54e/0x92b5b9/0x92b780/0x92b785/
   0x92b7b1 and a FULL DWORD at 0x92b7ac (the obj deref). */

export const PGDIMP_SUFFIX_PATTERN_VA = 0x00b6d0d8;
export const PGDIMP_SUFFIX_PATTERN_BYTES = 0x1c;
export const PGDIMP_SUFFIX_COMPARE_BYTES = 0x18;
export const PGDIMP_SUFFIX_SCAN_STEP = 0xffffffff;
export const PGDIMP_SUFFIX_FIRST_CMP_VA = 0x0092b3e5;
export const PGDIMP_SUFFIX_REPLACE_VA = 0x0092b45f;
export const PGDIMP_SUFFIX_REPLACE_POS_LEN = 0x1c;
export const PGDIMP_REBIRTH_STR_VA = 0x00b7b024;
export const PGDIMP_REBIRTH_STR_LEN = 0x18;
export const PGDIMP_OPEN_GATE_VA = 0x0092b53d;
export const PGDIMP_OPEN_FAIL_VA = 0x0092b7ec;
export const PGDIMP_OPEN_STATE_CALL_VA = 0x0092b54c;
export const PGDIMP_OPEN_STATE_GATE_VA = 0x0092b54e;
export const PGDIMP_STREAM_POS_CALL_VA = 0x0092b555;
export const PGDIMP_STREAM_POS_GATE_VA = 0x0092b55e;
export const PGDIMP_IO_CALL_PRE_VA = 0x0092b569;
export const PGDIMP_IO_CALL_POST_VA = 0x0092b5a9;
export const PGDIMP_PRE_READ_COUNT = 1;
export const PGDIMP_POST_READ_COUNT = 8;
export const PGDIMP_POST_READ_GATE_VA = 0x0092b5b9;
export const PGDIMP_POST_READ_FAIL_VA = 0x0092b7e6;
export const PGDIMP_CHANGESMADE_STORE_VA = 0x0092b752;
export const PGDIMP_CHANGESMADE_STORE_VALUE = 1;
export const PGDIMP_SAVE_SELECT_CMP_VA = 0x0092b780;
export const PGDIMP_SAVE_SELECT_0F8C_CMP_VA = 0x0092b785;
export const PGDIMP_SAVE_SELECT_OBJ_VA = 0x0092b7a3;
export const PGDIMP_SAVE_SELECT_OBJ_CMP_VA = 0x0092b7ac;
export const PGDIMP_SAVE_SELECT_GLOBAL_VA = 0x0092b7b1;
export const PGDIMP_EVENT_COUNTER_CALL_VA = 0x0092b770;
export const PGDIMP_GLOBAL_SAVE_PTR_VA = 0x00c7169c;
export const PGDIMP_GLOBAL_SAVE_FIELD_OFF = 0x2a378;
export const PGDIMP_RETURN1_VA_A = 0x0092b7c7;
export const PGDIMP_RETURN1_VA_B = 0x0092b7dd;

/* The 0x1c-byte suffix at 0xb6d0d8 is "Binding of Isaac Repentance+"
   (28 bytes). The scan compares only its first 0x18 bytes
   ("Binding of Isaac Repenta"): memcmp width 0x18, so the trailing
   "nce+" is never required. */
export function pgdImportSuffixPatternByte(i) {
  const PAT = [0x42, 0x69, 0x6e, 0x64, 0x69, 0x6e, 0x67, 0x20, 0x6f, 0x66, 0x20, 0x49,
               0x73, 0x61, 0x61, 0x63, 0x20, 0x52, 0x65, 0x70, 0x65, 0x6e, 0x74, 0x61,
               0x6e, 0x63, 0x65, 0x2b];
  const idx = asU32(i);
  return idx < PAT.length ? PAT[idx] : 0;
}

export function pgdImportSuffixCompareLen() {
  return PGDIMP_SUFFIX_COMPARE_BYTES;
}

/* Window compare: six FULL-dword compares (0x18 bytes,
   0x92b3f0..0x92b3ff; byte fallback 0x92b405..0x92b421) vs the
   pattern's first 0x18 bytes — exactly a 24-byte memcmp. A 0x1c-wide
   compare would be WRONG (d6 "nce+" is never read). */
export function pgdImportSuffixWindowMatch(d0, d1, d2, d3, d4, d5) {
  const bytes = [asU32(d0), asU32(d1), asU32(d2), asU32(d3), asU32(d4), asU32(d5)];
  const want = [0x646e6942, 0x20676e69, 0x4920666f, 0x63616173, 0x70655220, 0x61746e65];
  for (let k = 0; k < 6; ++k) if (bytes[k] !== want[k]) return 0;
  return 1;
}

/* Scan start: `cmp eax,0x1c ; jb skip` (UNSIGNED, 0x92b3c1) then
   `add eax,-0x1c` — a len < 0x1c path never scans; otherwise the
   first candidate window sits at len-0x1c. 0xffffffff = no scan
   (matches the PE's skip branch). u32 wrap is machine-exact. */
export function pgdImportSuffixScanStart(len) {
  const l = asU32(len);
  return l < 0x1c ? 0xffffffff : (l - 0x1c) >>> 0;
}

/* Scan step: `dec edi` @0x92b444 — BACKWARD, so the LAST (rightmost)
   occurrence wins. */
export function pgdImportSuffixScanStep() {
  return PGDIMP_SUFFIX_SCAN_STEP;
}

export function pgdImportSuffixFirstCmpVa() { return PGDIMP_SUFFIX_FIRST_CMP_VA; }

export function pgdImportSuffixReplaceVa() { return PGDIMP_SUFFIX_REPLACE_VA; }

/* Replace args @0x92b452: `push 0x18 ; push 0xb7b024 ; push 0x1c ;
   push edi` — replace(pos=O, 0x1c bytes, "Binding of Isaac Rebirth",
   0x18) HOST 0x499580. */
export function pgdImportSuffixReplacePosLen() { return PGDIMP_SUFFIX_REPLACE_POS_LEN; }

export function pgdImportRebirthReplacementLen() { return PGDIMP_REBIRTH_STR_LEN; }

/* Result path len: a matched window swaps 0x1c -> 0x18 bytes (net
   -4); a miss leaves the path untouched (the machine's replace-skip
   `je 0x92b464`). A match with len < 0x1c is impossible (the scan
   never runs) -> unchanged. */
export function pgdImportRebirthReplaceLen(len, matched) {
  const l = asU32(len);
  const m = asU32(matched);
  if (l < 0x1c || m === 0) return l;
  return (l - 0x1c + 0x18) >>> 0; /* == l - 4 mod 2^32 */
}

/* Null-handle gate: `test edi,edi ; je 0x92b7ec` @0x92b53d — an open
   failure aborts the whole import (ret 0, no reader call). */
export function pgdImportOpenSucceeded(handle) {
  return asU32(handle) !== 0 ? 1 : 0;
}

export function pgdImportOpenGateVa() { return PGDIMP_OPEN_GATE_VA; }
export function pgdImportOpenFailVa() { return PGDIMP_OPEN_FAIL_VA; }

/* File-io gate (SAME shape in the pre-read 0x92b545 block and the
   post-read 0x92b57f block): state = vtbl+0x30 return (`test al,al ;
   je skip` — LOW BYTE @0x92b54e/0x92b58e), then position = IAT
   0xb18920 return (`test eax,eax ; js skip` — SIGNED full dword
   @0x92b55e/0x92b59e). io 0xa52890 runs only when (state&0xff) != 0
   AND (int32)pos >= 0. The gate only gates the io call — the reader
   is called regardless. */
export function pgdImportOpenStateCallVa() { return PGDIMP_OPEN_STATE_CALL_VA; }
export function pgdImportOpenStateGateVa() { return PGDIMP_OPEN_STATE_GATE_VA; }
export function pgdImportStreamPosCallVa() { return PGDIMP_STREAM_POS_CALL_VA; }
export function pgdImportStreamPosGateVa() { return PGDIMP_STREAM_POS_GATE_VA; }
export function pgdImportFileIoGate(openState, pos) {
  if ((asU32(openState) & 0xff) === 0) return 0;
  return asI32(pos) < 0 ? 0 : 1;
}

/* io count argument: 1 pre-read (`mov edx,1` @0x92b562), 8 post-read
   (`mov edx,8` @0x92b592 — the seed dword row). */
export function pgdImportPreReadCount() { return PGDIMP_PRE_READ_COUNT; }
export function pgdImportPostReadCount() { return PGDIMP_POST_READ_COUNT; }
export function pgdImportPreReadIoCallVa() { return PGDIMP_IO_CALL_PRE_VA; }
export function pgdImportPostReadIoCallVa() { return PGDIMP_IO_CALL_POST_VA; }

/* Post-read gate: the reader 0x9e4260 returns al (`mov byte
   [ebp-0x4f1],al` @0x92b581); `cmp byte [ebp-0x4f1],0 ; je
   0x92b7e6` @0x92b5b9 — LOW BYTE. A zero skips the whole import
   body (Clear + restore + stores) and returns 0. */
export function pgdImportPostReadGate(readerResult) {
  return (asU32(readerResult) & 0xff) !== 0 ? 1 : 0;
}
export function pgdImportPostReadGateVa() { return PGDIMP_POST_READ_GATE_VA; }
export function pgdImportPostReadFailVa() { return PGDIMP_POST_READ_FAIL_VA; }

/* changesmade byte: `mov byte [edi],1` @0x92b752 — unconditional on
   the success path, BEFORE the restore rows. */
export function pgdImportChangesmadeStoreVa() { return PGDIMP_CHANGESMADE_STORE_VA; }
export function pgdImportChangesmadeStoreValue() { return PGDIMP_CHANGESMADE_STORE_VALUE; }

/* Conditional clear `mov byte [edi],0` @0x92b790: gated by `cmp
   byte [edi],0 ; je` (0x92b780) AND `cmp byte [edi+0xf8c],0 ; je`
   (0x92b785) — both LOW BYTE. */
export function pgdImportChangesmadeClearGate(pgd0, f8c) {
  if ((asU32(pgd0) & 0xff) === 0) return 0;
  if ((asU32(f8c) & 0xff) === 0) return 0;
  return 1;
}

/* Save-select: after the two low-byte gates the machine stores
   pgd[0]=0 (@0x92b790), calls 0x9292c0, fetches the object via IAT
   0xb18a1c (HOST), then `cmp dword [eax],0 ; je` (FULL DWORD
   @0x92b7ac) and `cmp byte [esi+0x2a3a4],0 ; je` (LOW BYTE @0x92b7b1).
   Path A (0x928ee0) iff ALL FOUR tests nonzero; path B (0x9294f0)
   otherwise. Both converge on return 1 (0x92b7c7 / 0x92b7dd). */
export function pgdImportSaveSelect(pgd0, f8c, objDeref, global2a3a4) {
  if ((asU32(pgd0) & 0xff) === 0) return 0;
  if ((asU32(f8c) & 0xff) === 0) return 0;
  if (asU32(objDeref) === 0) return 0;
  if ((asU32(global2a3a4) & 0xff) === 0) return 0;
  return 1;
}
export function pgdImportSaveSelectCmpVa() { return PGDIMP_SAVE_SELECT_CMP_VA; }
export function pgdImportSaveSelect0f8cCmpVa() { return PGDIMP_SAVE_SELECT_0F8C_CMP_VA; }
export function pgdImportSaveSelectObjVa() { return PGDIMP_SAVE_SELECT_OBJ_VA; }
export function pgdImportSaveSelectObjCmpVa() { return PGDIMP_SAVE_SELECT_OBJ_CMP_VA; }
export function pgdImportSaveSelectGlobalVa() { return PGDIMP_SAVE_SELECT_GLOBAL_VA; }

/* Event counter (IncreaseEventCounter(0,0) -> 0x929b40) called on the
   success path @0x92b770; the args are the v8 pgdImportTailEventArgs0
   zeros. */
export function pgdImportEventCounterVa() { return PGDIMP_EVENT_COUNTER_CALL_VA; }

/* Global save-field fence: [0xc7169c]+0x2a378 saved to esi @0x92b755,
   zeroed @0x92b75b, restored @0x92b77a — the field is cleared across
   both post-restore calls then exactly restored. */
export function pgdImportGlobalSavePtrVa() { return PGDIMP_GLOBAL_SAVE_PTR_VA; }
export function pgdImportGlobalSaveFieldOff() { return PGDIMP_GLOBAL_SAVE_FIELD_OFF; }
export function pgdImportGlobalSaveCleared(oldVal) { return 0; }
export function pgdImportGlobalSaveRestore(oldVal) { return asU32(oldVal); }

/* Success-path return-1 write sites (both set [ebp-0x4f1]=1). */
export function pgdImportReturn1VaA() { return PGDIMP_RETURN1_VA_A; }
export function pgdImportReturn1VaB() { return PGDIMP_RETURN1_VA_B; }

/* Result byte: `mov al,[ebp-0x4f1]` @0x92b8fe — 1 on every path past
   the post-read gate, 0 when the open failed (0x92b7ec) or the reader
   returned 0 (0x92b7e6). So result = openOk && (reader low byte). */
export function pgdImportResult(openOk, readerResult) {
  if (asU32(openOk) === 0) return 0;
  if ((asU32(readerResult) & 0xff) === 0) return 0;
  return 1;
}
/* ===== v25p PGDROWSEC: the per-section handler-row semantics =====
   (banner v25p; NO ABI bump — the Part-C coordinator merges). v24
   exported the row TABLE getters keyed by dispatch index 0..8;
   v25p composes the SAME rows keyed by SECTION id: the dispatch
   gate `mov eax,[ebp-0x30] ; dec eax ; cmp eax,8 ; ja next`
   @0x9e44c9..0x9e44d0 — UNSIGNED (section-1) <= 8 -> index
   section-1, else NO row (record skipped: no writes/clamp/log) —
   then store offset / elem width / clamp max / setg / log VA /
   target VA keyed by section id. The composed per-row loop law
   closes the byte-loop wrap corners the way v24 closed the dword
   ones: byte rows write min(avail, clamped) elements (edi += 1/iter
   — exact for EVERY u32 pair, no 4k mod-2^32 skip); dword rows use
   the v24 closed form (off = 4*iters mod 2^32). */
export const PGDROWSEC_ROWS = 9;
export const PGDROWSEC_FIRST_SECTION = 1;
export const PGDROWSEC_LAST_SECTION = 9;
export const PGDROWSEC_DISPATCH_BIAS = 8;

export function pgdImportSectionRowIndex(section) {
  const biased = (asU32(section) - 1) >>> 0;
  return biased <= PGDROWSEC_DISPATCH_BIAS ? biased : -1;
}

export function pgdImportSectionStoreOff(section) {
  const r = pgdImportSectionRowIndex(section);
  return r < 0 ? 0 : PGDIDISP_STORE_OFFS[r];
}

export function pgdImportSectionElemWidth(section) {
  const r = pgdImportSectionRowIndex(section);
  return r < 0 ? 0 : PGDIDISP_WIDTHS[r];
}

export function pgdImportSectionClampMax(section) {
  const r = pgdImportSectionRowIndex(section);
  return r < 0 ? 0 : PGDIDISP_CLAMP_MAXES[r];
}

export function pgdImportSectionFlagNormalize(section) {
  const r = pgdImportSectionRowIndex(section);
  return r < 0 ? 0 : PGDIDISP_SETG[r];
}

export function pgdImportSectionLogVa(section) {
  const r = pgdImportSectionRowIndex(section);
  return r < 0 ? 0 : PGDIDISP_LOG_VAS[r];
}

export function pgdImportSectionTargetVa(section) {
  const r = pgdImportSectionRowIndex(section);
  return r < 0 ? 0 : PGDIDISP_TARGET_VAS[r];
}

export function pgdImportSectionLoopIterations(section, avail, count) {
  const r = pgdImportSectionRowIndex(section);
  if (r < 0) return 0;
  const clamped = pgdImportClamp(count, PGDIDISP_CLAMP_MAXES[r]);
  return PGDIDISP_WIDTHS[r] === 1
    ? pgdImportByteLoopIterations(avail, clamped)
    : pgdImportDwordLoopIterations(avail, clamped);
}

/* ===== v26 PGDIVER: the import reader 0x009e4260's version gates +
   fail tail (ABI 25 -> 26 atomic both sides). The snapshot version
   block is the 8 bytes at +0x4a0 (ctor zero-row {0x4a0, 8}); the
   +0x4a0 dword READ fires only for the matched tag rows 4..9
   (sections 4/5/6); the +0x4a4 finish store = 1 is UNCONDITIONAL and
   the overwriting stream read fires only when the tag section >= 6
   (`cmp [ebp-0x2c],6 ; jb` UNSIGNED); the fail tail 0x9e4aa2 logs
   (1, 0xb80528, buf) HOST and returns 0 @0x9e4ac7. ===== */
export const PGDIVER_VERSION_OFF = 0x4a0;
export const PGDIVER_VERSION_BYTES = 8;
export const PGDIVER_VERSION_READ_COUNT = 1;
export const PGDIVER_VERSION_READ_WIDTH = 4;
export const PGDIVER_VERSION_GATE_FIRST_ROW = 4;
export const PGDIVER_VERSION_GATE_FIRST_SECTION = 4;
export const PGDIVER_VERSION_GATE_LAST_SECTION = 6;
export const PGDIVER_FINISH_OFF = 0x4a4;
export const PGDIVER_FINISH_DEFAULT = 1;
export const PGDIVER_FINISH_READ_GATE_SECTION = 6;
export const PGDIVER_FAIL_RET_VA = 0x009e4ac7;
export const PGDIVER_FAIL_LOG_ARGC = 3;

export function pgdImportVersionOff() { return PGDIVER_VERSION_OFF; }
export function pgdImportVersionBytes() { return PGDIVER_VERSION_BYTES; }
export function pgdImportVersionReadCount() { return PGDIVER_VERSION_READ_COUNT; }
export function pgdImportVersionReadWidth() { return PGDIVER_VERSION_READ_WIDTH; }
export function pgdImportVersionGateRow(row) {
  const r = asU32(row);
  return r >= PGDIVER_VERSION_GATE_FIRST_ROW && r < 10 ? 1 : 0;
}
export function pgdImportVersionGateSection(section) {
  const s = asU32(section);
  return s >= PGDIVER_VERSION_GATE_FIRST_SECTION && s <= PGDIVER_VERSION_GATE_LAST_SECTION ? 1 : 0;
}
export function pgdImportVersionFinishOff() { return PGDIVER_FINISH_OFF; }
export function pgdImportVersionFinishDefault() { return PGDIVER_FINISH_DEFAULT; }
export function pgdImportFinishGate(section) {
  return asU32(section) >= PGDIVER_FINISH_READ_GATE_SECTION ? 1 : 0;
}
export function pgdImportTagFailRetVa() { return PGDIVER_FAIL_RET_VA; }
export function pgdImportTagFailLogArgc() { return PGDIVER_FAIL_LOG_ARGC; }
export function pgdImportTagFailReturnsZero() { return 0; }

/* ===== v26 PGDREADER2: the SIBLING save reader 0x0041d670 — full
   pure surface (own tag table / size gate / version reads / record
   loop / 10-row dispatch + per-section rows / tails). Caller
   0x92ba01: `push esi ; lea ecx,[ebp-0x700] ; call 0x41d670` (esi =
   stream, ecx = 0x700-byte snapshot; ret 4; al=1 @0x41d928 -> ret
   0x41d93a; al=0 via fail tail 0x41dd64 -> ret 0x41dd76). The
   0x683580 checksum helper, vtbl stream calls + polls, the 12 cdecl
   logs and the cookie stay HOST. ===== */
export const PGD2_READER_VA = 0x0041d670;
export const PGD2_SUCCESS_VA = 0x0041d928;
export const PGD2_RET_OK_VA = 0x0041d93a;
export const PGD2_FAIL_TAIL_VA = 0x0041dd64;
export const PGD2_FAIL_RET_VA = 0x0041dd76;
export const PGD2_RETURN_STACK_BYTES = 4;
export const PGD2_READ_CALL_VA = 0x0041d695;
export const PGD2_FIRST_CMP_VA = 0x0041d6a7;
export const PGD2_TAG_READ_BYTES = 0x10;
export const PGD2_TAG_BYTES = 0xc;
export const PGD2_TAG_COMPARE_DWORDS = 3;
export const PGD2_HEADERS = 3;
export const PGD2_TAG_HEADERS = [
  { va: 0x00b1b98c, section: 6, count: 9 },
  { va: 0x00b1b9a0, section: 7, count: 10 },
  { va: 0x00b1b9b4, section: 8, count: 10 },
];
export const PGD2_TAG_DWORD_VALUES = [0x41415349, 0x53474e43, 0x30455641];
export const PGD2_SIZE_GATE_VA = 0x0041d748;
export const PGD2_SIZE_CHECK_SECTION = 8;
export const PGD2_SIZE_JB_VA = 0x0041d74b;
export const PGD2_COUNT_CHECK_CMP_VA = 0x0041d74d;
export const PGD2_COUNT_MISMATCH_LOG_VA = 0x00b1ba00;
export const PGD2_TAG_MISS_VA = 0x0041dd51;
export const PGD2_TAG_MISS_LOG_VA = 0x00b1b9c8;
export const PGD2_VERSION_OFF = 0x6dc;
export const PGD2_VERSION_FINISH_OFF = 0x6e0;
export const PGD2_VERSION_BYTES = 8;
export const PGD2_VERSION_READ_COUNT = 1;
export const PGD2_VERSION_READ_WIDTH = 4;
export const PGD2_DISPATCH_TABLE_VA = 0x0041dd7c;
export const PGD2_DISPATCH_ENTRIES = 10;
export const PGD2_DISPATCH_BIAS = 9;
export const PGD2_DISPATCH_GATE_DEC_VA = 0x0041d7e9;
export const PGD2_DISPATCH_GATE_JA_VA = 0x0041d7ed;
export const PGD2_ENTRY_GATE_JS_VA = 0x0041d7a8;
export const PGD2_ENTRY_GATE_JGE_VA = 0x0041d7b1;
export const PGD2_COUNT_GATE_CMP_VA = 0x0041d7dc;
export const PGD2_COUNT_GATE_JBE_VA = 0x0041d7e0;
export const PGD2_LOOP_JAE_VA = 0x0041d847;
export const PGD2_LOOP_JB_VA = 0x0041d86b;
export const PGD2_NEXT_VTBL_CALL_VA = 0x0041d90c;
export const PGD2_NEXT_JE_VA = 0x0041d910;
export const PGD2_FINISH_READ_CALL_VA = 0x0041d925;

export const PGD2ROW_ROWS = 10;
export const PGD2ROW_FIRST_SECTION = 1;
export const PGD2ROW_LAST_SECTION = 10;
export const PGD2ROW_TARGETS = [
  0x0041d7fa, 0x0041d875, 0x0041d93d, 0x0041d9c3, 0x0041da46,
  0x0041dac2, 0x0041db41, 0x0041dbc1, 0x0041dc43, 0x0041dcc3,
];
export const PGD2ROW_STORE_OFFS = [0x038, 0x150, 0x594, 0x3d8, 0x5c4, 0x5cb, 0x60e, 0x630, 0x688, 0x68c];
export const PGD2ROW_WIDTHS = [1, 4, 4, 1, 1, 1, 1, 4, 4, 1];
export const PGD2ROW_CLAMP_MAXES = [0x115, 0xa2, 0xc, 0x1ba, 7, 0x43, 0x1f, 0x16, 1, 0x4d];
export const PGD2ROW_SETG = [1, 0, 0, 1, 1, 1, 1, 0, 0, 1];
export const PGD2ROW_LOG_VAS = [
  0x00b1ba38, 0x00b1ba60, 0x00b1ba60, 0x00b1ba84, 0x00b1babc,
  0x00b1babc, 0x00b1bae4, 0x00b1bb0c, 0x00b1bb34, 0x00b1bb58,
];

export function pgdSiblingTagCompare(index, d0, d1, d2) {
  const i = asU32(index);
  if (i >= PGD2_HEADERS) return 0;
  return PGD2_TAG_DWORD_VALUES[0] === asU32(d0) &&
         PGD2_TAG_DWORD_VALUES[1] === asU32(d1) &&
         PGD2_TAG_DWORD_VALUES[2] === asU32(d2)
    ? 1 : 0;
}
export function pgdSiblingTagFirstMatch(d0, d1, d2) {
  for (let i = 0; i < PGD2_HEADERS; ++i) {
    if (pgdSiblingTagCompare(i, d0, d1, d2)) return i;
  }
  return -1;
}
export function pgdSiblingTagMatchSection(d0, d1, d2) {
  const m = pgdSiblingTagFirstMatch(d0, d1, d2);
  return m < 0 ? 0 : PGD2_TAG_HEADERS[m].section;
}
export function pgdSiblingTagMatchCount(d0, d1, d2) {
  const m = pgdSiblingTagFirstMatch(d0, d1, d2);
  return m < 0 ? 0 : PGD2_TAG_HEADERS[m].count;
}
export function pgdSiblingTagHeaderVa(index) {
  const i = asU32(index);
  return i < PGD2_HEADERS ? PGD2_TAG_HEADERS[i].va : 0;
}
export function pgdSiblingTagHeaderSection(index) {
  const i = asU32(index);
  return i < PGD2_HEADERS ? PGD2_TAG_HEADERS[i].section : 0;
}
export function pgdSiblingTagHeaderCount(index) {
  const i = asU32(index);
  return i < PGD2_HEADERS ? PGD2_TAG_HEADERS[i].count : 0;
}
export function pgdSiblingTagCompareBytes() { return PGD2_TAG_BYTES; }
export function pgdSiblingTagCompareDwords() { return PGD2_TAG_COMPARE_DWORDS; }
export function pgdSiblingTagReadBytes() { return PGD2_TAG_READ_BYTES; }

/* Size/checksum gate 0x41d748: `cmp edi,8 ; jb skip` UNSIGNED —
   only section 8 is checked, against the HOST 0x683580 checksum;
   `cmp [ebp-0x38],ebx ; je` ok; mismatch -> log (1, 0xb1ba00) +
   FAIL (ret 0). Returns 1 = FAIL. */
export function pgdSiblingSizeGate(section, fileCount, checksum) {
  if (asU32(section) < PGD2_SIZE_CHECK_SECTION) return 0;
  return asU32(fileCount) === asU32(checksum) ? 0 : 1;
}
export function pgdSiblingCountCheckVa() { return PGD2_SIZE_GATE_VA; }
export function pgdSiblingSizeCheckSection() { return PGD2_SIZE_CHECK_SECTION; }
export function pgdSiblingTagMissVa() { return PGD2_TAG_MISS_VA; }
export function pgdSiblingTagMissLogVa() { return PGD2_TAG_MISS_LOG_VA; }
export function pgdSiblingCountMismatchLogVa() { return PGD2_COUNT_MISMATCH_LOG_VA; }

/* Entry gates `test eax,eax ; js` + `cmp eax,[ebp-0x30] ; jge` —
   SIGNED 0 <= prev < elemCount (9/0xa). 1 = stay in the loop. */
export function pgdSiblingEntryGate(prevSection, elemCount) {
  const p = asI32(prevSection);
  return p >= 0 && p < asI32(elemCount) ? 1 : 0;
}
/* Count gate `cmp [ebp-0x24],0 ; jbe` — UNSIGNED zero-only skip. */
export function pgdSiblingRecordCountGate(count) {
  return asU32(count) === 0 ? 1 : 0;
}
/* Dispatch gate `dec eax ; cmp eax,9 ; ja` — UNSIGNED (s-1) <= 9. */
export function pgdSiblingDispatchIndex(section) {
  const biased = (asU32(section) - 1) >>> 0;
  return biased <= PGD2_DISPATCH_BIAS ? biased : -1;
}
export function pgdSiblingDispatchTableVa() { return PGD2_DISPATCH_TABLE_VA; }
export function pgdSiblingDispatchEntries() { return PGD2_DISPATCH_ENTRIES; }
export function pgdSiblingVersionOff() { return PGD2_VERSION_OFF; }
export function pgdSiblingVersionFinishOff() { return PGD2_VERSION_FINISH_OFF; }
export function pgdSiblingVersionBytes() { return PGD2_VERSION_BYTES; }
export function pgdSiblingVersionReadCount() { return PGD2_VERSION_READ_COUNT; }
export function pgdSiblingVersionReadWidth() { return PGD2_VERSION_READ_WIDTH; }
export function pgdSiblingSuccessVa() { return PGD2_SUCCESS_VA; }
export function pgdSiblingRetOkVa() { return PGD2_RET_OK_VA; }
export function pgdSiblingFailTailVa() { return PGD2_FAIL_TAIL_VA; }
export function pgdSiblingFailRetVa() { return PGD2_FAIL_RET_VA; }
export function pgdSiblingRetStackBytes() { return PGD2_RETURN_STACK_BYTES; }

export function pgdSiblingSectionRowIndex(section) {
  return pgdSiblingDispatchIndex(section);
}
export function pgdSiblingSectionStoreOff(section) {
  const r = pgdSiblingDispatchIndex(section);
  return r < 0 ? 0 : PGD2ROW_STORE_OFFS[r];
}
export function pgdSiblingSectionElemWidth(section) {
  const r = pgdSiblingDispatchIndex(section);
  return r < 0 ? 0 : PGD2ROW_WIDTHS[r];
}
export function pgdSiblingSectionClampMax(section) {
  const r = pgdSiblingDispatchIndex(section);
  return r < 0 ? 0 : PGD2ROW_CLAMP_MAXES[r];
}
export function pgdSiblingSectionFlagNormalize(section) {
  const r = pgdSiblingDispatchIndex(section);
  return r < 0 ? 0 : PGD2ROW_SETG[r];
}
export function pgdSiblingSectionLogVa(section) {
  const r = pgdSiblingDispatchIndex(section);
  return r < 0 ? 0 : PGD2ROW_LOG_VAS[r];
}
export function pgdSiblingSectionTargetVa(section) {
  const r = pgdSiblingDispatchIndex(section);
  return r < 0 ? 0 : PGD2ROW_TARGETS[r];
}
export function pgdSiblingSectionLoopIterations(section, avail, count) {
  const r = pgdSiblingDispatchIndex(section);
  if (r < 0) return 0;
  const clamped = pgdImportClamp(count, PGD2ROW_CLAMP_MAXES[r]);
  return PGD2ROW_WIDTHS[r] === 1
    ? pgdImportByteLoopIterations(avail, clamped)
    : pgdImportDwordLoopIterations(avail, clamped);
}

/* ============================================================
   ABI v29 — PGDISP: the save DISPATCHER 0x00929660 decision
   laws (the LAST un-landed PURE island of the family; evidence:
   section-notes/pgd-v29-final/). Body 0x929660..0x9296bc (ret 4
   @0x9296bc, also ret 4 @0x9296af path-A; BODY_BYTES = 92).
   3 direct E8 (typed-host 0x9292c0 @0x92967e, 0x928ee0
   @0x9296a7, 0x9294f0 @0x9296b4), 1 indirect (import slot
   *0xb18a1c @0x92968e, host input probe with arg 0xc5c3a4, a
   pointer into .data), 1 this-store (`movb $0,(%esi)` @0x929679),
   0 other .data writes. Inbound 2 (CORRECTED tooling:
   census-callers-fixed.py + per-site windows): 0x91a398 and
   0x94c91e (`push 1 ; lea 0x14(ecx),ecx ; call` — arg1 = 1,
   this = game+0x14) — the v28-hostleaf record's "1" missed
   0x94c91e via the buggy lea-4 tool. Kinship: the importer
   inline 0x92b780..0x92b7d2 (v25o pgdImportSaveSelect) is this
   dispatcher minus the arg gate. Byte-gate discipline: uint32
   params, &0xff ONLY where the PE tests a byte (`cmpb $0`).
   ============================================================ */

export const PGDISP_VA = 0x00929660;
export const PGDISP_RET_VA = 0x009296bc;
export const PGDISP_BODY_BYTES = 92;
export const PGDISP_CALL_SITES = 2; /* corrected tooling: 0x91a398 + 0x94c91e */
export const PGDISP_HOST_VA_STAMP_HELPER = 0x009292c0;
export const PGDISP_HOST_VA_SAVE_CLOUD = 0x00928ee0;
export const PGDISP_HOST_VA_SAVE_LOCAL = 0x009294f0;
export const PGDISP_STORE_VA = 0x00929679;
export const PGDISP_STAMP_CALL_VA = 0x0092967e;
export const PGDISP_CLOUD_CALL_VA = 0x009296a7;
export const PGDISP_LOCAL_CALL_VA = 0x009296b4;
export const PGDISP_PROBE_CALL_VA = 0x0092968e;
export const PGDISP_PROBE_SLOT_VA = 0x00b18a1c;
export const PGDISP_PROBE_ARG_VA = 0x00c5c3a4; /* ptr into .data */
export const PGDISP_GLOBAL_VA = 0x00c7169c;
export const PGDISP_CLOUD_OFF = 0x2a3a4;
export const PGDISP_GATE0_CMP_VA = 0x00929667;
export const PGDISP_GATE0F8C_CMP_VA = 0x0092966c;
export const PGDISP_ARG_CMP_VA = 0x00929675;
export const PGDISP_CLOUD_DWORD_CMP_VA = 0x00929697;
export const PGDISP_CLOUD_BYTE_CMP_VA = 0x0092969c;
export const PGDISP_RETURN_STACK = 4;

export function pgdDispVa() { return PGDISP_VA; }
export function pgdDispRetVa() { return PGDISP_RET_VA; }
export function pgdDispBodyBytes() { return PGDISP_BODY_BYTES; }
export function pgdDispCallSiteCount() { return PGDISP_CALL_SITES; }
export function pgdDispHostStampHelperVa() { return PGDISP_HOST_VA_STAMP_HELPER; }
export function pgdDispHostSaveCloudVa() { return PGDISP_HOST_VA_SAVE_CLOUD; }
export function pgdDispHostSaveLocalVa() { return PGDISP_HOST_VA_SAVE_LOCAL; }
export function pgdDispStoreVa() { return PGDISP_STORE_VA; }
export function pgdDispStampCallVa() { return PGDISP_STAMP_CALL_VA; }
export function pgdDispCloudCallVa() { return PGDISP_CLOUD_CALL_VA; }
export function pgdDispLocalCallVa() { return PGDISP_LOCAL_CALL_VA; }
export function pgdDispProbeCallVa() { return PGDISP_PROBE_CALL_VA; }
export function pgdDispProbeSlotVa() { return PGDISP_PROBE_SLOT_VA; }
export function pgdDispProbeArgVa() { return PGDISP_PROBE_ARG_VA; }
export function pgdDispGlobalVa() { return PGDISP_GLOBAL_VA; }
export function pgdDispCloudOff() { return PGDISP_CLOUD_OFF; }
export function pgdDispGate0CmpVa() { return PGDISP_GATE0_CMP_VA; }
export function pgdDispGate0F8cCmpVa() { return PGDISP_GATE0F8C_CMP_VA; }
export function pgdDispArgCmpVa() { return PGDISP_ARG_CMP_VA; }
export function pgdDispCloudDwordCmpVa() { return PGDISP_CLOUD_DWORD_CMP_VA; }
export function pgdDispCloudByteCmpVa() { return PGDISP_CLOUD_BYTE_CMP_VA; }
export function pgdDispReturnStack() { return PGDISP_RETURN_STACK; }

/* `cmpb $0,(%esi) @0x929667 ; je early` + `cmpb $0,0xf8c(%esi)
   @0x92966c ; je early` — both BYTE gates must be nonzero. */
export function pgdDispProceed(this0, thisF8c) {
  return asU8(this0) !== 0 && asU8(thisF8c) !== 0 ? 1 : 0;
}

/* `movb $0,(%esi)` @0x929679 — unconditional after both gates. */
export function pgdDispStoreClearFires(this0, thisF8c) {
  return pgdDispProceed(this0, thisF8c);
}

/* `cmpb $0,0x8(%ebp) @0x929675 ; je skip` — arg BYTE gates the
   0x9292c0 stamp-helper call. Fires iff proceed AND arg != 0. */
export function pgdDispStampCallFires(this0, thisF8c, arg1) {
  return pgdDispProceed(this0, thisF8c) !== 0 && asU8(arg1) !== 0
    ? 1 : 0;
}

/* `cmpl $0,(%eax)` FULL DWORD @0x929697 (probe result from the
   import-slot call) AND `cmpb $0,0x2a3a4(%edi)` BYTE @0x92969c
   (this unit's game-global cloud gate, shared with v25o save_select)
   -> 0x928ee0 @0x9296a7, else 0x9294f0 @0x9296b4. */
export function pgdDispCloudSelected(probeDword, global2a3a4) {
  return asU32(probeDword) !== 0 && asU8(global2a3a4) !== 0 ? 1 : 0;
}

/* ============================================================
   ABI v34 — PGDCPY: the PersistentGameData COPY-ASSIGN 0x00929010.
   Independently transcribed from the PE decode (section-notes/
   pgd-v34-frontier/); NOT derived from the C++ — a shared slip
   diverges. Row kinds: 0 rep movsd, 1 movsw, 2 movsb, 3 movups,
   4 movq, 5 dword, 6 word, 7 byte, 8 vector-callee copy.
   ============================================================ */

export const PGD_CPY_VA = 0x00929010;
export const PGD_CPY_RET_VA = 0x0092922e;
export const PGD_CPY_BODY_BYTES = 0x220;
export const PGD_CPY_INBOUND = 2;
export const PGD_CPY_RETURN_STACK = 4;
export const PGD_CPY_RETURNS_THIS = 1;
export const PGD_CPY_DIRTY_OFF = 0x00;
export const PGD_CPY_HANDLE_OFF = 0x04;
export const PGD_CPY_HANDLE_CLEAR_VA = 0x00929225;
export const PGD_CPY_STRING_A_OFF = 0x08;
export const PGD_CPY_STRING_B_OFF = 0x20;
export const PGD_CPY_STRING_SIZE_OFF = 0x10;
export const PGD_CPY_STRING_CAP_OFF = 0x14;
export const PGD_CPY_STRING_HEAP_THRESHOLD = 0x10;
export const PGD_CPY_STRING_INLINE_CAP = 0xf;
export const PGD_CPY_SELF_GUARD_CMP_VAS = [0x00929021, 0x00929040];
export const PGD_CPY_SELF_GUARD_JE_VAS = [0x00929023, 0x00929042];
export const PGD_CPY_ASSIGN_CALL_VAS = [0x00929032, 0x00929051];
export const PGD_CPY_ASSIGN_CALLEE_VA = 0x0040ccd0;
export const PGD_CPY_DEFERRED_COUNT_SITE_VA = 0x0092908e;
export const PGD_CPY_DEFERRED_COUNT = 0x1a;
export const PGD_CPY_VECTOR_CALLEE_VA = 0x0092cb30;
export const PGD_CPY_VECTOR_SITES = 4;
export const PGD_CPY_VECTOR_DST_OFF_0 = 0xf64;
export const PGD_CPY_VECTOR_STRIDE = 8;
export const PGD_CPY_TAIL_ROWS = [
  { off: 0xf84, bytes: 4 },
  { off: 0xf88, bytes: 4 },
  { off: 0xf8c, bytes: 1 },
];
export const PGD_CPY_STALE_GAPS = [
  { off: 0x2ba, bytes: 2 },
  { off: 0xdc5, bytes: 3 },
  { off: 0xe9d, bytes: 3 },
];
export const PGD_CPY_KIND_REP_MOVSD = 0;
export const PGD_CPY_KIND_MOVSW = 1;
export const PGD_CPY_KIND_MOVSB = 2;
export const PGD_CPY_KIND_MOVUPS = 3;
export const PGD_CPY_KIND_MOVQ = 4;
export const PGD_CPY_KIND_DWORD = 5;
export const PGD_CPY_KIND_WORD = 6;
export const PGD_CPY_KIND_BYTE = 7;
export const PGD_CPY_KIND_VECTOR = 8;
/* Machine order; site = the store/call instruction VA. r19/r20 record
   STORE order (f10 before f0c). r12's ecx=0x1a is loaded at
   0x0092908e — BEFORE rows 5..11 execute (deferred count). */
export const PGD_CPY_ROWS_TABLE = [
  { site: 0x00929064, kind: 0, off: 0x038, bytes: 640 },
  { site: 0x0092906b, kind: 1, off: 0x2b8, bytes: 2 },
  { site: 0x00929079, kind: 0, off: 0x2bc, bytes: 2092 },
  { site: 0x0092908c, kind: 0, off: 0xae8, bytes: 732 },
  { site: 0x00929093, kind: 2, off: 0xdc4, bytes: 1 },
  { site: 0x009290a7, kind: 3, off: 0xdc8, bytes: 16 },
  { site: 0x009290b5, kind: 3, off: 0xdd8, bytes: 16 },
  { site: 0x009290c3, kind: 3, off: 0xde8, bytes: 16 },
  { site: 0x009290d2, kind: 4, off: 0xdf8, bytes: 8 },
  { site: 0x009290e0, kind: 5, off: 0xe00, bytes: 4 },
  { site: 0x009290ed, kind: 6, off: 0xe04, bytes: 2 },
  { site: 0x009290fb, kind: 7, off: 0xe06, bytes: 1 },
  { site: 0x00929101, kind: 0, off: 0xe07, bytes: 104 },
  { site: 0x0092911b, kind: 3, off: 0xe6f, bytes: 16 },
  { site: 0x00929129, kind: 3, off: 0xe7f, bytes: 16 },
  { site: 0x00929138, kind: 4, off: 0xe8f, bytes: 8 },
  { site: 0x00929146, kind: 5, off: 0xe97, bytes: 4 },
  { site: 0x00929153, kind: 6, off: 0xe9b, bytes: 2 },
  { site: 0x0092915a, kind: 0, off: 0xea0, bytes: 108 },
  { site: 0x0092916e, kind: 5, off: 0xf10, bytes: 4 },
  { site: 0x0092917a, kind: 5, off: 0xf0c, bytes: 4 },
  { site: 0x00929188, kind: 3, off: 0xf14, bytes: 16 },
  { site: 0x00929196, kind: 3, off: 0xf24, bytes: 16 },
  { site: 0x009291a4, kind: 3, off: 0xf34, bytes: 16 },
  { site: 0x009291b2, kind: 3, off: 0xf44, bytes: 16 },
  { site: 0x009291c0, kind: 3, off: 0xf54, bytes: 16 },
  { site: 0x009291c7, kind: 8, off: 0xf64, bytes: 8 },
  { site: 0x009291d6, kind: 8, off: 0xf6c, bytes: 8 },
  { site: 0x009291e5, kind: 8, off: 0xf74, bytes: 8 },
  { site: 0x009291f4, kind: 8, off: 0xf7c, bytes: 8 },
  { site: 0x00929202, kind: 5, off: 0xf84, bytes: 4 },
  { site: 0x0092920e, kind: 5, off: 0xf88, bytes: 4 },
  { site: 0x0092921c, kind: 7, off: 0xf8c, bytes: 1 },
];
export const PGD_CPY_ROWS = PGD_CPY_ROWS_TABLE.length; /* 33 */
export const PGD_CPY_CALL_SITE_VAS = [0x0092621a, 0x0090c258];
export const PGD_CPY_BULK_COVERED_BYTES = PGD_CPY_ROWS_TABLE
  .slice(0, 26)
  .reduce((acc, row) => acc + row.bytes, 0); /* 3876 */

export function pgdCpyVa() {
  return PGD_CPY_VA;
}
export function pgdCpyRetVa() {
  return PGD_CPY_RET_VA;
}
export function pgdCpyBodyBytes() {
  return PGD_CPY_BODY_BYTES;
}
export function pgdCpyInbound() {
  return PGD_CPY_INBOUND;
}
export function pgdCpyReturnStack() {
  return PGD_CPY_RETURN_STACK;
}
export function pgdCpyRow(index) {
  if (!Number.isInteger(index) || index < 0 || index >= PGD_CPY_ROWS) {
    return null;
  }
  return PGD_CPY_ROWS_TABLE[index];
}
export function pgdCpyRowCount() {
  return PGD_CPY_ROWS;
}
export function pgdCpyRowSiteVa(index) {
  const row = pgdCpyRow(index);
  return row ? row.site : 0;
}
export function pgdCpyRowKind(index) {
  const row = pgdCpyRow(index);
  return row ? row.kind : -1;
}
export function pgdCpyRowOff(index) {
  const row = pgdCpyRow(index);
  return row ? row.off : -1;
}
export function pgdCpyRowBytes(index) {
  const row = pgdCpyRow(index);
  return row ? row.bytes : -1;
}
/* Which row (if any) copies byte `offset`; -1 = stale/handled else. */
export function pgdCpyRowCovers(offset) {
  for (let i = 0; i < PGD_CPY_ROWS; ++i) {
    const row = PGD_CPY_ROWS_TABLE[i];
    if (offset >= row.off && offset < row.off + row.bytes) return i;
  }
  return -1;
}
export function pgdCpyStaleGapCount() {
  return PGD_CPY_STALE_GAPS.length;
}
export function pgdCpyStaleGapOff(index) {
  return PGD_CPY_STALE_GAPS[index] ? PGD_CPY_STALE_GAPS[index].off : -1;
}
export function pgdCpyStaleGapBytes(index) {
  return PGD_CPY_STALE_GAPS[index] ? PGD_CPY_STALE_GAPS[index].bytes : -1;
}
/* The guarded string assign fires iff dst != src for that member. */
export function pgdCpyStringAssignFires(selfEqual) {
  return selfEqual === 0 ? 1 : 0;
}
/* cap >= 0x10 UNSIGNED -> heap data ptr, else the SSO buffer. */
export function pgdCpyStringDataSelect(capDword, inlinePtr, heapPtr) {
  return capDword >>> 0 >= PGD_CPY_STRING_HEAP_THRESHOLD ? heapPtr : inlinePtr;
}
export function pgdCpyVectorDstOff(index) {
  if (!Number.isInteger(index) || index < 0 || index >= PGD_CPY_VECTOR_SITES) {
    return -1;
  }
  return PGD_CPY_VECTOR_DST_OFF_0 + index * PGD_CPY_VECTOR_STRIDE;
}
export function pgdCpyPlanTotals() {
  const bulk = PGD_CPY_BULK_COVERED_BYTES;
  const stale = PGD_CPY_STALE_GAPS.reduce((acc, gap) => acc + gap.bytes, 0);
  const vectorBytes = PGD_CPY_VECTOR_SITES * PGD_CPY_VECTOR_STRIDE;
  const tailBytes = PGD_CPY_TAIL_ROWS.reduce((acc, tail) => acc + tail.bytes, 0);
  return { rows: PGD_CPY_ROWS, bulk, stale, vectorBytes, tailBytes };
}

/* =====================================================================
   ABI v35 — PGDCON: out-of-cluster consumer census over the five
   v1-unidentified arrays. Evidence: section-notes/pgd-v35/ (census +
   provenance JSON, per-site cpu dumps). Method: whole-.text linear
   decode (resync-per-byte, same discipline as dump-pe-span.py), every
   memory operand whose displacement equals a raw array base
   (+0xdc8/+0xe00/+0xea0/+0xf0c/+0xf14) or the Manager-folded form
   (+0x14+base: 0xddc/0xe14/0xeb4/0xf20/0xf28); every hit outside the
   known cluster then pointer-traced. Authentication fingerprint
   (all five sites share it): base = [PGD_UNLOCKED_MODE_GLOBAL_VA]
   (+ optional add 0x14), readonly byte test at [mgr+0x15] (= pgd+1),
   dirty store [mgr+0x14] (= pgd+0), log callee 0xa112c0 and/or
   TryUnlock 0x929a20 / SaveLocally PGD_HOST_VA_SAVE_LOCAL.
   Everything else with those displacements is a DIFFERENT class's
   field (floats at +0xea0/+0xf20 in entity/menu objects, string
   members at +0xdcc, ending counters inside the Manager itself) —
   recorded as collisions, NOT consumers.

   NO RENAMES. None of the new consumers carries an exact ZHL
   signature, so the FIELD_IDENTIFICATION rows stay LAYOUT_ONLY; what
   v35 promotes is BEHAVIOUR the instruction stream proves, exactly as
   v2 did for the mutator islands.
   ===================================================================== */

/* The embedded PersistentGameData sits at this displacement in the
   Manager singleton [0xc7169c] (ZHL Manager.zhl `_persistentGameData :
   0x14`; machine-proved by 0x007fd762 `add esi,0x14` feeding pgd-relative
   accesses AND by every folded-disp site below). */
export const PGD_MGR_PGD_DISP = 0x14;
/* [mgr+0x15] = pgd+1 = readonly, [mgr+0x14] = pgd+0 = changesmade —
   the folded forms of the two law bytes every consumer tests/sets. */
export const PGD_READONLY_MGR_DISP = 0x15;
export const PGD_DIRTY_MGR_DISP = 0x14;

/* ---------- PGDSEC3CON: Update-loop sec3 increment + unlock rows ----------
   Function 0x007fb250 (EXACT ZHL "void Update()"). At 0x007fd75c it loads
   the Manager, folds +0x14, tests readonly, increments the indexed sec3
   dword, sets dirty unconditionally, then walks three threshold rows and
   three index rows calling TryUnlock 0x929a20. */
export const PGD_SEC3CON_FN_VA = 0x007fb250;
export const PGD_SEC3CON_MGR_LOAD_VA = 0x007fd75c;
export const PGD_SEC3CON_ADD_DISP_VA = 0x007fd762;
export const PGD_SEC3CON_READONLY_CMP_VA = 0x007fd765;
export const PGD_SEC3CON_READONLY_JNE_VA = 0x007fd769;
export const PGD_SEC3CON_INC_VA = 0x007fd76b;
export const PGD_SEC3CON_INC_FOLDED_DISP = 0xdc8;
export const PGD_SEC3CON_DIRTY_STORE_VA = 0x007fd779;
export const PGD_SEC3CON_THRESHOLD_ROWS = Object.freeze([
  { cmpVa: 0x007fd772, slotOff: 0xdd0, slot: 2, threshold: 0x28,
    pushVa: 0x007fd77e, callVa: 0x007fd782, unlockId: 0x10 },
  { cmpVa: 0x007fd787, slotOff: 0xdd8, slot: 4, threshold: 0x1e,
    pushVa: 0x007fd790, callVa: 0x007fd794, unlockId: 0x11 },
  { cmpVa: 0x007fd799, slotOff: 0xde0, slot: 6, threshold: 0x14,
    pushVa: 0x007fd7a2, callVa: 0x007fd7a6, unlockId: 0x12 },
]);
export const PGD_SEC3CON_IDX_UNLOCK_ROWS = Object.freeze([
  { idxCmpVa: 0x007fd7ae, idxValue: 2, pushVa: 0x007fd7b3, unlockId: 0xd },
  { idxCmpVa: 0x007fd7b7, idxValue: 4, pushVa: 0x007fd7bc, unlockId: 0xe },
  { idxCmpVa: 0x007fd7c0, idxValue: 0xb, pushVa: 0x007fd7c5, unlockId: 0x9b },
]);
/* Index-row tail reloads ecx=[mgr]; lea ecx,[ecx+0x14]; call TryUnlock. */
export const PGD_SEC3CON_IDX_TAIL_LEA_VA = 0x007fd7d0;
export const PGD_SEC3CON_IDX_TAIL_CALL_VA = 0x007fd7d3;

/** Low-byte zero law on the guard byte (same convention as PGDRO). */
export function pgdSec3ConIncFires(readonlyByte) {
  return pgdRoEffectiveValue(readonlyByte) === 0 ? 1 : 0;
}

/**
 * Threshold rows read memory AFTER the increment. `values` is
 * {2:v2, 4:v4, 6:v6} PRE-increment dwords; `incremented` applies +1.
 * The branch is `jb` (unsigned below) -> fires iff post >= threshold
 * UNSIGNED. Returns fired achievement ids in PE order.
 */
export function pgdSec3ConThresholdUnlocks(values, incremented) {
  const out = [];
  for (const row of PGD_SEC3CON_THRESHOLD_ROWS) {
    let v = asU32(values[row.slot]);
    if (incremented) v = asU32(v + 1);
    if (v >= row.threshold) out.push(row.unlockId);
  }
  return out;
}

/**
 * DEFECT PINNED AT v35: `jne 0x7fd7ab` jumps PAST inc+thresholds but INTO
 * the index-row block, so the index-mapped unlocks (0xd/0xe/0x9b) fire
 * even when readonly blocks the increment itself.
 */
export function pgdSec3ConIdxGatedByReadonly() {
  return 0;
}

export function pgdSec3ConIdxUnlockId(idx) {
  const i = asI32(idx);
  for (const row of PGD_SEC3CON_IDX_UNLOCK_ROWS) {
    if (i === row.idxValue) return row.unlockId;
  }
  return 0;
}

/* ---------- PGDSEC8INC: the whole-.text sec8 increment mutator ----------
   cdecl 0x00958e60 (ret 0xc): bound, ++sec8[id], dirty, id!=1 aggregate
   ++sec8[2] + dirty again, then Manager-side last-event record; the
   out-of-bound arm logs (8, 0xb7ae74, id) via 0xa112c0 and stores nothing.
   Consumer code re-proves COUNT_SEC8: the unsigned bound is 0x1a ==
   PGD_COUNT_SEC8 - 1. */
export const PGD_SEC8INC_FN_VA = 0x00958e60;
export const PGD_SEC8INC_BOUND_CMP_VA = 0x00958e6d;
export const PGD_SEC8INC_BOUND_JA_VA = 0x00958e70;
export const PGD_SEC8INC_BOUND_MAX = 0x1a;
export const PGD_SEC8INC_INC_VA = 0x00958e72;
export const PGD_SEC8INC_FOLDED_DISP = 0xeb4;
export const PGD_SEC8INC_DIRTY_0_VA = 0x00958e79;
export const PGD_SEC8INC_AGG_CMP_VA = 0x00958e7d;
export const PGD_SEC8INC_AGG_JE_VA = 0x00958e80;
export const PGD_SEC8INC_AGG_SLOT = 2;
export const PGD_SEC8INC_AGG_SKIP_ID = 1;
export const PGD_SEC8INC_AGG_FOLDED_DISP = 0xebc;
export const PGD_SEC8INC_DIRTY_1_VA = 0x00958e88;
export const PGD_SEC8INC_WARN_BLOCK_VA = 0x00958eb8;
export const PGD_SEC8INC_WARN_STRING_VA = 0x00b7ae74;
export const PGD_SEC8INC_LOG_CALLEE_VA = 0x00a112c0;
export const PGD_SEC8INC_RETURN_STACK = 0xc;
export const PGD_SEC8INC_CALL_SITES = 3;
export const PGD_SEC8INC_CALL_SITE_VAS = Object.freeze([
  0x0068fcca, 0x006f9a19, 0x008cedbd,
]);
/* Site 0x68fcca duplicates the bound BEFORE the call (`cmp eax,0x1a ; ja`). */
export const PGD_SEC8INC_CALLER_GATE_VA = 0x0068fcba;

export function pgdSec8IncInBound(id) {
  return asU32(id) <= PGD_SEC8INC_BOUND_MAX ? 1 : 0;
}

/** PE outcome triple: self inc, aggregate inc, warn log. */
export function pgdSec8IncOutcome(id) {
  if (!pgdSec8IncInBound(id)) {
    return { incSelf: 0, incAgg: 0, warn: 1 };
  }
  return {
    incSelf: 1,
    incAgg: asI32(id) !== PGD_SEC8INC_AGG_SKIP_ID ? 1 : 0,
    warn: 0,
  };
}

/* Gates that feed the mutator after reading a counter:
   `cmp <sec8[id]>, 0 ; jle skip` -> fire iff SIGNED value > 0. */
export const PGD_SEC8GATE_SITES = Object.freeze([
  { fnVa: 0x008ced40, gateCmpVa: 0x008cedae, gateJleTargetVa: 0x008cedc7,
    mutatorCallVa: 0x008cedbd },
  { fnVa: 0x008cf0e0, gateCmpVa: 0x008cf193, gateJleTargetVa: 0x008cf2c6,
    mutatorCallVa: -1 },
]);

export function pgdSec8GateFires(counterValue) {
  return asI32(counterValue) > 0 ? 1 : 0;
}

/* ---------- PGDSEC10COL: inlined collect clones of the PGDADSED law ----
   Two game-side sites inline the SAME shape as mutator 0x92b230
   (PGDADSED): readonly guard via [mgr+0x15], raw unchecked byte flag
   store 1 into sec10[idx], unconditional slot-0 clear, dirty store,
   cdecl log (1, PGD_SEC10_LOG_ADD_VA, idx). Both then run SaveLocally
   REGARDLESS of the readonly verdict. A third site clears one flag with
   no slot-0 clear, no log. */
export const PGD_SEC10COL_INDEX_PROVIDER_VA = 0x009e9db0;
export const PGD_SEC10COL_SITES = Object.freeze([
  { fnVa: 0x008cddf0, readonlyCmpVa: 0x008cde6d, readonlyJneVa: 0x008cde71,
    storeVa: 0x008cde74, slot0ClearVa: 0x008cde83, dirtyVa: 0x008cde8a,
    logCallVa: 0x008cde8e, saveLocalCallVa: 0x008cde9f },
  { fnVa: 0x0094d040, readonlyCmpVa: 0x0094d09a, readonlyJneVa: 0x0094d0a8,
    readOldVa: 0x0094d09e, storeVa: 0x0094d0ab, slot0ClearVa: 0x0094d0ba,
    dirtyVa: 0x0094d0c1, logCallVa: 0x0094d0c5, saveLocalCallVa: 0x0094d0d6 },
]);
export const PGD_SEC10CLEAR_SITE = Object.freeze({
  fnVa: 0x008f01b0,
  readonlyCmpVa: 0x008f0398,
  readonlyJneVa: 0x008f039c,
  clearVa: 0x008f03a2,
  dirtyVa: 0x008f03aa,
});

export function pgdSec10ColStoreIndex(readonlyByte, idx) {
  if (pgdRoEffectiveValue(readonlyByte) !== 0) return -1;
  return asI32(idx); /* RAW, never masked/bounded — agrees PGDX sec10 */
}
export function pgdSec10ColClearsSlot0() {
  return pgdSec10ResetsSlot0();
}
export function pgdSec10ColDirtyFires(readonlyByte) {
  return pgdRoEffectiveValue(readonlyByte) === 0 ? 1 : 0;
}
export function pgdSec10ColSaveLocalAlwaysRuns() {
  return 1;
}

/* ---------- Census negatives (recorded, not guessed) ----------
   SEC5 (+0xe00) and SEC9 (+0xf0c): ZERO authenticated out-of-cluster
   consumers under either displacement form. Every hit resolved to another
   class's field; the closest near-miss is Game::End 0x006f9770, whose esi
   stays g_Manager (loaded @0x6f97b2/@0x6f9805, never folded), so its
   `inc [esi+0xebc]/[esi+0xf08]/[esi+0xf10]/[esi+0xf14]` are Manager-owned
   ending counters — only its `mov byte [esi+0x14],1` touches pgd (dirty),
   corroborating the embedding without consuming any array. */
export const PGD_SEC5_OUT_OF_CLUSTER_CONSUMERS = 0;
export const PGD_SEC9_OUT_OF_CLUSTER_CONSUMERS = 0;

/** Field-identification verdicts are UNCHANGED at v35: no new exact-ZHL
 *  accessor indexes any of the five arrays, so all five stay LAYOUT_ONLY. */
export function pgdConFieldStatusUnchanged(fieldOffset) {
  return pgdFieldStatus(fieldOffset) === PGD_FIELD_LAYOUT_ONLY ? 1 : 0;
}
